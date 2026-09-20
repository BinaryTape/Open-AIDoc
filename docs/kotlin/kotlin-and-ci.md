[//]: # (title: Kotlin 与 TeamCity 的持续集成)

在本页中，您将学习如何配置 [TeamCity](https://www.jetbrains.com/teamcity/) 来构建 Kotlin 应用程序。
有关 TeamCity 的安装和基本设置，请参阅 [TeamCity 文档](https://www.jetbrains.com/teamcity/documentation/)。

Kotlin 可以直接与 Gradle 和 Maven 等标准构建工具集成，因此在 TeamCity 中配置 Kotlin 构建的工作流程与配置任何其他项目相同。如果您改为使用 IntelliJ IDEA 构建系统来编译项目，TeamCity 也提供了专用的运行器。

## Gradle 和 Maven {id="gradle-and-maven"}

使用 Gradle 或 Maven 构建时，构建配置文件（`build.gradle.kts` 或 `pom.xml`）中已经声明了 Kotlin 依赖项和编译器插件。TeamCity 不需要任何额外的 Kotlin 专属设置。

对于 Gradle，请在构建配置中添加一个 Gradle 构建步骤，并指定要运行的 **Step name**（步骤名称）和 **Gradle tasks**（Gradle 任务）。
<img src="teamcity-gradle.png" alt="Gradle Build Step" width="700" border-effect="line"/>

同样，对于 Maven，请添加一个 Maven 构建步骤，并指定要执行的 **Step name**（步骤名称）和 **Goals**（目标）。

## IntelliJ IDEA 构建系统 {id="intellij-idea-build-system"}

如果使用 IntelliJ IDEA 项目文件构建项目，TeamCity 中的 Kotlin 版本必须与 IDE 项目中配置的版本相匹配。
您可以使用 TeamCity recipe 来自动化下载和配置 Kotlin 编译器。Recipe 是元运行器（meta-runner）的演进形态：它们的作用相同，但提供了额外的优势，例如 YAML 支持以及可在 [JetBrains Marketplace](https://plugins.jetbrains.com/teamcity_recipe) 上轻松共享。

1. 下载并导入 recipe。
   * 从 [GitHub](https://github.com/JetBrains/Kotlin.TeamCity) 下载 Kotlin 元运行器文件。
   * 将其作为新的 recipe 导入 TeamCity。有关详情，请参阅[使用 recipe](https://www.jetbrains.com/help/teamcity/working-with-meta-runner.html)。
  <img src="teamcity-add-recipe.png" alt="TeamCity recipe" width="700" border-effect="line"/>

2. 添加获取 Kotlin 编译器步骤。
   * 使用导入的运行器添加一个构建步骤。
   * 指定 **Step name**（步骤名称）和所需的 **Kotlin Version**（Kotlin 版本）。
  <img src="teamcity-step-name.png" alt="Setup Kotlin Compiler" width="700" border-effect="line"/>

  >在运行构建之前，请在构建配置中将 `system.path.macro.KOTLIN.BUNDLED` 添加为系统参数。
  >您可以为其指定任意占位符值，运行器将在构建时使用解析出的编译器路径将其覆盖。
  >
  > {style="note"}

3. 添加编译步骤。
   在获取编译器步骤之后添加一个 IntelliJ IDEA Project 运行器步骤，以编译项目并生成构建工件。
  <img src="teamcity-intellij-step.png" alt="IntelliJ IDEA Project runner" width="500" border-effect="line"/>

## 其他 CI 服务器 {id="other-ci-servers"}

如果使用 TeamCity 以外的 CI 系统，直接在流水线脚本中调用标准的 Gradle 或 Maven 命令即可。

## 下一步 {id="what-s-next"}

* 了解如何[为 Kotlin Multiplatform 应用程序配置 TeamCity](https://kotlinlang.org/docs/multiplatform/configure-teamcity-for-kmp.html)，以构建、测试和部署 Kotlin Multiplatform 应用程序。
* 按照教程在托管的 macOS 代理上[为 Kotlin Multiplatform 项目配置 iOS 交付流水线](https://kotlinlang.org/docs/multiplatform/ios-ci-cd-teamcity.html)，并自动部署到 TestFlight。
* 了解如何[将项目设置存储在版本控制中](https://www.jetbrains.com/help/teamcity/storing-project-settings-in-version-control.html)，并使用 Kotlin DSL 将流水线作为代码进行管理。