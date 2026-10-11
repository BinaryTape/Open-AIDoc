[//]: # (title: Kotlin 发布流程)

<web-summary>了解不同类型的 Kotlin 版本、如何更新到各个版本以及 Kotlin 的发布历史。</web-summary>

<tldr>
    <p>最新 Kotlin 版本：<strong>%kotlinVersion%</strong></p>
    <p>参见<a href="%kotlinLatestWhatsnew%">Kotlin 2.4.20 的最新变化</a>并在<a href="%kotlinLatestUrl%">更新日志</a>中查找问题修复详情。</p>
</tldr>

本页面介绍了 Kotlin 的发布周期以及我们提供的不同发布版本类型。同时还包含有关过往及即将发布的 Kotlin 版本的详细信息，以及如何更新到特定版本的说明。

自 Kotlin 2.0.0 起，我们提供以下发布版本类型：

* _语言版本 (Language releases)_（2._x_._0_）：带来语言层面的重大更改并包含工具更新。每 6 个月发布一次。
* _工具版本 (Tooling releases)_（2._x_._20_）：在各语言版本之间发布，包含工具更新、性能改进和错误修复。在对应的_语言版本_发布后 3 个月内发布。
* _错误修复版本 (Bug fix releases)_（2._x_._yz_）：包含针对_工具版本_的错误修复。这些版本没有固定的发布计划。

> 例如，对于语言版本 2.2.0，仅包含一个工具版本 2.2.20 和一个错误修复版本 2.2.21。
>
{style="tip"}

对于每个语言版本和工具版本，我们还会提供数个预览（_EAP_）版本，供您在正式发布前试用新功能。有关更多信息，请参阅[参与 Kotlin 抢先体验预览](eap.md)。

> 如果您希望收到有关 Kotlin 新版本的通知，请订阅 [Kotlin 时事通讯](https://lp.jetbrains.com/subscribe-to-kotlin-news/)、在 X 上关注 [Kotlin](https://x.com/kotlin)，或在 [Kotlin GitHub 仓库](https://github.com/JetBrains/kotlin)上启用 **Watch | Custom | Releases** 选项。
> 
{style="note"}

## 即将发布的 Kotlin 版本 {id="upcoming-kotlin-releases"}

以下是即将发布的 Kotlin 稳定版本的大致时间表：

* **2.5.0**：计划于 2026 年 12 月发布
* **2.5.20**：计划于 2027 年 3 月发布

## 更新到新的 Kotlin 版本 {id="update-to-a-new-kotlin-version"}

要将项目升级到新版本，请在构建系统中更新 Kotlin 版本。

### Gradle {id="gradle"}

要更新到 Kotlin %kotlinVersion%，请修改 `build.gradle(.kts)` 文件中的 Kotlin Gradle 插件版本：

<tabs group="build-script">
<tab title="Kotlin" group-key="kotlin">

```kotlin
plugins {
    // 将 `<...>` 替换为适合您目标环境的插件名称
    kotlin("<...>") version "%kotlinVersion%"
    // 例如，如果您的目标环境是 JVM：
    // kotlin("jvm") version "%kotlinVersion%"
    // 如果您的目标是 Kotlin Multiplatform：
    // kotlin("multiplatform") version "%kotlinVersion%"
}
```

</tab>
<tab title="Groovy" group-key="groovy">

```groovy
plugins {
    // 将 `<...>` 替换为适合您目标环境的插件名称
    id 'org.jetbrains.kotlin.<...>' version '%kotlinVersion%'
    // 例如，如果您的目标环境是 JVM： 
    // id 'org.jetbrains.kotlin.jvm' version '%kotlinVersion%'
    // 如果您的目标是 Kotlin Multiplatform：
    // id 'org.jetbrains.kotlin.multiplatform' version '%kotlinVersion%'
}
```

</tab>
</tabs>

如果您的项目是使用较早的 Kotlin 版本创建的，请检查是否还需要[更新任意 kotlinx 库的版本](gradle-configure-project.md#set-a-dependency-on-a-kotlinx-library)。

如果要迁移到新的语言版本，Kotlin 插件的迁移工具将在此过程中为您提供帮助。

> 要详细了解如何在项目中使用 Gradle，请参阅[配置 Gradle 项目](gradle-configure-project.md)。
> 
{style="tip"}

### Maven {id="maven"}

要更新到 Kotlin %kotlinVersion%，请修改 `pom.xml` 文件中的版本：

```xml
<properties>
    <kotlin.version>%kotlinVersion%</kotlin.version>
</properties>
```

或者，也可以修改 `pom.xml` 文件中 `kotlin-maven-plugin` 的版本：

```xml
<plugins>
    <plugin>
        <groupId>org.jetbrains.kotlin</groupId>
        <artifactId>kotlin-maven-plugin</artifactId>
        <version>%kotlinVersion%</version>
    </plugin>
</plugins>
```

如果您的项目是使用较早的 Kotlin 版本创建的，请检查是否还需要[更新任意 kotlinx 库的版本](maven-set-dependencies.md#dependency-on-a-kotlinx-library)。

> 要详细了解如何在项目中使用 Maven，请参阅 [Maven](maven.md)。
>
{style="tip"}

## IDE 支持 {id="ide-support"}

Kotlin 在 [IntelliJ IDEA](https://www.jetbrains.com/idea/download/) 和 [Android Studio](https://developer.android.com/kotlin/get-started) 中均提供完备的开箱即用支持。

## 标准库安全支持 {id="standard-library-security-support"}

自 Kotlin 2.4.0 起，针对 JVM 的 Kotlin 标准库的每个版本系列都拥有 18 个月的支持窗口期。语言版本（2._x_._0_）以及随后的工具版本（2._x_._20_）属于同一个版本系列（2._x_）。

如果我们发现影响针对 JVM 的 Kotlin 标准库的安全漏洞，我们将同时提供以下内容：

* 基于该版本系列中最新的 Kotlin 版本发布的错误修复版本，其中包含安全修复。
* 针对处于活跃支持窗口期内的每个版本系列的错误修复版本。

例如，如果我们发现安全漏洞，而最新的 Kotlin 版本是 Kotlin 2.4.20，我们只会为 Kotlin 2.4.20 发布错误修复版本，而不会为 Kotlin 2.4.0 发布错误修复版本。

下表列出了所有 Kotlin 版本及其支持窗口期：

<table>
    <tr>
        <th>Kotlin 版本系列</th>
        <th>发布日期</th>
        <th>支持终止时间</th>
        <th>最新版本</th>
    </tr>
    <tr>
        <td><strong>2.4</strong>
        </td>
        <td>
            <p>2026 年 6 月 3 日</p>
        </td>
        <td>
            <p>2027 年 12 月 3 日</p>
        </td>
        <td>
            <p>2.4.21</p>
        </td>
    </tr>
</table>

> 我们非常重视您发现的任何安全问题。要报告在 Kotlin 中发现的问题，请直接在我们的话题/问题跟踪器（[issue tracker](https://youtrack.jetbrains.com/newIssue?project=KT&c=Type%20Security%20Problem)）中发布消息，或向我们发送[电子邮件](mailto:security@jetbrains.org)。
> 
{style="tip"}

## 发布历史 {id="release-history"}

下表列出了以往 Kotlin 版本的详细信息：

> 您也可以尝试 [Kotlin 的抢先体验预览（EAP）版本](eap.md#build-details)。
> 
{style="tip"}

<table>
    <tr>
        <th>构建信息</th>
        <th>构建亮点</th>
    </tr>
    <tr>
        <td><strong>2.4.21</strong>
            <p>发布时间：<strong>2026 年 10 月 8 日</strong></p>
            <p><a href="https://github.com/JetBrains/kotlin/releases/tag/v2.4.21" target="_blank">在 GitHub 上查看发布</a></p>
        </td>
        <td>
            <p>针对 Kotlin 2.4.21 的错误修复版本。</p>
            <p>有关更多详细信息，请参阅<a href="https://github.com/JetBrains/kotlin/releases/tag/v2.4.21">更新日志</a>。</p>
        </td>
    </tr>
    <tr>
        <td><strong>2.4.20</strong>
            <p>发布时间：<strong>2026 年 9 月 7 日</strong></p>
            <p><a href="https://github.com/JetBrains/kotlin/releases/tag/v2.4.20" target="_blank">在 GitHub 上查看发布</a></p>
        </td>
        <td>
            <p>包含实验性与稳定新功能、性能改进、错误修复以及工具更新的工具版本。</p>
            <p>有关更多详细信息，请参阅<a href="https://github.com/JetBrains/kotlin/releases/tag/v2.4.20">更新日志</a>。</p>
        </td>
    </tr>
    <tr>
        <td><strong>2.4.10</strong>
            <p>发布时间：<strong>2026 年 7 月 14 日</strong></p>
            <p><a href="https://github.com/JetBrains/kotlin/releases/tag/v2.4.10" target="_blank">在 GitHub 上查看发布</a></p>
        </td>
        <td>
            <p>针对 Kotlin 2.4.0 的错误修复版本。</p>
            <p>有关更多详细信息，请参阅<a href="https://github.com/JetBrains/kotlin/releases/tag/v2.4.10">更新日志</a>。</p>
        </td>
    </tr>
    <tr>
        <td><strong>2.4.0</strong>
            <p>发布时间：<strong>2026 年 6 月 3 日</strong></p>
            <p><a href="https://github.com/JetBrains/kotlin/releases/tag/v2.4.0" target="_blank">在 GitHub 上查看发布</a></p>
        </td>
        <td>
            <p>包含全新及稳定的语言功能、工具更新、针对不同平台的性能改进以及重要修复的语言版本。</p>
            <p>要详细了解 Kotlin 2.4.0，请参阅 <a href="whatsnew24.md" target="_blank">Kotlin 2.4.0 的最新变化</a>。</p>
        </td>
    </tr>
    <tr>
        <td><strong>2.3.21</strong>
            <p>发布时间：<strong>2026 年 4 月 23 日</strong></p>
            <p><a href="https://github.com/JetBrains/kotlin/releases/tag/v2.3.21" target="_blank">在 GitHub 上查看发布</a></p>
        </td>
        <td>
            <p>针对 Kotlin 2.3.20 的错误修复版本。</p>
            <p>有关更多详细信息，请参阅<a href="https://github.com/JetBrains/kotlin/releases/tag/v2.3.21">更新日志</a>。</p>
        </td>
    </tr>
    <tr>
        <td><strong>2.3.20</strong>
            <p>发布时间：<strong>2026 年 3 月 16 日</strong></p>
            <p><a href="https://github.com/JetBrains/kotlin/releases/tag/v2.3.20" target="_blank">在 GitHub 上查看发布</a></p>
        </td>
        <td>
            <p>包含性能改进、错误修复和工具更新的工具版本。</p>
            <p>有关更多详细信息，请参阅<a href="https://github.com/JetBrains/kotlin/releases/tag/v2.3.20">更新日志</a>。</p>
        </td>
    </tr>
    <tr>
        <td><strong>2.3.10</strong>
            <p>发布时间：<strong>2026 年 2 月 5 日</strong></p>
            <p><a href="https://github.com/JetBrains/kotlin/releases/tag/v2.3.10" target="_blank">在 GitHub 上查看发布</a></p>
        </td>
        <td>
            <p>针对 Kotlin 2.3.0 的错误修复版本，包含性能改进以及针对极少见的 <a href="https://youtrack.jetbrains.com/issue/KT-83984"><code>kotlinx.serialization</code> 竞态条件</a>的重要修复。</p>
            <p>有关更多详细信息，请参阅<a href="https://github.com/JetBrains/kotlin/releases/tag/v2.3.10">更新日志</a>。</p>
        </td>
    </tr>
    <tr>
        <td><strong>2.3.0</strong>
            <p>发布时间：<strong>2025 年 12 月 16 日</strong></p>
            <p><a href="https://github.com/JetBrains/kotlin/releases/tag/v2.3.0" target="_blank">在 GitHub 上查看发布</a></p>
        </td>
        <td>
            <p>包含全新及稳定的语言功能、工具更新、针对不同平台的性能改进以及重要修复的语言版本。</p>
            <p>要详细了解 Kotlin 2.3.0，请参阅 <a href="whatsnew23.md" target="_blank">Kotlin 2.3.0 的最新变化</a>。</p>
        </td>
    </tr> 
    <tr>
        <td><strong>2.2.21</strong>
            <p>发布时间：<strong>2025 年 10 月 23 日</strong></p>
            <p><a href="https://github.com/JetBrains/kotlin/releases/tag/v2.2.21" target="_blank">在 GitHub 上查看发布</a></p>
        </td>
        <td>
            <p>包含对 Xcode 26 的支持以及其他改进和错误修复的错误修复版本。</p>
            <p>有关更多详细信息，请参阅<a href="https://github.com/JetBrains/kotlin/releases/tag/v2.2.21">更新日志</a>。</p>
    </td>
    </tr>
    <tr>
        <td><strong>2.2.20</strong>
            <p>发布时间：<strong>2025 年 9 月 10 日</strong></p>
            <p><a href="https://github.com/JetBrains/kotlin/releases/tag/v2.2.20" target="_blank">在 GitHub 上查看发布</a></p>
        </td>
        <td>
            <p>针对 Kotlin 2.2.0 的工具版本，包含针对 Web 开发的重要更改及其他改进。</p>
            <p>要详细了解 Kotlin 2.2.20，请参阅 <a href="whatsnew2220.md" target="_blank">Kotlin 2.2.20 的最新变化</a>。</p>
        </td>
    </tr>
    <tr>
        <td><strong>2.2.10</strong>
            <p>发布时间：<strong>2025 年 8 月 14 日</strong></p>
            <p><a href="https://github.com/JetBrains/kotlin/releases/tag/v2.2.10" target="_blank">在 GitHub 上查看发布</a></p>
        </td>
        <td>
            <p>针对 Kotlin 2.2.0 的错误修复版本。</p>
            <p>有关更多详细信息，请参阅<a href="https://github.com/JetBrains/kotlin/releases/tag/v2.2.10">更新日志</a>。</p>
        </td>
    </tr>
    <tr>
        <td><strong>2.2.0</strong>
            <p>发布时间：<strong>2025 年 6 月 23 日</strong></p>
            <p><a href="https://github.com/JetBrains/kotlin/releases/tag/v2.2.0" target="_blank">在 GitHub 上查看发布</a></p>
        </td>
        <td>
            <p>包含全新及稳定的语言功能、工具更新、针对不同平台的性能改进以及重要修复的语言版本。</p>
            <p>要详细了解 Kotlin 2.2.0，请参阅 <a href="whatsnew22.md" target="_blank">Kotlin 2.2.0 的最新变化</a>。</p>
        </td>
    </tr> 
    <tr>
        <td><strong>2.1.21</strong>
            <p>发布时间：<strong>2025 年 5 月 13 日</strong></p>
            <p><a href="https://github.com/JetBrains/kotlin/releases/tag/v2.1.21" target="_blank">在 GitHub 上查看发布</a></p>
        </td>
        <td>
            <p>针对 Kotlin 2.1.20 的错误修复版本。</p>
            <p>有关更多详细信息，请参阅<a href="https://github.com/JetBrains/kotlin/releases/tag/v2.1.21">更新日志</a>。</p>
        </td>
    </tr> 
   <tr>
        <td><strong>2.1.20</strong>
            <p>发布时间：<strong>2025 年 3 月 20 日</strong></p>
            <p><a href="https://github.com/JetBrains/kotlin/releases/tag/v2.1.20" target="_blank">在 GitHub 上查看发布</a></p>
        </td>
        <td>
           <p>针对 Kotlin 2.1.0 的工具版本，包含全新的实验性功能、性能改进和错误修复。</p>
            <p>要详细了解 Kotlin 2.1.20，请参阅 <a href="whatsnew2120.md" target="_blank">Kotlin 2.1.20 的最新变化</a>。</p>
        </td>
    </tr>
    <tr>
        <td><strong>2.1.10</strong>
            <p>发布时间：<strong>2025 年 1 月 27 日</strong></p>
            <p><a href="https://github.com/JetBrains/kotlin/releases/tag/v2.1.10" target="_blank">在 GitHub 上查看发布</a></p>
        </td>
        <td>
            <p>针对 Kotlin 2.1.0 的错误修复版本。</p>
            <p>有关更多详细信息，请参阅<a href="https://github.com/JetBrains/kotlin/releases/tag/v2.1.10">更新日志</a>。</p>
        </td>
    </tr>
    <tr>
        <td><strong>2.1.0</strong>
            <p>发布时间：<strong>2024 年 11 月 27 日</strong></p>
            <p><a href="https://github.com/JetBrains/kotlin/releases/tag/v2.1.0" target="_blank">在 GitHub 上查看发布</a></p>
        </td>
        <td>
            <p>引入了新语言功能的语言版本。</p>
            <p>要详细了解 Kotlin 2.1.0，请参阅 <a href="whatsnew21.md" target="_blank">Kotlin 2.1.0 的最新变化</a>。</p>
        </td>
    </tr>
    <tr>
        <td><strong>2.0.21</strong>
            <p>发布时间：<strong>2024 年 10 月 10 日</strong></p>
            <p><a href="https://github.com/JetBrains/kotlin/releases/tag/v2.0.21" target="_blank">在 GitHub 上查看发布</a></p>
        </td>
        <td>
            <p>针对 Kotlin 2.0.20 的错误修复版本。</p>
            <p>有关更多详细信息，请参阅<a href="https://github.com/JetBrains/kotlin/releases/tag/v2.0.21">更新日志</a>。</p>
        </td>
    </tr>
    <tr>
        <td><strong>2.0.20</strong>
            <p>发布时间：<strong>2024 年 8 月 22 日</strong></p>
            <p><a href="https://github.com/JetBrains/kotlin/releases/tag/v2.0.20" target="_blank">在 GitHub 上查看发布</a></p>
        </td>
        <td>
           <p>针对 Kotlin 2.0.0 的工具版本，包含性能改进和错误修复。功能还包括
              Kotlin/Native 垃圾回收器中的并发标记、Kotlin 通用标准库中的 UUID 支持、
              Compose 编译器更新以及对最高达 Gradle 8.8 的支持。
            </p>
            <p>要详细了解 Kotlin 2.0.20，请参阅 <a href="whatsnew2020.md" target="_blank">Kotlin 2.0.20 的最新变化</a>。</p>
        </td>
    </tr>
    <tr>
        <td><strong>2.0.10</strong>
            <p>发布时间：<strong>2024 年 8 月 6 日</strong></p>
            <p><a href="https://github.com/JetBrains/kotlin/releases/tag/v2.0.10" target="_blank">在 GitHub 上查看发布</a></p>
        </td>
        <td>
            <p>针对 Kotlin 2.0.0 的错误修复版本。</p>
            <p>要详细了解 Kotlin 2.0.0，请参阅 <a href="whatsnew20.md" target="_blank">Kotlin 2.0.0 的最新变化</a>。</p>
        </td>
    </tr>
    <tr>
        <td><strong>2.0.0</strong>
            <p>发布时间：<strong>2024 年 5 月 21 日</strong></p>
            <p><a href="https://github.com/JetBrains/kotlin/releases/tag/v2.0.0" target="_blank">在 GitHub 上查看发布</a></p>
        </td>
        <td>
            <p>附带稳定版 Kotlin K2 编译器的语言版本。</p>
            <p>要详细了解 Kotlin 2.0.0，请参阅 <a href="whatsnew20.md" target="_blank">Kotlin 2.0.0 的最新变化</a>。</p>
        </td>
    </tr>
    <tr>
        <td><strong>1.9.25</strong>
            <p>发布时间：<strong>2024 年 7 月 19 日</strong></p>
            <p><a href="https://github.com/JetBrains/kotlin/releases/tag/v2.9.25" target="_blank">在 GitHub 上查看发布</a></p>
        </td>
        <td>
            <p>针对 Kotlin 1.9.20、1.9.21、1.9.22、1.9.23 和 1.9.24 的错误修复版本。</p>
            <p>要详细了解 Kotlin 1.9.20，请参阅 <a href="whatsnew1920.md" target="_blank">Kotlin 1.9.20 的最新变化</a>。</p>
        </td>
    </tr>
    <tr>
        <td><strong>1.9.24</strong>
            <p>发布时间：<strong>2024 年 5 月 7 日</strong></p>
            <p><a href="https://github.com/JetBrains/kotlin/releases/tag/v1.9.24" target="_blank">在 GitHub 上查看发布</a></p>
        </td>
        <td>
            <p>针对 Kotlin 1.9.20、1.9.21、1.9.22 和 1.9.23 的错误修复版本。</p>
            <p>要详细了解 Kotlin 1.9.20，请参阅 <a href="whatsnew1920.md" target="_blank">Kotlin 1.9.20 的最新变化</a>。</p>
        </td>
    </tr>
    <tr>
        <td><strong>1.9.23</strong>
            <p>发布时间：<strong>2024 年 3 月 7 日</strong></p>
            <p><a href="https://github.com/JetBrains/kotlin/releases/tag/v1.9.23" target="_blank">在 GitHub 上查看发布</a></p>
        </td>
        <td>
            <p>针对 Kotlin 1.9.20、1.9.21 和 1.9.22 的错误修复版本。</p>
            <p>要详细了解 Kotlin 1.9.20，请参阅 <a href="whatsnew1920.md" target="_blank">Kotlin 1.9.20 的最新变化</a>。</p>
        </td>
    </tr>
    <tr>
        <td><strong>1.9.22</strong>
            <p>发布时间：<strong>2023 年 12 月 21 日</strong></p>
            <p><a href="https://github.com/JetBrains/kotlin/releases/tag/v1.9.22" target="_blank">在 GitHub 上查看发布</a></p>
        </td>
        <td>
            <p>针对 Kotlin 1.9.20 和 1.9.21 的错误修复版本。</p>
            <p>要详细了解 Kotlin 1.9.20，请参阅 <a href="whatsnew1920.md" target="_blank">Kotlin 1.9.20 的最新变化</a>。</p>
        </td>
    </tr>
    <tr>
        <td><strong>1.9.21</strong>
            <p>发布时间：<strong>2023 年 11 月 23 日</strong></p>
            <p><a href="https://github.com/JetBrains/kotlin/releases/tag/v1.9.21" target="_blank">在 GitHub 上查看发布</a></p>
        </td>
        <td>
            <p>针对 Kotlin 1.9.20 的错误修复版本。</p>
            <p>要详细了解 Kotlin 1.9.20，请参阅 <a href="whatsnew1920.md" target="_blank">Kotlin 1.9.20 的最新变化</a>。</p>
        </td>
    </tr>
    <tr>
        <td><strong>1.9.20</strong>
            <p>发布时间：<strong>2023 年 11 月 1 日</strong></p>
            <p><a href="https://github.com/JetBrains/kotlin/releases/tag/v1.9.20" target="_blank">在 GitHub 上查看发布</a></p>
        </td>
        <td>
            <p>功能版本，带来处于 Beta 阶段的 Kotlin K2 编译器以及进入稳定版的 Kotlin Multiplatform。</p>
            <p>了解更多：</p>
            <list>
                <li><a href="whatsnew1920.md" target="_blank">Kotlin 1.9.20 的最新变化</a></li>
            </list>
        </td>
    </tr>
    <tr>
        <td><strong>1.9.10</strong>
            <p>发布时间：<strong>2023 年 8 月 23 日</strong></p>
            <p><a href="https://github.com/JetBrains/kotlin/releases/tag/v1.9.10" target="_blank">在 GitHub 上查看发布</a></p>
        </td>
        <td>
            <p>针对 Kotlin 1.9.0 的错误修复版本。</p>
            <p>要详细了解 Kotlin 1.9.0，请参阅 <a href="whatsnew19.md" target="_blank">Kotlin 1.9.0 的最新变化</a>。</p>
            <note>对于 Android Studio Giraffe 和 Hedgehog，Kotlin 插件 1.9.10 将随后续的 Android Studio 更新一同提供。</note>
        </td>
    </tr>
    <tr>
        <td><strong>1.9.0</strong>
            <p>发布时间：<strong>2023 年 7 月 6 日</strong></p>
            <p><a href="https://github.com/JetBrains/kotlin/releases/tag/v1.9.0" target="_blank">在 GitHub 上查看发布</a></p>
        </td>
        <td>
            <p>功能版本，包含 Kotlin K2 编译器更新、新的枚举类 values 函数、
                针对半开区间的新运算符、Kotlin Multiplatform 中 Gradle 配置缓存的预览、
                对 Kotlin Multiplatform 中 Android 目标支持的调整，以及 Kotlin/Native 中自定义内存分配器的预览。
            </p>
            <p>了解更多：</p>
            <list>
                <li><a href="whatsnew19.md" target="_blank">Kotlin 1.9.0 的最新变化</a></li>
                <li><a href="https://www.youtube.com/embed/fvwTZc-dxsM" target="_blank">Kotlin 最新变化 YouTube 视频</a></li>
            </list>
        </td>
    </tr>
    <tr>
        <td><strong>1.8.22</strong>
            <p>发布时间：<strong>2023 年 6 月 8 日</strong></p>
            <p><a href="https://github.com/JetBrains/kotlin/releases/tag/v1.8.22" target="_blank">在 GitHub 上查看发布</a></p>
        </td>
        <td>
            <p>针对 Kotlin 1.8.20 的错误修复版本。</p>
            <p>要详细了解 Kotlin 1.8.20，请参阅 <a href="whatsnew1820.md" target="_blank">Kotlin 1.8.20 的最新变化</a>。</p>
        </td>
    </tr>
    <tr>
        <td><strong>1.8.21</strong>
            <p>发布时间：<strong>2023 年 4 月 25 日</strong></p>
            <p><a href="https://github.com/JetBrains/kotlin/releases/tag/v1.8.21" target="_blank">在 GitHub 上查看发布</a></p>
        </td>
        <td>
            <p>针对 Kotlin 1.8.20 的错误修复版本。</p>
            <p>要详细了解 Kotlin 1.8.20，请参阅 <a href="whatsnew1820.md" target="_blank">Kotlin 1.8.20 的最新变化</a>。</p>
            <note>对于 Android Studio Flamingo 和 Giraffe，Kotlin 插件 1.8.21 将随后续的 Android Studio 更新一同提供。</note>
        </td>
    </tr>
    <tr>
        <td><strong>1.8.20</strong>
            <p>发布时间：<strong>2023 年 4 月 3 日</strong></p>
            <p><a href="https://github.com/JetBrains/kotlin/releases/tag/v1.8.20" target="_blank">在 GitHub 上查看发布</a></p>
        </td>
        <td>
            <p>功能版本，包含 Kotlin K2 编译器更新、AutoCloseable 接口以及 stdlib 中的 Base64 编码、
                默认启用的新 JVM 增量编译、全新的 Kotlin/Wasm 编译器后端。
            </p>
            <p>了解更多：</p>
            <list>
                <li><a href="whatsnew1820.md" target="_blank">Kotlin 1.8.20 的最新变化</a></li>
                <li><a href="https://youtu.be/R1JpkpPzyBU" target="_blank">Kotlin 最新变化 YouTube 视频</a></li>
            </list>
        </td>
    </tr>
    <tr>
        <td><strong>1.8.10</strong>
            <p>发布时间：<strong>2023 年 2 月 2 日</strong></p>
            <p><a href="https://github.com/JetBrains/kotlin/releases/tag/v1.8.10" target="_blank">在 GitHub 上查看发布</a></p>
        </td>
        <td>
            <p>针对 Kotlin 1.8.0 的错误修复版本。</p>
            <p>详细了解 <a href="https://github.com/JetBrains/kotlin/releases/tag/v1.8.0" target="_blank">Kotlin 1.8.0</a>。</p>
            <note>对于 Android Studio Electric Eel 和 Flamingo，Kotlin 插件 1.8.10 将随后续的 Android Studio 更新一同提供。</note>
        </td>
    </tr>
    <tr>
        <td><strong>1.8.0</strong>
            <p>发布时间：<strong>2022 年 12 月 28 日</strong></p>
            <p><a href="https://github.com/JetBrains/kotlin/releases/tag/v1.8.0" target="_blank">在 GitHub 上查看发布</a></p>
        </td>
        <td>
            <p>功能版本，带来提升的 kotlin-reflect 性能、适用于 JVM 的递归复制或删除目录内容的全新实验性函数，以及改进的 Objective-C/Swift 互操作性。</p>
            <p>了解更多：</p>
            <list>
                <li><a href="whatsnew18.md" target="_blank">Kotlin 1.8.0 的最新变化</a></li>
                <li><a href="compatibility-guide-18.md" target="_blank">Kotlin 1.8.0 兼容性指南</a></li>
            </list>
        </td>
    </tr>
    <tr>
        <td><strong>1.7.21</strong>
            <p>发布时间：<strong>2022 年 11 月 9 日</strong></p>
            <p><a href="https://github.com/JetBrains/kotlin/releases/tag/v1.7.21" target="_blank">在 GitHub 上查看发布</a></p>
        </td>
        <td>
            <p>针对 Kotlin 1.7.20 的错误修复版本。</p>
            <p>要详细了解 Kotlin 1.7.20，请参阅 <a href="whatsnew1720.md" target="_blank">Kotlin 1.7.20 的最新变化</a>。</p>
            <note>对于 Android Studio Dolphin、Electric Eel 和 Flamingo，Kotlin 插件 1.7.21 将随后续的 Android Studio 更新一同提供。</note>
        </td>
    </tr>
    <tr>
        <td><strong>1.7.20</strong>
            <p>发布时间：<strong>2022 年 9 月 29 日</strong></p>
            <p><a href="https://github.com/JetBrains/kotlin/releases/tag/v1.7.20" target="_blank">在 GitHub 上查看发布</a></p>
        </td>
        <td>
            <p>增量版本，包含新语言功能、Kotlin K2 编译器对数个编译器插件的支持、
                默认启用的新 Kotlin/Native 内存管理器，以及对 Gradle 7.1 的支持。
            </p>
            <p>了解更多：</p>
            <list>
                <li><a href="whatsnew1720.md" target="_blank">Kotlin 1.7.20 的最新变化</a></li>
                <li><a href="https://youtu.be/OG9npowJgE8" target="_blank">Kotlin 最新变化 YouTube 视频</a></li>
                <li><a href="compatibility-guide-1720.md" target="_blank">Kotlin 1.7.20 兼容性指南</a></li>
            </list>
            <p>详细了解 <a href="https://github.com/JetBrains/kotlin/releases/tag/v1.7.20" target="_blank">Kotlin 1.7.20</a>。</p>
        </td>
    </tr>
    <tr>
        <td><strong>1.7.10</strong>
            <p>发布时间：<strong>2022 年 7 月 7 日</strong></p>
            <p><a href="https://github.com/JetBrains/kotlin/releases/tag/v1.7.10" target="_blank">在 GitHub 上查看发布</a></p>
        </td>
        <td>
            <p>针对 Kotlin 1.7.0 的错误修复版本。</p>
            <p>详细了解 <a href="https://github.com/JetBrains/kotlin/releases/tag/v1.7.0" target="_blank">Kotlin 1.7.0</a>。</p>
            <note>对于 Android Studio Dolphin (213) 和 Android Studio Electric Eel (221)，Kotlin 插件 1.7.10 将随后续的 Android Studio 更新一同提供。</note>
        </td>
    </tr>
    <tr>
        <td><strong>1.7.0</strong>
            <p>发布时间：<strong>2022 年 6 月 9 日</strong></p>
            <p><a href="https://github.com/JetBrains/kotlin/releases/tag/v1.7.0" target="_blank">在 GitHub 上查看发布</a></p>
        </td>
        <td>
            <p>功能版本，带来处于 Alpha 阶段的针对 JVM 的 Kotlin K2 编译器、稳定化的语言功能、性能改进，以及诸如稳定实验性 API 等渐进式变更。</p>
            <p>了解更多：</p>
            <list>
                <li><a href="whatsnew17.md" target="_blank">Kotlin 1.7.0 的最新变化</a></li>
                <li><a href="https://youtu.be/54WEfLKtCGk" target="_blank">Kotlin 最新变化 YouTube 视频</a></li>
                <li><a href="compatibility-guide-17.md" target="_blank">Kotlin 1.7.0 兼容性指南</a></li>
            </list>
        </td>
    </tr>
    <tr>
        <td><strong>1.6.21</strong>
            <p>发布时间：<strong>2022 年 4 月 20 日</strong></p>
            <p><a href="https://github.com/JetBrains/kotlin/releases/tag/v1.6.21" target="_blank">在 GitHub 上查看发布</a></p>
        </td>
        <td>
            <p>针对 Kotlin 1.6.20 的错误修复版本。</p>
            <p>详细了解 <a href="whatsnew1620.md" target="_blank">Kotlin 1.6.20</a>。</p>
        </td>
    </tr>
    <tr>
        <td><strong>1.6.20</strong>
            <p>发布时间：<strong>2022 年 4 月 4 日</strong></p>
            <p><a href="https://github.com/JetBrains/kotlin/releases/tag/v1.6.20" target="_blank">在 GitHub 上查看发布</a></p>
        </td>
        <td>
            <p>增量版本，包含多项改进，例如：</p>
            <list>
                <li>上下文接收者原型</li>
                <li>对函数式接口构造函数的可调用引用</li>
                <li>Kotlin/Native：新内存管理器的性能改进</li>
                <li>多平台：默认采用层次化项目结构</li>
                <li>Kotlin/JS：IR 编译器改进</li>
                <li>Gradle：编译器执行策略</li>
            </list>
            <p>详细了解 <a href="whatsnew1620.md" target="_blank">Kotlin 1.6.20</a>。</p>
        </td>
    </tr>
    <tr>
        <td><strong>1.6.10</strong>
            <p>发布时间：<strong>2021 年 12 月 14 日</strong></p>
            <p><a href="https://github.com/JetBrains/kotlin/releases/tag/v1.6.10" target="_blank">在 GitHub 上查看发布</a></p>
        </td>
        <td>
            <p>针对 Kotlin 1.6.0 的错误修复版本。</p>
            <p>详细了解 <a href="https://github.com/JetBrains/kotlin/releases/tag/v1.6.0" target="_blank">Kotlin 1.6.0</a>。</p>
        </td>
    </tr>
    <tr>
        <td><strong>1.6.0</strong>
            <p>发布时间：<strong>2021 年 11 月 16 日</strong></p>
            <p><a href="https://github.com/JetBrains/kotlin/releases/tag/v1.6.0" target="_blank">在 GitHub 上查看发布</a></p>
        </td>
        <td>
            <p>功能版本，带来新语言功能、性能改进，以及诸如稳定实验性 API 等渐进式变更。</p>
            <p>了解更多：</p>
            <list>
                <li><a href="https://blog.jetbrains.com/kotlin/2021/11/kotlin-1-6-0-is-released/" target="_blank">发布博客文章</a></li>
                <li><a href="whatsnew16.md" target="_blank">Kotlin 1.6.0 的最新变化</a></li>
                <li><a href="compatibility-guide-16.md" target="_blank">兼容性指南</a></li>
            </list>
        </td>
    </tr>
    <tr>
        <td><strong>1.5.32</strong>
            <p>发布时间：<strong>2021 年 11 月 29 日</strong></p>
            <p><a href="https://github.com/JetBrains/kotlin/releases/tag/v1.5.32" target="_blank">在 GitHub 上查看发布</a></p>
        </td>
        <td>
            <p>针对 Kotlin 1.5.31 的错误修复版本。</p>
            <p>详细了解 <a href="whatsnew1530.md" target="_blank">Kotlin 1.5.30</a>。</p>
        </td>
    </tr>
    <tr>
        <td><strong>1.5.31</strong>
            <p>发布时间：<strong>2021 年 9 月 20 日</strong></p>
            <p><a href="https://github.com/JetBrains/kotlin/releases/tag/v1.5.31" target="_blank">在 GitHub 上查看发布</a></p>
        </td>
        <td>
            <p>针对 Kotlin 1.5.30 的错误修复版本。</p>
            <p>详细了解 <a href="whatsnew1530.md" target="_blank">Kotlin 1.5.30</a>。</p>
        </td>
    </tr>
    <tr>
        <td><strong>1.5.30</strong>
            <p>发布时间：<strong>2021 年 8 月 23 日</strong></p>
            <p><a href="https://github.com/JetBrains/kotlin/releases/tag/v1.5.30" target="_blank">在 GitHub 上查看发布</a></p>
        </td>
        <td>
            <p>增量版本，包含多项改进，例如：</p>
            <list>
                <li>JVM 上的注解类实例化</li>
                <li>改进的选择加入要求机制和类型推断</li>
                <li>处于 Beta 阶段的 Kotlin/JS IR 后端</li>
                <li>对 Apple 芯片目标的支持</li>
                <li>改进的 CocoaPods 支持</li>
                <li>Gradle：Java 工具链支持以及改进的守护进程配置</li>
            </list>
            <p>了解更多：</p>
            <list>
                <li><a href="https://blog.jetbrains.com/kotlin/2021/08/kotlin-1-5-30-released/" target="_blank">发布博客文章</a></li>
                <li><a href="whatsnew1530.md" target="_blank">Kotlin 1.5.30 的最新变化</a></li>
            </list>
        </td>
    </tr>
    <tr>
        <td><strong>1.5.21</strong>
            <p>发布时间：<strong>2021 年 7 月 13 日</strong></p>
            <p><a href="https://github.com/JetBrains/kotlin/releases/tag/v1.5.21" target="_blank">在 GitHub 上查看发布</a></p>
        </td>
        <td>
            <p>针对 Kotlin 1.5.20 的错误修复版本。</p>
            <p>详细了解 <a href="whatsnew1520.md" target="_blank">Kotlin 1.5.20</a>。</p>
        </td>
    </tr>
    <tr>
        <td><strong>1.5.20</strong>
            <p>发布时间：<strong>2021 年 6 月 24 日</strong></p>
            <p><a href="https://github.com/JetBrains/kotlin/releases/tag/v1.5.20" target="_blank">在 GitHub 上查看发布</a></p>
        </td>
        <td>
            <p>增量版本，包含多项改进，例如：</p>
            <list>
                <li>JVM 上默认通过 <code>invokedynamic</code> 进行字符串串联</li>
                <li>对 Lombok 改进的支持以及对 JSpecify 的支持</li>
                <li>Kotlin/Native：将 KDoc 导出到 Objective-C 头文件以及单个数组内更快的 <code>Array.copyInto()</code></li>
                <li>Gradle：注解处理器类加载器缓存以及对 <code>--parallel</code> Gradle 属性的支持</li>
                <li>统一了跨平台的标准库函数行为</li>
            </list>
            <p>了解更多：</p>
            <list>
                <li><a href="https://blog.jetbrains.com/kotlin/2021/06/kotlin-1-5-20-released/" target="_blank">发布博客文章</a></li>
                <li><a href="whatsnew1520.md" target="_blank">Kotlin 1.5.20 的最新变化</a></li>
            </list>
        </td>
    </tr>
    <tr>
        <td><strong>1.5.10</strong>
            <p>发布时间：<strong>2021 年 5 月 24 日</strong></p>
            <p><a href="https://github.com/JetBrains/kotlin/releases/tag/v1.5.10" target="_blank">在 GitHub 上查看发布</a></p>
        </td>
        <td>
            <p>针对 Kotlin 1.5.0 的错误修复版本。</p>
            <p>详细了解 <a href="https://blog.jetbrains.com/kotlin/2021/05/kotlin-1-5-0-released/" target="_blank">Kotlin 1.5.0</a>。</p>
        </td>
    </tr>
    <tr>
        <td><strong>1.5.0</strong>
            <p>发布时间：<strong>2021 年 5 月 5 日</strong></p>
            <p><a href="https://github.com/JetBrains/kotlin/releases/tag/v1.5.0" target="_blank">在 GitHub 上查看发布</a></p>
        </td>
        <td>
            <p>功能版本，带来新语言功能、性能改进，以及诸如稳定实验性 API 等渐进式变更。</p>
            <p>了解更多：</p>
            <list>
                <li><a href="https://blog.jetbrains.com/kotlin/2021/05/kotlin-1-5-0-released/" target="_blank">发布博客文章</a></li>
                <li><a href="whatsnew15.md" target="_blank">Kotlin 1.5.0 的最新变化</a></li>
                <li><a href="compatibility-guide-15.md" target="_blank">兼容性指南</a></li>
            </list>
        </td>
    </tr>
    <tr>
        <td><strong>1.4.32</strong>
            <p>发布时间：<strong>2021 年 3 月 22 日</strong></p>
            <p><a href="https://github.com/JetBrains/kotlin/releases/tag/v1.4.32" target="_blank">在 GitHub 上查看发布</a></p>
        </td>
        <td>
            <p>针对 Kotlin 1.4.30 的错误修复版本。</p>
            <p>详细了解 <a href="whatsnew1430.md" target="_blank">Kotlin 1.4.30</a>。</p>
        </td>
    </tr>
    <tr>
        <td><strong>1.4.31</strong>
            <p>发布时间：<strong>2021 年 2 月 25 日</strong></p>
            <p><a href="https://github.com/JetBrains/kotlin/releases/tag/v1.4.31" target="_blank">在 GitHub 上查看发布</a></p>
        </td>
        <td>
            <p>针对 Kotlin 1.4.30 的错误修复版本。</p>
            <p>详细了解 <a href="whatsnew1430.md" target="_blank">Kotlin 1.4.30</a>。</p>
        </td>
    </tr>
    <tr>
        <td><strong>1.4.30</strong>
            <p>发布时间：<strong>2021 年 2 月 3 日</strong></p>
            <p><a href="https://github.com/JetBrains/kotlin/releases/tag/v1.4.30" target="_blank">在 GitHub 上查看发布</a></p>
        </td>
        <td>
            <p>增量版本，包含多项改进，例如：</p>
            <list>
                <li>全新的 JVM 后端，目前处于 Beta 阶段</li>
                <li>新语言功能的预览</li>
                <li>提升的 Kotlin/Native 性能</li>
                <li>标准库 API 改进</li>
            </list>
            <p>了解更多：</p>
            <list>
                <li><a href="https://blog.jetbrains.com/kotlin/2021/02/kotlin-1-4-30-released/" target="_blank">发布博客文章</a></li>
                <li><a href="whatsnew1430.md" target="_blank">Kotlin 1.4.30 的最新变化</a></li>
            </list>
        </td>
    </tr>
    <tr>
        <td><strong>1.4.21</strong>
            <p>发布时间：<strong>2020 年 12 月 7 日</strong></p>
            <p><a href="https://github.com/JetBrains/kotlin/releases/tag/v1.4.21" target="_blank">在 GitHub 上查看发布</a></p>
        </td>
        <td>
            <p>针对 Kotlin 1.4.20 的错误修复版本。</p>
            <p>详细了解 <a href="whatsnew1420.md" target="_blank">Kotlin 1.4.20</a>。</p>
        </td>
    </tr>
    <tr>
        <td><strong>1.4.20</strong>
            <p>发布时间：<strong>2020 年 11 月 23 日</strong></p>
            <p><a href="https://github.com/JetBrains/kotlin/releases/tag/v1.4.20" target="_blank">在 GitHub 上查看发布</a></p>
        </td>
        <td>
            <p>增量版本，包含多项改进，例如：</p>
            <list>
                <li>支持新的 JVM 功能，例如通过 <code>invokedynamic</code> 进行字符串串联</li>
                <li>改进了 Kotlin Multiplatform Mobile 项目的性能和异常处理</li>
                <li>针对 JDK Path 的扩展：<code>Path("dir") / "file.txt"</code></li>
            </list>
            <p>了解更多：</p>
            <list>
                <li><a href="https://blog.jetbrains.com/kotlin/2020/11/kotlin-1-4-20-released/" target="_blank">发布博客文章</a></li>
                <li><a href="whatsnew1420.md" target="_blank">Kotlin 1.4.20 的最新变化</a></li>
            </list>
        </td>
    </tr>
    <tr>
        <td><strong>1.4.10</strong>
            <p>发布时间：<strong>2020 年 9 月 7 日</strong></p>
            <p><a href="https://github.com/JetBrains/kotlin/releases/tag/v1.4.10" target="_blank">在 GitHub 上查看发布</a></p>
        </td>
        <td>
            <p>针对 Kotlin 1.4.0 的错误修复版本。</p>
            <p>详细了解 <a href="https://blog.jetbrains.com/kotlin/2020/08/kotlin-1-4-released-with-a-focus-on-quality-and-performance/" target="_blank">Kotlin 1.4.0</a>。</p>
         </td>
    </tr>
    <tr>
        <td><strong>1.4.0</strong>
            <p>发布时间：<strong>2020 年 8 月 17 日</strong></p>
            <p><a href="https://github.com/JetBrains/kotlin/releases/tag/v1.4.0" target="_blank">在 GitHub 上查看发布</a></p>
        </td>
        <td>
            <p>功能版本，包含众多侧重于质量和性能的功能与改进。</p>
            <p>了解更多：</p>
            <list>
                <li><a href="https://blog.jetbrains.com/kotlin/2020/08/kotlin-1-4-released-with-a-focus-on-quality-and-performance/" target="_blank">发布博客文章</a></li>
                <li><a href="whatsnew14.md" target="_blank">Kotlin 1.4.0 的最新变化</a></li>
                <li><a href="compatibility-guide-14.md" target="_blank">兼容性指南</a></li>
                <li><a href="whatsnew14.md#migrating-to-kotlin-1-4-0" target="_blank">迁移至 Kotlin 1.4.0</a></li>
            </list>
        </td>
    </tr>
    <tr>
        <td><strong>1.3.72</strong>
            <p>发布时间：<strong>2020 年 4 月 15 日</strong></p>
            <p><a href="https://github.com/JetBrains/kotlin/releases/tag/v1.3.72" target="_blank">在 GitHub 上查看发布</a></p>
        </td>
        <td>
            <p>针对 Kotlin 1.3.70 的错误修复版本。</p>
            <p>详细了解 <a href="https://blog.jetbrains.com/kotlin/2020/03/kotlin-1-3-70-released/" target="_blank">Kotlin 1.3.70</a>。</p>
        </td>
    </tr>
</table>