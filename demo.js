
// // --------------------------------------------------------------------------
// // 函数柯里化是把接受多个参数的函数变换成接受一个单一参数（最初函数的第一个参数）的函数，
// // 并且返回接受余下的参数而且返回结果的新函数的技术。

// function sumFn (a, b, c) {
//   return a + b + c
// }

// // const currying = fn => judge = (...arg) => arg.length >= fn.length ? fn(...arg) : (...args) => judge(...arg, ...args)
// // console.log(judge)
// const currying = (fn, ...arg) =>
//   arg.length >= fn.length
//     ? fn(...arg)
//     : (...args) => currying(fn, ...arg, ...args)

// const sum = currying(sumFn)
// console.log(sum(2)(3)(5))
// console.log(sum(2, 3, 5))
// console.log(sum(2)(3, 5))
// console.log(sum(2, 3)(5))

// const sum1 = currying(sumFn, 2)
// console.log(sum1(3, 5));
// console.log(sum1(3)(5));

// // compose 组合函数
// const compose = (...funcs) =>
//   funcs.length === 0
//     ? arg => arg
//     : funcs.length === 1
//       ? funcs[0]
//       : funcs.reduce((a, b) => (...args) => a(b(...args)))

// 记忆函数，将上次的计算结果缓存起来，当下次调用时，如果遇到相同的参数，就直接返回缓存中的数据
// 本质上是牺牲算法的空间复杂度以换取更优的时间复杂度 e.g.斐波那契
var memoize = function (func, hashes) {
  var memoize = function (key) {
    var cache = memoize.cache
    var address = '' + (hashes ? hashes.apply(this, arguments) : key)
    if (!cache[address]) {
      cache[address] = func.apply(this, arguments)
    }
    return cache[address]
  }
  memoize.cache = {}
  return memoize
}

// var add = function (a, b, c) {
//   return a + b + c
// }

// var memoizedAdd = memoize(add, function () {
//   var args = Array.prototype.slice.call(arguments)
//   return JSON.stringify(args)
// })

// console.log(memoizedAdd(1, 2, 3)) // 6
// console.log(memoizedAdd(1, 2, 4)) // 7



// // --------------------------------------------------------------------------
// // debounce简单实现

// function debounce (fn, wait) {
//   let timer
//   return function (...arg) {
//     timer && clearTimeout(timer)
//     timer = setTimeout(() => fn.apply(this, arg), wait)
//   }
// }

// function debounce (fn, wait, immediate = false) {
//   let timer, result
//   const later = (context, args) => setTimeout(() => {
//     timer = null
//     if (!immediate) {
//       result = fn.apply(context, args)
//       context = args = null
//     }
//   }, wait)
//   const debounced = function (...params) {
//     if (!timer) {
//       timer = later(this, params)
//       if (immediate) {
//         result = fn.apply(this, params)
//       }
//     } else {
//       clearTimeout(timer)
//       timer = later(this, params)
//     }
//     return result
//   }
//   debounced.cancel = function () {
//     clearTimeout(timer)
//     timer = null
//   }
//   return debounced
// }

// const sleep = time => new Promise(resolve => setTimeout(resolve, time))

// let n = 1
// const foo = debounce(() => {
//   n++
// }, 300)

// foo()
// foo()
// foo()
// foo()

// await sleep(300)
// console.log(n);



// // --------------------------------------------------------------------------
// // throttle简单实现
// // 立刻执行，事件停止触发后不会继续执行事件
// function throttle (fn, wait) {
//   var previous = 0
//   return function (...arg) {
//     var now = +new Date()
//     if (now - previous > wait) {
//       fn.apply(this, arg)
//       previous = now
//     }
//   }
// }

// // n 秒后第一次执行，事件停止触发后依然会再执行一次事件
// function throttle (fn, wait) {
//   var timer
//   return function (...arg) {
//     if (!timer) {
//       timer = setTimeout(() => (timer = null) || fn.apply(this, arg), wait)
//     }
//   }
// }

// function throttle (func, wait, options) {
//   var timeout, context, args, result;
//   var previous = 0;
//   if (!options) options = {};

//   var later = function () {
//     previous = options.leading === false ? 0 : new Date().getTime();
//     timeout = null;
//     func.apply(context, args);
//     if (!timeout) context = args = null;
//   };

//   var throttled = function () {
//     var now = new Date().getTime();
//     if (!previous && options.leading === false) previous = now;
//     var remaining = wait - (now - previous);
//     context = this;
//     args = arguments;
//     if (remaining <= 0 || remaining > wait) {
//       if (timeout) {
//         clearTimeout(timeout);
//         timeout = null;
//       }
//       previous = now;
//       func.apply(context, args);
//       if (!timeout) context = args = null;
//     } else if (!timeout && options.trailing !== false) {
//       timeout = setTimeout(later, remaining);
//     }
//   };

//   throttled.cancel = function () {
//     clearTimeout(timeout);
//     previous = 0;
//     timeout = null;
//   }
//   return throttled;
// }


// // --------------------------------------------------------------------------
// // once简单实现
// function once (fn, context) {
//   return function (...args) {
//     if (fn) {
//       const result = fn.apply(context || this, args)
//       fn = null
//       return result
//     }
//   }
// }
// const oncefn = once(() => { console.log(124) })
// oncefn()
// oncefn()
// oncefn()
// oncefn()

// // --------------------------------------------------------------------------
// function SuperObject (dataObj = {}) {
//   return new Proxy(dataObj, {
//     get (target, key, receiver) {
//       if (!Reflect.has(target, key) && key !== 'toJSON') {
//         const ret = {}
//         Reflect.set(target, key, ret)
//         return new SuperObject(ret)
//       } else {
//         const ret = Reflect.get(target, key)
//         if (ret && typeof ret === 'object') {
//           return new SuperObject(ret)
//         }
//         return ret
//       }
//     }
//   })
// }

// const a = new SuperObject();

// console.log(a.b.c.d.e.f);



// // --------------------------------------------------------------------------
// // https://mp.weixin.qq.com/s/LTXpc2smmXKTZ9fQrmRhgQ

// const items = ['i', 't', 'e', 'r', 'a', 'b', 'l', 'e']

// const sequence = {
//   [Symbol.iterator] () {
//     let i = 0
//     return {
//       next () {
//         const value = items[i]
//         i++
//         const done = i > items.length
//         return {
//           value,
//           done
//         }
//       }
//     }
//   }
// }

// console.log(...sequence)

// for (const item of sequence) {
//   console.log(item)
// }

// const randomSequence = {
//   [Symbol.iterator]: () => ({
//     next: () => ({
//       value: Math.random()
//     })
//   })
// }

// const [one, another] = randomSequence // 解析赋值，取得前两个随机数

// console.log(one)
// console.log(another)

// // 生成器generator

// function* gen () {
//   yield 'a'
//   yield 'b'
//   return 'c'
// }

// const chars = gen()

// console.log(typeof chars[Symbol.iterator]) // chars是可迭代对象
// console.log(typeof chars.next) // chars是迭代器

// console.log(chars[Symbol.iterator]() === chars) // chars的迭代器就是它本身

// console.log(Array.from(chars)) // 可以对它使用Array.from

// console.log([...gen()]) // 可以对它使用展开运算符


// function* gen1 (x) {
//   const y = x * (yield 9)
//   return y
// }

// const it = gen1(6)

// console.log(it.next())
// console.log(it.next(7))


// // 异常处理

// function* main () {
//   const x = yield 'Hello World'
//   console.log(x)
//   yield x.toLowerCase()
// }

// const it1 = main()
// console.log(it1.next().value)
// try {
//   it1.next(52)
// } catch (err) {
//   console.log(err)
// }


// function* main2 () {
//   const x = yield "Hello World";
//   console.log('never gets here')
// }

// const it2 = main2()
// console.log(it2.next().value)
// try {
//   it2.throw('Oops') // `*main()`会处理吗？
// } catch (err) { // 没有！
//   console.log(err)
// }


// // async/await
// function request (x) {
//   return new Promise(function (resolve, reject) {
//     const time = Math.random() * 450 + 50
//     setTimeout(function () {
//       const random = Math.random() * x
//       console.log(random, 0.9 * x, time)
//       if (random < (0.9 * x)) {
//         resolve(random)
//       } else {
//         reject(random)
//       }
//     }, time)
//   })
// }

// function foo (x) {
//   return request(x + 2)
// }

// function* asyncRequest () {
//   try {
//     const res = yield foo(1)
//     console.log(res)
//   } catch (err) {
//     console.log(err)
//   }
// }

// const asyncReq = asyncRequest()
// const p = asyncReq.next().value

// p.then(function (res) {
//   asyncReq.next(res)
// }, function (err) {
//   asyncReq.throw(err)
// })



// // --------------------------------------------------------------------------
// // 解构
// // 对象无声明赋值
// // https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Operators/Destructuring_assignment#%E6%97%A0%E5%A3%B0%E6%98%8E%E8%B5%8B%E5%80%BC
// // 赋值语句周围的圆括号 ( ... ) 在使用对象字面量无声明解构赋值时是必须的。
// // {a, b} = {a: 1, b: 2} 不是有效的独立语法，因为左边的 {a, b} 被认为是一个块而不是对象字面量。
// // 然而，({a, b} = {a: 1, b: 2}) 是有效的，正如 var {a, b} = {a: 1, b: 2}
// // 你的 ( ... ) 表达式之前需要有一个分号，否则它可能会被当成上一行中的函数执行。

// var a, b;
// ({ a, b } = { a: 1, b: 2 })
// console.log(a, b)



// // 类型判断
// var class2type = {};

// "Boolean Number String Function Array Date RegExp Object Error".split(" ").map(function (item, index) {
//   class2type["[object " + item + "]"] = item.toLowerCase();
// })

// function type (obj) {
//   // 在 IE6 中，null 和 undefined 会被 Object.prototype.toString 识别成 [object Object]
//   if (obj == null) {
//     return obj + "";
//   }
//   return typeof obj === "object" || typeof obj === "function" ?
//     class2type[Object.prototype.toString.call(obj)] || "object" :
//     typeof obj;
// }


// // 判断空对象
// function isEmptyObject (obj) {
//   var name;
//   for (name in obj) {
//     return false;
//   }
//   return true;
// }

// function isEmptyObject (obj) {
//   return ({}).toString.call(obj) === '[object Object]' && Object.keys(obj).length === 0
// }

// // 判断是否是 Window 对象
// function isWindow (obj) {
//   return obj != null && obj === obj.window
// }


// // 判断是不是 DOM 元素
// function isElement (obj) {
//   return !!(obj && obj.nodeType === 1)
// }

// // 判断是不是类数组
// function isArrayLike (o) {
//   if (o && // o is not null, undefined, etc
//     // o is an object
//     typeof o === "object" &&
//     // o.length is a finite number
//     isFinite(o.length) &&
//     // o.length is non-negative
//     o.length >= 0 &&
//     // o.length is an integer
//     o.length === Math.floor(o.length) &&
//     // o.length < 2^32
//     o.length < 4294967296) //数组的上限值
//     return true;
//   else
//     return false;
// }


// // 通用遍历方法，return false终止循环
// function each (obj, callback) {
//   var length, i = 0;
//   if (isArrayLike(obj)) {
//     length = obj.length;
//     for (; i < length; i++) {
//       if (callback.call(obj[i], i, obj[i]) === false) {
//         break
//       }
//     }
//   } else {
//     for (i in obj) {
//       if (callback.call(obj[i], i, obj[i]) === false) {
//         break
//       }
//     }
//   }
//   return obj
// }

// /**
//  * 深拷贝
//  * @param {*} obj 拷贝对象(object or array)
//  * @param {*} cache 缓存数组
//  */
// function deepCopy (obj, cache = []) {
//   if (obj === null || typeof obj !== 'object') {
//     return obj
//   }
//   // 解决循环引用
//   const hit = cache.filter(c => c.original === obj)[0]
//   if (hit) {
//     return hit.copy
//   }

//   const copy = Array.isArray(obj) ? [] : {}
//   // 将copy首先放入cache, 因为我们需要在递归deepCopy的时候引用它
//   cache.push({
//     original: obj,
//     copy
//   })
//   Object.keys(obj).forEach(key => {
//     copy[key] = deepCopy(obj[key], cache)
//   })

//   return copy
// }


// // 数组乱序
// function shuffle (arr) {
//   for (var i = arr.length; i; i--) {
//     var j = Math.floor(Math.random() * i);
//     [arr[i - 1], arr[j]] = [arr[j], arr[i - 1]]
//   }
//   return arr
// }
// function shuffle (arr) {
//   var r = []
//   while (arr.length) {
//     r.push(arr.splice(~~(Math.random() * arr.length), 1)[0])
//   }
//   return r
// }


// // 冒泡排序
// function bubble (a) {
//   var arr = a.slice()
//   for (var i = arr.length; i; i--) {
//     for (var j = 0; j < i; j++) {
//       if (arr[j] > arr[j + 1]) {
//         [arr[j], arr[j + 1]] = [arr[j + 1], arr[j]]
//       }
//     }
//   }
//   return arr
// }

// // 插入排序
// function insertionSort (a) {
//   var arr = a.slice()
//   for (var i = 1; i < arr.length; i++) {
//     var temp = arr[i]
//     for (var j = i - 1; j >= 0; j--) {
//       if (temp < arr[j]) {
//         arr[j + 1] = arr[j]
//       } else {
//         break
//       }
//     }
//     arr[j + 1] = temp
//   }
//   return arr
// }


// // 快速排序
// function quickSort (a) {
//   var arr = a.slice()
//   if (arr.length <= 1) return arr

//   var pivotIndex = Math.floor(arr.length / 2);
//   var pivot = arr.splice(pivotIndex, 1)[0];

//   var left = []
//   var right = []

//   for (var i = 0; i < arr.length; i++) {
//     if (arr[i] > pivot) {
//       right.push(arr[i])
//     } else {
//       left.push(arr[i])
//     }
//   }

//   return quickSort(left).concat([pivot], quickSort(right))
// }

// function quickSort (a) {
//   var arr = a.slice()
//   return (_ = (arr, left, right) => {
//     if (left >= right) return
//     var l = left
//     var r = right
//     var flag = left
//     while (l < r) {
//       while (arr[r] >= arr[flag] && r > flag) r--
//       if (l >= r) break
//       while (arr[l] <= arr[flag] && l < r) l++;
//       [arr[flag], arr[r], arr[l]] = [arr[r], arr[l], arr[flag]]
//       flag = l
//     }
//     _(arr, left, flag - 1)
//     _(arr, flag + 1, right)
//     return arr
//   })(arr, 0, arr.length - 1)
// }

// function quickSort (a) {
//   var arr = a.slice()
//   return (_ = (arr, left, right) => {
//     var list = [[left, right]]
//     while (list.length > 0) {
//       var now = list.pop()
//       if (now[0] >= now[1]) continue

//       var l = now[0]
//       var r = now[1]
//       var flag = now[0]
//       while (l < r) {
//         while (arr[r] >= arr[flag] && r > flag) r--
//         if (l >= r) break
//         while (arr[l] <= arr[flag] && l < r) l++;
//         [arr[flag], arr[r], arr[l]] = [arr[r], arr[l], arr[flag]]
//         flag = l
//       }
//       list.push([now[0], flag - 1])
//       list.push([flag + 1, now[1]])
//     }
//     return arr
//   })(arr, 0, arr.length - 1)
// }


// // 回调函数promisify
// // function promisify(original) {
// return function (...args) {
//   return new Promise((resolve, reject) => {
//     args.push(function callback (err, ...values) {
//       if (err) {
//         return reject(err);
//       }
//       return resolve(...values)
//     });
//     original.call(this, ...args);
//   });
// };


// // 模块加载
// (function (modules) {
//   // 用于储存已经加载过的模块
//   var installedModules = {};
//   function require (moduleName) {
//     if (installedModules[moduleName]) {
//       return installedModules[moduleName].exports;
//     }
//     var module = installedModules[moduleName] = {
//       exports: {}
//     };
//     modules[moduleName](module, module.exports, require);
//     return module.exports;
//   }
//   // 加载主模块
//   return require("main");
// })({
//   "main": function (module, exports, require) {
//     var addModule = require("./add");
//     console.log(addModule.add(1, 1))
//     var squareModule = require("./square");
//     console.log(squareModule.square(3));
//   },
//   "./add": function (module, exports, require) {
//     console.log('加载了 add 模块');
//     module.exports = {
//       add: function (x, y) {
//         return x + y;
//       }
//     };
//   },
//   "./square": function (module, exports, require) {
//     console.log('加载了 square 模块');
//     var multiply = require("./multiply");
//     module.exports = {
//       square: function (num) {
//         return multiply.multiply(num, num);
//       }
//     };
//   },
//   "./multiply": function (module, exports, require) {
//     console.log('加载了 multiply 模块');
//     module.exports = {
//       multiply: function (x, y) {
//         return x * y;
//       }
//     };
//   }
// })



// // 无极限函数
// const foo = (fn, ...arg1) => (...arg2) => arg2.length ? foo(fn, ...arg1, ...arg2) : arg1.reduce((pre, cur) => fn(pre, cur))

// const operator = foo(add)

// function add (x, y) {
//   if (isNaN(+x)) {
//     x = 0;
//   }
//   if (isNaN(+y)) {
//     y = 0;
//   }
//   return x + y;
// }

// console.log(operator(1)(2)(3)(4));
// console.log(operator(1)(2)(3)(4)());
// console.log(operator(1)(3)(3)(3)(4)());



// // 双向绑定、依赖收集原理
// function observe (obj) {
//   // 判断类型
//   if (!obj || typeof obj !== 'object') {
//     return
//   }
//   Object.keys(obj).forEach(key => {
//     defineReactive(obj, key, obj[key])
//   })
// }

// function defineReactive (obj, key, val) {
//   // 递归子属性
//   observe(val)
//   const dp = new Dep()
//   Object.defineProperty(obj, key, {
//     enumerable: true,
//     configurable: true,
//     get: function reactiveGetter () {
//       console.log('get value', val)
//       if (Dep.target) { // 依赖收集
//         dp.addSub(Dep.target)
//       }
//       return val
//     },
//     set: function reactiveSetter (newVal) {
//       console.log('change value', newVal)
//       val = newVal
//       dp.notify()
//     }
//   })
// }

// class Dep {
//   constructor() {
//     this.sub = []
//   }
//   addSub (sub) {
//     this.sub.push(sub)
//   }
//   notify () {
//     this.sub.map(sub => sub.update())
//   }
// }

// Dep.target = null

// class Watcher {
//   constructor(obj, key, cb) {
//     Dep.target = this

//     this.obj = obj
//     this.key = key
//     this.cb = cb
//     this.value = obj[key] // 依赖收集
//     Dep.target = null
//   }
//   update () {
//     this.value = this.obj[this.key]
//     this.cb(this.value)
//   }
// }

// var data = { name: 'yyy' }
// observe(data)

// function update (value) {
//   console.log(`<div>${value}</div>`);
// }

// // 模拟解析到 `{{name}}` 触发的操作
// new Watcher(data, 'name', update)

// // update Dom innerText
// data.name = 'dgggg'

// class Element {
//   constructor(tagName, attrs, child) {
//     this.tagName = tagName
//     this.attrs = attrs
//     this.child = child
//   }
//   render () {
//     const dom = document.createElement(this.tagName)
//     for (let [key, value] of Object.entries(this.attrs)) {
//       dom.setAttribute(key, value)
//     }
//     this.child.map(i => {
//       if (i instanceof Element) {
//         dom.append(i.render())
//       } else {
//         dom.innerText = i
//       }
//     })
//     return dom
//   }
// }

// function el (...arg) {
//   return new Element(...arg)
// }

// console.log(el('ul', { id: 'list' }, [
//   el('li', { class: 'item' }, ['Item1']),
//   el('li', { class: 'item' }, ['Item2']),
//   el('li', { class: 'item' }, ['Item3'])
// ]).render())
