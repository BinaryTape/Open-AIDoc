[//]: # (title: 使用 Spring AI 建立可回答問題的 Kotlin 應用程式 — 教學)
[//]: # (description: 學習如何使用 Kotlin、Spring AI、Spring Boot、OpenAI、Qdrant 和 RAG 建立文件問答應用程式。)

<web-summary>學習如何建立一個使用 Spring AI 回答問題的 Kotlin 應用程式。</web-summary>

在本教學中，你將學習如何建立一個 Kotlin 應用程式，該應用程式透過 [Spring AI](https://spring.io/projects/spring-ai) 連接到 LLM，將文件儲存在向量資料庫中，並使用來自這些文件的內容來回答問題。

在本教學中，你將使用以下工具：

* [Spring Boot](https://spring.io/projects/spring-boot) 作為配置與執行 Web 應用程式的基礎。
* [Spring AI](https://spring.io/projects/spring-ai) 用於與 LLM 互動並執行基於內容的檢索。
* [IntelliJ IDEA](https://www.jetbrains.com/idea/) 用於產生專案並實作應用程式邏輯。
* [Qdrant](https://qdrant.tech/) 作為執行相似性搜尋的向量資料庫。
* [Docker](https://www.docker.com/) 用於在本機執行 Qdrant。
* [OpenAI](https://platform.openai.com) 作為 LLM 提供者。

## 在你開始之前 {id="before-you-start"}

1. 下載並安裝最新版本的 [IntelliJ IDEA](https://www.jetbrains.com/idea/download/) 並使用旗艦版 (Ultimate) 訂閱。

    > 如果你使用的 IntelliJ IDEA 沒有旗艦版訂閱，或者你使用其他 IDE，可以使用[網頁版專案產生器](https://start.spring.io/#!language=kotlin&type=gradle-project-kotlin)產生 Spring Boot 專案。
    >
    {style="tip"}

2. 在 [OpenAI 平台](https://platform.openai.com/api-keys)上建立一個 OpenAI API 金鑰以存取 API。
3. 安裝 [Docker](https://www.docker.com/) 以在本機執行 Qdrant 向量資料庫。
4. 安裝 Docker 後，開啟你的終端並執行以下指令來啟動容器：

    ```bash
    docker run -p 6333:6333 -p 6334:6334 qdrant/qdrant
    ```

## 建立專案 {id="create-the-project"}

> 你也可以使用 [Spring Boot 網頁版專案產生器](https://start.spring.io/) 作為產生專案的替代方案。
>
{style="note"}

在 IntelliJ IDEA 旗艦版中建立一個新的 Spring Boot 專案：

1. 在 IntelliJ IDEA 中，選取 **File** | **New** | **Project**。
2. 在左側面板中，選取 **New Project** | **Spring Boot**。
3. 在 **New Project** 視窗中指定以下欄位與選項：

    * **Name**: springAIDemo
    * **Language**: Kotlin
    * **Type**: Gradle - Kotlin

      > 此選項指定了建置系統與 DSL。
      >
      {style="tip"}

    * **Package name**: org.example.springaidemo
    * **JDK**: Java JDK

      > 本教學使用 **Oracle OpenJDK version 21.0.1**。
      > 如果你尚未安裝 JDK，可以從下拉式清單中下載。
      >
      {style="note"}

    * **Java**: 17

      > 如果你尚未安裝 Java 17，可以從 JDK 下拉式清單中下載。
      >
      {style="tip"}

   ![建立 Spring Boot 專案](create-spring-ai-project.png){width=800}

4. 確保你已指定所有欄位，然後點擊 **Next**。
5. 在 **Spring Boot** 欄位中選取最新的穩定版本。

6. 選取本教學所需的以下相依性：

    * **Web | Spring Web**
    * **AI | OpenAI**
    * **SQL | Qdrant Vector Database**

   ![設定 Spring Boot 專案](spring-ai-dependencies.png){width=800}

7. 點擊 **Create** 以產生並設定專案。

   > IDE 將產生並開啟一個新專案。下載與匯入專案相依性可能需要一些時間。
   >
   {style="tip"}

完成後，你可以在**專案檢視**中看到以下結構：

![Spring Boot 專案檢視](spring-ai-project-view.png){width=400}

產生的 Gradle 專案對應於 Maven 的標準目錄配置：

* `main/kotlin` 資料夾下有用於應用程式的套件與類別。
* 應用程式的進入點是 `SpringAiDemoApplication.kt` 檔案中的 `main()` 方法。

## 更新專案配置 {id="update-the-project-configuration"}

1. 使用以下內容更新你的 `build.gradle.kts` Gradle 建置檔案：

    ```kotlin
    plugins {
        kotlin("jvm") version "%kotlinVersion%"
        kotlin("plugin.spring") version "%kotlinVersion%"
        // 其餘外掛程式
    }
   ```

2. 將 `springAiVersion` 設定為 `2.0.0`：

   ```kotlin
   extra["springAiVersion"] = "2.0.0"
   ```

3. 點擊 **Sync Gradle Changes** 按鈕以同步 Gradle 檔案。
4. 使用以下內容更新你的 `src/main/resources/application.properties` 檔案：

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
   
   > 將你的 OpenAI API 金鑰設定到 `spring.ai.openai.api-key` 屬性中。
   >
   {style="note"}

5. 執行 `SpringAiDemoApplication.kt` 檔案以啟動 Spring Boot 應用程式。
   啟動後，在瀏覽器中開啟 [Qdrant 集合 (collections)](http://localhost:6333/dashboard#/collections) 頁面以查看結果：

   ![Qdrant 集合](qdrant-collections.png){width=700}

## 建立一個控制器來載入與搜尋文件 {id="create-a-controller-to-load-and-search-documents"}

建立一個 Spring `@RestController` 來搜尋文件並將其儲存在 Qdrant 集合中：

1. 在 `src/main/kotlin/org/example/springaidemo` 目錄中，建立一個名為 `KotlinSTDController.kt` 的新檔案，並加入以下程式碼：

    ```kotlin
    package org.example.springaidemo

    // 匯入必要的 Spring 與工具類別
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
            // 從 Kotlin 文件載入文件列表
            val kotlinStdTopics = listOf(
                "collections-overview", "constructing-collections", "iterators", "ranges", "sequences",
                "collection-operations", "collection-transformations", "collection-filtering", "collection-plus-minus",
                "collection-grouping", "collection-parts", "collection-elements", "collection-ordering",
                "collection-aggregate", "collection-write", "list-operations", "set-operations",
                "map-operations", "read-standard-input", "opt-in-requirements", "scope-functions", "time-measurement",
            )
            // 文件的基礎 URL
            val url = "https://raw.githubusercontent.com/JetBrains/kotlin-web-site/refs/heads/master/docs/topics/"
            // 從 URL 檢索每個文件並將其加入向量存儲庫
            kotlinStdTopics.forEach { topic ->
                val data = restTemplate.getForObject("$url$topic.md", String::class.java)
                data?.let { it ->
                    val doc = Document.builder()
                        // 使用隨機 UUID 建立文件
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

2. 更新 `SpringAiDemoApplication.kt` 檔案以宣告一個 `RestTemplate` bean：

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

3. 執行應用程式。
4. 在終端中，向 `/kotlin/load-docs` 端點發送一個 POST 請求以載入文件：

   ```bash
   curl -X POST http://localhost:8080/kotlin/load-docs
   ```

5. 文件載入後，你可以透過 GET 請求搜尋它們：

   ```Bash
   curl -X GET http://localhost:8080/kotlin/docs
   ```

   ![GET 請求結果](spring-ai-get-results.png){width="700"}

> 你也可以在 [Qdrant 集合 (collections)](http://localhost:6333/dashboard#/collections) 頁面查看結果。
>
{style="tip"}

## 實作 AI 聊天端點 {id="implement-an-ai-chat-endpoint"}

文件載入後，最後一步是加入一個端點，透過 Spring AI 的檢索增強生成 (Retrieval-Augmented Generation, RAG) 支援，使用 Qdrant 中的文件來回答問題：

1. 開啟 `KotlinSTDController.kt` 檔案，並匯入以下類別：

   ```kotlin
   import org.springframework.ai.chat.client.ChatClient
   import org.springframework.ai.chat.client.advisor.SimpleLoggerAdvisor
   import org.springframework.ai.chat.client.advisor.vectorstore.QuestionAnswerAdvisor
   import org.springframework.ai.chat.prompt.Prompt
   import org.springframework.ai.chat.prompt.PromptTemplate
   import org.springframework.web.bind.annotation.RequestBody
   ```

2. 定義一個 `ChatRequest` 資料類別：

   ```kotlin
   // 代表聊天查詢的請求負載
   data class ChatRequest(val query: String, val topK: Int = 3)
   ```

3. 將 `ChatClient.Builder` 加入控制器的建構函式參數中：

   ```kotlin
   class KotlinSTDController(
       // 提供用於建立 ChatClient 的產生器
       private val chatClientBuilder: ChatClient.Builder,
   
       private val restTemplate: RestTemplate,
       private val vectorStore: VectorStore,
   )
   ```

4. 在控制器類別內部，建立一個 `ChatClient` 執行個體：

   ```kotlin
   // 使用簡單的記錄建議器 (advisor) 建立聊天用戶端
   private val chatClient = chatClientBuilder.defaultAdvisors(SimpleLoggerAdvisor()).build()
   ```

5. 在 `KotlinSTDController.kt` 檔案底部，加入一個新的 `chatAsk()` 端點，邏輯如下：

   ```kotlin
   @PostMapping("/chat/ask")
   fun chatAsk(@RequestBody request: ChatRequest): String? {
       // 定義帶有占位符號的提示範本
       val promptTemplate = PromptTemplate(
           """
           {query}.
           Please provide a concise answer based on the "Kotlin standard library" documentation.
       """.trimIndent()
       )

       // 透過將占位符號替換為實際值來建立提示 (prompt)
       val prompt: Prompt =
           promptTemplate.create(mapOf("query" to request.query))

       // 配置檢索建議器以使用相關文件增強查詢
       val retrievalAdvisor = QuestionAnswerAdvisor.builder(vectorStore)
           .searchRequest(
               SearchRequest.builder()
                   .similarityThreshold(0.7)
                   .topK(request.topK)
                   .build()
           )
           .promptTemplate(promptTemplate)
           .build()

       // 將提示連同檢索建議器發送到 LLM 並檢索生成的內容
       val response = chatClient.prompt(prompt)
           .advisors(retrievalAdvisor)
           .call()
           .content()
       logger.info("Chat response generated for query: '${request.query}'")
       return response
   }
   ```

6. 執行應用程式。
7. 在終端中，向新端點發送一個 POST 請求以查看結果：

   ```bash
   curl -X POST "http://localhost:8080/kotlin/chat/ask" \
        -H "Content-Type: application/json" \
        -d '{"query": "What are the performance implications of using lazy sequences in Kotlin for large datasets?", "topK": 3}'
   ```

   ![OpenAI 對聊天請求的回答](open-ai-chat-endpoint.png){width="700"}

恭喜！你現在擁有一個可以連接到 OpenAI 並使用從儲存在 Qdrant 中的文件中檢索的內容來回答問題的 Kotlin 應用程式。
嘗試實驗不同的查詢或匯入其他文件以探索更多可能性。

你可以在 [Spring AI demo GitHub 存儲庫](https://github.com/Kotlin/Kotlin-AI-Examples/tree/master/projects/spring-ai/springAI-demo)中查看完成的專案。

## 下一步 {id="what-s-next"}

* 在 [Kotlin AI Examples](https://github.com/Kotlin/Kotlin-AI-Examples/tree/master) 中探索其他 Spring AI 範例
* [使用 Spring Boot 與 Claude 建立一個任務管理器應用程式](spring-boot-claude.md)