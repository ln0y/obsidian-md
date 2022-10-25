---
aliases: ['call实现']
tags: ['JavaScript/byhand','date/2022-02','year/2022','month/02']
date: 2022-02-26-Saturday 16:49:58
update: 2022-02-26-Saturday 16:55:36
---

```js
// es6
Function.prototype._call = function (context, ...args) {
  context = context || (typeof window !== 'undefined' ? window : global)

  const fn = Symbol()
  context[fn] = this

  const result = context[fn](...args)

  Reflect.deleteProperty(context, fn)
  return result
}
// es5
Function.prototype._call = function (context) {
  context = context || (typeof window !== 'undefined' ? window : global)

  var args = []
  for (var i = 1; i < arguments.length; i++) {
    args.push('arguments[' + i + ']')
  }

  context.fn = this
  var result = eval('context.fn(' + args + ')')

  delete context.fn
  return result
}
```
