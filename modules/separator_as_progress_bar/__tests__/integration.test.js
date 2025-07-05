/**
 * Integration Tests for separator_as_progress_bar module
 *
 * These tests use real YAML configurations from the README,
 * with minimal mocking (only config, hass state, and basic DOM simulation).
 * Real helper functions run naturally for true integration testing.
 */

import { jest } from "@jest/globals";
import { separator_as_progress_bar } from "../code.js";

describe("separator_as_progress_bar - Integration Tests", () => {
  let mockCard, mockThis, mockHass;

  beforeEach(() => {
    // Reset DOM
    document.body.innerHTML = "";

    // Create realistic hass state for testing
    mockHass = {
      states: {
        "sensor.task_progress": { state: "75" },
        "sensor.download_progress": { state: "42" },
        "sensor.vacuum_progress": { state: "85" },
        "sensor.cpu_load": { state: "25" },
        "sensor.washing_machine_progress": { state: "60" },
        "sensor.washer_status": { state: "running" },
        "sensor.saros_10_cleaning_progress": { state: "80" },
        "sensor.saros_10_current_room": { state: "Living Room" },
        "sensor.saros_10_status": { state: "cleaning" },
        // Edge case entities
        "sensor.invalid_progress": { state: "invalid" },
        "sensor.negative_progress": { state: "-10" },
        "sensor.high_progress": { state: "150" },
        "sensor.zero_progress": { state: "0" },
        "sensor.max_progress": { state: "100" },
      },
    };

    // Set up global hass for helpers to access
    global.hass = mockHass;

    // Create a mock card with realistic bubble card structure
    mockCard = document.createElement("div");

    // Add bubble line element (the progress bar base)
    const bubbleLine = document.createElement("div");
    bubbleLine.className = "bubble-line";
    bubbleLine.style.height = "2px";
    mockCard.appendChild(bubbleLine);

    document.body.appendChild(mockCard);

    // Mock global functions with realistic behavior
    global.getComputedStyle = jest.fn().mockReturnValue({
      height: "2px",
      getPropertyValue: jest.fn((prop) => {
        if (prop === "--bubble-icon-border-radius") return "4px";
        return "";
      }),
    });

    // Mock requestAnimationFrame
    global.requestAnimationFrame = jest.fn((callback) => {
      callback();
      return 1;
    });

    // Mock this context
    mockThis = {
      config: {},
    };
  });

  afterEach(() => {
    delete global.getComputedStyle;
    delete global.requestAnimationFrame;
    delete global.hass;
  });

  describe("README Example 1: Minimal example", () => {
    it("should render basic progress bar with color stop", () => {
      // Setup - Real YAML from README
      mockThis.config = {
        separator_as_progress_bar: {
          source: "sensor.task_progress",
          progress_style: {
            height: 12,
            color_stops: [
              {
                color: "#42a5f5",
                percent: 0,
              },
            ],
          },
        },
      };

      // Exercise
      separator_as_progress_bar.call(mockThis, mockCard, mockHass);

      // Verify - Check DOM structure was created
      const wrapper = mockCard.querySelector(".bubble-line-wrapper");
      expect(wrapper).toBeTruthy();

      const element = wrapper.querySelector(".bubble-line");
      expect(element).toBeTruthy();
      expect(element.classList.contains("bubble-line-progress")).toBe(true);

      // Verify progress bar element was created
      const progressBar = element.querySelector(".bubble-line-progress-bar");
      expect(progressBar).toBeTruthy();

      // Verify tip glow element was created
      const tipGlow = element.querySelector(".bubble-line-progress-tip");
      expect(tipGlow).toBeTruthy();

      // Verify height was set correctly
      expect(wrapper.style.getPropertyValue("--bubble-line-height")).toBe("12px");

      // Verify progress width was set (75% from sensor.task_progress)
      expect(element.style.getPropertyValue("--progress-width")).toBe("75cqw");

      // Verify color was applied
      expect(element.style.getPropertyValue("--bubble-line-progress-color")).toBeTruthy();

      // Verify border radius class was added
      expect(element.classList.contains("has-bubble-border-radius")).toBe(true);
    });
  });

  describe("README Example 2: Interpolated Gradients", () => {
    it("should render progress bar with color interpolation", () => {
      // Setup - Real YAML from README
      mockThis.config = {
        separator_as_progress_bar: {
          source: "sensor.download_progress",
          progress_style: {
            height: 14,
            interpolate: true,
            color_stops: [
              { color: "red", percent: 0 },
              { color: "orange", percent: 50 },
              { color: "green", percent: 100 },
            ],
          },
        },
      };

      // Exercise
      separator_as_progress_bar.call(mockThis, mockCard, mockHass);

      // Verify - Check basic structure
      const wrapper = mockCard.querySelector(".bubble-line-wrapper");
      expect(wrapper).toBeTruthy();

      const element = wrapper.querySelector(".bubble-line");
      expect(element.classList.contains("bubble-line-progress")).toBe(true);

      // Verify height was set correctly
      expect(wrapper.style.getPropertyValue("--bubble-line-height")).toBe("14px");

      // Verify progress width (42% from sensor.download_progress)
      expect(element.style.getPropertyValue("--progress-width")).toBe("42cqw");

      // Verify interpolated color was applied (should be between red and orange)
      const progressColor = element.style.getPropertyValue("--bubble-line-progress-color");
      expect(progressColor).toBeTruthy();
      expect(progressColor).not.toBe("red"); // Should be interpolated
    });
  });

  describe("README Example 3: Orb animation", () => {
    it("should render progress bar with orb animation when condition is met", () => {
      // Setup - Real YAML from README
      mockThis.config = {
        separator_as_progress_bar: {
          source: "sensor.vacuum_progress",
          progress_style: {
            height: 14,
            color_stops: [{ color: "darkblue", percent: 0 }],
            orb_settings: {
              show_orb: true,
              slow_orb: true,
              orb_color: "#00e5ff",
              trail_color: "#00acc1",
              condition: {
                condition: "numeric_state",
                entity: "sensor.vacuum_progress",
                above: 20,
              },
            },
          },
        },
      };

      // Exercise
      separator_as_progress_bar.call(mockThis, mockCard, mockHass);

      // Verify - Check basic structure
      const wrapper = mockCard.querySelector(".bubble-line-wrapper");
      expect(wrapper).toBeTruthy();

      const element = wrapper.querySelector(".bubble-line");
      const progressBar = element.querySelector(".bubble-line-progress-bar");

      // Verify orb was created (condition met: 85 > 20)
      const orb = progressBar.querySelector(".bubble-line-progress-orb");
      expect(orb).toBeTruthy();

      // Verify orb animation settings
      expect(orb.style.animation).toContain("orb-slow");
      expect(orb.style.animation).toContain("2s ease-in-out infinite");

      // Verify orb colors were set
      expect(orb.style.getPropertyValue("--bubble-line-progress-orb-color")).toBeTruthy();
      expect(orb.style.getPropertyValue("--bubble-line-progress-orb-trail-color")).toBeTruthy();
    });

    it("should not render orb when condition is not met", () => {
      // Setup - Same config but with entity that doesn't meet condition
      mockThis.config = {
        separator_as_progress_bar: {
          source: "sensor.cpu_load", // 25, which is > 20, so let's change the condition
          progress_style: {
            height: 14,
            color_stops: [{ color: "darkblue", percent: 0 }],
            orb_settings: {
              show_orb: true,
              slow_orb: true,
              orb_color: "#00e5ff",
              trail_color: "#00acc1",
              condition: {
                condition: "numeric_state",
                entity: "sensor.cpu_load",
                above: 50, // 25 is not above 50
              },
            },
          },
        },
      };

      // Exercise
      separator_as_progress_bar.call(mockThis, mockCard, mockHass);

      // Verify - Check orb was not created
      const element = mockCard.querySelector(".bubble-line");
      const progressBar = element.querySelector(".bubble-line-progress-bar");
      const orb = progressBar.querySelector(".bubble-line-progress-orb");
      expect(orb).toBeFalsy();
    });
  });

  describe("README Example 4: Shine animation", () => {
    it("should render progress bar with shine animation when condition is met", () => {
      // Setup - Real YAML from README
      mockThis.config = {
        separator_as_progress_bar: {
          source: "sensor.cpu_load",
          progress_style: {
            height: 16,
            color_stops: [
              { color: "#81d4fa", percent: 0 },
              { color: "yellow", percent: 70 },
              { color: "red", percent: 100 },
            ],
            shine_settings: {
              show_shine: true,
              shine_color: "#ffffff",
              shine_angle: 30,
              shine_delay: 0.5,
              condition: {
                condition: "numeric_state",
                entity: "sensor.cpu_load",
                below: 30, // 25 is below 30
              },
            },
          },
        },
      };

      // Exercise
      separator_as_progress_bar.call(mockThis, mockCard, mockHass);

      // Verify - Check basic structure
      const wrapper = mockCard.querySelector(".bubble-line-wrapper");
      expect(wrapper).toBeTruthy();

      const element = wrapper.querySelector(".bubble-line");
      const progressBar = element.querySelector(".bubble-line-progress-bar");

      // Verify shine was created (condition met: 25 < 30)
      const shine = progressBar.querySelector(".bubble-line-progress-shine");
      expect(shine).toBeTruthy();

      // Verify shine properties were set
      expect(shine.style.getPropertyValue("--bubble-line-progress-shine-color")).toBeTruthy();
      expect(shine.style.getPropertyValue("--bubble-line-progress-shine-angle")).toBe("30deg");
      expect(shine.style.animationDelay).toBe("0.5s");
    });
  });

  describe("Shine Settings - Comprehensive Branch Coverage", () => {
    // Test Matrix from agent_context.md - All combinations of shine settings

    describe("Main Conditional Branch Tests", () => {
      it("Test 1: should not create shine when shineSettings is undefined", () => {
        mockThis.config = {
          separator_as_progress_bar: {
            source: "sensor.task_progress",
            progress_style: {
              height: 10,
              color_stops: [{ color: "blue", percent: 0 }],
              // shine_settings is undefined
            },
          },
        };

        separator_as_progress_bar.call(mockThis, mockCard, mockHass);

        const element = mockCard.querySelector(".bubble-line");
        const progressBar = element.querySelector(".bubble-line-progress-bar");
        const shine = progressBar.querySelector(".bubble-line-progress-shine");
        expect(shine).toBeFalsy();
      });

      it("Test 2: should not create shine when shineSettings is null", () => {
        mockThis.config = {
          separator_as_progress_bar: {
            source: "sensor.task_progress",
            progress_style: {
              height: 10,
              color_stops: [{ color: "blue", percent: 0 }],
              shine_settings: null,
            },
          },
        };

        separator_as_progress_bar.call(mockThis, mockCard, mockHass);

        const element = mockCard.querySelector(".bubble-line");
        const progressBar = element.querySelector(".bubble-line-progress-bar");
        const shine = progressBar.querySelector(".bubble-line-progress-shine");
        expect(shine).toBeFalsy();
      });

      // Tests 3-5: Parameterized test for show_shine falsy values
      it.each([
        { testNum: 3, showShine: undefined, description: "undefined (defaults to false)" },
        { testNum: 4, showShine: null, description: "null (defaults to false)" },
        { testNum: 5, showShine: false, description: "explicitly false" },
      ])("Test $testNum: should not create shine when show_shine is $description", ({ showShine }) => {
        const shineSettings = {
          shine_color: "#ffffff",
        };

        // Only add show_shine property if it's not undefined
        if (showShine !== undefined) {
          shineSettings.show_shine = showShine;
        }

        mockThis.config = {
          separator_as_progress_bar: {
            source: "sensor.task_progress",
            progress_style: {
              height: 10,
              color_stops: [{ color: "blue", percent: 0 }],
              shine_settings: shineSettings,
            },
          },
        };

        separator_as_progress_bar.call(mockThis, mockCard, mockHass);

        const element = mockCard.querySelector(".bubble-line");
        const progressBar = element.querySelector(".bubble-line-progress-bar");
        const shine = progressBar.querySelector(".bubble-line-progress-shine");
        expect(shine).toBeFalsy();
      });

      // Tests 6-7: Parameterized test for shine element creation with truthy conditions
      it.each([
        { testNum: 6, condition: undefined, description: "condition is undefined (defaults to true)" },
        { testNum: 7, condition: null, description: "condition is null (defaults to true)" },
      ])("Test $testNum: should create shine when show_shine is true and $description", ({ condition }) => {
        const shineSettings = {
          show_shine: true,
          shine_color: "#ffffff",
          shine_width: 20,
          shine_angle: 45,
          shine_delay: 1.5,
        };

        // Only add condition property if it's not undefined
        if (condition !== undefined) {
          shineSettings.condition = condition;
        }

        mockThis.config = {
          separator_as_progress_bar: {
            source: "sensor.task_progress",
            progress_style: {
              height: 10,
              color_stops: [{ color: "blue", percent: 0 }],
              shine_settings: shineSettings,
            },
          },
        };

        separator_as_progress_bar.call(mockThis, mockCard, mockHass);

        const element = mockCard.querySelector(".bubble-line");
        const progressBar = element.querySelector(".bubble-line-progress-bar");
        const shine = progressBar.querySelector(".bubble-line-progress-shine");

        // Verify shine element was created
        expect(shine).toBeTruthy();
        expect(shine.className).toBe("bubble-line-progress-shine");

        // Verify all CSS properties are set correctly
        expect(shine.style.getPropertyValue("--bubble-line-progress-shine-color")).toBeTruthy();
        expect(shine.style.getPropertyValue("--bubble-line-progress-shine-width")).toBe("20px");
        expect(shine.style.getPropertyValue("--bubble-line-progress-shine-angle")).toBe("45deg");
        expect(shine.style.animationDelay).toBe("1.5s");
      });

      it("Test 8: should not create shine when condition fails", () => {
        mockThis.config = {
          separator_as_progress_bar: {
            source: "sensor.task_progress",
            progress_style: {
              height: 10,
              color_stops: [{ color: "blue", percent: 0 }],
              shine_settings: {
                show_shine: true,
                condition: {
                  condition: "numeric_state",
                  entity: "sensor.task_progress",
                  above: 80, // 75 is not above 80, so condition fails
                },
                shine_color: "#ffffff",
              },
            },
          },
        };

        separator_as_progress_bar.call(mockThis, mockCard, mockHass);

        const element = mockCard.querySelector(".bubble-line");
        const progressBar = element.querySelector(".bubble-line-progress-bar");
        const shine = progressBar.querySelector(".bubble-line-progress-shine");
        expect(shine).toBeFalsy();
      });

      it("Test 9: should create shine when condition passes", () => {
        mockThis.config = {
          separator_as_progress_bar: {
            source: "sensor.task_progress",
            progress_style: {
              height: 10,
              color_stops: [{ color: "blue", percent: 0 }],
              shine_settings: {
                show_shine: true,
                condition: {
                  condition: "numeric_state",
                  entity: "sensor.task_progress",
                  above: 50, // 75 is above 50, so condition passes
                },
                shine_color: "#00ff00",
                shine_width: 15,
                shine_angle: 90,
                shine_delay: 2,
              },
            },
          },
        };

        separator_as_progress_bar.call(mockThis, mockCard, mockHass);

        const element = mockCard.querySelector(".bubble-line");
        const progressBar = element.querySelector(".bubble-line-progress-bar");
        const shine = progressBar.querySelector(".bubble-line-progress-shine");

        expect(shine).toBeTruthy();
        expect(shine.className).toBe("bubble-line-progress-shine");

        // Verify all properties are set
        expect(shine.style.getPropertyValue("--bubble-line-progress-shine-color")).toBeTruthy();
        expect(shine.style.getPropertyValue("--bubble-line-progress-shine-width")).toBe("15px");
        expect(shine.style.getPropertyValue("--bubble-line-progress-shine-angle")).toBe("90deg");
        expect(shine.style.animationDelay).toBe("2s");
      });

      it("Test 10: should not create duplicate shine element when element already exists", () => {
        mockThis.config = {
          separator_as_progress_bar: {
            source: "sensor.task_progress",
            progress_style: {
              height: 10,
              color_stops: [{ color: "blue", percent: 0 }],
              shine_settings: {
                show_shine: true,
                shine_color: "#ffffff",
              },
            },
          },
        };

        // First call should create the shine element
        separator_as_progress_bar.call(mockThis, mockCard, mockHass);

        const element = mockCard.querySelector(".bubble-line");
        const progressBar = element.querySelector(".bubble-line-progress-bar");
        const shineElements = progressBar.querySelectorAll(".bubble-line-progress-shine");
        expect(shineElements).toHaveLength(1);

        // Second call should not create duplicate
        separator_as_progress_bar.call(mockThis, mockCard, mockHass);

        const shineElementsAfterSecondCall = progressBar.querySelectorAll(".bubble-line-progress-shine");
        expect(shineElementsAfterSecondCall).toHaveLength(1);
      });
    });

    describe("Property Verification Tests", () => {
      it("should apply default values for undefined properties", () => {
        mockThis.config = {
          separator_as_progress_bar: {
            source: "sensor.task_progress",
            progress_style: {
              height: 10,
              color_stops: [{ color: "blue", percent: 0 }],
              shine_settings: {
                show_shine: true,
                // All properties undefined - should use defaults
              },
            },
          },
        };

        separator_as_progress_bar.call(mockThis, mockCard, mockHass);

        const element = mockCard.querySelector(".bubble-line");
        const progressBar = element.querySelector(".bubble-line-progress-bar");
        const shine = progressBar.querySelector(".bubble-line-progress-shine");

        expect(shine).toBeTruthy();

        // Verify default values
        expect(shine.style.getPropertyValue("--bubble-line-progress-shine-color")).toBe("rgba(255,255,255,0.4)");
        expect(shine.style.getPropertyValue("--bubble-line-progress-shine-width")).toBe(
          "calc(var(--progress-width) / 2)",
        );
        expect(shine.style.getPropertyValue("--bubble-line-progress-shine-angle")).toBe("0deg");
        expect(shine.style.animationDelay).toBe("0s");
      });

      it("should apply custom values for all properties", () => {
        mockThis.config = {
          separator_as_progress_bar: {
            source: "sensor.task_progress",
            progress_style: {
              height: 10,
              color_stops: [{ color: "blue", percent: 0 }],
              shine_settings: {
                show_shine: true,
                shine_color: "#ff5722",
                shine_width: 25,
                shine_angle: 135,
                shine_delay: 3.5,
              },
            },
          },
        };

        separator_as_progress_bar.call(mockThis, mockCard, mockHass);

        const element = mockCard.querySelector(".bubble-line");
        const progressBar = element.querySelector(".bubble-line-progress-bar");
        const shine = progressBar.querySelector(".bubble-line-progress-shine");

        expect(shine).toBeTruthy();

        // Verify custom values
        expect(shine.style.getPropertyValue("--bubble-line-progress-shine-color")).toBeTruthy(); // Should call resolveColor
        expect(shine.style.getPropertyValue("--bubble-line-progress-shine-width")).toBe("25px");
        expect(shine.style.getPropertyValue("--bubble-line-progress-shine-angle")).toBe("135deg");
        expect(shine.style.animationDelay).toBe("3.5s");
      });

      it("should handle zero values correctly", () => {
        mockThis.config = {
          separator_as_progress_bar: {
            source: "sensor.task_progress",
            progress_style: {
              height: 10,
              color_stops: [{ color: "blue", percent: 0 }],
              shine_settings: {
                show_shine: true,
                shine_width: 0, // Zero width - treated as falsy, uses default
                shine_angle: 0, // Zero angle
                shine_delay: 0, // Zero delay
              },
            },
          },
        };

        separator_as_progress_bar.call(mockThis, mockCard, mockHass);

        const element = mockCard.querySelector(".bubble-line");
        const progressBar = element.querySelector(".bubble-line-progress-bar");
        const shine = progressBar.querySelector(".bubble-line-progress-shine");

        expect(shine).toBeTruthy();

        // Verify zero values are handled correctly
        // shine_width: 0 is falsy, so uses default
        expect(shine.style.getPropertyValue("--bubble-line-progress-shine-width")).toBe(
          "calc(var(--progress-width) / 2)",
        );
        expect(shine.style.getPropertyValue("--bubble-line-progress-shine-angle")).toBe("0deg");
        expect(shine.style.animationDelay).toBe("0s");
      });
    });

    describe("DOM Structure Verification", () => {
      it("should verify complete DOM structure and attachment", () => {
        mockThis.config = {
          separator_as_progress_bar: {
            source: "sensor.task_progress",
            progress_style: {
              height: 10,
              color_stops: [{ color: "blue", percent: 0 }],
              shine_settings: {
                show_shine: true,
                shine_color: "#ffc107",
              },
            },
          },
        };

        separator_as_progress_bar.call(mockThis, mockCard, mockHass);

        const element = mockCard.querySelector(".bubble-line");
        const progressBar = element.querySelector(".bubble-line-progress-bar");
        const shine = progressBar.querySelector(".bubble-line-progress-shine");

        // Verify element creation and structure
        expect(shine).toBeTruthy();
        expect(shine.tagName).toBe("DIV");
        expect(shine.className).toBe("bubble-line-progress-shine");

        // Verify parent attachment
        expect(shine.parentElement).toBe(progressBar);

        // Verify all 4 CSS properties are set
        expect(shine.style.getPropertyValue("--bubble-line-progress-shine-color")).toBeTruthy();
        expect(shine.style.getPropertyValue("--bubble-line-progress-shine-width")).toBeTruthy();
        expect(shine.style.getPropertyValue("--bubble-line-progress-shine-angle")).toBeTruthy();
        expect(shine.style.animationDelay).toBeTruthy();

        // Verify only one shine element exists
        const allShineElements = progressBar.querySelectorAll(".bubble-line-progress-shine");
        expect(allShineElements).toHaveLength(1);
      });
    });

    describe("Complex Condition Tests", () => {
      it("should handle state-based conditions", () => {
        mockThis.config = {
          separator_as_progress_bar: {
            source: "sensor.task_progress",
            progress_style: {
              height: 10,
              color_stops: [{ color: "blue", percent: 0 }],
              shine_settings: {
                show_shine: true,
                condition: {
                  condition: "state",
                  entity: "sensor.washer_status",
                  state: "running", // matches current state
                },
                shine_color: "#4caf50",
              },
            },
          },
        };

        separator_as_progress_bar.call(mockThis, mockCard, mockHass);

        const element = mockCard.querySelector(".bubble-line");
        const progressBar = element.querySelector(".bubble-line-progress-bar");
        const shine = progressBar.querySelector(".bubble-line-progress-shine");
        expect(shine).toBeTruthy();
      });

      it("should handle array-based state conditions", () => {
        mockThis.config = {
          separator_as_progress_bar: {
            source: "sensor.task_progress",
            progress_style: {
              height: 10,
              color_stops: [{ color: "blue", percent: 0 }],
              shine_settings: {
                show_shine: true,
                condition: {
                  condition: "state",
                  entity: "sensor.washer_status",
                  state: ["running", "spinning"], // running is in array
                },
                shine_color: "#2196f3",
              },
            },
          },
        };

        separator_as_progress_bar.call(mockThis, mockCard, mockHass);

        const element = mockCard.querySelector(".bubble-line");
        const progressBar = element.querySelector(".bubble-line-progress-bar");
        const shine = progressBar.querySelector(".bubble-line-progress-shine");
        expect(shine).toBeTruthy();
      });

      it("should handle exists condition", () => {
        mockThis.config = {
          separator_as_progress_bar: {
            source: "sensor.task_progress",
            progress_style: {
              height: 10,
              color_stops: [{ color: "blue", percent: 0 }],
              shine_settings: {
                show_shine: true,
                condition: {
                  condition: "exists",
                  entity: "sensor.task_progress", // exists
                },
                shine_color: "#9c27b0",
              },
            },
          },
        };

        separator_as_progress_bar.call(mockThis, mockCard, mockHass);

        const element = mockCard.querySelector(".bubble-line");
        const progressBar = element.querySelector(".bubble-line-progress-bar");
        const shine = progressBar.querySelector(".bubble-line-progress-shine");
        expect(shine).toBeTruthy();
      });
    });
  });

  describe("README Example 5: Text templates above/below", () => {
    it("should render text templates with placeholders when conditions are met", () => {
      // Setup - Real YAML from README
      mockThis.config = {
        separator_as_progress_bar: {
          source: "sensor.washing_machine_progress",
          progress_style: {
            height: 16,
            color_stops: [{ color: "#4caf50", percent: 100 }],
          },
          above_text: {
            text: "Washing in progress",
            condition: {
              condition: "state",
              entity: "sensor.washer_status",
              state: "running",
            },
          },
          below_text: {
            text: "{pct}%",
            placeholders: {
              pct: "sensor.washing_machine_progress",
            },
          },
        },
      };

      // Exercise
      separator_as_progress_bar.call(mockThis, mockCard, mockHass);

      // Verify - Check text elements were created
      const wrapper = mockCard.querySelector(".bubble-line-wrapper");
      expect(wrapper).toBeTruthy();

      // Verify above text (condition met: washer_status is "running")
      const aboveText = wrapper.querySelector(".bubble-line-text.above-text");
      expect(aboveText).toBeTruthy();
      expect(aboveText.innerText).toBe("Washing in progress");

      // Verify below text with placeholder substitution
      const belowText = wrapper.querySelector(".bubble-line-text.below-text");
      expect(belowText).toBeTruthy();
      expect(belowText.innerText).toBe("60%"); // sensor.washing_machine_progress = 60
    });

    it("should not render above text when condition is not met", () => {
      // Setup - Change washer status to not running
      mockHass.states["sensor.washer_status"].state = "idle";

      mockThis.config = {
        separator_as_progress_bar: {
          source: "sensor.washing_machine_progress",
          progress_style: {
            height: 16,
            color_stops: [{ color: "#4caf50", percent: 100 }],
          },
          above_text: {
            text: "Washing in progress",
            condition: {
              condition: "state",
              entity: "sensor.washer_status",
              state: "running",
            },
          },
          below_text: {
            text: "{pct}%",
            placeholders: {
              pct: "sensor.washing_machine_progress",
            },
          },
        },
      };

      // Exercise
      separator_as_progress_bar.call(mockThis, mockCard, mockHass);

      // Verify - Check above text was not created
      const wrapper = mockCard.querySelector(".bubble-line-wrapper");
      const aboveText = wrapper.querySelector(".bubble-line-text.above-text");
      expect(aboveText).toBeFalsy();

      // Verify below text still exists (no condition)
      const belowText = wrapper.querySelector(".bubble-line-text.below-text");
      expect(belowText).toBeTruthy();
    });
  });

  describe("README Example 6: Full configuration with animations and text", () => {
    it("should render all features when conditions are met", () => {
      // Setup - Real YAML from README
      mockThis.config = {
        separator_as_progress_bar: {
          source: "sensor.saros_10_cleaning_progress",
          invert: false,
          progress_style: {
            orb_settings: {
              show_orb: true,
              slow_orb: true,
              orb_color: "#00e5ff",
              trail_color: "transparent",
              condition: {
                condition: "numeric_state",
                entity: "sensor.saros_10_cleaning_progress",
                above: 60, // 80 > 60
              },
            },
            shine_settings: {
              show_shine: true,
              shine_color: "#64b5f6",
              shine_angle: -30,
              shine_delay: 1,
              condition: {
                condition: "numeric_state",
                entity: "sensor.saros_10_cleaning_progress",
                below: 20, // 80 is not below 20
              },
            },
            outline: {
              style: "solid",
              color: "#1565c0",
              width: 1,
            },
            height: 15,
            interpolate: true,
            background_color_stops: [{ color: "#0d1b2a", percent: 0 }],
            color_stops: [
              { color: "#1976d2", percent: 0 },
              { color: "green", percent: 100 },
            ],
          },
          below_text: {
            text: "Cleaning {room}",
            placeholders: {
              room: "sensor.saros_10_current_room",
            },
            condition: {
              condition: "state",
              entity: "sensor.saros_10_status",
              state: "cleaning",
            },
          },
          above_text: {
            placeholders: {
              pct: "sensor.saros_10_cleaning_progress",
            },
            text: "{pct}%",
          },
        },
      };

      // Exercise
      separator_as_progress_bar.call(mockThis, mockCard, mockHass);

      // Verify - Check all DOM elements were created
      const wrapper = mockCard.querySelector(".bubble-line-wrapper");
      expect(wrapper).toBeTruthy();

      const element = wrapper.querySelector(".bubble-line");
      expect(element.classList.contains("bubble-line-progress")).toBe(true);

      // Verify height
      expect(wrapper.style.getPropertyValue("--bubble-line-height")).toBe("15px");

      // Verify progress width (80% from sensor.saros_10_cleaning_progress)
      expect(element.style.getPropertyValue("--progress-width")).toBe("80cqw");

      // Verify outline was set
      const outline = element.style.getPropertyValue("--bubble-line-progress-outline");
      expect(outline).toBe("solid 1px #1565c0");

      // Verify orb was created (80 > 60)
      const progressBar = element.querySelector(".bubble-line-progress-bar");
      const orb = progressBar.querySelector(".bubble-line-progress-orb");
      expect(orb).toBeTruthy();

      // Verify shine was NOT created (80 is not below 20)
      const shine = progressBar.querySelector(".bubble-line-progress-shine");
      expect(shine).toBeFalsy();

      // Verify text elements
      const aboveText = wrapper.querySelector(".bubble-line-text.above-text");
      expect(aboveText).toBeTruthy();
      expect(aboveText.innerText).toBe("80%");

      const belowText = wrapper.querySelector(".bubble-line-text.below-text");
      expect(belowText).toBeTruthy();
      expect(belowText.innerText).toBe("Cleaning Living Room");
    });
  });

  describe("Edge Cases", () => {
    it("should handle invalid progress values gracefully", () => {
      mockThis.config = {
        separator_as_progress_bar: {
          source: "sensor.invalid_progress",
          progress_style: {
            height: 10,
            color_stops: [{ color: "blue", percent: 0 }],
          },
        },
      };

      // Exercise
      separator_as_progress_bar.call(mockThis, mockCard, mockHass);

      // Verify - Should default to 0
      const element = mockCard.querySelector(".bubble-line");
      expect(element.style.getPropertyValue("--progress-width")).toBe("0cqw");
    });

    it("should handle negative progress values", () => {
      mockThis.config = {
        separator_as_progress_bar: {
          source: "sensor.negative_progress",
          progress_style: {
            height: 10,
            color_stops: [{ color: "blue", percent: 0 }],
          },
        },
      };

      // Exercise
      separator_as_progress_bar.call(mockThis, mockCard, mockHass);

      // Verify - Should default to 0
      const element = mockCard.querySelector(".bubble-line");
      expect(element.style.getPropertyValue("--progress-width")).toBe("0cqw");
    });

    it("should handle progress values above 100", () => {
      mockThis.config = {
        separator_as_progress_bar: {
          source: "sensor.high_progress",
          progress_style: {
            height: 10,
            color_stops: [{ color: "blue", percent: 0 }],
          },
        },
      };

      // Exercise
      separator_as_progress_bar.call(mockThis, mockCard, mockHass);

      // Verify - Should default to 0
      const element = mockCard.querySelector(".bubble-line");
      expect(element.style.getPropertyValue("--progress-width")).toBe("0cqw");
    });

    it("should handle invert mode correctly", () => {
      mockThis.config = {
        separator_as_progress_bar: {
          source: "sensor.task_progress", // 75%
          invert: true,
          progress_style: {
            height: 10,
            color_stops: [{ color: "blue", percent: 0 }],
          },
        },
      };

      // Exercise
      separator_as_progress_bar.call(mockThis, mockCard, mockHass);

      // Verify - Should be 100 - 75 = 25
      const element = mockCard.querySelector(".bubble-line");
      expect(element.style.getPropertyValue("--progress-width")).toBe("25cqw");
    });

    it("should handle missing entity gracefully", () => {
      mockThis.config = {
        separator_as_progress_bar: {
          source: "sensor.nonexistent_entity",
          progress_style: {
            height: 10,
            color_stops: [{ color: "blue", percent: 0 }],
          },
        },
      };

      // Exercise
      separator_as_progress_bar.call(mockThis, mockCard, mockHass);

      // Verify - Should default to 0
      const element = mockCard.querySelector(".bubble-line");
      expect(element.style.getPropertyValue("--progress-width")).toBe("0cqw");
    });

    it("should return early if no config", () => {
      mockThis.config = {};

      // Exercise
      separator_as_progress_bar.call(mockThis, mockCard, mockHass);

      // Verify - No wrapper should be created
      const wrapper = mockCard.querySelector(".bubble-line-wrapper");
      expect(wrapper).toBeFalsy();
    });

    it("should return early if no bubble-line element", () => {
      // Remove the bubble-line element
      mockCard.innerHTML = "";

      mockThis.config = {
        separator_as_progress_bar: {
          source: "sensor.task_progress",
          progress_style: { height: 10, color_stops: [{ color: "blue", percent: 0 }] },
        },
      };

      // Exercise
      separator_as_progress_bar.call(mockThis, mockCard, mockHass);

      // Verify - No wrapper should be created
      const wrapper = mockCard.querySelector(".bubble-line-wrapper");
      expect(wrapper).toBeFalsy();
    });

    it("should return early if no progress_style", () => {
      mockThis.config = {
        separator_as_progress_bar: {
          source: "sensor.task_progress",
          // No progress_style
        },
      };

      // Exercise
      separator_as_progress_bar.call(mockThis, mockCard, mockHass);

      // Verify - Wrapper should be created but no progress styling
      const wrapper = mockCard.querySelector(".bubble-line-wrapper");
      expect(wrapper).toBeTruthy();

      const element = wrapper.querySelector(".bubble-line");
      expect(element.classList.contains("bubble-line-progress")).toBe(false);
    });

    it("should handle override value correctly", () => {
      mockThis.config = {
        separator_as_progress_bar: {
          source: "sensor.task_progress", // This would be 75
          override: 30, // But override should take precedence
          progress_style: {
            height: 10,
            color_stops: [{ color: "blue", percent: 0 }],
          },
        },
      };

      // Exercise
      separator_as_progress_bar.call(mockThis, mockCard, mockHass);

      // Verify - Should use override value
      const element = mockCard.querySelector(".bubble-line");
      expect(element.style.getPropertyValue("--progress-width")).toBe("30cqw");
    });

    it("should remove border radius class when no border radius is set", () => {
      // Mock getComputedStyle to return empty border radius
      global.getComputedStyle = jest.fn().mockReturnValue({
        height: "2px",
        getPropertyValue: jest.fn(() => ""), // Empty border radius
      });

      mockThis.config = {
        separator_as_progress_bar: {
          source: "sensor.task_progress",
          progress_style: {
            height: 10,
            color_stops: [{ color: "blue", percent: 0 }],
          },
        },
      };

      // Exercise
      separator_as_progress_bar.call(mockThis, mockCard, mockHass);

      // Verify - Should remove border radius class
      const element = mockCard.querySelector(".bubble-line");
      expect(element.classList.contains("has-bubble-border-radius")).toBe(false);
    });

    it("should remove existing text element when condition is not met", () => {
      // First call to create the text element
      mockThis.config = {
        separator_as_progress_bar: {
          source: "sensor.washing_machine_progress",
          progress_style: {
            height: 16,
            color_stops: [{ color: "#4caf50", percent: 100 }],
          },
          above_text: {
            text: "Washing in progress",
            condition: {
              condition: "state",
              entity: "sensor.washer_status",
              state: "running",
            },
          },
        },
      };

      // Exercise - First call creates the text element
      separator_as_progress_bar.call(mockThis, mockCard, mockHass);

      // Verify text element was created
      let wrapper = mockCard.querySelector(".bubble-line-wrapper");
      let aboveText = wrapper.querySelector(".bubble-line-text.above-text");
      expect(aboveText).toBeTruthy();

      // Change the condition so it fails
      mockHass.states["sensor.washer_status"].state = "idle";

      // Exercise - Second call should remove the text element
      separator_as_progress_bar.call(mockThis, mockCard, mockHass);

      // Verify text element was removed
      wrapper = mockCard.querySelector(".bubble-line-wrapper");
      aboveText = wrapper.querySelector(".bubble-line-text.above-text");
      expect(aboveText).toBeFalsy();
    });

    it("should use default height of 6px when height is not provided", () => {
      mockThis.config = {
        separator_as_progress_bar: {
          source: "sensor.task_progress",
          progress_style: {
            // height is not provided - should default to 6px
            color_stops: [{ color: "blue", percent: 0 }],
          },
        },
      };

      // Exercise
      separator_as_progress_bar.call(mockThis, mockCard, mockHass);

      // Verify - Should use default height of 6px
      const wrapper = mockCard.querySelector(".bubble-line-wrapper");
      expect(wrapper.style.getPropertyValue("--bubble-line-height")).toBe("6px");
    });

    it("should use empty string for outline style when not provided", () => {
      mockThis.config = {
        separator_as_progress_bar: {
          source: "sensor.task_progress",
          progress_style: {
            height: 10,
            color_stops: [{ color: "blue", percent: 0 }],
            outline: {
              // style is not provided - should default to empty string
              color: "#1565c0",
              width: 1,
            },
          },
        },
      };

      // Exercise
      separator_as_progress_bar.call(mockThis, mockCard, mockHass);

      // Verify - Should use empty string for style
      const element = mockCard.querySelector(".bubble-line");
      const outline = element.style.getPropertyValue("--bubble-line-progress-outline");
      expect(outline).toBe(" 1px #1565c0"); // Empty string style + space + width + color
    });
  });

  describe("Condition Handling", () => {
    it("should return early when main condition is not met", () => {
      mockThis.config = {
        separator_as_progress_bar: {
          source: "sensor.task_progress",
          condition: {
            condition: "state",
            entity: "sensor.washer_status",
            state: "off", // Not running, so condition fails
          },
          progress_style: {
            height: 10,
            color_stops: [{ color: "blue", percent: 0 }],
          },
        },
      };

      // Exercise
      separator_as_progress_bar.call(mockThis, mockCard, mockHass);

      // Verify - Wrapper should be created but no progress styling
      const wrapper = mockCard.querySelector(".bubble-line-wrapper");
      expect(wrapper).toBeTruthy();

      const element = wrapper.querySelector(".bubble-line");
      expect(element.classList.contains("bubble-line-progress")).toBe(false);
    });
  });

  describe("Orb Settings - Comprehensive Branch Coverage", () => {
    // Test Matrix from agent_context.md - All combinations of orb settings

    describe("Main Conditional Branch Tests", () => {
      // Tests 1-2: Parameterized test for orbSettings falsy values
      it.each([
        { testNum: 1, orbSettings: undefined, description: "undefined" },
        { testNum: 2, orbSettings: null, description: "null" },
      ])("Test $testNum: should not create orb when orbSettings is $description", ({ orbSettings }) => {
        const progressStyle = {
          height: 10,
          color_stops: [{ color: "blue", percent: 0 }],
        };

        // Only add orb_settings property if it's not undefined
        if (orbSettings !== undefined) {
          progressStyle.orb_settings = orbSettings;
        }

        mockThis.config = {
          separator_as_progress_bar: {
            source: "sensor.task_progress",
            progress_style: progressStyle,
          },
        };

        separator_as_progress_bar.call(mockThis, mockCard, mockHass);

        const element = mockCard.querySelector(".bubble-line");
        const progressBar = element.querySelector(".bubble-line-progress-bar");
        const orb = progressBar.querySelector(".bubble-line-progress-orb");
        expect(orb).toBeFalsy();
      });

      // Tests 3-5: Parameterized test for show_orb falsy values
      it.each([
        { testNum: 3, showOrb: undefined, description: "undefined (defaults to false)" },
        { testNum: 4, showOrb: null, description: "null (defaults to false)" },
        { testNum: 5, showOrb: false, description: "explicitly false" },
      ])("Test $testNum: should not create orb when show_orb is $description", ({ showOrb }) => {
        const orbSettings = {
          orb_color: "#ff0000",
          trail_color: "#00ff00",
        };

        // Only add show_orb property if it's not undefined
        if (showOrb !== undefined) {
          orbSettings.show_orb = showOrb;
        }

        mockThis.config = {
          separator_as_progress_bar: {
            source: "sensor.task_progress",
            progress_style: {
              height: 10,
              color_stops: [{ color: "blue", percent: 0 }],
              orb_settings: orbSettings,
            },
          },
        };

        separator_as_progress_bar.call(mockThis, mockCard, mockHass);

        const element = mockCard.querySelector(".bubble-line");
        const progressBar = element.querySelector(".bubble-line-progress-bar");
        const orb = progressBar.querySelector(".bubble-line-progress-orb");
        expect(orb).toBeFalsy();
      });

      // Tests 6-7: Parameterized test for orb element creation with truthy conditions
      it.each([
        { testNum: 6, condition: undefined, description: "condition is undefined (defaults to true)" },
        { testNum: 7, condition: null, description: "condition is null (defaults to true)" },
      ])("Test $testNum: should create orb when show_orb is true and $description", ({ condition }) => {
        const orbSettings = {
          show_orb: true,
          slow_orb: true,
          orb_color: "#ff0000",
          trail_color: "#00ff00",
        };

        // Only add condition property if it's not undefined
        if (condition !== undefined) {
          orbSettings.condition = condition;
        }

        mockThis.config = {
          separator_as_progress_bar: {
            source: "sensor.task_progress",
            progress_style: {
              height: 10,
              color_stops: [{ color: "blue", percent: 0 }],
              orb_settings: orbSettings,
            },
          },
        };

        separator_as_progress_bar.call(mockThis, mockCard, mockHass);

        const element = mockCard.querySelector(".bubble-line");
        const progressBar = element.querySelector(".bubble-line-progress-bar");
        const orb = progressBar.querySelector(".bubble-line-progress-orb");

        // Verify orb element was created
        expect(orb).toBeTruthy();
        expect(orb.className).toBe("bubble-line-progress-orb");

        // Verify all CSS properties are set correctly
        expect(orb.style.animation).toContain("orb-slow");
        expect(orb.style.animation).toContain("2s ease-in-out infinite");
        expect(orb.style.getPropertyValue("--bubble-line-progress-orb-color")).toBeTruthy();
        expect(orb.style.getPropertyValue("--bubble-line-progress-orb-trail-color")).toBeTruthy();
      });

      it("Test 8: should not create orb when condition fails", () => {
        mockThis.config = {
          separator_as_progress_bar: {
            source: "sensor.task_progress",
            progress_style: {
              height: 10,
              color_stops: [{ color: "blue", percent: 0 }],
              orb_settings: {
                show_orb: true,
                condition: {
                  condition: "numeric_state",
                  entity: "sensor.task_progress",
                  above: 80, // 75 is not above 80, so condition fails
                },
                orb_color: "#ff0000",
                trail_color: "#00ff00",
              },
            },
          },
        };

        separator_as_progress_bar.call(mockThis, mockCard, mockHass);

        const element = mockCard.querySelector(".bubble-line");
        const progressBar = element.querySelector(".bubble-line-progress-bar");
        const orb = progressBar.querySelector(".bubble-line-progress-orb");
        expect(orb).toBeFalsy();
      });

      it("Test 9: should create orb when condition passes", () => {
        mockThis.config = {
          separator_as_progress_bar: {
            source: "sensor.task_progress",
            progress_style: {
              height: 10,
              color_stops: [{ color: "blue", percent: 0 }],
              orb_settings: {
                show_orb: true,
                condition: {
                  condition: "numeric_state",
                  entity: "sensor.task_progress",
                  above: 50, // 75 is above 50, so condition passes
                },
                slow_orb: false,
                orb_color: "#00ff00",
                trail_color: "#ff0000",
              },
            },
          },
        };

        separator_as_progress_bar.call(mockThis, mockCard, mockHass);

        const element = mockCard.querySelector(".bubble-line");
        const progressBar = element.querySelector(".bubble-line-progress-bar");
        const orb = progressBar.querySelector(".bubble-line-progress-orb");

        expect(orb).toBeTruthy();
        expect(orb.className).toBe("bubble-line-progress-orb");

        // Verify all properties are set
        expect(orb.style.animation).toContain("orb-fast");
        expect(orb.style.animation).toContain("2s linear infinite");
        expect(orb.style.getPropertyValue("--bubble-line-progress-orb-color")).toBeTruthy();
        expect(orb.style.getPropertyValue("--bubble-line-progress-orb-trail-color")).toBeTruthy();
      });

      it("Test 10: should not create duplicate orb element when element already exists", () => {
        mockThis.config = {
          separator_as_progress_bar: {
            source: "sensor.task_progress",
            progress_style: {
              height: 10,
              color_stops: [{ color: "blue", percent: 0 }],
              orb_settings: {
                show_orb: true,
                orb_color: "#ffffff",
                trail_color: "#000000",
              },
            },
          },
        };

        // First call should create the orb element
        separator_as_progress_bar.call(mockThis, mockCard, mockHass);

        const element = mockCard.querySelector(".bubble-line");
        const progressBar = element.querySelector(".bubble-line-progress-bar");
        const orbElements = progressBar.querySelectorAll(".bubble-line-progress-orb");
        expect(orbElements).toHaveLength(1);

        // Second call should not create duplicate
        separator_as_progress_bar.call(mockThis, mockCard, mockHass);

        const orbElementsAfterSecondCall = progressBar.querySelectorAll(".bubble-line-progress-orb");
        expect(orbElementsAfterSecondCall).toHaveLength(1);
      });
    });

    describe("Animation Branch Tests", () => {
      // Test animation branch logic: slowOrb ? "slow 2s ease-in-out infinite" : "fast 2s linear infinite"
      it.each([
        {
          slowOrb: undefined,
          expectedAnimation: "orb-fast 2s linear infinite",
          description: "fast animation when slow_orb is undefined (defaults to false)",
        },
        {
          slowOrb: false,
          expectedAnimation: "orb-fast 2s linear infinite",
          description: "fast animation when slow_orb is explicitly false",
        },
        {
          slowOrb: true,
          expectedAnimation: "orb-slow 2s ease-in-out infinite",
          description: "slow animation when slow_orb is true",
        },
      ])("should set $description", ({ slowOrb, expectedAnimation }) => {
        const orbSettings = {
          show_orb: true,
          orb_color: "#ff0000",
          trail_color: "#00ff00",
        };

        // Only add slow_orb property if it's not undefined
        if (slowOrb !== undefined) {
          orbSettings.slow_orb = slowOrb;
        }

        mockThis.config = {
          separator_as_progress_bar: {
            source: "sensor.task_progress",
            progress_style: {
              height: 10,
              color_stops: [{ color: "blue", percent: 0 }],
              orb_settings: orbSettings,
            },
          },
        };

        separator_as_progress_bar.call(mockThis, mockCard, mockHass);

        const element = mockCard.querySelector(".bubble-line");
        const progressBar = element.querySelector(".bubble-line-progress-bar");
        const orb = progressBar.querySelector(".bubble-line-progress-orb");

        expect(orb).toBeTruthy();
        expect(orb.style.animation).toBe(expectedAnimation);
      });
    });

    describe("Property Verification Tests", () => {
      describe("Color Properties", () => {
        it("should set default colors when orb_color and trail_color are undefined", () => {
          mockThis.config = {
            separator_as_progress_bar: {
              source: "sensor.task_progress",
              progress_style: {
                height: 10,
                color_stops: [{ color: "blue", percent: 0 }],
                orb_settings: {
                  show_orb: true,
                  // orb_color and trail_color are undefined
                },
              },
            },
          };

          separator_as_progress_bar.call(mockThis, mockCard, mockHass);

          const element = mockCard.querySelector(".bubble-line");
          const progressBar = element.querySelector(".bubble-line-progress-bar");
          const orb = progressBar.querySelector(".bubble-line-progress-orb");

          expect(orb).toBeTruthy();
          // resolveColor(undefined) should return a default value
          expect(orb.style.getPropertyValue("--bubble-line-progress-orb-color")).toBeTruthy();
          expect(orb.style.getPropertyValue("--bubble-line-progress-orb-trail-color")).toBeTruthy();
        });

        it("should set custom colors when orb_color and trail_color are provided", () => {
          mockThis.config = {
            separator_as_progress_bar: {
              source: "sensor.task_progress",
              progress_style: {
                height: 10,
                color_stops: [{ color: "blue", percent: 0 }],
                orb_settings: {
                  show_orb: true,
                  orb_color: "#ff0000",
                  trail_color: "#00ff00",
                },
              },
            },
          };

          separator_as_progress_bar.call(mockThis, mockCard, mockHass);

          const element = mockCard.querySelector(".bubble-line");
          const progressBar = element.querySelector(".bubble-line-progress-bar");
          const orb = progressBar.querySelector(".bubble-line-progress-orb");

          expect(orb).toBeTruthy();
          // Custom colors should be resolved and set
          expect(orb.style.getPropertyValue("--bubble-line-progress-orb-color")).toBeTruthy();
          expect(orb.style.getPropertyValue("--bubble-line-progress-orb-trail-color")).toBeTruthy();
        });
      });

      describe("Complete Property Set Verification", () => {
        it("should set all 3 CSS properties when orb is created", () => {
          mockThis.config = {
            separator_as_progress_bar: {
              source: "sensor.task_progress",
              progress_style: {
                height: 10,
                color_stops: [{ color: "blue", percent: 0 }],
                orb_settings: {
                  show_orb: true,
                  slow_orb: true,
                  orb_color: "#123456",
                  trail_color: "#789abc",
                },
              },
            },
          };

          separator_as_progress_bar.call(mockThis, mockCard, mockHass);

          const element = mockCard.querySelector(".bubble-line");
          const progressBar = element.querySelector(".bubble-line-progress-bar");
          const orb = progressBar.querySelector(".bubble-line-progress-orb");

          expect(orb).toBeTruthy();

          // Verify all 3 properties are set
          expect(orb.style.animation).toBe("orb-slow 2s ease-in-out infinite");
          expect(orb.style.getPropertyValue("--bubble-line-progress-orb-color")).toBeTruthy();
          expect(orb.style.getPropertyValue("--bubble-line-progress-orb-trail-color")).toBeTruthy();

          // Verify no additional unexpected properties
          const setProperties = Array.from(orb.style).filter(
            (prop) => prop.startsWith("--bubble-line-progress-orb") || prop === "animation",
          );
          expect(setProperties).toHaveLength(3);
        });
      });
    });

    describe("DOM Structure Verification", () => {
      it("should create orb element with correct DOM structure", () => {
        mockThis.config = {
          separator_as_progress_bar: {
            source: "sensor.task_progress",
            progress_style: {
              height: 10,
              color_stops: [{ color: "blue", percent: 0 }],
              orb_settings: {
                show_orb: true,
                orb_color: "#ffffff",
                trail_color: "#000000",
              },
            },
          },
        };

        separator_as_progress_bar.call(mockThis, mockCard, mockHass);

        const element = mockCard.querySelector(".bubble-line");
        const progressBar = element.querySelector(".bubble-line-progress-bar");
        const orb = progressBar.querySelector(".bubble-line-progress-orb");

        // Verify element creation and structure
        expect(orb).toBeTruthy();
        expect(orb.tagName).toBe("DIV");
        expect(orb.className).toBe("bubble-line-progress-orb");
        expect(orb.parentElement).toBe(progressBar);

        // Verify it's the only orb element
        const allOrbs = progressBar.querySelectorAll(".bubble-line-progress-orb");
        expect(allOrbs).toHaveLength(1);
        expect(allOrbs[0]).toBe(orb);
      });
    });

    describe("Complex Condition Tests", () => {
      it("should handle complex conditions with state checks", () => {
        mockThis.config = {
          separator_as_progress_bar: {
            source: "sensor.task_progress",
            progress_style: {
              height: 10,
              color_stops: [{ color: "blue", percent: 0 }],
              orb_settings: {
                show_orb: true,
                condition: {
                  condition: "and",
                  conditions: [
                    {
                      condition: "numeric_state",
                      entity: "sensor.task_progress",
                      above: 50,
                    },
                    {
                      condition: "state",
                      entity: "sensor.task_progress",
                      state: "75",
                    },
                  ],
                },
                slow_orb: false,
                orb_color: "#00ff00",
                trail_color: "#ff0000",
              },
            },
          },
        };

        separator_as_progress_bar.call(mockThis, mockCard, mockHass);

        const element = mockCard.querySelector(".bubble-line");
        const progressBar = element.querySelector(".bubble-line-progress-bar");
        const orb = progressBar.querySelector(".bubble-line-progress-orb");

        // Complex condition should pass (75 > 50 AND state = "75")
        expect(orb).toBeTruthy();
        expect(orb.style.animation).toContain("orb-fast");
      });

      it("should handle array-based conditions", () => {
        mockThis.config = {
          separator_as_progress_bar: {
            source: "sensor.task_progress",
            progress_style: {
              height: 10,
              color_stops: [{ color: "blue", percent: 0 }],
              orb_settings: {
                show_orb: true,
                condition: {
                  condition: "state",
                  entity: "sensor.task_progress",
                  state: ["75", "100", "50"], // 75 is in this array
                },
                slow_orb: true,
                orb_color: "#0000ff",
                trail_color: "#ffff00",
              },
            },
          },
        };

        separator_as_progress_bar.call(mockThis, mockCard, mockHass);

        const element = mockCard.querySelector(".bubble-line");
        const progressBar = element.querySelector(".bubble-line-progress-bar");
        const orb = progressBar.querySelector(".bubble-line-progress-orb");

        // Array condition should pass (state "75" is in array)
        expect(orb).toBeTruthy();
        expect(orb.style.animation).toContain("orb-slow");
      });
    });
  });

  describe("DOM Cleanup - Independent Conditions", () => {
    it("should properly clean up DOM elements when independent conditions change from true to false", () => {
      // Setup - All 5 independent conditions initially true
      const baseConfig = {
        separator_as_progress_bar: {
          source: "sensor.progress_value",
          condition: {
            condition: "state",
            entity: "sensor.overall_condition",
            state: "true",
          },
          progress_style: {
            height: 10,
            color_stops: [{ color: "blue", percent: 0 }],
            shine_settings: {
              show_shine: true,
              condition: {
                condition: "state",
                entity: "sensor.shine_condition",
                state: "true",
              },
              shine_color: "rgba(255,255,255,0.4)",
            },
            orb_settings: {
              show_orb: true,
              condition: {
                condition: "state",
                entity: "sensor.orb_condition",
                state: "true",
              },
              orb_color: "#ff0000",
            },
          },
          above_text: {
            text: "Above Text",
            condition: {
              condition: "state",
              entity: "sensor.above_condition",
              state: "true",
            },
          },
          below_text: {
            text: "Below Text",
            condition: {
              condition: "state",
              entity: "sensor.below_condition",
              state: "true",
            },
          },
        },
      };

      // Initialize all condition entities to true
      mockHass.states["sensor.overall_condition"] = { state: "true" };
      mockHass.states["sensor.shine_condition"] = { state: "true" };
      mockHass.states["sensor.orb_condition"] = { state: "true" };
      mockHass.states["sensor.above_condition"] = { state: "true" };
      mockHass.states["sensor.below_condition"] = { state: "true" };
      mockHass.states["sensor.progress_value"] = { state: "50" };

      mockThis.config = JSON.parse(JSON.stringify(baseConfig));

      // Step 0: Initial setup - all elements should be present
      separator_as_progress_bar.call(mockThis, mockCard, mockHass);

      const element = mockCard.querySelector(".bubble-line");
      const wrapper = mockCard.querySelector(".bubble-line-wrapper");
      const progressBar = element.querySelector(".bubble-line-progress-bar");

      // Verify all elements are initially present
      expect(element.classList.contains("bubble-line-progress")).toBe(true);
      expect(progressBar.querySelector(".bubble-line-progress-shine")).toBeTruthy();
      expect(progressBar.querySelector(".bubble-line-progress-orb")).toBeTruthy();
      expect(wrapper.querySelector(".bubble-line-text.above-text")).toBeTruthy();
      expect(wrapper.querySelector(".bubble-line-text.below-text")).toBeTruthy();

      // Step 1: Disable overall condition - progress bar should be cleaned up
      mockHass.states["sensor.overall_condition"] = { state: "false" };
      separator_as_progress_bar.call(mockThis, mockCard, mockHass);

      expect(element.classList.contains("bubble-line-progress")).toBe(false);
      expect(progressBar.querySelector(".bubble-line-progress-shine")).toBeTruthy(); // Should still exist
      expect(progressBar.querySelector(".bubble-line-progress-orb")).toBeTruthy(); // Should still exist
      expect(wrapper.querySelector(".bubble-line-text.above-text")).toBeTruthy(); // Should still exist
      expect(wrapper.querySelector(".bubble-line-text.below-text")).toBeTruthy(); // Should still exist

      // Step 2: Re-enable overall, disable shine - shine should be cleaned up
      mockHass.states["sensor.overall_condition"] = { state: "true" };
      mockHass.states["sensor.shine_condition"] = { state: "false" };
      separator_as_progress_bar.call(mockThis, mockCard, mockHass);

      expect(element.classList.contains("bubble-line-progress")).toBe(true);
      expect(progressBar.querySelector(".bubble-line-progress-shine")).toBeFalsy(); // Should be removed
      expect(progressBar.querySelector(".bubble-line-progress-orb")).toBeTruthy(); // Should still exist
      expect(wrapper.querySelector(".bubble-line-text.above-text")).toBeTruthy(); // Should still exist
      expect(wrapper.querySelector(".bubble-line-text.below-text")).toBeTruthy(); // Should still exist

      // Step 3: Re-enable shine, disable orb - orb should be cleaned up
      mockHass.states["sensor.shine_condition"] = { state: "true" };
      mockHass.states["sensor.orb_condition"] = { state: "false" };
      separator_as_progress_bar.call(mockThis, mockCard, mockHass);

      expect(element.classList.contains("bubble-line-progress")).toBe(true);
      expect(progressBar.querySelector(".bubble-line-progress-shine")).toBeTruthy(); // Should exist again
      expect(progressBar.querySelector(".bubble-line-progress-orb")).toBeFalsy(); // Should be removed
      expect(wrapper.querySelector(".bubble-line-text.above-text")).toBeTruthy(); // Should still exist
      expect(wrapper.querySelector(".bubble-line-text.below-text")).toBeTruthy(); // Should still exist

      // Step 4: Re-enable orb, disable above text - above text should be cleaned up
      mockHass.states["sensor.orb_condition"] = { state: "true" };
      mockHass.states["sensor.above_condition"] = { state: "false" };
      separator_as_progress_bar.call(mockThis, mockCard, mockHass);

      expect(element.classList.contains("bubble-line-progress")).toBe(true);
      expect(progressBar.querySelector(".bubble-line-progress-shine")).toBeTruthy(); // Should still exist
      expect(progressBar.querySelector(".bubble-line-progress-orb")).toBeTruthy(); // Should exist again
      expect(wrapper.querySelector(".bubble-line-text.above-text")).toBeFalsy(); // Should be removed
      expect(wrapper.querySelector(".bubble-line-text.below-text")).toBeTruthy(); // Should still exist

      // Step 5: Re-enable above, disable below text - below text should be cleaned up
      mockHass.states["sensor.above_condition"] = { state: "true" };
      mockHass.states["sensor.below_condition"] = { state: "false" };
      separator_as_progress_bar.call(mockThis, mockCard, mockHass);

      expect(element.classList.contains("bubble-line-progress")).toBe(true);
      expect(progressBar.querySelector(".bubble-line-progress-shine")).toBeTruthy(); // Should still exist
      expect(progressBar.querySelector(".bubble-line-progress-orb")).toBeTruthy(); // Should still exist
      expect(wrapper.querySelector(".bubble-line-text.above-text")).toBeTruthy(); // Should exist again
      expect(wrapper.querySelector(".bubble-line-text.below-text")).toBeFalsy(); // Should be removed

      // Step 6: Re-enable all conditions - all elements should be restored
      mockHass.states["sensor.below_condition"] = { state: "true" };
      separator_as_progress_bar.call(mockThis, mockCard, mockHass);

      expect(element.classList.contains("bubble-line-progress")).toBe(true);
      expect(progressBar.querySelector(".bubble-line-progress-shine")).toBeTruthy();
      expect(progressBar.querySelector(".bubble-line-progress-orb")).toBeTruthy();
      expect(wrapper.querySelector(".bubble-line-text.above-text")).toBeTruthy();
      expect(wrapper.querySelector(".bubble-line-text.below-text")).toBeTruthy(); // Should exist again
    });
  });
});
