---
title: Androidの高度なパターン
---

このガイドでは、Koinを使用したAndroid特有の高度な依存関係注入（DI）パターンについて説明します。

:::info
プラットフォームに依存しないパターン（コレクション、デコレータ、ジェネリック型、循環依存関係）については、[定義](/docs/reference/koin-core/definitions) および [モジュール](/docs/reference/koin-core/modules) を参照してください。
:::

## シングルトンにおけるAndroidコンテキスト

### Activityリークの回避

```kotlin
// ❌ 悪い例 - シングルトンを通じてActivityがリークする
module {
    single { SomeService(get<Activity>()) }
}

// ✅ 良い例 - Applicationコンテキストを使用する
module {
    single { SomeService(androidContext()) }
}

// ✅ 良い例 - Activityに紐づく依存関係にはscopedを使用する
module {
    activityScope {
        scoped { ActivityBoundService() }
    }
}
```

### コンテキストの種類

```kotlin
module {
    // Applicationコンテキスト - シングルトンに対して安全
    single { DatabaseHelper(androidContext()) }

    // Applicationインスタンス
    single { AppConfig(androidApplication()) }
}
```

## BuildConfigによる条件付きバインディング

### ビルドバリアント

```kotlin
fun createLogger(): Logger =
    if (BuildConfig.DEBUG) DebugLogger() else ReleaseLogger()

val loggingModule = module {
    single { create(::createLogger) }
}
```

アノテーションを使用する場合：

```kotlin
@Module
class LoggingModule {
    @Single
    fun provideLogger(): Logger =
        if (BuildConfig.DEBUG) DebugLogger() else ReleaseLogger()
}
```

### アナリティクスの切り替え

```kotlin
fun createAnalyticsService(): AnalyticsService =
    if (BuildConfig.ENABLE_ANALYTICS) GoogleAnalytics() else NoOpAnalytics()

val analyticsModule = module {
    single { create(::createAnalyticsService) }
}
```

### フィーチャーフラグ

```kotlin
@Singleton
class PaymentProcessor(
    private val featureFlags: FeatureFlagService,
    private val newProcessor: NewPaymentProcessor,
    private val legacyProcessor: LegacyPaymentProcessor
) {
    fun process(amount: Double) {
        if (featureFlags.isEnabled("new_payment_flow")) {
            newProcessor.process(amount)
        } else {
            legacyProcessor.process(amount)
        }
    }
}
```

## Androidダイアログプロバイダー

Android UIコンポーネント用のファクトリを作成します。

```kotlin
@Factory
class DialogProvider(private val context: Context) {

    fun createConfirmDialog(title: String, onConfirm: () -> Unit): AlertDialog =
        AlertDialog.Builder(context)
            .setTitle(title)
            .setPositiveButton("OK") { _, _ -> onConfirm() }
            .create()

    fun createErrorDialog(message: String): AlertDialog =
        AlertDialog.Builder(context)
            .setTitle("Error")
            .setMessage(message)
            .setPositiveButton("OK", null)
            .create()
}

class MainActivity : AppCompatActivity() {
    private val dialogProvider: DialogProvider by inject()

    fun showConfirmation() {
        dialogProvider.createConfirmDialog("Confirm") { /* アクション */ }.show()
    }
}
```

## 階層型スコープ

共有アクセスのためにAndroidのスコープをリンクします。

```kotlin
val appModule = module {
    single { Database() }

    scope(named("session")) {
        scoped { UserSession() }
    }

    scope(named("shopping")) {
        scoped { ShoppingCart(get()) }
    }
}

// スコープの作成とリンク
val sessionScope = getKoin().createScope("user_session", named("session"))
val shoppingScope = getKoin().createScope("cart", named("shopping"))
shoppingScope.linkTo(sessionScope)

// ShoppingCartはリンクされたスコープからUserSessionにアクセス可能
val cart = shoppingScope.get<ShoppingCart>()
```

## 動的機能レジストリ

設定に基づいてコレクションを構築します。

```kotlin
@Singleton
class FeatureRegistry(private val config: AppConfig) : KoinComponent {

    fun getEnabledFeatures(): `List<Feature>` {
        return config.enabledFeatures.mapNotNull { name ->
            getKoin().getOrNull<Feature>(named(name))
        }
    }
}
```

## Androidにおける一般的な落とし穴

### 隠れた循環呼び出し

```kotlin
// ⚠️ Lazyは循環を隠しますが、実行時に無限ループが発生します
class ServiceA : KoinComponent {
    private val serviceB: ServiceB by inject()
    fun doA() { serviceB.doB() }
}

class ServiceB : KoinComponent {
    private val serviceA: ServiceA by inject()
    fun doB() { serviceA.doA() }  // 無限ループ！
}
```

### ViewModelスコープの混同

```kotlin
// ❌ 悪い例 - activityScope内のViewModelは画面回転時に状態を失います
module {
    activityScope {
        scoped { UserViewModel(get()) }
    }
}

// ✅ 良い例 - 適切なライフサイクルのためにviewModelを使用します
module {
    viewModel { UserViewModel(get()) }
}
```

### シングルトンへのActivity注入

```kotlin
// ❌ メモリリーク - シングルトン内にActivityの参照がある
@Singleton
class ImageLoader(private val activity: Activity)

// ✅ Applicationコンテキストを使用する
@Singleton
class ImageLoader(private val context: Context)  // androidContext() 経由のApplicationコンテキスト
```

## 次のステップ

- **[Androidスコープ](/docs/reference/koin-android/scope)** - ライフサイクルを考慮したスコープ管理
- **[マルチモジュールアプリ](/docs/reference/koin-android/multi-module)** - Androidモジュールの整理
- **[ベストプラクティス](/docs/reference/koin-android/best-practices)** - メモリ管理と移行