[//]: # (title: Kotlin 2.2.20의 새로운 기능)

<web-summary>Kotlin 2.2.20 릴리스 노트를 통해 새로운 언어 기능, Kotlin Multiplatform, JVM, Native, JS, Wasm의 업데이트 사항, 그리고 Gradle 및 Maven 빌드 도구 지원에 대해 알아보세요.</web-summary>

_[출시일: 2025년 9월 10일](releases.md#release-history)_

<tldr>
    <p>버그 수정 릴리스인 2.2.21에 대한 자세한 내용은 <a href="https://github.com/JetBrains/kotlin/releases/tag/v2.2.21">변경 로그(changelog)</a>를 참조하세요.</p>
</tldr>

Kotlin 2.2.20 릴리스가 출시되었습니다. 이번 릴리스는 웹 개발을 위한 중요한 변경 사항을 담고 있습니다. [Kotlin/Wasm이 베타(Beta) 단계로 진입](#kotlin-wasm)했으며, [JavaScript interop의 예외 처리 개선](#improved-exception-handling-in-kotlin-wasm-and-javascript-interop), [npm 의존성 관리 분리](#separated-npm-dependencies), [브라우저 내장 디버깅 지원](#support-for-debugging-in-browsers-without-configuration), 그리고 [`js`와 `wasmJs` 타겟을 위한 새로운 공유 소스 세트(shared source set)](#shared-source-set-for-js-and-wasmjs-targets)가 추가되었습니다.

또한, 다음과 같은 주요 하이라이트가 포함되어 있습니다:

* **Kotlin Multiplatform**: [Swift export가 기본으로 제공](#swift-export-available-by-default)되며, [Kotlin 라이브러리를 위한 안정적인 크로스 플랫폼 컴파일](#stable-cross-platform-compilation-for-kotlin-libraries) 및 [공통 의존성(common dependencies) 선언을 위한 새로운 방식](#new-approach-for-declaring-common-dependencies)이 도입되었습니다.
* **언어(Language)**: [suspend 함수 타입이 포함된 오버로드에 람다를 전달할 때의 오버로드 해소가 개선](#improved-overload-resolution-for-lambdas-with-suspend-function-types)되었습니다.
* **Kotlin/Native**: [Xcode 26 지원, 스택 카나리(stack canaries) 지원, 그리고 릴리스 바이너리 크기 축소](#kotlin-native)가 이루어졌습니다.
* **Kotlin/JS**: [`Long` 값이 JavaScript `BigInt`로 컴파일](#usage-of-the-bigint-type-to-represent-kotlin-s-long-type)됩니다.

> 웹용 Compose Multiplatform이 베타(Beta) 단계에 진입했습니다. 자세한 내용은 [블로그 포스트](https://blog.jetbrains.com/kotlin/2025/09/compose-multiplatform-1-9-0-compose-for-web-beta/)에서 확인하세요.
>
{style="note"}

이 비디오에서 업데이트에 대한 짧은 요약을 확인하실 수도 있습니다:

<video src="https://www.youtube.com/v/QWpp5-LlTqA" title="What's new in Kotlin 2.2.21"/>

> Kotlin 릴리스 주기에 대한 정보는 [Kotlin 릴리스 프로세스](releases.md)를 참조하세요.
>
{style="tip"}

## IDE 지원

Kotlin 2.2.20을 지원하는 Kotlin 플러그인은 최신 버전의 IntelliJ IDEA 및 Android Studio에 포함되어 있습니다. 
업데이트하려면 빌드 스크립트에서 Kotlin 버전을 2.2.20으로 변경하기만 하면 됩니다.

자세한 내용은 [새 릴리스로 업데이트하기](releases.md#update-to-a-new-kotlin-version)를 참조하세요.

## 언어(Language)

Kotlin 2.2.20에서는 Kotlin 2.3.0으로 계획된 향후 언어 기능들을 미리 사용해 볼 수 있습니다. 여기에는 [suspend 함수 타입이 포함된 오버로드에 람다를 전달할 때의 오버로드 해소 개선](#improved-overload-resolution-for-lambdas-with-suspend-function-types)과 [명시적 반환 타입이 있는 표현식 본문(expression body)에서의 `return` 문 지원](#support-for-return-statements-in-expression-bodies-with-explicit-return-types)이 포함됩니다. 또한 이번 릴리스에는 [`when` 표현식의 완결성 검사(exhaustiveness checks) 개선](#data-flow-based-exhaustiveness-checks-for-when-expressions), [실체화된(reified) `Throwable` 캐치 지원](#support-for-reified-types-in-catch-clauses), 그리고 [Kotlin 계약(contracts)](#improved-kotlin-contracts)에 대한 개선 사항이 포함되어 있습니다.

### suspend 함수 타입이 포함된 람다에 대한 오버로드 해소 개선

이전에는 함수를 일반 함수 타입과 `suspend` 함수 타입으로 오버로딩할 때 람다를 전달하면 모호함(ambiguity) 오류가 발생했습니다. 명시적 타입 캐스팅으로 이 오류를 해결할 수 있었지만, 컴파일러가 `No cast needed` 경고를 잘못 보고하는 문제가 있었습니다.

```kotlin
// 두 개의 오버로드 정의
fun transform(block: () -> Int) {}
fun transform(block: suspend () -> Int) {}

fun test() {
    // 오버로드 해소 모호함으로 인해 실패
    transform({ 42 })

    // 명시적 캐스트를 사용하지만, 컴파일러가 잘못된 
    // "No cast needed" 경고를 보고함
    transform({ 42 } as () -> Int)
}
```

이번 변경을 통해 일반 함수 타입과 `suspend` 함수 타입 오버로드가 모두 정의되어 있을 때, 캐스트가 없는 람다는 일반 오버로드로 해석됩니다. `suspend` 키워드를 사용하여 명시적으로 suspend 오버로드로 해석되도록 할 수 있습니다.

```kotlin
// transform(() -> Int)로 해석됨
transform({ 42 })

// transform(suspend () -> Int)로 해석됨
transform(suspend { 42 })
```

이 동작은 Kotlin 2.3.0에서 기본적으로 활성화될 예정입니다. 지금 바로 테스트해 보려면 다음 컴파일러 옵션을 사용하여 언어 버전을 `2.3`으로 설정하세요:

```kotlin
-language-version 2.3
```

또는 `build.gradle(.kts)` 파일에서 다음과 같이 설정할 수 있습니다:

```kotlin
kotlin {
    compilerOptions {
        languageVersion.set(org.jetbrains.kotlin.gradle.dsl.KotlinVersion.KOTLIN_2_3)
    }
}
```

여러분의 피드백을 이슈 트래커인 [YouTrack](https://youtrack.jetbrains.com/issue/KT-23610)에 남겨주시면 감사하겠습니다.

### 명시적 반환 타입이 있는 표현식 본문에서의 `return` 문 지원

이전에는 표현식 본문(expression body)에서 `return`을 사용하면 함수의 반환 타입이 `Nothing`으로 추론될 수 있어 컴파일 오류가 발생했습니다.

```kotlin
fun example() = return 42
// 오류: 표현식 본문이 있는 함수에서는 반환(return)이 금지됨
```

이번 변경으로 반환 타입을 명시적으로 작성하는 한, 표현식 본문에서도 `return`을 사용할 수 있게 되었습니다.

```kotlin
// 반환 타입을 명시적으로 지정
fun getDisplayNameOrDefault(userId: String?): String = getDisplayName(userId ?: return "default")

// 반환 타입을 명시적으로 지정하지 않아 실패
fun getDisplayNameOrDefault(userId: String?) = getDisplayName(userId ?: return "default")
```

마찬가지로, 표현식 본문이 있는 함수의 람다 내부나 중첩된 표현식에서의 `return` 문은 의도치 않게 컴파일되곤 했습니다. 이제 Kotlin은 반환 타입이 명시적으로 지정된 경우에만 이러한 케이스를 지원합니다. 명시적 반환 타입이 없는 케이스는 Kotlin 2.3.0에서 지원 중단(deprecated)될 예정입니다.

```kotlin
// 반환 타입이 명시적으로 지정되지 않았고, return 문이 람다 내부에 있어 
// 향후 지원 중단될 예정
fun returnInsideLambda() = run { return 42 }

// 반환 타입이 명시적으로 지정되지 않았고, return 문이 로컬 변수의 초기화 식 
// 내부에 있어 향후 지원 중단될 예정
fun returnInsideIf() = when {
    else -> {
        val result = if (someCondition()) return "" else "value"
        result
    }
}
```

이 동작은 Kotlin 2.3.0에서 기본적으로 활성화될 예정입니다. 지금 바로 테스트해 보려면 다음 컴파일러 옵션을 사용하여 언어 버전을 `2.3`으로 설정하세요:

```kotlin
-language-version 2.3
```

또는 `build.gradle(.kts)` 파일에서 다음과 같이 설정할 수 있습니다:

```kotlin
kotlin {
    compilerOptions {
        languageVersion.set(org.jetbrains.kotlin.gradle.dsl.KotlinVersion.KOTLIN_2_3)
    }
}
```

여러분의 피드백을 이슈 트래커인 [YouTrack](https://youtrack.jetbrains.com/issue/KT-76926)에 남겨주시면 감사하겠습니다.

### when 표현식에 대한 데이터 흐름 기반 완결성 검사
<primary-label ref="experimental-opt-in"/>

Kotlin 2.2.20은 `when` 표현식에 대한 **데이터 흐름 기반(data-flow-based)** 완결성 검사(exhaustiveness checks)를 도입합니다.
기존에는 컴파일러의 검사가 `when` 표현식 자체로 한정되어 불필요한 `else` 브랜치를 추가해야 하는 경우가 많았습니다.
이번 업데이트를 통해 컴파일러는 이전의 조건 검사와 조기 반환(early return)을 추적하므로, 중복된 `else` 브랜치를 제거할 수 있습니다.

예를 들어, 이제 컴파일러는 `if` 조건이 충족될 때 함수가 반환된다는 점을 인식하므로, `when` 표현식에서는 나머지 케이스만 처리하면 됩니다.

```kotlin
enum class UserRole { ADMIN, MEMBER, GUEST }

fun getPermissionLevel(role: UserRole): Int {
    // when 표현식 밖에서 Admin 케이스를 처리
    if (role == UserRole.ADMIN) return 99

    return when (role) {
        UserRole.MEMBER -> 10
        UserRole.GUEST -> 1
        // 더 이상 이 else 브랜치를 포함할 필요가 없음
        // else -> throw IllegalStateException()
    }
}
```

이 기능은 [실험적(Experimental)](components-stability.md#stability-levels-explained)입니다. 이 기능을 활성화하려면 `build.gradle(.kts)` 파일에 다음 컴파일러 옵션을 추가하세요.

```kotlin
kotlin {
    compilerOptions {
        freeCompilerArgs.add("-Xdata-flow-based-exhaustiveness")
    }
}
```

### catch 절에서의 실체화된 타입 지원
<primary-label ref="experimental-opt-in"/>

Kotlin 2.2.20에서 컴파일러는 이제 `inline` 함수의 `catch` 절에서 [실체화된 제네릭 타입 파라미터(reified generic type parameters)](inline-functions.md#reified-type-parameters)를 사용하는 것을 허용합니다.

다음은 그 예시입니다:

```kotlin
inline fun <reified ExceptionType : Throwable> handleException(block: () -> Unit) {
    try {
        block()
        // 이번 변경으로 이제 허용됨
    } catch (e: ExceptionType) {
        println("Caught specific exception: ${e::class.simpleName}")
    }
}

fun main() {
    // IOException을 던질 수 있는 동작 수행 시도
    handleException<java.io.IOException> {
        throw java.io.IOException("File not found")
    }
    // Caught specific exception: IOException
}
```

이전에는 `inline` 함수에서 실체화된 `Throwable` 타입을 캐치하려고 하면 오류가 발생했습니다.

이 동작은 Kotlin 2.4.0에서 기본적으로 활성화될 예정입니다.
지금 사용하려면 `build.gradle(.kts)` 파일에 다음 컴파일러 옵션을 추가하세요:

```kotlin
kotlin {
    compilerOptions {
        freeCompilerArgs.add("-Xallow-reified-type-in-catch")
    }
}
```

Kotlin 팀은 외부 기여자 [Iven Krall](https://github.com/kralliv)의 기여에 감사를 표합니다.

### 개선된 Kotlin 계약 (Contracts)
<primary-label ref="experimental-opt-in"/>

Kotlin 2.2.20은 [Kotlin 계약(contracts)](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.contracts/contract.html)에 대한 다음과 같은 여러 개선 사항을 도입합니다:

* [계약 타입 단언(assertion)에서 제네릭 지원](#support-for-generics-in-contract-type-assertions).
* [프로퍼티 접근자(accessor) 및 특정 연산자 함수 내부의 계약 지원](#support-for-contracts-inside-property-accessors-and-specific-operator-functions).
* 조건이 충족되었을 때 null이 아닌 반환 값을 보장하는 방법으로 [계약 내 `returnsNotNull()` 함수 지원](#support-for-the-returnsnotnull-function-in-contracts).
* 람다 내부로 전달될 때 조건이 참임을 가정할 수 있게 해주는 [새로운 `holdsIn` 키워드](#new-holdsin-keyword).

이러한 개선 사항은 [실험적(Experimental)](components-stability.md#stability-levels-explained)입니다. 사용하려면 계약을 선언할 때 여전히 `@OptIn(ExperimentalContracts::class)` 어노테이션을 사용해야 합니다. `holdsIn` 키워드와 `returnsNotNull()` 함수는 `@OptIn(ExperimentalExtendedContracts::class)` 어노테이션도 필요합니다.

이러한 개선 사항을 사용하려면 아래 각 섹션에 설명된 컴파일러 옵션도 추가해야 합니다.

여러분의 피드백을 [이슈 트래커](https://kotl.in/issue)에 남겨주시면 감사하겠습니다.

#### 계약 타입 단언에서 제네릭 지원

이제 제네릭 타입에 대해 타입 단언(type assertion)을 수행하는 계약을 작성할 수 있습니다:

```kotlin
import kotlin.contracts.*

sealed class Failure {
    class HttpError(val code: Int) : Failure()
    // 다른 실패 타입들을 여기에 추가
}

sealed class Result<out T, out F : Failure> {
    class Success<T>(val data: T) : Result<T, Nothing>()
    class Failed<F : Failure>(val failure: F) : Result<Nothing, F>()
}

@OptIn(ExperimentalContracts::class)
// 제네릭 타입을 단언하기 위해 계약 사용
fun <T, F : Failure> Result<T, F>.isHttpError(): Boolean {
    contract {
        returns(true) implies (this@isHttpError is Result.Failed<Failure.HttpError>)
    }
    return this is Result.Failed && this.failure is Failure.HttpError
}
```

이 예제에서 계약은 `Result` 객체에 대해 타입 단언을 수행하여, 컴파일러가 해당 객체를 단언된 제네릭 타입으로 안전하게 [스마트 캐스트(smart cast)](typecasts.md#smart-casts)할 수 있게 합니다.

이 기능은 [실험적(Experimental)](components-stability.md#stability-levels-explained)입니다. 사용하려면 `build.gradle(.kts)` 파일에 다음 컴파일러 옵션을 추가하세요:

```kotlin
kotlin {
    compilerOptions {
        freeCompilerArgs.add("-Xallow-contracts-on-more-functions")
    }
}
```

#### 프로퍼티 접근자 및 특정 연산자 함수 내부의 계약 지원

이제 프로퍼티 접근자(getter/setter)와 특정 연산자 함수 내부에서 계약을 정의할 수 있습니다.
이를 통해 더 많은 유형의 선언에서 계약을 사용할 수 있어 유연성이 높아집니다.

예를 들어, getter 내부에서 계약을 사용하여 리시버(receiver) 객체에 대한 스마트 캐스팅을 활성화할 수 있습니다:

```kotlin
import kotlin.contracts.*

val Any.isHelloString: Boolean
    get() {
        @OptIn(ExperimentalContracts::class)
        // getter가 true를 반환할 때 리시버를 String으로 스마트 캐스트 활성화
        contract { returns(true) implies (this@isHelloString is String) }
        return "hello" == this
    }

fun printIfHelloString(x: Any) {
    if (x.isHelloString) {
        // 리시버가 String으로 스마트 캐스트된 후 length 출력
        println(x.length)
        // 5
    }
}
```

또한, 다음 연산자 함수에서도 계약을 사용할 수 있습니다:

* `invoke`
* `contains`
* `rangeTo`, `rangeUntil`
* `componentN`
* `iterator`
* `unaryPlus`, `unaryMinus`, `not`
* `inc`, `dec`

다음은 연산자 함수에서 계약을 사용하여 람다 내부의 변수 초기화를 보장하는 예시입니다:

```kotlin
import kotlin.contracts.*

class Runner {
    @OptIn(ExperimentalContracts::class)
    // 람다 내부에서 할당된 변수의 초기화를 가능하게 함
    operator fun invoke(block: () -> Unit) {
        contract {
            callsInPlace(block, InvocationKind.EXACTLY_ONCE)
        }
        block()
    }
}

fun testOperator(runner: Runner) {
    val number: Int
    runner {
        number = 1
    }
    // 계약에 의해 보장된 확실한 초기화 후 값 출력
    println(number)
    // 1
}
```

이 기능은 [실험적(Experimental)](components-stability.md#stability-levels-explained)입니다. 사용하려면 `build.gradle(.kts)` 파일에 다음 컴파일러 옵션을 추가하세요:

```kotlin
kotlin {
    compilerOptions {
        freeCompilerArgs.add("-Xallow-contracts-on-more-functions")
    }
}
```

#### 계약 내 `returnsNotNull()` 함수 지원

Kotlin 2.2.20은 계약을 위한 [`returnsNotNull()`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.contracts/-contract-builder/returns-not-null.html) 함수를 도입합니다.
이 함수를 사용하면 특정 조건이 충족되었을 때 함수가 null이 아닌 값을 반환함을 보장할 수 있습니다.
이를 통해 별도의 nullable 및 non-nullable 함수 오버로드를 하나의 간결한 함수로 대체하여 코드를 단순화할 수 있습니다:

```kotlin
import kotlin.contracts.*

@OptIn(ExperimentalContracts::class, ExperimentalExtendedContracts::class)
fun decode(encoded: String?): String? {
    contract {
        // 입력이 null이 아니면 반환 값도 null이 아님을 보장
        (encoded != null) implies (returnsNotNull())
    }
    if (encoded == null) return null
    return java.net.URLDecoder.decode(encoded, "UTF-8")
}

fun useDecodedValue(s: String?) {
    // 반환 값이 null일 수 있으므로 세이프 콜(safe call) 사용
    decode(s)?.length
    if (s != null) {
        // 스마트 캐스트 후 반환 값을 null이 아닌 것으로 처리
        decode(s).length
    }
}
```

이 예제에서 `decode()` 함수의 계약을 통해 컴파일러는 입력이 null이 아닐 때 반환 값을 스마트 캐스트할 수 있으므로, 추가적인 null 체크나 여러 오버로드가 필요하지 않습니다.

이 기능은 [실험적(Experimental)](components-stability.md#stability-levels-explained)입니다. 사용하려면 `build.gradle(.kts)` 파일에 다음 컴파일러 옵션을 추가하세요:

```kotlin
kotlin {
    compilerOptions {
        freeCompilerArgs.add("-Xallow-condition-implies-returns-contracts")
    }
}
```

#### 새로운 `holdsIn` 키워드

Kotlin 2.2.20은 계약을 위한 새로운 [`holdsIn`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.contracts/-contract-builder/holds-in.html) 키워드를 도입합니다.
이 키워드를 사용하면 특정 람다 내부에서 불리언 조건이 `true`로 가정되도록 보장할 수 있습니다. 이를 통해 계약을 사용하여 조건부 스마트 캐스트가 포함된 DSL을 구축할 수 있습니다.

예시는 다음과 같습니다:

```kotlin
import kotlin.contracts.*

@OptIn(ExperimentalContracts::class, ExperimentalExtendedContracts::class)
fun <T> T.alsoIf(condition: Boolean, block: (T) -> Unit): T {
    contract {
        // 람다가 최대 한 번 실행됨을 선언
        callsInPlace(block, InvocationKind.AT_MOST_ONCE)
        // 람다 내부에서 조건이 true로 가정됨을 선언
        condition holdsIn block
    }
    if (condition) block(this)
    return this
}

fun useApplyIf(input: Any) {
    val result = listOf(1, 2, 3)
        .first()
        .alsoIf(input is Int) {
            // 람다 내부에서 input 파라미터가 Int로 스마트 캐스트됨
            // input과 첫 번째 리스트 요소의 합계를 출력
            println(input + it)
            // 2
        }
        .toString()
}
```

이 기능은 [실험적(Experimental)](components-stability.md#stability-levels-explained)입니다. 사용하려면 `build.gradle(.kts)` 파일에 다음 컴파일러 옵션을 추가하세요:

```kotlin
kotlin {
    compilerOptions {
        freeCompilerArgs.add("-Xallow-holdsin-contract")
    }
}
```

## Kotlin/JVM: `when` 표현식에서 `invokedynamic` 지원
<primary-label ref="experimental-opt-in"/> 

Kotlin 2.2.20부터 `when` 표현식을 `invokedynamic`으로 컴파일할 수 있습니다. 이전에는 여러 타입 검사가 포함된 `when` 표현식이 바이트코드에서 긴 `instanceof` 검사 체인으로 컴파일되었습니다.

이제 다음 조건이 충족될 때 Java `switch` 문에서 생성되는 바이트코드와 유사하게, `invokedynamic`을 사용하여 더 작은 바이트코드를 생성할 수 있습니다:

* `else`를 제외한 모든 조건이 `is` 또는 `null` 검사임.
* 표현식에 [가드 조건(`if`)](control-flow.md#guard-conditions-in-when-expressions)이 포함되어 있지 않음.
* 조건에 가변(mutable) Kotlin 컬렉션(`MutableList`)이나 함수 타입(`kotlin.Function1`, `kotlin.Function2` 등)과 같이 직접 타입 검사가 불가능한 타입이 포함되지 않음.
* `else` 외에 최소 두 개의 조건이 있음.
* 모든 브랜치가 `when` 표현식의 동일한 대상을 검사함.

예를 들어:

```kotlin
open class Example

class A : Example()
class B : Example()
class C : Example()

fun test(e: Example) = when (e) {
    // SwitchBootstraps.typeSwitch와 함께 invokedynamic 사용
    is A -> 1
    is B -> 2
    is C -> 3
    else -> 0
}
```

새 기능이 활성화되면 이 예제의 `when` 표현식은 여러 개의 `instanceof` 검사 대신 단일 `invokedynamic` 타입 스위치로 컴파일됩니다.

이 기능을 활성화하려면 JVM 타겟 21 이상으로 Kotlin 코드를 컴파일하고 다음 컴파일러 옵션을 추가하세요:

```bash
-Xwhen-expressions=indy
```

또는 `build.gradle(.kts)` 파일의 `compilerOptions {}` 블록에 추가하세요:

```kotlin
kotlin {
    compilerOptions {
        freeCompilerArgs.add("-Xwhen-expressions=indy")
    }
}
```

이 기능은 [실험적(Experimental)](components-stability.md#stability-levels-explained)입니다. 여러분의 피드백을 이슈 트래커인 [YouTrack](https://youtrack.jetbrains.com/issue/KT-65688)에 남겨주시면 감사하겠습니다.

## Kotlin Multiplatform

Kotlin 2.2.20은 Kotlin Multiplatform을 위한 중요한 변화를 도입합니다. Swift export가 기본적으로 제공되고, 새로운 공유 소스 세트가 추가되었으며, 공통 의존성을 관리하는 새로운 방식을 시도해 볼 수 있습니다.

### Swift export 기본 제공
<primary-label ref="experimental-general"/> 

Kotlin 2.2.20은 Swift export에 대한 실험적 지원을 도입합니다. 이를 통해 Kotlin 소스를 직접 내보내고 Swift에서 관용적으로(idiomatically) Kotlin 코드를 호출할 수 있게 되어, Objective-C 헤더가 필요하지 않게 됩니다.

이는 Apple 타겟을 위한 멀티플랫폼 개발을 크게 개선할 것입니다. 예를 들어, 최상위 함수가 있는 Kotlin 모듈이 있다면 Swift export를 통해 혼란스러운 Objective-C 언더스코어나 변형된 이름(mangled names) 없이 깔끔하고 모듈별로 명확한 임포트가 가능해집니다.

주요 기능은 다음과 같습니다:

* **멀티 모듈 지원**. 각 Kotlin 모듈이 별도의 Swift 모듈로 내보내져 함수 호출이 단순해집니다.
* **패키지 지원**. 내보내기 중에 Kotlin 패키지가 명시적으로 보존되어 생성된 Swift 코드에서의 이름 충돌을 방지합니다.
* **타입 별칭(Type aliases)**. Kotlin 타입 별칭이 Swift로 내보내지고 보존되어 가독성이 향상됩니다.
* **프리미티브를 위한 향상된 null 허용성**. null 허용성을 보존하기 위해 `Int?`와 같은 타입을 `KotlinInt`와 같은 래퍼 클래스로 박싱해야 했던 Objective-C 상호운용성과 달리, Swift export는 null 허용성 정보를 직접 변환합니다.
* **오버로드**. Swift에서 모호함 없이 Kotlin의 오버로드된 함수를 호출할 수 있습니다.
* **평탄화된 패키지 구조**. Kotlin 패키지를 Swift 열거형(enum)으로 변환하여 생성된 Swift 코드에서 패키지 접두사를 제거할 수 있습니다.
* **모듈 이름 커스터마이징**. Kotlin 프로젝트의 Gradle 설정에서 결과물인 Swift 모듈 이름을 커스터마이징할 수 있습니다.

#### Swift export 활성화 방법

이 기능은 현재 [실험적(Experimental)](components-stability.md#stability-levels-explained)이며, iOS 프레임워크를 Xcode 프로젝트에 연결하기 위해 [직접 통합(direct integration)](https://kotlinlang.org/docs/multiplatform/multiplatform-direct-integration.html)을 사용하는 프로젝트에서만 작동합니다. 이는 IntelliJ IDEA의 Kotlin Multiplatform 플러그인이나 [웹 마법사](https://kmp.jetbrains.com/)를 통해 생성된 멀티플랫폼 프로젝트의 표준 구성입니다.

Swift export를 사용해 보려면 Xcode 프로젝트를 설정하세요:

1. Xcode에서 프로젝트 설정을 엽니다.
2. **Build Phases** 탭에서 `embedAndSignAppleFrameworkForXcode` 태스크가 있는 **Run Script** 단계를 찾습니다.
3. 스크립트가 실행 단계에서 `embedSwiftExportForXcode` 태스크를 포함하도록 수정합니다:

   ```bash
   ./gradlew :<공유 모듈 이름>:embedSwiftExportForXcode
   ```

   ![Swift export 스크립트 추가](xcode-swift-export-run-script-phase.png){width=700}

4. 프로젝트를 빌드합니다. Swift 모듈은 빌드 출력 디렉토리에 생성됩니다.

이 기능은 기본적으로 활성화되어 있습니다. 이전 릴리스에서 이미 활성화했다면 이제 `gradle.properties` 파일에서 `kotlin.experimental.swift-export.enabled`를 삭제할 수 있습니다.

> 시간을 아끼려면 Swift export가 이미 설정된 [공식 샘플](https://github.com/Kotlin/swift-export-sample)을 클론해 보세요.
>
{style="tip"}

Swift export에 대한 자세한 내용은 [문서](native-swift-export.md)를 참조하세요.

#### 피드백 남기기

향후 Kotlin 릴리스에서 Swift export 지원을 확장하고 점진적으로 안정화할 계획입니다. Kotlin 2.2.20 이후에는 특히 코루틴 및 플로우(Flow)와 관련하여 Kotlin과 Swift 간의 상호운용성을 개선하는 데 집중할 것입니다.

Swift export 지원은 Kotlin Multiplatform의 중요한 변화입니다. 여러분의 피드백을 기다립니다:

* Kotlin Slack에서 개발 팀에 직접 문의하세요 – [초대 받기](https://surveys.jetbrains.com/s3/kotlin-slack-sign-up?_gl=1*ju6cbn*_ga*MTA3MTk5NDkzMC4xNjQ2MDY3MDU4*_ga_9J976DJZ68*MTY1ODMzNzA3OS4xMDAuMS4xNjU4MzQwODEwLjYw) 및 [#swift-export](https://kotlinlang.slack.com/archives/C073GUW6WN9) 채널 참여.
* Swift export 사용 중 겪는 문제는 [YouTrack](https://kotl.in/issue)에 보고해 주세요.

### `js` 및 `wasmJs` 타겟을 위한 공유 소스 세트

이전에는 Kotlin Multiplatform에서 JavaScript(`js`)와 WebAssembly(`wasmJs`) 웹 타겟을 위한 공유 소스 세트가 기본적으로 포함되지 않았습니다. `js`와 `wasmJs` 간에 코드를 공유하려면 커스텀 소스 세트를 수동으로 구성하거나, `js`용과 `wasmJs`용으로 코드를 두 군데 작성해야 했습니다. 예를 들면:

```kotlin
// commonMain
expect suspend fun readCopiedText(): String

// jsMain
external interface Navigator { val clipboard: Clipboard }
// JS와 Wasm에서 서로 다른 interop
external interface Clipboard { fun readText(): Promise<String> }
external val navigator: Navigator

suspend fun readCopiedText(): String {
    // JS와 Wasm에서 서로 다른 interop
    return navigator.clipboard.readText().await()
}

// wasmJsMain
external interface Navigator { val clipboard: Clipboard }
external interface Clipboard { fun readText(): Promise<JsString> }
external val navigator: Navigator

suspend fun readCopiedText(): String {
    return navigator.clipboard.readText().await().toString()
}
```

이번 릴리스부터 [기본 계층 구조 템플릿(default hierarchy template)](https://kotlinlang.org/docs/multiplatform/multiplatform-hierarchy.html#default-hierarchy-template)을 사용할 때 Kotlin Gradle 플러그인이 웹을 위한 새로운 공유 소스 세트(`webMain` 및 `webTest`로 구성)를 추가합니다.

이 변경을 통해 `web` 소스 세트는 `js`와 `wasmJs` 소스 세트의 부모가 됩니다. 업데이트된 소스 세트 계층 구조는 다음과 같습니다:

![웹이 포함된 기본 계층 구조 템플릿 예시](default-hierarchy-example-with-web.svg)

새로운 소스 세트를 사용하면 `js`와 `wasmJs` 타겟 모두에 대해 하나의 코드를 작성할 수 있습니다. 공유 코드를 `webMain`에 넣으면 두 타겟 모두에서 자동으로 작동합니다:

```kotlin
// commonMain
expect suspend fun readCopiedText(): String

// webMain
@OptIn(ExperimentalWasmJsInterop::class)
private suspend fun <R : JsAny?> Promise<R>.await(): R = suspendCancellableCoroutine { continuation ->
    this.then(
        onFulfilled = { continuation.resumeWith(Result.success(it)); null },
        onRejected = { continuation.resumeWithException(it.asJsException()); null }
    )
}

external interface Navigator { val clipboard: Clipboard }
external interface Clipboard { fun readText(): Promise<JsString> }
external val navigator: Navigator

actual suspend fun readCopiedText(): String {
    return navigator.clipboard.readText().await().toString()
}
```

이 업데이트는 `js`와 `wasmJs` 타겟 간의 코드 공유를 단순화합니다. 특히 다음 두 가지 경우에 유용합니다:

* 라이브러리 제작자로서 코드 중복 없이 `js`와 `wasmJs` 타겟 지원을 모두 추가하려는 경우.
* 웹을 타겟팅하는 Compose Multiplatform 애플리케이션을 개발하면서, 더 넓은 브라우저 호환성을 위해 `js`와 `wasmJs` 타겟 모두에 대해 크로스 컴파일을 활성화하려는 경우. 최신 브라우저는 `wasmJs`를 사용하고 오래된 브라우저는 `js`를 사용하므로, 이 폴백(fallback) 모드를 통해 웹사이트를 만들면 모든 브라우저에서 즉시 작동합니다.

이 기능을 사용하려면 `build.gradle(.kts)` 파일의 `kotlin {}` 블록에서 [기본 계층 구조 템플릿](https://kotlinlang.org/docs/multiplatform/multiplatform-hierarchy.html#default-hierarchy-template)을 사용하세요:

```kotlin
kotlin {
    js()
    wasmJs()

    // webMain 및 webTest를 포함한 기본 소스 세트 계층 구조 활성화
    applyDefaultHierarchyTemplate()
}
```

기본 계층 구조를 사용하기 전에, 커스텀 공유 소스 세트가 있는 프로젝트가 있거나 `js("web")` 타겟의 이름을 변경한 경우 잠재적인 충돌을 신중하게 고려하세요. 이러한 충돌을 해결하려면 충돌하는 소스 세트나 타겟의 이름을 변경하거나 기본 계층 구조를 사용하지 마십시오.

### Kotlin 라이브러리를 위한 안정적인 크로스 플랫폼 컴파일

Kotlin 2.2.20은 중요한 [로드맵 항목](https://youtrack.jetbrains.com/issue/KT-71290)을 완료하여 Kotlin 라이브러리를 위한 크로스 플랫폼 컴파일을 안정화했습니다.

이제 [지원되는 모든 호스트](native-target-support.md#hosts)를 사용하여 Kotlin 라이브러리 게시를 위한 `.klib` 아티팩트를 생성할 수 있습니다. 이는 특히 이전에 Mac 머신이 필요했던 Apple 타겟의 게시 프로세스를 크게 간소화합니다.

이 기능은 기본적으로 활성화되어 있습니다. 이미 `kotlin.native.enableKlibsCrossCompilation=true`로 크로스 컴파일을 활성화했다면 이제 `gradle.properties` 파일에서 이를 제거할 수 있습니다.

안타깝게도 몇 가지 제한 사항은 여전히 존재합니다. 다음 경우에는 여전히 Mac 머신을 사용해야 합니다:

* 라이브러리 또는 종속된 모듈에 [cinterop 의존성](native-c-interop.md)이 있는 경우.
* 프로젝트에 [CocoaPods 통합](https://kotlinlang.org/docs/multiplatform/multiplatform-cocoapods-overview.html)이 설정되어 있는 경우.
* Apple 타겟을 위한 [최종 바이너리(final binaries)](https://kotlinlang.org/docs/multiplatform/multiplatform-build-native-binaries.html)를 빌드하거나 테스트해야 하는 경우.

멀티플랫폼 라이브러리 게시에 대한 자세한 내용은 [문서](https://kotlinlang.org/docs/multiplatform/multiplatform-publish-lib-setup.html)를 참조하세요.

### 공통 의존성 선언을 위한 새로운 방식
<primary-label ref="experimental-opt-in"/>

Gradle을 사용한 멀티플랫폼 프로젝트 설정을 단순화하기 위해, Kotlin 2.2.20부터는 프로젝트에서 Gradle 8.8 이상을 사용하는 경우 `kotlin {}` 블록 내의 최상위 `dependencies {}` 블록을 사용하여 공통 의존성을 선언할 수 있습니다. 이러한 의존성은 `commonMain` 소스 세트에 선언된 것처럼 동작합니다. 이 기능은 Kotlin/JVM 및 Android 전용 프로젝트에서 사용하는 의존성 블록과 유사하게 작동하며, 이제 Kotlin Multiplatform에서 [실험적(Experimental)](components-stability.md#stability-levels-explained)으로 도입되었습니다.

프로젝트 레벨에서 공통 의존성을 선언하면 소스 세트 전반에 걸친 반복적인 구성을 줄이고 빌드 설정을 간소화하는 데 도움이 됩니다. 필요에 따라 각 소스 세트에 플랫폼별 의존성을 여전히 추가할 수 있습니다.

이 기능을 사용해 보려면 최상위 `dependencies {}` 블록 앞에 `@OptIn(ExperimentalKotlinGradlePluginApi::class)` 어노테이션을 추가하여 옵트인하세요. 예:

```kotlin
kotlin {
    @OptIn(ExperimentalKotlinGradlePluginApi::class)
    dependencies {
        implementation("org.jetbrains.kotlinx:kotlinx-coroutines-core:%coroutinesVersion%")
    }
}
```

이 기능에 대한 피드백을 [YouTrack](https://youtrack.jetbrains.com/issue/KT-76446)에 남겨주시면 감사하겠습니다.

### 의존성 타겟 지원을 위한 새로운 진단

Kotlin 2.2.20 이전에는 빌드 스크립트의 의존성이 소스 세트에서 요구하는 모든 타겟을 지원하지 않는 경우, Gradle에서 생성되는 오류 메시지로 인해 문제를 이해하기 어려웠습니다.

Kotlin 2.2.20은 각 의존성이 어떤 타겟을 지원하고 어떤 타겟을 지원하지 않는지 명확하게 보여주는 새로운 진단을 도입합니다.

이 진단은 기본적으로 활성화되어 있습니다. 어떤 이유로 이를 비활성화해야 한다면 [이 YouTrack 이슈](https://kotl.in/kmp-dependencies-diagnostic-issue)에 의견을 남겨주세요. `gradle.properties` 파일에서 다음 Gradle 프로퍼티를 사용하여 진단을 비활성화할 수 있습니다:

| 프로퍼티                                                 | 설명                                                    |
|----------------------------------------------------------|---------------------------------------------------------|
| `kotlin.kmp.eagerUnresolvedDependenciesDiagnostic=false` | 메타데이터 컴파일 및 임포트에 대해서만 진단을 실행함 |
| `kotlin.kmp.unresolvedDependenciesDiagnostic=false`      | 진단을 완전히 비활성화함                             |

## Kotlin/Native

이번 릴리스에는 Xcode 26 지원, Objective-C/Swift와의 상호운용성 개선, 디버깅 개선 및 새로운 바이너리 옵션이 포함되어 있습니다.

### Xcode 26 지원

Kotlin 2.2.2**1**부터 Kotlin/Native 컴파일러는 Xcode의 최신 안정 버전인 Xcode 26을 지원합니다. 이제 Xcode를 업데이트하고 최신 API에 액세스하여 Apple 운영 체제용 Kotlin 프로젝트 작업을 계속할 수 있습니다.

### 바이너리의 스택 카나리(stack canaries) 지원

Kotlin 2.2.20부터 Kotlin/Native 바이너리 결과물에 스택 카나리 지원이 추가되었습니다. 스택 보호의 일환인 이 보안 기능은 스택 스매싱(stack smashing)을 방지하여 일반적인 애플리케이션 취약성을 완화합니다. Swift와 Objective-C에서는 이미 사용 가능했던 기능이며, 이제 Kotlin에서도 지원됩니다.

Kotlin/Native의 스택 보호 구현은 [Clang](https://clang.llvm.org/docs/ClangCommandLineReference.html#cmdoption-clang-fstack-protector)의 스택 프로텍터 동작을 따릅니다.

스택 카나리를 활성화하려면 `gradle.properties` 파일에 다음 [바이너리 옵션](native-binary-options.md)을 추가하세요:

```none
kotlin.native.binary.stackProtector=yes
```

이 프로퍼티는 스택 스매싱에 취약한 모든 Kotlin 함수에 대해 기능을 활성화합니다. 대체 모드는 다음과 같습니다:

* `kotlin.native.binary.stackProtector=strong`: 스택 스매싱에 취약한 함수에 대해 더 강력한 휴리스틱을 사용합니다.
* `kotlin.native.binary.stackProtector=all`: 모든 함수에 대해 스택 프로텍터를 활성화합니다.

일부 경우 스택 보호로 인해 성능 비용이 발생할 수 있음을 유의하세요.

### 릴리스 바이너리 크기 축소
<primary-label ref="experimental-opt-in"/> 

Kotlin 2.2.20은 릴리스 바이너리의 크기를 줄이는 데 도움이 되는 `smallBinary` 옵션을 도입합니다. 이 새로운 옵션은 LLVM 컴파일 단계에서 컴파일러의 기본 최적화 인자로 `-Oz`를 효과적으로 설정합니다.

`smallBinary` 옵션을 활성화하면 릴리스 바이너리를 더 작게 만들고 빌드 시간을 개선할 수 있습니다. 그러나 경우에 따라 런타임 성능에 영향을 줄 수 있습니다.

이 새로운 기능은 현재 [실험적(Experimental)](components-stability.md#stability-levels-explained)입니다. 프로젝트에서 사용해 보려면 `gradle.properties` 파일에 다음 [바이너리 옵션](native-binary-options.md)을 추가하세요:

```none
kotlin.native.binary.smallBinary=true
```

Kotlin 팀은 이 기능을 구현하는 데 도움을 준 [Troels Lund](https://github.com/troelsbjerre)에게 감사를 표합니다.

### 개선된 디버거 객체 요약(summaries)

Kotlin/Native는 이제 LLDB 및 GDB와 같은 디버거 도구를 위해 더 명확한 객체 요약을 생성합니다. 이를 통해 생성된 디버그 정보의 가독성이 향상되고 디버깅 경험이 간소화됩니다.

예를 들어 다음 객체를 살펴보겠습니다:

```kotlin
class Point(val x: Int, val y: Int)
val point = Point(1, 2)
```

이전에는 검사 시 객체의 메모리 주소에 대한 포인터를 포함한 제한된 정보만 표시되었습니다:

```none
(lldb) v point
(ObjHeader *) point = [x: ..., y: ...]
(lldb) v point->x
(int32_t *) x = 0x0000000100274048
```

Kotlin 2.2.20부터 디버거는 실제 값을 포함한 더 풍부한 세부 정보를 보여줍니다:

```none
(lldb) v point
(ObjHeader *) point = Point(x=1, y=2)
(lldb) v point->x
(int32_t) point->x = 1
```

Kotlin 팀은 이 기능을 구현하는 데 도움을 준 [Nikita Nazarov](https://github.com/nikita-nazarov)에게 감사를 표합니다.

Kotlin/Native 디버깅에 대한 자세한 내용은 [문서](native-debugging.md)를 참조하세요.

### Objective-C 헤더의 블록 타입에 명시적 이름 지원

Kotlin 2.2.20은 Kotlin/Native 프로젝트에서 내보낸 Objective-C 헤더의 Kotlin 함수 타입에 명시적 파라미터 이름을 추가하는 옵션을 도입합니다. 파라미터 이름은 Xcode의 자동 완성 제안을 개선하고 Clang 경고를 피하는 데 도움이 됩니다.

이전에는 생성된 Objective-C 헤더에서 블록 타입의 파라미터 이름이 생략되었습니다. 이 경우 Xcode의 자동 완성은 Objective-C 블록에서 파라미터 이름 없이 해당 함수를 호출하도록 제안했습니다. 생성된 블록은 Clang 경고를 발생시켰습니다.

예를 들어 다음 Kotlin 코드의 경우:

```kotlin
// Kotlin:
fun greetUser(block: (name: String) -> Unit) = block("John")
```

생성된 Objective-C 헤더에는 파라미터 이름이 없었습니다:

```objc
// Objective-C:
+ (void)greetUserBlock:(void (^)(NSString *))block __attribute__((swift_name("greetUser(block:)")));
```

따라서 Xcode의 Objective-C에서 `greetUserBlock()` 함수를 호출할 때 IDE는 다음과 같이 제안했습니다:

```objc
// Objective-C:
greetUserBlock:^(NSString *) {
    // ...
};
```

제안에서 파라미터 이름 `(NSString *)`이 누락되어 Clang 경고가 발생했습니다.

새로운 옵션을 사용하면 Kotlin은 Kotlin 함수 타입의 파라미터 이름을 Objective-C 블록 타입으로 전달하므로 Xcode가 제안에서 이를 사용합니다:

```objc
// Objective-C:
greetUserBlock:^(NSString *name) {
    // ...
};
```

명시적 파라미터 이름을 활성화하려면 `gradle.properties` 파일에 다음 [바이너리 옵션](native-binary-options.md)을 추가하세요:

```none
kotlin.native.binary.objcExportBlockExplicitParameterNames=true
```

Kotlin 팀은 이 기능을 구현한 [Yijie Jiang](https://github.com/edisongz)에게 감사를 표합니다.

### Kotlin/Native 배포판 크기 축소

Kotlin/Native 배포판에는 컴파일러 코드가 포함된 두 개의 JAR 파일이 포함되어 있었습니다:

* `konan/lib/kotlin-native.jar`
* `konan/lib/kotlin-native-compiler-embeddable.jar`.

Kotlin 2.2.20부터 `kotlin-native.jar`는 더 이상 게시되지 않습니다.

제거된 JAR 파일은 더 이상 필요하지 않은 구버전의 embeddable 컴파일러입니다. 이 변경을 통해 배포판의 크기가 크게 줄어듭니다.

결과적으로 다음 옵션들은 이제 지원 중단 및 제거되었습니다:

* `kotlin.native.useEmbeddableCompilerJar=false` Gradle 프로퍼티. 대신 Kotlin/Native 프로젝트에는 항상 embeddable 컴파일러 JAR 파일이 사용됩니다.
* `KotlinCompilerPluginSupportPlugin.getPluginArtifactForNative()` 함수. 대신 항상 [`getPluginArtifact()`](https://kotlinlang.org/api/kotlin-gradle-plugin/kotlin-gradle-plugin-api/org.jetbrains.kotlin.gradle.plugin/-kotlin-compiler-plugin-support-plugin/get-plugin-artifact.html) 함수가 사용됩니다.

자세한 내용은 [YouTrack 이슈](https://kotl.in/KT-51301)를 참조하세요.

### 기본적으로 Objective-C 헤더에 KDoc 내보내기

이제 Kotlin/Native 최종 바이너리 컴파일 중에 Objective-C 헤더를 생성할 때 [KDoc](kotlin-doc.md) 주석이 기본적으로 내보내집니다.

이전에는 빌드 파일에 `-Xexport-kdoc` 옵션을 수동으로 추가해야 했습니다. 이제는 컴파일 태스크에 자동으로 전달됩니다.

이 옵션은 KDoc 주석을 klib에 포함시키고, Apple 프레임워크를 생성할 때 klib에서 주석을 추출합니다. 결과적으로 클래스와 메서드에 대한 주석이 Xcode 등의 자동 완성 중에 나타납니다.

`build.gradle(.kts)` 파일의 `binaries {}` 블록에서 klib에서 생성된 Apple 프레임워크로의 KDoc 주석 내보내기를 비활성화할 수 있습니다:

```kotlin
import org.jetbrains.kotlin.gradle.ExperimentalKotlinGradlePluginApi

kotlin {
    iosArm64 {
        binaries {
            framework { 
                baseName = "sdk"
                @OptIn(ExperimentalKotlinGradlePluginApi::class)
                exportKdoc.set(false)
            }
        }
    }
}
```

자세한 내용은 [관련 문서](native-objc-interop.md#provide-documentation-with-kdoc-comments)를 참조하세요.

### `x86_64` Apple 타겟 지원 중단 안내

Apple은 몇 년 전 Intel 칩이 탑재된 기기 생산을 중단했으며, [최근 발표](https://www.youtube.com/live/51iONeETSng?t=3288s)에 따르면 macOS Tahoe 26이 Intel 기반 아키텍처를 지원하는 마지막 OS 버전이 될 예정입니다.

이로 인해 빌드 에이전트에서 이러한 타겟을 적절히 테스트하는 것이 점점 더 어려워지고 있으며, 특히 macOS 26과 함께 제공되는 최신 Xcode 버전을 업데이트할 향후 Kotlin 릴리스에서는 더욱 그렇습니다.

Kotlin 2.2.20부터 `macosX64` 및 `iosX64` 타겟은 지원 티어 2(support tier 2)로 강등되었습니다. 이는 타겟이 컴파일되는지 확인하기 위해 CI에서 정기적으로 테스트되지만, 실행되는지 확인하기 위한 자동 테스트는 수행되지 않을 수 있음을 의미합니다.

저희는 점진적으로 모든 `x86_64` Apple 타겟을 지원 중단하고, 최종적으로 Kotlin 2.2.20−2.4.0 릴리스 주기 동안 지원을 제거할 계획입니다. 여기에는 다음 타겟들이 포함됩니다:

* `macosX64`
* `iosX64`
* `tvosX64`
* `watchosX64`

지원 티어에 대한 자세한 내용은 [Kotlin/Native 타겟 지원](native-target-support.md)을 참조하세요.

## Kotlin/Wasm

Kotlin/Wasm은 이제 베타(Beta) 단계로, 분리된 npm 의존성, [JavaScript interop을 위한 정교해진 예외 처리](#improved-exception-handling-in-kotlin-wasm-and-javascript-interop), [기본 브라우저 디버깅 지원](#support-for-debugging-in-browsers-without-configuration) 등과 함께 더 큰 안정성을 제공합니다.

### npm 의존성 관리 분리

이전의 Kotlin/Wasm 프로젝트에서는 Kotlin 툴링 의존성과 사용자의 의존성을 포함한 모든 [npm](https://www.npmjs.com/) 의존성이 프로젝트 폴더에 함께 설치되었습니다. 또한 프로젝트의 락 파일(`package-lock.json` 또는 `yarn.lock`)에도 함께 기록되었습니다.

그 결과, 아무것도 추가하거나 변경하지 않았더라도 Kotlin 툴링 의존성이 업데이트될 때마다 락 파일을 업데이트해야 했습니다.

Kotlin 2.2.20부터 Kotlin 툴링 npm 의존성은 프로젝트 외부 전용 디렉토리에 설치됩니다. 이제 툴링과 사용자 의존성은 서로 다른 디렉토리를 가집니다:

* **툴링 의존성 디렉토리:**

  `<kotlin-user-home>/kotlin-npm-tooling/<yarn|npm>/hash/node_modules`

* **사용자 의존성 디렉토리:**

  `build/wasm/node_modules`

또한 프로젝트 디렉토리 내부의 락 파일에는 사용자가 정의한 의존성만 포함됩니다.

이 개선 사항을 통해 락 파일이 본인의 의존성에만 집중되도록 유지할 수 있고, 프로젝트를 더 깔끔하게 관리하며 파일에 대한 불필요한 변경을 줄일 수 있습니다.

이 변경 사항은 `wasm-js` 타겟에 대해 기본적으로 활성화되어 있습니다. `js` 타겟에 대해서는 아직 구현되지 않았습니다. 향후 릴리스에서 구현될 계획이 있으나, Kotlin 2.2.20에서 `js` 타겟의 npm 의존성 동작은 이전과 동일하게 유지됩니다.

### Kotlin/Wasm 및 JavaScript 상호운용성에서의 예외 처리 개선

이전에는 Kotlin이 JavaScript(JS)에서 발생하여 Kotlin/Wasm 코드로 넘어오는 예외(오류)를 이해하는 데 어려움이 있었습니다.

어떤 경우에는 반대 방향으로, 예외가 Wasm 코드를 통해 JS로 던져지거나 전달될 때 세부 정보 없이 `WebAssembly.Exception`으로 래핑되는 문제도 발생했습니다. 이러한 Kotlin 예외 처리 문제는 디버깅을 어렵게 만들었습니다.

Kotlin 2.2.20부터 양방향 모두에서 예외 처리에 대한 개발자 경험이 개선되었습니다:

* JS에서 예외가 발생했을 때 Kotlin 쪽에서 더 많은 정보를 볼 수 있습니다. 이러한 예외가 Kotlin을 통해 다시 JS로 전파될 때 더 이상 WebAssembly로 래핑되지 않습니다.
* Kotlin에서 예외가 발생했을 때 이제 JS 쪽에서 JS 에러로 캐치할 수 있습니다.

새로운 예외 처리는 [`WebAssembly.JSTag`](https://webassembly.github.io/exception-handling/js-api/#dom-webassembly-jstag) 기능을 지원하는 최신 브라우저에서 자동으로 작동합니다:

* Chrome 115+
* Firefox 129+
* Safari 18.4+

이보다 오래된 브라우저에서는 예외 처리 동작이 변경되지 않고 유지됩니다.

### 설정 없이 브라우저 디버깅 지원

이전에는 브라우저가 디버깅에 필요한 Kotlin/Wasm 프로젝트 소스에 자동으로 액세스할 수 없었습니다. 브라우저에서 Kotlin/Wasm 애플리케이션을 디버깅하려면 `build.gradle(.kts)` 파일에 다음 스니펫을 추가하여 이러한 소스를 제공하도록 빌드를 수동으로 구성해야 했습니다:

```kotlin
devServer = (devServer ?: KotlinWebpackConfig.DevServer()).apply {
    static = (static ?: mutableListOf()).apply {
        add(project.rootDir.path)
    }
}
```

Kotlin 2.2.20부터는 [최신 브라우저](wasm-configuration.md#browser-versions)에서 별도의 설정 없이 애플리케이션 디버깅이 가능합니다. Gradle 개발 태스크(`*DevRun`)를 실행하면 Kotlin이 자동으로 소스 파일을 브라우저에 제공하므로, 추가 설정 없이도 중단점(breakpoint) 설정, 변수 검사, Kotlin 코드 단계별 실행이 가능합니다.

이 변경은 수동 구성의 필요성을 제거하여 디버깅을 단순화합니다. 필요한 구성은 이제 Kotlin Gradle 플러그인에 포함되어 있습니다. 이전에 `build.gradle(.kts)` 파일에 이 구성을 추가했다면 충돌을 피하기 위해 제거해야 합니다.

브라우저 디버깅은 모든 Gradle `*DevRun` 태스크에서 기본적으로 활성화됩니다. 이러한 태스크는 애플리케이션뿐만 아니라 소스 파일도 제공하므로, 로컬 개발용으로만 사용하고 소스가 공개적으로 노출될 수 있는 클라우드 또는 프로덕션 환경에서는 실행하지 마십시오.

#### 디버깅 중 반복되는 새로고침 처리

기본적으로 소스를 제공하면 [Kotlin 컴파일 및 번들링이 완료되기 전에 브라우저에서 애플리케이션이 반복적으로 새로고침되는 문제](https://youtrack.jetbrains.com/issue/KT-80582/Multiple-reloads-when-using-webpack-dev-server-after-2.2.20-Beta2#focus=Comments-27-12596427.0-0)가 발생할 수 있습니다. 해결 방법으로 Kotlin 소스 파일을 무시하고 제공되는 정적 파일에 대한 감시(watching)를 비활성화하도록 webpack 구성을 조정하세요. 프로젝트 루트의 `webpack.config.d` 디렉토리에 다음 내용이 포함된 `.js` 파일을 추가하세요:

```kotlin
config.watchOptions = config.watchOptions || {
    ignored: ["**/*.kt", "**/node_modules"]
}

if (config.devServer) {
    config.devServer.static = config.devServer.static.map(file => {
        if (typeof file === "string") {
        return { directory: file,
                 watch: false,
        }
    } else {
        return file
    }
    })
}
```

### 빈 `yarn.lock` 파일 제거

이전에는 Kotlin Gradle 플러그인(KGP)이 프로젝트나 사용된 라이브러리의 기존 [npm](https://www.npmjs.com/) 의존성과 함께 Kotlin 툴체인에 필요한 npm 패키지에 대한 정보를 포함하는 `yarn.lock` 파일을 자동으로 생성했습니다.

이제 KGP는 툴체인 의존성을 별도로 관리하며, 프로젝트에 npm 의존성이 없는 한 프로젝트 레벨의 `yarn.lock` 파일은 더 이상 생성되지 않습니다.

KGP는 npm 의존성이 추가될 때 자동으로 `yarn.lock` 파일을 생성하고, npm 의존성이 제거될 때 `yarn.lock` 파일을 삭제합니다.

이 변경을 통해 프로젝트 구조가 깔끔해지고 실제 npm 의존성이 도입되는 시점을 더 쉽게 추적할 수 있습니다.

이 동작을 구성하기 위해 추가 단계는 필요하지 않습니다. Kotlin 2.2.20부터 Kotlin/Wasm 프로젝트에 기본적으로 적용됩니다.

### 정규화된 클래스 이름 사용 시 새로운 컴파일러 에러

Kotlin/Wasm에서 컴파일러는 애플리케이션 크기가 커지는 것을 방지하기 위해 기본적으로 클래스의 정규화된 이름(Fully Qualified Names, FQNs)을 생성된 바이너리에 저장하지 않습니다.

그 결과, 이전 Kotlin 릴리스에서 `KClass::qualifiedName` 프로퍼티를 호출하면 클래스의 정규화된 이름 대신 빈 문자열이 반환되었습니다.

Kotlin 2.2.20부터 컴파일러는 정규화된 이름 기능을 명시적으로 활성화하지 않는 한, Kotlin/Wasm 프로젝트에서 `KClass::qualifiedName` 프로퍼티를 사용할 때 오류를 보고합니다.

이 변경 사항은 `qualifiedName` 프로퍼티 호출 시 예상치 못한 빈 문자열이 발생하는 것을 방지하고, 컴파일 타임에 문제를 포착하여 개발자 경험을 개선합니다.

이 진단은 기본적으로 활성화되어 있으며 오류가 자동으로 보고됩니다. 진단을 비활성화하고 Kotlin/Wasm에서 FQN 저장을 허용하려면 `build.gradle(.kts)` 파일에 다음 옵션을 추가하여 컴파일러가 모든 클래스에 대해 정규화된 이름을 저장하도록 지시하세요:

```kotlin
kotlin {
    wasmJs {
        ...
        compilerOptions {
            freeCompilerArgs.add("-Xwasm-kclass-fqn")
        }
    }
}
```

> 이 옵션을 활성화하면 애플리케이션 크기가 증가한다는 점에 유의하세요.
>
{style="note"}

## Kotlin/JS

Kotlin 2.2.20은 Kotlin의 `Long` 타입을 나타내기 위해 `BigInt` 타입을 사용하는 것을 지원하여, 내보낸 선언에서 `Long`을 사용할 수 있게 합니다. 또한 이번 릴리스에는 Node.js 인자를 정리하는 DSL 함수가 추가되었습니다.

### Kotlin의 `Long` 타입을 나타내기 위한 `BigInt` 타입 사용
<primary-label ref="experimental-opt-in"/>

ES2020 표준 이전의 JavaScript(JS)는 53비트보다 큰 정밀한 정수를 위한 프리미티브 타입을 지원하지 않았습니다.

이러한 이유로 Kotlin/JS는 64비트 크기인 `Long` 값을 두 개의 `number` 프로퍼티를 포함하는 JavaScript 객체로 표현해 왔습니다. 이러한 커스텀 구현은 Kotlin과 JavaScript 간의 상호운용성을 복잡하게 만들었습니다.

Kotlin 2.2.20부터 Kotlin/JS는 현대적인 JavaScript(ES2020)로 컴파일할 때 Kotlin의 `Long` 값을 나타내기 위해 JavaScript의 내장 `BigInt` 타입을 사용합니다.

이 변경을 통해 Kotlin 2.2.20에서 도입된 기능인 [`Long` 타입을 JavaScript로 내보내기](#usage-of-long-in-exported-declarations)가 가능해졌습니다. 결과적으로 Kotlin과 JavaScript 간의 상호운용성이 단순화됩니다.

이를 활성화하려면 `build.gradle(.kts)` 파일에 다음 컴파일러 옵션을 추가해야 합니다:

```kotlin
kotlin {
    js {
        ...
        compilerOptions {
            freeCompilerArgs.add("-Xes-long-as-bigint")
        }
    }
}
```

이 기능은 [실험적(Experimental)](components-stability.md#stability-levels-explained)입니다. 여러분의 피드백을 이슈 트래커인 [YouTrack](https://youtrack.jetbrains.com/issue/KT-57128)에 남겨주시면 감사하겠습니다.

#### 내보낸 선언에서 `Long` 사용

기존에는 Kotlin/JS가 커스텀 `Long` 표현 방식을 사용했기 때문에 JavaScript에서 Kotlin의 `Long`과 상호작용할 수 있는 명확한 방법을 제공하기 어려웠습니다. 그 결과, `Long` 타입을 사용하는 Kotlin 코드를 JavaScript로 내보낼 수 없었습니다. 이 문제는 함수 파라미터, 클래스 프로퍼티 또는 생성자 등 `Long`을 사용하는 모든 코드에 영향을 미쳤습니다.

이제 Kotlin의 `Long` 타입을 JavaScript의 `BigInt` 타입으로 컴파일할 수 있게 됨에 따라, Kotlin/JS는 `Long` 값을 JavaScript로 내보내는 것을 지원하여 Kotlin과 JavaScript 코드 간의 상호운용성을 단순화합니다.

이 기능을 활성화하려면:

1. `build.gradle(.kts)` 파일의 `freeCompilerArgs` 속성에 다음 컴파일러 옵션을 추가하여 Kotlin/JS에서 `Long` 내보내기를 허용합니다:

    ```kotlin
    kotlin {
        js {
            ...
            compilerOptions {                   
                freeCompilerArgs.add("-XXLanguage:+JsAllowLongInExportedDeclarations")
            }
        }
    }
    ```

2. `BigInt` 타입을 활성화합니다. 활성화 방법은 [Kotlin의 `Long` 타입을 나타내기 위한 `BigInt` 타입 사용](#usage-of-the-bigint-type-to-represent-kotlin-s-long-type) 섹션을 참조하세요.

### 더 깔끔한 인자(Arguments) 처리를 위한 새로운 DSL 함수

Node.js에서 Kotlin/JS 애플리케이션을 실행할 때 프로그램에 전달된 인자(`args`)에는 다음이 포함되곤 했습니다:

* 실행 파일 `Node`의 경로.
* 스크립트의 경로.
* 실제 제공한 명령줄 인자.

하지만 `args`에는 명령줄 인자만 포함되는 것이 기대되는 동작입니다. 이를 위해 `build.gradle(.kts)` 파일이나 Kotlin 코드에서 `drop()` 함수를 사용하여 처음 두 개의 인자를 수동으로 건너뛰어야 했습니다:

```kotlin
fun main(args: Array<String>) {
    println(args.drop(2).joinToString(", "))
}
```

이러한 해결 방식은 반복적이고 오류가 발생하기 쉬우며, 플랫폼 간에 코드를 공유할 때 잘 작동하지 않았습니다.

이 문제를 해결하기 위해 Kotlin 2.2.20은 `passCliArgumentsToMainFunction()`이라는 새로운 DSL 함수를 도입합니다.

이 함수를 사용하면 `Node` 및 스크립트 경로는 제외되고 명령줄 인자만 포함됩니다:

```kotlin
fun main(args: Array<String>) {
    // drop()이 필요 없으며 커스텀 인자만 포함됨
    println(args.joinToString(", "))
}
```

이 변경 사항은 보일러플레이트 코드를 줄이고, 수동으로 인자를 삭제할 때 발생하는 실수를 방지하며, 크로스 플랫폼 호환성을 개선합니다.

이 기능을 활성화하려면 `build.gradle(.kts)` 파일 내부에 다음 DSL 함수를 추가하세요:

```kotlin
kotlin {
    js {
        nodejs {
            passCliArgumentsToMainFunction()
        }
    }
}
```

## Gradle

Kotlin 2.2.20은 Gradle 빌드 보고서의 Kotlin/Native 태스크에 새로운 컴파일러 성능 메트릭을 추가하고, 증분 컴파일(incremental compilation)의 사용 편의성을 개선했습니다.

### Kotlin/Native 태스크를 위한 빌드 보고서의 새로운 컴파일러 성능 메트릭

Kotlin 1.7.0에서는 컴파일러 성능 추적을 돕기 위해 [빌드 보고서(build reports)](gradle-compilation-and-caches.md#build-reports)를 도입했습니다. 이후 성능 문제 조사를 위해 더 상세하고 유용한 정보를 제공하고자 더 많은 메트릭을 추가해 왔습니다.

Kotlin 2.2.20부터 빌드 보고서에 Kotlin/Native 태스크에 대한 컴파일러 성능 메트릭이 포함됩니다.

빌드 보고서와 설정 방법에 대한 자세한 내용은 [빌드 보고서 활성화](gradle-compilation-and-caches.md#enabling-build-reports)를 참조하세요.

### Kotlin/JVM을 위한 개선된 증분 컴파일 미리보기
<primary-label ref="experimental-general"/>

Kotlin 2.0.0은 최적화된 프론트엔드를 갖춘 새로운 K2 컴파일러를 도입했습니다. Kotlin 2.2.20은 이를 기반으로 새로운 프론트엔드를 사용하여 Kotlin/JVM의 특정 복잡한 증분 컴파일 시나리오에서 성능을 개선합니다.

이러한 개선 사항은 동작 안정화 작업을 진행하는 동안 기본적으로 비활성화되어 있습니다. 이를 활성화하려면 `gradle.properties` 파일에 다음 프로퍼티를 추가하세요:

```none
kotlin.incremental.jvm.fir=true
```

현재 [`kapt` 컴파일러 플러그인](kapt.md)은 이 새로운 동작과 호환되지 않습니다. 향후 Kotlin 릴리스에서 지원을 추가하기 위해 작업 중입니다.

이 기능에 대한 피드백을 [YouTrack](https://youtrack.jetbrains.com/issue/KT-72822)에 남겨주시면 감사하겠습니다.

### 인라인 함수의 람다 변경 사항을 감지하는 증분 컴파일

Kotlin 2.2.20 이전에는 증분 컴파일이 활성화된 상태에서 인라인 함수 내부 람다의 로직을 변경해도, 컴파일러가 다른 모듈에 있는 해당 인라인 함수의 호출 지점(call sites)을 재컴파일하지 않았습니다. 그 결과 호출 지점에서 이전 버전의 람다를 사용하여 예기치 않은 동작이 발생할 수 있었습니다.

Kotlin 2.2.20부터 컴파일러는 인라인 함수 람다의 변경 사항을 감지하고 해당 호출 지점을 자동으로 재컴파일합니다.

### 라이브러리 게시를 위한 개선 사항

Kotlin 2.2.20은 라이브러리 게시를 더 쉽게 만드는 새로운 Gradle 태스크들을 추가합니다. 이 태스크들은 키 쌍 생성, 공개 키 업로드, 그리고 Maven Central 저장소에 업로드하기 전 검증 프로세스가 성공하는지 확인하기 위한 로컬 체크 실행을 도와줍니다.

게시 프로세스의 일부로 이러한 태스크를 사용하는 방법에 대한 자세한 내용은 [Maven Central에 라이브러리 게시하기](https://kotlinlang.org/docs/multiplatform/multiplatform-publish-libraries.html)를 참조하세요.

#### PGP 키 생성 및 업로드를 위한 새로운 Gradle 태스크

Kotlin 2.2.20 이전에는 멀티플랫폼 라이브러리를 Maven Central 저장소에 게시하려면 게시물 서명을 위한 키 쌍을 생성하기 위해 `gpg`와 같은 서드파티 프로그램을 설치해야 했습니다. 이제 Kotlin Gradle 플러그인에 키 쌍을 생성하고 공개 키를 업로드할 수 있는 Gradle 태스크가 포함되어 있어 별도의 프로그램을 설치할 필요가 없습니다.

##### 키 쌍 생성

`generatePgpKeys` 태스크는 키 쌍을 생성합니다. 실행 시 프라이빗 키스토어를 위한 비밀번호와 이름을 다음 형식으로 제공해야 합니다:

```bash
./gradlew -Psigning.password=example-password generatePgpKeys --name "John Smith <john@example.com>"
```

태스크는 키 쌍을 `build/pgp` 디렉토리에 저장합니다.

> 실수로 삭제되거나 무단 액세스가 발생하지 않도록 키 쌍을 안전한 위치로 옮기십시오.
> 
{style="warning"}

##### 공개 키 업로드

`uploadPublicPgpKey` 태스크는 공개 키를 Ubuntu의 키 서버인 `keyserver.ubuntu.com`에 업로드합니다. 실행 시 `.asc` 형식의 공개 키 경로를 제공하세요:

```bash
./gradlew uploadPublicPgpKey --keyring /path_to/build/pgp/public_KEY_ID.asc
```

#### 로컬에서 검증을 테스트하기 위한 새로운 Gradle 태스크

Kotlin 2.2.20은 또한 라이브러리를 Maven Central 저장소에 업로드하기 전에 로컬에서 검증을 테스트할 수 있는 Gradle 태스크를 추가합니다.

Kotlin Gradle 플러그인과 함께 Gradle의 [Signing Plugin](https://docs.gradle.org/current/userguide/signing_plugin.html) 및 [Maven Publish Plugin](https://docs.gradle.org/current/userguide/publishing_maven.html)을 사용하는 경우, `checkSigningConfiguration` 및 `checkPomFileFor<PUBLICATION_NAME>Publication` 태스크를 실행하여 설정이 Maven Central의 요구 사항을 충족하는지 확인할 수 있습니다. `<PUBLICATION_NAME>`을 실제 게시 이름으로 바꾸세요.

이러한 태스크는 `build` 또는 `check` Gradle 태스크의 일부로 자동으로 실행되지 않으므로 수동으로 실행해야 합니다. 예를 들어 `KotlinMultiplatform` 게시물이 있는 경우:

```bash
./gradlew checkSigningConfiguration checkPomFileForKotlinMultiplatformPublication
```

`checkSigningConfiguration` 태스크는 다음 사항을 확인합니다:

* Signing Plugin에 키가 구성되어 있음.
* 구성된 공개 키가 `keyserver.ubuntu.com` 또는 `keys.openpgp.org` 키 서버 중 하나에 업로드되었음.
* 모든 게시물에 서명이 활성화되어 있음.

이러한 확인 중 하나라도 실패하면 태스크는 문제 해결 방법에 대한 정보와 함께 오류를 반환합니다.

`checkPomFileFor<PUBLICATION_NAME>Publication` 태스크는 `pom.xml` 파일이 Maven Central의 [요구 사항](https://central.sonatype.org/publish/requirements/#required-pom-metadata)을 충족하는지 확인합니다. 충족하지 않는 경우, `pom.xml` 파일의 어떤 부분이 준수되지 않았는지에 대한 세부 정보와 함께 오류를 반환합니다.

## Maven: `kotlin-maven-plugin`에서 Kotlin 데몬 지원

Kotlin 2.2.20은 `kotlin-maven-plugin`에 [Kotlin 데몬(daemon)](kotlin-daemon.md) 지원을 추가함으로써 [Kotlin 2.2.0에서 도입된 빌드 도구 API](whatsnew22.md#new-experimental-build-tools-api)를 한 단계 더 발전시켰습니다. Kotlin 데몬을 사용하면 Kotlin 컴파일러가 별도의 격리된 프로세스에서 실행되어, 다른 Maven 플러그인이 시스템 프로퍼티를 재정의하는 것을 방지합니다. 예시는 이 [YouTrack 이슈](https://youtrack.jetbrains.com/issue/KT-43894/Maven-Windows-error-RuntimeException-Could-not-find-installation-home-path)에서 확인할 수 있습니다.

Kotlin 2.2.20부터 Kotlin 데몬이 기본적으로 사용됩니다. 이전 동작으로 되돌리려면 `pom.xml` 파일에서 다음 프로퍼티를 `false`로 설정하여 옵트아웃하세요:

```xml
<properties>
    <kotlin.compiler.daemon>false</kotlin.compiler.daemon>
</properties>
```

또한 Kotlin 2.2.20은 Kotlin 데몬을 위한 기본 JVM 인자를 커스터마이징할 수 있는 새로운 `jvmArgs` 프로퍼티를 도입합니다. 예를 들어 `-Xmx` 및 `-Xms` 옵션을 재정의하려면 `pom.xml` 파일에 다음을 추가하세요:

```xml
<properties>
    <kotlin.compiler.daemon.jvmArgs>Xmx1500m,Xms500m</kotlin.compiler.daemon.jvmArgs>
</properties>
```

## Kotlin 컴파일러 옵션을 위한 새로운 공통 스키마

Kotlin 2.2.20은 [`org.jetbrains.kotlin:kotlin-compiler-arguments-description`](https://central.sonatype.com/artifact/org.jetbrains.kotlin/kotlin-compiler-arguments-description) 아래에 게시된 모든 컴파일러 옵션에 대한 공통 스키마를 도입합니다. 이 아티팩트에는 모든 컴파일러 옵션, 설명, 그리고 각 옵션이 도입되거나 안정화된 버전과 같은 메타데이터의 코드 표현과 JSON 버전(비 JVM 소비자용)이 포함되어 있습니다. 이 스키마를 사용하여 옵션의 커스텀 뷰를 생성하거나 필요에 따라 분석할 수 있습니다.

## 표준 라이브러리 (Standard library)

이번 릴리스는 표준 라이브러리에 새로운 실험적 기능들을 도입합니다: Kotlin/JS에서 인터페이스 타입을 식별하기 위한 리플렉션 지원, 일반 원자적(atomic) 타입을 위한 업데이트 함수, 그리고 배열 크기 조정을 위한 `copyOf()` 오버로드입니다.

### Kotlin/JS에서 리플렉션을 통한 인터페이스 타입 식별 지원
<primary-label ref="experimental-opt-in"/>

Kotlin 2.2.20은 Kotlin/JS 표준 라이브러리에 [실험적(Experimental)](components-stability.md#stability-levels-explained)인 [`KClass.isInterface`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.reflect/-k-class/is-interface.html) 프로퍼티를 추가합니다.

이 프로퍼티를 사용하면 클래스 참조가 Kotlin 인터페이스를 나타내는지 확인할 수 있습니다. 이를 통해 `KClass.java.isInterface`를 사용하여 클래스가 인터페이스를 나타내는지 확인할 수 있는 Kotlin/JVM과 유사한 기능을 Kotlin/JS에서도 사용할 수 있게 됩니다.

사용하려면 `@OptIn(ExperimentalStdlibApi::class)` 어노테이션을 사용하세요:

```kotlin
@OptIn(ExperimentalStdlibApi::class)
fun inspect(klass: `KClass<*>`) {
    // 인터페이스인 경우 true 출력
    println(klass.isInterface)
}
```

여러분의 피드백을 이슈 트래커인 [YouTrack](https://youtrack.jetbrains.com/issue/KT-78581)에 남겨주시면 감사하겠습니다.

### 일반 원자적(atomic) 타입을 위한 새로운 업데이트 함수
<primary-label ref="experimental-opt-in"/>

Kotlin 2.2.20은 일반 원자적 타입과 해당 배열 요소들을 업데이트하기 위한 새로운 실험적 함수들을 도입합니다. 각 함수는 이러한 업데이트 함수 중 하나를 사용하여 원자적으로 새 값을 계산하고 현재 값을 대체하며, 사용한 함수에 따라 반환 값이 달라집니다:

* [`update()`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.concurrent.atomics/update.html) 및 [`updateAt()`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.concurrent.atomics/update-at.html)은 결과를 반환하지 않고 새 값을 설정합니다.
* [`fetchAndUpdate()`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.concurrent.atomics/fetch-and-update.html) 및 [`fetchAndUpdateAt()`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.concurrent.atomics/fetch-and-update-at.html)은 새 값을 설정하고 변경 전의 이전 값을 반환합니다.
* [`updateAndFetch()`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.concurrent.atomics/update-and-fetch.html) 및 [`updateAndFetchAt()`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.concurrent.atomics/update-and-fetch-at.html)은 새 값을 설정하고 변경 후의 업데이트된 값을 반환합니다.

곱셈이나 비트 연산과 같이 기본적으로 지원되지 않는 원자적 변환을 구현할 때 이 함수들을 사용할 수 있습니다. 이번 변경 이전에는 일반 원자적 타입을 증가시키고 이전 값을 읽으려면 [`compareAndSet()`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.concurrent/-atomic-int/compare-and-set.html) 함수가 포함된 루프가 필요했습니다.

모든 일반 원자적 타입 API와 마찬가지로, 이 함수들은 [실험적(Experimental)](components-stability.md#stability-levels-explained)입니다. 사용하려면 `@OptIn(ExperimentalAtomicApi::class)` 어노테이션을 사용하세요.

다음은 다양한 방식의 업데이트를 수행하고 이전 값 또는 업데이트된 값을 반환하는 코드 예시입니다:

```kotlin
import kotlin.concurrent.atomics.*
import kotlin.random.Random

@OptIn(ExperimentalAtomicApi::class)
fun main() {
    val counter = AtomicLong(Random.nextLong())
    val minSetBitsThreshold = 20

    // 결과를 사용하지 않고 새 값 설정
    counter.update { if (it < 0xDECAF) 0xCACA0 else 0xC0FFEE }

    // 현재 값을 가져온 후 업데이트
    val previousValue = counter.fetchAndUpdate { 0x1CEDL.shl(Long.SIZE_BITS - it.countLeadingZeroBits()) or it }

    // 값을 업데이트한 후 결과를 가져옴
    val current = counter.updateAndFetch {
        if (it.countOneBits() < minSetBitsThreshold) it.shl(20) or 0x15BADL else it
    }

    val hexFormat = HexFormat {
        upperCase = true
        number {
            removeLeadingZeros = true
        }
    }
    println("Previous value: ${previousValue.toHexString(hexFormat)}")
    println("Current value: ${current.toHexString(hexFormat)}")
    println("Expected status flag set: ${current and 0xBAD != 0xBADL}")
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="2.2.20"}

여러분의 피드백을 이슈 트래커인 [YouTrack](https://youtrack.jetbrains.com/issue/KT-76389)에 남겨주시면 감사하겠습니다.

### 배열을 위한 `copyOf()` 오버로드 지원
<primary-label ref="experimental-opt-in"/>

Kotlin 2.2.20은 [`copyOf()`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.collections/copy-of.html) 함수에 대한 실험적 오버로드를 도입합니다. 이는 제네릭 타입 `Array<T>` 배열과 모든 프리미티브 배열 타입에서 사용할 수 있습니다.

이 함수를 사용하여 배열의 크기를 키우고 초기화 람다의 값을 사용하여 새 요소를 채울 수 있습니다. 이를 통해 커스텀 보일러플레이트 코드를 줄일 수 있으며, 제네릭 `Array<T>`의 크기를 조정할 때 null 허용 결과(`Array<T?>`)가 생성되던 일반적인 불편 사항을 해결합니다.

예시는 다음과 같습니다:

```kotlin
@OptIn(ExperimentalStdlibApi::class)
fun main() {
    val row1: `Array<String>` = arrayOf("one", "two")
    // 배열의 크기를 조정하고 람다를 사용하여 새 요소를 채움
    val row2: `Array<String>` = row1.copyOf(4) { "default" }
    println(row2.contentToString())
    // [one, two, default, default]
}
```

이 API는 [실험적(Experimental)](components-stability.md#stability-levels-explained)입니다. 사용하려면 `@OptIn(ExperimentalStdlibApi::class)` 어노테이션을 사용하세요.

여러분의 피드백을 [이슈 트래커](https://youtrack.jetbrains.com/issue/KT-70984)에 남겨주시면 감사하겠습니다.

## Compose 컴파일러

이번 릴리스의 Compose 컴파일러는 새로운 경고를 추가하고 빌드 메트릭 출력을 개선하여 가독성을 높이는 등 사용 편의성을 개선했습니다.

### 기본 파라미터를 위한 언어 버전 제한

이번 릴리스부터 Compose 컴파일러는 컴파일에 지정된 언어 버전이 추상(abstract) 또는 오픈(open) composable 함수의 기본 파라미터를 지원하는 데 필요한 버전보다 낮을 경우 오류를 보고합니다.

기본 파라미터는 Compose 컴파일러에서 추상 함수의 경우 Kotlin 2.1.0부터, 오픈 함수의 경우 Kotlin 2.2.0부터 지원됩니다. 이전 버전의 Kotlin 언어 버전을 대상으로 하면서 최신 버전의 Compose 컴파일러를 사용할 경우, 라이브러리 개발자는 언어 버전이 이를 지원하지 않더라도 추상 또는 오픈 함수의 기본 파라미터가 공개 API에 여전히 나타날 수 있음을 인지해야 합니다.

### K2 컴파일러를 위한 Composable 타겟 경고

이번 릴리스에서는 K2 컴파일러 사용 시 [`@ComposableTarget`](https://developer.android.com/reference/kotlin/androidx/compose/runtime/ComposableTarget) 불일치에 대한 경고를 추가합니다.

예시:

```text
@Composable fun App() {
  Box { // <-- `Box`는 `@UiComposable`임
    Path(...) // <-- `Path`는 `@VectorComposable`임
    ^^^^^^^^^
    warning: Calling a Vector composable function where a UI composable was expected
  }
}
```
### 빌드 메트릭의 정규화된 이름 (Fully Qualified Names)

빌드 메트릭에서 보고되는 클래스 및 함수 이름이 이제 정규화된 이름(FQN)으로 표시되므로, 서로 다른 패키지에 있는 동일한 이름의 선언을 더 쉽게 구분할 수 있습니다.

또한 빌드 메트릭에는 더 이상 기본 파라미터의 복잡한 표현식 덤프가 포함되지 않아 가독성이 향상되었습니다.

## 하위 호환성을 깨뜨리는 변경 사항 및 지원 중단

이 섹션에서는 주목해야 할 중요한 변경 사항 및 지원 중단 사항을 설명합니다:

* [kapt](kapt.md) 컴파일러 플러그인이 이제 기본적으로 K2 컴파일러를 사용합니다. 결과적으로 플러그인이 K2 컴파일러를 사용할지 여부를 제어하는 `kapt.use.k2` 프로퍼티는 지원 중단되었습니다. 이 프로퍼티를 `false`로 설정하여 K2 컴파일러 사용을 거부하면 Gradle에서 경고가 표시됩니다.

## 문서 업데이트

Kotlin 문서에 다음과 같은 몇 가지 주목할 만한 변경 사항이 있었습니다:

* [Kotlin 로드맵](roadmap.md) – 언어 및 생태계 진화에 대한 Kotlin의 우선순위가 업데이트된 목록을 확인하세요.
* [프로퍼티(Properties)](properties.md) – Kotlin에서 프로퍼티를 사용할 수 있는 다양한 방법에 대해 알아보세요.
* [조건문 및 반복문(Conditions and loops)](control-flow.md) – Kotlin에서 조건문과 반복문이 어떻게 작동하는지 알아보세요.
* [Kotlin/JavaScript](js-overview.md) – Kotlin/JS의 사용 사례를 살펴보세요.
* [웹 타겟팅(Targeting the web)](gradle-configure-project.md#targeting-the-web) – Gradle이 웹 개발을 위해 제공하는 다양한 타겟에 대해 알아보세요.
* [Kotlin 데몬(Kotlin daemon)](kotlin-daemon.md) – Kotlin 데몬이 무엇이며 빌드 시스템 및 Kotlin 컴파일러와 어떻게 작동하는지 알아보세요.
* [코루틴 개요 페이지](coroutines-overview.md) – 코루틴 개념을 배우고 학습 여정을 시작하세요.
* [Kotlin/Native 바이너리 옵션](native-binary-options.md) – Kotlin/Native를 위한 바이너리 옵션과 구성 방법에 대해 알아보세요.
* [Kotlin/Native 디버깅](native-debugging.md) – Kotlin/Native로 디버깅할 수 있는 다양한 방법을 살펴보세요.
* [LLVM 백엔드 커스터마이징 팁](native-llvm-passes.md) – Kotlin/Native가 LLVM을 사용하는 방식과 최적화 패스(optimization passes)를 조정하는 방법을 알아보세요.
* [Exposed의 DAO API 시작하기](https://www.jetbrains.com/help/exposed/get-started-with-exposed-dao.html) – Exposed의 데이터 액세스 객체(DAO) API를 사용하여 관계형 데이터베이스에 데이터를 저장하고 검색하는 방법을 알아보세요.
* Exposed 문서의 R2DBC 관련 새 페이지들:
  * [데이터베이스 작업하기](https://www.jetbrains.com/help/exposed/working-with-database.html)
  * [ConnectionFactory 작업하기](https://www.jetbrains.com/help/exposed/working-with-connectionfactory.html)
  * [커스텀 타입 매핑](https://www.jetbrains.com/help/exposed/custom-type-mapping.html)
* [HTMX 통합](https://ktor.io/docs/htmx-integration.html) – Ktor가 HTMX를 위해 제공하는 실험적인 최고 수준의 지원에 대해 알아보세요.

## Kotlin 2.2.20으로 업데이트하는 방법

Kotlin 플러그인은 IntelliJ IDEA 및 Android Studio에 번들 플러그인으로 배포됩니다.

새로운 Kotlin 버전으로 업데이트하려면 빌드 스크립트에서 [Kotlin 버전을 2.2.20으로 변경](releases.md#update-to-a-new-kotlin-version)하세요.