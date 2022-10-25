---
aliases: ['插入排序']
tags: ['algorithm/sort','date/2022-02','year/2022','month/02']
date: 2022-02-28-Monday 19:21:41
update: 2022-03-01-Tuesday 16:02:44
---

插入排序的思路是基于数组本身进行调整的，首先循环遍历从 i 等于 1 开始，拿到当前的 current 的值，去和前面的值比较，如果前面的大于当前的值，就把前面的值和当前的那个值进行交换，通过这样不断循环达到了排序的目的。

```js
function insertionSort (arr) {
  for (var i = 1; i < arr.length; i++) {
    var current = arr[i]
    for (var j = i - 1; j >= 0; j--) {
      if (current < arr[j]) {
        arr[j + 1] = arr[j]
      } else break
    }
    arr[j + 1] = current
  }
  return arr
}
```

稳定性：稳定

复杂度分析：

- 时间复杂度：$O(n^2)$
- 空间复杂度：$O(1)$
