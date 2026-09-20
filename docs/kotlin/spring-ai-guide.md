[//]: # (title: 创建一个使用 Spring AI 回答问题的 Kotlin 应用 — 教程)
[//]: # (description: 了解如何使用 Kotlin、Spring AI、Spring Boot、OpenAI、Qdrant 和 RAG 构建文档问答应用程序。)

<web-summary>学习如何创建一个使用 Spring AI 回答问题的 Kotlin 应用。</web-summary>

在本教程中，您将学习如何构建一个 Kotlin 应用，该应用通过 [Spring AI](https://spring.io/projects/spring-ai) 连接到 LLM，将文档存储在矢量数据库中，并使用这些文档中的上下文来回答问题。

在本教程中，您将使用以下工具：

* [Spring Boot](https://spring.io/projects/spring-boot) 作为配置和运行 Web 应用程序的基础。
* [Spring AI](https://spring.io/projects/spring-ai) 用于与 LLM 交互并执行基于上下文的检索。
* [IntelliJ IDEA](https://www.jetbrains.com/idea/) 用于生成项目并实现应用逻辑。
* [Qdrant](https://qdrant.tech/) 作为用于相似性搜索的矢量数据库。
* [Docker](https://www.docker.com/) 用于在本地运行 Qdrant。
* [OpenAI](https://platform.openai.com) 作为 LLM 提供商。

## 开始之前 {id="before-you-start"}

1. 下载并安装最新版本的 [IntelliJ IDEA](https://www.jetbrains.com/idea/download/) 并使用 Ultimate 订阅。

    > 如果您使用的是不带 Ultimate 订阅的 IntelliJ IDEA 或其他 IDE，可以使用[基于 Web 的项目生成器](https://start.spring.io/#!language=kotlin&type=gradle-project-kotlin)生成 Spring Boot 项目。
    >
    {style="tip"}

2. 在 [OpenAI 平台](https://platform.openai.com/api-keys)上创建 OpenAI API 密钥以访问其 API。
3. 安装 [Docker](https://www.docker.com/) 以在本地运行 Qdrant 矢量数据库。
4. 安装 Docker 后，打开终端并运行以下命令以启动容器：

    ```bash
    docker run -p 6333:6333 -p 6334:6334 qdrant/qdrant
    ```

## 创建项目 {id="create-the-project"}

> 您也可以使用 [Spring Boot 基于 Web 的项目生成器](https://start.spring.io/)作为生成项目的替代方案。
>
{style="note"}

在带有 Ultimate 订阅的 IntelliJ IDEA 中创建一个新的 Spring Boot 项目：

1. 在 IntelliJ IDEA 中，选择 **File** | **New** | **Project**。
2. 在左侧面板中，选择 **New Project** | **Spring Boot**。
3. 在 **New Project** 窗口中指定以下字段和选项：

    * **Name**: springAIDemo
    * **Language**: Kotlin
    * **Type**: Gradle - Kotlin

      > 此选项指定了构建系统和 DSL。
      >
      {style="tip"}

    * **Package name**: org.example.springaidemo
    * **JDK**: Java JDK

      > 本教程使用 **Oracle OpenJDK 21.0.1 版本**。
      > 如果您尚未安装 JDK，可以从下拉列表中下载。
      >
      {style="note"}

    * **Java**: 17

      > 如果您尚未安装 Java 17，可以从 JDK 下拉列表中下载。
      >
      {style="tip"}

   ![创建 Spring Boot 项目](create-spring-ai-project.png){width=800}

4. 确保您已填写所有字段，然后点击 **Next**。
5. 在 **Spring Boot** 字段中选择最新的稳定 Spring Boot 版本。

6. 选择本教程所需的以下依赖项：

    * **Web | Spring Web**
    * **AI | OpenAI**
    * **SQL | Qdrant Vector Database**

   ![设置 Spring Boot 项目](spring-ai-dependencies.png){width=800}

7. 点击 **Create** 以生成并设置项目。

   > IDE 将生成并打开一个新项目。下载和导入项目依赖项可能需要一些时间。
   >
   {style="tip"}

之后，您可以在**项目视图**中看到以下结构：

![Spring Boot 项目视图](spring-ai-project-view.png){width=400}

生成的 Gradle 项目符合 Maven 的标准目录布局：

* `main/kotlin` 文件夹下包含属于应用的软件包和类。
* 应用的入口点是 `SpringAiDemoApplication.kt` 文件中的 `main()` 方法。

## 更新项目配置 {id="update-the-project-configuration"}

1. 使用以下内容更新您的 `build.gradle.kts` Gradle 构建文件：

    ```kotlin
    plugins {
        kotlin("jvm") version "%kotlinVersion%"
        kotlin("plugin.spring") version "%kotlinVersion%"
        // 其余插件
    }
   ```

2. 将 `springAiVersion` 设置为 `2.0.0`：

   ```kotlin
   extra["springAiVersion"] = "2.0.0"
   ```

3. 点击**同步 Gradle 更改**按钮以同步 Gradle 文件。
4. 使用以下内容更新您的 `src/main/resources/application.properties` 文件：

   ```text
   # OpenAI
   spring.ai.openai.api-key=YOUR_OPENAI_API_KEY
   spring.ai.openai.chat.model=gpt-4o-mini
   spring.ai.openai.embedding.model=text-embedding-ada-002
   # Qdrant
   spring.ai.vectorstore.qdrant.host=localhost
   spring.ai.vectorstore.qdrant.port=6334
   spring.ai.vectorstore.qdrant.collection-name=kotlinDocs
   spring.ai.vectorstore.qdrant.initialize-schema=true
   ```
   
   > 将您的 OpenAI API 密钥设置到 `spring.ai.openai.api-key` 属性中。
   >
   {style="note"}

5. 运行 `SpringAiDemoApplication.kt` 文件以启动 Spring Boot 应用程序。
   运行后，在浏览器中打开 [Qdrant 集合](http://localhost:6333/dashboard#/collections)页面以查看结果：

   ![Qdrant 集合](qdrant-collections.png){width=700}

## 创建用于加载和搜索文档的控制器 {id="create-a-controller-to-load-and-search-documents"}

创建一个 Spring `@RestController` 以搜索文档并将其存储在 Qdrant 集合中：

1. 在 `src/main/kotlin/org/example/springaidemo` 目录中，创建一个名为 `KotlinSTDController.kt` 的新文件，并添加以下代码：

    ```kotlin
    package org.example.springaidemo

    // 导入所需的 Spring 和工具类
    import org.slf4j.LoggerFactory
    import org.springframework.ai.document.Document
    import org.springframework.ai.vectorstore.SearchRequest
    import org.springframework.ai.vectorstore.VectorStore
    import org.springframework.web.bind.annotation.GetMapping
    import org.springframework.web.bind.annotation.PostMapping
    import org.springframework.web.bind.annotation.RequestMapping
    import org.springframework.web.bind.annotation.RequestParam
    import org.springframework.web.bind.annotation.RestController
    import org.springframework.web.client.RestTemplate
    import kotlin.uuid.ExperimentalUuidApi
    import kotlin.uuid.Uuid

    @RestController
    @RequestMapping("/kotlin")
    class KotlinSTDController(
        private val restTemplate: RestTemplate,
        private val vectorStore: VectorStore,
    ) {
        private val logger = LoggerFactory.getLogger(this::class.java)

        @OptIn(ExperimentalUuidApi::class)
        @PostMapping("/load-docs")
        fun load() {
            // 从 Kotlin 文档加载主题列表
            val kotlinStdTopics = listOf(
                "collections-overview", "constructing-collections", "iterators", "ranges", "sequences",
                "collection-operations", "collection-transformations", "collection-filtering", "collection-plus-minus",
                "collection-grouping", "collection-parts", "collection-elements", "collection-ordering",
                "collection-aggregate", "collection-write", "list-operations", "set-operations",
                "map-operations", "read-standard-input", "opt-in-requirements", "scope-functions", "time-measurement",
            )
            // 文档的基础 URL
            val url = "https://raw.githubusercontent.com/JetBrains/kotlin-web-site/refs/heads/master/docs/topics/"
            // 从 URL 获取每个文档并将其添加到矢量存储中
            kotlinStdTopics.forEach { topic ->
                val data = restTemplate.getForObject("$url$topic.md", String::class.java)
                data?.let { it ->
                    val doc = Document.builder()
                        // 构建一个带有随机 UUID 的文档
                        .id(Uuid.random().toString())
                        .text(it)
                        .metadata("topic", topic)
                        .build()
                    vectorStore.add(listOf(doc))
                    logger.info("Document $topic loaded.")
                } ?: logger.warn("Failed to load document for topic: $topic")
            }
        }

        @GetMapping("docs")
        fun query(
            @RequestParam query: String = "operations, filtering, and transformations",
            @RequestParam topK: Int = 2
        ): List<Document>? {
            val searchRequest = SearchRequest.builder()
                .query(query)
                .topK(topK)
                .build()
            val results = vectorStore.similaritySearch(searchRequest)
            logger.info("Found ${results?.size ?: 0} documents for query: '$query'")
            return results
        }
    }
    ```
   {collapsible="true"}

2. 更新 `SpringAiDemoApplication.kt` 文件以声明一个 `RestTemplate` bean：

   ```kotlin
   package org.example.springaidemo

   import org.springframework.boot.autoconfigure.SpringBootApplication
   import org.springframework.boot.runApplication
   import org.springframework.context.annotation.Bean
   import org.springframework.web.client.RestTemplate

   @SpringBootApplication
   class SpringAiDemoApplication {
       @Bean
       fun restTemplate(): RestTemplate = RestTemplate()
   }

   fun main(args: Array<String>) {
       runApplication<SpringAiDemoApplication>(*args)
   }
   ```
   {collapsible="true"}

3. 运行应用程序。
4. 在终端中，向 `/kotlin/load-docs` 端点发送 POST 请求以加载文档：

   ```bash
   curl -X POST http://localhost:8080/kotlin/load-docs
   ```

5. 文档加载完成后，您可以通过 GET 请求搜索它们：

   ```Bash
   curl -X GET http://localhost:8080/kotlin/docs
   ```

   ![GET 请求结果](spring-ai-get-results.png){width="700"}

> 您也可以在 [Qdrant 集合](http://localhost:6333/dashboard#/collections)页面上查看结果。
>
{style="tip"}

## 实现 AI 聊天端点 {id="implement-an-ai-chat-endpoint"}

文档加载完成后，最后一步是添加一个端点，通过 Spring AI 的检索增强生成 (RAG) 支持，利用 Qdrant 中的文档回答问题：

1. 打开 `KotlinSTDController.kt` 文件，并导入以下类：

   ```kotlin
   import org.springframework.ai.chat.client.ChatClient
   import org.springframework.ai.chat.client.advisor.SimpleLoggerAdvisor
   import org.springframework.ai.chat.client.advisor.vectorstore.QuestionAnswerAdvisor
   import org.springframework.ai.chat.prompt.Prompt
   import org.springframework.ai.chat.prompt.PromptTemplate
   import org.springframework.web.bind.annotation.RequestBody
   ```

2. 定义一个 `ChatRequest` 数据类：

   ```kotlin
   // 表示聊天查询的请求有效负载
   data class ChatRequest(val query: String, val topK: Int = 3)
   ```

3. 将 `ChatClient.Builder` 添加到控制器的构造函数参数中：

   ```kotlin
   class KotlinSTDController(
       // 提供用于创建 ChatClient 的构建器
       private val chatClientBuilder: ChatClient.Builder,
   
       private val restTemplate: RestTemplate,
       private val vectorStore: VectorStore,
   )
   ```

4. 在控制器类内部，创建一个 `ChatClient` 实例：

   ```kotlin
   // 使用简单的日志 Advisor 构建聊天客户端
   private val chatClient = chatClientBuilder.defaultAdvisors(SimpleLoggerAdvisor()).build()
   ```

5. 在 `KotlinSTDController.kt` 文件的底部，添加一个新的 `chatAsk()` 端点，逻辑如下：

   ```kotlin
   @PostMapping("/chat/ask")
   fun chatAsk(@RequestBody request: ChatRequest): String? {
       // 定义带有占位符的提示模板
       val promptTemplate = PromptTemplate(
           """
           {query}.
           请基于 “Kotlin 标准库” 文档提供简洁的回答。
       """.trimIndent()
       )

       // 通过将占位符替换为实际值来创建提示
       val prompt: Prompt =
           promptTemplate.create(mapOf("query" to request.query))

       // 配置检索 Advisor，使用相关文档增强查询
       val retrievalAdvisor = QuestionAnswerAdvisor.builder(vectorStore)
           .searchRequest(
               SearchRequest.builder()
                   .similarityThreshold(0.7)
                   .topK(request.topK)
                   .build()
           )
           .promptTemplate(promptTemplate)
           .build()

       // 将带有检索 Advisor 的提示发送到 LLM 并检索生成的内容
       val response = chatClient.prompt(prompt)
           .advisors(retrievalAdvisor)
           .call()
           .content()
       logger.info("Chat response generated for query: '${request.query}'")
       return response
   }
   ```

6. 运行应用程序。
7. 在终端中，向新端点发送 POST 请求以查看结果：

   ```bash
   curl -X POST "http://localhost:8080/kotlin/chat/ask" \
        -H "Content-Type: application/json" \
        -d '{"query": "在 Kotlin 中对大型数据集使用延迟序列有哪些性能影响？", "topK": 3}'
   ```

   ![OpenAI 对聊天请求的回答](open-ai-chat-endpoint.png){width="700"}

恭喜！您现在拥有了一个可以连接到 OpenAI 并使用从存储在 Qdrant 中的文档检索到的上下文来回答问题的 Kotlin 应用。
尝试尝试不同的查询或导入其他文档以探索更多可能性。

您可以在 [Spring AI demo GitHub 仓库](https://github.com/Kotlin/Kotlin-AI-Examples/tree/master/projects/spring-ai/springAI-demo)中查看完整的项目。

## 后续步骤 {id="what-s-next"}

* 在 [Kotlin AI Examples](https://github.com/Kotlin/Kotlin-AI-Examples/tree/master) 中探索更多 Spring AI 示例
* [使用 Spring Boot 和 Claude 创建任务管理器应用程序](spring-boot-claude.md)