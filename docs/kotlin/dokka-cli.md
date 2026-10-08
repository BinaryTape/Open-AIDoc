[//]: # (title: CLI)

如果出于某些原因你无法使用 [Gradle](dokka-gradle.md) 或 [Maven](dokka-maven.md) 构建工具，Dokka 提供了一个用于生成文档的命令行 (CLI) 运行器。

相比之下，它具有与 Dokka 的 Gradle 插件相同（甚至更多）的功能。虽然由于没有自动配置，它的设置要困难得多，特别是在多平台和多模块环境中。

## 开始使用 {id="get-started"}

CLI 运行器作为一个独立的、可运行的构件发布到 Maven Central。

你可以在 [Maven Central](https://central.sonatype.com/artifact/org.jetbrains.dokka/dokka-cli) 上找到它，或者[直接下载](https://repo1.maven.org/maven2/org/jetbrains/dokka/dokka-cli/%dokkaVersion%/dokka-cli-%dokkaVersion%.jar)。

将 `dokka-cli-%dokkaVersion%.jar` 文件保存到你的计算机后，使用 `-help` 选项运行它，以查看所有可用的配置选项及其描述：

```Bash
java -jar dokka-cli-%dokkaVersion%.jar -help
```

它也适用于某些嵌套选项，例如 `-sourceSet`：

```Bash
java -jar dokka-cli-%dokkaVersion%.jar -sourceSet -help
```

## 生成文档 {id="generate-documentation"}

### 前提条件 {id="prerequisites"}

由于没有构建工具来管理依赖项，你必须自行提供依赖项的 `.jar` 文件。

下面列出了任何输出格式所需的依赖项：

| **组 (Group)**        | **构件 (Artifact)**           | **版本**       | **链接**                                                                                                                                                 |
|-----------------------|-------------------------------|----------------|----------------------------------------------------------------------------------------------------------------------------------------------------------|
| `org.jetbrains.dokka` | `dokka-base`                  | %dokkaVersion% | [下载](https://repo1.maven.org/maven2/org/jetbrains/dokka/dokka-base/%dokkaVersion%/dokka-base-%dokkaVersion%.jar)                                   |
| `org.jetbrains.dokka` | `analysis-kotlin-symbols` | %dokkaVersion% | [下载](https://repo1.maven.org/maven2/org/jetbrains/dokka/analysis-kotlin-symbols/%dokkaVersion%/analysis-kotlin-symbols-%dokkaVersion%.jar) |

以下是 [HTML](dokka-html.md) 输出格式所需的额外依赖项：

| **组 (Group)**          | **构件 (Artifact)** | **版本** | **链接**                                                                                                           |
|-------------------------|--------------------|----------|--------------------------------------------------------------------------------------------------------------------|
| `org.jetbrains.kotlinx` | `kotlinx-html-jvm` | 0.8.0    | [下载](https://repo1.maven.org/maven2/org/jetbrains/kotlinx/kotlinx-html-jvm/0.8.0/kotlinx-html-jvm-0.8.0.jar) |
| `org.freemarker`        | `freemarker`       | 2.3.31   | [下载](https://repo1.maven.org/maven2/org/freemarker/freemarker/2.3.31/freemarker-2.3.31.jar)                  |

### 使用命令行选项运行 {id="run-with-command-line-options"}

你可以传递命令行选项来配置 CLI 运行器。

你至少需要提供以下选项：

* `-pluginsClasspath` - 以分号 `;` 分隔的已下载依赖项的绝对/相对路径列表
* `-sourceSet` - 要为其生成文档的源代码的绝对路径
* `-outputDir` - 文档输出目录的绝对/相对路径

```Bash
java -jar dokka-cli-%dokkaVersion%.jar \
     -pluginsClasspath "./dokka-base-%dokkaVersion%.jar;./analysis-kotlin-symbols-%dokkaVersion%.jar;./kotlinx-html-jvm-0.8.0.jar;./freemarker-2.3.31.jar" \
     -sourceSet "-src /home/myCoolProject/src/main/kotlin" \
     -outputDir "./dokka/html"
```

执行给定的示例将以 [HTML](dokka-html.md) 输出格式生成文档。

有关更多配置详细信息，请参阅[命令行选项](#命令行选项)。

### 使用 JSON 配置运行 {id="run-with-json-configuration"}

可以使用 JSON 配置 CLI 运行器。在这种情况下，你需要提供指向 JSON 配置文件的绝对/相对路径作为第一个也是唯一的实参。所有其他配置选项都将从中解析。

```Bash
java -jar dokka-cli-%dokkaVersion%.jar dokka-configuration.json
```

你至少需要以下 JSON 配置文件：

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

有关更多详细信息，请参阅 [JSON 配置选项](#json-配置)。

### 其他输出格式 {id="other-output-formats"}

默认情况下，`dokka-base` 构件仅包含 [HTML](dokka-html.md) 输出格式。

所有其他输出格式均作为 [Dokka 插件](dokka-plugins.md)实现。为了使用它们，你必须将它们放入插件类路径中。

例如，如果你想以实验性的 [GFM](https://github.com/Kotlin/dokka/blob/8e5c63d035ef44a269b8c43430f43f5c8eebfb63/dokka-subprojects/plugin-gfm/README.md) 输出格式生成文档，你需要下载并向 `pluginsClasspath` 配置选项传递 gfm-plugin 的 JAR ([下载](https://repo1.maven.org/maven2/org/jetbrains/dokka/gfm-plugin/%dokkaVersion%/gfm-plugin-%dokkaVersion%.jar))。

通过命令行选项：

```Shell
java -jar dokka-cli-%dokkaVersion%.jar \
     -pluginsClasspath "./dokka-base-%dokkaVersion%.jar;...;./gfm-plugin-%dokkaVersion%.jar" \
     ...
```

通过 JSON 配置：

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

将 GFM 插件传递给 `pluginsClasspath` 后，CLI 运行器将以 GFM 输出格式生成文档。

有关更多信息，请参阅 [GFM](https://github.com/Kotlin/dokka/blob/8e5c63d035ef44a269b8c43430f43f5c8eebfb63/dokka-subprojects/plugin-gfm/README.md) 和 [Javadoc](dokka-javadoc.md#生成-javadoc-文档) 页面。

## 命令行选项 {id="command-line-options"}

要查看所有可能的命令行选项及其详细描述的列表，请运行：

```Bash
java -jar dokka-cli-%dokkaVersion%.jar -help
```

简短摘要：

| 选项                           | 描述                                                                                                                                                                                           |
|------------------------------|----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `moduleName`                 | 项目/模块的名称。                                                                                                                                                                               |
| `moduleVersion`              | 文档化版本。                                                                                                                                                                                   |
| `outputDir`                  | 输出目录路径，默认为 `./dokka`。                                                                                                                                                                |
| `sourceSet`                  | Dokka 源集的配置。包含嵌套配置选项。                                                                                                                                                             |
| `pluginsConfiguration`       | Dokka 插件的配置。                                                                                                                                                                              |
| `pluginsClasspath`           | 包含 Dokka 插件及其依赖项的 jar 列表。接受由分号分隔的多个路径。                                                                                                                                    |
| `offlineMode`                | 是否通过网络解析远程文件/链接。                                                                                                                                                                 |
| `failOnWarning`              | 如果 Dokka 发出了警告或错误，是否使文档生成失败。                                                                                                                                                 |
| `delayTemplateSubstitution`  | 是否延迟某些元素的替换。用于多模块项目的增量构建。                                                                                                                                                 |
| `noSuppressObviousFunctions` | 是否抑制显而易见的函数，例如继承自 `kotlin.Any` 和 `java.lang.Object` 的函数。                                                                                                                   |
| `includes`                   | 包含模块和软件包文档的 Markdown 文件。接受由分号分隔的多个值。                                                                                                                                      |
| `suppressInheritedMembers`   | 是否抑制在给定类中未显式重写的继承成员。                                                                                                                                                          |
| `globalPackageOptions`       | 格式为 `"matchingRegex,-deprecated,-privateApi,+warnUndocumented,+suppress;+visibility:PUBLIC;..."` 的软件包配置选项全局列表。接受由分号分隔的多个值。                                                  |
| `globalLinks`                | 格式为 `{url}^{packageListUrl}` 的全局外部文档链接。接受由 `^^` 分隔的多个值。                                                                                                                     |
| `globalSrcLink`              | 源目录与用于浏览代码的 Web 服务之间的全局映射。接受由分号分隔的多个路径。                                                                                                                          |
| `helpSourceSet`              | 打印嵌套 `-sourceSet` 配置的帮助信息。                                                                                                                                                           |
| `loggingLevel`               | 日志级别，可能的值：`DEBUG, PROGRESS, INFO, WARN, ERROR`。                                                                                                                                     |
| `help, h`                    | 用法信息。                                                                                                                                                                                     |

#### 源集选项 {id="source-set-options"}

要查看嵌套 `-sourceSet` 配置的命令行选项列表，请运行：

```Bash
java -jar dokka-cli-%dokkaVersion%.jar -sourceSet -help
```

简短摘要：

| 选项                           | 描述                                                                                                                                                                          |
|------------------------------|-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `sourceSetName`              | 源集的名称。                                                                                                                                                                  |
| `displayName`                | 源集的显示名称，同时用于内部和外部。                                                                                                                                           |
| `classpath`                  | 用于分析和交互式示例的 classpath。接受由分号分隔的多个路径。                                                                                                                     |
| `src`                        | 要进行分析和文档化的源码根目录。接受由分号分隔的多个路径。                                                                                                                       |
| `dependentSourceSets`        | 依赖源集的名称，格式为 `moduleName/sourceSetName`。接受由分号分隔的多个值。                                                                                                      |
| `samples`                    | 包含示例函数的目录或文件列表。接受由分号分隔的多个路径。 <anchor name="includes-cli"/>                                                                                            |
| `includes`                   | 包含[模块和软件包文档](dokka-module-and-package-docs.md)的 Markdown 文件。接受由分号分隔的多个路径。                                                                             |
| `documentedVisibilities`     | 要文档化的可见性。接受由分号分隔的多个值。可能的值：`PUBLIC`、`PRIVATE`、`PROTECTED`、`INTERNAL`、`PACKAGE`。                                                                    |
| `reportUndocumented`         | 是否报告未文档化的声明。                                                                                                                                                      | 
| `noSkipEmptyPackages`        | 是否为空软件包创建页面。                                                                                                                                                      | 
| `skipDeprecated`             | 是否跳过已弃用的声明。                                                                                                                                                        | 
| `jdkVersion`                 | 用于链接到 JDK Javadoc 的 JDK 版本。                                                                                                                                          |
| `languageVersion`            | 用于设置分析和示例环境的语言版本。                                                                                                                                             |
| `apiVersion`                 | 用于设置分析和示例环境的 Kotlin API 版本。                                                                                                                                     |
| `noStdlibLink`               | 是否生成指向 Kotlin 标准库的链接。                                                                                                                                            | 
| `noJdkLink`                  | 是否生成指向 JDK Javadoc 的链接。                                                                                                                                              | 
| `suppressedFiles`            | 要抑制的文件路径。接受由分号分隔的多个路径。                                                                                                                                   |
| `suppressAnnotatedWith`      | 用于抑制带有指定注解声明的注解完全限定名 (FQNs)。接受由分号分隔的多个值。                                                                                                       |
| `analysisPlatform`           | 用于设置分析的平台。                                                                                                                                                          |
| `perPackageOptions`          | 软件包源集配置列表，格式为 `matchingRegexp,-deprecated,-privateApi,+warnUndocumented,+suppress;...`。接受由分号分隔的多个值。                                                   |
| `externalDocumentationLinks` | 外部文档链接，格式为 `{url}^{packageListUrl}`。接受由 `^^` 分隔的多个值。                                                                                                       |
| `srcLink`                    | 源目录与用于浏览代码的 Web 服务之间的映射。接受由分号分隔的多个路径。                                                                                                           |

## JSON 配置 {id="json-configuration"}

下面是每个配置部分的示例和详细描述。你还可以在页面底部找到应用了[所有配置选项](#完整配置)的示例。

### 通用配置 {id="general-configuration"}

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
    { "_comment": "选项在单独的章节中说明" }
  ],
  "perPackageOptions": [
    { "_comment": "选项在单独的章节中说明" }
  ],
  "externalDocumentationLinks":  [
    { "_comment": "选项在单独的章节中说明" }
  ],
  "sourceSets": [
    { "_comment": "选项在单独的章节中说明" }
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
        <p>用于引用该模块的显示名称。它用于目录、导航、日志记录等。</p>
        <p>默认值：<code>root</code></p>
    </def>
    <def title="moduleVersion">
        <p>模块版本。</p>
        <p>默认值：空</p>
    </def>
    <def title="outputDirectory">
        <p>无论输出格式如何，文档生成的目录。</p>
        <p>默认值：<code>./dokka</code></p>
    </def>
    <def title="failOnWarning">
        <p>
            如果 Dokka 发出了警告或错误，是否使文档生成失败。
            进程会等待所有错误和警告都发出后再停止。
        </p>
        <p>此设置与 <code>reportUndocumented</code> 配合使用效果很好。</p>
        <p>默认值：<code>false</code></p>
    </def>
    <def title="suppressObviousFunctions">
        <p>是否抑制显而易见的函数。</p>
            一个函数被认为是显而易见的，如果它是：
            <list>
                <li>
                    继承自 <code>kotlin.Any</code>、<code>Kotlin.Enum</code>、<code>java.lang.Object</code> 或
                    <code>java.lang.Enum</code>，例如 <code>equals</code>、<code>hashCode</code>、<code>toString</code>。
                </li>
                <li>
                    合成的（由编译器生成）且没有任何文档，例如
                    <code>dataClass.componentN</code> 或 <code>dataClass.copy</code>。
                </li>
            </list>
        <p>默认值：<code>true</code></p>
    </def>
    <def title="suppressInheritedMembers">
        <p>是否抑制在给定类中未显式重写的继承成员。</p>
        <p>
            注意：这可以抑制诸如 <code>equals</code> / <code>hashCode</code> / <code>toString</code> 之类的函数，
            但不能抑制诸如 <code>dataClass.componentN</code> 和 
            <code>dataClass.copy</code> 之类的合成函数。请使用 <code>suppressObviousFunctions</code>
            来实现该目的。
        </p>
        <p>默认值：<code>false</code></p>
    </def>
    <def title="offlineMode">
        <anchor name="includes-json"/>
        <p>是否通过网络解析远程文件/链接。</p>
        <p>
            这包括用于生成外部文档链接的 package-list。
            例如，使标准库中的类可以点击。 
        </p>
        <p>
            在某些情况下，将此项设置为 <code>true</code> 可以显著加快构建速度，
            但也可能会降低文档质量和用户体验。例如，
            无法解析来自依赖项（包括标准库）的类/成员链接。
        </p>
        <p>
            注意：你可以在本地缓存获取的文件，并将其作为本地路径提供给
            Dokka。请参阅 <code>externalDocumentationLinks</code> 章节。
        </p>
        <p>默认值：<code>false</code></p>
    </def>
    <def title="includes">
        <p>
            包含
            <a href="dokka-module-and-package-docs.md">模块和软件包文档</a>的 Markdown 文件列表。
        </p>
        <p>指定文件的内容将被解析并作为模块和软件包描述嵌入到文档中。</p>
        <p>可以按软件包进行配置。</p>
    </def>
    <def title="sourceSets">
        <p>
          Kotlin 
          <a href="https://kotlinlang.org/docs/multiplatform-discover-project.html#source-sets">源集</a>的单独及附加配置。
        </p>
        <p>有关可能选项的列表，请参阅<a href="#源集配置">源集配置</a>。</p>
    </def>
    <def title="sourceLinks">
        <p>应用于所有源集的源码链接全局配置。</p>
        <p>有关可能选项的列表，请参阅<a href="#源码链接配置">源码链接配置</a>。</p>
    </def>
    <def title="perPackageOptions">
        <p>无论匹配的软件包位于哪个源集中，对其进行的全局配置。</p>
        <p>有关可能选项的列表，请参阅<a href="#按软件包配置">按软件包配置</a>。</p>
    </def>
    <def title="externalDocumentationLinks">
        <p>无论外部文档链接在哪个源集中使用，对其进行的全局配置。</p>
        <p>有关可能选项的列表，请参阅<a href="#外部文档链接配置">外部文档链接配置</a>。</p>
    </def>
    <def title="pluginsClasspath">
        <p>包含 Dokka 插件及其依赖项的 JAR 文件列表。</p>
    </def>
</deflist>

### 源集配置 {id="source-set-configuration"}

如何配置 Kotlin
[源集](https://kotlinlang.org/docs/multiplatform-discover-project.html#source-sets)：

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
        { "_comment": "选项在单独的章节中说明" }
      ],
      "perPackageOptions": [
        { "_comment": "选项在单独的章节中说明" }
      ],
      "externalDocumentationLinks":  [
        { "_comment": "选项在单独的章节中说明" }
      ]
    }
  ]
}
```

<deflist collapsible="true">
    <def title="displayName">
        <p>用于引用此源集的显示名称。</p>
        <p>
            该名称同时用于外部（例如，源集名称对文档读者可见）和 
            内部（例如，用于 <code>reportUndocumented</code> 的日志消息）。
        </p>
        <p>如果你没有更好的选择，可以使用平台名称。</p>
    </def>
    <def title="sourceSetID">
        <p>源集的技术 ID</p>
    </def>
    <def title="documentedVisibilities">
        <p>应被文档化的可见性修饰符集合。</p>
        <p>
            如果你想文档化 <code>protected</code>/<code>internal</code>/<code>private</code> 声明，
            或者你想排除 <code>public</code> 声明并仅文档化内部 API，则可以使用此项。
        </p>
        <p>可以按软件包进行配置。</p>
        <p>
            可能的值：</p>
            <list>
                <li><code>PUBLIC</code></li>
                <li><code>PRIVATE</code></li>
                <li><code>PROTECTED</code></li>
                <li><code>INTERNAL</code></li>
                <li><code>PACKAGE</code></li>
            </list>
        <p>默认值：<code>PUBLIC</code></p>
    </def>
    <def title="reportUndocumented">
        <p>
            是否对可见的未文档化声明发出警告，即在通过 <code>documentedVisibilities</code> 
            和其他过滤器过滤后没有 KDoc 的声明。
        </p>
        <p>此设置与 <code>failOnWarning</code> 配合使用效果很好。</p>
        <p>可以按软件包进行配置。</p>
        <p>默认值：<code>false</code></p>
    </def>
    <def title="skipEmptyPackages">
        <p>
            在应用各种过滤器后，是否跳过不包含可见声明的软件包。
        </p>
        <p>
            例如，如果 <code>skipDeprecated</code> 设置为 <code>true</code> 且你的软件包仅包含
            已弃用的声明，则该软件包被视为空。
        </p>
        <p>CLI 运行器的默认值为 <code>false</code>。</p>
    </def>
    <def title="skipDeprecated">
        <p>是否对带有 <code>@Deprecated</code> 注解的声明进行文档化。</p>
        <p>可以按软件包进行配置。</p>
        <p>默认值：<code>false</code></p>
    </def>
    <def title="jdkVersion">
        <p>为 Java 类型生成外部文档链接时要使用的 JDK 版本。</p>
        <p>
            例如，如果你在某些公共声明签名中使用 <code>java.util.UUID</code>，
            并且此选项设置为 <code>8</code>，则 Dokka 会为其生成指向 
            <a href="https://docs.oracle.com/javase/8/docs/api/java/util/UUID.html">JDK 8 Javadoc</a> 的外部文档链接。
        </p>
    </def>
    <def title="languageVersion">
        <p>
            用于设置分析和 <a href="https://kotlinlang.org/docs/kotlin-doc.html#sample-identifier">@sample</a> 
            环境的 <a href="https://kotlinlang.org/docs/compatibility-modes.html">Kotlin 语言版本</a>。
        </p>
    </def>
    <def title="apiVersion">
        <p>
            用于设置分析和 <a href="https://kotlinlang.org/docs/kotlin-doc.html#sample-identifier">@sample</a> 
            环境的 <a href="https://kotlinlang.org/docs/compatibility-modes.html">Kotlin API 版本</a>。
        </p>
    </def>
    <def title="noStdlibLink">
        <p>
            是否生成指向 Kotlin 标准库 API 参考文档的外部文档链接。
        </p>
        <p>注意：当 <code>noStdLibLink</code> 设置为 <code>false</code> 时<b>会</b>生成链接。</p>
        <p>默认值：<code>false</code></p>
    </def>
    <def title="noJdkLink">
        <p>是否生成指向 JDK Javadoc 的外部文档链接。</p>
        <p>JDK Javadoc 的版本由 <code>jdkVersion</code> 选项决定。</p>
        <p>注意：当 <code>noJdkLink</code> 设置为 <code>false</code> 时<b>会</b>生成链接。</p>
        <p>默认值：<code>false</code></p>
    </def>
    <def title="includes">
        <p>
            包含
            <a href="dokka-module-and-package-docs.md">模块和软件包文档</a>的 Markdown 文件列表。
        </p>
        <p>指定文件的内容将被解析并作为模块和软件包描述嵌入到文档中。</p>
    </def>
    <def title="analysisPlatform">
        <p>
            用于设置代码分析和 
            <a href="https://kotlinlang.org/docs/kotlin-doc.html#sample-identifier">@sample</a> 环境的平台。
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
            要进行分析和文档化的源码根目录。
            可接受的输入是目录和单个 <code>.kt</code> / <code>.java</code> 文件。
        </p>
    </def>
    <def title="classpath">
        <p>用于分析和交互式示例的 classpath。</p>
        <p>如果某些来自依赖项的类型无法自动解析/提取，此选项非常有用。</p>
        <p>此选项接受 <code>.jar</code> 和 <code>.klib</code> 文件。</p>
    </def>
    <def title="samples">
        <p>
            包含示例函数的目录或文件列表，这些函数通过 
            <a href="https://kotlinlang.org/docs/kotlin-doc.html#sample-identifier">@sample</a> KDoc 标记引用。
        </p>
    </def>
    <def title="suppressedFiles">
        <p>生成文档时要抑制的文件。</p>
    </def>
    <def title="suppressAnnotatedWith">
        <p>用于抑制带有指定注解声明的注解完全限定名 (FQNs) 列表。</p>
        <p>
            任何带有这些注解之一的声明都将从生成的文档中排除。
        </p>
    </def>
    <def title="sourceLinks">
        <p>仅应用于此源集的源码链接参数集。</p>
        <p>有关可能选项的列表，请参阅<a href="#源码链接配置">源码链接配置</a>。</p>
    </def>
    <def title="perPackageOptions">
        <p>仅针对此源集中匹配的软件包的特定参数集。</p>
        <p>有关可能选项的列表，请参阅<a href="#按软件包配置">按软件包配置</a>。</p>
    </def>
    <def title="externalDocumentationLinks">
        <p>仅应用于此源集的外部文档链接参数集。</p>
        <p>有关可能选项的列表，请参阅<a href="#外部文档链接配置">外部文档链接配置</a>。</p>
    </def>
</deflist>

### 源码链接配置 {id="source-link-configuration"}

`sourceLinks` 配置块允许你为每个签名添加一个 `source` 链接，该链接指向带有特定行号的 `remoteUrl`。（行号可通过设置 `remoteLineSuffix` 进行配置）。

这有助于读者找到每个声明的源代码。

有关示例，请参阅 `kotlinx.coroutines` 中 
[`count()`](https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines.flow/count.html) 
函数的文档。

你可以同时为所有源集配置源码链接，也可以[单独配置](#源集配置)：

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
        <p>本地源码目录的路径。</p>
    </def>
    <def title="remoteUrl">
        <p>
            文档读者可以访问的源代码托管服务的 URL，
            例如 GitHub、GitLab、Bitbucket 等。此 URL 用于生成
            声明的源代码链接。
        </p>
    </def>
    <def title="remoteLineSuffix">
        <p>
            用于将源代码行号附加到 URL 的后缀。这有助于读者不仅能导航到文件，
            还能导航到声明的特定行号。
        </p>
        <p>
            数字本身会附加到指定的后缀。例如，
            如果此选项设置为 <code>#L</code> 和行号为 10，则生成的 URL 后缀
            为 <code>#L10</code>。
        </p>
        <p>
            流行服务使用的后缀：</p>
            <list>
                <li>GitHub: <code>#L</code></li>
                <li>GitLab: <code>#L</code></li>
                <li>Bitbucket: <code>#lines-</code></li>
            </list>
        <p>默认值：空（无后缀）</p>
    </def>
</deflist>

### 按软件包配置 {id="per-package-configuration"}

`perPackageOptions` 配置块允许为通过 `matchingRegex` 匹配的特定软件包设置某些选项。

你可以同时为所有源集添加软件包配置，也可以[单独配置](#源集配置)：

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
        <p>用于匹配软件包的正则表达式。</p>
    </def>
    <def title="suppress">
        <p>生成文档时是否应跳过此软件包。</p>
        <p>默认值：<code>false</code></p>
    </def>
    <def title="skipDeprecated">
        <p>是否对带有 <code>@Deprecated</code> 注解的声明进行文档化。</p>
        <p>这可以在项目/模块级别设置。</p>
        <p>默认值：<code>false</code></p>
    </def>
    <def title="reportUndocumented">
        <p>
            是否对可见的未文档化声明发出警告，即在通过 <code>documentedVisibilities</code> 
            和其他过滤器过滤后没有 KDoc 的声明。
        </p>
        <p>此设置与 <code>failOnWarning</code> 配合使用效果很好。</p>
        <p>这可以在源集级别配置。</p>
        <p>默认值：<code>false</code></p>
    </def>
    <def title="documentedVisibilities">
        <p>应被文档化的可见性修饰符集合。</p>
        <p>
            如果你想文档化此软件包内的 <code>protected</code>/<code>internal</code>/<code>private</code> 声明，
            或者你想排除 <code>public</code> 声明并仅文档化内部 API，则可以使用此项。
        </p>
        <p>可以在源集级别配置。</p>
        <p>默认值：<code>PUBLIC</code></p>
    </def>
</deflist>

### 外部文档链接配置 {id="external-documentation-links-configuration"}

`externalDocumentationLinks` 块允许创建指向依赖项的外部托管文档的链接。

例如，如果你正在使用来自 `kotlinx.serialization` 的类型，默认情况下它们在你的文档中是无法点击的，就像它们未解析一样。但是，由于 `kotlinx.serialization` 的 API 参考文档是由 Dokka 构建并[发布在 kotlinlang.org 上的](https://kotlinlang.org/api/kotlinx.serialization/)，你可以为其配置外部文档链接。这样 Dokka 就能为该库中的类型生成链接，使它们能够成功解析并可点击。

你可以同时为所有源集配置外部文档链接，也可以[单独配置](#源集配置)：

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
        <p>要链接到的文档的根 URL。它<b>必须</b>包含一个尾随斜杠。</p>
        <p>
            Dokka 会尽力自动查找给定 URL 的 <code>package-list</code>， 
            并将声明链接在一起。
        </p>
        <p>
            如果自动解析失败，或者你想使用本地缓存的文件， 
            请考虑设置 <code>packageListUrl</code> 选项。
        </p>
    </def>
    <def title="packageListUrl">
        <p>
            <code>package-list</code> 的确切位置。这是依靠 Dokka 
            自动解析它的替代方案。
        </p>
        <p>
            软件包列表包含有关文档和项目本身的信息， 
            例如模块和软件包名称。
        </p>
        <p>这也可以是一个本地缓存的文件，以避免网络调用。</p>
    </def>
</deflist>

### 完整配置 {id="complete-configuration"}

下面你可以看到同时应用的所有可能配置选项。

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
      "values": "{\"separateInheritedMembers\":false,\"footerMessage\":\"© 2021 相当不错的版权信息\"}"
    }
  ],
  "includes": [
    "module.md"
  ]
}
```
