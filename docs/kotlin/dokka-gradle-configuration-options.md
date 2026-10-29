[//]: # (title: Dokka Gradle 配置选项)

Dokka 提供了许多配置选项，用于自定义您和读者的体验。

以下是每个配置部分的详细说明和一些示例。您还可以找到应用了[所有配置选项](#complete-configuration)的示例。

有关为单项目和多项目构建应用配置块的更多详细信息，请参阅 [配置示例](dokka-gradle.md#configuration-examples)。

### 通用配置 {id="general-configuration"}

以下是一个通用的 Dokka Gradle 插件配置示例：

* 使用顶层的 `dokka {}` DSL 配置。
* 在 DGP 中，您在 `dokkaPublications{}` 块中声明 Dokka 发布配置。
* 默认发布格式为 [`html`](dokka-html.md) 和 [`javadoc`](dokka-javadoc.md)。

* `build.gradle.kts` 文件的语法与常规 `.kt` 文件（例如用于 Kotlin 自定义插件的文件）不同，因为 Gradle 的 Kotlin DSL 使用了类型安全访问器。

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
        // HTML 文档的标准输出目录
        outputDirectory.set(layout.buildDirectory.dir("dokka/html"))
        failOnWarning.set(false)
        suppressInheritedMembers.set(false)
        suppressObviousFunctions.set(true)
        offlineMode.set(false)
        includes.from("packages.md", "extra.md")
        
        // 附加文件的输出目录
        // 当您想要更改输出目录并包含额外文件时，请使用此块而不是标准块
        outputDirectory.set(rootDir.resolve("docs/api/0.x"))
        
        // 使用 fileTree 添加多个文件
        includes.from(
            fileTree("docs") {
                include("**/*.md")
            }
        )
    }
}
```

有关处理文件的更多信息，请参阅 [Gradle 文档](https://docs.gradle.org/current/userguide/working_with_files.html#sec:file_trees)。

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
                // HTML 文档的标准输出目录
                publication.outputDirectory.set(project.layout.buildDirectory.dir("dokka/html"))
                publication.failOnWarning.set(true)
                publication.suppressInheritedMembers.set(true)
                publication.offlineMode.set(false)
                publication.suppressObviousFunctions.set(true)
                publication.includes.from("packages.md", "extra.md")

                // 附加文件的输出目录
                // 当您想要更改输出目录并包含额外文件时，请使用此块而不是标准块
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
            // 设置通用模块信息
            moduleName.set(project.name)
            moduleVersion.set(project.version.toString())

            // HTML 文档的标准输出目录
            outputDirectory.set(layout.buildDirectory.dir("dokka/html"))

            // 核心 Dokka 选项
            failOnWarning.set(false)
            suppressInheritedMembers.set(false)
            suppressObviousFunctions.set(true)
            offlineMode.set(false)
            includes.from(files("packages.md", "extra.md"))

            // 附加文件的输出目录
            // 当您想要更改输出目录并包含额外文件时，请使用此块而不是标准块
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
           项目文档的显示名称。它出现在目录、导航、页眉和日志消息中。在多项目构建中，每个子项目的 <code>moduleName</code> 将用作聚合文档中其对应部分的标题。
        </p>
        <p>默认值：Gradle 项目名称</p>
    </def>
    <def title="moduleVersion">
        <p>
            在生成的文档中显示的子项目版本。
            在单项目构建中，它被用作项目版本。
            在多项目构建中，在聚合文档时会使用每个子项目的 <code>moduleVersion</code>。
        </p>
        <p>默认值：Gradle 项目版本</p>
    </def>
    <def title="outputDirectory">
        <p>生成的文档存储的目录。</p>
        <p>此设置适用于 <code>dokkaGenerate</code> 任务生成的所有文档格式（HTML、Javadoc 等）。</p>
        <p>默认值：<code>build/dokka/html</code></p>
        <p><b>附加文件的输出目录</b></p>
        <p>您可以为单项目和多项目构建指定输出目录并包含附加文件。
           对于多项目构建，请在根项目的配置中设置输出目录并包含附加文件。
        </p>
    </def>
    <def title="failOnWarning">
        <p>
            确定在文档生成期间出现警告时，Dokka 是否应使构建失败。
            该过程会等待所有错误和警告都发出后才停止。
        </p>
        <p>此设置与 <code>reportUndocumented</code> 配合使用效果良好。</p>
        <p>默认值：<code>false</code></p>
    </def>
    <def title="suppressInheritedMembers">
        <p>是否隐藏在给定类中未显式重写的继承成员。</p>
        <p>
            注意：
            这将隐藏诸如 <code>equals</code>、<code>hashCode</code> 和 <code>toString</code> 之类的函数，
            但不会隐藏合成函数，如 <code>dataClass.componentN</code> 和 
            <code>dataClass.copy</code>。请使用 <code>suppressObviousFunctions</code>
            来处理后者。
        </p>
        <p>默认值：<code>false</code></p>
    </def>
    <def title="suppressObviousFunctions">
        <p>是否隐藏显而易见的函数。</p>
        <p>
            如果一个函数满足以下条件，则被认为是显而易见的：</p>
            <list>
                <li>
                    继承自 <code>kotlin.Any</code>、<code>Kotlin.Enum</code>、<code>java.lang.Object</code> 或
                    <code>java.lang.Enum</code>，例如 <code>equals</code>、<code>hashCode</code>、<code>toString</code>。
                </li>
                <li>
                    由编译器合成（生成）且没有任何文档，例如
                    <code>dataClass.componentN</code> 或 <code>dataClass.copy</code>。
                </li>
            </list>
        <p>默认值：<code>true</code></p>
    </def>
    <def title="offlineMode">
        <p>是否通过网络解析远程文件和链接。</p>
        <p>
            这包括用于生成外部文档链接的 package-list。例如，这可以让您的文档中指向标准库的类变为可点击状态。
        </p>
        <p>
            在某些情况下，将此项设置为 <code>true</code> 可以显著加快构建时间，
            但也可能会降低用户体验。例如，
            无法解析来自依赖项（包括标准库）的类和成员链接。
        </p>
        <p>注意：您可以将获取的文件缓存到本地，并作为本地路径提供给 Dokka。请参阅 
           <code><a href="#external-documentation-links-configuration">externalDocumentationLinks</a></code> 部分。</p>
        <p>默认值：<code>false</code></p>
    </def>
     <def title="includes">
        <p>
            包含 <a href="dokka-module-and-package-docs.md">子项目和软件包文档</a> 的 Markdown 文件列表。Markdown 文件必须
            符合 <a href="dokka-module-and-package-docs.md#file-format">要求的格式</a>。
        </p>
        <p>指定文件的内容将被解析并作为子项目和软件包描述嵌入到文档中。</p>
        <p>
            有关外观及使用方式的示例，请参阅 <a href="https://github.com/Kotlin/dokka/blob/master/examples/gradle-v2/basic-gradle-example/build.gradle.kts">Dokka Gradle 示例</a>。
        </p>
    </def>
</deflist>

### 源集配置 {id="source-set-configuration"}

Dokka 允许为 [Kotlin 源集](https://kotlinlang.org/docs/multiplatform-discover-project.html#source-sets) 配置一些选项：

<tabs group="build-script">
<tab title="Gradle Kotlin DSL" group-key="kotlin">

```kotlin
import org.jetbrains.dokka.gradle.engine.parameters.VisibilityModifier

dokka {
    // ..
    // 通用配置部分
    // ..

    // 源集配置
    dokkaSourceSets {
        // 示例：仅针对 'linux' 源集的配置
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
                // 源链接部分
            }
            perPackageOption {
                // 软件包选项部分
            }
            externalDocumentationLinks {
                // 外部文档链接部分
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
    // 通用配置部分
    // ..

    dokkaSourceSets {
        // 示例：仅针对 'linux' 源集的配置
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
                // 源链接部分
            }
            perPackageOption {
                // 软件包选项部分
            }
            externalDocumentationLinks {
                // 外部文档链接部分
            }
        }
    }
}
```

</tab>
</tabs>

<deflist collapsible="true">
    <def title="suppress">
        <p>生成文档时是否应跳过此源集。</p>
        <p>默认值：<code>false</code></p>
    </def>
    <def title="displayName">
        <p>用于引用此源集的显示名称。</p>
        <p>
            该名称既用于外部（例如，作为文档读者可见的源集名称），也用于内部（例如，用于 <code>reportUndocumented</code> 的日志消息）。
        </p>
        <p>默认情况下，该值是从 Kotlin Gradle 插件提供的信息中推断出来的。</p>
    </def>
    <def title="documentedVisibilities">
        <p>定义 Dokka 在生成的文档中应包含哪些可见性修饰符。</p>
        <p>
            如果您想要记录 <code>protected</code>、<code>internal</code> 和 <code>private</code> 声明，
            或者如果您想要排除 <code>public</code> 声明并仅记录内部 API，请使用此项。
        </p>
        <p>
            此外，您可以使用 Dokka 的 
            <a href="https://github.com/Kotlin/dokka/blob/v2.2.0/dokka-runners/dokka-gradle-plugin/src/main/kotlin/engine/parameters/HasConfigurableVisibilityModifiers.kt"><code>documentedVisibilities()</code> 函数</a> 
            来添加记录的可见性。
        </p>
        <p>可以为每个单独的软件包配置此项。</p>
        <p>默认值：<code>VisibilityModifier.Public</code></p>
    </def>
    <def title="reportUndocumented">
        <p>
            是否对可见的未记录声明（即经过 <code>documentedVisibilities</code> 和其他过滤器过滤后没有 KDoc 的声明）发出警告。
        </p>
        <p>此设置与 <code>failOnWarning</code> 配合使用效果良好。</p>
        <p>可以为每个单独的软件包配置此项。</p>
        <p>默认值：<code>false</code></p>
    </def>
    <def title="skipEmptyPackages">
        <p>
            在应用各种过滤器后，是否跳过不包含可见声明的软件包。
        </p>
        <p>
            例如，如果 <code>skipDeprecated</code> 设置为 <code>true</code> 且您的软件包仅包含已弃用的声明，则该软件包将被视为空。
        </p>
        <p>默认值：<code>true</code></p>
    </def>
    <def title="skipDeprecated">
        <p>是否记录带有 <code>@Deprecated</code> 注解的声明。</p>
        <p>可以为每个单独的软件包配置此项。</p>
        <p>默认值：<code>false</code></p>
    </def>
    <def title="suppressGeneratedFiles">
        <p>是否记录生成的文件。</p>
        <p>
            生成的文件预计位于 <code>{project}/{buildDir}/generated</code> 目录下。
        </p>
        <p>
            如果设置为 <code>true</code>，它会有效地将该目录中的所有文件添加到 
            <code>suppressedFiles</code> 选项中，以便您可以手动配置它。
        </p>
        <p>默认值：<code>true</code></p>
    </def>
    <def title="suppressAnnotatedWith">
        <p>用于隐藏带有所述注解的声明的注解完全限定名 (FQN) 集合。</p>
        <p>
            任何带有所列注解之一的声明都将从生成的文档中排除。
        </p>
    </def>
    <def title="jdkVersion">
        <p>为 Java 类型生成外部文档链接时要使用的 JDK 版本。</p>
        <p>
            例如，如果您在某些公共声明签名中使用 <code>java.util.UUID</code>，
            且此选项设置为 <code>8</code>，Dokka 会为其生成指向 <a href="https://docs.oracle.com/javase/8/docs/api/java/util/UUID.html">JDK 8 Javadoc</a> 的外部文档链接。
        </p>
        <p>默认值：`8`</p>
    </def>
    <def title="languageVersion">
        <p>
            用于设置分析和 <a href="https://kotlinlang.org/docs/kotlin-doc.html#sample-identifier">@sample</a>
            环境的 <a href="https://kotlinlang.org/docs/compatibility-modes.html">Kotlin 语言版本</a>。
        </p>
        <p>默认情况下，使用 Dokka 内置编译器可用的最新语言版本。</p>
    </def>
    <def title="apiVersion">
        <p>
            用于设置分析和 <a href="https://kotlinlang.org/docs/kotlin-doc.html#sample-identifier">@sample</a>
            环境的 <a href="https://kotlinlang.org/docs/compatibility-modes.html">Kotlin API 版本</a>。
        </p>
        <p>默认情况下，它是从 <code>languageVersion</code> 推断出来的。</p>
    </def>
    <def title="sourceRoots">
        <p>
            要分析和记录的源代码根目录。
            可接受的输入是目录以及单个 <code>.kt</code> 和 <code>.java</code> 文件。
        </p>
        <p>默认情况下，源根目录是从 Kotlin Gradle 插件提供的信息中推断出来的。</p>
    </def>
    <def title="classpath">
        <p>用于分析和交互式示例的类路径。</p>
        <p>如果某些来自依赖项的类型无法自动解析或识别，这会非常有用。</p>
        <p>此选项接受 <code>.jar</code> 和 <code>.klib</code> 文件。</p>
        <p>默认情况下，类路径是从 Kotlin Gradle 插件提供的信息中推断出来的。</p>
    </def>
    <def title="samples">
        <p>
            包含通过 <a href="https://kotlinlang.org/docs/kotlin-doc.html#sample-identifier">@sample</a> KDoc 标记引用的示例函数的目录或文件列表。
        </p>
    </def>
</deflist>

### 源链接配置 {id="source-link-configuration"}

配置源链接，以帮助读者在远程仓库中查找每个声明的源代码。请使用 `dokkaSourceSets.main {}` 块进行此配置。

`sourceLinks {}` 配置块允许您向每个签名添加一个 `source` 链接，该链接指向带有特定行号的 `remoteUrl`。
行号可以通过设置 `remoteLineSuffix` 来配置。

有关示例，请参阅 `kotlinx.coroutines` 中 [`count()`](https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines.flow/count.html) 函数的文档。

`build.gradle.kts` 文件的语法与常规 `.kt` 文件（例如用于自定义 Gradle 插件的文件）不同，因为 Gradle 的 Kotlin DSL 使用了类型安全访问器：

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
            本地源 directory 的路径。路径必须相对于当前项目的根目录。
        </p>
    </def>
    <def title="remoteUrl">
        <p>
            文档读者可以访问的源代码托管服务的 URL，例如 GitHub、GitLab、Bitbucket 或任何为源文件提供稳定 URL 的托管服务。 
            此 URL 用于生成声明的源代码链接。
        </p>
    </def>
    <def title="remoteLineSuffix">
        <p>
            用于在 URL 后追加源代码行号的后缀。这有助于读者不仅导航到文件，还可以导航到声明的具体行号。
        </p>
        <p>
            数字本身会追加到指定的后缀之后。例如，
            如果此选项设置为 <code>#L</code> 且行号为 10，则生成的 URL 后缀为 <code>#L10</code>。
        </p>
        <p>
            常用服务使用的后缀：</p>
            <list>
                <li>GitHub: <code>#L</code></li>
                <li>GitLab: <code>#L</code></li>
                <li>Bitbucket: <code>#lines-</code></li>
            </list>
        <p>默认值：<code>#L</code></p>
    </def>
</deflist>

### 软件包选项 {id="package-options"}

`perPackageOption` 配置块允许为由 `matchingRegex` 匹配的特定软件包设置一些选项：

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
        <p>用于匹配软件包的正则表达式。</p>
        <p>默认值：<code>.*</code></p>
    </def>
    <def title="suppress">
        <p>生成文档时是否应跳过该软件包。</p>
        <p>默认值：<code>false</code></p>
    </def>
    <def title="skipDeprecated">
        <p>是否记录带有 <code>@Deprecated</code> 注解的声明。</p>
        <p>可以在源集级别配置此项。</p>
        <p>默认值：<code>false</code></p>
    </def>
    <def title="reportUndocumented">
        <p>
            是否对可见的未记录声明（即经过 <code>documentedVisibilities</code> 和其他过滤器过滤后没有 KDoc 的声明）发出警告。
        </p>
        <p>此设置与 <code>failOnWarning</code> 配合使用效果良好。</p>
        <p>可以在源集级别配置此项。</p>
        <p>默认值：<code>false</code></p>
    </def>
    <def title="documentedVisibilities">
        <p>定义 Dokka 在生成的文档中应包含哪些可见性修饰符。</p>
        <p>
            如果您想要记录此软件包内的 <code>protected</code>、<code>internal</code> 和 <code>private</code> 声明，
            以及如果您想要排除 <code>public</code> 声明并仅记录内部 API，请使用此项。
        </p>
        <p>
            此外，您可以使用 Dokka 的 
            <a href="https://github.com/Kotlin/dokka/blob/v2.0.0/dokka-runners/dokka-gradle-plugin/src/main/kotlin/engine/parameters/HasConfigurableVisibilityModifiers.kt#L14-L16"><code>documentedVisibilities()</code> 函数</a> 
            来添加记录的可见性。
        </p>
        <p>可以在源集级别配置此项。</p>
        <p>默认值：<code>VisibilityModifier.Public</code></p>
    </def>
</deflist>

### 外部文档链接配置 {id="external-documentation-links-configuration"}

`externalDocumentationLinks {}` 块允许创建指向依赖项外部托管文档的链接。

例如，如果您正在使用来自 `kotlinx.serialization` 的类型，默认情况下它们在您的文档中是不可点击的，就好像它们未解析一样。然而，由于 `kotlinx.serialization` 的 API 参考文档是由 Dokka 构建并 [发布在 kotlinlang.org 上的](https://kotlinlang.org/api/kotlinx.serialization/)，您可以为其配置外部文档链接。这允许 Dokka 为该库中的类型生成链接，使它们能够成功解析并可点击。

默认情况下，已经配置了 Kotlin 标准库、JDK、Android SDK 和 AndroidX 的外部文档链接。

使用 `register()` 方法注册外部文档链接以定义每个链接。`externalDocumentationLinks` API 使用此方法来符合 Gradle DSL 约定：

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
        <p>要链接到的文档的根 URL。它<b>必须</b>包含结尾斜杠。</p>
        <p>
            Dokka 会尽力为指定的 URL 自动查找 <code>package-list</code>，并将声明链接在一起。
        </p>
        <p>
            如果自动解析失败，或者如果您想使用本地缓存的文件，请考虑设置 <code>packageListUrl</code> 选项。
        </p>
    </def>
    <def title="packageListUrl">
        <p>
            <code>package-list</code> 的确切位置。这是依赖 Dokka 自动解析之外的一种替代方案。
        </p>
        <p>
            软件包列表包含有关文档和项目本身的信息，例如子项目和软件包名称。
        </p>
        <p>这也可以是本地缓存的文件，以避免网络调用。</p>
    </def>
</deflist>

### 完整配置 {id="complete-configuration"}

在下方，您可以查看同时应用了所有可能配置选项的情况：

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
        // 示例：仅针对 'linux' 源集的配置
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
        // 示例：仅针对 'linux' 源集的配置
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