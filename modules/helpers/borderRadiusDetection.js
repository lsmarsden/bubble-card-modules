/**
 * Border Radius Detection Helper
 * Provides utilities for detecting shape characteristics from CSS border-radius
 */

/**
 * Detect if an element's border-radius would make it circular
 * @param {string} borderRadiusStyle - The border-radius CSS value
 * @param {number} elementSize - The size of the element
 * @returns {Object} Detection result with isCircular and borderRadius properties
 */
export function detectShapeFromBorderRadius(borderRadiusStyle, elementSize) {
  const elementRadius = elementSize / 2;
  let borderRadius = 0;
  let isCircular = false;

  if (!borderRadiusStyle) {
    return { isCircular: false, borderRadius: 0 };
  }

  if (borderRadiusStyle.includes("%")) {
    const percent = parseInt(borderRadiusStyle) || 0;
    isCircular = percent >= 50;
  } else if (borderRadiusStyle.includes("50")) {
    // Special case: any border-radius containing "50" is treated as circular
    isCircular = true;
  } else {
    borderRadius = parseInt(borderRadiusStyle) || 0;
    // If border-radius >= element radius, CSS would make it circular
    isCircular = borderRadius >= elementRadius;
  }

  // For circular shapes, we don't need the borderRadius value for path calculation
  if (isCircular) {
    borderRadius = 0;
  }

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
 * @param {number} elementSize - The size of the element
 * @param {string|number} borderRadiusOverride - Optional border radius override from config
 * @returns {Object} Detection result with isCircular and borderRadius properties
 */
export function detectElementShape(element, elementSize, borderRadiusOverride) {
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

  return detectShapeFromBorderRadius(borderRadiusStyle, elementSize);
}
