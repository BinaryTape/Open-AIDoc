---
title: 啟動 Koin
---

# 啟動 Koin

本頁面涵蓋如何啟動 Koin 容器、啟動時可傳遞的選項、使用 `@KoinApplication` 的型別化啟動、記錄（logging）、屬性（properties），以及稍後如何載入或卸載模組。本篇內容假設您已了解什麼是模組（請參閱[模組](/docs/reference/koin-core/modules)）。

程式碼範例分為三個分頁：Compiler Plugin DSL、Annotations、Constructor / Classic DSL。請選擇適合您的樣式，該選擇將適用於每個頁面。

## 啟動 Koin {id="start-koin"}

**Compiler Plugin DSL**
```kotlin
import org.koin.core.context.startKoin

fun main() {
    startKoin {
        printLogger()
        modules(appModule)
    }
}
```

**Annotations**
```kotlin
import org.koin.plugin.module.dsl.startKoin

@KoinApplication(modules = [AppModule::class])
class MyApp

fun main() {
    startKoin<MyApp> {
        printLogger()
    }
}
```

Koin 編譯器外掛程式會將 `startKoin<MyApp>()` 替換為 `startKoin { }` 呼叫，該呼叫會載入 `@KoinApplication` 中列出的模組，以及其探索到的 `@Configuration` 模組。請參閱[使用 @KoinApplication 的型別化啟動](#typed-startup-with-koinapplication)。

**Constructor / Classic DSL**
```kotlin
import org.koin.core.context.startKoin

fun main() {
    startKoin {
        printLogger()
        modules(appModule)
    }
}
```

`startKoin` 會建立容器並將其註冊在 `GlobalContext`（您行程的預設上下文）中。一旦它回傳，每個 `get()`、`by inject()` 或平台 API（`by viewModel()`、`koinInject()`）都會從這個容器中解析。

每個行程只能呼叫 `startKoin` 一次。第二次呼叫將會擲出 `KoinApplicationAlreadyStartedException`。若要在啟動後新增模組，請使用 [`loadKoinModules`](#load-and-unload-modules-at-runtime)。

## 啟動選項 {id="start-options"}

`startKoin { }` 區塊內的所有內容都是用來配置容器：

```kotlin
startKoin {
    printLogger(Level.DEBUG)
    properties(mapOf("server_url" to "https://api.example.com"))
    allowOverride(false)
    modules(coreModule, networkModule)
    lazyModules(analyticsModule)
}
```

| 選項 | 功能說明 |
|------|----------|
| `modules(...)` | 立即載入模組。可接受單一模組、多個模組或 `List<Module>` |
| `lazyModules(...)` | 在背景載入模組。需要 `koin-core-coroutines`，請參閱[延遲載入模組](/docs/reference/koin-core/lazy-modules) |
| `printLogger(level)` | 輸出日誌至主控台。請參閱[記錄](#logging) |
| `logger(logger)` | 使用您自訂的 `Logger` 實作 |
| `properties(map)` | 從 Map 新增屬性。請參閱[屬性](#properties) |
| `fileProperties(file)` | 從類別路徑（classpath）檔案載入屬性，預設為 `/koin.properties`（僅限 JVM） |
| `environmentProperties()` | 載入系統屬性與環境變數（僅限 JVM） |
| `allowOverride(false)` | 當兩個定義宣告相同型別且未加上 `.override()` 時失敗。請參閱[覆寫定義](/docs/reference/koin-core/definitions#overriding-a-definition) |
| `strictOverride()` | 與 `allowOverride(false)` 相同 |
| `createEagerInstances()` | 立即建立 `createdAtStart` 的定義。`startKoin` 和 `koinApplication` 已經在區塊結尾預設執行此操作，因此只有在使用 `koinApplication(createEagerInstances = false)` 時才需要它 |

`startKoin` 區塊在呼叫端執行緒上執行。您在此處載入的每個模組以及每個 `createdAtStart` 定義都會增加啟動時間。

## 使用 @KoinApplication 的型別化啟動 {id="typed-startup-with-koinapplication"}

透過 [Koin 編譯器外掛程式](/docs/setup/compiler-plugin)，加上 `@KoinApplication` 註解的應用程式類別可以描述要載入哪些模組。您可以透過型別化呼叫從該類別啟動 Koin：

```kotlin
@Module
@ComponentScan("com.myapp.data")
class DataModule

@Module(includes = [DataModule::class])
class AppModule

@KoinApplication(modules = [AppModule::class])
class MyApp
```

| 呼叫方式 | 結果 |
|----------|------|
| `startKoin<MyApp>()` | 使用 `MyApp` 的模組在 `GlobalContext` 中啟動 Koin |
| `startKoin<MyApp> { ... }` | 同上，但附帶配置區塊（日誌記錄器、屬性、額外的 DSL 模組） |
| `koinApplication<MyApp>()` | 建立隔離的 `KoinApplication`，不註冊到全域 |
| `koinConfiguration<MyApp>()` | 建立 `KoinConfiguration`，適用於為您代為啟動 Koin 的 API（Compose `KoinApplication`、Ktor） |
| `withConfiguration<MyApp>()` | 將 `MyApp` 的模組新增至現有的 `KoinApplication`，例如在 Ktor 的 `install(Koin) { }` 內部 |

這些函式是從 `org.koin.plugin.module.dsl` 匯入的。它們是編譯器虛設常式（compiler stubs）：如果未套用編譯器外掛程式，它們會在執行期擲出例外狀況，並顯示訊息告知遺失外掛程式。

`@KoinApplication` 接受兩個參數：

- `modules`：要明確載入的 `@Module` 類別。
- `configurations`：要探索的配置標籤。請參閱[配置標籤](#configuration-labels)。

每個 `@Module` 類別都會帶入其 `includes` 與其 `@ComponentScan` 定義。`startKoin<MyApp> { }` 的配置區塊是一個標準的 `startKoin` 區塊，因此您可以將註解模組與 DSL 模組混合使用：

```kotlin
startKoin<MyApp> {
    printLogger()
    modules(legacyDslModule)
}
```

### 不使用 @KoinApplication 載入 @Module 類別 {id="loading-module-classes-without-koinapplication"}

在普通的 `startKoin { }` 或 `koinApplication { }` 區塊內，您可以直接載入 `@Module` 類別：

```kotlin
import org.koin.plugin.module.dsl.module
import org.koin.plugin.module.dsl.modules

startKoin {
    module<NetworkModule>()
    modules(DataModule::class, CacheModule::class)
}
```

這在測試中特別有用，特別是當您只需要部分模組時。`module<T>()` 與 `modules(vararg KClass)` 同樣也是編譯器虛設常式，且它們無法在 `startKoin<T> { }` 內部運作，因為該區塊已經被外掛程式重寫了。

:::note
使用編譯器外掛程式時，沒有 `AppModule().module` 擴充套件可供呼叫。請使用 `@KoinApplication` 與 `startKoin<T>()` 來載入加上註解的模組，或如上方所示使用 `module<T>()`。
:::

### 配置標籤 {id="configuration-labels"}

標記有 `@Configuration` 的 `@Module` 會被 `@KoinApplication` 自動探索，包括來自類別路徑上其他 Gradle 模組中的項目（請參閱[使用 @Configuration 自動探索](/docs/reference/koin-core/modules#auto-discovery-with-configuration)）。標籤讓您可以挑選要載入這些模組中的哪一個：

```kotlin
@Module
@Configuration
class CoreModule

@Module
@Configuration("prod")
class ProdDatabaseModule

@Module
@Configuration("test")
class TestDatabaseModule

@Module
@Configuration("default", "test")
class LoggingModule
```

```kotlin
@KoinApplication
class MyApp // 載入 CoreModule 與 LoggingModule

@KoinApplication(configurations = ["default", "prod"])
class ProdApp // 載入 CoreModule、LoggingModule 與 ProdDatabaseModule

@KoinApplication(configurations = ["test"])
class TestApp // 載入 TestDatabaseModule 與 LoggingModule
```

規則如下：

- 未指定值的 `@Configuration` 代表 `"default"` 標籤。`@Configuration("default")` 效果相同。
- 未指定 `configurations` 的 `@KoinApplication` 僅載入 `"default"` 標籤。
- 當您列出標籤時，只會載入這些標籤。若您仍需要預設模組，請將 `"default"` 加入清單中。
- 一個模組可以帶有多個標籤。

## 使用 koinApplication 建立隔離執行個體 {id="isolated-instance-with-koinapplication"}

`koinApplication { }` 會建立一個未註冊在 `GlobalContext` 中的容器：

```kotlin
val koinApp = koinApplication {
    modules(sdkModule)
}

val service = koinApp.koin.get<SdkService>()
```

全域 API（`KoinComponent`、Activity 中的 `by inject()`）無法看見這個容器。適用於絕對不能與宿主應用程式共用容器的程式庫與 SDK，或是需要獨立執行個體的測試。完整模式請參閱[上下文隔離](/docs/reference/koin-core/context-isolation)。

`koinConfiguration { }` 可以在不啟動任何內容的情況下建構配置。您可以將它傳遞給自行啟動 Koin 的 API，例如 Compose `KoinApplication` 和 Ktor 外掛程式。

## 在各平台上的啟動方式 {id="starting-on-each-platform"}

- Android：在 `Application.onCreate()` 中使用 `androidContext()` 與 `androidLogger()` 啟動 Koin。請參閱[在 Android 上啟動 Koin](/docs/reference/koin-android/start)。
- Compose：從可組合項（composable）中使用 `KoinApplication` 或 `KoinMultiplatformApplication` 啟動 Koin。請參閱[適用於 Compose 的 Koin](/docs/reference/koin-compose/compose)。
- Ktor：在您的 `Application` 模組中安裝 `Koin` 外掛程式。請參閱[適用於 Ktor 的 Koin](/docs/reference/koin-ktor/ktor)。
- Kotlin Multiplatform：在 `commonMain` 中共用一個 `initKoin()` 函式，並從各個平台呼叫它。請參閱[KMP 設定](/docs/reference/koin-core/kmp-setup)。

## 在執行時期載入與卸載模組 {id="load-and-unload-modules-at-runtime"}

啟動後，您可以在全域容器中新增與移除模組：

```kotlin
import org.koin.core.context.loadKoinModules
import org.koin.core.context.unloadKoinModules

if (premiumEnabled) {
    loadKoinModules(premiumModule)
}

// 稍後
unloadKoinModules(premiumModule)
```

這兩個函式都接受單一模組或 `List<Module>`。`unloadKoinModules` 會移除該模組的定義並丟棄其執行個體，因此稍後針對這些型別的 `get()` 呼叫將會失敗。

編譯器外掛程式無法驗證在執行時期組裝的相依圖：它無法得知該模組何時載入、甚至是否會被載入。其他定義若需要來自執行時期載入模組的型別，該型別必須標記為 `@Provided`，否則外掛程式會回報該模組本身未在啟動時載入。請參閱[編譯期安全性](/docs/reference/koin-compiler/compile-safety)。若您稍後載入模組純粹是為了加快啟動速度，通常[延遲載入模組](/docs/reference/koin-core/lazy-modules)會是更好的選擇。

## 停止 Koin {id="stop-koin"}

```kotlin
import org.koin.core.context.stopKoin

stopKoin()
```

`stopKoin()` 會關閉全域容器：它會釋放所有執行個體、呼叫定義的 `onClose` 回呼函式，並清除 `GlobalContext`。之後您便可以再次呼叫 `startKoin`。若是隔離容器，請在 `KoinApplication` 上呼叫 `close()`：

```kotlin
koinApp.close()
```

在測試中，請在每次測試後停止 Koin，以確保下一個測試乾淨啟動。[測試](/docs/reference/koin-test/testing)章節介紹了可為您代勞的 JUnit 規則。

## 記錄 {id="logging"}

Koin 預設不記錄任何內容（`EmptyLogger`）。請在啟動區塊中開啟記錄功能：

```kotlin
startKoin {
    printLogger(Level.DEBUG)
    modules(appModule)
}
```

`Level` 包括 `DEBUG`、`INFO`、`WARNING`、`ERROR` 或 `NONE`。每個日誌記錄器的預設等級為 `INFO`。

| 日誌記錄器 | 啟動選項 | 平台 | 構件（Artifact） |
|------------|----------|------|------------------|
| `EmptyLogger` | (預設) | 全部 | `koin-core` |
| `PrintLogger` | `printLogger()` | 全部 | `koin-core` |
| `AndroidLogger` | `androidLogger()` | Android (Logcat) | `koin-android` |
| `SLF4JLogger` | `slf4jLogger()` | JVM | `koin-logger-slf4j` |

在 `DEBUG` 等級下，Koin 會記錄每個模組的載入和每次解析及其耗時。這對於找出執行緩慢的定義非常有用，但對於正式環境來說則太過冗長。

若要將日誌發送到其他位置，請繼承 `Logger` 並使用 `logger()` 傳入：

```kotlin
import org.koin.core.logger.Level
import org.koin.core.logger.Logger
import org.koin.core.logger.MESSAGE

class AppLogger : Logger(Level.INFO) {
    override fun display(level: Level, msg: MESSAGE) {
        MyLogSystem.log(level.name, msg)
    }
}

startKoin {
    logger(AppLogger())
}
```

## 屬性 {id="properties"}

屬性是儲存在容器中的鍵值對（key-value pairs）。可用於 URL 或金鑰等設定值。

### 載入屬性 {id="loading-properties"}

```kotlin
startKoin {
    properties(mapOf("server_url" to "https://api.example.com"))
    fileProperties()          // JVM：從類別路徑讀取 /koin.properties
    environmentProperties()   // JVM：系統屬性與環境變數
}
```

在 Android 上，`androidFileProperties()` 會從 `assets` 資料夾讀取 `koin.properties`。您也可以在執行時期於 `Koin` 執行個體上設定與讀取屬性：

```kotlin
val koin = KoinPlatform.getKoin()
koin.setProperty("session_token", token)
val token: String? = koin.getProperty("session_token")
```

從檔案或環境變數載入的值皆為 `String`。請自行進行轉換（`getProperty<String>("timeout").toInt()`）。

### 注入屬性 {id="injecting-properties"}

**Compiler Plugin DSL**
在建構函式參數上加上 `@Property` 註解（來自 `koin-annotations`）：

```kotlin
class ApiClient(@Property("server_url") val url: String)

val networkModule = module {
    single<ApiClient>()
}
```

**Annotations**
```kotlin
@Singleton
class ApiClient(@Property("server_url") val url: String)
```

若要為屬性指定預設值，請使用 `@PropertyValue` 與相同的鍵對頂層（top-level）值加上註解：

```kotlin
@PropertyValue("server_url")
val defaultServerUrl = "https://api.example.com"
```

產生的程式碼會讀取 `getProperty("server_url", defaultServerUrl)`，因此在未設定該屬性時，`ApiClient` 會取得預設值。

**Constructor / Classic DSL**
```kotlin
val networkModule = module {
    single { ApiClient(url = getProperty("server_url")) }

    // 附帶預設值
    single { ApiClient(url = getProperty("server_url", "https://api.example.com")) }
}
```

如果屬性不存在，`getProperty(key)` 會擲出例外狀況。而 `getPropertyOrNull(key)` 則會改為傳回 `null`。

建議在單一配置類別中讀取屬性並注入該類別，而不是在多個地方呼叫 `getProperty`。這樣一來，金鑰便能集中在同一個檔案中。

## 限制 {id="limits"}

- `startKoin` 每個行程僅執行一次。再次啟動前請呼叫 `stopKoin()`。
- `fileProperties()` 與 `environmentProperties()` 僅存在於 JVM。在其他平台上，請使用 `properties()` 傳遞 Map。
- 型別化啟動（`startKoin<T>()`、`module<T>()`）需要編譯器外掛程式。KSP 處理器已被棄用，請參閱[從 KSP 遷移](/docs/migration/from-ksp-to-compiler-plugin)。
- 啟動後透過 `loadKoinModules` 載入的模組不會納入編譯期相依圖檢查中。

## 相關內容 {id="related"}

- [模組](/docs/reference/koin-core/modules)：組織定義、`includes()`、`@Module` 與 `@Configuration`。
- [定義](/docs/reference/koin-core/definitions)：宣告 Koin 建立的項目、積極建立（eager creation）與覆寫。
- [延遲載入模組](/docs/reference/koin-core/lazy-modules)：在背景載入模組以縮短啟動時間。
- [上下文隔離](/docs/reference/koin-core/context-isolation)：為 SDK 在獨立的容器中執行 Koin。
- [編譯器外掛程式設定](/docs/setup/compiler-plugin)：安裝 `startKoin<T>()` 所需的外掛程式。
- [在 Android 上啟動 Koin](/docs/reference/koin-android/start)：`androidContext()`、`androidLogger()` 與 AndroidX Startup。