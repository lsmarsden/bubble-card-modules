import {getState} from "./hass.js";

/**
 * Processes the given color input and returns a resolved color string.
 *
 * @param {string} color - The input color string that needs processing.
 * @return {string|null} The resolved color in a valid format or null if the input is invalid.
 */
export function processColor(color) {
  let resolvedColor = getState(color);

  if (!resolvedColor) return 'var(--primary-color)';
  if (typeof resolvedColor !== 'string') return 'var(--primary-color)';

  resolvedColor = resolvedColor.trim();
  const validPrefixes = ['#', 'rgb', 'hsl'];

  if (validPrefixes.some((prefix) => resolvedColor.startsWith(prefix))) {
    return resolvedColor;
  }

  return `var(--${resolvedColor}-color)`;
}

/**
 * Computes an interpolated color based on a progress value and an array of color stops.
 * Each stop in the `stops` array should contain a `percent` property (representing its position on a scale of 0 to 100)
 * and a `color` property (representing the color at that point).
 * Interpolates between the closest lower and upper bounds of the progress value.
 *
 * @param {number} progress The progress value, typically between 0 and 100, for which the color is to be interpolated.
 * @param {Array} stops An array of stop objects. Each object should contain `percent` (a number) and `color` (a string) properties.
 * @return {string} The interpolated color as a CSS color string (or falls back to a default color if no valid stops are provided).
 */
export function getInterpolatedColor(progress, stops) {
  if (!Array.isArray(stops) || stops.length === 0) {
    return 'var(--primary-color)';
  }
  // Sort stops in ascending order by percent
  const sortedStops = stops.slice().sort((a, b) => a.percent - b.percent);

  // Handle out-of-range progress values
  if (progress <= sortedStops[0].percent) {
    return processColor(sortedStops[0].color);
  }
  if (progress >= sortedStops[sortedStops.length - 1].percent) {
    return processColor(sortedStops[sortedStops.length - 1].color);
  }

  // Find the lower and upper bounds
  const lower = [...sortedStops].reverse().find(s => s.percent <= progress);
  const upper = sortedStops.find(s => s.percent >= progress);

  const range = upper.percent - lower.percent;
  const frac = range === 0 ? 0 : (progress - lower.percent) / range;

  if (processColor(lower.color) === processColor(upper.color)) {
    return processColor(lower.color);
  }

  return `color-mix(in srgb, ${processColor(lower.color)} ${(1 - frac) * 100}%, ${processColor(upper.color)} ${frac * 100}%)`;
}