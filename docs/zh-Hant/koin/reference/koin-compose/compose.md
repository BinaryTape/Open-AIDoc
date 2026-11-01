---
title: 適用於 Compose 的 Koin
---

# 適用於 Compose 的 Koin

本頁涵蓋 Compose 軟件包、在 Compose 應用程式中啟動 Koin 的兩種方式，以及在 Composable 中使用 `koinInject()` 擷取相依性。它在 Jetpack Compose (Android) 與 Compose Multiplatform 上的運作方式完全相同。建議你先了解如何宣告[定義](/docs/reference/koin-core/definitions)與[模組](/docs/reference/koin-core/modules)。

## 軟件包 {id="packages"}

| 軟件包 | 包含內容 | 平台 |
|---------|----------|-----------|
| `io.insert-koin:koin-compose` | `KoinApplication`、`koinInject`、作用域與模組 API | 多平台 |
| `io.insert-koin:koin-compose-viewmodel` | `koinViewModel`、`koinActivityViewModel` (Android) | 多平台 |
| `io.insert-koin:koin-compose-viewmodel-navigation` | `sharedKoinViewModel`、`KoinNavigationScope`、`navigationScope` | 多平台 |
| `io.insert-koin:koin-compose-navigation3` | Navigation 3 項目 | 多平台 |
| `io.insert-koin:koin-androidx-compose` | `koin-compose` + `koin-compose-viewmodel`，加上 `KoinActivityScope` 與 `KoinFragmentScope` | Android |
| `io.insert-koin:koin-androidx-compose-navigation` | 僅包含已棄用的 `koinNavViewModel` | Android |

所有 Compose API 均位於多平台軟件包中。`koin-androidx-compose` 是為 Android 專案提供的便利構件：

```kotlin
// Android 應用程式
dependencies {
    implementation("io.insert-koin:koin-androidx-compose:$koin_version")
}

// Compose Multiplatform，位於 commonMain
commonMain.dependencies {
    implementation("io.insert-koin:koin-compose:$koin_version")
    implementation("io.insert-koin:koin-compose-viewmodel:$koin_version")
}
```

有關 BOM 與版本目錄 (version catalogs) 的資訊，請參閱 [Gradle 設定](/docs/setup/gradle)。

## 啟動 Koin {id="starting-koin"}

你有兩種選擇，每個應用程式擇一使用即可。

### 在 Compose 外部啟動 {id="start-outside-compose"}

在平台的啟動點啟動 Koin：Android 上的 `Application` 類別，或是 KMP 專案中的共用 `initKoin()` 函式（請參閱 [KMP 設定](/docs/reference/koin-core/kmp-setup)）。接著 Compose 便可直接使用執行中的 Koin 執行個體，無需額外配置：

```kotlin
class MainApplication : Application() {
    override fun onCreate() {
        super.onCreate()
        startKoin {
            androidContext(this@MainApplication)
            modules(appModule)
        }
    }
}

@Composable
fun App() {
    val repository = koinInject<UserRepository>()
}
```

當 Compose 外部的程式碼（例如 `Service`、`WorkManager` worker、iOS Swift 程式碼）也需要 Koin 時，請使用此選項，因為這些程式碼的執行並不依賴任何 Composable。

### 使用 KoinApplication 從 Composable 啟動 {id="start-from-a-composable-with-koinapplication"}

`KoinApplication` 會從根 Composable 啟動 Koin，並將其提供給所有子層：

**編譯器外掛程式 DSL**
```kotlin
import org.koin.compose.KoinApplication
import org.koin.dsl.koinConfiguration

@Composable
fun App() {
    KoinApplication(
        configuration = koinConfiguration { modules(appModule) }
    ) {
        MainScreen()
    }
}
```

**註解**
```kotlin
// di/Koin.kt
import org.koin.core.annotation.KoinApplication

@KoinApplication
object KoinApp
```

該註解與 Composable 的名稱皆為 `KoinApplication`，因此請將它們保存在不同的檔案中。

```kotlin
// App.kt
import org.koin.compose.KoinApplication
import org.koin.plugin.module.dsl.koinConfiguration

@Composable
fun App() {
    KoinApplication(configuration = koinConfiguration<KoinApp>()) {
        MainScreen()
    }
}
```

`koinConfiguration<KoinApp>()` 會載入標記了 `@KoinApplication` 的類別模組。傳遞 Lambda 運算式以加入更多選項：`koinConfiguration<KoinApp> { printLogger() }`。

**建構函式 / 傳統 DSL**
```kotlin
import org.koin.compose.KoinApplication
import org.koin.dsl.koinConfiguration

@Composable
fun App() {
    KoinApplication(
        configuration = koinConfiguration { modules(appModule) }
    ) {
        MainScreen()
    }
}
```

`KoinApplication` 為你處理的事項：

- **平台設定**：在 Android 上，它會使用應用程式 context 呼叫 `androidContext()` 並設定 `androidLogger()`。在其他平台上，它會設定 `printLogger()`。可透過 `logLevel` 參數變更記錄層級（預設為 `Level.INFO`）。
- **現有執行個體**：若 Koin 已經啟動，`KoinApplication` 會連結至執行中的執行個體，並忽略其本身的配置。
- **生命週期**：當 `KoinApplication` 離開組合 (composition) 時，Koin 不會被停止，因此它能在 Android 配置變更或 Activity 重建後繼續存留。只有在組合被捨棄時，它才會停止。

`koinConfiguration { }` 會建置可重複使用的 [KoinConfiguration](/docs/reference/koin-core/starting-koin)，因此你可以在 `KoinApplication`、`startKoin` 與測試之間共用相同的配置。

### 已棄用的入口點 {id="deprecated-entry-points"}

| API | 狀態 | 改用此項 |
|-----|--------|-------------|
| `KoinApplication(application = { ... })` | 已棄用 | `KoinApplication(configuration = koinConfiguration { ... })` |
| `KoinMultiplatformApplication(config)` | 已棄用 | `KoinApplication(configuration)` |
| `KoinContext { }` | 已棄用，不需要 | 無需使用。Compose 會自動尋找透過 `startKoin` 啟動的執行個體 |
| `KoinAndroidContext { }` | 已棄用，不需要 | 無需使用 |

## 使用 koinInject 注入 {id="injecting-with-koininject"}

`koinInject()` 會從目前的 Koin 作用域（預設為根作用域，除非有啟用的 [Compose 作用域](/docs/reference/koin-compose/compose-scopes)）解析相依性：

```kotlin
import org.koin.compose.koinInject

@Composable
fun UserScreen() {
    val repository = koinInject<UserRepository>()
}
```

將其宣告為預設參數。如此一來，該 Composable 仍可搭配 Koin 運作，而測試或預覽也能傳入自訂的執行個體：

```kotlin
@Composable
fun UserScreen(repository: UserRepository = koinInject()) {
    // ...
}
```

`koinInject()` 將解析操作封裝在 `remember` 中，並以限定詞、作用域和參數作為索引鍵。使用相同索引鍵進行重組時會傳回相同的物件，而不會再次進行解析。

### 限定詞與作用域 {id="qualifier-and-scope"}

```kotlin
@Composable
fun SyncScreen() {
    val localDb = koinInject<Database>(qualifier = named("local"))
    val cache = koinInject<SessionCache>(scope = sessionScope)
}
```

有關宣告具名定義的詳細資訊，請參閱[限定詞](/docs/reference/koin-core/qualifiers)。

### 參數 {id="parameters"}

透過 Lambda 運算式或 `ParametersHolder` 傳遞[注入參數](/docs/reference/koin-core/injection-parameters)：

```kotlin
@Composable
fun UserDetail(userId: String) {
    // lambda 形式
    val presenter = koinInject<UserPresenter> { parametersOf(userId) }

    // holder 形式
    val presenter2 = koinInject<UserPresenter>(parametersHolder = parametersOf(userId))
}
```

使用 lambda 形式時，Koin 會在每次重組時叫用該 lambda 以比較數值。Holder 形式則會略過該步驟，Koin 原始碼建議以此提升效能。參數會按值進行比較：當 `userId` 變更時，`koinInject()` 會解析出新的執行個體。

## 直接存取 Koin {id="accessing-koin-directly"}

| 函式 | 傳回值 |
|----------|---------|
| `getKoin()` | 目前組合的 `Koin` 執行個體 |
| `currentKoinScope()` | `koinInject()` 預設使用的作用域 |

兩者皆為 `org.koin.compose` 中的 Composable 函式。在 UI 程式碼中建議優先使用 `koinInject()`。

## 預覽 {id="previews"}

Compose 預覽不會執行你的 `Application` 類別。若要為預覽提供獨立的 Koin 執行個體，請使用 `KoinApplicationPreview`：請參閱 [Compose 測試](/docs/reference/koin-compose/compose-testing)。

## API 摘要 {id="api-summary"}

| API | 用途 | 頁面 |
|-----|---------|------|
| `KoinApplication(configuration) { }` | 從 Compose 啟動 Koin | 本頁 |
| `koinInject<T>()` | 解析任何相依性 | 本頁 |
| `koinViewModel<T>()` | 解析 ViewModel | [Compose 中的 ViewModel](/docs/reference/koin-compose/compose-viewmodel) |
| `KoinScope`、`KoinNavigationScope` | 繫結至 Composable 或導覽目的地的作用域 | [Compose 中的作用域](/docs/reference/koin-compose/compose-scopes) |
| `rememberKoinModules { }` | 隨 Composable 載入模組 | [動態模組](/docs/reference/koin-compose/compose-modules) |
| `KoinIsolatedContext` | 使用獨立的 Koin 執行個體 | [隔離上下文](/docs/reference/koin-compose/isolated-context) |
| `navigation<T> { }`、`koinEntryProvider()` | Navigation 3 項目 | [Navigation 3](/docs/reference/koin-compose/navigation3) |

## 相關內容 {id="related"}

- [Compose 中的 ViewModel](/docs/reference/koin-compose/compose-viewmodel)：`koinViewModel()` 與具備導覽作用域的 ViewModel。
- [生命週期與狀態](/docs/reference/koin-compose/compose-lifecycle)：注入的物件在重組過程中的行為模式。
- [KMP 設定](/docs/reference/koin-core/kmp-setup)：在 Compose Multiplatform 專案中啟動 Koin。
- [Android 啟動](/docs/reference/koin-android/start)：`androidContext()` 與 Android `Application` 類別。
- [Compose 測試](/docs/reference/koin-compose/compose-testing)：預覽與 UI 測試。