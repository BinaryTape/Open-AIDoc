[//]: # (title: コレクションの順序付け)

要素の順序は、特定のコレクション型において重要な側面です。
例えば、同じ要素を持つ2つのリストであっても、要素の順序が異なっていれば等価ではありません。

Kotlinでは、オブジェクトの順序をいくつかの方法で定義できます。

まず、*自然順序*（natural order）があります。これは [`Comparable`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin/-comparable/index.html)
インターフェースの実装に対して定義されます。自然順序は、他に順序が指定されていない場合のソートに使用されます。

ほとんどの組み込み型は比較可能（comparable）です：

* 数値型は従来の数値の順序を使用します：`1` は `0` より大きい、`-3.4f` は `-5f` より大きい、など。
* `Char` と `String` は[辞書順](https://en.wikipedia.org/wiki/Lexicographical_order)（lexicographical order）を使用します：`b` は `a` より大きい、`world` は `hello` より大きい、など。

ユーザー定義型に自然順序を定義するには、その型で `Comparable` を実装します。
これには `compareTo()` 関数の実装が必要です。`compareTo()` は同じ型の別のオブジェクトを引数として受け取り、どちらのオブジェクトが大きいかを示す整数値を返す必要があります：

* 正の値：レシーバーオブジェクトの方が大きいことを示します。
* 負の値：引数よりも小さいことを示します。
* ゼロ：オブジェクトが等しいことを示します。

以下は、メジャーパートとマイナーパートで構成されるバージョンを順序付けるためのクラスです。

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

*カスタム順序*（custom order）を使用すると、任意の型のインスタンスを好みの方法でソートできます。
特に、比較可能でないオブジェクトの順序を定義したり、比較可能な型に対して自然順序以外の順序を定義したりできます。
ある型のカスタム順序を定義するには、その型用の [`Comparator`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin/-comparator/index.html) を作成します。
`Comparator` には `compare()` 関数が含まれています。これはクラスの2つのインスタンスを受け取り、それらの比較結果を整数値で返します。
結果は、上述の `compareTo()` の結果と同じ方法で解釈されます。

```kotlin
fun main() {
//sampleStart
    val lengthComparator = Comparator { str1: String, str2: String -> str1.length - str2.length }
    println(listOf("aaa", "bb", "c").sortedWith(lengthComparator))
//sampleEnd
}
```
{kotlin-runnable="true"}

`lengthComparator` を使用することで、デフォルトの辞書順ではなく、文字列の長さ順に並べ替えることができます。

`Comparator` をより簡潔に定義する方法として、標準ライブラリの [`compareBy()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.comparisons/compare-by.html) 関数があります。
`compareBy()` はインスタンスから `Comparable` な値を生成するラムダ関数を受け取り、生成された値の自然順序をカスタム順序として定義します。

`compareBy()` を使用すると、上記の例の長さコンパレータは次のようになります：

```kotlin
fun main() {
//sampleStart    
    println(listOf("aaa", "bb", "c").sortedWith(compareBy { it.length }))
//sampleEnd
}
```
{kotlin-runnable="true"}

複数の基準に基づいて順序を定義することもできます。
例えば、文字列を長さでソートし、長さが等しい場合はアルファベット順でソートするには、次のように記述できます：

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

複数の基準によるソートは一般的なシナリオであるため、Kotlin標準ライブラリには2つ目のソート基準を追加するために使用できる [`.thenBy()`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.comparisons/then-by.html) 関数が用意されています。

例えば、前の例のように `compareBy()` と `.thenBy()` を組み合わせて、文字列を最初に長さ順でソートし、次にアルファベット順でソートすることができます：

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

Kotlinのコレクションパッケージは、コレクションを自然順序、カスタム順序、さらにはランダムな順序でソートするための関数を提供しています。
このページでは、[読み取り専用](collections-overview.md#read-only-and-mutable-collections)コレクションに適用されるソート関数について説明します。
これらの関数は、要求された順序で元のコレクションの要素を含む新しいコレクションとして結果を返します。
[可変](collections-overview.md#read-only-and-mutable-collections)コレクションをインプレースでソートする関数については、[List固有の操作](list-operations.md#sort)を参照してください。

## 自然順序 {id="natural-order"}

基本的な関数 [`.sorted()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/sorted.html) および [`.sortedDescending()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/sorted-descending.html) は、自然順序に従ってコレクションの要素を昇順および降順にソートして返します。
これらの関数は、`Comparable` 要素のコレクションに適用されます。

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
 
カスタム順序でのソートや比較可能でないオブジェクトのソートには、[`.sortedBy()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/sorted-by.html) および [`.sortedByDescending()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/sorted-by-descending.html) 関数があります。
これらはコレクションの要素を `Comparable` な値にマッピングするセレクター関数を受け取り、その値の自然順序でコレクションをソートします。

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

コレクションのソートにカスタム順序を定義するには、独自の `Comparator` を渡すことができます。
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

## ソート順序のチェック {id="check-sorted-order"}

要素がすでに指定された順序に従っているかどうかを確認するには、以下の拡張関数を使用できます：

* `.isSorted()`
* `.isSortedDescending()`
* `.isSortedWith(comparator)`
* `.isSortedBy(selector)`
* `.isSortedByDescending(selector)`

これらの拡張関数は、要素が指定された順序にある場合、または要素が2つ未満の場合に `true` を返します。
順序が崩れているペアを見つけると、すぐに `false` を返してチェックを停止します。

`HashSet` など、反復（iteration）順序が保証されていないコレクションの場合、呼び出しごとに結果が異なる可能性があります。
要素を一貫した順序で生成しないシーケンスについても同様です。
呼び出し間で同じ結果を得るには、`List` などの反復順序が保証されているコレクションでのみこれらの関数を使用してください。

`Double` および `Float` の値をチェックする場合、これらの関数は `NaN` を他のどの値よりも大きいものとして扱い、`-0.0` を `0.0` より小さいものとして扱います。
さらに、`.isSortedBy()` および `.isSortedByDescending()` 関数は、セレクターの結果の `null` を非nullの値よりも小さいものとして扱います。

シーケンスに対してこれらの関数を呼び出す場合、その操作は終端操作（terminal operation）になります。
別のシーケンスを返すのではなく、シーケンスを消費して `Boolean` 値を生成します。

> これらのソート順序関数は、配列、プリミティブ配列、および符号なし配列でも利用できます。
> 符号なし配列およびその操作は[実験的（Experimental）](components-stability.md#stability-levels-explained)であり、`@ExperimentalUnsignedTypes` アノテーションによるオプトインが必要です。
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

[`.reversed()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/reversed.html) 関数を使用すると、逆順のコレクションを取得できます。

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

もう1つの逆順関数である [`.asReversed()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/as-reversed.html) は、同じコレクションインスタンスの逆順ビューを返すため、元のリストが変更されない場合は `.reversed()` よりも軽量で好ましい場合があります。

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

元のリストが可変である場合、その変更はすべて逆順ビューに反映され、その逆も同様です。

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

ただし、リストの可変性が不明な場合や、元のソースがリストですらない場合は、将来変更されないコピーである `.reversed()` の方が適しています。

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