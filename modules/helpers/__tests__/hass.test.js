import { getState } from "../hass";

global.hass = {
  states: {
    "sensor.temperature": {
      state: "22.5",
      attributes: {
        unit_of_measurement: "°C",
        calibrated: true,
      },
    },
    "light.living_room": {
      state: "on",
      attributes: {
        brightness: 200,
      },
    },
  },
};

describe("getState() with no or non-standard input", () => {
  it("returns undefined for null", () => {
    expect(getState(null)).toBeUndefined();
  });

  it("returns undefined for undefined", () => {
    expect(getState(undefined)).toBeUndefined();
  });

  it("returns the input as-is for number", () => {
    expect(getState(42)).toBe(42);
  });

  it("returns the input as-is for boolean", () => {
    expect(getState(true)).toBe(true);
  });
});

describe("getState() with string input", () => {
  it("returns state for valid entity ID", () => {
    expect(getState("sensor.temperature")).toBe("22.5");
  });

  it("returns attribute value when specified as entity[attribute]", () => {
    expect(getState("sensor.temperature[unit_of_measurement]")).toBe("°C");
    expect(getState("light.living_room[brightness]")).toBe(200);
  });

  it("returns raw input if entity is not found", () => {
    expect(getState("sensor.unknown")).toBe("sensor.unknown");
  });

  it("returns undefined if fallbackToRaw is false and entity is missing", () => {
    expect(getState("sensor.unknown", false)).toBeUndefined();
  });

  it("returns undefined if fallbackToRaw is false and attribute is missing", () => {
    expect(getState("sensor.temperature[missing]", false)).toBeUndefined();
  });

  it("returns raw input if input matches pattern but entity is missing", () => {
    expect(getState("sensor.unknown[unknown]")).toBe("sensor.unknown[unknown]");
  });

  it("returns undefined if input matches pattern and fallbackToRaw is false but entity is missing", () => {
    expect(getState("sensor.unknown[unknown]", false)).toBeUndefined();
  });

  it("returns raw input for malformed string", () => {
    expect(getState("[malformed]")).toBe("[malformed]");
  });
});

describe("getState() with object input", () => {
  test.each([
    [{ entity: "sensor.temperature" }, "22.5"],
    [{ entity_id: "sensor.temperature" }, "22.5"],
  ])("returns state for %p", (input, expected) => {
    expect(getState(input)).toBe(expected);
  });

  test.each([
    [{ entity: "sensor.temperature", attribute: "unit_of_measurement" }, "°C"],
    [{ entity_id: "light.living_room", att: "brightness" }, 200],
  ])("returns attribute value for %p", (input, expected) => {
    expect(getState(input)).toBe(expected);
  });

  it("returns raw object if entity is not found and fallbackToRaw is true", () => {
    const input = { entity: "sensor.unknown", attribute: "foo" };
    expect(getState(input)).toEqual(input);
  });

  it("returns undefined if entity is not found and fallbackToRaw is false", () => {
    const input = { entity: "sensor.unknown", attribute: "foo" };
    expect(getState(input, false)).toBeUndefined();
  });

  it("returns undefined if entity is found but attribute is missing and fallbackToRaw is false", () => {
    const input = { entity: "sensor.temperature", attribute: "missing" };
    expect(getState(input, false)).toBeUndefined();
  });

  it("returns undefined for empty object", () => {
    expect(getState({}, false)).toBeUndefined();
  });

  it("returns undefined for irrelevant object structure", () => {
    expect(getState({ foo: "bar" }, false)).toBeUndefined();
  });
});

describe("getState() with DER precedence logic", () => {
  it("should use DER syntax when present in object entity field, overriding separate attribute", () => {
    // DER syntax in entity field should take precedence over separate attribute field
    const input = { entity: "sensor.temperature[unit_of_measurement]", attribute: "calibrated" };
    expect(getState(input)).toBe("°C"); // Should use unit_of_measurement, not calibrated
  });

  it("should use separate attribute when no DER syntax in entity field", () => {
    // When no DER syntax, should use separate attribute field
    const input = { entity: "sensor.temperature", attribute: "calibrated" };
    expect(getState(input)).toBe(true); // Should use calibrated attribute
  });

  it("should handle DER syntax in entity_id field", () => {
    // Test with entity_id instead of entity
    const input = { entity_id: "light.living_room[brightness]", attribute: "some_other_attr" };
    expect(getState(input)).toBe(200); // Should use brightness from DER, not some_other_attr
  });

  it("should handle DER syntax with non-existent attribute gracefully", () => {
    const input = { entity: "sensor.temperature[missing_attr]", attribute: "calibrated" };
    expect(getState(input, false)).toBeUndefined();
  });

  it("should handle DER syntax with non-existent entity gracefully", () => {
    const input = { entity: "sensor.unknown[some_attr]", attribute: "fallback_attr" };
    expect(getState(input)).toEqual(input); // Should return raw input when fallbackToRaw is true
    expect(getState(input, false)).toBeUndefined();
  });

  it("should still work with entity only (no attribute fields)", () => {
    const input = { entity: "sensor.temperature" };
    expect(getState(input)).toBe("22.5"); // Should return entity state
  });

  it("should handle edge case where entity field contains DER but no separate attribute", () => {
    const input = { entity: "sensor.temperature[unit_of_measurement]" };
    expect(getState(input)).toBe("°C"); // Should extract attribute from DER
  });
});
