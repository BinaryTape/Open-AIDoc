---
title: Koin Compiler Plugin
---

# Koin Compiler Plugin

Koin Compiler Plugin 是一個在 Kotlin 編譯器 (K2) 內部執行的 Kotlin 編譯器外掛程式。它會為您的定義編寫建構函式裝配程式碼，並在組建期檢查相依圖。它同時支援 Compiler Plugin DSL 與註解。本頁面將說明它的功能與運作方式。若要進行安裝，請參閱 [Compiler Plugin Setup](/docs/setup/compiler-plugin)。若要將其與 Constructor DSL 和 Classic DSL 進行比較，請參閱 [Choosing your style](/docs/intro/choosing-your-style)。

## 它對程式碼的作用 {id="what-it-does-to-your-code"}

您只需編寫型別，外掛程式就會為您編寫建構函式呼叫：

**Compiler Plugin DSL**
```kotlin
class UserRepository(private val api: ApiService, private val cache: UserCache)

val appModule = module {
    single<UserRepository>()
}
```

**註解**
```kotlin
@Singleton
class UserRepository(private val api: ApiService, private val cache: UserCache)
```

**Constructor / Classic DSL**
Classic DSL 不需要外掛程式：您需要自行撰寫裝配程式碼。Constructor DSL (`singleOf(::T)`) 也不需要它。

```kotlin
val appModule = module {
    single { UserRepository(get(), get()) }
}
```

若套用了外掛程式，它仍會在組建期檢查這些 `get()` 呼叫與 `singleOf(::T)` 定義。

在編譯期間，外掛程式會將 `single<UserRepository>()`（或 `@Singleton` 類別）取代為等價的：

```kotlin
single { UserRepository(get(), get()) }
```

產生的程式碼與 Classic DSL 所使用的執行階段程式碼完全相同。在執行階段沒有任何改變：定義會放入相同的容器中，且 Koin 以相同的方式解析它們。每個參數型別都會被妥善處理：可 null 型別使用 `getOrNull()`、`Lazy<T>` 使用 `inject()`、`List<T>` 使用 `getAll()`，而帶有註解的參數（`@Named`、`@InjectedParam`、`@Property`）則使用相對應的呼叫。完整對照表請參閱 [Definitions](/docs/reference/koin-core/definitions#constructor-parameters)。

在 DSL 風格中，模組指定了類別註冊的位置，而類別參數上的註解則指定了它們被解析的方式：

```kotlin
class UserPresenter(
    @InjectedParam val userId: String,
    @Named("remote") val api: ApiService,
    val repository: UserRepository,
)

val appModule = module {
    factory<UserPresenter>()
}
```

## 運作原理 {id="how-it-works"}

此外掛程式掛鉤至 Kotlin K2 編譯器的兩個階段：

```text
Kotlin sources
     │
     ▼
  FIR (frontend)   finds @Module, @ComponentScan, @Configuration and declares
                   the generated module properties and cross-module hints
     │
     ▼
  IR (backend)     1. collects annotated definitions and fills the modules
                   2. rewrites DSL calls: single<T>() becomes single { T(get()) }
                   3. at entry points (startKoin, @KoinApplication), assembles
                      the full graph and validates it
                   4. validates get(), inject(), koinViewModel() call sites
     │
     ▼
  Bytecode (JVM, Android, Native, JS, Wasm)
```

專案中不會產生任何原始程式碼檔案。為了能夠跨 Gradle 模組檢視，外掛程式會在每個編譯後的模組中加入小型的合成標記函式（「提示」或 "hints"）。下游模組透過讀取這些標記來尋找宣告在其相依項中的定義。這也是為什麼每個宣告 Koin 定義的 Gradle 模組都必須套用此外掛程式。

## 驗證項目 {id="what-it-validates"}

外掛程式會在每個 Koin 入口點驗證相依圖：`startKoin`、`koinApplication`、`@KoinApplication`、`KoinApplication.withConfiguration<T>()` 以及 Ktor 的 `install(Koin) {}`。針對每個定義，它會檢查每個不可為 null 的建構函式參數是否具有相符的定義、正確的限定詞，並且處於可存取的作用域中。它還會檢查每個 `get<T>()`、`inject<T>()` 與 `koinViewModel<T>()` 呼叫。

缺少相依項將導致建置失敗：

```text
[Koin][KOIN-D001] Missing dependency: ApiService
  required by: UserRepository (parameter 'api')
  in module: ...
```

檢查項目、錯誤碼以及 `@Provided` 規避機制的完整清單請參閱 [Compile-Time Safety](/docs/reference/koin-compiler/compile-safety)。

## 限制 {id="limits"}

- **執行階段載入的模組**：稍後透過 `loadKoinModules()` 加入的模組不屬於外掛程式可見的圖的一部分。由它們提供的型別必須標記為 `@Provided`。
- **單獨的程式庫模組**：沒有 Koin 入口點的 Gradle 模組不會自行進行驗證。它會在應用程式模組進行組裝時才被檢查。
- **增量編譯**：如同其他 IR 編譯器外掛程式，某些變更（在掃描的套件之間移動類別、更改限定詞）可能會留下過時的結果。執行乾淨組建 (clean build) 即可解決。詳細資訊請參閱 [Compiler Plugin Setup](/docs/setup/compiler-plugin)。
- **Kotlin 版本**：外掛程式使用的編譯器 API 在不同的 Kotlin 版本之間可能會有所改變。每個外掛程式版本都會在一組已驗證的 Kotlin 版本清單上進行驗證，其餘版本則會顯示警告。

## 需求 {id="requirements"}

- Kotlin 2.3.20 或更高版本（K2 編譯器）。外掛程式 1.2.1 版已在 Kotlin 2.3.20、2.4.0、2.4.10 與 2.4.20 上完成驗證。
- Koin 4.2.0 或更高版本。
- Gradle 外掛程式 `io.insert-koin.compiler.plugin`，需套用至每個宣告定義的 Gradle 模組中。

Compiler Plugin DSL 位於隨 `koin-core` 一同提供的 `org.koin.plugin.module.dsl` 套件中。Classic DSL 仍位於 `org.koin.dsl`，Constructor DSL 則位於 `org.koin.core.module.dsl`。

此外掛程式取代了已棄用的 KSP 處理器 `koin-ksp-compiler`，並使用相同的註解。請參閱 [Migrating from KSP](/docs/migration/from-ksp-to-compiler-plugin)。原始碼託管於 GitHub：[InsertKoinIO/koin-compiler-plugin](https://github.com/InsertKoinIO/koin-compiler-plugin)。

## 相關內容 {id="related"}

- [Compiler Plugin Setup](/docs/setup/compiler-plugin)：安裝並設定外掛程式。
- [Choosing your style](/docs/intro/choosing-your-style)：註解或 DSL（Compiler Plugin、Constructor 或 Classic DSL）。
- [Compile-Time Safety](/docs/reference/koin-compiler/compile-safety)：所有檢查項目與錯誤碼。
- [Compiler Plugin Options](/docs/reference/koin-annotations/options)：所有 Gradle 選項。
- [Definitions](/docs/reference/koin-core/definitions)：建構函式參數的解析方式。