import { jest } from "@jest/globals";

// Global reference for mocks to access
let mockHass;

// Mock all the helper dependencies first
jest.unstable_mockModule("../../helpers/condition.js", () => ({
  checkAllConditions: jest.fn(() => true),
}));

jest.unstable_mockModule("../../helpers/color.js", () => ({
  resolveColor: jest.fn((color, defaultColor) => {
    // Handle entity references by looking up in hass states - these will be resolved at test runtime
    if (typeof color === "string" && color.startsWith("sensor.")) {
      // Return a placeholder that tests can check for - the actual module will resolve this
      // For the tests, we'll simulate resolved colors: sensor.background -> "white"
      if (color === "sensor.background") return "white";
      if (color === "sensor.color") return "blue";
      return defaultColor;
    }
    return color || defaultColor;
  }),
  resolveColorFromStops: jest.fn(() => "rgb(255, 255, 0)"),
}));

jest.unstable_mockModule("../../helpers/effects.js", () => ({
  applyEffects: jest.fn(),
}));

jest.unstable_mockModule("../../helpers/hass.js", () => ({
  getState: jest.fn(),
}));

jest.unstable_mockModule("../../helpers/arrays.js", () => ({
  toArray: jest.fn((input) => {
    if (input === undefined || input === null) return [];
    return Array.isArray(input) ? input : [input];
  }),
}));

jest.unstable_mockModule("../../helpers/config.js", () => ({
  resolveConfig: jest.fn((sources, defaultValue) => {
    for (const source of sources) {
      const keys = Array.isArray(source.path) ? source.path : source.path.split(".");
      let value = source.config;
      for (const key of keys) {
        value = value?.[key];
      }
      if (value !== undefined) return value;
    }
    return defaultValue;
  }),
}));

// Mock the new SVG helper functions
jest.unstable_mockModule("../../helpers/progressBorder.js", () => ({
  createProgressBorder: jest.fn(),
  removeProgressBorder: jest.fn(),
}));

// Import the helpers to access mocked functions
const condition = await import("../../helpers/condition.js");
const color = await import("../../helpers/color.js");
const effects = await import("../../helpers/effects.js");
const hass = await import("../../helpers/hass.js");
const arrays = await import("../../helpers/arrays.js");
const config = await import("../../helpers/config.js");
const strokeDashProgress = await import("../../helpers/progressBorder.js");

const { icon_border_progress } = await import("../code.js");

describe("icon_border_progress", () => {
  let mockCard;
  let mockElement;
  let mockConfig;
  let mockThis;

  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks();

    // Reset DOM
    document.body.innerHTML = "";

    // Create a mock card element with the required structure
    mockCard = document.createElement("div");
    mockElement = document.createElement("div");
    mockElement.className = "bubble-icon-container";
    mockCard.appendChild(mockElement);
    document.body.appendChild(mockCard);

    // Mock getComputedStyle
    global.getComputedStyle = jest.fn().mockReturnValue({
      getPropertyValue: jest.fn().mockReturnValue(""),
    });

    // Create mock hass object with proper state structure
    mockHass = {
      states: {
        "sensor.progress": { state: "50" },
        "sensor.start": { state: "0" },
        "sensor.end": { state: "100" },
        "sensor.color": { state: "blue" },
        "sensor.background": { state: "white" },
      },
    };

    // Set up the hass.getState mock to return appropriate values
    hass.getState.mockImplementation((entity) => {
      return mockHass.states[entity]?.state;
    });

    // Basic test config
    mockConfig = {
      icon_border_progress: [
        {
          button: "main-button",
          source: "sensor.progress",
          start: "sensor.start",
          end: "sensor.end",
          color_stops: [
            { percentage: 0, color: "red" },
            { percentage: 50, color: "yellow" },
            { percentage: 100, color: "green" },
          ],
          remaining_color: "sensor.background",
          background_color: "sensor.background",
        },
      ],
    };

    // Create the `this` context that the function expects
    mockThis = {
      config: mockConfig,
    };
  });

  describe("DOM element selection", () => {
    it("should find and modify main-button element", () => {
      icon_border_progress.call(mockThis, mockCard, mockHass);

      // Verify the new SVG helper was called with correct parameters
      expect(strokeDashProgress.createProgressBorder).toHaveBeenCalledWith(
        mockElement,
        50, // progress value (50%)
        "rgb(255, 255, 0)", // progress color from resolveColorFromStops mock
        "white", // remaining color resolved from sensor.background
        0, // start angle (default)
        {
          strokeWidth: 3,
          animationDuration: 800,
        },
      );
      // Verify background color is set to resolved background color from sensor.background
      expect(mockElement.style.background).toBe("white");
    });

    it("should find and modify main element (alias for main-button)", () => {
      mockThis.config.icon_border_progress[0].button = "main";

      icon_border_progress.call(mockThis, mockCard, mockHass);

      // Verify SVG helper was called
      expect(strokeDashProgress.createProgressBorder).toHaveBeenCalledWith(
        mockElement,
        50, // progress value
        "rgb(255, 255, 0)", // progress color
        "white", // remaining color resolved from sensor.background
        0, // start angle
        {
          strokeWidth: 3,
          animationDuration: 800,
        },
      );
    });

    it("should find custom button element", () => {
      mockThis.config.icon_border_progress[0].button = "custom-button";
      mockElement.className = "bubble-custom-button";

      icon_border_progress.call(mockThis, mockCard, mockHass);

      // Verify SVG helper was called
      expect(strokeDashProgress.createProgressBorder).toHaveBeenCalledWith(
        mockElement,
        50, // progress value
        "rgb(255, 255, 0)", // progress color
        "white", // remaining color resolved from sensor.background
        0, // start angle
        {
          strokeWidth: 3,
          animationDuration: 800,
        },
      );
    });

    it("should handle missing element gracefully", () => {
      mockThis.config.icon_border_progress[0].button = "nonexistent";

      expect(() => {
        icon_border_progress.call(mockThis, mockCard, mockHass);
      }).not.toThrow();

      // Verify SVG helper was not called since element doesn't exist
      expect(strokeDashProgress.createProgressBorder).not.toHaveBeenCalled();
    });

    it("should handle start_angle configuration", () => {
      mockThis.config.icon_border_progress[0].start_angle = 90;

      icon_border_progress.call(mockThis, mockCard, mockHass);

      // Verify SVG helper was called with correct start angle
      expect(strokeDashProgress.createProgressBorder).toHaveBeenCalledWith(
        mockElement,
        50, // progress value
        "rgb(255, 255, 0)", // progress color
        "white", // remaining color resolved from sensor.background
        -90, // start angle
        {
          strokeWidth: 3,
          animationDuration: 800,
        },
      );
    });

    it("should use default start_angle when not specified", () => {
      // start_angle not set in config, should default to 0
      icon_border_progress.call(mockThis, mockCard, mockHass);

      // Verify default start angle of 0 is used
      expect(strokeDashProgress.createProgressBorder).toHaveBeenCalledWith(
        mockElement,
        50,
        "rgb(255, 255, 0)",
        "white", // remaining color resolved from sensor.background
        0, // default start angle
        expect.any(Object),
      );
    });
  });

  describe("progress value calculation", () => {
    it("should calculate progress percentage correctly", () => {
      mockHass.states["sensor.progress"].state = "75";

      icon_border_progress.call(mockThis, mockCard, mockHass);

      // Verify SVG helper was called with correct progress value (75%)
      expect(strokeDashProgress.createProgressBorder).toHaveBeenCalledWith(
        mockElement,
        75, // 75% progress
        "rgb(255, 255, 0)",
        "white",
        0,
        expect.any(Object),
      );
    });

    it("should handle custom start and end values", () => {
      mockHass.states["sensor.progress"].state = "150";
      mockHass.states["sensor.start"].state = "100";
      mockHass.states["sensor.end"].state = "200";

      icon_border_progress.call(mockThis, mockCard, mockHass);

      // 150 in range 100-200 = 50% progress
      expect(strokeDashProgress.createProgressBorder).toHaveBeenCalledWith(
        mockElement,
        50, // (150-100)/(200-100) * 100 = 50%
        "rgb(255, 255, 0)",
        "white",
        0,
        expect.any(Object),
      );
    });

    it("should clamp values below start to start value", () => {
      mockHass.states["sensor.progress"].state = "-10";

      icon_border_progress.call(mockThis, mockCard, mockHass);

      // Value below start should be clamped to 0%
      expect(strokeDashProgress.createProgressBorder).toHaveBeenCalledWith(
        mockElement,
        0, // clamped to 0%
        "rgb(255, 255, 0)",
        "white",
        0,
        expect.any(Object),
      );
    });

    it("should clamp values above end to end value", () => {
      mockHass.states["sensor.progress"].state = "150";

      icon_border_progress.call(mockThis, mockCard, mockHass);

      // Value above end should be clamped to 100%
      expect(strokeDashProgress.createProgressBorder).toHaveBeenCalledWith(
        mockElement,
        100, // clamped to 100%
        "rgb(255, 255, 0)",
        "white",
        0,
        expect.any(Object),
      );
    });

    it("should handle NaN values by using start value", () => {
      mockHass.states["sensor.progress"].state = "invalid";

      icon_border_progress.call(mockThis, mockCard, mockHass);

      // Invalid value should result in 0% (start value)
      expect(strokeDashProgress.createProgressBorder).toHaveBeenCalledWith(
        mockElement,
        0, // NaN becomes 0%
        "rgb(255, 255, 0)",
        "white",
        0,
        expect.any(Object),
      );
    });

    it("should use default start (0) and end (100) for NaN values", () => {
      mockHass.states["sensor.start"].state = "invalid";
      mockHass.states["sensor.end"].state = "invalid";
      mockHass.states["sensor.progress"].state = "50";

      icon_border_progress.call(mockThis, mockCard, mockHass);

      // Should default to 0-100 range, so 50 = 50%
      expect(strokeDashProgress.createProgressBorder).toHaveBeenCalledWith(
        mockElement,
        50, // 50% with default 0-100 range
        "rgb(255, 255, 0)",
        "white",
        0,
        expect.any(Object),
      );
    });
  });

  describe("color handling", () => {
    it("should apply color from color stops", () => {
      mockHass.states["sensor.progress"].state = "25";

      icon_border_progress.call(mockThis, mockCard, mockHass);

      // Verify color from color stops is passed to SVG helper
      expect(strokeDashProgress.createProgressBorder).toHaveBeenCalledWith(
        mockElement,
        25, // 25% progress
        "rgb(255, 255, 0)", // Color from resolveColorFromStops mock
        "white", // Remaining color from mock
        0, // Default start angle
        expect.any(Object),
      );
    });

    it("should handle remaining_color configuration", () => {
      // Setup a fresh configuration for this test
      mockThis.config.icon_border_progress[0] = {
        button: "main-button",
        source: "sensor.progress",
        start: 0,
        end: 100,
        remaining_color: "sensor.background",
        background_color: "sensor.background",
      };

      // Ensure proper entity states
      mockHass.states["sensor.progress"].state = "50";
      mockHass.states["sensor.background"].state = "rgba(100,100,100,0.5)";

      // Override config resolution for this test
      config.resolveConfig.mockImplementation((sources) => {
        for (const source of sources) {
          if (source.path === "source") return "sensor.progress";
          if (source.path === "remaining_color") return "sensor.background";
          if (source.path === "background_color") return "sensor.background";
        }
        return undefined;
      });

      // Override color resolution for this test
      color.resolveColor.mockImplementation((colorValue, defaultColor) => {
        if (colorValue === "sensor.background") return "rgba(100,100,100,0.5)";
        return colorValue || defaultColor;
      });

      icon_border_progress.call(mockThis, mockCard, mockHass);

      // Verify remaining color is passed to SVG helper
      expect(strokeDashProgress.createProgressBorder).toHaveBeenCalledWith(
        mockElement,
        50, // Progress value (50%)
        "rgb(255, 255, 0)", // Progress color from mock
        "rgba(100,100,100,0.5)", // Remaining color resolved from entity
        0, // Default start angle
        expect.any(Object),
      );
    });

    it("should handle background_color configuration", () => {
      // Setup a fresh configuration for this test
      mockThis.config.icon_border_progress[0] = {
        button: "main-button",
        source: "sensor.progress",
        start: 0,
        end: 100,
        background_color: "sensor.color", // Only set background, leave remaining_color to default
      };

      // Ensure proper entity states
      mockHass.states["sensor.progress"].state = "50";
      mockHass.states["sensor.color"].state = "blue";

      // Override config resolution for this test
      config.resolveConfig.mockImplementation((sources) => {
        for (const source of sources) {
          if (source.path === "source") return "sensor.progress";
          if (source.path === "background_color") return "sensor.color";
          if (source.path === "remaining_color") return undefined; // No remaining_color configured
        }
        return undefined;
      });

      // Override color resolution for this test
      color.resolveColor.mockImplementation((colorValue, defaultColor) => {
        if (colorValue === "sensor.color") return "blue";
        return defaultColor; // For remaining_color, return default
      });

      icon_border_progress.call(mockThis, mockCard, mockHass);

      // Verify background is applied to element and SVG helper is called
      expect(mockElement.style.background).toBe("blue");
      expect(strokeDashProgress.createProgressBorder).toHaveBeenCalledWith(
        mockElement,
        50, // Progress value (50%)
        "rgb(255, 255, 0)", // Progress color from mock
        "var(--dark-grey-color)", // Default remaining color (since we only set background_color)
        0, // Default start angle
        expect.any(Object),
      );
    });

    it("should use default colors when entities are not found", () => {
      delete mockThis.config.icon_border_progress[0].remaining_color;
      delete mockThis.config.icon_border_progress[0].background_color;

      // Mock config.resolveConfig to return undefined (no config found)
      config.resolveConfig.mockReturnValue(undefined);
      // Mock color.resolveColor to return the default values
      color.resolveColor.mockImplementation((color, defaultColor) => defaultColor);

      icon_border_progress.call(mockThis, mockCard, mockHass);

      expect(color.resolveColor).toHaveBeenCalledWith(undefined, "var(--dark-grey-color)");
      expect(color.resolveColor).toHaveBeenCalledWith(undefined, "var(--bubble-icon-background-color)");
    });
  });

  describe("deprecated configuration support", () => {
    it("should support deprecated 'entity' instead of 'source'", () => {
      // Setup test with deprecated 'entity' config
      mockThis.config.icon_border_progress[0] = {
        button: "main-button",
        entity: "sensor.progress", // deprecated - should use 'source'
        start: 0,
        end: 100,
      };

      // Reset config.resolveConfig to use the actual implementation logic
      config.resolveConfig.mockImplementation((sources, defaultValue) => {
        for (const source of sources) {
          const keys = Array.isArray(source.path) ? source.path : source.path.split(".");
          let value = source.config;
          for (const key of keys) {
            value = value?.[key];
          }
          if (value !== undefined) return value;
        }
        return defaultValue;
      });

      // Ensure entity has expected value
      mockHass.states["sensor.progress"].state = "50";

      icon_border_progress.call(mockThis, mockCard, mockHass);

      // Verify the SVG helper was called (meaning deprecated config worked)
      expect(strokeDashProgress.createProgressBorder).toHaveBeenCalledWith(
        mockElement,
        50, // progress from deprecated entity
        "rgb(255, 255, 0)", // color from stops
        expect.any(String), // remaining color (default)
        0, // start angle
        expect.any(Object),
      );
    });

    it("should support deprecated 'remainingcolor' instead of 'remaining_color'", () => {
      // Setup test with deprecated 'remainingcolor' config
      mockThis.config.icon_border_progress[0] = {
        button: "main-button",
        source: "sensor.progress",
        start: 0,
        end: 100,
        remainingcolor: "sensor.background", // deprecated - should use 'remaining_color'
      };

      // Reset config.resolveConfig to use the actual implementation logic
      config.resolveConfig.mockImplementation((sources, defaultValue) => {
        for (const source of sources) {
          const keys = Array.isArray(source.path) ? source.path : source.path.split(".");
          let value = source.config;
          for (const key of keys) {
            value = value?.[key];
          }
          if (value !== undefined) return value;
        }
        return defaultValue;
      });

      // Ensure entities have expected values
      mockHass.states["sensor.progress"].state = "50";
      mockHass.states["sensor.background"].state = "red";

      // Override color resolution for this test
      color.resolveColor.mockImplementation((colorValue, defaultColor) => {
        if (colorValue === "sensor.background") return "red";
        return defaultColor;
      });

      icon_border_progress.call(mockThis, mockCard, mockHass);

      // Verify the SVG helper was called with deprecated remaining color
      expect(strokeDashProgress.createProgressBorder).toHaveBeenCalledWith(
        mockElement,
        50, // progress value
        "rgb(255, 255, 0)", // color from stops
        "red", // remaining color from deprecated config
        0, // start angle
        expect.any(Object),
      );
    });

    it("should support deprecated 'backcolor' instead of 'background_color'", () => {
      // Setup test with deprecated 'backcolor' config
      mockThis.config.icon_border_progress[0] = {
        button: "main-button",
        source: "sensor.progress",
        start: 0,
        end: 100,
        backcolor: "sensor.background", // deprecated - should use 'background_color'
      };

      // Reset config.resolveConfig to use the actual implementation logic
      config.resolveConfig.mockImplementation((sources, defaultValue) => {
        for (const source of sources) {
          const keys = Array.isArray(source.path) ? source.path : source.path.split(".");
          let value = source.config;
          for (const key of keys) {
            value = value?.[key];
          }
          if (value !== undefined) return value;
        }
        return defaultValue;
      });

      // Ensure entities have expected values
      mockHass.states["sensor.progress"].state = "50";
      mockHass.states["sensor.background"].state = "green";

      // Override color resolution for this test
      color.resolveColor.mockImplementation((colorValue, defaultColor) => {
        if (colorValue === "sensor.background") return "green";
        return defaultColor;
      });

      icon_border_progress.call(mockThis, mockCard, mockHass);

      // Verify the background is applied (using deprecated config)
      expect(mockElement.style.background).toBe("green");
      // Also verify SVG helper was called
      expect(strokeDashProgress.createProgressBorder).toHaveBeenCalled();
    });
  });

  describe("condition handling", () => {
    it("should skip processing when condition is false", () => {
      mockThis.config.icon_border_progress[0].condition = [
        {
          condition: "state",
          entity: "sensor.enabled",
          state: "on",
        },
      ];

      condition.checkAllConditions.mockReturnValue(false);

      icon_border_progress.call(mockThis, mockCard, mockHass);

      // When condition is false, SVG helper should not be called (progress is cleaned up)
      expect(strokeDashProgress.createProgressBorder).not.toHaveBeenCalled();
      // But cleanup should be called
      expect(strokeDashProgress.removeProgressBorder).toHaveBeenCalledWith(mockElement);
    });

    it("should process when condition is true", () => {
      mockThis.config.icon_border_progress[0].condition = [
        {
          condition: "state",
          entity: "sensor.enabled",
          state: "on",
        },
      ];

      condition.checkAllConditions.mockReturnValue(true);

      icon_border_progress.call(mockThis, mockCard, mockHass);

      // When condition is true, SVG helper should be called to apply progress
      expect(strokeDashProgress.createProgressBorder).toHaveBeenCalledWith(
        mockElement,
        50, // progress value
        "rgb(255, 255, 0)", // color from stops
        expect.any(String), // remaining color
        0, // start angle
        expect.any(Object),
      );
    });
  });

  describe("effects handling", () => {
    it("should apply effects when configured", () => {
      mockThis.config.icon_border_progress[0].effects = [{ effect: "pulse", duration: 1000 }];

      icon_border_progress.call(mockThis, mockCard, mockHass);

      expect(effects.applyEffects).toHaveBeenCalledWith(mockElement, [{ effect: "pulse", duration: 1000 }]);
      // Also verify SVG helper was called (progress is applied)
      expect(strokeDashProgress.createProgressBorder).toHaveBeenCalled();
    });

    it("should handle missing effects gracefully", () => {
      delete mockThis.config.icon_border_progress[0].effects;

      expect(() => {
        icon_border_progress.call(mockThis, mockCard, mockHass);
      }).not.toThrow();

      // Should still apply progress, just without effects
      expect(strokeDashProgress.createProgressBorder).toHaveBeenCalled();
    });
  });

  describe("multiple button configurations", () => {
    it("should handle multiple button configurations", () => {
      const secondElement = document.createElement("div");
      secondElement.className = "bubble-secondary";
      mockCard.appendChild(secondElement);

      mockThis.config.icon_border_progress.push({
        button: "secondary",
        source: "sensor.progress",
        start: "sensor.start",
        end: "sensor.end",
      });

      icon_border_progress.call(mockThis, mockCard, mockHass);

      // Verify SVG helper was called for both elements
      expect(strokeDashProgress.createProgressBorder).toHaveBeenCalledTimes(2);
      // Check that both elements were processed
      expect(strokeDashProgress.createProgressBorder).toHaveBeenCalledWith(
        mockElement,
        expect.any(Number),
        expect.any(String),
        expect.any(String),
        expect.any(Number),
        expect.any(Object),
      );
      expect(strokeDashProgress.createProgressBorder).toHaveBeenCalledWith(
        secondElement,
        expect.any(Number),
        expect.any(String),
        expect.any(String),
        expect.any(Number),
        expect.any(Object),
      );
    });

    it("should handle missing button configuration gracefully", () => {
      mockConfig.icon_border_progress.push({
        // Missing button property
        source: "sensor.progress",
      });

      expect(() => {
        icon_border_progress.call(mockThis, mockCard, mockHass);
      }).not.toThrow();
    });
  });

  describe("edge cases", () => {
    it("should handle empty configuration array", () => {
      mockConfig.icon_border_progress = [];

      expect(() => {
        icon_border_progress.call(mockThis, mockCard, mockHass);
      }).not.toThrow();
    });

    it("should handle undefined configuration", () => {
      mockThis.config.icon_border_progress = undefined;

      expect(() => {
        icon_border_progress.call(mockThis, mockCard, mockHass);
      }).not.toThrow();
    });

    it("should handle elements with no initial background style", () => {
      // Setup - Element with undefined background style (not just empty string)
      delete mockElement.style.background; // Remove the property entirely

      icon_border_progress.call(mockThis, mockCard, mockHass);

      // Verify - Should store empty string as original background when background is undefined
      expect(mockElement.dataset.originalBackground).toBe(""); // The || "" fallback should be triggered
      expect(mockElement.style.background).toBeTruthy(); // Should have new background applied

      // Verify SVG helper was called
      expect(strokeDashProgress.createProgressBorder).toHaveBeenCalled();
    });

    it("should not overwrite already stored original background", () => {
      // Setup - Manually set the dataset property to simulate it already being set
      Object.defineProperty(mockElement.dataset, "originalBackground", {
        value: "rgb(255, 0, 0)",
        writable: true,
        configurable: true,
      });
      mockElement.style.background = "blue"; // Current background is different

      icon_border_progress.call(mockThis, mockCard, mockHass);

      // Verify - Should NOT overwrite the already stored original background (hits the false branch of line 22)
      expect(mockElement.dataset.originalBackground).toBe("rgb(255, 0, 0)"); // Should remain unchanged
      expect(mockElement.style.background).toBeTruthy(); // Should have new background applied

      // Verify SVG helper was called
      expect(strokeDashProgress.createProgressBorder).toHaveBeenCalled();
    });
  });

  describe("Border Radius Override Configuration", () => {
    it("should pass border_radius override to SVG helper when specified", () => {
      // Setup - Configuration with border_radius override
      mockThis.config.icon_border_progress = [
        {
          button: "main",
          source: "sensor.progress",
          border_radius: 15, // Override with 15px
        },
      ];

      mockHass.states["sensor.progress"] = { state: "50" };

      // Exercise - Execute the function
      icon_border_progress.call(mockThis, mockCard, mockHass);

      // Verify - SVG helper called with border_radius override
      expect(strokeDashProgress.createProgressBorder).toHaveBeenCalledWith(
        mockElement,
        50, // progress value
        "rgb(255, 255, 0)", // progress color
        "var(--dark-grey-color)", // remaining color
        0, // start angle (default)
        expect.objectContaining({
          strokeWidth: 3,
          animationDuration: 800,
          borderRadiusOverride: 15, // Should pass the override
        }),
      );
    });

    it("should pass string border_radius override to SVG helper", () => {
      // Setup - Configuration with string border_radius override
      mockThis.config.icon_border_progress = [
        {
          button: "main",
          source: "sensor.progress",
          border_radius: "50%", // Override with percentage
        },
      ];

      mockHass.states["sensor.progress"] = { state: "75" };

      // Exercise - Execute the function
      icon_border_progress.call(mockThis, mockCard, mockHass);

      // Verify - SVG helper called with string border_radius override
      expect(strokeDashProgress.createProgressBorder).toHaveBeenCalledWith(
        mockElement,
        75, // progress value
        "rgb(255, 255, 0)", // progress color
        "var(--dark-grey-color)", // remaining color
        0, // start angle (default)
        expect.objectContaining({
          strokeWidth: 3,
          animationDuration: 800,
          borderRadiusOverride: "50%", // Should pass the string override
        }),
      );
    });

    it("should not pass border_radius override when not specified", () => {
      // Setup - Configuration without border_radius override
      mockThis.config.icon_border_progress = [
        {
          button: "main",
          source: "sensor.progress",
        },
      ];

      mockHass.states["sensor.progress"] = { state: "25" };

      // Exercise - Execute the function
      icon_border_progress.call(mockThis, mockCard, mockHass);

      // Verify - SVG helper called without border_radius override (undefined)
      expect(strokeDashProgress.createProgressBorder).toHaveBeenCalledWith(
        mockElement,
        25, // progress value
        "rgb(255, 255, 0)", // progress color
        "var(--dark-grey-color)", // remaining color
        0, // start angle (default)
        expect.objectContaining({
          strokeWidth: 3,
          animationDuration: 800,
          borderRadiusOverride: undefined, // Should be undefined
        }),
      );
    });

    it("should handle border_radius zero value correctly", () => {
      // Setup - Configuration with border_radius 0 (force square)
      mockThis.config.icon_border_progress = [
        {
          button: "main",
          source: "sensor.progress",
          border_radius: 0, // Explicit zero
        },
      ];

      mockHass.states["sensor.progress"] = { state: "90" };

      // Exercise - Execute the function
      icon_border_progress.call(mockThis, mockCard, mockHass);

      // Verify - SVG helper called with 0 border_radius override
      expect(strokeDashProgress.createProgressBorder).toHaveBeenCalledWith(
        mockElement,
        90, // progress value
        "rgb(255, 255, 0)", // progress color
        "var(--dark-grey-color)", // remaining color
        0, // start angle (default)
        expect.objectContaining({
          strokeWidth: 3,
          animationDuration: 800,
          borderRadiusOverride: 0, // Should pass 0 explicitly
        }),
      );
    });

    it("should combine border_radius with start_angle", () => {
      // Setup - Configuration with both border_radius and start_angle
      mockThis.config.icon_border_progress = [
        {
          button: "main",
          source: "sensor.progress",
          border_radius: 12,
          start_angle: 90, // Right side start
        },
      ];

      mockHass.states["sensor.progress"] = { state: "60" };

      // Exercise - Execute the function
      icon_border_progress.call(mockThis, mockCard, mockHass);

      // Verify - SVG helper called with both overrides
      expect(strokeDashProgress.createProgressBorder).toHaveBeenCalledWith(
        mockElement,
        60, // progress value
        "rgb(255, 255, 0)", // progress color
        "var(--dark-grey-color)", // remaining color
        -90, // start angle override
        expect.objectContaining({
          strokeWidth: 3,
          animationDuration: 800,
          borderRadiusOverride: 12, // Should pass border radius override
        }),
      );
    });

    it("should handle multiple buttons with different border_radius values", () => {
      // Setup - Multiple configurations with different border_radius
      mockThis.config.icon_border_progress = [
        {
          button: "main",
          source: "sensor.cpu",
          border_radius: 8,
        },
        {
          button: "sub-button-1",
          source: "sensor.memory",
          border_radius: "50%",
        },
        {
          button: "sub-button-2",
          source: "sensor.disk",
          // No border_radius override
        },
      ];

      // Mock elements for different buttons
      const subButton1Element = document.createElement("div");
      const subButton2Element = document.createElement("div");

      mockCard.querySelector = jest.fn().mockImplementation((selector) => {
        if (selector === ".bubble-icon-container") return mockElement; // main
        if (selector === ".bubble-sub-button-1") return subButton1Element;
        if (selector === ".bubble-sub-button-2") return subButton2Element;
        return null;
      });

      mockHass.states["sensor.cpu"] = { state: "30" };
      mockHass.states["sensor.memory"] = { state: "70" };
      mockHass.states["sensor.disk"] = { state: "85" };

      // Exercise - Execute the function
      icon_border_progress.call(mockThis, mockCard, mockHass);

      // Verify - SVG helper called three times with different border_radius values
      expect(strokeDashProgress.createProgressBorder).toHaveBeenCalledTimes(3);

      // First call: main button with border_radius 8
      expect(strokeDashProgress.createProgressBorder).toHaveBeenNthCalledWith(
        1,
        mockElement,
        30,
        "rgb(255, 255, 0)",
        "var(--dark-grey-color)",
        0,
        expect.objectContaining({
          borderRadiusOverride: 8,
        }),
      );

      // Second call: sub-button-1 with border_radius "50%"
      expect(strokeDashProgress.createProgressBorder).toHaveBeenNthCalledWith(
        2,
        subButton1Element,
        70,
        "rgb(255, 255, 0)",
        "var(--dark-grey-color)",
        0,
        expect.objectContaining({
          borderRadiusOverride: "50%",
        }),
      );

      // Third call: sub-button-2 without border_radius override
      expect(strokeDashProgress.createProgressBorder).toHaveBeenNthCalledWith(
        3,
        subButton2Element,
        85,
        "rgb(255, 255, 0)",
        "var(--dark-grey-color)",
        0,
        expect.objectContaining({
          borderRadiusOverride: undefined,
        }),
      );
    });
  });
});
