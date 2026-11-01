import { jest } from "@jest/globals";
import { hasInputsChanged, writeIfChanged } from "../gate.js";
import { createCardHarness } from "../../../../testing/cardHarness.js";

const legacyCtx = (host = {}, module = "my_module") => ({ host, module, hasChanged: undefined });

describe("hasInputsChanged", () => {
  describe("on Bubble Card 3.3+", () => {
    it("asks Bubble Card's hasChanged with the label and values, and returns its answer", () => {
      const hasChanged = jest.fn().mockReturnValueOnce(true).mockReturnValueOnce(false);
      const ctx = { host: {}, module: "my_module", hasChanged };

      expect(hasInputsChanged(ctx, "main", ["75", ["a", "b"]])).toBe(true);
      expect(hasInputsChanged(ctx, "main", ["75", ["a", "b"]])).toBe(false);
      expect(hasChanged).toHaveBeenCalledWith("main", "75", ["a", "b"]);
      expect(ctx.host).toEqual({});
    });

    it("answers true if hasChanged throws", () => {
      const ctx = {
        host: {},
        module: "my_module",
        hasChanged: () => {
          throw new Error("boom");
        },
      };
      expect(hasInputsChanged(ctx, "main", [1])).toBe(true);
    });
  });

  describe("on older versions (fallback)", () => {
    it("answers true the first time, false while values hold, and true when one moves", () => {
      const ctx = legacyCtx();
      expect(hasInputsChanged(ctx, "main", ["75", true])).toBe(true);
      expect(hasInputsChanged(ctx, "main", ["75", true])).toBe(false);
      expect(hasInputsChanged(ctx, "main", ["76", true])).toBe(true);
      expect(hasInputsChanged(ctx, "main", ["76", true])).toBe(false);
    });

    it("compares arrays by value", () => {
      const ctx = legacyCtx();
      hasInputsChanged(ctx, "tint", [[255, 0, 0]]);
      expect(hasInputsChanged(ctx, "tint", [[255, 0, 0]])).toBe(false);
      expect(hasInputsChanged(ctx, "tint", [[255, 0, 1]])).toBe(true);
    });

    it("keeps one memory per label, per module, per card", () => {
      const card = {};
      hasInputsChanged(legacyCtx(card), "main", [1]);

      expect(hasInputsChanged(legacyCtx(card), "sub-button-1", [1])).toBe(true);
      expect(hasInputsChanged(legacyCtx(card, "other_module"), "main", [1])).toBe(true);
      expect(hasInputsChanged(legacyCtx({}), "main", [1])).toBe(true);
      expect(hasInputsChanged(legacyCtx(card), "main", [1])).toBe(false);
    });

    it.each([
      ["a value moving between positions", ["a", ""], ["", "a"]],
      ["a value added", ["a"], ["a", "b"]],
      ["a number becoming a string of different digits", [1], ["1.0"]],
    ])("tells apart %s", (_, before, after) => {
      const ctx = legacyCtx();
      hasInputsChanged(ctx, "main", before);
      expect(hasInputsChanged(ctx, "main", after)).toBe(true);
    });

    it("answers true rather than throwing on a value it cannot read", () => {
      const unreadable = {
        toString() {
          throw new Error("boom");
        },
      };
      expect(hasInputsChanged(legacyCtx(), "main", [unreadable])).toBe(true);
      expect(hasInputsChanged(legacyCtx(), "main", [unreadable])).toBe(true);
    });

    it("gives the same answers as Bubble Card's hasChanged", () => {
      const harness = createCardHarness({ mode: "3.3+" });
      try {
        const upstream = { host: {}, module: "my_module", hasChanged: global.hasChanged };
        const fallback = legacyCtx();
        const sequence = [
          ["main", ["75", null]],
          ["main", ["75", undefined]],
          ["main", ["75", ""]],
          ["main", [75, ""]],
          ["main", [["a", "b"], 1]],
          ["main", ["a,b", 1]],
          ["main", [true]],
          ["main", ["true"]],
          ["other", ["true"]],
          ["main", [false]],
        ];
        for (const [label, values] of sequence) {
          expect(hasInputsChanged(fallback, label, values)).toBe(hasInputsChanged(upstream, label, values));
        }
      } finally {
        harness.cleanup();
      }
    });
  });
});

describe("writeIfChanged", () => {
  let element, ctx, write;
  beforeEach(() => {
    element = document.createElement("div");
    ctx = legacyCtx();
    write = jest.fn(() => element.style.setProperty("--x", "1"));
  });
  const owned = () => [element.style.getPropertyValue("--x")];

  it("writes the first time, then only when an input changes", () => {
    expect(writeIfChanged(ctx, "line", ["a"], owned, write)).toBe(true);
    expect(writeIfChanged(ctx, "line", ["a"], owned, write)).toBe(false);
    expect(writeIfChanged(ctx, "line", ["b"], owned, write)).toBe(true);
    expect(write).toHaveBeenCalledTimes(2);
  });

  it("writes again when something else changed the DOM it owns", () => {
    writeIfChanged(ctx, "line", ["a"], owned, write);
    element.style.removeProperty("--x");

    expect(writeIfChanged(ctx, "line", ["a"], owned, write)).toBe(true);
    expect(element.style.getPropertyValue("--x")).toBe("1");
  });

  it("works the same through Bubble Card's hasChanged", () => {
    const harness = createCardHarness({ mode: "3.3+" });
    try {
      ctx = { host: {}, module: "my_module", hasChanged: global.hasChanged };
      writeIfChanged(ctx, "line", ["a"], owned, write);
      expect(writeIfChanged(ctx, "line", ["a"], owned, write)).toBe(false);

      element.style.removeProperty("--x");
      expect(writeIfChanged(ctx, "line", ["a"], owned, write)).toBe(true);
      expect(write).toHaveBeenCalledTimes(2);
    } finally {
      harness.cleanup();
    }
  });
});
