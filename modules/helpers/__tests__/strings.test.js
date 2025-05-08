import { suffix, prefix } from '../strings';

describe('suffix()', () => {
    it('adds the suffix if missing', () => {
        expect(suffix('filename', '.js')).toBe('filename.js');
    });

    it('does not add the suffix if already present', () => {
        expect(suffix('file.js', '.js')).toBe('file.js');
    });

    it('handles non-string input by coercing to string', () => {
        expect(suffix(123, 'px')).toBe('123px');
    });

    it('handles empty suffix gracefully', () => {
        expect(suffix('test', '')).toBe('test');
    });
});

describe('prefix()', () => {
    it('adds the prefix if missing', () => {
        expect(prefix('world', 'hello ')).toBe('hello world');
    });

    it('does not add the prefix if already present', () => {
        expect(prefix('hello world', 'hello ')).toBe('hello world');
    });

    it('handles non-string input by coercing to string', () => {
        expect(prefix(42, '$')).toBe('$42');
    });

    it('handles empty prefix gracefully', () => {
        expect(prefix('value', '')).toBe('value');
    });
});