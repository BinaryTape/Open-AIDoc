[//]: # (title: 参与 Kotlin 抢先体验预览)

<tldr>
    <!-- <p>No preview versions are currently available.</p> -->
    <p>最新的 Kotlin EAP 版本：<strong>%kotlinEapVersion%</strong></p>
</tldr>

您可以参与 Kotlin 抢先体验预览（EAP），在最新的 Kotlin 功能正式发布之前抢先体验。

在每个语言版本（_2.x.0_）和工具版本（_2.x.20_）发布之前，我们都会发布抢先体验预览（EAP）构建，以便您在实际项目中进行测试并分享早期反馈。
Kotlin EAP 构建通常包含以下阶段：

| EAP 构建 | 描述 |
|-----------|----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| **Beta1** | 引入即将推出的首批功能、改进以及其他重大变更。让您有机会提前评估新功能并分享反馈。 |
| **Beta2** | 通常会根据收到的反馈增加更多功能和改进。该版本功能完整，并继续对即将发布的版本进行预览，使之前引入的功能更加成熟。 |
| **RC**    | 首个候选发布版本（Release Candidate）。重点在于稳定 Beta1 和 Beta2 中交付的变更，以及修复测试过程中发现的回归问题。 |
| **RC2**   | 包含用于最终确定版本发布并确认就绪状态的重要修复。 | 

如果您将发现的任何错误报告到我们的问题跟踪器 [YouTrack](https://kotl.in/issue)，我们将不胜感激。
在大多数情况下，我们可以在最终版本发布之前修复它们，因此您无需等待下一个 Kotlin 版本即可看到您的问题得到解决。

通过参与抢先体验预览并报告错误，您可以为 Kotlin 做出贡献，并帮助我们让[不断壮大的 Kotlin 社区](https://kotlinlang.org/community/)中的每个人都获得更好的体验。

如果您有任何疑问或想参与讨论，欢迎加入 [Kotlin Slack 中的 #eap 频道](https://app.slack.com/client/T09229ZC6/C0KLZSCHF)。
在此频道中，您还可以收到有关新 EAP 构建的通知。

**[为 Kotlin EAP 版本配置您的项目](configure-build-for-eap.md)**

> 参与 EAP 即表示您明确知悉 EAP 版本可能不稳定、可能无法按预期工作，并且可能包含错误。
>
> 我们不保证 EAP 版本与同一发行的最终版本之间的兼容性。
>
{style="note"}

## EAP 如何帮助您在使用 Kotlin 时提高生产力 {id="how-the-eap-can-help-you-be-more-productive-with-kotlin"}

* **为稳定版本做好准备**。如果您在复杂的单代码仓库或多模块项目中工作，参与 EAP 可以让您在采用正式稳定版本时的体验更加顺畅。您越早更新到稳定版本，就能越早利用其性能改进和新的语言功能。

  庞大且复杂的项目迁移可能需要一些时间，这不仅是因为项目规模，还因为某些特定用例可能尚未被 Kotlin 团队覆盖。通过参与 EAP 并持续测试新版本的 Kotlin，您可以就您的特定用例向我们提供早期反馈。这将帮助我们解决尽可能多的问题，并确保您在正式发布时能够安全地更新到稳定版本。[了解 Slack 如何从测试 Android、Kotlin 和 Gradle 预发布版本中受益](https://slack.engineering/shadow-jobs/)。
* **保持您的库处于最新状态**。如果您是库作者，更新到新的 Kotlin 版本至关重要。使用较旧的版本可能会阻碍您的用户在其项目中更新 Kotlin。使用 EAP 版本能让您在稳定版发布的同时，几乎立即在您的库中支持最新的 Kotlin 版本，这能让您的用户更满意，也能让您的库更受欢迎。
* **分享经验**。如果您是 Kotlin 爱好者，并热衷于通过创作教程内容为 Kotlin 生态系统做出贡献，那么在 Kotlin EAP 中试用新功能可以让您成为首批向社区分享炫酷新功能使用体验的人之一。

## 构建详细信息 {id="build-details"}

<!-- _No preview versions are currently available._ -->

<table>
    <tr>
        <th>构建信息</th>
        <th>构建亮点</th>
    </tr>
    <tr>
        <td><strong>2.5.0-Beta1</strong>
            <p>发布时间：<strong>2026 年 9 月 23 日</strong></p>
            <p><a href="https://github.com/JetBrains/kotlin/releases/tag/v2.5.0-Beta1" target="_blank">GitHub 上的发布版本</a></p>
        </td>
        <td>
            <p>包含语言重大变更和工具更新的语言版本。</p>
            <p>有关更多详细信息，请参阅<a href="https://github.com/JetBrains/kotlin/releases/tag/v2.5.0-Beta1">变更日志</a>或 <a href="whatsnew-eap.md">Kotlin 2.5.0-Beta1 的最新变化</a>。</p>
        </td>
    </tr>
</table>