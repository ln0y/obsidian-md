---
aliases: []
tags: ['TypeScript', 'date/2023-06', 'year/2023', 'month/06']
date: 2023-06-26-星期一 11:12:12
update: 2023-06-26-星期一 11:30:02
---

[原文地址](https://github.com/microsoft/TypeScript/wiki/Using-the-Compiler-API)

> 免责声明

请记住，这还是一个不完整的 API —— 我们将其发布版本定为 0.5，随着时间的流逝，情况会发生改变。毕竟第一次迭代，难免有些不完善的地方。希望社区能够多给予反馈以改进 API。为了允许用户在将来的版本之间转换，我们会记录每个新版本的 API 重大更改。

## 设置

首先你需要使用 `npm` 安装 TypeScript 且版本高于 1.6。

安装完成之后，你需要在项目路径下对 TypeScript 进行链接。否则会直接在全局链接。

```sh
npm install -g typescript
npm link typescript
```

对于某些示例，你还需要 Node.js 定义文件。运行下面命令来获取定义文件：

完成这些之后，可以尝试一下以下示例。

compiler API 有一些主要的组件：

- `Program` 是你整个应用程序的 TypeScript 术语
- `CompilerHost` 是用户系统 API，用于读取文件、检查目录和区分大小写。
- `SourceFiles` 代表应用程序中的源文件，同时包含文本和 TypeScript AST。

## 一个最小的编译器

这个例子是一个基础的编辑器，它能获取 TypeScript 的文件列表，并将它们编译成相应的 JavaScript。

我们可以通过 `createProgram` 来创建一个 `Program` —— 这会创建一个默认的 `ComplierHost`，它使用文件系统来获取文件。

```ts
import * as ts from 'typescript'

function compile(fileNames: string[], options: ts.CompilerOptions): void {
  let program = ts.createProgram(fileNames, options)
  let emitResult = program.emit()

  let allDiagnostics = ts.getPreEmitDiagnostics(program).concat(emitResult.diagnostics)

  allDiagnostics.forEach(diagnostic => {
    if (diagnostic.file) {
      let { line, character } = ts.getLineAndCharacterOfPosition(
        diagnostic.file,
        diagnostic.start!
      )
      let message = ts.flattenDiagnosticMessageText(diagnostic.messageText, '\n')
      console.log(
        `${diagnostic.file.fileName} (${line + 1},${character + 1}): ${message}`
      )
    } else {
      console.log(ts.flattenDiagnosticMessageText(diagnostic.messageText, '\n'))
    }
  })

  let exitCode = emitResult.emitSkipped ? 1 : 0
  console.log(`Process exiting with code '${exitCode}'.`)
  process.exit(exitCode)
}

compile(process.argv.slice(2), {
  noEmitOnError: true,
  noImplicitAny: true,
  target: ts.ScriptTarget.ES5,
  module: ts.ModuleKind.CommonJS,
})
```

## 一个简单的 transform 函数

创建一个 complier 不需要很多代码，但是你可能只想在给定 TypeScript 源文件的情况下获取相应的 JavaScript 输出。因此，你可以使用 `ts.transplieModule` 通过两行代码得到一个 `string => string` 的代码转换。

```ts
import * as ts from 'typescript'

const source = "let x: string = 'string'"

let result = ts.transpileModule(source, {
  compilerOptions: { module: ts.ModuleKind.CommonJS },
})

console.log(JSON.stringify(result))
```

## 从一个 JavaScript 文件中得到 DTS

只会在 TypeScript 3.7 及以上的版本上运行。这个例子用于说明如何获取 JavaScript 文件列表，并在终端显示其生成的 d.ts 文件。

```ts
import * as ts from 'typescript'

function compile(fileNames: string[], options: ts.CompilerOptions): void {
  // 用内存中的 emit 创建程序
  const createdFiles = {}
  const host = ts.createCompilerHost(options)
  host.writeFile = (fileName: string, contents: string) =>
    (createdFiles[fileName] = contents)

  // 准备并 emit 出 d.ts 文件
  const program = ts.createProgram(fileNames, options, host)
  program.emit()

  // 遍历所有的输入文件
  fileNames.forEach(file => {
    console.log('### JavaScript\n')
    console.log(host.readFile(file))

    console.log('### Type Defination\n')
    const dts = file.replace('.js', '.d.ts')
    console.log(createdFiles[dts])
  })
}

// 运行complier
compile(process.argv.slice(2), {
  allowJs: true,
  declaration: true,
  emitDeclarationOnly: true,
})
```

## 重新打印 TypeScript 文件的部分

本示例将会注销 JavaScript 源文件的 Typescript 子部分，当你希望你的应用程序的代码成为真实的来源时，这个模式是很有用的。例如通过 JSDoc 注释显示导出。

```ts
import * as ts from 'typescript'

/**
 * 从源文件中打印出特定的节点
 *
 * @param file a path to a file
 * @param identifiers top level identifiers available
 */
function extract(file: string, identifiers: string[]): void {
  // 创建一个代表项目的 Program
  // 然后取出它的源文件来解析它的 AST
  let program = ts.createProgram([file], { allowJs: true })
  const sourceFile = program.getSourceFile(file)

  // 为了打印 AST,我们将使用 TypeScript 的 printer
  const printer = ts.createPrinter({ newLine: ts.NewLineKind.LineFeed })

  // 要给出有建设性的错误消息，请跟踪找到和未找到的标识符
  const unfoundNodes = [],
    foundNodes = []

  // 循环文件 AST 的根节点
  ts.forEachChild(sourceFile, node => {
    let name = ''

    // 遍历源文件的 AST 的根节点，可能有个顶级的标识符
    // 你可以使用 https://ts-ast-viewer.com/ 展开这个列表，查看文件的 AST
    // 然后使用下面的相同模式
    if (ts.isFunctionDeclaration(node)) {
      name = node.name.text
      // 打印的时候隐藏方法主体
      node.body = undefined
    } else if (ts.isVariableStatement(node)) {
      name = node.declarationList.declarations[0].name.getText(sourceFile)
    } else if (ts.isInterfaceDeclaration(node)) {
      name = node.name.text
    }

    const container = identifiers.includes(name) ? foundNodes : unfoundNodes
    container.push([name, node])
  })

  // 要么打印找到的节点，要么提供找到的标识符的列表
  if (!foundNodes.length) {
    console.log(
      `Could not find any of ${identifiers.join(', ')} in ${file}, found: ${unfoundNodes
        .filter(f => f[0])
        .map(f => f[0])
        .join(', ')}.`
    )
    process.exitCode = 1
  } else {
    foundNodes.map(f => {
      const [name, node] = f
      console.log('###' + name + '\n')
      console.log(printer.printNode(ts.EmitHint.Unspecified, node, sourceFile)) + '\n'
    })
  }
}

// 使用脚本的参数来运行 extract 函数
extract(process.argv[2], process.argv.slice(3))
```

### 使用小的检查器来 Traverse AST

`Node` 接口是 TypeScript AST 的根接口。通常我们使用 `forEachChild` 函数来递归遍历树。这包含了访问者模式，并且通常会提供更多的灵活性。

作为如何遍历文件 AST 的例子，请考虑执行以下操作的最小的的检查器：

- 检查所有循环语句是否被花括号括起来。
- 检查所有 if/else 语句是否被花括号括起来。
- 强等符号 (`===` / `!==`) 是否用来替换了松的那种 (`==` / `!=`)。

```ts
import { readFileSync } from 'fs'
import * as ts from 'typescript'

export function delint(sourceFile: ts.SourceFile) {
  delintNode(sourceFile)

  function delintNode(node: ts.Node) {
    switch (node.kind) {
      case ts.SyntaxKind.ForStatement:
      case ts.SyntaxKind.ForInStatement:
      case ts.SyntaxKind.WhileStatement:
      case ts.SyntaxKind.DoStatement:
        if ((node as ts.IterationStatement).statement.kind !== ts.SyntaxKind.Block) {
          report(
            node,
            "A looping statement's contents should be wrapped in a block body."
          )
        }
        break

      case ts.SyntaxKind.IfStatement:
        const ifStatement = node as ts.IfStatement
        if (ifStatement.thenStatement.kind !== ts.SyntaxKind.Block) {
          report(
            ifStatement.thenStatement,
            "An if statement's contents should be wrapped in a block body."
          )
        }
        if (
          ifStatement.elseStatement &&
          ifStatement.elseStatement.kind !== ts.SyntaxKind.Block &&
          ifStatement.elseStatement.kind !== ts.SyntaxKind.IfStatement
        ) {
          report(
            ifStatement.elseStatement,
            "An else statement's contents should be wrapped in a block body."
          )
        }
        break

      case ts.SyntaxKind.BinaryExpression:
        const op = (node as ts.BinaryExpression).operatorToken.kind
        if (
          op === ts.SyntaxKind.EqualsEqualsToken ||
          op === ts.SyntaxKind.ExclamationEqualsToken
        ) {
          report(node, "Use '===' and '!=='.")
        }
        break
    }

    ts.forEachChild(node, delintNode)
  }

  function report(node: ts.Node, message: string) {
    const { line, character } = sourceFile.getLineAndCharacterOfPosition(node.getStart())
    console.log(`${sourceFile.fileName} (${line + 1},${character + 1}): ${message}`)
  }
}

const fileNames = process.argv.slice(2)
fileNames.forEach(fileName => {
  // Parse a file
  const sourceFile = ts.createSourceFile(
    fileName,
    readFileSync(fileName).toString(),
    ts.ScriptTarget.ES2015,
    /*setParentNodes */ true
  )

  // delint it
  delint(sourceFile)
})
```

在本例子中，我们不需要创建类型检查器，因为我们只想 traverse 每个源文件。

所有的 `ts.SyntaxKind` 能够在 [枚举类型](https://github.com/microsoft/TypeScript/blob/7c14aff09383f3814d7aae1406b5b2707b72b479/lib/typescript.d.ts#L78) 中找到。

## 编写增量程序监视器

TypeScript 2.7 引入了两个新的 API：一个用于创建 “watcher” 程序，并提供一组触发重构的 API；另一个 “builder” API，watcher 可以利用这个 API。`BuilderPrograms` 是一种 `Program` 实例，如果模块或其依赖项没有以级联方式更新，那么它就能缓存错误并在之前编译的模块上发出错误。“watcher”程序可以利用生成器程序实例在编译中只更新受影响文件的结果（例如错误并发出）。这可以加快有许多文件的大型项目的速度。

该 API 在 compiler 内部使用，用于实现 `--watch` 模式，但也可以被其他工具使用，例如：

```ts
import ts = require('typescript')

const formatHost: ts.FormatDiagnosticsHost = {
  getCanonicalFileName: path => path,
  getCurrentDirectory: ts.sys.getCurrentDirectory,
  getNewLine: () => ts.sys.newLine,
}

function watchMain() {
  const configPath = ts.findConfigFile(
    /*searchPath*/ './',
    ts.sys.fileExists,
    'tsconfig.json'
  )
  if (!configPath) {
    throw new Error("Could not find a valid 'tsconfig.json'.")
  }

  // TypeScript 可以使用几种不同的程序创建“策略”：
  // * ts.createEmitAndSemanticDiagnosticsBuilderProgram
  // * ts.createSemanticDiagnosticsBuilderProgram
  // * ts.createAbstractBuilder

  // 前两个 API 产生“生成器程序”。
  // 它们使用增量策略仅重新检查和发出文件，这些文件内容可能已经更改
  // 或者其依赖项可能发生改变，这些更改可能会影响先前的类型检查和发出结果的更改
  // 最后一个 API 会在每个更改后都会执行完整的类型检查。
  // 在 `createEmitAndSemanticDiagnosticsBuilderProgram` 和 `createSemanticDiagnosticsBuilderProgram` 唯一的区别是不会 emit
  // 对于纯类型检查场景，或者当另一个工具/进程处理发出时，使用 `createSemanticDiagnosticsBuilderProgram` 获取会更可取
  const createProgram = ts.createSemanticDiagnosticsBuilderProgram

  // 注意，`createWatchCompilerHost` 还有一个重载，它需要一组根文件。
  const host = ts.createWatchCompilerHost(
    configPath,
    {},
    ts.sys,
    createProgram,
    reportDiagnostic,
    reportWatchStatusChanged
  )

  // 从技术上讲，你可以覆盖主机上的任何给定钩子函数，尽管你可能不需要这样做。
  // 注意，我们假设 `origCreateProgram` 和 `origPostProgramCreate` 根本不使用 `this`。
  const origCreateProgram = host.createProgram
  host.createProgram = (rootNames: ReadonlyArray<string>, options, host, oldProgram) => {
    console.log("** We're about to create the program! **")
    return origCreateProgram(rootNames, options, host, oldProgram)
  }

  const origPostProgramCreate = host.afterProgramCreate
  host.afterProgramCreate = program => {
    console.log('** We finished making the program! **')
    origPostProgramCreate!(program)
  }

  // `createWatchProgram` 创建一个初始程序、监视文件，并随着时间的推移更新更新程序。
  ts.createWatchProgram(host)
}

function reportDiagnostic(diagnostic: ts.Diagnostic) {
  console.error(
    'Error',
    diagnostic.code,
    ':',
    ts.flattenDiagnosticMessageText(diagnostic.messageText, formatHost.getNewLine())
  )
}

/**
 * 每次监视状态更改时，都会打印出诊断信息
 * 这主要用于例如 “开始编译” 或 “编译完成” 之类的消息。
 */
function reportWatchStatusChanged(diagnostic: ts.Diagnostic) {
  console.info(ts.formatDiagnostic(diagnostic, formatHost))
}

watchMain()
```

## 使用语言服务的增量构建支持

> 可以参考 [Using the Language Service API](https://github.com/microsoft/TypeScript/wiki/Using-the-Language-Service-API) 得到更多详细信息。

服务层提供了一层附加的实用程序，可以帮助简化一些复杂的场景。在下面的代码段中，我们将尝试构建一个增量构建服务器，该服务器会监视一组文件并仅更新已更改的文件的输出。我们会创建一个叫做 `LanguageService` 对象来实现这一点。与上一个示例中的程序类似。我们需要一个 `LanguageServiceHost`。`LanguageServiceHost` 通过 `version`、`isOpen` 标志和 `ScriptSnapshot` 来实现这一点。该 `version` 允许语言服务跟踪文件的更改。`isOpen` 告诉语言服务在使用文件时将 AST 保存在内存中。`ScriptSnapshot` 是一种对文本的抽象，它允许语言服务查询更改。

如果你只是想实现监视样式的功能，可以去研究一下上面的监视器程序 API。

```ts
import * as fs from 'fs'
import * as ts from 'typescript'

function watch(rootFileNames: string[], options: ts.CompilerOptions) {
  const files: ts.MapLike<{ version: number }> = {}

  // 初始化文件列表
  rootFileNames.forEach(fileName => {
    files[fileName] = { version: 0 }
  })

  // 创建语言服务主机以允许 LS 与主机进行通信
  const serviceHost: ts.LanguageServiceHost = {
    getScriptFileNames: () => rootFileNames,
    getScriptVersion: fileName => files[fileName] && files[fileName].version.toString(),
    getScriptSnapshot: fileName => {
      if (!fs.existsSync(fileName)) {
        return undefined
      }
      return ts.ScriptSnapshot.fromString(fs.readFileSync(fileName).toString())
    },
    getCurrentDirectory: () => process.cwd(),
    getCompilationSettings: () => options,
    getDefaultLibFileName: options => ts.getDefaultLibFilePath(options),
    fileExists: ts.sys.fileExists,
    readFile: ts.sys.readFile,
    readDirectory: ts.sys.readDirectory,
    directoryExists: ts.sys.directoryExists,
    getDirectories: ts.sys.getDirectories,
  }

  // 创建语言服务文件
  const services = ts.createLanguageService(serviceHost, ts.createDocumentRegistry())

  // 开始监听程序
  rootFileNames.forEach(fileName => {
    // 首先，发出所有的文件
    emitFile(fileName)

    // 增加一个脚本在上面来监听下一次改变
    fs.watchFile(fileName, { persistent: true, interval: 250 }, (curr, prev) => {
      // 检查时间戳
      if (+curr.mtime <= +prev.mtime) {
        return
      }

      // 更新 version 表明文件已经修改
      files[fileName].version++

      // 把更改写入磁盘
      emitFile(fileName)
    })
  })

  function emitFile(fileName: string) {
    let output = services.getEmitOutput(fileName)

    if (!output.emitSkipped) {
      console.log(`Emitting ${fileName}`)
    } else {
      console.log(`Emitting ${fileName} failed`)
      logErrors(fileName)
    }

    output.outputFiles.forEach(o => {
      fs.writeFileSync(o.name, o.text, 'utf8')
    })
  }

  function logErrors(fileName: string) {
    let allDiagnostics = services
      .getCompilerOptionsDiagnostics()
      .concat(services.getSyntacticDiagnostics(fileName))
      .concat(services.getSemanticDiagnostics(fileName))

    allDiagnostics.forEach(diagnostic => {
      let message = ts.flattenDiagnosticMessageText(diagnostic.messageText, '\n')
      if (diagnostic.file) {
        let { line, character } = diagnostic.file.getLineAndCharacterOfPosition(
          diagnostic.start!
        )
        console.log(
          `  Error ${diagnostic.file.fileName} (${line + 1},${character + 1}): ${message}`
        )
      } else {
        console.log(`  Error: ${message}`)
      }
    })
  }
}

// 初始化组成程序的文件，使之成为当前目录中的所有 .ts 文件
const currentDirectoryFiles = fs
  .readdirSync(process.cwd())
  .filter(
    fileName => fileName.length >= 3 && fileName.substr(fileName.length - 3, 3) === '.ts'
  )

// 开始监听
watch(currentDirectoryFiles, { module: ts.ModuleKind.CommonJS })
```

## 自定义模块分辨率

通过实现可选方法，可以重写编译器解析模块的标准方式：`CompilerHost.resolvedModuleNames:`

> CompilerHost.resolveModuleNames(moduleNames: string\[\], containingFile: string): string\[\]

该方法在一个文件中给出一个模块名列表，并期望返回一个大小为 `moduleNames.length` 的数组，该数组的每个元素都存储以下任一内容：

- 具有非空属性 resolveFileName 的 ResolveModule 实例 moduleNames 数组中对应名称的解析
- 如果模块名称不能被解析就返回 `undefined`

你可以通过调用 resolveModuleName 来调用标准模块解析过程：

> `resolveModuleName(moduleName: string, containingFile: string, options: CompilerOptions, moduleResolutionHost: ModuleResolutionHost): ResolvedModuleNameWithFallbackLocations`.

这个函数返回一个对象，该对象存储模块解析的结果 (`resolvedModule` 属性的值) 以及在做出当前决策之前被认为是候选的文件名列表。

```ts
import * as ts from 'typescript'
import * as path from 'path'

function createCompilerHost(
  options: ts.CompilerOptions,
  moduleSearchLocations: string[]
): ts.CompilerHost {
  return {
    getSourceFile,
    getDefaultLibFileName: () => 'lib.d.ts',
    writeFile: (fileName, content) => ts.sys.writeFile(fileName, content),
    getCurrentDirectory: () => ts.sys.getCurrentDirectory(),
    getDirectories: path => ts.sys.getDirectories(path),
    getCanonicalFileName: fileName =>
      ts.sys.useCaseSensitiveFileNames ? fileName : fileName.toLowerCase(),
    getNewLine: () => ts.sys.newLine,
    useCaseSensitiveFileNames: () => ts.sys.useCaseSensitiveFileNames,
    fileExists,
    readFile,
    resolveModuleNames,
  }

  function fileExists(fileName: string): boolean {
    return ts.sys.fileExists(fileName)
  }

  function readFile(fileName: string): string | undefined {
    return ts.sys.readFile(fileName)
  }

  function getSourceFile(
    fileName: string,
    languageVersion: ts.ScriptTarget,
    onError?: (message: string) => void
  ) {
    const sourceText = ts.sys.readFile(fileName)
    return sourceText !== undefined
      ? ts.createSourceFile(fileName, sourceText, languageVersion)
      : undefined
  }

  function resolveModuleNames(
    moduleNames: string[],
    containingFile: string
  ): ts.ResolvedModule[] {
    const resolvedModules: ts.ResolvedModule[] = []
    for (const moduleName of moduleNames) {
      // try to use standard resolution
      let result = ts.resolveModuleName(moduleName, containingFile, options, {
        fileExists,
        readFile,
      })
      if (result.resolvedModule) {
        resolvedModules.push(result.resolvedModule)
      } else {
        // check fallback locations, for simplicity assume that module at location
        // should be represented by '.d.ts' file
        for (const location of moduleSearchLocations) {
          const modulePath = path.join(location, moduleName + '.d.ts')
          if (fileExists(modulePath)) {
            resolvedModules.push({ resolvedFileName: modulePath })
          }
        }
      }
    }
    return resolvedModules
  }
}

function compile(sourceFiles: string[], moduleSearchLocations: string[]): void {
  const options: ts.CompilerOptions = {
    module: ts.ModuleKind.AMD,
    target: ts.ScriptTarget.ES5,
  }
  const host = createCompilerHost(options, moduleSearchLocations)
  const program = ts.createProgram(sourceFiles, options, host)

  /// do something with program...
}
```

## 创建和打印 TypeScript AST

TypeScript 有工厂函数和可以结合使用的打印 API。

- 工厂函数允许你以 TypeScript 的 AST 格式生成新的树节点。
- 打印 API 可以获取现有的树结构 (由 `createSourceFile` 或工厂函数生成)，并生成输出字符串。

下面是一个使用这两个方法生成阶乘函数的示例:

```ts
import ts = require('typescript')

function makeFactorialFunction() {
  const functionName = ts.factory.createIdentifier('factorial')
  const paramName = ts.factory.createIdentifier('n')
  const parameter = ts.factory.createParameterDeclaration(
    /*decorators*/ undefined,
    /*modifiers*/ undefined,
    /*dotDotDotToken*/ undefined,
    paramName
  )

  const condition = ts.factory.createBinaryExpression(
    paramName,
    ts.SyntaxKind.LessThanEqualsToken,
    ts.factory.createNumericLiteral(1)
  )
  const ifBody = ts.factory.createBlock(
    [ts.factory.createReturnStatement(ts.factory.createNumericLiteral(1))],
    /*multiline*/ true
  )

  const decrementedArg = ts.factory.createBinaryExpression(
    paramName,
    ts.SyntaxKind.MinusToken,
    ts.factory.createNumericLiteral(1)
  )
  const recurse = ts.factory.createBinaryExpression(
    paramName,
    ts.SyntaxKind.AsteriskToken,
    ts.factory.createCallExpression(functionName, /*typeArgs*/ undefined, [
      decrementedArg,
    ])
  )
  const statements = [
    ts.factory.createIfStatement(condition, ifBody),
    ts.factory.createReturnStatement(recurse),
  ]

  return ts.factory.createFunctionDeclaration(
    /*decorators*/ undefined,
    /*modifiers*/ [ts.factory.createToken(ts.SyntaxKind.ExportKeyword)],
    /*asteriskToken*/ undefined,
    functionName,
    /*typeParameters*/ undefined,
    [parameter],
    /*returnType*/ ts.factory.createKeywordTypeNode(ts.SyntaxKind.NumberKeyword),
    ts.factory.createBlock(statements, /*multiline*/ true)
  )
}

const resultFile = ts.createSourceFile(
  'someFileName.ts',
  '',
  ts.ScriptTarget.Latest,
  /*setParentNodes*/ false,
  ts.ScriptKind.TS
)
const printer = ts.createPrinter({ newLine: ts.NewLineKind.LineFeed })

const result = printer.printNode(
  ts.EmitHint.Unspecified,
  makeFactorialFunction(),
  resultFile
)
console.log(result)
```

## 使用类型检查器

在本例中，我们将遍历 AST 并使用检查器来序列化类信息。我们将使用类型检查器来获取符号和类型信息，同时为导出的类、它们的构造函数和各自的构造函数参数获取 `JSDoc` 注释。

```ts
import * as ts from 'typescript'
import * as fs from 'fs'

interface DocEntry {
  name?: string
  fileName?: string
  documentation?: string
  type?: string
  constructors?: DocEntry[]
  parameters?: DocEntry[]
  returnType?: string
}

/** Generate documentation for all classes in a set of .ts files */
function generateDocumentation(fileNames: string[], options: ts.CompilerOptions): void {
  // Build a program using the set of root file names in fileNames
  let program = ts.createProgram(fileNames, options)

  // Get the checker, we will use it to find more about classes
  let checker = program.getTypeChecker()
  let output: DocEntry[] = []

  // Visit every sourceFile in the program
  for (const sourceFile of program.getSourceFiles()) {
    if (!sourceFile.isDeclarationFile) {
      // Walk the tree to search for classes
      ts.forEachChild(sourceFile, visit)
    }
  }

  // print out the doc
  fs.writeFileSync('classes.json', JSON.stringify(output, undefined, 4))

  return

  /** visit nodes finding exported classes */
  function visit(node: ts.Node) {
    // Only consider exported nodes
    if (!isNodeExported(node)) {
      return
    }

    if (ts.isClassDeclaration(node) && node.name) {
      // This is a top level class, get its symbol
      let symbol = checker.getSymbolAtLocation(node.name)
      if (symbol) {
        output.push(serializeClass(symbol))
      }
      // No need to walk any further, class expressions/inner declarations
      // cannot be exported
    } else if (ts.isModuleDeclaration(node)) {
      // This is a namespace, visit its children
      ts.forEachChild(node, visit)
    }
  }

  /** Serialize a symbol into a json object */
  function serializeSymbol(symbol: ts.Symbol): DocEntry {
    return {
      name: symbol.getName(),
      documentation: ts.displayPartsToString(symbol.getDocumentationComment(checker)),
      type: checker.typeToString(
        checker.getTypeOfSymbolAtLocation(symbol, symbol.valueDeclaration!)
      ),
    }
  }

  /** Serialize a class symbol information */
  function serializeClass(symbol: ts.Symbol) {
    let details = serializeSymbol(symbol)

    // Get the construct signatures
    let constructorType = checker.getTypeOfSymbolAtLocation(
      symbol,
      symbol.valueDeclaration!
    )
    details.constructors = constructorType
      .getConstructSignatures()
      .map(serializeSignature)
    return details
  }

  /** Serialize a signature (call or construct) */
  function serializeSignature(signature: ts.Signature) {
    return {
      parameters: signature.parameters.map(serializeSymbol),
      returnType: checker.typeToString(signature.getReturnType()),
      documentation: ts.displayPartsToString(signature.getDocumentationComment(checker)),
    }
  }

  /** True if this is visible outside this file, false otherwise */
  function isNodeExported(node: ts.Node): boolean {
    return (
      (ts.getCombinedModifierFlags(node as ts.Declaration) & ts.ModifierFlags.Export) !==
        0 ||
      (!!node.parent && node.parent.kind === ts.SyntaxKind.SourceFile)
    )
  }
}

generateDocumentation(process.argv.slice(2), {
  target: ts.ScriptTarget.ES5,
  module: ts.ModuleKind.CommonJS,
})
```

使用这个脚本:

```sh
tsc docGenerator.ts --m commonjs
node docGenerator.js test.ts
```

输入以下例子：

```ts
/**
 * Documentation for C
 */
class C {
  /**
   * constructor documentation
   * @param a my parameter documentation
   * @param b another parameter documentation
   */
  constructor(a: string, b: C) {}
}
```

我们能拿到这样的输出：

```json
[
  {
    "name": "C",
    "documentation": "Documentation for C ",
    "type": "typeof C",
    "constructors": [
      {
        "parameters": [
          {
            "name": "a",
            "documentation": "my parameter documentation",
            "type": "string"
          },
          {
            "name": "b",
            "documentation": "another parameter documentation",
            "type": "C"
          }
        ],
        "returnType": "C",
        "documentation": "constructor documentation"
      }
    ]
  }
]
```
