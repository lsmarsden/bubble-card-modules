import { jest } from "@jest/globals";

jest.unstable_mockModule("../../entity/timer.js", () => ({
  isActiveTimer: jest.fn(),
}));

const { manageTimerUpdater } = await import("../timerUpdater.js");
const timer = await import("../../entity/timer.js");

describe("manageTimerUpdater()", () => {
  let mockElement;
  let mockUpdateFn;

  beforeEach(() => {
    // Mock timer functions for these tests
    jest.useFakeTimers();
    jest.spyOn(global, "setInterval");
    jest.spyOn(global, "clearInterval");

    // Create mock DOM element
    mockElement = {
      dataset: {},
      removeAttribute: jest.fn(),
    };

    // Create mock update function
    mockUpdateFn = jest.fn();

    // Reset timer helper mock
    timer.isActiveTimer.mockReturnValue(false);
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
    jest.restoreAllMocks();
  });

  describe("setting interval for active timers", () => {
    it("should set interval for active timer without existing interval", () => {
      // Setup - Active timer, no existing interval
      timer.isActiveTimer.mockReturnValue(true);
      expect(mockElement.dataset.progress_update_interval).toBeUndefined();

      // Exercise - Call the function
      manageTimerUpdater(mockElement, "timer.cooking", mockUpdateFn);

      // Verify - setInterval should be called
      expect(setInterval).toHaveBeenCalledWith(mockUpdateFn, 1000);

      // Verify - data attribute should be set to interval ID
      expect(mockElement.dataset.progress_update_interval).toBeTruthy();
      expect(typeof mockElement.dataset.progress_update_interval).toBe("number"); // Should be numeric interval ID
    });

    it("should not set duplicate interval for active timer with existing interval", () => {
      // Setup - Active timer with existing interval
      timer.isActiveTimer.mockReturnValue(true);
      mockElement.dataset.progress_update_interval = "123"; // Existing interval

      // Exercise - Call the function
      manageTimerUpdater(mockElement, "timer.cooking", mockUpdateFn);

      // Verify - setInterval should NOT be called
      expect(setInterval).not.toHaveBeenCalled();

      // Verify - existing data attribute should remain unchanged
      expect(mockElement.dataset.progress_update_interval).toBe("123");
    });
  });

  describe("clearing interval for inactive timers", () => {
    it("should clear interval for inactive timer with existing interval", () => {
      // Setup - Inactive timer with existing interval
      timer.isActiveTimer.mockReturnValue(false);
      mockElement.dataset.progress_update_interval = "456"; // Existing interval

      // Exercise - Call the function
      manageTimerUpdater(mockElement, "timer.cooking", mockUpdateFn);

      // Verify - clearInterval should be called with interval ID
      expect(clearInterval).toHaveBeenCalledWith("456");

      // Verify - data attribute should be removed
      expect(mockElement.removeAttribute).toHaveBeenCalledWith("data-progress_update_interval");
    });

    it("should not clear interval for inactive timer without existing interval", () => {
      // Setup - Inactive timer, no existing interval
      timer.isActiveTimer.mockReturnValue(false);
      expect(mockElement.dataset.progress_update_interval).toBeUndefined();

      // Exercise - Call the function
      manageTimerUpdater(mockElement, "timer.cooking", mockUpdateFn);

      // Verify - clearInterval should NOT be called
      expect(clearInterval).not.toHaveBeenCalled();

      // Verify - removeAttribute should NOT be called
      expect(mockElement.removeAttribute).not.toHaveBeenCalled();
    });
  });

  describe("timer state transitions", () => {
    it("should handle transition from inactive to active", () => {
      // Setup - Start with inactive timer
      timer.isActiveTimer.mockReturnValue(false);

      // First call - inactive timer
      manageTimerUpdater(mockElement, "timer.cooking", mockUpdateFn);

      // Verify - no interval operations
      expect(setInterval).not.toHaveBeenCalled();
      expect(clearInterval).not.toHaveBeenCalled();
      expect(mockElement.dataset.progress_update_interval).toBeUndefined();

      // Reset mocks for transition
      jest.clearAllMocks();

      // Setup - Timer becomes active
      timer.isActiveTimer.mockReturnValue(true);

      // Second call - active timer
      manageTimerUpdater(mockElement, "timer.cooking", mockUpdateFn);

      // Verify - interval should be set
      expect(setInterval).toHaveBeenCalledWith(mockUpdateFn, 1000);
      expect(clearInterval).not.toHaveBeenCalled();
      expect(mockElement.dataset.progress_update_interval).toBeTruthy();
    });

    it("should handle transition from active to inactive", () => {
      // Setup - Start with active timer
      timer.isActiveTimer.mockReturnValue(true);

      // First call - active timer
      manageTimerUpdater(mockElement, "timer.cooking", mockUpdateFn);

      // Verify - interval was set
      expect(setInterval).toHaveBeenCalledWith(mockUpdateFn, 1000);
      expect(mockElement.dataset.progress_update_interval).toBeTruthy();

      // Store interval ID for verification
      const intervalId = mockElement.dataset.progress_update_interval;

      // Reset mocks for transition
      jest.clearAllMocks();

      // Setup - Timer becomes inactive
      timer.isActiveTimer.mockReturnValue(false);

      // Second call - inactive timer
      manageTimerUpdater(mockElement, "timer.cooking", mockUpdateFn);

      // Verify - interval should be cleared
      expect(clearInterval).toHaveBeenCalledWith(intervalId);
      expect(setInterval).not.toHaveBeenCalled();
      expect(mockElement.removeAttribute).toHaveBeenCalledWith("data-progress_update_interval");
    });
  });

  describe("edge cases", () => {
    it("should handle truthy but non-numeric interval values", () => {
      // Setup - Invalid interval value (string that's truthy but not numeric)
      timer.isActiveTimer.mockReturnValue(false);
      mockElement.dataset.progress_update_interval = "invalid"; // Truthy but invalid

      // Exercise - Call the function
      manageTimerUpdater(mockElement, "timer.cooking", mockUpdateFn);

      // Verify - clearInterval should still be called (helper treats any truthy value as existing interval)
      expect(clearInterval).toHaveBeenCalledWith("invalid");
      expect(mockElement.removeAttribute).toHaveBeenCalledWith("data-progress_update_interval");
    });

    it("should handle empty string interval values", () => {
      // Setup - Empty string interval value (falsy)
      timer.isActiveTimer.mockReturnValue(false);
      mockElement.dataset.progress_update_interval = ""; // Falsy

      // Exercise - Call the function
      manageTimerUpdater(mockElement, "timer.cooking", mockUpdateFn);

      // Verify - clearInterval should NOT be called for falsy values
      expect(clearInterval).not.toHaveBeenCalled();
      expect(mockElement.removeAttribute).not.toHaveBeenCalled();
    });

    it("should work with different progress sources", () => {
      // Setup - Active timer with different entity ID
      timer.isActiveTimer.mockReturnValue(true);

      // Exercise - Call with different progress source
      manageTimerUpdater(mockElement, "timer.dishwasher", mockUpdateFn);

      // Verify - should still work correctly
      expect(setInterval).toHaveBeenCalledWith(mockUpdateFn, 1000);
      expect(mockElement.dataset.progress_update_interval).toBeTruthy();

      // Verify - isActiveTimer was called with correct source
      expect(timer.isActiveTimer).toHaveBeenCalledWith("timer.dishwasher");
    });
  });

  describe("update function handling", () => {
    it("should call the provided update function when interval fires", () => {
      // Setup - Active timer
      timer.isActiveTimer.mockReturnValue(true);

      // Exercise - Set up interval
      manageTimerUpdater(mockElement, "timer.cooking", mockUpdateFn);

      // Verify - setInterval was called with our function
      expect(setInterval).toHaveBeenCalledWith(mockUpdateFn, 1000);

      // Exercise - Trigger the interval (fast forward timer)
      jest.advanceTimersByTime(1000);

      // Verify - update function should have been called
      expect(mockUpdateFn).toHaveBeenCalled();
    });

    it("should work with different update functions", () => {
      // Setup - Active timer with different update function
      timer.isActiveTimer.mockReturnValue(true);
      const customUpdateFn = jest.fn();

      // Exercise - Call with custom update function
      manageTimerUpdater(mockElement, "timer.cooking", customUpdateFn);

      // Verify - setInterval should be called with the custom function
      expect(setInterval).toHaveBeenCalledWith(customUpdateFn, 1000);

      // Exercise - Trigger the interval
      jest.advanceTimersByTime(1000);

      // Verify - custom function should have been called
      expect(customUpdateFn).toHaveBeenCalled();
      expect(mockUpdateFn).not.toHaveBeenCalled(); // Original should not be called
    });
  });
});
