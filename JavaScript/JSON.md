---
aliases: []
tags: ['js/JSON','JavaScript','date/2022-02','year/2022','month/02']
date: 2022-02-28-Monday 11:24:36
update: 2022-02-28-Monday 14:25:08
---

## 方法基本介绍

JSON.stringify 是日常开发中经常用到的 JSON 对象中的一个方法，JSON 对象包含两个方法：一是用于解析成 JSON 对象的 parse()；二是用于将对象转换为 JSON 字符串方法的 stringify()。下面我们分别来看下两个方法的基本使用情况。

### JSON.parse

JSON.parse 方法用来解析 JSON 字符串，构造由字符串描述的 JavaScript 值或对象。该方法有两个参数：第一个参数是需要解析处理的 JSON 字符串，第二个参数是可选参数提供可选的 reviver 函数，用在返回之前对所得到的对象执行变换操作。

>该方法的语法为：JSON.parse(text[, reviver])，[详细用法参考MDN](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/JSON/parse#syntax)

下面通过一段代码来看看这个方法以及 reviver 参数的用法，如下所示。

```js
const json = '{"result":true, "count":2}'
const obj = JSON.parse(json)
console.log(obj.count)
// 2
console.log(obj.result)
// true
/* 带第二个参数的情况 */
JSON.parse('{"p": 5}', function (k, v) {
  if (k === '') return v     // 如果k不是空，
  return v * 2              // 就将属性值变为原来的2倍返回
})                            // { p: 10 }
```

上面的代码说明了，我们可以将一个符合 JSON 格式的字符串转化成对象返回；带第二个参数的情况，可以将待处理的字符串进行一定的操作处理，比如上面这个例子就是将属性值乘以 2 进行返回。

### JSON.stringify

JSON.stringify 方法是将一个 JavaScript 对象或值转换为 JSON 字符串，默认该方法其实有三个参数：第一个参数是必选，后面两个是可选参数非必选。第一个参数传入的是要转换的对象；第二个是一个 replacer 函数，比如指定的 replacer 是数组，则可选择性地仅处理包含数组指定的属性；第三个参数用来控制结果字符串里面的间距，后面两个参数整体用得比较少。

>该方法的语法为：JSON.stringify(value[, replacer [, space]])，[详细用法参考MDN](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/JSON/stringify#syntax)

`JSON.stringify()`将值转换为相应的JSON格式：
- 转换值如果有 `toJSON()` 方法，该方法定义什么值将被序列化。
- 非数组对象的属性不能保证以特定的顺序出现在序列化后的字符串中。
- 布尔值、数字、字符串的包装对象在序列化过程中会自动转换成对应的原始值。
- `undefined`、任意的函数以及 symbol 值，在序列化过程中会被忽略（出现在非数组对象的属性值中时）或者被转换成 `null`（出现在数组中时）。函数、undefined 被单独转换时，会返回 undefined，如`JSON.stringify(function(){})` or `JSON.stringify(undefined)`.
- 对包含循环引用的对象（对象之间相互引用，形成无限循环）执行此方法，会抛出错误。
- 所有以 symbol 为属性键的属性都会被完全忽略掉，即便 `replacer` 参数中强制指定包含了它们。
- Date 日期调用了 toJSON() 将其转换为了 string 字符串（同Date.toISOString()），因此会被当做字符串处理。
- NaN 和 Infinity 格式的数值及 null 都会被当做 null。
- 其他类型的对象，包括 Map/Set/WeakMap/WeakSet，仅会序列化可枚举的属性。

下面我们通过一段代码来看看后面几个参数的妙用，如下所示。

```js
JSON.stringify({})                        // '{}'
JSON.stringify(true)                      // 'true'
JSON.stringify("foo")                     // '"foo"'
JSON.stringify([1, "false", false])       // '[1,"false",false]'
JSON.stringify({ x: 5 })                  // '{"x":5}'

JSON.stringify({ x: 5, y: 6 })
// "{"x":5,"y":6}"

JSON.stringify([new Number(1), new String("false"), new Boolean(false)])
// '[1,"false",false]'

JSON.stringify({ x: undefined, y: Object, z: Symbol("") })
// '{}'

JSON.stringify([undefined, Object, Symbol("")])
// '[null,null,null]'

JSON.stringify({ [Symbol("foo")]: "foo" })
// '{}'

JSON.stringify({ [Symbol.for("foo")]: "foo" }, [Symbol.for("foo")])
// '{}'

JSON.stringify(
  { [Symbol.for("foo")]: "foo" },
  function (k, v) {
    if (typeof k === "symbol") {
      return "a symbol"
    }
  }
)

// undefined
// 不可枚举的属性默认会被忽略：
JSON.stringify(
  Object.create(
    null,
    {
      x: { value: 'x', enumerable: false },
      y: { value: 'y', enumerable: true }
    }
  )
)

// "{"y":"y"}"
```

从上面的代码中可以看到，增加第二个参数 replacer 带来的变化：通过替换方法把对象中的属性为字符串的过滤掉，在 stringify 之后返回的仅为数字的属性变成字符串之后的结果；当第三个参数传入的是多个空格的时候，则会增加结果字符串里面的间距数量，从最后一段代码中可以看到结果。

## 实现JSON.stringify

我们来分析一下都有哪些数据类型传入，传入了之后会有什么返回，通过分析的结果我们之后才能更好地实现编码。

| JSON.stringify |                       输入                       |          输出          |
|:--------------:|:------------------------------------------------:|:----------------------:|
|  基础数据类型  |                    undefined                     |       undefined        |
|                |                     boolean                      |     'false'/'true'     |
|                |                      number                      |    字符串类型的数值    |
|                |                      symbol                      |       undefined        |
|                |                       null                       |         'null'         |
|                |                      string                      |         string         |
|                |                  NaN和Infinity                   |         'null'         |
|  引用数据类型  |                     function                     |       undefined        |
|                | Array数组中出现 undefined、 function、以及symbol |    string\|'null'[]    |
|                |                      RegExp                      |          '{}'          |
|                |                       Date                       | Date的toJSON()字符串值 |
|                |                    普通object                    | 1.如果有toJSON()方法，那么序列化toJSON()的返回值<br>2.如果属性值中出现了undefined、 任意的函数以及symbol值，忽略<br>3.所有以symbol为属新键的属性都会被完全忽略掉                      |

上面这个表中，基本整理出了各种数据类型通过 JSON.stringify 这个方法之后返回对应的值，但是还有一个特殊情况需要注意：对于包含[[深浅拷贝#基础版（手写递归实现）|循环引用的对象]]执行此方法，会抛出错误。

### 代码逻辑实现

我们先利用 typeof 把基础数据类型和引用数据类型分开，分开之后再根据不同情况来分别处理不同的情况，按照这个逻辑代码实现如下。

![[JSON.stringify]]

手工实现一个 JSON.stringify 方法的基本代码如上面所示，有几个问题你还是需要注意一下：

1. 由于 function 返回 'null'， 并且 typeof function 能直接返回精确的判断，故在整体逻辑处理基础数据类型的时候，会随着 undefined，symbol 直接处理了；

2. 由于 01 讲说过 typeof null 的时候返回'object'，故 null 的判断逻辑整体在处理引用数据类型的逻辑里面；

3. 关于引用数据类型中的数组，由于数组的每一项的数据类型又有很多的可能性，故在处理数组过程中又将 undefined，symbol，function 作为数组其中一项的情况做了特殊处理；

4. 同样在最后处理普通对象的时候，key （键值）也存在和数组一样的问题，故又需要再针对上面这几种情况（undefined，symbol，function）做特殊处理；

5. 最后在处理普通对象过程中，对于循环引用的问题暂未做检测，如果是有循环引用的情况，需要抛出 Error；
