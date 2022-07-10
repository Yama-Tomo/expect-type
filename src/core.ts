import { Project, ProjectOptions, SourceFile, TypeFormatFlags } from 'ts-morph';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const pkgInfo = require('../package.json');

let _project: Project | undefined;
const getProject = () => {
  if (!_project) {
    _project = new Project(_options?.projectOptions);
  }

  return _project;
};

type Options = Partial<{
  projectOptions: ProjectOptions;
  testFilePath: (filePath: string) => boolean;
  typeFormat: TypeFormatFlags;
}>;
const defaultOptions: Options = {
  projectOptions: {
    compilerOptions: { strict: true },
  },
  typeFormat: TypeFormatFlags.NoTruncation | TypeFormatFlags.InTypeAlias,
};
let _options: Options = defaultOptions;
const configure = (options: Options): Options => {
  const oldOptions = { ..._options };
  _options = { ..._options, ...options };

  return oldOptions;
};

const _tsSources: Record<string, SourceFile> = {};

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

  if (!_tsSources[callerTestFilePath]) {
    _tsSources[callerTestFilePath] = getProject().addSourceFileAtPath(callerTestFilePath);
  }

  const tsSource = _tsSources[callerTestFilePath];
  const typeString =
    tsSource.getTypeAlias(typeName)?.getType().getText(undefined, _options.typeFormat) ??
    tsSource.getInterface(typeName)?.getType().getText(undefined, _options.typeFormat);
  if (!typeString) {
    throw new Error(`${pkgInfo.name}: not found \`${typeName}\` type in ${callerTestFilePath}`);
  }

  return typeString;
};

export { configure, type };
export type { Options };
