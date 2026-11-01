---
title: 疑難排解
---

# 疑難排解

本頁面列出了 Koin 所回報的錯誤、其成因以及修正方式。內容亦涵蓋了在問題波及使用者之前及早發現問題的工具，以及導致這些錯誤的常見模式。文中的錯誤訊息均依照 Koin 輸出的原始文字呈現，因此你可以直接在此頁面中搜尋堆疊追蹤中的文字。

## 及早發現問題 {id="find-problems-early"}

Koin 提供了三種查看配置錯誤的方式，依偵測時機由早到晚依序為：

- **編譯期**：透過 [Koin 編譯器外掛程式](/docs/intro/koin-compiler-plugin)，遺漏相依性或相依性循環會導致組建失敗。錯誤訊息中會指出定義名稱、參數以及模組。所有檢查項目與錯誤代碼請參閱[編譯期安全性](/docs/reference/koin-compiler/compile-safety)。
- **在 IDE 中**：在你編寫程式碼的同時，[Koin IDE 外掛程式](/docs/tooling/ide-plugin)會顯示各個定義宣告於何處、被使用於何處，以及遺漏了哪些項目。
- **在測試中**：若未使用編譯器外掛程式，可在 JVM 單元測試中對你的模組呼叫 `verify()`。它會檢查每個建構函式參數是否皆有對應的定義。請參閱[驗證你的配置](/docs/reference/koin-test/verify)。

```kotlin
class ModuleCheckTest {

    @Test
    fun checkKoinModules() {
        appModule.verify()
    }
}
```

## 記錄日誌 {id="logging"}

Koin 預設不記錄任何日誌 (`EmptyLogger`)。啟用日誌記錄可檢視每個定義的載入以及每個執行個體的解析情況：

```kotlin
startKoin {
    printLogger(Level.DEBUG)
    modules(appModule)
}
```

| 級別 | 顯示內容 |
|-------|--------------|
| `Level.DEBUG` | 每次解析的詳細資訊，包含 Koin 搜尋過的作用域。用於理解失敗原因 |
| `Level.INFO` | 啟動摘要，例如 `Started 42 definitions in 1.2 ms`。為 `printLogger()` 的預設級別 |
| `Level.WARNING` | 警告資訊，例如某個定義覆寫了另一個定義 |
| `Level.ERROR` | 僅記錄錯誤 |
| `Level.NONE` | 不記錄任何內容 |

在 Android 上，請使用 `androidLogger(Level.DEBUG)` 輸出至 Logcat。日誌記錄器選項請參閱[啟動 Koin](/docs/reference/koin-core/starting-koin)。

`Level.DEBUG` 會拖慢解析速度。請僅將其保留用於偵錯工作階段，切勿用於發布組建。

## 執行期錯誤 {id="runtime-errors"}

### 找不到定義 (No definition found) {id="no-definition-found"}

```
NoDefinitionFoundException: No definition found for type 'com.example.UserRepository' on scope '['_root_']'.
Check or add definition for type 'com.example.UserRepository' in scope '_root_'.
```

Koin 被請求取得一個任何已載入模組皆未宣告的型別。請依下列順序進行檢查：

- **模組未載入**：該定義存在，但其所屬模組未包含在 `modules(...)` 或 `includes(...)` 中。
- **缺少限定詞**：該定義定義了限定詞但請求時未指定，或者反之亦然。此時訊息中會包含 `and qualifier '...'`。請參閱[限定詞](/docs/reference/koin-core/qualifiers)。
- **介面未綁定**：定義中宣告的是 `UserRepositoryImpl`，而請求的卻是 `UserRepository`。請綁定該介面，參閱[定義](/docs/reference/koin-core/definitions#interface-binding)。
- **作用域錯誤**：該定義在某個作用域中標記為 `scoped`，而請求來自另一個作用域或根作用域。錯誤訊息中會列出搜尋過的作用域。請參閱[作用域](/docs/reference/koin-core/scopes)。

針對 `SavedStateHandle`，訊息則會提示其由 ViewModel `CreationExtras` 提供。請使用 `koinViewModel()` 或 `by viewModel()` 解析 ViewModel，並將 `SavedStateHandle` 作為建構函式參數帶入。請參閱 [ViewModel](/docs/reference/koin-core/viewmodel)。

### 無法建立執行個體 (Could not create instance) {id="could-not-create-instance"}

```
InstanceCreationException: Could not create instance for '[Singleton: 'com.example.UserRepository']'
```

Koin 找到了定義，但建立執行個體時擲出了例外狀況。真正的成因是堆疊追蹤中的巢狀例外狀況 (`Caused by:`)。通常是其中一個建構函式參數發生了 `NoDefinitionFoundException`，或是建構函式本身擲出了例外狀況。

### 已存在的定義 (Already existing definition) {id="already-existing-definition"}

```
DefinitionOverrideException: Already existing definition for [Singleton: 'com.example.ApiService'] at com.example.ApiService::_root_
```

兩個模組宣告了相同的型別與限定詞，且覆寫功能已停用 (`allowOverride(false)`)。請移除重複項、為其指定[限定詞](/docs/reference/koin-core/qualifiers)，或使用 `.override()` 標記預期保留的項目。請參閱[定義](/docs/reference/koin-core/definitions#overriding-a-definition)。

### 作用域錯誤 {id="scope-errors"}

| 訊息 | 例外狀況 | 成因 |
|---------|-----------|-------|
| `Scope 'user_session' is closed` | `ClosedScopeException` | 作用域已被關閉，但仍有程式碼向其請求執行個體。常見於存活時間長於螢幕生命週期的回呼或協同程式 |
| `No scope found for id 'user_session'` | `ScopeNotCreatedException` | 在呼叫 `createScope(id, ...)` 之前就呼叫了 `getScope(id)`。請使用 `getOrCreateScope` 或先建立作用域 |
| `Scope with id 'user_session' is already created` | `ScopeAlreadyCreatedException` | 使用相同的 ID 呼叫了兩次 `createScope` |
| `No value for scope 'user_session' in [Scoped: ...]` | `MissingScopeValueException` | 使用 `declare()` 宣告的作用域值未提供給此作用域 |
| `Activity should implement AndroidScopeComponent` | `IllegalStateException` | 在沒有作用域的 Activity 中使用了 Android 作用域 API。請參閱 [Android 作用域](/docs/reference/koin-android/scope) |

作用域生命週期請參閱[作用域](/docs/reference/koin-core/scopes)。

### 插入參數 (Injected parameters) {id="injected-parameters"}

| 訊息 | 例外狀況 | 成因 |
|---------|-----------|-------|
| `Can't get injected parameter #0 from DefinitionParameters[] for type 'kotlin.String'` | `NoParameterFoundException` | 定義讀取了呼叫端未透過 `parametersOf(...)` 傳遞的參數 |
| `No value found for type 'kotlin.String'` | `DefinitionParameterException` | `params.get<T>()` 找不到該型別的參數 |

請參閱[插入參數](/docs/reference/koin-core/injection-parameters)。

### 啟動與屬性 {id="start-and-properties"}

| 訊息 | 例外狀況 | 成因 |
|---------|-----------|-------|
| `KoinApplication has not been started` | `IllegalStateException` | 程式碼在 `startKoin` 之前便使用了全域上下文 (`KoinComponent`、`by inject()`)。在 Android 上，請檢查資訊清單 (manifest) 中是否宣告了你的 `Application` 類別 |
| `A Koin Application has already been started` | `KoinApplicationAlreadyStartedException` | `startKoin` 被呼叫了兩次。在測試中，請在每個測試執行後呼叫 `stopKoin()` |
| `Can't resolve Context instance. Please use androidContext() function in your KoinApplication configuration.` | `MissingAndroidContextException` | 定義使用了 `androidContext()`，但 `startKoin` 中未包含 `androidContext(this)` |
| `Property 'api_url' not found` | `MissingPropertyException` | 呼叫了 `getProperty("api_url")`，但該屬性不存在且未提供預設值 |
| `No properties found for file '/koin.properties'` | `NoPropertyFileFoundException` | `fileProperties()` 找不到該檔案 |

### 未套用編譯器外掛程式 {id="compiler-plugin-not-applied"}

```
NotImplementedError: Error while using 'single<T>()'. The Koin Compiler plugin is missing. Please fix your setup to use 'io.insert-koin.compiler.plugin' Koin Gradle Plugin.
```

程式碼使用了編譯器外掛程式 DSL (`single<T>()`、`factory<T>()`、`startKoin<T>()`)，但該外掛程式並未套用至此 Gradle 模組。請參閱[編譯器外掛程式設定](/docs/setup/compiler-plugin)。

## 循環相依 (Circular dependencies) {id="circular-dependencies"}

當兩個類別在各自的建構函式中互相需要對方時，就會產生循環：

```kotlin
class SessionManager(private val authService: AuthService)
class AuthService(private val sessionManager: SessionManager)
```

使用編譯器外掛程式時，組建將會失敗：

```
[Koin][KOIN-D004] Circular dependency detected:
  com.example.AuthService → com.example.SessionManager → com.example.AuthService
  Break with Lazy<T> injection or refactor to remove the cycle.
```

使用 `verify()` 時，測試將會失敗並顯示 `Circular injection between ... Fix your Koin configuration!`。

若未進行這些檢查，Koin 不會偵測到該循環。每個類別會持續解析對方直到呼叫堆疊溢位，應用程式將因 `StackOverflowError` 而崩潰。

### 使用 Lazy 打破循環 {id="break-the-cycle-with-lazy"}

將其中一端設為延遲載入 (Lazy)，使其在初次使用時才進行解析，而非在建構過程中：

**編譯器外掛程式 DSL**
```kotlin
class AuthService(private val sessionManager: Lazy<SessionManager>)

val authModule = module {
    single<SessionManager>()
    single<AuthService>()
}
```

**註解**
```kotlin
@Singleton
class SessionManager(private val authService: AuthService)

@Singleton
class AuthService(private val sessionManager: Lazy<SessionManager>)
```

**建構函式 / 經典 DSL**
```kotlin
class AuthService(private val sessionManager: Lazy<SessionManager>)

val authModule = module {
    single { SessionManager(get()) }
    single { AuthService(inject()) }
}
```

`AuthService` 絕不可在其建構函式或 `init` 區塊中讀取 `sessionManager.value`，否則循環仍會重現。

### 消除循環 {id="remove-the-cycle"}

延遲參數雖然隱藏了問題，但耦合依然存在。多數循環意味著這兩個類別共擔了某項職責。請將其移至兩者共同相依的第三個類別，或讓其中一方相依於僅公開所需功能的介面。

```kotlin
class TokenStore

class SessionManager(private val tokenStore: TokenStore)
class AuthService(private val tokenStore: TokenStore)
```

## 容易導致錯誤的模式 {id="patterns-that-cause-errors"}

**在方法內部進行解析**：在類別主體內呼叫 `get()` 或使用 `KoinComponent` 會隱藏其相依性。編譯器外掛程式無法對其進行檢查，若遺漏定義，只有在該方法執行時才會失敗。建議優先使用建構函式參數。需要使用它的情況請參閱 [KoinComponent](/docs/reference/koin-core/koin-component)。

```kotlin
// 隱藏的相依性，延遲解析
class UserViewModel : ViewModel(), KoinComponent {
    fun loadUser() {
        val repository = get<UserRepository>()
    }
}

// 明確的相依性，在組建期進行檢查
class UserViewModel(private val repository: UserRepository) : ViewModel()
```

**自行建立相依物件**：在類別內部使用 `private val api = ApiService()` 會繞過 Koin。該類別將無法使用假物件 (fake) 進行測試，且其相依性也無法受到檢查。

**為不同型別使用限定詞**：只有在多個定義提供相同型別時才需要限定詞。`UserRepository` 與 `OrderRepository` 本身就已經是不同的型別。

**在定義內執行耗時工作**：定義應該用於建立物件，而非執行邏輯。`single { }` Lambda 中的副作用會在不可預測的時間點（初次使用時）執行，且若設定為 `createdAtStart` 則會在主執行緒上執行。請將工作保留在類別內部，或將啟動工作轉移至[延遲模組](/docs/reference/koin-core/lazy-modules)。

**全應用程式僅使用單一模組**：單一龐大的模組難以在測試中覆寫，也難以進行延遲載入。請依功能或架構層進行拆分。請參閱[模組](/docs/reference/koin-core/modules)。

**關閉後仍保留作用域執行個體**：儲存在 `single` 或靜態欄位中對作用域執行個體的參照，會在該作用域關閉後仍將其保留於記憶體中，後續呼叫可能導致 `ClosedScopeException`。請僅將作用域執行個體注入至生命週期相同或更短的物件中。

:::tip
某些問題只會在真實裝置上顯現：啟動時解析過慢、作用域從未關閉、罕見路徑中的崩潰。若要在真實使用者工作階段中觀察這些問題，請參閱[生產環境監控](/docs/tooling/production-monitoring)。
:::

## 相關內容 {id="related"}

- [編譯期安全性](/docs/reference/koin-compiler/compile-safety)：各項組建期檢查及其錯誤代碼。
- [驗證你的配置](/docs/reference/koin-test/verify)：在未使用編譯器外掛程式的情況下，於測試中檢查模組。
- [啟動 Koin](/docs/reference/koin-core/starting-koin)：日誌記錄器與啟動選項。
- [作用域](/docs/reference/koin-core/scopes)：作用域的生命週期與關閉。
- [IDE 外掛程式](/docs/tooling/ide-plugin)：在編寫程式碼的同時檢視相依圖。