import {getState} from "./hass.js";

/**
 * Resolves a given color value into a valid CSS color string. If the color cannot be resolved,
 * falls back to a default color or `primary` color if no default is provided.
 *
 * @param {string} color - The input color key or value to be resolved.
 * @param {string} [defaultColor] - The fallback color key if the input color is not resolved.
 * @return {string} A valid CSS color string, either derived from the input or the default fallback.
 */
export function resolveColor(color, defaultColor) {
    let resolvedColor = getState(color);
    if (!resolvedColor) return defaultColor ?? 'var(--primary-color)';
    if (typeof resolvedColor !== 'string') return defaultColor ?? 'var(--primary-color)';

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
 * @param {boolean} interpolate If true, interpolates the color as a proportioned mix of the two surrounding color stops based on the progress.
 * Otherwise, returns the color at the closest lower stop.
 * @return {string} The resolved color as a CSS color string (or falls back to a default color if no valid stops are provided).
 */
export function resolveColorFromStops(progress, stops, interpolate) {
    // handles the situation when HA reformats arrays into objects keyed by numbers.
    if (!Array.isArray(stops) && typeof stops === 'object' && stops !== null) {
        stops = Object.values(stops).sort((a, b) => a.percent - b.percent);
    }
    if (!Array.isArray(stops) || !stops || stops.length === 0) {
        return 'var(--primary-color)';
    }
    // Sort stops in ascending order by percent
    const sortedStops = stops.slice().sort((a, b) => a.percent - b.percent);

    // Handle out-of-range progress values
    if (progress <= sortedStops[0].percent) {
        return resolveColor(sortedStops[0].color);
    }
    if (progress >= sortedStops[sortedStops.length - 1].percent) {
        return resolveColor(sortedStops[sortedStops.length - 1].color);
    }

    // Find the lower and upper bounds
    const lower = [...sortedStops].reverse().find(s => s.percent <= progress);
    const upper = sortedStops.find(s => s.percent >= progress);

    if (!interpolate || resolveColor(lower.color) === resolveColor(upper.color)) {
        return resolveColor(lower.color);
    }

    const range = upper.percent - lower.percent;
    const frac = (progress - lower.percent) / range;
    const format = v => parseFloat(v.toFixed(2));

    return `color-mix(in srgb, ${resolveColor(lower.color)} ${format((1 - frac) * 100)}%, ${resolveColor(upper.color)} ${format(frac * 100)}%)`;
}