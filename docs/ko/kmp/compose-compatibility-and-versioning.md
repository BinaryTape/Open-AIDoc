[//]: # (title: 호환성 및 버전)

Compose Multiplatform 릴리스는 Kotlin 및 Jetpack Compose 릴리스와 별개로 출시됩니다. 이 페이지에는 Compose Multiplatform 릴리스, Compose 릴리스 주기 및 컴포넌트 호환성에 대한 정보가 포함되어 있습니다.
지원되는 IDE 버전에 대한 자세한 내용은 [권장 IDE 및 코드 에디터](recommended-ides.md)를 참고하세요.

Compose Multiplatform은 Kotlin Multiplatform을 기반으로 구축되었으므로, [Kotlin Multiplatform 호환성 가이드](multiplatform-compatibility-guide.md)에 나열된 Kotlin Multiplatform Gradle 플러그인, Gradle, Android Gradle 플러그인(Android Gradle Plugin) 및 Xcode와의 버전 호환성 영향도 받습니다.

## 지원되는 플랫폼 {id="supported-platforms"}

Compose Multiplatform %org.jetbrains.compose%은 다음 플랫폼을 지원합니다:

| 플랫폼 | 최소 버전 |
|----------|------------------------------------------------------------------------------------------------------|
| Android | Android 5.0 (API 레벨 21) |
| iOS | iOS 14 |
| macOS | macOS 13 arm64 |
| Windows | Windows 10 (x86-64, arm64) |
| Linux | Ubuntu 20.04 (x86-64, arm64) |
| 웹 | [WasmGC 지원](https://kotlinlang.org/docs/wasm-configuration.html#browser-versions) 브라우저 |

> 모든 Compose Multiplatform 릴리스는 64비트 플랫폼만 지원합니다. 
> 
{style="note"}

## Kotlin 호환성 {id="kotlin-compatibility"}

최신 Compose Multiplatform은 항상 최신 버전의 Kotlin과 호환됩니다.
버전을 수동으로 맞출 필요가 없습니다.
두 제품 중 하나의 EAP 버전을 사용하는 것은 여전히 잠재적으로 불안정할 수 있음을 유의하세요.

Compose Multiplatform은 Kotlin Multiplatform 플러그인과 동일한 버전의 Compose 컴파일러(Compose Compiler) Gradle 플러그인을 적용해야 합니다.
자세한 내용은 [여기](compose-compiler.md#migrating-a-compose-multiplatform-project)를 참고하세요.

Compose Multiplatform 1.8.0부터 UI 프레임워크는 K2 컴파일러로 완전히 전환되었습니다.
최신 Compose Multiplatform 릴리스를 사용하려면 다음 사항을 준수해야 합니다:

 * 프로젝트에 최소 Kotlin 2.1.0 이상을 사용하세요.
 * 최소 Kotlin 2.1.0으로 컴파일된 Compose Multiplatform 기반 라이브러리에만 의존하세요.
 * iOS 및 웹과 같이 지원 환경이 빠르게 진화하는 플랫폼을 타겟팅하는 프로젝트의 경우 Kotlin **2.2.20**으로 업그레이드하세요.
 
모든 종속성이 업데이트될 때까지 하위 호환성 문제에 대한 해결책으로 Gradle 빌드 파일에서 [`disableNativeCache`](multiplatform-dsl-reference.md#binaries) DSL을 사용하여 Gradle 캐시를 끌 수 있습니다.
이는 이전 라이브러리와의 호환성을 보장하지만 컴파일 시간이 늘어납니다.

## 데스크톱용 Compose Multiplatform 릴리스의 제한 사항 {id="limitations-of-compose-multiplatform-for-desktop-releases"}

데스크톱용 Compose Multiplatform은 [Skia](https://skia.org/) 바인딩에서 사용하는 메모리 관리 방식 때문에 JDK 11 이상만 지원합니다.

추가로:
* [`jpackage`](https://docs.oracle.com/en/java/javase/17/docs/specs/man/jpackage.html)의 제한으로 인해 네이티브 배포판 패키징에는 JDK 17 이상만 지원됩니다.
* macOS에서 키보드 레이아웃을 전환할 때 OpenJDK 11.0.12에서 발생하는 알려진 [이슈](https://github.com/JetBrains/compose-multiplatform/issues/940)가 있습니다. 이 이슈는 OpenJDK 11.0.15에서는 재현되지 않습니다.

## Jetpack Compose 및 Compose Multiplatform 릴리스 주기 {id="jetpack-compose-and-compose-multiplatform-release-cycles"}

Compose Multiplatform은 Google에서 개발한 Android용 프레임워크인 [Jetpack Compose](https://developer.android.com/jetpack/compose)와 많은 코드를 공유합니다. 공통 코드가 적절하게 테스트되고 안정화될 수 있도록 Compose Multiplatform의 릴리스 주기를 Jetpack Compose의 릴리스 주기에 맞추고 있습니다.

새로운 버전의 Jetpack Compose가 출시되면 다음과 같은 과정을 거칩니다:

1. 해당 릴리스 커밋을 다음 [Compose Multiplatform](https://github.com/JetBrains/androidx) 버전의 베이스로 사용합니다.
2. 새로운 플랫폼 기능을 위한 지원을 추가합니다.
3. 모든 플랫폼을 안정화합니다.
4. 새로운 버전의 Compose Multiplatform을 출시합니다.

Compose Multiplatform 릴리스와 Jetpack Compose 릴리스 사이의 간격은 보통 1~3개월입니다.

### Compose Multiplatform 개발 버전 {id="development-versions-of-compose-multiplatform"}

정식 릴리스 사이의 업데이트를 테스트하기 위해 Compose Multiplatform 컴파일러 플러그인의 개발 버전(예: `1.8.2+dev2544`)이 정해진 일정 없이 빌드됩니다.

이러한 빌드는 [Maven Central](https://central.sonatype.com/)에서 사용할 수 없습니다.
이를 사용하려면 리포지토리 목록에 다음 줄을 추가하세요:

```kotlin
maven("https://redirector.kotlinlang.org/maven/compose-dev")
```

### 사용된 Jetpack Compose 아티팩트 {id="jetpack-compose-artifacts-used"}

Android용 애플리케이션을 빌드할 때 Compose Multiplatform은 Google에서 게시한 아티팩트(artifacts)를 사용합니다.

다음 표는 각 Compose Multiplatform 버전에서 사용되는 Jetpack Compose 아티팩트 버전을 나열합니다:

| Compose Multiplatform 버전 | Jetpack Compose 버전 |
|-----------------------------------------------------------------------------------|-------------------------|
| [1.12.1](https://github.com/JetBrains/compose-multiplatform/releases/tag/v1.12.1) | 1.12.1                  |
| [1.11.1](https://github.com/JetBrains/compose-multiplatform/releases/tag/v1.11.1) | 1.11.2                  |
| [1.10.3](https://github.com/JetBrains/compose-multiplatform/releases/tag/v1.10.3) | 1.10.5                  |
| [1.9.3](https://github.com/JetBrains/compose-multiplatform/releases/tag/v1.9.3)   | 1.9.4                   |
| [1.8.2](https://github.com/JetBrains/compose-multiplatform/releases/tag/v1.8.2)   | 1.8.2                   |
| [1.7.3](https://github.com/JetBrains/compose-multiplatform/releases/tag/v1.7.3)   | 1.7.6                   |
| [1.7.1](https://github.com/JetBrains/compose-multiplatform/releases/tag/v1.7.1)   | 1.7.5                   |
| [1.7.0](https://github.com/JetBrains/compose-multiplatform/releases/tag/v1.7.0)   | 1.7.1                   |
| [1.6.11](https://github.com/JetBrains/compose-multiplatform/releases/tag/v1.6.11) | 1.6.7                   |
| [1.6.10](https://github.com/JetBrains/compose-multiplatform/releases/tag/v1.6.10) | 1.6.7                   |
| [1.6.2](https://github.com/JetBrains/compose-multiplatform/releases/tag/v1.6.2)   | 1.6.4                   |
| [1.6.1](https://github.com/JetBrains/compose-multiplatform/releases/tag/v1.6.1)   | 1.6.3                   |
| [1.6.0](https://github.com/JetBrains/compose-multiplatform/releases/tag/v1.6.0)   | 1.6.1                   |
| [1.5.12](https://github.com/JetBrains/compose-multiplatform/releases/tag/v1.5.12) | 1.5.4                   |
| [1.5.11](https://github.com/JetBrains/compose-multiplatform/releases/tag/v1.5.11) | 1.5.4                   |
| [1.5.10](https://github.com/JetBrains/compose-multiplatform/releases/tag/v1.5.10) | 1.5.4                   |
| [1.5.1](https://github.com/JetBrains/compose-multiplatform/releases/tag/v1.5.1)   | 1.5.0                   |
| [1.5.0](https://github.com/JetBrains/compose-multiplatform/releases/tag/v1.5.0)   | 1.5.0                   |
| [1.4.3](https://github.com/JetBrains/compose-multiplatform/releases/tag/v1.4.3)   | 1.4.3                   |
| [1.4.1](https://github.com/JetBrains/compose-multiplatform/releases/tag/v1.4.1)   | 1.4.3                   |
| [1.4.0](https://github.com/JetBrains/compose-multiplatform/releases/tag/v1.4.0)   | 1.4.0                   |
| [1.3.1](https://github.com/JetBrains/compose-multiplatform/releases/tag/v1.3.1)   | 1.3.3                   |
| [1.3.0](https://github.com/JetBrains/compose-multiplatform/releases/tag/v1.3.0)   | 1.3.3                   |
| [1.2.1](https://github.com/JetBrains/compose-multiplatform/releases/tag/v1.2.1)   | 1.2.1                   |
| [1.2.0](https://github.com/JetBrains/compose-multiplatform/releases/tag/v1.2.0)   | 1.2.1                   |
| [1.1.1](https://github.com/JetBrains/compose-multiplatform/releases/tag/v1.1.1)   | 1.1.0                   |
| [1.1.0](https://github.com/JetBrains/compose-multiplatform/releases/tag/v1.1.0)   | 1.1.0                   |
| [1.0.1](https://github.com/JetBrains/compose-multiplatform/releases/tag/v1.0.1)   | 1.1.0-beta02            |
| [1.0.0](https://github.com/JetBrains/compose-multiplatform/releases/tag/v1.0.0)   | 1.1.0-beta02            |