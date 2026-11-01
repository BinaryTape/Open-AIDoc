[//]: # (title: Plus 與 minus 運算子)

在 Kotlin 中，為集合定義了 [`plus`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/plus.html) (`+`) 與 [`minus`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/minus.html) (`-`) 運算子。
它們以一個集合做為第一個運算元；第二個運算元可以是一個元素或另一個集合。
傳回值是一個新的唯讀集合：

* `plus` 的結果包含來自原始集合 _以及_ 來自第二個運算元的元素。
* `minus` 的結果包含原始集合中 _除了_ 第二個運算元以外的元素。
   若第二個運算元是元素，`minus` 會移除其 _第一次_ 出現的項目；若第二個運算元是集合，則會移除其所有元素的 _每一次_ 出現項目。

```kotlin

fun main() {
//sampleStart
    val numbers = listOf("one", "two", "three", "four")

    val plusList = numbers + "five"
    val minusList = numbers - listOf("three", "four")
    println(plusList)
    println(minusList)
//sampleEnd
}
```
{kotlin-runnable="true"}

關於 Map 的 `plus` 與 `minus` 運算子詳細資訊，請參閱 [Map 特定操作](map-operations.md)。
集合也定義了[複合指派運算子](operator-overloading.md#augmented-assignments) [`plusAssign`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/plus-assign.html) (`+=`) 與 [`minusAssign`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/minus-assign.html) (`-=`)。然而，對於唯讀集合，它們實際上是使用 `plus` 或 `minus` 運算子，並嘗試將結果指派給同一個變數。因此，它們僅適用於 `var` 唯讀集合。
對於可變集合，如果變數是 `val`，它們會直接修改該集合。如需更多詳細資訊，請參閱 [集合寫入操作](collection-write.md)。