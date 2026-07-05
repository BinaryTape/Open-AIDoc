[//]: # (title: Maven)

Maven 是一个构建系统，可帮助管理仅限 Kotlin 或 Kotlin-Java 混合项目并自动执行构建过程。
它适用于基于 JVM 的项目，可以下载所需的依赖项，并编译和打包代码。
要详细了解其基础知识和具体细节，请访问 [Maven](https://maven.apache.org/) 官网。

以下是使用 Kotlin Maven 项目时的一般工作流：

1. [配置您的 Java 或 Kotlin 项目](maven-configure-project.md)。
2. [声明仓库](maven-set-dependencies.md#declare-repositories)。
3. [设置项目依赖项](maven-set-dependencies.md)。
4. [配置 Kotlin 编译器](maven-kotlin-compiler.md)。
5. [打包您的应用程序](maven-compile-package.md)。

要入门，您还可以参考我们的分步教程：

* [配置 Java 项目以使用 Kotlin](mixing-java-kotlin-intellij.md)
* [使用 Kotlin 和 JUnit 测试 Java Maven 项目](jvm-test-using-junit.md)

> 您可以查看我们的公共 [示例项目](https://github.com/kotlin-hands-on/kotlin-junit-sample/tree/main/complete)，该项目已经为 Kotlin/Java 混合项目配置好了 Maven 和 Gradle 构建文件。
>
{style="tip"}

## 后续步骤？

* 使用 [`power-assert` 插件](power-assert.md#maven)**提升调试体验**。
* 使用 [`kover-maven-plugin`](https://kotlin.github.io/kotlinx-kover/maven-plugin/)**衡量测试覆盖率并生成报告**。
* 使用 [kapt 插件](kapt.md#set-up-in-maven)**配置注解处理**。
* 使用 [Dokka 文档引擎](dokka-maven.md)**生成文档**。
  它支持混合语言项目，并可以生成包括标准 Javadoc 在内的多种格式的输出。
* 通过添加 [`kotlin-osgi-bundle`](kotlin-osgi.md#maven)**启用 OSGi 支持**。