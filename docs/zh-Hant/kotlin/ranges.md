[//]: # (title: 範圍與數列)

範圍（Range）與數列（Progression）在 Kotlin 中定義了值的序列，支援範圍運算子、迭代、自訂步長（step）值以及等差數列。

## 範圍 {id="range"}

Kotlin 讓你能使用來自 `kotlin.ranges` 套件的 [`.rangeTo()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.ranges/range-to.html) 與 [`.rangeUntil()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.ranges/range-until.html) 函式輕鬆建立值的範圍。

範圍表示具有明確起點與終點的有序值集合。預設情況下，每一步增加 1。
例如，`1..4` 代表數字 1、2、3 與 4。

若要建立包含以下特性的範圍：

* 包含上限（inclusive upper bound），請搭配 `..` 運算子呼叫 `.rangeTo()` 函式。這會同時包含起點與終點值。
* 不包含上限（exclusive upper bound），請搭配 `..<` 運算子呼叫 `.rangeUntil()` 函式。這會包含起點值但不包含終點值。

例如：

```kotlin
fun main() {
//sampleStart
    // 包含 1 和 4
    println(4 in 1..4)
    // true
    
    // 包含 1，不包含 4
    println(4 in 1..<4)
    // false
//sampleEnd
}
```
{kotlin-runnable="true" id="kotlin-ranges-rangeto-rangeuntil"}

範圍在 `for` 迴圈中進行迭代時特別實用：

```kotlin
fun main() {
//sampleStart
    for (i in 1..4) print(i)
    // 1234
//sampleEnd
}
```
{kotlin-runnable="true" id="kotlin-ranges-for-loop"}

若要以遞減順序迭代數字，請使用 [`downTo`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.ranges/down-to.html) 函式取代 `..`。

```kotlin
fun main() {
//sampleStart
    for (i in 4 downTo 1) print(i)
    // 4321
//sampleEnd
}
```
{kotlin-runnable="true" id="kotlin-ranges-downto"}

你也可以使用 [`step()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.ranges/step.html) 函式以自訂步長迭代數字，取代預設每次增加 1 的增量：

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

## 數列 {id="progressions"}

整數型別（如 `Int`、`Long` 與 `Char`）的範圍可視為[等差數列](https://en.wikipedia.org/wiki/Arithmetic_progression)。
在 Kotlin 中，這些數列由特殊型別定義：[`IntProgression`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.ranges/-int-progression/index.html)、[`LongProgression`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.ranges/-long-progression/index.html) 以及 [`CharProgression`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.ranges/-char-progression/index.html)。

數列具有三個基本屬性：`first` 元素、`last` 元素以及非零的 `step`。
第一個元素為 `first`，後續元素為前一個元素加上 `step`。
以正步長迭代數列等同於 Java/JavaScript 中以索引進行的 `for` 迴圈。

```java
for (int i = first; i <= last; i += step) {
  // ...
}
```

當你透過迭代範圍隱式建立數列時，該數列的 `first` 和 `last` 元素即為範圍的端點，且 `step` 為 1。

```kotlin
fun main() {
//sampleStart
    for (i in 1..10) print(i)
    // 12345678910
//sampleEnd
}
```
{kotlin-runnable="true" id="kotlin-ranges-progressions"}

若要自訂數列步長，請在範圍上使用 `step` 函式。

```kotlin

fun main() {
//sampleStart
    for (i in 1..8 step 2) print(i)
    // 1357
//sampleEnd
}
```
{kotlin-runnable="true" id="kotlin-ranges-progressions-step"}

數列的 `last` 元素計算方式如下：
* 步長為正值時：不大於終點值且滿足 `(last - first) % step == 0` 的最大值。
* 步長為負值時：不小於終點值且滿足 `(last - first) % step == 0` 的最小值。

因此，`last` 元素並不總是與指定的終點值相同。

```kotlin

fun main() {
//sampleStart
    for (i in 1..9 step 3) print(i) // 最後一個元素為 7
    // 147
//sampleEnd
}
```
{kotlin-runnable="true" id="kotlin-ranges-progressions-last"}

數列實作了 `Iterable<N>`（其中 `N` 分別為 `Int`、`Long` 或 `Char`），因此你可以在各種[集合函式](collection-operations.md)（如 `map`、`filter` 等）中使用它們。

```kotlin

fun main() {
//sampleStart
    println((1..10).filter { it % 2 == 0 })
    // [2, 4, 6, 8, 10]
//sampleEnd
}
```
{kotlin-runnable="true" id="kotlin-ranges-progressions-filter"}