---
aliases: ['apply实现']
tags: ['JavaScript/byhand','date/2022-02','year/2022','month/02']
date: 2022-02-26-Saturday 16:24:52
update: 2022-02-26-Saturday 16:30:06
---

```js
// es6
Function.prototype._apply = function (context, args) {
  context = context || (typeof window !== 'undefined' ? window : global)

  const fn = Symbol()
  context[fn] = this

  const result = context[fn](...(args || []))

  Reflect.deleteProperty(context, fn)
  return result
}
// es5
Function.prototype._apply = function (context, args) {
  context = context || (typeof window !== 'undefined' ? window : global)
  context.fn = this

  var result
  if (args) {
    var arg = []
    for (var i = 0; i < args.length; i++) {
      arg.push('args[' + i + ']')
    }
    result = eval('context.fn(' + arg + ')')
  } else {
    result = context.fn()
  }

  delete context.fn
  return result
}
```
