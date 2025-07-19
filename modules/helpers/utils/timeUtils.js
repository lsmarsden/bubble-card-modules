/**
 * Time utility functions for timeline and time-based modules
 */

/**
 * Convert hours and minutes to percentage of a 24-hour day
 * @param {number} h - Hours (0-23)
 * @param {number} m - Minutes (0-59)
 * @returns {number} Percentage of day (0-100)
 */
export function timeToPercent(h, m) {
  return ((h * 60 + m) / 1440) * 100;
}

/**
 * Parse time string in various formats and return [hours, minutes]
 * @param {string|number} str - Time string in ISO, HH:MM, or numeric format
 * @returns {[number, number]} Array of [hours, minutes]
 */
export function parseTimeString(str) {
  if (!str || typeof str !== "string" || str.trim() === "") return [0, 0];

  const trimmedStr = str.trim();

  // Handle ISO format: 2025-04-23T10:12:23+00:00
  if (trimmedStr.includes("T")) {
    const date = new Date(trimmedStr);
    if (!isNaN(date)) {
      return [date.getHours(), date.getMinutes()];
    }
  }

  // Handle HH:MM format
  if (trimmedStr.includes(":")) {
    const [h, m] = trimmedStr.split(":").map(Number);
    return [h || 0, m || 0];
  }

  // Handle numeric time formats (minutes since midnight)
  const num = parseFloat(trimmedStr);
  if (!isNaN(num) && Number.isInteger(num)) {
    const totalMinutes = parseInt(trimmedStr);
    return [Math.floor(totalMinutes / 60), totalMinutes % 60];
  }

  return [0, 0];
}

/**
 * Format time according to configuration options
 * @param {number} h - Hours (0-23)
 * @param {number} m - Minutes (0-59)
 * @param {Object} options - Formatting options
 * @param {boolean} options.use_24_hour - Use 24-hour format
 * @param {boolean} options.append_suffix - Display AM/PM
 * @param {boolean} options.pad_hours - Zero-pad hours (e.g., 05:00)
 * @param {boolean} options.show_minutes - Show minutes in output
 * @returns {string} Formatted time string
 */
export function formatTime(h, m, options = {}) {
  const { use_24_hour = true, append_suffix = false, pad_hours = true, show_minutes = true } = options;

  let hour = h;
  const suffix = hour >= 12 ? "PM" : "AM";

  if (!use_24_hour) {
    hour = hour % 12;
    if (hour === 0) hour = 12;
  }

  const pad = (n) => String(n).padStart(2, "0");
  let hourStr = pad_hours ? pad(hour) : hour;

  return `${hourStr}${show_minutes ? ":" + pad(m) : ""}${append_suffix ? suffix : ""}`;
}

/**
 * Convert HH:MM:SS time string to total seconds
 * @param {string} timeString - Time in HH:MM:SS format
 * @returns {number} Total seconds
 */
export function parseHHMMSSToSeconds(timeString) {
  if (!timeString || typeof timeString !== "string") return 0;

  const parts = timeString.split(":");
  if (parts.length !== 3) return 0;

  const [hours, minutes, seconds] = parts.map(Number);
  if (isNaN(hours) || isNaN(minutes) || isNaN(seconds)) return 0;

  return hours * 3600 + minutes * 60 + seconds;
}
