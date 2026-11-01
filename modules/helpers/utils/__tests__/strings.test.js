import { renderTextTemplate, suffix, prefix, formatNumber } from "../strings.js";
import { useHass } from "../../../../testing/cardHarness.js";

useHass({
  "sensor.time": "12:00",
  "sensor.temperature": { state: 25.0003688 },
  "sensor.humidity": { state: 75.5 },
  "sensor.precise": { state: 22.7532 },
  "climate.mode": "heating",
  "sensor.attrs": { state: "on", attributes: { level: 42 } },
});

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
  it.each([
    ["null", null, ""],
    ["a template without text", {}, ""],
    ["text without placeholders", { text: "Hello World" }, "Hello World"],
    ["a state", { text: "Time: {time}", placeholders: { time: "sensor.time" } }, "Time: 12:00"],
    ["an attribute", { text: "{lvl}%", placeholders: { lvl: "sensor.attrs[level]" } }, "42%"],
    ["a raw value", { text: "{v}", placeholders: { v: "plain" } }, "plain"],
    ["a null placeholder as empty", { text: "[{v}]", placeholders: { v: null } }, "[]"],
    ["a repeated placeholder", { text: "{m} is {m}", placeholders: { m: "climate.mode" } }, "heating is heating"],
    ["unused placeholders", { text: "Battery ok.", placeholders: { level: "sensor.battery" } }, "Battery ok."],
    [
      "an undefined placeholder as empty",
      { text: "Time: {time}{other}", placeholders: { time: "sensor.time" } },
      "Time: 12:00",
    ],
    [
      "numbers to two decimals, integers bare",
      {
        text: "{t}°C, {h}%, {p} in {m}",
        placeholders: { t: "sensor.temperature", h: "sensor.humidity", p: "sensor.precise", m: "climate.mode" },
      },
      "25°C, 75.50%, 22.75 in heating",
    ],
  ])("renders %s", (_, template, expected) => {
    expect(renderTextTemplate(template)).toBe(expected);
  });
});
