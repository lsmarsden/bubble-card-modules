// note we need to structure mocks like this due to the following:
// https://jestjs.io/docs/ecmascript-modules#module-mocking-in-esm
// see: https://stackoverflow.com/a/71044616/19071151
import { jest } from "@jest/globals";

jest.unstable_mockModule("../hass.js", () => ({
  getState: jest.fn(),
}));

const { resolveColor, resolveColorFromStops } = await import("../color.js");
const hass = await import("../hass.js");

describe("resolveColor()", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("returns primary color if no resolved state and no default", () => {
    hass.getState.mockReturnValue(undefined);
    expect(resolveColor("sensor.unknown")).toBe("var(--primary-color)");
  });

  it("returns primary color if resolved value is not a string and no default", () => {
    hass.getState.mockReturnValue(123);
    expect(resolveColor("sensor.invalid")).toBe("var(--primary-color)");
  });

  it("returns default color if no resolved state", () => {
    hass.getState.mockReturnValue(undefined);
    expect(resolveColor("sensor.unknown", "rgba(255,255,255,0.4)")).toBe(
      "rgba(255,255,255,0.4)",
    );
  });

  it("returns default color if resolved value is not a string", () => {
    hass.getState.mockReturnValue(123);
    expect(resolveColor("sensor.invalid", "blue")).toBe("blue");
  });

  it("returns RGB value as-is", () => {
    hass.getState.mockReturnValue("rgb(100, 150, 200)");
    expect(resolveColor("sensor.rgb")).toBe("rgb(100, 150, 200)");
  });

  it("returns hex value as-is", () => {
    hass.getState.mockReturnValue("#abc123");
    expect(resolveColor("sensor.hex")).toBe("#abc123");
  });

  it("returns hsl value as-is", () => {
    hass.getState.mockReturnValue("hsl(120, 100%, 50%)");
    expect(resolveColor("sensor.hsl")).toBe("hsl(120, 100%, 50%)");
  });

  it("wraps other values in CSS var() syntax", () => {
    hass.getState.mockReturnValue("energy-high");
    expect(resolveColor("sensor.name")).toBe("var(--energy-high-color)");
  });

  it("trims resolved values before checking", () => {
    hass.getState.mockReturnValue("  #abcdef  ");
    expect(resolveColor("sensor.spaced")).toBe("#abcdef");
  });
});

describe("resolveColorFromStops()", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe.each([true, false])(
    "shared behavior (interpolate = %s)",
    (interpolate) => {
      it("returns default when stops is null or empty", () => {
        expect(resolveColorFromStops(50, null, interpolate)).toBe(
          "var(--primary-color)",
        );
        expect(resolveColorFromStops(50, [], interpolate)).toBe(
          "var(--primary-color)",
        );
      });

      it("returns color of first stop if progress is less than first percent", () => {
        hass.getState.mockReturnValueOnce("red");
        const stops = [
          { color: "sensor.color1", percent: 30 },
          { color: "sensor.color2", percent: 50 },
        ];
        expect(resolveColorFromStops(10, stops, interpolate)).toBe(
          "var(--red-color)",
        );
      });
      it("returns color of first stop if progress is less than first percent (object-style stops)", () => {
        hass.getState.mockReturnValueOnce("red");
        const stops = {
          0: { color: "sensor.color1", percent: 30 },
          1: { color: "sensor.color2", percent: 50 },
        };
        expect(resolveColorFromStops(10, stops, interpolate)).toBe(
          "var(--red-color)",
        );
      });

      it("returns color of last stop if progress is greater than last percent", () => {
        hass.getState.mockReturnValueOnce("blue");
        const stops = [
          { color: "sensor.color1", percent: 30 },
          { color: "sensor.color2", percent: 70 },
        ];
        expect(resolveColorFromStops(90, stops, interpolate)).toBe(
          "var(--blue-color)",
        );
      });

      it("returns exact match if progress equals stop percent", () => {
        hass.getState.mockImplementation((key) => {
          const map = {
            "sensor.color1": "red",
            "sensor.color2": "blue",
            "sensor.color3": "green",
          };
          return map[key];
        });
        const stops = [
          { color: "sensor.color1", percent: 49 },
          { color: "sensor.color2", percent: 51 },
          { color: "sensor.color3", percent: 50 },
        ];
        expect(resolveColorFromStops(50, stops, interpolate)).toBe(
          "var(--green-color)",
        );
      });

      it("returns default if resolved color is invalid", () => {
        hass.getState.mockReturnValueOnce(undefined);
        hass.getState.mockReturnValueOnce(undefined);
        const stops = [
          { color: "sensor.colorX", percent: 40 },
          { color: "sensor.colorY", percent: 60 },
        ];
        expect(resolveColorFromStops(50, stops, interpolate)).toBe(
          "var(--primary-color)",
        );
      });
    },
  );

  describe("interpolated colors", () => {
    test.each([
      [
        0,
        "red",
        100,
        "blue",
        50,
        "color-mix(in srgb, var(--red-color) 50%, var(--blue-color) 50%)",
      ],
      [
        0,
        "red",
        100,
        "blue",
        25,
        "color-mix(in srgb, var(--red-color) 75%, var(--blue-color) 25%)",
      ],
      [
        0,
        "red",
        100,
        "blue",
        75,
        "color-mix(in srgb, var(--red-color) 25%, var(--blue-color) 75%)",
      ],
      [
        40,
        "yellow",
        60,
        "orange",
        50,
        "color-mix(in srgb, var(--yellow-color) 50%, var(--orange-color) 50%)",
      ],
      [10, "green", 90, "purple", 10, "var(--green-color)"],
      [10, "green", 90, "purple", 90, "var(--purple-color)"],
    ])(
      "interpolates between %s (%s) and %s (%s) at %s%%",
      (p1, c1, p2, c2, value, expected) => {
        hass.getState.mockImplementation((key) => {
          const map = {
            "sensor.lower": c1,
            "sensor.upper": c2,
          };
          return map[key];
        });

        const stops = [
          { color: "sensor.lower", percent: p1 },
          { color: "sensor.upper", percent: p2 },
        ];
        expect(resolveColorFromStops(value, stops, true)).toBe(expected);
      },
    );
  });
});

describe("interpolated with multiple stops", () => {
  test.each([
    [
      25,
      "red",
      50,
      "yellow",
      75,
      "green",
      30,
      "color-mix(in srgb, var(--red-color) 80%, var(--yellow-color) 20%)",
    ],
    [25, "red", 50, "yellow", 75, "green", 50, "var(--yellow-color)"],
    [
      25,
      "red",
      50,
      "yellow",
      75,
      "green",
      60,
      "color-mix(in srgb, var(--yellow-color) 60%, var(--green-color) 40%)",
    ],
    [
      25,
      "red",
      50,
      "yellow",
      75,
      "green",
      74,
      "color-mix(in srgb, var(--yellow-color) 4%, var(--green-color) 96%)",
    ],
  ])(
    "interpolates across multiple stops with value %s",
    (p1, c1, p2, c2, p3, c3, value, expected) => {
      hass.getState.mockImplementation((key) => {
        const map = {
          "sensor.stop1": c1,
          "sensor.stop2": c2,
          "sensor.stop3": c3,
        };
        return map[key];
      });

      const stops = [
        { color: "sensor.stop1", percent: p1 },
        { color: "sensor.stop2", percent: p2 },
        { color: "sensor.stop3", percent: p3 },
      ];
      expect(resolveColorFromStops(value, stops, true)).toBe(expected);
    },
  );
});
