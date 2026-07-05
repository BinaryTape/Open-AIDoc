[//]: # (title: 봉인된(Sealed) 클래스 및 인터페이스)

봉인된(Sealed) 클래스 및 인터페이스는 클래스 계층 구조에 대한 제어된 상속을 제공합니다. 
봉인된 클래스의 모든 직계 하위 클래스는 컴파일 시점에 알려집니다. 봉인된 클래스가 정의된 모듈 및 
패키지 외부에서는 다른 하위 클래스가 나타날 수 없습니다. 봉인된 인터페이스와 그 구현체에도 동일한 논리가 적용됩니다. 
봉인된 인터페이스가 포함된 모듈이 컴파일되면 새로운 구현을 생성할 수 없습니다.

> **직계 하위 클래스(Direct subclasses)**는 상위 클래스로부터 즉시 상속받는 클래스입니다.
> 
> **간접 하위 클래스(Indirect subclasses)**는 상위 클래스로부터 두 단계 이상 아래에서 상속받는 클래스입니다.
>
{style="note"}

봉인된 클래스 및 인터페이스를 `when` 표현식과 결합하면, 가능한 모든 하위 클래스의 동작을 다룰 수 있으며 
코드에 부정적인 영향을 미치는 새로운 하위 클래스가 생성되지 않도록 보장할 수 있습니다.

봉인된 클래스는 다음과 같은 시나리오에서 사용하는 것이 가장 좋습니다:

* **제한된 클래스 상속을 원하는 경우:** 컴파일 시점에 모두 알려진, 미리 정의된 유한한 하위 클래스 세트가 클래스를 확장하는 경우.
* **타입 안전한(Type-safe) 설계가 필요한 경우:** 프로젝트에서 안전성과 패턴 매칭이 중요한 경우. 특히 상태 관리나 복잡한 조건부 로직을 처리할 때 유용합니다. 예시는 [`when` 표현식과 함께 봉인된 클래스 사용하기](#use-sealed-classes-with-when-expression)를 확인하세요.
* **폐쇄형 API를 작업하는 경우:** 서드파티 클라이언트가 의도한 대로 API를 사용하도록 보장하는, 라이브러리를 위한 견고하고 유지 관리 가능한 공개 API를 원하는 경우.

더 자세한 실제 응용 사례는 [사용 사례 시나리오](#use-case-scenarios)를 참조하세요.

> Java 15에서도 `sealed` 키워드와 `permits` 절을 사용하여 제한된 계층 구조를 정의하는 [유사한 개념](https://docs.oracle.com/en/java/javase/15/language/sealed-classes-and-interfaces.html#GUID-0C709461-CC33-419A-82BF-61461336E65F)이 도입되었습니다.
>
{style="tip"}

## 봉인된 클래스 또는 인터페이스 선언하기

봉인된 클래스 또는 인터페이스를 선언하려면 `sealed` 수정자를 사용하세요:

```kotlin
// 봉인된 인터페이스 생성
sealed interface Error

// 봉인된 인터페이스 Error를 구현하는 봉인된 클래스 생성
sealed class IOError(): Error

// 봉인된 클래스 'IOError'를 확장하는 하위 클래스 정의
class FileReadError(val file: File): IOError()
class DatabaseError(val source: DataSource): IOError()

// 'Error' 봉인된 인터페이스를 구현하는 싱글톤 객체 생성
object RuntimeError : Error
```

이 예제는 라이브러리 사용자가 발생할 수 있는 에러를 처리할 수 있도록 에러 클래스들을 포함하는 라이브러리 API를 나타낼 수 있습니다. 
만약 이러한 에러 클래스의 계층 구조가 공개 API에 노출된 인터페이스나 추상 클래스를 포함한다면, 
다른 개발자가 클라이언트 코드에서 이를 구현하거나 확장하는 것을 막을 방법이 없습니다. 
라이브러리는 외부에서 선언된 에러를 알 수 없으므로, 자체 클래스들과 일관되게 처리할 수 없습니다. 
하지만 에러 클래스를 **봉인된(sealed)** 계층 구조로 만들면, 라이브러리 작성자는 가능한 모든 에러 타입을 알고 있음을 확신할 수 있으며 
나중에 다른 에러 타입이 나타날 수 없음을 보장할 수 있습니다.

위 예제의 계층 구조는 다음과 같습니다:

![봉인된 클래스 및 인터페이스의 계층 구조 일러스트레이션](sealed-classes-interfaces.svg){width=700}

### 생성자

봉인된 클래스 자체는 항상 [추상 클래스(abstract class)](classes.md#abstract-classes)이며, 결과적으로 직접 인스턴스화할 수 없습니다. 
그러나 생성자를 포함하거나 상속받을 수 있습니다. 이 생성자들은 봉인된 클래스 자체의 인스턴스를 생성하기 위한 것이 아니라 
그 하위 클래스들을 위한 것입니다. `Error`라는 봉인된 클래스와 이를 인스턴스화하는 여러 하위 클래스가 있는 다음 예제를 살펴보세요:

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

봉인된 클래스 내에서 [`enum`](enum-classes.md) 클래스를 사용하여 상수를 통해 상태를 나타내고 추가적인 세부 정보를 제공할 수 있습니다. 
각 enum 상수는 **단일(single)** 인스턴스로만 존재하지만, 봉인된 클래스의 하위 클래스는 **여러(multiple)** 인스턴스를 가질 수 있습니다. 
이 예제에서 `sealed class Error`와 여러 하위 클래스는 에러의 심각도(severity)를 나타내기 위해 `enum`을 사용합니다. 
각 하위 클래스의 생성자는 `severity`를 초기화하며 그 상태를 변경할 수 있습니다:

```kotlin
enum class ErrorSeverity { MINOR, MAJOR, CRITICAL }

sealed class Error(val severity: ErrorSeverity) {
    class FileReadError(val file: File): Error(ErrorSeverity.MAJOR)
    class DatabaseError(val source: DataSource): Error(ErrorSeverity.CRITICAL)
    object RuntimeError : Error(ErrorSeverity.CRITICAL)
    // 여기에 추가적인 에러 타입을 더할 수 있습니다.
}
```

봉인된 클래스의 생성자는 `protected`(기본값) 또는 `private` 중 하나의 [가시성(visibility)](visibility-modifiers.md)을 가질 수 있습니다:

```kotlin
sealed class IOError {
    // 봉인된 클래스 생성자는 기본적으로 protected 가시성을 가집니다. 이 클래스 내부와 하위 클래스에서 볼 수 있습니다.
    constructor() { /*...*/ }

    // private 생성자, 이 클래스 내부에서만 볼 수 있습니다.
    // 봉인된 클래스에서 private 생성자를 사용하면 인스턴스화에 대해 더욱 엄격한 제어가 가능하며, 클래스 내에서 특정 초기화 절차를 수행할 수 있습니다.
    private constructor(description: String): this() { /*...*/ }

    // 봉인된 클래스에서는 public 및 internal 생성자가 허용되지 않으므로 에러가 발생합니다.
    // public constructor(code: Int): this() {} 
}
```

## 상속

봉인된 클래스와 인터페이스의 직계 하위 클래스는 반드시 동일한 패키지 내에서 선언되어야 합니다. 
이들은 최상위(top-level)에 있거나 다른 이름이 있는 클래스, 인터페이스, 객체 내부에 중첩될 수 있습니다. 
하위 클래스는 Kotlin의 일반적인 상속 규칙을 준수하는 한 어떠한 [가시성](visibility-modifiers.md)도 가질 수 있으며, [프로퍼티 오버라이딩](inheritance.md#overriding-properties)에 대한 규칙도 포함됩니다.

봉인된 클래스의 하위 클래스는 적절한 정규화된 이름(qualified name)을 가져야 합니다. 로컬 객체나 익명 객체는 하위 클래스가 될 수 없습니다.

> `enum` 클래스는 봉인된 클래스나 다른 클래스를 확장할 수 없습니다. 하지만 봉인된 인터페이스는 구현할 수 있습니다:
>
> ```kotlin
> sealed interface Error
> 
> // 봉인된 인터페이스 Error를 구현하는 enum 클래스
> enum class ErrorType : Error {
>     FILE_ERROR, DATABASE_ERROR
> }
>
> ```
> 
{style="note"}

이러한 제한 사항은 간접 하위 클래스에는 적용되지 않습니다. 봉인된 클래스의 직계 하위 클래스가 봉인된 것으로 표시되지 않은 경우, 
수정자가 허용하는 모든 방식으로 확장될 수 있습니다:

```kotlin
// 봉인된 인터페이스 'Error'는 동일한 패키지 및 모듈 내에서만 구현체를 가질 수 있습니다.
sealed interface Error

// 봉인된 클래 'IOError'는 'Error'를 확장하며 동일한 패키지 내에서만 확장 가능합니다.
sealed class IOError(): Error

// 열린 클래스 'CustomError'는 'Error'를 확장하며 가시성이 허용되는 어디서든 확장될 수 있습니다.
open class CustomError(): Error
```

### 멀티플랫폼 프로젝트에서의 상속

[멀티플랫폼 프로젝트](https://kotlinlang.org/docs/multiplatform/get-started.html)에는 상속 제한이 하나 더 있습니다. 
봉인된 클래스의 직계 하위 클래스는 동일한 [소스 세트(source set)](https://kotlinlang.org/docs/multiplatform/multiplatform-discover-project.html#source-sets)에 있어야 합니다. 
이는 [`expect` 및 `actual` 수정자](https://kotlinlang.org/docs/multiplatform/multiplatform-expect-actual.html)가 없는 봉인된 클래스에 적용됩니다.

봉인된 클래스가 공통 소스 세트에서 `expect`로 선언되고 플랫폼 소스 세트에서 `actual` 구현을 가지는 경우, 
`expect` 및 `actual` 버전 모두 해당 소스 세트에서 하위 클래스를 가질 수 있습니다. 
더욱이 계층 구조를 사용하는 경우 `expect`와 `actual` 선언 사이의 모든 소스 세트에서 하위 클래스를 생성할 수 있습니다.

[멀티플랫폼 프로젝트의 계층 구조에 대해 자세히 알아보기](https://kotlinlang.org/docs/multiplatform/multiplatform-hierarchy.html). 

## when 표현식과 함께 봉인된 클래스 사용하기

봉인된 클래스를 사용하는 핵심적인 이점은 [`when`](control-flow.md#when-expressions-and-statements) 표현식에서 사용할 때 나타납니다. 
봉인된 클래스와 함께 `when` 표현식을 사용하면, Kotlin 컴파일러가 모든 가능한 사례가 처리되었는지 망라적으로(exhaustively) 확인할 수 있습니다. 
이러한 경우 `else` 절을 추가할 필요가 없습니다.

```kotlin
// 봉인된 클래스와 그 하위 클래스들
sealed class Error {
    class FileReadError(val file: String): Error()
    class DatabaseError(val source: String): Error()
    object RuntimeError : Error()
}

//sampleStart
// 에러를 로깅하는 함수
fun log(e: Error) = when(e) {
    is Error.FileReadError -> println("Error while reading file ${e.file}")
    is Error.DatabaseError -> println("Error while reading from database ${e.source}")
    Error.RuntimeError -> println("Runtime error")
    // 모든 사례가 처리되었으므로 `else` 절이 필요하지 않습니다.
}
//sampleEnd

// 모든 에러 나열
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

> `when` 표현식의 반복을 줄이려면 문맥 인식 해석(context-sensitive resolution, 현재 프리뷰 단계)을 시도해 보세요. 
> 이 기능을 사용하면 예상되는 타입을 알 수 있는 경우 봉인된 클래스 멤버를 매칭할 때 타입 이름을 생략할 수 있습니다.
>
> 자세한 내용은 [문맥 인식 해석 프리뷰](whatsnew22.md#preview-of-context-sensitive-resolution) 또는 관련 [KEEP 제안서](https://github.com/Kotlin/KEEP/blob/improved-resolution-expected-type/proposals/context-sensitive-resolution.md)를 참조하세요.
> 
{style="tip"}

봉인된 클래스를 `when` 표현식과 함께 사용할 때 가드 조건(guard conditions)을 추가하여 단일 브랜치에서 추가적인 검사를 포함할 수도 있습니다. 
자세한 내용은 [`when` 표현식의 가드 조건](control-flow.md#guard-conditions-in-when-expressions)을 참조하세요.

> 멀티플랫폼 프로젝트에서 공통 코드에 [기대 선언(expected declaration)](https://kotlinlang.org/docs/multiplatform/multiplatform-expect-actual.html)인 `when` 표현식이 포함된 봉인된 클래스가 있다면, 여전히 `else` 브랜치가 필요합니다. 
> 이는 `actual` 플랫폼 구현의 하위 클래스가 공통 코드에서는 알 수 없는 방식으로 봉인된 클래스를 확장할 수 있기 때문입니다.
>
{style="note"}

## 사용 사례 시나리오

봉인된 클래스와 인터페이스가 특히 유용할 수 있는 몇 가지 실제 시나리오를 살펴보겠습니다.

### UI 애플리케이션의 상태 관리

봉인된 클래스를 사용하여 애플리케이션의 다양한 UI 상태를 표현할 수 있습니다. 
이 접근 방식은 UI 변경 사항을 구조적이고 안전하게 처리할 수 있게 해줍니다. 
이 예제는 다양한 UI 상태를 관리하는 방법을 보여줍니다:

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

### 결제 수단 처리

실제 비즈니스 애플리케이션에서 다양한 결제 수단을 효율적으로 처리하는 것은 공통적인 요구 사항입니다. 
봉인된 클래스를 `when` 표현식과 함께 사용하여 이러한 비즈니스 로직을 구현할 수 있습니다. 
다양한 결제 수단을 봉인된 클래스의 하위 클래스로 표현함으로써, 트랜잭션 처리를 위한 명확하고 관리하기 쉬운 구조를 확립할 수 있습니다:

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

`Payment`는 이커머스 시스템의 다양한 결제 수단(`CreditCard`, `PayPal`, `Cash`)을 나타내는 봉인된 클래스입니다. 
각 하위 클래스는 `CreditCard`를 위한 `number`와 `expiryDate`, `PayPal`을 위한 `email`과 같이 고유한 속성을 가질 수 있습니다.

`processPayment()` 함수는 다양한 결제 수단을 처리하는 방법을 보여줍니다. 
이 방식은 가능한 모든 결제 타입을 고려하도록 보장하며, 향후 새로운 결제 수단이 추가되어도 시스템이 유연하게 유지되도록 합니다.

### API 요청-응답 처리

봉인된 클래스와 인터페이스를 사용하여 API 요청 및 응답을 처리하는 사용자 인증 시스템을 구현할 수 있습니다. 
이 사용자 인증 시스템에는 로그인 및 로그아웃 기능이 있습니다. 
`ApiRequest` 봉인된 인터페이스는 구체적인 요청 타입인 로그인을 위한 `LoginRequest`와 로그아웃 작업을 위한 `LogoutRequest`를 정의합니다. 
봉인된 클래스인 `ApiResponse`는 사용자 데이터가 포함된 `UserSuccess`, 사용자가 없을 때의 `UserNotFound`, 그리고 실패 시의 `Error`와 같은 다양한 응답 시나리오를 캡슐화합니다. 
`handleRequest` 함수는 `when` 표현식을 사용하여 이러한 요청들을 타입 안전한 방식으로 처리하며, `getUserById`는 사용자 조회를 시뮬레이션합니다:

```kotlin
// 필요한 모듈 임포트
import io.ktor.server.application.*
import io.ktor.server.resources.*

import kotlinx.serialization.*

// Ktor 리소스를 사용하여 API 요청을 위한 봉인된 인터페이스 정의
@Resource("api")
sealed interface ApiRequest

@Serializable
@Resource("login")
data class LoginRequest(val username: String, val password: String) : ApiRequest

@Serializable
@Resource("logout")
object LogoutRequest : ApiRequest

// 상세한 응답 타입을 가진 ApiResponse 봉인된 클래스 정의
sealed class ApiResponse {
    data class UserSuccess(val user: UserData) : ApiResponse()
    data object UserNotFound : ApiResponse()
    data class Error(val message: String) : ApiResponse()
}

// 성공 응답에서 사용될 사용자 데이터 클래스
data class UserData(val userId: String, val name: String, val email: String)

// 사용자 자격 증명을 검증하는 함수 (데모용)
fun isValidUser(username: String, password: String): Boolean {
    // 일부 검증 로직 (여기서는 자리 표시자일 뿐입니다)
    return username == "validUser" && password == "validPass"
}

// 상세한 응답과 함께 API 요청을 처리하는 함수
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
            // 이 예제에서는 로그아웃 작업이 항상 성공한다고 가정합니다.
            ApiResponse.UserSuccess(UserData("userId", "userName", "userEmail")) // 데모용
        }
    }
}

// getUserById 호출을 시뮬레이션하는 함수
fun getUserById(userId: String): ApiResponse {
    return if (userId == "validUserId") {
        ApiResponse.UserSuccess(UserData("validUserId", "John Doe", "john@example.com"))
    } else {
        ApiResponse.UserNotFound
    }
    // 에러 처리는 Error 응답을 결과로 낼 수도 있습니다.
}

// 사용법을 보여주는 메인 함수
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

## 다음 단계

[Kotlin의 상속](inheritance.md)에 대해 더 자세히 알아보세요.