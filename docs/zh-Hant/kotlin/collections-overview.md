[//]: # (title: 集合總覽)

Kotlin 標準函式庫提供了一套全面的工具來管理 _collections_ (集合) — 即變數數量項目的群組 (數量可能為零)，這些項目對於解決問題至關重要且經常被操作。

集合是大多數程式語言的共同概念，因此如果您熟悉 Java 或 Python 的集合，您可以跳過此簡介並直接進入詳細章節。 

一個集合通常包含多個相同型別 (及其子型別) 的物件。集合中的物件稱為 _elements_ (元素) 或 _items_ (項目)。例如，一個系所中的所有學生組成一個集合，可用於計算他們的平均年齡。

以下是 Kotlin 中相關的集合型別：

* _List_ 是一個有序集合，透過索引 (反映其位置的整數) 來存取元素。元素在 List 中可以出現多次。List 的一個例子是電話號碼：它是一組數字，其順序很重要，且可以重複。 
* _Set_ 是唯一元素的集合。它反映了數學上的集合抽象：一組沒有重複物件的群組。通常，Set 元素的順序並不重要。例如，樂透彩券上的號碼組成一個 Set：它們是唯一的，且順序不重要。
* _Map_ (或稱為 _dictionary_) 是一組鍵值對 (key-value pairs) 的集合。鍵 (Keys) 是唯一的，每個鍵正好對應一個值。值 (Values) 可以重複。Map 對於儲存物件之間的邏輯連結非常有用，例如員工 ID 及其職位。

Kotlin 讓您可以獨立於儲存物件的具體型別來操作集合。換句話說，您將一個 `String` 加入 `String` List 的方式，與加入 `Int` 或使用者定義類別的方式完全相同。因此，Kotlin 標準函式庫提供了泛型介面、類別與函式，用於建立、填充及管理任何型別的集合。

集合介面及相關函式位於 `kotlin.collections` 套件中。讓我們來概覽其內容。

> 陣列 (Arrays) 並非集合型別。如需更多資訊，請參閱 [Arrays](arrays.md)。
>
{style="note"}

## 集合型別 (Collection types) {id="collection-types"}

Kotlin 標準函式庫提供了基本集合型別的實作：Set、List 與 Map。每一種集合型別都由一對介面代表： 

* 一個 _唯讀_ (read-only) 介面，提供存取集合元素的操作。
* 一個 _可變_ (mutable) 介面，擴充了相應的唯讀介面，並增加寫入操作：加入、移除與更新其元素。

請注意，可變集合不一定要指派給 [`var`](basic-syntax.md#variables)。即使將可變集合指派給 `val`，仍然可以進行寫入操作。將可變集合指派給 `val` 的好處是，您可以保護該可變集合的參照不被修改。隨著時間推移，當您的程式碼增長並變得更加複雜時，防止參照被意外修改變得更加重要。盡可能使用 `val` 以編寫更安全、更健壯的程式碼。如果您嘗試重新指派一個 `val` 集合，將會產生編譯錯誤：

```kotlin
fun main() {
//sampleStart
    val numbers = mutableListOf("one", "two", "three", "four")
    numbers.add("five")   // 這是可以的
    println(numbers)
    //numbers = mutableListOf("six", "seven")      // 編譯錯誤
//sampleEnd

}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3"}

唯讀集合型別是 [協變 (covariant)](generics.md#variance) 的。這意味著，如果 `Rectangle` 類別繼承自 `Shape`，您可以在任何需要 `List<Shape>` 的地方使用 `List<Rectangle>`。換句話說，集合型別具有與元素型別相同的子型別關係。Map 在值型別上是協變的，但在鍵型別上則不是。

相應地，可變集合則不是協變的；否則會導致執行時失敗。如果 `MutableList<Rectangle>` 是 `MutableList<Shape>` 的子型別，您就可以將其他 `Shape` 的繼承者 (例如 `Circle`) 插入其中，從而違反了其 `Rectangle` 型別參數。

以下是 Kotlin 集合介面的圖表：

![集合介面階層結構](collections-diagram.png){width="500"}

讓我們來看看這些介面及其實作。要了解 `Collection`，請閱讀下面的章節。要了解 `List`、`Set` 和 `Map`，您可以閱讀相應的章節或觀看 Kotlin 技術傳教士 (Developer Advocate) Sebastian Aigner 的影片：

<video src="https://www.youtube.com/v/F8jj7e-_jFA" title="Kotlin Collections Overview"/>

### Collection {id="collection"}

[`Collection<T>`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/-collection/index.html) 是集合階層結構的根。此介面代表了唯讀集合的共同行為：檢索大小、檢查項目成員是否存在等等。`Collection` 繼承自 `Iterable<T>` 介面，該介面定義了反覆運算元素的運作。您可以將 `Collection` 作為適用於不同集合型別的函式參數。對於更具體的情況，請使用 `Collection` 的繼承者：[`List`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/-list/index.html) 和 [`Set`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/-set/index.html)。

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
{kotlin-runnable="true" kotlin-min-compiler-version="1.3"}

[`MutableCollection<T>`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/-mutable-collection/index.html) 是一個具有寫入操作 (如 `add` 和 `remove`) 的 `Collection`。

```kotlin
fun List<String>.getShortWordsTo(shortWords: MutableList<String>, maxLength: Int) {
    this.filterTo(shortWords) { it.length <= maxLength }
    // 剔除冠詞
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
{kotlin-runnable="true" kotlin-min-compiler-version="1.3"}

### List {id="list"}

[`List<T>`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/-list/index.html) 以指定順序儲存元素，並提供對它們的索引存取。索引從零開始 (第一個元素的索引)，直到 `lastIndex`，即 `(list.size - 1)`。

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
{kotlin-runnable="true" kotlin-min-compiler-version="1.3"}

List 元素 (包括 null) 可以重複：一個 List 可以包含任何數量的相等物件或單一物件的多次出現。如果兩個 List 具有相同的大小，且在相同位置具有 [結構相等 (structurally equal)](equality.md#structural-equality) 的元素，則認為這兩個 List 是相等的。

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
{kotlin-runnable="true" kotlin-min-compiler-version="1.3"}

[`MutableList<T>`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/-mutable-list/index.html) 是一個具有 List 特定寫入操作的 `List`，例如，在特定位置新增或移除元素。

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
{kotlin-runnable="true" kotlin-min-compiler-version="1.3"}

如您所見，在某些方面 List 與陣列非常相似。然而，有一個重要的區別：陣列的大小在初始化時就已定義且永遠不會改變；而 List 沒有預定義的大小，List 的大小可以隨寫入操作 (新增、更新或移除元素) 而改變。

在 Kotlin 中，`MutableList` 的預設實作是 [`ArrayList`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/-array-list/index.html)，您可以將其視為可調整大小的陣列。

### Set {id="set"}

[`Set<T>`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/-set/index.html) 儲存唯一元素；其順序通常是未定義的。`null` 元素也是唯一的：一個 `Set` 只能包含一個 `null`。如果兩個 Set 具有相同的大小，且對於一個 Set 的每個元素，在另一個 Set 中都有一個相等的元素，則這兩個 Set 是相等的。

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
{kotlin-runnable="true" kotlin-min-compiler-version="1.3"}

[`MutableSet`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/-mutable-set/index.html) 是一個具有來自 `MutableCollection` 的寫入操作的 `Set`。

`MutableSet` 的預設實作 — [`LinkedHashSet`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/-linked-hash-set/index.html) — 會保留元素插入的順序。因此，依賴順序的函式 (如 `first()` 或 `last()`) 在此類 Set 上會傳回可預測的結果。

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
{kotlin-runnable="true" kotlin-min-compiler-version="1.3"}

另一種實作 — [`HashSet`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/-hash-set/index.html) — 不保證元素順序，因此對其呼叫此類函式會傳回不可預測的結果。然而，`HashSet` 在儲存相同數量的元素時需要較少的記憶體。

### Map {id="map"}

[`Map<K, V>`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/-map/index.html) 不是 `Collection` 介面的繼承者；然而，它也是一種 Kotlin 集合型別。`Map` 儲存 _鍵值對_ (或稱為 _entries_)；鍵是唯一的，但不同的鍵可以配對到相等的值。`Map` 介面提供了特定的功能，例如透過鍵存取值、搜尋鍵和值等。

```kotlin
fun main() {
//sampleStart
    val numbersMap = mapOf("key1" to 1, "key2" to 2, "key3" to 3, "key4" to 1)
    
    println("All keys: ${numbersMap.keys}")
    println("All values: ${numbersMap.values}")
    if ("key2" in numbersMap) println("Value by key \"key2\": ${numbersMap["key2"]}")    
    if (1 in numbersMap.values) println("The value 1 is in the map")
    if (numbersMap.containsValue(1)) println("The value 1 is in the map") // 與前一個相同
//sampleEnd
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3"}

無論鍵值對的順序如何，包含相等鍵值對的兩個 Map 都是相等的。

```kotlin
fun main() {
//sampleStart
    val numbersMap = mapOf("key1" to 1, "key2" to 2, "key3" to 3, "key4" to 1)    
    val anotherMap = mapOf("key2" to 2, "key1" to 1, "key4" to 1, "key3" to 3)
    
    println("The maps are equal: ${numbersMap == anotherMap}")
//sampleEnd
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3"}

[`MutableMap`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/-mutable-map/index.html) 是一個具有 Map 寫入操作的 `Map`，例如，您可以新增一個新的鍵值對或更新與給定鍵關聯的值。

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
{kotlin-runnable="true" kotlin-min-compiler-version="1.3"}

`MutableMap` 的預設實作 — [`LinkedHashMap`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/-linked-hash-map/index.html) — 在反覆運算 Map 時會保留元素插入的順序。相應地，另一種實作 — [`HashMap`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/-hash-map/index.html) — 則不保證元素順序。

### ArrayDeque {id="arraydeque"}

[`ArrayDeque<T>`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/-array-deque/) 是雙端隊列的實作，它允許您在隊列的開頭或結尾新增或移除元素。因此，`ArrayDeque` 在 Kotlin 中同時充當了堆疊 (Stack) 和隊列 (Queue) 資料結構的角色。在幕後，`ArrayDeque` 是使用可調整大小的陣列實現的，該陣列會在需要時自動調整大小：

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