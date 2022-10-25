---
aliases: ['array/push实现']
tags: ['JavaScript/byhand','date/2022-03','year/2022','month/03']
date: 2022-03-01-Tuesday 17:28:47
update: 2022-03-01-Tuesday 17:29:18
---

```js
Array.prototype.push = function(...items) {
  let O = Object(this);  // ecma 中提到的先转换为对象
  let len = this.length >>> 0;
  let argCount = items.length >>> 0;
  // 2 ^ 53 - 1 为JS能表示的最大正整数
  if (len + argCount > 2 ** 53 - 1) {
    throw new TypeError("The number of array is over the max value")
  }
  for(let i = 0; i < argCount; i++) {
    O[len + i] = items[i];
  }
  let newLength = len + argCount;
  O.length = newLength;
  return newLength;
}
```
