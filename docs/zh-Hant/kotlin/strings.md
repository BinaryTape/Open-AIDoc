[//]: # (title: 字串)

Kotlin 中的字串由型別 [`String`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin/-string/) 表示。

> 在 JVM 上，採用 UTF-16 編碼的 `String` 型別物件每個字元大約佔用 2 bytes。
> 
{style="note"}

通常，字串值是包含在雙引號 (`"`) 中的字元序列：

```kotlin
val str = "abcd 123"
```

字串的元素是字元，你可以透過索引操作存取：`s[i]`。
你可以使用 `for` 迴圈遍歷這些字元：

```kotlin
fun main() {
    val str = "abcd" 
//sampleStart
    for (c in str) {
        println(c)
    }
//sampleEnd
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3"}

字串是不可變的（immutable）。一旦初始化字串，你就無法更改其值或為其指派新值。
所有轉換字串的操作都會在新的 `String` 物件中傳回結果，而原始字串保持不變：

```kotlin
fun main() {
//sampleStart
    val str = "abcd"
   
    // 建立並列印一個新的 String 物件
    println(str.uppercase())
    // ABCD
   
    // 原始字串保持不變
    println(str) 
    // abcd
//sampleEnd
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3"}

若要連接字串，請使用 `+` 運算子。這也適用於將字串與其他型別的值連接，只要運算式中的第一個元素是字串即可：

```kotlin
fun main() {
//sampleStart
    val s = "abc" + 1
    println(s + "def")
    // abc1def    
//sampleEnd
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3"}

> 在大多數情況下，使用[字串範本](#string-templates)或[多行字串](#multiline-strings)比字串連接更可取。
> 
{style="note"}

## 字串常值

Kotlin 有兩型別型的字串常值：

* [轉義字串 (Escaped strings)](#escaped-strings)
* [多行字串 (Multiline strings)](#multiline-strings)

### 轉義字串

*轉義字串*可以包含轉義字元。
以下是轉義字串的範例：

```kotlin
val s = "Hello, world!
"
```

轉義是以傳統方式完成的，使用反斜線 (`\`)。
有關支援的轉義序列列表，請參閱[字元](characters.md)頁面。

### 多行字串

*多行字串*可以包含換行符號和任意文字。它以三重引號 (`"""`) 分隔，不包含轉義，並且可以包含換行符號和任何其他字元：

```kotlin
val text = """
    for (c in "foo")
        print(c)
    """
```

若要移除多行字串的前導空白，請使用 [`trimMargin()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.text/trim-margin.html) 函式：

```kotlin
val text = """
    |Tell me and I forget.
    |Teach me and I remember.
    |Involve me and I learn.
    |(Benjamin Franklin)
    """.trimMargin()
```

預設情況下，使用管道符號 `|` 作為邊距前綴，但你可以選擇另一個字元並將其作為參數傳遞，例如 `trimMargin(">")`。

## 字串範本

字串常值可以包含*範本運算式* – 即被求值並將結果連接到字串中的程式碼片段。
當處理範本運算式時，Kotlin 會自動在運算式的結果上呼叫 `.toString()` 函式將其轉換為字串。範本運算式以錢字號 (`$`) 開頭，由變數名稱組成：

```kotlin
fun main() {
//sampleStart
    val i = 10
    println("i = $i") 
    // i = 10
    
    val letters = listOf("a","b","c","d","e")
    println("Letters: $letters") 
    // Letters: [a, b, c, d, e]

//sampleEnd
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3"}

或是包含在花括號中的運算式：

```kotlin
fun main() {
//sampleStart
    val s = "abc"
    println("$s.length is ${s.length}") 
    // abc.length is 3
//sampleEnd
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3"}

你可以在多行字串和轉義字串中使用範本。然而，多行字串不支援反斜線轉義。
若要在多行字串中、在任何允許作為[識別符號](https://kotlinlang.org/grammar/#identifiers)開頭的符號之前插入錢字號 (`$`)，請使用以下語法：

```kotlin
val price = """
${'$'}9.99
"""
```

> 為了避免在字串中使用 `${'$'}` 序列，你可以使用實驗性的[多錢字號字串插值功能](#multi-dollar-string-interpolation)。
>
{style="note"}

### 多錢字號字串插值

多錢字號字串插值允許你指定需要多少個連續的錢字號才能觸發插值。
插值是將變數或運算式直接嵌入字串的過程。

雖然你可以為單行字串[轉義常值](#escaped-strings)，但 Kotlin 中的多行字串不支援反斜線轉義。
若要將錢字號 (`$`) 作為常值字元包含在內，你必須使用 `${'$'}` 結構來防止字串插值。
這種方法可能會使程式碼難以閱讀，尤其是當字串包含多個錢字號時。

多錢字號字串插值簡化了這一點，它讓你在單行和多行字串中都能將錢字號視為常值字元。
例如：

```kotlin
val `KClass<*>`.jsonSchema : String
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

在這裡，`$$` 前綴指定需要兩個連續的錢字號才能觸發字串插值。單個錢字號則保留為常值字元。

你可以調整觸發插值的錢字號數量。
例如，使用三個連續的錢字號 (`$$$`) 允許 `$` 和 `$$` 保持為常值，同時啟用以 `$$$` 開頭的插值：

```kotlin
val productName = "carrot"
val requestedData =
    $$"""{
      "currency": "$",
      "enteredAmount": "42.45 $",
      "$serviceField": "none",
      "product": "$$productName"
    }
    """

println(requestedData)
//{
//    "currency": "$",
//    "enteredAmount": "42.45 $",
//    "$serviceField": "none",
//    "product": "carrot"
//}
```

在這裡，`$$` 前綴允許字串包含 `$` 而不需要使用 `${'$'}` 結構進行轉義。

多錢字號字串插值不會影響使用單錢字號字串插值的現有程式碼。你可以像以前一樣繼續使用單個 `$`，並在需要處理字串中的常值錢字號時應用多錢字號。

## 字串格式化

> 使用 `String.format()` 函式的字串格式化僅在 Kotlin/JVM 中可用。
>
{style="note"}

若要根據你的特定需求格式化字串，請使用 [`String.format()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.text/format.html) 函式。

`String.format()` 函式接受一個格式字串和一個或多個引數。格式字串包含一個用於給定引數的占位符號（由 `%` 指示），後跟格式指定符。
格式指定符是針對相應引數的格式化指令，由旗標、寬度、精度和轉換型別組成。格式指定符共同決定了輸出的格式。常見的格式指定符包括用於整數的 `%d`、用於浮點數的 `%f` 和用於字串的 `%s`。你還可以使用 `argument_index` 語法在格式字串中以不同的格式多次引用同一個引數。

> 若要深入瞭解並查看詳盡的格式指定符列表，請參閱 [Java 的 Formatter 類別文件](https://docs.oracle.com/javase/8/docs/api/java/util/Formatter.html#summary)。
>
{style="note"}

讓我們看一個範例：

```kotlin
fun main() { 
//sampleStart
    // 格式化整數，添加前導零以達到七個字元的長度
    val integerNumber = String.format("%07d", 31416)
    println(integerNumber)
    // 0031416

    // 格式化浮點數，顯示 + 號並保留四位小數
    val floatNumber = String.format("%+.4f", 3.141592)
    println(floatNumber)
    // +3.1416

    // 將兩個字串格式化為大寫，每個佔用一個占位符號
    val helloString = String.format("%S %S", "hello", "world")
    println(helloString)
    // HELLO WORLD
    
    // 格式化負數以包含在圓括號中，然後使用 `argument_index` 語法以不同格式（不帶圓括號）重複同一個數字
    val negativeNumberInParentheses = String.format("%(d means %1\$d", -31416)
    println(negativeNumberInParentheses)
    //(31416) means -31416
//sampleEnd    
}
```
{interpolate-variables="false" kotlin-runnable="true" kotlin-min-compiler-version="1.3"}

`String.format()` 函式提供與字串範本類似的功能。然而，`String.format()` 函式更通用，因為有更多的格式化選項可用。

此外，你可以從變數指派格式字串。當格式字串發生變化時（例如在取決於使用者區域設定的在地化案例中），這很有用。

使用 `String.format()` 函式時要小心，因為很容易將引數的數量或位置與其對應的占位符號錯配。