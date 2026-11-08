[//]: # (title: 建立集合)

## 從元素建構 {id="construct-from-elements"}

建立集合最常見的方式是使用標準程式庫函式 [`listOf<T>()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/list-of.html)、
[`setOf<T>()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/set-of.html)、
[`mutableListOf<T>()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/mutable-list-of.html)、
[`mutableSetOf<T>()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/mutable-set-of.html)。
如果你提供以逗號分隔的集合元素清單作為引數，編譯器會自動偵測元素型別。建立空集合時，請明確指定型別。

```kotlin
val numbersSet = setOf("one", "two", "three", "four")
val emptySet = mutableSetOf<String>()
```

對於 Map 也有相應的函式 [`mapOf()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/map-of.html)
和 [`mutableMapOf()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/mutable-map-of.html)。Map 的鍵和值是以 `Pair` 物件的形式傳遞（通常使用 `to` 中綴函式建立）。

```kotlin
val numbersMap = mapOf("key1" to 1, "key2" to 2, "key3" to 3, "key4" to 1)
```

請注意，`to` 標記法會建立生命週期短暫的 `Pair` 物件，因此建議僅在效能非關鍵考量時使用。為避免過多的記憶體使用量，請使用其他替代方式。例如，你可以建立一個可變 Map 並透過寫入操作來填入資料。[`apply()`](scope-functions.md#apply) 函式有助於在此處保持流暢的初始化風格。

```kotlin
val numbersMap = mutableMapOf<String, String>().apply { this["one"] = "1"; this["two"] = "2" }
```

## 使用集合 builder 函式建立 {id="create-with-collection-builder-functions"}

另一種建立集合的方式是呼叫 builder 函式——
[`buildList()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/build-list.html)、[`buildSet()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/build-set.html)，
或 [`buildMap()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/build-map.html)。它們會建立對應型別的全新可變集合，使用[寫入操作](collection-write.md)填入元素，並傳回包含相同元素的唯讀集合：

```kotlin
val map = buildMap { // 這是 MutableMap<String, Int>，鍵與值的型別是由下方的 `put()` 呼叫推論得出
    put("a", 1)
    put("b", 0)
    put("c", 4)
}

println(map) // {a=1, b=0, c=4}
```

## 空集合 {id="empty-collections"}

還有用於建立不含任何元素的集合函式：[`emptyList()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/empty-list.html)、
[`emptySet()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/empty-set.html) 以及
[`emptyMap()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/empty-map.html)。
建立空集合時，應明確指定集合將容納的元素型別。

```kotlin
val empty = emptyList<String>()
```

## List 的初始設定函式 {id="initializer-functions-for-lists"}

對於 List，有一種類似建構函式的函式，它接受 List 的大小以及根據索引定義元素值的初始設定函式。

```kotlin
fun main() {
//sampleStart
    val doubled = List(3, { it * 2 })  // 如果稍後想要變更其內容，也可以使用 MutableList
    println(doubled)
//sampleEnd
}
```
{kotlin-runnable="true"}

## 具體型別建構函式 {id="concrete-type-constructors"}

若要建立具體型別的集合（例如 `ArrayList` 或 `LinkedList`），可以使用這些型別現有的建構函式。`Set` 和 `Map` 的實作也提供了類似的建構函式。

```kotlin
val linkedList = LinkedList<String>(listOf("one", "two", "three"))
val presizedSet = HashSet<Int>(32)
```

## 複製 {id="copy"}

若要建立與現有集合包含相同元素的集合，可以使用複製函式。標準程式庫中的集合複製函式會建立指向相同元素的*淺層*複製集合。因此，對集合元素所做的變更會反映在其所有複本中。

集合複製函式（例如 [`toList()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/to-list.html)、
[`toMutableList()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/to-mutable-list.html)、
[`toSet()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/to-set.html) 等）會建立集合在特定時刻的快照。其結果是包含相同元素的新集合。
若從原始集合中新增或移除元素，不會影響複本。複本也可以獨立於原始集合進行修改。

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

這些函式還可用於將集合轉換為其他型別，例如從 List 建立 Set，反之亦然。

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

此外，你也可以建立指向相同集合執行個體的新參照。當你使用現有集合初始化集合變數時，就會建立新參照。
因此，當透過參照修改該集合執行個體時，這些變更會反映在其所有參照中。

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

集合初始化可用於限制可變性。例如，如果你建立了一個指向 `MutableList` 的 `List` 參照，當你嘗試透過該參照修改集合時，編譯器將會產生錯誤。

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

## 對其他集合呼叫函式 {id="invoke-functions-on-other-collections"}

集合可以透過對其他集合執行各種操作來建立。例如，[篩選](collection-filtering.md) List 會建立一個包含符合篩選條件之元素的新 List：

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

[對應](collection-transformations.md#map)會根據轉換結果產生一個 List：

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

若要進一步了解 Kotlin 中的集合操作，請參閱[集合操作概觀](collection-operations.md)。