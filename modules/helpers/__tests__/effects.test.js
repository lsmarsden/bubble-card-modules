import {jest} from '@jest/globals';

jest.unstable_mockModule('../condition.js', () => ({
    checkAllConditions: jest.fn()
}));

const {applyEffects} = await import('../effects.js');
const condition = await import('../condition.js');

describe('applyEffects()', () => {
    let mockElement;

    beforeEach(() => {
        mockElement = {
            classList: {
                add: jest.fn(),
                remove: jest.fn()
            }
        };
        jest.clearAllMocks();
    });

    it('does nothing when effects is empty', () => {
        applyEffects(mockElement, {});
        expect(mockElement.classList.add).not.toHaveBeenCalled();
        expect(mockElement.classList.remove).not.toHaveBeenCalled();
    });
    it('does nothing when no effect defined', () => {
        const effects = {
            effect1: {effect: null, condition: {}},
        };
        applyEffects(mockElement, effects);
        expect(mockElement.classList.add).not.toHaveBeenCalled();
        expect(mockElement.classList.remove).not.toHaveBeenCalled();
    });

    it('applies multiple effects when conditions are true', () => {
        const effects = {
            effect1: {effect: 'pulse', condition: {}},
            effect2: {effect: 'glow', condition: {}},
            effect3: {effect: 'spin', condition: {}}
        };
        condition.checkAllConditions
            .mockReturnValueOnce(true)
            .mockReturnValueOnce(false)
            .mockReturnValueOnce(true);

        applyEffects(mockElement, effects);
        expect(mockElement.classList.add).toHaveBeenCalledWith('progress-effect-pulse', 'has-effect');
        expect(mockElement.classList.add).not.toHaveBeenCalledWith('progress-effect-glow', 'has-effect');
        expect(mockElement.classList.add).toHaveBeenCalledWith('progress-effect-spin', 'has-effect');
        expect(mockElement.classList.add).toHaveBeenCalledTimes(2);
    });

    it('adds effect when condition is true', () => {
        condition.checkAllConditions.mockReturnValue(true);
        const effects = {
            pulseEffect: {effect: 'pulse', condition: {}}
        };
        applyEffects(mockElement, effects);
        expect(mockElement.classList.add).toHaveBeenCalledWith('progress-effect-pulse', 'has-effect');
        expect(mockElement.classList.remove).not.toHaveBeenCalled();
    });

    it('removes effect when condition is false', () => {
        condition.checkAllConditions.mockReturnValue(false);
        const effects = {
            pulseEffect: {effect: 'pulse', condition: {}}
        };
        applyEffects(mockElement, effects);
        expect(mockElement.classList.remove).toHaveBeenCalledWith('progress-effect-pulse');
        expect(mockElement.classList.add).not.toHaveBeenCalled();
    });
})