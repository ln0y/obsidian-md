---
aliases: []
tags: ['TypeScript', 'date/2024-05', 'year/2024', 'month/05']
date: 2024-05-16-星期四 10:54:19
update: 2024-05-16-星期四 13:51:40
---

> 英文原味版请临幸 [Announcing TypeScript 5.4](https://devblogs.microsoft.com/typescript/announcing-typescript-5-4)。

T5 新增功能的速览列表：

- js 新方法：`Object.groupBy` 和 `Map.groupBy`
- 保留上次赋值后的闭包收窄范围
- `NoInfer` 工具类型
- 支持 `--moduleResolution bundler` 和 `--module preserve` 中的 `require()` 调用
- 检查导入属性和断言
- 添加缺失参数的快速修复
- 对子路径导入的自动导入支持
- TS 5.5 即将废弃的功能

## JS 新方法：`Object.groupBy` 和 `Map.groupBy`

TS 5.4 添加了 JS 新型的 `Object.groupBy` 和 `Map.groupBy` 静态方法的声明。

`Object.groupBy` 接收一个可迭代对象和一个函数，该函数决定每个元素应放置在哪个“分组”中。该函数需要为每个不同的分组创建一个“键”，并且 `Object.groupBy` 使用该键创建一个对象，其中每个键都映射到其中包含原始元素的数组。

举个栗子，奇偶分组：

```js
const array = [0, 1, 2, 3, 4, 5]

const myObj = Object.groupBy(array, (num, index) => {
  return num % 2 === 0 ? 'even' : 'odd'
})
```

“图灵等价”的功能大致如下：

```js
const myObj = {
  even: [0, 2, 4],
  odd: [1, 3, 5],
}
```

`Map.groupBy` 大抵相同，但生成结果是 `Map` 而不是普通对象。如果我们存在 `Map` 的刚需，我们正在处理需要 `Map` 的 API，或者我们需要使用任意类型的键进行分组，而不是能且仅能用作 JS 中的属性名的键，那么这个方法可能更加理想。

```js
const myObj = Map.groupBy(array, (num, index) => {
  return num % 2 === 0 ? 'even' : 'odd'
})
```

“图灵等价”的功能大致如下：

```js
const myObj = new Map()

myObj.set('even', [0, 2, 4])
myObj.set('odd', [1, 3, 5])
```

粉丝请注意，在上述示例中，生成的对象会使用所有可选属性。

```ts
interface EvenOdds {
  even?: number[]
  odd?: number[]
}

const myObj: EvenOdds = Object.groupBy({})

myObj.even
// 启用 'strictNullChecks' 是这样访问会报错。
```

这是因为无法以通用方式保证所有键都是由 `groupBy` 生成的。

粉丝请注意，这些方法只能通过将 `target` 配置为 `esnext` 或调整 `lib` 设置来访问。我们预计它们最终会在稳定的 `es2024` 目标下可用。

## 保留上次赋值后的闭包收窄范围

TS 通常可以根据我们执行的检查自动识别变量的具体类型。这个过程称为类型收窄（narrowing）。

```ts
function uppercaseStrings(x: string | number) {
  if (typeof x === 'string') {
    // TS 知道这里的 x 是 string 类型
    return x.toUpperCase()
  }
}
```

一个常见的痛点是这些收窄的类型并不总是保留在函数闭包中。

```ts
function getUrls(url: string | URL, names: string[]) {
  if (typeof url === 'string') {
    url = new URL(url)
  }

  return names.map(name => {
    url.searchParams.set('name', name)
    // 报错！
    // 类型 'string | URL' 上不存在 searchParams 属性
    return url.toString()
  })
}
```

在这里，TS 认为假设 `url` 实际上是回调函数中的 `URL` 对象是不“安全”的，因为它在其他地方发生了变化；虽然但是，在这种情况下，箭头函数总是在对 `url` 赋值之后创建，并且这也是对 `url` 的最后一次赋值。

TS 5.4 利用这一点使类型收窄更加智能。当参数和 `let` 变量在非提升函数（non-hoisted function）中使用时，类型检查器会查找最后一个赋值点。如果找到，TS 可以安全地从包含函数的外部收窄类型范围。这意味着，上述例子现在可以奏效而不会报错了。

粉丝请注意，如果变量在嵌套函数中的任意位置赋值，那么类型收窄智能分析不会启动。这是因为无法确定该函数稍后是否会被调用。

```ts
function printValueLater(value: string | undefined) {
  if (value === undefined) {
    value = 'missing!'
  }

  setTimeout(() => {
    // 即使修改 value 的方式不会影响其类型，
    // 也会使闭包中的类型精细化失效
    value = value
  }, 500)

  setTimeout(() => {
    console.log(value.toUpperCase())
    // 报错，value 可能是 undefined
  }, 1000)
}
```

这应该会使许多典型的 JS 代码更容易表达。

## `NoInfer` 工具类型

调用泛型函数时，TS 能够根据我们传入的任意实参推断类型参数。

```ts
function doSomething<T>(arg: T) {}

// 我们可以明示 T 应该是 string 类型
doSomething<string>('hello!')
// 我们也可以让 T 的类型被自动推断出来
doSomething('hello!')
```

虽然但是，一个难题在于，并不总是清楚要推断的“最佳”类型是什么。这可能会导致 TS 拒绝有效的调用、接受有问题的调用，或者在捕获错误时只报告更糟糕的错误消息。

举个栗子，假设有一个 `createStreetLight` 红绿灯函数，它接受颜色名称列表以及可选的默认颜色。

```ts
function createStreetLight<C extends string>(colors: C[], defaultColor?: C) {}

createStreetLight(['red', 'yellow', 'green'], 'red')
```

当我们传入原始 `colors` 数组中没有的 `defaultColor` 时会发生什么？在此函数中，`colors` 应该是“单一数据源”（source of truth），并说明可以传递给 `defaultColor` 的默认颜色值。

```ts
// 夭寿啦！红绿灯默认是蓝色？
// 这简直无语子，但 TS 居然允许这种操作！
createStreetLight(['red', 'yellow', 'green'], 'blue')
```

在此调用中，类型推断确定 `'blue'` 与 `'red' | 'yellow' | 'green'` 一样有效。因此，TS 不会拒绝调用，而是将泛型 `C` 的类型推断为 `'red' | 'yellow' | 'green' | 'blue'`。你可能会直接破防，这个类型推断十分猪头！

我们目前处理此问题的方案之一是，添加一个受现有类型参数限制的单独类型参数。

```ts
function createStreetLight<C extends string, D extends C>(
  colors: C[],
  defaultColor?: D
) {}

createStreetLight(['red', 'yellow', 'green'], 'blue')
// 报错！
// 'blue' 的参数类型无法赋值给 "red" | "yellow" | "green" | undefined 类型
```

这行之有效，但有点猪头，因为 `D` 可能不会在 `createStreetLight` 函…的其他地方复用。虽然在这种场景下差强人意，但在函数签名中有且仅有使用一次的类型参数通常会产生“代码屎山”。

这就是 TS 5.4 引入新型的 `NoInfer<T>` 工具类型的原因。`NoInfer<…>` 中的类型会向 TS 发射电波，告诉 TS 不要深究并匹配内部类型，查找类型推断的候选者。

使用 `NoInfer`，我们可以重构 `createStreetLight`，如下所示：

```ts
function createStreetLight<C extends string>(colors: C[], defaultColor?: NoInfer<C>) {}

createStreetLight(['red', 'yellow', 'green'], 'blue')
// 报错！
// 'blue' 的参数类型无法赋值给 "red" | "yellow" | "green" | undefined 类型
```

将 `defaultColor` 的类型排除在推断的探索之外意味着，`'blue'` 永远不会成为类型推断的候选者，并且类型检查器可以拒绝它。

## 支持 `--moduleResolution bundler` 和 `--module preserve` 中的 `require()` 调用

TS 有一个名为 `bundler` 的 `moduleResolution` 选项，旨在…打包程序确定导入路径引…件的方式进行建模。该选项的限制之一是，它必须与 `--module esnext` 配对，从而无法使用 `import … = require(…)` 语法。

```ts
// 以前会报错
import myModule = require('module/path')
```

如果我们打算只编写标准 ES6 的 `import`，这似乎无关痛痒，但是当使用带有条件导出（conditional exports）的软件包时，就会有所区别。

在 TS 5.4 中，现在可以在将 `module` 设置为名为 `preserve` 的新选项时使用 `require()`。

在 `--module preserve` 和 `--moduleResolution bundler` 之间，两者可以更准确地模拟 Bun 等打包器和运行时允许的内容，以及它们执行模块查找的方式。事实上，当使用 `--module preserve` 时，`bundler` 选项会被隐式设置为 `--moduleResolution/--esModuleInterop/--resolveJsonModule`。

```js
{
  "compilerOptions": {
    "module": "preserve"
    // 隐式设置:
    // "moduleResolution": "bundler",
    // "esModuleInterop": true,
    // "resolveJsonModule": true,
  }
}
```

在 `--module preserve` 下，ES6 `import` 会始终按原样触发，而 `import … = require(…)` 会作为 `require()` 调用触发。尽管在实践中，我们甚至可能不会使用 TS 来 emit，因为我们可能会为代码使用打包器。无论包含文件的文件扩展名如何，这都成立。所以这段代码的输出：

```ts
import * as foo from 'some-package/foo'
import bar = require('some-package/bar')
```

看起来应该像这样：

```js
import * as foo from 'some-package/foo'
var bar = require('some-package/bar')
```

这也意味着，我们选择的语法会指导条件导出的匹配方式。所以上述例子中，如果 `some-package` 的 `package.json` 看起来像这样：

```json
{
  "name": "some…ckage",
  "version": "0.0.1",
  "exports": {
    "./…": {
      "import": "./esm/foo-from-import.mjs",
      "require": "./cjs/foo-from-require.cjs"
    },
    "./bar": {
      "import": "./esm/bar-from-import.mjs",
      "require": "./cjs/bar-from-require.cjs"
    }
  }
}
```

TS 会将这些路径解析为 `[…]/some-package/esm/foo-from-import.mjs` 和 `[…]/some-package/cjs/bar-from-require.cjs`。

## 检查导入属性和断言

现在根据全局 `ImportAttributes` 类型检查导入属性和断言。这意味着，运行时现在可以更精准地描述导入属性：

```ts
// 在某个全局文件中
interface ImportAttributes {
    type: "json";
}

// 在某个模块中
import * as ns from "foo" with { type: "not-json" };
// 报错
// { type: "not-json" 类型无法赋值给 ImportAttributes 类型
//  type 属性的类型不兼容
//  "not-json" 类型无法赋值给 "json" 类型
```

## 添加缺失参数的快速修复

TS 现在有一个快速修复功能，可以向使用过多参数调用的函数添加新参数。

![](_attachment/img/81d5c5a2d4b6295ed25273cf897ee742_MD5.png)

![](_attachment/img/65dd0e18d460fd79d3299d873db005fe_MD5.png)

## 对子路径导入的自动导入支持

在 Node 中，`package.json` 通过名为 `imports` 的字段支持名为“子路径导入”（subpath imports）的功能。这是一种将软件包内的路径重新映射到其他模块路径的方法。从概念上讲，这与路径映射非常相似，路径映射是某些模块打包器和加载器支持的功能，TS 通过名为 `paths` 的功能支持路径映射。唯一的区别在于，子路径导入始终必须以 `#` 开头。

TS 的自动导入功能以前没有考虑 `imports` 中的路径，这可能会令人沮丧。相反，用户可能必须在 t`sconfig.json` 中手动定义 `paths`。虽然但是，TS 的自动导入现在支持子路径导入！

## TS 5.0 即将废弃的功能

T5 弃用了以下选项和行为：

harset`

- `target: ES3`
- `importsNotUsedAsValues`
- `noImplicitUseStrict`
- `noStrictGenericChecks`
- `keyofStringsOnly`
- `suppressExcessPropertyErrors`
- `suppressImplicitAnyIndexErrors`
- `out`
- `preserveValueImports`
- 项目引用中的 `prepend`
- 隐式特定于操作系统 `newLine`

要继续使用它们，使用 Ts 5.0 及其更新版本的开发者必须指定一个名为 `ignoreDeprecations` 且值为 `"5.0"` 的新选项。

虽然但是，TS 5.4 将是这些功能继续正常运行的最后一个版本。等到 TS 5.5，这些废弃功能会变成硬性错误，并且使用它们的代码需要迁移。

## 显著的行为变化

本节重点介绍了一组值得注意的更改，这些更改应作为任何升级的一部分予以承认和理解。有时它会突出显示弃用、删除和新的限制。它还可以包含功能改进的错误修复，但也可能通过引入新错误来影响现有构建。

### 更精准的条件类型约束

以下代码不再允许在函数 `foo` 中声明的第二个变量。

```ts
type IsArray<T> = T extends any[] ? true : false

function foo<U extends object>(x: IsArray<U>) {
  let first: true = x // 报错
  let second: false = x // 现在会报错，之前不会
}
```

以前，当 TS 检查 `second` 的初始值时，它需要确定 `IsArray<U>` 是否可以赋值给单元类型 `false`。虽然 `IsArray<U>` 不以任何明显的方式兼容，但 Ts 也会考虑该类型的约束。在诸如 `T extends Foo ? TrueBranch : FalseBranch` 之类的条件类型中，其中 `T` 是通用的，类型系统会查看 `T` 的约束，并将其替换为 `T`。

但这种行为是不准确的，因为它过于饥渴（overly-eager）即使 `T` 的约束不能赋值给 `Foo`，这并不意味着它不会被实例化。因此，在无法证明 `T` 从不或总是扩展 `Foo` 的情况下，更正确的行为是为条件类型的约束生成联合类型。

TS 5.4 采用了这种更准确的行为。这在实践中意味着，我们可能会开始发现某些条件类型实例不再与其分支兼容。

### 更积极地减少类型变量和原始类型之间的交集

TS 现在更积极地减少与类型变量和原始值的交集，具体取决于类型变量的约束与这些原始值的重叠方式。

```ts
declare function intersect<T, U>(x: T, y: U): T & U

function foo<T extends 'abc' | 'def'>(x: T, str: string, num: number) {
  // 以前类型是 'T & string'，现在类型是 'T'
  let a = intersect(x, str)
  // 以前类型是 'T & number'，现在类型是 'never'
  let b = intersect(x, num)
  // 以前类型是 '(T & "abc") | (T & "def")'，现在类型是 'T'
  let c = Math.random() < 0.5 ? intersect(x, 'abc') : intersect(x, 'def')
}
```

### 通过插值改进对模板字符串的检查

TS 现在可以更精准地检查字符串是否可以赋值给模板字符串类型的占位符插槽。

```ts
function a<T extends { id: string }>() {
  let x: `-${keyof T & string}`
  // 以前会报错，现在不会。
  x = '-id'
}
```

这种行为更理想，但可能会导致使用条件类型等构造的代码中断，其中这些规则更改很容易见证。

### 仅类型导入与本地值冲突时出错

以前，如果导入 `Something` 仅引用类型，那么 TS 会允许在 `isolatedModules` 下使用以下代码。

```ts
import { Something } from './some/path'

let Something = 123
```

虽然但是，单文件编译器假设删除 `import` 是否“安全”是不安全的，即使代码保证在运行时失败。在 TS 5.4 中，此代码将触发如下错误：

```md
导入 Something 与局部值冲突，所以当启动 isolatedModules 时，必须使用仅类型导入来声明。
```

解决方案应该是进行局部重命名，或者按照错误所述，将 `type` 修饰符添加到 `import` 中：

```ts
import type { Something } from './some/path'
// 或者
import { type Something } from './some/path'
```

### 新的枚举可赋值性限制

当两个枚举具有相同的声明名称和枚举成员名称时，它们以前总是被认为是兼容的；虽然但是，当这些值已知时，TS 会默默地允许它们具有不同的值。

TS 5.4 通过要求已知值必须相同来加强此限制。

```ts
namespace First {
  export enum SomeEnum {
    A = 0,
    B = 1,
  }
}

namespace Second {
  export enum SomeEnum {
    A = 0,
    B = 2,
  }
}

function foo(x: First.SomeEnum, y: Second.SomeEnum) {
  // 两者过去都是兼容的，现在 TS 会报错：
  x = y
  y = x
}
```

此外，当枚举成员之一不具有静态已知值时，存在新的限制。在这些情况下，另一个枚举必须至少是隐式数字，比如它没有静态解析的初始值，或者它是显式数字，这意味着 TS 可以将该值解析为数字。实际上，这意味着字符串枚举成员只与相同值的其他字符串枚举兼容。

```ts
namespace First {
  export declare enum SomeEnum {
    A,
    B,
  }
}

namespace Second {
  export declare enum SomeEnum {
    A,
    B = 'some known string',
  }
}

function foo(x: First.SomeEnum, y: Second.SomeEnum) {
  // 两者过去都是兼容的，现在 TS 会报错：
  x = y
  y = x
}
```

### 枚举成员的名称限制

TS 不再允许枚举成员使用名称 `Infinity/-Infinity/NaN`。

```ts
// 下述所有枚举都会报错：
// 枚举成员禁止使用的数字名称。
enum E {
  Infinity = 0,
  '-Infinity' = 1,
  NaN = 2,
}
```

### 与具有 `any` 剩余元素的元组相比，映射类型得到更好的保留

以前，将带有 `any` 的映射类型应用到元组中会创建 `any` 元素类型。这是不希望出现的情况，现已修复。

```ts
Promise.all(['', ...([] as any)]).then(result => {
  const head = result[0] // 5.3: any, 5.4: string
  const tail = result.slice(1) // 5.3 any, 5.4: any[]
})
```
