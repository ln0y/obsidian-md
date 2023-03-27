---
aliases: []
tags: ['JavaScript','date/2023-03','year/2023','month/03']
date: 2023-03-27-星期一 23:16:51
update: 2023-03-27-星期一 23:20:17
---

## ES2023

ES2023 新特性目前有两条：[Array find from last](https://github.com/tc39/proposal-array-find-from-last)、[Hashbang Grammar](https://github.com/tc39/proposal-hashbang)，也都处于 stage 4 阶段，预计 2023 年发布。

### 从数组末尾查找元素

新增两个方法： `.findLast()`、`.findLastIndex()` 从数组的最后一个元素开始查找，可以同 `find()`、`findIndex()` 做一个对比。

```js
const arr = [{ value: 1 }, { value: 2 }, { value: 3 }, { value: 4 }];

// find vs findLast
console.log(arr.find(n => n.value % 2 === 1)); // { value: 1 }
console.log(arr.findLast(n => n.value % 2 === 1)); // { value: 3 }

// findIndex vs findLastIndex
console.log(arr.findIndex(n => n.value % 2 === 1)); // 0
console.log(arr.findLastIndex(n => n.value % 2 === 1)); // 2
```

### Hashbang 语法

如下所示，在 index.js 脚本文件里编写 JS 代码，如果要正确的执行，需要在控制台输入 `node index.js`。

```js
console.log("JavaScript");
```

如果直接执行 `./index.js` 脚本文件会得到以下报错：

```js
$ ./index.js
./index.js: line 1: syntax error near unexpected token `"JavaScript"'
./index.js: line 1: `console.log("JavaScript");' 
```

很正常，因为我们并没有指定使用何种解释器来执行上述脚本文件。**Hashbang 语法是用来指定脚本文件的解释器是什么，语法规则是在脚本文件头部增加一行代码：**`#!/usr/bin/env node`。

```js
// #!/usr/bin/env node
console.log("JavaScript");
```

注意，还需修改脚本文件的权限 `chmod +x index.js`，否则执行会报 `permission denied: ./index.js` 错误。

## ES2022

### Class Fields

**允许在类最外层声明类成员**，参考 [https://github.com/tc39/proposal-class-fields](https://github.com/tc39/proposal-class-fields)。

```js
class Person {
  name = 'Tom'
}
```

**私有化类成员**：支持私有实例、私有静态类型字段、私有方法。

```js
class Person {
  #privateField1 = 'private field 1'; // 私有字段赋初值
  #privateField2; // 默认 undefined
  static #privateStaticField3 = 'private static field 3'
  constructor(value) {
    this.#privateField2 = value; // 实例化时为私有字段赋值
  }
  #toString() {
    console.log(this.#privateField1, this.#privateField2, InstPrivateClass.#privateStaticField3);
  }
  print() {
    this.#toString()
  }
}
const p = new Person('private field 2')
p.print()
```

### 私有字段检查

使用 in 操作符检测某一实例是否包含要检测的私有字段。

```js
class Person {
  #name = 'Ergonomic brand checks for Private Fields';
  static check(obj) {
    return #name in obj;
  }
}
```

### Top-level await

以前 await 必须随着 async 一起出现，只有在 async 函数内才可用。当需要在一些文件顶部进行初始化的场景中使用时就有不支持了，顶级 await 可以解决这个问题，但它仅支持 ES Modules。

```js
let jQuery;
try {
  jQuery = await import('https://cdn-a.com/jQuery');
} catch {
  jQuery = await import('https://cdn-b.com/jQuery');
}
```

### 正则新增 /d 修饰符

以前的正则表达式支持 3 个修饰符：/i（忽略大小写）、/g（全局匹配）、/m（多行），当执行正则表达式的 exec() 方法时，新增一个 /d 修饰符，它会返回一个 indices 属性，包含了匹配元素的开始、结束位置索引。

```js
const str = 'ECMAScript_JavaScript'
const regexp = /sc/igd // 忽略大小全局匹配并返回匹配元素的开始、结束位置索引
console.log(regexp.exec(str).indices) // [ 4, 6 ]
console.log(regexp.exec(str).indices) // [ 15, 17 ]
```

### .at() 操作符

根据指定索引获取数组元素，不同的是它支持传递负数，例如 -1 获取最后一个元素。

```js
const arr = ['a', 'b', 'c']
console.log(arr.at(0));
console.log(arr.at(-1)); // 等价于 arr[arr.length - 1]
```

### Object.hasOwn()

`Object.hasOwn()` 提供了一种更安全的方法来检查对象是否具有自己的属性，适用于检查所有的对象。`Object.prototype.hasOwnProperty()` 方法遇到 `obj = null` 这种情况会报错，参见以下示例：

```js
const person = Object.create({ name: 'Tom' })
person.age = 18;
console.log(Object.hasOwn(person, 'name')); // false
console.log(Object.hasOwn(person, 'age')); // true

// 遇到这种情况 hasOwnProperty 会报错
const p1 = null
console.log(p1.hasOwnProperty('name')); // TypeError: Cannot read properties of null (reading 'hasOwnProperty')
```

### Error Cause

Error Cause 是由阿里巴巴提出的一个提案，为 Error 构造函数增加了一个 options，可设置 cause 的值为任意一个有效的 JavaScript 值。

例如，自定义错误 message，将错误原因赋给 cause 属性，传递给下一个捕获的地方。

```js
try {
  await fetch().catch(err => {
    throw new Error('Request failed', { cause: err })
  })
} catch (e) {
  console.log(e.message);
  console.log(e.cause);
}
```

### Class Static Block

类的静态初始化块是在类中为静态成员提供了一个用于做初始化工作的代码块。

```js
class C {
  static x = 'x';
  static y;
  static z;
  static {
    try {
      const obj = doSomethingWith(this.x);
      this.y = obj.y;
      this.z = obj.z;
    } catch (err) {
      this.y = 'y is error';
      this.z = 'z is error';
    }
  }
}
```

## ES2021

### String.prototype.replaceAll

`replaceAll()` 用于替换正则表达式或字符串的所有匹配项，之前的 `replace()` 只会匹配一个。

```js
console.log('JavaScript'.replaceAll('a', 'b')); // JbvbScript
```

### Promise.any

Promise.any() 接收一个 Promise 数组做为参数，返回第一个执行成功的 Promise，如果全部执行失败将返回一个新的异常类型 AggregateError，错误信息会以对象数组的形式放入其中。

```js
const delay = (value, ms) => new Promise((resolve, reject) => setTimeout(() => resolve(value), ms));
const promises = [
  delay('a', 3000),
  delay('b', 2000),
  delay('c', 4000),
];

Promise.any(promises)
  .then(res => console.log(res)) // b
  .catch(err => console.error(err.name, err.message, err.errors)) // 全部失败时返回：AggregateError All promises were rejected [ 'a', 'b', 'c' ]
```

### 数字分隔符

数字分隔符可以让大数字看起来也容易理解。

```js
const budget = 1_000_000_000_000;
console.log(budget === 10 ** 12); // true
```

### 逻辑赋值运算符

结合了逻辑运算符 `&&`、`||`、`??` 和逻辑表达式 `=`。

```js
// "Or Or Equals" (or, the Mallet operator :wink:)
a ||= b; // a || (a = b);

// "And And Equals"
a &&= b; // a && (a = b);

// "QQ Equals"
a ??= b; // a ?? (a = b);
```

### WeakRefs

能够拿到一个对象的弱引用，而不会阻止该对象被垃圾回收。例如 ref 弱引用了 obj，尽管持有了 obj 对象的引用，但也不会阻止垃圾回收 obj 这个对象，如果是强引用则不行。

参考 [https://github.com/tc39/proposal-weakrefs](https://github.com/tc39/proposal-weakrefs)

```js
const obj = { a: 1 };
const ref = new WeakRef(obj)
console.log(ref.deref());
```

## ES2020

### matchAll - 匹配所有

`String.prototype.matchAll()` 会返回正则匹配的所有字符串及其位置，相比于 `String.prototype.match()` 返回的信息更详细。

```js
const str = 'JavaScript'
const regexp = /a/g
console.log([...str.matchAll(regexp)]);

// Output:
[
  [ 'a', index: 1, input: 'JavaScript', groups: undefined ],
  [ 'a', index: 3, input: 'JavaScript', groups: undefined ]
]
```

### 模块新特性

- **import 动态导入**

动态导入意思是当你需要该模块时才会进行加载，返回的是一个 `Promise` 对象。只有在 `ES Modules` 模块规范下才支持。

```js
// index-a.mjs
export default {
  hello () {
    console.log(`hello JavaScript`);
  }
}

// index-b.mjs
import('./index-a.mjs').then(module => {
  module.default.hello(); // hello JavaScript
})
```

- **import.meta**

`import.meta` 指当前模块的元数据。一个广泛支持的属性是 `import.meta.url`，以字符串形式输出当前模块的文件路径。

### BigInt

BigInt 是新增的一种描述数据的类型，用来表示任意大的整数。因为原先的 JavaScript Number 类型能够表示的最大整数位 `Math.pow(2, 53) - 1`，一旦超出就会出现精度丢失问题。详情可参考笔者之前的这篇文章 [JavaScript 浮点数之迷下：大数危机 https://github.com/qufei1993/blog/issues/10](https://github.com/qufei1993/blog/issues/10)。

```js
9007199254740995 // 会出现精度丢失
9007199254740995n // BigInt 表示方式一
BigInt('9007199254740995') // BigInt 表示方式二
```

### Promise.allSettled

Promise.allSettled() 会等待所有的 Promise 对象都结束后在返回结果。

```js
const delay = (value, ms, isReject) => new Promise((resolve, reject) => setTimeout(() => isReject ? reject(new Error(value)) : resolve(value), ms));
const promises = [
  delay('a', 3000),
  delay('b', 2000, true),
];
Promise.allSettled(promises)
  .then(res => console.log(res))

// Output:
[
  { status: 'fulfilled', value: 'a' },
  {
    status: 'rejected',
    reason: Error: b
        at Timeout._onTimeout (/index.js:1:108)
        at listOnTimeout (node:internal/timers:564:17)
        at process.processTimers (node:internal/timers:507:7)
  }
]
```

### 全局对象

JavaScript 可以运行在不同的环境，浏览器为 window、Node.js 为 global。为了能够统一全局环境变量，引入了 globalThis。

```js
window === globalThis // 浏览器环境
global === globalThis // Node.js 环境
```

### for-in 机制

ECMA-262 规范没有规定 `for (a in b) …` 的遍历顺序，部分原因是所有引擎都有自己特殊的实现，现在很难就 for-in 完整顺序规范达成一致，但规范了一些供参考的实现行为，详情参考 [this list of interop semantics](https://github.com/tc39/proposal-for-in-order/tree/master/exploration#interop-semantics)。

### 可选链

可选链是一个很好的语法，使用 `?.` 表示，能避免一些常见类型错误。

```js
const obj = null;
obj.a // TypeError: Cannot read properties of null (reading 'a')
obj?.a // 使用可选链之后就不会报错了，会输出 undefined
```

### 空值合并

空值合并语法使用 `??` 表示，和 `||` 这个语法类似，不同的是 `??` 有明确的规定，只有当左侧的值为 null 或 undefined 时才会返回右侧的值，例如，左侧是 0 也会认为是合法的。

```js
const a = 0
a || 1 // 1
a ?? 1 // 0
```

## ES2019

### 可选的 catch 参数

```js
try {
  throw new Error('this is not a valid')
} catch {
  console.error(`error...`);
}
```

### Symbol.prototype.description

创建 Symbol 对象时可以传入一个描述做为参数。如下所示，使用 `symbol.description` 可方便的获取到这个描述。

```js
const symbol = Symbol('Hello World')
symbol.description
```

### 函数的 toString() 方法

函数也可以执行 toString() 方法，它会返回定义的函数体代码，包含注释。

```js
const fn = (a, b) => {
  // return a + b value
  const c = a + b;
  return c;
}
console.log(fn.toString()); 
```

### Object.fromEntries

`Object.fromEntries()` 方法会把键值对列表转换为对象。同 `Object.entries()` 相反。

```js
const arr = [ [ 'name', 'foo' ], [ 'age', 18 ] ];
const obj = Object.fromEntries(arr);
console.log(obj); // { name: 'foo', age: 18 }
console.log(Object.entries(obj)); // [ [ 'name', 'foo' ], [ 'age', 18 ] ]
```

### 消除前后空格

ES2019 之前有一个 `trim()` 方法会默认消除前后空格。新增的 `trimStart()`、`trimEnd()` 方法分别用来指定消除前面、后面空格。

```js
'  JavaScript  '.trim() // 'JavaScript'
'  JavaScript  '.trimStart() // 'JavaScript  '
'  JavaScript  '.trimEnd() // '  JavaScript'
```

### 数组 flat()、flatMap()

`flat(depth)` 可以实现数组扁平化，传入的 `depth` 参数表示需要扁平化的数组层级。

```js
[['a'], ['b', 'bb'], [['c']]].flat(2) // [ 'a', 'b', 'bb', 'c' ]
```

`flatMap()` 方法是 `map()` 和 `flat()` 方法的结合，该方法只能展开一维数组。

```js
[['a'], ['b', 'bb'], [['c']]].flatMap(x => x) // [ 'a', 'b', 'bb', [ 'c' ] ]
```

### JSON 超集

ES2019 之前 JSON 字符串中不支持 `\u2028（行分隔符）`、`\u2029（段落分隔符）` 字符，否则 JSON.parse() 会报错，现在给予了支持。

```js
const json = '"\u2028"';
JSON.parse(json);
```

### JSON.stringify() 加强格式转化

防止 `JSON.stringify` 返回格式错误的 Unicode 字符串，参考 [https://2ality.com/2019/01/well-formed-stringify.html](https://2ality.com/2019/01/well-formed-stringify.html)

## ES2018

### 异步迭代

异步迭代在 Node.js 中用的会多些，使用 `for-await-of` 遍历异步数据。例如使用 MongoDB 查询数据返回值默认为一个游标对象，避免了一次性把数据读入应用内存，详情参考 [#31](https://github.com/qufei1993/blog/issues/31)。

```js
const userCursor = userCollection.find();
for await (const data of userCursor) { ... }
```

### Promise.finally

Promise.finally 能保证无论执行成功或失败都一定被执行，可以用来做一些清理工作。

```js
const connection = { open: () => Promise.resolve() }
connection
  .open()
  .then()
  .catch()
  .finally(() => {
    console.log('clear connection');
  })
```

### 新的正则表达式功能

- **正则命名组捕获**

正则命名组捕获使用符号 `?<name>` 表示，对匹配到的正则结果按名称访问。

```js
const regexp = /(?<year>\d{4})-(?<month>\d{2})-(?<day>\d{2})/u;
const result = regexp.exec('2023-01-01');
console.log(result.groups); // { year: '2023', month: '01', day: '01' }
```

- **正则 Lookbehind 断言：**[https://github.com/tc39/proposal-regexp-lookbehind](https://github.com/tc39/proposal-regexp-lookbehind)
- 正则表达式 dotAll 模式：[https://github.com/tc39/proposal-regexp-dotall-flag](https://github.com/tc39/proposal-regexp-dotall-flag)
- 正则表达式 Unicode 转义：[https://github.com/tc39/proposal-regexp-unicode-property-escapes](https://github.com/tc39/proposal-regexp-unicode-property-escapes)

### Rest/Spread 属性

Rest 参数语法使用 `…` 表示，会将所有未明确的参数表示为一个数组。

```js
const fn = (a, ...rest) => {
  console.log(a, rest); // 1 [ 2, 3 ]
}
fn(1, 2, 3);
```

展开操作符（Spread）也使用 `…` 表示，将一个数组内容转换为参数传递给函数。

```js
const fn = (a, ...rest) => {
  console.log(a, rest); // 1 [ 2, 3 ]
}
fn(...[1, 2, 3]);
```

展开操作符另一个常用的场景是用来做对象的浅拷贝。

```js
const obj = { a: 1 }
const newObj = { ...obj, b: 2 }
```

### 解除模版字符串限制 - Lifting template literal restriction

“Lifting template literal restriction” 翻译过来为 “解除模版字符串限制”，这个要结合 ES6 中的 “带标签的模版字符串” 来理解。

以下代码执行时，解析器会去查找有效的转义序列，例如 `Unicode` 字符以 `"\u"` 开头，例如 `\u00A9`，以下 `"\unicode"` 是一个非法的 `Unicode` 字符，在之前就会得到一个 `SyntaxError: malformed Unicode character escape sequence` 错误。ES2018 中解除了这个限制，当遇到不合法的字符时也会正常执行，得到的是一个 `undefined`，通过 `raw` 属性还是可以取到原始字符串。

```js
function latex(strings, ...exps) {
  console.log(strings); // [ undefined ]
  console.log(strings.raw);  // [ 'latex \\unicode' ]
 }
 
 latex`latex \unicode`;
```

## ES2017

### Object.values/Object.entries

`Object.values()` 返回一个对象的所有值，同 `Object.keys()` 相反。

```js
const obj = { name: 'Tom', age: 18 }
console.log(Object.values(obj)); // [ 'Tom', 18 ]
```

`Object.entries()` 返回一个对象的键值对。

```js
const obj = { name: 'Tom', age: 18 }
for (const [key, value] of Object.entries(obj)) {
  console.log(key, value);
}
// Output
// name Tom
// age 18
```

### 字符串补全

两个字符串补全方法 `.padStart()`、`.padEnd()` 分别在字符串的头部、尾部进行按目标长度和指定字符进行填充。

```js
console.log('a'.padStart(5, '1')); // 1111a
console.log('a'.padEnd(5, '2')); // a2222
```

### async/await

异步函数 `async/await` 现在开发必备了，无需多讲。

```js
async function fn() { ... }
try {
  await fn();
} catch (err) {} 
```

### Object.getOwnPropertyDescriptors

`Object.getOwnPropertyDescriptors()` 方法用来获取一个对象的所有自身属性的描述符。

```js
const obj = {
  name: 'Tom',
  run: () => ``,
};
console.log(Object.getOwnPropertyDescriptors(obj));
// {
//   name: {
//     value: 'Tom',
//     writable: true,
//     enumerable: true,
//     configurable: true
//   },
//   run: {
//     value: [Function: run],
//     writable: true,
//     enumerable: true,
//     configurable: true
//   }
// }
```

### 参数列表支持尾逗号

支持在函数声明及调用时末尾增加逗号而不报 `SyntaxError` 错误。

```js
function add(a, b,) {
 return a + b;
}
add(1, 2,)
```

### 共享内存和原子 - Shared memory and atomics

Shared memory and atomics，“共享内存和原子” 又名 “共享数组缓冲区”，可以在主线程和多个工作线程间共享对象的字节，能更快的在多个工作线程间共享数据、除 `postMessage()` 多了一种数据传输方式。

多线程间的内存共享会带来一个后端常遇见的问题 “竞态条件”，提案提供了全局变量 `Atomics` 来解决这个问题。详情参考 [ES proposal: Shared memory and atomics](https://2ality.com/2017/01/shared-array-buffer.html)

## ES2016

### Array.prototype.includes

当判断一个数组中是否包含指定值时，使用 `includes()` 会很实用。

```js
['a', 'b'].includes('a') // true
```

### 求幂运算符

`**` 是求幂运算符，左侧是基数、右侧是指数。等价于之前的 `Math.pow()` 函数。

```js
2 ** 3 // 8
Math.pow(2, 3) // 8
```

## ES2015

最后关于 ES2015，也就是常说的 ES6 更新的内容是比较多的，不在这里赘述，推荐一个资料给有需要的朋友 [https://es6.ruanyifeng.com/](https://es6.ruanyifeng.com/)。

## Reference

- [Finished Proposals](https://github.com/tc39/proposals/blob/main/finished-proposals.md)
- [https://exploringjs.com/impatient-js/ch\_new-javascript-features.html#source-of-this-chapter](https://exploringjs.com/impatient-js/ch_new-javascript-features.html#source-of-this-chapter)
