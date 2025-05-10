import {jest} from '@jest/globals';

jest.unstable_mockModule('../hass.js', () => ({
    getState: jest.fn()
}));

const {checkAllConditions} = await import('../condition.js');
const hass = await import('../hass.js');

describe('checkAllConditions', () => {
    beforeEach(() => {
        hass.getState.mockReset();
    });

    it('returns true when condition is undefined', () => {
        expect(checkAllConditions(undefined)).toBe(true);
    });

    it('returns true when condition is null', () => {
        expect(checkAllConditions(null)).toBe(true);
    });

    it('returns false if condObj is null or not an object', () => {
        expect(checkAllConditions('string')).toBe(false);
        expect(checkAllConditions(123)).toBe(false);
        expect(checkAllConditions({})).toBe(false);
    });

    it('returns false if condObj.condition is missing', () => {
        expect(checkAllConditions({entity: 'sensor.test'})).toBe(false);
    });


    describe('checkAllConditions array input', () => {
        it('returns true when array is empty', () => {
            expect(checkAllConditions([])).toBe(true);
        });

        it('returns true when all conditions pass', () => {
            hass.getState.mockReturnValue('on');
            const conditions = [
                {condition: 'state', entity: 'sensor.a', state: 'on'},
                {condition: 'state', entity: 'sensor.b', state: 'on'}
            ];
            expect(checkAllConditions(conditions)).toBe(true);
        });

        it('returns false when any condition fails', () => {
            hass.getState.mockImplementation(e => (e === 'sensor.a' ? 'on' : 'off'));
            const conditions = [
                {condition: 'state', entity: 'sensor.a', state: 'on'},
                {condition: 'state', entity: 'sensor.b', state: 'on'}
            ];
            expect(checkAllConditions(conditions)).toBe(false);
        });
    });


    describe('state condition', () => {
        test.each([
            ['sensor.test', 'on', {condition: 'state', entity: 'sensor.test', state: 'on'}, true],
            ['sensor.test', 'off', {condition: 'state', entity: 'sensor.test', state: 'on'}, false],
            ['sensor.test', 'on', {condition: 'state', entity: 'sensor.test', state: ['on', 'active']}, true],
            ['sensor.test', 'idle', {condition: 'state', entity: 'sensor.test', state: ['on', 'active']}, false],
            ['sensor.test', undefined, {condition: 'state', entity: 'sensor.test', state: 'on'}, false]
        ])('returns %p when state is %p for %o', (entity, mockValue, condition, expected) => {
            hass.getState.mockReturnValue(mockValue);
            expect(checkAllConditions(condition)).toBe(expected);
        });
    });

    describe('numeric_state condition', () => {
        it('returns true when value is above threshold', () => {
            const condition = {
                condition: 'numeric_state',
                entity: 'sensor.value',
                above: 5
            };
            hass.getState
                .mockReturnValueOnce(6) // state
                .mockReturnValueOnce(5); // above

            expect(checkAllConditions(condition)).toBe(true);
        });

        describe('threshold edge cases (parameterized)', () => {
            test.each([
                ['value equals "above"', 5, 5, undefined, false],
                ['value is less than "above"', 4, 5, undefined, false]
            ])('%s → expect false', (_, state, above, below, expected) => {
                const condition = {
                    condition: 'numeric_state',
                    entity: 'sensor.value',
                    ...(above !== undefined && {above}),
                    ...(below !== undefined && {below})
                };
                hass.getState
                    .mockReturnValueOnce(state)
                    .mockReturnValueOnce(above ?? undefined);
                expect(checkAllConditions(condition)).toBe(expected);
                expect(hass.getState).toHaveBeenCalledTimes(2);
            });

            test.each([
                ['value equals "below"', 10, undefined, 10, false],
                ['value is more than "below"', 11, undefined, 10, false]
            ])('%s → expect false', (_, state, above, below, expected) => {
                const condition = {
                    condition: 'numeric_state',
                    entity: 'sensor.value',
                    ...(above !== undefined && {above}),
                    ...(below !== undefined && {below})
                };
                hass.getState
                    .mockReturnValueOnce(state)
                    .mockReturnValueOnce(undefined)
                    .mockReturnValueOnce(below);
                expect(checkAllConditions(condition)).toBe(expected);
                expect(hass.getState).toHaveBeenCalledTimes(3);
            });

            test.each([
                ['value equals lower threshold → fail range check', 5, 5, 10, false, 2],
                ['value equals upper threshold → fail range check', 10, 5, 10, false, 3],
                ['value between thresholds → pass range check', 6, 5, 10, true, 3]
            ])('%s', (_, state, above, below, expected, expectedCalls) => {
                const condition = {
                    condition: 'numeric_state',
                    entity: 'sensor.value',
                    above,
                    below
                };
                hass.getState
                    .mockReturnValueOnce(state)
                    .mockReturnValueOnce(above)
                    .mockReturnValueOnce(below);
                expect(checkAllConditions(condition)).toBe(expected);
                expect(hass.getState).toHaveBeenCalledTimes(expectedCalls);
            });
        });

        it('returns false when state is not a number', () => {
            const condition = {
                condition: 'numeric_state',
                entity: 'sensor.value',
                above: 5
            };
            hass.getState
                .mockReturnValueOnce('abc'); // state not a number

            expect(checkAllConditions(condition)).toBe(false);
            expect(hass.getState).toHaveBeenCalledTimes(1);
        });

        it('returns true when thresholds are not numbers and ignored', () => {
            const condition = {
                condition: 'numeric_state',
                entity: 'sensor.value',
                above: 'foo',
                below: 'bar'
            };
            hass.getState
                .mockReturnValueOnce(10) // state
                .mockReturnValueOnce('foo') // above
                .mockReturnValueOnce('bar'); // below

            expect(checkAllConditions(condition)).toBe(true);
            expect(hass.getState).toHaveBeenCalledTimes(3);
        });
    });

    describe('exists condition', () => {
        test.each([
            ['sensor.found', 123, true],
            ['sensor.missing', undefined, false]
        ])('returns %p if entity %s resolves to %p', (entity, mockValue, expected) => {
            hass.getState.mockReturnValue(mockValue);
            expect(checkAllConditions({condition: 'exists', entity})).toBe(expected);
        });
    });

    describe('and condition', () => {
        it('returns true when all nested conditions are true', () => {
            hass.getState.mockReturnValue('on');
            const condition = {
                condition: 'and',
                conditions: [
                    {condition: 'state', entity: 'sensor.a', state: 'on'},
                    {condition: 'state', entity: 'sensor.a', state: 'on'}
                ]
            };
            expect(checkAllConditions(condition)).toBe(true);
        });

        it('returns true when conditions is empty', () => {
            const condition = {
                condition: 'and',
                conditions: []
            };
            expect(checkAllConditions(condition)).toBe(true);
        });
        it('returns false when conditions is not an array', () => {
            const condition = {
                condition: 'and',
                conditions: null
            };
            expect(checkAllConditions(condition)).toBe(false);
        });

        it('returns false when one nested condition is false', () => {
            hass.getState.mockImplementation((e) => (e === 'sensor.a' ? 'on' : 'off'));
            const condition = {
                condition: 'and',
                conditions: [
                    {condition: 'state', entity: 'sensor.a', state: 'on'},
                    {condition: 'state', entity: 'sensor.b', state: 'on'}
                ]
            };
            expect(checkAllConditions(condition)).toBe(false);
        });
    });

    describe('or condition', () => {
        it('returns true if at least one nested condition is true', () => {
            hass.getState.mockReturnValue('on');
            const condition = {
                condition: 'or',
                conditions: [
                    {condition: 'state', entity: 'sensor.a', state: 'off'},
                    {condition: 'state', entity: 'sensor.b', state: 'on'}
                ]
            };
            expect(checkAllConditions(condition)).toBe(true);
        });

        it('returns false when conditions is empty', () => {
            const condition = {
                condition: 'or',
                conditions: []
            };
            expect(checkAllConditions(condition)).toBe(false);
        });
        it('returns false when conditions is not an array', () => {
            const condition = {
                condition: 'or',
                conditions: null
            };
            expect(checkAllConditions(condition)).toBe(false);
        });

        it('returns false if all nested conditions are false', () => {
            hass.getState.mockReturnValue('off');
            const condition = {
                condition: 'or',
                conditions: [
                    {condition: 'state', entity: 'sensor.a', state: 'on'},
                    {condition: 'state', entity: 'sensor.b', state: 'on'}
                ]
            };
            expect(checkAllConditions(condition)).toBe(false);
        });
    });

    describe('not condition', () => {
        it('returns true if the nested condition is false', () => {
            hass.getState.mockReturnValue('off');
            const condition = {
                condition: 'not',
                conditions: [
                    {condition: 'state', entity: 'sensor.a', state: 'on'}
                ]
            };
            expect(checkAllConditions(condition)).toBe(true);
        });

        it('returns false if the nested condition is true', () => {
            hass.getState.mockReturnValue('on');
            const condition = {
                condition: 'not',
                conditions: {condition: 'state', entity: 'sensor.a', state: 'on'}
            };
            expect(checkAllConditions(condition)).toBe(false);
        });
        it('returns false if no condition', () => {
            hass.getState.mockReturnValue('on');
            const condition = {
                condition: 'not'
            };
            expect(checkAllConditions(condition)).toBe(false);
        });
        it('returns false if null conditions', () => {
            hass.getState.mockReturnValue('on');
            const condition = {
                condition: 'not',
                conditions: null
            };
            expect(checkAllConditions(condition)).toBe(false);
        });
    });

    describe('unknown condition type', () => {
        it('returns false if the condition type is unrecognised', () => {
            const condition = {
                condition: 'unsupported_type',
                entity: 'sensor.abc'
            };
            expect(checkAllConditions(condition)).toBe(false);
        });
    });
})
;
