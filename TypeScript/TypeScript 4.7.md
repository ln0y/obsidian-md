---
aliases: []
tags: ['TypeScript','date/2022-04','year/2022','month/04']
date: 2022-04-18-Monday 10:37:14
update: 2022-06-10-Friday 15:28:17
---

下面是 TypeScript 4.7 新增的部分：

- Node.js 支持 ECMAScript Module
- 模块检测控制
- 使用方括号获取对象属性时的控制流分析增强
- 对象和方法内的函数类型增强
- 实例化表达式
- infer 类型变量直接 extends 限制
- 类型参数的可选可变性标注
- 使用 moduleSuffixes 进行自定义解析
- 解析模式
- 跳转到源码定义
- Import 自动分组
- 对象方法代码补全
- 破坏性改动

## What’s New Since the Beta?

在 beta 版本中，我们已经发布了关于 Node ESM 的支持，名为 node12。但是随着 Node.js 12 不再维护，我们开始把稳定支持的对象定在 node16 。这会让输出的 .js 文件支持 Node.js 更新的 ESM 特性（例如 [pattern trailer](https://github.com/nodejs/node/pull/39635)s），并且 TypeScript 默认支持更高版本的 node 会支持例如像 top-level await 这样的特性。

从 beta 版本以来，resolution-module 语法还可以在 `/// <reference types="..." />` 上使用。然而我们收到了一些关于 import type 的反馈，这些反馈让我们重新考虑关于这个特性的需要和设计。所以关于 import type 的 resolution-mode 仅在 TypeScript 的 nightly 版本中使用。

在 beta 版本之后，我们发现 \#private 的 typeof 存在 API 兼容性问题。我们也发现 typeof this.#somePrivate 与生成类型文件之间的关系，还需要研究。所以这个功能不会发布在 TypeScript 4.7。

这次发布包含了预览编辑器功能：Go To Source Definition 。这个功能可以跳转到源文件，而不是类型文件。

从 beta 版本以来，有一些破坏性改变，包括 strictNullChecks 会导致更严格的类型参数限制，箭头函数解析已被撤销。在 JSX 里使用展开算子，模版字符串不能使用 symbol，是新的改动。

## Node.js 支持 ECMAScript Module

在过去的几年里，Node.js 一直致力于支持 ECMAScript 模块标准（ESM）。这是个非常困难的特性，因为 Node.js 生态系统是建立在 CommonJS(CJS) 模块标准上的。两种模块标准互相操作带来了很大的挑战，需要同时处理许多新功能； Node.js 对 ESM 的支持是从 Node.js 12 开始的。在 TypeScript 4.5 版本时，我们在 nightly 版本中增加了对 Node.js ESM 的支持，从用户那里获取了一些反馈，并让库作者为支持 ESM 做好准备。

TypeScript 4.7 增加了两个 module 设置属性：node16 、 nodenext

```json
{
    "compilerOptions": {
        "module": "node16",
    }
}
```

这两个参数可以让开发者使用如下我们介绍的新功能。

## package.json 中 type 字段及新扩展

在 Node.js 的 package.json 中可以通过 type 字段来声明 npm 包遵循的模块化规范。type 字段可设置为 module 或 commonjs

```json
{
    "name": "my-package",
    "type": "module",

    "//": "...",
    "dependencies": {
    }
}
```

Node.js 根据 type 字段的设置处理目录下的所有 .js 后缀结尾的文件，如为 module，按照 ESM 处理，否则按照 CommonJS 处理，如果不设置，默认是按照 CommonJS 处理。当按照 ESM 处理时，有些注意事项：

- 支持 import /export 语法
- 支持 top-level await
- 相对引用路径需要指明扩展名，如 import "./foo.js”
- node\_modules 里的依赖解析可能会不同
- 某些全局变量，如 require 和 module，不能直接使用
- 如需引入 CommonJS 需要遵守特定规则

后面将详细讲解。

不管怎样， TypeScript 的运行方式都是一样的。当 TypeScript 寻找到 .ts .tsx .js 或 .jsx 结尾的文件时，首先要去 package.json 文件查看 type 属性，文件是遵循 ESM 还是 CommonJS 。这涉及到两个问题：

- 如何找到该文件导入的其他模块
- 以及如果需要导出，如何转换该文件

当 .ts 文件以 ESM 编译，ECMAScript 的 import/export 语句将会在输出的 .js 文件中保留；如果 .ts 文件以 CommonJS 编译，输出文件将会和现在 module commonjs 中的一样。

ESM 和 CommonJS 规范下 .ts 文件路径解析也不相同。例如

```ts
// ./foo.ts
export function helper() {
    // ...
}

// ./bar.ts
import { helper } from "./foo"; // only works in CJS

helper();
```

上述代码在 CommonJS 规范下可以运行，但是在 ESM 规范下会报错，因为相对引入路径中需要指明扩展名 foo.ts。

```ts
// ./bar.ts
import { helper } from "./foo.js"; // works in ESM & CJS

helper();
```

开始你可能觉得这点有些多余，但是 TypeScript 工具例如自动 import、路径补全等都会帮你完成。

还有一点需要注意，上述规则对 .d.ts 的文件同样适用。当 TypeScript 遇到 .d.ts 文件时，会基于当前的包转译。

## 新的文件扩展

package.json 中的 type 字段让我们仍可以使用 .ts 和 .js 作为文件后缀。但是有时可能需要使用一些规范不同于 type 字段设置的文件，这时就需要特殊定义。

Node.js 支持两种扩展名支持这种情况：.mjs 和 .cjs。无论 type 字段如何设置，`.mjs`文件始终被视为 ESM，而 `.cjs` 文件始终被视为 CommonJS。

相应的，TypeScript 支持两种新的源文件扩展名：.mts 和 .cts。TypeScript 会将 .mts 文件转换为 .mjs，.cts 转换为 .cjs。

另外 TypeScript 也支持两种新的声明文件扩展名：.d.mts 和 .d.cts。TypeScript 会为 .mts 文件生成 .d.mts 文件，为 .cts 文件生成 .d.cts。

使用这些扩展完全是可选的，但是即使你选择不将它们作为主要工作流的一部分，它们也常常是有用的。

## CommonJS 互操作

Node.js 允许在 ESM 模块把 CommonJS 模块当成一个有 default 导出的 ESM 模块进行导入。

```ts
// ./foo.cts
export function helper() {
    console.log("hello world!");
}

// ./bar.mts
import foo from "./foo.cjs";

// prints "hello world!"
foo.helper();
```

在某些情况下， Node.js 可以把 CommonJS 模块合成一个具名导出，这将更加方便。例如，ESM 可以使用 命名空间风格的导入（`import * as foo from "...”`）或是 具名导入（`import { helper } from "...”`）

```ts
// ./foo.cts
export function helper() {
    console.log("hello world!");
}

// ./bar.mts
import { helper } from "./foo.cjs";

// prints "hello world!"
helper();
```

TypeScript 不是总能知道这些具名导入可以被聚合，如果遇到问题， TypeScript 会报错，并且 TypeScript 有启发式的算法，如果导入的文件一定是 CommonJS 模块会做一些操作。

关于互操作，Typescript 特有的一个注意事项是:

```ts
import foo = require("foo");
```

在 CommonJS 模块中，这将只是个 require() 调用，在 ESM 中，将导入 createRequire 实现同样的目的。这样的代码不支持浏览器环境（ 不支持 require() ），但有利于互操作。你可以使用下面的语法来写上面的例子:

```ts
// ./foo.cts
export function helper() {
    console.log("hello world!");
}

// ./bar.mts
import foo = require("./foo.cjs");

foo.helper()
```

最后，值得注意的是，在 CJS 模块中导入 ESM 模块的唯一方法是动态 import()。这虽然会带来些挑战，但 Node.js 就是这样的行为。相关文章可以[查看](https://nodejs.org/api/esm.html#esm_interoperability_with_commonjs)。

## package.json 的 exports imports 与 Self-Referencing

Node.js 在 package.json 中新增 [exports 字段](https://nodejs.org/api/packages.html#packages_exports)，这个字段比在 package.json 中定义 main 字段更加强大，它可以控制包中的哪些部分被访问。

下面是 package.json 的例子，这个例子支持 CommonJS 和 ESM 分开的进入点：

```ts
// package.json
{
    "name": "my-package",
    "type": "module",
    "exports": {
        ".": {
            // Entry-point for `import "my-package"` in ESM
            "import": "./esm/index.js",

            // Entry-point for `require("my-package") in CJS
            "require": "./commonjs/index.cjs",
        },
    },

    // CJS fall-back for older versions of Node.js
    "main": "./commonjs/index.cjs",
}
```

你可以从以下的文章中获取到更多关于 [exports 的功能](https://nodejs.org/api/packages.html)。这里我们将关注TypeScript是如何支持它的。

使用 TypeScript 最初的Node支持，它会查找 “main”字段，然后查找该字段设置的入口文件。例如如果 main 字段指向 ./lib/index.js，TypeScript 将会查找 ./lib/index.d.ts。包作者可以通过指定 type 字段来指明 .d.ts 文件的位置 "types": "./types/index.d.ts”。

当前的功能支持了条件导入。如果同时定义了exports 和 main ，则 exports 字段优先于 main 。如果是在 ESM 中使用 import，对应查找 import 字段的包入口点，如果是 CommonJS 模块中使用 require，对应查找 require 字段的包入口点。同时也可以增加不同的 types 字段条件导入。

```ts
// package.json
{
    "name": "my-package",
    "type": "module",
    "exports": {
        ".": {
            // Entry-point for `import "my-package"` in ESM
            "import": {
                // Where TypeScript will look.
                "types": "./types/esm/index.d.ts",

                // Where Node.js will look.
                "default": "./esm/index.js"
            },
            // Entry-point for `require("my-package") in CJS
            "require": {
                // Where TypeScript will look.
                "types": "./types/commonjs/index.d.cts",

                // Where Node.js will look.
                "default": "./commonjs/index.cjs"
            },
        }
    },

    // Fall-back for older versions of TypeScript
    "types": "./types/index.d.ts",

    // CJS fall-back for older versions of Node.js
    "main": "./commonjs/index.cjs"
}
```

请注意， exports 内部的 types 条件应该始终放在前面。

TypeScript 同时对 pacakage.json 中的 import 字段 做了同样的支持，也支持 package 进行自引用。这些特性通常不需要设置，但是 TypeScript 都可以支持。

## 模块检测控制

在 JavaScript 中引入模块的带来的问题是现有的“脚本”代码和新的模块代码之间存在歧义。模块中的 JavaScript 代码运行行为与脚本代码略有不同，并且作用域规则不一样，因此工具需要判断代码如何运行。例如 Node.js 需要模块入口写在 .mjs 文件或将 package.json 中用 type 字段设置为 module。当 TypeScript 在文件中找到任何 import 或 export 语句时，它会将文件视为模块，但除此之外，它会假定 .ts 或 .js 文件是一个作用于全局的脚本文件。

这与 Node.js 的 package.json 设置可以改变文件的格式，或是 jsx 字段设置为 react-jsx 的行为不一致。这与现代 TypeScript 代码也有一定的不一致，现代 TypeScript 代码期望所有新的代码都应该默认使用 module。

这也是 TypeScript 4.7 引入 moduleDetection 字段的原因。moduleDetection 字段可取三个值 auto（默认）、legacy（向前兼容）、force。

当 moduleDetection 字段设置为 auto 时，TypeScript 不仅会查找 import 和 export 语句，还会检查：

- 当 module 设置为 nodenext 或 node16 时，package.json 中 type 字段的值是否设置为 module
- 当 jsx 设置为 react-jsx 时，当前文件是否是 jsx 文件

当 moduleDetection 字段设置为 force 时，每一个非类型文件将被当作是一个模块，且不管 module、 moduleResolution、jsx 字段设置。

当 moduleDetection 字段设置为 legacy 时，TypeScript 回到了以前版本的模式，只查找 import 和 export 语句来确定文件是否为模块。

相关文件[查阅](https://github.com/microsoft/TypeScript/pull/47495)。

## 使用方括号获取对象属性时的控制流分析增强

TypeScript 4.7 现在支持，当使用文字类型和唯一符号获取可索引类型时，可以对后续的类型进行收束。例如：

```ts
const key = Symbol();

const numberOrString = Math.random() < 0.5 ? 42 : "hello";

const obj = {
    [key]: numberOrString,
};

if (typeof obj[key] === "string") {
    let str = obj[key].toUpperCase();
}
```

之前，TypeScript 不会对 obj\[key\] 的类型守卫做任何收束，例如上面的例子，if 条件里的 obj\[key\] 的类型仍然是守卫前的类型。在当前这个例子，在之前的版本，if 条件里的 obj\[key\] 仍然是 string|number，所以获取 toUpperCase() 会报错。

在 TypeScript 4.7 开始，编译器知道 obj\[key\] 的类型是 string。

这也意味着，当打开 -strictPropertyInitialization 时，TypeScript 可以正确检查一个 class 里的计算属性是否完成了初始化。

```ts
// 'key' 的类型是 'unique symbol'
const key = Symbol();

class C {
    [key]: string;

    constructor(str: string) {
        // 没有设置 'this[key]'，现在会报错
    }

    screamString() {
        return this[key].toUpperCase();
    }
}
```

在 TypeScript 4.7 中，通过 --strictPropertyInitialization 会提示 this\[key\] 没有被初始化的错误。

感谢 [Oleksandr Tarasiuk](https://github.com/a-tarasyuk) 提供的这个[改变](https://github.com/microsoft/TypeScript/pull/45974)。

## 对象和方法内的函数类型增强

TypeScript 4.7 现在可以对对象和数组内的函数进行更细粒度的类型推断。这些类型的推断和普通参数的推断保持一致：

```ts
declare function f<T>(arg: {
    produce: (n: string) => T,
    consume: (x: T) => void }
): void;

// 之前可通过
f({
    produce: () => "hello",
    consume: x => x.toLowerCase()
});

// 之前可通过
f({
    produce: (n: string) => n,
    consume: x => x.toLowerCase(),
});

// 之前会报错，现在可以通过
f({
    produce: n => n,
    consume: x => x.toLowerCase(),
});

// 之前会报错，现在可以通过
f({
    produce: function () { return "hello"; },
    consume: x => x.toLowerCase(),
});

// 之前会报错，现在可以通过
f({
    produce() { return "hello" },
    consume: x => x.toLowerCase(),
});
```

之前会报错是因为，报错的例子中，寻找 product 的类型时，会间接请求 arg 的类型，但是这时候，还没有合适的 T 的类型。在 4.7 中，TypeScript 可以提前收集好与 T 有关的函数的类型，然后在推断时延迟进行推断。

如果对这个功能感兴趣，请[阅读](https://github.com/microsoft/TypeScript/pull/48538)。

## 实例化表达式

有时候函数可以设置的更加通用。例如，假设我们有一个makeBox函数。

```ts
interface Box<T> {
    value: T;
}

function makeBox<T>(value: T) {
    return { value };
}
```

可能我们想创作更具象的函数，如 `makeHammerBox`、`makeWrenchBox`。现在要实现这点，我们可以将 makeBox 封装在其他函数中，或者为 makeBox 的别名使用显式类型。

```ts
function makeHammerBox(hammer: Hammer) {
    return makeBox(hammer);
}

// or...

const makeWrenchBox: (wrench: Wrench) => Box<Wrench> = makeBox;
```

这两种写法都可以，但是将 makeBox 封装在其他函数显得有点浪费，编写 makeWrenchBox 的完整签名可能会很麻烦。理想情况下，我们可以替换 makeBox 签名中所有泛型，只需要别名 makeBox。

TypeScript 4.7 完全可以实现!我们现在可以接受函数和构造函数，并直接为它们提供类型参数。

```ts
const makeHammerBox = makeBox<Hammer>;
const makeWrenchBox = makeBox<Wrench>;
```

因此，我们可以将 makeBox 入参设置的更加具体，拒绝其他任何类型输入。

```ts
const makeStringBox = makeBox<string>;

// TypeScript correctly rejects this.
makeStringBox(42);
```

上述特性同样适用于构造函数如 Array 、Map 、Set

```ts
// Has type `new () => Map<string, Error>`
const ErrorMap = Map<string, Error>;

// Has type `// Map<string, Error>`
const errorMap = new ErrorMap();
```

当给函数或构造函数提供类型参数时，它将生成一个新类型，该类型将所有签名保留为兼容的类型形参列表，并使用给定的类型参数替换相应的类型形参。其他任何签名都会被删除，因为 TypeScript会认为它们不应该被使用。

相关文章[查阅](https://github.com/microsoft/TypeScript/pull/47607)。

## infer 类型变量直接 extends 限制

条件类型是一个非常强力的功能。使用条件类型，可以进行匹配并且推断合适的类型，然后根据匹配的情况做出相应的事情。例如，我们可以写一个条件类型，这个类型匹配一个 tuple，如果第一个元素是 string，则返回第一个元素。

```ts
type FirstIfString<T> =
    T extends [infer S, ...unknown[]]
        ? S extends string ? S : never
        : never;

 // string
type A = FirstIfString<[string, number, number]>;

// "hello"
type B = FirstIfString<["hello", number, number]>;

// "hello" | "world"
type C = FirstIfString<["hello" | "world", boolean]>;

// never
type D = FirstIfString<[boolean, number, string]>;
```

FirstIfString 会匹配任意一个 tuple，如果 tuple 有至少一个元素，会把这个元素的类型赋给 S。然后去判断 S 的类型是否和 string 兼容，然后根据情况进行返回。

注意我们不得不写两个条件类型。为了简化嵌套，我们可以把 FirstIfString 写成：

```ts
type FirstIfString<T> =
    T extends [string, ...unknown[]]
        // 把 `T` 的第一个元素取出
        ? T[0]
        : never;
```

这是可以工作的，但是更手动一些，并且不那么声明式。我们需要把 T 的 第 0 个元素 T\[0\] 取出来，而不是直接匹配第一个元素，并且给这个元素一个名字。如果处理的问题更复杂，infer 可以让这个事情简单一些。(Hugo 注：infer 相当于 let)

使用嵌套条件类型 infer 一个类型，然后使用这个类型匹配是比较常用的一种模式。为了避免第二层的嵌套，TypeScript 4.7 现在允许在 infer 类型后面加限制条件

```ts
type FirstIfString<T> =
    T extends [infer S extends string, ...unknown[]]
        ? S
        : never;
```

这一样来，当匹配到 S 时，会直接确保 S 是 string 的类型，如果 S 不是 string，会选择 false 的路径，在这个例子里，就是 never。

如果对这个特性想了解更多，可以[参考](https://github.com/microsoft/TypeScript/pull/48112)。

## 类型参数的可选可变性标注

用下面这个例子来解释这个特性：

```ts
interface Animal {
    animalStuff: any;
}

interface Dog extends Animal {
    dogStuff: any;
}

// ...

type Getter<T> = () => T;

type Setter<T> = (value: T) => void;
```

想象我们有两个不同的 Getter 实例。判断两个不同 Getter 是否可以互相替换，需要依赖 T 来判断。例如，`Getter<Dog>` → `Getter<Animal>` 是否可以替换，需要检查 Dog→Animal 是否是可以替换的。因为每一种 T 的类型在同一个方向相关，我们说这种情况下，Getter 类型对 T 是协变的。

另一方面，如果要看 `Setter<Dog>`→ `Setter<Animal>` 是否合法，需要检查是否 Animal→ Dog 是否合法。这个方向反转有些像数学中，-x< -y 是否成立，要去检查 y< x 是否成立。因为 Setter 赋值是否合法的方向，与 T 的方向相反，这种情况，我们称 Setter 对 T 是逆变的。

在 TypeScript 4.7 中，我们可以显式声明类型参数的可变性。

如果我们想显式声明一个 Getter 对 T 协变，则增加 out 修饰符。

```ts
type Getter<out T> = () => T;
```

同样的，如果我们想显式声明 Setter 对 T 逆变，可以增加 in 修饰符。

```ts
type Setter<in T> = (value: T) => void;
```

使用 out 和 in 来修饰可变性是因为，参数的可变性是由这个类型作为输入，还是输出。所以，现在你可以不用考虑可变性，而是考虑T 是用于输入，还是输出的位置。

这里也有一个 T 即时输入，也是输出的例子：

```ts
interface State<in out T> {
    get: () => T;
    set: (value: T) => void;
}
```

当 T 可以同时用于输入和输出时，则为不变。State\<T\>对于 T 的要求是不变的，换句话说，State\<Dog\> 和 State\<Animal\> 的实例是不可以互相替换的。

从技术上来讲，在一个纯粹的结构类型系统中，类型参数和可变性并没有关系，你可以直接对进行替换的类型，进行结构性的匹配，能匹配则可以互换。所以，为什么我们要对这个问题感兴趣呢？为什么我们要标注它们呢？

一个原因是，这个可以对于读代码的人显式看到类型参数的用途。对于更复杂的类型，很难区分一个类型到底是用来读，还是写，还是都有。TypeScript 现在提供了标注这个事情的方法。当忘记这个事情时，TypeScript 会帮助进行报错。例如，我们忘了给 State 标注 in 和 out

```ts
interface State<out T> {
    //          ~~~~~
    // error!
    // Type 'State<sub-T>' is not assignable to type 'State<super-T>' as implied by variance annotation.
    //   Types of property 'set' are incompatible.
    //     Type '(value: sub-T) => void' is not assignable to type '(value: super-T) => void'.
    //       Types of parameters 'value' and 'value' are incompatible.
    //         Type 'super-T' is not assignable to type 'sub-T'.
    get: () => T;
    set: (value: T) => void;
}
```

另一个原因是，精确度和速度！TypeScript 已经尝试去推断类型参数的可变性作为一种优化。做这个优化，TypeScript 会在检查大结构类型时花去一些时间。所以，在一些场景，显式标注可变性，可以让编译器忽略一些费时间的类型的检查。并且还经常碰到一种情况是，花了很多时间去推断可变性，可能碰到循环寻找，还找不到合适的可变性。

```ts
type Foo<T> = {
    x: T;
    f: Bar<T>;
}

type Bar<U> = (x: Baz<U[]>) => void;

type Baz<V> = {
    value: Foo<V[]>;
}

declare let foo1: Foo<unknown>;
declare let foo2: Foo<string>;

foo1 = foo2;  // Should be an error but isn't ❌
foo2 = foo1;  // Error - correct ✅
```

在这个例子里，显式标注可变性，可以提高速度，并且获得更准确的类型匹配。例如把 T 标注为不变：

```diff
- type Foo<T> = {
+ type Foo<in out T> = {
      x: T;
      f: Bar<T>;
  }
```

我们并不建议对每个类型进行可变性标注例如，尽可能标注可变性更严格一些，所以 TypeScript 不会阻止你将协变、逆变，甚至独立的东西标注为不变。如果你选择增加可变性标注，我们建议你好好想象，尽量精确使用它们。

如果你在处理深度嵌套的类型，尤其是你是一个库作者，你会发现这些特性能对你的用户带来好处。这些标注可以提升速度，也可以提升准确性。也可能改善他们编辑器的体验。可以用 [analyze-trace](https://github.com/microsoft/typescript-analyze-trace) 来查看可变性对性能造成的影响。

对于更多的细节，可以[参考](https://github.com/microsoft/TypeScript/pull/48240)。

## 使用 moduleSuffixes 进行自定义解析

TypeScript 4.7 现在支持使用 moduleSuffixes 来进行自定义的寻找模块标识符。

```json
{
    "compilerOptions": {
        "moduleSuffixes": [".ios", ".native", ""]
    }
}
```

这样设置以后，一个形如下面的 import

```ts
import * as foo from "./foo";
```

会去寻找./foo.ios.ts，./foo.native.ts，最后寻找 ./foo.ts。

注意，必须要配置 “”，TYpeScript 使用这个配置去寻找 ./foo.ts。默认的 moduleSuffixes 就是 “”。

感谢 [Adam Foxman](https://github.com/afoxman) 贡献这个[功能](https://github.com/microsoft/TypeScript/pull/48189)。

## 解析模式

使用 Node 的 ECMAScript 解析，包含文件的模式和使用的语法决定了如何解析导入;但是在ECMAScript 模块中引用 CommonJS 模块指明解析类型会很有用，反之亦然。

TypeScript 现在支持 `/// <reference types="..." />` 指令。

```ts
/// <reference types="pkg" resolution-mode="require" />

// or

/// <reference types="pkg" resolution-mode="import" />
```

另外，TypeScript nightly 版本，import type 可以指定导入断言来实现类似的功能。

```ts
// Resolve `pkg` as if we were importing with a `require()`
import type { TypeFromRequire } from "pkg" assert {
    "resolution-mode": "require"
};

// Resolve `pkg` as if we were importing with an `import`
import type { TypeFromImport } from "pkg" assert {
    "resolution-mode": "import"
};

export interface MergedType extends TypeFromRequire, TypeFromImport {}
```

import 断言同样适用于 import() 类型。

```ts
export type TypeFromRequire =
    import("pkg", { assert: { "resolution-mode": "require" } }).TypeFromRequire;

export type TypeFromImport =
    import("pkg", { assert: { "resolution-mode": "import" } }).TypeFromImport;

export interface MergedType extends TypeFromRequire, TypeFromImport {}
```

import type 和 import() 语法仅在 TypeScript nightly 版本中支持，当使用时，会有如下提示：

```txt
Resolution mode assertions are unstable. Use nightly TypeScript to silence this error. Try updating with 'npm install -D typescript@next'.
```

## 跳转到源码定义

TypeScript 4.7 中添了一项预览编辑功能 Go To Source Definition 。与 Go To Definition 类似，但是它不会返回声明文件中的结果。它会查找所有的实现文件（如 .js 或 .ts 文件）。

这个功能在你需要查找从库中导入的函数实现时非常方便，他会直接返回函数实现，而不是 .d.ts 文件中的类型声明。

可以下载最新版本的 Visual Studio Code 来体验这个功能。当然 该功能仍在试用期，仍存在一些问题。在某些情况下，TypeScript 使用启发式算法去猜对应的 .js 文件，返回的结果有时是不对的。Visual Studio Code 和我们正在尝试解决这些问题。

## Import 自动分组

TypeScript 有一个 Organize Imports 编辑器特性，对 JavaScript 和 TypeScript 都支持。不幸的是，它可能是一个有点弱的工具，经常会对 import 语句进行朴素的排序。

例如，你写的 import 语句

```ts
// local code
import * as bbb from "./bbb";
import * as ccc from "./ccc";
import * as aaa from "./aaa";

// built-ins
import * as path from "path";
import * as child_process from "child_process"
import * as fs from "fs";

// some code...
```

生成的 import 语句

```ts
// local code
import * as child_process from "child_process";
import * as fs from "fs";
// built-ins
import * as path from "path";
import * as aaa from "./aaa";
import * as bbb from "./bbb";
import * as ccc from "./ccc";

// some code...
```

这并不理想。import 语句会根据路径排序，但是 comments 和 换行符将会保留，这并不是期望的结果。很多时候，如果我们以特定的方式对导入进行分组，那么我们希望保留这种格式。

TypeScript 4.7 以一种组感知的方式执行 Organize Imports。上面的例子运行后可能更符合你的预期：

```ts
// local code
import * as aaa from "./aaa";
import * as bbb from "./bbb";
import * as ccc from "./ccc";

// built-ins
import * as child_process from "child_process";
import * as fs from "fs";
import * as path from "path";

// some code...
```

## 对象方法代码补全

TypeScript 现在为对象方法提供了代码片段补全功能。当补全对象中的成员时，TypeScript 会为一个方法名提供一个典型的补全条目，同时为整个方法定义提供一个单独的补全条目!

更多信息请[查阅](https://github.com/microsoft/TypeScript/pull/48168)。

## 破坏性改动

## lib.d.ts 更新

TypeScript 尽量避免重大改动，但即使对内置库的小改动也会产生问题。我们不期望 DOM 和 lib.d.ts 的引起大的变动，但有些小的改动。

## JSX 中更严格的展开检查

当在 JSX 中使用 … 展开算子时，TypeScript 现在加强了对给定类型是否是对象的检查。因此，具有unknown 和 never 类型(更罕见的是，null 和 undefined 类型)的值不能再展开到 JSX 元素中。

例如

```ts
import * as React from "react";

interface Props {
    stuff?: string;
}

function MyComponent(props: unknown) {
    return <div {...props} />;
}
```

现在将报错

```ts
Spread types may only be created from object types.
```

这个改动让 JSX 中的展开行为与普通对象展开行为更一致。

相关文件[查阅](https://github.com/microsoft/TypeScript/pull/48570)。

## 使用模板字符串表达式进行更严格的检查

当在模版字符串中使用 symbol 时，会触发 JavaScript 的 runtime error

```ts
let str = `hello ${Symbol()}`;
// TypeError: Cannot convert a Symbol value to a string
```

相应的，TypeScript 也会报错。然而，TypeScript 也会检查一个被用在模版字符串的范型变量是否与 symbol 类型有关。

```ts
function logKey<S extends string | symbol>(key: S): S {
    // Now an error.
    console.log(`${key} is the key`);
    return key;
}

function get<T, K extends keyof T>(obj: T, key: K) {
    // Now an error.
    console.log(`Grabbing property '${key}'.`);
    return obj[key];
}
```

TypeScript 将会有如下报错

```ts
Implicit conversion of a 'symbol' to a 'string' will fail at runtime. Consider wrapping this expression in 'String(...)'.
```

为了解决这个报错，你可以按照报错提示，用 String 包裹表达式外层

```ts
function logKey<S extends string | symbol>(key: S): S {
    // Now an error.
    console.log(`${String(key)} is the key`);
    return key;
}
```

如果你觉得这个错误太学究，在使用 keyof 时，你可能甚至都不关心是否允许使用 symbol keys。在这种情况下，你可以切换到 string & keyof…

```ts
function get<T, K extends string & keyof T>(obj: T, key: K) {
    // Now an error.
    console.log(`Grabbing property '${key}'.`);
    return obj[key];
}
```

相关文件[查阅](https://github.com/microsoft/TypeScript/pull/44578)。

## `LanguageServiceHost` 中的 readFile 方法变为必选

现在如果创建 `LanguageService` 实例，必须提供 readFile 方法。这个改动是支持 moduleDetection 必要的改动。

相关文件[查阅](https://github.com/microsoft/TypeScript/pull/47495)。

## 只读元组有只读 length 属性

只读元组的 length 属性现在只能为只读。对于固定长度的元组来说，不存在这个问题，但对于末尾有可选元素和 rest 元素类型的元组来说，这是一个问题。

下述代码将会报错：

```ts
function overwriteLength(tuple: readonly [string, string, string]) {
    // Now errors.
    tuple.length = 7;
}
```

相关文件[查阅](https://github.com/microsoft/TypeScript/pull/47717)。
