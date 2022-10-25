---
aliases: ['array/reduce实现']
tags: ['JavaScript/byhand','date/2022-03','year/2022','month/03']
date: 2022-03-01-Tuesday 17:31:49
update: 2022-03-01-Tuesday 17:32:35
---

```js
Array.prototype.reduce  = function(callbackfn, initialValue) {
  // 异常处理，和 map 类似
  if (this === null || this === undefined) {
    throw new TypeError("Cannot read property 'reduce' of null");
  }
  // 处理回调类型异常
  if (Object.prototype.toString.call(callbackfn) != "[object Function]") {
    throw new TypeError(callbackfn + ' is not a function')
  }
  let O = Object(this);
  let len = O.length >>> 0;
  let k = 0;
  let accumulator = initialValue;  // reduce方法第二个参数作为累加器的初始值
  if (accumulator === undefined) {  
      throw new Error('Each element of the array is empty');
      // 初始值不传的处理
    for(; k < len ; k++) {
      if (k in O) {
        accumulator = O[k];
        k++;
        break;
      }
    }
  }
  for(;k < len; k++) {
    if (k in O) {
      // 注意 reduce 的核心累加器
      accumulator = callbackfn.call(undefined, accumulator, O[k], O);
    }
  }
  return accumulator;
}
```
