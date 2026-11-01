---
title: 延迟模块
---

# 延迟模块

延迟模块（lazy module）是指 Koin 在后台协程中注册，而不是在 `startKoin` 期间注册的模块。本页面涵盖延迟模块的声明、并行加载、等待其完成，以及该功能的限制。本文假设你已了解[模块](/docs/reference/koin-core/modules)和[启动 Koin](/docs/reference/koin-core/starting-koin)。

## 依赖项 {id="dependency"}

延迟模块包含在 `koin-core-coroutines` 构件中：

```kotlin
// build.gradle.kts
implementation("io.insert-koin:koin-core-coroutines")
```

## 声明延迟模块 {id="declaring-a-lazy-module"}

`lazyModule` 接收与 `module` 相同的内容。在 Koin 加载它之前，不会创建或分配任何内容。

**编译器插件 DSL**
```kotlin
import org.koin.dsl.lazyModule
import org.koin.plugin.module.dsl.*

val analyticsModule = lazyModule {
    single<AnalyticsService>()
    single<EventTracker>()
}
```

**注解**
注解模块（`@Module`）在启动时加载，无法声明为延迟模块。若要在后台加载某些定义，请在 `lazyModule` 中使用任意 DSL 形式（编译器插件、构造函数或经典 DSL）进行声明。

**构造函数 / 经典 DSL**
```kotlin
import org.koin.dsl.lazyModule
import org.koin.core.module.dsl.*

val analyticsModule = lazyModule {
    singleOf(::AnalyticsService)
    singleOf(::EventTracker)
}
```

延迟模块可以包含其他延迟模块：

```kotlin
val dataModule = lazyModule {
    single<UserRepository>()
}

val featureModule = lazyModule {
    includes(dataModule)
    single<FeatureService>()
}
```

## 加载延迟模块 {id="loading-lazy-modules"}

在 `startKoin` 中将延迟模块传递给 `lazyModules()`。`modules()` 中的模块会在调用线程上加载，且在 `startKoin` 返回之前完成。延迟模块则在后台协程中加载：

```kotlin
startKoin {
    modules(coreModule)
    lazyModules(analyticsModule, reportingModule)
}
```

自 Koin 4.2 起，每个延迟模块都在各自的协程中加载，因此多个延迟模块会并行加载。在 4.2 之前，它们是按顺序依次加载的。

`lazyModules()` 会在需要时配置 Koin 协程引擎。它在平台默认调度器上运行（在 JVM 和 Native 上为 `Dispatchers.Default`）。若要选择其他调度器，请传递 `dispatcher`：

```kotlin
startKoin {
    lazyModules(databaseModule, networkModule, dispatcher = Dispatchers.IO)
}
```

调度器是在首次调用 `lazyModules()` 创建协程引擎时设置的。在后续调用中传入的 `dispatcher` 不会生效。

## 等待延迟模块 {id="waiting-for-lazy-modules"}

延迟模块中的定义在其模块加载完成之前不可用。解析定义前请先等待加载完成：

| 函数 | 平台 | 行为 |
|----------|----------|----------|
| `Koin.awaitAllStartJobs()` | 全部 | 挂起直到所有延迟模块加载完成 |
| `Koin.onKoinStarted { koin -> }` | 全部 | 挂起直到加载完成，然后执行代码块 |
| `Koin.waitAllStartJobs()` | 全部 | 阻塞线程直到加载完成。在 JS 上不会阻塞并会记录一条警告 |
| `Koin.runOnKoinStarted { koin -> }` | JVM | 阻塞直到加载完成，然后执行代码块 |
| `Koin.isAllStartedJobsDone()` | 全部 | 当所有延迟模块加载完成时返回 `true` |

在协程中：

```kotlin
suspend fun trackAppStart() {
    val koin = KoinPlatform.getKoin()
    koin.awaitAllStartJobs()
    koin.get<AnalyticsService>().trackAppStart()
}
```

在阻塞式代码中：

```kotlin
startKoin {
    lazyModules(analyticsModule)
}

KoinPlatform.getKoin().waitAllStartJobs()
val analytics = KoinPlatform.getKoin().get<AnalyticsService>()
```

:::warning
请勿在启动期间于 Android 主线程上调用 `waitAllStartJobs()`：它会阻塞 UI 直到每个延迟模块加载完成，从而抵消延迟加载带来的好处。请改在协程中等待。
:::

## Android 示例 {id="android-example"}

使用 `modules()` 加载首屏所需的内容，其余内容在后台加载：

```kotlin
class MainApplication : Application() {
    override fun onCreate() {
        super.onCreate()

        startKoin {
            androidContext(this@MainApplication)
            modules(coreModule)
            lazyModules(analyticsModule, databaseModule, dispatcher = Dispatchers.IO)
        }
    }
}
```

适合作为延迟模块的候选对象：数据分析（analytics）、崩溃报告、导航步骤之后的功能，以及模块主体耗时较长的定义。首屏解析所需的任何内容请保留在 `modules()` 中。

## 限制 {id="limits"}

- **常规模块不能依赖延迟模块**：如果常规模块中的定义依赖于延迟模块中的定义，在延迟模块加载完成之前解析它将会失败并抛出 `NoDefinitionFoundException`。Koin 不会自动为你检查此问题。
- **延迟模块在启动时加载**：`lazyModules()` 会立即在后台开始加载。它不会在首次使用时才加载模块。
- **仅模块注册**：延迟加载只是将模块注册移出了主线程。`single` 仍会在首次请求时，在发起请求的线程上创建。避免在延迟模块中使用 `createdAtStart`：Koin 会在 `startKoin` 结束时创建预加载实例，因此尚未加载完成的延迟模块会错过该步骤。
- **不支持注解**：`@Module` 类不能声明为延迟模块。

:::tip
若要测量真实设备上的启动和模块加载耗时，请参阅[生产环境监控](/docs/tooling/production-monitoring)。
:::

## 相关内容 {id="related"}

- [模块](/docs/reference/koin-core/modules)：模块声明与 `includes()`。
- [启动 Koin](/docs/reference/koin-core/starting-koin)：`startKoin` 与应用程序 DSL。
- [定义](/docs/reference/koin-core/definitions#eager-creation)：`createdAtStart` 与预加载。
- [Android 设置](/docs/reference/koin-android/start)：在 Android `Application` 中启动 Koin。
- [DSL 参考](/docs/reference/koin-core/dsl)：所有 DSL 关键字。