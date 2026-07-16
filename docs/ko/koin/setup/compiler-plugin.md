---
title: 컴파일러 플러그인 설정
---

# Koin 컴파일러 플러그인 설정

**Koin 컴파일러 플러그인(Koin Compiler Plugin)**은 모든 새로운 Kotlin 2.x 프로젝트에 권장되는 방식입니다. 이 플러그인은 자동 주입(auto-wiring), 컴파일 타임 안정성, 그리고 더 깔끔한 DSL 구문을 제공합니다.

## 컴파일러 플러그인이란 무엇인가요?

Koin 컴파일러 플러그인은 다음과 같은 기능을 제공하는 **네이티브 코틀린 컴파일러 플러그인(K2)**입니다.

- 생성자 의존성 자동 감지
- 컴파일 타임 분석 제공
- DSL 및 어노테이션(Annotations) 모두와 함께 작동
- 별도의 가시적인 파일을 생성하지 않음

기능과 장점에 대한 자세한 내용은 [Koin 컴파일러 플러그인 소개](/docs/setup/compiler-plugin)를 참조하세요.

## 요구 사항

- **Kotlin 2.3+** (K2 컴파일러)
- **Gradle 8.x+**

## 설정

### 1단계: 버전 카탈로그에 Koin 추가

먼저 최신 버전을 확인하세요:
- Koin: [![Maven Central](https://img.shields.io/maven-central/v/io.insert-koin/koin-core?label=latest)](https://mvnrepository.com/artifact/io.insert-koin/koin-core)
- Koin Compiler Plugin: [![Maven Central](https://img.shields.io/maven-central/v/io.insert-koin/koin-compiler-plugin?label=latest)](https://mvnrepository.com/artifact/io.insert-koin/koin-compiler-plugin)

그 다음, `gradle/libs.versions.toml` 파일에 추가합니다:

```toml
[versions]
koin = "<KOIN_VERSION>"
koin-plugin = "<KOIN_PLUGIN_VERSION>"

[libraries]
koin-core = { module = "io.insert-koin:koin-core", version.ref = "koin" }
koin-annotations = { module = "io.insert-koin:koin-annotations", version.ref = "koin" }

[plugins]
koin-compiler = { id = "io.insert-koin.compiler.plugin", version.ref = "koin-plugin" }
```

### 2단계: 설정 구성

`settings.gradle.kts` 파일에 다음을 추가합니다:

```kotlin
pluginManagement {
    repositories {
        mavenCentral()
        gradlePluginPortal()
    }
}
```

### 3단계: 플러그인 적용

모듈의 `build.gradle.kts` 파일에 다음을 추가합니다:

```kotlin
plugins {
    alias(libs.plugins.koin.compiler)
}

dependencies {
    implementation(libs.koin.core)
    implementation(libs.koin.annotations)  // 어노테이션 지원을 위해 필요
}
```

## 전체 예시

### gradle/libs.versions.toml

```toml
[versions]
koin = "<KOIN_VERSION>"
koin-plugin = "<KOIN_PLUGIN_VERSION>"

[libraries]
koin-core = { module = "io.insert-koin:koin-core", version.ref = "koin" }
koin-annotations = { module = "io.insert-koin:koin-annotations", version.ref = "koin" }

[plugins]
koin-compiler = { id = "io.insert-koin.compiler.plugin", version.ref = "koin-plugin" }
```

### settings.gradle.kts

```kotlin
pluginManagement {
    repositories {
        mavenCentral()
        gradlePluginPortal()
    }
}
```

### build.gradle.kts

```kotlin
plugins {
    alias(libs.plugins.koin.compiler)
}

dependencies {
    implementation(libs.koin.core)
    implementation(libs.koin.annotations)
}
```

## 컴파일러 플러그인 사용하기

### DSL 스타일

컴파일러 플러그인 패키지에서 임포트합니다:

```kotlin
import org.koin.plugin.module.dsl.*
import org.koin.dsl.module

val appModule = module {
    single<Database>()
    single<ApiClient>()
    single<UserRepository>()
    viewModel<UserViewModel>()
}
```

:::info
컴파일러 플러그인 DSL은 **`org.koin.plugin.module.dsl`** 패키지에 있습니다. 클래식 DSL은 `org.koin.dsl`에 그대로 유지됩니다.
:::

### 어노테이션 스타일

클래스에 어노테이션을 사용합니다:

```kotlin
@Singleton
class Database

@Singleton
class ApiClient

@Singleton
class UserRepository(
    private val database: Database,
    private val apiClient: ApiClient
)

@KoinViewModel
class UserViewModel(private val repository: UserRepository) : ViewModel()

@Module
@ComponentScan("com.myapp")
class AppModule
```

### 어노테이션으로 Koin 시작하기

컴파일러 플러그인을 사용하면 타입 기반 API를 사용하여 Koin을 시작할 수 있습니다. **생성된 코드는 필요하지 않습니다**:

```kotlin
@KoinApplication
@ComponentScan("com.myapp")
class MyApp

// 타입 기반 API로 Koin 시작
startKoin<MyApp>()

// 또는 추가 구성과 함께 시작
startKoin<MyApp> {
    androidContext(this@MyApplication)
    printLogger()
}
```

**사용 가능한 타입 기반 API:**

| API | 설명 |
|-----|-------------|
| `startKoin<T>()` | 애플리케이션 T를 사용하여 전역적으로 Koin 시작 |
| `startKoin<T> { }` | 애플리케이션 T와 구성 블록을 사용하여 Koin 시작 |
| `koinApplication<T>()` | T를 사용하여 격리된 KoinApplication 생성 |
| `koinConfiguration<T>()` | T로부터 KoinConfiguration 생성 (Compose KoinApplication, Ktor 등을 위해 사용) |

여기서 `T`는 `@KoinApplication` 어노테이션이 달린 클래스입니다.

## 구성 옵션

`build.gradle.kts`에서 컴파일러 플러그인을 구성할 수 있습니다:

```kotlin
koinCompiler {
    userLogs = true
    debugLogs = false
    dslSafetyChecks = true
}
```

### 사용 가능한 옵션

| 옵션 | 설명 | 기본값 |
|--------|-------------|---------|
| `userLogs` | 컴포넌트 감지 및 DSL/어노테이션 처리에 대한 로그 활성화 | `false` |
| `debugLogs` | 내부 플러그인 처리에 대한 상세 디버그 로그 활성화 | `false` |
| `dslSafetyChecks` | 람다 내부의 `create()` 호출이 유일한 명령인지 검증 | `true` |

:::tip
개발 중에는 `userLogs = true`로 설정하여 플러그인에 의해 어떤 컴포넌트가 감지되고 처리되는지 확인하세요.
:::

## 컴파일 타임 안정성 (출시 예정)

Koin 컴파일러 플러그인은 **컴파일 타임 의존성 검증**을 제공할 예정입니다. 이는 런타임에 실패하는 대신 빌드 타임에 모든 의존성이 해결될 수 있는지 검증하는 기능입니다.

:::note 개발 중
DSL과 어노테이션 모두에 대한 컴파일 타임 안정성 기능은 현재 개발 중입니다. 이는 KSP 기반의 `KOIN_CONFIG_CHECK` 옵션을 네이티브 코틀린 컴파일러 통합 방식으로 대체할 것입니다.
:::

## 멀티 모듈 프로젝트

여러 Gradle 모듈이 있는 프로젝트의 경우:

### 라이브러리 모듈

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
// feature/src/main/kotlin/FeatureModule.kt
@Module
@ComponentScan("com.myapp.feature")
class FeatureModule
```

### 앱 모듈

```kotlin
// app/build.gradle.kts
plugins {
    alias(libs.plugins.koin.compiler)
}

dependencies {
    implementation(project(":feature"))
    implementation(libs.koin.core)
    implementation(libs.koin.annotations)
}
```

```kotlin
// app/src/main/kotlin/MyModule.kt
@Module
@Configuration
class MyModule

// app/src/main/kotlin/MyApp.kt
@KoinApplication
class MyApp

class MainApplication : Application() {
    override fun onCreate() {
        super.onCreate()
        startKoin<MyApp>()
    }
}
```

타입 기반 시작 API를 사용하려면 메인 애플리케이션 클래스에 `@KoinApplication`을 사용하세요.

## Kotlin 멀티플랫폼 (KMP)

컴파일러 플러그인은 KMP 프로젝트에서도 작동합니다:

```kotlin
// shared/build.gradle.kts
plugins {
    id("org.jetbrains.kotlin.multiplatform")
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

## 문제 해결

### 플러그인을 찾을 수 없음

플러그인이 플러그인 저장소에 포함되어 있는지 확인하세요:

```kotlin
// settings.gradle.kts
pluginManagement {
    repositories {
        mavenCentral()
        gradlePluginPortal()
    }
}
```

### Kotlin 버전 불일치

컴파일러 플러그인은 Kotlin 2.3.20+ 버전을 요구합니다. Kotlin 버전을 확인하세요:

```kotlin
// build.gradle.kts
plugins {
    kotlin("jvm") version "2.3.20-Beta1"  // 2.3.20+ 버전 필요
}
```

### 임포트 오류

올바른 패키지에서 임포트하고 있는지 확인하세요:

```kotlin
// 컴파일러 플러그인 DSL
import org.koin.plugin.module.dsl.*

// 클래식 DSL
import org.koin.dsl.*
```

## 마이그레이션

### 클래식 DSL에서 마이그레이션

1. 컴파일러 플러그인을 추가합니다.
2. 임포트를 `org.koin.plugin.module.dsl.*`로 업데이트합니다.
3. `single { Class(get() ...) }` 또는 `singleOf(::Class)`를 `single<Class>()`로 교체합니다.

[DSL에서 컴파일러 플러그인으로 마이그레이션하기](/docs/migration/from-ksp-to-compiler-plugin)를 참조하세요.

### KSP 어노테이션에서 마이그레이션

1. KSP 플러그인 및 관련 의존성을 제거합니다.
2. Koin 컴파일러 플러그인을 추가합니다.
3. `startKoin { modules(...) }`를 `startKoin<MyApp>()`으로 업데이트합니다.
4. **기존 어노테이션은 그대로 유지됩니다!**

전체 가이드는 **[KSP에서 컴파일러 플러그인으로 마이그레이션하기](/docs/migration/from-ksp-to-compiler-plugin)**를 참조하세요.

## 다음 단계

- **[DSL 레퍼런스](/docs/reference/koin-core/modules)** - 전체 DSL 문서
- **[어노테이션 레퍼런스](/docs/reference/koin-annotations/modules)** - 전체 어노테이션 문서
- **[Koin 시작하기](/docs/reference/koin-core/starting-koin)** - 애플리케이션 구성하기