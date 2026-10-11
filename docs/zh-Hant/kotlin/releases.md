[//]: # (title: Kotlin 發佈流程)

<web-summary>了解不同類型的 Kotlin 發佈版本、如何更新到各版本，以及 Kotlin 的發佈歷程記錄。</web-summary>

<tldr>
    <p>最新的 Kotlin 版本：<strong>%kotlinVersion%</strong></p>
    <p>請參閱 <a href="%kotlinLatestWhatsnew%">Kotlin 2.4.20 的新功能</a>，並在 <a href="%kotlinLatestUrl%">changelog</a> 中尋找錯誤修正詳細資訊。</p>
</tldr>

本頁面說明了 Kotlin 的發佈週期以及我們提供的不同版本發佈類型。其中也包含過去與未來 Kotlin 發佈版本的詳細資訊，以及如何更新至特定版本的說明。

自 Kotlin 2.0.0 起，我們提供以下幾種發佈類型：

* _語言版本 (Language releases)_ (2._x_._0_)：帶來語言層面的重大變更並包含工具更新。每 6 個月發佈一次。
* _工具版本 (Tooling releases)_ (2._x_._20_)：在語言版本之間推出，包含工具更新、效能改進以及錯誤修正。在對應的_語言版本_發佈後 3 個月內推出。
* _錯誤修正版本 (Bug fix releases)_ (2._x_._yz_)：包含對_工具版本_的錯誤修正。這些發佈沒有確切的時間表。

> 例如，對於語言版本 2.2.0，僅推出了一個工具版本 2.2.20 和一個錯誤修正版本 2.2.21。
>
{style="tip"}

針對每個語言與工具版本，我們還會提供數個預覽版本 (_EAP_)，以便你在正式發佈之前試用新功能。如需更多資訊，請參閱[參與 Kotlin 早期體驗計劃](eap.md)。

> 如果你希望收到新 Kotlin 發佈版本的通知，請訂閱 [Kotlin 電子報](https://lp.jetbrains.com/subscribe-to-kotlin-news/)、在 X 上[追蹤 Kotlin](https://x.com/kotlin)，或在 [Kotlin GitHub 存儲庫](https://github.com/JetBrains/kotlin)上啟用 **Watch | Custom | Releases** 選項。
> 
{style="note"}

## 即將推出的 Kotlin 版本 {id="upcoming-kotlin-releases"}

以下是即將推出的穩定 Kotlin 版本的大致時間表：

* **2.5.0**：預計於 2026 年 12 月
* **2.5.20**：預計於 2027 年 3 月

## 更新至新的 Kotlin 版本 {id="update-to-a-new-kotlin-version"}

若要將你的專案升級至新版本，請在建構系統中更新 Kotlin 版本。

### Gradle {id="gradle"}

若要更新至 Kotlin %kotlinVersion%，請在 `build.gradle(.kts)` 檔案中變更 Kotlin Gradle 外掛程式的版本：

<tabs group="build-script">
<tab title="Kotlin" group-key="kotlin">

```kotlin
plugins {
    // 將 `<...>` 替換為適合你目標環境的外掛程式名稱
    kotlin("<...>") version "%kotlinVersion%"
    // 例如，若你的目標環境是 JVM：
    // kotlin("jvm") version "%kotlinVersion%"
    // 若你的目標是 Kotlin Multiplatform：
    // kotlin("multiplatform") version "%kotlinVersion%"
}
```

</tab>
<tab title="Groovy" group-key="groovy">

```groovy
plugins {
    // 將 `<...>` 替換為適合你目標環境的外掛程式名稱
    id 'org.jetbrains.kotlin.<...>' version '%kotlinVersion%'
    // 例如，若你的目標環境是 JVM：
    // id 'org.jetbrains.kotlin.jvm' version '%kotlinVersion%'
    // 若你的目標是 Kotlin Multiplatform：
    // id 'org.jetbrains.kotlin.multiplatform' version '%kotlinVersion%'
}
```

</tab>
</tabs>

如果你的專案是使用舊版 Kotlin 建立的，請確認是否也需要[更新任何 kotlinx 程式庫的版本](gradle-configure-project.md#set-a-dependency-on-a-kotlinx-library)。

如果你正在遷移至新的語言版本，Kotlin 外掛程式的遷移工具將協助你完成該過程。

> 若要進一步了解如何在專案中使用 Gradle，請參閱[設定 Gradle 專案](gradle-configure-project.md)。
> 
{style="tip"}

### Maven {id="maven"}

若要更新至 Kotlin %kotlinVersion%，請在 `pom.xml` 檔案中變更版本：

```xml
<properties>
    <kotlin.version>%kotlinVersion%</kotlin.version>
</properties>
```

或者，你也可以在 `pom.xml` 檔案中變更 `kotlin-maven-plugin` 的版本：

```xml
<plugins>
    <plugin>
        <groupId>org.jetbrains.kotlin</groupId>
        <artifactId>kotlin-maven-plugin</artifactId>
        <version>%kotlinVersion%</version>
    </plugin>
</plugins>
```

如果你的專案是使用舊版 Kotlin 建立的，請檢查是否也需要[更新任何 kotlinx 程式庫的版本](maven-set-dependencies.md#dependency-on-a-kotlinx-library)。

> 若要進一步了解如何在專案中使用 Maven，請參閱 [Maven](maven.md)。
>
{style="tip"}

## IDE 支援 {id="ide-support"}

Kotlin 在 [IntelliJ IDEA](https://www.jetbrains.com/idea/download/) 與 [Android Studio](https://developer.android.com/kotlin/get-started) 中均提供完整的開箱即用支援。

## 標準函式庫安全支援 {id="standard-library-security-support"}

從 Kotlin 2.4.0 開始，JVM 的 Kotlin 標準函式庫針對每個發佈品系（release line）提供 18 個月的支援週期。
語言版本 (2._x_._0_) 和後續的工具版本 (2._x_._20_) 屬於同一個發佈品系 (2._x_)。

如果我們發現影響 JVM Kotlin 標準函式庫的安全漏洞，我們將同時提供以下發佈：

* 以該發佈品系中最新 Kotlin 版本為基礎的錯誤修正版本，其中包含安全修正。
* 處於有效支援期內的每個發佈品系的錯誤修正版本。

例如，如果我們發現安全漏洞且最新 Kotlin 發佈為 Kotlin 2.4.20，我們將僅發佈 Kotlin 2.4.20 的錯誤修正版本。我們不會為 Kotlin 2.4.0 發佈錯誤修正版本。

下表列出了所有 Kotlin 發佈版本及其支援週期：

<table>
    <tr>
        <th>Kotlin 發佈品系</th>
        <th>發佈日期</th>
        <th>支援結束日期</th>
        <th>最新發佈版本</th>
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

> 我們非常歡迎你回報發現的任何安全問題。若要回報你在 Kotlin 中發現的問題，請直接在我們的[問題追蹤器](https://youtrack.jetbrains.com/newIssue?project=KT&c=Type%20Security%20Problem)發表訊息，或向我們發送[電子郵件](mailto:security@jetbrains.org)。
> 
{style="tip"}

## 發佈歷程記錄 {id="release-history"}

下表列出過往 Kotlin 發佈版本的詳細資訊：

> 你也可以試用 [Kotlin 的早期體驗計劃 (EAP) 版本](eap.md#build-details)。
> 
{style="tip"}

<table>
    <tr>
        <th>組建資訊</th>
        <th>組建重點</th>
    </tr>
    <tr>
        <td><strong>2.4.21</strong>
            <p>發佈日期：<strong>2026 年 10 月 8 日</strong></p>
            <p><a href="https://github.com/JetBrains/kotlin/releases/tag/v2.4.21" target="_blank">在 GitHub 上查看版本</a></p>
        </td>
        <td>
            <p>Kotlin 2.4.21 的錯誤修正版本。</p>
            <p>如需更多詳細資訊，請參閱 <a href="https://github.com/JetBrains/kotlin/releases/tag/v2.4.21">changelog</a>。</p>
        </td>
    </tr>
    <tr>
        <td><strong>2.4.20</strong>
            <p>發佈日期：<strong>2026 年 9 月 7 日</strong></p>
            <p><a href="https://github.com/JetBrains/kotlin/releases/tag/v2.4.20" target="_blank">在 GitHub 上查看版本</a></p>
        </td>
        <td>
            <p>包含全新實驗性與穩定功能、效能改進、錯誤修正和工具更新的工具版本。</p>
            <p>如需更多詳細資訊，請參閱 <a href="https://github.com/JetBrains/kotlin/releases/tag/v2.4.20">changelog</a>。</p>
        </td>
    </tr>
    <tr>
        <td><strong>2.4.10</strong>
            <p>發佈日期：<strong>2026 年 7 月 14 日</strong></p>
            <p><a href="https://github.com/JetBrains/kotlin/releases/tag/v2.4.10" target="_blank">在 GitHub 上查看版本</a></p>
        </td>
        <td>
            <p>Kotlin 2.4.0 的錯誤修正版本。</p>
            <p>如需更多詳細資訊，請參閱 <a href="https://github.com/JetBrains/kotlin/releases/tag/v2.4.10">changelog</a>。</p>
        </td>
    </tr>
    <tr>
        <td><strong>2.4.0</strong>
            <p>發佈日期：<strong>2026 年 6 月 3 日</strong></p>
            <p><a href="https://github.com/JetBrains/kotlin/releases/tag/v2.4.0" target="_blank">在 GitHub 上查看版本</a></p>
        </td>
        <td>
            <p>語言版本，包含全新與穩定的語言特性、工具更新、針對不同平台的效能改進以及重要修正。</p>
            <p>在 <a href="whatsnew24.md" target="_blank">Kotlin 2.4.0 的新功能</a>中進一步了解 Kotlin 2.4.0。</p>
        </td>
    </tr>
    <tr>
        <td><strong>2.3.21</strong>
            <p>發佈日期：<strong>2026 年 4 月 23 日</strong></p>
            <p><a href="https://github.com/JetBrains/kotlin/releases/tag/v2.3.21" target="_blank">在 GitHub 上查看版本</a></p>
        </td>
        <td>
            <p>Kotlin 2.3.20 的錯誤修正版本。</p>
            <p>如需更多詳細資訊，請參閱 <a href="https://github.com/JetBrains/kotlin/releases/tag/v2.3.21">changelog</a>。</p>
        </td>
    </tr>
    <tr>
        <td><strong>2.3.20</strong>
            <p>發佈日期：<strong>2026 年 3 月 16 日</strong></p>
            <p><a href="https://github.com/JetBrains/kotlin/releases/tag/v2.3.20" target="_blank">在 GitHub 上查看版本</a></p>
        </td>
        <td>
            <p>包含效能改進、錯誤修正和工具更新的工具版本。</p>
            <p>如需更多詳細資訊，請參閱 <a href="https://github.com/JetBrains/kotlin/releases/tag/v2.3.20">changelog</a>。</p>
        </td>
    </tr>
    <tr>
        <td><strong>2.3.10</strong>
            <p>發佈日期：<strong>2026 年 2 月 5 日</strong></p>
            <p><a href="https://github.com/JetBrains/kotlin/releases/tag/v2.3.10" target="_blank">在 GitHub 上查看版本</a></p>
        </td>
        <td>
            <p>Kotlin 2.3.0 的錯誤修正版本，包含效能改進，以及針對罕見的 <a href="https://youtrack.jetbrains.com/issue/KT-83984"><code>kotlinx.serialization</code> 資料競爭問題</a>的重要修正。</p>
            <p>如需更多詳細資訊，請參閱 <a href="https://github.com/JetBrains/kotlin/releases/tag/v2.3.10">changelog</a>。</p>
        </td>
    </tr>
    <tr>
        <td><strong>2.3.0</strong>
            <p>發佈日期：<strong>2025 年 12 月 16 日</strong></p>
            <p><a href="https://github.com/JetBrains/kotlin/releases/tag/v2.3.0" target="_blank">在 GitHub 上查看版本</a></p>
        </td>
        <td>
            <p>語言版本，包含全新與穩定的語言特性、工具更新、針對不同平台的效能改進以及重要修正。</p>
            <p>在 <a href="whatsnew23.md" target="_blank">Kotlin 2.3.0 的新功能</a>中進一步了解 Kotlin 2.3.0。</p>
        </td>
    </tr> 
    <tr>
        <td><strong>2.2.21</strong>
            <p>發佈日期：<strong>2025 年 10 月 23 日</strong></p>
            <p><a href="https://github.com/JetBrains/kotlin/releases/tag/v2.2.21" target="_blank">在 GitHub 上查看版本</a></p>
        </td>
        <td>
            <p>錯誤修正版本，包含對 Xcode 26 的支援，以及其他改進和錯誤修正。</p>
            <p>如需更多詳細資訊，請參閱 <a href="https://github.com/JetBrains/kotlin/releases/tag/v2.2.21">changelog</a>。</p>
    </td>
    </tr>
    <tr>
        <td><strong>2.2.20</strong>
            <p>發佈日期：<strong>2025 年 9 月 10 日</strong></p>
            <p><a href="https://github.com/JetBrains/kotlin/releases/tag/v2.2.20" target="_blank">在 GitHub 上查看版本</a></p>
        </td>
        <td>
            <p>Kotlin 2.2.0 的工具版本，包含針對 Web 開發的重要變更與其他改進。</p>
            <p>在 <a href="whatsnew2220.md" target="_blank">Kotlin 2.2.20 的新功能</a>中進一步了解 Kotlin 2.2.20。</p>
        </td>
    </tr>
    <tr>
        <td><strong>2.2.10</strong>
            <p>發佈日期：<strong>2025 年 8 月 14 日</strong></p>
            <p><a href="https://github.com/JetBrains/kotlin/releases/tag/v2.2.10" target="_blank">在 GitHub 上查看版本</a></p>
        </td>
        <td>
            <p>Kotlin 2.2.0 的錯誤修正版本。</p>
            <p>如需更多詳細資訊，請參閱 <a href="https://github.com/JetBrains/kotlin/releases/tag/v2.2.10">changelog</a>。</p>
        </td>
    </tr>
    <tr>
        <td><strong>2.2.0</strong>
            <p>發佈日期：<strong>2025 年 6 月 23 日</strong></p>
            <p><a href="https://github.com/JetBrains/kotlin/releases/tag/v2.2.0" target="_blank">在 GitHub 上查看版本</a></p>
        </td>
        <td>
            <p>語言版本，包含全新與穩定的語言特性、工具更新、針對不同平台的效能改進以及重要修正。</p>
            <p>在 <a href="whatsnew22.md" target="_blank">Kotlin 2.2.0 的新功能</a>中進一步了解 Kotlin 2.2.0。</p>
        </td>
    </tr> 
    <tr>
        <td><strong>2.1.21</strong>
            <p>發佈日期：<strong>2025 年 5 月 13 日</strong></p>
            <p><a href="https://github.com/JetBrains/kotlin/releases/tag/v2.1.21" target="_blank">在 GitHub 上查看版本</a></p>
        </td>
        <td>
            <p>Kotlin 2.1.20 的錯誤修正版本。</p>
            <p>如需更多詳細資訊，請參閱 <a href="https://github.com/JetBrains/kotlin/releases/tag/v2.1.21">changelog</a>。</p>
        </td>
    </tr> 
   <tr>
        <td><strong>2.1.20</strong>
            <p>發佈日期：<strong>2025 年 3 月 20 日</strong></p>
            <p><a href="https://github.com/JetBrains/kotlin/releases/tag/v2.1.20" target="_blank">在 GitHub 上查看版本</a></p>
        </td>
        <td>
           <p>Kotlin 2.1.0 的工具版本，包含全新實驗功能、效能改進和錯誤修正。</p>
            <p>在 <a href="whatsnew2120.md" target="_blank">Kotlin 2.1.20 的新功能</a>中進一步了解 Kotlin 2.1.20。</p>
        </td>
    </tr>
    <tr>
        <td><strong>2.1.10</strong>
            <p>發佈日期：<strong>2025 年 1 月 27 日</strong></p>
            <p><a href="https://github.com/JetBrains/kotlin/releases/tag/v2.1.10" target="_blank">在 GitHub 上查看版本</a></p>
        </td>
        <td>
            <p>Kotlin 2.1.0 的錯誤修正版本。</p>
            <p>如需更多詳細資訊，請參閱 <a href="https://github.com/JetBrains/kotlin/releases/tag/v2.1.10">changelog</a>。</p>
        </td>
    </tr>
    <tr>
        <td><strong>2.1.0</strong>
            <p>發佈日期：<strong>2024 年 11 月 27 日</strong></p>
            <p><a href="https://github.com/JetBrains/kotlin/releases/tag/v2.1.0" target="_blank">在 GitHub 上查看版本</a></p>
        </td>
        <td>
            <p>引入全新語言特性的語言版本。</p>
            <p>在 <a href="whatsnew21.md" target="_blank">Kotlin 2.1.0 的新功能</a>中進一步了解 Kotlin 2.1.0。</p>
        </td>
    </tr>
    <tr>
        <td><strong>2.0.21</strong>
            <p>發佈日期：<strong>2024 年 10 月 10 日</strong></p>
            <p><a href="https://github.com/JetBrains/kotlin/releases/tag/v2.0.21" target="_blank">在 GitHub 上查看版本</a></p>
        </td>
        <td>
            <p>Kotlin 2.0.20 的錯誤修正版本。</p>
            <p>如需更多詳細資訊，請參閱 <a href="https://github.com/JetBrains/kotlin/releases/tag/v2.0.21">changelog</a>。</p>
        </td>
    </tr>
    <tr>
        <td><strong>2.0.20</strong>
            <p>發佈日期：<strong>2024 年 8 月 22 日</strong></p>
            <p><a href="https://github.com/JetBrains/kotlin/releases/tag/v2.0.20" target="_blank">在 GitHub 上查看版本</a></p>
        </td>
        <td>
           <p>Kotlin 2.0.0 的工具版本，包含效能改進和錯誤修正。功能還包括
              Kotlin/Native 垃圾收集中的並行標記、Kotlin 通用標準庫中的 UUID 支援、
              Compose 編譯器更新，以及最高支援至 Gradle 8.8。
            </p>
            <p>在 <a href="whatsnew2020.md" target="_blank">Kotlin 2.0.20 的新功能</a>中進一步了解 Kotlin 2.0.20。</p>
        </td>
    </tr>
    <tr>
        <td><strong>2.0.10</strong>
            <p>發佈日期：<strong>2024 年 8 月 6 日</strong></p>
            <p><a href="https://github.com/JetBrains/kotlin/releases/tag/v2.0.10" target="_blank">在 GitHub 上查看版本</a></p>
        </td>
        <td>
            <p>Kotlin 2.0.0 的錯誤修正版本。</p>
            <p>在 <a href="whatsnew20.md" target="_blank">Kotlin 2.0.0 的新功能</a>中進一步了解 Kotlin 2.0.0。</p>
        </td>
    </tr>
    <tr>
        <td><strong>2.0.0</strong>
            <p>發佈日期：<strong>2024 年 5 月 21 日</strong></p>
            <p><a href="https://github.com/JetBrains/kotlin/releases/tag/v2.0.0" target="_blank">在 GitHub 上查看版本</a></p>
        </td>
        <td>
            <p>帶來穩定版 Kotlin K2 編譯器的語言版本。</p>
            <p>在 <a href="whatsnew20.md" target="_blank">Kotlin 2.0.0 的新功能</a>中進一步了解 Kotlin 2.0.0。</p>
        </td>
    </tr>
    <tr>
        <td><strong>1.9.25</strong>
            <p>發佈日期：<strong>2024 年 7 月 19 日</strong></p>
            <p><a href="https://github.com/JetBrains/kotlin/releases/tag/v1.9.25" target="_blank">在 GitHub 上查看版本</a></p>
        </td>
        <td>
            <p>Kotlin 1.9.20、1.9.21、1.9.22、1.9.23 及 1.9.24 的錯誤修正版本。</p>
            <p>在 <a href="whatsnew1920.md" target="_blank">Kotlin 1.9.20 的新功能</a>中進一步了解 Kotlin 1.9.20。</p>
        </td>
    </tr>
    <tr>
        <td><strong>1.9.24</strong>
            <p>發佈日期：<strong>2024 年 5 月 7 日</strong></p>
            <p><a href="https://github.com/JetBrains/kotlin/releases/tag/v1.9.24" target="_blank">在 GitHub 上查看版本</a></p>
        </td>
        <td>
            <p>Kotlin 1.9.20、1.9.21、1.9.22 及 1.9.23 的錯誤修正版本。</p>
            <p>在 <a href="whatsnew1920.md" target="_blank">Kotlin 1.9.20 的新功能</a>中進一步了解 Kotlin 1.9.20。</p>
        </td>
    </tr>
    <tr>
        <td><strong>1.9.23</strong>
            <p>發佈日期：<strong>2024 年 3 月 7 日</strong></p>
            <p><a href="https://github.com/JetBrains/kotlin/releases/tag/v1.9.23" target="_blank">在 GitHub 上查看版本</a></p>
        </td>
        <td>
            <p>Kotlin 1.9.20、1.9.21 及 1.9.22 的錯誤修正版本。</p>
            <p>在 <a href="whatsnew1920.md" target="_blank">Kotlin 1.9.20 的新功能</a>中進一步了解 Kotlin 1.9.20。</p>
        </td>
    </tr>
    <tr>
        <td><strong>1.9.22</strong>
            <p>發佈日期：<strong>2023 年 12 月 21 日</strong></p>
            <p><a href="https://github.com/JetBrains/kotlin/releases/tag/v1.9.22" target="_blank">在 GitHub 上查看版本</a></p>
        </td>
        <td>
            <p>Kotlin 1.9.20 與 1.9.21 的錯誤修正版本。</p>
            <p>在 <a href="whatsnew1920.md" target="_blank">Kotlin 1.9.20 的新功能</a>中進一步了解 Kotlin 1.9.20。</p>
        </td>
    </tr>
    <tr>
        <td><strong>1.9.21</strong>
            <p>發佈日期：<strong>2023 年 11 月 23 日</strong></p>
            <p><a href="https://github.com/JetBrains/kotlin/releases/tag/v1.9.21" target="_blank">在 GitHub 上查看版本</a></p>
        </td>
        <td>
            <p>Kotlin 1.9.20 的錯誤修正版本。</p>
            <p>在 <a href="whatsnew1920.md" target="_blank">Kotlin 1.9.20 的新功能</a>中進一步了解 Kotlin 1.9.20。</p>
        </td>
    </tr>
    <tr>
        <td><strong>1.9.20</strong>
            <p>發佈日期：<strong>2023 年 11 月 1 日</strong></p>
            <p><a href="https://github.com/JetBrains/kotlin/releases/tag/v1.9.20" target="_blank">在 GitHub 上查看版本</a></p>
        </td>
        <td>
            <p>功能版本，包含處於 Beta 階段的 Kotlin K2 編譯器與穩定版 Kotlin Multiplatform。</p>
            <p>進一步了解：</p>
            <list>
                <li><a href="whatsnew1920.md" target="_blank">Kotlin 1.9.20 的新功能</a></li>
            </list>
        </td>
    </tr>
    <tr>
        <td><strong>1.9.10</strong>
            <p>發佈日期：<strong>2023 年 8 月 23 日</strong></p>
            <p><a href="https://github.com/JetBrains/kotlin/releases/tag/v1.9.10" target="_blank">在 GitHub 上查看版本</a></p>
        </td>
        <td>
            <p>Kotlin 1.9.0 的錯誤修正版本。</p>
            <p>在 <a href="whatsnew19.md" target="_blank">Kotlin 1.9.0 的新功能</a>中進一步了解 Kotlin 1.9.0。</p>
            <note>針對 Android Studio Giraffe 和 Hedgehog，Kotlin 外掛程式 1.9.10 將隨未來的 Android Studio 更新一同提供。</note>
        </td>
    </tr>
    <tr>
        <td><strong>1.9.0</strong>
            <p>發佈日期：<strong>2023 年 7 月 6 日</strong></p>
            <p><a href="https://github.com/JetBrains/kotlin/releases/tag/v1.9.0" target="_blank">在 GitHub 上查看版本</a></p>
        </td>
        <td>
            <p>功能版本，包含 Kotlin K2 編譯器更新、全新的列舉類別 values 函式、
                開放區間的新運算子、Kotlin Multiplatform 中 Gradle 組態快取的預覽、
                Kotlin Multiplatform 中 Android 目標支援的變更，以及 Kotlin/Native 中自訂記憶體配置器的預覽。
            </p>
            <p>進一步了解：</p>
            <list>
                <li><a href="whatsnew19.md" target="_blank">Kotlin 1.9.0 的新功能</a></li>
                <li><a href="https://www.youtube.com/embed/fvwTZc-dxsM" target="_blank">Kotlin 新功能 YouTube 影片</a></li>
            </list>
        </td>
    </tr>
    <tr>
        <td><strong>1.8.22</strong>
            <p>發佈日期：<strong>2023 年 6 月 8 日</strong></p>
            <p><a href="https://github.com/JetBrains/kotlin/releases/tag/v1.8.22" target="_blank">在 GitHub 上查看版本</a></p>
        </td>
        <td>
            <p>Kotlin 1.8.20 的錯誤修正版本。</p>
            <p>在 <a href="whatsnew1820.md" target="_blank">Kotlin 1.8.20 的新功能</a>中進一步了解 Kotlin 1.8.20。</p>
        </td>
    </tr>
    <tr>
        <td><strong>1.8.21</strong>
            <p>發佈日期：<strong>2023 年 4 月 25 日</strong></p>
            <p><a href="https://github.com/JetBrains/kotlin/releases/tag/v1.8.21" target="_blank">在 GitHub 上查看版本</a></p>
        </td>
        <td>
            <p>Kotlin 1.8.20 的錯誤修正版本。</p>
            <p>在 <a href="whatsnew1820.md" target="_blank">Kotlin 1.8.20 的新功能</a>中進一步了解 Kotlin 1.8.20。</p>
            <note>針對 Android Studio Flamingo 和 Giraffe，Kotlin 外掛程式 1.8.21 將隨未來的 Android Studio 更新一同提供。</note>
        </td>
    </tr>
    <tr>
        <td><strong>1.8.20</strong>
            <p>發佈日期：<strong>2023 年 4 月 3 日</strong></p>
            <p><a href="https://github.com/JetBrains/kotlin/releases/tag/v1.8.20" target="_blank">在 GitHub 上查看版本</a></p>
        </td>
        <td>
            <p>功能版本，包含 Kotlin K2 編譯器更新、stdlib 中的 AutoCloseable 介面與 Base64 編碼、
                預設啟用的全新 JVM 累加式編譯，以及全新的 Kotlin/Wasm 編譯器後端。
            </p>
            <p>進一步了解：</p>
            <list>
                <li><a href="whatsnew1820.md" target="_blank">Kotlin 1.8.20 的新功能</a></li>
                <li><a href="https://youtu.be/R1JpkpPzyBU" target="_blank">Kotlin 新功能 YouTube 影片</a></li>
            </list>
        </td>
    </tr>
    <tr>
        <td><strong>1.8.10</strong>
            <p>發佈日期：<strong>2023 年 2 月 2 日</strong></p>
            <p><a href="https://github.com/JetBrains/kotlin/releases/tag/v1.8.10" target="_blank">在 GitHub 上查看版本</a></p>
        </td>
        <td>
            <p>Kotlin 1.8.0 的錯誤修正版本。</p>
            <p>進一步了解 <a href="https://github.com/JetBrains/kotlin/releases/tag/v1.8.0" target="_blank">Kotlin 1.8.0</a>。</p>
            <note>針對 Android Studio Electric Eel 和 Flamingo，Kotlin 外掛程式 1.8.10 將隨未來的 Android Studio 更新一同提供。</note>
        </td>
    </tr>
    <tr>
        <td><strong>1.8.0</strong>
            <p>發佈日期：<strong>2022 年 12 月 28 日</strong></p>
            <p><a href="https://github.com/JetBrains/kotlin/releases/tag/v1.8.0" target="_blank">在 GitHub 上查看版本</a></p>
        </td>
        <td>
            <p>功能版本，包含提升的 kotlin-reflect 效能、適用於 JVM 的遞迴複製或刪除目錄內容實驗性函式、改進的 Objective-C/Swift 互通性。</p>
            <p>進一步了解：</p>
            <list>
                <li><a href="whatsnew18.md" target="_blank">Kotlin 1.8.0 的新功能</a></li>
                <li><a href="compatibility-guide-18.md" target="_blank">Kotlin 1.8.0 相容性指南</a></li>
            </list>
        </td>
    </tr>
    <tr>
        <td><strong>1.7.21</strong>
            <p>發佈日期：<strong>2022 年 11 月 9 日</strong></p>
            <p><a href="https://github.com/JetBrains/kotlin/releases/tag/v1.7.21" target="_blank">在 GitHub 上查看版本</a></p>
        </td>
        <td>
            <p>Kotlin 1.7.20 的錯誤修正版本。</p>
            <p>在 <a href="whatsnew1720.md" target="_blank">Kotlin 1.7.20 的新功能</a>中進一步了解 Kotlin 1.7.20。</p>
            <note>針對 Android Studio Dolphin、Electric Eel 和 Flamingo，Kotlin 外掛程式 1.7.21 將隨未來的 Android Studio 更新一同提供。</note>
        </td>
    </tr>
    <tr>
        <td><strong>1.7.20</strong>
            <p>發佈日期：<strong>2022 年 9 月 29 日</strong></p>
            <p><a href="https://github.com/JetBrains/kotlin/releases/tag/v1.7.20" target="_blank">在 GitHub 上查看版本</a></p>
        </td>
        <td>
            <p>增量版本，包含全新語言特性、Kotlin K2 編譯器對多個編譯器外掛程式的支援、
                預設啟用的全新 Kotlin/Native 記憶體管理器，以及對 Gradle 7.1 的支援。
            </p>
            <p>進一步了解：</p>
            <list>
                <li><a href="whatsnew1720.md" target="_blank">Kotlin 1.7.20 的新功能</a></li>
                <li><a href="https://youtu.be/OG9npowJgE8" target="_blank">Kotlin 新功能 YouTube 影片</a></li>
                <li><a href="compatibility-guide-1720.md" target="_blank">Kotlin 1.7.20 相容性指南</a></li>
            </list>
            <p>進一步了解 <a href="https://github.com/JetBrains/kotlin/releases/tag/v1.7.20" target="_blank">Kotlin 1.7.20</a>。</p>
        </td>
    </tr>
    <tr>
        <td><strong>1.7.10</strong>
            <p>發佈日期：<strong>2022 年 7 月 7 日</strong></p>
            <p><a href="https://github.com/JetBrains/kotlin/releases/tag/v1.7.10" target="_blank">在 GitHub 上查看版本</a></p>
        </td>
        <td>
            <p>Kotlin 1.7.0 的錯誤修正版本。</p>
            <p>進一步了解 <a href="https://github.com/JetBrains/kotlin/releases/tag/v1.7.0" target="_blank">Kotlin 1.7.0</a>。</p>
            <note>針對 Android Studio Dolphin (213) 與 Android Studio Electric Eel (221)，Kotlin 外掛程式 1.7.10 將隨未來的 Android Studio 更新一同提供。</note>
        </td>
    </tr>
    <tr>
        <td><strong>1.7.0</strong>
            <p>發佈日期：<strong>2022 年 6 月 9 日</strong></p>
            <p><a href="https://github.com/JetBrains/kotlin/releases/tag/v1.7.0" target="_blank">在 GitHub 上查看版本</a></p>
        </td>
        <td>
            <p>功能版本，包含適用於 JVM 的 Alpha 階段 Kotlin K2 編譯器、穩定化的語言特性、效能改進，以及如穩定實驗性 API 等漸進式變更。</p>
            <p>進一步了解：</p>
            <list>
                <li><a href="whatsnew17.md" target="_blank">Kotlin 1.7.0 的新功能</a></li>
                <li><a href="https://youtu.be/54WEfLKtCGk" target="_blank">Kotlin 新功能 YouTube 影片</a></li>
                <li><a href="compatibility-guide-17.md" target="_blank">Kotlin 1.7.0 相容性指南</a></li>
            </list>
        </td>
    </tr>
    <tr>
        <td><strong>1.6.21</strong>
            <p>發佈日期：<strong>2022 年 4 月 20 日</strong></p>
            <p><a href="https://github.com/JetBrains/kotlin/releases/tag/v1.6.21" target="_blank">在 GitHub 上查看版本</a></p>
        </td>
        <td>
            <p>Kotlin 1.6.20 的錯誤修正版本。</p>
            <p>進一步了解 <a href="whatsnew1620.md" target="_blank">Kotlin 1.6.20</a>。</p>
        </td>
    </tr>
    <tr>
        <td><strong>1.6.20</strong>
            <p>發佈日期：<strong>2022 年 4 月 4 日</strong></p>
            <p><a href="https://github.com/JetBrains/kotlin/releases/tag/v1.6.20" target="_blank">在 GitHub 上查看版本</a></p>
        </td>
        <td>
            <p>增量版本，包含多項改進，例如：</p>
            <list>
                <li>上下文接收者原型</li>
                <li>對函式介面建構函式的可呼叫參照</li>
                <li>Kotlin/Native：新記憶體管理器的效能改進</li>
                <li>多平台：預設採用階層式專案結構</li>
                <li>Kotlin/JS：IR 編譯器改進</li>
                <li>Gradle：編譯器執行策略</li>
            </list>
            <p>進一步了解 <a href="whatsnew1620.md" target="_blank">Kotlin 1.6.20</a>。</p>
        </td>
    </tr>
    <tr>
        <td><strong>1.6.10</strong>
            <p>發佈日期：<strong>2021 年 12 月 14 日</strong></p>
            <p><a href="https://github.com/JetBrains/kotlin/releases/tag/v1.6.10" target="_blank">在 GitHub 上查看版本</a></p>
        </td>
        <td>
            <p>Kotlin 1.6.0 的錯誤修正版本。</p>
            <p>進一步了解 <a href="https://github.com/JetBrains/kotlin/releases/tag/v1.6.0" target="_blank">Kotlin 1.6.0</a>。</p>
        </td>
    </tr>
    <tr>
        <td><strong>1.6.0</strong>
            <p>發佈日期：<strong>2021 年 11 月 16 日</strong></p>
            <p><a href="https://github.com/JetBrains/kotlin/releases/tag/v1.6.0" target="_blank">在 GitHub 上查看版本</a></p>
        </td>
        <td>
            <p>功能版本，包含全新語言特性、效能改進，以及如穩定實驗性 API 等漸進式變更。</p>
            <p>進一步了解：</p>
            <list>
                <li><a href="https://blog.jetbrains.com/kotlin/2021/11/kotlin-1-6-0-is-released/" target="_blank">發佈部落格文章</a></li>
                <li><a href="whatsnew16.md" target="_blank">Kotlin 1.6.0 的新功能</a></li>
                <li><a href="compatibility-guide-16.md" target="_blank">相容性指南</a></li>
            </list>
        </td>
    </tr>
    <tr>
        <td><strong>1.5.32</strong>
            <p>發佈日期：<strong>2021 年 11 月 29 日</strong></p>
            <p><a href="https://github.com/JetBrains/kotlin/releases/tag/v1.5.32" target="_blank">在 GitHub 上查看版本</a></p>
        </td>
        <td>
            <p>Kotlin 1.5.31 的錯誤修正版本。</p>
            <p>進一步了解 <a href="whatsnew1530.md" target="_blank">Kotlin 1.5.30</a>。</p>
        </td>
    </tr>
    <tr>
        <td><strong>1.5.31</strong>
            <p>發佈日期：<strong>2021 年 9 月 20 日</strong></p>
            <p><a href="https://github.com/JetBrains/kotlin/releases/tag/v1.5.31" target="_blank">在 GitHub 上查看版本</a></p>
        </td>
        <td>
            <p>Kotlin 1.5.30 的錯誤修正版本。</p>
            <p>進一步了解 <a href="whatsnew1530.md" target="_blank">Kotlin 1.5.30</a>。</p>
        </td>
    </tr>
    <tr>
        <td><strong>1.5.30</strong>
            <p>發佈日期：<strong>2021 年 8 月 23 日</strong></p>
            <p><a href="https://github.com/JetBrains/kotlin/releases/tag/v1.5.30" target="_blank">在 GitHub 上查看版本</a></p>
        </td>
        <td>
            <p>增量版本，包含多項改進，例如：</p>
            <list>
                <li>JVM 上註解類別的具現化</li>
                <li>改進的選擇加入要求機制與型別推論</li>
                <li>處於 Beta 階段的 Kotlin/JS IR 後端</li>
                <li>支援 Apple 晶片目標</li>
                <li>改進的 CocoaPods 支援</li>
                <li>Gradle：Java 工具鏈支援與改進的常駐程式配置</li>
            </list>
            <p>進一步了解：</p>
            <list>
                <li><a href="https://blog.jetbrains.com/kotlin/2021/08/kotlin-1-5-30-released/" target="_blank">發佈部落格文章</a></li>
                <li><a href="whatsnew1530.md" target="_blank">Kotlin 1.5.30 的新功能</a></li>
            </list>
        </td>
    </tr>
    <tr>
        <td><strong>1.5.21</strong>
            <p>發佈日期：<strong>2021 年 7 月 13 日</strong></p>
            <p><a href="https://github.com/JetBrains/kotlin/releases/tag/v1.5.21" target="_blank">在 GitHub 上查看版本</a></p>
        </td>
        <td>
            <p>Kotlin 1.5.20 的錯誤修正版本。</p>
            <p>進一步了解 <a href="whatsnew1520.md" target="_blank">Kotlin 1.5.20</a>。</p>
        </td>
    </tr>
    <tr>
        <td><strong>1.5.20</strong>
            <p>發佈日期：<strong>2021 年 6 月 24 日</strong></p>
            <p><a href="https://github.com/JetBrains/kotlin/releases/tag/v1.5.20" target="_blank">在 GitHub 上查看版本</a></p>
        </td>
        <td>
            <p>增量版本，包含多項改進，例如：</p>
            <list>
                <li>JVM 上預設透過 <code>invokedynamic</code> 進行字串連接</li>
                <li>改進對 Lombok 的支援並支援 JSpecify</li>
                <li>Kotlin/Native：KDoc 匯出至 Objective-C 標頭，以及同一陣列內更快的 <code>Array.copyInto()</code></li>
                <li>Gradle：註解處理器類別載入器的快取與支援 <code>--parallel</code> Gradle 屬性</li>
                <li>統整各平台間 stdlib 函式的行為</li>
            </list>
            <p>進一步了解：</p>
            <list>
                <li><a href="https://blog.jetbrains.com/kotlin/2021/06/kotlin-1-5-20-released/" target="_blank">發佈部落格文章</a></li>
                <li><a href="whatsnew1520.md" target="_blank">Kotlin 1.5.20 的新功能</a></li>
            </list>
        </td>
    </tr>
    <tr>
        <td><strong>1.5.10</strong>
            <p>發佈日期：<strong>2021 年 5 月 24 日</strong></p>
            <p><a href="https://github.com/JetBrains/kotlin/releases/tag/v1.5.10" target="_blank">在 GitHub 上查看版本</a></p>
        </td>
        <td>
            <p>Kotlin 1.5.0 的錯誤修正版本。</p>
            <p>進一步了解 <a href="https://blog.jetbrains.com/kotlin/2021/05/kotlin-1-5-0-released/" target="_blank">Kotlin 1.5.0</a>。</p>
        </td>
    </tr>
    <tr>
        <td><strong>1.5.0</strong>
            <p>發佈日期：<strong>2021 年 5 月 5 日</strong></p>
            <p><a href="https://github.com/JetBrains/kotlin/releases/tag/v1.5.0" target="_blank">在 GitHub 上查看版本</a></p>
        </td>
        <td>
            <p>功能版本，包含全新語言特性、效能改進，以及如穩定實驗性 API 等漸進式變更。</p>
            <p>進一步了解：</p>
            <list>
                <li><a href="https://blog.jetbrains.com/kotlin/2021/05/kotlin-1-5-0-released/" target="_blank">發佈部落格文章</a></li>
                <li><a href="whatsnew15.md" target="_blank">Kotlin 1.5.0 的新功能</a></li>
                <li><a href="compatibility-guide-15.md" target="_blank">相容性指南</a></li>
            </list>
        </td>
    </tr>
    <tr>
        <td><strong>1.4.32</strong>
            <p>發佈日期：<strong>2021 年 3 月 22 日</strong></p>
            <p><a href="https://github.com/JetBrains/kotlin/releases/tag/v1.4.32" target="_blank">在 GitHub 上查看版本</a></p>
        </td>
        <td>
            <p>Kotlin 1.4.30 的錯誤修正版本。</p>
            <p>進一步了解 <a href="whatsnew1430.md" target="_blank">Kotlin 1.4.30</a>。</p>
        </td>
    </tr>
    <tr>
        <td><strong>1.4.31</strong>
            <p>發佈日期：<strong>2021 年 2 月 25 日</strong></p>
            <p><a href="https://github.com/JetBrains/kotlin/releases/tag/v1.4.31" target="_blank">在 GitHub 上查看版本</a></p>
        </td>
        <td>
            <p>Kotlin 1.4.30 的錯誤修正版本。</p>
            <p>進一步了解 <a href="whatsnew1430.md" target="_blank">Kotlin 1.4.30</a>。</p>
        </td>
    </tr>
    <tr>
        <td><strong>1.4.30</strong>
            <p>發佈日期：<strong>2021 年 2 月 3 日</strong></p>
            <p><a href="https://github.com/JetBrains/kotlin/releases/tag/v1.4.30" target="_blank">在 GitHub 上查看版本</a></p>
        </td>
        <td>
            <p>增量版本，包含多項改進，例如：</p>
            <list>
                <li>全新的 JVM 後端，目前處於 Beta 階段</li>
                <li>全新語言特性預覽</li>
                <li>改進的 Kotlin/Native 效能</li>
                <li>標準函式庫 API 改進</li>
            </list>
            <p>進一步了解：</p>
            <list>
                <li><a href="https://blog.jetbrains.com/kotlin/2021/02/kotlin-1-4-30-released/" target="_blank">發佈部落格文章</a></li>
                <li><a href="whatsnew1430.md" target="_blank">Kotlin 1.4.30 的新功能</a></li>
            </list>
        </td>
    </tr>
    <tr>
        <td><strong>1.4.21</strong>
            <p>發佈日期：<strong>2020 年 12 月 7 日</strong></p>
            <p><a href="https://github.com/JetBrains/kotlin/releases/tag/v1.4.21" target="_blank">在 GitHub 上查看版本</a></p>
        </td>
        <td>
            <p>Kotlin 1.4.20 的錯誤修正版本。</p>
            <p>進一步了解 <a href="whatsnew1420.md" target="_blank">Kotlin 1.4.20</a>。</p>
        </td>
    </tr>
    <tr>
        <td><strong>1.4.20</strong>
            <p>發佈日期：<strong>2020 年 11 月 23 日</strong></p>
            <p><a href="https://github.com/JetBrains/kotlin/releases/tag/v1.4.20" target="_blank">在 GitHub 上查看版本</a></p>
        </td>
        <td>
            <p>增量版本，包含多項改進，例如：</p>
            <list>
                <li>支援新 JVM 特性，如透過 <code>invokedynamic</code> 進行字串連接</li>
                <li>改進 Kotlin Multiplatform Mobile 專案的效能與例外處理</li>
                <li>JDK Path 擴充功能：<code>Path("dir") / "file.txt"</code></li>
            </list>
            <p>進一步了解：</p>
            <list>
                <li><a href="https://blog.jetbrains.com/kotlin/2020/11/kotlin-1-4-20-released/" target="_blank">發佈部落格文章</a></li>
                <li><a href="whatsnew1420.md" target="_blank">Kotlin 1.4.20 的新功能</a></li>
            </list>
        </td>
    </tr>
    <tr>
        <td><strong>1.4.10</strong>
            <p>發佈日期：<strong>2020 年 9 月 7 日</strong></p>
            <p><a href="https://github.com/JetBrains/kotlin/releases/tag/v1.4.10" target="_blank">在 GitHub 上查看版本</a></p>
        </td>
        <td>
            <p>Kotlin 1.4.0 的錯誤修正版本。</p>
            <p>進一步了解 <a href="https://blog.jetbrains.com/kotlin/2020/08/kotlin-1-4-released-with-a-focus-on-quality-and-performance/" target="_blank">Kotlin 1.4.0</a>。</p>
         </td>
    </tr>
    <tr>
        <td><strong>1.4.0</strong>
            <p>發佈日期：<strong>2020 年 8 月 17 日</strong></p>
            <p><a href="https://github.com/JetBrains/kotlin/releases/tag/v1.4.0" target="_blank">在 GitHub 上查看版本</a></p>
        </td>
        <td>
            <p>功能版本，包含許多主要著重於品質與效能的功能和改進。</p>
            <p>進一步了解：</p>
            <list>
                <li><a href="https://blog.jetbrains.com/kotlin/2020/08/kotlin-1-4-released-with-a-focus-on-quality-and-performance/" target="_blank">發佈部落格文章</a></li>
                <li><a href="whatsnew14.md" target="_blank">Kotlin 1.4.0 的新功能</a></li>
                <li><a href="compatibility-guide-14.md" target="_blank">相容性指南</a></li>
                <li><a href="whatsnew14.md#migrating-to-kotlin-1-4-0" target="_blank">遷移至 Kotlin 1.4.0</a></li>
            </list>
        </td>
    </tr>
    <tr>
        <td><strong>1.3.72</strong>
            <p>發佈日期：<strong>2020 年 4 月 15 日</strong></p>
            <p><a href="https://github.com/JetBrains/kotlin/releases/tag/v1.3.72" target="_blank">在 GitHub 上查看版本</a></p>
        </td>
        <td>
            <p>Kotlin 1.3.70 的錯誤修正版本。</p>
            <p>進一步了解 <a href="https://blog.jetbrains.com/kotlin/2020/03/kotlin-1-3-70-released/" target="_blank">Kotlin 1.3.70</a>。</p>
        </td>
    </tr>
</table>