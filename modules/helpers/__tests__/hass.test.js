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
