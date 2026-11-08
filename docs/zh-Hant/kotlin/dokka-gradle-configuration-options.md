[//]: # (title: Dokka Gradle 設定選項)

Dokka 提供了許多設定選項，可為你和你的讀者自訂瀏覽體驗。

以下是各個設定區段的詳細說明以及部分範例。
你也可以查看套用了[所有設定選項](#complete-configuration)的範例。

若要進一步了解如何在單一專案與多專案組建中套用設定區塊，請參閱[設定範例](dokka-gradle.md#configuration-examples)。

### 一般設定 {id="general-configuration"}

以下是 Dokka Gradle 外掛程式的一般設定範例：

* 使用最上層的 `dokka {}` DSL 設定。
* 在 DGP 中，你在 `dokkaPublications{}` 區塊中宣告 Dokka 發佈設定。
* 預設的發佈格式為 [`html`](dokka-html.md) 與 [`javadoc`](dokka-javadoc.md)。

* `build.gradle.kts` 檔案的語法與一般的 `.kt` 檔案（例如用於 Kotlin 自訂外掛程式的檔案）有所不同，因為 Gradle 的 Kotlin DSL 使用了型別安全存取器（type-safe accessor）。

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

如需更多有關檔案處理的資訊，請參閱 [Gradle 文件](https://docs.gradle.org/current/userguide/working_with_files.html#sec:file_trees)。

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
           專案文件的顯示名稱。它會出現在目錄、導覽、標題與記錄訊息中。在多專案組建中，每個子專案的 <code>moduleName</code> 會在彙總文件中用作該區段的標題。
        </p>
        <p>預設值：Gradle 專案名稱</p>
    </def>
    <def title="moduleVersion">
        <p>
            在產生的文件中顯示的子專案版本。在單一專案組建中，它會用作專案版本。在多專案組建中，彙總文件時會使用每個子專案的 <code>moduleVersion</code>。
        </p>
        <p>預設值：Gradle 專案版本</p>
    </def>
    <def title="outputDirectory">
        <p>儲存產生之文件的目錄。</p>
        <p>此設定適用於 <code>dokkaGenerate</code> 任務所產生的所有文件格式（HTML、Javadoc 等）。</p>
        <p>預設值：<code>build/dokka/html</code></p>
        <p><b>額外檔案的輸出目錄</b></p>
        <p>你可以為單一專案與多專案組建指定輸出目錄並包含額外檔案。對於多專案組建，請在根專案的設定中設定輸出目錄並包含額外檔案。
        </p>
    </def>
    <def title="failOnWarning">
        <p>
            決定在文件產生過程中出現警告時，Dokka 是否應使組建失敗。該流程會等待所有錯誤與警告皆已輸出後才終止。
        </p>
        <p>此設定與 <code>reportUndocumented</code> 搭配使用效果良好。</p>
        <p>預設值：<code>false</code></p>
    </def>
    <def title="suppressInheritedMembers">
        <p>是否隱藏特定類別中未被明確覆寫的繼承成員。</p>
        <p>
            注意：這會隱藏諸如 <code>equals</code>、<code>hashCode</code> 與 <code>toString</code> 等函式，但不會隱藏諸如 <code>dataClass.componentN</code> 與 <code>dataClass.copy</code> 等合成函式（synthetic function）。如需隱藏後者，請使用 <code>suppressObviousFunctions</code>。
        </p>
        <p>預設值：<code>false</code></p>
    </def>
    <def title="suppressObviousFunctions">
        <p>是否隱藏淺顯易懂的常規函式（obvious functions）。</p>
        <p>
            若函式符合以下條件，即被視為 obvious function：</p>
            <list>
                <li>
                    繼承自 <code>kotlin.Any</code>、<code>Kotlin.Enum</code>、<code>java.lang.Object</code> 或 <code>java.lang.Enum</code>，例如 <code>equals</code>、<code>hashCode</code>、<code>toString</code>。
                </li>
                <li>
                    由編譯器產生的合成函式（synthetic function），且不包含任何文件，例如 <code>dataClass.componentN</code> 或 <code>dataClass.copy</code>。
                </li>
            </list>
        <p>預設值：<code>true</code></p>
    </def>
    <def title="offlineMode">
        <p>是否透過網路解析遠端檔案與連結。</p>
        <p>
            這包含用於產生外部文件連結的 package-list。例如，這讓你的文件能夠將標準庫中的類別轉為可點擊的連結。
        </p>
        <p>
            將此設定設為 <code>true</code> 在某些情況下可大幅縮短組建時間，但同時也可能降低使用者體驗，例如無法解析相依性（包括標準庫）中的類別與成員連結。
        </p>
        <p>注意：你可以在本機快取抓取的檔案，並以本機路徑提供給 Dokka。請參閱 <code>&lt;a href="#external-documentation-links-configuration"&gt;externalDocumentationLinks&lt;/a&gt;</code> 區段。</p>
        <p>預設值：<code>false</code></p>
    </def>
     <def title="includes">
        <p>
            包含<a href="dokka-module-and-package-docs.md">子專案與套件文件</a>的 Markdown 檔案清單。Markdown 檔案必須符合<a href="dokka-module-and-package-docs.md#file-format">必要格式</a>。
        </p>
        <p>指定檔案的內容將會被剖析並作為子專案與套件描述嵌入到文件中。</p>
        <p>
            請參閱 <a href="https://github.com/Kotlin/dokka/blob/master/examples/gradle-v2/basic-gradle-example/build.gradle.kts">Dokka Gradle 範例</a>以了解其具體外觀與使用方式。
        </p>
    </def>
</deflist>

### 原始碼集設定 {id="source-set-configuration"}

Dokka 允許針對 [Kotlin 原始碼集](https://kotlinlang.org/docs/multiplatform-discover-project.html#source-sets)設定部分選項：

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
        <p>在產生文件時是否略過此原始碼集。</p>
        <p>預設值：<code>false</code></p>
    </def>
    <def title="displayName">
        <p>用於代表此原始碼集的顯示名稱。</p>
        <p>
            此名稱會同時用於外部（例如作為文件讀者看到的原始碼集名稱）與內部（例如用於 <code>reportUndocumented</code> 的記錄訊息）。
        </p>
        <p>預設情況下，該值由 Kotlin Gradle 外掛程式所提供的資訊推論得出。</p>
    </def>
    <def title="documentedVisibilities">
        <p>定義 Dokka 應在產生的文件中包含哪些可見性修飾詞。</p>
        <p>
            如果你想要為 <code>protected</code>、<code>internal</code> 和 <code>private</code> 宣告編寫文件，或者想要排除 <code>public</code> 宣告而僅記錄內部 API 時，可以使用此選項。
        </p>
        <p>
            此外，你也可以使用 Dokka 的 
            <a href="https://github.com/Kotlin/dokka/blob/v2.3.0/dokka-runners/dokka-gradle-plugin/src/main/kotlin/engine/parameters/HasConfigurableVisibilityModifiers.kt"><code>documentedVisibilities()</code> 函式</a> 
            來新增要記錄的可見性。
        </p>
        <p>此選項可針對個別套件分別設定。</p>
        <p>預設值：<code>VisibilityModifier.Public</code></p>
    </def>
    <def title="reportUndocumented">
        <p>
            是否對未記錄的可見宣告（即經過 <code>documentedVisibilities</code> 與其他篩選器篩選後，沒有 KDoc 的宣告）發出警告。
        </p>
        <p>此設定與 <code>failOnWarning</code> 搭配使用效果良好。</p>
        <p>此選項可針對個別套件分別設定。</p>
        <p>預設值：<code>false</code></p>
    </def>
    <def title="skipEmptyPackages">
        <p>
            套用各種篩選器後，是否略過不包含任何可見宣告的套件。
        </p>
        <p>
            例如，若 <code>skipDeprecated</code> 設為 <code>true</code>，且你的套件僅包含已棄用的宣告，則該套件將被視為空套件。
        </p>
        <p>預設值：<code>true</code></p>
    </def>
    <def title="skipDeprecated">
        <p>是否為標註有 <code>@Deprecated</code> 的宣告編寫文件。</p>
        <p>此選項可針對個別套件分別設定。</p>
        <p>預設值：<code>false</code></p>
    </def>
    <def title="suppressGeneratedFiles">
        <p>是否為產生的檔案編寫文件。</p>
        <p>
            產生的檔案預期會存在於 <code>{project}/{buildDir}/generated</code> 目錄下。
        </p>
        <p>
            若設為 <code>true</code>，實際上會將該目錄中的所有檔案加入至 <code>suppressedFiles</code> 選項中，因此你也可以手動進行設定。
        </p>
        <p>預設值：<code>true</code></p>
    </def>
    <def title="suppressAnnotatedWith">
        <p>一組註解的完全限定名稱（FQN），用於隱藏標註有這些註解的宣告。</p>
        <p>
            任何標註有這些註解之一的宣告都會從產生的文件中排除。
        </p>
    </def>
    <def title="jdkVersion">
        <p>為 Java 型別產生外部文件連結時所使用的 JDK 版本。</p>
        <p>
            例如，若你在某個公開宣告簽章中使用了 <code>java.util.UUID</code>，且此選項設為 <code>8</code>，Dokka 會為其產生指向 <a href="https://docs.oracle.com/javase/8/docs/api/java/util/UUID.html">JDK 8 Javadoc</a> 的外部文件連結。
        </p>
        <p>預設值：`8`</p>
    </def>
    <def title="languageVersion">
        <p>
            用於設定分析與 <a href="https://kotlinlang.org/docs/kotlin-doc.html#sample-identifier">@sample</a> 環境的 <a href="https://kotlinlang.org/docs/compatibility-modes.html">Kotlin 語言版本</a>。
        </p>
        <p>預設情況下，會使用 Dokka 內嵌編譯器可用的最新語言版本。</p>
    </def>
    <def title="apiVersion">
        <p>
            用於設定分析與 <a href="https://kotlinlang.org/docs/kotlin-doc.html#sample-identifier">@sample</a> 環境的 <a href="https://kotlinlang.org/docs/compatibility-modes.html">Kotlin API 版本</a>。
        </p>
        <p>預設情況下，它會從 <code>languageVersion</code> 推論得出。</p>
    </def>
    <def title="sourceRoots">
        <p>
            要進行分析與文件記錄的原始碼根目錄。可接受的輸入包括目錄以及個別的 <code>.kt</code> 和 <code>.java</code> 檔案。
        </p>
        <p>預設情況下，原始碼根目錄由 Kotlin Gradle 外掛程式所提供的資訊推論得出。</p>
    </def>
    <def title="classpath">
        <p>用於分析與互動式範例的 classpath。</p>
        <p>如果來自相依性的某些型別無法解析或未被自動載入，這會非常有用。</p>
        <p>此選項同時接受 <code>.jar</code> 與 <code>.klib</code> 檔案。</p>
        <p>預設情況下，classpath 由 Kotlin Gradle 外掛程式所提供的資訊推論得出。</p>
    </def>
    <def title="samples">
        <p>
            包含範例函式的目錄或檔案清單，這些函式透過 <a href="https://kotlinlang.org/docs/kotlin-doc.html#sample-identifier">@sample</a> KDoc 標記進行參照。
        </p>
    </def>
</deflist>

### 原始碼連結設定 {id="source-link-configuration"}

設定原始碼連結可協助讀者在遠端存放庫中找到每個宣告的原始碼。
請使用 `dokkaSourceSets.main {}` 區塊來進行此設定。

`sourceLinks {}` 設定區塊允許你在每個簽章中新增一個指向帶有特定行號之 `remoteUrl` 的 `source` 連結。
行號可以透過設定 `remoteLineSuffix` 來進行自訂。

範例請參閱 `kotlinx.coroutines` 中 [`count()`](https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines.flow/count.html) 函式的文件。

`build.gradle.kts` 檔案的語法與一般的 `.kt` 檔案（例如用於自訂 Gradle 外掛程式的檔案）有所不同，因為 Gradle 的 Kotlin DSL 使用了型別安全存取器：

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
            文件讀者可以存取的原始碼代管服務 URL，例如 GitHub、GitLab、Bitbucket，或任何為原始碼檔案提供穩定 URL 的代管服務。此 URL 用於產生宣告的原始碼連結。
        </p>
    </def>
    <def title="remoteLineSuffix">
        <p>
            用於在 URL 後附加原始碼行號的後綴。這有助於讀者不僅能導覽到檔案，還能跳轉到宣告的具體行號。
        </p>
        <p>
            行號本身會附加在指定的後綴之後。例如，若此選項設為 <code>#L</code> 且行號為 10，則產生的 URL 後綴為 <code>#L10</code>。
        </p>
        <p>
            主流服務所使用的後綴：</p>
            <list>
                <li>GitHub：<code>#L</code></li>
                <li>GitLab：<code>#L</code></li>
                <li>Bitbucket：<code>#lines-</code></li>
            </list>
        <p>預設值：<code>#L</code></p>
    </def>
</deflist>

### 套件選項 {id="package-options"}

`perPackageOption` 設定區塊允許為符合 `matchingRegex` 的特定套件設定選項：

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
        <p>在產生文件時是否略過該套件。</p>
        <p>預設值：<code>false</code></p>
    </def>
    <def title="skipDeprecated">
        <p>是否為標註有 <code>@Deprecated</code> 的宣告編寫文件。</p>
        <p>此選項可在原始碼集層級進行設定。</p>
        <p>預設值：<code>false</code></p>
    </def>
    <def title="reportUndocumented">
        <p>
            是否對未記錄的可見宣告（即經過 <code>documentedVisibilities</code> 與其他篩選器篩選後，沒有 KDoc 的宣告）發出警告。
        </p>
        <p>此設定與 <code>failOnWarning</code> 搭配使用效果良好。</p>
        <p>此選項可在原始碼集層級進行設定。</p>
        <p>預設值：<code>false</code></p>
    </def>
    <def title="documentedVisibilities">
        <p>定義 Dokka 應在此套件的產生文件中包含哪些可見性修飾詞。</p>
        <p>
            如果你想要為此套件內的 <code>protected</code>、<code>internal</code> 和 <code>private</code> 宣告編寫文件，或者想要排除 <code>public</code> 宣告而僅記錄內部 API 時，可以使用此選項。
        </p>
        <p>
            此外，你也可以使用 Dokka 的 
            <a href="https://github.com/Kotlin/dokka/blob/v2.0.0/dokka-runners/dokka-gradle-plugin/src/main/kotlin/engine/parameters/HasConfigurableVisibilityModifiers.kt#L14-L16"><code>documentedVisibilities()</code> 函式</a> 
            來新增要記錄的可見性。
        </p>
        <p>此選項可在原始碼集層級進行設定。</p>
        <p>預設值：<code>VisibilityModifier.Public</code></p>
    </def>
</deflist>

### 外部文件連結設定 {id="external-documentation-links-configuration"}

`externalDocumentationLinks {}` 區塊允許建立指向相依性之外部代管文件的連結。

例如，如果你使用了來自 `kotlinx.serialization` 的型別，預設情況下它們在你的文件中是無法點擊的，就如同尚未解析一般。然而，由於 `kotlinx.serialization` 的 API 參考文件是由 Dokka 建置並[發佈在 kotlinlang.org 上](https://kotlinlang.org/api/kotlinx.serialization/)，你可以為其設定外部文件連結。這可讓 Dokka 為來自該程式庫的型別產生連結，使它們成功解析並可供點擊。

預設情況下，已預先設定了 Kotlin 標準庫、JDK、Android SDK 與 AndroidX 的外部文件連結。

使用 `register()` 方法註冊外部文件連結以定義每個連結。`externalDocumentationLinks` API 使用此方法以符合 Gradle DSL 慣例：

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
        <p>要連結至的文件根 URL。其<b>必須</b>包含結尾斜線（/）。</p>
        <p>
            Dokka 會盡力自動尋找給定 URL 的 <code>package-list</code>，並將宣告連結在一起。
        </p>
        <p>
            若自動解析失敗，或者你想改用本機快取檔案，請考慮設定 <code>packageListUrl</code> 選項。
        </p>
    </def>
    <def title="packageListUrl">
        <p>
            <code>package-list</code> 的精確位置。這是依賴 Dokka 自動解析之外的替代方案。
        </p>
        <p>
            Package list 包含有關文件與專案本身的資訊，例如子專案與套件名稱。
        </p>
        <p>這也可以是本機快取的檔案，以避免發出網路請求。</p>
    </def>
</deflist>

### 完整設定 {id="complete-configuration"}

以下可以看到同時套用了所有可用設定選項的範例：

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