---
title: 選擇你的風格
---

# 選擇你的風格

Koin 提供兩種宣告定義的風格，兩者都會填入相同的容器：類別上的**註解**，或是 `module { }` 區塊中的 **Koin DSL**。DSL 具有三種形式：Compiler Plugin DSL (`single<T>()`)、Constructor DSL (`singleOf(::T)`) 以及 Classic DSL (`single { T(get()) }`)。這項選擇會改變你編寫模組的方式，但不會改變 Koin 在執行時期的運作方式。本頁面介紹每種風格、其需求與權衡取捨，並推薦預設選項。本文假設你已知曉何謂定義與模組（請參閱[核心概念](/docs/intro/core-concepts)）。

## 各風格並列比較 {id="the-styles-side-by-side"}

以每種風格呈現的同一個模組：

**Compiler Plugin DSL**
```kotlin
import org.koin.dsl.module
import org.koin.plugin.module.dsl.*

val appModule = module {
    single<ApiService>()
    single<UserRepositoryImpl>() bind UserRepository::class
    viewModel<UserViewModel>()
}
```

你指定型別。[Koin Compiler Plugin](/docs/intro/koin-compiler-plugin) 會讀取其建構函式並自動產生裝配程式碼。

**註解**
```kotlin
@Singleton
class ApiService

@Singleton
class UserRepositoryImpl(private val api: ApiService) : UserRepository

@KoinViewModel
class UserViewModel(private val repository: UserRepository) : ViewModel()

@Module
@ComponentScan("com.example.app")
class AppModule
```

你為每個類別加上註解。`@ComponentScan` 會將它們收集至模組中，並由 Compiler Plugin 產生裝配程式碼。介面則會自動綁定。

**Constructor / Classic DSL**
使用建構函式參照的 Constructor DSL：

```kotlin
import org.koin.dsl.module
import org.koin.core.module.dsl.*

val appModule = module {
    singleOf(::ApiService)
    singleOf(::UserRepositoryImpl) bind UserRepository::class
    viewModelOf(::UserViewModel)
}
```

手動編寫建構函式呼叫的 Classic DSL：

```kotlin
val appModule = module {
    single { ApiService() }
    single<UserRepository> { UserRepositoryImpl(get()) }
    viewModel { UserViewModel(get()) }
}
```

兩種形式在沒有編譯器外掛程式的情況下皆可運作。套用該外掛程式後，它們也會在建置期接受檢查。

## 需求 {id="requirements"}

| | Compiler Plugin DSL | 註解 | Constructor / Classic DSL |
|---|---|---|---|
| Koin 版本 | 4.2.0+ | 4.2.0+ | 任何版本 |
| Kotlin 版本 | 2.3.20+ (K2) | 2.3.20+ (K2) | 你的 Koin 版本所支援的任何版本 |
| Gradle 外掛程式 | `io.insert-koin.compiler.plugin`（必要） | `io.insert-koin.compiler.plugin`（必要） | 選用：加入編譯期檢查 |
| 額外相依性 | `koin-annotations` 僅用於參數註解（`@Named`、`@InjectedParam`） | `koin-annotations` | 無 |
| 匯入 | `org.koin.plugin.module.dsl.*` | `org.koin.core.annotation.*` | `org.koin.core.module.dsl.*` (Constructor)，`org.koin.dsl.*` (Classic) |

每個 Compiler Plugin 版本都會在一系列 Kotlin 版本上進行驗證。Plugin 1.2.1 已在 Kotlin 2.3.20、2.4.0、2.4.10 和 2.4.20 上通過驗證。安裝步驟請參閱 [Compiler Plugin Setup](/docs/setup/compiler-plugin)。

:::warning
Compiler Plugin DSL 函式（`single<T>()`、`factory<T>()`、`create(::T)`）為虛設常式。若未套用 Gradle 外掛程式，程式碼雖可編譯，但在執行時期會擲出 `NotImplementedError`。請在所有使用這些函式的 Gradle 模組中套用該外掛程式。
:::

## 權衡取捨 {id="tradeoffs"}

### Compiler Plugin DSL {id="compiler-plugin-dsl"}

- **編譯期檢查**：完整的相依圖以及每個 `get()` 呼叫點都會在建置期進行驗證。
- **無須裝配程式碼**：無須 `get()`，也無須建構函式參照。新增建構函式參數無須修改模組。
- **明確的模組**：你可以在同一個地方看到模組的所有定義，並可以在周圍使用 Kotlin 程式碼（條件判斷、迴圈）。
- **參數註解**：限定詞與注入的參數是宣告在類別上（`@Named`、`@InjectedParam`），因此該類別會相依於 `koin-annotations`。
- **Kotlin 耦合**：你需要較新的 K2 編譯器，且發佈新的 Kotlin 版本時可能需要對應的新外掛程式版本。

### 註解 {id="annotations"}

- **編譯期檢查**：與 Compiler Plugin DSL 相同。
- **定義緊鄰類別**：生命週期與綁定在編寫類別之處清晰可見。習慣使用 Hilt、Dagger 或 Spring 的團隊會對此模型感到熟悉。
- **自動綁定**：類別會自動綁定到其所有超型別，除非你明確列出 `binds`。
- **掃描組態**：定義是依據套件尋找的。你需要搭配正確套件的 `@Module` 與 `@ComponentScan`，並透過 `@Configuration` 或 `@KoinApplication` 跨 Gradle 模組組裝模組。不在掃描套件範圍內的類別不會成為模組的一部分。編譯期檢查僅會在有其他定義需要它時才會回報錯誤。
- **功能缺口**：某些選項僅存在於 DSL 中（例如 `onClose` 回呼）。你需要在 DSL 模組中編寫這些定義。
- **Kotlin 耦合**：與 Compiler Plugin DSL 相同。

### Constructor DSL 與 Classic DSL {id="constructor-dsl-and-classic-dsl"}

- **隨處可用**：編譯器外掛程式為選用項目，除了 Koin 本身的要求外，沒有額外的 Kotlin 版本限制。
- **搭配外掛程式實現編譯期檢查**：自 Compiler Plugin 1.2.0 起，套用外掛程式即可檢查 `singleOf(::T)`、`factoryOf(::T)`、`scopedOf(::T)` 和 `viewModelOf(::T)`（如同檢查 `single<T>()`），並透過手寫 Lambda 的 `get()` 呼叫進行檢查。既有模組無需重寫即可享有編譯期檢查。
- **完全掌控 (Classic DSL)**：Lambda 是純粹的 Kotlin 程式碼，因此你可以在執行時期呼叫 Builder、讀取設定或選擇實作。
- **未套用外掛程式時的執行期錯誤**：若缺少定義，只有在程式碼執行時才會被發現。可在單元測試中使用 [`verify()`](/docs/reference/koin-test/verify) 來提早捕捉錯誤。
- **需手動維護裝配**：`single { UserRepository(get(), get()) }` 必須手動配合建構函式的變更。`singleOf(::UserRepository)` 雖會自動跟隨變更，但對於可為 null、延遲載入 (lazy) 或有限定詞的參數，仍需進行明確呼叫。

## 該選擇哪一種 {id="which-one-to-pick"}

為專案挑選一種風格並明確規定：使用註解或是 DSL。

對於使用 Kotlin 2.3.20 或更新版本的新專案，建議使用 **Compiler Plugin DSL**。它能提供編譯期檢查、讓相依注入遠離你的類別，並將模組保留為明確的 Kotlin 程式碼。如果你的團隊更喜歡像 Hilt 或 Dagger 那樣直接在類別上宣告定義，請使用**註解**：它們同樣享有編譯期檢查，且相容於 JSR-330（`@Inject`、`@Singleton`、`@Named`）。

若你無法使用較新的 Kotlin 版本、正在建置不可要求使用者安裝編譯器外掛程式的程式庫，或者既有模組運作正常且不想更動它們，請保留 **Constructor 或 Classic DSL**。你可以套用 Compiler Plugin，無需重寫即可為它們取得編譯期檢查。在定義需要自訂邏輯之處，請使用 Classic DSL 的 Lambda。

## 混用風格 {id="mixing-styles"}

所有風格都會產生相同的定義，因此單一專案中可以混用多種風格。但建議每個專案以一種風格為主。如果你混用註解與 DSL，請保持每個模組採用單一風格。常見情況包括：

- **在單一模組中同時使用 Compiler Plugin DSL 與 Classic DSL**：大多數定義撰寫 `single<T>()`，在需要自訂邏輯處使用 Lambda。由於兩者皆為 DSL 形式，因此這不算是混用風格。
- **註解搭配少數 DSL 模組**：從你的 `@KoinApplication` 類別開始，並在組態區塊中加入 DSL 模組。
- **DSL 啟動並搭配已加註解的模組**：將 `@Module` 類別載入至一般的 `startKoin` 中。

```kotlin
import org.koin.plugin.module.dsl.module
import org.koin.plugin.module.dsl.startKoin

// 已加註解的應用程式，加上 DSL 模組
startKoin<MyApp> {
    modules(legacyModule)
}

// DSL 應用程式，加上已加註解的模組
startKoin {
    modules(appModule)
    module<NetworkModule>()
}
```

`@Module(includes = [...])` 與 `@KoinApplication(modules = [...])` 僅接受 `@Module` 類別，不接受 DSL 的 `module { }` 值。完整的規則請參閱[模組](/docs/reference/koin-core/modules)與[啟動 Koin](/docs/reference/koin-core/starting-koin)。

## KSP 處理器已棄用 {id="the-ksp-processor-is-deprecated"}

在 Compiler Plugin 出現之前，註解是由 KSP 處理器 `koin-ksp-compiler` 處理。該處理器現已棄用，並將在未來的 Koin 版本中移除。註解本身並未棄用：`koin-annotations` 是 Koin 主專案的一部分，並隨每個 Koin 版本一同發佈。如果你目前正在使用 KSP，加上註解的類別保持不變，只需修改建置設定與啟動程式碼。請參閱[從 KSP 遷移至 Compiler Plugin](/docs/migration/from-ksp-to-compiler-plugin)。

## 每個頁面上的分頁標籤 {id="tabs-on-every-page"}

本文件中的程式碼範例皆使用相同的三個分頁標籤：Compiler Plugin DSL、Annotations、Constructor / Classic DSL。當你選取一個標籤時，該選擇會儲存在瀏覽器中並套用到每個頁面。在所有風格中均相同的範例（例如 Activity 中的 `by inject()`），則僅顯示一次且不包含分頁標籤。

## 相關內容 {id="related"}

- [Koin Compiler Plugin](/docs/intro/koin-compiler-plugin)：外掛程式的運作方式及其驗證內容。
- [Compiler Plugin Setup](/docs/setup/compiler-plugin)：安裝 Gradle 外掛程式。
- [Definitions](/docs/reference/koin-core/definitions)：每種風格下的各個定義型別。
- [DSL Reference](/docs/reference/koin-core/dsl) 與 [Annotations Reference](/docs/reference/koin-annotations/annotations-inventory)：每個關鍵字與註解。
- [Migrating from KSP](/docs/migration/from-ksp-to-compiler-plugin)：自 `koin-ksp-compiler` 遷移。