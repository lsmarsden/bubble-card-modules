/**
 * Converts the provided object or value to an array.
 * If the input is already an array, it is returned as-is.
 * If the input is an object with all numeric keys (UI editor format), converts to array.
 * If the input is a regular object, it is wrapped in an array.
 *
 * @param {Object|Array} object - The object or array to convert to an array.
 * @return {Array} The resulting array obtained from the input.
 */
export function toArray(object) {
  if (Array.isArray(object)) return object;
  if (!object || typeof object !== "object") return [];
  const keys = Object.keys(object);

  // Empty object - wrap in array
  if (keys.length === 0) return [object];

  // Check if ALL keys are numeric strings (UI editor format)
  const allNumeric = keys.every((key) => /^\d+$/.test(key));

  if (allNumeric) {
    // Convert numbered object to array, sorted by numeric value
    return keys
      .map((key) => parseInt(key))
      .sort((a, b) => a - b)
      .map((index) => object[index.toString()]);
  }
  // Regular object - wrap in array
  return [object];
}
