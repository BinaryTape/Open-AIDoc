---
title: 설정
---

# 설정

이 섹션에서는 Koin을 사용하기 위해 Gradle 빌드에 추가해야 할 항목들을 설명합니다. 아래에서 대상 플랫폼을 선택한 후 링크된 [Gradle 설정](/docs/setup/gradle) 섹션을 확인하세요. 아직 선언 스타일을 결정하지 않았다면 [스타일 선택하기](/docs/intro/choosing-your-style)를 먼저 읽어보세요. 선택한 스타일에 따라 컴파일러 플러그인(Compiler Plugin)이 필요한지 여부가 결정됩니다.

## 설치 항목 {id="what-to-install"}

| 플랫폼 | 아티팩트 | 설정 |
|----------|-----------|-------|
| Kotlin/JVM | `koin-core` | [Kotlin/JVM](/docs/setup/gradle#kotlin) |
| Android | `koin-android` | [Android](/docs/setup/gradle#android) |
| Jetpack Compose가 포함된 Android | `koin-android`, `koin-compose`, `koin-compose-viewmodel` | [Jetpack Compose](/docs/setup/gradle#compose-android) |
| Compose Multiplatform | `koin-compose`, `koin-compose-viewmodel` | [Compose Multiplatform](/docs/setup/gradle#compose) |
| Kotlin Multiplatform | `commonMain` 내 `koin-core` | [Kotlin Multiplatform](/docs/setup/gradle#kotlin-multiplatform) |
| Ktor | `koin-ktor`, `koin-logger-slf4j` | [Ktor](/docs/setup/gradle#ktor) |
| 테스트 | `koin-test`, `koin-test-junit4` 또는 `koin-test-junit5` | [테스트](/docs/setup/gradle#testing) |

## 권장 설정 {id="recommended-setup"}

신규 프로젝트의 경우:

1. **Koin BOM**: `io.insert-koin:koin-bom`을 가져오고(import) 버전 명시 없이 Koin 아티팩트를 선언하여 버전이 항상 일치하도록 유지합니다. 자세한 내용은 [Gradle 설정](/docs/setup/gradle)을 참조하세요.
2. **Koin 컴파일러 플러그인**: `io.insert-koin.compiler.plugin` Gradle 플러그인을 적용하여 컴파일 타임 검사가 지원되는 컴파일러 플러그인 DSL 또는 어노테이션을 사용합니다. Kotlin 2.3.20 이상 버전이 필요합니다. 자세한 내용은 [컴파일러 플러그인 설정](/docs/setup/compiler-plugin)을 참조하세요.

Constructor DSL 또는 Classic DSL만 사용하는 경우에는 1단계만으로도 충분합니다. 하지만 해당 정의에 컴파일 타임 검사가 추가되므로 2단계 적용을 여전히 권장합니다.

:::warning
KSP 프로세서인 `koin-ksp-compiler`는 더 이상 사용되지 않습니다(deprecated). 기존 프로젝트를 위해 [KSP 프로세서 설정](/docs/setup/annotations-ksp)에 설정 방법이 유지되고 있습니다. 신규 프로젝트에는 컴파일러 플러그인을 사용하세요.
:::

## 버전 정보 {id="versions"}

| 컴포넌트 | 현재 버전 | Kotlin |
|-----------|-----------------|----------|
| Koin (`koin-annotations`를 포함한 모든 라이브러리) | 4.2.2 | 2.3.20으로 빌드됨 |
| Koin 컴파일러 플러그인 | 1.2.1 | 2.3.20, 2.4.0, 2.4.10, 2.4.20에서 검증됨 (Koin 4.2.0+ 필요) |

최신 배포 버전:

- Koin: [![Maven Central](https://img.shields.io/maven-central/v/io.insert-koin/koin-core?label=latest)](https://mvnrepository.com/artifact/io.insert-koin/koin-core)
- Koin 컴파일러 플러그인: [![Maven Central](https://img.shields.io/maven-central/v/io.insert-koin/koin-compiler-plugin?label=latest)](https://mvnrepository.com/artifact/io.insert-koin/koin-compiler-plugin)

이전 Koin 버전 라인:

| Koin | Kotlin | 컴파일러 플러그인 |
|------|--------|-----------------|
| 4.2.x | 2.3.20+ | 지원 |
| 4.1.x | 2.1+ | 미지원, KSP 프로세서 전용 |
| 4.0.x | 1.9+ | 미지원, KSP 프로세서 전용 |
| 3.5.x | 1.8+ | 미지원 |

버전 간 변경 사항 및 업그레이드 방법은 [릴리스](/docs/support/releases)에서 확인할 수 있습니다.

## 관련 문서 {id="related"}

- [Gradle 설정](/docs/setup/gradle): BOM 및 모든 Koin 아티팩트.
- [컴파일러 플러그인 설정](/docs/setup/compiler-plugin): 플러그인 설치 및 구성 방법.
- [스타일 선택하기](/docs/intro/choosing-your-style): 각 스타일별 필요한 항목.
- [튜토리얼](/docs/quickstart/kotlin): 각 플랫폼별 첫 번째 앱 만들기.
- [릴리스](/docs/support/releases): 버전 및 업그레이드 참고 사항.