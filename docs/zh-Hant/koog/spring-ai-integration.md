# Spring AI 整合

Koog 提供 Spring AI 整合 starter，將 Spring AI 的抽象與 Koog 代理架構串聯起來。如果您已使用 Spring AI 進行模型存取、記憶體或向量儲存，這些 starter 讓您可以在其之上接入 Koog — 而無需替換現有的 Spring AI 配置。

## 與 `koog-spring-boot-starter` 的區別

| | `koog-spring-boot-starter` | `koog-spring-ai` starter |
|---|---|---|
| **LLM 傳輸** | Koog 自有的 HTTP 用戶端 | 委派至 Spring AI bean，例如 `ChatModel` 與 `EmbeddingModel` |
| **配置** | 每個供應商的 `ai.koog.*` 屬性 | 由 Spring AI starter 管理的標準 `spring.ai.*` 屬性，以及 `koog.spring.ai.*` 適配器屬性 |
| **何時使用** | 您希望 Koog 直接管理模型連線 | 您已使用 Spring AI，並希望在其之上接入 Koog 代理、記憶體或 RAG |

這兩種方式是相互獨立的。關於直接使用 Koog starter 的方式，請參閱 [Spring Boot 整合](spring-boot.md)。

## 可用的 Starter

| 模組 | 用途 |
|---|---|
| `koog-spring-ai-starter-model-chat` | 將 Spring AI 的 `ChatModel`（包含選用的 `ModerationModel`）適配為 Koog 的 `LLMClient` 與 `PromptExecutor` |
| `koog-spring-ai-starter-model-embedding` | 將 Spring AI 的 `EmbeddingModel` 適配為 Koog 的 `LLMEmbeddingProvider` |
| `koog-spring-ai-starter-chat-memory` | 將 Spring AI 的 `ChatMemoryRepository` 適配為 Koog 的 `ChatHistoryProvider` |
| `koog-spring-ai-starter-vector-store` | 將 Spring AI 的 `VectorStore` 適配為 Koog 的 `KoogVectorStore`，用於攝取、搜尋與刪除 |

每個 starter 都是完全獨立的 Spring Boot starter，擁有自己的自動配置與配置屬性。您可以在同一個應用程式中使用一個 starter，或組合使用多個 starter。

## 調度器類型

所有四個 starter 都支援相同的調度器配置模式：

- **`AUTO`** (預設)：如果可用，使用 Spring 管理的 `AsyncTaskExecutor`，否則回退至 `Dispatchers.IO`。
- **`IO`**：始終使用 `Dispatchers.IO`。
- **`dispatcher.parallelism`**：當其大於 `0` 且 `type=IO` 時，使用 `Dispatchers.IO.limitedParallelism(parallelism)`。

`AUTO` 通常是簡便的選擇，特別是當您使用 Spring Boot 虛擬執行緒時。

## 聊天模型 Starter

### 總覽

`koog-spring-ai-starter-model-chat` starter 橋接了 Spring AI 的聊天模型抽象與 Koog 代理架構。它會自動配置：

- 一個 Koog `LLMClient` (`SpringAiLLMClient`)，委派至 Spring AI 的 `ChatModel`
- 一個從所有可用 `LLMClient` bean 組裝而成的 `PromptExecutor` (`MultiLLMPromptExecutor`)

工具始終由 Koog 代理架構執行。Spring AI 僅接收工具定義與架構，且 `internalToolExecutionEnabled` 設定為 `false`。

### 新增相依性

將此相依性與任何 Spring AI 聊天模型 starter 一同加入：

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

### 支援的供應商

此 starter 適用於任何由 Spring AI 建立 `ChatModel` 的供應商，包括：Anthropic, Azure OpenAI, Bedrock Converse, DeepSeek, Google GenAI, HuggingFace, MiniMax, Mistral AI, OCI GenAI, Ollama, OpenAI, Vertex AI 與 ZhiPu AI。

### 配置

透過對應的 Spring AI starter 配置您的供應商，並視需要新增 Koog 屬性：

```properties
# Spring AI 供應商配置範例
spring.ai.openai.api-key=${OPENAI_API_KEY}

# Koog 聊天 starter 預設值
koog.spring.ai.chat.enabled=true
koog.spring.ai.chat.dispatcher.type=AUTO
```

如果您只有單個 `ChatModel` bean，一切都會自動運作。適配器會將其封裝為 Koog 的 `LLMClient` 並建立一個開箱即用的 `PromptExecutor`。

### 使用範例

注入 `PromptExecutor` 並用其執行 Koog 代理：

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

或者提供您自己的 `PromptExecutor` bean 來完全覆蓋自動配置的 bean。

### 配置屬性 (`koog.spring.ai.chat`)

| 屬性 | 型別 | 預設值 | 說明 |
|---|---|---|---|
| `enabled` | `Boolean` | `true` | 啟用或停用聊天自動配置 |
| `chat-model-bean-name` | `String?` | `null` | 當存在多個模型時，要使用的 `ChatModel` bean 名稱 |
| `moderation-model-bean-name` | `String?` | `null` | 要使用的 `ModerationModel` bean 名稱 |
| `provider` | `String?` | `null` | 要公開的 Koog 供應商 ID，而非從 `ChatModel` 類別自動偵測 |
| `dispatcher.type` | `AUTO` / `IO` | `AUTO` | 用於阻塞式模型呼叫的調度器 |
| `dispatcher.parallelism` | `Int` | `0` (= 無限制) | `IO` 調度器的最大並行數 |

### 多模型上下文

當註冊了多個 `ChatModel` 或 `ModerationModel` bean 時，請指定要使用哪一個：

```properties
koog.spring.ai.chat.chat-model-bean-name=openAiChatModel
koog.spring.ai.chat.moderation-model-bean-name=openAiModerationModel
```

若沒有選擇器，自動配置僅在存在單一候選對象時才會啟動。

### 擴充點

- **`ChatOptionsCustomizer`**：註冊一個實作此介面的 Spring bean，以自訂 `ChatOptions`

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

- **自訂 `LLMClient`**：註冊您自己的 `LLMClient` bean。它將與自動配置的適配器組合在一起，除非您替換名稱為 `springAiChatModelLLMClient` 的 bean。
- **自訂 `PromptExecutor`**：註冊您自己的 `PromptExecutor` bean，以完全覆蓋自動配置的 `MultiLLMPromptExecutor`。

## 嵌入模型 Starter

### 總覽

`koog-spring-ai-starter-model-embedding` starter 橋接了 Spring AI 的嵌入模型抽象與 Koog 代理架構。它會自動配置：

- 一個 Koog `LLMEmbeddingProvider` (`SpringAiLLMEmbeddingProvider`)，委派至 Spring AI 的 `EmbeddingModel`

適配器會將 Koog 模型 ID 轉發至 Spring AI `EmbeddingOptions`，以便支援運行時模型選擇的後端能夠遵循該設定。

### 新增相依性

將此相依性與任何 Spring AI 嵌入模型 starter 一同加入：

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

### 支援的供應商

此 starter 適用於任何由 Spring AI 建立 `EmbeddingModel` 的供應商，包括：Anthropic, Azure OpenAI, Bedrock, Google GenAI, HuggingFace, Mistral AI, OCI GenAI, Ollama, OpenAI, Transformers, Vertex AI 與 ZhiPu AI。

### 配置

透過 Spring AI 配置您的嵌入供應商，並視需要新增 Koog 屬性：

```properties
# Spring AI 供應商配置範例
spring.ai.openai.api-key=${OPENAI_API_KEY}

# Koog 嵌入 starter 預設值
koog.spring.ai.embedding.enabled=true
koog.spring.ai.embedding.dispatcher.type=AUTO
```

如果您只有單個 `EmbeddingModel` bean，一切都會自動運作。適配器會將其封裝為 Koog 的 `LLMEmbeddingProvider`。

### 使用範例

注入 `LLMEmbeddingProvider` 並用其進行嵌入操作：

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

或者提供您自己的 `LLMEmbeddingProvider` bean 來完全覆蓋自動配置的適配器。

### 配置屬性 (`koog.spring.ai.embedding`)

| 屬性 | 型別 | 預設值 | 說明 |
|---|---|---|---|
| `enabled` | `Boolean` | `true` | 啟用或停用嵌入自動配置 |
| `embedding-model-bean-name` | `String?` | `null` | 當存在多個模型時，要使用的 `EmbeddingModel` bean 名稱 |
| `dispatcher.type` | `AUTO` / `IO` | `AUTO` | 用於阻塞式嵌入呼叫的調度器 |
| `dispatcher.parallelism` | `Int` | `0` (= 無限制) | `IO` 調度器的最大並行數 |

### 多模型上下文

當註冊了多個 `EmbeddingModel` bean 時，請指定要使用哪一個：

```properties
koog.spring.ai.embedding.embedding-model-bean-name=openAiEmbeddingModel
```

若沒有選擇器，自動配置僅在存在單一候選對象時才會啟動。

### 擴充點

- **自訂 `LLMEmbeddingProvider`**：註冊您自己的 bean 來完全覆蓋自動配置的適配器。

## 聊天記憶體 Starter

### 總覽

`koog-spring-ai-starter-chat-memory` starter 橋接了 Spring AI 的聊天記憶體抽象與 Koog 代理架構。它會自動配置：

- 一個 Koog `ChatHistoryProvider` (`SpringAiChatHistoryProvider`)，委派至 Spring AI 的 `ChatMemoryRepository`

此 starter 僅提供純文字對話持久化，而非完整的 Koog 執行狀態持久化。

### 僅限文字契約

僅會持久化純文字的 `System`、`User` 與 `Assistant` 訊息。儲存時會自動捨棄以下內容：

- `Message.Tool.Call`
- `Message.Tool.Result`
- `Message.Reasoning`
- 任何攜帶附件的訊息

在載入時，Spring AI 的 `TOOL` 列將會被自動跳過。時間戳記、Token 數量、結束原因與自訂元資料等元資料將不會被保留。

### 新增相依性

將此相依性與 Spring AI 聊天記憶體儲存庫實作一同加入：

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

### 支援的供應商

此 starter 適用於任何公開 `ChatMemoryRepository` 的 Spring AI 聊天記憶體儲存庫實作，包括基於 JDBC、Redis、Cassandra、Cosmos DB、MongoDB 與 Neo4j 的儲存庫。

### 配置

通常除了您的 Spring AI 儲存庫設定外，不需要額外的配置：

```properties
# Koog 聊天記憶體 starter 預設值
koog.spring.ai.chat-memory.enabled=true
koog.spring.ai.chat-memory.dispatcher.type=AUTO
```

如果您只有單個 `ChatMemoryRepository` bean，一切都會自動運作。適配器會將其封裝為 Koog 的 `ChatHistoryProvider`。

### 使用範例

使用自動配置的 `ChatHistoryProvider` 在您的代理上安裝 `ChatMemory` 功能：

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

### 配置屬性 (`koog.spring.ai.chat-memory`)

| 屬性 | 型別 | 預設值 | 說明 |
|---|---|---|---|
| `enabled` | `Boolean` | `true` | 啟用或停用聊天記憶體自動配置 |
| `chat-memory-repository-bean-name` | `String?` | `null` | 當存在多個儲存庫時，要使用的 `ChatMemoryRepository` bean 名稱 |
| `dispatcher.type` | `AUTO` / `IO` | `AUTO` | 用於阻塞式儲存庫呼叫的調度器 |
| `dispatcher.parallelism` | `Int` | `0` (= 無限制) | `IO` 調度器的最大並行數 |

### 多儲存庫上下文

當註冊了多個 `ChatMemoryRepository` bean 時，請指定要使用哪一個：

```properties
koog.spring.ai.chat-memory.chat-memory-repository-bean-name=jdbcChatMemoryRepository
```

若沒有選擇器，自動配置僅在存在單一候選對象時才會啟動。

### 目前限制

- 僅持久化文字對話歷程記錄
- 工具呼叫、工具結果、推理訊息與附件不會被持久化
- 載入時會跳過 Spring AI 的 `TOOL` 訊息
- 訊息元資料在來回轉換過程中不會被保留

## 向量儲存 Starter

### 總覽

`koog-spring-ai-starter-vector-store` starter 橋接了 Spring AI 向量儲存抽象與 Koog 的 RAG 儲存介面。它會自動配置：

- 一個公開為 Koog `KoogVectorStore` 的 `SpringAiKoogVectorStore` 適配器

`KoogVectorStore` 結合了：

- `WriteStorage<TextDocument>`
- `SearchStorage<TextDocument, SimilaritySearchRequest>`
- `FilteringDeletionStorage`

範例通常使用 `DocumentWithMetadata` 作為具體的文件型別。

### 新增相依性

將此相依性與 Spring AI 向量儲存 starter 一同加入：

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

### 支援的供應商

此 starter 適用於任何公開 `VectorStore` 的 Spring AI 實作，包括 PgVector, Azure AI Search, Cassandra, Chroma, Elasticsearch, Milvus, MongoDB Atlas, Neo4j, OpenSearch, Oracle, Pinecone, Qdrant, Redis, Typesense 與 Weaviate。

### 配置

通常除了您的 Spring AI 向量儲存設定外，不需要額外的 Koog 配置：

```properties
# Koog 向量儲存 starter 預設值
koog.spring.ai.vectorstore.enabled=true
koog.spring.ai.vectorstore.dispatcher.type=AUTO
```

如果您只有單個 `VectorStore` bean，一切都會自動運作。適配器會將其封裝為 Koog 的 `KoogVectorStore`。

### 使用範例

直接將 `KoogVectorStore` 注入到您的 Spring 組件中：

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

### 配置屬性 (`koog.spring.ai.vectorstore`)

| 屬性 | 型別 | 預設值 | 說明 |
|---|---|---|---|
| `enabled` | `Boolean` | `true` | 啟用或停用向量儲存自動配置 |
| `vector-store-bean-name` | `String?` | `null` | 當存在多個儲存庫時，要使用的 `VectorStore` bean 名稱 |
| `dispatcher.type` | `AUTO` / `IO` | `AUTO` | 用於阻塞式向量儲存呼叫的調度器 |
| `dispatcher.parallelism` | `Int` | `0` (= 無限制) | `IO` 調度器的最大並行數 |

### 多儲存庫上下文

當註冊了多個 `VectorStore` bean 時，請指定要使用哪一個：

```properties
koog.spring.ai.vectorstore.vector-store-bean-name=pgVectorStore
```

若沒有選擇器，自動配置僅在存在單一候選對象時才會啟動。

### 目前限制

- Spring AI 的 `VectorStore` 契約僅公開相似度搜尋
- 更新是透過 `delete(ids)` 後接 `add(documents)` 實作的，因此非交易式
- 由於 Spring AI 沒有可移植的依 ID 讀取的 API，因此尚未實作 `LookupStorage`
- `delete(ids)` 會原樣傳回輸入的 ID；Spring AI 不會確認哪些文件實際上已被刪除
- `delete(filterExpression)` 會傳回空列表；Spring AI 不會傳回相符文件的 ID
- 尚未實作命名空間作用域
- 元資料值必須是原始值，例如 `String`、`Number` 或 `Boolean`

## 下一步

- 了解 [基礎代理](agents/basic-agents.md) 以建置極簡的 AI 工作流
- 探索 [圖形基礎代理](agents/graph-based-agents.md) 以處理進階使用案例
- 查看 [工具總覽](tools-overview.md) 以擴展代理的能力
- 閱讀 [檢索增強生成](retrieval-augmented-generation.md) 以了解 RAG 概念
- 查看 [範例](examples.md) 以了解實際開發中的實作
- 閱讀 [Spring Boot 整合](spring-boot.md) 指南以了解直接使用 Koog starter 的方式