import { getState, getAttributes, getDomain } from "../hass.js";

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
    "timer.cooking": {
      state: "active",
      attributes: {
        duration: "00:15:00",
        remaining: "00:05:00",
        finishes_at: "2023-10-01T12:45:00+00:00",
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

  it("returns undefined if fallbackToRaw is false and type is not string or object", () => {
    expect(getState(1, false)).toBeUndefined();
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

describe("getAttributes()", () => {
  describe("with valid entity input", () => {
    it("should return attributes object for string entity ID", () => {
      const result = getAttributes("sensor.temperature");
      expect(result).toEqual({
        unit_of_measurement: "°C",
        calibrated: true,
      });
    });

    it("should return attributes object for object with entity field", () => {
      const result = getAttributes({ entity: "light.living_room" });
      expect(result).toEqual({
        brightness: 200,
      });
    });

    it("should return attributes object for object with entity_id field", () => {
      const result = getAttributes({ entity_id: "timer.cooking" });
      expect(result).toEqual({
        duration: "00:15:00",
        remaining: "00:05:00",
        finishes_at: "2023-10-01T12:45:00+00:00",
      });
    });

    it("should return empty object if entity has no attributes", () => {
      // Add test entity with no attributes
      global.hass.states["binary_sensor.door"] = {
        state: "off",
      };

      const result = getAttributes("binary_sensor.door");
      expect(result).toEqual({});
    });
  });

  describe("with invalid input", () => {
    it("should return undefined for null", () => {
      expect(getAttributes(null)).toBeUndefined();
    });

    it("should return undefined for undefined", () => {
      expect(getAttributes(undefined)).toBeUndefined();
    });

    it("should return undefined for non-string/non-object input", () => {
      expect(getAttributes(42)).toBeUndefined();
      expect(getAttributes(true)).toBeUndefined();
    });

    it("should return undefined for non-existent entity", () => {
      expect(getAttributes("sensor.unknown")).toBeUndefined();
    });

    it("should return undefined for empty object", () => {
      expect(getAttributes({})).toBeUndefined();
    });
  });
});

describe("getDomain()", () => {
  describe("with valid entity input", () => {
    it("should return domain for string entity ID", () => {
      expect(getDomain("sensor.temperature")).toBe("sensor");
      expect(getDomain("light.living_room")).toBe("light");
      expect(getDomain("timer.cooking")).toBe("timer");
    });

    it("should return domain for object with entity field", () => {
      expect(getDomain({ entity: "sensor.temperature" })).toBe("sensor");
    });

    it("should return domain for object with entity_id field", () => {
      expect(getDomain({ entity_id: "light.living_room" })).toBe("light");
    });

    it("should handle entities with multiple dots in name", () => {
      // Add test entity with dots in name
      global.hass.states["sensor.outdoor.temperature.front"] = {
        state: "18.5",
        attributes: {},
      };

      expect(getDomain("sensor.outdoor.temperature.front")).toBe("sensor");
    });
  });

  describe("with invalid input", () => {
    it("should return undefined for null", () => {
      expect(getDomain(null)).toBeUndefined();
    });

    it("should return undefined for undefined", () => {
      expect(getDomain(undefined)).toBeUndefined();
    });

    it("should return undefined for non-string/non-object input", () => {
      expect(getDomain(42)).toBeUndefined();
      expect(getDomain(true)).toBeUndefined();
    });

    it("should return domain based on first part of entity", () => {
      expect(getDomain("sensor.unknown")).toBe("sensor");
    });

    it("should return undefined for empty object", () => {
      expect(getDomain({})).toBeUndefined();
    });

    it("should return full domain if no second part", () => {
      expect(getDomain("sensor")).toBe("sensor");
    });
  });
});
