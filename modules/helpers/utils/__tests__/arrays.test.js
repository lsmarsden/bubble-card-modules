import { toArray } from "../arrays.js";

describe("toArray", () => {
  describe("Standard JavaScript arrays", () => {
    test("returns array as-is when input is already an array", () => {
      const input = [1, 2, 3];
      expect(toArray(input)).toBe(input); // same reference
    });

    test("returns empty array for empty array", () => {
      const input = [];
      expect(toArray(input)).toBe(input);
    });
  });

  describe("Standard YAML array format (from YAML editor)", () => {
    test("converts single configuration object to array", () => {
      const input = {
        sub_button: 2,
        close_on_click: true,
      };
      expect(toArray(input)).toEqual([{ sub_button: 2, close_on_click: true }]);
    });

    test("wraps nested configuration object in array", () => {
      const input = {
        wheel_opener: "main",
        wheel_buttons: [
          { sub_button: 2, close_on_click: true },
          { sub_button: 3, close_on_click: true },
        ],
      };
      expect(toArray(input)).toEqual([
        {
          wheel_opener: "main",
          wheel_buttons: [
            { sub_button: 2, close_on_click: true },
            { sub_button: 3, close_on_click: true },
          ],
        },
      ]);
    });
  });

  describe("Bubble Card UI editor format (numbered object keys)", () => {
    test("converts numbered object keys to array", () => {
      const input = {
        0: { sub_button: 2, close_on_click: true },
        1: { sub_button: 3, close_on_click: true },
      };
      expect(toArray(input)).toEqual([
        { sub_button: 2, close_on_click: true },
        { sub_button: 3, close_on_click: true },
      ]);
    });

    test("converts numbered object keys with gaps to array", () => {
      const input = {
        0: { sub_button: 1, close_on_click: true },
        2: { sub_button: 3, close_on_click: false },
        4: { sub_button: 5, close_on_click: true },
      };
      expect(toArray(input)).toEqual([
        { sub_button: 1, close_on_click: true },
        { sub_button: 3, close_on_click: false },
        { sub_button: 5, close_on_click: true },
      ]);
    });

    test("handles single numbered key as array", () => {
      const input = {
        0: { sub_button: 1, close_on_click: true },
      };
      expect(toArray(input)).toEqual([{ sub_button: 1, close_on_click: true }]);
    });

    test("handles non-sequential numbered keys", () => {
      const input = {
        5: { sub_button: 6 },
        1: { sub_button: 2 },
        3: { sub_button: 4 },
      };
      // Should preserve order by key value when converting
      expect(toArray(input)).toEqual([{ sub_button: 2 }, { sub_button: 4 }, { sub_button: 6 }]);
    });
  });

  describe("Mixed and edge cases", () => {
    test("handles object with mixed key types - treats as single object", () => {
      const input = {
        0: { sub_button: 1 },
        name: "test",
        wheel_opener: "main",
      };
      // Mixed keys should be treated as single object, not numbered array
      expect(toArray(input)).toEqual([
        {
          0: { sub_button: 1 },
          name: "test",
          wheel_opener: "main",
        },
      ]);
    });

    test("returns empty array for null input", () => {
      expect(toArray(null)).toEqual([]);
    });

    test("returns empty array for undefined input", () => {
      expect(toArray(undefined)).toEqual([]);
    });

    test("returns empty array for non-object, non-array values", () => {
      expect(toArray(42)).toEqual([]);
      expect(toArray("hello")).toEqual([]);
      expect(toArray(true)).toEqual([]);
    });

    test("returns single array for empty object", () => {
      expect(toArray({})).toEqual([{}]);
    });
  });

  describe("Real-world bubble card configurations", () => {
    test("handles wheel_buttons from YAML editor", () => {
      const input = [
        { sub_button: 2, close_on_click: true },
        { sub_button: 3, close_on_click: true },
      ];
      expect(toArray(input)).toBe(input);
    });

    test("handles wheel_buttons from UI editor", () => {
      const input = {
        0: { sub_button: 2, close_on_click: true },
        1: { sub_button: 3, close_on_click: true },
      };
      expect(toArray(input)).toEqual([
        { sub_button: 2, close_on_click: true },
        { sub_button: 3, close_on_click: true },
      ]);
    });

    test("handles single wheel configuration from YAML editor", () => {
      const input = {
        wheel_opener: "main",
        wheel_buttons: [{ sub_button: 1 }, { sub_button: 2 }],
      };
      expect(toArray(input)).toEqual([input]);
    });

    test("handles multiple wheel configurations from UI editor", () => {
      const input = {
        0: {
          wheel_opener: "main",
          wheel_buttons: [{ sub_button: 1 }, { sub_button: 2 }],
        },
        1: {
          wheel_opener: "3",
          wheel_buttons: [{ sub_button: 4 }, { sub_button: 5 }],
        },
      };
      expect(toArray(input)).toEqual([
        {
          wheel_opener: "main",
          wheel_buttons: [{ sub_button: 1 }, { sub_button: 2 }],
        },
        {
          wheel_opener: "3",
          wheel_buttons: [{ sub_button: 4 }, { sub_button: 5 }],
        },
      ]);
    });
  });
});
