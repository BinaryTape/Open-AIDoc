---
title: Kotlin Multiplatform 설정
---

# Kotlin Multiplatform 설정

이 페이지에서는 Kotlin 멀티플랫폼(KMP) 프로젝트에서 Koin을 설정하는 방법을 설명합니다. Gradle 의존성, Koin 코드 위치, Koin을 시작하는 하나의 공통 함수, 그리고 각 플랫폼에서 이 함수를 호출하는 방법을 다룹니다. 이 문서는 [모듈](/docs/reference/koin-core/modules)과 [Koin 시작하기](/docs/reference/koin-core/starting-koin)에 대해 이미 알고 있다고 가정합니다. 각 플랫폼에 고유한 구현체를 제공하는 방법은 [KMP 공유 패턴](/docs/reference/koin-core/kmp-shared-modules)에서 다룹니다.

## 지원되는 타깃 {id="supported-targets"}

`koin-core`와 컴파일러 플러그인은 모든 Kotlin 타깃을 지원합니다:

| 타깃 | 지원 여부 |
|--------|-----------|
| Android | 지원 |
| iOS (`iosArm64`, `iosX64`, `iosSimulatorArm64`) | 지원 |
| JVM (데스크톱, 서버) | 지원 |
| JS 및 Wasm (`js`, `wasmJs`) | 지원 |
| macOS, Linux, Windows (Kotlin/Native) | 지원 |

Compose 아티팩트는 Compose Multiplatform의 타깃을 따릅니다. [Gradle 설정](/docs/setup/gradle)의 아티팩트 표를 참조하세요.

## 의존성 {id="dependencies"}

공유 모듈에 [Koin 컴파일러 플러그인](/docs/setup/compiler-plugin)을 적용하고 소스 세트에 Koin을 추가합니다:

```kotlin
// shared/build.gradle.kts
plugins {
    kotlin("multiplatform")
    alias(libs.plugins.koin.compiler)
}

kotlin {
    androidTarget()
    iosArm64()
    iosSimulatorArm64()
    jvm()

    sourceSets {
        commonMain.dependencies {
            implementation(project.dependencies.platform(libs.koin.bom))
            implementation(libs.koin.core)
            implementation(libs.koin.annotations) // 어노테이션 사용 시에만 추가

            // Compose Multiplatform
            implementation(libs.koin.compose)
            implementation(libs.koin.compose.viewmodel)
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

컴파일러 플러그인은 단 한 번의 선언으로 모든 타깃에서 동작합니다. Koin Annotations 1.x의 KSP 설정과 달리 타깃별 설정이 필요하지 않습니다([KSP에서 마이그레이션하기](/docs/migration/from-ksp-to-compiler-plugin) 참조).

## 프로젝트 구조 {id="project-structure"}

```
shared/
└── src/
    ├── commonMain/kotlin/di/
    │   ├── Koin.kt              // 모듈 및 initKoin()
    │   └── PlatformModule.kt    // expect 선언
    ├── androidMain/kotlin/di/
    │   └── PlatformModule.android.kt
    └── iosMain/kotlin/di/
        └── PlatformModule.ios.kt
androidApp/   // Application 클래스에서 initKoin() 호출
iosApp/       // Swift App에서 initKoin() 호출
```

공유 정의는 `commonMain`에 위치합니다. 각 플랫폼 소스 세트에는 플랫폼별로 달라지는 부분만 포함됩니다.

## 공유 시작 함수 {id="shared-start-function"}

`commonMain`에 Koin을 시작하는 함수를 하나 작성합니다. 각 플랫폼은 이 함수를 호출하며, `config` 매개변수를 통해 자체 설정을 추가할 수 있습니다:

**컴파일러 플러그인 DSL**
```kotlin
// commonMain/kotlin/di/Koin.kt
import org.koin.core.context.startKoin
import org.koin.dsl.KoinAppDeclaration
import org.koin.dsl.includes
import org.koin.dsl.module
import org.koin.plugin.module.dsl.*

val dataModule = module {
    single<UserRepository>()
    viewModel<UserViewModel>()
}

val appModule = module {
    includes(dataModule, platformModule())
}

fun initKoin(config: KoinAppDeclaration? = null) {
    startKoin {
        includes(config)
        modules(appModule)
    }
}
```

**어노테이션**
```kotlin
// commonMain/kotlin/di/Koin.kt
import org.koin.core.annotation.*
import org.koin.dsl.KoinAppDeclaration
import org.koin.dsl.includes
import org.koin.plugin.module.dsl.startKoin

@Module(includes = [PlatformModule::class])
@ComponentScan("com.example.app")
@Configuration
class AppModule

@KoinApplication
object KoinApp

fun initKoin(config: KoinAppDeclaration? = null) {
    startKoin<KoinApp> {
        includes(config)
    }
}
```

`@Configuration` 모듈은 빌드 시점에 `@KoinApplication`에 의해 감지됩니다. `PlatformModule`은 `expect` 모듈 클래스이며, 자세한 내용은 [KMP 공유 패턴](/docs/reference/koin-core/kmp-shared-modules)을 참조하세요.

**생성자 / 클래식 DSL**
```kotlin
// commonMain/kotlin/di/Koin.kt
import org.koin.core.context.startKoin
import org.koin.core.module.dsl.*
import org.koin.dsl.KoinAppDeclaration
import org.koin.dsl.includes
import org.koin.dsl.module

val dataModule = module {
    singleOf(::UserRepository)
    viewModelOf(::UserViewModel)
}

val appModule = module {
    includes(dataModule, platformModule())
}

fun initKoin(config: KoinAppDeclaration? = null) {
    startKoin {
        includes(config)
        modules(appModule)
    }
}
```

`includes(config)`는 플랫폼 설정(Android context, 로거, 추가 모듈)을 동일한 Koin 시작 프로세스에 적용합니다. `platformModule()`은 `expect` 함수이며, 자세한 내용은 [KMP 공유 패턴](/docs/reference/koin-core/kmp-shared-modules)을 참조하세요.

## 플랫폼별 진입점 {id="platform-entry-points"}

### Android {id="android"}

`Application` 클래스에서 `initKoin`을 호출하고 Android context를 전달합니다:

```kotlin
// androidApp
class MainApplication : Application() {
    override fun onCreate() {
        super.onCreate()
        initKoin {
            androidContext(this@MainApplication)
            androidLogger()
        }
    }
}
```

이렇게 하면 Android 정의에서 `Context`를 생성자 매개변수로 사용할 수 있습니다. [Android 시작하기](/docs/reference/koin-android/start)를 참조하세요.

### iOS {id="ios"}

`iosMain`에 매개변수가 없는 함수를 추가하고, Swift의 `App` 초기화 구문(initializer)에서 호출합니다:

```kotlin
// iosMain/kotlin/di/KoinIos.kt
fun initKoinIos() = initKoin()
```

```swift
// iosApp/iOSApp.swift
import Shared

@main
struct iOSApp: App {
    init() {
        KoinIosKt.doInitKoinIos()
    }

    var body: some Scene {
        WindowGroup { ContentView() }
    }
}
```

Swift에서의 호출 방식은 Kotlin/Native의 명명 규칙에 따른 것입니다. `KoinIos.kt`의 최상위 함수는 `KoinIosKt`라는 클래스로 내보내집니다. 함수 이름이 `init`으로 시작하면 `do` 접두사가 붙으므로 `initKoinIos`는 `doInitKoinIos`가 됩니다. 이 도우미 함수를 사용하면 Swift에서 Kotlin 람다(`config`)를 전달할 필요가 없습니다.

Swift 코드에서 Koin을 호출하는 방법은 [KMP 플랫폼 연동](/docs/reference/koin-mp/kmp)에서 다룹니다.

### JVM 데스크톱 {id="jvm-desktop"}

```kotlin
// jvmMain
fun main() = application {
    initKoin {
        printLogger()
    }
    Window(onCloseRequest = ::exitApplication) {
        App()
    }
}
```

### 웹 {id="web"}

```kotlin
// jsMain 또는 wasmJsMain
fun main() {
    initKoin()
    // UI 시작
}
```

## Compose Multiplatform {id="compose-multiplatform"}

Compose Multiplatform을 사용할 때는 각 플랫폼에서 `initKoin`을 호출하는 대신 루트 Composable에서 `KoinApplication`으로 Koin을 시작할 수 있습니다. Android의 경우 Android context가 자동으로 설정됩니다:

**컴파일러 플러그인 DSL**
```kotlin
// commonMain
@Composable
fun App() {
    KoinApplication(configuration = koinConfiguration { modules(appModule) }) {
        MainScreen()
    }
}
```

**어노테이션**
```kotlin
// commonMain
@Composable
fun App() {
    KoinApplication(configuration = koinConfiguration<KoinApp>()) {
        MainScreen()
    }
}
```

`koinConfiguration<T>()`는 `org.koin.plugin.module.dsl`에서 제공됩니다.

**생성자 / 클래식 DSL**
```kotlin
// commonMain
@Composable
fun App() {
    KoinApplication(configuration = koinConfiguration { modules(appModule) }) {
        MainScreen()
    }
}
```

첫 번째 화면이 표시되기 전에 Compose 외부의 코드(백그라운드 서비스, Swift 코드 등)에서 Koin을 사용해야 한다면 `initKoin` 방식을 유지하세요. 두 옵션의 비교는 [Koin for Compose](/docs/reference/koin-compose/compose)에서 확인할 수 있습니다.

## 관련 문서 {id="related"}

- [KMP 공유 패턴](/docs/reference/koin-core/kmp-shared-modules): 플랫폼 모듈 및 `expect`/`actual` 정의.
- [KMP 플랫폼 연동](/docs/reference/koin-mp/kmp): 공유 코드에서의 Android context, Swift 상호 운용(interop), 데스크톱 및 웹.
- [Koin for Compose](/docs/reference/koin-compose/compose): `KoinApplication` 및 `koinInject()`.
- [ViewModel](/docs/reference/koin-core/viewmodel): Android 및 Compose Multiplatform에서 공유되는 ViewModel.
- [Gradle 설정](/docs/setup/gradle): BOM, 버전 카탈로그, 아티팩트 목록.