[//]: # (title: コレクションの概要)

Kotlin標準ライブラリは、コレクション（解決しようとする問題にとって重要であり、一般的に操作の対象となる、0個を含む可変個のアイテムのグループ）を管理するための包括的なツールセットを提供しています。

コレクションはほとんどのプログラミング言語に共通する概念であるため、JavaやPythonのコレクションなどに慣れている場合は、この導入部分をスキップして詳細なセクションに進んでも構いません。

通常、コレクションには同じ型（およびそのサブタイプ）の複数のオブジェクトが含まれます。コレクション内のオブジェクトは、要素（*elements*）またはアイテム（*items*）と呼ばれます。例えば、ある学科のすべての学生は、平均年齢を計算するために使用できるコレクションを形成します。

Kotlinでは以下のコレクション型が関連します：

* *List*（リスト）は、要素の位置を反映する整数であるインデックスによって要素にアクセスできる順序付きコレクションです。要素はリスト内に複数回出現（重複）できます。リストの例としては電話番号があります。これは数字のグループであり、その順序が重要で、数字が繰り返されることもあります。
* *Set*（セット）は一意な要素のコレクションです。これは数学的な抽象概念である「集合」を反映しており、重複のないオブジェクトのグループです。一般に、セットの要素の順序には意味はありません。例えば、宝くじの番号はセットを形成します。それらは一意であり、順序は重要ではありません。
* *Map*（マップ、または辞書）は、キーと値のペアのセットです。キーは一意であり、各キーは正確に1つの値にマップ（対応付け）されます。値は重複していても構いません。マップは、従業員IDとその役職など、オブジェクト間の論理的なつながりを保存するのに便利です。

Kotlinでは、格納されているオブジェクトの具体的な型に関係なく、コレクションを操作できます。言い換えれば、`String`のリストに`String`を追加する方法は、`Int`やユーザー定義クラスの場合と同じです。そのため、Kotlin標準ライブラリは、あらゆる型のコレクションを作成、格納、管理するためのジェネリックなインターフェース、クラス、関数を提供しています。

コレクションインターフェースと関連する関数は、`kotlin.collections`パッケージに含まれています。その内容の概要を見ていきましょう。

> 配列はコレクションのタイプではありません。詳細は[配列](arrays.md)を参照してください。
>
{style="note"}

## Collection types {id="collection-types"}

Kotlin標準ライブラリは、基本的なコレクション型（セット、リスト、マップ）の実装を提供しています。各コレクション型は、一対のインターフェースで表されます。

* コレクションの要素にアクセスするための操作を提供する、読み取り専用（*read-only*）インターフェース。
* 対応する読み取り専用インターフェースを拡張し、要素の追加、削除、更新などの書き込み操作を追加した、可変（*mutable*）インターフェース。

可変コレクションを必ずしも[`var`](basic-syntax.md#variables)に割り当てる必要はないことに注意してください。可変コレクションが`val`に割り当てられている場合でも、そのコレクションに対する書き込み操作は可能です。可変コレクションを`val`に割り当てる利点は、その可変コレクションへの参照自体が変更されるのを防げることです。コードが成長し複雑になるにつれて、参照への意図しない変更を防ぐことはさらに重要になります。より安全で堅牢なコードのために、可能な限り`val`を使用してください。`val`のコレクションを再代入しようとすると、コンパイルエラーが発生します。

```kotlin
fun main() {
//sampleStart
    val numbers = mutableListOf("one", "two", "three", "four")
    numbers.add("five")   // これはOKです
    println(numbers)
    //numbers = mutableListOf("six", "seven")      // コンパイルエラー
//sampleEnd

}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3"}

読み取り専用コレクション型は[共変（covariant）](generics.md#variance)です。
これは、`Rectangle`クラスが`Shape`を継承している場合、`List<Shape>`が必要な場所ならどこでも`List<Rectangle>`を使用できることを意味します。
言い換えれば、コレクション型は要素型と同じサブタイプ関係を持ちます。マップは値（value）の型については共変ですが、キー（key）の型については共変ではありません。

一方、可変コレクションは共変ではありません。もし共変であれば、実行時の失敗につながる可能性があるからです。もし`MutableList<Rectangle>`が`MutableList<Shape>`のサブタイプであった場合、そこに他の`Shape`の継承クラス（例えば`Circle`）を挿入できてしまい、`Rectangle`という型引数に違反することになります。

以下は、Kotlinのコレクションインターフェースの図です：

![Collection interfaces hierarchy](collections-diagram.png){width="500"}

各インターフェースとその実装について見ていきましょう。`Collection`について学ぶには、以下のセクションを読んでください。`List`、`Set`、`Map`について学ぶには、対応するセクションを読むか、KotlinデベロッパーアドボケイトのSebastian Aignerによるビデオを視聴してください：

<video src="https://www.youtube.com/v/F8jj7e-_jFA" title="Kotlin Collections Overview"/>

### Collection {id="collection"}

[`Collection<T>`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/-collection/index.html)は、コレクション階層のルートです。このインターフェースは、サイズの取得、アイテムが含まれているかのチェックなど、読み取り専用コレクションの共通の振る舞いを表します。
`Collection`は、要素を反復処理するための操作を定義する`Iterable<T>`インターフェースを継承しています。`Collection`は、さまざまなコレクション型に適用される関数のパラメータとして使用できます。より具体的なケースについては、`Collection`の継承先である[`List`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/-list/index.html)や[`Set`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/-set/index.html)を使用してください。

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

[`MutableCollection<T>`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/-mutable-collection/index.html)は、`add`や`remove`などの書き込み操作を備えた`Collection`です。

```kotlin
fun List<String>.getShortWordsTo(shortWords: MutableList<String>, maxLength: Int) {
    this.filterTo(shortWords) { it.length <= maxLength }
    // 冠詞を取り除く
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

[`List<T>`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/-list/index.html)は、要素を指定された順序で格納し、インデックスによるアクセスを提供します。インデックスは、最初の要素のインデックスである0から始まり、`(list.size - 1)`である`lastIndex`まで続きます。

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

リストの要素（nullを含む）は重複可能です。リストには、任意の数の等しいオブジェクトや、単一のオブジェクトの複数回の出現を含めることができます。2つのリストは、サイズが同じで、同じ位置にある要素が[構造的に等しい](equality.md#structural-equality)場合に等しいと見なされます。

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

[`MutableList<T>`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/-mutable-list/index.html)は、特定の場所での要素の追加や削除など、リスト固有の書き込み操作を備えた`List`です。

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

ご覧の通り、いくつかの側面でリストは配列と非常に似ています。
しかし、1つ重要な違いがあります。配列のサイズは初期化時に定義され、決して変更されません。一方で、リストには定義済みのサイズはなく、要素の追加、更新、削除といった書き込み操作の結果としてリストのサイズを変更できます。

Kotlinにおける`MutableList`のデフォルトの実装は、サイズ変更可能な配列と考えることができる[`ArrayList`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/-array-list/index.html)です。

### Set {id="set"}

[`Set<T>`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/-set/index.html)は一意な要素を格納します。その順序は一般的に定義されていません。`null`要素もまた一意であり、`Set`には1つの`null`しか含めることができません。2つのセットは、サイズが同じで、一方のセットの各要素に対して、もう一方のセットに等しい要素が存在する場合に等しいと見なされます。

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

[`MutableSet`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/-mutable-set/index.html)は、`MutableCollection`からの書き込み操作を備えた`Set`です。

`MutableSet`のデフォルトの実装である[`LinkedHashSet`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/-linked-hash-set/index.html)は、要素が挿入された順序を保持します。
そのため、`first()`や`last()`などの順序に依存する関数は、そのようなセットに対して予測可能な結果を返します。

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
{kotlin-runnable="true" kotlin-min-compiler-version="1.3"}

代替の実装である[`HashSet`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/-hash-set/index.html)は、要素の順序については何も保証しないため、そのような関数を呼び出すと予測不可能な結果が返されます。ただし、`HashSet`は同じ数の要素を格納するのに必要なメモリが少なくて済みます。

### Map {id="map"}

[`Map<K, V>`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/-map/index.html)は`Collection`インターフェースの継承先ではありませんが、これもKotlinのコレクション型です。
`Map`はキーと値のペア（またはエントリ）を格納します。キーは一意ですが、異なるキーに同じ値をペアリングすることは可能です。`Map`インターフェースは、キーによる値へのアクセス、キーや値の検索など、特定の関数を提供します。

```kotlin
fun main() {
//sampleStart
    val numbersMap = mapOf("key1" to 1, "key2" to 2, "key3" to 3, "key4" to 1)
    
    println("All keys: ${numbersMap.keys}")
    println("All values: ${numbersMap.values}")
    if ("key2" in numbersMap) println("Value by key \"key2\": ${numbersMap["key2"]}")    
    if (1 in numbersMap.values) println("The value 1 is in the map")
    if (numbersMap.containsValue(1)) println("The value 1 is in the map") // 前のものと同じ
//sampleEnd
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3"}

等しいペアを含む2つのマップは、ペアの順序に関係なく等しいと見なされます。

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

[`MutableMap`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/-mutable-map/index.html)は、マップの書き込み操作を備えた`Map`です。例えば、新しいキーと値のペアを追加したり、指定されたキーに関連付けられた値を更新したりできます。

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

`MutableMap`のデフォルトの実装である[`LinkedHashMap`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/-linked-hash-map/index.html)は、マップを反復処理する際に要素が挿入された順序を保持します。
一方で、代替の実装である[`HashMap`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/-hash-map/index.html)は、要素の順序については何も保証しません。

### ArrayDeque {id="arraydeque"}

[`ArrayDeque<T>`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/-array-deque/)は両端キュー（double-ended queue）の実装であり、キューの先頭と末尾の両方で要素の追加や削除を行うことができます。
そのため、`ArrayDeque`はKotlinにおけるスタック（Stack）とキュー（Queue）の両方のデータ構造の役割も果たします。内部的には、`ArrayDeque`は必要に応じて自動的にサイズを調整する、サイズ変更可能な配列を使用して実現されています：

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