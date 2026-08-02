[//]: # (title: Kotlin 2.3.0의 새로운 기능)

<web-summary>새로운 언어 기능, Kotlin Multiplatform, JVM, Native, JS, Wasm에 대한 업데이트, 그리고 Gradle 및 Maven 빌드 도구 지원을 포함하는 Kotlin 2.3.0 릴리스 노트를 읽어보세요.</web-summary>

_[출시일: 2025년 12월 16일](releases.md#release-history)_

<tldr>
    <p>버그 수정 릴리스 2.3.10에 대한 자세한 내용은 <a href="https://github.com/JetBrains/kotlin/releases/tag/v2.3.10">변경 로그(changelog)</a>를 참조하세요.</p>
</tldr>

Kotlin 2.3.0이 출시되었습니다! 주요 하이라이트는 다음과 같습니다.

* **언어(Language)**: [더 많은 기능의 안정화 및 기본 활성화, 사용되지 않는 반환 값 체커, 명시적 뒷받침하는 필드(explicit backing fields), 문맥 민감 해소(context-sensitive resolution)의 변경 사항](#language).
* **Kotlin/JVM**: [Java 25 지원](#kotlin-jvm-support-for-java-25).
* **Kotlin/Native**: [Swift 내보내기(export)를 통한 상호운용성 개선, 릴리스 태스크의 빌드 시간 단축, C 및 Objective-C 라이브러리 임포트 베타(Beta) 진입](#kotlin-native).
* **Kotlin/Wasm**: [완전한 정규화된 이름(FQN) 및 새로운 예외 처리 제안 기본 활성화, Latin-1 문자를 위한 새로운 압축 저장 방식](#kotlin-wasm).
* **Kotlin/JS**: [새로운 실험적 중단 함수(suspend function) 내보내기, `LongArray` 표현 방식 변경, 통합된 동반 객체(companion object) 접근 등](#kotlin-js).
* **Gradle**: [Gradle 9.0과의 호환성 및 생성된 소스 등록을 위한 새로운 API](#gradle).
* **Compose 컴파일러**: [미니파이된(minified) Android 애플리케이션을 위한 스택 트레이스](#compose-compiler-stack-traces-for-minified-android-applications).
* **표준 라이브러리**: [시간 추적 기능 안정화 및 UUID 생성과 파싱 개선](#standard-library).

이 비디오에서 업데이트 개요를 확인할 수도 있습니다.

<video src="https://www.youtube.com/v/_6PSSkqwbp8" title="Hands-on with Kotlin 2.3"/>

> Kotlin 릴리스 주기에 대한 정보는 [Kotlin 릴리스 프로세스](releases.md)를 참조하세요.
> 
{style="tip"}

## IDE 지원

Kotlin 2.3.0을 지원하는 Kotlin 플러그인은 최신 버전의 IntelliJ IDEA 및 Android Studio에 포함되어 있습니다.
IDE에서 Kotlin 플러그인을 별도로 업데이트할 필요는 없습니다.
빌드 스크립트에서 [Kotlin 버전을 2.3.0으로 변경](releases.md#update-to-a-new-kotlin-version)하기만 하면 됩니다.

자세한 내용은 [새 릴리스로 업데이트](releases.md#update-to-a-new-kotlin-version)를 참조하세요.

## 언어(Language)

Kotlin 2.3.0은 기능 안정화에 중점을 두었으며, 사용되지 않는 반환 값을 감지하는 새로운 메커니즘을 도입하고 문맥 민감 해소(context-sensitive resolution)를 개선했습니다.

### 안정화된 기능

이전 Kotlin 릴리스에서 실험적(Experimental) 및 베타(Beta)로 도입되었던 몇 가지 언어 기능이 Kotlin 2.3.0에서 [안정화(Stable)](components-stability.md#stability-levels-explained) 단계로 승격되었습니다.

* [중첩된 타입 별칭(type alias) 지원](whatsnew22.md#support-for-nested-type-aliases)
* [데이터 흐름 기반의 `when` 표현식 완전성 검사(exhaustiveness checks)](whatsnew2220.md#data-flow-based-exhaustiveness-checks-for-when-expressions)

### 기본으로 활성화된 기능

Kotlin 2.3.0에서는 [명시적 반환 타입이 있는 표현식 본문의 `return` 문](whatsnew2220.md#support-for-return-statements-in-expression-bodies-with-explicit-return-types) 지원이 기본적으로 활성화됩니다.

[전체 Kotlin 언어 기능 및 제안 목록 보기](kotlin-language-features-and-proposals.md).

### 사용되지 않는 반환 값 체커(Unused return value checker)
<primary-label ref="experimental-general"/>

Kotlin 2.3.0은 무시된 결과를 방지하는 데 도움이 되는 '사용되지 않는 반환 값 체커'를 도입했습니다.
표현식이 `Unit` 또는 `Nothing` 이외의 값을 반환하지만 함수로 전달되지 않거나, 조건문에서 검사되지 않거나, 그 외 다른 방식으로 사용되지 않을 때 경고를 표시합니다.

이 체커는 함수 호출이 의미 있는 결과를 생성하지만 자동으로 버려지는 버그를 잡는 데 도움을 주며, 이는 예상치 못한 동작이나 추적하기 어려운 문제로 이어질 수 있습니다.

> 이 체커는 `++` 및 `--`와 같은 증감 연산에서 반환된 값은 무시합니다.
>
{style="note"}

다음 예시를 살펴보세요.

```kotlin
fun formatGreeting(name: String): String {
    if (name.isBlank()) return "Hello, anonymous user!"
    if (!name.contains(' ')) {
        // 체커가 이 결과가 무시되었다는 경고를 보고합니다.
        "Hello, " + name.replaceFirstChar(Char::titlecase) + "!"
    }
    val (first, last) = name.split(' ')
    return "Hello, $first! Or should I call you Dr. $last?"
}
```

이 예시에서는 문자열이 생성되었지만 전혀 사용되지 않으므로, 체커가 이를 무시된 결과로 보고합니다.

이 기능은 [실험적(Experimental)](components-stability.md#stability-levels-explained)입니다. 사용하려면 빌드 파일에 다음 컴파일러 옵션을 추가하세요.

<tabs group="build-system">
<tab title="Gradle" group-key="gradle">

```kotlin
kotlin {
    compilerOptions {
        freeCompilerArgs.add("-Xreturn-value-checker=check")
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
                    <arg>-Xreturn-value-checker=check</arg>
                </args>
            </configuration>
        </plugin>
    </plugins>
</build>
```

</tab>
</tabs>

이 옵션을 사용하면 체커는 Kotlin 표준 라이브러리의 대부분의 함수와 같이 표시된 표현식에서 무시된 결과만 보고합니다.

여러분의 함수를 표시하려면, `@MustUseReturnValues` 어노테이션을 사용하여 체커가 무시된 반환 값을 보고하도록 하려는 범위를 지정하세요.

예를 들어, 파일 전체를 표시할 수 있습니다.

```kotlin
// 이 파일의 모든 함수와 클래스를 표시하여 체커가 사용되지 않은 반환 값을 보고하도록 합니다.
@file:MustUseReturnValues

package my.project

fun someFunction(): String
```

또는 특정 클래스를 표시할 수 있습니다.

```kotlin
// 이 클래스의 모든 함수를 표시하여 체커가 사용되지 않은 반환 값을 보고하도록 합니다.
@MustUseReturnValues
class Greeter {
    fun greet(name: String): String = "Hello, $name"
}

fun someFunction(): Int = ...
```
{validate="false"}

빌드 파일에 다음 컴파일러 옵션을 추가하여 프로젝트 전체를 표시할 수도 있습니다.

<tabs group="build-system">
<tab title="Gradle" group-key="gradle">

```kotlin
kotlin {
    compilerOptions {
        freeCompilerArgs.add("-Xreturn-value-checker=full")
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
                    <arg>-Xreturn-value-checker=full</arg>
                </args>
            </configuration>
        </plugin>
    </plugins>
</build>
```

</tab>
</tabs>

이 설정을 사용하면 Kotlin은 컴파일된 파일이 마치 `@MustUseReturnValues`로 어노테이션된 것처럼 자동으로 처리하며, 체커는 프로젝트 함수의 모든 반환 값에 대해 보고합니다.

특정 함수에 `@IgnorableReturnValue` 어노테이션을 표시하여 경고를 억제할 수 있습니다.
`MutableList.add`와 같이 반환 값을 무시하는 것이 일반적이고 예상되는 함수에 어노테이션을 추가하세요.

```kotlin
@IgnorableReturnValue
fun <T> MutableList<T>.addAndIgnoreResult(element: T): Boolean {
    return add(element)
}
```

함수 자체를 무시 가능(ignorable)으로 표시하지 않고도 경고를 억제할 수 있습니다.
이를 위해 결과를 언더스코어(`_`)가 있는 특수한 이름 없는 변수에 할당하세요.

```kotlin
// 무시 불가능한 함수
fun computeValue(): Int = 42

fun main() {
    // 경고 보고: 결과가 무시됨
    computeValue()

    // 특수한 사용되지 않는 변수를 사용하여 이 호출 지점에서만 경고를 억제함
    val _ = computeValue()
}
```

자세한 내용은 해당 기능의 [KEEP](https://github.com/Kotlin/KEEP/blob/main/proposals/KEEP-0412-unused-return-value-checker.md)을 참조하세요.

[YouTrack](https://youtrack.jetbrains.com/issue/KT-12719)에 피드백을 남겨주시면 감사하겠습니다.

### 명시적 뒷받침하는 필드(Explicit backing fields)
<primary-label ref="experimental-opt-in"/>

Kotlin 2.3.0은 명시적 뒷받침하는 필드(explicit backing fields)를 도입했습니다. 이는 기존의 암시적 뒷받침하는 필드와 대조적으로 프로퍼티의 값을 보유하는 기본 필드를 명시적으로 선언하기 위한 새로운 구문입니다.

이 기능에 대한 개요는 다음 비디오에서 확인할 수 있습니다.

<video src="https://www.youtube.com/v/PU-VdH8HhVA" title="Explicit Backing Fields are experimental in Kotlin 2.3"/>

새로운 명시적 구문은 프로퍼티의 내부 타입이 노출된 API 타입과 다른 일반적인 뒷받침하는 프로퍼티 패턴을 단순화합니다. 예를 들어, `ArrayList`를 사용하면서 외부에는 읽기 전용 `List` 또는 `MutableList`로 노출하고 싶을 때가 있습니다. 이전에는 이를 위해 추가적인 비공개(private) 프로퍼티가 필요했습니다.

명시적 뒷받침하는 필드를 사용하면 `field`의 구현 타입이 프로퍼티 범위 내에서 직접 정의됩니다. 따라서 별도의 비공개 프로퍼티가 필요하지 않으며, 컴파일러가 동일한 비공개 범위 내에서 뒷받침하는 필드의 타입으로 스마트 캐스트를 자동으로 수행할 수 있게 됩니다.

이전:

```kotlin
private val _city = MutableStateFlow<String>("")
val city: StateFlow<String> get() = _city

fun updateCity(newCity: String) {
    _city.value = newCity
}
```

이후:

```kotlin
val city: StateFlow<String>
    field = MutableStateFlow("")

fun updateCity(newCity: String) {
    // 스마트 캐스트가 자동으로 작동합니다.
    city.value = newCity
}
```

이 기능은 [실험적(Experimental)](components-stability.md#stability-levels-explained)입니다. 사용하려면 빌드 파일에 다음 컴파일러 옵션을 추가하세요.

<tabs group="build-system">
<tab title="Gradle" group-key="gradle">

```kotlin
kotlin {
    compilerOptions {
        freeCompilerArgs.add("-Xexplicit-backing-fields")
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
                    <arg>-Xexplicit-backing-fields</arg>
                </args>
            </configuration>
        </plugin>
    </plugins>
</build>
```

</tab>
</tabs>

자세한 내용은 해당 기능의 [KEEP](https://github.com/Kotlin/KEEP/blob/explicit-backing-fields/proposals/explicit-backing-fields.md)을 참조하세요.

[YouTrack](https://youtrack.jetbrains.com/issue/KT-14663)에 피드백을 남겨주시면 감사하겠습니다.

### 문맥 민감 해소(Context-sensitive resolution)의 변경 사항
<primary-label ref="experimental-general"/>

문맥 민감 해소는 여전히 [실험적(Experimental)](components-stability.md#stability-levels-explained) 단계이지만, 사용자 피드백을 바탕으로 기능을 계속 개선하고 있습니다.

* 현재 타입의 봉인된(sealed) 상위 타입 및 외부(enclosing) 상위 타입이 이제 검색의 문맥 범위의 일부로 간주됩니다. 다른 상위 타입 범위는 고려되지 않습니다. 동기 및 예시는 [KT-77823](https://youtrack.jetbrains.com/issue/KT-77823) YouTrack 이슈를 참조하세요.
* 타입 연산자 및 동등성이 포함된 경우, 문맥 민감 해소를 사용함으로써 해소가 모호해지면 컴파일러가 경고를 보고합니다. 이는 예를 들어 클래스의 충돌하는 선언이 임포트될 때 발생할 수 있습니다. 동기 및 예시는 [KT-77821](https://youtrack.jetbrains.com/issue/KT-77821) YouTrack 이슈를 참조하세요.

현재 제안서의 전체 텍스트는 [KEEP](https://github.com/Kotlin/KEEP/blob/main/proposals/KEEP-0379-context-sensitive-resolution.md)에서 확인할 수 있습니다.

## Kotlin/JVM: Java 25 지원

Kotlin 2.3.0부터 컴파일러는 Java 25 바이트코드를 포함하는 클래스를 생성할 수 있습니다.

## Kotlin/Native

Kotlin 2.3.0은 Swift 내보내기(export) 지원과 C 및 Objective-C 라이브러리 임포트 기능을 개선하고, 릴리스 태스크의 빌드 시간 단축했습니다.

### Swift 내보내기를 통한 상호운용성 개선
<primary-label ref="experimental-general"/>

Kotlin 2.3.0은 Swift 내보내기를 통해 Kotlin과 Swift의 상호운용성을 더욱 개선하여 네이티브 enum 클래스와 가변 인자 함수 파라미터에 대한 지원을 추가했습니다.

이전에는 Kotlin enum이 일반 Swift 클래스로 내보내졌습니다. 이제 매핑이 직접적으로 이루어지므로 일반 네이티브 Swift enum을 사용할 수 있습니다. 예:

```kotlin
// Kotlin
enum class Color(val rgb: Int) {
    RED(0xFF0000),
    GREEN(0x00FF00),
    BLUE(0x0000FF)
}

val color = Color.RED
```

```Swift
// Swift
public enum Color: Swift.CaseIterable, Swift.LosslessStringConvertible, Swift.RawRepresentable {
    case RED, GREEN, BLUE

    var rgb: Int { get }
}
```

또한 Kotlin의 [`vararg`](functions.md#variable-number-of-arguments-varargs) 함수는 이제 Swift의 가변 인자 함수 파라미터(variadic function parameters)로 직접 매핑됩니다.

이러한 함수를 사용하면 가변적인 수의 인자를 전달할 수 있습니다. 이는 인자의 개수를 미리 알 수 없거나 타입을 지정하지 않고 컬렉션을 생성하거나 전달하고 싶을 때 유용합니다. 예:

```kotlin
// Kotlin
fun log(vararg messages: String)
```

```Swift
// Swift
public func log(messages: Swift.String...)
```

> 가변 인자 함수 파라미터의 제네릭 타입은 아직 지원되지 않습니다.
>
{style="note"}

### C 및 Objective-C 라이브러리 임포트 베타(Beta)
<primary-label ref="beta"/>

Kotlin/Native 프로젝트로 [C](native-c-interop.md) 및 [Objective-C](native-objc-interop.md) 라이브러리를 임포트하는 지원이 [베타(Beta)](components-stability.md#stability-levels-explained) 단계에 진입했습니다.

다양한 버전의 Kotlin, 의존성 및 Xcode와의 완전한 호환성이 아직 보장되지는 않지만, 컴파일러는 이제 바이너리 호환성 문제가 발생할 경우 더 나은 진단 정보를 제공합니다.

임포트 기능은 아직 안정화되지 않았으며, 프로젝트에서 C 및 Objective-C 상호운용성과 관련된 특정 항목을 사용할 때는 여전히 `@ExperimentalForeignApi` 옵트인 어노테이션이 필요합니다. 여기에는 다음이 포함됩니다.

* 네이티브 라이브러리나 메모리로 작업할 때 필요한 `kotlinx.cinterop.*` 패키지의 일부 API.
* [플랫폼 라이브러리](native-platform-libs.md)를 제외한 네이티브 라이브러리의 모든 선언.

호환성을 유지하고 소스 코드를 변경할 필요가 없도록 하기 위해 새로운 안정성 상태가 어노테이션 이름에 반영되지는 않았습니다.

자세한 내용은 [C 및 Objective-C 라이브러리 임포트의 안정성](native-lib-import-stability.md)을 참조하세요.

### Objective-C 헤더의 블록 타입에 대한 기본 명시적 이름 지원

[Kotlin 2.2.20에서 도입된](whatsnew2220.md#explicit-names-in-block-types-for-objective-c-headers) Kotlin 함수 타입의 명시적 파라미터 이름이 이제 Kotlin/Native 프로젝트에서 내보낸 Objective-C 헤더의 기본값이 되었습니다. 이러한 파라미터 이름은 Xcode의 자동 완성 제안을 개선하고 Clang 경고를 방지하는 데 도움이 됩니다.

다음 Kotlin 코드를 고려해 보세요.

```kotlin
// Kotlin:
fun greetUser(block: (name: String) -> Unit) = block("John")
```

Kotlin은 Kotlin 함수 타입의 파라미터 이름을 Objective-C 블록 타입으로 전달하여 Xcode가 제안 기능에서 이를 사용할 수 있게 합니다.

```ObjC
// Objective-C:
greetUserBlock:^(NSString *name) {
    // ...
};
```

문제가 발생하면 명시적 파라미터 이름을 비활성화할 수 있습니다.
이를 위해 `gradle.properties` 파일에 다음 [바이너리 옵션](native-binary-options.md)을 추가하세요.

```none
kotlin.native.binary.objcExportBlockExplicitParameterNames=false
```

문제가 있으면 [YouTrack](https://kotl.in/issue)에 보고해 주세요.

### 릴리스 태스크의 빌드 시간 단축

Kotlin/Native는 2.3.0에서 여러 성능 개선이 이루어졌습니다. 그 결과 `linkReleaseFrameworkIosArm64`와 같은 `linkRelease*` 릴리스 태스크의 빌드 시간이 빨라졌습니다.

벤치마크에 따르면 프로젝트 규모에 따라 릴리스 빌드 속도가 최대 40%까지 빨라질 수 있습니다. 이러한 개선 사항은 iOS를 타겟으로 하는 Kotlin Multiplatform 프로젝트에서 가장 두드러집니다.

프로젝트 컴파일 시간을 개선하는 더 많은 팁은 [문서](native-improving-compilation-time.md)를 참조하세요.

### Apple 타겟 지원 변경 사항

Kotlin 2.3.0은 Apple 타겟의 최소 지원 버전을 상향 조정했습니다.

* iOS 및 tvOS의 경우 12.0에서 14.0으로 상향.
* watchOS의 경우 5.0에서 7.0으로 상향.

공개된 데이터에 따르면 이전 버전의 사용량은 이미 매우 제한적입니다. 이 변경을 통해 전반적인 Apple 타겟 유지 관리가 단순화되고 Kotlin/Native에서 [Mac Catalyst](https://developer.apple.com/documentation/uikit/mac-catalyst)를 지원할 수 있는 기회가 열립니다.

프로젝트에서 이전 버전을 유지해야 하는 경우 빌드 파일에 다음 줄을 추가하세요.

```kotlin
kotlin {
    targets.withType<org.jetbrains.kotlin.gradle.plugin.mpp.KotlinNativeTarget>().configureEach {
        binaries.configureEach {
            freeCompilerArgs += "-Xoverride-konan-properties=minVersion.ios=12.0"
            freeCompilerArgs += "-Xoverride-konan-properties=minVersion.tvos=12.0"
        }
    }
}
```

이러한 설정은 성공적인 컴파일을 보장하지 않으며 빌드 중이나 런타임에 앱이 중단될 수 있음을 유의하세요.

이번 릴리스는 또한 [Intel 칩 기반 Apple 타겟에 대한 지원 중단 주기](whatsnew2220.md#deprecation-of-x86-64-apple-targets)의 다음 단계를 진행합니다.

Kotlin 2.3.0부터 `macosX64`, `iosX64`, `tvosX64`, `watchosX64` 타겟이 지원 티어 3(support-tier 3)으로 강등되었습니다. 즉, CI에서 테스트를 보장하지 않으며 서로 다른 컴파일러 릴리스 간의 소스 및 바이너리 호환성이 제공되지 않을 수 있습니다. Kotlin 2.4.0에서 `x86_64` Apple 타겟에 대한 지원을 최종적으로 제거할 계획입니다.

자세한 내용은 [Kotlin/Native 타겟 지원](native-target-support.md)을 참조하세요.

## Kotlin/Wasm

Kotlin 2.3.0은 Kotlin/Wasm 타겟에 대해 완전한 정규화된 이름(FQNs)을 기본으로 활성화하고, `wasmWasi` 타겟에 대한 새로운 예외 처리 제안을 활성화하며, Latin-1 문자를 위한 압축 저장 방식을 도입합니다.

### 완전한 정규화된 이름(FQN) 기본 활성화

Kotlin/Wasm 타겟에서 런타임에 완전한 정규화된 이름(Fully Qualified Names, FQNs)이 기본적으로 활성화되지 않았습니다. FQN을 사용하려면 `KClass.qualifiedName` 프로퍼티에 대한 지원을 수동으로 활성화해야 했습니다.

패키지가 없는 클래스 이름만 접근할 수 있었기 때문에, JVM에서 Wasm 타겟으로 포팅된 코드나 런타임에 FQN을 기대하는 라이브러리에서 문제가 발생했습니다.

Kotlin 2.3.0에서는 Kotlin/Wasm 타겟에서 `KClass.qualifiedName` 프로퍼티가 기본적으로 활성화됩니다. 즉, 추가 구성 없이 런타임에 FQN을 사용할 수 있습니다.

FQN을 기본적으로 활성화하면 코드 이식성이 향상되고, 런타임 오류 발생 시 FQN을 표시하여 더 유익한 정보를 제공할 수 있습니다.

이 변경 사항은 컴파일러 최적화 덕분에 컴파일된 Wasm 바이너리 크기를 증가시키지 않습니다. 이는 Latin-1 문자열 리터럴에 대해 압축 저장 방식을 사용하여 메타데이터를 줄였기 때문입니다.

### Latin-1 문자를 위한 압축 저장 방식

이전에는 Kotlin/Wasm이 문자열 리터럴 데이터를 그대로 저장했기 때문에 모든 문자가 UTF-16으로 인코딩되었습니다. 이는 Latin-1 문자만 포함하거나 주로 포함하는 텍스트에는 최적화되지 않은 방식이었습니다.

Kotlin 2.3.0부터 Kotlin/Wasm 컴파일러는 Latin-1 문자만 포함된 문자열 리터럴을 UTF-8 형식으로 저장합니다.

JetBrains의 [KotlinConf 애플리케이션](https://github.com/JetBrains/kotlinconf-app)에 대한 실험에서 보여주듯, 이 최적화는 메타데이터를 크게 줄여줍니다. 결과는 다음과 같습니다.

* 최적화되지 않은 빌드에 비해 Wasm 바이너리 크기가 최대 13% 감소.
* FQN이 활성화된 경우에도 이를 저장하지 않았던 이전 버전에 비해 Wasm 바이너리 크기가 최대 8% 감소.

이 압축 저장 방식은 다운로드 및 시작 시간이 중요한 웹 환경에서 중요합니다. 또한, 이 최적화는 이전에 [클래스의 FQN을 저장하고 `KClass.qualifiedName`을 기본적으로 활성화](#fully-qualified-names-enabled-by-default)하는 것을 방해했던 크기 장벽을 제거합니다.

이 변경 사항은 기본적으로 활성화되며 추가 조치가 필요하지 않습니다.

### `wasmWasi`에 대한 새로운 예외 처리 제안 기본 활성화

이전에는 Kotlin/Wasm이 [`wasmWasi`](wasm-overview.md#kotlin-wasm-and-wasi)를 포함한 모든 타겟에 대해 [기존 예외 처리 제안(legacy exception handling proposal)](https://github.com/WebAssembly/exception-handling/blob/master/proposals/exception-handling/legacy/Exceptions.md)을 사용했습니다. 그러나 대부분의 단독형 WebAssembly 가상 머신(VM)들은 [새로운 버전의 예외 처리 제안](https://github.com/WebAssembly/exception-handling/blob/main/proposals/exception-handling/Exceptions.md)을 따르고 있습니다.

Kotlin 2.3.0부터 `wasmWasi` 타겟에 대해 새로운 WebAssembly 예외 처리 제안이 기본적으로 활성화되어 현대적인 WebAssembly 런타임과의 호환성이 향상되었습니다.

`wasmWasi` 타겟의 경우, 이를 타겟팅하는 애플리케이션은 일반적으로 덜 다양한 런타임 환경(종종 사용자가 제어하는 단일 특정 VM)에서 실행되므로 호환성 이슈의 위험이 적어 조기에 변경 사항을 도입하는 것이 안전합니다.

[`wasmJs` 타겟](wasm-overview.md#kotlin-wasm-and-compose-multiplatform)의 경우 새로운 예외 처리 제안은 여전히 기본적으로 꺼져 있습니다. `-Xwasm-use-new-exception-proposal` 컴파일러 옵션을 사용하여 수동으로 활성화할 수 있습니다.

## Kotlin/JS

Kotlin 2.3.0은 JavaScript로의 중단 함수(suspend functions) 내보내기에 대한 실험적 지원과 Kotlin의 `LongArray` 타입을 표현하기 위한 `BigInt64Array` 타입을 도입했습니다.

이번 릴리스를 통해 이제 인터페이스 내부의 동반 객체(companion objects)에 통합된 방식으로 접근할 수 있고, 동반 객체가 있는 인터페이스에서 `@JsStatic` 어노테이션을 사용할 수 있으며, 개별 함수와 클래스에서 `@JsQualifier` 어노테이션을 사용할 수 있습니다. 또한 새로운 어노테이션인 `@JsExport.Default`를 통한 기본 내보내기(default exports)를 지원합니다.

### `JsExport`를 통한 중단 함수의 새로운 내보내기 방식
<primary-label ref="experimental-opt-in"/>

이전에는 `@JsExport` 어노테이션이 중단 함수(또는 이러한 함수를 포함하는 클래스 및 인터페이스)를 JavaScript로 내보내는 것을 허용하지 않았습니다. 각 중단 함수를 수동으로 래핑해야 했으며, 이는 번거롭고 오류가 발생하기 쉬웠습니다.

Kotlin 2.3.0부터 `@JsExport` 어노테이션을 사용하여 중단 함수를 JavaScript로 직접 내보낼 수 있습니다.

중단 함수 내보내기를 활성화하면 보일러플레이트 코드가 줄어들고 Kotlin/JS와 JavaScript/TypeScript(JS/TS) 간의 상호운용성이 향상됩니다. 이제 추가 코드 없이 JS/TS에서 Kotlin의 비동기 함수를 직접 호출할 수 있습니다.

이 기능을 활성화하려면 `build.gradle.kts` 파일에 다음 컴파일러 옵션을 추가하세요.

```kotlin
kotlin {
    compilerOptions {
        freeCompilerArgs.add("-Xenable-suspend-function-exporting")
    }
}
```

활성화되면 `@JsExport` 어노테이션이 표시된 클래스와 함수는 추가적인 래퍼 없이 중단 함수를 포함할 수 있습니다.

이들은 일반적인 JavaScript 비동기 함수(async functions)로 사용될 수 있으며, 비동기 함수로 오버라이드할 수도 있습니다.

```kotlin
@JsExport
open class Foo {
    suspend fun foo() = "Foo"
}
```

```typescript
class Bar extends Foo {
    override async foo(): Promise<string> {
        return "Bar"
    }
}
```

이 기능은 [실험적(Experimental)](components-stability.md#stability-levels-explained)입니다. 이슈 트래커인 [YouTrack](https://youtrack.jetbrains.com/issue/KT-56281/KJS-Cant-export-suspend-functions)에 피드백을 남겨주시면 감사하겠습니다.

### Kotlin `LongArray` 타입을 표현하기 위한 `BigInt64Array` 타입 사용
<primary-label ref="experimental-opt-in"/>

이전에는 Kotlin/JS가 `LongArray`를 JavaScript의 `Array<bigint>`로 표현했습니다. 이 방식은 작동은 했으나 형식화된 배열(typed arrays)을 기대하는 JavaScript API와의 상호운용성 측면에서 이상적이지 않았습니다.

이번 릴리스부터 Kotlin/JS는 JavaScript로 컴파일될 때 Kotlin의 `LongArray` 값을 표현하기 위해 JavaScript의 기본 제공 `BigInt64Array` 타입을 사용합니다.

`BigInt64Array`를 사용하면 형식화된 배열을 사용하는 JavaScript API와의 상호운용성이 단순화됩니다. 또한 `LongArray`를 인자로 받거나 반환하는 API를 Kotlin에서 JavaScript로 더 자연스럽게 내보낼 수 있습니다.

이 기능을 활성화하려면 `build.gradle.kts` 파일에 다음 컴파일러 옵션을 추가하세요.

```kotlin
kotlin {
    js {
        // ...
        compilerOptions {
            freeCompilerArgs.add("-Xes-long-as-bigint")
        }
    }
}
```

이 기능은 [실험적(Experimental)](components-stability.md#stability-levels-explained)입니다. 이슈 트래커인 [YouTrack](https://youtrack.jetbrains.com/issue/KT-79284/Use-BigInt64Array-for-LongArray)에 피드백을 남겨주시면 감사하겠습니다.

### JS 모듈 시스템 전반에서 통합된 동반 객체 접근 방식

이전에는 `@JsExport` 어노테이션을 사용하여 동반 객체가 있는 Kotlin 인터페이스를 JavaScript/TypeScript로 내보낼 때, TypeScript에서 해당 인터페이스를 사용하는 방식이 ES 모듈과 다른 모듈 시스템 간에 차이가 있었습니다.

그 결과 모듈 시스템에 따라 TypeScript 쪽에서 결과물을 사용하는 방식을 조정해야 했습니다.

다음 Kotlin 코드를 살펴보세요.

```kotlin
@JsExport
interface Foo {
    companion object {
        fun bar() = "OK"
    }
}
```

모듈 시스템에 따라 다르게 호출해야 했습니다.

```kotlin
// CommonJS, AMD, UMD 및 모듈 없음 환경에서 작동
Foo.bar()

// ES 모듈 환경에서 작동
Foo.getInstance().bar() 
```

이번 릴리스에서 Kotlin은 모든 JavaScript 모듈 시스템에서 동반 객체 내보내기 방식을 통합했습니다.

이제 모든 모듈 시스템(ES 모듈, CommonJS, AMD, UMD, 모듈 없음)에서 인터페이스 내부의 동반 객체는 항상 동일한 방식으로 접근됩니다(클래스의 동반 객체와 동일하게).

```kotlin
// 모든 모듈 시스템에서 작동
Foo.Companion.bar()
```

이 개선 사항은 컬렉션 상호운용성 문제도 해결합니다. 이전에는 컬렉션 팩토리 함수를 모듈 시스템에 따라 다르게 접근해야 했습니다.

```kotlin
// CommonJS, AMD, UMD 및 모듈 없음 환경에서 작동
KtList.fromJsArray([1, 2, 3])

// ES 모듈 환경에서 작동
KtList.getInstance().fromJsArray([1, 2, 3])
```

이제 모든 모듈 시스템에서 컬렉션 팩토리 함수에 접근하는 방식이 유사해졌습니다.

```kotlin
// 모든 모듈 시스템에서 작동
KtList.fromJsArray([1, 2, 3])
```

이 변경은 모듈 시스템 간의 일관되지 않은 동작을 줄이고 버그 및 상호운용성 문제를 방지합니다.

이 기능은 기본적으로 활성화되어 있습니다.

### 동반 객체가 있는 인터페이스에서 `@JsStatic` 어노테이션 지원

이전에는 동반 객체가 있는 내보내기용 인터페이스 내부에서 `@JsStatic` 어노테이션을 사용할 수 없었습니다.

예를 들어 다음 코드는 오류를 발생시켰습니다. 클래스 동반 객체의 멤버에만 `@JsStatic`을 붙일 수 있었기 때문입니다.

```kotlin
@JsExport
interface Foo {
    companion object {
        @JsStatic // 오류
        fun bar() = "OK"
    }
}
```

이 경우 `@JsStatic` 어노테이션을 제거하고 JavaScript(JS)에서 다음과 같이 동반 객체에 접근해야 했습니다.

```kotlin
// 모든 모듈 시스템에서
Foo.Companion.bar()
```

이제 동반 객체가 있는 인터페이스에서도 `@JsStatic` 어노테이션이 지원됩니다.
이러한 동반 객체에 어노테이션을 사용할 수 있으며, 클래스와 마찬가지로 JS에서 직접 함수를 호출할 수 있습니다.

```kotlin
// 모든 모듈 시스템에서
Foo.bar()
```

이 변경 사항은 JS에서의 API 사용을 단순화하고, 인터페이스에 정적 팩토리 메서드를 허용하며, 클래스와 인터페이스 간의 불일치를 제거합니다.

이 기능은 기본적으로 활성화되어 있습니다.

### 개별 함수 및 클래스에서 `@JsQualifier` 어노테이션 허용

이전에는 파일 레벨에서만 `@JsQualifier` 어노테이션을 적용할 수 있었기 때문에 모든 외부 JavaScript(JS) 선언을 별도의 파일에 배치해야 했습니다.

Kotlin 2.3.0부터는 `@JsModule` 및 `@JsNonModule` 어노테이션과 마찬가지로 개별 함수와 클래스에 직접 `@JsQualifier` 어노테이션을 적용할 수 있습니다.

예를 들어, 이제 동일한 파일에 일반 Kotlin 선언과 함께 다음과 같은 외부 함수 코드를 작성할 수 있습니다.

```kotlin
@JsQualifier("jsPackage")
private external fun jsFun()
```

이 변경 사항은 Kotlin/JS 상호운용성을 단순화하고 프로젝트 구조를 더 깔끔하게 유지하며, Kotlin/JS를 외부 선언을 처리하는 다른 플랫폼의 방식과 일치시킵니다.

이 기능은 기본적으로 활성화되어 있습니다.

### JavaScript 기본 내보내기(default exports) 지원

이전에는 Kotlin/JS가 Kotlin 코드에서 JavaScript의 기본 내보내기(default exports)를 생성할 수 없었습니다. 대신 Kotlin/JS는 명명된 내보내기(named exports)만 생성했습니다. 예:

```javascript
export { SomeDeclaration };
```

기본 내보내기가 필요한 경우, `@JsName` 어노테이션의 인자로 `default` 뒤에 공백을 넣는 방식과 같은 컴파일러 내부의 편법을 사용해야 했습니다.

```kotlin
@JsExport
@JsName("default ")
class SomeDeclaration
```

이제 Kotlin/JS는 새로운 어노테이션을 통해 기본 내보내기를 직접 지원합니다.

```kotlin
@JsExport.Default
```

이 어노테이션을 Kotlin 선언(클래스, 객체, 함수 또는 프로퍼티)에 적용하면 생성된 JavaScript는 ES 모듈에 대해 자동으로 `export default` 문을 포함합니다.

```javascript
export default HelloWorker;
```

> ES 모듈이 아닌 다른 모듈 시스템의 경우, 새로운 `@JsExport.Default` 어노테이션은 일반적인 `@JsExport` 어노테이션과 유사하게 작동합니다.
>
{style="note"}

이 변경 사항은 Kotlin 코드가 JavaScript 관습을 따를 수 있게 하며, 특히 Cloudflare Workers와 같은 플랫폼이나 `React.lazy`와 같은 프레임워크에 중요합니다.

이 기능은 기본적으로 활성화되어 있습니다. `@JsExport.Default` 어노테이션을 사용하기만 하면 됩니다.

## Gradle

Kotlin 2.3.0은 Gradle 7.6.3부터 9.0.0까지 완벽하게 호환됩니다. 최신 Gradle 버전까지도 사용할 수 있습니다. 다만, 최신 버전을 사용할 경우 지원 중단 경고가 발생할 수 있으며 일부 새로운 Gradle 기능이 작동하지 않을 수 있습니다.

또한, 지원되는 최소 Android Gradle 플러그인(AGP) 버전은 이제 8.2.2이며, 최대 지원 버전은 8.13.0입니다.

Kotlin 2.3.0은 또한 Gradle 프로젝트에서 생성된 소스(generated sources)를 등록하기 위한 새로운 API를 도입했습니다.

### Gradle 프로젝트에서 생성된 소스 등록을 위한 새로운 API
<primary-label ref="experimental-general"/>

Kotlin 2.3.0은 [`KotlinSourceSet`](https://kotlinlang.org/api/kotlin-gradle-plugin/kotlin-gradle-plugin-api/org.jetbrains.kotlin.gradle.plugin/-kotlin-source-set/) 인터페이스에 새로운 [실험적(Experimental)](components-stability.md#stability-levels-explained) API를 도입했습니다. 이를 사용하여 Gradle 프로젝트에서 생성된 소스를 등록할 수 있습니다.

이 새로운 API는 IDE가 생성된 코드와 일반 소스 파일을 구분하는 데 도움을 주는 품질 개선 사항입니다. 이 API를 사용하면 IDE가 UI에서 생성된 코드를 다르게 강조 표시하고, 프로젝트를 임포트할 때 생성 태스크를 트리거할 수 있습니다. 현재 IntelliJ IDEA에서 이 지원을 추가하기 위해 작업 중입니다. 이 API는 또한 [KSP](ksp-overview.md)(Kotlin Symbol Processing)와 같이 코드를 생성하는 서드파티 플러그인이나 도구에 특히 유용합니다.

자세한 내용은 [생성된 소스 등록](gradle-configure-project.md#register-generated-sources)을 참조하세요.

## 표준 라이브러리(Standard library)

Kotlin 2.3.0은 새로운 시간 추적 기능인 [`kotlin.time.Clock` 및 `kotlin.time.Instant`](whatsnew2120.md#new-time-tracking-functionality)를 안정화하고, 실험적 UUID API에 몇 가지 개선 사항을 추가했습니다.

### UUID 생성 및 파싱 개선
<primary-label ref="experimental-opt-in"/>

Kotlin 2.3.0은 다음과 같은 UUID API에 대한 몇 가지 개선 사항을 도입했습니다.

* [유효하지 않은 UUID 파싱 시 `null` 반환 지원](#support-for-returning-null-when-parsing-invalid-uuids)
* [v4 및 v7 UUID 생성을 위한 새로운 함수](#new-functions-to-generate-v4-and-v7-uuids)
* [특정 타임스탬프에 대한 v7 UUID 생성 지원](#support-for-generating-v7-uuids-for-specific-timestamps)

표준 라이브러리의 UUID 지원은 [실험적(Experimental)](components-stability.md#stability-levels-explained)이지만 [향후 안정화될 계획](https://youtrack.jetbrains.com/issue/KT-81395)입니다. 사용하려면 `@OptIn(ExperimentalUuidApi::class)` 어노테이션을 사용하거나 빌드 파일에 다음 컴파일러 옵션을 추가하세요.

<tabs group="build-system">
<tab title="Gradle" group-key="gradle">

```kotlin
kotlin {
    compilerOptions {
        freeCompilerArgs.add("-opt-in=kotlin.uuid.ExperimentalUuidApi")
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
                    <arg>-opt-in=kotlin.uuid.ExperimentalUuidApi</arg>
                </args>
            </configuration>
        </plugin>
    </plugins>
</build>
```

</tab>
</tabs>

[YouTrack](https://youtrack.jetbrains.com/issue/KT-81395)이나 [관련 Slack 채널](https://slack-chats.kotlinlang.org/c/uuid)에서 피드백을 남겨주시면 감사하겠습니다.

#### 유효하지 않은 UUID 파싱 시 `null` 반환 지원

Kotlin 2.3.0은 문자열로부터 `Uuid` 인스턴스를 생성하는 새로운 함수를 도입했습니다. 이 함수들은 문자열이 유효한 UUID가 아닌 경우 예외를 던지는 대신 `null`을 반환합니다.

해당 함수는 다음과 같습니다.

* `Uuid.parseOrNull()` – 16진수-대시(hex-and-dash) 또는 16진수 형식의 UUID를 파싱합니다.
* `Uuid.parseHexDashOrNull()` – 16진수-대시 형식의 UUID만 파싱하며, 그렇지 않으면 `null`을 반환합니다.
* `Uuid.parseHexOrNull()` – 순수 16진수 형식의 UUID만 파싱하며, 그렇지 않으면 `null`을 반환합니다.

예시는 다음과 같습니다.

```kotlin
import kotlin.uuid.ExperimentalUuidApi
import kotlin.uuid.Uuid

@OptIn(ExperimentalUuidApi::class)
fun main() {
    val valid = Uuid.parseOrNull("550e8400-e29b-41d4-a716-446655440000")
    println(valid)
    // 550e8400-e29b-41d4-a716-446655440000

    val invalid = Uuid.parseOrNull("not-a-uuid")
    println(invalid)
    // null

    val hexDashValid = Uuid.parseHexDashOrNull("550e8400-e29b-41d4-a716-446655440000")
    println(hexDashValid)
    // 550e8400-e29b-41d4-a716-446655440000

    val hexDashInvalid = Uuid.parseHexDashOrNull("550e8400e29b41d4a716446655440000")
    println(hexDashInvalid)
    // null
}
```
{kotlin-runnable="true"}

#### v4 및 v7 UUID 생성을 위한 새로운 함수

Kotlin 2.3.0은 UUID 생성을 위한 두 가지 새로운 함수 `Uuid.generateV4()` 및 `Uuid.generateV7()`를 도입했습니다.

버전 4 UUID를 생성하려면 `Uuid.generateV4()` 함수를, 버전 7 UUID를 생성하려면 `Uuid.generateV7()` 함수를 사용하세요.

> `Uuid.random()` 함수는 변경되지 않았으며 `Uuid.generateV4()`와 마찬가지로 여전히 버전 4 UUID를 생성합니다.
>
{style="note"}

예시는 다음과 같습니다.

```kotlin
import kotlin.uuid.ExperimentalUuidApi
import kotlin.uuid.Uuid

@OptIn(ExperimentalUuidApi::class)
fun main() {
    // v4 UUID 생성
    val v4 = Uuid.generateV4()
    println(v4)

    // v7 UUID 생성
    val v7 = Uuid.generateV7()
    println(v7)

    // v4 UUID 생성
    val random = Uuid.random()
    println(random)
}
```
{kotlin-runnable="true"}

#### 특정 타임스탬프에 대한 v7 UUID 생성 지원

Kotlin 2.3.0은 특정 시점에 대한 버전 7 UUID를 생성하는 데 사용할 수 있는 새로운 `Uuid.generateV7NonMonotonicAt()` 함수를 도입했습니다.

> `Uuid.generateV7()`과 달리 `Uuid.generateV7NonMonotonicAt()`은 순차적(monotonic) 정렬을 보장하지 않으므로, 동일한 타임스탬프에 대해 생성된 여러 UUID가 연속적이지 않을 수 있습니다.
>
{style="note"}

이벤트 ID를 재현하거나 무언가가 원래 발생한 시간을 반영하는 데이터베이스 항목을 생성하는 경우와 같이 알려진 타임스탬프에 묶인 식별자가 필요할 때 이 함수를 사용하세요.

예를 들어 특정 시점에 대한 버전 7 UUID를 생성하려면 다음 코드를 사용합니다.

```kotlin
import kotlin.uuid.ExperimentalUuidApi
import kotlin.uuid.Uuid
import kotlin.time.ExperimentalTime
import kotlin.time.Instant

@OptIn(ExperimentalUuidApi::class, ExperimentalTime::class)
fun main() {
    val timestamp = Instant.fromEpochMilliseconds(1577836800000) // 2020-01-01T00:00:00Z

    // 지정된 타임스탬프에 대한 v7 UUID 생성 (순차성 보장 없음)
    val v7AtTimestamp = Uuid.generateV7NonMonotonicAt(timestamp)
    println(v7AtTimestamp)
}
```
{kotlin-runnable="true"}

## Compose 컴파일러: 미니파이된 Android 애플리케이션을 위한 스택 트레이스

Kotlin 2.3.0부터 컴파일러는 애플리케이션이 R8에 의해 미니파이될 때 Compose 스택 트레이스에 대한 ProGuard 매핑을 출력합니다. 이는 이전에 디버그 가능한 변형에서만 사용할 수 있었던 실험적 스택 트레이스 기능을 확장한 것입니다.

릴리스 변형의 스택 트레이스에는 런타임에 소스 정보를 기록하는 오버헤드 없이 미니파이된 애플리케이션에서 컴포저블(composable) 함수를 식별하는 데 사용할 수 있는 그룹 키가 포함되어 있습니다. 그룹 키 스택 트레이스를 사용하려면 애플리케이션이 Compose 런타임 1.10 이상으로 빌드되어야 합니다.

그룹 키 스택 트레이스를 활성화하려면 `@Composable` 콘텐츠를 초기화하기 전에 다음 줄을 추가하세요.

```kotlin
Composer.setDiagnosticStackTraceMode(ComposeStackTraceMode.GroupKeys)
```

이러한 스택 트레이스가 활성화되면, 앱이 미니파이된 경우에도 컴포지션(composition), 측정(measure) 또는 그리기(draw) 패스 중에 크래시가 캡처된 후 Compose 런타임이 자체 스택 트레이스를 추가합니다.

```text
java.lang.IllegalStateException: <message>
        at <original trace>
    Suppressed: androidx.compose.runtime.DiagnosticComposeException: Composition stack when thrown:
        at $compose.m$123(SourceFile:1)
        at $compose.m$234(SourceFile:1)
        ...
```

이 모드에서 Jetpack Compose 1.10이 생성하는 스택 트레이스에는 여전히 난독화 해제(deobfuscated)가 필요한 그룹 키만 포함됩니다. 이는 Kotlin 2.3.0의 Compose Compiler Gradle 플러그인에서 해결되었으며, 이제 R8에서 생성된 ProGuard 매핑 파일에 그룹 키 엔트리를 추가합니다. 컴파일러가 일부 함수에 대한 매핑을 생성하지 못해 새로운 경고가 표시되는 경우, [Google IssueTracker](https://issuetracker.google.com/issues/new?component=610764&template=1424126)에 보고해 주세요.

> Compose Compiler Gradle 플러그인은 R8 매핑 파일에 대한 의존성 때문에 빌드에 R8이 활성화된 경우에만 그룹 키 스택 트레이스에 대한 난독화 해제 매핑을 생성합니다.
>
{style="note"}

기본적으로 매핑 파일 Gradle 태스크는 트레이스 활성화 여부와 관계없이 실행됩니다. 빌드에 문제가 발생하는 경우 기능을 완전히 비활성화할 수 있습니다. Gradle 구성의 `composeCompiler {}` 블록에 다음 프로퍼티를 추가하세요.

```kotlin
composeCompiler {
    includeComposeMappingFile.set(false)
}
```

> Android Gradle 플러그인에서 제공하는 프로젝트 파일에 대해 일부 코드가 스택 트레이스에 나타나지 않는 알려진 이슈가 있습니다: [KT-83099](https://youtrack.jetbrains.com/issue/KT-83099).
>
{style="warning"}

발생하는 문제는 [Google IssueTracker](https://issuetracker.google.com/issues/new?component=610764&template=1424126)에 보고해 주세요.

## 주요 변경 사항 및 지원 중단(Deprecations)

이 섹션에서는 중요한 주요 변경 사항 및 지원 중단 사항을 강조합니다.
전체 개요는 [호환성 가이드](compatibility-guide-23.md)를 참조하세요.

* Kotlin 2.3.0부터 컴파일러는 [더 이상 `-language-version=1.8`을 지원하지 않습니다](compatibility-guide-23.md#drop-support-in-language-version-for-1-8-and-1-9). 또한 비 JVM 플랫폼에서는 `-language-version=1.9` 지원도 중단됩니다.
* 2.0보다 오래된 언어 기능 세트(JVM 플랫폼의 1.9 제외)는 지원되지 않지만, 언어 자체는 Kotlin 1.0과 완벽하게 하위 호환됩니다.

  Gradle 프로젝트에서 `kotlin-dsl`과 `kotlin("jvm")` 플러그인을 모두 사용하는 경우 지원되지 않는 Kotlin 플러그인 버전에 대한 Gradle 경고가 표시될 수 있습니다. 마이그레이션 단계에 대한 지침은 [호환성 가이드](compatibility-guide-23.md#unsupported-kgp-version-warning-when-using-kotlin-dsl-and-kotlin-jvm-plugins)를 참조하세요.

* Kotlin Multiplatform에서 Android 타겟에 대한 지원은 이제 Google의 [`com.android.kotlin.multiplatform.library` 플러그인](https://developer.android.com/kotlin/multiplatform/plugin)을 통해 제공됩니다. Android 타겟이 포함된 프로젝트를 새 플러그인으로 마이그레이션하고 `androidTarget` 블록을 `android`로 이름을 바꾸세요.

* Android Gradle 플러그인(AGP) 9.0.0 이상에서 Android 타겟용 Kotlin Multiplatform Gradle 플러그인을 계속 사용하는 경우, `androidTarget` 블록 사용 시 구성 오류가 발생하며 마이그레이션 방법을 안내하는 진단 메시지가 표시됩니다. AGP 8.x를 사용하고 Kotlin 2.3.10으로 업데이트하거나, [Google의 Android 타겟용 플러그인](https://kotlinlang.org/docs/multiplatform/multiplatform-compatibility-guide.html#migrate-to-google-s-plugin-for-android-targets)으로 마이그레이션하여 이 오류를 피할 수 있습니다.

* AGP 9.0.0에는 [Kotlin에 대한 기본 지원(built-in support)](https://developer.android.com/build/releases/agp-preview#android-gradle-plugin-built-in-kotlin)이 포함되어 있습니다. Kotlin 2.3.0부터 이 버전의 AGP를 `kotlin-android` 플러그인과 함께 사용하면 [구성 오류가 발생](compatibility-guide-23.md#deprecate-kotlin-android-plugin-for-agp-versions-9-0-0-and-later)합니다. 해당 플러그인이 더 이상 필요하지 않기 때문입니다. 마이그레이션을 돕기 위한 새로운 진단 메시지가 제공됩니다. 이전 AGP 버전을 사용하는 경우 지원 중단 경고가 표시됩니다.

* Ant 빌드 시스템에 대한 지원은 더 이상 제공되지 않습니다.

## 문서 업데이트

Kotlin Multiplatform 문서가 kotlinlang.org로 이동했습니다. 이제 한 곳에서 Kotlin과 KMP 문서를 모두 확인할 수 있습니다. 또한 언어 가이드의 목차를 갱신하고 새로운 내비게이션을 도입했습니다.

지난 Kotlin 릴리스 이후의 다른 주목할 만한 변경 사항은 다음과 같습니다.

* [KMP 개요(KMP overview)](https://kotlinlang.org/docs/multiplatform/kmp-overview.html) – Kotlin Multiplatform 생태계를 한 페이지에서 살펴보세요.
* [Kotlin Multiplatform 빠른 시작(Kotlin Multiplatform quickstart)](https://kotlinlang.org/docs/multiplatform/quickstart.html) – KMP IDE 플러그인을 사용하여 환경을 설정하는 방법을 배워보세요.
* [Compose Multiplatform 1.9.3의 새로운 기능](https://kotlinlang.org/docs/multiplatform/whats-new-compose-190.html) – 최신 릴리스의 하이라이트를 확인하세요.
* [Kotlin/JS 시작하기(Get started with Kotlin/JS)](js-get-started.md) – Kotlin/JavaScript를 사용하여 브라우저용 웹 애플리케이션을 만들어 보세요.
* [클래스(Classes)](classes.md) – Kotlin에서 클래스를 사용하는 기본 사항과 모범 사례를 배워보세요.
* [확장(Extensions)](extensions.md) – Kotlin에서 클래스와 인터페이스를 확장하는 방법을 배워보세요.
* [코루틴 기초(Coroutines basics)](coroutines-basics.md) – 주요 코루틴 개념을 탐구하고 첫 번째 코루틴을 만드는 방법을 배워보세요.
* [취소 및 타임아웃(Cancellation and timeouts)](cancellation-and-timeouts.md) – 코루틴 취소가 어떻게 작동하는지, 그리고 코루틴이 취소에 응답하도록 만드는 방법을 배워보세요.
* [Kotlin/Native 라이브러리](native-libraries.md) – `klib` 라이브러리 아티팩트를 생성하는 방법을 확인하세요.
* [Kotlin Notebook 개요](kotlin-notebook-overview.md) – Kotlin Notebook 플러그인으로 대화형 노트북 문서를 만들어 보세요.
* [Java 프로젝트에 Kotlin 추가하기(Add Kotlin to a Java project)](mixing-java-kotlin-intellij.md) – Kotlin과 Java를 모두 사용하도록 Java 프로젝트를 구성하세요.
* [Kotlin으로 Java 코드 테스트하기(Test Java code with Kotlin)](jvm-test-using-junit.md) – JUnit으로 Java-Kotlin 혼합 프로젝트를 테스트하세요.
* [새로운 사례 연구 페이지(New case studies page)](https://kotlinlang.org/case-studies/) – 다양한 기업들이 Kotlin을 어떻게 적용하고 있는지 확인해 보세요.

## Kotlin 2.3.0으로 업데이트하는 방법

Kotlin 플러그인은 IntelliJ IDEA 및 Android Studio에 번들 플러그인으로 제공됩니다.

새로운 Kotlin 버전으로 업데이트하려면 빌드 스크립트에서 [Kotlin 버전을 2.3.0으로 변경](releases.md#update-to-a-new-kotlin-version)하세요.

```kotlin
plugins {
    kotlin("jvm") version "2.3.0"
}