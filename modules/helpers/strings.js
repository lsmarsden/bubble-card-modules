import {getState} from "./hass.js";

/**
 * Adds a specified suffix to a given string if it doesn't already end with the suffix.
 *
 * @param {string} str - The input string to which the suffix might be added.
 * @param {string} suffix - The suffix to be added to the string if it is not already present.
 * @return {string} The resulting string with the suffix added if necessary.
 */
export function suffix(str, suffix) {
    str = String(str);
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
    str = String(str);
    return str.startsWith(prefix) ? str : prefix + str;
}

/**
 * Renders a text template by replacing placeholders with their corresponding values.
 * Placeholders in the form of `{key}` within the text are replaced with values obtained
 * from the `placeholders` object in the `textTemplate`.
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
        data[key] = getState(placeholders[key]) ?? '';
    }

    return textTemplate.text.replace(/\{(\w+)}/g, (_, key) => data[key] ?? '');
}