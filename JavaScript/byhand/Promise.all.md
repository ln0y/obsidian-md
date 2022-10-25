---
aliases: ['Promise.all实现']
tags: ['js/Promise','JavaScript/byhand','date/2022-04','year/2022','month/04']
date: 2022-04-07-Thursday 16:15:51
update: 2022-04-07-Thursday 16:27:36
---

```js
Promise.all = function (_promises) {
  return new Promise((resolve, reject) => {
    // 入参是Iterable，转化成数组统一处理 Iterable => Array
    const promises = Array.from(_promises)
    const res = []
    const len = promises.length
    let n = 0
    // 如果promises长度为0，则resolve
    if (!len) resolve(res)
    promises.forEach((p, i) => {
      // Promise.resolve 确保把所有数据都转化为 Promise
      Promise.resolve(p).then(r => {
        // 因为 promise 是异步的，保持数组一一对应
        res[i] = r
        // 如果数组中所有 promise 都完成，则返回结果数组
        if (++n === len) resolve(res)
      }).catch(reject) // 当发生异常时，直接 reject
    })
  })
}
```

https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Promise/all
