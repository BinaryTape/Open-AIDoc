[//]: # (title: コレクションの概要)

Kotlin 標準ライブラリは、解決すべき課題において重要であり、一般的に操作対象となる、可変個（0個の場合もあります）のアイテムのグループである「コレクション（_collections_）」を管理するための包括的なツールセットを提供しています。

コレクションはほとんどのプログラミング言語に共通する概念であるため、例えば Java や Python のコレクションに慣れている場合は、この導入部分をスキップして詳細なセクションに進んでも構いません。

通常、コレクションには同じ型（およびそのサブタイプ）の複数のオブジェクトが含まれます。コレクション内のオブジェクトは「要素（_elements_）」または「アイテム（_items_）」と呼ばれます。例えば、ある学部のすべての学生は、平均年齢を計算するために使用できるコレクションを形成します。

Kotlin には、主に関連する以下のコレクション型があります。

* **List** は、位置を表す整数であるインデックスによって要素にアクセスできる、順序付けられたコレクションです。要素はリスト内で複数回出現することができます。リストの例としては電話番号があります。電話番号は数字のグループであり、その順序が重要で、同じ数字が繰り返されることがあります。
* **Set** は、一意の要素からなるコレクションです。これは数学的な集合（Set）の抽象概念を反映しており、重複のないオブジェクトのグループを表します。一般的に、Set の要素の順序には意味がありません。例えば、宝くじの当選番号は Set を形成します。番号は一意であり、その順序は重要ではありません。
* **Map**（または「ディクショナリ（_dictionary_）」）は、キーと値のペアのセットです。キーは一意であり、各キーは正確に1つの値にマップされます。値は重複していても構いません。Map はオブジェクト間の論理的な関連性を格納するのに便利です。例えば、従業員の ID とその役職などです。

Kotlin では、コレクションに格納されているオブジェクトの具体的な型とは無関係にコレクションを操作できます。言い換えると、`String` のリストに `String` を追加する方法は、`Int` やユーザー定義クラスで行う方法と同じです。
そのため、Kotlin 標準ライブラリには、任意の型のコレクションを作成、格納、管理するためのジェネリックなインターフェース、クラス、関数が用意されています。

コレクションのインターフェースおよび関連する関数は、`kotlin.collections` パッケージに含まれています。その内容の概要を見ていきましょう。

> 配列（Array）はコレクションの一種ではありません。詳細については、[配列](arrays.md) を参照してください。
>
{style="note"}

## コレクション型 {id="collection-types"}

Kotlin 標準ライブラリは、基本的なコレクション型（Set、List、Map）の実装を提供しています。
各コレクション型は、インターフェースのペアによって表されます。

* コレクション要素へのアクセス操作を提供する「読み取り専用（_read-only_）」インターフェース。
* 対応する読み取り専用インターフェースを拡張し、要素の追加、削除、更新などの書き込み操作を追加した「ミュータブル（変更可能 / _mutable_）」インターフェース。

ミュータブルコレクションであっても、必ずしも [`var`](basic-syntax.md#variables) に代入する必要はない点に注意してください。`val` に代入されている場合でも、ミュータブルコレクションに対する書き込み操作は可能です。ミュータブルコレクションを `val` に代入する利点は、そのミュータブルコレクションへの参照が変更されるのを防げることです。開発が進みコードが複雑になるにつれて、意図しない参照の変更を防ぐことはより重要になります。より安全で堅牢なコードにするために、可能な限り `val` を使用してください。`val` のコレクションを再代入しようとすると、コンパイルエラーになります。

```kotlin
fun main() {
//sampleStart
    val numbers = mutableListOf("one", "two", "three", "four")
    numbers.add("five")   // これは問題ありません
    println(numbers)
    //numbers = mutableListOf("six", "seven")      // コンパイルエラー
//sampleEnd

}
```
{kotlin-runnable="true"}

読み取り専用コレクション型は[共変（covariant）](generics.md#variance)です。
これは、`Rectangle` クラスが `Shape` を継承している場合、`List<Shape>` が要求されるすべての場所で `List<Rectangle>` を使用できることを意味します。
言い換えれば、コレクション型は要素型と同じサブタイプ関係を持ちます。Map は値（Value）の型については共変ですが、キー（Key）の型については共変ではありません。

一方、ミュータブルコレクションは共変ではありません。共変にしてしまうと、実行時エラーにつながるためです。もし `MutableList<Rectangle>` が `MutableList<Shape>` のサブタイプであった場合、そこに他の `Shape` の継承クラス（例えば `Circle`）を挿入できてしまい、`Rectangle` 型引数の整合性が破綻してしまいます。

以下は、Kotlin のコレクションインターフェースの図です。

![コレクションインターフェースの階層構造](collections-diagram.png){width="500"}

インターフェースとその実装について見ていきましょう。`Collection` について学ぶには、以下のセクションをお読みください。
`List`、`Set`、`Map` について学ぶには、対応するセクションを読むか、Kotlin Developer Advocate である Sebastian Aigner による動画をご覧ください。

<video src="https://www.youtube.com/v/F8jj7e-_jFA" title="Kotlin Collections Overview"/>

### Collection {id="collection"}

[`Collection<T>`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/-collection/index.html) はコレクション階層のルートです。このインターフェースは、サイズの取得や要素の存在確認など、読み取り専用コレクションの共通の振る舞いを表します。
`Collection` は、要素を反復処理（イテレーション）するための操作を定義する `Iterable<T>` インターフェースを継承しています。異なるコレクション型に適用できる関数のパラメーターとして `Collection` を使用できます。より具体的なケースでは、`Collection` の派生インターフェースである [`List`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/-list/index.html) や [`Set`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/-set/index.html) を使用します。

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

[`MutableCollection<T>`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/-mutable-collection/index.html) は、`add` や `remove` などの書き込み操作を備えた `Collection` です。

```kotlin
fun List<String>.getShortWordsTo(shortWords: MutableList<String>, maxLength: Int) {
    this.filterTo(shortWords) { it.length <= maxLength }
    // 冠詞を除外
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

[`List<T>`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/-list/index.html) は要素を指定された順序で格納し、インデックスによるアクセスを提供します。インデックスは、最初の要素のインデックスである 0 から始まり、`(list.size - 1)` である `lastIndex` まで続きます。

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

リストの要素（null を含む）は重複可能です。リストには、等価なオブジェクトや単一オブジェクトの同一インスタンスをいくつでも含めることができます。
2つのリストは、サイズが同じで、同じ位置にある要素同士が[構造的に等価](equality.md#structural-equality)である場合に等しいとみなされます。

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

[`MutableList<T>`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/-mutable-list/index.html) は、特定の位置への要素の追加や削除など、リスト固有の書き込み操作を備えた `List` です。

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

このように、いくつかの側面においてリストは配列と非常によく似ています。
ただし、重要な違いが1つあります。配列のサイズは初期化時に定義され、決して変更されません。一方でリストにはあらかじめ定義されたサイズはなく、要素の追加、更新、削除といった書き込み操作の結果としてリストのサイズを変更できます。

Kotlin では、`MutableList` のデフォルトの実装は [`ArrayList`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/-array-list/index.html) であり、サイズ変更可能な配列と考えることができます。

### Set {id="set"}

[`Set<T>`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/-set/index.html) は一意の要素を格納します。その順序は一般に未定義です。`null` 要素も同様に一意であり、`Set` には `null` を1つだけ含めることができます。
2つのセットは、サイズが同じであり、一方のセットの各要素に対して、もう一方のセットに等価な要素が存在する場合に等しいとみなされます。

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

[`MutableSet`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/-mutable-set/index.html) は、`MutableCollection` の書き込み操作を備えた `Set` です。

`MutableSet` のデフォルトの実装である [`LinkedHashSet`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/-linked-hash-set/index.html) は、要素の挿入順序を保持します。
そのため、`first()` や `last()` などの順序に依存する関数は、このようなセットに対して予測可能な結果を返します。

```kotlin
fun main() {
//sampleStart
    val numbers = setOf(1, 2, 3, 4)  // LinkedHashSet がデフォルトの実装です
    val numbersBackwards = setOf(4, 3, 2, 1)
    
    println(numbers.first() == numbersBackwards.first())
    println(numbers.first() == numbersBackwards.last())
//sampleEnd
}
```
{kotlin-runnable="true"}

別の実装である [`HashSet`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/-hash-set/index.html) は、要素の順序について何も保証しないため、順序に依存する関数を呼び出すと予測不能な結果が返されます。ただし、`HashSet` は同じ数の要素を格納するのに必要なメモリが少なくなります。

### Map {id="map"}

[`Map<K, V>`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/-map/index.html) は `Collection` インターフェースの派生ではありませんが、同様に Kotlin のコレクション型です。
`Map` は「キーと値のペア（_key-value pairs_）」（または「エントリ（_entries_）」）を格納します。キーは一意ですが、異なるキーに等価な値が関連付けられることはあります。
`Map` インターフェースは、キーによる値へのアクセス、キーや値の検索など、固有の関数を提供します。

```kotlin
fun main() {
//sampleStart
    val numbersMap = mapOf("key1" to 1, "key2" to 2, "key3" to 3, "key4" to 1)
    
    println("All keys: ${numbersMap.keys}")
    println("All values: ${numbersMap.values}")
    if ("key2" in numbersMap) println("Value by key \"key2\": ${numbersMap["key2"]}")    
    if (1 in numbersMap.values) println("The value 1 is in the map")
    if (numbersMap.containsValue(1)) println("The value 1 is in the map") // 前の行と同じ
//sampleEnd
}
```
{kotlin-runnable="true"}

等価なペアを含む2つのマップは、ペアの順序に関係なく等しいとみなされます。

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

[`MutableMap`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/-mutable-map/index.html) は、マップの書き込み操作を備えた `Map` です。例えば、新しいキーと値のペアを追加したり、指定したキーに関連付けられた値を更新したりできます。

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

`MutableMap` のデフォルトの実装である [`LinkedHashMap`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/-linked-hash-map/index.html) は、マップを反復処理する際に要素の挿入順序を保持します。
一方、代替実装である [`HashMap`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/-hash-map/index.html) は、要素の順序について何も保証しません。

### ArrayDeque {id="arraydeque"}

[`ArrayDeque<T>`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/-array-deque/) は両端キュー（double-ended queue）の実装であり、キューの先頭と末尾の両方で要素の追加や削除を行うことができます。
そのため、`ArrayDeque` は Kotlin においてスタック（Stack）とキュー（Queue）の両方のデータ構造の役割も果たします。内部的には、`ArrayDeque` は必要に応じて自動的にサイズを調整するサイズ変更可能な配列を使用して実現されています。

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