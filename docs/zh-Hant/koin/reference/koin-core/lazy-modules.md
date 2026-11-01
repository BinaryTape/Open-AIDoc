---
title: Lazy 模組
---

# Lazy 模組

Lazy 模組是指 Koin 在背景協同程式（而不是在 `startKoin` 期間）中註冊的模組。本頁面涵蓋宣告 Lazy 模組、並行載入模組、等待模組載入完成，以及此功能的限制。本文預設您已瞭解[模組](/docs/reference/koin-core/modules)與[啟動 Koin](/docs/reference/koin-core/starting-koin)。

## 相依性 {id="dependency"}

Lazy 模組包含在 `koin-core-coroutines` 構件中：

```kotlin
// build.gradle.kts
implementation("io.insert-koin:koin-core-coroutines")
```

## 宣告 Lazy 模組 {id="declaring-a-lazy-module"}

`lazyModule` 接收與 `module` 相同的內容。在 Koin 載入它之前，不會建立或分配任何內容。

**編譯器外掛程式 DSL**
```kotlin
import org.koin.dsl.lazyModule
import org.koin.plugin.module.dsl.*

val analyticsModule = lazyModule {
    single<AnalyticsService>()
    single<EventTracker>()
}
```

**註解**
註解模組（`@Module`）會在啟動時載入，無法宣告為 Lazy 模組。若要在背景載入某些定義，請使用任何一種 DSL 形式（編譯器外掛程式、建構函式或傳統 DSL）在 `lazyModule` 中宣告它們。

**建構函式／傳統 DSL**
```kotlin
import org.koin.dsl.lazyModule
import org.koin.core.module.dsl.*

val analyticsModule = lazyModule {
    singleOf(::AnalyticsService)
    singleOf(::EventTracker)
}
```

Lazy 模組可以包含其他 Lazy 模組：

```kotlin
val dataModule = lazyModule {
    single<UserRepository>()
}

val featureModule = lazyModule {
    includes(dataModule)
    single<FeatureService>()
}
```

## 載入 Lazy 模組 {id="loading-lazy-modules"}

在 `startKoin` 中將 Lazy 模組傳遞給 `lazyModules()`。位於 `modules()` 中的模組會在 `startKoin` 返回之前於呼叫端執行緒上載入。Lazy 模組則會在背景協同程式中載入：

```kotlin
startKoin {
    modules(coreModule)
    lazyModules(analyticsModule, reportingModule)
}
```

自 Koin 4.2 起，每個 Lazy 模組都會在各自的協同程式中載入，因此多個 Lazy 模組會並行載入。在 4.2 之前，它們是一個接一個依序載入的。

如有需要，`lazyModules()` 會設定 Koin 協同程式引擎。它在平台預設的 Dispatcher 上執行（JVM 與 Native 上為 `Dispatchers.Default`）。若要選擇其他 Dispatcher，請傳入 `dispatcher`：

```kotlin
startKoin {
    lazyModules(databaseModule, networkModule, dispatcher = Dispatchers.IO)
}
```

Dispatcher 是在首次呼叫 `lazyModules()` 建立協同程式引擎時設定的。後續呼叫中所傳入的 `dispatcher` 將不起作用。

## 等待 Lazy 模組 {id="waiting-for-lazy-modules"}

來自 Lazy 模組的定義在其模組載入完成之前是無法使用的。在解析該定義之前，請等待載入完成：

| 函式 | 平台 | 行為 |
|----------|----------|----------|
| `Koin.awaitAllStartJobs()` | 全部 | 掛起直到每個 Lazy 模組都載入完成 |
| `Koin.onKoinStarted { koin -> }` | 全部 | 掛起直到載入完成，接著執行該程式碼區塊 |
| `Koin.waitAllStartJobs()` | 全部 | 阻塞執行緒直到載入完成。在 JS 上不會阻塞並會記錄警告 |
| `Koin.runOnKoinStarted { koin -> }` | JVM | 阻塞直到載入完成，接著執行該程式碼區塊 |
| `Koin.isAllStartedJobsDone()` | 全部 | 當每個 Lazy 模組都載入完成時傳回 `true` |

從協同程式中：

```kotlin
suspend fun trackAppStart() {
    val koin = KoinPlatform.getKoin()
    koin.awaitAllStartJobs()
    koin.get<AnalyticsService>().trackAppStart()
}
```

從阻塞式程式碼中：

```kotlin
startKoin {
    lazyModules(analyticsModule)
}

KoinPlatform.getKoin().waitAllStartJobs()
val analytics = KoinPlatform.getKoin().get<AnalyticsService>()
```

:::warning
請勿在啟動期間於 Android 主執行緒上呼叫 `waitAllStartJobs()`：這會阻塞 UI 直到每個 Lazy 模組都載入完成，從而抵消了此功能的好處。請改為從協同程式中等待。
:::

## Android 範例 {id="android-example"}

使用 `modules()` 載入第一個畫面所需的項目，其餘則在背景載入：

```kotlin
class MainApplication : Application() {
    override fun onCreate() {
        super.onCreate()

        startKoin {
            androidContext(this@MainApplication)
            modules(coreModule)
            lazyModules(analyticsModule, databaseModule, dispatcher = Dispatchers.IO)
        }
    }
}
```

適合做為 Lazy 模組的對象：數據分析 (analytics)、當機報告 (crash reporting)、導覽步驟後續的功能，以及模組主體開銷較高的定義。任何第一個畫面需要解析的內容都應保留在 `modules()` 中。

## 限制 {id="limits"}

- **常規模組不能相依於 Lazy 模組**：如果常規模組中的定義相依於 Lazy 模組中的定義，在 Lazy 模組載入完成前進行解析將會失敗並拋出 `NoDefinitionFoundException`。Koin 不會為您檢查此情況。
- **Lazy 模組在啟動時載入**：`lazyModules()` 會立即在背景開始載入。它不會在首次使用時才載入模組。
- **僅限模組註冊**：延遲載入只是將模組註冊移出主執行緒。`single` 仍會在首次請求時，於發出請求的執行緒上建立。請避免在 Lazy 模組中使用 `createdAtStart`：Koin 會在 `startKoin` 結束時建立預先載入的執行個體，因此尚未載入的 Lazy 模組會錯過該步驟。
- **不支援註解**：`@Module` 類別不能宣告為 Lazy。

:::tip
若要在真實裝置上測量啟動與模組載入所需的時間，請參閱[生產環境監控](/docs/tooling/production-monitoring)。
:::

## 相關內容 {id="related"}

- [模組](/docs/reference/koin-core/modules)：模組宣告與 `includes()`。
- [啟動 Koin](/docs/reference/koin-core/starting-koin)：`startKoin` 與應用程式 DSL。
- [定義](/docs/reference/koin-core/definitions#eager-creation)：`createdAtStart` 與預先載入建立。
- [Android 設定](/docs/reference/koin-android/start)：在 Android `Application` 中啟動 Koin。
- [DSL 參考](/docs/reference/koin-core/dsl)：所有 DSL 關鍵字。