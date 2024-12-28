import { createRegExp } from '../partials';

describe('commit-message-formatter/partials/utilities', () => {
  describe('createRegExp', () => {
    beforeEach(() => {
      jest.spyOn(process, 'exit').mockImplementation((code) => {
        throw new Error(`process.exit called with code ${code}`);
      });
      jest.spyOn(console, 'error').mockImplementation(() => {});
    });

    afterEach(() => {
      jest.restoreAllMocks();
    });


    test('should create a RegExp from a string pattern', () => {
      const result = createRegExp('test');
      expect(result).toBeInstanceOf(RegExp);
      expect(result.source).toBe('test');
    });

    test('should create a RegExp from a RegExp pattern', () => {
      const result = createRegExp(/test/);
      expect(result).toBeInstanceOf(RegExp);
      expect(result.source).toBe('test');
    });

    test('should create a RegExp with flags', () => {
      const result = createRegExp('test', 'i');
      expect(result).toBeInstanceOf(RegExp);
      expect(result.source).toBe('test');
      expect(result.flags).toBe('i');
    });

    test('should handle invalid RegExp pattern and call process.exit', () => {
      expect(() => createRegExp('[a-z')).toThrow('process.exit called with code 1');
      expect(console.error).toHaveBeenCalledWith('Invalid regular expression pattern: [a-z');
    });

    test('should handle invalid RegExp pattern with flags and call process.exit', () => {
      expect(() => createRegExp('[a-z', 'i')).toThrow('process.exit called with code 1');
      expect(console.error).toHaveBeenCalledWith('Invalid regular expression pattern: [a-z');
    });
  })
});
