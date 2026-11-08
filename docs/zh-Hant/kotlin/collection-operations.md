[//]: # (title: 集合操作概觀)

Kotlin 標準函式庫提供了豐富多樣的函式，用於對集合執行操作。這包括簡單的操作（例如取得或新增元素），以及更複雜的操作（包括搜尋、排序、篩選、轉換等）。

## 擴充函式與成員函式 {id="extension-and-member-functions"}

集合操作在標準函式庫中以兩種方式宣告：集合介面的[成員函式](classes.md)以及[擴充函式](extensions.md#extension-functions)。

成員函式定義了對於集合型別不可或缺的操作。例如，[`Collection`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/-collection/index.html) 包含用於檢查是否為空的 [`isEmpty()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/-collection/is-empty.html) 函式；[`List`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/-list/index.html) 包含用於透過索引存取元素的 [`get()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/-list/get.html)，依此類推。

當你建立自己的集合介面實作時，必須實作其成員函式。為了簡化新實作的建立過程，可以使用標準函式庫中集合介面的骨幹實作（skeletal implementations）：[`AbstractCollection`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/-abstract-collection/index.html)、[`AbstractList`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/-abstract-list/index.html)、[`AbstractSet`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/-abstract-set/index.html)、[`AbstractMap`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/-abstract-map/index.html)，以及它們的可變對應版本。

其他集合操作則宣告為擴充函式。這些包括篩選、轉換、排序以及其他集合處理函式。

## 通用操作 {id="common-operations"}

[唯讀集合與可變集合](collections-overview.md#read-only-and-mutable-collections)均可使用通用操作。通用操作分為以下幾類：

* [轉換](collection-transformations.md)
* [篩選](collection-filtering.md)
* [`plus` 與 `minus` 運算子](collection-combine.md)
* [分組](collection-grouping.md)
* [擷取集合部分內容](collection-parts.md)
* [擷取單一元素](collection-elements.md)
* [排序](collection-ordering.md)
* [聚合操作](collection-aggregate.md)

這些頁面所說明的操作會在不影響原始集合的情況下回傳結果。例如，篩選操作會產生一個包含所有符合篩選謂詞（predicate）元素的「新集合」。此類操作的結果應儲存在變數中，或以其他方式使用（例如傳遞給其他函式）。

```kotlin

fun main() {
//sampleStart
    val numbers = listOf("one", "two", "three", "four")  
    numbers.filter { it.length > 3 }  // 對 numbers 沒有任何影響，結果會遺失
    println("numbers are still $numbers")
    val longerThan3 = numbers.filter { it.length > 3 } // 結果儲存在 longerThan3 中
    println("numbers longer than 3 chars are $longerThan3")
//sampleEnd
}
```
{kotlin-runnable="true"}

對於某些集合操作，可以選擇指定「目標（destination）」物件。目標是一個可變集合，函式會將其結果項目附加到其中，而不是在新物件中回傳它們。為了執行帶有目標的操作，有獨立的函式在名稱中帶有 `To` 後綴，例如以 [`filterTo()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/filter-to.html) 代替 [`filter()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/filter.html)，或以 [`associateTo()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/associate-to.html) 代替 [`associate()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/associate.html)。這些函式將目標集合當作額外參數傳入。

```kotlin

fun main() {
//sampleStart
    val numbers = listOf("one", "two", "three", "four")
    val filterResults = mutableListOf<String>()  // 目標物件
    numbers.filterTo(filterResults) { it.length > 3 }
    numbers.filterIndexedTo(filterResults) { index, _ -> index == 0 }
    println(filterResults) // 包含兩個操作的結果
//sampleEnd
}

```
{kotlin-runnable="true"}

為了方便起見，這些函式會回傳該目標集合，因此你可以直接在函式呼叫的對應引數中建立它：

```kotlin

fun main() {
    val numbers = listOf("one", "two", "three", "four")
//sampleStart
    // 直接將數字篩選到新的雜湊集 (hash set) 中，
    // 從而消除結果中的重複項目
    val result = numbers.mapTo(HashSet()) { it.length }
    println("distinct item lengths are $result")
//sampleEnd
}
```
{kotlin-runnable="true"}

帶有目標的函式可用於篩選、關聯（association）、分組、扁平化（flattening）以及其他操作。如需目標操作的完整清單，請參閱 [Kotlin 集合參考文件](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/index.html)。

## 寫入操作 {id="write-operations"}

對於可變集合，還有會變更集合狀態的「寫入操作（write operations）」。這些操作包括新增、移除和更新元素。寫入操作列於[寫入操作](collection-write.md)以及 [List 專用操作](list-operations.md#list-write-operations)和 [Map 專用操作](map-operations.md#map-write-operations)的對應章節中。

對於某些操作，存在成對的函式來執行相同的操作：一個直接就地（in-place）套用操作，另一個則將結果作為獨立的集合回傳。例如，[`sort()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/sort.html) 會就地對可變集合進行排序，因此其狀態會改變；而 [`sorted()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/sorted.html) 則會建立一個包含相同元素但已排序的新集合。

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