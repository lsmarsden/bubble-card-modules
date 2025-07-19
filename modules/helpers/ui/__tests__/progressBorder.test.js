/**
 * Comprehensive Tests for progressBorder.js
 */

import { jest } from "@jest/globals";
import { createProgressBorder, removeProgressBorder, getEffectiveDimensions } from "../progressBorder.js";

describe("strokeDashProgressBorderAligned", () => {
  let mockElement;
  let mockSvg;
  let mockProgressPath;
  let mockBgPath;

  beforeEach(() => {
    // Mock DOM elements
    mockProgressPath = {
      setAttribute: jest.fn(),
      getAttribute: jest.fn(),
      getTotalLength: jest.fn().mockReturnValue(300),
      getBoundingClientRect: jest.fn(),
      style: { transition: "" },
    };

    mockBgPath = {
      setAttribute: jest.fn(),
      getAttribute: jest.fn().mockReturnValue("transparent"),
    };

    mockSvg = {
      setAttribute: jest.fn(),
      getAttribute: jest.fn(),
      querySelector: jest.fn((selector) => {
        if (selector === ".progress-path") return mockProgressPath;
        if (selector === ".bg-path") return mockBgPath;
        return null;
      }),
      appendChild: jest.fn(),
      style: { cssText: "" },
      innerHTML: "",
    };

    mockElement = {
      querySelector: jest.fn(),
      appendChild: jest.fn(),
      getBoundingClientRect: jest.fn().mockReturnValue({ width: 40, height: 40 }),
      style: { position: "static" },
    };

    // Mock global functions
    global.getComputedStyle = jest.fn().mockReturnValue({
      position: "static",
      borderRadius: "8px",
    });

    global.document = {
      createElementNS: jest.fn().mockReturnValue(mockSvg),
    };

    global.requestAnimationFrame = jest.fn((callback) => callback());

    jest.clearAllMocks();
  });

  afterEach(() => {
    delete global.getComputedStyle;
    delete global.document;
    delete global.requestAnimationFrame;
  });

  it("should create new SVG when none exists", () => {
    // Setup - No existing SVG
    mockElement.querySelector.mockReturnValue(null);

    // Exercise
    createProgressBorder(mockElement, 50, "#ff0000", "#cccccc", {});

    // Verify - SVG creation and element positioning
    expect(mockElement.appendChild).toHaveBeenCalled();
    expect(mockElement.style.position).toBe("relative");

    // Verify that the created SVG has correct properties
    const createdSvg = mockElement.appendChild.mock.calls[0][0];
    expect(createdSvg.tagName).toBe("svg");
    expect(createdSvg.getAttribute("class")).toBe("stroke-dash-aligned-svg");
  });

  it("should handle zero progress", () => {
    // Setup existing SVG for progress tests
    mockElement.querySelector.mockReturnValue(mockSvg);
    mockProgressPath.getAttribute.mockImplementation((attr) => {
      if (attr === "data-length") return "300";
      if (attr === "data-offset") return "0";
      if (attr === "stroke") return "#ff0000";
      return null;
    });

    // Exercise
    createProgressBorder(mockElement, 0, "#ff0000", "#cccccc", 0, {});

    // Verify - Transparent stroke and zero dash array
    expect(mockProgressPath.setAttribute).toHaveBeenCalledWith("stroke", "transparent");
    expect(mockProgressPath.setAttribute).toHaveBeenCalledWith("stroke-dasharray", "0 300");
    expect(mockProgressPath.setAttribute).toHaveBeenCalledWith("stroke-dashoffset", "0");
  });

  it("should remove existing SVG", () => {
    // Setup
    const mockRemove = jest.fn();
    mockSvg.remove = mockRemove;
    mockElement.querySelector.mockReturnValue(mockSvg);

    // Exercise
    removeProgressBorder(mockElement);

    // Verify
    expect(mockElement.querySelector).toHaveBeenCalledWith(".stroke-dash-aligned-svg");
    expect(mockRemove).toHaveBeenCalled();
  });

  it("should handle 100% progress", () => {
    // Setup existing SVG
    mockElement.querySelector.mockReturnValue(mockSvg);
    mockProgressPath.getAttribute.mockImplementation((attr) => {
      if (attr === "data-length") return "300";
      if (attr === "data-offset") return "0";
      if (attr === "stroke") return "#ff0000";
      return null;
    });

    // Exercise
    createProgressBorder(mockElement, 100, "#ff0000", "#cccccc", 0, {});

    // Verify - Full progress
    expect(mockProgressPath.setAttribute).toHaveBeenCalledWith("stroke", "#ff0000");
    expect(mockProgressPath.setAttribute).toHaveBeenCalledWith("stroke-dasharray", "300 0");
  });

  it("should handle partial progress", () => {
    // Setup existing SVG
    mockElement.querySelector.mockReturnValue(mockSvg);
    mockProgressPath.getAttribute.mockImplementation((attr) => {
      if (attr === "data-length") return "300";
      if (attr === "stroke") return "#ff0000";
      return null;
    });

    // Exercise
    createProgressBorder(mockElement, 50, "#ff0000", "#cccccc", {});

    // Verify - 50% progress with new dasharray pattern: 0 offset, 150 progress, 150 remaining
    expect(mockProgressPath.setAttribute).toHaveBeenCalledWith("stroke", "#ff0000");
    expect(mockProgressPath.setAttribute).toHaveBeenCalledWith("stroke-dasharray", "0 0 150 150");
  });

  it("should clamp values above 100%", () => {
    // Setup existing SVG
    mockElement.querySelector.mockReturnValue(mockSvg);
    mockProgressPath.getAttribute.mockImplementation((attr) => {
      if (attr === "data-length") return "300";
      if (attr === "stroke") return "#ff0000";
      return null;
    });

    // Exercise
    createProgressBorder(mockElement, 150, "#ff0000", "#cccccc", {});

    // Verify - Clamped to 100%
    expect(mockProgressPath.setAttribute).toHaveBeenCalledWith("stroke-dasharray", "300 0");
  });

  it("should detect circular shape from percentage border-radius", () => {
    // Setup - 50% border radius (circular)
    global.getComputedStyle.mockReturnValue({
      position: "static",
      borderRadius: "50%",
    });
    mockElement.querySelector.mockReturnValue(mockSvg);

    // Exercise
    createProgressBorder(mockElement, 50, "#ff0000", "#cccccc", 0, {});

    // Verify - Config indicates circular (true-20-40-40) - 50% of 40px = 20px
    expect(mockSvg.setAttribute).toHaveBeenCalledWith("data-config", "true-20-40-40");
  });

  it("should detect circular shape from large pixel border-radius", () => {
    // Setup - Large border radius
    global.getComputedStyle.mockReturnValue({
      position: "static",
      borderRadius: "25px", // >= elementRadius (20px)
    });
    mockElement.querySelector.mockReturnValue(mockSvg);

    // Exercise
    createProgressBorder(mockElement, 50, "#ff0000", "#cccccc", 0, {});

    // Verify - Config indicates circular (true-25-40-40)
    expect(mockSvg.setAttribute).toHaveBeenCalledWith("data-config", "true-25-40-40");
  });

  it("should handle special case with '50' in border radius string", () => {
    // Setup - Border radius containing "50" but not percentage
    global.getComputedStyle.mockReturnValue({
      position: "static",
      borderRadius: "150px", // Contains "50" but should be treated as pixel value
    });
    mockElement.querySelector.mockReturnValue(mockSvg);

    // Exercise
    createProgressBorder(mockElement, 50, "#ff0000", "#cccccc", 0, {});

    // Verify - Should be treated as circular due to large radius (true-150-40-40)
    expect(mockSvg.setAttribute).toHaveBeenCalledWith("data-config", "true-150-40-40");
  });

  it("should handle square shape (no border radius)", () => {
    // Setup - No border radius
    global.getComputedStyle.mockReturnValue({
      position: "static",
      borderRadius: "0px",
    });
    mockElement.querySelector.mockReturnValue(mockSvg);

    // Exercise
    createProgressBorder(mockElement, 50, "#ff0000", "#cccccc", 0, {});

    // Verify - Config indicates square
    expect(mockSvg.setAttribute).toHaveBeenCalledWith("data-config", "false-0-40-40");
  });

  it("should apply percentage offset", () => {
    // Setup existing SVG with progress path
    mockSvg.querySelector.mockImplementation((selector) => {
      if (selector === ".progress-path") return mockProgressPath;
      if (selector === ".bg-path") return mockBgPath;
      return mockProgressPath; // Return progress path for existingPath check
    });
    mockSvg.getAttribute.mockReturnValue("false-8-40"); // Matching config to avoid rebuild
    mockElement.querySelector.mockReturnValue(mockSvg);

    mockProgressPath.getAttribute.mockImplementation((attr) => {
      if (attr === "data-length") return "300";
      if (attr === "stroke") return "#ff0000";
      return null;
    });

    // Exercise - 25% offset (75 pixels on 300px path)
    createProgressBorder(mockElement, 50, "#ff0000", "#cccccc", { offsetPercent: 25 });

    // Verify - New offset approach always uses stroke-dashoffset 0
    expect(mockProgressPath.setAttribute).toHaveBeenCalledWith("stroke-dashoffset", "0");
    // Verify - 25% offset (75px), 50% progress (150px), remaining (75px)
    expect(mockProgressPath.setAttribute).toHaveBeenCalledWith("stroke-dasharray", "0 75 150 75");
  });

  it("should handle first time animation", () => {
    // Setup - First appearance (transparent stroke)
    mockElement.querySelector.mockReturnValue(mockSvg);
    mockProgressPath.getAttribute.mockImplementation((attr) => {
      if (attr === "data-length") return "300";
      if (attr === "stroke") return "transparent"; // First appearance
      return null;
    });

    // Exercise
    createProgressBorder(mockElement, 75, "#ff0000", "#cccccc", {});

    // Verify - Animation setup with new pattern (0 offset, 0 progress initially, remaining space)
    expect(mockProgressPath.setAttribute).toHaveBeenCalledWith("stroke", "#ff0000");
    expect(mockProgressPath.setAttribute).toHaveBeenCalledWith("stroke-dasharray", "0 0 0 300");
    expect(mockProgressPath.getBoundingClientRect).toHaveBeenCalled(); // Force reflow
    expect(global.requestAnimationFrame).toHaveBeenCalled();
  });

  it("should handle missing SVG in remove function", () => {
    // Setup
    mockElement.querySelector.mockReturnValue(null);

    // Exercise
    expect(() => {
      removeProgressBorder(mockElement);
    }).not.toThrow();

    // Verify
    expect(mockElement.querySelector).toHaveBeenCalledWith(".stroke-dash-aligned-svg");
  });

  it("should handle undefined/null progress values", () => {
    mockElement.querySelector.mockReturnValue(mockSvg);
    mockProgressPath.getAttribute.mockImplementation((attr) => {
      if (attr === "data-length") return "300";
      if (attr === "data-offset") return "0";
      if (attr === "stroke") return "#ff0000";
      return null;
    });

    // Exercise - undefined progress
    createProgressBorder(mockElement, undefined, "#ff0000", "#cccccc", 0, {});

    // Verify - Treated as 0
    expect(mockProgressPath.setAttribute).toHaveBeenCalledWith("stroke", "transparent");
  });

  it("should handle zero element dimensions", () => {
    mockElement.getBoundingClientRect.mockReturnValue({ width: 0, height: 0 });
    mockElement.querySelector.mockReturnValue(mockSvg);

    // Exercise
    createProgressBorder(mockElement, 50, "#ff0000", "#cccccc", 0, {});

    // Verify - Uses fallback size (38)
    expect(mockSvg.setAttribute).toHaveBeenCalledWith("viewBox", "0 0 38 38");
  });

  it("should handle missing getComputedStyle", () => {
    delete global.getComputedStyle;
    mockElement.querySelector.mockReturnValue(null);

    // Exercise
    createProgressBorder(mockElement, 50, "#ff0000", "#cccccc", 0, {});

    // Verify - Still creates SVG without errors
    expect(mockElement.appendChild).toHaveBeenCalled();
  });

  it("should update background color when changed", () => {
    // Setup - Different existing color
    mockElement.querySelector.mockReturnValue(mockSvg);
    mockBgPath.getAttribute.mockReturnValue("#oldcolor");

    // Exercise
    createProgressBorder(mockElement, 50, "#ff0000", "#newcolor", 0, {});

    // Verify - Background color updated
    expect(mockBgPath.setAttribute).toHaveBeenCalledWith("stroke", "#newcolor");
  });

  it("should rebuild SVG when config changes", () => {
    // Setup - Existing SVG with different config
    mockSvg.getAttribute.mockReturnValue("true-0-40"); // different config
    mockElement.querySelector.mockReturnValue(mockSvg);

    // Exercise
    createProgressBorder(mockElement, 50, "#ff0000", "#cccccc", 0, {});

    // Verify - SVG rebuilt
    expect(mockSvg.innerHTML).toBe("");
    expect(mockSvg.setAttribute).toHaveBeenCalledWith("data-config", "false-8-40-40");
  });

  it("should handle first time animation for 100% progress", () => {
    // Setup - First appearance (transparent stroke) with 100% progress
    mockElement.querySelector.mockReturnValue(mockSvg);
    mockProgressPath.getAttribute.mockImplementation((attr) => {
      if (attr === "data-length") return "300";
      if (attr === "stroke") return "transparent"; // First appearance
      return null;
    });

    // Exercise
    createProgressBorder(mockElement, 100, "#ff0000", "#cccccc", {});

    // Verify - Animation setup for 100% with new pattern
    expect(mockProgressPath.setAttribute).toHaveBeenCalledWith("stroke", "#ff0000");
    expect(mockProgressPath.setAttribute).toHaveBeenCalledWith("stroke-dasharray", "0 0 0 300");
    expect(mockProgressPath.getBoundingClientRect).toHaveBeenCalled(); // Force reflow
    expect(global.requestAnimationFrame).toHaveBeenCalled();

    // Execute the animation callback to cover line 198
    const animationCallback = global.requestAnimationFrame.mock.calls[0][0];
    animationCallback();

    // Verify final 100% state
    expect(mockProgressPath.setAttribute).toHaveBeenCalledWith("stroke-dasharray", "300 0");
  });

  it("should handle negative progress values", () => {
    // Setup existing SVG
    mockElement.querySelector.mockReturnValue(mockSvg);
    mockProgressPath.getAttribute.mockImplementation((attr) => {
      if (attr === "data-length") return "300";
      if (attr === "data-offset") return "0";
      if (attr === "stroke") return "#ff0000";
      return null;
    });

    // Exercise - Negative progress value
    createProgressBorder(mockElement, -10, "#ff0000", "#cccccc", 0, {});

    // Verify - Clamped to 0 (transparent stroke)
    expect(mockProgressPath.setAttribute).toHaveBeenCalledWith("stroke", "transparent");
    expect(mockProgressPath.setAttribute).toHaveBeenCalledWith("stroke-dasharray", "0 300");
  });

  it("should handle invalid percentage border-radius", () => {
    // Setup - Invalid percentage border radius
    global.getComputedStyle.mockReturnValue({
      position: "static",
      borderRadius: "invalid%", // Contains % but parseInt returns 0
    });
    mockElement.querySelector.mockReturnValue(mockSvg);

    // Exercise
    createProgressBorder(mockElement, 50, "#ff0000", "#cccccc", 0, {});

    // Verify - Should not be circular (false) since parseInt returns 0
    expect(mockSvg.setAttribute).toHaveBeenCalledWith("data-config", "false-0-40-40");
  });

  it("should handle path without getTotalLength", () => {
    mockElement.querySelector.mockReturnValue(null);
    const pathWithoutLength = { ...mockProgressPath };
    delete pathWithoutLength.getTotalLength;
    mockSvg.querySelector.mockImplementation((selector) => {
      if (selector === ".progress-path") return pathWithoutLength;
      if (selector === ".bg-path") return mockBgPath;
      return null;
    });

    // Exercise
    createProgressBorder(mockElement, 50, "#ff0000", "#cccccc", 0, {});

    // Verify - Uses fallback length (300)
    expect(pathWithoutLength.setAttribute).toHaveBeenCalledWith("data-length", 300);
  });

  describe("Pill Shape Support (width ≠ height) - NEW API", () => {
    // These tests cover the scenarios validated in our interactive demo
    // They should fail initially and drive the API changes needed

    describe("getEffectiveDimensions() - NEW FUNCTION", () => {
      it("should return {width, height} object instead of single size", () => {
        // Setup - Mock element with pill dimensions
        mockElement.getBoundingClientRect.mockReturnValue({ width: 80, height: 50 });

        // Exercise - This function doesn't exist yet, will fail
        const dimensions = getEffectiveDimensions(mockElement);

        // Verify - Should return both dimensions, not Math.min()
        expect(dimensions).toEqual({
          width: 80,
          height: 50,
        });
      });

      it("should handle zero dimensions with fallback", () => {
        // Setup - Zero dimensions
        mockElement.getBoundingClientRect.mockReturnValue({ width: 0, height: 0 });

        // Exercise
        const dimensions = getEffectiveDimensions(mockElement);

        // Verify - Should fallback to default size
        expect(dimensions).toEqual({
          width: 38,
          height: 38,
        });
      });

      it("should handle missing getBoundingClientRect", () => {
        // Setup - Element without getBoundingClientRect
        delete mockElement.getBoundingClientRect;

        // Exercise
        const dimensions = getEffectiveDimensions(mockElement);

        // Verify - Should fallback to default
        expect(dimensions).toEqual({
          width: 38,
          height: 38,
        });
      });
    });

    describe("SVG viewBox with actual dimensions", () => {
      beforeEach(() => {
        mockElement.querySelector.mockReturnValue(null); // Force SVG creation
      });

      it("should use actual dimensions for horizontal pill viewBox", () => {
        // Setup - Horizontal pill
        mockElement.getBoundingClientRect.mockReturnValue({ width: 80, height: 40 });

        // Exercise - Create progress border
        createProgressBorder(mockElement, 50, "#ff0000", "#cccccc", 0, {});

        // Verify - viewBox should use actual dimensions, not Math.min(80,40)=40
        expect(mockSvg.setAttribute).toHaveBeenCalledWith("viewBox", "0 0 80 40");
      });

      it("should use actual dimensions for vertical pill viewBox", () => {
        // Setup - Vertical pill
        mockElement.getBoundingClientRect.mockReturnValue({ width: 40, height: 80 });

        // Exercise
        createProgressBorder(mockElement, 50, "#ff0000", "#cccccc", 0, {});

        // Verify - viewBox should use actual dimensions, not Math.min(40,80)=40
        expect(mockSvg.setAttribute).toHaveBeenCalledWith("viewBox", "0 0 40 80");
      });

      it("should use actual dimensions for true circle viewBox", () => {
        // Setup - True circle
        mockElement.getBoundingClientRect.mockReturnValue({ width: 50, height: 50 });

        // Exercise
        createProgressBorder(mockElement, 50, "#ff0000", "#cccccc", 0, {});

        // Verify - viewBox should use actual dimensions
        expect(mockSvg.setAttribute).toHaveBeenCalledWith("viewBox", "0 0 50 50");
      });

      it("should use actual dimensions for rounded rectangle viewBox", () => {
        // Setup - Rounded rectangle
        mockElement.getBoundingClientRect.mockReturnValue({ width: 100, height: 60 });
        global.getComputedStyle.mockReturnValue({
          position: "static",
          borderRadius: "15px", // Not enough to be circular
        });

        // Exercise
        createProgressBorder(mockElement, 50, "#ff0000", "#cccccc", 0, {});

        // Verify - viewBox should use actual dimensions, not Math.min(100,60)=60
        expect(mockSvg.setAttribute).toHaveBeenCalledWith("viewBox", "0 0 100 60");
      });
    });

    describe("Shape detection with pill dimensions", () => {
      beforeEach(() => {
        mockElement.querySelector.mockReturnValue(null); // Force SVG creation
      });

      it("should detect true circle from square element with circular border-radius", () => {
        // Setup - True circle: 50×50 with border-radius 25px
        mockElement.getBoundingClientRect.mockReturnValue({ width: 50, height: 50 });
        global.getComputedStyle.mockReturnValue({
          position: "static",
          borderRadius: "25px",
        });

        // Exercise
        createProgressBorder(mockElement, 50, "#ff0000", "#cccccc", 0, {});

        // Verify - Config should indicate circular (true-25-50-50)
        expect(mockSvg.setAttribute).toHaveBeenCalledWith("data-config", "true-25-50-50");
      });

      it("should detect horizontal pill from wide element with circular border-radius", () => {
        // Setup - Horizontal pill: 80×40 with border-radius 20px (rectangle cannot be circular)
        mockElement.getBoundingClientRect.mockReturnValue({ width: 80, height: 40 });
        global.getComputedStyle.mockReturnValue({
          position: "static",
          borderRadius: "20px", // Rectangle cannot be circular regardless of border-radius
        });

        // Exercise
        createProgressBorder(mockElement, 50, "#ff0000", "#cccccc", 0, {});

        // Verify - Config should indicate non-circular (false-20-80-40)
        expect(mockSvg.setAttribute).toHaveBeenCalledWith("data-config", "false-20-80-40");
      });

      it("should detect vertical pill from tall element with circular border-radius", () => {
        // Setup - Vertical pill: 40×80 with border-radius 20px (rectangle cannot be circular)
        mockElement.getBoundingClientRect.mockReturnValue({ width: 40, height: 80 });
        global.getComputedStyle.mockReturnValue({
          position: "static",
          borderRadius: "20px", // Rectangle cannot be circular regardless of border-radius
        });

        // Exercise
        createProgressBorder(mockElement, 50, "#ff0000", "#cccccc", 0, {});

        // Verify - Config should indicate non-circular (false-20-40-80)
        expect(mockSvg.setAttribute).toHaveBeenCalledWith("data-config", "false-20-40-80");
      });

      it("should detect rounded rectangle from element with small border-radius", () => {
        // Setup - Rounded rectangle: 80×50 with border-radius 15px (< min(80,50)/2 = 25)
        mockElement.getBoundingClientRect.mockReturnValue({ width: 80, height: 50 });
        global.getComputedStyle.mockReturnValue({
          position: "static",
          borderRadius: "15px", // < min(80,50)/2 = 25, so rectangular behavior
        });

        // Exercise
        createProgressBorder(mockElement, 50, "#ff0000", "#cccccc", 0, {});

        // Verify - Config should indicate rectangular
        expect(mockSvg.setAttribute).toHaveBeenCalledWith("data-config", "false-15-80-50");
      });
    });

    describe("Test Cases from Demo Validation", () => {
      // These test cases match exactly the validated scenarios from our interactive demo
      const testCases = [
        // True Circles
        { w: 50, h: 50, r: 25, expected: "True Circle", isCircular: true, borderRadius: 0 },
        { w: 50, h: 50, r: 30, expected: "True Circle", isCircular: true, borderRadius: 0 },
        { w: 60, h: 60, r: 30, expected: "True Circle", isCircular: true, borderRadius: 0 },

        // Horizontal Pills
        { w: 80, h: 40, r: 20, expected: "Horizontal Pill", isCircular: true, borderRadius: 0 },
        { w: 100, h: 50, r: 25, expected: "Horizontal Pill", isCircular: true, borderRadius: 0 },
        { w: 120, h: 40, r: 25, expected: "Horizontal Pill", isCircular: true, borderRadius: 0 },

        // Vertical Pills
        { w: 40, h: 80, r: 20, expected: "Vertical Pill", isCircular: true, borderRadius: 0 },
        { w: 50, h: 100, r: 25, expected: "Vertical Pill", isCircular: true, borderRadius: 0 },

        // Rounded Rectangles
        { w: 80, h: 50, r: 15, expected: "Rounded Rectangle", isCircular: false, borderRadius: 15 },
        { w: 60, h: 60, r: 20, expected: "Rounded Rectangle", isCircular: false, borderRadius: 20 },
        { w: 60, h: 60, r: 29, expected: "Rounded Rectangle", isCircular: false, borderRadius: 29 },
        { w: 100, h: 40, r: 15, expected: "Rounded Rectangle", isCircular: false, borderRadius: 15 },

        // Sharp Rectangles
        { w: 80, h: 50, r: 0, expected: "Sharp Rectangle", isCircular: false, borderRadius: 0 },
        { w: 60, h: 60, r: 0, expected: "Sharp Rectangle", isCircular: false, borderRadius: 0 },

        // Edge cases
        { w: 80, h: 50, r: 50, expected: "Horizontal Pill", isCircular: true, borderRadius: 0 },
        { w: 50, h: 80, r: 40, expected: "Vertical Pill", isCircular: true, borderRadius: 0 },
      ];

      testCases.forEach((testCase) => {
        it(`should handle ${testCase.expected}: ${testCase.w}×${testCase.h} with border-radius ${testCase.r}px`, () => {
          // Setup
          mockElement.getBoundingClientRect.mockReturnValue({ width: testCase.w, height: testCase.h });
          mockElement.querySelector.mockReturnValue(null); // Force SVG creation
          global.getComputedStyle.mockReturnValue({
            position: "static",
            borderRadius: `${testCase.r}px`,
          });

          // Exercise
          createProgressBorder(mockElement, 50, "#ff0000", "#cccccc", 0, {});

          // Verify - SVG viewBox uses actual dimensions
          expect(mockSvg.setAttribute).toHaveBeenCalledWith("viewBox", `0 0 ${testCase.w} ${testCase.h}`);
        });
      });
    });

    describe("Shape detection with pill dimensions", () => {
      beforeEach(() => {
        mockElement.querySelector.mockReturnValue(null); // Force SVG creation
      });

      it("should detect true circle from square element with circular border-radius", () => {
        // Setup - True circle: 50×50 with border-radius 25px
        mockElement.getBoundingClientRect.mockReturnValue({ width: 50, height: 50 });
        global.getComputedStyle.mockReturnValue({
          position: "static",
          borderRadius: "25px",
        });

        // Exercise
        createProgressBorder(mockElement, 50, "#ff0000", "#cccccc", 0, {});

        // Verify - Config should indicate circular: "true-25-50-50" (actual border radius)
        expect(mockSvg.setAttribute).toHaveBeenCalledWith("data-config", "true-25-50-50");
      });

      it("should detect horizontal pill from wide element with circular border-radius", () => {
        // Setup - Horizontal pill: 80×40 with border-radius 20px (rectangle cannot be circular)
        mockElement.getBoundingClientRect.mockReturnValue({ width: 80, height: 40 });
        global.getComputedStyle.mockReturnValue({
          position: "static",
          borderRadius: "20px", // Rectangle cannot be circular regardless of border-radius
        });

        // Exercise
        createProgressBorder(mockElement, 50, "#ff0000", "#cccccc", 0, {});

        // Verify - Config should indicate non-circular: "false-20-80-40"
        expect(mockSvg.setAttribute).toHaveBeenCalledWith("data-config", "false-20-80-40");
      });

      it("should detect vertical pill from tall element with circular border-radius", () => {
        // Setup - Vertical pill: 40×80 with border-radius 20px (rectangle cannot be circular)
        mockElement.getBoundingClientRect.mockReturnValue({ width: 40, height: 80 });
        global.getComputedStyle.mockReturnValue({
          position: "static",
          borderRadius: "20px", // Rectangle cannot be circular regardless of border-radius
        });

        // Exercise
        createProgressBorder(mockElement, 50, "#ff0000", "#cccccc", 0, {});

        // Verify - Config should indicate non-circular: "false-20-40-80"
        expect(mockSvg.setAttribute).toHaveBeenCalledWith("data-config", "false-20-40-80");
      });

      it("should detect rounded rectangle from element with small border-radius", () => {
        // Setup - Rounded rectangle: 80×50 with border-radius 15px (< min(80,50)/2 = 25)
        mockElement.getBoundingClientRect.mockReturnValue({ width: 80, height: 50 });
        global.getComputedStyle.mockReturnValue({
          position: "static",
          borderRadius: "15px", // < min(80,50)/2 = 25, so rectangular behavior
        });

        // Exercise
        createProgressBorder(mockElement, 50, "#ff0000", "#cccccc", 0, {});

        // Verify - Config should indicate rectangular: "false-{borderRadius}-{width}-{height}"
        expect(mockSvg.setAttribute).toHaveBeenCalledWith("data-config", "false-15-80-50");
      });
    });

    describe("Test Cases from Demo Validation", () => {
      // These test cases match exactly the validated scenarios from our interactive demo
      const testCases = [
        // True Circles
        { w: 50, h: 50, r: 25, expected: "True Circle", isCircular: true, borderRadius: 0 },
        { w: 50, h: 50, r: 30, expected: "True Circle", isCircular: true, borderRadius: 0 },
        { w: 60, h: 60, r: 30, expected: "True Circle", isCircular: true, borderRadius: 0 },

        // Horizontal Pills
        { w: 80, h: 40, r: 20, expected: "Horizontal Pill", isCircular: true, borderRadius: 0 },
        { w: 100, h: 50, r: 25, expected: "Horizontal Pill", isCircular: true, borderRadius: 0 },
        { w: 120, h: 40, r: 25, expected: "Horizontal Pill", isCircular: true, borderRadius: 0 },

        // Vertical Pills
        { w: 40, h: 80, r: 20, expected: "Vertical Pill", isCircular: true, borderRadius: 0 },
        { w: 50, h: 100, r: 25, expected: "Vertical Pill", isCircular: true, borderRadius: 0 },

        // Rounded Rectangles
        { w: 80, h: 50, r: 15, expected: "Rounded Rectangle", isCircular: false, borderRadius: 15 },
        { w: 60, h: 60, r: 20, expected: "Rounded Rectangle", isCircular: false, borderRadius: 20 },
        { w: 60, h: 60, r: 29, expected: "Rounded Rectangle", isCircular: false, borderRadius: 29 },
        { w: 100, h: 40, r: 15, expected: "Rounded Rectangle", isCircular: false, borderRadius: 15 },

        // Sharp Rectangles
        { w: 80, h: 50, r: 0, expected: "Sharp Rectangle", isCircular: false, borderRadius: 0 },
        { w: 60, h: 60, r: 0, expected: "Sharp Rectangle", isCircular: false, borderRadius: 0 },

        // Edge cases
        { w: 80, h: 50, r: 50, expected: "Horizontal Pill", isCircular: true, borderRadius: 0 },
        { w: 50, h: 80, r: 40, expected: "Vertical Pill", isCircular: true, borderRadius: 0 },
      ];

      testCases.forEach((testCase) => {
        it(`should handle ${testCase.expected}: ${testCase.w}×${testCase.h} with border-radius ${testCase.r}px`, () => {
          // Setup
          mockElement.getBoundingClientRect.mockReturnValue({ width: testCase.w, height: testCase.h });
          mockElement.querySelector.mockReturnValue(null); // Force SVG creation
          global.getComputedStyle.mockReturnValue({
            position: "static",
            borderRadius: `${testCase.r}px`,
          });

          // Exercise
          createProgressBorder(mockElement, 50, "#ff0000", "#cccccc", 0, {});

          // Verify - SVG viewBox uses actual dimensions
          expect(mockSvg.setAttribute).toHaveBeenCalledWith("viewBox", `0 0 ${testCase.w} ${testCase.h}`);
        });
      });

      describe("Backward compatibility", () => {
        it("should maintain old behavior when dimensions are square", () => {
          // Setup - Square element (existing behavior should remain the same)
          mockElement.getBoundingClientRect.mockReturnValue({ width: 40, height: 40 });
          mockElement.querySelector.mockReturnValue(null);
          global.getComputedStyle.mockReturnValue({
            position: "static",
            borderRadius: "8px",
          });

          // Exercise
          createProgressBorder(mockElement, 50, "#ff0000", "#cccccc", 0, {});

          // Verify - Should work exactly as before for square elements
          expect(mockSvg.setAttribute).toHaveBeenCalledWith("viewBox", "0 0 40 40");
          expect(mockSvg.setAttribute).toHaveBeenCalledWith("data-config", "false-8-40-40");
        });
      });
    });
  });
});
