---
aliases: []
tags: ['TypeScript','date/2022-04','year/2022','month/04']
date: 2022-04-14-Thursday 10:12:49
update: 2022-04-14-Thursday 10:29:09
---

## 新增 Awaited 类型

Awaited 可以将 Promise 实际返回类型抽出来，按照名字可以理解为：等待 Promise resolve 了拿到的类型。下面是官方文档提供的 Demo：

```ts
// A = string
type A = Awaited<Promise<string>>;
// B = number
type B = Awaited<Promise<Promise<number>>>;
// C = boolean | number
type C = Awaited<boolean | Promise<number>>;
```

## 捆绑的 dom lib 类型可以被替换

TS 因开箱即用的特性，捆绑了所有 dom 内置类型，比如我们可以直接使用 Document 类型，而这个类型就是 TS 内置提供的。

也许有时不想随着 TS 版本升级而升级连带的 dom 内置类型，所以 TS 提供了一种指定 dom lib 类型的方案，在 `package.json` 申明 `@typescript/lib-dom` 即可：

```json
{
 "dependencies": {
    "@typescript/lib-dom": "npm:@types/web"
  }
}
```

这个特性提升了 TS 的环境兼容性，但一般情况还是建议开箱即用，省去繁琐的配置，项目更好维护。

## 模版字符串类型也支持类型收窄

```ts
export interface Success {
  type: `${string}Success`
  body: string
}

export interface Error {
  type: `${string}Error`
  message: string
}

export function handler (r: Success | Error) {
  if (r.type === "HttpSuccess") {
    // 'r' has type 'Success'
    let token = r.body
  }
}
```

模版字符串类型早就支持了，但现在才支持按照模版字符串在分支条件时，做类型收窄。

## 增加新的 --module es2022

虽然可以使用 --module esnext 保持最新特性，但如果你想使用稳定的版本号，又要支持顶级 await 特性的话，可以使用 es2022。

## 尾递归优化

TS 类型系统支持尾递归优化了，拿下面这个例子就好理解：

```ts
type TrimLeft<T extends string> =
  T extends ` ${infer Rest}` ? TrimLeft<Rest> : T

// error: Type instantiation is excessively deep and possibly infinite.
type Test = TrimLeft<"                                                oops">
```

在没有做尾递归优化前，TS 会因为堆栈过深而报错，但现在可以正确返回执行结果了，因为尾递归优化后，不会形成逐渐加深的调用，而是执行完后立即退出当前函数，堆栈数量始终保持不变。

JS 目前还没有做到自动尾递归优化，但可以通过自定义函数 TCO 模拟实现，下面放出这个函数的实现：

```js
function tco (f) {
  var value
  var active = false
  var accumulated = []
  return function accumulator (...rest) {
    accumulated.push(rest)
    if (!active) {
      active = true
      while (accumulated.length) {
        value = f.apply(this, accumulated.shift())
      }
      active = false
      return value
    }
  }
}
```

核心是把递归变成 while 循环，这样就不会产生堆栈。

## 强制保留 import

TS 编译时会把没用到的 import 干掉，但这次提供了 `--preserveValueImports` 参数禁用这一特性，原因是以下情况会导致误移除 import：

```ts
import { Animal } from "./animal.js"

eval("console.log(new Animal().isDangerous())")
```

因为 TS 无法分辨 eval 里的引用，类似的还有 vue 的 `setup` 语法：

```html
<!-- A .vue File -->
<script setup>
import { someFunc } from "./some-module.js"
</script>

<button @click="someFunc">Click me!</button>
```

## 支持变量 import type 声明

之前支持了如下语法标记引用的变量是类型：

```ts
import type { BaseType } from "./some-module.js"
```

现在支持了变量级别的 type 声明：

```ts
import { someFunc, type BaseType } from "./some-module.js"
```

这样方便在独立模块构建时，安全的抹去 `BaseType`，因为单模块构建时，无法感知 `some-module.js` 文件内容，所以如果不特别指定 `type BaseType`，TS 编译器将无法识别其为类型变量。

## 类私有变量检查

包含两个特性，第一是 TS 支持了类私有变量的检查：

```ts
class Person {
    #name: string;
}
```

第二是支持了 `#name in obj` 的判断，如：

```ts
class Person {
  #name: string
  constructor (name: string) {
    this.#name = name
  }

  equals (other: unknown) {
    return other &&
      typeof other === "object" &&
      #name in other && // <- this is new!
      this.#name === other.#name
  }
}
```

该判断隐式要求了 `#name in other` 的 `other` 是 Person 实例化的对象，因为该语法仅可能存在于类中，而且还能进一步类型缩窄为 Persion 类。

## Import 断言

支持了导入断言提案：

```ts
import obj from "./something.json" assert { type: "json" }
```

以及动态 import 的断言：

```ts
const obj = await import("./something.json", {
  assert: { type: "json" }
})
```

TS 该特性支持了任意类型的断言，而不关心浏览器是否识别。所以该断言如果要生效，需要以下两种支持的任意一种：

- 浏览器支持。
- 构建脚本支持。

不过目前来看，构建脚本支持的语法并不统一，比如 Vite 对导入类型的断言有如下两种方式：

```ts
import obj from "./something?raw"

// 或者自创的语法 blob 加载模式
const modules = import.meta.glob(
  './**/index.tsx',
  {
    assert: { type: 'raw' },
  },
)
```

所以该导入断言至少在未来可以统一构建工具的语法，甚至让浏览器原生支持后，就不需要构建工具处理 import 断言了。

其实完全靠浏览器解析要走的路还有很远，因为一个复杂的前端工程至少有 3000~5000 个资源文件，目前生产环境不可能使用 bundless 一个个加载这些资源，因为速度太慢了。

## const 只读断言

```ts
const obj = {
  a: 1
} as const

obj.a = 2 // error
```

通过该语法指定对象所有属性为 `readonly`。

## 利用 realpathSync.native 实现更快加载速度

对开发者没什么感知，就是利用 `realpathSync.native` 提升了 TS 加载速度。

## 片段自动补全增强

在 Class 成员函数与 JSX 属性的自动补全功能做了增强，在使用了最新版 TS 之后应该早已有了体感，比如 JSX 书写标签输入回车后，会自动根据类型补全内容，如：

```html
<App cla />
//    ↑回车↓
//        <App className="|" />
//                        ↑光标自动移到这里
```

## 代码可以写在 super() 前了

JS 对 `super()` 的限制是此前不可以调用 this，但 TS 限制的更严格，在 `super()` 前写任何代码都会报错，这显然过于严格了。

现在 TS 放宽了校验策略，仅在 `super()` 前调用 this 会报错，而执行其他代码是被允许的。

这点其实早就该改了，这么严格的校验策略让我一度以为 JS 就是不允许 `super()` 前调用任何函数，但想想也觉得不合理，因为 `super()` 表示调用父类的 `constructor` 函数，之所以不自动调用，而需要手动调用 `super()` 就是为了开发者可以灵活决定哪些逻辑在父类构造函数前执行，所以 TS 之前一刀切的行为实际上导致 `super()` 失去了存在的意义，成为一个没有意义的模版代码。

## 类型收窄对解构也生效了

这个特性真的很厉害，即解构后类型收窄依然生效。

此前，TS 的类型收窄已经很强大了，可以做到如下判断：

```ts
function foo(bar: Bar) {
  if (bar.a === '1') {
    bar.b // string 类型
  } else {
    bar.b // number 类型
  }
}
```

但如果提前把 a、b 从 bar 中解构出来就无法自动收窄了。现在该问题也得到了解决，以下代码也可以正常生效了：

```ts
function foo(bar: Bar) {
  const { a, b } = bar
  if (a === '1') {
    b // string 类型
  } else {
    b // number 类型
  }
}
```

## 深度递归类型检查优化

下面的赋值语句会产生异常，原因是属性 prop 的类型不匹配：

```ts
interface Source {
  prop: string
}

interface Target {
  prop: number
}

function check (source: Source, target: Target) {
  target = source
  // error!
  // Type 'Source' is not assignable to type 'Target'.
  //   Types of property 'prop' are incompatible.
  //     Type 'string' is not assignable to type 'number'.
}
```

这很好理解，从报错来看，TS 也会根据递归检测的方式查找到 prop 类型不匹配。但由于 TS 支持泛型，如下写法就是一种无限递归的例子：

```ts
interface Source<T> {
  prop: Source<Source<T>>
}

interface Target<T> {
  prop: Target<Target<T>>
}

function check (source: Source<string>, target: Target<number>) {
  target = source
}
```

实际上不需要像官方说明写的这么复杂，哪怕是 `props: Source<T>` 也足以让该例子无限递归下去。TS 为了确保该情况不会出错，做了递归深度判断，过深的递归会终止判断，但这会带来一个问题，即无法识别下面的错误：

```ts
interface Foo<T> {
  prop: T
}

declare let x: Foo<Foo<Foo<Foo<Foo<Foo<string>>>>>>
declare let y: Foo<Foo<Foo<Foo<Foo<string>>>>>

x = y
```

为了解决这一问题，TS 做了一个判断：递归保护仅对递归写法的场景生效，而上面这个例子，虽然也是很深层次的递归，但因为是一个个人肉写出来的，TS 也会不厌其烦的一个个递归下去，所以该场景可以正确 Work。

这个优化的核心在于，TS 可以根据代码结构解析哪些是 “非常抽象/启发式” 写法导致的递归，哪些是一个个枚举产生的递归，并对后者的递归深度检查进行豁免。

## 增强的索引推导

下面的官方文档给出的例子，一眼看上去比较复杂，我们来拆解分析一下：

```ts
interface TypeMap {
  "number": number
  "string": string
  "boolean": boolean
}

type UnionRecord<P extends keyof TypeMap> = { [K in P]:
  {
    kind: K
    v: TypeMap[K]
    f: (p: TypeMap[K]) => void
  }
}[P]

function processRecord<K extends keyof TypeMap> (record: UnionRecord<K>) {
  record.f(record.v)
}

// This call used to have issues - now works!
processRecord({
  kind: "string",
  v: "hello!",

  // 'val' used to implicitly have the type 'string | number | boolean',
  // but now is correctly inferred to just 'string'.
  f: val => {
    console.log(val.toUpperCase())
  }
})
```

该例子的目的是实现 `processRecord` 函数，该函数通过识别传入参数 `kind` 来自动推导回调函数 `f` 中 `value` 的类型。

比如 `kind: "string"`，那么 `val` 就是字符串类型，`kind: "number"`，那么 `val` 就是数字类型。

因为 TS 这次更新解决了之前无法识别 `val` 类型的问题，我们不需要关心 TS 是怎么解决的，只要记住 TS 可以正确识别该场景（有点像围棋的定式，对于经典例子最好逐一学习），并且理解该场景是如何构造的。

如何做到呢？首先定义一个类型映射：

```ts
interface TypeMap {
  "number": number
  "string": string
  "boolean": boolean
}
```

之后定义最终要的函数 `processRecord`:

```ts
function processRecord<K extends keyof TypeMap> (record: UnionRecord<K>) {
  record.f(record.v)
}
```

这里定义了一个泛型 K，`K extends keyof TypeMap` 等价于 `K extends 'number' | 'string' | 'boolean'`，所以这里是限定了以下泛型 K 的取值范围，值为这三个字符串之一。

重点来了，参数 `record` 需要根据传入的 `kind` 决定 `f` 回调函数参数类型。我们先想象以下 `UnionRecord` 类型怎么写：

```ts
type UnionRecord<K extends keyof TypeMap> = {
  kind: K
  v: TypeMap[K]
  f: (p: TypeMap[K]) => void
}
```

如上，自然的想法是定义一个泛型 K，这样 `kind` 与 `f`, `p` 类型都可以表示出来，这样 `processRecord<K extends keyof TypeMap>(record: UnionRecord<K>)` 的 `UnionRecord<K>` 就表示了将当前接收到的实际类型 K 传入 `UnionRecord`，这样 `UnionRecord` 就知道实际处理什么类型了。

本来到这里该功能就已经结束了，但官方给的 `UnionRecord` 定义稍有些不同：

```ts
type UnionRecord<P extends keyof TypeMap> = { [K in P]:
  {
    kind: K
    v: TypeMap[K]
    f: (p: TypeMap[K]) => void
  }
}[P]
```

这个例子特意提升了一个复杂度，用索引的方式绕了一下，可能之前 TS 就无法解析这种形式吧，总之现在这个写法也被支持了。我们看一下为什么这个写法与上面是等价的，上面的写法简化一下如下：

```ts
type UnionRecord<P extends keyof TypeMap> = {
  [K in P]: X
}[P]
```

可以解读为，`UnionRecord` 定义了一个泛型 P，该函数从对象 `{ [K in P]: X }` 中按照索引（或理解为下标） `[P]` 取得类型。而 `[K in P]` 这种描述对象 Key 值的类型定义，等价于定义了复数个类型，由于正好 `P extends keyof TypeMap`，你可以理解为类型展开后是这样的：

```ts
type UnionRecord<P extends keyof TypeMap> = {
  'number': X,
  'string': X,
  'boolean': X
}[P]
```

而 P 是泛型，由于 `[K in P]` 的定义，所以必定能命中上面其中的一项，所以实际上等价于下面这个简单的写法：

```ts
type UnionRecord<K extends keyof TypeMap> = {
  kind: K
  v: TypeMap[K]
  f: (p: TypeMap[K]) => void
}
```

## 参数控制流分析

这个特性字面意思翻译挺奇怪的，还是从代码来理解吧：

```ts
type Func = (...args: ["a", number] | ["b", string]) => void

const f1: Func = (kind, payload) => {
  if (kind === "a") {
    payload.toFixed()  // 'payload' narrowed to 'number'
  }
  if (kind === "b") {
    payload.toUpperCase()  // 'payload' narrowed to 'string'
  }
}

f1("a", 42)
f1("b", "hello")
```

如果把参数定义为数组且使用或并列枚举时，其实就潜在包含了一个运行时的类型收窄。比如当第一个参数值为 `a` 时，第二个参数类型就确定为 `number`，第一个参数值为 `b` 时，第二个参数类型就确定为 `string`。

值得注意的是，这种类型推导是从前到后的，因为参数是自左向右传递的，所以是前面推导出后面，而不能是后面推导出前面（比如不能理解为，第二个参数为 `number` 类型，那第一个参数的值就必须为 `a`）。

## 移除 JSX 编译时产生的非必要代码

JSX 编译时干掉了最后一个没有意义的 `void 0`,减少了代码体积：

```ts
- export const el = _jsx("div", { children: "foo" }, void 0);
+ export const el = _jsx("div", { children: "foo" })
```

由于改动很小，所以可以借机学习一下 TS 源码是怎么修改的，这是 PR DIFF 地址。

可以看到，修改位置是 `src/compiler/transformers/jsx.ts` 文件，改动逻辑为移除了 `factory.createVoidZero()` 函数，该函数正如其名，会创建末尾的 `void 0`，除此之外就是大量的 tests 文件修改，其实理解了源码上下文，这种修改并不难。

## JSDoc 校验提示

JSDoc 注释由于与代码是分离的，随着不断迭代很容易与实际代码产生分叉：

```ts
/**
 * @param x {number} The first operand
 * @param y {number} The second operand
 */
function add (a, b) {
  return a + b
}
```

现在 TS 可以对命名、类型等不一致给出提示了。顺便说一句，用了 TS 就尽量不要用 JSDoc，毕竟代码和类型分离随时有不一致的风险产生。
