import { jest } from "@jest/globals";
import { detectShapeFromBorderRadius, getBorderRadiusStyle, detectElementShape } from "../borderRadiusDetection.js";

describe("borderRadiusDetection", () => {
  describe("detectShapeFromBorderRadius", () => {
    const squareDimensions = { width: 40, height: 40 };
    const rectangleDimensions = { width: 80, height: 40 };

    it("should detect circular shapes from percentage border-radius", () => {
      expect(detectShapeFromBorderRadius("50%", squareDimensions)).toEqual({
        isCircular: true,
        borderRadius: 20, // 50% of 40px = 20px, >= 20px threshold
      });

      expect(detectShapeFromBorderRadius("60%", squareDimensions)).toEqual({
        isCircular: true,
        borderRadius: 24, // 60% of 40px = 24px, >= 20px threshold
      });

      expect(detectShapeFromBorderRadius("100%", squareDimensions)).toEqual({
        isCircular: true,
        borderRadius: 40, // 100% of 40px = 40px, >= 20px threshold
      });
    });

    it("should NOT detect rectangular shapes as circular even with 50% border-radius", () => {
      expect(detectShapeFromBorderRadius("50%", rectangleDimensions)).toEqual({
        isCircular: false, // Rectangle can't be circular
        borderRadius: 20, // 50% of min(80,40) = 20px
      });
    });

    it("should detect non-circular shapes from small percentage border-radius", () => {
      expect(detectShapeFromBorderRadius("25%", squareDimensions)).toEqual({
        isCircular: false,
        borderRadius: 10, // 25% of 40px = 10px, < 20px threshold
      });

      expect(detectShapeFromBorderRadius("10%", squareDimensions)).toEqual({
        isCircular: false,
        borderRadius: 4, // 10% of 40px = 4px, < 20px threshold
      });

      expect(detectShapeFromBorderRadius("0%", squareDimensions)).toEqual({
        isCircular: false,
        borderRadius: 0,
      });
    });

    it("should handle invalid percentage values", () => {
      expect(detectShapeFromBorderRadius("invalid%", squareDimensions)).toEqual({
        isCircular: false,
        borderRadius: 0,
      });

      expect(detectShapeFromBorderRadius("abc%", squareDimensions)).toEqual({
        isCircular: false,
        borderRadius: 0,
      });

      expect(detectShapeFromBorderRadius("%", squareDimensions)).toEqual({
        isCircular: false,
        borderRadius: 0,
      });
    });

    it("should detect circular shapes from special '50' string case", () => {
      expect(detectShapeFromBorderRadius("150px", squareDimensions)).toEqual({
        isCircular: true,
        borderRadius: 150, // Parsed as 150px, > 20px threshold
      });

      expect(detectShapeFromBorderRadius("50rem", squareDimensions)).toEqual({
        isCircular: true,
        borderRadius: 50, // Parsed as 50px, > 20px threshold
      });

      expect(detectShapeFromBorderRadius("250em", squareDimensions)).toEqual({
        isCircular: true,
        borderRadius: 250, // Parsed as 250px, > 20px threshold
      });
    });

    it("should detect circular shapes from large pixel border-radius on squares", () => {
      // Square element radius is 20px (size 40 / 2)
      expect(detectShapeFromBorderRadius("20px", squareDimensions)).toEqual({
        isCircular: true,
        borderRadius: 20,
      });

      expect(detectShapeFromBorderRadius("25px", squareDimensions)).toEqual({
        isCircular: true,
        borderRadius: 25,
      });

      expect(detectShapeFromBorderRadius("100px", squareDimensions)).toEqual({
        isCircular: true,
        borderRadius: 100,
      });
    });

    it("should NOT detect rectangular shapes as circular even with large border-radius", () => {
      // Rectangle 80x40 should not be circular regardless of border-radius
      expect(detectShapeFromBorderRadius("20px", rectangleDimensions)).toEqual({
        isCircular: false,
        borderRadius: 20,
      });

      expect(detectShapeFromBorderRadius("40px", rectangleDimensions)).toEqual({
        isCircular: false,
        borderRadius: 40,
      });
    });

    it("should detect square shapes with small pixel border-radius", () => {
      expect(detectShapeFromBorderRadius("5px", squareDimensions)).toEqual({
        isCircular: false,
        borderRadius: 5,
      });

      expect(detectShapeFromBorderRadius("10px", squareDimensions)).toEqual({
        isCircular: false,
        borderRadius: 10,
      });

      expect(detectShapeFromBorderRadius("19px", squareDimensions)).toEqual({
        isCircular: false,
        borderRadius: 19,
      });
    });

    it("should handle square shapes (no border radius)", () => {
      expect(detectShapeFromBorderRadius("0px", squareDimensions)).toEqual({
        isCircular: false,
        borderRadius: 0,
      });

      expect(detectShapeFromBorderRadius("0", squareDimensions)).toEqual({
        isCircular: false,
        borderRadius: 0,
      });
    });

    it("should handle empty or null border radius", () => {
      expect(detectShapeFromBorderRadius("", squareDimensions)).toEqual({
        isCircular: false,
        borderRadius: 0,
      });

      expect(detectShapeFromBorderRadius(null, squareDimensions)).toEqual({
        isCircular: false,
        borderRadius: 0,
      });

      expect(detectShapeFromBorderRadius(undefined, squareDimensions)).toEqual({
        isCircular: false,
        borderRadius: 0,
      });
    });

    it("should handle invalid pixel values", () => {
      expect(detectShapeFromBorderRadius("invalidpx", squareDimensions)).toEqual({
        isCircular: false,
        borderRadius: 0,
      });

      expect(detectShapeFromBorderRadius("abcpx", squareDimensions)).toEqual({
        isCircular: false,
        borderRadius: 0,
      });
    });

    it("should work with different element sizes", () => {
      // Small square element (20x20, radius = 10)
      const smallSquare = { width: 20, height: 20 };
      expect(detectShapeFromBorderRadius("10px", smallSquare)).toEqual({
        isCircular: true,
        borderRadius: 10,
      });

      expect(detectShapeFromBorderRadius("5px", smallSquare)).toEqual({
        isCircular: false,
        borderRadius: 5,
      });

      // Large square element (100x100, radius = 50)
      const largeSquare = { width: 100, height: 100 };
      expect(detectShapeFromBorderRadius("50px", largeSquare)).toEqual({
        isCircular: true,
        borderRadius: 50,
      });

      expect(detectShapeFromBorderRadius("25px", largeSquare)).toEqual({
        isCircular: false,
        borderRadius: 25,
      });
    });
  });

  describe("getBorderRadiusStyle", () => {
    let mockElement;

    beforeEach(() => {
      mockElement = {};

      // Mock getComputedStyle
      global.getComputedStyle = jest.fn();
    });

    afterEach(() => {
      delete global.getComputedStyle;
    });

    it("should return border radius from computed style", () => {
      global.getComputedStyle.mockReturnValue({
        borderRadius: "10px",
      });

      expect(getBorderRadiusStyle(mockElement)).toBe("10px");
      expect(global.getComputedStyle).toHaveBeenCalledWith(mockElement);
    });

    it("should return empty string when border radius is not set", () => {
      global.getComputedStyle.mockReturnValue({
        borderRadius: "",
      });

      expect(getBorderRadiusStyle(mockElement)).toBe("");
    });

    it("should return empty string when borderRadius property is missing", () => {
      global.getComputedStyle.mockReturnValue({});

      expect(getBorderRadiusStyle(mockElement)).toBe("");
    });

    it("should handle missing getComputedStyle", () => {
      delete global.getComputedStyle;

      expect(getBorderRadiusStyle(mockElement)).toBe("");
    });

    it("should handle various border radius values", () => {
      const testValues = ["50%", "0px", "5px 10px", "25px", "100%"];

      testValues.forEach((value) => {
        global.getComputedStyle.mockReturnValue({
          borderRadius: value,
        });

        expect(getBorderRadiusStyle(mockElement)).toBe(value);
      });
    });
  });

  describe("detectElementShape", () => {
    let mockElement;

    beforeEach(() => {
      mockElement = {};
      global.getComputedStyle = jest.fn();
    });

    afterEach(() => {
      delete global.getComputedStyle;
    });

    it("should combine getBorderRadiusStyle and detectShapeFromBorderRadius", () => {
      global.getComputedStyle.mockReturnValue({
        borderRadius: "10px",
      });

      const result = detectElementShape(mockElement, { width: 40, height: 40 });

      expect(result).toEqual({
        isCircular: false,
        borderRadius: 10,
      });
      expect(global.getComputedStyle).toHaveBeenCalledWith(mockElement);
    });

    it("should handle circular detection from element", () => {
      global.getComputedStyle.mockReturnValue({
        borderRadius: "50%",
      });

      const result = detectElementShape(mockElement, { width: 40, height: 40 });

      expect(result).toEqual({
        isCircular: true,
        borderRadius: 20, // 50% of 40px = 20px, >= 20px threshold
      });
    });

    it("should NOT detect rectangles as circular even with 50% border-radius", () => {
      global.getComputedStyle.mockReturnValue({
        borderRadius: "50%",
      });

      const result = detectElementShape(mockElement, { width: 80, height: 40 });

      expect(result).toEqual({
        isCircular: false, // Rectangle cannot be circular
        borderRadius: 20, // 50% of min(80,40) = 20px
      });
    });

    it("should handle missing border radius", () => {
      global.getComputedStyle.mockReturnValue({});

      const result = detectElementShape(mockElement, { width: 40, height: 40 });

      expect(result).toEqual({
        isCircular: false,
        borderRadius: 0,
      });
    });

    it("should work with different element sizes", () => {
      global.getComputedStyle.mockReturnValue({
        borderRadius: "15px",
      });

      // Small square element - 15px radius >= 10px element radius = circular
      expect(detectElementShape(mockElement, { width: 20, height: 20 })).toEqual({
        isCircular: true,
        borderRadius: 15,
      });

      // Large square element - 15px radius < 50px element radius = rectangular
      expect(detectElementShape(mockElement, { width: 100, height: 100 })).toEqual({
        isCircular: false,
        borderRadius: 15,
      });

      // Rectangle element - can't be circular regardless of border-radius
      expect(detectElementShape(mockElement, { width: 60, height: 20 })).toEqual({
        isCircular: false,
        borderRadius: 15,
      });
    });

    describe("borderRadiusOverride parameter", () => {
      beforeEach(() => {
        // Set up CSS border-radius that would normally be used
        global.getComputedStyle.mockReturnValue({
          borderRadius: "50%", // CSS says circular
        });
      });

      it("should use numeric override instead of CSS border-radius", () => {
        // Setup - CSS says circular (50%) but override says 8px
        const result = detectElementShape(mockElement, { width: 40, height: 40 }, 8);

        // Verify - Should use override (8px) instead of CSS (50%)
        expect(result).toEqual({
          isCircular: false,
          borderRadius: 8,
        });

        // Should not have called getComputedStyle since override was provided
        expect(global.getComputedStyle).not.toHaveBeenCalled();
      });

      it("should use string percentage override instead of CSS border-radius", () => {
        // Setup - CSS says circular but override says 25%
        const result = detectElementShape(mockElement, { width: 40, height: 40 }, "25%");

        // Verify - Should use override (25%) instead of CSS (50%)
        expect(result).toEqual({
          isCircular: false,
          borderRadius: 10, // 25% of 40px = 10px, < 20px threshold
        });

        // Should not have called getComputedStyle
        expect(global.getComputedStyle).not.toHaveBeenCalled();
      });

      it("should use string pixel override instead of CSS border-radius", () => {
        // Setup - Override with string pixel value
        const result = detectElementShape(mockElement, { width: 40, height: 40 }, "12px");

        // Verify - Should use override (12px)
        expect(result).toEqual({
          isCircular: false,
          borderRadius: 12,
        });

        // Should not have called getComputedStyle
        expect(global.getComputedStyle).not.toHaveBeenCalled();
      });

      it("should make shape circular with percentage override >= 50%", () => {
        // Setup - Override with circular percentage
        const result = detectElementShape(mockElement, { width: 40, height: 40 }, "60%");

        // Verify - Should be circular
        expect(result).toEqual({
          isCircular: true,
          borderRadius: 24, // 60% of 40px = 24px, >= 20px threshold
        });
      });

      it("should handle zero override (force square)", () => {
        // Setup - Override with 0 to force square
        const result = detectElementShape(mockElement, { width: 40, height: 40 }, 0);

        // Verify - Should be square with 0 border radius
        expect(result).toEqual({
          isCircular: false,
          borderRadius: 0,
        });
      });

      it("should handle large numeric override that makes shape circular", () => {
        // Setup - Override with large radius that >= element radius
        const result = detectElementShape(mockElement, { width: 40, height: 40 }, 25); // 25px >= 20px element radius

        // Verify - Should be circular
        expect(result).toEqual({
          isCircular: true,
          borderRadius: 25, // Should return actual border radius
        });
      });

      it("should handle null override by falling back to CSS", () => {
        // Setup - Null override should fall back to CSS
        const result = detectElementShape(mockElement, { width: 40, height: 40 }, null);

        // Verify - Should use CSS (50% = circular)
        expect(result).toEqual({
          isCircular: true,
          borderRadius: 20, // 50% of 40px = 20px
        });

        // Should have called getComputedStyle
        expect(global.getComputedStyle).toHaveBeenCalledWith(mockElement);
      });

      it("should handle undefined override by falling back to CSS", () => {
        // Setup - Undefined override should fall back to CSS
        const result = detectElementShape(mockElement, { width: 40, height: 40 }, undefined);

        // Verify - Should use CSS (50% = circular)
        expect(result).toEqual({
          isCircular: true,
          borderRadius: 20, // 50% of 40px = 20px
        });

        // Should have called getComputedStyle
        expect(global.getComputedStyle).toHaveBeenCalledWith(mockElement);
      });

      it("should convert non-string non-number override to string", () => {
        // Setup - Override with an object (edge case)
        const result = detectElementShape(mockElement, { width: 40, height: 40 }, { value: "10px" });

        // Verify - Should convert to string "[object Object]" and parse as 0
        expect(result).toEqual({
          isCircular: false,
          borderRadius: 0,
        });
      });

      it("should handle override with CSS units other than px", () => {
        // Setup - Override with rem units
        const result = detectElementShape(mockElement, { width: 40, height: 40 }, "1rem");

        // Verify - Should parse as 1 and treat as pixels
        expect(result).toEqual({
          isCircular: false,
          borderRadius: 1,
        });
      });

      it("should work when CSS border-radius is undefined", () => {
        // Setup - CSS has no border-radius, override provided
        global.getComputedStyle.mockReturnValue({
          // No borderRadius property
        });

        const result = detectElementShape(mockElement, { width: 40, height: 40 }, 15);

        // Verify - Should use override regardless of missing CSS
        expect(result).toEqual({
          isCircular: false,
          borderRadius: 15,
        });
      });
    });
  });

  describe("Pill Shape Scenarios (width ≠ height)", () => {
    // These tests cover the scenarios validated in our interactive demo
    // They verify the shape detection logic for pills, circles, and rectangles

    describe("True Circles (width = height)", () => {
      it("should detect true circles correctly", () => {
        // 50×50 element with border-radius 25px = True Circle
        expect(detectShapeFromBorderRadius("25px", { width: 50, height: 50 })).toEqual({
          isCircular: true,
          borderRadius: 25,
        });

        // 50×50 element with border-radius 30px = True Circle (excessive radius)
        expect(detectShapeFromBorderRadius("30px", { width: 50, height: 50 })).toEqual({
          isCircular: true,
          borderRadius: 30,
        });

        // 60×60 element with border-radius 30px = True Circle
        expect(detectShapeFromBorderRadius("30px", { width: 60, height: 60 })).toEqual({
          isCircular: true,
          borderRadius: 30,
        });
      });
    });

    describe("Horizontal Pills (width > height)", () => {
      it("should NOT detect horizontal pills as circular (width ≠ height)", () => {
        // 80×40 element: rectangle can never be circular
        expect(detectShapeFromBorderRadius("20px", { width: 80, height: 40 })).toEqual({
          isCircular: false, // Rectangle cannot be circular
          borderRadius: 20,
        });

        // 100×50 element: rectangle can never be circular
        expect(detectShapeFromBorderRadius("25px", { width: 100, height: 50 })).toEqual({
          isCircular: false, // Rectangle cannot be circular
          borderRadius: 25,
        });

        // 120×40 element: rectangle can never be circular
        expect(detectShapeFromBorderRadius("25px", { width: 120, height: 40 })).toEqual({
          isCircular: false, // Rectangle cannot be circular
          borderRadius: 25,
        });
      });

      it("should detect when border-radius makes horizontal rectangles non-circular", () => {
        // 80×50 element: rectangle with small border radius
        expect(detectShapeFromBorderRadius("15px", { width: 80, height: 50 })).toEqual({
          isCircular: false,
          borderRadius: 15,
        });

        // 100×40 element: rectangle with small border radius
        expect(detectShapeFromBorderRadius("15px", { width: 100, height: 40 })).toEqual({
          isCircular: false,
          borderRadius: 15,
        });
      });
    });

    describe("Vertical Pills (height > width)", () => {
      it("should NOT detect vertical pills as circular (width ≠ height)", () => {
        // 40×80 element: rectangle can never be circular
        expect(detectShapeFromBorderRadius("20px", { width: 40, height: 80 })).toEqual({
          isCircular: false, // Rectangle cannot be circular
          borderRadius: 20,
        });

        // 50×100 element: rectangle can never be circular
        expect(detectShapeFromBorderRadius("25px", { width: 50, height: 100 })).toEqual({
          isCircular: false, // Rectangle cannot be circular
          borderRadius: 25,
        });
      });
    });

    describe("Rounded Rectangles", () => {
      it("should detect rounded rectangles correctly for various dimensions", () => {
        // 60×60 element: Square with border-radius 20px < 30px threshold = not circular
        expect(detectShapeFromBorderRadius("20px", { width: 60, height: 60 })).toEqual({
          isCircular: false,
          borderRadius: 20,
        });

        // Edge case: 60×60 element with border-radius 29px = almost circular but not quite
        expect(detectShapeFromBorderRadius("29px", { width: 60, height: 60 })).toEqual({
          isCircular: false,
          borderRadius: 29,
        });
      });
    });

    describe("Edge Cases with Excessive Border Radius", () => {
      it("should handle excessive border radius correctly", () => {
        // 80×50 element: Rectangle can never be circular, regardless of border-radius
        expect(detectShapeFromBorderRadius("50px", { width: 80, height: 50 })).toEqual({
          isCircular: false, // Rectangle cannot be circular
          borderRadius: 50,
        });

        // 50×80 element: Rectangle can never be circular, regardless of border-radius
        expect(detectShapeFromBorderRadius("40px", { width: 50, height: 80 })).toEqual({
          isCircular: false, // Rectangle cannot be circular
          borderRadius: 40,
        });
      });
    });
  });

  describe("detectElementShape with dimensions parameter", () => {
    let mockElement;

    beforeEach(() => {
      mockElement = {};
      global.getComputedStyle = jest.fn();
    });

    afterEach(() => {
      delete global.getComputedStyle;
    });

    describe("Accept dimensions object {width, height}", () => {
      it("should accept {width, height} object for true circles", () => {
        global.getComputedStyle.mockReturnValue({
          borderRadius: "25px",
        });

        // NEW API: pass dimensions object instead of single size
        const result = detectElementShape(mockElement, { width: 50, height: 50 });

        expect(result).toEqual({
          isCircular: true,
          borderRadius: 25, // Should return actual border radius
        });
      });

      it("should accept {width, height} object for horizontal pills", () => {
        global.getComputedStyle.mockReturnValue({
          borderRadius: "20px",
        });

        // 80×40: Rectangle can never be circular regardless of border-radius
        const result = detectElementShape(mockElement, { width: 80, height: 40 });

        expect(result).toEqual({
          isCircular: false, // Rectangle cannot be circular
          borderRadius: 20,
        });
      });

      it("should accept {width, height} object for vertical pills", () => {
        global.getComputedStyle.mockReturnValue({
          borderRadius: "20px",
        });

        // 40×80: Rectangle can never be circular regardless of border-radius
        const result = detectElementShape(mockElement, { width: 40, height: 80 });

        expect(result).toEqual({
          isCircular: false, // Rectangle cannot be circular
          borderRadius: 20,
        });
      });

      it("should accept {width, height} object for rounded rectangles", () => {
        global.getComputedStyle.mockReturnValue({
          borderRadius: "15px",
        });

        // 80×50: elementSize = min(80,50) = 50, threshold = 25, 15px < 25px = not circular
        const result = detectElementShape(mockElement, { width: 80, height: 50 });

        expect(result).toEqual({
          isCircular: false,
          borderRadius: 15,
        });
      });
    });
  });
});
