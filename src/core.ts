import * as ts from 'typescript';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const pkgInfo = require('../package.json');

type FilePath = string;
const _program: Record<FilePath, ts.Program> = {};
const getProgram = (filePath: string) => {
  if (!_program[filePath]) {
    const options = _options?.compilerOptions ?? {};
    _program[filePath] = ts.createProgram([filePath], options);
  }

  return _program[filePath];
};

type Options = Partial<{
  compilerOptions: ts.CompilerOptions;
  testFilePath: (filePath: string) => boolean;
  typeFormat: ts.TypeFormatFlags;
}>;
const defaultOptions: Options = {
  compilerOptions: { strict: true },
  typeFormat: ts.TypeFormatFlags.NoTruncation | ts.TypeFormatFlags.InTypeAlias,
};
let _options: Options = defaultOptions;
const configure = (options: Options): Options => {
  const oldOptions = { ..._options };
  _options = { ..._options, ...options };

  return oldOptions;
};

const getCallerTestFilePath = (trace: string[]) => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [header, ...rest] = trace;
  for (const line of rest) {
    const filepath = extractFilePath(line);
    if (filepath && (_options?.testFilePath?.(filepath) || filepath.match(/.*(test|spec)\.tsx?/))) {
      return filepath;
    }
  }

  throw new Error(`${pkgInfo.name}: failed get test file path`);
};

const extractFilePath = (trace: string) => {
  for (const pattern of [/at (.*):\d*:\d*$/, /at .*? \((.*):\d*:\d*\)$/]) {
    const match = trace.match(pattern);
    if (match && match[1]) {
      return match[1];
    }
  }

  return undefined;
};

const type = (typeName: string): string => {
  const callerTestFilePath = getCallerTestFilePath(new Error().stack?.split('\n') ?? []);
  const typeString = getTypeString(callerTestFilePath, typeName);
  if (!typeString) {
    throw new Error(`${pkgInfo.name}: not found \`${typeName}\` type in ${callerTestFilePath}`);
  }

  return typeString;
};

const getTypeString = (filePath: FilePath, typeName: string) => {
  const program = getProgram(filePath);
  const checker = program.getTypeChecker();
  const source = program.getSourceFile(filePath);
  if (!source) {
    throw new Error(`${pkgInfo.name}: can't load ${filePath}`);
  }

  const toTypeString = (node: ts.Node | undefined) => {
    if (node) {
      const typeLocation = checker.getTypeAtLocation(node);
      if (typeLocation) {
        return checker.typeToString(typeLocation, undefined, _options.typeFormat);
      }
    }

    return undefined;
  };

  return (
    toTypeString(
      source.statements.find(
        (st): st is ts.TypeAliasDeclaration =>
          ts.isTypeAliasDeclaration(st) && st.name.getText() === typeName
      )?.type
    ) ??
    toTypeString(
      source.statements.find(
        (st): st is ts.InterfaceDeclaration =>
          ts.isInterfaceDeclaration(st) && st.name.getText() === typeName
      )
    )
  );
};

export { configure, type };
export type { Options };
