[//]: # (title: 並び替え)

要素の順序は、特定のコレクション型において重要な要素です。
例えば、同じ要素を持つ2つのリストであっても、要素の並び順が異なっていれば等価とはみなされません。

Kotlinでは、オブジェクトの順序をいくつかの方法で定義できます。

まず、*自然順序*（natural order）があります。これは、[`Comparable`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin/-comparable/index.html) インターフェースの実装に対して定義されます。自然順序は、他の順序が指定されていない場合のソートに使用されます。

ほとんどの組み込み型は比較可能（comparable）です：

* 数値型は従来の数値の順序を使用します：`1` は `0` より大きく、`-3.4f` は `-5f` より大きくなります。
* `Char` と `String` は[辞書順](https://en.wikipedia.org/wiki/Lexicographical_order)を使用します：`b` は `a` より大きく、`world` は `hello` より大きくなります。

ユーザー定義型に自然順序を定義するには、その型で `Comparable` を実装します。
これには `compareTo()` 関数の実装が必要です。`compareTo()` は同じ型の別のオブジェクトを引数として受け取り、どちらのオブジェクトが大きいかを示す整数値を返す必要があります：

* 正の値はレシーバーオブジェクトの方が大きいことを示します。
* 負の値は引数よりも小さいことを示します。
* ゼロはオブジェクト同士が等しいことを示します。

以下は、メジャーバージョンとマイナーバージョンから構成されるバージョンを順序付けるためのクラスです。

```kotlin
class Version(val major: Int, val minor: Int): Comparable<Version> {
    override fun compareTo(other: Version): Int = when {
        this.major != other.major -> this.major compareTo other.major // 中置形式の compareTo() 
        this.minor != other.minor -> this.minor compareTo other.minor
        else -> 0
    }
}

fun main() {    
    println(Version(1, 2) > Version(1, 3))
    println(Version(2, 0) > Version(1, 5))
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.6"}

*カスタム*順序（Custom order）を使用すると、任意の型のインスタンスを好みの方法でソートできます。
特に、比較可能でないオブジェクトに対して順序を定義したり、比較可能な型に対して自然順序以外の順序を定義したりできます。
ある型にカスタム順序を定義するには、その型に対する [`Comparator`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin/-comparator/index.html) を作成します。
`Comparator` は `compare()` 関数を含んでおり、クラスの2つのインスタンスを受け取ってそれらの比較結果を整数で返します。
この結果は、上で説明した `compareTo()` の結果と同じように解釈されます。

```kotlin
fun main() {
//sampleStart
    val lengthComparator = Comparator { str1: String, str2: String -> str1.length - str2.length }
    println(listOf("aaa", "bb", "c").sortedWith(lengthComparator))
//sampleEnd
}
```
{kotlin-runnable="true"}

`lengthComparator` を使用することで、デフォルトの辞書順ではなく、文字列をその長さ順に並べ替えることができます。

`Comparator` をより簡潔に定義する方法として、標準ライブラリの [`compareBy()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.comparisons/compare-by.html) 関数があります。
`compareBy()` はインスタンスから `Comparable` な値を生成するラムダ関数を受け取り、生成された値の自然順序としてカスタム順序を定義します。

`compareBy()` を使用すると、上記の例の長さ比較用のコンパレータは次のようになります：

```kotlin
fun main() {
//sampleStart    
    println(listOf("aaa", "bb", "c").sortedWith(compareBy { it.length }))
//sampleEnd
}
```
{kotlin-runnable="true"}

複数の基準に基づいて順序を定義することもできます。
例えば、文字列を長さ順にソートし、長さが等しい場合はアルファベット順にソートするには、次のように記述できます：

```kotlin
fun main() {
//sampleStart
    val sortedStrings = listOf("aaa", "bb", "c", "b", "a", "aa", "ccc")
        .sortedWith { a, b -> 
           when (val compareLengths = a.length.compareTo(b.length)) {
             0 -> a.compareTo(b)
             else -> compareLengths
           }
         }

    println(sortedStrings)
    // [a, b, c, aa, bb, aaa, ccc]
//sampleEnd
}
```
{kotlin-runnable="true"}

複数の基準によるソートは一般的なシナリオであるため、Kotlin標準ライブラリには2番目のソート規則を追加するために使用できる [`.thenBy()`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.comparisons/then-by.html) 関数が用意されています。

例えば、`compareBy()` と `.thenBy()` を組み合わせることで、前の例と同様に、まず文字列を長さ順にソートし、次にアルファベット順にソートすることができます：

```kotlin
fun main() {
//sampleStart
    val sortedStrings = listOf("aaa", "bb", "c", "b", "a", "aa", "ccc")
        .sortedWith(compareBy<String> { it.length }.thenBy { it })

    println(sortedStrings)
    // [a, b, c, aa, bb, aaa, ccc]
//sampleEnd
}
```
{kotlin-runnable="true"}

Kotlinのコレクションパッケージには、コレクションを自然順序、カスタム順序、さらにはランダムな順序でソートするための関数が用意されています。
このページでは、[読み取り専用](collections-overview.md#collection-types)コレクションに適用されるソート関数について説明します。
これらの関数は、要求された順序で元のコレクションの要素を含む新しいコレクションとして結果を返します。
[可変](collections-overview.md#collection-types)コレクションをその場でソートする関数については、[List特有の操作](list-operations.md#sort)を参照してください。

## 自然順序 {id="natural-order"}

基本的な関数である [`.sorted()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/sorted.html) および [`.sortedDescending()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/sorted-descending.html) は、コレクションの要素を自然順序に従って昇順および降順にソートして返します。
これらの関数は、`Comparable` な要素のコレクションに適用されます。

```kotlin
fun main() {
//sampleStart
    val numbers = listOf("one", "two", "three", "four")

    println("Sorted ascending: ${numbers.sorted()}")
    println("Sorted descending: ${numbers.sortedDescending()}")
//sampleEnd
}
```
{kotlin-runnable="true"}

## カスタム順序 {id="custom-orders"}
 
カスタム順序でソートする場合や、比較可能でないオブジェクトをソートする場合は、[`.sortedBy()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/sorted-by.html) および [`.sortedByDescending()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/sorted-by-descending.html) 関数があります。
これらは、コレクションの要素を `Comparable` な値にマッピングするセレクタ関数を受け取り、その値の自然順序でコレクションをソートします。

```kotlin
fun main() {
//sampleStart
    val numbers = listOf("one", "two", "three", "four")

    val sortedNumbers = numbers.sortedBy { it.length }
    println("Sorted by length ascending: $sortedNumbers")
    val sortedByLast = numbers.sortedByDescending { it.last() }
    println("Sorted by the last letter descending: $sortedByLast")
//sampleEnd
}
```
{kotlin-runnable="true"}

コレクションのソート用にカスタム順序を定義するには、独自の `Comparator` を渡すことができます。
これを行うには、`Comparator` を渡して [`.sortedWith()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/sorted-with.html) 拡張関数を呼び出します。
この関数を使用すると、文字列を長さ順にソートする処理は次のようになります：

```kotlin
fun main() {
//sampleStart
    val numbers = listOf("one", "two", "three", "four")
    println("Sorted by length ascending: ${numbers.sortedWith(compareBy { it.length })}")
//sampleEnd
}
```
{kotlin-runnable="true"}

## ソート済み順序のチェック {id="check-sorted-order"}

要素が指定された順序に既に従っているかどうかを確認するには、以下の拡張関数を使用できます：

* `.isSorted()`
* `.isSortedDescending()`
* `.isSortedWith(comparator)`
* `.isSortedBy(selector)`
* `.isSortedByDescending(selector)`

これらの拡張関数は、要素が指定された順序で並んでいる場合、または要素が2個未満の場合に `true` を返します。
順序が崩れているペアが見つかり次第、チェックを停止して `false` を返します。

`HashSet` のように反復順序が保証されていないコレクションの場合、呼び出しごとに結果が異なる可能性があります。
一貫した順序で要素を生成しないシーケンスについても同様です。
呼び出し間で同じ結果を得るには、`List` など反復順序が保証されているコレクションに対してのみこれらの関数を使用してください。

`Double` および `Float` の値をチェックする場合、これらの関数は `NaN` を他のどの値よりも大きいものとして扱い、`-0.0` を `0.0` よりも小さいものとして扱います。
さらに、`.isSortedBy()` および `.isSortedByDescending()` 関数は、セレクタの結果が `null` である場合、非nullの値よりも小さいものとして扱います。

シーケンスに対してこれらの関数を呼び出した場合、その操作は終端操作（terminal operation）になります。別のシーケンスを返すのではなく、シーケンスを消費して `Boolean` 値を生成します。

> これらのソート順序関数は、配列、プリミティブ配列、符号なし配列でも利用できます。
> 符号なし配列およびそれらに対する操作は[実験的（Experimental）](components-stability.md#stability-levels-explained)であり、`@ExperimentalUnsignedTypes` アノテーションによるオプトインが必要です。
> 
{style="note"}

以下は、`.isSorted()` および `.isSortedBy()` 関数を使用してソート順序をチェックする例です：

```kotlin
data class User(val name: String, val age: Int)

fun main() {
//sampleStart
    val numbers = listOf(1, 2, 3, 4)
    println(numbers.isSorted())
    // true

    val users = listOf(
        User("Alice", 24),
        User("Bob", 31),
        User("Charlie", 29),
    )
    println(users.isSortedBy(User::age))
    // false

    val descending = listOf(4, 3, 2, 1)
    println(descending.isSortedDescending())
    // true
   
//sampleEnd
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="2.4"}

## 逆順 {id="reverse-order"}

[`.reversed()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/reversed.html) 関数を使用すると、逆順になったコレクションを取得できます。

```kotlin
fun main() {
//sampleStart
    val numbers = listOf("one", "two", "three", "four")
    println(numbers.reversed())
//sampleEnd
}
```
{kotlin-runnable="true"}

`.reversed()` 拡張関数は、要素のコピーを含む新しいコレクションを返します。
そのため、後から元のコレクションを変更しても、以前に取得した `.reversed()` の結果には影響しません。

もう一つの反転関数である [`.asReversed()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/as-reversed.html) は、同じコレクションインスタンスの反転されたビューを返します。そのため、元のリストが変更されない場合は、`.reversed()` よりも軽量で望ましい場合があります。

```kotlin
fun main() {
//sampleStart
    val numbers = listOf("one", "two", "three", "four")
    val reversedNumbers = numbers.asReversed()
    println(reversedNumbers)
//sampleEnd
}
```
{kotlin-runnable="true"}

元のリストが可変である場合、その変更はすべて反転されたビューに反映され、その逆も同様です。

```kotlin
fun main() {
//sampleStart
    val numbers = mutableListOf("one", "two", "three", "four")
    val reversedNumbers = numbers.asReversed()
    println(reversedNumbers)
    numbers.add("five")
    println(reversedNumbers)
//sampleEnd
}
```
{kotlin-runnable="true"}

ただし、リストの可変性が不明な場合や、元のソースがそもそもリストではない場合は、結果が将来変更されないコピーである `.reversed()` の方が適しています。

## ランダムな順序 {id="random-order"}

最後に、コレクションの要素をランダムな順序で含む新しい `List` を返す関数 [`.shuffled()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/shuffled.html) があります。
引数なしで呼び出すことも、[`Random`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.random/-random/index.html) オブジェクトを渡して呼び出すこともできます。

```kotlin
fun main() {
//sampleStart
     val numbers = listOf("one", "two", "three", "four")
     println(numbers.shuffled())
//sampleEnd
}
```
{kotlin-runnable="true"}