import { checkAllConditions } from "../condition.js";
import { useHass } from "../../../../testing/cardHarness.js";

useHass({
  "sensor.on": "on",
  "sensor.off": "off",
  "sensor.value": "6",
  "sensor.text": "abc",
  "sensor.five": "5",
  "sensor.ten": "10",
  "sensor.attrs": { state: "on", attributes: { mode: "eco" } },
});

const state = (entity, value) => ({ condition: "state", entity, state: value });
const numeric = (entity, thresholds) => ({ condition: "numeric_state", entity, ...thresholds });
const isOn = state("sensor.on", "on");
const isOff = state("sensor.off", "on");

describe("checkAllConditions", () => {
  it.each([
    ["undefined", undefined, true],
    ["null", null, true],
    ["an empty list", [], true],
    ["a list where all hold", [isOn, state("sensor.off", "off")], true],
    ["a list where one fails", [isOn, isOff], false],
    ["a string", "string", false],
    ["a number", 123, false],
    ["an object without condition", { entity: "sensor.on" }, false],
    ["an unknown condition type", { condition: "unsupported", entity: "sensor.on" }, false],
  ])("given %s → %s", (_, input, expected) => {
    expect(checkAllConditions(input)).toBe(expected);
  });

  it.each([
    ["matching state", state("sensor.on", "on"), true],
    ["different state", state("sensor.off", "on"), false],
    ["state in a list", state("sensor.on", ["on", "active"]), true],
    ["state not in a list", state("sensor.off", ["on", "active"]), false],
    ["a missing entity", state("sensor.missing", "on"), false],
    [
      "an attribute (entity_id + attribute)",
      { condition: "state", entity_id: "sensor.attrs", attribute: "mode", state: "eco" },
      true,
    ],
  ])("state: %s → %s", (_, condition, expected) => {
    expect(checkAllConditions(condition)).toBe(expected);
  });

  it.each([
    ["above", { above: 5 }, true],
    ["equal to above", { above: 6 }, false],
    ["below above", { above: 7 }, false],
    ["below", { below: 10 }, true],
    ["equal to below", { below: 6 }, false],
    ["above below", { below: 5 }, false],
    ["between", { above: 5, below: 10 }, true],
    ["at the lower bound", { above: 6, below: 10 }, false],
    ["entity thresholds", { above: "sensor.five", below: "sensor.ten" }, true],
    ["non-numeric thresholds, ignored", { above: "foo", below: "bar" }, true],
  ])("numeric_state: %s → %s", (_, thresholds, expected) => {
    expect(checkAllConditions(numeric("sensor.value", thresholds))).toBe(expected);
  });

  it("numeric_state: fails for a non-numeric state", () => {
    expect(checkAllConditions(numeric("sensor.text", { above: 5 }))).toBe(false);
  });

  // Current behaviour: getState falls back to the raw condition object, so `exists` never fails. Tracked separately.
  it.each([
    ["an existing entity", "sensor.on", true],
    ["a missing entity", "sensor.missing", true],
    ["no entity", undefined, true],
  ])("exists: %s → %s", (_, entity, expected) => {
    expect(checkAllConditions({ condition: "exists", entity })).toBe(expected);
  });

  it.each([
    ["and: all hold", "and", [isOn, isOn], true],
    ["and: one fails", "and", [isOn, isOff], false],
    ["and: empty", "and", [], true],
    ["and: not a list", "and", null, false],
    ["or: one holds", "or", [isOff, isOn], true],
    ["or: none hold", "or", [isOff, isOff], false],
    ["or: empty", "or", [], false],
    ["or: not a list", "or", null, false],
    ["not: negates a list's first entry", "not", [isOff], true],
    ["not: negates a single condition", "not", isOn, false],
    ["not: null", "not", null, false],
    ["not: missing", "not", undefined, false],
  ])("%s → %s", (_, condition, conditions, expected) => {
    expect(checkAllConditions({ condition, conditions })).toBe(expected);
  });
});
