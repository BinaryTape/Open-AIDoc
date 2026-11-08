[//]: # (title: List固有の操作)

[`List`](collection-types.md#list) は、Kotlin で最もよく使われる組み込みコレクション型です。リストの要素へのインデックスアクセスにより、リストに対する強力な一連の操作が提供されます。

## インデックスによる要素の取得 {id="retrieve-elements-by-index"}

リストは要素取得のための一般的な操作をすべてサポートしています：`elementAt()`、`first()`、`last()`、および [単一要素の取得](collection-elements.md) に記載されているその他の操作です。
リストに特有なのは要素へのインデックスアクセスであり、要素を読み取る最も簡単な方法はインデックスによって取得することです。
これは、引数にインデックスを渡す [`get()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/-list/get.html) 関数、または短縮構文である `[index]` を使って行われます。

リストのサイズが指定されたインデックス以下の場合は、例外がスローされます。
このような例外を回避するのに役立つ関数が他に2つあります：

* [`getOrElse()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/get-or-else.html) は、コレクション内にインデックスが存在しない場合に返すデフォルト値を計算するための関数を提供できます。
* [`getOrNull()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/get-or-null.html) は、デフォルト値として `null` を返します。

```kotlin

fun main() {
//sampleStart
    val numbers = listOf(1, 2, 3, 4)
    println(numbers.get(0))
    println(numbers[0])
    //numbers.get(5)                         // exception!
    println(numbers.getOrNull(5))             // null
    println(numbers.getOrElse(5, {it}))        // 5
//sampleEnd
}
```
{kotlin-runnable="true"}

## リストの一部の取得 {id="retrieve-list-parts"}

[コレクションの一部の取得](collection-parts.md) にある一般的な操作に加えて、リストは指定された要素の範囲のビュー（view）をリストとして返す [`subList()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/-list/sub-list.html) 関数を提供します。
したがって、元のコレクションの要素が変更されると、以前に作成されたサブリスト内の要素も変更され、その逆も同様です。

```kotlin

fun main() {
//sampleStart
    val numbers = (0..13).toList()
    println(numbers.subList(3, 6))
//sampleEnd
}
```
{kotlin-runnable="true"}

## 要素の位置の検索 {id="find-element-positions"}

### 線形探索 {id="linear-search"}

任意のリストにおいて、[`indexOf()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/index-of.html) および [`lastIndexOf()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/last-index-of.html) 関数を使用して要素の位置を検索できます。
これらは、リスト内で指定された引数と等しい要素の最初および最後の位置を返します。
そのような要素が存在しない場合、両関数とも `-1` を返します。

```kotlin

fun main() {
//sampleStart
    val numbers = listOf(1, 2, 3, 4, 2, 5)
    println(numbers.indexOf(2))
    println(numbers.lastIndexOf(2))
//sampleEnd
}
```
{kotlin-runnable="true"}

また、述語（predicate）を受け取り、それに一致する要素を検索する一対の関数もあります：

* [`indexOfFirst()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/index-of-first.html) は述語に一致する*最初の要素のインデックス*を返します。そのような要素がない場合は `-1` を返します。
* [`indexOfLast()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/index-of-last.html) は述語に一致する*最後の要素のインデックス*を返します。そのような要素がない場合は `-1` を返します。

```kotlin

fun main() {
//sampleStart
    val numbers = mutableListOf(1, 2, 3, 4)
    println(numbers.indexOfFirst { it > 2})
    println(numbers.indexOfLast { it % 2 == 1})
//sampleEnd
}
```
{kotlin-runnable="true"}

### ソート済みリストでの二分探索 {id="binary-search-in-sorted-lists"}

リスト内の要素を検索するもう1つの方法として、[二分探索（binary search）](https://en.wikipedia.org/wiki/Binary_search_algorithm) があります。
これは他の組み込み検索関数よりも大幅に高速に動作しますが、リストが特定の順序（自然順序または関数のパラメータで指定された順序）に従って昇順に [ソート](collection-ordering.md) されている*必要があります*。
そうでない場合、結果は未定義（undefined）となります。

ソート済みのリストで要素を検索するには、値を引数として渡して [`binarySearch()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/binary-search.html) 関数を呼び出します。
そのような要素が存在する場合、関数はそのインデックスを返します。存在しない場合は `(-insertionPoint - 1)` を返します。ここで `insertionPoint` は、リストのソート順が維持されるようにこの要素を挿入すべきインデックスです。
指定された値を持つ要素が複数ある場合、検索はそのいずれかのインデックスを返す可能性があります。

検索するインデックスの範囲を指定することもできます。この場合、関数は指定された2つのインデックスの間のみを検索します。

```kotlin

fun main() {
//sampleStart
    val numbers = mutableListOf("one", "two", "three", "four")
    numbers.sort()
    println(numbers)
    println(numbers.binarySearch("two"))  // 3
    println(numbers.binarySearch("z")) // -5
    println(numbers.binarySearch("two", 0, 2))  // -3
//sampleEnd
}
```
{kotlin-runnable="true"}

#### Comparator による二分探索 {id="comparator-binary-search"}

リストの要素が `Comparable` でない場合は、二分探索で使用する [`Comparator`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin/-comparator/) を指定する必要があります。
リストはこの `Comparator` に従って昇順にソートされている必要があります。例を見てみましょう：

```kotlin

data class Product(val name: String, val price: Double)

fun main() {
//sampleStart
    val productList = listOf(
        Product("WebStorm", 49.0),
        Product("AppCode", 99.0),
        Product("DotTrace", 129.0),
        Product("ReSharper", 149.0))

    println(productList.binarySearch(Product("AppCode", 99.0), compareBy<Product> { it.price }.thenBy { it.name }))
//sampleEnd
}
```
{kotlin-runnable="true"}

以下は、`Comparable` ではない `Product` インスタンスのリストと、順序を定義する `Comparator` です。`p1` の価格が `p2` の価格より小さい場合、製品 `p1` は製品 `p2` の前に配置されます。
したがって、この順序に従って昇順にソートされたリストがあれば、`binarySearch()` を使って指定された `Product` のインデックスを見つけることができます。

カスタム Comparator は、リストが自然順序とは異なる順序を使用している場合（たとえば `String` 要素の大文字・小文字を区別しない順序など）にも便利です。

```kotlin

fun main() {
//sampleStart
    val colors = listOf("Blue", "green", "ORANGE", "Red", "yellow")
    println(colors.binarySearch("RED", String.CASE_INSENSITIVE_ORDER)) // 3
//sampleEnd
}
```
{kotlin-runnable="true"}

#### 比較関数（Comparison）による二分探索 {id="comparison-binary-search"}

_比較（comparison）_ 関数を使用した二分探索では、明示的な検索値を指定せずに要素を見つけることができます。
代わりに、要素を `Int` 値にマッピングする比較関数を受け取り、その関数がゼロを返す要素を検索します。
リストは提供された関数に従って昇順にソートされている必要があります。言い換えると、比較の戻り値はリストの要素が進むにつれて増加する必要があります。

```kotlin

import kotlin.math.sign
//sampleStart
data class Product(val name: String, val price: Double)

fun priceComparison(product: Product, price: Double) = sign(product.price - price).toInt()

fun main() {
    val productList = listOf(
        Product("WebStorm", 49.0),
        Product("AppCode", 99.0),
        Product("DotTrace", 129.0),
        Product("ReSharper", 149.0))

    println(productList.binarySearch { priceComparison(it, 99.0) })
}
//sampleEnd
```
{kotlin-runnable="true"}

Comparator による二分探索も比較関数による二分探索も、リストの範囲を指定して実行できます。

## リストの書き込み操作 {id="list-write-operations"}

[コレクションの書き込み操作](collection-write.md) で説明されているコレクション変更操作に加えて、[可変（mutable）](collections-overview.md#read-only-and-mutable-collections) なリストは固有の書き込み操作をサポートしています。
このような操作では、インデックスを使用して要素にアクセスし、リストの変更機能を拡張します。

### 追加 {id="add"}

リスト内の特定の位置に要素を追加するには、要素を挿入する位置を追加の引数として指定して、[`add()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/-mutable-list/add.html) および [`addAll()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/add-all.html) を使用します。
その位置以降にあるすべての要素は右にシフトします。

```kotlin

fun main() {
//sampleStart
    val numbers = mutableListOf("one", "five", "six")
    numbers.add(1, "two")
    numbers.addAll(2, listOf("three", "four"))
    println(numbers)
//sampleEnd
}
```
{kotlin-runnable="true"}

### 更新 {id="update"}

リストには、指定された位置の要素を置き換える関数 [`set()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/-mutable-list/set.html) と、その演算子形式である `[]` も用意されています。`set()` は他の要素のインデックスを変更しません。

```kotlin

fun main() {
//sampleStart
    val numbers = mutableListOf("one", "five", "three")
    numbers[1] =  "two"
    println(numbers)
//sampleEnd
}
```
{kotlin-runnable="true"}

[`fill()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/fill.html) は、コレクション内のすべての要素を指定された値で単純に置き換えます。

```kotlin

fun main() {
//sampleStart
    val numbers = mutableListOf(1, 2, 3, 4)
    numbers.fill(3)
    println(numbers)
//sampleEnd
}
```
{kotlin-runnable="true"}

### 削除 {id="remove"}

リスト内の特定の位置から要素を削除するには、位置を引数として指定して [`removeAt()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/-mutable-list/remove-at.html) 関数を使用します。
削除された要素の後にある要素のすべてのインデックスは 1 つ減少します。

```kotlin

fun main() {
//sampleStart
    val numbers = mutableListOf(1, 2, 3, 4, 3)    
    numbers.removeAt(1)
    println(numbers)
//sampleEnd
}
```
{kotlin-runnable="true"}

### ソート {id="sort"}

[コレクションの並び替え](collection-ordering.md) では、特定の順序でコレクション要素を取得する操作について説明しています。
可変リストに対しては、標準ライブラリは同様の並び替え操作をインプレース（in-place）で実行する同様の拡張関数を提供しています。
このような操作をリストのインスタンスに適用すると、そのインスタンス自体の要素の順序が変更されます。

インプレースのソート関数には、読み取り専用リストに適用される関数と似た名前が付けられていますが、`ed/d` の接尾辞がありません：

* すべてのソート関数の名前において `sorted*` の代わりに `sort*`: [`sort()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/sort.html)、[`sortDescending()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/sort-descending.html)、[`sortBy()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/sort-by.html) など。
* `shuffled()` の代わりに [`shuffle()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/shuffle.html)。
* `reversed()` の代わりに [`reverse()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/reverse.html)。

可変リストに対して呼び出された [`asReversed()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/as-reversed.html) は、元のリストの反転ビューである別の可変リストを返します。そのビューへの変更は元のリストにも反映されます。
次の例は、可変リストのソート関数を示しています。

```kotlin

fun main() {
//sampleStart
    val numbers = mutableListOf("one", "two", "three", "four")

    numbers.sort()
    println("Sort into ascending: $numbers")
    numbers.sortDescending()
    println("Sort into descending: $numbers")

    numbers.sortBy { it.length }
    println("Sort into ascending by length: $numbers")
    numbers.sortByDescending { it.last() }
    println("Sort into descending by the last letter: $numbers")
    
    numbers.sortWith(compareBy<String> { it.length }.thenBy { it })
    println("Sort by Comparator: $numbers")

    numbers.shuffle()
    println("Shuffle: $numbers")

    numbers.reverse()
    println("Reverse: $numbers")
//sampleEnd
}
```
{kotlin-runnable="true"}