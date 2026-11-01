[//]: # (title: 字元)
[//]: # (description: 了解如何在 Kotlin 中使用 Char 型別，包括語法、Unicode 支援、轉義序列以及字元的常見操作。)

[`Char`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin/-char/) 型別將單一字元表示為 UTF-16 編碼單元。

對於個別字元值（例如字母、數字、標點符號或空白字元），請使用 `Char`。對於字元序列，請使用 [`String`](strings.md)。

> `Char` 並非數值型別，但每個字元都有一個可存取的數值 Unicode 值。
> 請參閱 [](#character-conversion)。
> 
{style="tip"}

## 語法 {id="syntax"}

若要宣告字元，請將其值用單引號（`' '`）括起來。你可以明確指定 `Char` 型別，或讓 Kotlin 從值中推論型別：

```kotlin
val letter: Char = 'a'

// Kotlin 會推論為 Char，因為這些值是用單引號撰寫的
val digit = '1'
val symbol = '!'
val space = ' '
val separator = ':'
```

字元常值必須剛好包含一個字元。否則，Kotlin 編譯器會回報錯誤：

```kotlin
val invalid = 'AB' // 錯誤
val invalidEmpty = '' // 錯誤
```
{validate="false"}

### 可為 null 的值 {id="nullable-values"}

若要儲存可為 null 的值，請使用 `Char?`：

```kotlin
val maybeAbsent: Char? = null
```

> 在 JVM 上，可為 null 的 `Char` 值會在需要時進行裝箱（boxed）。這同樣適用於
> [數值型別](numbers.md#boxing-and-caching-numbers-on-the-jvm)。
>
{style="note"}

## Unicode 支援 {id="unicode-support"}

Kotlin 將 `Char` 值表示為 UTF-16 編碼單元。這表示單一 `Char` 儲存的是一個 UTF-16 編碼單元，不一定是一個完整的 Unicode 字元。

### 基本多語言平面 {id="basic-multilingual-plane"}

單一 `Char` 可以儲存範圍在 `\u0000` 到 `\uFFFF` 之間的值。
此範圍涵蓋了基本多語言平面 (Basic Multilingual Plane, BMP)，其中包含幾乎所有現代語言的字元以及大量的符號。

若要透過 Unicode 值指定字元，請使用 `\u` 後接來自
[Unicode 表格](https://www.unicode.org/charts/) 的四位十六進位數值：

```kotlin
val unicodeNumber = '\u0031' // 等於 '1'
```

### 增補字元 {id="supplementary-characters"}

BMP 之外的 Unicode 字元（例如 Emoji 表情符號和某些歷史文字）無法用單一 `Char` 表示。在 UTF-16 中，它們被編碼為_代理對 (surrogate pair)_，其中兩個 `Char` 值在 `String` 中共同表示一個 Unicode 字元：

```kotlin
fun main() {
//sampleStart
    val emoji = "🥦"
    
    println(emoji.length) // 2
    println(emoji[0])     // 第一個代理字元
    println(emoji[1])     // 第二個代理字元
//sampleEnd
}
```

> 若要個別處理 32 位元符號，請使用儲存為 `Int` 值的 Unicode 碼位 (code points)。
>
{style="tip"}

## 轉義序列 {id="escape-sequences"}

對於難以直接在原始碼中撰寫或具有特殊含義的特殊字元，請使用轉義序列。

每個轉義序列都以反斜線（`\`）開頭。

| **支援的序列** | **說明**              | 
|------------------------|-----------------------|
| `\t`                   | Tab                   | 
| `\b`                   | Backspace             | 
| `\n`                   | 換行 (LF)             | 
| `\r`                   | 歸位 (CR)             | 
| `\'`                   | 單引號                | 
| `\"`                   | 雙引號                |
| `\\`                   | 反斜線                | 
| `\$`                   | 錢字號                | 

例如：

```kotlin
val newLine = '\n'
val dollar = '\$'
val backslash = '\\'
```

## 操作 {id="operations"}

`Char` 支援比較、檢查、大小寫轉換以及明確的數值轉換。

### 字元比較 {id="character-comparison"}

若要比較 `Char` 值，請使用標準的[比較運算子](keyword-reference.md#operators-and-special-symbols)，例如 `==`、`!=`、`<`、`>`、`<=` 和 `>=`。

Kotlin 依據字元的數值 Unicode 值來比較 `Char` 值，並傳回一個 `Boolean` 值：

```kotlin
val before = 'a' < 'b' // true
val after = 'c' > 'd' // false
val different = 'A' == 'a' // false 
val equal = 'A' == 'A' // true
```

### 字元處理 {id="character-processing"}

Kotlin 提供了用於檢查字元值及轉換其大小寫的函式。
例如：

```kotlin
fun main() {
//sampleStart
    val myChar = 'A'
    // 檢查該字元是否表示數字
    println(myChar.isDigit()) // false
    // 檢查該字元是否表示大寫字母
    println(myChar.isUpperCase()) // true
    // 回傳小寫版本
    println(myChar.lowercaseChar()) // 'a'
//sampleEnd
}
```
{kotlin-runnable="true"}

> 進一步了解可用函式，請參閱 
> [API 參考](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin/-char/)。
>
{style="note"}

### 字元算術運算 {id="character-arithmetic"}

你可以透過加上或減去一個整數來建立另一個字元值：

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

> 這些運算遵循 Unicode 數值，而非特定語言的字母表規則。
>
{style="note"}

你也可以在可變變數上使用前綴和後綴形式的遞增（`++`）與遞減（`--`）運算子：

```kotlin
fun main() {
//sampleStart
    var a = 'A'
    
    a += 10
    println(a)   // 'K'
    
    println(++a) // 'L'  前綴遞增
    println(a++) // 'L'  後綴遞增
    println(a)   // 'M'
    
    println(--a) // 'L'  前綴遞減
    println(a--) // 'L'  後綴遞減
    println(a)   // 'K'
//sampleEnd
}
```
{kotlin-runnable="true"}

### 字元轉換 {id="character-conversion"}

若要將 `Char` 轉換為數值型別，請使用明確轉換：

* 使用 `.code` 來取得字元的數值 Unicode 值：

  ```kotlin
  fun main() { 
  //sampleStart
      val letter = 'A'
      println(letter.code) // 65
  //sampleEnd
  }
  ```
  {kotlin-runnable="true"}

* 如果字元表示十進位數字，請使用 `digitToInt()`：
  ```kotlin
  fun main() { 
  //sampleStart
      val digit = '7'
      println(digit.digitToInt()) // 7
  //sampleEnd
  }
  ```
  {kotlin-runnable="true"}

  > 如果該字元可能不是有效的數字，請使用 `digitToIntOrNull()`。
  >
  {style="tip"}