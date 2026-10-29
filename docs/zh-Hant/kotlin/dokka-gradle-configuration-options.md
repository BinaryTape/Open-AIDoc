[//]: # (title: Dokka Gradle 配置選項)

Dokka 提供許多配置選項來建立您與讀者的體驗。

以下是每個配置區塊的詳細說明與一些範例。 
您也可以找到套用了 [所有配置選項](#complete-configuration) 的範例。

有關為單專案與多專案組建套用配置區塊的更多詳細資訊，
請參閱 [配置範例](dokka-gradle.md#configuration-examples)。

### 一般配置 {id="general-configuration"}

以下是一般 Dokka Gradle 外掛程式配置的範例： 

* 使用最上層的 `dokka {}` DSL 配置。
* 在 DGP 中，您在 `dokkaPublications{}` 區塊中宣告 Dokka 發佈配置。
* 預設發佈為 [`html`](dokka-html.md) 與 [`javadoc`](dokka-javadoc.md)。

* `build.gradle.kts` 檔案的語法與一般 `.kt` 檔案（例如用於 Kotlin 自訂外掛程式的檔案）有所不同，因為 Gradle 的 Kotlin DSL 使用型別安全存取子。

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
        // HTML 文件的標準輸出目錄
        outputDirectory.set(layout.buildDirectory.dir("dokka/html"))
        failOnWarning.set(false)
        suppressInheritedMembers.set(false)
        suppressObviousFunctions.set(true)
        offlineMode.set(false)
        includes.from("packages.md", "extra.md")
        
        // 額外檔案的輸出目錄
        // 當您想要更改輸出目錄並包含額外檔案時，
        // 請使用此區塊而非標準區塊
        outputDirectory.set(rootDir.resolve("docs/api/0.x"))
        
        // 使用 fileTree 新增多個檔案
        includes.from(
            fileTree("docs") {
                include("**/*.md")
            }
        )
    }
}
```

欲了解更多關於處理檔案的資訊，請參閱 [Gradle 文件](https://docs.gradle.org/current/userguide/working_with_files.html#sec:file_trees)。

</tab>
<tab title="Kotlin 自訂外掛程式" group-key="kotlin custom">

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
                // HTML 文件的標準輸出目錄
                publication.outputDirectory.set(project.layout.buildDirectory.dir("dokka/html"))
                publication.failOnWarning.set(true)
                publication.suppressInheritedMembers.set(true)
                publication.offlineMode.set(false)
                publication.suppressObviousFunctions.set(true)
                publication.includes.from("packages.md", "extra.md")

                // 額外檔案的輸出目錄
                // 當您想要更改輸出目錄並包含額外檔案時，
                // 請使用此區塊而非標準區塊
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
            // 設定一般模組資訊
            moduleName.set(project.name)
            moduleVersion.set(project.version.toString())

            // HTML 文件的標準輸出目錄
            outputDirectory.set(layout.buildDirectory.dir("dokka/html"))

            // 核心 Dokka 選項
            failOnWarning.set(false)
            suppressInheritedMembers.set(false)
            suppressObviousFunctions.set(true)
            offlineMode.set(false)
            includes.from(files("packages.md", "extra.md"))

            // 額外檔案的輸出目錄
            // 當您想要更改輸出目錄並包含額外檔案時，
            // 請使用此區塊而非標準區塊
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
           專案文件的顯示名稱。它出現在目錄、導覽、頁首與記錄訊息中。在多專案組建中，每個子專案的 <code>moduleName</code> 會在彙總文件中被用作其章節標題。
        </p>
        <p>預設值：Gradle 專案名稱</p>
    </def>
    <def title="moduleVersion">
        <p>
            在產生的文件中顯示的子專案版本。
            在單專案組建中，它被用作專案版本。
            在多專案組建中，彙總文件時會使用每個子專案的 <code>moduleVersion</code>。
        </p>
        <p>預設值：Gradle 專案版本</p>
    </def>
    <def title="outputDirectory">
        <p>產生的文件所存儲的目錄。</p>
        <p>此設定適用於由 <code>dokkaGenerate</code> 任務產生的所有文件格式（HTML、Javadoc 等）。</p>
        <p>預設值：<code>build/dokka/html</code></p>
        <p><b>額外檔案的輸出目錄</b></p>
        <p>您可以為單專案與多專案組建指定輸出目錄並包含額外檔案。
           對於多專案組建，
           請在根專案的配置中設定輸出目錄並包含額外檔案。
        </p>
    </def>
    <def title="failOnWarning">
        <p>
            決定當文件產生過程中出現警告時，Dokka 是否應使組建失敗。
            該程序會先等待所有錯誤和警告都發出。
        </p>
        <p>此設定與 <code>reportUndocumented</code> 配合良好。</p>
        <p>預設值：<code>false</code></p>
    </def>
    <def title="suppressInheritedMembers">
        <p>是否隱藏未在給定類別中明確覆寫的繼承成員。</p>
        <p>
            注意： 
            這會隱藏諸如 <code>equals</code>、<code>hashCode</code> 與 <code>toString</code> 之類的函式，
            但不會隱藏諸如 <code>dataClass.componentN</code> 與 
            <code>dataClass.copy</code> 的合成函式。對此類函式請使用 <code>suppressObviousFunctions</code>。
        </p>
        <p>預設值：<code>false</code></p>
    </def>
    <def title="suppressObviousFunctions">
        <p>是否隱藏顯而易見的函式。</p>
        <p>
            如果函式滿足以下條件，則被認為是顯而易見的：</p>
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
    <def title="offlineMode">
        <p>是否透過網路解析遠端檔案與連結。</p>
        <p>
            這包括用於產生外部文件連結的 package-list。
            例如，這可以讓您文件中的標準程式庫類別變為可點擊。
        </p>
        <p>
            在某些情況下，將此設定為 <code>true</code> 可以顯著加快組建時間，
            但也可能導致使用者體驗變差。例如，
            無法解析來自相依項（包括標準程式庫）的類別與成員連結。
        </p>
        <p>注意：您可以將擷取的檔案快取到本機，並以本機路徑提供給 Dokka。請參閱 
           <code><a href="#external-documentation-links-configuration">externalDocumentationLinks</a></code> 章節。</p>
        <p>預設值：<code>false</code></p>
    </def>
     <def title="includes">
        <p>
            包含 <a href="dokka-module-and-package-docs.md">子專案與套件文件</a> 的 Markdown 檔案清單。Markdown 檔案必須
            符合 <a href="dokka-module-and-package-docs.md#file-format">要求的格式</a>。
        </p>
        <p>指定檔案的內容會被剖析並作為子專案與套件說明嵌入到文件中。</p>
        <p>
            請參閱 <a href="https://github.com/Kotlin/dokka/blob/master/examples/gradle-v2/basic-gradle-example/build.gradle.kts">Dokka Gradle 範例</a>
            以了解其樣貌以及如何使用。
        </p>
    </def>
</deflist>

### 原始碼集配置 {id="source-set-configuration"}

Dokka 允許為 [Kotlin 原始碼集](https://kotlinlang.org/docs/multiplatform-discover-project.html#source-sets) 配置一些選項：

<tabs group="build-script">
<tab title="Gradle Kotlin DSL" group-key="kotlin">

```kotlin
import org.jetbrains.dokka.gradle.engine.parameters.VisibilityModifier

dokka {
    // ..
    // 一般配置章節
    // ..

    // 原始碼集配置
    dokkaSourceSets {
        // 範例：專屬於 'linux' 原始碼集的配置
        named("linux") {
            dependentSourceSets{named("native")}
            sourceRoots.from(file("linux/src"))
        }

        configureEach {
            suppress.set(false)
            displayName.set(name)
            documentedVisibilities.set(setOf(VisibilityModifier.Public)) // 或 documentedVisibilities(VisibilityModifier.Public)
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
                // 原始碼連結章節
            }
            perPackageOption {
                // 套件選項章節
            }
            externalDocumentationLinks {
                // 外部文件連結章節
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
    // 一般配置章節
    // ..

    dokkaSourceSets {
        // 範例：專屬於 'linux' 原始碼集的配置
        named("linux") {
            dependentSourceSets { named("native") }
            sourceRoots.from(file("linux/src"))
        }

        configureEach {
            suppress.set(false)
            displayName.set(name)
            documentedVisibilities.set([VisibilityModifier.Public] as Set) // 或 documentedVisibilities(VisibilityModifier.Public)
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
                // 原始碼連結章節
            }
            perPackageOption {
                // 套件選項章節
            }
            externalDocumentationLinks {
                // 外部文件連結章節
            }
        }
    }
}
```

</tab>
</tabs>

<deflist collapsible="true">
    <def title="suppress">
        <p>產生文件時是否應略過此原始碼集。</p>
        <p>預設值：<code>false</code></p>
    </def>
    <def title="displayName">
        <p>用於指代此原始碼集的顯示名稱。</p>
        <p>
            該名稱同時用於外部（例如，作為對文件讀者可見的原始碼集名稱）與 
            內部（例如，用於 <code>reportUndocumented</code> 的記錄訊息）。
        </p>
        <p>預設情況下，該值是從 Kotlin Gradle 外掛程式提供的資訊中推斷出來的。</p>
    </def>
    <def title="documentedVisibilities">
        <p>定義 Dokka 應在產生的文件中包含哪些可見性修飾符。</p>
        <p>
            如果您想要為 <code>protected</code>、<code>internal</code> 與 <code>private</code> 宣告編寫文件，
            以及如果您想要排除 <code>public</code> 宣告並僅為內部 API 編寫文件，請使用此選項。
        </p>
        <p>
            此外，您可以使用 Dokka 的 
            <a href="https://github.com/Kotlin/dokka/blob/v2.2.0/dokka-runners/dokka-gradle-plugin/src/main/kotlin/engine/parameters/HasConfigurableVisibilityModifiers.kt"><code>documentedVisibilities()</code> 函式</a> 
            來新增要記錄的可見性。
        </p>
        <p>這可以為每個個別套件進行配置。</p>
        <p>預設值：<code>VisibilityModifier.Public</code></p>
    </def>
    <def title="reportUndocumented">
        <p>
            是否針對可見的未編寫文件的宣告發出警告，即在經過 <code>documentedVisibilities</code> 與其他篩選器篩選後，沒有 KDocs 的宣告。
        </p>
        <p>此設定與 <code>failOnWarning</code> 配合良好。</p>
        <p>這可以為每個個別套件進行配置。</p>
        <p>預設值：<code>false</code></p>
    </def>
    <def title="skipEmptyPackages">
        <p>
            在套用各種篩選器後，是否略過不含任何可見宣告的套件。
        </p>
        <p>
            例如，如果 <code>skipDeprecated</code> 設定為 <code>true</code> 且您的套件僅包含
            已棄用的宣告，則該套件會被視為空。
        </p>
        <p>預設值：<code>true</code></p>
    </def>
    <def title="skipDeprecated">
        <p>是否為標註有 <code>@Deprecated</code> 的宣告編寫文件。</p>
        <p>這可以為每個個別套件進行配置。</p>
        <p>預設值：<code>false</code></p>
    </def>
    <def title="suppressGeneratedFiles">
        <p>是否為產生的檔案編寫文件。</p>
        <p>
            產生的檔案預期存在於 <code>{project}/{buildDir}/generated</code> 目錄下。
        </p>
        <p>
            如果設定為 <code>true</code>，它實際上會將該目錄中的所有檔案新增到 
            <code>suppressedFiles</code> 選項中，以便您可以手動配置。
        </p>
        <p>預設值：<code>true</code></p>
    </def>
    <def title="suppressAnnotatedWith">
        <p>一組用於隱藏標註有特定註解之宣告的註解完全限定名稱 (FQNs)。</p>
        <p>
            任何標註有這些註解之一的宣告都會從產生的文件中排除。
        </p>
    </def>
    <def title="jdkVersion">
        <p>為 Java 型別產生外部文件連結時要使用的 JDK 版本。</p>
        <p>
            例如，如果您在某些公共宣告簽章中使用 <code>java.util.UUID</code>，
            且此選項設定為 <code>8</code>，Dokka 會為其產生指向 <a href="https://docs.oracle.com/javase/8/docs/api/java/util/UUID.html">JDK 8 Javadocs</a> 的外部文件連結。
        </p>
        <p>預設值：`8`</p>
    </def>
    <def title="languageVersion">
        <p>
            用於設定分析與 <a href="https://kotlinlang.org/docs/kotlin-doc.html#sample-identifier">@sample</a>
            環境的 <a href="https://kotlinlang.org/docs/compatibility-modes.html">Kotlin 語言版本</a>。
        </p>
        <p>預設情況下，使用 Dokka 內嵌編譯器可用的最新語言版本。</p>
    </def>
    <def title="apiVersion">
        <p>
            用於設定分析與 <a href="https://kotlinlang.org/docs/kotlin-doc.html#sample-identifier">@sample</a>
            環境的 <a href="https://kotlinlang.org/docs/compatibility-modes.html">Kotlin API 版本</a>。
        </p>
        <p>預設情況下，它是從 <code>languageVersion</code> 推斷出來的。</p>
    </def>
    <def title="sourceRoots">
        <p>
            要分析並編寫文件的原始碼根目錄。
            可接受的輸入包括目錄以及個別的 <code>.kt</code> 與 <code>.java</code> 檔案。
        </p>
        <p>預設情況下，原始碼根目錄是從 Kotlin Gradle 外掛程式提供的資訊中推斷出來的。</p>
    </def>
    <def title="classpath">
        <p>用於分析與互動式範例的類別路徑。</p>
        <p>如果來自相依項的某些型別無法自動解析或擷取，這會很有用。</p>
        <p>此選項同時接受 <code>.jar</code> 與 <code>.klib</code> 檔案。</p>
        <p>預設情況下，類別路徑是從 Kotlin Gradle 外掛程式提供的資訊中推斷出來的。</p>
    </def>
    <def title="samples">
        <p>
            包含透過 <a href="https://kotlinlang.org/docs/kotlin-doc.html#sample-identifier">@sample</a> KDoc 標籤參照的範例函式的目錄或檔案清單。
        </p>
    </def>
</deflist>

### 原始碼連結配置 {id="source-link-configuration"}

配置原始碼連結以幫助讀者在遠端存儲庫中尋找每個宣告的原始碼。
請使用 `dokkaSourceSets.main {}` 區塊進行此配置。

`sourceLinks {}` 配置區塊允許您為每個簽章新增一個 `source` 連結，
該連結會指向帶有特定行號的 `remoteUrl`。
行號可以透過設定 `remoteLineSuffix` 來配置。

例如，請參閱 `kotlinx.coroutines` 中
[`count()`](https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines.flow/count.html)
函式的文件。

`build.gradle.kts` 檔案的語法與一般 `.kt` 檔案（例如用於自訂 Gradle 外掛程式的檔案）有所不同，因為 Gradle 的 Kotlin DSL 使用型別安全存取子：

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
<tab title="Kotlin 自訂外掛程式" group-key="kotlin custom">

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
            本機原始碼目錄的路徑。路徑必須相對於目前專案的根目錄。
        </p>
    </def>
    <def title="remoteUrl">
        <p>
            文件讀者可以存取的原始碼代管服務網址，
            例如 GitHub、GitLab、Bitbucket，或任何提供原始碼檔案穩定網址的代管服務。 
            此網址用於產生宣告的原始碼連結。
        </p>
    </def>
    <def title="remoteLineSuffix">
        <p>
            用於在網址後附加原始碼行號的後綴。這有助於讀者導覽到檔案，甚至導覽到宣告的特定行號。
        </p>
        <p>
            數字本身會被附加到指定的後綴。例如，
            如果此選項設定為 <code>#L</code> 且行號為 10，產生的網址後綴
            為 <code>#L10</code>。
        </p>
        <p>
            常用服務使用的後綴：</p>
            <list>
                <li>GitHub: <code>#L</code></li>
                <li>GitLab: <code>#L</code></li>
                <li>Bitbucket: <code>#lines-</code></li>
            </list>
        <p>預設值：<code>#L</code></p>
    </def>
</deflist>

### 套件選項 {id="package-options"}

`perPackageOption` 配置區塊允許為由 `matchingRegex` 匹配的特定套件設定一些選項：

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
                documentedVisibilities.set(setOf(VisibilityModifier.Public)) // 或 documentedVisibilities(VisibilityModifier.Public)
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
        <p>用於匹配套件的正規表示式。</p>
        <p>預設值：<code>.*</code></p>
    </def>
    <def title="suppress">
        <p>產生文件時是否應略過此套件。</p>
        <p>預設值：<code>false</code></p>
    </def>
    <def title="skipDeprecated">
        <p>是否為標註有 <code>@Deprecated</code> 的宣告編寫文件。</p>
        <p>這可以在原始碼集層級進行配置。</p>
        <p>預設值：<code>false</code></p>
    </def>
    <def title="reportUndocumented">
        <p>
            是否針對可見的未編寫文件的宣告發出警告，即在經過 <code>documentedVisibilities</code> 與其他篩選器篩選後，沒有 KDocs 的宣告。
        </p>
        <p>此設定與 <code>failOnWarning</code> 配合良好。</p>
        <p>這可以在原始碼集層級進行配置。</p>
        <p>預設值：<code>false</code></p>
    </def>
    <def title="documentedVisibilities">
        <p>定義 Dokka 應在產生的文件中包含哪些可見性修飾符。</p>
        <p>
            如果您想要為此套件內的 <code>protected</code>、<code>internal</code> 與 <code>private</code> 
            宣告編寫文件，以及如果您想要排除 <code>public</code> 宣告並僅為內部 API 編寫文件，請使用此選項。
        </p>
        <p>
            此外，您可以使用 Dokka 的 
            <a href="https://github.com/Kotlin/dokka/blob/v2.0.0/dokka-runners/dokka-gradle-plugin/src/main/kotlin/engine/parameters/HasConfigurableVisibilityModifiers.kt#L14-L16"><code>documentedVisibilities()</code> 函式</a> 
            來新增要記錄的可見性。
        </p>
        <p>這可以在原始碼集層級進行配置。</p>
        <p>預設值：<code>VisibilityModifier.Public</code></p>
    </def>
</deflist>

### 外部文件連結配置 {id="external-documentation-links-configuration"}

`externalDocumentationLinks {}`
區塊允許建立連向相依項之外部代管文件的連結。

例如，如果您正在使用來自 `kotlinx.serialization` 的型別，預設情況下它們在您的文件中是不可點擊的，就好像它們尚未解析一樣。然而，由於 `kotlinx.serialization` 的 API 參考文件是由 Dokka 建置並 [發佈在 kotlinlang.org 上](https://kotlinlang.org/api/kotlinx.serialization/)，您可以為其配置外部文件連結。這允許 Dokka 為該程式庫中的型別產生連結，使它們能夠成功解析並可供點擊。

預設情況下，已配置了 Kotlin 標準程式庫、JDK、Android SDK 與 AndroidX 的外部文件連結。

使用 `register()` 方法定義每個連結來註冊外部文件連結。
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
        <p>要連結到的文件的根網址。它<b>必須</b>包含尾隨斜槓。</p>
        <p>
            Dokka 會盡力自動尋找給定網址的 <code>package-list</code>， 
            並將宣告連結在一起。
        </p>
        <p>
            如果自動解析失敗，或者如果您想要改用本機快取的檔案， 
            請考慮設定 <code>packageListUrl</code> 選項。
        </p>
    </def>
    <def title="packageListUrl">
        <p>
            <code>package-list</code> 的確切位置。這是依靠 Dokka 自動解析之外的另一種選擇。
        </p>
        <p>
            套件清單包含有關文件與專案本身的資訊， 
            例如子專案與套件名稱。
        </p>
        <p>這也可以是本機快取的檔案，以避免網路呼叫。</p>
    </def>
</deflist>

### 完整配置 {id="complete-configuration"}

在下方您可以看到同時套用了所有可能配置選項的範例：

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
        // 範例：專屬於 'linux' 原始碼集的配置
        named("linux") {
            dependentSourceSets{named("native")}
            sourceRoots.from(file("linux/src"))
        }

        configureEach {
            suppress.set(false)
            displayName.set(name)
            documentedVisibilities.set(setOf(VisibilityModifier.Public)) // 或 documentedVisibilities(VisibilityModifier.Public)
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
        // 範例：專屬於 'linux' 原始碼集的配置
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