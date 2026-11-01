import { jest } from "@jest/globals";
import { separator_as_progress_bar } from "../code.js";
import { useCardHarness } from "../../../testing/cardHarness.js";

const h = useCardHarness({
  type: "separator",
  computedStyle: { "--bubble-icon-border-radius": "4px" },
  states: {
    "sensor.task_progress": "75",
    "sensor.saros_10_status": "cleaning",
    "sensor.saros_10_current_room": "Living Room",
    "sensor.precise": "33.333",
  },
});

const render = (config) => h().run(separator_as_progress_bar, config);
const rerender = () => h().run(separator_as_progress_bar);
const line = () => h().$(".bubble-line");
const wrapper = () => h().$(".bubble-line-wrapper");
const prop = (el, name) => el.style.getPropertyValue(name);
const width = () => prop(line(), "--progress-width");
const bar = (config = {}) => ({ source: "sensor.task_progress", progress_style: { ...config } });
const cleaning = { condition: "state", entity: "sensor.saros_10_status", state: "cleaning" };

describe("separator_as_progress_bar", () => {
  describe("setup", () => {
    it.each([
      ["no config", undefined],
      ["no .bubble-line", bar(), () => line().remove()],
    ])("does nothing with %s", (_, config, arrange) => {
      arrange?.();
      render(config);
      expect(wrapper()).toBeNull();
    });

    it("wraps the line once and builds the bar", () => {
      render(bar());
      render(bar());

      expect(h().$$(".bubble-line-wrapper")).toHaveLength(1);
      expect(line().parentElement).toBe(wrapper());
      expect(line().classList.contains("bubble-line-progress")).toBe(true);
      expect(line().querySelectorAll(".bubble-line-progress-bar")).toHaveLength(1);
      expect(line().querySelectorAll(".bubble-line-progress-tip")).toHaveLength(1);
    });

    it("draws nothing without progress_style", () => {
      render({ source: "sensor.task_progress" });
      expect(line().classList.contains("bubble-line-progress")).toBe(false);
    });

    it("sets the bar height, defaulting to 6px", () => {
      render(bar());
      expect(prop(wrapper(), "--bubble-line-height")).toBe("6px");
      render(bar({ height: 12 }));
      expect(prop(wrapper(), "--bubble-line-height")).toBe("12px");
    });

    it.each([
      ["has", "4px", true],
      ["has no", "", false],
    ])("marks the line when Bubble Card %s an icon border radius", (_, radius, expected) => {
      global.getComputedStyle = () => ({ getPropertyValue: () => radius });
      render(bar());
      expect(line().classList.contains("has-bubble-border-radius")).toBe(expected);
    });
  });

  describe("progress value", () => {
    it.each([
      ["the entity state", "75", {}, "75cqw"],
      ["override over the entity", "75", { override: 30 }, "30cqw"],
      ["inverted", "75", { invert: true }, "25cqw"],
      ["a non-numeric state as 0", "invalid", {}, "0cqw"],
      ["a negative value as 0", "-10", {}, "0cqw"],
      ["a value above 100 as 0", "150", {}, "0cqw"],
    ])("shows %s", (_, state, extra, expected) => {
      h().setState("sensor.task_progress", state);
      render({ ...bar(), ...extra });
      expect(width()).toBe(expected);
    });

    it("shows a missing entity as 0", () => {
      render({ ...bar(), source: "sensor.missing" });
      expect(width()).toBe("0cqw");
    });

    it("starts from zero and sets the width on the next frame", () => {
      const frames = [];
      global.requestAnimationFrame = jest.fn((cb) => frames.push(cb));
      render(bar());
      expect(width()).toBe("0cqw");

      frames.forEach((cb) => cb());
      expect(width()).toBe("75cqw");
    });
  });

  describe("colours", () => {
    const stops = [
      { percent: 0, color: "#ff0000" },
      { percent: 100, color: "#00ff00" },
    ];

    it("uses the primary colour without color stops", () => {
      render(bar());
      expect(prop(line(), "--bubble-line-progress-color")).toBe("var(--primary-color)");
      expect(prop(line(), "--bubble-line-progress-background-color")).toBe("var(--primary-color)");
    });

    it.each([
      ["interpolates by default", undefined, "color-mix(in srgb, #ff0000 25%, #00ff00 75%)"],
      ["picks the lower stop without interpolation", false, "#ff0000"],
    ])("%s", (_, interpolate, expected) => {
      render(bar({ interpolate, color_stops: stops, background_color_stops: stops }));
      expect(prop(line(), "--bubble-line-progress-color")).toBe(expected);
      expect(prop(line(), "--bubble-line-progress-background-color")).toBe(expected);
    });

    it("chooses the colour from the raw value even when inverted", () => {
      render({
        ...bar({ interpolate: false, color_stops: [stops[0], { percent: 50, color: "#00ff00" }] }),
        invert: true,
      });
      expect(prop(line(), "--bubble-line-progress-color")).toBe("#00ff00");
    });

    it.each([
      ["a full outline", { style: "dashed", width: 2, color: "red" }, "dashed 2px var(--red-color)"],
      ["an outline without style", { width: "1px", color: "#123456" }, "1px #123456"],
      ["no outline", undefined, "none"],
    ])("draws %s", (_, outline, expected) => {
      render(bar({ outline }));
      expect(prop(line(), "--bubble-line-progress-outline")).toBe(expected);
    });
  });

  describe("shine and orb", () => {
    const shine = () => line().querySelector(".bubble-line-progress-bar > .bubble-line-progress-shine");
    const orb = () => line().querySelector(".bubble-line-progress-bar > .bubble-line-progress-orb");

    it.each([
      ["no settings", undefined],
      ["show_shine off", { show_shine: false }],
      ["show_shine unset", { shine_color: "red" }],
      ["a failing condition", { show_shine: true, condition: { ...cleaning, state: "docked" } }],
    ])("has no shine with %s", (_, shine_settings) => {
      render(bar({ shine_settings }));
      expect(shine()).toBeNull();
    });

    it("adds a shine with defaults", () => {
      render(bar({ shine_settings: { show_shine: true, condition: cleaning } }));
      expect(prop(shine(), "--bubble-line-progress-shine-color")).toBe("rgba(255,255,255,0.4)");
      expect(prop(shine(), "--bubble-line-progress-shine-width")).toBe("calc(var(--progress-width) / 2)");
      expect(prop(shine(), "--bubble-line-progress-shine-angle")).toBe("0deg");
      expect(shine().style.animationDelay).toBe("0s");
    });

    it("adds a configured shine, once", () => {
      const shine_settings = {
        show_shine: true,
        shine_color: "#ffffff",
        shine_width: 20,
        shine_angle: 15,
        shine_delay: 2,
      };
      render(bar({ shine_settings }));
      render(bar({ shine_settings }));

      expect(line().querySelectorAll(".bubble-line-progress-shine")).toHaveLength(1);
      expect(prop(shine(), "--bubble-line-progress-shine-color")).toBe("#ffffff");
      expect(prop(shine(), "--bubble-line-progress-shine-width")).toBe("20px");
      expect(prop(shine(), "--bubble-line-progress-shine-angle")).toBe("15deg");
      expect(shine().style.animationDelay).toBe("2s");
    });

    it.each([
      ["no settings", undefined],
      ["show_orb off", { show_orb: false }],
      ["show_orb unset", { orb_color: "red" }],
      ["a failing condition", { show_orb: true, condition: { ...cleaning, state: "docked" } }],
    ])("has no orb with %s", (_, orb_settings) => {
      render(bar({ orb_settings }));
      expect(orb()).toBeNull();
    });

    it.each([
      ["fast by default", {}, "orb-fast 2s linear infinite", "var(--primary-color)", "var(--primary-color)"],
      [
        "slow when asked",
        { slow_orb: true, orb_color: "#00e5ff", trail_color: "transparent" },
        "orb-slow 2s ease-in-out infinite",
        "#00e5ff",
        "var(--transparent-color)",
      ],
    ])("adds an orb, %s", (_, settings, animation, color, trail) => {
      render(bar({ orb_settings: { show_orb: true, ...settings } }));
      render(bar({ orb_settings: { show_orb: true, ...settings } }));

      expect(line().querySelectorAll(".bubble-line-progress-orb")).toHaveLength(1);
      expect(orb().style.animation).toBe(animation);
      expect(prop(orb(), "--bubble-line-progress-orb-color")).toBe(color);
      expect(prop(orb(), "--bubble-line-progress-orb-trail-color")).toBe(trail);
    });

    it("removes shine and orb when their conditions stop holding", () => {
      render(
        bar({
          shine_settings: { show_shine: true, condition: cleaning },
          orb_settings: { show_orb: true, condition: [cleaning] },
        }),
      );
      expect(shine()).not.toBeNull();
      expect(orb()).not.toBeNull();

      h().setState("sensor.saros_10_status", "docked");
      rerender();
      expect(shine()).toBeNull();
      expect(orb()).toBeNull();
    });
  });

  describe("text", () => {
    const text = (position) => wrapper().querySelector(`.bubble-line-text.${position}-text`);

    it("renders above and below text from templates, above before the line", () => {
      render({
        ...bar(),
        above_text: { text: "Cleaning {room}", placeholders: { room: "sensor.saros_10_current_room" } },
        below_text: { text: "{pct}% · {raw}", placeholders: { pct: "sensor.task_progress", raw: "plain" } },
      });

      expect(text("above").innerText).toBe("Cleaning Living Room");
      expect(text("below").innerText).toBe("75% · plain");
      expect(text("above").nextElementSibling).toBe(line());
      expect(wrapper().lastElementChild).toBe(text("below"));
    });

    it("formats numeric placeholders to two decimals", () => {
      h().setState("sensor.precise", { state: 33.333 });
      render({ ...bar(), below_text: { text: "{v}", placeholders: { v: "sensor.precise" } } });
      expect(text("below").innerText).toBe("33.33");
    });

    it("keeps one element per position and removes it when its condition stops holding", () => {
      const config = { ...bar(), above_text: { text: "Hi", condition: cleaning } };
      render(config);
      render(config);
      expect(wrapper().querySelectorAll(".above-text")).toHaveLength(1);

      h().setState("sensor.saros_10_status", "docked");
      rerender();
      expect(text("above")).toBeNull();
    });
  });

  describe("main condition", () => {
    it("clears the bar's styling when the condition stops holding", () => {
      const config = { ...bar({ outline: { width: 1, color: "red" } }), condition: [cleaning] };
      render(config);
      expect(line().classList.contains("bubble-line-progress")).toBe(true);

      h().setState("sensor.saros_10_status", "docked");
      rerender();
      expect(line().classList.contains("bubble-line-progress")).toBe(false);
      for (const name of [
        "--progress-width",
        "--bubble-line-progress-color",
        "--bubble-line-progress-background-color",
        "--bubble-line-progress-outline",
      ]) {
        expect(prop(line(), name)).toBe("");
      }
      expect(prop(wrapper(), "--bubble-line-height")).toBe("");
    });

    it.each([
      ["an array of states", { condition: "state", entity: "sensor.saros_10_status", state: ["docked", "cleaning"] }],
      ["exists", { condition: "exists", entity: "sensor.saros_10_status" }],
    ])("supports %s conditions", (_, condition) => {
      render({ ...bar(), condition });
      expect(line().classList.contains("bubble-line-progress")).toBe(true);
    });
  });
});
