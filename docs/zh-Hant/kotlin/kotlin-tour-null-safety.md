[//]: # (title: Null 安全性)

<no-index/>

在 Kotlin 中，可以存在 `null` 值。當某個事物缺失或尚未設定時，Kotlin 就會使用 `null` 值。
在[集合](kotlin-tour-collections.md#kotlin-tour-map-no-key)章節中，當你嘗試使用 Map 中不存在的鍵來存取鍵值組時，就已經看過 Kotlin 回傳 `null` 值的範例。雖然以這種方式使用 `null` 值非常實用，但如果你的程式碼沒有做好處理它們的準備，就可能會遇到問題。

為了防止程式中的 `null` 值引發問題，Kotlin 具備了 Null 安全性機制。Null 安全性會在編譯期而非執行階段偵測與 `null` 值相關的潛在問題。

Null 安全性結合了多項功能，讓你能夠：

* 明確宣告程式中何時允許 `null` 值。
* 檢查 `null` 值。
* 對可能包含 `null` 值的屬性或函式使用安全呼叫。
* 宣告在偵測到 `null` 值時要採取的動作。

## 可為 null 的型別 {id="nullable-types"}

Kotlin 支援可為 null 的型別（Nullable types），這允許宣告的型別有可能包含 `null` 值。預設情況下，型別**不**允許接受 `null` 值。可為 null 的型別是透過在型別宣告後明確加上 `?` 來宣告的。

例如：

```kotlin
fun main() {
    // neverNull 為 String 型別
    var neverNull: String = "This can't be null"

    // 拋出編譯器錯誤
    neverNull = null

    // nullable 為可為 null 的 String 型別
    var nullable: String? = "You can keep a null here"

    // 這是允許的
    nullable = null

    // 預設情況下不接受 null 值
    var inferredNonNull = "The compiler assumes non-nullable"

    // 拋出編譯器錯誤
    inferredNonNull = null

    // notNull 不接受 null 值
    fun strLength(notNull: String): Int {                 
        return notNull.length
    }

    println(strLength(neverNull)) // 18
    println(strLength(nullable))  // 拋出編譯器錯誤
}
```
{kotlin-runnable="true" validate="false" id="kotlin-tour-nullable-type"}

> `length` 是 [String](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin/-string/) 類別的一個屬性，包含字串內的字元數。
>
{style="tip"}

## 檢查 null 值 {id="check-for-null-values"}

你可以在條件運算式中檢查是否存在 `null` 值。在以下範例中，`describeString()` 函式包含一個 `if` 陳述式，用於檢查 `maybeString` 是否**不**為 `null`，以及其 `length` 是否大於零：

```kotlin
fun describeString(maybeString: String?): String {
    if (maybeString != null && maybeString.length > 0) {
        return "String of length ${maybeString.length}"
    } else {
        return "Empty or null string"
    }
}

fun main() {
    val nullString: String? = null
    println(describeString(nullString))
    // Empty or null string
}
```
{kotlin-runnable="true" id="kotlin-tour-check-nulls"}

## 使用安全呼叫 {id="use-safe-calls"}

若要安全存取可能包含 `null` 值的物件屬性，請使用安全呼叫運算子 `?.`。如果物件本身或其存取的屬性之一為 `null`，安全呼叫運算子就會回傳 `null`。如果你想避免 `null` 值的出現引發程式碼錯誤，這會非常有用。

在以下範例中，`lengthString()` 函式使用安全呼叫來回傳字串的長度或 `null`：

```kotlin
fun lengthString(maybeString: String?): Int? = maybeString?.length

fun main() { 
    val nullString: String? = null
    println(lengthString(nullString))
    // null
}
```
{kotlin-runnable="true" id="kotlin-tour-safe-call-property"}

> 安全呼叫可以進行鏈式呼叫，因此如果物件的任何屬性包含 `null` 值，系統就會回傳 `null`，而不會拋出錯誤。例如：
> 
> ```kotlin
>   person.company?.address?.country
> ```
>
{style="tip"}

安全呼叫運算子也可以用來安全地呼叫擴充函式或成員函式。在這種情況下，系統會在呼叫該函式之前執行 null 檢查。如果檢查偵測到 `null` 值，則會略過該呼叫並回傳 `null`。

在以下範例中，`nullString` 為 `null`，因此跳過呼叫 [`.uppercase()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.text/uppercase.html) 並回傳 `null`：

```kotlin
fun main() {
    val nullString: String? = null
    println(nullString?.uppercase())
    // null
}
```
{kotlin-runnable="true" id="kotlin-tour-safe-call-function"}

## 使用 Elvis 運算子 {id="use-elvis-operator"}

你可以使用 **Elvis 運算子** `?:` 來提供在偵測到 `null` 值時所要回傳的預設值。

在 Elvis 運算子的左側填寫應檢查是否為 `null` 值的內容。
在 Elvis 運算子的右側填寫偵測到 `null` 值時應回傳的內容。

在以下範例中，`nullString` 為 `null`，因此存取 `length` 屬性的安全呼叫會回傳 `null` 值。
因此，Elvis 運算子會回傳 `0`：

```kotlin
fun main() {
    val nullString: String? = null
    println(nullString?.length ?: 0)
    // 0
}
```
{kotlin-runnable="true" id="kotlin-tour-elvis-operator"}

若要了解更多有關 Kotlin 中 Null 安全性的資訊，請參閱 [Null 安全性](null-safety.md)。

## 練習 {completion-point="true" id="practice"}

<deflist appearance="clear" collapsible="true">
<def title="計算員工的薪水" id="null-safety-basics-exercise-1">

你有一個 `employeeById` 函式，可以讓你存取公司員工的資料庫。不幸的是，此函式回傳 `Employee?` 型別的值，因此結果可能是 `null`。你的目標是撰寫一個函式，在提供員工的 `id` 時回傳該員工的薪水，如果資料庫中找不到該員工，則回傳 `0`。

```kotlin
data class Employee (val name: String, var salary: Int)

fun employeeById(id: Int) = when(id) {
    1 -> Employee("Mary", 20)
    2 -> null
    3 -> Employee("John", 21)
    4 -> Employee("Ann", 23)
    else -> null
}

fun salaryById(id: Int): Int = TODO() // Write your code here

fun main() {
    println((1..5).sumOf { id -> salaryById(id) })
}
```
{kotlin-runnable="true" kotlin-target-platform="exercise" kotlin-hidden-files="ExerciseUtils.kt,tour/basics/SalaryByIdTest.kt" validate="false" id="kotlin-tour-null-safety-exercise"}

```kotlin
data class Employee (val name: String, var salary: Int)

fun employeeById(id: Int) = when(id) {
    1 -> Employee("Mary", 20)
    2 -> null
    3 -> Employee("John", 21)
    4 -> Employee("Ann", 23)
    else -> null
}

fun salaryById(id: Int): Int = employeeById(id)?.salary ?: 0

fun main() {
    println((1..5).sumOf { id -> salaryById(id) })
}
```
{kotlin-runnable="true" kotlin-target-platform="exercise" kotlin-hidden-files="ExerciseUtils.kt,tour/basics/SalaryByIdTest.kt" initial-collapse-state="collapsed" collapsible="true" collapsed-title="範例解法" id="kotlin-tour-null-safety-solution"}

</def>
</deflist>

## 下一步？ {id="what-s-next"}

恭喜！現在你已經完成了初學者導覽，透過我們為你準備的中級導覽，讓你的 Kotlin 知識更上一層樓：

<seealso></seealso>

<list columns="2" id="tour-nav">
  <li>
    <a as="button" href="kotlin-tour-classes.md" mode="outline" icon="arrow-left" icon-position="left">上一步</a>
  </li>
  <li>
    <a as="button" href="kotlin-tour-intermediate-extension-functions.md" mode="classic" icon="arrow-right" icon-position="right">開始中級 Kotlin 導覽</a>
  </li>
</list>