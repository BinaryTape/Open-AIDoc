[//]: # (title: 分組)

Kotlin 標準函式庫提供了用於對集合元素進行分組的擴充函式。
基本函式 [`groupBy()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/group-by.html) 接受一個 Lambda 函式並回傳一個 `Map`。在此 Map 中，每個鍵（key）都是該 Lambda 的運算結果，而對應的值（value）則是產生此結果之元素的 `List`。例如，可以使用此函式將 `String` 清單按其首字母進行分組。

你也可以傳入第二個 Lambda 引數來呼叫 `groupBy()`——即值轉換函式。
在帶有兩個 Lambda 的 `groupBy()` 結果 Map 中，由 `keySelector` 函式產生的鍵會對應到值轉換函式的結果，而非原始元素。

以下範例示範使用 `groupBy()` 函式依字串的首字母分組、使用 `for` 運算子遍歷結果 `Map` 中的各個分組，然後使用 `valueTransform` 函式將值轉換為大寫：

```kotlin
fun main() {
//sampleStart
    val numbers = listOf("one", "two", "three", "four", "five")

    // 使用 groupBy() 依字串的首字母進行分組
    val groupedByFirstLetter = numbers.groupBy { it.first().uppercase() }
    println(groupedByFirstLetter)
    // {O=[one], T=[two, three], F=[four, five]}

    // 遍歷每個分組並印出鍵及其關聯的值
    for ((key, value) in groupedByFirstLetter) {
        println("Key: $key, Values: $value")
    }
    // Key: O, Values: [one]
    // Key: T, Values: [two, three]
    // Key: F, Values: [four, five]

    // 依首字母對字串進行分組並將值轉換為大寫
    val groupedAndTransformed = numbers.groupBy(keySelector = { it.first() }, valueTransform = { it.uppercase() })
    println(groupedAndTransformed)
    // {o=[ONE], t=[TWO, THREE], f=[FOUR, FIVE]}
//sampleEnd
}
```
{kotlin-runnable="true"}

如果你想對元素進行分組，然後一次性對所有分組套用某個操作，可以使用函式 [`groupingBy()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/grouping-by.html)。
它會回傳一個 [`Grouping`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/-grouping/index.html) 型別的執行個體。`Grouping` 執行個體可讓你以延遲方式對所有分組套用操作：分組實際上會在操作執行前一刻才建立。

具體而言，`Grouping` 支援以下操作：

* [`eachCount()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/each-count.html) 計算每個分組中的元素數量。
* [`fold()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/fold.html) 與 [`reduce()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/reduce.html) 將每個分組作為獨立的集合執行 [fold 與 reduce](collection-aggregate.md#fold-and-reduce) 操作，並回傳結果。
* [`aggregate()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/aggregate.html) 依序將給定的操作套用至每個分組中的所有元素並回傳結果。這是對 `Grouping` 執行任意操作的通用方式。當 fold 或 reduce 無法滿足需求時，可以用它來實作自訂操作。

你可以在產生的 `Map` 上使用 `for` 運算子來遍歷由 `groupingBy()` 函式建立的分組。這讓你可以存取每個鍵以及與該鍵關聯的元素數量。

以下範例示範如何使用 `groupingBy()` 函式依字串的首字母分組、計算每個分組中的元素數量，然後遍歷每個分組以印出鍵和元素數量：

```kotlin
fun main() {
//sampleStart
    val numbers = listOf("one", "two", "three", "four", "five")

    // 使用 groupingBy() 依字串首字母分組，並計算每個分組中的元素數量
    val grouped = numbers.groupingBy { it.first() }.eachCount()

    // 遍歷每個分組並印出鍵及其關聯的值
    for ((key, count) in grouped) {
        println("Key: $key, Count: $count")
        // Key: o, Count: 1
        // Key: t, Count: 2
        // Key: f, Count: 2
    }
//sampleEnd
}
```
{kotlin-runnable="true"}