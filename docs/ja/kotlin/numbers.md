[//]: # (title: 数値)
[//]: # (description: Kotlin での数値の扱い方（数値型、リテラル、型変換、算術演算、オーバーフロー、JVM 固有の動作など）について学びます。)

Kotlin の数値型は以下を表します：
* 整数値 ([Byte](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin/-byte/)、
  [Short](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin/-short/)、
  [Int](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin/-int/)、
  および [Long](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin/-long/))
* 浮動小数点数値 ([Float](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin/-float/)
  および [Double](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin/-double/))

数値型は、算術演算、カウンター、測定値、その他の計算など、数値データの保存や処理に使用します。

## 数値型の選択 {id="choose-a-number-type"}

ほとんどの場合、タスクに適した数値型を決定するために次のルールを参考にできます：

* 整数には `Int` を使用します。
* `Int` の範囲外の整数には `Long` を使用します。
* 小数には `Double` を使用します。
* より低い精度で十分な場合や、それが必要な場合は `Float` を使用します。
* API やデータフォーマットで要求される場合は `Byte` および `Short` を使用します。

> Kotlin はベータ機能として[](unsigned-integer-types.md)も提供しています。
>
{style="tip"}

## 整数型 {id="integer-types"}

Kotlin は、サイズと値の範囲が異なる 4 つの整数型を提供しています：

| 型        | サイズ（ビット） | 最小値                                       | 最大値                                         |
|----------|-------------|----------------------------------------------|------------------------------------------------|
| `Byte`   | 8           | -128                                         | 127                                            |
| `Short`  | 16          | -32768                                       | 32767                                          |
| `Int`    | 32          | -2,147,483,648 (-2<sup>31</sup>)             | 2,147,483,647 (2<sup>31</sup> - 1)             |
| `Long`   | 64          | -9,223,372,036,854,775,808 (-2<sup>63</sup>) | 9,223,372,036,854,775,807 (2<sup>63</sup> - 1) |

### 整数値の宣言 {id="declare-integer-values"}

Kotlin は、整数値に対して次のリテラル形式をサポートしています：

* 10進数: `123`
* 16進数: `0x0F`
* 2進数: `0b00001011`

> Kotlin は8進数リテラルをサポートしていません。
>
{style="note"}

数値を宣言するには、型を明示的に指定します：

```kotlin
val one: Int = 1

// 可読性を高めるためにアンダースコアを使用できます
val oneBillion: Long = 1_000_000_000
val hexBytes: Int = 0x7F_EC_DE_5E
val bytes: Int = 0b01010010_01101001_10010100_10010010

val oneByte: Byte = 1
val oneShort: Short = 1
```

また、`L` サフィックスを付加して `Long` 値を宣言することもできます：

```kotlin
val oneLong = 1L
```

数値型を明示的に宣言すると、コンパイラはその値がその型の範囲に収まっているかをチェックします：

```kotlin
// 値が Byte の範囲に収まる
val oneByte: Byte = 1

// エラー: 値が Byte の範囲に収まらない
val tooBig: Byte = 128
```

数値型を指定しない場合、Kotlin は値が `Int` の範囲に収まるのであれば `Int` と推論します。それ以外の場合は `Long` と推論します：

```kotlin
val million = 1_000_000 // Int
val threeBillion = 3_000_000_000 // Long
```

値が存在しない可能性がある場合は、Nullable 型（null 許容型）を使用します：

```kotlin
val maybeAbsent: Int? = null
```

## 浮動小数点型 {id="floating-point-types"}

小数部を持つ数値のために、Kotlin は `Float` と `Double` を提供しています。

浮動小数点型は [IEEE 754 標準](https://en.wikipedia.org/wiki/IEEE_754) に準拠しています。`Float` は_単精度_を、`Double` は_倍精度_を表します。

浮動小数点型はサイズと精度が異なります：

| 型        | サイズ（ビット） | 有効数字ビット | 指数部ビット | 10進桁数 |
|----------|-------------|------------------|---------------|----------------|
| `Float`  | 32          | 24               | 8             | 6-7            |
| `Double` | 64          | 53               | 11            | 15-16          |    

### 浮動小数点値の宣言 {id="declare-floating-point-values"}

浮動小数点リテラルを宣言するには、小数点（`.`）を含めるか、指数表記を使用します：

```kotlin
val pi = 3.14
val avogadro = 6.02214076e23
```

デフォルトでは、Kotlin は浮動小数点リテラルを `Double` として推論します。`Float` を宣言するには、`f` または `F` サフィックスを追加します：

```kotlin
val pi = 3.14 // Double
val eFloat = 2.7182817f // Float
```

> Kotlin は、`Float` で格納可能な精度を超える `Float` リテラルを丸めます。
>
{style="note"}

値が存在しない可能性がある場合は、Nullable 型を使用します：

```kotlin
val maybeAbsent: Double? = null
```

## 算術演算 {id="arithmetic-operations"}

Kotlin は数値に対する標準的な算術演算をサポートしています：`+`、`-`、`*`、`/`、`%`。

これらの演算子を使用して一般的な計算を実行します：

```kotlin
fun main() {
//sampleStart
    println(1 + 2) // 3
    println(2_500_000_000L - 1L) // 2499999999
    println(3.14 * 2.71) // 8.5094
    println(10.0 / 3) // 3.3333333333333335
//sampleEnd
}
```
{kotlin-runnable="true"}

演算結果の型はオペランドの型に依存します。詳細は[](#mixed-numeric-expressions)を参照してください。

> これらの演算子はカスタムの数値クラスでオーバーライドできます。
> 詳細については、[演算子のオーバーロード](operator-overloading.md)を参照してください。
>
{style="tip"}

### 整数の除算 {id="integer-division"}

整数値同士の除算は常に整数の結果を返します。コンパイラは小数部を切り捨てます：

```kotlin
fun main() {
//sampleStart
    val intValue = 5 / 2
    println(intValue) // 2
    
    val longValue = 5L / 2
    println(longValue) // 2
//sampleEnd
}
```
{kotlin-runnable="true"}

浮動小数点の結果を返すには、少なくとも一方のオペランドを `Float` または `Double` にします：

```kotlin
fun main() {
//sampleStart
    val a = 5 / 2.0
    println(a) // 2.5
    
    val b = 5 / 2.toDouble()
    println(b) // 2.5
//sampleEnd
}
```
{kotlin-runnable="true"}

## 型変換 {id="type-conversion"}

数値型同士は互いのサブタイプではありません。Kotlin では、暗黙的なデータ損失や予期しない動作を防ぐために明示的な変換が必要です。

たとえば、`Double` を期待する関数は、型変換なしに `Int` や `Float` の値を受け取ることはできません：

```kotlin
fun main() {
//sampleStart
    fun printDouble(x: Double) { 
        print(x) 
    }

    val x = 1.0
    val xInt = 1
    val xFloat = 1.0f
    val one: Double = 1 // エラー: 初期化子の型が一致しません

    printDouble(x) // OK
    printDouble(xInt) // エラー: 引数の型が一致しません
    printDouble(xFloat) // エラー: 引数の型が一致しません
//sampleEnd
}
```
{kotlin-runnable="true" validate="false"}

すべての数値型は他の数値型への変換をサポートしています。数値を別の型に変換するには、明示的な変換関数を使用します：

* `toByte()`
* `toShort()`
* `toInt()`
* `toLong()`
* `toFloat()`
* `toDouble()`

たとえば、次のコードは `Int` 値を `Double` に変換します：

```kotlin
fun main() {
//sampleStart
    val intValue: Int = 1
    val doubleValue = intValue.toDouble()
    
    println(doubleValue) // 1.0
//sampleEnd
}
```
{kotlin-runnable="true"}

浮動小数点値を整数型に変換すると、コンパイラは小数部を切り捨てます：

```kotlin
fun main() {
//sampleStart
    val d: Double = 1.5
    val l: Long = d.toLong()
    
    println(l) // 1
//sampleEnd    
}
```
{kotlin-runnable="true"}

### 数値の混合式 {id="mixed-numeric-expressions"}

Kotlin は、代入や関数の引数における暗黙的な型変換をサポートしていません。
しかし、算術式の中では異なる数値型を混在させることができます。そのような場合、Kotlin はオペランドの型に基づいて結果の型を決定し、算術演算子が自動的に型変換を処理します：

```kotlin
val intNumber: Int = 1
val longNumber: Long = 1000
val result = intNumber + longNumber // 1001, Long
```

結果をより小さい型に代入しようとすると、コンパイラはエラーを報告します：

```kotlin
val intNumber: Int = 1
val longNumber: Long = 1000
val result: Int = intNumber + longNumber 
// エラー: 初期化子の型が一致しません
```

### 整数リテラル型 {id="integer-literal-types"}

型推論中、Kotlin は周囲のコンテキストによって具体的な型が決定されるまで、サフィックスのない整数リテラルを特別な [整数リテラル型 (ILT: Integer Literal Type)](https://kotlinlang.org/spec/type-system.html#integer-literal-types) として扱います：

```kotlin
//sampleStart
fun List<Any>.log() {
    println(joinToString(" | ") { it::class.simpleName ?: "Unknown" })
}

fun main() {
    listOf(1, 2).log()
    // Int | Int
    
    listOf(1L, 2L).log()
    // Long | Long
    
    // コンパイラは 1 を ILT として解釈し、Long に解決します
    listOf(1, 2L).log()
    // Long | Long
    
    // .toInt() はリテラルを Int に変換します
    listOf(1.toInt(), 2L).log()
    // Int | Long
}
//sampleEnd
```
{kotlin-runnable="true"}

実行時には同じ文字列表現を持つため、特に `Int` と `Long` の値では見落としが生じやすくなります。これを防ぐには、期待される型を指定するか、値を明示的に変換します：

```kotlin
//sampleStart
fun List<Any>.log() {
    println(joinToString(" | ") { it::class.simpleName ?: "Unknown" })
}

fun main() {
    val longValues: List<Long> = listOf(1, 2L)
    longValues.log()
    // Long | Long

    val numberValues: List<Number> = listOf(1.toInt(), 2L)
    numberValues.log()
    // Int | Long
}
//sampleEnd
```
{kotlin-runnable="true"}

意図しない型推論を検出するために、明示的な型を使用することもできます：

```kotlin
fun main() {
//sampleStart
    val intValues: List<Int> = listOf(1, 2L)
    // エラー: 初期化子の型が一致しません
//sampleEnd
}
```
{kotlin-runnable="true" validate="false"}

> [整数リテラル型](https://kotlinlang.org/spec/type-system.html#integer-literal-types) についての詳細を参照してください。
> 
{style="tip"}

## データのオーバーフロー {id="data-overflow"}

数値型は、定義された範囲内の値のみを表現できます。

演算結果がその範囲外になった場合、オーバーフローが発生します。値をより小さい数値型に変換した場合、変換後の値が元の数値を保持できないことがあります。

この動作は、コンパイラがエラーを出さずにコードを受け付けた場合でも、コードの実行結果に影響を与える可能性があります。

### 演算におけるオーバーフロー {id="overflow-in-operations"}

各整数型は、定義された範囲内の値のみを格納できます。算術演算の結果がその範囲を超えると、_データオーバーフロー_ が発生します：

```kotlin
fun main(){
//sampleStart
    val intNumber: Int = 2147483647
    // Int の最大値は 2147483647
    println(intNumber + 1) // -2147483648
//sampleEnd    
}
```
{kotlin-runnable="true"}

ここでは、値が `Int` に収まらなくなったため、結果がラップアラウンド（循環）しています。

> コンパイラは、整数のオーバーフローが発生しても自動的にエラーを出しません。
>
{style="note"}

### 符号反転におけるオーバーフロー {id="overflow-in-negation"}

オーバーフローは符号反転（negation）の際にも発生する可能性があります。
たとえば、`Int.MIN_VALUE` の正の対応値を `Int` として表現することはできません。

```kotlin
fun main(){
//sampleStart
    val min = Int.MIN_VALUE
    println(-min) // -2147483648
//sampleEnd    
}
```
{kotlin-runnable="true"}

### 縮小変換 {id="narrowing-conversions"}

値をより小さい整数型に変換すると、元の数値が保持されないことがあります：

```kotlin
fun main() {
//sampleStart
    val large: Int = 130
    val narrowed: Byte = large.toByte()

    println(narrowed) // -126
//sampleEnd
}
```
{kotlin-runnable="true"}

ただし、浮動小数点型は [IEEE 754 標準](https://en.wikipedia.org/wiki/IEEE_754) に準拠しているため、非常に大きな結果は `Infinity` になる可能性があります：

```kotlin
fun main() {
//sampleStart
    println(Double.MAX_VALUE * 2) // Infinity
//sampleEnd    
}
```
{kotlin-runnable="true"}

## ビット演算 {id="bitwise-operations"}

Kotlin は `Int` および `Long` に対して_ビット演算_を提供しています。これらの演算は、一連の[中置関数 (infix function)](functions.md#infix-notation)および `inv()` によって表されます。

```kotlin
fun main() {
//sampleStart
    val x = 1
    
    println(x shl 2) // 4
    println(x and 0x000FF000) // 0
//sampleEnd
}
```
{kotlin-runnable="true"}

ビット演算には以下が含まれます：

* `shl()` – 符号付き左シフト
* `shr()` – 符号付き右シフト
* `ushr()` – 符号なし右シフト
* `and()` – ビット論理積 (AND)
* `or()` – ビット論理和 (OR)
* `xor()` – ビット排他的論理和 (XOR)
* `inv()` – ビット反転

## 浮動小数点数の比較 {id="floating-point-number-comparison"}

Kotlin では、浮動小数点数の比較はオペランドの静的型（static type）に依存します。

オペランドが静的に `Float` または `Double` であることが分かっている場合、数値に対する演算とその数値が形成する範囲は、[浮動小数点演算に関する IEEE 754 標準](https://en.wikipedia.org/wiki/IEEE_754) に準拠します。

しかし、ジェネリックなユースケース（`Any`、`Comparable<...>`、`Collection<T>` など）では、静的に浮動小数点型として型付けされていないオペランドに対して動作が異なります。これらの場合、Kotlin は `Float` および `Double` の `equals()` と `compareTo()` の実装を使用します。

その結果：

* `NaN` は自分自身と等しいとみなされます
* `NaN` は `POSITIVE_INFINITY` を含む他の任意の要素よりも大きいとみなされます
* `-0.0` は `0.0` より小さいとみなされます

次の例は、静的に浮動小数点型として型付けされたオペランドと、ジェネリック型を通して使用されるオペランドの違いを示しています：

```kotlin
//sampleStart  
fun generalizedEquals(a: Any, b: Any): Boolean {
    return a == b
}

fun main() {
    // 静的に浮動小数点型として型付けされたオペランド
    println(Double.NaN == Double.NaN) // false
    println(0.0 == -0.0) // true

    // 非浮動小数点の静的型を通して使用されるオペランド
    println(generalizedEquals(Double.NaN, Double.NaN)) // true
    println(generalizedEquals(0.0, -0.0)) // false
}
//sampleEnd  
```
{kotlin-runnable="true" id="kotlin-numbers-floating-comp"}

## JVM 上での数値のボクシングとキャッシュ {id="boxing-and-caching-numbers-on-the-jvm"}

JVM 上では、null 非許容の数値は通常、`int`、`long`、`double` などのプリミティブ型を使用して格納されます。しかし、[ジェネリクス](generics.md)や `Int?` などの Nullable な数値型を使用すると、値はボクシングされ、オブジェクトとして表現されます。

JVM は、ボクシングされた表現をキャッシュすることにより、小さな数値に対して[メモリ最適化手法](https://docs.oracle.com/javase/specs/jls/se22/html/jls-5.html#jls-5.1.7)を適用します。その結果、同じ値を持つボクシングされた数値が[参照等価 (referentially equal)](equality.md#referential-equality)になることがあります。

たとえば、JVM は `-128` から `127` の範囲のボクシングされた `Integer` 値をキャッシュします。そのため、次のコードは `true` を返します：

```kotlin
fun main() {
//sampleStart
    val score: Int = 100
    val savedScore: Int? = score
    val displayedScore: Int? = score
    
    println(savedScore === displayedScore) // true
//sampleEnd
}
```
{kotlin-runnable="true" validate="false"}

キャッシュされる範囲外の値の場合、ボクシングされた値は別々のオブジェクトになります。その場合、値が[構造等価 (structurally equal)](equality.md#structural-equality)であっても、参照等価にはなりません。このため、数値の比較には `==` を使用してください：

```kotlin
fun main() {
//sampleStart
    val score: Int = 10000
    val savedScore: Int? = score
    val displayedScore: Int? = score

    println(savedScore === displayedScore) // false
    println(savedScore == displayedScore) // true
//sampleEnd
}
```
{kotlin-runnable="true" validate="false"}