import { jest } from "@jest/globals";

jest.unstable_mockModule("../../entity/hass.js", () => ({
  getState: jest.fn(),
}));

const { renderTextTemplate, suffix, prefix, formatNumber } = await import("../strings.js");
const hass = await import("../../entity/hass.js");

describe("suffix()", () => {
  it("adds the suffix if missing", () => {
    expect(suffix("filename", ".js")).toBe("filename.js");
  });

  it("does not add the suffix if already present", () => {
    expect(suffix("file.js", ".js")).toBe("file.js");
  });

  it("handles non-string input by coercing to string", () => {
    expect(suffix(123, "px")).toBe("123px");
  });

  test.each([[undefined], [null], [""], ["   "]])("handles null or empty input by returning empty string", (input) => {
    expect(suffix(input, "px")).toBe("");
  });

  it("handles empty suffix gracefully", () => {
    expect(suffix("test", "")).toBe("test");
  });
});

describe("prefix()", () => {
  it("adds the prefix if missing", () => {
    expect(prefix("world", "hello ")).toBe("hello world");
  });

  it("does not add the prefix if already present", () => {
    expect(prefix("hello world", "hello ")).toBe("hello world");
  });

  it("handles non-string input by coercing to string", () => {
    expect(prefix(42, "$")).toBe("$42");
  });

  test.each([[undefined], [null], [""], ["   "]])("handles null or empty input by returning empty string", (input) => {
    expect(prefix(input, "px")).toBe("");
  });

  it("handles empty prefix gracefully", () => {
    expect(prefix("value", "")).toBe("value");
  });
});

describe("formatNumber()", () => {
  describe("returns integers for values that are integers to 2 decimal places", () => {
    test.each([
      [25, "25"],
      [25.0, "25"],
      [25.0, "25"],
      [25.0003688, "25"],
      [25.001, "25"],
      [25.004999, "25"],
      [0, "0"],
      [-25, "-25"],
      [-25.0003688, "-25"],
      [100.004, "100"],
      [0.001, "0"],
    ])("formatNumber(%p) returns %s", (input, expected) => {
      expect(formatNumber(input)).toBe(expected);
    });
  });

  describe("returns floats to 2 decimal places for values that are floats to 2 decimal places", () => {
    test.each([
      [25.5, "25.50"],
      [25.5, "25.50"],
      [25.502985, "25.50"],
      [25.009, "25.01"],
      [25.51, "25.51"],
      [25.599, "25.60"],
      [0.1, "0.10"],
      [0.99, "0.99"],
      [-25.5, "-25.50"],
      [-25.502985, "-25.50"],
      [100.75, "100.75"],
      [0.05, "0.05"],
    ])("formatNumber(%p) returns %s", (input, expected) => {
      expect(formatNumber(input)).toBe(expected);
    });
  });

  describe("returns values unformatted for non-numbers", () => {
    test.each([
      ["25", "25"],
      ["hello", "hello"],
      [null, null],
      [undefined, undefined],
      [true, true],
      [false, false],
      [{}, {}],
      [[], []],
      ["25.5", "25.5"],
    ])("formatNumber(%p) returns %p", (input, expected) => {
      expect(formatNumber(input)).toEqual(expected);
    });
  });

  describe("edge cases", () => {
    test.each([
      [NaN, NaN],
      [Infinity, Infinity],
      [-Infinity, -Infinity],
      [0.0, "0"],
      [-0, "0"],
    ])("formatNumber(%p) returns %p", (input, expected) => {
      expect(formatNumber(input)).toBe(expected);
    });
  });
});

describe("renderTextTemplate()", () => {
  beforeEach(() => {
    hass.getState.mockReset();
  });

  it("returns empty string if textTemplate is null or missing text", () => {
    expect(renderTextTemplate(null)).toBe("");
    expect(renderTextTemplate({})).toBe("");
  });

  it("returns original text if no placeholders are provided", () => {
    expect(renderTextTemplate({ text: "Hello World" })).toBe("Hello World");
  });

  it("substitutes a single placeholder using getState", () => {
    hass.getState.mockReturnValueOnce("12:00");
    const template = {
      text: "Time: {time}",
      placeholders: {
        time: "sensor.time",
      },
    };
    expect(renderTextTemplate(template)).toBe("Time: 12:00");
  });

  it("substitutes multiple placeholders using getState", () => {
    hass.getState.mockReturnValueOnce("20°C").mockReturnValueOnce("50%");

    const template = {
      text: "Temp: {temp}, Humidity: {humidity}",
      placeholders: {
        temp: "sensor.temperature",
        humidity: "sensor.humidity",
      },
    };
    expect(renderTextTemplate(template)).toBe("Temp: 20°C, Humidity: 50%");
  });

  it("uses empty string for unresolved placeholders", () => {
    hass.getState.mockReturnValueOnce(undefined);
    const template = {
      text: "Time: {time}{other}",
      placeholders: {
        time: "sensor.missing",
      },
    };
    expect(renderTextTemplate(template)).toBe("Time: ");
  });

  it("ignores placeholders not used in text", () => {
    const template = {
      text: "Battery ok.",
      placeholders: {
        level: "sensor.battery_level",
      },
    };
    expect(renderTextTemplate(template)).toBe("Battery ok.");
  });

  it("replaces the same placeholder multiple times if repeated", () => {
    hass.getState.mockReturnValueOnce("cool");
    const template = {
      text: "{mode} mode is {mode}",
      placeholders: {
        mode: "sensor.ac_mode",
      },
    };
    expect(renderTextTemplate(template)).toBe("cool mode is cool");
    expect(hass.getState).toHaveBeenCalledTimes(1);
  });

  describe("number formatting in templates", () => {
    it("formats integer values in placeholders", () => {
      hass.getState.mockReturnValueOnce(25.0003688);
      const template = {
        text: "Temperature: {temp}°C",
        placeholders: {
          temp: "sensor.temperature",
        },
      };
      expect(renderTextTemplate(template)).toBe("Temperature: 25°C");
    });

    it("formats float values to 2 decimal places in placeholders", () => {
      hass.getState.mockReturnValueOnce(25.502985);
      const template = {
        text: "Temperature: {temp}°C",
        placeholders: {
          temp: "sensor.temperature",
        },
      };
      expect(renderTextTemplate(template)).toBe("Temperature: 25.50°C");
    });

    it("handles multiple numeric placeholders with different formatting", () => {
      hass.getState.mockReturnValueOnce(25.0003688).mockReturnValueOnce(75.5);

      const template = {
        text: "Temp: {temp}°C, Humidity: {humidity}%",
        placeholders: {
          temp: "sensor.temperature",
          humidity: "sensor.humidity",
        },
      };
      expect(renderTextTemplate(template)).toBe("Temp: 25°C, Humidity: 75.50%");
    });

    it("leaves non-numeric values unformatted in placeholders", () => {
      hass.getState.mockReturnValueOnce("heating");
      const template = {
        text: "Mode: {mode}",
        placeholders: {
          mode: "climate.mode",
        },
      };
      expect(renderTextTemplate(template)).toBe("Mode: heating");
    });

    it("handles mixed numeric and non-numeric placeholders", () => {
      hass.getState.mockReturnValueOnce(22.7532).mockReturnValueOnce("auto");

      const template = {
        text: "{temp}°C in {mode} mode",
        placeholders: {
          temp: "sensor.temperature",
          mode: "climate.mode",
        },
      };
      expect(renderTextTemplate(template)).toBe("22.75°C in auto mode");
    });
  });
});
