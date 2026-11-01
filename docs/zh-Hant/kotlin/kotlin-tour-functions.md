[//]: # (title: 函式)

<no-index/>

你可以使用 `fun` 關鍵字在 Kotlin 中宣告自己的函式。

```kotlin
fun hello() {
    return println("Hello, world!")
}

fun main() {
    hello()
    // Hello, world!
}
```
{kotlin-runnable="true" id="kotlin-tour-function-demo"}

在 Kotlin 中：

* 函式參數寫在圓括號 `()` 內。
* 每個參數都必須具有型別，多個參數之間必須以逗號 `,` 分隔。
* 傳回型別寫在函式的圓括號 `()` 後面，並以冒號 `:` 分隔。
* 函式的主體寫在花括號 `{}` 內。
* `return` 關鍵字用於結束函式或從函式傳回內容。

> 如果函式不傳回任何有用的內容，則可以省略傳回型別和 `return` 關鍵字。若要進一步了解相關內容，請參閱[無傳回值的函式](#functions-without-return)。
>
{style="note"}

在以下範例中：

* `x` 和 `y` 是函式參數。
* `x` 和 `y` 的型別為 `Int`。
* 該函式的傳回型別為 `Int`。
* 該函式被呼叫時會傳回 `x` 和 `y` 的總和。

```kotlin
fun sum(x: Int, y: Int): Int {
    return x + y
}

fun main() {
    println(sum(1, 2))
    // 3
}
```
{kotlin-runnable="true" id="kotlin-tour-simple-function"}

> 我們在[程式碼編寫慣例](coding-conventions.md#function-names)中建議：函式命名應以小寫字母開頭，並採用不帶底線的駝峰式大小寫。
> 
{style="note"}

## 具名引數 {id="named-arguments"}

為了讓程式碼更簡潔，在呼叫函式時，你不需要包含參數名稱。然而，包含參數名稱確實可以提高程式碼的可讀性。這稱為使用**具名引數**（named arguments）。如果包含參數名稱，則可以依任意順序編寫參數。

> 在以下範例中，使用了[字串範本](strings.md#string-templates) (`$`) 來存取參數值、將其轉換為 `String` 型別，然後連接成字串以供列印。
> 
{style="tip"}

```kotlin
fun printMessageWithPrefix(message: String, prefix: String) {
    println("[$prefix] $message")
}

fun main() {
    // 使用調換參數順序的具名引數
    printMessageWithPrefix(prefix = "Log", message = "Hello")
    // [Log] Hello
}
```
{kotlin-runnable="true" id="kotlin-tour-named-arguments-function"}

## 預設參數值 {id="default-parameter-values"}

你可以為函式參數定義預設值。在呼叫函式時，任何具有預設值的參數都可以省略。若要宣告預設值，請在型別後方使用指派運算子 `=`：

```kotlin
fun printMessageWithPrefix(message: String, prefix: String = "Info") {
    println("[$prefix] $message")
}

fun main() {
    // 呼叫函式並傳入兩個參數
    printMessageWithPrefix("Hello", "Log") 
    // [Log] Hello
    
    // 呼叫函式時僅傳入 message 參數
    printMessageWithPrefix("Hello")        
    // [Info] Hello
    
    printMessageWithPrefix(prefix = "Log", message = "Hello")
    // [Log] Hello
}
```
{kotlin-runnable="true" id="kotlin-tour-default-param-function"}

> 你可以略過具有預設值的特定參數，而不是省略全部。然而，在第一個略過的參數之後，後續的所有參數都必須指定名稱。
>
{style="note"}

## 無傳回值的函式 {id="functions-without-return"}

如果你的函式不傳回有用的值，則其傳回型別為 `Unit`。`Unit` 是一種只有一個值的型別——即 `Unit`。你不需要在函式主體中明確宣告傳回 `Unit`。這表示你不需要使用 `return` 關鍵字，也不需要宣告傳回型別：

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
{kotlin-runnable="true" id="kotlin-tour-unit-function"}

## 單一運算式函式 {id="single-expression-functions"}

為了使程式碼更加簡潔，你可以使用單一運算式函式。例如，`sum()` 函式可以縮短為：

```kotlin
fun sum(x: Int, y: Int): Int {
    return x + y
}

fun main() {
    println(sum(1, 2))
    // 3
}
```
{kotlin-runnable="true" id="kotlin-tour-simple-function-before"}

你可以移除花括號 `{}`，並使用指派運算子 `=` 來宣告函式主體。使用指派運算子 `=` 時，Kotlin 會使用型別推論，因此你也可以省略傳回型別。這樣 `sum()` 函式就變成了一行：

```kotlin
fun sum(x: Int, y: Int) = x + y

fun main() {
    println(sum(1, 2))
    // 3
}
```
{kotlin-runnable="true" id="kotlin-tour-simple-function-after"}

然而，如果你希望其他開發人員能快速理解你的程式碼，即使在使用指派運算子 `=` 時，明確定義傳回型別也是個好習慣。

> 如果你使用花括號 `{}` 宣告函式主體，除非傳回型別是 `Unit` 型別，否則必須宣告傳回型別。
> 
{style="note"}

## 函式中的提前返回 {id="early-returns-in-functions"}

若要停止函式中的程式碼繼續往下執行，請使用 `return` 關鍵字。這個範例使用 `if`，在條件運算式結果為 true 時提前從函式返回：

```kotlin
// 已註冊的使用者名稱清單
val registeredUsernames = mutableListOf("john_doe", "jane_smith")

// 已註冊的電子郵件清單
val registeredEmails = mutableListOf("john@example.com", "jane@example.com")

fun registerUser(username: String, email: String): String {
    // 如果使用者名稱已被佔用則提前返回
    if (username in registeredUsernames) {
        return "Username already taken. Please choose a different username."
    }

    // 如果電子郵件已被註冊則提前返回
    if (email in registeredEmails) {
        return "Email already registered. Please use a different email."
    }

    // 如果使用者名稱和電子郵件未被佔用，則繼續進行註冊
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
{kotlin-runnable="true" id="kotlin-tour-function-early-return"}

## 練習：函式 {id="practice-functions"}

<deflist appearance="clear" collapsible="true" numbered="true">
<def title="計算圓形面積" id="functions-exercise-1">

編寫一個名為 `circleArea` 的函式，該函式接收整數格式的圓半徑作為參數，並輸出該圓的面積。

> 在此練習中，你將匯入一個套件，以便透過 `PI` 存取 <math>π</math> 的值。如需了解有關匯入套件的更多資訊，請參閱[套件與匯入](packages.md)。
>
{style="tip"}

<deflist collapsible="true" id="kotlin-tour-functions-exercise-1-hint">
    <def title="提示">
        計算圓面積的公式為 <math>πr^2</math>，其中 <math>r</math> 為半徑。
    </def>
</deflist>

```kotlin
import kotlin.math.PI

// 在此處編寫你的程式碼

fun main() {
    println(circleArea(2))
}
```
{validate="false" kotlin-runnable="true" kotlin-target-platform="exercise" kotlin-hidden-files="ExerciseUtils.kt,tour/basics/CircleAreaTest.kt" id="kotlin-tour-functions-exercise-1"}

```kotlin
import kotlin.math.PI

fun circleArea(radius: Int): Double {
    return PI * radius * radius
}

fun main() {
    println(circleArea(2)) // 12.566370614359172
}
```
{kotlin-runnable="true" kotlin-target-platform="exercise" kotlin-hidden-files="ExerciseUtils.kt,tour/basics/CircleAreaTest.kt" initial-collapse-state="collapsed" collapsible="true" collapsed-title="範例解答" id="kotlin-tour-functions-solution-1"}

</def>
<def title="將函式重寫為單一運算式" id="functions-exercise-2">

將上一練習中的 `circleArea` 函式重寫為單一運算式函式。

```kotlin
import kotlin.math.PI

//sampleStart
// 在此處編寫你的程式碼
//sampleEnd

fun main() {
    println(circleArea(2))
}
```
{validate="false" kotlin-runnable="true" kotlin-target-platform="exercise" kotlin-hidden-files="ExerciseUtils.kt,tour/basics/CircleAreaTest.kt" folded-button="false" id="kotlin-tour-functions-exercise-2"}

```kotlin
import kotlin.math.PI

fun circleArea(radius: Int): Double = PI * radius * radius

fun main() {
    println(circleArea(2)) // 12.566370614359172
}
```
{kotlin-runnable="true" kotlin-target-platform="exercise" kotlin-hidden-files="ExerciseUtils.kt,tour/basics/CircleAreaTest.kt" folded-button="false" initial-collapse-state="collapsed" collapsible="true" collapsed-title="範例解答" id="kotlin-tour-functions-solution-2"}

</def>
<def title="使用預設參數與具名引數重構函式" id="functions-exercise-3">

你有一個函式，可將以小時、分鐘和秒為單位的時間間隔轉換為秒數。在大多數情況下，你只需要傳入一或兩個函式參數，而其餘參數等於 0。請使用預設參數值和具名引數來改進該函式及呼叫它的程式碼，使程式碼更易於閱讀。

```kotlin
// 重構此函式：為 hours、minutes 和 seconds 提供預設值 0
fun intervalInSeconds(hours: Int, minutes: Int, seconds: Int) =
    ((hours * 60) + minutes) * 60 + seconds

fun main() {
    // 盡可能使用具名引數簡化這些呼叫
    println(intervalInSeconds(1, 20, 15))
    println(intervalInSeconds(0, 1, 25))
    println(intervalInSeconds(2, 0, 0))
    println(intervalInSeconds(0, 10, 0))
    println(intervalInSeconds(1, 0, 1))
}
```
{validate="false" kotlin-runnable="true" kotlin-target-platform="exercise" kotlin-hidden-files="ExerciseUtils.kt,tour/basics/IntervalInSecondsTest.kt" id="kotlin-tour-functions-exercise-3"}

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
{kotlin-runnable="true" kotlin-target-platform="exercise" kotlin-hidden-files="ExerciseUtils.kt,tour/basics/IntervalInSecondsTest.kt" initial-collapse-state="collapsed" collapsible="true" collapsed-title="範例解答" id="kotlin-tour-functions-solution-3"}

</def>
</deflist>

## Lambda 運算式 {id="lambda-expressions"}

Kotlin 允許你透過使用 Lambda 運算式來為函式編寫更簡潔的程式碼。

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
{kotlin-runnable="true" id="kotlin-tour-lambda-function-before"}

也可以寫成 Lambda 運算式：

```kotlin
fun main() {
    val upperCaseString = { text: String -> text.uppercase() }
    println(upperCaseString("hello"))
    // HELLO
}
```
{kotlin-runnable="true" id="kotlin-tour-lambda-variable"}

Lambda 運算式初看可能難以理解，因此讓我們來逐步分解。Lambda 運算式寫在花括號 `{}` 內。

在 Lambda 運算式中，你需要編寫：

* 參數，後面接著 `->`。
* 函式主體，寫在 `->` 後面。

在前面的範例中：

* `text` 是一個函式參數。
* `text` 的型別為 `String`。
* 該函式傳回在 `text` 上呼叫 [`.uppercase()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.text/uppercase.html) 函式的結果。
* 整個 Lambda 運算式透過指派運算子 `=` 指派給 `upperCaseString` 變數。
* 透過像函式一樣使用變數 `upperCaseString`，並傳入字串 `"hello"` 作為參數，即可呼叫該 Lambda 運算式。
* `println()` 函式列印結果。

> 如果你宣告的 Lambda 沒有參數，則不需要使用 `->`。例如：
> ```kotlin
> { println("Log message") }
> ```
>
{style="note"}

Lambda 運算式可以透過多種方式使用。你可以：

* [將 Lambda 運算式作為參數傳遞給另一個函式](#pass-to-another-function)
* [從函式傳回 Lambda 運算式](#return-from-a-function)
* [獨立叫用 Lambda 運算式](#invoke-separately)

### 傳遞給另一個函式 {id="pass-to-another-function"}

將 Lambda 運算式傳遞給函式非常實用，一個絕佳的範例就是在集合上使用 [`.filter()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/filter.html) 函式：

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
{kotlin-runnable="true" id="kotlin-tour-lambda-filter"}

`.filter()` 函式接受一個 Lambda 運算式作為判定條件（predicate），並將其套用至清單中的每個元素。只有在判定條件傳回 `true` 時，該函式才會保留該元素：

* `{ x -> x > 0 }` 若元素為正數則傳回 `true`。
* `{ x -> x < 0 }` 若元素為負數則傳回 `true`。

這個範例展示了將 Lambda 運算式傳遞給函式的兩種方式：

* 對於正數，範例直接在 `.filter()` 函式中加入 Lambda 運算式。
* 對於負數，範例將 Lambda 運算式指派給 `isNegative` 變數。然後在 `.filter()` 函式中將 `isNegative` 變數用作函式參數。在此情況下，你必須在 Lambda 運算式中指定函式參數 (`x`) 的型別。

> 如果 Lambda 運算式是唯一的函式參數，你可以省略函式的圓括號 `()`：
> 
> ```kotlin
> val positives = numbers.filter { x -> x > 0 }
> ```
> 
> 這是[尾隨 Lambda](#trailing-lambdas) 的一個範例，本章結尾將更詳細討論這一點。
>
{style="note"}

另一個不錯的範例是使用 [`.map()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/map.html) 函式來轉換集合中的項目：

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
{kotlin-runnable="true" id="kotlin-tour-lambda-map"}

`.map()` 函式接受一個 Lambda 運算式作為轉換函式：

* `{ x -> x * 2 }` 取得清單中的每個元素，並傳回該元素乘以 2 的結果。
* `{ x -> x * 3 }` 取得清單中的每個元素，並傳回該元素乘以 3 的結果。

### 函式型別 {id="function-types"}

在從函式傳回 Lambda 運算式之前，你首先需要了解**函式型別**。

你已經學習了基本型別，但函式本身也有型別。Kotlin 的型別推論可以根據參數型別推論出函式的型別。但有時你可能需要明確指定函式型別。編譯器需要函式型別，以便知道該函式允許和不允許什麼。

函式型別的語法包含：

* 每個參數的型別寫在圓括號 `()` 內，並以逗號 `,` 分隔。
* 傳回型別寫在 `->` 後面。

例如：`(String) -> String` 或 `(Int, Int) -> Int`。

如果為 `upperCaseString()` 定義了函式型別，Lambda 運算式會如下所示：

```kotlin
val upperCaseString: (String) -> String = { text -> text.uppercase() }

fun main() {
    println(upperCaseString("hello"))
    // HELLO
}
```
{kotlin-runnable="true" id="kotlin-tour-lambda-function-type"}

如果你的 Lambda 運算式沒有參數，則圓括號 `()` 留空。例如：`() -> Unit`

> 你必須在 Lambda 運算式中或以函式型別的方式宣告參數和傳回型別。否則編譯器將無法知道你的 Lambda 運算式是什麼型別。
> 
> 例如，以下程式碼將無法運作：
> 
> `val upperCaseString = { str -> str.uppercase() }`
>
{style="note"}

### 從函式傳回 {id="return-from-a-function"}

Lambda 運算式可以從函式傳回。為了讓編譯器了解傳回的 Lambda 運算式是什麼型別，你必須宣告函式型別。

在以下範例中，`toSeconds()` 函式的函式型別為 `(Int) -> Int`，因為它始終傳回一個接受 `Int` 型別參數並傳回 `Int` 值的 Lambda 運算式。

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
{kotlin-runnable="true" id="kotlin-tour-lambda-return-from-function"}

### 獨立叫用 {id="invoke-separately"}

Lambda 運算式可以透過在花括號 `{}` 後面加上圓括號 `()` 並在圓括號中加入任何參數來獨立叫用：

```kotlin
fun main() {
    //sampleStart
    println({ text: String -> text.uppercase() }("hello"))
    // HELLO
    //sampleEnd
}
```
{kotlin-runnable="true" id="kotlin-tour-lambda-standalone"}

### 尾隨 Lambda {id="trailing-lambdas"}

如你所見，如果 Lambda 運算式是唯一的函式參數，你可以省略函式的圓括號 `()`。如果 Lambda 運算式作為函式的最後一個參數傳遞，則該運算式可以寫在函式圓括號 `()` 的外部。在這兩種情況下，這種語法都稱為**尾隨 Lambda**（trailing lambda）。

例如，[`.fold()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.sequences/fold.html) 函式接受初始值和操作：

```kotlin
fun main() {
    //sampleStart
    // 初始值為零。 
    // 該操作將初始值與清單中的每個項目累加求和。
    println(listOf(1, 2, 3).fold(0, { x, item -> x + item })) // 6

    // 或者，採用尾隨 Lambda 的形式
    println(listOf(1, 2, 3).fold(0) { x, item -> x + item })  // 6
    //sampleEnd
}
```
{kotlin-runnable="true" id="kotlin-tour-trailing-lambda"}

如需了解有關 Lambda 運算式的更多資訊，請參閱 [Lambda 運算式與匿名函式](lambdas.md#lambda-expressions-and-anonymous-functions)。

我們教學導覽的下一步是學習 Kotlin 中的[類別](kotlin-tour-classes.md)。

## 練習：Lambda 運算式 {completion-point="true" id="practice-lambda-expressions"}

<deflist appearance="clear" collapsible="true" numbered="true">
<def title="使用 Lambda 運算式建立 URL 清單" id="lambdas-exercise-1">

你有一個 Web 服務支援的操作清單、一個適用於所有請求的通用前綴，以及特定資源的 ID。若要對 ID 為 5 的資源請求操作 `title`，你需要建立以下 URL：`https://example.com/book-info/5/title`。請使用 Lambda 運算式從操作清單建立 URL 清單。

```kotlin
fun buildUrls(actions: List<String>, prefix: String, id: Int): List<String> {
    return TODO() // 在此處編寫你的程式碼
}

fun main() {
    val actions = listOf("title", "year", "author")
    val urls = buildUrls(actions, "https://example.com/book-info", 5)
    println(urls)
}
```
{validate="false" kotlin-runnable="true" kotlin-target-platform="exercise" kotlin-hidden-files="ExerciseUtils.kt,tour/basics/LambdasExercise1Test.kt" id="kotlin-tour-lambdas-exercise-1"}

```kotlin
fun buildUrls(actions: List<String>, prefix: String, id: Int): List<String> {
    return actions.map { action -> "$prefix/$id/$action" }
}

fun main() {
    val actions = listOf("title", "year", "author")
    val urls = buildUrls(actions, "https://example.com/book-info", 5)
    println(urls)
}
```
{kotlin-runnable="true" kotlin-target-platform="exercise" kotlin-hidden-files="ExerciseUtils.kt,tour/basics/LambdasExercise1Test.kt" initial-collapse-state="collapsed" collapsible="true" collapsed-title="範例解答" id="kotlin-tour-lambdas-solution-1"}

</def>
<def title="多次重複某個操作" id="lambdas-exercise-2">

編寫一個函式，接收一個 `Int` 值和一個操作（型別為 `() -> Unit` 的函式），然後將該操作重複執行給定的次數。接著使用此函式列印「Hello」5 次。

```kotlin
fun repeatN(n: Int, action: () -> Unit) {
    // 在此處編寫你的程式碼
}

fun main() {
    // 在此處編寫你的程式碼
}
```
{validate="false" kotlin-runnable="true" kotlin-target-platform="exercise" kotlin-hidden-files="ExerciseUtils.kt,tour/basics/LambdasExercise2Test.kt" id="kotlin-tour-lambdas-exercise-2"}

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
{kotlin-runnable="true" kotlin-target-platform="exercise" kotlin-hidden-files="ExerciseUtils.kt,tour/basics/LambdasExercise2Test.kt" initial-collapse-state="collapsed" collapsible="true" collapsed-title="範例解答" id="kotlin-tour-lambdas-solution-2"}

</def>
</deflist>

<seealso></seealso>

<list columns="2" id="tour-nav">
  <li>
    <a as="button" href="kotlin-tour-control-flow.md" mode="outline" icon="arrow-left" icon-position="left">上一步</a>
  </li>
  <li>
    <a as="button" href="kotlin-tour-classes.md" mode="classic" icon="arrow-right" icon-position="right">下一步</a>
  </li>
</list>