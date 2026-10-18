[//]: # (title: Kotlin 1.7.0의 새로운 기능)

<web-summary>새로운 언어 기능, Kotlin Multiplatform, JVM, Native, JS 업데이트, Gradle 및 Maven 빌드 툴 지원을 다루는 Kotlin 1.7.0 릴리스 노트를 확인해 보세요.</web-summary>

<tldr>
   <p>Kotlin 1.7.0에 대한 IDE 지원은 IntelliJ IDEA 2021.2, 2021.3 및 2022.1에서 사용할 수 있습니다.</p>
</tldr>

_[출시일: 2022년 6월 9일](releases.md#release-history)_

Kotlin 1.7.0이 출시되었습니다. 이번 버전에서는 새로운 Kotlin/JVM K2 컴파일러의 알파(Alpha) 버전을 공개하고, 언어 기능을 안정화(Stable)했으며, JVM, JS 및 Native 플랫폼의 성능을 개선했습니다.

이번 버전의 주요 업데이트 목록은 다음과 같습니다.

* [새로운 Kotlin K2 컴파일러가 이제 알파(Alpha) 단계에 진입했으며](#new-kotlin-k2-compiler-for-the-jvm-in-alpha), 상당한 성능 향상을 제공합니다. 현재 JVM 전용으로 제공되며, kapt를 포함한 컴파일러 플러그인은 작동하지 않습니다.
* [Gradle에서의 점진적 컴파일(Incremental compilation)에 대한 새로운 접근 방식이 도입되었습니다](#a-new-approach-to-incremental-compilation). 이제 의존성이 있는 비-Kotlin 모듈 내부에서 발생한 변경 사항에 대해서도 점진적 컴파일이 지원되며 Gradle과 호환됩니다.
* [옵트인(Opt-in) 요구 사항 어노테이션](#stable-opt-in-requirements), [명확한 널 불가 타입(Definitely non-nullable types)](#stable-definitely-non-nullable-types), [빌더 타입 추론(Builder inference)](#stable-builder-inference)이 안정화되었습니다.
* [타입 인자를 위한 밑줄 연산자(`_`)가 도입되었습니다](#underscore-operator-for-type-arguments). 다른 타입이 명시적으로 지정되었을 때 특정 인자의 타입을 자동으로 추론하도록 하는 데 사용할 수 있습니다.
* [이번 릴리스에서는 인라인 클래스의 인라인된 값으로의 위임을 통한 구현이 허용됩니다](#allow-implementation-by-delegation-to-an-inlined-value-of-an-inline-class). 이제 대부분의 경우 메모리를 할당하지 않는 경량 래퍼(Wrapper)를 생성할 수 있습니다.

다음 영상에서도 변경 사항에 대한 간단한 개요를 확인할 수 있습니다.

<video src="https://www.youtube.com/v/54WEfLKtCGk" title="What's new in Kotlin 1.7.0"/>

> Kotlin 릴리스 주기에 대한 자세한 내용은 [Kotlin 릴리스 프로세스](releases.md)를 참고하세요.
>
{style="tip"}

## 새로운 Kotlin/JVM K2 컴파일러 알파(Alpha) {id="new-kotlin-k2-compiler-for-the-jvm-in-alpha"}

이번 Kotlin 릴리스에서는 새로운 Kotlin K2 컴파일러의 **알파(Alpha)** 버전을 선보입니다. 새 컴파일러는 새로운 언어 기능 개발의 속도를 높이고, Kotlin이 지원하는 모든 플랫폼을 통합하며, 성능을 개선하고, 컴파일러 확장을 위한 API를 제공하는 것을 목표로 합니다.

새 컴파일러와 그 장점에 대한 자세한 설명은 이미 공개되어 있습니다.

* [새로운 Kotlin 컴파일러로 가는 길(The Road to the New Kotlin Compiler)](https://www.youtube.com/watch?v=iTdJJq_LyoY)
* [K2 컴파일러: 탑다운 뷰(K2 Compiler: a Top-Down View)](https://www.youtube.com/watch?v=db19VFLZqJM)

새 K2 컴파일러의 알파 버전에서는 주로 성능 개선에 집중했으며, 현재 JVM 프로젝트에서만 동작한다는 점에 유의해야 합니다. Kotlin/JS, Kotlin/Native 또는 기타 멀티플랫폼 프로젝트는 지원하지 않으며, [kapt](kapt.md)를 포함한 컴파일러 플러그인은 작동하지 않습니다.

내부 프로젝트 벤치마크 결과에서 놀라운 성능 향상을 확인했습니다.

| 프로젝트       | 기존 Kotlin 컴파일러 성능 | 새 K2 Kotlin 컴파일러 성능 | 성능 향상 |
|---------------|-------------------------------------|------------------------------------|-------------------|
| Kotlin        | 2.2 KLOC/s                          | 4.8 KLOC/s                         | ~ x2.2            |
| YouTrack      | 1.8 KLOC/s                          | 4.2 KLOC/s                         | ~ x2.3            |
| IntelliJ IDEA | 1.8 KLOC/s                          | 3.9 KLOC/s                         | ~ x2.2            |
| Space         | 1.2 KLOC/s                          | 2.8 KLOC/s                         | ~ x2.3            |

> KLOC/s 성능 수치는 컴파일러가 초당 처리하는 코드 라인 수(1,000줄 단위)를 의미합니다.
>
> {style="tip"}

JVM 프로젝트에서 성능 향상을 직접 확인하고 기존 컴파일러의 결과와 비교해 볼 수 있습니다. Kotlin K2 컴파일러를 활성화하려면 다음 컴파일러 옵션을 사용하세요.

```bash
-Xuse-k2
```

또한 K2 컴파일러에는 [수많은 버그 수정이 포함되어 있습니다](https://youtrack.jetbrains.com/issues/KT?q=tag:%20FIR-preview-qa%20%23Resolved).
해당 목록에서 **State: Open** 상태인 이슈라 하더라도 실제로는 K2에서 해결된 경우가 있으니 참고하시기 바랍니다.

향후 Kotlin 릴리스에서는 K2 컴파일러의 안정성을 더욱 높이고 더 많은 기능을 제공할 예정입니다. 기대해 주세요!

Kotlin K2 컴파일러 사용 중 성능 문제를 발견하면 [이슈 트래커에 보고해 주시기 바랍니다](https://kotl.in/issue).

## 언어 (Language) {id="language"}

Kotlin 1.7.0에서는 위임을 통한 구현 지원과 타입 인자를 위한 새로운 밑줄 연산자가 도입되었습니다. 또한 이전 릴리스에서 미리보기로 제공되었던 몇 가지 언어 기능이 안정화되었습니다.

* [인라인 클래스의 인라인된 값으로 위임하여 구현 허용](#allow-implementation-by-delegation-to-an-inlined-value-of-an-inline-class)
* [타입 인자를 위한 밑줄 연산자](#underscore-operator-for-type-arguments)
* [빌더 추론 안정화](#stable-builder-inference)
* [옵트인 요구 사항 안정화](#stable-opt-in-requirements)
* [명확한 널 불가 타입 안정화](#stable-definitely-non-nullable-types)

### 인라인 클래스의 인라인된 값으로 위임하여 구현 허용 {id="allow-implementation-by-delegation-to-an-inlined-value-of-an-inline-class"}

값이나 클래스 인스턴스에 대한 경량 래퍼를 생성하려는 경우, 모든 인터페이스 메서드를 직접 구현해야 했습니다. 위임을 통한 구현(Implementation by delegation)이 이 문제를 해결해 주지만, 1.7.0 이전에는 인라인 클래스에서 작동하지 않았습니다. 이 제한이 제거되어 이제 대부분의 경우 메모리를 할당하지 않는 경량 래퍼를 생성할 수 있습니다.

```kotlin
interface Bar {
    fun foo() = "foo"
}

@JvmInline
value class BarWrapper(val bar: Bar): Bar by bar

fun main() {
    val bw = BarWrapper(object: Bar {})
    println(bw.foo())
}
```

### 타입 인자를 위한 밑줄 연산자 {id="underscore-operator-for-type-arguments"}

Kotlin 1.7.0에서는 타입 인자를 위한 밑줄 연산자 `_`를 도입했습니다. 다른 타입이 명시적으로 지정되었을 때 특정 타입 인자를 자동으로 추론하도록 지정할 수 있습니다.

```kotlin
abstract class SomeClass<T> {
    abstract fun execute(): T
}

class SomeImplementation : SomeClass<String>() {
    override fun execute(): String = "Test"
}

class OtherImplementation : SomeClass<Int>() {
    override fun execute(): Int = 42
}

object Runner {
    inline fun <reified S: SomeClass<T>, T> run(): T {
        return S::class.java.getDeclaredConstructor().newInstance().execute()
    }
}

fun main() {
    // SomeImplementation이 SomeClass<String>에서 파생되었으므로 T는 String으로 추론됩니다.
    val s = Runner.run<SomeImplementation, _>()
    assert(s == "Test")

    // OtherImplementation이 SomeClass<Int>에서 파생되었으므로 T는 Int로 추론됩니다.
    val n = Runner.run<OtherImplementation, _>()
    assert(n == 42)
}
```

> 타입 인자를 추론하기 위해 변수 목록의 어느 위치에서든 밑줄 연산자를 사용할 수 있습니다.
>
{style="note"}

### 빌더 추론 안정화 {id="stable-builder-inference"}

빌더 추론(Builder inference)은 제네릭 빌더 함수를 호출할 때 유용한 특수한 형태의 타입 추론입니다. 컴파일러가 람다 인자 내부의 다른 호출에 대한 타입 정보를 사용하여 해당 호출의 타입 인자를 추론하도록 돕습니다.

1.7.0부터는 일반 타입 추론이 타입에 대한 충분한 정보를 얻을 수 없을 때, [1.6.0에 도입되었던](whatsnew16.md#changes-to-builder-inference) `-Xenable-builder-inference` 컴파일러 옵션을 명시하지 않아도 빌더 추론이 자동으로 활성화됩니다.

[커스텀 제네릭 빌더 작성 방법 알아보기](using-builders-with-builder-inference.md).

### 옵트인 요구 사항 안정화 {id="stable-opt-in-requirements"}

[옵트인 요구 사항(Opt-in requirements)](opt-in-requirements.md)이 이제 [안정화(Stable)](components-stability.md)되어 추가 컴파일러 구성이 필요하지 않습니다.

1.7.0 이전에는 경고를 방지하기 위해 옵트인 기능 자체에 `-opt-in=kotlin.RequiresOptIn` 인자가 필요했습니다. 이제는 더 이상 필요하지 않지만, 다른 어노테이션이나 [모듈](opt-in-requirements.md#opt-in-a-module)에 옵트인하기 위해 컴파일러 인자 `-opt-in`을 계속 사용할 수 있습니다.

### 명확한 널 불가 타입 안정화 {id="stable-definitely-non-nullable-types"}

Kotlin 1.7.0에서는 명확한 널 불가 타입(Definitely non-nullable types)이 [안정화(Stable)](components-stability.md) 상태로 승격되었습니다. 이를 통해 제네릭 Java 클래스 및 인터페이스를 확장할 때 더 나은 상호 운용성을 제공합니다.

새로운 구문인 `T & Any`를 사용하여 사용하는 위치(use site)에서 제네릭 타입 파라미터를 명확히 널 불가로 표시할 수 있습니다. 이 구문 형식은 [교차 타입(Intersection types)](https://en.wikipedia.org/wiki/Intersection_type) 표기법에서 비롯되었으며, 현재는 `&` 왼쪽에 널 허용 상위 바운드가 있고 오른쪽에 널 불가 `Any`가 있는 타입 파라미터로 제한됩니다.

```kotlin
fun <T> elvisLike(x: T, y: T & Any): T & Any = x ?: y

fun main() {
    // 성공
    elvisLike<String>("", "").length
    // 오류: 'null'은 널 불가 타입의 값이 될 수 없습니다.
    elvisLike<String>("", null).length

    // 성공
    elvisLike<String?>(null, "").length
    // 오류: 'null'은 널 불가 타입의 값이 될 수 없습니다.
    elvisLike<String?>(null, null).length
}
```

명확한 널 불가 타입에 대한 자세한 내용은 [이 KEEP](https://github.com/Kotlin/KEEP/blob/master/proposals/definitely-non-nullable-types.md)에서 확인할 수 있습니다.

## Kotlin/JVM {id="kotlin-jvm"}

이번 릴리스에서는 Kotlin/JVM 컴파일러의 성능 개선과 새로운 컴파일러 옵션이 제공됩니다. 또한 함수형 인터페이스 생성자에 대한 호출 가능 참조가 안정화되었습니다. 1.7.0부터 Kotlin/JVM 컴파일의 기본 타깃 버전이 `1.8`이라는 점에 유의하세요.

* [컴파일러 성능 최적화](#compiler-performance-optimizations)
* [새로운 컴파일러 옵션 `-Xjdk-release`](#new-compiler-option-xjdk-release)
* [함수형 인터페이스 생성자에 대한 호출 가능 참조 안정화](#stable-callable-references-to-functional-interface-constructors)
* [JVM 타깃 버전 1.6 제거](#removed-jvm-target-version-1-6)

### 컴파일러 성능 최적화 {id="compiler-performance-optimizations"}

Kotlin 1.7.0에서는 Kotlin/JVM 컴파일러의 성능이 개선되었습니다. 벤치마크에 따르면 Kotlin 1.6.0에 비해 컴파일 시간이 [평균 10% 단축](https://youtrack.jetbrains.com/issue/KT-48233/Switching-to-JVM-IR-backend-increases-compilation-time-by-more-t#focus=Comments-27-6114542.0-0)되었습니다. 바이트코드 후처리 개선 덕분에 [`kotlinx.html`을 사용하는 프로젝트](https://youtrack.jetbrains.com/issue/KT-51416/Compilation-of-kotlinx-html-DSL-should-still-be-faster)와 같이 인라인 함수를 많이 사용하는 프로젝트의 컴파일 속도가 더욱 빨라집니다.

### 새로운 컴파일러 옵션: -Xjdk-release {id="new-compiler-option-xjdk-release"}

Kotlin 1.7.0에서는 새로운 컴파일러 옵션 `-Xjdk-release`를 제공합니다. 이 옵션은 [javac의 커맨드 라인 `--release` 옵션](http://openjdk.java.net/jeps/247)과 유사합니다. `-Xjdk-release` 옵션은 타깃 바이트코드 버전을 제어하고 클래스패스에 있는 JDK API를 지정된 Java 버전으로 제한합니다. 예를 들어 `kotlinc -Xjdk-release=1.8`을 사용하면 의존성에 포함된 JDK가 버전 9 이상이더라도 `java.lang.Module`을 참조할 수 없습니다.

> 이 옵션이 모든 JDK 배포판에서 효과적이라고 [보장되지는 않습니다](https://youtrack.jetbrains.com/issue/KT-29974).
>
{style="note"}

피드백은 [이 YouTrack 티켓](https://youtrack.jetbrains.com/issue/KT-29974/Add-a-compiler-option-Xjdk-release-similar-to-javac-s-release-to)에 남겨주세요.

### 함수형 인터페이스 생성자에 대한 호출 가능 참조 안정화 {id="stable-callable-references-to-functional-interface-constructors"}

함수형 인터페이스 생성자에 대한 [호출 가능 참조(Callable references)](fun-interfaces.md#pass-callable-references-to-sam-parameters)가 이제 [안정화(Stable)](components-stability.md)되었습니다. 호출 가능 참조를 사용하여 생성자 함수가 있는 인터페이스에서 함수형 인터페이스로 [마이그레이션](fun-interfaces.md#migration-from-an-interface-with-constructor-function-to-a-functional-interface)하는 방법을 확인해 보세요.

발견된 문제는 [YouTrack](https://youtrack.jetbrains.com/newissue?project=kt)에 보고해 주시기 바랍니다.

### JVM 타깃 버전 1.6 제거 {id="removed-jvm-target-version-1-6"}

Kotlin/JVM 컴파일의 기본 타깃 버전은 `1.8`입니다. `1.6` 타깃은 제거되었습니다.

JVM 타깃 1.8 이상으로 마이그레이션하세요. 각 빌드 환경별 JVM 타깃 버전 업데이트 방법은 다음을 참고하세요.

* [Gradle](gradle-compiler-options.md#attributes-specific-to-jvm)
* [Maven](maven-kotlin-compiler.md#attributes-specific-to-jvm)
* [커맨드 라인 컴파일러](compiler-reference.md#jvm-target-version)

## Kotlin/Native {id="kotlin-native"}

Kotlin 1.7.0에는 Objective-C 및 Swift 상호 운용성 변경 사항이 포함되어 있으며, 이전 릴리스에 도입된 기능들이 안정화되었습니다. 또한 새로운 메모리 관리자의 성능 개선과 더불어 다양한 업데이트가 적용되었습니다.

* [새로운 메모리 관리자의 성능 개선](#performance-improvements-for-the-new-memory-manager)
* [JVM 및 JS IR 백엔드와의 컴파일러 플러그인 ABI 통합](#unified-compiler-plugin-abi-with-jvm-and-js-ir-backends)
* [독립형 Android 실행 파일 지원](#support-for-standalone-android-executables)
* [Swift async/await과의 상호 운용: `KotlinUnit` 대신 `Void` 반환](#interop-with-swift-async-await-returning-void-instead-of-kotlinunit)
* [Objective-C 브리지를 통한 미선언 예외 전달 금지](#prohibited-undeclared-exceptions-through-objective-c-bridges)
* [CocoaPods 연동 개선](#improved-cocoapods-integration)
* [Kotlin/Native 컴파일러 다운로드 URL 재정의](#overriding-the-kotlin-native-compiler-download-url)

### 새로운 메모리 관리자의 성능 개선 {id="performance-improvements-for-the-new-memory-manager"}

> 새로운 Kotlin/Native 메모리 관리자는 [알파(Alpha)](components-stability.md) 단계입니다.
> 향후 호환되지 않는 변경이 발생할 수 있으며 수동 마이그레이션이 필요할 수 있습니다.
> [YouTrack](https://youtrack.jetbrains.com/issue/KT-48525)에 피드백을 남겨주시면 감사하겠습니다.
>
{style="note"}

새 메모리 관리자는 아직 알파 단계이지만 [안정화(Stable)](components-stability.md)를 향해 나아가고 있습니다. 이번 릴리스에서는 새 메모리 관리자, 특히 가비지 컬렉션(GC)의 성능이 크게 개선되었습니다. 특히 [1.6.20에서 도입된](whatsnew1620.md) 스윕(sweep) 단계의 동시 구현이 이제 기본적으로 활성화됩니다. 이를 통해 GC로 인해 애플리케이션이 일시 중지되는 시간을 줄일 수 있습니다. 새로운 GC 스케줄러는 특히 힙 크기가 클 때 GC 주기를 더 효과적으로 선택합니다.

또한 디버그 바이너리에 대해 특별한 최적화를 수행하여 메모리 관리자 구현 코드에 적절한 최적화 수준과 링크 타임 최적화(LTO)가 적용되도록 했습니다. 덕분에 벤치마크 결과 디버그 바이너리의 실행 시간이 약 30% 개선되었습니다.

프로젝트에서 새 메모리 관리자를 사용해 보고 동작을 확인한 후, [YouTrack](https://youtrack.jetbrains.com/issue/KT-48525)을 통해 피드백을 공유해 주세요.

### JVM 및 JS IR 백엔드와의 컴파일러 플러그인 ABI 통합 {id="unified-compiler-plugin-abi-with-jvm-and-js-ir-backends"}

Kotlin 1.7.0부터 Kotlin Multiplatform Gradle 플러그인은 기본적으로 Kotlin/Native용 임베디드 컴파일러 jar를 사용합니다. 이 [기능은 1.6.0에서 실험적(Experimental) 기능으로 발표](whatsnew16.md#unified-compiler-plugin-abi-with-jvm-and-js-ir-backends)되었으며, 이제 안정화되어 바로 사용할 수 있습니다.

이 개선 사항은 컴파일러 플러그인 개발 경험을 향상하므로 라이브러리 작성자에게 매우 유용합니다. 이번 릴리스 이전에는 Kotlin/Native용 아티팩트를 별도로 제공해야 했으나, 이제는 Native 및 기타 지원 플랫폼에 동일한 컴파일러 플러그인 아티팩트를 사용할 수 있습니다.

> 이 기능으로 인해 플러그인 개발자가 기존 플러그인에 대한 마이그레이션 단계를 거쳐야 할 수도 있습니다.
>
> 업데이트를 위해 플러그인을 준비하는 방법은 [이 YouTrack 이슈](https://youtrack.jetbrains.com/issue/KT-48595)에서 확인하세요.
>
{style="warning"}

### 독립형 Android 실행 파일 지원 {id="support-for-standalone-android-executables"}

Kotlin 1.7.0은 Android Native 타깃을 위한 표준 실행 파일 생성을 완벽하게 지원합니다. 이 기능은 [1.6.20에서 도입](whatsnew1620.md#support-for-standalone-android-executables)되었으며, 이제 기본적으로 활성화됩니다.

Kotlin/Native가 공유 라이브러리를 생성하던 이전 동작으로 되돌리려면 다음 설정을 사용하세요.

```kotlin
binaryOptions["androidProgramType"] = "nativeActivity"
```

### Swift async/await과의 상호 운용: KotlinUnit 대신 Void 반환 {id="interop-with-swift-async-await-returning-void-instead-of-kotlinunit"}

이제 Kotlin `suspend` 함수가 Swift에서 `KotlinUnit` 대신 `Void` 타입을 반환합니다. 이는 Swift의 `async`/`await`와의 상호 운용성이 개선된 결과입니다. 이 기능은 [1.6.20에서 도입](whatsnew1620.md#interop-with-swift-async-await-returning-void-instead-of-kotlinunit)되었으며, 이번 릴리스부터 기본적으로 이 동작이 적용됩니다.

이러한 함수에 올바른 타입을 반환하기 위해 더 이상 `kotlin.native.binary.unitSuspendFunctionObjCExport=proper` 프로퍼티를 사용할 필요가 없습니다.

### Objective-C 브리지를 통한 미선언 예외 전달 금지 {id="prohibited-undeclared-exceptions-through-objective-c-bridges"}

Swift/Objective-C 코드에서 Kotlin 코드를 호출하거나(그 반대의 경우도 마찬가지), 해당 코드에서 예외가 발생할 때, 언어 간에 적절한 변환을 거쳐 예외를 전달하도록 명시적으로 허용하지 않는 한(예: `@Throws` 어노테이션 사용), 예외가 발생한 코드에서 처리되어야 합니다.

기존에는 경우에 따라 선언되지 않은 예외가 한 언어에서 다른 언어로 "누출(leak)"될 수 있는 의도치 않은 동작이 있었습니다. Kotlin 1.7.0에서는 이 문제를 해결하여 이제 이러한 상황이 발생하면 프로그램이 종료됩니다.

예를 들어, Kotlin에 `{ throw Exception() }` 람다가 있고 이를 Swift에서 호출하는 경우, Kotlin 1.7.0에서는 예외가 Swift 코드에 도달하는 즉시 프로그램이 종료됩니다. 이전 Kotlin 버전에서는 이러한 예외가 Swift 코드로 누출될 수 있었습니다.

`@Throws` 어노테이션은 이전과 동일하게 작동합니다.

### CocoaPods 연동 개선 {id="improved-cocoapods-integration"}

Kotlin 1.7.0부터 프로젝트에 CocoaPods를 연동할 때 더 이상 `cocoapods-generate` 플러그인을 설치할 필요가 없습니다.

이전에는 Kotlin Multiplatform Mobile 프로젝트에서 [iOS 의존성](https://kotlinlang.org/docs/multiplatform/multiplatform-ios-dependencies.html#with-cocoapods)을 처리하는 등의 작업을 위해 CocoaPods를 사용하려면 CocoaPods 의존성 관리자와 `cocoapods-generate` 플러그인을 모두 설치해야 했습니다.

이제 CocoaPods 연동 설정이 더 쉬워졌으며, Ruby 3 이상에서 `cocoapods-generate`를 설치할 수 없던 문제를 해결했습니다. 이제 Apple M1에서 더 원활하게 작동하는 최신 Ruby 버전도 지원됩니다.

[초기 CocoaPods 연동 설정 방법](https://kotlinlang.org/docs/multiplatform/multiplatform-cocoapods-overview.html#set-up-an-environment-to-work-with-cocoapods)을 확인해 보세요.

### Kotlin/Native 컴파일러 다운로드 URL 재정의 {id="overriding-the-kotlin-native-compiler-download-url"}

Kotlin 1.7.0부터 Kotlin/Native 컴파일러의 다운로드 URL을 커스텀할 수 있습니다. 이는 CI 환경에서 외부 링크 접근이 금지된 경우에 유용합니다.

기본 기본 URL인 `https://download.jetbrains.com/kotlin/native/builds`를 재정의하려면 다음 Gradle 프로퍼티를 사용하세요.

```none
kotlin.native.distribution.baseDownloadUrl=https://example.com
```

> 다운로더는 실제 컴파일러 배포판을 다운로드할 수 있도록 이 기본 URL 뒤에 네이티브 버전과 타깃 OS를 추가합니다.
>
{style="note"}

## Kotlin/JS {id="kotlin-js"}

Kotlin/JS는 개발 경험을 향상시킬 수 있는 기타 업데이트와 함께 [JS IR 컴파일러 백엔드](js-ir-compiler.md)에 대한 추가적인 개선 사항을 제공합니다.

* [새로운 IR 백엔드의 성능 개선](#performance-improvements-for-the-new-ir-backend)
* [IR 사용 시 멤버 이름 축소(Minification)](#minification-for-member-names-when-using-ir)
* [IR 백엔드에서 폴리필을 통한 구형 브라우저 지원](#support-for-older-browsers-via-polyfills-in-the-ir-backend)
* [js 표현식에서 JavaScript 모듈 동적 로드](#dynamically-load-javascript-modules-from-js-expressions)
* [JavaScript 테스트 러너용 환경 변수 지정](#specify-environment-variables-for-javascript-test-runners)

### 새로운 IR 백엔드의 성능 개선 {id="performance-improvements-for-the-new-ir-backend"}

이번 릴리스에는 개발 경험을 향상시키는 몇 가지 주요 업데이트가 포함되어 있습니다.

* Kotlin/JS의 점진적 컴파일 성능이 크게 개선되었습니다. JS 프로젝트 빌드 시간이 단축됩니다. 이제 많은 경우 점진적 리빌드 속도가 기존 레거시(legacy) 백엔드와 거의 비슷한 수준입니다.
* 최종 아티팩트의 크기를 대폭 줄여 Kotlin/JS 최종 번들의 용량이 줄어들었습니다. 일부 대규모 프로젝트에서는 레거시 백엔드 대비 프로덕션 번들 크기가 최대 20% 감소한 것으로 측정되었습니다.
* 인터페이스에 대한 타입 검사 속도가 대폭 향상되었습니다.
* Kotlin이 더 높은 품질의 JS 코드를 생성합니다.

### IR 사용 시 멤버 이름 축소(Minification) {id="minification-for-member-names-when-using-ir"}

이제 Kotlin/JS IR 컴파일러는 Kotlin 클래스와 함수의 관계에 대한 내부 정보를 활용하여 함수, 프로퍼티, 클래스 이름을 줄이는 더욱 효율적인 코드 축소(Minification)를 적용합니다. 이를 통해 번들링된 최종 애플리케이션의 크기가 줄어듭니다.

이러한 유형의 축소는 Kotlin/JS 애플리케이션을 프로덕션 모드로 빌드할 때 자동으로 적용되며 기본적으로 활성화되어 있습니다. 멤버 이름 축소를 비활성화하려면 `-Xir-minimized-member-names` 컴파일러 플래그를 사용하세요.

```kotlin
kotlin {
    js(IR) {
        compilations.all {
            compileKotlinTask.kotlinOptions.freeCompilerArgs += listOf("-Xir-minimized-member-names=false")
        }
    }
}
```

### IR 백엔드에서 폴리필을 통한 구형 브라우저 지원 {id="support-for-older-browsers-via-polyfills-in-the-ir-backend"}

이제 Kotlin/JS용 IR 컴파일러 백엔드에 레거시 백엔드와 동일한 폴리필(Polyfill)이 포함됩니다. 덕분에 새 컴파일러로 컴파일된 코드가 Kotlin 표준 라이브러리에서 사용하는 ES2015 메서드를 모두 지원하지 않는 구형 브라우저에서도 실행될 수 있습니다. 프로젝트에서 실제로 사용하는 폴리필만 최종 번들에 포함되므로 번들 크기에 미치는 잠재적 영향을 최소화합니다.

이 기능은 IR 컴파일러를 사용할 때 기본적으로 활성화되어 있으며 별도의 설정이 필요하지 않습니다.

### js 표현식에서 JavaScript 모듈 동적 로드 {id="dynamically-load-javascript-modules-from-js-expressions"}

JavaScript 모듈을 다룰 때 대부분의 애플리케이션은 정적 임포트를 사용하며, 이는 [JavaScript 모듈 연동](js-modules.md)에서 다루고 있습니다. 그러나 기존 Kotlin/JS에는 애플리케이션 실행 중(런타임)에 JavaScript 모듈을 동적으로 로드하는 메커니즘이 부족했습니다.

Kotlin 1.7.0부터 `js` 블록에서 JavaScript의 `import` 문이 지원되므로 런타임에 패키지를 애플리케이션으로 동적으로 가져올 수 있습니다.

```kotlin
val myPackage = js("import('my-package')")
```

### JavaScript 테스트 러너용 환경 변수 지정 {id="specify-environment-variables-for-javascript-test-runners"}

Node.js 패키지 확인(resolution)을 조정하거나 외부 정보를 Node.js 테스트에 전달하기 위해, 이제 JavaScript 테스트 러너가 사용할 환경 변수를 지정할 수 있습니다. 환경 변수를 정의하려면 빌드 스크립트의 `testTask` 블록 내에서 키-값 쌍과 함께 `environment()` 함수를 사용하세요.

```kotlin
kotlin {
    js {
        nodejs {
            testTask {
                environment("key", "value")
            }
        }
    }
}
```

## 표준 라이브러리 (Standard library) {id="standard-library"}

Kotlin 1.7.0에서는 표준 라이브러리에 다양한 변경과 개선이 이루어졌습니다. 새로운 기능을 도입하고, 실험적 기능을 안정화했으며, Native, JS, JVM 전반에서 명명된 캡처 그룹(Named capturing groups) 지원을 통일했습니다.

* [컬렉션 함수 min() 및 max()가 널 불가 타입 반환](#min-and-max-collection-functions-return-as-non-nullable)
* [특정 인덱스에서의 정규 표현식 매칭](#regular-expression-matching-at-specific-indices)
* [이전 언어 및 API 버전에 대한 지원 확대](#extended-support-for-previous-language-and-api-versions)
* [리플렉션을 통한 어노테이션 접근](#access-to-annotations-via-reflection)
* [깊은 재귀 함수 안정화](#stable-deep-recursive-functions)
* [기본 시간 소스를 위한 인라인 클래스 기반 타임 마크](#time-marks-based-on-inline-classes-for-default-time-source)
* [Java Optional을 위한 새로운 실험적 확장 함수](#new-experimental-extension-functions-for-java-optionals)
* [JS 및 Native에서 명명된 캡처 그룹 지원](#support-for-named-capturing-groups-in-js-and-native)

### 컬렉션 함수 min() 및 max()가 널 불가 타입 반환 {id="min-and-max-collection-functions-return-as-non-nullable"}

[Kotlin 1.4.0](whatsnew14.md)에서는 컬렉션 함수 `min()`과 `max()`의 이름을 `minOrNull()`과 `maxOrNull()`로 변경했습니다. 이 새로운 이름은 수신자 컬렉션이 비어 있는 경우 null을 반환한다는 동작을 더 명확하게 나타냅니다. 또한 Kotlin 컬렉션 API 전체에서 사용되는 명명 규칙과 함수의 동작을 일치시키는 데도 도움이 되었습니다.

Kotlin 1.4.0에서 모두 *OrNull() 형태의 동의어가 추가된 `minBy()`, `maxBy()`, `minWith()`, `maxWith()`도 마찬가지였습니다. 이 변경의 영향을 받은 기존 함수들은 점진적으로 지원 중단(deprecated)되었습니다.

Kotlin 1.7.0에서는 기존 함수 이름을 다시 도입하되, 널 불가(non-nullable) 반환 타입을 갖도록 했습니다. 새로운 `min()`, `max()`, `minBy()`, `maxBy()`, `minWith()`, `maxWith()` 함수는 이제 무조건 컬렉션 요소를 반환하거나 예외를 발생시킵니다.

```kotlin
fun main() {
    val numbers = listOf<Int>()
    println(numbers.maxOrNull()) // "null"
    println(numbers.max()) // "Exception in... Collection is empty."
}
```

### 특정 인덱스에서의 정규 표현식 매칭 {id="regular-expression-matching-at-specific-indices"}

[1.5.30에 도입된](whatsnew1530.md#matching-with-regex-at-a-particular-position) `Regex.matchAt()` 및 `Regex.matchesAt()` 함수가 이제 안정화(Stable)되었습니다. 이 함수들은 정규 표현식이 `String` 또는 `CharSequence`의 특정 위치에서 정확히 일치하는지 확인할 수 있는 방법을 제공합니다.

`matchesAt()`은 매칭 여부를 확인하고 불리언(Boolean) 결과를 반환합니다.

```kotlin
fun main() {
    val releaseText = "Kotlin 1.7.0 is on its way!"
    // 정규 표현식: 한 자리 숫자, 점, 한 자리 숫자, 점, 하나 이상의 숫자
    val versionRegex = "\\d[.]\\d[.]\\d+".toRegex()

    println(versionRegex.matchesAt(releaseText, 0)) // "false"
    println(versionRegex.matchesAt(releaseText, 7)) // "true"
}
```

`matchAt()`은 매칭된 결과가 발견되면 해당 매치를 반환하고, 그렇지 않으면 `null`을 반환합니다.

```kotlin
fun main() {
    val releaseText = "Kotlin 1.7.0 is on its way!"
    val versionRegex = "\\d[.]\\d[.]\\d+".toRegex()

    println(versionRegex.matchAt(releaseText, 0)) // "null"
    println(versionRegex.matchAt(releaseText, 7)?.value) // "1.7.0"
}
```

[이 YouTrack 이슈](https://youtrack.jetbrains.com/issue/KT-34021)에 피드백을 남겨주시면 감사하겠습니다.

### 이전 언어 및 API 버전에 대한 지원 확대 {id="extended-support-for-previous-language-and-api-versions"}

이전의 다양한 Kotlin 버전에서 사용할 수 있는 라이브러리를 개발하는 라이브러리 작성자를 지원하고, Kotlin 메이저 릴리스 주기가 짧아진 점을 고려하여 이전 언어 및 API 버전에 대한 지원 범위를 확대했습니다.

Kotlin 1.7.0부터는 이전 2개 버전 대신 이전 3개의 언어 및 API 버전을 지원합니다. 즉, Kotlin 1.7.0은 최소 1.4.0 버전까지 타깃으로 하는 라이브러리 개발을 지원합니다. 하위 호환성에 대한 자세한 내용은 [호환성 옵션](kotlin-evolution-principles.md#compatibility-options)을 참고하세요.

### 리플렉션을 통한 어노테이션 접근 {id="access-to-annotations-via-reflection"}

[1.6.0에 처음 도입되었던](whatsnew16.md#repeatable-annotations-with-runtime-retention-for-1-8-jvm-target) [`KAnnotatedElement.findAnnotations()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.reflect.full/find-annotations.html) 확장 함수가 이제 [안정화(Stable)](components-stability.md)되었습니다. 이 [리플렉션](reflection.md) 함수는 개별적으로 적용된 어노테이션과 반복 적용된 어노테이션을 포함하여 특정 요소에 지정된 타입의 모든 어노테이션을 반환합니다.

```kotlin
@Repeatable
annotation class Tag(val name: String)

@Tag("First Tag")
@Tag("Second Tag")
fun taggedFunction() {
    println("I'm a tagged function!")
}

fun main() {
    val x = ::taggedFunction
    val foo = x as KAnnotatedElement
    println(foo.findAnnotations<Tag>()) // [@Tag(name=First Tag), @Tag(name=Second Tag)]
}
```

### 깊은 재귀 함수 안정화 {id="stable-deep-recursive-functions"}

깊은 재귀 함수(Deep recursive functions)는 [Kotlin 1.4.0](https://blog.jetbrains.com/kotlin/2020/07/kotlin-1-4-rc-debugging-coroutines/#Defining_deep_recursive_functions_using_coroutines)부터 실험적 기능으로 제공되었으며, Kotlin 1.7.0에서 [안정화(Stable)](components-stability.md)되었습니다. `DeepRecursiveFunction`을 사용하면 실제 콜 스택 대신 힙에 스택을 보관하는 함수를 정의할 수 있습니다. 이를 통해 매우 깊은 재귀 연산을 실행할 수 있습니다. 깊은 재귀 함수를 호출하려면 함수를 `invoke`하면 됩니다.

이 예제에서는 이진 트리의 깊이를 재귀적으로 계산하기 위해 깊은 재귀 함수를 사용합니다. 이 샘플 함수는 자기 자신을 재귀적으로 100,000번 호출하지만 `StackOverflowError`가 발생하지 않습니다.

```kotlin
class Tree(val left: Tree?, val right: Tree?)

val calculateDepth = DeepRecursiveFunction<Tree?, Int> { t ->
    if (t == null) 0 else maxOf(
        callRecursive(t.left),
        callRecursive(t.right)
    ) + 1
}

fun main() {
    // 깊이가 100_000인 트리 생성
    val deepTree = generateSequence(Tree(null, null)) { prev ->
        Tree(prev, null)
    }.take(100_000).last()

    println(calculateDepth(deepTree)) // 100000
}
```

재귀 깊이가 1,000회를 초과하는 코드에서는 깊은 재귀 함수를 사용하는 것을 고려해 보세요.

### 기본 시간 소스를 위한 인라인 클래스 기반 타임 마크 {id="time-marks-based-on-inline-classes-for-default-time-source"}

Kotlin 1.7.0에서는 `TimeSource.Monotonic`이 반환하는 타임 마크를 인라인 값 클래스로 변경하여 시간 측정 기능의 성능을 개선했습니다. 즉, `markNow()`, `elapsedNow()`, `measureTime()`, `measureTimedValue()`와 같은 함수를 호출할 때 `TimeMark` 인스턴스를 위한 래퍼 클래스가 할당되지 않습니다. 특히 핫 패스(hot path)의 일부인 코드 조각을 측정할 때 측정 작업이 성능에 미치는 영향을 최소화할 수 있습니다.

```kotlin
@OptIn(ExperimentalTime::class)
fun main() {
    val mark = TimeSource.Monotonic.markNow() // 반환되는 `TimeMark`는 인라인 클래스임
    val elapsedDuration = mark.elapsedNow()
}
```

> 이 최적화는 `TimeMark`를 가져온 시간 소스가 정적으로 `TimeSource.Monotonic`임이 알려진 경우에만 적용됩니다.
>
{style="note"}

### Java Optional을 위한 새로운 실험적 확장 함수 {id="new-experimental-extension-functions-for-java-optionals"}

Kotlin 1.7.0에는 Java의 `Optional` 클래스 작업을 간소화하는 새로운 편의 기능이 추가되었습니다. 이 새로운 함수들은 JVM에서 옵셔널 객체의 래핑을 해제하고 변환하는 데 사용할 수 있으며 Java API를 보다 간결하게 다룰 수 있도록 돕습니다.

`getOrNull()`, `getOrDefault()`, `getOrElse()` 확장 함수를 사용하면 `Optional`의 값이 존재할 때 그 값을 가져올 수 있습니다. 값이 없는 경우에는 각각 `null`, 기본값 또는 함수가 반환하는 값을 얻게 됩니다.

```kotlin
val presentOptional = Optional.of("I'm here!")

println(presentOptional.getOrNull())
// "I'm here!"

val absentOptional = Optional.empty<String>()

println(absentOptional.getOrNull())
// null
println(absentOptional.getOrDefault("Nobody here!"))
// "Nobody here!"
println(absentOptional.getOrElse {
    println("Optional was absent!")
    "Default value!"
})
// "Optional was absent!"
// "Default value!"
```

`toList()`, `toSet()`, `asSequence()` 확장 함수는 존재하는 `Optional`의 값을 리스트, 세트 또는 시퀀스로 변환하며, 값이 없으면 빈 컬렉션을 반환합니다. `toCollection()` 확장 함수는 이미 존재하는 대상 컬렉션에 `Optional` 값을 추가합니다.

```kotlin
val presentOptional = Optional.of("I'm here!")
val absentOptional = Optional.empty<String>()
println(presentOptional.toList() + "," + absentOptional.toList())
// ["I'm here!"], []
println(presentOptional.toSet() + "," + absentOptional.toSet())
// ["I'm here!"], []
val myCollection = mutableListOf<String>()
absentOptional.toCollection(myCollection)
println(myCollection)
// []
presentOptional.toCollection(myCollection)
println(myCollection)
// ["I'm here!"]
val list = listOf(presentOptional, absentOptional).flatMap { it.asSequence() }
println(list)
// ["I'm here!"]
```

이 확장 함수들은 Kotlin 1.7.0에서 실험적(Experimental) 기능으로 도입되었습니다. `Optional` 확장에 대한 자세한 내용은 [이 KEEP](https://github.com/Kotlin/KEEP/pull/291)에서 확인할 수 있습니다. 언제나 그렇듯이 [Kotlin 이슈 트래커](https://kotl.in/issue)를 통한 피드백을 환영합니다.

### JS 및 Native에서 명명된 캡처 그룹 지원 {id="support-for-named-capturing-groups-in-js-and-native"}

Kotlin 1.7.0부터 명명된 캡처 그룹(Named capturing groups)이 JVM뿐만 아니라 JS 및 Native 플랫폼에서도 지원됩니다.

캡처 그룹에 이름을 지정하려면 정규 표현식에서 `(?<name>group)` 구문을 사용하세요. 그룹과 매칭된 텍스트를 가져오려면 새로 도입된 [`MatchGroupCollection.get()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.text/get.html) 함수를 호출하고 그룹 이름을 전달합니다.

#### 이름을 통한 매칭된 그룹 값 조회 {id="retrieve-matched-group-value-by-name"}

도시 좌표를 매칭하는 다음 예제를 살펴보겠습니다. 정규 표현식으로 매칭된 그룹 컬렉션을 가져오려면 [`groups`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.text/-match-result/groups.html)를 사용합니다. `value`를 사용하여 그룹 번호(인덱스)로 조회하는 방법과 이름으로 조회하는 방법을 비교해 보세요.

```kotlin
fun main() {
    val regex = "\\b(?<city>[A-Za-z\\s]+),\\s(?<state>[A-Z]{2}):\\s(?<areaCode>[0-9]{3})\\b".toRegex()
    val input = "Coordinates: Austin, TX: 123"
    val match = regex.find(input)!!
    println(match.groups["city"]?.value) // "Austin" — 이름으로 조회
    println(match.groups[2]?.value) // "TX" — 번호로 조회
}
```

#### 명명된 역참조(Named backreferencing) {id="named-backreferencing"}

이제 그룹을 역참조(Backreferencing)할 때도 그룹 이름을 사용할 수 있습니다. 역참조는 이전에 캡처 그룹에 의해 매칭된 것과 동일한 텍스트를 매칭합니다. 이를 위해 정규 표현식에서 `\k<name>` 구문을 사용합니다.

```kotlin
fun backRef() {
    val regex = "(?<title>\\w+), yes \\k<title>".toRegex()
    val match = regex.find("Do you copy? Sir, yes Sir!")!!
    println(match.value) // "Sir, yes Sir"
    println(match.groups["title"]?.value) // "Sir"
}
```

#### 치환 표현식에서의 명명된 그룹 {id="named-groups-in-replacement-expressions"}

치환 표현식(Replacement expressions)에서 명명된 그룹 참조를 사용할 수 있습니다. 입력값에서 지정된 정규 표현식과 일치하는 모든 항목을 치환 표현식으로 바꾸는 [`replace()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.text/-regex/replace.html) 함수와, 첫 번째 매칭만 바꾸는 [`replaceFirst()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.text/-regex/replace-first.html) 함수를 확인해 보세요.

치환 문자열의 `${name}`은 지정된 이름을 가진 캡처 그룹에 해당하는 부분 시퀀스로 대체됩니다. 이름과 인덱스를 통한 그룹 참조 치환을 비교해 보세요.

```kotlin
fun dateReplace() {
    val dateRegex = Regex("(?<dd>\\d{2})-(?<mm>\\d{2})-(?<yyyy>\\d{4})")
    val input = "Date of birth: 27-04-2022"
    println(dateRegex.replace(input, "\${yyyy}-\${mm}-\${dd}")) // "Date of birth: 2022-04-27" — 이름 기준
    println(dateRegex.replace(input, "\$3-\$2-\$1")) // "Date of birth: 2022-04-27" — 번호 기준
}
```

## Gradle {id="gradle"}

이번 릴리스에서는 새로운 빌드 리포트, Gradle 플러그인 변형(Variant) 지원, kapt의 새로운 통계 등 다양한 기능이 도입되었습니다.

* [점진적 컴파일에 대한 새로운 접근 방식](#a-new-approach-to-incremental-compilation)
* [컴파일러 성능 추적을 위한 새로운 빌드 리포트](#build-reports-for-kotlin-compiler-tasks)
* [Gradle 및 Android Gradle 플러그인의 최소 지원 버전 변경](#bumping-minimum-supported-versions)
* [Gradle 플러그인 변형(Variant) 지원](#support-for-gradle-plugin-variants)
* [Kotlin Gradle 플러그인 API 업데이트](#updates-in-the-kotlin-gradle-plugin-api)
* [플러그인 API를 통한 sam-with-receiver 플러그인 지원](#the-sam-with-receiver-plugin-is-available-via-the-plugins-api)
* [컴파일 태스크의 변경 사항](#changes-in-compile-tasks)
* [kapt의 각 어노테이션 프로세서별 생성 파일 수 통계 추가](#statistics-of-generated-files-by-each-annotation-processor-in-kapt)
* [kotlin.compiler.execution.strategy 시스템 프로퍼티 지원 중단](#deprecation-of-the-kotlin-compiler-execution-strategy-system-property)
* [지원 중단된 옵션, 메서드 및 플러그인 제거](#removal-of-deprecated-options-methods-and-plugins)

### 점진적 컴파일에 대한 새로운 접근 방식 {id="a-new-approach-to-incremental-compilation"}

> 점진적 컴파일에 대한 새로운 접근 방식은 [실험적(Experimental)](components-stability.md) 기능입니다. 언제든지 변경되거나 삭제될 수 있습니다.
> 옵트인이 필요합니다(자세한 내용은 아래 참조). 평가 목적으로만 사용하는 것을 권장하며, [YouTrack](https://youtrack.jetbrains.com/issues/KT)을 통한 피드백을 환영합니다.
>
{style="warning"}

Kotlin 1.7.0에서는 모듈 간 변경 사항에 대한 점진적 컴파일을 전면 개편했습니다. 이제 의존하는 비-Kotlin 모듈 내부에서 변경 사항이 발생하더라도 점진적 컴파일이 지원되며, [Gradle 빌드 캐시](https://docs.gradle.org/current/userguide/build_cache.html)와도 호환됩니다. 또한 컴파일 회피(Compilation avoidance) 지원도 개선되었습니다.

빌드 캐시를 사용하거나 비-Kotlin Gradle 모듈을 자주 수정하는 경우 새로운 접근 방식을 통해 가장 큰 이점을 얻을 수 있을 것으로 기대합니다. Kotlin 프로젝트의 `kotlin-gradle-plugin` 모듈 테스트 결과, 캐시 적중(cache hit) 후 변경 사항에 대해 80% 이상의 성능 향상을 보였습니다.

이 새로운 방식을 사용해 보려면 `gradle.properties`에 다음 옵션을 설정하세요.

```none
kotlin.incremental.useClasspathSnapshot=true
```

> 점진적 컴파일에 대한 새로운 접근 방식은 현재 Gradle 빌드 시스템의 JVM 백엔드에서만 사용할 수 있습니다.
>
{style="note"}

새로운 점진적 컴파일 접근 방식이 내부적으로 어떻게 구현되었는지는 [이 블로그 포스트](https://blog.jetbrains.com/kotlin/2022/07/a-new-approach-to-incremental-compilation-in-kotlin/)에서 확인할 수 있습니다.

앞으로 이 기술을 안정화하고 다른 백엔드(예: JS) 및 빌드 시스템에 대한 지원을 추가할 계획입니다. 이 컴파일 구성표에서 발생하는 문제나 이상한 동작에 대해 [YouTrack](https://youtrack.jetbrains.com/issues/KT)으로 제보해 주시면 감사하겠습니다.

도움을 주신 [Ivan Gavrilovic](https://github.com/gavra0), [Hung Nguyen](https://github.com/hungvietnguyen), [Cédric Champeau](https://github.com/melix) 및 기타 외부 기여자분들께 진심으로 감사드립니다.

### 컴파일러 성능 추적을 위한 빌드 리포트 {id="build-reports-for-kotlin-compiler-tasks"}

> Kotlin 빌드 리포트는 [실험적(Experimental)](components-stability.md) 기능입니다. 언제든지 변경되거나 삭제될 수 있습니다.
> 옵트인이 필요합니다(자세한 내용은 아래 참조). 평가 목적으로만 사용하세요. [YouTrack](https://youtrack.jetbrains.com/issues/KT)을 통한 피드백을 환영합니다.
>
{style="warning"}

Kotlin 1.7.0에서는 컴파일러 성능을 추적하는 데 도움이 되는 빌드 리포트를 도입했습니다. 리포트에는 다양한 컴파일 단계의 소요 시간과 컴파일이 점진적으로 진행되지 못한 이유가 포함됩니다.

빌드 리포트는 다음과 같이 컴파일러 태스크와 관련된 문제를 조사할 때 유용합니다.

* Gradle 빌드 시간이 너무 오래 걸려 성능 저하의 근본 원인을 파악하고자 할 때.
* 동일한 프로젝트의 컴파일 시간이 어떨 때는 몇 초, 어떨 때는 몇 분이 걸리는 등 차이가 날 때.

빌드 리포트를 활성화하려면 `gradle.properties`에 빌드 리포트 출력을 저장할 위치를 선언하세요.

```none
kotlin.build.report.output=file
```

사용 가능한 값(및 그 조합)은 다음과 같습니다.

* `file`: 빌드 리포트를 로컬 파일에 저장합니다.
* `build_scan`: 빌드 리포트를 [Build Scan](https://scans.gradle.com/)의 `custom values` 섹션에 저장합니다.

  > Gradle Enterprise 플러그인은 커스텀 값의 개수와 길이를 제한합니다. 대규모 프로젝트에서는 일부 값이 누락될 수 있습니다.
  >
  {style="note"}

* `http`: HTTP(S)를 사용하여 빌드 리포트를 전송합니다. POST 메서드는 JSON 형식으로 지표를 전송합니다. 데이터 형식은 버전마다 변경될 수 있습니다. 전송되는 데이터의 현재 버전은 [Kotlin 저장소](https://github.com/JetBrains/kotlin/blob/master/libraries/tools/kotlin-gradle-plugin/src/common/kotlin/org/jetbrains/kotlin/gradle/report/data/GradleCompileStatisticsData.kt)에서 확인할 수 있습니다.

장시간 실행되는 컴파일에 대해 빌드 리포트를 분석하면 다음과 같은 두 가지 일반적인 문제를 해결하는 데 도움이 될 수 있습니다.

* 빌드가 점진적으로 진행되지 않은 경우: 이유를 분석하고 근본적인 문제를 해결합니다.
* 빌드는 점진적으로 진행되었으나 시간이 너무 오래 걸린 경우: 큰 파일을 분할하거나, 별도의 클래스를 다른 파일에 저장하거나, 대규모 클래스를 리팩터링하거나, 최상위(top-level) 함수를 다른 파일에 선언하는 등 소스 파일을 재구성해 봅니다.

새로운 빌드 리포트에 대한 자세한 내용은 [이 블로그 포스트](https://blog.jetbrains.com/kotlin/2022/06/introducing-kotlin-build-reports/)에서 확인할 수 있습니다.

인프라에 빌드 리포트를 적극적으로 도입해 보세요. 의견이 있거나 문제가 발생하거나 개선 사항을 제안하고 싶으시다면 언제든지 [이슈 트래커](https://youtrack.jetbrains.com/newIssue)에 제보해 주세요. 감사합니다!

### 최소 지원 버전 상향 {id="bumping-minimum-supported-versions"}

Kotlin 1.7.0부터 지원되는 최소 Gradle 버전은 6.7.1입니다. [Gradle 플러그인 변형(Variant)](#support-for-gradle-plugin-variants) 및 새로운 Gradle API를 지원하기 위해 [최소 버전을 상향](https://youtrack.jetbrains.com/issue/KT-49733/Bump-minimal-supported-Gradle-version-to-6-7-1)해야 했습니다. 향후에는 Gradle 플러그인 변형 기능 덕분에 최소 지원 버전을 자주 올리지 않아도 될 것입니다.

또한 최소 지원 Android Gradle 플러그인 버전은 이제 3.6.4입니다.

### Gradle 플러그인 변형(Variant) 지원 {id="support-for-gradle-plugin-variants"}

Gradle 7.0에서는 Gradle 플러그인 작성자를 위한 새로운 기능인 [변형을 가진 플러그인(plugins with variants)](https://docs.gradle.org/7.0/userguide/implementing_gradle_plugins.html#plugin-with-variants)을 도입했습니다. 이 기능을 사용하면 7.1 미만 버전의 Gradle과의 호환성을 유지하면서 새로운 Gradle 기능에 대한 지원을 더 쉽게 추가할 수 있습니다. 자세한 내용은 [Gradle의 변형 선택(variant selection in Gradle)](https://docs.gradle.org/current/userguide/variant_model.html)을 참고하세요.

Gradle 플러그인 변형을 통해 서로 다른 Gradle 버전에 맞춰 다양한 Kotlin Gradle 플러그인 변형을 제공할 수 있습니다. 목표는 지원되는 가장 오래된 Gradle 버전에 해당하는 `main` 변형에서 기본 Kotlin 컴파일을 지원하는 것입니다. 각 변형은 해당 릴리스의 Gradle 기능에 대한 구현을 갖추게 되며, 최신 변형은 가장 광범위한 Gradle 기능 세트를 지원합니다. 이러한 방식을 통해 제한된 기능을 갖춘 구형 Gradle 버전에 대한 지원을 확장할 수 있습니다.

현재 Kotlin Gradle 플러그인에는 두 가지 변형만 존재합니다.

* `main`: Gradle 버전 6.7.1–6.9.3용
* `gradle70`: Gradle 버전 7.0 이상용

향후 Kotlin 릴리스에서는 더 많은 변형이 추가될 수 있습니다.

빌드에서 어떤 변형을 사용하는지 확인하려면 [`--info` 로그 레벨](https://docs.gradle.org/current/userguide/logging.html#sec:choosing_a_log_level)을 활성화하고 출력에서 `Using Kotlin Gradle plugin`으로 시작하는 문자열(예: `Using Kotlin Gradle plugin main variant`)을 찾으세요.

> 다음은 Gradle의 변형 선택과 관련된 몇 가지 알려진 문제에 대한 해결 방법입니다.
> * [다중 변형이 있는 플러그인에 대해 pluginManagement의 ResolutionStrategy가 작동하지 않는 문제](https://github.com/gradle/gradle/issues/20545)
> * [플러그인이 `buildSrc` 공통 의존성으로 추가될 때 플러그인 변형이 무시되는 문제](https://github.com/gradle/gradle/issues/20847)
>
{style="note"}

피드백은 [이 YouTrack 티켓](https://youtrack.jetbrains.com/issue/KT-49227/Support-Gradle-plugins-variants)에 남겨주세요.

### Kotlin Gradle 플러그인 API 업데이트 {id="updates-in-the-kotlin-gradle-plugin-api"}

Kotlin Gradle 플러그인 API 아티팩트에 몇 가지 개선 사항이 적용되었습니다.

* 사용자가 입력을 구성할 수 있는 Kotlin/JVM 및 Kotlin/kapt 태스크용 새 인터페이스가 추가되었습니다.
* 모든 Kotlin 플러그인이 상속받는 새로운 `KotlinBasePlugin` 인터페이스가 추가되었습니다. Kotlin Gradle 플러그인(JVM, JS, Multiplatform, Native 및 기타 플랫폼)이 적용될 때마다 특정 구성 작업을 트리거하려는 경우 이 인터페이스를 사용하세요.

  ```kotlin
  project.plugins.withType<org.jetbrains.kotlin.gradle.plugin.KotlinBasePlugin>() {
      // 여기에 동작 구성
  }
  ```
  `KotlinBasePlugin`에 대한 피드백은 [이 YouTrack 티켓](https://youtrack.jetbrains.com/issue/KT-48008/Consider-offering-a-KotlinBasePlugin)에 남겨주실 수 있습니다.

* Android Gradle 플러그인이 자체적으로 Kotlin 컴파일을 구성할 수 있도록 기반을 마련했습니다. 즉, 빌드에 Kotlin Android Gradle 플러그인을 직접 추가할 필요가 없어집니다.
  추가 지원 내용에 대해 알아보고 사용해 보려면 [Android Gradle 플러그인 릴리스 공지](https://developer.android.com/studio/releases/gradle-plugin)를 확인해 보세요!

### 플러그인 API를 통한 sam-with-receiver 플러그인 지원 {id="the-sam-with-receiver-plugin-is-available-via-the-plugins-api"}

이제 [Gradle plugins DSL](https://docs.gradle.org/current/userguide/plugins.html#sec:plugins_block)을 통해 [sam-with-receiver 컴파일러 플러그인](sam-with-receiver-plugin.md)을 사용할 수 있습니다.

```kotlin
plugins {
    id("org.jetbrains.kotlin.plugin.sam.with.receiver") version "$kotlin_version"
}
```

### 컴파일 태스크의 변경 사항 {id="changes-in-compile-tasks"}

이번 릴리스에서는 컴파일 태스크에 많은 변경 사항이 적용되었습니다.

* Kotlin 컴파일 태스크는 더 이상 Gradle의 `AbstractCompile` 태스크를 상속하지 않고 `DefaultTask`만 상속합니다.
* `AbstractCompile` 태스크에는 `sourceCompatibility` 및 `targetCompatibility` 입력이 있었습니다. 더 이상 `AbstractCompile` 태스크를 상속하지 않으므로 사용자 스크립트에서 이러한 입력을 사용할 수 없습니다.
* `SourceTask.stableSources` 입력을 더 이상 사용할 수 없으므로 `sources` 입력을 사용해야 합니다. `setSource(...)` 메서드는 계속 사용할 수 있습니다.
* 모든 컴파일 태스크는 이제 컴파일에 필요한 라이브러리 목록에 `libraries` 입력을 사용합니다. `KotlinCompile` 태스크에는 지원 중단된 Kotlin 프로퍼티 `classpath`가 여전히 남아 있으나 향후 릴리스에서 제거될 예정입니다.
* 컴파일 태스크는 Kotlin 소스 필터링을 허용하는 `PatternFilterable` 인터페이스를 여전히 구현합니다. `sourceFilesExtensions` 입력은 제거되었으며 `PatternFilterable` 메서드를 대신 사용해야 합니다.
* 지원 중단된 `Gradle destinationDir: File` 출력이 `destinationDirectory: DirectoryProperty` 출력으로 대체되었습니다.
* Kotlin/Native `AbstractNativeCompile` 태스크는 이제 `AbstractKotlinCompileTool` 베이스 클래스를 상속합니다. 이는 Kotlin/Native 빌드 도구를 다른 모든 도구에 통합하기 위한 첫 단계입니다.

피드백은 [이 YouTrack 티켓](https://youtrack.jetbrains.com/issue/KT-32805)에 남겨주세요.

### kapt의 각 어노테이션 프로세서별 생성 파일 수 통계 추가 {id="statistics-of-generated-files-by-each-annotation-processor-in-kapt"}

`kotlin-kapt` Gradle 플러그인은 이미 [각 프로세서의 성능 통계를 보고](https://github.com/JetBrains/kotlin/pull/4280)하고 있습니다. Kotlin 1.7.0부터는 각 어노테이션 프로세서별로 생성된 파일 수에 대한 통계도 보고할 수 있습니다.

이는 빌드의 일부로서 사용되지 않는 어노테이션 프로세서가 있는지 추적하는 데 유용합니다. 생성된 리포트를 활용하여 불필요한 어노테이션 프로세서를 실행하는 모듈을 찾아 수정함으로써 이를 방지할 수 있습니다.

통계는 두 단계로 활성화할 수 있습니다.

* `build.gradle.kts`에서 `showProcessorStats` 플래그를 `true`로 설정합니다.

  ```kotlin
  kapt {
      showProcessorStats = true
  }
  ```

* `gradle.properties`에서 `kapt.verbose` Gradle 프로퍼티를 `true`로 설정합니다.
  
  ```none
  kapt.verbose=true
  ```

> [커맨드 라인 옵션 `verbose`](kapt.md#cli)를 사용해서도 상세 출력을 활성화할 수 있습니다.
>
{style="note"}

통계는 `info` 레벨 로그에 나타납니다. `Annotation processor stats:` 줄 뒤에 각 어노테이션 프로세서의 실행 시간에 대한 통계가 표시됩니다. 그 후 `Generated files report:` 줄 뒤에 각 어노테이션 프로세서별 생성 파일 수에 대한 통계가 표시됩니다. 예시:

```text
[INFO] Annotation processor stats:
[INFO] org.mapstruct.ap.MappingProcessor: total: 290 ms, init: 1 ms, 3 round(s): 289 ms, 0 ms, 0 ms
[INFO] Generated files report:
[INFO] org.mapstruct.ap.MappingProcessor: total sources: 2, sources per round: 2, 0, 0
```

피드백은 [이 YouTrack 티켓](https://youtrack.jetbrains.com/issue/KT-51132/KAPT-Support-reporting-the-number-of-generated-files-by-each-ann)에 남겨주세요.

### kotlin.compiler.execution.strategy 시스템 프로퍼티 지원 중단 {id="deprecation-of-the-kotlin-compiler-execution-strategy-system-property"}

Kotlin 1.6.20에서는 [Kotlin 컴파일러 실행 전략을 정의하기 위한 새로운 프로퍼티](whatsnew1620.md#properties-for-defining-kotlin-compiler-execution-strategy)가 도입되었습니다. Kotlin 1.7.0에서는 새로운 프로퍼티를 권장함에 따라 기존의 시스템 프로퍼티 `kotlin.compiler.execution.strategy`에 대한 지원 중단 주기가 시작되었습니다.

`kotlin.compiler.execution.strategy` 시스템 프로퍼티를 사용하면 경고가 표시됩니다. 이 프로퍼티는 향후 릴리스에서 삭제될 예정입니다. 이전 동작을 유지하려면 해당 시스템 프로퍼티를 동일한 이름의 Gradle 프로퍼티로 대체하세요. 예를 들어 `gradle.properties`에서 다음과 같이 설정할 수 있습니다.

```none
kotlin.compiler.execution.strategy=out-of-process
```

컴파일 태스크 프로퍼티인 `compilerExecutionStrategy`를 사용할 수도 있습니다. 자세한 내용은 [컴파일러 실행 전략 페이지](compiler-execution-strategy.md)를 참고하세요.

### 지원 중단된 옵션, 메서드 및 플러그인 제거 {id="removal-of-deprecated-options-methods-and-plugins"}

#### useExperimentalAnnotation 메서드 제거 {id="removal-of-the-useexperimentalannotation-method"}

Kotlin 1.7.0에서는 `useExperimentalAnnotation` Gradle 메서드에 대한 지원 중단 주기를 완료했습니다. 모듈에서 API 사용에 옵트인하려면 대신 `optIn()`을 사용하세요.

예를 들어 Gradle 모듈이 멀티플랫폼인 경우 다음과 같이 설정합니다.

```kotlin
sourceSets {
    all {
        languageSettings.optIn("org.mylibrary.OptInAnnotation")
    }
}
```

Kotlin의 [옵트인 요구 사항](opt-in-requirements.md)에 대해 자세히 알아보세요.

#### 지원 중단된 컴파일러 옵션 제거 {id="removal-of-deprecated-compiler-options"}

몇 가지 컴파일러 옵션에 대한 지원 중단 주기를 완료했습니다.

* `kotlinOptions.jdkHome` 컴파일러 옵션은 1.5.30에서 지원 중단되었으며 이번 릴리스에서 제거되었습니다. 이제 이 옵션이 포함된 Gradle 빌드는 실패합니다. Kotlin 1.5.30부터 지원되는 [Java 툴체인](whatsnew1530.md#support-for-java-toolchains)을 사용하는 것을 권장합니다.
* 지원 중단되었던 `noStdlib` 컴파일러 옵션도 제거되었습니다. Gradle 플러그인은 `kotlin.stdlib.default.dependency=true` 프로퍼티를 사용하여 Kotlin 표준 라이브러리의 존재 여부를 제어합니다.

> 컴파일러 인자 `-jdkHome` 및 `-no-stdlib`는 계속 사용할 수 있습니다.
>
{style="note"}

#### 지원 중단된 플러그인 제거 {id="removal-of-deprecated-plugins"}

Kotlin 1.4.0에서 지원 중단되었던 `kotlin2js` 및 `kotlin-dce-plugin` 플러그인이 이번 릴리스에서 제거되었습니다. `kotlin2js` 대신 새로운 `org.jetbrains.kotlin.js` 플러그인을 사용하세요. 데드 코드 제거(DCE)는 Kotlin/JS Gradle 플러그인이 올바르게 구성되어 있으면 정상적으로 작동합니다.

Kotlin 1.6.0에서는 컴파일러 플러그인을 작성할 때 개발자들이 사용하던 `KotlinGradleSubplugin` 클래스의 지원 중단 레벨을 `ERROR`로 변경했습니다. 이번 릴리스에서 [이 클래스는 완전히 제거되었습니다](https://youtrack.jetbrains.com/issue/KT-48831/). 대신 `KotlinCompilerPluginSupportPlugin` 클래스를 사용하세요.

> 프로젝트 전체에서 1.7.0 이상의 Kotlin 플러그인 버전을 사용하는 것이 가장 좋습니다.
>
{style="tip"}

#### 지원 중단된 코루틴 DSL 옵션 및 프로퍼티 제거 {id="removal-of-the-deprecated-coroutines-dsl-option-and-property"}

`gradle.properties`에서 사용되던 지원 중단된 `kotlin.experimental.coroutines` Gradle DSL 옵션과 `kotlin.coroutines` 프로퍼티를 제거했습니다. 이제 _[중단 함수(Suspending functions)](coroutines-basics.md)_를 직접 사용하거나 빌드 스크립트에 [`kotlinx.coroutines` 의존성을 추가](gradle-configure-project.md#set-a-dependency-on-a-kotlinx-library)하기만 하면 됩니다.

코루틴에 대한 자세한 내용은 [코루틴 가이드](coroutines-guide.md)를 참고하세요.

#### 툴체인 확장 메서드에서의 타입 캐스팅 제거 {id="removal-of-the-type-cast-in-the-toolchain-extension-method"}

Kotlin 1.7.0 이전에는 Kotlin DSL로 Gradle 툴체인을 구성할 때 `JavaToolchainSpec` 클래스로 타입 캐스팅을 수행해야 했습니다.

```kotlin
kotlin {
    jvmToolchain {
        (this as JavaToolchainSpec).languageVersion.set(JavaLanguageVersion.of(<MAJOR_JDK_VERSION>)
    }
}
```

이제 `(this as JavaToolchainSpec)` 부분을 생략할 수 있습니다.

```kotlin
kotlin {
    jvmToolchain {
        languageVersion.set(JavaLanguageVersion.of(<MAJOR_JDK_VERSION>)
    }
}
```

## Kotlin 1.7.0으로 마이그레이션 {id="migrating-to-kotlin-1-7-0"}

### Kotlin 1.7.0 설치 {id="install-kotlin-1-7-0"}

IntelliJ IDEA 2022.1 및 Android Studio Chipmunk (212)는 Kotlin 플러그인을 1.7.0으로 업데이트하도록 자동으로 제안합니다.

> IntelliJ IDEA 2022.2, Android Studio Dolphin (213) 또는 Android Studio Electric Eel (221)의 경우, 향후 제공될 IntelliJ IDEA 및 Android Studio 업데이트와 함께 Kotlin 플러그인 1.7.0이 제공될 예정입니다.
> 
{style="note"}

새로운 커맨드 라인 컴파일러는 [GitHub 릴리스 페이지](https://github.com/JetBrains/kotlin/releases/tag/v1.7.0)에서 다운로드할 수 있습니다.

### 기존 프로젝트 마이그레이션 또는 Kotlin 1.7.0으로 새 프로젝트 시작 {id="migrate-existing-or-start-a-new-project-with-kotlin-1-7-0"}

* 기존 프로젝트를 Kotlin 1.7.0으로 마이그레이션하려면 Kotlin 버전을 `1.7.0`으로 변경하고 Gradle 또는 Maven 프로젝트를 다시 가져옵니다(Reimport). [Kotlin 1.7.0으로 업데이트하는 방법 알아보기](releases.md#update-to-a-new-kotlin-version).

* Kotlin 1.7.0으로 새 프로젝트를 시작하려면 Kotlin 플러그인을 업데이트하고 **File** | **New** | **Project**에서 프로젝트 마법사를 실행하세요.

### Kotlin 1.7.0 호환성 가이드 {id="compatibility-guide-for-kotlin-1-7-0"}

Kotlin 1.7.0은 기능 릴리스(Feature release)이므로 이전 버전의 언어로 작성된 코드와 호환되지 않는 변경 사항이 포함될 수 있습니다.
이러한 변경 사항에 대한 자세한 목록은 [Kotlin 1.7.0 호환성 가이드](compatibility-guide-17.md)에서 확인하세요.