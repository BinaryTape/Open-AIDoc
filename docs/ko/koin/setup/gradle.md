---
title: Gradle 설정
---

# Gradle 설정

이 페이지에는 각 플랫폼별 Gradle 의존성과 배포된 모든 Koin 아티팩트 목록이 나와 있습니다. 예제에서는 Kotlin DSL(`build.gradle.kts`)과 버전 카탈로그(Version Catalog)를 사용합니다. 컴파일 타임 검사와 컴파일러 플러그인 DSL을 추가하려면 [컴파일러 플러그인 설정](/docs/setup/compiler-plugin)도 참조하세요.

## 버전 {id="versions"}

`koin-annotations`를 포함한 모든 Koin 라이브러리는 동일한 버전을 공유합니다. 현재 안정화 버전은 4.2.2입니다.

- Koin: [![Maven Central](https://img.shields.io/maven-central/v/io.insert-koin/koin-core?label=latest)](https://mvnrepository.com/artifact/io.insert-koin/koin-core)

모든 아티팩트는 [Maven Central](https://central.sonatype.com/search?q=io.insert-koin)의 `io.insert-koin` 그룹에 게시되어 있습니다. 버전 이력과 업그레이드 정보는 [릴리스](/docs/support/releases)에서 확인할 수 있습니다.

## Koin BOM {id="koin-bom"}

Koin BOM(Bill of Materials)은 모든 Koin 라이브러리의 버전을 동일하게 고정합니다. BOM 버전을 한 번만 선언하면 Koin 라이브러리를 버전 명시 없이 추가할 수 있습니다. BOM을 업데이트하면 모든 Koin 라이브러리가 함께 업데이트됩니다.

`gradle/libs.versions.toml`:

```toml
[versions]
koin = "4.2.2"

[libraries]
koin-bom = { module = "io.insert-koin:koin-bom", version.ref = "koin" }
koin-core = { module = "io.insert-koin:koin-core" }
koin-android = { module = "io.insert-koin:koin-android" }
koin-compose = { module = "io.insert-koin:koin-compose" }
koin-compose-viewmodel = { module = "io.insert-koin:koin-compose-viewmodel" }
koin-compose-viewmodel-navigation = { module = "io.insert-koin:koin-compose-viewmodel-navigation" }
koin-ktor = { module = "io.insert-koin:koin-ktor" }
koin-logger-slf4j = { module = "io.insert-koin:koin-logger-slf4j" }
koin-annotations = { module = "io.insert-koin:koin-annotations" }
koin-test = { module = "io.insert-koin:koin-test" }
koin-test-junit4 = { module = "io.insert-koin:koin-test-junit4" }
```

모듈의 `build.gradle.kts`:

```kotlin
dependencies {
    implementation(platform(libs.koin.bom))
    implementation(libs.koin.android)
}
```

버전 카탈로그를 사용하지 않는 경우:

```kotlin
dependencies {
    implementation(platform("io.insert-koin:koin-bom:4.2.2"))
    implementation("io.insert-koin:koin-android")
    testImplementation("io.insert-koin:koin-test-junit4")
}
```

개별 의존성에 버전을 직접 명시하면 해당 의존성에 대해서만 BOM 설정이 재정의(override)됩니다. 특정 라이브러리의 최신 릴리스에 포함된 수정 사항이 필요한 경우가 아니라면 이를 지양하세요.

### BOM을 사용하지 않는 경우 {id="without-the-bom"}

각 라이브러리에 직접 버전을 지정할 수도 있습니다. [Koin 예제](https://github.com/InsertKoinIO/koin-getting-started)에서도 이 방식을 사용하며, Kotlin Multiplatform 소스 세트에서도 동일하게 작동합니다.

```toml
[versions]
koin = "4.2.2"

[libraries]
koin-core = { module = "io.insert-koin:koin-core", version.ref = "koin" }
koin-android = { module = "io.insert-koin:koin-android", version.ref = "koin" }
```

모든 Koin 라이브러리에 대해 단일 `koin` 버전을 유지하세요. 버전을 혼용하는 것은 지원되지 않습니다.

## Kotlin/JVM {#kotlin}

```kotlin
dependencies {
    implementation(platform(libs.koin.bom))
    implementation(libs.koin.core)
}
```

그런 다음 `main`에서 Koin을 시작하세요. [Koin 시작하기](/docs/reference/koin-core/starting-koin)와 [Kotlin 튜토리얼](/docs/quickstart/kotlin)을 참조하세요.

## Android {#android}

```kotlin
dependencies {
    implementation(platform(libs.koin.bom))
    implementation(libs.koin.android)
}
```

`koin-android`에는 `koin-core`와 ViewModel 지원이 포함되어 있습니다. `Application` 클래스에서 Koin을 시작하세요. 자세한 내용은 [Android에서 Koin 시작하기](/docs/reference/koin-android/start)를 참조하세요.

선택적 Android 라이브러리:

| 아티팩트 | 추가 기능 |
|----------|------|
| `koin-androidx-workmanager` | WorkManager 워커: [WorkManager](/docs/reference/koin-android/workmanager) 참조 |
| `koin-androidx-navigation` | Navigation 그래프 범위(Scope)의 ViewModel (Fragments) |
| `koin-androidx-startup` | AndroidX App Startup으로 Koin 시작 |
| `koin-android-compat` | Java 클래스에서 주입하기 위한 Java 헬퍼 |
| `koin-dagger-bridge` | 마이그레이션 중 Koin에서 Dagger 컴포넌트 사용 |

## Jetpack Compose가 적용된 Android {#compose-android}

```kotlin
dependencies {
    implementation(platform(libs.koin.bom))
    implementation(libs.koin.android)
    implementation(libs.koin.compose)
    implementation(libs.koin.compose.viewmodel)
}
```

`koin-androidx-compose`는 `koin-compose`와 `koin-compose-viewmodel`을 하나의 의존성으로 제공하는 Android 전용 아티팩트입니다. 두 설정 방식 모두 작동합니다.

내비게이션의 경우 다음 중 하나를 추가하세요:

| 아티팩트 | 내비게이션 라이브러리 |
|----------|--------------------|
| `koin-androidx-compose-navigation` | Navigation Compose 2, Android 전용 |
| `koin-compose-viewmodel-navigation` | Navigation Compose 2, 멀티플랫폼 |
| `koin-compose-navigation3` | Navigation 3: [Navigation 3](/docs/reference/koin-compose/navigation3) 참조 |

API에 대한 자세한 내용은 [Koin for Compose](/docs/reference/koin-compose/compose)를 참조하세요.

## Compose Multiplatform {#compose}

공유 모듈에서는 `commonMain`에 Compose 라이브러리를 추가하세요. 멀티플랫폼 소스 세트에서는 버전이 포함된 카탈로그 항목을 사용합니다([BOM을 사용하지 않는 경우](#without-the-bom) 참조).

```kotlin
kotlin {
    sourceSets {
        commonMain.dependencies {
            implementation(libs.koin.core)
            implementation(libs.koin.compose)
            implementation(libs.koin.compose.viewmodel)
            implementation(libs.koin.compose.viewmodel.navigation) // Navigation Compose를 사용하는 경우
        }
    }
}
```

Android에서 `koin-compose`는 `koin-android`를 포함하므로 별도로 추가할 필요가 없습니다. [Compose Multiplatform 튜토리얼](/docs/quickstart/cmp)을 참조하세요.

## Kotlin Multiplatform {#kotlin-multiplatform}

공유 모듈의 `build.gradle.kts`에서 버전이 포함된 카탈로그 항목을 사용하는 예시입니다([BOM을 사용하지 않는 경우](#without-the-bom) 참조).

```kotlin
kotlin {
    sourceSets {
        commonMain.dependencies {
            implementation(libs.koin.core)
        }
        androidMain.dependencies {
            implementation(libs.koin.android)
        }
        commonTest.dependencies {
            implementation(libs.koin.test)
        }
    }
}
```

`koin-core`는 JVM, Android, Apple 타깃(iOS, macOS, tvOS, watchOS), Linux, Windows, JS 및 Wasm(`wasmJs`)을 지원합니다. 프로젝트 구조 및 플랫폼별 정의는 [Kotlin Multiplatform 설정](/docs/reference/koin-core/kmp-setup)에서 다룹니다.

## Ktor {#ktor}

```kotlin
dependencies {
    implementation(platform(libs.koin.bom))
    implementation(libs.koin.ktor)
    implementation(libs.koin.logger.slf4j)
}
```

Ktor 애플리케이션에 Koin 플러그인을 설치하세요. 자세한 내용은 [Koin for Ktor](/docs/reference/koin-ktor/ktor)를 참조하세요.

## 테스팅 {#testing}

```kotlin
dependencies {
    testImplementation(libs.koin.test)
    testImplementation(libs.koin.test.junit4) // 또는 koin-test-junit5
}
```

Android 인스트루먼트 테스트(Instrumented test)의 경우, `androidTestImplementation`에 `koin-android-test`를 추가하세요. [테스트에서 주입하기](/docs/reference/koin-test/testing) 및 [Android 인스트루먼트 테스트](/docs/reference/koin-android/instrumented-testing)를 참조하세요.

## 전체 아티팩트 {id="all-artifacts"}

| 아티팩트 | 플랫폼 | 설명 |
|----------|-----------|-------------|
| `koin-bom` | 모든 플랫폼 | 아래의 모든 아티팩트를 위한 BOM(Bill of materials) |
| `koin-core` | 모든 플랫폼 | 컨테이너, DSL, 스코프, 컴파일러 플러그인 DSL |
| `koin-core-coroutines` | 모든 플랫폼 | 지연 로딩 모듈(Lazy module) 및 백그라운드 로딩 |
| `koin-core-viewmodel` | 모든 플랫폼 | Android 및 Compose Multiplatform을 위한 ViewModel 정의 |
| `koin-annotations` | 모든 플랫폼 | 컴파일러 플러그인을 위한 어노테이션 (`@Singleton`, `@Module`, `@Named` 등) |
| `koin-android` | Android | Android 컨텍스트, Activity 및 Fragment API, ViewModel |
| `koin-android-compat` | Android | Java 호환성 헬퍼 |
| `koin-androidx-navigation` | Android | Navigation 그래프 범위의 ViewModel |
| `koin-androidx-workmanager` | Android | WorkManager 연동 |
| `koin-androidx-startup` | Android | AndroidX App Startup 연동 |
| `koin-dagger-bridge` | Android | Koin에서 Dagger 컴포넌트 접근 |
| `koin-compose` | 모든 Compose 타깃 | `koinInject()`, `KoinApplication` 및 Compose 컨텍스트 |
| `koin-compose-viewmodel` | 모든 Compose 타깃 | `koinViewModel()` |
| `koin-compose-viewmodel-navigation` | 모든 Compose 타깃 | Navigation Compose 백스택 엔트리 범위의 ViewModel |
| `koin-compose-navigation3` | 모든 Compose 타깃 | Navigation 3 연동 |
| `koin-androidx-compose` | Android | Android용 `koin-compose` 및 `koin-compose-viewmodel` 번들 |
| `koin-androidx-compose-navigation` | Android | Android용 Navigation Compose 2 |
| `koin-ktor` | JVM, JS, Wasm, iOS, macOS (Ktor 서버 타깃) | Ktor 서버 플러그인 |
| `koin-logger-slf4j` | JVM | SLF4J 로거 |
| `koin-test` | 모든 플랫폼 | 테스트 API: `KoinTest`, `verify()` |
| `koin-test-coroutines` | JVM | 지연 로딩 모듈에 대한 검증 |
| `koin-test-junit4` | JVM | JUnit 4 룰(Rule) |
| `koin-test-junit5` | JVM | JUnit 5 확장(Extension) |
| `koin-android-test` | Android | 인스트루먼트 테스트 헬퍼 |

Koin 컴파일러 플러그인은 라이브러리가 아닌 Gradle 플러그인이므로 자체 버전을 갖습니다. [컴파일러 플러그인 설정](/docs/setup/compiler-plugin)을 참조하세요.

## 관련 문서 {id="related"}

- [컴파일러 플러그인 설정](/docs/setup/compiler-plugin): 컴파일러 플러그인 및 컴파일 타임 검사 추가.
- [설정](/docs/setup): 각 플랫폼별 설치 항목.
- [Koin 시작하기](/docs/reference/koin-core/starting-koin): 의존성이 구성된 후 컨테이너 시작.
- [튜토리얼](/docs/quickstart/kotlin): 각 플랫폼별 첫 번째 앱 만들기.
- [릴리스](/docs/support/releases): 버전 및 업그레이드 정보.