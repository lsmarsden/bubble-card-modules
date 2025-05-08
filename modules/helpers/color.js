import {getState} from "./hass.js";

/**
 * Processes the given color input and returns a resolved color string.
 *
 * @param {string} color - The input color string that needs processing.
 * @return {string|null} The resolved color in a valid format or null if the input is invalid.
 */
export function processColor(color) {
  let resolvedColor = getState(color);

  if (!resolvedColor) return null;
  if (typeof resolvedColor !== 'string') return null;

  resolvedColor = resolvedColor.trim();
  const validPrefixes = ['#', 'rgb', 'hsl'];

  if (validPrefixes.some((prefix) => resolvedColor.startsWith(prefix))) {
    return resolvedColor;
  }

  return `var(--${resolvedColor}-color)`;
}