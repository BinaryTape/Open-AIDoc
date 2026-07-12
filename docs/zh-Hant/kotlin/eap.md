[//]: # (title: 參與 Kotlin 早期體驗預覽 (EAP))

<tldr>
    <!-- <p>目前沒有可用的預覽版本。</p> -->
    <p>最新 Kotlin EAP 版本：<strong>%kotlinEapVersion%</strong></p>
</tldr>

您可以參與 Kotlin 早期體驗預覽 (EAP)，在最新 Kotlin 特性發佈前進行試用。

在每個語言 (_2.x.0_) 與工具 (_2.x.20_) 版本發佈之前，我們會發佈早期體驗預覽 (EAP) 組建，供您在實際專案中進行測試並分享早期回饋。
Kotlin EAP 組建通常包含以下階段：

| EAP 組建 | 描述 |
|-----------|-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| **Beta1** | 引入第一組即將推出的特性、改進與其他重大變更。為您提供評估新功能並分享回饋的早期機會。 |
| **Beta2** | 通常會根據我們收到的回饋增加更多特性與精進。此階段特性完整，並繼續預覽即將發佈的版本，使先前引入的特性更加成熟。 |
| **RC**    | 第一個版本候選 (RC)。專注於穩定 Beta1 與 Beta2 中提供的變更，以及修復測試過程中發現的迴歸。 |
| **RC2**   | 包含用於完成發佈並確認就緒情況的重要修復。 | 

如果您發現錯誤並回報至我們的問題追蹤器 [YouTrack](https://kotl.in/issue)，我們將不勝感激。 
在大多數情況下，我們可以在最終版本發佈前修復這些錯誤，這意指您無需等待下一個 Kotlin 版本即可解決您的問題。 

透過參與早期體驗預覽並回報錯誤，您正在為 Kotlin 做出貢獻，並幫助我們為[日益增長的 Kotlin 社群](https://kotlinlang.org/community/)中的每個人打造更好的 Kotlin。

如果您有任何疑問或想參與討論，歡迎加入 [Kotlin Slack 中的 #eap 頻道](https://app.slack.com/client/T09229ZC6/C0KLZSCHF)。 
在此頻道中，您還可以獲取有關新 EAP 組建的通知。

**[為 Kotlin EAP 版本配置您的專案](configure-build-for-eap.md)**

> 參與 EAP 即表示您明確承認 EAP 版本可能不可靠、可能無法按預期運作，並且可能包含錯誤。
>
> 我們不保證相同發佈版本的 EAP 與最終版本之間的相容性。 
>
{style="note"}

## EAP 如何幫助您更高效地使用 Kotlin

* **為穩定版本做好準備**。如果您在一個複雜的多模組專案中工作，參與 EAP 可以簡化您採用穩定版本時的體驗。您越早更新到穩定版本，就能越早利用其效能改進和新的語言特性。 

  大型且複雜專案的遷移可能需要一些時間，不僅是因為專案規模，還因為某些特定的使用案例可能尚未被 Kotlin 團隊涵蓋。透過參與 EAP 並持續測試新版本的 Kotlin，您可以向我們提供有關特定使用案例的早期回饋。這將幫助我們解決儘可能多的問題，並確保您在穩定版本發佈時可以安全地進行更新。[了解 Slack 如何從測試 Android、Kotlin 與 Gradle 預發佈版本中獲益](https://slack.engineering/shadow-jobs/)。
* **保持您的程式庫處於最新狀態**。如果您是程式庫作者，更新到新的 Kotlin 版本極其重要。使用舊版本可能會阻礙您的使用者在他們的專案中更新 Kotlin。使用 EAP 版本可讓您在穩定版本發佈時，幾乎能立即在程式庫中支援最新的 Kotlin 版本，這會讓您的使用者更滿意，並使您的程式庫更受歡迎。
* **分享經驗**。如果您是 Kotlin 愛好者，並樂於透過建立教學內容為 Kotlin 生態系統做出貢獻，那麼試用 Kotlin EAP 中的新特性可以讓您成為首批與社群分享新功能使用經驗的人之一。

## 組建詳細資訊

<!--
_目前沒有可用的預覽版本。_
-->

<table>
    <tr>
        <th>組建資訊</th>
        <th>組建亮點</th>
    </tr>
    <tr>
        <td><strong>2.4.20-Beta1</strong>
            <p>發佈日期：<strong>2026 年 6 月 24 日</strong></p>
            <p><a href="https://github.com/JetBrains/kotlin/releases/tag/v2.4.20-Beta1" target="_blank">GitHub 上的版本</a></p>
        </td>
        <td>
            <p>一個工具版本，包含效能改進、錯誤修復與工具更新。</p>
            <p>如需更多詳細資訊，請參閱 <a href="https://github.com/JetBrains/kotlin/releases/tag/v2.4.20-Beta1">變更記錄</a> 或 <a href="whatsnew-eap.md">Kotlin 2.4.20-Beta1 的新功能</a>。</p>
        </td>
    </tr>
    <tr>
        <td><strong>2.4.10-RC2</strong>
            <p>發佈日期：<strong>2026 年 7 月 7 日</strong></p>
            <p><a href="https://github.com/JetBrains/kotlin/releases/tag/v2.4.10-RC2" target="_blank">GitHub 上的版本</a></p>
        </td>
        <td>
            <p>一個針對 Kotlin 2.4.0 的錯誤修復版本，包含效能改進。</p>
            <p>如需更多詳細資訊，請參閱 <a href="https://github.com/JetBrains/kotlin/releases/tag/v2.4.10-RC2">變更記錄</a>。</p>
        </td>
    </tr>
</table>