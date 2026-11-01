[//]: # (title: 基本語法概觀)

這是基本語法元素及其範例的精選集合。在每個小節的末尾，您都會找到指向相關主題詳細說明的連結。

您也可以透過 JetBrains Academy 的免費 [Kotlin Core 學習歷程](https://hyperskill.org/tracks?category=4&utm_source=jbkotlin_hs&utm_medium=referral&utm_campaign=kotlinlang-docs&utm_content=button_1&utm_term=22.03.23)來學習所有 Kotlin 基礎要點。

## 套件定義與匯入 {id="package-definition-and-imports"}

套件規格應位於原始碼檔案的頂端：

```kotlin
package my.demo

import kotlin.text.*

// ...
```

目錄與套件不需要完全對應：原始碼檔案可以任意放置在檔案系統中。

請參閱[套件](packages.md)。

## 程式入口點 {id="program-entry-point"}

Kotlin 應用程式的入口點是 `main` 函式：

```kotlin
fun main() {
    println("Hello world!")
}
```
{kotlin-runnable="true" id="kotlin-basic-syntax-hello-world"}

`main` 的另一種形式接受 `String` 的可變參數：

```kotlin
fun main(args: Array<String>) {
    println(args.contentToString())
}
```
{kotlin-runnable="true"}

## 列印至標準輸出 {id="print-to-the-standard-output"}

`print` 會將其引數列印至標準輸出：

```kotlin
fun main() {
//sampleStart
    print("Hello ")
    print("world!")
//sampleEnd
}
```
{kotlin-runnable="true" id="kotlin-basic-syntax-print"}

`println` 會列印其引數並加上換行，因此下一次列印的內容將顯示在下一行：

```kotlin
fun main() {
//sampleStart
    println("Hello world!")
    println(42)
//sampleEnd
}
```
{kotlin-runnable="true" id="kotlin-basic-syntax-println"}

## 從標準輸入讀取 {id="read-from-the-standard-input"}

`readln()` 函式會從標準輸入讀取。此函式會將使用者輸入的整行內容作為字串讀取。

您可以將 `println()`、`readln()` 和 `print()` 函式搭配使用，以列印提示訊息並顯示使用者輸入的內容：

```kotlin
// 列印訊息以要求輸入
println("Enter any word: ")

// 讀取並儲存使用者輸入。例如：Happiness
val yourWord = readln()

// 列印包含輸入內容的訊息
print("You entered the word: ")
print(yourWord)
// You entered the word: Happiness
```

若要了解更多資訊，請參閱[讀取標準輸入](read-standard-input.md)。

## 函式 {id="functions"}

具有兩個 `Int` 參數且傳回型別為 `Int` 的函式：

```kotlin
//sampleStart
fun sum(a: Int, b: Int): Int {
    return a + b
}
//sampleEnd

fun main() {
    print("sum of 3 and 5 is ")
    println(sum(3, 5))
}
```
{kotlin-runnable="true" id="kotlin-basic-syntax-return-int"}

函式主體可以是一個運算式。其傳回型別可自動推論：

```kotlin
//sampleStart
fun sum(a: Int, b: Int) = a + b
//sampleEnd

fun main() {
    println("sum of 19 and 23 is ${sum(19, 23)}")
}
```
{kotlin-runnable="true" id="kotlin-basic-syntax-function-expression"}

不傳回有意義值的函式：

```kotlin
//sampleStart
fun printSum(a: Int, b: Int): Unit {
    println("sum of $a and $b is ${a + b}")
}
//sampleEnd

fun main() {
    printSum(-1, 8)
}
```
{kotlin-runnable="true" id="kotlin-basic-syntax-return-unit"}

`Unit` 傳回型別可以省略：

```kotlin
//sampleStart
fun printSum(a: Int, b: Int) {
    println("sum of $a and $b is ${a + b}")
}
//sampleEnd

fun main() {
    printSum(-1, 8)
}
```
{kotlin-runnable="true" id="kotlin-basic-syntax-function-omit-unit"}

請參閱[函式](functions.md)。

## 變數 {id="variables"}

在 Kotlin 中，宣告變數時以關鍵字 `val` 或 `var` 開頭，後接變數名稱。

使用 `val` 關鍵字宣告僅賦值一次的變數。這些是不可變的唯讀區域變數，在初始化後無法再指派不同的值：

```kotlin
fun main() {
//sampleStart
    // 宣告變數 x 並將其初始化為值 5
    val x: Int = 5
    // 5
//sampleEnd
    println(x)
}
```
{kotlin-runnable="true" id="kotlin-basic-syntax-val"}

使用 `var` 關鍵字宣告可以重新指派的變數。這些是可變變數，您可以在初始化後變更其值：

```kotlin
fun main() {
//sampleStart
    // 宣告變數 x 並將其初始化為值 5
    var x: Int = 5
    // 重新指派新值 6 給變數 x
    x += 1
    // 6
//sampleEnd
    println(x)
}
```
{kotlin-runnable="true" id="kotlin-basic-syntax-var"}

Kotlin 支援型別推論，並會自動識別所宣告變數的資料型別。宣告變數時，可以省略變數名稱後面的型別：

```kotlin
fun main() {
//sampleStart
    // 宣告值為 5 的變數 x；型別推論為 `Int`
    val x = 5
    // 5
//sampleEnd
    println(x)
}
```
{kotlin-runnable="true" id="kotlin-basic-syntax-inference"}

變數只有在初始化後才能使用。您可以在宣告時立即初始化變數，也可以先宣告變數並在稍後進行初始化。在第二種情況下，您必須指定資料型別：

```kotlin
fun main() {
//sampleStart
    // 在宣告時初始化變數 x；不需要指定型別
    val x = 5
    // 宣告變數 c 但不初始化；必須指定型別
    val c: Int
    // 在宣告後初始化變數 c 
    c = 3
    // 5 
    // 3
//sampleEnd
    println(x)
    println(c)
}
```
{kotlin-runnable="true" id="kotlin-basic-syntax-initialize"}

您可以在頂層宣告變數：

```kotlin
//sampleStart
val PI = 3.14
var x = 0

fun incrementX() {
    x += 1
}
// x = 0; PI = 3.14
// incrementX()
// x = 1; PI = 3.14
//sampleEnd

fun main() {
    println("x = $x; PI = $PI")
    incrementX()
    println("incrementX()")
    println("x = $x; PI = $PI")
}
```
{kotlin-runnable="true" id="kotlin-basic-syntax-variable-top-level"}

有關宣告屬性的資訊，請參閱[屬性](properties.md)。

## 建立類別與執行個體 {id="creating-classes-and-instances"}

若要定義類別，請使用 `class` 關鍵字：
```kotlin
class Shape
```

類別的屬性可以在其宣告或主體中列出：

```kotlin
class Rectangle(val height: Double, val length: Double) {
    val perimeter = (height + length) * 2 
}
```

在類別宣告中列出參數的預設建構函式會自動可用：

```kotlin
class Rectangle(val height: Double, val length: Double) {
    val perimeter = (height + length) * 2 
}
fun main() {
    val rectangle = Rectangle(5.0, 2.0)
    println("The perimeter is ${rectangle.perimeter}")
}
```
{kotlin-runnable="true" id="kotlin-basic-syntax-class-constructor"}

類別之間的繼承使用冒號（`:`）宣告。類別預設為 `final`；若要讓類別可被繼承，請將其標記為 `open`：

```kotlin
open class Shape

class Rectangle(val height: Double, val length: Double): Shape() {
    val perimeter = (height + length) * 2 
}
```

如需建構函式與繼承的詳細資訊，請參閱[類別](classes.md)與[物件與執行個體](object-declarations.md)。

## 註解 {id="comments"}

就像大多數現代語言一樣，Kotlin 支援單行（或稱*行尾*）以及多行（*區塊*）註解：

```kotlin
// 這是行尾註解

/* 這是多行
   區塊註解。 */
```

Kotlin 中的區塊註解可以巢狀嵌套：

```kotlin
/* 註解從這裡開始
/* 包含巢狀註解 */  
並在此處結束。 */
```

有關文件註解語法的資訊，請參閱[為 Kotlin 程式碼撰寫文件](kotlin-doc.md)。

## 字串範本 {id="string-templates"}

```kotlin
fun main() {
//sampleStart
    var a = 1
    // 範本中的簡易名稱：
    val s1 = "a is $a" 
    
    a = 2
    // 範本中的任意運算式：
    val s2 = "${s1.replace("is", "was")}, but now is $a"
//sampleEnd
    println(s2)
}
```
{kotlin-runnable="true" id="kotlin-basic-syntax-string-templates"}

詳細資訊請參閱[字串範本](strings.md#string-templates)。

## 條件運算式 {id="conditional-expressions"}

```kotlin
//sampleStart
fun maxOf(a: Int, b: Int): Int {
    if (a > b) {
        return a
    } else {
        return b
    }
}
//sampleEnd

fun main() {
    println("max of 0 and 42 is ${maxOf(0, 42)}")
}
```
{kotlin-runnable="true" id="kotlin-basic-syntax-conditional-expressions"}

在 Kotlin 中，`if` 也可以用作運算式：

```kotlin
//sampleStart
fun maxOf(a: Int, b: Int) = if (a > b) a else b
//sampleEnd

fun main() {
    println("max of 0 and 42 is ${maxOf(0, 42)}")
}
```
{kotlin-runnable="true" id="kotlin-basic-syntax-if-expression"}

請參閱 [`if` 運算式](control-flow.md#if-expression)。

## for 迴圈 {id="for-loop"}

```kotlin
fun main() {
//sampleStart
    val items = listOf("apple", "banana", "kiwifruit")
    for (item in items) {
        println(item)
    }
//sampleEnd
}
```
{kotlin-runnable="true" id="kotlin-basic-syntax-for-loop"}

或：

```kotlin
fun main() {
//sampleStart
    val items = listOf("apple", "banana", "kiwifruit")
    for (index in items.indices) {
        println("item at $index is ${items[index]}")
    }
//sampleEnd
}
```
{kotlin-runnable="true" id="kotlin-basic-syntax-for-loop-indices"}

請參閱 [for 迴圈](control-flow.md#for-loops)。

## while 迴圈 {id="while-loop"}

```kotlin
fun main() {
//sampleStart
    val items = listOf("apple", "banana", "kiwifruit")
    var index = 0
    while (index < items.size) {
        println("item at $index is ${items[index]}")
        index++
    }
//sampleEnd
}
```
{kotlin-runnable="true" id="kotlin-basic-syntax-while-loop"}

請參閱 [while 迴圈](control-flow.md#while-loops)。

## when 運算式 {id="when-expression"}

```kotlin
//sampleStart
fun describe(obj: Any): String =
    when (obj) {
        1          -> "One"
        "Hello"    -> "Greeting"
        is Long    -> "Long"
        !is String -> "Not a string"
        else       -> "Unknown"
    }
//sampleEnd

fun main() {
    println(describe(1))
    println(describe("Hello"))
    println(describe(1000L))
    println(describe(2))
    println(describe("other"))
}
```
{kotlin-runnable="true" id="kotlin-basic-syntax-when-expression"}

請參閱 [when 運算式與陳述式](control-flow.md#when-expressions-and-statements)。

## 區間 {id="ranges"}

使用 `in` 運算子檢查數字是否在區間內：

```kotlin
fun main() {
//sampleStart
    val x = 10
    val y = 9
    if (x in 1..y+1) {
        println("fits in range")
    }
//sampleEnd
}
```
{kotlin-runnable="true" id="kotlin-basic-syntax-range-in"}

檢查數字是否超出區間：

```kotlin
fun main() {
//sampleStart
    val list = listOf("a", "b", "c")
    
    if (-1 !in 0..list.lastIndex) {
        println("-1 is out of range")
    }
    if (list.size !in list.indices) {
        println("list size is out of valid list indices range, too")
    }
//sampleEnd
}
```
{kotlin-runnable="true" id="kotlin-basic-syntax-out-of-range"}

遍歷區間：

```kotlin
fun main() {
//sampleStart
    for (x in 1..5) {
        print(x)
    }
//sampleEnd
}
```
{kotlin-runnable="true" id="kotlin-basic-syntax-iterate-range"}

或遍歷數列：

```kotlin
fun main() {
//sampleStart
    for (x in 1..10 step 2) {
        print(x)
    }
    println()
    for (x in 9 downTo 0 step 3) {
        print(x)
    }
//sampleEnd
}
```
{kotlin-runnable="true" id="kotlin-basic-syntax-iterate-progression"}

請參閱[區間與數列](ranges.md)。

## 集合 {id="collections"}

遍歷集合：

```kotlin
fun main() {
    val items = listOf("apple", "banana", "kiwifruit")
//sampleStart
    for (item in items) {
        println(item)
    }
//sampleEnd
}
```
{kotlin-runnable="true" id="kotlin-basic-syntax-iterate-collection"}

使用 `in` 運算子檢查集合是否包含某個物件：

```kotlin
fun main() {
    val items = setOf("apple", "banana", "kiwifruit")
//sampleStart
    when {
        "orange" in items -> println("juicy")
        "apple" in items -> println("apple is fine too")
    }
//sampleEnd
}
```
{kotlin-runnable="true" id="kotlin-basic-syntax-collection-in"}

使用 [Lambda 運算式](lambdas.md)來篩選和映射集合：

```kotlin
fun main() {
//sampleStart
    val fruits = listOf("banana", "avocado", "apple", "kiwifruit")
    fruits
      .filter { it.startsWith("a") }
      .sortedBy { it }
      .map { it.uppercase() }
      .forEach { println(it) }
//sampleEnd
}
```
{kotlin-runnable="true" id="kotlin-basic-syntax-collection-filter-map"}

請參閱[集合概觀](collections-overview.md)。

## 可為 null 的值與 null 檢查 {id="nullable-values-and-null-checks"}

當可能出現 `null` 值時，參照必須明確標記為可為 null。可為 null 的型別名稱末尾帶有 `?`。
例如 `Int?`。

若 `str` 不包含整數，則傳回 `null`：

```kotlin
fun parseInt(str: String): Int? {
    return str.toIntOrNull()
}
```

使用傳回可為 null 值的函式：

```kotlin
fun parseInt(str: String): Int? {
    return str.toIntOrNull()
}

//sampleStart
fun printProduct(arg1: String, arg2: String) {
    val x = parseInt(arg1)
    val y = parseInt(arg2)

    // 使用 `x * y` 會產生錯誤，因為它們可能持有 null。
    if (x != null && y != null) {
        // 在 null 檢查後，x 和 y 會自動轉換為不可為 null
        println(x * y)
    }
    else {
        println("'$arg1' or '$arg2' is not a number")
    }    
}
//sampleEnd

fun main() {
    printProduct("6", "7")
    printProduct("a", "7")
    printProduct("a", "b")
}
```
{kotlin-runnable="true" id="kotlin-basic-syntax-function-nullable-value"}

或：

```kotlin
fun parseInt(str: String): Int? {
    return str.toIntOrNull()
}

fun printProduct(arg1: String, arg2: String) {
    val x = parseInt(arg1)
    val y = parseInt(arg2)
    
//sampleStart
    // ...
    if (x == null) {
        println("Wrong number format in arg1: '$arg1'")
        return
    }
    if (y == null) {
        println("Wrong number format in arg2: '$arg2'")
        return
    }

    // 在 null 檢查後，x 和 y 會自動轉換為不可為 null
    println(x * y)
//sampleEnd
}

fun main() {
    printProduct("6", "7")
    printProduct("a", "7")
    printProduct("99", "b")
}
```
{kotlin-runnable="true" id="kotlin-basic-syntax-function-null-check"}

請參閱[空值安全](null-safety.md)。

## 型別檢查與自動轉換 {id="type-checks-and-automatic-casts"}

`is` 運算子用於檢查運算式是否為某個型別的執行個體。
如果不可變的區域變數或屬性已經過特定型別的檢查，則不需要明確對其進行轉換：

```kotlin
//sampleStart
fun getStringLength(obj: Any): Int? {
    if (obj is String) {
        // `obj` 在此分支中會自動轉換為 `String`
        return obj.length
    }

    // 在型別檢查分支之外，`obj` 仍為 `Any` 型別
    return null
}
//sampleEnd

fun main() {
    fun printLength(obj: Any) {
        println("Getting the length of '$obj'. Result: ${getStringLength(obj) ?: "Error: The object is not a string"} ")
    }
    printLength("Incomprehensibilities")
    printLength(1000)
    printLength(listOf(Any()))
}
```
{kotlin-runnable="true" id="kotlin-basic-syntax-is-operator"}

或：

```kotlin
//sampleStart
fun getStringLength(obj: Any): Int? {
    if (obj !is String) return null

    // `obj` 在此分支中會自動轉換為 `String`
    return obj.length
}
//sampleEnd

fun main() {
    fun printLength(obj: Any) {
        println("Getting the length of '$obj'. Result: ${getStringLength(obj) ?: "Error: The object is not a string"} ")
    }
    printLength("Incomprehensibilities")
    printLength(1000)
    printLength(listOf(Any()))
}
```
{kotlin-runnable="true" id="kotlin-basic-syntax-is-operator-expression"}

甚至可以：

```kotlin
//sampleStart
fun getStringLength(obj: Any): Int? {
    // 在 `&&` 的右側，`obj` 會自動轉換為 `String`
    if (obj is String && obj.length >= 0) {
        return obj.length
    }

    return null
}
//sampleEnd

fun main() {
    fun printLength(obj: Any) {
        println("Getting the length of '$obj'. Result: ${getStringLength(obj) ?: "Error: The object is not a string"} ")
    }
    printLength("Incomprehensibilities")
    printLength("")
    printLength(1000)
}
```
{kotlin-runnable="true" id="kotlin-basic-syntax-is-operator-logic"}

請參閱[類別](classes.md)與[型別轉換](typecasts.md)。