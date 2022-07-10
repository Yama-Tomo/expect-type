/// <reference types="vitest" />
import { type, Options, configure } from './core';

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
const expectType: Vi.ExpectStatic = (typeName: string) => expect(type(String(typeName)));

export { expectType, configure, type };
export type { Options };
