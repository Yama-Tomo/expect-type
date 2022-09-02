/* eslint-disable @typescript-eslint/no-unused-vars */
import { expect, test, vi } from 'vitest';
import { type, configure, Options as AliasedOptions, Options } from './core';

type Test1 = Array<string | number>;
interface Test2 {
  hoge: number;
}

test('extract type string', () => {
  expect(type('Test1')).toBe('(string | number)[]');
  expect(type('Test2')).toBe('Test2');

  // prettier-ignore
  const coreOptionsType = '{ compilerOptions?: CompilerOptions | undefined; testFilePath?: ((filePath: string) => boolean) | undefined; typeFormat?: TypeFormatFlags | undefined; }';
  expect(type('AliasedOptions')).toBe(coreOptionsType);
  expect(type('Options')).toBe(coreOptionsType);
});

test('throw error when unable to find types', () => {
  expect(() => type('NotFoundType')).toThrowError(/not found `NotFoundType` type in/);
});

test('configure', () => {
  const testFilePath = vi.fn((path: string) => path.includes('test.ts'));
  const oldOptions = configure({ testFilePath, compilerOptions: { strict: true } });

  expect(type('Test1')).toBe('(string | number)[]');
  expect(testFilePath).toHaveBeenLastCalledWith(__filename);

  configure(oldOptions);
});
