[//]: # (title: Kotlin 后端开发常见问题解答)

本页面解答了关于使用 Maven 构建、测试和交付 Kotlin 后端应用程序的一些常见问题。
每个回答都附有链接，指向 Kotlin 或外部文档中更详细的说明。

## 多模块构建、BOM 与版本管理 {id="multi-module-builds-bom-and-version-management"}

### 如何在多模块构建中统一锁定单个 Kotlin 版本？ {id="how-to-pin-a-single-kotlin-version-across-a-multi-module-build"}

在父 POM 文件中声明一个 `kotlin.version` 属性，并在所有位置复用它：

* 在父 `pom.xml` 文件中设置一次 `kotlin-maven-plugin` 的版本。为此，请在 `<properties>` 部分设置 Kotlin 版本，并在 `<build><plugins>` 或 `<build><pluginManagement>` 部分将其引用为 `${kotlin.version}`。
  有关更多信息，请参阅[项目配置](mixing-java-kotlin-intellij.md#maven)。
* 通过 Kotlin BOM 文件保持 Kotlin 库版本一致，确保 `kotlin-stdlib`、`kotlin-reflect`、`kotlin-test` 以及其他构件始终解析为相同的发布版本，不会因模块而异。
  有关更多信息，请参阅[使用 BOM 管理依赖项](maven-set-dependencies.md#manage-dependencies-with-a-bom)。

### 什么是 Kotlin BOM 以及如何使用它？ {id="what-is-the-kotlin-bom-and-how-to-use-it"}

Kotlin BOM (`org.jetbrains.kotlin:kotlin-bom`) 是一个特殊的 POM 文件，用于管理 Kotlin 库的版本，以使相关构件始终与相同的 Kotlin 发布版本保持一致，即使它们是作为传递依赖项引入的。

将其导入到 `pom.xml` 的 `<dependencyManagement>` 部分，并设置 `<type>pom</type>` 和 `<scope>import</scope>`。
随后在声明 Kotlin 依赖项时即可省略 `<version>`。这些版本将自动从 BOM 文件中获取。

有关更多信息，请参阅[使用 BOM 管理依赖项](maven-set-dependencies.md#manage-dependencies-with-a-bom)。

### 我需要保持 Kotlin Maven 插件版本与 Kotlin 库版本一致吗？ {id="do-i-need-to-keep-the-kotlin-maven-plugin-version-aligned-with-kotlin-library-versions"}

是的。将某一编译器版本与不兼容的 Kotlin 库混用可能会导致“Mixed Kotlin versions”（混合 Kotlin 版本）错误和元数据不兼容。保持一致的最简单方法是使用单一定义的相同 Kotlin 版本。例如：

* 在父 `pom.xml` 文件中设置一次 [`kotlin-maven-plugin`](maven-kotlin-compiler.md) 的版本，然后在所有位置将其引用为 `${kotlin.version}`。
* 导入 [Kotlin BOM](maven-set-dependencies.md#manage-dependencies-with-a-bom)，使所有 Kotlin 库都遵循相同的发布版本。

### 如何跨所有模块配置 Kotlin 编译器选项？ {id="how-to-configure-kotlin-compiler-options-across-all-modules"}

要跨所有 Maven 模块配置 Kotlin 编译器，可以通过以下任一方式在父 `pom.xml` 文件中集中设置选项：

* 在父级的 `<properties>` 部分设置编译器选项，例如 `kotlin.compiler.languageVersion`、`kotlin.compiler.apiVersion` 和 `kotlin.compiler.jvmTarget`。
* 在父 `pom.xml` 文件中共享单个 `kotlin-maven-plugin` 的 `<configuration>`（例如额外的 `<args>`），以便所有模块都使用相同的设置进行编译。

模块特定的替换是可行的，但应当尽量少用。有关选项及其属性名称的完整列表，请参阅[编译器选项](maven-kotlin-compiler.md)。

### 为什么在多模块构建中会出现字节码级别不匹配的情况？ {id="why-do-i-get-bytecode-level-mismatches-in-a-multi-module-build"}

你可能会遇到 `UnsupportedClassVersionError` 及类似错误，这意味着生成的字节码所针对的 JVM 版本高于运行代码所用的版本。为避免此类问题，请在模块和 CI 之间保持以下各项的一致：

* 运行 Maven 的 JDK。
* Java 编译器目标。
* Kotlin 的 `jvmTarget` 选项。

如果在项目中启用了 `<extensions>` 选项，Kotlin 和 Java 编译器将自动以相同的字节码版本为目标。有关 Kotlin Maven 插件如何根据构建文件中的不同选项解析 JVM 目标版本的更多信息，请参阅 [JVM 目标版本](maven-configure-project.md#jvm-target-version)。

对于手动配置，可以使用 `maven-toolchains-plugin` 来配置统一的工具链，以控制整个构建过程中所有插件所使用的 JDK 版本。有关更多信息，请参阅[设置 JDK 版本](maven-configure-project.md#set-jdk-version)。

## 测试：Surefire、Failsafe 和 JUnit {id="testing-surefire-failsafe-and-junit"}

### 为什么 `mvn test` 会跳过 Kotlin 测试？ {id="why-does-mvn-test-skip-kotlin-tests"}

尝试运行 `mvn test` 命令时，你可能会遇到“Tests run: 0”（运行测试：0）错误。最常见的原因包括：

* **测试发现机制**：Surefire 会运行符合 `*Test` 命名模式的测试。Failsafe 插件则通过 `mvn verify` 命令运行以 `*IT` 后缀命名的集成测试。有关更多信息，请参阅[运行测试](jvm-test-maven.md#run-tests)。
* **类路径上缺少引擎**：添加 JUnit 测试依赖项，以便 JUnit 能够发现并运行你的测试。
  最简单的选择是使用 [`kotlin-test-junit5`](jvm-test-maven.md#junit-5-and-later)，它会自动拉取所需的 JUnit 构件。有关更多信息，请参阅[测试库依赖项](maven-set-dependencies.md#dependencies-on-test-libraries)。
* **测试源代码未编译**：确保运行了 Kotlin 的 `test-compile` 执行阶段，以便在测试执行之前完成 Kotlin 测试源代码的编译。

### 如何配置 Surefire 插件来运行 JUnit 测试？ {id="how-to-configure-the-surefire-plugin-to-run-junit-tests"}

要配置 Surefire 插件以运行 JUnit 测试：

1. 添加一个 `<scope>test</scope>` 的 JUnit 测试依赖项（例如 [`kotlin-test-junit5`](jvm-test-maven.md#junit-5-and-later)），以将 JUnit 包含在测试类路径中。
2. 将 [Surefire 插件](jvm-test-maven.md#with-surefire-plugin)添加到你的 `pom.xml` 文件中。
3. 检查类路径中是否存在冲突的测试提供程序（test provider），此类冲突会导致“missing engine / wrong provider”（缺少引擎/错误的提供程序）错误。

有关完整设置和示例项目，请参阅[使用 Maven 测试 Kotlin 项目](jvm-test-maven.md)。

### 如何将 Maven Kotlin 后端升级到 JUnit 6？ {id="how-to-upgrade-a-maven-kotlin-backend-to-junit-6"}

Kotlin/JVM 支持最新的稳定 JUnit 版本，包括 JUnit 6。
针对 JUnit 6，请在 `pom.xml` 中保留相同的 [`kotlin-test-junit5`](jvm-test-maven.md#junit-5-and-later) 依赖项。

升级时，请确保：

* 正确设置了新 JUnit 发布版本所需的基线 Java 版本。
* 所有与 JUnit 相关的依赖项版本保持一致。
* 测试代码中没有已弃用的组件。

有关更多信息，请参阅[使用 JUnit 创建测试](jvm-test-maven.md#create-tests-with-junit)。

### 如何分离单元测试和集成测试？ {id="how-to-split-unit-and-integration-tests"}

将执行流程拆分给两个插件。对于单元测试，在 `test` 阶段使用 [Surefire 插件](jvm-test-maven.md#with-surefire-plugin)。
单元测试请采用 `*Test` 命名约定。

对于集成测试，在 `integration-test` 和 `verify` 阶段使用 [Failsafe 插件](jvm-test-maven.md#with-failsafe-plugin)。
集成测试请采用 `*IT` 命名约定。

仅运行单元测试时执行 `mvn test`，两者均运行时执行 `mvn verify`。

有关更多信息，请参阅[使用 Maven 测试 Kotlin 项目](jvm-test-maven.md)。

## 注解处理：kapt 与 KSP {id="annotation-processing-kapt-and-ksp"}

### 可以在 Maven 中使用 KSP 吗？ {id="can-i-use-ksp-with-maven"}

由于 KSP 目前仅对 Gradle 提供官方支持，我们建议所有 Maven 项目都使用 [kapt](kapt.md)。
你也可以尝试社区提供的 KSP Maven 插件，但它们拥有各自独立的支持和维护流程。

Maven 的另一个选择是在某一构建阶段中通过 KSP 的[命令行](ksp-command-line.md)入口点运行它。这意味着需要将 KSP 代码生成接入 Maven 生命周期：在较早的阶段（如 `generate-sources`）运行 KSP，并将生成的代码输出到一个稳定的目录中。然后将该目录添加到编译源根目录，并确保代码生成在 Kotlin 编译**之前**运行，以便在编译代码时生成的源代码已存在。

有关更多信息，请参阅[在 Kotlin 项目中使用注解处理器](jvm-annotation-processors.md)。

### 在基于 Gradle 的 Kotlin 后端中，何时应选用 kapt，何时选用 KSP？ {id="when-should-i-use-kapt-versus-ksp-in-a-gradle-based-kotlin-backend"}

如果想在 Kotlin Gradle 项目中使用现有的 Java 注解处理器，请先检查 [KSP 是否已支持它们](ksp-overview.md#supported-libraries)。
对于不受支持的处理器，请使用 [kapt](kapt.md)。

如果想编写自己的注解处理器，请使用 [KSP](ksp-quickstart.md#create-your-own-processor)。

有关更多信息，请参阅[Kotlin 项目中的注解处理器](jvm-annotation-processors.md)。

### 如何配置 kapt？ {id="how-to-configure-kapt"}

要在 Kotlin Maven 项目中配置 kapt，请在 `compile` 执行**之前**添加一个 `kotlin-maven-plugin` 的 `kapt` 目标执行配置，并在 `<annotationProcessorPaths>` 下显式列出注解处理器。这可以确保生成的源代码在引用它们的代码被编译之前生成。

有关更多信息，请参阅[在 Maven 中设置 kapt](kapt.md#set-up-in-maven)以及[将 kapt 与 MapStruct 结合使用](jvm-annotation-processors.md#use-kapt-with-java-annotation-processors)的示例。

### 为什么 kapt 会在较新的 JDK 上失败？ {id="why-does-kapt-fail-on-newer-jdks"}

在将现代 JDK 与 kapt 集成用于 Kotlin 项目时，你可能会遇到“IllegalAccessError”或“InaccessibleObjectException”错误。这可能是由内部包的强封装引起的，而 kapt 在进行注解处理时需要访问这些包。

你可以通过将 Kotlin 更新到最新版本，并在运行 Maven 的 JVM 中添加所需的 `--add-opens` 参数来解决此问题。

`--add-opens` 参数通知 JVM 开放某个内部 JDK 包以供深度反射访问，而强封装在默认情况下会阻止这种访问。其格式为 `--add-opens <module>/<package>=<target-module>`，对于从类路径运行的代码（例如构建工具），`<target-module>` 通常为 `ALL-UNNAMED`。例如，要向 kapt 授予其所需的编译器内部访问权限：

```bash
--add-opens jdk.compiler/com.sun.tools.javac.util=ALL-UNNAMED
```

应用这些参数最简单的方法是将它们添加到项目根目录下的仓库级 `.mvn/jvm.config` 文件中，每行一个 JVM 参数。Maven 会自动将该文件中的每个选项传递给运行构建的 JVM，从而让每位开发者和 CI 运行器都使用相同的设置。

有关 kapt 配置的更多信息，请参阅 [kapt 编译器插件](kapt.md)。

### kapt 在何处生成源代码以及如何修复其 IDE 导入？ {id="where-does-kapt-generate-sources-and-how-to-fix-their-ide-imports"}

kapt 在模块的 `target/` 目录中生成源代码，并将它们添加为源根目录，以便作为构建的一部分参与编译。

如果 IDE 中出现“红色”导入错误，请重新导入你的 Kotlin Maven 项目，以便 IDE 能够识别生成源代码的目录。

有关 kapt 配置的更多信息，请参阅 [kapt 编译器插件](kapt.md)。

## 质量门：格式设置与覆盖率 {id="quality-gates-formatting-and-coverage"}

### 如何强制执行 Kotlin 格式设置检查？ {id="how-to-enforce-kotlin-formatting-checks"}

在 `pom.xml` 构建文件中将 ktlint 的 `check` 目标绑定到 `verify` 阶段，这样一旦违反格式设置规则，CI 就会构建失败。
将 `format` 保留为开发者显式触发的操作。你可以在 `.editorconfig` 文件中调整格式设置规则。

有关更多信息，请参阅[使用 ktlint 进行代码格式设置](jvm-code-analysis.md#code-formatting-with-ktlint)。
你还可以在项目的质量门中添加 [detekt 静态分析](jvm-code-analysis.md#code-analysis-with-detekt)。

### 为什么 Kotlin linter 或格式化程序会在 Java 17+ 上失败？ {id="why-do-kotlin-linters-or-formatters-fail-on-java-17"}

在 Java 17 及更高版本上使用 Kotlin linter 或格式化程序时，你可能会遇到模块访问错误。

这些工具在 Maven JVM 内部运行，因此在较新的 JDK 上，它们可能需要额外的 `--add-opens` 参数。每个参数均采用 `--add-opens <module>/<package>=ALL-UNNAMED` 格式，用于开放内部 JDK 包以供反射访问。将这些参数逐行放入仓库级的 `.mvn/jvm.config` 文件中，这样相同的设置就会被提交到仓库中，并同时在本地和 CI 中生效。有关更多详细信息，请参阅[为什么 kapt 会在较新的 JDK 上失败？](#why-does-kapt-fail-on-newer-jdks)。

### 推荐哪些代码覆盖率工具？ {id="which-code-coverage-tools-are-recommended"}

[Kover](https://github.com/Kotlin/kotlinx-kover) 是 JetBrains 针对 Kotlin 推出的官方覆盖率工具。它能理解 Kotlin 特有的结构，并提供带有内置验证规则的 Maven 插件，因此它是以 Kotlin 为主的项目的首选。

如果已有成熟的 Java 覆盖率流水线和相关报告，另一个选择是使用 [JaCoCo](https://github.com/jacoco/jacoco)。

有关更多信息，请参阅[使用 Kover 进行代码覆盖率分析](jvm-code-analysis.md#code-coverage-with-kover)。

### 如何为多模块项目生成聚合覆盖率报告？ {id="how-to-generate-an-aggregated-coverage-report-for-a-multi-module-project"}

要为 Maven 项目中的所有模块生成覆盖率报告，请从每个模块收集覆盖率数据，并在依赖于其他模块的专用报告模块中进行聚合。通过这种方式，聚合操作会在各个独立模块生成其执行数据之后运行。你可以使用 [`kover-maven-plugin`](https://kotlin.github.io/kotlinx-kover/maven-plugin/) 来实现该工作流。

有关更多信息，请参阅[使用 Kover 进行代码覆盖率分析](jvm-code-analysis.md#code-coverage-with-kover)。

## 构建应用程序：打包与运行时 {id="building-applications-packaging-and-runtime"}

### 如何构建可运行的 JAR 并设置入口点？ {id="how-to-build-a-runnable-jar-and-set-the-entry-point"}

要构建可运行的 JAR，需要设置 `Main-Class` 入口点。它应该是由包含顶级 `main()` 函数的 Kotlin 文件编译而成的 JVM 类名。例如，`Main.kt` 文件中的 `main()` 函数会被编译为 `MainKt` 类。

通过 `maven-jar-plugin` 的清单（manifest）配置将该类名设置为 `Main-Class` 入口点。

有关更多信息，请参阅[创建 JAR 文件](maven-compile-package.md#create-jar-files)。

### 为什么打包好的应用程序会出现主类错误？ {id="why-does-the-packaged-application-fail-with-main-class-errors"}

在构建应用程序时，尤其是在容器中，你可能会遇到“Could not find or load main class”（找不到或无法加载主类）错误。要排查此问题，请按照以下核对清单进行排查：

* 检查清单中的 `Main-Class` 是否指向[正确的已编译类](#how-to-build-a-runnable-jar-and-set-the-entry-point)。
* 确保运行的是正确的构件：瘦 [JAR](maven-compile-package.md#create-jar-files) 需要在类路径中提供其依赖项，而[自包含 JAR](maven-compile-package.md#create-self-contained-jar-files) 则打包了这些依赖项。
* 检查容器入口点是否使用了正确的 `java -jar` 命令和类路径。

### 如何将 Kotlin 运行时类一起构建到 Fat JAR 中？ {id="how-to-build-a-fat-jar-together-with-kotlin-runtime-classes"}

要构建 fat (uber) JAR 并避免缺少 Kotlin 运行时类，请构建一个打包了依赖项的自包含 JAR，并确保 Kotlin 标准库位于运行时类路径中。由于 fat JAR 包含了依赖项，因此将 [`kotlin-stdlib`](maven-set-dependencies.md#dependency-on-the-standard-library) 声明为依赖项即可确保 Kotlin 运行时被打包在内。

有关更多信息，请参阅[创建自包含 JAR 文件](maven-compile-package.md#create-self-contained-jar-files)。

### JVM 参数应该放在哪里？ {id="where-should-jvm-arguments-be"}

将用于 Maven 构建过程、测试 JVM 和运行时的 JVM 参数划分到三个不同的位置：

* **Maven 构建 JVM**：将共享参数放入仓库级的 `.mvn/jvm.config` 文件中。
* **测试 JVM**：将它们放置在 [Surefire](jvm-test-maven.md#with-surefire-plugin) 和 [Failsafe](jvm-test-maven.md#with-failsafe-plugin) 插件的配置部分。
* **运行时**：在启动[已打包应用程序](maven-compile-package.md)的容器命令或部署配置中设置它们。

## 发布库：源代码与签名 {id="publishing-libraries-sources-and-signing"}

### 发布到 Maven Central 有哪些要求？ {id="what-are-the-requirements-to-publish-to-maven-central"}

要将 Kotlin 库发布到 [Maven Central](https://central.sonatype.com/)：

1. **准备构件**：构建主构件、[源码 JAR](#how-to-attach-and-deploy-a-source-jar) 和文档 (Javadoc) JAR。
2. **完善 POM 元数据**：名称、描述、许可证、开发者和 SCM 信息。
3. **签署构件**：以[对 CI 友好的方式](#how-to-sign-artifacts-for-maven-central-in-a-ci-friendly-way)为每个构件生成 GPG 签名。
4. **部署构件**：结合使用 [`central-publishing-maven-plugin`](https://central.sonatype.org/publish/publish-portal-maven/) 运行 `mvn deploy`，以生成部署包并上传到 Maven Central 进行验证。

   该插件不会自动生成源码 JAR、Javadoc JAR 或 GPG 签名，因此你需要单独配置这些前置要求。

请注意，Maven Central 的发布版本是不可变的：版本一旦发布，便无法替换。

有关生成文档 JAR 的更多信息，请参阅 [Dokka 文档引擎](dokka-maven.md)。
有关完整的发布流程和要求，请参阅官方 [Sonatype 文档](https://central.sonatype.org/publish/publish-portal-maven/)。

### 如何附加并部署源码 JAR？ {id="how-to-attach-and-deploy-a-source-jar"}

要为基于 Maven 的 Kotlin 库附加并部署源码 JAR，请将 [`maven-source-plugin`](https://maven.apache.org/plugins/maven-source-plugin/) 绑定到构建生命周期，以便自动附加源码构件并与主构件一起部署。

如果你的项目同时发布多个协同发布的库，建议提供自己的 [BOM](maven-set-dependencies.md#manage-dependencies-with-a-bom) 文件，以便使用者能够像对齐 Kotlin 构件一样对齐各库的版本。

### 如何以对 CI 友好的方式为 Maven Central 签署构件？ {id="how-to-sign-artifacts-for-maven-central-in-a-ci-friendly-way"}

要以对 CI 友好的方式为 Maven Central 构件进行配置，我们建议：

* 使用 [`maven-gpg-plugin`](https://maven.apache.org/plugins/maven-gpg-plugin/) 对项目所有附加的构件进行签名。
* 通过 CI 密钥（secrets）或环境变量提供密钥内容和密码短语，切勿将它们提交到代码库中。
* 确保签名步骤在部署（deploy）步骤之前运行，以便所有发布的构件（包括源码和 Javadoc JAR）都完成签名。

## 故障排除 {id="troubleshooting"}

### 如何修复在 JDK 17 上的插件失败问题？ {id="how-to-fix-the-plugin-failure-on-jdk-17"}

在 JDK 17 上，你可能会遇到 Kotlin Maven 插件执行失败，并收到建议在运行 Maven 的 JVM 中添加 `--add-opens` 参数的提示。

要在项目级别修复此问题，请将所需的 JVM 参数逐行放入仓库级的 `.mvn/jvm.config` 文件中，以便每位开发者和 CI 运行器都使用相同的设置，并保持你的 [Kotlin 版本](maven-kotlin-compiler.md)为最新。这可以保证本地与 CI 的行为一致。

每个 `--add-opens` 参数都遵循 `--add-opens <module>/<package>=ALL-UNNAMED` 格式，用于开放内部 JDK 包以供反射访问。有关更多详细信息，请参阅[为什么 kapt 会在较新的 JDK 上失败？](#why-does-kapt-fail-on-newer-jdks)。

### 为什么会出现 Kotlin 或 API 版本不匹配的错误？ {id="why-do-i-get-mismatch-errors-for-kotlin-or-api-versions"}

你可能会遇到“API version X is no longer supported”（不再支持 API 版本 X）或“module was compiled with an incompatible version of Kotlin”（模块是用不兼容的 Kotlin 版本编译的）错误。它们表明 Kotlin 编译器与类路径上的 Kotlin 库之间存在不匹配。要解决此问题：

* 保持编译器与所有 Kotlin 库使用的版本一致。在 `<properties>` 部分声明一次 Kotlin 版本，使用 `${kotlin.version}` 引用它，并使用 [Kotlin BOM](maven-set-dependencies.md#manage-dependencies-with-a-bom) 文件。
* 移除使用不兼容版本的旧版传递 Kotlin 构件。
* 对照你希望作为目标的 Kotlin 版本，检查 [`languageVersion` 和 `apiVersion`](maven-kotlin-compiler.md#attributes-specific-to-jvm)。