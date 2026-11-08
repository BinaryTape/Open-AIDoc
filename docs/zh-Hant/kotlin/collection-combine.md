[//]: # (title: 合併集合)

Kotlin 提供了用於新增與移除集合元素以及合併集合的運算子與函式。這些操作會傳回一個新的唯讀集合，並保持原始集合不變。

你也可以透過新增或移除元素來修改可變集合。若要了解更多，請參閱 [](collection-write.md)。

## 新增與移除元素 {id="add-and-remove-elements"}

在 Kotlin 中，你可以使用 [`plus`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/plus.html)（`+`）與 [`minus`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/minus.html)（`-`）運算子來新增或移除集合元素。
第一個運算元是一個集合，第二個運算元可以是一個元素或另一個集合。
每個運算子都會傳回一個新的唯讀集合：

* `plus` 會傳回一個包含原始元素以及第二個運算元中的一個或多個元素的集合。
* `minus` 會傳回一個不包含第二個運算元所指定元素的集合。若該運算元是一個元素，`minus` 會移除其第一次出現的項目。若第二個運算元是一個集合，`minus` 則會移除其元素的所有出現項目。

```kotlin

fun main() {
//sampleStart
    val numbers = listOf("one", "two", "three", "four")

    val plusList = numbers + "five"
    val minusList = numbers - listOf("three", "four")
    
    println(plusList)
    // [one, two, three, four, five]
   
    println(minusList)
    // [one, two]
//sampleEnd
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3"}

你也可以對集合使用[複合指派運算子](operator-overloading.md#augmented-assignments) [`plusAssign`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/plus-assign.html)（`+=`）與 [`minusAssign`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/minus-assign.html)（`-=`）：

* 對於儲存在以 `var` 宣告的變數中的唯讀集合，這些運算子會使用 `plus` 或 `minus`，並將產生的集合重新指派給該變數。
* 對於儲存在以 `val` 宣告的變數中的可變集合，這些運算子會使用 `plusAssign` 或 `minusAssign` 來原地修改該集合。

關於 Map 的 `plus` 與 `minus` 運算子詳細資訊，請參閱 [Map 特定操作](map-operations.md)。

## 合併兩個集合 {id="merge-two-collections"}

若要合併兩個集合，請使用 [`union()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/union.html) 函式。它會傳回一個包含來自兩個集合的不重複元素的 `Set`。你也可以使用中綴形式來呼叫它：`a union b`。

結果會保留第一個集合的疊代順序，接著按照第二個集合的疊代順序附加尚未存在的元素：

```kotlin
fun main() {
//sampleStart
    val numbers = setOf("one", "two", "three")

    // 交換集合會改變結果的疊代順序
    println(numbers union setOf("four", "five"))
    // [one, two, three, four, five]
    println(setOf("four", "five") union numbers)
    // [four, five, one, two, three]
//sampleEnd
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3"}

## 尋找兩個集合的交集 {id="find-the-intersection-of-two-collections"}

若要尋找同時存在於兩個集合中的元素（即它們的交集），請使用 [`intersect()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/intersect.html)。
若要尋找存在於第一個集合但不存在於第二個集合中的元素，請使用 [`subtract()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/subtract.html)。

這兩個函式都會傳回一個 `Set`，並支援中綴表示法（`a intersect b` 與 `a subtract b`）：

```kotlin
fun main() {
//sampleStart
    val numbers = setOf("one", "two", "three")

    // 尋找同時存在於兩個集合中的元素
    println(numbers intersect setOf("two", "one"))
    // [one, two]
   
    // 排除存在於第二個集合中的元素
    println(numbers subtract setOf("three", "four"))
    // [one, two]

    // 重新排列第二個集合並不會改變結果
    println(numbers subtract setOf("four", "three"))
    // [one, two]
//sampleEnd
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3"}

## 尋找僅存在於其中一個集合的元素 {id="find-elements-present-in-only-one-collection"}

若要尋找僅存在於兩個集合其中之一的元素，可以讓兩個集合互相相減，並使用 `union()` 合併結果。此操作稱為*對稱差* (symmetric difference)，並且會傳回一個 `Set`：

```kotlin
fun main() {
//sampleStart
    val numbers = setOf("one", "two", "three")
    val numbers2 = setOf("three", "four")

    // 合併兩個方向的差集
    println((numbers - numbers2) union (numbers2 - numbers))
    // [one, two, four]
//sampleEnd
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3"}