import { jest } from "@jest/globals";
import { separator_as_timeline } from "../code.js";
import { useCardHarness } from "../../../testing/cardHarness.js";

// Clock pinned to 2025-07-01 12:00 UTC (TZ=UTC), so "now" sits at 50% of the day.
const h = useCardHarness({
  type: "separator",
  computedStyle: { height: "2px" },
  states: {
    "sensor.sun_next_rising": "2025-07-01T06:15:00+00:00",
    "sensor.sun_next_setting": "2025-07-01T19:45:00+00:00",
    "sensor.sun_next_dawn": "2025-07-01T05:30:00+00:00",
    "sensor.sun_next_dusk": "2025-07-01T20:30:00+00:00",
    "sensor.work_start": "09:00",
    "sensor.work_end": "17:30",
    "input_datetime.lunch_start": "12:30:00",
    "input_datetime.lunch_end": "13:30:00",
  },
});

const render = (config) => h().run(separator_as_timeline, config);
const wrapper = () => h().$(".bubble-line-wrapper");
const segments = (selector = "") => h().$$(`.timeline-segment${selector}`);
const icons = (selector = "") => h().$$(`.timeline-icon${selector}`);
const segmentFor = (label) => segments().find((s) => s.dataset.tooltip.startsWith(`${label}:`));
const pct = (value) => parseFloat(value);

let warn;
beforeEach(() => {
  warn = jest.spyOn(console, "warn").mockImplementation(() => {});
});
afterEach(() => warn.mockRestore());

describe("separator_as_timeline", () => {
  describe("setup", () => {
    it("does nothing without config", () => {
      h().run(separator_as_timeline, undefined);
      expect(wrapper()).toBeNull();
    });

    it("does nothing without a .bubble-line", () => {
      h().$(".bubble-line").remove();
      render({ ranges: [] });
      expect(wrapper()).toBeNull();
    });

    it("wraps the line once, copying its height, and adds one tooltip", () => {
      render({ ranges: [] });
      render({ ranges: [] });

      expect(h().$$(".bubble-line-wrapper")).toHaveLength(1);
      expect(wrapper().style.height).toBe("2px");
      expect(h().$(".bubble-line").classList.contains("wrapped")).toBe(true);
      expect(h().$$(".timeline-tooltip")).toHaveLength(1);
    });

    it("reuses an existing wrapper without re-wrapping", () => {
      const line = h().$(".bubble-line");
      const existing = document.createElement("div");
      existing.className = "bubble-line-wrapper";
      line.replaceWith(existing);
      existing.appendChild(line);

      render({ ranges: [] });

      expect(wrapper()).toBe(existing);
      expect(line.classList.contains("wrapped")).toBe(false);
    });

    it.each([
      ["empty array", { ranges: [] }],
      ["empty object", { ranges: {} }],
      ["null", { ranges: null }],
      ["missing", {}],
    ])("renders no segments when ranges is %s", (_, config) => {
      render(config);
      expect(segments()).toHaveLength(0);
    });

    it("clears previous segments and icons on every render", () => {
      const config = { ranges: [{ start: "09:00", end: "17:00", icon: "mdi:work", color: "blue" }] };
      render(config);
      render(config);
      expect(segments()).toHaveLength(1);
      expect(icons()).toHaveLength(1);
    });
  });

  describe("segments", () => {
    it("positions a range as a percentage of the day", () => {
      render({ ranges: [{ label: "Work", start: "09:00", end: "17:00", color: "blue" }] });

      const [seg] = segments();
      expect(pct(seg.style.left)).toBeCloseTo(37.5);
      expect(pct(seg.style.width)).toBeCloseTo(33.333);
      expect(seg.style.background).toBe("var(--blue-color)");
      expect(seg.classList.contains("group-Work")).toBe(true);
      expect(seg.dataset.tooltip).toBe("Work: 09:00 → 17:00");
    });

    it("accepts ranges in the editor's numbered-object shape", () => {
      render({
        ranges: { 0: { label: "A", start: "01:00", end: "02:00" }, 1: { label: "B", start: "03:00", end: "04:00" } },
      });
      expect(segments().map((s) => s.dataset.tooltip)).toEqual(["A: 01:00 → 02:00", "B: 03:00 → 04:00"]);
    });

    it("splits a range that crosses midnight into two segments, each with an icon", () => {
      render({
        ranges: [
          { label: "Night Shift", start: "22:00", end: "06:00", color: "purple", icon: "mdi:moon-waning-crescent" },
        ],
      });

      const [late, early] = segments(".group-Night-Shift");
      expect(pct(late.style.left)).toBeCloseTo(91.667);
      expect(pct(late.style.width)).toBeCloseTo(8.333);
      expect(pct(early.style.left)).toBe(0);
      expect(pct(early.style.width)).toBeCloseTo(25);
      expect(icons().map((i) => i.getAttribute("icon"))).toEqual([
        "mdi:moon-waning-crescent",
        "mdi:moon-waning-crescent",
      ]);
    });

    it("squares segment corners by default", () => {
      render({ ranges: [{ start: "01:00", end: "03:00" }] });
      expect(segments()[0].style.borderRadius).toBe("0");
    });

    it("rounds inner corners only when rounded_edges is on", () => {
      render({
        rounded_edges: true,
        ranges: [
          { label: "Edge", start: "00:00", end: "06:00" },
          { label: "Mid", start: "09:00", end: "10:00" },
          { label: "End", start: "18:00", end: "00:00" },
        ],
      });

      const corners = (s) => [
        s.style.borderTopLeftRadius,
        s.style.borderBottomLeftRadius,
        s.style.borderTopRightRadius,
        s.style.borderBottomRightRadius,
      ];
      expect(corners(segmentFor("Edge"))).toEqual(["0", "0", "4px", "4px"]);
      expect(corners(segmentFor("Mid"))).toEqual(["4px", "4px", "4px", "4px"]);
      const [end] = segments(".group-End");
      expect(corners(end)).toEqual(["4px", "4px", "0", "0"]);
    });

    it("appends source entities to the tooltip", () => {
      render({ ranges: [{ label: "S", start: "08:00", end: "09:00", source_entities: "sensor.a,sensor.b" }] });
      expect(segments()[0].dataset.tooltip).toBe("S: 08:00 → 09:00\nSources: sensor.a,sensor.b");
    });

    it("resolves the segment colour from an entity", () => {
      h().setState("sensor.schedule_color", "#4caf50");
      render({ ranges: [{ start: "08:00", end: "09:00", color: "sensor.schedule_color" }] });
      expect(segments()[0].style.background).toBe("rgb(76, 175, 80)");
    });
  });

  describe("time sources", () => {
    it.each([
      ["HH:MM", "12:30", "13:30", "12:30 → 13:30"],
      ["HH:MM:SS", "12:30:00", "13:30:00", "12:30 → 13:30"],
      ["ISO timestamp", "2025-04-26T02:00:00+00:00", "2025-04-26T04:30:00+00:00", "02:00 → 04:30"],
      ["minutes since midnight", "600", "720", "10:00 → 12:00"],
      ["invalid values", "invalid-time", "nope", "00:00 → 00:00"],
    ])("parses %s", (_, start, end, expected) => {
      render({ ranges: [{ label: "T", start, end }] });
      expect(segments()[0].dataset.tooltip).toBe(`T: ${expected}`);
    });

    it("reads start and end from entity states", () => {
      render({
        ranges: [
          { label: "Work", start_entity: "sensor.work_start", end_entity: "sensor.work_end" },
          { label: "Lunch", start_entity: "input_datetime.lunch_start", end_entity: "input_datetime.lunch_end" },
          { label: "School run", start_entity: "sensor.sun_next_rising", end: "09:00" },
        ],
      });

      expect(segmentFor("Work").dataset.tooltip).toBe("Work: 09:00 → 17:30");
      expect(segmentFor("Lunch").dataset.tooltip).toBe("Lunch: 12:30 → 13:30");
      expect(segmentFor("School run").dataset.tooltip).toBe("School run: 06:15 → 09:00");
    });

    it("reads start and end from entity attributes", () => {
      h().setStates({
        "sensor.schedule": { state: "active", attributes: { start_time: "08:45", end_time: "17:15" } },
        "input_datetime.meeting": { state: "14:30", attributes: { custom_end: "15:30" } },
      });
      render({
        ranges: [
          {
            label: "Work",
            start_entity: "sensor.schedule",
            start_attribute: "start_time",
            end_entity: "sensor.schedule",
            end_attribute: "end_time",
          },
          {
            label: "Meeting",
            start_entity: "input_datetime.meeting",
            end_entity: "input_datetime.meeting",
            end_attribute: "custom_end",
          },
        ],
      });

      expect(segmentFor("Work").dataset.tooltip).toBe("Work: 08:45 → 17:15");
      expect(segmentFor("Meeting").dataset.tooltip).toBe("Meeting: 14:30 → 15:30");
    });

    it.each([
      ["a missing entity", { start_entity: "sensor.nonexistent", end: "17:00" }, "00:00 → 17:00"],
      [
        "a missing attribute",
        { start_entity: "sensor.work_start", start_attribute: "nope", end: "14:00" },
        "00:00 → 14:00",
      ],
      ["no times at all", {}, "00:00 → 00:00"],
    ])("treats %s as midnight", (_, range, expected) => {
      render({ ranges: [{ label: "T", ...range }] });
      expect(segments()[0].dataset.tooltip).toBe(`T: ${expected}`);
    });
  });

  describe("icons", () => {
    const iconRange = { label: "Work", start: "09:00", end: "17:00", icon: "mdi:work" };

    it("renders no icon for a range without one", () => {
      render({ ranges: [{ start: "09:00", end: "17:00" }] });
      expect(icons()).toHaveLength(0);
    });

    it("centres the icon on its segment and applies default styling", () => {
      render({ ranges: [iconRange] });

      const [icon] = icons(".group-Work");
      expect(icon.tagName).toBe("HA-ICON");
      expect(icon.getAttribute("icon")).toBe("mdi:work");
      expect(pct(icon.style.left)).toBeCloseTo(54.167);
      expect(icon.style.color).toBe("var(--primary-text-color)");
      expect(icon.style.background).toBe("var(--bubble-icon-background-color)");
      expect(icon.style.border).toBe("1px solid var(--card-background-color)");
      expect(icon.style.getPropertyValue("--icon-size")).toBe("18px");
      expect(icon.style.getPropertyValue("--mdc-icon-size")).toBe("16px");
      expect(wrapper().style.getPropertyValue("--icon-group-Work-active-color")).toBe("var(--primary-color)");
    });

    it("applies global icon_settings, overridden per range", () => {
      render({
        icon_settings: { icon_color: "orange", icon_background_color: "black", icon_size: "20px" },
        ranges: [
          iconRange,
          { ...iconRange, label: "Night", icon_settings: { icon_color: "white", icon_size: "16px" } },
        ],
      });

      const [work] = icons(".group-Work");
      const [night] = icons(".group-Night");
      expect(work.style.color).toBe("var(--orange-color)");
      expect(work.style.getPropertyValue("--icon-size")).toBe("20px");
      expect(night.style.color).toBe("var(--white-color)");
      expect(night.style.background).toBe("var(--black-color)");
      expect(night.style.getPropertyValue("--icon-size")).toBe("16px");
    });

    it.each([
      ["range level", { ranges: [{ ...iconRange, icon_color: "green" }] }],
      ["top level", { icon_color: "green", ranges: [iconRange] }],
    ])("still honours deprecated icon keys at %s, with a warning", (_, config) => {
      render(config);
      expect(icons()[0].style.color).toBe("var(--green-color)");
      expect(warn).toHaveBeenCalledWith(expect.stringContaining('Use "icon_settings.icon_color" instead'));
    });

    const nowRange = { ...iconRange, label: "Now", start: "11:00", end: "13:00" };

    it("glows icons of the range containing now when highlight_active is on", () => {
      render({ highlight_active: true, ranges: [nowRange, { ...iconRange, start: "01:00", end: "02:00" }] });
      expect(icons(".group-Now")[0].style.filter).toBe("drop-shadow(0 0 5px var(--icon-group-Now-active-color))");
      expect(icons(".group-Work")[0].style.filter).toBe("");
    });

    // Current behaviour: only top-level highlight_active is read (schema default false). The editor writes
    // icon_settings.highlight_active, which is ignored. Tracked separately.
    it.each([
      ["by default", {}],
      ["when set only under icon_settings", { icon_settings: { highlight_active: true } }],
    ])("does not glow %s", (_, extra) => {
      render({ ...extra, ranges: [nowRange] });
      expect(icons()[0].style.filter).toBe("");
    });
  });

  describe("hover", () => {
    const config = {
      ranges: [
        { label: "Flight", start: "01:00", end: "02:00", icon: "mdi:airplane" },
        { label: "Flight", start: "03:00", end: "04:00" },
        { label: "Relax", start: "15:00", end: "18:00" },
      ],
    };
    const highlighted = () =>
      h()
        .$$(".highlighted")
        .map((e) => e.className);
    const tooltip = () => h().$(".timeline-tooltip");

    it.each([
      ["segment", () => segments(".group-Flight")[1]],
      ["icon", () => icons(".group-Flight")[0]],
    ])("hovering a %s highlights its whole group and shows the tooltip", (_, target) => {
      render(config);

      target().dispatchEvent(new Event("mouseenter"));
      expect(highlighted()).toHaveLength(3);
      expect(highlighted().every((c) => c.includes("group-Flight"))).toBe(true);
      expect(tooltip().style.opacity).toBe("1");
      expect(tooltip().innerText).toMatch(/^Flight: /);

      target().dispatchEvent(new Event("mouseleave"));
      expect(highlighted()).toHaveLength(0);
      expect(tooltip().style.opacity).toBe("0");
    });
  });

  describe("ticks and marker", () => {
    const tickTexts = () =>
      h()
        .$$(".timeline-tick")
        .map((t) => t.innerText);

    it("shows five ticks and the current-time marker by default", () => {
      render({ marker_color: "red", ranges: [] });

      expect(tickTexts()).toEqual(["00:00", "06:00", "12:00", "18:00", "00:00"]);
      expect(h().$$(".timeline-marker")).toHaveLength(1);
      expect(wrapper().style.getPropertyValue("--timeline-marker-left")).toBe("50%");
      expect(wrapper().style.getPropertyValue("--marker-color")).toBe("var(--red-color)");
    });

    it("does not duplicate ticks or marker across renders", () => {
      render({ ranges: [] });
      render({ ranges: [] });
      expect(tickTexts()).toHaveLength(5);
      expect(h().$$(".timeline-marker")).toHaveLength(1);
    });

    it("hides ticks and marker when turned off", () => {
      render({ show_time_ticks: false, show_current_time: false, ranges: [] });
      expect(tickTexts()).toHaveLength(0);
      expect(h().$(".timeline-marker")).toBeNull();
    });
  });

  describe("time formatting", () => {
    it("applies global_settings to ticks and tooltips", () => {
      render({
        time_format: { global_settings: { use_24_hour: false, append_suffix: true, pad_hours: false } },
        ranges: [{ label: "Study", start: "15:30", end: "18:00" }],
      });
      expect(h().$(".timeline-tick").innerText).toBe("12:00AM");
      expect(segmentFor("Study").dataset.tooltip).toBe("Study: 3:30PM → 6:00PM");
    });

    it("lets a section override the global settings only when override is true", () => {
      render({
        time_format: {
          global_settings: { use_24_hour: true },
          timeline: { override: true, use_24_hour: false, append_suffix: true, show_minutes: false, pad_hours: false },
          tooltip: { override: false, show_minutes: false },
        },
        ranges: [{ label: "Study", start: "15:30", end: "18:00" }],
      });
      expect(
        h()
          .$$(".timeline-tick")
          .map((t) => t.innerText),
      ).toEqual(["12AM", "6AM", "12PM", "6PM", "12AM"]);
      expect(segmentFor("Study").dataset.tooltip).toBe("Study: 15:30 → 18:00");
    });

    it("still honours deprecated top-level time_format keys, with a warning", () => {
      render({ time_format: { show_minutes: false }, ranges: [] });
      expect(h().$(".timeline-tick").innerText).toBe("00");
      expect(warn).toHaveBeenCalledWith(expect.stringContaining('"time_format.global_settings.show_minutes"'));
    });
  });
});
