/**
 * Border Radius Detection Helper
 * Provides utilities for detecting shape characteristics from CSS border-radius
 */

/**
 * Detect if an element's border-radius would make it circular
 * @param {string} borderRadiusStyle - The border-radius CSS value
 * @param {Object} dimensions - Element dimensions object {width, height}
 * @returns {Object} Detection result with isCircular and borderRadius properties
 */
export function detectShapeFromBorderRadius(borderRadiusStyle, dimensions) {
  const { width, height } = dimensions;
  let borderRadius = 0;

  if (!borderRadiusStyle) {
    return { isCircular: false, borderRadius: 0 };
  }

  // Parse border radius value to pixels
  if (borderRadiusStyle.includes("%")) {
    const percent = parseInt(borderRadiusStyle) || 0;
    // For percentages, calculate actual pixel value
    // 50% of a 40px element = 20px border radius
    borderRadius = (percent / 100) * Math.min(width, height);
  } else {
    // For pixel values, just parse the number
    borderRadius = parseInt(borderRadiusStyle) || 0;
  }
  const isCircular = width === height && borderRadius >= width / 2;

  return { isCircular, borderRadius };
}

/**
 * Get border radius style from an element
 * @param {HTMLElement} element - The element to inspect
 * @returns {string} The border-radius CSS value or empty string
 */
export function getBorderRadiusStyle(element) {
  if (typeof getComputedStyle === "undefined") {
    return "";
  }

  const computedStyle = getComputedStyle(element);
  return computedStyle.borderRadius || "";
}

/**
 * Detect shape characteristics from an element
 * @param {HTMLElement} element - The element to analyze
 * @param {Object} dimensions - Element dimensions object {width, height}
 * @param {string|number} borderRadiusOverride - Optional border radius override from config
 * @returns {Object} Detection result with isCircular and borderRadius properties
 */
export function detectElementShape(element, dimensions, borderRadiusOverride) {
  // Priority: config override > computed CSS > default
  let borderRadiusStyle;

  if (borderRadiusOverride !== undefined && borderRadiusOverride !== null) {
    // Convert number to px string, or use string as-is
    borderRadiusStyle =
      typeof borderRadiusOverride === "number" ? `${borderRadiusOverride}px` : String(borderRadiusOverride);
  } else {
    // Fall back to computed CSS
    borderRadiusStyle = getBorderRadiusStyle(element);
  }

  return detectShapeFromBorderRadius(borderRadiusStyle, dimensions);
}
