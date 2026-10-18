[//]: # (title: Kotlin 1.6.20의 새로운 기능)

<web-summary>새로운 언어 기능, Kotlin Multiplatform, JVM, Native, JS의 업데이트 및 Gradle과 Maven용 빌드 도구 지원을 다루는 Kotlin 1.6.20 릴리스 노트를 읽어보세요.</web-summary>

_[릴리스 날짜: 2022년 4월 4일](releases.md#release-history)_

Kotlin 1.6.20에서는 향후 언어 기능의 미리보기를 공개하고, 멀티플랫폼 프로젝트에서 계층적 구조(hierarchical structure)를 기본값으로 설정하며, 다른 컴포넌트들에 점진적인 개선 사항을 제공합니다.

이 비디오에서도 변경 사항에 대한 간단한 개요를 확인할 수 있습니다:

<video src="https://www.youtube.com/v/8F19ds109-o" title="What's new in Kotlin 1.6.20"/>

> Kotlin 릴리스 주기에 대한 자세한 내용은 [Kotlin 릴리스 프로세스](releases.md)를 참조하세요.
>
{style="tip"}

## 언어 (Language) {id="language"}

Kotlin 1.6.20에서는 두 가지 새로운 언어 기능을 사용해 볼 수 있습니다:

* [Kotlin/JVM용 컨텍스트 리시버(Context Receivers) 프로토타입](#prototype-of-context-receivers-for-kotlin-jvm)
* [절대 널 불가능한 타입(Definitely non-nullable types)](#definitely-non-nullable-types)

### Kotlin/JVM용 컨텍스트 리시버 프로토타입 {id="prototype-of-context-receivers-for-kotlin-jvm"}

> 이 기능은 Kotlin/JVM에서만 사용할 수 있는 프로토타입입니다. `-Xcontext-receivers`가 활성화되면,
> 컴파일러는 프로덕션 코드에서 사용할 수 없는 시험용 바이너리를 생성합니다.
> 컨텍스트 리시버는 토이 프로젝트에서만 사용하세요.
> [YouTrack](https://youtrack.jetbrains.com/issues/KT)을 통한 피드백을 환영합니다.
>
{style="warning"}

Kotlin 1.6.20부터는 더 이상 하나의 리시버(receiver)로 제한되지 않습니다. 더 많은 리시버가 필요한 경우, 선언부에 컨텍스트 리시버를 추가하여 함수, 프로퍼티, 클래스를 컨텍스트 의존적(또는 _컨텍스트적(contextual)_)으로 만들 수 있습니다. 컨텍스트 선언은 다음을 수행합니다:

* 선언된 모든 컨텍스트 리시버가 호출자의 스코프에 암시적 리시버(implicit receiver)로 존재해야 합니다.
* 선언된 컨텍스트 리시버를 본문 스코프에 암시적 리시버로 가져옵니다.

```kotlin
interface LoggingContext {
    val log: Logger // 이 컨텍스트는 로거에 대한 참조를 제공합니다
}

context(LoggingContext)
fun startBusinessOperation() {
    // LoggingContext가 암시적 리시버이므로 log 프로퍼티에 접근할 수 있습니다
    log.info("Operation has started")
}

fun test(loggingContext: LoggingContext) {
    with(loggingContext) {
        // startBusinessOperation()을 호출하려면
        // 스코프 내에 LoggingContext가 암시적 리시버로 있어야 합니다
        startBusinessOperation()
    }
}
```

프로젝트에서 컨텍스트 리시버를 활성화하려면 `-Xcontext-receivers` 컴파일러 옵션을 사용하세요.
이 기능과 해당 문법에 대한 자세한 설명은 [KEEP](https://github.com/Kotlin/KEEP/blob/master/proposals/context-receivers.md#detailed-design)에서 확인할 수 있습니다.

구현이 프로토타입 단계임에 유의하세요:

* `-Xcontext-receivers`가 활성화되면 컴파일러는 프로덕션 코드에서 사용할 수 없는 시험용 바이너리를 생성합니다.
* 컨텍스트 리시버에 대한 IDE 지원은 현재 최소한으로 제공됩니다.

토이 프로젝트에서 이 기능을 사용해 보고, [이 YouTrack 이슈](https://youtrack.jetbrains.com/issue/KT-42435)를 통해 의견과 경험을 공유해 주세요.
문제가 발생하면 [새 이슈를 등록](https://kotl.in/issue)해 주시기 바랍니다.

### 절대 널 불가능한 타입 {id="definitely-non-nullable-types"}

> 절대 널 불가능한 타입(Definitely non-nullable types)은 현재 [베타(Beta)](components-stability.md) 상태입니다. 거의 안정화되었지만,
> 향후 마이그레이션 단계가 필요할 수 있습니다.
> 변경 사항을 최소화할 수 있도록 최선을 다하겠습니다.
>
{style="warning"}

제네릭 Java 클래스 및 인터페이스를 확장할 때 더 나은 상호 운용성을 제공하기 위해, Kotlin 1.6.20에서는 새로운 문법인 `T & Any`를 사용하여 사용 위치(use site)에서 제네릭 타입 파라미터를 절대 널 불가능한(definitely non-nullable) 타입으로 표시할 수 있습니다.
이 구문 형태는 [교차 타입(intersection types)](https://en.wikipedia.org/wiki/Intersection_type)의 표기법에서 비롯되었으며, 현재는 `&` 왼쪽에 널 가능 상위 바운드가 있는 타입 파라미터가 오고 오른쪽에는 널 불가능한 `Any`가 오는 것으로 제한됩니다.

```kotlin
fun <T> elvisLike(x: T, y: T & Any): T & Any = x ?: y

fun main() {
    // 정상
    elvisLike<String>("", "").length
    // 오류: 'null' cannot be a value of a non-null type
    elvisLike<String>("", null).length

    // 정상
    elvisLike<String?>(null, "").length
    // 오류: 'null' cannot be a value of a non-null type
    elvisLike<String?>(null, null).length
}
```
{validate="false"}

이 기능을 사용하려면 언어 버전을 `1.7`로 설정하세요:

<tabs group="build-script">
<tab title="Kotlin" group-key="kotlin">

```kotlin
kotlin {
    sourceSets.all {
        languageSettings.apply {
            languageVersion = "1.7"
        }
    }
}
```

</tab>
<tab title="Groovy" group-key="groovy">

```groovy
kotlin {
    sourceSets.all {
        languageSettings {
            languageVersion = '1.7'
        }
    }
}
```

</tab>
</tabs>

절대 널 불가능한 타입에 대한 자세한 내용은 [KEEP](https://github.com/Kotlin/KEEP/blob/master/proposals/definitely-non-nullable-types.md)에서 확인하세요.

## Kotlin/JVM {id="kotlin-jvm"}

Kotlin 1.6.20에 도입된 사항:

* JVM 인터페이스의 기본 메서드 호환성 개선: [인터페이스를 위한 새로운 `@JvmDefaultWithCompatibility` 어노테이션](#new-jvmdefaultwithcompatibility-annotation-for-interfaces) 및 [`-Xjvm-default` 모드의 호환성 변경 사항](#compatibility-changes-in-the-xjvm-default-modes)
* [JVM 백엔드에서 단일 모듈 병렬 컴파일 지원](#support-for-parallel-compilation-of-a-single-module-in-the-jvm-backend)
* [함수형 인터페이스 생성자에 대한 호출 가능한 참조(callable reference) 지원](#support-for-callable-references-to-functional-interface-constructors)

### 인터페이스를 위한 새로운 @JvmDefaultWithCompatibility 어노테이션 {id="new-jvmdefaultwithcompatibility-annotation-for-interfaces"}

Kotlin 1.6.20에서는 새로운 어노테이션인 [`@JvmDefaultWithCompatibility`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.jvm/-jvm-default-with-compatibility/)를 도입했습니다. 임의의 Kotlin 인터페이스 내 모든 비추상 멤버에 대해 [JVM 인터페이스에 기본 메서드를 생성](java-to-kotlin-interop.md#default-methods-in-interfaces)하려면 이 어노테이션을 `-Xjvm-default=all` 컴파일러 옵션과 함께 사용하세요.

`-Xjvm-default=all` 옵션 없이 컴파일된 Kotlin 인터페이스를 사용하는 클라이언트가 있다면, 해당 클라이언트는 이 옵션으로 컴파일된 코드와 바이너리 호환되지 않을 수 있습니다.
Kotlin 1.6.20 이전에는 이러한 호환성 문제를 피하기 위해 `-Xjvm-default=all-compatibility` 모드를 사용하고, 이러한 호환성이 필요하지 않은 인터페이스에는 `@JvmDefaultWithoutCompatibility` 어노테이션을 사용하는 것이 [권장되는 방식](https://blog.jetbrains.com/kotlin/2020/07/kotlin-1-4-m3-generating-default-methods-in-interfaces/#JvmDefaultWithoutCompatibility)이었습니다.

하지만 이 방식에는 몇 가지 단점이 있었습니다:

* 새 인터페이스가 추가될 때 어노테이션 추가를 쉽게 잊어버릴 수 있었습니다.
* 대개 공개(public) API보다 비공개 영역에 더 많은 인터페이스가 존재하므로, 코드의 수많은 위치에 이 어노테이션을 붙여야 했습니다.

이제는 `-Xjvm-default=all` 모드를 사용하고 인터페이스에 `@JvmDefaultWithCompatibility` 어노테이션을 달 수 있습니다.
이를 통해 공개 API의 모든 인터페이스에 이 어노테이션을 한 번만 추가하면 되며, 새로운 비공개 코드에는 어노테이션을 사용할 필요가 없습니다.

새 어노테이션에 대한 피드백은 [이 YouTrack 티켓](https://youtrack.jetbrains.com/issue/KT-48217)에 남겨주세요.

### -Xjvm-default 모드의 호환성 변경 사항 {id="compatibility-changes-in-the-xjvm-default-modes"}

Kotlin 1.6.20에는 기본 모드(`-Xjvm-default=disable` 컴파일러 옵션)로 컴파일된 모듈을 `-Xjvm-default=all` 또는 `-Xjvm-default=all-compatibility` 모드로 컴파일된 모듈을 대상으로 컴파일할 수 있는 옵션이 추가되었습니다.
이전과 마찬가지로 모든 모듈이 `-Xjvm-default=all` 또는 `-Xjvm-default=all-compatibility` 모드를 사용하는 경우에도 컴파일이 정상적으로 완료됩니다.
피드백은 이 [YouTrack 이슈](https://youtrack.jetbrains.com/issue/KT-47000)에 남겨주실 수 있습니다.

Kotlin 1.6.20에서는 `-Xjvm-default` 컴파일러 옵션의 `compatibility` 및 `enable` 모드가 지원 중단(deprecated)되었습니다.
호환성과 관련하여 다른 모드의 설명에 변경 사항이 있지만 전체적인 로직은 동일하게 유지됩니다.
[업데이트된 설명](java-to-kotlin-interop.md#compatibility-modes-for-default-methods)을 확인해 보세요.

Java 상호 운용성에서의 기본 메서드에 대한 자세한 내용은 [상호 운용성 문서](java-to-kotlin-interop.md#default-methods-in-interfaces) 및 [이 블로그 게시글](https://blog.jetbrains.com/kotlin/2020/07/kotlin-1-4-m3-generating-default-methods-in-interfaces/)을 참조하세요.

### JVM 백엔드에서 단일 모듈 병렬 컴파일 지원 {id="support-for-parallel-compilation-of-a-single-module-in-the-jvm-backend"}

> JVM 백엔드에서 단일 모듈의 병렬 컴파일 지원은 [실험적(Experimental)](components-stability.md) 기능입니다.
> 언제든지 중단되거나 변경될 수 있습니다. Opt-in이 필요하며(자세한 내용은 아래 참조), 평가 목적으로만 사용해야 합니다.
> [YouTrack](https://youtrack.jetbrains.com/issue/KT-46085)을 통해 피드백을 보내주시면 감사하겠습니다.
>
{style="warning"}

새로운 JVM IR 백엔드의 [컴파일 시간 개선 작업](https://youtrack.jetbrains.com/issue/KT-46768)을 계속 진행하고 있습니다.
Kotlin 1.6.20에서는 모듈 내의 모든 파일을 병렬로 컴파일하는 실험적 JVM IR 백엔드 모드를 추가했습니다.
병렬 컴파일을 사용하면 전체 컴파일 시간을 최대 15%까지 줄일 수 있습니다.

[컴파일러 옵션](compiler-reference.md#compiler-options) `-Xbackend-threads`를 통해 실험적 병렬 백엔드 모드를 활성화하세요.
이 옵션에는 다음 인수를 사용합니다:

* `N`: 사용하려는 스레드 수입니다. CPU 코어 수보다 크지 않아야 합니다. 그렇지 않으면 스레드 간 컨텍스트 스위칭으로 인해 병렬화 효율이 떨어집니다.
* `0`: CPU 코어당 별도의 스레드를 하나씩 사용합니다.

[Gradle](gradle.md)은 작업을 병렬로 실행할 수 있지만, Gradle의 관점에서 프로젝트(또는 프로젝트의 주요 부분)가 단 하나의 커다란 작업인 경우에는 이러한 유형의 병렬화가 크게 도움이 되지 않습니다.
매우 큰 모놀리식 모듈이 있는 경우 병렬 컴파일을 사용하여 더 빠르게 컴파일하세요.
프로젝트가 수많은 작은 모듈로 구성되어 있고 Gradle에 의해 빌드가 병렬화되어 있다면, 또 다른 병렬화 레이어를 추가하는 것은 컨텍스트 스위칭으로 인해 오히려 성능을 저하시킬 수 있습니다.

> 병렬 컴파일에는 몇 가지 제약이 있습니다:
> * kapt가 IR 백엔드를 비활성화하므로 [kapt](kapt.md)와 함께 작동하지 않습니다.
> * 설계상 더 많은 JVM 힙을 필요로 합니다. 힙 사용량은 스레드 수에 비례합니다.
>
{style="note"}

### 함수형 인터페이스 생성자에 대한 호출 가능한 참조 지원 {id="support-for-callable-references-to-functional-interface-constructors"}

> 함수형 인터페이스 생성자에 대한 호출 가능한 참조(callable reference) 지원은 [실험적(Experimental)](components-stability.md) 기능입니다.
> 언제든지 중단되거나 변경될 수 있습니다. Opt-in이 필요하며(자세한 내용은 아래 참조), 평가 목적으로만 사용해야 합니다.
> [YouTrack](https://youtrack.jetbrains.com/issue/KT-47939)을 통해 피드백을 보내주시면 감사하겠습니다.
>
{style="warning"}

함수형 인터페이스 생성자에 대한 [호출 가능한 참조](fun-interfaces.md#migration-from-an-interface-with-constructor-function-to-a-functional-interface) 지원을 통해 생성자 함수가 있는 인터페이스에서 [함수형 인터페이스](fun-interfaces.md)로 소스 호환성을 유지하며 마이그레이션할 수 있는 방법이 추가되었습니다.

다음 코드를 살펴보세요:

```kotlin
interface Printer {
    fun print()
}

fun Printer(block: () -> Unit): Printer = object : Printer { override fun print() = block() }
```

함수형 인터페이스 생성자에 대한 호출 가능한 참조를 활성화하면 이 코드를 함수형 인터페이스 선언 하나로 대체할 수 있습니다:

```kotlin
fun interface Printer {
    fun print()
}
```

생성자가 암시적으로 생성되며, `::Printer` 함수 참조를 사용하는 모든 코드가 정상적으로 컴파일됩니다. 예:

```kotlin
documentsStorage.addPrinter(::Printer)
```
{validate="false"}

레거시 함수인 `Printer`에 `DeprecationLevel.HIDDEN` 수준의 [`@Deprecated`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin/-deprecated/) 어노테이션을 지정하여 바이너리 호환성을 유지하세요:

```kotlin
@Deprecated(message = "Your message about the deprecation", level = DeprecationLevel.HIDDEN)
fun Printer(...) {...}
```
{validate="false"}

이 기능을 사용하려면 컴파일러 옵션 `-XXLanguage:+KotlinFunInterfaceConstructorReference`를 적용하세요.

## Kotlin/Native {id="kotlin-native"}

Kotlin/Native 1.6.20은 새로운 컴포넌트의 지속적인 발전을 보여줍니다. 다른 플랫폼의 Kotlin과 일관된 경험을 제공하기 위한 또 다른 진전을 이루었습니다:

* [새로운 메모리 관리자 업데이트](#an-update-on-the-new-memory-manager)
* [새 메모리 관리자의 sweep 단계를 위한 동시성 구현](#concurrent-implementation-for-the-sweep-phase-in-new-memory-manager)
* [어노테이션 클래스 인스턴스화](#instantiation-of-annotation-classes)
* [Swift async/await와의 상호 운용: KotlinUnit 대신 Swift의 Void 반환](#interop-with-swift-async-await-returning-void-instead-of-kotlinunit)
* [libbacktrace를 통한 향상된 스택 트레이스](#better-stack-traces-with-libbacktrace)
* [독립형(Standalone) Android 실행 파일 지원](#support-for-standalone-android-executables)
* [성능 개선](#performance-improvements)
* [cinterop 모듈 임포트 시 오류 처리 개선](#improved-error-handling-during-cinterop-modules-import)
* [Xcode 13 라이브러리 지원](#support-for-xcode-13-libraries)

### 새로운 메모리 관리자 업데이트 {id="an-update-on-the-new-memory-manager"}

> 새로운 Kotlin/Native 메모리 관리자는 [알파(Alpha)](components-stability.md) 상태입니다. 
> 향후 호환되지 않게 변경될 수 있으며 수동 마이그레이션이 필요할 수 있습니다.
> [YouTrack](https://youtrack.jetbrains.com/issue/KT-48525)을 통해 피드백을 보내주시면 감사하겠습니다.
>
{style="note"}

Kotlin 1.6.20에서는 새로운 Kotlin/Native 메모리 관리자의 알파 버전을 사용해 볼 수 있습니다.
이는 JVM과 Native 플랫폼 간의 차이를 없애 멀티플랫폼 프로젝트에서 일관된 개발자 경험을 제공합니다.
예를 들어, Android와 iOS 모두에서 동작하는 새로운 크로스 플랫폼 모바일 애플리케이션을 훨씬 쉽게 만들 수 있습니다.

새로운 Kotlin/Native 메모리 관리자는 스레드 간 객체 공유에 대한 제한을 해제합니다.
또한 안전하고 별도의 관리나 어노테이션이 필요 없는 누수 없는(leak-free) 동시성 프로그래밍 프리미티브를 제공합니다.

향후 버전에서는 새로운 메모리 관리자가 기본값이 될 예정이므로 지금 사용해 보시는 것을 권장합니다.
새로운 메모리 관리자에 대해 자세히 알아보고 데모 프로젝트를 살펴보려면 [블로그 게시글](https://blog.jetbrains.com/kotlin/2021/08/try-the-new-kotlin-native-memory-manager-development-preview/)을 확인하거나, 직접 사용해 보려면 [마이그레이션 안내 문서](https://github.com/JetBrains/kotlin/blob/master/kotlin-native/NEW_MM.md)로 바로 이동하세요.

프로젝트에서 새로운 메모리 관리자를 사용하여 작동 방식을 확인하고 이슈 트래커인 [YouTrack](https://youtrack.jetbrains.com/issue/KT-48525)에 피드백을 공유해 주세요.

### 새 메모리 관리자의 sweep 단계를 위한 동시성 구현 {id="concurrent-implementation-for-the-sweep-phase-in-new-memory-manager"}

[Kotlin 1.6에서 발표된](whatsnew16.md#preview-of-the-new-memory-manager) 새로운 메모리 관리자로 이미 전환하셨다면, 실행 시간이 대폭 향상된 것을 확인하셨을 것입니다. 벤치마크 결과 평균 35%의 개선이 나타났습니다.
1.6.20부터는 새 메모리 관리자에서 sweep 단계를 위한 동시성(concurrent) 구현도 제공됩니다.
이를 통해 성능이 더욱 향상되고 가비지 컬렉터의 일시 중단(pause) 시간이 줄어들 것입니다.

새로운 Kotlin/Native 메모리 관리자에서 이 기능을 활성화하려면 다음 컴파일러 옵션을 전달하세요:

```bash
-Xgc=cms 
```

새 메모리 관리자 성능에 대한 피드백은 언제든지 이 [YouTrack 이슈](https://youtrack.jetbrains.com/issue/KT-48526)에 공유해 주세요.

### 어노테이션 클래스 인스턴스화 {id="instantiation-of-annotation-classes"}

Kotlin 1.6.0에서는 어노테이션 클래스의 인스턴스화가 Kotlin/JVM 및 Kotlin/JS에서 [안정(Stable)](components-stability.md) 상태가 되었습니다.
1.6.20 버전에서는 Kotlin/Native에 대한 지원을 제공합니다.

[어노테이션 클래스 인스턴스화](annotations.md#instantiation)에 대해 자세히 알아보세요.

### Swift async/await와의 상호 운용: KotlinUnit 대신 Void 반환 {id="interop-with-swift-async-await-returning-void-instead-of-kotlinunit"}

> Swift async/await와의 동시성 상호 운용성은 [실험적(Experimental)](components-stability.md) 기능입니다. 언제든지 중단되거나 변경될 수 있습니다.
> 평가 목적으로만 사용해야 합니다. [YouTrack](https://youtrack.jetbrains.com/issue/KT-47610)을 통해 피드백을 남겨주시면 감사하겠습니다.
>
{style="warning"}

Swift 5.5부터 사용 가능한 [Swift async/await와의 실험적 상호 운용](whatsnew1530.md#experimental-interoperability-with-swift-5-5-async-await) 작업을 계속 진행했습니다.
Kotlin 1.6.20은 반환 타입이 `Unit`인 `suspend` 함수를 처리하는 방식에서 이전 버전과 차이가 있습니다.

이전에는 이러한 함수가 Swift에서 `KotlinUnit`을 반환하는 `async` 함수로 표시되었습니다. 그러나 non-suspending 함수와 마찬가지로 이들에게 적절한 반환 타입은 `Void`입니다.

기존 코드가 깨지는 것을 방지하기 위해, 컴파일러가 `Unit`을 반환하는 suspend 함수를 `Void` 반환 타입을 가진 `async` Swift 코드로 변환하도록 하는 Gradle 프로퍼티를 도입했습니다:

```none
# gradle.properties
kotlin.native.binary.unitSuspendFunctionObjCExport=proper
```

향후 Kotlin 릴리스에서는 이 동작을 기본값으로 설정할 계획입니다.

### libbacktrace를 통한 향상된 스택 트레이스 {id="better-stack-traces-with-libbacktrace"}

> 소스 위치를 확인하기 위해 libbacktrace를 사용하는 것은 [실험적(Experimental)](components-stability.md) 기능입니다. 언제든지 중단되거나 변경될 수 있습니다.
> 평가 목적으로만 사용해야 합니다. [YouTrack](https://youtrack.jetbrains.com/issue/KT-48424)을 통해 피드백을 남겨주시면 감사하겠습니다.
>
{style="warning"}

이제 Kotlin/Native는 `linux*`(`linuxMips32` 및 `linuxMipsel32` 제외) 및 `androidNative*` 타깃의 더 나은 디버깅을 위해 파일 위치와 줄 번호가 포함된 상세한 스택 트레이스를 생성할 수 있습니다.

이 기능은 내부적으로 [libbacktrace](https://github.com/ianlancetaylor/libbacktrace) 라이브러리를 사용합니다.
차이점을 확인하기 위해 다음 코드를 살펴보세요:

```kotlin
fun main() = bar()
fun bar() = baz()
inline fun baz() {
    error("")
}
```

* **1.6.20 이전:**

```text
Uncaught Kotlin exception: kotlin.IllegalStateException:
   at 0   example.kexe        0x227190       kfun:kotlin.Throwable#<init>(kotlin.String?){} + 96
   at 1   example.kexe        0x221e4c       kfun:kotlin.Exception#<init>(kotlin.String?){} + 92
   at 2   example.kexe        0x221f4c       kfun:kotlin.RuntimeException#<init>(kotlin.String?){} + 92
   at 3   example.kexe        0x22234c       kfun:kotlin.IllegalStateException#<init>(kotlin.String?){} + 92
   at 4   example.kexe        0x25d708       kfun:#bar(){} + 104
   at 5   example.kexe        0x25d68c       kfun:#main(){} + 12
```
{initial-collapse-state="collapsed" collapsible="true"}

* **libbacktrace를 적용한 1.6.20:**

```text
Uncaught Kotlin exception: kotlin.IllegalStateException:
   at 0   example.kexe        0x229550    kfun:kotlin.Throwable#<init>(kotlin.String?){} + 96 (/opt/buildAgent/work/c3a91df21e46e2c8/kotlin/kotlin-native/runtime/src/main/kotlin/kotlin/Throwable.kt:24:37)
   at 1   example.kexe        0x22420c    kfun:kotlin.Exception#<init>(kotlin.String?){} + 92 (/opt/buildAgent/work/c3a91df21e46e2c8/kotlin/kotlin-native/runtime/src/main/kotlin/kotlin/Exceptions.kt:23:44)
   at 2   example.kexe        0x22430c    kfun:kotlin.RuntimeException#<init>(kotlin.String?){} + 92 (/opt/buildAgent/work/c3a91df21e46e2c8/kotlin/kotlin-native/runtime/src/main/kotlin/kotlin/Exceptions.kt:34:44)
   at 3   example.kexe        0x22470c    kfun:kotlin.IllegalStateException#<init>(kotlin.String?){} + 92 (/opt/buildAgent/work/c3a91df21e46e2c8/kotlin/kotlin-native/runtime/src/main/kotlin/kotlin/Exceptions.kt:70:44)
   at 4   example.kexe        0x25fac8    kfun:#bar(){} + 104 [inlined] (/opt/buildAgent/work/c3a91df21e46e2c8/kotlin/libraries/stdlib/src/kotlin/util/Preconditions.kt:143:56)
   at 5   example.kexe        0x25fac8    kfun:#bar(){} + 104 [inlined] (/private/tmp/backtrace/src/commonMain/kotlin/app.kt:4:5)
   at 6   example.kexe        0x25fac8    kfun:#bar(){} + 104 (/private/tmp/backtrace/src/commonMain/kotlin/app.kt:2:13)
   at 7   example.kexe        0x25fa4c    kfun:#main(){} + 12 (/private/tmp/backtrace/src/commonMain/kotlin/app.kt:1:14)
```
{initial-collapse-state="collapsed" collapsible="true"}

스택 트레이스에 이미 파일 위치와 줄 번호가 표시되던 Apple 타깃의 경우, libbacktrace는 인라인 함수 호출에 대한 더 자세한 정보를 제공합니다:

* **1.6.20 이전:**

```text
Uncaught Kotlin exception: kotlin.IllegalStateException:
   at 0   example.kexe    0x10a85a8f8    kfun:kotlin.Throwable#<init>(kotlin.String?){} + 88 (/opt/buildAgent/work/c3a91df21e46e2c8/kotlin/kotlin-native/runtime/src/main/kotlin/kotlin/Throwable.kt:24:37)
   at 1   example.kexe    0x10a855846    kfun:kotlin.Exception#<init>(kotlin.String?){} + 86 (/opt/buildAgent/work/c3a91df21e46e2c8/kotlin/kotlin-native/runtime/src/main/kotlin/kotlin/Exceptions.kt:23:44)
   at 2   example.kexe    0x10a855936    kfun:kotlin.RuntimeException#<init>(kotlin.String?){} + 86 (/opt/buildAgent/work/c3a91df21e46e2c8/kotlin/kotlin-native/runtime/src/main/kotlin/kotlin/Exceptions.kt:34:44)
   at 3   example.kexe    0x10a855c86    kfun:kotlin.IllegalStateException#<init>(kotlin.String?){} + 86 (/opt/buildAgent/work/c3a91df21e46e2c8/kotlin/kotlin-native/runtime/src/main/kotlin/kotlin/Exceptions.kt:70:44)
   at 4   example.kexe    0x10a8489a5    kfun:#bar(){} + 117 (/private/tmp/backtrace/src/commonMain/kotlin/app.kt:2:1)
   at 5   example.kexe    0x10a84891c    kfun:#main(){} + 12 (/private/tmp/backtrace/src/commonMain/kotlin/app.kt:1:14)
...
```
{initial-collapse-state="collapsed" collapsible="true"}

* **libbacktrace를 적용한 1.6.20:**

```text
Uncaught Kotlin exception: kotlin.IllegalStateException:
   at 0   example.kexe    0x10669bc88    kfun:kotlin.Throwable#<init>(kotlin.String?){} + 88 (/opt/buildAgent/work/c3a91df21e46e2c8/kotlin/kotlin-native/runtime/src/main/kotlin/kotlin/Throwable.kt:24:37)
   at 1   example.kexe    0x106696bd6    kfun:kotlin.Exception#<init>(kotlin.String?){} + 86 (/opt/buildAgent/work/c3a91df21e46e2c8/kotlin/kotlin-native/runtime/src/main/kotlin/kotlin/Exceptions.kt:23:44)
   at 2   example.kexe    0x106696cc6    kfun:kotlin.RuntimeException#<init>(kotlin.String?){} + 86 (/opt/buildAgent/work/c3a91df21e46e2c8/kotlin/kotlin-native/runtime/src/main/kotlin/kotlin/Exceptions.kt:34:44)
   at 3   example.kexe    0x106697016    kfun:kotlin.IllegalStateException#<init>(kotlin.String?){} + 86 (/opt/buildAgent/work/c3a91df21e46e2c8/kotlin/kotlin-native/runtime/src/main/kotlin/kotlin/Exceptions.kt:70:44)
   at 4   example.kexe    0x106689d35    kfun:#bar(){} + 117 [inlined] (/opt/buildAgent/work/c3a91df21e46e2c8/kotlin/libraries/stdlib/src/kotlin/util/Preconditions.kt:143:56)
>>  at 5   example.kexe    0x106689d35    kfun:#bar(){} + 117 [inlined] (/private/tmp/backtrace/src/commonMain/kotlin/app.kt:4:5)
   at 6   example.kexe    0x106689d35    kfun:#bar(){} + 117 (/private/tmp/backtrace/src/commonMain/kotlin/app.kt:2:13)
   at 7   example.kexe    0x106689cac    kfun:#main(){} + 12 (/private/tmp/backtrace/src/commonMain/kotlin/app.kt:1:14)
...
```
{initial-collapse-state="collapsed" collapsible="true"}

libbacktrace를 사용하여 더 나은 스택 트레이스를 생성하려면 `gradle.properties`에 다음 줄을 추가하세요:

```none
# gradle.properties
kotlin.native.binary.sourceInfoType=libbacktrace
```

libbacktrace를 사용한 Kotlin/Native 디버깅 경험에 대해 [이 YouTrack 이슈](https://youtrack.jetbrains.com/issue/KT-48424)를 통해 의견을 들려주세요.

### 독립형 Android 실행 파일 지원 {id="support-for-standalone-android-executables"}

이전에는 Kotlin/Native의 Android Native 실행 파일이 실제 실행 파일이 아니라 NativeActivity로 사용할 수 있는 공유 라이브러리였습니다. 이제 Android Native 타깃을 위한 표준 실행 파일을 생성할 수 있는 옵션이 제공됩니다.

이를 설정하려면 프로젝트의 `build.gradle(.kts)`에서 `androidNative` 타깃의 executable 블록을 구성하세요.
다음 바이너리 옵션을 추가합니다:

```kotlin
kotlin {
    androidNativeX64("android") {
        binaries {
            executable {
                binaryOptions["androidProgramType"] = "standalone"
            }
        }
    }
}
```

이 기능은 Kotlin 1.7.0에서 기본값이 될 예정입니다.
현재 동작을 유지하려면 다음 설정을 사용하세요:

```kotlin
binaryOptions["androidProgramType"] = "nativeActivity"
```

[해당 기능 구현](https://github.com/jetbrains/kotlin/pull/4624)에 기여해 주신 Mattia Iavarone 님께 감사드립니다!

### 성능 개선 {id="performance-improvements"}

[컴파일 프로세스의 속도를 높이고](https://youtrack.jetbrains.com/issue/KT-42294) 개발 경험을 개선하기 위해 Kotlin/Native 팀은 지속적으로 노력하고 있습니다.

Kotlin 1.6.20은 Kotlin이 생성하는 LLVM IR에 영향을 미치는 몇 가지 성능 업데이트 및 버그 수정을 제공합니다.
사내 프로젝트 벤치마크에 따르면 평균적으로 다음과 같은 성능 향상을 달성했습니다:

* 실행 시간 15% 단축
* 릴리스 및 디버그 바이너리 모두에서 코드 크기 20% 감소
* 릴리스 바이너리의 컴파일 시간 26% 단축

또한 이러한 변경 사항 덕분에 대규모 사내 프로젝트의 디버그 바이너리 컴파일 시간이 10% 단축되었습니다.

이를 위해 컴파일러가 생성하는 일부 합성 객체(synthetic object)에 정적 초기화를 구현했고, 각 함수에 대한 LLVM IR 구조화 방식을 개선했으며, 컴파일러 캐시를 최적화했습니다.

### cinterop 모듈 임포트 시 오류 처리 개선 {id="improved-error-handling-during-cinterop-modules-import"}

이번 릴리스에서는 `cinterop` 도구를 사용하여 Objective-C 모듈을 임포트할 때(CocoaPods의 pod에서 주로 발생) 발생하는 오류 처리가 개선되었습니다.
이전에는 Objective-C 모듈을 사용하는 도중 오류(예: 헤더 컴파일 오류 처리 시)가 발생하면 `fatal error: could not build module $name`과 같은 불명확한 오류 메시지만 표시되었습니다.
이제는 `cinterop` 도구의 이 부분을 확장하여 자세한 설명이 포함된 오류 메시지를 제공합니다.

### Xcode 13 라이브러리 지원 {id="support-for-xcode-13-libraries"}

이번 릴리스부터 Xcode 13과 함께 제공되는 라이브러리가 완벽하게 지원됩니다.
Kotlin 코드의 어디에서나 자유롭게 접근할 수 있습니다.

## Kotlin Multiplatform {id="kotlin-multiplatform"}

1.6.20에서는 Kotlin Multiplatform에 다음과 같은 주요 업데이트가 포함되었습니다:

* [이제 모든 신규 멀티플랫폼 프로젝트에서 계층적 구조 지원이 기본값으로 설정됨](#hierarchical-structure-support-for-multiplatform-projects)
* [Kotlin CocoaPods Gradle 플러그인에 CocoaPods 연동을 위한 유용한 기능 추가](#kotlin-cocoapods-gradle-plugin)

### 멀티플랫폼 프로젝트를 위한 계층적 구조 지원 {id="hierarchical-structure-support-for-multiplatform-projects"}

Kotlin 1.6.20에서는 계층적 구조 지원이 기본적으로 활성화되어 제공됩니다.
[Kotlin 1.4.0에서 도입된](whatsnew14.md#sharing-code-in-several-targets-with-the-hierarchical-project-structure) 이후 프론트엔드를 대폭 개선하고 IDE 임포트를 안정화했습니다.

이전에는 멀티플랫폼 프로젝트에 코드를 추가하는 방법이 두 가지였습니다. 첫 번째는 플랫폼 전용 소스 세트에 삽입하는 방식으로, 하나의 타깃으로 제한되며 다른 플랫폼에서 재사용할 수 없었습니다.
두 번째는 현재 Kotlin이 지원하는 모든 플랫폼 간에 공유되는 공통 소스 세트를 사용하는 것이었습니다.

이제는 공통 로직과 타사 API를 다수 재사용하는 유사한 여러 네이티브 타깃 간에 [소스 코드를 공유](#better-code-sharing-in-your-project)할 수 있습니다.
이 기술은 올바른 기본 종속성을 제공하고 공유 코드에서 사용할 수 있는 정확한 API를 찾아냅니다.
따라서 복잡한 빌드 설정과 네이티브 타깃 간 소스 세트 공유 시 IDE 지원을 얻기 위해 임시방편(workaround)을 사용할 필요가 없습니다.
또한 다른 타깃을 대상으로 하는 안전하지 않은 API 사용을 방지하는 데도 도움이 됩니다.

계층적 프로젝트 구조를 사용하면 타깃의 일부 하위 집합에 공통 API를 제공하는 라이브러리를 게시하고 사용할 수 있으므로, 이 기술은 [라이브러리 작성자](#more-opportunities-for-library-authors)에게도 매우 유용합니다.

기본적으로 계층적 프로젝트 구조로 게시된 라이브러리는 계층적 구조 프로젝트와만 호환됩니다.

#### 프로젝트 내 더 효율적인 코드 공유 {id="better-code-sharing-in-your-project"}

계층적 구조 지원이 없으면 _전체_가 아닌 _일부_ [Kotlin 타깃](https://kotlinlang.org/docs/multiplatform/multiplatform-dsl-reference.html#targets) 간에 코드를 공유할 수 있는 간단한 방법이 없었습니다.
대표적인 예로 모든 iOS 타깃 간에 코드를 공유하고 Foundation과 같은 iOS 전용 [종속성](https://kotlinlang.org/docs/multiplatform/multiplatform-share-on-platforms.html#connect-platform-specific-libraries)에 접근하는 경우가 있습니다.

계층적 프로젝트 구조 지원 덕분에 이제 별도의 복잡한 설정 없이 바로 이를 수행할 수 있습니다.
새로운 구조에서는 소스 세트가 계층 구조를 형성합니다.
지정된 소스 세트가 컴파일되는 각 타깃에서 사용 가능한 플랫폼 전용 언어 기능과 종속성을 사용할 수 있습니다.

예를 들어, iOS 기기 및 시뮬레이터를 위한 두 개의 타깃 `iosArm64`와 `iosX64`가 있는 일반적인 멀티플랫폼 프로젝트를 고려해 보겠습니다.
Kotlin 툴링은 두 타깃 모두에 동일한 함수가 있음을 인식하고 중간 소스 세트인 `iosMain`에서 해당 함수에 접근할 수 있도록 해줍니다.

![iOS 계층 구조 예시](ios-hierarchy-example.jpg){width=700}

Kotlin 툴체인은 Kotlin/Native stdlib이나 네이티브 라이브러리와 같은 올바른 기본 종속성을 제공합니다.
뿐만 아니라 Kotlin 툴링은 공유 코드에서 사용할 수 있는 정확한 API 표면 영역을 찾아내기 위해 최선을 다합니다.
이를 통해 예를 들어 Windows용으로 공유되는 코드에서 macOS 전용 함수를 사용하는 것과 같은 상황을 방지할 수 있습니다.

#### 라이브러리 작성자를 위한 더 많은 기회 {id="more-opportunities-for-library-authors"}

멀티플랫폼 라이브러리가 게시될 때 중간 소스 세트의 API도 함께 올바르게 게시되어 소비자가 사용할 수 있게 됩니다.
마찬가지로 Kotlin 툴체인은 소비자 소스 세트에서 사용 가능한 API를 자동으로 파악하는 동시에, JS 코드에서 JVM용 API를 사용하는 것과 같은 안전하지 않은 사용을 면밀히 감시합니다.
[라이브러리에서의 코드 공유](https://kotlinlang.org/docs/multiplatform/multiplatform-share-on-platforms.html#share-code-in-libraries)에 대해 자세히 알아보세요.

#### 구성 및 설정 {id="configuration-and-setup"}

Kotlin 1.6.20부터 모든 새로운 멀티플랫폼 프로젝트는 계층적 프로젝트 구조를 갖게 됩니다. 추가 설정은 필요하지 않습니다.

* 이미 [수동으로 활성화](https://kotlinlang.org/docs/multiplatform/multiplatform-share-on-platforms.html#share-code-on-similar-platforms)한 경우, `gradle.properties`에서 지원 중단된 옵션을 제거할 수 있습니다:

  ```none
  # gradle.properties
  kotlin.mpp.enableGranularSourceSetsMetadata=true
  kotlin.native.enableDependencyPropagation=false // 또는 이전 설정에 따라 'true'
  ```

* Kotlin 1.6.20에서는 최상의 경험을 위해 [Android Studio 2021.1.1](https://developer.android.com/studio) (Bumblebee) 이상을 사용하는 것을 권장합니다.

* 사용을 원하지 않는 경우 비활성화할 수도 있습니다. 계층적 구조 지원을 끄려면 `gradle.properties`에 다음 옵션을 설정하세요:

  ```none
  # gradle.properties
  kotlin.mpp.hierarchicalStructureSupport=false
  ```

#### 피드백 공유 {id="leave-your-feedback"}

이는 전체 생태계에 걸친 중대한 변화입니다. 이 기능을 더욱 개선할 수 있도록 여러분의 피드백을 부탁드립니다.

지금 사용해 보시고 겪으신 불편 사항을 [이슈 트래커](https://kotl.in/issue)에 보고해 주세요.

### Kotlin CocoaPods Gradle 플러그인 {id="kotlin-cocoapods-gradle-plugin"}

CocoaPods 연동을 간소화하기 위해 Kotlin 1.6.20에서는 다음과 같은 기능이 제공됩니다:

* 이제 CocoaPods 플러그인에는 등록된 모든 타깃으로 XCFramework를 빌드하고 Podspec 파일을 생성하는 작업(task)이 포함됩니다. Xcode와 직접 연동하고 싶지는 않지만 아티팩트를 빌드하여 로컬 CocoaPods 리포지토리에 배포하려는 경우 유용할 수 있습니다.
  
  [XCFramework 빌드](https://kotlinlang.org/docs/multiplatform/multiplatform-build-native-binaries.html#build-xcframeworks)에 대해 자세히 알아보세요.

* 프로젝트에서 [CocoaPods 연동](https://kotlinlang.org/docs/multiplatform/multiplatform-cocoapods-overview.html)을 사용하는 경우, 전체 Gradle 프로젝트에 필요한 Pod 버전을 지정하는 방식에 익숙하실 것입니다. 이제 더 많은 선택지가 제공됩니다:
  * `cocoapods` 블록에서 Pod 버전을 직접 지정
  * Gradle 프로젝트 버전을 계속 사용
  
  두 속성 모두 구성되지 않은 경우 오류가 발생합니다.

* 이제 전체 Gradle 프로젝트 이름을 변경하지 않고도 `cocoapods` 블록에서 CocoaPod 이름을 구성할 수 있습니다.

* CocoaPods 플러그인에 새로운 `extraSpecAttributes` 프로퍼티가 도입되어, 이전에는 하드코딩되었던 `libraries`나 `vendored_frameworks`와 같은 Podspec 파일의 프로퍼티를 구성할 수 있습니다.

```kotlin
kotlin {
    cocoapods {
        version = "1.0"
        name = "MyCocoaPod"
        extraSpecAttributes["social_media_url"] = 'https://twitter.com/kotlin'
        extraSpecAttributes["vendored_frameworks"] = 'CustomFramework.xcframework'
        extraSpecAttributes["libraries"] = 'xml'
    }
}
```

Kotlin CocoaPods Gradle 플러그인의 전체 [DSL 레퍼런스](https://kotlinlang.org/docs/multiplatform/multiplatform-cocoapods-dsl-reference.html)를 참조하세요.

## Kotlin/JS {id="kotlin-js"}

1.6.20의 Kotlin/JS 개선 사항은 주로 IR 컴파일러에 적용되었습니다:

* [개발용 바이너리를 위한 증분 컴파일 (IR)](#incremental-compilation-for-development-binaries-with-ir-compiler)
* [최상위 프로퍼티의 기본 지연 초기화 (IR)](#lazy-initialization-of-top-level-properties-by-default-with-ir-compiler)
* [프로젝트 모듈별 JS 파일 분리가 기본값으로 적용 (IR)](#separate-js-files-for-project-modules-by-default-with-ir-compiler)
* [Char 클래스 최적화 (IR)](#char-class-optimization)
* [내보내기 기능 개선 (IR 및 레거시 백엔드 모두)](#improvements-to-export-and-typescript-declaration-generation)
* [비동기 테스트를 위한 @AfterTest 보장](#aftertest-guarantees-for-asynchronous-tests)

### IR 컴파일러 기반 개발용 바이너리의 증분 컴파일 {id="incremental-compilation-for-development-binaries-with-ir-compiler"}

IR 컴파일러를 사용한 Kotlin/JS 개발을 보다 효율적으로 만들기 위해 새로운 _증분 컴파일(incremental compilation)_ 모드를 도입합니다.

이 모드에서 `compileDevelopmentExecutableKotlinJs` Gradle 작업으로 **개발용 바이너리**를 빌드할 때, 컴파일러는 이전 컴파일 결과를 모듈 수준에서 캐시합니다.
이후 컴파일 시 변경되지 않은 소스 파일에 대해 캐시된 컴파일 결과를 재사용하므로, 특히 작은 변경 사항이 있을 때 컴파일을 훨씬 빠르게 완료할 수 있습니다.
이 개선 사항은 개발 프로세스(편집-빌드-디버그 주기 단축)만을 대상으로 하며, 프로덕션 아티팩트 빌드에는 영향을 미치지 않습니다.

개발용 바이너리에 증분 컴파일을 활성화하려면 프로젝트의 `gradle.properties`에 다음 줄을 추가하세요:

```none
# gradle.properties
kotlin.incremental.js.ir=true // 기본값은 false
```

자체 테스트 프로젝트에서 이 새로운 모드는 증분 컴파일 속도를 최대 30%까지 향상시켰습니다. 그러나 캐시를 생성하고 채워야 하므로 이 모드에서의 클린 빌드는 더 느려졌습니다.

Kotlin/JS 프로젝트에서 증분 컴파일을 사용해 보신 후 [이 YouTrack 이슈](https://youtrack.jetbrains.com/issue/KT-50203)를 통해 의견을 들려주세요.

### IR 컴파일러 기반 최상위 프로퍼티의 기본 지연 초기화 {id="lazy-initialization-of-top-level-properties-by-default-with-ir-compiler"}

Kotlin 1.4.30에서는 JS IR 컴파일러의 [최상위 프로퍼티 지연 초기화(lazy initialization)](whatsnew1430.md#lazy-initialization-of-top-level-properties) 프로토타입을 선보였습니다.
지연 초기화는 애플리케이션 시작 시 모든 프로퍼티를 초기화할 필요가 없도록 하여 시작 시간을 단축합니다.
실제 Kotlin/JS 애플리케이션을 측정한 결과 약 10%의 속도 향상이 나타났습니다.

이제 이 메커니즘을 다듬고 철저히 테스트하여 IR 컴파일러에서 최상위 프로퍼티의 지연 초기화를 기본값으로 설정했습니다.

```kotlin
// 지연 초기화
val a = run {
    val result = // 많은 계산 작업
        println(result)
    result
} // 변수가 처음 사용될 때 run이 실행됩니다
```

어떤 이유로든 프로퍼티를 즉시(애플리케이션 시작 시) 초기화해야 하는 경우, [`@EagerInitialization`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.native/-eager-initialization/) 어노테이션을 표시하세요.

### IR 컴파일러 기반 프로젝트 모듈별 JS 파일 분리가 기본값으로 적용 {id="separate-js-files-for-project-modules-by-default-with-ir-compiler"}

이전에는 JS IR 컴파일러가 프로젝트 모듈별로 [별도의 `.js` 파일을 생성하는 기능](https://youtrack.jetbrains.com/issue/KT-44319)을 제공했습니다.
이는 전체 프로젝트에 대해 단일 `.js` 파일을 생성하는 기본 옵션의 대안이었습니다.
단일 파일 방식은 프로젝트의 함수를 하나만 사용하려고 해도 전체 JS 파일을 종속성으로 포함해야 하므로 파일이 너무 크고 사용하기 불편할 수 있습니다.
여러 파일로 분할하면 유연성이 향상되고 이러한 종속성의 크기가 줄어듭니다. 이 기능은 이전에는 `-Xir-per-module` 컴파일러 옵션으로 제공되었습니다.

1.6.20부터 JS IR 컴파일러는 기본적으로 프로젝트 모듈마다 별도의 `.js` 파일을 생성합니다.

프로젝트를 단일 `.js` 파일로 컴파일하려면 다음 Gradle 프로퍼티를 사용할 수 있습니다:

```none
# gradle.properties
kotlin.js.ir.output.granularity=whole-program // 기본값은 `per-module`
```

이전 릴리스에서는 실험적 모듈별 모드(`-Xir-per-module=true` 플래그로 사용) 사용 시 각 모듈의 `main()` 함수가 호출되었습니다. 이는 일반적인 단일 `.js` 모드와 일관성이 없었습니다. 1.6.20부터는 두 경우 모두 메인 모듈의 `main()` 함수만 호출됩니다. 모듈이 로드될 때 특정 코드를 실행해야 하는 경우 `@EagerInitialization` 어노테이션이 지정된 최상위 프로퍼티를 사용할 수 있습니다. [IR 컴파일러 기반 최상위 프로퍼티의 기본 지연 초기화](#lazy-initialization-of-top-level-properties-by-default-with-ir-compiler)를 참조하세요.

### Char 클래스 최적화 {id="char-class-optimization"}

이제 `Char` 클래스는 박싱(boxing) 없이 Kotlin/JS 컴파일러에 의해 처리됩니다([인라인 클래스](inline-classes.md)와 유사).
이를 통해 Kotlin/JS 코드에서 문자에 대한 연산 속도가 향상됩니다.

성능 개선 외에도 JavaScript로 `Char`가 내보내지는 방식이 변경되어, 이제 `Number`로 변환됩니다.

### 내보내기 및 TypeScript 선언 생성 개선 {id="improvements-to-export-and-typescript-declaration-generation"}

Kotlin 1.6.20에는 [TypeScript 선언(`.d.ts`) 생성](js-project-setup.md#generation-of-typescript-declaration-files-d-ts)을 포함하여 내보내기 메커니즘([`@JsExport`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.js/-js-export/) 어노테이션)에 대한 여러 수정 및 개선 사항이 포함되어 있습니다.
인터페이스 및 enum을 내보낼 수 있는 기능이 추가되었으며, 이전에 보고된 몇 가지 특이 케이스에서의 내보내기 동작이 수정되었습니다.
자세한 내용은 [YouTrack의 내보내기 개선 사항 목록](https://youtrack.jetbrains.com/issues?q=Project:%20Kotlin%20issue%20id:%20KT-45434,%20KT-44494,%20KT-37916,%20KT-43191,%20KT-46961,%20KT-40236)을 참조하세요.

[JavaScript에서 Kotlin 코드를 사용하는 방법](js-to-kotlin-interop.md)에 대해 자세히 알아보세요.

### 비동기 테스트를 위한 @AfterTest 보장 {id="aftertest-guarantees-for-asynchronous-tests"}

Kotlin 1.6.20에서는 Kotlin/JS의 비동기 테스트에서 [`@AfterTest`](https://kotlinlang.org/api/latest/kotlin.test/kotlin.test/-after-test/) 함수가 올바르게 작동하도록 개선되었습니다.
테스트 함수의 반환 타입이 정적으로 [`Promise`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.js/-promise/)로 확인되는 경우, 컴파일러는 이제 해당 [`then()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.js/-promise/then.html) 콜백에 `@AfterTest` 함수의 실행을 예약합니다.

## 보안 {id="security"}

Kotlin 1.6.20에서는 코드의 보안을 개선하기 위한 몇 가지 기능이 도입되었습니다:

* [klib에서 상대 경로 사용](#using-relative-paths-in-klibs)
* [Kotlin/JS Gradle 프로젝트를 위한 yarn.lock 유지(persist)](#persisting-yarn-lock-for-kotlin-js-gradle-projects)
* [기본적으로 `--ignore-scripts`를 적용하여 npm 종속성 설치](#installation-of-npm-dependencies-with-ignore-scripts-by-default)

### klib에서 상대 경로 사용 {id="using-relative-paths-in-klibs"}

`klib` 형식의 라이브러리에는 올바른 디버그 정보를 생성하기 위한 소스 파일 경로를 포함하여, 소스 파일의 직렬화된 IR 표현이 [포함되어 있습니다](native-libraries.md#library-format).
Kotlin 1.6.20 이전에는 저장된 파일 경로가 절대 경로였습니다. 라이브러리 작성자가 절대 경로를 노출하고 싶지 않을 수 있으므로, 1.6.20 버전에서는 대안 옵션을 제공합니다.

`klib`을 게시할 때 아티팩트에 소스 파일의 상대 경로만 사용하려는 경우, 하나 이상의 소스 파일 기본 경로와 함께 `-Xklib-relative-path-base` 컴파일러 옵션을 전달할 수 있습니다:

<tabs group="build-script">
<tab title="Kotlin" group-key="kotlin">

```kotlin
tasks.withType(org.jetbrains.kotlin.gradle.dsl.KotlinCompile::class).configureEach {
    // $base는 소스 파일의 기본 경로입니다
    kotlinOptions.freeCompilerArgs += "-Xklib-relative-path-base=$base"
}
```

</tab>
<tab title="Groovy" group-key="groovy">

```groovy
tasks.withType(org.jetbrains.kotlin.gradle.dsl.KotlinCompile).configureEach {
    kotlinOptions {
        // $base는 소스 파일의 기본 경로입니다
        freeCompilerArgs += "-Xklib-relative-path-base=$base"
    }
}
``` 

</tab>
</tabs>

### Kotlin/JS Gradle 프로젝트를 위한 yarn.lock 유지 {id="persisting-yarn-lock-for-kotlin-js-gradle-projects"}

> 이 기능은 Kotlin 1.6.10으로 백포트(backport)되었습니다.
>
{style="note"}

이제 Kotlin/JS Gradle 플러그인은 `yarn.lock` 파일을 영구 보관(persist)하는 기능을 제공하므로, 추가적인 Gradle 구성 없이도 프로젝트의 npm 종속성 버전을 고정(lock)할 수 있습니다.
이 기능으로 인해 프로젝트 루트에 자동 생성되는 `kotlin-js-store` 디렉터리가 추가되어 기본 프로젝트 구조가 변경됩니다.
이 디렉터리 내부에 `yarn.lock` 파일이 보관됩니다.

`kotlin-js-store` 디렉터리와 그 내용을 버전 관리 시스템(VCS)에 커밋하는 것을 강력히 권장합니다.
락파일(lockfile)을 버전 관리 시스템에 커밋하는 것은 다른 컴퓨터의 개발 환경이든 CI/CD 서비스이든 관계없이 모든 머신에서 애플리케이션이 완전히 동일한 종속성 트리로 빌드되도록 보장하므로 [권장되는 방식](https://classic.yarnpkg.com/blog/2016/11/24/lockfiles-for-all/)입니다.
또한 락파일은 새 머신에서 프로젝트를 체크아웃할 때 npm 종속성이 조용히 업데이트되는 것을 방지해주며, 이는 중요한 보안 문제이기도 합니다.

[Dependabot](https://github.com/dependabot)과 같은 도구도 Kotlin/JS 프로젝트의 `yarn.lock` 파일을 구문 분석하여 종속된 npm 패키지에 보안 취약점이 있는 경우 경고를 제공할 수 있습니다.

필요한 경우 빌드 스크립트에서 디렉터리와 락파일 이름을 모두 변경할 수 있습니다:

<tabs group="build-script">
<tab title="Kotlin" group-key="kotlin">

```kotlin
rootProject.plugins.withType<org.jetbrains.kotlin.gradle.targets.js.yarn.YarnPlugin> {
    rootProject.the<org.jetbrains.kotlin.gradle.targets.js.yarn.YarnRootExtension>().lockFileDirectory =
        project.rootDir.resolve("my-kotlin-js-store")
    rootProject.the<org.jetbrains.kotlin.gradle.targets.js.yarn.YarnRootExtension>().lockFileName = "my-yarn.lock"
}
```

</tab>
<tab title="Groovy" group-key="groovy">

```groovy
rootProject.plugins.withType(org.jetbrains.kotlin.gradle.targets.js.yarn.YarnPlugin) {
    rootProject.extensions.getByType(org.jetbrains.kotlin.gradle.targets.js.yarn.YarnRootExtension).lockFileDirectory =
        file("my-kotlin-js-store")
    rootProject.extensions.getByType(org.jetbrains.kotlin.gradle.targets.js.yarn.YarnRootExtension).lockFileName = 'my-yarn.lock'
}
``` 

</tab>
</tabs>

> 락파일의 이름을 변경하면 종속성 검사 도구가 해당 파일을 인식하지 못할 수 있습니다.
> 
{style="warning"}

### 기본적으로 --ignore-scripts를 적용하여 npm 종속성 설치 {id="installation-of-npm-dependencies-with-ignore-scripts-by-default"}

> 이 기능은 Kotlin 1.6.10으로 백포트되었습니다.
>
{style="note"}

이제 Kotlin/JS Gradle 플러그인은 기본적으로 npm 종속성을 설치하는 동안 [라이프사이클 스크립트(lifecycle scripts)](https://docs.npmjs.com/cli/v8/using-npm/scripts#life-cycle-scripts)의 실행을 차단합니다.
이 변경 사항은 감염되거나 변조된 npm 패키지에서 악성 코드가 실행될 가능성을 줄이기 위한 조치입니다.

이전 구성으로 되돌리려면 `build.gradle(.kts)`에 다음 줄을 추가하여 라이프사이클 스크립트 실행을 명시적으로 활성화할 수 있습니다:

<tabs group="build-script">
<tab title="Kotlin" group-key="kotlin">

```kotlin
rootProject.plugins.withType<org.jetbrains.kotlin.gradle.targets.js.yarn.YarnPlugin> {
    rootProject.the<org.jetbrains.kotlin.gradle.targets.js.yarn.YarnRootExtension>().ignoreScripts = false
}
```

</tab>
<tab title="Groovy" group-key="groovy">

```groovy
rootProject.plugins.withType(org.jetbrains.kotlin.gradle.targets.js.yarn.YarnPlugin) {
    rootProject.extensions.getByType(org.jetbrains.kotlin.gradle.targets.js.yarn.YarnRootExtension).ignoreScripts = false
}
``` 

</tab>
</tabs>

[Kotlin/JS Gradle 프로젝트의 npm 종속성](js-project-setup.md#npm-dependencies)에 대해 자세히 알아보세요.

## Gradle {id="gradle"}

Kotlin 1.6.20은 Kotlin Gradle 플러그인에 다음과 같은 변경 사항을 제공합니다:

* Kotlin 컴파일러 실행 전략을 정의하기 위한 새로운 [프로퍼티 `kotlin.compiler.execution.strategy` 및 `compilerExecutionStrategy`](#properties-for-defining-kotlin-compiler-execution-strategy)
* [`kapt.use.worker.api`, `kotlin.experimental.coroutines`, `kotlin.coroutines` 옵션 사용 중단(Deprecation)](#deprecation-of-build-options-for-kapt-and-coroutines)
* [`kotlin.parallel.tasks.in.project` 빌드 옵션 제거](#removal-of-the-kotlin-parallel-tasks-in-project-build-option)

### Kotlin 컴파일러 실행 전략 정의 프로퍼티 {id="properties-for-defining-kotlin-compiler-execution-strategy"}

Kotlin 1.6.20 이전에는 시스템 프로퍼티 `-Dkotlin.compiler.execution.strategy`를 사용하여 Kotlin 컴파일러 실행 전략을 정의했습니다.
이 프로퍼티는 경우에 따라 사용하기 불편할 수 있었습니다.
Kotlin 1.6.20에서는 이름이 동일한 Gradle 프로퍼티 `kotlin.compiler.execution.strategy`와 컴파일 작업 프로퍼티 `compilerExecutionStrategy`를 도입했습니다.

시스템 프로퍼티는 계속 작동하지만 향후 릴리스에서 제거될 예정입니다.

현재 프로퍼티의 우선순위는 다음과 같습니다:

* 작업 프로퍼티인 `compilerExecutionStrategy`가 시스템 프로퍼티 및 Gradle 프로퍼티인 `kotlin.compiler.execution.strategy`보다 우선합니다.
* Gradle 프로퍼티가 시스템 프로퍼티보다 우선합니다.

이 프로퍼티에 지정할 수 있는 세 가지 컴파일러 실행 전략이 있습니다:

| 전략 | Kotlin 컴파일러 실행 위치 | 증분 컴파일 지원 여부 | 기타 특징 |
|----------------|--------------------------------------|-------------------------|------------------------------------------------------------------------|
| Daemon | 자체 데몬 프로세스 내부 | 지원함 | *기본 전략*. 서로 다른 Gradle 데몬 간에 공유될 수 있음 |
| In process | Gradle 데몬 프로세스 내부 | 지원 안 함 | Gradle 데몬과 힙을 공유할 수 있음 |
| Out of process | 각 호출마다 별도의 프로세스에서 실행 | 지원 안 함 | — |

이에 따라 `kotlin.compiler.execution.strategy` 프로퍼티(시스템 및 Gradle 프로퍼티 모두)에 사용할 수 있는 값은 다음과 같습니다:
1. `daemon` (기본값)
2. `in-process`
3. `out-of-process`

`gradle.properties`에서 Gradle 프로퍼티 `kotlin.compiler.execution.strategy`를 사용하는 방법:

```none
# gradle.properties
kotlin.compiler.execution.strategy=out-of-process
```

`compilerExecutionStrategy` 작업 프로퍼티에 사용할 수 있는 값은 다음과 같습니다:

1. `org.jetbrains.kotlin.gradle.tasks.KotlinCompilerExecutionStrategy.DAEMON` (기본값)
2. `org.jetbrains.kotlin.gradle.tasks.KotlinCompilerExecutionStrategy.IN_PROCESS`
3. `org.jetbrains.kotlin.gradle.tasks.KotlinCompilerExecutionStrategy.OUT_OF_PROCESS`

`build.gradle.kts` 빌드 스크립트에서 `compilerExecutionStrategy` 작업 프로퍼티를 사용하는 방법:

```kotlin
import org.jetbrains.kotlin.gradle.dsl.KotlinCompile
import org.jetbrains.kotlin.gradle.tasks.KotlinCompilerExecutionStrategy

// ...

tasks.withType<KotlinCompile>().configureEach {
    compilerExecutionStrategy.set(KotlinCompilerExecutionStrategy.IN_PROCESS)
}
```

피드백은 [이 YouTrack 태스크](https://youtrack.jetbrains.com/issue/KT-49299)에 남겨주세요.

### kapt 및 코루틴 관련 빌드 옵션 사용 중단 {id="deprecation-of-build-options-for-kapt-and-coroutines"}

Kotlin 1.6.20에서는 다음 프로퍼티들의 지원 중단 수준(deprecation level)을 변경했습니다:

* `kapt.use.worker.api`를 통해 Kotlin 데몬으로 [kapt](kapt.md)를 실행하는 기능을 지원 중단했습니다. 이제 Gradle 출력에 경고가 발생합니다.
  기본적으로 [kapt는 1.3.70 릴리스부터 Gradle 워커를 사용](kapt.md#run-kapt-tasks-in-parallel)해 왔으며, 이 방식을 계속 사용할 것을 권장합니다.

  향후 릴리스에서 `kapt.use.worker.api` 옵션을 완전히 제거할 예정입니다.

* `kotlin.experimental.coroutines` Gradle DSL 옵션과 `gradle.properties`에서 사용되던 `kotlin.coroutines` 프로퍼티를 지원 중단했습니다.
  단순히 _일시 중단 함수(suspending functions)_를 사용하거나 `build.gradle(.kts)` 파일에 [`kotlinx.coroutines` 종속성을 추가](gradle-configure-project.md#set-a-dependency-on-a-kotlinx-library)하면 됩니다.
  
  코루틴에 대한 자세한 내용은 [코루틴 가이드](coroutines-guide.md)를 참조하세요.

### kotlin.parallel.tasks.in.project 빌드 옵션 제거 {id="removal-of-the-kotlin-parallel-tasks-in-project-build-option"}

Kotlin 1.5.20에서는 [`kotlin.parallel.tasks.in.project` 빌드 옵션의 지원 중단](whatsnew1520.md#deprecation-of-the-kotlin-parallel-tasks-in-project-build-property)을 발표했습니다.
이 옵션은 Kotlin 1.6.20에서 완전히 제거되었습니다.

프로젝트에 따라 Kotlin 데몬에서의 병렬 컴파일은 더 많은 메모리를 필요로 할 수 있습니다.
메모리 사용량을 줄이려면 [Kotlin 데몬의 힙 크기를 늘려주세요](gradle-compilation-and-caches.md#setting-kotlin-daemon-s-jvm-arguments).

Kotlin Gradle 플러그인에서 [현재 지원되는 컴파일러 옵션](gradle-compiler-options.md)에 대해 자세히 알아보세요.