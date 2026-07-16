[//]: # (title: 예측 가능성)

견고하고 사용자 친화적인 Kotlin 라이브러리를 설계하려면 일반적인 사용 사례를 예측하고, 확장성을 허용하며, 적절한 사용법을 강제하는 것이 필수적입니다.
기본 설정, 에러 처리 및 상태 관리에 대한 모범 사례를 따르면 라이브러리의 무결성과 품질을 유지하면서 
사용자에게 원활한 경험을 제공할 수 있습니다.

## 기본적으로 올바르게 동작하게 하기

라이브러리는 각 사용 사례에 대한 "해피 패스(happy path)"를 예측하고 그에 따라 기본 설정을 제공해야 합니다.
사용자가 라이브러리를 올바르게 작동시키기 위해 기본값을 직접 제공할 필요가 없어야 합니다.

예를 들어, [Ktor `HttpClient`](https://ktor.io/docs/client-create-new-application.html)를 사용할 때 가장 일반적인 
사용 사례는 서버에 GET 요청을 보내는 것입니다.
이는 필수 정보만 지정하면 되는 아래 코드를 사용하여 수행할 수 있습니다.

```kotlin
val client = HttpClient(CIO)
val response: HttpResponse = client.get("https://ktor.io/")
```

필수 HTTP 헤더 값이나 응답의 가능한 상태 코드에 대한 커스텀 이벤트 핸들러를 제공할 필요가 없습니다.

사용 사례에 명확한 "해피 패스"가 없거나, 매개변수에 기본값이 있어야 하지만 논란의 여지가 없는 옵션이 없다면, 
이는 요구사항 분석에 결함이 있음을 나타낼 가능성이 높습니다.

## 확장의 기회 제공하기

올바른 선택을 예측할 수 없는 경우, 사용자가 선호하는 방식을 지정할 수 있도록 하세요.
라이브러리는 또한 사용자가 자신만의 방식을 제공하거나 서드파티 확장을 사용할 수 있도록 허용해야 합니다.

예를 들어, [Ktor `HttpClient`](https://ktor.io/docs/client-serialization.html)를 사용하면 사용자는 클라이언트를 구성할 때 
콘텐츠 협상(content negotiation) 지원을 설치하고 선호하는 직렬화 형식을 지정할 수 있습니다.

```kotlin
val client = HttpClient(CIO) {
    install(ContentNegotiation) {
        json(Json {
            prettyPrint = true
            isLenient = true
        })
    }
}
```

사용자는 어떤 플러그인을 설치할지 선택하거나 [클라이언트 플러그인 정의를 위한 별도의 API](https://ktor.io/docs/client-custom-plugins.html)를 사용하여 자신만의 플러그인을 만들 수 있습니다.

또한 사용자는 라이브러리의 타입에 대해 확장 함수와 프로퍼티를 정의할 수 있습니다.
라이브러리 제작자는 [확장을 고려한 설계](api-guidelines-readability.md#use-extension-functions-and-properties)를 하고, 
라이브러리 타입이 명확한 핵심 개념을 갖도록 함으로써 이를 더 쉽게 만들 수 있습니다.

## 원치 않거나 유효하지 않은 확장 방지하기

사용자가 원래 설계를 위반하거나 문제 도메인의 규칙 내에서 불가능한 방식으로 라이브러리를 확장할 수 없어야 합니다.

예를 들어, 데이터를 JSON으로 마샬링(marshaling)하거나 JSON에서 데이터를 읽어올 때 출력 형식에서는 6가지 타입만 지원됩니다.
`object`, `array`, `number`, `string`, `boolean`, `null`.

만약 `JsonElement`라는 열린 클래스(open class)나 인터페이스를 생성하면, 사용자는 `JsonDate`와 같은 유효하지 않은 파생 타입을 만들 수 있습니다.
대신 `JsonElement` 인터페이스를 봉인(sealed)하고 각 타입에 대한 구현을 제공할 수 있습니다.

```kotlin
sealed interface JsonElement

class JsonNumber(val value: Number) : JsonElement
class JsonObject(val values: Map<String, JsonElement>) : JsonElement
class JsonArray(val values: List<JsonElement>) : JsonElement
class JsonBoolean(val value: Boolean) : JsonElement
class JsonString(val value: String) : JsonElement
object JsonNull : JsonElement
```

봉인된 타입은 또한 컴파일러가 `else` 문 없이도 `when` 표현식이 모든 경우를 다루는지(exhaustive) 확인할 수 있게 하여 
가독성과 일관성을 향상시킵니다.

## 가변 상태 노출 피하기

여러 값을 관리할 때, API는 가능하면 읽기 전용 컬렉션을 받거나 반환해야 합니다.
가변(mutable) 컬렉션은 스레드 안전하지 않으며 라이브러리에 복잡성과 예측 불가능성을 초래합니다.

예를 들어, 사용자가 API 엔트리 포인트에서 반환된 가변 컬렉션을 수정하는 경우, 
그들이 구현 구조를 수정하는 것인지 복사본을 수정하는 것인지 불분명해집니다.
마찬가지로, 사용자가 컬렉션을 라이브러리에 전달한 후 컬렉션 내의 값을 수정할 수 있다면, 
이것이 구현에 영향을 미치는지 여부가 불분명해집니다.

배열은 가변 컬렉션이므로 API에서 사용하지 마세요.
배열을 반드시 사용해야 한다면, 데이터를 사용자와 공유하기 전에 방어적 복사본(defensive copies)을 만드세요. 이를 통해 데이터 구조가 수정되지 않은 상태로 유지되도록 보장할 수 있습니다.

방어적 복사본을 만드는 이 정책은 `vararg` 인자에 대해 컴파일러에 의해 자동으로 수행됩니다.
`vararg` 인자가 필요한 곳에 기존 배열을 전달하기 위해 스프레드 연산자(spread operator)를 사용하면 배열의 복사본이 자동으로 생성됩니다.

이 동작은 다음 예제에서 확인할 수 있습니다.

```kotlin
fun main() {
    fun demo(vararg input: String): `Array<out String>` = input

    val originalArray = arrayOf("one", "two", "three", "four")
    val newArray = demo(*originalArray)

    originalArray[1] = "ten"

    // "one, ten, three, four" 출력
    println(originalArray.joinToString())

    // "one, two, three, four" 출력
    println(newArray.joinToString())
}
```

## 입력 및 상태 검증하기

구현이 진행되기 전에 입력과 기존 상태를 검증하여 라이브러리가 올바르게 사용되는지 확인하세요.
입력을 검증하려면 [`require`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin/require.html) 함수를 사용하고, 기존 상태를 검증하려면 [`check`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin/check.html) 함수를 사용하세요.

`require` 함수는 조건이 `false`인 경우 [`IllegalArgumentException`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin/-illegal-argument-exception/#kotlin.IllegalArgumentException)을 던져, 적절한 에러 메시지와 함께 함수가 즉시 실패하도록 합니다.

```kotlin
fun saveUser(username: String, password: String) {
    require(username.isNotBlank()) { "Username should not be blank" }
    require(username.all { it.isLetterOrDigit() }) {
        "Username can only contain letters and digits, was: $username"
    }
    require(password.isNotBlank()) { "Password should not be blank" }
    require(password.length >= 7) {
        "Password must contain at least 7 characters"
    }

    /* 구현 진행 가능 */
}

```

위의 유효하지 않은 문자가 포함된 사용자 이름에 대한 에러 메시지에서 잘못된 사용자 이름을 포함한 것처럼, 에러 메시지에는 사용자가 실패 원인을 판단하는 데 도움이 되는 관련 입력이 포함되어야 합니다.
이 관행의 예외는 에러 메시지에 값을 포함하는 것이 보안 취약점의 일부로 악용될 수 있는 정보를 노출할 수 있는 경우입니다. 이것이 비밀번호 길이에 대한 에러 메시지에 입력된 비밀번호를 포함하지 않는 이유입니다.

마찬가지로, `check` 함수는 조건이 `false`인 경우 [`IllegalStateException`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin/-illegal-state-exception/#kotlin.IllegalStateException)을 던집니다.
아래 예제와 같이 이 함수를 사용하여 인스턴스의 상태를 확인하세요.

```kotlin
class ShoppingCart {
    private val contents = mutableListOf<Item>()

    fun addItem(item: Item) {
       contents.add(item)
    }

    fun purchase(): Amount {
       check(contents.isNotEmpty()) {
           "Cannot purchase an empty cart"
       }
       // 금액 계산 및 반환
    }
}
```

## 다음 단계

가이드의 다음 파트에서는 디버깅 용이성(debuggability)에 대해 알아봅니다.

[다음 파트로 진행하기](api-guidelines-debuggability.md)