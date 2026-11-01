---
title: 高度なAndroidパターン
---

# 高度なAndroidパターン

このページでは、ビルドタイプやフレーバーごとの実装の選択や、現在のActivityを必要とするUIヘルパーの宣言など、Android固有のパターンをまとめています。すべてのプラットフォームで機能するパターン（コレクション、ジェネリクス、デコレーター、プロバイダー）については、[Advanced Patterns](/docs/reference/koin-core/advanced-patterns) を参照してください。スコープのリンクについては、[Scopes](/docs/reference/koin-core/scopes) を参照してください。

## ビルドバリアントごとの実装 {id="implementations-per-build-variant"}

### BuildConfig を使用する場合 {id="with-buildconfig"}

プロバイダー関数内で実装を選択します。

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

`ENABLE_ANALYTICS` は、ビルドタイプまたはフレーバーごとに設定される `buildConfigField` です。`BuildConfig.DEBUG` も同様に機能します。両方の実装がすべてのバリアントにコンパイルされますが、生成されるのは一方のみです。

### ソースセットを使用する場合 {id="with-source-sets"}

リリースAPKからデバッグ専用コードを除外するには、各バリアントのソースセットで同じKoinモジュールを宣言します。

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

`src/main` からはビルドごとに1つの `variantModule` が認識されるため、どちらのバリアントでもコンパイルできます。各バリアントには独自の実装とそのライブラリのみが含まれます（デバッグ専用の依存関係には `debugImplementation` を使用してください）。

## Activity を必要とするUIヘルパー {id="ui-helpers-that-need-the-activity"}

ダイアログ、パーミッションのリクエスト、Activityテーマを使用するものなど、一部のヘルパーは Application ではなく現在の Activity を必要とします。Application コンテキストで作成された `AlertDialog` は、表示時にエラーが発生します。これらのヘルパーは、`Context` が Activity として解決される Activity スコープで宣言してください。

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

Activity はスコープ（`ScopeActivity` または `AndroidScopeComponent`）を持つ必要があります。スコープを持たない Activity からは `DialogProvider` を見つけることができません。スコープは Activity と共に破棄されるため、ヘルパーが Activity よりも長く存続することはありません。詳細については、[Android Scopes](/docs/reference/koin-android/scope) を参照してください。

このようなヘルパーを `single` として宣言しないでください。`single` は `Context` が Application となるルートスコープから依存関係を解決するため、どちらにしても Activity よりも長く存続してしまいます。

## 関連情報 {id="related"}

- [Advanced Patterns](/docs/reference/koin-core/advanced-patterns): すべてのプラットフォームにおけるコレクション、ジェネリクス、デコレーター、プロバイダー。
- [Android Scopes](/docs/reference/koin-android/scope): Activity および Fragment のスコープと、`Context` の解決について。
- [Android Best Practices](/docs/reference/koin-android/best-practices): Context のリークとメモリ。
- [Troubleshooting](/docs/reference/koin-core/troubleshooting): 循環依存と解決エラー。