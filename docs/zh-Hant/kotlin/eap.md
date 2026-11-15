[//]: # (title: 參與 Kotlin 早期體驗預覽)

<tldr>
    <!-- <p>No preview versions are currently available.</p> -->
    <p>最新的 Kotlin EAP 版本：<strong>%kotlinEapVersion%</strong></p>
</tldr>

你可以參與 Kotlin 早期體驗預覽（Early Access Preview，EAP），在最新的 Kotlin 功能正式發佈之前搶先體驗。

在每次語言版本（_2.x.0_）和工具版本（_2.x.20_）發佈之前，我們都會提供早期體驗預覽（EAP）組建，供你在實際專案中進行測試並分享早期回饋。
Kotlin EAP 組建通常包含以下階段：

| EAP 組建 | 描述 |
|-----------|----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| **Beta1** | 引入即將推出的第一批功能、改進和其他重大變更。讓你有機會及早評估新功能性並分享回饋。 |
| **Beta2** | 通常會根據我們收到的回饋新增更多功能和最佳化。此階段功能已齊全（feature-complete），並繼續進行即將發佈版本的預覽，進一步完善先前引入的功能。 |
| **RC**    | 第一個候選發佈版（release candidate）。重點在於穩定 Beta1 和 Beta2 中交付的變更，以及修復測試期間發現的迴歸問題。 |
| **RC2**   | 包含重要修正，以完成最終版本發佈並確認準備就緒。 | 

如果你將發現的任何錯誤回報至我們的問題追蹤器 [YouTrack](https://kotl.in/issue)，我們將不勝感激。
在多數情況下，我們可以在最終發佈前修復它們，因此你無需等待下一個 Kotlin 版本就能看到問題得到解決。

透過參與早期體驗預覽並回報錯誤，你為 Kotlin 做出了貢獻，並幫助我們為[不斷成長的 Kotlin 社群](https://kotlinlang.org/community/)中的每個人打造更好的 Kotlin。

如果你有任何問題或想加入討論，歡迎加入 [Kotlin Slack 中的 #eap 頻道](https://app.slack.com/client/T09229ZC6/C0KLZSCHF)。
在此頻道中，你還可以收到有關新 EAP 組建的通知。

**[為 Kotlin EAP 版本設定你的專案](configure-build-for-eap.md)**

> 參與 EAP 即表示你明確承認 EAP 版本可能不穩定、可能無法按預期運作，且可能包含錯誤。
>
> 我們不保證同一版本的 EAP 與最終版本之間的相容性。
>
{style="note"}

## EAP 如何幫助你更有效率地使用 Kotlin {id="how-the-eap-can-help-you-be-more-productive-with-kotlin"}

* **為穩定版本（Stable release）做好準備**。如果你從事複雜的多模組專案開發，參與 EAP 可以讓你在採用穩定版本時獲得更順暢的體驗。越早更新到穩定版本，就能越早享受其效能改進和新語言特性帶來的好處。

  大型且複雜專案的遷移可能需要一些時間，這不僅是因為其龐大規模，也是因為某些特定使用案例可能尚未被 Kotlin 團隊涵蓋。透過參與 EAP 並持續測試新版本的 Kotlin，你可以針對特定使用案例為我們提供早期回饋。這將有助於我們解決盡可能多的問題，並確保你在正式版本發佈時能夠安全地更新到穩定版本。[了解 Slack 如何從測試 Android、Kotlin 和 Gradle 預先發佈版本中受益](https://slack.engineering/shadow-jobs/)。
* **保持你的程式庫為最新狀態**。如果你是程式庫作者，更新到新的 Kotlin 版本至關重要。使用舊版本可能會阻止你的使用者在其專案中更新 Kotlin。採用 EAP 版本可讓你的程式庫在穩定版本發佈時幾乎立即支援最新的 Kotlin 版本，這不僅能讓使用者更滿意，也能讓你的程式庫更受歡迎。
* **分享經驗**。如果你是 Kotlin 愛好者，並樂於透過創作教學內容為 Kotlin 生態系統做出貢獻，那麼在 Kotlin EAP 中試用新功能，可讓你成為首批與社群分享這些超酷新功能使用經驗的人之一。

## 組建詳細資訊 {id="build-details"}

<!-- _No preview versions are currently available._ -->

<table>
    <tr>
        <th>組建資訊</th>
        <th>組建重點</th>
    </tr>
    <tr>
        <td><strong>2.5.0-RC</strong>
            <p>發佈日期：<strong>2026 年 11 月 11 日</strong></p>
            <p><a href="https://github.com/JetBrains/kotlin/releases/tag/v2.5.0-RC" target="_blank">在 GitHub 上檢視發佈版本</a></p>
        </td>
        <td>
            <p>一個包含重大語言變更與工具更新的語言發佈版本。</p>
            <p>如需更多詳細資訊，請參閱 <a href="https://github.com/JetBrains/kotlin/releases/tag/v2.5.0-RC">changelog</a> 或 <a href="whatsnew-eap.md">Kotlin 2.5.0-RC 新功能</a>。</p>
        </td>
    </tr>
</table>