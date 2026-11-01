---
title: API 穩定性與發佈類型
---

# API 穩定性與發佈類型

此頁面說明 Koin API 的穩定性協定：如何引入新 API、如何移除舊 API，以及每種發佈類型所提供的保證。若要查看各版本的變更，請參閱[版本發佈與升級指南](/docs/support/releases)。

## 版本間的相容性 {id="compatibility-between-versions"}

Koin 旨在讓現有應用程式能在不同版本間持續正常運作。Kotzilla 團隊與維護人員會檢查新版本中的變更、改進與最佳化，確保不會破壞現有程式碼。當 API 必須變更時，會經歷以下實驗性與棄用步驟，以便您規劃升級。

## 實驗性 API {id="experimental-apis"}

新功能最初會以 `@KoinExperimentalAPI` 註解的形式發佈。實驗性 API 具備以下特性：

- **積極開發中**：其設計尚未定案，隨時可能變更。
- **開放回饋**：歡迎試用並回報可行與不可行的部分，這有助於塑造最終設計。
- **無穩定保證**：根據收集到的回饋，它可能會在後續版本中變更或移除。

在未選擇加入 (opt-in) 的情況下使用實驗性 API 會產生編譯器警告。可使用 Kotlin 的 `@OptIn` 選擇加入：

```kotlin
@OptIn(KoinExperimentalAPI::class)
fun setupKoin() { ... }
```

選擇加入可讓您的程式碼中對不穩定 API 的相依性變得明確。

## Delicate API {id="delicate-apis"}

`@KoinDelicateAPI` 用於標記需要謹慎使用的穩定 API。它們針對特定的進階使用案例，若使用不當可能會在執行階段導致非預期的行為。如同實驗性 API，除非您使用 `@OptIn(KoinDelicateAPI::class)` 選擇加入，否則它們會產生編譯器警告。在選擇加入前，請務必先閱讀 API 文件。

## 棄用的 API {id="deprecated-apis"}

逐步淘汰的 API 會使用 Kotlin 的 `@Deprecated` 標記。訊息中會提供替代方案或原因。當更新很單純時，`ReplaceWith` 可讓 IDE 自動為您套用變更。

棄用會經歷兩個層級：

- **Warning（警告）**：API 仍可運作，但建議儘早替換。
- **Error（錯誤）**：API 將無法通過編譯。在升級前必須將其替換。

處於 error 層級棄用的 API 通常會在後續版本中被移除。[版本資訊 (release notes)](/docs/support/releases) 會列出每個版本的棄用與移除項目。

## 內部 API {id="internal-apis"}

`@KoinInternalApi` 用於標記為了 Koin 自身機制而存在的函式與類別。它們不屬於公開協定的一環：

- **僅供內部使用**：它們服務於 Koin 自身的實作，而非應用程式程式碼。
- **隨時可能變動**：它們可能在任何版本中變更或移除，恕不另行通知。

在未選擇加入的情況下使用內部 API 會導致編譯錯誤。請勿在應用程式程式碼中選擇加入。

## 發佈類型 {id="release-types"}

Koin 遵循語意化版本（`Major.Minor.Patch`，詳見[版本、藍圖與支援](/docs/support/)）。預發佈版本帶有表示其成熟度的後綴：

- **Alpha 與 Beta**：發佈用於測試與收集回饋。它們通常包含實驗性功能，且不完全遵循穩定 API 的保證。請在非生產環境中使用。
- **Release Candidate (RC)**：穩定版本的候選發佈版，功能已完整具備並處於最終測試階段。預期與最終正式版相容，但仍可能根據回饋進行微調。

## 相關連結 {id="related"}

- [版本發佈與升級指南](/docs/support/releases)：各版本的變更、棄用與移除項目。
- [版本、藍圖與支援](/docs/support/)：發佈週期與支援選項。
- [從 KSP 遷移至編譯器外掛程式](/docs/migration/from-ksp-to-compiler-plugin)：脫離已棄用的 KSP 處理器。