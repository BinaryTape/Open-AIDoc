[//]: # (title: 空值安全)

<no-index/>

在 Kotlin 中，是有可能出現 `null` 值的。當某些內容缺失或尚未設定時，Kotlin 就會使用 `null` 值。
在[集合](kotlin-tour-collections.md#kotlin-tour-map-no-key)一章中，當你嘗試使用 map 中不存在的鍵來存取鍵值組時，就已經看過 Kotlin 回傳 `null` 值的範例。雖然以這種方式使用 `null` 值很有用，但如果你的程式碼沒有做好處理它們的準備，就可能會遇到問題。

為了防止程式中出現與 `null` 值相關的問題，Kotlin 具備了空值安全機制。空值安全可以在編譯期而非執行期偵測 `null` 值的潛在問題。

空值安全結合了一系列功能，讓你可以：

* 明確宣告程式中何時允許 `null` 值。
* 檢查 `null` 值。
* 對可能包含 `null` 值的屬性或函式使用安全呼叫。
* 宣告偵測到 `null` 值時所要採取的動作。

## 可為 null 的型別 {id="nullable-types"}

Kotlin 支援可為 null 的型別，允許宣告的型別具有 `null` 值的可能性。預設情況下，型別**不**允許接受 `null` 值。在型別宣告後明確加上 `?` 即可宣告可為 null 的型別。

例如：

```kotlin
fun main() {
    // neverNull 為 String 型別
    var neverNull: String = "This can't be null"

    // 拋出編譯器錯誤
    neverNull = null

    // nullable 為可為 null 的 String 型別
    var nullable: String? = "You can keep a null here"

    // 這沒問題
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
{kotlin-runnable="true" validate="false" kotlin-min-compiler-version="1.3" id="kotlin-tour-nullable-type"}

> `length` 是 [String](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin/-string/) 類別的一個屬性，包含字串中的字元數。
>
{style="tip"}

## 檢查 null 值 {id="check-for-null-values"}

你可以在條件運算式中檢查是否存在 `null` 值。在以下範例中，`describeString()` 函式包含一個 `if` 陳述式，用於檢查 `maybeString` 是否**不為** `null`，以及其 `length` 是否大於零：

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

若要安全存取可能包含 `null` 值的物件屬性，請使用安全呼叫運算子 `?.`。如果物件本身或其存取的屬性之一為 `null`，則安全呼叫運算子會回傳 `null`。如果你想避免程式碼因存在 `null` 值而觸發錯誤，這會非常有用。

在以下範例中，`lengthString()` 函式使用安全呼叫來回傳字串長度或 `null`：

```kotlin
fun lengthString(maybeString: String?): Int? = maybeString?.length

fun main() { 
    val nullString: String? = null
    println(lengthString(nullString))
    // null
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3" id="kotlin-tour-safe-call-property"}

> 安全呼叫可以進行鏈式呼叫，因此如果物件的任何屬性包含 `null` 值，就會回傳 `null` 而不會拋出錯誤。例如：
> 
> ```kotlin
>   person.company?.address?.country
> ```
>
{style="tip"}

安全呼叫運算子也可以用來安全呼叫擴充函式或成員函式。在這種情況下，會在呼叫函式之前執行 null 檢查。如果檢查偵測到 `null` 值，則會跳過呼叫並回傳 `null`。

在以下範例中，`nullString` 為 `null`，因此會跳過對 [`.uppercase()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.text/uppercase.html) 的呼叫並回傳 `null`：

```kotlin
fun main() {
    val nullString: String? = null
    println(nullString?.uppercase())
    // null
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3" id="kotlin-tour-safe-call-function"}

## 使用 Elvis 運算子 {id="use-elvis-operator"}

你可以使用 **Elvis 運算子** `?:`，提供在偵測到 `null` 值時所要回傳的預設值。

在 Elvis 運算子的左側寫入應檢查是否為 `null` 值的項目。
在 Elvis 運算子的右側寫入偵測到 `null` 值時應回傳的內容。

在以下範例中，`nullString` 為 `null`，因此存取 `length` 屬性的安全呼叫會回傳 `null` 值。結果，Elvis 運算子回傳 `0`：

```kotlin
fun main() {
    val nullString: String? = null
    println(nullString?.length ?: 0)
    // 0
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3" id="kotlin-tour-elvis-operator"}

若要進一步了解 Kotlin 中的空值安全，請參閱[空值安全](null-safety.md)。

## 練習 {completion-point="true" id="practice"}

<deflist appearance="clear" collapsible="true">
<def title="計算員工的薪資">

你有一個 `employeeById` 函式，可用來存取公司的員工資料庫。不幸的是，該函式回傳 `Employee?` 型別的值，因此結果可能為 `null`。你的目標是撰寫一個函式，在提供員工 `id` 時回傳該員工的薪資，若資料庫中找不到該員工，則回傳 `0`。

```kotlin
data class Employee (val name: String, var salary: Int)

fun employeeById(id: Int) = when(id) {
    1 -> Employee("Mary", 20)
    2 -> null
    3 -> Employee("John", 21)
    4 -> Employee("Ann", 23)
    else -> null
}

fun salaryById(id: Int) = // 在此處編寫你的程式碼

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
{initial-collapse-state="collapsed" collapsible="true" collapsed-title="參考解答" id="kotlin-tour-null-safety-solution"}

</def>
</deflist>

## 下一步？ {id="what-s-next"}

恭喜！現在你已經完成了初學者導覽，透過我們為你準備的中階導覽，讓你的 Kotlin 知識更上一層樓：

<seealso></seealso>

<list columns="2" id="tour-nav">
  <li>
    <a as="button" href="kotlin-tour-classes.md" mode="outline" icon="arrow-left" icon-position="left">上一步</a>
  </li>
  <li>
    <a as="button" href="kotlin-tour-intermediate-extension-functions.md" mode="classic" icon="arrow-right" icon-position="right">開始 Kotlin 中階導覽</a>
  </li>
</list>