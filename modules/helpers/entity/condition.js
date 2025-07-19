import { getState } from "./hass.js";

/**
 * Evaluates whether all specified conditions are met.
 *
 * @param {Array|Object|null|undefined} cProp - A condition or an array of conditions to be evaluated. Can be null or undefined.
 * @return {boolean} True if all conditions are met or if no conditions are provided, false otherwise.
 */
export function checkAllConditions(cProp) {
  if (!cProp) return true;
  if (Array.isArray(cProp)) {
    return cProp.every((condition) => evaluateSingleCondition(condition));
  }
  return evaluateSingleCondition(cProp);
}

function evaluateSingleCondition(condObj) {
  if (!condObj || typeof condObj !== "object") return false;
  if (!condObj.condition) return false;
  const t = condObj.condition;
  switch (t) {
    case "state": {
      const state = getState(condObj, false);
      if (state === undefined) return false;
      if (Array.isArray(condObj.state)) {
        return condObj.state.includes(state);
      }
      return state === condObj.state;
    }
    case "numeric_state": {
      const numVal = parseFloat(getState(condObj));
      if (isNaN(numVal)) return false;

      const aboveVal = parseFloat(getState(condObj.above));
      if (!isNaN(aboveVal) && numVal <= aboveVal) {
        return false;
      }

      const belowVal = parseFloat(getState(condObj.below));
      if (!isNaN(belowVal) && numVal >= belowVal) {
        return false;
      }

      return true;
    }
    case "exists":
      return getState(condObj) !== undefined;
    case "and":
      if (!Array.isArray(condObj.conditions)) return false;
      return condObj.conditions.every((sc) => evaluateSingleCondition(sc));
    case "or":
      if (!Array.isArray(condObj.conditions)) return false;
      return condObj.conditions.some((sc) => evaluateSingleCondition(sc));
    case "not":
      if (Array.isArray(condObj.conditions) && condObj.conditions.length > 0) {
        return !evaluateSingleCondition(condObj.conditions[0]);
      }
      if (condObj.conditions) {
        return !evaluateSingleCondition(condObj.conditions);
      }
      return false;
    default:
      return false;
  }
}
