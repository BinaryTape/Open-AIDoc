[//]: # (title: 数値)
<web-summary>数値型、リテラル、型変換、算術演算、オーバーフロー、JVM固有の動作など、Kotlinで数値を扱う方法を学びます。</web-summary>

Kotlinの数値型は以下を表します：
* 整数値（[Byte](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin/-byte/)、
  [Short](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin/-short/)、
  [Int](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin/-int/)、
  および [Long](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin/-long/)）
* 浮動小数点数値（[Float](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin/-float/)
  および [Double](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin/-double/)）

数値型は、算術演算、カウンター、測定値、その他の計算など、数値データの保存や処理に使用します。

## 数値型の選択 {id="choose-a-number-type"}

ほとんどの場合、タスクに適した数値型を決定するために以下のルールを参考にできます：

* 整数には `Int` を使用します。
* `Int` の範囲外の整数には `Long` を使用します。
* 小数には `Double` を使用します。
* 低い精度で十分な場合や、低い精度が求められる場合には `Float` を使用します。
* APIやデータ形式で要求されている場合には `Byte` や `Short` を使用します。

> Kotlinはベータ機能として[](unsigned-integer-types.md)も提供しています。
>
{style="tip"}

## 整数型 {id="integer-types"}

Kotlinは、サイズと値の範囲が異なる4つの整数型を提供しています：

| 型        | サイズ (ビット) | 最小値                                        | 最大値                                         |
|----------|-------------|----------------------------------------------|------------------------------------------------|
| `Byte`   | 8           | -128                                         | 127                                            |
| `Short`  | 16          | -32768                                       | 32767                                          |
| `Int`    | 32          | -2,147,483,648 (-2<sup>31</sup>)             | 2,147,483,647 (2<sup>31</sup> - 1)             |
| `Long`   | 64          | -9,223,372,036,854,775,808 (-2<sup>63</sup>) | 9,223,372,036,854,775,807 (2<sup>63</sup> - 1) |

### 整数値の宣言 {id="declare-integer-values"}

Kotlinは、整数値に対して以下のリテラル形式をサポートしています：

* 10進数：`123`
* 16進数：`0x0F`
* 2進数：`0b00001011`

> Kotlinは8進数リテラルをサポートしていません。
>
{style="note"}

数値を宣言するには、型を明示的に指定します：

```kotlin
val one: Int = 1

// 可読性を向上させるためにアンダースコアを使用できます
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

数値型を明示的に宣言すると、コンパイラはその値がその型の範囲内に収まっているかをチェックします：

```kotlin
// 値はByteに収まります
val oneByte: Byte = 1

// エラー：値がByteに収まりません
val tooBig: Byte = 128
```

数値型を指定しない場合、値が `Int` の範囲に収まるのであればKotlinは `Int` と推論します。それ以外の場合は `Long` と推論します：

```kotlin
val million = 1_000_000 // Int
val threeBillion = 3_000_000_000 // Long
```

値が存在しない可能性がある場合は、null許容型（nullable types）を使用します：

```kotlin
val maybeAbsent: Int? = null
```

## 浮動小数点型 {id="floating-point-types"}

小数部を持つ数値のために、Kotlinは `Float` と `Double` を提供しています。

浮動小数点型は[IEEE 754標準](https://en.wikipedia.org/wiki/IEEE_754)に準拠しています。
`Float` は*単精度*（single precision）を、`Double` は*倍精度*（double precision）を表します。

浮動小数点型はサイズと精度が異なります：

| 型        | サイズ (ビット) | 有効桁ビット数 | 指数ビット数 | 10進桁数 |
|----------|-------------|------------------|---------------|----------------|
| `Float`  | 32          | 24               | 8             | 6-7            |
| `Double` | 64          | 53               | 11            | 15-16          |    

### 浮動小数点値の宣言 {id="declare-floating-point-values"}

浮動小数点リテラルを宣言するには、小数点（`.`）を含めるか、指数表記を使用します：

```kotlin
val pi = 3.14
val avogadro = 6.02214076e23
```

デフォルトでは、Kotlinは浮動小数点リテラルを `Double` と推論します。
`Float` を宣言するには、`f` または `F` サフィックスを追加します：

```kotlin
val pi = 3.14 // Double
val eFloat = 2.7182817f // Float
```

> Kotlinは、`Float` が保持できる以上の精度を含む `Float` リテラルを丸めます。
>
{style="note"}

値が存在しない可能性がある場合は、null許容型を使用します：

```kotlin
val maybeAbsent: Double? = null
```

## 算術演算 {id="arithmetic-operations"}

Kotlinは数値に対する標準的な算術演算をサポートしています：`+`、`-`、`*`、`/`、`%`。

これらの演算子を使用して一般的な計算を行います：

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

結果の型はオペランドの型によって異なります。詳細は[](#mixed-numeric-expressions)を参照してください。

> カスタム数値クラスでこれらの演算子をオーバーライドすることができます。
> 詳細については、[演算子オーバーロード](operator-overloading.md)を参照してください。
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

浮動小数点の演算結果を得るには、少なくとも一方のオペランドを `Float` または `Double` にします：

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

数値型同士は互いのサブタイプではありません。予期しない動作や暗黙的なデータの損失を防ぐため、Kotlinでは明示的な変換が必要です。

例えば、`Double` を想定している関数は、変換を行わない限り `Int` や `Float` の値を受け取ることはできません：

```kotlin
fun main() {
//sampleStart
    fun printDouble(x: Double) { 
        print(x) 
    }

    val x = 1.0
    val xInt = 1
    val xFloat = 1.0f
    val one: Double = 1 // エラー：イニシャライザの型不一致

    printDouble(x) // OK
    printDouble(xInt) // エラー：引数の型不一致
    printDouble(xFloat) // エラー：引数の型不一致
//sampleEnd
}
```
{kotlin-runnable="true" validate="false"}

すべての数値型は、他の数値型への変換をサポートしています。
数値を別の型に変換するには、明示的な変換関数を使用します：

* `toByte()`
* `toShort()`
* `toInt()`
* `toLong()`
* `toFloat()`
* `toDouble()`

例えば、次のコードは `Int` 値を `Double` に変換します：

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

### 混在した数値の式 {id="mixed-numeric-expressions"}

Kotlinは代入や関数の引数における暗黙的な型変換をサポートしていません。
しかし、算術式の中では異なる数値型を混在させることができます。そのような場合、Kotlinはオペランドの型に基づいて結果の型を決定し、算術演算子が自動的に型変換を処理します：

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
// エラー：イニシャライザの型不一致
```

### 整数リテラル型 {id="integer-literal-types"}

型推論の際、Kotlinはサフィックスのない整数リテラルを、周囲のコンテキストによって具体的な型が決定されるまで、特殊な[整数リテラル型 (Integer Literal Type: ILT)](https://kotlinlang.org/spec/type-system.html#integer-literal-types)として扱います：

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

`Int` と `Long` の値は実行時の文字列表現が同じであるため、特に見落としやすくなります。これを防ぐには、期待される型を明示的に指定するか、値を明示的に変換します：

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

意図しない型推論を検出するために、明示的な型指定を使用することもできます：

```kotlin
fun main() {
//sampleStart
    val intValues: List<Int> = listOf(1, 2L)
    // エラー：イニシャライザの型不一致
//sampleEnd
}
```
{kotlin-runnable="true" validate="false"}

> 詳細については、[整数リテラル型](https://kotlinlang.org/spec/type-system.html#integer-literal-types)を参照してください。
> 
{style="tip"}

## データオーバーフロー {id="data-overflow"}

数値型は、定義された範囲内の値しか表現できません。

演算結果がその範囲外になると、オーバーフローが発生します。
値をより小さな数値型に変換する場合、変換後の値では元の数値が保持されないことがあります。

この動作は、コンパイラがコードを受理した場合でも、コードの実行結果に影響を与える可能性があります。

### 演算におけるオーバーフロー {id="overflow-in-operations"}

各整数型は、定義された範囲内の値のみを保存できます。算術演算の結果がその範囲を超えると、*データオーバーフロー*が発生します：

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

> 整数のオーバーフローが発生しても、コンパイラは自動的にエラーを出すことはありません。
>
{style="note"}

### 符号反転におけるオーバーフロー {id="overflow-in-negation"}

オーバーフローは符号反転の際にも発生することがあります。
例えば、`Int.MIN_VALUE` の正の対応する値は `Int` として表現できません。

```kotlin
fun main(){
//sampleStart
    val min = Int.MIN_VALUE
    println(-min) // -2147483648
//sampleEnd    
}
```
{kotlin-runnable="true"}

### 縮造型変換 {id="narrowing-conversions"}

値をより小さな整数型に変換すると、結果において元の数値が保持されない場合があります：

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

ただし、浮動小数点型は[IEEE 754標準](https://en.wikipedia.org/wiki/IEEE_754)に準拠しているため、非常に大きな結果は `Infinity` になることがあります：

```kotlin
fun main() {
//sampleStart
    println(Double.MAX_VALUE * 2) // Infinity
//sampleEnd    
}
```
{kotlin-runnable="true"}

## ビット演算 {id="bitwise-operations"}

Kotlinは、`Int` と `Long` に対する*ビット演算*（bitwise operations）を提供しています。これらの演算は一連の[中置関数](functions.md#infix-notation)および `inv()` で表されます。

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
* `and()` – ビット積 (AND)
* `or()` – ビット和 (OR)
* `xor()` – 排他的論理和 (XOR)
* `inv()` – ビット反転

## 浮動小数点数の比較 {id="floating-point-number-comparison"}

Kotlinにおける浮動小数点数の比較は、オペランドの静的な型に依存します。

オペランドが静的に `Float` または `Double` であると判明している場合、数値に対する演算とその数値が形成する範囲は、[IEEE 754 浮動小数点演算標準](https://en.wikipedia.org/wiki/IEEE_754)に従います。

ただし、ジェネリクスを使用するケース（`Any`、`Comparable<...>`、`Collection<T>` など）において、オペランドが静的に浮動小数点型として型付けされていない場合は挙動が異なります。これらの場合、Kotlinは `Float` および `Double` の `equals()` と `compareTo()` の実装を使用します。

その結果：

* `NaN` はそれ自身と等しいとみなされます
* `NaN` は `POSITIVE_INFINITY` を含む他のどの要素よりも大きいとみなされます
* `-0.0` は `0.0` より小さいとみなされます

以下の例は、静的に浮動小数点型として型付けされたオペランドと、ジェネリック型を介して使用されたオペランドの違いを示しています：

```kotlin
//sampleStart  
fun generalizedEquals(a: Any, b: Any): Boolean {
    return a == b
}

fun main() {
    // 静的に浮動小数点型として型付けされたオペランド
    println(Double.NaN == Double.NaN) // false
    println(0.0 == -0.0) // true

    // 浮動小数点以外の静的型を介して使用されたオペランド
    println(generalizedEquals(Double.NaN, Double.NaN)) // true
    println(generalizedEquals(0.0, -0.0)) // false
}
//sampleEnd  
```
{kotlin-runnable="true" id="kotlin-numbers-floating-comp"}

## JVM上での数値のボックス化とキャッシング {id="boxing-and-caching-numbers-on-the-jvm"}

JVM上では、非nullの数値は通常、`int`、`long`、`double` などのプリミティブ型を使用して保存されます。
しかし、[ジェネリック型](generics.md)や `Int?` のようなnull許容の数値型を使用する場合、値はボックス化され、オブジェクトとして表現されます。

JVMは、ボックス化された表現をキャッシュすることにより、小さな数値に対して[メモリ最適化手法](https://docs.oracle.com/javase/specs/jls/se22/html/jls-5.html#jls-5.1.7)を適用します。その結果、同じ値を持つボックス化された数値は[参照等価](equality.md#referential-equality)になることがあります。

例えば、JVMは `-128` から `127` の範囲のボックス化された `Integer` 値をキャッシュします。そのため、以下のコードは `true` を返します：

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

キャッシュされる範囲外の値の場合、ボックス化された値は別々のオブジェクトになります。その場合、それらの値が[構造等価](equality.md#structural-equality)であっても、参照等価にはなりません。そのため、数値の比較には `==` を使用してください：

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