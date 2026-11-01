---
title: Kotlin Multiplatform 設定
---

# Kotlin Multiplatform 設定

本頁面介紹如何在 Kotlin Multiplatform (KMP) 專案中設定 Koin：Gradle 相依性、Koin 程式碼放置位置、一個啟動 Koin 的共享函式，以及各平台如何呼叫它。本文假設你已了解[模組](/docs/reference/koin-core/modules)與[啟動 Koin](/docs/reference/koin-core/starting-koin)。有關如何為各平台提供專屬實作的內容，請參閱 [KMP 共享模式](/docs/reference/koin-core/kmp-shared-modules)。

## 支援的目標 {id="supported-targets"}

`koin-core` 與編譯器外掛程式支援每一個 Kotlin 目標：

| 目標 | 支援 |
|--------|-----------|
| Android | 是 |
| iOS (`iosArm64`, `iosX64`, `iosSimulatorArm64`) | 是 |
| JVM（桌面、伺服器） | 是 |
| JS 與 Wasm (`js`, `wasmJs`) | 是 |
| macOS、Linux、Windows (Kotlin/Native) | 是 |

Compose 構件遵循 Compose Multiplatform 的目標。請參閱 [Gradle 設定](/docs/setup/gradle)中的構件表格。

## 相依性 {id="dependencies"}

將 [Koin 編譯器外掛程式](/docs/setup/compiler-plugin)套用至 shared 模組，並將 Koin 新增至原始碼集：

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
            implementation(libs.koin.annotations) // 僅搭配註解使用

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

編譯器外掛程式只需一次宣告即可在每個目標上執行。與 Koin Annotations 1.x 的 KSP 設定不同，此處不需要個別目標的配置（請參閱[從 KSP 遷移](/docs/migration/from-ksp-to-compiler-plugin)）。

## 專案結構 {id="project-structure"}

```
shared/
└── src/
    ├── commonMain/kotlin/di/
    │   ├── Koin.kt              // 模組與 initKoin()
    │   └── PlatformModule.kt    // expect 宣告
    ├── androidMain/kotlin/di/
    │   └── PlatformModule.android.kt
    └── iosMain/kotlin/di/
        └── PlatformModule.ios.kt
androidApp/   // Application 類別呼叫 initKoin()
iosApp/       // Swift App 呼叫 initKoin()
```

共享定義位於 `commonMain`。各平台的原始碼集僅包含不同平台之間有差異的內容。

## 共享啟動函式 {id="shared-start-function"}

在 `commonMain` 中撰寫一個啟動 Koin 的函式。各平台呼叫該函式，並可透過 `config` 參數新增各自的配置：

**Compiler Plugin DSL**
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

**Annotations**
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

`@Configuration` 模組會在建置期由 `@KoinApplication` 尋找。`PlatformModule` 是一個 `expect` 模組類別，請參閱 [KMP 共享模式](/docs/reference/koin-core/kmp-shared-modules)。

**Constructor / Classic DSL**
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

`includes(config)` 會將平台配置（Android context、記錄器、額外模組）套用至同一個 Koin 啟動流程。`platformModule()` 是一個 `expect` 函式，請參閱 [KMP 共享模式](/docs/reference/koin-core/kmp-shared-modules)。

## 平台入口點 {id="platform-entry-points"}

### Android {id="android"}

從你的 `Application` 類別呼叫 `initKoin` 並傳入 Android context：

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

接著，Android 定義便可將 `Context` 作為建構函式參數使用。請參閱 [Android 啟動](/docs/reference/koin-android/start)。

### iOS {id="ios"}

在 `iosMain` 中新增一個無參數的函式，並從 Swift 的 `App` 初始設定式中呼叫它：

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

Kotlin/Native 命名規則解釋了 Swift 的呼叫方式。`KoinIos.kt` 的頂層函式會匯出至名為 `KoinIosKt` 的類別中。名稱以 `init` 開頭的函式會獲得 `do` 前綴，因此 `initKoinIos` 會變成 `doInitKoinIos`。這個輔助函式避免了從 Swift 傳遞 Kotlin Lambda（`config`）。

在 Swift 程式碼中呼叫 Koin 的相關內容，請參閱 [KMP 平台整合](/docs/reference/koin-mp/kmp)。

### JVM 桌面 {id="jvm-desktop"}

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

### Web {id="web"}

```kotlin
// jsMain or wasmJsMain
fun main() {
    initKoin()
    // 啟動你的 UI
}
```

## Compose Multiplatform {id="compose-multiplatform"}

使用 Compose Multiplatform 時，你可以透過 `KoinApplication` 直接從根 Composable 啟動 Koin，而無需在各平台上呼叫 `initKoin`。在 Android 上，它會自動為你設定 Android context：

**Compiler Plugin DSL**
```kotlin
// commonMain
@Composable
fun App() {
    KoinApplication(configuration = koinConfiguration { modules(appModule) }) {
        MainScreen()
    }
}
```

**Annotations**
```kotlin
// commonMain
@Composable
fun App() {
    KoinApplication(configuration = koinConfiguration<KoinApp>()) {
        MainScreen()
    }
}
```

`koinConfiguration<T>()` 來自於 `org.koin.plugin.module.dsl`。

**Constructor / Classic DSL**
```kotlin
// commonMain
@Composable
fun App() {
    KoinApplication(configuration = koinConfiguration { modules(appModule) }) {
        MainScreen()
    }
}
```

如果 Compose 之外的程式碼在第一個畫面顯示前就需要使用 Koin（背景服務、Swift 程式碼），請保留 `initKoin`。這兩種選項的比較請參閱 [Koin for Compose](/docs/reference/koin-compose/compose)。

## 相關內容 {id="related"}

- [KMP 共享模式](/docs/reference/koin-core/kmp-shared-modules)：平台模組與 `expect`/`actual` 定義。
- [KMP 平台整合](/docs/reference/koin-mp/kmp)：共享程式碼中的 Android context、Swift 互通性、桌面與 Web。
- [Koin for Compose](/docs/reference/koin-compose/compose)：`KoinApplication` 與 `koinInject()`。
- [ViewModel](/docs/reference/koin-core/viewmodel)：由 Android 與 Compose Multiplatform 共享的 ViewModel。
- [Gradle 設定](/docs/setup/gradle)：BOM、版本目錄（version catalog）與構件清單。