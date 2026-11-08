[//]: # (title: 擷取單一元素)

Kotlin 集合提供了一組用於從集合中擷取單一元素的函式。
本頁面介紹的函式同時適用於 List 與 Set。

正如 [List 的定義](collections-overview.md)所述，List 是一個有序集合。
因此，List 的每個元素都有其可用於引用的位置。
除了本頁面介紹的函式之外，List 還提供了更豐富的方式，透過索引來擷取和搜尋元素。
如需更多詳細資訊，請參閱 [List 專用操作](list-operations.md)。

相對地，依據[定義](collections-overview.md)，Set 不是有序集合。
然而，Kotlin 的 `Set` 會以特定順序儲存元素。
這些順序可以是插入順序（在 `LinkedHashSet` 中）、自然排序順序（在 `SortedSet` 中）或其他順序。
Set 中元素的順序也可能是未知的。
在這種情況下，元素仍然會以某種方式排序，因此依賴元素位置的函式仍然會傳回其結果。
但是，除非呼叫者知道所使用的 `Set` 具體實作，否則此類結果對呼叫者而言是無法預測的。

## 依位置擷取 {id="retrieve-by-position"}

若要擷取特定位置的元素，可以使用 [`elementAt()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/element-at.html) 函式。
以整數作為引數呼叫它，你將會收到給定位置上的集合元素。
第一個元素的位置為 `0`，最後一個元素的位置為 `(size - 1)`。
 
`elementAt()` 對於不提供索引存取、或在靜態分析中未知是否支援索引存取的集合非常有用。
對於 `List`，使用[索引存取運算子](list-operations.md#retrieve-elements-by-index)（`get()` 或 `[]`）會更符合慣用法。

```kotlin

fun main() {
//sampleStart
    val numbers = linkedSetOf("one", "two", "three", "four", "five")
    println(numbers.elementAt(3))    

    val numbersSortedSet = sortedSetOf("one", "two", "three", "four")
    println(numbersSortedSet.elementAt(0)) // 元素按遞增順序儲存
//sampleEnd
}
```
{kotlin-runnable="true"}

另外還有一些用於擷取集合中第一個與最後一個元素的實用別名：[`first()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/first.html)
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

為了避免在擷取不存在的位置時發生例外狀況，請使用 `elementAt()` 的安全變形：

* 當指定位置超出集合範圍時，[`elementAtOrNull()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/element-at-or-null.html) 會傳回 null。
* [`elementAtOrElse()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/element-at-or-else.html) 還額外接受一個 Lambda 函式，該函式將 `Int` 引數對應到集合元素型別的執行個體。
   當以超出範圍的位置呼叫時，`elementAtOrElse()` 會傳回 Lambda 在給定值上的計算結果。

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

## 依條件擷取 {id="retrieve-by-condition"}

函式 [`first()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/first.html) 和 [`last()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/last.html)
還能讓你在集合中搜尋符合給定述詞的元素。當你使用測試集合元素的述詞呼叫 `first()` 時，將會收到述詞傳回 `true` 的第一個元素。
相對地，帶有述詞的 `last()` 會傳回符合該條件的最後一個元素。

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

如果沒有元素符合述詞，這兩個函式都會擲出例外。
為了避免這種情況，請改用 [`firstOrNull()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/first-or-null.html)
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

如果別名的名稱更符合你的情境，也可以使用別名：

* 使用 [`find()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/find.html) 代替 `firstOrNull()`
* 使用 [`findLast()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/find-last.html) 代替 `lastOrNull()`

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

## 透過選擇器擷取 {id="retrieve-with-selector"}

如果你在擷取元素之前需要先對集合進行轉換對應，可以使用 [`firstNotNullOf()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/first-not-null-of.html) 函式。
它結合了 2 個操作：
- 使用選擇器函式對集合進行對應
- 傳回結果中的第一個非 null 值

如果產生的集合中沒有非 null 元素，`firstNotNullOf()` 會擲出 `NoSuchElementException`。
在此情況下，可使用相對應的 [`firstNotNullOfOrNull()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/first-not-null-of-or-null.html)
來傳回 null。

```kotlin
fun main() {
//sampleStart
    val list = listOf<Any>(0, "true", false)
    // 將每個元素轉換為字串，並傳回具有所需長度的第一個元素
    val longEnough = list.firstNotNullOf { item -> item.toString().takeIf { it.length >= 4 } }
    println(longEnough)
//sampleEnd
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.5"}

## 隨機元素 {id="random-element"}

如果你需要擷取集合中的任意元素，請呼叫 [`random()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/random.html) 函式。
你可以在不傳入引數的情況下呼叫它，也可以傳入 [`Random`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.random/-random/index.html)
物件作為隨機來源。

```kotlin

fun main() {
//sampleStart
    val numbers = listOf(1, 2, 3, 4)
    println(numbers.random())
//sampleEnd
}
```
{kotlin-runnable="true"}

在空集合上，`random()` 會擲出例外。若想改為接收 `null`，請使用 [`randomOrNull()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/random-or-null.html)

## 檢查元素是否存在 {id="check-element-existence"}

若要檢查集合中是否存在某個元素，請使用 [`contains()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/contains.html) 函式。
如果存在與函式引數 `equals()` 的集合元素，它會傳回 `true`。
你可以使用帶有 `in` 關鍵字的運算子形式來呼叫 `contains()`。

若要一次檢查多個執行個體是否存在，請以包含這些執行個體的集合為引數呼叫 [`containsAll()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/contains-all.html)。

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

此外，你還可以透過呼叫 [`isEmpty()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/is-empty.html)
或 [`isNotEmpty()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/is-not-empty.html) 來檢查集合中是否包含任何元素。

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