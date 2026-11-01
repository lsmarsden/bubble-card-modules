import { resolveColor, resolveColorFromStops } from "../color.js";
import { useHass } from "../../../../testing/cardHarness.js";

useHass({
  "sensor.hex": "#abc123",
  "sensor.named": "energy-high",
  "sensor.spaced": "  #abcdef  ",
  "sensor.number": { state: 123 },
  "sensor.red": "red",
  "sensor.blue": "blue",
});

describe("resolveColor", () => {
  it.each([
    ["hex", "#abc123", "#abc123"],
    ["rgb", "rgb(100, 150, 200)", "rgb(100, 150, 200)"],
    ["hsl", "hsl(120, 100%, 50%)", "hsl(120, 100%, 50%)"],
    ["var()", "var(--my-custom-color)", "var(--my-custom-color)"],
    ["a theme name", "red", "var(--red-color)"],
    ["an entity holding hex", "sensor.hex", "#abc123"],
    ["an entity holding a theme name", "sensor.named", "var(--energy-high-color)"],
    ["an entity value with whitespace", "sensor.spaced", "#abcdef"],
  ])("resolves %s", (_, input, expected) => {
    expect(resolveColor(input)).toBe(expected);
  });

  it.each([
    ["undefined", undefined],
    ["an empty string", ""],
    ["a non-string entity state", "sensor.number"],
  ])("falls back for %s: to the default, else primary", (_, input) => {
    expect(resolveColor(input, "rgba(255,255,255,0.4)")).toBe("rgba(255,255,255,0.4)");
    expect(resolveColor(input)).toBe("var(--primary-color)");
  });
});

describe("resolveColorFromStops", () => {
  const stops = (...pairs) => pairs.map(([percent, color]) => ({ percent, color }));
  const mix = (a, pa, b, pb) => `color-mix(in srgb, var(--${a}-color) ${pa}%, var(--${b}-color) ${pb}%)`;

  it.each([[null], [undefined], [[]], ["string"]])("falls back to primary for stops %p", (input) => {
    expect(resolveColorFromStops(50, input, true)).toBe("var(--primary-color)");
  });

  describe.each([true, false])("with interpolate = %s", (interpolate) => {
    it.each([
      ["below the first stop → first", 10, stops([30, "red"], [50, "blue"]), "var(--red-color)"],
      ["above the last stop → last", 90, stops([30, "red"], [70, "blue"]), "var(--blue-color)"],
      [
        "on a stop → that stop (unsorted input)",
        50,
        stops([49, "red"], [51, "blue"], [50, "green"]),
        "var(--green-color)",
      ],
      ["entity colours", 10, stops([30, "sensor.red"], [50, "sensor.blue"]), "var(--red-color)"],
      ["between two stops of the same colour", 50, stops([0, "red"], [100, "red"]), "var(--red-color)"],
    ])("%s", (_, progress, input, expected) => {
      expect(resolveColorFromStops(progress, input, interpolate)).toBe(expected);
    });

    it("accepts the editor's numbered-object shape, sorting by percent", () => {
      const input = { 0: { percent: 50, color: "blue" }, 1: { percent: 30, color: "red" } };
      expect(resolveColorFromStops(10, input, interpolate)).toBe("var(--red-color)");
    });
  });

  it.each([
    [50, stops([0, "red"], [100, "blue"]), mix("red", 50, "blue", 50)],
    [25, stops([0, "red"], [100, "blue"]), mix("red", 75, "blue", 25)],
    [50, stops([40, "yellow"], [60, "orange"]), mix("yellow", 50, "orange", 50)],
    [30, stops([25, "red"], [50, "yellow"], [75, "green"]), mix("red", 80, "yellow", 20)],
    [60, stops([25, "red"], [50, "yellow"], [75, "green"]), mix("yellow", 60, "green", 40)],
    [74, stops([25, "red"], [50, "yellow"], [75, "green"]), mix("yellow", 4, "green", 96)],
  ])("interpolates at %s%%", (progress, input, expected) => {
    expect(resolveColorFromStops(progress, input, true)).toBe(expected);
  });

  it("uses the lower stop between stops without interpolation", () => {
    expect(resolveColorFromStops(60, stops([25, "red"], [50, "yellow"], [75, "green"]), false)).toBe(
      "var(--yellow-color)",
    );
  });
});
