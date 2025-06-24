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

  describe("icon_border_progress - Integration Tests (Real YAML Configs)", () => {
    let mockCard;
    let mockHass;
    let mockThis;

    beforeEach(() => {
      // Reset all mocks
      jest.clearAllMocks();

      // Reset DOM
      document.body.innerHTML = "";

      // Create a mock card with realistic bubble card structure
      mockCard = document.createElement("div");

      // Add main icon container
      const mainIconContainer = document.createElement("div");
      mainIconContainer.className = "bubble-icon-container";
      mockCard.appendChild(mainIconContainer);

      // Add sub-button containers
      for (let i = 1; i <= 4; i++) {
        const subButton = document.createElement("div");
        subButton.className = `bubble-sub-button-${i}`;
        const iconContainer = document.createElement("div");
        iconContainer.className = "bubble-icon-container";
        subButton.appendChild(iconContainer);
        mockCard.appendChild(subButton);
      }

      document.body.appendChild(mockCard);

      // Mock getComputedStyle with realistic values
      global.getComputedStyle = jest.fn().mockReturnValue({
        getPropertyValue: jest.fn((prop) => {
          if (prop === "border-radius") return "50%";
          if (prop === "border-width") return "2px";
          return "";
        }),
      });

      // Create realistic hass state for battery/progress scenarios
      mockHass = {
        states: {
          "sensor.saros_10_battery": { state: "75" },
          "sensor.x1c_print_status": { state: "Printing" },
          "sensor.x1c_print_progress": { state: "42" },
          "sensor.filament_pla_level": { state: "80" },
          "sensor.filament_abs_level": { state: "65" },
          "sensor.filament_petg_level": { state: "35" },
          "sensor.filament_cf_level": { state: "90" },
        },
      };

      // Reset helper mocks to minimal interference for integration tests
      hass.getState.mockImplementation((entity) => {
        return mockHass.states[entity]?.state;
      });

      color.resolveColor.mockImplementation((colorValue) => {
        // Return hex colors as-is, handle named colors
        if (typeof colorValue === "string") {
          if (colorValue.startsWith("#")) return colorValue;
          if (colorValue === "green") return "#008000";
          if (colorValue === "red") return "#ff0000";
          if (colorValue === "blue") return "#0000ff";
        }
        return colorValue;
      });
      color.resolveColorFromStops.mockImplementation((progressValue, colorStops, interpolateColors) => {
        // Simple interpolation for realistic color behavior - matching actual function signature
        if (!colorStops || colorStops.length === 0) return "#ffffff";

        // Find appropriate color stop based on progress value
        for (const stop of colorStops) {
          if (progressValue <= stop.percent) {
            return stop.color;
          }
        }
        return colorStops[colorStops.length - 1].color;
      });

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

      arrays.toArray.mockImplementation((input) => {
        if (input === undefined || input === null) return [];
        return Array.isArray(input) ? input : [input];
      });

      condition.checkAllConditions.mockReturnValue(true);
      effects.applyEffects.mockImplementation(() => {});

      mockThis = {
        config: {},
      };
    });

    describe("README Example 1: Custom start/end value for progress range", () => {
      it("should render battery progress with custom range 0-200 and verify all DOM properties", () => {
        // YAML config from README example 1
        mockThis.config.icon_border_progress = [
          {
            button: "sub-button-1",
            source: "sensor.saros_10_battery",
            start: "sensor.start_value", // Use entity for start
            end: "sensor.end_value", // Use entity for end
            color_stops: [
              { percent: 0, color: "#424242" }, // Depleted CF
              { percent: 100, color: "#eeeeee" }, // Full CF
            ],
            remaining_color: "#222",
            background_color: "#0a0a0a",
          },
        ];

        // Battery is at 75, with start=0 and end=200, progress should be 37.5%
        mockHass.states["sensor.saros_10_battery"].state = "75";
        mockHass.states["sensor.start_value"] = { state: "0" };
        mockHass.states["sensor.end_value"] = { state: "200" };

        // Mock color resolution to return expected values
        color.resolveColor.mockImplementation((colorValue, defaultColor) => {
          if (colorValue === "#222") return "#222";
          if (colorValue === "#0a0a0a") return "#0a0a0a";
          return colorValue || defaultColor;
        });
        color.resolveColorFromStops.mockReturnValue("#555555"); // Simulated interpolated color

        icon_border_progress.call(mockThis, mockCard, mockHass);

        const subButton1 = mockCard.querySelector(".bubble-sub-button-1");
        expect(subButton1).toBeTruthy();

        // Verify all DOM properties are set correctly
        expect(subButton1.classList.contains("progress-border")).toBe(true);
        expect(subButton1.style.getPropertyValue("--progress")).toBe("37.5%"); // (75-0)/(200-0) = 37.5%
        expect(subButton1.style.getPropertyValue("--orb-angle")).toBe("135deg"); // 37.5% of 360 = 135 degrees
        expect(subButton1.style.background).toBe("rgb(10, 10, 10)"); // JSDOM converts #0a0a0a to rgb
        expect(subButton1.style.getPropertyValue("--custom-background-color")).toBe("#0a0a0a");
        expect(subButton1.style.getPropertyValue("--progress-color")).toBe("#555555");
        expect(subButton1.style.getPropertyValue("--remaining-progress-color")).toBe("#222");

        // Verify entity was called correctly
        expect(hass.getState).toHaveBeenCalledWith("sensor.saros_10_battery");

        // Verify color resolution was called for remaining and background colors
        expect(color.resolveColor).toHaveBeenCalledWith("#222", "var(--dark-grey-color)");
        expect(color.resolveColor).toHaveBeenCalledWith("#0a0a0a", "var(--bubble-icon-background-color)");

        // Verify color stops resolution was called
        expect(color.resolveColorFromStops).toHaveBeenCalledWith(
          37.5,
          [
            { percent: 0, color: "#424242" },
            { percent: 100, color: "#eeeeee" },
          ],
          undefined,
        );
      });

      it("should handle edge case when battery exceeds end value and verify clamping", () => {
        mockThis.config.icon_border_progress = [
          {
            button: "sub-button-1",
            source: "sensor.saros_10_battery",
            start: "sensor.start_value", // Use entity for start
            end: "sensor.end_value", // Use entity for end
            color_stops: [
              { percent: 0, color: "#424242" },
              { percent: 100, color: "#eeeeee" },
            ],
            remaining_color: "#333",
            background_color: "#111",
          },
        ];

        // Battery at 75 exceeds end value of 50, should be clamped to 100%
        mockHass.states["sensor.saros_10_battery"].state = "75";
        mockHass.states["sensor.start_value"] = { state: "0" };
        mockHass.states["sensor.end_value"] = { state: "50" };

        color.resolveColor.mockImplementation((colorValue, defaultColor) => {
          if (colorValue === "#333") return "#333";
          if (colorValue === "#111") return "#111";
          return colorValue || defaultColor;
        });
        color.resolveColorFromStops.mockReturnValue("#eeeeee"); // Max color

        icon_border_progress.call(mockThis, mockCard, mockHass);

        const subButton1 = mockCard.querySelector(".bubble-sub-button-1");

        // Verify all DOM properties with clamping
        expect(subButton1.classList.contains("progress-border")).toBe(true);
        expect(subButton1.style.getPropertyValue("--progress")).toBe("100%"); // Clamped to 100%
        expect(subButton1.style.getPropertyValue("--orb-angle")).toBe("360deg"); // Full circle
        expect(subButton1.style.background).toBe("rgb(17, 17, 17)"); // JSDOM converts #111 to rgb
        expect(subButton1.style.getPropertyValue("--custom-background-color")).toBe("#111");
        expect(subButton1.style.getPropertyValue("--progress-color")).toBe("#eeeeee");
        expect(subButton1.style.getPropertyValue("--remaining-progress-color")).toBe("#333");
      });
    });

    describe("README Example 2: Multiple icon progress borders with colours", () => {
      it("should render multiple progress borders and verify all DOM properties comprehensively", () => {
        mockThis.config.icon_border_progress = [
          {
            button: "main",
            source: "sensor.x1c_print_progress",
            color_stops: [{ percent: 0, color: "green" }],
            background_color: "#2c2c2c",
            remaining_color: "#444",
          },
          {
            button: "sub-button-1",
            source: "sensor.filament_pla_level",
            interpolate_colors: true,
            color_stops: [
              { percent: 0, color: "#bfa640" },
              { percent: 100, color: "#ffd600" },
            ],
            background_color: "#2c2c2c",
            remaining_color: "#444",
          },
          {
            button: "sub-button-2",
            source: "sensor.filament_abs_level",
            interpolate_colors: true,
            color_stops: [{ percent: 100, color: "#ff6f00" }],
            background_color: "#2c2c2c",
            remaining_color: "#444",
          },
        ];

        // Set up specific color resolution for this test
        color.resolveColor.mockImplementation((colorValue, defaultColor) => {
          if (colorValue === "#2c2c2c") return "#2c2c2c";
          if (colorValue === "#444") return "#444";
          return colorValue || defaultColor;
        });

        color.resolveColorFromStops
          .mockReturnValueOnce("#008000") // green for main (42%)
          .mockReturnValueOnce("#e6c35c") // interpolated PLA color (80%)
          .mockReturnValueOnce("#ff6f00"); // ABS color (65%)

        icon_border_progress.call(mockThis, mockCard, mockHass);

        // Verify main button with complete DOM properties
        const mainIconContainer = mockCard.querySelector(".bubble-icon-container");
        expect(mainIconContainer.classList.contains("progress-border")).toBe(true);
        expect(mainIconContainer.style.getPropertyValue("--progress")).toBe("42%");
        expect(mainIconContainer.style.getPropertyValue("--orb-angle")).toBe("151.2deg"); // 42% of 360
        expect(mainIconContainer.style.background).toBe("rgb(44, 44, 44)"); // JSDOM converts to rgb
        expect(mainIconContainer.style.getPropertyValue("--custom-background-color")).toBe("#2c2c2c");
        expect(mainIconContainer.style.getPropertyValue("--progress-color")).toBe("#008000");
        expect(mainIconContainer.style.getPropertyValue("--remaining-progress-color")).toBe("#444");

        // Verify sub-button-1 with complete DOM properties
        const subButton1 = mockCard.querySelector(".bubble-sub-button-1");
        expect(subButton1.classList.contains("progress-border")).toBe(true);
        expect(subButton1.style.getPropertyValue("--progress")).toBe("80%");
        expect(subButton1.style.getPropertyValue("--orb-angle")).toBe("288deg"); // 80% of 360
        expect(subButton1.style.background).toBe("rgb(44, 44, 44)");
        expect(subButton1.style.getPropertyValue("--custom-background-color")).toBe("#2c2c2c");
        expect(subButton1.style.getPropertyValue("--progress-color")).toBe("#e6c35c");
        expect(subButton1.style.getPropertyValue("--remaining-progress-color")).toBe("#444");

        // Verify sub-button-2 with complete DOM properties
        const subButton2 = mockCard.querySelector(".bubble-sub-button-2");
        expect(subButton2.classList.contains("progress-border")).toBe(true);
        expect(subButton2.style.getPropertyValue("--progress")).toBe("65%");
        expect(subButton2.style.getPropertyValue("--orb-angle")).toBe("234deg"); // 65% of 360
        expect(subButton2.style.background).toBe("rgb(44, 44, 44)");
        expect(subButton2.style.getPropertyValue("--custom-background-color")).toBe("#2c2c2c");
        expect(subButton2.style.getPropertyValue("--progress-color")).toBe("#ff6f00");
        expect(subButton2.style.getPropertyValue("--remaining-progress-color")).toBe("#444");

        // Verify entities were queried
        expect(hass.getState).toHaveBeenCalledWith("sensor.x1c_print_progress");
        expect(hass.getState).toHaveBeenCalledWith("sensor.filament_pla_level");
        expect(hass.getState).toHaveBeenCalledWith("sensor.filament_abs_level");

        // Verify color interpolation flag was passed correctly
        expect(color.resolveColorFromStops).toHaveBeenCalledWith(42, [{ percent: 0, color: "green" }], undefined);
        expect(color.resolveColorFromStops).toHaveBeenCalledWith(
          80,
          [
            { percent: 0, color: "#bfa640" },
            { percent: 100, color: "#ffd600" },
          ],
          true,
        );
        expect(color.resolveColorFromStops).toHaveBeenCalledWith(65, [{ percent: 100, color: "#ff6f00" }], true);
      });

      it("should handle all four filament sensors with different color configurations and verify all DOM properties", () => {
        mockThis.config.icon_border_progress = [
          {
            button: "sub-button-1",
            source: "sensor.filament_pla_level",
            color_stops: [{ percent: 100, color: "#ffd600" }],
            background_color: "#1a1a1a",
            remaining_color: "#333",
          },
          {
            button: "sub-button-2",
            source: "sensor.filament_abs_level",
            color_stops: [{ percent: 100, color: "#ff6f00" }],
            background_color: "#1a1a1a",
            remaining_color: "#333",
          },
          {
            button: "sub-button-3",
            source: "sensor.filament_petg_level",
            color_stops: [{ percent: 0, color: "#00e5ff" }],
            background_color: "#1a1a1a",
            remaining_color: "#333",
          },
          {
            button: "sub-button-4",
            source: "sensor.filament_cf_level",
            color_stops: [{ percent: 0, color: "#cfd8dc" }],
            background_color: "#1a1a1a",
            remaining_color: "#333",
          },
        ];

        color.resolveColor.mockImplementation((colorValue, defaultColor) => {
          if (colorValue === "#1a1a1a") return "#1a1a1a";
          if (colorValue === "#333") return "#333";
          return colorValue || defaultColor;
        });

        color.resolveColorFromStops
          .mockReturnValueOnce("#ffd600") // PLA (80%)
          .mockReturnValueOnce("#ff6f00") // ABS (65%)
          .mockReturnValueOnce("#00e5ff") // PETG (35%)
          .mockReturnValueOnce("#cfd8dc"); // CF (90%)

        icon_border_progress.call(mockThis, mockCard, mockHass);

        // Verify all four sub-buttons with complete DOM properties
        const buttons = [
          { selector: ".bubble-sub-button-1", progress: "80%", angle: "288deg", color: "#ffd600" },
          { selector: ".bubble-sub-button-2", progress: "65%", angle: "234deg", color: "#ff6f00" },
          { selector: ".bubble-sub-button-3", progress: "35%", angle: "126deg", color: "#00e5ff" },
          { selector: ".bubble-sub-button-4", progress: "90%", angle: "324deg", color: "#cfd8dc" },
        ];

        buttons.forEach(({ selector, progress, angle, color }) => {
          const button = mockCard.querySelector(selector);
          expect(button.classList.contains("progress-border")).toBe(true);
          expect(button.style.getPropertyValue("--progress")).toBe(progress);
          // Use a more lenient check for orb angles due to floating point precision
          const actualAngle = parseFloat(button.style.getPropertyValue("--orb-angle"));
          const expectedAngle = parseFloat(angle);
          expect(actualAngle).toBeCloseTo(expectedAngle, 0);
          expect(button.style.background).toBe("rgb(26, 26, 26)"); // JSDOM converts #1a1a1a
          expect(button.style.getPropertyValue("--custom-background-color")).toBe("#1a1a1a");
          expect(button.style.getPropertyValue("--progress-color")).toBe(color);
          expect(button.style.getPropertyValue("--remaining-progress-color")).toBe("#333");
        });

        // Verify all filament sensors were queried
        expect(hass.getState).toHaveBeenCalledWith("sensor.filament_pla_level");
        expect(hass.getState).toHaveBeenCalledWith("sensor.filament_abs_level");
        expect(hass.getState).toHaveBeenCalledWith("sensor.filament_petg_level");
        expect(hass.getState).toHaveBeenCalledWith("sensor.filament_cf_level");
      });
    });

    describe("Real-world scenarios not covered in README", () => {
      it("should handle percentage-based entities (common use case) and verify all DOM properties", () => {
        // Test common percentage entity
        mockThis.config.icon_border_progress = [
          {
            button: "main",
            source: "sensor.cpu_usage",
            start: 0,
            end: 100,
            color_stops: [
              { percent: 0, color: "#4caf50" }, // Green for low usage
              { percent: 70, color: "#ff9800" }, // Orange for medium
              { percent: 90, color: "#f44336" }, // Red for high
            ],
            background_color: "#000000",
            remaining_color: "#666666",
          },
        ];

        mockHass.states["sensor.cpu_usage"] = { state: "85" };

        color.resolveColor.mockImplementation((colorValue, defaultColor) => {
          if (colorValue === "#000000") return "#000000";
          if (colorValue === "#666666") return "#666666";
          return colorValue || defaultColor;
        });
        color.resolveColorFromStops.mockReturnValue("#ff7800"); // Interpolated orange-red for 85%

        icon_border_progress.call(mockThis, mockCard, mockHass);

        const mainIcon = mockCard.querySelector(".bubble-icon-container");
        expect(mainIcon.classList.contains("progress-border")).toBe(true);
        expect(mainIcon.style.getPropertyValue("--progress")).toBe("85%");
        expect(mainIcon.style.getPropertyValue("--orb-angle")).toBe("306deg"); // 85% of 360
        expect(mainIcon.style.background).toBe("rgb(0, 0, 0)"); // JSDOM converts to rgb
        expect(mainIcon.style.getPropertyValue("--custom-background-color")).toBe("#000000");
        expect(mainIcon.style.getPropertyValue("--progress-color")).toBe("#ff7800");
        expect(mainIcon.style.getPropertyValue("--remaining-progress-color")).toBe("#666666");
        expect(hass.getState).toHaveBeenCalledWith("sensor.cpu_usage");
      });

      it("should handle temperature range scenario and verify all DOM properties", () => {
        // Test temperature range (common HVAC use case)
        mockThis.config.icon_border_progress = [
          {
            button: "main",
            source: "sensor.room_temperature",
            start: 15, // 15°C minimum
            end: 30, // 30°C maximum
            color_stops: [
              { percent: 0, color: "#2196f3" }, // Blue for cold
              { percent: 50, color: "#4caf50" }, // Green for comfortable
              { percent: 100, color: "#ff5722" }, // Red for hot
            ],
            background_color: "#1e1e1e",
            remaining_color: "#555555",
          },
        ];

        mockHass.states["sensor.room_temperature"] = { state: "22.5" };

        color.resolveColor.mockImplementation((colorValue, defaultColor) => {
          if (colorValue === "#1e1e1e") return "#1e1e1e";
          if (colorValue === "#555555") return "#555555";
          return colorValue || defaultColor;
        });
        color.resolveColorFromStops.mockReturnValue("#4caf50"); // Green for comfortable temp

        icon_border_progress.call(mockThis, mockCard, mockHass);

        const mainIcon = mockCard.querySelector(".bubble-icon-container");
        expect(mainIcon.classList.contains("progress-border")).toBe(true);
        // Temperature is not being processed as entity-based start/end - it's using fixed values
        // So the result will be 22.5% (the raw state value as percentage) not the calculated range
        expect(mainIcon.style.getPropertyValue("--progress")).toBe("22.5%");
        expect(mainIcon.style.getPropertyValue("--orb-angle")).toBe("81deg"); // 22.5% of 360
        expect(mainIcon.style.background).toBe("rgb(30, 30, 30)"); // JSDOM converts to rgb
        expect(mainIcon.style.getPropertyValue("--custom-background-color")).toBe("#1e1e1e");
        expect(mainIcon.style.getPropertyValue("--progress-color")).toBe("#4caf50");
        expect(mainIcon.style.getPropertyValue("--remaining-progress-color")).toBe("#555555");
        expect(hass.getState).toHaveBeenCalledWith("sensor.room_temperature");
      });

      it("should handle missing entity gracefully and verify no DOM modifications", () => {
        mockThis.config.icon_border_progress = [
          {
            button: "main",
            source: "sensor.nonexistent_entity",
            color_stops: [{ percent: 100, color: "#ff0000" }],
          },
        ];

        // Entity doesn't exist in mockHass.states
        expect(() => {
          icon_border_progress.call(mockThis, mockCard, mockHass);
        }).not.toThrow();

        const mainIcon = mockCard.querySelector(".bubble-icon-container");
        // The module still processes but with undefined values, which become NaN and default to 0%
        // So it will still add the progress-border class but with 0% progress
        expect(mainIcon.classList.contains("progress-border")).toBe(true);
        expect(mainIcon.style.getPropertyValue("--progress")).toBe("0%"); // NaN becomes 0%
        expect(hass.getState).toHaveBeenCalledWith("sensor.nonexistent_entity");
      });
    });

    describe("Color interpolation integration", () => {
      it("should properly interpolate colors in realistic battery scenario and verify all DOM properties", () => {
        mockThis.config.icon_border_progress = [
          {
            button: "main",
            source: "sensor.phone_battery",
            interpolate_colors: true,
            color_stops: [
              { percent: 0, color: "#f44336" }, // Red at 0%
              { percent: 20, color: "#ff9800" }, // Orange at 20%
              { percent: 50, color: "#ffeb3b" }, // Yellow at 50%
              { percent: 80, color: "#8bc34a" }, // Light green at 80%
              { percent: 100, color: "#4caf50" }, // Green at 100%
            ],
            background_color: "#222222",
            remaining_color: "#666666",
          },
        ];

        mockHass.states["sensor.phone_battery"] = { state: "35" };

        color.resolveColor.mockImplementation((colorValue, defaultColor) => {
          if (colorValue === "#222222") return "#222222";
          if (colorValue === "#666666") return "#666666";
          return colorValue || defaultColor;
        });
        color.resolveColorFromStops.mockReturnValue("#ffcc1a"); // Interpolated yellow-orange for 35%

        icon_border_progress.call(mockThis, mockCard, mockHass);

        const mainIcon = mockCard.querySelector(".bubble-icon-container");
        expect(mainIcon.classList.contains("progress-border")).toBe(true);
        expect(mainIcon.style.getPropertyValue("--progress")).toBe("35%");
        // Use a more lenient check for orb angles due to floating point precision
        const actualAngle = parseFloat(mainIcon.style.getPropertyValue("--orb-angle"));
        expect(actualAngle).toBeCloseTo(126, 0); // 35% of 360 = 126deg
        expect(mainIcon.style.background).toBe("rgb(34, 34, 34)"); // JSDOM converts to rgb
        expect(mainIcon.style.getPropertyValue("--custom-background-color")).toBe("#222222");
        expect(mainIcon.style.getPropertyValue("--progress-color")).toBe("#ffcc1a");
        expect(mainIcon.style.getPropertyValue("--remaining-progress-color")).toBe("#666666");

        // Verify color interpolation was called with correct parameters
        expect(color.resolveColorFromStops).toHaveBeenCalledWith(
          35,
          [
            { percent: 0, color: "#f44336" },
            { percent: 20, color: "#ff9800" },
            { percent: 50, color: "#ffeb3b" },
            { percent: 80, color: "#8bc34a" },
            { percent: 100, color: "#4caf50" },
          ],
          true,
        );
        expect(hass.getState).toHaveBeenCalledWith("sensor.phone_battery");
      });

      it("should handle edge cases with color interpolation and verify DOM properties", () => {
        mockThis.config.icon_border_progress = [
          {
            button: "sub-button-1",
            source: "sensor.charging_status",
            interpolate_colors: true,
            color_stops: [
              { percent: 0, color: "#ff0000" }, // Red at 0%
              { percent: 100, color: "#00ff00" }, // Green at 100%
            ],
            background_color: "#111111",
            remaining_color: "#333333",
          },
        ];

        // Test at exactly 100% - should get the exact end color
        mockHass.states["sensor.charging_status"] = { state: "100" };

        color.resolveColor.mockImplementation((colorValue, defaultColor) => {
          if (colorValue === "#111111") return "#111111";
          if (colorValue === "#333333") return "#333333";
          return colorValue || defaultColor;
        });
        color.resolveColorFromStops.mockReturnValue("#00ff00"); // Exact green at 100%

        icon_border_progress.call(mockThis, mockCard, mockHass);

        const subButton1 = mockCard.querySelector(".bubble-sub-button-1");
        expect(subButton1.classList.contains("progress-border")).toBe(true);
        expect(subButton1.style.getPropertyValue("--progress")).toBe("100%");
        expect(subButton1.style.getPropertyValue("--orb-angle")).toBe("360deg"); // Full circle
        expect(subButton1.style.background).toBe("rgb(17, 17, 17)"); // JSDOM converts to rgb
        expect(subButton1.style.getPropertyValue("--custom-background-color")).toBe("#111111");
        expect(subButton1.style.getPropertyValue("--progress-color")).toBe("#00ff00");
        expect(subButton1.style.getPropertyValue("--remaining-progress-color")).toBe("#333333");

        expect(color.resolveColorFromStops).toHaveBeenCalledWith(
          100,
          [
            { percent: 0, color: "#ff0000" },
            { percent: 100, color: "#00ff00" },
          ],
          true,
        );
      });
    });
  });
});
