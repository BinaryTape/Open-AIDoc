[//]: # (title: Kotlin 2.4.20의 새로운 기능)

<show-structure depth="1"/>

<web-summary>표준 라이브러리, Native, Wasm, JS, Gradle, BTA 및 Kotlin 컴파일러에 대한 새로운 실험적 기능과 업데이트를 다루는 Kotlin 2.4.20 릴리스 노트를 확인해 보세요.</web-summary>

_[릴리스 날짜: 2026년 9월 7일](releases.md#release-history)_

Kotlin 2.4.20이 출시되었습니다! 이번 릴리스의 주요 하이라이트는 다음과 같습니다.

* **표준 라이브러리:** [코루틴 스택 트레이스 복구 지원, 컬렉션 요소의 일치 여부 및 고유성을 확인하는 새로운 함수, `kotlin.test` 단언(assertion) 함수의 새로운 오버로드 추가](#standard-library)
* **Kotlin/Native:** [새로운 Swift 내보내기(export) 기능, 개선된 증분 컴파일, SwiftPM 의존성을 위해 자동으로 생성되는 `Package.swift` 파일](#kotlin-native)
* **Kotlin/Wasm:** [`@JsFun` 선언의 최상위 `require()` 호출 변경, 동반 객체(companion object) 초기화 순서 개선, Kotlin Gradle 플러그인의 Wasmtime 지원, 새로운 컴파일 모드, 함수형 인터페이스의 바이너리 크기 감소](#kotlin-wasm)
* **Kotlin/JS:** [브라우저 테스트를 위한 새로운 DSL, 일시 중단 람다(suspending lambda)를 async 함수로 내보내기 지원, 데이터 클래스 내보내기 기능 개선](#kotlin-js)
* **Gradle:** [Gradle 9.7.0 지원 및 Problems API의 보고 기능 개선](#gradle)
* **Build tools API:** [새로운 타깃 지원: Kotlin/JS, Kotlin/Wasm, Kotlin 메타데이터](#build-tools-api)
* **Kotlin 컴파일러:** [`kotlinr` 실행 명령어 및 별도의 네이티브 이미지](#kotlin-compiler)

다음 비디오에서도 업데이트에 대한 개요를 확인하실 수 있습니다.

<video src="https://www.youtube.com/v/UhRfN7fx5rs" title="What's New in Kotlin 2.4.20"/>

> Kotlin 릴리스 주기에 대한 자세한 내용은 [Kotlin 릴리스 프로세스](releases.md)를 참조하세요.
>
{style="tip"}

## Kotlin 2.4.20으로 업데이트 {id="update-to-kotlin-2-4-20"}

최신 버전의 Kotlin은 [IntelliJ IDEA](https://www.jetbrains.com/idea/download/) 및 [Android Studio](https://developer.android.com/studio) 최신 버전에 포함되어 있습니다.

새 Kotlin 버전으로 업데이트하려면 IDE가 최신 버전으로 업데이트되어 있는지 확인하고 빌드 스크립트에서 [Kotlin 버전을 2.4.20으로 변경](releases.md#update-to-a-new-kotlin-version)하세요.

## 새로운 기능 {id=new-stable-features}
<primary-label ref="stable"/>

Kotlin 2.2.20에서는 JVM 21 이상에서 `invokedynamic`을 사용하여 `when` 표현식을 컴파일하는 실험적 지원이 도입되었습니다.

Kotlin 2.4.20에서는 이 기능이 [안정화(Stable)](components-stability.md#stability-levels-explained) 단계로 전환되었으며 기본적으로 활성화됩니다.

자세한 내용은 [문서](control-flow.md#bytecode-generation-on-the-jvm)를 참조하세요.

## 새로운 기능 {id=new-experimental-features}
<primary-label ref="experimental-exp"/>

이번 릴리스에서는 [Beta](components-stability.md#stability-levels-explained), [Alpha](components-stability.md#stability-levels-explained), [Experimental](components-stability.md#stability-levels-explained) 상태를 포함하여 다음과 같은 안정화 이전 단계의 기능들을 사용할 수 있습니다.

* [표준 라이브러리: 코루틴 스택 트레이스 복구 지원](#support-for-coroutine-stack-trace-recovery)
* [표준 라이브러리: 컬렉션 요소의 일치 여부 및 고유성을 확인하는 새로운 함수](#new-functions-to-check-collection-elements-for-equality-and-uniqueness)
* [표준 라이브러리: `kotlin.test` 단언 함수의 새로운 오버로드](#new-overloads-for-kotlin-test-assertion-functions)
* [Kotlin/Native: 새로운 Swift 내보내기 기능](#new-swift-export-features)
* [Kotlin/Native: `klib` 아티팩트의 증분 컴파일 개선](#improved-incremental-compilation-of-klib-artifacts)
* [Kotlin/JS: 브라우저 테스트를 위한 새로운 DSL](#a-new-dsl-for-browser-testing)
* [Kotlin/JS: 일시 중단 람다를 async 함수로 내보내기 지원](#support-for-exporting-suspending-lambdas-as-async-functions)
* [Build tools API: Kotlin/JS, Kotlin/Wasm, Kotlin 메타데이터 지원](#support-for-kotlin-js-kotlin-wasm-and-kotlin-metadata)
* [Kotlin 컴파일러: 별도의 네이티브 이미지](#native-image)

## 표준 라이브러리 {id="standard-library"}

Kotlin 2.4.20에서는 코루틴 스택 트레이스 복구 지원이 추가되었으며, 컬렉션 요소의 일치 여부와 고유성을 확인하는 새로운 함수 및 `kotlin.test` 단언 함수의 새로운 오버로드가 도입되었습니다.

### 코루틴 스택 트레이스 복구 지원 {id="support-for-coroutine-stack-trace-recovery"}
<primary-label ref="experimental-opt-in"/>
<secondary-label ref="standard-library"/>

Kotlin 2.4.20에서는 표준 라이브러리에 [`StackTraceRecoverable`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.coroutines.debug/-stack-trace-recoverable/) 인터페이스가 추가되었습니다. 이를 통해 `kotlinx.coroutines`에 대한 의존성을 추가하지 않고도 스택 트레이스 복구를 위해 새 예외 인스턴스를 생성하는 방법을 정의할 수 있어 `kotlinx.coroutines` 라이브러리와의 통합이 향상됩니다.

스택 트레이스 복구는 한 코루틴에서 예외를 던지고 다른 코루틴에서 이를 다시 던질(rethrow) 때 디버깅에 유용합니다. 예외가 어디서 발생했고 다른 코루틴이 어디서 이를 다시 던졌는지 확인할 수 있습니다.

`kotlinx.coroutines` 라이브러리는 코루틴 스택 트레이스 정보가 추가된 새 예외 인스턴스를 생성하여 스택 트레이스를 복구합니다. 예외 메시지만 받거나 원인(cause)만 받거나 둘 다 받거나 인수를 받지 않는 생성자가 있는 예외의 경우 자동으로 처리됩니다.

예외 생성자에 줄 번호나 오류 코드와 같은 추가 필수 인수가 있는 경우, `StackTraceRecoverable` 인터페이스를 구현하여 `kotlinx.coroutines` 라이브러리가 해당 예외의 새 인스턴스를 생성하는 방식을 정의하세요.

인터페이스를 구현하려면 [`copyForStackTraceRecovery()`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.coroutines.debug/-stack-trace-recoverable/copy-for-stack-trace-recovery.html) 함수를 오버라이드합니다. 오버라이드한 함수에서 스택 트레이스 복구를 위한 새 예외 인스턴스를 반환하거나, `kotlinx.coroutines` 라이브러리가 예외를 복사하지 않도록 하려면 `null`을 반환하세요.

> `StackTraceRecoverable` 인터페이스는 모든 타깃에서 사용할 수 있지만, `kotlinx.coroutines` 라이브러리는 JVM에서만 이를 스택 트레이스 복구에 사용합니다.
>
{style="note"}

이러한 API는 [실험적(Experimental)](components-stability.md#stability-levels-explained)이며, `@OptIn(ExperimentalStdlibCoroutineSupportApi::class)` 어노테이션을 사용한 옵트인이 필요합니다.

다음은 스택 트레이스 복구를 위해 새 인스턴스를 생성할 때 `line` 프로퍼티를 보존하는 커스텀 예외의 예입니다.

```kotlin
import kotlin.coroutines.ExperimentalStdlibCoroutineSupportApi
import kotlin.coroutines.debug.StackTraceRecoverable

@OptIn(ExperimentalStdlibCoroutineSupportApi::class)
class FileEditException
// 원인을 IllegalStateException 생성자에 전달하기 위해
// 구현 시 private 생성자가 필요합니다.
private constructor(
    val line: Int,
    private val detail: String,
    cause: Throwable?,
) : IllegalStateException("When editing line $line: $detail", cause),
    // 스택 트레이스 복구를 위해 StackTraceRecoverable을 구현합니다.
    StackTraceRecoverable<FileEditException> {

    constructor(line: Int, detail: String) : this(line, detail, null)

    // 줄 번호와 메시지 세부 정보를 복사합니다.
    override fun copyForStackTraceRecovery(): FileEditException =
        FileEditException(line, detail, this)
    }

fun main() {
    val original = FileEditException(15, "Unexpected token")

    // 동작을 테스트하는 경우가 아니라면 일반적으로 이 함수를 직접 호출할 필요는 없습니다.
    // kotlinx.coroutines 라이브러리가 스택 트레이스 복구 중에 자동으로 호출합니다.
    val copy = original.copyForStackTraceRecovery()

    println(copy.message)
    // When editing line 15: Unexpected token

    println(copy.cause == original)
    // true
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="2.4.20"}

자세한 내용은 해당 기능의 [KEEP](https://github.com/Kotlin/KEEP/blob/main/proposals/stdlib/KEEP-0461-stacktrace-recoverable.md)을 참조하세요.

피드백은 [YouTrack](https://youtrack.jetbrains.com/issue/KT-86595)을 통해 전달해 주시기 바랍니다.

### 컬렉션 요소의 일치 여부 및 고유성을 확인하는 새로운 함수 {id="new-functions-to-check-collection-elements-for-equality-and-uniqueness"}
<primary-label ref="experimental-opt-in"/>
<secondary-label ref="standard-library"/>

Kotlin 2.4.20 이전에는 컬렉션 요소가 모두 고유한지 또는 모두 동일한지 확인하려면 비효율적인 코드 패턴을 사용해야 했습니다.

Kotlin 2.4.20에서는 이러한 한계를 해결하기 위해 실험적 함수를 도입했습니다.

| 함수 | 확인 내용 |
|---|---|
| [`allDistinct()`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.collections/all-distinct.html) | 컬렉션의 모든 값이 고유한지 확인합니다. |
| [`allDistinctBy()`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.collections/all-distinct-by.html) | 선택한 프로퍼티에 대해 모든 객체가 고유한 값을 갖는지 확인합니다. |
| [`allEqual()`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.collections/all-equal.html) | 컬렉션의 모든 값이 동일한지 확인합니다. |
| [`allEqualBy()`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.collections/all-equal-by.html) | 선택한 프로퍼티에 대해 모든 객체가 동일한 값을 갖는지 확인합니다. |

이러한 함수는 컬렉션, 시퀀스, 배열에서 사용할 수 있습니다. 다른 컬렉션 연산과 마찬가지로 구조적 동등성(structural equality)을 사용하여 요소를 비교합니다.

이 함수들은 [실험적(Experimental)](components-stability.md#stability-levels-explained)이며, `@OptIn(ExperimentalStdlibApi::class)` 어노테이션 또는 `-opt-in=kotlin.ExperimentalStdlibApi` 컴파일러 옵션을 통한 옵트인이 필요합니다.

```kotlin
@OptIn(ExperimentalStdlibApi::class)
fun main() {
    data class Response(
        val participantId: String,
        val answer: String,
        val responseDate: String
    )

    val responses = listOf(
        Response("P001", "Yes", "2026-07-21"),
        Response("P002", "Maybe", "2026-07-21"),
        Response("P003", "No", "2026-07-21")
    )

    // 모든 참가자가 동일한 답변을 했는지 확인
    println(responses.allEqualBy { it.answer })
    // false

    // 중복된 참가자가 있는지 확인
    println(responses.allDistinctBy { it.participantId })
    // true

    // 모든 응답이 같은 날짜에 제출되었는지 확인
    println(responses.allEqualBy { it.responseDate })
    // true

    val answers = responses.map { it.answer }

    // 답변이 모두 동일한지 확인
    println(answers.allEqual())
    // false

    // 답변이 모두 고유한지 확인
    println(answers.allDistinct())
    // true
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="2.4.20"}

피드백은 [KEEP](https://github.com/Kotlin/KEEP/discussions/495)에 남겨 주시기 바랍니다.

### `kotlin.test` 단언 함수의 새로운 오버로드 {id="new-overloads-for-kotlin-test-assertion-functions"}
<primary-label ref="experimental-opt-in"/>
<secondary-label ref="standard-library"/>

Kotlin 2.4.20에서는 `kotlin.test` 단언 함수에 새로운 오버로드가 추가되었습니다. 이 함수들은 단언이 실패할 때만 오류 메시지를 지연 생성(lazy generation)하는 람다를 허용합니다.

이전에는 `assertTrue()` 또는 `assertEquals()`와 같은 `kotlin.test` 단언 함수가 미리 포맷된 오류 메시지만 허용했기 때문에 단언이 성공하여 메시지가 실제로 사용되지 않는 경우에도 매번 메시지가 생성되었습니다.

새로운 오버로드는 `kotlin.test` API를 JUnit 5와 일치시키며, 단순 문자열 대신 람다를 통한 메시지 공급자(supplier)를 전달받습니다. 이를 통해 성능이 향상되며, 특히 단언에 대한 상세한 오류 메시지를 생성하는 [Power-assert 컴파일러 플러그인](power-assert.md)을 사용할 때 유용합니다.

새로운 오버로드는 다음 단언 함수에서 사용할 수 있습니다.

| 함수 | 설명 |
|---|---|
| [`assertTrue()`](https://kotlinlang.org/api/core/kotlin-test/kotlin.test/assert-true.html) / [`assertFalse()`](https://kotlinlang.org/api/core/kotlin-test/kotlin.test/assert-false.html) | 값이 `true` 또는 `false`인지 확인합니다. |
| [`assertEquals()`](https://kotlinlang.org/api/core/kotlin-test/kotlin.test/assert-equals.html) / [`assertNotEquals()`](https://kotlinlang.org/api/core/kotlin-test/kotlin.test/assert-not-equals.html) | 값이 같은지 여부를 확인합니다. |
| [`assertSame()`](https://kotlinlang.org/api/core/kotlin-test/kotlin.test/assert-same.html) / [`assertNotSame()`](https://kotlinlang.org/api/core/kotlin-test/kotlin.test/assert-not-same.html) | 값이 동일한 인스턴스를 참조하는지 확인합니다. |
| [`assertIs()`](https://kotlinlang.org/api/core/kotlin-test/kotlin.test/assert-is.html) / [`assertIsNot()`](https://kotlinlang.org/api/core/kotlin-test/kotlin.test/assert-is-not.html) | 값이 지정된 타입인지 확인합니다. `assertIs()`의 경우 해당 타입으로 스마트 캐스트합니다. |
| [`assertNull()`](https://kotlinlang.org/api/core/kotlin-test/kotlin.test/assert-null.html) | 값이 `null`인지 확인합니다. |
| [`assertContains()`](https://kotlinlang.org/api/core/kotlin-test/kotlin.test/assert-contains.html) | 컬렉션, 배열, 시퀀스, 범위 또는 맵에 해당 요소(키, 문자, 부분 문자열 또는 정규식)가 포함되어 있는지 확인합니다. |
| [`assertContentEquals()`](https://kotlinlang.org/api/core/kotlin-test/kotlin.test/assert-content-equals.html) | 컬렉션, 시퀀스 또는 배열에 동일한 순서로 같은 요소가 포함되어 있는지 확인합니다. |

새로운 API를 사용하려면 `@OptIn(ExperimentalKotlinTestApi::class)` 어노테이션으로 명시적인 옵트인이 필요합니다.

```kotlin
import kotlin.test.ExperimentalKotlinTestApi
import kotlin.test.assertEquals
import kotlin.test.assertTrue

@OptIn(ExperimentalKotlinTestApi::class)
fun testValues(actual: Int, expected: Int, items: List<String>) {
    // 메시지는 단언이 실패할 때만 생성됩니다.
    assertTrue(actual > 0) { "Expected a positive value but got $actual" }

    // 단언이 실패하지 않는 한 리스트 포맷팅을 건너뜁니다.
    assertEquals(expected, actual) { "Unexpected value for items: ${items.joinToString()}" }
}
```

자세한 내용은 해당 기능의 [KEEP](https://github.com/Kotlin/KEEP/blob/main/proposals/stdlib/KEEP-0465-kotlin.test-lazy-assertion-messages.md)을 참조하세요.

## Kotlin/Native {id="kotlin-native"}

Kotlin 2.4.20에서는 Kotlin Multiplatform 프로젝트의 SwiftPM 의존성을 위한 `Package.swift` 파일 자동 생성, 봉인된 클래스(sealed class) 및 언어 간 상속 지원을 포함한 새로운 Swift 내보내기 기능, 개선된 증분 컴파일을 제공합니다.

### SwiftPM 의존성을 위한 `Package.swift` 자동 생성 {id="generated-package-swift-for-swiftpm-dependencies"}
<secondary-label ref="native"/>

SwiftPM 패키지에 의존하는 XCFramework를 내보낼 때는 정상적으로 의존성이 해결되도록 결과물인 SwiftPM 패키지를 함께 배포해야 합니다. 이를 돕기 위해 이제 `assembleSharedXCFramework` Gradle 작업에서 XCFramework와 함께 배포할 `Package.swift` 파일을 생성합니다.

자세한 내용은 [SwiftPM 내보내기 페이지](https://kotlinlang.org/docs/multiplatform/multiplatform-spm-export.html)를 참조하세요.

### 새로운 Swift 내보내기 기능 {id="new-swift-export-features"}
<primary-label ref="alpha"/>
<secondary-label ref="native"/>

#### 봉인된 클래스(Sealed classes) {id="sealed-classes"}

Kotlin 2.4.20에서는 Swift 내보내기에 봉인된 클래스 및 인터페이스 지원이 추가되었습니다.

이전에는 봉인된 타입을 다룰 때 `switch` 문마다 `default` 케이스를 작성해야 했습니다. 이제 Kotlin에 정의된 sealed 계층 구조가 Swift enum에 매핑되므로 Xcode에서 완전한 자동 완성을 지원하며 모든 케이스를 빠짐없이 처리하는(exhaustive) `switch` 문을 사용할 수 있습니다.

Swift 내보내기는 각 sealed 타입에 `sealedType()` 메서드를 생성합니다. 이 메서드는 sealed 계층의 직속 서브클래스와 일치하는 케이스를 가진 Swift enum을 반환합니다. 계층 구조의 더 깊은 수준과 일치하도록 이러한 호출을 중첩할 수도 있습니다.

예를 들어 Kotlin에서 클래스 계층 구조를 갖는 sealed 인터페이스를 선언합니다.

```kotlin
// Kotlin
sealed interface Shape

class Circle : Shape {
    override fun toString(): String = "Circle"
}

class Rectangle : Shape {
    override fun toString(): String = "Rectangle"
}

fun createCircle(): Shape = Circle()
```

Swift 측에서는 `default` 케이스 없이 완전한(exhaustive) `switch`를 사용할 수 있습니다.

```swift
// Swift
let shape = createCircle()

let name = switch shape.sealedType() {
    case let .circle(type): "It's a \(type.value)"
    case let .rectangle(type): "It's a \(type.value)"
}
// name == "It's a Circle"
```

`switch`가 모든 케이스를 포괄하므로, sealed 계층에 새로운 서브클래스가 추가되면 컴파일러가 경고를 표시하여 `default` 케이스에 의존하는 대신 즉시 처리할 수 있도록 돕습니다.

#### Swift 내보내기에서의 언어 간 상속 {id="cross-language-inheritance-in-swift-export"}

Kotlin 2.4.20에서는 Swift 내보내기에 언어 간 상속 지원이 도입되었습니다.

이 기능의 일반적인 사용 사례는 [역방향 가져오기(reverse import)](native-lib-import-stability.md#swift-library-import) 패턴으로, Kotlin에서 계약(contract)을 정의하고 Swift 측에서 플랫폼별 구현을 제공하는 방식입니다. 이는 Kotlin으로 직접 가져올 수 없는 순수 Swift 라이브러리를 사용해야 할 때 특히 유용합니다.

이 패턴을 구현하려면 Swift 구현부가 상속받을 Kotlin 슈퍼클래스와 Kotlin 인터페이스를 선언하세요. 그런 다음 Swift에서 이 인터페이스를 구현하고 해당 인터페이스를 허용하는 Kotlin 함수로 Swift 객체를 전달합니다.
예를 들어 CryptoKit 라이브러리의 경우 다음과 같이 작성합니다.

1. Kotlin 측에서 인터페이스, 이를 파라미터로 받는 함수, `open` 베이스 클래스를 선언합니다.

   ```kotlin
   // Kotlin
   interface CryptoProvider {
       fun hashMD5(input: String): String
   }

   fun processHash(provider: CryptoProvider, input: String): String = provider.hashMD5(input)

   open class SwiftBase
   ```

2. Swift 측에서는 내보내진 `SwiftBase` 클래스를 상속하고, 순수 Swift 라이브러리를 사용하여 인터페이스를 구현한 다음, 해당 객체를 다시 Kotlin으로 전달합니다.

   ```swift
   // Swift
   import CryptoKit

   final class IosCryptoProvider: SwiftBase, CryptoProvider {
       func hashMD5(input: String) -> String {
           guard let data = input.data(using: .utf8) else { return "failed" }
           return Insecure.MD5.hash(data: data).description
       }
   }

   let provider = IosCryptoProvider()

   // Swift의 hashMD5()를 다시 호출하는 Kotlin 함수를 호출합니다.
   print(processHash(provider: provider, input: "Hello, world!"))
   ```

Kotlin이 Swift 객체를 수신하면 일반 인터페이스의 구현체처럼 취급하여 Swift 코드를 직접 호출합니다.

Swift 내보내기에 대한 자세한 내용은 [문서](native-swift-export.md)를 참조하세요.

### `klib` 아티팩트의 증분 컴파일 개선 {id="improved-incremental-compilation-of-klib-artifacts"}
<primary-label ref="beta"/>
<secondary-label ref="native"/>

Kotlin 2.4.20에서는 `klib` 아티팩트의 증분 컴파일에 대한 안정화 개선이 이루어졌으며, 현재 [Beta 단계](components-stability.md#kotlin-native)입니다.

이 최적화는 [Kotlin 1.9.20](whatsnew1920.md#incremental-compilation-of-klib-artifacts)에서 처음 도입되었으며, 디버그 빌드의 컴파일 시간을 대폭 단축하는 것으로 입증되었습니다. 그 이후로 수많은 버그를 수정하고 성능을 향상해 왔습니다.

증분 컴파일을 사용해 보려면 `gradle.properties` 파일에 다음 옵션을 추가하세요.

```properties
kotlin.incremental.native=true
```

현재 적극적으로 피드백을 수집하고 있으며, 향후 Kotlin 릴리스에서는 모든 프로젝트에 증분 컴파일을 기본적으로 활성화할 계획입니다. 문제가 발생하면 [이슈 트래커](https://kotl.in/issue)로 제보해 주시기 바랍니다.

## Kotlin/Wasm {id="kotlin-wasm"}

Kotlin 2.4.20에서는 Kotlin/Wasm이 `@JsFun` 선언의 최상위 `require()` 호출을 처리하는 방식이 변경되었으며, 동반 객체 초기화 순서가 JVM 동작과 일치하도록 조정되었고, 함수형 인터페이스의 바이너리 크기가 줄어들었으며, 새로운 컴파일 모드가 도입되고, Kotlin Gradle 플러그인에서 `wasmWasi` 타깃의 런타임으로 Wasmtime 지원이 추가되었습니다.

### `@JsFun` 선언의 최상위 `require()` 호출 변경 {id="changes-to-top-level-require-calls-in-jsfun-declarations"}
<secondary-label ref="wasm"/>

이제 Kotlin/Wasm에서는 [`@JsFun`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin/-js-fun/) 선언이 최상위 `require()` 함수를 사용할 때 오류를 보고합니다.

이전에는 컴파일러가 `import-object.mjs` 파일에 `require` 변수를 생성하여 `@JsFun` 선언에서 `require()`를 호출할 수 있었습니다.

이러한 동작은 의도치 않게 컴파일러 내부 구현 세부 정보를 노출시켰습니다. 이러한 방식에서 벗어나는 마이그레이션을 지원하기 위해 Kotlin/Wasm은 이 생성된 `require` 선언을 제거했으며, 컴파일러는 이제 해당 호출에 대해 오류를 보고합니다. 예를 들면 다음과 같습니다.

```kotlin
// 오류를 보고함
@JsFun("(mod) => require(mod)")
external fun loadModule(mod: String): JsAny
```

이러한 변경에 대비하려면 `@JsFun` 선언의 최상위 `require()` 호출을 [`@JsModule`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.js/-js-module/) 어노테이션으로 대체하세요.

```kotlin
@JsModule("module")
external val module: Module

external interface Module {
    // 예상되는 모듈 멤버를 정의합니다.
}
```

동적 모듈 로딩의 경우 `import()` 표현식을 대신 사용하세요.
webpack이 동적 import를 파싱하지 못하도록 하려면 `/* webpackIgnore: true */` 매직 주석을 추가합니다.

```kotlin
@JsFun("""
    ((module) => () => module)(
        await import(/* webpackIgnore: true */ "module")
    )
""")
private external fun loadModuleDynamically(): JsAny?
```

조건부로 `import()` 표현식을 사용할 수도 있습니다. 예를 들어 Node.js에서 실행 중일 때만 모듈을 로드할 수 있습니다.

```kotlin
@JsFun("""
    ((module) => () => module)(
        ((typeof process !== "undefined") && (process.release.name === "node"))
            ? await import(/* webpackIgnore: true */ "module")
            : null
    )
""")
private external fun loadNodeModule(): JsAny?
```

프로젝트가 최상위 `require()` 함수를 필요로 하는 의존성에 의존하고 있는 경우 임시 해결책으로 `globalThis`의 프로퍼티로 추가할 수 있습니다.

```kotlin
@JsFun("""
    ((module) => {
        globalThis.require = module.default.createRequire(import.meta.url)
        return () => {}
    })(await import("node:module"))
""")
external fun defineRequire()
```

문제가 발생하면 [이슈 트래커](https://youtrack.jetbrains.com/issue/KT-86192)를 통해 피드백을 공유해 주세요.

### 동반 객체 초기화 순서 개선 {id="improved-companion-object-initialization-order"}
<secondary-label ref="wasm"/>

Kotlin/Wasm은 이제 JVM 동작과 일치하도록 서브클래스 동반 객체보다 슈퍼클래스 동반 객체를 먼저 초기화합니다. 이전에는 초기화 순서가 뒤바뀔 수 있어 플랫폼 간 동작의 불일치가 발생했습니다.

이번 업데이트를 통해 플랫폼 간 일관성이 개선되고 클래스 초기화 동작에 대한 플랫폼별 차이가 줄어듭니다. 또한 중간 클래스가 동반 객체를 선언하지 않은 경우를 포함하여 더 깊은 상속 계층 구조에서도 동반 객체 초기화를 올바르게 처리할 수 있습니다.

### Kotlin Gradle 플러그인에서 Wasmtime 지원 {id="support-for-wasmtime-in-the-kotlin-gradle-plugin"}
<secondary-label ref="wasm"/>

Kotlin 2.4.20에서는 Kotlin Gradle 플러그인의 `wasmWasi` 타깃 런타임으로 [Wasmtime](https://docs.wasmtime.dev/) 지원을 도입합니다.

이전에는 `wasmWasi` 타깃이 Node.js 런타임만 지원하여 WASI 애플리케이션을 실행하기 위해 JavaScript 부트스트랩이 필요했습니다. 이제 Wasmtime 지원을 통해 독립 실행형(standalone) WebAssembly 런타임에서 Kotlin/Wasm 애플리케이션을 실행할 수 있습니다.

`wasmWasi` 타깃의 런타임으로 Wasmtime을 사용하려면 Gradle 빌드 파일에 `wasmtime()`을 추가하세요.

```kotlin
kotlin {
    wasmWasi {
        wasmtime()
    }
}
```

피드백은 [YouTrack](https://youtrack.jetbrains.com/issue/KT-86633)을 통해 전달해 주시기 바랍니다.

### 새로운 컴파일 모드 {id="new-compilation-modes"}
<secondary-label ref="wasm"/>

Kotlin 2.4.20에서는 새로운 멀티 모듈 모드를 포함하여 Kotlin/Wasm 컴파일 모드를 선택할 수 있는 지원이 추가되었습니다. 이전에는 컴파일러가 프로젝트와 해당 의존성을 함께 컴파일하여 단일 바이너리를 생성하는 모놀리스(monolith) 컴파일 모드를 사용했습니다. 이를 통해 컴파일러가 데드 코드 제거(DCE)를 수행하고 가장 작은 크기의 결과물을 생성할 수 있었습니다.

이제 다음과 같은 컴파일 모드 중 하나를 선택할 수 있습니다.

| 컴파일 모드 | 컴파일 방식 | 결과물 | 최적화 동작 |
|---|---|---|---|
| `monolith` (기본값) | 프로젝트와 해당 의존성을 함께 컴파일합니다. | 단일 바이너리 | 도달할 수 없는 선언을 제거하고 의존성을 포함한 전체 프로그램에 최적화를 적용합니다. |
| `multimodule-open-world` | 각 모듈을 독립적으로 컴파일하고 변경된 모듈만 다시 컴파일합니다. | 각 모듈별 별도의 독립적인 바이너리 | 모듈 간 최적화를 적용하지 않으므로 바이너리 크기가 더 커집니다. |
| `multimodule-closed-world` | 한 번의 호출로 모든 모듈을 처리하고 변경된 모듈만 다시 컴파일합니다. | 서로 의존하는 별도의 바이너리 | 도달할 수 없는 선언을 제거하지만 각 Wasm 바이너리를 독립적으로 최적화합니다. |

컴파일 모드를 선택하려면 `gradle.properties` 파일에 `kotlin.wasm.compilationMode` 프로퍼티를 추가하세요.

```properties
kotlin.wasm.compilationMode=multimodule-open-world
```

또한 개발 빌드에는 클로즈드 월드 멀티 모듈 컴파일을 사용하고 프로덕션 빌드에는 모놀리스 컴파일을 사용하도록 Kotlin/Wasm을 구성할 수도 있습니다. 이렇게 하면 개발 중 재컴파일 시간을 단축하는 동시에 프로덕션 빌드에서는 가장 작은 결과물을 생성할 수 있습니다.

이 구성을 사용하려면 `gradle.properties` 파일에 다음 프로퍼티를 추가하세요.

```properties
kotlin.wasm.compilationMode=multimodule-closed-world-only-in-dev
```

피드백은 [YouTrack](https://youtrack.jetbrains.com/issue/KT-86919)을 통해 남겨 주시기 바랍니다.

### 람다 및 함수형 인터페이스의 바이너리 크기 감소 {id="reduced-binary-size-for-lambdas-and-functional-interfaces"}
<secondary-label ref="wasm"/>

Kotlin 2.4.20에서는 Kotlin/Wasm이 람다와 함수형 인터페이스를 컴파일하는 방식이 변경되었습니다.
컴파일러는 이제 별도의 익명 클래스를 생성하는 대신 함수를 생성하고 공유 베이스 클래스를 사용합니다.

[KotlinConf 애플리케이션](https://github.com/JetBrains/kotlinconf-app)으로 테스트한 결과, 이 변경을 통해 Wasm 바이너리 크기가 약 5~10% 감소하는 것으로 나타났습니다.

이 변경으로 동적 호출이 더 많이 도입되므로 런타임 성능에 영향을 미칠 수 있습니다. 문제가 발생하는 경우 [이슈 트래커](https://youtrack.jetbrains.com/issue/KT-83159)로 제보해 주세요.

## Kotlin/JS {id="kotlin-js"}

Kotlin 2.4.20은 데이터 클래스의 내보내기 기능을 개선하고 브라우저 테스트를 위한 새로운 실험적 DSL을 도입하며 일시 중단 람다를 JavaScript async 함수로 내보내는 기능을 지원합니다.

### 내보낸 데이터 클래스의 합성 함수에 대한 일관된 내보내기 지원 {id="consistent-exportability-of-synthetic-functions-on-exported-data-classes"}
<secondary-label ref="js"/>

Kotlin 2.4.20에서는 데이터 클래스 프로퍼티에 `@JsExport.Ignore` 어노테이션이 올바르게 적용되지 않던 문제를 수정했습니다.

이전에는 데이터 클래스에 `@JsExport` 어노테이션을 지정했을 때, 생성자와 프로퍼티에 명시적으로 `@JsExport.Ignore`를 지정했음에도 불구하고 자동으로 생성되는 `copy()` 및 `componentN()` 함수로 인해 컴파일러가 데이터 클래스 내보내기 관련 경고를 보고했습니다.

예를 들어 JavaScript로 내보내지 않아야 하는 내부 `DatabaseConnection` 타입에 대한 참조를 가진 JavaScript 내보내기 대상 `Session` 데이터 클래스를 고려해 보겠습니다.

```kotlin
// Kotlin
// JavaScript로 내보내지 않는 내부 타입
class DatabaseConnection

@JsExport
data class Session @JsExport.Ignore constructor(
    val userId: String,
    @JsExport.Ignore val connection: DatabaseConnection,
)
```

이 문제가 해결되어 컴파일러가 `@JsExport.Ignore` 어노테이션을 반영하므로 `Session`의 합성 `copy()` 및 `componentN()` 함수가 내보내지 않은 타입인 `DatabaseConnection`에 대해 더 이상 경고를 유발하지 않습니다. 이는 [`@ConsistentCopyVisibility` 및 `@ExposedCopyVisibility` 어노테이션](whatsnew2020.md#data-class-copy-function-to-have-the-same-visibility-as-constructor)으로 도입된 가시성 규칙과 일치합니다.

### 브라우저 테스트를 위한 새로운 DSL {id="a-new-dsl-for-browser-testing"}
<primary-label ref="experimental-opt-in"/>
<secondary-label ref="js"/>

Kotlin 2.4.20에서는 브라우저 환경에서 Kotlin/JS 테스트를 실행하기 위한 새로운 실험적 DSL을 도입합니다.

현재 Kotlin Gradle 플러그인은 여러 브라우저에서 JavaScript 테스트를 실행하기 위한 브라우저 실행기로 [Karma](https://github.com/karma-runner/karma)를 사용합니다. Karma 프로젝트는 이미 2년 동안 지원이 중단(deprecated)된 상태였기에, 브라우저 테스트를 지원하기 위한 대안을 모색하게 되었습니다.

새로운 DSL은 내부적으로 다양한 도구를 관리하는 도구로서 Karma를 대체할 예정이며 다음을 포함합니다.

* Chromium, Firefox 및 WebKit(Safari) 브라우저 엔진을 지원하는 브라우저 드라이버이자 배포 관리자로서의 [Playwright](https://playwright.dev/)
* 테스트 러너로서의 [Mocha](https://mochajs.org/)
* 번들러로서의 [webpack](https://webpack.js.org/) ([향후 릴리스](https://youtrack.jetbrains.com/issue/KT-48308/)에서 [Vite](https://vite.dev/)로 대체될 예정)

브라우저 테스트를 위한 새 DSL을 사용해 보려면 Kotlin/JS 타깃의 `browser {}` 내에 옵트인 `test {}` 블록을 추가하세요.

```kotlin
import org.jetbrains.kotlin.gradle.ExperimentalJsTestDsl
import kotlin.time.Duration.Companion.seconds

kotlin {
    js {
        browser {
            // 새로운 test {} 블록을 추가하고 구성합니다.
            @OptIn(ExperimentalJsTestDsl::class)
            test {
                // 모든 러너에 대한 기본 타임아웃 구성
                timeout = 2.seconds
                // Gradle provider를 사용하여 헤드리스 모드 구성
                headless = providers
                    .environmentVariable("IS_IN_CI")
                    .map { it.toBoolean() }
                    .orElse(false)
                // Chromium 테스트 러너 활성화 및 구성
                chromium {
                    // 공통 타임아웃 옵션 재정의
                    timeout = 5.seconds
                    // 추가 실행 인수 추가
                    launchArgs.add("--no-sandbox")
                }
                // Firefox 테스트 러너 활성화
                firefox()
                // WebKit 테스트 러너 활성화
                webkit()
                // 추가 WebKit 테스트 러너 활성화 및 구성
                webkit("noheadless") {
                    // 커스텀 옵션 설정
                    headless = false
                }
            }
        }
    }
}
```

브라우저 테스트를 위한 새로운 DSL은 활발히 개발 중입니다. 피드백은 [YouTrack](https://youtrack.jetbrains.com/issue/KT-66897)으로 전달해 주시면 감사하겠습니다.

자세한 내용은 [Kotlin/JS에서 테스트 실행](js-running-tests.md)을 참조하세요.

### 일시 중단 람다를 async 함수로 내보내기 지원 {id="support-for-exporting-suspending-lambdas-as-async-functions"}
<primary-label ref="experimental-general"/>
<secondary-label ref="js"/>

Kotlin 2.4.20부터는 일시 중단 [람다 표현식](lambdas.md#lambda-expressions-and-anonymous-functions)을 JavaScript `async` 함수로 내보낼 수 있습니다.

이전에는 Kotlin/JS 라이브러리에서 일시 중단 람다를 포함하는 선언을 내보낼 방법이 없었습니다. 이제 Kotlin 컴파일러가 Kotlin의 `suspend` 함수와 JavaScript의 네이티브 [`async`/`await`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/async_function) 모델 간의 브리징을 자동으로 처리하므로, Kotlin과 TypeScript가 혼합된 코드베이스에서 유용하게 사용할 수 있습니다.

이 기능을 활성화하려면 `build.gradle.kts` 파일에 다음 컴파일러 옵션을 추가하세요.

```kotlin
kotlin {
    js {
        compilations.all {
            compileTaskProvider.configure {
                compilerOptions {
                    freeCompilerArgs.add("-Xsuspend-lambda-exporting")
                }
            }
        }
    }
}
```

그런 다음 관련 선언에 `@JsExport`를 표시합니다.

```kotlin
// Kotlin
@JsExport
class TaskRunner {
    suspend fun runTask(task: suspend () -> String): String {
        return task()
    }
}
```

TypeScript 측에서는 일시 중단 람다가 일반 `async` 함수로 나타납니다.

```typescript
// TypeScript
import { TaskRunner } from "..."

const runner = new TaskRunner();
const result = await runner.runTask(async () => "done");
console.log(result); // "done"
```

`@JsExport` 어노테이션에 대한 자세한 내용은 [문서](js-to-kotlin-interop.md#jsexport-annotation)를 참조하세요.

## Gradle {id="gradle"}

Kotlin 2.4.20은 Gradle 7.6.3부터 9.7.0까지 완벽하게 호환됩니다. 최신 Gradle 릴리스 버전까지도 사용할 수 있습니다. 단, 최신 버전을 사용할 경우 지원 중단(deprecation) 경고가 발생할 수 있으며 일부 새로운 Gradle 기능이 작동하지 않을 수 있습니다.

또한 Kotlin 2.4.20에서는 Problems API와의 통합이 개선되었습니다.

### Problems API의 보고 기능 개선 {id="improved-reporting-in-problems-api"}
<secondary-label ref="gradle"/>

Kotlin 2.2.0은 [Kotlin Gradle 플러그인(KGP)이 Gradle의 Problems API와 통합](whatsnew22.md#integration-of-problems-api-within-kgp-diagnostics)된 첫 번째 릴리스였습니다.
Kotlin 2.4.0에서는 [Kotlin/JVM의 컴파일러 메시지를 Problems API에 기록하는 기능](whatsnew24.md#compiler-messages-written-to-problems-api-for-kotlin-jvm)이 추가되었습니다.

Kotlin 2.4.20에서는 컴파일러가 [Problems API](https://docs.gradle.org/current/kotlin-dsl/gradle/org.gradle.api.problems/index.html)에 전달하는 정보에 컴파일러 진단(diagnostic) ID를 추가했습니다. 또한 이러한 ID를 기준으로 진단 항목을 그룹화하여 컴파일 문제의 원인을 더 쉽게 파악할 수 있도록 했습니다.

Gradle 8.6부터 KGP는 이 통합을 기본적으로 활성화합니다. 이 API는 계속 발전하고 있으므로 최신 개선 사항을 활용하려면 최신 Gradle 버전을 사용하는 것이 좋습니다.

## Build tools API {id="build-tools-api"}

Kotlin 2.4.20에서는 Build tools API에 Kotlin/JS, Kotlin/Wasm 및 Kotlin 메타데이터에 대한 실험적 지원이 추가되었습니다.

### Kotlin/JS, Kotlin/Wasm 및 Kotlin 메타데이터 지원 {id="support-for-kotlin-js-kotlin-wasm-and-kotlin-metadata"}
<primary-label ref="experimental-general"/>
<secondary-label ref="bta"/>

[Kotlin 2.2.0](whatsnew22.md#new-experimental-build-tools-api)에서는 Kotlin/JVM용 Build tools API(BTA)가 도입되었습니다. Kotlin 2.4.20은 새로운 타깃인 Kotlin/JS, Kotlin/Wasm 및 Kotlin 메타데이터 지원을 추가하여 BTA 안정화를 향한 다음 단계를 밟았습니다.

이를 통해 Kotlin Gradle 플러그인이 컴파일러와 더욱 일관되게 상호작용할 수 있습니다. 경우에 따라 더 빠르고 안정적인 컴파일 성능을 얻을 수도 있습니다.

BTA는 빌드 시스템과 Kotlin 컴파일러 생태계 사이에서 추상화 계층 역할을 하는 범용 API입니다. 사용 가능한 빌드 도구에서 Kotlin 기능 및 Kotlin 컴파일러와의 호환성을 지원할 수 있도록 돕습니다.

Kotlin 2.4.20에서 BTA는 새로운 타깃에 대해 옵트인 방식으로 제공됩니다. 사용해 보려면 `gradle.properties` 파일에 해당 프로퍼티를 추가하세요.

```properties
kotlin.wasm.runViaBuildToolsApi=true
kotlin.js.runViaBuildToolsApi=true
kotlin.metadata.runViaBuildToolsApi=true
```

Kotlin 2.5.0부터는 Kotlin/JS, Kotlin/Wasm 및 Kotlin 메타데이터에서 BTA를 기본적으로 활성화할 계획입니다.

BTA 제안서가 궁금하거나 피드백을 공유하고 싶다면 이 [KEEP](https://github.com/Kotlin/KEEP/blob/build-tools-api/proposals/extensions/build-tools-api.md)을 참조하세요.

## Kotlin 컴파일러 {id="kotlin-compiler"}

Kotlin 2.4.20에는 변경된 Kotlin 실행 명령어인 `kotlinr`에 대한 업데이트가 포함되어 있으며, 실험적인 Kotlin 컴파일러 네이티브 이미지가 도입되었습니다.

### Kotlin 실행 명령어가 `kotlin`에서 `kotlinr`로 변경됨 {id="changed-the-kotlin-runner-command-from-kotlin-to-kotlinr"}
<secondary-label ref="compiler"/>

[Kotlin Toolchain](https://kotlin-toolchain.org/latest/)의 `kotlin` 명령어와의 이름 충돌을 방지하기 위해 Kotlin 실행 명령어가 `kotlin`에서 `kotlinr`로 대체되었습니다. 또한 Kotlin 실행기는 사용자가 `kotlin` 명령어를 사용할 때 경고를 표시하고 대신 `kotlinr`을 사용할 것을 권장합니다.

### 네이티브 이미지 {id="native-image"}
<primary-label ref="experimental-general"/>
<secondary-label ref="compiler"/>

Kotlin 2.4.20에서는 Kotlin 컴파일러 네이티브 이미지의 첫 번째 [실험적(Experimental)](components-stability.md#stability-levels-explained) 릴리스를 선보입니다. 네이티브 이미지는 표준 `kotlinc` 명령줄 도구를 대체하여 완벽하게 호환되며, 더 빠른 시작 시간과 더 높은 성능을 제공합니다.

네이티브 이미지를 사용해 보려면 [GitHub Releases](https://github.com/JetBrains/kotlin/releases/tag/v2.4.20)에서 빌드를 다운로드하세요.

네이티브 이미지에는 `-Xplugin` 또는 `-Xcompiler-plugin` CLI 옵션과 함께 사용할 수 있는 다음 컴파일러 플러그인들도 번들로 포함되어 있습니다.

* [Serialization](serialization.md)
* [Compose 컴파일러](compose-compiler-options.md)
* [All-open](all-open-plugin.md)
* [`no-arg`](no-arg-plugin.md)
* [SAM with receiver](sam-with-receiver-plugin.md)
* [Assignment](https://plugins.gradle.org/plugin/org.jetbrains.kotlin.plugin.assignment)
* [Lombok](lombok.md)
* [Power-assert](power-assert.md)

Kotlin 컴파일러 네이티브 이미지에 대한 자세한 내용은 해당 [README](https://github.com/JetBrains/kotlin/blob/master/prepare/compiler-native-image/README.md)를 참조하세요.

## 주요 변경 사항 및 지원 중단(Deprecations) {id="breaking-changes-and-deprecations"}

이 섹션에서는 중요한 호환성 변경 사항 및 지원 중단 사항을 다룹니다. 전체 개요는 [호환성 가이드](compatibility-guide-24.md)를 참조하세요.

* Apple이 32비트 watchOS 타깃에 대한 지원을 중단함에 따라 `watchosArm32` [Kotlin/Native](native-target-support.md) 타깃이 이제 deprecated 되었습니다. Xcode 27과의 호환성을 보장하기 위해 Kotlin 2.5.0에서 제거될 예정입니다.
* Kotlin 2.4.20부터 Kotlin/Native 컴파일러는 `public` 인라인 함수 내부 또는 다른 파일에서 호출되는 `internal` 인라인 함수 내부에서의 AtomicFU 원자적 연산 사용을 금지합니다.
* Kotlin 2.4.20에서는 webpack의 npm 의존성을 5.108.1로 업데이트했습니다. 이는 프로젝트에 두 가지 방식으로 영향을 줄 수 있습니다.
  * webpack이 내장 미니마이저(minimizer) 의존성을 `terser-webpack-plugin`에서 더 포괄적인 [`minimizer-webpack-plugin`](https://www.npmjs.com/package/minimizer-webpack-plugin)으로 변경했습니다. Terser는 여전히 기본 JavaScript 미니마이저로 유지되지만, 프로젝트가 `terser-webpack-plugin`을 직접 구성하거나 의존하고 있는 경우 구성을 업데이트해야 할 수 있습니다.
  * webpack이 JavaScript 파일의 모듈 타입을 결정할 때 더 이상 `import.meta`를 무시하지 않습니다. `import.meta`가 존재하면 webpack은 해당 파일을 ES 모듈로 처리하므로 CommonJS 구문도 함께 사용하는 파일이 손상될 수 있습니다. Kotlin/JS의 경우 [`useEsModules()` Gradle DSL을 사용하여 ES 모듈을 사용하도록 타깃을 구성](js-modules.md#choose-the-target-module-system)할 수 있습니다. Kotlin/Wasm은 대부분의 경우 추가 구성 없이 작동합니다. Kotlin/Wasm에서 `import.meta` 오류가 발생하는 경우 프로젝트 소스나 직접 또는 전이 의존성에서 `import.meta`를 사용하는지 확인하세요. 필요에 따라 사용자 코드를 업데이트해야 합니다. 의존성으로 인해 문제가 발생하는 경우 호환 가능한 버전이 있다면 해당 버전으로 업데이트하거나 라이브러리 유지 관리자에게 이슈를 제보하세요.
* Kotlin 2.4.20부터 Kotlin/Wasm은 생성된 JavaScript `wasmExports` API를 deprecated 처리합니다. 컴파일러는 경고와 함께 일시적으로 사용 가능한 상태로 유지되는 `wasmExports.memory`를 제외한 모든 export에 대한 접근을 금지합니다. 모듈의 `WebAssembly.Memory` 객체에 접근하려면 `kotlin.wasm.unsafe.wasmMemory` 프로퍼티를 사용하세요.

## 문서 업데이트 {id="documentation-updates"}

지난 릴리스 이후 Kotlin 생태계 문서에 새로운 페이지와 튜토리얼을 추가하고 기존 문서를 개편했습니다.

* [iOS 배포 파이프라인 구성](https://kotlinlang.org/docs/multiplatform/ios-ci-cd-teamcity.html) – TeamCity를 사용하여 Kotlin Multiplatform iOS 앱의 지속적 배포(CD)를 설정합니다.
* Compose Multiplatform 업데이트:
  * [팝업(Popups)](https://kotlinlang.org/docs/multiplatform/compose-popups.html) – Compose Multiplatform에서 팝업을 만들고 구성하는 방법을 알아봅니다.
  * [윈도우 및 다이얼로그 API v2](https://kotlinlang.org/docs/multiplatform/compose-desktop-top-level-windows-management.html#window-and-dialog-api-v2) – Compose Multiplatform에서 데스크톱 윈도우와 다이얼로그를 관리하기 위한 새로운 API를 살펴봅니다.
  * [트레이 및 알림(Tray and notifications)](https://kotlinlang.org/docs/multiplatform/compose-desktop-tray.html) – 데스크톱용 Compose Multiplatform에서 시스템 트레이에 애플리케이션 아이콘을 추가하고 시스템 알림을 보내는 방법을 알아봅니다.
  * [메뉴 모음(Menu bar)](https://kotlinlang.org/docs/multiplatform/compose-desktop-menu-bar.html) – 데스크톱용 Compose Multiplatform에서 특정 윈도우를 위한 메뉴 모음을 만드는 방법을 알아봅니다.
  * [드래그 앤 드롭](https://kotlinlang.org/docs/multiplatform/compose-drag-drop.html#platform-specific-data-handling) – Compose Multiplatform에서 드래그 앤 드롭을 구현할 때 플랫폼별 데이터를 처리하는 방법을 다룹니다.
  * [Liquid Glass를 위한 UIKit 대안](https://kotlinlang.org/docs/multiplatform/ios-liquid-glass.html#alternative-skip-swiftui-and-drive-uikit-from-kotlin) – SwiftUI 대신 UIKit 내비게이션을 사용하는 Liquid Glass의 대체 접근 방식을 살펴봅니다.
  * [AI 에이전트를 위한 MCP 서버](https://kotlinlang.org/docs/multiplatform/compose-hot-reload.html#mcp-server-for-ai-agents) – Compose Hot Reload의 MCP 서버를 사용하여 AI 에이전트를 개발 워크플로에 연결하는 방법을 알아봅니다.
* [Spring 캐싱](https://spring.io/guides/gs/caching) – 새로운 Kotlin 예제를 통해 Spring 애플리케이션에 캐싱을 추가하는 방법을 알아봅니다.
* [Exposed IntelliJ IDEA 플러그인](https://www.jetbrains.com/help/idea/exposed.html) – 코드 완성, 데이터베이스 인식 검사, 라이브 템플릿을 사용하여 IntelliJ IDEA에서 Exposed를 다루는 방법을 알아봅니다.
* [Kotlin serialization](serialization.md) – Kotlin 데이터를 직렬화하고, JSON 구조와 타입 표현을 커스텀하며, 고급 직렬화 시나리오를 다루는 방법을 알아봅니다.
* [Flow](coroutines-flow.md) 및 [Flow 연산자](coroutines-flow-operators.md) – 콜드(cold) 및 핫(hot) 플로우를 생성 및 수집하고, 예외를 처리하며, 다양한 플로우 연산자를 사용하는 방법을 알아봅니다.
* [코루틴 디버깅](coroutines-debugging.md) – 디버그 모드, 스택 트레이스 복구 및 디버그 에이전트를 사용하여 JVM에서 코루틴을 디버깅하는 방법을 알아봅니다.
* Lincheck – Lincheck에서 [모델 검사(model checking)](lincheck-model-checking.md)가 작동하는 방식, [연산 실행 옵션](lincheck-operation-execution-options.md)을 사용하는 방법, 테스트 결과를 [검증](lincheck-results-validation.md)하는 방법을 알아봅니다.
* [kapt 컴파일러 플러그인](kapt.md) – Gradle, Maven 및 명령줄 컴파일러에서 kapt 컴파일러 플러그인을 구성하는 방법을 알아봅니다.
* [Kotlin 프로젝트의 코드 품질 도구](jvm-code-analysis.md) – JVM 바이트코드와 Kotlin 코드를 분석하기 위한 도구를 살펴봅니다.
* [Maven과 함께 사용하는 Power-assert 플러그인](jvm-test-maven.md#get-detailed-failure-messages) – Power-assert 플러그인을 사용하여 더 자세한 테스트 실패 메시지를 얻는 방법을 알아봅니다.
* [KSP를 사용한 다중 라운드 처리](ksp-multi-round.md) – 생성된 파일, 지연된 심볼(deferred symbols), 유효성 검사 등 KSP가 여러 처리 라운드에 걸쳐 작동하는 방식을 살펴봅니다.
* 비지정 타입(Non-denotable types) – Kotlin의 [플랫폼 타입](java-interop.md#null-safety-and-platform-types), [캡처된 타입(captured types)](generics.md#captured-types), [교차 타입(intersection types)](typecasts.md#intersection-types)에 대해 알아봅니다.
* [타입 별칭(Type aliases)](type-aliases.md) – 타입 별칭의 스코프와 가시성에 대해 알아봅니다.
* [This 표현식](this-expressions.md) – 암시적 `this`가 어떻게 해결되는지, 그리고 리시버를 참조하기 위해 명시적으로 `this`를 사용하는 시점을 알아봅니다.
* [문자열(Strings)](strings.md) – 문자열 템플릿, 일반적인 문자열 연산, 문자열 빌드 및 타입 변환에 대해 알아봅니다.
* [패키지와 임포트(Packages and imports)](packages.md) – 패키지와 임포트를 사용하여 Kotlin 코드를 체계적으로 구성하는 방법을 알아봅니다.