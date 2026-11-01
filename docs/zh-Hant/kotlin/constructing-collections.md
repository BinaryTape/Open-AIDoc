[//]: # (title: 建構集合)

## 從元素建構 {id="construct-from-elements"}

建立集合最常見的方式是使用標準函式庫函式 [`listOf<T>()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/list-of.html)、[`setOf<T>()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/set-of.html)、[`mutableListOf<T>()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/mutable-list-of.html)、[`mutableSetOf<T>()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/mutable-set-of.html)。如果將以逗號分隔的集合元素清單作為引數傳入，編譯器會自動偵測元素型別。建立空集合時，請明確指定型別。

```kotlin
val numbersSet = setOf("one", "two", "three", "four")
val emptySet = mutableSetOf<String>()
```

Map 也有類似的函式：[`mapOf()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/map-of.html) 與 [`mutableMapOf()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/mutable-map-of.html)。Map 的鍵和值會以 `Pair` 物件傳遞（通常使用 `to` 中綴函式建立）。

```kotlin
val numbersMap = mapOf("key1" to 1, "key2" to 2, "key3" to 3, "key4" to 1)
```

請注意，`to` 標記法會建立一個生命週期短暫的 `Pair` 物件，因此建議僅在效能要求不嚴苛時使用。為了避免過度的記憶體使用量，可以使用替代方法。例如，你可以建立一個可變 Map，並使用寫入操作來填入資料。在此處，[`apply()`](scope-functions.md#apply) 函式有助於保持初始化的流暢性。

```kotlin
val numbersMap = mutableMapOf<String, String>().apply { this["one"] = "1"; this["two"] = "2" }
```

## 使用集合建構器函式建立 {id="create-with-collection-builder-functions"}

另一種建立集合的方法是呼叫建構器函式——[`buildList()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/build-list.html)、[`buildSet()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/build-set.html) 或 [`buildMap()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/build-map.html)。它們會建立相應型別的全新可變集合，使用[寫入操作](collection-write.md)填入資料，並傳回具有相同元素之唯讀集合：

```kotlin
val map = buildMap { // 這是 MutableMap<String, Int>，鍵與值的型別由下方的 `put()` 呼叫推論得出
    put("a", 1)
    put("b", 0)
    put("c", 4)
}

println(map) // {a=1, b=0, c=4}
```

## 空集合 {id="empty-collections"}

還有一些函式可用於建立不含任何元素的集合：[`emptyList()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/empty-list.html)、[`emptySet()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/empty-set.html) 以及 [`emptyMap()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/empty-map.html)。建立空集合時，應該指定集合將要保存的元素型別。

```kotlin
val empty = emptyList<String>()
```

## List 的初始化函式 {id="initializer-functions-for-lists"}

對於 List，有一個類似建構函式的函式，它接受 List 的大小以及根據索引定義元素值的初始化函式。

```kotlin
fun main() {
//sampleStart
    val doubled = List(3, { it * 2 })  // 若稍後想要變更其內容，也可以使用 MutableList
    println(doubled)
//sampleEnd
}
```
{kotlin-runnable="true"}

## 具體型別建構函式 {id="concrete-type-constructors"}

若要建立具體型別的集合（例如 `ArrayList` 或 `LinkedList`），可以使用這些型別提供的建構函式。`Set` 和 `Map` 的實作也有類似的建構函式可用。

```kotlin
val linkedList = LinkedList<String>(listOf("one", "two", "three"))
val presizedSet = HashSet<Int>(32)
```

## 複製 {id="copy"}

若要建立與現有集合具有相同元素的集合，可以使用複製函式。標準函式庫中的集合複製函式會建立包含相同元素參照的*淺層*複製 (shallow copy) 集合。因此，對集合元素的變更會反映在其所有複本中。

集合複製函式（例如 [`toList()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/to-list.html)、[`toMutableList()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/to-mutable-list.html)、[`toSet()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/to-set.html) 等）會建立集合在特定時刻的快照。其結果是包含相同元素的新集合。如果你從原始集合中新增或移除元素，這並不會影響複本。複本也可以獨立於來源進行修改。

```kotlin
class Person(var name: String)
fun main() {
//sampleStart
    val alice = Person("Alice")
    val sourceList = mutableListOf(alice, Person("Bob"))
    val copyList = sourceList.toList()
    sourceList.add(Person("Charles"))
    alice.name = "Alicia"
    println("First item's name is: ${sourceList[0].name} in source and ${copyList[0].name} in copy")
    println("List size is: ${sourceList.size} in source and ${copyList.size} in copy")
//sampleEnd
}
```
{kotlin-runnable="true"}

這些函式也可用於將集合轉換為其他型別，例如從 List 建立 Set，反之亦然。

```kotlin
fun main() {
//sampleStart
    val sourceList = mutableListOf(1, 2, 3)    
    val copySet = sourceList.toMutableSet()
    copySet.add(3)
    copySet.add(4)    
    println(copySet)
//sampleEnd
}
```
{kotlin-runnable="true"}

或者，你也可以建立指向同一個集合執行個體的新參照。當你使用現有集合初始化集合變數時，就會建立新的參照。因此，當透過某個參照修改集合執行個體時，這些變更會反映在其所有參照中。

```kotlin
fun main() {
//sampleStart
    val sourceList = mutableListOf(1, 2, 3)
    val referenceList = sourceList
    referenceList.add(4)
    println("Source size: ${sourceList.size}")
//sampleEnd
}
```
{kotlin-runnable="true"}

集合初始化可用於限制可變性。例如，如果你建立指向 `MutableList` 的 `List` 參照，當你嘗試透過該參照修改集合時，編譯器將會產生錯誤。

```kotlin
fun main() {
//sampleStart 
    val sourceList = mutableListOf(1, 2, 3)
    val referenceList: List<Int> = sourceList
    //referenceList.add(4)            //編譯錯誤
    sourceList.add(4)
    println(referenceList) // 顯示 sourceList 的目前狀態
//sampleEnd
}
```
{kotlin-runnable="true"}

## 在其他集合上叫用函式 {id="invoke-functions-on-other-collections"}

集合也可以作為對其他集合執行各種操作的結果而建立。例如，[篩選](collection-filtering.md) List 會建立一個包含符合篩選條件元素的新 List：

```kotlin
fun main() {
//sampleStart 
    val numbers = listOf("one", "two", "three", "four")  
    val longerThan3 = numbers.filter { it.length > 3 }
    println(longerThan3)
//sampleEnd
}
```
{kotlin-runnable="true"}

[對應](collection-transformations.md#map)會根據轉換的結果產生 List：

```kotlin
fun main() {
//sampleStart 
    val numbers = setOf(1, 2, 3)
    println(numbers.map { it * 3 })
    println(numbers.mapIndexed { idx, value -> value * idx })
//sampleEnd
}
```
{kotlin-runnable="true"}

[關聯](collection-transformations.md#associate)會產生 Map：

```kotlin
fun main() {
//sampleStart
    val numbers = listOf("one", "two", "three", "four")
    println(numbers.associateWith { it.length })
//sampleEnd
}
```
{kotlin-runnable="true"}

如需更多關於 Kotlin 集合操作的資訊，請參閱[集合操作概覽](collection-operations.md)。