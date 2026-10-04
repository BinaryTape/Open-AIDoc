[//]: # (title: 參與 Kotlin 早期預覽 (Early Access Preview))

<tldr>
    <!-- <p>目前沒有可用的預覽版本。</p> -->
    <p>最新 Kotlin EAP 版本：<strong>%kotlinEapVersion%</strong></p>
</tldr>

您可以參與 Kotlin 早期預覽（EAP），在最新的 Kotlin 功能正式發布前搶先體驗。

在每個語言版本（_2.x.0_）和工具版本（_2.x.20_）發布之前，我們都會推出早期預覽（EAP）組建，供您在實際專案中進行測試並儘早分享回饋。
Kotlin EAP 組建通常包含以下階段：

| EAP 組建 | 說明 |
|-----------|----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| **Beta1** | 介紹即將推出的第一批新功能、改進和其他重大變更。讓您有機會提前評估新功能性並分享回饋。 |
| **Beta2** | 通常會根據我們收到的回饋新增更多功能和完善改進。此階段功能已齊備，並繼續對即將發布的版本進行預覽，進一步成熟先前引入的功能。 |
| **RC** | 第一個候選發行版（Release Candidate）。重點在於穩定 Beta1 和 Beta2 中交付的變更，並修復測試期間發現的回歸問題。 |
| **RC2** | 包含重要的修正，以完成發行版本的最終定稿並確認就緒狀態。 | 

若您將發現的任何錯誤回報至我們的問題追蹤器 [YouTrack](https://kotl.in/issue)，我們將不勝感激。
在大多數情況下，我們可以在正式發行前修復它們，因此您無需等待下一個 Kotlin 版本發布才能看到問題得到解決。

透過參與早期預覽並回報錯誤，您為 Kotlin 做出了貢獻，並幫助我們為[持續成長的 Kotlin 社群](https://kotlinlang.org/community/)中的每個人打造更好的產品。

如果您有任何疑問或想加入討論，歡迎加入 [Kotlin Slack 中的 #eap 頻道](https://app.slack.com/client/T09229ZC6/C0KLZSCHF)。
在此頻道中，您也可以收到有關新 EAP 組建的通知。

**[為 Kotlin EAP 版本配置您的專案](configure-build-for-eap.md)**

> 參與 EAP 即表示您明確知悉 EAP 版本可能不夠穩定、可能無法按預期運作，且可能包含錯誤。
>
> 我們不保證同一發行版本的 EAP 與最終版本之間的相容性。
>
{style="note"}

## EAP 如何幫助您在使用 Kotlin 時提高生產力 {id="how-the-eap-can-help-you-be-more-productive-with-kotlin"}

* **為穩定版做好準備**。如果您在複雜的多模組專案中工作，參與 EAP 有助於讓您在採用穩定版本時獲得更順暢的體驗。您越早更新至穩定版本，就能越早利用其效能改進與新的語言特性。

  大型且複雜專案的遷移可能需要一些時間，這不僅是因為專案規模龐大，還因為某些特定使用案例可能尚未被 Kotlin 團隊涵蓋。透過參與 EAP 並持續測試 Kotlin 的新版本，您可以就您的特定使用案例向我們提供早期回饋。這將幫助我們盡可能解決更多問題，並確保您可以在發布時安全地更新至穩定版本。[了解 Slack 如何透過測試 Android、Kotlin 和 Gradle 預先發布版本獲益](https://slack.engineering/shadow-jobs/)。
* **保持您的程式庫處於最新狀態**。如果您是程式庫作者，更新至新的 Kotlin 版本極為重要。使用舊版本可能會阻礙您的使用者在其專案中更新 Kotlin。使用 EAP 版本可讓您的程式庫幾乎能在穩定版發布的同時立即支援最新的 Kotlin 版本，這能讓您的使用者更加滿意，也能讓您的程式庫更受歡迎。
* **分享經驗**。如果您是 Kotlin 愛好者，並且熱衷於透過創作教學內容為 Kotlin 生態系統做出貢獻，那麼在 Kotlin EAP 中試用新功能，可讓您成為第一批與社群分享使用這些酷炫新特性經驗的一員。

## 組建詳細資訊 {id="build-details"}

<!-- _No preview versions are currently available._ -->

<table>
    <tr>
        <th>組建資訊</th>
        <th>組建亮點</th>
    </tr>
    <tr>
        <td><strong>2.5.0-Beta1</strong>
            <p>發布日期：<strong>2026 年 9 月 23 日</strong></p>
            <p><a href="https://github.com/JetBrains/kotlin/releases/tag/v2.5.0-Beta1" target="_blank">GitHub 上的發布版本</a></p>
        </td>
        <td>
            <p>包含重大語言變更與工具更新的語言發布版本。</p>
            <p>如需了解更多詳細資訊，請參閱 <a href="https://github.com/JetBrains/kotlin/releases/tag/v2.5.0-Beta1">變更記錄</a> 或 <a href="whatsnew-eap.md">Kotlin 2.5.0-Beta1 新功能</a>。</p>
        </td>
    </tr>
    <tr>
        <td><strong>2.4.21-RC</strong>
            <p>發布日期：<strong>2026 年 9 月 30 日</strong></p>
            <p><a href="https://github.com/JetBrains/kotlin/releases/tag/v2.4.21-RC" target="_blank">GitHub 上的發布版本</a></p>
        </td>
        <td>
            <p>Kotlin 2.4.20 的錯誤修復版本。</p>
            <p>如需了解更多詳細資訊，請參閱 <a href="https://github.com/JetBrains/kotlin/releases/tag/v2.4.21-RC">變更記錄</a>。</p>
        </td>
    </tr>
</table>