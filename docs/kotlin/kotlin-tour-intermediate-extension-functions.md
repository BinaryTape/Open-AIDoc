[//]: # (title: 扩展函数)

<no-index/>

在本章中，你将探索特殊的 Kotlin 函数，它们能让你的代码更加简洁易读。了解它们如何帮助你使用高效的设计模式，从而将你的项目提升到新的水平。

## 扩展函数

在软件开发中，你经常需要修改程序的行为而无需更改原始源代码。例如，你可能想为来自第三方库的类添加额外的功能。

你可以通过添加 *扩展函数* 来扩展一个类。调用扩展函数的方式与调用类的成员函数相同，即使用句点 `.`。

在介绍扩展函数的完整语法之前，你需要了解什么是**接收者** (receiver)。
接收者是调用该函数的对象。换句话说，接收者是信息共享的源头或对象。

![发送者与接收者示例](receiver-highlight.png){width="500"}

在这个例子中，`main()` 函数调用了 [`.first()`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.collections/first.html) 函数来返回列表中的第一个元素。
`.first()` 函数是在 `readOnlyShapes` 变量**上**调用的，因此 `readOnlyShapes` 变量就是接收者。

要创建一个扩展函数，请先写出你想要扩展的类名，后跟 `.` 和你的函数名。接着完成函数声明的其余部分，包括其形参和返回值类型。

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

在这个例子中：

* `String` 是被扩展的类。
* `bold` 是扩展函数的名称。 
* `.bold()` 扩展函数的返回值类型是 `String`。
* `"hello"` 是 `String` 的一个实例，作为接收者。
* 在函数体内通过 [关键字](keyword-reference.md) `this` 访问接收者。
* 使用字符串模板 (`$this`) 来访问 `this` 的值。
* `.bold()` 扩展函数接收一个字符串，并将其包装在用于加粗文本的 `<b>` HTML 元素中返回。

## 面向扩展的设计

你可以在任何地方定义扩展函数，这使你能够创建面向扩展的设计。这些设计将核心功能与有用但非必需的特性分开，使你的代码更易于阅读和维护。

一个很好的例子是来自 Ktor 库的 [`HttpClient`](https://api.ktor.io/ktor-client-core/io.ktor.client/-http-client/index.html) 类，它用于执行网络请求。其核心功能是一个单一的函数 `request()`，它接收 HTTP 请求所需的所有信息：

```kotlin
class HttpClient {
    fun request(method: String, url: String, headers: Map<String, String>): HttpResponse {
        // 网络代码
    }
}
```
{validate="false"}

在实践中，最常用的 HTTP 请求是 GET 或 POST 请求。库为这些常见的用例提供更简短的名称是有意义的。但是，这些并不需要编写新的网络代码，只需要一个特定的请求调用。
换句话说，它们是定义为独立的 `.get()` 和 `.post()` 扩展函数的完美候选：

```kotlin
fun HttpClient.get(url: String): HttpResponse = request("GET", url, emptyMap())
fun HttpClient.post(url: String): HttpResponse = request("POST", url, emptyMap())
```
{validate="false"}

这些 `.get()` 和 `.post()` 函数扩展了 `HttpClient` 类。它们可以直接使用 `HttpClient` 类中的 `request()` 函数，因为它们是在 `HttpClient` 类的实例（作为接收者）上调用的。你可以使用这些扩展函数来通过适当的 HTTP 方法调用 `request()` 函数，这简化了你的代码并使其更易于理解：

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

这种面向扩展的方法在 Kotlin 的 [标准库](https://kotlinlang.org/api/latest/jvm/stdlib/) 和其他库中被广泛使用。例如，`String` 类有许多 [扩展函数](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin/-string/#extension-functions) 来帮助你处理字符串。

有关扩展函数的更多信息，请参阅 [扩展](extensions.md)。

## 练习 {completion-point="true"}

### 练习 1 {initial-collapse-state="collapsed" collapsible="true" id="extension-functions-exercise-1"}

编写一个名为 `isPositive` 的扩展函数，它接收一个整数并检查其是否为正数。

|---|---|
```kotlin
fun Int.// 在此处编写代码

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
{initial-collapse-state="collapsed" collapsible="true" collapsed-title="示例解法" id="kotlin-tour-extension-functions-solution-1"}

### 练习 2 {initial-collapse-state="collapsed" collapsible="true" id="extension-functions-exercise-2"}

编写一个名为 `toLowercaseString` 的扩展函数，它接收一个字符串并返回其小写版本。

<deflist collapsible="true">
    <def title="提示">
        对 <code>String</code> 类型使用 <a href="https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.text/lowercase.html"> <code>.lowercase()</code>
        </a> 函数。 
    </def>
</deflist>

|---|---|
```kotlin
fun // 在此处编写代码

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
{initial-collapse-state="collapsed" collapsible="true" collapsed-title="示例解法" id="kotlin-tour-extension-functions-solution-2"}

<seealso></seealso>

<list columns="2" id="tour-nav">
  <li>
    <a as="button" href="kotlin-tour-null-safety.md" mode="outline" icon="arrow-left" icon-position="left">上一步</a>
  </li>
  <li>
    <a as="button" href="kotlin-tour-intermediate-scope-functions.md" mode="classic" icon="arrow-right" icon-position="right">下一步</a>
  </li>
</list>