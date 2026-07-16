[//]: # (title: 중급: 범위 지정 함수(Scope functions))

<no-index/>

<tldr>
    <p><img src="icon-1-done.svg" width="20" alt="First step" /> <a href="kotlin-tour-intermediate-extension-functions.md">확장 함수</a><br />
        <img src="icon-2.svg" width="20" alt="Second step" /> <strong>범위 지정 함수</strong><br />
        <img src="icon-3-todo.svg" width="20" alt="Third step" /> <a href="kotlin-tour-intermediate-lambdas-receiver.md">수신 객체 지정 람다 식</a><br />
        <img src="icon-4-todo.svg" width="20" alt="Fourth step" /> <a href="kotlin-tour-intermediate-classes-interfaces.md">클래스와 인터페이스</a><br />
        <img src="icon-5-todo.svg" width="20" alt="Fifth step" /> <a href="kotlin-tour-intermediate-objects.md">객체(Objects)</a><br />
        <img src="icon-6-todo.svg" width="20" alt="Sixth step" /> <a href="kotlin-tour-intermediate-open-special-classes.md">Open 클래스와 특수 클래스</a><br />
        <img src="icon-7-todo.svg" width="20" alt="Seventh step" /> <a href="kotlin-tour-intermediate-properties.md">프로퍼티</a><br />
        <img src="icon-8-todo.svg" width="20" alt="Eighth step" /> <a href="kotlin-tour-intermediate-null-safety.md">널 안정성</a><br />
        <img src="icon-9-todo.svg" width="20" alt="Ninth step" /> <a href="kotlin-tour-intermediate-libraries-and-apis.md">라이브러리와 API</a></p>
</tldr>

이 장에서는 확장 함수에 대한 이해를 바탕으로, 더 관용적인(idiomatic) 코드를 작성하기 위해 범위 지정 함수(Scope functions)를 사용하는 방법을 알아봅니다.

## 범위 지정 함수 (Scope functions)

프로그래밍에서 범위(Scope)란 변수나 객체가 인식되는 영역을 말합니다. 가장 흔히 언급되는 범위는 전역 범위(Global scope)와 지역 범위(Local scope)입니다.

* **전역 범위(Global scope)** – 프로그램의 어느 곳에서나 접근할 수 있는 변수나 객체입니다.
* **지역 범위(Local scope)** – 변수나 객체가 정의된 블록이나 함수 내부에서만 접근할 수 있는 경우입니다.

코틀린에는 객체 주변에 임시 범위를 생성하고 코드를 실행할 수 있게 해주는 범위 지정 함수도 있습니다.

범위 지정 함수를 사용하면 임시 범위 내에서 객체의 이름을 매번 참조할 필요가 없으므로 코드가 더 간결해집니다. 범위 지정 함수에 따라 키워드 `this`를 통해 객체에 접근하거나, 키워드 `it`을 통해 인자로 접근할 수 있습니다.

코틀린에는 총 5가지의 범위 지정 함수가 있습니다: `let`, `apply`, `run`, `also`, `with`.

각 범위 지정 함수는 람다 식을 인자로 받으며, 객체 자체를 반환하거나 람다 식의 결과를 반환합니다. 이 튜토리얼에서는 각 범위 지정 함수와 사용법에 대해 설명합니다.

> 코틀린 디벨로퍼 애드버킷인 Sebastian Aigner의 범위 지정 함수에 관한 발표 [Back to the Stdlib: Making the Most of Kotlin's Standard Library](https://youtu.be/DdvgvSHrN9g?feature=shared&t=1511)를 시청할 수도 있습니다.
> 
{style="tip"}

### Let

코드에서 널 체크를 수행하고, 나중에 반환된 객체로 추가 작업을 수행하려는 경우 `let` 범위 지정 함수를 사용하세요.

다음 예제를 살펴보겠습니다:

```kotlin
fun sendNotification(recipientAddress: String): String {
    println("Yo $recipientAddress!")
    return "Notification sent!"
}

fun getNextAddress(): String {
    return "sebastian@jetbrains.com"
}

fun main() {
    val address: String? = getNextAddress()
    sendNotification(address)
}
```
{validate = "false"}

이 예제에는 두 개의 함수가 있습니다:
* `sendNotification()`: 함수 파라미터 `recipientAddress`를 가지며 문자열을 반환합니다.
* `getNextAddress()`: 함수 파라미터가 없으며 문자열을 반환합니다.

이 예제는 nullable `String` 타입을 가진 `address` 변수를 생성합니다. 하지만 `sendNotification()` 함수를 호출할 때 문제가 발생합니다. 이 함수는 `address`가 `null` 값일 수 있다는 것을 기대하지 않기 때문입니다. 결과적으로 컴파일러는 오류를 보고합니다:

```text
Argument type mismatch: actual type is 'String?', but 'String' was expected.
```

초급 튜토리얼에서 이미 if 조건문으로 널 체크를 하거나 [엘비스 연산자 `?:`](kotlin-tour-null-safety.md#use-elvis-operator)를 사용하는 방법을 배웠습니다. 하지만 나중에 코드에서 반환된 객체를 사용하고 싶다면 어떻게 해야 할까요? if 조건문과 else 분기를 사용하여 이를 달성할 수 있습니다:

```kotlin
fun sendNotification(recipientAddress: String): String {
    println("Yo $recipientAddress!")
    return "Notification sent!"
}

fun getNextAddress(): String {
    return "sebastian@jetbrains.com"
}

fun main() { 
    //sampleStart
    val address: String? = getNextAddress()
    val confirm = if(address != null) {
        sendNotification(address)
    } else { null }
    //sampleEnd
}
```
{kotlin-runnable="true" id="kotlin-tour-scope-function-let-non-null-if"}

그러나 더 간결한 접근 방식은 `let` 범위 지정 함수를 사용하는 것입니다:

```kotlin
fun sendNotification(recipientAddress: String): String {
    println("Yo $recipientAddress!")
    return "Notification sent!"
}

fun getNextAddress(): String {
    return "sebastian@jetbrains.com"
}

fun main() {
    //sampleStart
    val address: String? = getNextAddress()
    val confirm = address?.let {
        sendNotification(it)
    }
    //sampleEnd
}
```
{kotlin-runnable="true" id="kotlin-tour-scope-function-let-non-null"}

이 예제는 다음과 같습니다:
* `address`와 `confirm`이라는 변수를 생성합니다.
* `address` 변수에 대해 `let` 범위 지정 함수를 안전한 호출(safe call)로 사용합니다.
* `let` 범위 지정 함수 내에 임시 범위를 생성합니다.
* `sendNotification()` 함수를 `let` 범위 지정 함수에 람다 식으로 전달합니다.
* 임시 범위를 사용하여 `it`을 통해 `address` 변수를 참조합니다.
* 결과를 `confirm` 변수에 할당합니다.

이 방식을 사용하면 코드가 `address` 변수가 `null` 값일 가능성을 처리할 수 있으며, 나중에 코드에서 `confirm` 변수를 사용할 수 있습니다.

### Apply

객체를 생성할 때 나중에가 아니라 생성 즉시 클래스 인스턴스와 같은 객체를 초기화하려면 `apply` 범위 지정 함수를 사용하세요. 이 방식은 코드를 더 읽기 쉽고 관리하기 편하게 만들어 줍니다.

다음 예제를 살펴보겠습니다:

```kotlin
class Client() {
    var token: String? = null
    fun connect() = println("connected!")
    fun authenticate() = println("authenticated!")
    fun getData() : String {
        println("getting data!")
        return "Mock data"
    }
}

val client = Client()

fun main() {
    client.token = "asdf"
    client.connect()
    // connected!
    client.authenticate()
    // authenticated!
    client.getData()
    // getting data!
}
```
{kotlin-runnable="true" id="kotlin-tour-scope-function-apply-before"}

이 예제에는 `token`이라는 프로퍼티 하나와 `connect()`, `authenticate()`, `getData()`라는 세 개의 멤버 함수가 포함된 `Client` 클래스가 있습니다.

이 예제는 `main()` 함수에서 `token` 프로퍼티를 초기화하고 멤버 함수를 호출하기 전에 `client`를 `Client` 클래스의 인스턴스로 생성합니다.

이 예제는 간단하지만, 실제 환경에서는 클래스 인스턴스를 생성한 후 이를 설정하고 멤버 함수를 사용하기까지 시간이 걸릴 수 있습니다. 하지만 `apply` 범위 지정 함수를 사용하면 코드의 한 곳에서 클래스 인스턴스를 생성, 설정 및 멤버 함수 사용을 모두 수행할 수 있습니다:

```kotlin
class Client() {
    var token: String? = null
    fun connect() = println("connected!")
    fun authenticate() = println("authenticated!")
    fun getData() : String {
        println("getting data!")
        return "Mock data"
    }
}
//sampleStart
val client = Client().apply {
    token = "asdf"
    connect()
    // connected!
    authenticate()
    // authenticated!
}

fun main() {
    client.getData()
    // getting data!
}
//sampleEnd
```
{kotlin-runnable="true" id="kotlin-tour-scope-function-apply-after"}

이 예제는 다음과 같습니다:

* `client`를 `Client` 클래스의 인스턴스로 생성합니다.
* `client` 인스턴스에 `apply` 범위 지정 함수를 사용합니다.
* `apply` 범위 지정 함수 내에 임시 범위를 생성하여, 프로퍼티나 함수에 접근할 때 `client` 인스턴스를 명시적으로 참조할 필요가 없도록 합니다.
* `token` 프로퍼티를 업데이트하고 `connect()` 및 `authenticate()` 함수를 호출하는 람다 식을 `apply` 범위 지정 함수에 전달합니다.
* `main()` 함수에서 `client` 인스턴스의 `getData()` 멤버 함수를 호출합니다.

보시다시피, 이 전략은 대규모 코드를 작업할 때 편리합니다.

### Run

`apply`와 유사하게 `run` 범위 지정 함수를 사용하여 객체를 초기화할 수 있지만, 코드의 특정 시점에서 객체를 초기화**하고** 즉시 결과를 계산하려는 경우에는 `run`을 사용하는 것이 더 좋습니다.

`apply` 함수의 이전 예제를 이어서 진행해 보겠습니다. 이번에는 `connect()`와 `authenticate()` 함수가 모든 요청 시에 함께 호출되도록 그룹화하고 싶다고 가정해 봅시다.

예를 들면 다음과 같습니다:

```kotlin
class Client() {
    var token: String? = null
    fun connect() = println("connected!")
    fun authenticate() = println("authenticated!")
    fun getData() : String {
        println("getting data!")
        return "Mock data"
    }
}

//sampleStart
val client: Client = Client().apply {
    token = "asdf"
}

fun main() {
    val result: String = client.run {
        connect()
        // connected!
        authenticate()
        // authenticated!
        getData()
        // getting data!
    }
}
//sampleEnd
```
{kotlin-runnable="true" id="kotlin-tour-scope-function-run"}

이 예제는 다음과 같습니다:

* `client`를 `Client` 클래스의 인스턴스로 생성합니다.
* `client` 인스턴스에 `apply` 범위 지정 함수를 사용합니다.
* `apply` 범위 지정 함수 내에 임시 범위를 생성하여, 프로퍼티나 함수에 접근할 때 `client` 인스턴스를 명시적으로 참조할 필요가 없도록 합니다.
* `token` 프로퍼티를 업데이트하는 람다 식을 `apply` 범위 지정 함수에 전달합니다.

`main()` 함수는 다음과 같습니다:

* `String` 타입의 `result` 변수를 생성합니다.
* `client` 인스턴스에 `run` 범위 지정 함수를 사용합니다.
* `run` 범위 지정 함수 내에 임시 범위를 생성하여, 프로퍼티나 함수에 접근할 때 `client` 인스턴스를 명시적으로 참조할 필요가 없도록 합니다.
* `connect()`, `authenticate()`, `getData()` 함수를 호출하는 람다 식을 `run` 범위 지정 함수에 전달합니다.
* 결과를 `result` 변수에 할당합니다.

이제 반환된 결과를 코드에서 더 활용할 수 있습니다.

### Also

객체로 추가 작업을 완료한 다음 코드에서 해당 객체를 계속 사용하기 위해 반환하려는 경우(예: 로그 기록) `also` 범위 지정 함수를 사용하세요.

다음 예제를 살펴보겠습니다:

```kotlin
fun main() {
    val medals: `List<String>` = listOf("Gold", "Silver", "Bronze")
    val reversedLongUppercaseMedals: `List<String>` =
        medals
            .map { it.uppercase() }
            .filter { it.length > 4 }
            .reversed()
    println(reversedLongUppercaseMedals)
    // [BRONZE, SILVER]
}
```
{kotlin-runnable="true" id="kotlin-tour-scope-function-also-before"}

이 예제는 다음과 같습니다:

* 문자열 리스트가 포함된 `medals` 변수를 생성합니다.
* `List<String>` 타입을 가진 `reversedLongUpperCaseMedals` 변수를 생성합니다.
* `medals` 변수에 `.map()` 확장 함수를 사용합니다.
* `it` 키워드를 통해 `medals`를 참조하고 이에 대해 `.uppercase()` 확장 함수를 호출하는 람다 식을 `.map()` 함수에 전달합니다.
* `medals` 변수에 `.filter()` 확장 함수를 사용합니다.
* `it` 키워드를 통해 `medals`를 참조하고 리스트의 항목이 4자보다 긴지 확인하는 람다 식을 조건자(predicate)로 `.filter()` 함수에 전달합니다.
* `medals` 변수에 `.reversed()` 확장 함수를 사용합니다.
* 결과를 `reversedLongUpperCaseMedals` 변수에 할당합니다.
* `reversedLongUpperCaseMedals` 변수에 포함된 리스트를 출력합니다.

함수 호출 사이에 로그를 추가하여 `medals` 변수에 어떤 일이 일어나고 있는지 확인하면 유용할 것입니다. `also` 함수가 이를 도와줍니다:

```kotlin
fun main() {
    val medals: `List<String>` = listOf("Gold", "Silver", "Bronze")
    val reversedLongUppercaseMedals: `List<String>` =
        medals
            .map { it.uppercase() }
            .also { println(it) }
            // [GOLD, SILVER, BRONZE]
            .filter { it.length > 4 }
            .also { println(it) }
            // [SILVER, BRONZE]
            .reversed()
    println(reversedLongUppercaseMedals)
    // [BRONZE, SILVER]
}
```
{kotlin-runnable="true" id="kotlin-tour-scope-function-also-after"}

이제 이 예제는 다음과 같습니다:

* `medals` 변수에 `also` 범위 지정 함수를 사용합니다.
* `also` 범위 지정 함수 내에 임시 범위를 생성하여, `medals` 변수를 함수 파라미터로 사용할 때 명시적으로 참조할 필요가 없도록 합니다.
* `it` 키워드를 통해 `medals` 변수를 함수 파라미터로 사용하여 `println()` 함수를 호출하는 람다 식을 `also` 범위 지정 함수에 전달합니다.

`also` 함수는 객체를 반환하기 때문에 로그 기록뿐만 아니라 디버깅, 여러 작업 체이닝, 코드의 주요 흐름에 영향을 주지 않는 기타 부수 효과(side-effect) 작업을 수행하는 데 유용합니다.

### With

다른 범위 지정 함수와 달리 `with`는 확장 함수가 아니므로 문법이 다릅니다. 수신 객체를 인자로 `with`에 전달합니다.

객체에 대해 여러 함수를 호출하려는 경우 `with` 범위 지정 함수를 사용하세요.

다음 예제를 살펴보겠습니다:

```kotlin
class Canvas {
    fun rect(x: Int, y: Int, w: Int, h: Int): Unit = println("$x, $y, $w, $h")
    fun circ(x: Int, y: Int, rad: Int): Unit = println("$x, $y, $rad")
    fun text(x: Int, y: Int, str: String): Unit = println("$x, $y, $str")
}

fun main() {
    val mainMonitorPrimaryBufferBackedCanvas = Canvas()

    mainMonitorPrimaryBufferBackedCanvas.text(10, 10, "Foo")
    mainMonitorPrimaryBufferBackedCanvas.rect(20, 30, 100, 50)
    mainMonitorPrimaryBufferBackedCanvas.circ(40, 60, 25)
    mainMonitorPrimaryBufferBackedCanvas.text(15, 45, "Hello")
    mainMonitorPrimaryBufferBackedCanvas.rect(70, 80, 150, 100)
    mainMonitorPrimaryBufferBackedCanvas.circ(90, 110, 40)
    mainMonitorPrimaryBufferBackedCanvas.text(35, 55, "World")
    mainMonitorPrimaryBufferBackedCanvas.rect(120, 140, 200, 75)
    mainMonitorPrimaryBufferBackedCanvas.circ(160, 180, 55)
    mainMonitorPrimaryBufferBackedCanvas.text(50, 70, "Kotlin")
}
```
{kotlin-runnable="true" id="kotlin-tour-scope-function-with-before"}

이 예제는 세 개의 멤버 함수 `rect()`, `circ()`, `text()`를 가진 `Canvas` 클래스를 생성합니다. 각 멤버 함수는 제공된 함수 파라미터로 구성된 문장을 출력합니다.

이 예제는 서로 다른 함수 파라미터로 인스턴스의 멤버 함수를 연속적으로 호출하기 전에 `mainMonitorPrimaryBufferBackedCanvas`를 `Canvas` 클래스의 인스턴스로 생성합니다.

이 코드는 읽기 어렵다는 것을 알 수 있습니다. `with` 함수를 사용하면 코드가 간소화됩니다:

```kotlin
class Canvas {
    fun rect(x: Int, y: Int, w: Int, h: Int): Unit = println("$x, $y, $w, $h")
    fun circ(x: Int, y: Int, rad: Int): Unit = println("$x, $y, $rad")
    fun text(x: Int, y: Int, str: String): Unit = println("$x, $y, $str")
}

fun main() {
    //sampleStart
    val mainMonitorSecondaryBufferBackedCanvas = Canvas()
    with(mainMonitorSecondaryBufferBackedCanvas) {
        text(10, 10, "Foo")
        rect(20, 30, 100, 50)
        circ(40, 60, 25)
        text(15, 45, "Hello")
        rect(70, 80, 150, 100)
        circ(90, 110, 40)
        text(35, 55, "World")
        rect(120, 140, 200, 75)
        circ(160, 180, 55)
        text(50, 70, "Kotlin")
    }
    //sampleEnd
}
```
{kotlin-runnable="true" id="kotlin-tour-scope-function-with-after"}

이 예제는 다음과 같습니다:
* `mainMonitorSecondaryBufferBackedCanvas` 인스턴스를 수신 객체로 하여 `with` 범위 지정 함수를 사용합니다.
* `with` 범위 지정 함수 내에 임시 범위를 생성하여, 멤버 함수를 호출할 때 `mainMonitorSecondaryBufferBackedCanvas` 인스턴스를 명시적으로 참조할 필요가 없도록 합니다.
* 서로 다른 함수 파라미터로 일련의 멤버 함수를 호출하는 람다 식을 `with` 범위 지정 함수에 전달합니다.

이제 코드를 훨씬 읽기 쉬워졌으며, 실수할 가능성도 줄어듭니다.

## 사용 사례 개요

이 섹션에서는 코틀린에서 사용할 수 있는 다양한 범위 지정 함수와 코드를 더욱 관용적으로 만들기 위한 주요 사용 사례를 다루었습니다. 다음 표를 빠른 참조용으로 사용할 수 있습니다. 이러한 함수를 코드에서 사용하기 위해 작동 방식에 대해 완벽하게 이해할 필요는 없다는 점을 기억하세요.

| 함수 | `x`에 접근하는 방식 | 반환 값 | 사용 사례 |
|----------|-------------------|---------------|----------------------------------------------------------------------------------------------|
| `let`    | `it`              | 람다 결과 | 코드에서 널 체크를 수행하고, 나중에 반환된 객체로 추가 작업을 수행할 때 |
| `apply`  | `this`            | `x`           | 생성 시점에 객체를 초기화할 때 |
| `run`    | `this`            | 람다 결과 | 생성 시점에 객체를 초기화**하고** 결과를 계산할 때 |
| `also`   | `it`              | `x`           | 객체를 반환하기 전에 추가 작업을 완료할 때 |
| `with`   | `this`            | 람다 결과 | 객체에 대해 여러 함수를 호출할 때 |

범위 지정 함수에 대한 자세한 정보는 [범위 지정 함수(Scope functions)](scope-functions.md)를 참조하세요.

## 연습 문제

### 연습 문제 1 {initial-collapse-state="collapsed" collapsible="true" id="scope-functions-exercise-1"}

안전한 호출 연산자 `?.`와 `let` 범위 지정 함수를 사용하는 단일 표현식 함수로 `.getPriceInEuros()` 함수를 다시 작성하세요.

<deflist collapsible="true">
    <def title="힌트">
        <code>getProductInfo()</code> 함수에서 <code>priceInDollars</code> 프로퍼티에 안전하게 접근하기 위해 안전한 호출 연산자 <code>?.</code>를 사용하세요. 그런 다음 <code>let</code> 범위 지정 함수를 사용하여 <code>priceInDollars</code> 값을 유로로 변환하세요.
    </def>
</deflist>

|---|---|
```kotlin
data class ProductInfo(val priceInDollars: Double?)

class Product {
    fun getProductInfo(): ProductInfo? {
        return ProductInfo(100.0)
    }
}

// 이 함수를 다시 작성하세요
fun Product.getPriceInEuros(): Double? {
    val info = getProductInfo()
    if (info == null) return null
    val price = info.priceInDollars
    if (price == null) return null
    return convertToEuros(price)
}

fun convertToEuros(dollars: Double): Double {
    return dollars * 0.85
}

fun main() {
    val product = Product()
    val priceInEuros = product.getPriceInEuros()

    if (priceInEuros != null) {
        println("Price in Euros: €$priceInEuros")
        // Price in Euros: €85.0
    } else {
        println("Price information is not available.")
    }
}
```
{validate="false" kotlin-runnable="true" kotlin-min-compiler-version="1.3" id="kotlin-tour-scope-functions-exercise-1"}

|---|---|
```kotlin
data class ProductInfo(val priceInDollars: Double?)

class Product {
    fun getProductInfo(): ProductInfo? {
        return ProductInfo(100.0)
    }
}

fun Product.getPriceInEuros() = getProductInfo()?.priceInDollars?.let { convertToEuros(it) }

fun convertToEuros(dollars: Double): Double {
    return dollars * 0.85
}

fun main() {
    val product = Product()
    val priceInEuros = product.getPriceInEuros()

    if (priceInEuros != null) {
        println("Price in Euros: €$priceInEuros")
        // Price in Euros: €85.0
    } else {
        println("Price information is not available.")
    }
}
```
{initial-collapse-state="collapsed" collapsible="true" collapsed-title="예시 솔루션" id="kotlin-tour-scope-functions-solution-1"}

### 연습 문제 2 {initial-collapse-state="collapsed" collapsible="true" id="scope-functions-exercise-2"}

사용자의 이메일 주소를 업데이트하는 `updateEmail()` 함수가 있습니다. `apply` 범위 지정 함수를 사용하여 이메일 주소를 업데이트한 다음, `also` 범위 지정 함수를 사용하여 로그 메시지 `Updating email for user with ID: ${it.id}`를 출력하세요.

|---|---|
```kotlin
data class User(val id: Int, var email: String)

fun updateEmail(user: User, newEmail: String): User = // 코드를 여기에 작성하세요

fun main() {
    val user = User(1, "old_email@example.com")
    val updatedUser = updateEmail(user, "new_email@example.com")
    // Updating email for user with ID: 1

    println("Updated User: $updatedUser")
    // Updated User: User(id=1, email=new_email@example.com)
}
```
{validate="false" kotlin-runnable="true" kotlin-min-compiler-version="1.3" id="kotlin-tour-scope-functions-exercise-2"}

|---|---|
```kotlin
data class User(val id: Int, var email: String)

fun updateEmail(user: User, newEmail: String): User = user.apply {
    this.email = newEmail
}.also { println("Updating email for user with ID: ${it.id}") }

fun main() {
    val user = User(1, "old_email@example.com")
    val updatedUser = updateEmail(user, "new_email@example.com")
    // Updating email for user with ID: 1

    println("Updated User: $updatedUser")
    // Updated User: User(id=1, email=new_email@example.com)
}
```
{initial-collapse-state="collapsed" collapsible="true" collapsed-title="예시 솔루션" id="kotlin-tour-scope-functions-solution-2"}

## 다음 단계

[중급: 수신 객체 지정 람다 식](kotlin-tour-intermediate-lambdas-receiver.md)