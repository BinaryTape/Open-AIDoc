[//]: # (title: 空值安全)

<no-index/>

在 Kotlin 中，變數是有可能包含 `null` 值的。當某些內容缺失或尚未設定時，Kotlin 會使用 `null` 值。
你已經在[集合](kotlin-tour-collections.md#kotlin-tour-map-no-key)章節看過 Kotlin 傳回 `null` 值的範例：當你嘗試使用 Map 中不存在的鍵（key）來存取鍵值對時。雖然以這種方式使用 `null` 值很有用，但如果你的程式碼沒有準備好處理它們，就可能會遇到問題。

為了協助防止程式中出現 `null` 值的相關問題，Kotlin 具備了空值安全（null safety）機制。空值安全會在編譯期（compile time）而非執行期（run time）偵測 `null` 值的潛在問題。

空值安全是多項特性的結合，讓你能夠：

* 明確宣告程式中何時允許 `null` 值。
* 執行 `null` 檢查。
* 對可能包含 `null` 值的屬性或函式使用安全呼叫（safe calls）。
* 宣告偵測到 `null` 值時應採取的動作。

## 可為 null 的型別

Kotlin 支援可為 null 的型別（nullable types），這讓宣告的型別有可能包含 `null` 值。預設情況下，型別是**不**允許接受 `null` 值的。可為 null 的型別是透過在型別宣告後明確加上 `?` 來宣告的。

例如：

```kotlin
fun main() {
    // neverNull has String type
    var neverNull: String = "This can't be null"

    // Throws a compiler error
    neverNull = null

    // nullable has nullable String type
    var nullable: String? = "You can keep a null here"

    // This is OK
    nullable = null

    // By default, null values aren't accepted
    var inferredNonNull = "The compiler assumes non-nullable"

    // Throws a compiler error
    inferredNonNull = null

    // notNull doesn't accept null values
    fun strLength(notNull: String): Int {                 
        return notNull.length
    }

    println(strLength(neverNull)) // 18
    println(strLength(nullable))  // Throws a compiler error
}
```
{kotlin-runnable="true" validate="false" kotlin-min-compiler-version="1.3" id="kotlin-tour-nullable-type"}

> `length` 是 [String](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin/-string/) 類別的一個屬性，包含字串中的字元數量。
>
{style="tip"}

## 執行 null 檢查

你可以在條件運算式中檢查是否存在 `null` 值。在以下範例中，`describeString()` 函式包含一個 `if` 陳述式，檢查 `maybeString` 是否**不**為 `null` 且其 `length` 是否大於零：

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

## 使用安全呼叫

要安全地存取可能包含 `null` 值的物件屬性，請使用安全呼叫運算子 `?.`。如果物件或其存取的屬性之一為 `null`，安全呼叫運算子會傳回 `null`。如果你想避免 `null` 值的出現導致程式碼觸發錯誤，這會非常有用。

在以下範例中，`lengthString()` 函式使用安全呼叫來傳回字串的長度或 `null`：

```kotlin
fun lengthString(maybeString: String?): Int? = maybeString?.length

fun main() { 
    val nullString: String? = null
    println(lengthString(nullString))
    // null
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3" id="kotlin-tour-safe-call-property"}

> 安全呼叫可以鏈結在一起，這樣如果物件的任何屬性包含 `null` 值，則會傳回 `null` 而不會拋出錯誤。例如：
> 
> ```kotlin
>   person.company?.address?.country
> ```
>
{style="tip"}

安全呼叫運算子也可以用來安全地呼叫擴充函式或成員函數。在這種情況下，會在呼叫函式之前執行 `null` 檢查。如果檢查偵測到 `null` 值，則會跳過該呼叫並傳回 `null`。

在以下範例中，`nullString` 為 `null`，因此跳過了 [`.uppercase()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.text/uppercase.html) 的調用並傳回 `null`：

```kotlin
fun main() {
    val nullString: String? = null
    println(nullString?.uppercase())
    // null
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3" id="kotlin-tour-safe-call-function"}

## 使用 Elvis 運算子

你可以使用 **Elvis 運算子** `?:` 來提供偵測到 `null` 值時要傳回的預設值。

在 Elvis 運算子的左側寫入應檢查是否為 `null` 值的內容。
在 Elvis 運算子的右側寫入偵測到 `null` 值時應傳回的內容。

在以下範例中，`nullString` 為 `null`，因此存取 `length` 屬性的安全呼叫會傳回 `null` 值。結果，Elvis 運算子傳回 `0`：

```kotlin
fun main() {
    val nullString: String? = null
    println(nullString?.length ?: 0)
    // 0
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3" id="kotlin-tour-elvis-operator"}

如需更多關於 Kotlin 中空值安全的資訊，請參閱[空值安全](null-safety.md)。

## 練習 {completion-point="true"}

### 練習 {initial-collapse-state="collapsed" collapsible="true"}

你有一個 `employeeById` 函式，可以讓你存取公司的員工資料庫。不幸的是，這個函式傳回 `Employee?` 型別的值，所以結果可能是 `null`。你的目標是撰寫一個函式，在提供員工的 `id` 時傳回其薪資（salary），或者如果資料庫中沒有該員工，則傳回 `0`。

|---|---|
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

|---|---|
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

## 下一步？

恭喜！現在你已經完成了初學者導覽，透過我們的進階導覽將你對 Kotlin 的理解提升到下一個層次：

<seealso></seealso>

<list columns="2" id="tour-nav">
  <li>
    <a as="button" href="kotlin-tour-classes.md" mode="outline" icon="arrow-left" icon-position="left">上一步</a>
  </li>
  <li>
    <a as="button" href="kotlin-tour-intermediate-extension-functions.md" mode="classic" icon="arrow-right" icon-position="right">開始 Kotlin 進階導覽</a>
  </li>
</list>