import { jest } from "@jest/globals";

jest.unstable_mockModule("../hass.js", () => ({
  getState: jest.fn(),
}));

const { renderTextTemplate, suffix, prefix } = await import("../strings.js");
const hass = await import("../hass.js");

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
});
