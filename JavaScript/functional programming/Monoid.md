---
aliases: []
tags: ['JavaScript/functional_programming','date/2023-02','year/2023','month/02']
date: 2023-02-25-星期六 17:57:20
update: 2023-02-25-星期六 18:01:12
---

## 由 Semigroup 推导 Monoid

理解了 [[Semigroup]]（半群），也就理解了 Monoid（幺半群）。

> A _monoid_ is an algebraic structure intermediate between _semigroups_ and groups, and is a _semigroup_ having an identity element. ——Wikipedia
> 直译：Monoid 是一种介于 Semigroup 和 group 之间的代数结构，它是一个拥有了 identity element 的半群。

【划重点】：Monoid 是一个拥有了 identity element 的半群——**Monoid = Semigroup + identity element**

那么什么是 identity element 呢？

这个东西在数学上叫做“单位元”。 单位元的特点在于，**它和任何运算数相结合时，都不会改变那个运算数**。

在函数式编程中，单位元也是一个函数，我们一般把它记为“`empty()` 函数”。

**也就是说，Monoid = Semigroup + `empty()` 函数。**

`empty()` 函数的实现取决于运算符的特征。比如说，加法运算的单位元，就是一个恒定返回 Add(0) 的函数：

```js
// 定义一个类型为 Add 的 Semigroup 盒子
const Add = value => ({
  value,
  // concat 接收一个类型为 Add 的 Semigroup 盒子作为入参
  concat: box => Add(value + box.value),
})

// 这个 empty() 函数就是加法运算的单位元
Add.empty = () => Add(0)

// 输出一个 value=3 的 Add 盒子
Add.empty().concat(Add(1)).concat(Add(2))
```

`empty()` 是单位元的代码形态。单位元的特点在于，**它和任何运算数相结合时，都不会改变那个运算数**。 也就是说，`empty()`**函数的返回值和任何运算数相结合时，也都不会改变那个运算数。**

以加法运算为例，无论我是把 `empty()` 放在 `concat()` 运算符的右边：

```js
const testValue = 1
const testBox = Add(testValue)

// 验证右侧的 identity（恒等性），rightIdentity 结果为 true
const rightIdentity = testBox.concat(Add.empty()).value === testValue
```

还是把 `empty()` 放在 `concat()` 运算符的左边：

```js
const testValue = 1
const testBox = Add(testValue)

// 验证左侧的 identity（恒等性），leftIdentity 结果为 true
const leftIdentity = Add.empty().concat(testBox).value === testValue
```

`empty()` 总是不会改变运算符另一侧的 `testBox` 盒子的值，这就是“单位元”特征的体现。

**任意一个 Semigroup 盒子与** `empty()`**一起进行 `concat()` 二元运算时，其运算结果都一定恒等于那个 Semigroup 盒子本身的值。**

**形如这样的** `empty()`**函数，就是“单位元”思想在函数式编程中的实践。**

**而实现了** `empty()`**函数的 Semigroup 盒子，就是 Monoid 盒子。**
