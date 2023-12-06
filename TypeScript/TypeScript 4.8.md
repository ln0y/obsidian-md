---
aliases: []
tags: ['TypeScript', 'date/2022-08', 'year/2022', 'month/08']
date: 2022-08-31-星期三 10:48:18
update: 2022-08-31-星期三 14:08:25
---

>英文原味版请临幸 [Announcing TypeScript 4.8](https://devblogs.microsoft.com/typescript/announcing-typescript-4-8/)。

就在上周微软发布了 TypeScript 4.8 新版本，一起来看看都有哪些新的功能：

- [改进的交叉类型、联合兼容性和类型收窄](https://devblogs.microsoft.com/typescript/announcing-typescript-4-8/#smarter-type-narrowing-and-simplifications 'https://devblogs.microsoft.com/typescript/announcing-typescript-4-8/#smarter-type-narrowing-and-simplifications')
- [改进了对`infer`模板字符串类型中的类型的推理](https://devblogs.microsoft.com/typescript/announcing-typescript-4-8/#infer-types-template-strings 'https://devblogs.microsoft.com/typescript/announcing-typescript-4-8/#infer-types-template-strings')
- [`--build` `--watch` `--incremental` 性能改进](https://devblogs.microsoft.com/typescript/announcing-typescript-4-8/#build-watch-incremental-improvements 'https://devblogs.microsoft.com/typescript/announcing-typescript-4-8/#build-watch-incremental-improvements')
- [比较对象和数组文字时的错误](https://devblogs.microsoft.com/typescript/announcing-typescript-4-8/#object-array-comparison-errors 'https://devblogs.microsoft.com/typescript/announcing-typescript-4-8/#object-array-comparison-errors')
- [从绑定模式改进推理](https://devblogs.microsoft.com/typescript/announcing-typescript-4-8/#inference-binding-patterns 'https://devblogs.microsoft.com/typescript/announcing-typescript-4-8/#inference-binding-patterns')
- [文件监视修复（尤其是跨 git checkouts）](https://devblogs.microsoft.com/typescript/announcing-typescript-4-8/#file-watching-fixes 'https://devblogs.microsoft.com/typescript/announcing-typescript-4-8/#file-watching-fixes')
- [Find-All-References 性能改进](https://devblogs.microsoft.com/typescript/announcing-typescript-4-8/#find-all-refs-improvements 'https://devblogs.microsoft.com/typescript/announcing-typescript-4-8/#find-all-refs-improvements')
- [从自动导入中排除特定文件](https://devblogs.microsoft.com/typescript/announcing-typescript-4-8/#exclude-globs-auto-import 'https://devblogs.microsoft.com/typescript/announcing-typescript-4-8/#exclude-globs-auto-import')
- [正确性修复和重大更改](https://devblogs.microsoft.com/typescript/announcing-typescript-4-8/#correctness-changes 'https://devblogs.microsoft.com/typescript/announcing-typescript-4-8/#correctness-changes')

> 如果您还不熟悉 TypeScript，可以在 [官网了解有关 TypeScript 的更多信息](https://www.typescriptlang.org/ 'https://www.typescriptlang.org/')。它是一种基于 JavaScript 并为类型添加语法的语言。这些类型让您可以将您的期望和假设放入代码中，然后可以通过 TypeScript 类型检查器检查这些假设。
>
> 这种检查可以帮助 **避免拼写错误**、**调用未初始化的值**、**混淆函数的参数** 等等。类型不仅仅是检查，它还用于为您提供强大的 TypeScript 和 JavaScript 编辑体验，支持代码完成、转到定义、重命名等。我们所熟悉的 Visual Studio 就是完全使用 TypeScript 开发的！

要开始使用 TypeScript，可以 [通过 NuGet](https://www.nuget.org/packages/Microsoft.TypeScript.MSBuild 'https://www.nuget.org/packages/Microsoft.TypeScript.MSBuild') 获取它，或者通过以下命令使用 npm：

```shell
npm install -D typescript
```

还可以通过以下方式获得编辑器支持

- [下载 Visual Studio 2022/2019](https://marketplace.visualstudio.com/items%3FitemName%3DTypeScriptTeam.TypeScript-48 'https://marketplace.visualstudio.com/items?itemName=TypeScriptTeam.TypeScript-48')
- [安装 Visual Studio Code 的 Insiders 版本](http://code.visualstudio.com/insiders 'http://code.visualstudio.com/insiders') 或按照说明 [使用较新版本的 TypeScript](https://code.visualstudio.com/docs/typescript/typescript-compiling#_using-newer-typescript-versions 'https://code.visualstudio.com/docs/typescript/typescript-compiling#_using-newer-typescript-versions')
- [使用 Sublime Text 3 的包控制](https://packagecontrol.io/packages/TypeScript 'https://packagecontrol.io/packages/TypeScript')。

## 自 Beta 版和 RC 版以来有什么新变化？

自 [测试版发布](https://devblogs.microsoft.com/typescript/announcing-typescript-4-8-beta/ 'https://devblogs.microsoft.com/typescript/announcing-typescript-4-8-beta/') 以来，其稳定版现在 [支持排除哪些文件被考虑在自动导入](https://devblogs.microsoft.com/typescript/announcing-typescript-4-8/#exclude-globs-auto-import 'https://devblogs.microsoft.com/typescript/announcing-typescript-4-8/#exclude-globs-auto-import') 中。测试版发布帖子也没有记录类型签名中未使用的解构别名的突破。此外，Beta 版和 RC 帖子都没有记录关于在 TypeScript 语法树上放置装饰器的 API 中断。这些中断现在在 [正确性修复和重大更改部分中进行了详细说明](https://devblogs.microsoft.com/typescript/announcing-typescript-4-8/#correctness-changes 'https://devblogs.microsoft.com/typescript/announcing-typescript-4-8/#correctness-changes')

## 改进交叉类型、联合兼容性和收窄

TypeScript 4.8 版本对  `--strictNullChecks`  进行了改进增强，这些更改会联合类型与交叉类型的工作方式，并在类型收缩时加以利用。

例如，人们普遍认为 `unknown` 和  `{} | null | undefined` 很接近，因为它接受 `null`, `undefined` 和任何其他类型。TypeScript 现在可以识别这一点，并允许从 to 赋值。

```ts
function f(x: unknown, y: {} | null | undefined) {
  x = y // always worked
  y = x // used to error, now works
}
```

另一个变化是，`{}` 与任何其他对象类型相交会直接简化为该对象类型。这意味着能够像下面这样重写 `NonNullable` ，因为 `{} & null`  和  `{} & undefined` 只是被扔掉了。

```ts
- type NonNullable<T> = T extends null | undefined ? never : T;
+ type NonNullable<T> = T & {};
```

这个改进可以减少和分配像这样的交集类型，而条件类型目前不能。

```ts
function foo<T>(x: NonNullable<T>, y: NonNullable<NonNullable<T>>) {
  x = y // always worked
  y = x // used to error, now works
}
```

这些更改还使我们能够在控制流分析和类型缩小方面进行明智的改进。

```ts
function narrowUnknownishUnion(x: {} | null | undefined) {
  if (x) {
    x // {}
  } else {
    x // {} | null | undefined
  }
}

function narrowUnknown(x: unknown) {
  if (x) {
    x // used to be 'unknown', now '{}'
  } else {
    x // unknown
  }
}
```

我们现在可以在没有任何类型断言的情况下定义以下函数。

```ts
function throwIfNullable<T>(value: T): NonNullable<T> {
  if (value === undefined || value === null) {
    throw Error('Nullable value!')
  }

  // Used to fail because 'T' was not assignable to 'NonNullable<T>'.
  // Now narrows to 'T & {}' and succeeds because that's just 'NonNullable<T>'.
  return value
}
```

有关这些改进的更多细节，可以 [在此处阅读更多信息](https://github.com/microsoft/TypeScript/pull/49119 'https://github.com/microsoft/TypeScript/pull/49119')。

## 改进了对 `infer` 模板字符串类型中的类型的推理

TypeScript 最近引入了一种向条件类型中的类型变量添加 `extends` 约束的方法。`infer`

```ts
// Grabs the first element of a tuple if it's assignable to 'number',
// and returns 'never' if it can't find one.
type TryGetNumberIfFirst<T> = T extends [infer U extends number, ...unknown[]] ? U : never
```

如果这些 `infer` 类型出现在模板字符串类型中并且被限制为原始类型，TypeScript 现在将尝试解析出文字类型。

```ts
// SomeNum used to be 'number'; now it's '100'.
type SomeNum = '100' extends `${infer U extends number}` ? U : never

// SomeBigInt used to be 'bigint'; now it's '100n'.
type SomeBigInt = '100' extends `${infer U extends bigint}` ? U : never

// SomeBool used to be 'boolean'; now it's 'true'.
type SomeBool = 'true' extends `${infer U extends boolean}` ? U : never
```

这现在可以更好地传达库在运行时将做什么，并提供更精确的类型。

可以 [在此处查看有关此功能的更多信息](https://github.com/microsoft/TypeScript/pull/48094 'https://github.com/microsoft/TypeScript/pull/48094')。

## `--build`, `--watch`, `--incremental`  性能改进

TypeScript 4.8 引入了一些优化，这些优化现在能够避免在模式的无操作更改期间花费时间更新时间戳，这使得重建速度更快，并避免与可能正在监视 TypeScript 输出的其他构建工具混淆。

微软生成在一个相当大的内部代码库中，他们已经看到许多简单的常见操作的时间减少了 10%-25%，在无变化的情况下减少了大约 40% 的时间，而在 TypeScript 代码库上也看到了类似的结果。

可以 [在 GitHub 上查看更改以及性能结果](https://github.com/microsoft/TypeScript/pull/48784 'https://github.com/microsoft/TypeScript/pull/48784')。

## 比较对象和数组文字时的错误

在 JavaScript 中，通常 `==` 或 `===` 只能在对象（以及数组）之间检查两个引用是否指向相同的值，并不能判断值相等，团队认为这有可能导致生产代码中的一些错误。TypeScript 现在不允许像下面这样的代码。

```ts
if (peopleAtHome === []) {
  //  ~~~~~~~~~~~~~~~~~~~
  // This condition will always return 'false' since JavaScript compares objects by reference, not value.
  console.log("here's where I lie, broken inside. </3")
  adoptAnimals()
}
```

可以在此处查看 [所涉及的更改](https://github.com/microsoft/TypeScript/pull/45978 'https://github.com/microsoft/TypeScript/pull/45978')。

## 从绑定模式改进推导

在某些情况下，TypeScript 会从绑定模式中选择一个类型以进行更好的推导。

```ts
declare function chooseRandomly<T>(x: T, y: T): T

let [a, b, c] = chooseRandomly([42, true, 'hi!'], [0, false, 'bye!'])
//   ^  ^  ^
//   |  |  |
//   |  |  string
//   |  |
//   |  boolean
//   |
//   number
```

了解更多信息，可以 [查看 GitHub 上的更改。](https://github.com/microsoft/TypeScript/pull/49086 'https://github.com/microsoft/TypeScript/pull/49086')

## 文件监视修复（尤其是跨 `git checkout`）

TypeScript 在 watch 模式和编辑器场景下很难对某些文件进行修改，有时症状是陈旧的或不准确的错误，可能需要重新启动 tsc 或 VS Code。如果在 Unix 系统中使用 vim 保存文件或在 git 中交换分支的话，这种情况经常发生。

这是由于对 Node.js 如何跨文件系统处理重命名事件的假设造成的。Linux 和 macOS 使用的文件系统使用 [inode](https://en.wikipedia.org/wiki/Inode 'https://en.wikipedia.org/wiki/Inode')，并且 [Node.js 会将文件观察程序附加到 inode 而不是文件路径](https://nodejs.org/api/fs.html#inodes 'https://nodejs.org/api/fs.html#inodes')。因此，当 Node.js 返回 [一个观察者对象](https://nodejs.org/api/fs.html#class-fsfswatcher 'https://nodejs.org/api/fs.html#class-fsfswatcher') 时，它是正在观察路径还是在索引节点，得取决于平台和文件系统。

如果 TypeScript 检测到磁盘上仍然存在路径，它会尝试重用相同的观察者对象，这是为了提高效率，但也就是它导致了问题所在，因为即使该路径上仍然存在一个文件，也可能已经创建了一个不同的文件，并且该文件将具有不同的 inode。因此，TypeScript 最终会重用 watcher 对象，而不是在原始位置安装新的 watcher，并在可能完全不相关的文件中监视更改。因此 TypeScript 4.8 现在可以在 inode 系统上处理这些情况，并正确安装新的观察程序并修复此问题。

可以在此处查看 [有关文件监视的特定修复](https://github.com/microsoft/TypeScript/pull/48997 'https://github.com/microsoft/TypeScript/pull/48997')。

## Find-All-References 性能改进

在编辑器中运行 find-all-references 时，TypeScript 现在能够更智能地聚合引用。这将 TypeScript 在其自己的代码库中搜索广泛使用的标识符所花费的时间减少了约 20%。

可以在此处阅读 [有关改进的更多信息](https://github.com/microsoft/TypeScript/pull/49581 'https://github.com/microsoft/TypeScript/pull/49581')。

## 从自动导入中排除特定文件

TypeScript 4.8 引入了一个编辑器偏好，用于从自动导入中排除文件。在 Visual Studio Code 中，文件名或 glob 可以添加在 Settings UI 中的“自动导入文件排除模式”下，或者在.vscode/ Settings 中。json 文件:

```ts
{
    // Note that `javascript.preferences.autoImportFileExcludePatterns` can be specified for JavaScript too.
    "typescript.preferences.autoImportFileExcludePatterns": [
      "**/node_modules/@types/node"
    ]
}
```

这在无法避免编译中包含某些模块或库，但又不太希望它们导入的情况下很有用。这些模块可能有很多可能会污染自动导入列表并使其更难自动的导出，而此选项可以在这些情况下提供帮助。

您可以 [在此处查看有关实施的更多细节](https://github.com/microsoft/TypeScript/pull/49578 'https://github.com/microsoft/TypeScript/pull/49578')。

## 正确性修复和重大更改

由于类型系统更改的性质，可以进行的更改很少不会影响 _ 某些 _ 代码；但是，有一些更改更有可能需要调整现有代码。

### `lib.d.ts` 更新

虽然 TypeScript 努力避免大的中断，但即使是对内置库的小改动也会导致问题。我们不认为 DOM 和 lib.d.ts 更新会导致重大中断，但一个值得注意的变化是 Errors 上的 cause 属性现在的类型为 unknown，而不是 Error。

### 不受约束的泛型不再可分配给 `{}`

在 TypeScript 4.8 中，对于启用了 strictNullChecks 的项目，当不受约束的类型参数被用在 null 或 undefined 不是合法值的位置时，TypeScript 现在会正确地发出错误。这将包括任何需要 `{}`、`object` 或具有所有可选属性的对象类型。

一个简单的例子:

```ts
// Accepts any non-null non-undefined value
function bar(value: {}) {
  Object.keys(value) // This call throws on null/undefined at runtime.
}

// Unconstrained type parameter T...
function foo<T>(x: T) {
  bar(x) // Used to be allowed, now is an error in 4.8.
  //  ~
  // error: Argument of type 'T' is not assignable to parameter of type '{}'.
}

foo(undefined)
```

如上所示，这样的代码有一个潜在的错误 `null` `undefined` 这些值可以通过这些不受约束的类型参数间接传递给不应该观察这些值的代码。

此行为也将在类型位置中可见，一个例子是：

```ts
interface Foo<T> {
  x: Bar<T>
}

interface Bar<T extends {}> {}
```

不想处理的现有代码 `null` 可以 `undefined` 通过传播适当的约束来修复。

```ts
- function foo<T>(x: T) {
+ function foo<T extends {}>(x: T) {
```

另一种解决方法是在运行时检查 `null` 和 `undefined`。

```ts
  function foo<T>(x: T) {
+     if (x !== null && x !== undefined) {
          bar(x);
+     }
  }
```

如果知道由于某种原因，通用值不能是 `null`or `undefined`，可以只使用非空断言。

```ts
function foo<T>(x: T) {
  ;-bar(x)
  ;+bar(x!)
}
```

有关更多信息，可以 [查看引入此内容的更改](https://github.com/microsoft/TypeScript/pull/49119 'https://github.com/microsoft/TypeScript/pull/49119') 以及 [关于无约束泛型现在如何工作的具体讨论问题](https://github.com/microsoft/TypeScript/issues/49489 'https://github.com/microsoft/TypeScript/issues/49489')。

### 装饰器放置在 `modifiers`TypeScript 的语法树上

TypeScript 公开了一个名为 ModifierLike 的新类型别名，它是一个 Modifier 或 Decorator。

```ts
export type ModifierLike = Modifier | Decorator
```

有关更多信息，请参阅周围的更改

- [树节点的重组](https://github.com/microsoft/TypeScript/pull/49089 'https://github.com/microsoft/TypeScript/pull/49089')
- [弃用](https://github.com/microsoft/TypeScript/pull/50343 'https://github.com/microsoft/TypeScript/pull/50343')
- [暴露谓词函数](https://github.com/microsoft/TypeScript/pull/50399 'https://github.com/microsoft/TypeScript/pull/50399')

### 无法在 JavaScript 文件中导入/导出类型

TypeScript 以前允许 JavaScript 文件在 import 和 export 语句中导入和导出使用类型声明但没有值的实体，这种行为是不正确的，因为在 ECMAScript 模块下，不存在的值的命名导入和导出将导致运行时错误。当一个 JavaScript 文件在 `——checkJs` 下或通过 `// @ts-check` 注释进行类型检查时，TypeScript 现在会发出一个错误。

```ts
// @ts-check

// Will fail at runtime because 'SomeType' is not a value.
import { someValue, SomeType } from 'some-module'

/**
 * @type {SomeType}
 */
export const myValue = someValue

/**
 * @typedef {string | number} MyType
 */

// Will fail at runtime because 'MyType' is not a value.
export { MyType as MyExportedType }
```

要从另一个模块引用类型，可以直接限制导入。

```ts
- import { someValue, SomeType } from "some-module";
+ import { someValue } from "some-module";

  /**
-  * @type {SomeType}
+  * @type {import("some-module").SomeType}
   */
  export const myValue = someValue;
```

要导出类型，只需 `/** @typedef */` 在 JSDoc 中使用注释即可。 `@typedef` 注释已经自动从其包含的模块中导出类型。

```ts
  /**
   * @typedef {string | number} MyType
   */

+ /**
+  * @typedef {MyType} MyExportedType
+  */
- export { MyType as MyExportedType };
```

可以在此处阅读 [有关更改的更多信息](https://github.com/microsoft/TypeScript/pull/49580 'https://github.com/microsoft/TypeScript/pull/49580')。

### 绑定模式中未使用的重命名现在是类型签名中的错误

TypeScript 的类型注释语法通常看起来可以在解构值时使用。例如，采用以下函数。

```ts
declare function makePerson({ name: string, age: number }): Person
```

读到这个签名时，您可能会认为 makePerson 显然接受了一个对象，该对象的 name 属性为类型字符串，age 属性为类型数字。然而 makePerson 虽然确实表示它将接受一个具有名称和年龄属性的对象，却没有为它们指定类型，它只是说它将名称和年龄分别重命名为字符串和数字。

在纯类型构造中，编写这样的代码是没有用的，而且通常是错误的，因为开发人员通常认为他们正在编写类型注释。

TypeScript 4.8 使这些成为错误，除非稍后在签名中引用它们。编写上述签名的正确方法如下：

```ts
declare function makePerson(options: { name: string; age: number }): Person
// or
declare function makePerson({ name, age }: { name: string; age: number }): Person
```

[在此处阅读更改](https://github.com/microsoft/TypeScript/pull/41044 'https://github.com/microsoft/TypeScript/pull/41044')。
