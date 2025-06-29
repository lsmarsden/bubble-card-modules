import { angleToOffset } from "./angleUtils.js";
import { detectElementShape } from "./borderRadiusDetection.js";

/**
 * Get the effective size for an element
 * @param {HTMLElement} element - The element to measure
 * @returns {number} The size (width and height should be equal for icons)
 */
function getEffectiveSize(element) {
  const rect = element.getBoundingClientRect();
  return Math.min(rect.width, rect.height) || 38;
}

/**
 * Calculate the visual "top-center" offset for consistent start positioning
 * @param {boolean} isCircular - Whether the shape is circular
 * @param {number} borderRadius - The border radius in pixels (for non-circular)
 * @param {number} pathLength - Total length of the path
 * @returns {number} The offset to apply
 */
function calculateVisualOffset(isCircular, borderRadius, pathLength) {
  if (isCircular || borderRadius === 0) {
    return isCircular ? 0 : pathLength * -0.125; // Circle: no offset, Square: jump to top-center
  }

  // Rounded rectangle: interpolate between square (-12.5%) and circle (0%)
  const maxRadius = pathLength / 8;
  const ratio = Math.min(borderRadius / maxRadius, 1);
  return pathLength * -0.125 * (1 - ratio);
}

/**
 * Create or update a stroke-dasharray progress border with aligned start points
 * @param {HTMLElement} element - The container element
 * @param {number} progressValue - Progress percentage (0-100)
 * @param {string} progressColor - Color for the progress portion
 * @param {string} remainingColor - Color for the remaining portion
 * @param {number} startAngle - Starting angle in degrees (0 = top, 90 = right, 180/-180 = bottom, -90 = left)
 * @param {Object} options - Additional options
 * @param {number} options.strokeWidth - Width of the progress border (default: 3)
 * @param {number} options.animationDuration - Duration of transitions in ms (default: 800)
 * @param {string|number} options.borderRadiusOverride - Optional border radius override from config
 */
export function createProgressBorder(element, progressValue, progressColor, remainingColor, startAngle, options) {
  const { strokeWidth = 3, animationDuration = 800, borderRadiusOverride } = options;
  progressValue = Math.max(0, Math.min(100, progressValue || 0));

  let svg = element.querySelector(".stroke-dash-aligned-svg");

  if (!svg) {
    const computedStyle = typeof getComputedStyle !== "undefined" ? getComputedStyle(element) : {};
    if (computedStyle.position === "static") {
      element.style.position = "relative";
    }

    svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("class", "stroke-dash-aligned-svg");
    svg.style.cssText = "position:absolute;top:0;left:0;width:100%;height:100%;pointer-events:none";
    element.appendChild(svg);
  }

  const size = getEffectiveSize(element);
  svg.setAttribute("viewBox", `0 0 ${size} ${size}`);

  // Detect shape from border-radius CSS property using helper
  const { isCircular, borderRadius } = detectElementShape(element, size, borderRadiusOverride);

  // Check if SVG needs rebuilding
  const existingPath = svg.querySelector(".progress-path");
  const currentData = `${isCircular}-${borderRadius}-${size}`;
  const storedData = svg.getAttribute("data-config");

  if (!existingPath || currentData !== storedData) {
    // Rebuild SVG
    svg.innerHTML = "";
    svg.setAttribute("data-config", currentData);

    // Create path data
    const radius = (size - strokeWidth) / 2;
    const center = size / 2;
    let pathData;

    if (isCircular) {
      pathData = `M ${center} ${strokeWidth / 2} A ${radius} ${radius} 0 1 1 ${center - 0.01} ${strokeWidth / 2}`;
    } else {
      const r = Math.min(borderRadius, radius);
      const x = strokeWidth / 2;
      const y = strokeWidth / 2;
      const w = size - strokeWidth;

      if (r > 0) {
        pathData = `M ${x + r} ${y} L ${x + w - r} ${y} Q ${x + w} ${y} ${x + w} ${y + r} L ${x + w} ${y + w - r} Q ${x + w} ${y + w} ${x + w - r} ${y + w} L ${x + r} ${y + w} Q ${x} ${y + w} ${x} ${y + w - r} L ${x} ${y + r} Q ${x} ${y} ${x + r} ${y} Z`;
      } else {
        pathData = `M ${x} ${y} L ${x + w} ${y} L ${x + w} ${y + w} L ${x} ${y + w} Z`;
      }
    }

    // Create background and progress paths
    ["bg-path", "progress-path"].forEach((className, index) => {
      const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
      path.setAttribute("class", className);
      path.setAttribute("d", pathData);
      path.setAttribute("stroke", index ? "transparent" : remainingColor); // Start progress path as transparent
      path.setAttribute("stroke-width", strokeWidth);
      path.setAttribute("fill", "none");

      if (index) {
        // progress path
        path.setAttribute("stroke-linecap", "round");
        path.style.transition = `all ${animationDuration}ms ease-out`;
      }

      svg.appendChild(path);
    });

    // Calculate path metrics
    const progressPath = svg.querySelector(".progress-path");
    const pathLength = progressPath.getTotalLength ? progressPath.getTotalLength() : 300; // Fallback for environments without getTotalLength
    const visualOffset = calculateVisualOffset(isCircular, borderRadius, pathLength);

    progressPath.setAttribute("data-length", pathLength);
    progressPath.setAttribute("data-offset", visualOffset);
  }

  // Update progress
  const bgPath = svg.querySelector(".bg-path");
  const progressPath = svg.querySelector(".progress-path");

  bgPath.setAttribute("stroke", remainingColor);

  // Apply progress
  const pathLength = parseFloat(progressPath.getAttribute("data-length"));
  const visualOffset = parseFloat(progressPath.getAttribute("data-offset"));

  const dashLength = (progressValue / 100) * pathLength;
  const totalOffset = angleToOffset(startAngle, pathLength, visualOffset);

  // Check if this is the first time setting a non-zero progress value
  const wasTransparent = progressPath.getAttribute("stroke") === "transparent";
  const isFirstPositiveProgress = wasTransparent && progressValue > 0;

  if (progressValue <= 0) {
    // Make progress invisible when 0 or less - keeps transitions working
    progressPath.setAttribute("stroke", "transparent");
    progressPath.setAttribute("stroke-dasharray", `0 ${pathLength}`);
    progressPath.setAttribute("stroke-dashoffset", "0");
  } else {
    // Show progress path with proper color
    progressPath.setAttribute("stroke", progressColor);
    progressPath.setAttribute("stroke-dashoffset", totalOffset);

    const getDashArray = () => {
      return progressValue >= 100 ? `${pathLength} 0` : `${dashLength} ${pathLength - dashLength}`;
    };

    if (isFirstPositiveProgress) {
      // Start from 0 and animate to target on first appearance
      progressPath.setAttribute("stroke-dasharray", `0 ${pathLength}`);
      progressPath.getBoundingClientRect();
      requestAnimationFrame(() => {
        progressPath.setAttribute("stroke-dasharray", getDashArray());
      });
    } else {
      progressPath.setAttribute("stroke-dasharray", getDashArray());
    }
  }
}

/**
 * Remove the stroke-dasharray aligned progress border from an element
 * @param {HTMLElement} element - The container element
 */
export function removeProgressBorder(element) {
  const svg = element.querySelector(".stroke-dash-aligned-svg");
  if (svg) {
    svg.remove();
  }
}
