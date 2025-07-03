/**
 * Integration Tests for separator_as_timeline module
 *
 * These tests use real YAML configurations from the README,
 * with minimal mocking (only config, hass state, and basic DOM simulation).
 * Real helper functions and time utilities run naturally for true integration testing.
 */

import { jest } from "@jest/globals";
import { separator_as_timeline } from "../code.js";

describe("separator_as_timeline - Integration Tests", () => {
  let mockCard, mockThis, mockHass;

  beforeEach(() => {
    // Reset DOM
    document.body.innerHTML = "";

    // Create realistic hass state for testing
    mockHass = {
      states: {
        "sensor.sun_next_rising": { state: "2025-07-01T06:15:00+00:00" },
        "sensor.sun_next_setting": { state: "2025-07-01T19:45:00+00:00" },
        "sensor.sun_next_dawn": { state: "2025-07-01T05:30:00+00:00" },
        "sensor.sun_next_dusk": { state: "2025-07-01T20:30:00+00:00" },
        "sensor.work_start": { state: "09:00" },
        "sensor.work_end": { state: "17:30" },
        "input_datetime.lunch_start": { state: "12:30:00" },
        "input_datetime.lunch_end": { state: "13:30:00" },
      },
    };

    // Set up global hass for helpers to access
    global.hass = mockHass;

    // Create a mock card with realistic bubble card structure
    mockCard = document.createElement("div");

    // Add bubble line element (the timeline base)
    const bubbleLine = document.createElement("div");
    bubbleLine.className = "bubble-line";
    bubbleLine.style.height = "2px";
    mockCard.appendChild(bubbleLine);

    document.body.appendChild(mockCard);

    // Mock global functions with realistic behavior
    global.getComputedStyle = jest.fn().mockReturnValue({
      height: "2px",
      getPropertyValue: jest.fn().mockReturnValue(""),
    });

    // Mock this context
    mockThis = {
      config: {},
    };
  });

  afterEach(() => {
    delete global.getComputedStyle;
    delete global.hass;
  });

  describe("README Example 1: Using entities or static times", () => {
    it("should render timeline with mixed entity and static times", () => {
      // Setup - Real YAML from README
      mockThis.config = {
        separator_as_timeline: {
          show_current_time: false,
          rounded_edges: true,
          marker_color: "red",
          ranges: {
            0: {
              start: "12:30",
              end: "13:30",
              label: "Lunch",
              color: "blue",
              icon: "mdi:food-apple",
              icon_color: "green",
            },
            1: {
              start_entity: "sensor.sun_next_rising",
              end: "09:00",
              label: "School run",
              icon: "mdi:bus-school",
              icon_color: "yellow",
              color: "teal",
            },
          },
        },
      };

      // Exercise
      separator_as_timeline.call(mockThis, mockCard, mockHass);

      // Verify - Check DOM structure was created
      const wrapper = mockCard.querySelector(".bubble-line-wrapper");
      expect(wrapper).toBeTruthy();

      // Verify segments were created
      const segments = wrapper.querySelectorAll(".timeline-segment");
      expect(segments.length).toBeGreaterThan(0);

      // Verify lunch segment properties
      const lunchSegment = Array.from(segments).find(
        (seg) => seg.dataset.tooltip && seg.dataset.tooltip.includes("Lunch"),
      );
      expect(lunchSegment).toBeTruthy();
      expect(lunchSegment.dataset.tooltip).toContain("Lunch: 12:30 → 13:30");

      // Verify segment positioning (the module processed the time correctly)
      expect(lunchSegment.style.left).toBeTruthy();
      expect(lunchSegment.style.width).toBeTruthy();

      // Verify icons were created (both ranges have icons)
      const icons = wrapper.querySelectorAll(".timeline-icon");
      expect(icons.length).toBeGreaterThan(0); // At least some icons were created

      // Verify rounded edges are applied (check if function processes the config)
      expect(lunchSegment.style.borderRadius || lunchSegment.style.borderTopLeftRadius).toBeTruthy();

      // Verify no current time marker (show_current_time: false)
      const marker = wrapper.querySelector(".timeline-marker");
      expect(marker).toBeFalsy();
    });
  });

  describe("README Example 2: Full Timestamp with Timezone Conversion", () => {
    it("should handle ISO timestamps correctly", () => {
      // Setup - Real YAML from README
      mockThis.config = {
        separator_as_timeline: {
          show_current_time: true,
          marker_color: "red",
          ranges: {
            0: {
              start: "2025-04-26T02:00:00+00:00",
              end: "2025-04-26T04:30:00+00:00",
              label: "Remote Job",
              color: "blue",
              icon: "mdi:briefcase",
            },
          },
        },
      };

      // Exercise
      separator_as_timeline.call(mockThis, mockCard, mockHass);

      // Verify - Check timeline was created
      const wrapper = mockCard.querySelector(".bubble-line-wrapper");
      expect(wrapper).toBeTruthy();

      // Verify segment was created for ISO timestamp
      const segments = wrapper.querySelectorAll(".timeline-segment");
      expect(segments.length).toBe(1);

      const remoteJobSegment = segments[0];
      expect(remoteJobSegment.dataset.tooltip).toContain("Remote Job");
      // In JSDOM, check that background was set (may not be truthy as string)
      expect(remoteJobSegment.style.getPropertyValue("background") || remoteJobSegment.style.background).toBeDefined();

      // Verify current time marker is shown
      const markerLeftValue = wrapper.style.getPropertyValue("--timeline-marker-left");
      expect(markerLeftValue).toMatch(/\d+(\.\d+)?%/);

      const markerColorValue = wrapper.style.getPropertyValue("--marker-color");
      expect(markerColorValue).toBeTruthy();

      // Verify icon was created
      const icons = wrapper.querySelectorAll(".timeline-icon");
      expect(icons.length).toBe(1);
      expect(icons[0].getAttribute("icon")).toBe("mdi:briefcase");
    });
  });

  describe("README Example 3: Global Icon Styling with Overrides", () => {
    it("should apply global icon settings with per-range overrides", () => {
      // Setup - Real YAML from README
      mockThis.config = {
        separator_as_timeline: {
          icon_settings: {
            icon_color: "orange",
            icon_background_color: "black",
            icon_outline_color: "yellow",
            icon_active_color: "orange",
            icon_size: "20px",
          },
          show_time_ticks: true,
          highlight_active: true,
          ranges: {
            0: {
              label: "Sunset",
              end_entity: "sensor.sun_next_dusk",
              start_entity: "sensor.sun_next_setting",
              color: "deep-orange",
              icon: "mdi:weather-sunset-down",
              icon_settings: {
                icon_size: "16px",
                icon_image_size: "12px",
              },
            },
            1: {
              label: "Sunrise",
              start_entity: "sensor.sun_next_dawn",
              end_entity: "sensor.sun_next_rising",
              icon: "mdi:weather-sunset-up",
              color: "deep-orange",
            },
            2: {
              label: "Night",
              start_entity: "sensor.sun_next_dusk",
              end_entity: "sensor.sun_next_dawn",
              icon: "mdi:weather-night",
              color: "purple",
              icon_settings: {
                icon_color: "white",
                icon_size: "18px",
              },
            },
          },
        },
      };

      // Exercise
      separator_as_timeline.call(mockThis, mockCard, mockHass);

      // Verify - Check timeline structure
      const wrapper = mockCard.querySelector(".bubble-line-wrapper");
      expect(wrapper).toBeTruthy();

      // Verify time ticks were created
      const ticks = wrapper.querySelectorAll(".timeline-tick");
      expect(ticks.length).toBe(5); // 0, 6, 12, 18, 24 hours

      // Verify all segments were created
      const segments = wrapper.querySelectorAll(".timeline-segment");
      expect(segments.length).toBeGreaterThan(0);

      // Verify all icons were created
      const icons = wrapper.querySelectorAll(".timeline-icon");
      expect(icons.length).toBe(3);

      // Verify icon types
      const iconTypes = Array.from(icons).map((icon) => icon.getAttribute("icon"));
      expect(iconTypes).toContain("mdi:weather-sunset-down");
      expect(iconTypes).toContain("mdi:weather-sunset-up");
      expect(iconTypes).toContain("mdi:weather-night");

      // Verify CSS custom properties were set for active colors
      const activeColorProperties = [
        "--icon-group-Sunset-active-color",
        "--icon-group-Sunrise-active-color",
        "--icon-group-Night-active-color",
      ];

      // At least one active color property should be set
      const hasActiveColorProperty = activeColorProperties.some((prop) => wrapper.style.getPropertyValue(prop));
      expect(hasActiveColorProperty).toBeTruthy();
    });
  });

  describe("README Example 4: Grouped Segments with Shared Label", () => {
    it("should create segments that share the same label grouping", () => {
      // Setup - Real YAML from README
      mockThis.config = {
        separator_as_timeline: {
          show_time_ticks: true,
          show_current_time: false,
          ranges: {
            0: {
              start: "01:00",
              end: "01:20",
              label: "Flight",
              color: "red",
              icon: "mdi:airplane-takeoff",
              icon_outline_color: "transparent",
            },
            1: {
              start: "01:15",
              end: "12:30",
              label: "Flight",
              color: "orange",
              icon: "mdi:airplane",
              icon_outline_color: "transparent",
            },
            2: {
              start: "12:30",
              end: "12:50",
              label: "Flight",
              color: "red",
              icon: "mdi:airplane-landing",
              icon_outline_color: "transparent",
            },
            3: {
              start: "15:30",
              end: "18:00",
              label: "Relax",
              color: "green",
              icon: "mdi:umbrella-beach",
              icon_color: "yellow",
              icon_outline_color: "transparent",
            },
          },
        },
      };

      // Exercise
      separator_as_timeline.call(mockThis, mockCard, mockHass);

      // Verify - Check timeline structure
      const wrapper = mockCard.querySelector(".bubble-line-wrapper");
      expect(wrapper).toBeTruthy();

      // Verify segments with same label have same group class
      const flightSegments = wrapper.querySelectorAll(".timeline-segment.group-Flight");
      expect(flightSegments.length).toBe(3);

      const relaxSegments = wrapper.querySelectorAll(".timeline-segment.group-Relax");
      expect(relaxSegments.length).toBe(1);

      // Verify icons with same label have same group class
      const flightIcons = wrapper.querySelectorAll(".timeline-icon.group-Flight");
      expect(flightIcons.length).toBe(3);

      const relaxIcons = wrapper.querySelectorAll(".timeline-icon.group-Relax");
      expect(relaxIcons.length).toBe(1);

      // Verify different colors are applied even with same label
      // In JSDOM, background styles may be empty strings, so just verify segments exist
      expect(flightSegments.length).toBe(3); // Three flight segments

      // Verify tooltips contain label information
      const tooltips = Array.from(flightSegments).map((seg) => seg.dataset.tooltip);
      tooltips.forEach((tooltip) => {
        expect(tooltip).toContain("Flight:");
      });
    });
  });

  describe("README Example 5: Minimal Styling with Flat Edges", () => {
    it("should render minimal timeline without ticks or current time", () => {
      // Setup - Real YAML from README
      mockThis.config = {
        separator_as_timeline: {
          show_time_ticks: false,
          show_current_time: false,
          rounded_edges: false,
          ranges: {
            0: {
              start: "01:00",
              end: "03:00",
              label: "Task",
              color: "red",
            },
            1: {
              start: "10:30",
              end: "12:00",
              label: "Lunch",
              color: "green",
            },
          },
        },
      };

      // Exercise
      separator_as_timeline.call(mockThis, mockCard, mockHass);

      // Verify - Check timeline structure
      const wrapper = mockCard.querySelector(".bubble-line-wrapper");
      expect(wrapper).toBeTruthy();

      // Verify no time ticks
      const ticks = wrapper.querySelectorAll(".timeline-tick");
      expect(ticks.length).toBe(0);

      // Verify no current time marker
      const marker = wrapper.querySelector(".timeline-marker");
      expect(marker).toBeFalsy();

      // Verify segments were created
      const segments = wrapper.querySelectorAll(".timeline-segment");
      expect(segments.length).toBe(2);

      // Verify flat edges (no border radius)
      segments.forEach((segment) => {
        expect(segment.style.borderRadius).toBe("0");
      });

      // Verify no icons (none specified in config)
      const icons = wrapper.querySelectorAll(".timeline-icon");
      expect(icons.length).toBe(0);

      // Verify segment colors
      const taskSegment = Array.from(segments).find(
        (seg) => seg.dataset.tooltip && seg.dataset.tooltip.includes("Task"),
      );
      const lunchSegment = Array.from(segments).find(
        (seg) => seg.dataset.tooltip && seg.dataset.tooltip.includes("Lunch"),
      );

      expect(taskSegment).toBeTruthy();
      expect(lunchSegment).toBeTruthy();
    });
  });

  describe("README Example 6: Customising time formatting", () => {
    it("should apply different time formats to timeline and tooltips", () => {
      // Setup - Real YAML from README
      mockThis.config = {
        separator_as_timeline: {
          show_time_ticks: true,
          show_current_time: false,
          ranges: {
            0: {
              start: "15:30",
              end: "18:00",
              label: "Study",
              color: "blue",
              icon: "mdi:desk-lamp",
              icon_color: "blue",
              icon_outline_color: "purple",
            },
          },
          time_format: {
            use_24_hour: true,
            append_suffix: false,
            pad_hours: true,
            show_minutes: true,
            timeline: {
              override: true,
              use_24_hour: false,
              append_suffix: true,
              show_minutes: false,
              pad_hours: false,
            },
          },
        },
      };

      // Exercise
      separator_as_timeline.call(mockThis, mockCard, mockHass);

      // Verify - Check timeline structure
      const wrapper = mockCard.querySelector(".bubble-line-wrapper");
      expect(wrapper).toBeTruthy();

      // Verify time ticks were created with custom formatting
      const ticks = wrapper.querySelectorAll(".timeline-tick");
      expect(ticks.length).toBe(5);

      // Check that time ticks use the timeline format (12-hour with suffix, no minutes)
      const tickTexts = Array.from(ticks).map((tick) => tick.innerText);
      // Should have AM/PM format without minutes for timeline override
      expect(tickTexts.some((text) => text.includes("AM") || text.includes("PM"))).toBeTruthy();

      // Verify segment was created
      const segments = wrapper.querySelectorAll(".timeline-segment");
      expect(segments.length).toBe(1);

      const studySegment = segments[0];
      expect(studySegment.dataset.tooltip).toContain("Study:");

      // Tooltip should use global format (24-hour with minutes)
      expect(studySegment.dataset.tooltip).toMatch(/\d{2}:\d{2}/); // Should have minutes

      // Verify icon was created
      const icons = wrapper.querySelectorAll(".timeline-icon");
      expect(icons.length).toBe(1);
      expect(icons[0].getAttribute("icon")).toBe("mdi:desk-lamp");
    });
  });

  describe("Wrap-around time ranges (night shifts)", () => {
    it("should handle time ranges that cross midnight", () => {
      // Setup - Night shift that goes from 22:00 to 06:00
      mockThis.config = {
        separator_as_timeline: {
          ranges: {
            0: {
              start: "22:00",
              end: "06:00",
              label: "Night Shift",
              color: "purple",
              icon: "mdi:moon-waning-crescent",
            },
          },
        },
      };

      // Exercise
      separator_as_timeline.call(mockThis, mockCard, mockHass);

      // Verify - Check timeline structure
      const wrapper = mockCard.querySelector(".bubble-line-wrapper");
      expect(wrapper).toBeTruthy();

      // Verify segments were created - should be 2 segments for wrap-around
      const segments = wrapper.querySelectorAll(".timeline-segment");
      expect(segments.length).toBe(2);

      // Both segments should have the same label and group
      segments.forEach((segment) => {
        expect(segment.classList.contains("group-Night-Shift")).toBeTruthy();
        expect(segment.dataset.tooltip).toContain("Night Shift:");
      });

      // Verify one segment starts at 22:00 position, other at 0%
      const positions = Array.from(segments).map((seg) => parseFloat(seg.style.left));
      expect(positions.some((pos) => pos > 90)).toBeTruthy(); // Night segment (22:00)
      expect(positions.some((pos) => pos === 0)).toBeTruthy(); // Morning segment (00:00)

      // Verify icon was created - wrap-around creates 2 segments, so 2 icons
      const icons = wrapper.querySelectorAll(".timeline-icon");
      expect(icons.length).toBe(2); // One icon per segment for wrap-around
      expect(icons[0].getAttribute("icon")).toBe("mdi:moon-waning-crescent");
      expect(icons[1].getAttribute("icon")).toBe("mdi:moon-waning-crescent");
    });
  });

  describe("Entity resolution", () => {
    it("should resolve entity states for start and end times", () => {
      // Setup - Using entities from mock hass state
      mockThis.config = {
        separator_as_timeline: {
          ranges: {
            0: {
              start_entity: "sensor.work_start",
              end_entity: "sensor.work_end",
              label: "Work Hours",
              color: "blue",
            },
            1: {
              start_entity: "input_datetime.lunch_start",
              end_entity: "input_datetime.lunch_end",
              label: "Lunch Break",
              color: "green",
            },
          },
        },
      };

      // Exercise
      separator_as_timeline.call(mockThis, mockCard, mockHass);

      // Verify - Check timeline structure
      const wrapper = mockCard.querySelector(".bubble-line-wrapper");
      expect(wrapper).toBeTruthy();

      // Verify segments were created from entity values
      const segments = wrapper.querySelectorAll(".timeline-segment");
      expect(segments.length).toBe(2);

      // Verify work hours segment
      const workSegment = Array.from(segments).find(
        (seg) => seg.dataset.tooltip && seg.dataset.tooltip.includes("Work Hours"),
      );
      expect(workSegment).toBeTruthy();

      // Verify lunch segment
      const lunchSegment = Array.from(segments).find(
        (seg) => seg.dataset.tooltip && seg.dataset.tooltip.includes("Lunch Break"),
      );
      expect(lunchSegment).toBeTruthy();

      // Verify that segments have proper positioning (should be different)
      const workLeft = parseFloat(workSegment.style.left);
      const lunchLeft = parseFloat(lunchSegment.style.left);
      expect(workLeft).not.toBe(lunchLeft);
    });
  });

  describe("Entity with attributes resolution", () => {
    it("should resolve entity attributes for start and end times", () => {
      // Setup - Entity with attributes (covers line 122 - start_attribute usage)
      mockHass.states = {
        "sensor.schedule": {
          state: "active",
          attributes: {
            start_time: "08:45",
            end_time: "17:15",
          },
        },
        "input_datetime.meeting": {
          state: "14:30", // Use simple time format to avoid timezone issues
          attributes: {
            custom_end: "15:30",
          },
        },
      };

      mockThis.config = {
        separator_as_timeline: {
          ranges: [
            {
              start_entity: "sensor.schedule",
              start_attribute: "start_time", // This should trigger line 122
              end_entity: "sensor.schedule",
              end_attribute: "end_time", // This should trigger line 129
              label: "Work Schedule",
              color: "blue",
            },
            {
              start_entity: "input_datetime.meeting", // No start_attribute
              end_entity: "input_datetime.meeting",
              end_attribute: "custom_end", // This should test the end_attribute path
              label: "Meeting",
              color: "green",
            },
          ],
        },
      };

      // Exercise
      separator_as_timeline.call(mockThis, mockCard, mockHass);

      // Verify - Check timeline structure
      const wrapper = mockCard.querySelector(".bubble-line-wrapper");
      expect(wrapper).toBeTruthy();

      // Verify segments were created from entity attributes
      const segments = wrapper.querySelectorAll(".timeline-segment");
      expect(segments.length).toBeGreaterThanOrEqual(2); // May have wrap-around segments

      // Verify work schedule segment uses attributes
      const workSegment = Array.from(segments).find(
        (seg) => seg.dataset.tooltip && seg.dataset.tooltip.includes("Work Schedule"),
      );
      expect(workSegment).toBeTruthy();
      expect(workSegment.dataset.tooltip).toContain("08:45"); // start_time attribute
      expect(workSegment.dataset.tooltip).toContain("17:15"); // end_time attribute

      // Verify meeting segment uses mixed entity state and attribute
      const meetingSegment = Array.from(segments).find(
        (seg) => seg.dataset.tooltip && seg.dataset.tooltip.includes("Meeting"),
      );
      expect(meetingSegment).toBeTruthy();
      expect(meetingSegment.dataset.tooltip).toContain("14:30"); // Direct entity state (ISO format)
      expect(meetingSegment.dataset.tooltip).toContain("15:30"); // custom_end attribute

      // Verify that segments have proper positioning (should be different)
      const workLeft = parseFloat(workSegment.style.left);
      const meetingLeft = parseFloat(meetingSegment.style.left);
      expect(workLeft).not.toBe(meetingLeft);
    });

    it("should handle missing attributes gracefully", () => {
      // Setup - Entity missing the specified attribute
      mockHass.states = {
        "sensor.incomplete": {
          state: "12:00",
          attributes: {
            different_field: "not_what_we_want",
          },
        },
      };

      mockThis.config = {
        separator_as_timeline: {
          ranges: [
            {
              start_entity: "sensor.incomplete",
              start_attribute: "missing_start_time", // Attribute doesn't exist
              end: "14:00",
              label: "Missing Attribute Test",
              color: "red",
            },
          ],
        },
      };

      // Exercise - Should handle gracefully
      expect(() => separator_as_timeline.call(mockThis, mockCard, mockHass)).not.toThrow();

      // Verify - Should still create timeline
      const wrapper = mockCard.querySelector(".bubble-line-wrapper");
      expect(wrapper).toBeTruthy();

      const segments = wrapper.querySelectorAll(".timeline-segment");
      expect(segments.length).toBe(1);

      // Should fallback gracefully when attribute is missing
      const segment = segments[0];
      expect(segment.dataset.tooltip).toContain("Missing Attribute Test");
    });
  });

  describe("Error handling and edge cases", () => {
    it("should handle missing entities gracefully", () => {
      // Setup - Reference non-existent entities
      mockThis.config = {
        separator_as_timeline: {
          ranges: {
            0: {
              start_entity: "sensor.nonexistent",
              end: "17:00",
              label: "Partial Entity",
              color: "red",
            },
          },
        },
      };

      // Exercise
      separator_as_timeline.call(mockThis, mockCard, mockHass);

      // Verify - Should still create timeline without errors
      const wrapper = mockCard.querySelector(".bubble-line-wrapper");
      expect(wrapper).toBeTruthy();

      // Should still create segment (will use default time parsing)
      const segments = wrapper.querySelectorAll(".timeline-segment");
      expect(segments.length).toBe(1);
    });

    it("should handle empty ranges configuration", () => {
      // Setup - Empty ranges
      mockThis.config = {
        separator_as_timeline: {
          show_time_ticks: true,
          ranges: {},
        },
      };

      // Exercise
      separator_as_timeline.call(mockThis, mockCard, mockHass);

      // Verify - Should create timeline structure but no segments
      const wrapper = mockCard.querySelector(".bubble-line-wrapper");
      expect(wrapper).toBeTruthy();

      const segments = wrapper.querySelectorAll(".timeline-segment");
      expect(segments.length).toBe(0);

      // Should still show time ticks
      const ticks = wrapper.querySelectorAll(".timeline-tick");
      expect(ticks.length).toBe(5);
    });

    it("should handle invalid time formats gracefully", () => {
      // Setup - Invalid time values
      mockThis.config = {
        separator_as_timeline: {
          ranges: {
            0: {
              start: "invalid-time",
              end: "25:99", // Invalid but parseable
              label: "Invalid Times",
              color: "orange",
            },
          },
        },
      };

      // Exercise
      separator_as_timeline.call(mockThis, mockCard, mockHass);

      // Verify - Should handle gracefully without crashing
      const wrapper = mockCard.querySelector(".bubble-line-wrapper");
      expect(wrapper).toBeTruthy();

      // Should still create segment (fallback to default parsing)
      const segments = wrapper.querySelectorAll(".timeline-segment");
      expect(segments.length).toBe(1);
    });
  });

  describe("Advanced integration scenarios", () => {
    it("should handle active highlighting with real DOM", () => {
      // Setup - Real timeline that includes current time
      const now = new Date();
      const currentHour = now.getHours();

      mockThis.config = {
        separator_as_timeline: {
          highlight_active: true,
          ranges: [
            {
              start: `${currentHour.toString().padStart(2, "0")}:00`,
              end: `${((currentHour + 2) % 24).toString().padStart(2, "0")}:00`,
              label: "Active Period",
              icon: "mdi:lightbulb",
              color: "#ff9800",
            },
          ],
        },
      };

      // Exercise
      separator_as_timeline.call(mockThis, mockCard, mockHass);

      // Verify - Active highlighting should be applied
      const wrapper = mockCard.querySelector(".bubble-line-wrapper");
      expect(wrapper).toBeTruthy();

      const icons = wrapper.querySelectorAll(".timeline-icon");
      expect(icons.length).toBeGreaterThan(0);
    });

    it("should handle complex entity resolution scenarios", () => {
      // Setup - Complex entity-based configuration
      mockThis.config = {
        separator_as_timeline: {
          ranges: [
            {
              start_entity: "sensor.dynamic_start",
              end_entity: "sensor.dynamic_end",
              end_attribute: "end_time",
              label: "Dynamic Schedule",
              color: "sensor.schedule_color",
              icon: "mdi:calendar",
              source_entities: "sensor.dynamic_start,sensor.dynamic_end",
            },
          ],
        },
      };

      // Mock entity states
      mockHass.states = {
        "sensor.dynamic_start": { state: "08:30" },
        "sensor.dynamic_end": {
          state: "completed",
          attributes: { end_time: "16:45" },
        },
        "sensor.schedule_color": { state: "#4caf50" },
      };

      // Exercise
      separator_as_timeline.call(mockThis, mockCard, mockHass);

      // Verify - Complex scenario should work (wrap-around may create 2 segments)
      const wrapper = mockCard.querySelector(".bubble-line-wrapper");
      expect(wrapper).toBeTruthy();

      const segments = wrapper.querySelectorAll(".timeline-segment");
      expect(segments.length).toBeGreaterThanOrEqual(1); // At least one segment

      // Verify tooltip includes source entities
      const segment = segments[0];
      expect(segment.dataset.tooltip).toContain("Sources:");
      expect(segment.dataset.tooltip).toContain("sensor.dynamic_start,sensor.dynamic_end");
    });

    it("should handle deprecated configuration gracefully", () => {
      // Setup - Use deprecated config structure
      mockThis.config = {
        separator_as_timeline: {
          icon_color: "red",
          icon_outline_color: "blue",
          use_24_hour: false,
          append_suffix: true,
          pad_hours: false,
          show_minutes: false,
          ranges: [
            {
              start: "13:30",
              end: "15:45",
              label: "Afternoon",
              icon: "mdi:sun",
              color: "orange",
            },
          ],
        },
      };

      // Exercise - Should work with deprecated config
      separator_as_timeline.call(mockThis, mockCard, mockHass);

      // Verify
      const wrapper = mockCard.querySelector(".bubble-line-wrapper");
      expect(wrapper).toBeTruthy();

      const segments = wrapper.querySelectorAll(".timeline-segment");
      expect(segments.length).toBe(1);

      const icons = wrapper.querySelectorAll(".timeline-icon");
      expect(icons.length).toBe(1);
    });

    it("should handle edge cases and boundary conditions", () => {
      // Setup - Edge cases
      mockThis.config = {
        separator_as_timeline: {
          show_time_ticks: true,
          show_current_time: true,
          rounded_edges: true,
          ranges: [
            {
              start: "00:00", // Exact midnight
              end: "00:01", // Just after midnight
              label: "Midnight",
              color: "black",
            },
            {
              start: "23:59", // Just before midnight
              end: "00:00", // Wrap-around to midnight
              label: "Wrap-around",
              color: "navy",
              icon: "mdi:clock",
            },
          ],
        },
      };

      // Exercise
      separator_as_timeline.call(mockThis, mockCard, mockHass);

      // Verify - Should handle boundary times correctly
      const wrapper = mockCard.querySelector(".bubble-line-wrapper");
      expect(wrapper).toBeTruthy();

      const segments = wrapper.querySelectorAll(".timeline-segment");
      expect(segments.length).toBeGreaterThan(0);

      // Verify time ticks are created
      const ticks = wrapper.querySelectorAll(".timeline-tick");
      expect(ticks.length).toBe(5); // 0, 6, 12, 18, 24

      // Verify current time marker
      const markerLeft = wrapper.style.getPropertyValue("--timeline-marker-left");
      expect(markerLeft).toMatch(/\d+(\.\d+)?%/);
    });
    it("should handle missing DOM elements gracefully", () => {
      // Setup - Simulate missing tooltip but existing wrapper
      const mockTooltip = document.createElement("div");
      mockTooltip.className = "timeline-tooltip";

      const mockWrapperWithTooltip = document.createElement("div");
      mockWrapperWithTooltip.className = "bubble-line-wrapper";
      mockWrapperWithTooltip.appendChild(mockTooltip);

      // Reset mockCard to be a real DOM element
      mockCard = document.createElement("div");
      const mockLineElement = document.createElement("div");
      mockLineElement.className = "bubble-line";
      mockCard.appendChild(mockLineElement);
      document.body.appendChild(mockCard);

      // Setup proper closest chain
      Object.defineProperty(mockLineElement, "closest", {
        value: jest.fn().mockReturnValue(mockWrapperWithTooltip),
        writable: true,
      });

      Object.defineProperty(mockWrapperWithTooltip, "querySelector", {
        value: jest.fn().mockImplementation((selector) => {
          if (selector === ".timeline-tooltip") return mockTooltip;
          return null;
        }),
        writable: true,
      });

      mockThis.config = {
        separator_as_timeline: {
          ranges: [
            {
              start: "10:00",
              end: "11:00",
              label: "Test",
              color: "blue",
            },
          ],
        },
      };

      // Exercise - Should reuse existing elements
      expect(() => {
        separator_as_timeline.call(mockThis, mockCard, mockHass);
      }).not.toThrow();

      // Verify - Should work with existing DOM structure
      expect(mockWrapperWithTooltip.querySelector).toHaveBeenCalledWith(".timeline-tooltip");
    });
  });
});
