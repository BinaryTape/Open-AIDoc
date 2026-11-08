[//]: # (title: コレクションの集約操作)

Kotlinのコレクションには、よく使われる_集約操作（aggregate operations）_—コレクションの内容に基づいて単一の値を返す操作—のための関数が含まれています。それらのほとんどはよく知られており、他の言語と同じように機能します。

* [`minOrNull()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/min-or-null.html) および [`maxOrNull()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/max-or-null.html) は、それぞれ最小の要素と最大の要素を返します。空のコレクションに対しては `null` を返します。
* [`average()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/average.html) は、数値のコレクション内の要素の平均値を返します。
* [`sum()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/sum.html) は、数値のコレクション内の要素の合計を返します。
* [`count()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/count.html) は、コレクション内の要素数を返します。

```kotlin

fun main() {
    val numbers = listOf(6, 42, 10, 4)

    println("Count: ${numbers.count()}")
    println("Max: ${numbers.maxOrNull()}")
    println("Min: ${numbers.minOrNull()}")
    println("Average: ${numbers.average()}")
    println("Sum: ${numbers.sum()}")
}
```
{kotlin-runnable="true"}

特定のセレクター関数（selector function）またはカスタム [`Comparator`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin/-comparator/index.html) に基づいて最小および最大の要素を取得するための関数もあります。

* [`maxByOrNull()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/max-by-or-null.html) および [`minByOrNull()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/min-by-or-null.html) は、セレクター関数を受け取り、その関数が最大値または最小値を返す要素を返します。
* [`maxWithOrNull()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/max-with-or-null.html) および [`minWithOrNull()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/min-with-or-null.html) は、`Comparator` オブジェクトを受け取り、その `Comparator` に従って最大または最小の要素を返します。
* [`maxOfOrNull()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/max-of-or-null.html) および [`minOfOrNull()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/min-of-or-null.html) は、セレクター関数を受け取り、セレクター自体の戻り値の最大値または最小値を返します。
* [`maxOfWithOrNull()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/max-of-with-or-null.html) および [`minOfWithOrNull()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/min-of-with-or-null.html) は、`Comparator` オブジェクトを受け取り、その `Comparator` に従ってセレクターの戻り値の最大値または最小値を返します。

これらの関数は、空のコレクションに対して `null` を返します。また、空のコレクションに対して `NoSuchElementException` をスローする点を除いて同じ動作をする代替関数として、[`maxOf`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/max-of.html)、[`minOf`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/min-of.html)、[`maxOfWith`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/max-of-with.html)、[`minOfWith`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/min-of-with.html) も用意されています。

```kotlin

fun main() {
//sampleStart
    val numbers = listOf(5, 42, 10, 4)
    val min3Remainder = numbers.minByOrNull { it % 3 }
    println(min3Remainder)

    val strings = listOf("one", "two", "three", "four")
    val longestString = strings.maxWithOrNull(compareBy { it.length })
    println(longestString)
//sampleEnd
}
```
{kotlin-runnable="true"}

通常の `sum()` に加えて、セレクター関数を受け取り、それをすべてのコレクション要素に適用した結果の合計を返す高度な合計関数 [`sumOf()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/sum-of.html) があります。セレクターはさまざまな数値型（`Int`、`Long`、`Double`、`UInt`、`ULong`、さらにJVM上では `BigInteger` と `BigDecimal`）を返すことができます。

```kotlin

fun main() {
//sampleStart
    val numbers = listOf(5, 42, 10, 4)
    println(numbers.sumOf { it * 2 })
    println(numbers.sumOf { it.toDouble() / 2 })
//sampleEnd
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.4"}

## Fold と reduce {id="fold-and-reduce"}

より特殊なケースのために、指定された操作をコレクションの要素に順次適用し、累積された結果を返す [`reduce()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/reduce.html) および [`fold()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/fold.html) 関数があります。
この操作は2つの引数を取ります。1つはこれまでに累積された値で、もう1つはコレクションの要素です。

これら2つの関数の違いは、`fold()` が初期値を受け取り、それを最初のステップでの累積値として使用するのに対し、`reduce()` の最初のステップでは第1要素と第2要素を操作の引数として使用する点です。

```kotlin
fun main() {
//sampleStart
    val numbers = listOf(5, 2, 10, 4)

    val simpleSum = numbers.reduce { sum, element -> sum + element }
    println(simpleSum)
    val sumDoubled = numbers.fold(0) { sum, element -> sum + element * 2 }
    println(sumDoubled)

    //誤り: 最初の要素が結果で2倍になりません
    //val sumDoubledReduce = numbers.reduce { sum, element -> sum + element * 2 } 
    //println(sumDoubledReduce)
//sampleEnd
}
```
{kotlin-runnable="true"}

上記の例はその違いを示しています。`fold()` は要素を2倍にした合計を計算するために使用されています。
同じ関数を `reduce()` に渡すと、最初のステップでリストの第1要素と第2要素を引数として使用するため、最初の要素が2倍にならず、異なる結果が返されます。

要素に対して逆順に関数を適用するには、関数 [`reduceRight()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/reduce-right.html) および [`foldRight()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/fold-right.html) を使用します。
これらは `fold()` や `reduce()` と同様に動作しますが、最後の要素から開始して直前の要素へと進んでいきます。
右方向への fold や reduce を行う場合、操作の引数の順序が変わることに注意してください。最初に要素が渡され、その後に累積値が渡されます。

```kotlin

fun main() {
//sampleStart
    val numbers = listOf(5, 2, 10, 4)
    val sumDoubledRight = numbers.foldRight(0) { element, sum -> sum + element * 2 }
    println(sumDoubledRight)
//sampleEnd
}
```
{kotlin-runnable="true"}

要素のインデックスをパラメータとして受け取る操作を適用することもできます。
そのためには、操作の第1引数として要素のインデックスを渡す関数 [`reduceIndexed()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/reduce-indexed.html) および [`foldIndexed()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/fold-indexed.html) を使用します。

最後に、このような操作をコレクションの要素に対して右から左へと適用する関数として、[`reduceRightIndexed()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/reduce-right-indexed.html) および [`foldRightIndexed()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/fold-right-indexed.html) があります。

```kotlin

fun main() {
//sampleStart
    val numbers = listOf(5, 2, 10, 4)
    val sumEven = numbers.foldIndexed(0) { idx, sum, element -> if (idx % 2 == 0) sum + element else sum }
    println(sumEven)

    val sumEvenRight = numbers.foldRightIndexed(0) { idx, element, sum -> if (idx % 2 == 0) sum + element else sum }
    println(sumEvenRight)
//sampleEnd
}
```
{kotlin-runnable="true"}

すべての reduce 操作は、空のコレクションに対して例外をスローします。代わりに `null` を受け取るには、対応する `*OrNull()` 関数を使用します。
* [`reduceOrNull()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/reduce-or-null.html)
* [`reduceRightOrNull()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/reduce-right-or-null.html)
* [`reduceIndexedOrNull()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/reduce-indexed-or-null.html)
* [`reduceRightIndexedOrNull()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/reduce-right-indexed-or-null.html)

中間の累積値を保存したいケース向けに、[`runningFold()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/running-fold.html)（またはそのシノニムである [`scan()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/scan.html)）および [`runningReduce()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/running-reduce.html) 関数があります。

```kotlin

fun main() {
//sampleStart
    val numbers = listOf(0, 1, 2, 3, 4, 5)
    val runningReduceSum = numbers.runningReduce { sum, item -> sum + item }
    val runningFoldSum = numbers.runningFold(10) { sum, item -> sum + item }
//sampleEnd
    val transform = { index: Int, element: Int -> "N = ${index + 1}: $element" }
    println(runningReduceSum.mapIndexed(transform).joinToString("\n", "Sum of first N elements with runningReduce:\n"))
    println(runningFoldSum.mapIndexed(transform).joinToString("\n", "Sum of first N elements with runningFold:\n"))
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.4"}

操作のパラメータにインデックスが必要な場合は、[`runningFoldIndexed()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/running-fold-indexed.html) または [`runningReduceIndexed()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/running-reduce-indexed.html) を使用してください。