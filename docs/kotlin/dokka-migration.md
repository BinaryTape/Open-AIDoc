[//]: # (title: 迁移到 Dokka Gradle 插件 v2)

> 仅当您当前正在使用 DGPv1 并希望迁移到 DGPv2 时，此页面才具有参考价值。从 Dokka 2.1.0 开始，DGP v2 已默认启用。
> 如果您使用的是 Dokka 2.1.0 或更高版本，
> 可以跳过此页面，直接查阅 [Dokka Gradle 文档](dokka-gradle.md)。
>
{style="note"}

Dokka Gradle 插件 (DGP) 是一款用于为使用 Gradle 构建的 Kotlin 项目生成全套 API 文档的工具。

DGP 能够无缝处理 Kotlin 的 KDoc 注释和 Java 的 Javadoc 注释以提取信息，并以 [HTML 或 Javadoc](#select-documentation-output-format) 格式创建结构化文档。

Dokka Gradle 插件 v2 模式已默认启用，并遵循 Gradle 的最佳实践：

* 采用 Gradle 类型，从而带来更好的性能。
* 使用直观的顶级 DSL 配置代替底层基于任务的设置，从而简化构建脚本并提高其可读性。
* 采用更加声明式的方法进行文档聚合，使多项目文档更易于管理。
* 使用类型安全的插件配置，提高构建脚本的可靠性和可维护性。
* 完全支持 Gradle [配置缓存 (configuration cache)](https://docs.gradle.org/current/userguide/configuration_cache.html) 和 [构建缓存 (build cache)](https://docs.gradle.org/current/userguide/build_cache.html)，从而提升性能并简化构建工作。

请阅读本指南，详细了解从 DGP v1 到 v2 模式的变更和迁移方法。

## 开始之前 {id="before-you-start"}

在开始迁移之前，请完成以下步骤。

### 验证支持的版本 {id="verify-supported-versions"}

确保您的项目满足最低版本要求：

| **工具**                                                                          | **版本**   |
|-----------------------------------------------------------------------------------|---------------|
| [Gradle](https://docs.gradle.org/current/userguide/upgrading_version_8.html)      | 7.6 或更高 |
| [Android Gradle 插件](https://developer.android.com/build/agp-upgrade-assistant) | 7.0 或更高 |
| [Kotlin Gradle 插件](https://kotlinlang.org/docs/gradle-configure-project.html) | 1.9 或更高 |

### 启用 DGP v2 {id="enable-dgp-v2"}

在项目 `build.gradle.kts` 文件的 `plugins {}` 块中将 Dokka 版本更新为 %dokkaVersion%：

```kotlin
plugins {
    kotlin("jvm") version "2.1.10"
    id("org.jetbrains.dokka") version "%dokkaVersion%"
}
```

或者，
您也可以使用[版本目录 (version catalog)](https://docs.gradle.org/current/userguide/platforms.html#sub:version-catalog)
来启用 Dokka Gradle 插件 v2。

> 默认情况下，DGP v2 会生成 HTML 格式的文档。若要生成 Javadoc 格式或同时生成 HTML 和 Javadoc 格式，
> 请添加相应的插件。有关插件的更多信息，请参阅[选择文档输出格式](#select-documentation-output-format)。
>
{style="tip"}

### 启用迁移帮助程序 {id="enable-migration-helpers"}

在项目的 `gradle.properties` 文件中，设置以下 Gradle 属性以启用带有帮助程序的 DGP v2：

```text
org.jetbrains.dokka.experimental.gradle.pluginMode=V2EnabledWithHelpers
```

> 如果项目中没有 `gradle.properties` 文件，请在项目根目录下创建一个。
>
{style="tip"}

该属性会激活带有迁移帮助程序的 DGP v2 插件。当构建脚本引用了 DGP v2 中已不再提供的 DGP v1 任务时，这些帮助程序可以防止编译报错。

> 迁移帮助程序不会主动协助进行迁移。它们仅在您向新 API 过渡期间防止构建脚本损坏。
>
{style="note"}

完成迁移后，请[禁用迁移帮助程序](#set-the-opt-in-flag)。

### 与 Gradle 同步项目 {id="sync-your-project-with-gradle"}

启用 DGP v2 和迁移帮助程序后，
将项目与 Gradle 同步以确保正确应用 DGP v2：

* 如果使用 IntelliJ IDEA，请点击 Gradle 工具窗口中的 **Reload All Gradle Projects** ![重载按钮](gradle-reload-button.png){width=30}{type="joined"} 按钮。
* 如果使用 Android Studio，请选择 **File** | **Sync Project with Gradle Files**。

## 迁移您的项目 {id="migrate-your-project"}

将 Dokka Gradle 插件更新为 v2 后，请按照适用于您项目的迁移步骤进行操作。

### 调整配置选项 {id="adjust-configuration-options"}

DGP v2 对 [Gradle 配置选项](dokka-gradle-configuration-options.md)进行了一些变更。请在 `build.gradle.kts` 文件中，根据项目设置调整配置选项。

#### DGP v2 中的顶级 DSL 配置 {id="top-level-dsl-configuration-in-dgp-v2"}

将 DGP v1 的配置语法替换为 DGP v2 的顶级 `dokka {}` DSL 配置：

DGP v1 中的配置：

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

DGP v2 中的配置：

`build.gradle.kts` 文件的语法与常规 `.kt` 文件（例如用于自定义 Gradle 插件的文件）不同，因为 Gradle 的 Kotlin DSL 使用了类型安全访问器。

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
<tab title="Kotlin 自定义插件" group-key="kotlin custom">

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

#### 可见性设置 {id="visibility-settings"}

将 `documentedVisibilities` 属性从 `Visibility.PUBLIC` 设置为 `VisibilityModifier.Public`。

DGP v1 中的配置：

```kotlin
import org.jetbrains.dokka.DokkaConfiguration.Visibility

// ...
documentedVisibilities.set(
    setOf(Visibility.PUBLIC)
) 
```

DGP v2 中的配置：

```kotlin
import org.jetbrains.dokka.gradle.engine.parameters.VisibilityModifier

// ...
documentedVisibilities.set(
    setOf(VisibilityModifier.Public)
)

// 或者

documentedVisibilities(VisibilityModifier.Public)
```

此外，还可以使用 DGP v2 的[实用函数](https://github.com/Kotlin/dokka/blob/v2.3.0/dokka-runners/dokka-gradle-plugin/src/main/kotlin/engine/parameters/HasConfigurableVisibilityModifiers.kt#L14-L16)来添加需要记录的可见性：

```kotlin
fun documentedVisibilities(vararg visibilities: VisibilityModifier): Unit =
    documentedVisibilities.set(visibilities.asList()) 
```

#### 源码链接 {id="source-links"}

配置源码链接，以便能够从生成的文档导航到远程仓库中的对应源代码。
使用 `dokkaSourceSets.main{}` 块进行此配置。

DGP v1 中的配置：

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

DGP v2 中的配置：

`build.gradle.kts` 文件的语法与常规 `.kt` 文件（例如用于自定义 Gradle 插件的文件）不同，因为 Gradle 的 Kotlin DSL 使用了类型安全访问器。

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
<tab title="Kotlin 自定义插件" group-key="kotlin custom">

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

由于源码链接配置已[更改](https://docs.gradle.org/current/userguide/upgrading_version_8.html#deprecated_invalid_url_decoding)，
请使用 `URI` 类代替 `URL` 来指定远程 URL。

DGP v1 中的配置：

```kotlin
remoteUrl.set(URL("https://github.com/your-repo"))
```

DGP v2 中的配置：

```kotlin
remoteUrl.set(URI("https://github.com/your-repo"))

// 或者

remoteUrl("https://github.com/your-repo")
```

此外，DGP v2 还提供了两个用于设置 URL 的[实用函数](https://github.com/Kotlin/dokka/blob/220922378e6c68eb148fda2ec80528a1b81478c9/dokka-runners/dokka-gradle-plugin/src/main/kotlin/engine/parameters/DokkaSourceLinkSpec.kt#L82-L96)：

```kotlin
fun remoteUrl(@Language("http-url-reference") value: String): Unit =
    remoteUrl.set(URI(value))

// 以及

fun remoteUrl(value: Provider<String>): Unit =
    remoteUrl.set(value.map(::URI))
```

#### 外部文档链接 {id="external-documentation-links"}

使用 `register()` 方法注册外部文档链接以定义每个链接。
`externalDocumentationLinks` API 使用此方法以遵循 Gradle DSL 约定。

DGP v1 中的配置：

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

DGP v2 中的配置：

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

#### 自定义资源 {id="custom-assets"}

将 [`customAssets`](dokka-html.md#customize-assets) 属性与文件集合 [(`FileCollection`)](https://docs.gradle.org/8.10/userguide/lazy_configuration.html#working_with_files_in_lazy_properties) 一起使用，而不是列表 (`var List<File>`)。

DGP v1 中的配置：

```kotlin
customAssets = listOf(file("example.png"), file("example2.png"))
```

DGP v2 中的配置：

```kotlin
customAssets.from("example.png", "example2.png")
```

#### 输出目录 {id="output-directory"}

使用 `dokka {}` 块指定生成的 Dokka 文档的输出目录。

DGP v1 中的配置：

```kotlin
tasks.dokkaHtml {
    outputDirectory.set(layout.buildDirectory.dir("dokkaDir"))
}
```

DGP v2 中的配置：

```kotlin
dokka {
    dokkaPublications.html {
        outputDirectory.set(layout.buildDirectory.dir("dokkaDir"))
    }
}
```

#### 附加文件的输出目录 {id="output-directory-for-additional-files"}

在 `dokka {}` 块内为单模块和多模块项目指定输出目录并包含附加文件。

在 DGP v2 中，单模块和多模块项目的配置得到了统一。
无需分别配置 `dokkaHtml` 和 `dokkaHtmlMultiModule` 任务，只需在 `dokka {}` 块内的 `dokkaPublications.html {}` 中指定设置即可。

对于多模块项目，请在根项目的配置中设置输出目录并包含附加文件（例如 `README.md`）。

DGP v1 中的配置：

```kotlin
tasks.dokkaHtmlMultiModule {
    outputDirectory.set(rootDir.resolve("docs/api/0.x"))
    includes.from(project.layout.projectDirectory.file("README.md"))
}
```

DGP v2 中的配置：

`build.gradle.kts` 文件的语法与常规 `.kt` 文件（例如用于自定义 Gradle 插件的文件）不同，因为 Gradle 的 Kotlin DSL 使用了类型安全访问器。

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
<tab title="Kotlin 自定义插件" group-key="kotlin custom">

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

### 配置 Dokka 插件 {id="configure-dokka-plugins"}

使用 JSON 配置内置 Dokka 插件的方式已被弃用，取而代之的是类型安全的 DSL。这一改动提高了与 Gradle 增量构建系统的兼容性，并改进了任务输入跟踪。

DGP v1 中的配置：

在 DGP v1 中，Dokka 插件是通过 JSON 手动配置的。这种方法在为 Gradle 最新状态检查[注册任务输入](https://docs.gradle.org/current/userguide/incremental_build.html)时会导致问题。

以下是针对 [Dokka 版本控制插件 (Dokka Versioning plugin)](https://kotl.in/dokka-versioning-plugin) 已被弃用的基于 JSON 配置的示例：

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

DGP v2 中的配置：

在 DGP v2 中，Dokka 插件通过类型安全的 DSL 进行配置。若要以类型安全的方式配置 Dokka 插件，请使用 `pluginsConfiguration{}` 块：

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

有关 DGP v2 配置的示例，请参阅
[Dokka 的版本控制插件](https://github.com/Kotlin/dokka/tree/master/examples/gradle-v2/versioning-multimodule-example)。

DGP v2 允许您通过[配置自定义插件](https://github.com/Kotlin/dokka/blob/ae3840edb4e4afd7b3e3768a5fddfe8ec0e08f31/examples/gradle-v2/custom-dokka-plugin-example/demo-library/build.gradle.kts)来扩展其功能。
自定义插件可用于在文档生成过程中进行额外的处理或修改。

### 跨子项目共享 Dokka 配置 {id="share-dokka-configuration-across-subprojects"}

DGP v2 不再使用 `subprojects {}` 或 `allprojects {}` 跨子项目共享配置。在未来的 Gradle 版本中，
使用这些方法将[导致错误](https://docs.gradle.org/current/userguide/isolated_projects.html)。

请按照以下步骤在多模块项目中正确共享 Dokka 配置（无论是[包含现有约定插件](#multi-module-projects-with-convention-plugins)还是[不包含约定插件](#multi-module-projects-without-convention-plugins)）。

共享 Dokka 配置后，您可以将多个子项目的文档聚合为单一输出。有关更多信息，请参阅[更新多模块项目中的文档聚合](#update-documentation-aggregation-in-multi-module-projects)。

> 有关多模块项目示例，请参阅 [Dokka GitHub 仓库](https://github.com/Kotlin/dokka/tree/master/examples/gradle-v2/multimodule-example)。
>
{style="tip"}

#### 不包含约定插件的多模块项目 {id="multi-module-projects-without-convention-plugins"}

如果您的项目没有使用约定插件，仍可以通过直接配置每个子项目来共享 Dokka 配置。
这需要在每个子项目的 `build.gradle.kts` 文件中手动设置共享配置。虽然这种方法集中度较低，
但避免了像约定插件那样需要额外的设置。

反之，如果您的项目使用约定插件，您也可以通过在 `buildSrc` 目录中创建约定插件，然后将该插件应用到各个子项目中，来在多模块项目中共享 Dokka 配置。

##### 设置 buildSrc 目录 {id="set-up-the-buildsrc-directory"}

1. 在项目根目录下，创建一个包含两个文件的 `buildSrc` 目录：

   * `settings.gradle.kts`
   * `build.gradle.kts`

2. 在 `buildSrc/settings.gradle.kts` 文件中添加以下代码段：

   ```kotlin
   rootProject.name = "buildSrc"
   ```

3. 在 `buildSrc/build.gradle.kts` 文件中添加以下代码段：

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

##### 设置 Dokka 约定插件 {id="set-up-the-dokka-convention-plugin"}

设置好 `buildSrc` 目录后：

1. 创建 `buildSrc/src/main/kotlin/dokka-convention.gradle.kts` 文件来承载[约定插件](https://docs.gradle.org/current/userguide/custom_plugins.html#sec:convention_plugins)。
2. 在 `dokka-convention.gradle.kts` 文件中添加以下代码段：

    ```kotlin
    plugins {
        id("org.jetbrains.dokka") 
    }

    dokka {
        // 在此处添加共享配置
    }
    ```

   您需要在 `dokka {}` 块中添加所有子项目通用的共享 Dokka [配置](#adjust-configuration-options)。
   此外，无需指定 Dokka 版本。版本已经在 `buildSrc/build.gradle.kts` 文件中指定。

##### 将约定插件应用到子项目 {id="apply-the-convention-plugin-to-your-subprojects"}

通过在每个子项目的 `build.gradle.kts` 文件中添加 Dokka 约定插件，将其应用到各个子项目中：

```kotlin
plugins {
    id("dokka-convention")
}
```

#### 包含约定插件的多模块项目 {id="multi-module-projects-with-convention-plugins"}

如果您已经使用了约定插件，请参考 [Gradle 文档](https://docs.gradle.org/current/userguide/custom_plugins.html#sec:convention_plugins)创建专门的 Dokka 约定插件。

然后，按照上述步骤[设置 Dokka 约定插件](#set-up-the-dokka-convention-plugin)并[将其应用到各个子项目](#apply-the-convention-plugin-to-your-subprojects)。

### 更新多模块项目中的文档聚合 {id="update-documentation-aggregation-in-multi-module-projects"}

Dokka 可以将来自多个子项目的文档聚合为单一输出或发布物。

正如[前面所述](#apply-the-convention-plugin-to-your-subprojects)，在聚合文档之前，请将 Dokka 插件应用到所有需要记录文档的子项目中。

DGP v2 中的聚合使用 `dependencies {}` 块代替了任务，并且可以在任何 `build.gradle.kts` 文件中添加。

在 DGP v1 中，聚合是在根项目中隐式创建的。若要在 DGP v2 中重现此行为，请在根项目的 `build.gradle.kts` 文件中添加 `dependencies {}` 块。

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

### 更改聚合文档的目录 {id="change-directory-of-aggregated-documentation"}

当 DGP 聚合子项目时，每个子项目在聚合文档中都会有自己的子目录。

在 DGP v2 中，聚合机制进行了更新，以更好地符合 Gradle 约定。
DGP v2 现在会保留完整的子项目目录，以防止在任何位置聚合文档时发生冲突。

DGP v1 中的聚合目录：

在 DGP v1 中，聚合文档被放置在折叠的目录结构中。
例如，假设某个项目在 `:turbo-lib` 中进行了聚合，并包含一个嵌套子项目 `:turbo-lib:maths`，
生成的文档位于：

```text
turbo-lib/build/dokka/html/maths/
```

DGP v2 中的聚合目录：

DGP v2 通过保留完整的项目结构来确保每个子项目都有唯一的目录。相同的聚合文档现在遵循以下结构：

```text
turbo-lib/build/dokka/html/turbo-lib/maths/
```

这一变更可以防止同名的子项目发生冲突。但是，由于目录结构发生了变化，外部链接可能会失效，从而可能导致 `404` 错误。

#### 恢复到 DGP v1 的目录行为 {id="revert-to-the-dgp-v1-directory-behavior"}

如果您的项目依赖于 DGP v1 中使用的目录结构，可以通过手动指定子项目目录来恢复此行为。
在每个子项目的 `build.gradle.kts` 文件中添加以下配置：

```kotlin
// /turbo-lib/maths/build.gradle.kts

plugins {
    id("org.jetbrains.dokka")
}

dokka {
    // 覆盖子项目目录以匹配 V1 结构
    modulePath.set("maths")
}
```

### 使用更新后的任务生成文档 {id="generate-documentation-with-the-updated-task"}

DGP v2 重命名了用于生成 API 文档的 Gradle 任务。

DGP v1 中的任务：

```text
./gradlew dokkaHtml

// 或者

./gradlew dokkaHtmlMultiModule
```

DGP v2 中的任务：

```text
./gradlew :dokkaGenerate
```

`dokkaGenerate` 任务会在 `build/dokka/` 目录下生成 API 文档。

在 DGP v2 版本中，`dokkaGenerate` 任务名称同时适用于单模块和多模块项目。您可以使用不同的任务来生成 HTML、Javadoc 或同时生成 HTML 和 Javadoc 格式的输出。有关更多信息，请参阅[选择文档输出格式](#select-documentation-output-format)。

### 选择文档输出格式 {id="select-documentation-output-format"}

> Javadoc 输出格式目前处于 [Alpha](https://kotlinlang.org/docs/components-stability.html#stability-levels-explained) 阶段。
> 在使用过程中可能会遇到错误和迁移问题。无法保证能够与接收 Javadoc 作为输入的工具顺利集成。请自行承担使用风险。
>
{style="warning"}

DGP v2 的默认输出格式为 HTML。不过，您可以选择以 HTML、Javadoc 或同时以这两种格式生成 API 文档：

1. 在项目 `build.gradle.kts` 文件的 `plugins {}` 块中添加对应的插件 `id`：

   ```kotlin
   plugins {
       // 生成 HTML 文档
       id("org.jetbrains.dokka") version "%dokkaVersion%"

       // 生成 Javadoc 文档
       id("org.jetbrains.dokka-javadoc") version "%dokkaVersion%"

       // 同时保留两个插件 ID 将生成两种格式
   }
   ```

2. 运行相应的 Gradle 任务。

以下是各格式对应的插件 `id` 和 Gradle 任务列表：

|             | **HTML**                       | **Javadoc**                         | **两者兼有**                          |
|-------------|--------------------------------|-------------------------------------|-----------------------------------|
| 插件 `id` | `id("org.jetbrains.dokka")`    | `id("org.jetbrains.dokka-javadoc")` | 同时使用 HTML 和 Javadoc 插件 |
| Gradle 任务 | `./gradlew :dokkaGeneratePublicationHtml` | `./gradlew :dokkaGeneratePublicationJavadoc`   | `./gradlew :dokkaGenerate`        |

> `dokkaGenerate` 任务会根据所应用的插件生成所有可用格式的文档。
> 如果同时应用了 HTML 和 Javadoc 插件，您可以选择仅通过运行 `dokkaGeneratePublicationHtml` 任务生成 HTML，
> 或者仅通过运行 `dokkaGeneratePublicationJavadoc` 任务生成 Javadoc。
> 
{style="tip"}

如果您正在使用 IntelliJ IDEA，可能会看到 `dokkaGenerateHtml` 这个 Gradle 任务。
该任务只是 `dokkaGeneratePublicationHtml` 的别名。两个任务执行的操作完全相同。

### 处理弃用和移除项 {id="address-deprecations-and-removals"}

* **输出格式支持：** DGP v2 仅支持 HTML 和 Javadoc 输出。实验性格式（如 Markdown 和 Jekyll）已不再支持。
* **收集器任务 (Collector task)：** `DokkaCollectorTask` 已被移除。现在，需要单独为每个子项目生成文档，并在必要时进行[文档聚合](#update-documentation-aggregation-in-multi-module-projects)。

## 完成迁移 {id="finalize-your-migration"}

完成项目迁移后，请执行以下步骤进行收尾并提升性能。

### 设置选择加入标志 (Opt-in flag) {id="set-the-opt-in-flag"}

迁移成功后，在项目的 `gradle.properties` 文件中设置以下不含帮助程序的分步启用标志：

```text
org.jetbrains.dokka.experimental.gradle.pluginMode=V2Enabled
```

如果您已移除了对 DGP v2 中不再可用的 DGP v1 Gradle 任务的引用，
则不应再看到与之相关的编译错误。

### 启用构建缓存和配置缓存 {id="enable-build-cache-and-configuration-cache"}

DGP v2 现已支持 Gradle 构建缓存和配置缓存，从而提升构建性能。

* 若要启用构建缓存，请按照 [Gradle 构建缓存文档](https://docs.gradle.org/current/userguide/build_cache.html#sec:build_cache_enable)中的说明进行操作。
* 若要启用配置缓存，请按照 [Gradle 配置缓存文档](https://docs.gradle.org/current/userguide/configuration_cache.html#config_cache:usage:enable)中的说明进行操作。

## 后续步骤 {id="what-s-next"}

* [探索更多 DGP v2 项目示例](https://github.com/Kotlin/dokka/tree/master/examples/gradle-v2)。
* [Dokka 入门指南](dokka-get-started.md)。
* [详细了解 Dokka 插件](dokka-plugins.md)。