[//]: # (title: 使用 Kotlin 进行后端开发)

<web-summary>使用 Spring、Ktor 以及其他后端框架，通过 Kotlin 构建服务器应用程序</web-summary>

Kotlin 非常适合开发服务器端应用程序。借助 Kotlin，您可以编写简洁且富有表现力的代码，同时与现有的基于 Java 的技术栈保持完全兼容。

## 开始使用 {id="get-started"}

Kotlin 支持将大型代码库从 Java 逐步迁移到 Kotlin。您可以开始使用 Kotlin 编写测试或新的生产代码，同时项目的其他部分继续保留在 Java 中。

配置您的 Java 项目以配合 Kotlin 使用，并利用 IntelliJ IDEA 中随附的自动化 Java 到 Kotlin 转换器：

<a href="mixing-java-kotlin-intellij.md" as="button" mode="rock" icon="arrow-right" icon-position="right">将 Kotlin 引入您的 Java 项目</a>

## 探索框架 {id="explore-frameworks"}

Kotlin 与所有基于 Java 的框架完全兼容，因此您可以在享受 Kotlin 语法的优势的同时，继续使用熟悉的技术栈。除了出色的 IDE 支持之外，Kotlin 还提供了特定于框架的工具，例如在拥有 Ultimate 订阅的 IntelliJ IDEA 中对 Spring 和 Ktor 的支持。

### Spring {id="spring"}

[Spring](https://spring.io) 利用 Kotlin 的语言特性提供了更加简洁的 API。
[在线项目生成器](https://start.spring.io/#!language=kotlin)使您能够使用 Kotlin 快速生成新项目。

<a href="jvm-get-started-spring-boot.md" as="button" mode="rock" icon="arrow-right" icon-position="right">Spring Boot 与 Kotlin 入门</a>

### Ktor {id="ktor"}

[Ktor](https://github.com/kotlin/ktor) 是 JetBrains 开发的用于在 Kotlin 中创建 Web 应用程序的框架。
它使用协程实现高可扩展性，并提供易于使用的符合语言习惯的 API。

<a href="https://ktor.io/docs/server-create-a-new-project.html" as="button" mode="rock" icon="arrow-right" icon-position="right">创建新的 Ktor 项目</a>

### 其他框架 {id="other-frameworks"}

以下是 Kotlin 适用的其他一些后端框架示例：

| 框架 | 描述 |
|--------------------------------------------------------|-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| [Quarkus](https://quarkus.io/guides/kotlin) | 一个为 Kotlin 提供一等支持的开源框架。Quarkus 从底层专为 Kubernetes 构建，并通过利用持续增加的数百个精选库来提供紧凑的全栈框架。 |
| [Vert.x](https://vertx.io) | 用于在 JVM 上构建响应式 Web 应用程序的框架。Vert.x 为 Kotlin 提供了[专门支持](https://github.com/vert-x3/vertx-lang-kotlin)，包括[集成 Kotlin 协程](https://vertx.io/docs/vertx-lang-kotlin-coroutines/kotlin/)。 |
| [kotlinx.html](https://github.com/kotlin/kotlinx.html) | 一种可用于在 Web 应用程序中构建 HTML 的 DSL。它是 JSP 和 FreeMarker 等传统模板系统的替代方案。 |
| [Micronaut](https://micronaut.io/) | 一个基于 JVM 的现代全栈框架，用于构建模块化、易于测试的微服务和无服务器应用程序。观看在线讲座 [Micronaut for microservices with Kotlin](https://micronaut.io/2020/12/03/webinar-micronaut-for-microservices-with-kotlin/)，并浏览详细[指南](https://guides.micronaut.io/latest/micronaut-kotlin-extension-fns.html)，了解如何在 Micronaut 框架中使用 [Kotlin 扩展函数](extensions.md#extension-functions)。 |
| [http4k](https://http4k.org/) | 一个采用纯 Kotlin 编写、内存占用小的 Kotlin HTTP 应用程序函数式工具包。http4k 提供了[支持命令行工具的工具箱](https://toolbox.http4k.org)以生成完整的项目模板，以及基于 Web 的[项目向导](https://toolbox.http4k.org/project)，以便使用选定的后端、模块和构建工具引导可运行的 http4k 应用程序。 |
| [Javalin](https://javalin.io) | 适用于 Kotlin 和 Java 的极轻量级 Web 框架，支持 WebSocket、HTTP2 和异步请求。 |

## 部署应用程序 {id="deploy-your-applications"}

Kotlin 应用程序可以部署到支持 Java Web 应用程序的任何主机，包括 Amazon Web Services (AWS)、Google Cloud Platform (GCP) 等等。

* **AWS** 提供了专门的 [SDK for Kotlin](https://docs.aws.amazon.com/sdk-for-kotlin/latest/developer-guide/home.html) 与其服务进行交互。对于无服务器部署，您可以参考 [AWS Lambda 的 Kotlin 代码示例](https://docs.aws.amazon.com/sdk-for-kotlin/latest/developer-guide/kotlin_lambda_code_examples.html)。
* **Ktor** 允许您将 Kotlin 应用程序发布到各个云提供商。例如，您可以按照 Ktor 教程详细了解如何部署到 [Google App Engine](https://ktor.io/docs/google-app-engine.html) 及其他服务。
* **Spring** 应用程序也与大多数主流云提供商兼容。请在 [Spring 官方文档](https://docs.spring.io/spring-boot/how-to/deployment/cloud.html)中查看如何将 Spring Boot 应用程序部署到云端。

## 加入社区 {id="join-the-community"}

* ![Slack](slack.svg){width=25}{type="joined"} **Kotlin Slack**：[获取邀请](https://surveys.jetbrains.com/s3/kotlin-slack-sign-up)并加入 [#spring](https://kotlinlang.slack.com/archives/C0B8ZTWE4) 与 [#server](https://kotlinlang.slack.com/archives/C0B8RC352) 频道
* ![Stack Overflow](stackoverflow.svg){width=25}{type="joined"} **Stack Overflow**：关注 ["kotlin"](https://stackoverflow.com/questions/tagged/kotlin)、["spring-kotlin"](https://stackoverflow.com/questions/tagged/spring-kotlin) 或 ["ktor"](https://stackoverflow.com/questions/tagged/ktor) 标签
* ![YouTube](youtube.svg){width=25}{type="joined"} **Kotlin YouTube 频道**：订阅并观看关于 [Kotlin 与 Spring](https://www.youtube.com/playlist?list=PLlFc5cFwUnmxOJL0GSSZ1Vot4KL2Vwe7x) 的视频

## 后续步骤 {id="next-steps"}

* [了解如何使用 Kotlin 和 JUnit 测试 Java Maven 项目](jvm-test-using-junit.md)
* [探索如何使用 Ktor 构建异步服务器应用程序](https://ktor.io/docs/server-create-a-new-project.html)
* [在 Kotlin 后端开发常见问题解答中查找常见问题的解答](jvm-backend-faq.md)