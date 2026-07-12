[//]: # (title: 参与 Kotlin 抢先体验预览)

<tldr>
    <!-- <p>目前没有可用的预览版本。</p> -->
    <p>最新 Kotlin EAP 版本：<strong>%kotlinEapVersion%</strong></p>
</tldr>

您可以参与 Kotlin 抢先体验预览 (EAP)，在最新的 Kotlin 功能发布之前对其进行试用。

在每个语言 (_2.x.0_) 和工具 (_2.x.20_) 版本发布之前，我们都会发布抢先体验预览 (EAP) 构建版本，供您在真实项目中进行测试并分享早期反馈。
Kotlin EAP 构建通常包括以下阶段：

| EAP 构建版本 | 描述 |
|-----------|-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| **Beta1** | 引入第一批即将推出的功能、改进以及其他重大变更。为您提供评估新功能并分享反馈的早期机会。 |
| **Beta2** | 通常会根据收到的反馈添加更多功能和优化。该版本为功能完备版 (feature-complete)，并继续对即将发布的版本进行预览，进一步完善之前引入的功能。 |
| **RC**    | 第一个发布候选版本 (release candidate)。重点是稳定 Beta1 和 Beta2 中交付的变更，并修复测试期间发现的回归问题。 |
| **RC2**   | 包含重要的修复，以完成发布的最终定稿并确认准备就绪。 | 

如果您能在我们的问题跟踪器 [YouTrack](https://kotl.in/issue) 中报告发现的任何错误，我们将不胜感激。 
在大多数情况下，我们可以在最终版本发布之前修复这些错误，这意味着您无需等到下一个 Kotlin 版本发布即可看到您的问题得到解决。 

通过参与抢先体验预览并报告错误，您将为 Kotlin 做出贡献，并帮助我们为[不断壮大的 Kotlin 社区](https://kotlinlang.org/community/)中的每位成员提供更好的工具。

如果您有任何疑问或想加入讨论，欢迎加入 [Kotlin Slack 中的 #eap 频道](https://app.slack.com/client/T09229ZC6/C0KLZSCHF)。 
在该频道中，您还可以获取有关新 EAP 构建版本的通知。

**[为 Kotlin EAP 版本配置项目](configure-build-for-eap.md)**

> 通过参与 EAP，您明确知晓 EAP 版本可能不稳定，可能无法按预期工作，并且可能包含错误。
>
> 我们不保证同一版本的 EAP 与最终版本之间的兼容性。 
>
{style="note"}

## EAP 如何帮助您提高 Kotlin 编码效率

* **为稳定版本做好准备**。如果您在一个复杂的多模块项目中工作，参与 EAP 可以简化您采用稳定版本时的体验。您越早更新到稳定版本，就能越早利用其性能改进和新语言功能。 

  大型复杂项目的迁移可能需要一段时间，不仅是因为项目规模庞大，还因为某些特定的用例可能尚未被 Kotlin 团队覆盖。通过参与 EAP 和持续测试新版本的 Kotlin，您可以向我们提供有关您特定用例的早期反馈。这将帮助我们解决尽可能多的问题，并确保您在正式版发布时可以安全地更新到稳定版本。[了解 Slack 如何从测试 Android、Kotlin 和 Gradle 的预发布版本中受益](https://slack.engineering/shadow-jobs/)。
* **保持您的库处于最新状态**。如果您是一位库作者，更新到新的 Kotlin 版本至关重要。使用旧版本可能会阻止您的用户在他们的项目中更新 Kotlin。使用 EAP 版本让您能够在稳定版本发布时几乎立即在您的库中支持最新的 Kotlin 版本，这会让您的用户更满意，也能让您的库更受欢迎。
* **分享经验**。如果您是 Kotlin 爱好者，并且乐于通过创建教学内容来为 Kotlin 生态系统做出贡献，那么在 Kotlin EAP 中尝试新功能可以让您成为首批向社区分享新酷功能使用经验的人之一。

## 构建详情

<!--
_目前没有可用的预览版本。_
-->

<table>
    <tr>
        <th>构建信息</th>
        <th>构建亮点</th>
    </tr>
    <tr>
        <td><strong>2.4.20-Beta1</strong>
            <p>发布日期：<strong>2026 年 6 月 24 日</strong></p>
            <p><a href="https://github.com/JetBrains/kotlin/releases/tag/v2.4.20-Beta1" target="_blank">GitHub 上的发布版本</a></p>
        </td>
        <td>
            <p>这是一个工具版本，包含性能改进、错误修复和工具更新。</p>
            <p>有关更多详细信息，请参阅<a href="https://github.com/JetBrains/kotlin/releases/tag/v2.4.20-Beta1">变更日志</a>或<a href="whatsnew-eap.md">Kotlin 2.4.20-Beta1 中的最新变化</a>。</p>
        </td>
    </tr>
    <tr>
        <td><strong>2.4.10-RC2</strong>
            <p>发布日期：<strong>2026 年 7 月 7 日</strong></p>
            <p><a href="https://github.com/JetBrains/kotlin/releases/tag/v2.4.10-RC2" target="_blank">GitHub 上的发布版本</a></p>
        </td>
        <td>
            <p>这是一个错误修复版本，包含针对 Kotlin 2.4.0 的性能改进。</p>
            <p>有关更多详细信息，请参阅<a href="https://github.com/JetBrains/kotlin/releases/tag/v2.4.10-RC2">变更日志</a>。</p>
        </td>
    </tr>
</table>