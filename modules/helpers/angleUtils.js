/**
 * Angle Utilities Helper
 * Provides utility functions for angle normalization and offset calculations
 */

/**
 * Normalize an angle to the 0-359 degree range
 * @param {number} angle - The angle in degrees (can be negative or > 360)
 * @returns {number} The normalized angle between 0-359
 */
export function normalizeAngle(angle) {
  return ((angle % 360) + 360) % 360;
}

/**
 * Convert an angle to a path offset
 * @param {number} angle - The angle in degrees (0 = top, 90 = right, etc.)
 * @param {number} pathLength - Total length of the path
 * @param {number} visualOffset - Additional visual offset to apply (default: 0)
 * @returns {number} The calculated offset for the path
 */
export function angleToOffset(angle, pathLength, visualOffset = 0) {
  const normalizedAngle = normalizeAngle(angle);
  const angleOffset = (normalizedAngle / 360) * pathLength;
  return angleOffset + visualOffset;
}

/**
 * Calculate angle offset percentage (0-1 range)
 * @param {number} angle - The angle in degrees
 * @returns {number} The angle as a percentage of a full circle (0-1)
 */
export function angleToPercentage(angle) {
  return normalizeAngle(angle) / 360;
}
