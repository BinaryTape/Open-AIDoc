[//]: # (title: Kotlin 1.9.0의 새로운 기능)

<web-summary>새로운 언어 기능, Kotlin Multiplatform, JVM, Native, JS, Wasm 업데이트, 그리고 Gradle 및 Maven 빌드 도구 지원을 다루는 Kotlin 1.9.0 릴리스 노트를 확인해 보세요.</web-summary>

_[릴리스 날짜: 2023년 7월 6일](releases.md#release-history)_

Kotlin 1.9.0이 릴리스되었으며, JVM용 K2 컴파일러가 이제 **베타(Beta)** 단계에 진입했습니다. 이번 릴리스의 주요 하이라이트는 다음과 같습니다.

* [새로운 Kotlin K2 컴파일러 업데이트](#new-kotlin-k2-compiler-updates)
* [enum 클래스 values 함수의 안정적인 대체 기능](#stable-replacement-of-the-enum-class-values-function)
* [열린 범위(open-ended range)를 위한 안정적인 `..<` 연산자](#stable-operator-for-open-ended-ranges)
* [이름으로 정규식 캡처 그룹을 가져오는 새로운 공통 함수](#new-common-function-to-get-regex-capture-group-by-name)
* [상위 디렉터리를 생성하는 새로운 경로 유틸리티](#new-path-utility-to-create-parent-directories)
* [Kotlin Multiplatform의 Gradle configuration cache 미리보기](#preview-of-the-gradle-configuration-cache)
* [Kotlin Multiplatform의 Android 타깃 지원 변경 사항](#changes-to-android-target-support)
* [Kotlin/Native의 커스텀 메모리 할당자 미리보기](#preview-of-custom-memory-allocator)
* [Kotlin/Native의 라이브러리 링키지(Library linkage)](#library-linkage-in-kotlin-native)
* [Kotlin/Wasm의 크기 관련 최적화](#size-related-optimizations)

이 비디오에서도 업데이트에 대한 간략한 개요를 확인할 수 있습니다.

<video src="https://www.youtube.com/v/fvwTZc-dxsM" title="What's new in Kotlin 1.9.0"/>

> Kotlin 릴리스 주기에 대한 자세한 내용은 [Kotlin 릴리스 프로세스](releases.md)를 참조하세요.
>
{style="tip"}

## IDE 지원 {id="ide-support"}

1.9.0을 지원하는 Kotlin 플러그인은 다음 IDE에서 사용할 수 있습니다.

| IDE | 지원 버전 |
|--|--|
| IntelliJ IDEA | 2022.3.x, 2023.1.x |
| Android Studio | Giraffe (223), Hedgehog (231)* |

*Kotlin 1.9.0 플러그인은 향후 출시될 Android Studio Giraffe (223) 및 Hedgehog (231) 릴리스에 포함될 예정입니다.

Kotlin 1.9.0 플러그인은 향후 출시될 IntelliJ IDEA 2023.2 릴리스에 포함될 예정입니다.

> Kotlin 아티팩트와 종속성을 다운로드하려면 Maven Central 저장소를 사용하도록 [Gradle 설정을 구성](#configure-gradle-settings)하세요.
>
{style="warning"}

## 새로운 Kotlin K2 컴파일러 업데이트 {id="new-kotlin-k2-compiler-updates"}

JetBrains의 Kotlin 팀은 K2 컴파일러를 안정화하기 위한 작업을 지속하고 있으며, 1.9.0 릴리스에는 추가적인 개선 사항이 포함되어 있습니다.
JVM용 K2 컴파일러가 이제 **베타(Beta)** 단계에 도달했습니다.

또한 Kotlin/Native 및 멀티플랫폼 프로젝트에 대한 기본 지원도 제공됩니다.

### kapt 컴파일러 플러그인과 K2 컴파일러의 호환성 {id="compatibility-of-the-kapt-compiler-plugin-with-the-k2-compiler"}

K2 컴파일러와 함께 프로젝트에서 [kapt 플러그인](kapt.md)을 사용할 수 있지만 몇 가지 제한 사항이 있습니다.
`languageVersion`을 `2.0`으로 설정하더라도 kapt 컴파일러 플러그인은 여전히 이전 컴파일러를 사용합니다.

`languageVersion`이 `2.0`으로 설정된 프로젝트 내에서 kapt 컴파일러 플러그인을 실행하면 kapt는 자동으로 `1.9`로 전환하고 특정 버전 호환성 검사를 비활성화합니다. 이 동작은 다음 명령행 인수를 포함하는 것과 같습니다.
* `-Xskip-metadata-version-check`
* `-Xskip-prerelease-check`
* `-Xallow-unstable-dependencies`

이러한 검사는 kapt 태스크에 대해서만 단독으로 비활성화됩니다. 다른 모든 컴파일 태스크는 새로운 K2 컴파일러를 계속 사용합니다.

K2 컴파일러와 함께 kapt를 사용할 때 문제가 발생하면 [이슈 트래커](http://kotl.in/issue)에 보고해 주세요.

### 프로젝트에서 K2 컴파일러 사용해 보기 {id="try-the-k2-compiler-in-your-project"}

1.9.0부터 Kotlin 2.0이 릴리스될 때까지 `gradle.properties` 파일에 `kotlin.experimental.tryK2=true` Gradle 프로퍼티를 추가하여 K2 컴파일러를 쉽게 테스트해 볼 수 있습니다. 또한 다음 명령을 실행할 수도 있습니다.

```shell
./gradlew assemble -Pkotlin.experimental.tryK2=true
```

이 Gradle 프로퍼티는 언어 버전을 자동으로 2.0으로 설정하고, 현재 컴파일러 대비 K2 컴파일러를 사용하여 컴파일된 Kotlin 태스크 수로 빌드 리포트를 업데이트합니다.

```none
##### 'kotlin.experimental.tryK2' results (Kotlin/Native not checked) #####
:lib:compileKotlin: 2.0 language version
:app:compileKotlin: 2.0 language version
##### 100% (2/2) tasks have been compiled with Kotlin 2.0 #####
```

### Gradle 빌드 리포트 {id="gradle-build-reports"}

이제 [Gradle 빌드 리포트](gradle-compilation-and-caches.md#build-reports)에서 코드를 컴파일하는 데 현재 컴파일러가 사용되었는지 K2 컴파일러가 사용되었는지 표시합니다. Kotlin 1.9.0에서는 [Gradle Build Scan](https://scans.gradle.com/)에서 이 정보를 확인할 수 있습니다.

![Gradle build scan - K1](gradle-build-scan-k1.png){width=700}

![Gradle build scan - K2](gradle-build-scan-k2.png){width=700}

빌드 리포트에서 프로젝트에 사용된 Kotlin 버전을 바로 확인할 수도 있습니다.

```none
Task info:
  Kotlin language version: 1.9
```

> Gradle 8.0을 사용하는 경우 빌드 리포트에서 문제(특히 Gradle configuration cache가 활성화된 경우)가 발생할 수 있습니다. 이는 알려진 문제이며 Gradle 8.1 이상에서 수정되었습니다.
>
{style="note"}

### 현재 K2 컴파일러의 제한 사항 {id="current-k2-compiler-limitations"}

Gradle 프로젝트에서 K2를 활성화하면 다음과 같은 경우 8.3 미만의 Gradle 버전을 사용하는 프로젝트에 영향을 줄 수 있는 특정 제한 사항이 따릅니다.

* `buildSrc`의 소스 코드 컴파일.
* included builds의 Gradle 플러그인 컴파일.
* 8.3 미만의 Gradle 버전을 사용하는 프로젝트에서 기타 Gradle 플러그인이 사용되는 경우의 컴파일.
* Gradle 플러그인 종속성 빌드.

위에서 언급한 문제가 발생하는 경우 다음 단계를 수행하여 해결할 수 있습니다.

* `buildSrc`, 모든 Gradle 플러그인 및 해당 종속성의 언어 버전을 설정합니다.

```kotlin
kotlin {
    compilerOptions {
        languageVersion.set(org.jetbrains.kotlin.gradle.dsl.KotlinVersion.KOTLIN_1_9)
        apiVersion.set(org.jetbrains.kotlin.gradle.dsl.KotlinVersion.KOTLIN_1_9)
    }
}
```

* 프로젝트의 Gradle 버전을 8.3이 출시되면 해당 버전으로 업데이트합니다.

### 새로운 K2 컴파일러에 대한 피드백 남기기 {id="leave-your-feedback-on-the-new-k2-compiler"}

어떤 피드백이든 환영합니다!

* Kotlin의 Slack에서 K2 개발자에게 직접 피드백을 전달해 주세요. [초대받기](https://surveys.jetbrains.com/s3/kotlin-slack-sign-up) 링크를 통해 참여한 후 [#k2-early-adopters](https://kotlinlang.slack.com/archives/C03PK0PE257) 채널에 접속하세요.
* 새로운 K2 컴파일러에서 직면한 모든 문제를 [이슈 트래커](https://kotl.in/issue)에 보고해 주세요.
* JetBrains가 K2 사용에 관한 익명 데이터를 수집할 수 있도록 [**Send usage statistics** 옵션을 활성화](https://www.jetbrains.com/help/idea/settings-usage-statistics.html)하세요.

## 언어 {id="language"}

Kotlin 1.9.0에서는 이전에 도입되었던 몇 가지 새로운 언어 기능을 안정화합니다.
* [enum 클래스 values 함수의 대체 기능](#stable-replacement-of-the-enum-class-values-function)
* [data class와의 대칭성을 위한 data object](#stable-data-objects-for-symmetry-with-data-classes)
* [인라인 값 클래스(inline value class) 내 본문이 있는 보조 생성자 지원](#support-for-secondary-constructors-with-bodies-in-inline-value-classes)

### enum 클래스 values 함수의 안정적인 대체 기능 {id="stable-replacement-of-the-enum-class-values-function"}

1.8.20에서는 enum 클래스의 `entries` 프로퍼티가 실험적(Experimental) 기능으로 도입되었습니다. `entries` 프로퍼티는 합성(synthetic) `values()` 함수를 대체하는 현대적이고 성능이 뛰어난 기능입니다. 1.9.0에서는 `entries` 프로퍼티가 안정화(Stable)되었습니다.

> `values()` 함수는 여전히 지원되지만 대신 `entries` 프로퍼티를 사용하는 것을 권장합니다.
>
{style="tip"}

```kotlin
enum class Color(val colorName: String, val rgb: String) {
    RED("Red", "#FF0000"),
    ORANGE("Orange", "#FF7F00"),
    YELLOW("Yellow", "#FFFF00")
}

fun findByRgb(rgb: String): Color? = Color.entries.find { it.rgb == rgb }
```
{validate="false"}

enum 클래스의 `entries` 프로퍼티에 대한 자세한 내용은 [Kotlin 1.8.20의 새로운 기능](whatsnew1820.md#a-modern-and-performant-replacement-of-the-enum-class-values-function)을 참조하세요.

### data class와의 대칭성을 위한 안정적인 data object {id="stable-data-objects-for-symmetry-with-data-classes"}

[Kotlin 1.8.20](whatsnew1820.md#preview-of-data-objects-for-symmetry-with-data-classes)에서 도입되었던 data object 선언이 이제 안정화(Stable)되었습니다. 여기에는 data class와의 대칭성을 위해 추가된 `toString()`, `equals()`, `hashCode()` 함수가 포함됩니다.

이 기능은 `data object` 선언을 `data class` 선언과 함께 편리하게 사용할 수 있기 때문에 `sealed` 계층 구조(`sealed class` 또는 `sealed interface` 계층 구조 등)에서 특히 유용합니다. 다음 예제에서는 `EndOfFile`을 일반 `object` 대신 `data object`로 선언하여 수동으로 재정의할 필요 없이 자동으로 `toString()` 함수를 갖게 됩니다. 이를 통해 함께 정의된 데이터 클래스와의 대칭성을 유지할 수 있습니다.

```kotlin
sealed interface ReadResult
data class Number(val number: Int) : ReadResult
data class Text(val text: String) : ReadResult
data object EndOfFile : ReadResult

fun main() {
    println(Number(7)) // Number(number=7)
    println(EndOfFile) // EndOfFile
}
```
{validate="false"}

자세한 내용은 [Kotlin 1.8.20의 새로운 기능](whatsnew1820.md#preview-of-data-objects-for-symmetry-with-data-classes)을 참조하세요.

### 인라인 값 클래스(inline value class) 내 본문이 있는 보조 생성자 지원 {id="support-for-secondary-constructors-with-bodies-in-inline-value-classes"}

Kotlin 1.9.0부터 [인라인 값 클래스](inline-classes.md)에서 본문이 있는 보조 생성자의 사용이 기본적으로 지원됩니다.

```kotlin
@JvmInline
value class Person(private val fullName: String) {
    // Kotlin 1.4.30부터 허용됨:
    init {
        check(fullName.isNotBlank()) {
            "Full name shouldn't be empty"
        }
    }
    // Kotlin 1.9.0부터 기본적으로 허용됨:
    constructor(name: String, lastName: String) : this("$name $lastName") {
        check(lastName.isNotBlank()) {
            "Last name shouldn't be empty"
        }
    }
}
```
{validate="false"}

이전에는 Kotlin에서 인라인 클래스에 공개 기본 생성자만 허용되었습니다. 그 결과, 내부 값을 캡슐화하거나 제약 조건이 있는 값을 나타내는 인라인 클래스를 생성하는 것이 불가능했습니다.

Kotlin이 발전함에 따라 이러한 문제들이 해결되었습니다. Kotlin 1.4.30에서는 `init` 블록에 대한 제한이 해제되었고, Kotlin 1.8.20에서는 본문이 있는 보조 생성자의 미리보기가 제공되었습니다. 이제 이 기능이 기본적으로 제공됩니다. Kotlin 인라인 클래스의 발전 과정에 대해 자세히 알아보려면 [이 KEEP](https://github.com/Kotlin/KEEP/blob/master/proposals/inline-classes.md)을 참조하세요.

## Kotlin/JVM {id="kotlin-jvm"}

버전 1.9.0부터 컴파일러는 JVM 20에 해당하는 바이트코드 버전을 가진 클래스를 생성할 수 있습니다. 또한 `JvmDefault` 어노테이션 및 기존 `-Xjvm-default` 모드의 지원 중단(deprecation) 절차가 계속 진행됩니다.

### JvmDefault 어노테이션 및 레거시 -Xjvm-default 모드 지원 중단 {id="deprecation-of-jvmdefault-annotation-and-legacy-xjvm-default-modes"}

Kotlin 1.5부터 `JvmDefault` 어노테이션의 사용은 새로운 `-Xjvm-default` 모드인 `all` 및 `all-compatibility`를 위해 deprecated되었습니다. Kotlin 1.4의 `JvmDefaultWithoutCompatibility`와 Kotlin 1.6의 `JvmDefaultWithCompatibility` 도입과 함께, 이러한 모드들은 `DefaultImpls` 클래스 생성에 대한 포괄적인 제어를 제공하여 이전 Kotlin 코드와의 원활한 호환성을 보장합니다.

이에 따라 Kotlin 1.9.0에서는 `JvmDefault` 어노테이션이 더 이상 아무런 효력을 갖지 않으며 deprecated로 표시되어 오류를 발생시킵니다. 이 어노테이션은 향후 Kotlin에서 완전히 제거될 예정입니다.

## Kotlin/Native {id="kotlin-native"}

기타 개선 사항 외에도 이번 릴리스에서는 [Kotlin/Native 메모리 관리자](native-memory-manager.md)의 견고성과 성능을 향상시키기 위한 추가적인 발전이 이루어졌습니다.

* [커스텀 메모리 할당자 미리보기](#preview-of-custom-memory-allocator)
* [메인 스레드에서의 Objective-C 또는 Swift 객체 메모리 해제(deallocation) 훅](#objective-c-or-swift-object-deallocation-hook-on-the-main-thread)
* [Kotlin/Native에서 상수 값 접근 시 객체 초기화 방지](#no-object-initialization-when-accessing-constant-values-in-kotlin-native)
* [iOS 시뮬레이터 테스트를 위한 독립형(standalone) 모드 구성 기능](#ability-to-configure-standalone-mode-for-ios-simulator-tests-in-kotlin-native)
* [Kotlin/Native의 라이브러리 링키지(Library linkage)](#library-linkage-in-kotlin-native)

### 커스텀 메모리 할당자 미리보기 {id="preview-of-custom-memory-allocator"}

Kotlin 1.9.0에서는 커스텀 메모리 할당자(custom memory allocator)의 미리보기를 도입합니다. 이 할당 시스템은 [Kotlin/Native 메모리 관리자](native-memory-manager.md)의 런타임 성능을 향상시킵니다.

현재 Kotlin/Native의 객체 할당 시스템은 효율적인 가비지 컬렉션을 위한 기능이 없는 범용 할당자를 사용합니다. 이를 보완하기 위해 가비지 컬렉터(GC)가 스위핑(sweeping) 중에 순회할 수 있는 단일 목록으로 병합하기 전까지, 할당된 모든 객체의 스레드 로컬 연결 리스트(thread-local linked list)를 유지합니다. 이러한 방식에는 몇 가지 성능상의 단점이 있습니다.

* 스위핑 순서가 메모리 지역성(memory locality)을 갖추지 못해 메모리 접근 패턴이 분산되는 경우가 많아 잠재적인 성능 문제를 유발합니다.
* 연결 리스트는 각 객체마다 추가 메모리를 필요로 하므로 특히 작은 크기의 객체를 많이 다룰 때 메모리 사용량이 증가합니다.
* 할당된 객체의 단일 목록 구조는 스위핑을 병렬화하기 어렵게 만들어, 뮤테이터(mutator) 스레드가 GC 스레드의 수거 속도보다 빠르게 객체를 할당할 때 메모리 사용량 문제를 일으킬 수 있습니다.

이러한 문제를 해결하기 위해 Kotlin 1.9.0에서는 커스텀 할당자의 미리보기를 도입합니다. 이 할당자는 시스템 메모리를 페이지로 나누어 연속적인 순서로 독립적인 스위핑이 가능하도록 합니다. 각 할당은 페이지 내의 메모리 블록이 되며, 페이지는 블록 크기를 추적합니다. 다양한 할당 크기에 맞게 서로 다른 페이지 유형이 최적화되어 있습니다. 메모리 블록이 연속적으로 배치되어 할당된 모든 블록을 효율적으로 순회할 수 있습니다.

스레드가 메모리를 할당할 때 할당 크기에 따라 적합한 페이지를 검색합니다. 스레드는 다양한 크기 범주에 대한 페이지 집합을 유지합니다. 일반적으로 주어진 크기에 대한 현재 페이지가 할당을 수용할 수 있습니다. 그렇지 않은 경우 스레드는 공유 할당 공간에서 다른 페이지를 요청합니다. 이 페이지는 이미 사용 가능할 수도 있고, 스위핑이 필요할 수도 있으며, 새로 생성해야 할 수도 있습니다.

새로운 할당자는 동시에 여러 개의 독립적인 할당 공간을 가질 수 있게 해주어, Kotlin 팀이 성능을 더욱 향상시키기 위해 다양한 페이지 레이아웃을 실험해 볼 수 있도록 지원합니다.

새로운 할당자의 설계에 대한 자세한 내용은 이 [README](https://github.com/JetBrains/kotlin/blob/master/kotlin-native/runtime/src/alloc/custom/README.md)를 참조하세요.

#### 활성화 방법 {id="how-to-enable"}

`-Xallocator=custom` 컴파일러 옵션을 추가합니다.

```kotlin
kotlin {
    macosX64("native") {
        binaries.executable()

        compilations.configureEach {
            compilerOptions.configure {
                freeCompilerArgs.add("-Xallocator=custom")
            }
        }
    }
}
```
{validate="false"}

#### 피드백 남기기 {id="leave-feedback"}

커스텀 할당자를 개선할 수 있도록 [YouTrack](https://youtrack.jetbrains.com/issue/KT-55364/Implement-custom-allocator-for-Kotlin-Native)에 피드백을 남겨주시면 감사하겠습니다.

### 메인 스레드에서의 Objective-C 또는 Swift 객체 메모리 해제(deallocation) 훅 {id="objective-c-or-swift-object-deallocation-hook-on-the-main-thread"}

Kotlin 1.9.0부터 객체가 메인 스레드에서 Kotlin으로 전달된 경우, Objective-C 또는 Swift 객체 메모리 해제 훅이 메인 스레드에서 호출됩니다. 이전에 [Kotlin/Native 메모리 관리자](native-memory-manager.md)가 Objective-C 객체에 대한 참조를 처리하던 방식은 메모리 누수를 유발할 수 있었습니다. 새로운 동작을 통해 메모리 관리자의 견고성이 향상될 것으로 기대합니다.

Kotlin 코드에서 참조되는 Objective-C 객체를 예로 들어보겠습니다(예: 인수로 전달되거나, 함수에서 반환되거나, 컬렉션에서 가져온 경우). 이 경우 Kotlin은 Objective-C 객체에 대한 참조를 유지하는 자체 객체를 생성합니다. Kotlin 객체의 메모리가 해제되면 Kotlin/Native 런타임은 해당 Objective-C 참조를 해제하는 `objc_release` 함수를 호출합니다.

이전에는 Kotlin/Native 메모리 관리자가 전용 GC 스레드에서 `objc_release`를 실행했습니다. 이것이 객체의 마지막 참조라면 객체의 메모리가 해제됩니다. 하지만 Objective-C 객체에 커스텀 메모리 해제 훅(예: Objective-C의 `dealloc` 메서드나 Swift의 `deinit` 블록)이 있고 이러한 훅이 특정 스레드에서 호출되기를 기대하는 경우 문제가 발생할 수 있었습니다.

메인 스레드에 있는 객체의 훅은 대개 메인 스레드에서 호출될 것을 기대하므로, Kotlin/Native 런타임 역시 메인 스레드에서 `objc_release`를 호출합니다. 이를 통해 메인 스레드에서 Objective-C 객체가 Kotlin으로 전달되어 메인 스레드에 Kotlin 피어(peer) 객체가 생성되는 사례를 처리할 수 있습니다. 이는 일반적인 UI 애플리케이션과 같이 메인 디스패치 큐(main dispatch queue)가 처리되는 경우에만 작동합니다. 메인 큐가 아니거나 객체가 메인 스레드가 아닌 다른 스레드에서 Kotlin으로 전달된 경우, `objc_release`는 이전과 마찬가지로 전용 GC 스레드에서 호출됩니다.

#### 비활성화 방법 {id="how-to-opt-out"}

문제가 발생하는 경우 `gradle.properties` 파일에서 다음 옵션을 사용하여 이 동작을 비활성화할 수 있습니다.

```none
kotlin.native.binary.objcDisposeOnMain=false
```

이러한 사례가 발생하면 언제든지 [이슈 트래커](https://kotl.in/issue)에 보고해 주세요.

### Kotlin/Native에서 상수 값 접근 시 객체 초기화 방지 {id="no-object-initialization-when-accessing-constant-values-in-kotlin-native"}

Kotlin 1.9.0부터 Kotlin/Native 백엔드는 `const val` 필드에 접근할 때 객체를 초기화하지 않습니다.

```kotlin
object MyObject {
    init {
        println("side effect!")
    }

    const val y = 1
}

fun main() {
    println(MyObject.y) // 처음에는 초기화되지 않음
    val x = MyObject    // 초기화가 발생함
    println(x.y)
}
```
{validate="false"}

이제 이 동작은 Java와 일관되게 구현되어 이러한 경우 객체가 절대 초기화되지 않는 Kotlin/JVM과 통합되었습니다. 또한 이 변경 덕분에 Kotlin/Native 프로젝트에서 일부 성능 향상을 기대할 수 있습니다.

### iOS 시뮬레이터 테스트를 위한 독립형(standalone) 모드 구성 기능 {id="ability-to-configure-standalone-mode-for-ios-simulator-tests-in-kotlin-native"}

기본적으로 Kotlin/Native용 iOS 시뮬레이터 테스트를 실행할 때는 수동으로 시뮬레이터를 부팅하고 종료하지 않도록 `--standalone` 플래그가 사용됩니다. 1.9.0에서는 이제 `standalone` 프로퍼티를 통해 Gradle 태스크에서 이 플래그를 사용할지 여부를 구성할 수 있습니다. 기본적으로 `--standalone` 플래그가 사용되므로 독립형 모드가 활성화되어 있습니다.

다음은 `build.gradle.kts` 파일에서 독립형 모드를 비활성화하는 방법의 예입니다.

```kotlin
tasks.withType<org.jetbrains.kotlin.gradle.targets.native.tasks.KotlinNativeSimulatorTest>().configureEach {
    standalone.set(false)
}
```
{validate="false"}

> 독립형 모드를 비활성화하면 시뮬레이터를 수동으로 부팅해야 합니다. CLI에서 시뮬레이터를 부팅하려면
> 다음 명령을 사용할 수 있습니다.
>
> ```shell
> /usr/bin/xcrun simctl boot <DeviceId>
>```
>
{style="warning"}

### Kotlin/Native의 라이브러리 링키지(Library linkage) {id="library-linkage-in-kotlin-native"}

Kotlin 1.9.0부터 Kotlin/Native 컴파일러는 Kotlin 라이브러리의 링키지 문제를 Kotlin/JVM과 동일한 방식으로 처리합니다.
하나의 서드파티 Kotlin 라이브러리 작성자가 다른 서드파티 Kotlin 라이브러리가 사용하는 실험적 API를 호환되지 않게 변경할 경우 이러한 문제가 발생할 수 있습니다.

이제 서드파티 Kotlin 라이브러리 간에 링키지 문제가 발생하더라도 컴파일 도중 빌드가 실패하지 않습니다. 대신 JVM과 정확히 동일하게 런타임에서만 이러한 오류가 발생합니다.

Kotlin/Native 컴파일러는 라이브러리 링키지 관련 문제를 감지할 때마다 경고를 보고합니다. 컴파일 로그에서 다음과 같은 경고를 확인할 수 있습니다.

```text
No function found for symbol 'org.samples/MyRemovedClass.doSomething|3657632771909858561[0]'

Can not get instance of singleton 'MyEnumClass.REMOVED_ENTRY': No enum entry found for symbol 'org.samples/MyEnumClass.REMOVED_ENTRY|null[0]'

Function 'getMyRemovedClass' can not be called: Function uses unlinked class symbol 'org.samples/MyRemovedClass|null[0]'
```

프로젝트에서 이 동작을 추가로 구성하거나 비활성화할 수도 있습니다.

* 컴파일 로그에 이러한 경고가 표시되지 않도록 하려면 `-Xpartial-linkage-loglevel=INFO` 컴파일러 옵션으로 경고를 억제하세요.
* `-Xpartial-linkage-loglevel=ERROR`를 사용하여 보고된 경고의 심각도를 컴파일 오류로 높일 수도 있습니다. 이 경우 컴파일이 실패하며 컴파일 로그에서 모든 오류를 볼 수 있습니다. 링키지 문제를 더 면밀히 조사할 때 이 옵션을 사용하세요.
* 이 기능으로 인해 예기치 않은 문제가 발생하는 경우 언제든지 `-Xpartial-linkage=disable` 컴파일러 옵션을 사용하여 비활성화할 수 있습니다. 이러한 사례가 발생하면 망설이지 말고 [이슈 트래커](https://kotl.in/issue)에 보고해 주세요.

```kotlin
// Gradle 빌드 파일을 통해 컴파일러 옵션을 전달하는 예시
kotlin {
    macosX64("native") {
        binaries.executable()

        compilations.configureEach {
            compilerOptions.configure {
                // 링키지 경고 억제:
                freeCompilerArgs.add("-Xpartial-linkage-loglevel=INFO")

                // 링키지 경고를 오류로 격상:
                freeCompilerArgs.add("-Xpartial-linkage-loglevel=ERROR")

                // 기능 완전 비활성화:
                freeCompilerArgs.add("-Xpartial-linkage=disable")
            }
        }
    }
}
```
{validate="false"}

### C 상호 운용성(C interop) 암시적 정수 변환을 위한 컴파일러 옵션 {id="compiler-option-for-c-interop-implicit-integer-conversions"}

C 상호 운용성에서 암시적 정수 변환(implicit integer conversion)을 사용할 수 있는 컴파일러 옵션을 도입했습니다. 신중한 검토 끝에, 이 기능에는 아직 개선의 여지가 있고 최고 수준의 API 품질을 유지하기 위해 의도치 않은 사용을 방지하고자 이 컴파일러 옵션을 도입했습니다.

이 코드 샘플에서는 [`options`](https://developer.apple.com/documentation/foundation/nscalendar/options)가 부호 없는 타입인 `UInt`이고 `0`은 부호가 있는 정수임에도 불구하고 암시적 정수 변환을 통해 `options = 0`을 허용합니다.

```kotlin
val today = NSDate()
val tomorrow = NSCalendar.currentCalendar.dateByAddingUnit(
    unit = NSCalendarUnitDay,
    value = 1,
    toDate = today,
    options = 0
)
```
{validate="false"}

네이티브 상호 운용성 라이브러리에서 암시적 변환을 사용하려면 `-XXLanguage:+ImplicitSignedToUnsignedIntegerConversion` 컴파일러 옵션을 사용하세요.

Gradle의 `build.gradle.kts` 파일에서 다음과 같이 구성할 수 있습니다.
```kotlin
tasks.withType<org.jetbrains.kotlin.gradle.tasks.KotlinNativeCompile>().configureEach {
    compilerOptions.freeCompilerArgs.addAll(
        "-XXLanguage:+ImplicitSignedToUnsignedIntegerConversion"
    )
}
```
{validate="false"}

## Kotlin Multiplatform {id="kotlin-multiplatform"}

Kotlin Multiplatform은 1.9.0에서 개발자 경험을 향상시키기 위해 몇 가지 주목할 만한 업데이트를 진행했습니다.

* [Android 타깃 지원 변경 사항](#changes-to-android-target-support)
* [새로운 Android 소스 세트 레이아웃 기본 활성화](#new-android-source-set-layout-enabled-by-default)
* [멀티플랫폼 프로젝트의 Gradle configuration cache 미리보기](#preview-of-the-gradle-configuration-cache)

### Android 타깃 지원 변경 사항 {id="changes-to-android-target-support"}

Kotlin Multiplatform을 안정화하기 위한 노력을 계속하고 있습니다. 중요한 단계 중 하나는 Android 타깃에 대한 일급(first-class) 지원을 제공하는 것입니다. 향후 Google의 Android 팀에서 Kotlin Multiplatform의 Android를 지원하기 위한 자체 Gradle 플러그인을 제공할 예정임을 발표하게 되어 기쁩니다.

Google의 이 새로운 솔루션을 위한 길을 열기 위해, 1.9.0의 현재 Kotlin DSL에서 `android` 블록의 이름을 변경합니다. 빌드 스크립트에서 `android` 블록이 나타나는 모든 부분을 `androidTarget`으로 변경해 주시기 바랍니다. 이는 향후 출시될 Google DSL을 위해 `android`라는 이름을 비워두기 위해 필요한 일시적인 변경 사항입니다.

Google 플러그인은 멀티플랫폼 프로젝트에서 Android를 다루는 데 선호되는 방식이 될 것입니다. 플러그인이 준비되면 이전처럼 짧은 `android` 이름을 사용할 수 있도록 필요한 마이그레이션 가이드를 제공할 예정입니다.

### 새로운 Android 소스 세트 레이아웃 기본 활성화 {id="new-android-source-set-layout-enabled-by-default"}

Kotlin 1.9.0부터 새로운 Android 소스 세트 레이아웃이 기본으로 적용됩니다. 여러모로 혼란을 야기했던 이전 디렉터리 명명 체계를 대체합니다. 새로운 레이아웃은 여러 가지 장점을 제공합니다.

* 간소화된 타입 시맨틱 – 새로운 Android 소스 레이아웃은 명확하고 일관된 명명 규칙을 제공하여 다양한 유형의 소스 세트를 쉽게 구별할 수 있도록 돕습니다.
* 개선된 소스 디렉터리 레이아웃 – 새로운 레이아웃을 통해 `SourceDirectories` 배치가 더욱 정연해져 코드를 정리하고 소스 파일을 찾기가 쉬워집니다.
* 명확한 Gradle 구성 명명 체계 – 이제 `KotlinSourceSets`와 `AndroidSourceSets` 양쪽 모두에서 체계가 더욱 일관되고 예측 가능해집니다.

새로운 레이아웃을 사용하려면 Android Gradle 플러그인 버전 7.0 이상이 필요하며, Android Studio 2022.3 이상에서 지원됩니다. `build.gradle(.kts)` 파일에서 필요한 변경 작업을 수행하려면 [마이그레이션 가이드](https://kotlinlang.org/docs/multiplatform/multiplatform-android-layout.html)를 참조하세요.

### Gradle configuration cache 미리보기 {id="preview-of-the-gradle-configuration-cache"}

<p id="preview-of-gradle-configuration-cache">Kotlin 1.9.0에는 멀티플랫폼 라이브러리에서 <a href="https://docs.gradle.org/current/userguide/configuration_cache.html">Gradle configuration cache</a>를 지원하는 기능이 포함되어 있습니다. 라이브러리 개발자라면 향상된 빌드 성능의 혜택을 이미 누릴 수 있습니다.</p>

Gradle configuration cache는 후속 빌드에서 구성 단계(configuration phase)의 결과를 재사용하여 빌드 프로세스 속도를 높입니다. 이 기능은 Gradle 8.1부터 안정화(Stable)되었습니다. 이 기능을 활성화하려면 [Gradle 문서](https://docs.gradle.org/current/userguide/configuration_cache.html#config_cache:usage)의 지침을 따르세요.

> Kotlin Multiplatform 플러그인은 아직 Xcode 통합 태스크 또는 [Kotlin CocoaPods Gradle 플러그인](https://kotlinlang.org/docs/multiplatform/multiplatform-cocoapods-dsl-reference.html)과의 Gradle configuration cache 사용을 지원하지 않습니다. 향후 Kotlin 릴리스에서 이 기능이 추가될 예정입니다.
>
{style="note"}

## Kotlin/Wasm {id="kotlin-wasm"}

Kotlin 팀은 새로운 Kotlin/Wasm 타깃에 대한 실험을 계속 진행하고 있습니다. 이번 릴리스에서는 [JavaScript 상호 운용성 업데이트](#updates-in-javascript-interop)와 함께 몇 가지 성능 및 [크기 관련 최적화](#size-related-optimizations)를 도입했습니다.

### 크기 관련 최적화 {id="size-related-optimizations"}

Kotlin 1.9.0에서는 WebAssembly(Wasm) 프로젝트를 위한 대대적인 크기 개선이 이루어졌습니다. 두 개의 "Hello World" 프로젝트를 비교했을 때, Kotlin 1.9.0의 Wasm 코드 크기는 Kotlin 1.8.20에 비해 10배 이상 작아졌습니다.

![Kotlin/Wasm size-related optimizations](wasm-1-9-0-size-improvements.png){width=700}

이러한 크기 최적화를 통해 Kotlin 코드로 Wasm 플랫폼을 타깃팅할 때 더욱 효율적인 리소스 활용과 향상된 성능을 얻을 수 있습니다.

### JavaScript 상호 운용성 업데이트 {id="updates-in-javascript-interop"}

이번 Kotlin 업데이트에서는 Kotlin/Wasm의 Kotlin 및 JavaScript 간 상호 운용성에 변화가 도입되었습니다. Kotlin/Wasm은 [실험적(Experimental)](components-stability.md#stability-levels-explained) 기능이므로 상호 운용성에 특정 제한 사항이 적용됩니다.

#### Dynamic 타입 제한 {id="restriction-of-dynamic-types"}

버전 1.9.0부터 Kotlin은 Kotlin/Wasm에서 `Dynamic` 타입의 사용을 더 이상 지원하지 않습니다. 이는 JavaScript 상호 운용성을 용이하게 하는 새로운 범용 `JsAny` 타입을 위해 deprecated되었습니다.

자세한 내용은 [Kotlin/Wasm의 JavaScript 상호 운용성](wasm-js-interop.md) 문서를 참조하세요.

#### 비 external(non-external) 타입 제한 {id="restriction-of-non-external-types"}

Kotlin/Wasm은 JavaScript와 값을 주고받을 때 특정 Kotlin 정적 타입에 대한 변환을 지원합니다. 지원되는 타입은 다음과 같습니다.

* 부호 있는 숫자, `Boolean`, `Char` 등의 기본형(primitives).
* `String`.
* 함수 타입.

다른 타입들은 불투명한 참조(opaque reference) 형태로 변환 없이 전달되었으며, 이로 인해 JavaScript와 Kotlin 서브타이핑 간의 불일치가 발생했습니다.

이를 해결하기 위해 Kotlin은 JavaScript 상호 운용성을 잘 지원되는 타입 집합으로 제한합니다. Kotlin 1.9.0부터 Kotlin/Wasm의 JavaScript 상호 운용성에서는 external, 기본형, 문자열, 함수 타입만 지원됩니다. 또한 JavaScript 상호 운용성에서 사용할 수 있는 Kotlin/Wasm 객체에 대한 핸들을 나타내기 위해 `JsReference`라는 별도의 명시적 타입이 도입되었습니다.

자세한 내용은 [Kotlin/Wasm의 JavaScript 상호 운용성](wasm-js-interop.md) 문서를 참조하세요.

### Kotlin Playground의 Kotlin/Wasm 지원 {id="kotlin-wasm-in-kotlin-playground"}

Kotlin Playground에서 Kotlin/Wasm 타깃을 지원합니다.
Kotlin/Wasm을 타깃으로 하는 Kotlin 코드를 작성, 실행, 공유할 수 있습니다. [확인해 보세요!](https://pl.kotl.in/HDFAvimga)

> Kotlin/Wasm을 사용하려면 브라우저에서 실험적 기능을 활성화해야 합니다.
>
> [이러한 기능을 활성화하는 방법에 대해 자세히 알아보기](wasm-configuration.md).
>
{style="note"}

```kotlin
import kotlin.time.*
import kotlin.time.measureTime

fun main() {
    println("Hello from Kotlin/Wasm!")
    computeAck(3, 10)
}

tailrec fun ack(m: Int, n: Int): Int = when {
    m == 0 -> n + 1
    n == 0 -> ack(m - 1, 1)
    else -> ack(m - 1, ack(m, n - 1))
}

fun computeAck(m: Int, n: Int) {
    var res = 0
    val t = measureTime {
        res = ack(m, n)
    }
    println()
    println("ack($m, $n) = ${res}")
    println("duration: ${t.inWholeNanoseconds / 1e6} ms")
}
```
{kotlin-runnable="true" id="kotlin-whats-new-1-9-0-kotlin-wasm-playground"}

## Kotlin/JS {id="kotlin-js"}

이번 릴리스에서는 기존 Kotlin/JS 컴파일러 제거, Kotlin/JS Gradle 플러그인 지원 중단, ES2015에 대한 실험적 지원 등 Kotlin/JS 관련 업데이트가 포함되었습니다.

* [기존 Kotlin/JS 컴파일러 제거](#removal-of-the-old-kotlin-js-compiler)
* [Kotlin/JS Gradle 플러그인 지원 중단](#deprecation-of-the-kotlin-js-gradle-plugin)
* [external enum 지원 중단](#deprecation-of-external-enum)
* [ES2015 클래스 및 모듈에 대한 실험적 지원](#experimental-support-for-es2015-classes-and-modules)
* [JS 프로덕션 배포의 기본 대상 디렉터리 변경](#changed-default-destination-of-js-production-distribution)
* [stdlib-js에서 org.w3c 선언 분리](#extract-org-w3c-declarations-from-stdlib-js)

> 1.9.0 버전부터 Kotlin/JS에서도 [부분 라이브러리 링키지(partial library linkage)](#library-linkage-in-kotlin-native)가 활성화됩니다.
>
{style="note"}

### 기존 Kotlin/JS 컴파일러 제거 {id="removal-of-the-old-kotlin-js-compiler"}

Kotlin 1.8.0에서 IR 기반 백엔드가 [안정화(Stable)](components-stability.md)되었음을 [발표](whatsnew18.md#stable-js-ir-compiler-backend)했습니다.
그 이후로 컴파일러를 지정하지 않으면 오류가 발생했고, 구형 컴파일러를 사용하면 경고가 출력되었습니다.

Kotlin 1.9.0에서는 구형 백엔드를 사용할 경우 오류가 발생합니다. IR 컴파일러로 마이그레이션해 주시기 바랍니다.

### Kotlin/JS Gradle 플러그인 지원 중단 {id="deprecation-of-the-kotlin-js-gradle-plugin"}

Kotlin 1.9.0부터 `kotlin-js` Gradle 플러그인이 deprecated되었습니다. 대신 `js()` 타깃이 설정된 `kotlin-multiplatform` Gradle 플러그인을 사용하는 것을 권장합니다.

Kotlin/JS Gradle 플러그인의 기능은 본질적으로 `kotlin-multiplatform` 플러그인과 중복되었으며 내부적으로 동일한 구현을 공유했습니다. 이러한 중복은 혼란을 초래하고 Kotlin 팀의 유지보수 부담을 가중시켰습니다.

마이그레이션 지침은 [Kotlin Multiplatform 호환성 가이드](https://kotlinlang.org/docs/multiplatform/multiplatform-compatibility-guide.html#migration-from-kotlin-js-gradle-plugin-to-kotlin-multiplatform-gradle-plugin)를 참조하세요. 가이드에서 다루지 않는 문제가 발견되면 [이슈 트래커](http://kotl.in/issue)에 보고해 주세요.

### external enum 지원 중단 {id="deprecation-of-external-enum"}

Kotlin 1.9.0에서는 Kotlin 외부에 존재할 수 없는 `entries`와 같은 정적 enum 멤버 문제로 인해 external enum의 사용이 deprecated됩니다. 대신 객체 하위 클래스(object subclass)를 갖는 external sealed class를 사용하는 것을 권장합니다.

```kotlin
// 이전
external enum class ExternalEnum { A, B }

// 이후
external sealed class ExternalEnum {
    object A: ExternalEnum
    object B: ExternalEnum
}
```
{validate="false"}

객체 하위 클래스를 갖는 external sealed class로 전환하면 기본 메서드와 관련된 문제를 방지하면서 external enum과 유사한 기능을 구현할 수 있습니다.

Kotlin 1.9.0부터 external enum의 사용은 deprecated로 표시됩니다. 향후 호환성과 유지보수를 위해 제안된 external sealed class 구현을 사용하도록 코드를 업데이트하는 것을 권장합니다.

### ES2015 클래스 및 모듈에 대한 실험적 지원 {id="experimental-support-for-es2015-classes-and-modules"}

이번 릴리스에서는 ES2015 모듈 및 ES2015 클래스 생성에 대한 [실험적(Experimental)](components-stability.md#stability-levels-explained) 지원을 도입합니다.
* 모듈을 사용하면 코드베이스를 단순화하고 유지보수성을 향상시킬 수 있습니다.
* 클래스를 통해 객체 지향 프로그래밍(OOP) 원칙을 적용하여 더 깔끔하고 직관적인 코드를 작성할 수 있습니다.

이러한 기능을 활성화하려면 `build.gradle.kts` 파일을 적절히 업데이트하세요.

```kotlin
// build.gradle.kts
kotlin {
    js(IR) {
        useEsModules() // ES2015 모듈 활성화
        browser()
    }
}

// ES2015 클래스 생성 활성화
tasks.withType<KotlinJsCompile>().configureEach {
    kotlinOptions {
        useEsClasses = true
    }
}
```
{validate="false"}

[공식 문서에서 ES2015(ECMAScript 2015, ES6)에 대해 자세히 알아보세요](https://262.ecma-international.org/6.0/).

### JS 프로덕션 배포의 기본 대상 디렉터리 변경 {id="changed-default-destination-of-js-production-distribution"}

Kotlin 1.9.0 이전에는 배포 대상 디렉터리가 `build/distributions`였습니다. 하지만 이 디렉터리는 Gradle 아카이브에서 흔히 사용하는 공용 디렉터리입니다. 이 문제를 해결하기 위해 Kotlin 1.9.0에서는 기본 배포 대상 디렉터리를 `build/dist/<targetName>/<binaryName>`으로 변경했습니다.

예를 들어 기존에 `build/distributions`에 위치하던 `productionExecutable`은 Kotlin 1.9.0에서 `build/dist/js/productionExecutable`에 위치하게 됩니다.

> 이러한 빌드 결과를 사용하는 파이프라인이 구성되어 있다면 디렉터리 경로를 반드시 업데이트하세요.
>
{style="warning"}

### stdlib-js에서 org.w3c 선언 분리 {id="extract-org-w3c-declarations-from-stdlib-js"}

Kotlin 1.9.0부터 `stdlib-js`에는 더 이상 `org.w3c` 선언이 포함되지 않습니다. 대신 이 선언들은 별도의 Gradle 종속성으로 분리되었습니다. `build.gradle.kts` 파일에 Kotlin Multiplatform Gradle 플러그인을 추가하면 표준 라이브러리와 유사하게 이 선언들이 프로젝트에 자동으로 포함됩니다.

수동으로 작업하거나 마이그레이션할 필요는 없습니다. 필요한 조정 작업은 자동으로 처리됩니다.

## Gradle {id="gradle"}

Kotlin 1.9.0에는 새로운 Gradle 컴파일러 옵션을 비롯한 다양한 개선 사항이 포함되어 있습니다.

* [제거된 classpath 프로퍼티](#removed-classpath-property)
* [새로운 Gradle 컴파일러 옵션](#new-compiler-options)
* [Kotlin/JVM을 위한 프로젝트 수준 컴파일러 옵션](#project-level-compiler-options-for-kotlin-jvm)
* [Kotlin/Native 모듈 이름을 위한 컴파일러 옵션](#compiler-option-for-kotlin-native-module-name)
* [공식 Kotlin 라이브러리를 위한 별도 컴파일러 플러그인](#separate-compiler-plugins-for-official-kotlin-libraries)
* [지원 최소 버전 상향](#incremented-minimum-supported-version)
* [kapt의 즉시 태스크 생성 방지](#kapt-doesn-t-cause-eager-task-creation-in-gradle)
* [JVM 타깃 검증 모드의 프로그래밍 방식 구성](#programmatic-configuration-of-the-jvm-target-validation-mode)

### 제거된 classpath 프로퍼티 {id="removed-classpath-property"}

Kotlin 1.7.0에서 `KotlinCompile` 태스크의 `classpath` 프로퍼티에 대한 지원 중단 주기가 시작되었음을 알렸습니다. Kotlin 1.8.0에서는 지원 중단 수준이 `ERROR`로 상향되었습니다. 이번 릴리스에서는 마침내 `classpath` 프로퍼티가 제거되었습니다. 이제 모든 컴파일 태스크는 컴파일에 필요한 라이브러리 목록에 대해 `libraries` 입력을 사용해야 합니다.

### 새로운 컴파일러 옵션 {id="new-compiler-options"}

이제 Kotlin Gradle 플러그인에서 opt-in 및 컴파일러 progressive 모드를 위한 새로운 프로퍼티를 제공합니다.

* 새로운 API를 opt-in하려면 이제 `optIn` 프로퍼티를 사용하고 `optIn.set(listOf(a, b, c))`와 같이 문자열 목록을 전달할 수 있습니다.
* progressive 모드를 활성화하려면 `progressiveMode.set(true)`를 사용하세요.

### Kotlin/JVM을 위한 프로젝트 수준 컴파일러 옵션 {id="project-level-compiler-options-for-kotlin-jvm"}

Kotlin 1.9.0부터 `kotlin` 구성 블록 내부에서 새로운 `compilerOptions` 블록을 사용할 수 있습니다.

```kotlin
kotlin {
    compilerOptions {
        jvmTarget.set(JVM.Target_11)
    }
}
```
{validate="false"}

이를 통해 컴파일러 옵션을 훨씬 더 쉽게 구성할 수 있습니다. 그러나 몇 가지 중요한 세부 사항에 유의해야 합니다.

* 이 구성은 프로젝트 수준에서만 작동합니다.
* Android 플러그인의 경우 이 블록은 다음 블록과 동일한 객체를 구성합니다.

```kotlin
android {
    kotlinOptions {}
}
```
{validate="false"}

* `android.kotlinOptions`와 `kotlin.compilerOptions` 구성 블록은 서로를 재정의(override)합니다. 빌드 파일에서 가장 마지막(아래쪽)에 위치한 블록이 항상 적용됩니다.
* `moduleName`이 프로젝트 수준에서 구성된 경우 컴파일러로 전달될 때 해당 값이 변경될 수 있습니다. `main` 컴파일의 경우는 그렇지 않지만 테스트 소스와 같은 다른 유형의 경우 Kotlin Gradle 플러그인이 `_test` 접미사를 추가합니다.
* `tasks.withType<KotlinJvmCompile>().configureEach {}`(또는 `tasks.named<KotlinJvmCompile>("compileKotlin") { }`) 내부의 구성은 `kotlin.compilerOptions`와 `android.kotlinOptions`를 모두 재정의합니다.

### Kotlin/Native 모듈 이름을 위한 컴파일러 옵션 {id="compiler-option-for-kotlin-native-module-name"}

이제 Kotlin Gradle 플러그인에서 Kotlin/Native [`module-name`](compiler-reference.md#module-name-name-native) 컴파일러 옵션을 쉽게 사용할 수 있습니다.

이 옵션은 컴파일 모듈의 이름을 지정하며, Objective-C로 내보낸 선언에 접두사 이름을 추가하는 데에도 사용할 수 있습니다.

이제 Gradle 빌드 파일의 `compilerOptions` 블록에서 직접 모듈 이름을 설정할 수 있습니다.

<tabs group="build-script">
<tab title="Kotlin" group-key="kotlin">

```kotlin
tasks.named<org.jetbrains.kotlin.gradle.tasks.KotlinNativeCompile>("compileKotlinLinuxX64") {
    compilerOptions {
        moduleName.set("my-module-name")
    }
}
```

</tab>
<tab title="Groovy" group-key="groovy">

```groovy
tasks.named("compileKotlinLinuxX64", org.jetbrains.kotlin.gradle.tasks.KotlinNativeCompile.class) {
    compilerOptions {
        moduleName = "my-module-name"
    }
}
```

</tab>
</tabs>

### 공식 Kotlin 라이브러리를 위한 별도 컴파일러 플러그인 {id="separate-compiler-plugins-for-official-kotlin-libraries"}

Kotlin 1.9.0에서는 공식 라이브러리를 위한 별도의 컴파일러 플러그인을 도입합니다. 이전에는 컴파일러 플러그인이 해당하는 Gradle 플러그인 내에 내장되어 있었습니다. 이로 인해 컴파일러 플러그인이 Gradle 빌드의 Kotlin 런타임 버전보다 높은 Kotlin 버전으로 컴파일된 경우 호환성 문제가 발생할 수 있었습니다.

이제 컴파일러 플러그인이 별도의 종속성으로 추가되므로 이전 Gradle 버전과의 호환성 문제가 더 이상 발생하지 않습니다. 이 새로운 접근 방식의 또 다른 주요 장점은 [Bazel](https://bazel.build/)과 같은 다른 빌드 시스템에서도 새로운 컴파일러 플러그인을 사용할 수 있다는 것입니다.

Maven Central에 새로 게시되는 컴파일러 플러그인 목록은 다음과 같습니다.

* kotlin-atomicfu-compiler-plugin
* kotlin-allopen-compiler-plugin
* kotlin-lombok-compiler-plugin
* kotlin-noarg-compiler-plugin
* kotlin-sam-with-receiver-compiler-plugin
* kotlinx-serialization-compiler-plugin

각 플러그인에는 대응하는 `-embeddable` 버전이 존재합니다. 예를 들어 `kotlin-allopen-compiler-plugin-embeddable`은 스크립팅 아티팩트의 기본 옵션인 `kotlin-compiler-embeddable` 아티팩트와 함께 작동하도록 설계되었습니다.

Gradle은 이러한 플러그인을 컴파일러 인수로 추가합니다. 기존 프로젝트를 수정할 필요는 없습니다.

### 지원 최소 버전 상향 {id="incremented-minimum-supported-version"}

Kotlin 1.9.0부터 지원되는 최소 Android Gradle 플러그인 버전은 4.2.2입니다.

문서에서 [사용 가능한 Gradle 버전과의 Kotlin Gradle 플러그인 호환성](gradle-configure-project.md#apply-the-plugin)을 확인하세요.

### kapt의 즉시 태스크 생성 방지 {id="kapt-doesn-t-cause-eager-task-creation-in-gradle"}

1.9.0 이전에는 [kapt 컴파일러 플러그인](kapt.md)이 Kotlin 컴파일 태스크의 구성된 인스턴스를 요청하여 즉각적인 태스크 생성(eager task creation)을 유발했습니다. 이 동작은 Kotlin 1.9.0에서 수정되었습니다. `build.gradle.kts` 파일에 기본 구성을 사용하는 경우 이 변경 사항으로 인한 영향은 없습니다.

> 커스텀 구성을 사용하는 경우 환경에 부정적인 영향을 줄 수 있습니다.
> 예를 들어 Gradle의 tasks API를 사용하여 `KotlinJvmCompile` 태스크를 수정한 경우 빌드 스크립트에서 `KaptGenerateStubs`
> 태스크도 유사하게 수정해야 합니다.
>
> 예를 들어 스크립트에 `KotlinJvmCompile` 태스크에 대한 다음과 같은 구성이 있는 경우:
> ```kotlin
> tasks.named<KotlinJvmCompile>("compileKotlin") { // 사용자 지정 구성 }
> ```
> {validate="false"}
>
> 이 경우 `KaptGenerateStubs` 태스크의 일부로 동일한 수정 사항이 포함되어 있는지 확인해야 합니다.
> ```kotlin
> tasks.named<KaptGenerateStubs>("kaptGenerateStubs") { // 사용자 지정 구성 }
>```
> {validate="false"}
> 
{style="warning"}

자세한 내용은 [YouTrack 티켓](https://youtrack.jetbrains.com/issue/KT-54468/KAPT-Gradle-plugin-causes-eager-task-creation)을 참조하세요.

### JVM 타깃 검증 모드의 프로그래밍 방식 구성 {id="programmatic-configuration-of-the-jvm-target-validation-mode"}

Kotlin 1.9.0 이전에는 Kotlin과 Java 간의 JVM 타깃 비호환성 감지를 조정하는 방법이 단 하나뿐이었습니다. 전체 프로젝트에 대해 `gradle.properties`에 `kotlin.jvm.target.validation.mode=ERROR`를 설정해야 했습니다.

이제 `build.gradle.kts` 파일에서 태스크 수준으로 이를 구성할 수도 있습니다.

```kotlin
tasks.named<org.jetbrains.kotlin.gradle.tasks.KotlinJvmCompile>("compileKotlin") {
    jvmTargetValidationMode.set(org.jetbrains.kotlin.gradle.dsl.jvm.JvmTargetValidationMode.WARNING)
}
```
{validate="false"}

## 표준 라이브러리 {id="standard-library"}

Kotlin 1.9.0에서는 표준 라이브러리에 다음과 같은 몇 가지 주요 개선 사항이 적용되었습니다.
* [`..<` 연산자](#stable-operator-for-open-ended-ranges) 및 [시간 API(time API)](#stable-time-api)가 안정화되었습니다.
* [Kotlin/Native 표준 라이브러리가 철저한 검토를 거쳐 업데이트되었습니다](#the-kotlin-native-standard-library-s-journey-towards-stabilization).
* [`@Volatile` 어노테이션을 더 많은 플랫폼에서 사용할 수 있습니다](#stable-volatile-annotation).
* [정규식 캡처 그룹을 이름으로 가져오는 **공통** 함수가 추가되었습니다](#new-common-function-to-get-regex-capture-group-by-name).
* [16진수를 포맷팅하고 파싱하기 위한 `HexFormat` 클래스가 도입되었습니다](#new-hexformat-class-to-format-and-parse-hexadecimals).

### 열린 범위(open-ended range)를 위한 안정적인 ..< 연산자 {id="stable-operator-for-open-ended-ranges"}

[Kotlin 1.7.20](whatsnew1720.md#preview-of-the-operator-for-creating-open-ended-ranges)에서 도입되었던 열린 범위를 위한 새로운 `..<` 연산자가 1.8.0에서 안정화되었습니다. 1.9.0에서는 열린 범위를 다루기 위한 표준 라이브러리 API 역시 안정화(Stable)되었습니다.

조사에 따르면 새로운 `..<` 연산자를 사용하면 열린 범위가 선언되었음을 더 쉽게 이해할 수 있습니다. [`until`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.ranges/until.html) 중위 함수(infix function)를 사용하는 경우 상한(upper bound)이 포함된다고 오해하기 쉽습니다.

다음은 `until` 함수를 사용한 예입니다.

```kotlin
fun main() {
    for (number in 2 until 10) {
        if (number % 2 == 0) {
            print("$number ")
        }
    }
    // 2 4 6 8
}
```
{validate="false"}

다음은 새로운 `..<` 연산자를 사용한 예입니다.

```kotlin
fun main() {
    for (number in 2..<10) {
        if (number % 2 == 0) {
            print("$number ")
        }
    }
    // 2 4 6 8
}
```
{validate="false"}

> IntelliJ IDEA 버전 2023.1.1부터 `..<` 연산자를 사용할 수 있는 위치를 강조 표시하는 새로운 코드 검사(code inspection)가 제공됩니다.
>
{style="note"}

이 연산자로 수행할 수 있는 작업에 대한 자세한 내용은 [Kotlin 1.7.20의 새로운 기능](whatsnew1720.md#preview-of-the-operator-for-creating-open-ended-ranges)을 참조하세요.

### 안정적인 시간 API(time API) {id="stable-time-api"}

1.3.50부터 새로운 시간 측정 API의 미리보기를 제공해 왔습니다. 지속 시간(duration) 관련 API는 1.6.0에서 안정화되었습니다. 1.9.0에서는 나머지 시간 측정 API도 안정화(Stable)되었습니다.

기존 시간 API에서 제공하던 `measureTimeMillis` 및 `measureNanoTime` 함수는 직관적이지 않았습니다. 두 함수가 서로 다른 단위로 시간을 측정한다는 것은 명확하지만, `measureTimeMillis`는 시간을 측정하는 데 [실제 경과 시간(wall clock)](https://en.wikipedia.org/wiki/Elapsed_real_time)을 사용하는 반면 `measureNanoTime`은 단조 시간 소스(monotonic time source)를 사용한다는 점은 명확하지 않았습니다. 새로운 시간 API는 이러한 문제들을 해결하여 API를 더욱 사용자 친화적으로 만듭니다.

새로운 시간 API를 사용하면 다음 작업을 쉽게 수행할 수 있습니다.
* 원하는 시간 단위를 사용하여 단조 시간 소스로 코드 실행 시간을 측정합니다.
* 특정 시점을 표시합니다.
* 두 시점을 비교하고 차이를 확인합니다.
* 특정 시점 이후 얼마나 많은 시간이 흘렀는지 확인합니다.
* 현재 시간이 특정 시점을 지났는지 확인합니다.

#### 코드 실행 시간 측정 {id="measure-code-execution-time"}

코드 블록을 실행하는 데 걸리는 시간을 측정하려면 [`measureTime`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.time/measure-time.html) 인라인 함수를 사용하세요.

코드 블록을 실행하는 데 걸리는 시간을 측정하고 코드 블록의 결과도 **함께** 반환받으려면 [`measureTimedValue`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.time/measure-timed-value.html) 인라인 함수를 사용하세요.

기본적으로 두 함수 모두 단조 시간 소스를 사용합니다. 그러나 필요한 경우 실제 경과 시간 소스(elapsed real-time source)를 사용할 수도 있습니다.
예를 들어 Android의 기본 시간 소스인 `System.nanoTime()`은 디바이스가 활성 상태일 때만 시간을 계산합니다. 디바이스가 딥 슬립 상태에 들어가면 시간 추적을 놓치게 됩니다. 디바이스가 딥 슬립 상태일 때도 시간을 계속 추적하려면 대신 [`SystemClock.elapsedRealtimeNanos()`](https://developer.android.com/reference/android/os/SystemClock#elapsedRealtimeNanos())를 사용하는 시간 소스를 만들 수 있습니다.

```kotlin
object RealtimeMonotonicTimeSource : AbstractLongTimeSource(DurationUnit.NANOSECONDS) {
    override fun read(): Long = SystemClock.elapsedRealtimeNanos()
}
```
{validate="false"}

#### 시점 표시 및 시간 차이 측정 {id="mark-and-measure-differences-in-time"}

특정 시점을 표시하려면 [`TimeSource`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.time/-time-source/) 인터페이스와 [`markNow()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.time/-time-source/mark-now.html) 함수를 사용하여 [`TimeMark`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.time/-time-mark/)를 생성합니다. 동일한 시간 소스에서 생성된 `TimeMark` 간의 차이를 측정하려면 빼기 연산자(`-`)를 사용합니다.

```kotlin
import kotlin.time.*

fun main() {
    val timeSource = TimeSource.Monotonic
    val mark1 = timeSource.markNow()
    Thread.sleep(500) // 0.5초 대기.
    val mark2 = timeSource.markNow()

    repeat(4) { n ->
        val mark3 = timeSource.markNow()
        val elapsed1 = mark3 - mark1
        val elapsed2 = mark3 - mark2

        println("Measurement 1.${n + 1}: elapsed1=$elapsed1, elapsed2=$elapsed2, diff=${elapsed1 - elapsed2}")
    }
    // TimeMark끼리 비교하는 것도 가능합니다.
    println(mark2 > mark1) // mark2가 mark1보다 나중에 캡처되었으므로 true입니다.
}
```
{kotlin-runnable="true" id="kotlin-whats-new-time-elapsed"}

마감 시간이 지났는지 또는 타임아웃에 도달했는지 확인하려면 [`hasPassedNow()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.time/-time-mark/has-passed-now.html) 및 [`hasNotPassedNow()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.time/-time-mark/has-not-passed-now.html) 확장 함수를 사용하세요.

```kotlin
import kotlin.time.*
import kotlin.time.Duration.Companion.seconds

fun main() {
    val timeSource = TimeSource.Monotonic
    val mark1 = timeSource.markNow()
    val fiveSeconds: Duration = 5.seconds
    val mark2 = mark1 + fiveSeconds

    // 아직 5초가 지나지 않음
    println(mark2.hasPassedNow())
    // false

    // 6초 대기
    Thread.sleep(6000)
    println(mark2.hasPassedNow())
    // true
}
```
{kotlin-runnable="true" id="kotlin-whats-new-time-passednow"}

### Kotlin/Native 표준 라이브러리의 안정화를 향한 여정 {id="the-kotlin-native-standard-library-s-journey-towards-stabilization"}

Kotlin/Native 표준 라이브러리가 지속적으로 성장함에 따라 높은 기준을 충족하는지 확인하기 위해 전체적인 검토를 진행하기로 결정했습니다. 이 작업의 일환으로 기존의 **모든** 공개 시그니처를 면밀히 검토했습니다. 각 시그니처에 대해 다음과 같은 기준을 고려했습니다.

* 고유한 목적이 있는가?
* 다른 Kotlin API와 일관성이 있는가?
* JVM에 대응되는 대상과 유사한 동작을 하는가?
* 미래 경쟁력을 갖추었는가?

이러한 고려 사항을 바탕으로 다음과 같은 결정 중 하나를 내렸습니다.
* 안정화(Stable)
* 실험적(Experimental)으로 전환
* `private`으로 표시
* 동작 수정
* 다른 위치로 이동
* 지원 중단(Deprecated)
* 사용되지 않음(obsolete)으로 표시

> 기존 시그니처가 다음과 같이 처리된 경우:
> * 다른 패키지로 이동된 경우, 원래 패키지에도 시그니처가 계속 존재하지만 지원 중단 수준 `WARNING`으로 deprecated되었습니다. IntelliJ IDEA는 코드 검사 시 자동으로 대체 항목을 제안합니다.
> * 지원 중단된 경우, 지원 중단 수준 `WARNING`으로 deprecated되었습니다.
> * 사용되지 않음(obsolete)으로 표시된 경우, 계속 사용할 수 있지만 향후 대체될 예정입니다.
>
{style="note"}

검토 결과 전체를 여기에 나열하지는 않지만 몇 가지 주요 내용은 다음과 같습니다.
* Atomics API를 안정화했습니다.
* [`kotlinx.cinterop`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlinx.cinterop/)을 실험적(Experimental)으로 전환했으며, 이제 해당 패키지를 사용하려면 서로 다른 opt-in이 필요합니다. 자세한 내용은 [명시적 C 상호 운용성 안정성 보장](#explicit-c-interoperability-stability-guarantees)을 참조하세요.
* [`Worker`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.native.concurrent/-worker/) 클래스 및 관련 API를 obsolete로 표시했습니다.
* [`BitSet`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.native/-bit-set/) 클래스를 obsolete로 표시했습니다.
* `kotlin.native.internal` 패키지의 모든 `public` API를 `private`으로 표시하거나 다른 패키지로 이동했습니다.

#### 명시적 C 상호 운용성 안정성 보장 {id="explicit-c-interoperability-stability-guarantees"}

API의 높은 품질을 유지하기 위해 [`kotlinx.cinterop`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlinx.cinterop/)을 실험적(Experimental)으로 전환하기로 결정했습니다. `kotlinx.cinterop`은 철저히 시도되고 테스트되었지만 안정화하기에는 아직 개선의 여지가 남아 있습니다. 상호 운용성을 위해 이 API를 사용하는 것은 권장하지만 프로젝트 내 특정 영역으로 사용을 한정하는 것이 좋습니다. 이렇게 하면 향후 이 API를 안정화 단계로 발전시킬 때 마이그레이션이 수월해집니다.

포인터와 같은 C 계열 외부 API를 사용하려면 `@OptIn(ExperimentalForeignApi)`을 통해 opt-in해야 하며, 그렇지 않으면 코드가 컴파일되지 않습니다.

Objective-C/Swift 상호 운용성을 다루는 `kotlinx.cinterop`의 나머지 부분을 사용하려면 `@OptIn(BetaInteropApi)`으로 opt-in해야 합니다. opt-in 없이 이 API를 사용하려고 하면 코드는 컴파일되지만 컴파일러에서 기대할 수 있는 동작을 명확히 설명하는 경고를 표시합니다.

이러한 어노테이션에 대한 자세한 내용은 [`Annotations.kt`](https://github.com/JetBrains/kotlin/blob/master/kotlin-native/Interop/Runtime/src/main/kotlin/kotlinx/cinterop/Annotations.kt) 소스 코드를 참조하세요.

이번 검토의 일환으로 이루어진 **모든** 변경 사항에 대한 자세한 내용은 [YouTrack 티켓](https://youtrack.jetbrains.com/issue/KT-55765)을 참조하세요.

어떤 피드백이든 환영합니다! [티켓](https://youtrack.jetbrains.com/issue/KT-57728)에 댓글을 남겨 직접 의견을 주실 수 있습니다.

### 안정적인 @Volatile 어노테이션 {id="stable-volatile-annotation"}

`var` 프로퍼티에 `@Volatile`을 지정하면 해당 백킹 필드가 마킹되어 이 필드에 대한 모든 읽기 또는 쓰기가 원자적(atomic)으로 수행되며 쓰기 작업이 항상 다른 스레드에 즉시 표시됩니다.

1.8.20 이전에는 [`kotlin.jvm.Volatile` 어노테이션](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.jvm/-volatile/)을 공통 표준 라이브러리에서 사용할 수 있었습니다. 그러나 이 어노테이션은 JVM에서만 유효했습니다. 다른 플랫폼에서 사용하면 무시되어 오류로 이어졌습니다.

1.8.20에서는 JVM과 Kotlin/Native 모두에서 미리 체험해 볼 수 있는 실험적 공통 어노테이션인 `kotlin.concurrent.Volatile`을 도입했습니다.

Kotlin 1.9.0에서는 `kotlin.concurrent.Volatile`이 안정화(Stable)되었습니다. 멀티플랫폼 프로젝트에서 `kotlin.jvm.Volatile`을 사용하는 경우 `kotlin.concurrent.Volatile`로 마이그레이션하는 것을 권장합니다.

### 이름으로 정규식 캡처 그룹을 가져오는 새로운 공통 함수 {id="new-common-function-to-get-regex-capture-group-by-name"}

1.9.0 이전에는 플랫폼마다 정규식 일치 결과에서 이름으로 정규식 캡처 그룹을 가져오는 자체 확장 기능을 가지고 있었습니다. 하지만 공통 함수는 없었습니다. 표준 라이브러리가 여전히 JVM 타깃 1.6 및 1.7을 지원하고 있었기 때문에 Kotlin 1.8.0 이전에는 공통 함수를 가질 수 없었습니다.

Kotlin 1.8.0부터 표준 라이브러리가 JVM 타깃 1.8로 컴파일됩니다. 따라서 1.9.0에서는 정규식 일치 결과에서 이름으로 그룹 내용을 검색하는 데 사용할 수 있는 **공통** [`groups`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.text/-match-result/groups.html) 함수가 제공됩니다. 이 기능은 특정 캡처 그룹에 속하는 정규식 일치 결과에 접근하고자 할 때 유용합니다.

다음은 세 개의 캡처 그룹(`city`, `state`, `areaCode`)을 포함하는 정규식 예제입니다. 이러한 그룹 이름을 사용하여 일치된 값에 접근할 수 있습니다.

```kotlin
fun main() {
    val regex = """\b(?<city>[A-Za-z\s]+),\s(?<state>[A-Z]{2}):\s(?<areaCode>[0-9]{3})\b""".toRegex()
    val input = "Coordinates: Austin, TX: 123"
    
    val match = regex.find(input)!!
    println(match.groups["city"]?.value)
    // Austin
    println(match.groups["state"]?.value)
    // TX
    println(match.groups["areaCode"]?.value)
    // 123
}
```
{validate="false"}

### 상위 디렉터리를 생성하는 새로운 경로 유틸리티 {id="new-path-utility-to-create-parent-directories"}

1.9.0에는 필요한 모든 상위 디렉터리를 포함하여 새 파일을 생성하는 데 사용할 수 있는 새로운 `createParentDirectories()` 확장 함수가 추가되었습니다. `createParentDirectories()`에 파일 경로를 전달하면 상위 디렉터리가 이미 존재하는지 확인합니다. 이미 존재하는 경우 아무 작업도 수행하지 않습니다. 그러나 존재하지 않는 경우 자동으로 생성해 줍니다.

`createParentDirectories()`는 파일을 복사할 때 특히 유용합니다. 예를 들어 `copyToRecursively()` 함수와 함께 사용할 수 있습니다.

 ```kotlin
sourcePath.copyToRecursively(
    destinationPath.createParentDirectories(), 
    followLinks = false
 )
 ```
{validate="false"}

### 16진수를 포맷팅하고 파싱하기 위한 새로운 HexFormat 클래스 {id="new-hexformat-class-to-format-and-parse-hexadecimals"}

> 새로운 `HexFormat` 클래스 및 관련 확장 함수는 [실험적(Experimental)](components-stability.md#stability-levels-explained) 기능이며,
> 이를 사용하려면 `@OptIn(ExperimentalStdlibApi::class)` 또는 컴파일러 인수 `-opt-in=kotlin.ExperimentalStdlibApi`를 사용하여 opt-in할 수 있습니다.
>
{style="warning"}

1.9.0에서는 숫자 값과 16진수 문자열 간의 변환을 지원하는 실험적 기능으로 [`HexFormat`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.text/-hex-format/) 클래스와 관련 확장 함수가 제공됩니다. 구체적으로 확장 함수를 사용하여 16진수 문자열과 `ByteArray` 또는 기타 숫자 타입(`Int`, `Short`, `Long`) 간의 변환을 수행할 수 있습니다.

예시:

```kotlin
println(93.toHexString()) // "0000005d"
```
{validate="false"}

`HexFormat` 클래스에는 `HexFormat{}` 빌더로 구성할 수 있는 포맷팅 옵션이 포함되어 있습니다.

`ByteArray`를 다루는 경우 프로퍼티를 통해 구성할 수 있는 다음 옵션들이 제공됩니다.

| 옵션 | 설명 |
|--|--|
| `upperCase` | 16진수 숫자의 대소문자 여부입니다. 기본값은 소문자입니다. `upperCase = false`. |
| `bytes.bytesPerLine` | 한 줄당 최대 바이트 수입니다. |
| `bytes.bytesPerGroup` | 한 그룹당 최대 바이트 수입니다. |
| `bytes.bytesSeparator` | 바이트 간의 구분자입니다. 기본값은 없음입니다. |
| `bytes.bytesPrefix` | 각 바이트의 2자리 16진수 표현 바로 앞에 오는 문자열입니다. 기본값은 없음입니다. |
| `bytes.bytesSuffix` | 각 바이트의 2자리 16진수 표현 바로 뒤에 오는 문자열입니다. 기본값은 없음입니다. |

예시:

```kotlin
val macAddress = "001b638445e6".hexToByteArray()

// HexFormat{} 빌더를 사용하여 16진수 문자열을 콜론으로 구분
println(macAddress.toHexString(HexFormat { bytes.byteSeparator = ":" }))
// "00:1b:63:84:45:e6"

// HexFormat{} 빌더를 사용하여:
// * 16진수 문자열을 대문자로 설정
// * 바이트를 두 개씩 그룹화
// * 마침표로 구분
val threeGroupFormat = HexFormat { upperCase = true; bytes.bytesPerGroup = 2; bytes.groupSeparator = "." }

println(macAddress.toHexString(threeGroupFormat))
// "001B.6384.45E6"
```
{validate="false"}

숫자 타입을 다루는 경우 프로퍼티를 통해 구성할 수 있는 다음 옵션들이 제공됩니다.

| 옵션 | 설명 |
|--|--|
| `number.prefix` | 16진수 문자열의 접두사입니다. 기본값은 없음입니다. |
| `number.suffix` | 16진수 문자열의 접미사입니다. 기본값은 없음입니다. |
| `number.removeLeadingZeros` | 16진수 문자열에서 선행 0을 제거할지 여부입니다. 기본적으로 선행 0은 제거되지 않습니다. `number.removeLeadingZeros = false` |

예시:

```kotlin
// HexFormat{} 빌더를 사용하여 접두사 "0x"가 있는 16진수 파싱
println("0x3a".hexToInt(HexFormat { number.prefix = "0x" })) // "58"
```
{validate="false"}

## 문서 업데이트 {id="documentation-updates"}

Kotlin 문서에 몇 가지 주목할 만한 변경 사항이 있었습니다.
* [Kotlin 둘러보기(tour of Kotlin)](kotlin-tour-welcome.md) – 이론과 실습을 포함한 챕터로 Kotlin 프로그래밍 언어의 기초를 배워보세요.
* [Android 소스 세트 레이아웃](https://kotlinlang.org/docs/multiplatform/multiplatform-android-layout.html) – 새로운 Android 소스 세트 레이아웃에 대해 알아보세요.
* [Kotlin Multiplatform 호환성 가이드](https://kotlinlang.org/docs/multiplatform/multiplatform-compatibility-guide.html) – Kotlin Multiplatform으로 프로젝트를 개발하는 동안 마주칠 수 있는 호환되지 않는 변경 사항에 대해 알아보세요.
* [Kotlin Wasm](wasm-overview.md) – Kotlin/Wasm에 대해 알아보고 Kotlin Multiplatform 프로젝트에서 활용하는 방법을 확인해 보세요.

## Kotlin 1.9.0 설치 {id="install-kotlin-1-9-0"}

### IDE 버전 확인 {id="check-the-ide-version"}

[IntelliJ IDEA](https://www.jetbrains.com/idea/download/) 2022.3.3 및 2023.1.1에서는 Kotlin 플러그인을 버전 1.9.0으로 업데이트하도록 자동으로 제안합니다. IntelliJ IDEA 2023.2에는 Kotlin 1.9.0 플러그인이 기본 포함될 예정입니다.

Android Studio Giraffe (223) 및 Hedgehog (231)은 향후 릴리스에서 Kotlin 1.9.0을 지원할 예정입니다.

새로운 명령줄 컴파일러는 [GitHub 릴리스 페이지](https://github.com/JetBrains/kotlin/releases/tag/v1.9.0)에서 다운로드할 수 있습니다.

### Gradle 설정 구성 {id="configure-gradle-settings"}

Kotlin 아티팩트 및 종속성을 다운로드하려면 Maven Central 저장소를 사용하도록 `settings.gradle(.kts)` 파일을 업데이트하세요.

```kotlin
pluginManagement {
    repositories {
        mavenCentral()
        gradlePluginPortal()
    }
}
```
{validate="false"}

저장소가 지정되지 않은 경우 Gradle은 서비스가 종료된(sunset) JCenter 저장소를 사용하므로 Kotlin 아티팩트와 관련된 문제가 발생할 수 있습니다.

## Kotlin 1.9.0 호환성 가이드 {id="compatibility-guide-for-kotlin-1-9-0"}

Kotlin 1.9.0은 기능 릴리스(feature release)이므로 이전 언어 버전용으로 작성된 코드와 호환되지 않는 변경 사항이 포함될 수 있습니다. 이러한 변경 사항의 상세 목록은 [Kotlin 1.9.0 호환성 가이드](compatibility-guide-19.md)에서 확인하세요.