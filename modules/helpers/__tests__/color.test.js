// note we need to structure mocks like this due to the following:
// https://jestjs.io/docs/ecmascript-modules#module-mocking-in-esm
// see: https://stackoverflow.com/a/71044616/19071151
import { jest } from '@jest/globals';

jest.unstable_mockModule('../hass.js', () => ({
    getState: jest.fn()
}));

const { processColor } = await import('../color.js');
const hass = await import('../hass.js');

describe('processColor()', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('returns null if no resolved state', () => {
        hass.getState.mockReturnValue(undefined);
        expect(processColor('sensor.unknown')).toBeNull();
    });

    it('returns null if resolved value is not a string', () => {
        hass.getState.mockReturnValue(123);
        expect(processColor('sensor.invalid')).toBeNull();
    });

    it('returns RGB value as-is', () => {
        hass.getState.mockReturnValue('rgb(100, 150, 200)');
        expect(processColor('sensor.rgb')).toBe('rgb(100, 150, 200)');
    });

    it('returns hex value as-is', () => {
        hass.getState.mockReturnValue('#abc123');
        expect(processColor('sensor.hex')).toBe('#abc123');
    });

    it('returns hsl value as-is', () => {
        hass.getState.mockReturnValue('hsl(120, 100%, 50%)');
        expect(processColor('sensor.hsl')).toBe('hsl(120, 100%, 50%)');
    });

    it('wraps other values in CSS var() syntax', () => {
        hass.getState.mockReturnValue('energy-high');
        expect(processColor('sensor.name')).toBe('var(--energy-high-color)');
    });

    it('trims resolved values before checking', () => {
        hass.getState.mockReturnValue('  #abcdef  ');
        expect(processColor('sensor.spaced')).toBe('#abcdef');
    });
});