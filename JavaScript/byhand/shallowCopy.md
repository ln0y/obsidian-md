---
aliases: ['浅拷贝实现']
tags: ['JavaScript/byhand','date/2022-02','year/2022','month/02']
date: 2022-02-25-Friday 15:39:43
update: 2022-02-25-Friday 15:40:37
---

```js
const shallowCopy = (target) => {
  // 区分基础类型与引用类型
  if (typeof target === 'object' && target !== null) {
    // 区分数组与对象
    const cloneTarget = Array.isArray(target) ? [] : {}
    for (let prop in target) {
      // 不拷贝原型属性
      if (target.hasOwnProperty(prop)) {
        cloneTarget[prop] = target[prop]
      }
    }
    return cloneTarget
  } else {
    return target
  }
}
```
