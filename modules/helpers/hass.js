/**
 * Retrieves the state or a specific attribute of an entity from the Home Assistant states object.
 *
 * If the input string matches the pattern `entity_id[attribute]`, it extracts the entity ID and its
 * specified attribute. If no attribute is specified, it retrieves the state of the entity. If the
 * input does not match any known entity or format and `fallbackToRaw` is true, the raw input value
 * is returned instead.
 *
 * If the input is an object, the entityId is extracted from either the `entity_id` or `entity` field,
 * and the attribute is extracted from either the `attribute` or the `att` field.
 *
 * **DER Precedence**: If the entity field contains DER syntax (`entity[attribute]`), this ALWAYS
 * takes precedence over any separate attribute field. This ensures consistent behavior regardless
 * of input format and allows UI editors to provide separate entity/attribute fields while maintaining
 * full backward compatibility with DER syntax.
 *
 * For any other inputs, the function directly returns the input value or undefined, depending on the value of `fallbackToRaw`.
 *
 * @param {string|object} input - The input to retrieve the state or attribute for. Can be an entity ID,
 *                         an entity ID with an attribute (e.g., `entity_id[attribute]`), an object with
 *                         entity and optional attribute fields, or a raw value.
 * @param {boolean} [fallbackToRaw=true] - Determines whether to return the raw input value if the
 *                                         state or entity is not found. Defaults to true.
 * @returns {string|undefined} - The state of the entity, the specified attribute value, the raw input,
 *                               or `undefined` if the entity is not found and `fallbackToRaw` is false.
 */
export const getState = (input, fallbackToRaw = true) => {
  if (input == null) return undefined;
  if (typeof input !== "string" && typeof input !== "object") return input;

  let entityId, attribute;

  // Step 1: Extract initial values based on input type
  if (typeof input === "object") {
    entityId = input.entity_id || input.entity;
    attribute = input.attribute || input.att;
  } else if (typeof input === "string") {
    entityId = input;
  }

  // Step 2: ALWAYS check for DER pattern and override if found
  if (typeof entityId === "string") {
    const match = entityId.match(/^([A-z0-9_.]+)\[([A-z0-9_]+)]$/);
    if (match) {
      [, entityId, attribute] = match; // DER takes precedence
    }
  }

  // Step 3: Validate and return
  if (!entityId || !hass.states[entityId]) {
    return fallbackToRaw ? input : undefined;
  }

  const stateObj = hass.states[entityId];
  return attribute ? stateObj.attributes[attribute] : stateObj.state;
};
