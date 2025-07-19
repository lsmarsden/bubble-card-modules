import { getDomain, getState } from "./hass.js";

export function isActiveTimer(progressSource) {
  return isTimerEntity(progressSource) && getState(progressSource) === "active";
}

export function isTimerEntity(progressSource) {
  return getDomain(progressSource) === "timer";
}
