---
aliases: ['深拷贝实现']
tags: ['JavaScript/byhand','date/2022-02','year/2022','month/02']
date: 2022-02-25-Friday 17:03:01
update: 2022-02-25-Friday 17:04:44
---

```js
const isComplexDataType = obj => (typeof obj === 'object' || typeof obj === 'function') && (obj !== null)
const deepCopy = function (obj, hash = new WeakMap()) {
  if (obj.constructor === Date)
    return new Date(obj)       // 日期对象直接返回一个新的日期对象
  if (obj.constructor === RegExp)
    return new RegExp(obj)     //正则对象直接返回一个新的正则对象
  //如果循环引用了就用 weakMap 来解决
  if (hash.has(obj)) return hash.get(obj)
  let allDesc = Object.getOwnPropertyDescriptors(obj)
  //遍历传入参数所有键的特性
  let cloneObj = Object.create(Object.getPrototypeOf(obj), allDesc)
  //继承原型链
  hash.set(obj, cloneObj)
  for (let key of Reflect.ownKeys(obj)) {
    cloneObj[key] = (isComplexDataType(obj[key]) && typeof obj[key] !== 'function') ? deepCopy(obj[key], hash) : obj[key]
  }
  return cloneObj
}

function deepCopy(obj, cache = []) {
  if (obj === null || typeof obj !== 'object') {
    return obj
  }
  // 解决循环引用
  const hit = cache.filter((c) => c.original === obj)[0]
  if (hit) {
    return hit.copy
  }

  const copy = Array.isArray(obj) ? [] : {}
  // 将copy首先放入cache, 因为我们需要在递归deepCopy的时候引用它
  cache.push({
    original: obj,
    copy,
  })
  Object.keys(obj).forEach((key) => {
    copy[key] = deepCopy(obj[key], cache)
  })

  return copy
}

function deepCopy(obj, map = new WeakMap()) {
  if (obj === null || typeof obj !== 'object') {
    return obj
  }

  if (map.has(obj)) {
    return map.get(obj)
  }

  const res = Array.isArray(obj) ? [] : {}

  map.set(obj, res)

  for (let key in obj) {
    if (Object.hasOwn(obj, key)) {
      res[key] = deepCopy(obj[key], map)
    }
  }

  return res
}

```
