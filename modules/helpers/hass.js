/**
 * Retrieves the state or a specific attribute of an entity from the Home Assistant states object.
 *
 * If the input string matches the pattern `entity_id[attribute]`, it extracts the entity ID and its
 * specified attribute. If no attribute is specified, it retrieves the state of the entity. If the
 * input does not match any known entity or format and `fallbackToRaw` is true, the raw input value
 * is returned instead.
 *
 * For non-string inputs, the function directly returns the input value.
 *
 * @param {string} input - The input to retrieve the state or attribute for. Can be an entity ID,
 *                         an entity ID with an attribute (e.g., `entity_id[attribute]`), or a raw value.
 * @param {boolean} [fallbackToRaw=true] - Determines whether to return the raw input value if the
 *                                         state or entity is not found. Defaults to true.
 * @returns {string|undefined} - The state of the entity, the specified attribute value, the raw input,
 *                               or `undefined` if the entity is not found and `fallbackToRaw` is false.
 */
export const getState = (input, fallbackToRaw = true) => {
    if (typeof input !== 'string') return input;

    // Pattern: entity_id[attribute]
    const match = input.match(/^([A-z0-9_.]+)\[([A-z0-9_]+)]$/);

    let entityId, attribute;

    if (match) {
        [, entityId, attribute] = match;
    } else if (hass.states[input]) {
        entityId = input;
    } else {
        // Not a known entity or format — treat as raw value
        return fallbackToRaw ? input : undefined;

    }
    const stateObj = hass.states[entityId];
    if (!stateObj) return fallbackToRaw ? input : undefined;

    return attribute ? stateObj.attributes[attribute] : stateObj.state;
}