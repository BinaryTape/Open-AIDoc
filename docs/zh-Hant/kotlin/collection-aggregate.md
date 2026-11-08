[//]: # (title: 聚合集合)

Kotlin 集合包含用於常用*聚合操作*（aggregate operations）的函式——即根據集合內容傳回單一值的操作。它們大多數都為人熟知，且運作方式與在其他語言中相同：

* [`minOrNull()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/min-or-null.html) 與 [`maxOrNull()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/max-or-null.html) 分別傳回最小與最大的元素。在空集合上，它們會傳回 `null`。
* [`average()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/average.html) 傳回數字集合中元素的平均值。
* [`sum()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/sum.html) 傳回數字集合中元素的總和。
* [`count()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/count.html) 傳回集合中的元素個數。

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

還有一些函式可以透過特定選擇器函式或自訂 [`Comparator`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin/-comparator/index.html) 來擷取最小和最大的元素：

* [`maxByOrNull()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/max-by-or-null.html) 與 [`minByOrNull()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/min-by-or-null.html) 接受一個選擇器函式，並傳回讓該函式產生最大或最小值的元素。
* [`maxWithOrNull()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/max-with-or-null.html) 與 [`minWithOrNull()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/min-with-or-null.html) 接受一個 `Comparator` 物件，並根據該 `Comparator` 傳回最大或最小的元素。
* [`maxOfOrNull()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/max-of-or-null.html) 與 [`minOfOrNull()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/min-of-or-null.html) 接受一個選擇器函式，並傳回選擇器本身產生的最大或最小傳回值。
* [`maxOfWithOrNull()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/max-of-with-or-null.html) 與 [`minOfWithOrNull()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/min-of-with-or-null.html) 接受一個 `Comparator` 物件，並根據該 `Comparator` 傳回選擇器產生的最大或最小傳回值。

這些函式在空集合上會傳回 `null`。另外還有對應的替代函式——[`maxOf`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/max-of.html)、[`minOf`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/min-of.html)、[`maxOfWith`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/max-of-with.html) 和 [`minOfWith`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/min-of-with.html)——它們的作用與前述函式相同，但會在空集合上拋出 `NoSuchElementException`。

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

除了常規的 `sum()` 之外，還有一個高階求和函式 [`sumOf()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/sum-of.html)，它接受一個選擇器函式，並傳回該選擇器套用到所有集合元素後的數值總和。選擇器可以傳回不同的數值型別：`Int`、`Long`、`Double`、`UInt` 與 `ULong`（在 JVM 上還支援 `BigInteger` 與 `BigDecimal`）。

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

## Fold 與 reduce {id="fold-and-reduce"}

針對更具體的使用案例，Kotlin 提供了 [`reduce()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/reduce.html) 與 [`fold()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/fold.html) 函式，它們會循序將指定的運算套用到集合元素上，並傳回累積結果。該運算接受兩個引數：先前累積的值以及當前的集合元素。

這兩個函式之間的差異在於：`fold()` 接受一個初始值，並在第一步將其用作累積值；而 `reduce()` 在第一步時，則是將集合的第一個與第二個元素作為運算引數。

```kotlin
fun main() {
//sampleStart
    val numbers = listOf(5, 2, 10, 4)

    val simpleSum = numbers.reduce { sum, element -> sum + element }
    println(simpleSum)
    val sumDoubled = numbers.fold(0) { sum, element -> sum + element * 2 }
    println(sumDoubled)

    //不正確：結果中第一個元素沒有被乘以兩倍
    //val sumDoubledReduce = numbers.reduce { sum, element -> sum + element * 2 } 
    //println(sumDoubledReduce)
//sampleEnd
}
```
{kotlin-runnable="true"}

上方的範例展示了其中的差異：`fold()` 用於計算元素加倍後的總和。如果將相同的函式傳遞給 `reduce()`，它將傳回不同的結果，因為它在第一步使用清單的第一個與第二個元素作為引數，因此第一個元素不會被加倍。

若要以相反順序將函式套用至元素，請使用函式 [`reduceRight()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/reduce-right.html) 與 [`foldRight()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/fold-right.html)。它們的運作方式與 `fold()` 及 `reduce()` 類似，但從最後一個元素開始，然後向前繼續進行。請注意，向右 fold 或 reduce 時，運算引數的順序會改變：第一個是元素，第二個才是累積值。

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

你也可以套用接受元素索引作為參數的運算。為此，請使用函式 [`reduceIndexed()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/reduce-indexed.html) 與 [`foldIndexed()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/fold-indexed.html)，並將元素索引作為運算的第一個引數傳入。

最後，還有從右向左將此類運算套用至集合元素的函式——[`reduceRightIndexed()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/reduce-right-indexed.html) 與 [`foldRightIndexed()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/fold-right-indexed.html)。

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

所有 reduce 操作在空集合上都會拋出例外。若要改為接收 `null`，請使用其對應的 `*OrNull()` 函式：
* [`reduceOrNull()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/reduce-or-null.html)
* [`reduceRightOrNull()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/reduce-right-or-null.html)
* [`reduceIndexedOrNull()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/reduce-indexed-or-null.html)
* [`reduceRightIndexedOrNull()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/reduce-right-indexed-or-null.html)

如果需要儲存中間的累加器值，可以使用函式 [`runningFold()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/running-fold.html)（或其同義詞 [`scan()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/scan.html)）以及 [`runningReduce()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/running-reduce.html)。

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

若需要在運算參數中使用索引，請使用 [`runningFoldIndexed()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/running-fold-indexed.html) 或 [`runningReduceIndexed()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/running-reduce-indexed.html)。