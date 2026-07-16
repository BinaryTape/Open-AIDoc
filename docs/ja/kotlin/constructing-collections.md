[//]: # (title: コレクションの作成)

## 要素からの作成

コレクションを作成する最も一般的な方法は、標準ライブラリ関数の [`listOf<T>()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/list-of.html)、[`setOf<T>()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/set-of.html)、[`mutableListOf<T>()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/mutable-list-of.html)、[`mutableSetOf<T>()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/mutable-set-of.html) を使用することです。
カンマ区切りのコレクション要素を引数として渡すと、コンパイラは要素の型を自動的に推論します。空のコレクションを作成する場合は、型を明示的に指定してください。

```kotlin
val numbersSet = setOf("one", "two", "three", "four")
val emptySet = mutableSetOf<String>()
```

Map についても、[`mapOf()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/map-of.html) および [`mutableMapOf()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/mutable-map-of.html) 関数を使用して同様のことが可能です。Map のキーと値は `Pair` オブジェクト（通常は中置関数 `to` を使用して作成されます）として渡されます。

```kotlin
val numbersMap = mapOf("key1" to 1, "key2" to 2, "key3" to 3, "key4" to 1)
```

`to` 記法は短命な `Pair` オブジェクトを作成するため、パフォーマンスが極めて重要でない場合にのみ使用することをお勧めします。過度なメモリ使用を避けるには、別の方法を使用してください。例えば、ミュータブルな Map を作成し、書き込み操作を使用して要素を追加できます。ここでは、[`apply()`](scope-functions.md#apply) 関数を使用すると初期化を流れるように記述できます。

```kotlin
val numbersMap = mutableMapOf<String, String>().apply { this["one"] = "1"; this["two"] = "2" }
```

## コレクションビルダー関数による作成

コレクションを作成するもう一つの方法は、ビルダー関数（[`buildList()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/build-list.html)、[`buildSet()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/build-set.html)、または [`buildMap()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/build-map.html)）を呼び出すことです。これらは、対応する型の新しいミュータブルなコレクションを作成し、[書き込み操作](collection-write.md)を使用して要素を追加した後、同じ要素を持つ読み取り専用のコレクションを返します。

```kotlin
val map = buildMap { // これは MutableMap<String, Int> です。キーと値の型は、以下の put() 呼び出しから推論されます
    put("a", 1)
    put("b", 0)
    put("c", 4)
}

println(map) // {a=1, b=0, c=4}
```

## 空のコレクション

要素を持たないコレクションを作成するための関数、[`emptyList()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/empty-list.html)、[`emptySet()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/empty-set.html)、および [`emptyMap()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/empty-map.html) も用意されています。
空のコレクションを作成する際は、そのコレクションが保持する要素の型を指定する必要があります。

```kotlin
val empty = emptyList<String>()
```

## List の初期化関数

List には、リストのサイズと、インデックスに基づいて要素の値を定義する初期化関数（イニシャライザ）を受け取る、コンストラクタのような関数があります。

```kotlin
fun main() {
//sampleStart
    val doubled = List(3, { it * 2 })  // 後で内容を変更したい場合は MutableList を使用します
    println(doubled)
//sampleEnd
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3"}

## 具体的な型のコンストラクタ

`ArrayList` や `LinkedList` などの具体的な型のコレクションを作成するには、それらの型で利用可能なコンストラクタを使用できます。`Set` や `Map` の実装についても、同様のコンストラクタが利用可能です。

```kotlin
val linkedList = LinkedList<String>(listOf("one", "two", "three"))
val presizedSet = HashSet<Int>(32)
```

## コピー

既存のコレクションと同じ要素を持つコレクションを作成するには、コピー関数を使用できます。標準ライブラリのコレクションコピー関数は、同じ要素への参照を保持するシャローコピー（浅いコピー、shallow copy）を作成します。そのため、コレクションの要素に対して行われた変更は、そのすべてのコピーに反映されます。

[`toList()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/to-list.html)、[`toMutableList()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/to-mutable-list.html)、[`toSet()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/to-set.html) などのコレクションコピー関数は、特定の時点におけるコレクションのスナップショットを作成します。その結果、同じ要素を持つ新しいコレクションが作成されます。元のコレクションに要素を追加または削除しても、コピーには影響しません。また、コピーはソースとは独立して変更することも可能です。

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
{kotlin-runnable="true" kotlin-min-compiler-version="1.3"}

これらの関数は、コレクションを他の型に変換するためにも使用できます。例えば、List から Set を作成したり、その逆を行ったりすることができます。

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
{kotlin-runnable="true" kotlin-min-compiler-version="1.3"}

あるいは、同じコレクションインスタンスへの新しい参照を作成することもできます。既存のコレクション変数で新しいコレクション変数を初期化したときに、新しい参照が作成されます。そのため、参照を通じてコレクションインスタンスが変更されると、その変更はすべての参照に反映されます。

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
{kotlin-runnable="true" kotlin-min-compiler-version="1.3"}

コレクションの初期化は、可変性（mutability）を制限するために使用できます。たとえば、`MutableList` への `List` 参照を作成した場合、その参照を通じてコレクションを変更しようとすると、コンパイラはエラーを出力します。

```kotlin
fun main() {
//sampleStart 
    val sourceList = mutableListOf(1, 2, 3)
    val referenceList: `List<Int>` = sourceList
    //referenceList.add(4)            //コンパイルエラー
    sourceList.add(4)
    println(referenceList) // sourceList の現在の状態を表示します
//sampleEnd
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3"}

## 他のコレクションに対する関数の呼び出し

他のコレクションに対するさまざまな操作の結果として、新しいコレクションを作成することができます。例えば、リストを [フィルタリング](collection-filtering.md) すると、フィルタに一致する要素の新しいリストが作成されます。

```kotlin
fun main() {
//sampleStart 
    val numbers = listOf("one", "two", "three", "four")  
    val longerThan3 = numbers.filter { it.length > 3 }
    println(longerThan3)
//sampleEnd
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3"}

[マッピング](collection-transformations.md#map) は、変換の結果からリストを生成します。

```kotlin
fun main() {
//sampleStart 
    val numbers = setOf(1, 2, 3)
    println(numbers.map { it * 3 })
    println(numbers.mapIndexed { idx, value -> value * idx })
//sampleEnd
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3"}

[アソシエーション（関連付け）](collection-transformations.md#associate) は、Map を生成します。

```kotlin
fun main() {
//sampleStart
    val numbers = listOf("one", "two", "three", "four")
    println(numbers.associateWith { it.length })
//sampleEnd
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3"}

Kotlin でのコレクション操作に関する詳細は、[コレクション操作の概要](collection-operations.md)を参照してください。