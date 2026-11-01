---
title: 什麼是 Koin？
---

# 什麼是 Koin？

Koin 是一個適用於 Kotlin 的相依注入架構。本頁面將說明它的運作原理、其優缺點與代價，以及該專案的組織架構。如果你對相依注入還不熟悉，請先閱讀[什麼是相依注入？](/docs/intro/what-is-dependency-injection)。

## Koin 如何運作 {id="how-koin-works"}

你在模組中描述你的類別，啟動一次 Koin，然後在需要的地方請求執行個體：

```kotlin
class ApiService
class UserRepository(private val api: ApiService)

val appModule = module {
    single<ApiService>()
    single<UserRepository>()
}

fun main() {
    startKoin {
        modules(appModule)
    }
}
```

這背後由兩個部分協同運作：

- **執行階段容器 (Runtime container)**：`startKoin` 會將你的模組載入到容器中。每個定義都是一個用來建置單一型別的 Kotlin 函式。當有程式碼請求 `UserRepository` 時，Koin 會執行該函式，從容器中解析其建構函式參數，並依據定義型別（`single`、`factory`、`scoped`）保留或捨棄該執行個體。Koin 不會透過反射來建置物件。
- **編譯期檢查（選用）**：[Koin Compiler Plugin](/docs/intro/koin-compiler-plugin) 是一個 Kotlin 編譯器外掛程式。它會讀取你的建構函式來產生連接程式碼，接著在建置時檢查組裝好的圖形中每個相依性是否都已宣告。遺漏的定義會變成建置錯誤，而不是在執行階段崩潰。

[核心概念](/docs/intro/core-concepts)透過一個實際範例說明了模組、定義、作用域與注入。

## 執行階段模型的代價與優勢 {id="what-the-runtime-model-costs-and-gives"}

因為圖形存在於執行階段容器中，Koin 可以在應用程式執行期間對其進行修改：

- **動態模組**：在啟動後透過 `loadKoinModules()` 與 `unloadKoinModules()` 載入和卸載模組，適用於功能旗標 (feature flags) 或隨選功能。請參閱[啟動 Koin](/docs/reference/koin-core/starting-koin)。
- **延遲模組**：在背景載入圖形的一部分，以減少啟動時間。請參閱[延遲模組](/docs/reference/koin-core/lazy-modules)。
- **執行階段建立的作用域**：為工作階段、畫面或請求開啟和關閉作用域。請參閱[作用域](/docs/reference/koin-core/scopes)。
- **無產生的原始碼**：無需提交任何產生的檔案，也無需針對每個 Kotlin Multiplatform 目標進行額外配置。

同樣的模型也有你應該了解的代價：

- **啟動工作負擔**：模組在 Koin 啟動時註冊，且每次查詢都需經過容器。對大多數應用程式來說這項開銷很小，但預先載入定義（`createdAtStart`）會在啟動 Koin 的執行緒上執行。
- **未使用外掛程式時的執行階段錯誤**：在使用建構函式 DSL 或傳統 DSL 且沒有外掛程式的情況下，遺漏的定義只有在程式碼執行時才會被發現。你可以在單元測試中使用 [`verify()`](/docs/reference/koin-test/verify) 來捕捉它，或是在建置時透過編譯器外掛程式來檢查。
- **編譯期檢查的限制**：外掛程式只會驗證在 Koin 入口點（如 `startKoin`）組裝的圖形。稍後透過 `loadKoinModules()` 載入的模組無法在建置時被驗證，而沒有入口點的程式庫模組只有在應用程式將其組裝時才會被檢查。請參閱[編譯期安全性](/docs/reference/koin-compiler/compile-safety)。
- **Kotlin 版本偶合**：編譯器外掛程式依賴於編譯器內部機制，因此每個外掛程式發行版本都會在指定的 Kotlin 版本清單上進行驗證。請參閱[編譯器外掛程式設定](/docs/setup/compiler-plugin)。

## 建構函式注入與服務定位器 (Service Locator) {id="constructor-injection-and-service-locator"}

你的類別透過建構函式接收其相依項。Koin 僅在無法自行建立物件的入口點處檢索執行個體：

```kotlin
// 由 Koin 建立這些物件：相依項透過建構函式傳入
class UserRepository(private val api: UserApi)
class UserViewModel(private val repository: UserRepository) : ViewModel()

// Android 建立 Activity：它從 Koin 檢索其 ViewModel
class UserActivity : AppCompatActivity() {
    private val viewModel: UserViewModel by viewModel()
}
```

相依項在簽章中清晰可見，你可以在不依賴 Koin 的情況下測試 `UserRepository` 與 `UserViewModel`。像 `by inject()`、`by viewModel()` 或 `koinInject()` 這樣的檢索函式屬於入口點：`Activity`、`Fragment`、根 Composable、`main()`、Ktor 路由或測試。[什麼是相依注入？](/docs/intro/what-is-dependency-injection)比較了這兩種模式，而[檢索相依項](/docs/reference/koin-core/injection)則涵蓋了 `get()` 與 `inject()`。

## 兩種風格，同一個容器 {id="two-styles-one-container"}

| 風格 | 範例 | 需求 |
|-------|---------|-------|
| 編譯器外掛程式 DSL | `single<UserRepository>()` | Koin 編譯器外掛程式 |
| 註解 (Annotations) | `@Singleton class UserRepository(...)` | Koin 編譯器外掛程式, `koin-annotations` |
| 建構函式 DSL | `singleOf(::UserRepository)` | 無額外需求（外掛程式可增加編譯期檢查） |
| 傳統 DSL | `single { UserRepository(get()) }` | 無額外需求（外掛程式可增加編譯期檢查） |

註解是一種風格；編譯器外掛程式 DSL、建構函式 DSL 與傳統 DSL 則是另一種風格（Koin DSL）的三種形式。它們都在同一個容器中產生相同的定義。建議每個專案選擇一種風格。[選擇你的風格](/docs/intro/choosing-your-style)對它們進行了比較並提供了預設建議。

## 註解支援現況 {id="annotations-status"}

`koin-annotations` 程式庫（`@Singleton`、`@Factory`、`@KoinViewModel`、`@Module`、`@ComponentScan`）是 Koin 主要專案的一部分：相同的存放庫、相同的版本、相同的 BOM。它**並未**被棄用。被棄用的是過去用來讀取這些註解的 KSP 處理器 `koin-ksp-compiler`。Koin 編譯器外掛程式取代了它，並支援相同的註解。請參閱[從 KSP 遷移至編譯器外掛程式](/docs/migration/from-ksp-to-compiler-plugin)。

## 支援平台 {id="platforms"}

Koin 是一個 Kotlin Multiplatform 程式庫。核心部分可在所有 Kotlin 目標上執行，而整合程式庫則新增了平台特定的 API：

| 平台 | 主要構件 | 從這裡開始 |
|----------|---------------|------------|
| Kotlin/JVM | `koin-core` | [Kotlin 教學](/docs/quickstart/kotlin) |
| Android | `koin-android` | [在 Android 上啟動 Koin](/docs/reference/koin-android/start) |
| Jetpack Compose, Compose Multiplatform | `koin-compose`, `koin-compose-viewmodel` | [適用於 Compose 的 Koin](/docs/reference/koin-compose/compose) |
| Kotlin Multiplatform (iOS, 桌面端, Web, 原生) | `koin-core` | [Kotlin Multiplatform 設定](/docs/reference/koin-core/kmp-setup) |
| Ktor 伺服器 | `koin-ktor` | [適用於 Ktor 的 Koin](/docs/reference/koin-ktor/ktor) |

完整的構件清單請參閱 [Gradle 設定](/docs/setup/gradle)。

## Koin 專案組織 {id="the-koin-project"}

Koin 是基於 Apache 2.0 授權條款的開源專案。它由以下部分組成：

- **Koin 程式庫**：核心 (core)、Android、Compose、Ktor、測試與註解，皆在同一個版本下發布。原始碼：[InsertKoinIO/koin](https://github.com/InsertKoinIO/koin)。
- **Koin 編譯器外掛程式**：Kotlin 編譯器外掛程式及其 Gradle 外掛程式，具有獨立的版本號。原始碼：[InsertKoinIO/koin-compiler-plugin](https://github.com/InsertKoinIO/koin-compiler-plugin)。
- **Koin IDE 外掛程式**：在 Android Studio 與 IntelliJ IDEA 中提供導覽與檢查功能。請參閱 [IDE 外掛程式](/docs/tooling/ide-plugin)。
- **範例專案**：每個教學對應的可執行應用程式，位於 [InsertKoinIO/koin-getting-started](https://github.com/InsertKoinIO/koin-getting-started)。

如果你熟悉 Hilt 或 Dagger，[Koin vs Hilt](/docs/intro/koin-vs-hilt) 比較了這兩種不同的做法。

## 相關內容 {id="related"}

- [核心概念](/docs/intro/core-concepts)：心智模型，透過單一範例逐步建構。
- [選擇你的風格](/docs/intro/choosing-your-style)：該使用哪種宣告風格。
- [Koin 編譯器外掛程式](/docs/intro/koin-compiler-plugin)：建置時發生的詳細機制。
- [設定](/docs/setup)：將 Koin 新增至你的專案。
- [教學](/docs/quickstart/kotlin)：建置你的第一個應用程式。