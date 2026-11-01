---
title: 編譯期安全性
---

# 編譯期安全性

Koin Compiler Plugin 會在編譯程式碼時檢查您的相依關係圖。遺漏的定義、錯誤的限定詞或循環相依都會導致組建失敗，並精確指出檔案與行數，而不是在執行時期發生當機。本頁面涵蓋檢查項目、確切的診斷資訊，以及外掛程式無法檢查的情況。本文假設外掛程式已安裝完成（請參閱 [Compiler Plugin Setup](/docs/setup/compiler-plugin)）。

編譯期安全性預設為啟用（`compileSafety = true`，請參閱 [Compiler Plugin Options](/docs/reference/koin-annotations/options)）。

## 檢查執行的位置 {id="where-the-checks-run"}

外掛程式會在兩個層級進行檢查：

**完整圖（Full graph）**：在每個 Koin 入口點，外掛程式會從您的原始碼和相依 JAR 中組裝該入口點載入的每個模組，並根據該完整圖檢查每個定義。

**呼叫點（Call sites）**：每個 `get<T>()`、`inject<T>()`、`koinInject<T>()`、`koinViewModel<T>()`、`by viewModel()` 以及類似的呼叫都會受到檢查：`T` 必須存在於組裝完成的圖中。如果功能模組發出該呼叫但無法看到完整圖，外掛程式會在編譯後的模組中留下提示。app 模組會在編譯時從其相依項讀取這些提示並進行檢查。

可識別的入口點：

| 入口點 | 範例 |
|-------------|---------|
| `startKoin` | `startKoin<MyApp>()`, `startKoin { modules(appModule) }` |
| `koinApplication` | `koinApplication { modules(appModule) }` |
| `koinConfiguration` | `koinConfiguration<MyApp>()` |
| `@KoinApplication` | `@KoinApplication object MyApp` |
| `withConfiguration<T>()` | `startKoin { withConfiguration<MyApp>() }` |
| Ktor `install(Koin)` | `install(Koin) { modules(appModule) }` |

`modules(...)` 接受外掛程式可追蹤的清單：`listOf(...)`、`+`、`.toList()`、頂層 `val`，或是傳回 `List<Module>` 的函式：

```kotlin
val dataModules = listOf(databaseModule, networkModule)
fun featureModules(): List<Module> = listOf(loginModule, profileModule)

startKoin {
    modules(dataModules + featureModules())
}
```

宣告為函式的模組（`fun dataModule(): Module = module { ... }`）會像頂層 `val` 一樣被追蹤。

:::note
本身沒有入口點的 Gradle 模組（程式庫、大多數功能模組）在自身的編譯過程中不會獲得相依項遺漏的診斷資訊。單獨檢查的模組無法知道 app 將如何裝配它。其定義會在 app 模組組裝圖時進行檢查。外掛程式會在組建輸出中說明這一點：

```
[Koin] compile-safety validation skipped — no Koin entry point in this compilation.
```
:::

## 檢查項目 {id="what-is-checked"}

| 情況 | 結果 |
|------|--------|
| 不可為 null 的參數，無定義 | Error |
| 可為 null 的參數（`T?`），無定義 | OK，使用 `getOrNull()` 解析 |
| 具有預設值的參數，無定義 | OK，使用 Kotlin 預設值（在 `skipDefaultValues = true` 時） |
| 具有預設值與限定詞（`@Named`）的參數 | Error，限定詞會強制進行解析 |
| `@InjectedParam` 參數 | OK，在執行時期透過 `parametersOf()` 傳入 |
| `@Property("key")` 參數 | OK。如果不存在 `@PropertyValue("key")` 預設值則發出 Warning |
| `List<T>` 參數 | OK，若無相符項目則 `getAll()` 傳回空清單 |
| `Lazy<T>`，無 `T` 的定義 | Error，內部型別會被檢查 |
| `@Named("x")` 參數，無帶有該限定詞的定義 | Error，若該型別存在其他限定詞則附帶提示 |
| 宣告在另一個作用域中的作用域相依項 | Error |
| 循環相依（A 需要 B，B 需要 A） | Error |
| `@Provided` 型別或參數 | OK，在圖之外提供 |
| `@ScopeId` 參數 | OK，在執行時期從具名作用域解析 |
| `Scope` 參數 | OK，傳入目前作用域 |
| Android 架構型別（`Context`、`SavedStateHandle` 等） | OK，內建清單 |
| `get<T>()` / `inject<T>()` 且無 `T` 的定義 | Error |
| 當 `T` 擁有 `@InjectedParam` 時呼叫 `get<T>()` 卻未附帶 `parametersOf()` | Error |
| `parametersOf(...)` 帶有錯誤的數量或型別 | Error |

有關每個參數型別如何解析的規則，請參閱 [Definitions](/docs/reference/koin-core/definitions#constructor-parameters)。

## 各宣告樣式的檢查 {id="checks-per-declaration-style"}

每一種樣式和 DSL 形式都會針對同一個圖進行檢查。它們可以共存於同一個專案中：DSL 定義可以相依於帶有註解的類別，反之亦然。

**Compiler Plugin DSL**
```kotlin
val appModule = module {
    single<Database>()
    single<UserRepository>()      // 已檢查：Database 存在
    viewModel<UserViewModel>()    // 已檢查：UserRepository 存在
}
```

外掛程式會讀取建構函式，產生解析呼叫並檢查每個參數。`create(::function)` 也以相同的方式檢查函式參數：

```kotlin
fun buildUserRepository(db: Database): UserRepository = UserRepository(db)

val appModule = module {
    single { create(::buildUserRepository) }    // 已檢查：Database 存在
}
```

**註解（Annotations）**
```kotlin
@Singleton
class Database

@Singleton
class UserRepository(private val db: Database)    // 已檢查：Database 存在

@KoinViewModel
class UserViewModel(private val repo: UserRepository) : ViewModel()

@Module
@ComponentScan("com.myapp")
class AppModule

@KoinApplication(modules = [AppModule::class])
object MyApp
```

`startKoin<MyApp>()` 是入口點：外掛程式會檢查 `@ComponentScan` 找到的每個定義。帶有註解的頂層函式會像類別一樣被檢查：

```kotlin
@Factory
fun provideCache(db: Database): CacheService = RedisCache(db)    // 已檢查：Database 存在
```

標記為 `@Configuration` 的模組會跨 Gradle 模組與請求其標籤的 `@KoinApplication` 一起組裝並進行聯合檢查。

**建構函式 / 傳統 DSL（Constructor / Classic DSL）**
建構函式參照會如同 Compiler Plugin DSL 一樣受到檢查：

```kotlin
val appModule = module {
    singleOf(::Database)
    singleOf(::UserRepository)        // 已檢查：Database 存在
    viewModelOf(::UserViewModel)      // 已檢查：UserRepository 存在
    scope<UserSession> {
        scopedOf(::SessionCache)
    }
}
```

`singleOf`、`factoryOf`、`scopedOf`、`viewModelOf` 和 `new(::T)` 會保留其執行時期行為。外掛程式僅加入檢查，不會重寫它們。

對於自行撰寫的 Lambda，外掛程式不會讀取建構函式。它會檢查 Lambda 內部的 `get()`、`inject()` 和 `getOrNull()` 呼叫，如同處理一般的呼叫點：

```kotlin
val appModule = module {
    single { UserRepository(get()) }  // 已檢查：get() 呼叫需要 Database
}
```

:::warning
自 Compiler Plugin 1.2.0 起，`singleOf`、`factoryOf`、`scopedOf` 和 `viewModelOf` 也會受到檢查。依賴這些函式中遺漏相依項的程式碼將無法再編譯。過往的組建隱藏了執行時期的當機問題。
:::

## 診斷資訊 {id="diagnostics"}

每則診斷資訊都有一個穩定的代碼，輸出格式為 `[Koin][CODE]`。您可以搜尋該代碼或訊息的第一行。

### 缺少相依項 (KOIN-D001) {id="missing-dependency-koin-d001"}

定義中的參數在圖中找不到對應的定義：

```
[Koin][KOIN-D001] Missing dependency: com.myapp.Database
  required by: com.myapp.UserRepository (parameter 'db')
  in module: com.myapp.AppModule
```

對於 DSL 定義，`required by:` 會以 `dsl:` 開頭。當該型別存在其他限定詞時，隨後會附帶提示：

```
[Koin][KOIN-D001] Missing dependency: com.myapp.NetworkClient qualified with @Named("http")
  required by: com.myapp.ApiService (parameter 'client')
  in module: com.myapp.AppModule
  Hint: Found similar binding: com.myapp.NetworkClient (no qualifier)
```

解決方法：宣告遺漏的定義、將宣告該定義的模組新增至 `modules()` 或 `includes()`，或是修正限定詞（請參閱 [Qualifiers](/docs/reference/koin-core/qualifiers)）。

### 呼叫點缺少定義 (KOIN-D002, KOIN-D003) {id="missing-definition-at-a-call-site-koin-d002-koin-d003"}

`get<T>()`、`inject<T>()` 或 `koinViewModel<T>()` 呼叫請求了一個未在任何已載入模組中宣告的型別：

```
[Koin][KOIN-D002] Missing definition: com.myapp.Tracker
  resolved by: get<Tracker>()
  No matching definition found in any loaded module.
  Check your declaration with Annotation or DSL.
```

`KOIN-D003` 是在相依模組中發出呼叫時的相同錯誤，會在 app 模組編譯時回報。其第二行顯示為 `required by a call site in a dependency module`。

### 循環相依 (KOIN-D004) {id="circular-dependency-koin-d004"}

```
[Koin][KOIN-D004] Circular dependency detected:
  com.myapp.A → com.myapp.B → com.myapp.A
  Break with Lazy<T> injection or refactor to remove the cycle.
```

`Lazy<T>`、可為 null、`List<T>`、`@InjectedParam`、`@Provided`、`@Property`、`@ScopeId` 或具有預設值的參數不會被計為循環中的邊。將其中一個參數改為 `Lazy<T>` 即可打破循環。請參閱 [Troubleshooting](/docs/reference/koin-core/troubleshooting) 了解消除循環的方法。

### 注入參數 (KOIN-D005, KOIN-D006) {id="injected-parameters-koin-d005-koin-d006"}

定義中宣告了 `@InjectedParam` 參數，但呼叫點未傳入這些參數：

```
[Koin][KOIN-D006] com.myapp.Greeter requires 1 injected param(s) but get<Greeter>() has no parametersOf(...) at the call site.
  Expected @InjectedParam slots: name: kotlin.String
  Pass them via parametersOf(...) inside the trailing lambda.
```

`KOIN-D005` 回報帶有錯誤引數數量或錯誤型別的 `parametersOf(...)`（`Mismatched parametersOf(...) for ...`）。這兩項檢查僅在外掛程式能夠讀取呼叫所包含的 `parametersOf(...)` 時才會執行。請參閱 [Injected Parameters](/docs/reference/koin-core/injection-parameters)。

### 不支援的 suspend 繫結 (KOIN-D007) {id="unsupported-suspend-binding-koin-d007"}

型別繼承自 suspend 函式型別的定義會被拒絕，因為 Koin 無法在執行時期對其進行解析：

```kotlin
fun interface SetUsernameUseCase : suspend (String) -> Unit

@Factory
fun provideSetUsernameUseCase(repository: UserRepository): SetUsernameUseCase =
    SetUsernameUseCase(repository::setUsername)
```

```
[Koin][KOIN-D007] Unsupported binding: com.myapp.SetUsernameUseCase extends kotlin.coroutines.SuspendFunction1
  Suspend function injection is not yet supported by Koin runtime.
  Remove the @Single / @Factory / @Scoped registration, or refactor the binding type to not extend a suspend function.
  Tracked at https://github.com/InsertKoinIO/koin-compiler-plugin/issues/16
```

解決方法：使用包含 `suspend` 方法的常規介面，或是使用類別。

### 所有代碼 {id="all-codes"}

| 代碼 | 嚴重程度 | 訊息開頭 |
|------|----------|---------------------|
| `KOIN-D001` | Error | `Missing dependency:` |
| `KOIN-D002` | Error | `Missing definition:`（本模組中的呼叫點） |
| `KOIN-D003` | Error | `Missing definition:`（相依模組中的呼叫點） |
| `KOIN-D004` | Error | `Circular dependency detected:` |
| `KOIN-D005` | Error | `Mismatched parametersOf(...) for` |
| `KOIN-D006` | Error | `<Type> requires N injected param(s) but` |
| `KOIN-D007` | Error | `Unsupported binding:` |
| `KOIN-D008` | Error | `Module id collision:`（兩個模組名稱編碼成相同的提示名稱：請重新命名其中一個） |
| `KOIN-W001` | Warning | `Module '<name>' is not loaded at startKoin` |
| `KOIN-W003` | Warning | `Graph not verifiable at compile time:` |
| `KOIN-W004` | Warning | `Custom @Configuration label '<label>' requested by` |
| `KOIN-W005` | Warning | `Definition '<name>' in dependency module` |
| `KOIN-W006` | Warning | `<definition>'s bind(...) argument could not be resolved` |
| `KOIN-A001` | Error | `@KoinViewModel definition '<name>' cannot be generated`（請新增 `io.insert-koin:koin-core-viewmodel`） |
| `KOIN-A002` | Error | `@KoinWorker definition '<name>' cannot be generated`（請新增 `io.insert-koin:koin-android-workmanager`） |
| `KOIN-A003` | Error | `Cannot generate <Module>.module()`（請新增 `io.insert-koin:koin-core`） |
| `KOIN-S001` | Error | `create(::<Type>) must be the only instruction in the lambda`（請參閱 [unsafeDslChecks](/docs/reference/koin-annotations/options#unsafedslchecks)） |
| `KOIN-P001` | Warning | `Missing @PropertyValue default:` |
| `KOIN-M001` | Warning | `@Monitor: Kotzilla SDK not found on classpath` |

這些警告說明了外掛程式無法檢查的內容。`KOIN-W003`、`KOIN-W004` 與 `KOIN-W005` 於 [限制](#limits) 中說明。`KOIN-W006` 表示 `bind`/`binds` 引數不是常值 `X::class`（或其常值陣列或清單）：請使用常值。

## 外部型別：`@Provided` {id="external-types-provided"}

某些型別是從 Koin 宣告之外進入圖中的：例如平台物件、SDK 執行個體、在執行時期手動新增的定義。請將它們標記為 `@Provided`，這樣外掛程式就不會將它們回報為遺漏：

```kotlin
// 標註在類別上：跳過此型別的所有使用處
@Provided
class FirebaseAnalytics

// 標註在參數上：僅跳過此參數
@Singleton
class PaymentProcessor(@Provided val gateway: PaymentGateway)
```

`@Provided`（`org.koin.core.annotation`）適用於所有宣告樣式：即使定義位於 DSL 模組中，也可以在類別或建構函式參數上加上註解。它僅會改變編譯期檢查。在執行時期，該型別仍會透過 `get()` 解析，若無人宣告則會失敗。建議優先使用參數形式：在類別上使用時，會關閉該型別所有使用處的檢查。

以下型別一律接受，無需加上 `@Provided`：

- `android.content.Context`
- `android.app.Application`
- `android.app.Activity`
- `androidx.activity.ComponentActivity`
- `androidx.fragment.app.Fragment`
- `androidx.lifecycle.SavedStateHandle`
- `androidx.work.WorkerParameters`

### 在執行時期載入的模組 {id="modules-loaded-at-runtime"}

在 `startKoin` 之後透過 `loadKoinModules(...)` 載入的模組不屬於外掛程式組裝圖的一部分。外掛程式無法得知該呼叫何時執行，或是否會執行。僅來自此類模組的型別必須標記為 `@Provided`：

```kotlin
val featureModule = module { single<Repository>() }   // 稍後載入
val appModule = module { single<Service>() }          // Service(@Provided val repo: Repository)

startKoin { modules(appModule) }
loadKoinModules(featureModule)
```

外掛程式仍會透過 `KOIN-W001` 將執行時期載入的模組回報為無法到達。將其新增至 `modules()` 會失去按需載入的目的，因此您可以忽略此警告（僅在啟用 `allWarningsAsErrors` 時才會導致組建失敗）。

## 特殊參數 {id="special-parameters"}

**Scope**：型別為 `org.koin.core.scope.Scope` 的參數會接收目前的作用域。它不會受到檢查，因為程式碼會動態地從中解析型別。

```kotlin
@Scoped
class ScopedService(val scope: Scope) {
    fun load() = scope.get<SomeDependency>()
}
```

**@ScopeId**：參數是從另一個作用域中解析的，依名稱（`@ScopeId(name = "user_session")`）或依型別（`@ScopeId(UserSessionScope::class)`，作用域 ID 為完整類名）。它不會受到檢查，因為該作用域僅在執行時期存在。請參閱 [Scopes](/docs/reference/koin-core/scopes)。

**@Property**：此參數會讀取 Koin 屬性。若未宣告 `@PropertyValue("key")` 預設值，組建會收到警告，且該屬性必須在啟動時設定：

```kotlin
@PropertyValue("api.timeout")
val defaultTimeout = 30

@Factory
class ApiClient(@Property("api.timeout") val timeout: Int)    // OK

@Factory
class Other(@Property("missing.key") val value: String)
// [Koin][KOIN-P001] Missing @PropertyValue default: "missing.key" ...
```

**預設值**：在 `skipDefaultValues = true`（預設值）的情況下，具有 Kotlin 預設值的參數會直接採用該預設值而不進行檢查。請參閱 [skipDefaultValues](/docs/reference/koin-annotations/options#skipdefaultvalues)。

## 泛型型別 {id="generic-types"}

Koin 是在抹除後的類別（erased class）上解析定義：型別引數不是尋找索引鍵的一部分。外掛程式也遵循相同的規則。`get<Box<Int>>()` 會針對任何 `Box` 定義進行檢查，而 `single<Box<A>>()` 和 `single<Box<B>>()` 屬於相同的定義，因此第二個會覆寫第一個。

若要保留同一個泛型型別的多個執行個體，請使用 `named<T>()` 為每個執行個體指定衍生自其型別引數的型別限定詞。該模式在 [Advanced Patterns](/docs/reference/koin-core/advanced-patterns) 中有詳細說明。

## 累加組建 {id="incremental-builds"}

完整圖檢查會在聚合模組（包含入口點的模組）編譯時執行。在其他地方發生變更時（例如在 `module { }` 的 Lambda 主體內），Kotlin 累加編譯可能會跳過該模組。外掛程式會在偵測到入口點的模組中啟用 `strictSafety`，以確保每次組建都會執行檢查。詳細資訊與應對方式請參閱：[strictSafety](/docs/reference/koin-annotations/options#strictsafety)。

## 限制 {id="limits"}

- **動態模組清單**：無法追蹤 `modules(if (debug) a else b)`、`modules(*list)` 或在執行時期建立的清單。外掛程式會回報 `KOIN-W003` 並跳過該入口點的完整圖檢查。請直接傳入模組以維持檢查機制。
- **手寫 Lambda 與循環**：`single { A(get()) }` Lambda 不會在循環檢查中加入邊，因此無法偵測透過手寫 Lambda 產生的循環相依。在需要注意循環的地方，請使用 `single<T>()`、`singleOf(::T)` 或 `create(::T)`。
- **自訂設定標籤**：標記有非 `"default"` 標籤的模組，最多只能在一層 `implementation` 相依性範圍內被搜尋到（`KOIN-W004`）。請新增直接相依性，或將該模組列於 `@KoinApplication(modules = [...])` 中。
- **相距過遠的函式定義**：在兩層或更多層 `implementation` 躍點之外的模組中，`@Module` 函式定義或限定的頂層函式對檢查不可見（`KOIN-W005`）。它在執行時期仍可正常運作。請新增直接相依性以進行檢查。
- **在執行時期載入的模組**：請參閱 [在執行時期載入的模組](#modules-loaded-at-runtime)。

## 取代 verify() 和 checkModules() {id="replacing-verify-and-checkmodules"}

啟用編譯期安全性後，組建會在每次編譯時檢查 `verify()` 和 `checkModules()` 測試所檢查的項目。對於外掛程式完全檢查的圖，您可以移除這些測試。若圖被外掛程式回報為無法驗證（`KOIN-W003`）或使用了在執行時期載入的模組，請保留這些測試。請參閱 [Verifying modules](/docs/reference/koin-test/verify)。

## 相關內容 {id="related"}

- [Compiler Plugin Options](/docs/reference/koin-annotations/options)：`compileSafety`、`strictSafety`、`skipDefaultValues` 及其他選項。
- [Koin Compiler Plugin](/docs/intro/koin-compiler-plugin)：外掛程式的功能與運作方式。
- [Definitions](/docs/reference/koin-core/definitions)：建構函式參數的解析方式。
- [Troubleshooting](/docs/reference/koin-core/troubleshooting)：執行時期錯誤、記錄器（logger）與循環相依。
- [IDE Plugin](/docs/tooling/ide-plugin)：在 IDE 中檢視圖並巡訪定義。
- [Playground apps](https://github.com/InsertKoinIO/koin-compiler-plugin/tree/main/playground-apps)：包含使用註解（`app-annotations/`）和 DSL（`app-dsl/`）的範例應用程式。