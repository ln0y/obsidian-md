---
aliases: ['Promise.allSettled实现']
tags: ['js/Promise','JavaScript/byhand','date/2022-04','year/2022','month/04']
date: 2022-04-07-Thursday 17:14:33
update: 2022-04-08-Friday 10:10:39
---

```js
Promise.allSettled = function (_promises) {
  return new Promise((resolve, reject) => {
    // 入参是Iterable，转化成数组统一处理 Iterable => Array
    const promises = Array.from(_promises)
    const len = promises.length
    const res = []
    let n = 0

    // 如果promises长度为0，则resolve
    if (!len) resolve(res)

    function processResult (result, index, status) {
      res[index] = {
        status,
        // fulfilled 返回value字段， rejected 返回reason字段
        [status === 'fulfilled' ? 'value' : 'reason']: result
      }
      if (++n === len) resolve(res)
    }

    promises.forEach((p, i) => {
      // Promise.resolve 确保把所有数据都转化为 Promise
      Promise.resolve(p)
        .then(res => processResult(res, i, 'fulfilled'))
        .catch(err => processResult(err, i, 'rejected'))
    })
  })
}
```

```js
Promise.allSettled = promises =>
  Promise.all(Array.from(promises, p => Promise.resolve(p)
    .then(v => ({
      status: 'fulfilled',
      value: v
    })).catch(e => ({
      status: 'rejected',
      reason: e
    }))
  ))
```

https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Promise/allSettled
