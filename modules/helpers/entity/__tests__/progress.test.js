import { jest } from "@jest/globals";
import { showProgress, stopProgress } from "../progress.js";
import { createCardHarness } from "../../../../testing/cardHarness.js";

// Clock pinned to 2025-07-01T12:00:00Z. Timers last 100s, so seconds elapsed = percent.
let h, host, element, render;
const ctx = () => ({ host, onTeardown: global.onTeardown });
const timer = (state, attributes = {}) => ({ state, attributes: { duration: "0:01:40", ...attributes } });
const finishingIn = (seconds) => new Date(Date.UTC(2025, 6, 1, 12, 0, seconds)).toISOString();
const show = (options) => showProgress(ctx(), element, options, render);
const shown = () => render.mock.calls.at(-1)[0];
const tickers = () => jest.getTimerCount();

beforeEach(() => {
  h = createCardHarness({
    states: {
      "sensor.value": "75",
      "sensor.min": "20",
      "sensor.max": "60",
      "sensor.attrs": { state: "on", attributes: { level: 40 } },
      "timer.active": timer("active", { finishes_at: finishingIn(50) }),
      "timer.paused": timer("paused", { remaining: "0:00:25" }),
    },
  });
  host = h.host;
  element = h.$(".bubble-icon-container");
  render = jest.fn();
});
afterEach(() => h.cleanup());

describe("showProgress", () => {
  describe("percent", () => {
    it.each([
      ["an entity on the default 0–100 range", { source: "sensor.value" }, 75],
      ["an attribute source", { source: "sensor.attrs[level]" }, 40],
      ["a raw value", { source: 42 }, 42],
      ["a custom range", { source: 150, start: 0, end: 200 }, 75],
      ["a float range", { source: 2.5, start: 0, end: 5 }, 50],
      ["an offset range", { source: 15, start: 10, end: 30 }, 25],
      ["entity start and end", { source: 30, start: "sensor.min", end: "sensor.max" }, 25],
      ["values above end, clamped", { source: 250, start: 0, end: 200 }, 100],
      ["values below start, clamped", { source: 5, start: 10, end: 30 }, 0],
      ["a value above 100, clamped", { source: 150 }, 100],
      ["a negative value, clamped", { source: -10 }, 0],
      ["a non-numeric source, as start", { source: "unavailable" }, 0],
      ["a missing entity, as 0", { source: "sensor.missing" }, 0],
      ["a missing timer, as 0", { source: "timer.missing" }, 0],
      ["non-numeric start/end, as defaults", { source: 40, start: "x", end: "y" }, 40],
      ["start equal to end, as 0", { source: 5, start: 5, end: 5 }, 0],
      ["inverted", { source: "sensor.value", invert: true }, 25],
      ["an override over the source", { source: "sensor.value", override: 30 }, 30],
      ["an override of 0", { source: "sensor.value", override: 0 }, 0],
      ["an entity override", { source: 10, override: "sensor.value" }, 75],
      ["an override above 100, clamped", { override: 120 }, 100],
      ["a non-numeric override, as 0", { source: "sensor.value", override: "abc" }, 0],
      ["an inverted override", { override: 30, invert: true }, 70],
    ])("reads %s", (_, options, expected) => {
      show(options);
      expect(render).toHaveBeenCalledTimes(1);
      expect(shown()).toBeCloseTo(expected);
    });

    it.each([
      ["active, from finishes_at", timer("active", { finishes_at: finishingIn(50) }), 50],
      ["active and overdue, clamped", timer("active", { finishes_at: finishingIn(-10) }), 100],
      ["active and just started", timer("active", { finishes_at: finishingIn(100) }), 0],
      ["paused, from remaining", timer("paused", { remaining: "0:00:25" }), 75],
      ["idle", timer("idle"), 0],
      ["active without finishes_at", timer("active"), 0],
      ["paused without remaining", timer("paused"), 0],
      ["without a duration", { state: "active", attributes: { finishes_at: finishingIn(50) } }, 0],
      ["with a zero duration", timer("active", { duration: "0:00:00", finishes_at: finishingIn(50) }), 0],
      ["without attributes", { state: "active", attributes: null }, 0],
    ])("reads a timer that is %s", (_, stateObj, expected) => {
      h.setState("timer.t", stateObj);
      show({ source: "timer.t", start: 50, end: 60 });
      expect(shown()).toBeCloseTo(expected);
    });
  });

  describe("ticker", () => {
    it("re-renders an active timer every second", () => {
      show({ source: "timer.active" });
      h.tick(10_000);
      expect(render.mock.calls.map(([p]) => Math.round(p))).toEqual([50, 51, 52, 53, 54, 55, 56, 57, 58, 59, 60]);
    });

    it.each([
      ["a non-timer source", { source: "sensor.value" }],
      ["a paused timer", { source: "timer.paused" }],
      ["an override", { source: "timer.active", override: 10 }],
    ])("does not tick for %s", (_, options) => {
      show(options);
      expect(tickers()).toBe(0);
    });

    it("keeps one ticker per element across passes", () => {
      show({ source: "timer.active" });
      show({ source: "timer.active" });
      showProgress(ctx(), h.$(".bubble-sub-button-1"), { source: "timer.active" }, jest.fn());
      expect(tickers()).toBe(2);
    });

    it("ticks with the latest options and render from the most recent pass", () => {
      const first = jest.fn();
      showProgress(ctx(), element, { source: "timer.active" }, first);
      show({ source: "timer.active", invert: true });

      h.tick(1_000);
      expect(first).toHaveBeenCalledTimes(1);
      expect(shown()).toBeCloseTo(49);
    });

    it("stops when the source is no longer an active timer", () => {
      show({ source: "timer.active" });
      show({ source: "sensor.value" });
      expect(tickers()).toBe(0);
    });

    it("stops on stopProgress, which is safe without a ticker", () => {
      show({ source: "timer.active" });
      stopProgress(ctx(), element);
      expect(tickers()).toBe(0);
      expect(() => stopProgress(ctx(), element)).not.toThrow();
    });

    it("stops every ticker on the card when Bubble Card tears it down", () => {
      show({ source: "timer.active" });
      showProgress(ctx(), h.$(".bubble-sub-button-1"), { source: "timer.active" }, jest.fn());
      expect(h.teardownCount()).toBe(1);

      h.teardown();
      expect(tickers()).toBe(0);
    });

    it("stops once the element leaves the page, without onTeardown", () => {
      showProgress({ host }, element, { source: "timer.active" }, render);
      element.remove();
      h.tick(1_000);
      expect(tickers()).toBe(0);
      expect(render).toHaveBeenCalledTimes(1);
    });
  });
});
