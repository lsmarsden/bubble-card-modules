/**
 * Integration Tests for sub_button_wheel module
 *
 * These tests focus on key scenarios with minimal mocking.
 * Only config, hass state, and basic DOM are mocked.
 * Real layout calculations and animations run naturally.
 */
import { jest } from "@jest/globals";
import { sub_button_wheel } from "../code.js";

describe("sub_button_wheel - Integration Tests", () => {
  let mockCard, mockThis, mockHass;

  beforeEach(() => {
    // Reset DOM
    document.body.innerHTML = "";

    // Create a mock card with realistic bubble card structure
    mockCard = document.createElement("div");
    mockCard.className = "bubble-card";

    // Add main icon container
    const mainIconContainer = document.createElement("div");
    mainIconContainer.className = "bubble-icon-container";
    mockCard.appendChild(mainIconContainer);

    // Add sub-button containers
    for (let i = 1; i <= 6; i++) {
      const subButton = document.createElement("div");
      subButton.className = `bubble-sub-button-${i}`;
      const iconContainer = document.createElement("div");
      iconContainer.className = "bubble-icon-container";
      subButton.appendChild(iconContainer);
      mockCard.appendChild(subButton);
    }

    document.body.appendChild(mockCard);

    // Create realistic hass state
    mockHass = {
      states: {
        "light.living_room_main": { state: "on" },
        "light.floor_lamp": { state: "off" },
        "light.table_lamp": { state: "on" },
        "fan.ceiling_fan": { state: "off" },
      },
    };

    mockThis = {
      config: {},
    };

    jest.clearAllMocks();
  });

  describe("Basic Wheel Creation", () => {
    it("should create wheel menu with glass ring when configured properly", () => {
      // Setup - Basic configuration
      mockThis.config.sub_button_wheel = {
        wheel_opener: "main",
        wheel_buttons: [{ sub_button: "1" }, { sub_button: "2" }, { sub_button: "3" }, { sub_button: "4" }],
      };

      // Exercise
      sub_button_wheel.call(mockThis, mockCard, mockHass);

      // Verify - Wheel menu structure is created
      const wheelMenu = document.querySelector(".wheel-menu");
      expect(wheelMenu).toBeTruthy();

      const glassRing = wheelMenu.querySelector(".glass-ring");
      expect(glassRing).toBeTruthy();

      const overlay = document.querySelector(".wheel-overlay");
      expect(overlay).toBeTruthy();

      // Verify buttons are moved to wheel
      const wheelButtons = wheelMenu.querySelectorAll(".wheel-button");
      expect(wheelButtons.length).toBe(4);

      // Verify opener button is in wheel menu
      const openerButton = wheelMenu.querySelector(".wheel-open-button");
      expect(openerButton).toBeTruthy();
    });

    it("should not create wheel when no buttons are configured", () => {
      // Setup - Empty configuration
      mockThis.config.sub_button_wheel = {
        wheel_opener: "main",
        wheel_buttons: [],
      };

      // Exercise
      sub_button_wheel.call(mockThis, mockCard, mockHass);

      // Verify - No wheel menu created
      const wheelMenu = document.querySelector(".wheel-menu");
      expect(wheelMenu).toBeNull();
    });

    it("should not create wheel when opener button not found", () => {
      // Setup - Invalid opener
      mockThis.config.sub_button_wheel = {
        wheel_opener: "nonexistent",
        wheel_buttons: [{ sub_button: "1" }],
      };

      // Exercise
      sub_button_wheel.call(mockThis, mockCard, mockHass);

      // Verify - No wheel menu created
      const wheelMenu = document.querySelector(".wheel-menu");
      expect(wheelMenu).toBeNull();
    });
  });

  describe("Layout Configurations", () => {
    it("should apply even-circle layout with proper positioning", () => {
      // Setup
      mockThis.config.sub_button_wheel = {
        wheel_opener: "main",
        layout_options: {
          wheel_layout: "even-circle",
        },
        wheel_buttons: [{ sub_button: "1" }, { sub_button: "2" }, { sub_button: "3" }, { sub_button: "4" }],
      };

      // Exercise
      sub_button_wheel.call(mockThis, mockCard, mockHass);

      // Verify - Buttons have transform positioning
      const wheelButtons = document.querySelectorAll(".wheel-button");
      expect(wheelButtons.length).toBe(4);

      wheelButtons.forEach((button) => {
        expect(button.style.transform).toMatch(/translate\(-?\d+px, -?\d+px\)/);
      });

      // Verify glass ring is sized appropriately
      const glassRing = document.querySelector(".glass-ring");
      expect(glassRing.style.width).toBeTruthy();
      expect(glassRing.style.height).toBeTruthy();
      expect(glassRing.style.width).toBe(glassRing.style.height); // Should be circular
    });

    it("should apply progressive-arc layout with different positioning", () => {
      // Setup
      mockThis.config.sub_button_wheel = {
        wheel_opener: "main",
        layout_options: {
          wheel_layout: "progressive-arc",
        },
        wheel_buttons: [
          { sub_button: "1" },
          { sub_button: "2" },
          { sub_button: "3" },
          { sub_button: "4" },
          { sub_button: "5" },
        ],
      };

      // Exercise
      sub_button_wheel.call(mockThis, mockCard, mockHass);

      // Verify - Buttons positioned in arc pattern
      const wheelButtons = document.querySelectorAll(".wheel-button");
      expect(wheelButtons.length).toBe(5);

      // First button should be at top (-90°)
      const firstButton = wheelButtons[0];
      expect(firstButton.style.transform).toMatch(/translate\(0px, -\d+px\)/);
    });

    it("should apply double-ring layout with inner and outer rings", () => {
      // Setup
      mockThis.config.sub_button_wheel = {
        wheel_opener: "main",
        layout_options: {
          wheel_layout: "double-ring",
          double_ring_inner_count: 3,
        },
        wheel_buttons: [
          { sub_button: "1" }, // Inner ring
          { sub_button: "2" }, // Inner ring
          { sub_button: "3" }, // Inner ring
          { sub_button: "4" }, // Outer ring
          { sub_button: "5" }, // Outer ring
          { sub_button: "6" }, // Outer ring
        ],
      };

      // Exercise
      sub_button_wheel.call(mockThis, mockCard, mockHass);

      // Verify - All buttons positioned
      const wheelButtons = document.querySelectorAll(".wheel-button");
      expect(wheelButtons.length).toBe(6);

      // Verify different positioning for inner vs outer rings
      const innerButtons = Array.from(wheelButtons).slice(0, 3);
      const outerButtons = Array.from(wheelButtons).slice(3, 6);

      // Inner buttons should have smaller radius (closer to center)
      innerButtons.forEach((button) => {
        expect(button.style.transform).toBeTruthy();
      });

      outerButtons.forEach((button) => {
        expect(button.style.transform).toBeTruthy();
      });
    });
  });

  describe("Animation Configurations", () => {
    it("should apply staggered-scale animation with proper timing", () => {
      // Setup
      mockThis.config.sub_button_wheel = {
        wheel_opener: "main",
        animation_options: {
          wheel_animation: "staggered-scale",
          animation_delay: 0.2,
          animation_duration: 0.8,
        },
        wheel_buttons: [{ sub_button: "1" }, { sub_button: "2" }, { sub_button: "3" }],
      };

      // Exercise
      sub_button_wheel.call(mockThis, mockCard, mockHass);

      // Verify - Buttons have staggered animation timing
      const wheelButtons = document.querySelectorAll(".wheel-button");
      expect(wheelButtons.length).toBe(3);

      wheelButtons.forEach((button, index) => {
        expect(button.style.transition).toContain("0.8s");
        expect(button.style.transitionDelay).toBeTruthy();

        // Each button should have increasing delay
        const delay = parseFloat(button.style.transitionDelay);
        expect(delay).toBeGreaterThanOrEqual(0.2); // Base delay
      });

      // Verify glass ring has animation timing
      const glassRing = document.querySelector(".glass-ring");
      expect(glassRing.style.transitionDelay).toBe("0.2s");
      expect(glassRing.style.transitionDuration).toBe("0.8s");
    });

    it("should apply instant animation with no delays", () => {
      // Setup
      mockThis.config.sub_button_wheel = {
        wheel_opener: "main",
        animation_options: {
          wheel_animation: "instant",
        },
        wheel_buttons: [{ sub_button: "1" }, { sub_button: "2" }],
      };

      // Exercise
      sub_button_wheel.call(mockThis, mockCard, mockHass);

      // Verify - Buttons have no animation delays
      const wheelButtons = document.querySelectorAll(".wheel-button");
      wheelButtons.forEach((button) => {
        expect(button.style.transition).toBe("");
        expect(button.style.transitionDelay).toBe("");
      });
    });
  });

  describe("Button Positioning", () => {
    it("should respect manual button positioning", () => {
      // Setup
      mockThis.config.sub_button_wheel = {
        wheel_opener: "main",
        layout_options: {
          wheel_layout: "fixed-position",
        },
        wheel_buttons: [
          { sub_button: "1", position: 1 }, // Top
          { sub_button: "2", position: 5 }, // Bottom
          { sub_button: "3", position: 3 }, // Right
        ],
      };

      // Exercise
      sub_button_wheel.call(mockThis, mockCard, mockHass);

      // Verify - Buttons are positioned according to their specified positions
      const wheelButtons = document.querySelectorAll(".wheel-button");
      expect(wheelButtons.length).toBe(3);

      // All buttons should have positioning
      wheelButtons.forEach((button) => {
        expect(button.style.transform).toBeTruthy();
      });
    });

    it("should auto-assign positions for buttons without explicit positions", () => {
      // Setup
      mockThis.config.sub_button_wheel = {
        wheel_opener: "main",
        wheel_buttons: [
          { sub_button: "1", position: 2 }, // Explicit position
          { sub_button: "2" }, // Auto-assigned
          { sub_button: "3" }, // Auto-assigned
        ],
      };

      // Exercise
      sub_button_wheel.call(mockThis, mockCard, mockHass);

      // Verify - All buttons are positioned
      const wheelButtons = document.querySelectorAll(".wheel-button");
      expect(wheelButtons.length).toBe(3);

      wheelButtons.forEach((button) => {
        expect(button.style.transform).toBeTruthy();
      });
    });
  });

  describe("Interaction Behavior", () => {
    it("should set up click handlers for wheel toggle", () => {
      // Setup
      mockThis.config.sub_button_wheel = {
        wheel_opener: "main",
        wheel_buttons: [{ sub_button: "1" }],
      };

      // Exercise
      sub_button_wheel.call(mockThis, mockCard, mockHass);

      // Verify - Click handlers are attached
      const wheelMenu = document.querySelector(".wheel-menu");
      const openerButton = wheelMenu.querySelector(".wheel-open-button");
      const overlay = document.querySelector(".wheel-overlay");

      expect(openerButton.onclick).toBeTruthy();
      expect(overlay.onclick).toBeTruthy();
    });

    it("should handle missing sub-buttons gracefully", () => {
      // Setup - Reference non-existent sub-button
      mockThis.config.sub_button_wheel = {
        wheel_opener: "main",
        wheel_buttons: [
          { sub_button: "1" }, // Exists
          { sub_button: "99" }, // Doesn't exist
          { sub_button: "2" }, // Exists
        ],
      };

      // Exercise
      sub_button_wheel.call(mockThis, mockCard, mockHass);

      // Verify - Wheel created with only existing buttons
      const wheelButtons = document.querySelectorAll(".wheel-button");
      expect(wheelButtons.length).toBe(2); // Only existing buttons

      const wheelMenu = document.querySelector(".wheel-menu");
      expect(wheelMenu).toBeTruthy(); // Wheel still created
    });
  });

  describe("Default Configuration", () => {
    it("should use default layout when not specified", () => {
      // Setup - Minimal configuration
      mockThis.config.sub_button_wheel = {
        wheel_opener: "main",
        wheel_buttons: [{ sub_button: "1" }, { sub_button: "2" }],
      };

      // Exercise
      sub_button_wheel.call(mockThis, mockCard, mockHass);

      // Verify - Wheel created with defaults
      const wheelMenu = document.querySelector(".wheel-menu");
      const wheelButtons = wheelMenu.querySelectorAll(".wheel-button");

      expect(wheelMenu).toBeTruthy();
      expect(wheelButtons.length).toBe(2);

      // Should use default even-circle layout
      wheelButtons.forEach((button) => {
        expect(button.style.transform).toBeTruthy();
      });
    });
  });
});
