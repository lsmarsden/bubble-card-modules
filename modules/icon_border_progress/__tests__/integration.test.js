/**
 * Integration Tests for icon_border_progress module
 *
 * These tests include conditional display bugs (GitHub issue #1),
 * README examples, and real-world scenarios with minimal mocking.
 * Only config, hass state, and basic DOM are mocked.
 * Real condition evaluation and helper functions run naturally.
 */

import { jest } from "@jest/globals";
import { icon_border_progress } from "../code.js";

describe("icon_border_progress - Integration Tests", () => {
  let mockCard, mockThis, mockHass;

  beforeEach(() => {
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

    // Create realistic hass state with common entities for all test scenarios
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

    // Set up global hass context for helpers
    global.hass = mockHass;

    mockThis = {
      config: {},
    };

    jest.clearAllMocks();
  });

  afterEach(() => {
    delete global.hass;
    delete global.getComputedStyle;
  });

  // https://github.com/lsmarsden/bubble-card-modules/issues/1
  describe("Conditional Display Bug - GitHub issue #1", () => {
    it("should completely clean up DOM when condition becomes false", () => {
      // Setup - Real YAML configuration with actual condition
      mockThis.config.icon_border_progress = [
        {
          button: "main",
          source: "sensor.progress",
          condition: [
            {
              condition: "state",
              entity_id: "sensor.enable_progress",
              state: "on",
            },
          ],
        },
      ];
      mockHass.states["sensor.progress"] = { state: "75" };
      mockHass.states["sensor.enable_progress"] = { state: "on" };

      // Exercise - First call with condition true
      icon_border_progress.call(mockThis, mockCard, mockHass);

      // Verify - Styling is applied when condition is true
      const mainIcon = mockCard.querySelector(".bubble-icon-container");
      expect(mainIcon.classList.contains("progress-border")).toBe(true);
      expect(mainIcon.style.getPropertyValue("--progress")).toBe("75%");
      expect(mainIcon.style.getPropertyValue("--orb-angle")).toBe("270deg");

      // Setup - Change condition to false
      mockHass.states["sensor.enable_progress"] = { state: "off" };

      // Exercise - Second call with condition false
      icon_border_progress.call(mockThis, mockCard, mockHass);

      // Verify - THIS IS THE CORE BUG FIX - complete DOM cleanup
      expect(mainIcon.classList.contains("progress-border")).toBe(false);
      expect(mainIcon.classList.contains("has-bubble-border-radius")).toBe(false);
      expect(mainIcon.style.background).toBe("");
      expect(mainIcon.style.getPropertyValue("--custom-background-color")).toBe("");
      expect(mainIcon.style.getPropertyValue("--progress")).toBe("");
      expect(mainIcon.style.getPropertyValue("--orb-angle")).toBe("");
      expect(mainIcon.style.getPropertyValue("--progress-color")).toBe("");
      expect(mainIcon.style.getPropertyValue("--remaining-progress-color")).toBe("");
    });

    it("should handle rapid condition state changes correctly", () => {
      // Setup - Configuration with numeric condition
      mockThis.config.icon_border_progress = [
        {
          button: "main",
          source: "sensor.battery",
          condition: [
            {
              condition: "numeric_state",
              entity_id: "sensor.battery",
              above: 20,
            },
          ],
        },
      ];
      const scenarios = [
        { level: "85", shouldShow: true, description: "high battery (85%)" },
        { level: "15", shouldShow: false, description: "low battery (15%)" },
        { level: "90", shouldShow: true, description: "high battery again (90%)" },
      ];

      scenarios.forEach(({ level, shouldShow, description }) => {
        // Setup - Configure state
        mockHass.states["sensor.battery"] = { state: level };

        // Exercise - Run module function
        icon_border_progress.call(mockThis, mockCard, mockHass);

        // Verify - Check appropriate styling based on condition
        const mainIcon = mockCard.querySelector(".bubble-icon-container");
        if (shouldShow) {
          expect(mainIcon.classList.contains("progress-border")).toBe(true);
          expect(mainIcon.style.getPropertyValue("--progress")).toBe(`${level}%`);
        } else {
          expect(mainIcon.classList.contains("progress-border")).toBe(false);
          expect(mainIcon.classList.contains("has-bubble-border-radius")).toBe(false);
          expect(mainIcon.style.getPropertyValue("--progress")).toBe("");
        }
      });
    });

    it("should clean up DOM when condition uses AND logic", () => {
      // Setup - Multiple conditions configuration
      mockThis.config.icon_border_progress = [
        {
          button: "main",
          source: "sensor.cpu_usage",
          condition: [
            {
              condition: "state",
              entity_id: "binary_sensor.monitoring_enabled",
              state: "on",
            },
            {
              condition: "numeric_state",
              entity_id: "sensor.cpu_usage",
              below: 95,
            },
          ],
        },
      ];
      mockHass.states["sensor.cpu_usage"] = { state: "65" };
      mockHass.states["binary_sensor.monitoring_enabled"] = { state: "on" };

      // Exercise - Both conditions true, should show
      icon_border_progress.call(mockThis, mockCard, mockHass);

      // Verify - Progress border applied
      const mainIcon = mockCard.querySelector(".bubble-icon-container");
      expect(mainIcon.classList.contains("progress-border")).toBe(true);
      expect(mainIcon.style.getPropertyValue("--progress")).toBe("65%");
      expect(mainIcon.style.getPropertyValue("--orb-angle")).toBe("234deg"); // 65% of 360

      // Setup - Change first condition to false
      mockHass.states["binary_sensor.monitoring_enabled"] = { state: "off" };

      // Exercise - First condition false, should clean up
      icon_border_progress.call(mockThis, mockCard, mockHass);

      // Verify - DOM cleanup performed
      expect(mainIcon.classList.contains("has-bubble-border-radius")).toBe(false);
      expect(mainIcon.classList.contains("progress-border")).toBe(false);
      expect(mainIcon.style.getPropertyValue("--progress")).toBe("");
      expect(mainIcon.style.getPropertyValue("--orb-angle")).toBe("");
      expect(mainIcon.style.getPropertyValue("--progress-color")).toBe("");
      expect(mainIcon.style.getPropertyValue("--remaining-progress-color")).toBe("");
      expect(mainIcon.style.getPropertyValue("--custom-background-color")).toBe("");
    });

    it("should handle missing condition gracefully (always show)", () => {
      // Setup - No condition defined
      mockThis.config.icon_border_progress = [
        {
          button: "main",
          source: "sensor.progress",
          // No condition property
        },
      ];
      mockHass.states["sensor.progress"] = { state: "50" };

      // Exercise - Run module function
      icon_border_progress.call(mockThis, mockCard, mockHass);

      // Verify - Should apply styling since no condition means always show
      const mainIcon = mockCard.querySelector(".bubble-icon-container");
      expect(mainIcon.classList.contains("progress-border")).toBe(true);
      expect(mainIcon.style.getPropertyValue("--progress")).toBe("50%");
      expect(mainIcon.style.getPropertyValue("--orb-angle")).toBe("180deg"); // 50% of 360
    });

    it("should work with exact user configuration from GitHub issue", () => {
      // Setup - Exact configuration that reproduces the original bug
      mockThis.config = {
        icon_border_progress: [
          {
            button: "main",
            source: "sensor.fan_percentage", // Simplified entity name for testing
            condition: [
              {
                condition: "state",
                entity_id: "fan.mi_standing_fan",
                state: "on",
              },
            ],
          },
        ],
      };
      mockHass.states["fan.mi_standing_fan"] = { state: "on" };
      mockHass.states["sensor.fan_percentage"] = { state: "60" };

      // Exercise - Run with fan on
      icon_border_progress.call(mockThis, mockCard, mockHass);

      // Verify - Styling applied when fan is on
      const mainIcon = mockCard.querySelector(".bubble-icon-container");
      expect(mainIcon.classList.contains("progress-border")).toBe(true);
      expect(mainIcon.style.getPropertyValue("--progress")).toBe("60%");

      // Setup - Turn fan off
      mockHass.states["fan.mi_standing_fan"] = { state: "off" };

      // Exercise - Run with fan off
      icon_border_progress.call(mockThis, mockCard, mockHass);

      // Verify - Complete cleanup when fan is off (THE BUG FIX)
      expect(mainIcon.classList.contains("progress-border")).toBe(false);
      expect(mainIcon.style.getPropertyValue("--progress")).toBe("");
      expect(mainIcon.style.getPropertyValue("--orb-angle")).toBe("");
    });
  });

  describe("README Example Configurations", () => {
    it("should render battery progress with custom range 0-200", () => {
      // Setup - YAML config from README example 1
      mockThis.config.icon_border_progress = [
        {
          button: "main",
          source: "sensor.my_battery",
          start: 0,
          end: 200,
        },
      ];
      mockHass.states["sensor.my_battery"] = { state: "150" };

      // Exercise - Run module function
      icon_border_progress.call(mockThis, mockCard, mockHass);

      // Verify - Battery at 150 should be 75% of 0-200 range
      const mainIcon = mockCard.querySelector(".bubble-icon-container");
      expect(mainIcon.classList.contains("progress-border")).toBe(true);
      expect(mainIcon.style.getPropertyValue("--progress")).toBe("75%");
      expect(mainIcon.style.getPropertyValue("--orb-angle")).toBe("270deg"); // 75% of 360deg
    });

    it("should handle multiple progress borders with different sources", () => {
      // Setup - README example 2: multiple icons
      mockThis.config.icon_border_progress = [
        {
          button: "main",
          source: "sensor.print_progress",
        },
        {
          button: "sub-button-1",
          source: "sensor.filament_level",
        },
      ];
      mockHass.states["sensor.print_progress"] = { state: "42" };
      mockHass.states["sensor.filament_level"] = { state: "80" };

      // Exercise - Run module function
      icon_border_progress.call(mockThis, mockCard, mockHass);

      // Verify - Both buttons get progress borders
      const mainIcon = mockCard.querySelector(".bubble-icon-container");
      const subButton1 = mockCard.querySelector(".bubble-sub-button-1");

      expect(mainIcon.classList.contains("progress-border")).toBe(true);
      expect(subButton1.classList.contains("progress-border")).toBe(true);
      expect(mainIcon.style.getPropertyValue("--progress")).toBe("42%");
      expect(subButton1.style.getPropertyValue("--progress")).toBe("80%");
    });

    it("should handle percentage-based entities", () => {
      // Setup - Common percentage entity
      mockThis.config.icon_border_progress = [
        {
          button: "main",
          source: "sensor.cpu_usage",
          start: 0,
          end: 100,
        },
      ];
      mockHass.states["sensor.cpu_usage"] = { state: "85" };

      // Exercise - Run module function
      icon_border_progress.call(mockThis, mockCard, mockHass);

      // Verify - CPU usage displayed correctly
      const mainIcon = mockCard.querySelector(".bubble-icon-container");
      expect(mainIcon.classList.contains("progress-border")).toBe(true);
      expect(mainIcon.style.getPropertyValue("--progress")).toBe("85%");
      expect(mainIcon.style.getPropertyValue("--orb-angle")).toBe("306deg"); // 85% of 360
    });

    it("should handle missing entity gracefully", () => {
      // Setup - Configuration with non-existent entity
      mockThis.config.icon_border_progress = [
        {
          button: "main",
          source: "sensor.nonexistent_entity",
        },
      ];
      // Entity doesn't exist in mockHass.states

      // Exercise - Run module function (should not throw)
      expect(() => {
        icon_border_progress.call(mockThis, mockCard, mockHass);
      }).not.toThrow();

      // Verify - Module still processes but with 0% progress (NaN becomes 0%)
      const mainIcon = mockCard.querySelector(".bubble-icon-container");
      expect(mainIcon.classList.contains("progress-border")).toBe(true);
      expect(mainIcon.style.getPropertyValue("--progress")).toBe("0%");
    });
  });

  describe("README Example 1: Custom start/end value for progress range", () => {
    it("should render battery progress with custom range 0-200 and verify all DOM properties", () => {
      // Setup - Use exact YAML config from README example 1
      mockThis.config.icon_border_progress = [
        {
          button: "sub-button-1",
          source: "sensor.saros_10_battery",
          start: "sensor.start_value",
          end: "sensor.end_value",
          color_stops: [
            { percent: 0, color: "#424242" },
            { percent: 100, color: "#eeeeee" },
          ],
          remaining_color: "#222",
          background_color: "#0a0a0a",
        },
      ];

      // Battery is at 75, with start=0 and end=200, progress should be 37.5%
      mockHass.states["sensor.saros_10_battery"].state = "75";
      mockHass.states["sensor.start_value"] = { state: "0" };
      mockHass.states["sensor.end_value"] = { state: "200" };

      // Exercise - Execute the module function
      icon_border_progress.call(mockThis, mockCard, mockHass);

      // Verify - Check all DOM properties are set correctly
      const subButton1 = mockCard.querySelector(".bubble-sub-button-1");
      expect(subButton1).toBeTruthy();
      expect(subButton1.classList.contains("progress-border")).toBe(true);
      expect(subButton1.style.getPropertyValue("--progress")).toBe("37.5%");
      expect(subButton1.style.getPropertyValue("--orb-angle")).toBe("135deg");
      expect(subButton1.style.background).toBe("rgb(10, 10, 10)"); // JSDOM converts #0a0a0a to rgb
      expect(subButton1.style.getPropertyValue("--custom-background-color")).toBe("#0a0a0a");
      expect(subButton1.style.getPropertyValue("--remaining-progress-color")).toBe("#222");
    });

    it("should handle edge case when battery exceeds end value and verify clamping", () => {
      // Setup - Battery exceeds end value configuration
      mockThis.config.icon_border_progress = [
        {
          button: "sub-button-1",
          source: "sensor.saros_10_battery",
          start: "sensor.start_value",
          end: "sensor.end_value",
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

      // Exercise - Execute the module function
      icon_border_progress.call(mockThis, mockCard, mockHass);

      // Verify - Check clamping behavior and DOM properties
      const subButton1 = mockCard.querySelector(".bubble-sub-button-1");
      expect(subButton1.classList.contains("progress-border")).toBe(true);
      expect(subButton1.style.getPropertyValue("--progress")).toBe("100%"); // Clamped to 100%
      expect(subButton1.style.getPropertyValue("--orb-angle")).toBe("360deg"); // Full circle
      expect(subButton1.style.background).toBe("rgb(17, 17, 17)"); // JSDOM converts #111 to rgb
      expect(subButton1.style.getPropertyValue("--custom-background-color")).toBe("#111");
      expect(subButton1.style.getPropertyValue("--remaining-progress-color")).toBe("#333");
    });
  });

  describe("README Example 2: Multiple icon progress borders with colours", () => {
    it("should render multiple progress borders and verify all DOM properties comprehensively", () => {
      // Setup - Use exact multi-button configuration from README
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

      // Exercise - Execute the module function
      icon_border_progress.call(mockThis, mockCard, mockHass);

      // Verify - Check main button with complete DOM properties
      const mainIconContainer = mockCard.querySelector(".bubble-icon-container");
      expect(mainIconContainer.classList.contains("progress-border")).toBe(true);
      expect(mainIconContainer.style.getPropertyValue("--progress")).toBe("42%");
      expect(mainIconContainer.style.getPropertyValue("--orb-angle")).toBe("151.2deg");
      expect(mainIconContainer.style.background).toBe("rgb(44, 44, 44)"); // JSDOM converts to rgb
      expect(mainIconContainer.style.getPropertyValue("--custom-background-color")).toBe("#2c2c2c");
      expect(mainIconContainer.style.getPropertyValue("--remaining-progress-color")).toBe("#444");

      // Verify sub-button-1 with complete DOM properties
      const subButton1 = mockCard.querySelector(".bubble-sub-button-1");
      expect(subButton1.classList.contains("progress-border")).toBe(true);
      expect(subButton1.style.getPropertyValue("--progress")).toBe("80%");
      expect(subButton1.style.getPropertyValue("--orb-angle")).toBe("288deg");
      expect(subButton1.style.background).toBe("rgb(44, 44, 44)");
      expect(subButton1.style.getPropertyValue("--custom-background-color")).toBe("#2c2c2c");
      expect(subButton1.style.getPropertyValue("--remaining-progress-color")).toBe("#444");

      // Verify sub-button-2 with complete DOM properties
      const subButton2 = mockCard.querySelector(".bubble-sub-button-2");
      expect(subButton2.classList.contains("progress-border")).toBe(true);
      expect(subButton2.style.getPropertyValue("--progress")).toBe("65%");
      expect(subButton2.style.getPropertyValue("--orb-angle")).toBe("234deg");
      expect(subButton2.style.background).toBe("rgb(44, 44, 44)");
      expect(subButton2.style.getPropertyValue("--custom-background-color")).toBe("#2c2c2c");
      expect(subButton2.style.getPropertyValue("--remaining-progress-color")).toBe("#444");
    });

    it("should handle all four filament sensors with different color configurations", () => {
      // Setup - Four filament sensor configuration
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

      // Exercise - Execute the module function
      icon_border_progress.call(mockThis, mockCard, mockHass);

      // Verify - Check all four sub-buttons with complete DOM properties
      const buttons = [
        { selector: ".bubble-sub-button-1", progress: "80%", angle: "288deg" },
        { selector: ".bubble-sub-button-2", progress: "65%", angle: "234deg" },
        { selector: ".bubble-sub-button-3", progress: "35%", angle: "126deg" },
        { selector: ".bubble-sub-button-4", progress: "90%", angle: "324deg" },
      ];

      buttons.forEach(({ selector, progress, angle }) => {
        const button = mockCard.querySelector(selector);
        expect(button.classList.contains("progress-border")).toBe(true);
        expect(button.style.getPropertyValue("--progress")).toBe(progress);
        const actualAngle = parseFloat(button.style.getPropertyValue("--orb-angle"));
        const expectedAngle = parseFloat(angle);
        expect(actualAngle).toBeCloseTo(expectedAngle, 0);
        expect(button.style.background).toBe("rgb(26, 26, 26)"); // JSDOM converts #1a1a1a
        expect(button.style.getPropertyValue("--custom-background-color")).toBe("#1a1a1a");
        expect(button.style.getPropertyValue("--remaining-progress-color")).toBe("#333");
      });
    });
  });

  describe("Real-world scenarios not covered in README", () => {
    it("should handle percentage-based entities and verify all DOM properties", () => {
      // Setup - Common percentage entity configuration
      mockThis.config.icon_border_progress = [
        {
          button: "main",
          source: "sensor.cpu_usage",
          start: 0,
          end: 100,
          color_stops: [
            { percent: 0, color: "#4caf50" },
            { percent: 70, color: "#ff9800" },
            { percent: 90, color: "#f44336" },
          ],
          background_color: "#000000",
          remaining_color: "#666666",
        },
      ];

      mockHass.states["sensor.cpu_usage"] = { state: "85" };

      // Exercise - Execute the module function
      icon_border_progress.call(mockThis, mockCard, mockHass);

      // Verify - Check DOM properties for high CPU usage
      const mainIcon = mockCard.querySelector(".bubble-icon-container");
      expect(mainIcon.classList.contains("progress-border")).toBe(true);
      expect(mainIcon.style.getPropertyValue("--progress")).toBe("85%");
      expect(mainIcon.style.getPropertyValue("--orb-angle")).toBe("306deg");
      expect(mainIcon.style.background).toBe("rgb(0, 0, 0)"); // JSDOM converts to rgb
      expect(mainIcon.style.getPropertyValue("--custom-background-color")).toBe("#000000");
      expect(mainIcon.style.getPropertyValue("--remaining-progress-color")).toBe("#666666");
    });

    it("should handle temperature range scenario", () => {
      // Setup - Temperature range (HVAC use case)
      mockThis.config.icon_border_progress = [
        {
          button: "main",
          source: "sensor.room_temperature",
          start: 15,
          end: 30,
          color_stops: [
            { percent: 0, color: "#2196f3" },
            { percent: 50, color: "#4caf50" },
            { percent: 100, color: "#ff5722" },
          ],
          background_color: "#1e1e1e",
          remaining_color: "#555555",
        },
      ];

      mockHass.states["sensor.room_temperature"] = { state: "22.5" };

      // Exercise - Execute the module function
      icon_border_progress.call(mockThis, mockCard, mockHass);

      // Verify - Check temperature progress display
      const mainIcon = mockCard.querySelector(".bubble-icon-container");
      expect(mainIcon.classList.contains("progress-border")).toBe(true);
      expect(mainIcon.style.getPropertyValue("--progress")).toBe("50%"); // (22.5-15)/(30-15) = 7.5/15 = 50%
      expect(mainIcon.style.getPropertyValue("--orb-angle")).toBe("180deg"); // 50% of 360 = 180deg
      expect(mainIcon.style.background).toBe("rgb(30, 30, 30)"); // JSDOM converts to rgb
      expect(mainIcon.style.getPropertyValue("--custom-background-color")).toBe("#1e1e1e");
      expect(mainIcon.style.getPropertyValue("--remaining-progress-color")).toBe("#555555");
    });

    it("should handle missing entity gracefully (additional scenario)", () => {
      // Setup - Non-existent entity configuration
      mockThis.config.icon_border_progress = [
        {
          button: "main",
          source: "sensor.another_nonexistent_entity",
          color_stops: [{ percent: 100, color: "#ff0000" }],
        },
      ];

      // Exercise - Execute the module function (should not throw)
      expect(() => {
        icon_border_progress.call(mockThis, mockCard, mockHass);
      }).not.toThrow();

      // Verify - Check graceful handling with fallback values
      const mainIcon = mockCard.querySelector(".bubble-icon-container");
      expect(mainIcon.classList.contains("progress-border")).toBe(true);
      expect(mainIcon.style.getPropertyValue("--progress")).toBe("0%"); // NaN becomes 0%
    });
  });

  describe("Color interpolation integration", () => {
    it("should properly interpolate colors in realistic battery scenario", () => {
      // Setup - Battery with color interpolation configuration
      mockThis.config.icon_border_progress = [
        {
          button: "main",
          source: "sensor.phone_battery",
          interpolate_colors: true,
          color_stops: [
            { percent: 0, color: "#f44336" },
            { percent: 20, color: "#ff9800" },
            { percent: 50, color: "#ffeb3b" },
            { percent: 80, color: "#8bc34a" },
            { percent: 100, color: "#4caf50" },
          ],
          background_color: "#222222",
          remaining_color: "#666666",
        },
      ];

      mockHass.states["sensor.phone_battery"] = { state: "35" };

      // Exercise - Execute the module function
      icon_border_progress.call(mockThis, mockCard, mockHass);

      // Verify - Check color interpolation behavior
      const mainIcon = mockCard.querySelector(".bubble-icon-container");
      expect(mainIcon.classList.contains("progress-border")).toBe(true);
      expect(mainIcon.style.getPropertyValue("--progress")).toBe("35%");
      const actualAngle = parseFloat(mainIcon.style.getPropertyValue("--orb-angle"));
      expect(actualAngle).toBeCloseTo(126, 0); // 35% of 360 = 126deg
      expect(mainIcon.style.background).toBe("rgb(34, 34, 34)"); // JSDOM converts to rgb
      expect(mainIcon.style.getPropertyValue("--custom-background-color")).toBe("#222222");
      expect(mainIcon.style.getPropertyValue("--remaining-progress-color")).toBe("#666666");
    });

    it("should handle edge cases with color interpolation", () => {
      // Setup - Simple two-color interpolation at 100%
      mockThis.config.icon_border_progress = [
        {
          button: "sub-button-1",
          source: "sensor.charging_status",
          interpolate_colors: true,
          color_stops: [
            { percent: 0, color: "#ff0000" },
            { percent: 100, color: "#00ff00" },
          ],
          background_color: "#111111",
          remaining_color: "#333333",
        },
      ];

      mockHass.states["sensor.charging_status"] = { state: "100" };

      // Exercise - Execute the module function
      icon_border_progress.call(mockThis, mockCard, mockHass);

      // Verify - Check exact 100% behavior
      const subButton1 = mockCard.querySelector(".bubble-sub-button-1");
      expect(subButton1.classList.contains("progress-border")).toBe(true);
      expect(subButton1.style.getPropertyValue("--progress")).toBe("100%");
      expect(subButton1.style.getPropertyValue("--orb-angle")).toBe("360deg"); // Full circle
      expect(subButton1.style.background).toBe("rgb(17, 17, 17)"); // JSDOM converts to rgb
      expect(subButton1.style.getPropertyValue("--custom-background-color")).toBe("#111111");
      expect(subButton1.style.getPropertyValue("--remaining-progress-color")).toBe("#333333");
    });
  });

  describe("Background preservation functionality", () => {
    it("should store and restore original background when condition changes", () => {
      // Setup - Element with existing background styling
      const mainIcon = mockCard.querySelector(".bubble-icon-container");

      mockThis.config.icon_border_progress = [
        {
          button: "main",
          source: "sensor.progress",
          background_color: "#222222",
          condition: [
            {
              condition: "state",
              entity_id: "sensor.enable_progress",
              state: "on",
            },
          ],
        },
      ];

      mockHass.states["sensor.progress"] = { state: "75" };
      mockHass.states["sensor.enable_progress"] = { state: "on" };

      // Set background BEFORE first module run so it gets stored
      mainIcon.style.background = "linear-gradient(45deg, #ff0000, #00ff00)";
      const originalBackgroundValue = mainIcon.style.background; // Capture what JSDOM actually stores

      // Exercise - First run with condition true (should store original and apply new background)
      icon_border_progress.call(mockThis, mockCard, mockHass);

      // Verify - Original background stored and module background applied
      expect(mainIcon.dataset.originalBackground).toBe(originalBackgroundValue);
      expect(mainIcon.style.background).toBe("rgb(34, 34, 34)"); // JSDOM converts #222222 to rgb
      expect(mainIcon.classList.contains("progress-border")).toBe(true);

      // Setup - Change condition to false
      mockHass.states["sensor.enable_progress"] = { state: "off" };

      // Exercise - Second run with condition false (should restore original background)
      icon_border_progress.call(mockThis, mockCard, mockHass);

      // Verify - Original background restored and progress styling removed
      expect(mainIcon.style.background).toBe(originalBackgroundValue);
      expect(mainIcon.classList.contains("progress-border")).toBe(false);
      expect(mainIcon.dataset.originalBackground).toBe(originalBackgroundValue); // Still stored
    });

    it("should handle elements with no initial background", () => {
      // Setup - Element with no background
      const mainIcon = mockCard.querySelector(".bubble-icon-container");
      // Background is already empty by default

      mockThis.config.icon_border_progress = [
        {
          button: "main",
          source: "sensor.progress",
          background_color: "#333333",
          condition: [
            {
              condition: "state",
              entity_id: "sensor.enable_progress",
              state: "on",
            },
          ],
        },
      ];

      mockHass.states["sensor.progress"] = { state: "50" };
      mockHass.states["sensor.enable_progress"] = { state: "on" };

      // Exercise - Apply styling to element with no initial background
      icon_border_progress.call(mockThis, mockCard, mockHass);

      // Verify - Empty string stored as original, module background applied
      expect(mainIcon.dataset.originalBackground).toBe("");
      expect(mainIcon.style.background).toBe("rgb(51, 51, 51)"); // JSDOM converts #333333
      expect(mainIcon.classList.contains("progress-border")).toBe(true);

      // Setup - Change condition to false
      mockHass.states["sensor.enable_progress"] = { state: "off" };

      // Exercise - Remove styling
      icon_border_progress.call(mockThis, mockCard, mockHass);

      // Verify - Original empty background restored
      expect(mainIcon.style.background).toBe("");
      expect(mainIcon.classList.contains("progress-border")).toBe(false);
    });

    it("should not re-store original background on subsequent runs", () => {
      // Setup - Element with background
      const mainIcon = mockCard.querySelector(".bubble-icon-container");

      mockThis.config.icon_border_progress = [
        {
          button: "main",
          source: "sensor.progress",
          background_color: "#444444",
          condition: [
            {
              condition: "state",
              entity_id: "sensor.enable_progress",
              state: "on",
            },
          ],
        },
      ];

      mockHass.states["sensor.progress"] = { state: "25" };
      mockHass.states["sensor.enable_progress"] = { state: "on" };

      // Set background before first run
      mainIcon.style.background = "rgba(255, 0, 0, 0.5)";

      // Exercise - First run (should store original)
      icon_border_progress.call(mockThis, mockCard, mockHass);

      // Verify - Original stored
      expect(mainIcon.dataset.originalBackground).toBe("rgba(255, 0, 0, 0.5)");

      // Exercise - Multiple subsequent runs with condition true
      icon_border_progress.call(mockThis, mockCard, mockHass);
      icon_border_progress.call(mockThis, mockCard, mockHass);

      // Verify - Original background not overwritten
      expect(mainIcon.dataset.originalBackground).toBe("rgba(255, 0, 0, 0.5)");
      expect(mainIcon.style.background).toBe("rgb(68, 68, 68)"); // Module background still applied
    });
  });
});
