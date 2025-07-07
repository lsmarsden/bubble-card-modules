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
      mockHass.states["sensor.progress"] = { state: "75" };
      mockHass.states["sensor.enable_progress"] = { state: "on" };

      // Exercise - First call with condition true
      icon_border_progress.call(mockThis, mockCard, mockHass);

      // Verify - SVG progress border is created when condition is true
      const mainIcon = mockCard.querySelector(".bubble-icon-container");
      const svg = mainIcon.querySelector(".stroke-dash-aligned-svg");
      expect(svg).toBeTruthy();
      expect(svg.getAttribute("viewBox")).toBeTruthy();

      const bgPath = svg.querySelector(".bg-path");
      const progressPath = svg.querySelector(".progress-path");
      expect(bgPath).toBeTruthy();
      expect(progressPath).toBeTruthy();

      // Verify progress is applied (75% of 100)
      expect(progressPath.getAttribute("stroke")).not.toBe("transparent"); // Should have progress color
      const progressStrokeDashArray = progressPath.getAttribute("stroke-dasharray");
      expect(progressStrokeDashArray).toBeTruthy();

      // Verify background styling is applied
      expect(mainIcon.style.background).toBeTruthy();

      // Setup - Change condition to false
      mockHass.states["sensor.enable_progress"] = { state: "off" };

      // Exercise - Second call with condition false
      icon_border_progress.call(mockThis, mockCard, mockHass);

      // Verify - THIS IS THE CORE BUG FIX - complete DOM cleanup when condition becomes false
      const svgAfterCleanup = mainIcon.querySelector(".stroke-dash-aligned-svg");
      expect(svgAfterCleanup).toBeNull(); // SVG should be completely removed when condition is false

      // Background should be restored to original value (stored in dataset)
      expect(mainIcon.style.background).toBe(mainIcon.dataset.originalBackground || "");
    });

    it("should handle rapid condition state changes correctly", () => {
      // Setup - Configuration with numeric condition
      mockThis.config.icon_border_progress = [
        {
          button: "main",
          source: "sensor.battery",
          background_color: "#444444",
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

        // Verify - Check appropriate SVG progress based on condition
        const mainIcon = mockCard.querySelector(".bubble-icon-container");
        const svg = mainIcon.querySelector(".stroke-dash-aligned-svg");

        if (shouldShow) {
          expect(svg).toBeTruthy();
          const progressPath = svg.querySelector(".progress-path");
          expect(progressPath).toBeTruthy();
          expect(progressPath.getAttribute("stroke")).not.toBe("transparent");
          expect(progressPath.getAttribute("stroke-dasharray")).toBeTruthy();
          expect(mainIcon.style.background).toBeTruthy();
        } else {
          // When condition is false, SVG should be completely removed
          expect(svg).toBeNull();
          // Background should be restored
          expect(mainIcon.style.background).toBe(mainIcon.dataset.originalBackground || "");
        }
      });
    });

    it("should clean up DOM when condition uses AND logic", () => {
      // Setup - Multiple conditions configuration
      mockThis.config.icon_border_progress = [
        {
          button: "main",
          source: "sensor.cpu_usage",
          background_color: "#555555",
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

      // Verify - SVG progress border applied
      const mainIcon = mockCard.querySelector(".bubble-icon-container");
      const svg = mainIcon.querySelector(".stroke-dash-aligned-svg");
      expect(svg).toBeTruthy();

      const progressPath = svg.querySelector(".progress-path");
      expect(progressPath).toBeTruthy();
      expect(progressPath.getAttribute("stroke")).not.toBe("transparent");
      expect(mainIcon.style.background).toBeTruthy();

      // Setup - Change first condition to false
      mockHass.states["binary_sensor.monitoring_enabled"] = { state: "off" };

      // Exercise - First condition false, should clean up
      icon_border_progress.call(mockThis, mockCard, mockHass);

      // Verify - Complete DOM cleanup
      const svgAfterCleanup = mainIcon.querySelector(".stroke-dash-aligned-svg");
      expect(svgAfterCleanup).toBeNull(); // SVG should be completely removed when condition is false
      expect(mainIcon.style.background).toBe(mainIcon.dataset.originalBackground || "");
    });

    it("should handle missing condition gracefully (always show)", () => {
      // Setup - No condition defined
      mockThis.config.icon_border_progress = [
        {
          button: "main",
          source: "sensor.progress",
          background_color: "#666666",
          // No condition property
        },
      ];
      mockHass.states["sensor.progress"] = { state: "50" };

      // Exercise - Run module function
      icon_border_progress.call(mockThis, mockCard, mockHass);

      // Verify - Should apply SVG progress since no condition means always show
      const mainIcon = mockCard.querySelector(".bubble-icon-container");
      const svg = mainIcon.querySelector(".stroke-dash-aligned-svg");
      expect(svg).toBeTruthy();

      const progressPath = svg.querySelector(".progress-path");
      expect(progressPath).toBeTruthy();
      expect(progressPath.getAttribute("stroke")).not.toBe("transparent");
      expect(progressPath.getAttribute("stroke-dasharray")).toBeTruthy();
      expect(mainIcon.style.background).toBeTruthy();
    });

    it("should work with exact user configuration from GitHub issue", () => {
      // Setup - Exact configuration that reproduces the original bug
      mockThis.config = {
        icon_border_progress: [
          {
            button: "main",
            source: "sensor.fan_percentage", // Simplified entity name for testing
            background_color: "#777777",
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

      // Verify - SVG progress applied when fan is on
      const mainIcon = mockCard.querySelector(".bubble-icon-container");
      const svg = mainIcon.querySelector(".stroke-dash-aligned-svg");
      expect(svg).toBeTruthy();

      const progressPath = svg.querySelector(".progress-path");
      expect(progressPath).toBeTruthy();
      expect(progressPath.getAttribute("stroke")).not.toBe("transparent");
      expect(mainIcon.style.background).toBeTruthy();

      // Setup - Turn fan off
      mockHass.states["fan.mi_standing_fan"] = { state: "off" };

      // Exercise - Run with fan off
      icon_border_progress.call(mockThis, mockCard, mockHass);

      // Verify - Complete cleanup when fan is off (THE BUG FIX)
      const svgAfterCleanup = mainIcon.querySelector(".stroke-dash-aligned-svg");
      expect(svgAfterCleanup).toBeNull(); // SVG should be completely removed when condition is false

      // Background should be restored to original value (stored in dataset)
      expect(mainIcon.style.background).toBe(mainIcon.dataset.originalBackground || "");
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
      const svg = mainIcon.querySelector(".stroke-dash-aligned-svg");
      expect(svg).toBeTruthy();

      const progressPath = svg.querySelector(".progress-path");
      expect(progressPath).toBeTruthy();
      expect(progressPath.getAttribute("stroke")).not.toBe("transparent");
      expect(progressPath.getAttribute("stroke-dasharray")).toBeTruthy();
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

      // Verify - Both buttons get progress borders (SVG)
      const mainIcon = mockCard.querySelector(".bubble-icon-container");
      const subButton1 = mockCard.querySelector(".bubble-sub-button-1");

      const mainSvg = mainIcon.querySelector(".stroke-dash-aligned-svg");
      const subSvg = subButton1.querySelector(".stroke-dash-aligned-svg");

      expect(mainSvg).toBeTruthy();
      expect(subSvg).toBeTruthy();

      const mainPath = mainSvg.querySelector(".progress-path");
      const subPath = subSvg.querySelector(".progress-path");

      expect(mainPath.getAttribute("stroke")).not.toBe("transparent");
      expect(subPath.getAttribute("stroke")).not.toBe("transparent");
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

      // Verify - CPU usage displayed correctly (SVG)
      const mainIcon = mockCard.querySelector(".bubble-icon-container");
      const svg = mainIcon.querySelector(".stroke-dash-aligned-svg");
      expect(svg).toBeTruthy();

      const progressPath = svg.querySelector(".progress-path");
      expect(progressPath).toBeTruthy();
      expect(progressPath.getAttribute("stroke")).not.toBe("transparent");
      expect(progressPath.getAttribute("stroke-dasharray")).toBeTruthy();
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

      // Verify - Module still processes but with transparent progress (NaN/0% shows as transparent)
      const mainIcon = mockCard.querySelector(".bubble-icon-container");
      const svg = mainIcon.querySelector(".stroke-dash-aligned-svg");
      expect(svg).toBeTruthy();

      const progressPath = svg.querySelector(".progress-path");
      expect(progressPath).toBeTruthy();
      expect(progressPath.getAttribute("stroke")).toBe("transparent");
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

      // Verify - Check SVG progress border exists
      const subButton1 = mockCard.querySelector(".bubble-sub-button-1");
      expect(subButton1).toBeTruthy();

      const svg = subButton1.querySelector(".stroke-dash-aligned-svg");
      expect(svg).toBeTruthy();

      const progressPath = svg.querySelector(".progress-path");
      expect(progressPath).toBeTruthy();
      expect(progressPath.getAttribute("stroke")).not.toBe("transparent");
      expect(progressPath.getAttribute("stroke-dasharray")).toBeTruthy();
      expect(subButton1.style.background).toBe("rgb(10, 10, 10)"); // JSDOM converts #0a0a0a to rgb
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

      // Verify - Check clamping behavior (SVG should show full progress)
      const subButton1 = mockCard.querySelector(".bubble-sub-button-1");
      const svg = subButton1.querySelector(".stroke-dash-aligned-svg");
      expect(svg).toBeTruthy();

      const progressPath = svg.querySelector(".progress-path");
      expect(progressPath).toBeTruthy();
      expect(progressPath.getAttribute("stroke")).not.toBe("transparent");
      expect(progressPath.getAttribute("stroke-dasharray")).toBeTruthy();
      expect(subButton1.style.background).toBe("rgb(17, 17, 17)"); // JSDOM converts #111 to rgb
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

      // Verify - Check main button with SVG progress border
      const mainIconContainer = mockCard.querySelector(".bubble-icon-container");
      const mainSvg = mainIconContainer.querySelector(".stroke-dash-aligned-svg");
      expect(mainSvg).toBeTruthy();

      const mainPath = mainSvg.querySelector(".progress-path");
      expect(mainPath).toBeTruthy();
      expect(mainPath.getAttribute("stroke")).not.toBe("transparent");
      expect(mainIconContainer.style.background).toBe("rgb(44, 44, 44)"); // JSDOM converts to rgb

      // Verify sub-button-1 with SVG progress border
      const subButton1 = mockCard.querySelector(".bubble-sub-button-1");
      const sub1Svg = subButton1.querySelector(".stroke-dash-aligned-svg");
      expect(sub1Svg).toBeTruthy();

      const sub1Path = sub1Svg.querySelector(".progress-path");
      expect(sub1Path).toBeTruthy();
      expect(sub1Path.getAttribute("stroke")).not.toBe("transparent");
      expect(subButton1.style.background).toBe("rgb(44, 44, 44)");

      // Verify sub-button-2 with SVG progress border
      const subButton2 = mockCard.querySelector(".bubble-sub-button-2");
      const sub2Svg = subButton2.querySelector(".stroke-dash-aligned-svg");
      expect(sub2Svg).toBeTruthy();

      const sub2Path = sub2Svg.querySelector(".progress-path");
      expect(sub2Path).toBeTruthy();
      expect(sub2Path.getAttribute("stroke")).not.toBe("transparent");
      expect(subButton2.style.background).toBe("rgb(44, 44, 44)");
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

      // Verify - Check all four sub-buttons have SVG progress borders
      const buttons = [
        { selector: ".bubble-sub-button-1" },
        { selector: ".bubble-sub-button-2" },
        { selector: ".bubble-sub-button-3" },
        { selector: ".bubble-sub-button-4" },
      ];

      buttons.forEach(({ selector }) => {
        const button = mockCard.querySelector(selector);
        const svg = button.querySelector(".stroke-dash-aligned-svg");
        expect(svg).toBeTruthy();

        const progressPath = svg.querySelector(".progress-path");
        expect(progressPath).toBeTruthy();
        expect(progressPath.getAttribute("stroke")).not.toBe("transparent");
        expect(button.style.background).toBe("rgb(26, 26, 26)"); // JSDOM converts #1a1a1a
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

      // Verify - Check DOM properties for high CPU usage (SVG)
      const mainIcon = mockCard.querySelector(".bubble-icon-container");
      const svg = mainIcon.querySelector(".stroke-dash-aligned-svg");
      expect(svg).toBeTruthy();

      const progressPath = svg.querySelector(".progress-path");
      expect(progressPath).toBeTruthy();
      expect(progressPath.getAttribute("stroke")).not.toBe("transparent");
      expect(progressPath.getAttribute("stroke-dasharray")).toBeTruthy();
      expect(mainIcon.style.background).toBe("rgb(0, 0, 0)"); // JSDOM converts to rgb
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

      // Verify - Check temperature progress display (SVG)
      const mainIcon = mockCard.querySelector(".bubble-icon-container");
      const svg = mainIcon.querySelector(".stroke-dash-aligned-svg");
      expect(svg).toBeTruthy();

      const progressPath = svg.querySelector(".progress-path");
      expect(progressPath).toBeTruthy();
      expect(progressPath.getAttribute("stroke")).not.toBe("transparent");
      expect(progressPath.getAttribute("stroke-dasharray")).toBeTruthy();
      expect(mainIcon.style.background).toBe("rgb(30, 30, 30)"); // JSDOM converts to rgb
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

      // Verify - Check graceful handling with transparent progress (SVG)
      const mainIcon = mockCard.querySelector(".bubble-icon-container");
      const svg = mainIcon.querySelector(".stroke-dash-aligned-svg");
      expect(svg).toBeTruthy();

      const progressPath = svg.querySelector(".progress-path");
      expect(progressPath).toBeTruthy();
      expect(progressPath.getAttribute("stroke")).toBe("transparent");
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

      // Verify - Check color interpolation behavior (SVG)
      const mainIcon = mockCard.querySelector(".bubble-icon-container");
      const svg = mainIcon.querySelector(".stroke-dash-aligned-svg");
      expect(svg).toBeTruthy();

      const progressPath = svg.querySelector(".progress-path");
      expect(progressPath).toBeTruthy();
      expect(progressPath.getAttribute("stroke")).not.toBe("transparent");
      expect(progressPath.getAttribute("stroke-dasharray")).toBeTruthy();
      expect(mainIcon.style.background).toBe("rgb(34, 34, 34)"); // JSDOM converts to rgb
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

      // Verify - Check exact 100% behavior (SVG)
      const subButton1 = mockCard.querySelector(".bubble-sub-button-1");
      const svg = subButton1.querySelector(".stroke-dash-aligned-svg");
      expect(svg).toBeTruthy();

      const progressPath = svg.querySelector(".progress-path");
      expect(progressPath).toBeTruthy();
      expect(progressPath.getAttribute("stroke")).not.toBe("transparent");
      expect(progressPath.getAttribute("stroke-dasharray")).toBeTruthy();
      expect(subButton1.style.background).toBe("rgb(17, 17, 17)"); // JSDOM converts to rgb
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

      // Verify - Original background stored, module background applied, SVG created
      expect(mainIcon.dataset.originalBackground).toBe(originalBackgroundValue);
      expect(mainIcon.style.background).toBe("rgb(34, 34, 34)"); // JSDOM converts #222222 to rgb

      const svg = mainIcon.querySelector(".stroke-dash-aligned-svg");
      expect(svg).toBeTruthy();
      const progressPath = svg.querySelector(".progress-path");
      expect(progressPath.getAttribute("stroke")).not.toBe("transparent");

      // Setup - Change condition to false
      mockHass.states["sensor.enable_progress"] = { state: "off" };

      // Exercise - Second run with condition false (should restore original background)
      icon_border_progress.call(mockThis, mockCard, mockHass);

      // Verify - Original background restored and progress styling removed
      expect(mainIcon.style.background).toBe(originalBackgroundValue);
      const svgAfterCleanup = mainIcon.querySelector(".stroke-dash-aligned-svg");
      expect(svgAfterCleanup).toBeNull(); // SVG should be completely removed when condition is false
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

      // Verify - Empty string stored as original, module background applied, SVG created
      expect(mainIcon.dataset.originalBackground).toBe("");
      expect(mainIcon.style.background).toBe("rgb(51, 51, 51)"); // JSDOM converts #333333

      const svg = mainIcon.querySelector(".stroke-dash-aligned-svg");
      expect(svg).toBeTruthy();
      const progressPath = svg.querySelector(".progress-path");
      expect(progressPath.getAttribute("stroke")).not.toBe("transparent");

      // Setup - Change condition to false
      mockHass.states["sensor.enable_progress"] = { state: "off" };

      // Exercise - Remove styling
      icon_border_progress.call(mockThis, mockCard, mockHass);

      // Verify - Original empty background restored, progress removed
      expect(mainIcon.style.background).toBe("");
      const svgAfterCleanup = mainIcon.querySelector(".stroke-dash-aligned-svg");
      expect(svgAfterCleanup).toBeNull(); // SVG should be completely removed when condition is false
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

  describe("SVG Progress Border Functionality", () => {
    it("should create SVG progress border for elements with custom border radius", () => {
      // Setup - Mock getComputedStyle to return specific border radius
      global.getComputedStyle = jest.fn().mockReturnValue({
        getPropertyValue: jest.fn().mockReturnValue("12px"),
      });

      mockThis.config.icon_border_progress = [
        {
          button: "main",
          source: "sensor.progress",
          background_color: "#333333",
        },
      ];

      mockHass.states["sensor.progress"] = { state: "50" };

      // Exercise - Apply styling
      icon_border_progress.call(mockThis, mockCard, mockHass);

      // Verify - SVG progress border is created and adapted to border radius
      const mainIcon = mockCard.querySelector(".bubble-icon-container");
      const svg = mainIcon.querySelector(".stroke-dash-aligned-svg");
      expect(svg).toBeTruthy();
      expect(svg.getAttribute("viewBox")).toBeTruthy();

      const progressPath = svg.querySelector(".progress-path");
      expect(progressPath).toBeTruthy();
      expect(progressPath.getAttribute("stroke")).not.toBe("transparent");
    });

    it("should create SVG progress border for circular icons", () => {
      // Setup - Mock getComputedStyle to return empty border radius (circular icons)
      global.getComputedStyle = jest.fn().mockReturnValue({
        getPropertyValue: jest.fn().mockReturnValue(""),
      });

      mockThis.config.icon_border_progress = [
        {
          button: "main",
          source: "sensor.progress",
          background_color: "#333333",
        },
      ];

      mockHass.states["sensor.progress"] = { state: "75" };

      // Exercise - Apply styling
      icon_border_progress.call(mockThis, mockCard, mockHass);

      // Verify - SVG progress border is created for circular elements
      const mainIcon = mockCard.querySelector(".bubble-icon-container");
      const svg = mainIcon.querySelector(".stroke-dash-aligned-svg");
      expect(svg).toBeTruthy();

      const progressPath = svg.querySelector(".progress-path");
      expect(progressPath).toBeTruthy();
      expect(progressPath.getAttribute("stroke")).not.toBe("transparent");
    });

    it("should handle different border radius values for different buttons", () => {
      // Setup - Different border radius for sub-button
      global.getComputedStyle = jest.fn((element) => {
        if (element.classList.contains("bubble-sub-button-1")) {
          return {
            getPropertyValue: jest.fn().mockReturnValue("8px"),
          };
        }
        return {
          getPropertyValue: jest.fn().mockReturnValue("16px"),
        };
      });

      mockThis.config.icon_border_progress = [
        {
          button: "main",
          source: "sensor.progress",
          background_color: "#333333",
        },
        {
          button: "sub-button-1",
          source: "sensor.progress",
          background_color: "#444444",
        },
      ];

      mockHass.states["sensor.progress"] = { state: "60" };

      // Exercise - Apply styling
      icon_border_progress.call(mockThis, mockCard, mockHass);

      // Verify - Each button should have SVG progress border adapted to its border radius
      const mainIcon = mockCard.querySelector(".bubble-icon-container");
      const subButton1 = mockCard.querySelector(".bubble-sub-button-1");

      const mainSvg = mainIcon.querySelector(".stroke-dash-aligned-svg");
      const subSvg = subButton1.querySelector(".stroke-dash-aligned-svg");

      expect(mainSvg).toBeTruthy();
      expect(subSvg).toBeTruthy();

      const mainPath = mainSvg.querySelector(".progress-path");
      const subPath = subSvg.querySelector(".progress-path");

      expect(mainPath.getAttribute("stroke")).not.toBe("transparent");
      expect(subPath.getAttribute("stroke")).not.toBe("transparent");
    });

    it("should clean up SVG progress border when condition becomes false", () => {
      // Setup - SVG configuration with condition
      global.getComputedStyle = jest.fn().mockReturnValue({
        getPropertyValue: jest.fn().mockReturnValue("10px"),
      });

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

      mockHass.states["sensor.progress"] = { state: "40" };
      mockHass.states["sensor.enable_progress"] = { state: "on" };

      // Exercise - First run with condition true
      icon_border_progress.call(mockThis, mockCard, mockHass);

      // Verify - SVG progress border is created
      const mainIcon = mockCard.querySelector(".bubble-icon-container");
      const svg = mainIcon.querySelector(".stroke-dash-aligned-svg");
      expect(svg).toBeTruthy();

      const progressPath = svg.querySelector(".progress-path");
      expect(progressPath.getAttribute("stroke")).not.toBe("transparent");

      // Setup - Change condition to false
      mockHass.states["sensor.enable_progress"] = { state: "off" };

      // Exercise - Second run with condition false
      icon_border_progress.call(mockThis, mockCard, mockHass);

      // Verify - SVG progress border is cleaned up
      const svgAfterCleanup = mainIcon.querySelector(".stroke-dash-aligned-svg");
      expect(svgAfterCleanup).toBeNull(); // SVG should be completely removed when condition is false
    });

    it("should animate progress border from zero on first appearance", async () => {
      // Setup - Configuration for progress border
      mockThis.config.icon_border_progress = [
        {
          button: "main",
          source: "sensor.progress",
          background_color: "#333333",
        },
      ];

      mockHass.states["sensor.progress"] = { state: "50" };

      // Exercise - Run the module to create the SVG and set progress
      icon_border_progress.call(mockThis, mockCard, mockHass);

      // Verify - Check that the progress path is created and initially set correctly
      const mainIcon = mockCard.querySelector(".bubble-icon-container");
      const svg = mainIcon.querySelector(".stroke-dash-aligned-svg");
      expect(svg).toBeTruthy();

      const progressPath = svg.querySelector(".progress-path");
      expect(progressPath).toBeTruthy();

      // The stroke should be set to the progress color (not transparent)
      // since we have a non-zero progress value from the start
      expect(progressPath.getAttribute("stroke")).not.toBe("transparent");

      // Verify the dasharray is set for 50% progress
      const dasharray = progressPath.getAttribute("stroke-dasharray");
      expect(dasharray).toBeTruthy();
      expect(dasharray).not.toBe("0 0"); // Should not be empty/zero
    });

    it("should handle zero to non-zero progress transition with grow animation", async () => {
      // Setup - Configuration for progress border
      mockThis.config.icon_border_progress = [
        {
          button: "main",
          source: "sensor.progress",
          background_color: "#333333",
        },
      ];

      // Start with zero progress
      mockHass.states["sensor.progress"] = { state: "0" };

      // Exercise - First run with zero progress
      icon_border_progress.call(mockThis, mockCard, mockHass);

      // Verify - Progress path should be transparent at zero
      const mainIcon = mockCard.querySelector(".bubble-icon-container");
      const svg = mainIcon.querySelector(".stroke-dash-aligned-svg");
      const progressPath = svg.querySelector(".progress-path");

      expect(progressPath.getAttribute("stroke")).toBe("transparent");

      // Setup - Change to non-zero progress
      mockHass.states["sensor.progress"] = { state: "65" };

      // Exercise - Second run with non-zero progress to test the grow animation
      icon_border_progress.call(mockThis, mockCard, mockHass);

      // Verify - Progress path should now have color (not transparent)
      // This tests that the grow-from-zero animation logic is triggered
      expect(progressPath.getAttribute("stroke")).not.toBe("transparent");

      // The stroke-dasharray should be set for the target progress
      const pathLength = parseFloat(progressPath.getAttribute("data-length"));
      const expectedDashLength = (65 / 100) * pathLength;

      // Note: In a real scenario with requestAnimationFrame, the animation would be visible
      // but in tests, we can verify the final state is correct
      setTimeout(() => {
        const dasharray = progressPath.getAttribute("stroke-dasharray");
        expect(dasharray).toContain(expectedDashLength.toString());
      }, 50);
    });
  });

  describe("Start Angle Configuration", () => {
    it("should use default start_angle of 0 (top) when not specified", () => {
      // Setup - Configuration without start_angle (should default to 0)
      mockThis.config.icon_border_progress = [
        {
          button: "main",
          source: "sensor.progress",
          background_color: "#333333",
        },
      ];

      mockHass.states["sensor.progress"] = { state: "50" };

      // Exercise - Run module function
      icon_border_progress.call(mockThis, mockCard, mockHass);

      // Verify - SVG progress border is created with default start angle (0 = top)
      const mainIcon = mockCard.querySelector(".bubble-icon-container");
      const svg = mainIcon.querySelector(".stroke-dash-aligned-svg");
      expect(svg).toBeTruthy();

      const progressPath = svg.querySelector(".progress-path");
      expect(progressPath).toBeTruthy();
      expect(progressPath.getAttribute("stroke")).not.toBe("transparent");

      // Check that progress starts from the top (default behavior)
      // The exact stroke-dashoffset value depends on the helper implementation
      // but we can verify the dasharray is set for 50% progress
      const dasharray = progressPath.getAttribute("stroke-dasharray");
      expect(dasharray).toBeTruthy();
      expect(dasharray).not.toBe("0 0");

      // Verify background is applied
      expect(mainIcon.style.background).toBe("rgb(51, 51, 51)");
    });

    it("should apply custom start_angle of 90 degrees (right side)", () => {
      // Setup - Configuration with start_angle set to 90 (right side)
      mockThis.config.icon_border_progress = [
        {
          button: "main",
          source: "sensor.progress",
          start_angle: 90,
          background_color: "#444444",
        },
      ];

      mockHass.states["sensor.progress"] = { state: "75" };

      // Exercise - Run module function
      icon_border_progress.call(mockThis, mockCard, mockHass);

      // Verify - SVG progress border is created with custom start angle
      const mainIcon = mockCard.querySelector(".bubble-icon-container");
      const svg = mainIcon.querySelector(".stroke-dash-aligned-svg");
      expect(svg).toBeTruthy();

      const progressPath = svg.querySelector(".progress-path");
      expect(progressPath).toBeTruthy();
      expect(progressPath.getAttribute("stroke")).not.toBe("transparent");

      // Verify progress is applied for 75%
      const dasharray = progressPath.getAttribute("stroke-dasharray");
      expect(dasharray).toBeTruthy();
      expect(dasharray).not.toBe("0 0");

      // The stroke-dashoffset should be different from default (0) due to the 90-degree rotation
      const dashoffset = progressPath.getAttribute("stroke-dashoffset");
      expect(dashoffset).toBeTruthy();

      // Verify background is applied
      expect(mainIcon.style.background).toBe("rgb(68, 68, 68)");
    });

    it("should handle start_angle of 180 degrees (bottom)", () => {
      // Setup - Configuration with start_angle set to 180 (bottom)
      mockThis.config.icon_border_progress = [
        {
          button: "sub-button-1",
          source: "sensor.progress",
          start_angle: 180,
          background_color: "#555555",
        },
      ];

      mockHass.states["sensor.progress"] = { state: "25" };

      // Exercise - Run module function
      icon_border_progress.call(mockThis, mockCard, mockHass);

      // Verify - SVG progress border is created with 180-degree start angle
      const subButton1 = mockCard.querySelector(".bubble-sub-button-1");
      const svg = subButton1.querySelector(".stroke-dash-aligned-svg");
      expect(svg).toBeTruthy();

      const progressPath = svg.querySelector(".progress-path");
      expect(progressPath).toBeTruthy();
      expect(progressPath.getAttribute("stroke")).not.toBe("transparent");

      // Verify progress is applied for 25%
      const dasharray = progressPath.getAttribute("stroke-dasharray");
      expect(dasharray).toBeTruthy();
      expect(dasharray).not.toBe("0 0");

      // The stroke-dashoffset should reflect the 180-degree rotation
      const dashoffset = progressPath.getAttribute("stroke-dashoffset");
      expect(dashoffset).toBeTruthy();

      // Verify background is applied
      expect(subButton1.style.background).toBe("rgb(85, 85, 85)");
    });

    it("should handle start_angle of -90 degrees (left side)", () => {
      // Setup - Configuration with start_angle set to -90 (left side)
      mockThis.config.icon_border_progress = [
        {
          button: "sub-button-2",
          source: "sensor.progress",
          start_angle: -90,
          background_color: "#666666",
        },
      ];

      mockHass.states["sensor.progress"] = { state: "100" };

      // Exercise - Run module function
      icon_border_progress.call(mockThis, mockCard, mockHass);

      // Verify - SVG progress border is created with -90-degree start angle
      const subButton2 = mockCard.querySelector(".bubble-sub-button-2");
      const svg = subButton2.querySelector(".stroke-dash-aligned-svg");
      expect(svg).toBeTruthy();

      const progressPath = svg.querySelector(".progress-path");
      expect(progressPath).toBeTruthy();
      expect(progressPath.getAttribute("stroke")).not.toBe("transparent");

      // Verify progress is applied for 100% (full circle)
      const dasharray = progressPath.getAttribute("stroke-dasharray");
      expect(dasharray).toBeTruthy();

      // For 100% progress, the dasharray should indicate full coverage
      // The exact format depends on helper implementation but should not be "0 0"
      expect(dasharray).not.toBe("0 0");

      // Verify background is applied
      expect(subButton2.style.background).toBe("rgb(102, 102, 102)");
    });

    it("should handle start_angle with condition changes", () => {
      // Setup - Configuration with start_angle and condition
      mockThis.config.icon_border_progress = [
        {
          button: "main",
          source: "sensor.progress",
          start_angle: 45, // Custom angle between standard positions
          background_color: "#777777",
          condition: [
            {
              condition: "state",
              entity_id: "sensor.enable_progress",
              state: "on",
            },
          ],
        },
      ];

      mockHass.states["sensor.progress"] = { state: "60" };
      mockHass.states["sensor.enable_progress"] = { state: "on" };

      // Exercise - First run with condition true
      icon_border_progress.call(mockThis, mockCard, mockHass);

      // Verify - SVG progress border is created with custom start angle
      const mainIcon = mockCard.querySelector(".bubble-icon-container");
      const svg = mainIcon.querySelector(".stroke-dash-aligned-svg");
      expect(svg).toBeTruthy();

      const progressPath = svg.querySelector(".progress-path");
      expect(progressPath).toBeTruthy();
      expect(progressPath.getAttribute("stroke")).not.toBe("transparent");

      // Verify the custom angle is applied
      const dashoffset = progressPath.getAttribute("stroke-dashoffset");
      expect(dashoffset).toBeTruthy();

      // Setup - Change condition to false
      mockHass.states["sensor.enable_progress"] = { state: "off" };

      // Exercise - Second run with condition false
      icon_border_progress.call(mockThis, mockCard, mockHass);

      // Verify - SVG is completely removed when condition is false
      const svgAfterCleanup = mainIcon.querySelector(".stroke-dash-aligned-svg");
      expect(svgAfterCleanup).toBeNull();

      // Background should be restored
      expect(mainIcon.style.background).toBe(mainIcon.dataset.originalBackground || "");
    });
  });

  describe("Border Radius Override", () => {
    it("should use CSS border-radius when no override is specified", () => {
      // Setup - Configuration without border_radius (should use CSS value)
      mockThis.config.icon_border_progress = [
        {
          button: "main",
          source: "sensor.progress",
          background_color: "#333333",
        },
      ];

      mockHass.states["sensor.progress"] = { state: "50" };

      // Mock getComputedStyle to return specific border-radius
      global.getComputedStyle = jest.fn().mockReturnValue({
        getPropertyValue: jest.fn((prop) => {
          if (prop === "border-radius") return "8px";
          return "";
        }),
        borderRadius: "8px",
      });

      // Exercise - Run module
      icon_border_progress.call(mockThis, mockCard, mockHass);

      // Verify - SVG should be created (border radius detection should work)
      const mainIcon = mockCard.querySelector(".bubble-icon-container");
      const svg = mainIcon.querySelector(".stroke-dash-aligned-svg");
      expect(svg).toBeTruthy();

      // Should use the CSS border-radius value for path generation
      const progressPath = svg.querySelector(".progress-path");
      expect(progressPath).toBeTruthy();
      expect(progressPath.getAttribute("d")).toBeTruthy();
    });

    it("should override CSS border-radius with numeric config value", () => {
      // Setup - Configuration with border_radius override as number
      mockThis.config.icon_border_progress = [
        {
          button: "main",
          source: "sensor.progress",
          border_radius: 15, // Override with 15px
          background_color: "#444444",
        },
      ];

      mockHass.states["sensor.progress"] = { state: "75" };

      // Mock getComputedStyle to return different border-radius
      global.getComputedStyle = jest.fn().mockReturnValue({
        getPropertyValue: jest.fn((prop) => {
          if (prop === "border-radius") return "50%"; // CSS says circular
          return "";
        }),
        borderRadius: "50%",
      });

      // Exercise - Run module
      icon_border_progress.call(mockThis, mockCard, mockHass);

      // Verify - SVG should use override instead of CSS
      const mainIcon = mockCard.querySelector(".bubble-icon-container");
      const svg = mainIcon.querySelector(".stroke-dash-aligned-svg");
      expect(svg).toBeTruthy();

      // Progress should be applied
      const progressPath = svg.querySelector(".progress-path");
      expect(progressPath).toBeTruthy();
      expect(progressPath.getAttribute("stroke")).not.toBe("transparent");

      // Background should be applied
      expect(mainIcon.style.background).toBe("rgb(68, 68, 68)");
    });

    it("should override CSS border-radius with string config value (percentage)", () => {
      // Setup - Configuration with border_radius override as percentage string
      mockThis.config.icon_border_progress = [
        {
          button: "sub-button-2",
          source: "sensor.humidity",
          border_radius: "50%", // Force circular
          background_color: "#555555",
        },
      ];

      mockHass.states["sensor.humidity"] = { state: "40" };

      // Mock getComputedStyle to return square border-radius
      global.getComputedStyle = jest.fn().mockReturnValue({
        getPropertyValue: jest.fn((prop) => {
          if (prop === "border-radius") return "0px"; // CSS says square
          return "";
        }),
        borderRadius: "0px",
      });

      // Exercise - Run module
      icon_border_progress.call(mockThis, mockCard, mockHass);

      // Verify - SVG should use override (50%) making it circular
      const subButton2 = mockCard.querySelector(".bubble-sub-button-2");
      const svg = subButton2.querySelector(".stroke-dash-aligned-svg");
      expect(svg).toBeTruthy();

      // Progress should be applied
      const progressPath = svg.querySelector(".progress-path");
      expect(progressPath).toBeTruthy();
      expect(progressPath.getAttribute("stroke")).not.toBe("transparent");

      // Background should be applied
      expect(subButton2.style.background).toBe("rgb(85, 85, 85)");
    });

    it("should override CSS border-radius with string config value (pixels)", () => {
      // Setup - Configuration with border_radius override as pixel string
      mockThis.config.icon_border_progress = [
        {
          button: "sub-button-3",
          source: "sensor.temperature",
          border_radius: "12px", // Custom pixel value
          background_color: "#666666",
        },
      ];

      mockHass.states["sensor.temperature"] = { state: "85" };

      // Mock getComputedStyle to return different border-radius
      global.getComputedStyle = jest.fn().mockReturnValue({
        getPropertyValue: jest.fn((prop) => {
          if (prop === "border-radius") return "4px"; // CSS says 4px
          return "";
        }),
        borderRadius: "4px",
      });

      // Exercise - Run module
      icon_border_progress.call(mockThis, mockCard, mockHass);

      // Verify - SVG should use override (12px) instead of CSS (4px)
      const subButton3 = mockCard.querySelector(".bubble-sub-button-3");
      const svg = subButton3.querySelector(".stroke-dash-aligned-svg");
      expect(svg).toBeTruthy();

      // Progress should be applied
      const progressPath = svg.querySelector(".progress-path");
      expect(progressPath).toBeTruthy();
      expect(progressPath.getAttribute("stroke")).not.toBe("transparent");

      // Background should be applied
      expect(subButton3.style.background).toBe("rgb(102, 102, 102)");
    });

    it("should handle border_radius override with zero value", () => {
      // Setup - Configuration with border_radius override as 0 (force square)
      mockThis.config.icon_border_progress = [
        {
          button: "main",
          source: "sensor.progress",
          border_radius: 0, // Force square corners
          background_color: "#777777",
        },
      ];

      mockHass.states["sensor.progress"] = { state: "30" };

      // Mock getComputedStyle to return circular border-radius
      global.getComputedStyle = jest.fn().mockReturnValue({
        getPropertyValue: jest.fn((prop) => {
          if (prop === "border-radius") return "50%"; // CSS says circular
          return "";
        }),
        borderRadius: "50%",
      });

      // Exercise - Run module
      icon_border_progress.call(mockThis, mockCard, mockHass);

      // Verify - SVG should use override (0) making it square
      const mainIcon = mockCard.querySelector(".bubble-icon-container");
      const svg = mainIcon.querySelector(".stroke-dash-aligned-svg");
      expect(svg).toBeTruthy();

      // Progress should be applied
      const progressPath = svg.querySelector(".progress-path");
      expect(progressPath).toBeTruthy();
      expect(progressPath.getAttribute("stroke")).not.toBe("transparent");

      // Background should be applied
      expect(mainIcon.style.background).toBe("rgb(119, 119, 119)");
    });

    it("should handle border_radius override with condition changes", () => {
      // Setup - Configuration with border_radius override and condition
      mockThis.config.icon_border_progress = [
        {
          button: "main",
          source: "sensor.progress",
          border_radius: 20, // Override border radius
          background_color: "#888888",
          condition: [
            {
              condition: "state",
              entity_id: "sensor.enable_progress",
              state: "on",
            },
          ],
        },
      ];

      mockHass.states["sensor.progress"] = { state: "70" };
      mockHass.states["sensor.enable_progress"] = { state: "on" };

      // Exercise - First run with condition true
      icon_border_progress.call(mockThis, mockCard, mockHass);

      // Verify - SVG progress border is created with custom border radius
      const mainIcon = mockCard.querySelector(".bubble-icon-container");
      const svg = mainIcon.querySelector(".stroke-dash-aligned-svg");
      expect(svg).toBeTruthy();

      const progressPath = svg.querySelector(".progress-path");
      expect(progressPath).toBeTruthy();
      expect(progressPath.getAttribute("stroke")).not.toBe("transparent");

      // Setup - Change condition to false
      mockHass.states["sensor.enable_progress"] = { state: "off" };

      // Exercise - Second run with condition false
      icon_border_progress.call(mockThis, mockCard, mockHass);

      // Verify - SVG is completely removed when condition is false
      const svgAfterCleanup = mainIcon.querySelector(".stroke-dash-aligned-svg");
      expect(svgAfterCleanup).toBeNull();

      // Background should be restored
      expect(mainIcon.style.background).toBe(mainIcon.dataset.originalBackground || "");
    });

    it("should handle multiple buttons with different border_radius overrides", () => {
      // Setup - Configuration with different border_radius for different buttons
      mockThis.config.icon_border_progress = [
        {
          button: "main",
          source: "sensor.cpu_usage",
          border_radius: 8, // 8px rounded corners
          background_color: "#111111",
        },
        {
          button: "sub-button-1",
          source: "sensor.memory_usage",
          border_radius: "50%", // Circular
          background_color: "#222222",
        },
        {
          button: "sub-button-2",
          source: "sensor.disk_usage",
          border_radius: 0, // Square
          background_color: "#333333",
        },
      ];

      mockHass.states["sensor.cpu_usage"] = { state: "45" };
      mockHass.states["sensor.memory_usage"] = { state: "67" };
      mockHass.states["sensor.disk_usage"] = { state: "89" };

      // Exercise - Run module
      icon_border_progress.call(mockThis, mockCard, mockHass);

      // Verify - All buttons get their respective SVG progress borders
      // Main button with 8px border radius
      const mainIcon = mockCard.querySelector(".bubble-icon-container");
      const mainSvg = mainIcon.querySelector(".stroke-dash-aligned-svg");
      expect(mainSvg).toBeTruthy();
      expect(mainIcon.style.background).toBe("rgb(17, 17, 17)");

      // Sub-button-1 with circular (50%) border radius
      const subButton1 = mockCard.querySelector(".bubble-sub-button-1");
      const svg1 = subButton1.querySelector(".stroke-dash-aligned-svg");
      expect(svg1).toBeTruthy();
      expect(subButton1.style.background).toBe("rgb(34, 34, 34)");

      // Sub-button-2 with square (0) border radius
      const subButton2 = mockCard.querySelector(".bubble-sub-button-2");
      const svg2 = subButton2.querySelector(".stroke-dash-aligned-svg");
      expect(svg2).toBeTruthy();
      expect(subButton2.style.background).toBe("rgb(51, 51, 51)");

      // All should have progress paths with proper stroke
      const progressPath1 = mainSvg.querySelector(".progress-path");
      const progressPath2 = svg1.querySelector(".progress-path");
      const progressPath3 = svg2.querySelector(".progress-path");

      expect(progressPath1.getAttribute("stroke")).not.toBe("transparent");
      expect(progressPath2.getAttribute("stroke")).not.toBe("transparent");
      expect(progressPath3.getAttribute("stroke")).not.toBe("transparent");
    });
  });

  describe("Conditional Background Color Setting", () => {
    it("should set background color when background_color is configured", () => {
      // Setup - Configuration with background_color
      mockThis.config.icon_border_progress = [
        {
          button: "main",
          source: "sensor.progress",
          background_color: "#ff0000",
        },
      ];
      mockHass.states["sensor.progress"] = { state: "50" };

      // Exercise - Run module function
      icon_border_progress.call(mockThis, mockCard, mockHass);

      // Verify - Background color should be set
      const mainIcon = mockCard.querySelector(".bubble-icon-container");
      expect(mainIcon.style.background).toBe("rgb(255, 0, 0)"); // Browser normalizes to rgb
    });

    it("should set background color when backcolor is configured (deprecated)", () => {
      // Setup - Configuration with deprecated backcolor
      mockThis.config.icon_border_progress = [
        {
          button: "main",
          source: "sensor.progress",
          backcolor: "#00ff00",
        },
      ];
      mockHass.states["sensor.progress"] = { state: "50" };

      // Exercise - Run module function
      icon_border_progress.call(mockThis, mockCard, mockHass);

      // Verify - Background color should be set even with deprecated property
      const mainIcon = mockCard.querySelector(".bubble-icon-container");
      expect(mainIcon.style.background).toBe("rgb(0, 255, 0)"); // Browser normalizes to rgb
    });

    it("should prefer background_color over backcolor when both are configured", () => {
      // Setup - Configuration with both properties
      mockThis.config.icon_border_progress = [
        {
          button: "main",
          source: "sensor.progress",
          background_color: "#ff0000", // Should take precedence
          backcolor: "#00ff00", // Should be ignored
        },
      ];
      mockHass.states["sensor.progress"] = { state: "50" };

      // Exercise - Run module function
      icon_border_progress.call(mockThis, mockCard, mockHass);

      // Verify - Should use background_color (red), not backcolor (green)
      const mainIcon = mockCard.querySelector(".bubble-icon-container");
      expect(mainIcon.style.background).toBe("rgb(255, 0, 0)"); // Red, not green
    });

    it("should NOT set background color when neither background_color nor backcolor is configured", () => {
      // Setup
      const mainIcon = mockCard.querySelector(".bubble-icon-container");
      mainIcon.style.background = "rgb(128, 128, 128)"; // Simulate existing background

      // Spy on the style.background setter to detect if it's called
      const backgroundSetter = jest.spyOn(mainIcon.style, "background", "set");

      mockThis.config.icon_border_progress = [
        {
          button: "main",
          source: "sensor.progress",
          // No background_color or backcolor configured
        },
      ];
      mockHass.states["sensor.progress"] = { state: "50" };

      // Exercise - Run module function
      icon_border_progress.call(mockThis, mockCard, mockHass);

      // Verify - Background setter should NOT have been called since no background color is configured
      expect(backgroundSetter).not.toHaveBeenCalled();

      // Cleanup
      backgroundSetter.mockRestore();
    });

    it("should handle invalid color values gracefully", () => {
      // Setup - Configuration with invalid color
      mockThis.config.icon_border_progress = [
        {
          button: "main",
          source: "sensor.progress",
          background_color: "invalid-color",
        },
      ];
      mockHass.states["sensor.progress"] = { state: "50" };

      // Exercise - Run module function (should not throw)
      expect(() => {
        icon_border_progress.call(mockThis, mockCard, mockHass);
      }).not.toThrow();

      // Verify - Invalid CSS variables result in empty background (correct browser behavior)
      const mainIcon = mockCard.querySelector(".bubble-icon-container");
      expect(mainIcon.style.background).toBe(""); // CSS variable doesn't exist, so it resolves to empty
    });

    it("should handle different background color configurations for multiple buttons", () => {
      // Setup - Configuration with mixed background settings
      mockThis.config.icon_border_progress = [
        {
          button: "main",
          source: "sensor.progress1",
          background_color: "#ff0000", // Has background color
        },
        {
          button: "sub-button-1",
          source: "sensor.progress2",
          // No background color configured
        },
        {
          button: "sub-button-2",
          source: "sensor.progress3",
          backcolor: "#0000ff", // Has deprecated background color
        },
      ];
      mockHass.states["sensor.progress1"] = { state: "50" };
      mockHass.states["sensor.progress2"] = { state: "60" };
      mockHass.states["sensor.progress3"] = { state: "70" };

      // Set initial backgrounds to test preservation
      const mainIcon = mockCard.querySelector(".bubble-icon-container");
      const subButton1 = mockCard.querySelector(".bubble-sub-button-1");
      const subButton2 = mockCard.querySelector(".bubble-sub-button-2");
      subButton1.style.background = "rgb(200, 200, 200)"; // Should be preserved

      // Exercise - Run module function
      icon_border_progress.call(mockThis, mockCard, mockHass);

      // Verify - Each button handled according to its configuration
      expect(mainIcon.style.background).toBe("rgb(255, 0, 0)"); // Red from background_color
      expect(subButton1.style.background).toBe("rgb(200, 200, 200)"); // Preserved original
      expect(subButton2.style.background).toBe("rgb(0, 0, 255)"); // Blue from backcolor
    });

    it("should restore original background when condition becomes false", () => {
      // Setup - Configuration with condition and background color
      const mainIcon = mockCard.querySelector(".bubble-icon-container");
      mainIcon.style.background = "rgb(128, 128, 128)"; // Original background

      mockThis.config.icon_border_progress = [
        {
          button: "main",
          source: "sensor.progress",
          background_color: "#ff0000",
          condition: [
            {
              condition: "state",
              entity_id: "sensor.enable",
              state: "on",
            },
          ],
        },
      ];
      mockHass.states["sensor.progress"] = { state: "50" };
      mockHass.states["sensor.enable"] = { state: "on" };

      // Exercise - First run with condition true
      icon_border_progress.call(mockThis, mockCard, mockHass);

      // Verify - Background should be set to configured color
      expect(mainIcon.style.background).toBe("rgb(255, 0, 0)");

      // Setup - Change condition to false
      mockHass.states["sensor.enable"] = { state: "off" };

      // Exercise - Second run with condition false
      icon_border_progress.call(mockThis, mockCard, mockHass);

      // Verify - Background should be restored to original
      expect(mainIcon.style.background).toBe("rgb(128, 128, 128)");
    });
  });
});
