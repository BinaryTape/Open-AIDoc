---
title: 适用于 Compose 的 Koin
---

# 适用于 Compose 的 Koin

本页面涵盖 Compose 软件包、在 Compose 应用中启动 Koin 的两种方式，以及用于在 Composable 中检索依赖项的 `koinInject()`。它在 Jetpack Compose (Android) 和 Compose Multiplatform 上的工作方式相同。你应该了解如何声明[定义](/docs/reference/koin-core/definitions)和[模块](/docs/reference/koin-core/modules)。

## 软件包 {id="packages"}

| 软件包 | 包含内容 | 平台 |
|---------|----------|-----------|
| `io.insert-koin:koin-compose` | `KoinApplication`、`koinInject`、作用域和模块 API | 多平台 |
| `io.insert-koin:koin-compose-viewmodel` | `koinViewModel`、`koinActivityViewModel` (Android) | 多平台 |
| `io.insert-koin:koin-compose-viewmodel-navigation` | `sharedKoinViewModel`、`KoinNavigationScope`、`navigationScope` | 多平台 |
| `io.insert-koin:koin-compose-navigation3` | Navigation 3 条目 | 多平台 |
| `io.insert-koin:koin-androidx-compose` | `koin-compose` + `koin-compose-viewmodel`，外加 `KoinActivityScope` 和 `KoinFragmentScope` | Android |
| `io.insert-koin:koin-androidx-compose-navigation` | 仅已弃用的 `koinNavViewModel` | Android |

所有 Compose API 均位于多平台软件包中。`koin-androidx-compose` 是适用于 Android 项目的便利构件：

```kotlin
// Android 应用
dependencies {
    implementation("io.insert-koin:koin-androidx-compose:$koin_version")
}

// Compose Multiplatform，位于 commonMain
commonMain.dependencies {
    implementation("io.insert-koin:koin-compose:$koin_version")
    implementation("io.insert-koin:koin-compose-viewmodel:$koin_version")
}
```

有关 BOM 和版本目录，请参阅 [Gradle 设置](/docs/setup/gradle)。

## 启动 Koin {id="starting-koin"}

你有两种选择。每个应用选择其中一种即可。

### 在 Compose 外部启动 {id="start-outside-compose"}

在你的平台启动处启动 Koin：在 Android 上为 `Application` 类，在 KMP 项目中为共享的 `initKoin()` 函数（参见 [KMP 设置](/docs/reference/koin-core/kmp-setup)）。随后 Compose 无需额外设置即可直接使用正在运行的 Koin 实例：

```kotlin
class MainApplication : Application() {
    override fun onCreate() {
        super.onCreate()
        startKoin {
            androidContext(this@MainApplication)
            modules(appModule)
        }
    }
}

@Composable
fun App() {
    val repository = koinInject<UserRepository>()
}
```

当 Compose 外部的代码（`Service`、`WorkManager` 工作线程、iOS Swift 代码）也需要 Koin 时，请使用此选项，因为这些代码的运行并不依赖任何 Composable。

### 使用 KoinApplication 从 Composable 启动 {id="start-from-a-composable-with-koinapplication"}

`KoinApplication` 从根 Composable 启动 Koin 并将其提供给所有子组件：

**编译器插件 DSL**
```kotlin
import org.koin.compose.KoinApplication
import org.koin.dsl.koinConfiguration

@Composable
fun App() {
    KoinApplication(
        configuration = koinConfiguration { modules(appModule) }
    ) {
        MainScreen()
    }
}
```

**注解**
```kotlin
// di/Koin.kt
import org.koin.core.annotation.KoinApplication

@KoinApplication
object KoinApp
```

注解和 Composable 都被命名为 `KoinApplication`，因此请将它们保存在不同的文件中。

```kotlin
// App.kt
import org.koin.compose.KoinApplication
import org.koin.plugin.module.dsl.koinConfiguration

@Composable
fun App() {
    KoinApplication(configuration = koinConfiguration<KoinApp>()) {
        MainScreen()
    }
}
```

`koinConfiguration<KoinApp>()` 会加载 `@KoinApplication` 类的模块。传递一个 lambda 以添加选项：`koinConfiguration<KoinApp> { printLogger() }`。

**构造函数 / 经典 DSL**
```kotlin
import org.koin.compose.KoinApplication
import org.koin.dsl.koinConfiguration

@Composable
fun App() {
    KoinApplication(
        configuration = koinConfiguration { modules(appModule) }
    ) {
        MainScreen()
    }
}
```

`KoinApplication` 为你完成的工作：

- **平台设置**：在 Android 上，它会使用应用程序上下文调用 `androidContext()` 并设置 `androidLogger()`。在其他平台上，它会设置 `printLogger()`。可通过 `logLevel` 形参更改日志级别（默认为 `Level.INFO`）。
- **现有实例**：如果 Koin 已经启动，`KoinApplication` 会附加到正在运行的实例并忽略其自身的配置。
- **生命周期**：当 `KoinApplication` 离开组合（composition）时，Koin 不会被停止，因此它能够在 Android 配置更改或 Activity 重建后继续留存。只有在组合被丢弃时，它才会被停止。

`koinConfiguration { }` 会构建一个可复用的 [KoinConfiguration](/docs/reference/koin-core/starting-koin)，因此你可以在 `KoinApplication`、`startKoin` 和测试之间共享相同的配置。

### 已弃用的入口点 {id="deprecated-entry-points"}

| API | 状态 | 改用 |
|-----|--------|-------------|
| `KoinApplication(application = { ... })` | 已弃用 | `KoinApplication(configuration = koinConfiguration { ... })` |
| `KoinMultiplatformApplication(config)` | 已弃用 | `KoinApplication(configuration)` |
| `KoinContext { }` | 已弃用，不再需要 | 无需使用。Compose 会找到通过 `startKoin` 启动的实例 |
| `KoinAndroidContext { }` | 已弃用，不再需要 | 无需使用 |

## 使用 koinInject 进行注入 {id="injecting-with-koininject"}

`koinInject()` 从当前的 Koin 作用域解析依赖项（默认为根作用域，除非有活跃的 [Compose 作用域](/docs/reference/koin-compose/compose-scopes)）：

```kotlin
import org.koin.compose.koinInject

@Composable
fun UserScreen() {
    val repository = koinInject<UserRepository>()
}
```

将其声明为默认形参。该 Composable 仍然可以与 Koin 一起使用，而测试或预览则可以传入它们自己的实例：

```kotlin
@Composable
fun UserScreen(repository: UserRepository = koinInject()) {
    // ...
}
```

`koinInject()` 将解析过程包装在 `remember` 中，以限定符、作用域和形参作为键。使用相同键的重组将返回相同的对象，而无需再次解析。

### 限定符与作用域 {id="qualifier-and-scope"}

```kotlin
@Composable
fun SyncScreen() {
    val localDb = koinInject<Database>(qualifier = named("local"))
    val cache = koinInject<SessionCache>(scope = sessionScope)
}
```

有关声明命名定义的信息，请参阅[限定符](/docs/reference/koin-core/qualifiers)。

### 形参 {id="parameters"}

使用 lambda 或 `ParametersHolder` 传递[注入形参](/docs/reference/koin-core/injection-parameters)：

```kotlin
@Composable
fun UserDetail(userId: String) {
    // lambda 形式
    val presenter = koinInject<UserPresenter> { parametersOf(userId) }

    // holder 形式
    val presenter2 = koinInject<UserPresenter>(parametersHolder = parametersOf(userId))
}
```

使用 lambda 形式时，Koin 会在每次重组时调用 lambda 来比较这些值。holder 形式则跳过了该步骤，Koin 源码推荐出于性能考虑使用此形式。形参按值进行比较：当 `userId` 发生变化时，`koinInject()` 会解析出一个新实例。

## 直接访问 Koin {id="accessing-koin-directly"}

| 函数 | 返回值 |
|----------|---------|
| `getKoin()` | 当前组合的 `Koin` 实例 |
| `currentKoinScope()` | `koinInject()` 默认使用的作用域 |

两者都是位于 `org.koin.compose` 中的 Composable 函数。在 UI 代码中建议优先使用 `koinInject()`。

## 预览 {id="previews"}

Compose 预览不会运行你的 `Application` 类。使用 `KoinApplicationPreview` 可以为预览提供独立的 Koin 实例：参见 [Compose 测试](/docs/reference/koin-compose/compose-testing)。

## API 摘要 {id="api-summary"}

| API | 用途 | 页面 |
|-----|---------|------|
| `KoinApplication(configuration) { }` | 从 Compose 启动 Koin | 本页面 |
| `koinInject<T>()` | 解析任意依赖项 | 本页面 |
| `koinViewModel<T>()` | 解析 ViewModel | [Compose 中的 ViewModel](/docs/reference/koin-compose/compose-viewmodel) |
| `KoinScope`、`KoinNavigationScope` | 绑定到 Composable 或导航目标的作用域 | [Compose 中的作用域](/docs/reference/koin-compose/compose-scopes) |
| `rememberKoinModules { }` | 随 Composable 一起加载模块 | [动态模块](/docs/reference/koin-compose/compose-modules) |
| `KoinIsolatedContext` | 使用隔离的 Koin 实例 | [隔离上下文](/docs/reference/koin-compose/isolated-context) |
| `navigation<T> { }`、`koinEntryProvider()` | Navigation 3 条目 | [Navigation 3](/docs/reference/koin-compose/navigation3) |

## 相关内容 {id="related"}

- [Compose 中的 ViewModel](/docs/reference/koin-compose/compose-viewmodel)：`koinViewModel()` 和导航作用域的 ViewModel。
- [生命周期与状态](/docs/reference/koin-compose/compose-lifecycle)：注入对象在重组过程中的行为。
- [KMP 设置](/docs/reference/koin-core/kmp-setup)：在 Compose Multiplatform 项目中启动 Koin。
- [Android 启动](/docs/reference/koin-android/start)：`androidContext()` 与 Android `Application` 类。
- [Compose 测试](/docs/reference/koin-compose/compose-testing)：预览与 UI 测试。