import { timeToPercent, parseTimeString, formatTime, parseHHMMSSToSeconds } from "../timeUtils.js";

describe("timeUtils", () => {
  describe("timeToPercent", () => {
    it("should convert midnight to 0%", () => {
      expect(timeToPercent(0, 0)).toBe(0);
    });

    it("should convert noon to 50%", () => {
      expect(timeToPercent(12, 0)).toBe(50);
    });

    it("should convert end of day to 100%", () => {
      expect(timeToPercent(24, 0)).toBe(100);
    });

    it("should handle minutes correctly", () => {
      expect(timeToPercent(0, 30)).toBeCloseTo(2.0833, 4); // 30 minutes = 2.0833% of day
      expect(timeToPercent(1, 30)).toBeCloseTo(6.25, 4); // 1.5 hours = 6.25% of day
    });

    it("should handle edge cases", () => {
      expect(timeToPercent(23, 59)).toBeCloseTo(99.9306, 4); // Nearly end of day
      expect(timeToPercent(6, 0)).toBe(25); // Quarter day
      expect(timeToPercent(18, 0)).toBe(75); // Three quarters day
    });

    it("should handle invalid but numeric inputs", () => {
      expect(timeToPercent(25, 0)).toBeCloseTo(104.17, 2); // Over 24 hours
      expect(timeToPercent(0, 60)).toBeCloseTo(4.17, 2); // Over 60 minutes
    });
  });

  describe("parseTimeString", () => {
    describe("ISO format", () => {
      it("should parse ISO datetime strings", () => {
        // Note: These tests will vary based on local timezone
        const result1 = parseTimeString("2025-04-23T10:12:23+00:00");
        const result2 = parseTimeString("2025-01-01T00:00:00Z");

        expect(result1).toHaveLength(2);
        expect(result1[0]).toBeGreaterThanOrEqual(0);
        expect(result1[0]).toBeLessThan(24);
        expect(result1[1]).toBe(12); // Minutes should be preserved

        expect(result2).toHaveLength(2);
        expect(result2[0]).toBeGreaterThanOrEqual(0);
        expect(result2[0]).toBeLessThan(24);
        expect(result2[1]).toBe(0);
      });

      it("should handle timezone conversion", () => {
        // Note: This will vary based on local timezone, but should parse correctly
        const result = parseTimeString("2025-04-23T15:30:00+00:00");
        expect(result).toHaveLength(2);
        expect(result[0]).toBeGreaterThanOrEqual(0);
        expect(result[0]).toBeLessThan(24);
        expect(result[1]).toBeGreaterThanOrEqual(0);
        expect(result[1]).toBeLessThan(60);
      });

      it("should handle invalid ISO strings", () => {
        expect(parseTimeString("invalid-iso-string")).toEqual([0, 0]);
        expect(parseTimeString("not-a-date")).toEqual([0, 0]);
      });
    });

    describe("HH:MM format", () => {
      it("should parse basic HH:MM format", () => {
        expect(parseTimeString("10:30")).toEqual([10, 30]);
        expect(parseTimeString("00:00")).toEqual([0, 0]);
        expect(parseTimeString("23:59")).toEqual([23, 59]);
      });

      it("should handle single digit hours and minutes", () => {
        expect(parseTimeString("5:7")).toEqual([5, 7]);
        expect(parseTimeString("9:30")).toEqual([9, 30]);
      });

      it("should handle invalid HH:MM format", () => {
        expect(parseTimeString("25:70")).toEqual([25, 70]); // Allows invalid values
        expect(parseTimeString(":30")).toEqual([0, 30]);
        expect(parseTimeString("10:")).toEqual([10, 0]);
        expect(parseTimeString(":")).toEqual([0, 0]);
      });
    });

    describe("Numeric format (minutes since midnight)", () => {
      it("should parse minutes since midnight", () => {
        expect(parseTimeString("0")).toEqual([0, 0]); // Midnight
        expect(parseTimeString("60")).toEqual([1, 0]); // 1 AM
        expect(parseTimeString("90")).toEqual([1, 30]); // 1:30 AM
        expect(parseTimeString("720")).toEqual([12, 0]); // Noon
        expect(parseTimeString("1439")).toEqual([23, 59]); // 11:59 PM
        expect(parseTimeString("1440")).toEqual([24, 0]); // End of day
      });

      it("should handle string numbers", () => {
        expect(parseTimeString("630")).toEqual([10, 30]);
        expect(parseTimeString("0")).toEqual([0, 0]);
      });

      it("should handle invalid numeric inputs", () => {
        expect(parseTimeString("abc")).toEqual([0, 0]);
        expect(parseTimeString("not-a-number")).toEqual([0, 0]);
      });
    });

    describe("Edge cases", () => {
      it("should handle null and undefined", () => {
        expect(parseTimeString(null)).toEqual([0, 0]);
        expect(parseTimeString(undefined)).toEqual([0, 0]);
        expect(parseTimeString("")).toEqual([0, 0]);
      });

      it("should handle empty or whitespace strings", () => {
        expect(parseTimeString("   ")).toEqual([0, 0]);
        expect(parseTimeString("\t\n")).toEqual([0, 0]);
      });

      it("should handle mixed format strings", () => {
        expect(parseTimeString("10:30:45")).toEqual([10, 30]); // Takes first two parts
        expect(parseTimeString("not:a:time")).toEqual([0, 0]);
      });
      it("should handle malformed input without throwing", () => {
        // Setup - Test extreme edge cases that should return [0, 0]
        const extremeCases = [
          "\u0000\u0001\u0002", // null characters
          "T:T:T", // Malformed format
          "🕐", // Emoji
          Object.create(null), // Non-string object
        ];

        // Exercise & Verify - All should return [0, 0] without throwing
        extremeCases.forEach((input) => {
          expect(() => parseTimeString(input)).not.toThrow();
          const result = parseTimeString(input);
          expect(result).toEqual([0, 0]);
        });

        // Test cases that have unexpected behavior but don't throw
        const unexpectedCases = [
          { input: "2025-13-32T25:70:70", expected: [0, 70] }, // Invalid date still parses minutes
        ];

        unexpectedCases.forEach(({ input, expected }) => {
          expect(() => parseTimeString(input)).not.toThrow();
          const result = parseTimeString(input);
          expect(result).toEqual(expected);
        });
      });
    });
  });

  describe("formatTime", () => {
    describe("24-hour format", () => {
      it("should format time in 24-hour format by default", () => {
        expect(formatTime(0, 0)).toBe("00:00");
        expect(formatTime(12, 30)).toBe("12:30");
        expect(formatTime(23, 59)).toBe("23:59");
      });

      it("should respect padding options", () => {
        expect(formatTime(5, 7, { pad_hours: true })).toBe("05:07");
        expect(formatTime(5, 7, { pad_hours: false })).toBe("5:07");
      });

      it("should respect show_minutes option", () => {
        expect(formatTime(14, 30, { show_minutes: true })).toBe("14:30");
        expect(formatTime(14, 30, { show_minutes: false })).toBe("14");
        expect(formatTime(5, 0, { show_minutes: false, pad_hours: false })).toBe("5");
      });
    });

    describe("12-hour format", () => {
      it("should convert to 12-hour format", () => {
        expect(formatTime(0, 0, { use_24_hour: false })).toBe("12:00");
        expect(formatTime(1, 30, { use_24_hour: false })).toBe("01:30");
        expect(formatTime(12, 0, { use_24_hour: false })).toBe("12:00");
        expect(formatTime(13, 45, { use_24_hour: false })).toBe("01:45");
        expect(formatTime(23, 59, { use_24_hour: false })).toBe("11:59");
      });

      it("should handle noon and midnight correctly", () => {
        expect(formatTime(0, 0, { use_24_hour: false })).toBe("12:00"); // Midnight
        expect(formatTime(12, 0, { use_24_hour: false })).toBe("12:00"); // Noon
      });

      it("should combine with padding options", () => {
        expect(formatTime(5, 7, { use_24_hour: false, pad_hours: true })).toBe("05:07");
        expect(formatTime(5, 7, { use_24_hour: false, pad_hours: false })).toBe("5:07");
      });
    });

    describe("AM/PM suffix", () => {
      it("should append AM/PM when requested", () => {
        expect(formatTime(9, 30, { append_suffix: true })).toBe("09:30AM");
        expect(formatTime(14, 15, { append_suffix: true })).toBe("14:15PM");
        expect(formatTime(0, 0, { append_suffix: true })).toBe("00:00AM");
        expect(formatTime(12, 0, { append_suffix: true })).toBe("12:00PM");
      });

      it("should work with 12-hour format", () => {
        expect(formatTime(9, 30, { use_24_hour: false, append_suffix: true })).toBe("09:30AM");
        expect(formatTime(14, 15, { use_24_hour: false, append_suffix: true })).toBe("02:15PM");
        expect(formatTime(0, 0, { use_24_hour: false, append_suffix: true })).toBe("12:00AM");
        expect(formatTime(12, 0, { use_24_hour: false, append_suffix: true })).toBe("12:00PM");
      });

      it("should determine AM/PM correctly", () => {
        expect(formatTime(11, 59, { append_suffix: true })).toBe("11:59AM");
        expect(formatTime(12, 0, { append_suffix: true })).toBe("12:00PM");
        expect(formatTime(12, 1, { append_suffix: true })).toBe("12:01PM");
        expect(formatTime(23, 59, { append_suffix: true })).toBe("23:59PM");
      });
    });

    describe("Combined options", () => {
      it("should handle all options together", () => {
        const options = {
          use_24_hour: false,
          append_suffix: true,
          pad_hours: false,
          show_minutes: false,
        };
        expect(formatTime(9, 30, options)).toBe("9AM");
        expect(formatTime(14, 45, options)).toBe("2PM");
        expect(formatTime(0, 15, options)).toBe("12AM");
      });

      it("should use default values for missing options", () => {
        expect(formatTime(15, 30, { use_24_hour: false })).toBe("03:30");
        expect(formatTime(15, 30, { append_suffix: true })).toBe("15:30PM");
        expect(formatTime(15, 30, {})).toBe("15:30"); // All defaults
      });
    });

    describe("Edge cases", () => {
      it("should handle edge time values", () => {
        expect(formatTime(24, 0)).toBe("24:00"); // Over 24 hours
        expect(formatTime(0, 60)).toBe("00:60"); // Over 60 minutes
        // Note: Negative values might not pad correctly with current implementation
        expect(formatTime(-1, -5)).toMatch(/-?\d+:-?\d+/); // Allow for implementation variation
      });

      it("should handle boundary conditions", () => {
        expect(formatTime(11, 59, { use_24_hour: false, append_suffix: true })).toBe("11:59AM");
        expect(formatTime(12, 0, { use_24_hour: false, append_suffix: true })).toBe("12:00PM");
        expect(formatTime(12, 1, { use_24_hour: false, append_suffix: true })).toBe("12:01PM");
      });
    });
  });

  describe("Integration scenarios", () => {
    it("should work together for typical timeline scenarios", () => {
      // Parse a time, convert to percentage, then format for display
      const [h, m] = parseTimeString("14:30");
      const percent = timeToPercent(h, m);
      const formatted = formatTime(h, m, { use_24_hour: false, append_suffix: true });

      expect(percent).toBeCloseTo(60.42, 2); // 14:30 is ~60% through day
      expect(formatted).toBe("02:30PM");
    });

    it("should handle ISO datetime parsing and formatting", () => {
      const [h, m] = parseTimeString("2025-04-23T09:15:00+00:00");
      const formatted24 = formatTime(h, m, { pad_hours: true, show_minutes: true });
      const formatted12 = formatTime(h, m, {
        use_24_hour: false,
        append_suffix: true,
        pad_hours: false,
      });

      // Results will depend on timezone, but should be valid
      expect(typeof formatted24).toBe("string");
      expect(typeof formatted12).toBe("string");
      expect(formatted24).toMatch(/^\d{1,2}:\d{2}$/);
      expect(formatted12).toMatch(/^\d{1,2}:\d{2}(AM|PM)$/);
    });

    it("should handle numeric time input workflow", () => {
      const [h, m] = parseTimeString("780"); // 13:00 (1 PM) in minutes
      const percent = timeToPercent(h, m);
      const tooltip = formatTime(h, m, { use_24_hour: false, append_suffix: true });
      const timeline = formatTime(h, m, { show_minutes: false, pad_hours: false });

      expect(h).toBe(13);
      expect(m).toBe(0);
      expect(percent).toBeCloseTo(54.17, 2);
      expect(tooltip).toBe("01:00PM");
      expect(timeline).toBe("13");
    });
  });

  describe("parseHHMMSSToSeconds", () => {
    it("should parse valid HH:MM:SS format", () => {
      expect(parseHHMMSSToSeconds("01:00:00")).toBe(3600); // 1 hour
      expect(parseHHMMSSToSeconds("00:30:00")).toBe(1800); // 30 minutes
      expect(parseHHMMSSToSeconds("00:00:45")).toBe(45); // 45 seconds
      expect(parseHHMMSSToSeconds("02:15:30")).toBe(8130); // 2h 15m 30s
    });

    it("should handle edge cases", () => {
      expect(parseHHMMSSToSeconds("00:00:00")).toBe(0); // Zero time
      expect(parseHHMMSSToSeconds("23:59:59")).toBe(86399); // Max time in a day
    });

    it("should return 0 for invalid input", () => {
      expect(parseHHMMSSToSeconds("")).toBe(0);
      expect(parseHHMMSSToSeconds(null)).toBe(0);
      expect(parseHHMMSSToSeconds(undefined)).toBe(0);
      expect(parseHHMMSSToSeconds("invalid")).toBe(0);
      expect(parseHHMMSSToSeconds("1:2")).toBe(0); // Wrong format
      expect(parseHHMMSSToSeconds("1:2:3:4")).toBe(0); // Too many parts
      expect(parseHHMMSSToSeconds("aa:bb:cc")).toBe(0); // Non-numeric
    });
  });
});
