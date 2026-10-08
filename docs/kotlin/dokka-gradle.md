[//]: # (title: Gradle)

> 本指南适用于 Dokka Gradle 插件 (DGP) v2 模式。之前的 DGP v1 模式已不再受支持。
> 如果您正从 v1 模式升级到 v2 模式，请参阅 [迁移指南](dokka-migration.md)。
>
{style="note"}

要为基于 Gradle 的项目生成文档，您可以使用 [Dokka Gradle 插件](https://plugins.gradle.org/plugin/org.jetbrains.dokka)。

Dokka Gradle 插件 (DGP) 为您的项目提供基本的自动配置，包含用于 [生成文档](#generate-documentation) 的 [Gradle 任务](#generate-documentation)，并提供 [配置选项](dokka-gradle-configuration-options.md) 来自定义输出。

您可以在我们的 [Gradle 示例项目](https://github.com/Kotlin/dokka/tree/2.0.0/examples/gradle-v2) 中尝试使用 Dokka 并探索如何为各种项目进行配置。

## 支持的版本 {id="supported-versions"}

确保您的项目符合最低版本要求：

| **工具**                                                                          | **版本**        |
|-----------------------------------------------------------------------------------|---------------|
| [Gradle](https://docs.gradle.org/current/userguide/upgrading_version_8.html)      | 7.6 或更高版本     |
| [Android Gradle 插件](https://developer.android.com/build/agp-upgrade-assistant) | 7.0 或更高版本     |
| [Kotlin Gradle 插件](https://kotlinlang.org/docs/gradle-configure-project.html) | 1.9 或更高版本     |

## 应用 Dokka {id="apply-dokka"}

推荐应用 Dokka Gradle 插件的方式是使用 [plugins 块](https://docs.gradle.org/current/userguide/plugins.html#sec:plugins_block)。将其添加到项目 `build.gradle.kts` 文件的 `plugins {}` 块中：

<tabs group="build-script">
<tab title="Gradle Kotlin DSL" group-key="kotlin">

```kotlin
plugins {
    id("org.jetbrains.dokka") version "%dokkaVersion%"
}
```

</tab>
<tab title="Gradle Groovy DSL" group-key="groovy">

```groovy
plugins {
    id 'org.jetbrains.dokka' version '%dokkaVersion%'
}
```

</tab>
</tabs>

在为多项目构建编写文档时，您需要将该插件显式应用到每个想要生成文档的子项目。您可以直接在每个子项目中配置 Dokka，也可以使用约定插件在子项目之间共享 Dokka 配置。有关更多信息，请参阅如何配置 [单项目](#single-project-configuration) 和 [多项目](#multi-project-configuration) 构建。

> * 在底层，Dokka 使用 [Kotlin Gradle 插件](https://kotlinlang.org/docs/gradle-configure-project.html#apply-the-plugin) 来自动配置为其生成文档的 [源集](https://kotlinlang.org/docs/multiplatform-discover-project.html#source-sets)。请确保应用了 Kotlin Gradle 插件或手动 [配置源集](dokka-gradle-configuration-options.md#source-set-configuration)。
>
> * 如果您在 [预编译脚本插件](https://docs.gradle.org/current/userguide/custom_plugins.html#sec:precompiled_plugins) 中使用 Dokka，请将 [Kotlin Gradle 插件](https://kotlinlang.org/docs/gradle-configure-project.html#apply-the-plugin) 添加为依赖项以确保其正常工作。
>
{style="tip"}

## 启用构建缓存和配置缓存 {id="enable-build-cache-and-configuration-cache"}

DGP 支持 Gradle 构建缓存和配置缓存，可提高构建性能。

* 要启用构建缓存，请按照 [Gradle 构建缓存文档](https://docs.gradle.org/current/userguide/build_cache.html#sec:build_cache_enable) 中的说明进行操作。
* 要启用配置缓存，请按照 [Gradle 配置缓存文档](https://docs.gradle.org/current/userguide/configuration_cache.html#config_cache:usage:enable) 中的说明进行操作。

## 生成文档 {id="generate-documentation"}

Dokka Gradle 插件内置了 [HTML](dokka-html.md) 和 [Javadoc](dokka-javadoc.md) 输出格式。

使用以下 Gradle 任务生成文档：

```shell
./gradlew :dokkaGenerate
```

`dokkaGenerate` Gradle 任务的关键行为是：

* 此任务为 [单项目](#single-project-configuration) 和 [多项目](#multi-project-configuration) 构建生成文档。
* 默认情况下，文档输出格式为 HTML。您还可以通过 [添加相应的插件](#configure-documentation-output-format) 来生成 Javadoc 格式，或者同时生成 HTML 和 Javadoc 格式。
* 对于单项目和多项目构建，生成的文档都会自动放置在 `build/dokka/html` 目录中。您可以 [更改位置 (`outputDirectory`)](dokka-gradle-configuration-options.md#general-configuration)。

### 配置文档输出格式 {id="configure-documentation-output-format"}

> Javadoc 输出格式处于 [Alpha](https://kotlinlang.org/docs/components-stability.html#stability-levels-explained) 阶段。在使用时，您可能会遇到错误和迁移问题。不保证能够成功集成到接受 Javadoc 作为输入的工具中。风险自担。
>
{style="warning"}

您可以选择以 HTML、Javadoc 或同时以这两种格式生成 API 文档：

1. 将相应的插件 `id` 放入项目 `build.gradle.kts` 文件的 `plugins {}` 块中：

   ```kotlin
   plugins {
       // 生成 HTML 文档
       id("org.jetbrains.dokka") version "%dokkaVersion%"

       // 生成 Javadoc 文档
       id("org.jetbrains.dokka-javadoc") version "%dokkaVersion%"

       // 同时保留两个插件 ID 会生成两种格式
   }
   ```

2. 运行相应的 Gradle 任务。

   以下是每种格式对应的插件 `id` 和 Gradle 任务列表：

   |             | **HTML**                                  | **Javadoc**                                  | **两者**                          |
   |-------------|-------------------------------------------|----------------------------------------------|-----------------------------------|
   | 插件 `id` | `id("org.jetbrains.dokka")`               | `id("org.jetbrains.dokka-javadoc")`          | 同时使用 HTML 和 Javadoc 插件 |
   | Gradle 任务 | `./gradlew :dokkaGeneratePublicationHtml` | `./gradlew :dokkaGeneratePublicationJavadoc` | `./gradlew :dokkaGenerate`        |

    > * `dokkaGenerate` 任务会根据应用的插件生成所有可用格式的文档。如果同时应用了 HTML 和 Javadoc 插件，您可以选择仅通过运行 `dokkaGeneratePublicationHtml` 任务生成 HTML，或仅通过运行 `dokkaGeneratePublicationJavadoc` 任务生成 Javadoc。
    > 
    {style="tip"}

如果您使用的是 IntelliJ IDEA，您可能会看到 `dokkaGenerateHtml` Gradle 任务。此任务只是 `dokkaGeneratePublicationHtml` 的别名。两个任务执行的操作完全相同。

### 在多项目构建中聚合文档输出 {id="aggregate-documentation-output-in-multi-project-builds"}

Dokka 可以将来自多个子项目的文档聚合到一个输出或发布中。

在聚合文档之前，您必须将 Dokka 插件 [应用](#apply-the-convention-plugin-to-your-subprojects) 到所有可生成文档的子项目。

要聚合来自多个子项目的文档，请在根项目的 `build.gradle.kts` 文件中添加 `dependencies {}` 块：

```kotlin
dependencies {
    dokka(project(":childProjectA:"))
    dokka(project(":childProjectB:"))
}
```

给定具有以下结构的项目：

```text
.
└── parentProject/
    ├── childProjectA/
    │   └── demo/
    │       └── ChildProjectAClass.kt
    └── childProjectB/
        └── demo/
            └── ChildProjectBClass.kt
```

生成的文档按如下方式聚合：

![dokkaHtmlMultiModule 任务输出的屏幕截图](dokkaHtmlMultiModule-example.png){width=600}

有关更多详细信息，请参阅我们的 [多项目示例](https://github.com/Kotlin/dokka/tree/2.0.0/examples/gradle-v2/multimodule-example)。

#### 聚合文档的目录 {id="directory-of-aggregated-documentation"}

当 DGP 聚合子项目时，每个子项目在聚合文档中都有自己的子目录。DGP 通过保留完整的项目结构来确保每个子项目都有一个唯一的目录。

例如，给定一个在 `:turbo-lib` 中进行聚合且包含嵌套子项目 `:turbo-lib:maths` 的项目，生成的文档将放置在：

```text
turbo-lib/build/dokka/html/turbo-lib/maths/
```

您可以通过手动指定子项目目录来还原此行为。将以下配置添加到每个子项目的 `build.gradle.kts` 文件中：

```kotlin
// /turbo-lib/maths/build.gradle.kts

plugins {
    id("org.jetbrains.dokka")
}

dokka {
    // 覆盖子项目目录
    modulePath.set("maths")
}
```

此配置将 `:turbo-lib:maths` 模块生成的文档更改为生成到 `turbo-lib/build/dokka/html/maths/` 中。

## 构建 javadoc.jar {id="build-javadoc-jar"}

如果您想将库发布到仓库，您可能需要提供一个包含库 API 参考文档的 `javadoc.jar` 文件。

例如，如果您想发布到 [Maven Central](https://central.sonatype.org/)，您 [必须](https://central.sonatype.org/publish/requirements/) 在项目旁边提供一个 `javadoc.jar`。但是，并非所有仓库都有该规则。

Dokka Gradle 插件没有提供任何开箱即用的方法来实现这一点，但可以通过自定义 Gradle 任务来实现。一个用于生成 [HTML](dokka-html.md) 格式的文档，另一个用于生成 [Javadoc](dokka-javadoc.md) 格式：

<tabs group="build-script">
<tab title="Gradle Kotlin DSL" group-key="kotlin">

```kotlin
// 生成 HTML 格式的文档
val dokkaHtmlJar by tasks.registering(Jar::class) {
    description = "A HTML Documentation JAR containing Dokka HTML"
    from(tasks.dokkaGeneratePublicationHtml.flatMap { it.outputDirectory })
    archiveClassifier.set("html-doc")
}

// 生成 Javadoc 格式的文档
val dokkaJavadocJar by tasks.registering(Jar::class) {
    description = "A Javadoc JAR containing Dokka Javadoc"
    from(tasks.dokkaGeneratePublicationJavadoc.flatMap { it.outputDirectory })
    archiveClassifier.set("javadoc")
}
```

</tab>
<tab title="Gradle Groovy DSL" group-key="groovy">

```groovy
// 生成 HTML 格式的文档
tasks.register('dokkaHtmlJar', Jar) {
    description = 'A HTML Documentation JAR containing Dokka HTML'
    from(tasks.named('dokkaGeneratePublicationHtml').flatMap { it.outputDirectory })
    archiveClassifier.set('html-doc')
}

// 生成 Javadoc 格式的文档
tasks.register('dokkaJavadocJar', Jar) {
    description = 'A Javadoc JAR containing Dokka Javadoc'
    from(tasks.named('dokkaGeneratePublicationJavadoc').flatMap { it.outputDirectory })
    archiveClassifier.set('javadoc')
}
```

</tab>
</tabs>

> 如果您将库发布到 Maven Central，您可以使用 [javadoc.io](https://javadoc.io/) 等服务免费且无需任何设置地托管您的库 API 文档。它直接从 `javadoc.jar` 中获取文档页面。如 [此示例](https://javadoc.io/doc/com.trib3/server/latest/index.html) 所示，它与 HTML 格式配合良好。
>
{style="tip"}

## 配置示例 {id="configuration-examples"}

根据您拥有的项目类型，应用和配置 Dokka 的方式略有不同。但是，无论项目类型如何，[配置选项](dokka-gradle-configuration-options.md) 本身都是相同的。

对于在项目根目录中只有一个 `build.gradle.kts` 或 `build.gradle` 文件的简单扁平化项目，请参阅 [单项目配置](#single-project-configuration)。

对于具有子项目和多个嵌套 `build.gradle.kts` 或 `build.gradle` 文件的更复杂构建，请参阅 [多项目配置](#multi-project-configuration)。

### 单项目配置 {id="single-project-configuration"}

单项目构建通常在项目根目录中只有一个 `build.gradle.kts` 或 `build.gradle` 文件。它们可以是单平台或多平台的，通常具有以下结构：

<tabs group="build-script">
<tab title="Kotlin" group-key="kotlin">

单平台：

```text
.
├── build.gradle.kts
└── src/
    └── main/
        └── kotlin/
            └── HelloWorld.kt
```

多平台：

```text
.
├── build.gradle.kts
└── src/
    ├── commonMain/
    │   └── kotlin/
    │       └── Common.kt
    ├── jvmMain/
    │   └── kotlin/
    │       └── JvmUtils.kt
    └── nativeMain/
        └── kotlin/
            └── NativeUtils.kt
```

</tab>
<tab title="Groovy" group-key="groovy">

单平台：

```text
.
├── build.gradle
└── src/
    └── main/
        └── kotlin/
            └── HelloWorld.kt
```

多平台：

```text
.
├── build.gradle
└── src/
    ├── commonMain/
    │   └── kotlin/
    │       └── Common.kt
    ├── jvmMain/
    │   └── kotlin/
    │       └── JvmUtils.kt
    └── nativeMain/
        └── kotlin/
            └── NativeUtils.kt
```

</tab>
</tabs>

在根 `build.gradle.kts` 文件中应用 Dokka Gradle 插件，并使用顶级 `dokka {}` DSL 对其进行配置：

<tabs group="build-script">
<tab title="Gradle Kotlin DSL" group-key="kotlin">

```kotlin
plugins {
    id("org.jetbrains.dokka") version "%dokkaVersion%"
}

dokka {
    dokkaPublications.html {
        moduleName.set("MyProject")
        outputDirectory.set(layout.buildDirectory.dir("documentation/html"))
        includes.from("README.md")
   }

    dokkaSourceSets.main {
        sourceLink {
            localDirectory.set(file("src/main/kotlin"))
            remoteUrl.set(URI("https://github.com/your-repo"))
            remoteLineSuffix.set("#L")
        }
    }
}
```

</tab>
<tab title="Gradle Groovy DSL" group-key="groovy">

在 `./build.gradle` 内部：

```groovy
plugins {
    id 'org.jetbrains.dokka' version '%dokkaVersion%'
}

dokka {
    dokkaPublications {
        html {
            moduleName.set("MyProject")
            outputDirectory.set(layout.buildDirectory.dir("documentation/html"))
            includes.from("README.md")
        }
    }

    dokkaSourceSets {
        named("main") {
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

此配置将 Dokka 应用于您的项目，设置文档输出目录，并定义主源集。您可以通过在同一个 `dokka {}` 块中添加自定义资源、可见性过滤器或插件配置来进一步扩展它。有关更多信息，请参阅 [配置选项](dokka-gradle-configuration-options.md)。

### 多项目配置 {id="multi-project-configuration"}

[多项目构建](https://docs.gradle.org/current/userguide/multi_project_builds.html) 通常包含几个嵌套的 `build.gradle.kts` 文件，其结构类似于以下形式：

<tabs group="build-script">
<tab title="Kotlin" group-key="kotlin">

```text
.
├── build.gradle.kts
├── settings.gradle.kts
├── subproject-A/
│   ├── build.gradle.kts
│   └── src/
│       └── main/
│           └── kotlin/
│               └── HelloFromA.kt
└── subproject-B/
    ├── build.gradle.kts
    └── src/
        └── main/
            └── kotlin/
                └── HelloFromB.kt
```

</tab>
<tab title="Groovy" group-key="groovy">

```text
.
├── build.gradle
├── settings.gradle
├── subproject-A/
│   ├── build.gradle
│   └── src/
│       └── main/
│           └── kotlin/
│               └── HelloFromA.kt
└── subproject-B/
    ├── build.gradle
    └── src/
        └── main/
            └── kotlin/
                └── HelloFromB.kt
```

</tab>
</tabs>

单项目和多项目文档共享相同的 [使用顶级 `dokka {}` DSL 的配置模型](#single-project-configuration)。

在多项目构建中配置 Dokka 有两种方式：

* **[通过约定插件共享配置](#shared-configuration-via-a-convention-plugin) (首选)**：定义一个约定插件并将其应用到所有子项目。这会集中您的 Dokka 设置。

* **[手动配置](#manual-configuration)**：应用 Dokka 插件并在每个子项目中重复相同的 `dokka {}` 块。您不需要约定插件。

配置完子项目后，您可以将来自多个子项目的文档聚合到一个输出中。有关更多信息，请参阅 [在多项目构建中聚合文档输出](#aggregate-documentation-output-in-multi-project-builds)。

> 有关多项目示例，请参阅 [Dokka GitHub 仓库](https://github.com/Kotlin/dokka/tree/master/examples/gradle-v2/multimodule-example)。
>
{style="tip"}

#### 通过约定插件共享配置 {id="shared-configuration-via-a-convention-plugin"}

按照以下步骤设置约定插件并将其应用到您的子项目。

##### 设置 buildSrc 目录 {id="set-up-the-buildsrc-directory"}

1. 在项目根目录中，创建一个包含两个文件的 `buildSrc` 目录：

    * `settings.gradle.kts`
    * `build.gradle.kts`

2. 在 `buildSrc/settings.gradle.kts` 文件中，添加以下代码段：

   ```kotlin
   rootProject.name = "buildSrc"
   ```

3. 在 `buildSrc/build.gradle.kts` 文件中，添加以下代码段：

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

设置好 `buildSrc` 目录后，设置 Dokka 约定插件：

1. 创建一个 `buildSrc/src/main/kotlin/dokka-convention.gradle.kts` 文件来托管 [约定插件](https://docs.gradle.org/current/userguide/custom_plugins.html#sec:convention_plugins)。
2. 在 `dokka-convention.gradle.kts` 文件中，添加以下代码段：

    ```kotlin
    plugins {
        id("org.jetbrains.dokka") 
    }

    dokka {
        // 共享配置放在这里
    }
    ```

   您需要在 `dokka {}` 块中添加所有子项目共有的共享 Dokka [配置](dokka-gradle-configuration-options.md)。此外，您无需指定 Dokka 版本。版本已在 `buildSrc/build.gradle.kts` 文件中设置。

##### 将约定插件应用到您的子项目 {id="apply-the-convention-plugin-to-your-subprojects"}

通过将 Dokka 约定插件添加到每个子项目的 `build.gradle.kts` 文件中，将其应用到您的子项目：

```kotlin
plugins {
    id("dokka-convention")
}
```

#### 手动配置 {id="manual-configuration"}

如果您的项目不使用约定插件，您可以通过手动将相同的 `dokka {}` 块复制到每个子项目中来重复使用相同的 Dokka 配置模式：

1. 在每个子项目的 `build.gradle.kts` 文件中应用 Dokka 插件：

   ```kotlin
   plugins {
       id("org.jetbrains.dokka") version "%dokkaVersion%"
   }
   ```

2. 在每个子项目的 `dokka {}` 块中声明共享配置。由于没有集中配置的约定插件，您需要在各个子项目中重复所需的任何配置。有关更多信息，请参阅 [配置选项](dokka-gradle-configuration-options.md)。

#### 父项目配置 {id="parent-project-configuration"}

在多项目构建中，您可以在根项目中配置适用于整个文档的设置。这可以包括定义输出格式、输出目录、文档子项目名称、从所有子项目聚合文档以及其他 [配置选项](dokka-gradle-configuration-options.md)：

```kotlin
plugins {
    id("org.jetbrains.dokka") version "%dokkaVersion%"
}

dokka {
    // 为整个项目设置属性
    dokkaPublications.html {
        moduleName.set("My Project")
        outputDirectory.set(layout.buildDirectory.dir("docs/html"))
        includes.from("README.md")
    }

    dokkaSourceSets.configureEach {
        documentedVisibilities.set(setOf(VisibilityModifier.Public)) // 或者 documentedVisibilities(VisibilityModifier.Public)    
    }
}

// 聚合子项目文档
dependencies {
    dokka(project(":childProjectA"))
    dokka(project(":childProjectB"))
}
```

此外，如果每个子项目需要自定义配置，它们可以拥有自己的 `dokka {}` 块。在以下示例中，子项目应用了 Dokka 插件，设置了自定义子项目名称，并包含了来自其 `README.md` 文件的附加文档：

```kotlin
// subproject/build.gradle.kts
plugins {
    id("org.jetbrains.dokka")
}

dokka {
    dokkaPublications.html {
        moduleName.set("Child Project A")
        includes.from("README.md")
    }
}
```
