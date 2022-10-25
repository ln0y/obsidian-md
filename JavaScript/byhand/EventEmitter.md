---
aliases: ['EventEmitter实现']
tags: ['JavaScript/byhand','date/2022-03','year/2022','month/03']
date: 2022-03-03-Thursday 16:32:23
update: 2022-03-03-Thursday 16:42:36
---

```js
class EventEmitter {
  static VERSION = '1.0.0'

  constructor () {
    this.__events = {}
  }

  on (eventName, listener) {
    if (!eventName || !listener) return
    // 判断回调的 listener 是否为函数
    if (!isValidListener(listener)) {
      throw new TypeError('listener must be a function')
    }
    var events = this.__events
    var listeners = events[eventName] = events[eventName] || []
    var listenerIsWrapped = typeof listener === 'object'
    // 不重复添加事件，判断是否有一样的
    if (indexOf(listeners, listener) === -1) {
      listeners.push(listenerIsWrapped ? listener : {
        listener: listener,
        once: false
      })
    }
    return this
  }

  emit (eventName, args) {
    // 直接通过内部对象获取对应自定义事件的回调函数
    var listeners = this.__events[eventName]
    if (!listeners) return
    // 需要考虑多个 listener 的情况
    for (var i = 0; i < listeners.length; i++) {
      var listener = listeners[i]
      if (listener) {
        listener.listener.apply(this, args || [])
        // 给 listener 中 once 为 true 的进行特殊处理
        if (listener.once) {
          this.off(eventName, listener.listener)
        }
      }
    }
    return this
  }

  off (eventName, listener) {
    var listeners = this.__events[eventName]
    if (!listeners) return
    var index
    for (var i = 0, len = listeners.length; i < len; i++) {
      if (listeners[i] && listeners[i].listener === listener) {
        index = i
        break
      }
    }
    // off 的关键
    if (typeof index !== 'undefined') {
      listeners.splice(index, 1, null)
    }
    return this
  }

  once (eventName, listener) {
    // 直接调用 on 方法，once 参数传入 true，待执行之后进行 once 处理
    return this.on(eventName, {
      listener: listener,
      once: true
    })
  }

  allOff (eventName) {
    // 如果该 eventName 存在，则将其对应的 listeners 的数组直接清空
    if (eventName && this.__events[eventName]) {
      this.__events[eventName] = []
    } else {
      this.__events = {}
    }
  }
}
// 判断是否是合法的 listener
function isValidListener (listener) {
  if (typeof listener === 'function') {
    return true
  } else if (listener && typeof listener === 'object') {
    return isValidListener(listener.listener)
  } else {
    return false
  }
}
// 顾名思义，判断新增自定义事件是否存在
function indexOf (array, item) {
  var result = -1
  item = typeof item === 'object' ? item.listener : item
  for (var i = 0, len = array.length; i < len; i++) {
    if (array[i].listener === item) {
      result = i
      break
    }
  }
  return result
}
```
