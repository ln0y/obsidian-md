---
aliases: ['intersection实现','数组交集']
tags: ['JavaScript/byhand','date/2022-05','year/2022','month/05']
date: 2022-05-11-Wednesday 17:38:08
update: 2022-05-11-Wednesday 17:43:17
---

```js
function intersection(...args) {
  if (!args.length) return []
  if (args.length === 1) return args[0]
  return args.reduce((result, arg) => {
    return result.filter(item => arg.includes(item))
  })
}
```
