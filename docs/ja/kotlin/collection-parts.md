[//]: # (title: コレクションの一部分の取得)

Kotlin 標準ライブラリには、コレクションの一部分を取得するための拡張関数が含まれています。
これらの関数は、位置を明示的に指定したり、結果のサイズを指定したりするなど、結果となるコレクションの要素を選択するためのさまざまな方法を提供します。

## スライス (Slice) {id="slice"}

[`slice()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/slice.html) は、指定されたインデックスを持つコレクション要素のリストを返します。インデックスは、[範囲（Range）](ranges.md)または整数のコレクションとして渡すことができます。

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

## Take と drop {id="take-and-drop"}

先頭から指定された数の要素を取得するには、[`take()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/take.html) 関数を使用します。
末尾から要素を取得するには、[`takeLast()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/take-last.html) を使用します。
コレクションのサイズよりも大きい数値を渡して呼び出された場合、どちらの関数もコレクション全体を返します。

先頭または末尾から指定された数の要素を除いたすべての要素を取得するには、それぞれ [`drop()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/drop.html) 関数および [`dropLast()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/drop-last.html) 関数を呼び出します。

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

述語（predicate）を使用して、取得または除外する要素の数を定義することもできます。
上記で説明した関数と同様の 4 つの関数があります。

* [`takeWhile()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/take-while.html) は述語付きの `take()` です。述語に一致しない最初の要素の手前までの要素を取得します。コレクションの最初の要素が述語に一致しない場合、結果は空になります。
* [`takeLastWhile()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/take-last-while.html) は `takeLast()` に似ています。コレクションの末尾から、述語に一致する要素の範囲を取得します。範囲の最初の要素は、述語に一致しない最後の要素の次の要素になります。コレクションの最後の要素が述語に一致しない場合、結果は空になります。
* [`dropWhile()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/drop-while.html) は、同じ述語を持つ `takeWhile()` の逆です。述語に一致しない最初の要素から末尾までの要素を返します。
* [`dropLastWhile()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/drop-last-while.html) は、同じ述語を持つ `takeLastWhile()` の逆です。先頭から、述語に一致しない最後の要素までの要素を返します。

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

## チャンク分割 (Chunked) {id="chunked"}

コレクションを指定したサイズのパーツに分割するには、[`chunked()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/chunked.html) 関数を使用します。
`chunked()` は単一の引数（チャンクのサイズ）を受け取り、指定されたサイズの `List` の `List` を返します。
最初のチャンクは最初の要素から始まり `size` 個の要素を含み、2 番目のチャンクは次の `size` 個の要素を保持し、以降も同様に続きます。最後のチャンクはそれより小さいサイズになることがあります。

```kotlin

fun main() {
//sampleStart
    val numbers = (0..13).toList()
    println(numbers.chunked(3))
//sampleEnd
}
```
{kotlin-runnable="true"}

返される各チャンクに対して、すぐに変換を適用することもできます。
これを行うには、`chunked()` を呼び出す際に変換をラムダ関数として渡します。
ラムダの引数はコレクションの各チャンクです。変換付きで `chunked()` が呼び出された場合、チャンクは短命な `List` となり、そのラムダ内ですぐに消費される必要があります。

```kotlin

fun main() {
//sampleStart
    val numbers = (0..13).toList() 
    println(numbers.chunked(3) { it.sum() })  // `it` は元のコレクションのチャンク
//sampleEnd
}
```
{kotlin-runnable="true"}

## ウィンドウ分割 (Windowed) {id="windowed"}

指定したサイズのコレクション要素の可能なすべての範囲を取得できます。
それらを取得するための関数は [`windowed()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/windowed.html) と呼ばれます。
これは、指定されたサイズのスライディングウィンドウを通してコレクションを見ているかのような、要素の範囲のリストを返します。
`chunked()` とは異なり、`windowed()` はコレクションの*各*要素から始まる要素の範囲（*ウィンドウ*）を返します。
すべてのウィンドウは、単一の `List` の要素として返されます。

```kotlin

fun main() {
//sampleStart
    val numbers = listOf("one", "two", "three", "four", "five")    
    println(numbers.windowed(3))
//sampleEnd
}
```
{kotlin-runnable="true"}

`windowed()` は、デフォルト値を持つパラメーターによってさらなる柔軟性を提供します。

* `step` は、隣接する 2 つのウィンドウの開始要素間の距離を定義します。デフォルト値は 1 であるため、結果にはすべての要素から始まるウィンドウが含まれます。ステップを 2 に増やすと、奇数番目の要素（1 番目、3 番目など）から始まるウィンドウのみを取得します。
* `partialWindows` は、コレクションの末尾の要素から始まる、より小さいサイズのウィンドウを含めます。たとえば、3 要素のウィンドウをリクエストした場合、最後の 2 要素については 3 要素のウィンドウを構築できません。この場合に `partialWindows` を有効にすると、サイズ 2 と 1 の 2 つのリストが追加で含まれます。

最後に、返される範囲に対してすぐに変換を適用することもできます。
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

2 要素のウィンドウを構築するための独立した関数として、[`zipWithNext()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/zip-with-next.html) があります。
これは、レシーバーコレクションの隣接する要素のペアを作成します。
`zipWithNext()` はコレクションをペアごとに分割するのではなく、最後の要素を除く*各*要素に対して `Pair` を作成することに注意してください。したがって、`[1, 2, 3, 4]` に対する結果は `[[1, 2], [3, 4]]` ではなく、`[[1, 2], [2, 3], [3, 4]]` となります。
`zipWithNext()` も変換関数を指定して呼び出すことができます。この変換関数は、レシーバーコレクションの 2 つの要素を引数として受け取る必要があります。

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