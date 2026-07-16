[//]: # (title: 配列)

配列は、同じ型またはそのサブタイプの値を固定数保持するデータ構造です。
Kotlinで最も一般的な配列の型は、[`Array`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin/-array/) クラスで表されるオブジェクト型配列です。

> オブジェクト型配列でプリミティブを使用すると、プリミティブがオブジェクトに[ボックス化](https://docs.oracle.com/javase/tutorial/java/data/autoboxing.html)されるため、パフォーマンスに影響を与えます。ボックス化のオーバーヘッドを避けるには、代わりに[プリミティブ型配列](#primitive-type-arrays)を使用してください。
>
{style="note"}

## 配列を使用する場合

特化した低レベルの要件を満たす必要がある場合に、Kotlinで配列を使用してください。例えば、一般的なアプリケーションで必要とされる以上のパフォーマンス要件がある場合や、カスタムデータ構造を構築する必要がある場合などです。このような制約がない場合は、代わりに[コレクション](collections-overview.md)を使用してください。

コレクションには、配列と比較して次のような利点があります。
* コレクションは読み取り専用にすることができ、より多くの制御が可能になり、明確な意図を持った堅牢なコードを書くことができます。
* コレクションへの要素の追加や削除は簡単です。対照的に、配列はサイズが固定されています。配列から要素を追加または削除する唯一の方法は、毎回新しい配列を作成することであり、非常に非効率的です。

  ```kotlin
  fun main() {
  //sampleStart
      var riversArray = arrayOf("Nile", "Amazon", "Yangtze")

      // += 代入演算子を使用すると、新しい riversArray が作成され、
      // 元の要素がコピーされて "Mississippi" が追加されます
      riversArray += "Mississippi"
      println(riversArray.joinToString())
      // Nile, Amazon, Yangtze, Mississippi
  //sampleEnd
  }
  ```
  {kotlin-runnable="true" kotlin-min-compiler-version="1.3" id="arrays-rivers-array-kotlin"}

* 等価演算子 (`==`) を使用して、コレクションが構造的に等しいかどうかをチェックできます。配列にはこの演算子を使用できません。代わりに、特別な関数を使用する必要があります。詳細については [配列の比較](#compare-arrays) を参照してください。

コレクションの詳細については、[コレクションの概要](collections-overview.md)を参照してください。

## 配列の作成

Kotlinで配列を作成するには、以下を使用できます：
* [`arrayOf()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin/array-of.html)、[`arrayOfNulls()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin/array-of-nulls.html#kotlin$arrayOfNulls(kotlin.Int))、[`emptyArray()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin/empty-array.html) などの関数。
* `Array` コンストラクタ。

この例では、[`arrayOf()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin/array-of.html) 関数を使用し、それに項目の値を渡します：

```kotlin
fun main() {
//sampleStart
    // 値 [1, 2, 3] を持つ配列を作成します
    val simpleArray = arrayOf(1, 2, 3)
    println(simpleArray.joinToString())
    // 1, 2, 3
//sampleEnd
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3" id="arrays-simple-array-kotlin"}

この例では、[`arrayOfNulls()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin/array-of-nulls.html#kotlin$arrayOfNulls(kotlin.Int)) 関数を使用して、指定されたサイズで `null` 要素が入力された配列を作成します：

```kotlin
fun main() {
//sampleStart
    // 値 [null, null, null] を持つ配列を作成します
    val nullArray: `Array<Int?>` = arrayOfNulls(3)
    println(nullArray.joinToString())
    // null, null, null
//sampleEnd
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3" id="arrays-null-array-kotlin"}

この例では、[`emptyArray()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin/empty-array.html) 関数を使用して空の配列を作成します：

```kotlin
    var exampleArray = emptyArray<String>()
```

> Kotlin の型推論により、代入の左側または右側で空の配列の型を指定できます。
>
> 例：
> ```Kotlin
> var exampleArray = emptyArray<String>()
> 
> var exampleArray: `Array<String>` = emptyArray()
>```
>
{style="note"}

`Array` コンストラクタは、配列のサイズと、インデックスを引数に取って配列要素の値を返す関数を受け取ります：

```kotlin
fun main() {
//sampleStart
    // ゼロ [0, 0, 0] で初期化される `Array<Int>` を作成します
    val initArray = Array<Int>(3) { 0 }
    println(initArray.joinToString())
    // 0, 0, 0

    // 値 ["0", "1", "4", "9", "16"] を持つ `Array<String>` を作成します
    val asc = Array(5) { i -> (i * i).toString() }
    asc.forEach { print(it) }
    // 014916
//sampleEnd
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3" id="arrays-array-constructor-kotlin"}

> ほとんどのプログラミング言語と同様に、Kotlin でもインデックスは 0 から始まります。
>
{style="note"}

### ネストされた配列

配列を相互にネストして、多次元配列を作成できます：

```kotlin
fun main() {
//sampleStart
    // 2次元配列を作成します
    val twoDArray = Array(2) { Array<Int>(2) { 0 } }
    println(twoDArray.contentDeepToString())
    // [[0, 0], [0, 0]]

    // 3次元配列を作成します
    val threeDArray = Array(3) { Array(3) { Array<Int>(3) { 0 } } }
    println(threeDArray.contentDeepToString())
    // [[[0, 0, 0], [0, 0, 0], [0, 0, 0]], [[0, 0, 0], [0, 0, 0], [0, 0, 0]], [[0, 0, 0], [0, 0, 0], [0, 0, 0]]]
//sampleEnd
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3" id="arrays-multidimensional-array-kotlin"}

> ネストされた配列は、同じ型や同じサイズである必要はありません。
>
{style="note"}

## 要素のアクセスと変更

配列は常にミュータブル（変更可能）です。配列の要素にアクセスして変更するには、[インデックスアクセス演算子](operator-overloading.md#indexed-access-operator) `[]` を使用します：

```kotlin
fun main() {
//sampleStart
    val simpleArray = arrayOf(1, 2, 3)
    val twoDArray = Array(2) { Array<Int>(2) { 0 } }

    // 要素にアクセスして変更します
    simpleArray[0] = 10
    twoDArray[0][0] = 2

    // 変更された要素をプリントします
    println(simpleArray[0].toString()) // 10
    println(twoDArray[0][0].toString()) // 2
//sampleEnd
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3" id="arrays-access-array-kotlin"}

Kotlinの配列は *非変 (invariant)* です。これは、実行時の障害を防ぐために、Kotlinが `Array<String>` を `Array<Any>` に代入することを許可しないことを意味します。代わりに、`Array<out Any>` を使用できます。詳細については、[型投影 (Type Projections)](generics.md#type-projections) を参照してください。

## 配列の操作

Kotlinでは、配列を使用して関数に可変長引数を渡したり、配列自体に対して操作を実行したりできます。例えば、配列の比較、内容の変換、またはコレクションへの変換などです。

### 関数への可変長引数の受け渡し

Kotlinでは、[`vararg`](functions.md#variable-number-of-arguments-varargs) パラメータを介して関数に可変長引数を渡すことができます。これは、メッセージのフォーマットやSQLクエリの作成時のように、引数の数が事前にわからない場合に便利です。

可変長引数を含む配列を関数に渡すには、スプレッド演算子 (`*`) を使用します。スプレッド演算子は、配列の各要素を個別の引数として、選択した関数に渡します：

```kotlin
fun main() {
    val lettersArray = arrayOf("c", "d")
    printAllStrings("a", "b", *lettersArray)
    // abcd
}

fun printAllStrings(vararg strings: String) {
    for (string in strings) {
        print(string)
    }
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3" id="arrays-vararg-array-kotlin"}

詳細については、[可変長引数 (varargs)](functions.md#variable-number-of-arguments-varargs) を参照してください。

### 配列の比較

2つの配列が同じ要素を同じ順序で持っているかどうかを比較するには、[`.contentEquals()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/content-equals.html) および [`.contentDeepEquals()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/content-deep-equals.html) 関数を使用します：

```kotlin
fun main() {
//sampleStart
    val simpleArray = arrayOf(1, 2, 3)
    val anotherArray = arrayOf(1, 2, 3)

    // 配列の内容を比較します
    println(simpleArray.contentEquals(anotherArray))
    // true

    // 中置表記法を使用して、要素が変更された後の配列の内容を比較します
    simpleArray[0] = 10
    println(simpleArray contentEquals anotherArray)
    // false
//sampleEnd
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3" id="arrays-compare-array-kotlin"}

> 配列の内容を比較するために、等価 (`==`) および不等 (`!=`) [演算子](equality.md#structural-equality) を使用しないでください。これらの演算子は、代入された変数が同じオブジェクトを指しているかどうかをチェックします。
> 
> Kotlinにおける配列のこのような動作の理由については、こちらの[ブログ記事](https://blog.jetbrains.com/kotlin/2015/09/feedback-request-limitations-on-data-classes/#Appendix.Comparingarrays)を参照してください。
> 
{style="warning"}

### 配列の変換

Kotlinには配列を変換するための便利な関数が数多くあります。このドキュメントではいくつか紹介しますが、これは網羅的なリストではありません。関数の完全なリストについては、[APIリファレンス](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin/-array/)を参照してください。

#### 合計 (Sum)

配列内のすべての要素の合計を返すには、[`.sum()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/sum.html) 関数を使用します：

```Kotlin
fun main() {
//sampleStart
    val sumArray = arrayOf(1, 2, 3)

    // 配列の要素を合計します
    println(sumArray.sum())
    // 6
//sampleEnd
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3" id="arrays-sum-array-kotlin"}

> `.sum()` 関数は、`Int` などの[数値データ型](numbers.md)の配列にのみ使用できます。
>
{style="note"}

#### シャッフル (Shuffle)

配列内の要素をランダムにシャッフルするには、[`.shuffle()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/shuffle.html) 関数を使用します：

```Kotlin
fun main() {
//sampleStart
    val simpleArray = arrayOf(1, 2, 3)

    // 要素をシャッフルします [3, 2, 1]
    simpleArray.shuffle()
    println(simpleArray.joinToString())

    // 要素を再度シャッフルします [2, 3, 1]
    simpleArray.shuffle()
    println(simpleArray.joinToString())
//sampleEnd
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3" id="arrays-shuffle-array-kotlin"}

### 配列からコレクションへの変換

配列を使用するものとコレクションを使用するものが混在する異なる API を使用する場合、配列を[コレクション](collections-overview.md)に、またはその逆に変換できます。

#### List または Set への変換

配列を `List` または `Set` に変換するには、[`.toList()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/to-list.html) および [`.toSet()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/to-set.html) 関数を使用します。

```kotlin
fun main() {
//sampleStart
    val simpleArray = arrayOf("a", "b", "c", "c")

    // Set に変換します
    println(simpleArray.toSet())
    // [a, b, c]

    // List に変換します
    println(simpleArray.toList())
    // [a, b, c, c]
//sampleEnd
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3" id="arrays-convert-list-set-kotlin"}

#### Map への変換

配列を `Map` に変換するには、[`.toMap()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/to-map.html) 関数を使用します。

[`Pair<K,V>`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin/-pair/) の配列のみを `Map` に変換できます。`Pair` インスタンスの最初の値がキーになり、2番目の値が値になります。この例では、[中置表記法](functions.md#infix-notation)を使用して [`to`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin/to.html) 関数を呼び出し、`Pair` のタプルを作成しています。

```kotlin
fun main() {
//sampleStart
    val pairArray = arrayOf("apple" to 120, "banana" to 150, "cherry" to 90, "apple" to 140)

    // Map に変換します
    // キーはフルーツ、値はそれらのカロリー数です
    // キーは一意である必要があるため、"apple" の最新の値が
    // 最初の値を上書きすることに注意してください
    println(pairArray.toMap())
    // {apple=140, banana=150, cherry=90}

//sampleEnd
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3" id="arrays-convert-map-kotlin"}

## プリミティブ型配列

プリミティブ値で `Array` クラスを使用すると、これらの値はオブジェクトにボックス化されます。代わりに、ボックス化のオーバーヘッドという副作用なしに配列にプリミティブを格納できる、プリミティブ型配列を使用できます。

| プリミティブ型配列 | Java での対応 |
|---|----------------|
| [`BooleanArray`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin/-boolean-array/) | `boolean[]`|
| [`ByteArray`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin/-byte-array/) | `byte[]`|
| [`CharArray`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin/-char-array/) | `char[]`|
| [`DoubleArray`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin/-double-array/) | `double[]`|
| [`FloatArray`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin/-float-array/) | `float[]`|
| [`IntArray`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin/-int-array/) | `int[]`|
| [`LongArray`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin/-long-array/) | `long[]`|
| [`ShortArray`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin/-short-array/) | `short[]`|

これらのクラスは `Array` クラスとの継承関係はありませんが、同じ関数とプロパティのセットを持っています。

この例では、`IntArray` クラスのインスタンスを作成します：

```kotlin
fun main() {
//sampleStart
    // サイズ 5 の Int 配列を作成し、値はゼロに初期化されます
    val exampleArray = IntArray(5)
    println(exampleArray.joinToString())
    // 0, 0, 0, 0, 0
//sampleEnd
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3" id="arrays-primitive-type-array-kotlin"}

> プリミティブ型配列をオブジェクト型配列に変換するには、[`.toTypedArray()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/to-typed-array.html) 関数を使用します。
> 
> オブジェクト型配列をプリミティブ型配列に変換するには、[`.toBooleanArray()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/to-boolean-array.html)、[`.toByteArray()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/to-byte-array.html)、[`.toCharArray()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/to-char-array.html) などを使用します。
> 
{style="note"}

## 次のステップ

* ほとんどのユースケースでコレクションの使用を推奨する理由の詳細については、[コレクションの概要](collections-overview.md)をお読みください。
* 他の[基本型](types-overview.md)について学びます。
* Java開発者の方は、[コレクション](java-to-kotlin-collections-guide.md)に関するJavaからKotlinへの移行ガイドをお読みください。