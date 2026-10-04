[//]: # (title: 擴充函式)

<no-index/>

在本章中，你將探索特殊的 Kotlin 函式，它們能讓你的程式碼更加簡潔且易讀。了解它們如何協助你運用高效的設計模式，將你的專案提升到全新層次。

## 擴充函式 {id="extension-functions"}

在軟體開發中，你經常需要在不修改原始碼的情況下變更程式的行為。例如，你可能想為來自第三方程式庫的類別新增額外的功能性。

你可以透過新增*擴充函式*來擴充類別。呼叫擴充函式的方式與呼叫類別的成員函數相同，都是使用句點 `.`。

在介紹擴充函式的完整語法之前，你需要了解什麼是**接收者 (receiver)**。接收者是該函式被呼叫的目標物件。換句話說，接收者是資訊共享的對象或位置。

![發送者與接收者的範例](receiver-highlight.png){width="500"}

在此範例中，`main()` 函式呼叫了 [`.first()`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.collections/first.html) 函式來傳回清單中的第一個元素。`.first()` 函式是在 `readOnlyShapes` 變數**上**呼叫的，因此 `readOnlyShapes` 變數就是接收者。

若要建立擴充函式，請寫下你想要擴充的類別名稱，後接一個 `.` 以及你的函式名稱。接著完成函式宣告的其餘部分，包括其參數和傳回型別。

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
* `"hello"` 是 `String` 的執行個體，作為接收者。
* 在主體內部，可透過[關鍵字](keyword-reference.md) `this` 存取接收者。
* 使用字串範本 (`$`) 來存取 `this` 的值。
* `.bold()` 擴充函式接受一個字串，並將其包裝在用於粗體文字的 `<b>` HTML 元素中傳回。

## 擴充導向設計 {id="extension-oriented-design"}

你可以在任何地方定義擴充函式，這讓你能建構擴充導向的設計。這些設計將核心功能性與實用但非必要的特性分離，使你的程式碼更容易閱讀和維護。

一個很好的例子是來自 Ktor 程式庫的 [`HttpClient`](https://api.ktor.io/ktor-client-core/io.ktor.client/-http-client/index.html) 類別，它有助於執行網路請求。其功能性的核心是一個單一函式 `request()`，它接受 HTTP 請求所需的所有資訊：

```kotlin
class HttpClient {
    fun request(method: String, url: String, headers: Map<String, String>): HttpResponse {
        // 網路程式碼
    }
}
```
{validate="false"}

實際上，最常用的 HTTP 請求是 GET 或 POST 請求。程式庫為這些常見的使用案例提供更簡短的名稱是合理的做法。然而，這些不需要撰寫新的網路程式碼，只需要特定的請求呼叫。換句話說，它們非常適合定義為獨立的 `.get()` 和 `.post()` 擴充函式：

```kotlin
fun HttpClient.get(url: String): HttpResponse = request("GET", url, emptyMap())
fun HttpClient.post(url: String): HttpResponse = request("POST", url, emptyMap())
```
{validate="false"}

這些 `.get()` 與 `.post()` 函式擴充了 `HttpClient` 類別。它們可以直接使用 `HttpClient` 類別中的 `request()` 函式，因為它們是以 `HttpClient` 類別的執行個體作為接收者被呼叫的。你可以使用這些擴充函式來以適當的 HTTP 方法呼叫 `request()` 函式，這簡化了你的程式碼並使其更容易理解：

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

    // 直接使用 request() 發出 GET 請求
    val getResponseWithMember = client.request("GET", "https://example.com", emptyMap())

    // 使用 get() 擴充函式發出 GET 請求
    // client 執行個體即為接收者
    val getResponseWithExtension = client.get("https://example.com")
}
```
{validate="false"}

這種擴充導向的方法在 Kotlin 的[標準程式庫](https://kotlinlang.org/api/latest/jvm/stdlib/)和其他程式庫中被廣泛使用。例如，`String` 類別擁有許多[擴充函式](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin/-string/#extension-functions)，以協助你處理字串。

若要進一步了解擴充函式，請參閱[擴充](extensions.md)。

## 練習 {completion-point="true" id="practice"}

<deflist appearance="clear" collapsible="true" numbered="true">
<def title="檢查整數是否為正數" id="extension-functions-exercise-1">

撰寫一個名為 `isPositive` 的擴充函式，接受一個整數並檢查它是否為正數。

```kotlin
fun Int.// 在此處撰寫你的程式碼

fun main() {
    println(1.isPositive())
    // true
}
```
{validate="false" kotlin-runnable="true" kotlin-min-compiler-version="1.3" id="kotlin-tour-extension-functions-exercise-1"}

```kotlin
fun Int.isPositive(): Boolean = this > 0

fun main() {
    println(1.isPositive())
    // true
}
```
{initial-collapse-state="collapsed" collapsible="true" collapsed-title="參考解答" id="kotlin-tour-extension-functions-solution-1"}

</def>
<def title="將字串轉換為小寫" id="extension-functions-exercise-2">

撰寫一個名為 `toLowercaseString` 的擴充函式，接受一個字串並傳回其小寫版本。

<deflist collapsible="true">
    <def title="提示">
        使用 <code>String</code> 型別的 <a href="https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.text/lowercase.html"> <code>.lowercase()</code>
        </a> 函式。 
    </def>
</deflist>

```kotlin
fun // 在此處撰寫你的程式碼

fun main() {
    println("Hello World!".toLowercaseString())
    // hello world!
}
```
{validate="false" kotlin-runnable="true" kotlin-min-compiler-version="1.3" id="kotlin-tour-extension-functions-exercise-2"}

```kotlin
fun String.toLowercaseString(): String = this.lowercase()

fun main() {
    println("Hello World!".toLowercaseString())
    // hello world!
}
```
{initial-collapse-state="collapsed" collapsible="true" collapsed-title="參考解答" id="kotlin-tour-extension-functions-solution-2"}

</def>
</deflist>

<seealso></seealso>

<list columns="2" id="tour-nav">
  <li>
    <a as="button" href="kotlin-tour-null-safety.md" mode="outline" icon="arrow-left" icon-position="left">上一步</a>
  </li>
  <li>
    <a as="button" href="kotlin-tour-intermediate-scope-functions.md" mode="classic" icon="arrow-right" icon-position="right">下一步</a>
  </li>
</list>