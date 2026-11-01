import { getAttributes, getDomain, getState } from "./hass.js";
import { parseHHMMSSToSeconds } from "../utils/timeUtils.js";

/**
 * Progress reading: turns a progress source into the percent to display, and keeps it current.
 *
 * Shows progress on `element` by calling `render(percent)` now, with `percent` in 0–100 after
 * scaling, clamping and invert. While the source is an active timer, a ticker calls the latest
 * `render` with fresh progress every second; it stops when the source stops being an active timer,
 * on `stopProgress`, when Bubble Card tears the card down, or once `element` leaves the page.
 *
 * @param {Object} ctx - `{ host, onTeardown }`: `host` is the card instance (`this` in module code),
 *   `onTeardown` is Bubble Card's teardown hook when available (3.3.0+), otherwise undefined.
 * @param {HTMLElement} element - The element the progress is drawn on (one ticker per element).
 * @param {Object} options - Progress options, named as in module config:
 * @param {string|Object} options.source - Progress source: entity, `entity[attribute]`, timer, or raw value.
 * @param {number|string} [options.start=0] - Value (or entity) mapped to 0%.
 * @param {number|string} [options.end=100] - Value (or entity) mapped to 100%.
 * @param {number|string} [options.override] - Percent (or entity) to show instead of the source.
 * @param {boolean} [options.invert=false] - Show `100 - percent`.
 * @param {function(number): void} render - Draws the given percent.
 */
export function showProgress(ctx, element, options, render) {
  render(readProgress(options));

  const tickers = progressTickers(ctx);
  if (options.override != null || !isActiveTimer(options.source)) {
    stopTicker(tickers, element);
    return;
  }

  let ticker = tickers.get(element);
  if (!ticker) {
    ticker = {};
    ticker.id = setInterval(() => {
      if (!element.isConnected) {
        stopTicker(tickers, element);
        return;
      }
      ticker.update();
    }, 1000);
    tickers.set(element, ticker);
  }
  // Replaced on every pass: Bubble Card hands each pass a fresh `hass`, and config may have changed.
  ticker.update = () => render(readProgress(options));

  if (typeof ctx.onTeardown === "function") {
    ctx.onTeardown(() => stopAllTickers(tickers));
  }
}

/**
 * Stops the ticker `showProgress` started for `element`, if any.
 *
 * @param {Object} ctx - The same `{ host, onTeardown }` passed to `showProgress`.
 * @param {HTMLElement} element - The element whose progress should stop updating.
 */
export function stopProgress(ctx, element) {
  stopTicker(progressTickers(ctx), element);
}

function progressTickers(ctx) {
  if (!ctx.host._progressTickers) {
    ctx.host._progressTickers = new Map();
  }
  return ctx.host._progressTickers;
}

function stopTicker(tickers, element) {
  const ticker = tickers.get(element);
  if (!ticker) return;
  clearInterval(ticker.id);
  tickers.delete(element);
}

function stopAllTickers(tickers) {
  tickers.forEach((ticker) => clearInterval(ticker.id));
  tickers.clear();
}

function isActiveTimer(source) {
  return getDomain(source) === "timer" && getState(source) === "active";
}

function readProgress(options) {
  const percent = options.override != null ? parseFloat(getState(options.override)) : readSourcePercent(options);
  const clamped = isNaN(percent) ? 0 : Math.max(0, Math.min(100, percent));
  return options.invert ? 100 - clamped : clamped;
}

function readSourcePercent(options) {
  if (getDomain(options.source) === "timer") {
    return readTimerPercent(options.source);
  }

  let start = parseFloat(getState(options.start));
  let end = parseFloat(getState(options.end));
  start = isNaN(start) ? 0 : start;
  end = isNaN(end) ? 100 : end;

  let value = parseFloat(getState(options.source));
  if (isNaN(value) || value < start) value = start;
  if (value > end) value = end;

  return ((value - start) / (end - start)) * 100;
}

function readTimerPercent(timer) {
  const state = getState(timer);
  const attributes = getAttributes(timer);
  if (!attributes) return 0;

  const durationSeconds = parseHHMMSSToSeconds(attributes.duration);
  if (durationSeconds === 0) return 0;

  let remainingSeconds;
  if (state === "active" && attributes.finishes_at) {
    remainingSeconds = (new Date(attributes.finishes_at).getTime() - Date.now()) / 1000;
  } else if (state === "paused" && attributes.remaining) {
    remainingSeconds = parseHHMMSSToSeconds(attributes.remaining);
  } else {
    return 0;
  }

  return ((durationSeconds - remainingSeconds) / durationSeconds) * 100;
}
