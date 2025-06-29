import { jest } from "@jest/globals";
import { detectShapeFromBorderRadius, getBorderRadiusStyle, detectElementShape } from "../borderRadiusDetection.js";

describe("borderRadiusDetection", () => {
  describe("detectShapeFromBorderRadius", () => {
    const elementSize = 40;

    it("should detect circular shapes from percentage border-radius", () => {
      expect(detectShapeFromBorderRadius("50%", elementSize)).toEqual({
        isCircular: true,
        borderRadius: 0,
      });

      expect(detectShapeFromBorderRadius("60%", elementSize)).toEqual({
        isCircular: true,
        borderRadius: 0,
      });

      expect(detectShapeFromBorderRadius("100%", elementSize)).toEqual({
        isCircular: true,
        borderRadius: 0,
      });
    });

    it("should detect non-circular shapes from small percentage border-radius", () => {
      expect(detectShapeFromBorderRadius("25%", elementSize)).toEqual({
        isCircular: false,
        borderRadius: 0,
      });

      expect(detectShapeFromBorderRadius("10%", elementSize)).toEqual({
        isCircular: false,
        borderRadius: 0,
      });

      expect(detectShapeFromBorderRadius("0%", elementSize)).toEqual({
        isCircular: false,
        borderRadius: 0,
      });
    });

    it("should handle invalid percentage values", () => {
      expect(detectShapeFromBorderRadius("invalid%", elementSize)).toEqual({
        isCircular: false,
        borderRadius: 0,
      });

      expect(detectShapeFromBorderRadius("abc%", elementSize)).toEqual({
        isCircular: false,
        borderRadius: 0,
      });

      expect(detectShapeFromBorderRadius("%", elementSize)).toEqual({
        isCircular: false,
        borderRadius: 0,
      });
    });

    it("should detect circular shapes from special '50' string case", () => {
      expect(detectShapeFromBorderRadius("150px", elementSize)).toEqual({
        isCircular: true,
        borderRadius: 0,
      });

      expect(detectShapeFromBorderRadius("50rem", elementSize)).toEqual({
        isCircular: true,
        borderRadius: 0,
      });

      expect(detectShapeFromBorderRadius("250em", elementSize)).toEqual({
        isCircular: true,
        borderRadius: 0,
      });
    });

    it("should detect circular shapes from large pixel border-radius", () => {
      // Element radius is 20px (size 40 / 2)
      expect(detectShapeFromBorderRadius("20px", elementSize)).toEqual({
        isCircular: true,
        borderRadius: 0,
      });

      expect(detectShapeFromBorderRadius("25px", elementSize)).toEqual({
        isCircular: true,
        borderRadius: 0,
      });

      expect(detectShapeFromBorderRadius("100px", elementSize)).toEqual({
        isCircular: true,
        borderRadius: 0,
      });
    });

    it("should detect rectangular shapes with small pixel border-radius", () => {
      expect(detectShapeFromBorderRadius("5px", elementSize)).toEqual({
        isCircular: false,
        borderRadius: 5,
      });

      expect(detectShapeFromBorderRadius("10px", elementSize)).toEqual({
        isCircular: false,
        borderRadius: 10,
      });

      expect(detectShapeFromBorderRadius("19px", elementSize)).toEqual({
        isCircular: false,
        borderRadius: 19,
      });
    });

    it("should handle square shapes (no border radius)", () => {
      expect(detectShapeFromBorderRadius("0px", elementSize)).toEqual({
        isCircular: false,
        borderRadius: 0,
      });

      expect(detectShapeFromBorderRadius("0", elementSize)).toEqual({
        isCircular: false,
        borderRadius: 0,
      });
    });

    it("should handle empty or null border radius", () => {
      expect(detectShapeFromBorderRadius("", elementSize)).toEqual({
        isCircular: false,
        borderRadius: 0,
      });

      expect(detectShapeFromBorderRadius(null, elementSize)).toEqual({
        isCircular: false,
        borderRadius: 0,
      });

      expect(detectShapeFromBorderRadius(undefined, elementSize)).toEqual({
        isCircular: false,
        borderRadius: 0,
      });
    });

    it("should handle invalid pixel values", () => {
      expect(detectShapeFromBorderRadius("invalidpx", elementSize)).toEqual({
        isCircular: false,
        borderRadius: 0,
      });

      expect(detectShapeFromBorderRadius("abcpx", elementSize)).toEqual({
        isCircular: false,
        borderRadius: 0,
      });
    });

    it("should work with different element sizes", () => {
      // Small element (radius = 10)
      expect(detectShapeFromBorderRadius("10px", 20)).toEqual({
        isCircular: true,
        borderRadius: 0,
      });

      expect(detectShapeFromBorderRadius("5px", 20)).toEqual({
        isCircular: false,
        borderRadius: 5,
      });

      // Large element (radius = 50)
      expect(detectShapeFromBorderRadius("50px", 100)).toEqual({
        isCircular: true,
        borderRadius: 0,
      });

      expect(detectShapeFromBorderRadius("25px", 100)).toEqual({
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

      const result = detectElementShape(mockElement, 40);

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

      const result = detectElementShape(mockElement, 40);

      expect(result).toEqual({
        isCircular: true,
        borderRadius: 0,
      });
    });

    it("should handle missing border radius", () => {
      global.getComputedStyle.mockReturnValue({});

      const result = detectElementShape(mockElement, 40);

      expect(result).toEqual({
        isCircular: false,
        borderRadius: 0,
      });
    });

    it("should work with different element sizes", () => {
      global.getComputedStyle.mockReturnValue({
        borderRadius: "15px",
      });

      // Small element - 15px radius >= 10px element radius = circular
      expect(detectElementShape(mockElement, 20)).toEqual({
        isCircular: true,
        borderRadius: 0,
      });

      // Large element - 15px radius < 50px element radius = rectangular
      expect(detectElementShape(mockElement, 100)).toEqual({
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
        const result = detectElementShape(mockElement, 40, 8);

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
        const result = detectElementShape(mockElement, 40, "25%");

        // Verify - Should use override (25%) instead of CSS (50%)
        expect(result).toEqual({
          isCircular: false,
          borderRadius: 0,
        });

        // Should not have called getComputedStyle
        expect(global.getComputedStyle).not.toHaveBeenCalled();
      });

      it("should use string pixel override instead of CSS border-radius", () => {
        // Setup - Override with string pixel value
        const result = detectElementShape(mockElement, 40, "12px");

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
        const result = detectElementShape(mockElement, 40, "60%");

        // Verify - Should be circular
        expect(result).toEqual({
          isCircular: true,
          borderRadius: 0,
        });
      });

      it("should handle zero override (force square)", () => {
        // Setup - Override with 0 to force square
        const result = detectElementShape(mockElement, 40, 0);

        // Verify - Should be square with 0 border radius
        expect(result).toEqual({
          isCircular: false,
          borderRadius: 0,
        });
      });

      it("should handle large numeric override that makes shape circular", () => {
        // Setup - Override with large radius that >= element radius
        const result = detectElementShape(mockElement, 40, 25); // 25px >= 20px element radius

        // Verify - Should be circular
        expect(result).toEqual({
          isCircular: true,
          borderRadius: 0,
        });
      });

      it("should handle null override by falling back to CSS", () => {
        // Setup - Null override should fall back to CSS
        const result = detectElementShape(mockElement, 40, null);

        // Verify - Should use CSS (50% = circular)
        expect(result).toEqual({
          isCircular: true,
          borderRadius: 0,
        });

        // Should have called getComputedStyle
        expect(global.getComputedStyle).toHaveBeenCalledWith(mockElement);
      });

      it("should handle undefined override by falling back to CSS", () => {
        // Setup - Undefined override should fall back to CSS
        const result = detectElementShape(mockElement, 40, undefined);

        // Verify - Should use CSS (50% = circular)
        expect(result).toEqual({
          isCircular: true,
          borderRadius: 0,
        });

        // Should have called getComputedStyle
        expect(global.getComputedStyle).toHaveBeenCalledWith(mockElement);
      });

      it("should convert non-string non-number override to string", () => {
        // Setup - Override with an object (edge case)
        const result = detectElementShape(mockElement, 40, { value: "10px" });

        // Verify - Should convert to string "[object Object]" and parse as 0
        expect(result).toEqual({
          isCircular: false,
          borderRadius: 0,
        });
      });

      it("should handle override with CSS units other than px", () => {
        // Setup - Override with rem units
        const result = detectElementShape(mockElement, 40, "1rem");

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

        const result = detectElementShape(mockElement, 40, 15);

        // Verify - Should use override regardless of missing CSS
        expect(result).toEqual({
          isCircular: false,
          borderRadius: 15,
        });
      });
    });
  });
});
