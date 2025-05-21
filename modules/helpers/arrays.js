/**
 * Converts the provided object or value to an array.
 * If the input is already an array, it is returned as-is.
 * If the input is an object, its values are extracted into an array.
 *
 * @param {Object|Array} object - The object or array to convert to an array.
 * @return {Array} The resulting array obtained from the input.
 */
export function toArray(object) {

    if (Array.isArray(object)) return object;
    if (!object || typeof object !== 'object') return [];

    return Object.values(object);
}