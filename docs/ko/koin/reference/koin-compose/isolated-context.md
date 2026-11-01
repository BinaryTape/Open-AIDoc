---
title: Compose의 격리된 컨텍스트(Isolated Context)
---

# Compose의 격리된 컨텍스트(Isolated Context)

이 페이지에서는 `KoinIsolatedContext`를 사용하여 Compose 함수가 격리된 Koin 인스턴스로부터 의존성을 해결(resolve)하도록 만드는 방법을 설명합니다. Composable을 제공하며 호스트 앱의 Koin 컨테이너를 공유하지 않아야 하는 SDK나 라이브러리를 빌드할 때 이를 사용하세요. 격리된 컨텍스트가 무엇인지, 어떻게 생성하는지는 [Context Isolation](/docs/reference/koin-core/context-isolation)에서 설명합니다.

## KoinIsolatedContext {id="koinisolatedcontext"}

[Context Isolation](/docs/reference/koin-core/context-isolation)에 설명된 대로, 격리된 `KoinApplication`을 정적 홀더(static holder)에 보관합니다:

**Compiler Plugin DSL**
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

**Annotations**
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

**Constructor / Classic DSL**
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

SDK UI를 `KoinIsolatedContext`로 감쌉니다:

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
    val viewModel = koinViewModel<PaymentViewModel>() // SDK의 Koin에서 해결됨
    // ...
}
```

블록 내부에서는 `koinInject()`, `koinViewModel()`, `getKoin()`, `currentKoinScope()`, `rememberKoinModules()`가 격리된 인스턴스를 사용합니다. 블록 외부에서는 호스트 앱이 자체 Koin을 유지합니다.

## 동일한 화면에서의 호스트와 SDK {id="host-and-sdk-in-the-same-screen"}

블록 외부에서는 호스트 의존성을 해결하고, 블록 내부에서는 SDK 의존성을 해결합니다:

```kotlin
@Composable
fun CheckoutScreen() {
    val analytics = koinInject<HostAnalytics>() // 호스트 앱의 Koin

    KoinIsolatedContext(context = PaymentSdkKoin.koinApp) {
        val processor = koinInject<PaymentProcessor>() // SDK의 Koin
        PaymentButton(processor, onEvent = { analytics.track(it) })
    }
}
```

두 컨테이너는 서로를 참조하지 못합니다. 매개변수와 콜백을 통해 경계를 넘어 값을 전달하세요.

## 초기화 및 종료 {id="initialization-and-shutdown"}

SDK에 호스트의 설정이 필요한 경우, `initialize` 함수에서 `KoinApplication`을 생성하고 종료 시 닫습니다:

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

호스트는 SDK 화면이 표시되기 전에 `Application.onCreate()` 등에서 `PaymentSdk.initialize(...)`를 한 번 호출합니다.

## 제한 사항 {id="limits"}

- **KoinNavigationScope**: 전역 Koin 인스턴스에서 스코프를 생성하므로 `KoinIsolatedContext`를 따르지 않습니다. 대신 격리된 블록 내부에서 `KoinScope`를 사용하세요 ([Scopes in Compose](/docs/reference/koin-compose/compose-scopes) 참조).
- **Compose 외부의 코드**: SDK 클래스는 격리된 인스턴스로부터 생성자를 통해 의존성을 주입받습니다. 직접 의존성을 가져와야 하는 Compose 외부의 SDK 진입점(`Service`, 호스트가 호출하는 콜백 등)은 `getKoin()`을 재정의(override)하는 `KoinComponent`를 사용합니다. [Context Isolation](/docs/reference/koin-core/context-isolation)을 참조하세요.
- **수명 주기(Lifecycle)**: `KoinIsolatedContext`는 인스턴스를 시작하거나 중지하지 않습니다. 인스턴스의 수명 주기는 사용자가 직접 관리해야 합니다.

## 관련 문서 {id="related"}

- [Context Isolation](/docs/reference/koin-core/context-isolation): 격리된 Koin 인스턴스 및 커스텀 `KoinComponent` 생성.
- [Koin for Compose](/docs/reference/koin-compose/compose): `KoinApplication` 및 `koinInject()`.
- [Scopes in Compose](/docs/reference/koin-compose/compose-scopes): 격리된 블록 내부의 스코프.
- [Isolated Context in Ktor](/docs/reference/koin-ktor/ktor-isolated): Ktor 서버를 위한 동일한 개념.