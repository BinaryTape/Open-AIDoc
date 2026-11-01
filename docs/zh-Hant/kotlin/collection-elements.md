[//]: # (title: 取得單一元素)

Kotlin 集合提供了一組用於從集合中取得單一元素的函式。
本頁說明的函式同時適用於 List 和 Set。

誠如 [List 的定義](collections-overview.md)所述，List 是一個有序集合。
因此，List 中的每個元素都有可用於參照的位置。
除了本頁說明的函式外，List 還提供了更豐富的方式，可透過索引來取得和搜尋元素。
詳細資訊請參閱 [List 專用操作](list-operations.md)。

相對地，依據[定義](collections-overview.md)，Set 並不是有序集合。
然而，Kotlin 的 `Set` 會依特定順序儲存元素。
這些順序可能是插入順序（在 `LinkedHashSet` 中）、自然排序順序（在 `SortedSet` 中），或是其他順序。
Set 中元素的順序也可能是未知的。
在這種情況下，元素仍然以某種方式排序，因此依賴元素位置的函式仍然會傳回其結果。
但是，除非呼叫端知道所使用的具體 `Set` 實作，否則這類結果對於呼叫端而言是無法預測的。

## 依位置取得 {id="retrieve-by-position"}

若要取得特定位置的元素，可以使用 [`elementAt()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/element-at.html) 函式。
將整數作為引數傳入呼叫它，你將會獲得給定位置上的集合元素。
第一個元素的位置為 `0`，最後一個元素則是 `(size - 1)`。
 
`elementAt()` 對於未提供索引存取、或在靜態檢查時未知是否提供索引存取的集合非常有用。
如果是 `List`，使用[索引存取運算子](list-operations.md#retrieve-elements-by-index)（`get()` 或 `[]`）會更符合慣用法。

```kotlin

fun main() {
//sampleStart
    val numbers = linkedSetOf("one", "two", "three", "four", "five")
    println(numbers.elementAt(3))    

    val numbersSortedSet = sortedSetOf("one", "two", "three", "four")
    println(numbersSortedSet.elementAt(0)) // 元素依遞增順序儲存
//sampleEnd
}
```
{kotlin-runnable="true"}

還有一些實用的別名可用於取得集合的第一個與最後一個元素：[`first()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/first.html)
與 [`last()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/last.html)。

```kotlin

fun main() {
//sampleStart
    val numbers = listOf("one", "two", "three", "four", "five")
    println(numbers.first())    
    println(numbers.last())    
//sampleEnd
}
```
{kotlin-runnable="true"}

為了避免在取得不存在位置的元素時發生例外狀況，請使用 `elementAt()` 的安全版本：

* [`elementAtOrNull()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/element-at-or-null.html) 在指定位置超出集合範圍時傳回 null。
* [`elementAtOrElse()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/element-at-or-else.html) 另外接受一個 Lambda 函式，該函式將一個 `Int` 引數對應到集合元素型別的執行個體。
   當以越界位置呼叫時，`elementAtOrElse()` 會傳回在給定值上執行該 Lambda 的結果。

```kotlin

fun main() {
//sampleStart
    val numbers = listOf("one", "two", "three", "four", "five")
    println(numbers.elementAtOrNull(5))
    println(numbers.elementAtOrElse(5) { index -> "The value for index $index is undefined"})
//sampleEnd
}
```
{kotlin-runnable="true"}

## 依條件取得 {id="retrieve-by-condition"}

函式 [`first()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/first.html) 與 [`last()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/last.html)
也可讓你搜尋集合中符合給定述詞的元素。當你使用測試集合元素的述詞呼叫 `first()` 時，將會收到使述詞產生 `true` 的第一個元素。
相對地，帶有述詞的 `last()` 則會傳回符合該述詞的最後一個元素。 

```kotlin

fun main() {
//sampleStart
    val numbers = listOf("one", "two", "three", "four", "five", "six")
    println(numbers.first { it.length > 3 })
    println(numbers.last { it.startsWith("f") })
//sampleEnd
}
```
{kotlin-runnable="true"}

如果沒有元素符合述詞，這兩個函式都會拋出例外。
為了避免拋出例外，請改用 [`firstOrNull()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/first-or-null.html)
與 [`lastOrNull()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/last-or-null.html)：
如果找不到相符的元素，它們會傳回 `null`。

```kotlin

fun main() {
//sampleStart
    val numbers = listOf("one", "two", "three", "four", "five", "six")
    println(numbers.firstOrNull { it.length > 6 })
//sampleEnd
}
```
{kotlin-runnable="true"}

如果別名的名稱更符合你的情境，可以使用它們：

* 以 [`find()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/find.html) 代替 `firstOrNull()`
* 以 [`findLast()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/find-last.html) 代替 `lastOrNull()`

```kotlin

fun main() {
//sampleStart
    val numbers = listOf(1, 2, 3, 4)
    println(numbers.find { it % 2 == 0 })
    println(numbers.findLast { it % 2 == 0 })
//sampleEnd
}
```
{kotlin-runnable="true"}

## 透過選擇器取得 {id="retrieve-with-selector"}

如果在取得元素之前需要先對集合進行轉換（map），可以使用函式 [`firstNotNullOf()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/first-not-null-of.html)。
它結合了 2 個操作：
- 使用選擇器函式對應集合
- 傳回結果中的第一個非 null 值

如果結果集合中沒有非 null 元素，`firstNotNullOf()` 會拋出 `NoSuchElementException`。 
在這種情況下，請使用其對應函式 [`firstNotNullOfOrNull()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/first-not-null-of-or-null.html) 
來傳回 null。

```kotlin
fun main() {
//sampleStart
    val list = listOf<Any>(0, "true", false)
    // 將每個元素轉換為字串，並傳回符合所需長度的第一個元素
    val longEnough = list.firstNotNullOf { item -> item.toString().takeIf { it.length >= 4 } }
    println(longEnough)
//sampleEnd
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.5"}

## 隨機元素 {id="random-element"}

如果你需要取得集合中的任意元素，請呼叫 [`random()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/random.html) 函式。
你可以在不帶引數的情況下呼叫它，也可以傳入 [`Random`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.random/-random/index.html)
物件作為隨機性的來源。

```kotlin

fun main() {
//sampleStart
    val numbers = listOf(1, 2, 3, 4)
    println(numbers.random())
//sampleEnd
}
```
{kotlin-runnable="true"}

對於空集合，`random()` 會拋出例外。若想改為取得 `null`，請使用 [`randomOrNull()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/random-or-null.html)。

## 檢查元素是否存在 {id="check-element-existence"}

若要檢查集合中是否存在某個元素，請使用 [`contains()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/contains.html) 函式。
如果集合中存在與該函式引數 `equals()` 的元素，則傳回 `true`。
你也可以使用 `in` 關鍵字以運算子形式呼叫 `contains()`。

若要同時檢查多個執行個體是否存在，請呼叫 [`containsAll()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/contains-all.html)，
並將這些執行個體的集合做為引數傳入。

```kotlin

fun main() {
//sampleStart
    val numbers = listOf("one", "two", "three", "four", "five", "six")
    println(numbers.contains("four"))
    println("zero" in numbers)
    
    println(numbers.containsAll(listOf("four", "two")))
    println(numbers.containsAll(listOf("one", "zero")))
//sampleEnd
}
```
{kotlin-runnable="true"}

此外，你也可以透過呼叫 [`isEmpty()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/is-empty.html)
或 [`isNotEmpty()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/is-not-empty.html) 來檢查集合是否包含任何元素。 

```kotlin

fun main() {
//sampleStart
    val numbers = listOf("one", "two", "three", "four", "five", "six")
    println(numbers.isEmpty())
    println(numbers.isNotEmpty())
    
    val empty = emptyList<String>()
    println(empty.isEmpty())
    println(empty.isNotEmpty())
//sampleEnd
}
```
{kotlin-runnable="true"}