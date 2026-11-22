[//]: # (title: CLI)

如果出於某種原因，你無法使用 [Gradle](dokka-gradle.md) 或 [Maven](dokka-maven.md) 建置工具，Dokka 也提供了用於產生文件的命令列 (CLI) 執行器。

相較之下，它的功能與 Dokka 的 Gradle 外掛程式相同，甚至更多。不過，由於沒有自動設定，設定起來會困難得多，特別是在多平台與多模組環境中。

## 開始使用 {id="get-started"}

CLI 執行器以獨立的可執行的產物發布至 Maven Central。

你可以在 [Maven Central](https://central.sonatype.com/artifact/org.jetbrains.dokka/dokka-cli) 上找到它，或者[直接下載](https://repo1.maven.org/maven2/org/jetbrains/dokka/dokka-cli/%dokkaVersion%/dokka-cli-%dokkaVersion%.jar)。

將 `dokka-cli-%dokkaVersion%.jar` 檔案儲存至你的電腦後，使用 `-help` 選項執行它以查看所有可用的設定選項及其說明：

```Bash
java -jar dokka-cli-%dokkaVersion%.jar -help
```

它也適用於某些巢狀選項，例如 `-sourceSet`：

```Bash
java -jar dokka-cli-%dokkaVersion%.jar -sourceSet -help
```

## 產生文件 {id="generate-documentation"}

### 必要條件 {id="prerequisites"}

由於沒有建置工具來管理相依性，你必須自行提供相依的 `.jar` 檔案。

以下列出任何輸出格式皆需要的相依性：

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

你可以傳遞命令列選項來設定 CLI 執行器。

你至少需要提供以下選項：

* `-pluginsClasspath` - 已下載相依性的絕對／相對路徑清單，以分號 `;` 分隔
* `-sourceSet` - 要為其產生文件的原始碼之絕對路徑
* `-outputDir` - 文件輸出目錄的絕對／相對路徑

```Bash
java -jar dokka-cli-%dokkaVersion%.jar \
     -pluginsClasspath "./dokka-base-%dokkaVersion%.jar;./analysis-kotlin-symbols-%dokkaVersion%.jar;./kotlinx-html-jvm-0.8.0.jar;./freemarker-2.3.31.jar" \
     -sourceSet "-src /home/myCoolProject/src/main/kotlin" \
     -outputDir "./dokka/html"
```

執行上述範例將產生 [HTML](dokka-html.md) 輸出格式的文件。

有關更多設定詳細資訊，請參閱[命令列選項](#command-line-options)。

### 使用 JSON 設定執行 {id="run-with-json-configuration"}

也可以使用 JSON 來設定 CLI 執行器。在此情況下，你需要提供 JSON 設定檔的絕對／相對路徑作為第一個且唯一的引數。所有其他設定選項都會從中進行剖析。

```Bash
java -jar dokka-cli-%dokkaVersion%.jar dokka-configuration.json
```

你至少需要以下 JSON 設定檔：

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

詳情請參閱 [JSON 設定選項](#json-configuration)。

### 其他輸出格式 {id="other-output-formats"}

預設情況下，`dokka-base` 產物僅包含 [HTML](dokka-html.md) 輸出格式。

所有其他輸出格式均實作為 [Dokka 外掛程式](dokka-plugins.md)。若要使用它們，你必須將它們放在外掛程式類別路徑（plugins classpath）中。

例如，如果你想要以實驗性的 [GFM](https://github.com/Kotlin/dokka/blob/master/dokka-subprojects/plugin-gfm/README.md) 輸出格式產生文件，你需要下載 gfm-plugin 的 JAR（[下載](https://repo1.maven.org/maven2/org/jetbrains/dokka/gfm-plugin/%dokkaVersion%/gfm-plugin-%dokkaVersion%.jar)），並將其傳遞至 `pluginsClasspath` 設定選項中。

透過命令列選項：

```Shell
java -jar dokka-cli-%dokkaVersion%.jar \
     -pluginsClasspath "./dokka-base-%dokkaVersion%.jar;...;./gfm-plugin-%dokkaVersion%.jar" \
     ...
```

透過 JSON 設定：

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

將 GFM 外掛程式傳遞給 `pluginsClasspath` 後，CLI 執行器便會產生 GFM 輸出格式的文件。

如需更多資訊，請參閱 [GFM](https://github.com/Kotlin/dokka/blob/8e5c63d035ef44a269b8c43430f43f5c8eebfb63/dokka-subprojects/plugin-gfm/README.md) 和 [Javadoc](dokka-javadoc.md#generate-javadoc-documentation) 頁面。

## 命令列選項 {id="command-line-options"}

若要查看所有可能的命令列選項清單及其詳細說明，請執行：

```Bash
java -jar dokka-cli-%dokkaVersion%.jar -help
```

簡要總結：

| 選項 | 說明 |
|---|---|
| `moduleName` | 專案／模組名稱。 |
| `moduleVersion` | 記載的文件版本。 |
| `outputDir` | 輸出目錄路徑，預設為 `./dokka`。 |
| `sourceSet` | Dokka 原始碼集的設定。包含巢狀設定選項。 |
| `pluginsConfiguration` | Dokka 外掛程式的設定。 |
| `pluginsClasspath` | 包含 Dokka 外掛程式及其相依性的 JAR 清單。接受以分號分隔的多個路徑。 |
| `offlineMode` | 是否透過網路解析遠端檔案／連結。 |
| `failOnWarning` | 當 Dokka 發出警告或錯誤時，是否使文件產生失敗。 |
| `delayTemplateSubstitution` | 是否延遲某些元素的替換。用於多模組專案的累加建置。 |
| `noSuppressObviousFunctions` | 是否隱藏顯而易見的函式，例如繼承自 `kotlin.Any` 與 `java.lang.Object` 的函式。 |
| `includes` | 包含模組與套件文件的 Markdown 檔案。接受以分號分隔的多個值。 |
| `suppressInheritedMembers` | 是否隱藏在給定類別中未被明確覆寫的繼承成員。 |
| `globalPackageOptions` | 全域套件設定選項清單，格式為 `"matchingRegex,-deprecated,-privateApi,+warnUndocumented,+suppress;+visibility:PUBLIC;..."`。接受以分號分隔的多個值。 |
| `globalLinks` | 全域外部文件連結，格式為 `{url}^{packageListUrl}`。接受以 `^^` 分隔的多個值。 |
| `globalSrcLink` | 原始碼目錄與用於瀏覽程式碼的 Web 服務之間的全域對應。接受以分號分隔的多個路徑。 |
| `helpSourceSet` | 印出巢狀 `-sourceSet` 設定的說明資訊。 |
| `loggingLevel` | 記錄層級，可能的值：`DEBUG, PROGRESS, INFO, WARN, ERROR`。 |
| `help, h` | 使用說明資訊。 |

#### 原始碼集選項 {id="source-set-options"}

若要查看巢狀 `-sourceSet` 設定的命令列選項清單，請執行：

```Bash
java -jar dokka-cli-%dokkaVersion%.jar -sourceSet -help
```

簡要總結：

| 選項 | 說明 |
|---|---|
| `sourceSetName` | 原始碼集的名稱。 |
| `displayName` | 原始碼集的顯示名稱，用於內部與外部。 |
| `classpath` | 用於分析和互動式範例的 Classpath。接受以分號分隔的多個路徑。 |
| `src` | 要分析並產生文件的原始碼根目錄。接受以分號分隔的多個路徑。 |
| `dependentSourceSets` | 相依原始碼集的名稱，格式為 `moduleName/sourceSetName`。接受以分號分隔的多個值。 |
| `samples` | 包含範例函式的目錄或檔案清單。接受以分號分隔的多個路徑。<anchor name="includes-cli"/> |
| `includes` | 包含[模組與套件文件](dokka-module-and-package-docs.md)的 Markdown 檔案。接受以分號分隔的多個路徑。 |
| `documentedVisibilities` | 要記錄的文件可見性。接受以分號分隔的多個值。可能的值：`PUBLIC`、`PRIVATE`、`PROTECTED`、`INTERNAL`、`PACKAGE`。 |
| `reportUndocumented` | 是否回報未撰寫文件的宣告。 |
| `noSkipEmptyPackages` | 是否為空套件建立頁面。 |
| `skipDeprecated` | 是否跳過已棄用的宣告。 |
| `jdkVersion` | 用於連結至 JDK Javadoc 的 JDK 版本。 |
| `languageVersion` | 用於設定分析與範例環境的語言版本。 |
| `apiVersion` | 用於設定分析與範例環境的 Kotlin API 版本。 |
| `noStdlibLink` | 是否產生指向 Kotlin 標準函式庫的連結。 |
| `noJdkLink` | 是否產生指向 JDK Javadoc 的連結。 |
| `suppressedFiles` | 要排除的檔案路徑。接受以分號分隔的多個路徑。 |
| `suppressAnnotatedWith` | 要排除標註有特定註解的宣告之註解完整限定名稱 (FQN)。接受以分號分隔的多個值。 |
| `analysisPlatform` | 用於設定分析的平台。 |
| `perPackageOptions` | 套件原始碼集設定清單，格式為 `matchingRegexp,-deprecated,-privateApi,+warnUndocumented,+suppress;...`。接受以分號分隔的多個值。 |
| `externalDocumentationLinks` | 外部文件連結，格式為 `{url}^{packageListUrl}`。接受以 `^^` 分隔的多個值。 |
| `srcLink` | 原始碼目錄與用於瀏覽程式碼的 Web 服務之間的對應。接受以分號分隔的多個路徑。 |

## JSON 設定 {id="json-configuration"}

以下是各個設定區段的範例和詳細說明。你也可以在頁面底部找到套用[所有設定選項](#complete-configuration)的完整範例。

### 一般設定 {id="general-configuration"}

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
    { "_comment": "Options are described in a separate section" }
  ],
  "perPackageOptions": [
    { "_comment": "Options are described in a separate section" }
  ],
  "externalDocumentationLinks":  [
    { "_comment": "Options are described in a separate section" }
  ],
  "sourceSets": [
    { "_comment": "Options are described in a separate section" }
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
        <p>用於指稱模組的顯示名稱。它用於目錄、導覽、記錄等。</p>
        <p>預設值：<code>root</code></p>
    </def>
    <def title="moduleVersion">
        <p>模組版本。</p>
        <p>預設值：空白</p>
    </def>
    <def title="outputDirectory">
        <p>產生文件的目錄，無論輸出格式為何。</p>
        <p>預設值：<code>./dokka</code></p>
    </def>
    <def title="failOnWarning">
        <p>
            當 Dokka 發出警告或錯誤時，是否使文件產生失敗。
            該程序會先等待所有錯誤與警告全部發出。
        </p>
        <p>此設定與 <code>reportUndocumented</code> 搭配使用效果良好</p>
        <p>預設值：<code>false</code></p>
    </def>
    <def title="suppressObviousFunctions">
        <p>是否隱藏顯而易見的函式。</p>
            函式在符合以下情況時被視為顯而易見：
            <list>
                <li>
                    繼承自 <code>kotlin.Any</code>、<code>Kotlin.Enum</code>、<code>java.lang.Object</code> 或
                    <code>java.lang.Enum</code>，例如 <code>equals</code>、<code>hashCode</code>、<code>toString</code>。
                </li>
                <li>
                    屬於合成函式（由編譯器產生）且沒有任何文件，例如
                    <code>dataClass.componentN</code> 或 <code>dataClass.copy</code>。
                </li>
            </list>
        <p>預設值：<code>true</code></p>
    </def>
    <def title="suppressInheritedMembers">
        <p>是否隱藏在給定類別中未被明確覆寫的繼承成員。</p>
        <p>
            注意：這可以隱藏諸如 <code>equals</code> / <code>hashCode</code> / <code>toString</code> 等函式，
            但無法隱藏合成函式，例如 <code>dataClass.componentN</code> 和 
            <code>dataClass.copy</code>。對此請改用 <code>suppressObviousFunctions</code>。
        </p>
        <p>預設值：<code>false</code></p>
    </def>
    <def title="offlineMode">
        <anchor name="includes-json"/>
        <p>是否透過網路解析遠端檔案／連結。</p>
        <p>
            這包括用於產生外部文件連結的 package-list。
            例如，讓標準函式庫中的類別可以點擊。
        </p>
        <p>
            在某些情況下將此設定為 <code>true</code> 可以大幅加快建置速度，
            但也可能降低文件品質和使用者體驗。例如，
            無法解析來自相依項（包括標準函式庫）的類別／成員連結。
        </p>
        <p>
            注意：你可以在本機快取擷取的檔案，並將它們作為本機路徑提供給
            Dokka。請參閱 <code>externalDocumentationLinks</code> 區段。
        </p>
        <p>預設值：<code>false</code></p>
    </def>
    <def title="includes">
        <p>
            包含<a href="dokka-module-and-package-docs.md">模組與套件文件</a>的
            Markdown 檔案清單。
        </p>
        <p>指定檔案的內容會被剖析並作為模組和套件說明嵌入到文件中。</p>
        <p>這可以在個別套件層級進行設定。</p>
    </def>
    <def title="sourceSets">
        <p>
          Kotlin <a href="https://kotlinlang.org/docs/multiplatform-discover-project.html#source-sets">原始碼集</a>的
          個別及額外設定。
        </p>
        <p>有關可能選項的清單，請參閱<a href="#source-set-configuration">原始碼集設定</a>。</p>
    </def>
    <def title="sourceLinks">
        <p>套用於所有原始碼集的全域原始碼連結設定。</p>
        <p>有關可能選項的清單，請參閱<a href="#source-link-configuration">原始碼連結設定</a>。</p>
    </def>
    <def title="perPackageOptions">
        <p>相符套件的全域設定，無論它們位於哪個原始碼集中。</p>
        <p>有關可能選項的清單，請參閱<a href="#per-package-configuration">個別套件設定</a>。</p>
    </def>
    <def title="externalDocumentationLinks">
        <p>外部文件連結的全域設定，無論它們在哪個原始碼集中使用。</p>
        <p>有關可能選項的清單，請參閱<a href="#external-documentation-links-configuration">外部文件連結設定</a>。</p>
    </def>
    <def title="pluginsClasspath">
        <p>包含 Dokka 外掛程式及其相依性的 JAR 檔案清單。</p>
    </def>
</deflist>

### 原始碼集設定 {id="source-set-configuration"}

如何設定 Kotlin
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
      "suppressAnnotatedWith": [
        "com.example.SuppressMe"
      ],
      "sourceLinks":  [
        { "_comment": "Options are described in a separate section" }
      ],
      "perPackageOptions": [
        { "_comment": "Options are described in a separate section" }
      ],
      "externalDocumentationLinks":  [
        { "_comment": "Options are described in a separate section" }
      ]
    }
  ]
}
```

<deflist collapsible="true">
    <def title="displayName">
        <p>用於指稱此原始碼集的顯示名稱。</p>
        <p>
            該名稱既用於外部（例如，原始碼集名稱對文件讀者可見），
            也用於內部（例如，用於 <code>reportUndocumented</code> 的記錄訊息）。
        </p>
        <p>如果你沒有更好的選擇，可以使用平台名稱。</p>
    </def>
    <def title="sourceSetID">
        <p>原始碼集的技術 ID</p>
    </def>
    <def title="documentedVisibilities">
        <p>應記錄在文件中的可見性修飾詞集合。</p>
        <p>
            如果你想記錄 <code>protected</code>/<code>internal</code>/<code>private</code> 宣告，
            或者想要排除 <code>public</code> 宣告而僅記錄內部 API 時，可以使用此選項。
        </p>
        <p>這可以在個別套件層級進行設定。</p>
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
            是否對可見但未撰寫文件的宣告發出警告（即宣告經過 <code>documentedVisibilities</code> 
            和其他篩選條件篩選後缺少 KDoc 的情況）。
        </p>
        <p>此設定與 <code>failOnWarning</code> 搭配使用效果良好。</p>
        <p>這可以在個別套件層級進行設定。</p>
        <p>預設值：<code>false</code></p>
    </def>
    <def title="skipEmptyPackages">
        <p>
            套用各種篩選條件後，是否跳過不包含任何可見宣告的套件。
        </p>
        <p>
            例如，如果 <code>skipDeprecated</code> 設定為 <code>true</code>，且你的套件僅包含
            已棄用的宣告，則該套件將被視為空套件。
        </p>
        <p>CLI 執行器的預設值為 <code>false</code>。</p>
    </def>
    <def title="skipDeprecated">
        <p>是否記錄標註有 <code>@Deprecated</code> 的宣告。</p>
        <p>這可以在個別套件層級進行設定。</p>
        <p>預設值：<code>false</code></p>
    </def>
    <def title="jdkVersion">
        <p>為 Java 型別產生外部文件連結時使用的 JDK 版本。</p>
        <p>
            例如，如果你在某個公開宣告的簽章中使用了 <code>java.util.UUID</code>，
            且此選項設定為 <code>8</code>，Dokka 將為其產生指向
            <a href="https://docs.oracle.com/javase/8/docs/api/java/util/UUID.html">JDK 8 Javadoc</a> 的外部文件連結。
        </p>
    </def>
    <def title="languageVersion">
        <p>
            用於設定分析與 <a href="https://kotlinlang.org/docs/kotlin-doc.html#sample-identifier">@sample</a>
            環境的 <a href="https://kotlinlang.org/docs/compatibility-modes.html">Kotlin 語言版本</a>。
        </p>
    </def>
    <def title="apiVersion">
        <p>
            用於設定分析與 <a href="https://kotlinlang.org/docs/kotlin-doc.html#sample-identifier">@sample</a>
            環境的 <a href="https://kotlinlang.org/docs/compatibility-modes.html">Kotlin API 版本</a>。
        </p>
    </def>
    <def title="noStdlibLink">
        <p>
            是否產生指向 Kotlin 標準函式庫 API 參考文件的外部文件連結。
        </p>
        <p>注意：當 <code>noStdLibLink</code> 設定為 <code>false</code> 時，<b>會</b>產生連結。</p>
        <p>預設值：<code>false</code></p>
    </def>
    <def title="noJdkLink">
        <p>是否產生指向 JDK Javadoc 的外部文件連結。</p>
        <p>JDK Javadoc 的版本由 <code>jdkVersion</code> 選項決定。</p>
        <p>注意：當 <code>noJdkLink</code> 設定為 <code>false</code> 時，<b>會</b>產生連結。</p>
        <p>預設值：<code>false</code></p>
    </def>
    <def title="includes">
        <p>
            包含<a href="dokka-module-and-package-docs.md">模組與套件文件</a>的
            Markdown 檔案清單。
        </p>
        <p>指定檔案的內容會被剖析並作為模組和套件說明嵌入到文件中。</p>
    </def>
    <def title="analysisPlatform">
        <p>
            用於設定程式碼分析與 
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
            要分析並產生文件的原始碼根目錄。
            可接受的輸入包括目錄以及個別的 <code>.kt</code> / <code>.java</code> 檔案。
        </p>
    </def>
    <def title="classpath">
        <p>用於分析和互動式範例的 Classpath。</p>
        <p>如果來自相依性的某些型別未被自動解析／選取，此選項會非常有用。</p>
        <p>此選項同時接受 <code>.jar</code> 與 <code>.klib</code> 檔案。</p>
    </def>
    <def title="samples">
        <p>
            包含透過 <a href="https://kotlinlang.org/docs/kotlin-doc.html#sample-identifier">@sample</a>
            KDoc 標籤參照之範例函式的目錄或檔案清單。
        </p>
    </def>
    <def title="suppressedFiles">
        <p>產生文件時要排除的檔案。</p>
    </def>
    <def title="suppressAnnotatedWith">
        <p>要排除標註有特定註解的宣告之註解完整限定名稱 (FQN) 清單。</p>
        <p>
            標註有其中任一註解的任何宣告都將從產生的文件中排除。
        </p>
    </def>
    <def title="sourceLinks">
        <p>僅套用於此原始碼集的原始碼連結參數集。</p>
        <p>有關可能選項的清單，請參閱<a href="#source-link-configuration">原始碼連結設定</a>。</p>
    </def>
    <def title="perPackageOptions">
        <p>專門套用於此原始碼集中相符套件的參數集。</p>
        <p>有關可能選項的清單，請參閱<a href="#per-package-configuration">個別套件設定</a>。</p>
    </def>
    <def title="externalDocumentationLinks">
        <p>僅套用於此原始碼集的外部文件連結參數集。</p>
        <p>有關可能選項的清單，請參閱<a href="#external-documentation-links-configuration">外部文件連結設定</a>。</p>
    </def>
</deflist>

### 原始碼連結設定 {id="source-link-configuration"}

`sourceLinks` 設定區塊允許你為每個簽章新增一個指向帶有特定行號之 `remoteUrl` 的 `source` 連結。（行號可透過設定 `remoteLineSuffix` 進行設定）。

這有助於讀者找到每個宣告的原始碼。

相關範例，請參閱 `kotlinx.coroutines` 中
[`count()`](https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines.flow/count.html)
函式的文件。

你可以同時為所有原始碼集統一設定原始碼連結，也可以[個別設定](#source-set-configuration)：

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
            文件讀者可以存取的原始碼代管服務 URL，
            例如 GitHub、GitLab、Bitbucket 等。此 URL 用於產生
            宣告的原始碼連結。
        </p>
    </def>
    <def title="remoteLineSuffix">
        <p>
            用於將原始碼行號附加到 URL 的後綴。這有助於讀者不僅能導覽至該檔案，
            還能直接跳轉至宣告所在的特定行號。
        </p>
        <p>
            行號本身會附加在指定的後綴之後。例如，
            若此選項設定為 <code>#L</code> 且行號為 10，則產生的 URL 後綴
            為 <code>#L10</code>。
        </p>
        <p>
            熱門服務所使用的後綴：</p>
            <list>
                <li>GitHub：<code>#L</code></li>
                <li>GitLab：<code>#L</code></li>
                <li>Bitbucket：<code>#lines-</code></li>
            </list>
        <p>預設值：空白（無後綴）</p>
    </def>
</deflist>

### 個別套件設定 {id="per-package-configuration"}

`perPackageOptions` 設定區塊允許為與 `matchingRegex` 相符的特定套件設定部分選項。

你可以同時為所有原始碼集新增套件設定，也可以[個別設定](#source-set-configuration)：

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
        <p>產生文件時是否應略過此套件。</p>
        <p>預設值：<code>false</code></p>
    </def>
    <def title="skipDeprecated">
        <p>是否記錄標註有 <code>@Deprecated</code> 的宣告。</p>
        <p>這可以在專案／模組層級進行設定。</p>
        <p>預設值：<code>false</code></p>
    </def>
    <def title="reportUndocumented">
        <p>
            是否對可見但未撰寫文件的宣告發出警告（即宣告經過 <code>documentedVisibilities</code> 
            和其他篩選條件篩選後缺少 KDoc 的情況）。
        </p>
        <p>此設定與 <code>failOnWarning</code> 搭配使用效果良好。</p>
        <p>這可以在原始碼集層級進行設定。</p>
        <p>預設值：<code>false</code></p>
    </def>
    <def title="documentedVisibilities">
        <p>應記錄在文件中的可見性修飾詞集合。</p>
        <p>
            如果你想記錄此套件內的 <code>protected</code>/<code>internal</code>/<code>private</code> 宣告，
            或者想要排除 <code>public</code> 宣告而僅記錄內部 API 時，可以使用此選項。
        </p>
        <p>可在原始碼集層級進行設定。</p>
        <p>預設值：<code>PUBLIC</code></p>
    </def>
</deflist>

### 外部文件連結設定 {id="external-documentation-links-configuration"}

`externalDocumentationLinks` 區塊允許建立指向相依項之外部代管文件的連結。

例如，如果你使用了來自 `kotlinx.serialization` 的型別，預設情況下它們在你的文件中是無法點擊的，就如同尚未解析一樣。然而，由於 `kotlinx.serialization` 的 API 參考文件是由 Dokka 建置並[發布在 kotlinlang.org](https://kotlinlang.org/api/kotlinx.serialization/) 上，你可以為其設定外部文件連結。這樣一來，Dokka 就能為來自該程式庫的型別產生連結，使其成功解析並可點擊。

你可以同時為所有原始碼集統一設定外部文件連結，也可以[個別設定](#source-set-configuration)：

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
        <p>要連結的文件根 URL。它<b>必須</b>包含結尾斜線。</p>
        <p>
            Dokka 會盡力自動尋找指定 URL 的 <code>package-list</code>，
            並將宣告連結在一起。
        </p>
        <p>
            如果自動解析失敗，或者你想改用本機快取的檔案，
            請考慮設定 <code>packageListUrl</code> 選項。
        </p>
    </def>
    <def title="packageListUrl">
        <p>
            <code>package-list</code> 的精確位置。這是依賴 Dokka
            自動解析之外的另一種選擇。
        </p>
        <p>
            Package 清單包含有關文件和專案本身的資訊，
            例如模組與套件名稱。
        </p>
        <p>這也可以是本機快取的檔案，以避免網路請求。</p>
    </def>
</deflist>

### 完整設定 {id="complete-configuration"}

以下你可以看到同時套用所有可能設定選項的範例。

```json
{
  "moduleName": "Dokka Example",
  "moduleVersion": null,
  "outputDir": "./build/dokka/html",
  "failOnWarning": false,
  "suppressObviousFunctions": true,
  "suppressInheritedMembers": false,
  "offlineMode": false,
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