import {jest} from '@jest/globals';
import {resolveConfig} from '../config';

describe('resolveConfig()', () => {
    const getSource = (path, value, extra = {}) => ({
        config: value,
        path,
        metadata: extra.metadata,
        condition: extra.condition
    });

    it('returns value from the first matching source', () => {
        const sources = [
            getSource('module.color', {module: {color: 'blue'}}),
            getSource('module.color', {module: {color: 'red'}})
        ];
        const result = resolveConfig(sources);
        expect(result).toBe('blue');
    });

    it('returns default value if no source has a matching config', () => {
        const sources = [
            getSource('nonexistent.path', {something: 'else'}),
            getSource('also.missing', {test: true})
        ];
        const result = resolveConfig(sources, 'default');
        expect(result).toBe('default');
    });

    it('handles nested keys split by dot in path string', () => {
        const source = getSource('deep.nested.value', {
            deep: {nested: {value: 'found'}}
        });
        const result = resolveConfig([source]);
        expect(result).toBe('found');
    });

    it('supports array path as keys instead of dot string', () => {
        const source = getSource(['settings', 'theme', 'mode'], {
            settings: {theme: {mode: 'dark'}}
        });
        const result = resolveConfig([source]);
        expect(result).toBe('dark');
    });

    it('skips sources if condition returns false', () => {
        const sources = [
            getSource('theme.color', {theme: {color: 'blue'}}, {
                condition: () => false
            }),
            getSource('theme.color', {theme: {color: 'red'}})
        ];
        const result = resolveConfig(sources);
        expect(result).toBe('red');
    });

    it('logs detailed warning when source is deprecated and has replacedWith and message', () => {
        const warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {
        });
        const source = getSource('theme.color', {theme: {color: 'red'}}, {
            metadata: {
                deprecated: true,
                replacedWith: 'style.color',
                message: 'Use new theme structure.'
            }
        });
        const result = resolveConfig([source]);
        expect(result).toBe('red');
        expect(warnSpy).toHaveBeenCalledWith(
            `[DEPRECATED] Config path "theme.color" used. Use "style.color" instead. Use new theme structure.`
        );
        warnSpy.mockRestore();
    });

    it('logs warning when source is deprecated with no message or replacedWith', () => {
        const warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {
        });
        const source = getSource('theme.color', {theme: {color: 'red'}}, {
            metadata: {
                deprecated: true
            }
        });
        const result = resolveConfig([source]);
        expect(result).toBe('red');
        expect(warnSpy).toHaveBeenCalledWith(
            `[DEPRECATED] Config path "theme.color" used.`
        );
        warnSpy.mockRestore();
    });

    it('ignores metadata when not marked deprecated', () => {
        const warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {
        });
        const source = getSource('theme.color', {theme: {color: 'green'}}, {
            metadata: {
                deprecated: false,
                message: 'Not shown.'
            }
        });
        const result = resolveConfig([source]);
        expect(result).toBe('green');
        expect(warnSpy).not.toHaveBeenCalled();
        warnSpy.mockRestore();
    });

    it('returns undefined if no sources match and no default is given', () => {
        const sources = [
            getSource('missing.path', {notHere: true})
        ];
        const result = resolveConfig(sources);
        expect(result).toBeUndefined();
    });
});