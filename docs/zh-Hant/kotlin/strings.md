[//]: # (title: 字串)
<web-summary>了解如何在 Kotlin 中使用字串，包含字串常值、字串範本、多行字串以及常見的文字操作。</web-summary>

[`String`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin/-string/) 型別代表一連串的[字元](characters.md)。你可以將其用於文字值，例如單字、句子、訊息或結構化文字。

`String` 型別是不可變的（immutable）。一旦建立了 `String` 物件，其內容在其整個生命週期中都將保持不變。任何看似修改字串的操作，實際上都會建立一個新的字串。

## 宣告字串 {id="declare-strings"}

若要宣告 `String` 常值，請將值包含在雙引號（`""`）中。你可以明確指定 `String` 型別，或讓 Kotlin 從值中進行推論：

```kotlin
val name: String = "Kotlin"
val message = "Hello, world!" // Kotlin 推論為 String
```

雙引號字串常值支援[轉義序列](characters.md#escape-sequences)，例如 `\n` 或 `\t`：

```kotlin
val message = "Hello,\nworld!"
val quote = "Kotlin says, \"Hi\"."
```

### 多行字串 {id="multiline-strings"}

若要儲存由多行組成的文字，或包含不想跳脫引號的文字，請使用以三引號（`""" """`）括起來的多行字串：

```kotlin
val text = """
Hello,
Kotlin
"""

val quote = """Kotlin says, "Hi"."""
```

> 多行字串不支援轉義序列。Kotlin 會將這些字元視為一般文字。
>
{style="note"}

多行字串會保留原始碼中所撰寫的換行與縮排。當你希望執行時的值與檔案中的文字排版一致時，這個特性非常有用。

在以下範例中，每行前面的空格都是產生的字串的一部分：

```kotlin
val text = """
    Hello,
    Kotlin
"""
```

若要移除共同的前導縮排，請使用 [`trimIndent()`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.text/trim-indent.html) 函式。它會偵測非空白行中共有的最小縮排並將其移除：

```kotlin
fun main() {
//sampleStart
    val text = """
        Hello,
        Kotlin
    """.trimIndent()
    
    println(text)
//sampleEnd
}
```
{kotlin-runnable="true"}

若要更明確地控制縮排的移除，請使用 [`trimMargin()`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.text/trim-margin.html) 函式。它會移除每行中邊界前綴（margin prefix）之前的所有內容（包括該前綴本身）：

```kotlin
fun main() {
//sampleStart
    val text = """
        |Hello,
        |Kotlin
    """.trimMargin()
    
    println(text)
//sampleEnd
}
```
{kotlin-runnable="true"}

預設情況下，`trimMargin()` 函式使用管道符號（`|`）作為邊界前綴，但你也可以傳入其他字元作為參數。例如：`trimMargin(">")`。

> 當你使用 `trimIndent()` 或 `trimMargin()` 等函式處理字串時，無論在哪個平台上，產生的字串都只會使用換行（`\n`）分隔符號。
>
{style="note"}

## 字串範本 {id="string-templates"}

字串範本可讓你直接在 `String` 常值中嵌入變數和運算式。此過程稱為「字串插值」（_interpolation_）。你可以在一般字串和多行字串中使用字串範本。

若要在字串中插入變數，請使用 `$` 符號：

```kotlin
fun main() { 
//sampleStart
    val name = "Kotlin"
    println("Hello, $name") 
    // Hello, Kotlin
//sampleEnd
}
```
{kotlin-runnable="true"}

若要在字串中插入運算式，或將變數直接緊鄰其他文字放置，請使用 `${}`：

```kotlin
fun main() {
//sampleStart
    val text = "abc"
    println("The length of $text is ${text.length}")
    // The length of abc is 3
      
    val language = "Kotlin"
    println("${language}Lang")
    // KotlinLang
//sampleEnd
}
```
{kotlin-runnable="true"}

> 你也可以使用 `+` 運算子來連接字串。不過，字串範本通常更易讀，也更符合慣用寫法。
>
{style="tip"}

範本運算式也可以包含雙引號字串，且無需跳脫：

```kotlin
// 雙引號字串
val test = "${"test".uppercase()}"

// 多行字串
val result = """
Result: ${"OK".lowercase()}
"""
```

### 字串範本中的可 null 值 {id="nullable-values-in-string-templates"}

如果插值的運算式或變數評估結果為 `null`，Kotlin 編譯器會將文字 `null` 插入產生的字串中。若要將 `null` 替換為其他值，請使用 [Elvis 運算子](null-safety.md#elvis-operator)（`?:`）：

```kotlin 
fun main(){
//sampleStart
    val text: String? = null
  
    println("Hello, $text")
    // Hello, null

    println("Hello, ${text ?: "Kotlin"}")
    // Hello, Kotlin
//sampleEnd
}
```
{kotlin-runnable="true"}

### 多 Dollar 字串插值 (Multi-dollar string interpolation) {id="multi-dollar-string-interpolation"}

在一般的字串範本中，單個錢字號（`$`）就會啟動插值。如果你需要在字串中包含常值錢字號，請使用 **多 Dollar 字串插值**（multi-dollar string interpolation）。

多 Dollar 字串插值允許你指定需要多少個連續的錢字號才能觸發插值。少於該數量的錢字號都會被視為一般字元常值。

例如，當你在字串常值前使用 `$$` 時，插值僅會在出現連續兩個錢字號時啟動：

```kotlin
val KClass<*>.jsonSchema : String
    get() = $$"""
    {
      "$schema": "https://json-schema.org/draft/2020-12/schema",
      "$id": "https://example.com/product.schema.json",
      "$dynamicAnchor": "meta",
      "title": "$${simpleName ?: qualifiedName ?: "unknown"}",
      "type": "object"
    }
    """
```

> 如果你使用單個錢字號的字串插值，多 Dollar 字串插值不會影響你的程式碼。你可以繼續使用單個 `$`，並在需要時套用多個錢字號。
>
{style="tip"}

## 基本字串操作 {id="basic-string-operations"}

Kotlin 提供了一系列用於處理字串的操作。本節將介紹一些最常用的操作。

> 請在 [API 參考](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin/-string/)中進一步了解所有可用的函式。
>
{style="tip"}

### 取得字串長度 {id="get-string-length"}

若要取得字串中的字元數，請使用 [`length`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin/-string/length.html) 屬性：

```kotlin 
fun main (){
//sampleStart
    val language = "Kotlin"
    println(language.length)
    // 6
//sampleEnd
}
```
{kotlin-runnable="true"}

### 存取字元 {id="access-characters"}

你可以使用索引運算子（`[]`）來存取字串中的個別字元：

```kotlin 
fun main (){
//sampleStart
    val language = "Kotlin"
    
    println(language[0])
    // K
    println(language[5])
    // n
//sampleEnd
}
```
{kotlin-runnable="true"}

> 字串索引從零開始。如果你嘗試存取有效範圍以外的索引，Kotlin 會拋出例外。
>
{style="tip"}

你也可以反覆運算字串中的字元：

```kotlin
fun main(){
//sampleStart
    for (char in "Kotlin") {
      println(char)
    }
//sampleEnd    
}
```
{kotlin-runnable="true"}

### 擷取字串的一部分 {id="extract-parts-of-a-string"}

若要擷取字串的一部分，請使用下列函式之一：

* [`substring()`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.text/substring.html)：回傳包含原始文字選取部分的新字串。
* [`subSequence()`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.text/sub-sequence.html)：回傳包含原始文字選取部分的 `CharSequence`。

例如：

```kotlin
fun main() {
//sampleStart    
    val text = "Kotlin"
    println(text.substring(1))
    // otlin
    println(text.substring(1, 5))
    // otli
    println(text.subSequence(1, 5))
    // otli
//sampleEnd
}
```
{kotlin-runnable="true"}

由於 `String` 型別是不可變的，這些函式不會修改原始字串。

### 比較字串 {id="compare-strings"}

你可以使用 `==` 運算子檢查兩個字串是否具有相同的內容：

```kotlin
fun main(){
//sampleStart
    println("kotlin" == "kotlin")
    // true
  
    println("kotlin" == "Kotlin")
    // false
//sampleEnd    
}
```
{kotlin-runnable="true"}

你也可以使用 [`compareTo()`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin/-string/compare-to.html) 函式依字典順序（逐字元）比較字串。它會掃描兩個字串，直到找到第一對不同的字元，並回傳：

* 當字串相等時回傳 `0`。
* 當接收者小於引數時回傳小於 `0` 的值。
* 當接收者大於引數時回傳大於 `0` 的值。

```kotlin
fun main() {
//sampleStart    
    println("abc".compareTo("abd") < 0)
    // true
    
    println("abc".compareTo("ABC") > 0)
    // true
    
    // 傳入 true 以忽略大小寫差異
    println("abc".compareTo("ABC", ignoreCase = true) == 0)
    // true
//sampleEnd  
}
```
{kotlin-runnable="true"}

### 操作字串內容 {id="work-with-string-content"}

如果你想要變更字串的內容，可以使用 [`.trim()`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.text/trim.html)、[`.replace()`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.text/replace.html)、[`.uppercase()`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.text/uppercase.html) 和 [`.lowercase()`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.text/lowercase.html) 等函式來建立修改後的副本：

```kotlin
fun main() {
//sampleStart
    val text = "  Hello, Kotlin  "

    println(text.trim())
    // Hello, Kotlin

    println(text.replace("Kotlin", "world"))
    //   Hello, world  

    println(text.uppercase())
    //   HELLO, KOTLIN  

    println(text.lowercase())
    //   hello, kotlin  
//sampleEnd    
}
```
{kotlin-runnable="true"}

你也可以使用 [`contains()`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.text/contains.html)、[`startsWith()`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.text/starts-with.html) 和 [`endsWith()`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.text/ends-with.html) 函式來檢查字串內容：

```kotlin
fun main() { 
//sampleStart
    val domain = "kotlinlang.org"
    
    // 檢查字串是否包含 "."
    println(domain.contains("."))
    // true
    
    // 檢查字串是否以 "kotlin" 開頭
    println(domain.startsWith("kotlin"))
    // true
    
    // 檢查字串是否以 ".org" 結尾
    println(domain.endsWith(".org"))
    // true
//sampleEnd
}
 ```
{kotlin-runnable="true"}

### 分割字串 {id="split-strings"}

你可以使用 [`split()`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.text/split.html) 函式根據分隔符號將字串拆分為多個部分：

```kotlin
fun main() { 
//sampleStart
    val numbers = "one, two, three"
    println(numbers.split(", "))
    // [one, two, three]
//sampleEnd
}
```
{kotlin-runnable="true"}

如果你想要將字串拆分為各個獨立的行，請使用 [`lines()`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.text/lines.html) 函式：

```kotlin
fun main() { 
//sampleStart
    val numbers = "one\ntwo\nthree"
    println(numbers.lines())
    // [one, two, three]
//sampleEnd
}
```
{kotlin-runnable="true"}

### 建構與格式化字串 {id="build-and-format-strings"}

> 對於 Kotlin 中的大部分格式化任務，請使用[字串範本](#string-templates)。
>
{style="tip"}

當你使用 `+` 運算子串接字串時，Kotlin 會為每個操作建立一個新的 `String` 物件。然而，在迴圈中或組裝多個片段時，這種做法可能不是最佳選擇。
為了避免此類問題，你可以使用 `buildString()` 函式或 `StringBuilder`。它們會將所有片段收集在單一可變緩衝區中，並在最後僅產生一個字串。

當決定要附加哪些內容的邏輯較為複雜時（例如當你有多個條件會貢獻不同的片段時），請使用 [`buildString()`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.text/build-string.html) 函式。使用 `buildString()` 時，你不需要直接處理緩衝區。該函式會在內部建立一個 `StringBuilder`，執行你的程式碼區塊，並回傳產生的字串。

```kotlin
fun main() {
//sampleStart

    val hasErrors = true
    val hasWarnings = true
    val isComplete = false
    
    // buildString 會建立一個空的緩衝區
    val status = buildString {
        // 將 "Errors found" 附加到緩衝區
        if (hasErrors) append("Errors found")
        if (hasWarnings) {
            // 緩衝區不為空，附加 "; "
            if (isNotEmpty()) append("; ")
            // 附加 "Warnings found"
            append("Warnings found")
        }
        // isComplete = false，不附加任何內容
        if (isComplete) {
            if (isNotEmpty()) append("; ")
            append("Completed")
        }
        // 緩衝區不為空，跳過備援處理
        if (isEmpty()) append("OK")
    }
    
    println(status)
    // Errors found; Warnings found
//sampleEnd
}
```
{kotlin-runnable="true"}

當你需要將緩衝區作為明確的值時，請使用 [`StringBuilder`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.text/-string-builder/)。例如，用來變更現有的文字：

```kotlin
fun main() {
//sampleStart
    val text = "Hello, Kotlin"
    val builder = StringBuilder(text)

    builder.replace(7, 13, "world")
    println(builder.toString()) 
    // Hello, world
//sampleEnd
}
```
{kotlin-runnable="true"}

在 JVM 上，你也可以使用 [`String.format()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.text/format.html) 函式來格式化字串：

```kotlin
val text = String.format("Hello, %s", "Kotlin") 
```  

> 僅在 JVM 上明確需要格式化程序風格的指定符時，才使用 `String.format()` 函式。
> 請在 [Java Formatter 類別文件](https://docs.oracle.com/javase/8/docs/api/java/util/Formatter.html#summary)中進一步了解格式指定符。
>
{style="note"}

## 字串轉換 {id="string-conversion"}

通常你可能會使用字串來代表其他型別的值，例如數字、`Boolean` 值或來自輸入的識別符號。Kotlin 提供了將值轉換為字串以及將字串剖析為其他型別的函式。

若要回傳某個值的字串表示形式，請使用 [`toString()`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin/-string/to-string.html) 函式：

```kotlin
val number = 10
val text = number.toString()
```

在字串範本和字串串接中，Kotlin 會自動將值轉換為字串。

若要將字串轉換為其他型別，請使用對應的剖析函式：

* 整數值：[`toByte()`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.text/to-byte.html)、[`toShort()`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.text/to-short.html)、[`toInt()`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.text/to-int.html)、[`toLong()`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.text/to-long.html)
* 浮點數值：[`toDouble()`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.text/to-double.html)、[`toFloat()`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.text/to-float.html)
* 布林值：[`toBoolean()`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.text/to-boolean.html)、[`toBooleanStrict()`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.text/to-boolean-strict.html)

如果字串具有有效格式，這些函式會回傳所請求型別的值。如果輸入可能無效，請使用 `OrNull` 變體。這些函式在出錯時會回傳 `null` 而不是拋出例外，這使得它們非常適合處理使用者輸入或你無法完全控制的資料：

```kotlin
val toInt = "10".toInt() // 10

// 1000000000000 超過 Int 的最大值
val toIntInvalid = "1000000000000".toIntOrNull()

val toBoolean = "true".toBooleanStrict() // true
val toBooleanInvalid = "yes".toBooleanStrictOrNull() // null
```