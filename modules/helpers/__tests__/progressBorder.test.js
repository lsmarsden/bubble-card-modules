/**
 * Comprehensive Tests for progressBorder.js
 */

import { jest } from "@jest/globals";
import { createProgressBorder, removeProgressBorder } from "../progressBorder.js";

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
    createProgressBorder(mockElement, 50, "#ff0000", "#cccccc", 0, {});

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
      if (attr === "data-offset") return "0";
      if (attr === "stroke") return "#ff0000";
      return null;
    });

    // Exercise
    createProgressBorder(mockElement, 50, "#ff0000", "#cccccc", 0, {});

    // Verify - 50% progress
    expect(mockProgressPath.setAttribute).toHaveBeenCalledWith("stroke", "#ff0000");
    expect(mockProgressPath.setAttribute).toHaveBeenCalledWith("stroke-dasharray", "150 150");
  });

  it("should clamp values above 100%", () => {
    // Setup existing SVG
    mockElement.querySelector.mockReturnValue(mockSvg);
    mockProgressPath.getAttribute.mockImplementation((attr) => {
      if (attr === "data-length") return "300";
      if (attr === "data-offset") return "0";
      if (attr === "stroke") return "#ff0000";
      return null;
    });

    // Exercise
    createProgressBorder(mockElement, 150, "#ff0000", "#cccccc", 0, {});

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

    // Verify - Config indicates circular (true-0-40)
    expect(mockSvg.setAttribute).toHaveBeenCalledWith("data-config", "true-0-40");
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

    // Verify - Config indicates circular
    expect(mockSvg.setAttribute).toHaveBeenCalledWith("data-config", "true-0-40");
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

    // Verify - Should be treated as circular due to large radius
    expect(mockSvg.setAttribute).toHaveBeenCalledWith("data-config", "true-0-40");
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
    expect(mockSvg.setAttribute).toHaveBeenCalledWith("data-config", "false-0-40");
  });

  it("should apply start angle offset", () => {
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
      if (attr === "data-offset") return "-29.5";
      if (attr === "stroke") return "#ff0000";
      return null;
    });

    // Exercise - 90 degree start angle
    createProgressBorder(mockElement, 50, "#ff0000", "#cccccc", 90, {});

    // Verify - Total offset includes both angle offset (75) and visual offset (-29.5) = 45.5
    expect(mockProgressPath.setAttribute).toHaveBeenCalledWith("stroke-dashoffset", 45.5);
  });

  it("should handle first time animation", () => {
    // Setup - First appearance (transparent stroke)
    mockElement.querySelector.mockReturnValue(mockSvg);
    mockProgressPath.getAttribute.mockImplementation((attr) => {
      if (attr === "data-length") return "300";
      if (attr === "data-offset") return "0";
      if (attr === "stroke") return "transparent"; // First appearance
      return null;
    });

    // Exercise
    createProgressBorder(mockElement, 75, "#ff0000", "#cccccc", 0, {});

    // Verify - Animation setup
    expect(mockProgressPath.setAttribute).toHaveBeenCalledWith("stroke", "#ff0000");
    expect(mockProgressPath.setAttribute).toHaveBeenCalledWith("stroke-dasharray", "0 300");
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
    expect(mockSvg.setAttribute).toHaveBeenCalledWith("data-config", "false-8-40");
  });

  it("should handle first time animation for 100% progress", () => {
    // Setup - First appearance (transparent stroke) with 100% progress
    mockElement.querySelector.mockReturnValue(mockSvg);
    mockProgressPath.getAttribute.mockImplementation((attr) => {
      if (attr === "data-length") return "300";
      if (attr === "data-offset") return "0";
      if (attr === "stroke") return "transparent"; // First appearance
      return null;
    });

    // Exercise
    createProgressBorder(mockElement, 100, "#ff0000", "#cccccc", 0, {});

    // Verify - Animation setup for 100%
    expect(mockProgressPath.setAttribute).toHaveBeenCalledWith("stroke", "#ff0000");
    expect(mockProgressPath.setAttribute).toHaveBeenCalledWith("stroke-dasharray", "0 300");
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
    expect(mockSvg.setAttribute).toHaveBeenCalledWith("data-config", "false-0-40");
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
});
