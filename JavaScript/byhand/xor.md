---
aliases: ['xor实现','数组异或']
tags: ['JavaScript/byhand','date/2022-05','year/2022','month/05']
date: 2022-05-11-Wednesday 18:10:56
update: 2022-05-11-Wednesday 18:12:13
---

```js
function xor(...args) {
  if (!args.length) return []
  if (args.length === 1) return args[0]
  return [].concat(...args).filter((item, _, arr) => {
    return arr.indexOf(item) === arr.lastIndexOf(item)
  })
}
```
