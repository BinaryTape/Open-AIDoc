[//]: # (title: Spring AIを使用して質問に答えるKotlinアプリを作成する — チュートリアル)
[//]: # (description: Kotlin、Spring AI、Spring Boot、OpenAI、Qdrant、およびRAGを使用してドキュメント質問応答アプリケーションを構築する方法を学びます。)

<web-summary>Spring AIを使用して質問に答えるKotlinアプリを作成する方法を学びます。</web-summary>

このチュートリアルでは、[Spring AI](https://spring.io/projects/spring-ai)を介してLLMに接続し、ベクトルデータベースにドキュメントを保存して、それらのドキュメントのコンテキストを使用して質問に答えるKotlinアプリを構築する方法を学びます。

このチュートリアルでは、以下のツールを使用します。

* Webアプリケーションを構成および実行するためのベースとして [Spring Boot](https://spring.io/projects/spring-boot) を使用。
* LLMとのやり取りおよびコンテキストに基づく検索を行うために [Spring AI](https://spring.io/projects/spring-ai) を使用。
* プロジェクトの生成およびアプリケーションロジックの実装に [IntelliJ IDEA](https://www.jetbrains.com/idea/) を使用。
* 類似性検索のためのベクトルデータベースとして [Qdrant](https://qdrant.tech/) を使用。
* Qdrantをローカルで実行するために [Docker](https://www.docker.com/) を使用。
* LLMプロバイダーとして [OpenAI](https://platform.openai.com) を使用。

## 始める前に {id="before-you-start"}

1. [IntelliJ IDEA](https://www.jetbrains.com/idea/download/)の最新バージョンをダウンロードしてインストールし、Ultimateサブスクリプションを使用してください。

    > IntelliJ IDEA Ultimateサブスクリプションを使用していない場合、または別のIDEを使用している場合は、[Webベースのプロジェクトジェネレーター](https://start.spring.io/#!language=kotlin&type=gradle-project-kotlin)を使用してSpring Bootプロジェクトを生成できます。
    >
    {style="tip"}

2. APIにアクセスするために、[OpenAIプラットフォーム](https://platform.openai.com/api-keys)でOpenAI APIキーを作成してください。
3. Qdrantベクトルデータベースをローカルで実行するために [Docker](https://www.docker.com/) をインストールしてください。
4. Dockerをインストールした後、ターミナルを開き、次のコマンドを実行してコンテナを起動します。

    ```bash
    docker run -p 6333:6333 -p 6334:6334 qdrant/qdrant
    ```

## プロジェクトの作成 {id="create-the-project"}

> プロジェクトを生成する別の方法として、[Spring Boot Webベースプロジェクトジェネレーター](https://start.spring.io/)を使用することもできます。
>
{style="note"}

IntelliJ IDEA Ultimateサブスクリプションで新しいSpring Bootプロジェクトを作成します。

1. IntelliJ IDEAで、**File** | **New** | **Project** を選択します。
2. 左側のパネルで、**New Project** | **Spring Boot** を選択します。
3. **New Project** ウィンドウで以下のフィールドとオプションを指定します。

    * **Name**: springAIDemo
    * **Language**: Kotlin
    * **Type**: Gradle - Kotlin

      > このオプションは、ビルドシステムとDSLを指定します。
      >
      {style="tip"}

    * **Package name**: org.example.springaidemo
    * **JDK**: Java JDK

      > このチュートリアルでは **Oracle OpenJDK version 21.0.1** を使用しています。
      > JDKがインストールされていない場合は、ドロップダウンリストからダウンロードできます。
      >
      {style="note"}

    * **Java**: 17

      > Java 17がインストールされていない場合は、JDKドロップダウンリストからダウンロードできます。
      >
      {style="tip"}

   ![Create Spring Boot project](create-spring-ai-project.png){width=800}

4. すべてのフィールドを指定したことを確認し、**Next** をクリックします。
5. **Spring Boot** フィールドで最新の安定したSpring Bootバージョンを選択します。

6. このチュートリアルに必要な以下の依存関係を選択します。

    * **Web | Spring Web**
    * **AI | OpenAI**
    * **SQL | Qdrant Vector Database**

   ![Set up Spring Boot project](spring-ai-dependencies.png){width=800}

7. **Create** をクリックしてプロジェクトを生成し、セットアップします。

   > IDEが新しいプロジェクトを生成して開きます。プロジェクトの依存関係のダウンロードとインポートには時間がかかる場合があります。
   >
   {style="tip"}

その後、**Projectビュー**に以下の構造が表示されます。

![Spring Boot project view](spring-ai-project-view.png){width=400}

生成されたGradleプロジェクトは、Mavenの標準ディレクトリレイアウトに対応しています。

* `main/kotlin` フォルダの下に、アプリケーションに属するパッケージとクラスがあります。
* アプリケーションの開始点は、`SpringAiDemoApplication.kt` ファイルの `main()` メソッドです。

## プロジェクト構成の更新 {id="update-the-project-configuration"}

1. `build.gradle.kts` Gradleビルドファイルを以下のように更新します。

    ```kotlin
    plugins {
        kotlin("jvm") version "%kotlinVersion%"
        kotlin("plugin.spring") version "%kotlinVersion%"
        // 残りのプラグイン
    }
   ```

2. `springAiVersion` を `2.0.0` に設定します。

   ```kotlin
   extra["springAiVersion"] = "2.0.0"
   ```

3. **Sync Gradle Changes** ボタンをクリックして、Gradleファイルを同期します。
4. `src/main/resources/application.properties` ファイルを以下のように更新します。

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
   
   > `spring.ai.openai.api-key` プロパティにOpenAI APIキーを設定してください。
   >
   {style="note"}

5. `SpringAiDemoApplication.kt` ファイルを実行してSpring Bootアプリケーションを起動します。
   起動したら、ブラウザで [Qdrant collections](http://localhost:6333/dashboard#/collections) ページを開いて結果を確認します。

   ![Qdrant collections](qdrant-collections.png){width=700}

## ドキュメントをロードおよび検索するためのコントローラーの作成 {id="create-a-controller-to-load-and-search-documents"}

ドキュメントを検索し、Qdrantコレクションに保存するためのSpring `@RestController` を作成します。

1. `src/main/kotlin/org/example/springaidemo` ディレクトリに `KotlinSTDController.kt` という名前の新しいファイルを作成し、以下のコードを追加します。

    ```kotlin
    package org.example.springaidemo

    // 必要なSpringおよびユーティリティクラスをインポートします
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
            // Kotlinドキュメントからドキュメントのリストをロードします
            val kotlinStdTopics = listOf(
                "collections-overview", "constructing-collections", "iterators", "ranges", "sequences",
                "collection-operations", "collection-transformations", "collection-filtering", "collection-plus-minus",
                "collection-grouping", "collection-parts", "collection-elements", "collection-ordering",
                "collection-aggregate", "collection-write", "list-operations", "set-operations",
                "map-operations", "read-standard-input", "opt-in-requirements", "scope-functions", "time-measurement",
            )
            // ドキュメントのベースURL
            val url = "https://raw.githubusercontent.com/JetBrains/kotlin-web-site/refs/heads/master/docs/topics/"
            // URLから各ドキュメントを取得し、ベクトルストアに追加します
            kotlinStdTopics.forEach { topic ->
                val data = restTemplate.getForObject("$url$topic.md", String::class.java)
                data?.let { it ->
                    val doc = Document.builder()
                        // ランダムなUUIDでドキュメントを構築します
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

2. `SpringAiDemoApplication.kt` ファイルを更新して、`RestTemplate` ビーンを宣言します。

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

3. アプリケーションを実行します。
4. ターミナルで、ドキュメントをロードするために `/kotlin/load-docs` エンドポイントにPOSTリクエストを送信します。

   ```bash
   curl -X POST http://localhost:8080/kotlin/load-docs
   ```

5. ドキュメントがロードされたら、GETリクエストで検索できます。

   ```Bash
   curl -X GET http://localhost:8080/kotlin/docs
   ```

   ![GET request results](spring-ai-get-results.png){width="700"}

> 結果は [Qdrant collections](http://localhost:6333/dashboard#/collections) ページでも確認できます。
>
{style="tip"}

## AIチャットエンドポイントの実装 {id="implement-an-ai-chat-endpoint"}

ドキュメントがロードされたら、最後のステップは、Spring AIの検索拡張生成 (Retrieval-Augmented Generation: RAG) サポートを通じてQdrant内のドキュメントを使用して質問に答えるエンドポイントを追加することです。

1. `KotlinSTDController.kt` ファイルを開き、以下のクラスをインポートします。

   ```kotlin
   import org.springframework.ai.chat.client.ChatClient
   import org.springframework.ai.chat.client.advisor.SimpleLoggerAdvisor
   import org.springframework.ai.chat.client.advisor.vectorstore.QuestionAnswerAdvisor
   import org.springframework.ai.chat.prompt.Prompt
   import org.springframework.ai.chat.prompt.PromptTemplate
   import org.springframework.web.bind.annotation.RequestBody
   ```

2. `ChatRequest` データクラスを定義します。

   ```kotlin
   // チャットクエリのリクエストペイロードを表します
   data class ChatRequest(val query: String, val topK: Int = 3)
   ```

3. コントローラーのコンストラクタパラメータに `ChatClient.Builder` を追加します。

   ```kotlin
   class KotlinSTDController(
       // ChatClientを作成するためのビルダーを提供します
       private val chatClientBuilder: ChatClient.Builder,
   
       private val restTemplate: RestTemplate,
       private val vectorStore: VectorStore,
   )
   ```

4. コントローラークラス内で、`ChatClient` インスタンスを作成します。

   ```kotlin
   // シンプルなロギングアドバイザーを使用してチャットクライアントを構築します
   private val chatClient = chatClientBuilder.defaultAdvisors(SimpleLoggerAdvisor()).build()
   ```

5. `KotlinSTDController.kt` ファイルの最後に、以下のロジックで新しい `chatAsk()` エンドポイントを追加します。

   ```kotlin
   @PostMapping("/chat/ask")
   fun chatAsk(@RequestBody request: ChatRequest): String? {
       // プレースホルダーを使用してプロンプトテンプレートを定義します
       val promptTemplate = PromptTemplate(
           """
           {query}.
           Please provide a concise answer based on the "Kotlin standard library" documentation.
       """.trimIndent()
       )

       // プレースホルダーを実際の値で置き換えてプロンプトを作成します
       val prompt: Prompt =
           promptTemplate.create(mapOf("query" to request.query))

       // クエリを関連ドキュメントで拡張するための検索アドバイザーを構成します
       val retrievalAdvisor = QuestionAnswerAdvisor.builder(vectorStore)
           .searchRequest(
               SearchRequest.builder()
                   .similarityThreshold(0.7)
                   .topK(request.topK)
                   .build()
           )
           .promptTemplate(promptTemplate)
           .build()

       // 検索アドバイザーと共にプロンプトをLLMに送信し、生成されたコンテンツを取得します
       val response = chatClient.prompt(prompt)
           .advisors(retrievalAdvisor)
           .call()
           .content()
       logger.info("Chat response generated for query: '${request.query}'")
       return response
   }
   ```

6. アプリケーションを実行します。
7. ターミナルで、新しいエンドポイントにPOSTリクエストを送信して結果を確認します。

   ```bash
   curl -X POST "http://localhost:8080/kotlin/chat/ask" \
        -H "Content-Type: application/json" \
        -d '{"query": "What are the performance implications of using lazy sequences in Kotlin for large datasets?", "topK": 3}'
   ```

   ![OpenAI answer to chat request](open-ai-chat-endpoint.png){width="700"}

おめでとうございます！これで、OpenAIに接続し、Qdrantに保存されたドキュメントから取得したコンテキストを使用して質問に答えるKotlinアプリが完成しました。
別のクエリを試したり、他のドキュメントをインポートしたりして、さらなる可能性を探ってみてください。

完成したプロジェクトは、[Spring AI demo GitHubリポジトリ](https://github.com/Kotlin/Kotlin-AI-Examples/tree/master/projects/spring-ai/springAI-demo)で確認できます。

## 次のステップ {id="what-s-next"}

* [Kotlin AI Examples](https://github.com/Kotlin/Kotlin-AI-Examples/tree/master) で他のSpring AIの例を探索する
* [Spring BootとClaudeを使用したタスク管理アプリケーションの作成](spring-boot-claude.md)