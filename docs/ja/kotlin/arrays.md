[//]: # (title: 配列)
[//]: # (description: Kotlin における配列の作成、アクセス、変更、比較、変換方法を学びます。)

配列は、同じ型またはそのサブタイプの固定数の値を保持するデータ構造です。
配列の要素は順序付けされており、インデックスによってアクセスされます。

Kotlin は [`Array<T>`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin/-array/) クラスと[プリミティブ型配列](#primitive-type-arrays)を提供しています。

## 配列を使用するケース {id="when-to-use-arrays"}

Java API との相互運用性や、低レイヤーの要件がある場合に配列を使用します。たとえば、通常のアプリケーションで求められる水準を超えるパフォーマンス要件がある場合や、カスタムデータ構造を構築する必要がある場合などです。

ほとんどのユースケースでは、代わりに[コレクション](collections-overview.md)を使用することをお勧めします。

| 機能 | 配列 | コレクション |
|---|---|---|
| サイズ | 固定 | 型による |
| 読み取り専用バリアント | なし（常に可変） | あり（`List` および `Set`） |
| 要素の追加と削除 | ネイティブサポートなし。<br/> 新しい配列を確保してコピー | あり（可変コレクション） |
| `==` による構造的等価性 | なし（参照を比較）。<br/> 代わりに [`.contentEquals()`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.collections/content-equals.html) を使用 | あり |
| プリミティブ値 | プリミティブ型配列はボクシングなしで<br/>値を格納 | 通常はボクシングされる |
| Java との相互運用性 | `T[]` にマッピング | `java.util.List` および<br/> `java.util.Set` にマッピング |
| 関数型スタイルのフィルタリングと<br/>変換 | 限定的 | 豊富 |

配列をコレクションに変換する方法については、[コレクションへの変換](#convert-to-collections)を参照してください。

## 配列を作成する {id="create-arrays"}

配列を作成するには、以下の方法を使用できます。

* [`arrayOf()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin/array-of.html)、[`arrayOfNulls()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin/array-of-nulls.html#kotlin$arrayOfNulls(kotlin.Int))、または [`emptyArray()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin/empty-array.html) 関数。
* `Array` コンストラクタ。

> 配列を `val` で宣言しても変数の再代入が防止されるだけであり、内容が読み取り専用になるわけではありません。
> `val` と `var` のどちらの配列でも要素は変更可能です。この違いは参照にのみ影響し、内容には影響しません。
> 読み取り専用のビューが必要な場合は、代わりに[コレクション](collections-overview.md)を使用してください。
> 
{style="note"}

### 値を持つ配列 {id="array-with-values"}

既知の値のセットから型付き配列を作成するには、[`arrayOf()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin/array-of.html) 関数を使用します。
Kotlin は型を自動的に推論します。

```kotlin
fun main() {
//sampleStart
    val simpleArray = arrayOf(1, 2, 3) // Array<Int>
    println(simpleArray.joinToString())
    // 1, 2, 3
//sampleEnd
}
```
{kotlin-runnable="true" id="arrays-simple-array-kotlin"}

### 空の配列 {id="empty-array"}

要素を持たない配列を作成するには、[`emptyArray()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin/empty-array.html) 関数を使用します。
要素の型は代入の左辺または右辺で指定できます。

```kotlin
val emptyArrayRight = emptyArray<String>()
val emptyArrayLeft: Array<String> = emptyArray()
```

配列に[要素を追加する方法](#add-and-remove-elements)を学びましょう。

### null を含む配列 {id="array-with-nulls"}

指定されたサイズで要素が `null` で埋められた配列を作成するには、[`arrayOfNulls()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin/array-of-nulls.html#kotlin$arrayOfNulls(kotlin.Int)) 関数を使用します。

```kotlin
fun main() {
//sampleStart
    val nullArray: Array<Int?> = arrayOfNulls(3)
    println(nullArray.joinToString())
    // null, null, null
//sampleEnd
}
```
{kotlin-runnable="true" id="arrays-null-array-kotlin"}

### Array コンストラクタ {id="array-constructor"}

`Array` コンストラクタは、配列のサイズと、配列要素の値を返す関数を受け取ります。

```kotlin
fun main() {
//sampleStart
    val zeroes = Array<Int>(3) { 0 }
    println(zeroes.joinToString())
    // 0, 0, 0
    
    val squares = Array(5) { i -> i * i }
    println(squares.joinToString())
    // 0, 1, 4, 9, 16
//sampleEnd
}
```
{kotlin-runnable="true" id="arrays-array-constructor-kotlin"}

### ネストされた配列 {id="nested-arrays"}

ネストされた配列（多次元配列）を作成するには、配列の配列を使用します。
ネストされた配列は、同じ型や同じサイズである必要はありません。

```kotlin
fun main() {
//sampleStart
    // 2次元配列を作成
    val twoDArray = Array(2) { Array<Int>(2) { 0 } }
    println(twoDArray.contentDeepToString())
    // [[0, 0], [0, 0]]

    // 3次元配列を作成
    val threeDArray = Array(3) { Array(3) { Array<Int>(3) { 0 } } }
    println(threeDArray.contentDeepToString())
    // [[[0, 0, 0], [0, 0, 0], [0, 0, 0]], [[0, 0, 0], [0, 0, 0], [0, 0, 0]], [[0, 0, 0], [0, 0, 0], [0, 0, 0]]]
//sampleEnd
}
```
{kotlin-runnable="true" id="arrays-multidimensional-array-kotlin"}

### プリミティブ型配列 {id="primitive-type-arrays"}

プリミティブ値に対して `Array` クラスを使用すると、コンパイラはこれらの値をオブジェクトにボクシングします。
ボクシングのオーバーヘッドを避けるために、専用のプリミティブ型配列を使用できます。
これらは [`Array<T>`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin/-array/) クラスのサブクラスではありませんが、同様の一連の関数とプロパティを提供します。

| Kotlin の型 | Java での同等物 |
|---|---|
| [`BooleanArray`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin/-boolean-array/) | `boolean[]` |
| [`ByteArray`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin/-byte-array/) | `byte[]` |
| [`CharArray`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin/-char-array/) | `char[]` |
| [`DoubleArray`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin/-double-array/) | `double[]` |
| [`FloatArray`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin/-float-array/) | `float[]` |
| [`IntArray`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin/-int-array/) | `int[]` |
| [`LongArray`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin/-long-array/) | `long[]` |
| [`ShortArray`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin/-short-array/) | `short[]` |

> Kotlin には専用の `StringArray` 型はありません。`String` はプリミティブではないため、
> 代わりに推論された型を持つ [`arrayOf()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin/array-of.html) または `arrayOf<String>()` 関数を使用してください。
> 
{style="note"}

プリミティブ型配列を作成するには、次のいずれかの方法を使用します。

* コンストラクタ関数：

  ```kotlin
  fun main() {
  //sampleStart
      // 値が0に初期化されたサイズ5のInt配列を作成
      val primitiveTypeArray = IntArray(5)
      println(primitiveTypeArray.joinToString())
      // 0, 0, 0, 0, 0
  
      // 初期化関数を受け取るInt配列を作成
      val squares = IntArray(5) { i -> i * i }
      println(squares.joinToString())
      // 0, 1, 4, 9, 16
  //sampleEnd
  }
  ```
  {kotlin-runnable="true" id="arrays-primitive-type-array-kotlin"}

* ファクトリ関数：

  ```kotlin
  fun main() {
  //sampleStart
      // 5つの要素を持つInt配列を作成
      val numbers = intArrayOf(1, 2, 3, 4, 5)
      println(numbers.joinToString())
      // 1, 2, 3, 4, 5

      // 3つの要素を持つChar配列を作成
      val characters = charArrayOf('K', 't', 'l')
      println(characters.joinToString())
      // K, t, l

      // 3つの要素を持つDouble配列を作成
      val doubles = doubleArrayOf(0.22, 4.16, 0.5)
      println(doubles.joinToString()) 
      // 0.22, 4.16, 0.5
  //sampleEnd
  }
  ```
  {kotlin-runnable="true"}

> プリミティブ型配列をオブジェクト型配列に変換するには、[`.toTypedArray()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/to-typed-array.html)
> 関数を使用します。
>
> オブジェクト型配列をプリミティブ型配列に変換するには、[`.toBooleanArray()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/to-boolean-array.html)、
> [`.toByteArray()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/to-byte-array.html)、[`.toCharArray()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/to-char-array.html)
> などを使用します。
>
{style="note"}

## 配列の操作 {id="work-with-arrays"}

配列は、反復処理、検索、ソート、変換など、コレクションと同じ操作の多くをサポートしています。
Kotlin では、関数への可変長引数の受け渡しに配列を使用したり、配列自体に対して操作を実行したりできます。
最も一般的なプロパティと関数については、以下の表を参照してください。

| メンバー | 戻り値 |
|---|---|
| [`size`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin/-array/size.html) | 要素数 |
| [`indices`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.collections/indices.html) | 有効なインデックスの範囲 |
| [`lastIndex`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.collections/last-index.html) | 最後の有効なインデックス |
| [`first()`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.collections/first.html) および [`last()`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.collections/last.html) | 最初および最後の要素 |
| [`isEmpty()`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.collections/is-empty.html) および [`isNotEmpty()`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.collections/is-not-empty.html) | 配列が空であるか、空でない場合に `true` |
| [`contains()`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.collections/contains.html) | 配列に指定した要素が含まれている場合に `true` |

> 配列のプロパティや関数の詳細については、[API リファレンス](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin/-array/)を参照してください。
> 
{style="tip"}

このセクションでは、最も頻繁に使用される操作のいくつかを紹介します。

### 要素へのアクセスと変更 {id="access-and-modify-elements"}

配列内の要素にアクセスして変更するには、[インデックスアクセス演算子](operator-overloading.md#indexed-access-operator)
（`[]`）を使用します。

```kotlin
fun main() {
//sampleStart
    val simpleArray = arrayOf(1, 2, 3)
    val twoDArray = Array(2) { Array<Int>(2) { 0 } }

    // 要素にアクセスして変更
    simpleArray[0] = 10
    twoDArray[0][0] = 2

    // 変更された要素を出力
    println(simpleArray[0]) 
    // 10
    println(twoDArray[0][0]) 
    // 2
//sampleEnd
}
```
{kotlin-runnable="true" id="arrays-access-array-kotlin"}

> 配列の境界外のインデックスにアクセスしようとすると、Kotlin は実行時に `ArrayIndexOutOfBoundsException` をスローします。
>
{style="note"} 

インプレースで特定の範囲の要素を置き換えるには、[`fill(element, fromIndex, toIndex)`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.collections/fill.html) 関数を使用することもできます。`fromIndex` は含まれ（inclusive）、`toIndex` は含まれません（exclusive）。

```kotlin
fun main() {
//sampleStart
    val arr = IntArray(3)
    println(arr.joinToString())
    // 0, 0, 0
    
   arr.fill(1)
   println(arr.joinToString())
   // 1, 1, 1
  
   arr.fill(0, 0, 2)
   println(arr.joinToString())
   // 0, 0, 1
//sampleEnd
}
```
{kotlin-runnable="true"}

Kotlin において配列は*不変*（invariant）です。つまり、`Array<String>` は `Array<Any>` のサブタイプではありません。これにより、実行時の型障害の可能性が防止されます。共変性を表現するには、`Array<out Any>` [型プロジェクション](generics.md#type-projections)を使用します。

```kotlin
fun main() {
//sampleStart
    fun printArr(arr: Array<out Any>) {
        for (item in arr) print("$item, ")
    }

    printArr(arrayOf("k", "t", "n"))  
    // k, t, n, 
//sampleEnd
}
```
{kotlin-runnable="true"}

### 要素の追加と削除 {id="add-and-remove-elements"}

配列はサイズが固定されているため、`.add()` および `.remove()` 関数をサポートしていません。これらの操作を実行するには、新しい配列を作成する必要があります。そのためには、次のいずれかの方法を使用できます。

* [`.copyOf`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.collections/copy-of.html) 関数を使用する：

  ```kotlin
  fun main() {
  //sampleStart
      var arr = intArrayOf(0, 1, 2)
      
      arr = arr.copyOf(arr.size + 1)
      println(arr.joinToString())
      // 0, 1, 2, 0

      arr[arr.lastIndex] = 3
      println(arr.joinToString())
      // 0, 1, 2, 3
  //sampleEnd
  }
  ```
  {kotlin-runnable="true"}

* `+` または `+=` 演算子を使用する：

  ```kotlin
  fun main() {
  //sampleStart
      var arr = intArrayOf(0, 1, 2)

      arr += 3
      println(arr.joinToString())
      // 0, 1, 2, 3

      arr = arr + intArrayOf(4, 5)
      println(arr.joinToString())
      // 0, 1, 2, 3, 4, 5
  //sampleEnd
  }
  ```
  {kotlin-runnable="true"}

> 要素の追加や削除を頻繁に行う必要がある場合は、代わりに[可変コレクション](collections-overview.md#collection-types)を使用してください。
>
{style="tip"}

### 配列の比較 {id="compare-arrays"}

2つの配列が同じ要素を同じ順序で持っているかどうかを比較するには、[`.contentEquals()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/content-equals.html)
および [`.contentDeepEquals()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/content-deep-equals.html) 関数を使用します。

```kotlin
fun main() {
//sampleStart
    val simpleArray = arrayOf(1, 2, 3)
    val anotherArray = arrayOf(1, 2, 3)

    // 配列の内容を比較
    println(simpleArray.contentEquals(anotherArray))
    // true

    // 中置記法を使用して、要素が変更された後の配列の内容を比較
    simpleArray[0] = 10
    println(simpleArray contentEquals anotherArray)
    // false
//sampleEnd
}
```
{kotlin-runnable="true" id="arrays-compare-array-kotlin"}

> 配列の内容を比較するために、等価性（`==`）および不等価性（`!=`）[演算子](equality.md#structural-equality)を使用しないでください。これらの演算子は、代入された変数が同じオブジェクトを指しているかどうかをチェックします。
>
> Kotlin の配列がこのように動作する理由の詳細については、[ブログ記事](https://blog.jetbrains.com/kotlin/2015/09/feedback-request-limitations-on-data-classes/#Appendix.Comparingarrays)を参照してください。
>
{style="warning"}

### 配列の変換 {id="transform-arrays"}

Kotlin には、配列を変換するための便利な関数が多数用意されています。このセクションでは、その一部を取り上げます。完全なリストについては、[API リファレンス](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin/-array/)を参照してください。

#### 合計（Sum） {id="sum"}

配列内のすべての要素の合計を返すには、[`.sum()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/sum.html)
関数を使用します。

```kotlin
fun main() {
//sampleStart
    val sumArray = arrayOf(1, 2, 3)
    println(sumArray.sum())
    // 6
//sampleEnd
}
```
{kotlin-runnable="true" id="arrays-sum-array-kotlin"}

> `.sum()` 関数は、`Int` などの[数値データ型](numbers.md)の配列でのみ使用できます。
>
{style="note"}

#### ソートとシャッフル {id="sort-and-shuffle"}

配列内の要素を自然順序に従ってソートするには [`.sort()`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.collections/sort.html) 関数を使用し、ランダムにシャッフルするには [`.shuffle()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/shuffle.html) 関数を使用できます。

```kotlin
fun main() {
//sampleStart
    val simpleArray = arrayOf(1, 2, 3)

    // 要素をランダムにシャッフル
    simpleArray.shuffle()
    println(simpleArray.joinToString())
  
    // 要素をソート
    simpleArray.sort()
    println(simpleArray.joinToString())
    // 1, 2, 3
//sampleEnd
}
```
{kotlin-runnable="true" id="arrays-shuffle-array-kotlin"}

元の配列を変更せずに新しくソートされた配列を取得するには、代わりに
[`.sortedArray()`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.collections/sorted-array.html) 関数を使用します。

### 関数に可変長の引数を渡す {id="pass-variable-number-of-arguments-to-a-function"}

Kotlin では、[`vararg`](functions.md#variable-number-of-arguments-varargs)
パラメータを介して関数に可変長の引数を渡すことができます。これは、メッセージのフォーマットや SQL クエリの作成など、引数の数が事前にわからない場合に便利です。

可変長の引数を含む配列を関数に渡すには、*スプレッド演算子*（`*`）を使用します。スプレッド演算子は、配列の各要素を選択した関数の個々の引数として渡します。

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
{kotlin-runnable="true" id="arrays-vararg-array-kotlin"}

詳細については、[可変長の引数（varargs）](functions.md#variable-number-of-arguments-varargs)を参照してください。

## コレクションへの変換 {id="convert-to-collections"}

一部が配列を使用し、一部がコレクションを使用するような異なる API を操作する場合、配列をコレクションに、またはその逆に変換できます。これには、[`.toList()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/to-list.html)、[`.toSet()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/to-set.html)、および [`.toMap()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/to-map.html) 関数を使用します。
これらの関数は、配列の内容を独立したコピーに複製します。配列に対するその後の変更は反映されません。

### List または Set への変換 {id="convert-to-list-or-set"}

配列を `List` または `Set` に変換するには、[`.toList()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/to-list.html)
および [`.toSet()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/to-set.html) 関数を使用します。

```kotlin
fun main() {
//sampleStart
    val simpleArray = arrayOf("a", "b", "c", "c")

    // Set に変換
    println(simpleArray.toSet())
    // [a, b, c]

    // List に変換
    println(simpleArray.toList())
    // [a, b, c, c]
//sampleEnd
}
```
{kotlin-runnable="true" id="arrays-convert-list-set-kotlin"}

元の配列が変更されない、または他で共有されていないと完全に確信できる場合を除き、[`.asList()`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.collections/as-list.html) や関連する `as*` 関数は使用しないでください。これらの関数は元の配列をコピーするのではなくラップします。そのため、配列への変更がリストに反映され、その逆も同様です。

```kotlin
fun main() {
//sampleStart
    val simpleArray = arrayOf("a", "b", "c")

    val list = simpleArray.asList()
    simpleArray[0] = "d"
    println(list)
    // [d, b, c]
//sampleEnd
}
```
{kotlin-runnable="true"}

### Map への変換 {id="convert-to-map"}

配列を `Map` に変換するには、[`.toMap()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/to-map.html)
関数を使用します。

変換できるのは、[`Pair<K,V>`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin/-pair/) の配列のみです。
`Pair` インスタンスの最初の値がキーになり、2番目の値が値になります。
同じキーが複数回現れた場合、最後の値が使用されます。

この例では、[中置記法](functions.md#infix-notation)を使用して [`.to`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin/to.html) 関数を呼び出し、`Pair` のタプルを作成しています。

```kotlin
fun main() {
//sampleStart
    val pairArray = arrayOf("apple" to 120, "banana" to 150, "cherry" to 90, "apple" to 140)

    // Map に変換
    // フルーツがキー、カロリー値が値
    // 最新の "apple" の値が最初の値を上書きする
    println(pairArray.toMap())
    // {apple=140, banana=150, cherry=90}
//sampleEnd
}
```
{kotlin-runnable="true" id="arrays-convert-map-kotlin"}

## 次のステップ {id="what-s-next"}

* ほとんどのユースケースでコレクションの使用が推奨される理由の詳細については、[コレクションの概要](collections-overview.md)を参照してください。
* その他の[基本的な型](types-overview.md)について学びます。
* Java 開発者の場合は、[コレクションに関する Java から Kotlin への移行ガイド](java-to-kotlin-collections-guide.md)をご覧ください。