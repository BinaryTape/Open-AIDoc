[//]: # (title: 函式)

<no-index/>

您可以使用 `fun` 關鍵字在 Kotlin 中宣告自己的函式。

```kotlin
fun hello() {
    return println("Hello, world!")
}

fun main() {
    hello()
    // Hello, world!
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3" id="kotlin-tour-function-demo"}

在 Kotlin 中：

* 函式參數寫在圓括號 `()` 內。
* 每個參數都必須有型別，多個參數必須以逗號 `,` 分隔。
* 傳回型別寫在函式圓括號 `()` 之後，並以冒號 `:` 分隔。
* 函式的主體寫在花括號 `{}` 內。
* `return` 關鍵字用於結束函式或從函式傳回內容。

> 如果函式不傳回任何有用的內容，則可以省略傳回型別和 `return` 關鍵字。若要了解更多，請參閱 [不具傳回值的函式](#functions-without-return)。
>
{style="note"}

在以下範例中：

* `x` 和 `y` 是函式參數。
* `x` 和 `y` 的型別為 `Int`。
* 該函式的傳回型別為 `Int`。
* 呼叫該函式時會傳回 `x` 和 `y` 的總和。

```kotlin
fun sum(x: Int, y: Int): Int {
    return x + y
}

fun main() {
    println(sum(1, 2))
    // 3
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3" id="kotlin-tour-simple-function"}

> 我們在 [程式碼風格慣例](coding-conventions.md#function-names) 中建議，函式命名應以小寫字母開頭，並使用不含底線的駝峰式大小寫（camelCase）。
> 
{style="note"}

## 命名引數

為了使程式碼簡潔，呼叫函式時可以不包含參數名稱。然而，包含參數名稱確實能讓程式碼更容易閱讀。這稱為使用 **命名引數**。如果您包含參數名稱，則可以按任意順序撰寫參數。

> 在以下範例中，使用了 [字串範本](strings.md#string-templates) (`) 用於存取參數值，將其轉換為 `String` 型別，然後連接成一個字串以進行列印。
> 
{style="tip"}

```kotlin
fun printMessageWithPrefix(message: String, prefix: String) {
    println("[$prefix] $message")
}

fun main() {
    // 使用命名引數並交換參數順序
    printMessageWithPrefix(prefix = "Log", message = "Hello")
    // [Log] Hello
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3" id="kotlin-tour-named-arguments-function"}

## 預設參數值

您可以為函式參數定義預設值。呼叫函式時，可以省略任何具有預設值的參數。要宣告預設值，請在型別後使用指派運算子 `=`:

```kotlin
fun printMessageWithPrefix(message: String, prefix: String = "Info") {
    println("[$prefix] $message")
}

fun main() {
    // 呼叫函式並帶入兩個參數
    printMessageWithPrefix("Hello", "Log") 
    // [Log] Hello
    
    // 呼叫函式時僅帶入 message 參數
    printMessageWithPrefix("Hello")        
    // [Info] Hello
    
    printMessageWithPrefix(prefix = "Log", message = "Hello")
    // [Log] Hello
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3" id="kotlin-tour-default-param-function"}

> 您可以跳過特定的具有預設值的參數，而不是省略所有參數。但是，在第一個跳過的參數之後，您必須為所有後續參數命名。
>
{style="note"}

## 不具傳回值的函式

如果您的函式不傳回有用的值，則其傳回型別為 `Unit`。`Unit` 是一種只有一個值 — `Unit` 的型別。您不必在函式主體中明確宣告傳回 `Unit`。這意味著您不必使用 `return` 關鍵字或宣告傳回型別：

```kotlin
fun printMessage(message: String) {
    println(message)
    // `return Unit` 或 `return` 是可選的
}

fun main() {
    printMessage("Hello")
    // Hello
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3" id="kotlin-tour-unit-function"}

## 單一運算式函式

為了使程式碼更簡潔，您可以使用單一運算式函式。例如，`sum()` 函式可以縮短：

```kotlin
fun sum(x: Int, y: Int): Int {
    return x + y
}

fun main() {
    println(sum(1, 2))
    // 3
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3" id="kotlin-tour-simple-function-before"}

您可以移除花括號 `{}` 並使用指派運算子 `=` 來宣告函式主體。當您使用指派運算子 `=` 時，Kotlin 會使用型別推論，因此您也可以省略傳回型別。`sum()` 函式隨後變為一行：

```kotlin
fun sum(x: Int, y: Int) = x + y

fun main() {
    println(sum(1, 2))
    // 3
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3" id="kotlin-tour-simple-function-after"}

然而，如果您希望程式碼能被其他開發人員快速理解，即使使用指派運算子 `=`，明確定義傳回型別也是一個好主意。

> 如果您使用 `{}` 花括號來宣告函式主體，除非傳回型別是 `Unit` 型別，否則必須宣告傳回型別。
> 
{style="note"}

## 函式中的提前回傳

要停止函式中的程式碼處理到某一點之後，請使用 `return` 關鍵字。此範例使用 `if`，如果條件運算式為真，則提前從函式中傳回：

```kotlin
// 已註冊用戶名的列表
val registeredUsernames = mutableListOf("john_doe", "jane_smith")

// 已註冊電子郵件的列表
val registeredEmails = mutableListOf("john@example.com", "jane@example.com")

fun registerUser(username: String, email: String): String {
    // 如果用戶名已被佔用，則提前回傳
    if (username in registeredUsernames) {
        return "Username already taken. Please choose a different username."
    }

    // 如果電子郵件已註冊，則提前回傳
    if (email in registeredEmails) {
        return "Email already registered. Please use a different email."
    }

    // 如果用戶名和電子郵件未被佔用，則繼續註冊
    registeredUsernames.add(username)
    registeredEmails.add(email)

    return "User registered successfully: $username"
}

fun main() {
    println(registerUser("john_doe", "newjohn@example.com"))
    // Username already taken. Please choose a different username.
    println(registerUser("new_user", "newuser@example.com"))
    // User registered successfully: new_user
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3" id="kotlin-tour-function-early-return"}

## 函式練習

### 練習 1 {initial-collapse-state="collapsed" collapsible="true" id="functions-exercise-1"}

撰寫一個名為 `circleArea` 的函式，該函式接收整數格式的圓半徑作為參數，並輸出該圓的面積。

> 在此練習中，您匯入了一個套件，以便可以透過 `PI` 存取 <math>π</math> 的值。關於匯入套件的更多資訊，請參閱 [套件與匯入](packages.md)。
>
{style="tip"}

<deflist collapsible="true" id="kotlin-tour-functions-exercise-1-hint">
    <def title="提示">
        計算圓面積的公式為 <math>πr^2</math>，其中 <math>r</math> 是半徑。
    </def>
</deflist>

|---|---|
```kotlin
import kotlin.math.PI

// 在此處撰寫您的程式碼

fun main() {
    println(circleArea(2))
}
```
{validate="false" kotlin-runnable="true" kotlin-min-compiler-version="1.3" id="kotlin-tour-functions-exercise-1"}

|---|---|
```kotlin
import kotlin.math.PI

fun circleArea(radius: Int): Double {
    return PI * radius * radius
}

fun main() {
    println(circleArea(2)) // 12.566370614359172
}
```
{initial-collapse-state="collapsed" collapsible="true" collapsed-title="範例解答" id="kotlin-tour-functions-solution-1"}

### 練習 2 {initial-collapse-state="collapsed" collapsible="true" id="functions-exercise-2"}

將前一個練習中的 `circleArea` 函式改寫為單一運算式函式。

|---|---|
```kotlin
import kotlin.math.PI

// 在此處撰寫您的程式碼

fun main() {
    println(circleArea(2))
}
```
{validate="false" kotlin-runnable="true" kotlin-min-compiler-version="1.3" id="kotlin-tour-functions-exercise-2"}

|---|---|
```kotlin
import kotlin.math.PI

fun circleArea(radius: Int): Double = PI * radius * radius

fun main() {
    println(circleArea(2)) // 12.566370614359172
}
```
{initial-collapse-state="collapsed" collapsible="true" collapsed-title="範例解答" id="kotlin-tour-functions-solution-2"}

### 練習 3 {initial-collapse-state="collapsed" collapsible="true" id="functions-exercise-3"}

您有一個函式，可將以小時、分鐘和秒為單位給出的時間間隔轉換為秒。在大多數情況下，您只需要傳遞一或兩個函式參數，而其餘參數等於 0。請使用預設參數值和命名引數來改進該函式及呼叫它的程式碼，使程式碼更容易閱讀。

|---|---|
```kotlin
fun intervalInSeconds(hours: Int, minutes: Int, seconds: Int) =
    ((hours * 60) + minutes) * 60 + seconds

fun main() {
    println(intervalInSeconds(1, 20, 15))
    println(intervalInSeconds(0, 1, 25))
    println(intervalInSeconds(2, 0, 0))
    println(intervalInSeconds(0, 10, 0))
    println(intervalInSeconds(1, 0, 1))
}
```
{validate="false" kotlin-runnable="true" kotlin-min-compiler-version="1.3" id="kotlin-tour-functions-exercise-3"}

|---|---|
```kotlin
fun intervalInSeconds(hours: Int = 0, minutes: Int = 0, seconds: Int = 0) =
    ((hours * 60) + minutes) * 60 + seconds

fun main() {
    println(intervalInSeconds(1, 20, 15))
    println(intervalInSeconds(minutes = 1, seconds = 25))
    println(intervalInSeconds(hours = 2))
    println(intervalInSeconds(minutes = 10))
    println(intervalInSeconds(hours = 1, seconds = 1))
}
```
{initial-collapse-state="collapsed" collapsible="true" collapsed-title="範例解答" id="kotlin-tour-functions-solution-3"}

## Lambda 運算式

Kotlin 允許您透過使用 Lambda 運算式來撰寫更簡潔的函式程式碼。

例如，以下 `uppercaseString()` 函式：

```kotlin
fun uppercaseString(text: String): String {
    return text.uppercase()
}
fun main() {
    println(uppercaseString("hello"))
    // HELLO
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3" id="kotlin-tour-lambda-function-before"}

也可以寫成 Lambda 運算式：

```kotlin
fun main() {
    val upperCaseString = { text: String -> text.uppercase() }
    println(upperCaseString("hello"))
    // HELLO
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3" id="kotlin-tour-lambda-variable"}

Lambda 運算式乍看之下可能很難理解，所以讓我們來分解它。Lambda 運算式寫在花括號 `{}` 內。

在 Lambda 運算式中，您撰寫：

* 參數，後跟 `->`。
* `->` 之後是函式主體。

在之前的範例中：

* `text` 是函式參數。
* `text` 的型別為 `String`。
* 該函式傳回在 `text` 上呼叫 [`.uppercase()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.text/uppercase.html) 函式的結果。
* 整個 Lambda 運算式使用指派運算子 `=` 指派給 `upperCaseString` 變數。
* 透過像使用函式一樣使用變數 `upperCaseString` 並將字串 `"hello"` 作為參數來呼叫 Lambda 運算式。
* `println()` 函式列印結果。

> 如果您宣告一個沒有參數的 Lambda，則不需要使用 `->`。例如：
> ```kotlin
> { println("Log message") }
> ```
>
{style="note"}

Lambda 運算式可以透過多種方式使用。您可以：

* [將 Lambda 運算式作為參數傳遞給另一個函式](#pass-to-another-function)
* [從函式傳回 Lambda 運算式](#return-from-a-function)
* [單獨叫用 Lambda 運算式](#invoke-separately)

### 傳遞給另一個函式

將 Lambda 運算式傳遞給函式的一個很好的例子是，在集合上使用 [`.filter()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/filter.html) 函式：

```kotlin
fun main() {
    //sampleStart
    val numbers = listOf(1, -2, 3, -4, 5, -6)
    
    val positives = numbers.filter ({ x -> x > 0 })
    
    val isNegative = { x: Int -> x < 0 }
    val negatives = numbers.filter(isNegative)
    
    println(positives)
    // [1, 3, 5]
    println(negatives)
    // [-2, -4, -6]
    //sampleEnd
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3" id="kotlin-tour-lambda-filter"}

`.filter()` 函式接受一個 Lambda 運算式作為謂詞（predicate），並將其應用於列表的每個元素。僅當謂詞傳回 `true` 時，該函式才會保留該元素：

* `{ x -> x > 0 }` 如果元素為正數，則傳回 `true`。
* `{ x -> x < 0 }` 如果元素為負數，則傳回 `true`。

此範例演示了將 Lambda 運算式傳遞給函式的兩種方式：

* 對於正數，該範例直接在 `.filter()` 函式中添加 Lambda 運算式。
* 對於負數，該範例將 Lambda 運算式指派給 `isNegative` 變數。然後，`isNegative` 變數在 `.filter()` 函式中用作函式參數。在這種情況下，您必須在 Lambda 運算式中指定函式參數 (`x`) 的型別。

> 如果 Lambda 運算式是唯一的函式參數，您可以省略函式圓括號 `()`：
> 
> ```kotlin
> val positives = numbers.filter { x -> x > 0 }
> ```
> 
> 這是 [尾隨 Lambda](#trailing-lambdas) 的一個例子，在本章末尾將進行更詳細的討論。
>
{style="note"}

另一個很好的例子是使用 [`.map()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/map.html) 函式來轉換集合中的項目：

```kotlin
fun main() {
    //sampleStart
    val numbers = listOf(1, -2, 3, -4, 5, -6)
    val doubled = numbers.map { x -> x * 2 }
    
    val isTripled = { x: Int -> x * 3 }
    val tripled = numbers.map(isTripled)
    
    println(doubled)
    // [2, -4, 6, -8, 10, -12]
    println(tripled)
    // [3, -6, 9, -12, 15, -18]
    //sampleEnd
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3" id="kotlin-tour-lambda-map"}

`.map()` 函式接受一個 Lambda 運算式作為轉換函式：

* `{ x -> x * 2 }` 取得列表的每個元素並傳回該元素乘以 2。
* `{ x -> x * 3 }` 取得列表的每個元素並傳回該元素乘以 3。

### 函式型別

在您可以從函式傳回 Lambda 運算式之前，您首先需要了解 **函式型別**。

您已經了解了基本型別，但函式本身也有型別。Kotlin 的型別推論可以從參數型別推斷出函式的型別。但有時您可能需要明確指定函式型別。編譯器需要函式型別，以便知道該函式允許與不允許什麼。

函式型別的語法包括：

* 每個參數的型別寫在圓括號 `()` 內，並以逗號 `,` 分隔。
* 傳回型別寫在 `->` 之後。

例如：`(String) -> String` 或 `(Int, Int) -> Int`。

如果為 `upperCaseString()` 定義了函式型別，則 Lambda 運算式如下所示：

```kotlin
val upperCaseString: (String) -> String = { text -> text.uppercase() }

fun main() {
    println(upperCaseString("hello"))
    // HELLO
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3" id="kotlin-tour-lambda-function-type"}

如果您的 Lambda 運算式沒有參數，則圓括號 `()` 留空。例如：`() -> Unit`

> 您必須在 Lambda 運算式中或作為函式型別宣告參數和傳回型別。否則，編譯器將無法知道您的 Lambda 運算式的型別。
> 
> 例如，以下程式碼將無法運作：
> 
> `val upperCaseString = { str -> str.uppercase() }`
>
{style="note"}

### 從函式傳回

Lambda 運算式可以從函式傳回。為了讓編譯器了解 Lambda 運算式傳回的型別，您必須宣告一個函式型別。

在以下範例中，`toSeconds()` 函式的函式型別為 `(Int) -> Int`，因為它總是傳回一個 Lambda 運算式，該運算式接收一個 `Int` 型別的參數並傳回一個 `Int` 值。

此範例使用 `when` 運算式來確定呼叫 `toSeconds()` 時傳回哪個 Lambda 運算式：

```kotlin
fun toSeconds(time: String): (Int) -> Int = when (time) {
    "hour" -> { value -> value * 60 * 60 }
    "minute" -> { value -> value * 60 }
    "second" -> { value -> value }
    else -> { value -> value }
}

fun main() {
    val timesInMinutes = listOf(2, 10, 15, 1)
    val min2sec = toSeconds("minute")
    val totalTimeInSeconds = timesInMinutes.map(min2sec).sum()
    println("Total time is $totalTimeInSeconds secs")
    // Total time is 1680 secs
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3" id="kotlin-tour-lambda-return-from-function"}

### 單獨叫用

Lambda 運算式可以單獨叫用，方法是在花括號 `{}` 後添加圓括號 `()` 並在圓括號內包含任何參數：

```kotlin
fun main() {
    //sampleStart
    println({ text: String -> text.uppercase() }("hello"))
    // HELLO
    //sampleEnd
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3" id="kotlin-tour-lambda-standalone"}

### 尾隨 Lambda

如您所見，如果 Lambda 運算式是唯一的函式參數，您可以省略函式圓括號 `()`。如果 Lambda 運算式作為函式的最後一個參數傳遞，則該運算式可以寫在函式圓括號 `()` 之外。在這兩種情況下，這種語法都稱為 **尾隨 Lambda**。

例如，[`.fold()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.sequences/fold.html) 函式接受初始值和操作：

```kotlin
fun main() {
    //sampleStart
    // 初始值為零。 
    // 該操作將初始值與列表中的每個項目累計求和。
    println(listOf(1, 2, 3).fold(0, { x, item -> x + item })) // 6

    // 或者，以尾隨 Lambda 的形式
    println(listOf(1, 2, 3).fold(0) { x, item -> x + item })  // 6
    //sampleEnd
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3" id="kotlin-tour-trailing-lambda"}

有關 Lambda 運算式的更多資訊，請參閱 [Lambda 運算式與匿名函式](lambdas.md#lambda-expressions-and-anonymous-functions)。

我們導覽的下一步是了解 Kotlin 中的 [類別](kotlin-tour-classes.md)。

## Lambda 運算式練習 {completion-point="true"}

### 練習 1 {initial-collapse-state="collapsed" collapsible="true" id="lambdas-exercise-1"}

您有一個 Web 服務支援的操作列表、所有請求的共同前綴以及特定資源的 ID。要透過 ID 為 5 的資源請求操作 `title`，您需要建立以下 URL：`https://example.com/book-info/5/title`。請使用 Lambda 運算式從操作列表中建立 URL 列表。

|---|---|
```kotlin
fun main() {
    val actions = listOf("title", "year", "author")
    val prefix = "https://example.com/book-info"
    val id = 5
    val urls = // 在此處撰寫您的程式碼
    println(urls)
}
```
{validate="false" kotlin-runnable="true" kotlin-min-compiler-version="1.3" id="kotlin-tour-lambdas-exercise-1"}

|---|---|
```kotlin
fun main() {
    val actions = listOf("title", "year", "author")
    val prefix = "https://example.com/book-info"
    val id = 5
    val urls = actions.map { action -> "$prefix/$id/$action" }
    println(urls)
}
```
{initial-collapse-state="collapsed" collapsible="true" collapsed-title="範例解答" id="kotlin-tour-lambdas-solution-1"}

### 練習 2 {initial-collapse-state="collapsed" collapsible="true" id="lambdas-exercise-2"}

撰寫一個接收 `Int` 值和一個操作（型別為 `() -> Unit` 的函式）的函式，然後將該操作重複執行給定的次數。然後使用此函式列印「Hello」5 次。

|---|---|
```kotlin
fun repeatN(n: Int, action: () -> Unit) {
    // 在此處撰寫您的程式碼
}

fun main() {
    // 在此處撰寫您的程式碼
}
```
{validate="false" kotlin-runnable="true" kotlin-min-compiler-version="1.3" id="kotlin-tour-lambdas-exercise-2"}

|---|---|
```kotlin
fun repeatN(n: Int, action: () -> Unit) {
    for (i in 1..n) {
        action()
    }
}

fun main() {
    repeatN(5) {
        println("Hello")
    }
}
```
{initial-collapse-state="collapsed" collapsible="true" collapsed-title="範例解答" id="kotlin-tour-lambdas-solution-2"}

<seealso></seealso>

<list columns="2" id="tour-nav">
  <li>
    <a as="button" href="kotlin-tour-control-flow.md" mode="outline" icon="arrow-left" icon-position="left">上一步</a>
  </li>
  <li>
    <a as="button" href="kotlin-tour-classes.md" mode="classic" icon="arrow-right" icon-position="right">下一步</a>
  </li>
</list>