import { jest } from "@jest/globals";
import { detectShapeFromBorderRadius, getBorderRadiusStyle, detectElementShape } from "../borderRadiusDetection.js";

const size = (width, height = width) => ({ width, height });
const shape = (isCircular, borderRadius) => ({ isCircular, borderRadius });

describe("detectShapeFromBorderRadius", () => {
  it.each([
    // [border-radius, dimensions, expected]
    ["50%", size(40), shape(true, 20)],
    ["60%", size(40), shape(true, 24)],
    ["100%", size(40), shape(true, 40)],
    ["25%", size(40), shape(false, 10)],
    ["0%", size(40), shape(false, 0)],
    ["50%", size(80, 40), shape(false, 20)],
    ["50%", size(40, 80), shape(false, 20)],
    ["50%", size(100), shape(true, 50)],
    ["20px", size(40), shape(true, 20)],
    ["25px", size(40), shape(true, 25)],
    ["19px", size(40), shape(false, 19)],
    ["8px", size(40), shape(false, 8)],
    ["40px", size(80, 40), shape(false, 40)],
    ["100px", size(50, 100), shape(false, 100)],
    ["50", size(40), shape(true, 50)],
    ["invalid%", size(40), shape(false, 0)],
    ["abcpx", size(40), shape(false, 0)],
    ["", size(40), shape(false, 0)],
    [null, size(40), shape(false, 0)],
    [undefined, size(40), shape(false, 0)],
  ])("%p on %o → %o", (radius, dimensions, expected) => {
    expect(detectShapeFromBorderRadius(radius, dimensions)).toEqual(expected);
  });
});

describe("getBorderRadiusStyle", () => {
  afterEach(() => delete global.getComputedStyle);

  it.each([
    ["the computed border-radius", { borderRadius: "12px" }, "12px"],
    ["empty when unset", { borderRadius: "" }, ""],
    ["empty when missing", {}, ""],
  ])("returns %s", (_, computed, expected) => {
    global.getComputedStyle = jest.fn(() => computed);
    expect(getBorderRadiusStyle(document.createElement("div"))).toBe(expected);
  });

  it("returns empty without getComputedStyle", () => {
    expect(getBorderRadiusStyle(document.createElement("div"))).toBe("");
  });
});

describe("detectElementShape", () => {
  const element = document.createElement("div");
  beforeEach(() => {
    global.getComputedStyle = jest.fn(() => ({ borderRadius: "8px" }));
  });
  afterEach(() => delete global.getComputedStyle);

  it.each([
    ["CSS when no override", undefined, size(40), shape(false, 8)],
    ["CSS when override is null", null, size(40), shape(false, 8)],
    ["a numeric override as px", 20, size(40), shape(true, 20)],
    ["a zero override (square)", 0, size(40), shape(false, 0)],
    ["a percentage override", "50%", size(40), shape(true, 20)],
    ["a pixel string override", "12px", size(40), shape(false, 12)],
    ["an override with other units", "1em", size(40), shape(false, 1)],
    ["a non-string override, stringified", true, size(40), shape(false, 0)],
    ["a percentage override on a pill", "50%", size(80, 40), shape(false, 20)],
  ])("uses %s", (_, override, dimensions, expected) => {
    expect(detectElementShape(element, dimensions, override)).toEqual(expected);
  });

  it("treats missing CSS border-radius as square", () => {
    global.getComputedStyle = jest.fn(() => ({}));
    expect(detectElementShape(element, size(40))).toEqual(shape(false, 0));
  });
});
