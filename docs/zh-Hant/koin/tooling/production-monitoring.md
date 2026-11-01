---
title: 生產環境監控
---

# 生產環境監控

Kotzilla 平台可監控正式生產環境中的 Koin 應用程式。Kotzilla SDK 插入 Koin 容器中，記錄真實使用者工作階段中相依性的解析方式，而 Kotzilla 主控台會將這些資料轉換為效能問題與當機報告。Kotzilla 是打造 Koin 的公司。該平台是一項獨立且可選的服務：Koin 完全可以在沒有它的情況下運作。

在進入生產環境之前，Koin 本身的工具即可捕捉大部分的設定錯誤：[編譯期安全](/docs/reference/koin-compiler/compile-safety)、[記錄](/docs/reference/koin-core/starting-koin#logging) 以及 [模組驗證](/docs/reference/koin-test/verify)。本頁面涵蓋發布之後的情況。如需所有工具的概觀，請參閱 [生產環境與工具](/docs/tooling)。

## 偵測項目 {id="what-it-detects"}

主控台會將工作階段資料分組為問題：

| 問題 | 說明 |
|-------|---------------|
| 啟動效能 | 應用程式初始化期間的延遲 |
| 主執行緒效能 | 導致畫面凍結的主執行緒工作。主執行緒上耗時 100 ms 以上的相依性解析會回報於此 |
| 背景效能 | 背景執行緒處理中的瓶頸 |
| 當機 | 來自真實使用者工作階段的當機 |

主控台提供圖形化檢視，用於調查效能瓶頸、當機和架構問題。相同的問題也會顯示在 [IDE 外掛程式](/docs/tooling/ide-plugin) 中。

## 運作方式 {id="how-it-works"}

SDK 在啟動時掛鉤到 Koin 容器中。從那時起，它會記錄兩種資料：

- **結構**：相依圖，包含模組、定義和繫結。
- **執行階段行為**：解析耗時、生命週期事件與當機。

您無需在類別中加入追蹤程式碼：資料皆來自容器。若要一併追蹤您自己的函式，請加入 [@Monitor](/docs/tooling/monitor)。

SDK 支援的平台：Android，以及包含 iOS、JVM 桌面、JS 與 Wasm 的 Kotlin Multiplatform 目標。

## 設定概觀 {id="setup-overview"}

詳細且最新的步驟請參閱官方 Kotzilla 指南。請以該指南為主，以下大綱僅展示設定的大致流程：

1. 從 [Kotzilla 主控台](https://console.kotzilla.io)、[IDE 外掛程式](/docs/tooling/ide-plugin) 或 MCP 伺服器建立帳戶並註冊您的應用程式。您將取得包含應用程式金鑰的 `kotzilla.json` 檔案。
2. 新增 Kotzilla Gradle 外掛程式 (`io.kotzilla.kotzilla-plugin`) 以及 SDK 相依性 (`io.kotzilla:kotzilla-sdk`)。
3. 將 `kotzilla.json` 放置在 app 模組（Android）或共用模組（KMP）中。
4. 在 `startKoin` 區塊的最後呼叫 `monitoring()`。

在 Android 上：

```kotlin
import io.kotzilla.generated.monitoring

class MainApplication : Application() {
    override fun onCreate() {
        super.onCreate()
        startKoin {
            androidContext(this@MainApplication)
            modules(appModule)
            monitoring()
        }
    }
}
```

`monitoring()` 是由 Kotzilla Gradle 外掛程式在建置時根據您的 `kotzilla.json` 產生的。請在每個平台的進入點呼叫一次，切勿在 composable 中呼叫。

各平台指南：

- [Android](https://doc.kotzilla.io/docs/getstartedCustom/setupAndroid)
- [Android Compose](https://doc.kotzilla.io/docs/getstartedCustom/setupAndroidCompose)
- [Kotlin Multiplatform](https://doc.kotzilla.io/docs/getstartedCustom/setupKMP)
- [Compose Multiplatform](https://doc.kotzilla.io/docs/getstartedCustom/setupCMP)
- [SDK for libraries](https://doc.kotzilla.io/docs/getstartedCustom/setupSDKLibrary)

:::note
在 iOS 上，當機符號化需要上傳 dSYM 步驟。Kotlin Multiplatform 指南對此有詳細說明。
:::

## AI 助理整合 {id="ai-assistant-integration"}

Kotzilla MCP 伺服器將 AI 編碼助理（Claude Code、Cursor、Windsurf、Android Studio 及其他 MCP 用戶端）與 Koin 診斷工具連線。將 Koin 錯誤貼至助理中，伺服器便會對其進行分類，並傳回逐步修復工作流程。它可辨識：

- 來自 Koin Compiler Plugin 的**編譯期診斷**，從 `KOIN-D001` 到 `KOIN-M001`。
- **執行階段例外**，例如 `NoBeanDefFoundException`、`InstanceCreationException` 以及循環相依錯誤。

端點為 `https://mcp.kotzilla.io/mcp`（可串流的 HTTP）。搭配 Claude Code 使用時：

```bash
claude mcp add kotzilla --transport http https://mcp.kotzilla.io/mcp
```

伺服器會在首次使用時要求您使用 Kotzilla 帳戶登入。修復編譯錯誤無需 SDK 即可運作。分析執行階段行為則需要 SDK 與工作階段資料。

當建置回報 Koin 診斷時，Koin Compiler Plugin 會印出指向 MCP 伺服器的提示。若要將其關閉，請在 `koinCompiler { }` 區塊中設定 `aiAssist = false`。

如需其他用戶端，請參閱 [MCP 伺服器指南](https://doc.kotzilla.io/docs/fixIssues/koinMcp)。

## 資料與隱私權 {id="data-and-privacy"}

SDK 會傳送技術工作階段資料：相依圖以及 [運作方式](#how-it-works) 中列出的執行階段資料。MCP 伺服器僅會傳送錯誤文字和來自助理的結構化查詢。您的原始檔保留在您的電腦上。

如需完整政策，請參閱 [Kotzilla 隱私權政策](https://kotzilla.io/privacy)。

## 費用 {id="cost"}

開發人員方案免費提供，無時間限制，並享有有限的事件配額。企業方案則增加了團隊協作功能。最新方案請參閱 [kotzilla.io](https://kotzilla.io)。

## 不包含的功能 {id="what-it-does-not-do"}

- **它不會在建置時驗證您的設定。** 這是 [編譯期安全](/docs/reference/koin-compiler/compile-safety) 的工作。
- **它不能取代測試。** 請在發布前使用 [測試](/docs/reference/koin-test/testing) 來檢查行為。
- **它不會改變 Koin 解析相依性的方式。** SDK 僅觀察容器，您的定義保持不變。
- **它預設不會追蹤您自己的程式碼。** 除非加入 [@Monitor](/docs/tooling/monitor)，否則僅會記錄 Koin 解析過程。

## 相關內容 {id="related"}

- [生產環境與工具](/docs/tooling)：針對不同需求選用適合的工具。
- [@Monitor](/docs/tooling/monitor)：使用 Kotzilla SDK 追蹤您自己的函式。
- [IDE 外掛程式](/docs/tooling/ide-plugin)：在程式碼旁查看生產環境問題。
- [疑難排解](/docs/reference/koin-core/troubleshooting)：閱讀並修復 Koin 錯誤。
- [Kotzilla 文件](https://doc.kotzilla.io)：完整的平台與 SDK 文件。