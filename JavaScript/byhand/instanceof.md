---
aliases: ['instanceof实现']
tags: ['js/instanceof','JavaScript/byhand','date/2022-02','year/2022','month/02']
date: 2022-02-24-Thursday 17:43:48
update: 2022-02-24-Thursday 17:44:41
---

```js
function myInstanceof (left, right) {
  // 这里先用typeof来判断基础数据类型，如果是，直接返回false
  if (typeof left !== 'object' || left === null) return false
  // getProtypeOf是Object对象自带的API，能够拿到参数的原型对象
  let proto = Object.getPrototypeOf(left)
  while (true) { // 循环往下寻找，直到找到相同的原型对象
    if (proto === null) return false
    if (proto === right.prototype) return true // 找到相同原型对象，返回true
    proto = Object.getPrototypeof(proto)
  }
}

console.log(myInstanceof(new Number(123), Number)) // true
console.log(myInstanceof(123, Number)) // false
```
