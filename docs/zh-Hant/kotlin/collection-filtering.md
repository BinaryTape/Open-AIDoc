[//]: # (title: 篩選集合)

篩選是集合處理中最常見的任務之一。
在 Kotlin 中，篩選條件由 *述詞 (predicates)* 定義——即接收集合元素並傳回布林值的 Lambda 函式：`true` 表示給定元素符合該述詞，`false` 則相反。

標準函式庫包含一組擴充函式，可讓你透過單次呼叫來篩選集合。
這些函式不會改變原始集合，因此同時適用於[可變與唯讀](collections-overview.md#read-only-and-mutable-collections)集合。若要操作篩選結果，你應該將其指派給變數，或在篩選後串接其他函式。

## 依述詞篩選 {id="filter-by-predicate"}

最基本的篩選函式是 [`filter()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/filter.html)。
當使用述詞呼叫時，`filter()` 會傳回符合該述詞的集合元素。
對於 `List` 與 `Set`，產生的結果集合都是 `List`；對於 `Map`，結果則同樣是 `Map`。

```kotlin
fun main() {
//sampleStart
    val numbers = listOf("one", "two", "three", "four")  
    val longerThan3 = numbers.filter { it.length > 3 }
    println(longerThan3)

    val numbersMap = mapOf("key1" to 1, "key2" to 2, "key3" to 3, "key11" to 11)
    val filteredMap = numbersMap.filter { (key, value) -> key.endsWith("1") && value > 10}
    println(filteredMap)
//sampleEnd
}
```
{kotlin-runnable="true"}

`filter()` 中的述詞只能檢查元素的值。
如果你想在篩選時使用元素的位置，請使用 [`filterIndexed()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/filter-indexed.html)。
它接收帶有兩個引數的述詞：元素的索引與元素的值。

若要依否定條件篩選集合，請使用 [`filterNot()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/filter-not.html)。
它會傳回述詞求值結果為 `false` 的元素清單。

```kotlin
fun main() {
//sampleStart
    val numbers = listOf("one", "two", "three", "four")
    
    val filteredIdx = numbers.filterIndexed { index, s -> (index != 0) && (s.length < 5)  }
    val filteredNot = numbers.filterNot { it.length <= 3 }

    println(filteredIdx)
    println(filteredNot)
//sampleEnd
}
```
{kotlin-runnable="true"}

還有一些函式可以透過篩選特定型別的元素來縮小元素型別範圍：

* [`filterIsInstance()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/filter-is-instance.html) 會傳回給定型別的集合元素。在 `List<Any>` 上呼叫時，`filterIsInstance<T>()` 會傳回 `List<T>`，從而允許你對其中的項目呼叫 `T` 型別的函式。

    ```kotlin
    fun main() {
    //sampleStart
        val numbers = listOf(null, 1, "two", 3.0, "four")
        println("All String elements in upper case:")
        numbers.filterIsInstance<String>().forEach {
            println(it.uppercase())
        }
    //sampleEnd
    }
    ```
    {kotlin-runnable="true"}

* [`filterNotNull()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/filter-not-null.html) 會傳回所有非可 null 的元素。在 `List<T?>` 上呼叫時，`filterNotNull()` 會傳回 `List<T: Any>`，從而允許你將這些元素視為非可 null 物件。

    ```kotlin
    fun main() {
    //sampleStart
        val numbers = listOf(null, "one", "two", null)
        numbers.filterNotNull().forEach {
            println(it.length)   // 可 null 的 String 無法使用 length
        }
    //sampleEnd
    }
    ```
    {kotlin-runnable="true"}

## 分割 (Partition) {id="partition"}

另一個篩選函式——[`partition()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/partition.html)——會依述詞篩選集合，並將不符合該述詞的元素保留在另一個獨立的清單中。
因此，你會得到一個由 `List` 組成的 `Pair` 作為傳回值：第一個清單包含符合述詞的元素，第二個清單則包含原始集合中的其餘所有元素。

```kotlin
fun main() {
//sampleStart
    val numbers = listOf("one", "two", "three", "four")
    val (match, rest) = numbers.partition { it.length > 3 }

    println(match)
    println(rest)
//sampleEnd
}
```
{kotlin-runnable="true"}

## 測試述詞 {id="test-predicates"}

最後，還有一些函式僅單純依述詞測試集合元素：

* 若至少有一個元素符合給定述詞，[`any()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/any.html) 會傳回 `true`。
* 若沒有任何元素符合給定述詞，[`none()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/none.html) 會傳回 `true`。
* 若所有元素都符合給定述詞，[`all()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/all.html) 會傳回 `true`。
    請注意，在空集合上使用任何有效述詞呼叫時，`all()` 都會傳回 `true`。這種行為在邏輯學中被稱為 *[空真 (vacuous truth)](https://en.wikipedia.org/wiki/Vacuous_truth)*。

```kotlin
fun main() {
//sampleStart
    val numbers = listOf("one", "two", "three", "four")

    println(numbers.any { it.endsWith("e") })
    println(numbers.none { it.endsWith("a") })
    println(numbers.all { it.endsWith("e") })

    println(emptyList<Int>().all { it > 5 })   // 空真 (vacuous truth)
//sampleEnd
}
```
{kotlin-runnable="true"}

`any()` 與 `none()` 也可以在不傳入述詞的情況下使用：在此情況下，它們僅檢查集合是否為空。
如果集合中存在元素，`any()` 會傳回 `true`，若不存在則傳回 `false`；`none()` 的作用則相反。

```kotlin
fun main() {
//sampleStart
    val numbers = listOf("one", "two", "three", "four")
    val empty = emptyList<String>()

    println(numbers.any())
    println(empty.any())
    
    println(numbers.none())
    println(empty.none())
//sampleEnd
}
```
{kotlin-runnable="true"}