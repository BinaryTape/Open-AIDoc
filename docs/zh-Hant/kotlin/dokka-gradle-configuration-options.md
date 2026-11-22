[//]: # (title: Dokka Gradle 配置選項)

Dokka 提供了許多配置選項，用以自訂你與讀者的體驗。

以下是各個配置區段的詳細說明與部分範例。
你也可以找到套用了 [所有配置選項](#complete-configuration) 的範例。

如需在單一專案與多專案組建中套用配置區塊的更多詳細資訊，
請參閱[配置範例](dokka-gradle.md#configuration-examples)。

### 一般配置 {id="general-configuration"}

以下是一般 Dokka Gradle 外掛程式配置的範例：

* 使用最頂層的 `dokka {}` DSL 配置。
* 在 DGP 中，於 `dokkaPublications{}` 區塊內宣告 Dokka 發佈配置。
* 預設的發佈項目為 [`html`](dokka-html.md) 與 [`javadoc`](dokka-javadoc.md)。

* `build.gradle.kts` 檔案的語法與一般 `.kt` 檔案（例如用於 Kotlin 自訂外掛程式的檔案）不同，因為 Gradle 的 Kotlin DSL 使用了型別安全存取器。

<tabs group="build-script">
<tab title="Gradle Kotlin DSL" group-key="kotlin">

```kotlin
plugins {
    id("org.jetbrains.dokka") version "%dokkaVersion%"
}

dokka {
    dokkaPublications.html {
        moduleName.set(project.name)
        moduleVersion.set(project.version.toString())
        // Standard output directory for HTML documentation
        outputDirectory.set(layout.buildDirectory.dir("dokka/html"))
        failOnWarning.set(false)
        suppressInheritedMembers.set(false)
        suppressObviousFunctions.set(true)
        offlineMode.set(false)
        includes.from("packages.md", "extra.md")
        
        // Output directory for additional files
        // Use this block instead of the standard when you 
        // want to change the output directory and include extra files
        outputDirectory.set(rootDir.resolve("docs/api/0.x"))
        
        // Use fileTree to add multiple files
        includes.from(
            fileTree("docs") {
                include("**/*.md")
            }
        )
    }
}
```

如需有關處理檔案的更多資訊，請參閱 [Gradle 文件](https://docs.gradle.org/current/userguide/working_with_files.html#sec:file_trees)。

</tab>
<tab title="Kotlin custom plugin" group-key="kotlin custom">

```kotlin
// CustomPlugin.kt

import org.gradle.api.Plugin
import org.gradle.api.Project
import org.jetbrains.dokka.gradle.DokkaExtension

abstract class CustomPlugin : Plugin<Project> {
    override fun apply(project: Project) {
        project.plugins.apply("org.jetbrains.dokka")

        project.extensions.configure(DokkaExtension::class.java) { dokka ->
            
            dokka.moduleName.set(project.name)
            dokka.moduleVersion.set(project.version.toString())

            dokka.dokkaPublications.named("html") { publication ->
                // Standard output directory for HTML documentation
                publication.outputDirectory.set(project.layout.buildDirectory.dir("dokka/html"))
                publication.failOnWarning.set(true)
                publication.suppressInheritedMembers.set(true)
                publication.offlineMode.set(false)
                publication.suppressObviousFunctions.set(true)
                publication.includes.from("packages.md", "extra.md")

                // Output directory for additional files
                // Use this instead of the standard block when you 
                // want to change the output directory and include extra files
                html.outputDirectory.set(project.rootDir.resolve("docs/api/0.x"))
            }
        }
    }
}
```

</tab>
<tab title="Gradle Groovy DSL" group-key="groovy">

```groovy
plugins {
    id 'org.jetbrains.dokka' version '%dokkaVersion%'
}

dokka {
    dokkaPublications {
        html {
            // Sets general module information
            moduleName.set(project.name)
            moduleVersion.set(project.version.toString())

            // Standard output directory for HTML documentation
            outputDirectory.set(layout.buildDirectory.dir("dokka/html"))

            // Core Dokka options
            failOnWarning.set(false)
            suppressInheritedMembers.set(false)
            suppressObviousFunctions.set(true)
            offlineMode.set(false)
            includes.from(files("packages.md", "extra.md"))

            // Output directory for additional files
            // Use this block instead of the standard when you want to 
            // change the output directory and include extra files
            outputDirectory.set(file("$rootDir/docs/api/0.x"))
        }
    }
}
```

</tab>
</tabs>

<deflist collapsible="true">
    <def title="moduleName">
        <p>
           專案文件的顯示名稱。它會出現在目錄、導覽、頁首以及記錄訊息中。在多專案組建中，每個子專案的 <code>moduleName</code> 會在彙總文件中用作其章節標題。
        </p>
        <p>預設值：Gradle 專案名稱</p>
    </def>
    <def title="moduleVersion">
        <p>
            顯示在產生的文件中的子專案版本。
            在單一專案組建中，它會用作專案版本。
            在多專案組建中，彙總文件時會使用每個子專案的 <code>moduleVersion</code>。
        </p>
        <p>預設值：Gradle 專案版本</p>
    </def>
    <def title="outputDirectory">
        <p>儲存產生之文件的目錄。</p>
        <p>此設定適用於由 <code>dokkaGenerate</code> 任務產生的所有文件格式（HTML、Javadoc 等）。</p>
        <p>預設值：<code>build/dokka/html</code></p>
        <p><b>額外檔案的輸出目錄</b></p>
        <p>你可以為單一專案和多專案組建指定輸出目錄並納入額外檔案。
           對於多專案組建，
           請在根專案的配置中設定輸出目錄並納入額外檔案。
        </p>
    </def>
    <def title="failOnWarning">
        <p>
            決定在產生文件期間出現警告時，Dokka 是否應讓組建失敗。
            該處理程序會等待所有錯誤與警告先行發出後再執行中斷。
        </p>
        <p>此設定與 <code>reportUndocumented</code> 搭配使用效果極佳。</p>
        <p>預設值：<code>false</code></p>
    </def>
    <def title="suppressInheritedMembers">
        <p>是否抑制未在指定類別中明確覆寫的繼承成員。</p>
        <p>
            注意：
            這會抑制諸如 <code>equals</code>、<code>hashCode</code> 與 <code>toString</code> 等函式，
            但不會抑制諸如 <code>dataClass.componentN</code> 與 
            <code>dataClass.copy</code> 等合成函式。若要抑制後者，請使用 <code>suppressObviousFunctions</code>。
        </p>
        <p>預設值：<code>false</code></p>
    </def>
    <def title="suppressObviousFunctions">
        <p>是否抑制顯而易見的函式。</p>
        <p>
            如果符合以下情況，則該函式會被視為顯而易見的函式：</p>
            <list>
                <li>
                    繼承自 <code>kotlin.Any</code>、<code>Kotlin.Enum</code>、<code>java.lang.Object</code> 或
                    <code>java.lang.Enum</code>，例如 <code>equals</code>、<code>hashCode</code>、<code>toString</code>。
                </li>
                <li>
                    合成的（由編譯器產生）且沒有任何說明文件，例如
                    <code>dataClass.componentN</code> 或 <code>dataClass.copy</code>。
                </li>
            </list>
        <p>預設值：<code>true</code></p>
    </def>
    <def title="offlineMode">
        <p>是否透過網路解析遠端檔案與連結。</p>
        <p>
            這包含用於產生外部文件連結的 package-list。
            例如，這可讓標準程式庫中的類別在你的文件中變為可點擊。
        </p>
        <p>
            在某些情況下，將此項設為 <code>true</code> 可以大幅提升組建速度，
            但也可能會降低使用者體驗。例如，
            將無法解析來自依賴項（包含標準程式庫）的類別與成員連結。
        </p>
        <p>注意：你可以將擷取的檔案快取至本機，並以本機路徑提供給 Dokka。請參閱 
           <code>&lt;a href="#external-documentation-links-configuration"&gt;externalDocumentationLinks&lt;/a&gt;</code> 區段。</p>
        <p>預設值：<code>false</code></p>
    </def>
     <def title="includes">
        <p>
            包含
            <a href="dokka-module-and-package-docs.md">子專案與套件文件</a>的 Markdown 檔案清單。Markdown 檔案必須符合<a href="dokka-module-and-package-docs.md#file-format">格式需求</a>。
        </p>
        <p>指定檔案的內容會被剖析並作為子專案與套件說明嵌入至文件中。</p>
        <p>
            有關外觀呈現與使用方式的範例，請參閱 <a href="https://github.com/Kotlin/dokka/blob/master/examples/gradle-v2/basic-gradle-example/build.gradle.kts">Dokka Gradle 範例</a>。
        </p>
    </def>
</deflist>

### 原始碼集配置 {id="source-set-configuration"}

Dokka 允許針對
[Kotlin 原始碼集](https://kotlinlang.org/docs/multiplatform-discover-project.html#source-sets)配置部分選項：

<tabs group="build-script">
<tab title="Gradle Kotlin DSL" group-key="kotlin">

```kotlin
import org.jetbrains.dokka.gradle.engine.parameters.VisibilityModifier

dokka {
    // ..
    // General configuration section
    // ..

    // Source sets configuration
    dokkaSourceSets {
        // Example: Configuration exclusive to the 'linux' source set
        named("linux") {
            dependentSourceSets{named("native")}
            sourceRoots.from(file("linux/src"))
        }

        configureEach {
            suppress.set(false)
            displayName.set(name)
            documentedVisibilities.set(setOf(VisibilityModifier.Public)) // OR documentedVisibilities(VisibilityModifier.Public)
            reportUndocumented.set(false)
            skipEmptyPackages.set(true)
            skipDeprecated.set(false)
            suppressGeneratedFiles.set(true)
            jdkVersion.set(8)
            languageVersion.set("1.7")
            apiVersion.set("1.7")
            sourceRoots.from(file("src"))
            classpath.from(file("libs/dependency.jar"))
            samples.from("samples/Basic.kt", "samples/Advanced.kt")
           
            sourceLink {
                // Source link section
            }
            perPackageOption {
                // Package options section
            }
            externalDocumentationLinks {
                // External documentation links section
            }
        }
    }
}
```

</tab>
<tab title="Gradle Groovy DSL" group-key="groovy">

```groovy
import org.jetbrains.dokka.gradle.engine.parameters.VisibilityModifier

dokka {
    // ..
    // General configuration section
    // ..

    // Source sets configuration
    dokkaSourceSets {
        // Example: Configuration exclusive to the 'linux' source set
        named("linux") {
            dependentSourceSets { named("native") }
            sourceRoots.from(file("linux/src"))
        }

        configureEach {
            suppress.set(false)
            displayName.set(name)
            documentedVisibilities.set([VisibilityModifier.Public] as Set) // OR documentedVisibilities(VisibilityModifier.Public)
            reportUndocumented.set(false)
            skipEmptyPackages.set(true)
            skipDeprecated.set(false)
            suppressGeneratedFiles.set(true)
            jdkVersion.set(8)
            languageVersion.set("1.7")
            apiVersion.set("1.7")
            sourceRoots.from(file("src"))
            classpath.from(file("libs/dependency.jar"))
            samples.from("samples/Basic.kt", "samples/Advanced.kt")

            sourceLink {
                // Source link section
            }
            perPackageOption {
                // Package options section
            }
            externalDocumentationLinks {
                // External documentation links section
            }
        }
    }
}
```

</tab>
</tabs>

<deflist collapsible="true">
    <def title="suppress">
        <p>在產生文件時是否應略過此原始碼集。</p>
        <p>預設值：<code>false</code></p>
    </def>
    <def title="displayName">
        <p>用來參照此原始碼集的顯示名稱。</p>
        <p>
            該名稱會同時用於外部（例如，作為文件讀者可看見的原始碼集名稱）與內部（例如，用於 <code>reportUndocumented</code> 的記錄訊息）。
        </p>
        <p>預設情況下，該值會從 Kotlin Gradle 外掛程式所提供的資訊推導得出。</p>
    </def>
    <def title="documentedVisibilities">
        <p>定義 Dokka 應在產生的文件中納入哪些可見性修飾詞。</p>
        <p>
            如果你想記錄 <code>protected</code>、<code>internal</code> 與 <code>private</code> 宣告，
            或者想要排除 <code>public</code> 宣告而僅記錄內部 API，請使用此選項。
        </p>
        <p>
            此外，你可以使用 Dokka 的 
            <a href="https://github.com/Kotlin/dokka/blob/v2.3.0/dokka-runners/dokka-gradle-plugin/src/main/kotlin/engine/parameters/HasConfigurableVisibilityModifiers.kt"><code>documentedVisibilities()</code> 函式</a> 
            來新增要記錄的可見性。
        </p>
        <p>此選項可針對個別套件分別進行配置。</p>
        <p>預設值：<code>VisibilityModifier.Public</code></p>
    </def>
    <def title="reportUndocumented">
        <p>
            是否對可見但未記載的宣告發出警告（即經過 <code>documentedVisibilities</code> 及其他篩選器篩選後，仍未包含 KDoc 的宣告）。
        </p>
        <p>此設定與 <code>failOnWarning</code> 搭配使用效果極佳。</p>
        <p>此選項可針對個別套件分別進行配置。</p>
        <p>預設值：<code>false</code></p>
    </def>
    <def title="skipEmptyPackages">
        <p>
            在套用各項篩選條件後，是否略過不含任何可見宣告的套件。
        </p>
        <p>
            例如，若 <code>skipDeprecated</code> 設為 <code>true</code>，且你的套件僅包含已棄用的宣告，則該套件會被視為空套件。
        </p>
        <p>預設值：<code>true</code></p>
    </def>
    <def title="skipDeprecated">
        <p>是否記錄加上 <code>@Deprecated</code> 註解的宣告。</p>
        <p>此選項可針對個別套件分別進行配置。</p>
        <p>預設值：<code>false</code></p>
    </def>
    <def title="suppressGeneratedFiles">
        <p>是否記錄產生的檔案。</p>
        <p>
            產生的檔案預期會存在於 <code>{project}/{buildDir}/generated</code> 目錄下。
        </p>
        <p>
            若設為 <code>true</code>，它實際上會將該目錄中的所有檔案加入至
            <code>suppressedFiles</code> 選項中，以便你手動配置。
        </p>
        <p>預設值：<code>true</code></p>
    </def>
    <def title="suppressAnnotatedWith">
        <p>一組註解的完全限定名稱 (FQN)，用於抑制帶有這些註解的宣告。</p>
        <p>
            任何帶有這些註解之一的宣告都會從產生的文件中排除。
        </p>
    </def>
    <def title="jdkVersion">
        <p>為 Java 型別產生外部文件連結時所使用的 JDK 版本。</p>
        <p>
            例如，如果你在某個公開宣告簽章中使用了 <code>java.util.UUID</code>，
            且此選項設為 <code>8</code>，Dokka 就會為其產生指向
            <a href="https://docs.oracle.com/javase/8/docs/api/java/util/UUID.html">JDK 8 Javadocs</a> 的外部文件連結。
        </p>
        <p>預設值：`8`</p>
    </def>
    <def title="languageVersion">
        <p>
            用於設定分析與 <a href="https://kotlinlang.org/docs/kotlin-doc.html#sample-identifier">@sample</a>
            環境的 <a href="https://kotlinlang.org/docs/compatibility-modes.html">Kotlin 語言版本</a>。
        </p>
        <p>預設情況下，會使用 Dokka 內嵌編譯器可用的最新語言版本。</p>
    </def>
    <def title="apiVersion">
        <p>
            用於設定分析與 <a href="https://kotlinlang.org/docs/kotlin-doc.html#sample-identifier">@sample</a>
            環境的 <a href="https://kotlinlang.org/docs/compatibility-modes.html">Kotlin API 版本</a>。
        </p>
        <p>預設情況下，會從 <code>languageVersion</code> 推導得出。</p>
    </def>
    <def title="sourceRoots">
        <p>
            要進行分析與記載的原始碼根目錄。
            可接受的輸入包括目錄以及個別的 <code>.kt</code> 和 <code>.java</code> 檔案。
        </p>
        <p>預設情況下，原始碼根目錄會從 Kotlin Gradle 外掛程式所提供的資訊推導得出。</p>
    </def>
    <def title="classpath">
        <p>用於分析與互動式範例的類別路徑 (classpath)。</p>
        <p>如果某些來自依賴項的型別未被自動解析或採用，此設定會非常有用。</p>
        <p>此選項可接受 <code>.jar</code> 與 <code>.klib</code> 檔案。</p>
        <p>預設情況下，類別路徑會從 Kotlin Gradle 外掛程式所提供的資訊推導得出。</p>
    </def>
    <def title="samples">
        <p>
            包含透過 <a href="https://kotlinlang.org/docs/kotlin-doc.html#sample-identifier">@sample</a> KDoc 標籤參照之範例函式的目錄或檔案清單。
        </p>
    </def>
</deflist>

### 原始碼連結配置 {id="source-link-configuration"}

配置原始碼連結，以協助讀者在遠端存儲庫中找到各宣告的原始碼。
請使用 `dokkaSourceSets.main {}` 區塊進行此配置。

`sourceLinks {}` 配置區塊允許你為每個簽章新增一個 `source` 連結，
該連結指向帶有特定行號的 `remoteUrl`。
行號可透過設定 `remoteLineSuffix` 來進行配置。

如需範例，請參閱 `kotlinx.coroutines` 中
[`count()`](https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines.flow/count.html)
函式的文件。

`build.gradle.kts` 檔案的語法與一般 `.kt` 檔案（例如用於自訂 Gradle 外掛程式的檔案）不同，因為 Gradle 的 Kotlin DSL 使用了型別安全存取器：

<tabs group="dokka-configuration">
<tab title="Gradle Kotlin DSL" group-key="kotlin">

```kotlin
// build.gradle.kts

dokka {
    dokkaSourceSets.main {
        sourceLink {
            localDirectory.set(file("src/main/kotlin"))
            remoteUrl("https://github.com/your-repo")
            remoteLineSuffix.set("#L")
        }
    }
}
```

</tab>
<tab title="Kotlin custom plugin" group-key="kotlin custom">

```kotlin
// CustomPlugin.kt

import org.gradle.api.Plugin
import org.gradle.api.Project
import org.jetbrains.dokka.gradle.DokkaExtension

abstract class CustomPlugin : Plugin<Project> {
    override fun apply(project: Project) {
        project.plugins.apply("org.jetbrains.dokka")
        project.extensions.configure(DokkaExtension::class.java) { dokka ->
            dokka.dokkaSourceSets.named("main") { dss ->
                dss.includes.from("README.md")
                dss.sourceLink {
                    it.localDirectory.set(project.file("src/main/kotlin"))
                    it.remoteUrl("https://example.com/src")
                    it.remoteLineSuffix.set("#L")
                }
            }
        }
    }
}
```

</tab>
<tab title="Gradle Groovy DSL" group-key="groovy">

```groovy
dokka {
    dokkaSourceSets {
        main {
            sourceLink {
                localDirectory.set(file("src/main/kotlin"))
                remoteUrl.set(new URI("https://github.com/your-repo"))
                remoteLineSuffix.set("#L")
            }
        }
    }
}
```

</tab>
</tabs>

<deflist collapsible="true">
    <def title="localDirectory">
        <p>
            本機原始碼目錄的路徑。該路徑必須相對於當前專案的根目錄。
        </p>
    </def>
    <def title="remoteUrl">
        <p>
            文件讀者可存取的原始碼代管服務 URL，
            例如 GitHub、GitLab、Bitbucket，或任何為原始碼檔案提供穩定 URL 的代管服務。
            此 URL 用於產生宣告的原始碼連結。
        </p>
    </def>
    <def title="remoteLineSuffix">
        <p>
            用於在 URL 後方附加原始碼行號的後綴。這有助於讀者不僅能巡覽至該檔案，
            還能直接前往該宣告的特定行號。
        </p>
        <p>
            行號本身會附加在指定的後綴之後。例如，
            若此選項設為 <code>#L</code> 且行號為 10，則產生的 URL 後綴為 <code>#L10</code>。
        </p>
        <p>
            常用服務所使用的後綴：</p>
            <list>
                <li>GitHub：<code>#L</code></li>
                <li>GitLab：<code>#L</code></li>
                <li>Bitbucket：<code>#lines-</code></li>
            </list>
        <p>預設值：<code>#L</code></p>
    </def>
</deflist>

### 套件選項 {id="package-options"}

`perPackageOption` 配置區塊允許為符合 `matchingRegex` 的特定套件設定部分選項：

<tabs group="build-script">
<tab title="Gradle Kotlin DSL" group-key="kotlin">

```kotlin
import org.jetbrains.dokka.gradle.engine.parameters.VisibilityModifier

dokka {
    dokkaPublications.html {
        dokkaSourceSets.configureEach {
            perPackageOption {
                matchingRegex.set(".*api.*")
                suppress.set(false)
                skipDeprecated.set(false)
                reportUndocumented.set(false)
                documentedVisibilities.set(setOf(VisibilityModifier.Public)) // OR documentedVisibilities(VisibilityModifier.Public)
            }
        }
    }
}
```

</tab>
<tab title="Gradle Groovy DSL" group-key="groovy">

```groovy
import org.jetbrains.dokka.gradle.engine.parameters.VisibilityModifier

dokka {
    dokkaPublications {
        html {
            dokkaSourceSets.configureEach {
                perPackageOption {
                    matchingRegex.set(".*api.*")
                    suppress.set(false)
                    skipDeprecated.set(false)
                    reportUndocumented.set(false)
                    documentedVisibilities.set([VisibilityModifier.Public] as Set)
                }
            }
        }
    }
}
```

</tab>
</tabs>

<deflist collapsible="true">
    <def title="matchingRegex">
        <p>用於比對套件的正規表示式。</p>
        <p>預設值：<code>.&#42;</code></p>
    </def>
    <def title="suppress">
        <p>在產生文件時是否應略過此套件。</p>
        <p>預設值：<code>false</code></p>
    </def>
    <def title="skipDeprecated">
        <p>是否記錄加上 <code>@Deprecated</code> 註解的宣告。</p>
        <p>這可以在原始碼集層級進行配置。</p>
        <p>預設值：<code>false</code></p>
    </def>
    <def title="reportUndocumented">
        <p>
            是否對可見但未記載的宣告發出警告（即經過 <code>documentedVisibilities</code> 及其他篩選器篩選後，仍未包含 KDoc 的宣告）。
        </p>
        <p>此設定與 <code>failOnWarning</code> 搭配使用效果極佳。</p>
        <p>這可以在原始碼集層級進行配置。</p>
        <p>預設值：<code>false</code></p>
    </def>
    <def title="documentedVisibilities">
        <p>定義 Dokka 應在產生的文件中納入哪些可見性修飾詞。</p>
        <p>
            如果你想記錄此套件中的 <code>protected</code>、<code>internal</code> 與 <code>private</code> 宣告，
            或者想要排除 <code>public</code> 宣告而僅記錄內部 API，請使用此選項。
        </p>
        <p>
            此外，你可以使用 Dokka 的 
            <a href="https://github.com/Kotlin/dokka/blob/v2.0.0/dokka-runners/dokka-gradle-plugin/src/main/kotlin/engine/parameters/HasConfigurableVisibilityModifiers.kt#L14-L16"><code>documentedVisibilities()</code> 函式</a> 
            來新增要記錄的可見性。
        </p>
        <p>這可以在原始碼集層級進行配置。</p>
        <p>預設值：<code>VisibilityModifier.Public</code></p>
    </def>
</deflist>

### 外部文件連結配置 {id="external-documentation-links-configuration"}

`externalDocumentationLinks {}`
區塊允許建立指向依賴項之外部代管文件的連結。

例如，如果你使用了來自 `kotlinx.serialization` 的型別，預設情況下它們在你的文件中是不可點擊的，就如同尚未解析一樣。然而，由於 `kotlinx.serialization` 的 API 參考文件是由 Dokka 所建置並[發佈於 kotlinlang.org](https://kotlinlang.org/api/kotlinx.serialization/)，因此你可以為其配置外部文件連結。這讓 Dokka 能夠為該程式庫中的型別產生連結，使其成功解析並可供點擊。

預設情況下，已預先配置了 Kotlin 標準程式庫、JDK、Android SDK 與 AndroidX 的外部文件連結。

使用 `register()` 方法註冊外部文件連結以定義每個連結。
`externalDocumentationLinks` API 使用此方法以符合 Gradle DSL 慣例：

<tabs group="build-script">
<tab title="Gradle Kotlin DSL" group-key="kotlin">

```kotlin
dokka {
    dokkaSourceSets.configureEach {
        externalDocumentationLinks.register("example-docs") {
            url("https://example.com/docs/")
            packageListUrl("https://example.com/docs/package-list")
        }
    }
}
```

</tab>
<tab title="Gradle Groovy DSL" group-key="groovy">

```groovy
dokka {
    dokkaSourceSets.configureEach {
        externalDocumentationLinks.register("example-docs") {
            url.set(new URI("https://example.com/docs/"))
            packageListUrl.set(new URI("https://example.com/docs/package-list"))
        }
    }
}
```

</tab>
</tabs>

<deflist collapsible="true">
    <def title="url">
        <p>要連結的文件根 URL。<b>必須</b>包含結尾斜線。</p>
        <p>
            Dokka 會盡可能自動尋找給定 URL 的 <code>package-list</code>，並將宣告連結在一起。
        </p>
        <p>
            若自動解析失敗，或者你希望改用本機快取檔案，請考慮設定 <code>packageListUrl</code> 選項。
        </p>
    </def>
    <def title="packageListUrl">
        <p>
            <code>package-list</code> 的確切位置。這是避免依賴 Dokka 自動解析的替代方案。
        </p>
        <p>
            套件清單包含有關文件與專案本身的資訊，例如子專案與套件名稱。
        </p>
        <p>這也可以是本機快取檔案，以避免發出網路呼叫。</p>
    </def>
</deflist>

### 完整配置 {id="complete-configuration"}

下方可以看到同時套用所有可能配置選項的範例：

<tabs group="build-script">
<tab title="Gradle Kotlin DSL" group-key="kotlin">

```kotlin
import org.jetbrains.dokka.gradle.engine.parameters.VisibilityModifier

plugins {
    id("org.jetbrains.dokka") version "%dokkaVersion%"
}

dokka {
    dokkaPublications.html {
        moduleName.set(project.name)
        moduleVersion.set(project.version.toString())
        outputDirectory.set(layout.buildDirectory.dir("dokka/html"))
        failOnWarning.set(false)
        suppressInheritedMembers.set(false)
        suppressObviousFunctions.set(true)
        offlineMode.set(false)
        includes.from("packages.md", "extra.md")
   }

    dokkaSourceSets {
        // Example: Configuration exclusive to the 'linux' source set
        named("linux") {
            dependentSourceSets{named("native")}
            sourceRoots.from(file("linux/src"))
        }

        configureEach {
            suppress.set(false)
            displayName.set(name)
            documentedVisibilities.set(setOf(VisibilityModifier.Public)) // OR documentedVisibilities(VisibilityModifier.Public)
            reportUndocumented.set(false)
            skipEmptyPackages.set(true)
            skipDeprecated.set(false)
            suppressGeneratedFiles.set(true)
            jdkVersion.set(8)
            languageVersion.set("1.7")
            apiVersion.set("1.7")
            sourceRoots.from(file("src"))
            classpath.from(file("libs/dependency.jar"))
            samples.from("samples/Basic.kt", "samples/Advanced.kt")

            sourceLink {
                localDirectory.set(file("src/main/kotlin"))
                remoteUrl("https://example.com/src")
                remoteLineSuffix.set("#L")
            }

            externalDocumentationLinks {
                url = URL("https://example.com/docs/")
                packageListUrl = File("/path/to/package-list").toURI().toURL()
            }

            perPackageOption {
                matchingRegex.set(".*api.*")
                suppress.set(false)
                skipDeprecated.set(false)
                reportUndocumented.set(false)
                documentedVisibilities.set(
                    setOf(
                        VisibilityModifier.Public,
                        VisibilityModifier.Private,
                        VisibilityModifier.Protected,
                        VisibilityModifier.Internal,
                        VisibilityModifier.Package
                    )
                )
            }
        }
    }
}
```

</tab>
<tab title="Gradle Groovy DSL" group-key="groovy">

```groovy
import org.jetbrains.dokka.gradle.engine.parameters.VisibilityModifier

plugins {
    id 'org.jetbrains.dokka' version '%dokkaVersion%'
}

dokka {
    dokkaPublications {
        html {
            moduleName.set(project.name)
            moduleVersion.set(project.version.toString())
            outputDirectory.set(layout.buildDirectory.dir("dokka/html"))
            failOnWarning.set(false)
            suppressInheritedMembers.set(false)
            suppressObviousFunctions.set(true)
            offlineMode.set(false)
            includes.from("packages.md", "extra.md")
        }
    }

    dokkaSourceSets {
        // Example: Configuration exclusive to the 'linux' source set
        named("linux") {
            dependentSourceSets { named("native") }
            sourceRoots.from(file("linux/src"))
        }

        configureEach {
            suppress.set(false)
            displayName.set(name)
            documentedVisibilities.set([VisibilityModifier.Public] as Set)
            reportUndocumented.set(false)
            skipEmptyPackages.set(true)
            skipDeprecated.set(false)
            suppressGeneratedFiles.set(true)
            jdkVersion.set(8)
            languageVersion.set("1.7")
            apiVersion.set("1.7")
            sourceRoots.from(file("src"))
            classpath.from(file("libs/dependency.jar"))
            samples.from("samples/Basic.kt", "samples/Advanced.kt")

            sourceLink {
                localDirectory.set(file("src/main/kotlin"))
                remoteUrl.set(new URI("https://example.com/src"))
                remoteLineSuffix.set("#L")
            }

            externalDocumentationLinks {
                url.set(new URI("https://example.com/docs/"))
                packageListUrl.set(new File("/path/to/package-list").toURI().toURL())
            }

            perPackageOption {
                matchingRegex.set(".*api.*")
                suppress.set(false)
                skipDeprecated.set(false)
                reportUndocumented.set(false)
                documentedVisibilities.set([
                        VisibilityModifier.Public,
                        VisibilityModifier.Private,
                        VisibilityModifier.Protected,
                        VisibilityModifier.Internal,
                        VisibilityModifier.Package
                ] as Set)
            }
        }
    }
}
```

</tab>
</tabs>