---
title: 版本、藍圖與支援
---

# 版本、藍圖與支援

本頁面說明 Koin 版本如何編號與發佈，以及各版本所提供的支援服務。Koin 是一套開源且由社群驅動的專案。打造 Koin 的公司 Kotzilla，也為有需求的團隊提供商業長期支援服務。

## 發佈週期 {id="release-cycle"}

Koin 遵循約 6 個月的發佈週期，以與 Kotlin 語言及程式庫的更新保持同步。每個版本都會經歷 6 週或更長時間的 Beta 測試期以收集回饋。

版本發佈後，其社群支援階段至少持續 6 個月。在此階段中，團隊會收集回饋並追蹤影響 Koin 的各項更新：Kotlin、Android、Ktor 及其他程式庫。

有關各版本的變更內容，請參閱 [版本發佈與升級指南](/docs/support/releases)。

## 版本號 {id="version-numbers"}

Koin 版本遵循 `Major.Minor.Patch` 格式：

- **Patch**：僅包含修正，以及相依程式庫的次要更新。
- **Minor**：新功能與棄用。
- **Major**：具重大影響的新功能、棄用以及破壞性變更。

發佈前綴詞（alpha、beta、RC）以及 `@KoinExperimentalAPI` 和 `@Deprecated` 的意涵，請參閱 [API 穩定性](/docs/support/api-stability)。

## 社群支援 {id="community-support"}

社群支援適用於所有人，涵蓋於目前的發佈版本分支上：

- **GitHub Issues**：在 [github.com/InsertKoinIO/koin](https://github.com/InsertKoinIO/koin) 回報錯誤與提出功能請求。
- **文件**：本網站 [insert-koin.io](https://insert-koin.io)。
- **Slack**：在 [Kotlin Slack #koin](https://kotlinlang.slack.com/messages/koin/) 進行社群討論。
- **Stack Overflow**：帶有 [koin](https://stackoverflow.com/questions/tagged/koin) 標籤的問題。
- **發佈說明**：[版本發佈](/docs/support/releases) 中的升級指南。

## Kotzilla 企業支援 {id="enterprise-support-by-kotzilla"}

部分公司出於法律、業務或技術考量，無法緊跟 Koin 的發佈週期。它們可能也需要由公司提供擔保的支援服務以及明確的開源授權保障。

Kotzilla 為此提供了兩種企業訂閱方案。兩者的運作方式相同：您將取得私有維護的 Koin 組建，鎖定在您所控制的版本上，且修正會直接套用至該組建，而非僅提供給最新公開發佈的版本。

- **[Koin LTS](#long-term-support-lts)**：持續維護的 Koin 系列，發佈於 `org.koin.*` 下，適用於必須維持固定版本的應用程式。
- **[Koin Embedded LTS](#koin-embedded-lts)**：適用於 SDK 與程式庫供應商。屬於您自訂的 Koin LTS 版本，重新定位至專屬於您的命名空間中。

專業的 Koin 支援是以 LTS 或 Embedded LTS 訂閱方式簽約。在此之上沒有其他獨立的層級。SLA、架構審查與教育訓練等承諾均為該訂閱的 [加值服務](#add-on-services)。

### 長期支援 (LTS) {id="long-term-support-lts"}

LTS 系列是指在社群支援階段結束後，Kotzilla 仍持續維護的 Koin 版本。安全性修正以及客戶回報的錯誤修正會向後移植至該版本並發佈給訂閱者，讓您維持特定版本之餘，不必承受已知缺陷的風險。

支援政策：

- **最短持續時間**：每個 LTS 系列自指定起保證至少支援 18 個月。這是最低底線，而非固定時程。
- **涵蓋範圍**：只要您的訂閱維持有效，即使超出上述期間，您所執行的版本仍可持續獲得支援。18 個月是指定並維護該系列的承諾期限。您的支援範圍取決於合約，而非此處公佈的日期。
- **新系列**：每個主要的 Kotlin 基準版本都會指定一個新的 LTS 系列，並提供從前一系列升級的引導服務，確保支援無縫銜接。在遷移過程中，您絕不會面臨無支援的狀態。

本頁面不會公佈支援終止日期。支援範圍依據您的訂閱以及您執行的版本而定，並載明於您的合約協議中。

#### 現有 LTS 系列 {id="available-lts-lines"}

這兩個系列是並行維護的，而非先後交替。請選擇符合您專案 Kotlin 基準版本的系列。您無需離開 `3.5.6` 即可獲得支援。

| LTS 系列 | Kotlin 基準版本 | 適用對象 |
|----------|-----------------|--------------|
| Koin 3.5.6 LTS | Kotlin 1.x | 無法遷移至 Kotlin 2.x 的專案：舊版工具鏈、長期運行的企業級應用程式、受限的建置環境 |
| Koin 4.2.x LTS | Kotlin 2.x | 採用 Kotlin 2.x 工具鏈，且希望使用固定、維護的 Koin 版本而非追蹤每個發佈版本的專案 |

:::note
LTS 系列是在特定修補版本（Patch level）上指定的，該修補版本即為最低支援要求：`3.5.6` 是 Kotlin 1.x 系列上支援的最低版本。低於此版本的版本不在涵蓋範圍內。若您目前使用的是較舊的修補版本，升級至該 LTS 修補版本是引導流程的一部分。
:::

從 Kotlin 1.x 系列升級至 Kotlin 2.x 系列包含在此方案中。Koin 團隊將提供指引，且在遷移期間您目前的系列仍享有完整支援涵蓋。

#### 包含項目 {id="what-s-included"}

- **維護與相容性**：針對您所執行的 LTS 系列，維護與 Android 及 Kotlin 生態系統的功能相容性。
- **支援服務**：透過 Slack 和專用電子郵件地址，優先聯繫 Koin 團隊。
- **法規遵循**：經過稽核的 Apache 2.0 授權，並由 Kotzilla 為您的合規性承擔責任。
- **透明度**：完整存取程式碼庫，並將社群所確認的修正整合進您的系列中。

### Koin Embedded LTS {id="koin-embedded-lts"}

如果您發行內部使用 Koin 的 SDK 或程式庫，以 `org.koin.*` 發佈會與主應用程式的 Koin 版本發生衝突，也會與同一應用程式中同樣嵌入 Koin 的其他 SDK 衝突。

Koin Embedded LTS 解決了這個問題：為您提供專屬的 Koin LTS 版本，無衝突問題，且至少維護 18 個月。Kotzilla 會將受維護的 [LTS 系列](#available-lts-lines) 重新定位至專屬於您的命名空間，接著為您進行建置、簽署、託管及維護。其涵蓋 `koin-core` 與 `koin-android`。

此外也有免費的自助方式可取得重新定位的 Koin，但有不同的權衡取捨。[Koin for SDK & Libraries](/docs/support/embedded) 同時涵蓋了這兩者：衝突案例、自助式選項以及 [完整的 Embedded LTS 方案](/docs/support/embedded#koin-embedded-lts)。

### 支援層級 {id="support-tiers"}

| | Community | Koin LTS | Koin Embedded LTS |
|---|---|---|---|
| 對象 | 所有人：應用程式、開源專案、採用當前發佈版本的團隊 | 必須維持固定 Koin 版本的公司 | 在其構件中打包發佈 Koin 的 SDK 與程式庫供應商 |
| 交付版本 | 最新公開發佈版本 | 指定的 LTS 系列，由私有維護 | 指定的 LTS 系列，重新定位至您的命名空間 |
| 命名空間 | `org.koin.*` | `org.koin.*` | 專屬命名空間，僅供您使用，例如 `acme.koin.*` |
| 發行管道 | Maven Central | Kotzilla 存儲庫，使用客戶憑據私有存取 | Kotzilla 存儲庫，專供您組織使用的私有存儲庫 |
| 安全性修補 | 僅限當前發佈系列 | 向後移植至您的 LTS 系列 | 向後移植並再次重新定位至您的組建 |
| 客戶問題修正 | 盡力而為，透過公開的 GitHub issues | 修復並交付於您的 LTS 組建 | 修復並交付於您的組建 |
| 與 Koin 團隊的直接管道 | 無，僅限公開 Slack 與 GitHub | 優先存取權限，透過 Slack 與專用電子郵件地址 | 優先存取權限，透過 Slack 與專用電子郵件地址 |
| 升級協助 | 公開遷移指南 | 跨 LTS 系列的指引式升級 | 指引式升級，針對目標版本重新建置重新定位套件 |

### 加值服務 {id="add-on-services"}

這些是以 Koin LTS 或 Koin Embedded LTS 訂閱為基礎進行簽約的服務。它們並非獨立的層級：

- **服務水準協定 (SLA)**：合約中的回應時間承諾。
- **架構審查**：由 Koin 團隊審查您的 Koin 設定與模組結構。
- **培訓與工作坊**：針對團隊的 Koin 實務培訓。

條款依各合約約定。[請聯繫團隊](#contact) 以了解服務範疇。

### 選擇適合的層級 {id="choosing-a-tier"}

- **Community**：您跟隨最新的 Koin 發佈版本，且公開支援已能滿足需求。
- **Koin LTS**：您需要維持在特定版本，且需要針對該版本取得修正。
- **Koin Embedded LTS**：您在自己的構件中轉發 Koin，且無法承受與使用者產生命名空間衝突的風險。

## 聯絡我們 {id="contact"}

- **Koin LTS 與 Koin Embedded LTS**：[Koin Long Term Support](https://kotzilla.io/koin-lts)
- **Kotzilla 平台**：[kotzilla.io](https://kotzilla.io)
- **一般洽詢**：[koin@kotzilla.io](mailto:koin@kotzilla.io)
- **社群 Slack**：[Kotlin Slack #koin](https://kotlinlang.slack.com/messages/koin/)

## 相關資源 {id="related"}

- [版本發佈與升級指南](/docs/support/releases)：各版本的變更內容與升級方式。
- [API 穩定性](/docs/support/api-stability)：實驗性、已棄用及內部 API、發佈類型。
- [Koin for SDK & Libraries](/docs/support/embedded)：在 SDK 內重新定位 Koin。
- [生產環境與工具支援](/docs/tooling)：IDE 外掛程式與生產環境監控。