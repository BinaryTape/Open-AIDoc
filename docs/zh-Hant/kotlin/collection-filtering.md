[//]: # (title: 篩選集合)

篩選是集合處理中最常見的任務之一。
在 Kotlin 中，篩選條件是由 _述詞 (predicate)_ 定義的——即接收集合元素並傳回布林值的 Lambda 函式：`true` 表示給定元素符合該述詞，`false` 則相反。

標準函式庫包含一組擴充函式，可讓你透過單次呼叫即可篩選集合。
這些函式不會改變原始集合，因此它們同時適用於[可變與唯讀](collections-overview.md#collection-types)集合。若要對篩選結果進行操作，你應該將其指派給變數，或在篩選後以鏈式呼叫後續函式。

## 依述詞篩選 {id="filter-by-predicate"}

最基本的篩選函式是 [`filter()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/filter.html)。
當傳入述詞呼叫時，`filter()` 會傳回與其相符的集合元素。
對於 `List` 與 `Set`，產生的結果集合都是 `List`；對於 `Map`，結果也依然是 `Map`。

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
它接收帶有兩個引數的述詞：元素的索引和值。

若要依否定條件篩選集合，請使用 [`filterNot()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/filter-not.html)。
它會傳回述詞結果為 `false` 的元素清單。

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

還有一些函式可透過篩選指定型別的元素來縮小元素型別範圍：

* [`filterIsInstance()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/filter-is-instance.html) 會傳回指定型別的集合元素。在 `List<Any>` 上呼叫時，`filterIsInstance<T>()` 會傳回 `List<T>`，進而允許你對其項目呼叫 `T` 型別的函式。

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

* [`filterNotNull()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/filter-not-null.html) 會傳回所有非 null 元素。在 `List<T?>` 上呼叫時，`filterNotNull()` 會傳回 `List<T: Any>`，進而允許你將這些元素視為非 null 物件。

    ```kotlin
    fun main() {
    //sampleStart
        val numbers = listOf(null, "one", "two", null)
        numbers.filterNotNull().forEach {
            println(it.length)   // 可為 null 的 String 無法使用 length
        }
    //sampleEnd
    }
    ```
    {kotlin-runnable="true"}

## 分割 (Partition) {id="partition"}

另一個篩選函式——[`partition()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/partition.html)——會依述詞篩選集合，並將不符合條件的元素保留在另一個獨立的清單中。
因此，其傳回值為一個由 `List` 組成的 `Pair`：第一個清單包含符合述詞的元素，第二個清單則包含原始集合中的其餘所有元素。

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

最後，還有一些函式單純用來對集合元素測試述詞：

* [`any()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/any.html) 若有至少一個元素符合給定述詞，則傳回 `true`。
* [`none()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/none.html) 若沒有任何元素符合給定述詞，則傳回 `true`。
* [`all()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/all.html) 若所有元素都符合給定述詞，則傳回 `true`。
    請注意，在空集合上以任何有效述詞呼叫 `all()` 都會傳回 `true`。這種行為在邏輯學中稱為 _[空洞真 (vacuous truth)](https://en.wikipedia.org/wiki/Vacuous_truth)_。

```kotlin
fun main() {
//sampleStart
    val numbers = listOf("one", "two", "three", "four")

    println(numbers.any { it.endsWith("e") })
    println(numbers.none { it.endsWith("a") })
    println(numbers.all { it.endsWith("e") })

    println(emptyList<Int>().all { it > 5 })   // vacuous truth
//sampleEnd
}
```
{kotlin-runnable="true"}

`any()` 與 `none()` 也可以在不帶述詞的情況下使用：在此情況下，它們僅檢查集合是否為空。
若集合中有元素，`any()` 會傳回 `true`，若無則傳回 `false`；`none()` 則剛好相反。

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