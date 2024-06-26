---
aliases: ['uuid实现']
tags: ['JavaScript/byhand','date/2022-04','year/2022','month/04']
date: 2022-04-01-Friday 22:55:59
update: 2022-04-01-Friday 22:56:12
---

```js
// Generate four random hex digits.
function S4 () {
  return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1)
}
// Generate a pseudo-GUID by concatenating random hexadecimal.
function guid () {
  return (S4() + S4() + "-" + S4() + "-" + S4() + "-" + S4() + "-" + S4() + S4() + S4())
}
```


```js
function uuid () {
  var s = []
  var hexDigits = "0123456789abcdef"
  for (var i = 0; i < 36; i++) {
    s[i] = hexDigits.substr(Math.floor(Math.random() * 0x10), 1)
  }
  s[14] = "4"  // bits 12-15 of the time_hi_and_version field to 0010
  s[19] = hexDigits.substr((s[19] & 0x3) | 0x8, 1)  // bits 6-7 of the clock_seq_hi_and_reserved to 01
  s[8] = s[13] = s[18] = s[23] = "-"

  var uuid = s.join("")
  return uuid
}
```

```js
function guid () {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8)
    return v.toString(16)
  })
}
```
