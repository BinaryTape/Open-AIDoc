[//]: # (title: Dokka 外掛程式)

> 本指南適用於 Dokka Gradle 外掛程式 (DGP) v2 模式。DGP v1 模式已不再受支援。
> 若要從 v1 升級至 v2 模式，請遵循[遷移指南](dokka-migration.md)。
>
{style="note"}

Dokka 從一開始就被設計為易於擴充且高度可自訂，這讓社群能夠針對開箱即用未提供的缺失功能或非常特定的功能來實作外掛程式。

Dokka 外掛程式的範圍十分廣泛，從支援其他程式語言原始碼到各種特殊的輸出格式應有盡有。你可以新增對自訂 KDoc 標籤或註解的支援、教 Dokka 如何轉譯在 KDoc 描述中出現的不同 DSL、在視覺上重新設計 Dokka 頁面以便無縫整合到貴公司的網站中，或是將其與其他工具整合等等。 

如果你想了解如何建立 Dokka 外掛程式，請參閱[開發人員指南](https://kotlin.github.io/dokka/%dokkaVersion%/developer_guide/introduction/)。

## 套用 Dokka 外掛程式 {id="apply-dokka-plugins"}

Dokka 外掛程式是作為獨立的構件發佈的，因此若要套用 Dokka 外掛程式，你只需要將其新增為相依性即可。接著外掛程式會自行擴充 Dokka，無需採取進一步的操作。

> 使用相同擴充點或以類似方式運作的外掛程式可能會相互干擾。
> 這可能會導致視覺錯誤、一般未定義行為甚至是建置失敗。然而，這不應該導致並行問題，因為 Dokka 不會公開任何可變資料結構或物件。
>
> 如果你注意到類似的問題，建議檢查已套用了哪些外掛程式以及它們各自的功能。
> 
{style="note"}

讓我們來看看如何將 [mathjax 外掛程式](https://github.com/Kotlin/dokka/tree/%dokkaVersion%/dokka-subprojects/plugin-mathjax)套用到你的專案中：

<tabs group="build-script">
<tab title="Gradle Kotlin DSL" group-key="kotlin">

```kotlin
plugins {
    id("org.jetbrains.dokka") version "%dokkaVersion%"
}

dependencies {
    dokkaPlugin("org.jetbrains.dokka:mathjax-plugin")
}
```

> * 內建外掛程式（例如 HTML 和 Javadoc）一律會自動套用。你只需要對其進行設定，無需對其宣告相依性。
>
> * 為多模組專案（多專案建置）產生文件時，你需要[跨子專案共用 Dokka 設定與外掛程式](dokka-gradle.md#multi-project-configuration)。
> 
{style="note"}

</tab>
<tab title="Gradle Groovy DSL" group-key="groovy">

```groovy
plugins {
    id 'org.jetbrains.dokka' version '%dokkaVersion%'
}

dependencies {
    dokkaPlugin 'org.jetbrains.dokka:mathjax-plugin'
}
```

> 為[多專案](dokka-gradle.md#multi-project-configuration)建置產生文件時，
> 你需要[跨子專案共用 Dokka 設定](dokka-gradle.md#multi-project-configuration)。
>
{style="note"}

</tab>
<tab title="Maven" group-key="mvn">

```xml
<plugin>
    <groupId>org.jetbrains.dokka</groupId>
    <artifactId>dokka-maven-plugin</artifactId>
    ...
    <configuration>
        <dokkaPlugins>
            <plugin>
                <groupId>org.jetbrains.dokka</groupId>
                <artifactId>mathjax-plugin</artifactId>
                <version>%dokkaVersion%</version>
            </plugin>
        </dokkaPlugins>
    </configuration>
</plugin>
```

</tab>
<tab title="CLI" group-key="cli">

如果你使用帶有[命令列選項](dokka-cli.md#run-with-command-line-options)的 [CLI](dokka-cli.md) 執行器，Dokka 外掛程式應作為 `.jar` 檔案傳遞給 `-pluginsClasspath`：

```Shell
java -jar dokka-cli-%dokkaVersion%.jar \
     -pluginsClasspath "./dokka-base-%dokkaVersion%.jar;...;./mathjax-plugin-%dokkaVersion%.jar" \
     ...
```

如果你使用 [JSON 設定](dokka-cli.md#run-with-json-configuration)，Dokka 外掛程式應在 `pluginsClasspath` 下指定。

```json
{
  ...
  "pluginsClasspath": [
    "./dokka-base-%dokkaVersion%.jar",
    "...",
    "./mathjax-plugin-%dokkaVersion%.jar"
  ],
  ...
}
```

</tab>
</tabs>

## 設定 Dokka 外掛程式 {id="configure-dokka-plugins"}

Dokka 外掛程式本身也可以擁有設定選項。若要查看有哪些可用選項，請查閱你正在使用的外掛程式文件。

讓我們來看看如何設定內建的 HTML 外掛程式，透過將自訂圖片新增至資源（`customAssets` 選項）、自訂樣式表（`customStyleSheets` 選項）以及修改頁尾訊息（`footerMessage` 選項）：

<tabs group="build-script">
<tab title="Gradle Kotlin DSL" group-key="kotlin">

若要以型別安全的方式設定 Dokka 外掛程式，請使用 `dokka.pluginsConfiguration {}` 區塊：

```kotlin
dokka {
    pluginsConfiguration.html {
        customAssets.from("logo.png")
        customStyleSheets.from("styles.css")
        footerMessage.set("(c) Your Company")
    }
}
```

有關 Dokka 外掛程式設定的範例，請參閱 [Dokka 的版本控制外掛程式](https://github.com/Kotlin/dokka/tree/master/examples/gradle-v2/versioning-multimodule-example)。

Dokka 允許你透過[設定自訂外掛程式](https://github.com/Kotlin/dokka/blob/v2.3.0/examples/gradle-v2/custom-dokka-plugin-example/demo-library/build.gradle.kts)來擴充其功能並修改文件產生流程。

</tab>
<tab title="Gradle Groovy DSL" group-key="groovy">

```groovy
dokka {
    pluginsConfiguration {
        html {
            customAssets.from("logo.png")
            customStyleSheets.from("styles.css")
            footerMessage.set("(c) Your Company")
        }
    }
}
```

</tab>
<tab title="Maven" group-key="mvn">

```xml
<plugin>
    <groupId>org.jetbrains.dokka</groupId>
    <artifactId>dokka-maven-plugin</artifactId>
    ...
    <configuration>
        <pluginsConfiguration>
            <!-- 完全限定外掛程式名稱 -->
            <org.jetbrains.dokka.base.DokkaBase>
                <!-- 依名稱的選項 -->
                <customAssets>
                    <asset>${project.basedir}/my-image.png</asset>
                </customAssets>
                <customStyleSheets>
                    <stylesheet>${project.basedir}/my-styles.css</stylesheet>
                </customStyleSheets>
                <footerMessage>(c) MyOrg 2022 Maven</footerMessage>
            </org.jetbrains.dokka.base.DokkaBase>
        </pluginsConfiguration>
    </configuration>
</plugin>
```

</tab>
<tab title="CLI" group-key="cli">

如果你使用帶有[命令列選項](dokka-cli.md#run-with-command-line-options)的 [CLI](dokka-cli.md) 執行器，請使用 `-pluginsConfiguration` 選項，該選項接受形式為 `fullyQualifiedPluginName=json` 的 JSON 設定。

如果你需要設定多個外掛程式，可以傳遞多個以 `^^` 分隔的值。

```Bash
java -jar dokka-cli-%dokkaVersion%.jar \
     ...
     -pluginsConfiguration "org.jetbrains.dokka.base.DokkaBase={\"customAssets\": [\"my-image.png\"], \"customStyleSheets\": [\"my-styles.css\"], \"footerMessage\": \"(c) 2022 MyOrg CLI\"}"
```

如果你使用 [JSON 設定](dokka-cli.md#run-with-json-configuration)，則存在類似的 `pluginsConfiguration` 陣列，它在 `values` 中接受 JSON 設定。

```json
{
  "moduleName": "Dokka Example",
  "pluginsConfiguration": [
    {
      "fqPluginName": "org.jetbrains.dokka.base.DokkaBase",
      "serializationFormat": "JSON",
      "values": "{\"customAssets\": [\"my-image.png\"], \"customStyleSheets\": [\"my-styles.css\"], \"footerMessage\": \"(c) 2022 MyOrg\"}"
    }
  ]
}
```

</tab>
</tabs>

## 值得關注的外掛程式 {id="notable-plugins"}

以下是一些你可能會覺得有用的 Dokka 外掛程式：

| **名稱** | **描述** |
|---|---|
| [Android documentation plugin](https://github.com/Kotlin/dokka/tree/%dokkaVersion%/dokka-subprojects/plugin-android-documentation) | 改善 Android 上的文件體驗 |
| [Versioning plugin](https://github.com/Kotlin/dokka/tree/%dokkaVersion%/dokka-subprojects/plugin-versioning) | 新增版本選擇器，並有助於為應用程式／程式庫的不同版本組織文件 |
| [MermaidJS HTML plugin](https://github.com/glureau/dokka-mermaid) | 轉譯 KDoc 中的 [MermaidJS](https://mermaid-js.github.io/mermaid/#/) 圖表和視覺化內容 |
| [Mathjax HTML plugin](https://github.com/Kotlin/dokka/tree/%dokkaVersion%/dokka-subprojects/plugin-mathjax) | 美化輸出 KDoc 中的數學公式 |
| [Kotlin as Java plugin](https://github.com/Kotlin/dokka/tree/%dokkaVersion%/dokka-subprojects/plugin-kotlin-as-java) | 從 Java 的角度轉譯 Kotlin 簽章 |
| [GFM plugin](https://github.com/Kotlin/dokka/tree/master/dokka-subprojects/plugin-gfm) | 新增以 GitHub Flavored Markdown 格式產生文件的功能 |
| [Jekyll plugin](https://github.com/Kotlin/dokka/tree/master/dokka-subprojects/plugin-jekyll) | 新增以 Jekyll Flavored Markdown 格式產生文件的功能 |

如果你是 Dokka 外掛程式作者，並希望將你的外掛程式新增至此清單，請透過 [Slack](dokka-introduction.md#community) 或 [GitHub](https://github.com/Kotlin/dokka/) 與維護人員聯絡。