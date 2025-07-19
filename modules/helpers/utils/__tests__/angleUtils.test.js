import { normalizeAngle, angleToOffset, angleToPercentage } from "../angleUtils.js";

describe("angleUtils", () => {
  describe("normalizeAngle", () => {
    it("should return angle unchanged when already in 0-359 range", () => {
      expect(normalizeAngle(0)).toBe(0);
      expect(normalizeAngle(90)).toBe(90);
      expect(normalizeAngle(180)).toBe(180);
      expect(normalizeAngle(270)).toBe(270);
      expect(normalizeAngle(359)).toBe(359);
    });

    it("should normalize positive angles greater than 360", () => {
      expect(normalizeAngle(360)).toBe(0);
      expect(normalizeAngle(450)).toBe(90);
      expect(normalizeAngle(720)).toBe(0);
      expect(normalizeAngle(810)).toBe(90);
      expect(normalizeAngle(1080)).toBe(0);
    });

    it("should normalize negative angles", () => {
      expect(normalizeAngle(-90)).toBe(270);
      expect(normalizeAngle(-180)).toBe(180);
      expect(normalizeAngle(-270)).toBe(90);
      expect(normalizeAngle(-360)).toBe(0);
      expect(normalizeAngle(-450)).toBe(270);
    });

    it("should handle decimal angles", () => {
      expect(normalizeAngle(90.5)).toBe(90.5);
      expect(normalizeAngle(450.25)).toBe(90.25);
      expect(normalizeAngle(-90.75)).toBe(269.25);
    });

    it("should handle zero", () => {
      expect(normalizeAngle(0)).toBe(0);
      expect(normalizeAngle(-0)).toBe(0);
    });

    it("should handle very large angles", () => {
      expect(normalizeAngle(3600)).toBe(0); // 10 full rotations
      expect(normalizeAngle(3690)).toBe(90); // 10 rotations + 90°
    });
  });

  describe("angleToOffset", () => {
    it("should calculate offset for basic angles with 360-length path", () => {
      const pathLength = 360;

      expect(angleToOffset(0, pathLength)).toBe(0);
      expect(angleToOffset(90, pathLength)).toBe(90);
      expect(angleToOffset(180, pathLength)).toBe(180);
      expect(angleToOffset(270, pathLength)).toBe(270);
    });

    it("should calculate offset for normalized angles", () => {
      const pathLength = 360;

      expect(angleToOffset(360, pathLength)).toBe(0); // Normalized to 0
      expect(angleToOffset(450, pathLength)).toBe(90); // Normalized to 90
      expect(angleToOffset(-90, pathLength)).toBe(270); // Normalized to 270
    });

    it("should apply visual offset", () => {
      const pathLength = 360;
      const visualOffset = -45;

      expect(angleToOffset(0, pathLength, visualOffset)).toBe(-45);
      expect(angleToOffset(90, pathLength, visualOffset)).toBe(45);
      expect(angleToOffset(180, pathLength, visualOffset)).toBe(135);
    });

    it("should work with different path lengths", () => {
      expect(angleToOffset(90, 100)).toBe(25); // 90/360 * 100 = 25
      expect(angleToOffset(180, 200)).toBe(100); // 180/360 * 200 = 100
      expect(angleToOffset(270, 400)).toBe(300); // 270/360 * 400 = 300
    });

    it("should handle decimal results", () => {
      expect(angleToOffset(45, 360)).toBe(45);
      expect(angleToOffset(30, 300)).toBe(25); // 30/360 * 300 = 25
      expect(angleToOffset(60, 300)).toBe(50); // 60/360 * 300 = 50
    });

    it("should combine angle normalization with visual offset", () => {
      const pathLength = 300;
      const visualOffset = -37.5;

      // 450° normalizes to 90°, then: (90/360 * 300) + (-37.5) = 75 - 37.5 = 37.5
      expect(angleToOffset(450, pathLength, visualOffset)).toBe(37.5);

      // -90° normalizes to 270°, then: (270/360 * 300) + (-37.5) = 225 - 37.5 = 187.5
      expect(angleToOffset(-90, pathLength, visualOffset)).toBe(187.5);
    });
  });

  describe("angleToPercentage", () => {
    it("should convert basic angles to percentages", () => {
      expect(angleToPercentage(0)).toBe(0);
      expect(angleToPercentage(90)).toBe(0.25);
      expect(angleToPercentage(180)).toBe(0.5);
      expect(angleToPercentage(270)).toBe(0.75);
      expect(angleToPercentage(360)).toBe(0); // Normalized to 0
    });

    it("should normalize angles before converting", () => {
      expect(angleToPercentage(450)).toBe(0.25); // 450° → 90° → 0.25
      expect(angleToPercentage(-90)).toBe(0.75); // -90° → 270° → 0.75
      expect(angleToPercentage(720)).toBe(0); // 720° → 0° → 0
    });

    it("should handle decimal angles", () => {
      expect(angleToPercentage(45)).toBe(0.125); // 45/360 = 0.125
      expect(angleToPercentage(30)).toBe(30 / 360); // 1/12
      expect(angleToPercentage(60)).toBe(60 / 360); // 1/6
    });

    it("should return values in 0-1 range", () => {
      const testAngles = [0, 30, 45, 90, 135, 180, 225, 270, 315, 359.9, 360, 450, -90, -180];

      testAngles.forEach((angle) => {
        const percentage = angleToPercentage(angle);
        expect(percentage).toBeGreaterThanOrEqual(0);
        expect(percentage).toBeLessThan(1);
      });
    });
  });
});
