---
aliases: ['Promise.any实现']
tags: ['js/Promise','JavaScript/byhand','date/2022-04','year/2022','month/04']
date: 2022-04-07-Thursday 16:35:38
update: 2022-04-08-Friday 11:34:22
---

```js
Promise.any = function (_promises) {
  return new Promise((resolve, reject) => {
    // 入参是Iterable，转化成数组统一处理 Iterable => Array
    const promises = Array.from(_promises)
    const len = promises.length
    const res = []
    let n = 0
    // 如果 promises 长度为0，则reject
    if (!len) reject(new AggregateError(res, 'All promises were rejected'))
    for (const p of promises) {
      // Promise.resolve 确保把所有数据都转化为 Promise
      Promise.resolve(p)
        .then(resolve) // 当有一个 promise 成功时，返回结果
        .catch(err => {
          res.push(err) // 搜集错误用 AggregateError 返回
          // 如果所有传入的 promises 都失败, Promise.any 返回一个 AggregateError 对象
          if (++n === len) reject(new AggregateError(res, 'All promises were rejected'))
        })
    }
  })
}
```

```js
Promise.any = promises => new Promise((resolve, reject) =>
  Array.from(promises).length ?
    Promise.all(Array.from(promises, p =>
      Promise.resolve(p).then(resolve).catch(e => e)))
      .then(res => reject(new AggregateError(res, 'All promises were rejected')))
    : reject(new AggregateError([], 'All promises were rejected')))
```

https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Promise/any
