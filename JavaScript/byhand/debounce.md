---
aliases: ['未命名实现']
tags: ['JavaScript/byhand', 'date/2023-10', 'year/2023', 'month/10']
date: 2023-10-21-星期六 21:13:16
update: 2023-10-21-星期六 21:13:27
---

```js
function debounce(fn, wait, immediately = false) {
  let timer = null
  return function () {
    clearTimeout(timer)
    const call = immediately && !timer
    timer = setTimeout(() => {
      timer = null
      if (!immediately) {
        fn.apply(this, arguments)
      }
    }, wait)
    if (call) fn.apply(this, arguments)
  }
}
```
