---
aliases: []
tags: ['TypeScript','date/2022-11','year/2022','month/11']
date: 2022-11-30-星期三 14:23:15
update: 2022-11-30-星期三 14:23:20
---

原文链接： https://devblogs.microsoft.com/typescript/announcing-typescript-4-9/

这里是 TypeScript 4.9 更新的内容

-   satifies 操作符
-   in 操作符中未列举的属性收束
-   Class 的 Auto-Accessor
-   对于 NaN 进行检查
-   通过文件系统事件检测文件
-   编辑器增强：“Remove Unused Imports” 和 “Sort Imports”
-   编辑器增强：对于 return 关键字的 Go-to-Definition
-   性能增强
-   正确性修复和破坏性改变

## 从 Beta 和 RC 版本依赖的更新

相比 [RC](https://devblogs.microsoft.com/typescript/announcing-typescript-4-9-rc/) 版本，没有更多的变化加入到 TypeScript 4.9。Beta 版本本来包括 Class 的 Auto-Accessor 和性能改进的部分，但是没有列出在[文档](https://devblogs.microsoft.com/typescript/announcing-typescript-4-9-beta/)上。

## satisfies 操作符

TypeScript 开发者经常面对这样一个难题：我们需要保证一些表达式匹配一些类型，但是又希望保留这个类型更具体的形状。

例如：

```ts
// 每一个属性，既可以是RGB 元组，也可以是一个字符串。
const palette = {
    red: [255, 0, 0],
    green: "#00ff00",
    bleu: [0, 0, 255]
//  ^^^^ sacrebleu - 这里故意写错了!
};

// 我们对于 red 使用数组的方法...
const redComponent = palette.red.at(0);

// 或者对于 green 使用 string 的方法...
const greenNormalized = palette.green.toUpperCase();
```

注意这里故意写成了 bleu， 而实际上应该写成 blue。 我们可以通过给 palette 加一个类型标准来避免这种问题， 但是这样我们又失去具体一个属性的具体类型了。

```ts
type Colors = "red" | "green" | "blue";

type RGB = [red: number, green: number, blue: number];

const palette: Record<Colors, string | RGB> = {
    red: [255, 0, 0],
    green: "#00ff00",
    bleu: [0, 0, 255]
//  ~~~~ 写错就会报错
};

// 但是 red 可能是一个 string，而在上面的表达式中，实际是一个数组。
const redComponent = palette.red.at(0);
```

新的 satisfies 关键字就是用来解决这个问题的。satisfies 可以用来校验一个更具体的形状是否符合预设的形状。我们用 satisfies 来解决上面的问题。

```ts
type Colors = "red" | "green" | "blue";

type RGB = [red: number, green: number, blue: number];

const palette = {
    red: [255, 0, 0],
    green: "#00ff00",
    bleu: [0, 0, 255]
//  ~~~~ 写错就会报错，satisfies 会去校验!
} satisfies Record<Colors, string | RGB>;

// 但是!
const redComponent = palette.red.at(0);
const greenNormalized = palette.green.toUpperCase();
```

satisfies 可以用来捕获很多可能的错误。例如，我们可以保证一个 object 的 key 只能是有限的集合中的结果。

```ts
type Colors = "red" | "green" | "blue";

// 保证所有的 key 都来自 'Colors'.
const favoriteColors = {
    "red": "yes",
    "green": false,
    "blue": "kinda",
    "platypus": false
//  ~~~~~~~~~~ error - "platypus" 并不在 'Colors' 中.
} satisfies Record<Colors, unknown>;

//所有关于 'red', 'green', 和 'blue' 的属性信息都是和值声明一致的.
const g: boolean = favoriteColors.green;
```

也许我们不关心 object 的 key 的名称，而更关心 value 的类型。在下面的例子中，也可以解决这样的问题：

```ts
type RGB = [red: number, green: number, blue: number];

const palette = {
    red: [255, 0, 0],
    green: "#00ff00",
    blue: [0, 0]
    //    ~~~~~~ error!
} satisfies Record<string, string | RGB>;

// 所有值的类型和上面的值声明是一致的.
const redComponent = palette.red.at(0);
const greenNormalized = palette.green.toUpperCase();
```

如果你想看更多的例子，可以查看 [issue](https://github.com/microsoft/TypeScript/issues/47920) 和 [pr](https://github.com/microsoft/TypeScript/pull/46827)。我们感谢 [Oleksandr Tarasiuk](https://github.com/a-tarasyuk) 实现了这个功能。

## in 操作符中未列举的属性收束

作为开发者，我们经常需要处理程序运行时不完全知道的类型。事实上，我们从服务器或者配置文件读一个数据，并不能完全确定这个属性是否存在，JavaScript 的 in 操作符提供了检查一个字段是否存在的手段。

在之前，TypeScript 也提供了一定的对使用 in 操作符进行类型收束。

```ts
interface RGB {
    red: number;
    green: number;
    blue: number;
}

interface HSV {
    hue: number;
    saturation: number;
    value: number;
}

function setColor(color: RGB | HSV) {
    if ("hue" in color) {
        // 'color'd HSV
    }
    // ...
}
```

类型 RGB 并没有 hue 字段，所以可以进行类型收束，在 in 的 block 中，类型被收束为 HSV。

但是，如果没有进行类型标准，会变成什么样子呢？

```ts
function tryGetPackageName(context) {
    const packageJSON = context.packageJSON;
    // 检查我们收到的类型是一个 object.
    if (packageJSON && typeof packageJSON === "object") {
        // 检查存在 name 字段.
        if ("name" in packageJSON && typeof packageJSON.name === "string") {
            return packageJSON.name;
        }
    }

    return undefined;
}
```

把上面的例子改写为 TypeScript，并使用 unknown 类型。

```ts
interface Context {
    packageJSON: unknown;
}

function tryGetPackageName(context: Context) {
    const packageJSON = context.packageJSON;
    // 检查我们收到的类型是一个 object.
    if (packageJSON && typeof packageJSON === "object") {
        // 检查存在 name 字段.
        if ("name" in packageJSON && typeof packageJSON.name === "string") {
        //                                              ~~~~
        // error! Property 'name' does not exist on type 'object.
            return packageJSON.name;
        //                     ~~~~
        // error! Property 'name' does not exist on type 'object.
        }
    }

    return undefined;
}
```

这里会报错是因为，在之前的版本，虽然 unkown 被收束为 object，但是之后的收束并没有生效，TypeScript 依然认为 packageJSON 只是一个 object，而不知道有 name 这个字段。

TypeScript 4.9 会更智能，在通过 in 操作符以后，会给类型添加上断言添加的类型 Record<"property-key-being-checked", unknown>。

所以，在 TypeScript 4.9 中，packageJSON 的类型会先从 unknown 收束为 object，然后继续收束为 object & Record<"name", unknown>。这样后续的操作就知道 packageJSON 有 name 这个字段。

```ts
interface Context {
    packageJSON: unknown;
}

function tryGetPackageName(context: Context): string | undefined {
    const packageJSON = context.packageJSON;
    // 检查我们收到的类型是一个 object.
    if (packageJSON && typeof packageJSON === "object") {
        // 检查存在 name 字段.
        if ("name" in packageJSON && typeof packageJSON.name === "string") {
            // 不会报错了!
            return packageJSON.name;
        }
    }

    return undefined;
}
```

TypeScript 也会对 in 操作符两端做检查，确保左边是 string | number | symbol, 右边是 object。这会保证我们检查的左边是合法的 key，而右边不是在检查一个基础类型。

更多的信息请查看 [pr](https://github.com/microsoft/TypeScript/pull/50666)。

（Hugo 注，这个功能虽然简单，但是让 TypeScript 的断言能力进一步提升，在核心关键点写出更安全的代码提供了方便。）

## **Auto-Accessors in Classes**

TypeScript 只吃了 ECMAScript 的新功能 auto-accessors。auto-accessors 就和 class 的属性一样， ch

```ts
class Person {
    accessor name: string;

    constructor(name: string) {
        this.name = name;
    }
}
```

上面这个写法，在最后会被去糖味 get 和 set 以及不可访问的原生私有属性。

```ts
class Person {
    #__name: string;

    get name() {
        return this.#__name;
    }
    set name(value: string) {
        this.#__name = name;
    }

    constructor(name: string) {
        this.name = name;
    }
}
```

对这个功能关心的话，请查看 [pr](https://github.com/microsoft/TypeScript/pull/49705)。

## 对于 NaN 进行检查

对于 JavaScript 开发者来说，检查一个值和 NaN 的关系是一件不容易的事。

NaN 是一个特殊的数字型值，表示 “不是一个数字”。什么值和 NaN 都不相等，包括 NaN 自己。

```ts
console.log(NaN == 0)  // false
console.log(NaN === 0) // false

console.log(NaN == NaN)  // false
console.log(NaN === NaN) // false
```

和这个等价的另一个规则是，任何东西都和 NaN 不相等。

```ts
console.log(NaN != 0)  // true
console.log(NaN !== 0) // true

console.log(NaN != NaN)  // true
console.log(NaN !== NaN) // true
```

这个奇怪的行为并不是 JavaScript 独有的，任何语言只要实现了 IEEE-754 floats 标准，就会有这个行为。但是 JavaScript 的原生数字类型是一个浮点数型数字值，并且 JavaScript 的数字解析经常会出现 NaN。检查和 NaN 在处理数字相关的代码时，是非常常见的。通常使用 Number.isNaN，但是就像上面提到的，很多开发者实际使用 someValue === NaN 来实现这个功能。

TypeScript 会对 NaN 的直接比较进行报错，提示开发者使用 Number.isNaN（Hugo 注：多么贴心的功能。）。

```ts
function validate(someValue: number) {
    return someValue !== NaN;
    //     ~~~~~~~~~~~~~~~~~
    // error: This condition will always return 'true'.
    //        Did you mean '!Number.isNaN(someValue)'?
}
```

我们认为这个改变能帮助新手开发者防止错误，就像 TypeScript 目前不可以比较 object 和 array 一样。

感谢 [Oleksandr Tarasiuk](https://github.com/a-tarasyuk) 贡献了这个 [PR](https://github.com/microsoft/TypeScript/pull/50626)。

## 通过文件系统事件检测文件

在早期的版本里，TypeScript 非常依赖轮询来检测单个文件。使用轮询的机制表示，TypeScript 需要周期的检查一个文件。在 Node.js 里， fs.watchFIle 时内置的获取轮询文件检测器的内置方法。因为轮询的机制在不同的平台和文件系统中是比较确定的，它会时不时终端 CPU 来看这个文件的状态，即便这个文件啥也没做，也要发生中断。如果文件不多，这个机制是合适的。但是如果文件特别多，比如 node\_modules 里的那么多文件，这种机制会造成一些资源占用浪费。

通常来说，比较好的方法是通过文件系统事件来实现上面的机制。不再使用轮询的机制，我们可以关注关心的文件，然后通过事件触发的回调来实现。绝大部分现代平台提供了`CreateIoCompletionPort`, `kqueue`, `epoll`, 和 `inotify`。Node.js 提供了`[fs.watch](<https://nodejs.org/docs/latest-v18.x/api/fs.html#fswatchfilename-options-listener>)` ，这个接口抽象了这些实现方式。使用 [fs.watch](https://link.zhihu.com/?target=http%3A//fs.watch/) 接口来使用文件系统事件通常工作很好，但是也有一些[缺陷](https://nodejs.org/docs/latest-v18.x/api/fs.html%23caveats)。一个检测者要小心考虑 [inode watching](https://nodejs.org/docs/latest-v18.x/api/fs.html%23inodes)，在一[些文件系统不可用](https://nodejs.org/docs/latest-v18.x/api/fs.html%23availability)（比如网络文件系统）。是否有递归文件检测是可用的，文件夹改名是否触发事件， 还有文件检测者耗尽的问题。换句话说，使用这个机制，需要考虑非常多的问题，尤其是在跨平台使用时。

所以目前的解决方案时，我们默认的方法是在绝大部分时间使用轮询。

随着时间发展，我们会提供其他的[文件检测机制](https://www.typescriptlang.org/docs/handbook/configuring-watch.html)。这让我们可以更多地获得关于跨平台碰到相关问题的反馈。因为 TypeScript 的项目会扩展为非常大的代码库，我们认为切换到基于文件事件的机制是值得投资的事情。

在 TypeScript 4.9， 文件检测默认使用文件系统事件，只有在设置事件检测者失败时回退成轮询的机制。对于绝大部份开发者，使用 —watch 模式可以消耗更少的资源，在使用 TypeScript 强化的编辑器例如 Visual Studio 或者 VS Code 时也会使用更少的资源。

使用 [watchOptions](https://www.typescriptlang.org/docs/handbook/configuring-watch.html) 可以改变这个机制。VS Co[de 也提供了改变这个](https://code.visualstudio.com/docs/getstarted/settings%23%3A~%3Atext%3Dtypescript%252etsserver%252ewatchOptions)参数的方法。如果开发者使用网络文件系统（例如 NFS 和 SMB），需要把这个参数回退成轮询的机制，当然直接在服务器端使用 TypeScript 也是一个不错的选择，这样就是使用本地文件系统了。VS Code 有很多关于远程[开发的插件](https://marketplace.visualstudio.com/search%3Fterm%3Dremote%26target%3DVSCode%26category%3DAll%2520categories%26sortBy%3DRelevance)来帮助这个过程。

你可以在这篇[文章](https://github.com/microsoft/TypeScript/pull/50366)看到关于这个问题更多的信息。

## 编辑器增强：“Remove Unused Imports” 和 “Sort Imports”

在之前的版本，TypeScript 只支持两个编辑器命令来管理 import。 例如

```ts
import { Zebra, Moose, HoneyBadger } from "./zoo";
import { foo, bar } from "./helper";

let x: Moose | HoneyBadger = foo();
```

第一个时 “Organize Imports”，会把不使用的 imports 移除，然后对剩下的 import 进行排序。上面的文件会被重写为：

```ts
import { foo } from "./helper";
import { HoneyBadger, Moose } from "./zoo";

let x: Moose | HoneyBadger = foo();
```

在 TypeScript 4.3， 我们引入了 “Sort Import” 命令，可以只对文件进行排序，而不移除它们，使用这个功能会让一开始的代码变为

```ts
import { bar, foo } from "./helper";
import { HoneyBadger, Moose, Zebra } from "./zoo";

let x: Moose | HoneyBadger = foo();
```

使用 “Sort Imports” 的缺陷是，在 Visual Studio Code 中，这个功能只能是保存时调用的功能，而不是手动触发的功能。

TypeScript 4.9 增加了另一半功能，即 “Remove Unused Imports”，TypeScript 可以移除不使用的 import 和语句，把剩下的代码留下。

```ts
import { Moose, HoneyBadger } from "./zoo";
import { foo } from "./helper";

let x: Moose | HoneyBadger = foo();
```

这个功能对于全部编辑器可用，但是注意 Visual Studio Code（1.73 和之后）会支持内置的可以在命令面板调用的这些功能。用户如果想更细粒度地控制这个行为，可以混合调用 “Remove Unused Imports”、“Sort Imports” 和 “Organize Imports”。

更详细的[文档](https://github.com/microsoft/TypeScript/pull/50931)请参考。

## 编辑器增强：对于 return 关键字的 Go-to-Definition

在编辑器中，当对 return 关键字执行 go-to-definition，TypeScript 会跳到相关函数的顶部。这对于知道这个 return 属于哪个函数是有帮助的。

我们期望 TypeScript 可以扩展这个行为到更多的关键字，比如 [await 和 yield](https://github.com/microsoft/TypeScript/issues/51223)，[switch、case 和 default](https://github.com/microsoft/TypeScript/issues/51225)。

感谢 [Oleksandr Tarasiuk](https://github.com/a-tarasyuk) 提供了这个[实现](https://github.com/microsoft/TypeScript/pull/51227)。

## 性能增强

TypeScript 有了一些小但是值得注意的性能增强。

首先，TypeScript 的 forEachChild 函数使用函数表查找重写了 switch 语句的实现。编译器在进行语法节点遍历时非常依赖 forEachChild，并且在语言服务器的编译器链接阶段也用的很重。重构 forEachChild 带来了绑定阶段大约 20% 的性能提升。

当我们最终发现这个优化对于 forEachChild 的实现很有效果，我们在 visitEachChild（这个函数在编译器和语言服务器中进行转换节点的工作）也做一样的优化。这样大概提升了 visitEachChild 3% 的性能。

最开始对于 forEachChild 优化的启发是来自[Artemis Everfree](https://artemis.sh/) 的[博客](https://artemis.sh/2022/08/07/emulating-calculators-fast-in-js.html)。虽然我们认为目前速度的问题更多是函数的大小和复杂性有关，并不是博文中指出的问题，但是我们对于从这个经验中找到这个优化方法是非常感激的。

最后，对于 TypeScript 在条件分支中保留类型信息做了一些优化，对于类型

```ts
interface Zoo<T extends Animal> {
    // ...
}

type MakeZoo<A> = A extends Animal ? Zoo<A> : never;
```

TypeScript 在检查 `Zoo<A>` 是合法时需要知道 A 是一个 Animal。在之前的版本，TypeScript总是立即做了这件事，目前看是不必要的。并且，一些我们的类型检查器中的错误代码让我们无法简化这个过程。TypeScript 现在推迟到必须知道这个类型时再去检查类型。对于使用条件类型非常多的代码库，能看到非常大的性能提升，对于常规情况，我们看到 3% 的类型检查时间提升。

你可以阅读下面的 PR 来了解更详细的信息

-   `[forEachChild` as a jump-table\]([https://github.com/microsoft/TypeScript/pull/50225](https://github.com/microsoft/TypeScript/pull/50225))
-   `[visitEachChild` as a jump-table\]([https://github.com/microsoft/TypeScript/pull/50266](https://github.com/microsoft/TypeScript/pull/50266))
-   [Optimize substitition types](https://github.com/microsoft/TypeScript/pull/50397)

## 正确性修复和破坏性改变

### 更新 lib.d.ts

虽然 TypeScript 尽量避免大的破坏式更新，因为内置库的一点小变化也会导致一些问题，但是关于 DOM 和 lib.d.ts 仍然会有一些小的破坏式更新。

### 对于 Promise.resolve 的类型增强

Promise.resolve 现在使用 Awaited 类型来对 Proimse-like 的类型进行解包。这意味着现在更多返回正确的 Promise 的类型，而不是 any 或者 unknown。更与这个变更更多请[参考](https://github.com/microsoft/TypeScript/pull/33074)。

### JavaScript不再触发省略 import

当 TypeScript 编译器开始支持 JavaScript 的类型检查和编译时，TypeScript 引入了一些机制，例如省略 import。这个功能的意思是，如果编译器发现一个引入的东西不作为值，则会在最终生成的文件省略这个 import。

现在，TypeScript 会保留这些 import。

```ts
// 输入:
import { someValue, SomeClass } from "some-module";

/** @type {SomeClass} */
let val = someValue;

// 之前版本的输出:
import { someValue } from "some-module";

/** @type {SomeClass} */
let val = someValue;

// 现在的输出:
import { someValue, SomeClass } from "some-module";

/** @type {SomeClass} */
let val = someValue;
```

更多关于这个内容的信息[参考](https://github.com/microsoft/TypeScript/pull/50404)。

### exports 优先级高于 typesVersions

在之前的版本中，当 TypeScript 解析 package.json 通过 `--moduleResolution node16` 时，TypeScript 会错误提升 typesVersions 的优先级高于 exports。如果这个改变影响你的库，你需要增加 types@ 字段。

```json
{
      "type": "module",
      "main": "./dist/main.js"
      "typesVersions": {
          "<4.8": { ".": ["4.8-types/main.d.ts"] },
          "*": { ".": ["modern-types/main.d.ts"] }
      },
      "exports": {
          ".": {
+             "types@<4.8": "4.8-types/main.d.ts",
+             "types": "modern-types/main.d.ts",
              "import": "./dist/main.js"
          }
      }
  }
```

更多信息[参考](https://github.com/microsoft/TypeScript/pull/50890)。（Hugo 注：这种类型的功能，建议等三个版本再上生产。）

### **对于 `SubstitutionType` 的 `substitute` 替换为 `constraint`**

对于替换类型的优化，SubstitutionType 对象不在包含 substitute 属性，substitute 属性代表高效替换，通常是基础类型和隐式限制的交集。现在 SubstitutionType 值包含 **`constraint`** 属性。

更多信息，[参考](https://github.com/microsoft/TypeScript/pull/50397)。

## 下一步

我们目前发布了了 5.0 版本的迭代计划，里面有很多有趣的功能！如果你感兴趣，我们期望你们能来[看看](https://github.com/microsoft/TypeScript/issues/51362)。

期望 4.9 让你的代码旅途更快乐。

Happy Hacking!

– Daniel Rosenwasser and the TypeScript Team