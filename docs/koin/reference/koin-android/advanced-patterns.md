---
title: 高级 Android 模式
---

本指南涵盖了使用 Koin 的 Android 特有高级依赖项注入模式。

:::info
有关平台无关的模式（集合、装饰器、泛型类型、循环依赖），请参阅 [定义 (Definitions)](/docs/reference/koin-core/definitions) 和 [模块 (Modules)](/docs/reference/koin-core/modules)。
:::

## 单例中的 Android Context

### 避免 Activity 泄漏

```kotlin
// ❌ 错误 - Activity 通过单例泄漏
module {
    single { SomeService(get<Activity>()) }
}

// ✅ 正确 - 使用 Application context
module {
    single { SomeService(androidContext()) }
}

// ✅ 正确 - 对绑定到 Activity 的依赖项使用作用域
module {
    activityScope {
        scoped { ActivityBoundService() }
    }
}
```

### Context 类型

```kotlin
module {
    // Application context - 对单例安全
    single { DatabaseHelper(androidContext()) }

    // Application 实例
    single { AppConfig(androidApplication()) }
}
```

## 使用 BuildConfig 进行条件绑定

### 构建变体

```kotlin
fun createLogger(): Logger =
    if (BuildConfig.DEBUG) DebugLogger() else ReleaseLogger()

val loggingModule = module {
    single { create(::createLogger) }
}
```

或使用注解：

```kotlin
@Module
class LoggingModule {
    @Single
    fun provideLogger(): Logger =
        if (BuildConfig.DEBUG) DebugLogger() else ReleaseLogger()
}
```

### 分析开关

```kotlin
fun createAnalyticsService(): AnalyticsService =
    if (BuildConfig.ENABLE_ANALYTICS) GoogleAnalytics() else NoOpAnalytics()

val analyticsModule = module {
    single { create(::createAnalyticsService) }
}
```

### 功能标志

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

## Android Dialog 提供程序

为 Android UI 组件创建工厂：

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

## 分层作用域

链接 Android 作用域以实现共享访问：

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

// 创建并链接作用域
val sessionScope = getKoin().createScope("user_session", named("session"))
val shoppingScope = getKoin().createScope("cart", named("shopping"))
shoppingScope.linkTo(sessionScope)

// 购物车可以从链接的作用域访问 UserSession
val cart = shoppingScope.get<ShoppingCart>()
```

## 动态功能注册表

根据配置构建集合：

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

## 常见的 Android 陷阱

### 隐藏的循环调用

```kotlin
// ⚠️ Lazy 隐藏了循环，但在运行时会导致死循环
class ServiceA : KoinComponent {
    private val serviceB: ServiceB by inject()
    fun doA() { serviceB.doB() }
}

class ServiceB : KoinComponent {
    private val serviceA: ServiceA by inject()
    fun doB() { serviceA.doA() }  // 死循环！
}
```

### ViewModel 作用域混淆

```kotlin
// ❌ 错误 - Activity 作用域中的 ViewModel 在屏幕旋转时会丢失状态
module {
    activityScope {
        scoped { UserViewModel(get()) }
    }
}

// ✅ 正确 - 使用 viewModel 以获得正确的生命周期
module {
    viewModel { UserViewModel(get()) }
}
```

### 在单例中注入 Activity

```kotlin
// ❌ 内存泄漏 - 单例中的 Activity 引用
@Singleton
class ImageLoader(private val activity: Activity)

// ✅ 使用 Application context
@Singleton
class ImageLoader(private val context: Context)  // 通过 androidContext() 获取 Application context
```

## 下一步

- **[Android 作用域](/docs/reference/koin-android/scope)** - 生命周期感知作用域
- **[多模块应用](/docs/reference/koin-android/multi-module)** - 组织 Android 模块
- **[最佳做法](/docs/reference/koin-android/best-practices)** - 内存管理与迁移