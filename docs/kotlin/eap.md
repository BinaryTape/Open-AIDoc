[//]: # (title: 参与 Kotlin 抢先体验预览)

<tldr>
    <!-- <p>No preview versions are currently available.</p> -->
    <p>最新 Kotlin EAP 版本：<strong>%kotlinEapVersion%</strong></p>
</tldr>

您可以参与 Kotlin 抢先体验预览（EAP），在 Kotlin 最新功能正式发布之前抢先体验。

在每个语言版本（_2.x.0_）和工具版本（_2.x.20_）发布之前，我们都会提供抢先体验预览（EAP）构建版本，供您在实际项目中进行测试并分享早期反馈。
Kotlin EAP 构建版本通常包含以下阶段：

| EAP 构建版本 | 说明 |
|---|---|
| **Beta1** | 引入即将推出的首批功能、改进和其他重大变更。为您提供提前评估新功能并分享反馈的机会。 |
| **Beta2** | 通常会根据收到的反馈添加更多功能与优化。已达到功能完备（feature-complete）状态，并继续预览即将发布的版本，进一步完善先前引入的功能。 |
| **RC** | 首个发布候选版本（Release Candidate）。重点在于稳定 Beta1 和 Beta2 中交付的变更，并修复测试期间发现的回归错误。 |
| **RC2** | 包含重要修复，以完成最终版本定稿并确认就绪状态。 | 

如果您发现任何错误，欢迎向我们的问题跟踪器 [YouTrack](https://kotl.in/issue) 报告。
在大多数情况下，我们可以在最终版本发布前解决它们，因此您无需等待下一个 Kotlin 版本即可看到问题得到解决。 

通过参与抢先体验预览并报告错误，您可以为 Kotlin 做出贡献，并帮助我们为[不断壮大的 Kotlin 社区](https://kotlinlang.org/community/)中的每一个人打造更出色的产品。

如果您有任何疑问或想参与讨论，欢迎加入 [Kotlin Slack 中的 #eap 频道](https://app.slack.com/client/T09229ZC6/C0KLZSCHF)。
在该频道中，您还可以收到有关新 EAP 构建版本的通知。

**[为 Kotlin EAP 版本配置您的项目](configure-build-for-eap.md)**

> 参与 EAP 即表示您明确知晓：EAP 版本可能不稳定、可能无法按预期运行，并且可能包含错误。
>
> 我们不保证同一版本的 EAP 与最终正式版本之间的兼容性。
>
{style="note"}

## EAP 如何帮助您在使用 Kotlin 时提高生产力 {id="how-the-eap-can-help-you-be-more-productive-with-kotlin"}

* **为稳定版本做好准备**。如果您从事复杂的多模块项目开发，参与 EAP 可以在您采用正式稳定版本时简化迁移体验。越早更新到稳定版本，就能越早利用其性能改进和全新语言功能。

  大型复杂项目的迁移可能需要一段时间，这不仅是因为其规模庞大，还因为某些特定用例可能尚未被 Kotlin 团队覆盖。通过参与 EAP 并持续测试 Kotlin 的新版本，您可以就特定用例向我们提供早期反馈。这将帮助我们解决尽可能多的问题，并确保您在稳定版发布时能够安全地进行升级。[了解 Slack 如何通过测试 Android、Kotlin 和 Gradle 预发布版本获益](https://slack.engineering/shadow-jobs/)。
* **保持您的库处于最新状态**。如果您是一名库作者，更新到新的 Kotlin 版本至关重要。使用旧版本可能会阻碍用户在项目中更新 Kotlin。使用 EAP 版本可以让您在稳定版本发布时，几乎立即在库中提供对最新 Kotlin 版本的支持，从而提升用户满意度并提高库的受欢迎程度。
* **分享经验**。如果您是一名 Kotlin 爱好者，乐于通过创建教学内容为 Kotlin 生态系统做出贡献，那么在 Kotlin EAP 中尝试新功能可以让您率先向社区分享炫酷新功能的使用体验。

## 构建详情 {id="build-details"}

<!-- _No preview versions are currently available._ -->

<table>
    <tr>
        <th>构建信息</th>
        <th>构建亮点</th>
    </tr>
    <tr>
        <td><strong>2.5.0-Beta1</strong>
            <p>发布日期：<strong>2026 年 9 月 23 日</strong></p>
            <p><a href="https://github.com/JetBrains/kotlin/releases/tag/v2.5.0-Beta1" target="_blank">在 GitHub 上查看发布</a></p>
        </td>
        <td>
            <p>语言发布版本，包含重大的语言变更和工具更新。</p>
            <p>有关更多详情，请参阅<a href="https://github.com/JetBrains/kotlin/releases/tag/v2.5.0-Beta1">变更日志</a>或 <a href="whatsnew-eap.md">Kotlin 2.5.0-Beta1 最新变化</a>。</p>
        </td>
    </tr>
    <tr>
        <td><strong>2.4.21-RC</strong>
            <p>发布日期：<strong>2026 年 9 月 30 日</strong></p>
            <p><a href="https://github.com/JetBrains/kotlin/releases/tag/v2.4.21-RC" target="_blank">在 GitHub 上查看发布</a></p>
        </td>
        <td>
            <p>Kotlin 2.4.20 的错误修复版本。</p>
            <p>有关更多详情，请参阅<a href="https://github.com/JetBrains/kotlin/releases/tag/v2.4.21-RC">变更日志</a>。</p>
        </td>
    </tr>
</table>