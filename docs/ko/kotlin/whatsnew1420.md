[//]: # (title: Kotlin 1.4.20의 새로운 기능)

<web-summary>새로운 언어 기능, Kotlin Multiplatform, JVM, Native, JS 업데이트 및 Gradle과 Maven에 대한 빌드 도구 지원을 포함한 Kotlin 1.4.20 릴리스 노트를 읽어보세요.</web-summary>

_[출시일: 2020년 11월 23일](releases.md#release-history)_

Kotlin 1.4.20은 여러 새로운 실험적 기능을 제공하며, 1.4.0에서 추가된 기능을 포함하여 기존 기능에 대한 수정 및 개선 사항을 제공합니다.

[이 블로그 포스트](https://blog.jetbrains.com/kotlin/2020/11/kotlin-1-4-20-released/)에서 더 많은 예제와 함께 새로운 기능에 대해 알아볼 수 있습니다.

> Kotlin 릴리스 주기에 대한 정보는 [Kotlin 릴리스 프로세스](releases.md)를 참조하세요.
>
{style="tip"}

## Kotlin/JVM

Kotlin/JVM의 개선 사항은 최신 Java 버전의 기능에 발맞추는 것을 목표로 합니다.

- [Java 15 타겟](#java-15-target)
- [invokedynamic 문자열 결합](#invokedynamic-string-concatenation)

### Java 15 타겟

이제 Java 15를 Kotlin/JVM 타겟으로 사용할 수 있습니다.

### invokedynamic 문자열 결합

> `invokedynamic` 문자열 결합(string concatenation)은 [실험적(Experimental)](components-stability.md) 기능입니다. 언제든지 삭제되거나 변경될 수 있습니다. 옵트인(Opt-in)이 필요합니다(아래 세부 사항 참조). 평가 목적으로만 사용하세요. [YouTrack](https://youtrack.jetbrains.com/issues/KT)에서 이에 대한 여러분의 피드백을 기다리고 있습니다.
>
{style="warning"}

Kotlin 1.4.20은 JVM 9+ 타겟에서 문자열 결합을 [동적 호출(dynamic invocations)](https://docs.oracle.com/javase/7/docs/technotes/guides/vm/multiple-language-support.html#invokedynamic)로 컴파일할 수 있어 성능이 향상되었습니다.

현재 이 기능은 실험적이며 다음 사례들을 다룹니다:
- 연산자(`a + b`), 명시적 호출(`a.plus(b)`), 참조(`(a::plus)(b)`) 형태의 `String.plus`.
- 인라인 클래스 및 데이터 클래스의 `toString`.
- 상수가 아닌 단일 인수를 가진 템플릿을 제외한 문자열 템플릿([KT-42457](https://youtrack.jetbrains.com/issue/KT-42457) 참조).

`invokedynamic` 문자열 결합을 활성화하려면 다음 값 중 하나를 사용하여 `-Xstring-concat` 컴파일러 옵션을 추가하세요:
- `indy-with-constants`: [StringConcatFactory.makeConcatWithConstants()](https://docs.oracle.com/javase/9/docs/api/java/lang/invoke/StringConcatFactory.html#makeConcatWithConstants-java.lang.invoke.MethodHandles.Lookup-java.lang.String-java.lang.invoke.MethodType-java.lang.String-java.lang.Object...-)를 사용하여 문자열에 대해 `invokedynamic` 결합을 수행합니다.
- `indy`: [StringConcatFactory.makeConcat()](https://docs.oracle.com/javase/9/docs/api/java/lang/invoke/StringConcatFactory.html#makeConcat-java.lang.invoke.MethodHandles.Lookup-java.lang.String-java.lang.invoke.MethodType-)를 사용하여 문자열에 대해 `invokedynamic` 결합을 수행합니다.
- `inline`: `StringBuilder.append()`를 통한 클래식 결합 방식으로 되돌립니다.

## Kotlin/JS

Kotlin/JS는 계속해서 빠르게 발전하고 있으며, 1.4.20에서는 다음과 같은 여러 실험적 기능과 개선 사항을 확인할 수 있습니다:

- [Gradle DSL 변경 사항](#gradle-dsl-changes)
- [새로운 위저드 템플릿](#new-wizard-templates)
- [IR 컴파일러를 사용한 컴파일 오류 무시](#ignoring-compilation-errors-with-ir-compiler)

### Gradle DSL 변경 사항

Kotlin/JS용 Gradle DSL에 프로젝트 설정 및 커스터마이징을 간소화하는 여러 업데이트가 적용되었습니다. 여기에는 webpack 구성 조정, 자동 생성된 `package.json` 파일 수정, 전이 의존성(transitive dependencies)에 대한 개선된 제어가 포함됩니다.

#### webpack 구성을 위한 단일 설정 지점

브라우저 타겟을 위한 새로운 구성 블록인 `commonWebpackConfig`를 사용할 수 있습니다. 이 블록 내에서 `webpackTask`, `runTask`, `testTask`에 대해 구성을 중복할 필요 없이 단일 지점에서 공통 설정을 조정할 수 있습니다.

세 가지 작업 모두에 대해 기본적으로 CSS 지원을 활성화하려면 프로젝트의 `build.gradle(.kts)`에 다음 스니펫을 추가하세요:

```groovy
browser {
    commonWebpackConfig {
        cssSupport.enabled = true
    }
    binaries.executable()
}
```

[webpack 번들링 구성](js-project-setup.md#webpack-bundling)에 대해 더 알아보세요.

#### Gradle에서 package.json 커스터마이징

Kotlin/JS 패키지 관리 및 배포를 더 세밀하게 제어하기 위해 이제 Gradle DSL을 통해 프로젝트 파일인 [`package.json`](https://nodejs.dev/learn/the-package-json-guide)에 속성을 추가할 수 있습니다.

`package.json`에 커스텀 필드를 추가하려면 컴파일의 `packageJson` 블록에서 `customField` 함수를 사용하세요:

```kotlin
kotlin {
    js(BOTH) {
        compilations["main"].packageJson {
            customField("hello", mapOf("one" to 1, "two" to 2))
        }
    }
}
```

[`package.json` 커스터마이징](js-project-setup.md#package-json-customization)에 대해 더 알아보세요.

#### 선택적 yarn 의존성 해결

> 선택적 yarn 의존성 해결(selective yarn dependency resolutions) 지원은 [실험적(Experimental)](components-stability.md) 기능입니다. 언제든지 삭제되거나 변경될 수 있습니다. 평가 목적으로만 사용하세요. [YouTrack](https://youtrack.jetbrains.com/issues/KT)에서 이에 대한 여러분의 피드백을 기다리고 있습니다.
>
{style="warning"}

Kotlin 1.4.20은 의존하는 패키지의 의존성을 재정의하는 메커니즘인 Yarn의 [선택적 의존성 해결(selective dependency resolutions)](https://classic.yarnpkg.com/en/docs/selective-version-resolutions/)을 구성하는 방법을 제공합니다.

Gradle의 `YarnPlugin` 내에 있는 `YarnRootExtension`을 통해 이를 사용할 수 있습니다. 프로젝트의 패키지 해결 버전에 영향을 주려면 패키지 이름 셀렉터(Yarn에서 지정한 방식)와 해결할 버전을 전달하여 `resolution` 함수를 사용하세요.

```kotlin
rootProject.plugins.withType<YarnPlugin> {
    rootProject.the<YarnRootExtension>().apply {
        resolution("react", "16.0.0")
        resolution("processor/decamelize", "3.0.0")
    }
}
```

이렇게 하면 `react`를 필요로 하는 _모든_ npm 의존성은 `16.0.0` 버전을 받게 되며, `processor`는 그 의존성인 `decamelize`를 `3.0.0` 버전으로 받게 됩니다.

#### 세분화된 워크스페이스 비활성화

> 세분화된 워크스페이스(granular workspaces) 비활성화는 [실험적(Experimental)](components-stability.md) 기능입니다. 언제든지 삭제되거나 변경될 수 있습니다. 평가 목적으로만 사용하세요. [YouTrack](https://youtrack.jetbrains.com/issues/KT)에서 이에 대한 여러분의 피드백을 기다리고 있습니다.
>
{style="warning"}

빌드 시간을 단축하기 위해 Kotlin/JS Gradle 플러그인은 특정 Gradle 작업에 필요한 의존성만 설치합니다. 예를 들어, `webpack-dev-server` 패키지는 `*Run` 작업 중 하나를 실행할 때만 설치되고 assemble 작업을 실행할 때는 설치되지 않습니다. 이러한 동작은 여러 Gradle 프로세스를 병렬로 실행할 때 잠재적으로 문제를 일으킬 수 있습니다. 의존성 요구 사항이 충돌하면 npm 패키지의 두 설치 과정이 오류를 유발할 수 있습니다.

이 문제를 해결하기 위해 Kotlin 1.4.20에는 소위 _세분화된 워크스페이스(granular workspaces)_를 비활성화하는 옵션이 포함되었습니다. 이 기능은 현재 Gradle의 `YarnPlugin` 내에 있는 `YarnRootExtension`을 통해 사용할 수 있습니다. 이를 사용하려면 `build.gradle.kts` 파일에 다음 스니펫을 추가하세요:

```kotlin
rootProject.plugins.withType<YarnPlugin> {
    rootProject.the<YarnRootExtension>().disableGranularWorkspaces()
}
```

### 새로운 위저드 템플릿

프로젝트 생성 시 더 편리하게 커스터마이징할 수 있도록 Kotlin용 프로젝트 위저드에 Kotlin/JS 애플리케이션을 위한 새로운 템플릿이 추가되었습니다:
- **Browser Application** - 브라우저에서 실행되는 최소한의 Kotlin/JS Gradle 프로젝트입니다.
- **React Application** - 적절한 `kotlin-wrappers`를 사용하는 React 앱입니다. 스타일 시트, 네비게이션 컴포넌트 또는 상태 컨테이너에 대한 통합을 활성화하는 옵션을 제공합니다.
- **Node.js Application** - Node.js 런타임에서 실행하기 위한 최소한의 프로젝트입니다. 실험적인 `kotlinx-nodejs` 패키지를 직접 포함하는 옵션이 함께 제공됩니다.

### IR 컴파일러를 사용한 컴파일 오류 무시

> _컴파일 오류 무시_ 모드는 [실험적(Experimental)](components-stability.md) 기능입니다. 언제든지 삭제되거나 변경될 수 있습니다. 옵트인(Opt-in)이 필요합니다(아래 세부 사항 참조). 평가 목적으로만 사용하세요. [YouTrack](https://youtrack.jetbrains.com/issues/KT)에서 이에 대한 여러분의 피드백을 기다리고 있습니다.
>
{style="warning"}

Kotlin/JS용 [IR 컴파일러](js-ir-compiler.md)에 새로운 실험적 모드인 _오류와 함께 컴파일(compilation with errors)_이 도입되었습니다. 이 모드에서는 코드가 오류를 포함하고 있더라도 코드를 실행할 수 있습니다. 예를 들어, 전체 애플리케이션이 아직 준비되지 않았을 때 특정 기능을 테스트하고 싶은 경우 유용합니다.

이 모드에는 두 가지 허용 정책(tolerance policies)이 있습니다:
- `SEMANTIC`: 컴파일러가 구문적으로는 정확하지만 `val x: String = 3`과 같이 의미적으로는 말이 되지 않는 코드를 허용합니다.

- `SYNTAX`: 컴파일러가 구문 오류가 포함된 코드일지라도 모든 코드를 허용합니다.

오류와 함께 컴파일을 허용하려면 위에 나열된 값 중 하나와 함께 `-Xerror-tolerance-policy=` 컴파일러 옵션을 추가하세요.

[Kotlin/JS IR 컴파일러에 대해 더 알아보기](js-ir-compiler.md).

## Kotlin/Native

1.4.20에서 Kotlin/Native의 우선순위는 성능과 기존 기능의 다듬기입니다. 주요 개선 사항은 다음과 같습니다:
  
- [탈출 분석](#escape-analysis)
- [성능 개선 및 버그 수정](#performance-improvements-and-bug-fixes)
- [Objective-C 예외 래핑 옵트인](#opt-in-wrapping-of-objective-c-exceptions)
- [CocoaPods 플러그인 개선 사항](#cocoapods-plugin-improvements)
- [Xcode 12 라이브러리 지원](#support-for-xcode-12-libraries)

### 탈출 분석

> 탈출 분석(escape analysis) 메커니즘은 [실험적(Experimental)](components-stability.md) 기능입니다. 언제든지 삭제되거나 변경될 수 있습니다. 평가 목적으로만 사용하세요. [YouTrack](https://youtrack.jetbrains.com/issues/KT)에서 이에 대한 여러분의 피드백을 기다리고 있습니다.
>
{style="warning"}

Kotlin/Native에 새로운 [탈출 분석(escape analysis)](https://en.wikipedia.org/wiki/Escape_analysis) 메커니즘의 프로토타입이 도입되었습니다. 이는 특정 객체를 힙(heap) 대신 스택(stack)에 할당하여 런타임 성능을 향상시킵니다. 이 메커니즘은 벤치마크에서 평균 10%의 성능 향상을 보여주었으며, 프로그램을 더욱 가속화할 수 있도록 지속적으로 개선하고 있습니다.

탈출 분석은 릴리스 빌드(`-opt` 컴파일러 옵션 사용 시)의 별도 컴파일 단계에서 실행됩니다.

탈출 분석 단계를 비활성화하려면 `-Xdisable-phases=EscapeAnalysis` 컴파일러 옵션을 사용하세요.

### 성능 개선 및 버그 수정

Kotlin/Native는 1.4.0에서 추가된 [코드 공유 메커니즘](https://kotlinlang.org/docs/multiplatform/multiplatform-share-on-platforms.html#share-code-on-similar-platforms)을 포함하여 다양한 구성 요소에서 성능 개선 및 버그 수정을 진행했습니다.

### Objective-C 예외 래핑 옵트인

> Objective-C 예외 래핑(wrapping) 메커니즘은 [실험적(Experimental)](components-stability.md) 기능입니다. 언제든지 삭제되거나 변경될 수 있습니다. 옵트인(Opt-in)이 필요합니다(아래 세부 사항 참조). 평가 목적으로만 사용하세요. [YouTrack](https://youtrack.jetbrains.com/issues/KT)에서 이에 대한 여러분의 피드백을 기다리고 있습니다.
>
{style="warning"}

이제 Kotlin/Native는 프로그램 충돌을 방지하기 위해 런타임 중에 Objective-C 코드에서 발생한 예외를 처리할 수 있습니다.

`NSException`을 `ForeignException` 유형의 Kotlin 예외로 래핑하도록 옵트인할 수 있습니다. 이들은 원본 `NSException`에 대한 참조를 유지합니다. 이를 통해 근본 원인에 대한 정보를 얻고 적절하게 처리할 수 있습니다.

Objective-C 예외 래핑을 활성화하려면 `cinterop` 호출 시 `-Xforeign-exception-mode objc-wrap` 옵션을 지정하거나 `.def` 파일에 `foreignExceptionMode = objc-wrap` 속성을 추가하세요. [CocoaPods 통합](https://kotlinlang.org/docs/multiplatform/multiplatform-cocoapods-overview.html)을 사용하는 경우, 다음과 같이 의존성의 `pod {}` 빌드 스크립트 블록에서 옵션을 지정하세요:

```kotlin
pod("foo") {
    extraOpts = listOf("-Xforeign-exception-mode", "objc-wrap")
}
```

기본 동작은 변경되지 않았습니다. Objective-C 코드에서 예외가 발생하면 프로그램이 종료됩니다.

### CocoaPods 플러그인 개선 사항

Kotlin 1.4.20은 CocoaPods 통합에서 일련의 개선 사항을 이어갑니다. 즉, 다음과 같은 새로운 기능을 사용해 볼 수 있습니다:

- [개선된 작업 실행](#improved-task-execution)
- [확장된 DSL](#extended-dsl)
- [Xcode와의 업데이트된 통합](#updated-integration-with-xcode)

#### 개선된 작업 실행

CocoaPods 플러그인의 작업 실행 흐름이 개선되었습니다. 예를 들어, 새 CocoaPods 의존성을 추가해도 기존 의존성은 다시 빌드되지 않습니다. 추가 타겟을 추가하는 것도 기존 타겟의 의존성 재빌드에 영향을 주지 않습니다.

#### 확장된 DSL

Kotlin 프로젝트에 [CocoaPods](https://kotlinlang.org/docs/multiplatform/multiplatform-cocoapods-overview.html) 의존성을 추가하는 DSL에 새로운 기능이 추가되었습니다.

로컬 Pod 및 CocoaPods 저장소의 Pod 외에도 다음 유형의 라이브러리에 대한 의존성을 추가할 수 있습니다:
* 커스텀 spec 저장소의 라이브러리.
* Git 저장소의 원격 라이브러리.
* 아카이브 형태의 라이브러리(임의의 HTTP 주소로도 가능).
* 정적 라이브러리.
* 커스텀 cinterop 옵션이 있는 라이브러리.

Kotlin 프로젝트에서 [CocoaPods 의존성 추가](https://kotlinlang.org/docs/multiplatform/multiplatform-cocoapods-libraries.html)에 대해 더 알아보세요. [Kotlin with CocoaPods 샘플](https://github.com/Kotlin/kmm-with-cocoapods-sample)에서 예제를 찾을 수 있습니다.

#### Xcode와의 업데이트된 통합

Xcode와 올바르게 작동하려면 Kotlin에 몇 가지 Podfile 변경이 필요합니다:

* Kotlin Pod에 Git, HTTP 또는 specRepo Pod 의존성이 있는 경우, Podfile에도 이를 지정해야 합니다.
* 커스텀 spec에서 라이브러리를 추가할 때는 Podfile의 시작 부분에 spec의 [위치(location)](https://guides.cocoapods.org/syntax/podfile.html#source)도 지정해야 합니다.

이제 통합 오류가 IDEA에서 자세한 설명과 함께 표시됩니다. 따라서 Podfile에 문제가 있는 경우 즉시 수정 방법을 알 수 있습니다.

[Kotlin pod 생성](https://kotlinlang.org/docs/multiplatform/multiplatform-cocoapods-xcode.html)에 대해 더 알아보세요.

### Xcode 12 라이브러리 지원
    
Xcode 12와 함께 제공되는 새로운 라이브러리에 대한 지원을 추가했습니다. 이제 Kotlin 코드에서 이를 사용할 수 있습니다.

## Kotlin Multiplatform

### 멀티플랫폼 라이브러리 배포 구조 업데이트

Kotlin 1.4.20부터는 더 이상 별도의 메타데이터 배포가 존재하지 않습니다. 메타데이터 아티팩트는 이제 전체 라이브러리를 나타내는 _루트(root)_ 배포에 포함되며, 공통 소스 세트에 의존성으로 추가될 때 적절한 플랫폼별 아티팩트로 자동 해결됩니다.

[멀티플랫폼 라이브러리 배포](https://kotlinlang.org/docs/multiplatform/multiplatform-publish-lib-setup.html)에 대해 더 알아보세요.

#### 이전 버전과의 호환성

이 구조 변경은 [계층적 프로젝트 구조(hierarchical project structure)](https://kotlinlang.org/docs/multiplatform/multiplatform-share-on-platforms.html#share-code-on-similar-platforms)를 가진 프로젝트 간의 호환성을 깨뜨립니다. 멀티플랫폼 프로젝트와 그 프로젝트가 의존하는 라이브러리가 모두 계층적 프로젝트 구조를 가지고 있다면, 동시에 Kotlin 1.4.20 이상으로 업데이트해야 합니다. Kotlin 1.4.20으로 배포된 라이브러리는 이전 버전으로 배포된 프로젝트에서 사용할 수 없습니다.

계층적 프로젝트 구조가 없는 프로젝트와 라이브러리는 호환성이 유지됩니다.

## 표준 라이브러리

Kotlin 1.4.20의 표준 라이브러리는 파일 작업을 위한 새로운 확장 기능과 더 나은 성능을 제공합니다.

- [java.nio.file.Path를 위한 확장](#extensions-for-java-nio-file-path)
- [String.replace 함수 성능 개선](#improved-string-replace-function-performance)

### java.nio.file.Path를 위한 확장

> `java.nio.file.Path`를 위한 확장은 [실험적(Experimental)](components-stability.md) 기능입니다. 언제든지 삭제되거나 변경될 수 있습니다. 옵트인(Opt-in)이 필요합니다(아래 세부 사항 참조). 평가 목적으로만 사용하세요. [YouTrack](https://youtrack.jetbrains.com/issues/KT)에서 이에 대한 여러분의 피드백을 기다리고 있습니다.
>
{style="warning"}

이제 표준 라이브러리는 `java.nio.file.Path`를 위한 실험적 확장 기능을 제공합니다. 관용적인 Kotlin 방식으로 현대적인 JVM 파일 API를 사용하는 것이 이제 `kotlin.io` 패키지의 `java.io.File` 확장 기능을 사용하는 것과 유사해졌습니다.

```kotlin
// div (/) 연산자로 경로 생성
val baseDir = Path("/base")
val subDir = baseDir / "subdirectory" 

// 디렉토리의 파일 나열
val kotlinFiles: `List<Path>` = Path("/home/user").listDirectoryEntries("*.kt")
```

이 확장 기능은 `kotlin-stdlib-jdk7` 모듈의 `kotlin.io.path` 패키지에서 사용할 수 있습니다. 이 확장을 사용하려면 실험적 어노테이션인 `@ExperimentalPathApi`에 [옵트인](opt-in-requirements.md)하세요.

### String.replace 함수 성능 개선

`String.replace()`의 새로운 구현은 함수 실행 속도를 높여줍니다. 대소문자를 구분하는 변형은 `indexOf` 기반의 수동 교체 루프를 사용하는 반면, 대소문자를 구분하지 않는 변형은 정규식 매칭을 사용합니다.

## Kotlin Android Extensions

1.4.20에서 Kotlin Android Extensions 플러그인은 지원이 중단(deprecated)되며, `Parcelable` 구현 생성기는 별도의 플러그인으로 이동합니다.

- [Synthetics 뷰 지원 중단](#deprecation-of-synthetic-views)
- [Parcelable 구현 생성기를 위한 새로운 플러그인](#new-plugin-for-parcelable-implementation-generator)

### Synthetics 뷰 지원 중단

_Synthetics 뷰(synthetic views)_는 UI 요소와의 상호작용을 단순화하고 상용구 코드를 줄이기 위해 얼마 전 Kotlin Android Extensions 플러그인에서 도입되었습니다. 이제 Google은 동일한 기능을 수행하는 네이티브 메커니즘인 Android Jetpack의 [뷰 바인딩(view bindings)](https://developer.android.com/topic/libraries/view-binding)을 제공하며, 저희는 이를 위해 Synthetics 뷰의 지원을 중단하고 있습니다.

저희는 `kotlin-android-extensions`에서 Parcelable 구현 생성기를 분리하고 나머지 부분인 Synthetics 뷰에 대한 지원 중단 주기를 시작합니다. 현재로서는 지원 중단 경고와 함께 계속 작동할 것입니다. 향후에는 프로젝트를 다른 솔루션으로 전환해야 합니다. Android 프로젝트를 Synthetics에서 뷰 바인딩으로 마이그레이션하는 데 도움이 되는 [가이드라인](https://goo.gle/kotlin-android-extensions-deprecation)이 준비되어 있습니다.

### Parcelable 구현 생성기를 위한 새로운 플러그인

`Parcelable` 구현 생성기는 이제 새로운 `kotlin-parcelize` 플러그인에서 사용할 수 있습니다. `kotlin-android-extensions` 대신 이 플러그인을 적용하세요.

>`kotlin-parcelize`와 `kotlin-android-extensions`는 한 모듈에서 함께 적용할 수 없습니다.
>
{style="note"}

`@Parcelize` 어노테이션은 `kotlinx.parcelize` 패키지로 이동되었습니다.

[Android 문서](https://developer.android.com/kotlin/parcelize)에서 `Parcelable` 구현 생성기에 대해 더 알아보세요.