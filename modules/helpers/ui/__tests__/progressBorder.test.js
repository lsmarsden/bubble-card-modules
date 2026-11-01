import { jest } from "@jest/globals";
import { createProgressBorder, removeProgressBorder, getEffectiveDimensions } from "../progressBorder.js";
import { createCardHarness } from "../../../../testing/cardHarness.js";

// jsdom has no SVG geometry, so path length falls back to 300 unless a test stubs getTotalLength.
let h;
const setup = (options = {}) => {
  h = createCardHarness({ rect: { width: 40, height: 40 }, computedStyle: { borderRadius: "50%" }, ...options });
  return h.$(".bubble-icon-container");
};
afterEach(() => h?.cleanup());

const draw = (element, progress, options = {}) =>
  createProgressBorder(element, progress, "red", "grey", { strokeWidth: 3, animationDuration: 800, ...options });
const svgOf = (element) => element.querySelector(".stroke-dash-aligned-svg");
const progressPath = (element) => element.querySelector(".progress-path");
const bgPath = (element) => element.querySelector(".bg-path");
const dash = (element) => progressPath(element).getAttribute("stroke-dasharray");

describe("createProgressBorder", () => {
  it("adds one absolutely positioned svg sized to the element, reused across calls", () => {
    const el = setup({ rect: { width: 80, height: 40 } });
    draw(el, 50);
    draw(el, 60);

    const svgs = el.querySelectorAll(".stroke-dash-aligned-svg");
    expect(svgs).toHaveLength(1);
    expect(svgs[0].getAttribute("viewBox")).toBe("0 0 80 40");
    expect(svgs[0].style.width).toBe("80px");
    expect(svgs[0].style.height).toBe("40px");
    expect(svgs[0].style.position).toBe("absolute");
    expect(svgs[0].style.pointerEvents).toBe("none");
  });

  it("makes a statically positioned element relative", () => {
    const el = setup({ computedStyle: { position: "static" } });
    draw(el, 50);
    expect(el.style.position).toBe("relative");
  });

  it("draws a background path in the remaining colour and a rounded, animated progress path", () => {
    const el = setup();
    draw(el, 50);

    expect(bgPath(el).getAttribute("stroke")).toBe("grey");
    expect(bgPath(el).getAttribute("stroke-width")).toBe("3");
    expect(bgPath(el).getAttribute("fill")).toBe("none");
    expect(progressPath(el).getAttribute("stroke")).toBe("red");
    expect(progressPath(el).getAttribute("stroke-linecap")).toBe("round");
    expect(progressPath(el).style.transition).toBe("all 800ms ease-out");
    expect(progressPath(el).getAttribute("stroke-dashoffset")).toBe("0");
  });

  it.each([
    [50, "0 0 150 150"],
    [75, "0 0 225 75"],
    [100, "300 0"],
    [150, "300 0"],
  ])("draws %s%% as dasharray %s", (progress, expected) => {
    const el = setup();
    draw(el, progress);
    expect(dash(el)).toBe(expected);
  });

  it.each([[0], [-10], [null], [undefined]])("hides the progress path for %s", (progress) => {
    const el = setup();
    draw(el, progress);
    expect(progressPath(el).getAttribute("stroke")).toBe("transparent");
    expect(dash(el)).toBe("0 300");
  });

  it.each([
    ["no wrap", 25, 50, "0 75 150 75"],
    ["wrapping past the start", 75, 50, "75 150 75 0"],
    ["clamped above 100", 150, 50, "150 150 0 0"],
    ["clamped below 0", -20, 50, "0 0 150 150"],
  ])("offsets the start point (%s)", (_, offsetPercent, progress, expected) => {
    const el = setup();
    draw(el, progress, { offsetPercent });
    expect(dash(el)).toBe(expected);
  });

  it("grows from zero at the offset on first appearance, then animates to the target", () => {
    const el = setup();
    const frames = [];
    global.requestAnimationFrame = jest.fn((cb) => frames.push(cb));

    draw(el, 50, { offsetPercent: 25 });
    expect(dash(el)).toBe("0 75 0 225");

    frames.forEach((cb) => cb());
    expect(dash(el)).toBe("0 75 150 75");
  });

  it("updates without the grow step once progress is visible", () => {
    const el = setup();
    draw(el, 50);
    global.requestAnimationFrame = jest.fn();

    draw(el, 80);
    expect(dash(el)).toBe("0 0 240 60");
    expect(global.requestAnimationFrame).not.toHaveBeenCalled();
  });

  it("recolours the background path on every call", () => {
    const el = setup();
    draw(el, 50);
    createProgressBorder(el, 50, "red", "blue", {});
    expect(bgPath(el).getAttribute("stroke")).toBe("blue");
  });

  it("uses the path's real length when the browser provides it", () => {
    SVGElement.prototype.getTotalLength = () => 120;
    try {
      const el = setup();
      draw(el, 50);
      expect(dash(el)).toBe("0 0 60 60");
    } finally {
      delete SVGElement.prototype.getTotalLength;
    }
  });

  describe("shape", () => {
    const shape = (el) => svgOf(el).getAttribute("data-config");
    const d = (el) => progressPath(el).getAttribute("d");

    it.each([
      // [w, h, css border-radius, override, expected data-config (circular-radius-w-h)]
      [40, 40, "50%", undefined, "true-20-40-40"],
      [50, 50, "25px", undefined, "true-25-50-50"],
      [60, 60, "29px", undefined, "false-29-60-60"],
      [80, 40, "50%", undefined, "false-20-80-40"],
      [40, 80, "50%", undefined, "false-20-40-80"],
      [80, 50, "15px", undefined, "false-15-80-50"],
      [80, 50, "0px", undefined, "false-0-80-50"],
      [40, 40, "abc%", undefined, "false-0-40-40"],
      [40, 40, "", undefined, "false-0-40-40"],
      [40, 40, "8px", 20, "true-20-40-40"],
      [40, 40, "8px", "50%", "true-20-40-40"],
      [40, 40, "50%", 0, "false-0-40-40"],
      [40, 40, "50%", "10px", "false-10-40-40"],
    ])("%sx%s with border-radius %s (override %s) → %s", (width, height, borderRadius, override, expected) => {
      const el = setup({ rect: { width, height }, computedStyle: { borderRadius } });
      draw(el, 50, { borderRadiusOverride: override });
      expect(shape(el)).toBe(expected);
    });

    it.each([
      ["circle", 40, 40, "50%", /^M 20 1.5 A 18.5 18.5 0 1 1 19.99 1.5$/],
      ["rounded rectangle", 80, 50, "15px", /Q /],
      ["sharp rectangle", 80, 50, "0px", /Z$/],
    ])("draws a %s path starting at top centre", (_, width, height, borderRadius, pattern) => {
      const el = setup({ rect: { width, height }, computedStyle: { borderRadius } });
      draw(el, 50);
      expect(d(el)).toMatch(pattern);
      expect(d(el)).toMatch(new RegExp(`^M ${width / 2} 1.5`));
    });

    it("rebuilds the paths only when shape or size changes", () => {
      const el = setup();
      draw(el, 50);
      const first = progressPath(el);

      draw(el, 60);
      expect(progressPath(el)).toBe(first);

      draw(el, 60, { borderRadiusOverride: 0 });
      expect(progressPath(el)).not.toBe(first);
      expect(el.querySelectorAll(".progress-path")).toHaveLength(1);
    });

    it("treats a missing getComputedStyle as no border radius", () => {
      const el = setup();
      delete global.getComputedStyle;
      draw(el, 50);
      expect(shape(el)).toBe("false-0-40-40");
    });
  });
});

describe("getEffectiveDimensions", () => {
  it.each([
    ["the element's size", { getBoundingClientRect: () => ({ width: 80, height: 40 }) }, { width: 80, height: 40 }],
    ["38px for zero sizes", { getBoundingClientRect: () => ({ width: 0, height: 0 }) }, { width: 38, height: 38 }],
    ["38px without getBoundingClientRect", {}, { width: 38, height: 38 }],
    ["38px without an element", null, { width: 38, height: 38 }],
  ])("returns %s", (_, element, expected) => {
    expect(getEffectiveDimensions(element)).toEqual(expected);
  });
});

describe("removeProgressBorder", () => {
  it("removes the svg, and is safe when there is none", () => {
    const el = setup();
    draw(el, 50);
    removeProgressBorder(el);
    expect(svgOf(el)).toBeNull();
    expect(() => removeProgressBorder(el)).not.toThrow();
  });
});
