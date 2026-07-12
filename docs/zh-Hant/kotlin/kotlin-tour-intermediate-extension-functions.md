[//]: # (title: 擴充函式)

<no-index/>

在本章中，你將探索特殊的 Kotlin 函式，它們能讓你的程式碼更簡潔且易讀。了解它們如何幫助你使用高效的設計模式，將你的專案提升到新的境界。

## 擴充函式

在軟體開發中，你經常需要在不更改原始原始碼的情況下修改程式的行為。例如，你可能想為來自第三方程式庫的類別添加額外功能。

你可以透過添加「擴充函式（extension functions）」來擴充類別。呼叫擴充函式的方式與呼叫類別的成員函式相同，都是使用句點 `.`。

在介紹擴充函式的完整語法之前，你需要了解什麼是**接收者（receiver）**。接收者是該函式被呼叫的對象。換句話說，接收者是資訊共享的地方或對象。

![發送者與接收者的範例](receiver-highlight.png){width="500"}

在此範例中，`main()` 函式呼叫 [`.first()`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.collections/first.html) 函式來傳回清單中的第一個元素。`.first()` 函式是在 `readOnlyShapes` 變數**上**呼叫的，因此 `readOnlyShapes` 變數就是接收者。

要建立擴充函式，請寫下你想要擴充的類別名稱，後跟一個 `.` 和你的函式名稱。接著完成函式宣告的其餘部分，包括其參數和傳回型別。

例如：

```kotlin
fun String.bold(): String = "<b>$this</b>"

fun main() {
    // "hello" 是接收者
    println("hello".bold())
    // <b>hello</b>
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3" id="kotlin-tour-extension-function"}

在此範例中：

* `String` 是被擴充的類別。
* `bold` 是擴充函式的名稱。 
* `.bold()` 擴充函式的傳回型別是 `String`。
* `"hello"` 作為 `String` 的執行個體，即為接收者。
* 在主體內部透過 [關鍵字](keyword-reference.md)：`this` 存取接收者。
* 使用字串範本（String template）來存取 `this` 的值。
* `.bold()` 擴充函式接收一個字串，並將其傳回為用於粗體文字的 `<b>` HTML 元素中。

## 以擴充為導向的設計

你可以在任何地方定義擴充函式，這讓你能建立以擴充為導向的設計。這些設計將核心功能與有用但非必要的特性分開，使你的程式碼更容易閱讀和維護。

一個很好的例子是 Ktor 程式庫中的 [`HttpClient`](https://api.ktor.io/ktor-client-core/io.ktor.client/-http-client/index.html) 類別，它用於執行網路請求。其功能的核心是單一函式 `request()`，它接收 HTTP 請求所需的所有資訊：

```kotlin
class HttpClient {
    fun request(method: String, url: String, headers: Map<String, String>): HttpResponse {
        // 網路程式碼
    }
}
```
{validate="false"}

在實務上，最受歡迎的 HTTP 請求是 GET 或 POST 請求。對於程式庫來說，為這些常見的使用案例提供較短的名稱是有意義的。然而，這些並不需要編寫新的網路程式碼，只需要特定的請求呼叫。換句話說，它們是定義為獨立 `.get()` 和 `.post()` 擴充函式的完美候選者：

```kotlin
fun HttpClient.get(url: String): HttpResponse = request("GET", url, emptyMap())
fun HttpClient.post(url: String): HttpResponse = request("POST", url, emptyMap())
```
{validate="false"}

這些 `.get()` 和 `.post()` 函式擴充了 `HttpClient` 類別。它們可以直接使用 `HttpClient` 類別中的 `request()` 函式，因為它們是在 `HttpClient` 類別的執行個體（作為接收者）上呼叫的。你可以使用這些擴充函式來搭配適當的 HTTP 方法呼叫 `request()` 函式，這簡化了你的程式碼並使其更易於理解：

```kotlin
class HttpClient {
    fun request(method: String, url: String, headers: Map<String, String>): HttpResponse {
        println("Requesting $method to $url with headers: $headers")
        return HttpResponse("Response from $url")
    }
}

fun HttpClient.get(url: String): HttpResponse = request("GET", url, emptyMap())

fun main() {
    val client = HttpClient()

    // 直接使用 request() 進行 GET 請求
    val getResponseWithMember = client.request("GET", "https://example.com", emptyMap())

    // 使用 get() 擴充函式進行 GET 請求
    // client 執行個體是接收者
    val getResponseWithExtension = client.get("https://example.com")
}
```
{validate="false"}

這種以擴充為導向的方法在 Kotlin 的[標準函式庫](https://kotlinlang.org/api/latest/jvm/stdlib/)和其他程式庫中被廣泛使用。例如，`String` 類別有許多[擴充函式](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin/-string/#extension-functions)來幫助你處理字串。

有關擴充函式的更多資訊，請參閱 [擴充](extensions.md)。

## 練習 {completion-point="true"}

### 練習 1 {initial-collapse-state="collapsed" collapsible="true" id="extension-functions-exercise-1"}

編寫一個名為 `isPositive` 的擴充函式，接收一個整數並檢查其是否為正數。

|---|---|
```kotlin
fun Int.// 在此處編寫你的程式碼

fun main() {
    println(1.isPositive())
    // true
}
```
{validate="false" kotlin-runnable="true" kotlin-min-compiler-version="1.3" id="kotlin-tour-extension-functions-exercise-1"}

|---|---|
```kotlin
fun Int.isPositive(): Boolean = this > 0

fun main() {
    println(1.isPositive())
    // true
}
```
{initial-collapse-state="collapsed" collapsible="true" collapsed-title="範例解答" id="kotlin-tour-extension-functions-solution-1"}

### 練習 2 {initial-collapse-state="collapsed" collapsible="true" id="extension-functions-exercise-2"}

編寫一個名為 `toLowercaseString` 的擴充函式，接收一個字串並傳回其小寫版本。

<deflist collapsible="true">
    <def title="提示">
        對於 <code>String</code> 型別使用 <a href="https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.text/lowercase.html"> <code>.lowercase()</code>
        </a> 函式。 
    </def>
</deflist>

|---|---|
```kotlin
fun // 在此處編寫你的程式碼

fun main() {
    println("Hello World!".toLowercaseString())
    // hello world!
}
```
{validate="false" kotlin-runnable="true" kotlin-min-compiler-version="1.3" id="kotlin-tour-extension-functions-exercise-2"}

|---|---|
```kotlin
fun String.toLowercaseString(): String = this.lowercase()

fun main() {
    println("Hello World!".toLowercaseString())
    // hello world!
}
```
{initial-collapse-state="collapsed" collapsible="true" collapsed-title="範例解答" id="kotlin-tour-extension-functions-solution-2"}

<seealso></seealso>

<list columns="2" id="tour-nav">
  <li>
    <a as="button" href="kotlin-tour-null-safety.md" mode="outline" icon="arrow-left" icon-position="left">上一步</a>
  </li>
  <li>
    <a as="button" href="kotlin-tour-intermediate-scope-functions.md" mode="classic" icon="arrow-right" icon-position="right">下一步</a>
  </li>
</list>