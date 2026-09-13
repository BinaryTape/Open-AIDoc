[//]: # (title: 디버깅 용이성)

여러분의 라이브러리 사용자는 라이브러리의 기능을 기반으로 새로운 기능을 빌드하게 되며, 그 과정에서 식별하고 해결해야 할 오류가 발생할 수 있습니다.
이러한 오류 해결 과정은 개발 중에 디버거 내에서 수행되거나, 운영 환경에서 로깅 및 관측성(observability) 도구를 사용하여 수행될 수 있습니다.
여러분의 라이브러리는 디버깅을 더 쉽게 만들기 위해 다음과 같은 베스트 프랙티스를 따를 수 있습니다.

## 상태를 가지는 타입에 toString 메서드 제공 {id="provide-a-tostring-method-for-stateful-types"}

상태를 포함하는 모든 타입에 대해 의미 있는 `toString` 구현을 제공하세요.
이 구현은 내부 타입일지라도 인스턴스의 현재 콘텐츠를 이해하기 쉬운 형태로 반환해야 합니다.

`toString`으로 표현된 타입은 종종 로그에 기록되므로, 이 메서드를 구현할 때 보안을 고려하고 민감한 사용자 데이터가 반환되지 않도록 주의하세요.

라이브러리의 서로 다른 타입 간에 상태를 설명하는 데 사용되는 형식이 최대한 일관되도록 하세요.
이 형식은 API에 의해 구현된 계약(contract)의 일부인 경우 명확하게 설명되고 철저히 문서화되어야 합니다.
`toString` 메서드의 출력은 예를 들어 자동화된 테스트 도구 등에서 파싱을 지원할 수도 있습니다.

예를 들어, 서비스 구독을 지원하는 라이브러리의 다음 타입들을 살펴보겠습니다.

```kotlin
enum class SubscriptionResultReason {
    Success, InsufficientFunds, IncompatibleAccount
}

class SubscriptionResult(
    val result: Boolean,
    val reason: SubscriptionResultReason,
    val description: String
)
```

`toString` 메서드가 없으면 `SubscriptionResult` 인스턴스를 출력하는 것은 그리 유용하지 않습니다.

```kotlin
fun main() {
    val result = SubscriptionResult(
       false,
       IncompatibleAccount,
       "Users account does not support this type of subscription"
    )
    
    // 'org.example.SubscriptionResult@13221655'를 출력함
    println(result)
}
```

디버거에서도 정보가 즉시 표시되지 않습니다.

![디버거에서의 결과](debugger-result.png){width=500}

단순한 `toString` 구현을 추가하면 두 경우 모두 출력이 크게 개선됩니다.

```kotlin
// 'Subscription failed (reason=IncompatibleAccount, description="Users 
// account does not support this type of subscription")'를 출력함
override fun toString(): String {
    val resultText = if(result) "succeeded" else "failed"
    return "Subscription $resultText (reason=$reason, description=\"$description\")"
}
```

![toString을 추가하면 훨씬 더 나은 결과가 나옵니다](debugger-result-tostring.png){width=700}

`toString` 메서드를 자동으로 얻기 위해 데이터 클래스(data classes)를 사용하고 싶은 유혹이 들 수 있지만, 하위 호환성 문제로 인해 권장되지 않습니다.
데이터 클래스에 대한 자세한 내용은 [API에서 데이터 클래스 사용 피하기](api-guidelines-backward-compatibility.md#avoid-using-data-classes-in-your-api) 섹션에서 다룹니다.

`toString` 메서드에서 설명하는 상태가 반드시 문제 도메인(problem domain)의 정보일 필요는 없다는 점에 유의하세요.
위의 예시처럼 진행 중인 요청의 상태, 외부 서비스로의 연결 상태, 또는 진행 중인 작업 내의 중간 상태와 관련될 수 있습니다.

예를 들어, 다음과 같은 빌더 타입을 고려해 보세요.

```kotlin
class Person(
    val name: String?,
    val age: Int?,
    val children: List<Person>
) {
    override fun toString(): String =
        "Person(name=$name, age=$age, children=$children)"
}

class PersonBuilder {
    var name: String? = null
    var age: Int? = null
    val children = arrayListOf<Person>()

    fun child(personBuilder: PersonBuilder.() -> Unit = {}) {
       children.add(person(personBuilder))
    }
    fun build(): Person = Person(name, age, children)
}

fun person(personBuilder: PersonBuilder.() -> Unit = {}): Person = 
    PersonBuilder().apply(personBuilder).build()
```

이 타입을 사용하는 방법은 다음과 같습니다.

![빌더 타입 예시 사용](halt-breakpoint.png){width=500}

위 이미지에 표시된 중단점(breakpoint)에서 코드를 멈추면, 표시되는 정보가 도움이 되지 않을 것입니다.

![중단점에서 코드 중단 결과](halt-result.png){width=500}

단순한 `toString` 구현을 추가하면 훨씬 더 도움이 되는 출력을 얻을 수 있습니다.

```kotlin
override fun toString(): String =
    "PersonBuilder(name=$name, age=$age, children=$children)"
```

이 구현을 추가하면 디버거에 다음과 같이 표시됩니다.

![중단점에 toString 추가](halt-tostring-result.png){width=700}

이렇게 하면 어떤 필드가 설정되었고 어떤 필드가 설정되지 않았는지 즉시 확인할 수 있습니다.

## 예외 처리에 대한 정책 채택 및 문서화 {id="adopt-and-document-a-policy-for-handling-exceptions"}

[적절한 오류 처리 메커니즘 선택](api-guidelines-consistency.md#choose-the-appropriate-error-handling-mechanism) 섹션에서 논의했듯이, 라이브러리가 오류를 알리기 위해 예외를 던지는 것이 적절한 경우가 있습니다.
이를 위해 고유한 예외 타입을 만들 수 있습니다.

저수준 API를 추상화하고 단순화하는 라이브러리는 의존성(dependencies)에서 던지는 예외도 처리해야 합니다.
라이브러리는 예외를 억제하거나, 그대로 전달하거나, 다른 타입의 예외로 변환하거나, 다른 방식으로 사용자에게 오류를 알릴 수 있습니다.

상황에 따라 이러한 옵션 중 어느 것이든 유효할 수 있습니다. 예를 들어:

* 사용자가 단순히 라이브러리 B를 편리하게 사용하기 위해 라이브러리 A를 채택한 경우, 라이브러리 A가 라이브러리 B에서 생성된 모든 예외를 수정 없이 다시 던지는(rethrow) 것이 적절할 수 있습니다.
* 라이브러리 A가 순수하게 내부 구현 세부 사항으로 라이브러리 B를 채택한 경우, 라이브러리 B에서 던져진 라이브러리 전용 예외는 라이브러리 A의 사용자에게 절대 노출되지 않아야 합니다.

사용자가 여러분의 라이브러리를 생산적으로 사용할 수 있도록 일관된 예외 처리 방식을 채택하고 문서화해야 합니다.
이는 디버깅 시 특히 중요합니다. 라이브러리 사용자는 디버거나 로그에서 예외가 여러분의 라이브러리에서 발생했음을 인식할 수 있어야 합니다.

예외 타입은 오류 유형을 나타내야 하며, 예외의 데이터는 사용자가 문제의 근본 원인을 찾는 데 도움이 되어야 합니다.
일반적인 패턴은 저수준 예외를 라이브러리 전용 예외로 감싸고, 원래 예외는 `cause`를 통해 접근할 수 있도록 하는 것입니다.

## 커스텀 예외에 대한 코루틴 스택 트레이스 복구 지원 {id="support-coroutine-stack-trace-recovery-for-custom-exceptions"}
<primary-label ref="experimental-general"/>

라이브러리의 커스텀 예외 타입에 코루틴 [스택 트레이스 복구](coroutines-debugging.md#stack-trace-recovery) 지원을 추가하여 디버깅을 더 쉽게 만들 수 있습니다.
이는 라이브러리의 `kotlinx.coroutines` 라이브러리 및 Kotlin의 기타 비동기 런타임에 대한 지원을 향상시킵니다.

코루틴이 일시 중단 함수를 통해 다른 코루틴으로부터 예외를 전달받으면, 스택 트레이스 복구는 해당 함수 호출로 이어지는 스택 프레임이 포함된 예외 복사본을 생성합니다.

`kotlinx.coroutines` 라이브러리는 예외 메시지만 받는 생성자, 원인(cause)만 받는 생성자, 둘 다 받는 생성자, 또는 매개변수가 없는 생성자를 가진 예외에 대해 자동으로 스택 트레이스 복구를 수행합니다.
라이브러리의 예외 타입에 줄 번호나 오류 코드와 같은 추가 생성자 인수가 필요한 경우, [`StackTraceRecoverable`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.coroutines.debug/-stack-trace-recoverable/) 인터페이스를 구현하세요.

이 인터페이스를 구현하려면 [`copyForStackTraceRecovery()`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.coroutines.debug/-stack-trace-recoverable/copy-for-stack-trace-recovery.html) 함수를 오버라이드하세요.
오버라이드 구현에서는 스택 트레이스 복구를 위한 새로운 예외 인스턴스를 반환하거나, `kotlinx.coroutines` 라이브러리가 예외를 복사하지 않도록 하려면 `null`을 반환하세요.

`StackTraceRecoverable` 인터페이스는 Kotlin 표준 라이브러리의 일부이므로, 이를 구현하더라도 `kotlinx.coroutines` 라이브러리에 대한 의존성이 추가되지 않습니다.

다음은 스택 트레이스 복구를 위해 새 인스턴스를 생성할 때 `line` 프로퍼티를 보존하는 커스텀 예외의 예시입니다.

```kotlin
import kotlin.coroutines.ExperimentalStdlibCoroutineSupportApi
import kotlin.coroutines.debug.StackTraceRecoverable

@OptIn(ExperimentalStdlibCoroutineSupportApi::class)
class FileEditException
// IllegalStateException 생성자에 cause를 전달하려면
// private 생성자가 필요합니다
private constructor(
    val line: Int,
    private val detail: String,
    cause: Throwable?,
) : IllegalStateException("When editing line $line: $detail", cause),
    // 스택 트레이스 복구를 위해 StackTraceRecoverable을 구현합니다
    StackTraceRecoverable<FileEditException> {

    constructor(line: Int, detail: String) : this(line, detail, null)

    // 줄 번호와 메시지 세부 정보를 복사합니다
    override fun copyForStackTraceRecovery(): FileEditException =
        FileEditException(line, detail, this)
    }

fun main() {
    val original = FileEditException(15, "Unexpected token")
    
    // 동작을 테스트하는 경우가 아니라면 일반적으로 이 함수를 직접 호출할 필요가 없습니다
    // kotlinx.coroutines 라이브러리가 스택 트레이스 복구 중에 이를 자동으로 호출합니다
    val copy = original.copyForStackTraceRecovery()

    println(copy.message)
    // When editing line 15: Unexpected token

    println(copy.cause == original)
    // true
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="2.4.20"}

## 다음 단계 {id="next-step"}

가이드의 다음 부분에서는 테스트 용이성(testability)에 대해 알아봅니다.

[다음 단계로 진행](api-guidelines-testability.md)