[//]: # (title: 単一要素の取得)

Kotlinのコレクションには、コレクションから単一要素を取得するための一連の関数が用意されています。
このページで説明する関数は、リストとセットの両方に適用されます。

[リストの定義](collections-overview.md)にある通り、リストは順序付けられた（ordered）コレクションです。
そのため、リストのすべての要素には参照に使用できる位置（インデックス）があります。
このページで説明する関数に加えて、リストにはインデックスによって要素を取得・検索するためのより豊富な手段が用意されています。
詳細は[リスト固有の操作](list-operations.md)を参照してください。

一方、セットは[定義上](collections-overview.md)順序付けられたコレクションではありません。
しかし、Kotlinの `Set` は特定の順序で要素を格納します。
これには、挿入順（`LinkedHashSet` の場合）、自然順序（`SortedSet` の場合）、またはその他の順序があります。
また、セットの要素の順序が不明な場合もあります。
そのような場合でも要素は何らかの形で順序付けられているため、要素の位置に依存する関数は結果を返します。
ただし、使用されている具体的な `Set` の実装を把握していない限り、呼び出し側にとってその結果は予測できません。

## 位置による取得 {id="retrieve-by-position"}

特定の位置にある要素を取得するために、[`elementAt()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/element-at.html) 関数があります。
整数を引数として呼び出すと、指定された位置にあるコレクション要素が返されます。
最初の要素の位置は `0` で、最後の要素の位置は `(size - 1)` です。
 
`elementAt()` は、インデックス付きアクセスが提供されていないコレクションや、静的に提供されているか不明なコレクションで便利です。
`List` の場合は、[インデックスアクセス演算子](list-operations.md#retrieve-elements-by-index)（`get()` または `[]`）を使用する方がイディオマティックです。

```kotlin

fun main() {
//sampleStart
    val numbers = linkedSetOf("one", "two", "three", "four", "five")
    println(numbers.elementAt(3))    

    val numbersSortedSet = sortedSetOf("one", "two", "three", "four")
    println(numbersSortedSet.elementAt(0)) // 要素は昇順で格納されている
//sampleEnd
}
```
{kotlin-runnable="true"}

コレクションの最初と最後の要素を取得するための便利なエイリアスもあります: [`first()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/first.html)
および [`last()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/last.html)。

```kotlin

fun main() {
//sampleStart
    val numbers = listOf("one", "two", "three", "four", "five")
    println(numbers.first())    
    println(numbers.last())    
//sampleEnd
}
```
{kotlin-runnable="true"}

存在しない位置の要素を取得する際の例外を回避するには、安全なバリエーションの `elementAt()` を使用します:

* [`elementAtOrNull()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/element-at-or-null.html) は、指定された位置がコレクションの範囲外の場合に null を返します。
* [`elementAtOrElse()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/element-at-or-else.html) は、追加で `Int` 引数をコレクション要素型のインスタンスにマッピングするラムダ関数を受け取ります。
   範囲外の位置で呼び出された場合、`elementAtOrElse()` は指定された値に対するラムダの結果を返します。

```kotlin

fun main() {
//sampleStart
    val numbers = listOf("one", "two", "three", "four", "five")
    println(numbers.elementAtOrNull(5))
    println(numbers.elementAtOrElse(5) { index -> "The value for index $index is undefined"})
//sampleEnd
}
```
{kotlin-runnable="true"}

## 条件による取得 {id="retrieve-by-condition"}

[`first()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/first.html) および [`last()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/last.html)
関数を使用すると、指定された述語（predicate）に一致する要素をコレクションから検索することもできます。コレクション要素をテストする述語を指定して `first()` を呼び出すと、述語が `true` を返す最初の要素が返されます。
同様に、述語を指定した `last()` は、それに一致する最後の要素を返します。

```kotlin

fun main() {
//sampleStart
    val numbers = listOf("one", "two", "three", "four", "five", "six")
    println(numbers.first { it.length > 3 })
    println(numbers.last { it.startsWith("f") })
//sampleEnd
}
```
{kotlin-runnable="true"}

述語に一致する要素がない場合、両方の関数とも例外をスローします。
それを回避するには、代わりに [`firstOrNull()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/first-or-null.html)
および [`lastOrNull()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/last-or-null.html) を使用します。
一致する要素が見つからない場合は `null` を返します。

```kotlin

fun main() {
//sampleStart
    val numbers = listOf("one", "two", "three", "four", "five", "six")
    println(numbers.firstOrNull { it.length > 6 })
//sampleEnd
}
```
{kotlin-runnable="true"}

状況に適した名前であれば、以下のエイリアスも使用できます:

* `firstOrNull()` の代わりに [`find()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/find.html)
* `lastOrNull()` の代わりに [`findLast()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/find-last.html)

```kotlin

fun main() {
//sampleStart
    val numbers = listOf(1, 2, 3, 4)
    println(numbers.find { it % 2 == 0 })
    println(numbers.findLast { it % 2 == 0 })
//sampleEnd
}
```
{kotlin-runnable="true"}

## セレクターによる取得 {id="retrieve-with-selector"}

要素を取得する前にコレクションを変換（マッピング）する必要がある場合は、[`firstNotNullOf()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/first-not-null-of.html) 関数を使用できます。
これは以下の2つの処理を組み合わせたものです:
- セレクター関数でコレクションをマッピングする
- 結果の中で最初の null でない値を返す

`firstNotNullOf()` は、結果のコレクションに非 null 要素がない場合に `NoSuchElementException` をスローします。
この場合に null を返すようにするには、対応する [`firstNotNullOfOrNull()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/first-not-null-of-or-null.html)
を使用してください。

```kotlin
fun main() {
//sampleStart
    val list = listOf<Any>(0, "true", false)
    // 各要素を文字列に変換し、必要な長さを持つ最初の要素を返す
    val longEnough = list.firstNotNullOf { item -> item.toString().takeIf { it.length >= 4 } }
    println(longEnough)
//sampleEnd
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.5"}

## ランダムな要素 {id="random-element"}

コレクションの任意の要素を取得する必要がある場合は、[`random()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/random.html) 関数を呼び出します。
引数なしで呼び出すことも、乱数の発生源として [`Random`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.random/-random/index.html)
オブジェクトを渡して呼び出すこともできます。

```kotlin

fun main() {
//sampleStart
    val numbers = listOf(1, 2, 3, 4)
    println(numbers.random())
//sampleEnd
}
```
{kotlin-runnable="true"}

空のコレクションに対して `random()` を呼び出すと、例外がスローされます。代わりに `null` を受け取るには、[`randomOrNull()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/random-or-null.html) を使用します。

## 要素の存在チェック {id="check-element-existence"}

コレクション内に要素が存在するかどうかを確認するには、[`contains()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/contains.html) 関数を使用します。
関数の引数と `equals()` であるコレクション要素が存在する場合、`true` を返します。
`contains()` は `in` キーワードを使用した演算子形式で呼び出すこともできます。

複数のインスタンスがすべて存在するかどうかを一度に確認するには、それらのインスタンスのコレクションを引数として [`containsAll()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/contains-all.html)
を呼び出します。

```kotlin

fun main() {
//sampleStart
    val numbers = listOf("one", "two", "three", "four", "five", "six")
    println(numbers.contains("four"))
    println("zero" in numbers)
    
    println(numbers.containsAll(listOf("four", "two")))
    println(numbers.containsAll(listOf("one", "zero")))
//sampleEnd
}
```
{kotlin-runnable="true"}

さらに、[`isEmpty()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/is-empty.html)
または [`isNotEmpty()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/is-not-empty.html) を呼び出すことで、コレクションに要素が含まれているかどうかを確認できます。

```kotlin

fun main() {
//sampleStart
    val numbers = listOf("one", "two", "three", "four", "five", "six")
    println(numbers.isEmpty())
    println(numbers.isNotEmpty())
    
    val empty = emptyList<String>()
    println(empty.isEmpty())
    println(empty.isNotEmpty())
//sampleEnd
}
```
{kotlin-runnable="true"}