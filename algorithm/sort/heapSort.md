---
aliases: ['堆排序']
tags: ['algorithm/sort','date/2022-03','year/2022','month/03']
date: 2022-03-01-Tuesday 13:48:43
update: 2022-03-01-Tuesday 16:14:46
---

堆排序是指利用堆这种数据结构所设计的一种排序算法。堆积是一个近似完全二叉树的结构，并同时满足堆积的性质，即子结点的键值或索引总是小于（或者大于）它的父节点。堆的底层实际上就是一棵完全二叉树，可以用数组实现。

根节点最大的堆叫作大根堆，根节点最小的堆叫作小根堆，你可以根据从大到小排序或者从小到大来排序，分别建立对应的堆就可以。

```js
function heapSort (arr) {
  var len = arr.length
  var k = 0
  function swap (i, j) {
    [arr[i], arr[j]] = [arr[j], arr[i]]
  }
  function maxHeapify (start, end) {
    var dad = start
    var son = dad * 2 + 1
    if (son >= end) return
    if (son + 1 < end && arr[son] < arr[son + 1]) {
      son++
    }
    if (arr[dad] <= arr[son]) {
      swap(dad, son)
      maxHeapify(son, end)
    }
  }
  for (var i = Math.floor(len / 2) - 1; i >= 0; i--) {
    maxHeapify(i, len)
  }

  for (var j = len - 1; j > k; j--) {
    swap(0, j)
    maxHeapify(0, j)
  }

  return arr
}
```

稳定性：不稳定

复杂度分析：

- 时间复杂度：$O(nlogn)$
- 空间复杂度：$O(1)$
