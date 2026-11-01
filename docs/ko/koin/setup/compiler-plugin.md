---
title: Compiler Plugin Setup
---

# Compiler Plugin Setup

이 페이지에서는 Compiler Plugin DSL과 애너테이션의 기반이 되는 Kotlin 컴파일러 플러그인인 Koin Compiler Plugin의 설치 방법을 다룹니다. 단일 모듈, 멀티 모듈 및 Kotlin Multiplatform 빌드, 주요 옵션, 설정 관련 문제 해결 방법을 설명합니다. 플러그인의 역할에 대해 자세히 알아보려면 [Koin Compiler Plugin](/docs/intro/koin-compiler-plugin) 문서를 참고하세요. Koin 라이브러리 목록 자체는 [Gradle Setup](/docs/setup/gradle)에 안내되어 있습니다.

## 요구 사항 {id="requirements"}

- Kotlin 2.3.20 이상 (K2 컴파일러).
- Koin 4.2.0 이상.
- Gradle 8 이상.

현재 버전:

- Koin: [![Maven Central](https://img.shields.io/maven-central/v/io.insert-koin/koin-core?label=latest)](https://mvnrepository.com/artifact/io.insert-koin/koin-core)
- Koin Compiler Plugin: [![Maven Central](https://img.shields.io/maven-central/v/io.insert-koin/koin-compiler-plugin?label=latest)](https://mvnrepository.com/artifact/io.insert-koin/koin-compiler-plugin)

플러그인은 Koin과 별개의 자체 버전을 가집니다. `koin-annotations`는 Koin 버전을 따릅니다.

## 설치 {id="install"}

### 1. 플러그인 선언 {id="1-declare-the-plugin"}

`gradle/libs.versions.toml` 파일에 다음을 추가합니다:

```toml
[versions]
koin = "4.2.2"
koin-plugin = "1.2.1"

[libraries]
koin-core = { module = "io.insert-koin:koin-core", version.ref = "koin" }
koin-annotations = { module = "io.insert-koin:koin-annotations", version.ref = "koin" }

[plugins]
koin-compiler = { id = "io.insert-koin.compiler.plugin", version.ref = "koin-plugin" }
```

[Koin BOM](/docs/setup/gradle#koin-bom)을 사용하는 경우, 라이브러리에서 `version.ref`를 생략할 수 있습니다. 플러그인은 BOM에 포함되지 않으므로 고유 버전을 유지해야 합니다.

### 2. 플러그인 리포지토리 {id="2-plugin-repositories"}

플러그인은 Maven Central과 Gradle Plugin Portal에 배포되어 있습니다. `settings.gradle.kts`에 다음을 추가합니다:

```kotlin
pluginManagement {
    repositories {
        mavenCentral()
        gradlePluginPortal()
    }
}
```

### 3. 플러그인 적용 {id="3-apply-the-plugin"}

Koin 정의(definition)를 선언하는 각 Gradle 모듈의 `build.gradle.kts`에 적용합니다:

```kotlin
plugins {
    alias(libs.plugins.koin.compiler)
}

dependencies {
    implementation(libs.koin.core)          // 또는 koin-android, koin-ktor, ...
    implementation(libs.koin.annotations)   // 애너테이션을 사용하거나 DSL 스타일에서 @Named 또는 @InjectedParam을 사용하는 경우
}
```

Compiler Plugin DSL(`single<T>()`, `factory<T>()`, `viewModel<T>()`)은 Koin 라이브러리의 `org.koin.plugin.module.dsl` 패키지에 기본으로 포함되어 제공됩니다. `koin-annotations`는 애너테이션을 사용할 때(DSL 스타일에서 파라미터 애너테이션을 사용하는 경우 포함)에만 필요합니다.

:::tip
`@KoinViewModel` 및 `@KoinWorker`를 사용하려면 클래스패스에 런타임 라이브러리가 있어야 합니다. 각각 `koin-core-viewmodel`(`koin-android` 및 `koin-compose-viewmodel`에 포함됨)과 `koin-androidx-workmanager`가 필요합니다. 누락된 경우 빌드 시 해당 아티팩트 이름을 명시하는 오류와 함께 실패합니다.
:::

### 4. 동작 확인 {id="4-check-that-it-works"}

빌드를 한 번 실행하여 플러그인 로그를 확인해 봅니다:

```kotlin
koinCompiler {
    userLogs = true
}
```

빌드 출력에 플러그인이 감지한 각 정의가 나열됩니다. 확인이 끝나면 다시 비활성화하세요. 그런 다음 [Starting Koin](/docs/reference/koin-core/starting-koin)에 설명된 대로 `startKoin { }` 또는 애너테이션 사용 시 `startKoin<MyApp>()`을 사용하여 Koin을 시작합니다.

## 멀티 모듈 프로젝트 {id="multi-module-projects"}

플러그인은 app 모듈뿐만 아니라 정의를 선언하는 모든 Gradle 모듈에 적용해야 합니다:

```kotlin
// feature/build.gradle.kts
plugins {
    alias(libs.plugins.koin.compiler)
}

dependencies {
    implementation(libs.koin.core)
    implementation(libs.koin.annotations)
}
```

```kotlin
// app/build.gradle.kts
plugins {
    alias(libs.plugins.koin.compiler)
}

dependencies {
    implementation(project(":feature"))
    implementation(libs.koin.android)
    implementation(libs.koin.annotations)
}
```

플러그인으로 컴파일된 각 모듈은 해당 모듈의 정의에 대한 메타데이터를 포함합니다. app 모듈은 이를 읽어 `startKoin` 시 전체 그래프를 검증합니다. 플러그인이 적용되지 않은 라이브러리 모듈은 이러한 검사에서 감지되지 않습니다. Gradle 모듈 전반에 걸쳐 모듈을 구성하는 방법(`includes`, `@Configuration`)은 [Modules](/docs/reference/koin-core/modules) 및 [Multi-Module Android Apps](/docs/reference/koin-android/multi-module)에서 다룹니다.

## Kotlin Multiplatform {id="kotlin-multiplatform"}

공유(shared) 모듈에 플러그인을 한 번 적용하고 라이브러리를 `commonMain`에 추가합니다. 타깃별 설정은 별도로 필요하지 않습니다:

```kotlin
// shared/build.gradle.kts
plugins {
    alias(libs.plugins.kotlin.multiplatform)
    alias(libs.plugins.koin.compiler)
}

kotlin {
    sourceSets {
        commonMain.dependencies {
            implementation(libs.koin.core)
            implementation(libs.koin.annotations)
        }
    }
}
```

프로젝트 구조에 대한 자세한 내용은 [Kotlin Multiplatform Setup](/docs/reference/koin-core/kmp-setup)을 참고하세요.

## 옵션 {id="options"}

`koinCompiler` 블록을 통해 플러그인을 설정할 수 있습니다. 기본 설정값으로도 대부분의 프로젝트에 적합합니다:

```kotlin
koinCompiler {
    compileSafety = true      // 빌드 시점에 그래프 유효성 검사
    skipDefaultValues = true  // 주입 대신 Kotlin 기본값(default value) 사용
    userLogs = false          // 감지된 정의 로깅
}
```

`strictSafety`, `unsafeDslChecks`, `logSeverity`, `debugLogs`를 포함한 모든 옵션에 대한 설명은 [Compiler Plugin Options](/docs/reference/koin-annotations/options)를 참고하세요.

## Kotlin 버전 호환성 {id="kotlin-version-compatibility"}

각 플러그인 릴리스는 다음 Kotlin 버전 목록에 대해 검증되었습니다:

| Kotlin | Koin Compiler Plugin |
|--------|----------------------|
| 2.3.20, 2.4.0, 2.4.10 | 1.2.0+ |
| 2.4.20 | 1.2.1+ |

목록에 없는 Kotlin 버전을 사용하는 경우, 플러그인이 경고를 출력하지만 빌드는 계속 진행됩니다.

:::warning
Kotlin 2.4.20에서는 플러그인 1.2.0 사용 시 IR 생성 과정에서 `NoSuchMethodError`가 발생하며 실패합니다. 1.2.1 이상의 버전을 사용하세요.
:::

## 문제 해결 {id="troubleshooting"}

### 플러그인을 찾을 수 없음 (Plugin not found) {id="plugin-not-found"}

Gradle이 `io.insert-koin.compiler.plugin`을 확인할 수 없는 경우입니다. `settings.gradle.kts`의 `pluginManagement.repositories`에 `mavenCentral()`과 `gradlePluginPortal()`이 추가되어 있는지 확인하세요.

### 런타임에 NotImplementedError 발생 {id="notimplementederror-at-runtime"}

`single<T>()`, `factory<T>()`, `create(::T)`는 플러그인에 의해 대체되는 플레이스홀더입니다. 이러한 코드가 포함된 Gradle 모듈에 플러그인이 적용되지 않은 경우, 코드는 컴파일되지만 모듈 생성 시 런타임에 `NotImplementedError`가 발생합니다. 해당 모듈에 플러그인을 적용하세요.

### 잘못된 Import {id="wrong-imports"}

Compiler Plugin DSL과 Constructor DSL은 다른 패키지에 동일한 이름의 함수를 가지고 있습니다:

```kotlin
// Compiler Plugin DSL
import org.koin.plugin.module.dsl.*

// Constructor DSL: singleOf, factoryOf, viewModelOf
import org.koin.core.module.dsl.*

// 둘 다 해당
import org.koin.dsl.module
```

### 리팩터링 후 오래된 결과가 남는 경우 (Stale results) {id="stale-results-after-a-refactor"}

다른 Kotlin IR 플러그인(예: Compose 컴파일러)과 마찬가지로, Koin Compiler Plugin도 증분 컴파일(incremental compilation) 시 오래된 결과가 생성될 수 있습니다. 증상은 다음과 같습니다:

- 나타나지 않아야 할 컴파일 안전성 오류가 발생하거나, 정의를 제거했는데도 오류가 발생하지 않음.
- 리팩터링 후 런타임에 `NoSuchMethodError` 또는 `ClassNotFoundException`이 발생함.

일반적으로 다음과 같은 변경 작업 후에 발생합니다:

- 클래스의 애너테이션 변경 (`@Singleton`에서 `@Factory`로 변경, `@Named` 추가 또는 삭제 등).
- `@ComponentScan`이 스캔하는 패키지 간의 클래스 이동.
- 모듈의 `includes` 또는 `@Configuration` 라벨 변경.
- 다른 모듈이 의존하는 라이브러리 모듈에서 정의 추가 또는 삭제.

클린 빌드를 실행하세요: `./gradlew clean build`를 실행하거나, Android Studio에서 Build > Clean Project 후 Build > Rebuild Project를 실행합니다.

`module { }` 람다 내부의 변경 사항에 대해, 플러그인은 진입점(`startKoin`, `koinApplication`, `@KoinApplication`)이 포함된 모듈에 대해 `strictSafety`를 활성화합니다. 이를 통해 해당 모듈이 빌드될 때마다 전체 그래프 검사를 다시 실행합니다. 자세한 내용은 [`strictSafety`](/docs/reference/koin-annotations/options)를 참고하세요.

### 모듈 간 누락된 의존성 오류 보고 {id="missing-dependency-reported-across-modules"}

라이브러리 모듈에서 실제로 선언한 의존성을 플러그인이 누락되었다고 보고하는 경우:

1. 해당 라이브러리 모듈에도 플러그인을 적용했는지 확인하세요. 플러그인이 없으면 라이브러리에 메타데이터가 포함되지 않습니다.
2. 해당 라이브러리를 사용하는 모듈보다 라이브러리가 먼저 빌드되도록 설정되어 있는지 확인하세요. 일반적으로 `implementation(project(":lib"))`을 통해 처리됩니다.
3. 라이브러리에 플러그인을 처음 추가한 후에는 클린 빌드를 실행하세요.
4. 1.2.1 이상의 플러그인 버전을 사용하세요. 이전 버전에서는 두 단계 이상의 `implementation` 레벨에 있는 정의를 누락하거나 모듈 간에 `@Named` 프로바이더가 병합되는 문제가 있었습니다. 만약 거짓(false) `KOIN-D001` 오류 때문에 `compileSafety`를 비활성화했다면 다시 활성화하세요.

## 컴파일러 플러그인으로 이전하기 {id="moving-to-the-compiler-plugin"}

- **Constructor DSL 또는 Classic DSL에서 이전하는 경우**: 플러그인을 적용하기만 하면 됩니다. 기존의 `singleOf(::T)` 정의와 `get()` 호출은 코드 변경 없이 빌드 시점에 유효성이 검사됩니다. 이후 모듈별로 점진적으로 `single<T>()`로 교체할 수 있습니다. 자세한 내용은 [Choosing your style](/docs/intro/choosing-your-style)을 참고하세요.
- **KSP 프로세서에서 이전하는 경우**: KSP 및 `koin-ksp-compiler`를 제거하고, 플러그인을 적용한 다음, 생성된 `.module` 확장 함수를 `startKoin<MyApp>()`으로 대체합니다. 기존 애너테이션은 그대로 유지됩니다. 자세한 내용은 [Migrating from KSP](/docs/migration/from-ksp-to-compiler-plugin)를 참고하세요.

## 관련 문서 {id="related"}

- [Koin Compiler Plugin](/docs/intro/koin-compiler-plugin): 플러그인의 역할과 동작 방식.
- [Compiler Plugin Options](/docs/reference/koin-annotations/options): 모든 Gradle 옵션 안내.
- [Compile-Time Safety](/docs/reference/koin-compiler/compile-safety): 모든 검사 항목 및 오류 코드.
- [Gradle Setup](/docs/setup/gradle): Koin 라이브러리 및 BOM 설정.
- [Starting Koin](/docs/reference/koin-core/starting-koin): `startKoin<MyApp>()`과 같은 타입 안전 시작 API.