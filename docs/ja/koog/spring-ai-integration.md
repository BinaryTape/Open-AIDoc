# Spring AIとの統合

Koogは、Spring AIの抽象化とKoogエージェントフレームワークを橋渡しするSpring AI統合スターターを提供します。
モデルアクセス、メモリ、またはベクトルストレージにすでにSpring AIを使用している場合、これらのスターターを使用することで、既存のSpring AI設定を置き換えることなく、その上にKoogを組み込むことができます。

## `koog-spring-boot-starter` との違い

| | `koog-spring-boot-starter` | `koog-spring-ai` スターター |
|---|---|---|
| **LLMトランスポート** | Koog独自のHTTPクライアント | `ChatModel` や `EmbeddingModel` などのSpring AI Beanに委譲 |
| **設定** | プロバイダーごとの `ai.koog.*` プロパティ | Spring AIスターターによって管理される標準的な `spring.ai.*` プロパティと、`koog.spring.ai.*` アダプタープロパティ |
| **利用シーン** | Koogにモデルの接続性を直接管理させたい場合 | すでにSpring AIを使用しており、その上でKoogのエージェント、メモリ、またはRAGを利用したい場合 |

どちらのアプローチも独立しています。
直接的なKoogスターターのアプローチについては、[Spring Boot統合](spring-boot.md)を参照してください。

## 利用可能なスターター

| モジュール | 目的 |
|---|---|
| `koog-spring-ai-starter-model-chat` | Spring AIの `ChatModel`（およびオプションの `ModerationModel`）をKoogの `LLMClient` および `PromptExecutor` に適合させます |
| `koog-spring-ai-starter-model-embedding` | Spring AIの `EmbeddingModel` をKoogの `LLMEmbeddingProvider` に適合させます |
| `koog-spring-ai-starter-chat-memory` | Spring AIの `ChatMemoryRepository` をKoogの `ChatHistoryProvider` に適合させます |
| `koog-spring-ai-starter-vector-store` | Spring AIの `VectorStore` を、インジェクション、検索、および削除用のKoog `KoogVectorStore` に適合させます |

各スターターは、独自の自動構成と設定プロパティを備えた独立したSpring Bootスターターです。
1つのスターターのみを使用することも、同じアプリケーション内で複数のスターターを組み合わせることも可能です。

## ディスパッチャーのタイプ (Dispatcher Types)

4つのスターターすべてが、同じディスパッチャー構成パターンをサポートしています。

- **`AUTO`** (デフォルト): 利用可能な場合はSpring管理の `AsyncTaskExecutor` を使用し、そうでない場合は `Dispatchers.IO` にフォールバックします。
- **`IO`**: 常に `Dispatchers.IO` を使用します。
- **`dispatcher.parallelism`**: `0` より大きく、かつ `type=IO` の場合、`Dispatchers.IO.limitedParallelism(parallelism)` を使用します。

通常、特にSpring Bootの仮想スレッド（Virtual threads）を使用している場合は、`AUTO` が最もシンプルな選択肢です。

## チャットモデルスターター (Chat Model Starter)

### 概要

`koog-spring-ai-starter-model-chat` スターターは、Spring AIのチャットモデル抽象化とKoogエージェントフレームワークを橋渡しします。
以下の内容を自動構成します：

- Spring AIの `ChatModel` に委譲する Koog の `LLMClient` (`SpringAiLLMClient`)
- 利用可能なすべての `LLMClient` Beanから組み立てられた `PromptExecutor` (`MultiLLMPromptExecutor`)

ツールは常にKoogエージェントフレームワークによって実行されます。
Spring AIはツールの定義とスキーマのみを受け取り、`internalToolExecutionEnabled` は `false` に設定されます。

### 依存関係の追加

任意のSpring AIチャットモデルスターターと一緒に依存関係を追加します：

=== "Gradle (Kotlin DSL)"

    ```kotlin
    dependencies {
        implementation("ai.koog:koog-agents-jvm:$koogVersion")
        implementation("ai.koog:koog-spring-ai-starter-model-chat:$koogVersion")
        implementation("org.springframework.ai:spring-ai-starter-model-openai")
    }
    ```

=== "Maven"

    ```xml
    <dependencies>
        <dependency>
            <groupId>ai.koog</groupId>
            <artifactId>koog-agents-jvm</artifactId>
            <version>${koog.version}</version>
        </dependency>
        <dependency>
            <groupId>ai.koog</groupId>
            <artifactId>koog-spring-ai-starter-model-chat</artifactId>
            <version>${koog.version}</version>
        </dependency>
        <dependency>
            <groupId>org.springframework.ai</groupId>
            <artifactId>spring-ai-starter-model-openai</artifactId>
        </dependency>
    </dependencies>
    ```

### 利用可能なプロバイダー

このスターターは、Spring AIが `ChatModel` を作成するすべてのプロバイダーで動作します。これには以下が含まれます：
Anthropic, Azure OpenAI, Bedrock Converse, DeepSeek, Google GenAI, HuggingFace, MiniMax, Mistral AI, OCI GenAI, Ollama, OpenAI, Vertex AI, ZhiPu AI。

### 設定

対応するSpring AIスターターを介してプロバイダーを構成し、必要に応じてKoogのプロパティを追加します：

```properties
# Spring AI プロバイダー設定の例
spring.ai.openai.api-key=${OPENAI_API_KEY}

# Koog チャットスターターのデフォルト値
koog.spring.ai.chat.enabled=true
koog.spring.ai.chat.dispatcher.type=AUTO
```

単一の `ChatModel` Beanが存在する場合、すべてが自動的に動作します。
アダプターがそれをKoogの `LLMClient` でラップし、すぐに使用可能な `PromptExecutor` を作成します。

### 使用例

`PromptExecutor` をインジェクトし、それを使用してKoogエージェントを実行します：

=== "Kotlin"

    ```kotlin
    import ai.koog.agents.core.agent.AIAgent
    import ai.koog.prompt.executor.clients.openai.OpenAIModels
    import ai.koog.prompt.executor.model.PromptExecutor
    import org.springframework.stereotype.Service

    @Service
    class MyAgentService(private val promptExecutor: PromptExecutor) {

        suspend fun askAgent(userMessage: String): String {
            val agent = AIAgent(
                promptExecutor = promptExecutor,
                llmModel = OpenAIModels.Chat.GPT5Nano,
                systemPrompt = "You are a helpful assistant."
            )

            return agent.run(userMessage)
        }
    }
    ```

=== "Java"

    ```java
    import ai.koog.agents.core.agent.AIAgent;
    import ai.koog.prompt.executor.clients.openai.OpenAIModels;
    import ai.koog.prompt.executor.model.PromptExecutor;
    import org.springframework.stereotype.Service;

    @Service
    public class MyAgentService {
        private final PromptExecutor promptExecutor;

        public MyAgentService(PromptExecutor promptExecutor) {
            this.promptExecutor = promptExecutor;
        }

        public String askAgent(String userMessage) {
            var agent = AIAgent.builder()
                    .promptExecutor(promptExecutor)
                    .llmModel(OpenAIModels.Chat.GPT5Nano)
                    .systemPrompt("You are a helpful assistant.")
                    .build();

            return agent.run(userMessage);
        }
    }
    ```

または、独自の `PromptExecutor` Beanを提供して、自動構成されたものを完全に上書きすることもできます。

### 設定プロパティ (`koog.spring.ai.chat`)

| プロパティ | 型 | デフォルト値 | 説明 |
|---|---|---|---|
| `enabled` | `Boolean` | `true` | チャットの自動構成を有効または無効にします |
| `chat-model-bean-name` | `String?` | `null` | 複数のモデルが存在する場合に使用する `ChatModel` の Bean 名 |
| `moderation-model-bean-name` | `String?` | `null` | 使用する `ModerationModel` の Bean 名 |
| `provider` | `String?` | `null` | `ChatModel` クラスから自動検出する代わりに公開するKoogプロバイダーID |
| `dispatcher.type` | `AUTO` / `IO` | `AUTO` | ブロッキングモデル呼び出し用のディスパッチャー |
| `dispatcher.parallelism` | `Int` | `0` (= 無制限) | `IO` ディスパッチャーの最大並行数 |

### マルチモデルコンテキスト

複数の `ChatModel` または `ModerationModel` Beanが登録されている場合は、使用するものを指定します：

```properties
koog.spring.ai.chat.chat-model-bean-name=openAiChatModel
koog.spring.ai.chat.moderation-model-bean-name=openAiModerationModel
```

セレクターがない場合、自動構成は候補が1つだけ存在する場合にのみ有効になります。

### 拡張ポイント

- **`ChatOptionsCustomizer`**: `ChatOptions` をカスタマイズするために、このインターフェースを実装したSpring Beanを登録します。

=== "Kotlin"

    ```kotlin
    @Bean
    fun chatOptionsCustomizer() = ChatOptionsCustomizer { options, params, model ->
        options
    }
    ```

=== "Java"

    ```java
    @Bean
    public ChatOptionsCustomizer chatOptionsCustomizer() {
        return (options, params, model) -> options;
    }
    ```

- **カスタム `LLMClient`**: 独自の `LLMClient` Beanを登録します。`springAiChatModelLLMClient` という名前のBeanを置き換えない限り、自動構成されたアダプターと一緒に構成されます。
- **カスタム `PromptExecutor`**: 独自の `PromptExecutor` Beanを登録して、自動構成された `MultiLLMPromptExecutor` を上書きします。

## エンベディングモデルスターター (Embedding Model Starter)

### 概要

`koog-spring-ai-starter-model-embedding` スターターは、Spring AIのエンベディングモデル抽象化とKoogエージェントフレームワークを橋渡しします。
以下の内容を自動構成します：

- Spring AIの `EmbeddingModel` に委譲する Koog の `LLMEmbeddingProvider` (`SpringAiLLMEmbeddingProvider`)

アダプターはKoogのモデルIDをSpring AIの `EmbeddingOptions` に転送するため、実行時のモデル選択をサポートするバックエンドはそれを尊重できます。

### 依存関係の追加

任意のSpring AIエンベディングモデルスターターと一緒に依存関係を追加します：

=== "Gradle (Kotlin DSL)"

    ```kotlin
    dependencies {
        implementation("ai.koog:koog-agents-jvm:$koogVersion")
        implementation("ai.koog:koog-spring-ai-starter-model-embedding:$koogVersion")
        implementation("org.springframework.ai:spring-ai-starter-model-openai")
    }
    ```

=== "Maven"

    ```xml
    <dependencies>
        <dependency>
            <groupId>ai.koog</groupId>
            <artifactId>koog-agents-jvm</artifactId>
            <version>${koog.version}</version>
        </dependency>
        <dependency>
            <groupId>ai.koog</groupId>
            <artifactId>koog-spring-ai-starter-model-embedding</artifactId>
            <version>${koog.version}</version>
        </dependency>
        <dependency>
            <groupId>org.springframework.ai</groupId>
            <artifactId>spring-ai-starter-model-openai</artifactId>
        </dependency>
    </dependencies>
    ```

### 利用可能なプロバイダー

このスターターは、Spring AIが `EmbeddingModel` を作成するすべてのプロバイダーで動作します。これには以下が含まれます：
Anthropic, Azure OpenAI, Bedrock, Google GenAI, HuggingFace, Mistral AI, OCI GenAI, Ollama, OpenAI, Transformers, Vertex AI, ZhiPu AI。

### 設定

Spring AIを介してエンベディングプロバイダーを構成し、必要に応じてKoogのプロパティを追加します：

```properties
# Spring AI プロバイダー設定の例
spring.ai.openai.api-key=${OPENAI_API_KEY}

# Koog エンベディングスターターのデフォルト値
koog.spring.ai.embedding.enabled=true
koog.spring.ai.embedding.dispatcher.type=AUTO
```

単一の `EmbeddingModel` Beanが存在する場合、すべてが自動的に動作します。
アダプターがそれをKoogの `LLMEmbeddingProvider` でラップします。

### 使用例

`LLMEmbeddingProvider` をインジェクトし、エンベディング操作に使用します：

=== "Kotlin"

    ```kotlin
    import ai.koog.prompt.executor.clients.LLMEmbeddingProvider
    import ai.koog.prompt.executor.clients.openai.OpenAIModels
    import org.springframework.stereotype.Service

    @Service
    class MyEmbeddingService(private val embeddingProvider: LLMEmbeddingProvider) {

        suspend fun getEmbedding(text: String): `List<Double>` {
            return embeddingProvider.embed(
                text,
                OpenAIModels.Embeddings.TextEmbedding3Small
            )
        }
    }
    ```

=== "Java"

    ```java
    import ai.koog.prompt.executor.clients.LLMEmbeddingProvider;
    import ai.koog.prompt.executor.clients.openai.OpenAIModels;
    import org.springframework.stereotype.Service;
    import java.util.List;

    @Service
    public class MyEmbeddingService {
        private final LLMEmbeddingProvider embeddingProvider;

        public MyEmbeddingService(LLMEmbeddingProvider embeddingProvider) {
            this.embeddingProvider = embeddingProvider;
        }

        public `List<Double>` getEmbedding(String text) {
            return embeddingProvider.embed(
                    text,
                    OpenAIModels.Embeddings.TextEmbedding3Small
            );
        }
    }
    ```

または、独自の `LLMEmbeddingProvider` Beanを提供して、自動構成されたアダプターを完全に上書きすることもできます。

### 設定プロパティ (`koog.spring.ai.embedding`)

| プロパティ | 型 | デフォルト値 | 説明 |
|---|---|---|---|
| `enabled` | `Boolean` | `true` | エンベディングの自動構成を有効または無効にします |
| `embedding-model-bean-name` | `String?` | `null` | 複数のモデルが存在する場合に使用する `EmbeddingModel` の Bean 名 |
| `dispatcher.type` | `AUTO` / `IO` | `AUTO` | ブロッキングエンベディング呼び出し用のディスパッチャー |
| `dispatcher.parallelism` | `Int` | `0` (= 無制限) | `IO` ディスパッチャーの最大並行数 |

### マルチモデルコンテキスト

複数の `EmbeddingModel` Beanが登録されている場合は、使用するものを指定します：

```properties
koog.spring.ai.embedding.embedding-model-bean-name=openAiEmbeddingModel
```

セレクターがない場合、自動構成は候補が1つだけ存在する場合にのみ有効になります。

### 拡張ポイント

- **カスタム `LLMEmbeddingProvider`**: 独自のBeanを登録して、自動構成されたアダプターを完全に上書きします。

## チャットメモリスターター (Chat Memory Starter)

### 概要

`koog-spring-ai-starter-chat-memory` スターターは、Spring AIのチャットメモリ抽象化とKoogエージェントフレームワークを橋渡しします。
以下の内容を自動構成します：

- Spring AIの `ChatMemoryRepository` に委譲する Koog の `ChatHistoryProvider` (`SpringAiChatHistoryProvider`)

このスターターは、Koogの完全な実行状態の永続化ではなく、テキストのみの会話の永続化を提供します。

### テキストのみの制約

プレーンテキストの `System`、`User`、および `Assistant` メッセージのみが永続化されます。
保存時に以下のメッセージは黙って破棄されます：

- `Message.Tool.Call`
- `Message.Tool.Result`
- `Message.Reasoning`
- 添付ファイル（attachments）を持つすべてのメッセージ

読み込み時、Spring AIの `TOOL` 行は黙ってスキップされます。
タイムスタンプ、トークン数、終了理由、カスタムメタデータなどのメタデータは保持されません。

### 依存関係の追加

Spring AIチャットメモリリポジトリの実装と一緒に依存関係を追加します：

=== "Gradle (Kotlin DSL)"

    ```kotlin
    dependencies {
        implementation("ai.koog:koog-agents-jvm:$koogVersion")
        implementation("ai.koog:koog-spring-ai-starter-chat-memory:$koogVersion")
        implementation("org.springframework.ai:spring-ai-starter-model-chat-memory-repository-jdbc")
    }
    ```

=== "Maven"

    ```xml
    <dependencies>
        <dependency>
            <groupId>ai.koog</groupId>
            <artifactId>koog-agents-jvm</artifactId>
            <version>${koog.version}</version>
        </dependency>
        <dependency>
            <groupId>ai.koog</groupId>
            <artifactId>koog-spring-ai-starter-chat-memory</artifactId>
            <version>${koog.version}</version>
        </dependency>
        <dependency>
            <groupId>org.springframework.ai</groupId>
            <artifactId>spring-ai-starter-model-chat-memory-repository-jdbc</artifactId>
        </dependency>
    </dependencies>
    ```

### 利用可能なプロバイダー

このスターターは、JDBC、Redis、Cassandra、Cosmos DB、MongoDB、および Neo4j ベースのリポジトリを含む、`ChatMemoryRepository` を公開するすべての Spring AI チャットメモリリポジトリ実装で動作します。

### 設定

通常、Spring AI リポジトリの設定以外に特別な構成は必要ありません：

```properties
# Koog チャットメモリスターターのデフォルト値
koog.spring.ai.chat-memory.enabled=true
koog.spring.ai.chat-memory.dispatcher.type=AUTO
```

単一の `ChatMemoryRepository` Beanが存在する場合、すべてが自動的に動作します。
アダプターがそれをKoogの `ChatHistoryProvider` でラップします。

### 使用例

自動構成された `ChatHistoryProvider` を使用して、エージェントに `ChatMemory` 機能をインストールします：

=== "Kotlin"

    ```kotlin
    import ai.koog.agents.chatMemory.feature.ChatMemory
    import ai.koog.agents.chatMemory.feature.ChatHistoryProvider
    import ai.koog.agents.core.agent.AIAgent
    import ai.koog.prompt.executor.clients.openai.OpenAIModels
    import ai.koog.prompt.executor.model.PromptExecutor
    import org.springframework.stereotype.Service

    @Service
    class MyAgentService(
        private val promptExecutor: PromptExecutor,
        private val chatStorage: ChatHistoryProvider,
    ) {

        suspend fun askAgent(userMessage: String, sessionId: String): String {
            val agent = AIAgent(
                promptExecutor = promptExecutor,
                llmModel = OpenAIModels.Chat.GPT5Nano,
                systemPrompt = "You are a helpful assistant.",
            ) {
                install(ChatMemory) {
                    chatHistoryProvider = chatStorage
                }
            }

            return agent.run(userMessage, sessionId)
        }
    }
    ```

### 設定プロパティ (`koog.spring.ai.chat-memory`)

| プロパティ | 型 | デフォルト値 | 説明 |
|---|---|---|---|
| `enabled` | `Boolean` | `true` | チャットメモリの自動構成を有効または無効にします |
| `chat-memory-repository-bean-name` | `String?` | `null` | 複数のリポジトリが存在する場合に使用する `ChatMemoryRepository` の Bean 名 |
| `dispatcher.type` | `AUTO` / `IO` | `AUTO` | ブロッキングリポジトリ呼び出し用のディスパッチャー |
| `dispatcher.parallelism` | `Int` | `0` (= 無制限) | `IO` ディスパッチャーの最大並行数 |

### マルチリポジトリコンテキスト

複数の `ChatMemoryRepository` Beanが登録されている場合は、使用するものを指定します：

```properties
koog.spring.ai.chat-memory.chat-memory-repository-bean-name=jdbcChatMemoryRepository
```

セレクターがない場合、自動構成は候補が1つだけ存在する場合にのみ有効になります。

### 現在の制限事項

- テキストの会話履歴のみが永続化されます
- ツール呼び出し、ツール結果、推論メッセージ、および添付ファイルは永続化されません
- 読み込み時、Spring AIの `TOOL` メッセージはスキップされます
- ラウンドトリップを通じてメッセージのメタデータは保持されません

## ベクトルストアスターター (Vector Store Starter)

### 概要

`koog-spring-ai-starter-vector-store` スターターは、Spring AIのベクトルストア抽象化とKoogのRAGストレージインターフェースを橋渡しします。
以下の内容を自動構成します：

- Koog `KoogVectorStore` として公開される `SpringAiKoogVectorStore` アダプター

`KoogVectorStore` は以下を組み合わせたものです：

- `WriteStorage<TextDocument>`
- `SearchStorage<TextDocument, SimilaritySearchRequest>`
- `FilteringDeletionStorage`

例では通常、具体的なドキュメント型として `DocumentWithMetadata` を使用します。

### 依存関係の追加

Spring AIベクトルストアスターターと一緒に依存関係を追加します：

=== "Gradle (Kotlin DSL)"

    ```kotlin
    dependencies {
        implementation("ai.koog:koog-spring-ai-starter-vector-store:$koogVersion")
        implementation("org.springframework.ai:spring-ai-starter-vector-store-pgvector")
    }
    ```

=== "Maven"

    ```xml
    <dependencies>
        <dependency>
            <groupId>ai.koog</groupId>
            <artifactId>koog-spring-ai-starter-vector-store</artifactId>
            <version>${koog.version}</version>
        </dependency>
        <dependency>
            <groupId>org.springframework.ai</groupId>
            <artifactId>spring-ai-starter-vector-store-pgvector</artifactId>
        </dependency>
    </dependencies>
    ```

### 利用可能なプロバイダー

このスターターは、PgVector, Azure AI Search, Cassandra, Chroma, Elasticsearch, Milvus, MongoDB Atlas, Neo4j, OpenSearch, Oracle, Pinecone, Qdrant, Redis, Typesense, および Weaviate を含む、`VectorStore` を公開するすべての Spring AI 実装で動作します。

### 設定

通常、Spring AI ベクトルストアの設定以外に特別な Koog 構成は必要ありません：

```properties
# Koog ベクトルストアスターターのデフォルト値
koog.spring.ai.vectorstore.enabled=true
koog.spring.ai.vectorstore.dispatcher.type=AUTO
```

単一の `VectorStore` Beanが存在する場合、すべてが自動的に動作します。
アダプターがそれをKoogの `KoogVectorStore` でラップします。

### 使用例

`KoogVectorStore` を Spring コンポーネントに直接インジェクトします：

=== "Kotlin"

    ```kotlin
    import ai.koog.rag.base.TextDocument
    import ai.koog.rag.base.storage.search.SearchResult
    import ai.koog.rag.base.storage.search.SimilaritySearchRequest
    import ai.koog.spring.ai.vectorstore.DocumentWithMetadata
    import ai.koog.spring.ai.vectorstore.KoogVectorStore
    import org.springframework.stereotype.Service

    @Service
    class MyKnowledgeBase(
        private val vectorStore: KoogVectorStore,
    ) {

        suspend fun ingest(text: String): `List<String>` {
            return vectorStore.add(
                listOf(
                    DocumentWithMetadata(
                        content = text,
                        metadata = mapOf("source" to "user")
                    )
                )
            )
        }

        suspend fun search(query: String): List<SearchResult<TextDocument>> {
            return vectorStore.search(
                SimilaritySearchRequest(queryText = query, limit = 5)
            )
        }

        suspend fun remove(ids: List<String>) {
            vectorStore.delete(ids)
        }
    }
    ```

### 設定プロパティ (`koog.spring.ai.vectorstore`)

| プロパティ | 型 | デフォルト値 | 説明 |
|---|---|---|---|
| `enabled` | `Boolean` | `true` | ベクトルストアの自動構成を有効または無効にします |
| `vector-store-bean-name` | `String?` | `null` | 複数のストアが存在する場合に使用する `VectorStore` の Bean 名 |
| `dispatcher.type` | `AUTO` / `IO` | `AUTO` | ブロッキングベクトルストア呼び出し用のディスパッチャー |
| `dispatcher.parallelism` | `Int` | `0` (= 無制限) | `IO` ディスパッチャーの最大並行数 |

### マルチストアコンテキスト

複数の `VectorStore` Beanが登録されている場合は、使用するものを指定します：

```properties
koog.spring.ai.vectorstore.vector-store-bean-name=pgVectorStore
```

セレクターがない場合、自動構成は候補が1つだけ存在する場合にのみ有効になります。

### 現在の制限事項

- Spring AIの `VectorStore` コントラクトは類似性検索（similarity search）のみを公開しています
- 更新（Update）は `delete(ids)` の後に `add(documents)` を行う形式で実装されているため、トランザクションではありません
- Spring AIにはポータブルなIDによる読み込みAPIがないため、`LookupStorage` は実装されていません
- `delete(ids)` は入力されたIDを変更せずに返します。Spring AIはどのドキュメントが実際に削除されたかを返しません
- `delete(filterExpression)` は空のリストを返します。Spring AIは一致したドキュメントのIDを返しません
- ネームスペースによるスコーピングは実装されていません
- メタデータの値は `String`、`Number`、または `Boolean` などのプリミティブ値である必要があります

## 次のステップ

- 最小限のAIワークフローを構築するための[基本エージェント](agents/basic-agents.md)について学ぶ
- 高度なユースケース向けの[グラフベースのエージェント](agents/graph-based-agents.md)を探索する
- エージェントの機能を拡張するために[ツールの概要](tools-overview.md)を確認する
- RAGの概念については[検索拡張生成 (Retrieval-Augmented Generation)](retrieval-augmented-generation.md)を読む
- 実践的な実装については[サンプル](examples.md)をチェックする
- 直接的なKoogスターターのアプローチについては[Spring Boot統合](spring-boot.md)ガイドを読む