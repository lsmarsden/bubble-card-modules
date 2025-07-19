import { jest } from "@jest/globals";

jest.unstable_mockModule("../hass.js", () => ({
  getState: jest.fn(),
  getDomain: jest.fn(),
}));

const { isActiveTimer, isTimerEntity } = await import("../timer.js");
const hass = await import("../hass.js");

describe("isActiveTimer()", () => {
  beforeEach(() => {
    hass.getState.mockReset();
    hass.getDomain.mockReset();
  });

  it("returns true for active timer entities", () => {
    const progressSource = "timer.test";
    hass.getDomain.mockReturnValue("timer");
    hass.getState.mockReturnValue("active");

    expect(isActiveTimer(progressSource)).toBe(true);
  });

  it("returns false for inactive timer entities", () => {
    const progressSource = "timer.test";
    hass.getDomain.mockReturnValue("timer");
    hass.getState.mockReturnValue("idle");

    expect(isActiveTimer(progressSource)).toBe(false);
  });

  it("returns false for non-timer entities", () => {
    const progressSource = "sensor.test";
    hass.getDomain.mockReturnValue("sensor");

    expect(isActiveTimer(progressSource)).toBe(false);
  });
});
