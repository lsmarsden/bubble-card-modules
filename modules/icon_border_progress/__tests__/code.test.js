import { jest } from "@jest/globals";
import { icon_border_progress } from "../code.js";
import { createCardHarness, useCardHarness } from "../../../testing/cardHarness.js";

// jsdom has no SVG geometry: path length falls back to 300, so N% progress draws "0 0 3N 300-3N".
// Clock pinned to 2025-07-01T12:00:00Z.
const h = useCardHarness({
  rect: { width: 40, height: 40 },
  computedStyle: { borderRadius: "50%" },
  states: { "sensor.progress": "75", "sensor.enable": "on" },
});

const render = (config) => h().run(icon_border_progress, config);
const rerender = () => h().run(icon_border_progress);
const main = () => h().$(".bubble-icon-container");
const sub = (n) => h().$(`.bubble-sub-button-${n}`);
const svg = (el = main()) => el.querySelector(".stroke-dash-aligned-svg");
const path = (el = main()) => el.querySelector(".progress-path");
const dash = (el = main()) => path(el)?.getAttribute("stroke-dasharray");
const stroke = (el = main()) => path(el)?.getAttribute("stroke");
const remaining = (el = main()) => el.querySelector(".bg-path").getAttribute("stroke");
const enabled = { condition: "state", entity_id: "sensor.enable", state: "on" };

let warn;
beforeEach(() => {
  warn = jest.spyOn(console, "warn").mockImplementation(() => {});
});
afterEach(() => warn.mockRestore());

describe("icon_border_progress", () => {
  describe("targeting", () => {
    it.each([
      ["main", () => main()],
      ["main-button", () => main()],
      ["sub-button-2", () => sub(2)],
    ])("draws on button %s", (button, target) => {
      render([{ button, source: "sensor.progress" }]);
      expect(dash(target())).toBe("0 0 225 75");
      expect(target().style.position).toBe("relative");
    });

    it("draws independently on several buttons", () => {
      h().setStates({ "sensor.a": "20", "sensor.b": "60" });
      render([
        { button: "main", source: "sensor.a" },
        { button: "sub-button-1", source: "sensor.b" },
      ]);
      expect(dash(main())).toBe("0 0 60 240");
      expect(dash(sub(1))).toBe("0 0 180 120");
    });

    it("accepts config in the editor's numbered-object shape", () => {
      render({
        0: { button: "main", source: "sensor.progress" },
        1: { button: "sub-button-1", source: "sensor.progress" },
      });
      expect(svg(main())).not.toBeNull();
      expect(svg(sub(1))).not.toBeNull();
    });

    it.each([
      ["a missing element", [{ button: "sub-button-9", source: "sensor.progress" }]],
      ["a config without button", [{ source: "sensor.progress" }]],
      ["an empty config", []],
      ["no config", undefined],
    ])("ignores %s", (_, config) => {
      expect(() => render(config)).not.toThrow();
      expect(h().$$(".stroke-dash-aligned-svg")).toHaveLength(0);
    });
  });

  describe("progress value", () => {
    it.each([
      ["0–100 by default", "75", {}, "0 0 225 75"],
      ["a custom range", "150", { start: 0, end: 200 }, "0 0 225 75"],
      ["a float range", "2.5", { start: 0, end: 5 }, "0 0 150 150"],
      ["a range offset from zero", "15", { start: 10, end: 30 }, "0 0 75 225"],
      ["values above end, clamped", "250", { start: 0, end: 200 }, "300 0"],
      ["values below start, clamped", "5", { start: 10, end: 30 }, "0 300"],
      ["non-numeric state as start", "unavailable", {}, "0 300"],
      ["non-numeric start/end as defaults", "40", { start: "x", end: "y" }, "0 0 120 180"],
    ])("maps %s", (_, state, range, expected) => {
      h().setState("sensor.value", state);
      render([{ button: "main", source: "sensor.value", ...range }]);
      expect(dash()).toBe(expected);
    });

    it("reads start and end from entities", () => {
      h().setStates({ "sensor.value": "30", "sensor.min": "20", "sensor.max": "60" });
      render([{ button: "main", source: "sensor.value", start: "sensor.min", end: "sensor.max" }]);
      expect(dash()).toBe("0 0 75 225");
    });

    it("hides the border for a missing entity", () => {
      render([{ button: "main", source: "sensor.missing" }]);
      expect(stroke()).toBe("transparent");
    });

    it("inverts the displayed progress", () => {
      render([{ button: "main", source: "sensor.progress", invert: true }]);
      expect(dash()).toBe("0 0 75 225");
    });

    it("still honours the deprecated entity key, with a warning", () => {
      render([{ button: "main", entity: "sensor.progress" }]);
      expect(dash()).toBe("0 0 225 75");
      expect(warn).toHaveBeenCalledWith(expect.stringContaining('Use "source" instead'));
    });

    it("offsets the start point with offset_percent", () => {
      h().setState("sensor.progress", "50");
      render([{ button: "main", source: "sensor.progress", offset_percent: 25 }]);
      expect(dash()).toBe("0 75 150 75");
    });

    it("passes border_radius through to the border shape", () => {
      render([{ button: "main", source: "sensor.progress", border_radius: 0 }]);
      expect(svg().getAttribute("data-config")).toBe("false-0-40-40");
    });
  });

  describe("colours", () => {
    const stops = [
      { percent: 0, color: "#ff0000" },
      { percent: 100, color: "#00ff00" },
    ];

    it("uses the primary colour without color_stops, and dark grey for the remainder", () => {
      render([{ button: "main", source: "sensor.progress" }]);
      expect(stroke()).toBe("var(--primary-color)");
      expect(remaining()).toBe("var(--dark-grey-color)");
    });

    it.each([
      ["picks the lower stop", false, "#ff0000"],
      ["interpolates between stops", true, "color-mix(in srgb, #ff0000 25%, #00ff00 75%)"],
    ])("%s", (_, interpolate_colors, expected) => {
      render([{ button: "main", source: "sensor.progress", color_stops: stops, interpolate_colors }]);
      expect(stroke()).toBe(expected);
    });

    it("chooses the colour from the inverted progress", () => {
      render([
        {
          button: "main",
          source: "sensor.progress",
          invert: true,
          color_stops: [
            { percent: 0, color: "red" },
            { percent: 50, color: "green" },
          ],
        },
      ]);
      expect(stroke()).toBe("var(--red-color)");
    });

    it.each([
      ["remaining_color", { remaining_color: "blue" }, false],
      ["deprecated remainingcolor", { remainingcolor: "blue" }, true],
    ])("colours the remainder from %s", (_, keys, deprecated) => {
      render([{ button: "main", source: "sensor.progress", ...keys }]);
      expect(remaining()).toBe("var(--blue-color)");
      expect(warn).toHaveBeenCalledTimes(deprecated ? 1 : 0);
    });

    it.each([
      ["background_color", { background_color: "#333333" }, "rgb(51, 51, 51)"],
      ["deprecated backcolor", { backcolor: "#333333" }, "rgb(51, 51, 51)"],
      ["background_color over backcolor", { background_color: "#333333", backcolor: "#444444" }, "rgb(51, 51, 51)"],
      ["a theme colour name", { background_color: "invalid-color" }, "var(--invalid-color-color)"],
      ["an entity", { background_color: "sensor.bg" }, "rgb(0, 0, 255)"],
    ])("sets the background from %s", (_, keys, expected) => {
      h().setState("sensor.bg", "#0000ff");
      render([{ button: "main", source: "sensor.progress", ...keys }]);
      expect(main().style.background).toBe(expected);
    });

    it("leaves Bubble Card's own background alone when none is configured", () => {
      main().style.background = "rgb(1, 2, 3)";
      render([{ button: "main", source: "sensor.progress" }]);
      expect(main().style.background).toBe("rgb(1, 2, 3)");
    });
  });

  describe("conditions", () => {
    const conditional = (extra = {}) => [
      { button: "main", source: "sensor.progress", background_color: "#333333", condition: [enabled], ...extra },
    ];

    it("draws while the condition holds and fully cleans up when it stops", () => {
      main().style.background = "rgb(9, 9, 9)";
      render(conditional());
      expect(svg()).not.toBeNull();
      expect(main().style.background).toBe("rgb(51, 51, 51)");

      h().setState("sensor.enable", "off");
      rerender();
      expect(svg()).toBeNull();
      expect(main().style.background).toBe("rgb(9, 9, 9)");

      h().setState("sensor.enable", "on");
      rerender();
      expect(svg()).not.toBeNull();
    });

    it("remembers the original background only once", () => {
      render(conditional());
      h().setState("sensor.enable", "off");
      rerender();
      expect(main().style.background).toBe("");
      expect(main().dataset.originalBackground).toBe("");
    });

    it("uses the first config whose condition holds", () => {
      h().setStates({ "sensor.mode": "b", "sensor.a": "10", "sensor.b": "90" });
      const on = (state) => ({ condition: "state", entity_id: "sensor.mode", state });
      render([
        { button: "main", source: "sensor.a", condition: on("a") },
        { button: "main", source: "sensor.b", condition: on("b") },
        { button: "main", source: "sensor.progress" },
      ]);
      expect(dash()).toBe("0 0 270 30");

      h().setState("sensor.mode", "c");
      rerender();
      expect(dash()).toBe("0 0 225 75");
    });

    it("supports compound conditions", () => {
      h().setState("sensor.other", "on");
      render(
        conditional({
          condition: [
            { condition: "and", conditions: [enabled, { condition: "state", entity_id: "sensor.other", state: "on" }] },
          ],
        }),
      );
      expect(svg()).not.toBeNull();

      h().setState("sensor.other", "off");
      rerender();
      expect(svg()).toBeNull();
    });
  });

  describe("effects", () => {
    it("adds effect classes while their condition holds", () => {
      const config = [{ button: "main", source: "sensor.progress", effects: [{ effect: "glow", condition: enabled }] }];
      render(config);
      expect([...main().classList]).toEqual(expect.arrayContaining(["progress-effect-glow", "has-effect"]));

      h().setState("sensor.enable", "off");
      rerender();
      expect(main().classList.contains("progress-effect-glow")).toBe(false);
    });
  });

  describe("timers", () => {
    // 100s timer finishing 50s after the pinned clock → 50% elapsed.
    const timer = (state, attributes = {}) =>
      h().setState("timer.cook", { state, attributes: { duration: "0:01:40", ...attributes } });
    const activeTimer = (id = "timer.cook", finishes_at = "2025-07-01T12:00:50Z") =>
      h().setState(id, { state: "active", attributes: { duration: "0:01:40", finishes_at } });
    const tickers = () => jest.getTimerCount();

    it("shows elapsed progress of an active timer and advances it every second", () => {
      activeTimer();
      render([{ button: "main", source: "timer.cook" }]);
      expect(dash()).toBe("0 0 150 150");

      h().tick(10_000);
      expect(dash()).toBe("0 0 180 120");
    });

    it.each([
      ["paused, from remaining", "paused", { remaining: "0:00:25" }, "0 0 225 75"],
      ["idle, as empty", "idle", {}, "0 300"],
      ["active without finishes_at, as empty", "active", {}, "0 300"],
    ])("shows a timer that is %s", (_, state, attributes, expected) => {
      timer(state, attributes);
      render([{ button: "main", source: "timer.cook" }]);
      expect(dash()).toBe(expected);
    });

    it.each([
      ["non-timer sources", () => render([{ button: "main", source: "sensor.progress" }])],
      [
        "paused timers",
        () => (timer("paused", { remaining: "0:00:25" }), render([{ button: "main", source: "timer.cook" }])),
      ],
    ])("runs no ticker for %s", (_, arrange) => {
      arrange();
      expect(tickers()).toBe(0);
    });

    it("stops the ticker when the timer is no longer active", () => {
      activeTimer();
      render([{ button: "main", source: "timer.cook" }]);

      timer("idle");
      rerender();
      expect(tickers()).toBe(0);
    });

    it("stops the ticker when no config matches", () => {
      activeTimer();
      render([{ button: "main", source: "timer.cook", condition: [enabled] }]);

      h().setState("sensor.enable", "off");
      rerender();
      expect(tickers()).toBe(0);
    });

    it("keeps one ticker per button across renders", () => {
      activeTimer();
      render([
        { button: "main", source: "timer.cook" },
        { button: "sub-button-1", source: "timer.cook" },
      ]);
      rerender();
      rerender();
      expect(tickers()).toBe(2);
    });

    it("ticks with the latest config after a condition switches configs", () => {
      activeTimer();
      h().setState("sensor.mode", "a");
      const when = (state) => ({ condition: "state", entity_id: "sensor.mode", state });
      render([
        { button: "main", source: "timer.cook", condition: when("a"), color_stops: [{ percent: 0, color: "#ff0000" }] },
        { button: "main", source: "timer.cook", condition: when("b"), color_stops: [{ percent: 0, color: "#00ff00" }] },
      ]);
      expect(stroke()).toBe("#ff0000");

      h().setState("sensor.mode", "b");
      rerender();
      h().tick(1_000);
      expect(stroke()).toBe("#00ff00");
    });

    it("ticks the latest source after it switches to another active timer", () => {
      activeTimer("timer.a", "2025-07-01T12:00:50Z");
      activeTimer("timer.b", "2025-07-01T12:01:30Z");
      h().setState("sensor.mode", "a");
      const when = (state) => ({ condition: "state", entity_id: "sensor.mode", state });
      render([
        { button: "main", source: "timer.a", condition: when("a") },
        { button: "main", source: "timer.b", condition: when("b") },
      ]);

      h().setState("sensor.mode", "b");
      rerender();
      h().tick(10_000);
      expect(dash()).toBe("0 0 60 240");
    });

    it("releases every ticker when Bubble Card tears the card down", () => {
      activeTimer();
      render([
        { button: "main", source: "timer.cook" },
        { button: "sub-button-1", source: "timer.cook" },
      ]);
      expect(h().teardownCount()).toBe(1);

      h().teardown();
      expect(tickers()).toBe(0);
    });

    it("stops ticking once the card leaves the page, on Bubble Card versions without onTeardown", () => {
      h().cleanup();
      const legacy = createCardHarness({ mode: "legacy", rect: { width: 40, height: 40 } });
      try {
        legacy.setState("timer.cook", {
          state: "active",
          attributes: { duration: "0:01:40", finishes_at: "2025-07-01T12:00:50Z" },
        });
        legacy.run(icon_border_progress, [{ button: "main", source: "timer.cook" }]);
        expect(tickers()).toBe(1);

        legacy.disconnect();
        legacy.tick(1_000);
        expect(tickers()).toBe(0);
      } finally {
        legacy.cleanup();
      }
    });
  });
});
