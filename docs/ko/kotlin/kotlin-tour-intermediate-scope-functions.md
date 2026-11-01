[//]: # (title: 스코프 함수)

<no-index/>

이번 장에서는 확장 함수에 대한 이해를 바탕으로 스코프 함수(Scope functions)를 사용하여 더 관용적인(idiomatic) 코드를 작성하는 방법을 알아봅니다.

## 스코프 함수 {id="scope-functions"}

프로그래밍에서 스코프(유효 범위)는 변수나 객체가 인식되는 영역을 말합니다. 가장 흔히 언급되는 스코프는 전역 스코프와 지역 스코프입니다.

* **전역 스코프(Global scope)** – 프로그램의 어느 곳에서나 접근할 수 있는 변수 또는 객체입니다.
* **지역 스코프(Local scope)** – 변수나 객체가 정의된 블록이나 함수 내에서만 접근할 수 있습니다.

Kotlin에는 객체를 둘러싼 임시 스코프를 생성하고 코드를 실행할 수 있게 해주는 스코프 함수도 제공됩니다.

임시 스코프 내에서는 객체의 이름을 명시적으로 참조할 필요가 없으므로 스코프 함수를 사용하면 코드가 더 간결해집니다. 스코프 함수에 따라 `this` 키워드로 참조하거나 `it` 키워드를 통해 인자로 전달받아 해당 객체에 접근할 수 있습니다.

Kotlin에는 `let`, `apply`, `run`, `also`, `with`의 총 5가지 스코프 함수가 있습니다.

각 스코프 함수는 람다 식을 인자로 받으며, 객체 자체나 람다 식의 결과를 반환합니다. 이번 투어에서는 각 스코프 함수와 그 사용법을 설명합니다.

> Kotlin 디벨로퍼 애드보킷인 Sebastian Aigner의 스코프 함수 관련 강연인 [Back to the Stdlib: Making the Most of Kotlin's Standard Library](https://youtu.be/DdvgvSHrN9g?feature=shared&t=1511)도 시청해 보세요.
> 
{style="tip"}

### Let {id="let"}

코드에서 null 검사를 수행하고, 이후 반환된 객체로 추가 작업을 진행하려는 경우 `let` 스코프 함수를 사용하세요.

다음 예제를 살펴보세요:

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
* `recipientAddress` 매개변수를 가지며 문자열을 반환하는 `sendNotification()`
* 매개변수가 없으며 문자열을 반환하는 `getNextAddress()`

이 예제에서는 널 허용(nullable) `String` 타입의 `address` 변수를 생성합니다. 하지만 `sendNotification()` 함수를 호출할 때 문제가 발생합니다. 이 함수는 `address`가 `null` 값일 가능성을 허용하지 않기 때문입니다. 그 결과 컴파일러는 다음과 같은 오류를 보고합니다:

```text
Argument type mismatch: actual type is 'String?', but 'String' was expected.
```

초급 투어에서 배웠듯이 `if` 조건문을 사용하여 null 검사를 수행하거나 [엘비스 연산자 `?:`](kotlin-tour-null-safety.md#use-elvis-operator)를 사용할 수 있습니다. 하지만 반환된 객체를 나중에 코드에서 다시 사용하고 싶다면 어떻게 해야 할까요? `if` 조건문**과** `else` 분기를 사용하여 다음과 같이 구현할 수 있습니다:

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

하지만 더 간결한 방법은 `let` 스코프 함수를 사용하는 것입니다:

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

이 예제는 다음과 같이 동작합니다:
* `address`와 `confirm`이라는 변수를 생성합니다.
* `address` 변수에 안전한 호출(safe call)을 통해 `let` 스코프 함수를 사용합니다.
* `let` 스코프 함수 내에 임시 스코프를 생성합니다.
* `sendNotification()` 함수를 `let` 스코프 함수에 람다 식으로 전달합니다.
* 임시 스코프를 사용하여 `it`을 통해 `address` 변수를 참조합니다.
* 그 결과를 `confirm` 변수에 할당합니다.

이 방식을 사용하면 `address` 변수가 `null` 값일 가능성을 안전하게 처리할 수 있으며, 이후 코드에서 `confirm` 변수를 활용할 수 있습니다.

### Apply {id="apply"}

클래스 인스턴스와 같은 객체를 코드의 뒷부분이 아닌 생성 시점에 즉시 초기화하려면 `apply` 스코프 함수를 사용하세요. 이 방식을 사용하면 코드를 읽고 관리하기가 더 쉬워집니다.

다음 예제를 살펴보세요:

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

이 예제에는 `token`이라는 프로퍼티 하나와 `connect()`, `authenticate()`, `getData()`라는 세 개의 멤버 함수를 포함하는 `Client` 클래스가 있습니다.

이 예제는 `Client` 클래스의 인스턴스로 `client`를 생성한 후, `main()` 함수에서 `token` 프로퍼티를 초기화하고 멤버 함수를 호출합니다.

이 예제는 간결하지만, 실제 환경에서는 클래스 인스턴스를 생성한 후 이를 설정하고 (해당 멤버 함수를) 사용하기까지 상당한 코드가 개입될 수 있습니다. 하지만 `apply` 스코프 함수를 사용하면 클래스 인스턴스의 생성, 설정 및 멤버 함수 호출을 코드의 동일한 위치에서 모두 처리할 수 있습니다:

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

이 예제는 다음과 같이 동작합니다:

* `Client` 클래스의 인스턴스로 `client`를 생성합니다.
* `client` 인스턴스에 `apply` 스코프 함수를 사용합니다.
* 프로퍼티나 함수에 접근할 때 `client` 인스턴스를 명시적으로 참조할 필요가 없도록 `apply` 스코프 함수 내에 임시 스코프를 생성합니다.
* `token` 프로퍼티를 업데이트하고 `connect()` 및 `authenticate()` 함수를 호출하는 람다 식을 `apply` 스코프 함수에 전달합니다.
* `main()` 함수에서 `client` 인스턴스의 `getData()` 멤버 함수를 호출합니다.

보시다시피, 대규모 코드를 다룰 때 이 방법은 매우 편리합니다.

### Run {id="run"}

`apply`와 마찬가지로 `run` 스코프 함수를 사용하여 객체를 초기화할 수 있지만, 코드의 특정 시점에 객체를 초기화**하고** 즉시 결과를 계산해야 할 때는 `run`을 사용하는 것이 더 좋습니다.

이전의 `apply` 함수 예제를 이어서 살펴보겠습니다. 이번에는 모든 요청마다 `connect()`와 `authenticate()` 함수가 함께 묶여 호출되도록 만들려고 합니다.

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

이 예제는 다음과 같이 동작합니다:

* `Client` 클래스의 인스턴스로 `client`를 생성합니다.
* `client` 인스턴스에 `apply` 스코프 함수를 사용합니다.
* 프로퍼티나 함수에 접근할 때 `client` 인스턴스를 명시적으로 참조할 필요가 없도록 `apply` 스코프 함수 내에 임시 스코프를 생성합니다.
* `token` 프로퍼티를 업데이트하는 람다 식을 `apply` 스코프 함수에 전달합니다.

`main()` 함수는 다음과 같이 동작합니다:

* `String` 타입의 `result` 변수를 생성합니다.
* `client` 인스턴스에 `run` 스코프 함수를 사용합니다.
* 프로퍼티나 함수에 접근할 때 `client` 인스턴스를 명시적으로 참조할 필요가 없도록 `run` 스코프 함수 내에 임시 스코프를 생성합니다.
* `connect()`, `authenticate()`, `getData()` 함수를 호출하는 람다 식을 `run` 스코프 함수에 전달합니다.
* 그 결과를 `result` 변수에 할당합니다.

이제 반환된 결과를 코드의 뒷부분에서 계속 활용할 수 있습니다.

### Also {id="also"}

로그를 남기는 작업처럼, 객체로 추가 작업을 수행한 다음 해당 객체를 그대로 반환하여 코드에서 계속 사용하려면 `also` 스코프 함수를 사용하세요.

다음 예제를 살펴보세요:

```kotlin
fun main() {
    val medals: List<String> = listOf("Gold", "Silver", "Bronze")
    val reversedLongUppercaseMedals: List<String> =
        medals
            .map { it.uppercase() }
            .filter { it.length > 4 }
            .reversed()
    println(reversedLongUppercaseMedals)
    // [BRONZE, SILVER]
}
```
{kotlin-runnable="true" id="kotlin-tour-scope-function-also-before"}

이 예제는 다음과 같이 동작합니다:

* 문자열 목록을 포함하는 `medals` 변수를 생성합니다.
* `List<String>` 타입의 `reversedLongUpperCaseMedals` 변수를 생성합니다.
* `medals` 변수에 `.map()` 확장 함수를 사용합니다.
* `it` 키워드를 통해 `medals`의 요소를 참조하고 이에 대해 `.uppercase()` 확장 함수를 호출하는 람다 식을 `.map()` 함수에 전달합니다.
* `medals` 변수에 `.filter()` 확장 함수를 사용합니다.
* `it` 키워드를 통해 `medals`의 요소를 참조하고 목록의 항목이 4글자를 초과하는지 확인하는 조건식(predicate) 람다 식을 `.filter()` 함수에 전달합니다.
* `medals` 변수에 `.reversed()` 확장 함수를 사용합니다.
* 그 결과를 `reversedLongUpperCaseMedals` 변수에 할당합니다.
* `reversedLongUpperCaseMedals` 변수에 포함된 목록을 출력합니다.

함수 호출 사이에 로깅을 추가하여 `medals` 변수에 어떤 작업이 일어나는지 확인하면 유용할 것입니다. `also` 함수가 이에 도움이 됩니다:

```kotlin
fun main() {
    val medals: List<String> = listOf("Gold", "Silver", "Bronze")
    val reversedLongUppercaseMedals: List<String> =
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

이제 예제는 다음과 같이 동작합니다:

* `medals` 변수에 `also` 스코프 함수를 사용합니다.
* 함수 매개변수로 사용할 때 `medals` 변수를 명시적으로 참조할 필요가 없도록 `also` 스코프 함수 내에 임시 스코프를 생성합니다.
* `it` 키워드를 통해 `medals` 변수를 매개변수로 사용하여 `println()` 함수를 호출하는 람다 식을 `also` 스코프 함수에 전달합니다.

`also` 함수는 객체 자체를 반환하므로 로깅뿐만 아니라 디버깅, 여러 작업의 체이닝, 그리고 코드의 주요 흐름에 영향을 주지 않는 기타 부수 효과(side effect) 작업을 수행할 때 유용합니다.

### With {id="with"}

다른 스코프 함수들과 달리 `with`는 확장 함수가 아니므로 문법이 다릅니다. 수신 객체(receiver object)를 `with`에 인자로 전달합니다.

하나의 객체에 대해 여러 함수를 호출하려는 경우 `with` 스코프 함수를 사용하세요.

다음 예제를 살펴보세요:

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

이 예제는 `rect()`, `circ()`, `text()`라는 세 개의 멤버 함수를 가진 `Canvas` 클래스를 생성합니다. 각 멤버 함수는 제공된 함수 매개변수로 구성된 문장을 출력합니다.

이 예제는 `Canvas` 클래스의 인스턴스로 `mainMonitorPrimaryBufferBackedCanvas`를 생성한 후, 다양한 매개변수를 사용하여 해당 인스턴스에서 일련의 멤버 함수를 연달아 호출합니다.

이 코드는 읽기가 다소 어렵습니다. `with` 함수를 사용하면 코드를 간결하게 정리할 수 있습니다:

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

이 예제는 다음과 같이 동작합니다:
* `mainMonitorSecondaryBufferBackedCanvas` 인스턴스를 수신 객체로 하여 `with` 스코프 함수를 사용합니다.
* 멤버 함수를 호출할 때 `mainMonitorSecondaryBufferBackedCanvas` 인스턴스를 명시적으로 참조할 필요가 없도록 `with` 스코프 함수 내에 임시 스코프를 생성합니다.
* 서로 다른 매개변수를 가진 일련의 멤버 함수들을 호출하는 람다 식을 `with` 스코프 함수에 전달합니다.

이제 코드가 훨씬 읽기 쉬워졌으므로 실수를 유발할 가능성도 줄어듭니다.

## 사용 사례 요약 {id="use-case-overview"}

이 섹션에서는 Kotlin에서 사용할 수 있는 다양한 스코프 함수와 코드를 더욱 관용적으로 만들기 위한 주요 사용 사례를 다루었습니다. 다음 표를 빠른 참조용으로 활용할 수 있습니다. 코드에서 이러한 함수들을 활용하기 위해 내부 동작 방식을 완벽하게 이해하고 있어야 하는 것은 아닙니다.

| 함수 | `x` 접근 방법 | 반환값 | 사용 사례 |
|---|---|---|---|
| `let` | `it` | 람다 결과 | 코드에서 null 검사를 수행하고 반환된 객체로 추가 작업을 진행할 때. |
| `apply` | `this` | `x` | 생성 시점에 객체를 초기화할 때. |
| `run` | `this` | 람다 결과 | 생성 시점에 객체를 초기화**하고** 결과를 계산할 때. |
| `also` | `it` | `x` | 객체를 반환하기 전에 추가 작업을 완료할 때. |
| `with` | `this` | 람다 결과 | 객체에 대해 여러 함수를 호출할 때. |

스코프 함수에 대한 자세한 내용은 [스코프 함수](scope-functions.md)를 참조하세요.

## 실습 {completion-point="true" id="practice"}

<deflist appearance="clear" collapsible="true" numbered="true">
<def title="안전한 호출과 let을 사용하여 함수 다시 작성하기" id="scope-functions-exercise-1">

안전한 호출 연산자 `?.`와 `let` 스코프 함수를 사용하여 `.getPriceInEuros()` 함수를 단일 표현식 함수(single-expression function)로 다시 작성하세요.

<deflist collapsible="true">
    <def title="힌트">
        안전한 호출 연산자 <code>?.</code>를 사용하여 <code>getProductInfo()</code> 함수에서 <code>priceInDollars</code> 프로퍼티에 안전하게 접근하세요. 그런 다음 <code>let</code> 스코프 함수를 사용하여 <code>priceInDollars</code>의 값을 유로로 변환하세요.
    </def>
</deflist>

```kotlin
data class ProductInfo(val priceInDollars: Double?)

class Product {
    fun getProductInfo(): ProductInfo? {
        return ProductInfo(100.0)
    }
}

// Rewrite this function
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
{kotlin-runnable="true" kotlin-target-platform="exercise" kotlin-hidden-files="ExerciseUtils.kt,tour/intermediate/GetPriceInEurosTest.kt" validate="false" id="kotlin-tour-scope-functions-exercise-1"}

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
{kotlin-runnable="true" kotlin-target-platform="exercise" kotlin-hidden-files="ExerciseUtils.kt,tour/intermediate/GetPriceInEurosTest.kt" initial-collapse-state="collapsed" collapsible="true" collapsed-title="Example solution" id="kotlin-tour-scope-functions-solution-1"}

</def>
<def title="apply와 also 체이닝하기" id="scope-functions-exercise-2">

사용자의 이메일 주소를 업데이트하는 `updateEmail()` 함수가 있습니다. `apply` 스코프 함수를 사용하여 이메일 주소를 업데이트한 다음, `also` 스코프 함수를 사용하여 `Updating email for user with ID: ${it.id}`라는 로그 메시지를 출력하세요.

```kotlin
data class User(val id: Int, var email: String)

fun updateEmail(user: User, newEmail: String): User = TODO("Replace the TODO() function")

fun main() {
    val user = User(1, "old_email@example.com")
    val updatedUser = updateEmail(user, "new_email@example.com")
    // Updating email for user with ID: 1

    println("Updated User: $updatedUser")
    // Updated User: User(id=1, email=new_email@example.com)
}
```
{kotlin-runnable="true" kotlin-target-platform="exercise" kotlin-hidden-files="ExerciseUtils.kt,tour/intermediate/UpdateEmailTest.kt" validate="false" id="kotlin-tour-scope-functions-exercise-2"}

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
{kotlin-runnable="true" kotlin-target-platform="exercise" kotlin-hidden-files="ExerciseUtils.kt,tour/intermediate/UpdateEmailTest.kt" initial-collapse-state="collapsed" collapsible="true" collapsed-title="Example solution" id="kotlin-tour-scope-functions-solution-2"}

</def>
</deflist>

<seealso></seealso>

<list columns="2" id="tour-nav">
  <li>
    <a as="button" href="kotlin-tour-intermediate-extension-functions.md" mode="outline" icon="arrow-left" icon-position="left">Previous step</a>
  </li>
  <li>
    <a as="button" href="kotlin-tour-intermediate-lambdas-receiver.md" mode="classic" icon="arrow-right" icon-position="right">Next step</a>
  </li>
</list>