[//]: # (title: 扩展函数)

<no-index/>

在本章中，你将探索能够让代码更加简洁易读的 Kotlin 特殊函数。了解它们如何帮助你运用高效的设计模式，从而将你的项目提升到新高度。

## 扩展函数 {id="extension-functions"}

在软件开发中，通常需要在不修改原始源代码的情况下更改程序的行为。例如，你可能想要为第三方库中的类添加额外的功能性。

你可以通过添加_扩展函数_来扩展一个类。调用扩展函数的方式与调用类的成员函数相同，都是使用句点 `.`。

在介绍扩展函数的完整语法之前，需要先理解什么是**接收者 (receiver)**。接收者就是该函数所调用的对象。换句话说，接收者是信息共享的位置或对象。

![发送者与接收者示例](receiver-highlight.png){width="500"}

在此示例中，`main()` 函数调用 [`.first()`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.collections/first.html) 函数以返回列表中的第一个元素。`.first()` 函数是在 `readOnlyShapes` 变量**上**调用的，因此 `readOnlyShapes` 变量就是接收者。

若要创建扩展函数，请先编写要扩展的类的名称，紧接着写一个 `.` 以及函数的名称。然后继续完成函数声明的其余部分，包括其形参和返回值类型。

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

在此示例中：

* `String` 是被扩展的类。
* `bold` 是扩展函数的名称。
* `.bold()` 扩展函数的返回值类型为 `String`。
* `"hello"` 作为 `String` 的一个实例，是接收者。
* 在函数体内部，通过[关键字](keyword-reference.md) `this` 访问接收者。
* 使用字符串模板（`$`）来访问 `this` 的值。
* `.bold()` 扩展函数接收一个字符串，并将其包裹在用于粗体文本的 `<b>` HTML 元素中返回。

## 面向扩展的设计 {id="extension-oriented-design"}

你可以在任何位置定义扩展函数，这使你能够构建面向扩展的设计。这些设计将核心功能性与有用但非核心的功能分离开来，使代码更易于阅读和维护。

一个很好的例子是来自 Ktor 库的 [`HttpClient`](https://api.ktor.io/ktor-client-core/io.ktor.client/-http-client/index.html) 类，它用于执行网络请求。其核心功能性是一个单独的 `request()` 函数，用于接收 HTTP 请求所需的所有信息：

```kotlin
class HttpClient {
    fun request(method: String, url: String, headers: Map<String, String>): HttpResponse {
        // 网络代码
    }
}
```
{validate="false"}

在实践中，最常用的 HTTP 请求是 GET 或 POST 请求。该库为这些常见用例提供更简短的名称是很合理的。然而，这些并不需要编写新的网络代码，只需进行特定的请求调用。换句话说，它们非常适合被定义为独立的 `.get()` 和 `.post()` 扩展函数：

```kotlin
fun HttpClient.get(url: String): HttpResponse = request("GET", url, emptyMap())
fun HttpClient.post(url: String): HttpResponse = request("POST", url, emptyMap())
```
{validate="false"}

这些 `.get()` 和 `.post()` 函数扩展了 `HttpClient` 类。它们可以直接使用 `HttpClient` 类中的 `request()` 函数，因为它们是在作为接收者的 `HttpClient` 类实例上调用的。你可以使用这些扩展函数来通过相应的 HTTP 方法调用 `request()` 函数，从而简化代码并使其更易于理解：

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

    // 直接使用 request() 发起 GET 请求
    val getResponseWithMember = client.request("GET", "https://example.com", emptyMap())

    // 使用 get() 扩展函数发起 GET 请求
    // client 实例是接收者
    val getResponseWithExtension = client.get("https://example.com")
}
```
{validate="false"}

这种面向扩展的方法广泛应用于 Kotlin 的[标准库](https://kotlinlang.org/api/latest/jvm/stdlib/)及其他库中。例如，`String` 类具有许多[扩展函数](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin/-string/#extension-functions)，可帮助你处理字符串。

有关扩展函数的更多信息，请参阅[扩展](extensions.md)。

## 练习 {completion-point="true" id="practice"}

<deflist appearance="clear" collapsible="true" numbered="true">
<def title="检查整数是否为正数" id="extension-functions-exercise-1">

编写一个名为 `isPositive` 的扩展函数，该函数接收一个整数并检查其是否为正数。

```kotlin
fun Int.// 在此处编写你的代码

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
{initial-collapse-state="collapsed" collapsible="true" collapsed-title="示例解决方案" id="kotlin-tour-extension-functions-solution-1"}

</def>
<def title="将字符串转换为小写" id="extension-functions-exercise-2">

编写一个名为 `toLowercaseString` 的扩展函数，该函数接收一个字符串并返回其小写版本。

<deflist collapsible="true">
    <def title="提示">
        针对 <code>String</code> 类型使用 <a href="https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.text/lowercase.html"> <code>.lowercase()</code>
        </a> 函数。 
    </def>
</deflist>

```kotlin
fun // 在此处编写你的代码

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
{initial-collapse-state="collapsed" collapsible="true" collapsed-title="示例解决方案" id="kotlin-tour-extension-functions-solution-2"}

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