[//]: # (title: 區間)

區間（Ranges）與數列（Progressions）在 Kotlin 中定義了數值的序列，支援區間運算子、反覆運算、自訂步長（step），以及等差數列。

## 區間 {id="range"}

Kotlin 讓你能使用 `kotlin.ranges` 套件中的 [`.rangeTo()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.ranges/range-to.html) 與 [`.rangeUntil()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.ranges/range-until.html) 函式輕鬆建立數值區間。

區間代表具有明確起始值與結束值的有序數值集合。預設情況下，每一步遞增 1。
例如，`1..4` 代表數字 1、2、3 與 4。

若要建立具有以下特性的區間：

* 包含上限，請搭配 `..` 運算子呼叫 `.rangeTo()` 函式。這會同時包含起始值與結束值。
* 不包含上限，請搭配 `..<` 運算子呼叫 `.rangeUntil()` 函式。這會包含起始值，但排除結束值。

例如：

```kotlin
fun main() {
//sampleStart
    // 同時包含 1 與 4
    println(4 in 1..4)
    // true
    
    // 包含 1，排除 4
    println(4 in 1..<4)
    // false
//sampleEnd
}
```
{kotlin-runnable="true" id="kotlin-ranges-rangeto-rangeuntil"}

區間特別適合用於 `for` 迴圈中的反覆運算：

```kotlin
fun main() {
//sampleStart
    for (i in 1..4) print(i)
    // 1234
//sampleEnd
}
```
{kotlin-runnable="true" id="kotlin-ranges-for-loop"}

若要以倒序反覆運算數字，請使用 [`downTo`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.ranges/down-to.html) 函式來取代 `..`。

```kotlin
fun main() {
//sampleStart
    for (i in 4 downTo 1) print(i)
    // 4321
//sampleEnd
}
```
{kotlin-runnable="true" id="kotlin-ranges-downto"}

你也可以使用 [`step()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.ranges/step.html) 函式以自訂步長來反覆運算數字，而不是預設的遞增 1：

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

整數型別（例如 `Int`、`Long` 與 `Char`）的區間可以被視為[等差數列](https://en.wikipedia.org/wiki/Arithmetic_progression)。
在 Kotlin 中，這些數列由特殊的型別定義：[`IntProgression`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.ranges/-int-progression/index.html)、[`LongProgression`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.ranges/-long-progression/index.html) 以及 [`CharProgression`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.ranges/-char-progression/index.html)。

數列具有三個關鍵屬性：`first` 元素、`last` 元素，以及非零的 `step`。
第一個元素為 `first`，後續的每個元素都是前一個元素加上 `step`。
以正數 step 反覆運算數列等同於 Java/JavaScript 中帶有索引的 `for` 迴圈。

```java
for (int i = first; i <= last; i += step) {
  // ...
}
```

當你透過反覆運算區間隱式建立數列時，該數列的 `first` 與 `last` 元素就是該區間的端點，且 `step` 為 1。

```kotlin
fun main() {
//sampleStart
    for (i in 1..10) print(i)
    // 12345678910
//sampleEnd
}
```
{kotlin-runnable="true" id="kotlin-ranges-progressions"}

若要定義自訂的數列步長，請在區間上使用 `step` 函式。

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
* 正數 step：不大於結束值且滿足 `(last - first) % step == 0` 的最大值。
* 負數 step：不小於結束值且滿足 `(last - first) % step == 0` 的最小值。

因此，`last` 元素並不總是與指定的結束值相同。

```kotlin

fun main() {
//sampleStart
    for (i in 1..9 step 3) print(i) // 最後一個元素是 7
    // 147
//sampleEnd
}
```
{kotlin-runnable="true" id="kotlin-ranges-progressions-last"}

數列實作了 `Iterable<N>`（其中 `N` 分別為 `Int`、`Long` 或 `Char`），因此你可以將它們用於各種[集合函式](collection-operations.md)，例如 `map`、`filter` 等。

```kotlin

fun main() {
//sampleStart
    println((1..10).filter { it % 2 == 0 })
    // [2, 4, 6, 8, 10]
//sampleEnd
}
```
{kotlin-runnable="true" id="kotlin-ranges-progressions-filter"}