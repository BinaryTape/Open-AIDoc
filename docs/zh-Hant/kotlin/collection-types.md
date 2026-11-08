[//]: # (title: 集合型別)

Kotlin 提供三種主要的集合型別：[List](#list)、[Set](#set) 以及 [Map](#map)。
請根據你需要儲存和存取資料的方式來選擇集合型別。

## List {id="list"}

[`List<T>`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/-list/index.html) 依特定順序儲存元素，並提供透過索引存取元素的功能。索引從零開始，
並結束於 `lastIndex`，即 `(list.size - 1)`。列表中可以包含重複的元素，包括對同一個物件的多個參照。

```kotlin
fun main() {
//sampleStart
    val numbers = listOf("one", "two", "three", "four")
    
    println("Number of elements: ${numbers.size}")
    // Number of elements: 4
    
    println("Third element: ${numbers.get(2)}")
    // Third element: three
    
    println("Fourth element: ${numbers[3]}")
    // Fourth element: four

    println("Index of element \"two\": ${numbers.indexOf("two")}")
    // Index of element "two": 1
//sampleEnd
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3"}

> 透過索引存取的效能取決於具體的 List 實作。當要處理列表中的所有元素時，
> 建議優先使用反覆運算，而非重複透過索引存取元素。
>
{style="tip"}

如果兩個列表的大小相同，且在相同位置上的元素[結構相等](equality.md#structural-equality)，則這兩個列表相等：

```kotlin
data class Person(var name: String, var age: Int)

fun main() {
//sampleStart
    val bob = Person("Bob", 31)
    val people = listOf(Person("Adam", 20), bob, bob)
    val people2 = listOf(Person("Adam", 20), Person("Bob", 31), bob)
    
    println(people == people2)
    // true
    
    bob.age = 32
    println(people == people2)
    // false
//sampleEnd
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3"}

[`MutableList<T>`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/-mutable-list/index.html) 是具有列表專用寫入操作的 `List`。與[陣列](arrays.md)不同，可變列表在新增或移除元素時可以改變大小。
你也可以替換特定位置的元素。例如：

```kotlin
fun main() {
//sampleStart
    val numbers = mutableListOf(1, 2, 3, 4)
    // 將元素新增至列表中
    numbers.add(5)
    // 移除索引 1 處的元素
    numbers.removeAt(1)
    // 替換索引 0 處的元素
    numbers[0] = 0
    
    numbers.shuffle()
    println(numbers)
//sampleEnd
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3"}

`MutableList` 的預設實作是 [`ArrayList`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/-array-list/index.html)。

## Set {id="set"}

[`Set<T>`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/-set/index.html) 儲存唯一的元素。`Set<T>` 介面不保證反覆運算順序，順序取決於具體實作。
如果其元素型別為可 null 且實作支援 `null`，則一個 set 最多只能包含一個 `null` 元素。  

如果兩個 set 的大小相同，且其中一個 set 的每個元素在另一個 set 中都有相等的元素，則這兩個 set 相等：

```kotlin
fun main() {
//sampleStart
    val numbers = setOf(1, 2, 3, 4)
    println("Number of elements: ${numbers.size}")
    // Number of elements: 4
    
    if (numbers.contains(1)) println("1 is in the set")
    // 1 is in the set

    val numbersBackwards = setOf(4, 3, 2, 1)
    println("The sets are equal: ${numbers == numbersBackwards}")
    // The sets are equal: true
//sampleEnd
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3"}

[`MutableSet<T>`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/-mutable-set/index.html) 是具有來自 `MutableCollection` 的寫入操作的 `Set`。

[`LinkedHashSet`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/-linked-hash-set/index.html) 是 `MutableSet` 的預設實作。它保留了元素的插入順序。
因此，依賴順序的函式（如 `first()` 和 `last()`）會傳回可預測的結果：

```kotlin
fun main() {
//sampleStart
    // LinkedHashSet 是預設實作
    val numbers = setOf(1, 2, 3, 4)
    val numbersBackwards = setOf(4, 3, 2, 1)
    
    println(numbers.first() == numbersBackwards.first())
    // false
    
    println(numbers.first() == numbersBackwards.last())
    // true
//sampleEnd
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3"}

如果你不需要可預測的反覆運算順序，可以使用替代實作 [`HashSet`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/-hash-set/index.html)，它比 `LinkedHashSet` 佔用更少的記憶體。
由於它不保證反覆運算順序，因此無法依賴 `first()` 或 `last()` 來依插入順序傳回元素。 

## Map {id="map"}

儘管 [`Map<K, V>`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/-map/index.html) 不是 `Collection` 介面的繼承者，但它也是一種 Kotlin 集合型別。
`Map` 儲存*鍵值組*（key-value pairs）或*項目*（entries）。鍵是唯一的，但不同的鍵可以對應到相等的值。
`Map` 介面提供了特定的函式，例如透過鍵存取值、搜尋鍵和值等。

```kotlin
fun main() {
//sampleStart
    val numbersMap = mapOf("key1" to 1, "key2" to 2, "key3" to 3, "key4" to 1)
    
    println("All keys: ${numbersMap.keys}")
    // All keys: [key1, key2, key3, key4]
    
    println("All values: ${numbersMap.values}")
    // All values: [1, 2, 3, 1]
    
    if ("key2" in numbersMap) println("Value by key \"key2\": ${numbersMap["key2"]}")
    // Value by key "key2": 2
    
    if (1 in numbersMap.values) println("The value 1 is in the map")
    // The value 1 is in the map
    
    // 使用 containsValue() 檢查值，等同於前一個條件
    if (numbersMap.containsValue(1)) println("The value 1 is in the map")
    // The value 1 is in the map
//sampleEnd
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3"}

如果鍵的型別為可 null 且實作支援 `null` 鍵，則 map 最多只能包含一個 `null` 鍵。
對 `null` 值的支援同樣取決於值的型別以及具體實作。

如果兩個 map 包含相同的鍵值組，無論順序為何，這兩個 map 都是相等的：

```kotlin
fun main() {
//sampleStart
    val numbersMap = mapOf("key1" to 1, "key2" to 2, "key3" to 3, "key4" to 1)    
    val anotherMap = mapOf("key2" to 2, "key1" to 1, "key4" to 1, "key3" to 3)
    
    println("The maps are equal: ${numbersMap == anotherMap}")
    // The maps are equal: true
//sampleEnd
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3"}

[`MutableMap<K, V>`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/-mutable-map/index.html) 是具有 map 專用寫入操作的 `Map`。例如，你可以新增新的鍵值組或更新與指定鍵關聯的值：

```kotlin
fun main() {
//sampleStart
    val numbersMap = mutableMapOf("one" to 1, "two" to 2)
    numbersMap.put("three", 3)
    numbersMap["one"] = 11

    println(numbersMap)
    // {one=11, two=2, three=3}
//sampleEnd
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3"}

[`LinkedHashMap`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/-linked-hash-map/index.html) 是 `MutableMap` 的預設實作。它保留了插入項目的順序。
相對地，[`HashMap`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/-hash-map/index.html) 是另一種替代實作，它不保證項目的順序。

## ArrayDeque {id="arraydeque"}

[`ArrayDeque<T>`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/-array-deque/) 是雙向佇列（double-ended queue）的實作。它允許你在 deque 的開頭或結尾新增或移除元素。在 Kotlin 中，`ArrayDeque` 同時扮演了堆疊（stack）和佇列（queue）資料結構的角色。
`ArrayDeque` 將元素儲存在可調整大小的陣列中：

```kotlin
fun main() {
    val deque = ArrayDeque(listOf(1, 2, 3))

    deque.addFirst(0)
    deque.addLast(4)
    println(deque)
    // [0, 1, 2, 3, 4]

    println(deque.first())
    // 0
    
    println(deque.last())
    // 4

    deque.removeFirst()
    deque.removeLast()
    println(deque)
    // [1, 2, 3]
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.4"}