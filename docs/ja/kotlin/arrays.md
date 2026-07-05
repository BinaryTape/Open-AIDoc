[//]: # (title: 配列)
[//]: # (description: Kotlinでの配列の作成、アクセス、変更、比較、変換方法について学びます。)

配列は、同じ型またはそのサブタイプの値を固定数保持するデータ構造です。
配列の要素は順序付けられており、インデックスによってアクセスされます。

Kotlinは [`Array<T>`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin/-array/) クラスと [プリミティブ型配列](#primitive-type-arrays) を提供しています。

## 配列を使用する場合

Java APIとの相互運用性や低レベルの要件がある場合に配列を使用してください。例えば、一般的なアプリケーションで必要とされる以上のパフォーマンス要件がある場合や、カスタムデータ構造を構築する必要がある場合などです。

ほとんどのユースケースでは、代わりに [コレクション](collections-overview.md) を優先して使用してください。

| 機能 | 配列 | コレクション |
|-----------------------------------------------------|------------------------------------------------------------------------------------------------------------------------------------------------------|---------------------------------------------------|
| サイズ | 固定 | 型による |           
| 読み取り専用バリアント | なし（常に変更可能） | あり (`List` と `Set`) |
| 要素の追加と削除 | ネイティブのサポートなし。<br/> 新しい配列を割り当ててコピーする | あり（ミュータブルコレクション） |
| `==` による構造的な等価性 | なし（参照を比較）。<br/> 代わりに [`.contentEquals()`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.collections/content-equals.html) を使用 | あり |
| プリミティブ値 | プリミティブ型配列は値を<br/> ボックス化せずに格納 | 通常はボックス化される |
| Java相互運用性 | `T[]` にマッピングされる | `java.util.List` および<br/> `java.util.Set` にマッピングされる |
| 関数型スタイルのフィルタリングと変換 | 限定的 | 広範 |

[配列をコレクションに変換する](#コレクションへの変換)方法についてはこちらをご覧ください。

## 配列の作成

配列を作成するには、以下を使用できます：

* [`arrayOf()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin/array-of.html)、[`arrayOfNulls()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin/array-of-nulls.html#kotlin$arrayOfNulls(kotlin.Int))、または [`emptyArray()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin/empty-array.html) 関数。
* `Array` コンストラクタ。

> `val` で配列を宣言しても、変数の再代入を防ぐだけで、内容が読み取り専用になるわけではありません。
> 要素は `val` と `var` の両方の配列で変更可能です。この区別は参照にのみ影響し、内容には影響しません。
> 読み取り専用のビューが必要な場合は、代わりに [コレクション](collections-overview.md) を使用してください。
> 
{style="note"}

### 値を持つ配列

既知の値のセットから型指定された配列を作成するには、[`arrayOf()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin/array-of.html) 関数を使用します。
Kotlinは型を自動的に推論します：

```kotlin
fun main() {
//sampleStart
    val simpleArray = arrayOf(1, 2, 3) // Array<Int>
    println(simpleArray.joinToString())
    // 1, 2, 3
//sampleEnd
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3" id="arrays-simple-array-kotlin"}

### 空の配列

要素のない配列を作成するには、[`emptyArray()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin/empty-array.html) 関数を使用します。
代入の左側または右側で要素の型を指定できます：

```kotlin
val emptyArrayRight = emptyArray<String>()
val emptyArrayLeft: Array<String> = emptyArray()
```

配列に[要素を追加する方法](#要素の追加と削除)についてはこちらをご覧ください。

### nullを含む配列

指定されたサイズで `null` 要素が入力された配列を作成するには、[`arrayOfNulls()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin/array-of-nulls.html#kotlin$arrayOfNulls(kotlin.Int)) 関数を使用します：

```kotlin
fun main() {
//sampleStart
    val nullArray: Array<Int?> = arrayOfNulls(3)
    println(nullArray.joinToString())
    // null, null, null
//sampleEnd
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3" id="arrays-null-array-kotlin"}

### Arrayコンストラクタ

`Array` コンストラクタは、配列のサイズと、配列要素の値を返す関数を引数に取ります：

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
{kotlin-runnable="true" kotlin-min-compiler-version="1.3" id="arrays-array-constructor-kotlin"}

### ネストされた配列

ネストされた配列や多次元配列を作成するには、配列の配列を使用します。
ネストされた配列は、同じ型や同じサイズである必要はありません。

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

### プリミティブ型配列

プリミティブ値で `Array` クラスを使用すると、コンパイラはこれらの値をオブジェクトにボックス化します。
ボックス化のオーバーヘッドを避けるために、専用のプリミティブ型配列を使用できます。
これらは [`Array<T>`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin/-array/) クラスのサブクラスではありませんが、同様の関数とプロパティのセットを提供します。

| Kotlinの型 | Javaでの対応 |
|-----------------------------------------------------------------------------------------|-----------------|
| [`BooleanArray`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin/-boolean-array/)   | `boolean[]`     |
| [`ByteArray`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin/-byte-array/)         | `byte[]`        |
| [`CharArray`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin/-char-array/)         | `char[]`        |
| [`DoubleArray`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin/-double-array/)     | `double[]`      |
| [`FloatArray`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin/-float-array/)       | `float[]`       |
| [`IntArray`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin/-int-array/)           | `int[]`         |
| [`LongArray`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin/-long-array/)         | `long[]`        |
| [`ShortArray`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin/-short-array/)       | `short[]`       |

> Kotlinには専用の `StringArray` 型はありません。 `String` はプリミティブではないため、代わりに型推論を伴う [`arrayOf()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin/array-of.html) または `arrayOf<String>()` 関数を使用してください。
> 
{style="note"}

プリミティブ型配列を作成するには、次のいずれかのオプションを使用します：

* コンストラクタ関数：

  ```kotlin
  fun main() {
  //sampleStart
      // 値がゼロに初期化されたサイズ5のInt配列を作成します
      val primitiveTypeArray = IntArray(5)
      println(primitiveTypeArray.joinToString())
      // 0, 0, 0, 0, 0
  
      // Int配列を作成し、初期化関数を渡します
      val squares = IntArray(5) { i -> i * i }
      println(squares.joinToString())
      // 0, 1, 4, 9, 16
  //sampleEnd
  }
  ```
  {kotlin-runnable="true" kotlin-min-compiler-version="1.3" id="arrays-primitive-type-array-kotlin"}

* ファクトリ関数：

  ```kotlin
  fun main() {
  //sampleStart
      // 5つの要素を持つInt配列を作成します
      val numbers = intArrayOf(1, 2, 3, 4, 5)
      println(numbers.joinToString())
      // 1, 2, 3, 4, 5

      // 3つの要素を持つChar配列を作成します
      val characters = charArrayOf('K', 't', 'l')
      println(characters.joinToString())
      // K, t, l

      // 3つの要素を持つDouble配列を作成します
      val doubles = doubleArrayOf(0.22, 4.16, 0.5)
      println(doubles.joinToString()) 
      // 0.22, 4.16, 0.5
  //sampleEnd
  }
  ```
  {kotlin-runnable="true" kotlin-min-compiler-version="1.3"}

> プリミティブ型配列をオブジェクト型配列に変換するには、[`.toTypedArray()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/to-typed-array.html) 関数を使用します。
>
> オブジェクト型配列をプリミティブ型配列に変換するには、[`.toBooleanArray()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/to-boolean-array.html)、[`.toByteArray()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/to-byte-array.html)、[`.toCharArray()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/to-char-array.html) などを使用します。
>
{style="note"}

## 配列の操作

配列は、反復、検索、ソート、変換など、コレクションと同じ操作の多くをサポートしています。
Kotlinでは、配列を使用して関数に可変長引数を渡したり、配列自体に対して操作を実行したりできます。
最も一般的なプロパティと関数を以下の表に示します：

| メンバー | 返り値 |
|--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|---------------------------------------|
| [`size`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin/-array/size.html) | 要素数 |
| [`indices`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.collections/indices.html) | 有効なインデックスの範囲 |
| [`lastIndex`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.collections/last-index.html) | 最後の有効なインデックス |
| [`first()`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.collections/first.html) および [`last()`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.collections/last.html) | 最初と最後の要素 |
| [`isEmpty()`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.collections/is-empty.html) および [`isNotEmpty()`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.collections/is-not-empty.html) | 配列が空であるか、空でない場合に `true` |
| [`contains()`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.collections/contains.html) | 配列にその要素が含まれている場合に `true` |

> 配列のプロパティと関数の詳細については、[APIリファレンス](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin/-array/)を参照してください。
> 
{style="tip"}

このセクションでは、最も頻繁に使用される操作のいくつかを紹介します。

### 要素のアクセスと変更

配列の要素にアクセスして変更するには、[インデックスアクセス演算子](operator-overloading.md#indexed-access-operator) (`[]`) を使用します：

```kotlin
fun main() {
//sampleStart
    val simpleArray = arrayOf(1, 2, 3)
    val twoDArray = Array(2) { Array<Int>(2) { 0 } }

    // 要素にアクセスして変更します
    simpleArray[0] = 10
    twoDArray[0][0] = 2

    // 変更された要素をプリントします
    println(simpleArray[0]) 
    // 10
    println(twoDArray[0][0]) 
    // 2
//sampleEnd
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3" id="arrays-access-array-kotlin"}

> 配列の境界外のインデックスにアクセスしようとすると、Kotlinは実行時に `ArrayIndexOutOfBoundsException` をスローします。
>
{style="note"} 

[`fill(element, fromIndex, toIndex)`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.collections/fill.html) 関数を使用して、特定の範囲内の要素をその場で置き換えることもできます。 `fromIndex` は含まれ、 `toIndex` は含まれません：

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
{kotlin-runnable="true" kotlin-min-compiler-version="1.3"}

Kotlinにおいて、配列は *非変 (invariant)* です。これは、`Array<String>` が `Array<Any>` のサブタイプではないことを意味します。これにより、実行時の型障害の可能性が防がれます。共変性を表現するには、`Array<out Any>` [型投影 (type projection)](generics.md#type-projections) を使用します：

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
{kotlin-runnable="true" kotlin-min-compiler-version="1.3"}

### 要素の追加と削除

配列はサイズが固定されているため、`.add()` および `.remove()` 関数をサポートしていません。これらの操作を実行するには、新しい配列を作成する必要があります。そのために、次のいずれかのオプションを使用できます：

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
  {kotlin-runnable="true" kotlin-min-compiler-version="1.3"}

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
  {kotlin-runnable="true" kotlin-min-compiler-version="1.3"}

> 要素を頻繁に追加または削除する必要がある場合は、代わりに [ミュータブルコレクション](collections-overview.md#collection-types) を使用してください。
>
{style="tip"}

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

> 配列の内容を比較するために、等価 (`==`) および不等 (`!=`) [演算子](equality.md#structural-equality) を使用しないでください。これらの演算子は、割り当てられた変数が同じオブジェクトを指しているかどうかをチェックします。
>
> Kotlinの配列がこのように動作する理由の詳細については、こちらの [ブログ記事](https://blog.jetbrains.com/kotlin/2015/09/feedback-request-limitations-on-data-classes/#Appendix.Comparingarrays) を参照してください。
>
{style="warning"}

### 配列の変換

Kotlinには配列を変換するための便利な関数が数多くあります。このセクションではその一部を紹介します。
完全なリストについては、[APIリファレンス](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin/-array/)を参照してください。

#### 合計 (Sum)

配列内のすべての要素の合計を返すには、[`.sum()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/sum.html) 関数を使用します：

```kotlin
fun main() {
//sampleStart
    val sumArray = arrayOf(1, 2, 3)
    println(sumArray.sum())
    // 6
//sampleEnd
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3" id="arrays-sum-array-kotlin"}

> `.sum()` 関数は、`Int` などの [数値データ型](numbers.md) の配列にのみ使用できます。
>
{style="note"}

#### ソートとシャッフル

[`.sort()`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.collections/sort.html) 関数を使用して配列内の要素を自然な順序でソートしたり、[`.shuffle()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/shuffle.html) 関数を使用してランダムにシャッフルしたりできます。

```kotlin
fun main() {
//sampleStart
    val simpleArray = arrayOf(1, 2, 3)

    // 要素をランダムにシャッフルします
    simpleArray.shuffle()
    println(simpleArray.joinToString())
  
    // 要素をソートします
    simpleArray.sort()
    println(simpleArray.joinToString())
    // 1, 2, 3
//sampleEnd
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3" id="arrays-shuffle-array-kotlin"}

元の配列を変更せずに新しいソート済み配列を取得するには、代わりに [`.sortedArray()`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.collections/sorted-array.html) 関数を使用します。

### 関数への可変長引数の受け渡し

Kotlinでは、[`vararg`](functions.md#variable-number-of-arguments-varargs) パラメータを介して関数に可変長引数を渡すことができます。これは、メッセージのフォーマットやSQLクエリの作成時のように、引数の数が事前にわからない場合に便利です。

可変長引数を含む配列を関数に渡すには、*スプレッド演算子* (`*`) を使用します。スプレッド演算子は、配列の各要素を個別の引数として、選択した関数に渡します：

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

## コレクションへの変換

配列を使用するものとコレクションを使用するものが混在する異なる API を使用する場合、配列をコレクションに、またはその逆に変換できます。そのために、[`.toList()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/to-list.html)、[`.toSet()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/to-set.html)、および [`.toMap()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/to-map.html) 関数を使用します。
これらの関数は、配列の内容を独立したコピーにコピーします。これらは配列へのその後の変更を反映しません。

### List または Set への変換

配列を `List` または `Set` に変換するには、[`.toList()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/to-list.html) および [`.toSet()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/to-set.html) 関数を使用します：

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

元の配列が変更されたり他で共有されたりしないことが完全に確実でない限り、[`.asList()`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.collections/as-list.html) および関連する `as*` 関数を使用しないでください。これらの関数は、配列をコピーするのではなくラップします。したがって、配列への変更はリストに反映され、その逆も同様です。

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
{kotlin-runnable="true" kotlin-min-compiler-version="1.3"}

### Map への変換

配列を `Map` に変換するには、[`.toMap()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/to-map.html) 関数を使用します。

[`Pair<K,V>`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin/-pair/) の配列のみを `Map` に変換できます。
`Pair` インスタンスの最初の値がキーになり、2番目の値が値になります。
同じキーが複数回出現する場合、最後の値が使用されます。

この例では、[中置表記法 (infix notation)](functions.md#infix-notation) を使用して [`.to`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin/to.html) 関数を呼び出し、`Pair` のタプルを作成しています：

```kotlin
fun main() {
//sampleStart
    val pairArray = arrayOf("apple" to 120, "banana" to 150, "cherry" to 90, "apple" to 140)

    // Map に変換します
    // フルーツがキー、カロリー数が値です
    // 最新の "apple" の値が最初の値を上書きします
    println(pairArray.toMap())
    // {apple=140, banana=150, cherry=90}
//sampleEnd
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3" id="arrays-convert-map-kotlin"}

## 次のステップ

* ほとんどのユースケースでコレクションの使用を推奨する理由の詳細については、[コレクションの概要](collections-overview.md) をお読みください。
* 他の [基本型](types-overview.md) について学びます。
* Java開発者の方は、[コレクションに関するJavaからKotlinへの移行ガイド](java-to-kotlin-collections-guide.md) をお読みください。