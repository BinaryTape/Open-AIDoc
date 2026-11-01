---
title: 启动 Koin
---

# 启动 Koin

本页介绍如何启动 Koin 容器、启动时可传递的选项、使用 `@KoinApplication` 的类型化启动、日志记录、属性，以及稍后如何加载或卸载模块。本文假定你已了解什么是模块（参见[模块](/docs/reference/koin-core/modules)）。

代码示例分为三个选项卡：编译器插件 DSL、注解、构造函数 / 经典 DSL。选择适合你的方式，该选择将适用于所有页面。

## 启动 Koin {id="start-koin"}

**编译器插件 DSL**
```kotlin
import org.koin.core.context.startKoin

fun main() {
    startKoin {
        printLogger()
        modules(appModule)
    }
}
```

**注解**
```kotlin
import org.koin.plugin.module.dsl.startKoin

@KoinApplication(modules = [AppModule::class])
class MyApp

fun main() {
    startKoin<MyApp> {
        printLogger()
    }
}
```

Koin 编译器插件会将 `startKoin<MyApp>()` 替换为一个 `startKoin { }` 调用，用于加载 `@KoinApplication` 中列出的模块以及它所发现的 `@Configuration` 模块。参见[使用 @KoinApplication 的类型化启动](#typed-startup-with-koinapplication)。

**构造函数 / 经典 DSL**
```kotlin
import org.koin.core.context.startKoin

fun main() {
    startKoin {
        printLogger()
        modules(appModule)
    }
}
```

`startKoin` 会创建容器并将其注册到 `GlobalContext` 中，这是进程的默认上下文。一旦它返回，所有的 `get()`、`by inject()` 或平台 API（`by viewModel()`、`koinInject()`）都会从该容器中解析依赖。

每个进程只能调用一次 `startKoin`。第二次调用会抛出 `KoinApplicationAlreadyStartedException`。若要在启动后添加模块，请使用 [`loadKoinModules`](#load-and-unload-modules-at-runtime)。

## 启动选项 {id="start-options"}

`startKoin { }` 块内的所有内容都用于配置容器：

```kotlin
startKoin {
    printLogger(Level.DEBUG)
    properties(mapOf("server_url" to "https://api.example.com"))
    allowOverride(false)
    modules(coreModule, networkModule)
    lazyModules(analyticsModule)
}
```

| 选项 | 作用 |
|------|------|
| `modules(...)` | 立即加载模块。接受单个模块、多个模块或 `List<Module>` |
| `lazyModules(...)` | 在后台加载模块。需要 `koin-core-coroutines`，参见[延迟模块](/docs/reference/koin-core/lazy-modules) |
| `printLogger(level)` | 打印日志到控制台。参见[日志记录](#logging) |
| `logger(logger)` | 使用你自定义的 `Logger` 实现 |
| `properties(map)` | 从 Map 中添加属性。参见[属性](#properties) |
| `fileProperties(file)` | 从类路径文件中加载属性，默认路径为 `/koin.properties`（仅限 JVM） |
| `environmentProperties()` | 加载系统属性和环境变量（仅限 JVM） |
| `allowOverride(false)` | 当两个定义声明相同类型且未标记 `.override()` 时抛出异常。参见[重写定义](/docs/reference/koin-core/definitions#overriding-a-definition) |
| `strictOverride()` | 等同于 `allowOverride(false)` |
| `createEagerInstances()` | 立即创建 `createdAtStart` 定义。`startKoin` 和 `koinApplication` 已在代码块末尾默认执行此操作，因此仅在配置 `koinApplication(createEagerInstances = false)` 时才需要使用 |

`startKoin` 代码块在调用方线程上运行。在此处加载的每个模块以及每个 `createdAtStart` 定义都会增加启动时间。

## 使用 @KoinApplication 的类型化启动 {id="typed-startup-with-koinapplication"}

使用 [Koin 编译器插件](/docs/setup/compiler-plugin)，使用 `@KoinApplication` 注解的应用类可以描述需要加载的模块。你可以通过该类使用类型化调用来启动 Koin：

```kotlin
@Module
@ComponentScan("com.myapp.data")
class DataModule

@Module(includes = [DataModule::class])
class AppModule

@KoinApplication(modules = [AppModule::class])
class MyApp
```

| 调用 | 结果 |
|------|------|
| `startKoin<MyApp>()` | 使用 `MyApp` 的模块在 `GlobalContext` 中启动 Koin |
| `startKoin<MyApp> { ... }` | 同上，带有配置块（日志记录器、属性、额外的 DSL 模块） |
| `koinApplication<MyApp>()` | 创建一个隔离的 `KoinApplication`，不进行全局注册 |
| `koinConfiguration<MyApp>()` | 创建一个 `KoinConfiguration`，用于为你启动 Koin 的 API（Compose `KoinApplication`、Ktor） |
| `withConfiguration<MyApp>()` | 将 `MyApp` 的模块添加到现有的 `KoinApplication` 中，例如在 Ktor 的 `install(Koin) { }` 内部 |

这些函数从 `org.koin.plugin.module.dsl` 导入。它们是编译器存根：如果未应用编译器插件，它们会在运行时抛出异常，提示缺少该插件。

`@KoinApplication` 接收两个形参：

- `modules`：要显式加载的 `@Module` 类。
- `configurations`：要发现的配置标签。参见[配置标签](#configuration-labels)。

每个 `@Module` 类都会引入其 `includes` 和 `@ComponentScan` 定义。`startKoin<MyApp> { }` 的配置块与普通的 `startKoin` 块相同，因此你可以将注解模块与 DSL 模块混合使用：

```kotlin
startKoin<MyApp> {
    printLogger()
    modules(legacyDslModule)
}
```

### 在不使用 @KoinApplication 的情况下加载 @Module 类 {id="loading-module-classes-without-koinapplication"}

在常规的 `startKoin { }` 或 `koinApplication { }` 块中，你可以直接加载 `@Module` 类：

```kotlin
import org.koin.plugin.module.dsl.module
import org.koin.plugin.module.dsl.modules

startKoin {
    module<NetworkModule>()
    modules(DataModule::class, CacheModule::class)
}
```

这在测试中非常有用，尤其是当你只需要部分模块时。`module<T>()` 和 `modules(vararg KClass)` 也同样是编译器存根，并且它们不能在 `startKoin<T> { }` 内部使用，因为插件已经对后者进行了重写。

:::note
使用编译器插件时，没有可以调用的 `AppModule().module` 扩展函数。请通过 `@KoinApplication` 和 `startKoin<T>()`，或如上所示的 `module<T>()` 来加载注解模块。
:::

### 配置标签 {id="configuration-labels"}

使用 `@Configuration` 标记的 `@Module` 会被 `@KoinApplication` 自动发现，包括类路径上来自其他 Gradle 模块的类（参见[使用 @Configuration 自动发现](/docs/reference/koin-core/modules#auto-discovery-with-configuration)）。通过标签，你可以选择加载其中的哪些模块：

```kotlin
@Module
@Configuration
class CoreModule

@Module
@Configuration("prod")
class ProdDatabaseModule

@Module
@Configuration("test")
class TestDatabaseModule

@Module
@Configuration("default", "test")
class LoggingModule
```

```kotlin
@KoinApplication
class MyApp // 加载 CoreModule 和 LoggingModule

@KoinApplication(configurations = ["default", "prod"])
class ProdApp // 加载 CoreModule、LoggingModule 和 ProdDatabaseModule

@KoinApplication(configurations = ["test"])
class TestApp // 加载 TestDatabaseModule 和 LoggingModule
```

规则：

- 不带值的 `@Configuration` 等同于 `"default"` 标签。`@Configuration("default")` 效果相同。
- 没有 `configurations` 的 `@KoinApplication` 仅加载 `"default"` 标签。
- 当你列出标签时，仅加载这些标签对应的模块。如果仍需要默认模块，请将 `"default"` 添加到列表中。
- 一个模块可以携带多个标签。

## 使用 koinApplication 创建隔离实例 {id="isolated-instance-with-koinapplication"}

`koinApplication { }` 会创建一个未注册到 `GlobalContext` 中的容器：

```kotlin
val koinApp = koinApplication {
    modules(sdkModule)
}

val service = koinApp.koin.get<SdkService>()
```

全局 API（`KoinComponent`、Activity 中的 `by inject()`）无法感知此容器。适用于绝不能与宿主应用共享容器的库和 SDK，或需要独立实例的测试场景。完整模式请参见[上下文隔离](/docs/reference/koin-core/context-isolation)。

`koinConfiguration { }` 构建配置而不启动任何内容。你可以将其传递给自行启动 Koin 的 API，例如 Compose `KoinApplication` 和 Ktor 插件。

## 各平台的启动方式 {id="starting-on-each-platform"}

- Android：在 `Application.onCreate()` 中通过 `androidContext()` 和 `androidLogger()` 启动 Koin。参见[在 Android 上启动 Koin](/docs/reference/koin-android/start)。
- Compose：在可组合项中通过 `KoinApplication` 或 `KoinMultiplatformApplication` 启动 Koin。参见[用于 Compose 的 Koin](/docs/reference/koin-compose/compose)。
- Ktor：在 `Application` 模块中安装 `Koin` 插件。参见[用于 Ktor 的 Koin](/docs/reference/koin-ktor/ktor)。
- Kotlin Multiplatform：在 `commonMain` 中共享 `initKoin()` 函数，并从各个平台调用它。参见[KMP 设置](/docs/reference/koin-core/kmp-setup)。

## 在运行时加载和卸载模块 {id="load-and-unload-modules-at-runtime"}

启动后，你可以在全局容器中添加和移除模块：

```kotlin
import org.koin.core.context.loadKoinModules
import org.koin.core.context.unloadKoinModules

if (premiumEnabled) {
    loadKoinModules(premiumModule)
}

// 稍后
unloadKoinModules(premiumModule)
```

这两个函数均接受单个模块或 `List<Module>`。`unloadKoinModules` 会移除该模块的定义并丢弃其实例，因此之后对这些类型的 `get()` 调用将会失败。

编译器插件无法验证在运行时组装的依赖图：它无法知道模块何时被加载，或者是否已被加载。其他定义从运行时加载的模块中所依赖的类型必须标记为 `@Provided`，并且插件会报告该模块本身在启动时未加载。参见[编译时安全性](/docs/reference/koin-compiler/compile-safety)。如果你只是为了加快启动速度而推迟加载模块，使用[延迟模块](/docs/reference/koin-core/lazy-modules)通常是更好的选择。

## 停止 Koin {id="stop-koin"}

```kotlin
import org.koin.core.context.stopKoin

stopKoin()
```

`stopKoin()` 会关闭全局容器：释放所有实例，调用定义的 `onClose` 回调，并清空 `GlobalContext`。之后你可以再次调用 `startKoin`。对于隔离容器，请在 `KoinApplication` 上调用 `close()`：

```kotlin
koinApp.close()
```

在测试中，请在每次测试后停止 Koin，以便下一次测试从干净的环境开始。[测试](/docs/reference/koin-test/testing)展示了可以为你自动执行此操作的 JUnit 规则。

## 日志记录 {id="logging"}

默认情况下，Koin 不记录任何日志（`EmptyLogger`）。在启动块中启用日志记录：

```kotlin
startKoin {
    printLogger(Level.DEBUG)
    modules(appModule)
}
```

`Level` 包括 `DEBUG`、`INFO`、`WARNING`、`ERROR` 或 `NONE`。每个日志记录器的默认级别均为 `INFO`。

| 日志记录器 | 启动选项 | 平台 | 构件 |
|------------|----------|------|------|
| `EmptyLogger` | （默认） | 全部 | `koin-core` |
| `PrintLogger` | `printLogger()` | 全部 | `koin-core` |
| `AndroidLogger` | `androidLogger()` | Android (Logcat) | `koin-android` |
| `SLF4JLogger` | `slf4jLogger()` | JVM | `koin-logger-slf4j` |

在 `DEBUG` 级别下，Koin 会记录每个模块的加载和每次解析及其耗时。这有助于查找耗时较长的定义，但对于生产环境来说日志过于冗长。

若要将日志发送到其他位置，请继承 `Logger` 并通过 `logger()` 传入：

```kotlin
import org.koin.core.logger.Level
import org.koin.core.logger.Logger
import org.koin.core.logger.MESSAGE

class AppLogger : Logger(Level.INFO) {
    override fun display(level: Level, msg: MESSAGE) {
        MyLogSystem.log(level.name, msg)
    }
}

startKoin {
    logger(AppLogger())
}
```

## 属性 {id="properties"}

属性是存储在容器中的键值对。可将其用于 URL 或密钥等配置值。

### 加载属性 {id="loading-properties"}

```kotlin
startKoin {
    properties(mapOf("server_url" to "https://api.example.com"))
    fileProperties()          // JVM: 从类路径读取 /koin.properties
    environmentProperties()   // JVM: 系统属性和环境变量
}
```

在 Android 上，`androidFileProperties()` 会从 `assets` 文件夹读取 `koin.properties`。你还可以在运行时在 `Koin` 实例上设置和读取属性：

```kotlin
val koin = KoinPlatform.getKoin()
koin.setProperty("session_token", token)
val token: String? = koin.getProperty("session_token")
```

从文件或环境加载的值均为 `String`。请自行进行转换（`getProperty<String>("timeout").toInt()`）。

### 注入属性 {id="injecting-properties"}

**编译器插件 DSL**
使用 `@Property`（来自 `koin-annotations`）注解构造函数形参：

```kotlin
class ApiClient(@Property("server_url") val url: String)

val networkModule = module {
    single<ApiClient>()
}
```

**注解**
```kotlin
@Singleton
class ApiClient(@Property("server_url") val url: String)
```

若要为属性提供默认值，请使用带有相同键的 `@PropertyValue` 注解顶级变量：

```kotlin
@PropertyValue("server_url")
val defaultServerUrl = "https://api.example.com"
```

生成的代码会读取 `getProperty("server_url", defaultServerUrl)`，因此当未设置该属性时，`ApiClient` 将获取默认值。

**构造函数 / 经典 DSL**
```kotlin
val networkModule = module {
    single { ApiClient(url = getProperty("server_url")) }

    // 带默认值
    single { ApiClient(url = getProperty("server_url", "https://api.example.com")) }
}
```

如果属性不存在，`getProperty(key)` 会抛出异常。而 `getPropertyOrNull(key)` 则返回 `null`。

建议在一个配置类中统一读取属性并注入该类，而不是在多处调用 `getProperty`。这样键名便能集中保存在一个文件中。

## 限制 {id="limits"}

- `startKoin` 在每个进程中仅运行一次。再次启动前请先调用 `stopKoin()`。
- `fileProperties()` 和 `environmentProperties()` 仅在 JVM 上可用。在其他平台上，请通过 `properties()` 传递 Map。
- 类型化启动（`startKoin<T>()`、`module<T>()`）需要编译器插件。KSP 处理器已被弃用，参见[从 KSP 迁移](/docs/migration/from-ksp-to-compiler-plugin)。
- 启动后使用 `loadKoinModules` 加载的模块不参与编译时依赖图检查。

## 相关内容 {id="related"}

- [模块](/docs/reference/koin-core/modules)：组织定义、`includes()`、`@Module` 与 `@Configuration`。
- [定义](/docs/reference/koin-core/definitions)：声明 Koin 创建的内容、饿汉式创建与重写。
- [延迟模块](/docs/reference/koin-core/lazy-modules)：在后台加载模块以缩短启动时间。
- [上下文隔离](/docs/reference/koin-core/context-isolation)：为 SDK 在隔离容器中运行 Koin。
- [编译器插件设置](/docs/setup/compiler-plugin)：安装 `startKoin<T>()` 所需的插件。
- [在 Android 上启动 Koin](/docs/reference/koin-android/start)：`androidContext()`、`androidLogger()` 以及 AndroidX Startup。