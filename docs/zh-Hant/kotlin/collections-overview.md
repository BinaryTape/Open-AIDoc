[//]: # (title: 集合概覽)

Kotlin 標準函式庫提供了一套完整的工具來管理 _集合 (collections)_ —— 由可變數量（可能為零）的項目組成的群組，這些項目對於要解決的問題至關重要且經常被操作。

集合是大多數程式語言中的常見概念，因此如果您熟悉例如 Java 或 Python 的集合，可以跳過這篇簡介並直接閱讀詳細章節。

一個集合通常包含多個相同型別（及其子型別）的物件。集合中的物件稱為 _元素 (elements)_ 或 _項目 (items)_。例如，一個系所的所有學生構成一個集合，可用於計算他們的平均年齡。

以下是與 Kotlin 相關的集合型別：

* _List_ 是一種有序集合，可透過索引（反映其位置的整數）存取元素。元素可以在清單中出現多次。電話號碼就是 List 的一個範例：它是一組數字，順序很重要，而且數字可以重複。
* _Set_ 是不重複元素的集合。它反映了數學上的集合抽象：一組沒有重複的物件。通常，Set 中元素的順序沒有意義。例如，樂透彩券上的號碼構成一個 Set：它們是唯一的，且順序並不重要。
* _Map_（或 _字典 (dictionary)_）是一組鍵值對（key-value pairs）的集合。鍵（Key）是唯一的，且每個鍵都剛好對應到一個值（Value）。值可以重複。Map 對於儲存物件之間的邏輯關聯非常有用，例如員工的 ID 與其職位。

Kotlin 讓您可以獨立於集合中儲存的具體物件型別來操作集合。換句話說，將 `String` 新增到 `String` 清單中的方式，與處理 `Int` 或使用者自訂類別的方式完全相同。因此，Kotlin 標準函式庫提供了泛型介面、類別與函式，用於建立、填入和管理任何型別的集合。

集合介面及其相關函式位於 `kotlin.collections` 套件中。讓我們來概覽其內容。

> 陣列並非集合的一種型別。若要了解更多資訊，請參閱 [Arrays](arrays.md)。
>
{style="note"}

## 集合型別 {id="collection-types"}

Kotlin 標準函式庫提供了基本集合型別的實作：Set、List 與 Map。每一種集合型別都由一對介面表示：

* 一個 _唯讀 (read-only)_ 介面，提供存取集合元素的操作。
* 一個 _可變 (mutable)_ 介面，透過寫入操作（新增、移除和更新元素）擴充對應的唯讀介面。

請注意，可變集合不一定非要指派給 [`var`](basic-syntax.md#variables)。即使將可變集合指派給 `val`，仍然可以對其執行寫入操作。將可變集合指派給 `val` 的好處是，可以防止該可變集合的參照遭到修改。隨著時間推移，當程式碼規模增長且變得更複雜時，防止參照被非預期修改將變得更加重要。盡量使用 `val` 以撰寫更安全且更穩健的程式碼。如果您嘗試重新指派 `val` 集合，將會收到編譯錯誤：

```kotlin
fun main() {
//sampleStart
    val numbers = mutableListOf("one", "two", "three", "four")
    numbers.add("five")   // 這樣是可以的
    println(numbers)
    //numbers = mutableListOf("six", "seven")      // 編譯錯誤
//sampleEnd

}
```
{kotlin-runnable="true"}

唯讀集合型別是[協變的 (covariant)](generics.md#variance)。這意味著如果 `Rectangle` 類別繼承自 `Shape`，您可以在任何需要 `List<Shape>` 的地方使用 `List<Rectangle>`。換句話說，集合型別具有與元素型別相同的子型別化 (subtyping) 關係。Map 在值型別上是協變的，但在鍵型別上則不是。

反之，可變集合不是協變的；否則會導致執行時期失敗。如果 `MutableList<Rectangle>` 是 `MutableList<Shape>` 的子型別，您就可以將其他 `Shape` 的繼承者（例如 `Circle`）插入其中，進而違反其 `Rectangle` 型別引數。

下方是 Kotlin 集合介面的階層結構圖：

![集合介面階層結構](collections-diagram.png){width="500"}

讓我們逐一了解這些介面及其實作。若要了解 `Collection`，請閱讀下方章節。若要了解 `List`、`Set` 和 `Map`，您可以閱讀對應章節，或觀看 Kotlin 技術傳教士 Sebastian Aigner 帶來的影片：

<video src="https://www.youtube.com/v/F8jj7e-_jFA" title="Kotlin Collections Overview"/>

### Collection {id="collection"}

[`Collection<T>`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/-collection/index.html) 是集合階層結構的根。此介面代表唯讀集合的通用行為：取得大小、檢查項目是否存在等等。`Collection` 繼承自 `Iterable<T>` 介面，該介面定義了反覆運算元素的相關操作。您可以將 `Collection` 用作適用於不同集合型別之函式的參數。對於更具體的使用案例，請使用 `Collection` 的繼承者：[`List`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/-list/index.html) 和 [`Set`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/-set/index.html)。

```kotlin
fun printAll(strings: Collection<String>) {
    for(s in strings) print("$s ")
    println()
}
    
fun main() {
    val stringList = listOf("one", "two", "one")
    printAll(stringList)
    
    val stringSet = setOf("one", "two", "three")
    printAll(stringSet)
}
```
{kotlin-runnable="true"}

[`MutableCollection<T>`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/-mutable-collection/index.html) 是具有寫入操作（例如 `add` 和 `remove`）的 `Collection`。

```kotlin
fun List<String>.getShortWordsTo(shortWords: MutableList<String>, maxLength: Int) {
    this.filterTo(shortWords) { it.length <= maxLength }
    // 丟棄冠詞
    val articles = setOf("a", "A", "an", "An", "the", "The")
    shortWords -= articles
}

fun main() {
    val words = "A long time ago in a galaxy far far away".split(" ")
    val shortWords = mutableListOf<String>()
    words.getShortWordsTo(shortWords, 3)
    println(shortWords)
}
```
{kotlin-runnable="true"}

### List {id="list"}

[`List<T>`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/-list/index.html) 以特定順序儲存元素，並提供以索引存取元素的方式。索引從零開始（即第一個元素的索引），一直到 `lastIndex`（即 `(list.size - 1)`）。

```kotlin
fun main() {
//sampleStart
    val numbers = listOf("one", "two", "three", "four")
    println("Number of elements: ${numbers.size}")
    println("Third element: ${numbers.get(2)}")
    println("Fourth element: ${numbers[3]}")
    println("Index of element \"two\" ${numbers.indexOf("two")}")
//sampleEnd
}
```
{kotlin-runnable="true"}

List 的元素（包括 null）可以重複：一個清單可以包含任意數量的相等物件，或是同一個物件的多次出現。如果兩個 List 具有相同的大小，且在相同位置上具有[結構相等 (structurally equal)](equality.md#structural-equality)的元素，則視為相等。

```kotlin
data class Person(var name: String, var age: Int)

fun main() {
//sampleStart
    val bob = Person("Bob", 31)
    val people = listOf(Person("Adam", 20), bob, bob)
    val people2 = listOf(Person("Adam", 20), Person("Bob", 31), bob)
    println(people == people2)
    bob.age = 32
    println(people == people2)
//sampleEnd
}
```
{kotlin-runnable="true"}

[`MutableList<T>`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/-mutable-list/index.html) 是一個具有 List 專屬寫入操作的 `List`，例如在特定位置新增或移除元素。

```kotlin
fun main() {
//sampleStart
    val numbers = mutableListOf(1, 2, 3, 4)
    numbers.add(5)
    numbers.removeAt(1)
    numbers[0] = 0
    numbers.shuffle()
    println(numbers)
//sampleEnd
}
```
{kotlin-runnable="true"}

如您所見，在某些方面清單與陣列非常相似。然而，有一個重要的區別：陣列的大小在初始化時就已確定且無法更改；而 List 則沒有預定義的大小，List 的大小可以隨著寫入操作（新增、更新或移除元素）而改變。

在 Kotlin 中，`MutableList` 的預設實作是 [`ArrayList`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/-array-list/index.html)，您可以將其視為可動態調整大小的陣列。

### Set {id="set"}

[`Set<T>`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/-set/index.html) 儲存不重複的元素；其順序通常是未定義的。`null` 元素也是唯一的：一個 `Set` 只能包含一個 `null`。如果兩個 Set 的大小相同，且其中一個 Set 的每個元素在另一個 Set 中都能找到相等的元素，則這兩個 Set 相等。

```kotlin
fun main() {
//sampleStart
    val numbers = setOf(1, 2, 3, 4)
    println("Number of elements: ${numbers.size}")
    if (numbers.contains(1)) println("1 is in the set")

    val numbersBackwards = setOf(4, 3, 2, 1)
    println("The sets are equal: ${numbers == numbersBackwards}")
//sampleEnd
}
```
{kotlin-runnable="true"}

[`MutableSet`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/-mutable-set/index.html) 是一個帶有來自 `MutableCollection` 之寫入操作的 `Set`。

`MutableSet` 的預設實作 —— [`LinkedHashSet`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/-linked-hash-set/index.html) —— 會保留元素插入的順序。因此，依賴順序的函式（例如 `first()` 或 `last()`）在此類 Set 上會傳回可預測的結果。

```kotlin
fun main() {
//sampleStart
    val numbers = setOf(1, 2, 3, 4)  // LinkedHashSet 是預設實作
    val numbersBackwards = setOf(4, 3, 2, 1)
    
    println(numbers.first() == numbersBackwards.first())
    println(numbers.first() == numbersBackwards.last())
//sampleEnd
}
```
{kotlin-runnable="true"}

另一種替代實作 —— [`HashSet`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/-hash-set/index.html) —— 不保證任何元素順序，因此在其上呼叫此類函式會傳回不可預測的結果。不過，`HashSet` 儲存相同數量的元素所需的記憶體較少。

### Map {id="map"}

[`Map<K, V>`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/-map/index.html) 並不是 `Collection` 介面的繼承者；不過，它也是一種 Kotlin 集合型別。`Map` 儲存 _鍵值對 (key-value pairs)_（或稱 _條目 (entries)_）；鍵是唯一的，但不同的鍵可以與相等的值配對。`Map` 介面提供了特定的函式，例如透過鍵存取值、搜尋鍵和值等。

```kotlin
fun main() {
//sampleStart
    val numbersMap = mapOf("key1" to 1, "key2" to 2, "key3" to 3, "key4" to 1)
    
    println("All keys: ${numbersMap.keys}")
    println("All values: ${numbersMap.values}")
    if ("key2" in numbersMap) println("Value by key \"key2\": ${numbersMap["key2"]}")    
    if (1 in numbersMap.values) println("The value 1 is in the map")
    if (numbersMap.containsValue(1)) println("The value 1 is in the map") // 與前一項相同
//sampleEnd
}
```
{kotlin-runnable="true"}

包含相等鍵值對的兩個 Map 是相等的，不論鍵值對的順序為何。

```kotlin
fun main() {
//sampleStart
    val numbersMap = mapOf("key1" to 1, "key2" to 2, "key3" to 3, "key4" to 1)    
    val anotherMap = mapOf("key2" to 2, "key1" to 1, "key4" to 1, "key3" to 3)
    
    println("The maps are equal: ${numbersMap == anotherMap}")
//sampleEnd
}
```
{kotlin-runnable="true"}

[`MutableMap`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/-mutable-map/index.html) 是一個具有 Map 寫入操作的 `Map`，例如您可以新增一個鍵值對，或更新與指定鍵關聯的值。

```kotlin
fun main() {
//sampleStart
    val numbersMap = mutableMapOf("one" to 1, "two" to 2)
    numbersMap.put("three", 3)
    numbersMap["one"] = 11

    println(numbersMap)
//sampleEnd
}
```
{kotlin-runnable="true"}

`MutableMap` 的預設實作 —— [`LinkedHashMap`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/-linked-hash-map/index.html) —— 在反覆運算 Map 時會保留元素插入的順序。反之，另一種替代實作 —— [`HashMap`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/-hash-map/index.html) —— 則完全不保證元素順序。

### ArrayDeque {id="arraydeque"}

[`ArrayDeque<T>`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/-array-deque/) 是雙端佇列（double-ended queue）的實作，它允許您在佇列的開頭或結尾新增或移除元素。因此，`ArrayDeque` 在 Kotlin 中同時兼具堆疊（Stack）與佇列（Queue）資料結構的角色。在底層，`ArrayDeque` 是使用可動態調整大小的陣列來實現的，該陣列在需要時會自動調整大小：

```kotlin
fun main() {
    val deque = ArrayDeque(listOf(1, 2, 3))

    deque.addFirst(0)
    deque.addLast(4)
    println(deque) // [0, 1, 2, 3, 4]

    println(deque.first()) // 0
    println(deque.last()) // 4

    deque.removeFirst()
    deque.removeLast()
    println(deque) // [1, 2, 3]
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.4"}