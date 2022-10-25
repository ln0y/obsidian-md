---
aliases: ['bind实现','Function.prototype.bind']
tags: ['JavaScript/byhand','date/2022-02','year/2022','month/02']
date: 2022-02-26-Saturday 17:03:07
update: 2022-02-26-Saturday 17:06:27
---

```js
Function.prototype._bind = function (context, ...args) {
  if (typeof this !== "function") {
    throw new Error("this must be a function")
  }
  const self = this
  const fBound = function (...args2) {
    return self.apply(
      this instanceof fBound ? this : context, // 做为构造函数时修改this指向实例
      args.concat(args2)
    )
  }
  fBound.prototype = Object.create(this.prototype)
  return fBound
}

// 不考虑做为构造函数
Function.prototype._bind = function (context, ...args) {
  return (...arg) => this.apply(context, [...args, ...arg])
}
```
