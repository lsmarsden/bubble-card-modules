import { jest } from "@jest/globals";

// Mock all the helper dependencies first
jest.unstable_mockModule("../../helpers/condition.js", () => ({
  checkAllConditions: jest.fn(() => true),
}));

jest.unstable_mockModule("../../helpers/color.js", () => ({
  resolveColor: jest.fn((color, defaultColor) => color || defaultColor),
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

// Import the helpers to access mocked functions
const condition = await import("../../helpers/condition.js");
const color = await import("../../helpers/color.js");
const effects = await import("../../helpers/effects.js");
const hass = await import("../../helpers/hass.js");
const arrays = await import("../../helpers/arrays.js");
const config = await import("../../helpers/config.js");

const { icon_border_progress } = await import("../code.js");

describe("icon_border_progress", () => {
  let mockCard;
  let mockHass;
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

      expect(mockElement.classList.contains("progress-border")).toBe(true);
      expect(mockElement.style.getPropertyValue("--progress")).toBe("50%");
    });

    it("should find and modify main element (alias for main-button)", () => {
      mockThis.config.icon_border_progress[0].button = "main";

      icon_border_progress.call(mockThis, mockCard, mockHass);

      expect(mockElement.classList.contains("progress-border")).toBe(true);
    });

    it("should find custom button element", () => {
      mockThis.config.icon_border_progress[0].button = "custom-button";
      mockElement.className = "bubble-custom-button";

      icon_border_progress.call(mockThis, mockCard, mockHass);

      expect(mockElement.classList.contains("progress-border")).toBe(true);
    });

    it("should handle missing element gracefully", () => {
      mockThis.config.icon_border_progress[0].button = "nonexistent";

      expect(() => {
        icon_border_progress.call(mockThis, mockCard, mockHass);
      }).not.toThrow();
    });
  });

  describe("progress value calculation", () => {
    it("should calculate progress percentage correctly", () => {
      mockHass.states["sensor.progress"].state = "75";

      icon_border_progress.call(mockThis, mockCard, mockHass);

      expect(mockElement.style.getPropertyValue("--progress")).toBe("75%");
      expect(mockElement.style.getPropertyValue("--orb-angle")).toBe("270deg");
    });

    it("should handle custom start and end values", () => {
      mockHass.states["sensor.progress"].state = "150";
      mockHass.states["sensor.start"].state = "100";
      mockHass.states["sensor.end"].state = "200";

      icon_border_progress.call(mockThis, mockCard, mockHass);

      expect(mockElement.style.getPropertyValue("--progress")).toBe("50%");
    });

    it("should clamp values below start to start value", () => {
      mockHass.states["sensor.progress"].state = "-10";

      icon_border_progress.call(mockThis, mockCard, mockHass);

      expect(mockElement.style.getPropertyValue("--progress")).toBe("0%");
    });

    it("should clamp values above end to end value", () => {
      mockHass.states["sensor.progress"].state = "150";

      icon_border_progress.call(mockThis, mockCard, mockHass);

      expect(mockElement.style.getPropertyValue("--progress")).toBe("100%");
    });

    it("should handle NaN values by using start value", () => {
      mockHass.states["sensor.progress"].state = "invalid";

      icon_border_progress.call(mockThis, mockCard, mockHass);

      expect(mockElement.style.getPropertyValue("--progress")).toBe("0%");
    });

    it("should use default start (0) and end (100) for NaN values", () => {
      mockHass.states["sensor.start"].state = "invalid";
      mockHass.states["sensor.end"].state = "invalid";
      mockHass.states["sensor.progress"].state = "50";

      icon_border_progress.call(mockThis, mockCard, mockHass);

      expect(mockElement.style.getPropertyValue("--progress")).toBe("50%");
    });
  });

  describe("color handling", () => {
    it("should apply color from color stops", () => {
      mockHass.states["sensor.progress"].state = "25";

      icon_border_progress.call(mockThis, mockCard, mockHass);

      // Should interpolate between red (0%) and yellow (50%) for 25%
      const progressColor = mockElement.style.getPropertyValue("--progress-color");
      expect(progressColor).toBeTruthy();
    });

    it("should handle remaining_color configuration", () => {
      config.resolveConfig.mockReturnValue("sensor.background");
      color.resolveColor.mockReturnValue("rgba(100,100,100,0.5)");

      icon_border_progress.call(mockThis, mockCard, mockHass);

      expect(mockElement.style.getPropertyValue("--remaining-progress-color")).toBe("rgba(100,100,100,0.5)");
    });

    it("should handle background_color configuration", () => {
      config.resolveConfig.mockReturnValue("sensor.background");
      color.resolveColor.mockReturnValue("blue");

      icon_border_progress.call(mockThis, mockCard, mockHass);

      expect(mockElement.style.background).toBe("blue");
      expect(mockElement.style.getPropertyValue("--custom-background-color")).toBe("blue");
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
      delete mockThis.config.icon_border_progress[0].source;
      mockThis.config.icon_border_progress[0].entity = "sensor.progress";

      // Mock config.resolveConfig to return the entity value (since source is deleted, it should find entity)
      config.resolveConfig.mockReturnValue("sensor.progress");

      icon_border_progress.call(mockThis, mockCard, mockHass);

      expect(mockElement.style.getPropertyValue("--progress")).toBe("50%");
    });

    it("should support deprecated 'remainingcolor' instead of 'remaining_color'", () => {
      delete mockConfig.icon_border_progress[0].remaining_color;
      mockConfig.icon_border_progress[0].remainingcolor = "sensor.background";

      icon_border_progress.call(mockThis, mockCard, mockHass);

      expect(mockElement.style.getPropertyValue("--remaining-progress-color")).toBeTruthy();
    });

    it("should support deprecated 'backcolor' instead of 'background_color'", () => {
      delete mockConfig.icon_border_progress[0].background_color;
      mockConfig.icon_border_progress[0].backcolor = "sensor.background";

      icon_border_progress.call(mockThis, mockCard, mockHass);

      expect(mockElement.style.getPropertyValue("--custom-background-color")).toBeTruthy();
    });
  });

  describe("border radius handling", () => {
    it("should add has-bubble-border-radius class when border radius is set", () => {
      global.getComputedStyle.mockReturnValue({
        getPropertyValue: jest.fn().mockReturnValue("10px"),
      });

      icon_border_progress.call(mockThis, mockCard, mockHass);

      expect(mockElement.classList.contains("has-bubble-border-radius")).toBe(true);
    });

    it("should remove has-bubble-border-radius class when border radius is empty", () => {
      mockElement.classList.add("has-bubble-border-radius");

      global.getComputedStyle.mockReturnValue({
        getPropertyValue: jest.fn().mockReturnValue(""),
      });

      icon_border_progress.call(mockThis, mockCard, mockHass);

      expect(mockElement.classList.contains("has-bubble-border-radius")).toBe(false);
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

      expect(mockElement.classList.contains("progress-border")).toBe(false);
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

      expect(mockElement.classList.contains("progress-border")).toBe(true);
    });
  });

  describe("effects handling", () => {
    it("should apply effects when configured", () => {
      mockThis.config.icon_border_progress[0].effects = [{ effect: "pulse", duration: 1000 }];

      icon_border_progress.call(mockThis, mockCard, mockHass);

      expect(effects.applyEffects).toHaveBeenCalledWith(mockElement, [{ effect: "pulse", duration: 1000 }]);
      expect(mockElement.classList.contains("progress-border")).toBe(true);
    });

    it("should handle missing effects gracefully", () => {
      delete mockConfig.icon_border_progress[0].effects;

      expect(() => {
        icon_border_progress.call(mockThis, mockCard, mockHass);
      }).not.toThrow();
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

      expect(mockElement.classList.contains("progress-border")).toBe(true);
      expect(secondElement.classList.contains("progress-border")).toBe(true);
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
  });
});
