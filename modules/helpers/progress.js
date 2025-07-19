import { getAttributes, getDomain, getState } from "./hass.js";
import { parseHHMMSSToSeconds } from "./timeUtils.js";

// progress option object must contain `start` and `end` properties
export function calculateProgressValue(progressSource, progressOptions = { start: 0, end: 100 }) {
  // Check if this is a timer entity
  const domain = getDomain(progressSource);
  if (domain === "timer") {
    return calculateTimerProgress(progressSource);
  }

  // Existing numeric progress calculation
  let progressValue = parseFloat(getState(progressSource));
  let startValue = parseFloat(getState(progressOptions.start));
  let endValue = parseFloat(getState(progressOptions.end));

  startValue = isNaN(startValue) ? 0 : startValue;
  endValue = isNaN(endValue) ? 100 : endValue;

  if (isNaN(progressValue) || progressValue < startValue) {
    progressValue = startValue;
  }
  if (progressValue > endValue) {
    progressValue = endValue;
  }

  return ((progressValue - startValue) / (endValue - startValue)) * 100;
}

function calculateTimerProgress(timer) {
  const timerState = getState(timer);
  const attributes = getAttributes(timer);

  if (!timerState || !attributes) {
    return 0;
  }

  if (timerState === "active") {
    // Calculate progress based on current time, duration, and finishes_at
    const duration = attributes.duration;
    const finishesAt = attributes.finishes_at;

    if (!duration || !finishesAt) return 0;

    const durationSeconds = parseHHMMSSToSeconds(duration);
    const finishTime = new Date(finishesAt);
    const currentTime = new Date();

    if (durationSeconds === 0) return 0;

    // Calculate remaining time and then elapsed time
    const remainingSeconds = (finishTime.getTime() - currentTime.getTime()) / 1000;
    const elapsedSeconds = durationSeconds - remainingSeconds;

    // Clamp between 0 and 100%
    return Math.max(0, Math.min(100, (elapsedSeconds / durationSeconds) * 100));
  } else if (timerState === "paused") {
    // Calculate progress based on duration and remaining
    const duration = attributes.duration;
    const remaining = attributes.remaining;

    if (!duration || !remaining) return 0;

    const durationSeconds = parseHHMMSSToSeconds(duration);
    const remainingSeconds = parseHHMMSSToSeconds(remaining);

    if (durationSeconds === 0) return 0;

    const elapsedSeconds = durationSeconds - remainingSeconds;
    return Math.max(0, Math.min(100, (elapsedSeconds / durationSeconds) * 100));
  }

  // All other states (idle, finished, etc.) return 0
  return 0;
}
