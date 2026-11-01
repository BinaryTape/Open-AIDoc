[//]: # (title: コレクションの作成)

## 要素から作成する {id="construct-from-elements"}

コレクションを作成する最も一般的な方法は、標準ライブラリ関数の [`listOf<T>()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/list-of.html)、
[`setOf<T>()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/set-of.html)、
[`mutableListOf<T>()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/mutable-list-of.html)、
[`mutableSetOf<T>()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/mutable-set-of.html) を使用することです。
引数としてカンマ区切りのコレクション要素のリストを渡すと、コンパイラは要素の型を自動的に推論します。
空のコレクションを作成する場合は、型を明示的に指定します。

```kotlin
val numbersSet = setOf("one", "two", "three", "four")
val emptySet = mutableSetOf<String>()
```

マップに対しても、[`mapOf()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/map-of.html) および
[`mutableMapOf()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/mutable-map-of.html) 関数を使用して同様の操作が可能です。マップのキーと値は、`Pair` オブジェクトとして渡されます（通常は `to` 中置関数で作成されます）。

```kotlin
val numbersMap = mapOf("key1" to 1, "key2" to 2, "key3" to 3, "key4" to 1)
```

`to` 記法は短命な（一時的な）`Pair` オブジェクトを作成するため、パフォーマンスが重要でない場合にのみ使用することをお勧めします。過度なメモリ消費を避けるには、別の方法を使用してください。たとえば、ミュータブルマップを作成し、書き込み操作を使って要素を追加できます。ここでは、[`apply()`](scope-functions.md#apply) 関数を使用すると初期化を流暢に記述できます。

```kotlin
val numbersMap = mutableMapOf<String, String>().apply { this["one"] = "1"; this["two"] = "2" }
```

## コレクションビルダー関数で作成する {id="create-with-collection-builder-functions"}

コレクションを作成するもう1つの方法は、ビルダー関数である
[`buildList()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/build-list.html)、[`buildSet()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/build-set.html)、
または [`buildMap()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/build-map.html) を呼び出すことです。これらは対応する型の新しいミュータブルコレクションを作成し、[書き込み操作](collection-write.md) を使用して値を格納し、同じ要素を持つ読み取り専用コレクションを返します。

```kotlin
val map = buildMap { // これは MutableMap<String, Int> であり、キーと値の型は以下の `put()` の呼び出しから推論されます
    put("a", 1)
    put("b", 0)
    put("c", 4)
}

println(map) // {a=1, b=0, c=4}
```

## 空のコレクション {id="empty-collections"}

要素を持たないコレクションを作成するための関数もあります：[`emptyList()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/empty-list.html)、
[`emptySet()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/empty-set.html)、および
[`emptyMap()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/empty-map.html) です。
空のコレクションを作成する場合は、コレクションが保持する要素の型を指定する必要があります。

```kotlin
val empty = emptyList<String>()
```

## リストの初期化関数 {id="initializer-functions-for-lists"}

リストには、リストのサイズと、インデックスに基づいて要素の値を定義する初期化関数（イニシャライザ関数）を受け取るコンストラクタ風の関数があります。

```kotlin
fun main() {
//sampleStart
    val doubled = List(3, { it * 2 })  // 後で内容を変更したい場合は MutableList にします
    println(doubled)
//sampleEnd
}
```
{kotlin-runnable="true"}

## 具体型のコンストラクタ {id="concrete-type-constructors"}

`ArrayList` や `LinkedList` などの具象型のコレクションを作成するには、それらの型で利用可能なコンストラクタを使用できます。同様のコンストラクタは `Set` や `Map` の実装でも利用可能です。

```kotlin
val linkedList = LinkedList<String>(listOf("one", "two", "three"))
val presizedSet = HashSet<Int>(32)
```

## コピー {id="copy"}

既存のコレクションと同じ要素を持つコレクションを作成するには、コピー関数を使用できます。標準ライブラリのコレクションコピー関数は、同じ要素への参照を持つ「浅いコピー（shallow copy）」コレクションを作成します。そのため、コレクションの要素に対して行われた変更は、そのすべてのコピーに反映されます。

[`toList()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/to-list.html)、
[`toMutableList()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/to-mutable-list.html)、
[`toSet()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/to-set.html) などのコレクションコピー関数は、特定の時点におけるコレクションのスナップショットを作成します。その結果は、同じ要素を持つ新しいコレクションです。
元のコレクションに要素を追加または削除しても、コピーには影響しません。また、コピー側もソースから独立して変更できます。

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

これらの関数は、コレクションを別の型に変換するためにも使用できます（たとえば、リストからセットを作成する、またはその逆など）。

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

また、同じコレクションインスタンスへの新しい参照を作成することもできます。新しい参照は、既存のコレクションでコレクション変数を初期化したときに作成されます。そのため、参照を通じてコレクションインスタンスが変更されると、その変更はすべての参照に反映されます。

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

コレクションの初期化は、可変性（mutability）を制限するために使用できます。たとえば、`MutableList` への `List` 参照を作成した場合、その参照を介してコレクションを変更しようとすると、コンパイラはエラーを発生させます。

```kotlin
fun main() {
//sampleStart 
    val sourceList = mutableListOf(1, 2, 3)
    val referenceList: List<Int> = sourceList
    //referenceList.add(4)            // コンパイルエラー
    sourceList.add(4)
    println(referenceList) // sourceList の現在の状態を表示
//sampleEnd
}
```
{kotlin-runnable="true"}

## 他のコレクションに対する関数を呼び出す {id="invoke-functions-on-other-collections"}

コレクションは、他のコレクションに対するさまざまな操作の結果として作成することもできます。たとえば、リストを[フィルタリング](collection-filtering.md)すると、フィルターに一致する要素の新しいリストが作成されます。

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

[マッピング](collection-transformations.md#map)は、変換結果からリストを生成します。

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

[関連付け（Association）](collection-transformations.md#associate)はマップを生成します。

```kotlin
fun main() {
//sampleStart
    val numbers = listOf("one", "two", "three", "four")
    println(numbers.associateWith { it.length })
//sampleEnd
}
```
{kotlin-runnable="true"}

Kotlin でのコレクション操作の詳細については、[コレクション操作の概要](collection-operations.md) を参照してください。