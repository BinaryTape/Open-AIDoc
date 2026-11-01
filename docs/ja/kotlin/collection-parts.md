[//]: # (title: コレクションの一部の取得)

Kotlin標準ライブラリには、コレクションの一部を取得するための拡張関数が含まれています。
これらの関数は、位置を明示的に指定したり、結果のサイズを指定したりするなど、結果となるコレクションの要素を選択するためのさまざまな方法を提供します。

## Slice {id="slice"}

[`slice()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/slice.html) は、指定されたインデックスを持つコレクション要素のリストを返します。インデックスは、[範囲（range）](ranges.md)または整数値のコレクションとして渡すことができます。

```kotlin

fun main() {
//sampleStart    
    val numbers = listOf("one", "two", "three", "four", "five", "six")    
    println(numbers.slice(1..3))
    println(numbers.slice(0..4 step 2))
    println(numbers.slice(setOf(3, 5, 0)))    
//sampleEnd
}
```
{kotlin-runnable="true"}

## Takeとdrop {id="take-and-drop"}

先頭から指定された数の要素を取得するには、[`take()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/take.html) 関数を使用します。
末尾の要素を取得するには、[`takeLast()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/take-last.html) を使用します。
コレクションのサイズより大きい数値を指定して呼び出した場合、どちらの関数もコレクション全体を返します。

先頭または末尾から指定された数の要素を除いたすべての要素を取得するには、それぞれ [`drop()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/drop.html) および [`dropLast()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/drop-last.html) 関数を呼び出します。

```kotlin

fun main() {
//sampleStart
    val numbers = listOf("one", "two", "three", "four", "five", "six")
    println(numbers.take(3))
    println(numbers.takeLast(3))
    println(numbers.drop(1))
    println(numbers.dropLast(5))
//sampleEnd
}
```
{kotlin-runnable="true"}

述語（predicate）を使用して、取得または除外する要素数を定義することもできます。
上記で説明したものと同様の関数が4つあります。

* [`takeWhile()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/take-while.html) は述語を伴う `take()` です。述語に一致しない最初の要素の手前までの要素を取得します。コレクションの最初の要素が述語に一致しない場合、結果は空になります。
* [`takeLastWhile()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/take-last-while.html) は `takeLast()` と同様です。コレクションの末尾から述語に一致する要素の範囲を取得します。その範囲の最初の要素は、述語に一致しない最後の要素の次の要素です。コレクションの最後の要素が述語に一致しない場合、結果は空になります。
* [`dropWhile()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/drop-while.html) は同じ述語に対する `takeWhile()` の逆です。述語に一致しない最初の要素から末尾までの要素を返します。
* [`dropLastWhile()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/drop-last-while.html) は同じ述語に対する `takeLastWhile()` の逆です。先頭から、述語に一致しない最後の要素までの要素を返します。

```kotlin

fun main() {
//sampleStart
    val numbers = listOf("one", "two", "three", "four", "five", "six")
    println(numbers.takeWhile { !it.startsWith('f') })
    println(numbers.takeLastWhile { it != "three" })
    println(numbers.dropWhile { it.length == 3 })
    println(numbers.dropLastWhile { it.contains('i') })
//sampleEnd
}
```
{kotlin-runnable="true"}

## Chunked {id="chunked"}

コレクションを指定されたサイズのパーツに分割するには、[`chunked()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/chunked.html) 関数を使用します。
`chunked()` は単一の引数（チャンクのサイズ）を受け取り、指定されたサイズの `List` の `List` を返します。
最初のチャンクは最初の要素から始まり `size` 個の要素を含み、2番目のチャンクは次の `size` 個の要素を保持し、以降も同様に続きます。最後のチャンクはサイズが小さくなる場合があります。

```kotlin

fun main() {
//sampleStart
    val numbers = (0..13).toList()
    println(numbers.chunked(3))
//sampleEnd
}
```
{kotlin-runnable="true"}

返されるチャンクに対して、すぐに変換を適用することもできます。
これを行うには、`chunked()` を呼び出す際に変換をラムダ関数として渡します。
ラムダの引数はコレクションのチャンクです。変換を伴って `chunked()` が呼び出された場合、チャンクは短命な `List` であり、そのラムダ内ですぐに消費される必要があります。

```kotlin

fun main() {
//sampleStart
    val numbers = (0..13).toList() 
    println(numbers.chunked(3) { it.sum() })  // `it` は元のコレクションのチャンク
//sampleEnd
}
```
{kotlin-runnable="true"}

## Windowed {id="windowed"}

コレクション要素から、指定されたサイズで取得可能なすべての範囲を取得できます。
これらを取得するための関数は [`windowed()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/windowed.html) と呼ばれます。これは、指定されたサイズのスライディングウィンドウを通してコレクションを見ているかのような、要素範囲のリストを返します。
`chunked()` とは異なり、`windowed()` はコレクションの*各*要素から始まる要素範囲（_ウィンドウ_）を返します。
すべてのウィンドウは単一の `List` の要素として返されます。

```kotlin

fun main() {
//sampleStart
    val numbers = listOf("one", "two", "three", "four", "five")    
    println(numbers.windowed(3))
//sampleEnd
}
```
{kotlin-runnable="true"}

`windowed()` は、デフォルト値を持つパラメータによって、より高い柔軟性を提供します。

* `step` は、隣接する2つのウィンドウの最初の要素間の距離を定義します。デフォルト値は1であるため、結果にはすべての要素から始まるウィンドウが含まれます。ステップを2に増やすと、奇数番目の要素（1番目、3番目など）から始まるウィンドウのみが取得されます。
* `partialWindows` は、コレクションの末尾の要素から始まる、より小さいサイズのウィンドウを含めます。たとえば、3要素のウィンドウを要求した場合、最後の2つの要素についてはウィンドウを構築できません。この場合に `partialWindows` を有効にすると、サイズ2と1のリストがさらに2つ含まれます。

最後に、返された範囲に対してすぐに変換を適用することもできます。
これを行うには、`windowed()` を呼び出す際に変換をラムダ関数として渡します。

```kotlin

fun main() {
//sampleStart
    val numbers = (1..10).toList()
    println(numbers.windowed(3, step = 2, partialWindows = true))
    println(numbers.windowed(3) { it.sum() })
//sampleEnd
}
```
{kotlin-runnable="true"}

2要素のウィンドウを構築するために、別の関数である [`zipWithNext()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/zip-with-next.html) が用意されています。
これはレシーバーコレクションの隣接する要素のペアを作成します。
`zipWithNext()` はコレクションをペアに分割するのではなく、最後の要素を除く*各*要素に対して `Pair` を作成することに注意してください。そのため、`[1, 2, 3, 4]` に対する結果は `[[1, 2], [3, 4]]` ではなく `[[1, 2], [2, 3], [3, 4]]` になります。
`zipWithNext()` は変換関数を指定して呼び出すこともできます。この関数はレシーバーコレクションの2つの要素を引数として受け取る必要があります。

```kotlin

fun main() {
//sampleStart
    val numbers = listOf("one", "two", "three", "four", "five")    
    println(numbers.zipWithNext())
    println(numbers.zipWithNext() { s1, s2 -> s1.length > s2.length})
//sampleEnd
}
```
{kotlin-runnable="true"}