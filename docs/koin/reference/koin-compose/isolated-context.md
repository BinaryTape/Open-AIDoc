---
title: Compose 中的隔离上下文
---

# Compose 中的隔离上下文

本页面介绍了如何使用 `KoinIsolatedContext` 让 Compose 函数从隔离的 Koin 实例中解析依赖项。当您构建提供 Composable 且绝不能共享宿主应用的 Koin 容器的 SDK 或库时，可以使用此功能。关于什么是隔离上下文以及如何创建隔离上下文，请参阅[上下文隔离](/docs/reference/koin-core/context-isolation)。

## KoinIsolatedContext {id="koinisolatedcontext"}

按照[上下文隔离](/docs/reference/koin-core/context-isolation)中的说明，将隔离的 `KoinApplication` 保存在静态持有者中：

**编译器插件 DSL**
```kotlin
object PaymentSdkKoin {
    val koinApp = koinApplication {
        modules(paymentModule)
    }
}

internal val paymentModule = module {
    single<PaymentProcessor>()
    viewModel<PaymentViewModel>()
}
```

**注解**
```kotlin
import org.koin.plugin.module.dsl.koinApplication

@Module
@ComponentScan("com.example.paymentsdk")
internal class PaymentModule

@KoinApplication(modules = [PaymentModule::class])
internal object PaymentSdkApp

object PaymentSdkKoin {
    val koinApp = koinApplication<PaymentSdkApp>()
}
```

**构造函数 / 传统 DSL**
```kotlin
object PaymentSdkKoin {
    val koinApp = koinApplication {
        modules(paymentModule)
    }
}

internal val paymentModule = module {
    singleOf(::PaymentProcessor)
    viewModelOf(::PaymentViewModel)
}
```

使用 `KoinIsolatedContext` 包裹 SDK 的 UI：

```kotlin
import org.koin.compose.KoinIsolatedContext

@Composable
fun PaymentScreen(amount: Double, onDone: (PaymentResult) -> Unit) {
    KoinIsolatedContext(context = PaymentSdkKoin.koinApp) {
        PaymentFlow(amount, onDone)
    }
}

@Composable
private fun PaymentFlow(amount: Double, onDone: (PaymentResult) -> Unit) {
    val viewModel = koinViewModel<PaymentViewModel>() // 从 SDK 的 Koin 解析
    // ...
}
```

在该块内部，`koinInject()`、`koinViewModel()`、`getKoin()`、`currentKoinScope()` 和 `rememberKoinModules()` 会使用隔离的实例。在该块外部，宿主应用则保留其自身的 Koin。

## 同一屏幕中的宿主与 SDK {id="host-and-sdk-in-the-same-screen"}

在块外部解析宿主依赖项，在块内部解析 SDK 依赖项：

```kotlin
@Composable
fun CheckoutScreen() {
    val analytics = koinInject<HostAnalytics>() // 宿主应用的 Koin

    KoinIsolatedContext(context = PaymentSdkKoin.koinApp) {
        val processor = koinInject<PaymentProcessor>() // SDK 的 Koin
        PaymentButton(processor, onEvent = { analytics.track(it) })
    }
}
```

这两个容器彼此不可见。请通过形参和回调跨越边界传递值。

## 初始化与关闭 {id="initialization-and-shutdown"}

当 SDK 需要来自宿主的配置时，请在 `initialize` 函数中创建 `KoinApplication`，并在关闭时将其关闭：

```kotlin
object PaymentSdk {
    private var koinApp: KoinApplication? = null

    fun initialize(config: PaymentConfig) {
        koinApp = koinApplication {
            modules(module { single { config } }, paymentModule)
        }
    }

    fun shutdown() {
        koinApp?.close()
        koinApp = null
    }

    @Composable
    fun PaymentScreen(amount: Double, onDone: (PaymentResult) -> Unit) {
        val app = koinApp ?: error("PaymentSdk.initialize() was not called")
        KoinIsolatedContext(context = app) {
            PaymentFlow(amount, onDone)
        }
    }
}
```

在显示任何 SDK 屏幕之前，宿主仅调用一次 `PaymentSdk.initialize(...)`，例如在 `Application.onCreate()` 中调用。

## 限制 {id="limits"}

- **KoinNavigationScope**：它在全局 Koin 实例中创建其作用域，因此不会遵循 `KoinIsolatedContext`。请改在隔离块内部使用 `KoinScope`（请参阅 [Compose 中的作用域](/docs/reference/koin-compose/compose-scopes)）。
- **Compose 外部的代码**：SDK 类通过其构造函数从隔离实例接收依赖项。如果 SDK 在 Compose 外部的入口点（例如 `Service`、宿主调用的回调）必须自行检索依赖项，请使用重写了 `getKoin()` 的 `KoinComponent`。请参阅[上下文隔离](/docs/reference/koin-core/context-isolation)。
- **生命周期**：`KoinIsolatedContext` 不会启动或停止该实例。您需要自行掌控其生命周期。

## 相关内容 {id="related"}

- [上下文隔离](/docs/reference/koin-core/context-isolation)：创建隔离的 Koin 实例和自定义 `KoinComponent`。
- [适用于 Compose 的 Koin](/docs/reference/koin-compose/compose)：`KoinApplication` 与 `koinInject()`。
- [Compose 中的作用域](/docs/reference/koin-compose/compose-scopes)：隔离块内部的作用域。
- [Ktor 中的隔离上下文](/docs/reference/koin-ktor/ktor-isolated)：适用于 Ktor 服务器的相同概念。