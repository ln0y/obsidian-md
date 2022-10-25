---
aliases: []
tags: ['leetcode/393','algorithm/leetcode','date/2022-03','year/2022','month/03']
date: 2022-03-13-Sunday 15:18:27
update: 2022-03-13-Sunday 15:21:01
---

leetcode:  [393. UTF-8 编码验证](https://leetcode-cn.com/problems/utf-8-validation/)

UTF-8 中的一个字符可能的长度为 1 到 4 字节，遵循以下的规则：

1. 对于 1 字节 的字符，字节的第一位设为 0 ，后面 7 位为这个符号的 unicode 码。
2. 对于 n 字节 的字符 (n > 1)，第一个字节的前 n 位都设为1，第 n+1 位设为 0 ，后面字节的前两位一律设为 10 。剩下的没有提及的二进制位，全部为这个符号的 unicode 码。

这是 UTF-8 编码的工作方式：

```plain
   Char. number range  |        UTF-8 octet sequence
      (hexadecimal)    |              (binary)
   --------------------+---------------------------------------------
   0000 0000-0000 007F | 0xxxxxxx
   0000 0080-0000 07FF | 110xxxxx 10xxxxxx
   0000 0800-0000 FFFF | 1110xxxx 10xxxxxx 10xxxxxx
   0001 0000-0010 FFFF | 11110xxx 10xxxxxx 10xxxxxx 10xxxxxx
```

```ts
function validUtf8 (data: number[]): boolean {
  let n = 0
  for (let i = 0; i < data.length; i++) {
    if (n > 0) {
      // 校验n字节字符的后几位
      if (data[i] >>> 6 !== 0b10) return false
      n--
    } else if (data[i] >>> 7 === 0) { // 1字节字符
      n = 0
    } else if (data[i] >>> 5 === 0b110) { // 2字节字符
      n = 1
    } else if (data[i] >>> 4 === 0b1110) { // 3字节字符
      n = 2
    } else if (data[i] >>> 3 === 0b11110) { // 4字节字符
      n = 3
    } else {
      return false
    }
  }
  return n === 0
}
```

- 时间复杂度：$O(n)$
- 空间复杂度：$O(1)$
