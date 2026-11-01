---
title: Kotlin Multiplatform 配置
---

# Kotlin Multiplatform 配置

本页介绍如何在 Kotlin Multiplatform (KMP) 项目中配置 Koin：Gradle 依赖项、Koin 代码的放置位置、用于启动 Koin 的单个共享函数，以及各平台如何调用它。本文假设你已了解[模块](/docs/reference/koin-core/modules)和[启动 Koin](/docs/reference/koin-core/starting-koin)。关于如何为每个平台提供各自的实现，请参阅 [KMP 共享模式](/docs/reference/koin-core/kmp-shared-modules)。

## 支持的目标 {id="supported-targets"}

`koin-core` 和编译器插件支持所有 Kotlin 目标：

| 目标 | 是否支持 |
|--------|-----------|
| Android | 是 |
| iOS (`iosArm64`、`iosX64`、`iosSimulatorArm64`) | 是 |
| JVM（桌面、服务器） | 是 |
| JS 与 Wasm (`js`、`wasmJs`) | 是 |
| macOS、Linux、Windows (Kotlin/Native) | 是 |

Compose 构件遵循 Compose Multiplatform 的目标。请参阅 [Gradle 配置](/docs/setup/gradle)中的构件表。

## 依赖项 {id="dependencies"}

将 [Koin 编译器插件](/docs/setup/compiler-plugin)应用于共享模块，并将 Koin 添加到源集中：

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
            implementation(libs.koin.annotations) // 仅在使用注解时添加

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

编译器插件只需一次声明即可在每个目标上运行。与 Koin Annotations 1.x 的 KSP 配置不同，它不需要针对每个目标单独配置（请参阅[从 KSP 迁移](/docs/migration/from-ksp-to-compiler-plugin)）。

## 项目结构 {id="project-structure"}

```
shared/
└── src/
    ├── commonMain/kotlin/di/
    │   ├── Koin.kt              // 模块与 initKoin()
    │   └── PlatformModule.kt    // expect 声明
    ├── androidMain/kotlin/di/
    │   └── PlatformModule.android.kt
    └── iosMain/kotlin/di/
        └── PlatformModule.ios.kt
androidApp/   // Application 类调用 initKoin()
iosApp/       // Swift App 调用 initKoin()
```

共享定义位于 `commonMain`。每个平台的源集仅包含因平台而异的内容。

## 共享启动函数 {id="shared-start-function"}

在 `commonMain` 中编写一个启动 Koin 的函数。每个平台调用该函数，并可通过 `config` 形参添加自己的配置：

**编译器插件 DSL**
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

**注解**
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

`@Configuration` 模块会在构建时被 `@KoinApplication` 发现。`PlatformModule` 是一个 `expect` 模块类，请参阅 [KMP 共享模式](/docs/reference/koin-core/kmp-shared-modules)。

**构造函数 / 经典 DSL**
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

`includes(config)` 会将平台配置（Android 上下文、记录器、额外模块）应用到同一个 Koin 启动过程中。`platformModule()` 是一个 `expect` 函数，请参阅 [KMP 共享模式](/docs/reference/koin-core/kmp-shared-modules)。

## 平台入口点 {id="platform-entry-points"}

### Android {id="android"}

从你的 `Application` 类中调用 `initKoin` 并传递 Android 上下文：

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

这样 Android 定义就可以将 `Context` 用作构造函数形参。请参阅 [Android 启动](/docs/reference/koin-android/start)。

### iOS {id="ios"}

在 `iosMain` 中添加一个无形参函数，并从 Swift `App` 初始化器中调用它：

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

Kotlin/Native 命名规则解释了这种 Swift 调用方式。`KoinIos.kt` 的顶层函数会导出到一个名为 `KoinIosKt` 的类中。名称以 `init` 开头的函数会获得 `do` 前缀，因此 `initKoinIos` 会变成 `doInitKoinIos`。该帮助程序函数避免了从 Swift 传递 Kotlin lambda 表达式 (`config`)。

关于从 Swift 代码调用 Koin，请参阅 [KMP 平台集成](/docs/reference/koin-mp/kmp)。

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
// jsMain 或 wasmJsMain
fun main() {
    initKoin()
    // 启动你的 UI
}
```

## Compose Multiplatform {id="compose-multiplatform"}

使用 Compose Multiplatform 时，你可以通过根 Composable 中的 `KoinApplication` 来启动 Koin，而无需在每个平台上调用 `initKoin`。在 Android 上，它会自动为你设置 Android 上下文：

**编译器插件 DSL**
```kotlin
// commonMain
@Composable
fun App() {
    KoinApplication(configuration = koinConfiguration { modules(appModule) }) {
        MainScreen()
    }
}
```

**注解**
```kotlin
// commonMain
@Composable
fun App() {
    KoinApplication(configuration = koinConfiguration<KoinApp>()) {
        MainScreen()
    }
}
```

`koinConfiguration<T>()` 来自 `org.koin.plugin.module.dsl`。

**构造函数 / 经典 DSL**
```kotlin
// commonMain
@Composable
fun App() {
    KoinApplication(configuration = koinConfiguration { modules(appModule) }) {
        MainScreen()
    }
}
```

如果 Compose 外部的代码在显示第一个屏幕之前需要使用 Koin（例如后台服务、Swift 代码），请保留 `initKoin`。这两种方式在 [Koin for Compose](/docs/reference/koin-compose/compose) 中进行了对比。

## 相关内容 {id="related"}

- [KMP 共享模式](/docs/reference/koin-core/kmp-shared-modules)：平台模块与 `expect`/`actual` 定义。
- [KMP 平台集成](/docs/reference/koin-mp/kmp)：共享代码中的 Android 上下文、Swift 互操作、桌面与 Web。
- [Koin for Compose](/docs/reference/koin-compose/compose)：`KoinApplication` 与 `koinInject()`。
- [ViewModel](/docs/reference/koin-core/viewmodel)：Android 和 Compose Multiplatform 共享的 ViewModel。
- [Gradle 配置](/docs/setup/gradle)：BOM、版本目录、构件列表。