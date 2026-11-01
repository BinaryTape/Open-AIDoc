---
title: Android 最佳实践
---

# Android 最佳实践

本页列出了在 Android 上使用 Koin 时会导致内存泄漏、崩溃或敏感信息泄露的特有问题，以及如何避免它们。本文假设你已了解 [Android 作用域](/docs/reference/koin-android/scope) 与 [在 Android 上启动 Koin](/docs/reference/koin-android/start)。常规模块组织方式请参阅 [模块](/docs/reference/koin-core/modules)，错误消息的说明请参阅 [故障排除](/docs/reference/koin-core/troubleshooting)。

## 内存与 Context 泄漏 {id="memory-and-context-leaks"}

当生命周期更长的对象持有了生命周期较短对象的引用时，就会发生实例泄漏。在 Android 上，最常见的受害者是 Activity：`single` 的生命周期与进程相同，而 Activity 仅能存活至下一次屏幕旋转。

### 将 Activity 传递给 single {id="activity-passed-into-a-single"}

```kotlin
// 导致泄漏：该 single 将永久持有第一个 Activity
class UserActivity : AppCompatActivity() {
    private val tracker: ScreenTracker by inject { parametersOf(this) }
}

val appModule = module {
    single { params -> ScreenTracker(params.get<Activity>()) }
}
```

`single` 仅会被创建一次，并使用首次调用时的形参。后续调用将获取同一个实例，且仍持有第一个 Activity。请改用以下替代方案之一：

- Application 上下文：如果类仅需要访问资源或系统服务，请将其声明为带有 `Context` 的 `single`。在 `single` 中，`Context` 即为 `Application`。
- Activity 作用域：当类需要 Activity 时，请在 `activityScope { }` 中或通过 `@ActivityScope` 进行声明。它会针对每个 Activity 创建，并随之释放。
- 带形参的 Factory：当调用方传递 Activity 时，请使用 `factory`，并且不要使结果的存活期超出该 Activity 的生命周期。

编译器插件将 `Context`、`Activity`、`Application`、`Fragment` 和 `SavedStateHandle` 视为平台提供的类型，因此不会将它们报告为缺失。但它也无法判断在给定的定义中 `Activity` 形参是否安全：请在代码审查时对此进行检查。

### 被单例持有的监听器 {id="listeners-held-by-singletons"}

```kotlin
class UserRepository {
    private val listeners = mutableListOf<UserListener>()

    fun addListener(listener: UserListener) { listeners += listener }
    fun removeListener(listener: UserListener) { listeners -= listener }
}
```

Repository 通常为 `single`。如果 Activity 或 Fragment 将自身注册为监听器且从未将其移除，该 Repository 就会导致该页面无法被回收。请在对应的生命周期回调中移除监听器（在 `onStart()` 注册的在 `onStop()` 中移除，在 `onViewCreated()` 注册的在 `onDestroyView()` 中移除），或者公开一个 `Flow` 并使用 `repeatOnLifecycle` 进行收集，它会自动为你取消收集。

### 存活时间超出其所有者的作用域实例 {id="scoped-instances-that-outlive-their-owner"}

- Retained 作用域：`activityRetainedScope` 在屏幕旋转时仍然存活。其内部实例绝不能引用 Activity、View 或 Fragment。
- Fragment 作用域：它在 `onDestroyView()` 之后的 `onDestroy()` 中关闭。切勿在 Fragment 作用域的实例中持有 View 或 Binding。
- ViewModel：切勿将 Activity 作用域或 Fragment 作用域的实例注入到 ViewModel 中。ViewModel 在屏幕旋转后仍然存活，而 Activity 作用域则不会。

这些规则已在 [Android 作用域](/docs/reference/koin-android/scope) 中进行了说明。

### 自行创建的作用域 {id="scopes-you-create-yourself"}

`activityScope()`、`fragmentScope()`、`ScopeActivity`、`ScopeFragment` 和 `ScopeService` 会随生命周期关闭其作用域。通过 `getKoin().createScope()` 创建的作用域没有关联生命周期：必须自行关闭它，否则其中的所有实例都会常驻内存。

```kotlin
// 登录时
val sessionScope = getKoin().createScope<UserSession>(userId)

// 注销时
sessionScope.close()
```

## 在 Android 上进行调试 {id="debugging-on-android"}

在排查问题时，可启用调试级别的 Logcat 日志记录器：

```kotlin
startKoin {
    androidLogger(Level.DEBUG)
    androidContext(this@MainApplication)
    modules(appModule)
}
```

根据 `[Koin]` 标记筛选 Logcat。在 debug 级别下，Koin 会记录每次模块加载、每次解析及其耗时，以及每个作用域的打开或关闭。在 release 构建中，请使用 `Level.ERROR` 或 `Level.NONE`。

仅在 Android 上出现的错误：

| 错误 | 常见原因 |
|-------|-------------|
| `MissingAndroidContextException` | `startKoin` 中缺少 `androidContext()` |
| `KoinApplication has not been started` | 清单文件中未声明 `Application` 类，或者某个 ContentProvider 在其 `onCreate()` 中执行了注入（参见 [Android 入口点](/docs/reference/koin-android/entry-points#contentprovider)） |
| 作用域类型的 `NoDefinitionFoundException` | Activity 或 Fragment 没有作用域（`ScopeActivity`、`AndroidScopeComponent`） |
| `ClosedScopeException` | 代码在作用域已关闭的 `onDestroy()` 中或之后解析作用域实例。请在 `onCloseScope()` 中执行清理工作 |
| Workers 失败并显示 "Could not instantiate" | 默认的 WorkManager 初始化器仍保留在清单文件中（参见 [WorkManager](/docs/reference/koin-android/workmanager)） |

如果使用编译器插件，缺失的定义将在构建时被报告（参见 [编译时安全性](/docs/reference/koin-compiler/compile-safety)）。

:::tip
若要查看真实用户会话中的解析时间、作用域生命周期和 Koin 错误，请参阅 [生产环境监控](/docs/tooling/production-monitoring)。
:::

## 敏感信息 {id="secrets"}

APK 可以被解压缩。编译进 APK 或存储在 `assets/` 中的任何内容都可以被读取：

- 硬编码密钥：切勿在模块中将 API 密钥写为字符串文字。
- Koin 属性：`androidFileProperties()` 会读取打包在 APK 内的 `assets/koin.properties`。只能将其用于配置，绝不能用于机密。
- `BuildConfig` 字段：它们同样会被编译进 APK 中。它们只能对源代码管理隐藏对应的值，而无法在 APK 中隐藏。

请在运行时从后端获取机密，或将令牌保存在加密存储中，并注入存储对象而非直接注入该值：

```kotlin
class AuthInterceptor(private val tokens: TokenStore) : Interceptor {
    override fun intercept(chain: Interceptor.Chain): Response =
        chain.proceed(
            chain.request().newBuilder()
                .header("Authorization", "Bearer ${tokens.currentToken()}")
                .build()
        )
}
```

`TokenStore` 是一个由加密存储支持的 `single`，而 `AuthInterceptor` 会被添加到 `OkHttpClient` 的定义中（参见 [Android 库集成](/docs/reference/koin-android/binding-patterns)）。

## 从 Hilt 或 Dagger 迁移 {id="migrating-from-hilt-or-dagger"}

注解映射、模块迁移及渐进式迁移均在 [从 Hilt 迁移](/docs/reference/koin-android/hilt-migration) 中有详细介绍。若要保留 `@Inject` 和 `jakarta.inject` 注解，请参阅 [JSR-330 注解](/docs/reference/koin-android/jsr330)。

## 相关内容 {id="related"}

- [Android 作用域](/docs/reference/koin-android/scope)：Activity、Fragment、retained 以及 ViewModel 作用域的生命周期。
- [在 Android 上启动 Koin](/docs/reference/koin-android/start)：`androidContext()`、日志记录和属性。
- [故障排除](/docs/reference/koin-core/troubleshooting)：解析错误和循环依赖。
- [延迟模块](/docs/reference/koin-core/lazy-modules)：减少应用启动时 Koin 的工作量。
- [从 Hilt 迁移](/docs/reference/koin-android/hilt-migration)：将现有的 Hilt 应用迁移到 Koin。