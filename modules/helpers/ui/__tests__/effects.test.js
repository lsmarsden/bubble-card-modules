import { applyEffects } from "../effects.js";
import { useHass } from "../../../../testing/cardHarness.js";

useHass({ "sensor.on": "on", "sensor.off": "off" });

const on = { condition: "state", entity: "sensor.on", state: "on" };
const off = { condition: "state", entity: "sensor.off", state: "on" };
let element;
beforeEach(() => {
  element = document.createElement("div");
});
const classes = () => [...element.classList];

describe("applyEffects", () => {
  it.each([
    ["no effects", {}],
    ["an entry without effect", { a: { effect: null, condition: on } }],
  ])("does nothing for %s", (_, effects) => {
    applyEffects(element, effects);
    expect(classes()).toEqual([]);
  });

  it("adds a class per effect whose condition holds (or has none)", () => {
    applyEffects(element, [{ effect: "pulse", condition: on }, { effect: "glow", condition: off }, { effect: "spin" }]);
    expect(classes()).toEqual(["progress-effect-pulse", "has-effect", "progress-effect-spin"]);
  });

  it("removes an effect's class once its condition stops holding, leaving has-effect", () => {
    element.classList.add("progress-effect-glow", "has-effect");
    applyEffects(element, { glow: { effect: "glow", condition: off } });
    expect(classes()).toEqual(["has-effect"]);
  });
});
