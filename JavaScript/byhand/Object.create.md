---
aliases: ['Object.create实现']
tags: ['JavaScript/byhand','date/2022-02','year/2022','month/02']
date: 2022-02-25-Friday 18:06:54
update: 2022-04-09-Saturday 15:45:32
---

```js
function createObj (o) {
  if (o === null) return Object.setPrototypeOf({}, o) // 单独模拟Object.create(null)
  function F () { }
  F.prototype = o
  return new F()
}
```
