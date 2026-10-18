[//]: # (title: 봉인된 클래스와 인터페이스(Sealed classes and interfaces))

봉인된(Sealed) 클래스와 인터페이스는 클래스 계층 구조에 대한 제어된 상속을 제공합니다. 
봉인된 클래스의 모든 직계 하위 클래스는 컴파일 타임에 알려집니다. 봉인된 클래스가 정의된 모듈 및 패키지 외부에서는 
다른 하위 클래스가 나타날 수 없습니다. 동일한 논리가 봉인된 인터페이스와 그 구현체에도 적용됩니다. 
봉인된 인터페이스가 포함된 모듈이 컴파일되고 나면 새로운 구현체를 생성할 수 없습니다.

> 직계 하위 클래스(Direct subclasses)는 상위 클래스로부터 직접 상속받는 클래스입니다.
> 
> 간접 하위 클래스(Indirect subclasses)는 상위 클래스로부터 2단계 이상 아래에서 상속받는 클래스입니다.
>
{style="note"}

봉인된 클래스 및 인터페이스를 `when` 식과 함께 사용하면 가능한 모든 하위 클래스의 동작을 포괄할 수 있으며, 
새로운 하위 클래스가 생성되어 코드에 부정적인 영향을 미치지 않도록 보장할 수 있습니다.

봉인된 클래스는 다음과 같은 시나리오에 가장 적합합니다.

* **제한된 클래스 상속이 필요한 경우:** 컴파일 타임에 모두 알 수 있는, 미리 정의된 유한한 개수의 하위 클래스 집합이 클래스를 확장하는 경우입니다.
* **타입 안전한(Type-safe) 설계가 필요한 경우:** 프로젝트에서 안정성과 패턴 매칭이 매우 중요한 경우입니다. 특히 상태 관리나 복잡한 조건부 로직을 처리할 때 유용합니다. 예시는 [when 식과 함께 봉인된 클래스 사용하기](#use-sealed-classes-with-when-expression)를 확인하세요.
* **닫힌 API(closed APIs)로 작업하는 경우:** 라이브러리를 위한 강력하고 유지보수 가능한 퍼블릭 API를 구성하여, 서드파티 클라이언트가 의도된 대로만 API를 사용하도록 보장하고자 하는 경우입니다.

더 자세한 실제 적용 사례는 [활용 사례 시나리오](#use-case-scenarios)를 참조하세요.

> Java 15에서도 `sealed` 키워드와 `permits` 절을 사용하여 제한된 계층 구조를 정의하는 [유사한 개념](https://docs.oracle.com/en/java/javase/15/language/sealed-classes-and-interfaces.html#GUID-0C709461-CC33-419A-82BF-61461336E65F)이 도입되었습니다.
>
{style="tip"}

## 봉인된 클래스 또는 인터페이스 선언하기 {id="declare-a-sealed-class-or-interface"}

봉인된 클래스나 인터페이스를 선언하려면 `sealed` 수정자(modifier)를 사용합니다.

```kotlin
// Create a sealed interface
sealed interface Error

// Create a sealed class that implements sealed interface Error
sealed class IOError(): Error

// Define subclasses that extend sealed class 'IOError'
class FileReadError(val file: File): IOError()
class DatabaseError(val source: DataSource): IOError()

// Create a singleton object implementing the 'Error' sealed interface 
object RuntimeError : Error
```

이 예시는 라이브러리 사용자가 발생할 수 있는 에러를 처리할 수 있도록 오류 클래스들을 포함하는 라이브러리 API를 나타낼 수 있습니다. 
이러한 오류 클래스의 계층 구조에 퍼블릭 API로 노출된 인터페이스나 추상 클래스가 포함되어 있다면, 다른 개발자가 클라이언트 코드에서 이를 구현하거나 확장하는 것을 막을 수 없습니다. 
라이브러리는 외부에서 선언된 오류에 대해 알지 못하므로 자체 클래스와 일관되게 처리할 수 없습니다. 
그러나 오류 클래스 계층 구조를 **봉인(sealed)**하면, 라이브러리 작성자는 가능한 모든 오류 유형을 파악할 수 있으며 나중에 다른 오류 유형이 추가되지 않음을 확신할 수 있습니다.

이 예시의 계층 구조는 다음과 같습니다.

![Hierarchy illustration of sealed classes and interfaces](sealed-classes-interfaces.svg){width=700}

### 생성자 {id="constructors"}

봉인된 클래스 자체는 항상 [추상 클래스](classes.md#abstract-classes)이므로 직접 인스턴스화할 수 없습니다. 
그러나 생성자를 포함하거나 상속받을 수 있습니다. 이러한 생성자는 봉인된 클래스 자체의 인스턴스를 생성하기 위한 것이 아니라 하위 클래스를 위한 것입니다. 
인스턴스화가 가능한 여러 하위 클래스를 가진 `Error`라는 봉인된 클래스의 다음 예시를 살펴보겠습니다.

```kotlin
sealed class Error(val message: String) {
    class NetworkError : Error("Network failure")
    class DatabaseError : Error("Database cannot be reached")
    class UnknownError : Error("An unknown error has occurred")
}

fun main() {
    val errors = listOf(Error.NetworkError(), Error.DatabaseError(), Error.UnknownError())
    errors.forEach { println(it.message) }
}
// Network failure 
// Database cannot be reached 
// An unknown error has occurred
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.5"}

봉인된 클래스 내에서 [`enum`](enum-classes.md) 클래스를 사용하여 enum 상수로 상태를 나타내고 추가 세부 정보를 제공할 수 있습니다. 
각 enum 상수는 **단일(single)** 인스턴스로만 존재하는 반면, 봉인된 클래스의 하위 클래스는 **여러(multiple)** 인스턴스를 가질 수 있습니다. 
예시에서 `sealed class Error`는 여러 하위 클래스와 함께 오류의 심각도를 나타내기 위해 `enum`을 사용합니다. 
각 하위 클래스 생성자는 `severity`를 초기화하며 상태를 변경할 수 있습니다.

```kotlin
enum class ErrorSeverity { MINOR, MAJOR, CRITICAL }

sealed class Error(val severity: ErrorSeverity) {
    class FileReadError(val file: File): Error(ErrorSeverity.MAJOR)
    class DatabaseError(val source: DataSource): Error(ErrorSeverity.CRITICAL)
    object RuntimeError : Error(ErrorSeverity.CRITICAL)
    // Additional error types can be added here
}
```

봉인된 클래스의 생성자는 두 가지 [가시성(visibilities)](visibility-modifiers.md) 중 하나를 가질 수 있습니다: 기본값인 `protected` 또는 `private`.

```kotlin
sealed class IOError {
    // A sealed class constructor has protected visibility by default. It's visible inside this class and its subclasses 
    constructor() { /*...*/ }

    // Private constructor, visible inside this class only. 
    // Using a private constructor in a sealed class allows for even stricter control over instantiation, enabling specific initialization procedures within the class.
    private constructor(description: String): this() { /*...*/ }

    // This will raise an error because public and internal constructors are not allowed in sealed classes
    // public constructor(code: Int): this() {} 
}
```

## 상속 {id="inheritance"}

봉인된 클래스와 인터페이스의 직계 하위 클래스는 동일한 패키지 내에 선언되어야 합니다. 최상위(top-level)에 위치할 수도 있고, 다른 명명된 클래스, 명명된 인터페이스 또는 명명된 객체 내에 얼마든지 중첩될 수도 있습니다. 
하위 클래스는 [프로퍼티 오버라이딩](inheritance.md#overriding-properties)을 포함하여 Kotlin의 일반적인 상속 규칙과 호환되는 한 어떤 [가시성](visibility-modifiers.md)이든 가질 수 있습니다.

봉인된 클래스의 하위 클래스는 올바른 정규화된 이름(qualified name)을 가져야 합니다. 로컬 객체나 익명 객체는 될 수 없습니다.

> `enum` 클래스는 봉인된 클래스나 다른 클래스를 확장할 수 없습니다. 하지만 봉인된 인터페이스를 구현할 수는 있습니다.
>
> ```kotlin
> sealed interface Error
> 
> // enum class extending the sealed interface Error
> enum class ErrorType : Error {
>     FILE_ERROR, DATABASE_ERROR
> }
>
> ```
> 
{style="note"}

이러한 제한 사항은 간접 하위 클래스에는 적용되지 않습니다. 봉인된 클래스의 직계 하위 클래스가 sealed로 표시되지 않은 경우, 
해당 수정자가 허용하는 모든 방식으로 확장될 수 있습니다.

```kotlin
// Sealed interface 'Error' has implementations only in the same package and module
sealed interface Error

// Sealed class 'IOError' extends 'Error' and is extendable only within the same package
sealed class IOError(): Error

// Open class 'CustomError' extends 'Error' and can be extended anywhere it's visible
open class CustomError(): Error
```

### 멀티플랫폼 프로젝트에서의 상속 {id="inheritance-in-multiplatform-projects"}

[멀티플랫폼 프로젝트](https://kotlinlang.org/docs/multiplatform/get-started.html)에는 한 가지 상속 제한이 더 있습니다. 봉인된 클래스의 직계 하위 클래스는 동일한 [소스 세트(source set)](https://kotlinlang.org/docs/multiplatform/multiplatform-discover-project.html#source-sets)에 있어야 합니다. 이는 [expected 및 actual 수정자](https://kotlinlang.org/docs/multiplatform/multiplatform-expect-actual.html)가 없는 봉인된 클래스에 적용됩니다.

봉인된 클래스가 공통 소스 세트에서 `expect`로 선언되고 플랫폼 소스 세트에 `actual` 구현체가 있는 경우, 
`expect` 및 `actual` 버전 모두 해당 소스 세트에 하위 클래스를 둘 수 있습니다. 또한 계층적 구조를 사용하는 경우 
`expect`와 `actual` 선언 사이의 모든 소스 세트에 하위 클래스를 생성할 수 있습니다. 

[멀티플랫폼 프로젝트의 계층 구조에 대해 자세히 알아보기](https://kotlinlang.org/docs/multiplatform/multiplatform-hierarchy.html). 

## when 식과 함께 봉인된 클래스 사용하기 {id="use-sealed-classes-with-when-expression"}

봉인된 클래스를 사용할 때 얻을 수 있는 핵심 이점은 [`when`](control-flow.md#when-expressions-and-statements) 식에서 사용할 때 나타납니다. 
봉인된 클래스와 함께 사용되는 `when` 식을 통해 Kotlin 컴파일러는 가능한 모든 케이스가 철저하게(exhaustively) 처리되었는지 확인할 수 있습니다. 
이러한 경우 `else` 절을 추가할 필요가 없습니다.

```kotlin
// Sealed class and its subclasses
sealed class Error {
    class FileReadError(val file: String): Error()
    class DatabaseError(val source: String): Error()
    object RuntimeError : Error()
}

//sampleStart
// Function to log errors
fun log(e: Error) = when(e) {
    is Error.FileReadError -> println("Error while reading file ${e.file}")
    is Error.DatabaseError -> println("Error while reading from database ${e.source}")
    Error.RuntimeError -> println("Runtime error")
    // No `else` clause is required because all the cases are covered
}
//sampleEnd

// List all errors
fun main() {
    val errors = listOf(
        Error.FileReadError("example.txt"),
        Error.DatabaseError("usersDatabase"),
        Error.RuntimeError
    )

    errors.forEach { log(it) }
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.5"}

> `when` 식에서의 반복을 줄이려면 문맥 인식 리졸루션(context-sensitive resolution, 현재 미리보기 제공)을 사용해 보세요.
> 이 기능을 사용하면 예상되는 타입을 알 수 있는 경우 봉인된 클래스 멤버와 매칭할 때 타입 이름을 생략할 수 있습니다.
>
> 자세한 내용은 [문맥 인식 리졸루션 미리보기](whatsnew22.md#preview-of-context-sensitive-resolution) 또는 관련 [KEEP 제안서](https://github.com/Kotlin/KEEP/blob/improved-resolution-expected-type/proposals/context-sensitive-resolution.md)를 참조하세요.
> 
{style="tip"}

`when` 식과 함께 봉인된 클래스를 사용할 때 가드 조건(guard conditions)을 추가하여 단일 분기 내에서 추가적인 검사를 포함할 수도 있습니다. 
자세한 내용은 [when 식의 가드 조건](control-flow.md#guard-conditions-in-when-expressions)을 참조하세요.

> 멀티플랫폼 프로젝트의 공통 코드에서 봉인된 클래스를 [expected 선언](https://kotlinlang.org/docs/multiplatform/multiplatform-expect-actual.html)으로 사용하는 `when` 식이 있는 경우, 여전히 `else` 분기가 필요합니다. 
> 이는 `actual` 플랫폼 구현체의 하위 클래스가 공통 코드에서는 알 수 없는 방식으로 봉인된 클래스를 확장할 수 있기 때문입니다.
>
{style="note"}

## 리플렉션으로 봉인된 하위 클래스 검사하기 {id="inspect-sealed-subclasses-with-reflection"}

런타임에 봉인된 클래스나 인터페이스의 직계 하위 클래스를 검사하기 위해 [리플렉션(Reflection)](reflection.md) 기능을 사용할 수 있습니다. 
이는 프레임워크 코드가 봉인된 계층 구조의 변형(variants)들을 찾는 데 유용합니다. 예를 들어, 
직렬화기(serializer)를 등록하거나 모든 변형에 처리기(handler)가 있는지 확인할 수 있습니다. 

알려진 직계 하위 클래스를 검사해야 하는 경우 [sealedSubclasses](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.reflect/-k-class/sealed-subclasses.html)를 사용하세요. 
이 메서드는 일반 클래스 또는 객체 선언을 나타낼 수 있는 [`KClass`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.reflect/-k-class/)를 반환합니다. 객체 선언의 경우, 
[`objectInstance`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.reflect/-k-class/object-instance.html)는 해당 싱글톤 인스턴스를 반환합니다.

```kotlin
sealed interface Status
data class Send(val message: String) : Status
data object Start : Status
data object Stop : Status

fun main() {
    // Get the direct subclasses known to the sealed hierarchy
    val subclasses = Status::class.sealedSubclasses
    println(subclasses.mapNotNull { it.simpleName })
    // [Send, Start, Stop]

    val singletonStatus = subclasses.mapNotNull { subclass ->
        // Return null for Send because it is a regular class
        subclass.objectInstance
    }
    println(singletonStatus)
    // [Start, Stop]
}
```

이 예제에서 `objectInstance`는 `Send`를 필터링하여 제외하는데, 이는 모든 `Send` 값이 개별적으로 생성되어야 하기 때문입니다. `Start`와 
`Stop`은 객체 선언이므로 컴파일러는 기존 싱글톤 인스턴스를 반환합니다.

> 직계 하위 클래스 중 하나가 봉인된 클래스인 경우, 해당 클래스의 `sealedSubclasses`를 재귀적으로 탐색하여 전체 계층 구조를 수집할 수 있습니다.
> 
{style="tip"}

## 활용 사례 시나리오 {id="use-case-scenarios"}

봉인된 클래스와 인터페이스가 특히 유용하게 쓰일 수 있는 몇 가지 실제 시나리오를 살펴보겠습니다.

### UI 애플리케이션의 상태 관리 {id="state-management-in-ui-applications"}

애플리케이션에서 다양한 UI 상태를 표현하기 위해 봉인된 클래스를 사용할 수 있습니다. 
이러한 접근 방식은 UI 변경 사항을 구조화되고 안전하게 처리할 수 있도록 해줍니다. 
다음 예시는 다양한 UI 상태를 관리하는 방법을 보여줍니다.

```kotlin
sealed class UIState { 
    data object Loading : UIState()
    data class Success(val data: String) : UIState()
    data class Error(val exception: Exception) : UIState()
}

fun updateUI(state: UIState) { 
    when (state) {
        is UIState.Loading -> showLoadingIndicator()
        is UIState.Success -> showData(state.data)
        is UIState.Error -> showError(state.exception) 
    }
}
```

### 결제 수단 처리 {id="payment-method-handling"}

실제 비즈니스 애플리케이션에서는 다양한 결제 수단을 효율적으로 처리하는 것이 일반적인 요구 사항입니다. 
봉인된 클래스를 `when` 식과 함께 사용하여 이러한 비즈니스 로직을 구현할 수 있습니다. 
서로 다른 결제 수단을 봉인된 클래스의 하위 클래스로 표현함으로써 트랜잭션 처리를 위한 명확하고 관리하기 쉬운 구조를 구축할 수 있습니다.

```kotlin
sealed class Payment {
    data class CreditCard(val number: String, val expiryDate: String) : Payment()
    data class PayPal(val email: String) : Payment()
    data object Cash : Payment()
}

fun processPayment(payment: Payment) { 
    when (payment) {
        is Payment.CreditCard -> processCreditCardPayment(payment.number, payment.expiryDate)
        is Payment.PayPal -> processPayPalPayment(payment.email)
        is Payment.Cash -> processCashPayment() 
    }
}
```

`Payment`는 이커머스 시스템에서 다양한 결제 수단을 나타내는 봉인된 클래스입니다: 
`CreditCard`, `PayPal`, `Cash`. 각 하위 클래스는 `CreditCard`의 `number` 및 `expiryDate`, 
`PayPal`의 `email`과 같이 고유한 프로퍼티를 가질 수 있습니다. 

`processPayment()` 함수는 다양한 결제 수단을 처리하는 방법을 보여줍니다. 
이러한 방식은 가능한 모든 결제 유형이 고려되도록 보장하며, 향후 시스템에 새로운 결제 수단이 추가될 때도 유연성을 유지할 수 있게 해줍니다.

### API 요청-응답 처리 {id="api-request-response-handling"}

봉인된 클래스와 봉인된 인터페이스를 사용하여 API 요청 및 응답을 처리하는 사용자 인증 시스템을 구현할 수 있습니다. 
이 사용자 인증 시스템에는 로그인 및 로그아웃 기능이 있습니다. 
`ApiRequest` 봉인된 인터페이스는 구체적인 요청 유형을 정의합니다: 로그인을 위한 `LoginRequest` 및 로그아웃 작업을 위한 `LogoutRequest`. 
봉인된 클래스인 `ApiResponse`는 다양한 응답 시나리오를 캡슐화합니다: 사용자 데이터가 포함된 `UserSuccess`, 
사용자가 없을 때의 `UserNotFound`, 모든 실패에 대한 `Error`. `handleRequest` 함수는 `when` 식을 사용하여 
이러한 요청들을 타입 안전한 방식으로 처리하며, `getUserById`는 사용자 조회를 시뮬레이션합니다.

```kotlin
// Import necessary modules
import io.ktor.server.application.*
import io.ktor.server.resources.*

import kotlinx.serialization.*

// Define the sealed interface for API requests using Ktor resources
@Resource("api")
sealed interface ApiRequest

@Serializable
@Resource("login")
data class LoginRequest(val username: String, val password: String) : ApiRequest

@Serializable
@Resource("logout")
object LogoutRequest : ApiRequest

// Define the ApiResponse sealed class with detailed response types
sealed class ApiResponse {
    data class UserSuccess(val user: UserData) : ApiResponse()
    data object UserNotFound : ApiResponse()
    data class Error(val message: String) : ApiResponse()
}

// User data class to be used in the success response
data class UserData(val userId: String, val name: String, val email: String)

// Function to validate user credentials (for demonstration purposes)
fun isValidUser(username: String, password: String): Boolean {
    // Some validation logic (this is just a placeholder)
    return username == "validUser" && password == "validPass"
}

// Function to handle API requests with detailed responses
fun handleRequest(request: ApiRequest): ApiResponse {
    return when (request) {
        is LoginRequest -> {
            if (isValidUser(request.username, request.password)) {
                ApiResponse.UserSuccess(UserData("userId", "userName", "userEmail"))
            } else {
                ApiResponse.Error("Invalid username or password")
            }
        }
        is LogoutRequest -> {
            // Assuming logout operation always succeeds for this example
            ApiResponse.UserSuccess(UserData("userId", "userName", "userEmail")) // For demonstration
        }
    }
}

// Function to simulate a getUserById call
fun getUserById(userId: String): ApiResponse {
    return if (userId == "validUserId") {
        ApiResponse.UserSuccess(UserData("validUserId", "John Doe", "john@example.com"))
    } else {
        ApiResponse.UserNotFound
    }
    // Error handling would also result in an Error response.
}

// Main function to demonstrate the usage
fun main() {
    val loginResponse = handleRequest(LoginRequest("user", "pass"))
    println(loginResponse)

    val logoutResponse = handleRequest(LogoutRequest)
    println(logoutResponse)

    val userResponse = getUserById("validUserId")
    println(userResponse)

    val userNotFoundResponse = getUserById("invalidId")
    println(userNotFoundResponse)
}
```

## 다음 단계 {id="what-s-next"}

[Kotlin의 상속](inheritance.md)에 대해 자세히 알아보세요.