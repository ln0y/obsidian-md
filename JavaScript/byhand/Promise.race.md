---
aliases: ['Promise.race实现']
tags: ['js/Promise','JavaScript/byhand','date/2022-04','year/2022','month/04']
date: 2022-04-07-Thursday 16:24:35
update: 2022-04-07-Thursday 17:13:21
---

```js
Promise.race = function (_promises) {
  return new Promise((resolve, reject) => {
    // 入参是Iterable，转化成数组统一处理 Iterable => Array
    const promises = Array.from(_promises)
    // 如果传的迭代是空的，则返回的 promise 将永远padding。
    for (const p of promises) {
      // Promise.resolve 确保把所有数据都转化为 Promise
      Promise.resolve(p).then(resolve).catch(reject)
    }
  })
}
```

```js
Promise.race = promises => new Promise((resolve, reject) =>
  Array.from(promises, p =>
    Promise.resolve(p).then(resolve).catch(reject)))
```

https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Promise/race
