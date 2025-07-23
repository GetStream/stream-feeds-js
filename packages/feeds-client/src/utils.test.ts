import { describe, it, expect } from 'vitest';

import { uniqueMerge } from './utils';

describe('utils', () => {
  describe('uniqueMerge', () => {
    it('should merge arrays with unique objects based on key', () => {
      const existingArray = [
        { id: '1', name: 'Alice' },
        { id: '2', name: 'Bob' },
      ];
      const arrayToMerge = [
        { id: '2', name: 'Bob Updated' },
        { id: '3', name: 'Charlie' },
      ];
      const getKey = (item: { id: string; name: string }) => item.id;

      const result = uniqueMerge(existingArray, arrayToMerge, getKey);

      expect(result).toEqual([
        { id: '1', name: 'Alice' },
        { id: '2', name: 'Bob' },
        { id: '3', name: 'Charlie' },
      ]);
    });

    it('should preserve order of existing array and append new items', () => {
      const existingArray = [
        { id: '1', name: 'Alice' },
        { id: '2', name: 'Bob' },
      ];
      const arrayToMerge = [
        { id: '3', name: 'Charlie' },
        { id: '4', name: 'David' },
      ];
      const getKey = (item: { id: string; name: string }) => item.id;

      const result = uniqueMerge(existingArray, arrayToMerge, getKey);

      expect(result).toEqual([
        { id: '1', name: 'Alice' },
        { id: '2', name: 'Bob' },
        { id: '3', name: 'Charlie' },
        { id: '4', name: 'David' },
      ]);
    });

    it('should filter out duplicate keys from array to merge', () => {
      const existingArray = [
        { id: '1', name: 'Alice' },
        { id: '2', name: 'Bob' },
      ];
      const arrayToMerge = [
        { id: '1', name: 'Alice Updated' },
        { id: '2', name: 'Bob Updated' },
        { id: '3', name: 'Charlie' },
      ];
      const getKey = (item: { id: string; name: string }) => item.id;

      const result = uniqueMerge(existingArray, arrayToMerge, getKey);

      expect(result).toEqual([
        { id: '1', name: 'Alice' },
        { id: '2', name: 'Bob' },
        { id: '3', name: 'Charlie' },
      ]);
    });

    it('should handle empty existing array', () => {
      const existingArray: Array<{ id: string; name: string }> = [];
      const arrayToMerge = [
        { id: '1', name: 'Alice' },
        { id: '2', name: 'Bob' },
      ];
      const getKey = (item: { id: string; name: string }) => item.id;

      const result = uniqueMerge(existingArray, arrayToMerge, getKey);

      expect(result).toEqual([
        { id: '1', name: 'Alice' },
        { id: '2', name: 'Bob' },
      ]);
    });

    it('should handle empty array to merge', () => {
      const existingArray = [
        { id: '1', name: 'Alice' },
        { id: '2', name: 'Bob' },
      ];
      const arrayToMerge: Array<{ id: string; name: string }> = [];
      const getKey = (item: { id: string; name: string }) => item.id;

      const result = uniqueMerge(existingArray, arrayToMerge, getKey);

      expect(result).toEqual([
        { id: '1', name: 'Alice' },
        { id: '2', name: 'Bob' },
      ]);
    });

    it('should handle both arrays being empty', () => {
      const existingArray: Array<{ id: string; name: string }> = [];
      const arrayToMerge: Array<{ id: string; name: string }> = [];
      const getKey = (item: { id: string; name: string }) => item.id;

      const result = uniqueMerge(existingArray, arrayToMerge, getKey);

      expect(result).toEqual([]);
    });

    it('should work with different key functions', () => {
      const existingArray = [
        { id: '1', name: 'Alice', email: 'alice@example.com' },
        { id: '2', name: 'Bob', email: 'bob@example.com' },
      ];
      const arrayToMerge = [
        { id: '3', name: 'Charlie', email: 'alice@example.com' },
        { id: '4', name: 'David', email: 'david@example.com' },
      ];
      const getKeyByEmail = (item: {
        id: string;
        name: string;
        email: string;
      }) => item.email;

      const result = uniqueMerge(existingArray, arrayToMerge, getKeyByEmail);

      expect(result).toEqual([
        { id: '1', name: 'Alice', email: 'alice@example.com' },
        { id: '2', name: 'Bob', email: 'bob@example.com' },
        { id: '4', name: 'David', email: 'david@example.com' },
      ]);
    });

    it('should handle complex nested objects', () => {
      const existingArray = [
        { id: '1', data: { nested: { value: 'a' } } },
        { id: '2', data: { nested: { value: 'b' } } },
      ];
      const arrayToMerge = [
        { id: '2', data: { nested: { value: 'b_updated' } } },
        { id: '3', data: { nested: { value: 'c' } } },
      ];
      const getKey = (item: {
        id: string;
        data: { nested: { value: string } };
      }) => item.id;

      const result = uniqueMerge(existingArray, arrayToMerge, getKey);

      expect(result).toEqual([
        { id: '1', data: { nested: { value: 'a' } } },
        { id: '2', data: { nested: { value: 'b' } } },
        { id: '3', data: { nested: { value: 'c' } } },
      ]);
    });

    it('should preserve original arrays (immutability)', () => {
      const existingArray = [
        { id: '1', name: 'Alice' },
        { id: '2', name: 'Bob' },
      ];
      const arrayToMerge = [{ id: '3', name: 'Charlie' }];
      const getKey = (item: { id: string; name: string }) => item.id;

      const originalExisting = [...existingArray];
      const originalToMerge = [...arrayToMerge];

      uniqueMerge(existingArray, arrayToMerge, getKey);

      expect(existingArray).toEqual(originalExisting);
      expect(arrayToMerge).toEqual(originalToMerge);
    });
  });
});
