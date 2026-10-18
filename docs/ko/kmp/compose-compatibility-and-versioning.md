[//]: # (title: 호환성 및 버전)

Compose Multiplatform 릴리스는 Kotlin 및 Jetpack Compose 릴리스와 별도로 제공됩니다. 이 페이지에는
Compose Multiplatform 릴리스, Compose 릴리스 주기 및 컴포넌트 호환성에 대한 정보가 포함되어 있습니다.
지원되는 IDE 버전에 대한 자세한 내용은 [권장 IDE 및 코드 편집기](recommended-ides.md)를 참조하세요.

Compose Multiplatform은 Kotlin Multiplatform을 기반으로 구축되었으므로, [Kotlin Multiplatform 호환성 가이드](multiplatform-compatibility-guide.md)에
나열된 Kotlin Multiplatform Gradle 플러그인, Gradle, Android Gradle Plugin 및 Xcode와의
버전 호환성에도 영향을 받습니다.

## 지원되는 플랫폼 {id="supported-platforms"}

Compose Multiplatform %org.jetbrains.compose%는 다음 플랫폼을 지원합니다.

| 플랫폼 | 최소 버전                                                                                             |
|----------|------------------------------------------------------------------------------------------------------|
| Android  | Android 5.0 (API 레벨 21)                                                                           |
| iOS      | iOS 14                                                                                               |
| macOS    | macOS 13 arm64                                                                                       |
| Windows  | Windows 10 (x86-64, arm64)                                                                           |
| Linux    | Ubuntu 20.04 (x86-64, arm64)                                                                         |
| Web      | [WasmGC를 지원하는](https://kotlinlang.org/docs/wasm-configuration.html#browser-versions) 브라우저 |

> 모든 Compose Multiplatform 릴리스는 64비트 플랫폼만 지원합니다. 
> 
{style="note"}

## Kotlin 호환성 {id="kotlin-compatibility"}

최신 Compose Multiplatform은 항상 최신 버전의 Kotlin과 호환됩니다.
버전을 수동으로 맞출 필요는 없습니다.
두 제품 중 어느 것이든 EAP 버전을 사용하는 경우 여전히 불안정할 수 있음을 유의하세요.

Compose Multiplatform을 사용하려면 Kotlin Multiplatform 플러그인과 동일한 버전으로 적용된
Compose Compiler Gradle 플러그인이 필요합니다.
자세한 내용은 [Compose Multiplatform 프로젝트 마이그레이션](compose-compiler.md#migrating-a-compose-multiplatform-project)을 참조하세요.

Compose Multiplatform 1.8.0부터 UI 프레임워크가 K2 컴파일러로 완전히 전환되었습니다.
최신 Compose Multiplatform 릴리스를 사용하려면:

 * 프로젝트에 최소 Kotlin 2.1.0 이상을 사용하세요.
 * Compose Multiplatform 기반 라이브러리는 최소 Kotlin 2.1.0 이상에서 컴파일된 경우에만 의존성으로 추가하세요.
 * iOS 및 웹과 같이 지원 기능이 빠르게 발전하는 플랫폼을 타겟팅하는 프로젝트의 경우 Kotlin **2.2.20**으로 업그레이드하세요.
 
모든 의존성이 업데이트될 때까지 이전 버전과의 호환성 문제에 대한 임시 해결책으로,
Gradle 빌드 파일에서 [`disableNativeCache`](multiplatform-dsl-reference.md#binaries) DSL을 사용하여 Gradle 캐시를 끌 수 있습니다.
이렇게 하면 이전 라이브러리와의 호환성이 보장되지만 컴파일 시간이 늘어납니다.

## 데스크톱용 Compose Multiplatform 릴리스의 제한 사항 {id="limitations-of-compose-multiplatform-for-desktop-releases"}

데스크톱용 Compose Multiplatform은 [Skia](https://skia.org/) 바인딩에 사용되는 메모리 관리 방식 때문에 JDK 11 이상만 지원됩니다.

추가 사항:
* [`jpackage`](https://docs.oracle.com/en/java/javase/17/docs/specs/man/jpackage.html) 제한으로 인해 네이티브 배포판 패키징에는 JDK 17 이상만 지원됩니다.
* macOS에서 키보드 레이아웃을 전환할 때 OpenJDK 11.0.12와 관련된 알려진 [이슈](https://github.com/JetBrains/compose-multiplatform/issues/940)가 있습니다.
  이 이슈는 OpenJDK 11.0.15에서는 재현되지 않습니다.

## Jetpack Compose 및 Compose Multiplatform 릴리스 주기 {id="jetpack-compose-and-compose-multiplatform-release-cycles"}

Compose Multiplatform은 Google이 개발한 Android용 프레임워크인 [Jetpack Compose](https://developer.android.com/jetpack/compose)와
많은 코드를 공유합니다. 공통 코드가 제대로 테스트되고 안정화될 수 있도록 Compose Multiplatform 릴리스 주기를
Jetpack Compose의 릴리스 주기와 맞추고 있습니다.

Jetpack Compose의 새 버전이 출시되면 다음 단계를 거칩니다.

1. 릴리스 커밋을 다음 [Compose Multiplatform](https://github.com/JetBrains/androidx) 버전의 기반으로 사용합니다.
2. 새로운 플랫폼 기능에 대한 지원을 추가합니다.
3. 모든 플랫폼을 안정화합니다.
4. Compose Multiplatform의 새 버전을 릴리스합니다.

Compose Multiplatform 릴리스와 Jetpack Compose 릴리스 사이의 간격은 일반적으로 1~3개월입니다.

### Compose Multiplatform 개발 버전 {id="development-versions-of-compose-multiplatform"}

공식 릴리스 사이의 업데이트를 테스트하기 위해 정해진 일정 없이 Compose Multiplatform 컴파일러 플러그인의 개발 버전(예: `1.8.2+dev2544`)이 빌드됩니다.

이러한 빌드는 [Maven Central](https://central.sonatype.com/)에서 제공되지 않습니다.
해당 버전에 접근하려면 리포지토리 목록에 다음 줄을 추가하세요.

```kotlin
maven("https://redirector.kotlinlang.org/maven/compose-dev")
```

### 사용되는 Jetpack Compose 아티팩트 {id="jetpack-compose-artifacts-used"}

Android용 애플리케이션을 빌드할 때 Compose Multiplatform은 Google에서 게시한 아티팩트를 사용합니다.

다음 표는 Compose Multiplatform의 각 버전에서 사용하는 Jetpack Compose 아티팩트 버전을 보여줍니다.

| Compose Multiplatform 버전                                                        | Jetpack Compose 버전    |
|-----------------------------------------------------------------------------------|-------------------------|
| [1.12.2](https://github.com/JetBrains/compose-multiplatform/releases/tag/v1.12.2) | 1.12.1                  |
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