import {getState} from "../hass";

global.hass = {
    states: {
        'sensor.temperature': {
            state: '22.5',
            attributes: {
                unit_of_measurement: '°C',
                calibrated: true
            }
        },
        'light.living_room': {
            state: 'on',
            attributes: {
                brightness: 200
            }
        }
    }
};

describe('getState()', () => {
    it('returns raw input for non-string values', () => {
        expect(getState(42)).toBe(42);
    });

    it('returns state for valid entity ID', () => {
        expect(getState('sensor.temperature')).toBe('22.5');
    });

    it('returns attribute value when specified as entity[attribute]', () => {
        expect(getState('sensor.temperature[unit_of_measurement]')).toBe('°C');
        expect(getState('light.living_room[brightness]')).toBe(200);
    });

    it('returns raw input if entity is not found', () => {
        expect(getState('sensor.unknown')).toBe('sensor.unknown');
    });

    it('returns undefined if fallbackToRaw is false and entity is missing', () => {
        expect(getState('sensor.unknown', false)).toBeUndefined();
    });

    it('returns undefined if fallbackToRaw is false and attribute is missing', () => {
        expect(getState('sensor.temperature[missing]', false)).toBeUndefined();
    });

    it('returns undefined if input matches pattern and fallbackToRaw is false but entity is missing', () => {
        expect(getState('sensor.unknown[unknown]', false)).toBeUndefined();
    });

    it('returns raw input if input matches pattern but entity is missing', () => {
        expect(getState('sensor.unknown[unknown]')).toBe('sensor.unknown[unknown]');
    });
});