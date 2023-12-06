---
aliases: []
tags: ['TypeScript', 'date/2023-04', 'year/2023', 'month/04']
date: 2023-04-20-星期四 14:12:48
update: 2023-04-20-星期四 16:55:56
---

>英文原味版请临幸 [Announcing TypeScript 5.0](https://devblogs.microsoft.com/typescript/announcing-typescript-5-0/)。


今天我们很高兴地发布 TypeScript 5.0。

本次发布带来了许多新功能，同时旨在使 TypeScript 更小、更简单、更快。我们实现了新的装饰器标准，在 Node 和打包工具中添加了更好支持 ESM 项目的功能，为库作者提供了控制泛型推断的新方式，扩展了我们的 JSDoc 功能，简化了配置，并进行了许多其他改进。

如果你还不熟悉 TypeScript，TypeScript 是在 JavaScript 之上添加了类型的一个编程语言。类型帮助你标记代码的变量和函数的种类。TypeScript 可以利用这些信息，帮助你消除拼写错误，或者是不小心忘记的 null 和 undefined 的检查。但是 TypeScript 提供的远比这些多，TypeScript 可以用这些信息极大的提升你的开发体验，提供例如代码补全，跳转定义，重命名等功能。如果你已经用 Visual Studio 或者 Visual Studio Code 进行编写 JavaScript 的项目，你其实已经间接使用了 TypeScript！你可以在 <https://typescriptlang.org> 上了解这种语言。

但是，如果你已经熟悉了 TypeScript，不用担心！5.0 版本不是一次破坏性的发布，你所了解的一切仍然适用。虽然 TypeScript 5.0 包括了一些正确性的更改和一些不常用选项的弃用，但我们认为大多数开发人员的升级体验将类似于以前的版本。

开始使用 TypeScript，你可以通过 [NuGet](https://www.nuget.org/packages/Microsoft.TypeScript.MSBuild)，或者 npm 通过下面这个命令：

```sh
npm install -D typescript
```

这里是 TypeScript 5.0 更新的内容

- 装饰器
- 类型参数 const 关键字
- 配置文件支持 extends 多个配置文件
- 所有枚举都是联合枚举
- —moduleResolution bundler
- Resolution Customization 标志位
- —verbatimModuleSyntax
- 支持导出 type \*
- JSDoc 支持 @satisfies
- JSDoc 支持 @overload
- —build 标签支持传递发射文件相关的 flag
- 编辑器中的不区分大小写的导入排序
- 穷尽 switch/case 的可能性
- 速度、内存和包大小优化
- 破坏性更新和废弃
- 下一步

## 自从 Beta 和 RC 以来的变化

自 TypeScript 5.0 Beta 版本以来，TypeScript 5.0 有几个值得注意的变化。

其中一个新变化是 TypeScript 允许将装饰器放置在 `export` 和 `export default` 之前或之后。这个变化反映了 TC39（ECMAScript/JavaScript 的标准机构）内的讨论和共识。

另一个变化是新的打包器模块解析选项现在只能在 `--module` 选项设置为 `esnext` 时使用。这是为了确保在打包器解析 `import` 语句之前，输入文件中编写的 `import` 语句不会被转换为 `require` 调用，无论打包器或加载器是否遵循 TypeScript 的模块选项。在这些发布说明中，我们还提供了一些上下文信息，建议大多数库作者坚持使用 `node16` 或 `nodenext`。

虽然 TypeScript 5.0 Beta 版本已经发布了编辑器场景中支持不区分大小写的 import 排序的工作的功能，但是之前的发布内容没有提到。这部分原因是定制化的用户体验仍在讨论中，但默认情况下，TypeScript 现在应该能够更好地与你的其他工具协同工作。

自从发布 RC 版本以来，最值得注意的变化是 TypeScript 5.0 现在在 `package.json` 中指定了 Node.js 的最低版本为 `12.20`。我们还发布了一篇关于 TypeScript 5.0 迁移到模块化的 [文章](https://devblogs.microsoft.com/typescript/typescripts-migration-to-modules/)。

自 TypeScript 5.0 Beta 和 RC 版本发布以来，速度基准测试和包大小差异的具体数字也已经做了调整。一些基准测试的名称也进行了调整以提高清晰度，并将包大小的改进移动到了单独的图表中。

## 装饰器

装饰器是 ECMAScript 即将增加的功能，可以用来自定义类和成员的行为，而且这些自定义的装饰器可以被复用。

考虑下面的代码。

```ts
class Person {
  name: string
  constructor(name: string) {
    this.name = name
  }

  greet() {
    console.log(`Hello, my name is ${this.name}.`)
  }
}

const p = new Person('Ray')
p.greet()
```

这里 `greet` 方法是比较简单的，让我们假设这里的情况要更复杂，也许这里做了一些异步逻辑，还有递归，还有副作用。无论里面的内容是什么，假设你在这个函数里用 `console.log` 做 debug。

```ts
class Person {
  name: string
  constructor(name: string) {
    this.name = name
  }

  greet() {
    console.log('LOG: Entering method.')

    console.log(`Hello, my name is ${this.name}.`)

    console.log('LOG: Exiting method.')
  }
}
```

这种模式是很常见的。如果我们可以对于每一个方法提供复用这个过程的方法，这个就是装饰器的场景。我们可以写一个函数叫 `loggedMethod` 像下面这样。

```ts
function loggedMethod(originalMethod: any, _context: any) {
  function replacementMethod(this: any, ...args: any[]) {
    console.log('LOG: Entering method.')
    const result = originalMethod.call(this, ...args)
    console.log('LOG: Exiting method.')
    return result
  }

  return replacementMethod
}
```

可能有开发者会问：“这里为什么有这么多 any，这是 anyScript 么？”

别急，我们让事情简单一些，来关注这个函数做了什么。注意 `loggedMethod` 接收了原本的方法（`originalMethod`）作为参数，返回了一个函数：

1. 打印了 “Entering…” 日志
2. 把 `this` 和参数传递会原来的方法
3. 打印 “Exiting…” 日志
4. 把原来的方法返回值返回

现在我们可以用 `loggedMethod` 来装饰 `greet` 方法：

```ts
class Person {
  name: string
  constructor(name: string) {
    this.name = name
  }

  @loggedMethod
  greet() {
    console.log(`Hello, my name is ${this.name}.`)
  }
}

const p = new Person('Ray')
p.greet()

// Output:
//
//   LOG: Entering method.
//   Hello, my name is Ray.
//   LOG: Exiting method.
```

这里在 `greet` 方法上面使用 `loggedMethod` 作为了装饰器，注意这里的写法为 `@loggedMethod`。这么做时，他会被方法的 `target` 和 `context object` 调用。因为 `loggedMethod` 返回了一个新的函数，新的函数替换了原本 `greet` 的定义。

我们还没提到，`loggedMethod` 还有第二个参数，这个参数叫 `context object`。这里面有一些对于要装饰的方法有用的信息，例如被装饰的方法是 `#private` 成员或者 `static` 成员，这个方法的名字是什么。重写 `loggedMethod` 来利用这些信息。

```ts
function loggedMethod(originalMethod: any, context: ClassMethodDecoratorContext) {
  const methodName = String(context.name)

  function replacementMethod(this: any, ...args: any[]) {
    console.log(`LOG: Entering method '${methodName}'.`)
    const result = originalMethod.call(this, ...args)
    console.log(`LOG: Exiting method '${methodName}'.`)
    return result
  }

  return replacementMethod
}
```

现在就在使用 context 参数，这是第一个装饰器函数中比 `any` 要严格的类型。TypeScript 提供了一个类型叫 `ClassMethodDecoratorContext`，这个类型为装饰器函数的 `context object` 建模。

除了一些元数据，方法的 `context object` 还提供了一个有用的函数 `addInitializer`。这个函数可以挂载到构造函数执行之前（如果是静态类，则会在类初始化的时候。）

作为一个例子，在 JavaScript，使用下面的模式是非常常见的。

```ts
class Person {
  name: string
  constructor(name: string) {
    this.name = name

    this.greet = this.greet.bind(this)
  }

  greet() {
    console.log(`Hello, my name is ${this.name}.`)
  }
}
```

`greet` 也可以声明为一个用箭头函数初始化的属性。

```ts
class Person {
  name: string
  constructor(name: string) {
    this.name = name
  }

  greet = () => {
    console.log(`Hello, my name is ${this.name}.`)
  }
}
```

这样写，可以保证即便把 `greet` 作为一个独立的函数调用时，`this` 的绑定也是正确的。

```ts
const greet = new Person('Ray').greet

// We don't want this to fail!
greet()
```

可以使用装饰器使用 `addInitializer` 来调用 `bind` 函数。

```ts
function bound(originalMethod: any, context: ClassMethodDecoratorContext) {
  const methodName = context.name
  if (context.private) {
    throw new Error(
      `'bound' cannot decorate private properties like ${methodName as string}.`
    )
  }
  context.addInitializer(function () {
    this[methodName] = this[methodName].bind(this)
  })
}
```

`bound` 装饰器不需要返回任何值，当它装饰一个方法时，它返回的就是原本的方法。相反，它会在其他字段初始化之前添加逻辑。

```ts
class Person {
  name: string
  constructor(name: string) {
    this.name = name
  }

  @bound
  @loggedMethod
  greet() {
    console.log(`Hello, my name is ${this.name}.`)
  }
}

const p = new Person('Ray')
const greet = p.greet

// Works!
greet()
```

注意这里，我们堆叠了两个装饰器—`@bound` 和 `@loggedMethod`。 这些装饰器的调用是与声明的顺序相反的。`@loggedMethod` 装饰了最原始的 `greet`，`@bound` 装饰了 `@loggedMethod` 装饰后的结果。在这个例子中，顺序影响不大，但是如果你的装饰器有副作用，或者期望按照特定的顺序时，顺序就要考虑。

还有一点值得一提，如果你期望装饰器的写法样式不是堆叠的，也可以是声明在方法的前面，排成一条线。

```ts
@bound @loggedMethod greet() {
  console.log(`Hello, my name is ${this.name}.`);
}
```

还有一点值得一提，可以让一个函数返回一个装饰器。这使得可以对最终的装饰器提供一些自定义的功能。如果我们需要，可以修改 `loggedMethod`，返回一个装饰器，自定义日志的内容。

```ts
function loggedMethod(headMessage = 'LOG:') {
  return function actualDecorator(
    originalMethod: any,
    context: ClassMethodDecoratorContext
  ) {
    const methodName = String(context.name)

    function replacementMethod(this: any, ...args: any[]) {
      console.log(`${headMessage} Entering method '${methodName}'.`)
      const result = originalMethod.call(this, ...args)
      console.log(`${headMessage} Exiting method '${methodName}'.`)
      return result
    }

    return replacementMethod
  }
}
```

如果这么做，可以调用 `loggedMethod` 方法，然后作为一个装饰器。现在这个装饰器，可以传递任意字符串作为信息的前缀，然后打印到控制台中。

```ts
class Person {
  name: string
  constructor(name: string) {
    this.name = name
  }

  @loggedMethod('')
  greet() {
    console.log(`Hello, my name is ${this.name}.`)
  }
}

const p = new Person('Ray')
p.greet()

// Output:
//
//    Entering method 'greet'.
//   Hello, my name is Ray.
//    Exiting method 'greet'.
```

装饰器不仅能在方法中使用！它们也可以在属性、getters、setters 和 [[TypeScript 4.9#**Auto-Accessors in Classes**|auto-accessors]] 中使用。class 可以用装饰器来做一些事，例如子类化和注册。

如果你对装饰器还想了解更深的内容，请阅读 Axel Rauschmayer 的 [文章](https://2ality.com/2022/10/javascript-decorators.html)。

对于这个变更涉及的内容，可以来看 [PR 的内容](https://github.com/microsoft/TypeScript/pull/50820)。

## 与试验传统装饰器的区别

如果你已经使用了一段时间 TypeScript，你应该知道 TypeScript 支持试验性的装饰器已经很多年了。虽然这些试验装饰器很有用，但是它的标准是很早的一个装饰器提案。需要使用 `--experimentalDecorators` 来启用这个功能。之前如果不加这个标志，在 TypeScript 中使用装饰器就会报错。

`--experimentalDecorators` 还会在很长时间都存在。然而，不加这个标志位，装饰器就会是新标准的装饰器。使用 `--experimentalDecorators` 与否的类型检查和最终生态的代码都是不一样的。因为新旧标准的装饰器无论是类型检查规则还是发射的文件内容都有区别，虽然可以编写装饰器同时支持两种装饰器，但是现存的代码不太可能都这样做。

新装饰器与 `--emitDecoratorMetadata` 是不兼容的，并且新装饰器不允许装饰函数的参数。也许未来的 ECMAScript 提案会解决这个问题。

最后注意：除了允许将装饰器放置在 `export` 关键字之前，现在装饰器提案还提供了在 `export` 或 `export default` 关键字之后放置装饰器的选项。唯一的例外是不允许混合使用这两种样式。

```ts
//  允许
@register export default class Foo {
  // ...
}

//  也允许
export default @register class Bar {
  // ...
}

//  报错，不允许同时存在
@before export @after class Bar {
  // ...
}
```

## 编写类型全面的装饰器

`loggedMethod` 和 `bound` 装饰器例子故意给予了简单的类型。

给装饰器标注类型可能会比较复杂。例如，一个完整类型版本的 loggedMethod

```ts
function loggedMethod<This, Args extends any[], Return>(
  target: (this: This, ...args: Args) => Return,
  context: ClassMethodDecoratorContext<This, (this: This, ...args: Args) => Return>
) {
  const methodName = String(context.name)

  function replacementMethod(this: This, ...args: Args): Return {
    console.log(`LOG: Entering method '${methodName}'.`)
    const result = target.call(this, ...args)
    console.log(`LOG: Exiting method '${methodName}'.`)
    return result
  }

  return replacementMethod
}
```

我们需要标注出 `this` 的类型，参数以及最终返回的原始方法的类型，使用类型工具 `This`，`Args` 和 `Return`。

最终装饰器的类型有多复杂，取决于你想保证的类型。注意，装饰器使用时比较频繁的，所以类型全面的装饰器是有价值的，当然这里面有可读性的权衡，尝试让事情简单的方法吧。

未来我们会做更多关于装饰器的文档，但是这个 [博文](https://2ality.com/2022/10/javascript-decorators.html) 已经提供了很多很好的细节。

## 类型参数 const 修饰符

当推导一个 object 的类型时，TypeScript 经常会选择一个更普遍的类型。例如，在下面的例子中，`names` 的类型被推导为 `string[]`：

```ts
type HasNames = { readonly names: string[] }
function getNamesExactly<T extends HasNames>(arg: T): T['names'] {
  return arg.names
}

// Inferred type: string[]
const names = getNamesExactly({ names: ['Alice', 'Bob', 'Eve'] })
```

通常这么做的目的是，在下面可以对这个变量进行可变的操作。

然而，取决于 `getNamesExactly` 想要实现的意图，可能想要一个更具体的类型。

目前，API 作者通常会在一些地方增加 `as const` 来让一些类型更具体。

```ts
// 我们想要的类型是:
//    readonly ["Alice", "Bob", "Eve"]
// 实际得到的类型:
//    string[]
const names1 = getNamesExactly({ names: ['Alice', 'Bob', 'Eve'] })

// 正确得到我们想要的类型:
//    readonly ["Alice", "Bob", "Eve"]
const names2 = getNamesExactly({ names: ['Alice', 'Bob', 'Eve'] } as const)
```

这么做很容易忘掉，也很繁琐。在 TypeScript 5.0，你可以在类型参数的声明处增加 `const` 修饰符，默认得到的参数就是 `const` 声明一样的推导结果。

```ts
type HasNames = { names: readonly string[] };
function getNamesExactly<const T extends HasNames>(arg: T): T["names"] {
//                       ^^^^^
    return arg.names;
}

// 推导类型: readonly ["Alice", "Bob", "Eve"]
// 注意：不再需要使用 as const 声明
const names = getNamesExactly({ names: ["Alice", "Bob", "Eve"] });
```

注意，`const` 修饰符不会拒绝可变变量，也不需要不可变限制。传递可变类型的限制可能会有意外的结果。例如

```ts
declare function fnBad<const T extends string[]>(args: T): void;

// 'T' is still 'string[]' since 'readonly ["a", "b", "c"]' is not assignable to 'string[]'
fnBad(["a", "b" ,"c"]);
```

这里，对于 `T` 的推导候选类型是 `readonly ["a", "b", "c"]`，这里就需要传入 `readonly` 的数组。在这个例子里，推导会回退回到限制，数组就会被当作 `string[]` 来看待，调用时可以成功的。`

更好的类型标注是 `readonly string[]`：

```ts
declare function fnGood<const T extends readonly string[]>(args: T): void;

// T is readonly ["a", "b", "c"]
fnGood(["a", "b" ,"c"]);
```

注意 `const` 修饰符只影响 object、数组和基本类型表达式在调用内的类型推断，对于传入的参数本身并没有任何更改，类型仍然是声明时的类型。

```ts
declare function fnGood<const T extends readonly string[]>(args: T): void;
const arr = ["a", "b" ,"c"];

// 'T' 仍然是 'string[]'-- 'const' 修饰符在此处没有作用
fnGood(arr);
```

如果想了解更多的内容，请参考 [pr](https://github.com/microsoft/TypeScript/pull/51865)。

## 配置文件支持 extends 多个配置文件

当管理多个项目时，有一个基础的配置让多个 `tsconfig.json` 来继承是比较方便的。这也是 TypeScript 支持 extends 的原因。

```json
// packages/front-end/src/tsconfig.json
{
  "extends": "../../../tsconfig.base.json",
  "compilerOptions": {
    "outDir": "../lib"
    // ...
  }
}
```

但是有一些常见，你可能希望继承多个配置文件。例如，一个 [基础配置文件](https://github.com/tsconfig/bases) 发布到了 npm 仓库。如果你希望所有的项目还使用 `@tsconfig/strictest` 的配置， 之前的方案是，在 `tsconfig.base.json` 继承 `@tsconfig/strictest`。

```json
// tsconfig.base.json
{
  "extends": "@tsconfig/strictest/tsconfig.json",
  "compilerOptions": {
    // ...
  }
}
```

这么做，有个问题，如果有某个项目不想使用 `@tsconfig/strictest`，要么它自己去关闭一些选项，要么在制作一个没有继承 `@tsconfig/strictest` 的 `tsconfig.base.json`。

TypeScript 5.0 提供了更多的自由度，现在可以 `extends` 多个文件。

```json
{
  "extends": ["a", "b", "c"],
  "compilerOptions": {
    // ...
  }
}
```

这么些，类似于只继承 `c`，`c` 继承 `b`，`b` 继承 `a`。如果任何字段冲突，后面的文件覆盖前面的。

在下面的例子中，`strictNullChecks` 和 `noImplicitAny` 都会在嘴中的 tsconfig.json 中打开。

```json
// tsconfig1.json
{
  "compilerOptions": {
    "strictNullChecks": true
  }
}

// tsconfig2.json
{
  "compilerOptions": {
    "noImplicitAny": true
  }
}

// tsconfig.json
{
  "extends": ["./tsconfig1.json", "./tsconfig2.json"],
  "files": ["./index.ts"]
}
```

作为另一个例子，我们可以把一开始的例子改写为

```json
// packages/front-end/src/tsconfig.json
{
  "extends": ["@tsconfig/strictest/tsconfig.json", "../../../tsconfig.base.json"],
  "compilerOptions": {
    "outDir": "../lib"
    // ...
  }
}
```

如果你对这个的细节更管，请阅读 [PR](https://github.com/microsoft/TypeScript/pull/50403)。

## 所有 enum 都是 union `enum`

当 TypeScript 最初引入 enums 时，enums 更像是一系列相同类型的数字常量。

```ts
enum E {
  Foo = 10,
  Bar = 20,
}
```

对于 `E.Foo` 和 `E.Bar` 唯一特殊的是它们可以赋值给类型 `E` 的变量。除了这一点，它们就是 `numbers`。

```ts
function takeValue(e: E) {}

takeValue(E.Foo) // works
takeValue(123) // error!
```

当 TypeScript 2.0 引入 enum literal 类型时，事情有了一些变化。字符串字面量枚举类型给了每个枚举成员自己的类型，然后把枚举本身变为了自己成员类型的联合类型。这也可以让我们只用枚举类型的一个子集，然后收窄到这些类型。

```ts
// Color 就像联合类型 Red | Orange | Yellow | Green | Blue | Violet
enum Color {
  Red,
  Orange,
  Yellow,
  Green,
  Blue,
  /* Indigo, */
  Violet,
}

//每一个枚举成员都有自己的类型
type PrimaryColor = Color.Red | Color.Green | Color.Blue

function isPrimaryColor(c: Color): C is PrimaryColor {
  // 收束字面量类型可以找到 bug
  // TypeScript 会在这里报错
  // 因为我们比较了 'Color.Red' 和 'Color.Green'.
  // 本来应该写 ||, 但是意外写错成了 &&.
  return c === Color.Red && c === Color.Green && c === Color.Blue
}
```

给予每个枚举成员自己的类型的问题是这个类型与这个成员实际的值有关。在一些情况，可能无法得到这个值。例如，枚举的成员可以使用函数初始化。

```ts
enum E {
  Blah = Math.random(),
}
```

当 TypeScript 碰到这些问题，会自动回退到原来的策略。会放弃联合类型和字面量类型的好处。

TypeScript 5.0 为了实现让所有的枚举类型变为联合枚举，给每一个成员计算了独立的类型。这意味着，所有的枚举成员可以被收束，也可以被引用为类型。

对于这个增强，更多内容见 [pr](https://github.com/microsoft/TypeScript/pull/50528)。

## —moduleResolution bundler

TypeScript 4.7 对于 `--module` 和 `--moduleResolution` 引入了 `node16` 和 `nodenext`。引入这些选项的目的是为了精确控制在 Node.js 中寻找 ECMAScript 模块的规则。因为这个模式有很多限制，所以其他工具用会有一些问题。

例如，在 Node.js 的 ECMAScript 模块中，任何相对引入都需要引入文件名。

```ts
// entry.mjs
import * as utils from './utils' //  wrong - 我们需要文件后缀名.

import * as utils from './utils.mjs' //  works
```

对于 Node.js 和浏览器，这样有扩展名可以找文件更好和更快。但是对于很多开发者，因为使用了打包器，`node16`/`nodenext` 设计会很麻烦，因为打包器没有这些限制。实际上，如果使用打包器，`node` 解析模式是更好的。

但是，在某个层面说，原来的 `node` 解析模式已经过时了。大部分现代打包器都是用了融合 ECMAScript 模块和 CommonJS 模块寻找规则的方法。例如，不使用后缀名通常也是可以工作的。但是当寻找 package.json 的 [条件 export](https://nodejs.org/api/packages.html#nested-conditions) 时，打包器倾向于 ECMAScript 的 import 条件。

为了给打包器工作建模，TypeScript 引入了一个新的策略选项：`--moduleResolution bundler` 。

```json
{
  "compilerOptions": {
    "target": "esnext",
    "moduleResolution": "bundler"
  }
}
```

如果你使用现代打包器，例如 Vite，esbuild，swc，Webpack，Parcel，或者其他实现了混合寻找策略的工具，使用 `bundler` 选项会更好。

另一方面，如果你正在编写一个打算发布到 npm 的库，使用打包器选项可能会隐藏兼容性问题，这些问题可能会影响那些没有使用打包器的用户。因此，在这些情况下，使用 `node16` 或 `nodenext` 解析选项可能是更好的选择。

这个选项的详细内容参考 [PR](https://github.com/microsoft/TypeScript/pull/51669)。

## Resolution Customization 标志位

JavaScript 工具提供 hybrid 解析规则，就像 `bundler` 模式一样。因为一些工具提供的多少不同。所以 TypeScript 5.0 提供了打开和关闭一些功能的选项。

**`allowImportingTsExtensions`**

`--allowImportingTsExtensions` 允许 TypeScript 文件使用 TypeScript 特定的文件名后缀，如 `.ts`, `.mts` 或者 `.tsx`。

这个选项只有 `--noEmit` 或者 `--emitDeclarationOnly` 打开时才可以使用，因为这些路径不会被 JavaScript 运行时运行。这个选项期望达到的效果是你的解析器（例如你的打包器、运行时或者其他工具）会在 .ts 文件之间使用。

**`resolvePackageJsonExports`**

`--resolvePackageJsonExports` 强制 TypeScript 去寻找 [package.json 的 exports 字段](https://nodejs.org/api/packages.html#exports)，尝试看是否能读到东西。

在 `--moduleResolution` 设置为 `node16`、`nodenext` 和 `bundler` 时，默认是打开的。

**`resolvePackageJsonImports`**

`--resolvePackageJsonImports` 强制 TypeScript 去询问 [pakcage.json 的 imports 字段](https://nodejs.org/api/packages.html#imports)，当寻找 `#` 开头的文件时，且父目录有 `package.json`。

在 `--moduleResolution` 设置为 `node16`、`nodenext` 和 `bundler` 时，默认是打开的。

**`allowArbitraryExtensions`**

在 TypeScript 5.0，当引入的路径结尾不是一个已知的 JavaScript 或者 TypeScript 文件结尾时，编译器会去寻找类型声明文件 `{file basename}.d.{extension}.ts`。例如，如果你在一个打包器打包的项目中使用 CSS 加载器，你可能想给这些 stylesheets 增加或者生成声明文件。

```css
/* app.css */
.cookie-banner {
  display: none;
}
```

```ts
// app.d.css.ts
declare const css: {
  cookieBanner: string
}
export default css
```

```tsx
// App.tsx
import styles from './app.css'

styles.cookieBanner // string
```

默认，TypeScript 因为不知道这些文件类型，所以会报错。但是，如果你通过配置你的运行时或者打包器，可以运行这些文件，你可以通过打开 `--allowArbitraryExtensions` 来让 TypeScript 编译器不要对这种问题报错。

注意，之前解决这种问题的方法是，添加一个 `app.css.d.ts` 而不是 `app.d.css.ts` ，通常可以达到类似的效果 ——然而，这只是通过 Node 对 CommonJS 的  `require`  解析规则起作用。严格来讲，前者被解释为 app.css.js 的类型声明文件，因为在 Node 的 ESM 支持中，需要增加后缀名，当 TypeScript 打开 `--moduleResolution` `node16` 或者 `nodenext` 会报错。

更详细的内容，请参看这个功能 [发起](https://github.com/microsoft/TypeScript/issues/50133)，和这个功能的 [pr](https://github.com/microsoft/TypeScript/pull/51435)。

**`customConditions`**

`--customConditions` 引入了当 TypeScript 编译器解析 package.json 的 `exports` 或者 `imports` 字段时需要成功的条件。这些条件将添加到解析器默认使用的任何现有条件中。

例如，当 `tsconfig.json` 这样设置时，

```json
{
  "compilerOptions": {
    "target": "es2022",
    "moduleResolution": "bundler",
    "customConditions": ["my-condition"]
  }
}
```

每当在 `package.json` 中引用 `exports` 或 `imports` 字段时，TypeScript 将考虑名为 `my-condition` 的条件。

因此，当从具有以下 package.json 的包中进行导入时：

```json
{
  // ...
  "exports": {
    ".": {
      "my-condition": "./foo.mjs",
      "node": "./bar.mjs",
      "import": "./baz.mjs",
      "require": "./biz.mjs"
    }
  }
}
```

TypeScript 将尝试查找与 `foo.mjs` 对应的文件。

在 `--moduleResolution` 的 `node16`、`nodenext` 和 `bundler` 选项下，此字段才是有效的。

## **`--verbatimModuleSyntax`**

默认情况下，TypeScript 执行一种称为“导入省略”的操作。基本上，如果你编写以下代码：

```ts
import { Car } from './car'

export function drive(car: Car) {
  // ...
}
```

TypeScript 检测到你只是使用导入的类型，因此完全省略了该导入。你的输出 JavaScript 可能会类似于这样：

```ts
export function drive(car) {
  // ...
}
```

大多数情况下这是好的，因为如果 `Car` 不是从 `./car` 导出的值，我们会得到一个运行时错误。

但对于某些边缘情况，它确实增加了一层复杂性。例如，注意没有类似于 `import "./car";` 的语句 - 导入完全被省略了。对于具有副作用或无副作用的模块，这实际上是有所区别的。

TypeScript 对 JavaScript 的 emit 策略还有另外几层复杂性 - 导入省略并不总是仅仅由导入的使用方式决定 - 它经常要查看值的声明方式。因此，下面这样的代码并不总是清晰的：

```ts
export { Car } from './car'
```

上述代码应该被保留还是被省略。如果 `Car` 被声明为类似于类的东西，那么它可以在生成的 JavaScript 文件中保留下来。但如果 `Car` 只被声明为 `type` 或 `interface`，则 JavaScript 文件根本不应该导出 `Car`。

虽然 TypeScript 可能能够根据跨文件的信息做出这些 emit 决策，但并非每个编译器都可以。

导入和导出的类型修饰符在这些情况下有所帮助。我们可以明确指出导入或导出仅被用于类型分析，并且可以通过使用类型修饰符在 JavaScript 文件中完全省略它们。

```ts
// 这个语句在生成的 JavaScript 输出中可以完全省略。
import type * as car from './car'

// 在生成的 JavaScript 输出中，命名的导入/导出 'Car' 可以被完全省略。
import { type Car } from './car'
export { type Car } from './car'
```

类型修饰符本身并不是非常有用 - 默认情况下，模块省略仍会省略导入，并且没有任何东西可以强制你区分类型和普通导入和导出。因此，TypeScript 有一个标志 `--importsNotUsedAsValues`，以确保你使用类型修饰符，`--preserveValueImports` 以防止某些模块省略行为，以及 `--isolatedModules` 以确保你的 TypeScript 代码在不同的编译器之间工作。不幸的是，理解这 3 个标志的细节很难，并且仍然存在一些出乎意料的行为的边缘情况。

TypeScript 5.0 引入了一个称为 `--verbatimModuleSyntax` 的新选项，以简化情况。规则要简单得多 - 没有类型修饰符的任何导入或导出都将被保留下来。使用类型修饰符的任何内容都将被完全省略。

```ts
// 完全被抹掉了。
import type { A } from 'a'

// 重写为 'import { b } from "bcd";'。
import { b, type c, type d } from 'bcd'

// 重写为 'import {} from "xyz";'。
import { type xyz } from 'xyz'
```

在这个新选项下，你所看到的就是你所得到的。

然而，这在涉及模块互操作性时会产生一些影响。在这个标志下，当你的设置或文件扩展名暗示了不同的模块系统时，ECMAScript 的 `import` 和 `export` 不会被重写为 `require` 调用。相反，你会得到一个错误。如果你需要生成使用 `require` 和 `module.exports` 的代码，你将需要使用 TypeScript 在 ES2015 之前的模块语法：

![](_attachment/img/2f0225603d5e289db5478d5304bced4a_MD5.png)

虽然这是一个限制，但它确实有助于使一些问题更加明显。例如，在 --module node16 下忘记在 package.json 中设置 type 字段是非常常见的。结果，开发人员会开始编写 CommonJS 模块，而不知道自己正在使用 ES 模块，这会产生令人惊讶的查找规则和 JavaScript 输出。这个新标志确保你对你正在使用的文件类型有意识，因为语法是有意不同的。

由于 --verbatimModuleSyntax 提供了比 --importsNotUsedAsValues 和 --preserveValueImports 更一致的故事，因此这两个现有标志将被弃用。

了解更多细节，请阅读原始 [PR](https://github.com/microsoft/TypeScript/pull/52203) 及其 [提案](https://github.com/microsoft/TypeScript/issues/51479) 问题。

## 支持 **`export type *`**

当 TypeScript 3.8 引入了类型仅导入时，新的语法在 `export * from "module"` 或 `export * as ns from "module"` 的重新导出中是不被允许的。TypeScript 5.0 添加了对这两种形式的支持：

```ts
// models/vehicles.ts
export class Spaceship {
  // ...
}

// models/index.ts
export type * as vehicles from './vehicles'

// main.ts
import { vehicles } from './models'

function takeASpaceship(s: vehicles.Spaceship) {
  //  ok - `vehicles` only used in a type position
}

function makeASpaceship() {
  return new vehicles.Spaceship()
  //         ^^^^^^^^
  // 'vehicles' cannot be used as a value because it was exported using 'export type'.
}
```

更多信息见 [实现](https://github.com/microsoft/TypeScript/pull/52217)。

## **JSDoc 支持 `@satisfies`**

TypeScript 4.9 引入了 `satisfies` 操作符。它确保表达式的类型是兼容的，而不会影响类型本身。例如，让我们看一下以下代码：

```ts
interface CompilerOptions {
  strict?: boolean
  outDir?: string
  // ...
}

interface ConfigSettings {
  compilerOptions?: CompilerOptions
  extends?: string | string[]
  // ...
}

let myConfigSettings = {
  compilerOptions: {
    strict: true,
    outDir: '../lib',
    // ...
  },

  extends: ['@tsconfig/strictest/tsconfig.json', '../../../tsconfig.base.json'],
} satisfies ConfigSettings
```

在这里，TypeScript 知道 `myConfigSettings.extends` 是用一个数组声明的 - 因为虽然 `satisfies` 验证了我们对象的类型，但它没有简单地将它更改为 `ConfigSettings` 并且失去了信息。所以如果我们想在 `extends` 上进行映射，那是可以的的。

```ts
declare function resolveConfig(configPath: string): CompilerOptions

let inheritedConfigs = myConfigSettings.extends.map(resolveConfig)
```

这对 TypeScript 用户很有帮助，但是很多人使用 TypeScript 使用 JSDoc 注释来对他们的 JavaScript 代码进行类型检查。这就是为什么 TypeScript 5.0 支持一个名为 `@satisfies` 的新 JSDoc 标签，它可以做完全相同的事情。

`/** @satisfies */` 可以捕获类型不匹配：

```ts
// @ts-check

/**
 * @typedef CompilerOptions
 * @prop {boolean} [strict]
 * @prop {string} [outDir]
 */

/**
 * @satisfies {CompilerOptions}
 */
let myCompilerOptions = {
  outdir: '../lib',
  //  ~~~~~~ oops! we meant outDir
}
```

但它将保留我们表达式的原始类型，允许我们稍后在代码中更精确地使用我们的值。

```ts
// @ts-check

/**
 * @typedef CompilerOptions
 * @prop {boolean} [strict]
 * @prop {string} [outDir]
 */

/**
 * @typedef ConfigSettings
 * @prop {CompilerOptions} [compilerOptions]
 * @prop {string | string[]} [extends]
 */

/**
 * @satisfies {ConfigSettings}
 */
let myConfigSettings = {
  compilerOptions: {
    strict: true,
    outDir: '../lib',
  },
  extends: ['@tsconfig/strictest/tsconfig.json', '../../../tsconfig.base.json'],
}

let inheritedConfigs = myConfigSettings.extends.map(resolveConfig)
```

`/** @satisfies */` 也可以内联在任何带括号的表达式上使用。我们可以这样写 `myConfigSettings`：

```ts
let myConfigSettings = /** @satisfies {ConfigSettings} */ {
  compilerOptions: {
    strict: true,
    outDir: '../lib',
  },
  extends: ['@tsconfig/strictest/tsconfig.json', '../../../tsconfig.base.json'],
}
```

为什么？嗯，当你深入到其他代码中时，比如函数调用时，通常更有意义。

```ts
compileCode(
  /** @satisfies {ConfigSettings} */ {
    // ...
  }
)
```

感谢 Oleksandr Tarasiuk 提供了这个 [功能](https://github.com/microsoft/TypeScript/pull/51753)！

## **JSDoc 支持 `@overload`**

在 TypeScript 中，你可以为一个函数指定多个重载。重载提供了一种方式来说明一个函数可以使用不同的参数进行调用，可能会返回不同的结果。它们可以限制调用者实际使用我们的函数的方式，并细化他们将得到的结果。

```ts
// Our overloads:
function printValue(str: string): void
function printValue(num: number, maxFractionDigits?: number): void

// Our implementation:
function printValue(value: string | number, maximumFractionDigits?: number) {
  if (typeof value === 'number') {
    const formatter = Intl.NumberFormat('en-US', {
      maximumFractionDigits,
    })
    value = formatter.format(value)
  }

  console.log(value)
}
```

在这里，我们说 `printValue` 接受一个字符串或一个数字作为它的第一个参数。如果它接受一个数字，则可以接受第二个参数来确定我们可以打印的小数位数。

TypeScript 5.0 现在允许使用新的 `@overload` 标签在 JSDoc 中声明重载。每个带有 `@overload` 标签的 JSDoc 注释都被视为以下函数声明的不同重载。

```ts
// @ts-check

/**
 * @overload
 * @param {string} value
 * @return {void}
 */

/**
 * @overload
 * @param {number} value
 * @param {number} [maximumFractionDigits]
 * @return {void}
 */

/**
 * @param {string | number} value
 * @param {number} [maximumFractionDigits]
 */
function printValue(value, maximumFractionDigits) {
  if (typeof value === 'number') {
    const formatter = Intl.NumberFormat('en-US', {
      maximumFractionDigits,
    })
    value = formatter.format(value)
  }

  console.log(value)
}
```

现在，无论我们是在 TypeScript 还是 JavaScript 文件中编写代码，TypeScript 都可以让我们知道我们是否错误地调用了我们的函数。

```
// all allowed
printValue("hello!");
printValue(123.45);
printValue(123.45, 2);

printValue("hello!", 123); // error!
```

Tomasz Lenarcik 实现了这个 [功能](https://github.com/microsoft/TypeScript/pull/51234)。

## —build 标签支持传递发射文件相关的 flag

TypeScript 现在允许在 `--build` 模式下传递以下标志：

- `-declaration`
- `-emitDeclarationOnly`
- `-declarationMap`
- `-sourceMap`
- `-inlineSourceMap`

这使得在构建的某些部分中定制某些内容变得更加容易，因为你可能有不同的开发和生产构建。

例如，一个库的开发构建可能不需要生成声明文件，但生产构建需要。一个项目可以将声明发射默认关闭，并只需使用以下命令进行构建：

```
tsc --build -p ./my-project-dir
```

一旦你在内部循环中完成迭代，" 生产 " 构建就可以只传递 `--declaration` 标志。

```
tsc --build -p ./my-project-dir --declaration
```

[阅读更多信息](https://github.com/microsoft/TypeScript/pull/51241)

## 编辑器中的不区分大小写的导入排序

在 Visual Studio 和 VS Code 等编辑器中，TypeScript 提供了组织和排序导入和导出的体验。然而，有时可能会对列表何时“排序”有不同的解释。

例如，以下导入列表是否已排序？

```ts
import { Toggle, freeze, toBoolean } from './utils'
```

令人惊讶的是，答案可能是“取决于情况”。如果我们不在乎大小写，那么这个列表显然没有排序。字母 `f` 在 `t` 和 `T` 之前。

但在大多数编程语言中，排序默认比较字符串的字节值。JavaScript 比较字符串的方式意味着 `"Toggle"` 总是在 `"freeze"` 之前，因为根据 [ASCII 字符编码](https://en.wikipedia.org/wiki/ASCII)，大写字母在小写字母之前。因此，从这个角度来看，导入列表是排序的。

以前，TypeScript 认为导入列表已排序，因为它进行了基本的区分大小写排序。这可能会让喜欢不区分大小写排序的开发人员感到沮丧，或者使用像 ESLint 这样的工具，它们默认要求不区分大小写排序。

TypeScript 现在默认检测大小写敏感性。这意味着 TypeScript 和像 ESLint 这样的工具通常不会因为如何最好地排序导入而“互相对抗”。

我们的团队还在尝试进一步的排序策略，你可以在 [这里阅读](https://github.com/microsoft/TypeScript/pull/52115) 有关它们的更多信息。这些选项可能最终可以由编辑器进行配置。目前，它们仍然不稳定和实验性的，你可以在 VS Code 中使用 JSON 选项中的 `typescript.unstable` 条目来启用它们。下面是你可以尝试的所有选项（设置为它们的默认值）：

```json
{
  "typescript.unstable": {
    // 排序是否区分大小写？可以是：
    // - true
    // - false
    // - "auto"（自动检测）
    "organizeImportsIgnoreCase": "auto",

    // 排序是否“序数”并使用码点或考虑 Unicode 规则？可以是：
    // - "ordinal"
    // - "unicode"
    "organizeImportsCollation": "ordinal",

    // 在 `"organizeImportsCollation": "unicode"` 下，
    // 当前的语言环境是什么？可以是：
    // - [任何其他语言环境代码]
    // - "auto"（使用编辑器的语言环境）
    "organizeImportsLocale": "en",

    // 在 `"organizeImportsCollation": "unicode"` 下，
    // 大写字母或小写字母应该优先出现？可以是：
    // - false（与语言环境有关）
    // - "upper"
    // - "lower"
    "organizeImportsCaseFirst": false,

    // 在 `"organizeImportsCollation": "unicode"` 下，
    // 数字串是否以数字方式比较（例如 "a1" < "a2" < "a100"）？可以是：
    // - true
    // - false
    "organizeImportsNumericCollation": true,

    // 在 `"organizeImportsCollation": "unicode"` 下，
    // 带有重音符号或变音符号的字母是否与其“基本”字母明显不同（即é 是否不同于 e）？可以是：
    // - true
    // - false
    "organizeImportsAccentCollation": true
  },
  "javascript.unstable": {
    // 在此处也可以使用相同的选项...
  }
}
```

你可以阅读更多有关 [自动检测和指定不区分大小写性的原始工作的详细信息](https://github.com/microsoft/TypeScript/pull/51733)，以及更 [广泛的选项集](https://github.com/microsoft/TypeScript/pull/52115)。

## 穷尽 switch/case 的可能性

在编写 `switch` 语句时，TypeScript 现在会检测被检查的值是否具有字面类型。如果是，它将提供一个完成列表，以构建每个未覆盖的 `case` 分支。

![](_attachment/img/b3124a83d20155a32d06e11996daa69b_MD5.gif)

## 速度、内存和包大小优化

TypeScript 5.0 包含了许多强大的更改，涉及我们的代码结构、数据结构和算法实现。这些都意味着你的整个体验应该会更快 - 不仅是运行 TypeScript，甚至包括安装它。

以下是我们相对于 TypeScript 4.9 能够捕获到的一些有趣的速度和大小优势。

| 场景                          | 相对于 TS 4.9 时间或者大小的比例 |
| ----------------------------- | -------------------------------- |
| material-ui 构建时间          | 90%                              |
| TypeScript 编译器启动时间     | 89%                              |
| Playwright 构建时间           | 88%                              |
| TypeScript 编译器自我构建时间 | 87%                              |
| Outlook Web 构建时间          | 82%                              |
| VS Code 构建时间              | 80%                              |
| typescript npm 包大小         | 59%                              |

![](_attachment/img/3d48662642a9357c8f1b30c16ace1f7a_MD5.png)

![](_attachment/img/ba690b933fae7cef8282d52d955971a9_MD5.png)

如何实现这些优化呢？以下是一些值得注意的改进，我们将在未来的博客文章中详细介绍。但我们不会让你等到那篇博客文章。

首先，我们最近将 TypeScript 从命名空间迁移到了模块，使我们能够利用现代构建工具，执行类似作用域提升的优化。使用这种工具，重新审视我们的打包策略，并删除一些已弃用的代码，将 TypeScript 4.9 的 63.8 MB 软件包大小减小了约 26.4 MB。它还通过直接函数调用带来了明显的加速。我们在这里撰写了一份有关我们迁移到模块的详细介绍。

TypeScript 还为编译器内部对象类型增加了更多的统一性，并在一些对象类型上缩小了存储的数据。这减少了多态操作，同时平衡了我们使对象形状更加统一所带来的内存使用增加。

我们还在将信息序列化为字符串时执行了一些缓存操作。类型显示可能作为错误报告、声明发射、代码完成等操作的一部分，这些操作可能会相当昂贵。TypeScript 现在缓存一些常用的机制以在这些操作之间重用。

我们进行了另一项值得注意的更改，即利用 `var` 来偶尔绕过在闭包中使用 `let` 和 `const` 的成本，从而提高了一些解析性能。

总体而言，我们预计大多数代码库应该会从 TypeScript 5.0 中看到速度的提升，并且已经能够稳定地复现 10% 到 20% 的优势。当然，这将取决于硬件和代码库的特征，但我们鼓励您今天就在您的代码库上尝试它！

更多信息，请参见我们的一些值得注意的优化：

- [Migrate to Modules](https://github.com/microsoft/TypeScript/pull/51387)
- [`Node` Monomorphization](https://github.com/microsoft/TypeScript/pull/51682)
- [`Symbol` Monomorphization](https://github.com/microsoft/TypeScript/pull/51880)
- [`Identifier` Size Reduction](https://github.com/microsoft/TypeScript/pull/52170)
- [`Printer` Caching](https://github.com/microsoft/TypeScript/pull/52382)
- [Limited Usage of var](https://%3Ccode%3Egit%3C/code%3Ehub.com/microsoft/TypeScript/issues/52924)

## 破坏性更新和弃用

### 运行时需求

TypeScript 现在的目标是 ECMAScript 2018。TypeScript 包还设置了一个最低预期引擎版本为 12.20。对于 Node 用户来说，这意味着 TypeScript 5.0 至少需要 Node.js 12.20 版本及更高版本。

### **`lib.d.ts` 改变**

类型生成方式对现有代码可能会产生影响。特别是，某些属性已从 number 类型转换为数字字面量类型，而剪切、复制和粘贴事件处理的属性和方法已移动到接口中。

### API 破坏性改变

在 TypeScript 5.0 中，我们 [迁移到模块](https://devblogs.microsoft.com/typescript/typescripts-migration-to-modules/)，删除了一些不必要的接口，并进行了一些正确性改进。有关更改的详细信息，请参见我们的 [API Breaking Changes](https://github.com/microsoft/TypeScript/wiki/API-Breaking-Changes) 页面。

### 关系运算符中的禁止隐式类型转换

在 TypeScript 中，某些操作将在您编写可能导致隐式字符串转数字的代码时发出警告：

```ts
function func(ns: number | string) {
  return ns * 4 // 错误，可能隐式转换
}
```

在 TypeScript 5.0 中，这种警告机制也将应用于关系运算符 `>`、`<`、`<=` 和 `>=`：

```ts
function func(ns: number | string) {
  return ns > 4 // 现在也会报错
}
```

如果需要的话，您可以使用 `+` 运算符显式地将操作数强制转换为数字，以允许这种隐式类型转换：

```ts
function func(ns: number | string) {
  return +ns > 4 // OK
}
```

[Mateusz Burzyński](https://github.com/Andarist) 贡献了这个 [正确性改进](https://github.com/microsoft/TypeScript/pull/52048)。

### Enum 全面改造

自 TypeScript 第一个版本以来，枚举一直存在一些长期存在的奇怪问题。在 TypeScript 5.0 中，我们正在清理这些问题，并减少理解各种枚举类型所需的概念数量。

这个更新可能会引入两个主要的新错误。第一个错误是，将一个超出枚举类型范围的字面量赋值给枚举类型将会引发错误，这符合预期：

```ts
enum SomeEvenDigit {
  Zero = 0,
  Two = 2,
  Four = 4,
}

// 现在会正确报错
let m: SomeEvenDigit = 1
```

另一个问题是，如果枚举类型中的成员值同时包含数字和间接字符串枚举引用，那么将会错误地创建一个全数字枚举类型：

```ts
enum Letters {
  A = 'a',
}
enum Numbers {
  one = 1,
  two = Letters.A,
}

// Now correctly an error
const t: number = Numbers.two
```

详细内容请看 [文章](https://github.com/microsoft/TypeScript/pull/50528)。

### 在 --experimentalDecorators 模式下对构造函数参数装饰器进行更精确的类型检查

在 TypeScript 5.0 中，我们进一步改进了 TypeScript 对装饰器的类型检查。其中一处改进是，当在构造函数参数上使用装饰器时，TypeScript 能够更准确地检查装饰器对参数类型的影响。

```ts
export declare const inject: (
  entity: any
) => (target: object, key: string | symbol, index?: number) => void

export class Foo {}

export class C {
  constructor(@inject(Foo) private x: any) {}
}
```

这个调用会失败，因为 `key` 期望一个字符串或符号，但构造函数参数接收到一个未定义的 `key` 。正确的修复方法是在 `inject` 函数内更改 `key` 的类型。如果你正在使用无法升级的库，则一个合理的解决方案是在更加类型安全的装饰器函数中包装 `inject`，并在 `key` 上使用类型断言。

### 弃用和默认改变

在 TypeScript 5.0 中，我们已弃用了以下设置和设置值：

- `-target: ES3`
- `-out`
- `-noImplicitUseStrict`
- `-keyofStringsOnly`
- `-suppressExcessPropertyErrors`
- `-suppressImplicitAnyIndexErrors`
- `-noStrictGenericChecks`
- `-charset`
- `-importsNotUsedAsValues`
- `-preserveValueImports`
- `prepend` in project references

在 TypeScript 5.5 之前，这些配置将继续被允许，届时它们将被完全删除，但是，如果您正在使用这些设置，您将收到警告。在 TypeScript 5.0 以及未来版本 5.1、5.2、5.3 和 5.4 中，您可以指定 `"ignoreDeprecations": "5.0"` 屏蔽这些警告提示。我们还将很快发布一个 4.9 补丁，以允许指定 `ignoreDeprecations` 以允许更平滑的升级。除了弃用之外，我们还更改了一些设置以更好地改进 TypeScript 中的跨平台行为。

`--newLine`，它控制 JavaScript 文件中发出的行尾，如果未指定，过去常常根据当前操作系统进行推断。我们认为构建应该尽可能具有确定性，并且 Windows 记事本现在支持换行符行结尾，因此新的默认设置是 `LF`。 旧的特定于操作系统的推理行为不再可用。

`--forceConsistentCasingInFileNames`, 这确保了项目中对同一文件名的所有引用都在大小写中达成一致，现在默认为 `true`。 这有助于捕获在不区分大小写的文件系统上编写的代码的差异问题。

您可以留下反馈并查看 [有关 5.0 弃用跟踪问题的更多信息](https://juejin.cn/post/7219908995339173943)

## 下一步

TypeScript 5.1 已经在开发中了，而且我们的所有计划都已经在 GitHub 上了。如果你很渴望尝试，我们鼓励你尝试使用 TypeScript 的夜间构建版本或 VS Code 的 JavaScript 和 TypeScript 夜间扩展！

当然，如果你选择只享受新的稳定版本的 TypeScript，也是很好的。我们希望 TypeScript 5.0 能够让每个人的编码变得更快乐和更高效。
