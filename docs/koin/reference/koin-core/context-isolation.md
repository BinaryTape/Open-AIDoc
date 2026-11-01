---
title: 上下文隔离
---

# 上下文隔离

隔离上下文是未在全局上下文（`GlobalContext`）中注册的 Koin 容器。本页面介绍如何为 SDK 或库创建一个隔离上下文、如何让你的类从中解析依赖项，以及如何对其进行测试。本文假定你已经了解[如何启动 Koin](/docs/reference/koin-core/starting-koin)。

## 为何需要隔离 {id="why-isolate"}

`startKoin` 会在全局上下文（`GlobalContext`）中注册一个容器。每个 `KoinComponent` 以及每个 `by inject()` 都会从中读取，而第二次调用 `startKoin` 则会失败并抛出 `KoinApplicationAlreadyStartedException`。

如果你的库调用了 `startKoin`，它就会与宿主应用程序竞争这唯一的槽位，并且其定义可能会覆盖应用程序的定义。库应当改用 `koinApplication` 创建专属容器，并保持私有。

## 创建隔离上下文 {id="creating-an-isolated-context"}

`koinApplication` 使用与 `startKoin` 相同的 DSL 来构建容器，但不会将其注册到全局。可以将其保存在 SDK 的单例对象（`object`）中：

**编译器插件 DSL**
```kotlin
import org.koin.dsl.koinApplication
import org.koin.dsl.module
import org.koin.plugin.module.dsl.*

internal val sdkModule = module {
    single<SdkRepository>()
    single<SdkService>()
}

internal object SdkKoinContext {
    val koinApp = koinApplication {
        modules(sdkModule)
    }
    val koin = koinApp.koin
}
```

**注解**
```kotlin
import org.koin.plugin.module.dsl.koinApplication

@Module
@ComponentScan("com.example.sdk")
internal class SdkModule

@KoinApplication(modules = [SdkModule::class])
internal object SdkApplication

internal object SdkKoinContext {
    val koinApp = koinApplication<SdkApplication>()
    val koin = koinApp.koin
}
```

`koinApplication<T>()` 会像 `startKoin<T>()` 一样加载 `@KoinApplication` 类的模块，但不会在全局注册该容器。请显式列出 SDK 模块，这样 SDK 容器就不会获取来自宿主应用程序的 `@Configuration` 模块。

**构造函数 / 经典 DSL**
```kotlin
import org.koin.dsl.koinApplication
import org.koin.dsl.module
import org.koin.core.module.dsl.*

internal val sdkModule = module {
    singleOf(::SdkRepository)
    singleOf(::SdkService)
}

internal object SdkKoinContext {
    val koinApp = koinApplication {
        modules(sdkModule)
    }
    val koin = koinApp.koin
}
```

该 `object` 会在首次访问时创建容器。如果想要控制其启动和停止时机（例如在 SDK API 中提供 `init()` 和 `shutdown()`），请在函数中创建它，并在关闭时调用 `koinApp.close()`。

## 从隔离上下文解析 {id="resolving-from-the-isolated-context"}

`KoinComponent` 默认从全局上下文中读取。可以在 internal 接口中重写 `getKoin()`，并在 SDK 类中使用该接口：

```kotlin
internal interface SdkKoinComponent : KoinComponent {
    override fun getKoin(): Koin = SdkKoinContext.koin
}

class SdkClient : SdkKoinComponent {
    // 从 SdkKoinContext 解析，绝不会从宿主应用程序解析
    private val service: SdkService by inject()
}
```

由 Koin 创建的类会通过构造函数从创建它们的容器中获取依赖项。只有 SDK 的入口点（即由宿主应用程序实例化的类）才需要实现 `SdkKoinComponent`。

## 测试 {id="testing"}

在测试中，将 `getKoin()` 指向隔离上下文，并将测试模块加载到其中：

```kotlin
class SdkClientTest : KoinTest {

    private val testModule = module {
        single<SdkService> { FakeSdkService() }
    }

    override fun getKoin(): Koin = SdkKoinContext.koin

    @Before
    fun setUp() {
        getKoin().loadModules(listOf(testModule))
    }

    @After
    fun tearDown() {
        getKoin().unloadModules(listOf(testModule))
    }
}
```

`testModule` 会在 `sdkModule` 之后加载，因此其 `SdkService` 会覆盖真实的实现。有关测试的更多信息，请参阅[测试](/docs/reference/koin-test/testing)。

## 平台支持 {id="platform-support"}

Compose 和 Ktor 拥有各自使用隔离上下文的 API：

- **Compose**：`KoinIsolatedContext` 为可组合项树（composable tree）提供隔离容器。请参阅 [Compose 中的隔离上下文](/docs/reference/koin-compose/isolated-context)。
- **Ktor**：`KoinIsolated` 插件可以使用专属容器运行服务器。请参阅 [Ktor 中的隔离上下文](/docs/reference/koin-ktor/ktor-isolated)。

## 限制 {id="limits"}

- **无全局辅助函数**：使用全局上下文的顶层函数（例如 `GlobalContext.get()`、`KoinPlatform.getKoin()` 或 Activity 中默认的 Android `by inject()`）无法感知隔离容器。请改用你的 `SdkKoinComponent`。
- **生命周期由你掌控**：Koin 不会自动关闭隔离上下文。请在 SDK 关闭时调用 `koinApp.close()`。
- **默认不共享**：隔离容器无法感知宿主应用程序的定义。如需宿主应用程序中的内容，请通过 SDK API 传入，例如在 `init(context)` 中。

## 相关内容 {id="related"}

- [启动 Koin](/docs/reference/koin-core/starting-koin)：`startKoin`、`koinApplication` 以及应用程序 DSL。
- [Koin 组件](/docs/reference/koin-core/koin-component)：`KoinComponent` 与 `getKoin()`。
- [Compose 中的隔离上下文](/docs/reference/koin-compose/isolated-context)：`KoinIsolatedContext`。
- [Ktor 中的隔离上下文](/docs/reference/koin-ktor/ktor-isolated)：`KoinIsolated` 插件。
- [测试](/docs/reference/koin-test/testing)：`KoinTest` 与测试模块。