import { getState } from "../entity/hass.js";

/**
 * Adds a specified suffix to a given string if it doesn't already end with the suffix.
 *
 * @param {string} str - The input string to which the suffix might be added.
 * @param {string} suffix - The suffix to be added to the string if it is not already present.
 * @return {string} The resulting string with the suffix added if necessary.
 */
export function suffix(str, suffix) {
  str = clean(str);
  if (str === "") return "";
  return str.endsWith(suffix) ? str : str + suffix;
}

/**
 * Adds a specified prefix to a given string if it doesn't already start with the prefix.
 *
 * @param {string} str - The input string to which the prefix might be added.
 * @param {string} prefix - The prefix to be added to the string if it is not already present.
 * @return {string} The resulting string with the prefix added if necessary.
 */
export function prefix(str, prefix) {
  str = clean(str);
  if (str === "") return "";
  return str.startsWith(prefix) ? str : prefix + str;
}

function clean(str) {
  if (!str) return "";
  str = String(str);
  if (str.trim() === "") return "";
  return str;
}

/**
 * Formats numeric values for display in text templates.
 * - If the value is a number that rounds to an integer when displayed to 2 decimal places, returns the integer as a string
 * - If the value is a number that has decimal places when displayed to 2 decimal places, returns the number formatted to 2 decimal places
 * - For all other values (non-numbers, NaN, Infinity), returns the value unchanged
 *
 * Fixes https://github.com/lsmarsden/bubble-card-modules/issues/9
 *
 * @param {*} value - The value to format
 * @return {*} The formatted value - string for formatted numbers, unchanged value for non-numbers
 */
export function formatNumber(value) {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    return value;
  }

  const roundedToTwo = parseFloat(value.toFixed(2));

  if (Number.isInteger(roundedToTwo)) {
    return String(Math.round(roundedToTwo));
  }

  return roundedToTwo.toFixed(2);
}

/**
 * Renders a text template by replacing placeholders with their corresponding values.
 * Placeholders in the form of `{key}` within the text are replaced with values obtained
 * from the `placeholders` object in the `textTemplate`.
 * Numeric values are automatically formatted using formatNumber().
 *
 * @param {Object} textTemplate - The text template object containing the text and placeholders.
 * @param {string} textTemplate.text - The string containing placeholder keys to be replaced.
 * @param {Object} [textTemplate.placeholders] - An object mapping keys to state identifiers.
 * @return {string} The rendered text with placeholders replaced by their respective values.
 * If the textTemplate object or text is not provided, an empty string is returned.
 */
export function renderTextTemplate(textTemplate) {
  if (!textTemplate || !textTemplate.text) return "";

  const placeholders = textTemplate.placeholders ?? {};
  const data = {};

  for (const key in placeholders) {
    const rawValue = getState(placeholders[key]) ?? "";
    data[key] = formatNumber(rawValue);
  }

  return textTemplate.text.replace(/\{(\w+)}/g, (_, key) => data[key] ?? "");
}
