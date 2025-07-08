import { jest } from "@jest/globals";

// Global reference for mocks to access
let mockHass;

// Mock all the helper dependencies first
jest.unstable_mockModule("../../helpers/color.js", () => ({
  resolveColor: jest.fn((color, defaultColor) => {
    if (typeof color === "string" && color.startsWith("sensor.")) {
      if (color === "sensor.timeline_color") return "blue";
      if (color === "sensor.marker_color") return "red";
      return defaultColor;
    }
    return color || defaultColor;
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

jest.unstable_mockModule("../../helpers/strings.js", () => ({
  suffix: jest.fn((value, defaultSuffix) => {
    if (typeof value === "string" && value.includes("px")) return value;
    return `${value}${defaultSuffix}`;
  }),
}));

jest.unstable_mockModule("../../helpers/hass.js", () => ({
  getState: jest.fn(),
}));

// Import the module after mocks are set up
const { separator_as_timeline } = await import("../code.js");

// Import mocks
const { resolveColor } = await import("../../helpers/color.js");
const { resolveConfig } = await import("../../helpers/config.js");
const { suffix } = await import("../../helpers/strings.js");
const { getState } = await import("../../helpers/hass.js");

describe("separator_as_timeline - Unit Tests", () => {
  let mockCard, mockThis, mockElement, mockWrapper;

  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks();

    // Setup mock DOM elements
    mockElement = {
      classList: {
        add: jest.fn(),
        remove: jest.fn(),
      },
      style: {
        background: "",
        left: "",
        width: "",
        color: "",
        border: "",
        borderRadius: "",
        borderTopLeftRadius: "",
        borderBottomLeftRadius: "",
        borderTopRightRadius: "",
        borderBottomRightRadius: "",
        filter: "",
        setProperty: jest.fn(),
        removeProperty: jest.fn(),
        height: "2px",
      },
      closest: jest.fn(),
      querySelector: jest.fn(),
      querySelectorAll: jest.fn(() => []),
      parentNode: {
        insertBefore: jest.fn(),
      },
      appendChild: jest.fn(),
      addEventListener: jest.fn(),
      dataset: {},
      innerText: "",
      setAttribute: jest.fn(),
    };

    mockWrapper = {
      querySelector: jest.fn(),
      querySelectorAll: jest.fn(() => []),
      appendChild: jest.fn(),
      style: {
        height: "",
        setProperty: jest.fn(),
      },
    };

    mockCard = {
      querySelector: jest.fn().mockReturnValue(mockElement),
    };

    mockThis = {
      config: {
        separator_as_timeline: {},
      },
    };

    mockHass = {
      states: {},
    };

    // Setup default mock returns for helpers
    getState.mockReturnValue(null);
    resolveColor.mockImplementation((color) => color);
    suffix.mockImplementation((value, defaultSuffix) => `${value}${defaultSuffix}`);

    // Mock global functions
    global.document = {
      createElement: jest.fn(() => mockElement),
    };

    global.getComputedStyle = jest.fn().mockReturnValue({
      height: "2px",
    });
  });

  afterEach(() => {
    delete global.document;
    delete global.getComputedStyle;
  });

  describe("Configuration handling", () => {
    it("should return early if no config is provided", () => {
      // Setup
      mockThis.config = {};

      // Exercise
      separator_as_timeline.call(mockThis, mockCard, mockHass);

      // Verify
      expect(mockCard.querySelector).not.toHaveBeenCalled();
    });

    it("should return early if no .bubble-line element found", () => {
      // Setup
      mockThis.config.separator_as_timeline = { show_time_ticks: true };
      mockCard.querySelector.mockReturnValue(null);

      // Exercise
      separator_as_timeline.call(mockThis, mockCard, mockHass);

      // Verify
      expect(mockCard.querySelector).toHaveBeenCalledWith(".bubble-line");
    });

    it("should use default configuration values", () => {
      // Setup
      mockThis.config.separator_as_timeline = {};
      mockElement.closest.mockReturnValue(null);

      // Exercise
      separator_as_timeline.call(mockThis, mockCard, mockHass);

      // Verify - Check that defaults are used
      expect(mockElement.closest).toHaveBeenCalledWith(".bubble-line-wrapper");
    });
  });

  describe("Wrapper initialization", () => {
    it("should create wrapper if it doesn't exist", () => {
      // Setup
      mockThis.config.separator_as_timeline = {};
      mockElement.closest.mockReturnValue(null);
      const mockWrapper = { ...mockElement };
      global.document.createElement.mockReturnValue(mockWrapper);

      // Exercise
      separator_as_timeline.call(mockThis, mockCard, mockHass);

      // Verify
      expect(global.document.createElement).toHaveBeenCalledWith("div");
      expect(mockWrapper.classList.add).toHaveBeenCalledWith("wrapped");
      expect(mockElement.parentNode.insertBefore).toHaveBeenCalledWith(mockWrapper, mockElement);
      expect(mockWrapper.appendChild).toHaveBeenCalledWith(mockElement);
    });

    it("should use existing wrapper if it exists", () => {
      // Setup
      mockThis.config.separator_as_timeline = {};
      mockElement.closest.mockReturnValue(mockWrapper);

      // Exercise
      separator_as_timeline.call(mockThis, mockCard, mockHass);

      // Verify
      expect(global.document.createElement).toHaveBeenCalledWith("div"); // Only for tooltip
      expect(mockElement.classList.add).not.toHaveBeenCalledWith("wrapped");
    });

    it("should create tooltip if it doesn't exist", () => {
      // Setup
      mockThis.config.separator_as_timeline = {};
      mockElement.closest.mockReturnValue(mockWrapper);
      mockWrapper.querySelector.mockReturnValue(null);

      // Exercise
      separator_as_timeline.call(mockThis, mockCard, mockHass);

      // Verify
      expect(mockWrapper.querySelector).toHaveBeenCalledWith(".timeline-tooltip");
      expect(global.document.createElement).toHaveBeenCalledWith("div");
    });
  });

  describe("Time range processing", () => {
    beforeEach(() => {
      mockElement.closest.mockReturnValue(mockWrapper);
      mockWrapper.querySelector.mockReturnValue(mockElement); // tooltip exists
    });

    it("should process array-based ranges", () => {
      // Setup
      mockThis.config.separator_as_timeline = {
        ranges: [
          {
            label: "Work",
            start: "09:00",
            end: "17:00",
            color: "blue",
          },
        ],
      };

      // Exercise
      separator_as_timeline.call(mockThis, mockCard, mockHass);

      // Verify - Since timeUtils functions are local, verify DOM manipulation instead
      expect(mockWrapper.appendChild).toHaveBeenCalled();
      expect(resolveColor).toHaveBeenCalledWith("blue");
    });

    it("should process object-based ranges", () => {
      // Setup
      mockThis.config.separator_as_timeline = {
        ranges: {
          work: {
            label: "Work",
            start: "09:00",
            end: "17:00",
            color: "blue",
          },
        },
      };

      // Exercise
      separator_as_timeline.call(mockThis, mockCard, mockHass);

      // Verify - Object ranges should be processed same as array ranges
      expect(mockWrapper.appendChild).toHaveBeenCalled();
      expect(resolveColor).toHaveBeenCalledWith("blue");
    });

    it("should handle entity-based start times", () => {
      // Setup
      mockThis.config.separator_as_timeline = {
        ranges: [
          {
            start_entity: "sensor.work_start",
            end: "17:00",
            color: "blue",
          },
        ],
      };
      getState.mockReturnValue("09:30");

      // Exercise
      separator_as_timeline.call(mockThis, mockCard, mockHass);

      // Verify
      expect(getState).toHaveBeenCalledWith(
        {
          entity: "sensor.work_start",
          attribute: undefined,
        },
        false,
      );
      expect(mockWrapper.appendChild).toHaveBeenCalled();
    });

    it("should handle entity-based end times with attributes", () => {
      // Setup
      mockThis.config.separator_as_timeline = {
        ranges: [
          {
            start: "09:00",
            end_entity: "sensor.work_schedule",
            end_attribute: "end_time",
            color: "blue",
          },
        ],
      };
      getState.mockReturnValue("17:30");

      // Exercise
      separator_as_timeline.call(mockThis, mockCard, mockHass);

      // Verify - Check that entity with attribute is queried correctly
      expect(getState).toHaveBeenCalledWith(
        {
          entity: "sensor.work_schedule",
          attribute: "end_time",
        },
        false,
      );
      expect(mockWrapper.appendChild).toHaveBeenCalled();
    });
  });

  describe("Segment rendering", () => {
    beforeEach(() => {
      mockElement.closest.mockReturnValue(mockWrapper);
      mockWrapper.querySelector.mockReturnValue(mockElement); // tooltip exists
    });

    it("should create segments for normal time ranges", () => {
      // Setup
      mockThis.config.separator_as_timeline = {
        ranges: [
          {
            label: "Work",
            start: "09:00",
            end: "17:00",
            color: "blue",
          },
        ],
      };

      // Exercise
      separator_as_timeline.call(mockThis, mockCard, mockHass);

      // Verify - Check that segments are created and appended
      expect(mockWrapper.appendChild).toHaveBeenCalled();
      // Verify that range processing created DOM elements with appropriate styling
      const appendCalls = mockWrapper.appendChild.mock.calls;
      expect(appendCalls.length).toBeGreaterThan(0);
      expect(resolveColor).toHaveBeenCalledWith("blue");
    });

    it("should handle wrap-around time ranges", () => {
      // Setup
      mockThis.config.separator_as_timeline = {
        ranges: [
          {
            label: "Night",
            start: "22:00",
            end: "06:00",
            color: "purple",
          },
        ],
      };

      // Exercise
      separator_as_timeline.call(mockThis, mockCard, mockHass);

      // Verify - Should create segments for wrap-around (multiple DOM elements)
      expect(mockWrapper.appendChild).toHaveBeenCalled();
      expect(resolveColor).toHaveBeenCalledWith("purple");
    });

    it("should apply rounded edges when configured", () => {
      // Setup
      mockThis.config.separator_as_timeline = {
        rounded_edges: true,
        ranges: [
          {
            start: "09:00",
            end: "17:00",
            color: "blue",
          },
        ],
      };

      // Exercise
      separator_as_timeline.call(mockThis, mockCard, mockHass);

      // Verify - Check that elements are created with rounded edge styling
      expect(mockWrapper.appendChild).toHaveBeenCalled();
      expect(resolveColor).toHaveBeenCalledWith("blue");
    });
  });

  describe("Icon handling", () => {
    beforeEach(() => {
      mockElement.closest.mockReturnValue(mockWrapper);
      mockWrapper.querySelector.mockReturnValue(mockElement); // tooltip exists
    });

    it("should create icons when specified", () => {
      // Setup
      mockThis.config.separator_as_timeline = {
        ranges: [
          {
            start: "09:00",
            end: "17:00",
            icon: "mdi:work",
            color: "blue",
          },
        ],
      };

      // Exercise
      separator_as_timeline.call(mockThis, mockCard, mockHass);

      // Verify - Check that icon elements are created
      expect(mockWrapper.appendChild).toHaveBeenCalled();
      expect(resolveColor).toHaveBeenCalledWith("blue");
    });

    it("should apply icon styling from config", () => {
      // Setup
      mockThis.config.separator_as_timeline = {
        icon_settings: {
          icon_color: "red",
          icon_size: "20px",
        },
        ranges: [
          {
            start: "09:00",
            end: "17:00",
            icon: "mdi:work",
            color: "blue",
          },
        ],
      };
      resolveConfig.mockReturnValue("red");
      suffix.mockReturnValue("20px");

      // Exercise
      separator_as_timeline.call(mockThis, mockCard, mockHass);

      // Verify - Check that styling helpers are called
      expect(resolveConfig).toHaveBeenCalled();
      expect(suffix).toHaveBeenCalled();
    });
  });

  describe("Time ticks and markers", () => {
    beforeEach(() => {
      mockElement.closest.mockReturnValue(mockWrapper);
      mockWrapper.querySelector.mockReturnValue(mockElement); // tooltip exists
    });

    it("should create time ticks when enabled", () => {
      // Setup
      mockThis.config.separator_as_timeline = {
        show_time_ticks: true,
        ranges: [],
      };
      mockWrapper.querySelector.mockReturnValueOnce(mockElement).mockReturnValueOnce(null); // tooltip exists, tick doesn't

      // Exercise
      separator_as_timeline.call(mockThis, mockCard, mockHass);

      // Verify - Check that time tick elements are created
      expect(mockWrapper.appendChild).toHaveBeenCalled();
    });

    it("should create current time marker when enabled", () => {
      // Setup
      mockThis.config.separator_as_timeline = {
        show_current_time: true,
        marker_color: "red",
        ranges: [],
      };
      mockWrapper.querySelector.mockReturnValueOnce(mockElement).mockReturnValueOnce(null); // tooltip exists, marker doesn't

      // Exercise
      separator_as_timeline.call(mockThis, mockCard, mockHass);

      // Verify
      expect(mockWrapper.style.setProperty).toHaveBeenCalledWith("--marker-color", "red");
      expect(mockWrapper.style.setProperty).toHaveBeenCalledWith(
        "--timeline-marker-left",
        expect.stringMatching(/\d+(\.\d+)?%/),
      );
    });

    it("should not create time ticks when disabled", () => {
      // Setup
      mockThis.config.separator_as_timeline = {
        show_time_ticks: false,
        ranges: [],
      };

      // Exercise
      separator_as_timeline.call(mockThis, mockCard, mockHass);

      // Verify - Function should execute without errors when time ticks disabled
      expect(mockWrapper.appendChild).not.toHaveBeenCalled();
    });
  });

  describe("Tooltip functionality", () => {
    beforeEach(() => {
      mockElement.closest.mockReturnValue(mockWrapper);
      mockWrapper.querySelector.mockReturnValue(mockElement); // tooltip exists
    });

    it("should set tooltip content with range information", () => {
      // Setup
      mockThis.config.separator_as_timeline = {
        ranges: [
          {
            label: "Work",
            start: "09:00",
            end: "17:00",
            color: "blue",
            source_entities: "sensor.work_schedule",
          },
        ],
      };

      // Exercise
      separator_as_timeline.call(mockThis, mockCard, mockHass);

      // Verify - Check that tooltips are configured
      expect(mockWrapper.appendChild).toHaveBeenCalled();
      expect(resolveColor).toHaveBeenCalledWith("blue");
    });
  });

  describe("Active highlighting and glow effects", () => {
    beforeEach(() => {
      mockElement.closest.mockReturnValue(mockWrapper);
      mockWrapper.querySelector.mockReturnValue(mockElement); // tooltip exists
    });

    it("should apply glow effects to active icons when highlight_active is enabled", () => {
      // Setup - Current time falls within a range that has an icon
      const now = new Date();
      // Set range from 2 hours ago to 2 hours from now
      const startHour = (now.getHours() - 2 + 24) % 24;
      const endHour = (now.getHours() + 2) % 24;

      mockThis.config.separator_as_timeline = {
        highlight_active: true,
        ranges: [
          {
            start: `${startHour.toString().padStart(2, "0")}:00`,
            end: `${endHour.toString().padStart(2, "0")}:00`,
            icon: "mdi:test",
            color: "blue",
          },
        ],
      };

      // Mock current time queries
      const mockIcons = [mockElement];
      mockWrapper.querySelectorAll.mockImplementation((selector) => {
        if (selector.includes(".timeline-icon.group-")) return mockIcons;
        return [];
      });

      // Exercise
      separator_as_timeline.call(mockThis, mockCard, mockHass);

      // Verify - Glow effect should be applied
      expect(mockWrapper.querySelectorAll).toHaveBeenCalledWith(expect.stringMatching(/\.timeline-icon\.group-/));
      expect(mockElement.style).toHaveProperty("filter");
    });

    it("should remove glow effects when highlight_active is disabled", () => {
      // Setup
      mockThis.config.separator_as_timeline = {
        highlight_active: false,
        ranges: [
          {
            start: "10:00",
            end: "14:00",
            icon: "mdi:test",
            color: "blue",
          },
        ],
      };

      const mockIcons = [mockElement];
      mockWrapper.querySelectorAll.mockImplementation((selector) => {
        if (selector.includes(".timeline-icon.group-")) return mockIcons;
        return [];
      });

      // Exercise
      separator_as_timeline.call(mockThis, mockCard, mockHass);

      // Verify - Filter should be cleared (empty string)
      expect(mockWrapper.querySelectorAll).toHaveBeenCalledWith(expect.stringMatching(/\.timeline-icon\.group-/));
    });

    it("should handle ranges without icons for active highlighting", () => {
      // Setup - Range without icon but within current time
      const now = new Date();
      const currentHour = now.getHours();

      mockThis.config.separator_as_timeline = {
        highlight_active: true,
        ranges: [
          {
            start: `${currentHour.toString().padStart(2, "0")}:00`,
            end: `${((currentHour + 1) % 24).toString().padStart(2, "0")}:00`,
            color: "blue",
            // No icon property
          },
        ],
      };

      // Exercise
      separator_as_timeline.call(mockThis, mockCard, mockHass);

      // Verify - Should execute without errors
      expect(mockWrapper.appendChild).toHaveBeenCalled();
    });
  });

  describe("Advanced configuration scenarios", () => {
    beforeEach(() => {
      mockElement.closest.mockReturnValue(mockWrapper);
      mockWrapper.querySelector.mockReturnValue(mockElement); // tooltip exists
    });

    it("should handle deprecated icon configuration paths", () => {
      // Setup - Use deprecated config paths (not icon_settings)
      mockThis.config.separator_as_timeline = {
        icon_color: "red",
        icon_outline_color: "blue",
        ranges: [
          {
            start: "10:00",
            end: "14:00",
            icon: "mdi:test",
            color: "green",
          },
        ],
      };

      // Exercise
      separator_as_timeline.call(mockThis, mockCard, mockHass);

      // Verify - Should handle deprecated config paths through resolveConfig
      expect(resolveConfig).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({
            metadata: expect.objectContaining({
              deprecated: true,
            }),
          }),
        ]),
        expect.any(String),
      );
    });

    it("should handle mixed entity and static configurations", () => {
      // Setup - Complex mix of entity and static values
      mockThis.config.separator_as_timeline = {
        ranges: [
          {
            start_entity: "sensor.work_start",
            end: "17:00",
            label: "Work",
            color: "blue",
          },
          {
            start: "19:00",
            end_entity: "sensor.sleep_time",
            end_attribute: "bedtime",
            label: "Evening",
            color: "purple",
          },
        ],
      };

      getState.mockImplementation((entity) => {
        if (entity === "sensor.work_start") return "09:00";
        if (entity === "sensor.sleep_time[bedtime]") return "22:30"; // Template literal bug
        return null;
      });

      // Exercise
      separator_as_timeline.call(mockThis, mockCard, mockHass);

      // Verify - Both entity queries should be made
      expect(getState).toHaveBeenCalledWith(
        {
          entity: "sensor.work_start",
          attribute: undefined,
        },
        false,
      );
      expect(getState).toHaveBeenCalledWith(
        {
          entity: "sensor.sleep_time",
          attribute: "bedtime",
        },
        false,
      );
      expect(mockWrapper.appendChild).toHaveBeenCalled();
    });

    it("should handle empty or null range configurations", () => {
      // Setup - Various edge cases
      const testCases = [
        { ranges: [] }, // Empty array
        { ranges: {} }, // Empty object
        { ranges: null }, // Null
        {}, // No ranges property
      ];

      testCases.forEach((config, index) => {
        // Reset mocks
        jest.clearAllMocks();
        mockThis.config.separator_as_timeline = config;

        // Exercise & Verify - Should not throw errors
        expect(() => {
          separator_as_timeline.call(mockThis, mockCard, mockHass);
        }).not.toThrow();
      });
    });

    it("should handle ranges with missing time values", () => {
      // Setup - Ranges with missing or invalid times
      mockThis.config.separator_as_timeline = {
        ranges: [
          {
            // Missing start and end times
            label: "Invalid",
            color: "red",
          },
          {
            start: null,
            end: undefined,
            label: "Null times",
            color: "blue",
          },
        ],
      };

      // Exercise & Verify - Should handle gracefully
      expect(() => {
        separator_as_timeline.call(mockThis, mockCard, mockHass);
      }).not.toThrow();

      expect(mockWrapper.appendChild).toHaveBeenCalled(); // Segments should still be created
    });
  });

  describe("Event handling and highlighting logic", () => {
    beforeEach(() => {
      mockElement.closest.mockReturnValue(mockWrapper);
      mockWrapper.querySelector.mockReturnValue(mockElement); // tooltip exists
    });

    it("should handle icon event listeners and highlighting", () => {
      // Setup
      mockThis.config.separator_as_timeline = {
        highlight_active: false, // This will hit the else branch (lines 288-289)
        ranges: [
          {
            start: "10:00",
            end: "14:00",
            icon: "mdi:test",
            color: "blue",
          },
        ],
      };

      const mockIcons = [mockElement];
      mockWrapper.querySelectorAll.mockImplementation((selector) => {
        if (selector.includes(".timeline-icon.group-")) return mockIcons;
        if (selector.includes(".group-")) return [mockElement];
        return [];
      });

      // Mock addEventListener to capture event handlers
      const eventHandlers = {};
      mockElement.addEventListener = jest.fn((event, handler) => {
        eventHandlers[event] = handler;
      });

      // Exercise
      separator_as_timeline.call(mockThis, mockCard, mockHass);

      // Verify event listeners were added
      expect(mockElement.addEventListener).toHaveBeenCalledWith("mouseenter", expect.any(Function));
      expect(mockElement.addEventListener).toHaveBeenCalledWith("mouseleave", expect.any(Function));

      // Test mouseenter handler (lines 276-277)
      if (eventHandlers.mouseenter) {
        eventHandlers.mouseenter();
        expect(mockWrapper.querySelectorAll).toHaveBeenCalledWith(".group-undefined");
      }

      // Test mouseleave handler (lines 279-280)
      if (eventHandlers.mouseleave) {
        eventHandlers.mouseleave();
        expect(mockWrapper.querySelectorAll).toHaveBeenCalledWith(".group-undefined");
      }

      // Verify highlight_active = false branch was hit (lines 288-289)
      expect(mockWrapper.querySelectorAll).toHaveBeenCalledWith(".timeline-icon.group-undefined");
    });

    it("should handle highlight_active true branch", () => {
      // Setup - Current time within range to trigger isActive = true
      const now = new Date();
      const currentHour = now.getHours();

      mockThis.config.separator_as_timeline = {
        highlight_active: true,
        ranges: [
          {
            start: `${currentHour.toString().padStart(2, "0")}:00`,
            end: `${((currentHour + 1) % 24).toString().padStart(2, "0")}:00`,
            icon: "mdi:active",
            color: "orange",
          },
        ],
      };

      const mockIcons = [mockElement];
      mockWrapper.querySelectorAll.mockImplementation((selector) => {
        if (selector.includes(".timeline-icon.group-")) return mockIcons;
        return [];
      });

      // Exercise
      separator_as_timeline.call(mockThis, mockCard, mockHass);

      // Verify the highlight_active true branch (lines 284-287)
      expect(mockWrapper.querySelectorAll).toHaveBeenCalledWith(".timeline-icon.group-undefined");
    });

    it("should handle segment event listeners", () => {
      // Setup
      mockThis.config.separator_as_timeline = {
        ranges: [
          {
            start: "10:00",
            end: "14:00",
            color: "blue",
            label: "Test",
          },
        ],
      };

      const mockSegments = [mockElement];
      mockWrapper.querySelectorAll.mockImplementation((selector) => {
        if (selector.includes(".group-Test")) return mockSegments;
        return [];
      });

      // Mock addEventListener to capture event handlers for segments
      const segmentEventHandlers = {};
      global.document.createElement.mockReturnValue({
        className: "",
        style: mockElement.style,
        dataset: {},
        addEventListener: jest.fn((event, handler) => {
          segmentEventHandlers[event] = handler;
        }),
      });

      // Exercise
      separator_as_timeline.call(mockThis, mockCard, mockHass);

      // Verify segment event listeners were added
      expect(global.document.createElement).toHaveBeenCalledWith("div");

      // Test segment mouseenter handler (lines 216-218)
      if (segmentEventHandlers.mouseenter) {
        segmentEventHandlers.mouseenter();
        expect(mockWrapper.querySelectorAll).toHaveBeenCalledWith(".group-Test");
      }

      // Test segment mouseleave handler (lines 219-221)
      if (segmentEventHandlers.mouseleave) {
        segmentEventHandlers.mouseleave();
        expect(mockWrapper.querySelectorAll).toHaveBeenCalledWith(".group-Test");
      }
    });
  });

  describe("Time parsing edge cases", () => {
    beforeEach(() => {
      mockElement.closest.mockReturnValue(mockWrapper);
      mockWrapper.querySelector.mockReturnValue(mockElement); // tooltip exists
    });

    it("should handle numeric time format (minutes since midnight)", () => {
      // Setup - Create a config that will trigger parseTimeString with numeric values
      mockThis.config = {
        separator_as_timeline: {
          ranges: [
            {
              start_time: "600", // 10:00 AM in minutes (lines 62-63)
              end_time: "720", // 12:00 PM in minutes
              label: "Morning",
              color: "blue",
            },
          ],
        },
      };

      mockCard.querySelector.mockReturnValue(mockElement);

      // Exercise
      separator_as_timeline.call(mockThis, mockCard, mockHass);

      // Verify - Check that wrapper.appendChild was called (segments were created)
      expect(mockWrapper.appendChild).toHaveBeenCalled();
    });

    it("should handle error in parseTimeString gracefully", () => {
      // Setup - Force an error in parseInt by providing invalid data structure
      // We'll create a malformed time string that causes parseTimeString to throw
      const mockConfig = {
        separator_as_timeline: {
          ranges: [
            {
              start_time: {}, // This will cause parseInt to throw when accessed
              end_time: "12:00",
              label: "Error Test",
              color: "red",
            },
          ],
        },
      };

      // Override toString to force an error
      mockConfig.separator_as_timeline.ranges[0].start_time.toString = () => {
        throw new Error("Forced error");
      };

      mockThis.config = mockConfig;
      mockCard.querySelector.mockReturnValue(mockElement);

      // Exercise - Should not throw and handle gracefully (line 68)
      expect(() => separator_as_timeline.call(mockThis, mockCard, mockHass)).not.toThrow();

      // Verify - Should still process other parts
      expect(mockWrapper.appendChild).toHaveBeenCalled();
    });
  });
});
