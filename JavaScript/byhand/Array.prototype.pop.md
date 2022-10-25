---
aliases: ['array/pop实现']
tags: ['JavaScript/byhand','date/2022-03','year/2022','month/03']
date: 2022-03-01-Tuesday 17:29:41
update: 2022-03-01-Tuesday 17:30:08
---

```js
Array.prototype.pop = function() {
  let O = Object(this);
  let len = this.length >>> 0;
  if (len === 0) {
    O.length = 0;
    return undefined;
  }
  len --;
  let value = O[len];
  delete O[len];
  O.length = len;
  return value;
}
```
