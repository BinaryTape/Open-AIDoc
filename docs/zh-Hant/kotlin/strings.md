[//]: # (title: 字串)
[//]: # (description: 了解如何在 Kotlin 中處理字串，包含字串常值、字串範本、多行字串以及常見的文字操作。)

[`String`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin/-string/) 型別表示一連串的[字元](characters.md)。您可以使用它來處理文字值，例如單字、句子、訊息或結構化文字。

`String` 型別是不可變的 (immutable)。建立 `String` 物件後，其內容在剩餘的生命週期內都將保持不變。任何看似修改字串的操作實際上都會建立一個新的字串。

## 宣告字串

要宣告 `String` 常值，請將值包含在雙引號 (`""`) 中。您可以明確指定 `String` 型別，或讓 Kotlin 根據值進行型別推論：

```kotlin
val name: String = "Kotlin"
val message = "Hello, world!" // Kotlin 推論為 String
```

雙引號字串常值支援[轉義序列](characters.md#escape-sequences)，例如 `
` 或 `\t`：

```kotlin
val message = "Hello,
world!"
val quote = "Kotlin says, \"Hi\"."
```

### 多行字串

若要儲存包含多行或包含您不想轉義的引號的文字，請使用包裹在三重引號 (`""" """`) 中的多行字串：

```kotlin
val text = """
Hello,
Kotlin
"""

val quote = """Kotlin says, "Hi"."""
```

> 多行字串不支援轉義序列。
> Kotlin 會將這些字元視為一般文字。
>
{style="note"}

多行字串會保留原始碼中撰寫的換行和縮排。當您希望執行時的值與檔案中的文字編排一致時，此行為非常有用。

在以下範例中，每行之前的空格都是結果字串的一部分：

```kotlin
val text = """
    Hello,
    Kotlin
"""
```

若要移除共同的前導縮排，請使用 [`trimIndent()`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.text/trim-indent.html) 函式。它會偵測非空行中的共同最小縮排並將其移除：

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
{kotlin-runnable="true" kotlin-min-compiler-version="1.3"}

若要更明確地控制縮排移除，請使用 [`trimMargin()`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.text/trim-margin.html) 函式。它會移除每行中邊距前綴（包含前綴本身）之前的所有內容：

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
{kotlin-runnable="true" kotlin-min-compiler-version="1.3"}

預設情況下，`trimMargin()` 函式使用管道符號 (`|`) 作為邊距前綴，但您可以傳遞另一個字元作為參數。例如：`trimMargin(">")`。

> 當您使用 `trimIndent()` 或 `trimMargin()` 等函式處理字串時，無論在哪個平台，產生的字串都只會使用換行 (`
`) 分隔符號。
>
{style="note"}

## 字串範本

字串範本讓您可以直接在 `String` 常值中嵌入變數和運算式。此過程稱為*插值 (interpolation)*。您可以在一般字串和多行字串中使用字串範本。

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
{kotlin-runnable="true" kotlin-min-compiler-version="1.3"}

若要在字串中插入運算式，或將變數直接置於其他文字旁邊，請使用 `${}`：

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
{kotlin-runnable="true" kotlin-min-compiler-version="1.3"}

> 您也可以使用 `+` 運算子結合字串。然而，字串範本通常更容易閱讀且更符合語言慣例。
>
{style="tip"}

範本運算式也可以包含不需轉義的雙引號字串：

```kotlin
// 雙引號字串
val test = "${"test".uppercase()}"

// 多行字串
val result = """
Result: ${"OK".lowercase()}
"""
```

### 字串範本中的可 null 值

如果插值運算式或變數的求值結果為 `null`，Kotlin 編譯器會將文字 `null` 插入結果字串中。若要將 `null` 替換為另一個值，請使用 [Elvis 運算子](null-safety.md#elvis-operator) (`?:`)：

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
{kotlin-runnable="true" kotlin-min-compiler-version="1.3"}

### 多錢字號字串插值

在一般字串範本中，單個錢字號 (`$`) 代表插值的開始。如果您需要在字串中包含常值錢字號，請使用 **多錢字號字串插值**。

多錢字號字串插值允許您指定需要多少個連續的錢字號才能觸發插值。少於該數量的錢字號將被視為常值字元。

例如，當您在字串常值前使用 `$$` 時，插值僅在出現兩個連續錢字號時才開始：

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

> 如果您使用單錢字號字串插值，多錢字號字串插值不會影響您的程式碼。您可以繼續使用單個 `$` 並在需要時套用多錢字號。
>
{style="tip"}

## 基本字串操作

Kotlin 提供了一系列用於處理字串的操作。本節介紹一些最常用的操作。

> 在 [API 參考](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin/-string/)中進一步了解所有可用的函式。
>
{style="tip"}

### 取得字串長度

若要取得字串中的字元數量，請使用 [`length`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin/-string/length.html) 屬性：

```kotlin 
fun main (){
//sampleStart
    val language = "Kotlin"
    println(language.length)
    // 6
//sampleEnd
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3"}

### 存取字元

您可以使用索引運算子 (`[]`) 存取字串中的個別字元：

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
{kotlin-runnable="true" kotlin-min-compiler-version="1.3"}

> 字串索引從零開始。
> 如果您嘗試存取超出有效範圍的索引，Kotlin 會拋出例外。
>
{style="tip"}

您也可以遍歷字串中的字元：

```kotlin
fun main(){
//sampleStart
    for (char in "Kotlin") {
      println(char)
    }
//sampleEnd    
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3"}

### 擷取字串的部分內容

若要擷取字串的部分內容，請使用以下函式之一：

* [`substring()`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.text/substring.html)：傳回一個包含原始文字中所選部分的新字串。
* [`subSequence()`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.text/sub-sequence.html)：傳回一個包含原始文字中所選部分的 `CharSequence`。

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
{kotlin-runnable="true" kotlin-min-compiler-version="1.3"}

由於 `String` 型別是不可變的，這些函式不會修改原始字串。

### 比較字串

您可以使用 `==` 運算子檢查兩個字串是否具有相同的內容：

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
{kotlin-runnable="true" kotlin-min-compiler-version="1.3"}

您也可以使用 [`compareTo()`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin/-string/compare-to.html) 函式按字典順序（逐個字元）比較字串。它會掃描兩個字串，直到找到第一對不同的字元，並傳回：

* `0`：當字串相等時。
* 小於 `0` 的值：當接收者小於引數時。
* 大於 `0` 的值：當接收者大於引數時。

```kotlin
fun main() {
//sampleStart    
    println("abc".compareTo("abd") < 0)
    // true
    
    println("abc".compareTo("ABC") > 0)
    // true
    
    // 傳遞 true 以忽略大小寫差異
    println("abc".compareTo("ABC", ignoreCase = true) == 0)
    // true
//sampleEnd  
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3"}

### 處理字串內容

如果您想更改字串的內容，請使用 [`.trim()`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.text/trim.html)、[`.replace()`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.text/replace.html)、[`.uppercase()`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.text/uppercase.html) 和 [`.lowercase()`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.text/lowercase.html) 等函式建立其修改後的複本：

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
{kotlin-runnable="true" kotlin-min-compiler-version="1.3"}

您也可以使用 [`contains()`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.text/contains.html)、[`startsWith()`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.text/starts-with.html) 和 [`endsWith()`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.text/ends-with.html) 函式檢查字串內容：

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
{kotlin-runnable="true" kotlin-min-compiler-version="1.3"}

### 分割字串

您可以使用 [`split()`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.text/split.html) 函式根據分隔符號將字串分割成多個部分：

```kotlin
fun main() { 
//sampleStart
    val numbers = "one, two, three"
    println(numbers.split(", "))
    // [one, two, three]
//sampleEnd
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3"}

如果您想將字串分割成個別行，請使用 [`lines()`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.text/lines.html) 函式：

```kotlin
fun main() { 
//sampleStart
    val numbers = "one
two
three"
    println(numbers.lines())
    // [one, two, three]
//sampleEnd
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3"}

### 建置與格式化字串

> 對於 Kotlin 中的大多數格式化任務，請使用[字串範本](#字串範本)。
>
{style="tip"}

當您使用 `+` 運算子連接字串時，Kotlin 會為每次操作建立一個新的 `String` 物件。然而，這種方法在迴圈中或組裝多個片段時可能效能不佳。為了避免此類問題，您可以使用 `buildString()` 函式或 `StringBuilder`。它們將所有片段收集在單個可變緩衝區中，並在最後僅產生一個字串。

當決定要附加什麼內容的邏輯很複雜時，請使用 [`buildString()`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.text/build-string.html) 函式。例如，當您有多個條件會貢獻不同的片段時。使用 `buildString()` 時，您不需直接處理緩衝區。該函式會在內部建立一個 `StringBuilder`，執行您的程式碼區塊，並傳回產生的字串。

```kotlin
fun main() {
//sampleStart

    val hasErrors = true
    val hasWarnings = true
    val isComplete = false
    
    // buildString 建立一個空緩衝區
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
        // 緩衝區不為空，跳過備援 (fallback)
        if (isEmpty()) append("OK")
    }
    
    println(status)
    // Errors found; Warnings found
//sampleEnd
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3"}

當您需要將緩衝區作為明確的值時，請使用 [`StringBuilder`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.text/-string-builder/)。例如，要修改現有文字：

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
{kotlin-runnable="true" kotlin-min-compiler-version="1.3"}

在 JVM 上，您也可以使用 [`String.format()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.text/format.html) 函式格式化字串：

```kotlin
val text = String.format("Hello, %s", "Kotlin") 
```  

> 僅在您明確需要在 JVM 上使用格式化指定符 (formatter-style specifiers) 時，才使用 `String.format()` 函式。
> 在 [Java Class Formatter 文件](https://docs.oracle.com/javase/8/docs/api/java/util/Formatter.html#summary)中進一步了解格式指定符。
>
{style="note"}

## 字串轉換

您經常會使用字串來表示其他型別的值，例如數字、`Boolean` 值或來自輸入的識別符。Kotlin 提供了將值轉換為字串以及將字串剖析為其他型別的函式。

若要傳回值的字串表示形式，請使用 [`toString()`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin/-string/to-string.html) 函式：

```kotlin
val number = 10
val text = number.toString()
```

在字串範本和字串連接中，Kotlin 會自動將值轉換為字串。

若要將字串轉換為另一種型別，請使用對應的剖析函式：

* 對於整數值：[`toByte()`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.text/to-byte.html)、[`toShort()`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.text/to-short.html)、[`toInt()`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.text/to-int.html)、[`toLong()`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.text/to-long.html)
* 對於浮點值：[`toDouble()`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.text/to-double.html)、[`toFloat()`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.text/to-float.html)
* 對於布林值：[`toBoolean()`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.text/to-boolean.html)、[`toBooleanStrict()`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.text/to-boolean-strict.html)

如果字串具有有效的格式，這些函式會傳回所請求型別的值。如果輸入可能無效，請使用 `OrNull` 變體。這些函式會傳回 `null` 而不是拋出例外，使它們在處理使用者輸入或您無法完全控制的資料時更加安全：

```kotlin
val toInt = "10".toInt() // 10

// 1000000000000 超過 Int 的最大值
val toIntInvalid = "1000000000000".toIntOrNull()

val toBoolean = "true".toBooleanStrict() // true
val toBooleanInvalid = "yes".toBooleanStrictOrNull() // null