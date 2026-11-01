import { jest } from "@jest/globals";
import { sub_button_wheel } from "../code.js";
import { useCardHarness } from "../../../testing/cardHarness.js";
import { sourceAndArtifact } from "../../../testing/artifact.js";

const h = useCardHarness({ subButtons: 8, now: null });

const render = (config) => h().run(moduleFn, config);
const wheel = (opener = "main", n = 4, extra = {}) => ({
  wheel_opener: opener,
  wheel_buttons: Array.from({ length: n }, (_, i) => ({ sub_button: String(i + 1) })),
  ...extra,
});
const menu = () => h().$(".wheel-menu");
const ring = () => h().$(".glass-ring");
const overlay = () => h().$(".wheel-overlay");
const buttons = (root = menu()) => Array.from(root.querySelectorAll(".wheel-button"));
const sub = (n) => h().$(`.bubble-sub-button-${n}`);
const opener = () => h().$(".wheel-open-button");
const position = (el) => {
  const match = el.style.transform.match(/translate\((-?\d+)px, (-?\d+)px\)/);
  return match ? [Number(match[1]), Number(match[2])] : null;
};
const positions = () => buttons().map(position);
const isOpen = () => [menu(), ring(), overlay()].map((el) => el.classList.contains("active"));
const click = (el) => el.dispatchEvent(new MouseEvent("click", { bubbles: true }));
const hassAction = (el) => el.dispatchEvent(new Event("hass-action", { bubbles: true }));

let warn;
beforeEach(() => {
  warn = jest.spyOn(console, "warn").mockImplementation(() => {});
});
afterEach(() => warn.mockRestore());

let moduleFn;

describe.each(sourceAndArtifact("sub_button_wheel", sub_button_wheel))("sub_button_wheel (%s)", (_, fn) => {
  beforeAll(() => {
    moduleFn = fn;
  });

  describe("building the wheel", () => {
    it("moves the sub-buttons and opener into a wheel menu behind an overlay", () => {
      render([wheel()]);

      expect(menu().classList.contains("main-opener")).toBe(true);
      expect(menu().style.width).toBe("36px");
      expect(menu().style.height).toBe("36px");
      expect(menu().firstElementChild).toBe(ring());
      expect(buttons()).toEqual([sub(1), sub(2), sub(3), sub(4)]);
      expect(menu().lastElementChild).toBe(opener());
      expect(opener().classList.contains("bubble-icon-container")).toBe(true);
      expect(overlay().nextElementSibling).toBe(menu());
    });

    it("replaces the opener's tap action with none", () => {
      render([wheel()]);
      expect(JSON.parse(opener().getAttribute("data-tap-action"))).toEqual({ action: "none" });
    });

    it.each([
      ["sub-button-5", 5],
      ["5", 5],
    ])("accepts a sub-button opener named %s", (name, n) => {
      render([{ ...wheel(), wheel_opener: name }]);
      expect(opener()).toBe(sub(n));
      expect(menu().classList.contains("main-opener")).toBe(false);
    });

    it("accepts sub-buttons named sub-button-N", () => {
      render([{ wheel_opener: "main-button", wheel_buttons: [{ sub_button: "sub-button-2" }] }]);
      expect(buttons()).toEqual([sub(2)]);
    });

    it("skips sub-buttons that don't exist, with a warning", () => {
      render([
        { wheel_opener: "main", wheel_buttons: [{ sub_button: "1" }, { sub_button: "99" }, { sub_button: "2" }] },
      ]);
      expect(buttons()).toEqual([sub(1), sub(2)]);
      expect(warn).toHaveBeenCalledWith("Sub-button 99 not found, skipping");
    });

    it.each([
      ["no wheel_opener", [{ wheel_buttons: [{ sub_button: "1" }] }]],
      ["a missing opener element", [{ ...wheel(), wheel_opener: "sub-button-99" }]],
      ["no wheel_buttons", [{ wheel_opener: "main" }]],
      ["empty wheel_buttons", [{ wheel_opener: "main", wheel_buttons: [] }]],
    ])("builds nothing with %s", (_, config) => {
      render(config);
      expect(menu()).toBeNull();
    });

    it("builds each wheel only once across renders", () => {
      render([wheel()]);
      render([wheel()]);
      expect(h().$$(".wheel-menu")).toHaveLength(1);
      expect(h().$$(".wheel-overlay")).toHaveLength(1);
    });

    it("builds several wheels, skipping invalid ones", () => {
      render({
        0: { wheel_opener: "main", wheel_buttons: [{ sub_button: "1" }, { sub_button: "2" }] },
        1: { wheel_buttons: [{ sub_button: "3" }] },
        2: { wheel_opener: "sub-button-8", wheel_buttons: [{ sub_button: "4" }, { sub_button: "5" }] },
      });
      const menus = h().$$(".wheel-menu");
      expect(menus).toHaveLength(2);
      expect(buttons(menus[0])).toEqual([sub(1), sub(2)]);
      expect(buttons(menus[1])).toEqual([sub(4), sub(5)]);
    });

    it("accepts a single wheel object", () => {
      render(wheel("main", 2));
      expect(buttons()).toHaveLength(2);
    });
  });

  describe("button order", () => {
    const order = () => buttons().map((b) => b.className.match(/bubble-sub-button-(\d)/)[1]);

    it("places explicitly positioned buttons first, filling gaps in config order", () => {
      render([
        {
          wheel_opener: "main",
          wheel_buttons: [
            { sub_button: "1" },
            { sub_button: "2", position: 1 },
            { sub_button: "3" },
            { sub_button: "4", position: 3 },
          ],
        },
      ]);
      expect(order()).toEqual(["2", "1", "4", "3"]);
    });

    it("keeps out-of-range positions at the end", () => {
      render([{ wheel_opener: "main", wheel_buttons: [{ sub_button: "1", position: 10 }, { sub_button: "2" }] }]);
      expect(order()).toEqual(["2", "1"]);
    });
  });

  describe("layouts", () => {
    const layout = (wheel_layout, n, options = {}) =>
      render([wheel("main", n, { layout_options: { wheel_layout, ...options } })]);
    const ringDiameter = () => parseFloat(ring().style.width);

    it.each([
      [
        "even-circle (default)",
        undefined,
        4,
        [
          [0, -54],
          [54, 0],
          [0, 54],
          [-54, 0],
        ],
        157.6,
      ],
      [
        "an unknown layout as even-circle",
        "spiral",
        4,
        [
          [0, -54],
          [54, 0],
          [0, 54],
          [-54, 0],
        ],
        157.6,
      ],
      [
        "even-circle",
        "even-circle",
        5,
        [
          [0, -54],
          [51, -17],
          [32, 44],
          [-32, 44],
          [-51, -17],
        ],
        157.6,
      ],
      [
        "fixed-position",
        "fixed-position",
        3,
        [
          [0, -54],
          [38, -38],
          [54, 0],
        ],
        157.6,
      ],
      [
        "smart-adaptive with ≤3 buttons as fixed-position",
        "smart-adaptive",
        3,
        [
          [0, -54],
          [38, -38],
          [54, 0],
        ],
        157.6,
      ],
      [
        "smart-adaptive with 4+ buttons as even-circle",
        "smart-adaptive",
        4,
        [
          [0, -54],
          [54, 0],
          [0, 54],
          [-54, 0],
        ],
        157.6,
      ],
      [
        "progressive-arc",
        "progressive-arc",
        5,
        [
          [0, -58],
          [37, -44],
          [-37, -44],
          [57, -10],
          [-57, -10],
        ],
        165.2,
      ],
      [
        "compact-arc",
        "compact-arc",
        5,
        [
          [0, -58],
          [20, -54],
          [-20, -54],
          [37, -44],
          [-37, -44],
        ],
        165.2,
      ],
      [
        "double-ring (4 inner)",
        "double-ring",
        6,
        [
          [0, -58],
          [41, -41],
          [58, 0],
          [41, 41],
          [0, -94],
          [66, -66],
        ],
        237.6,
      ],
    ])("positions %s", (_, wheelLayout, n, expected, diameter) => {
      layout(wheelLayout, n);
      expect(positions()).toEqual(expected);
      expect(ringDiameter()).toBeCloseTo(diameter);
      expect(ring().style.height).toBe(ring().style.width);
    });

    it("splits double-ring by double_ring_inner_count", () => {
      layout("double-ring", 3, { double_ring_inner_count: 1 });
      expect(positions()).toEqual([
        [0, -58],
        [0, -94],
        [66, -66],
      ]);
    });

    it("positions at most 7 buttons on an arc, with a warning", () => {
      layout("progressive-arc", 8);
      expect(positions()).toEqual([[0, -58], [37, -44], [-37, -44], [57, -10], [-57, -10], [50, 29], [-50, 29], null]);
      expect(warn).toHaveBeenCalledWith(expect.stringContaining("1 buttons will be hidden"));
    });
  });

  describe("animation", () => {
    const ease = "cubic-bezier(0.175, 0.885, 0.32, 1.275)";

    it("staggers a scale animation by default", () => {
      render([wheel()]);
      expect(buttons().map((b) => b.style.transition)).toEqual(Array(4).fill(`all 0.2s ${ease}`));
      buttons().forEach((b, i) => expect(parseFloat(b.style.transitionDelay)).toBeCloseTo(0.1 + i * 0.05));
      expect(ring().style.transitionDelay).toBe("0.1s");
      expect(ring().style.transitionDuration).toBe("0.2s");
    });

    it("uses configured duration and delay, including zero", () => {
      render([wheel("main", 2, { animation_options: { animation_duration: 0, animation_delay: 0 } })]);
      expect(buttons().map((b) => b.style.transitionDelay)).toEqual(["0s", "0s"]);
      expect(ring().style.transitionDuration).toBe("0s");
    });

    it("clears transitions for the instant animation", () => {
      render([wheel("main", 2, { animation_options: { wheel_animation: "instant" } })]);
      expect(buttons().map((b) => [b.style.transition, b.style.transitionDelay])).toEqual([
        ["", ""],
        ["", ""],
      ]);
    });
  });

  describe("opening and closing", () => {
    it("toggles with the opener and closes from the overlay", () => {
      render([wheel()]);
      const outside = jest.fn();
      h().card.addEventListener("click", outside);

      click(opener());
      expect(isOpen()).toEqual([true, true, true]);
      expect(outside).not.toHaveBeenCalled();

      click(opener());
      expect(isOpen()).toEqual([false, false, false]);

      click(opener());
      click(overlay());
      expect(isOpen()).toEqual([false, false, false]);

      click(overlay());
      expect(isOpen()).toEqual([false, false, false]);
    });

    describe("close on click", () => {
      const open = () => click(opener());

      it.each([
        ["global setting on", { close_on_sub_button_click: true }, {}, true],
        ["per-button true over global off", { close_on_sub_button_click: false }, { close_on_click: true }, true],
        ["per-button false over global on", { close_on_sub_button_click: true }, { close_on_click: false }, false],
        ["neither set", {}, {}, false],
      ])("on a button action: %s", (_, global, perButton, closes) => {
        render([{ wheel_opener: "main", wheel_buttons: [{ sub_button: "1", ...perButton }], ...global }]);
        open();
        sub(1).appendChild(document.createElement("span"));

        hassAction(sub(1).firstElementChild);
        expect(menu().classList.contains("active")).toBe(!closes);
      });

      it("closes on plain click for buttons without a tap action, but not for buttons with one", () => {
        sub(2).dataset.tapAction = JSON.stringify({ action: "toggle" });
        render([
          {
            wheel_opener: "main",
            wheel_buttons: [{ sub_button: "1" }, { sub_button: "2" }],
            close_on_sub_button_click: true,
          },
        ]);

        open();
        click(sub(2));
        expect(menu().classList.contains("active")).toBe(true);
        click(sub(1));
        expect(menu().classList.contains("active")).toBe(false);
      });

      it("ignores actions from buttons outside the wheel", () => {
        render([{ wheel_opener: "main", wheel_buttons: [{ sub_button: "1" }], close_on_sub_button_click: true }]);
        open();
        menu().appendChild(sub(3));
        hassAction(sub(3));
        expect(menu().classList.contains("active")).toBe(true);
      });
    });
  });
});
