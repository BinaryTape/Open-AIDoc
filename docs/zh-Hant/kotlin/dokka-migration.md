[//]: # (title: 遷移至 Dokka Gradle 外掛程式 v2)

> 本頁面僅適用於您目前使用 DGPv1 並希望遷移至 DGPv2 的情況。從 Dokka 2.1.0 開始，DGP v2 預設已啟用。
> 如果您使用的是 Dokka 2.1.0 或更新版本，
> 可以略過本頁面並直接前往 [Dokka Gradle 文件](dokka-gradle.md)。
>
{style="note"}

Dokka Gradle 外掛程式 (DGP) 是一項工具，用於為使用 Gradle 建置的 Kotlin 專案產生完整的 API 文件。

DGP 能無縫處理 Kotlin 的 KDoc 註解與 Java 的 Javadoc 註解，從中擷取資訊並建立 [HTML 或 Javadoc](#select-documentation-output-format) 格式的結構化文件。

Dokka Gradle 外掛程式 v2 模式已預設啟用，並符合 Gradle 的最佳實務：

* 採用 Gradle 型別，從而帶來更好的效能。
* 使用直覺的頂層 DSL 設定，而非底層基於任務的設定，這簡化了建置指令碼並提高其可讀性。
* 採用更具宣告式的方法來進行文件聚合，讓多專案文件更易於管理。
* 使用型別安全的外掛程式設定，提升建置指令碼的可靠性與可維護性。
* 完整支援 Gradle [設定快取 (configuration cache)](https://docs.gradle.org/current/userguide/configuration_cache.html) 與 
  [建置快取 (build cache)](https://docs.gradle.org/current/userguide/build_cache.html)，進一步改善效能並簡化建置工作。

閱讀本指南以進一步了解從 DGP v1 遷移至 v2 模式的變更與步驟。

## 開始之前 {id="before-you-start"}

在開始遷移之前，請先完成以下步驟。

### 驗證支援的版本 {id="verify-supported-versions"}

請確保您的專案符合最低版本需求：

| **工具**                                                                           | **版本**      |
|-----------------------------------------------------------------------------------|---------------|
| [Gradle](https://docs.gradle.org/current/userguide/upgrading_version_8.html)      | 7.6 或更高版本 |
| [Android Gradle 外掛程式](https://developer.android.com/build/agp-upgrade-assistant) | 7.0 或更高版本 |
| [Kotlin Gradle 外掛程式](https://kotlinlang.org/docs/gradle-configure-project.html) | 1.9 或更高版本 |

### 啟用 DGP v2 {id="enable-dgp-v2"}

在專案的 `build.gradle.kts` 檔案中，將 `plugins {}` 區塊內的 Dokka 版本更新為 %dokkaVersion%：

```kotlin
plugins {
    kotlin("jvm") version "2.1.10"
    id("org.jetbrains.dokka") version "%dokkaVersion%"
}
```

或者，
您也可以使用[版本目錄 (version catalog)](https://docs.gradle.org/current/userguide/platforms.html#sub:version-catalog)
來啟用 Dokka Gradle 外掛程式 v2。

> 預設情況下，DGP v2 會產生 HTML 格式的文件。若要產生 Javadoc，或同時產生 HTML 與 Javadoc 格式，
> 請新增相應的外掛程式。關於外掛程式的詳細資訊，請參閱[選取文件輸出格式](#select-documentation-output-format)。
>
{style="tip"}

### 啟用遷移幫助程式 {id="enable-migration-helpers"}

在專案的 `gradle.properties` 檔案中，設定以下 Gradle 屬性以啟用帶有幫助程式的 DGP v2：

```text
org.jetbrains.dokka.experimental.gradle.pluginMode=V2EnabledWithHelpers
```

> 如果專案中沒有 `gradle.properties` 檔案，請在專案的根目錄中建立一個。
>
{style="tip"}

此屬性會啟用帶有遷移幫助程式的 DGP v2 外掛程式。當建置指令碼參照了 DGP v1 中存在但在 DGP v2 中已無法使用的任務時，這些幫助程式可以防止發生編譯錯誤。

> 遷移幫助程式不會主動協助進行遷移。它們只是在您轉移至新 API 的過渡期間，
> 防止建置指令碼發生中斷。
>
{style="note"}

完成遷移後，請[停用遷移幫助程式](#set-the-opt-in-flag)。

### 將專案與 Gradle 進行同步 {id="sync-your-project-with-gradle"}

啟用 DGP v2 與遷移幫助程式後，
請將專案與 Gradle 進行同步，以確保 DGP v2 已正確套用：

* 若使用 IntelliJ IDEA，請點擊 Gradle 工具視窗中的 **Reload All Gradle Projects** ![重新載入按鈕](gradle-reload-button.png){width=30}{type="joined"} 按鈕。
* 若使用 Android Studio，請選取 **File** | **Sync Project with Gradle Files**。

## 遷移您的專案 {id="migrate-your-project"}

將 Dokka Gradle 外掛程式更新至 v2 後，請依照適用於您專案的遷移步驟進行操作。

### 調整設定選項 {id="adjust-configuration-options"}

DGP v2 在 [Gradle 設定選項](dokka-gradle-configuration-options.md)中導入了一些變更。請在 `build.gradle.kts` 檔案中，根據專案的設置來調整設定選項。

#### DGP v2 中的頂層 DSL 設定 {id="top-level-dsl-configuration-in-dgp-v2"}

將 DGP v1 的設定語法替換為 DGP v2 的頂層 `dokka {}` DSL 設定：

DGP v1 中的設定：

```kotlin
tasks.withType<DokkaTask>().configureEach {
    suppressInheritedMembers.set(true)
    failOnWarning.set(true)
    dokkaSourceSets {
        named("main") {
            moduleName.set("Project Name")
            includes.from("README.md")
            sourceLink {
                localDirectory.set(file("src/main/kotlin"))
                remoteUrl.set(URL("https://example.com/src"))
                remoteLineSuffix.set("#L")
            }
        }
    }
}

tasks.dokkaHtml {
    pluginConfiguration<DokkaBase, DokkaBaseConfiguration> {
        customStyleSheets.set(listOf("styles.css"))
        customAssets.set(listOf("logo.png"))
        footerMessage.set("(c) Your Company")
    }
}
```

DGP v2 中的設定：

`build.gradle.kts` 檔案的語法與一般 `.kt` 檔案（例如用於自訂 Gradle 外掛程式的檔案）有所不同，因為 Gradle 的 Kotlin DSL 使用了型別安全的存取子。

<tabs group="dokka-configuration">
<tab title="Gradle Kotlin DSL" group-key="kotlin">

```kotlin
// build.gradle.kts

dokka {
    moduleName.set("Project Name")
    dokkaPublications.html {
        suppressInheritedMembers.set(true)
        failOnWarning.set(true)
    }
    dokkaSourceSets.main {
        includes.from("README.md")
        sourceLink {
            localDirectory.set(file("src/main/kotlin"))
            remoteUrl("https://example.com/src")
            remoteLineSuffix.set("#L")
        }
    }
    pluginsConfiguration.html {
        customStyleSheets.from("styles.css")
        customAssets.from("logo.png")
        footerMessage.set("(c) Your Company")
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
import org.jetbrains.dokka.gradle.engine.plugins.DokkaHtmlPluginParameters

abstract class CustomPlugin : Plugin<Project> {
    override fun apply(project: Project) {
        project.plugins.apply("org.jetbrains.dokka")

        project.extensions.configure(DokkaExtension::class.java) { dokka ->

            dokka.dokkaPublications.named("html") { publication ->
                publication.suppressInheritedMembers.set(true)
                publication.failOnWarning.set(true)
            }

            dokka.dokkaSourceSets.named("main") { dss ->
                dss.includes.from("README.md")
                dss.sourceLink {
                    it.localDirectory.set(project.file("src/main/kotlin"))
                    it.remoteUrl("https://example.com/src")
                    it.remoteLineSuffix.set("#L")
                }
            }

            dokka.pluginsConfiguration.named("html", DokkaHtmlPluginParameters::class.java) { html ->
                html.customStyleSheets.from("styles.css")
                html.customAssets.from("logo.png")
                html.footerMessage.set("(c) Your Company")
            }
        }
    }
}
```

</tab>
</tabs>

#### 可見性設定 {id="visibility-settings"}

將 `documentedVisibilities` 屬性從 `Visibility.PUBLIC` 改設為 `VisibilityModifier.Public`。

DGP v1 中的設定：

```kotlin
import org.jetbrains.dokka.DokkaConfiguration.Visibility

// ...
documentedVisibilities.set(
    setOf(Visibility.PUBLIC)
) 
```

DGP v2 中的設定：

```kotlin
import org.jetbrains.dokka.gradle.engine.parameters.VisibilityModifier

// ...
documentedVisibilities.set(
    setOf(VisibilityModifier.Public)
)

// 或

documentedVisibilities(VisibilityModifier.Public)
```

此外，還可以使用 DGP v2 的[工具函式](https://github.com/Kotlin/dokka/blob/v2.3.0/dokka-runners/dokka-gradle-plugin/src/main/kotlin/engine/parameters/HasConfigurableVisibilityModifiers.kt#L14-L16)來新增記錄的可見性：

```kotlin
fun documentedVisibilities(vararg visibilities: VisibilityModifier): Unit =
    documentedVisibilities.set(visibilities.asList()) 
```

#### 原始碼連結 {id="source-links"}

設定原始碼連結，以便從產生的文件巡覽至遠端存儲庫中的對應原始碼。
請使用 `dokkaSourceSets.main{}` 區塊進行此設定。

DGP v1 中的設定：

```kotlin
tasks.withType<DokkaTask>().configureEach {
    dokkaSourceSets {
        named("main") {
            sourceLink {
                localDirectory.set(file("src/main/kotlin"))
                remoteUrl.set(URL("https://github.com/your-repo"))
                remoteLineSuffix.set("#L")
            }
        }
    }
}
```

DGP v2 中的設定：

`build.gradle.kts` 檔案的語法與一般 `.kt` 檔案（例如用於自訂 Gradle 外掛程式的檔案）有所不同，因為 Gradle 的 Kotlin DSL 使用了型別安全的存取子。

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
</tabs>

由於原始碼連結設定已[發生變更](https://docs.gradle.org/current/userguide/upgrading_version_8.html#deprecated_invalid_url_decoding)，
請使用 `URI` 類別代替 `URL` 來指定遠端 URL。

DGP v1 中的設定：

```kotlin
remoteUrl.set(URL("https://github.com/your-repo"))
```

DGP v2 中的設定：

```kotlin
remoteUrl.set(URI("https://github.com/your-repo"))

// 或

remoteUrl("https://github.com/your-repo")
```

此外，DGP v2 提供兩個用於設定 URL 的[工具函式](https://github.com/Kotlin/dokka/blob/220922378e6c68eb148fda2ec80528a1b81478c9/dokka-runners/dokka-gradle-plugin/src/main/kotlin/engine/parameters/DokkaSourceLinkSpec.kt#L82-L96)：

```kotlin
fun remoteUrl(@Language("http-url-reference") value: String): Unit =
    remoteUrl.set(URI(value))

// 以及

fun remoteUrl(value: Provider<String>): Unit =
    remoteUrl.set(value.map(::URI))
```

#### 外部文件連結 {id="external-documentation-links"}

使用 `register()` 方法註冊外部文件連結以定義各個連結。
`externalDocumentationLinks` API 使用此方法以符合 Gradle DSL 慣例。

DGP v1 中的設定：

```kotlin
tasks.dokkaHtml {
    dokkaSourceSets {
        configureEach {
            externalDocumentationLink {
                url = URL("https://example.com/docs/")
                packageListUrl = File("/path/to/package-list").toURI().toURL()
            }
        }
    }
}
```

DGP v2 中的設定：

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

#### 自訂資源 {id="custom-assets"}

將 [`customAssets`](dokka-html.md#customize-assets) 屬性與檔案集合 [(`FileCollection`)](https://docs.gradle.org/8.10/userguide/lazy_configuration.html#working_with_files_in_lazy_properties) 搭配使用，取代原有的清單 (`var List<File>`)。

DGP v1 中的設定：

```kotlin
customAssets = listOf(file("example.png"), file("example2.png"))
```

DGP v2 中的設定：

```kotlin
customAssets.from("example.png", "example2.png")
```

#### 輸出目錄 {id="output-directory"}

使用 `dokka {}` 區塊指定所產生 Dokka 文件的輸出目錄。

DGP v1 中的設定：

```kotlin
tasks.dokkaHtml {
    outputDirectory.set(layout.buildDirectory.dir("dokkaDir"))
}
```

DGP v2 中的設定：

```kotlin
dokka {
    dokkaPublications.html {
        outputDirectory.set(layout.buildDirectory.dir("dokkaDir"))
    }
}
```

#### 額外檔案的輸出目錄 {id="output-directory-for-additional-files"}

在 `dokka {}` 區塊內指定輸出目錄，並包含單一模組與多模組專案的額外檔案。

在 DGP v2 中，單一模組與多模組專案的設定已整合統一。
您不再需要分別設定 `dokkaHtml` 與 `dokkaHtmlMultiModule` 任務，只需在 `dokka {}` 區塊內的 `dokkaPublications.html {}` 中指定相關設定即可。

對於多模組專案，請在根專案的設定中設定輸出目錄並包含額外檔案（例如 `README.md`）。

DGP v1 中的設定：

```kotlin
tasks.dokkaHtmlMultiModule {
    outputDirectory.set(rootDir.resolve("docs/api/0.x"))
    includes.from(project.layout.projectDirectory.file("README.md"))
}
```

DGP v2 中的設定：

`build.gradle.kts` 檔案的語法與一般 `.kt` 檔案（例如用於自訂 Gradle 外掛程式的檔案）有所不同，因為 Gradle 的 Kotlin DSL 使用了型別安全的存取子。

<tabs group="dokka-configuration">
<tab title="Gradle Kotlin DSL" group-key="kotlin">

```kotlin
// build.gradle.kts

dokka {
    dokkaPublications.html {
        outputDirectory.set(rootDir.resolve("docs/api/0.x"))
        includes.from(project.layout.projectDirectory.file("README.md"))
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
            dokka.dokkaPublications.named("html") { html ->
                html.outputDirectory.set(project.rootDir.resolve("docs/api/0.x"))
                html.includes.from(project.layout.projectDirectory.file("README.md"))
            }
        }
    }
}
```

</tab>
</tabs>

### 設定 Dokka 外掛程式 {id="configure-dokka-plugins"}

使用 JSON 設定內建 Dokka 外掛程式的方式已被棄用，轉而採用型別安全 DSL。此變更提升了與 Gradle 增量建置系統的相容性，並改善了任務輸入追蹤。

DGP v1 中的設定：

在 DGP v1 中，Dokka 外掛程式是手動使用 JSON 進行設定的。這種方式會導致 Gradle 最新狀態檢查在[註冊任務輸入](https://docs.gradle.org/current/userguide/incremental_build.html)時出現問題。

以下是 [Dokka 版本控制外掛程式 (Dokka Versioning plugin)](https://kotl.in/dokka-versioning-plugin) 已被棄用的基於 JSON 設定的範例：

```kotlin
tasks.dokkaHtmlMultiModule {
    pluginsMapConfiguration.set(
        mapOf(
            "org.jetbrains.dokka.versioning.VersioningPlugin" to """
                { "version": "1.2", "olderVersionsDir": "$projectDir/dokka-docs" }
                """.trimIndent()
        )
    )
}
```

DGP v2 中的設定：

在 DGP v2 中，Dokka 外掛程式使用型別安全 DSL 進行設定。若要以型別安全的方式設定 Dokka 外掛程式，請使用 `pluginsConfiguration{}` 區塊：

```kotlin
dokka {
    pluginsConfiguration {
        versioning {
            version.set("1.2")
            olderVersionsDir.set(projectDir.resolve("dokka-docs"))
        }
    }
}
```

有關 DGP v2 設定的範例，請參閱
[Dokka 的版本控制外掛程式](https://github.com/Kotlin/dokka/tree/master/examples/gradle-v2/versioning-multimodule-example)。

DGP v2 允許您透過[設定自訂外掛程式](https://github.com/Kotlin/dokka/blob/ae3840edb4e4afd7b3e3768a5fddfe8ec0e08f31/examples/gradle-v2/custom-dokka-plugin-example/demo-library/build.gradle.kts)來擴充其功能。
自訂外掛程式可為文件產生程序提供額外的處理或修改。

### 在子專案之間共用 Dokka 設定 {id="share-dokka-configuration-across-subprojects"}

DGP v2 不再建議使用 `subprojects {}` 或 `allprojects {}` 在子專案之間共用設定。在未來的 Gradle 版本中，
使用這些方式將會[導致錯誤](https://docs.gradle.org/current/userguide/isolated_projects.html)。

請依照以下步驟，在[具有現有慣例外掛程式](#multi-module-projects-with-convention-plugins)或[沒有慣例外掛程式](#multi-module-projects-without-convention-plugins)的多模組專案中正確共用 Dokka 設定。

共用 Dokka 設定後，您可以將來自多個子專案的文件聚合為單一輸出。如需詳細資訊，請參閱
[更新多模組專案中的文件聚合](#update-documentation-aggregation-in-multi-module-projects)。

> 關於多模組專案範例，請參閱 [Dokka GitHub 存儲庫](https://github.com/Kotlin/dokka/tree/master/examples/gradle-v2/multimodule-example)。
>
{style="tip"}

#### 不含慣例外掛程式的多模組專案 {id="multi-module-projects-without-convention-plugins"}

如果您的專案未使用慣例外掛程式，您仍可透過直接設定每個子專案來共用 Dokka 設定。
這需要在每個子專案的 `build.gradle.kts` 檔案中手動設定共用配置。雖然這種方式的集中度較低，
但無需額外設定慣例外掛程式。

另一方面，如果您的專案使用慣例外掛程式，也可以透過在 `buildSrc` 目錄中建立慣例外掛程式，
然後將該外掛程式套用至各子專案，以在多模組專案中共用 Dokka 設定。

##### 設定 buildSrc 目錄 {id="set-up-the-buildsrc-directory"}

1. 在專案根目錄中，建立一個包含兩個檔案的 `buildSrc` 目錄：

   * `settings.gradle.kts`
   * `build.gradle.kts`

2. 在 `buildSrc/settings.gradle.kts` 檔案中，新增以下程式碼片段：

   ```kotlin
   rootProject.name = "buildSrc"
   ```

3. 在 `buildSrc/build.gradle.kts` 檔案中，新增以下程式碼片段：

    ```kotlin
    plugins {
        `kotlin-dsl`
    }
    
    repositories {
        mavenCentral()
        gradlePluginPortal()
    }
    
    dependencies {
        implementation("org.jetbrains.dokka:dokka-gradle-plugin:%dokkaVersion%")
    }   
    ```

##### 設定 Dokka 慣例外掛程式 {id="set-up-the-dokka-convention-plugin"}

設定好 `buildSrc` 目錄後：

1. 建立 `buildSrc/src/main/kotlin/dokka-convention.gradle.kts` 檔案以存放[慣例外掛程式](https://docs.gradle.org/current/userguide/custom_plugins.html#sec:convention_plugins)。
2. 在 `dokka-convention.gradle.kts` 檔案中，新增以下程式碼片段：

    ```kotlin
    plugins {
        id("org.jetbrains.dokka") 
    }

    dokka {
        // 共用設定置於此處
    }
    ```

   您需要在 `dokka {}` 區塊內新增所有子專案通用的共用 Dokka [設定](#adjust-configuration-options)。
   此外，您無需指定 Dokka 版本，該版本已在 `buildSrc/build.gradle.kts` 檔案中設定。

##### 將慣例外掛程式套用至子專案 {id="apply-the-convention-plugin-to-your-subprojects"}

將 Dokka 慣例外掛程式新增至每個子專案的 `build.gradle.kts` 檔案中，以套用至各個子專案：

```kotlin
plugins {
    id("dokka-convention")
}
```

#### 含有慣例外掛程式的多模組專案 {id="multi-module-projects-with-convention-plugins"}

如果您已經擁有慣例外掛程式，請依照 [Gradle 文件](https://docs.gradle.org/current/userguide/custom_plugins.html#sec:convention_plugins)建立一個專用的 Dokka 慣例外掛程式。

接著，依照相關步驟[設定 Dokka 慣例外掛程式](#set-up-the-dokka-convention-plugin)並
[將其套用至所有子專案](#apply-the-convention-plugin-to-your-subprojects)。

### 更新多模組專案中的文件聚合 {id="update-documentation-aggregation-in-multi-module-projects"}

Dokka 可以將來自多個子專案的文件聚合為單一輸出或發布項。

如[前文所述](#apply-the-convention-plugin-to-your-subprojects)，在聚合文件之前，請先將 Dokka 外掛程式套用至所有可產生文件的子專案。

DGP v2 中的聚合使用 `dependencies {}` 區塊而非任務，且可新增於任何 `build.gradle.kts` 檔案中。

在 DGP v1 中，聚合是在根專案中隱式建立的。若要在 DGP v2 中重現此行為，請在根專案的 `build.gradle.kts` 檔案中新增 `dependencies {}` 區塊。

DGP v1 中的聚合：

```kotlin
    tasks.dokkaHtmlMultiModule {
        // ...
    }
```

DGP v2 中的聚合：

```kotlin
dependencies {
    dokka(project(":some-subproject:"))
    dokka(project(":another-subproject:"))
}
```

### 變更聚合文件的目錄 {id="change-directory-of-aggregated-documentation"}

當 DGP 聚合子專案時，每個子專案在聚合文件內都會有自己的子目錄。

在 DGP v2 中，聚合機制已更新以更符合 Gradle 慣例。
DGP v2 現在會保留完整的子專案目錄結構，以防止在任何位置聚合文件時發生衝突。

DGP v1 中的聚合目錄：

在 DGP v1 中，聚合文件被放置在收合的目錄結構中。
例如，若一個專案在 `:turbo-lib` 中進行聚合，且具有嵌套子專案 `:turbo-lib:maths`，
則產生的文件會位於：

```text
turbo-lib/build/dokka/html/maths/
```

DGP v2 中的聚合目錄：

DGP v2 透過保留完整的專案結構來確保每個子專案具有唯一的目錄。相同的聚合文件現在採用以下結構：

```text
turbo-lib/build/dokka/html/turbo-lib/maths/
```

此項變更可防止同名的子專案發生衝突。但是，由於目錄結構已改變，外部連結可能會過期，進而可能導致 `404` 錯誤。

#### 還原為 DGP v1 目錄行為 {id="revert-to-the-dgp-v1-directory-behavior"}

如果您的專案依賴 DGP v1 中使用的目錄結構，您可以透過手動指定子專案目錄來還原此行為。
請將以下設定新增至各子專案的 `build.gradle.kts` 檔案中：

```kotlin
// /turbo-lib/maths/build.gradle.kts

plugins {
    id("org.jetbrains.dokka")
}

dokka {
    // 覆寫子專案目錄以符合 V1 結構
    modulePath.set("maths")
}
```

### 使用更新後的任務產生文件 {id="generate-documentation-with-the-updated-task"}

DGP v2 重新命名了產生 API 文件的 Gradle 任務。

DGP v1 中的任務：

```text
./gradlew dokkaHtml

// 或

./gradlew dokkaHtmlMultiModule
```

DGP v2 中的任務：

```text
./gradlew :dokkaGenerate
```

`dokkaGenerate` 任務會在 `build/dokka/` 目錄中產生 API 文件。

在 DGP v2 版本中，`dokkaGenerate` 任務名稱同時適用於單一模組和多模組專案。您可以使用不同的任務來產生 HTML、Javadoc 或同時產生 HTML 與 Javadoc 輸出。如需詳細資訊，請參閱[選取文件輸出格式](#select-documentation-output-format)。

### 選取文件輸出格式 {id="select-documentation-output-format"}

> Javadoc 輸出格式處於 [Alpha](https://kotlinlang.org/docs/components-stability.html#stability-levels-explained) 階段。
> 使用時可能會遇到錯誤或遷移問題。不保證能夠與接受 Javadoc 作為輸入的工具成功整合。請自行承擔使用風險。
>
{style="warning"}

DGP v2 的預設輸出格式為 HTML。不過，您可以選擇產生 HTML、Javadoc 或同時產生這兩種格式的 API 文件：

1. 在專案 `build.gradle.kts` 檔案的 `plugins {}` 區塊中加入對應的外掛程式 `id`：

   ```kotlin
   plugins {
       // 產生 HTML 文件
       id("org.jetbrains.dokka") version "%dokkaVersion%"

       // 產生 Javadoc 文件
       id("org.jetbrains.dokka-javadoc") version "%dokkaVersion%"

       // 同時保留兩個外掛程式 ID 將會產生這兩種格式
   }
   ```

2. 執行對應的 Gradle 任務。

以下是各格式對應的外掛程式 `id` 與 Gradle 任務清單：

|             | **HTML**                       | **Javadoc**                         | **兩者**                          |
|-------------|--------------------------------|-------------------------------------|-----------------------------------|
| 外掛程式 `id` | `id("org.jetbrains.dokka")`    | `id("org.jetbrains.dokka-javadoc")` | 同時使用 HTML 與 Javadoc 外掛程式 |
| Gradle 任務 | `./gradlew :dokkaGeneratePublicationHtml` | `./gradlew :dokkaGeneratePublicationJavadoc`   | `./gradlew :dokkaGenerate`        |

> `dokkaGenerate` 任務會依據套用的外掛程式產生所有可用格式的文件。
> 如果同時套用了 HTML 和 Javadoc 外掛程式，您可以透過執行 `dokkaGeneratePublicationHtml` 任務僅產生 HTML，
> 或透過執行 `dokkaGeneratePublicationJavadoc` 任務僅產生 Javadoc。
> 
{style="tip"}

如果您使用的是 IntelliJ IDEA，可能會看到 `dokkaGenerateHtml` Gradle 任務。
此任務只是 `dokkaGeneratePublicationHtml` 的別名。這兩個任務執行的操作完全相同。

### 處理棄用與移除項目 {id="address-deprecations-and-removals"}

* **輸出格式支援：** DGP v2 僅支援 HTML 與 Javadoc 輸出。不再支援 Markdown 和 Jekyll 等實驗性格式。
* **收集器任務：** `DokkaCollectorTask` 已被移除。現在，您需要分別為每個子專案產生文件，然後在必要時[聚合文件](#update-documentation-aggregation-in-multi-module-projects)。

## 完成遷移 {id="finalize-your-migration"}

在完成專案遷移後，請執行以下步驟以進行收尾並改善效能。

### 設定選擇加入 (opt-in) 旗標 {id="set-the-opt-in-flag"}

成功遷移後，請在專案的 `gradle.properties` 檔案中設定以下不含幫助程式的 opt-in 旗標：

```text
org.jetbrains.dokka.experimental.gradle.pluginMode=V2Enabled
```

如果您已移除對 DGP v1 中存在但在 DGP v2 中已不可用的 Gradle 任務的參照，
應該不會再看到與其相關的編譯錯誤。

### 啟用建置快取與設定快取 {id="enable-build-cache-and-configuration-cache"}

DGP v2 現在支援 Gradle 建置快取與設定快取，從而改善建置效能。

* 若要啟用建置快取，請遵循 [Gradle 建置快取文件](https://docs.gradle.org/current/userguide/build_cache.html#sec:build_cache_enable)中的指示。
* 若要啟用設定快取，請遵循 [Gradle 設定快取文件](https://docs.gradle.org/current/userguide/configuration_cache.html#config_cache:usage:enable )中的指示。

## 後續步驟 {id="what-s-next"}

* [探索更多 DGP v2 專案範例](https://github.com/Kotlin/dokka/tree/master/examples/gradle-v2)。 
* [開始使用 Dokka](dokka-get-started.md)。
* [深入了解 Dokka 外掛程式](dokka-plugins.md)。