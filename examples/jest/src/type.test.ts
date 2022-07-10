/* eslint-disable @typescript-eslint/no-unused-vars */
import { expectType } from '@yamatomo/expect-type/dist/jest';

type Test1 = string;
test('Test1 is string type', () => {
  expectType('Test1').toBe('string');
});

type SpecificNullable<T, K extends keyof T> = { [P in keyof T]: P extends K ? T[P] | null : T[P] };
type Test2 = SpecificNullable<{ hoge: string; foo: number }, 'hoge'>;
test('Test2 is { hoge: string|null; foo: number }', () => {
  expectType('Test2').toBe('{ hoge: string | null; foo: number; }');
});

interface Test3 {
  bar: string;
}
test('Test3 is Test3', () => {
  expectType('Test3').toBe('Test3');
});

type Test4 = (string | number)[];
test('Test4 is (string | number)[]', () => {
  expectType('Test4').toBe('(string | number)[]');
});

// prettier-ignore
type Colors = 'transparent' | 'white' | 'whiteAlpha.50' | 'whiteAlpha.100' | 'black' | 'blackAlpha.50' | 'blackAlpha.100';
type SplitDotProperty<T extends string> = T extends `${infer Key}.${infer SubKey}`
  ? { key: Key; subKey: SubKey }
  : { key: T; subKey: never };
type ToNormalizeNestedColors = {
  [P in Colors]: never extends SplitDotProperty<P> ? SplitDotProperty<P> : P;
};
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type GroupBySubKeys<T extends { key: string; subKey: any }> = {
  [K in T['key']]: Extract<T, { key: K }>['subKey'] extends never
    ? string
    : Record<Extract<T, { key: K }>['subKey'], string>;
};
type ValueOf<T> = T[keyof T];

type Test5 = GroupBySubKeys<ValueOf<ToNormalizeNestedColors>>;
test('Test5', () => {
  expectType('Test5').toMatchSnapshot();
});
