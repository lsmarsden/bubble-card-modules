/**
 * Processes a given color string and returns it in the appropriate format.
 *
 * @param {string} color - The input color string. Can be a hex code, RGB, HSL, or a variable name.
 * @return {string|null} - Returns the processed color in its appropriate format. If the input is invalid or null, returns null.
 */
export function processColor(color) {
  if (!color) return null;
  if (["#", "rgb", "hsl"].some((prefix) => color.startsWith(prefix))) {
    return color;
  }
  return `var(--${color}-color)`;
}