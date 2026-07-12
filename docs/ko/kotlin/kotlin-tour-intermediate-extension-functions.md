[//]: # (title: 확장 함수)

<no-index/>

이 장에서는 코드를 더 간결하고 읽기 쉽게 만들어 주는 특별한 Kotlin 함수를 살펴봅니다. 효율적인 디자인 패턴을 사용하여 프로젝트를 한 단계 더 발전시키는 방법을 배워보세요.

## 확장 함수 (Extension functions)

소프트웨어 개발에서는 원래 소스 코드를 수정하지 않고 프로그램의 동작을 변경해야 할 때가 많습니다. 예를 들어, 서드 파티 라이브러리의 클래스에 추가 기능을 더하고 싶은 경우가 이에 해당합니다.

이런 경우 클래스를 확장하기 위해 _확장 함수_를 추가할 수 있습니다. 확장 함수를 호출할 때는 클래스의 멤버 함수를 호출할 때와 마찬가지로 마침표 `.`를 사용합니다.

확장 함수의 전체 구문을 소개하기 전에 **수신 객체 (receiver)**가 무엇인지 이해해야 합니다.
수신 객체는 함수가 호출되는 대상입니다. 즉, 수신 객체는 정보가 공유되는 위치 또는 대상을 의미합니다.

![송신자와 수신자의 예시](receiver-highlight.png){width="500"}

이 예시에서 `main()` 함수는 리스트의 첫 번째 요소를 반환하기 위해 [`.first()`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.collections/first.html) 함수를 호출합니다.
`.first()` 함수는 `readOnlyShapes` 변수**에 대해** 호출되므로, `readOnlyShapes` 변수가 수신 객체입니다.

확장 함수를 만들려면 확장하려는 클래스 이름 뒤에 `.`과 함수 이름을 적습니다. 그 다음 매개변수와 반환 타입을 포함한 나머지 함수 선언을 작성합니다.

예를 들면 다음과 같습니다:

```kotlin
fun String.bold(): String = "<b>$this</b>"

fun main() {
    // "hello"가 수신 객체입니다
    println("hello".bold())
    // <b>hello</b>
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3" id="kotlin-tour-extension-function"}

이 예시에서:

* `String`은 확장된 클래스입니다.
* `bold`는 확장 함수의 이름입니다. 
* `.bold()` 확장 함수의 반환 타입은 `String`입니다.
* `String`의 인스턴스인 `"hello"`가 수신 객체입니다.
* 함수 본문 내부에서는 [키워드](keyword-reference.md) `this`를 통해 수신 객체에 접근합니다.
* 문자열 템플릿(`$this`)을 사용하여 `this`의 값에 접근합니다.
* `.bold()` 확장 함수는 문자열을 받아 굵은 텍스트를 위한 `<b>` HTML 요소로 감싸서 반환합니다.

## 확장 지향 설계 (Extension-oriented design)

확장 함수는 어디서나 정의할 수 있으므로 확장 지향 설계를 가능하게 합니다. 이러한 설계는 핵심 기능과 유용하지만 필수적이지 않은 기능을 분리하여 코드를 더 읽기 쉽고 유지보수하기 편하게 만듭니다.

좋은 예로 네트워크 요청을 도와주는 Ktor 라이브러리의 [`HttpClient`](https://api.ktor.io/ktor-client-core/io.ktor.client/-http-client/index.html) 클래스가 있습니다. 이 클래스 기능의 핵심은 HTTP 요청에 필요한 모든 정보를 받는 단일 함수 `request()`입니다.

```kotlin
class HttpClient {
    fun request(method: String, url: String, headers: Map<String, String>): HttpResponse {
        // 네트워크 코드
    }
}
```
{validate="false"}

실제로 가장 많이 쓰이는 HTTP 요청은 GET 또는 POST 요청입니다. 라이브러리에서 이러한 일반적인 사용 사례에 대해 더 짧은 이름을 제공하는 것이 합리적입니다. 하지만 이 기능들을 위해 새로운 네트워크 코드를 작성할 필요는 없으며, 특정 요청 호출만 수행하면 됩니다. 즉, 이들은 별도의 `.get()` 및 `.post()` 확장 함수로 정의하기에 완벽한 후보입니다.

```kotlin
fun HttpClient.get(url: String): HttpResponse = request("GET", url, emptyMap())
fun HttpClient.post(url: String): HttpResponse = request("POST", url, emptyMap())
```
{validate="false"}

이 `.get()` 및 `.post()` 함수는 `HttpClient` 클래스를 확장합니다. 이 함수들은 `HttpClient` 클래스의 인스턴스를 수신 객체로 하여 호출되므로 `HttpClient` 클래스의 `request()` 함수를 직접 사용할 수 있습니다. 이러한 확장 함수를 사용하여 적절한 HTTP 메서드와 함께 `request()` 함수를 호출하면 코드가 단순해지고 이해하기 쉬워집니다.

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

    // request()를 직접 사용하여 GET 요청 만들기
    val getResponseWithMember = client.request("GET", "https://example.com", emptyMap())

    // get() 확장 함수를 사용하여 GET 요청 만들기
    // client 인스턴스가 수신 객체입니다
    val getResponseWithExtension = client.get("https://example.com")
}
```
{validate="false"}

이러한 확장 지향 방식은 Kotlin [표준 라이브러리](https://kotlinlang.org/api/latest/jvm/stdlib/) 및 기타 라이브러리에서 널리 사용됩니다. 예를 들어, `String` 클래스에는 문자열 작업을 도와주는 수많은 [확장 함수](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin/-string/#extension-functions)가 있습니다.

확장 함수에 대한 자세한 정보는 [확장(Extensions)](extensions.md)을 참조하세요.

## 연습 문제 {completion-point="true"}

### 연습 문제 1 {initial-collapse-state="collapsed" collapsible="true" id="extension-functions-exercise-1"}

정수를 받아 양수인지 확인하는 `isPositive`라는 확장 함수를 작성하세요.

|---|---|
```kotlin
fun Int.// 코드를 여기에 작성하세요

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
{initial-collapse-state="collapsed" collapsible="true" collapsed-title="모범 답안" id="kotlin-tour-extension-functions-solution-1"}

### 연습 문제 2 {initial-collapse-state="collapsed" collapsible="true" id="extension-functions-exercise-2"}

문자열을 받아 소문자 버전으로 반환하는 `toLowercaseString`이라는 확장 함수를 작성하세요.

<deflist collapsible="true">
    <def title="힌트">
        <code>String</code> 타입에 대해 <a href="https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.text/lowercase.html"> <code>.lowercase()</code>
        </a> 함수를 사용하세요. 
    </def>
</deflist>

|---|---|
```kotlin
fun // 코드를 여기에 작성하세요

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
{initial-collapse-state="collapsed" collapsible="true" collapsed-title="모범 답안" id="kotlin-tour-extension-functions-solution-2"}

<seealso></seealso>

<list columns="2" id="tour-nav">
  <li>
    <a as="button" href="kotlin-tour-null-safety.md" mode="outline" icon="arrow-left" icon-position="left">이전 단계</a>
  </li>
  <li>
    <a as="button" href="kotlin-tour-intermediate-scope-functions.md" mode="classic" icon="arrow-right" icon-position="right">다음 단계</a>
  </li>
</list>