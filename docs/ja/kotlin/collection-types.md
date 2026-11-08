[//]: # (title: コレクション型)

Kotlinは主に3つのコレクション型を提供しています: [List](#list)、[Set](#set)、および[Map](#map)。
データの格納方法やアクセス方法の要件に応じて、適切なコレクション型を選択してください。

## List {id="list"}

[`List<T>`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/-list/index.html) は要素を指定された順序で格納し、それらの要素へのインデックスアクセスを提供します。インデックスは0から始まり、`lastIndex`（`(list.size - 1)`）で終わります。リストには重複する要素を含めることができ、同一オブジェクトへの複数の参照を含めることも可能です。

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

> インデックスアクセスのパフォーマンスはリストの実装によって異なります。リストのすべての要素を処理する場合は、インデックスを使って繰り返し要素にアクセスするよりも、イテレーション（反復処理）を優先してください。
>
{style="tip"}

2つのリストは、サイズが等しく、同じ位置にある要素同士が[構造的に等価](equality.md#structural-equality)である場合に等しいとみなされます:

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

[`MutableList<T>`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/-mutable-list/index.html) は、リスト固有の書き込み操作を備えた `List` です。[配列（Array）](arrays.md)とは異なり、可変リストは要素の追加や削除によってサイズを変更できます。また、特定の位置にある要素を置き換えることも可能です。例:

```kotlin
fun main() {
//sampleStart
    val numbers = mutableListOf(1, 2, 3, 4)
    // リストに要素を追加
    numbers.add(5)
    // インデックス1の要素を削除
    numbers.removeAt(1)
    // インデックス0の要素を置換
    numbers[0] = 0
    
    numbers.shuffle()
    println(numbers)
//sampleEnd
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3"}

`MutableList` のデフォルトの実装は [`ArrayList`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/-array-list/index.html) です。

## Set {id="set"}

[`Set<T>`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/-set/index.html) は一意の要素（重複のない要素）を格納します。`Set<T>` インターフェースは反復処理の順序（イテレーション順序）を保証しません。順序は実装に依存します。要素の型が nullable であり、かつ実装が `null` をサポートしている場合、セットは最大で1つの `null` 要素を含めることができます。

2つのセットは、サイズが等しく、一方のセットの各要素に対応する等しい要素がもう一方のセットにも存在する場合に等しいとみなされます:

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

[`MutableSet<T>`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/-mutable-set/index.html) は、`MutableCollection` からの書き込み操作を備えた `Set` です。

[`LinkedHashSet`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/-linked-hash-set/index.html) は `MutableSet` のデフォルトの実装です。これは要素が挿入された順序を保持します。そのため、`first()` や `last()` などの順序に依存する関数は、予測可能な結果を返します:

```kotlin
fun main() {
//sampleStart
    // LinkedHashSetがデフォルトの実装
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

予測可能なイテレーション順序が不要な場合は、代替実装である [`HashSet`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/-hash-set/index.html) を使用できます。これは `LinkedHashSet` よりもメモリ消費が少なくなります。ただしイテレーション順序を保証しないため、`first()` や `last()` が要素を挿入順に返すことに依存することはできません。

## Map {id="map"}

[`Map<K, V>`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/-map/index.html) は `Collection` インターフェースを継承していませんが、Kotlinのコレクション型の1つです。
`Map` は*キーと値のペア*（key-value pairs）、または*エントリ*（entries）を格納します。キーは一意ですが、異なるキーに等しい値が関連付けられることは可能です。
`Map` インターフェースは、キーによる値へのアクセス、キーや値の検索など、固有の関数を提供します。

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
    
    // containsValue()で値をチェック。直前の条件と同等
    if (numbersMap.containsValue(1)) println("The value 1 is in the map")
    // The value 1 is in the map
//sampleEnd
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3"}

キーの型が nullable であり、かつ実装が `null` キーをサポートしている場合、マップは最大で1つの `null` キーを含めることができます。`null` 値のサポートも値の型と実装に依存します。

2つのマップは、順序に関係なく、同じキーと値のペアを含んでいる場合に等しいとみなされます:

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

[`MutableMap<K, V>`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/-mutable-map/index.html) は、マップ固有の書き込み操作を備えた `Map` です。例えば、新しいキーと値のペアを追加したり、指定されたキーに関連付けられた値を更新したりできます:

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

[`LinkedHashMap`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/-linked-hash-map/index.html) は `MutableMap` のデフォルトの実装です。これはエントリを挿入した順序を保持します。一方、[`HashMap`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/-hash-map/index.html) は代替の実装であり、エントリの順序を保証しません。

## ArrayDeque {id="arraydeque"}

[`ArrayDeque<T>`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/-array-deque/) は両端キュー（double-ended queue）の実装です。デック（deque）の先頭または末尾のいずれからも要素を追加または削除できます。また、`ArrayDeque` はKotlinにおいてスタックとキューの両方のデータ構造の役割を果たします。
`ArrayDeque` はその要素をサイズ変更可能な配列に格納します:

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