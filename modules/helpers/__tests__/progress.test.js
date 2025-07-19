import { jest } from "@jest/globals";

jest.unstable_mockModule("../hass.js", () => ({
  getState: jest.fn(),
  getDomain: jest.fn(),
  getAttributes: jest.fn(),
}));

const { calculateProgressValue } = await import("../progress.js");
const hass = await import("../hass.js");

describe("calculateProgressValue", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("timer entity progress", () => {
    it("should calculate progress for active timer based on current time", () => {
      // Setup - Active timer that started 30 minutes ago with 1 hour duration
      const mockCurrentTime = new Date("2023-10-01T12:30:00Z");
      const OriginalDate = global.Date;
      global.Date = jest.fn((dateString) => {
        if (dateString) {
          return new OriginalDate(dateString);
        }
        return mockCurrentTime;
      });
      global.Date.now = jest.fn(() => mockCurrentTime.getTime());

      hass.getDomain.mockReturnValue("timer");
      hass.getState.mockReturnValue("active");
      hass.getAttributes.mockReturnValue({
        duration: "01:00:00", // 1 hour total
        finishes_at: "2023-10-01T13:00:00+00:00", // finishes in 30 minutes
      });

      // Exercise
      const result = calculateProgressValue("timer.test");

      // Verify - Should be 50% complete (30 minutes of 60 minutes elapsed)
      expect(result).toBe(50);
      expect(hass.getDomain).toHaveBeenCalledWith("timer.test");
      expect(hass.getState).toHaveBeenCalledWith("timer.test");
      expect(hass.getAttributes).toHaveBeenCalledWith("timer.test");

      // Cleanup
      global.Date = OriginalDate;
    });

    it("should calculate progress for paused timer using remaining time", () => {
      // Setup - Paused timer with 45 minutes remaining out of 1 hour
      hass.getDomain.mockReturnValue("timer");
      hass.getState.mockReturnValue("paused");
      hass.getAttributes.mockReturnValue({
        duration: "01:00:00", // 1 hour total
        remaining: "00:45:00", // 45 minutes left
      });

      // Exercise
      const result = calculateProgressValue("timer.test");

      // Verify - Should be 25% complete (15 minutes of 60 minutes elapsed)
      expect(result).toBe(25);
      expect(hass.getDomain).toHaveBeenCalledWith("timer.test");
      expect(hass.getState).toHaveBeenCalledWith("timer.test");
      expect(hass.getAttributes).toHaveBeenCalledWith("timer.test");
    });

    it("should return 0 for idle timer", () => {
      // Setup - Idle timer
      hass.getDomain.mockReturnValue("timer");
      hass.getState.mockReturnValue("idle");

      // Exercise
      const result = calculateProgressValue("timer.test");

      // Verify - Should be 0% (cannot determine progress for idle timer)
      expect(result).toBe(0);
      expect(hass.getDomain).toHaveBeenCalledWith("timer.test");
      expect(hass.getState).toHaveBeenCalledWith("timer.test");
    });

    it("should return 0 for timer in any other state", () => {
      // Setup - Timer in unknown state
      hass.getDomain.mockReturnValue("timer");
      hass.getState.mockReturnValue("finished");

      // Exercise
      const result = calculateProgressValue("timer.test");

      // Verify - Should be 0% (unknown state)
      expect(result).toBe(0);
      expect(hass.getDomain).toHaveBeenCalledWith("timer.test");
      expect(hass.getState).toHaveBeenCalledWith("timer.test");
    });

    it("should handle active timer that has completed (current time past finishes_at)", () => {
      // Setup - Active timer that should have finished already
      const mockCurrentTime = new Date("2023-10-01T13:30:00Z");
      const OriginalDate = global.Date;
      global.Date = jest.fn((dateString) => {
        if (dateString) {
          return new OriginalDate(dateString);
        }
        return mockCurrentTime;
      });
      global.Date.now = jest.fn(() => mockCurrentTime.getTime());

      hass.getDomain.mockReturnValue("timer");
      hass.getState.mockReturnValue("active");
      hass.getAttributes.mockReturnValue({
        duration: "01:00:00", // 1 hour total
        finishes_at: "2023-10-01T13:00:00+00:00", // finished 30 minutes ago
      });

      // Exercise
      const result = calculateProgressValue("timer.test");

      // Verify - Should be 100% complete (timer overdue)
      expect(result).toBe(100);

      // Cleanup
      global.Date = OriginalDate;
    });

    it("should handle active timer that just started", () => {
      // Setup - Active timer that just started
      const mockCurrentTime = new Date("2023-10-01T12:00:00Z");
      const OriginalDate = global.Date;
      global.Date = jest.fn((dateString) => {
        if (dateString) {
          return new OriginalDate(dateString);
        }
        return mockCurrentTime;
      });
      global.Date.now = jest.fn(() => mockCurrentTime.getTime());

      hass.getDomain.mockReturnValue("timer");
      hass.getState.mockReturnValue("active");
      hass.getAttributes.mockReturnValue({
        duration: "01:00:00", // 1 hour total
        finishes_at: "2023-10-01T13:00:00+00:00", // finishes in 1 hour
      });

      // Exercise
      const result = calculateProgressValue("timer.test");

      // Verify - Should be 0% complete (just started)
      expect(result).toBe(0);

      // Cleanup
      global.Date = OriginalDate;
    });
  });

  describe("non-timer entity progress (existing functionality)", () => {
    it("should calculate progress for numeric entity using default range", () => {
      // Setup - Regular numeric entity (not a timer)
      hass.getDomain.mockReturnValue("sensor");
      hass.getState
        .mockReturnValueOnce("75") // progressSource value
        .mockReturnValueOnce("0") // start value (default)
        .mockReturnValueOnce("100"); // end value (default)

      // Exercise
      const result = calculateProgressValue("sensor.test");

      // Verify - Should be 75% (75 out of default 0-100 range)
      expect(result).toBe(75);
      expect(hass.getDomain).toHaveBeenCalledWith("sensor.test");
      expect(hass.getState).toHaveBeenCalledWith("sensor.test");
    });

    it("should calculate progress for numeric entity using custom range", () => {
      // Setup - Regular numeric entity with custom range
      hass.getDomain.mockReturnValue("sensor");
      hass.getState
        .mockReturnValueOnce("50") // progressSource value
        .mockReturnValueOnce("0") // start value
        .mockReturnValueOnce("200"); // end value

      // Exercise
      const result = calculateProgressValue("sensor.test", { start: 0, end: 200 });

      // Verify - Should be 25% (50 out of 0-200 range)
      expect(result).toBe(25);
    });

    it("should clamp progress value to start value when below minimum (line 21)", () => {
      // Setup - Progress value below start value
      hass.getDomain.mockReturnValue("sensor");
      hass.getState
        .mockReturnValueOnce("-10") // progressSource value (below start)
        .mockReturnValueOnce("0") // start value
        .mockReturnValueOnce("100"); // end value

      // Exercise
      const result = calculateProgressValue("sensor.test");

      // Verify - Should be 0% (clamped to start value)
      expect(result).toBe(0);
    });

    it("should clamp progress value to start value when NaN (line 21)", () => {
      // Setup - Progress value is NaN (non-numeric)
      hass.getDomain.mockReturnValue("sensor");
      hass.getState
        .mockReturnValueOnce("not_a_number") // progressSource value (NaN)
        .mockReturnValueOnce("10") // start value
        .mockReturnValueOnce("100"); // end value

      // Exercise
      const result = calculateProgressValue("sensor.test");

      // Verify - Should be 0% (clamped to start value of 10, which gives 0% progress)
      expect(result).toBe(0);
    });

    it("should clamp progress value to end value when above maximum (line 24)", () => {
      // Setup - Progress value above end value
      hass.getDomain.mockReturnValue("sensor");
      hass.getState
        .mockReturnValueOnce("150") // progressSource value (above end)
        .mockReturnValueOnce("0") // start value
        .mockReturnValueOnce("100"); // end value

      // Exercise
      const result = calculateProgressValue("sensor.test");

      // Verify - Should be 100% (clamped to end value)
      expect(result).toBe(100);
    });

    it("should handle NaN start and end values (lines 17-18)", () => {
      // Setup - Start and end values are NaN
      hass.getDomain.mockReturnValue("sensor");
      hass.getState
        .mockReturnValueOnce("50") // progressSource value
        .mockReturnValueOnce("not_a_number") // start value (NaN)
        .mockReturnValueOnce("also_not_a_number"); // end value (NaN)

      // Exercise
      const result = calculateProgressValue("sensor.test");

      // Verify - Should be 50% (start defaults to 0, end defaults to 100)
      expect(result).toBe(50);
    });
  });

  describe("timer entity edge cases", () => {
    it("should return 0 when timer state is null (line 35)", () => {
      // Setup - Timer with null state
      hass.getDomain.mockReturnValue("timer");
      hass.getState.mockReturnValue(null);
      hass.getAttributes.mockReturnValue({
        duration: "01:00:00",
      });

      // Exercise
      const result = calculateProgressValue("timer.test");

      // Verify - Should be 0% (no valid timer state)
      expect(result).toBe(0);
    });

    it("should return 0 when timer attributes are null (line 35)", () => {
      // Setup - Timer with null attributes
      hass.getDomain.mockReturnValue("timer");
      hass.getState.mockReturnValue("active");
      hass.getAttributes.mockReturnValue(null);

      // Exercise
      const result = calculateProgressValue("timer.test");

      // Verify - Should be 0% (no valid attributes)
      expect(result).toBe(0);
    });

    it("should return 0 when active timer has no duration (line 43)", () => {
      // Setup - Active timer missing duration attribute
      hass.getDomain.mockReturnValue("timer");
      hass.getState.mockReturnValue("active");
      hass.getAttributes.mockReturnValue({
        finishes_at: "2023-10-01T13:00:00+00:00",
        // missing duration
      });

      // Exercise
      const result = calculateProgressValue("timer.test");

      // Verify - Should be 0% (missing duration)
      expect(result).toBe(0);
    });

    it("should return 0 when active timer has no finishes_at (line 43)", () => {
      // Setup - Active timer missing finishes_at attribute
      hass.getDomain.mockReturnValue("timer");
      hass.getState.mockReturnValue("active");
      hass.getAttributes.mockReturnValue({
        duration: "01:00:00",
        // missing finishes_at
      });

      // Exercise
      const result = calculateProgressValue("timer.test");

      // Verify - Should be 0% (missing finishes_at)
      expect(result).toBe(0);
    });

    it("should return 0 when active timer has zero duration (line 49)", () => {
      // Setup - Active timer with zero duration
      hass.getDomain.mockReturnValue("timer");
      hass.getState.mockReturnValue("active");
      hass.getAttributes.mockReturnValue({
        duration: "00:00:00", // zero duration
        finishes_at: "2023-10-01T13:00:00+00:00",
      });

      // Exercise
      const result = calculateProgressValue("timer.test");

      // Verify - Should be 0% (zero duration)
      expect(result).toBe(0);
    });

    it("should return 0 when paused timer has no duration (line 63)", () => {
      // Setup - Paused timer missing duration attribute
      hass.getDomain.mockReturnValue("timer");
      hass.getState.mockReturnValue("paused");
      hass.getAttributes.mockReturnValue({
        remaining: "00:30:00",
        // missing duration
      });

      // Exercise
      const result = calculateProgressValue("timer.test");

      // Verify - Should be 0% (missing duration)
      expect(result).toBe(0);
    });

    it("should return 0 when paused timer has no remaining (line 63)", () => {
      // Setup - Paused timer missing remaining attribute
      hass.getDomain.mockReturnValue("timer");
      hass.getState.mockReturnValue("paused");
      hass.getAttributes.mockReturnValue({
        duration: "01:00:00",
        // missing remaining
      });

      // Exercise
      const result = calculateProgressValue("timer.test");

      // Verify - Should be 0% (missing remaining)
      expect(result).toBe(0);
    });

    it("should return 0 when paused timer has zero duration (line 68)", () => {
      // Setup - Paused timer with zero duration
      hass.getDomain.mockReturnValue("timer");
      hass.getState.mockReturnValue("paused");
      hass.getAttributes.mockReturnValue({
        duration: "00:00:00", // zero duration
        remaining: "00:00:00",
      });

      // Exercise
      const result = calculateProgressValue("timer.test");

      // Verify - Should be 0% (zero duration)
      expect(result).toBe(0);
    });
  });
});
