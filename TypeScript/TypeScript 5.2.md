---
aliases: []
tags: ['TypeScript', 'date/2023-12', 'year/2023', 'month/12']
date: 2023-12-04-星期一 16:43:04
update: 2023-12-04-星期一 17:11:34
---

今天，我们“普大喜奔” —— TS 5.2 正式发布！

以下是 TS 5.2 新特性速览：

- JS（JavaScript）新特性

  - **数组的拷贝方法**
  - **`WeakMap/WeakSet` 支持 `Symbol`（类型）的键**
  - **`using` 声明和显式资源管理**
  - **Decorator Metadata（装饰器元数据）**

- TS 新特性

  - **命名和匿名元组元素**
  - **更愉快地使用联合数组的方法**
  - **TS 实现的文件扩展名支持 `import type`（仅类型导入）路径**
  - **对象成员的逗号补全**
  - **内联变量重构**
  - **可点击的内嵌参数提示**
  - **针对持续类型兼容性的优化检查**
  - **破坏性更新和正确性修复**

## `using` 声明和显式资源管理

TS 5.2 全新支持 JS 中即将推出的显式资源管理特性。让我们一起探索新特性的若干设计动机，并了解该特性有什么超能力。

一个常见的场景是，创建对象后需要执行某种“清理（clean-up）”。

举个栗子，你可能需要关闭网络链接、删除临时文件或者只是释放内存。

假设我们有一个函数，它创建一个临时文件，读取和写入该文件以进行各种操作，然后关闭并删除文件。

```ts
import * as fs from 'fs'

export function doSomeWork() {
  const path = '.some_temp_file'
  const file = fs.openSync(path, 'w+')

  // use file...

  // Close the file and delete it.
  fs.closeSync(file)
  fs.unlinkSync(path)
}
```

这很 nice，虽然但是，如果我们需要提前退出，那会有什么问题？

```ts
export function doSomeWork() {
  const path = '.some_temp_file'
  const file = fs.openSync(path, 'w+')

  // use file...
  if (someCondition()) {
    // do some more work...

    // Close the file and delete it.
    fs.closeSync(file)
    fs.unlinkSync(path)
    return
  }

  // Close the file and delete it.
  fs.closeSync(file)
  fs.unlinkSync(path)
}
```

我们初见端倪，容易忘记一些重复的清理工作。如果出现错误，我们也不能保证能关闭并删除该文件。这个问题可以通过将所有逻辑都封装在一个 `try/finally` 区块中来解决。

```ts
export function doSomeWork() {
  const path = '.some_temp_file'
  const file = fs.openSync(path, 'w+')

  try {
    // use file...

    if (someCondition()) {
      // do some more work...
      return
    }
  } finally {
    // Close the file and delete it.
    fs.closeSync(file)
    fs.unlinkSync(path)
  }
}
```

这样更鲁棒，虽然但是，我们的代码因此增加了不少“噪音（noisy）”。如果我们开始向 `finally` 区块添加更多的清理逻辑，我们还会继续节外生枝。

举个栗子，异常会阻止处理其他资源。

这正是“显式资源管理”提案旨在解决的问题。该提案的核心思想是支持资源处理 —— 即我们正在尝试处理的清理工作，使其作为 JS 的一流思想。

首先，我们需要新增一个名为 `Symbol.dispose` 的内置 `Symbol`，然后我们可以创建拥有 `Symbol.dispose()` 方法的对象。为了方便起见，TS 定义了一个全新的 `Disposable` 全局类型来描述这些行为。

```ts
class TempFile implements Disposable {
  #path: string
  #handle: number

  constructor(path: string) {
    this.#path = path
    this.#handle = fs.openSync(path, 'w+')
  }

  // other methods

  [Symbol.dispose]() {
    // Close the file and delete it.
    fs.closeSync(this.#handle)
    fs.unlinkSync(this.#path)
  }
}
```

稍后我们可以调用这些方法。

```ts
export function doSomeWork() {
  const file = new TempFile('.some_temp_file')

  try {
    // ...
  } finally {
    file[Symbol.dispose]()
  }
}
```

将清理逻辑转移到 `TempFile` 自身并不能为我们带来质变；我们基本上只是将所有清理工作从 `finally` 区块照搬到一个方法中，这种情况以前也可以做到。

虽然但是，为该方法赋予一个内置 `Symbol`（well-known symbol）名字，意味着 JS 可以在它之上构建其他功能。

至此我们迎来了该特性的第一个主角：`using` 声明！全新关键字 `using` 和 `const` 大抵相同，它允许我们声明新的不可变绑定（fixed bindings）。关键区别在于，`using` 声明的变量会在作用域结束时调用它们的 `Symbol.dispose()` 方法。

所以我们可以像这样简写代码：

```ts
export function doSomeWork() {
    using file = new TempFile(".some_temp_file");

    // use file...

    if (someCondition()) {
        // do some more work...
        return;
    }
}
```

现在就是见证奇迹的时刻 —— 完全没有 `try/finally` 区块了（起码我们没有看到）。就功能而言，这正是 `using` 声明的职责所在，虽然但是，我们可以偷懒了。

你也许似曾相识：

- C# 的 `using` 声明
- Python 的 `with` 语句
- Java 的 `try-with-resource` 语句

这些和 JS 全新的 `using` 关键字大抵相同，并提供了同款显式方式，赋能作用域结束时执行对象的“tear-down（卸载）”。

`using` 声明会在其包含的作用域的最后，或者可能在一个“early return”（比如 `return` 或者抛出错误）之前执行这种清理。它们还像堆栈一样按照后入先出的顺序处理。

```ts
function loggy(id: string): Disposable {
    console.log(`Creating ${id}`);

    return {
        [Symbol.dispose]() {
            console.log(`Disposing ${id}`);
        }
    }
}

function func() {
    using a = loggy("a");
    using b = loggy("b");
    {
        using c = loggy("c");
        using d = loggy("d");
    }
    using e = loggy("e");
    return;

    // Unreachable.
    // Never created, never disposed.
    using f = loggy("f");
}

func();
// Creating a
// Creating b
// Creating c
// Creating d
// Disposing d
// Disposing c
// Creating e
// Disposing e
// Disposing b
// Disposing a
```

`using` 声明应该弹性处理异常；如果抛出错误，则在处理后重新抛出。

另一方面，函数主体可能如期执行，但 `Symbol.dispose()` 可能会抛出（异常）。这种情况下，也会重新抛出该异常。

虽然但是，如果处理前和处理期间的逻辑都抛出错误，那会怎样呢？

针对这些情况，已经引入了一个 `Error` 的子类型 `SuppressedError`。它具有一个保存最后错误的 `suppressed` 属性，以及一个保存最近抛出错误的 `error` 属性。

```ts
class ErrorA extends Error {
    name = "ErrorA";
}
class ErrorB extends Error {
    name = "ErrorB";
}

function throwy(id: string) {
    return {
        [Symbol.dispose]() {
            throw new ErrorA(`Error from ${id}`);
        }
    };
}

function func() {
    using a = throwy("a");
    throw new ErrorB("oops!")
}

try {
    func();
}
catch (e: any) {
    console.log(e.name); // SuppressedError
    console.log(e.message); // An error was suppressed during disposal.

    console.log(e.error.name); // ErrorA
    console.log(e.error.message); // Error from a

    console.log(e.suppressed.name); // ErrorB
    console.log(e.suppressed.message); // oops!
}
```

您可能已经注意到，我们在这些示例中使用了同步方法。

虽然但是，许多资源处理涉及异步操作，我们需要等待这些操作完成，然后再继续运行其他代码。

这就是还有一个全新的 `Symbol.asyncDispose()` 方法的原因，至此我们迎来了下一位主角——`await using` 声明。它们和 `using` 声明大抵相同，但关键是它们会匹配需要等待处理的资源。它们使用一个名为 `Symbol.asyncDispose()` 的不同方法，尽管它们也可以操作任何带有 `Symbol.dispose()` 的东西。为了方便起见，TS 还引入了一个名为 `AsyncDisposable` 的全局类型，该类型描述了任何拥有异步处理方法的对象。

```ts
async function doWork() {
    // Do fake work for half a second.
    await new Promise(resolve => setTimeout(resolve, 500));
}

function loggy(id: string): AsyncDisposable {
    console.log(`Constructing ${id}`);
    return {
        async [Symbol.asyncDispose]() {
            console.log(`Disposing (async) ${id}`);
            await doWork();
        },
    }
}

async function func() {
    await using a = loggy("a");
    await using b = loggy("b");
    {
        await using c = loggy("c");
        await using d = loggy("d");
    }
    await using e = loggy("e");
    return;

    // Unreachable.
    // Never created, never disposed.
    await using f = loggy("f");
}

func();
// Constructing a
// Constructing b
// Constructing c
// Constructing d
// Disposing (async) d
// Disposing (async) c
// Constructing e
// Disposing (async) e
// Disposing (async) b
// Disposing (async) a
```

如果你期望祂者一致地执行 "tear-down" 逻辑，那么根据 `Disposable` 和 `AsyncDisposable` 定义类型可以使你的代码更易用。

事实上，前端生态存在大量具有 `dispose()/close()` 方法的现有类型。

举个栗子，VSCode APIs 甚至定义了自己的 `Disposable` 接口。浏览器和运行时（比如 Node.js、Deno 和 Bun）中的 API 也可以选择对已经具有清理方法的对象（比如文件句柄、连接等）使用 `Symbol.dispose()/Symbol.asyncDispose()`。

目前，这一切对库来说也许美滋滋，虽然但是，对你的场景而言稍微有点矫枉过正。如果你正在执行大量的临时清理，那么创建新类型可能会引入大量过度抽象和关于最佳实践的问题。

举个栗子，再次以我们 `TempFile` 为例。

```ts
class TempFile implements Disposable {
    #path: string;
    #handle: number;

    constructor(path: string) {
        this.#path = path;
        this.#handle = fs.openSync(path, "w+");
    }

    // other methods

    [Symbol.dispose]() {
        // Close the file and delete it.
        fs.closeSync(this.#handle);
        fs.unlinkSync(this.#path);
    }
}

export function doSomeWork() {
    using file = new TempFile(".some_temp_file");

    // use file...

    if (someCondition()) {
        // do some more work...
        return;
    }
}
```

我们只是不想忘记调用两个函数 —— 但这是最佳实践吗？我们应该在构造函数中调用 `openSync()`，创建 `open ()` 方法，还是自己传递句柄？我们应该为每个可能需要执行的操作暴露一个方法，还是应该只公开属性？

至此我们迎来了此特性的最后一位主角：`DisposableStack` 和 `AsyncDisposableStack`。不管是针对一次性清理还是任意数量清理，这 2 个对象都美滋滋。`DisposableStack` 对象拥有若干可以跟踪 `Disposable` 对象的方法，并且可以设置函数来执行任意数量的清理工作。我们还可以把它们分配给 `using` 变量 —— 请记住 —— 它们也是 `Disposable`！所以接下来瞄一眼我们的初始示例该怎么写。

```ts
function doSomeWork() {
    const path = ".some_temp_file";
    const file = fs.openSync(path, "w+");

    using cleanup = new DisposableStack();
    cleanup.defer(() => {
        fs.closeSync(file);
        fs.unlinkSync(path);
    });

    // use file...

    if (someCondition()) {
        // do some more work...
        return;
    }

    // ...
}
```

如你所见，`defer()` 方法只接受一个回调（函数），一旦清理完成，该回调就会运行。

通常，`defer()`（以及 `use()/adopt()` 等其他 `DisposableStack` 方法）应该在创建资源后立即调用。顾名思义，`DisposableStack` 像处理堆栈一样，按照后入先出的顺序处理它跟踪的所有内容，所以在创建值之后立即延迟可以避免神头鬼脸的依赖性问题。`AsyncDisposableStack` 同理可得，但它本身是一个 `AsyncDisposable`，并且可以跟踪 `async` 函数和 `AsyncDisposables`（对象）。

`defer()` 方法在许多方面与 Go、Swift、Zig、Odin 等等（语言）中 `defer` 关键字大抵相同，其中的约定也大抵相同。

因为这个特性是最新的，所以大多运行时原生暂不支持。如果想试看看，你将需要下列的运行时补丁（runtime polyfill）：

- `Symbol.dispose`
- `Symbol.asyncDispose`
- `DisposableStack`
- `AsyncDisposableStack`
- `SuppressedError`

虽然但是，如果你只对 `using` 和 `await using` 感兴趣，你可以只给内置 `Symbol` 打补丁。大多数情况下，下列这种简单方法也能行之有效：

```ts
Symbol.dispose ??= Symbol('Symbol.dispose')
Symbol.asyncDispose ??= Symbol('Symbol.asyncDispose')
```

你还需要将编译目标设置为 `"target": "es2022"`（或者低于 `"es2022"`），并且配置你的 `lib`，设置为 `"lib": "esnext"` 或者 `"lib": "esnext.disposable"`。

```json
{
  "compilerOptions": {
    "target": "es2022",
    "lib": ["es2022", "esnext.disposable", "dom"]
  }
}
```

更多细节请临幸 [**GitHub 相关工作**](https://github.com/microsoft/TypeScript/pull/54505)。

## Decorator Metadata（装饰器元数据）

TS 5.2 实现了即将推出的 JS 特性 —— [Decorator Metadata（装饰器元数据）](https://github.com/tc39/proposal-decorator-metadata)。

此特性的关键思想是使装饰器可以愉快地在它们使用的任何类上创建和使用元数据。

每当使用装饰器函数时，它们现在可以读写其上下文对象上的 `metadata` 新属性。该 `metadata` 属性仅持有一个简单的对象。由于 JS 允许我们任意添加属性，因此它可以作为一个字典结构，被每个装饰器更新。

另一个选择是，由于每个 `metadata` 对象对于类的每个装饰部分都是相同的，因此可以将其作为 `Map` 的键。在类上或类中的所有装饰器运行之后，可以通过类的 `Symbol.metadata`（属性）读写该对象。

```ts
interface Context {
  name: string
  metadata: Record
}

function setMetadata(_target: any, context: Context) {
  context.metadata[context.name] = true
}

class SomeClass {
  @setMetadata
  foo = 123

  @setMetadata
  accessor bar = 'hello!'

  @setMetadata
  baz() {}
}

const ourMetadata = SomeClass[Symbol.metadata]

console.log(JSON.stringify(ourMetadata))
// { "bar": true, "baz": true, "foo": true }
```

这在许多不同的场景中使用都美滋滋。元数据可能有许多用途，比如调试、序列化或使用装饰器执行依赖项注入。由于元数据对象是按修饰类创建的，因此框架可以私下将它们用作 `Map/WeakMap` 中的键，或者按需增量更新属性。

举个栗子，假设我们想使用装饰器来跟踪那些使用 `JSON.stringify()` 时可序列化的属性和存取器，如下所示：

```ts
import { serialize, jsonify } from './serializer'

class Person {
  firstName: string
  lastName: string

  @serialize
  age: number

  @serialize
  get fullName() {
    return `${this.firstName} ${this.lastName}`
  }

  toJSON() {
    return jsonify(this)
  }

  constructor(firstName: string, lastName: string, age: number) {
    // ...
  }
}
```

如你所见，这里的编程意图是能且仅能对 `age` 和 `fullName` 进行序列化，因为它们被 `@serialize` 装饰器 mark 了。我们为此定义了一个 `toJSON()` 方法，但它有且仅有调用 `jsonify()` 方法，该方法使用了 `@serialize` 创建的元数据。

举个栗子，`./serialize.ts` 模块的定义方式：

```ts
const serializables = Symbol()

type Context =
  | ClassAccessorDecoratorContext
  | ClassGetterDecoratorContext
  | ClassFieldDecoratorContext

export function serialize(_target: any, context: Context): void {
  if (context.static || context.private) {
    throw new Error('Can only serialize public instance members.')
  }
  if (typeof context.name === 'symbol') {
    throw new Error('Cannot serialize symbol-named properties.')
  }

  const propNames = ((context.metadata[serializables] as string[] | undefined) ??= [])
  propNames.push(context.name)
}

export function jsonify(instance: object): string {
  const metadata = instance.constructor[Symbol.metadata]
  const propNames = metadata?.[serializables] as string[] | undefined
  if (!propNames) {
    throw new Error('No members marked with @serialize.')
  }

  const pairStrings = propNames.map(key => {
    const strKey = JSON.stringify(key)
    const strValue = JSON.stringify((instance as any)[key])
    return `${strKey}: ${strValue}`
  })

  return `{ ${pairStrings.join(', ')} }`
}
```

这个模块有一个名为 `serializables` 的局部 `Symbol`，用于存储和检索标记为 `@serializable` 的属性名。每次调用 `@serializable` 时，它会在元数据上存储一份关于这些属性名的列表。当调用 `jsonify()` 时，会从元数据中提取属性列表，用来在实例中检索对应值，最终序列化那些（属性）名和值。

就技术而言，使用 `Symbol` 可以让其他人访问这些数据。

另一种选择是，使用 `WeakMap` 将元数据对象作为键。这保持了数据的私有性，并且在这种情况下恰好减少了类型断言，但是在其他方面大抵相同。

```ts
const serializables = new WeakMap()

type Context =
  | ClassAccessorDecoratorContext
  | ClassGetterDecoratorContext
  | ClassFieldDecoratorContext

export function serialize(_target: any, context: Context): void {
  if (context.static || context.private) {
    throw new Error('Can only serialize public instance members.')
  }
  if (typeof context.name !== 'string') {
    throw new Error('Can only serialize string properties.')
  }

  let propNames = serializables.get(context.metadata)
  if (propNames === undefined) {
    serializables.set(context.metadata, (propNames = []))
  }
  propNames.push(context.name)
}

export function jsonify(instance: object): string {
  const metadata = instance.constructor[Symbol.metadata]
  const propNames = metadata && serializables.get(metadata)
  if (!propNames) {
    throw new Error('No members marked with @serialize.')
  }
  const pairStrings = propNames.map(key => {
    const strKey = JSON.stringify(key)
    const strValue = JSON.stringify((instance as any)[key])
    return `${strKey}: ${strValue}`
  })

  return `{ ${pairStrings.join(', ')} }`
}
```

注意，这些实现没有处理子类化和继承。这将是你的课后作业（你可能会发现，在这个文件的一个版本中，比在另一个版本中要更简单。）

因为这个特性仍然是最新的，大多数运行时原生尚不支持。如果想试看看，你需要一个 `Symbol.metadata` 的补丁（polyfill）。大多数情况下，下列这种简单方法也能行之有效：

```ts
Symbol.metadata ??= Symbol('Symbol.metadata')
```

你还需要将编译目标设置为 `"target": "es2022"`（或者低于 `"es2022"`），并且配置你的 `lib`，设置为 `"lib": "esnext"` 或者 `"lib": "esnext.decorators"`。

```json
{
  "compilerOptions": {
    "target": "es2022",
    "lib": ["es2022", "esnext.decorators", "dom"]
  }
}
```

我们要给 Oleksandr Tarasiuk 大佬点赞，它为 TS 5.2 贡献了装饰器元数据的实现！

## 命名和匿名元组元素

元组类型支持任一元素的可选标签或名称。

```ts
type Pair = [first: T, second: T]
```

这些标签不会改变你对它们的操作 —— 它们能且仅能提高可读性和工具性。

虽然但是，TS 之前有一条规则 —— 元组禁止混用和匹配标记元素和未标记元素。换而言之，元组中的所有元素要么都没标签，要么都有一个标签。

```ts
//  fine - no labels
type Pair1 = [T, T]

//  fine - all fully labeled
type Pair2 = [first: T, second: T]

//  previously an error
type Pair3 = [first: T, T]
//                         ~
// Tuple members must all have names
// or all not have names.
```

对于剩余元素而言，这可能让人抓狂，因为我们能且仅能添加一个标签，比如 `rest/tail`。

```ts
//  previously an error
type TwoOrMore_A = [first: T, second: T, ...T[]]
//                                          ~~~~~~
// Tuple members must all have names
// or all not have names.

//
type TwoOrMore_B = [first: T, second: T, rest: ...T[]]
```

这也意味着，类型系统内部不得不强制执行此限制，而这又意味着 TS 将丢失标签。

```ts
type HasLabels = [a: string, b: string]
type HasNoLabels = [number, number]
type Merged = [...HasNoLabels, ...HasLabels]
//   ^ [number, number, string, string]
//
//     'a' and 'b' were lost in 'Merged'
```

在 TS 5.2 中，已经取消了元组标签的“全有或全无”（all-or-nothing）限制。TS 现在还可以在未标记元组中展开（元素）时保留标签。

我们要给 Josh Goldberg 和 Mateusz Burzyński 大佬点赞，它们合作取消了这一限制。

## 更愉快地使用联合数组的方法

在 TS 的早期版本中，联合数组调用方法可能会十分折磨。

```ts
declare let array: string[] | number[]

array.filter(x => !!x)
//    ~~~~~~ error!
// This expression is not callable.
//   Each member of the union type '...' has signatures,
//   but none of those signatures are compatible
//   with each other.
```

如你所见，TS 会试看看 `filter` 的每个版本是否兼容 `string[]` 和 `number[]`。如果没有兼容性策略（coherent strategy），TS 能且仅能摊开双手道，“臣妾做不到……”。

在 TS 5.2 中，在放弃这些情况之前，联合数组被视为特例。TS 会根据每个成员的元素类型构造一个新的数组类型，然后通过该类型来调用方法。

示例如上，`string [] | number []` 会被转换为 `(string | number)[]/Array< string | number >`，并通过该类型执行 `filter`。

注意，`filter` 将生成 `Array< string | number >` 而不是 `string [] | number []`；但是对于新生成的值（a freshly produced value）而言，“出错”的风险较小。

这意味着，许多方法以前通过联合数组不可调用，比如 `filter/find/some/every/reduce` 等，应该都能通过联合数组调用了。

更多细节请临幸 [**PR 实现**](https://github.com/microsoft/TypeScript/pull/53489)。

## 数组的拷贝方法

TS 5.2 新增了（若干）方法的定义，是关于要增量更新到 JS 中的 [“通过拷贝变更数组”提案](https://github.com/tc39/proposal-change-array-by-copy)。

虽然 JS 的 `Array` 已经有若干美滋滋的方法，比如 `sort ()/splice()/return()` 等 ，但是这些方法会就地更新当前的数组。通常，我们期望在不影响原数组的情况下创建一个完全独立的数组。

为此，可以使用 `slice()` 或数组展开语法（比如 `[…myArray]`），首先获取一个副本，然后再执行操作。

举个栗子，你可以通过 `myArray.slice().reverse()` 来获取一个逆序副本（reversed copy）。

还有另一种常见的情况 —— 创建一个副本，但有且仅有一个元素变更。有很多方法可以做到这一点，但最明显的方法要么使用一坨语句……

```ts
const copy = myArray.slice()
copy[someIndex] = updatedValue
doSomething(copy)
```

要么编程意图不明显……

```ts
doSomething(myArray.map((value, index) => (index === someIndex ? updatedValue : value)))
```

所有这些（方案）对于如此常见的操作而言都很猪头。这就是 JS 现在有 4 个新方法执行同款操作，但不影响原数据的原因：`toSorted()/toSpliced()/toReversed()/with()`。前 3 个方法和它们对应的变异方法执行相同的操作，但返回一个新数组。`with` 也返回一个新数组，但有且仅有一个元素更新（如上所述）。

| Mutating                                    | Copying                                         |
| ------------------------------------------- | ----------------------------------------------- |
| `myArray.reverse()`                         | `myArray.toReversed()`                          |
| `myArray.sort((a, b) => …)`                 | `myArray.toSorted((a, b) => …)`                 |
| `myArray.splice(start, deleteCount,…items)` | `myArray.toSpliced(start, deleteCount, …items)` |
| `myArray[index] = updatedValue`             | `myArray.with(index, updatedValue)`             |

注意，复制方法总是创建一个新数组，而变异操作是不一致的。

这些方法不仅可以在普通数组上使用 —— 它们也可以在 `TypedArray`（比如 `Int32Array/Uint8Array` 等）上使用。

我们要给 Carter Snook 大佬点赞，它为这些声明提供了更新。

## `WeakMap/WeakSet` 支持 `Symbol`（类型）的键

`Symbol` 现在可以作为 `WeakMap/WeakSet` 的键，JS 本身增量更新了 [此特性](https://github.com/tc39/proposal-symbols-as-weakmap-keys)。

```ts
const myWeakMap = new WeakMap()

const key = Symbol()
const someObject = {
  /*...*/
}

// Works!
myWeakMap.set(key, someObject)
myWeakMap.has(key)
```

我们要给 Leo Elmecker-Plakolm 大佬及其代表的 Bloomberg 点赞，它们提供了这个更新。

## TS 实现的文件扩展名支持仅类型导入路径

不管是否开启了 `allowImportingTsExtensions`，TS 现在允许声明和实现文件扩展名都包含在仅类型导入的路径中。

这意味着，你现在可以在使用了 `.ts/.mts/.cts/.tsx` 文件扩展的文件中编写 `import type` 语句。

```ts
import type { JustAType } from './justTypes.ts'

export function f(param: JustAType) {
  // ...
}
```

这也意味着，`import()` 类型可以使用这些文件扩展名，这些类型可以在 TS 和集成了 JSDoc 的 JS 中一起使用。

```ts
/**
 * @param {import("./justTypes.ts").JustAType} param
 */
export function f(param) {
  // ...
}
```

更多细节请临幸 [**相关改动**](https://github.com/microsoft/TypeScript/pull/54746)。

## 对象成员的逗号补全

在给对象新增属性时，很容易忘记添加逗号。以前，如果忘记使用逗号并请求自动补全，TS 会给出不相关的糟糕结果。

TS 5.2 现在可以在你忘记逗号时优雅地提供对象成员补全。但为了跳过语法错误，它也会自动插入缺失的逗号。

![Properties in an object literal are completed despite missing a comma after a prior property. When the property name is completed, the missing comma is automatically inserted.](_attachment/img/7e9ab5faf40bb633ae04ad43a86b550d_MD5.gif)

更多细节请临幸 [**具体实现**](https://github.com/microsoft/TypeScript/pull/52899)。

## 内联变量重构

TS 5.2 现在有一个重构 —— 可以将变量的内容内联到所有的使用站点。

![A variable called 'path' initialized to a string, having both of its usages replaced](_attachment/img/e2c4514e036cebf40fc02b90734da807_MD5.gif)

使用“内联变量”重构将消除该变量，并用其初始器替换该变量的所有用法。

注意，这可能会导致初始器的副作用在不同的时间运行，而且和使用变量的次数一样多。

更多细节请临幸 [**具体实现**](https://github.com/microsoft/TypeScript/pull/54281)。

## 可点击的内嵌参数提示

内嵌提示可以为我们提供一目了然的信息，即使它不存在于我们的代码中 —— 考虑参数名称、推断类型等等。在 TS 5.2 中，我们已经开始使得与内嵌提示进行交互成为可能。

举个栗子，VSCode 爱好者们，你们现在可以点击内嵌提示传送到参数的定义。

![Ctrl-clickable or Cmd-clickable parameter inlay hints which will jump you to their definition](_attachment/img/02d0f28267101a39091ef3066c8e0c5a_MD5.gif)

更多细节请临幸 [**功能实现**](https://github.com/microsoft/TypeScript/pull/54734)。

## 针对持续类型兼容性的优化检查

由于 TS 是一个结构化类型系统，偶尔需要以成员方式（member-wise fashion）比较类型。

虽然但是，递归类型这里存在若干问题。举个栗子：

```ts
interface A {
  value: A
  other: string
}

interface B {
  value: B
  other: number
}
```

当检查类型 `A` 是否与类型 `B` 兼容时，TS 最终会检查 `A` 和 `B` 中 `value` 的类型是否分别兼容。此时，类型系统需要停止进一步检查并继续检查其他成员。为此，类型系统必须跟踪任何两个类型何时已经相关。

以前，TS 已经保留了一个类型对的栈，并通过迭代它来确定这些类型是否相关。如果这个栈很浅，那问题不大; 但是如果这个栈不是很浅，emm…那 [问题很大](https://accidentallyquadratic.tumblr.com/)。

在 TS 5.2 中，使用一个简单的 `Set` 帮助跟踪此信息。这将使用 [drizzle](https://github.com/drizzle-team/drizzle-orm) 库的报告测试用例所花费的时间减少 33% 以上！

```text
Benchmark 1: old
  Time (mean ± σ):      3.115 s ±  0.067 s    [User: 4.403 s, System: 0.124 s]
  Range (min … max):    3.018 s …  3.196 s    10 runs

Benchmark 2: new
  Time (mean ± σ):      2.072 s ±  0.050 s    [User: 3.355 s, System: 0.135 s]
  Range (min … max):    1.985 s …  2.150 s    10 runs

Summary
  'new' ran
    1.50 ± 0.05 times faster than 'old'
```

更多细节请临幸 [**相关改动**](https://github.com/microsoft/TypeScript/pull/55224)。

## 破坏性更新和正确性修复

TS 尽量不引入不必要的破坏性更新；虽然但是，有时我们必须进行更正和改进，以便更好地分析代码。

### `lib.d.ts` 更新

为 DOM 生成的类型可能会对代码库产生影响。更多细节请临幸 [**TS 5.2 DOM 更新**](https://github.com/microsoft/TypeScript/pull/54725)。

### `labeledElementDeclarations` 支持 `undefined` 元素

为了支持标记元素和未标记元素的混合，TS 的 API 略有变化。`TupleType` 的 `labeledElementDeclarations` 属性可能在元素未标记的每个位置都支持 `undefined`。

```diff
  interface TupleType {
-     labeledElementDeclarations?: readonly (NamedTupleMember | ParameterDeclaration)[];
+     labeledElementDeclarations?: readonly (NamedTupleMember | ParameterDeclaration | undefined)[];
  }
```

### `module/moduleResolution` 必须匹配最近的 Node.js 设置

`--module/--moduleResolution` 选项分别支持 `node16` 和 `nodenext` 设置。这些都是有效的“现代化 Node.js”设置，应该在任何最新的 Node.js 项目中使用。我们发现，当这两个选项在是否使用 Node.js 相关设置上不一致时，项目实际上配置错误。

在 TS 5.2 中，当使用 `node16/nodenext` 作为 `--module/--moduleResolution` 选项时，TS 现在要求另一个选项具有类似的 Node.js 相关设置。在设置发生分歧的情况下，你可能会得到一个错误消息，如下所示：

```text
Option 'moduleResolution' must be set to 'NodeNext' (or left unspecified) when option 'module' is set to 'NodeNext'.

当 'module' 选项被设置为 'NodeNext' 时 'moduleResolution' 选项必须设置为 'NodeNext' (或者不指定)
```

或者

```text
Option 'module' must be set to 'Node16' when option 'moduleResolution' is set to 'Node16'.
当 'moduleResolution' 选项被设置为 'Node16' 时 'module' 选项必须设置为 'Node16'
```

举个栗子，`--module esnext--moduleResolution node16` 将被拒绝，但你最好单独使用 `--module nodenext`，或者 `--module esnext--module Resolution bundler`。

更多细节请临幸 [**相关改动**](https://github.com/microsoft/TypeScript/pull/54567)。

### `Symbol` 合并的一致导出检查

当两个声明合并时，它们必须就是否都导出达成一致。由于一个 bug，TS 错过了外部上下文中的特定情况，比如声明文件或 `declare module` 区块。

举个栗子，它不会对以下情况发出错误，其中 `replaceInFile` 一次被声明为导出函数，一次被声明为未导出的命名空间。

```ts
declare module 'replace-in-file' {
  export function replaceInFile(config: unknown): Promise
  export {}

  namespace replaceInFile {
    export function sync(config: unknown): unknown[]
  }
}
```

在外部模块中，不管所有声明是否自动导出，添加 `export {…}` 或类似的结构（比如 `export default …`）将隐式更改。

```text
Individual declarations in merged declaration 'replaceInFile' must be all exported or all local.
合并声明 'replaceInFile' 中的各个声明必须全部导出或全部本地
```

更多细节请临幸 [**相关改动**](https://github.com/microsoft/TypeScript/pull/54659)。

### `module` 总是作为 `namespace` 发出

TS 的 `namespace` 实际上是使用 `module` 关键字开始的，因为 JS 最终可能会出于同样的目的使用它。最初，它们被称为“内部模块”，但是内部模块最终没有被集成到 JS。

多年来（始于 [**2015 年的 TS 1.5**](https://devblogs.microsoft.com/typescript/announcing-typescript-1-5)！），TS 一直支持 `namespace` 关键字以避免混淆。为了更进一步，TS 5.2 在生成声明文件时将始终发出 `namespace` 关键字。因此，如下所示的代码：

```ts
module foo {
  export function f() {}
}
```

将生成以下声明文件：

```ts
declare namespace foo {
  function f(): void
}
```

虽然这可能与旧版本的 TS 不兼容，但我们认为问题不大。

注意，如下所示的外部模块声明：

```ts
// UNAFFECTED
declare module 'some-module-path' {
  // ...
}
```

不受影响。

我们要给 Chi Leung 大佬及其代表的 Bloomberg 点赞，[**这项工作**](https://github.com/microsoft/TypeScript/pull/54134) 是它提供的。
