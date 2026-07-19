[//]: # (title: Kotlin 2.4.0의 새로운 기능)

<show-structure depth="1"/>

<web-summary>새로운 언어 기능, Kotlin Multiplatform, JVM, Native, JS, Wasm 업데이트, 그리고 Gradle 및 Maven 빌드 도구 지원을 포함한 Kotlin 2.4.0 릴리스 노트를 확인해 보세요.</web-summary>

<tldr>
    <p>버그 수정 릴리스인 2.4.10에 대한 자세한 내용은 <a href="https://github.com/JetBrains/kotlin/releases/tag/v2.4.10">변경 로그(changelog)</a>를 참조하세요.</p>
</tldr>

Kotlin 2.4.0이 출시되었습니다! 주요 하이라이트는 다음과 같습니다:

* **언어:** [안정화된 컨텍스트 파라미터, 명시적 백킹 필드, 어노테이션 사용 지점 대상에 대한 여러 기능](#stable-features)
* **표준 라이브러리:** [UUID API 지원 안정화](#stable-uuid-api-in-the-common-kotlin-standard-library) 및 [정렬 순서 확인 지원](#support-for-checking-sorted-order)
* **Kotlin/JVM:** [Java 26 지원](#support-for-java-26) 및 [메타데이터의 어노테이션 기본 활성화](#annotations-in-metadata-enabled-by-default)
* **Kotlin/Native:** [종속성으로 Swift 패키지 지원, Swift export 업데이트, CMS GC 기본 활성화](#kotlin-native)
* **Kotlin/Wasm:** [증분 컴파일 기본 활성화 및 WebAssembly Component Model 지원](#kotlin-wasm)
* **Kotlin/JS**: [값 클래스 내보내기 지원 및 JS 코드 인라이닝 시 ES2015 기능 지원](#kotlin-js)
* **Gradle:** [Gradle 9.5.0과의 호환성](#gradle)
* **Maven:** [Java와 JVM 타겟 버전 간의 자동 정렬](#maven)
* **Kotlin 컴파일러:** [`.klib` 컴파일 중 더욱 일관된 인라인 함수 동작](#consistent-intra-module-function-inlining-during-klib-compilation)

> Kotlin 릴리스 주기에 대한 정보는 [Kotlin 릴리스 프로세스](releases.md)를 참조하세요.
>
{style="tip"}

## Kotlin 2.4.0으로 업데이트하기

최신 버전의 Kotlin은 최신 버전의 [IntelliJ IDEA](https://www.jetbrains.com/idea/download/) 및 [Android Studio](https://developer.android.com/studio)에 포함되어 있습니다.

새로운 Kotlin 버전으로 업데이트하려면 IDE가 최신 버전인지 확인하고, 빌드 스크립트에서 [Kotlin 버전을 2.4.0으로 변경](releases.md#update-to-a-new-kotlin-version)하세요.

## 새로운 기능 {id=new-stable-features}
<primary-label ref="stable"/>

이전 Kotlin 릴리스에서 실험적(Experimental)으로 도입되었던 여러 기능이 Kotlin 2.4.0에서 [안정(Stable)](components-stability.md#stability-levels-explained) 단계로 격상되었습니다. 이제 별도의 옵트인 없이 사용할 수 있습니다:

* [컨텍스트 파라미터(Context parameters)](context-parameters.md) ([컨텍스트 인자](#explicit-context-arguments-for-context-parameters) 및 [호출 가능 참조(callable references)](https://github.com/Kotlin/KEEP/blob/context-parameters/proposals/context-parameters.md#callable-references) 제외)
* [프로퍼티를 위한 `@all` 메타 타겟](annotations.md#all-meta-target)
* [사용 지점 어노테이션 타겟에 대한 새로운 기본 규칙](annotations.md#defaults-when-no-use-site-targets-are-specified)
* [명시적 백킹 필드(Explicit backing fields)](properties.md#explicit-backing-fields)
* [공통 Kotlin 표준 라이브러리의 안정적인 UUID API](#stable-uuid-api-in-the-common-kotlin-standard-library)
* [JVM에서 부호 없는 정수를 `BigInteger`로 변환하기 위한 새로운 API](#new-api-for-converting-unsigned-integers-to-biginteger-on-the-jvm)
* [정렬 순서 확인 지원](#support-for-checking-sorted-order)
* [JavaScript/TypeScript로의 값 클래스 내보내기(value class export) 지원](#support-for-value-class-export-to-javascript-typescript)
* [JS 코드 인라이닝 시 ES2015 기능 지원](#support-for-es2015-features-when-inlining-js-code)
* [Maven: Java와 JVM 타겟 버전 간의 자동 정렬](#automatic-alignment-between-java-and-jvm-target-versions)
* [Maven Toolchains 지원](#support-for-maven-toolchains)

## 새로운 기능 {id=new-experimental-features}
<primary-label ref="experimental-exp"/>

* [컨텍스트 파라미터를 위한 명시적 컨텍스트 인자](#explicit-context-arguments-for-context-parameters)
* [컬렉션 리터럴(Collection literals) 지원](#support-for-collection-literals)
* [컴파일 타임 상수 개선](#improved-compile-time-constants)
* [고차 함수에 대한 미사용 결과 확인 개선](#improved-unused-result-checks-for-higher-order-functions) 
* [선택적 파라미터에 대한 버전 기반 오버로드를 생성하는 새로운 `@IntroducedAt` 어노테이션](#new-introducedat-annotation-to-generate-version-based-overloads-for-optional-parameters)
* [`null` 값과 누락된 키를 구분하기 위한 새로운 Map 폴백(fallback) 함수](#new-map-fallback-functions-to-distinguish-null-values-and-missing-keys)
* [Swift 패키지 임포트](#swift-package-import)
* [동시성 지원이 개선된 Swift export Alpha 단계 진입](#swift-export-goes-alpha-with-improved-concurrency-support)
* [WebAssembly Component Model 지원](#support-for-the-webassembly-component-model)

## 언어

Kotlin 2.4.0은 컨텍스트 파라미터, 명시적 백킹 필드, 어노테이션 사용 지점 대상 기능을 [안정(Stable)](components-stability.md#stability-levels-explained) 단계로 격상했습니다. 또한 이번 릴리스에서는 [컨텍스트 파라미터를 위한 명시적 컨텍스트 인자](#explicit-context-arguments-for-context-parameters)를 도입했습니다.

### 안정화된 기능
<secondary-label ref="language"/>

Kotlin 2.2.0 및 2.3.0에서 [실험적(Experimental)](components-stability.md#stability-levels-explained)으로 도입되었던 몇 가지 언어 기능이 이번 릴리스에서 [안정(Stable)](components-stability.md#stability-levels-explained) 단계로 전환되었습니다:

* [컨텍스트 파라미터(Context parameters)](whatsnew22.md#preview-of-context-parameters) ([컨텍스트 인자](#explicit-context-arguments-for-context-parameters) 및 [호출 가능 참조](https://github.com/Kotlin/KEEP/blob/context-parameters/proposals/context-parameters.md#callable-references) 제외)
* [프로퍼티를 위한 `@all` 메타 타겟](annotations.md#all-meta-target)
* [사용 지점 어노테이션 타겟에 대한 새로운 기본 규칙](annotations.md#defaults-when-no-use-site-targets-are-specified)
* [명시적 백킹 필드(Explicit backing fields)](properties.md#explicit-backing-fields)

[Kotlin 언어 설계 기능 및 제안서 전체 목록 보기](kotlin-language-features-and-proposals.md).

### 임포트의 마지막 세그먼트에서 더 이상 지원 중단 경고가 발생하지 않음
<secondary-label ref="language"/>

이전 Kotlin 버전에서는 지원 중단(deprecated)된 클래스를 임포트할 때 호출 지점뿐만 아니라 임포트 지시문 자체에서도 지원 중단 오류가 보고되었습니다. 임포트에서 지원 중단 오류를 무시할 방법이 없었기 때문에, 파일 전체에 대해 지원 중단 보고를 무시하거나 스타(*) 임포트를 사용하는 방식으로 우회해야 했습니다.

호출되는 심볼의 임포트에 대해 지원 중단을 보고하는 것은 대부분의 경우 유용하지 않으므로, Kotlin 2.4.0은 임포트 지시문의 마지막 세그먼트에서 지원 중단된 심볼이 참조될 때 경고를 발행하지 않습니다.

자세한 내용은 [KT-30155](https://youtrack.jetbrains.com/issue/KT-30155)를 참조하세요.

### 컨텍스트 파라미터를 위한 명시적 컨텍스트 인자
<primary-label ref="experimental-opt-in"/>

<secondary-label ref="language"/>

> IntelliJ IDEA에서 컨텍스트 파라미터를 위한 명시적 컨텍스트 인자를 사용하는 기능은 2026.2 버전부터 지원될 예정입니다.
> 
{style="note"}

Kotlin 2.4.0은 [컨텍스트 파라미터(context parameters)](context-parameters.md)에 대한 명시적 컨텍스트 인자를 도입했습니다.

Kotlin 2.3.20에서 [컨텍스트 파라미터에 대한 오버로드 해상도(overload resolution)가 변경](whatsnew2320.md#changes-to-overload-resolution-for-context-parameters)되었습니다. 그 결과, 컨텍스트 파라미터만 다른 오버로드 호출이 모호해질 수 있습니다.

이제 호출 지점에서 명시적 컨텍스트 인자를 전달하여 이러한 모호성을 해결할 수 있습니다.

예시는 다음과 같습니다:

```kotlin
class EmailSender
class SmsSender

context(emailSender: EmailSender)
fun sendNotification() {
    println("Sent email notification")
}

context(smsSender: SmsSender)
fun sendNotification() {
    println("Sent SMS notification")
}

context(defaultEmailSender: EmailSender, defaultSmsSender: SmsSender)
fun notifyUser() {
    
    // EmailSender 컨텍스트 파라미터가 있는 오버로드를 선택합니다.
    sendNotification(emailSender = defaultEmailSender)

    // SmsSender 컨텍스트 파라미터가 있는 오버로드를 선택합니다.
    sendNotification(smsSender = defaultSmsSender)
}
```

또한 `context()` 함수 대신 명시적 컨텍스트 인자를 사용하여 중첩을 줄이고 일부 호출을 더 읽기 쉽게 만들 수 있습니다. 여러 호출에서 동일한 컨텍스트 인자를 사용해야 하는 경우에는 `context()` 함수를 대신 사용하세요.

이 기능은 [실험적(Experimental)](components-stability.md#stability-levels-explained) 단계입니다. 옵트인하려면 빌드 파일에 다음 컴파일러 옵션을 추가하세요:

<tabs group="build-system">
<tab title="Gradle" group-key="gradle">

```kotlin
kotlin {
    compilerOptions {
        freeCompilerArgs.add("-Xexplicit-context-arguments")
    }
}
```

</tab>
<tab title="Maven" group-key="maven">

```xml
<build>
    <plugins>
        <plugin>
            <groupId>org.jetbrains.kotlin</groupId>
            <artifactId>kotlin-maven-plugin</artifactId>
            <configuration>
                <args>
                    <arg>-Xexplicit-context-arguments</arg>
                </args>
            </configuration>
        </plugin>
    </plugins>
</build>
```

</tab>
</tabs>

자세한 내용은 해당 기능의 [KEEP](https://github.com/Kotlin/KEEP/blob/main/proposals/KEEP-0448-explicit-context-arguments.md)을 참조하세요.

### 컬렉션 리터럴 지원
<primary-label ref="experimental-opt-in"/>

<secondary-label ref="language"/>

Kotlin 2.4.0은 컬렉션 리터럴(collection literals)에 대한 실험적 지원을 도입합니다. 이제 대괄호 `[]`를 사용하여 더욱 간단하고 간결하게 컬렉션을 생성할 수 있습니다.

예시는 다음과 같습니다:

```kotlin
fun main() {
    // 명시적 타입 선언을 사용한 가변 리스트
    // val shapes: MutableList<String> = mutableListOf("triangle", "square", "circle")

    // 대괄호 구문을 사용한 가변 리스트
    val shapes: MutableList<String> = ["triangle", "square", "circle"]
    println(shapes)
    // [triangle, square, circle]
}
```
{validate="false"}

> 현재 컬렉션 리터럴은 Java에서 정의된 컬렉션을 생성하는 데 사용할 수 없습니다. 자세한 내용은 [KT-80494](https://youtrack.jetbrains.com/issue/KT-80494)를 참조하세요.
>
{style="note"}

컴파일러가 컬렉션 타입을 추론하기에 충분한 정보가 없는 경우, 기본적으로 `List` 타입이 사용됩니다:

```kotlin
fun main() {
    val fruit = ["apple", "banana", "cherry"]
    
    println(fruit)
    // [apple, banana, cherry]
}
```
{validate="false"}

사용자 정의 `operator fun of` 함수를 선언하여 자신의 타입에서도 대괄호 구문을 사용할 수 있습니다. 예를 들어, 다음과 같은 `DoubleMatrix` 클래스가 있는 경우:

```kotlin
class DoubleMatrix(vararg val rows: Row) {
    companion object {
        operator fun of(vararg rows: Row) = DoubleMatrix(*rows)
    }
    class Row(vararg val elements: Double) {
        companion object {
            operator fun of(vararg elements: Double) = Row(*elements)
        }
    }
}
```
{validate="false"}

다음과 같이 `identityMatrix` 클래스 인스턴스를 생성할 수 있습니다:

```kotlin
fun main() {
    val identityMatrix: DoubleMatrix = [
        [1.0, 0.0, 0.0],
        [0.0, 1.0, 0.0],
        [0.0, 0.0, 1.0],
    ]
}
```
{validate="false"}

이 예시에서 컴파일러는 중첩된 컬렉션 리터럴을 해당하는 `operator fun of` 함수 호출로 변환합니다. 컴파일러는 이러한 호출을 재귀적으로 해결하고 예상되는 타입을 사용하여 올바른 오버로드를 선택합니다.

이 기능은 [실험적(Experimental)](components-stability.md#stability-levels-explained) 단계입니다. 옵트인하려면 빌드 파일에 다음 컴파일러 옵션을 추가하세요:

<tabs group="build-system">
<tab title="Gradle" group-key="gradle">

```kotlin
kotlin {
    compilerOptions {
        freeCompilerArgs.add("-Xcollection-literals")
    }
}
```

</tab>
<tab title="Maven" group-key="maven">

```xml
<build>
    <plugins>
        <plugin>
            <groupId>org.jetbrains.kotlin</groupId>
            <artifactId>kotlin-maven-plugin</artifactId>
            <configuration>
                <args>
                    <arg>-Xcollection-literals</arg>
                </args>
            </configuration>
        </plugin>
    </plugins>
</build>
```

</tab>
</tabs>

자세한 내용은 해당 기능의 [KEEP](https://github.com/Kotlin/KEEP/blob/main/proposals/KEEP-0416-collection-literals.md)을 참조하세요.

### 컴파일 타임 상수 개선
<primary-label ref="experimental-opt-in"/>

<secondary-label ref="language"/>

Kotlin 2.4.0은 [컴파일 타임 상수(compile-time constants)](properties.md#compile-time-constants)에 실험적인 개선 사항을 가져와 숫자 및 문자열 타입 지원을 더욱 일관되고 사용하기 쉽게 만듭니다. 이러한 개선 사항에는 다음 지원이 포함됩니다:

* 부호 없는 타입 연산.
* `.lowercase()`, `.uppercase()`, `.trim()` 등 문자열을 위한 표준 라이브러리 함수.
* [열거형 상수(enum constants)](enum-classes.md#working-with-enum-constants)의 `.name` 프로퍼티 및 [`KCallable` 인터페이스](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.reflect/-k-callable/) 평가.

컴파일 타임에 평가되는 함수를 명확히 하기 위해 Kotlin 2.4.0은 `IntrinsicConstEvaluation` 어노테이션을 도입했습니다. 일부 함수는 컴파일 타임에 평가되지만 아직 어노테이션이 없을 수 있습니다. 향후 릴리스에서 나머지 함수들에도 어노테이션이 추가될 예정입니다. 지원되는 함수 목록은 KEEP [부록](https://github.com/Kotlin/KEEP/blob/main/proposals/KEEP-0444-improve-compile-time-constants.md#appendix)을 참조하세요.

이 기능은 [실험적(Experimental)](components-stability.md#stability-levels-explained) 단계입니다. 옵트인하려면 빌드 파일에 다음 컴파일러 옵션을 추가하세요:

<tabs group="build-system">
<tab title="Gradle" group-key="gradle">

```kotlin
kotlin {
    compilerOptions {
        freeCompilerArgs.add("-Xintrinsic-const-evaluation")
    }
}
```

</tab>
<tab title="Maven" group-key="maven">

```xml
<build>
    <plugins>
        <plugin>
            <groupId>org.jetbrains.kotlin</groupId>
            <artifactId>kotlin-maven-plugin</artifactId>
            <configuration>
                <args>
                    <arg>-Xintrinsic-const-evaluation</arg>
                </args>
            </configuration>
        </plugin>
    </plugins>
</build>
```

</tab>
</tabs>

자세한 내용은 해당 기능의 [KEEP](https://github.com/Kotlin/KEEP/blob/main/proposals/KEEP-0444-improve-compile-time-constants.md)을 참조하세요.

### 고차 함수에 대한 미사용 결과 확인 개선
<primary-label ref="experimental-opt-in"/>

<secondary-label ref="language"/>

Kotlin 2.4.0은 [미사용 반환 값 체커(unused return value checker)](unused-return-value-checker.md)를 개선하기 위해 새로운 실험적 `returnsResultOf()` 계약을 도입했습니다.

이 계약을 통해 체커는 무시할 수 있는 미사용 결과와 `let` 범위 함수와 같이 람다의 결과를 반환하는 고차 함수의 의미 있는 미사용 결과를 구분할 수 있습니다.

> Kotlin 계약은 [실험적(Experimental)](components-stability.md#stability-levels-explained)입니다. 계약이 있는 함수를 선언할 때 `@OptIn(ExperimentalContracts::class)` 어노테이션을 추가하여 옵트인하세요.
>
{style="warning"}

이 기능을 사용하려면 함수의 계약에 `returnsResultOf()`를 추가하세요:

```kotlin
import kotlin.contracts.ExperimentalContracts
import kotlin.contracts.contract

@OptIn(ExperimentalContracts::class)
inline fun <T, R> T.customLet(block: (T) -> R): R {
    contract {
        returnsResultOf(block)
    }
    return block(this)
}
```

다음은 널 허용 값과 함께 사용자 정의 `.customLet()` 함수를 사용하는 예시입니다:

```kotlin
fun handleNullablePackageName(packageName: String?, builder: StringBuilder) {
    // append() 함수의 반환 값은 무시할 수 있으므로
    // 체커가 경고를 보고하지 않습니다.
    packageName?.customLet { builder.append(it) }

    // 반환된 문자열이 사용되지 않으므로 체커가 경고를 보고합니다.
    packageName?.customLet { "kotlin.$it" }
}
```

미사용 반환 값 체커는 [실험적(Experimental)](components-stability.md#stability-levels-explained)이며, 미사용 반환 값을 보고하려면 활성화해야 합니다. 체커의 활성화 및 구성에 대한 자세한 내용은 [미사용 반환 값 체커](unused-return-value-checker.md#configure-the-unused-return-value-checker)를 참조하세요.

#### 활성화 방법 {id=how-to-enable-unused-return-value-checker}

`returnsResultOf()` 계약은 [실험적(Experimental)](components-stability.md#stability-levels-explained)입니다. 이를 사용하면 이전 버전의 Kotlin 컴파일러가 읽을 수 없는 프리릴리스 바이너리가 생성된다는 점에 유의하세요. 옵트인하려면 빌드 파일에 다음 컴파일러 옵션을 추가하세요:

<tabs group="build-system">
<tab title="Gradle" group-key="gradle">

```kotlin
// build.gradle(.kts)
kotlin {
    compilerOptions {
        freeCompilerArgs.add("-Xallow-returns-result-of")
    }
}
```

</tab> <tab title="Maven" group-key="maven">

```xml
<!-- pom.xml -->
<build>
    <plugins>
        <plugin>
            <groupId>org.jetbrains.kotlin</groupId>
            <artifactId>kotlin-maven-plugin</artifactId>
            <configuration>
                <args>
                    <arg>-Xallow-returns-result-of</arg>
                </args>
            </configuration>
        </plugin>
    </plugins>
</build>
```
</tab> 
</tabs>

### 선택적 파라미터에 대한 버전 기반 오버로드를 생성하는 새로운 `@IntroducedAt` 어노테이션
<primary-label ref="experimental-opt-in"/>

<secondary-label ref="language"/>

Kotlin 2.4.0은 공개 API에 새로운 선택적 파라미터를 추가할 때 바이너리 호환성을 유지하기 위한 `@IntroducedAt` 어노테이션을 도입했습니다.

이전에는 함수에 선택적 파라미터를 추가할 때 `@JvmOverloads`를 사용하는 경우가 많았는데, 이는 필요 이상의 오버로드를 생성할 수 있었습니다. 또는 바이너리 호환성을 유지하기 위해 이전 시그니처를 숨겨진 지원 중단 오버로드로 직접 유지해야 했습니다.

`@IntroducedAt` 어노테이션을 사용하면 새로 추가된 선택적 파라미터가 도입된 버전을 어노테이션으로 지정할 수 있습니다. 컴파일러는 이 정보를 사용하여 해당하는 숨겨진 오버로드를 자동으로 생성합니다.

이 어노테이션은 [실험적(Experimental)](components-stability.md#stability-levels-explained) 단계입니다. 옵트인하려면 `@OptIn(ExperimentalVersionOverloading::class)` 어노테이션을 사용하세요.

예시는 다음과 같습니다:

```kotlin
@OptIn(ExperimentalVersionOverloading::class)
fun Button(
    label: String = "",
    color: Color = DefaultColor,
    @IntroducedAt("1.1") borderColor: Color = DefaultBorderColor,
    @IntroducedAt("1.2") borderStyle: Style = DefaultBorderStyle,
    @IntroducedAt("1.2") borderWidth: Int = 1,
    onClick: () -> Unit
) {
    // 함수 본문
}
```

이 예시에서 컴파일러는 이전 버전의 `Button()` 함수에 대해 숨겨진 오버로드를 생성합니다.

`@IntroducedAt`과 `@JvmOverloads`는 모두 오버로드를 생성하므로 함께 사용하면 충돌하는 오버로드가 발생할 수 있습니다. 두 어노테이션을 모두 사용하는 경우 컴파일러가 경고를 보고합니다. 경고를 무시하면 컴파일러는 `@IntroducedAt` 어노테이션에서 생성된 오버로드에 우선순위를 둡니다.

## 표준 라이브러리

Kotlin 2.4.0은 공통 Kotlin 표준 라이브러리에서 UUID 지원을 안정화했습니다. 또한 JVM에서 부호 없는 정수를 `BigInteger`로 변환하는 새로운 확장 함수와 정렬 순서 확인 지원을 추가했습니다.

### 공통 Kotlin 표준 라이브러리의 안정적인 UUID API
<secondary-label ref="standard-library"/>

Kotlin 2.0.20에서 [UUID(범용 고유 식별자) 생성을 위한 클래스](whatsnew2020.md#support-for-uuids-in-the-common-kotlin-standard-library)와 Kotlin 및 Java UUID 간 변환 지원이 도입되었습니다. 이후 릴리스에서는 다음과 같은 지원을 점진적으로 추가하여 이 실험적 기능을 개선했습니다:

* [`<` 및 `>` 연산자를 사용한 UUID 비교](whatsnew2120.md#changes-in-uuid-parsing-formatting-and-comparability)
* [헥스-대시(hex-and-dash) 및 일반 텍스트 형식의 UUID 파싱](uuids.md#parse-uuids)
* [유효하지 않은 UUID 파싱 시 `null` 반환](whatsnew23.md#support-for-returning-null-when-parsing-invalid-uuids).

Kotlin 2.4.0에서 [`kotlin.uuid.Uuid` API](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.uuid/-uuid/)는 [안정(Stable)](components-stability.md#stability-levels-explained) 단계가 되었습니다. 유일한 예외는 [V4 및 V7 UUID 생성을 위한 함수](whatsnew23.md#support-for-generating-v7-uuids-for-specific-timestamps)로, 이는 여전히 [실험적(Experimental)](components-stability.md#stability-levels-explained) 단계이며 옵트인이 필요합니다.

UUID 작업 방법에 대한 자세한 내용은 [UUID](uuids.md)를 참조하세요.

### 정렬 순서 확인 지원
<secondary-label ref="standard-library"/>

Kotlin 2.4.0은 iterable, 배열, 시퀀스에서 정렬 순서를 확인하기 위한 새로운 확장 함수를 추가했습니다.

포함된 확장 함수는 다음과 같습니다:

* `.isSorted()`
* `.isSortedDescending()`
* `.isSortedWith(comparator)`
* `.isSortedBy(selector)`
* `.isSortedByDescending(selector)`

이러한 확장 함수를 사용하여 요소를 다시 정렬하거나 도우미 함수를 만들지 않고도 요소가 이미 정렬되어 있는지 확인할 수 있습니다. 요소가 지정된 순서대로 있거나 요소가 2개 미만인 경우 `true`를 반환하고, 그렇지 않으면 `false`를 반환합니다. 이 함수들은 순서가 어긋난 쌍을 발견하는 즉시 중단되므로 큰 입력에 대해서도 효율적입니다.

다음은 `.isSorted()` 및 `.isSortedBy()` 함수를 사용하여 정렬 순서를 확인하는 예시입니다:

```kotlin
data class User(val name: String, val age: Int)

fun main() {
    val numbers = listOf(1, 2, 3, 4)
    println(numbers.isSorted())
    // true

    val users = listOf(
        User("Alice", 24),
        User("Bob", 31),
        User("Charlie", 29),
    )
    println(users.isSortedBy(User::age))
    // false
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="2.4.0-Beta2" id="kotlin-2-4-0-check-sorted-order"}

### JVM에서 부호 없는 정수를 `BigInteger`로 변환하기 위한 새로운 API
<secondary-label ref="standard-library"/>

Kotlin 2.4.0은 JVM에서 `UInt.toBigInteger()` 및 `ULong.toBigInteger()` 확장 함수를 도입했습니다.

이전에는 `UInt` 및 `ULong` 값을 `BigInteger`로 변환하려면 문자열 기반의 우회 방식이나 사용자 정의 변환 로직이 필요했습니다. Kotlin 2.4.0부터는 `.toBigInteger()`를 사용하여 부호 없는 정수 값을 직접 `BigInteger`로 변환할 수 있습니다.

예시는 다음과 같습니다:

```kotlin
fun main() {
    //sampleStart
    val unsignedLong = Long.MAX_VALUE.toULong() + 1uL
    val unsignedInt = UInt.MAX_VALUE

    println(unsignedLong.toBigInteger())
    // 9223372036854775808

    println(unsignedInt.toBigInteger())
    // 4294967295
   //sampleEnd
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="2.4.0-Beta2" id="kotlin-2-4-0-convert-unsigned-int"}

### null 값과 누락된 키를 구분하기 위한 새로운 Map 폴백 함수
<primary-label ref="experimental-opt-in"/>

<secondary-label ref="standard-library"/>

Kotlin 2.4.0은 널 허용 값이 있는 맵을 위해 기존의 [`.getOrElse()`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.collections/get-or-else.html) 및 [`.getOrPut()`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.collections/get-or-put.html) [맵 확장 함수](map-operations.md)의 새로운 변형을 추가했습니다. 이러한 함수는 키에 대한 값을 검색하거나 폴백으로 기본값을 사용합니다. 널 허용 값이 있는 맵의 경우, 새로운 변형을 통해 저장된 `null` 값이 누락된 키처럼 동작할지 아니면 기존 값처럼 동작할지 선택할 수 있으며, 함수 이름에서 그 선택을 명확히 합니다.

새로운 확장 함수에는 다음이 포함됩니다:

* `.getOrElseIfNull(key, defaultValue)` 및 `.getOrPutIfNull(key, defaultValue)`: 키가 누락되었거나 `null` 값을 가진 경우 기본값을 반환하며, 기존의 `.getOrElse()` 및 `.getOrPut()` 함수와 유사하게 동작합니다.
* `.getOrElseIfMissing(key, defaultValue)` 및 `.getOrPutIfMissing(key, defaultValue)`: 맵에 지정된 키가 포함되어 있지 않은 경우에만 기본값을 반환합니다.

이 API들은 [실험적(Experimental)](components-stability.md#stability-levels-explained) 단계이며 `@OptIn(ExperimentalStdlibApi::class)` 어노테이션으로 옵트인이 필요합니다.

다음은 키가 `null` 값으로 존재할 때 `.getOrPutIfNull()`과 `.getOrPutIfMissing()`의 차이점을 보여주는 예시입니다:

```kotlin
@OptIn(ExperimentalStdlibApi::class)
fun main() {
    val mapForNull = mutableMapOf<String, String?>("user" to null)
    val mapForMissing = mutableMapOf<String, String?>("user" to null)

    // "user"가 null 값을 가지고 있으면 값을 교체합니다.
    mapForNull.getOrPutIfNull("user") { "default_user" }

    println(mapForNull)
    // {user=default_user}

    // "user"가 맵에 존재하므로 null 값을 유지합니다.
    mapForMissing.getOrPutIfMissing("user") { "default_user" }

    println(mapForMissing)
    // {user=null}
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="2.4.0" id="kotlin-2-4-0-getorput-diff"}

널 허용 값을 저장하는 캐시의 경우 `.getOrElseIfMissing()` 및 `.getOrPutIfMissing()` 함수를 사용할 수도 있습니다. 만약 `defaultValue`가 `null`을 반환하면 맵은 이를 저장하고 동일한 키에 대해 `defaultValue`를 다시 호출하지 않습니다.

예시는 다음과 같습니다:

```kotlin
data class Response(val body: String)

class Service {
    var queryCount = 0

    fun query(key: String): Response? {
        queryCount += 1
        return null
    }
}

//sampleStart
@OptIn(ExperimentalStdlibApi::class)
fun main() {
    val service = Service()
    val cache = mutableMapOf<String, Response?>()

    fun getCachedResponseOrQuery(key: String): Response? =
        cache.getOrPutIfMissing(key) { service.query(key) }

    // 캐시에 "user"가 없으므로 null을 저장합니다.
    getCachedResponseOrQuery("user")

    println(cache)
    // {user=null}

    // 캐시된 null을 사용하며 서비스를 다시 쿼리하지 않습니다.
    getCachedResponseOrQuery("user")

    println(service.queryCount)
    // 1
}
//sampleEnd
```
{kotlin-runnable="true" kotlin-min-compiler-version="2.4.0" id="kotlin-2-4-0-getorif-missing"}

[YouTrack](https://youtrack.jetbrains.com/issue/KT-67337)에서 여러분의 의견을 기다립니다.

## Kotlin/JVM

Kotlin 2.4.0은 새로운 Java 버전을 지원하고 메타데이터의 어노테이션을 기본적으로 활성화합니다.

### Java 26 지원
<secondary-label ref="jvm"/>

Kotlin 2.4.0부터 컴파일러는 Java 26 바이트코드를 포함하는 클래스를 생성할 수 있습니다.

### 메타데이터의 어노테이션 기본 활성화
<secondary-label ref="jvm"/>

Kotlin 2.2.0의 Kotlin 메타데이터 JVM 라이브러리에서 [Kotlin 메타데이터에 저장된 어노테이션을 읽기 위한 지원이 도입](whatsnew22.md#support-for-reading-and-writing-annotations-in-kotlin-metadata)되었습니다. 이 지원을 통해 Kotlin 컴파일러는 JVM 바이트코드와 함께 메타데이터에 어노테이션을 기록하여 Kotlin 메타데이터 JVM 라이브러리에서 액세스할 수 있도록 합니다. 결과적으로 어노테이션 프로세서 및 기타 도구는 리플렉션을 사용하거나 소스 코드를 수정하지 않고도 메타데이터 수준에서 이러한 어노테이션을 이해하고 조작할 수 있습니다.

Kotlin 2.4.0에서 이 지원은 기본적으로 활성화됩니다.

## Kotlin/Native

Kotlin 2.4.0부터 [Swift export가 Alpha 단계로 격상되었습니다](#swift-export-goes-alpha-with-improved-concurrency-support). 이번 릴리스에서는 [Swift 패키지 임포트](#swift-package-import) 지원, Xcode 26.4 지원, 메모리 소비 개선 및 가비지 컬렉션(GC) 개선 사항이 포함되었습니다.

### 가비지 컬렉터의 기본 동시 마킹(Concurrent marking)
<secondary-label ref="native"/>

Kotlin 2.0.20에서 Kotlin 팀은 CMS GC(Concurrent Mark and Sweep Garbage Collector)에 대한 [실험적 지원을 도입](whatsnew2020.md#concurrent-marking-in-garbage-collector)했습니다. 사용자 피드백을 처리하고 회귀 문제를 수정한 후, Kotlin 2.4.0부터 CMS를 기본적으로 활성화합니다.

이전의 기본 설정이었던 PMCS(Parallel Mark Concurrent Sweep) 가비지 컬렉터는 GC가 힙의 객체를 마킹하는 동안 애플리케이션 스레드를 일시 중지해야 했습니다. 반면, CMS는 마킹 단계를 애플리케이션 스레드와 동시에 실행할 수 있도록 합니다.

이는 GC 중지 시간을 대폭 단축하고 애플리케이션 응답성을 향상시키며, 특히 지연 시간에 민감한 애플리케이션의 성능에 중요합니다. CMS는 [Compose Multiplatform](https://blog.jetbrains.com/kotlin/2024/10/compose-multiplatform-1-7-0-released/#performance-improvements-on-ios)으로 구축된 UI 애플리케이션 벤치마크에서 이미 그 효과를 입증했습니다.

문제가 발생하는 경우 PMCS로 다시 전환할 수 있습니다. `gradle.properties` 파일에서 다음 [바이너리 옵션](native-binary-options.md)을 설정하세요:

```none
kotlin.native.binary.gc=pmcs
```

Kotlin/Native 가비지 컬렉터에 대한 자세한 내용은 [문서](native-memory-manager.md#garbage-collector)를 참조하세요.

### 비가상화 분석 중 메모리 소비 감소
<secondary-label ref="native"/>

이전에는 비가상화(devirtualization) 분석이 Kotlin/Native 컴파일러에서 가장 많은 메모리를 소비하는 단계 중 하나였습니다. 특히 링크 릴리스 태스크는 대규모 프로젝트에서 너무 많은 메모리를 소비했습니다.

Kotlin 2.4.0은 링크 릴리스 태스크 중 피크 메모리 소비를 줄이는 데 도움이 되는 개선 사항을 도입했습니다.

EAP 사용자의 벤치마크에 따르면, 개선된 비가상화 분석을 통해 링크 릴리스 태스크의 메모리 소비가 절반으로 줄어들어 최소 13GB를 절약했습니다.

### Xcode 26.4 지원
<secondary-label ref="native"/>

Kotlin 2.4.0부터 Kotlin/Native 컴파일러는 최신 안정 버전 중 하나인 Xcode 26.4를 지원합니다.

이제 Xcode를 업데이트하고 최신 API에 액세스하여 Apple 운영 체제용 Kotlin 프로젝트 작업을 계속할 수 있습니다.

### LLVM 버전 21로 업데이트
<secondary-label ref="native"/>

Kotlin 2.4.0에서 LLVM을 버전 19에서 21로 업데이트했습니다. 새 버전은 성능 개선을 포함하며 Kotlin/Native 컴파일러를 최신 상태로 유지하는 데 도움이 됩니다.

이 업데이트는 코드에 영향을 미치지 않아야 하지만, 문제가 발생하면 [이슈 트래커](http://kotl.in/issue)에 보고해 주세요.

### Apple 타겟 지원 변경 사항
<secondary-label ref="native"/>

Kotlin 2.4.0은 Apple 타겟의 기본 최소 지원 버전을 상향했습니다:

* iOS 및 tvOS: 14.0에서 15.0으로.
* macOS: 11.0에서 12.0으로.
* watchOS: 7.0에서 8.0으로.

프로젝트에서 기본값보다 낮은 버전을 지원해야 하는 경우 빌드 파일에서 `freeCompilerArgs` 옵션을 사용하세요:

```kotlin
kotlin {
    targets.withType<org.jetbrains.kotlin.gradle.plugin.mpp.KotlinNativeTarget>().configureEach {
        binaries.configureEach {
            freeCompilerArgs += "-Xoverride-konan-properties=minVersion.ios=14.0"
            freeCompilerArgs += "-Xoverride-konan-properties=minVersion.macos=11.0"
            freeCompilerArgs += "-Xoverride-konan-properties=minVersion.tvos=14.0"
            freeCompilerArgs += "-Xoverride-konan-properties=minVersion.watchos=7.0"
        }
    }
}
```

### Swift export가 Alpha 단계로 진입하며 동시성 지원 개선
<primary-label ref="alpha"/>

<secondary-label ref="native"/>

Kotlin 2.4.0부터 Swift export를 통한 Swift와의 상호운용성이 공식적으로 Alpha 단계가 되었습니다! 이번 릴리스는 동시성 지원에 큰 개선을 가져와 Swift export에 네이티브 및 직접적인 구조적 동시성을 추가하고 `kotlinx.coroutines` flow를 Swift로 내보낼 수 있는 기능을 추가했습니다.

#### 구조적 동시성 지원
이제 Swift에서 정지(suspending) Kotlin 코드를 원활하게 호출할 수 있습니다. Kotlin [정지 함수(suspend functions)](composing-suspending-functions.md) 및 정지 함수 타입은 Swift의 관용적인 `async` 대응물로 내보내집니다:

```kotlin
// Kotlin
suspend fun hello(): String {
    delay(1000)
    return "Hello Swift! This is Kotlin."
}
```

```swift
// Swift
let msg = try await hello()
```
#### Flow 타입을 Swift로 내보내기

이 업데이트는 `kotlinx.coroutines` flow를 Swift로 내보내는 지원도 추가합니다. `kotlinx.coroutines`의 Flow는 동시에 방출(emit)되고 소비(consume)될 수 있는 비동기 데이터 스트림을 나타냅니다. 이는 데이터베이스 업데이트, 네트워크 요청 또는 UI 이벤트를 수신하는 것과 같은 반응형 프로그래밍 패턴에 일반적으로 사용됩니다.

이전에는 [`kotlinx.coroutines.flow`](https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines.flow/-flow/)의 `Flow` 인터페이스를 Swift에 노출하는 유일한 방법은 서드파티 솔루션을 통하는 것이었습니다. 이제 추가 설정 없이 flow를 Swift의 관용적인 대응물인 [`AsyncSequence`](https://developer.apple.com/documentation/Swift/AsyncSequence)로 내보낼 수 있습니다.

이 기능은 기본적으로 활성화되어 있습니다. 타입 정보를 유지하면서 `Flow` 타입이 있는 모든 공개 API를 Swift로 내보낼 수 있습니다. 예를 들어:

```kotlin
// Kotlin
// Flow를 내보낼 때 String 타입이 유지됩니다.
fun flowOfStrings(): Flow<String> = flowOf("hello", "any", "world")
```

```Swift
// Swift
var actual: [String] = []

// Kotlin에서 String 타입이 올바르게 추론됩니다.
for try await element in flowOfStrings().asAsyncSequence() {
    actual.append(element)
}
```

Swift export에 대한 자세한 내용은 [문서](native-swift-export.md)를 참조하세요.

### Swift 패키지 임포트
<primary-label ref="experimental-general"/>

<secondary-label ref="native"/>

Kotlin Multiplatform 프로젝트는 이제 Gradle 구성에서 iOS 앱의 종속성으로 [Swift 패키지](https://docs.swift.org/swiftpm/documentation/packagemanagerdocs/)를 선언할 수 있습니다:

```kotlin
// build.gradle.kts
kotlin {
    swiftPMDependencies {
        swiftPackage(
            url = url("https://github.com/firebase/firebase-ios-sdk.git"),
            version = from("12.11.0"),
            products = listOf(
                product("FirebaseAI"),
                product("FirebaseAnalytics"),
                ...
}
```
{validate="false"}

작동하는 샘플과 자세한 정보는 [SwiftPM 임포트](https://kotlinlang.org/docs/multiplatform/multiplatform-spm-import.html)를 참조하세요.

프로젝트가 CocoaPods 종속성에 의존하는 경우, 현재 설정을 Swift 패키지를 사용하도록 마이그레이션할 수 있습니다. KMP 도구는 이 사용 사례를 고려하여 프로젝트를 자동으로 재구성하도록 도와줍니다. 자세한 내용은 [CocoaPods 마이그레이션 가이드](https://kotlinlang.org/docs/multiplatform/multiplatform-cocoapods-spm-migration.html)를 참조하세요.

## Kotlin/Wasm

Kotlin 2.4.0은 Kotlin/Wasm에 대한 증분 컴파일을 기본으로 활성화하고 WebAssembly Component Model 지원을 도입합니다.

### 증분 컴파일 기본 활성화
<secondary-label ref="wasm"/>

Kotlin/Wasm은 Kotlin 2.1.0에서 증분 컴파일(incremental compilation)을 도입했습니다. Kotlin 2.4.0부터는 [안정(Stable)](components-stability.md#stability-levels-explained) 단계가 되었으며 기본적으로 활성화됩니다. 이 기능을 사용하면 컴파일러가 최근 변경 사항의 영향을 받는 파일만 다시 빌드하므로 빌드 시간이 크게 단축됩니다.

증분 컴파일을 비활성화하려면 프로젝트의 `local.properties` 또는 `gradle.properties` 파일에 다음 라인을 추가하세요:

```none
# gradle.properties
kotlin.incremental.wasm=false
```

문제가 발생하면 [YouTrack](https://kotl.in/issue)에 보고해 주세요.

### Chrome DevTools의 내부 변수 표시 개선
<secondary-label ref="wasm"/>

Kotlin 2.4.0은 임시, 합성 및 내부 변수를 사용자 정의 변수와 더 쉽게 구분할 수 있도록 하여 Chrome DevTools에서 Kotlin/Wasm의 디버깅 경험을 개선합니다.

Kotlin 컴파일러 및 Compose와 같은 컴파일러 플러그인은 이러한 변수를 생성할 수 있습니다. 이제 이들은 기본적으로 `~` 접두사를 사용하므로 함께 그룹화되고 Chrome DevTools가 이름순으로 정렬하는 변수 목록의 끝으로 이동합니다.

### WebAssembly Component Model 지원
<primary-label ref="experimental-general"/>

<secondary-label ref="wasm"/>

Kotlin/Wasm은 Kotlin 2.4.0에서 [WebAssembly Component Model](https://component-model.bytecodealliance.org/)에 대한 실험적 지원을 도입하여 한 단계 더 나아갑니다. 이 제안은 표준화된 인터페이스와 타입을 통해 Wasm 모듈로부터 컴포넌트를 빌드하는 방법을 정의합니다. 이 접근 방식은 Wasm이 저수준 바이너리 명령 형식에서 재사용 가능하고 언어에 구애받지 않는 컴포넌트를 구성하기 위한 시스템으로 진화하도록 돕습니다. 이를 통해 Kotlin/Wasm이 브라우저를 넘어 확장될 수 있습니다. 예를 들어, Kotlin과 WebAssembly는 FaaS(Function-as-a-Service) 또는 서버리스(serverless) 애플리케이션에 매우 적합합니다.

이 기능을 시도해 보려면 [`wasi:http`로 구축된 간단한 서버](https://github.com/Kotlin/sample-wasi-http-kotlin/)를 확인해 보세요.

<img src="kotlin-wasm-wasi-http.gif" alt="WebAssembly Component Model을 사용한 Kotlin/Wasm" width="600"/>

[YouTrack](https://youtrack.jetbrains.com/issue/KT-64569/Kotlin-Wasm-Support-Component-Model)에서 의견을 공유해 주세요.

## Kotlin/JS

Kotlin 2.4.0은 값 클래스, 인터페이스 및 타입 변성(variance) 내보내기 지원, JS 코드 인라이닝 시 ES2015 기능 지원 등 JavaScript/TypeScript로의 내보내기를 더욱 개선했습니다.

### JavaScript/TypeScript로의 값 클래스 내보내기 지원
<secondary-label ref="js"/>

이전에는 일반 Kotlin 클래스만 JavaScript/TypeScript로 내보낼 수 있었습니다. Kotlin 2.4.0에서는 이 제한이 사라졌습니다. 이제 Kotlin의 [인라인 값 클래스(inline value classes)](inline-classes.md)를 일반 TypeScript 클래스로 내보낼 수 있습니다.

값 클래스를 내보내려면 Kotlin 측에서 `@JsExport` 어노테이션을 표시하세요:

```Kotlin
// Kotlin
@JsExport
@JvmInline
value class Email(val address: String) {
    init { require(address.contains("@")) { "Invalid email" } }
}

@JsExport
class AuthService {
    suspend fun login(email: Email): String = ...
}
```

TypeScript 측에서는 일반 클래스처럼 보입니다:

```TypeScript
// TypeScript
import { AuthService, Email } from "..."
const auth = new AuthService();

console.log(await auth.login(new Email("jane@example.com"))); 
// "Welcome, jane@example.com!"
console.log(await auth.login(new Email("not-an-email"))); 
// "Invalid email"
```

자세한 내용은 [`@JsExport` 어노테이션](js-to-kotlin-interop.md#jsexport-annotation)을 참조하세요.

### JS 코드 인라이닝 시 ES2015 기능 지원
<secondary-label ref="js"/>

Kotlin 2.4.0부터 JavaScript 코드 인라이닝은 [ES2015 기능](js-project-setup.md#support-for-es2015-features)을 완벽하게 지원합니다.

이는 서드파티 라이브러리와의 상호운용성뿐만 아니라 자동 애플리케이션 코드 생성에 대한 직접적인 제어에도 유용합니다.

이제 다음을 포함하여 [`js()`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.js/js.html) 호출 내에서 현대적인 JS 기능을 사용할 수 있습니다:

* `const` 및 `let` 변수 선언
* ES 클래스
* 제너레이터(Generators)
* 람다 ([화살표 함수](whatsnew21.md#support-for-generating-es2015-arrow-functions))
* 스프레드(Spread) 및 레스트(Rest) 연산자
* 템플릿 문자열

`js()` 함수의 파라미터는 컴파일 타임에 파싱되어 JavaScript 코드로 "있는 그대로" 번역되므로 문자열 상수여야 함을 기억하세요. 예를 들어 스프레드 연산자를 인라이닝하려면 다음과 같이 사용합니다:

```kotlin
fun spreadExample(): dynamic = js("""
    const add = (a, b, c) => a + b + c;

    const nums = [1, 2, 3];
    const sum = add(...nums);

    const a = [1, 2, 3];
    const b = [...a, 4, 5, 6];

    return { sum, b: b };
""")
```

JavaScript 코드 인라이닝에 대한 자세한 내용은 [문서](js-interop.md#inline-javascript)를 참조하세요.

### TypeScript로 내보낼 때 타입 변성 유지
<secondary-label ref="js"/>

이전에는 제네릭 위치에서의 Kotlin [변성(variance)](generics.md#variance) 정보가 TypeScript로 타입을 내보낼 때 손실되었습니다.

Kotlin 2.4.0부터는 내보내기 중에 변성 어노테이션이 보존되어 TypeScript의 [변성 어노테이션(variance annotations)](https://www.typescriptlang.org/docs/handbook/2/generics.html#variance-annotations)에 매핑됩니다.

Kotlin 코드에서 제네릭 타입 파라미터의 변성을 정의하세요:

```Kotlin
// Kotlin
// 'out'은 공변성(covariance)을 나타냅니다(인터페이스는 T를 생산하기만 함).
interface Producer<out T> {
    fun produce(): T
}

// 'in'은 반공변성(contravariance)을 나타냅니다(인터페이스는 T를 소비하기만 함).
interface Consumer<in T> {
    fun consume(item: T)
}
```

Kotlin 2.4.0에서는 생성된 TypeScript 출력에 `in` 및 `out` 키워드가 보존됩니다:

```TypeScript
// 생성된 .d.ts
export interface Producer<out T> {
    produce(): T;
}

export interface Consumer<in T> {
    consume(item: T): void;
}
```

### 인터페이스 내보내기 개선
<secondary-label ref="js"/>

Kotlin 2.4.0은 Kotlin 인터페이스를 JavaScript/TypeScript로 내보내는 것을 더욱 편리하게 만듭니다.

새로운 `@JsNoRuntime` 어노테이션은 이전에 Kotlin 인터페이스 구현을 위해 필요했던 메타데이터를 제거하여, 외부(external) 인터페이스가 기본적으로 작동하는 방식과 유사하게 일반 TypeScript 인터페이스로의 직접 매핑을 가능하게 합니다.

Kotlin 인터페이스를 내보내려면, 예를 들어 Kotlin Multiplatform 프로젝트의 경우 공통(common) 코드에서 `@JsNoRuntime` 어노테이션을 추가하세요:

```kotlin
// commonMain
import kotlin.js.JsNoRuntime

@JsNoRuntime
expect interface DataProcessor {
    fun process(data: String): Int 
}
```

그런 다음 JS 전용 소스 코드에서 실제 구현을 제공합니다:

```kotlin
// jsMain
@JsNoRuntime
actual interface DataProcessor {
    actual fun process(data: String)
} 
```

Kotlin 인터페이스 구현에 필요한 메타데이터가 제거되었으므로, 인터페이스는 일반 TypeScript 인터페이스로 매핑됩니다:

```TypeScript
// 생성된 .d.ts
export interface DataProcessor {
    process(data: string): void;
}
```

TypeScript가 Kotlin 인터페이스를 일반 TypeScript 인터페이스로 처리할 수 있도록 `@JsNoRuntime` 어노테이션은 표준 인터페이스에만 허용됩니다. 따라서 다음과 같은 작업은 금지됩니다:

* `is` 및 `as` 타입 확인.
* [`::class` 구문](js-reflection.md)을 사용한 클래스 참조.
* 인터페이스를 reified 타입 인자로 전달.

> 외부 인터페이스에 `@JsNoRuntime`을 추가하지 마세요. 컴파일러 경고가 발생합니다.
>
{type="note"}

### 인터페이스 내보내기 제한 해제
<primary-label ref="experimental-general"/>

<secondary-label ref="js"/>

Kotlin 2.4.0은 `@JsExport` 안정화를 향한 또 다른 단계를 밟으며 Kotlin 인터페이스가 내보내지는 방식을 개선했습니다.

이제 중첩 클래스 및 이름이 있는 컴패니언 객체가 포함된 Kotlin 인터페이스를 내보낼 수 있습니다:

```kotlin
@JsExport
interface Identity {
    class Metadata(val tag: String)

    companion object Registry {
        val defaultTag = "GUEST"
    }
}
```

자세한 내용은 [`@JsExport` 어노테이션](js-to-kotlin-interop.md#jsexport-annotation)을 참조하세요.

## Gradle

Kotlin 2.4.0은 Gradle 7.6.3부터 9.5.0까지 완벽하게 호환됩니다. 최신 Gradle 릴리스 버전까지 사용할 수도 있습니다. 그러나 이 경우 지원 중단 경고가 발생할 수 있으며 일부 새로운 Gradle 기능이 작동하지 않을 수 있습니다. 또한 Kotlin 2.4.0은 플랫폼 전반에 걸친 일관된 기본 모듈 이름과 Kotlin/JVM을 위한 Problems API로 작성된 컴파일러 메시지와 같은 개선 사항을 제공합니다.

### 최소 지원 AGP 버전 8.5.2로 상향
<secondary-label ref="gradle"/>

Kotlin 2.4.0부터 최소 지원 Android Gradle 플러그인(AGP) 버전은 8.5.2입니다.

### 플랫폼 전반의 일관된 모듈 이름
<secondary-label ref="gradle"/>

Kotlin 2.4.0 이전에는 기본 모듈 이름이 플랫폼마다 달랐습니다. 이러한 불일치는 이름 충돌 및 해결 문제를 일으킬 수 있었습니다. Kotlin 2.4.0은 모든 플랫폼에서 기본 이름을 `{group}:{project_name}`으로 표준화합니다.

JVM 모듈 이름을 이전 버전으로 되돌려야 하는 경우, Kotlin/JVM 프로젝트의 `build.gradle.kts` 파일에 다음을 추가하세요:

```kotlin
kotlin {
    compilerOptions.moduleName(project.name)
}
```

멀티플랫폼 프로젝트의 경우:

```kotlin
kotlin {
    jvm {
        compilerOptions.moduleName(project.name)
    }
}
```

### Kotlin/JVM을 위한 Problems API로 작성된 컴파일러 메시지
<secondary-label ref="gradle"/>

Kotlin 2.2.0에서 Kotlin Gradle 플러그인(KGP)은 Gradle CLI와 IntelliJ IDEA 모두에서 일관된 경험을 제공하기 위해 [Gradle의 Problems API](https://docs.gradle.org/current/userguide/reporting_problems.html)에 진단을 보고하기 시작했습니다.

Kotlin 2.4.0에서 플러그인은 Kotlin/JVM에 대한 컴파일러 메시지도 Problems API로 작성하여, 해당 API가 모든 로그와 메시지의 단일 소스가 되는 것에 한 걸음 더 다가갔습니다.

## Maven

Kotlin 2.4.0은 Maven Toolchains 지원 및 Java와 JVM 타겟 버전 간의 자동 정렬을 통해 프로젝트 구성을 더욱 쉽게 만듭니다.

### Java와 JVM 타겟 버전 간의 자동 정렬
<secondary-label ref="maven"/>

프로젝트 구성을 단순화하고 호환성 문제를 방지하기 위해, Kotlin Maven 플러그인은 이제 JVM 타겟 버전을 프로젝트에 구성된 Java 컴파일러 버전과 자동으로 정렬합니다.

이를 통해 Kotlin 및 Maven 컴파일러가 동일한 바이트코드 버전을 타겟팅하도록 보장하며, Kotlin이 생성한 바이트코드가 프로젝트의 나머지 부분이나 의도한 배포 환경과 호환되지 않는 문제를 방지합니다.

`<extensions>` 옵션을 활성화하면 `kotlin.compiler.jvmTarget` 또는 `kotlin.compiler.jdkRelease` 옵션을 설정할 필요가 없습니다. 둘 다 정의되지 않은 경우 Kotlin Maven 플러그인은 다음 순서로 JVM 타겟 버전을 자동으로 해결합니다:

1. 프로젝트 프로퍼티 또는 `maven-compiler-plugin` 구성 내에 정의된 `maven.compiler.release` 버전.

   이 경우 `jvmTarget` 및 `jdkRelease` 컴파일러 옵션이 모두 Kotlin 컴파일러에 설정되어 API를 특정 JDK 버전으로 제한합니다.

2. Maven 릴리스 버전이 설정되지 않은 경우 `maven.compiler.target` 버전. 컴파일러 타겟은 프로젝트 프로퍼티 또는 `maven-compiler-plugin` 구성 내에 정의될 수 있습니다.

   이 경우 Kotlin의 `jvmTarget`만 설정되며 API는 특정 JDK 버전으로 제한되지 않습니다.

이 기능은 Kotlin 프로젝트 구성을 크게 단순화하여 `pom.xml` 파일이 다음과 같이 보일 수 있습니다:

```xml
<properties>
    <maven.compiler.release>17</maven.compiler.release>
    <kotlin.version>%kotlinVersion%</kotlin.version>
</properties>

<build>
    <plugins>
        <plugin>
            <groupId>org.jetbrains.kotlin</groupId>
            <artifactId>kotlin-maven-plugin</artifactId>
            <version>${kotlin.version}</version>
            <extensions>true</extensions>
        </plugin>
    </plugins>
</build>
```

빌드 중에 플러그인은 다음과 유사한 메시지를 출력합니다:

```none
[INFO] Using jvmTarget=17 (derived from maven.compiler.release=17)
```

> `<extensions>` 옵션은 프로젝트 레벨 프로퍼티와 전역 `maven-compiler-plugin` 구성만 확인합니다. 플러그인의 `<executions>` 섹션에 정의된 구성은 확인하지 않습니다.
>
{style="note"}

자동 프로젝트 구성에 대한 자세한 내용은 [문서](maven-configure-project.md#jvm-target-version)를 참조하세요.

### Maven Toolchains 지원
<secondary-label ref="maven"/>

Kotlin 2.4.0은 Kotlin Maven 플러그인에 [Maven Toolchains](https://maven.apache.org/guides/mini/guide-using-toolchains.html) 지원을 도입했습니다.

이 기능은 빌드에서 JDK 버전을 관리하는 데 도움이 됩니다. Maven Toolchains를 사용하면 Maven을 실행하는 JVM 버전(`JAVA_HOME`에 설정됨)과 독립적으로 Kotlin 컴파일에 사용되는 JDK 버전을 지정할 수 있습니다. 빌드에 `maven-toolchains-plugin`이 구성되면 Kotlin Maven 플러그인은 Maven 컴파일러 플러그인 및 다른 Maven 플러그인과 동일한 방식으로 선택된 JDK 툴체인을 자동으로 선택합니다. 이를 통해 Kotlin 컴파일을 포함하여 빌드의 모든 플러그인에서 사용되는 JDK를 제어하는 단일 툴체인을 구성할 수 있습니다:

```xml
<plugin>
    <groupId>org.apache.maven.plugins</groupId>
    <artifactId>maven-toolchains-plugin</artifactId>
    <version>3.2.0</version>
    <executions>
        <execution>
            <goals>
                <goal>toolchain</goal>
            </goals>
        </execution>
    </executions>
    <configuration>
        <toolchains>
            <jdk>
                <version>21</version>
            </jdk>
        </toolchains>
    </configuration>
</plugin>
```
JDK 버전을 설정하는 다양한 방법의 우선순위를 명심하세요:

1. `kotlin-maven-plugin` 구성의 `jdkHome`. 명시적으로 설정된 `jdkHome` 옵션은 항상 툴체인 버전보다 우선합니다. 
2. `maven-toolchains-plugin`의 JDK 버전. Maven Toolchains를 통해 설정된 JDK 버전은 `JAVA_HOME` 경로에 설정된 JDK 버전보다 우선합니다.
3. `JAVA_HOME` 경로.

플러그인 전용 `<jdkToolchain>` 옵션을 사용하여 `kotlin-maven-plugin`의 툴체인에서 직접 JDK 버전을 설정할 수도 있습니다. `maven-toolchains-plugin`을 사용하는 것과 비교하여 이 파라미터는 Kotlin 컴파일에만 영향을 미치고 빌드의 다른 플러그인에는 영향을 미치지 않습니다.

> 현재 `maven-toolchains-plugin`을 특정 JDK 버전을 사용하도록 설정해도 `kotlin-maven-plugin`의 `kapt` 및 `test-kapt` 골(goal)에는 영향을 미치지 않습니다. 이를 해결하려면 `JAVA_HOME` 경로에 필요한 버전을 설정하세요. 자세한 내용은 [KT-79897](https://youtrack.jetbrains.com/issue/KT-79897)을 참조하세요.
>
{style="note"}

Kotlin Maven 프로젝트 구성에 대한 자세한 내용은 [문서](maven-configure-project.md)를 참조하세요.

## 빌드 도구 API

Kotlin 2.4.0은 빌드 도구 API(BTA)에 여러 개선 사항을 제공합니다. BTA는 다음과 같은 기능을 제공합니다:

* 대부분의 JVM 및 공통 컴파일러 옵션에 대해 새로운 타입 안전 추상화를 도입합니다. 이제 클라이언트 대신 BTA가 형식을 처리하므로 오류 위험이 줄어들고 추가적인 지원 레이어를 제공합니다. 이 변경 사항은 런타임 시 하위 호환성을 유지하지만 소스 호환성이 깨질 수 있습니다.
* 이제 다른 Kotlin 버전을 구성하거나 컴파일러 옵션을 변경하는 것과 같은 증분 컴파일에서의 비소스(non-source) 변경 사항을 추적할 수 있습니다. 빌드 시스템은 `BaseIncrementalCompilationConfiguration.TRACK_CONFIGURATION_INPUTS` 옵션을 통해 이 동작을 제어할 수 있습니다.
* `AbiValidationToolchain`을 통해 [바이너리 호환성 검증(binary compatibility validation)](gradle-binary-compatibility-validation.md)을 지원하여 다른 빌드 시스템이 이 기능을 더 쉽게 추가할 수 있도록 합니다.
* 빌드 시스템이 [`CompilerMessageRenderer`](https://github.com/JetBrains/kotlin/blob/2.4.0/compiler/build-tools/kotlin-build-tools-api/src/main/kotlin/org/jetbrains/kotlin/buildtools/api/CompilerMessageRenderer.kt) 인터페이스 및 [`JvmCompilationOperation` 빌더](https://github.com/JetBrains/kotlin/blob/2.4.0/compiler/build-tools/kotlin-build-tools-api/src/main/kotlin/org/jetbrains/kotlin/buildtools/api/jvm/operations/JvmCompilationOperation.kt#L59)를 통해 컴파일러 메시지가 표시되는 방식을 사용자 정의할 수 있는 새로운 기능을 도입합니다.
* [Kotlin 데몬(Kotlin daemon)](kotlin-daemon.md) 로깅 구성을 위한 새로운 옵션을 도입합니다:
  * `LOGS_PATH` — 데몬 로그 파일 디렉토리.
  * `LOGS_FILE_SIZE_LIMIT` — 최대 로그 파일 크기(바이트).
  * `LOGS_FILE_COUNT_LIMIT` — 보관할 로그 파일의 최대 개수.

  기본적으로 한도는 Kotlin 컴파일러 버전에 특정한 값으로 설정됩니다. 한도를 없애려면 빌드 도구에서 옵션을 `null`로 설정해야 합니다.

  빌드 시스템은 [실행 정책(execution policy)](https://github.com/JetBrains/kotlin/blob/2.4.0/compiler/build-tools/kotlin-build-tools-api/src/main/kotlin/org/jetbrains/kotlin/buildtools/api/ExecutionPolicy.kt)을 구성할 때 옵션을 설정할 수 있습니다:

  ```kotlin
  val executionPolicy = kotlinToolchains.daemonExecutionPolicy {
      set(ExecutionPolicy.WithDaemon.LOGS_PATH, Paths("/var/log/kotlin-daemon"))
      set(ExecutionPolicy.WithDaemon.LOGS_FILE_SIZE_LIMIT, 10_485_760L)
      set(ExecutionPolicy.WithDaemon.LOGS_FILE_COUNT_LIMIT, 10)
  }
  ```

## Kotlin 컴파일러

Kotlin 2.4.0은 `.klib` 컴파일 중에 동일한 모듈에 선언된 인라인 함수에 대해 더욱 일관된 동작을 포함합니다.

### klib 컴파일 중 일관된 모듈 내부 함수 인라이닝
<secondary-label ref="compiler"/>

이전에는 [함수 인라이닝(function inlining)](inline-functions.md)이 다른 Kotlin 플랫폼에서 일관되지 않게 작동했습니다. JetBrains 팀은 동일한 호환성 보장을 위해 모든 지원 플랫폼에서 이를 통합하기 위해 노력하고 있습니다.

Kotlin/JVM에서 함수 인라이닝은 컴파일 타임에 발생합니다. 따라서 Kotlin 소스가 Kotlin/JVM 컴파일러로 컴파일될 때, 인라인 함수의 본문이 호출 지점에 인라이닝되므로 결과 클래스 파일의 바이트코드에는 인라인 함수 호출이 없으며, 컴파일 중에 동작이 고정됩니다.

반대로 Kotlin/Native, Kotlin/JS 및 Kotlin/Wasm에서는 소스-대-klib 컴파일 중에 함수 인라이닝이 발생하지 않고 바이너리 생성 중에만 발생했습니다. 그 결과 인라인 함수의 동작이 `.klib` 컴파일 중에 고정되지 않았으며, `.klib` 라이브러리는 Kotlin/JVM과 동일한 인라인 함수에 대한 호환성 보장을 제공하지 않았습니다.

Kotlin 2.4.0은 `.klib` 아티팩트를 생성할 때 모듈 내부(intra-module) 인라이닝을 활성화하여 인라인 함수의 동작을 통합하는 첫 번째 단계를 밟았습니다:

```kotlin
// 기존 logging.klib 라이브러리
inline fun logDebug(message: String) {
    println("[DEBUG] $message")
}
```

```kotlin
// 현재 컴파일 중인 App 모듈
inline fun greetUser(name: String) {
    println("Hello, $name!")
}

fun main() {
    logDebug("App started") // 인라이닝되지 않음: 다른 모듈에 선언됨
    greetUser("Alice")      // 인라이닝됨: 동일한 모듈에 선언됨
}
```

`.klib`으로 컴파일될 때 코드는 다음과 같이 보입니다:

```kotlin
// 의사코드(Pseudocode)
fun main() {
    logDebug("App started")  // 인라이닝되지 않음, 다른 모듈에 선언됨
    val tmp0 = "Alice"
    println("Hello, $tmp0!") // greetUser()로부터 인라이닝됨
}
```

이는 동일한 모듈에 선언된 인라인 함수만 `.klib` 컴파일 중에 인라이닝됨을 의미합니다. 다른 함수들은 플랫폼별 바이너리 생성 중에 인라이닝됩니다.

#### 활성화 방법 {id=how-to-enable-intra-module-inlining}

2.4.0부터 모듈 내부 인라이닝은 Kotlin/Native, Kotlin/JS 및 Kotlin/Wasm에 대해 기본적으로 활성화됩니다.

이 기능과 관련하여 예기치 않은 문제가 발생하면 커맨드 라인에서 다음 컴파일러 옵션을 사용하여 비활성화할 수 있습니다:

```bash
-Xklib-ir-inliner=disabled
```

다음 단계는 프로젝트의 모든 인라인 함수가 일관되게 인라이닝되도록 보장하는 모듈 간(cross-module) 인라이닝을 활성화하는 것입니다. 이 변경 사항은 향후 Kotlin 릴리스로 예정되어 있지만, 커맨드 라인에서 다음 컴파일러 옵션을 사용하여 이미 시도해 볼 수 있습니다:

```bash
-Xklib-ir-inliner=full
```

피드백을 공유하고 문제를 [YouTrack](https://kotl.in/issue)에 보고해 주세요.

### Kotlin 컴파일러 전반의 일관된 부분 라이브러리 연결
<secondary-label ref="compiler"/>

Kotlin 1.9.0에서 부분 라이브러리 연결(partial library linkage)은 Kotlin/Native 및 Kotlin/JS 컴파일러 모두에서 기본적으로 활성화되었으며, Kotlin/Wasm은 Kotlin 2.0.0에서 그 뒤를 따랐습니다. 이 기능은 컴파일러가 Kotlin 라이브러리의 연결 문제를 Kotlin/JVM과 일관되게 처리하도록 만듭니다.

그 이후로 부정적인 피드백을 받지 못했고 프로젝트에서 부분 연결을 비활성화하는 사용자도 보지 못했습니다. 따라서 Kotlin 2.4.0부터 부분 연결은 항상 활성화되며, `-Xpartial-linkage` 컴파일러 옵션은 이제 지원 중단(deprecated)되었습니다.

모든 Kotlin 컴파일러의 기본 로그 레벨은 `SILENT`입니다. 연결 문제는 컴파일 중에 보고되지 않습니다. 이 동작을 변경하려면 빌드 파일에서 `-Xpartial-linkage-loglevel` 컴파일러 옵션을 설정하세요:

```kotlin
// build.gradle.kts
kotlin {
    macosX64("native") {
        binaries.executable()
        
        compilations.configureEach {
            compilerOptions.configure {
                // 연결 문제를 “info” 로그 레벨로 보고하려면:
                freeCompilerArgs.add("-Xpartial-linkage-loglevel=INFO")

                // 이슈를 오류로 보고하려면:
                freeCompilerArgs.add("-Xpartial-linkage-loglevel=ERROR")
            }
        }
    }
}
```
{validate="false"}

* `INFO`: 연결 문제를 "info" 로그 레벨로 보고합니다.
* `WARNING`: 컴파일 타임에 경고를 보고하고 컴파일 로그에 기록합니다.
* `ERROR`: 연결 문제가 있는 경우 컴파일을 실패하게 하고 컴파일 로그에 오류를 보고합니다. 이 옵션을 사용하여 연결 문제를 더 자세히 조사하세요.

이 기능에 문제가 발생하면 [이슈 트래커](https://kotl.in/issue)에 보고해 주세요.

## Kotlin 컴파일러 플러그인

Kotlin 2.4.0에서는 Kotlin의 컴파일러 플러그인에도 주목할 만한 업데이트가 있었습니다. kapt 플러그인은 이제 컴파일 클래스패스에서 불필요한 어노테이션 프로세서를 제외할 수 있으며, Power-assert 플러그인은 새로운 런타임 라이브러리를 통해 단순화된 구성을 제공합니다.

### kapt: 컴파일 클래스패스에서 어노테이션 프로세서 제외

Kotlin 2.4.0은 Kotlin Gradle 플러그인과 유사하게 어노테이션 프로세서 검색을 위한 `includeCompileClasspath` 구성 옵션 지원을 추가합니다. 새로운 옵션을 사용하면 컴파일 클래스패스에서 불필요한 어노테이션 프로세서를 제외할 수 있습니다.

빌드 파일에서 이를 구성하려면 kapt 플러그인의 `<execution>` 섹션에서 `includeCompileClasspath` 옵션을 `false`로 설정하세요:

```xml
<execution>
    <id>kapt</id>
        <goals><goal>kapt</goal></goals>
        <configuration>
            <!-- 새로운 옵션 추가 -->
            <includeCompileClasspath>false</includeCompileClasspath> 
            <sourceDirs>...</sourceDirs>
            <annotationProcessorPaths>...</annotationProcessorPaths>
        </configuration>
</execution>
```

또는 `<properties>` 섹션에서 `kapt.include.compile.classpath`를 사용하여 동일하게 설정할 수 있습니다:

```xml
<properties>
    <kapt.include.compile.classpath>false</kapt.include.compile.classpath>
</properties>
```

옵션이 `false`로 설정되면 kapt 구성의 `<annotationProcessorPaths>` 섹션에 포함되지 않은 어노테이션 프로세서는 kapt 프로세싱에서 제외됩니다.

`includeCompileClasspath`가 설정되지 않았고 kapt가 `<annotationProcessorPaths>` 섹션에 명시적으로 정의되지 않은 어노테이션 프로세서를 컴파일 클래스패스에서 감지하면 다음 지원 중단 경고가 표시됩니다:

```text
[WARNING] Annotation processors discovery from compile classpath is deprecated. Set 'kapt.include.compile.classpath=false' to disable discovery.
```

kapt 구성에 대한 자세한 내용은 [문서](kapt.md)를 참조하세요.

### Power-assert: 새로운 런타임 라이브러리

Kotlin 2.4.0은 새로운 런타임 라이브러리를 통해 Power-assert 가능 함수를 더 쉽게 발견하고 구성할 수 있도록 합니다.

이전에는 Power-assert를 채택하려면 복잡한 빌드 구성과 함수 파라미터 규칙이 필요했습니다. 이번 릴리스부터 Power-assert 가능 함수는 새로운 런타임 라이브러리를 사용하여 컴파일러 플러그인 변환과 직접 통합될 수 있습니다.

이는 플러그인 사용자와 라이브러리 작성자 모두에게 큰 개선을 가져옵니다:

* 새로운 `CallExplanation` 데이터 구조는 호출 지점에 대한 자세한 정보를 제공합니다. 이를 통해 어설션 실패에 대한 더욱 동적인 다이어그램 렌더링과 외부 도구와의 더 나은 통합이 가능해집니다.
* 새로운 `@PowerAssert` 어노테이션은 컴파일러 플러그인이 어설션 함수를 즉시 발견할 수 있도록 합니다. 이를 통해 이제 라이브러리에 Power-assert 지원을 즉시 추가할 수 있습니다.

> 새로운 기능을 실험하기 위한 놀이터로 [예제 컬렉션](https://github.com/bnorm/power-assert-examples#power-assert-examples)을 사용해 보세요.
>
{style="tip"}

자세한 내용은 [문서](power-assert.md#use-the-power-assert-plugin)를 참조하세요.

## Compose 컴파일러

Kotlin 2.4.0을 통해 Compose 컴파일러는 더욱 일관된 증분 컴파일을 제공하며 몇 가지 기능 플래그의 지원 중단 주기를 진행합니다.

### 내부 선언에 대한 일관된 증분 컴파일
<secondary-label ref="compose-compiler"/>

Starting from Kotlin 2.4.0, the Compose compiler offers more consistent incremental compilation. Stability of internal types across different files is now inferred during runtime. This allows Compose to update inferred stability values even when class usages are not recompiled.

부작용으로, `@Composable` 함수가 다른 파일의 `internal` 클래스를 파라미터로 사용할 때마다 아티팩트의 크기가 커질 수 있습니다. 이는 안정성이 런타임 중에 결정되어야 하므로 컴파일러가 안정적(stable)인 경우와 불안정적(unstable)인 경우 모두에 대한 실행 경로를 인코딩하기 때문입니다. 이러한 런타임 안정성의 오버헤드는 전체 앱 최적화를 수행하는 미니파이어(R8 등)에 의해 제거됩니다. 미니파이어는 불필요한 실행 경로를 추론하고 제거할 수 있기 때문입니다.

이 업데이트는 최종 안정성 값을 변경하지 않으므로 `@Composable` 함수의 동작은 그대로 유지됩니다.

### 기능 플래그 지원 중단
<secondary-label ref="compose-compiler"/>

Kotlin 2.4.0은 안정화되어 이제 기본적으로 활성화된 실험적 기능 플래그의 지원 중단 주기를 진행합니다:

* `StrongSkipping`, `IntrinsicRemember` 및 관련 DSL 프로퍼티가 `DeprecationLevel.ERROR`로 상향되었습니다. 이들은 Kotlin 2.5.0에서 제거될 예정입니다.
* `OptimizeNonSkippingGroups` 및 `PausableComposition`이 이제 지원 중단되었습니다. 이들은 Kotlin 2.6.0에서 제거될 예정입니다.

## 주요 변경 사항 및 지원 중단

이 섹션은 중요한 주요 변경 사항 및 지원 중단을 강조합니다. 전체 개요는 [호환성 가이드](compatibility-guide-24.md)를 참조하세요.

* Kotlin 2.4.0부터 컴파일러는 더 이상 `-language-version=1.9`를 지원하지 않습니다. 결과적으로 K1 컴파일러는 더 이상 지원되지 않습니다.
* Kotlin 2.4.0은 Kotlin Gradle 플러그인에서 바이너리 호환성 검증을 위한 DSL을 간소화하고 일부 부분을 지원 중단합니다. 최신 DSL은 [Kotlin Gradle 플러그인의 바이너리 호환성 검증](gradle-binary-compatibility-validation.md)을 참조하세요.
* [`KotlinScriptMojo` Maven 플러그인을 통한 Kotlin 스크립트 실행 지원이 제거되었습니다](compatibility-guide-22.md#deprecations-to-kotlin-scripting).

## 문서 업데이트
Kotlin 생태계에서 다음과 같은 문서 변경 사항이 있었습니다:

* [Compose Multiplatform 앱의 Liquid Glass](https://kotlinlang.org/docs/multiplatform/ios-liquid-glass.html) – iOS 앱을 완전 Compose 기반 내비게이션에서 iOS 26 Liquid Glass 스타일링이 적용된 네이티브 SwiftUI 내비게이션으로 마이그레이션합니다.
* [KMP 모듈에 종속성으로 Swift 패키지 추가](https://kotlinlang.org/docs/multiplatform/multiplatform-spm-import.html) – KMP 프로젝트에서 SwiftPM 종속성을 설정하는 방법을 알아봅니다.
* [Kotlin Multiplatform 프로젝트를 CocoaPods에서 SwiftPM 종속성으로 전환](https://kotlinlang.org/docs/multiplatform/multiplatform-cocoapods-spm-migration.html) (수동 또는 [Junie 사용](https://kotlinlang.org/docs/multiplatform/multiplatform-cocoapods-spm-migration-ai.html)) – Junie 및 Kotlin AI 스킬을 사용하여 마이그레이션을 쉽게 만드는 방법을 알아봅니다.
* [KMP 앱을 위한 TeamCity 구성](https://kotlinlang.org/docs/multiplatform/configure-teamcity-for-kmp.html) – TeamCity를 사용하여 KMP 애플리케이션을 빌드, 테스트 및 배포합니다.
* [Navigation 3를 위한 권장 직렬화 접근 방식](https://kotlinlang.org/docs/multiplatform/compose-navigation-3.html#recommended-serialization-approaches) – CMP 애플리케이션의 Navigation 3에서 직렬화를 사용하는 가장 좋은 방법을 찾습니다.
* [멀티플랫폼 ViewModel](https://kotlinlang.org/docs/multiplatform/compose-viewmodel.html) – 멀티플랫폼 프로젝트에서 ViewModel을 설정하고 작업하는 방법을 알아봅니다.
* [Kotlin을 사용한 백엔드 개발](server-overview.md) – 백엔드 개발에 사용할 수 있는 다양한 프레임워크를 살펴봅니다.
* [Spring Boot와 Claude를 사용하여 작업 관리자 앱 만들기](spring-boot-claude.md) – Learn how Claude can help you create an app with Spring Boot from scratch.
* [Maven 프로젝트 구성](maven-configure-project.md) – 기존 Java Maven 프로젝트 또는 새로운 Kotlin Maven 프로젝트에서 Kotlin 컴파일을 설정합니다.
* [Maven으로 Kotlin 프로젝트 테스트](jvm-test-maven.md) – Learn how to create tests with JUnit and use Maven plugins to run unit and integration tests.
* [Kotlin 프로젝트에서 어노테이션 프로세서 사용](jvm-annotation-processors.md) – 백엔드 프로젝트에서 어노테이션을 처리하기 위해 kapt와 KSP 중 선택합니다.
* [Kotlin AI 스킬](kotlin-ai-skills.md) – Kotlin 전용 작업을 수행하는 데 도움이 되는 에이전트 스킬을 사용합니다.
* [Kotlin Language Server](kotlin-lsp.md) – Kotlin을 위한 JetBrains의 공식 Language Server Protocol(LSP) 구현에 대해 읽어보세요.
* [숫자(Numbers)](numbers.md) – Kotlin의 숫자 타입과 작업 방법을 살펴봅니다.
* [KSP 시작하기](ksp-quickstart.md) – 프로젝트에 KSP 기반 프로세서를 추가하거나 직접 만드는 방법을 알아봅니다.
* [kapt에서 KSP로 마이그레이션](ksp-kapt-migration.md) – Kotlin 기능을 최대한 활용하기 위해 어노테이션 프로세서를 마이그레이션합니다.
* [Lincheck 개요](lincheck-guide.md) – JVM에서 동시성 코드를 테스트하기 위해 Lincheck가 배후에서 어떻게 작동하는지 이해합니다.
* [Lincheck 시작하기](lincheck-getting-started.md) – 프로젝트를 생성하고 Lincheck로 테스트를 실행합니다.
* [Lincheck으로 임의의 코드 테스트](lincheck-testing-arbitrary-code.md) – Learn how to test concurrent code with Lincheck.
* [Lincheck으로 데이터 구조를 테스트하는 방법](lincheck-how-to-test-data-structures.md) – Dive into Lincheck's data structure testing process.
* [Lincheck을 사용한 테스트 전략](lincheck-testing-strategies.md) – Learn about Lincheck's testing strategies: model checking and stress testing.
* [Lincheck으로 테스트 전략 구성](lincheck-testing-strategies-options.md) – Explore the different options for Lincheck's testing strategies.
* [Dokku를 사용하여 Ktor 애플리케이션 배포](https://ktor.io/docs/dokku.html) – Learn about the deployment workflow with Dokku.