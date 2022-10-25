---
aliases: ['选择排序']
tags: ['algorithm/sort','date/2022-02','year/2022','month/02']
date: 2022-02-28-Monday 19:27:37
update: 2022-03-01-Tuesday 16:08:56
---

选择排序是一种简单直观的排序算法。它的工作原理是，首先将最小的元素存放在序列的起始位置，再从剩余未排序元素中继续寻找最小元素，然后放到已排序的序列后面……以此类推，直到所有元素均排序完毕。该排序是**表现最稳定的排序算法之一，因为无论什么数据进去都是 $O(n^2)$ 的时间复杂度**，所以用到它的时候，数据规模越小越好。

```js
function selectSort (array) {
  const len = array.length
  let minIndex
  for (let i = 0; i < len - 1; i++) {
    minIndex = i
    for (let j = i + 1; j < len; j++) {
      if (array[j] <= array[minIndex]) {
        minIndex = j
      }
    }
    [array[i],array[minIndex]] = [array[minIndex],array[i]]
  }
  return array
}
```

稳定性：不稳定

复杂度分析：

- 时间复杂度：$O(n^2)$
- 空间复杂度：$O(1)$
