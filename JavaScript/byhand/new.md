---
aliases: ['new实现']
tags: ['JavaScript/byhand','date/2022-02','year/2022','month/02']
date: 2022-02-26-Saturday 14:54:34
update: 2022-02-26-Saturday 15:02:52
---

```js
function _new () {
  const [constructor, ...arg] = [...arguments]

  if (typeof constructor !== 'function') {
    throw 'constructor must be a function'
  }

  // const target = {}

  // 设置构造函数原型方法1
  // target.__proto__ = constructor.prototype

  // 设置构造函数原型方法2
  // Object.setPrototypeOf(target, constructor.prototype)

  // 设置构造函数原型方法3
  const target = Object.create(constructor.prototype)

  // 执行构造函数方法，属性和方法被添加到this引用的对象中
  const result = constructor.apply(target, arg)
  // 如果构造函数中返回对象、数组和函数，则返回该结果
  return result instanceof Object ? result : target
}
```
