# expect-type

Use [ts-morph](https://github.com/dsherret/ts-morph) to extract the types defined in the code as a string and test it.

# usage

Install ts-morph that compatibles the typescript version you are using.

```bash
yarn add -D ts-morph @yamatomo/expect-type
```

```typescript
import { expectType } from '@yamatomo/expect-type';

type Test1 = string;
test('Test1 is string type', () => {
  expectType('Test1').toBe('string');
});

type Test2 = (string | number)[];
test('Test2 is (string | number)[]', () => {
  expectType('Test2').toBe('(string | number)[]');
});
```

# test runner

Support vitest and jest

If you want to use it in a jest, the path to import should be as follows.

```typescript
import { expectType } from '@yamatomo/expect-type/dist/jest';
```

It can also be run on other runners by using the `type` function.

```typescript
import { type } from '@yamatomo/expect-type';

type Test = string;
expect(type('Test')).toEqual('string');
```

Samples are in the examples folder.
