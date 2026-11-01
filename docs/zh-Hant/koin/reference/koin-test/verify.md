---
title: 驗證你的配置
---

# 驗證你的配置

本頁面介紹 `verify()`（無需執行即可檢查 Koin 配置的測試 API）以及已棄用的 `checkModules()`。此外還會說明這兩者與 Koin Compiler Plugin 的編譯期檢查之間的關係，以協助你了解是否仍需要它們。你應該已經了解如何撰寫[使用 Koin 的單元測試](/docs/reference/koin-test/testing)。

## 你仍需要 verify() 嗎？ {id="do-you-still-need-verify"}

[Koin Compiler Plugin](/docs/reference/koin-compiler/compile-safety) 會在建置時檢查完整的相依圖：缺少的定義、限定詞不符、作用域錯誤以及 `get()` / `inject()` 呼叫點。當它已涵蓋你的專案時，`verify()` 測試不會帶來任何額外好處，你可以將其刪除。

在下列情況下，你仍需要 `verify()`：

- 未使用 Compiler Plugin：你的專案在沒有外掛程式的情況下使用 Constructor 或 Classic DSL。（已棄用的註解 KSP 處理器有其專屬的 `KOIN_CONFIG_CHECK` 選項。）
- 建置時無法得知相依圖：外掛程式無法解析透過 `if` / `when` 或可變參數（varargs）構建的模組清單。它會回報 `KOIN-W003` 並略過該入口點的檢查。
- 函式庫模組：未擁有獨立 `startKoin` / `@KoinApplication` 的函式庫或功能模組，在應用程式將其組裝之前不會進行缺少相依性檢查。在函式庫中編寫 `verify()` 測試可以對其單獨進行檢查。
- 延遲載入模組：你使用[延遲載入模組](/docs/reference/koin-core/lazy-modules)載入相依圖的一部分，並希望針對完整配置進行單一測試（請參閱[模組與延遲載入模組結合使用](#modules-and-lazy-modules-together)）。

## verify() {id="verify"}

`verify()` 是 `Module` 的擴充函式，可於 `koin-test` 中的 JVM 上使用。它會讀取每個定義類別的建構函式，並檢查每個參數型別在該模組或其包含的模組中是否有對應的定義。它不會執行任何定義，也不需要 mock。

```kotlin
val appModule = module {
    includes(dataModule, networkModule)
    viewModel<UserViewModel>()
}
```

```kotlin
import org.koin.test.verify.verify

class AppModuleCheck {

    @Test
    fun checkKoinModule() {
        appModule.verify()
    }
}
```

當缺少相依性時，`verify()` 會拋出 `MissingKoinDefinitionException` 並輸出建議的修復方式。當兩個建構函式之間存在循環相依時，它會拋出 `CircularInjectionException`。

若要檢查多個未透過 `includes()` 連結的模組，請使用 `listOf(dataModule, uiModule).verifyAll()`。

### verify() 接受的條件 {id="what-verify-accepts"}

建構函式參數在符合下列情況時即通過檢查：

- 已宣告：該型別的定義存在於模組樹中。
- 選填：該參數具有預設值。如果不存在定義，`verify()` 會輸出警告。
- 已包裝：其 `T` 已宣告的 `Lazy<T>` 或 `List<T>`。
- 列入白名單：其型別在 `extraTypes` 中，或是基本型別（`String`、`Int`、`Long`、`Double`）。
- 注入或提供：該參數帶有 `@InjectedParam` 或 `@Provided` 註解，或是使用 `injections` 宣告。

`verify()` 僅讀取建構函式。它不會檢查定義 Lambda 內部編寫的限定詞、屬性或 `get()` 呼叫。

### 於執行階段提供的型別 {id="types-provided-at-runtime"}

某些型別從未在模組中宣告：例如架構物件，或是由平台建立的值。請將它們新增至 `extraTypes`：

```kotlin
appModule.verify(
    extraTypes = listOf(HttpClientEngine::class, Clock::class)
)
```

在 Android 上，請使用來自 `koin-android-test` 的 `androidVerify()`。它會自動為你加入 `Context`、`Activity`、`Fragment`、`Application`、`SavedStateHandle` 和 `WorkerParameters`：

```kotlin
import org.koin.android.test.verify.androidVerify

@Test
fun checkKoinModule() {
    appModule.androidVerify()
}
```

### 注入的參數 {id="injected-parameters"}

透過 `parametersOf()` 傳遞的參數沒有定義，因此 `verify()` 會將其回報為缺少。請使用 `injections` 宣告它：

```kotlin
class UserPresenter(val userId: String, val repository: UserRepository)

val presenterModule = module {
    factory { (userId: String) -> UserPresenter(userId, get()) }
}

@Test
fun checkKoinModule() {
    presenterModule.verify(
        injections = injectedParameters(
            definition<UserPresenter>(String::class)
        )
    )
}
```

或者為建構函式參數加上註解。`@InjectedParam` 標記透過 `parametersOf()` 傳遞的值，`@Provided` 標記在 Koin 模組外部提供的型別：

```kotlin
class UserPresenter(@InjectedParam val userId: String, val repository: UserRepository)

class SyncWorker(@Provided val params: WorkerParameters, val repository: UserRepository)
```

這兩個註解皆來自 `koin-core-annotations`，且與 Compiler Plugin 讀取的註解相同（請參閱[注入的參數](/docs/reference/koin-core/injection-parameters)）。

### 模組與延遲載入模組結合使用 {id="modules-and-lazy-modules-together"}

`koin-test-coroutines` 為 `ModuleConfiguration` 增加了 `verify()`，可將常規模組與[延遲載入模組](/docs/reference/koin-core/lazy-modules)作為單一相依圖一起檢查：

```kotlin
val configuration = moduleConfiguration {
    modules(coreModule)
    lazyModules(featureModule)
}

@Test
fun checkConfiguration() {
    configuration.verify()
}
```

`moduleConfiguration` 與此 `verify()` 皆屬於實驗性功能（`@KoinExperimentalAPI`）。

## checkModules()（已棄用） {id="checkmodules-deprecated"}

:::warning
`checkModules()`、`checkKoinModules()` 及其 DSL 已被棄用。請遷移至 `verify()` 或 Compiler Plugin。
:::

與 `verify()` 不同的是，`checkModules()` 會啟動模組並建立每個定義，因此它需要執行階段解析的所有項目的值。你可能會在較舊的專案中看到它：

```kotlin
@Test
fun checkAllModules() {
    koinApplication {
        modules(appModule)
        checkModules {
            withInstance<Context>()
            withParameter<UserPresenter> { "user-1" }
            withProperty("api_url", "http://localhost")
        }
    }
}

// or
@Test
fun checkAllModules() {
    checkKoinModules(listOf(appModule))
}
```

檢查 DSL 包含：

- `withInstance(value)`：將 `value` 新增至相依圖。`withInstance<T>()` 會新增 `T` 的 mock，並且需要 `MockProviderRule`（請參閱[使用 declareMock 進行 Mock](/docs/reference/koin-test/testing#mocking-with-declaremock)）。
- `withParameter<T> { value }`：用於建立 `T` 的注入參數。若有多個參數，請使用 `withParameters<T> { parametersOf(a, b) }`。
- `withProperty(key, value)`：新增一個 Koin 屬性。
- `withScopeLink(scope, targetScope)`：為檢查[連結](/docs/reference/koin-core/scopes)兩個作用域。

若要遷移至 `verify()`：移除架構型別的 `withInstance`（改用 `extraTypes` 或 `androidVerify()`），並將 `withParameter` 替換為 `injections` 或 `@InjectedParam`。

## 相關內容 {id="related"}

- [編譯期安全性](/docs/reference/koin-compiler/compile-safety)：Compiler Plugin 在建置時所檢查的項目。
- [單元測試](/docs/reference/koin-test/testing)：在測試中啟動 Koin、覆寫與 mock 定義。
- [注入參數](/docs/reference/koin-core/injection-parameters)：`parametersOf` 與 `@InjectedParam`。
- [延遲載入模組](/docs/reference/koin-core/lazy-modules)：在背景載入相依圖的一部分。
- [疑難排解](/docs/reference/koin-core/troubleshooting)：諸如 `NoDefinitionFoundException` 等執行階段錯誤。