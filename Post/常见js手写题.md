---
aliases: []
tags: ['Post','date/2022-05','year/2022','month/05']
date: 2022-05-12-星期四 10:13:45
update: 2022-09-29-星期四 11:37:02
---

## byhand

```query
tag:JavaScript/byhand
```

## 数字

### 判断完全平方数

```js
function isPerfectSquare(num) {
  return num ** 0.5 % 1 == 0
}
```

### 二进制加法

```js
function addBinary(a, b) {
  let ans = '',
    carry = 0
  let pa = a.length - 1
  let pb = b.length - 1
  while (pa >= 0 || pb >= 0) {
    const sum = Number(a[pa] || 0) + Number(b[pb] || 0) + carry
    carry = Math.floor(sum / 2)
    ans = (sum % 2) + ans
    pa--
    pb--
  }
  if (carry !== 0) ans = '1' + ans
  return ans
}

addBinary('1010', '111') // 10001
```

### 指定范围内的随机数

```js
function getRandom (n, m) {
    var num = Math.floor(Math.random() * (m - n + 1) + n)
    return num
}
```

### 空间转化

```js
function bytesToSize(bytes) {
  if (bytes === 0) return '0 B'
  let k = 1024, // or 1000
    sizes = ['B', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'],
    i = Math.floor(Math.log(bytes) / Math.log(k))
  return (bytes / Math.pow(k, i)).toFixed(2) + ' ' + sizes[i]
}
```

## 字符串

### 每三位分隔展示数字字符串

```js
// 将'10000000000'形式的字符串，以每3位进行分隔展示'10.000.000.000'

const str = '10000000000'

// toLocaleString, 德国货币形式, de-DE, 缺点是需要先转为数字
Number(str).toLocaleString('de-DE')

// 正则替换
str.replace(/(\d)(?=(\d{3})+\b)/g, '$1.')
```

### 字符串的大小写取反

如何把一个字符串的大小写取反（大写变小写小写变大写），例如 ’AbC' 变成 'aBc'

```js
// 关键在于大小写转换， 你也可以先判断他是大写字符/小写再对应处理
const handle = str => str.replace(/([a-zA-Z])/g, (match) => String.fromCharCode(match.charCodeAt() ^ 32))
```

### 整数的回文字串

```js
function handle(num) {
  let num1 = num / 10
  let num2 = num % 10
  if (num1 < 1) {
    return num
  } else {
    num1 = Math.floor(num1)
    return `${num2}${handle(num1)}`
  }
}
handle(12345)
// 54321
```

### 字符串相加

```js
function addStrings(num1, num2) {
  let i = num1.length - 1
  let j = num2.length - 1
  const ans = []

  let radix = 0
  while (i >= 0 || j >= 0) {
    const n1 = i >= 0 ? Number(num1[i]) : 0
    const n2 = j >= 0 ? Number(num2[j]) : 0
    const sum = n1 + n2 + radix
    radix = Math.floor(sum / 10)
    ans.push(sum % 10)
    i--
    j--
  }
  radix && ans.push(radix)

  return ans.reverse().join('')
}
addStrings('123','456') // '579'
```

### 字符串相乘

```js
function multiply(num1, num2) {
  if (num1 === '0' || num2 === '0') return '0'
  let i = num1.length - 1
  let j = num2.length - 1
  const ans = []

  while (i >= 0) {
    const n1 = Number(num1[i])
    let k = j
    while (k >= 0) {
      const n2 = Number(num2[k])
      const sum = (ans[i + k + 1] || 0) + n1 * n2
      ans[i + k + 1] = sum % 10
      ans[i + k] = (ans[i + k] || 0) + Math.floor(sum / 10)
      k--
    }
    i--
  }
  if (ans[0] === 0) ans.shift()
  return ans.join('')
}
multiply("123","456") // "56088"
```

### 字符排序题

在一个字符串数组中有红、黄、蓝三种颜色的球，且个数不相等、顺序不一致，请为该数组排序。使得排序后数组中球的顺序为: 黄、红、蓝。

例如：红蓝蓝黄红黄蓝红红黄红，排序后为：黄黄黄红红红红红蓝蓝蓝。

```js
const weight = {
  黄: 1,
  红: 2,
  蓝: 3,
}
const strArr = ['红', '蓝', '蓝', '黄', '红', '黄', '蓝', '红', '红', '黄', '红']
console.log(strArr.sort((a, b) => weight[a] - weight[b]))
```

## 数组

### 数组转为 tree

```js
const arr = [
  { id: 0, name: '1', parent: -1, childNode: [] },
  { id: 1, name: '1', parent: 0, childNode: [] },
  { id: 99, name: '1-1', parent: 1, childNode: [] },
  { id: 111, name: '1-1-1', parent: 99, childNode: [] },
  { id: 66, name: '1-1-2', parent: 99, childNode: [] },
  { id: 1121, name: '1-1-2-1', parent: 111, childNode: [] },
  { id: 12, name: '1-2', parent: 1, childNode: [] },
  { id: 2, name: '2', parent: 0, childNode: [] },
  { id: 21, name: '2-1', parent: 2, childNode: [] },
  { id: 22, name: '2-2', parent: 2, childNode: [] },
  { id: 221, name: '2-2-1', parent: 22, childNode: [] },
  { id: 3, name: '3', parent: 0, childNode: [] },
  { id: 31, name: '3-1', parent: 3, childNode: [] },
  { id: 32, name: '3-2', parent: 3, childNode: [] }
]

function arrToTree(arr, id) {
  const arrFilter = arr.filter(item => id === undefined ? item.parent === -1 : item.parent === id)

  arrFilter.forEach(item => {
    item.childNode = arrToTree(arr, item.id)
  })

  return arrFilter
}
```

### 数组分组改成减法运算

```js
const arr = [5, [[4, 3], 2, 1]]
// (5-((4-3)-2-1))
function run(arr) {
  return arr.reduce((pre, cur) => {
    const first = Array.isArray(pre) ? run(pre) : pre
    const last = Array.isArray(cur) ? run(cur) : cur
    return first - last
  })
}
```

## 对象

### 树形数据结构扁平化

```js
// 编写两个函数，实现如下两个数据结构互相转换
const data = {
  a: {
    b: {
      c: {
        dd: 'abcdd'
      }
    },
    d: {
      xx: 'adxx'
    },
    e: 'ae',
    g: [1, { g1: 6 }, [1, 2]]
  }
}
const output = {
  'a.b.c.dd': 'abcdd',
  'a.d.xx': 'adxx',
  'a.e': 'ae',
  'g[0]': 1,
  'g[1].g1': 6,
  'g[2][0]': 1,
  'g[2][1]': 2
}
```

```js
function flatObj(data, path = '', result = {}) {
  Object.keys(data).forEach(key => {
    const val = data[key]
    key = Array.isArray(data) ? `[${ key }]` : key
    if (typeof val === 'object' && val) {
      flatObj(val, `${ path }${ key }${ Array.isArray(val) ? '' : '.' }`, result)
    } else {
      result[`${ path }${ key }`] = val
    }
  })
  return result
}

```

## Promise

## 异步

### 异步并发控制

```js
async function asyncPool(poolLimit, array, iteratorFn) {
  const ret = []// 存储所有的异步任务
  const executing = []// 存储正在执行的异步任务
  for (const item of array) {
    // 调用iteratorFn函数创建异步任务
    const p = Promise.resolve(iteratorFn(item, array))
    ret.push(p)// 保存新的异步任务

    // 当poolLimit值小于或等于总任务个数时，进行并发控制
    if (poolLimit <= array.length) {
      // 当任务完成后，从正在执行的任务数组中移除自己
      const e = p.then(() => executing.splice(executing.indexOf(e), 1))
      executing.push(e) // 保存正在执行的异步任务
      if (executing.length >= poolLimit) { // 执行中的数量等于限制
        await Promise.race(executing) // 阻塞等待较快的任务执行完成，然后会通过上面将自己从执行队列中删除
      }
    }
  }
  return Promise.all(ret)
}

const sleep = time => new Promise(r => setTimeout(() => {
  console.log(time)
  r(time)
}, time))

const queue = [1000, 2000, 2000, 5000, 1000, 3000]

async function test() {
  const res = await asyncPool(2, queue, sleep)
  console.log(res)
}
test()
```

### 实现一个带并发限制的异步队列

```js
// 实现一个带并发限制的异步调度器Scheduler，保证同时运行的任务最多有两个。完善代码中Scheduler类，使得以下程序能正确输出
class Scheduler {
  add(promiseCreator) {
    // TODO
  }
  // TODO
}
const timeout = (time) => new Promise(resolve => {
  setTimeout(resolve, time)
})
const scheduler = new Scheduler();
const addTask = (time, order) => {
  scheduler.add(() => timeout(time))
    .then(() => console.log(order))
}

addTask(1000, '1')
addTask(500, '2')
addTask(300, '3')
addTask(400, '4')
// output: 2 3 1 4
// 一开始，1、2两个任务进入队列
// 500ms时，2完成，输出2，任务3进队
// 800ms时，3完成，输出3，任务4进队
// 1000ms时，1完成，输出1
// 1200ms时，4完成，输出4
```

```js
class Scheduler {
  tasks = [] // 任务缓冲队列
  runningTask = [] // 任务队列
  limit = 2

  constructor(limit) {
    this.limit = limit < 1 ? 1 : limit || this.limit
  }

  // promiseCreator 是一个异步函数，return Promise
  add(promiseCreator) {
    return new Promise(resolve => {
      promiseCreator.resolve = resolve
      if (this.runningTask.length < this.limit) {
        this.run(promiseCreator)
      } else {
        this.tasks.push(promiseCreator)
      }
    })
  }

  run(promiseCreator) {
    const p = Promise.resolve(promiseCreator())
    this.runningTask.push(p)
    p.then(() => {
      promiseCreator.resolve()
      // 删除运行完的任务
      this.runningTask.splice(this.runningTask.indexOf(p), 1)
      if (this.tasks.length > 0) {
        this.run(this.tasks.shift())
      }
    })
  }
}
```

### sleep

```js
const sleep = time => new Promise(r => setTimeout(r, time))
```

### 实现一个 repeat 函数

```js
// 实现一个repeat函数，每次间隔时间调用被包裹的函数，重复指定的次数
function repeat (func, times, wait) {
  // ...
}
// 调用
const repeatFunc = repeat(console.log, 4, 500)
repeatFunc('hello~')
// 输出
// hello~ // * 4 by interval 500ms
```

```js
// 1.延长setTimeout的时间
function repeat(func, times, wait) {
  if (typeof func !== 'function') throw Error('The first param for repeat is not a function!')
  return (...args) => {
    for (let i = 0; i < times; i++) {
      setTimeout(() => {
        console.log(new Date())
        func.apply(null, args)
      }, (i + 1) * wait)
    }
  }
}

// 2.借助Promise实现一个sleep函数
function sleep (wait) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      resolve(window.performance.now())
    }, wait)
  })
}
function repeat (func, times, wait) {
  if (typeof func !== 'function') throw Error('The first param for repeat is not a function!')
  return async (...args) => {
    for (let i = 0; i < times; i++) {
      console.log(await sleep(wait))
      func.apply(null, args)
    }
  }
}
```

## 函数

### 洋葱模型 compose

```js
/**
 * 实现一个组合compose的方法，使其可以正确调用每个中间件
 * 
 * 规定中间件写法：
 * function(val, next) {
 *    // 前置操作
 *    next(val + 1); // 触发下一个中间件
 *    // 后续操作
 * }
 */
function compose(...middlewares) {
  // todo
}

// x=>add1(x,y=>add2(y,z=>output(z)))
function add1(x, next) {
  console.log('add1 before')
  next(x + 1)
  console.log('add1 after')
}

function add2(x, next) {
  console.log('add2 before')
  next(x + 2)
  console.log('add2 after')
}

function output(x) {
  console.log('output:', x)
}

const input = 0
compose(add1, add2, output)(input)

/**
 * 输出:
 *
 * add1 before
 * add2 before
 * output: 3
 * add2 after
 * add1 after
 */
```

```js
// 简易实现
function compose(...middlewares) {
  return middlewares.reduceRight((a, b) => arg => b(arg, a), _ => _)
}

// 支持await中间件
// https://github.com/koajs/compose/blob/master/index.js
function compose(...middlewares) {
  return function (context, next) {
    // last called middleware #
    let index = -1
    return dispatch(0)
    function dispatch (i) {
      if (i <= index) return Promise.reject(new Error('next() called multiple times'))
      index = i
      let fn = middleware[i]
      if (i === middleware.length) fn = next
      if (!fn) return Promise.resolve()
      try {
        return Promise.resolve(fn(context, dispatch.bind(null, i + 1)))
      } catch (err) {
        return Promise.reject(err)
      }
    }
  }
}
```

### promisify 实现

```js
// 原有的callback调用
fs.readFile('test.js', function (err, data) {
  if (!err) {
    console.log(data)
  } else {
    console.log(err)
  }
})

// promisify后
var readFileAsync = promisify(fs.readFile)
readFileAsync('test.js').then(data => {
  console.log(data)
}, err => {
  console.log(err)
})
```

```js
function promisify(fn) {
  return function (...args) {
    return new Promise((resolve, reject) => {
      fn(...args, (err, ...data) => {
        if (err) return reject(err)
        resolve(...data)
      })
    })
  }
}
```
