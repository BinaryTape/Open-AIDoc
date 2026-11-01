---
title: 生產環境與工具
---

# 生產環境與工具

本頁將 Koin 專案的各個階段對應到涵蓋該階段的工具。Koin 本身涵蓋了組建期、開發與測試。在生產環境方面，Kotzilla（打造 Koin 的公司）提供了一個選用的監控平台。

除了隨 Koin 一同隨附的工具之外，Koin 中的所有功能皆可在沒有本頁提及的任何工具的情況下運作。請依據您的需求選擇合適的工具。

## 針對不同需求選擇工具 {id="which-tool-for-which-need"}

| 階段 | 需求 | 工具 | 隨附於 Koin |
|-------|------|------|-----------------|
| 組建期 | 在遺漏相依性或限定詞錯誤時使組建失敗 | 搭配 Koin 編譯器外掛程式的[編譯期安全性](/docs/reference/koin-compiler/compile-safety) | 是 |
| 開發 | 查看 Koin 建立與解析的內容 | 搭配 `printLogger()` 或平台記錄器的[記錄](/docs/reference/koin-core/starting-koin#logging) | 是 |
| 開發 | 在定義與注入點之間導覽，在編輯器中查看問題 | 適用於 Android Studio 和 IntelliJ IDEA 的 [IDE 外掛程式](/docs/tooling/ide-plugin) | 否，Kotzilla 提供的免費外掛程式 |
| 開發 | 讓您的 AI 編碼代理設定、編寫、遷移與診斷 Koin 程式碼 | 適用於 Claude Code、Cursor、Codex、Copilot 的 [Koin Skills](/docs/tooling/ai-agents) | 否，Koin 團隊提供的免費 skills |
| 測試 | 無需執行應用程式即可檢查模組配置 | 搭配 `verify()` 的[驗證模組](/docs/reference/koin-test/verify) | 是 |
| 測試 | 使用 fake 或 mock 替換定義 | 搭配 `KoinTest` 的[測試](/docs/reference/koin-test/testing) | 是 |
| 生產環境 | 追蹤所選函式的執行時間 | 搭配 Kotzilla SDK 的 [@Monitor](/docs/tooling/monitor) | 註解為是，追蹤需要 SDK |
| 生產環境 | 從真實使用者工作階段中查看啟動、主執行緒與背景效能問題及當機 | 搭配 Kotzilla 平台的[生產環境監控](/docs/tooling/production-monitoring) | 否，Kotzilla 服務 |

## 組建期 {id="build-time"}

Koin 編譯器外掛程式會在編譯期間檢查您的相依性圖 (dependency graph)。遺漏定義、遺漏限定詞或未知的作用域都會使組建失敗並顯示 `KOIN-Dxxx` 診斷訊息，而不是在執行期發生崩潰。這是第一道防線：請參閱[編譯期安全性](/docs/reference/koin-compiler/compile-safety)以了解驗證的內容以及如何進行設定。

## 開發 {id="development"}

Koin 記錄器會印出模組載入與執行個體建立資訊。使用 `printLogger(Level.DEBUG)` 或平台記錄器（`androidLogger()`、SLF4J）將其開啟。它會將原始文字寫入主控台或 Logcat，因此它是一項偵錯輔助工具，而非監控工具。請參閱[記錄](/docs/reference/koin-core/starting-koin#logging)。

[IDE 外掛程式](/docs/tooling/ide-plugin)在編輯器中新增了導覽、模組與定義的樹狀視圖，以及配置檢查功能。

[Koin skills](/docs/tooling/ai-agents) 為您的 AI 編碼代理提供 Koin 規則：設定、定義、從其他 DI 架構遷移，以及 Koin 錯誤的診斷。

## 測試 {id="tests"}

`verify()` 可透過純 JUnit 測試來檢查模組中的每個定義是否都能成功組建。如果您使用編譯器外掛程式，編譯期安全性就已經涵蓋了 `verify()` 所檢查的大部分內容。請參閱[驗證模組](/docs/reference/koin-test/verify)與[測試](/docs/reference/koin-test/testing)。

## 生產環境 {id="production"}

編譯期安全性與測試能夠擷取配置錯誤。但它們無法告訴您該圖在真實裝置上的運作狀況：啟動時解析需要多長時間、哪個相依性阻塞了主執行緒、哪次當機源自於 Koin 解析。

Koin 本身沒有生產環境監控功能。Kotzilla 平台透過插入至 Koin 容器中的 Kotzilla SDK 來滿足此需求。請參閱[生產環境監控](/docs/tooling/production-monitoring)。[@Monitor](/docs/tooling/monitor) 註解則將此功能延伸至您自己的函式中。

## 相關內容 {id="related"}

- [編譯期安全性](/docs/reference/koin-compiler/compile-safety)：編譯器外掛程式在組建期檢查的內容。
- [啟動 Koin](/docs/reference/koin-core/starting-koin#logging)：啟用並配置 Koin 記錄器。
- [驗證模組](/docs/reference/koin-test/verify)：從測試中檢查配置。
- [IDE 外掛程式](/docs/tooling/ide-plugin)：在 Android Studio 與 IntelliJ IDEA 中的導覽與檢查。
- [生產環境監控](/docs/tooling/production-monitoring)：適用於 Koin 應用程式的 Kotzilla 平台。