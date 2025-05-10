// note we need to structure mocks like this due to the following:
// https://jestjs.io/docs/ecmascript-modules#module-mocking-in-esm
// see: https://stackoverflow.com/a/71044616/19071151
import {jest} from '@jest/globals';

jest.unstable_mockModule('../hass.js', () => ({
    getState: jest.fn()
}));

const {processColor, getInterpolatedColor} = await import('../color.js');
const hass = await import('../hass.js');

describe('processColor()', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('returns null if no resolved state', () => {
        hass.getState.mockReturnValue(undefined);
        expect(processColor('sensor.unknown')).toBe('var(--primary-color)');
    });

    it('returns null if resolved value is not a string', () => {
        hass.getState.mockReturnValue(123);
        expect(processColor('sensor.invalid')).toBe('var(--primary-color)');
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

describe('getInterpolatedColor()', () => {

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('returns default when stops is null or empty', () => {
        expect(getInterpolatedColor(50, null)).toBe('var(--primary-color)');
        expect(getInterpolatedColor(50, [])).toBe('var(--primary-color)');
    });

    it('returns color of first stop if progress is less than first percent', () => {
        hass.getState.mockReturnValueOnce('red');
        const stops = [{color: 'sensor.color1', percent: 30}, {color: 'sensor.color2', percent: 50}];
        expect(getInterpolatedColor(10, stops)).toBe('var(--red-color)');
    });

    it('returns color of last stop if progress is greater than last percent', () => {
        hass.getState.mockReturnValueOnce('blue');
        const stops = [{color: 'sensor.color1', percent: 30}, {color: 'sensor.color2', percent: 70}];
        expect(getInterpolatedColor(90, stops)).toBe('var(--blue-color)');
    });

    it('returns exact match if progress equals stop percent', () => {
        hass.getState.mockImplementation((key) => {
            const map = {
                'sensor.color1': 'red',
                'sensor.color2': 'blue',
                'sensor.color3': 'green',
            };
            return map[key];
        });
        const stops = [{color: 'sensor.color1', percent: 49},
            {color: 'sensor.color2', percent: 51},
            {color: 'sensor.color3', percent: 50}];
        expect(getInterpolatedColor(50, stops)).toBe('var(--green-color)');
    });

    it('returns default if resolved color is invalid', () => {

        hass.getState.mockReturnValueOnce(undefined);
        hass.getState.mockReturnValueOnce(undefined);
        const stops = [
            {color: 'sensor.colorX', percent: 40},
            {color: 'sensor.colorY', percent: 60}
        ];
        expect(getInterpolatedColor(50, stops)).toBe('var(--primary-color)');
    });

    describe('interpolated colors', () => {
        test.each([
            [0, 'red', 100, 'blue', 50, 'color-mix(in srgb, var(--red-color) 50%, var(--blue-color) 50%)'],
            [0, 'red', 100, 'blue', 25, 'color-mix(in srgb, var(--red-color) 75%, var(--blue-color) 25%)'],
            [0, 'red', 100, 'blue', 75, 'color-mix(in srgb, var(--red-color) 25%, var(--blue-color) 75%)'],
            [40, 'yellow', 60, 'orange', 50, 'color-mix(in srgb, var(--yellow-color) 50%, var(--orange-color) 50%)'],
            [10, 'green', 90, 'purple', 10, 'var(--green-color)'],
            [10, 'green', 90, 'purple', 90, 'var(--purple-color)'],
        ])(
            'interpolates between %s (%s) and %s (%s) at %s%%',
            (p1, c1, p2, c2, value, expected) => {
                hass.getState.mockImplementation((key) => {
                    const map = {
                        'sensor.lower': c1,
                        'sensor.upper': c2
                    };
                    return map[key];
                });

                const stops = [
                    {color: 'sensor.lower', percent: p1},
                    {color: 'sensor.upper', percent: p2}
                ];
                expect(getInterpolatedColor(value, stops)).toBe(expected);
            }
        );
    });
});