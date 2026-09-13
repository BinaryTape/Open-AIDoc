[//]: # (title: Kotlin 2.3.x 호환성 가이드)

_[언어의 현대성 유지](kotlin-evolution-principles.md)_ 및 _[편안한 업데이트](kotlin-evolution-principles.md)_는 Kotlin 언어 설계의 핵심 원칙 중 일부입니다. 전자는 언어의 발전을 방해하는 구조를 제거해야 함을 의미하며, 후자는 이러한 제거 과정을 사전에 충분히 전달하여 코드 마이그레이션이 가능한 한 원활하게 이루어지도록 해야 함을 의미합니다.

대부분의 언어 변경 사항은 이미 업데이트 변경 로그나 컴파일러 경고와 같은 다른 채널을 통해 공지되었지만, 이 문서는 이를 모두 요약하여 Kotlin 2.2에서 Kotlin 2.3으로의 마이그레이션을 위한 완전한 참조를 제공합니다. 또한 이 문서에는 도구 관련 변경 사항에 대한 정보도 포함되어 있습니다.

## 기본 용어 {id="basic-terms"}

이 문서에서는 다음과 같은 몇 가지 호환성 유형을 소개합니다:

- _소스(source)_: 소스 호환성 위반 변경은 이전에 문제없이(오류나 경고 없이) 컴파일되던 코드가 더 이상 컴파일되지 않게 되는 것을 의미합니다.
- _바이너리(binary)_: 두 바이너리 아티팩트를 서로 교체했을 때 로딩이나 링크 오류가 발생하지 않는 경우를 바이너리 호환이 된다고 합니다.
- _동작(behavioral)_: 변경을 적용하기 전과 후에 동일한 프로그램이 서로 다른 동작을 보이는 경우를 동작 호환성 위반이라고 합니다.

이러한 정의는 순수 Kotlin에 대해서만 정의된 것임을 유념하십시오. 다른 언어 관점(예: Java)에서의 Kotlin 코드 호환성은 이 문서의 범위를 벗어납니다.

## 언어(Language) {id="language"}

### `-language-version` 1.8 및 1.9 지원 중단 {id="drop-support-in-language-version-for-1-8-and-1-9"}

> **이슈**: [KT-76343](https://youtrack.jetbrains.com/issue/KT-76343), [KT-76344](https://youtrack.jetbrains.com/issue/KT-76344).
>
> **컴포넌트**: 컴파일러
>
> **호환성 위반 유형**: 소스
>
> **요약**: Kotlin 2.3부터 컴파일러는 더 이상 [`-language-version=1.8`](compiler-reference.md#language-version-version)을 지원하지 않습니다. JVM 이외의 플랫폼에 대한 `-language-version=1.9` 지원도 제거됩니다.
>
> **지원 중단 주기**:
>
> - 2.2.0: `-language-version`에 1.8 및 1.9 버전을 사용할 때 경고 보고
> - 2.3.0: 모든 플랫폼에서 1.8 버전에 대해, JVM 이외의 플랫폼에서 1.9 버전에 대해 `-language-version` 사용 시 경고를 오류로 격상

### 타입 별칭(typealias)이 있는 추론된 타입에 대해 상한 제약 위반 오류 보고 {id="report-upper-bound-constraint-violation-errors-for-inferred-types-with-typealiases"}

> **이슈**: [KTLC-287](https://youtrack.jetbrains.com/issue/KTLC-287)
>
> **컴포넌트**: 핵심 언어
>
> **호환성 위반 유형**: 소스
>
> **요약**: 이전에는 컴파일러가 추론된 타입에 대한 상한 제약 위반(upper-bound violation constraints) 오류를 보고하지 않았습니다. Kotlin 2.3.0에서 이 문제가 수정되어 모든 타입 파라미터에 대해 일관되게 오류가 보고됩니다.
>
> **지원 중단 주기**:
>
> - 2.2.20: 암시적 타입 인자의 제약 위반에 대해 지원 중단 경고 보고
> - 2.3.0: 암시적 타입 인자에 대한 `UPPER_BOUND_VIOLATED` 경고를 오류로 격상

### `inline` 및 `crossinline` 람다에 `@JvmSerializableLambda` 어노테이션 사용 금지 {id="prohibit-jvmserializablelambda-annotation-on-inline-and-crossinline-lambdas"}

> **이슈**: [KTLC-9](https://youtrack.jetbrains.com/issue/KTLC-9)
>
> **컴포넌트**: 핵심 언어
>
> **호환성 위반 유형**: 소스
>
> **요약**: 더 이상 `inline` 또는 `crossinline` 람다에 `@JvmSerializableLambda` 어노테이션을 적용할 수 없습니다. 이러한 람다는 직렬화할 수 없으므로 `@JvmSerializableLambda`를 적용해도 아무런 효과가 없었습니다.
>
> **지원 중단 주기**:
>
> - 2.1.20: `inline` 및 `crossinline` 람다에 `@JvmSerializableLambda`가 적용된 경우 경고 보고
> - 2.3.0: 경고를 오류로 격상. 이 변경 사항은 점진적(progressive) 모드에서 활성화할 수 있습니다.

### 제네릭 시그니처가 일치하지 않는 경우 Kotlin 인터페이스를 Java 클래스에 위임하는 것을 금지 {id="prohibit-delegating-a-kotlin-interface-to-a-java-class-when-the-generic-signatures-don-t-match"}

> **이슈**: [KTLC-267](https://youtrack.jetbrains.com/issue/KTLC-267)
>
> **컴포넌트**: 핵심 언어
>
> **호환성 위반 유형**: 소스
>
> **요약**: Kotlin 2.3.0은 제네릭 인터페이스 메서드를 비제네릭 오버라이드로 구현하는 Java 클래스에 위임하는 것을 금지합니다. 이전에는 이러한 동작을 허용하여 런타임에 타입 불일치 및 `ClassCastException`이 발생했습니다. 이 변경으로 인해 오류 보고 시점이 런타임에서 컴파일 타임으로 이동합니다.
>
> **지원 중단 주기**:
>
> - 2.1.20: 경고 보고
> - 2.3.0: 경고를 오류로 격상

### 명시적 반환 타입이 없는 식 본문 함수에서 `return` 사용 지원 중단 {id="deprecate-use-of-return-in-expression-bodied-functions-without-explicit-return-type"}

> **이슈**: [KTLC-288](https://youtrack.jetbrains.com/issue/KTLC-288)
>
> **컴포넌트**: 핵심 언어
>
> **호환성 위반 유형**: 소스
>
> **요약**: Kotlin은 이제 함수의 반환 타입이 명시적으로 선언되지 않은 경우 식 본문(expression bodies) 내부에서 `return`을 사용하는 것을 지원 중단합니다.
>
> **지원 중단 주기**:
>
> - 2.3.0: 경고 보고
> - 2.4.0: 경고를 오류로 격상

### 타입 별칭을 통해 도입된 널 허용(nullable) 상위 타입으로부터의 상속 금지 {id="prohibit-inheritance-from-nullable-supertypes-introduced-via-typealias"}

> **이슈**: [KTLC-279](https://youtrack.jetbrains.com/issue/KTLC-279)
>
> **컴포넌트**: 핵심 언어
>
> **호환성 위반 유형**: 소스
>
> **요약**: Kotlin은 이제 널 허용 타입 별칭으로부터 상속을 시도할 때 오류를 보고하며, 이는 이미 직접적인 널 허용 상위 타입을 처리하는 방식과 일치합니다.
>
> **지원 중단 주기**:
>
> - 2.2.0: 경고 보고
> - 2.3.0: 경고를 오류로 격상

### 최상위 람다 및 호출 인자에 대한 제네릭 시그니처 생성 통합 {id="unify-generic-signature-generation-for-top-level-lambdas-and-call-arguments"}

> **이슈**: [KTLC-277](https://youtrack.jetbrains.com/issue/KTLC-277)
>
> **컴포넌트**: 리플렉션(Reflection)
>
> **호환성 위반 유형**: 동작
>
> **요약**: Kotlin 2.3.0은 최상위 람다에 대해 호출 인자로 전달되는 람다와 동일한 타입 검사 로직을 사용하여, 두 경우 모두에서 일관된 제네릭 시그니처 생성을 보장합니다.
>
> **지원 중단 주기**:
>
> - 2.3.0: 새로운 동작 도입. 점진적 모드에서는 적용되지 않음.

### 실체화된(reified) 타입 파라미터가 교차 타입(intersection types)으로 추론되는 것을 금지 {id="prohibit-reified-type-parameters-from-being-inferred-as-intersection-types"}

> **이슈**: [KTLC-13](https://youtrack.jetbrains.com/issue/KTLC-13)
>
> **컴포넌트**: 핵심 언어
>
> **호환성 위반 유형**: 소스
>
> **요약**: Kotlin 2.3.0은 실체화된 타입 파라미터가 교차 타입으로 추론되는 상황을 금지합니다. 이는 잘못된 런타임 동작으로 이어질 수 있기 때문입니다.
>
> **지원 중단 주기**:
>
> - 2.1.0: 실체화된 타입 파라미터가 교차 타입으로 추론될 때 경고 보고
> - 2.3.0: 경고를 오류로 격상

### 타입 파라미터 제약을 통한 낮은 가시성 타입 노출 금지 {id="prohibit-exposing-less-visible-types-through-type-parameter-bounds"}

> **이슈**: [KTLC-275](https://youtrack.jetbrains.com/issue/KTLC-275)
>
> **컴포넌트**: 핵심 언어
>
> **호환성 위반 유형**: 소스
>
> **요약**: Kotlin 2.3.0은 함수나 선언 자체보다 더 제한적인 가시성을 가진 타입을 노출하는 타입 파라미터 제약(bounds) 사용을 금지하며, 함수의 규칙을 이미 클래스에 적용된 규칙과 일치시킵니다.
>
> **지원 중단 주기**:
>
> - 2.1.0: 문제가 되는 타입 파라미터 제약에 대해 경고 보고
> - 2.3.0: 경고를 오류로 격상

## 표준 라이브러리(Standard library) {id="standard-library"}

### Char-to-number 변환 지원 중단 및 명시적인 digit 및 code API 도입 {id="deprecate-char-to-number-conversions-and-introduce-explicit-digit-and-code-apis"}

> **이슈**: [KTLC-321](https://youtrack.jetbrains.com/issue/KTLC-321)
>
> **컴포넌트**: kotlin-stdlib
>
> **호환성 위반 유형**: 소스
>
> **요약**: Kotlin 2.3.0은 숫자 타입에 대한 `Char.toX()` 및 `X.toChar()` 변환을 지원 중단하고, 문자의 코드(code) 및 숫자(digit) 값에 액세스하기 위한 새로운 명시적 API를 도입합니다.
>
> **지원 중단 주기**:
>
> - 1.4.30: 새로운 함수를 실험적(Experimental)으로 도입
> - 1.5.0: 새로운 함수를 안정(Stable) 상태로 승격. 기존 함수에 대해 대체 제안과 함께 경고 보고
> - 2.3.0: 경고를 오류로 격상

### `Number.toChar()` 함수 지원 중단 {id="deprecate-number-tochar-function"}

> **이슈**: [KT-56822](https://youtrack.jetbrains.com/issue/KT-56822)
>
> **컴포넌트**: kotlin-stdlib
>
> **호환성 위반 유형**: 소스
>
> **요약**: `Number.toChar()` 함수가 지원 중단되었습니다. 대신 `toInt().toChar()` 또는 `Char` 생성자를 사용하십시오.
>
> **지원 중단 주기**:
>
> - 1.9.0: `Number.toChar()` 함수 사용 시 경고 보고
> - 2.3.0: 경고를 오류로 격상

### `String.subSequence(start, end)` 함수 지원 중단 {id="deprecate-string-subsequence-start-end-function"}

> **이슈**: [KTLC-282](https://youtrack.jetbrains.com/issue/KTLC-282)
>
> **컴포넌트**: kotlin-stdlib
>
> **호환성 위반 유형**: 소스
>
> **요약**: `String.subSequence(start, end)` 함수가 지원 중단되었습니다. 대신 [`String.subSequence(startIndex, endIndex)`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin/-string/sub-sequence.html) 함수를 사용하십시오.
>
> **지원 중단 주기**:
>
> - 1.0: `String.subSequence(start, end)` 사용 시 경고 보고
> - 2.3.0: 경고를 오류로 격상

### `kotlin.io.createTempDirectory()` 및 `kotlin.io.createTempFile()` 함수 지원 중단 {id="deprecate-kotlin-io-createtempdirectory-and-kotlin-io-createtempfile-functions"}

> **이슈**: [KTLC-281](https://youtrack.jetbrains.com/issue/KTLC-281)
>
> **컴포넌트**: kotlin-stdlib
>
> **호환성 위반 유형**: 소스
>
> **요약**: `kotlin.io.createTempDirectory()` 및 `kotlin.io.createTempFile()` 함수가 지원 중단되었습니다. 대신 [`kotlin.io.path.createTempDirectory()`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.io.path/create-temp-directory.html) 및 [`kotlin.io.path.createTempFile()`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.io.path/create-temp-file.html) 함수를 사용하십시오.
>
> **지원 중단 주기**:
>
> - 1.4.20: `kotlin.io.createTempDirectory()` 및 `kotlin.io.createTempFile()` 함수 사용 시 경고 보고
> - 2.3.0: 경고를 오류로 격상

### `InputStream.readBytes(Int)` 함수 숨김(Hide) {id="hide-inputstream-readbytes-int-function"}

> **이슈**: [KTLC-280](https://youtrack.jetbrains.com/issue/KTLC-280)
>
> **컴포넌트**: kotlin-stdlib
>
> **호환성 위반 유형**: 소스
>
> **요약**: 오랫동안 지원 중단되었던 `InputStream.readBytes(estimatedSize: Int = DEFAULT_BUFFER_SIZE): ByteArray` 함수가 이제 숨겨집니다.
>
> **지원 중단 주기**:
>
> - 1.3.0: 경고 보고
> - 1.5.0: 경고를 오류로 격상
> - 2.3.0: 함수 숨김

### Kotlin/Native 스택 트레이스 출력을 다른 플랫폼과 통일 {id="unify-kotlin-native-stack-trace-printing-with-other-platforms"}

> **이슈**: [KT-81431](https://youtrack.jetbrains.com/issue/KT-81431)
>
> **컴포넌트**: Kotlin/Native
>
> **호환성 위반 유형**: 동작
>
> **요약**: 예외 스택 트레이스를 포맷할 때, 동일한 예외 원인(cause)이 이미 출력된 경우 추가적인 원인은 출력되지 않습니다.
>
> **지원 중단 주기**:
>
> - 2.3.20: Kotlin/Native 예외 스택 트레이스 포맷을 다른 Kotlin 플랫폼과 통일

### `Iterable<T>.intersect()` 및 `Iterable<T>.subtract()` 동작 수정 {id="correct-iterable-t-intersect-and-iterable-t-subtract-behavior"}

> **이슈**: [KTLC-268](https://youtrack.jetbrains.com/issue/KTLC-268)
>
> **컴포넌트**: kotlin-stdlib
>
> **호환성 위반 유형**: 동작
>
> **요약**: [`Iterable<T>.intersect()`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.collections/intersect.html) 및 [`Iterable<T>.subtract()`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.collections/subtract.html) 함수는 이제 각 수신자 요소를 결과 집합에 추가하기 전에 멤버십 테스트를 수행합니다. 결과 집합은 `Any::equals`를 사용하여 요소를 비교하므로, 인자 컬렉션이 참조 동등성(예: `IdentityHashMap.keys`)을 사용하더라도 올바른 결과를 보장합니다.
>
> **지원 중단 주기**:
>
> - 2.3.0: 새로운 동작 활성화

## 도구(Tools) {id="tools"}

### `kotlin-dsl` 및 `kotlin("jvm")` 플러그인 사용 시 지원되지 않는 KGP 버전 경고 {id="unsupported-kgp-version-warning-when-using-kotlin-dsl-and-kotlin-jvm-plugins"}

> **이슈**: [KT-79851](https://youtrack.jetbrains.com/issue/KT-79851)
>
> **컴포넌트**: Gradle
>
> **호환성 위반 유형**: 동작
>
> **요약**: Kotlin 2.3에서 Gradle 프로젝트에 `kotlin-dsl` **및** `kotlin("jvm")` 플러그인을 모두 사용하는 경우, 지원되지 않는 Kotlin Gradle 플러그인(KGP) 버전에 대한 Gradle 경고가 표시될 수 있습니다.
>
> **마이그레이션 단계**:
> 
> 일반적으로 동일한 Gradle 프로젝트에서 `kotlin-dsl`과 `kotlin("jvm")` 플러그인을 모두 사용하는 것은 권장되지 않습니다. 이 설정은 지원되지 않습니다.
> 
> 컨벤션 플러그인, 사전 컴파일된 스크립트 플러그인 또는 기타 게시되지 않은 빌드 로직의 경우 세 가지 옵션이 있습니다:
> 
> 1. `kotlin("jvm")` 플러그인을 명시적으로 적용하지 마십시오. 대신 `kotlin-dsl` 플러그인이 자동으로 호환되는 KGP 버전을 제공하도록 하십시오.
> 2. `kotlin("jvm")` 플러그인을 명시적으로 적용하려면 [`embeddedKotlinVersion`](https://docs.gradle.org/current/kotlin-dsl/gradle/org.gradle.kotlin.dsl/embedded-kotlin-version.html) 상수를 사용하여 내장된 Kotlin 버전을 지정하십시오.
>
>     내장된 Kotlin 및 언어 버전을 업그레이드하려면 Gradle 버전을 업데이트하십시오. Gradle의 [Kotlin 호환성 노트](https://docs.gradle.org/current/userguide/compatibility.html#kotlin)에서 호환되는 Gradle 버전을 확인할 수 있습니다.
> 
> 3. `kotlin-dsl` 플러그인을 사용하지 마십시오. 특정 Gradle 버전에 묶이지 않은 바이너리 플러그인의 경우 이 방법이 더 적절할 수 있습니다.
>
> 최후의 수단으로 프로젝트에서 언어 버전을 2.1 이상으로 설정하여 `kotlin-dsl` 플러그인의 충돌하는 동작을 재정의할 수 있습니다. 그러나 이 방법은 권장하지 않습니다.
> 
> 마이그레이션 중에 어려움이 발생하면 [Slack](https://surveys.jetbrains.com/s3/kotlin-slack-sign-up)의 #gradle 채널에서 지원을 요청하십시오.
> 
> **지원 중단 주기**:
>
> - 2.3.0: `kotlin-dsl` 플러그인이 컴파일러의 호환되지 않는 언어 또는 API 버전과 함께 사용되는 경우를 감지하는 진단(diagnostic) 도입

### AGP 버전 9.0.0 이상에서 `kotlin-android` 플러그인 지원 중단 {id="deprecate-kotlin-android-plugin-for-agp-versions-9-0-0-and-later"}

> **이슈**: [KT-81199](https://youtrack.jetbrains.com/issue/KT-81199)
>
> **컴포넌트**: Gradle
>
> **호환성 위반 유형**: 소스
>
> **요약**: Kotlin 2.3.0에서 Android Gradle 플러그인(AGP) 버전 9.0.0 이상을 사용할 때 `org.jetbrains.kotlin.android` 플러그인은 지원 중단됩니다. AGP 9.0.0부터 [AGP가 Kotlin에 대한 내장 지원을 제공](https://kotl.in/gradle/agp-built-in-kotlin)하므로 `kotlin-android` 플러그인은 더 이상 필요하지 않습니다.
>
> **지원 중단 주기**:
>
> - 2.3.0: `kotlin-android` 플러그인이 AGP 버전 9.0.0 이상에서 사용되고, `android.builtInKotlin` 및 `android.newDsl=false` Gradle 속성이 모두 `false`로 설정된 경우 경고 보고

### `testApi` 구성 지원 중단 {id="deprecate-testapi-configuration"}

> **이슈**: [KT-63285](https://youtrack.jetbrains.com/issue/KT-63285)
>
> **컴포넌트**: Gradle
>
> **호환성 위반 유형**: 소스
>
> **요약**: Kotlin 2.3.0은 `testApi` 구성을 지원 중단합니다. 이 구성은 테스트 의존성 및 소스를 다른 모듈에 노출했지만, Gradle은 이러한 동작을 지원하지 않습니다.
> 
> **마이그레이션 옵션**:
> `testApi()`의 모든 인스턴스를 `testImplementation()`으로 교체하고, 다른 변형에 대해서도 동일하게 수행하십시오. 예를 들어, `kotlin.sourceSets.commonTest.dependencies.api()`를 `kotlin.sourceSets.commonTest.dependencies.implementation()`으로 교체하십시오.
> 
> Kotlin/JVM 프로젝트의 경우 대신 Gradle의 [테스트 픽스처(test fixtures)](https://docs.gradle.org/current/userguide/java_testing.html#sec:java_test_fixtures)를 사용하는 것이 좋습니다. 멀티플랫폼 프로젝트에서 테스트 픽스처 지원을 원하는 경우 [YouTrack](https://youtrack.jetbrains.com/issue/KT-63142)에서 사용 사례를 공유해 주십시오.
> 
> **지원 중단 주기**:
>
> - 2.3.0: 경고 보고

### `createTestExecutionSpec()` 함수 지원 중단 {id="deprecate-createtestexecutionspec-function"}

> **이슈**: [KT-75449](https://youtrack.jetbrains.com/issue/KT-75449)
>
> **컴포넌트**: Gradle
>
> **호환성 위반 유형**: 소스
>
> **요약**: Kotlin 2.3.0은 `KotlinJsTestFramework` 인터페이스에서 더 이상 사용되지 않는 `createTestExecutionSpec()` 함수를 지원 중단합니다.
>
> **지원 중단 주기**:
>
> - 2.2.20: 경고 보고
> - 2.3.0: 경고를 오류로 격상
> - 2.4.0: 함수 제거

### `closureTo()`, `createResultSet()`, 및 `KotlinToolingVersionOrNull()` 함수 제거 {id="remove-closureto-createresultset-and-kotlintoolingversionornull-functions"}

> **이슈**: [KT-64273](https://youtrack.jetbrains.com/issue/KT-64273)
>
> **컴포넌트**: Gradle
>
> **호환성 위반 유형**: 소스
>
> **요약**: Kotlin 2.3.0은 더 이상 사용되지 않는 `closure` DSL의 `closureTo()`, `createResultSet()` 함수를 제거합니다. 또한 `KotlinToolingVersionOrNull()` 함수가 제거됩니다. 대신 `KotlinToolingVersion()` 함수를 사용하십시오.
>
> **지원 중단 주기**:
> 
> - 1.7.20: 오류 보고
> - 2.3.0: 함수 제거

### `ExtrasProperty` API 지원 중단 {id="deprecate-the-extrasproperty-api"}

> **이슈**: [KT-74915](https://youtrack.jetbrains.com/issue/KT-74915)
>
> **컴포넌트**: Gradle
>
> **호환성 위반 유형**: 소스
>
> **요약**: Kotlin 2.0.0부터 지원 중단되었던 `ExtrasProperty` API가 이제 Kotlin 2.3.0에서 내부(internal)로 변경됩니다. 대안으로 Gradle의 [`ExtraPropertiesExtension`](https://docs.gradle.org/current/dsl/org.gradle.api.plugins.ExtraPropertiesExtension.html) API를 사용하십시오.
> 
> **지원 중단 주기**:
>
> - 2.0.0: 경고 보고
> - 2.1.0: 경고를 오류로 격상
> - 2.3.0: API를 내부용으로 변경

### `KotlinCompilation`의 `HasKotlinDependencies` 지원 중단 {id="deprecate-haskotlindependencies-in-kotlincompilation"}

> **이슈**: [KT-67290](https://youtrack.jetbrains.com/issue/KT-67290)
>
> **컴포넌트**: Gradle
>
> **호환성 위반 유형**: 소스
>
> **요약**: Kotlin 2.3.0은 [`KotlinCompilation`](https://kotlinlang.org/api/kotlin-gradle-plugin/kotlin-gradle-plugin-api/org.jetbrains.kotlin.gradle.plugin/-kotlin-compilation/)의 `HasKotlinDependencies` 인터페이스를 지원 중단합니다. 의존성 관련 API는 이제 대신 [`KotlinSourceSet`](https://kotlinlang.org/api/kotlin-gradle-plugin/kotlin-gradle-plugin-api/org.jetbrains.kotlin.gradle.plugin/-kotlin-source-set/) 인터페이스를 통해 노출됩니다.
>
> **지원 중단 주기**:
>
> - 2.3.0: 경고 보고

### npm 및 Yarn 패키지 관리자 내부 함수 및 속성 지원 중단 {id="deprecate-npm-and-yarn-package-manager-internal-functions-and-properties"}

> **이슈**: [KT-81009](https://youtrack.jetbrains.com/issue/KT-81009)
>
> **컴포넌트**: Gradle
>
> **호환성 위반 유형**: 소스
>
> **요약**: npm 및 Yarn 패키지 관리자와 관련된 다음 함수 및 속성이 지원 중단됩니다:
> 
> * `CompositeDependency.dependencyName`, `CompositeDependency.dependencyVersion`, `CompositeDependency.includedBuildDir`.
> * `KotlinNpmInstallTask.Companion.NAME`.
> * `LockCopyTask.Companion.STORE_PACKAGE_LOCK_NAME`, `LockCopyTask.Companion.RESTORE_PACKAGE_LOCK_NAME`, `LockCopyTask.Companion.UPGRADE_PACKAGE_LOCK`.
> * `Npm.npmExec()`.
> * `NpmProject.require()`, `NpmProject.useTool()`.
> * `PublicPackageJsonTask.jsIrCompilation`.
> * `YarnBasics.yarnExec()`.
> * `YarnPlugin.Companion.STORE_YARN_LOCK_NAME`, `YarnPlugin.Companion.RESTORE_YARN_LOCK_NAME`, `YarnPlugin.Companion.UPGRADE_YARN_LOCK`.
> * `YarnSetupTask.Companion.NAME`.
>
> **지원 중단 주기**:
>
> - 2.2.0 및 2.2.20: 이러한 함수나 속성 사용 시 경고 보고
> - 2.3.0: 경고를 오류로 격상
> - 2.4.0: 함수 및 속성 제거

### PhantomJS 지원 중단 {id="deprecate-support-for-phantomjs"}

> **이슈**: [KT-76019](https://youtrack.jetbrains.com/issue/KT-76019)
>
> **컴포넌트**: Gradle
>
> **호환성 위반 유형**: 소스
>
> **요약**: PhantomJS가 더 이상 유지관리되지 않으므로, Kotlin 2.3.0은 `NpmVersions` API의 `karmaPhantomjsLauncher` 속성을 지원 중단합니다.
> 
> **지원 중단 주기**:
>
> - 2.3.0: 경고 보고

### 테스트 실행 또는 JavaScript 런타임을 설정하는 클래스의 서브클래싱 금지 {id="prohibit-subclassing-of-classes-that-set-up-test-runs-or-javascript-runtime"}

> **이슈**: [KT-75869](https://youtrack.jetbrains.com/issue/KT-75869), [KT-81007](https://youtrack.jetbrains.com/issue/KT-81007)
>
> **컴포넌트**: Gradle
>
> **호환성 위반 유형**: 소스
>
> **요약**: Kotlin 2.3.0은 다음 클래스의 서브클래싱을 금지합니다:
> * `KotlinTest`
> * `KotlinNativeTest`
> * `KotlinJsTest`
> * `KotlinJsIrTarget`
> * `KotlinNodeJsIr`
> * `KotlinD8Ir`
> * `KotlinKarma`
> * `KotlinMocha`
> * `KotlinWebpack`
> * `TypeScriptValidationTask`
> * `YarnRootExtension`
> 
> 이 클래스들은 서브클래싱되도록 설계되지 않았습니다. 서브클래싱에 대한 모든 사용 사례는 이제 Kotlin Gradle 플러그인 DSL에서 제공하는 설정 블록으로 처리되어야 합니다. 이러한 태스크에 대한 기존 API가 테스트 실행 또는 JavaScript 런타임 설정에 대한 요구사항을 충족하지 못하는 경우 [YouTrack](https://youtrack.jetbrains.com/issue/KT-75869)에 의견을 남겨 주십시오.
>
> **지원 중단 주기**:
>
> - 2.2.0: 이러한 클래스로부터 서브클래스를 생성하는 코드에 대해 경고 보고
> - 2.3.0: 경고를 오류로 격상
> - 2.4.0: API 제거

### `ExperimentalWasmDsl` 어노테이션 클래스 지원 중단 {id="deprecate-experimentalwasmdsl-annotation-class"}

> **이슈**: [KT-81005](https://youtrack.jetbrains.com/issue/KT-81005)
>
> **컴포넌트**: Gradle
>
> **호환성 위반 유형**: 소스
>
> **요약**: 기능이 `kotlin-plugin-annotations` 모듈로 이동함에 따라 `ExperimentalWasmDsl` 어노테이션 클래스가 지원 중단됩니다.
>
> **지원 중단 주기**:
>
> - 2.0.20: 경고 보고
> - 2.3.0: 경고를 오류로 격상
> - 2.4.0: 어노테이션 클래스 제거

### `ExperimentalDceDsl` 어노테이션 클래스 지원 중단 {id="deprecate-experimentaldcedsl-annotation-class"}

> **이슈**: [KT-81008](https://youtrack.jetbrains.com/issue/KT-81008)
>
> **컴포넌트**: Gradle
>
> **호환성 위반 유형**: 소스
>
> **요약**: `ExperimentalDceDsl` 어노테이션 클래스가 더 이상 사용되지 않으므로 지원 중단되었습니다.
>
> **지원 중단 주기**:
>
> - 2.2.0: 경고 보고
> - 2.3.0: 경고를 오류로 격상
> - 2.4.0: 어노테이션 클래스 제거

### JavaScript 유틸리티 지원 중단 {id="deprecate-javascript-utilities"}

> **이슈**: [KT-81010](https://youtrack.jetbrains.com/issue/KT-81010)
>
> **컴포넌트**: Gradle
>
> **호환성 위반 유형**: 소스
>
> **요약**: 다음 함수 및 속성은 내부적으로만 사용되므로 지원 중단되었습니다:
> * `JsIrBinary.generateTs`
> * `KotlinJsIrLink.mode`
> * `NodeJsSetupTask.Companion.NAME`
> * `Appendable.appendConfigsFromDir()`
> * `ByteArray.toHex()`
> * `FileHasher.calculateDirHash()`
> * `String.jsQuoted()`
>
> **지원 중단 주기**:
>
> - 2.2.0: `KotlinJsIrLink.mode` 속성 사용 시 경고 보고
> - 2.2.0: `NodeJsSetupTask.Companion.NAME` 속성 및 함수 사용 시 경고 보고
> - 2.2.20: `JsIrBinary.generateTs` 속성 사용 시 경고 보고
> - 2.3.0: 경고를 오류로 격상
> - 2.4.0: API 제거

### 마이그레이션된 D8 및 Binaryen 속성 지원 중단 {id="deprecate-migrated-d8-and-binaryen-properties"}

> **이슈**: [KT-81006](https://youtrack.jetbrains.com/issue/KT-81006)
>
> **컴포넌트**: Gradle
>
> **호환성 위반 유형**: 소스
>
> **요약**: 다음 속성들은 `org.jetbrains.kotlin.gradle.targets.js` 패키지에서 `org.jetbrains.kotlin.gradle.targets.wasm` 패키지로 마이그레이션되었기 때문에 지원 중단됩니다:
> 
> * `binaryen.BinaryenEnvSpec`
> * `binaryen.BinaryenExtension`
> * `binaryen.BinaryenPlugin`
> * `binaryen.BinaryenRootPlugin`
> * `BinaryenSetupTask.Companion.NAME`
> * `d8.D8EnvSpec`
> * `d8.D8Plugin`
> * `D8SetupTask.Companion.NAME`
>
> **지원 중단 주기**:
>
> - 2.2.0: 경고 보고
> - 2.3.0: 경고를 오류로 격상
> - 2.4.0: 속성 제거

### `NodeJsExec` DSL의 `create()` 함수 지원 중단 {id="deprecate-create-function-in-nodejsexec-dsl"}

> **이슈**: [KT-81004](https://youtrack.jetbrains.com/issue/KT-81004)
>
> **컴포넌트**: Gradle
>
> **호환성 위반 유형**: 소스
>
> **요약**: `NodeJsExec` DSL의 컴패니언 객체에 있는 `create()` 함수가 지원 중단되었습니다. 대신 `register()` 함수를 사용하십시오.
>
> **지원 중단 주기**:
>
> - 2.1.20: 경고 보고
> - 2.3.0: 경고를 오류로 격상
> - 2.4.0: 함수 제거

### `kotlinOptions` DSL 속성 지원 중단 {id="deprecate-properties-in-kotlinoptions-dsl"}

> **이슈**: [KT-76720](https://youtrack.jetbrains.com/issue/KT-76720)
>
> **컴포넌트**: Gradle
>
> **호환성 위반 유형**: 소스
>
> **요약**: `kotlinOptions` DSL 및 관련 `KotlinCompile<KotlinOptions>` 태스크 인터페이스를 통해 컴파일러 옵션을 설정하는 기능은 Kotlin 2.2.0부터 새로운 `compilerOptions` DSL을 위해 지원 중단되었습니다. Kotlin 2.3.0은 `kotlinOptions` 인터페이스의 모든 속성에 대한 지원 중단 주기를 계속합니다. 마이그레이션하려면 `compilerOptions` DSL을 사용하여 컴파일러 옵션을 설정하십시오. 마이그레이션에 대한 안내는 [`kotlinOptions {}`에서 `compilerOptions {}`로 마이그레이션](gradle-compiler-options.md#migrate-from-kotlinoptions-to-compileroptions)을 참조하십시오.
>
> **지원 중단 주기**:
>
> - 2.0.0: `kotlinOptions` DSL에 대해 경고 보고
> - 2.2.0: 경고를 오류로 격상하고 `kotlinOptions`의 모든 속성을 지원 중단
> - 2.3.0: `kotlinOptions`의 모든 속성에 대해 경고를 오류로 격상

### `kotlinArtifacts` API 지원 중단 {id="deprecate-kotlinartifacts-api"}

> **이슈**: [KT-77066](https://youtrack.jetbrains.com/issue/KT-77066)
>
> **컴포넌트**: Gradle
>
> **호환성 위반 유형**: 소스
>
> **요약**: 실험적인 `kotlinArtifacts` API가 지원 중단되었습니다. [최종 네이티브 바이너리를 빌드](https://kotlinlang.org/docs/multiplatform/multiplatform-build-native-binaries.html)하려면 Kotlin Gradle 플러그인에서 제공하는 현재 DSL을 사용하십시오. 마이그레이션에 충분하지 않은 경우 [이 YouTrack 이슈](https://youtrack.jetbrains.com/issue/KT-74953)에 의견을 남겨 주십시오.
>
> **지원 중단 주기**:
>
> - 2.2.0: `kotlinArtifacts` API 사용 시 경고 보고
> - 2.3.0: 이 경고를 오류로 격상
> - 2.4.0: API 제거

### `kotlin.mpp.resourcesResolutionStrategy` Gradle 속성 제거 {id="remove-kotlin-mpp-resourcesresolutionstrategy-gradle-property"}

> **이슈**: [KT-74955](https://youtrack.jetbrains.com/issue/KT-74955)
>
> **컴포넌트**: Gradle
>
> **호환성 위반 유형**: 소스
>
> **요약**: 이전에 `kotlin.mpp.resourcesResolutionStrategy` Gradle 속성은 사용되지 않아 지원 중단되었습니다. Kotlin 2.3.0에서는 이 Gradle 속성이 완전히 제거됩니다.
>
> **지원 중단 주기**:
>
> - 2.2.0: 설정 시점 진단(configuration-time diagnostic) 보고
> - 2.3.0: Gradle 속성 제거

### 이전 모드의 멀티플랫폼 IDE 임포트 지원 중단 {id="deprecated-old-mode-of-multiplatform-ide-import"}

> **이슈**: [KT-61127](https://youtrack.jetbrains.com/issue/KT-61127)
>
> **컴포넌트**: Gradle
>
> **호환성 위반 유형**: 소스
>
> **요약**: Kotlin 2.3.0 이전에는 멀티플랫폼 IDE 임포트의 여러 모드를 지원했습니다. 이제 이전 모드가 지원 중단되어 하나의 모드만 사용할 수 있습니다. 이전에는 `kotlin.mpp.import.enableKgpDependencyResolution=false` Gradle 속성을 사용하여 이전 모드를 활성화했습니다. 이제 이 속성을 사용하면 지원 중단 경고가 발생합니다.
>
> **지원 중단 주기**:
>
> - 2.3.0: `kotlin.mpp.import.enableKgpDependencyResolution=false` Gradle 속성 사용 시 경고 보고

### 정밀 컴파일 백업을 비활성화하는 속성 제거 {id="remove-properties-to-disable-precise-compilation-backup"}

> **이슈**: [KT-81038](https://youtrack.jetbrains.com/issue/KT-81038)
>
> **컴포넌트**: Gradle
>
> **호환성 위반 유형**: 소스
>
> **요약**: Kotlin 1.9.0은 정밀 컴파일 백업(precise compilation backup)이라는 증분 컴파일을 위한 실험적 최적화를 도입했습니다. 성공적인 테스트 후, 이 최적화는 Kotlin 2.0.0에서 기본적으로 활성화되었습니다. Kotlin 2.3.0은 이 최적화를 거부하는 `kotlin.compiler.preciseCompilationResultsBackup` 및 `kotlin.compiler.keepIncrementalCompilationCachesInMemory` Gradle 속성을 제거합니다.
>
> **지원 중단 주기**:
>
> - 2.1.20: 경고 보고
> - 2.3.0: 속성 제거

### `CInteropProcess`의 `destinationDir` 지원 중단 {id="deprecate-destinationdir-in-cinteropprocess"}

> **이슈**: [KT-74910](https://youtrack.jetbrains.com/issue/KT-74910)
>
> **컴포넌트**: Gradle
>
> **호환성 위반 유형**: 소스
>
> **요약**: `CInteropProcess` 태스크의 `destinationDir` 속성이 지원 중단되었습니다. 대신 `CInteropProcess.destinationDirectory.set()` 함수를 사용하십시오.
>
> **지원 중단 주기**:
>
> - 2.1.0: `destinationDir` 속성 사용 시 경고 보고
> - 2.2.0: 이 경고를 오류로 격상
> - 2.3.0: `destinationDir` 속성 숨김

### `CInteropProcess`의 `konanVersion` 지원 중단 {id="deprecate-konanversion-in-cinteropprocess"}

> **이슈**: [KT-74911](https://youtrack.jetbrains.com/issue/KT-74911)
>
> **컴포넌트**: Gradle
>
> **호환성 위반 유형**: 소스
>
> **요약**: `CInteropProcess` 태스크의 `konanVersion` 속성이 지원 중단되었습니다. 대신 `CInteropProcess.kotlinNativeVersion`을 사용하십시오.
>
> **지원 중단 주기**:
>
> - 2.1.0: `konanVersion` 속성 사용 시 경고 보고
> - 2.2.0: 이 경고를 오류로 격상
> - 2.3.0: `konanVersion` 속성 숨김

### `KotlinCompile.classpathSnapshotProperties` 속성 제거 {id="remove-kotlincompile-classpathsnapshotproperties-properties"}

> **이슈**: [KT-76177](https://youtrack.jetbrains.com/issue/KT-76177)
>
> **컴포넌트**: Gradle
>
> **호환성 위반 유형**: 소스
>
> **요약**: `kotlin.incremental.useClasspathSnapshot` Gradle 속성은 Kotlin 2.2.0에서 제거되었습니다. Kotlin 2.3.0에서는 다음 속성들도 제거됩니다:
> * `KotlinCompile.classpathSnapshotProperties.useClasspathSnapshot`
> * `KotlinCompile.classpathSnapshotProperties.classpath`
>
> **지원 중단 주기**:
>
> - 2.0.20: `kotlin.incremental.useClasspathSnapshot` 속성을 경고와 함께 지원 중단
> - 2.2.0: `kotlin.incremental.useClasspathSnapshot` 속성 제거
> - 2.3.0: `KotlinCompile.classpathSnapshotProperties.useClasspathSnapshot` 및 `KotlinCompile.classpathSnapshotProperties.classpath` 속성 제거

### `getPluginArtifactForNative()` 함수 지원 중단 {id="deprecate-getpluginartifactfornative-function"}

> **이슈**: [KT-78870](https://youtrack.jetbrains.com/issue/KT-78870)
>
> **컴포넌트**: Gradle
>
> **호환성 위반 유형**: 소스
>
> **요약**: Kotlin 2.2.20에서 [`getPluginArtifactForNative()` 함수가 지원 중단되었습니다](whatsnew2220.md#reduced-size-of-kotlin-native-distribution). 대신 [`getPluginArtifact()`](https://kotlinlang.org/api/kotlin-gradle-plugin/kotlin-gradle-plugin-api/org.jetbrains.kotlin.gradle.plugin/-kotlin-compiler-plugin-support-plugin/get-plugin-artifact.html) 함수를 사용하십시오.
>
> **지원 중단 주기**:
>
> - 2.2.20: 경고 보고
> - 2.3.0: 경고를 오류로 격상
> - 2.4.0: 함수 제거

### 모든 생성된 소스를 등록하는 방식 변경 {id="change-the-approach-to-registering-all-generated-sources"}

> **이슈**: [KT-45161](https://youtrack.jetbrains.com/issue/KT-45161)
>
> **컴포넌트**: Gradle
>
> **호환성 위반 유형**: 소스
>
> **요약**: Kotlin 2.3.0은 Gradle 프로젝트에서 [생성된 소스를 등록](gradle-configure-project.md#register-generated-sources)할 수 있게 해주는 새로운 [실험적(Experimental)](components-stability.md#stability-levels-explained) API를 [`KotlinSourceSet`](https://kotlinlang.org/api/kotlin-gradle-plugin/kotlin-gradle-plugin-api/org.jetbrains.kotlin.gradle.plugin/-kotlin-source-set/) 인터페이스에 도입합니다. 이전에는 [`kotlin`](https://kotlinlang.org/api/kotlin-gradle-plugin/kotlin-gradle-plugin-api/org.jetbrains.kotlin.gradle.plugin/-kotlin-source-set/kotlin.html) 속성을 사용하여 모든 생성된 소스에 액세스할 수 있었습니다. Kotlin 2.3.0부터 플러그인이나 빌드 로직이 모든 생성된 소스에 액세스해야 하는 경우, 대신 [`allKotlinSources`](https://kotlinlang.org/api/kotlin-gradle-plugin/kotlin-gradle-plugin-api/org.jetbrains.kotlin.gradle.plugin/-kotlin-source-set/all-kotlin-sources.html) 속성을 사용하십시오.
>
> **마이그레이션 조언**:
> * 생성된 소스를 등록하려면 [`generatedKotlin`](https://kotlinlang.org/api/kotlin-gradle-plugin/kotlin-gradle-plugin-api/org.jetbrains.kotlin.gradle.plugin/-kotlin-source-set/generated-kotlin.html) 속성을 사용하십시오.
> * 생성되지 않은 소스를 포함한 모든 소스에 액세스하려면 [`allKotlinSources`](https://kotlinlang.org/api/kotlin-gradle-plugin/kotlin-gradle-plugin-api/org.jetbrains.kotlin.gradle.plugin/-kotlin-source-set/all-kotlin-sources.html) 속성을 사용하십시오.

### `kotlin.publishJvmEnvironmentAttribute` 속성 지원 중단 {id="deprecate-kotlin-publishjvmenvironmentattribute-property"}

> **이슈**: [KT-83678](https://youtrack.jetbrains.com/issue/KT-83678)
>
> **컴포넌트**: Gradle
>
> **호환성 위반 유형**: 소스
>
> **요약**: Kotlin 2.3.20에서 `kotlin.publishJvmEnvironmentAttribute` 속성이 지원 중단됩니다. 이 속성은 멀티플랫폼 라이브러리에 대해 `org.gradle.jvm.environment` 속성 게시를 비활성화하는 데 사용되었습니다. Kotlin 2.0.20부터는 기존의 의존성 해결 방식을 보장하기 위해 `org.gradle.jvm.environment`가 기본적으로 게시됩니다.
>
> **지원 중단 주기**:
>
> - 2.3.20: 경고 보고
> - 2.4.0: 속성 제거

### `CleanableStore` 인터페이스 및 `CleanDataTask` 클래스 지원 중단 {id="deprecate-cleanablestore-interface-and-cleandatatask-class"}

> **이슈**: [KT-78104](https://youtrack.jetbrains.com/issue/KT-78104)
>
> **컴포넌트**: Gradle
>
> **호환성 위반 유형**: 소스
>
> **요약**: 더 이상 사용되지 않는 `CleanableStore` 인터페이스 및 `CleanDataTask` 클래스가 지원 중단되었습니다.
>
> **지원 중단 주기**:
>
> - 2.3.20: 경고 보고
> - 2.4.20: 경고를 오류로 격상

### `kotlin.kmp.isolated-projects.support` Gradle 속성 지원 중단 {id="deprecate-kotlin-kmp-isolated-projects-support-gradle-property"}

> **이슈**: [KT-79257](https://youtrack.jetbrains.com/issue/KT-79257)
>
> **컴포넌트**: Gradle
>
> **호환성 위반 유형**: 소스
>
> **요약**: 멀티플랫폼 프로젝트는 기본적으로 격리된 프로젝트(isolated projects)와 호환되며 다른 옵션이 없으므로, `kotlin.kmp.isolated-projects.support` Gradle 속성이 지원 중단되었습니다.
>
> **지원 중단 주기**:
>
> - 2.3.20: 경고 보고

### `kotlin.mpp.enableKotlinToolingMetadataArtifact` Gradle 속성 지원 중단 {id="deprecate-kotlin-mpp-enablekotlintoolingmetadataartifact-gradle-property"}

> **이슈**: [KT-79924](https://youtrack.jetbrains.com/issue/KT-79924)
>
> **컴포넌트**: Gradle
>
> **호환성 위반 유형**: 소스
>
> **요약**: 이제 멀티플랫폼 프로젝트에 대해 `kotlin-tooling-metadata.json` 아티팩트가 항상 생성되므로, `kotlin.mpp.enableKotlinToolingMetadataArtifact` Gradle 속성이 지원 중단되었습니다.
>
> **지원 중단 주기**:
>
> - 2.3.20: 경고 보고
> - 2.4.0: 지원 제거

### `LanguageSettings.enableLanguageFeature` DSL 지원 중단 {id="deprecate-languagesettings-enablelanguagefeature-dsl"}

> **이슈**: [KT-82323](https://youtrack.jetbrains.com/issue/KT-82323), [KT-82847](https://youtrack.jetbrains.com/issue/KT-82847)
>
> **컴포넌트**: Gradle
>
> **호환성 위반 유형**: 소스
>
> **요약**: `LanguageSettings.enableLanguageFeature` DSL은 Kotlin 컴파일러 테스트만을 위해 의도된 내부 컴파일러 설정을 노출했습니다. 따라서 이 DSL은 지원 중단됩니다.
>
> **지원 중단 주기**:
>
> - 2.3.20: `LanguageSettings.enableLanguageFeature` 사용 시 경고 보고
> - 2.4.0: 경고를 오류로 격상

### "프로세스 외부(out of process)" 컴파일러 실행 전략 지원 중단 {id="deprecate-out-of-process-compiler-execution-strategy"}

> **이슈**: [KT-83125](https://youtrack.jetbrains.com/issue/KT-83125)
>
> **컴포넌트**: Gradle
>
> **호환성 위반 유형**: 소스
>
> **요약**: "프로세스 외부(out of process)" [컴파일러 실행 전략](compiler-execution-strategy.md)은 [빌드 도구 API(Build tools API)](build-tools-api.md)에서 지원되지 않으며 사용 가능한 가장 느린 전략입니다. Kotlin 2.3.20에서 이 전략은 "데몬(daemon)" 및 "프로세스 내부(in process)" 컴파일러 실행 전략을 위해 지원 중단됩니다.
>
> **지원 중단 주기**:
>
> - 2.3.20: 경고 보고
> - 2.4.0: "프로세스 외부(out of process)" 컴파일러 실행 전략 제거

## 빌드 도구 제거(Build tool removal) {id="build-tool-removal"}

### Ant 지원 제거 {id="remove-support-for-ant"}

> **이슈**: [KT-75875](https://youtrack.jetbrains.com/issue/KT-75875)
>
> **컴포넌트**: Ant
>
> **요약**: Kotlin 2.3.0은 빌드 도구로서의 Ant 지원을 제거합니다. 대신 [Gradle](gradle.md) 또는 [Maven](maven.md)을 사용하십시오.
>
> **지원 중단 주기**:
>
> - 2.2.0: 경고 보고
> - 2.3.0: 지원 제거