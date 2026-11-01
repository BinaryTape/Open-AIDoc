[//]: # (title: 区间与数列)

区间与数列在 Kotlin 中用于定义数值序列，支持区间运算符、迭代、自定义步长以及等差数列。

## 区间 {id="range"}

Kotlin 允许你通过 `kotlin.ranges` 包中的 [`.rangeTo()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.ranges/range-to.html) 和 [`.rangeUntil()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.ranges/range-until.html) 函数轻松创建数值区间。

区间表示具有明确起点和终点的有序值集合。默认情况下，每一步递增 1。
例如，`1..4` 表示数字 1、2、3 和 4。

若要创建具有以下特性的区间：

* 包含上限（闭区间）：使用 `..` 运算符调用 `.rangeTo()` 函数。这会同时包含起始值和结束值。
* 排除上限（半开区间）：使用 `..<` 运算符调用 `.rangeUntil()` 函数。这会包含起始值，但排除结束值。

例如：

```kotlin
fun main() {
//sampleStart
    // 同时包含 1 和 4
    println(4 in 1..4)
    // true
    
    // 包含 1，排除 4
    println(4 in 1..<4)
    // false
//sampleEnd
}
```
{kotlin-runnable="true" id="kotlin-ranges-rangeto-rangeuntil"}

区间在 `for` 循环迭代中尤为有用：

```kotlin
fun main() {
//sampleStart
    for (i in 1..4) print(i)
    // 1234
//sampleEnd
}
```
{kotlin-runnable="true" id="kotlin-ranges-for-loop"}

若要反向迭代数字，请使用 [`downTo`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.ranges/down-to.html) 函数代替 `..`。

```kotlin
fun main() {
//sampleStart
    for (i in 4 downTo 1) print(i)
    // 4321
//sampleEnd
}
```
{kotlin-runnable="true" id="kotlin-ranges-downto"}

你还可以使用 [`step()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.ranges/step.html) 函数以自定义步长迭代数字，而不是默认的递增 1：

```kotlin
fun main() {
//sampleStart
    for (i in 0..8 step 2) print(i)
    println()
    // 02468
    for (i in 0..<8 step 2) print(i)
    println()
    // 0246
    for (i in 8 downTo 0 step 2) print(i)
    // 86420
//sampleEnd
}
```
{kotlin-runnable="true" id="kotlin-ranges-step"}

## 数列 {id="progressions"}

整数类型（例如 `Int`、`Long` 和 `Char`）的区间可以被视为[等差数列](https://en.wikipedia.org/wiki/Arithmetic_progression)。
在 Kotlin 中，这些数列由特殊类型定义：[`IntProgression`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.ranges/-int-progression/index.html)、[`LongProgression`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.ranges/-long-progression/index.html) 以及 [`CharProgression`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.ranges/-char-progression/index.html)。

数列具有三个基本属性：`first` 元素、`last` 元素和一个非零的 `step`。
第一个元素是 `first`，后续元素为前一个元素加上 `step`。
以正步长迭代数列等价于 Java/JavaScript 中基于索引的 `for` 循环。

```java
for (int i = first; i <= last; i += step) {
  // ...
}
```

通过迭代区间隐式创建数列时，该数列的 `first` 和 `last` 元素为该区间的端点，且 `step` 为 1。

```kotlin
fun main() {
//sampleStart
    for (i in 1..10) print(i)
    // 12345678910
//sampleEnd
}
```
{kotlin-runnable="true" id="kotlin-ranges-progressions"}

若要定义自定义数列步长，请在区间上使用 `step` 函数。

```kotlin

fun main() {
//sampleStart
    for (i in 1..8 step 2) print(i)
    // 1357
//sampleEnd
}
```
{kotlin-runnable="true" id="kotlin-ranges-progressions-step"}

数列的 `last` 元素按以下方式计算：
* 对于正步长：不大于结束值且满足 `(last - first) % step == 0` 的最大值。
* 对于负步长：不小于结束值且满足 `(last - first) % step == 0` 的最小值。

因此，`last` 元素并不总是与指定的结束值相同。

```kotlin

fun main() {
//sampleStart
    for (i in 1..9 step 3) print(i) // 最后一个元素为 7
    // 147
//sampleEnd
}
```
{kotlin-runnable="true" id="kotlin-ranges-progressions-last"}

数列实现了 `Iterable<N>`（其中 `N` 分别为 `Int`、`Long` 或 `Char`），因此你可以在各种[集合函数](collection-operations.md)中使用它们，例如 `map`、`filter` 等。

```kotlin

fun main() {
//sampleStart
    println((1..10).filter { it % 2 == 0 })
    // [2, 4, 6, 8, 10]
//sampleEnd
}
```
{kotlin-runnable="true" id="kotlin-ranges-progressions-filter"}