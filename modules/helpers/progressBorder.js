import { detectElementShape } from "./borderRadiusDetection.js";

/**
 * Get the effective dimensions for an element - NEW API for pill/rectangle support
 * @param {HTMLElement} element - The element to measure
 * @returns {{width: number, height: number}} The actual width and height dimensions
 */
export function getEffectiveDimensions(element) {
  if (!element || !element.getBoundingClientRect) {
    return { width: 38, height: 38 };
  }

  const rect = element.getBoundingClientRect();
  const width = rect.width || 38;
  const height = rect.height || 38;

  return { width, height };
}

/**
 * Create or update a stroke-dasharray progress border with aligned start points
 * @param {HTMLElement} element - The container element
 * @param {number} progressValue - Progress percentage (0-100)
 * @param {string} progressColor - Color for the progress portion
 * @param {string} remainingColor - Color for the remaining portion
 * @param {number} startAngle - Starting angle in degrees (deprecated, kept for compatibility)
 * @param {Object} options - Additional options
 * @param {number} options.strokeWidth - Width of the progress border (default: 3)
 * @param {number} options.animationDuration - Duration of transitions in ms (default: 800)
 * @param {string|number} options.borderRadiusOverride - Optional border radius override from config
 * @param {number} options.offsetPercent - Starting position as percentage along path (0-100, where 0 = top center, default: 0)
 */
export function createProgressBorder(element, progressValue, progressColor, remainingColor, options) {
  const { strokeWidth = 3, animationDuration = 800, borderRadiusOverride, offsetPercent = 0 } = options;
  progressValue = Math.max(0, Math.min(100, progressValue || 0));
  const clampedOffsetPercent = Math.max(0, Math.min(100, offsetPercent));

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

  const dimensions = getEffectiveDimensions(element);
  svg.setAttribute("viewBox", `0 0 ${dimensions.width} ${dimensions.height}`);
  svg.style.width = `${dimensions.width}px`;
  svg.style.height = `${dimensions.height}px`;

  // Detect shape from border-radius CSS property using helper
  const { isCircular, borderRadius } = detectElementShape(element, dimensions, borderRadiusOverride);

  // Check if SVG needs rebuilding
  const existingPath = svg.querySelector(".progress-path");
  const currentData = `${isCircular}-${borderRadius}-${dimensions.width}-${dimensions.height}`;
  const storedData = svg.getAttribute("data-config");

  if (!existingPath || currentData !== storedData) {
    // Rebuild SVG
    svg.innerHTML = "";
    svg.setAttribute("data-config", currentData);

    // Create path data using actual dimensions
    const { width, height } = dimensions;
    let pathData;

    if (isCircular) {
      // For circles, use the smaller dimension as radius - start at top center
      const radius = (Math.min(width, height) - strokeWidth) / 2;
      const centerX = width / 2;
      pathData = `M ${centerX} ${strokeWidth / 2} A ${radius} ${radius} 0 1 1 ${centerX - 0.01} ${strokeWidth / 2}`;
    } else {
      const r = Math.min(borderRadius, (Math.min(width, height) - strokeWidth) / 2);
      const x = strokeWidth / 2;
      const y = strokeWidth / 2;
      const w = width - strokeWidth;
      const h = height - strokeWidth;

      if (r > 0) {
        // Rounded rectangle - start from top center
        const startX = width / 2;
        pathData = `M ${startX} ${y} 
                    L ${x + w - r} ${y} 
                    Q ${x + w} ${y} ${x + w} ${y + r} 
                    L ${x + w} ${y + h - r} 
                    Q ${x + w} ${y + h} ${x + w - r} ${y + h} 
                    L ${x + r} ${y + h} 
                    Q ${x} ${y + h} ${x} ${y + h - r} 
                    L ${x} ${y + r} 
                    Q ${x} ${y} ${x + r} ${y} 
                    L ${startX} ${y}`;
      } else {
        // Sharp rectangle - start from top center
        const startX = width / 2;
        pathData = `M ${startX} ${y} L ${x + w} ${y} L ${x + w} ${y + h} L ${x} ${y + h} L ${x} ${y} Z`;
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

    progressPath.setAttribute("data-length", pathLength);
  }

  // Update progress
  const bgPath = svg.querySelector(".bg-path");
  const progressPath = svg.querySelector(".progress-path");

  bgPath.setAttribute("stroke", remainingColor);

  // Apply progress
  const pathLength = parseFloat(progressPath.getAttribute("data-length"));
  const progressLength = (progressValue / 100) * pathLength;
  const offsetLength = (clampedOffsetPercent / 100) * pathLength;

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
    progressPath.setAttribute("stroke-dashoffset", "0"); // Always 0 with new offset approach

    const getDashArray = () => {
      if (progressValue >= 100) {
        return `${pathLength} 0`;
      } else if (progressLength === 0) {
        return `0 ${pathLength}`;
      } else if (offsetLength + progressLength <= pathLength) {
        // No wrap-around needed
        // Pattern: [transparent offset] [progress] [remaining transparent]
        return `0 ${offsetLength} ${progressLength} ${pathLength - offsetLength - progressLength}`;
      } else {
        // Wrap-around needed
        const endProgress = pathLength - offsetLength;
        const wrapProgress = progressLength - endProgress;
        // Pattern: [wrap progress] [gap] [main progress] [remaining]
        return `${wrapProgress} ${offsetLength - wrapProgress} ${endProgress} 0`;
      }
    };

    if (isFirstPositiveProgress) {
      // Start from 0 and animate to target on first appearance
      progressPath.setAttribute("stroke-dasharray", `0 ${offsetLength} 0 ${pathLength - offsetLength}`);
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
