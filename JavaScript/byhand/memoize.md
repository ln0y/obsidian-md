---
aliases: ['记忆函数']
tags: ['JavaScript/byhand','date/2023-01','year/2023','month/01']
date: 2023-01-13-星期五 11:23:54
update: 2023-01-13-星期五 11:24:05
---

```js
function memoize(func, resolver) {
  if (
    typeof func != 'function' ||
    (resolver != null && typeof resolver != 'function')
  ) {
    throw new TypeError('Expected a function')
  }
  const memoized = function () {
    const args = arguments
    const key = resolver ? resolver.apply(this, args) : args[0]
    const cache = memoized.cache
    if (cache.has(key)) {
      return cache.get(key)
    }
    const result = func.apply(this, args)
    memoized.cache = cache.set(key, result) || cache
    return result
  }
  memoized.cache = new Map()
  return memoized
}
```
