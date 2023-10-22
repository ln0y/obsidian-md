---
aliases: ['未命名实现']
tags: ['JavaScript/byhand', 'date/2023-10', 'year/2023', 'month/10']
date: 2023-10-21-星期六 21:12:52
update: 2023-10-21-星期六 21:13:03
---

```js
function throttle(fn, wait, immediately = false) {
  let timer = null
  return function () {
    if (!timer) {
      if (immediately) fn.apply(this, arguments)
      timer = setTimeout(() => {
        fn.apply(this, arguments)
        timer = null
      }, wait)
    }
  }
}
```
