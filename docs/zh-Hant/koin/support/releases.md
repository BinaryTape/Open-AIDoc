---
title: 版本發佈與升級指南
---

# 版本發佈與升級指南

本頁列出了每個主要的 Koin 版本，以便您規劃升級並檢查相容性。每個版本都遵循相同的結構：

- **Kotlin**：建置 Koin 所使用的 Kotlin 版本。
- **New**：新功能與改進。
- **Experimental**：標記為 `@KoinExperimentalAPI` 的 API，這些 API 仍可能變更。
- **Deprecated**：標記為即將移除的 API，並提供其替代方案。
- **Breaking**：升級時需要在程式碼中進行相應更新的變更。
- **Bug fixes**（錯誤修正）、**Improvements**（改進）、**Library updates**（程式庫更新）：當該版本包含時顯示。

實驗性與棄用的定義請參閱 [API Stability](/docs/support/api-stability)。

## 版本列表 {id="versions"}

| 版本 | Kotlin | 狀態 | 主要變更 |
|---------|--------|--------|--------------|
| [4.2.2](#422) | 2.3.20 | 穩定版 | Resolver 迴歸修正、ViewModel 與作用域修正、tvOS、R8/ProGuard 規則 |
| [4.2.1](#421) | 2.3.20 | 前一穩定版 | 作用域解析修正、ABI 還原、效能 |
| [4.2.0](#420) | 2.3.20 | 前一穩定版 | `@KoinApplication` 與 `@Configuration`、Ktor 3.4 DI 橋接、Navigation 3、Dagger 橋接 |
| [4.1.1](#411) | 2.1.21 | 前一穩定版 | Navigation 改進、解析器效能 |
| [4.1.0](#410) | 2.1.20 | 前一穩定版 | 作用域原型、功能選項、Ktor KMP |
| [4.0.4](#404) | 2.0.21 | 前一穩定版 | 穩定的 ViewModel API、UUID 產生 |
| [3.5.6](#356) | 1.9.22 | LTS | Kotlin 1.x 的長期支援版本分支、隔離上下文 |
| [3.4.3](#343) | 1.8.21 | 舊版 | 驗證 API、ExtensionManager |

目前版本：Koin 4.2.2 以及 Koin Compiler Plugin 1.2.1（請參閱 [Koin Compiler Plugin](#koin-compiler-plugin)）。

:::note
並行維護兩條 LTS 分支：適用於 Kotlin 1.x 專案的 Koin 3.5.6，以及適用於 Kotlin 2.x 專案的 Koin 4.2.x。請選擇符合您 Kotlin 基準版本的版本。有關支援政策，請參閱 [Long-Term Support](/docs/support/#long-term-support-lts)。
:::

## 4.2.2 {id="4-2-2"}

Kotlin `2.3.20`。

4.2.x 分支的維護版本：修正 4.2.0 中重寫 `CoreResolverV2` 所引入的解析器迴歸問題、ViewModel 與作用域修正、Ktor 請求作用域修正、tvOS 支援以及 R8/ProGuard 規則。

:::warning
如果您在 4.2.0 或 4.2.1 上遇到解析器問題，請升級至 4.2.2。
:::

### 新功能 {id="new"}

`koin-core-viewmodel`
- tvOS 目標（`tvosArm64`、`tvosX64`、`tvosSimulatorArm64`），使 ViewModel 可在 tvOS 上使用。

`koin-android` / `koin-core-viewmodel`
- 消費者 R8/ProGuard 規則現已隨附於 AAR 中，並附有新的 R8/ProGuard 指南。

### 錯誤修正 {id="bug-fixes"}

`koin-core`
- 修正 #2370、#2408：堆疊參數（`parametersOf`）可能會遮蔽具有限定符的 `get(named(...))` 請求。限定查詢現在只讀取註冊表，絕不讀取參數堆疊。
- 修正 #2379：在根作用域定義的非 `single` 工廠，從子作用域解析時，其作用域相依性會針對 `_root_` 解析而非請求作用域。連結作用域解析現在會針對請求作用域執行工廠。
- 修正 #2299：使用 `viewModelScopeFactory()` 建立的作用域未連結至其原始作用域，導致無法解析父級中宣告的相依性。建立的作用域現已連結至其父級（父級為根時除外）。
- 修正 #2348：由於未檢查的 map 轉換，載入帶有非 `String` 值的環境或系統屬性會拋出 `ClassCastException`。非 `String` 值現在保留為 `Any`。
- 修正 #2044、#2417：在沒有適當 extras 的情況下解析 `SavedStateHandle`，或在沒有 `viewModelScopeFactory()` 選項的情況下使用 `viewModelScope { }`，現在會提供具體可行的錯誤訊息。

`koin-ktor`
- 修正 #2410：並行請求可能會在請求作用域 ID 上發生衝突。ID 現在由啟動時初始化一次的單調計數器產生（由 @lfavreli-betclic 貢獻）。

### 改進 {id="improvements"}

`koin-core`
- `bind()` 和 `binds()` 現在以 O(1) 追加次要型別，而不是為每次繫結重新分配型別清單。這消除了當定義宣告許多繫結時的平方級開銷。

### 文件 {id="documentation"}

- 在 [Navigation 3 參考資料](/docs/reference/koin-compose/navigation3) 中新增了搭配型別化 `entryProvider` 使用 Koin 的指南（#2336）。

## 4.2.1 {id="4-2-1"}

Kotlin `2.3.20`。

4.2.0 之上的修補版本：作用域解析修正、ABI 還原以及更好的診斷。

### 新功能

`koin-core`
- 更清晰的作用域解析錯誤訊息。

### 錯誤修正

`koin-core`
- 修正 #2387：`CoreResolverV2` 在連結作用域上遺失了堆疊參數查詢。
- 還原了 `runOnKoinStarted` 的 ABI 相容性。現在會在 CI 中執行 API 檢查以防止迴歸。
- 關閉作用域的並行修正（volatile 標記），由 @inemtsev 貢獻。
- 為作用域 `ViewModel` 和 `SavedStateHandle` ViewModel 新增了測試。

## 4.2.0 {id="4-2-0"}

Kotlin `2.3.20`。所有程式庫版本皆可在 [libs.versions.toml](https://github.com/InsertKoinIO/koin/blob/4.2.0/projects/gradle/libs.versions.toml) 中查看。

### 新功能

`koin-core`
- 全新的 `CoreResolverV2`：更快存取堆疊參數、子作用域與 ViewModel 作用域解析、針對每個作用域最佳化 `ThreadLocal` 載入。
- `KoinApplication.withConfiguration<T>()` 擴充方法：將 `KoinApplication` 與 [Koin Compiler Plugin](#koin-compiler-plugin) 從 `@KoinApplication` 類別中探索到的模組連接起來。
- `koinConfiguration<T>()` DSL：編譯器外掛程式進入點，用於從帶有註解的類別建置 `KoinConfiguration`。
- 作用域解析與執行緒安全性的效能最佳化。

`koin-android`
- `koinActivityInject`：從目前的 `Activity` 作用域擷取相依項。

`koin-androidx-startup`
- `onKoinStartup { }`：透過 AndroidX Startup 的 `Initializer` API 啟動 Koin。
- `KoinConfiguration` 型別與 `KoinStartup` 更新（`KoinInitializer` 維持實驗性）。

`koin-ktor`：Ktor 3.4 整合
- 全新的 Koin 與 Ktor DI 橋接，建構於官方 Ktor 3.4 DI API 之上。
- `KoinDependencyMap`：Koin 直接透過 Ktor DI 解析執行個體。
- `KoinKtorApplication`：DSL 橋接，提供 Ktor 到 Koin 以及 Koin 到 Ktor 裝配的明確選項。
- `Application.koinModule` 與 `Application.koinModules` 擴充方法現在是宣告模組的建議方式。

`koin-compose-navigation3`（新模組）
- 支援 Jetpack Navigation 3（穩定版 1.0.0）。
- 泛型 `EntryProvider`：將元資料參數（動畫等）傳遞給導覽項目。
- 適用於 Compose Navigation 2 的導覽作用域輔助程式。

`koin-dagger-bridge`（新模組）
- 從 Dagger 端注入 Koin 元件，用於從 Dagger 平滑遷移至 Koin。

`koin-core-annotations`（由編譯器外掛程式使用）
- `@KoinApplication`：將類別標記為 Koin 應用程式進入點。接著 `startKoin<MyApp>()` 會組裝所有探索到的 `@Configuration` 模組。
- `@Configuration("name")`：將 `@Module` 類別分組為不同配置（例如 `prod`、`test`、`default`）。具有相同配置標籤的模組可以看到彼此的定義。
- `@PropertyValue("key")`：`@Property` 注入的預設值。
- `@ScopeId(name = "...")` 與 `@ScopeId(MyScope::class)`：從具名的 Koin 作用域注入值。
- `@Monitor`：使用 Kotzilla SDK 追蹤（執行時間）包裝帶有註解的函式。請參閱 [@Monitor](/docs/tooling/monitor)。
- `@Provided` 可被整個安全圖識別：它會跳過對外部提供型別的編譯期驗證。

### 實驗性功能 {id="experimental"}

`koin-core`
- `@KoinApplication(modules = [...])`：明確的 `modules` 陣列允許進入點繞過探索，並使用固定的模組清單。

`koin-androidx-startup`
- 整個 `koin-androidx-startup` API 維持實驗性。`KoinInitializer` 標記為 `@KoinExperimentalAPI`。

### 棄用 {id="deprecated"}

`koin-android` / `koin-android-annotation`
- `org.koin.android.annotation.KoinViewModel` 已棄用。請改用 `org.koin.core.annotation.KoinViewModel`。

`koin-ktor`
- `koin-ktor3` 構件已合併至 `koin-ktor`（在 4.1.0 中棄用，在 4.2.0 中完全合併）。

### 破壞性變更 {id="breaking"}

`koin-android`
- 最低 SDK 從 21 提升至 23，以與 Koin 使用的 AndroidX 程式庫保持一致。

`koin-compose-navigation3`
- 最低 API 等級 23。

`koin-core`
- `Module.getAll(...)` 不再對結果進行排序。執行個體將依宣告順序傳回。如果您依賴特定順序，請明確進行排序。

## Koin Compiler Plugin {id="koin-compiler-plugin"}

目前版本：`1.2.1`。需要 Koin `4.2.0` 或更高版本以及 Kotlin K2 編譯器（已在 `2.3.20`、`2.4.0`、`2.4.10`、`2.4.20` 上驗證）。

Koin Compiler Plugin 是原生 Kotlin 編譯器外掛程式。它取代了基於 KSP 的 Koin Annotations 處理器，並作為 Kotlin 編譯的一部分執行，無需 KSP 步驟。安裝與 Gradle 選項請參閱 [Compiler Plugin Setup](/docs/setup/compiler-plugin) 和 [Compiler Plugin Options](/docs/reference/koin-annotations/options)。它所驗證的內容請參閱 [Compile-Time Safety](/docs/reference/koin-compiler/compile-safety)。它支援所有 Kotlin Multiplatform 目標：JVM、JS、Wasm、iOS、macOS、watchOS、tvOS、Linux 與 Windows。

若要從 `koin-ksp-compiler` 遷移，請參閱 [Migrating from KSP to the Compiler Plugin](/docs/migration/from-ksp-to-compiler-plugin)。

### 1.2.1 {id="1-2-1"}

支援 Kotlin 2.4.20，並修正了在實際 KMP 應用程式中發現的兩個問題。

- **Kotlin 2.4.20**：在 1.2.0 中，任何使用 Kotlin 2.4.20 的專案在 IR 產生期間均因 `NoSuchMethodError` 而失敗（#89、#99）。Kotlin 2.4.20 移除或變更了外掛程式使用的四個編譯器 API 的簽章。這四個問題均已修正。
- **KLIB 修正**：當 `@Configuration` 模組透過相依性轉發時，wasmJs、JS 和 Kotlin/Native 組建在 `componentscan_*` 提示上出現 `Different declarations with the same signatures were detected` 錯誤。JVM 和 Android 不受影響。
- **限定符修正**：跨模組讀取時，同一型別的兩個 `@Named` 提供者合併為一個，從而導致誤報的 `KOIN-D001`。如果您因 D001 誤報錯誤而關閉了 `compileSafety`，請重新開啟進行檢查。
- **嚴格 Kotlin 版本檢查**：現在只有經過完全相符版本檢查的 Kotlin 版本才算已驗證。未驗證的版本會發出警告並繼續執行，絕不封鎖。

請參閱 [1.2.1 release notes](https://github.com/InsertKoinIO/koin-compiler-plugin/releases/tag/1.2.1)。

### 1.2.0 {id="1-2-0"}

編譯期安全性現已涵蓋整個 Koin DSL，且跨模組的 `includes` 不再隱藏定義。

- **建構函式 DSL 驗證**：`singleOf(::T)`、`factoryOf(::T)`、`scopedOf(::T)`、`viewModelOf(::T)` 與 `Scope.new(::T)` 獲得與 `single<T>()` 相同的缺失相依性及限定符檢查。先前依賴於此處未檢查缺失相依性的程式碼現在將無法通過編譯。這是補齊檢查缺口，並非迴歸錯誤。
- **新進入點**：`KoinApplication.withConfiguration<T>()` 與 Ktor 的 `install(Koin) { modules(...) }`。
- **模組清單**：`startKoin { modules(myList) }` 可解析 `listOf`、`+`、`.toList()` 以及回傳 `List<Module>` 的函式。在執行階段具有分支的清單仍保持未解析狀態，且 `KOIN-W003` 會指向該呼叫。
- **模組函式**：`fun myModule(): Module = module { ... }` 會像頂層 `val` 一樣被追蹤。
- **跨模組修正**：間隔兩個或更多 `implementation` 跳躍的定義在透過 `@Module(includes)`（#82）、`@Configuration` 自動探索以及 DSL `includes(...)` 時先前是不可見的。複數 `binds(...)` 現已被識別，且 `@Module(includes)` 不再合併僅限定符不同的提供者（#94）。
- **手寫 Lambda**：`single { X(get()) }` 會透過其自身的 `get()` 呼叫進行驗證，而不是從建構函式進行猜測。這消除了 `KOIN-D004` 循環的誤報。

請參閱 [1.2.0 release notes](https://github.com/InsertKoinIO/koin-compiler-plugin/releases/tag/1.2.0)。

### 1.1.0 {id="1-1-0"}

僅進行全圖驗證。移除了個別模組驗證，改為在每個 Koin 進入點（`startKoin`、`koinApplication`、`@KoinApplication`）進行一次全圖檢查。這消除了實質的跨模組誤報。權衡之處在於：在編譯時自身沒有進入點的葉模組或程式庫模組，在有其他模組圍繞其組裝成真實的圖之前，不會獲得編譯期安全診斷。

請參閱 [1.1.0 release notes](https://github.com/InsertKoinIO/koin-compiler-plugin/releases/tag/1.1.0)。

## 4.1.1 {id="4-1-1"}

Kotlin `2.1.21`。

### 新功能

`koin-compose-viewmodel-navigation`
- `sharedKoinViewModel` 具有可選的 `navGraphRoute` 參數，適用於 Compose Navigation。

`koin-core`
- 核心解析器最佳化：在單一作用域中解析時不再進行不必要的扁平化。
- 作用域偵錯會顯示連結的作用域 ID。

### 程式庫更新 {id="library-updates"}

- Kotlin：2.1.21（原為 2.1.20）
- Ktor：3.2.3（原為 3.1.3）
- JetBrains Compose：1.8.2（原為 1.8.0）
- AndroidX：Fragment 1.8.9、WorkManager 2.10.3、Lifecycle 2.9.3、Navigation 2.9.3
- 測試：Robolectric 4.15.1、Benchmark 0.4.14
- 建置：Binary Validator 0.18.1、NMCP 1.1.0

### 錯誤修正

`koin-core`
- 還原了導致相容性錯誤的記錄器條件約束。
- 修正了 Compose 作用域解析，提供更好的 `LocalKoinApplication` 與 `LocalKoinScope` 上下文處理。

`koin-build`
- 修正 Maven Central 發佈問題。

## 4.1.0 {id="4-1-0"}

Kotlin `2.1.20`。

### 新功能

`koin-core`
- `KoinConfiguration` API，用於包裝 Koin 配置。
- 作用域原型：針對某類作用域的專用作用域型別限定符。現在可以針對某個作用域類別（即原型）來解析執行個體。
- 功能選項：Koin 內部新行為的功能旗標。在 Koin 配置的 `options` 區塊中啟用選項：
```kotlin
startKoin {
    options(
        // activate a new feature
        viewModelScopeFactory()
    )
}
```
- 全新 `CoreResolver`，包含 `ResolutionExtension` 以允許 Koin 從外部系統或資源進行解析（用於連接 Ktor DI）。

`koin-android`
- 升級的程式庫（`androidx.appcompat:appcompat:1.7.0`、`androidx.activity:activity-ktx:1.10.1`）將最低 SDK 從 14 提升至 21。
- 模組 DSL 擴充方法 `activityScope`、`activityRetainedScope` 與 `fragmentScope`，用於為 Activity 或 Fragment 宣告作用域。
- 函式 `activityScope()`、`activityRetainedScope()` 與 `fragmentScope()` 現在使用作用域原型。

`koin-androidx-compose`
- 與 Koin Compose Multiplatform、Compose 1.8 及 Lifecycle 2.9 對齊。

`koin-compose`
- 與 Compose 1.8 和 Lifecycle 2.9 對齊。
- `KoinApplicationPreview`，用於在 Android Studio 與 IntelliJ IDEA 中平行轉譯預覽。

`koin-compose-viewmodel`
- `koinActivityViewModel`，使用父 Activity 作為 ViewModel 主機。

`koin-ktor`
- 多平台：此模組現已為 Kotlin Multiplatform 建置。您可以在多平台專案中使用 `koin-ktor`。
- 先前的 `koin-ktor3` 模組已合併至 `koin-ktor`。
- `Application.koinModule { }` 與 `Application.koinModules()`，用於直接在 Ktor 模組中宣告 Koin 模組：
```kotlin
fun Application.customerDataModule() {
    koinModule {
        singleOf(::CustomerRepositoryImpl) bind CustomerRepository::class
    }
}
```
- `Module.requestScope`：在 Ktor 請求作用域內宣告定義，無需手動宣告 `scope<RequestScope>`。請求作用域也可以在建構函式中注入 `ApplicationCall`。

`koin-core-coroutines`
- `ModuleConfiguration`：將模組配置收集在單一結構中，以便後續驗證。
```kotlin
val m1 = module {
    single { Simple.ComponentA() }
}
val lm1 = lazyModule {
    single { Simple.ComponentB(get()) }
}
val conf = moduleConfiguration {
    modules(m1)
    lazyModules(lm1)
}
```
- Koin 配置可以從 `ModuleConfiguration` 載入模組：
```kotlin
startKoin {
    moduleConfiguration {
        modules(m1)
        lazyModules(lm1)
    }
}

// or even
val conf = moduleConfiguration {
    modules(m1)
    lazyModules(lm1)
}

startKoin {
    moduleConfiguration(conf)
}
```

`koin-test-coroutines`
- 全新的 `koin-test-coroutines` 模組，提供協同程式相關的測試 API。
- Verify API 可以檢查混合一般模組與延遲載入模組的 `moduleConfiguration`：
```kotlin
val conf = moduleConfiguration {
    modules(m1)
    lazyModules(lm1)
}

conf.verify()

// if you want Android types (koin-android-test)
conf.verify(extraTypes = androidTypes)
```

`koin-core-annotations`
- `@InjectedParam` 與 `@Provided` 將屬性標記為注入參數或動態提供。目前供 `Verify` API 使用。

### 實驗性功能

`koin-core`
- Wasm：使用 Kotlin 2.1.20 的 UUID 產生機制。

`koin-core-viewmodel`
- 模組 DSL 擴充方法 `viewModelScope`，用於宣告範圍限定於 ViewModel 作用域原型的元件。
- `viewModelScope()` 函式：建立繫結至 ViewModel 類別的作用域。它使用 `ViewModelScopeAutoCloseable`（`AutoCloseable` API）來關閉作用域，因此您不再需要手動關閉 ViewModel 作用域。
- `ScopeViewModel` 類別更新：開箱即用的 ViewModel 作用域類別，負責處理作用域的建立與關閉。
- 透過 `viewModelScopeFactory` 選項從 ViewModel 的作用域進行建構函式注入：
```kotlin
startKoin {
    options(
        // activate a new ViewModel scope creation
        viewModelScopeFactory()
    )
}

// will inject Session from MyScopeViewModel's scope
class MyScopeViewModel(val session: Session) : ViewModel()

module {
    viewModelOf(::MyScopeViewModel)
    viewModelScope {
        scopedOf(::Session)
    }
}
```

`koin-compose`
- `KoinMultiplatformApplication` 函式：Compose Multiplatform 進入點。

`koin-core-viewmodel-navigation`
- `sharedViewModel` 擴充方法，用於重用導覽 `NavBackStackEntry` 中的 ViewModel 執行個體。

`koin-test`
- `Verify` API 現在會檢查可為 null、延遲載入以及清單參數。將屬性標記為 `@InjectedParam` 或 `@Provided`，以將其宣告為注入參數或動態提供，而無需在 Verify 呼叫中聲明。
```kotlin
// now detected in Verify
class ComponentB(val a: ComponentA? = null)
class ComponentBParam(@InjectedParam val a: ComponentA)
class ComponentBProvided(@Provided val a: ComponentA)
```

### 棄用

`koin-android`
- `ScopeViewModel` 已棄用。請改用 `koin-core-viewmodel` 中的 `ScopeViewModel` 類別。

`koin-compose`
- `KoinContext` 已棄用且可移除：Koin 上下文現在已在目前的預設上下文上準備就緒。

`koin-androidx-compose`
- `KoinAndroidContext` 已棄用且可移除：Koin 上下文現在已在目前的預設上下文上準備就緒。

`koin-androidx-compose-navigation`
- 在 Lifecycle 程式庫更新後不再需要 `koinNavViewModel`。請將其替換為 `koinViewModel`。

`koin-core-viewmodel-navigation`
- 在 Lifecycle 程式庫更新後不再需要 `koinNavViewModel`。請將其替換為 `koinViewModel`。

`koin-ktor`
- `Application.koin` 已棄用，建議改用 `Application.koinModules` 與 `Application.koinModule`。

### 破壞性變更

`koin-android`
- 舊的 state ViewModel API 已移除：
  - `stateViewModel()`、`getStateViewModel()`：改用 `viewModel()`。
  - `getSharedStateViewModel()`、`sharedStateViewModel()`：改用 `viewModel()`，共用執行個體則改用 `activityViewModel()`。

`koin-compose`
- 舊的 Compose API 函式已移除：
  - `inject()`：改用 `koinInject()`。
  - `getViewModel()`：改用 `koinViewModel()`。
  - `rememberKoinInject()`：已合併至 `koinInject()`。
- `rememberKoinApplication` 被標記為 `@KoinInternalApi`。

## 4.0.4 {id="4-0-4"}

Kotlin `2.0.21`。

所有程式庫版本皆可在 [libs.versions.toml](https://github.com/InsertKoinIO/koin/blob/4.0.4/projects/gradle/libs.versions.toml) 中查看。

### 新功能

`koin-core`
- `KoinPlatformTools.generateId()` 現在使用 Kotlin `kotlin.uuid` API，並在所有平台上產生真實的 UUID。

`koin-viewmodel`
- Koin 4.0 引入了跨 Google 和 JetBrains KMP API 共用的 ViewModel DSL 與 API。為了避免重複，ViewModel API 現在位於 `koin-core-viewmodel` 和 `koin-core-viewmodel-navigation` 中。
- ViewModel DSL 匯入路徑為 `org.koin.core.module.dsl.*`。

`koin-core-coroutines`：整個 API 現已穩定
- 所有 `lazyModules`
- `awaitAllStartJobs`、`onKoinStarted`、`isAllStartedJobsDone`
- `waitAllStartJobs`、`runOnKoinStarted`
- `KoinApplication.coroutinesEngine`
- `Module.includes(lazy)`
- `lazyModule()`
- `KoinPlatformCoroutinesTools`

### 實驗性功能

`koin-test`
- `ParameterTypeInjection`：為 `Verify` API 宣告動態參數注入。

`koin-androidx-startup`
- 透過 `androidx.startup.Initializer` API 使用 AndroidX Startup 啟動 Koin。整個 `koin-androidx-startup` API 均為實驗性。

`koin-compose`
- `rememberKoinModules`：使用 `@Composable` 載入與卸載 Koin 模組。
- `rememberKoinScope`：使用 `@Composable` 載入與卸載 Koin 作用域。
- `KoinScope`：為所有子 Composable 載入 Koin 作用域。

### 棄用

`koin-test`
- 整個 `checkModules` API。請遷移至 `Verify` API。

`koin-android`
- Android ViewModel DSL 已棄用，建議改用 `koin-core` 中的共用 DSL。
- state ViewModel API（設為錯誤等級）：
  - `stateViewModel()`、`getStateViewModel()`：改用 `viewModel()`。
  - `getSharedStateViewModel()`、`sharedStateViewModel()`：改用 `viewModel()`，共用執行個體則改用 `activityViewModel()`。

`koin-compose`
- 舊的 Compose API 函式（設為錯誤等級）：
  - `inject()`：改用 `koinInject()`。
  - `getViewModel()`：改用 `koinViewModel()`。
  - `rememberKoinInject()`：改用 `koinInject()`。

`koin-compose-viewmodel`
- ViewModel DSL 已棄用，建議改用 `koin-core` 中的共用 DSL。
- `koinNavViewModel` 已棄用，改用 `koinViewModel`。

### 破壞性變更

在前一個里程碑中棄用後，下列 API 已被移除。所有帶有 `@KoinReflectAPI` 註解的 API 也一併移除。

`koin-core`
- `ApplicationAlreadyStartedException` 更名為 `KoinApplicationAlreadyStartedException`。
- `KoinScopeComponent.closeScope()` 已移除（內部不再使用）。
- 內部的 `ResolutionContext` 取代了 `InstanceContext`。
- `KoinPlatformTimeTools`、`Timer` 和 `measureDuration` 已移除。請使用 Kotlin Time API。
- `KoinContextHandler` 已移除，改用 `GlobalContext`。

`koin-android`
- `Fragment.createScope()` 已移除。
- ViewModel 工廠 API（主要為內部使用）已針對新的內部架構重新設計。

`koin-compose`
- `StableParametersDefinition` 已移除（內部不再使用）。
- 延遲 ViewModel API（舊的 `viewModel()`）已移除。
- `rememberStableParametersDefinition()` 已移除（內部不再使用）。

## 3.5.6 {id="3-5-6"}

Kotlin `1.9.22`。

所有程式庫版本皆可在 [libs.versions.toml](https://github.com/InsertKoinIO/koin/blob/3.5.6/projects/gradle/libs.versions.toml) 中查看。

### 新功能

`koin-core`
- `KoinContext` 包含新函式：
  - `fun loadKoinModules(module: Module, createEagerInstances: Boolean = false)`
  - `fun loadKoinModules(modules: List<Module>, createEagerInstances: Boolean = false)`
- `koinApplication()` 具有多種簽章：
  - `koinApplication(createEagerInstances: Boolean = true, appDeclaration: KoinAppDeclaration? = null)`
  - `koinApplication(appDeclaration: KoinAppDeclaration?)`
  - `koinApplication(createEagerInstances: Boolean)`
- `KoinAppDeclaration`，開放更多宣告樣式。
- `KoinPlatformTimeTools`，以便在 JS 上使用 Time API。
- iOS：`synchronized` API 使用 Touchlab Lockable API。

`koin-androidx-compose`
- `KoinAndroidContext`，用於從 Android 環境繫結至目前的 Koin 上下文。

`koin-compose`
- `KoinContext`，以目前的預設上下文啟動。

`koin-ktor`
- 為 Ktor 執行個體使用隔離上下文（使用 `Application.getKoin()` 而非預設上下文）。
- Koin Ktor 外掛程式中的新監控功能。
- `RequestScope`，將執行個體限制在 Ktor 請求的作用域內。

### 實驗性功能

`koin-android`
- `ViewModelScope`：適用於 ViewModel 作用域的實驗性 API。

`koin-core-coroutines`
- 在背景載入模組的新 API。

### 棄用

`koin-android`
- `getLazyViewModelForClass()`：較複雜，且會呼叫預設的全域上下文。請使用 Activity 和 Fragment API。
- `resolveViewModelCompat()` 已棄用，建議改用 `resolveViewModel()`。

`koin-compose`
- `get()` 和 `inject()` 已棄用，建議改用 `koinInject()`。
- `getViewModel()` 已棄用，建議改用 `koinViewModel()`。
- `rememberKoinInject()` 已棄用，建議改用 `koinInject()`。

### 破壞性變更

`koin-core`
- `Koin.loadModules(modules: List<Module>, allowOverride: Boolean = true, createEagerInstances: Boolean = false)` 取代了 `Koin.loadModules(modules: List<Module>, allowOverride: Boolean = true)`。
- `KoinExtension.koin` 屬性被 `KoinExtension.onRegister()` 函式取代。
- iOS：`internal fun globalContextByMemoryModel(): KoinContext` 使用 `MutableGlobalContext`。

`koin-compose`
- `KoinApplication(moduleList: () -> List<Module>, content: @Composable () -> Unit)` 已移除，改用 `KoinContext` 和 `KoinAndroidContext`。

## 3.4.3 {id="3-4-3"}

Kotlin `1.8.21`。

### 新功能

`koin-core`
- `ExtensionManager` API，用於為 Koin 編寫擴充引擎（`ExtensionManager` 與 `KoinExtension`）。
- 參數 API：`parameterArrayOf` 和 `parameterSetOf`。

`koin-test`
- `Verification` API，用於在模組上執行 `verify()`。

`koin-android`
- 重新設計了 ViewModel 注入的內部機制。
- `AndroidScopeComponent.onCloseScope()` 回呼。

`koin-android-test`
- `Verification` API，用於在模組上執行 `androidVerify()`。

`koin-androidx-compose`
- `get()`。
- `getViewModel()`。
- 作用域 `KoinActivityScope` 與 `KoinFragmentScope`。

`koin-androidx-compose-navigation`（新模組）
- `koinNavViewModel()`。

`koin-compose`（Compose 的新 Multiplatform API）
- `koinInject` 與 `rememberKoinInject`。
- `KoinApplication`。

### 實驗性功能

`koin-compose`
- `rememberKoinModules`。
- `KoinScope` 與 `rememberKoinScope`。

### 棄用

`koin-compose`
- `inject()` 已棄用，建議改用 `get()` 以避免延遲函式。
- `viewModel()` 已棄用，建議改用 `getViewModel()` 以避免延遲函式。

### 破壞性變更

`koin-android`
- `LifecycleScopeDelegate` 已移除。

`koin-androidx-compose`
- `getStateViewModel` 已移除，改用 `koinViewModel`。

## 相關主題 {id="related"}

- [API Stability](/docs/support/api-stability)：實驗性、棄用與內部的意涵。
- [Versions, Roadmap & Support](/docs/support/)：發佈週期與 LTS 分支。
- [Compiler Plugin Setup](/docs/setup/compiler-plugin)：安裝或升級 Koin Compiler Plugin。
- [Migrating from KSP to the Compiler Plugin](/docs/migration/from-ksp-to-compiler-plugin)：從 KSP 處理器遷移。
- [Gradle Setup](/docs/setup/gradle)：Koin 構件與 BOM。