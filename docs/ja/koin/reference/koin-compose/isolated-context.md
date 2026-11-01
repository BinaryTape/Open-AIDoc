---
title: Composeにおける分離コンテキスト (Isolated Context)
---

# Composeにおける分離コンテキスト (Isolated Context)

このページでは、`KoinIsolatedContext` を使用して、Compose関数が分離されたKoinインスタンスから依存関係を解決（resolve）する方法を説明します。Composableを提供するSDKやライブラリを構築しており、ホストアプリのKoinコンテナを共有してはならない場合に使用してください。分離コンテキストとは何か、およびその作成方法については、[Context Isolation](/docs/reference/koin-core/context-isolation) で解説されています。

## KoinIsolatedContext {id="koinisolatedcontext"}

[Context Isolation](/docs/reference/koin-core/context-isolation) で説明されているように、分離された `KoinApplication` を静的ホルダーに保持します:

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

SDKのUIを `KoinIsolatedContext` でラップします:

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
    val viewModel = koinViewModel<PaymentViewModel>() // SDKのKoinから解決される
    // ...
}
```

ブロック内では、`koinInject()`、`koinViewModel()`、`getKoin()`、`currentKoinScope()`、および `rememberKoinModules()` が分離されたインスタンスを使用します。ブロックの外側では、ホストアプリ自身のKoinが保持されます。

## 同じ画面内でのホストとSDKの共存 {id="host-and-sdk-in-the-same-screen"}

ホストの依存関係はブロックの外側で解決し、SDKの依存関係は内側で解決します:

```kotlin
@Composable
fun CheckoutScreen() {
    val analytics = koinInject<HostAnalytics>() // ホストアプリのKoin

    KoinIsolatedContext(context = PaymentSdkKoin.koinApp) {
        val processor = koinInject<PaymentProcessor>() // SDKのKoin
        PaymentButton(processor, onEvent = { analytics.track(it) })
    }
}
```

2つのコンテナは互いを認識しません。境界を越えて値を渡すには、パラメータやコールバックを使用します。

## 初期化とシャットダウン {id="initialization-and-shutdown"}

SDKがホストからの設定を必要とする場合は、`initialize` 関数内で `KoinApplication` を作成し、シャットダウン時にクローズします:

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

ホストは、SDKの画面が表示される前に、例えば `Application.onCreate()` などで `PaymentSdk.initialize(...)` を1度だけ呼び出します。

## 制限事項 {id="limits"}

- **KoinNavigationScope**: グローバルのKoinインスタンス内にスコープを作成するため、`KoinIsolatedContext` には追従しません。代わりに分離ブロック内で `KoinScope` を使用してください（[Scopes in Compose](/docs/reference/koin-compose/compose-scopes) を参照）。
- **Compose外のコード**: SDKのクラスは、分離されたインスタンスからコンストラクタ経由で依存関係を受け取ります。Compose外のSDKエントリポイント（`Service` やホストから呼び出されるコールバックなど）で自身で依存関係を取得する必要がある場合は、`getKoin()` をオーバーライドした `KoinComponent` を使用します。[Context Isolation](/docs/reference/koin-core/context-isolation) を参照してください。
- **ライフサイクル**: `KoinIsolatedContext` はインスタンスの開始や停止を行いません。ライフタイムの管理は開発者自身が行う必要があります。

## 関連情報 {id="related"}

- [Context Isolation](/docs/reference/koin-core/context-isolation): 分離されたKoinインスタンスとカスタム `KoinComponent` の作成。
- [Koin for Compose](/docs/reference/koin-compose/compose): `KoinApplication` と `koinInject()`。
- [Scopes in Compose](/docs/reference/koin-compose/compose-scopes): 分離ブロック内でのスコープ。
- [Isolated Context in Ktor](/docs/reference/koin-ktor/ktor-isolated): Ktorサーバーにおける同様のコンセプト。