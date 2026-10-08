[//]: # (title: CLI)

如果出於某種原因你無法使用 [Gradle](dokka-gradle.md) 或 [Maven](dokka-maven.md) 建置工具，Dokka 提供了一個命令列 (CLI) 執行器來產生文件。

相比之下，它具有與 Dokka 的 Gradle 外掛程式相同（甚至更多）的功能。儘管由於沒有自動配置，設定起來會困難得多，特別是在多平台和多模組環境中。

## 快速入門 {id="get-started"}

CLI 執行器以單獨的可執行構件形式發佈到 Maven Central。

你可以在 [Maven Central](https://central.sonatype.com/artifact/org.jetbrains.dokka/dokka-cli) 上找到它，或 [直接下載](https://repo1.maven.org/maven2/org/jetbrains/dokka/dokka-cli/%dokkaVersion%/dokka-cli-%dokkaVersion%.jar)。

將 `dokka-cli-%dokkaVersion%.jar` 檔案儲存在你的電腦上後，使用 `-help` 選項執行它以查看所有可用的配置選項及其描述：

```Bash
java -jar dokka-cli-%dokkaVersion%.jar -help
```

它也適用於某些解除嵌套的選項，例如 `-sourceSet`：

```Bash
java -jar dokka-cli-%dokkaVersion%.jar -sourceSet -help
```

## 產生文件 {id="generate-documentation"}

### 先決條件 {id="prerequisites"}

由於沒有建置工具來管理相依性，你必須自行提供相依性的 `.jar` 檔案。

以下是任何輸出格式都需要的相依性：

| **Group**             | **Artifact**                  | **Version**    | **Link**                                                                                                                                                 |
|-----------------------|-------------------------------|----------------|----------------------------------------------------------------------------------------------------------------------------------------------------------|
| `org.jetbrains.dokka` | `dokka-base`                  | %dokkaVersion% | [下載](https://repo1.maven.org/maven2/org/jetbrains/dokka/dokka-base/%dokkaVersion%/dokka-base-%dokkaVersion%.jar)                                   |
| `org.jetbrains.dokka` | `analysis-kotlin-symbols` | %dokkaVersion% | [下載](https://repo1.maven.org/maven2/org/jetbrains/dokka/analysis-kotlin-symbols/%dokkaVersion%/analysis-kotlin-symbols-%dokkaVersion%.jar) |

以下是 [HTML](dokka-html.md) 輸出格式所需的額外相依性：

| **Group**               | **Artifact**       | **Version** | **Link**                                                                                                           |
|-------------------------|--------------------|-------------|--------------------------------------------------------------------------------------------------------------------|
| `org.jetbrains.kotlinx` | `kotlinx-html-jvm` | 0.8.0       | [下載](https://repo1.maven.org/maven2/org/jetbrains/kotlinx/kotlinx-html-jvm/0.8.0/kotlinx-html-jvm-0.8.0.jar) |
| `org.freemarker`        | `freemarker`       | 2.3.31      | [下載](https://repo1.maven.org/maven2/org/freemarker/freemarker/2.3.31/freemarker-2.3.31.jar)                  |

### 使用命令列選項執行 {id="run-with-command-line-options"}

你可以傳遞命令列選項來配置 CLI 執行器。

你至少需要提供以下選項：

* `-pluginsClasspath` - 下載的相依性之絕對／相對路徑清單，以分號 `;` 分隔
* `-sourceSet` - 要為其產生文件的原始碼絕對路徑
* `-outputDir` - 文件輸出目錄的絕對／相對路徑

```Bash
java -jar dokka-cli-%dokkaVersion%.jar \
     -pluginsClasspath "./dokka-base-%dokkaVersion%.jar;./analysis-kotlin-symbols-%dokkaVersion%.jar;./kotlinx-html-jvm-0.8.0.jar;./freemarker-2.3.31.jar" \
     -sourceSet "-src /home/myCoolProject/src/main/kotlin" \
     -outputDir "./dokka/html"
```

執行給定的範例會產生 [HTML](dokka-html.md) 輸出格式的文件。

有關更多配置詳細資訊，請參閱 [命令列選項](#command-line-options)。

### 使用 JSON 配置執行 {id="run-with-json-configuration"}

可以使用 JSON 配置 CLI 執行器。在這種情況下，你需要提供 JSON 配置檔案的絕對／相對路徑作為第一個且唯一的引數。所有其他配置選項都將從中剖析。

```Bash
java -jar dokka-cli-%dokkaVersion%.jar dokka-configuration.json
```

你至少需要以下 JSON 配置檔案：

```json
{
  "outputDir": "./dokka/html",
  "sourceSets": [
    {
      "sourceSetID": {
        "scopeId": "moduleName",
        "sourceSetName": "main"
      },
      "sourceRoots": [
        "/home/myCoolProject/src/main/kotlin"
      ]
    }
  ],
  "pluginsClasspath": [
    "./dokka-base-%dokkaVersion%.jar",
    "./kotlinx-html-jvm-0.8.0.jar",
    "./analysis-kotlin-symbols-%dokkaVersion%.jar",
    "./freemarker-2.3.31.jar"
  ]
}
```

有關更多詳細資訊，請參閱 [JSON 配置選項](#json-configuration)。

### 其他輸出格式 {id="other-output-formats"}

預設情況下，`dokka-base` 構件僅包含 [HTML](dokka-html.md) 輸出格式。

所有其他輸出格式都實作為 [Dokka 外掛程式](dokka-plugins.md)。為了使用它們，你必須將它們放入外掛程式類別路徑中。

例如，如果你想產生實驗性的 [GFM](https://github.com/Kotlin/dokka/blob/8e5c63d035ef44a269b8c43430f43f5c8eebfb63/dokka-subprojects/plugin-gfm/README.md) 輸出格式的文件，你需要下載並將 gfm-plugin 的 JAR（[下載](https://repo1.maven.org/maven2/org/jetbrains/dokka/gfm-plugin/%dokkaVersion%/gfm-plugin-%dokkaVersion%.jar)）傳遞到 `pluginsClasspath` 配置選項中。

透過命令列選項：

```Shell
java -jar dokka-cli-%dokkaVersion%.jar \
     -pluginsClasspath "./dokka-base-%dokkaVersion%.jar;...;./gfm-plugin-%dokkaVersion%.jar" \
     ...
```

透過 JSON 配置：

```json
{
  ...
  "pluginsClasspath": [
    "./dokka-base-%dokkaVersion%.jar",
    "...",
    "./gfm-plugin-%dokkaVersion%.jar"
  ],
  ...
}
```

將 GFM 外掛程式傳遞給 `pluginsClasspath` 後，CLI 執行器會以 GFM 輸出格式產生文件。

欲了解更多資訊，請參閱 [GFM](https://github.com/Kotlin/dokka/blob/8e5c63d035ef44a269b8c43430f43f5c8eebfb63/dokka-subprojects/plugin-gfm/README.md) 和 [Javadoc](dokka-javadoc.md#generate-javadoc-documentation) 頁面。

## 命令列選項 {id="command-line-options"}

要查看所有可能的命令列選項清單及其詳細說明，請執行：

```Bash
java -jar dokka-cli-%dokkaVersion%.jar -help
```

簡短摘要：

| 選項 | 描述 |
|------------------------------|-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `moduleName` | 專案／模組的名稱。 |
| `moduleVersion` | 記錄文件的版本。 |
| `outputDir` | 輸出目錄路徑，預設為 `./dokka`。 |
| `sourceSet` | Dokka 原始碼集的配置。包含嵌套的配置選項。 |
| `pluginsConfiguration` | Dokka 外掛程式的配置。 |
| `pluginsClasspath` | 包含 Dokka 外掛程式及其相依性的 JAR 清單。接受以分號分隔的多個路徑。 |
| `offlineMode` | 是否透過網路解析遠端檔案／連結。 |
| `failOnWarning` | 當 Dokka 發出警告或錯誤時，是否讓文件產生失敗。 |
| `delayTemplateSubstitution` | 是否延遲某些元素的替換。用於多模組專案的增量建置。 |
| `noSuppressObviousFunctions` | 是否隱藏顯而易見的函式，例如繼承自 `kotlin.Any` 和 `java.lang.Object` 的函式。 |
| `includes` | 包含模組和套件文件的 Markdown 檔案。接受以分號分隔的多個值。 |
| `suppressInheritedMembers` | 是否隱藏在指定類別中未明確覆寫的繼承成員。 |
| `globalPackageOptions` | 套件配置選項的全域清單，格式為 `"matchingRegex,-deprecated,-privateApi,+warnUndocumented,+suppress;+visibility:PUBLIC;..."`。接受以分號分隔的多個值。 |
| `globalLinks` | 格式為 `{url}^{packageListUrl}` 的全域外部文件連結。接受以 `^^` 分隔的多個值。 |
| `globalSrcLink` | 原始碼目錄與用於瀏覽程式碼的 Web 服務之間的全域對應。接受以分號分隔的多個路徑。 |
| `helpSourceSet` | 列印解除嵌套的 `-sourceSet` 配置的說明。 |
| `loggingLevel` | 記錄層級，可能的值：`DEBUG, PROGRESS, INFO, WARN, ERROR`。 |
| `help, h` | 使用資訊。 |

#### 原始碼集選項 {id="source-set-options"}

要查看解除嵌套的 `-sourceSet` 配置的命令列選項清單，請執行：

```Bash
java -jar dokka-cli-%dokkaVersion%.jar -sourceSet -help
```

簡短摘要：

| 選項 | 描述 |
|------------------------------|--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `sourceSetName` | 原始碼集的名稱。 |
| `displayName` | 原始碼集的顯示名稱，用於內部和外部。 |
| `classpath` | 用於分析和互動式範例的類別路徑。接受以分號分隔的多個路徑。 |
| `src` | 要進行分析和記錄文件的原始碼根目錄。接受以分號分隔的多個路徑。 |
| `dependentSourceSets` | 格式為 `moduleName/sourceSetName` 的相依原始碼集名稱。接受以分號分隔的多個值。 |
| `samples` | 包含範例函式的目錄或檔案清單。接受以分號分隔的多個路徑。 <anchor name="includes-cli"/> |
| `includes` | 包含 [模組和套件文件](dokka-module-and-package-docs.md) 的 Markdown 檔案。接受以分號分隔的多個路徑。 |
| `documentedVisibilities` | 要記錄文件的可見性。接受以分號分隔的多個值。可能的值：`PUBLIC`、`PRIVATE`、`PROTECTED`、`INTERNAL`、`PACKAGE`。 |
| `reportUndocumented` | 是否報告未記錄文件的宣告。 |
| `noSkipEmptyPackages` | 是否為空套件建立頁面。 |
| `skipDeprecated` | 是否跳過已棄用的宣告。 |
| `jdkVersion` | 用於連結到 JDK Javadocs 的 JDK 版本。 |
| `languageVersion` | 用於設定分析和範例的語言版本。 |
| `apiVersion` | 用於設定分析和範例的 Kotlin API 版本。 |
| `noStdlibLink` | 是否產生指向 Kotlin 標準函式庫的連結。 |
| `noJdkLink` | 是否產生指向 JDK Javadocs 的連結。 |
| `suppressedFiles` | 要隱藏的檔案路徑。接受以分號分隔的多個路徑。 |
| `suppressAnnotatedWith` | 用於隱藏標記有該註解之宣告的註解完全限定名稱 (FQN)。接受以分號分隔的多個值。 |
| `analysisPlatform` | 用於設定分析的平台。 |
| `perPackageOptions` | 格式為 `matchingRegexp,-deprecated,-privateApi,+warnUndocumented,+suppress;...` 的套件原始碼集配置清單。接受以分號分隔的多個值。 |
| `externalDocumentationLinks` | 格式為 `{url}^{packageListUrl}` 的外部文件連結。接受以 `^^` 分隔的多個值。 |
| `srcLink` | 原始碼目錄與用於瀏覽程式碼的 Web 服務之間的對應。接受以分號分隔的多個路徑。 |

## JSON 配置 {id="json-configuration"}

以下是每個配置部分的範例和詳細描述。你也可以在頁面底部找到應用了 [所有配置選項](#complete-configuration) 的範例。

### 一般配置 {id="general-configuration"}

```json
{
  "moduleName": "Dokka Example",
  "moduleVersion": null,
  "outputDir": "./build/dokka/html",
  "failOnWarning": false,
  "suppressObviousFunctions": true,
  "suppressInheritedMembers": false,
  "offlineMode": false,
  "includes": [
    "module.md"
  ],
  "sourceLinks":  [
    { "_comment": "選項在單獨的部分中描述" }
  ],
  "perPackageOptions": [
    { "_comment": "選項在單獨的部分中描述" }
  ],
  "externalDocumentationLinks":  [
    { "_comment": "選項在單獨的部分中描述" }
  ],
  "sourceSets": [
    { "_comment": "選項在單獨的部分中描述" }
  ],
  "pluginsClasspath": [
    "./dokka-base-%dokkaVersion%.jar",
    "./kotlinx-html-jvm-0.8.0.jar",
    "./analysis-kotlin-symbols-%dokkaVersion%.jar",
    "./freemarker-2.3.31.jar"
  ]
}
```

<deflist collapsible="true">
    <def title="moduleName">
        <p>用於引用模組的顯示名稱。它用於目錄、導覽、記錄等。</p>
        <p>預設值：<code>root</code></p>
    </def>
    <def title="moduleVersion">
        <p>模組版本。</p>
        <p>預設值：空</p>
    </def>
    <def title="outputDirectory">
        <p>無論輸出格式為何，產生文件的目錄。</p>
        <p>預設值：<code>./dokka</code></p>
    </def>
    <def title="failOnWarning">
        <p>
            當 Dokka 發出警告或錯誤時，是否讓文件產生失敗。
            該過程會等待所有錯誤和警告都發出後才停止。
        </p>
        <p>此設定與 <code>reportUndocumented</code> 配合良好</p>
        <p>預設值：<code>false</code></p>
    </def>
    <def title="suppressObviousFunctions">
        <p>是否隱藏顯而易見的函式。</p>
            如果函式滿足以下條件，則被視為顯而易見：
            <list>
                <li>
                    繼承自 <code>kotlin.Any</code>、<code>Kotlin.Enum</code>、<code>java.lang.Object</code> 或
                    <code>java.lang.Enum</code>，例如 <code>equals</code>、<code>hashCode</code>、<code>toString</code>。
                </li>
                <li>
                    合成的（由編譯器產生）且沒有任何文件，例如
                    <code>dataClass.componentN</code> 或 <code>dataClass.copy</code>。
                </li>
            </list>
        <p>預設值：<code>true</code></p>
    </def>
    <def title="suppressInheritedMembers">
        <p>是否隱藏在指定類別中未明確覆寫的繼承成員。</p>
        <p>
            注意：這可以隱藏諸如 <code>equals</code> / <code>hashCode</code> / <code>toString</code> 之類的函式，
            但不能隱藏諸如 <code>dataClass.componentN</code> 和 
            <code>dataClass.copy</code> 之類的合成函式。請使用 <code>suppressObviousFunctions</code>
            來處理。
        </p>
        <p>預設值：<code>false</code></p>
    </def>
    <def title="offlineMode">
        <anchor name="includes-json"/>
        <p>是否透過網路解析遠端檔案／連結。</p>
        <p>
            這包括用於產生外部文件連結的 package-list。
            例如，讓來自標準函式庫的類別可以點擊。
        </p>
        <p>
            在某些情況下，將此設定為 <code>true</code> 可以顯著提高建置速度，
            但也可能降低文件品質和使用者體驗。例如，
            無法解析來自相依性（包括標準函式庫）的類別／成員連結。
        </p>
        <p>
            注意：你可以將抓取的檔案快取到本機，並將其作為本機路徑提供給
            Dokka。請參閱 <code>externalDocumentationLinks</code> 部分。
        </p>
        <p>預設值：<code>false</code></p>
    </def>
    <def title="includes">
        <p>
            包含
            <a href="dokka-module-and-package-docs.md">模組和套件文件</a> 的 Markdown 檔案清單。
        </p>
        <p>指定檔案的內容會被剖析並作為模組和套件描述嵌入到文件中。</p>
        <p>這可以針對每個套件進行配置。</p>
    </def>
    <def title="sourceSets">
        <p>
          Kotlin 
          <a href="https://kotlinlang.org/docs/multiplatform-discover-project.html#source-sets">原始碼集</a> 的個別和額外配置。
        </p>
        <p>有關可能選項的清單，請參閱 <a href="#source-set-configuration">原始碼集配置</a>。</p>
    </def>
    <def title="sourceLinks">
        <p>套用於所有原始碼集的原始碼連結全域配置。</p>
        <p>有關可能選項的清單，請參閱 <a href="#source-link-configuration">原始碼連結配置</a>。</p>
    </def>
    <def title="perPackageOptions">
        <p>相符套件的全域配置，無論它們位於哪個原始碼集中。</p>
        <p>有關可能選項的清單，請參閱 <a href="#per-package-configuration">每個套件的配置</a>。</p>
    </def>
    <def title="externalDocumentationLinks">
        <p>外部文件連結的全域配置，無論它們在哪個原始碼集中被使用。</p>
        <p>有關可能選項的清單，請參閱 <a href="#external-documentation-links-configuration">外部文件連結配置</a>。</p>
    </def>
    <def title="pluginsClasspath">
        <p>包含 Dokka 外掛程式及其相依性的 JAR 檔案清單。</p>
    </def>
</deflist>

### 原始碼集配置 {id="source-set-configuration"}

如何配置 Kotlin
[原始碼集](https://kotlinlang.org/docs/multiplatform-discover-project.html#source-sets)：

```json
{
  "sourceSets": [
    {
      "displayName": "jvm",
      "sourceSetID": {
        "scopeId": "moduleName",
        "sourceSetName": "main"
      },
      "dependentSourceSets": [
        {
          "scopeId": "dependentSourceSetScopeId",
          "sourceSetName": "dependentSourceSetName"
        }
      ],
      "documentedVisibilities": ["PUBLIC", "PRIVATE", "PROTECTED", "INTERNAL", "PACKAGE"],
      "reportUndocumented": false,
      "skipEmptyPackages": true,
      "skipDeprecated": false,
      "jdkVersion": 8,
      "languageVersion": "1.7",
      "apiVersion": "1.7",
      "noStdlibLink": false,
      "noJdkLink": false,
      "includes": [
        "module.md"
      ],
      "analysisPlatform": "jvm",
      "sourceRoots": [
        "/home/ignat/IdeaProjects/dokka-debug-mvn/src/main/kotlin"
      ],
      "classpath": [
        "libs/kotlin-stdlib-%kotlinVersion%.jar",
        "libs/kotlin-stdlib-common-%kotlinVersion%.jar"
      ],
      "samples": [
        "samples/basic.kt"
      ],
      "suppressedFiles": [
        "src/main/kotlin/org/jetbrains/dokka/Suppressed.kt"
      ],
      "sourceLinks":  [
        { "_comment": "選項在單獨的部分中描述" }
      ],
      "perPackageOptions": [
        { "_comment": "選項在單獨的部分中描述" }
      ],
      "externalDocumentationLinks":  [
        { "_comment": "選項在單獨的部分中描述" }
      ]
    }
  ]
}
```

<deflist collapsible="true">
    <def title="displayName">
        <p>用於引用此原始碼集的顯示名稱。</p>
        <p>
            此名稱既用於外部（例如，原始碼集名稱對文件閱讀者可見），也用於
            內部（例如，用於 <code>reportUndocumented</code> 的記錄訊息）。
        </p>
        <p>如果你沒有更好的選擇，可以使用平台名稱。</p>
    </def>
    <def title="sourceSetID">
        <p>原始碼集的技術 ID</p>
    </def>
    <def title="documentedVisibilities">
        <p>應記錄文件的可見性修飾符集合。</p>
        <p>
            如果你想記錄 <code>protected</code>/<code>internal</code>/<code>private</code> 宣告，
            以及如果你想排除 <code>public</code> 宣告並僅記錄內部 API，則可以使用此選項。
        </p>
        <p>這可以針對每個套件進行配置。</p>
        <p>
            可能的值：</p>
            <list>
                <li><code>PUBLIC</code></li>
                <li><code>PRIVATE</code></li>
                <li><code>PROTECTED</code></li>
                <li><code>INTERNAL</code></li>
                <li><code>PACKAGE</code></li>
            </list>
        <p>預設值：<code>PUBLIC</code></p>
    </def>
    <def title="reportUndocumented">
        <p>
            是否發出關於可見的未記錄文件宣告的警告，即在被 <code>documentedVisibilities</code> 
            和其他篩選器篩選後沒有 KDocs 的宣告。
        </p>
        <p>此設定與 <code>failOnWarning</code> 配合良好。</p>
        <p>這可以針對每個套件進行配置。</p>
        <p>預設值：<code>false</code></p>
    </def>
    <def title="skipEmptyPackages">
        <p>
            在應用各種篩選器後，是否跳過不含可見宣告的套件。
        </p>
        <p>
            例如，如果 <code>skipDeprecated</code> 設定為 <code>true</code> 且你的套件僅包含
            已棄用的宣告，則該套件被視為空套件。
        </p>
        <p>CLI 執行器的預設值為 <code>false</code>。</p>
    </def>
    <def title="skipDeprecated">
        <p>是否記錄使用 <code>@Deprecated</code> 註解的宣告。</p>
        <p>這可以針對每個套件進行配置。</p>
        <p>預設值：<code>false</code></p>
    </def>
    <def title="jdkVersion">
        <p>為 Java 型別產生外部文件連結時使用的 JDK 版本。</p>
        <p>
            例如，如果你在某些公用宣告簽章中使用 <code>java.util.UUID</code>，
            且此選項設定為 <code>8</code>，Dokka 會為其產生指向 <a href="https://docs.oracle.com/javase/8/docs/api/java/util/UUID.html">JDK 8 Javadocs</a> 的外部文件連結。
        </p>
    </def>
    <def title="languageVersion">
        <p>
            用於設定分析和 <a href="https://kotlinlang.org/docs/kotlin-doc.html#sample-identifier">@sample</a>
            環境的 <a href="https://kotlinlang.org/docs/compatibility-modes.html">Kotlin 語言版本</a>。
        </p>
    </def>
    <def title="apiVersion">
        <p>
            用於設定分析和 <a href="https://kotlinlang.org/docs/kotlin-doc.html#sample-identifier">@sample</a>
            環境的 <a href="https://kotlinlang.org/docs/compatibility-modes.html">Kotlin API 版本</a>。
        </p>
    </def>
    <def title="noStdlibLink">
        <p>
            是否產生指向 Kotlin 標準函式庫 API 參考文件的外部文件連結。
        </p>
        <p>注意：當 <code>noStdLibLink</code> 設定為 <code>false</code> 時，<b>會</b> 產生連結。</p>
        <p>預設值：<code>false</code></p>
    </def>
    <def title="noJdkLink">
        <p>是否產生指向 JDK Javadocs 的外部文件連結。</p>
        <p>JDK Javadocs 的版本由 <code>jdkVersion</code> 選項決定。</p>
        <p>注意：當 <code>noJdkLink</code> 設定為 <code>false</code> 時，<b>會</b> 產生連結。</p>
        <p>預設值：<code>false</code></p>
    </def>
    <def title="includes">
        <p>
            包含
            <a href="dokka-module-and-package-docs.md">模組和套件文件</a> 的 Markdown 檔案清單。
        </p>
        <p>指定檔案的內容會被剖析並作為模組和套件描述嵌入到文件中。</p>
    </def>
    <def title="analysisPlatform">
        <p>
            用於設定程式碼分析和 
            <a href="https://kotlinlang.org/docs/kotlin-doc.html#sample-identifier">@sample</a> 環境的平台。
        </p>
        <p>
            可能的值：</p>
            <list>
                <li><code>jvm</code></li>
                <li><code>common</code></li>
                <li><code>js</code></li>
                <li><code>native</code></li>
            </list>
    </def>
    <def title="sourceRoots">
        <p>
            要進行分析和記錄文件的原始碼根目錄。
            可接受的輸入包括目錄和個別的 <code>.kt</code> / <code>.java</code> 檔案。
        </p>
    </def>
    <def title="classpath">
        <p>用於分析和互動式範例的類別路徑。</p>
        <p>如果某些來自相依性的型別未被自動解析／選取，這將非常有用。</p>
        <p>此選項接受 <code>.jar</code> 和 <code>.klib</code> 檔案。</p>
    </def>
    <def title="samples">
        <p>
            包含範例函式的目錄或檔案清單，這些範例函式透過 
            <a href="https://kotlinlang.org/docs/kotlin-doc.html#sample-identifier">@sample</a> KDoc 標籤被引用。
        </p>
    </def>
    <def title="suppressedFiles">
        <p>產生文件時要隱藏的檔案。</p>
    </def>
    <def title="suppressAnnotatedWith">
        <p>用於隱藏標記有該註解之宣告的註解完全限定名稱 (FQN) 清單。</p>
        <p>
            任何標記有這些註解之一的宣告都將從產生的文件中排除。
        </p>
    </def>
    <def title="sourceLinks">
        <p>僅套用於此原始碼集的原始碼連結參數集合。</p>
        <p>有關可能選項的清單，請參閱 <a href="#source-link-configuration">原始碼連結配置</a>。</p>
    </def>
    <def title="perPackageOptions">
        <p>特定於此原始碼集內相符套件的參數集合。</p>
        <p>有關可能選項的清單，請參閱 <a href="#per-package-configuration">每個套件的配置</a>。</p>
    </def>
    <def title="externalDocumentationLinks">
        <p>僅套用於此原始碼集的外部文件連結參數集合。</p>
        <p>有關可能選項的清單，請參閱 <a href="#external-documentation-links-configuration">外部文件連結配置</a>。</p>
    </def>
</deflist>

### 原始碼連結配置 {id="source-link-configuration"}

`sourceLinks` 配置區塊允許你為每個簽章新增一個 `source` 連結，該連結指向具有特定行號的 `remoteUrl`。（行號可以透過設定 `remoteLineSuffix` 來配置）。

這有助於讀者找到每個宣告的原始碼。

例如，請參閱 `kotlinx.coroutines` 中 
[`count()`](https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines.flow/count.html) 
函式的文件。

你可以同時為所有原始碼集配置原始碼連結，也可以 [個別配置](#source-set-configuration)：

```json
{
  "sourceLinks": [
    {
      "localDirectory": "src/main/kotlin",
      "remoteUrl": "https://github.com/Kotlin/dokka/tree/master/src/main/kotlin",
      "remoteLineSuffix": "#L"
    }
  ]
}
```

<deflist collapsible="true">
    <def title="localDirectory">
        <p>本機原始碼目錄的路徑。</p>
    </def>
    <def title="remoteUrl">
        <p>
            文件讀者可以存取的原始碼代管服務的 URL，
            例如 GitHub、GitLab、Bitbucket 等。此 URL 用於產生
            宣告的原始碼連結。
        </p>
    </def>
    <def title="remoteLineSuffix">
        <p>
            用於將原始碼行號附加到 URL 的後置字串。這有助於讀者不僅導向
            檔案，還能導向宣告的具體行號。
        </p>
        <p>
            數字本身會附加到指定的後置字串。例如，
            如果此選項設定為 <code>#L</code> 且行號為 10，則產生的 URL 後置字串
            為 <code>#L10</code>。
        </p>
        <p>
            常用服務使用的後置字串：</p>
            <list>
                <li>GitHub: <code>#L</code></li>
                <li>GitLab: <code>#L</code></li>
                <li>Bitbucket: <code>#lines-</code></li>
            </list>
        <p>預設值：空（無後置字串）</p>
    </def>
</deflist>

### 每個套件的配置 {id="per-package-configuration"}

`perPackageOptions` 配置區塊允許為與 `matchingRegex` 相符的特定套件設定某些選項。

你可以同時為所有原始碼集新增套件配置，也可以 [個別配置](#source-set-configuration)：

```json
{
  "perPackageOptions": [
    {
      "matchingRegex": ".*internal.*",
      "suppress": false,
      "skipDeprecated": false,
      "reportUndocumented": false,
      "documentedVisibilities": ["PUBLIC", "PRIVATE", "PROTECTED", "INTERNAL", "PACKAGE"]
    }
  ]
}
```

<deflist collapsible="true">
    <def title="matchingRegex">
        <p>用於比對套件的正規表示式。</p>
    </def>
    <def title="suppress">
        <p>產生文件時是否應跳過此套件。</p>
        <p>預設值：<code>false</code></p>
    </def>
    <def title="skipDeprecated">
        <p>是否記錄使用 <code>@Deprecated</code> 註解的宣告。</p>
        <p>這可以在專案／模組層級設定。</p>
        <p>預設值：<code>false</code></p>
    </def>
    <def title="reportUndocumented">
        <p>
            是否發出關於可見的未記錄文件宣告的警告，即在被 <code>documentedVisibilities</code> 
            和其他篩選器篩選後沒有 KDocs 的宣告。
        </p>
        <p>此設定與 <code>failOnWarning</code> 配合良好。</p>
        <p>這可以在原始碼集層級進行配置。</p>
        <p>預設值：<code>false</code></p>
    </def>
    <def title="documentedVisibilities">
        <p>應記錄文件的可見性修飾符集合。</p>
        <p>
            如果你想記錄此套件內的 <code>protected</code>/<code>internal</code>/<code>private</code> 宣告，
            以及如果你想排除 <code>public</code> 宣告並僅記錄內部 API，則可以使用此選項。
        </p>
        <p>可以在原始碼集層級進行配置。</p>
        <p>預設值：<code>PUBLIC</code></p>
    </def>
</deflist>

### 外部文件連結配置 {id="external-documentation-links-configuration"}

`externalDocumentationLinks` 區塊允許建立指向相依性之外部代管文件的連結。

例如，如果你正在使用來自 `kotlinx.serialization` 的型別，預設情況下它們在你的文件中是不可點擊的，就好像它們未解析一樣。但是，由於 `kotlinx.serialization` 的 API 參考文件是由 Dokka 建置並 [發佈在 kotlinlang.org 上](https://kotlinlang.org/api/kotlinx.serialization/)，你可以為其配置外部文件連結。從而允許 Dokka 為程式庫中的型別產生連結，使其成功解析並可點擊。

你可以同時為所有原始碼集配置外部文件連結，也可以 [個別配置](#source-set-configuration)：

```json
{
  "externalDocumentationLinks": [
    {
      "url": "https://kotlinlang.org/api/kotlinx.serialization/",
      "packageListUrl": "https://kotlinlang.org/api/kotlinx.serialization/package-list"
    }
  ]
}
```

<deflist collapsible="true">
    <def title="url">
        <p>要連結的文件根 URL。它 <b>必須</b> 以斜杠結尾。</p>
        <p>
            Dokka 會盡力自動尋找指定 URL 的 <code>package-list</code>，
            並將宣告連結在一起。
        </p>
        <p>
            如果自動解析失敗，或者如果你想改用本機快取的檔案，
            請考慮設定 <code>packageListUrl</code> 選項。
        </p>
    </def>
    <def title="packageListUrl">
        <p>
            <code>package-list</code> 的確切位置。這是依靠 Dokka 自動解析之外的另一種選擇。
        </p>
        <p>
            套件清單包含有關文件和專案本身的資訊，
            例如模組 and 套件名稱。
        </p>
        <p>這也可以是本機快取的檔案，以避免網路呼叫。</p>
    </def>
</deflist>

### 完整配置 {id="complete-configuration"}

下面你可以看到同時應用的所有可能配置選項。

```json
{
  "moduleName": "Dokka Example",
  "moduleVersion": null,
  "outputDir": "./build/dokka/html",
  "failOnWarning": false,
  "suppressObviousFunctions": true,
  "suppressInheritedMembers": false,
  "offlineMode": false,
  "suppressAnnotatedWith": [
    "com.example.SuppressMe"
  ],
  "sourceLinks": [
    {
      "localDirectory": "src/main/kotlin",
      "remoteUrl": "https://github.com/Kotlin/dokka/tree/master/src/main/kotlin",
      "remoteLineSuffix": "#L"
    }
  ],
  "externalDocumentationLinks": [
    {
      "url": "https://docs.oracle.com/javase/8/docs/api/",
      "packageListUrl": "https://docs.oracle.com/javase/8/docs/api/package-list"
    },
    {
      "url": "https://kotlinlang.org/api/core/kotlin-stdlib/",
      "packageListUrl": "https://kotlinlang.org/api/core/kotlin-stdlib/package-list"
    }
  ],
  "perPackageOptions": [
    {
      "matchingRegex": ".*internal.*",
      "suppress": false,
      "reportUndocumented": false,
      "skipDeprecated": false,
      "documentedVisibilities": ["PUBLIC", "PRIVATE", "PROTECTED", "INTERNAL", "PACKAGE"]
    }
  ],
  "sourceSets": [
    {
      "displayName": "jvm",
      "sourceSetID": {
        "scopeId": "moduleName",
        "sourceSetName": "main"
      },
      "dependentSourceSets": [
        {
          "scopeId": "dependentSourceSetScopeId",
          "sourceSetName": "dependentSourceSetName"
        }
      ],
      "documentedVisibilities": ["PUBLIC", "PRIVATE", "PROTECTED", "INTERNAL", "PACKAGE"],
      "reportUndocumented": false,
      "skipEmptyPackages": true,
      "skipDeprecated": false,
      "jdkVersion": 8,
      "languageVersion": "1.7",
      "apiVersion": "1.7",
      "noStdlibLink": false,
      "noJdkLink": false,
      "includes": [
        "module.md"
      ],
      "analysisPlatform": "jvm",
      "sourceRoots": [
        "/home/ignat/IdeaProjects/dokka-debug-mvn/src/main/kotlin"
      ],
      "classpath": [
        "libs/kotlin-stdlib-%kotlinVersion%.jar",
        "libs/kotlin-stdlib-common-%kotlinVersion%.jar"
      ],
      "samples": [
        "samples/basic.kt"
      ],
      "suppressedFiles": [
        "src/main/kotlin/org/jetbrains/dokka/Suppressed.kt"
      ],
      "suppressAnnotatedWith": [
        "com.example.SuppressMe"
      ],
      "sourceLinks": [
        {
          "localDirectory": "src/main/kotlin",
          "remoteUrl": "https://github.com/Kotlin/dokka/tree/master/src/main/kotlin",
          "remoteLineSuffix": "#L"
        }
      ],
      "externalDocumentationLinks": [
        {
          "url": "https://docs.oracle.com/javase/8/docs/api/",
          "packageListUrl": "https://docs.oracle.com/javase/8/docs/api/package-list"
        },
        {
          "url": "https://kotlinlang.org/api/core/kotlin-stdlib/",
          "packageListUrl": "https://kotlinlang.org/api/core/kotlin-stdlib/package-list"
        }
      ],
      "perPackageOptions": [
        {
          "matchingRegex": ".*internal.*",
          "suppress": false,
          "reportUndocumented": false,
          "skipDeprecated": false,
          "documentedVisibilities": ["PUBLIC", "PRIVATE", "PROTECTED", "INTERNAL", "PACKAGE"]
        }
      ]
    }
  ],
  "pluginsClasspath": [
    "./dokka-base-%dokkaVersion%.jar",
    "./kotlinx-html-jvm-0.8.0.jar",
    "./analysis-kotlin-symbols-%dokkaVersion%.jar",
    "./freemarker-2.3.31.jar"
  ],
  "pluginsConfiguration": [
    {
      "fqPluginName": "org.jetbrains.dokka.base.DokkaBase",
      "serializationFormat": "JSON",
      "values": "{\"separateInheritedMembers\":false,\"footerMessage\":\"© 2021 pretty good Copyright\"}"
    }
  ],
  "includes": [
    "module.md"
  ]
}
```
