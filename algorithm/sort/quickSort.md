---
aliases: ['快速排序']
tags: ['algorithm/sort','date/2022-02','year/2022','month/02']
date: 2022-02-28-Monday 18:29:26
update: 2022-02-28-Monday 18:43:01
---

快速排序的思路是从数列中挑出一个元素，称为 “基准”（pivot）；然后重新排序数列，所有元素比基准值小的摆放在基准前面、比基准值大的摆在基准的后面；在这个区分搞定之后，该基准就处于数列的中间位置；然后把小于基准值元素的子数列（left）和大于基准值元素的子数列（right）递归地调用 quick 方法排序完成，这就是快排的思路。

```js
function quickSort (arr) {
  if (arr.length <= 1) return arr

  var pivotIndex = Math.floor(arr.length / 2);
  var pivot = arr.splice(pivotIndex, 1)[0];

  var left = []
  var right = []

  for (var i = 0; i < arr.length; i++) {
    if (arr[i] > pivot) {
      right.push(arr[i])
    } else {
      left.push(arr[i])
    }
  }

  return quickSort(left).concat([pivot], quickSort(right))
}

function quickSort (arr) {
  return (_ = (arr, left, right) => {
    if (left >= right) return
    var l = left
    var r = right
    var flag = left
    while (l < r) {
      while (arr[r] >= arr[flag] && r > flag) r--
      if (l >= r) break
      while (arr[l] <= arr[flag] && l < r) l++;
      [arr[flag], arr[r], arr[l]] = [arr[r], arr[l], arr[flag]]
      flag = l
    }
    _(arr, left, flag - 1)
    _(arr, flag + 1, right)
    return arr
  })(arr, 0, arr.length - 1)
}
```

稳定性：不稳定

复杂度分析：

- 时间复杂度：$O(nlogn)$
- 空间复杂度：$O(logn)$
