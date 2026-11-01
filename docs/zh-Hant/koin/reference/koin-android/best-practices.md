---
title: Android 最佳實務
---

# Android 最佳實務

本頁列出在使用 Koin 時會導致洩漏、當機或機密資訊外洩的 Android 特定錯誤，以及如何避免這些錯誤。本文假設您已了解 [Android 作用域](/docs/reference/koin-android/scope) 與 [在 Android 上啟動 Koin](/docs/reference/koin-android/start)。一般的模組組織請參閱 [模組](/docs/reference/koin-core/modules)，錯誤訊息則在 [疑難排解](/docs/reference/koin-core/troubleshooting) 中說明。

## 記憶體與 Context 洩漏 {id="memory-and-context-leaks"}

當生命週期較長的物件保留了對某個執行個體的參照時，該執行個體就會發生洩漏。在 Android 上，常見的受害者是 Activity：`single` 的存活時間與行程一樣長，而 Activity 僅存活到下一次旋轉。

### 將 Activity 傳遞至 single {id="activity-passed-into-a-single"}

```kotlin
// 洩漏：single 會永遠保留第一個 Activity
class UserActivity : AppCompatActivity() {
    private val tracker: ScreenTracker by inject { parametersOf(this) }
}

val appModule = module {
    single { params -> ScreenTracker(params.get<Activity>()) }
}
```

`single` 只會建立一次，並帶有第一次呼叫時的參數。後續的呼叫會取得相同的執行個體，且該執行個體仍持有第一個 Activity。請改用以下替代方案之一：

- Application context：當類別僅需要資源或系統服務時，將其宣告為帶有 `Context` 的 `single`。在 `single` 中，`Context` 即為 `Application`。
- Activity 作用域：當類別需要 Activity 時，將其宣告在 `activityScope { }` 中或使用 `@ActivityScope`。它會為每個 Activity 建立，並隨其一起釋放。
- 帶參數的 Factory：當呼叫端傳入 Activity 時，請使用 `factory`，且不要將結果保留超過 Activity 的生命週期。

Compiler Plugin 將 `Context`、`Activity`、`Application`、`Fragment` 和 `SavedStateHandle` 視為平台提供的型別，因此不會將它們回報為遺失。它也無法判斷 `Activity` 參數在給定的定義中是否安全：請在程式碼審查時檢查這一點。

### Singleton 持有的監聽器 {id="listeners-held-by-singletons"}

```kotlin
class UserRepository {
    private val listeners = mutableListOf<UserListener>()

    fun addListener(listener: UserListener) { listeners += listener }
    fun removeListener(listener: UserListener) { listeners -= listener }
}
```

Repository 是一個 `single`。如果 Activity 或 Fragment 將自身註冊為監聽器且從未將其移除，Repository 將會使畫面一直保持存活。請在對應的生命週期回呼中移除監聽器（例如在 `onStop()` 中對應 `onStart()`，在 `onDestroyView()` 中對應 `onViewCreated()`），或是公開一個 `Flow` 並使用 `repeatOnLifecycle` 收集它，它會自動為您取消收集。

### 存活時間超過其擁有者的作用域執行個體 {id="scoped-instances-that-outlive-their-owner"}

- Retained 作用域：`activityRetainedScope` 在旋轉後仍會存活。其執行個體不得參照 Activity、View 或 Fragment。
- Fragment 作用域：它在 `onDestroyView()` 之後的 `onDestroy()` 中關閉。不要在 Fragment 作用域的執行個體中保留 View 或繫結。
- ViewModel：切勿將 Activity 作用域或 Fragment 作用域的執行個體注入到 ViewModel 中。ViewModel 在旋轉後仍會存活，但 Activity 作用域則不會。

這些規則在 [Android 作用域](/docs/reference/koin-android/scope) 中有詳細說明。

### 自行建立的作用域 {id="scopes-you-create-yourself"}

`activityScope()`、`fragmentScope()`、`ScopeActivity`、`ScopeFragment` 和 `ScopeService` 會隨生命週期關閉其作用域。使用 `getKoin().createScope()` 建立的作用域沒有生命週期：必須自行關閉，否則其中的每個執行個體都會一直保留在記憶體中。

```kotlin
// 登入時
val sessionScope = getKoin().createScope<UserSession>(userId)

// 登出時
sessionScope.close()
```

## 在 Android 上進行偵錯 {id="debugging-on-android"}

在調查問題時，開啟 debug 等級的 Logcat 記錄器：

```kotlin
startKoin {
    androidLogger(Level.DEBUG)
    androidContext(this@MainApplication)
    modules(appModule)
}
```

在 Logcat 中依 `[Koin]` 標籤進行篩選。在 debug 等級下，Koin 會記錄每個模組載入、每次解析及其耗時，以及每個作用域的開啟或關閉。在 release 組建中請使用 `Level.ERROR` 或 `Level.NONE`。

僅在 Android 上會看到的錯誤：

| 錯誤 | 常見原因 |
|-------|-------------|
| `MissingAndroidContextException` | `startKoin` 中缺少 `androidContext()` |
| `KoinApplication has not been started` | `Application` 類別未在清單中宣告，或者 ContentProvider 在其 `onCreate()` 中進行注入（請參閱 [Android 入口點](/docs/reference/koin-android/entry-points#contentprovider)） |
| 針對作用域型別的 `NoDefinitionFoundException` | Activity 或 Fragment 沒有作用域（`ScopeActivity`、`AndroidScopeComponent`） |
| `ClosedScopeException` | 程式碼在 `onDestroy()` 中或之後（此時作用域已關閉）解析作用域執行個體。請在 `onCloseScope()` 中執行該清理操作 |
| Worker 失敗並顯示 "Could not instantiate" | 預設的 WorkManager 初始設定式仍在清單中（請參閱 [WorkManager](/docs/reference/koin-android/workmanager)） |

使用 Compiler Plugin 時，缺少的定義會在建置期回報（請參閱 [編譯期安全性](/docs/reference/koin-compiler/compile-safety)）。

:::tip
若要從真實使用者工作階段中查看解析時間、作用域生命週期和 Koin 錯誤，請參閱 [生產環境監控](/docs/tooling/production-monitoring)。
:::

## 機密資訊 {id="secrets"}

APK 可以被解包。任何編譯至其中或儲存在 `assets/` 中的內容都可以被讀取：

- 硬編碼金鑰：不要在模組中將 API 金鑰寫為字串常值。
- Koin 屬性：`androidFileProperties()` 會讀取包含在 APK 內的 `assets/koin.properties`。請僅將其用於配置，切勿用於機密資訊。
- `BuildConfig` 欄位：它們也會被編譯進 APK 中。它們只能對原始碼管理隱藏數值，而無法對 APK 隱藏。

在執行期從後端擷取機密資訊，或將權杖保留在加密儲存區中，並注入該儲存區而非直接注入值：

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

`TokenStore` 是一個由加密儲存區支援的 `single`，而 `AuthInterceptor` 則被新增至 `OkHttpClient` 定義中（請參閱 [Android 程式庫整合](/docs/reference/koin-android/binding-patterns)）。

## 從 Hilt 或 Dagger 遷移 {id="migrating-from-hilt-or-dagger"}

註解對應、模組遷移和漸進式遷移在 [從 Hilt 遷移](/docs/reference/koin-android/hilt-migration) 中有詳細說明。若要保留 `@Inject` 和 `jakarta.inject` 註解，請參閱 [JSR-330 註解](/docs/reference/koin-android/jsr330)。

## 相關內容 {id="related"}

- [Android 作用域](/docs/reference/koin-android/scope)：Activity、Fragment、retained 以及 ViewModel 作用域的生命週期。
- [在 Android 上啟動 Koin](/docs/reference/koin-android/start)：`androidContext()`、記錄功能與屬性。
- [疑難排解](/docs/reference/koin-core/troubleshooting)：解析錯誤與循環相依。
- [延遲載入模組](/docs/reference/koin-core/lazy-modules)：減少應用程式啟動時的 Koin 工作量。
- [從 Hilt 遷移](/docs/reference/koin-android/hilt-migration)：將現有的 Hilt 應用程式遷移至 Koin。