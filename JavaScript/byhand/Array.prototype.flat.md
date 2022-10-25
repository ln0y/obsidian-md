---
aliases: ['flat实现']
tags: ['JavaScript/byhand','date/2022-05','year/2022','month/05']
date: 2022-05-12-Thursday 12:37:29
update: 2022-05-12-Thursday 12:37:38
---

```js
function flat(arr, deep = 1) {
  const result = []
  arr.forEach(item => {
    if (Array.isArray(item) && deep > 0) {
      result.push(...flat(item, deep - 1))
    } else {
      result.push(item)
    }
  })

  return result
}

function flat(arr) {
  const ans = []
  while (arr.length > 0) {
    const temp = arr.shift()
    if (Array.isArray(temp)) arr.unshift(...temp)
    else ans.push(temp)
  }
  return ans
}
```
