import { toArray } from "../arrays.js";

describe("toArray", () => {
  test("returns array as-is when input is already an array", () => {
    const input = [1, 2, 3];
    expect(toArray(input)).toBe(input); // same reference
  });

  test("converts object values to array", () => {
    const input = { a: 1, b: 2, c: 3 };
    expect(toArray(input)).toEqual([1, 2, 3]);
  });

  test("returns empty array for empty object", () => {
    expect(toArray({})).toEqual([]);
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
});
