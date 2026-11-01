[//]: # (title: コレクション操作の概要)

Kotlin標準ライブラリは、コレクションに対する操作を実行するための多種多様な関数を提供しています。これには、要素の取得や追加といった単純な操作から、検索、ソート、フィルタリング、変換などのより複雑な操作までが含まれます。

## 拡張関数とメンバー関数 {id="extension-and-member-functions"}

コレクション操作は、標準ライブラリ内で2つの方法で宣言されています。コレクションインターフェースの[メンバー関数](classes.md)と、[拡張関数](extensions.md#extension-functions)です。

メンバー関数は、コレクション型にとって不可欠な操作を定義します。例えば、[`Collection`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/-collection/index.html) には空かどうかをチェックするための関数 [`isEmpty()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/-collection/is-empty.html) が含まれており、[`List`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/-list/index.html) には要素へのインデックスアクセスを行うための [`get()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/-list/get.html) などが含まれています。

独自のコレクションインターフェースの実装を作成する場合は、それらのメンバー関数を実装する必要があります。新しい実装の作成を容易にするために、標準ライブラリにあるコレクションインターフェースの骨格実装（skeletal implementation）を使用してください：[`AbstractCollection`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/-abstract-collection/index.html)、[`AbstractList`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/-abstract-list/index.html)、[`AbstractSet`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/-abstract-set/index.html)、[`AbstractMap`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/-abstract-map/index.html)、およびそれらに対応する可変（mutable）版です。

その他のコレクション操作は拡張関数として宣言されています。これらはフィルタリング、変換、順序付け、その他のコレクション処理関数です。

## 共通の操作 {id="common-operations"}

共通の操作は、[読み取り専用コレクションと可変コレクション](collections-overview.md#collection-types)の両方で利用可能です。共通の操作は以下のグループに分類されます：

* [変換](collection-transformations.md)
* [フィルタリング](collection-filtering.md)
* [`plus` および `minus` 演算子](collection-plus-minus.md)
* [グループ化](collection-grouping.md)
* [コレクションの一部の取得](collection-parts.md)
* [単一要素の取得](collection-elements.md)
* [順序付け](collection-ordering.md)
* [集計操作](collection-aggregate.md)

これらのページで説明されている操作は、元のコレクションに影響を与えることなく結果を返します。例えば、フィルタリング操作は、フィルタリングの述語（predicate）に一致するすべての要素を含む*新しいコレクション*を生成します。このような操作の結果は、変数に格納するか、他の関数に渡すなどして何らかの形で利用する必要があります。

```kotlin

fun main() {
//sampleStart
    val numbers = listOf("one", "two", "three", "four")  
    numbers.filter { it.length > 3 }  // `numbers` には何の変化も起きず、結果は失われます
    println("numbers are still $numbers")
    val longerThan3 = numbers.filter { it.length > 3 } // 結果が `longerThan3` に格納されます
    println("numbers longer than 3 chars are $longerThan3")
//sampleEnd
}
```
{kotlin-runnable="true"}

特定のコレクション操作では、*格納先（destination）*オブジェクトを指定するオプションがあります。
格納先とは、関数が結果のアイテムを新しいオブジェクトとして返す代わりに追加（append）していくための可変コレクションです。
格納先を指定して操作を実行するために、名前に `To` という接尾辞が付いた個別の関数が用意されています。例えば、[`filter()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/filter.html) の代わりに [`filterTo()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/filter-to.html)、あるいは [`associate()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/associate.html) の代わりに [`associateTo()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/associate-to.html) などです。
これらの関数は、追加のパラメータとして格納先コレクションを受け取ります。

```kotlin

fun main() {
//sampleStart
    val numbers = listOf("one", "two", "three", "four")
    val filterResults = mutableListOf<String>()  // 格納先オブジェクト
    numbers.filterTo(filterResults) { it.length > 3 }
    numbers.filterIndexedTo(filterResults) { index, _ -> index == 0 }
    println(filterResults) // 両方の操作の結果が含まれます
//sampleEnd
}

```
{kotlin-runnable="true"}

利便性のため、これらの関数は格納先コレクションを戻り値として返すため、関数呼び出しの引数内で直接生成することができます：

```kotlin

fun main() {
    val numbers = listOf("one", "two", "three", "four")
//sampleStart
    // 新しい HashSet に直接フィルタリングし、
    // 結果から重複を排除します
    val result = numbers.mapTo(HashSet()) { it.length }
    println("distinct item lengths are $result")
//sampleEnd
}
```
{kotlin-runnable="true"}

格納先を指定できる関数は、フィルタリング、関連付け（association）、グループ化、フラット化、およびその他の操作で利用可能です。格納先を指定する操作の完全なリストについては、[Kotlin コレクションリファレンス](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/index.html)を参照してください。

## 書き込み操作 {id="write-operations"}

可変コレクションには、コレクションの状態を変更する*書き込み操作*もあります。このような操作には、要素の追加、削除、更新が含まれます。書き込み操作は、[書き込み操作](collection-write.md)や、[List固有の操作](list-operations.md#list-write-operations)および[Map固有の操作](map-operations.md#map-write-operations)の対応するセクションに記載されています。

特定の操作には、同じ処理を実行するためのペアとなる関数が存在します。一方はその場で（in-placeで）操作を適用し、もう一方は結果を別のコレクションとして返します。例えば、[`sort()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/sort.html) は可変コレクションをその場でソートするため状態が変更されますが、[`sorted()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/sorted.html) はソートされた順序で同じ要素を含む新しいコレクションを作成します。

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