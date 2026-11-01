---
title: IDE 外掛程式
---

# IDE 外掛程式

適用於 Android Studio 和 IntelliJ IDEA 的 Koin 外掛程式可以在 IDE 內顯示您的 Koin 配置：每個定義宣告的位置、使用的位置以及缺少的項目。它由 Kotzilla 建置，並在 JetBrains Marketplace 上免費提供。除了下文所述的應用程式問題外，它不需要 Kotzilla 平台。

## 安裝 {id="installation"}

從 [JetBrains Marketplace](https://plugins.jetbrains.com/plugin/26131-koin-dependency-injection-official-) 或直接在 IDE 中安裝外掛程式：開啟「Settings」，接著依序進入「Plugins」>「Marketplace」，搜尋「Koin」，然後重新啟動 IDE。

此外掛程式需要基於 IntelliJ 平台 2024.2 或更新版本的 IDE。它支援 Android、JVM 以及 Kotlin Multiplatform 專案。

## 配置樹狀檢視 {id="configuration-tree-view"}

此外掛程式新增了 Koin 配置的樹狀檢視：

- **Modules**：每個已宣告的模組，包括測試模組、在 `startKoin` 或 `koinApplication` 中內嵌宣告的模組，以及啟動入口項目。
- **Definitions**：每個模組的 singleton、factory、ViewModel、限定作用域定義 (scoped definition) 和注入參數。

您可以直接鍵入文字在樹狀結構中搜尋，選取項目即可在編輯器中開啟對應內容。

該樹狀檢視可讀取建構函式與傳統 DSL（`singleOf(::T)`、`single { }`）、Ktor DSL、Compose API 以及 Koin 註解（包括限定詞和泛型型別）。

## 導覽 {id="navigation"}

裝訂邊圖示會標示出定義、注入點與參數。您可以透過它們：

- 從注入點（`get()`、`by inject()`、`koinViewModel()`、建構函式參數）跳轉到提供它的定義，
- 從定義跳轉到使用它的位置，
- 在配置樹狀檢視中開啟該定義。

此外掛程式會讀取定義的引數型別來尋找其相依項，包括注入的參數。您可以在外掛程式設定中變更要顯示哪些裝訂邊圖示。

## 配置檢查 {id="configuration-checks"}

外掛程式會在您編輯時檢查配置，並在 Koin Insights 檢視的「Configuration issues」分頁中回報問題：沒有定義的相依項、使用了未宣告的型別、沒有被使用的定義，以及其他設定錯誤。

各項檢查都可以在 IDE 設定中啟用或停用。

:::note
這些檢查是在編輯器中執行的。它們提供的是快速回饋循環，並不能取代建置時的驗證。若搭配 [Koin 編譯器外掛程式](/docs/intro/koin-compiler-plugin)，同類型的錯誤將會導致組建失敗：請參閱[編譯期安全性](/docs/reference/koin-compiler/compile-safety)。
:::

## 應用程式問題 {id="application-issues"}

如果您的應用程式透過 Kotzilla SDK 將資料傳送至 Kotzilla 平台，「Application issues」分頁便會在程式碼旁顯示在真實使用者工作階段中偵測到的問題（啟動緩慢、主執行緒阻塞、背景瓶頸、崩潰）。「Kotzilla Flight Check」分頁則會顯示您的 Koin 版本以及 SDK 是否已完成設定。

這部分需要 Kotzilla 帳戶和 SDK。請參閱[生產環境監控](/docs/tooling/production-monitoring)。

針對偵測到的問題，外掛程式可以產生包含其上下文（受影響的組建、相依鏈、效能資料）的提示詞，以便貼至 GitHub Copilot、Gemini、Claude Code 或 Junie 等 AI 編碼協助工具中。

## 限制 {id="limits"}

- **積極開發中**：功能會隨著版本更新而變更。請查看 Marketplace 頁面以取得最新版本與變更清單。
- **僅限編輯器**：此外掛程式不會在 CI 中執行。如需使用能阻擋合併的檢查，請使用[編譯期安全性](/docs/reference/koin-compiler/compile-safety)或[驗證模組](/docs/reference/koin-test/verify)。

外掛程式專屬的文件請參閱 [doc.kotzilla.io](https://doc.kotzilla.io/docs/discover/idePlugin)。

## 相關內容 {id="related"}

- [生產環境與工具](/docs/tooling)：依據不同需求選擇適合的工具。
- [編譯期安全性](/docs/reference/koin-compiler/compile-safety)：在建置期擷取相同的錯誤。
- [驗證模組](/docs/reference/koin-test/verify)：從測試中檢查配置。
- [疑難排解](/docs/reference/koin-core/troubleshooting)：閱讀並修復 Koin 錯誤。
- [生產環境監控](/docs/tooling/production-monitoring)：應用程式問題分頁背後的資料來源。