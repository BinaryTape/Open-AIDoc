[//]: # (title: 文字)
[//]: # (description: 構文、Unicodeサポート、エスケープシーケンス、文字に対する一般的な操作など、KotlinにおけるChar型の使い方を学びます。)

[`Char`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin/-char/) 型は、単一の文字をUTF-16コードユニットとして表します。

文字、数字、句読点、空白などの個別の文字の値には `Char` を使用します。一連の文字の並びには [`String`](strings.md) を使用します。

> `Char` は数値型ではありませんが、各文字にはアクセス可能なUnicodeの数値が存在します。
> [](#character-conversion) を参照してください。
> 
{style="tip"}

## 構文 {id="syntax"}

文字を宣言するには、値をシングルクォート（`' '`）で囲みます。`Char` 型を明示的に指定することも、値からKotlinに推論させることもできます：

```kotlin
val letter: Char = 'a'

// 値がシングルクォートで書かれているため、KotlinはCharと推論します
val digit = '1'
val symbol = '!'
val space = ' '
val separator = ':'
```

文字リテラルには、正確に1文字だけを含める必要があります。そうでない場合、Kotlinコンパイラはエラーを報告します：

```kotlin
val invalid = 'AB' // エラー
val invalidEmpty = '' // エラー
```
{validate="false"}

### Null許容値 {id="nullable-values"}

null許容値を格納するには、`Char?` を使用します：

```kotlin
val maybeAbsent: Char? = null
```

> JVM上では、null許容の `Char` 値は必要に応じてボックス化されます。これは
> [数値型](numbers.md#boxing-and-caching-numbers-on-the-jvm)にも同様に適用されます。
>
{style="note"}

## Unicodeのサポート {id="unicode-support"}

Kotlinは `Char` 値をUTF-16コードユニットとして表現します。これは、単一の `Char` が1つのUTF-16コードユニットを格納するのであって、必ずしも1つの完全なUnicode文字を表すわけではないことを意味します。

### 基本多言語面 {id="basic-multilingual-plane"}

単一の `Char` は、`\u0000` から `\uFFFF` の範囲の値を格納できます。
この範囲は、ほぼすべての現代言語の文字と多数の記号を含む基本多言語面（BMP: Basic Multilingual Plane）をカバーしています。

Unicode値で文字を指定するには、`\u` の後に [Unicodeテーブル](https://www.unicode.org/charts/) の4桁の16進数値を続けます：

```kotlin
val unicodeNumber = '\u0031' // '1' と同等
```

### 補助文字 {id="supplementary-characters"}

絵文字や一部の歴史的な文字など、BMPの範囲外にあるUnicode文字は、単一の `Char` では表現できません。UTF-16ではこれらは_サロゲートペア_としてエンコードされ、`String` 内で2つの `Char` 値が組み合わさって1つのUnicode文字を表します：

```kotlin
fun main() {
//sampleStart
    val emoji = "🥦"
    
    println(emoji.length) // 2
    println(emoji[0])     // 1つ目のサロゲート
    println(emoji[1])     // 2つ目のサロゲート
//sampleEnd
}
```

> 32ビットの記号を個別に扱うには、`Int` 値として格納されたUnicodeコードポイントを使用してください。
>
{style="tip"}

## エスケープシーケンス {id="escape-sequences"}

ソースコードに直接記述することが困難な特殊文字や、特別な意味を持つ文字にはエスケープシーケンスを使用します。

すべてのエスケープシーケンスはバックスラッシュ（`\`）で始まります。

| **サポートされているシーケンス** | **説明**              | 
|----------------------------------|-----------------------|
| `\t`                             | タブ                  | 
| `\b`                             | バックスペース        | 
| `\n`                             | 改行（LF）            | 
| `\r`                             | 復帰（CR）            | 
| `\'`                             | シングルクォーテーション | 
| `\"`                             | ダブルクォーテーション |
| `\\`                             | バックスラッシュ      | 
| `\$`                             | ドル記号              | 

例：

```kotlin
val newLine = '\n'
val dollar = '\$'
val backslash = '\\'
```

## 操作 {id="operations"}

`Char` は比較、判定、大文字・小文字の変換、および明示的な数値変換をサポートしています。

### 文字の比較 {id="character-comparison"}

`Char` 値を比較するには、`==`、`!=`、`<`、`>`、`<=`、`>=` などの標準的な[比較演算子](keyword-reference.md#operators-and-special-symbols)を使用します。

Kotlinは `Char` 値をそれぞれのUnicode数値によって比較し、`Boolean` 値を返します：

```kotlin
val before = 'a' < 'b' // true
val after = 'c' > 'd' // false
val different = 'A' == 'a' // false 
val equal = 'A' == 'A' // true
```

### 文字の処理 {id="character-processing"}

Kotlinは文字値の判定や大文字・小文字の変換を行う関数を提供しています。
例えば：

```kotlin
fun main() {
//sampleStart
    val myChar = 'A'
    // 文字が数字を表しているかチェック
    println(myChar.isDigit()) // false
    // 文字が大文字を表しているかチェック
    println(myChar.isUpperCase()) // true
    // 小文字に変換したものを返す
    println(myChar.lowercaseChar()) // 'a'
//sampleEnd
}
```
{kotlin-runnable="true"}

> 利用可能な関数の詳細については、
> [APIリファレンス](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin/-char/)を参照してください。
>
{style="note"}

### 文字の演算 {id="character-arithmetic"}

整数を加算または減算することで、別の文字値を作成できます：

```kotlin
fun main() {
//sampleStart
    val a = 'a'

    println(a + 1)  // b
    println(a + 2)  // c
    println(a - 32) // A
//sampleEnd
}
```
{kotlin-runnable="true"}

> これらの演算は、言語固有のアルファベットの規則ではなく、Unicode値に基づきます。
>
{style="note"}

また、可変変数に対して前置および後置形式のインクリメント（`++`）演算子やデクリメント（`--`）演算子を使用することもできます：

```kotlin
fun main() {
//sampleStart
    var a = 'A'
    
    a += 10
    println(a)   // 'K'
    
    println(++a) // 'L'  前置インクリメント
    println(a++) // 'L'  後置インクリメント
    println(a)   // 'M'
    
    println(--a) // 'L'  前置デクリメント
    println(a--) // 'L'  後置デクリメント
    println(a)   // 'K'
//sampleEnd
}
```
{kotlin-runnable="true"}

### 文字の変換 {id="character-conversion"}

`Char` を数値型に変換するには、明示的な変換を使用します：

* 文字のUnicode数値を取得するには `.code` を使用します：

  ```kotlin
  fun main() { 
  //sampleStart
      val letter = 'A'
      println(letter.code) // 65
  //sampleEnd
  }
  ```
  {kotlin-runnable="true"}

* 文字が10進数の数字を表している場合は、`digitToInt()` を使用します：
  ```kotlin
  fun main() { 
  //sampleStart
      val digit = '7'
      println(digit.digitToInt()) // 7
  //sampleEnd
  }
  ```
  {kotlin-runnable="true"}

  > 文字が有効な数字でない可能性がある場合は、`digitToIntOrNull()` を使用してください。
  >
  {style="tip"}