---
aliases: ['compose实现']
tags: ['JavaScript/byhand','date/2022-05','year/2022','month/05']
date: 2022-05-15-Sunday 22:21:38
update: 2022-05-15-Sunday 22:21:39
---

```js
// compose 组合函数
const compose = (...funcs) =>
  funcs.length === 0
    ? arg => arg
    : funcs.length === 1
      ? funcs[0]
      : funcs.reduce((a, b) => (...args) => a(b(...args)))
```
