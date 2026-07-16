---
title: 進階 Android 模式
---

本指南涵蓋了使用 Koin 的 Android 特定進階相依注入模式。

:::info
關於與平台無關的模式（集合、decorator、泛型型別、循環相依），請參閱 [Definitions](/docs/reference/koin-core/definitions) 與 [Modules](/docs/reference/koin-core/modules)。
:::

## Singleton 中的 Android Context

### 避免 Activity 洩漏

```kotlin
// ❌ 錯誤 - Activity 透過 singleton 洩漏
module {
    single { SomeService(get<Activity>()) }
}

// ✅ 正確 - 使用 Application context
module {
    single { SomeService(androidContext()) }
}

// ✅ 正確 - 對於綁定 Activity 的相依項使用 scoped
module {
    activityScope {
        scoped { ActivityBoundService() }
    }
}
```

### Context 型別

```kotlin
module {
    // Application context - 對 singleton 來說是安全的
    single { DatabaseHelper(androidContext()) }

    // Application 執行個體
    single { AppConfig(androidApplication()) }
}
```

## 使用 BuildConfig 的條件綁定

### 組建變體

```kotlin
fun createLogger(): Logger =
    if (BuildConfig.DEBUG) DebugLogger() else ReleaseLogger()

val loggingModule = module {
    single { create(::createLogger) }
}
```

或使用註解：

```kotlin
@Module
class LoggingModule {
    @Single
    fun provideLogger(): Logger =
        if (BuildConfig.DEBUG) DebugLogger() else ReleaseLogger()
}
```

### 分析切換

```kotlin
fun createAnalyticsService(): AnalyticsService =
    if (BuildConfig.ENABLE_ANALYTICS) GoogleAnalytics() else NoOpAnalytics()

val analyticsModule = module {
    single { create(::createAnalyticsService) }
}
```

### 功能旗標

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

## Android Dialog 提供者

為 Android UI 元件建立工廠：

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
        dialogProvider.createConfirmDialog("Confirm") { /* action */ }.show()
    }
}
```

## 階層式作用域

連結 Android 作用域以進行共用存取：

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

// 建立並連結作用域
val sessionScope = getKoin().createScope("user_session", named("session"))
val shoppingScope = getKoin().createScope("cart", named("shopping"))
shoppingScope.linkTo(sessionScope)

// Shopping cart 可以存取來自連結作用域的 UserSession
val cart = shoppingScope.get<ShoppingCart>()
```

## 動態功能註冊表

根據配置建立集合：

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

## 常見的 Android 陷阱

### 隱藏的循環呼叫

```kotlin
// ⚠️ Lazy 隱藏了循環，但在執行時會發生無限迴圈
class ServiceA : KoinComponent {
    private val serviceB: ServiceB by inject()
    fun doA() { serviceB.doB() }
}

class ServiceB : KoinComponent {
    private val serviceA: ServiceA by inject()
    fun doB() { serviceA.doA() }  // 無限迴圈！
}
```

### ViewModel 作用域混淆

```kotlin
// ❌ 錯誤 - activity 作用域中的 ViewModel 會在旋轉時遺失狀態
module {
    activityScope {
        scoped { UserViewModel(get()) }
    }
}

// ✅ 正確 - 使用 viewModel 以獲得正確的生命週期
module {
    viewModel { UserViewModel(get()) }
}
```

### 在 Singleton 中注入 Activity

```kotlin
// ❌ 記憶體洩漏 - singleton 中的 Activity 參照
@Singleton
class ImageLoader(private val activity: Activity)

// ✅ 使用 Application context
@Singleton
class ImageLoader(private val context: Context)  // 透過 androidContext() 取得 Application context
```

## 下一步

- **[Android 作用域](/docs/reference/koin-android/scope)** - 生命週期感知的範圍限制
- **[多模組應用程式](/docs/reference/koin-android/multi-module)** - 組織 Android 模組
- **[最佳實務](/docs/reference/koin-android/best-practices)** - 記憶體管理與遷移