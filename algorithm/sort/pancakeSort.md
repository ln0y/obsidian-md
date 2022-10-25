---
aliases: ['煎饼排序']
tags: ['leetcode/969','sort','algorithm/sort','date/2022-02','year/2022','month/02']
date: 2022-02-19-Saturday 21:46:26
update: 2022-02-19-Saturday 21:47:15
---
leetcode: [969.煎饼排序](https://leetcode-cn.com/problems/pancake-sorting/)

煎饼排序的相关背景内容可以参考百度百科「[煎饼排序](https://baike.baidu.com/item/%E7%85%8E%E9%A5%BC%E6%8E%92%E5%BA%8F)」。2011年，劳伦特·比尔托（Laurent Bulteau）、纪尧姆·佛丁（Guillaume Fertin）和伊雷娜·鲁苏（Irena Rusu）证明了给定一叠煎饼的长度分布，找到最短解法是 NP 困难的，参考论文「[Bulteau, Laurent; Fertin, Guillaume; Rusu, Irena. Pancake Flipping Is Hard. Journal of Computer and System Sciences: 1556–1574.](https://arxiv.org/abs/1111.0434v1)」。

## 类冒泡排序

由于每次我们都对「某段前缀」进行整体翻转，并且规定了翻转次数在一定范围内的方案均为合法翻转方案，同时 arr 又是 1 到 n 的排列。

我们可以很自然想到「冒泡排序」：**每次确定未排序部分最右端的元素（最大值）。**

设一个元素的下标是 index，我们可以通过两次煎饼排序将它放到尾部：

- 第一步选择 $k=index+1$，然后反转子数组 $arr[0...k-1]$，此时该元素已经被放到首部。
- 第二步选择 $k=n$，其中 $n$ 是数组 arr 的长度，然后反转整个数组，此时该元素已经被放到尾部。

通过以上两步操作，我们可以将当前数组的最大值放到尾部，然后将去掉尾部元素的数组作为新的处理对象，重复以上操作，直到处理对象的长度等于一，此时原数组已经完成排序，且需要的总操作数是 $2*(n-1)$，符合题目要求。如果最大值已经在尾部，我们可以省略对应的操作。

```ts
function pancakeSort (arr: number[]): number[] {
  const ans = []
  // 每次遍历确定好一位数字
  for (let n = arr.length; n > 1; n--) {
    let max = 0
    // 选中当前遍历的最大值
    for (let i = 1; i < n; i++) {
      if (arr[i] >= arr[max]) max = i
    }
    // 当前元素位置已在尾部
    if (max === n - 1) continue
    // 第一次翻转将最大元素放到首部
    reverse(arr, max)
    // 第二次翻转将最大元素放置在当前的遍历的尾部
    reverse(arr, n - 1)
    // 记录2次翻转位置
    ans.push(max + 1)
    ans.push(n)
  }
  return ans
}
// 数组翻转
function reverse (arr: number[], end: number) {
  let i = 0
  while (i < end) {
    [arr[i], arr[end]] = [arr[end], arr[i]]
    i++
    end--
  }
}

```

复杂度分析：

- 时间复杂度：$O(n^2)$，其中 $n$ 是数组 arr 的大小。总共执行至多 $n - 1$ 次查找最大值，至多 $2*(n-1)$ 次反转数组，而查找最大值的时间复杂度是 $O(n)$，反转数组的时间复杂度是 $O(n)$，因此总时间复杂度是 $O(n^2)$
- 空间复杂度：$O(1)$，返回值不计入空间复杂度。

