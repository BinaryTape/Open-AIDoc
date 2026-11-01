---
title: 歡迎
---

# 歡迎

Koin 是一套適用於 Kotlin 的相依注入架構。您可以在模組中宣告類別的組建方式，Koin 會在執行時期建立並連接這些執行個體，而選用的 Koin Compiler Plugin 則會在您組建時檢查整個依賴圖。它可執行於 Android、Compose、Kotlin Multiplatform、Ktor 以及任何 Kotlin/JVM 應用程式上。

本頁面是整份文件的導覽地圖。以下各節將說明它們各自解答了哪些問題，以及您可以從何處開始。

```kotlin
class UserRepository(private val api: ApiService)

val appModule = module {
    single<ApiService>()
    single<UserRepository>()
}

fun main() {
    startKoin { modules(appModule) }
}
```

## 我想要… {id="i-want-to"}

- 先了解相依注入：[什麼是相依注入？](/docs/intro/what-is-dependency-injection)
- 在五分鐘內了解 Koin 的運作方式：[核心概念](/docs/intro/core-concepts)
- 在 DSL 與註解之間做出選擇：[選擇您的風格](/docs/intro/choosing-your-style)
- 將 Koin 新增至我的 Gradle 組建中：[Gradle 設定](/docs/setup/gradle)
- 在 Composable 中注入 ViewModel：[Compose 中的 ViewModel](/docs/reference/koin-compose/compose-viewmodel)
- 在 Activity、Fragment 或 Service 中進行注入：[Android 入口點](/docs/reference/koin-android/entry-points)
- 連接 Retrofit、Room 或 OkHttp：[Android 程式庫整合](/docs/reference/koin-android/binding-patterns)
- 在 Android 與 iOS 之間共享模組：[KMP 共享模式](/docs/reference/koin-core/kmp-shared-modules)
- 將執行時期數值（例如 ID）傳遞給定義：[注入參數](/docs/reference/koin-core/injection-parameters)
- 測試我的 Koin 配置：[驗證您的 Koin 配置](/docs/reference/koin-test/verify) 與 [編譯期安全性](/docs/reference/koin-compiler/compile-safety)
- 修復「No definition found」錯誤：[疑難排解](/docs/reference/koin-core/troubleshooting)
- 從 Hilt 遷移：[從 Hilt 遷移](/docs/reference/koin-android/hilt-migration)
- 將我的註解從 KSP 遷移至 Compiler Plugin：[從 KSP 遷移](/docs/migration/from-ksp-to-compiler-plugin)
- 查看 Koin 在正式環境中的運作表現：[正式環境監控](/docs/tooling/production-monitoring)

## 導覽目錄 {id="where-to-go"}

### 開始使用 {id="get-started"}

什麼是 Koin？它是如何運作的？我該使用哪種風格？

- [什麼是 Koin？](/docs/intro/what-is-koin)：Koin 是什麼以及它如何運作，包含執行時期與編譯期。
- [核心概念](/docs/intro/core-concepts)：定義、模組、容器、注入、作用域。
- [選擇您的風格](/docs/intro/choosing-your-style)：註解或 DSL（Compiler Plugin、Constructor DSL 或 Classic DSL）。
- [Koin Compiler Plugin](/docs/intro/koin-compiler-plugin)：此外掛程式在組建時期執行的工作。

### 設定 {id="setup"}

我該在組建中新增什麼？

- [設定](/docs/setup)：各平台需要安裝的內容。
- [Gradle 設定](/docs/setup/gradle)：BOM 與所有 Koin 構件。
- [Compiler Plugin 設定](/docs/setup/compiler-plugin)：安裝並設定 Gradle 外掛程式。

### 教學 {id="tutorials"}

如何一步步使用 Koin 建置第一個應用程式？

- [Kotlin](/docs/quickstart/kotlin)：純 Kotlin 應用程式。
- [Android - ViewModel](/docs/quickstart/android-viewmodel) 與 [Android - Jetpack Compose](/docs/quickstart/android-compose)。
- [Compose Multiplatform](/docs/quickstart/cmp)：在 Android 與 iOS 上共享 UI。
- [Ktor](/docs/quickstart/ktor)：伺服器端應用程式。

### 核心 {id="core"}

如何在任何平台上宣告、組織與檢索相依項？

- [啟動 Koin](/docs/reference/koin-core/starting-koin)：`startKoin`、記錄、屬性。
- [模組](/docs/reference/koin-core/modules) 與 [定義](/docs/reference/koin-core/definitions)：宣告 Koin 要組建的內容。
- [作用域](/docs/reference/koin-core/scopes)：繫結至特定生命週期的執行個體。
- [疑難排解](/docs/reference/koin-core/troubleshooting)：錯誤以及如何解讀它們。

### 平台 {id="platforms"}

如何在特定平台或架構中使用 Koin？

- Android：[在 Android 上啟動 Koin](/docs/reference/koin-android/start)、[Android ViewModel](/docs/reference/koin-android/viewmodel)、[多模組 Android 應用程式](/docs/reference/koin-android/multi-module)。
- Compose：[適用於 Compose 的 Koin](/docs/reference/koin-compose/compose)、[Compose 中的 ViewModel](/docs/reference/koin-compose/compose-viewmodel)、[Navigation 3](/docs/reference/koin-compose/navigation3)。
- Kotlin Multiplatform：[KMP 設定](/docs/reference/koin-core/kmp-setup)、[共享模式](/docs/reference/koin-core/kmp-shared-modules)。
- Ktor：[適用於 Ktor 的 Koin](/docs/reference/koin-ktor/ktor)、[請求作用域](/docs/reference/koin-ktor/ktor-scopes)。

### 測試 {id="testing"}

如何測試使用 Koin 的程式碼，並測試配置本身？

- [在測試中進行注入](/docs/reference/koin-test/testing)：`KoinTest`、使用測試替身（fakes）取代定義。
- [驗證您的 Koin 配置](/docs/reference/koin-test/verify)：在單元測試中檢查模組。
- [Android 檢測測試](/docs/reference/koin-android/instrumented-testing) 與 [測試 Composable](/docs/reference/koin-compose/compose-testing)。

### 正式環境與工具 {id="production-tooling"}

有哪些工具可以協助我編寫、檢查與執行 Koin 應用程式？

- [工具](/docs/tooling)：圍繞 Koin 的周邊工具概覽。
- [IDE 外掛程式](/docs/tooling/ide-plugin)：Android Studio 與 IntelliJ IDEA 中的導覽與檢查。
- [Monitor](/docs/tooling/monitor) 與 [正式環境監控](/docs/tooling/production-monitoring)：查看 Koin 在執行時期的運作狀況。

### 遷移 {id="migration"}

我正在使用其他架構或舊版 Koin 設定。該如何遷移？

- [Koin vs Hilt](/docs/intro/koin-vs-hilt)：兩者的比較。
- [從 Hilt 遷移](/docs/reference/koin-android/hilt-migration)：逐步指南。
- [JSR-330 相容性](/docs/reference/koin-android/jsr330)：保留來自 `javax.inject` 的 `@Inject` 與 `@Singleton`。
- [從 KSP 遷移](/docs/migration/from-ksp-to-compiler-plugin)：將註解遷移至 Compiler Plugin。

### 參考指南 {id="reference"}

所有關鍵字、註解與選項有哪些？

- [DSL 參考](/docs/reference/koin-core/dsl)：每個 DSL 關鍵字。
- [註解參考](/docs/reference/koin-annotations/annotations-inventory)：每個註解及其參數。
- [Compiler Plugin 選項](/docs/reference/koin-annotations/options)：此外掛程式的所有 Gradle 選項。

### 支援 {id="support"}

我該使用哪個版本？有什麼變更？可以從哪裡獲得協助？

- [版本發佈](/docs/support/releases)：版本、變更事項與升級說明。
- [API 穩定性](/docs/support/api-stability)：穩定版 (stable)、實驗性 (experimental) 與內部 (internal) 代表的含義。
- [支援](/docs/support)：發展藍圖、社群與支援選項。

## 相關內容 {id="related"}

- [什麼是 Koin？](/docs/intro/what-is-koin)：如果您剛接觸 Koin，這是接下來建議閱讀的頁面。
- [核心概念](/docs/intro/core-concepts)：貫穿所有其他頁面的心智模型。
- [設定](/docs/setup)：為您的平台安裝 Koin。