---
title: 高级 Android 模式
---

# 高级 Android 模式

本页面汇总了仅适用于 Android 的模式：按构建类型（build type）或 flavor 选择实现，以及声明需要当前 Activity 的 UI 帮助程序。适用于所有平台的模式（集合、泛型、装饰器、provider）请参阅[高级模式](/docs/reference/koin-core/advanced-patterns)。作用域链接请参阅[作用域](/docs/reference/koin-core/scopes)。

## 按构建变体的实现 {id="implementations-per-build-variant"}

### 使用 BuildConfig {id="with-buildconfig"}

在 provider 函数中选择实现：

**编译器插件 DSL**
```kotlin
import org.koin.plugin.module.dsl.create

fun analytics(context: Context): Analytics =
    if (BuildConfig.ENABLE_ANALYTICS) FirebaseAnalyticsTracker(context) else NoOpAnalytics()

val analyticsModule = module {
    single { create(::analytics) }
}
```

**注解**
```kotlin
@Module
class AnalyticsModule {

    @Singleton
    fun analytics(context: Context): Analytics =
        if (BuildConfig.ENABLE_ANALYTICS) FirebaseAnalyticsTracker(context) else NoOpAnalytics()
}
```

**构造函数 / 经典 DSL**
```kotlin
val analyticsModule = module {
    single<Analytics> {
        if (BuildConfig.ENABLE_ANALYTICS) FirebaseAnalyticsTracker(androidContext()) else NoOpAnalytics()
    }
}
```

`ENABLE_ANALYTICS` 是按构建类型或 flavor 设置的 `buildConfigField`。`BuildConfig.DEBUG` 的工作方式与之相同。两种实现都会编译到每个变体中；但只会创建其中一个。

### 使用源集 {id="with-source-sets"}

为了避免将仅用于调试的代码打包进发布版 APK 中，可以在各个变体源集中声明同名的 Koin 模块：

```kotlin
// src/debug/kotlin/com/app/di/VariantModule.kt
val variantModule = module {
    single<Logger> { VerboseLogger() }
    single<NetworkInspector> { ChuckerInspector(androidContext()) }
}
```

```kotlin
// src/release/kotlin/com/app/di/VariantModule.kt
val variantModule = module {
    single<Logger> { CrashlyticsLogger() }
    single<NetworkInspector> { NoOpInspector() }
}
```

```kotlin
// src/main
startKoin {
    androidContext(this@MainApplication)
    modules(appModule, variantModule)
}
```

`src/main` 在每次构建时只会看到一个 `variantModule`，因此在两种变体中都能编译通过。每个变体仅包含自身的实现及其依赖库（对于仅用于调试的依赖项，请使用 `debugImplementation`）。

## 需要 Activity 的 UI 帮助程序 {id="ui-helpers-that-need-the-activity"}

某些帮助程序需要的是当前的 Activity，而不是 Application：例如对话框、权限请求，以及任何使用 Activity 主题的组件。使用 Application 上下文构建的 `AlertDialog` 在显示时会失败。请在 Activity 作用域中声明这些帮助程序，在该作用域内 `Context` 会解析为 Activity：

**编译器插件 DSL**
```kotlin
class DialogProvider(private val context: Context) {

    fun confirm(title: String, onConfirm: () -> Unit): AlertDialog =
        AlertDialog.Builder(context)
            .setTitle(title)
            .setPositiveButton(android.R.string.ok) { _, _ -> onConfirm() }
            .create()
}

val uiModule = module {
    activityScope {
        scoped<DialogProvider>()
    }
}
```

**注解**
```kotlin
@ActivityScope
class DialogProvider(private val context: Context) {

    fun confirm(title: String, onConfirm: () -> Unit): AlertDialog =
        AlertDialog.Builder(context)
            .setTitle(title)
            .setPositiveButton(android.R.string.ok) { _, _ -> onConfirm() }
            .create()
}
```

**构造函数 / 经典 DSL**
```kotlin
val uiModule = module {
    activityScope {
        scopedOf(::DialogProvider)
    }
}
```

```kotlin
class SettingsActivity : ScopeActivity() {

    private val dialogs: DialogProvider by inject()

    fun onResetClicked() {
        dialogs.confirm("Reset settings?") { resetSettings() }.show()
    }
}
```

该 Activity 必须拥有作用域（`ScopeActivity` 或 `AndroidScopeComponent`）。如果从没有作用域的 Activity 中请求，将无法找到 `DialogProvider`。作用域会随 Activity 一同关闭，因此该帮助程序的生命周期绝不会超过 Activity。请参阅 [Android 作用域](/docs/reference/koin-android/scope)。

切勿将此类帮助程序声明为 `single`：`single` 会从根作用域解析其依赖项（此时 `Context` 为 Application），而且无论如何它的生命周期都会超出 Activity。

## 相关内容 {id="related"}

- [高级模式](/docs/reference/koin-core/advanced-patterns)：适用于所有平台的集合、泛型、装饰器以及 provider。
- [Android 作用域](/docs/reference/koin-android/scope)：Activity 和 Fragment 作用域，以及 `Context` 所解析到的目标。
- [Android 最佳做法](/docs/reference/koin-android/best-practices)：Context 泄漏与内存。
- [故障排除](/docs/reference/koin-core/troubleshooting)：循环依赖与解析错误。