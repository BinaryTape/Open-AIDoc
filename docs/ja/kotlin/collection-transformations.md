[//]: # (title: コレクションの変換)

Kotlin標準ライブラリは、コレクションの*変換*（transformations）のための拡張関数セットを提供しています。
これらの関数は、指定された変換ルールに基づいて、既存のコレクションから新しいコレクションを構築します。
このページでは、利用可能なコレクション変換関数の概要を説明します。

## Map {id="map"}

*マッピング*（mapping）変換は、別のコレクションの要素に関数を適用した結果からコレクションを作成します。
基本的なマッピング関数は [`map()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/map.html) です。
これは指定されたラムダ関数を後続の各要素に適用し、そのラムダの結果のリストを返します。
結果の順序は、元の要素の順序と同じです。
要素のインデックスも引数として使用する変換を適用するには、[`mapIndexed()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/map-indexed.html) を使用します。

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

特定の要素に対する変換が `null` を生成する場合、`map()` の代わりに [`mapNotNull()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/map-not-null.html) 関数を、あるいは `mapIndexed()` の代わりに [`mapIndexedNotNull()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/map-indexed-not-null.html) を呼び出すことで、結果のコレクションから `null` を除外できます。

```kotlin

fun main() {
//sampleStart
    val numbers = setOf(1, 2, 3)
    println(numbers.mapNotNull { if ( it == 2) null else it * 3 })
    println(numbers.mapIndexedNotNull { idx, value -> if (idx == 0) null else value * idx })
//sampleEnd
}
```
{kotlin-runnable="true"}

マップ（Map）を変換する場合、値をそのままにしてキーを変換するか、その逆を行うかという2つの選択肢があります。
キーに特定の変換を適用するには [`mapKeys()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/map-keys.html) を使用し、値の変換には [`mapValues()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/map-values.html) を使用します。
どちらの関数もマップエントリを引数に取る変換を使用するため、キーと値の両方を操作できます。

```kotlin

fun main() {
//sampleStart
    val numbersMap = mapOf("key1" to 1, "key2" to 2, "key3" to 3, "key11" to 11)
    println(numbersMap.mapKeys { it.key.uppercase() })
    println(numbersMap.mapValues { it.value + it.key.length })
//sampleEnd
}
```
{kotlin-runnable="true"}

## Zip {id="zip"}

*Zip*（ジップ）変換は、両方のコレクション内の同じ位置にある要素からペア（Pair）を構築します。
Kotlin標準ライブラリでは、これは [`zip()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/zip.html) 拡張関数によって行われます。

別のコレクション（または配列）を引数としてコレクションまたは配列に対して呼び出された場合、`zip()` は `Pair` オブジェクトの `List` を返します。レシーバコレクションの要素がこれらのペアの最初の要素になります。

コレクションのサイズが異なる場合、`zip()` の結果は小さい方のサイズになり、大きいコレクションの超過した末尾の要素は結果に含まれません。

`zip()` は中置構文の形式 `a zip b` でも呼び出すことができます。

```kotlin

fun main() {
//sampleStart
    val colors = listOf("red", "brown", "grey")
    val animals = listOf("fox", "bear", "wolf")
    println(colors zip animals)

    val twoAnimals = listOf("fox", "bear")
    println(colors.zip(twoAnimals))
//sampleEnd
}
```
{kotlin-runnable="true"}

また、レシーバの要素と引数の要素という2つのパラメータを受け取る変換関数を指定して `zip()` を呼び出すこともできます。この場合、結果の `List` には、同じ位置にあるレシーバと引数の要素のペアに対して変換関数を呼び出した戻り値が含まれます。

```kotlin

fun main() {
//sampleStart
    val colors = listOf("red", "brown", "grey")
    val animals = listOf("fox", "bear", "wolf")
    
    println(colors.zip(animals) { color, animal -> "The ${animal.replaceFirstChar { it.uppercase() }} is $color"})
//sampleEnd
}
```
{kotlin-runnable="true"}

`Pair` の `List` がある場合、これらのペアから2つのリストを構築する逆の変換、つまり*アンジップ*（unzipping）を実行できます。

* 1つ目のリストには、元のリスト内の各 `Pair` の第1要素が含まれます。
* 2つ目のリストには、第2要素が含まれます。

ペアのリストを展開（アンジップ）するには、[`unzip()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/unzip.html) を呼び出します。

```kotlin

fun main() {
//sampleStart
    val numberPairs = listOf("one" to 1, "two" to 2, "three" to 3, "four" to 4)
    println(numberPairs.unzip())
//sampleEnd
}
```
{kotlin-runnable="true"}

## Associate {id="associate"}

*関連付け*（Association）変換を使用すると、コレクションの要素とそれに関連付けられた特定の値からマップを構築できます。
関連付けのタイプによって、要素は作成されるマップのキーにも値にもなり得ます。

基本的な関連付け関数 [`associateWith()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/associate-with.html) は、元のコレクションの要素をキーとし、指定された変換関数によってそれらから生成された値を値とする `Map` を作成します。2つの要素が等しい場合は、最後の要素のみがマップに残ります。

```kotlin

fun main() {
//sampleStart
    val numbers = listOf("one", "two", "three", "four")
    println(numbers.associateWith { it.length })
//sampleEnd
}
```
{kotlin-runnable="true"}

コレクションの要素を値とするマップを構築するには、[`associateBy()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/associate-by.html) 関数があります。これは要素の値に基づいてキーを返す関数を受け取ります。2つの要素のキーが等しい場合は、最後の要素のみがマップに残ります。

`associateBy()` は、値の変換関数を指定して呼び出すこともできます。

```kotlin

fun main() {
//sampleStart
    val numbers = listOf("one", "two", "three", "four")

    println(numbers.associateBy { it.first().uppercaseChar() })
    println(numbers.associateBy(keySelector = { it.first().uppercaseChar() }, valueTransform = { it.length }))
//sampleEnd
}
```
{kotlin-runnable="true"}

キーと値の両方をコレクションの要素から生成してマップを構築するもう1つの方法は、[`associate()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/associate.html) 関数です。
これは、対応するマップエントリのキーと値である `Pair` を返すラムダ関数を受け取ります。

`associate()` は短命な `Pair` オブジェクトを生成するため、パフォーマンスに影響を与える可能性があることに注意してください。
したがって、`associate()` はパフォーマンスがクリティカルでない場合や、他の選択肢よりも適している場合に使用すべきです。

後者の例としては、キーとそれに対応する値が要素から一緒に生成される場合が挙げられます。

```kotlin

fun main() {
data class FullName (val firstName: String, val lastName: String)

fun parseFullName(fullName: String): FullName {
    val nameParts = fullName.split(" ")
    if (nameParts.size == 2) {
        return FullName(nameParts[0], nameParts[1])
    } else throw Exception("Wrong name format")
}

//sampleStart
    val names = listOf("Alice Adams", "Brian Brown", "Clara Campbell")
    println(names.associate { name -> parseFullName(name).let { it.lastName to it.firstName } })  
//sampleEnd
}
```
{kotlin-runnable="true"}

ここでは、まず要素に対して変換関数を呼び出し、その関数の結果のプロパティからペアを構築しています。

## Flatten {id="flatten"}

ネストされたコレクションを操作する場合、ネストされたコレクションの要素へのフラットなアクセスを提供する標準ライブラリ関数が役立ちます。

最初の関数は [`flatten()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/flatten.html) です。
これは、コレクションのコレクション（例えば `Set` の `List` など）に対して呼び出すことができます。
この関数は、ネストされたコレクションのすべての要素を含む単一の `List` を返します。

```kotlin

fun main() {
//sampleStart
    val numberSets = listOf(setOf(1, 2, 3), setOf(4, 5, 6), setOf(1, 2))
    println(numberSets.flatten())
//sampleEnd
}
```
{kotlin-runnable="true"}

もう1つの関数である [`flatMap()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/flat-map.html) は、ネストされたコレクションを柔軟に処理する方法を提供します。これは、コレクションの要素を別のコレクションにマッピングする関数を受け取ります。
その結果、`flatMap()` はすべての要素に対する戻り値の単一のリストを返します。
つまり、`flatMap()` は（マッピング結果としてコレクションを返す）`map()` の呼び出しに続けて `flatten()` を呼び出すのと同様に動作します。

```kotlin

data class StringContainer(val values: List<String>)

fun main() {
//sampleStart
    val containers = listOf(
        StringContainer(listOf("one", "two", "three")),
        StringContainer(listOf("four", "five", "six")),
        StringContainer(listOf("seven", "eight"))
    )
    println(containers.flatMap { it.values })
//sampleEnd
}

```
{kotlin-runnable="true"}

## 文字列表現 {id="string-representation"}

コレクションの内容を読みやすい形式で取得する必要がある場合は、コレクションを文字列に変換する関数である [`joinToString()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/join-to-string.html) と [`joinTo()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/join-to.html) を使用します。

`joinToString()` は、指定された引数に基づいてコレクション要素から単一の `String` を構築します。
`joinTo()` も同様の処理を行いますが、結果を指定された [`Appendable`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.text/-appendable/index.html) オブジェクトに追加します。

パラメータのデフォルト値を使用して呼び出された場合、これらの関数はコレクションに対して `toString()` を呼び出した場合と同様の結果、つまりカンマとスペースで区切られた各要素の文字列表現の `String` を返します。

```kotlin

fun main() {
//sampleStart
    val numbers = listOf("one", "two", "three", "four")
    
    println(numbers)         
    println(numbers.joinToString())
    
    val listString = StringBuffer("The list of numbers: ")
    numbers.joinTo(listString)
    println(listString)
//sampleEnd
}
```
{kotlin-runnable="true"}

カスタムの文字列表現を構築するには、関数の引数である `separator`、`prefix`、`postfix` でパラメータを指定できます。結果の文字列は `prefix` で始まり、`postfix` で終わります。`separator` は最後の要素以外の各要素の後に配置されます。

```kotlin

fun main() {
//sampleStart
    val numbers = listOf("one", "two", "three", "four")    
    println(numbers.joinToString(separator = " | ", prefix = "start: ", postfix = ": end"))
//sampleEnd
}
```
{kotlin-runnable="true"}

より大きなコレクションの場合、結果に含める要素数である `limit` を指定したい場合があります。
コレクションのサイズが `limit` を超える場合、残りのすべての要素は `truncated` 引数の単一の値に置き換えられます。

```kotlin

fun main() {
//sampleStart
    val numbers = (1..100).toList()
    println(numbers.joinToString(limit = 10, truncated = "<...>"))
//sampleEnd
}
```
{kotlin-runnable="true"}

最後に、要素自体の表現をカスタマイズするには、`transform` 関数を指定します。

```kotlin

fun main() {
//sampleStart
    val numbers = listOf("one", "two", "three", "four")
    println(numbers.joinToString { "Element: ${it.uppercase()}"})
//sampleEnd
}
```
{kotlin-runnable="true"}