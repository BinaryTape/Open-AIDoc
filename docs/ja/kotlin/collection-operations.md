[//]: # (title: コレクション操作の概要)

Kotlin標準ライブラリは、コレクションに対する操作を実行するための多種多様な関数を提供しています。これには、要素の取得や追加といった単純な操作から、検索、ソート、フィルタリング、変換などのより複雑な操作までが含まれます。

## 拡張関数とメンバ関数 {id="extension-and-member-functions"}

コレクション操作は、標準ライブラリにおいて2つの方法で宣言されています。コレクションインターフェースの[メンバ関数](classes.md)と、[拡張関数](extensions.md#extension-functions)です。

メンバ関数は、コレクション型にとって本質的な操作を定義します。例えば、[`Collection`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/-collection/index.html) には空であるかどうかをチェックするための [`isEmpty()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/-collection/is-empty.html) 関数が含まれており、[`List`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/-list/index.html) には要素へのインデックスアクセスを行うための [`get()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/-list/get.html) などが含まれています。

コレクションインターフェースの独自の実装を作成する場合は、それらのメンバ関数を実装する必要があります。新しい実装の作成を容易にするために、標準ライブラリが提供するコレクションインターフェースの骨格実装（skeletal implementations）を使用してください。具体的には [`AbstractCollection`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/-abstract-collection/index.html)、[`AbstractList`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/-abstract-list/index.html)、[`AbstractSet`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/-abstract-set/index.html)、[`AbstractMap`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/-abstract-map/index.html)、およびそれらのミュータブル（可変）版があります。

その他のコレクション操作は拡張関数として宣言されています。これらには、フィルタリング、変換、順序付け、その他のコレクション処理関数が含まれます。

## 共通の操作 {id="common-operations"}

共通の操作は、[読み取り専用コレクションとミュータブルコレクション](collections-overview.md#read-only-and-mutable-collections)の両方で利用できます。共通操作は以下のグループに分類されます。

* [変換](collection-transformations.md)
* [フィルタリング](collection-filtering.md)
* [`plus` と `minus` 演算子](collection-combine.md)
* [グループ化](collection-grouping.md)
* [コレクションの一部の取得](collection-parts.md)
* [単一要素の取得](collection-elements.md)
* [順序付け](collection-ordering.md)
* [集約操作](collection-aggregate.md)

これらのページで説明されている操作は、元のコレクションに影響を与えることなく結果を返します。例えば、フィルタリング操作は、フィルタ条件（プレディケート）に一致するすべての要素を含む*新しいコレクション*を生成します。このような操作の結果は、変数に格納するか、他の関数に渡すなど別の方法で使用する必要があります。

```kotlin

fun main() {
//sampleStart
    val numbers = listOf("one", "two", "three", "four")  
    numbers.filter { it.length > 3 }  // numbers には何も起こらず、結果は失われます
    println("numbers are still $numbers")
    val longerThan3 = numbers.filter { it.length > 3 } // 結果は longerThan3 に格納されます
    println("numbers longer than 3 chars are $longerThan3")
//sampleEnd
}
```
{kotlin-runnable="true"}

一部のコレクション操作では、*出力先（destination）*オブジェクトを指定するオプションがあります。出力先とは、関数が結果のアイテムを新しいオブジェクトとして返すのではなく、結果を追加していくミュータブルコレクションのことです。出力先を指定して操作を実行するために、名前に接尾辞 `To` が付いた個別の関数が用意されています。例えば、[`filter()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/filter.html) に対する [`filterTo()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/filter-to.html) や、[`associate()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/associate.html) に対する [`associateTo()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/associate-to.html) などです。これらの関数は、追加のパラメータとして出力先コレクションを受け取ります。

```kotlin

fun main() {
//sampleStart
    val numbers = listOf("one", "two", "three", "four")
    val filterResults = mutableListOf<String>()  // 出力先オブジェクト
    numbers.filterTo(filterResults) { it.length > 3 }
    numbers.filterIndexedTo(filterResults) { index, _ -> index == 0 }
    println(filterResults) // 両方の操作の結果が含まれます
//sampleEnd
}

```
{kotlin-runnable="true"}

利便性のため、これらの関数は出力先コレクションを戻り値としても返すため、関数呼び出しの対応する引数の中で直接作成することができます。

```kotlin

fun main() {
    val numbers = listOf("one", "two", "three", "four")
//sampleStart
    // numbers を新しい HashSet に直接フィルタリングし、
    // 結果から重複を排除します
    val result = numbers.mapTo(HashSet()) { it.length }
    println("distinct item lengths are $result")
//sampleEnd
}
```
{kotlin-runnable="true"}

出力先を指定できる関数は、フィルタリング、関連付け（association）、グループ化、平坦化（flattening）、その他の操作で利用できます。出力先操作の完全なリストについては、[Kotlin コレクションリファレンス](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/index.html)を参照してください。

## 書き込み操作 {id="write-operations"}

ミュータブルコレクションには、コレクションの状態を変更する*書き込み操作（write operations）*もあります。このような操作には、要素の追加、削除、更新が含まれます。書き込み操作は、[書き込み操作](collection-write.md)および、[List固有の操作](list-operations.md#list-write-operations)や[Map固有の操作](map-operations.md#map-write-operations)の対応するセクションに記載されています。

特定の操作には、同じ処理を行う関数のペアが存在します。一方はインプレース（その場）で操作を適用し、もう一方は結果を別のコレクションとして返します。例えば、[`sort()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/sort.html) はミュータブルコレクションをインプレースでソートするためその状態が変化しますが、[`sorted()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/sorted.html) は同じ要素をソートされた順序で含む新しいコレクションを作成します。

```kotlin

fun main() {
//sampleStart
    val numbers = mutableListOf("one", "two", "three", "four")
    val sortedNumbers = numbers.sorted()
    println(numbers == sortedNumbers)  // false
    numbers.sort()
    println(numbers == sortedNumbers)  // true
//sampleEnd
}
```
{kotlin-runnable="true"}