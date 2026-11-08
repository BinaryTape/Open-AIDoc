[//]: # (title: 範囲)

Kotlinにおいて、範囲（Range）とプログレッション（Progression）は値のシーケンスを定義し、範囲演算子、反復処理（イテレーション）、カスタムステップ値、および等差数列をサポートします。

## 範囲 {id="range"}

Kotlinでは、`kotlin.ranges` パッケージの [`.rangeTo()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.ranges/range-to.html) および [`.rangeUntil()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.ranges/range-until.html) 関数を使用して、値の範囲を簡単に作成できます。

範囲は、開始と終了が定義された値の順序付き集合を表します。デフォルトでは、各ステップで1ずつ増加します。
例えば、`1..4` は 1、2、3、4 という数値を表します。

範囲を作成するには、次のようにします。

* 上限を含む（inclusive）範囲を作成する場合は、`..` 演算子を使用して `.rangeTo()` 関数を呼び出します。これには開始値と終了値の両方が含まれます。
* 上限を含まない（exclusive）範囲を作成する場合は、`..<` 演算子を使用して `.rangeUntil()` 関数を呼び出します。これには開始値は含まれますが、終了値は除外されます。

例：

```kotlin
fun main() {
//sampleStart
    // 1と4の両方を含む
    println(4 in 1..4)
    // true
    
    // 1を含み、4を除外する
    println(4 in 1..<4)
    // false
//sampleEnd
}
```
{kotlin-runnable="true" id="kotlin-ranges-rangeto-rangeuntil"}

範囲は、`for` ループで反復処理を行う際に特に役立ちます。

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

また、デフォルトの1刻みの増加ではなく、[`step()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.ranges/step.html) 関数を使用してカスタムステップで数値を反復処理することもできます。

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

## プログレッション {id="progressions"}

`Int`、`Long`、`Char` などの整数型の範囲は、[等差数列（arithmetic progressions）](https://en.wikipedia.org/wiki/Arithmetic_progression) として扱うことができます。
Kotlinでは、これらのプログレッションは特別な型によって定義されています: [`IntProgression`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.ranges/-int-progression/index.html)、[`LongProgression`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.ranges/-long-progression/index.html)、および [`CharProgression`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.ranges/-char-progression/index.html)。

プログレッションには、`first` 要素、`last` 要素、そしてゼロ以外の `step` という3つの重要なプロパティがあります。
最初の要素は `first` であり、後続の要素は直前の要素に `step` を加えたものになります。
正のステップを持つプログレッションの反復処理は、Java/JavaScript におけるインデックス付きの `for` ループと同等です。

```java
for (int i = first; i <= last; i += step) {
  // ...
}
```

範囲を反復処理することによってプログレッションが暗黙的に作成される場合、そのプログレッションの `first` と `last` 要素は範囲の両端点となり、`step` は 1 になります。

```kotlin
fun main() {
//sampleStart
    for (i in 1..10) print(i)
    // 12345678910
//sampleEnd
}
```
{kotlin-runnable="true" id="kotlin-ranges-progressions"}

カスタムのプログレッションステップを定義するには、範囲に対して `step` 関数を使用します。

```kotlin

fun main() {
//sampleStart
    for (i in 1..8 step 2) print(i)
    // 1357
//sampleEnd
}
```
{kotlin-runnable="true" id="kotlin-ranges-progressions-step"}

プログレッションの `last` 要素は、次のように計算されます。
* 正のステップの場合: `(last - first) % step == 0` を満たす、終了値以下の最大値。
* 負のステップの場合: `(last - first) % step == 0` を満たす、終了値以上の最小値。

そのため、`last` 要素は指定された終了値と常に一致するとは限りません。

```kotlin

fun main() {
//sampleStart
    for (i in 1..9 step 3) print(i) // 最後の要素は7
    // 147
//sampleEnd
}
```
{kotlin-runnable="true" id="kotlin-ranges-progressions-last"}

プログレッションは `Iterable<N>`（`N` はそれぞれ `Int`、`Long`、または `Char`）を実装しているため、`map` や `filter` などのさまざまな[コレクション関数](collection-operations.md)で使用できます。

```kotlin

fun main() {
//sampleStart
    println((1..10).filter { it % 2 == 0 })
    // [2, 4, 6, 8, 10]
//sampleEnd
}
```
{kotlin-runnable="true" id="kotlin-ranges-progressions-filter"}