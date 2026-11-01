---
title: 進階 Android 模式
---

# 進階 Android 模式

本頁收集僅適用於 Android 的模式：依據組建類型 (build type) 或 flavor 選擇實作，以及宣告需要目前 Activity 的 UI 幫助程式。適用於所有平台的模式（集合、泛型、裝飾器、提供者）請參閱[進階模式](/docs/reference/koin-core/advanced-patterns)。作用域連結請參閱[作用域](/docs/reference/koin-core/scopes)。

## 依據組建變體的實作 {id="implementations-per-build-variant"}

### 使用 BuildConfig {id="with-buildconfig"}

在提供者函式中選擇實作：

**Compiler Plugin DSL**
```kotlin
import org.koin.plugin.module.dsl.create

fun analytics(context: Context): Analytics =
    if (BuildConfig.ENABLE_ANALYTICS) FirebaseAnalyticsTracker(context) else NoOpAnalytics()

val analyticsModule = module {
    single { create(::analytics) }
}
```

**Annotations**
```kotlin
@Module
class AnalyticsModule {

    @Singleton
    fun analytics(context: Context): Analytics =
        if (BuildConfig.ENABLE_ANALYTICS) FirebaseAnalyticsTracker(context) else NoOpAnalytics()
}
```

**Constructor / Classic DSL**
```kotlin
val analyticsModule = module {
    single<Analytics> {
        if (BuildConfig.ENABLE_ANALYTICS) FirebaseAnalyticsTracker(androidContext()) else NoOpAnalytics()
    }
}
```

`ENABLE_ANALYTICS` 是針對各個組建類型或 flavor 設定的 `buildConfigField`。`BuildConfig.DEBUG` 的運作方式也相同。這兩種實作都會被編譯進每個變體中，但只會建立其中一個。

### 使用原始碼集 {id="with-source-sets"}

若要避免僅用於 debug 的程式碼進入 release APK，請在每個變體原始碼集中宣告相同的 Koin 模組：

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

`src/main` 在每次組建中只會看到一個 `variantModule`，因此在兩者中都能編譯。每個變體只會隨附自己的實作及其程式庫（對於僅限 debug 的相依性，請使用 `debugImplementation`）。

## 需要 Activity 的 UI 幫助程式 {id="ui-helpers-that-need-the-activity"}

某些幫助程式需要的是目前的 Activity，而非 Application：例如對話方塊、權限請求，以及任何使用 Activity 佈景主題的元件。使用 Application context 建構的 `AlertDialog` 在顯示時會失敗。請在 Activity 作用域中宣告這些幫助程式，此時 `Context` 會解析為 Activity：

**Compiler Plugin DSL**
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

**Annotations**
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

**Constructor / Classic DSL**
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

Activity 必須具有作用域（`ScopeActivity` 或 `AndroidScopeComponent`）。若從沒有作用域的 Activity 中尋找，將會找不到 `DialogProvider`。該作用域會隨 Activity 一同關閉，因此幫助程式的生命週期絕不會超過 Activity。請參閱 [Android 作用域](/docs/reference/koin-android/scope)。

請勿將此類幫助程式宣告為 `single`：`single` 會從根作用域解析其相依性（此時 `Context` 為 Application），而且無論如何其生命週期都會超過 Activity。

## 相關內容 {id="related"}

- [進階模式](/docs/reference/koin-core/advanced-patterns)：適用於所有平台的集合、泛型、裝飾器與提供者。
- [Android 作用域](/docs/reference/koin-android/scope)：Activity 與 Fragment 作用域，以及 `Context` 解析的目標。
- [Android 最佳實務](/docs/reference/koin-android/best-practices)：Context 洩漏與記憶體。
- [疑難排解](/docs/reference/koin-core/troubleshooting)：循環相依性與解析錯誤。