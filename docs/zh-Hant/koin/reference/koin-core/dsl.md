---
title: DSL 參考
---

# DSL 參考

本頁以表格形式列出每個 Koin DSL 關鍵字，包含要匯入的套件以及說明該關鍵字之頁面的連結。內容涵蓋三種 DSL 形式：Compiler Plugin DSL、Constructor DSL（建構函式參照）以及 Classic DSL（Lambda）。關於註解，請參閱 [註解參考](/docs/reference/koin-annotations/annotations-inventory)。

## DSL 風格 {id="dsl-styles"}

| 風格 | 範例 | 匯入 |
|-------|---------|--------|
| Compiler Plugin DSL | `single<UserRepository>()` | `org.koin.plugin.module.dsl.*` |
| Constructor DSL | `singleOf(::UserRepository)` | `org.koin.core.module.dsl.*` |
| Classic DSL | `single { UserRepository(get()) }` | `org.koin.dsl.*` |

Compiler Plugin DSL 需要 [Koin 編譯器外掛程式](/docs/setup/compiler-plugin)。該外掛程式會讀取建構函式、產生 `get()` 呼叫，並在建置期檢查相依關係圖。如果沒有該外掛程式，呼叫如 `single<T>()` 會在執行期擲出：`Error while using 'single<T>()'. The Koin Compiler plugin is missing. Please fix your setup to use 'io.insert-koin.compiler.plugin' Koin Gradle Plugin.`

當套用編譯器外掛程式時，建構函式參照形式（`singleOf(::T)`）也會受到檢查。手寫的 Lambda 則不會：該外掛程式只追蹤它提供的型別，而非 Lambda 主體執行的內容。若要選擇適合的風格，請參閱 [選擇你的風格](/docs/intro/choosing-your-style)。

## Application DSL {id="application-dsl"}

用於建立並啟動 Koin 容器的函式。請參閱 [啟動 Koin](/docs/reference/koin-core/starting-koin)。

| 函式 | 套件 | 功能說明 |
|----------|---------|--------------|
| `startKoin { }` | `org.koin.core.context` | 建立 `KoinApplication` 並將其註冊至全域上下文。若已經啟動則擲出 `KoinApplicationAlreadyStartedException` |
| `startKoin<T>()` | `org.koin.plugin.module.dsl` | 編譯器外掛程式：使用 `@KoinApplication` 類別 `T` 的模組啟動 Koin |
| `koinApplication { }` | `org.koin.dsl` | 建立獨立的 `KoinApplication`，不註冊至全域。請參閱 [上下文隔離](/docs/reference/koin-core/context-isolation) |
| `koinApplication<T>()` | `org.koin.plugin.module.dsl` | 編譯器外掛程式：包含 `T` 之模組的獨立應用程式 |
| `koinConfiguration { }` | `org.koin.dsl` | 宣告可重複使用的 `KoinConfiguration` 而不啟動 Koin |
| `koinConfiguration<T>()` | `org.koin.plugin.module.dsl` | 編譯器外掛程式：包含 `T` 之模組的配置 |
| `stopKoin()` | `org.koin.core.context` | 關閉全域容器及其所有執行個體 |
| `loadKoinModules(module)` | `org.koin.core.context` | 將模組載入至已啟動的全域容器中 |
| `unloadKoinModules(module)` | `org.koin.core.context` | 卸載模組並捨棄其執行個體 |

### `startKoin { }` 與 `koinApplication { }` 內部 {id="inside-startkoin-and-koinapplication"}

| 函式 | 功能說明 |
|----------|--------------|
| `modules(...)` | 載入模組：單一 `Module`、可變參數或 `List<Module>` |
| `modules(UserModule::class, ...)` | 編譯器外掛程式：載入從 `@Module` 類別產生的模組 |
| `module<UserModule>()` | 編譯器外掛程式：載入從單一 `@Module` 類別產生的模組 |
| `withConfiguration<T>()` | 編譯器外掛程式：將 `@KoinApplication` 類別 `T` 的模組新增至現有應用程式 |
| `includes(configuration)` | 套用一個或多個 `KoinConfiguration` 或 `KoinAppDeclaration` 區塊 |
| `printLogger(level)` | 輸出記錄至標準輸出。預設層級為 `Level.INFO` |
| `logger(logger)` | 使用你自己的 `Logger` 實作。預設為 `EmptyLogger`（無輸出） |
| `properties(map)` | 從 `Map<String, Any>` 載入屬性 |
| `fileProperties(fileName)` | 僅限 JVM。從檔案載入屬性，預設為 `/koin.properties` |
| `environmentProperties()` | 僅限 JVM。載入系統屬性與環境變數 |
| `allowOverride(Boolean)` | 允許或禁止定義覆寫。預設為 `true`。請參閱 [定義](/docs/reference/koin-core/definitions#overriding-a-definition) |
| `createEagerInstances()` | 建立 `createdAtStart` 定義。`startKoin` 與 `koinApplication` 已預先呼叫此函式 |
| `options(...)` | 設定 Koin 選項，例如 `viewModelScopeFactory()`。請參閱 [ViewModel](/docs/reference/koin-core/viewmodel) |
| `lazyModules(...)` | 在背景載入延遲模組（`koin-core-coroutines`）。請參閱 [延遲模組](/docs/reference/koin-core/lazy-modules) |

`modules(A::class)`、`module<T>()` 與 `withConfiguration<T>()` 用於一般的 `startKoin { }` 或 `koinApplication { }` 中，而非 `startKoin<T> { }` 內部。

平台擴充功能為此區塊新增了更多函式：

| 函式 | 構件 | 參閱 |
|----------|----------|-----|
| `androidContext(context)`, `androidLogger(level)`, `androidFileProperties()` | `koin-android` | [Android 啟動](/docs/reference/koin-android/start) |
| `fragmentFactory()` | `koin-android` | [Fragment Factory](/docs/reference/koin-android/fragment-factory) |
| `workManagerFactory()` | `koin-androidx-workmanager` | [WorkManager](/docs/reference/koin-android/workmanager) |
| `slf4jLogger(level)` | `koin-logger-slf4j` | [Ktor](/docs/reference/koin-ktor/ktor) |

## Module DSL {id="module-dsl"}

請參閱 [模組](/docs/reference/koin-core/modules) 與 [延遲模組](/docs/reference/koin-core/lazy-modules)。

| 函式 | 套件 | 功能說明 |
|----------|---------|--------------|
| `module { }` | `org.koin.dsl` | 宣告模組 |
| `module(createdAtStart = true) { }` | `org.koin.dsl` | 該模組中的每個 `single` 都會在啟動時建立 |
| `lazyModule { }` | `org.koin.dsl` | 宣告稍後在背景載入的模組（`koin-core-coroutines`） |
| `includes(otherModule, ...)` | `org.koin.dsl` | 包含其他模組，以可變參數或 `Collection<Module>` 形式提供 |
| `moduleA + moduleB` | `org.koin.dsl` | 建置 `List<Module>` |

## 定義 {id="definitions"}

每個關鍵字所建立的內容已在 [定義](/docs/reference/koin-core/definitions) 中說明。

| 定義 | Compiler Plugin DSL | Constructor DSL | Classic DSL |
|------------|---------------------|-----------------|-------------|
| Single | `single<T>()` | `singleOf(::T)` | `single { T(get()) }` |
| Factory | `factory<T>()` | `factoryOf(::T)` | `factory { T(get()) }` |
| Scoped（在 scope 區塊中） | `scoped<T>()` | `scopedOf(::T)` | `scoped { T(get()) }` |
| ViewModel | `viewModel<T>()` | `viewModelOf(::T)` | `viewModel { T(get()) }` |
| Worker (Android) | `worker<T>()` | `workerOf(::T)` | `worker { T(get(), get()) }` |
| Fragment (Android) | 不支援 | `fragmentOf(::T)` | `fragment { T(get()) }` |
| 函式或建構器 | `single { create(::buildT) }` | `singleOf(::buildT)` | `single { buildT(get()) }` |

套件：

| 關鍵字 | Compiler Plugin DSL | Constructor / Classic DSL |
|----------|---------------------|---------------------------|
| `single`, `factory`, `scoped`, `create` | `org.koin.plugin.module.dsl` | `org.koin.dsl` (Lambda), `org.koin.core.module.dsl` (`singleOf`, `factoryOf`, `scopedOf`, `new`) |
| `viewModel`, `viewModelOf`（構件 `koin-core-viewmodel`） | `org.koin.plugin.module.dsl` | `org.koin.core.module.dsl` |
| `worker`, `workerOf`（構件 `koin-androidx-workmanager`） | `org.koin.plugin.module.dsl` | `org.koin.androidx.workmanager.dsl` |
| `fragment`, `fragmentOf`（構件 `koin-android`） | | `org.koin.androidx.fragment.dsl` |

`org.koin.androidx.viewmodel.dsl` 與 `org.koin.compose.viewmodel.dsl` 中的 `viewModel` 和 `viewModelOf` 已棄用：請從 `org.koin.core.module.dsl` 匯入它們。

`create(::buildT)` 必須是其 Lambda 中的唯一指令。否則編譯器外掛程式會回報 `create(::buildT) must be the only instruction in the lambda.`。請參閱 [定義](/docs/reference/koin-core/definitions#classes-you-dont-own)。

### Lambda 參數 {id="lambda-parameters"}

Lambda 定義具有以下簽章：

| 關鍵字 | 參數 |
|---------|------------|
| `single(qualifier, createdAtStart) { }` | `qualifier: Qualifier? = null`, `createdAtStart: Boolean = false` |
| `factory(qualifier) { }` | `qualifier: Qualifier? = null` |
| `scoped(qualifier) { }` | `qualifier: Qualifier? = null` |
| `viewModel(qualifier) { }` | `qualifier: Qualifier? = null` |
| `worker(qualifier) { }` | `qualifier: Qualifier = named<T>()` |

### 定義 Lambda 內部 {id="inside-a-definition-lambda"}

該 Lambda 以 `Scope` 為接收器並以 `ParametersHolder` 為引數（`params`）執行：

| 函式 | 傳回值 | 參閱 |
|----------|---------|-----|
| `get<T>()`, `get<T>(qualifier)` | 執行個體。若遺失則擲出 `NoDefinitionFoundException` | [注入](/docs/reference/koin-core/injection) |
| `getOrNull<T>()` | 執行個體或 `null` | [注入](/docs/reference/koin-core/injection) |
| `inject<T>()` | `Lazy<T>` | [注入](/docs/reference/koin-core/injection) |
| `getAll<T>()` | 繫結至 `T` 的所有執行個體 | [進階模式](/docs/reference/koin-core/advanced-patterns#collections-of-dependencies) |
| `getProperty(key)`, `getProperty(key, default)`, `getPropertyOrNull(key)` | Koin 屬性 | [啟動 Koin](/docs/reference/koin-core/starting-koin) |
| `params.get<T>()`, `(id) -> ...` 解構 | 注入的參數 | [注入參數](/docs/reference/koin-core/injection-parameters) |
| `new(::T)` | 新的 `T`，其每個建構函式參數皆由 `get()` 解析 | |
| `create(::T)` | 編譯器外掛程式：同上，並包含建置期檢查 | [定義](/docs/reference/koin-core/definitions#classes-you-dont-own) |
| `getSource<T>()` | 作用域來源物件 | [作用域](/docs/reference/koin-core/scopes) |
| `androidContext()`, `androidApplication()` | Android `Context` 或 `Application` | [Android 啟動](/docs/reference/koin-android/start) |

## 定義選項 {id="definition-options"}

選項在定義之後套用，可透過中綴運算子或在 `withOptions { }` 區塊中使用。它們適用於每個定義關鍵字。

| 選項 | 形式 | 功能說明 | 參閱 |
|--------|------|--------------|-----|
| `bind` | `single<T>() bind I::class` | 新增次要型別 | [定義](/docs/reference/koin-core/definitions#interface-binding) |
| `binds` | `single<T>() binds arrayOf(I::class, J::class)` | 新增多個次要型別 | [定義](/docs/reference/koin-core/definitions#interface-binding) |
| `onClose` | `single<T>() onClose { it?.close() }` | 執行個體釋放時的回呼 | [定義](/docs/reference/koin-core/definitions#release-callback) |
| `withOptions { }` | `single<T>() withOptions { ... }` | 開啟下方的選項區塊 | |
| `.override()` | `single<T> { ... }.override()` | 當設定 `allowOverride(false)` 時，標記允許的覆寫 | [定義](/docs/reference/koin-core/definitions#overriding-a-definition) |

在 `withOptions { }` 中，或在 `singleOf(::T) { }`、`factoryOf`、`scopedOf` 及 `viewModelOf` 的尾隨區塊中：

| 選項 | 功能說明 |
|--------|--------------|
| `named("name")` | 字串限定詞。請參閱 [限定詞](/docs/reference/koin-core/qualifiers) |
| `named<Type>()` | 型別限定詞 |
| `bind<I>()` | 新增次要型別 |
| `binds(listOf(I::class, J::class))` | 新增多個次要型別 |
| `createdAtStart()` | 在 Koin 啟動時建立該 `single` |
| `onClose { }` | 釋放回呼 |

```kotlin
val appModule = module {
    single<UserRepositoryImpl>() withOptions {
        named("local")
        bind<UserRepository>()
        createdAtStart()
    }

    // Constructor DSL
    singleOf(::UserRepositoryImpl) {
        named("local")
        bind<UserRepository>()
    }
}
```

## Scope DSL {id="scope-dsl"}

scope 區塊將生命週期與某個作用域相同的定義分組。請參閱 [作用域](/docs/reference/koin-core/scopes)。

| 函式 | 套件 | 功能說明 |
|----------|---------|--------------|
| `scope<T> { }` | `Module` 成員 | 由型別 `T` 識別的作用域，通常為作用域來源的型別 |
| `scope(named("session")) { }` | `Module` 成員 | 由限定詞識別的作用域 |

在 scope 區塊內部：

| 定義 | Compiler Plugin DSL | Constructor DSL | Classic DSL |
|------------|---------------------|-----------------|-------------|
| Scoped | `scoped<T>()` | `scopedOf(::T)` | `scoped { T(get()) }` |
| Factory | `factory<T>()` | `factoryOf(::T)` | `factory { T(get()) }` |
| ViewModel | `viewModel<T>()` | `viewModelOf(::T)` | `viewModel { T(get()) }` |
| Worker (Android) | `worker<T>()` | `workerOf(::T)` | `worker { T(get(), get()) }` |

```kotlin
val sessionModule = module {
    scope<UserSession> {
        scoped<SessionCache>()
        factory<SessionPresenter>()
    }
}
```

### Scope 原型 {id="scope-archetypes"}

原型是針對某種類型的作用域來源（而非單一類別）所設定的 scope 區塊。該類型的每個來源都會取得這些定義。

| 函式 | 構件 | 作用域對象 | 參閱 |
|----------|----------|----------|-----|
| `viewModelScope { }` | `koin-core-viewmodel` | 每個 ViewModel | [ViewModel](/docs/reference/koin-core/viewmodel) |
| `activityScope { }` | `koin-android` | 每個 Activity | [Android 作用域](/docs/reference/koin-android/scope) |
| `activityRetainedScope { }` | `koin-android` | 每個 Activity，在配置變更時予以保留 | [Android 作用域](/docs/reference/koin-android/scope) |
| `fragmentScope { }` | `koin-android` | 每個 Fragment | [Android 作用域](/docs/reference/koin-android/scope) |
| `navigationScope { }` | `koin-compose-viewmodel-navigation` | 每個導覽目的地（`NavBackStackEntry`） | [Compose 作用域](/docs/reference/koin-compose/compose-scopes) |
| `requestScope { }` | `koin-ktor` | 每個 Ktor 呼叫 | [Ktor 作用域](/docs/reference/koin-ktor/ktor-scopes) |

## 相關內容 {id="related"}

- [定義](/docs/reference/koin-core/definitions)：每種定義類型的功能以及何時使用。
- [模組](/docs/reference/koin-core/modules)：組織與組合模組。
- [作用域](/docs/reference/koin-core/scopes)：作用域生命週期、連結與關閉。
- [註解參考](/docs/reference/koin-annotations/annotations-inventory)：本頁面對應的註解版本。
- [編譯器外掛程式設定](/docs/setup/compiler-plugin)：安裝 Compiler Plugin DSL 所需的外掛程式。