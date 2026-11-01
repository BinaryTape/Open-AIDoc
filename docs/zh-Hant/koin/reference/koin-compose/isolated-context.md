---
title: Compose 中的隔離上下文
---

# Compose 中的隔離上下文

本頁面將介紹如何使用 `KoinIsolatedContext`，讓 Compose 函式從隔離的 Koin 執行個體中解析相依性。當您建置提供 Composable 且不得與宿主應用程式共用 Koin 容器的 SDK 或程式庫時，請使用此功能。關於什麼是隔離上下文以及如何建立它，請參閱[上下文隔離](/docs/reference/koin-core/context-isolation)。

## KoinIsolatedContext {id="koinisolatedcontext"}

如[上下文隔離](/docs/reference/koin-core/context-isolation)中所述，將隔離的 `KoinApplication` 保存在靜態持有者中：

**編譯器外掛程式 DSL**
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

**註解**
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

**建構函式 / 傳統 DSL**
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

使用 `KoinIsolatedContext` 包裝 SDK UI：

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
    val viewModel = koinViewModel<PaymentViewModel>() // 從 SDK 的 Koin 解析
    // ...
}
```

在區塊內部，`koinInject()`、`koinViewModel()`、`getKoin()`、`currentKoinScope()` 和 `rememberKoinModules()` 都會使用該隔離執行個體。在區塊外部，宿主應用程式則保留其自身的 Koin。

## 同一畫面中的宿主與 SDK {id="host-and-sdk-in-the-same-screen"}

在區塊外部解析宿主的相依性，並在區塊內部解析 SDK 的相依性：

```kotlin
@Composable
fun CheckoutScreen() {
    val analytics = koinInject<HostAnalytics>() // 宿主應用程式的 Koin

    KoinIsolatedContext(context = PaymentSdkKoin.koinApp) {
        val processor = koinInject<PaymentProcessor>() // SDK 的 Koin
        PaymentButton(processor, onEvent = { analytics.track(it) })
    }
}
```

這兩個容器互不可見。請透過參數與回呼跨邊界傳遞值。

## 初始化與關閉 {id="initialization-and-shutdown"}

當 SDK 需要來自宿主的設定時，請在 `initialize` 函式中建立 `KoinApplication`，並在關閉時將其關閉：

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

宿主在顯示任何 SDK 畫面之前呼叫一次 `PaymentSdk.initialize(...)`，例如在 `Application.onCreate()` 中。

## 限制 {id="limits"}

- **KoinNavigationScope**：它會在全域 Koin 執行個體中建立其作用域，因此不會遵循 `KoinIsolatedContext`。請改為在隔離區塊內部使用 `KoinScope`（請參閱 [Compose 中的作用域](/docs/reference/koin-compose/compose-scopes)）。
- **Compose 外部的程式碼**：SDK 類別透過其建構函式從隔離執行個體接收其相依性。若 Compose 外部的 SDK 入口點（`Service`、宿主呼叫的回呼）必須自行擷取相依性，則應使用覆寫 `getKoin()` 的 `KoinComponent`。請參閱[上下文隔離](/docs/reference/koin-core/context-isolation)。
- **生命週期**：`KoinIsolatedContext` 不會啟動或停止該執行個體。您必須自行管理其生命週期。

## 相關內容 {id="related"}

- [上下文隔離](/docs/reference/koin-core/context-isolation)：建立隔離的 Koin 執行個體與自訂 `KoinComponent`。
- [Koin for Compose](/docs/reference/koin-compose/compose)：`KoinApplication` 與 `koinInject()`。
- [Compose 中的作用域](/docs/reference/koin-compose/compose-scopes)：隔離區塊內部的作用域。
- [Ktor 中的隔離上下文](/docs/reference/koin-ktor/ktor-isolated)：適用於 Ktor 伺服器的相同概念。