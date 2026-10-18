[//]: # (title: Maven)

Maven 是一种构建系统，有助于管理纯 Kotlin 或 Kotlin-Java 混合项目，并实现构建过程的自动化。
它适用于基于 JVM 的项目，能够下载所需的依赖项、编译并打包代码。
详细了解其基础知识和详细信息，请访问 [Maven](https://maven.apache.org/) 官网。

以下是使用 Kotlin Maven 项目时的一般工作流程：

1. [配置 Java 或 Kotlin 项目](maven-configure-project.md)。
2. [声明仓库](maven-set-dependencies.md#declare-repositories)。
3. [设置项目依赖项](maven-set-dependencies.md)。
4. [配置 Kotlin 编译器](maven-kotlin-compiler.md)。
5. [打包应用程序](maven-compile-package.md)。

要开始使用，您也可以参考我们循序渐进的教程：

* [配置 Java 项目以使用 Kotlin](mixing-java-kotlin-intellij.md)
* [使用 Kotlin 和 JUnit 测试 Java Maven 项目](jvm-test-using-junit.md)

> 您可以查看我们的公开[示例项目](https://github.com/kotlin-hands-on/kotlin-junit-sample/tree/main/complete)，
> 其中已针对 Kotlin/Java 混合项目预先配置好了 Maven 和 Gradle 构建文件。
>
{style="tip"}

## 后续步骤 {id="what-s-next"}

* 通过 [`power-assert` 插件](power-assert.md#maven)**改善调试体验**。
* 通过 [`kover-maven-plugin`](https://kotlin.github.io/kotlinx-kover/maven-plugin/) **衡量测试覆盖率并生成报告**。
* 通过 [kapt 插件](kapt.md#set-up-in-maven)**配置注解处理**。
* 通过 [Dokka 文档引擎](dokka-maven.md)**生成文档**。
  它支持混合语言项目，并能以多种格式生成输出，包括标准 Javadoc。
* 通过添加 [`kotlin-osgi-bundle`](kotlin-osgi.md#maven)**启用 OSGi 支持**。
* 在 [Kotlin 后端开发常见问题解答](jvm-backend-faq.md)中**查找关于多模块构建、测试、打包和发布的常见问题解答**。