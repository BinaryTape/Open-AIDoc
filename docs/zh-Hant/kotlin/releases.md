[//]: # (title: Kotlin 發佈流程)

<web-summary>了解 Kotlin 發佈的不同類型、如何更新至各個版本以及 Kotlin 的發佈歷程。</web-summary>

<tldr>
    <p>最新 Kotlin 版本：<strong>%kotlinVersion%</strong></p>
    <p>參閱 <a href="%kotlinLatestWhatsnew%">Kotlin 2.4.0 的新功能</a>，並在 <a href="%kotlinLatestUrl%">變更日誌</a> 中查看錯誤修正詳情。</p>
</tldr>

本頁面說明了 Kotlin 的發佈週期以及我們提供的不同發佈類型。其中也包含了過去與未來 Kotlin 發佈版本的詳細資訊，以及如何更新至特定版本的說明。

自 Kotlin 2.0.0 起，我們提供以下類型的發佈版本：

* _語言發佈 (Language releases)_ (2._x_._0_)：帶來語言的重大變更並包含工具更新。每 6 個月發佈一次。
* _工具發佈 (Tooling releases)_ (2._x_._20_)：在語言發佈之間提供，包含工具更新、效能改進與錯誤修正。在對應的 _語言發佈_ 後 3 個月發佈。
* _錯誤修正發佈 (Bug fix releases)_ (2._x_._yz_)：包含對 _工具發佈_ 的錯誤修正。這類版本沒有確切的發佈時程。

> 例如，對於語言發佈 2.2.0，僅有一個工具發佈 2.2.20 和一個錯誤修正發佈 2.2.21。
>
{style="tip"}

針對每個語言與工具發佈，我們也會提供數個預覽 (_EAP_) 版本，供您在功能正式發佈前進行嘗試。詳情請參閱 [參與 Kotlin 早期體驗預覽 (Early Access Preview)](eap.md)。

> 如果您希望收到新版本 Kotlin 的通知，請訂閱 [Kotlin 電子報](https://lp.jetbrains.com/subscribe-to-kotlin-news/)、關注 [X 上的 Kotlin](https://x.com/kotlin)，或在 [Kotlin GitHub 存儲庫](https://github.com/JetBrains/kotlin) 上啟用 **Watch | Custom | Releases** 選項。
> 
{style="note"}

## 未來的 Kotlin 發佈版本

以下是未來穩定版 Kotlin 發佈的大約時程：

* **2.4.20**：預計於 2026 年 9 月發佈
* **2.5.0**：預計於 2026 年 12 月發佈

## 更新至新的 Kotlin 版本

若要將您的專案升級至新版本，請在您的建構系統中更新 Kotlin 版本。

### Gradle

要更新至 Kotlin %kotlinVersion%，請修改您的 `build.gradle(.kts)` 檔案中 Kotlin Gradle 外掛程式的版本：

<tabs group="build-script">
<tab title="Kotlin" group-key="kotlin">

```kotlin
plugins {
    // 將 `<...>` 替換為適用於您目標環境的外掛程式名稱
    kotlin("<...>") version "%kotlinVersion%"
    // 例如，如果您的目標環境是 JVM：
    // kotlin("jvm") version "%kotlinVersion%"
    // 如果您的目標是 Kotlin Multiplatform：
    // kotlin("multiplatform") version "%kotlinVersion%"
}
```

</tab>
<tab title="Groovy" group-key="groovy">

```groovy
plugins {
    // 將 `<...>` 替換為適用於您目標環境的外掛程式名稱
    id 'org.jetbrains.kotlin.<...>' version '%kotlinVersion%'
    // 例如，如果您的目標環境是 JVM： 
    // id 'org.jetbrains.kotlin.jvm' version '%kotlinVersion%'
    // 如果您的目標是 Kotlin Multiplatform：
    // id 'org.jetbrains.kotlin.multiplatform' version '%kotlinVersion%'
}
```

</tab>
</tabs>

如果您有使用較早 Kotlin 版本建立的專案，請檢查是否也需要 [更新任何 kotlinx 程式庫的版本](gradle-configure-project.md#set-a-dependency-on-a-kotlinx-library)。

如果您正遷移至新的語言發佈版本，Kotlin 外掛程式的遷移工具將協助您完成此程序。

> 若要進一步了解如何在專案中使用 Gradle，請參閱 [配置 Gradle 專案](gradle-configure-project.md)。
> 
{style="tip"}

### Maven

要更新至 Kotlin %kotlinVersion%，請修改您的 `pom.xml` 檔案中的版本：

```xml
<properties>
    <kotlin.version>%kotlinVersion%</kotlin.version>
</properties>
```

或者，您也可以修改 `pom.xml` 檔案中 `kotlin-maven-plugin` 的版本：

```xml
<plugins>
    <plugin>
        <groupId>org.jetbrains.kotlin</groupId>
        <artifactId>kotlin-maven-plugin</artifactId>
        <version>%kotlinVersion%</version>
    </plugin>
</plugins>
```

如果您有使用較早 Kotlin 版本建立的專案，請檢查是否也需要 [更新任何 kotlinx 程式庫的版本](maven-set-dependencies.md#dependency-on-a-kotlinx-library)。

> 若要進一步了解如何在專案中使用 Maven，請參閱 [Maven](maven.md)。
>
{style="tip"}

## IDE 支援

Kotlin 在 [IntelliJ IDEA](https://www.jetbrains.com/idea/download/) 和 [Android Studio](https://developer.android.com/kotlin/get-started) 中擁有完整的開箱即用支援。

## 標準函式庫安全支援

自 Kotlin 2.4.0 起，針對 JVM 的 Kotlin 標準函式庫對每個發佈版本系列 (release line) 提供為期 18 個月的支援窗口。語言發佈 (2._x_._0_) 以及隨後的工具發佈 (2._x_._20_) 屬於同一個發佈版本系列 (2._x_)。

若我們發現影響 JVM 版 Kotlin 標準函式庫的安全漏洞，我們將同時發佈以下內容：

* 基於該發佈版本系列中包含安全修正之最新 Kotlin 版本的錯誤修正發佈。
* 針對處於有效支援窗口內之每個發佈版本系列的錯誤修正發佈。

例如，若我們發現一個安全漏洞且當時最新的 Kotlin 版本為 Kotlin 2.4.20，我們將僅針對 Kotlin 2.4.20 發佈錯誤修正版本。我們不會針對 Kotlin 2.4.0 發佈錯誤修正版本。

下表列出了所有 Kotlin 發佈版本及其支援窗口：

<table>
    <tr>
        <th>Kotlin 發佈版本系列</th>
        <th>發佈日期</th>
        <th>支援結束</th>
        <th>最新錯誤修正發佈</th>
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
            <p>2.4.10</p>
        </td>
    </tr>
</table>

> 我們隨時歡迎您回饋發現的任何安全問題。若要回報您在 Kotlin 中發現的問題，請直接在我們的 [問題追蹤器](https://youtrack.jetbrains.com/newIssue?project=KT&c=Type%20Security%20Problem) 上發布訊息，或傳送 [電子郵件](mailto:security@jetbrains.org) 給我們。
> 
{style="tip"}

## 發佈歷程

下表列出了先前 Kotlin 發佈版本的詳細資訊：

> 您也可以嘗試 [Kotlin 的早期體驗預覽 (EAP) 版本](eap.md#build-details)。
> 
{style="tip"}

<table>
    <tr>
        <th>組建資訊</th>
        <th>組建重點</th>
    </tr>
    <tr>
        <td><strong>2.4.10</strong>
            <p>發佈日期：<strong>2026 年 7 月 14 日</strong></p>
            <p><a href="https://github.com/JetBrains/kotlin/releases/tag/v2.4.10" target="_blank">在 GitHub 上查看版本</a></p>
        </td>
        <td>
            <p>Kotlin 2.4.0 的錯誤修正發佈。</p>
            <p>如需更多詳細資訊，請參閱 <a href="https://github.com/JetBrains/kotlin/releases/tag/v2.4.10">變更日誌</a>。</p>
        </td>
    </tr>
    <tr>
        <td><strong>2.4.0</strong>
            <p>發佈日期：<strong>2026 年 6 月 3 日</strong></p>
            <p><a href="https://github.com/JetBrains/kotlin/releases/tag/v2.4.0" target="_blank">在 GitHub 上查看版本</a></p>
        </td>
        <td>
            <p>語言發佈版本，包含新的與穩定的語言特性、工具更新、針對不同平台的效能改進以及重要修正。</p>
            <p>在 <a href="whatsnew24.md" target="_blank">Kotlin 2.4.0 的新功能</a> 中進一步了解 Kotlin 2.4.0。</p>
        </td>
    </tr>
    <tr>
        <td><strong>2.3.21</strong>
            <p>發佈日期：<strong>2026 年 4 月 23 日</strong></p>
            <p><a href="https://github.com/JetBrains/kotlin/releases/tag/v2.3.21" target="_blank">在 GitHub 上查看版本</a></p>
        </td>
        <td>
            <p>Kotlin 2.3.20 的錯誤修正發佈。</p>
            <p>如需更多詳細資訊，請參閱 <a href="https://github.com/JetBrains/kotlin/releases/tag/v2.3.21">變更日誌</a>。</p>
        </td>
    </tr>
    <tr>
        <td><strong>2.3.20</strong>
            <p>發佈日期：<strong>2026 年 3 月 16 日</strong></p>
            <p><a href="https://github.com/JetBrains/kotlin/releases/tag/v2.3.20" target="_blank">在 GitHub 上查看版本</a></p>
        </td>
        <td>
            <p>工具發佈版本，包含效能改進、錯誤修正與工具更新。</p>
            <p>如需更多詳細資訊，請參閱 <a href="https://github.com/JetBrains/kotlin/releases/tag/v2.3.20">變更日誌</a>。</p>
        </td>
    </tr>
    <tr>
        <td><strong>2.3.10</strong>
            <p>發佈日期：<strong>2026 年 2 月 5 日</strong></p>
            <p><a href="https://github.com/JetBrains/kotlin/releases/tag/v2.3.10" target="_blank">在 GitHub 上查看版本</a></p>
        </td>
        <td>
            <p>Kotlin 2.3.0 的錯誤修正發佈，包含效能改進，以及針對 <code>kotlinx.serialization</code> 罕見 <a href="https://youtrack.jetbrains.com/issue/KT-83984">競態條件 (race condition)</a> 的重要修正。</p>
            <p>如需更多詳細資訊，請參閱 <a href="https://github.com/JetBrains/kotlin/releases/tag/v2.3.10">變更日誌</a>。</p>
        </td>
    </tr>
    <tr>
        <td><strong>2.3.0</strong>
            <p>發佈日期：<strong>2025 年 12 月 16 日</strong></p>
            <p><a href="https://github.com/JetBrains/kotlin/releases/tag/v2.3.0" target="_blank">在 GitHub 上查看版本</a></p>
        </td>
        <td>
            <p>語言發佈版本，包含新的與穩定的語言特性、工具更新、針對不同平台的效能改進以及重要修正。</p>
            <p>在 <a href="whatsnew23.md" target="_blank">Kotlin 2.3.0 的新功能</a> 中進一步了解 Kotlin 2.3.0。</p>
        </td>
    </tr> 
    <tr>
        <td><strong>2.2.21</strong>
            <p>發佈日期：<strong>2025 年 10 月 23 日</strong></p>
            <p><a href="https://github.com/JetBrains/kotlin/releases/tag/v2.2.21" target="_blank">在 GitHub 上查看版本</a></p>
        </td>
        <td>
            <p>錯誤修正發佈，包含對 Xcode 26 的支援，以及其他改進與錯誤修正。</p>
            <p>如需更多詳細資訊，請參閱 <a href="https://github.com/JetBrains/kotlin/releases/tag/v2.2.21">變更日誌</a>。</p>
    </td>
    </tr>
    <tr>
        <td><strong>2.2.20</strong>
            <p>發佈日期：<strong>2025 年 9 月 10 日</strong></p>
            <p><a href="https://github.com/JetBrains/kotlin/releases/tag/v2.2.20" target="_blank">在 GitHub 上查看版本</a></p>
        </td>
        <td>
            <p>Kotlin 2.2.0 的工具發佈，包含對 Web 開發的重要變更及其他改進。</p>
            <p>在 <a href="whatsnew2220.md" target="_blank">Kotlin 2.2.20 的新功能</a> 中進一步了解 Kotlin 2.2.20。</p>
        </td>
    </tr>
    <tr>
        <td><strong>2.2.10</strong>
            <p>發佈日期：<strong>2025 年 8 月 14 日</strong></p>
            <p><a href="https://github.com/JetBrains/kotlin/releases/tag/v2.2.10" target="_blank">在 GitHub 上查看版本</a></p>
        </td>
        <td>
            <p>Kotlin 2.2.0 的錯誤修正發佈。</p>
            <p>如需更多詳細資訊，請參閱 <a href="https://github.com/JetBrains/kotlin/releases/tag/v2.2.10">變更日誌</a>。</p>
        </td>
    </tr>
    <tr>
        <td><strong>2.2.0</strong>
            <p>發佈日期：<strong>2025 年 6 月 23 日</strong></p>
            <p><a href="https://github.com/JetBrains/kotlin/releases/tag/v2.2.0" target="_blank">在 GitHub 上查看版本</a></p>
        </td>
        <td>
            <p>語言發佈版本，包含新的與穩定的語言特性、工具更新、針對不同平台的效能改進以及重要修正。</p>
            <p>在 <a href="whatsnew22.md" target="_blank">Kotlin 2.2.0 的新功能</a> 中進一步了解 Kotlin 2.2.0。</p>
        </td>
    </tr> 
    <tr>
        <td><strong>2.1.21</strong>
            <p>發佈日期：<strong>2025 年 5 月 13 日</strong></p>
            <p><a href="https://github.com/JetBrains/kotlin/releases/tag/v2.1.21" target="_blank">在 GitHub 上查看版本</a></p>
        </td>
        <td>
            <p>Kotlin 2.1.20 的錯誤修正發佈。</p>
            <p>如需更多詳細資訊，請參閱 <a href="https://github.com/JetBrains/kotlin/releases/tag/v2.1.21">變改日誌</a>。</p>
        </td>
    </tr> 
   <tr>
        <td><strong>2.1.20</strong>
            <p>發佈日期：<strong>2025 年 3 月 20 日</strong></p>
            <p><a href="https://github.com/JetBrains/kotlin/releases/tag/v2.1.20" target="_blank">在 GitHub 上查看版本</a></p>
        </td>
        <td>
           <p>Kotlin 2.1.0 的工具發佈，包含新的實驗性功能、效能改進與錯誤修正。</p>
            <p>在 <a href="whatsnew2120.md" target="_blank">Kotlin 2.1.20 的新功能</a> 中進一步了解 Kotlin 2.1.20。</p>
        </td>
    </tr>
    <tr>
        <td><strong>2.1.10</strong>
            <p>發佈日期：<strong>2025 年 1 月 27 日</strong></p>
            <p><a href="https://github.com/JetBrains/kotlin/releases/tag/v2.1.10" target="_blank">在 GitHub 上查看版本</a></p>
        </td>
        <td>
            <p>Kotlin 2.1.0 的錯誤修正發佈</p>
            <p>如需更多詳細資訊，請參閱 <a href="https://github.com/JetBrains/kotlin/releases/tag/v2.1.10">變更日誌</a>。</p>
        </td>
    </tr>
    <tr>
        <td><strong>2.1.0</strong>
            <p>發佈日期：<strong>2024 年 11 月 27 日</strong></p>
            <p><a href="https://github.com/JetBrains/kotlin/releases/tag/v2.1.0" target="_blank">在 GitHub 上查看版本</a></p>
        </td>
        <td>
            <p>引入新語言特性的語言發佈版本。</p>
            <p>在 <a href="whatsnew21.md" target="_blank">Kotlin 2.1.0 的新功能</a> 中進一步了解 Kotlin 2.1.0。</p>
        </td>
    </tr>
    <tr>
        <td><strong>2.0.21</strong>
            <p>發佈日期：<strong>2024 年 10 月 10 日</strong></p>
            <p><a href="https://github.com/JetBrains/kotlin/releases/tag/v2.0.21" target="_blank">在 GitHub 上查看版本</a></p>
        </td>
        <td>
            <p>Kotlin 2.0.20 的錯誤修正發佈</p>
            <p>如需更多詳細資訊，請參閱 <a href="https://github.com/JetBrains/kotlin/releases/tag/v2.0.21">變更日誌</a>。</p>
        </td>
    </tr>
    <tr>
        <td><strong>2.0.20</strong>
            <p>發佈日期：<strong>2024 年 8 月 22 日</strong></p>
            <p><a href="https://github.com/JetBrains/kotlin/releases/tag/v2.0.20" target="_blank">在 GitHub 上查看版本</a></p>
        </td>
        <td>
           <p>Kotlin 2.0.0 的工具發佈，包含效能改進與錯誤修正。功能還包括 Kotlin/Native 垃圾收集器的並行標記、Kotlin 通用標準函式庫中的 UUID 支援、Compose 編譯器更新，以及對 Gradle 8.8 的支援。
            </p>
            <p>在 <a href="whatsnew2020.md" target="_blank">Kotlin 2.0.20 的新功能</a> 中進一步了解 Kotlin 2.0.20。</p>
        </td>
    </tr>
    <tr>
        <td><strong>2.0.10</strong>
            <p>發佈日期：<strong>2024 年 8 月 6 日</strong></p>
            <p><a href="https://github.com/JetBrains/kotlin/releases/tag/v2.0.10" target="_blank">在 GitHub 上查看版本</a></p>
        </td>
        <td>
            <p>Kotlin 2.0.0 的錯誤修正發佈。</p>
            <p>在 <a href="whatsnew20.md" target="_blank">Kotlin 2.0.0 的新功能</a> 中進一步了解 Kotlin 2.0.0。</p>
        </td>
    </tr>
    <tr>
        <td><strong>2.0.0</strong>
            <p>發佈日期：<strong>2024 年 5 月 21 日</strong></p>
            <p><a href="https://github.com/JetBrains/kotlin/releases/tag/v2.0.0" target="_blank">在 GitHub 上查看版本</a></p>
        </td>
        <td>
            <p>搭載穩定版 Kotlin K2 編譯器的語言發佈版本。</p>
            <p>在 <a href="whatsnew20.md" target="_blank">Kotlin 2.0.0 的新功能</a> 中進一步了解 Kotlin 2.0.0。</p>
        </td>
    </tr>
    <tr>
        <td><strong>1.9.25</strong>
            <p>發佈日期：<strong>2024 年 7 月 19 日</strong></p>
            <p><a href="https://github.com/JetBrains/kotlin/releases/tag/v1.9.25" target="_blank">在 GitHub 上查看版本</a></p>
        </td>
        <td>
            <p>Kotlin 1.9.20、1.9.21、1.9.22、1.9.23 與 1.9.24 的錯誤修正發佈。</p>
            <p>在 <a href="whatsnew1920.md" target="_blank">Kotlin 1.9.20 的新功能</a> 中進一步了解 Kotlin 1.9.20。</p>
        </td>
    </tr>
    <tr>
        <td><strong>1.9.24</strong>
            <p>發佈日期：<strong>2024 年 5 月 7 日</strong></p>
            <p><a href="https://github.com/JetBrains/kotlin/releases/tag/v1.9.24" target="_blank">在 GitHub 上查看版本</a></p>
        </td>
        <td>
            <p>Kotlin 1.9.20、1.9.21、1.9.22 與 1.9.23 的錯誤修正發佈。</p>
            <p>在 <a href="whatsnew1920.md" target="_blank">Kotlin 1.9.20 的新功能</a> 中進一步了解 Kotlin 1.9.20。</p>
        </td>
    </tr>
    <tr>
        <td><strong>1.9.23</strong>
            <p>發佈日期：<strong>2024 年 3 月 7 日</strong></p>
            <p><a href="https://github.com/JetBrains/kotlin/releases/tag/v1.9.23" target="_blank">在 GitHub 上查看版本</a></p>
        </td>
        <td>
            <p>Kotlin 1.9.20、1.9.21 與 1.9.22 的錯誤修正發佈。</p>
            <p>在 <a href="whatsnew1920.md" target="_blank">Kotlin 1.9.20 的新功能</a> 中進一步了解 Kotlin 1.9.20。</p>
        </td>
    </tr>
    <tr>
        <td><strong>1.9.22</strong>
            <p>發佈日期：<strong>2023 年 12 月 21 日</strong></p>
            <p><a href="https://github.com/JetBrains/kotlin/releases/tag/v1.9.22" target="_blank">在 GitHub 上查看版本</a></p>
        </td>
        <td>
            <p>Kotlin 1.9.20 與 1.9.21 的錯誤修正發佈。</p>
            <p>在 <a href="whatsnew1920.md" target="_blank">Kotlin 1.9.20 的新功能</a> 中進一步了解 Kotlin 1.9.20。</p>
        </td>
    </tr>
    <tr>
        <td><strong>1.9.21</strong>
            <p>發佈日期：<strong>2023 年 11 月 23 日</strong></p>
            <p><a href="https://github.com/JetBrains/kotlin/releases/tag/v1.9.21" target="_blank">在 GitHub 上查看版本</a></p>
        </td>
        <td>
            <p>Kotlin 1.9.20 的錯誤修正發佈。</p>
            <p>在 <a href="whatsnew1920.md" target="_blank">Kotlin 1.9.20 的新功能</a> 中進一步了解 Kotlin 1.9.20。</p>
        </td>
    </tr>
    <tr>
        <td><strong>1.9.20</strong>
            <p>發佈日期：<strong>2023 年 11 月 1 日</strong></p>
            <p><a href="https://github.com/JetBrains/kotlin/releases/tag/v1.9.20" target="_blank">在 GitHub 上查看版本</a></p>
        </td>
        <td>
            <p>功能發佈版本，包含 Beta 階段的 Kotlin K2 編譯器與穩定版 Kotlin Multiplatform。</p>
            <p>了解更多資訊：</p>
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
            <p>Kotlin 1.9.0 的錯誤修正發佈。</p>
            <p>在 <a href="whatsnew19.md" target="_blank">Kotlin 1.9.0 的新功能</a> 中進一步了解 Kotlin 1.9.0。</p>
            <note>對於 Android Studio Giraffe 和 Hedgehog，Kotlin 外掛程式 1.9.10 將隨未來的 Android Studio 更新提供。</note>
        </td>
    </tr>
    <tr>
        <td><strong>1.9.0</strong>
            <p>發佈日期：<strong>2023 年 7 月 6 日</strong></p>
            <p><a href="https://github.com/JetBrains/kotlin/releases/tag/v1.9.0" target="_blank">在 GitHub 上查看版本</a></p>
        </td>
        <td>
            <p>功能發佈版本，包含 Kotlin K2 編譯器更新、新的列舉類別 values 函式、新的開放式範圍 (open-ended ranges) 運算子、Kotlin Multiplatform 中 Gradle 配置快取的預覽、Kotlin Multiplatform 對 Android 目標支援的變更，以及 Kotlin/Native 中自定義記憶體分配器的預覽。
            </p>
            <p>了解更多資訊：</p>
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
            <p>Kotlin 1.8.20 的錯誤修正發佈。</p>
            <p>在 <a href="whatsnew1820.md" target="_blank">Kotlin 1.8.20 的新功能</a> 中進一步了解 Kotlin 1.8.20。</p>
        </td>
    </tr>
    <tr>
        <td><strong>1.8.21</strong>
            <p>發佈日期：<strong>2023 年 4 月 25 日</strong></p>
            <p><a href="https://github.com/JetBrains/kotlin/releases/tag/v1.8.21" target="_blank">在 GitHub 上查看版本</a></p>
        </td>
        <td>
            <p>Kotlin 1.8.20 的錯誤修正發佈。</p>
            <p>在 <a href="whatsnew1820.md" target="_blank">Kotlin 1.8.20 的新功能</a> 中進一步了解 Kotlin 1.8.20。</p>
            <note>對於 Android Studio Flamingo 和 Giraffe，Kotlin 外掛程式 1.8.21 將隨未來的 Android Studio 更新提供。</note>
        </td>
    </tr>
    <tr>
        <td><strong>1.8.20</strong>
            <p>發佈日期：<strong>2023 年 4 月 3 日</strong></p>
            <p><a href="https://github.com/JetBrains/kotlin/releases/tag/v1.8.20" target="_blank">在 GitHub 上查看版本</a></p>
        </td>
        <td>
            <p>功能發佈版本，包含 Kotlin K2 編譯器更新、AutoCloseable 介面、stdlib 中的 Base64 編碼、預設啟用的新 JVM 增量編譯，以及新的 Kotlin/Wasm 編譯器後端。
            </p>
            <p>了解更多資訊：</p>
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
            <p>Kotlin 1.8.0 的錯誤修正發佈。</p>
            <p>進一步了解 <a href="https://github.com/JetBrains/kotlin/releases/tag/v1.8.0" target="_blank">Kotlin 1.8.0</a>。</p>
            <note>對於 Android Studio Electric Eel 和 Flamingo，Kotlin 外掛程式 1.8.10 將隨未來的 Android Studio 更新提供。</note>
        </td>
    </tr>
    <tr>
        <td><strong>1.8.0</strong>
            <p>發佈日期：<strong>2022 年 12 月 28 日</strong></p>
            <p><a href="https://github.com/JetBrains/kotlin/releases/tag/v1.8.0" target="_blank">在 GitHub 上查看版本</a></p>
        </td>
        <td>
            <p>功能發佈版本，改進了 kotlin-reflect 的效能、新增了針對 JVM 的遞迴複製或刪除目錄內容的實驗性函式，並改進了 Objective-C/Swift 的互通性。</p>
            <p>了解更多資訊：</p>
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
            <p>Kotlin 1.7.20 的錯誤修正發佈。</p>
            <p>在 <a href="whatsnew1720.md" target="_blank">Kotlin 1.7.20 的新功能</a> 中進一步了解 Kotlin 1.7.20。</p>
            <note>對於 Android Studio Dolphin、Electric Eel 和 Flamingo，Kotlin 外掛程式 1.7.21 將隨未來的 Android Studio 更新提供。</note>
        </td>
    </tr>
    <tr>
        <td><strong>1.7.20</strong>
            <p>發佈日期：<strong>2022 年 9 月 29 日</strong></p>
            <p><a href="https://github.com/JetBrains/kotlin/releases/tag/v1.7.20" target="_blank">在 GitHub 上查看版本</a></p>
        </td>
        <td>
            <p>增量發佈版本，包含新的語言特性、Kotlin K2 編譯器中對多個編譯器外掛程式的支援、預設啟用的新 Kotlin/Native 記憶體管理員，以及對 Gradle 7.1 的支援。</p>
            <p>了解更多資訊：</p>
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
            <p>Kotlin 1.7.0 的錯誤修正發佈。</p>
            <p>進一步了解 <a href="https://github.com/JetBrains/kotlin/releases/tag/v1.7.0" target="_blank">Kotlin 1.7.0</a>。</p>
            <note>對於 Android Studio Dolphin (213) 和 Android Studio Electric Eel (221)，Kotlin 外掛程式 1.7.10 將隨未來的 Android Studio 更新提供。</note>
        </td>
    </tr>
    <tr>
        <td><strong>1.7.0</strong>
            <p>發佈日期：<strong>2022 年 6 月 9 日</strong></p>
            <p><a href="https://github.com/JetBrains/kotlin/releases/tag/v1.7.0" target="_blank">在 GitHub 上查看版本</a></p>
        </td>
        <td>
            <p>功能發佈版本，包含針對 JVM 的 Alpha 階段 Kotlin K2 編譯器、穩定化的語言特性、效能改進，以及如穩定化實驗性 API 等演進性變更。</p>
            <p>了解更多資訊：</p>
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
            <p>Kotlin 1.6.20 的錯誤修正發佈。</p>
            <p>進一步了解 <a href="whatsnew1620.md" target="_blank">Kotlin 1.6.20</a>。</p>
        </td>
    </tr>
    <tr>
        <td><strong>1.6.20</strong>
            <p>發佈日期：<strong>2022 年 4 月 4 日</strong></p>
            <p><a href="https://github.com/JetBrains/kotlin/releases/tag/v1.6.20" target="_blank">在 GitHub 上查看版本</a></p>
        </td>
        <td>
            <p>包含多項改進的增量發佈版本，例如：</p>
            <list>
                <li>上下文接收器 (context receivers) 原型</li>
                <li>指向功能介面建構函式的可呼叫參照</li>
                <li>Kotlin/Native：新記憶體管理員的效能改進</li>
                <li>Multiplatform：預設使用階層式專案結構</li>
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
            <p>Kotlin 1.6.0 的錯誤修正發佈。</p>
            <p>進一步了解 <a href="https://github.com/JetBrains/kotlin/releases/tag/v1.6.0" target="_blank">Kotlin 1.6.0</a>。</p>
        </td>
    </tr>
    <tr>
        <td><strong>1.6.0</strong>
            <p>發佈日期：<strong>2021 年 11 月 16 日</strong></p>
            <p><a href="https://github.com/JetBrains/kotlin/releases/tag/v1.6.0" target="_blank">在 GitHub 上查看版本</a></p>
        </td>
        <td>
            <p>功能發佈版本，包含新語言特性、效能改進，以及如穩定化實驗性 API 等演進性變更。</p>
            <p>了解更多資訊：</p>
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
            <p>Kotlin 1.5.31 的錯誤修正發佈。</p>
            <p>進一步了解 <a href="whatsnew1530.md" target="_blank">Kotlin 1.5.30</a>。</p>
        </td>
    </tr>
    <tr>
        <td><strong>1.5.31</strong>
            <p>發佈日期：<strong>2021 年 9 月 20 日</strong></p>
            <p><a href="https://github.com/JetBrains/kotlin/releases/tag/v1.5.31" target="_blank">在 GitHub 上查看版本</a></p>
        </td>
        <td>
            <p>Kotlin 1.5.30 的錯誤修正發佈。</p>
            <p>進一步了解 <a href="whatsnew1530.md" target="_blank">Kotlin 1.5.30</a>。</p>
        </td>
    </tr>
    <tr>
        <td><strong>1.5.30</strong>
            <p>發佈日期：<strong>2021 年 8 月 23 日</strong></p>
            <p><a href="https://github.com/JetBrains/kotlin/releases/tag/v1.5.30" target="_blank">在 GitHub 上查看版本</a></p>
        </td>
        <td>
            <p>包含多項改進的增量發佈版本，例如：</p>
            <list>
                <li>在 JVM 上具現化註解類別</li>
                <li>改進的選擇性使用 (opt-in) 需求機制與型別推論</li>
                <li>Beta 階段的 Kotlin/JS IR 後端</li>
                <li>對 Apple Silicon 目標的支援</li>
                <li>改進的 CocoaPods 支援</li>
                <li>Gradle：Java 工具鏈支援與改進的背景工作配置</li>
            </list>
            <p>了解更多資訊：</p>
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
            <p>Kotlin 1.5.20 的錯誤修正發佈。</p>
            <p>進一步了解 <a href="whatsnew1520.md" target="_blank">Kotlin 1.5.20</a>。</p>
        </td>
    </tr>
    <tr>
        <td><strong>1.5.20</strong>
            <p>發佈日期：<strong>2021 年 6 月 24 日</strong></p>
            <p><a href="https://github.com/JetBrains/kotlin/releases/tag/v1.5.20" target="_blank">在 GitHub 上查看版本</a></p>
        </td>
        <td>
            <p>包含多項改進的增量發佈版本，例如：</p>
            <list>
                <li>JVM 上預設透過 <code>invokedynamic</code> 進行字串連接</li>
                <li>對 Lombok 的改進支援以及對 JSpecify 的支援</li>
                <li>Kotlin/Native：匯出 KDoc 至 Objective-C 標頭，以及單一陣列內更快的 <code>Array.copyInto()</code></li>
                <li>Gradle：註解處理器類別載入器的快取，以及對 <code>--parallel</code> Gradle 屬性的支援</li>
                <li>對齊跨平台 stdlib 函式的行為</li>
            </list>
            <p>了解更多資訊：</p>
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
            <p>Kotlin 1.5.0 的錯誤修正發佈。</p>
            <p>進一步了解 <a href="https://blog.jetbrains.com/kotlin/2021/05/kotlin-1-5-0-released/" target="_blank">Kotlin 1.5.0</a>。</p>
        </td>
    </tr>
    <tr>
        <td><strong>1.5.0</strong>
            <p>發佈日期：<strong>2021 年 5 月 5 日</strong></p>
            <p><a href="https://github.com/JetBrains/kotlin/releases/tag/v1.5.0" target="_blank">在 GitHub 上查看版本</a></p>
        </td>
        <td>
            <p>功能發佈版本，包含新語言特性、效能改進，以及如穩定化實驗性 API 等演進性變更。</p>
            <p>了解更多資訊：</p>
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
            <p>Kotlin 1.4.30 的錯誤修正發佈。</p>
            <p>進一步了解 <a href="whatsnew1430.md" target="_blank">Kotlin 1.4.30</a>。</p>
        </td>
    </tr>
    <tr>
        <td><strong>1.4.31</strong>
            <p>發佈日期：<strong>2021 年 2 月 25 日</strong></p>
            <p><a href="https://github.com/JetBrains/kotlin/releases/tag/v1.4.31" target="_blank">在 GitHub 上查看版本</a></p>
        </td>
        <td>
            <p>Kotlin 1.4.30 的錯誤修正發佈</p>
            <p>進一步了解 <a href="whatsnew1430.md" target="_blank">Kotlin 1.4.30</a>。</p>
        </td>
    </tr>
    <tr>
        <td><strong>1.4.30</strong>
            <p>發佈日期：<strong>2021 年 2 月 3 日</strong></p>
            <p><a href="https://github.com/JetBrains/kotlin/releases/tag/v1.4.30" target="_blank">在 GitHub 上查看版本</a></p>
        </td>
        <td>
            <p>包含多項改進的增量發佈版本，例如：</p>
            <list>
                <li>處於 Beta 階段的新 JVM 後端</li>
                <li>新語言特性的預覽</li>
                <li>改進的 Kotlin/Native 效能</li>
                <li>標準函式庫 API 改進</li>
            </list>
            <p>了解更多資訊：</p>
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
            <p>Kotlin 1.4.20 的錯誤修正發佈</p>
            <p>進一步了解 <a href="whatsnew1420.md" target="_blank">Kotlin 1.4.20</a>。</p>
        </td>
    </tr>
    <tr>
        <td><strong>1.4.20</strong>
            <p>發佈日期：<strong>2020 年 11 月 23 日</strong></p>
            <p><a href="https://github.com/JetBrains/kotlin/releases/tag/v1.4.20" target="_blank">在 GitHub 上查看版本</a></p>
        </td>
        <td>
            <p>包含多項改進的增量發佈版本，例如：</p>
            <list>
                <li>支援新的 JVM 特性，如透過 <code>invokedynamic</code> 進行字串連接</li>
                <li>針對 Kotlin Multiplatform Mobile 專案改進的效能與例外處理</li>
                <li>JDK Path 擴充：<code>Path("dir") / "file.txt"</code></li>
            </list>
            <p>了解更多資訊：</p>
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
            <p>Kotlin 1.4.0 的錯誤修正發佈。</p>
            <p>進一步了解 <a href="https://blog.jetbrains.com/kotlin/2020/08/kotlin-1-4-released-with-a-focus-on-quality-and-performance/" target="_blank">Kotlin 1.4.0</a>。</p>
         </td>
    </tr>
    <tr>
        <td><strong>1.4.0</strong>
            <p> 發佈日期：<strong>2020 年 8 月 17 日</strong></p>
            <p><a href="https://github.com/JetBrains/kotlin/releases/tag/v1.4.0" target="_blank">在 GitHub 上查看版本</a></p>
        </td>
        <td>
            <p>功能發佈版本，包含多項功能與改進，主要專注於品質與效能。</p>
            <p>了解更多資訊：</p>
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
            <p> 發佈日期：<strong>2020 年 4 月 15 日</strong></p>
            <p><a href="https://github.com/JetBrains/kotlin/releases/tag/v1.3.72" target="_blank">在 GitHub 上查看版本</a></p>
        </td>
        <td>
            <p>Kotlin 1.3.70 的錯誤修正發佈。</p>
            <p>進一步了解 <a href="https://blog.jetbrains.com/kotlin/2020/03/kotlin-1-3-70-released/" target="_blank">Kotlin 1.3.70</a>。</p>
        </td>
    </tr>
</table>