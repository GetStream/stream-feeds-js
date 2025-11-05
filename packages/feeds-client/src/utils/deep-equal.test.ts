import { describe, it, expect } from 'vitest';

import { deepEqual } from './deep-equal';

describe('utils', () => {
  describe(deepEqual.name, () => {
    describe('primitive values', () => {
      it('should return true for identical numbers', () => {
        expect(deepEqual(1, 1)).toBe(true);
        expect(deepEqual(0, 0)).toBe(true);
        expect(deepEqual(-1, -1)).toBe(true);
        expect(deepEqual(3.14, 3.14)).toBe(true);
      });

      it('should return false for different numbers', () => {
        expect(deepEqual(1, 2)).toBe(false);
        expect(deepEqual(0, 1)).toBe(false);
        expect(deepEqual(-1, 1)).toBe(false);
        expect(deepEqual(3.14, 3.15)).toBe(false);
      });

      it('should return true for identical strings', () => {
        expect(deepEqual('hello', 'hello')).toBe(true);
        expect(deepEqual('', '')).toBe(true);
        expect(deepEqual('test', 'test')).toBe(true);
      });

      it('should return false for different strings', () => {
        expect(deepEqual('hello', 'world')).toBe(false);
        expect(deepEqual('test', 'TEST')).toBe(false);
      });

      it('should return true for identical booleans', () => {
        expect(deepEqual(true, true)).toBe(true);
        expect(deepEqual(false, false)).toBe(true);
      });

      it('should return false for different booleans', () => {
        expect(deepEqual(true, false)).toBe(false);
        expect(deepEqual(false, true)).toBe(false);
      });

      it('should return true for identical null values', () => {
        expect(deepEqual(null, null)).toBe(true);
      });

      it('should return true for identical undefined values', () => {
        expect(deepEqual(undefined, undefined)).toBe(true);
      });

      it('should return false when comparing null and undefined', () => {
        expect(deepEqual(null, undefined)).toBe(false);
        expect(deepEqual(undefined, null)).toBe(false);
      });

      it('should return false when comparing different types', () => {
        expect(deepEqual(1, '1')).toBe(false);
        expect(deepEqual('1', 1)).toBe(false);
        expect(deepEqual(true, 1)).toBe(false);
        expect(deepEqual(false, 0)).toBe(false);
        expect(deepEqual(null, 0)).toBe(false);
      });
    });

    describe('objects', () => {
      it('should return true for identical empty objects', () => {
        expect(deepEqual({}, {})).toBe(true);
      });

      it('should return true for identical objects with same properties', () => {
        expect(deepEqual({ a: 1 }, { a: 1 })).toBe(true);
        expect(deepEqual({ a: 1, b: 2 }, { a: 1, b: 2 })).toBe(true);
        expect(
          deepEqual({ a: 'hello', b: 'world' }, { a: 'hello', b: 'world' }),
        ).toBe(true);
      });

      it('should return false for objects with different property values', () => {
        expect(deepEqual({ a: 1 }, { a: 2 })).toBe(false);
        expect(deepEqual({ a: 1, b: 2 }, { a: 1, b: 3 })).toBe(false);
      });

      it('should return false for objects with different keys', () => {
        expect(deepEqual({ a: 1 }, { b: 1 })).toBe(false);
        expect(deepEqual({ a: 1 }, { a: 1, b: 2 })).toBe(false);
        expect(deepEqual({ a: 1, b: 2 }, { a: 1 })).toBe(false);
      });

      it('should return false when one object has extra properties', () => {
        expect(deepEqual({ a: 1, b: 2 }, { a: 1 })).toBe(false);
        expect(deepEqual({ a: 1 }, { a: 1, b: 2 })).toBe(false);
      });

      it('should handle objects with null values', () => {
        expect(deepEqual({ a: null }, { a: null })).toBe(true);
        expect(deepEqual({ a: null }, { a: 1 })).toBe(false);
      });

      it('should handle objects with undefined values', () => {
        expect(deepEqual({ a: undefined }, { a: undefined })).toBe(true);
        expect(deepEqual({ a: undefined }, { a: 1 })).toBe(false);
      });
    });

    describe('nested objects', () => {
      it('should return true for identical nested objects', () => {
        expect(deepEqual({ a: { b: 1 } }, { a: { b: 1 } })).toBe(true);
        expect(deepEqual({ a: { b: { c: 1 } } }, { a: { b: { c: 1 } } })).toBe(
          true,
        );
      });

      it('should return false for nested objects with different values', () => {
        expect(deepEqual({ a: { b: 1 } }, { a: { b: 2 } })).toBe(false);
        expect(deepEqual({ a: { b: { c: 1 } } }, { a: { b: { c: 2 } } })).toBe(
          false,
        );
      });

      it('should return false for nested objects with different structures', () => {
        expect(deepEqual({ a: { b: 1 } }, { a: { c: 1 } })).toBe(false);
        expect(deepEqual({ a: { b: 1 } }, { a: { b: 1, c: 2 } })).toBe(false);
      });

      it('should handle complex nested structures', () => {
        const obj1 = {
          a: 1,
          b: {
            c: 2,
            d: {
              e: 3,
              f: 'hello',
            },
          },
        };
        const obj2 = {
          a: 1,
          b: {
            c: 2,
            d: {
              e: 3,
              f: 'hello',
            },
          },
        };
        expect(deepEqual(obj1, obj2)).toBe(true);
      });
    });

    describe('arrays', () => {
      it('should return true for identical empty arrays', () => {
        expect(deepEqual([], [])).toBe(true);
      });

      it('should return true for identical arrays with primitive values', () => {
        expect(deepEqual([1, 2, 3], [1, 2, 3])).toBe(true);
        expect(deepEqual(['a', 'b', 'c'], ['a', 'b', 'c'])).toBe(true);
        expect(deepEqual([true, false], [true, false])).toBe(true);
      });

      it('should return false for arrays with different values', () => {
        expect(deepEqual([1, 2, 3], [1, 2, 4])).toBe(false);
        expect(deepEqual([1, 2, 3], [1, 2])).toBe(false);
        expect(deepEqual([1, 2], [1, 2, 3])).toBe(false);
      });

      it('should return true for arrays with identical objects', () => {
        expect(deepEqual([{ a: 1 }, { b: 2 }], [{ a: 1 }, { b: 2 }])).toBe(
          true,
        );
      });

      it('should return false for arrays with different objects', () => {
        expect(deepEqual([{ a: 1 }, { b: 2 }], [{ a: 2 }, { b: 2 }])).toBe(
          false,
        );
      });

      it('should handle nested arrays', () => {
        expect(
          deepEqual(
            [
              [1, 2],
              [3, 4],
            ],
            [
              [1, 2],
              [3, 4],
            ],
          ),
        ).toBe(true);
        expect(
          deepEqual(
            [
              [1, 2],
              [3, 4],
            ],
            [
              [1, 2],
              [3, 5],
            ],
          ),
        ).toBe(false);
      });
    });

    describe('edge cases', () => {
      it('should handle objects with same keys in different order', () => {
        expect(deepEqual({ a: 1, b: 2 }, { b: 2, a: 1 })).toBe(true);
      });

      it('should handle objects with zero values', () => {
        expect(deepEqual({ a: 0 }, { a: 0 })).toBe(true);
        expect(deepEqual({ a: 0 }, { a: -0 })).toBe(true);
      });

      it('should handle objects with empty strings', () => {
        expect(deepEqual({ a: '' }, { a: '' })).toBe(true);
        expect(deepEqual({ a: '' }, { a: ' ' })).toBe(false);
      });

      it('should handle objects with NaN values', () => {
        // Note: NaN !== NaN in JavaScript, so deepEqual should return false
        expect(deepEqual({ a: NaN }, { a: NaN })).toBe(false);
      });

      it('should handle objects with Date objects', () => {
        const date1 = new Date('2023-01-01');
        const date2 = new Date('2023-01-01');
        // Date objects are compared by reference, not by value
        expect(deepEqual({ a: date1 }, { a: date2 })).toBe(false);
      });

      it('should handle circular references gracefully', () => {
        const obj1: any = { a: 1 };
        obj1.self = obj1;
        const obj2: any = { a: 1 };
        obj2.self = obj2;
        // This will cause infinite recursion, but the function should handle it
        // by comparing object references at some point
        expect(() => deepEqual(obj1, obj2)).not.toThrow();
      });

      it('should handle mixed types in objects', () => {
        const obj1 = {
          string: 'hello',
          number: 42,
          boolean: true,
          null: null,
          undefined: undefined,
          array: [1, 2, 3],
          nested: { a: 1 },
        };
        const obj2 = {
          string: 'hello',
          number: 42,
          boolean: true,
          null: null,
          undefined: undefined,
          array: [1, 2, 3],
          nested: { a: 1 },
        };
        expect(deepEqual(obj1, obj2)).toBe(true);
      });
    });

    describe('special cases', () => {
      it('should return false when comparing object to null', () => {
        expect(deepEqual({}, null)).toBe(false);
        expect(deepEqual(null, {})).toBe(false);
      });

      it('should return false when comparing object to primitive', () => {
        expect(deepEqual({}, 1)).toBe(false);
        expect(deepEqual({}, 'string')).toBe(false);
        expect(deepEqual({}, true)).toBe(false);
      });

      it('should return false when comparing null to object', () => {
        expect(deepEqual(null, {})).toBe(false);
      });

      it('should handle objects with prototype chain properties', () => {
        // Object.keys() only returns own properties, so inherited properties
        // won't be compared, which is the expected behavior
        const obj1 = Object.create({ inherited: 'value' });
        obj1.own = 'value';
        const obj2 = { own: 'value' };
        expect(deepEqual(obj1, obj2)).toBe(true);
      });
    });
  });
});
