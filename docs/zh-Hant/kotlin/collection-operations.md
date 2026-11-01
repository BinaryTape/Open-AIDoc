[//]: # (title: 集合操作概覽)

Kotlin 標準程式庫提供了多種多樣的函式，用於對集合執行操作。這包括簡單的操作（例如取得或新增元素），以及更複雜的操作（包括搜尋、排序、篩選、轉換等）。

## 擴充函式與成員函式 {id="extension-and-member-functions"}

集合操作在標準程式庫中以兩種方式宣告：集合介面的[成員函式](classes.md)與[擴充函式](extensions.md#extension-functions)。

成員函式定義了對集合型別至關重要的操作。例如，[`Collection`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/-collection/index.html) 包含用於檢查其是否為空的函式 [`isEmpty()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/-collection/is-empty.html)；[`List`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/-list/index.html) 包含用於透過索引存取元素的 [`get()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/-list/get.html) 等等。

當你建立自訂的集合介面實作時，必須實作它們的成員函式。為了簡化新實作的建立過程，請使用標準程式庫中集合介面的骨架實作：[`AbstractCollection`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/-abstract-collection/index.html)、[`AbstractList`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/-abstract-list/index.html)、[`AbstractSet`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/-abstract-set/index.html)、[`AbstractMap`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/-abstract-map/index.html) 以及它們對應的可變版本。

其他集合操作則宣告為擴充函式。這些包括篩選、轉換、排序及其他集合處理函式。

## 常見操作 {id="common-operations"}

通用操作對[唯讀與可變集合](collections-overview.md#collection-types)皆可用。通用操作分為以下幾組：

* [轉換](collection-transformations.md)
* [篩選](collection-filtering.md)
* [`plus` 與 `minus` 運算子](collection-plus-minus.md)
* [分組](collection-grouping.md)
* [擷取集合部分內容](collection-parts.md)
* [擷取單一元素](collection-elements.md)
* [排序](collection-ordering.md)
* [聚合操作](collection-aggregate.md)

這些頁面上描述的操作都會傳回結果，而不會影響原始集合。例如，篩選操作會產生一個包含所有符合篩選述詞之元素的*新集合*。此類操作的結果應該存儲在變數中，或以其他方式使用，例如傳遞給其他函式。

```kotlin

fun main() {
//sampleStart
    val numbers = listOf("one", "two", "three", "four")  
    numbers.filter { it.length > 3 }  // numbers 沒有任何變化，結果遺失
    println("numbers are still $numbers")
    val longerThan3 = numbers.filter { it.length > 3 } // 結果儲存於 longerThan3
    println("numbers longer than 3 chars are $longerThan3")
//sampleEnd
}
```
{kotlin-runnable="true"}

對於某些集合操作，可以選擇指定*目的地 (destination)* 物件。目的地是一個可變集合，函式會將產生的項目附加至其中，而不是在新的物件中傳回它們。若要執行具有目的地的操作，可以使用名稱帶有 `To` 後綴的獨立函式，例如使用 [`filterTo()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/filter-to.html) 取代 [`filter()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/filter.html)，或使用 [`associateTo()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/associate-to.html) 取代 [`associate()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/associate.html)。這些函式接受目的地集合做為額外參數。

```kotlin

fun main() {
//sampleStart
    val numbers = listOf("one", "two", "three", "four")
    val filterResults = mutableListOf<String>()  // 目的地物件
    numbers.filterTo(filterResults) { it.length > 3 }
    numbers.filterIndexedTo(filterResults) { index, _ -> index == 0 }
    println(filterResults) // 包含兩個操作的結果
//sampleEnd
}

```
{kotlin-runnable="true"}

為了方便起見，這些函式會傳回目的地集合，因此你可以直接在函式呼叫的對應引數中建立它：

```kotlin

fun main() {
    val numbers = listOf("one", "two", "three", "four")
//sampleStart
    // 直接將 numbers 篩選至新的 hash set，
    // 從而消除結果中的重複項目
    val result = numbers.mapTo(HashSet()) { it.length }
    println("distinct item lengths are $result")
//sampleEnd
}
```
{kotlin-runnable="true"}

帶有目的地的函式可用於篩選、關聯、分組、展平以及其他操作。有關目的地操作的完整清單，請參閱 [Kotlin 集合參考](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/index.html)。

## 寫入操作 {id="write-operations"}

對於可變集合，還存在會變更集合狀態的*寫入操作*。此類操作包括新增、移除與更新元素。寫入操作列於[寫入操作](collection-write.md)，以及 [List 專用操作](list-operations.md#list-write-operations)與 [Map 專用操作](map-operations.md#map-write-operations)的對應章節中。

對於某些操作，存在成對的函式來執行相同的操作：一個就地 (in-place) 套用操作，另一個則將結果做為獨立的集合傳回。例如，[`sort()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/sort.html) 會就地對可變集合進行排序，因此其狀態會改變；[`sorted()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/sorted.html) 則會建立一個包含相同元素但按排序順序排列的新集合。

```kotlin

fun main() {
//sampleStart
    val numbers = mutableListOf("one", "two", "three", "four")
    val sortedNumbers = numbers.sorted()
    println(numbers == sortedNumbers)  // false
    numbers.sort()
    println(numbers == sortedNumbers)  // true
//sampleEnd
}
```
{kotlin-runnable="true"}