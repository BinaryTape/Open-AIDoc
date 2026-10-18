[//]: # (title: 空值安全 (Null safety))

<no-index/>

在 Kotlin 中，變數是有可能包含 `null` 值的。當某些內容遺失或尚未設定時，Kotlin 就會使用 `null` 值。
在[集合](kotlin-tour-collections.md#kotlin-tour-map-no-key)章節中，
當你嘗試使用 Map 中不存在的鍵來存取鍵值組時，就已經看過 Kotlin 回傳 `null` 值的範例。雖然以這種方式使用
`null` 值很有用，但如果你的程式碼沒有做好處理它們的準備，就可能會遇到問題。

為了協助防止程式中出現與 `null` 值相關的問題，Kotlin 具備了空值安全 (Null safety) 機制。空值安全能在編譯期而非執行階段偵測到與 `null` 值相關的潛在問題。

空值安全是結合了多種功能的組合，讓你可以：

* 明確宣告程式中何時允許使用 `null` 值。
* 檢查 `null` 值。
* 對可能包含 `null` 值的屬性或函式使用安全呼叫。
* 宣告在偵測到 `null` 值時要採取的動作。

## 可為空的型別 (Nullable types) {id="nullable-types"}

Kotlin 支援可為空的型別，這讓宣告的型別有可能具有 `null` 值。預設情況下，型別是**不允許**接受 `null` 值的。可為空的型別是透過在型別宣告後明確加上 `?` 來宣告。

例如：

```kotlin
fun main() {
    // neverNull 具有 String 型別
    var neverNull: String = "This can't be null"

    // 擲出編譯器錯誤
    neverNull = null

    // nullable 具有可為空的 String 型別
    var nullable: String? = "You can keep a null here"

    // 這是可行的
    nullable = null

    // 預設情況下，不接受 null 值
    var inferredNonNull = "The compiler assumes non-nullable"

    // 擲出編譯器錯誤
    inferredNonNull = null

    // notNull 不接受 null 值
    fun strLength(notNull: String): Int {                 
        return notNull.length
    }

    println(strLength(neverNull)) // 18
    println(strLength(nullable))  // 擲出編譯器錯誤
}
```
{kotlin-runnable="true" validate="false" kotlin-min-compiler-version="1.3" id="kotlin-tour-nullable-type"}

> `length` 是 [String](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin/-string/) 類別的一個屬性，
> 包含字串內的字元數。
>
{style="tip"}

## 檢查 null 值 {id="check-for-null-values"}

你可以在條件運算式中檢查是否存在 `null` 值。在以下範例中，`describeString()`
函式包含一個 `if` 陳述式，用於檢查 `maybeString` 是否**不為** `null`，以及其 `length` 是否大於零：

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
{kotlin-runnable="true" kotlin-min-compiler-version="1.3" id="kotlin-tour-check-nulls"}

## 使用安全呼叫 {id="use-safe-calls"}

若要安全地存取可能包含 `null` 值的物件屬性，請使用安全呼叫運算子 `?.`。安全呼叫運算子會在物件本身或其存取的屬性之一為 `null` 時回傳 `null`。如果你希望避免因 `null` 值的存在而在程式碼中引發錯誤，這會非常有用。

在以下範例中，`lengthString()` 函式使用安全呼叫來回傳字串的長度或 `null`：

```kotlin
fun lengthString(maybeString: String?): Int? = maybeString?.length

fun main() { 
    val nullString: String? = null
    println(lengthString(nullString))
    // null
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3" id="kotlin-tour-safe-call-property"}

> 安全呼叫可以鏈式調用，因此如果物件的任何屬性包含 `null` 值，則會回傳 `null` 而不會擲出錯誤。例如：
> 
> ```kotlin
>   person.company?.address?.country
> ```
>
{style="tip"}

安全呼叫運算子也可以用來安全地呼叫擴充方法或成員函數。在這種情況下，會在呼叫函式之前執行 null 檢查。如果檢查偵測到 `null` 值，則會跳過呼叫並回傳 `null`。

在以下範例中，由於 `nullString` 為 `null`，因此跳過了 [`.uppercase()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.text/uppercase.html) 的呼叫，並回傳了 `null`：

```kotlin
fun main() {
    val nullString: String? = null
    println(nullString?.uppercase())
    // null
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3" id="kotlin-tour-safe-call-function"}

## 使用 Elvis 運算子 {id="use-elvis-operator"}

你可以使用 **Elvis 運算子** `?:` 來提供在偵測到 `null` 值時所要回傳的預設值。

在 Elvis 運算子的左側寫入應檢查是否為 `null` 值的內容。
在 Elvis 運算子的右側寫入如果偵測到 `null` 值時應回傳的內容。

在以下範例中，由於 `nullString` 為 `null`，因此存取 `length` 屬性的安全呼叫會回傳 `null` 值。
結果，Elvis 運算子回傳了 `0`：

```kotlin
fun main() {
    val nullString: String? = null
    println(nullString?.length ?: 0)
    // 0
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3" id="kotlin-tour-elvis-operator"}

如需更多關於 Kotlin 空值安全的資訊，請參閱[空值安全 (Null safety)](null-safety.md)。

## 練習 {completion-point="true" id="practice"}

<deflist appearance="clear" collapsible="true">
<def title="計算員工薪資" id="null-safety-basics-exercise-1">

你有一個 `employeeById` 函式，可讓你存取公司的員工資料庫。遺憾的是，此函式回傳 `Employee?` 型別的值，因此結果可能是 `null`。你的目標是撰寫一個函式，在提供員工的 `id` 時回傳其薪資，如果資料庫中缺少該員工，則回傳 `0`。

```kotlin
data class Employee (val name: String, var salary: Int)

fun employeeById(id: Int) = when(id) {
    1 -> Employee("Mary", 20)
    2 -> null
    3 -> Employee("John", 21)
    4 -> Employee("Ann", 23)
    else -> null
}

fun salaryById(id: Int) = // 在此處撰寫你的程式碼

fun main() {
    println((1..5).sumOf { id -> salaryById(id) })
}
```
{validate="false" kotlin-runnable="true" kotlin-min-compiler-version="1.3" id="kotlin-tour-null-safety-exercise"}

```kotlin
data class Employee (val name: String, var salary: Int)

fun employeeById(id: Int) = when(id) {
    1 -> Employee("Mary", 20)
    2 -> null
    3 -> Employee("John", 21)
    4 -> Employee("Ann", 23)
    else -> null
}

fun salaryById(id: Int) = employeeById(id)?.salary ?: 0

fun main() {
    println((1..5).sumOf { id -> salaryById(id) })
}
```
{initial-collapse-state="collapsed" collapsible="true" collapsed-title="範例解答" id="kotlin-tour-null-safety-solution"}

</def>
</deflist>

## 下一步？ {id="what-s-next"}

恭喜！現在你已經完成了初學者導覽，透過我們的中級導覽，將你對 Kotlin 的理解提升到全新層次：

<seealso></seealso>

<list columns="2" id="tour-nav">
  <li>
    <a as="button" href="kotlin-tour-classes.md" mode="outline" icon="arrow-left" icon-position="left">上一步</a>
  </li>
  <li>
    <a as="button" href="kotlin-tour-intermediate-extension-functions.md" mode="classic" icon="arrow-right" icon-position="right">開始 Kotlin 中級導覽</a>
  </li>
</list>