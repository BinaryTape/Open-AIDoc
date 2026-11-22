[//]: # (title: Spring AI で質問に応答する Kotlin アプリを作成する — チュートリアル)
<web-summary>Kotlin、Spring AI、Spring Boot、OpenAI、Qdrant、および RAG を使用して、ドキュメント質問応答アプリケーションを構築する方法を学びます。</web-summary>

<web-summary>Spring AI を使用して質問に応答する Kotlin アプリを作成する方法を学びます。</web-summary>

このチュートリアルでは、[Spring AI](https://spring.io/projects/spring-ai) 経由で LLM に接続し、ベクターデータベースにドキュメントを保存し、それらのドキュメントのコンテキストを使用して質問に回答する Kotlin アプリを構築する方法を学びます。

このチュートリアルでは、以下のツールを使用します。

* Web アプリケーションの設定および実行のベースとしての [Spring Boot](https://spring.io/projects/spring-boot)
* LLM との対話およびコンテキストベースの検索を行うための [Spring AI](https://spring.io/projects/spring-ai)
* プロジェクトの生成およびアプリケーションロジックの実装を行うための [IntelliJ IDEA](https://www.jetbrains.com/idea/)
* 類似度検索用のベクターデータベースとしての [Qdrant](https://qdrant.tech/)
* Qdrant をローカルで実行するための [Docker](https://www.docker.com/)
* LLM プロバイダーとしての [OpenAI](https://platform.openai.com)

## 開始する前に {id="before-you-start"}

1. 最新バージョンの [IntelliJ IDEA](https://www.jetbrains.com/idea/download/) をダウンロードしてインストールし、Ultimate サブスクリプションを使用します。

    > Ultimate サブスクリプションのない IntelliJ IDEA を使用している場合や、別の IDE を使用している場合は、[Web ベースのプロジェクトジェネレーター](https://start.spring.io/#!language=kotlin&type=gradle-project-kotlin) を使用して Spring Boot プロジェクトを生成できます。
    >
    {style="tip"}

2. [OpenAI プラットフォーム](https://platform.openai.com/api-keys) で OpenAI API キーを作成し、API へのアクセス権を取得します。
3. Qdrant ベクターデータベースをローカルで実行するために [Docker](https://www.docker.com/) をインストールします。
4. Docker のインストール後、ターミナルを開き、以下のコマンドを実行してコンテナを起動します。

    ```bash
    docker run -p 6333:6333 -p 6334:6334 qdrant/qdrant
    ```

## プロジェクトの作成 {id="create-the-project"}

> 代替手段として、[Spring Boot の Web ベースのプロジェクトジェネレーター](https://start.spring.io/) を使用してプロジェクトを生成することもできます。
>
{style="note"}

Ultimate サブスクリプションが有効な IntelliJ IDEA で、新しい Spring Boot プロジェクトを作成します。

1. IntelliJ IDEA で、**File** | **New** | **Project** を選択します。
2. 左側のパネルで、**New Project** | **Spring Boot** を選択します。
3. **New Project** ウィンドウで以下のフィールドとオプションを指定します。

    * **Name**: springAIDemo
    * **Language**: Kotlin
    * **Type**: Gradle - Kotlin

      > このオプションはビルドシステムと DSL を指定します。
      >
      {style="tip"}

    * **Package name**: org.example.springaidemo
    * **JDK**: Java JDK

      > このチュートリアルでは **Oracle OpenJDK バージョン 21.0.1** を使用します。
      > JDK がインストールされていない場合は、ドロップダウンリストからダウンロードできます。
      >
      {style="note"}

    * **Java**: 17

      > Java 17 がインストールされていない場合は、JDK ドロップダウンリストからダウンロードできます。
      >
      {style="tip"}

   ![Spring Boot プロジェクトの作成](create-spring-ai-project.png){width=800}

4. すべてのフィールドを指定したことを確認し、**Next** をクリックします。
5. **Spring Boot** フィールドで、最新の安定版 Spring Boot バージョンを選択します。

6. このチュートリアルに必要な以下の依存関係を選択します。

    * **Web | Spring Web**
    * **AI | OpenAI**
    * **SQL | Qdrant Vector Database**

   ![Spring Boot プロジェクトのセットアップ](spring-ai-dependencies.png){width=800}

7. **Create** をクリックしてプロジェクトを生成し、セットアップします。

   > IDE が新しいプロジェクトを生成して開きます。プロジェクトの依存関係のダウンロードとインポートには少し時間がかかる場合があります。
   >
   {style="tip"}

この後、**Project** ビューに以下のような構造が表示されます。

![Spring Boot プロジェクトビュー](spring-ai-project-view.png){width=400}

生成された Gradle プロジェクトは、Maven の標準ディレクトリレイアウトに対応しています。

* アプリケーションに属するパッケージとクラスは `main/kotlin` フォルダの下に配置されます。
* アプリケーションのエントリポイントは `SpringAiDemoApplication.kt` ファイルの `main()` メソッドです。

## プロジェクト設定の更新 {id="update-the-project-configuration"}

1. `build.gradle.kts` Gradle ビルドファイルを以下のように更新します。

    ```kotlin
    plugins {
        kotlin("jvm") version "%kotlinVersion%"
        kotlin("plugin.spring") version "%kotlinVersion%"
        // Rest of the plugins
    }
   ```

2. `springAiVersion` を `2.0.0` に設定します。

   ```kotlin
   extra["springAiVersion"] = "2.0.0"
   ```

3. **Sync Gradle Changes** ボタンをクリックして Gradle ファイルを同期します。
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
   
   > `spring.ai.openai.api-key` プロパティにはご自身の OpenAI API キーを設定してください。
   >
   {style="note"}

5. `SpringAiDemoApplication.kt` ファイルを実行して Spring Boot アプリケーションを起動します。
   起動したら、ブラウザで [Qdrant コレクション](http://localhost:6333/dashboard#/collections) ページを開いて結果を確認します。

   ![Qdrant コレクション](qdrant-collections.png){width=700}

## ドキュメントの読み込みと検索を行うコントローラーの作成 {id="create-a-controller-to-load-and-search-documents"}

ドキュメントを検索し、Qdrant コレクションに保存するための Spring `@RestController` を作成します。

1. `src/main/kotlin/org/example/springaidemo` ディレクトリに `KotlinSTDController.kt` という名前の新しいファイルを作成し、以下のコードを追加します。

    ```kotlin
    package org.example.springaidemo

    // 必要な Spring およびユーティリティクラスをインポート
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
            // Kotlin ドキュメントからドキュメントのリストを読み込む
            val kotlinStdTopics = listOf(
                "collections-overview", "constructing-collections", "iterators", "ranges", "sequences",
                "collection-operations", "collection-transformations", "collection-filtering", "collection-plus-minus",
                "collection-grouping", "collection-parts", "collection-elements", "collection-ordering",
                "collection-aggregate", "collection-write", "list-operations", "set-operations",
                "map-operations", "read-standard-input", "opt-in-requirements", "scope-functions", "time-measurement",
            )
            // ドキュメントのベース URL
            val url = "https://raw.githubusercontent.com/JetBrains/kotlin-web-site/refs/heads/master/docs/topics/"
            // 各ドキュメントを URL から取得してベクターストアに追加する
            kotlinStdTopics.forEach { topic ->
                val data = restTemplate.getForObject("$url$topic.md", String::class.java)
                data?.let { it ->
                    val doc = Document.builder()
                        // ランダムな UUID でドキュメントを構築する
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

2. `SpringAiDemoApplication.kt` ファイルを更新して、`RestTemplate` Bean を宣言します。

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
4. ターミナルで `/kotlin/load-docs` エンドポイントに POST リクエストを送信し、ドキュメントを読み込みます。

   ```bash
   curl -X POST http://localhost:8080/kotlin/load-docs
   ```

5. ドキュメントが読み込まれたら、GET リクエストでドキュメントを検索できます。

   ```Bash
   curl -X GET http://localhost:8080/kotlin/docs
   ```

   ![GET リクエストの結果](spring-ai-get-results.png){width="700"}

> 結果は [Qdrant コレクション](http://localhost:6333/dashboard#/collections) ページでも確認できます。
>
{style="tip"}

## AI チャットエンドポイントの実装 {id="implement-an-ai-chat-endpoint"}

ドキュメントが読み込まれたら、最後のステップとして、Spring AI の検索拡張生成 (RAG: Retrieval-Augmented Generation) サポートを通じて Qdrant 内のドキュメントを使用して質問に回答するエンドポイントを追加します。

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
   // チャットクエリのリクエストペイロードを表す
   data class ChatRequest(val query: String, val topK: Int = 3)
   ```

3. コントローラーのコンストラクタパラメータに `ChatClient.Builder` を追加します。

   ```kotlin
   class KotlinSTDController(
       // ChatClient を作成するためのビルダーを提供
       private val chatClientBuilder: ChatClient.Builder,
   
       private val restTemplate: RestTemplate,
       private val vectorStore: VectorStore,
   )
   ```

4. コントローラークラス内に `ChatClient` インスタンスを作成します。

   ```kotlin
   // シンプルなロギングアドバイザーでチャットクライアントを構築
   private val chatClient = chatClientBuilder.defaultAdvisors(SimpleLoggerAdvisor()).build()
   ```

5. `KotlinSTDController.kt` ファイルの末尾に、以下のロジックを持つ新しい `chatAsk()` エンドポイントを追加します。

   ```kotlin
   @PostMapping("/chat/ask")
   fun chatAsk(@RequestBody request: ChatRequest): String? {
       // プレースホルダーを含むプロンプトテンプレートを定義
       val promptTemplate = PromptTemplate(
           """
           {query}.
           Please provide a concise answer based on the "Kotlin standard library" documentation.
       """.trimIndent()
       )

       // プレースホルダーを実際の値に置き換えてプロンプトを作成
       val prompt: Prompt =
           promptTemplate.create(mapOf("query" to request.query))

       // 関連ドキュメントでクエリを拡張するリトリーバルアドバイザーを設定
       val retrievalAdvisor = QuestionAnswerAdvisor.builder(vectorStore)
           .searchRequest(
               SearchRequest.builder()
                   .similarityThreshold(0.7)
                   .topK(request.topK)
                   .build()
           )
           .promptTemplate(promptTemplate)
           .build()

       // リトリーバルアドバイザーと共にプロンプトを LLM に送信し、生成されたコンテンツを取得
       val response = chatClient.prompt(prompt)
           .advisors(retrievalAdvisor)
           .call()
           .content()
       logger.info("Chat response generated for query: '${request.query}'")
       return response
   }
   ```

6. アプリケーションを実行します。
7. ターミナルで、新しいエンドポイントに POST リクエストを送信して結果を確認します。

   ```bash
   curl -X POST "http://localhost:8080/kotlin/chat/ask" \
        -H "Content-Type: application/json" \
        -d '{"query": "What are the performance implications of using lazy sequences in Kotlin for large datasets?", "topK": 3}'
   ```

   ![チャットリクエストに対する OpenAI の回答](open-ai-chat-endpoint.png){width="700"}

これで完了です！OpenAI に接続し、Qdrant に保存されたドキュメントから取得したコンテキストを使用して質問に回答する Kotlin アプリが完成しました。
さまざまなクエリを試したり、他のドキュメントをインポートしたりして、さらなる可能性を探ってみてください。

完成したプロジェクトは、[Spring AI デモの GitHub リポジトリ](https://github.com/Kotlin/Kotlin-AI-Examples/tree/master/projects/spring-ai/springAI-demo) で確認できます。

## 次のステップ {id="what-s-next"}

* [Kotlin AI Examples](https://github.com/Kotlin/Kotlin-AI-Examples/tree/master) で他の Spring AI サンプルを探索する
* [Spring Boot と Claude を使用してタスクマネージャーアプリケーションを作成する](spring-boot-claude.md)