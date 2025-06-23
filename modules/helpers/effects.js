import { checkAllConditions } from "./condition.js";

/**
 * Applies a set of visual effects to a given DOM element based on specified conditions.
 *
 * Note: Adding effects to any main element will apply to child elements including icons, ::before, and ::after.
 * Must use separate CSS targeting to apply effects to these child elements, or supply the child element explicitly.
 *
 * @param {HTMLElement} element - The DOM element to which the effects are applied.
 * @param {Object} effects - An object where each property defines an effect with a condition and effect name.
 * @param {string} effects[].effect - The name of the effect to apply as a CSS class.
 * @param {Object} [effects[].condition] - A condition object that determines whether the effect should be applied.
 * @return {void} Does not return a value.
 */
export function applyEffects(element, effects) {
  Object.values(effects).forEach((eff) => {
    if (eff.effect) {
      if (checkAllConditions(eff.condition)) {
        element.classList.add(`progress-effect-${eff.effect}`, "has-effect");
      } else {
        element.classList.remove(`progress-effect-${eff.effect}`);
      }
    }
  });
}
