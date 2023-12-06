---
aliases: []
tags: ['TypeScript', 'date/2023-12', 'year/2023', 'month/12']
date: 2023-12-04-星期一 17:38:53
update: 2023-12-04-星期一 17:50:43
---

> 英文原味版请临幸 [Announcing TypeScript 5.3](https://devblogs.microsoft.com/typescript/announcing-typescript-5-3)。

今天，我们“普大喜奔” —— TS 5.3 正式发布！

以下是 TS 5.3 新特性速览：

- 导入属性
- 导入类型稳定支持 `resolution-mode`
- 所有模块模式都支持 `resolution-mode`
- `switch(true)` 类型缩窄
- 布尔比较的类型缩窄
- 通过 `Symbol.hasInstance` 缩窄 `instanceof`
- 检查实例字段的 `super` 属性访问
- 类型的交互式内嵌提示
- 首选 `type` 自动导入的设置
- 通过跳过 JSDoc 解析进行优化
- 通过比较非归一化交集进行优化
- `tsserverlibrary.js` 和 `typescript.js` 之间的合并
- 破坏性更新和准确性改进

## 导入属性（import attributes）

TS 5.3 支持对 JS（JavaScript）最近更新的 [导入属性提案](https://github.com/tc39/proposal-import-attributes)。

导入属性的用例之一是向运行时提供有关模块预期格式的信息。

```ts
// 我们只希望将其解释为 JSON，
// 而不是扩展名为 `.json` 的可运行/恶意的 JS 文件。
import obj from './something.json' with { type: 'json' }
```

TS 不会检查这些属性的内容，因为它们是宿主专属（host-specific）的属性，并且只是单独保留，以便浏览器和运行时可以处理它们（并且可能出错）。

```ts
// TS 允许下列操作。
// 但您的浏览器呢？可能达咩。
import * as foo from './foo.js' with { type: 'fluffy bunny' }
```

动态 `import()` 调用还可以通过第二个参数使用导入属性。

```ts
const obj = await import('./something.json', {
  with: { type: 'json' },
})
```

第二个参数的预期类型由 `ImportCallOptions` 类型定义，该类型默认只需要一个 `with` 属性。

请注意，导入属性是早期导入断言提案（import assertions）的进化版，TS 4.5 已经实现了导入断言提案。两个提案最明显的区别在于 `with` 关键字与 `assert` 关键字的使用。但不太明显的区别是，运行时现在可以自由使用属性来指引导入路径的解析和解释，而导入断言能且仅能在加载模块后断言某些特征。

随着时间的推移，TS 将弃用导入断言的旧语法，转而采用导入属性提案的语法。使用了 `assert` 的现存代码应迁移到 `with` 关键字。需要导入属性的新代码应只使用 `with`。

我们要实名感谢 Oleksandr Tarasiuk 大佬实现了此提案！我们还要给 Wenlu Wang 打 call，它实现了导入断言！

## 导入类型稳定支持 `resolution-mode`

在 TS 4.7 中，TS 添加了 `/// <reference types="…" />` 中 `resolution-mode` 属性的支持，以控制说明符是否应通过 `import` 或 `require` 语义进行解析。

```ts
/// <reference types="pkg" resolution-mode="require" />

// or

/// <reference types="pkg" resolution-mode="import" />
```

同时还添加了相应的字段，用于仅类型导入的导入断言；虽然但是，它能且仅能被 TS 的夜间发行版本支持。心理层面的理由是，导入断言并非旨在指导模块解析。因此，此功能只以夜间发行模式实验性发布，以获得更多反馈。

但鉴于导入属性可以指导解析，并且我们已经看到了合理的用例，TS 5.3 现在支持 `import type` 的 `resolution-mode`。

```ts
// 将 pkg 解析为 require 导入
import type { TypeFromRequire } from "pkg" with {
    "resolution-mode": "require"
};

// 将 pkg 解析为 import 导入
import type { TypeFromImport } from "pkg" with {
    "resolution-mode": "import"
};

export interface MergedType extends TypeFromRequire, TypeFromImport {}
```

这些导入属性也可用于 `import()` 类型。

```ts
export type TypeFromRequire =
    import("pkg", { with: { "resolution-mode": "require" } }).TypeFromRequire;

export type TypeFromImport =
    import("pkg", { with: { "resolution-mode": "import" } }).TypeFromImport;

export interface MergedType extends TypeFromRequire, TypeFromImport {}
```

详情请临幸 <https://github.com/microsoft/TypeScript/pull/55725> 。

## 所有模块模式都支持 `resolution-mode`

先前，`resolution-mode` 能且仅能在 `node16` 和 `nodenext` 的 `moduleResolution` 选项下才允许使用。为了更易于查找专门用于类型目的的模块，`resolution-mode` 现在可以在其他所有 `moduleResolution` 选项（比如 `bundler`、`node10`）中生效，并且 `classic` 也不会出错。

详情请临幸 <https://github.com/microsoft/TypeScript/pull/55725> 。

## `switch(true)` 类型缩窄

TS 5.3 现在可以基于 `switch(true)` 的 `case` 条件执行类型收窄（narrowing）。

```ts
function f(x: unknown) {
  switch (true) {
    case typeof x === 'string':
      // 此处的 x 是 string 类型
      console.log(x.toUpperCase())
    // 穿透执行......

    case Array.isArray(x):
      // 此处的 x 是 'string | any[]' 类型
      console.log(x.length)
    // 穿透执行......

    default:
    // 此处的 x 是 unknown 类型
    // ...
  }
}
```

我们要实名感谢 Mateusz Burzyński 大佬贡献了此功能的前期工作！

## 布尔比较的类型缩窄

有时，您可能会发现自己在条件分支中与 `true` 或 `false` 执行直接比较。通常这是非必要的比较，但您可能更喜欢将其作为一种风格特点，或者避免关于 JS 真假判断的某些问题。无论如何，以前 TS 在执行类型收窄时无法识别此类形式。

TS 5.3 现在在变量缩窄时会跟上并理解这些表达式。

```ts
interface A {
  a: string
}

interface B {
  b: string
}

type MyType = A | B

function isA(x: MyType): x is A {
  return 'a' in x
}

function someFn(x: MyType) {
  if (isA(x) === true) {
    console.log(x.a) // 有效！
  }
}
```

我们要实名感谢 Mateusz Burzyński 大佬实现了此功能。

## 通过 `Symbol.hasInstance` 缩窄 `instanceof`

JS 有一个稍微深奥的特性是，可以重载 `instanceof` 运算符的行为。为此，`instanceof` 运算符的右值需要有一个名为 `Symbol.hasInstance` 的专属方法。

```ts
class Weirdo {
  static [Symbol.hasInstance](testedValue) {
    // 等等，发生了什么？
    return testedValue === undefined
  }
}

// false
console.log(new Thing() instanceof Weirdo)

// true
console.log(undefined instanceof Weirdo)
```

为了更好地对 `instanceof` 的这种行为建模，TS 现在会检查是否存在这个 `[Symbol.hasInstance]` 方法，并将其声明为类型谓词函数（type predicate function）。如果是这样，`instanceof` 运算符的待测左值将通过该类型谓词适当收窄。

```ts
interface PointLike {
  x: number
  y: number
}

class Point implements PointLike {
  x: number
  y: number

  constructor(x: number, y: number) {
    this.x = x
    this.y = y
  }

  distanceFromOrigin() {
    return Math.sqrt(this.x ** 2 + this.y ** 2)
  }

  static [Symbol.hasInstance](val: unknown): val is PointLike {
    return (
      !!val &&
      typeof val === 'object' &&
      'x' in val &&
      'y' in val &&
      typeof val.x === 'number' &&
      typeof val.y === 'number'
    )
  }
}

function f(value: unknown) {
  if (value instanceof Point) {
    // 可以同时访问这两属性 - 正确！
    value.x
    value.y

    // 无法访问此方法 - 类型缩窄为 PointLike，
    // 但实际上不是缩窄为 Point。
    value.distanceFromOrigin()
  }
}
```

如你所见，`Point` 定义了自己的 `[Symbol.hasInstance]` 方法。它实际上充当了一个名为 `PointLike` 的单独类型的自定义类型守卫。在函数 `f` 中，我们能够诉诸 `instanceof` 将 `value` 缩窄为 `PointLike` 而不是 `Point`。这意味着，我们可以访问 `x` 和 `y` 属性，但无法访问 `distanceFromOrigin` 方法。

详情请临幸 <https://github.com/microsoft/TypeScript/pull/55052> 。

## 检查实例字段的 `super` 属性访问

在 JS 中，可以通过 `super` 关键字访问基类中的声明。

```ts
class Base {
  someMethod() {
    console.log('Base method called!')
  }
}

class Derived extends Base {
  someMethod() {
    console.log('Derived method called!')
    super.someMethod()
  }
}

new Derived().someMethod()
// 打印结果：
//   Derived method called!
//   Base method called!
```

这与类似 `this.someMethod()` 这样编写的东东不同，因为它可以调用被重载方法。这是一个微妙的区别，如果一项声明从未被重载，这两者通常可以互换。

```ts
class Base {
  someMethod() {
    console.log('someMethod called!')
  }
}

class Derived extends Base {
  someOtherMethod() {
    // 它们的行为完全相同。
    this.someMethod()
    super.someMethod()
  }
}

new Derived().someOtherMethod()
// 打印结果：
//   someMethod called!
//   someMethod called!
```

问题在于，可以互换使用它们，因为 `super` 只适用于在原型上声明的成员，而不是实例属性。这意味着，如果您写了 `super.someMethod()`，但 `someMethod` 被定义为字段，那么您就会遭遇运行时错误！

```ts
class Base {
  someMethod = () => {
    console.log('someMethod called!')
  }
}

class Derived extends Base {
  someOtherMethod() {
    super.someMethod()
  }
}

new Derived().someOtherMethod()
// 💥
// 无法奏效，因为 super.someMethod 是 undefined。
```

TS 5.3 现在更仔细地检查 `super` 属性访问/方法调用，以查看它们是否与类字段相对应。如果是，我们现在会得到一个类型检查错误。

我们要实名感谢 Jack Works 大佬贡献了此检查。

## 类型的交互式内嵌提示

TS 的内嵌提示（inlay hints）现在支持跳转到类型定义！这样更易于随意浏览代码。

![Ctrl-clicking an inlay hint to jump to the definition of a parameter type.](_attachment/img/1a1e91932ce4645a1b9e749e8e4c6c80_MD5.gif)

具体实现请临幸 <https://github.com/microsoft/TypeScript/pull/55141>

## 首选 `type` 自动导入的设置

以前，当 TS 为类型位置的东东生成自动导入时，它会根据您的设置添加 `type` 修饰符。举个栗子，为 `Person` 启动自动导入时，如下所示：

```ts
export let p: Person
```

TS 的编辑体验通常会为 `Person` 添加一个导入，如下所示：

```ts
import { Person } from './types'

export let p: Person
```

而且在某些设置下，比如 `verbatimModuleSyntax`，它会添加 `type` 修饰符：

```ts
import { type Person } from './types'

export let p: Person
```

虽然但是，也许您的代码库无法使用其中某些选项；或者，如果可能的话，您只是偏好显式 `type` 导入。

通过最近的更改，TS 现在使其成为一个编辑器专属的选项。在 VS Code 中，您可以在 UI 中的“TypeScript › Preferences: Prefer Type Only Auto Imports”下启用它，也可以使用 JSON 配置选项 `typescript.preferences.preferTypeOnlyAutoImports`。

## 通过跳过 JSDoc 解析进行优化

当通过 `tsc` 运行 TS 时，编译器现在会避免解析 JSDoc。这会减少其自身的解析时间，但也减少了存储注释的内存占用和垃圾回收花费的时间。总而言之，您应该会在 `--watch` 模式下见证更快的编译和反馈。

具体变更请临幸 <https://github.com/microsoft/TypeScript/pull/52921>

因为并非每个使用 TS 的工具都需要存储 JSDoc（比如 typescript-eslint 和 Prettier），此解析策略已作为 API 本身的一部分崭露头角。这可以使这些工具获得与 TS 编译器相同的内存和速度改进。`JSDocParsingMode` 中介绍了注释解析策略的新选项。详情请临幸 <https://github.com/microsoft/TypeScript/pull/55739>

## 通过比较非归一化交集进行优化

在 TS 中，并集和交集始终遵循特定形式，其中交集不能包含联合类型。这意味着，当我们在诸如 `A & (B | C)` 这样的并集上创建一个交集时，该交集将被归一化为 `(A & B) | (A & C)`。尽管如此，在某些情况下，类型系统仍将保留原始形式以进行显示。

事实证明，原始形式可用于某些机智的类型间比较捷径。

举个栗子，假设我们有 `SomeType & (Type1 | Type2 | … | Type99999NINE)`，我们想看看这是否可以赋值给 `SomeType`。回想一下，我们实际上并没有一个交集作为我们的源类型 —— 我们有一个看起来像 `(SomeType & Type1) | (SomeType & Type2) | … |(SomeType & Type99999NINE)` 的交集。在检查交集是否可以赋值给某个目标类型时，我们必须检查交集的每个成员是否可以赋值给目标类型，这可能非常慢。

在 TS 5.3 中，我们偷瞄了我们能够隐藏的原始交集形式。当我们比较类型时，我们会快速检查目标是否存在于源交集的任何成分中。

详情请临幸 <https://github.com/microsoft/TypeScript/pull/55851>

## `tsserverlibrary.js` 和 `typescript.js` 之间的合并

TS 本身提供了两个库文件：`tsserverlibrary.js` 和 `typescript.js`。某些 API（比如 `ProjectService` API）中能且仅能在 `tsserverlibrary.js` 中可用，这可能对某些导入器有用。尽管如此，这两者仍然是一龙一猪的打包，但有一大坨重叠，软件包的代码重复。更重要的是，由于自动导入或肌肉记忆，始终如一地二选一可能极具挑战性。意外加载这两个模块太容易了，代码可能无法在不同的 API 实例上正常工作。即使它确实有效，加载第二个包也会增加资源占用。

因此，我们决定将两者合并。`typescript.js` 现在涵盖了 `tsserverlibrary.js` 之前包含的内容，`tsserverlibrary.js` 现在只是重新导出了 `typescript.js`。比较这次合并前后，我们看到打包体积减少了，如下所示：

|          | Before    | After     | Diff       | Diff(percent) |
| -------- | --------- | --------- | ---------- | ------------- |
| Packed   | 6.90 MiB  | 5.48 MiB  | \-1.42 MiB | \-20.61%      |
| Unpacked | 38.74 MiB | 30.41 MiB | \-8.33 MiB | \-21.50%      |

|                            | Before     | After      | Diff         | Diff(percent) |
| -------------------------- | ---------- | ---------- | ------------ | ------------- |
| `lib/tsserverlibrary.d.ts` | 570.95 KiB | 865.00 B   | \-570.10 KiB | \-99.85%      |
| `lib/tsserverlibrary.js`   | 8.57 MiB   | 1012.00 B  | \-8.57 MiB   | \-99.99%      |
| `lib/typescript.d.ts`      | 396.27 KiB | 570.95 KiB | +174.68 KiB  | +44.08%       |
| `lib/typescript.js`        | 7.95 MiB   | 8.57 MiB   | +637.53 KiB  | +7.84%        |

换而言之，打包体积减少了 20.5% 以上。

详情请临幸 <https://github.com/microsoft/TypeScript/pull/55273>

## 破坏性更新和准确性改进

### `lib.d.ts` 变更

为 DOM 生成的类型可能会对您的代码库产生影响。详情请临幸 <https://github.com/microsoft/TypeScript/pull/55798>

### 检查 `super` 对实例属性的访问

TS 5.3 现在可以检测 `super.` 属性访问引用的声明何时是类字段并报错。这可以防止在运行时可能发生的错误。

详情请临幸 <https://github.com/microsoft/TypeScript/pull/54056>
