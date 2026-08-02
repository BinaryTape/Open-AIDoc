[//]: # (title: Kotlin %kotlinEapVersion%의 새로운 기능)

<primary-label ref="eap"/>

<show-structure depth="1"/>

<web-summary>Kotlin EAP(Early Access Preview) 릴리스 노트를 읽고 최신 실험적 Kotlin 기능을 공식 출시 전에 미리 사용해 보세요.</web-summary>

_[출시일: %kotlinEapReleaseDate%](eap.md#build-details)_

> 이 문서는 EAP(Early Access Preview) 릴리스의 모든 기능을 다루지는 않지만, 주요 개선 사항을 중점적으로 설명합니다.
>
> 전체 변경 사항 목록은 [GitHub 변경 로그](https://github.com/JetBrains/kotlin/releases/tag/v%kotlinEapVersion%)에서 확인하세요.
>
{style="note"}

Kotlin %kotlinEapVersion% 버전이 출시되었습니다! 이번 EAP 릴리스의 주요 내용은 다음과 같습니다:

* **표준 라이브러리**: [코루틴 스택 추적 복구(Coroutine stack trace recovery) 지원 및 컬렉션 요소의 동등성 및 고유성 확인을 위한 새로운 기능](#standard-library)
* **Kotlin/Native**: [.klib 아티팩트의 증분 컴파일(Incremental compilation) 기본 활성화 및 새로운 Swift 익스포트(export) 기능](#kotlin-native)
* **Kotlin/Wasm**: [@JsFun 선언 내 최상위 require() 호출 변경, 컴패니언 객체(Companion object) 초기화 순서 개선 및 Kotlin Gradle 플러그인의 Wasmtime 지원](#kotlin-wasm)
* **Kotlin/JS**: [브라우저 테스트를 위한 새로운 DSL 및 서스펜드 람다(suspend lambdas)를 비동기 함수(async functions)로 익스포트 지원](#kotlin-js)
* **빌드 도구 API**: [새로운 타겟 지원: Kotlin/JS, Kotlin/Wasm 및 Kotlin 메타데이터](#build-tools-api)
* **Kotlin 컴파일러**: [네이티브 이미지(native image) 실험적 출시](#kotlin-compiler-native-image)

> Kotlin 릴리스 주기에 대한 정보는 [Kotlin 릴리스 프로세스](releases.md)를 참조하세요.
>
{style="tip"}

## Kotlin %kotlinEapVersion%으로 업데이트

최신 버전의 Kotlin은 최신 버전의 [IntelliJ IDEA](https://www.jetbrains.com/idea/download/) 및 [Android Studio](https://developer.android.com/studio)에 포함되어 있습니다.

새로운 Kotlin 버전으로 업데이트하려면 IDE가 최신 버전인지 확인하고, 빌드 스크립트에서 [Kotlin 버전을 %kotlinEapVersion%으로 변경](releases.md#update-to-a-new-kotlin-version)하세요.

## 새로운 기능 {id=new-experimental-features}
<primary-label ref="experimental-exp"/>

이번 릴리스에서는 다음과 같은 프리 스테이블(pre-stable) 기능을 사용할 수 있습니다. 여기에는 [Beta](components-stability.md#stability-levels-explained), [Alpha](components-stability.md#stability-levels-explained), [실험적(Experimental)](components-stability.md#stability-levels-explained) 상태의 기능이 포함됩니다:

* [표준 라이브러리: 코루틴 스택 추적 복구 지원](#support-for-coroutine-stack-trace-recovery)
* [표준 라이브러리: 컬렉션 요소의 동등성과 고유성을 확인하는 새로운 함수](#new-functions-to-check-collection-elements-for-equality-and-uniqueness)
* [Kotlin/Native: 별도의 Kotlin 컴파일러 이미지](#kotlin-compiler-native-image)
* [Kotlin/JS: 브라우저 테스트를 위한 새로운 DSL](#new-dsl-for-browser-testing)
* [빌드 도구 API: Kotlin/JS, Kotlin/Wasm 및 Kotlin 메타데이터 지원](#build-tools-api)

## 표준 라이브러리

Kotlin %kotlinEapVersion%은 코루틴 스택 추적 복구 지원을 추가하고, 컬렉션 요소의 동등성과 고유성을 확인하기 위한 새로운 함수를 도입합니다.

### 코루틴 스택 추적 복구 지원
<primary-label ref="experimental-opt-in"/>
<secondary-label ref="standard-library"/>

Kotlin %kotlinEapVersion%은 표준 라이브러리에 `StackTraceRecoverable` 인터페이스를 추가합니다. 이는 `kotlinx.coroutines` 라이브러리에 대한 의존성을 추가하지 않고도 스택 추적 복구(stack trace recovery)를 위해 새로운 예외 인스턴스를 생성하는 방법을 정의할 수 있게 함으로써 `kotlinx.coroutines` 라이브러리와의 통합을 개선합니다.

스택 추적 복구는 한 코루틴이 예외를 던지고 다른 코루틴이 이를 다시 던질(rethrow) 때 디버깅을 도와줍니다. 이를 통해 예외가 어디에서 시작되었는지, 그리고 다른 코루틴이 어디에서 이를 다시 던졌는지 확인할 수 있습니다.

`kotlinx.coroutines` 라이브러리는 추가적인 코루틴 스택 추적 정보를 포함하는 새로운 예외 인스턴스를 생성하여 스택 추적 복구를 수행합니다. 이는 예외 메시지, 원인(cause), 혹은 둘 다를 받거나 인자가 없는 생성자를 가진 예외에 대해 자동으로 이루어집니다.

만약 예외 생성자에 줄 번호나 에러 코드와 같은 추가적인 필수 인자가 있다면, `StackTraceRecoverable` 인터페이스를 구현하여 `kotlinx.coroutines` 라이브러리가 해당 예외의 새 인스턴스를 생성하는 방법을 정의하세요.

이를 위해 `copyForStackTraceRecovery()` 함수를 오버라이드하세요. 이 함수는 스택 추적 복구를 위한 새로운 예외 인스턴스를 반환하거나, `kotlinx.coroutines` 라이브러리가 예외를 복사하지 않기를 원한다면 `null`을 반환합니다.

> `StackTraceRecoverable` 인터페이스는 모든 타겟에서 사용할 수 있지만, `kotlinx.coroutines` 라이브러리는 현재 JVM에서만 이를 스택 추적 복구에 사용합니다.
>
{style="note"}

이 API들은 [실험적(Experimental)](components-stability.md#stability-levels-explained) 단계이며 `@OptIn(ExperimentalStdlibCoroutineSupportApi::class)` 어노테이션을 통한 옵트인이 필요합니다.

다음은 스택 추적 복구를 위해 새 인스턴스를 생성할 때 `line` 프로퍼티를 유지하는 커스텀 예외의 예시입니다:

```kotlin
import kotlin.coroutines.ExperimentalStdlibCoroutineSupportApi
import kotlin.coroutines.StackTraceRecoverable

@OptIn(ExperimentalStdlibCoroutineSupportApi::class)
class FileEditException
// 원인(cause)을 IllegalStateException 생성자에 전달하기 위해 
// 프라이빗 생성자가 필요합니다.
private constructor(
    val line: Int,
    private val detail: String,
    cause: Throwable?,
) : IllegalStateException("When editing line $line: $detail", cause),
    // 스택 추적 복구를 위해 StackTraceRecoverable을 구현합니다.
    StackTraceRecoverable<FileEditException> {

    constructor(line: Int, detail: String) : this(line, detail, null)

    // 줄 번호와 메시지 상세 내용을 복사합니다.
    override fun copyForStackTraceRecovery(): FileEditException =
        FileEditException(line, detail, this)
    }

@OptIn(ExperimentalStdlibCoroutineSupportApi::class) 
fun main() {
    val original = FileEditException(15, "Unexpected token")
    val copy = original.copyForStackTraceRecovery()

    println(copy.message)
    // When editing line 15: Unexpected token

    println(copy.cause == original)
    // true
}
```

자세한 내용은 해당 기능의 [KEEP](https://github.com/Kotlin/KEEP/blob/main/proposals/stdlib/KEEP-0461-stacktrace-recoverable.md)을 참조하세요. 의견이 있으시면 [YouTrack](https://youtrack.jetbrains.com/issue/KT-86595)을 통해 공유해 주세요.

### 컬렉션 요소의 동등성과 고유성을 확인하는 새로운 함수
<primary-label ref="experimental-opt-in"/>
<secondary-label ref="standard-library"/>

Kotlin %kotlinEapVersion% 이전에는 컬렉션 요소가 모두 고유한지 또는 모두 동일한지 확인하려면 비효율적인 코드 패턴을 사용해야 했습니다.

Kotlin %kotlinEapVersion%은 이러한 공백을 메우기 위해 실험적인 함수들을 도입합니다:

| 함수 | 확인 내용 |
|--------------------|------------------------------------------------------------|
| `.allDistinct()` | 컬렉션의 모든 값이 고유한지 확인합니다. |
| `.allDistinctBy()` | 모든 객체가 선택한 프로퍼티에 대해 고유한 값을 갖는지 확인합니다. |
| `.allEqual()` | 컬렉션의 모든 값이 동일한지 확인합니다. |
| `.allEqualBy()` | 모든 객체가 선택한 프로퍼티에 대해 동일한 값을 갖는지 확인합니다. |

이 함수들은 컬렉션, 시퀀스 및 배열에서 사용할 수 있습니다. 다른 컬렉션 연산과 마찬가지로 구조적 동등성(structural equality)을 사용하여 요소를 비교합니다.

이 함수들은 [실험적(Experimental)](components-stability.md#stability-levels-explained) 단계이며 `@OptIn(ExperimentalStdlibApi::class)` 어노테이션 또는 `-opt-in=kotlin.ExperimentalStdlibApi` 컴파일러 옵션을 통한 옵트인이 필요합니다:

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

    // 모든 참가자가 동일한 답변을 했는지 확인합니다
    println(responses.allEqualBy { it.answer })
    // false

    // 중복된 참가자가 있는지 확인합니다
    println(responses.allDistinctBy { it.participantId })
    // true

    // 모든 응답이 같은 날짜에 제출되었는지 확인합니다
    println(responses.allEqualBy { it.responseDate })
    // true

    val answers = responses.map { it.answer }

    // 답변들이 모두 일치하는지 확인합니다
    println(answers.allEqual())
    // false

    // 답변들이 모두 고유한지 확인합니다
    println(answers.allDistinct())
    // true
}
```

이 함수들을 사용해 본 경험에 대한 의견을 [YouTrack](https://youtrack.jetbrains.com/issue/KT-30270)을 통해 공유해 주시면 감사하겠습니다.

## Kotlin/Native

Kotlin %kotlinEapVersion%은 `.klib` 아티팩트의 증분 컴파일을 기본적으로 활성화하고, 봉인된 클래스(sealed classes) 및 언어 간 상속 지원을 포함한 새로운 Swift 익스포트 기능을 제공하며, Kotlin 컴파일러 네이티브 이미지의 첫 번째 버전을 도입합니다.

### 증분 컴파일 기본 활성화
<secondary-label ref="native"/>

%kotlinEapVersion%부터 `.klib` 아티팩트의 증분 컴파일(Incremental compilation)이 기본적으로 활성화됩니다.

증분 컴파일을 사용하면 프로젝트 모듈에서 생성된 `.klib` 아티팩트의 일부만 변경된 경우, `.klib`의 영향을 받는 부분만 바이너리로 다시 컴파일됩니다.

이 최적화는 [Kotlin 1.9.20](whatsnew1920.md#incremental-compilation-of-klib-artifacts)에서 처음 도입되었으며, 디버그 빌드의 컴파일 시간을 대폭 단축하는 것으로 입증되었습니다.

경우에 따라 이 최적화로 인해 클린 빌드(clean builds) 시 성능 비용이 발생할 수 있음에 유의하세요.

이 기능과 관련하여 예상치 못한 문제가 발생하는 경우 수동으로 비활성화할 수 있습니다. 비활성화하려면 `gradle.properties` 파일에 다음 옵션을 설정하세요:

```none
kotlin.incremental.native=false
```

문제 발생 시 [YouTrack](https://kotl.in/issue)에 보고해 주세요. 컴파일 시간 개선에 대한 더 많은 팁은 [문서](native-improving-compilation-time.md)를 참조하세요.

### 새로운 Swift 익스포트 기능
<secondary-label ref="native"/>

#### 봉인된 클래스(Sealed classes)

Kotlin %kotlinEapVersion%은 Swift 익스포트에 봉인된 클래스(sealed classes) 및 인터페이스 지원을 추가합니다.

이전에는 봉인된 타입을 사용하는 모든 `switch` 문에 `default` 케이스를 작성해야 했습니다. 이제 Kotlin에서 정의된 봉인된 계층 구조가 Swift 열거형(enums)으로 매핑되어, Xcode에서 전체 자동 완성이 지원되는 완전한(exhaustive) `switch` 문을 사용할 수 있습니다.

Swift 익스포트는 각 봉인된 타입에 대해 `.sealedType()` 메서드를 생성합니다. 이 메서드는 봉인된 계층 구조의 직접적인 하위 클래스와 일치하는 케이스를 가진 Swift 열거형을 반환합니다. 이 호출을 중첩하여 계층 구조의 더 깊은 레벨까지 매칭할 수 있습니다.

예를 들어, Kotlin에서 클래스 계층 구조를 가진 봉인된 인터페이스를 선언합니다:

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

Swift 측에서는 `default` 케이스 없이 완전한 `switch`를 사용할 수 있습니다:

```swift
// Swift
let shape = createCircle()

let name = switch shape.sealedType() {
   case let .circle(type): "It's a \(type.value)"
   case let .rectangle(type): "It's a \(type.value)"
}
// name == "It's a Circle"
```

`switch`가 완전하기 때문에, 봉인된 계층 구조에 새로운 하위 클래스가 추가되면 컴파일러가 경고를 보내므로 `default` 케이스에 의존하는 대신 즉시 처리할 수 있습니다.

#### Swift 익스포트의 언어 간 상속

Kotlin %kotlinEapVersion%은 Swift 익스포트에 언어 간 상속(cross-language inheritance) 지원을 도입합니다.

이 기능의 일반적인 사용 사례는 [역임포트(reverse import)](native-lib-import-stability.md#swift-library-import) 패턴으로, Kotlin에서 계약(contract)을 정의하고 Swift 측에서 플랫폼별 구현을 제공하는 방식입니다.

예를 들어, Kotlin 인터페이스를 선언하고 Swift에서 이를 구현한 다음, 해당 인터페이스를 받는 Kotlin 함수에 Swift 객체를 전달할 수 있습니다. 이는 Kotlin으로 직접 임포트할 수 없는 순수 Swift 라이브러리를 사용해야 할 때 특히 유용합니다.

예를 들어, Kotlin 인터페이스와 이를 인자로 받는 함수를 선언합니다:

```kotlin
// Kotlin
interface CryptoProvider {
   fun hashMD5(input: String): String
}

fun processHash(provider: CryptoProvider, input: String): String = provider.hashMD5(input)
```

Swift 측에서 순수 Swift 라이브러리를 사용하여 이 인터페이스를 구현하고 다시 Kotlin으로 전달합니다:

```swift
// Swift
import CryptoKit

class IosCryptoProvider: KotlinBase & CryptoProvider {
   func hashMD5(input: String) -> String {
       guard let data = input.data(using: .utf8) else { return "failed" }
       return Insecure.MD5.hash(data: data).description
   }
}

let provider = IosCryptoProvider()

// 호출이 Swift 구현으로 전달됩니다
print(processHash(provider: provider, input: "Hello, world!"))
```

Kotlin이 Swift 객체를 받으면 이를 일반 인터페이스의 구현처럼 취급하여 Swift 코드를 실행합니다.

Swift 익스포트에 대한 자세한 내용은 [문서](native-swift-export.md)를 참조하세요.

### SwiftPM 의존성을 위해 생성된 `Package.swift`
<secondary-label ref="native"/>

SwiftPM 패키지에 의존하는 XCFramework를 익스포트할 때, 의존성이 올바르게 해결되려면 결과물인 SwiftPM 패키지를 게시해야 합니다. 이를 돕기 위해 `assembleSharedXCFramework` Gradle 태스크는 이제 XCFramework와 함께 배포할 `Package.swift` 파일을 생성합니다.

자세한 내용은 [SwiftPM 익스포트 페이지](https://kotlinlang.org/docs/multiplatform/multiplatform-spm-export.html)를 참조하세요.

## Kotlin/Wasm

Kotlin %kotlinEapVersion%은 Kotlin/Wasm의 `@JsFun` 선언 내 최상위 `require()` 호출 처리 방식을 변경하고, 컴패니언 객체 초기화 순서를 JVM 동작과 정렬하며, Kotlin Gradle 플러그인에서 `wasmWasi` 타겟의 런타임으로 Wasmtime 지원을 추가합니다.

### @JsFun 선언 내 최상위 `require()` 호출 변경
<secondary-label ref="wasm"/>

Kotlin/Wasm은 이제 `@JsFun` 선언에서 최상위 `require()` 함수를 사용할 때 에러를 보고합니다.

이전에는 컴파일러가 `import-object.mjs` 파일에 `require` 변수를 생성하여 `@JsFun` 선언이 `require()`를 호출할 수 있도록 했습니다.

이 동작은 의도치 않게 컴파일러의 구현 세부 사항을 노출했습니다. 이 방식에서 벗어날 수 있도록 Kotlin/Wasm은 생성된 `require` 선언을 제거하며, 이제 컴파일러는 이러한 호출에 대해 에러를 보고합니다. 예를 들어:

```kotlin
// 에러를 보고합니다
@JsFun("(mod) => require(mod)")
external fun loadModule(mod: String): JsAny
```

이 변경에 대비하려면 `@JsFun` 선언의 최상위 `require()` 호출을 `@JsModule` 어노테이션으로 교체하세요:

```kotlin
@JsModule("module")
external val module: Module

external interface Module {
    // 예상되는 모듈 멤버를 정의합니다
}
```

동적 모듈 로딩의 경우 `import()` 표현식을 대신 사용하세요. webpack이 동적 임포트를 파싱하지 못하도록 `/* webpackIgnore: true */` 매직 주석을 추가하세요:

```kotlin
@JsFun("""
    ((module) => () => module)(
        await import(/* webpackIgnore: true */ "module")
    )
""")
private external fun loadModuleDynamically(): JsAny?
```

또한 조건부로 `import()` 표현식을 사용할 수도 있습니다. 예를 들어, Node.js에서 실행될 때만 모듈을 로드하도록 할 수 있습니다:

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

프로젝트가 최상위 `require()` 함수를 필요로 하는 의존성에 의존하고 있다면, 임시 방편으로 `globalThis`의 프로퍼티로 추가할 수 있습니다:

```kotlin
@JsFun("""
    ((module) => {
        globalThis.require = module.default.createRequire(import.meta.url)
        return () => {}
    })(await import("node:module"))
""")
external fun defineRequire()
```

문제가 발생하면 [이슈 트래커](https://youtrack.jetbrains.com/projects/KT/issues/KT-86192)를 통해 의견을 공유해 주세요.

### 컴패니언 객체 초기화 순서 개선
<secondary-label ref="wasm"/>

Kotlin/Wasm은 이제 JVM 동작과 일치하도록 하위 클래스 컴패니언 객체보다 상위 클래스 컴패니언 객체를 먼저 초기화합니다. 이전에는 초기화 순서가 반대로 될 수 있어 플랫폼 간에 일관되지 않은 동작이 발생할 수 있었습니다.

이 업데이트는 플랫폼 간 일관성을 향상시키고 클래스 초기화 동작의 플랫폼별 차이를 줄여줍니다. 또한 중간 클래스가 컴패니언 객체를 선언하지 않은 경우를 포함하여, 더 깊은 상속 계층 구조에서도 컴패니언 객체 초기화를 올바르게 처리할 수 있게 합니다.

### Kotlin Gradle 플러그인의 Wasmtime 지원
<secondary-label ref="wasm"/>

Kotlin %kotlinEapVersion%은 Kotlin Gradle 플러그인에서 `wasmWasi` 타겟의 런타임으로 [Wasmtime](https://docs.wasmtime.dev/) 지원을 도입합니다.

이전에는 `wasmWasi` 타겟이 Node.js 런타임만 지원했기 때문에 WASI 애플리케이션을 실행하려면 JavaScript 부트스트랩이 필요했습니다. Wasmtime 지원을 통해 이제 독립형 WebAssembly 런타임에서 Kotlin/Wasm 애플리케이션을 실행할 수 있습니다.

Wasmtime을 `wasmWasi` 타겟의 런타임으로 사용하려면 Gradle 빌드 파일에 `wasmtime()`을 추가하세요:

```kotlin
kotlin {
    wasmWasi {
        wasmtime()
    }
}
```

의견이 있으시면 [YouTrack](https://youtrack.jetbrains.com/issue/KT-86633)을 통해 공유해 주세요.

## Kotlin/JS

Kotlin %kotlinEapVersion%은 브라우저 테스트를 위한 새로운 실험적 DSL을 도입하고 서스펜드 람다(suspend lambdas)를 JavaScript 비동기 함수(async functions)로 익스포트하는 지원을 추가합니다.

### 브라우저 테스트를 위한 새로운 DSL
<primary-label ref="experimental-opt-in"/>
<secondary-label ref="js"/>

Kotlin %kotlinEapVersion%은 브라우저 환경에서 Kotlin/JS 테스트를 실행하기 위한 새로운 실험적 DSL을 도입합니다.

현재 Kotlin Gradle 플러그인은 [Karma](https://github.com/karma-runner/karma)를 브라우저 런처로 사용하여 다양한 브라우저에서 JavaScript 테스트를 실행합니다. Karma 프로젝트는 이미 2년 동안 지원 중단(deprecated) 상태였으며, 이로 인해 브라우저 테스트를 지원하는 대안적인 방법을 모색하게 되었습니다.

새로운 DSL은 내부적으로 다양한 도구를 관리하는 Karma를 대체하기 위해 고안되었으며 다음을 포함합니다:

* 테스트 러너로서의 [Mocha](https://mochajs.org/).
* 번들러로서의 [Webpack](https://webpack.js.org/) (향후 릴리스에서 [Vite](https://vite.dev/)로 [교체될 예정](https://youtrack.jetbrains.com/issue/KT-48308/)입니다).
* Chromium, Firefox 및 WebKit(Safari) 브라우저 엔진을 지원하는 브라우저 드라이버 및 배포 관리자로서의 [Playwright](https://playwright.dev/).

새로운 테스트 DSL을 사용해 보려면 Kotlin/JS 타겟의 `browser{}` 블록 안에 옵트인이 필요한 `test{}` 블록을 추가하세요:

```kotlin
kotlin {
    js {
        browser {
            @OptIn(ExperimentalJsTestDsl::class)
            // 새로운 test{} 블록 추가 및 구성
            test {
                // 모든 브라우저에 공통적인 옵션 설정
                browserDefaults {
                    timeout = Duration.ofSeconds(2)
                    headless = true
                }
                // Chromium 테스트 러너 활성화
                chromium {
                    // 공통 타임아웃 옵션 오버라이드
                    timeout = Duration.ofSeconds(5)
                    launchArgs.add("--no-sandbox")
                }
                // Firefox 테스트 러너 활성화
                firefox()
                // WebKit 테스트 러너 활성화
                webkit { }
                // 추가적인 WebKit 테스트 러너 활성화 및 구성
                webkit("noheadless") {
                    // 커스텀 옵션 설정
                    headless = false
                }
            }
        }
    }
}
```

새로운 DSL은 활발히 개발 중입니다. 의견이 있으시면 [YouTrack](https://youtrack.jetbrains.com/issue/KT-66897)을 통해 공유해 주세요.

### 서스펜드 람다를 비동기 함수로 익스포트 지원
<secondary-label ref="js"/>

Kotlin %kotlinEapVersion%부터 서스펜드 람다(suspend lambdas)를 JavaScript 비동기 함수(async functions)로 익스포트할 수 있습니다.

이전에는 Kotlin/JS 라이브러리에서 서스펜드 람다를 포함하는 선언을 익스포트할 방법이 없었습니다. 이제 Kotlin 컴파일러가 Kotlin의 서스펜드 함수와 네이티브 JavaScript의 [async/await](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/async_function) 모델 사이의 브릿징(bridging)을 자동으로 처리하며, 이는 Kotlin/TypeScript 혼합 코드베이스에서 유용합니다.

이 기능을 활성화하려면 `build.gradle.kts` 파일에 다음 컴파일러 옵션을 추가하세요:

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

그런 다음, 관련 선언에 `@JsExport`를 표시합니다:

```kotlin
// Kotlin
@JsExport
class TaskRunner {
    suspend fun runTask(task: suspend () -> String): String {
        return task()
    }
}
```

TypeScript 측에서 서스펜드 람다는 일반적인 비동기 함수로 나타납니다:

```typescript
// TypeScript
import { TaskRunner } from "..."

const runner = new TaskRunner();
const result = await runner.runTask(async () => "done");
console.log(result); // "done"
```

`@JsExport` 어노테이션에 대한 자세한 내용은 [문서](js-to-kotlin-interop.md#jsexport-annotation)를 참조하세요.

## 빌드 도구 API

### Kotlin/JS, Kotlin/Wasm 및 Kotlin 메타데이터 지원
<primary-label ref="experimental-general"/>
<secondary-label ref="bta"/>

[Kotlin 2.2.0](whatsnew22.md#new-experimental-build-tools-api)에서 빌드 도구 API(Build Tools API, BTA)가 Kotlin/JVM에서 사용 가능해졌습니다. Kotlin %kotlinEapVersion%은 Kotlin/JS, Kotlin/Wasm 및 Kotlin 메타데이터라는 새로운 타겟에 대한 지원을 추가함으로써 BTA 안정화를 향한 다음 단계를 밟습니다.

이를 통해 Kotlin Gradle 플러그인이 컴파일러와 더욱 일관되게 상호작용할 수 있게 됩니다. 일부 경우 더 빠르고 안정적인 컴파일의 혜택을 누릴 수도 있습니다.

BTA는 빌드 시스템과 Kotlin 컴파일러 에코시스템 사이의 추상화 계층 역할을 하는 범용 API입니다. 이는 사용 가능한 빌드 도구에서 Kotlin 기능 지원 및 Kotlin 컴파일러와의 호환성을 유지하는 데 도움을 줍니다.

저희는 Kotlin Gradle 플러그인에서 새로운 타겟에 대한 BTA 지원을 점진적으로 배포할 계획입니다:

* Kotlin 2.4.20-Beta1에서는 피드백을 수집하기 위해 Kotlin/JS, Kotlin/Wasm 및 Kotlin 메타데이터에서 BTA가 기본적으로 활성화됩니다. 프로젝트에서 추가적인 변경은 필요하지 않습니다.
* Kotlin 2.4.20-Beta2와 최종 Kotlin 2.4.20 릴리스 사이에는 새로운 타겟의 BTA를 옵트인 방식으로 사용할 수 있습니다. 사용해 보려면 `gradle.properties` 파일에 해당하는 프로퍼티를 추가하세요:

  ```kotlin
  kotlin.wasm.runViaBuildToolsApi = true
  kotlin.js.runViaBuildToolsApi = true
  kotlin.metadata.runViaBuildToolsApi = true
  ```

* Kotlin 2.5.0부터는 Kotlin/JS, Kotlin/Wasm 및 Kotlin 메타데이터에서 BTA가 다시 기본적으로 활성화될 예정입니다.

BTA 제안에 대해 궁금하거나 의견을 공유하고 싶다면 이 [KEEP](https://github.com/Kotlin/KEEP/blob/build-tools-api/proposals/extensions/build-tools-api.md)을 참조하세요.

### Kotlin 컴파일러: 네이티브 이미지
<primary-label ref="experimental-general"/>
<secondary-label ref="compiler"/>

Kotlin %kotlinEapVersion%은 Kotlin 컴파일러 네이티브 이미지(native image)의 첫 번째 [실험적(Experimental)](components-stability.md#stability-levels-explained) 버전을 선보입니다. 네이티브 이미지는 표준 `kotlinc` 명령줄 도구에 대한 드롭인 대체(drop-in replacement)를 제공하며, 더 빠른 시작 시간과 더 높은 성능을 제공합니다.

네이티브 이미지를 사용해 보려면 [GitHub Releases](https://github.com/JetBrains/kotlin/releases/tag/v%kotlinEapVersion%)에서 빌드를 다운로드하세요.

네이티브 이미지에는 `-Xplugin` 또는 `-Xcompiler-plugin` CLI 옵션과 함께 사용할 수 있는 다음 컴파일러 플러그인도 번들로 포함되어 있습니다:

* [Serialization](serialization.md)
* [Compose 컴파일러](compose-compiler-options.md)
* [All-open](all-open-plugin.md)
* [`no-arg`](no-arg-plugin.md)
* [SAM with receiver](sam-with-receiver-plugin.md)
* [Assignment](https://plugins.gradle.org/plugin/org.jetbrains.kotlin.plugin.assignment)
* [Lombok](lombok.md)
* [Power-assert](power-assert.md)

Kotlin 컴파일러 네이티브 이미지에 대한 자세한 내용은 [README](https://github.com/JetBrains/kotlin/blob/master/prepare/compiler-native-image/README.md)를 참조하세요.