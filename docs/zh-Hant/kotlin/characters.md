[//]: # (title: 字元)
<web-summary>了解如何在 Kotlin 中使用 Char 型別，包括語法、Unicode 支援、轉義序列以及常見的字元操作。</web-summary>

[`Char`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin/-char/) 型別將單一字元表示為一個 UTF-16 編碼單元。

針對個別字元值（例如字母、數字、標點符號或空白字元），請使用 `Char`。針對字元序列，請使用 [`String`](strings.md)。

> `Char` 不是數值型別，但每個字元都有一個可存取的 Unicode 數值。
> 請參閱 [](#character-conversion)。
> 
{style="tip"}

## 語法 {id="syntax"}

若要宣告字元，請將值用單引號（`' '`）括起來。你可以明確指定 `Char` 型別，或是讓 Kotlin 根據值推論型別：

```kotlin
val letter: Char = 'a'

// 由於值寫在單引號中，Kotlin 會推論為 Char
val digit = '1'
val symbol = '!'
val space = ' '
val separator = ':'
```

字元常值必須恰好包含一個字元。否則，Kotlin 編譯器會回報錯誤：

```kotlin
val invalid = 'AB' // 錯誤
val invalidEmpty = '' // 錯誤
```
{validate="false"}

### 可為 Null 的值 {id="nullable-values"}

若要儲存可為 null 的值，請使用 `Char?`：

```kotlin
val maybeAbsent: Char? = null
```

> 在 JVM 上，可為 null 的 `Char` 值會在需要時進行裝箱（boxed）。這同樣適用於
> [數值型別](numbers.md#boxing-and-caching-numbers-on-the-jvm)。
>
{style="note"}

## Unicode 支援 {id="unicode-support"}

Kotlin 將 `Char` 值表示為 UTF-16 編碼單元。這表示單一 `Char` 儲存一個 UTF-16 編碼單元，而不一定是完整的單一 Unicode 字元。

### 基本多語言平面 {id="basic-multilingual-plane"}

單一 `Char` 可以儲存從 `\u0000` 到 `\uFFFF` 範圍內的值。
此範圍涵蓋了基本多語言平面 (BMP)，其中包含幾乎所有現代語言的字元以及大量符號。

若要透過 Unicode 值指定字元，請使用 `\u` 後接來自 [Unicode 表](https://www.unicode.org/charts/) 的四位十六進位數值：

```kotlin
val unicodeNumber = '\u0031' // 等於 '1'
```

### 增補字元 {id="supplementary-characters"}

BMP 之外的 Unicode 字元（例如 Emoji 和某些歷史文字）無法由單一 `Char` 表示。在 UTF-16 中，它們被編碼為*代理對 (surrogate pair)*，其中兩個 `Char` 值在 `String` 中共同表示一個 Unicode 字元：

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

> 若要單獨處理 32 位元符號，請使用儲存為 `Int` 值的 Unicode 碼位 (code point)。
>
{style="tip"}

## 轉義序列 {id="escape-sequences"}

對於難以直接寫入原始碼或具有特殊意義的特殊字元，請使用轉義序列。

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

Kotlin 依據其 Unicode 數值來比較 `Char` 值，並傳回一個 `Boolean` 值：

```kotlin
val before = 'a' < 'b' // true
val after = 'c' > 'd' // false
val different = 'A' == 'a' // false 
val equal = 'A' == 'A' // true
```

### 字元處理 {id="character-processing"}

Kotlin 提供了用於檢查及大小寫轉換字元值的函式。
例如：

```kotlin
fun main() {
//sampleStart
    val myChar = 'A'
    // 檢查該字元是否表示數字
    println(myChar.isDigit()) // false
    // 檢查該字元是否表示大寫字母
    println(myChar.isUpperCase()) // true
    // 傳回小寫版本
    println(myChar.lowercaseChar()) // 'a'
//sampleEnd
}
```
{kotlin-runnable="true"}

> 請在 [API 參考](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin/-char/)中深入了解可用函式。
>
{style="note"}

### 字元算術運算 {id="character-arithmetic"}

你可以透過加上或減去整數來建立另一個字元值：

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

> 這些運算遵循 Unicode 數值，而非特定語言的字母順序規則。
>
{style="note"}

你也可以在可變變數上使用前綴和後綴形式的遞增（`++`）和遞減（`--`）運算子：

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

* 使用 `.code` 取得字元的 Unicode 數值：

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

  > 如果該字元可能不是有效數字，請使用 `digitToIntOrNull()`。
  >
  {style="tip"}