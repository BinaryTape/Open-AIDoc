[//]: # (title: 範囲と数列)

Kotlin において、範囲（Range）と数列（Progression）は値のシーケンスを定義し、範囲演算子、反復処理（イテレーション）、カスタムステップ値、および等差数列をサポートします。

## 範囲（Range） {id="range"}

Kotlin では、`kotlin.ranges` パッケージの [`.rangeTo()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.ranges/range-to.html) および [`.rangeUntil()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.ranges/range-until.html) 関数を使用して、値の範囲を簡単に作成できます。

範囲は、開始値と終了値が定義された順序付きの値のセットを表します。デフォルトでは、各ステップで 1 ずつ増加します。
例えば、`1..4` は 1、2、3、4 の数値を表します。

範囲を作成するには、以下の方法があります：

* 上限値を含む範囲（閉区間）を作成するには、`..` 演算子とともに `.rangeTo()` 関数を呼び出します。これには開始値と終了値の両方が含まれます。
* 上限値を含まない範囲（半開区間）を作成するには、`..<` 演算子とともに `.rangeUntil()` 関数を呼び出します。これには開始値は含まれますが、終了値は除外されます。

例：

```kotlin
fun main() {
//sampleStart
    // 1 と 4 の両方を含む
    println(4 in 1..4)
    // true
    
    // 1 を含み、4 を除外する
    println(4 in 1..<4)
    // false
//sampleEnd
}
```
{kotlin-runnable="true" id="kotlin-ranges-rangeto-rangeuntil"}

範囲は、`for` ループによる反復処理を行う際に特に便利です：

```kotlin
fun main() {
//sampleStart
    for (i in 1..4) print(i)
    // 1234
//sampleEnd
}
```
{kotlin-runnable="true" id="kotlin-ranges-for-loop"}

数値を逆順で反復処理するには、`..` の代わりに [`downTo`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.ranges/down-to.html) 関数を使用します。

```kotlin
fun main() {
//sampleStart
    for (i in 4 downTo 1) print(i)
    // 4321
//sampleEnd
}
```
{kotlin-runnable="true" id="kotlin-ranges-downto"}

また、デフォルトの 1 単位の増加ではなく、[`step()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.ranges/step.html) 関数を使用してカスタムのステップ間隔で数値を反復処理することもできます：

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

## 数列（Progression） {id="progressions"}

`Int`、`Long`、`Char` などの整数型の範囲は、[等差数列（arithmetic progressions）](https://en.wikipedia.org/wiki/Arithmetic_progression) として扱うことができます。
Kotlin では、これらの数列は専用の型によって定義されています：[`IntProgression`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.ranges/-int-progression/index.html)、[`LongProgression`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.ranges/-long-progression/index.html)、および [`CharProgression`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.ranges/-char-progression/index.html)。

数列には 3 つの重要なプロパティがあります：`first` 要素、`last` 要素、そして 0 以外の `step` です。
最初の要素は `first` であり、それ以降の要素は直前の要素に `step` を加えたものになります。
正のステップを持つ数列に対する反復処理は、Java/JavaScript におけるインデックス付きの `for` ループと同等です。

```java
for (int i = first; i <= last; i += step) {
  // ...
}
```

範囲を反復処理することで暗黙的に数列を作成した場合、その数列の `first` 要素と `last` 要素は範囲の両端値となり、`step` は 1 になります。

```kotlin
fun main() {
//sampleStart
    for (i in 1..10) print(i)
    // 12345678910
//sampleEnd
}
```
{kotlin-runnable="true" id="kotlin-ranges-progressions"}

カスタムの数列ステップを定義するには、範囲に対して `step` 関数を使用します。

```kotlin

fun main() {
//sampleStart
    for (i in 1..8 step 2) print(i)
    // 1357
//sampleEnd
}
```
{kotlin-runnable="true" id="kotlin-ranges-progressions-step"}

数列の `last` 要素は次のように計算されます：
* 正のステップの場合：`(last - first) % step == 0` を満たす、終了値以下の最大値。
* 負のステップの場合：`(last - first) % step == 0` を満たす、終了値以上の最小値。

そのため、`last` 要素は必ずしも指定された終了値と同じになるとは限りません。

```kotlin

fun main() {
//sampleStart
    for (i in 1..9 step 3) print(i) // 最後の要素は 7
    // 147
//sampleEnd
}
```
{kotlin-runnable="true" id="kotlin-ranges-progressions-last"}

数列は `Iterable<N>`（`N` はそれぞれ `Int`、`Long`、または `Char`）を実装しているため、`map` や `filter` などのさまざまな [コレクション操作関数](collection-operations.md) で利用できます。

```kotlin

fun main() {
//sampleStart
    println((1..10).filter { it % 2 == 0 })
    // [2, 4, 6, 8, 10]
//sampleEnd
}
```
{kotlin-runnable="true" id="kotlin-ranges-progressions-filter"}