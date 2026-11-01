/**
 * Card harness: the shared test fixture for running a module the way Bubble Card does.
 *
 * Mirrors the upstream `code:` scope (Bubble Card v3.4.3): `this` is the card instance
 * (it carries `config`), `hass` is a free variable, and on 3.3+ `onTeardown` and
 * `hasChanged` are in scope too. Builds card DOM using upstream class names.
 */
import { jest } from "@jest/globals";

const DEFAULT_NOW = "2025-07-01T12:00:00Z";

function buildCard(type, subButtons) {
  const card = document.createElement("div");
  card.className = "bubble-card";

  if (type === "separator") {
    const line = document.createElement("div");
    line.className = "bubble-line";
    line.style.height = "2px";
    card.appendChild(line);
    return card;
  }

  const icon = document.createElement("div");
  icon.className = "bubble-main-icon-container bubble-icon-container icon-container";
  card.appendChild(icon);

  for (let i = 1; i <= subButtons; i++) {
    const sub = document.createElement("div");
    sub.className = `bubble-sub-button bubble-sub-button-${i}`;
    card.appendChild(sub);
  }
  return card;
}

function toComputedStyle(props) {
  const camel = (name) => name.replace(/-([a-z])/g, (_, c) => c.toUpperCase());
  const style = { getPropertyValue: (name) => props[name] ?? props[camel(name)] ?? "" };
  for (const [key, value] of Object.entries(props)) style[camel(key)] = value;
  return style;
}

/**
 * @param {object} [options]
 * @param {"button"|"separator"} [options.type="button"] Card markup to build.
 * @param {number} [options.subButtons=4] Number of sub-buttons on a button card.
 * @param {object} [options.states={}] hass states: `{ "sensor.x": "42" }` or `{ "sensor.x": { state, attributes } }`.
 * @param {object|function} [options.computedStyle={}] CSS properties `getComputedStyle` reports, or `(element) => props`.
 * @param {{width:number,height:number}} [options.rect] Size `getBoundingClientRect` reports for every element.
 * @param {string|null} [options.now] Pinned clock (fake timers). `null` keeps real timers.
 * @param {"3.3+"|"legacy"} [options.mode="3.3+"] Whether `onTeardown` and `hasChanged` are in scope.
 */
export function createCardHarness(options = {}) {
  const {
    type = "button",
    subButtons = 4,
    states = {},
    computedStyle = {},
    rect,
    now = DEFAULT_NOW,
    mode = "3.3+",
  } = options;

  document.body.innerHTML = "";
  const card = buildCard(type, subButtons);
  document.body.appendChild(card);

  const hass = { states: {} };
  const host = { config: {} };
  const teardowns = new Map();
  const gates = new Map();
  let currentModule = null;

  if (now !== null) {
    jest.useFakeTimers({ now: new Date(now) });
  }

  global.hass = hass;
  global.getComputedStyle = jest.fn((element) =>
    toComputedStyle(typeof computedStyle === "function" ? computedStyle(element) : computedStyle),
  );
  global.requestAnimationFrame = jest.fn((callback) => {
    callback();
    return 1;
  });

  let rectSpy;
  if (rect) {
    rectSpy = jest
      .spyOn(Element.prototype, "getBoundingClientRect")
      .mockReturnValue({ ...rect, top: 0, left: 0, right: rect.width, bottom: rect.height, x: 0, y: 0 });
  }

  if (mode === "3.3+") {
    global.onTeardown = jest.fn((fn) => teardowns.set(currentModule, fn));
    global.hasChanged = jest.fn((label, ...values) => {
      const key = `${currentModule}::${label}`;
      const signature = JSON.stringify(values);
      if (gates.get(key) === signature) return false;
      gates.set(key, signature);
      return true;
    });
  } else {
    delete global.onTeardown;
    delete global.hasChanged;
  }

  const harness = {
    card,
    hass,
    host,

    /** Set an entity's state (string) or state object; `attributes` defaults to `{}` as in Home Assistant. */
    setState(entityId, value) {
      const stateObj = typeof value === "object" && value !== null ? value : { state: String(value) };
      hass.states[entityId] = { attributes: {}, ...stateObj };
      return harness;
    },

    setStates(map) {
      for (const [id, value] of Object.entries(map)) harness.setState(id, value);
      return harness;
    },

    /** Run a module function with its config, as one Bubble Card style pass. */
    run(moduleFn, config) {
      if (arguments.length > 1) host.config = { [moduleFn.name]: config };
      currentModule = moduleFn.name;
      moduleFn.call(host, card, hass);
      return harness;
    },

    $(selector) {
      return card.querySelector(selector);
    },

    $$(selector) {
      return Array.from(card.querySelectorAll(selector));
    },

    /** Advance the pinned clock (requires `now` to be set). */
    tick(ms) {
      jest.advanceTimersByTime(ms);
      return harness;
    },

    /** Fire every registered teardown, as Bubble Card does when the card goes away. */
    teardown() {
      for (const fn of teardowns.values()) fn();
      teardowns.clear();
      return harness;
    },

    teardownCount() {
      return teardowns.size;
    },

    /** Detach the card from the document. */
    disconnect() {
      card.remove();
      return harness;
    },

    cleanup() {
      if (now !== null) {
        jest.clearAllTimers();
        jest.useRealTimers();
      }
      rectSpy?.mockRestore();
      delete global.hass;
      delete global.getComputedStyle;
      delete global.requestAnimationFrame;
      delete global.onTeardown;
      delete global.hasChanged;
      document.body.innerHTML = "";
    },
  };

  harness.setStates(states);
  return harness;
}

/**
 * Register a harness per test: returns a getter for the current harness.
 *
 *   const h = useCardHarness({ type: "separator" });
 *   it("...", () => { h().run(module, config); });
 */
export function useCardHarness(options) {
  let current;
  beforeEach(() => {
    current = createCardHarness(typeof options === "function" ? options() : options);
  });
  afterEach(() => current.cleanup());
  return () => current;
}

/**
 * Register Home Assistant states as the global `hass` per test, for helper tests that need no card.
 * Returns a setter for changing states within a test.
 *
 *   const setState = useHass({ "sensor.x": "42" });
 */
export function useHass(states = {}) {
  const toStateObj = (value) => ({
    attributes: {},
    ...(typeof value === "object" && value !== null ? value : { state: String(value) }),
  });
  beforeEach(() => {
    global.hass = { states: Object.fromEntries(Object.entries(states).map(([id, v]) => [id, toStateObj(v)])) };
  });
  afterEach(() => delete global.hass);
  return (entityId, value) => {
    global.hass.states[entityId] = toStateObj(value);
  };
}
