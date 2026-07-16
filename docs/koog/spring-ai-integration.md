# Spring AI 集成

Koog 提供了 Spring AI 集成 Starter，将 Spring AI 的抽象与 Koog 代理框架连接起来。
如果您已经使用 Spring AI 进行模型访问、内存或矢量存储，这些 Starter 允许您在不替换现有 Spring AI 配置的情况下，在之上接入 Koog。

## 与 `koog-spring-boot-starter` 的区别

| | `koog-spring-boot-starter` | `koog-spring-ai` Starters |
|---|---|---|
| **LLM 传输** | Koog 自有的 HTTP 客户端 | 委托给 Spring AI Bean，如 `ChatModel` 和 `EmbeddingModel` |
| **配置** | 每个提供商的 `ai.koog.*` 属性 | 由 Spring AI Starter 管理的标准 `spring.ai.*` 属性，以及 `koog.spring.ai.*` 适配器属性 |
| **适用场景** | 您希望 Koog 直接管理模型连接 | 您已经在使用 Spring AI，并希望在其之上接入 Koog 代理、内存或 RAG |

这两种方法是相互独立的。
有关直接使用 Koog Starter 的方法，请参阅 [Spring Boot 集成](spring-boot.md)。

## 可用 Starter

| 模块 | 用途 |
|---|---|
| `koog-spring-ai-starter-model-chat` | 将 Spring AI 的 `ChatModel`（可选 `ModerationModel`）适配为 Koog 的 `LLMClient` 和 `PromptExecutor` |
| `koog-spring-ai-starter-model-embedding` | 将 Spring AI 的 `EmbeddingModel` 适配为 Koog 的 `LLMEmbeddingProvider` |
| `koog-spring-ai-starter-chat-memory` | 将 Spring AI 的 `ChatMemoryRepository` 适配为 Koog 的 `ChatHistoryProvider` |
| `koog-spring-ai-starter-vector-store` | 将 Spring AI 的 `VectorStore` 适配为 Koog `KoogVectorStore`，用于摄取、搜索和删除 |

每个 Starter 都是一个独立的 Spring Boot Starter，拥有自己的自动配置和配置属性。
您可以只使用一个 Starter，也可以在同一个应用程序中组合使用多个。

## 调度器类型

所有四个 Starter 都支持相同的调度器配置模式：

- **`AUTO`**（默认）：如果可用，则使用 Spring 管理的 `AsyncTaskExecutor`，否则回退到 `Dispatchers.IO`。
- **`IO`**：始终使用 `Dispatchers.IO`。
- **`dispatcher.parallelism`**：当大于 `0` 且 `type=IO` 时，使用 `Dispatchers.IO.limitedParallelism(parallelism)`。

`AUTO` 通常是最简单的选择，特别是当您使用 Spring Boot 虚拟线程时。

## 聊天模型 Starter

### 概览

`koog-spring-ai-starter-model-chat` Starter 将 Spring AI 的聊天模型抽象与 Koog 代理框架连接起来。
它会自动配置：

- 一个委托给 Spring AI `ChatModel` 的 Koog `LLMClient` (`SpringAiLLMClient`)
- 一个由所有可用 `LLMClient` Bean 组装而成的 `PromptExecutor` (`MultiLLMPromptExecutor`)

工具始终由 Koog 代理框架执行。
Spring AI 仅接收工具定义和架构 (schema)，且 `internalToolExecutionEnabled` 被设置为 `false`。

### 添加依赖项

在添加任何 Spring AI 聊天模型 Starter 的同时添加此依赖项：

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

### 支持的提供商

该 Starter 适用于 Spring AI 为其创建 `ChatModel` 的任何提供商，包括：
Anthropic、Azure OpenAI、Bedrock Converse、DeepSeek、Google GenAI、HuggingFace、MiniMax、
Mistral AI、OCI GenAI、Ollama、OpenAI、Vertex AI 和 ZhiPu AI。

### 配置

通过匹配的 Spring AI Starter 配置您的提供商，然后根据需要添加 Koog 属性：

```properties
# Spring AI 提供商配置示例
spring.ai.openai.api-key=${OPENAI_API_KEY}

# Koog 聊天 Starter 默认值
koog.spring.ai.chat.enabled=true
koog.spring.ai.chat.dispatcher.type=AUTO
```

如果您只有一个 `ChatModel` Bean，一切都会自动工作。
适配器会将其包装到 Koog `LLMClient` 中，并创建一个开箱即用的 `PromptExecutor`。

### 使用示例

注入 `PromptExecutor` 并使用它运行 Koog 代理：

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

或者提供您自己的 `PromptExecutor` Bean 以完全覆盖自动配置的 Bean。

### 配置属性 (`koog.spring.ai.chat`)

| 属性 | 类型 | 默认值 | 描述 |
|---|---|---|---|
| `enabled` | `Boolean` | `true` | 启用或禁用聊天自动配置 |
| `chat-model-bean-name` | `String?` | `null` | 当存在多个模型时，要使用的 `ChatModel` 的 Bean 名称 |
| `moderation-model-bean-name` | `String?` | `null` | 要使用的 `ModerationModel` 的 Bean 名称 |
| `provider` | `String?` | `null` | 要公开的 Koog 提供商 ID，而不是从 `ChatModel` 类中自动检测 |
| `dispatcher.type` | `AUTO` / `IO` | `AUTO` | 用于阻塞模型调用的调度器 |
| `dispatcher.parallelism` | `Int` | `0` (= 无限制) | `IO` 调度器的最大并发数 |

### 多模型上下文

当注册了多个 `ChatModel` 或 `ModerationModel` Bean 时，请指定要使用的 Bean：

```properties
koog.spring.ai.chat.chat-model-bean-name=openAiChatModel
koog.spring.ai.chat.moderation-model-bean-name=openAiModerationModel
```

如果没有选择器，自动配置仅在存在单个候选对象时才会激活。

### 扩展点

- **`ChatOptionsCustomizer`**：注册一个实现此接口的 Spring Bean 以自定义 `ChatOptions`

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

- **自定义 `LLMClient`**：注册您自己的 `LLMClient` Bean。除非您替换名为 `springAiChatModelLLMClient` 的 Bean，否则它将与自动配置的适配器组合在一起。
- **自定义 `PromptExecutor`**：注册您自己的 `PromptExecutor` Bean 以覆盖自动配置的 `MultiLLMPromptExecutor`。

## 嵌入模型 Starter

### 概览

`koog-spring-ai-starter-model-embedding` Starter 将 Spring AI 的嵌入模型抽象与 Koog 代理框架连接起来。
它会自动配置：

- 一个委托给 Spring AI `EmbeddingModel` 的 Koog `LLMEmbeddingProvider` (`SpringAiLLMEmbeddingProvider`)

适配器会将 Koog 模型 ID 转发到 Spring AI `EmbeddingOptions` 中，因此支持运行时模型选择的后端可以遵循该设置。

### 添加依赖项

在添加任何 Spring AI 嵌入模型 Starter 的同时添加此依赖项：

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

### 支持的提供商

该 Starter 适用于 Spring AI 为其创建 `EmbeddingModel` 的任何提供商，包括：
Anthropic、Azure OpenAI、Bedrock、Google GenAI、HuggingFace、Mistral AI、OCI GenAI、
Ollama、OpenAI、Transformers、Vertex AI 和 ZhiPu AI。

### 配置

通过 Spring AI 配置您的嵌入提供商，然后根据需要添加 Koog 属性：

```properties
# Spring AI 提供商配置示例
spring.ai.openai.api-key=${OPENAI_API_KEY}

# Koog 嵌入 Starter 默认值
koog.spring.ai.embedding.enabled=true
koog.spring.ai.embedding.dispatcher.type=AUTO
```

如果您只有一个 `EmbeddingModel` Bean，一切都会自动工作。
适配器会将其包装到 Koog `LLMEmbeddingProvider` 中。

### 使用示例

注入 `LLMEmbeddingProvider` 并将其用于嵌入操作：

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

或者提供您自己的 `LLMEmbeddingProvider` Bean 以完全覆盖自动配置的适配器。

### 配置属性 (`koog.spring.ai.embedding`)

| 属性 | 类型 | 默认值 | 描述 |
|---|---|---|---|
| `enabled` | `Boolean` | `true` | 启用或禁用嵌入自动配置 |
| `embedding-model-bean-name` | `String?` | `null` | 当存在多个模型时，要使用的 `EmbeddingModel` 的 Bean 名称 |
| `dispatcher.type` | `AUTO` / `IO` | `AUTO` | 用于阻塞嵌入调用的调度器 |
| `dispatcher.parallelism` | `Int` | `0` (= 无限制) | `IO` 调度器的最大并发数 |

### 多模型上下文

当注册了多个 `EmbeddingModel` Bean 时，请指定要使用的 Bean：

```properties
koog.spring.ai.embedding.embedding-model-bean-name=openAiEmbeddingModel
```

如果没有选择器，自动配置仅在存在单个候选对象时才会激活。

### 扩展点

- **自定义 `LLMEmbeddingProvider`**：注册您自己的 Bean 以完全覆盖自动配置的适配器。

## 聊天内存 Starter

### 概览

`koog-spring-ai-starter-chat-memory` Starter 将 Spring AI 的聊天内存抽象与 Koog 代理框架连接起来。
它会自动配置：

- 一个委托给 Spring AI `ChatMemoryRepository` 的 Koog `ChatHistoryProvider` (`SpringAiChatHistoryProvider`)

此 Starter 仅提供文本对话持久化，不提供完整的 Koog 执行状态持久化。

### 仅限文本的约定

仅持久化纯文本的 `System`、`User` 和 `Assistant` 消息。
以下内容在存储时会被静默丢弃：

- `Message.Tool.Call`
- `Message.Tool.Result`
- `Message.Reasoning`
- 任何带有附件的消息

在加载时，Spring AI 的 `TOOL` 行将被静默跳过。
元数据（如时间戳、Token 计数、结束原因和自定义元数据）不会被保留。

### 添加依赖项

在添加 Spring AI 聊天内存仓库实现的同时添加此依赖项：

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

### 支持的提供商

此 Starter 适用于公开 `ChatMemoryRepository` 的任何 Spring AI 聊天内存仓库实现，
包括基于 JDBC、Redis、Cassandra、Cosmos DB、MongoDB 和 Neo4j 的仓库。

### 配置

除了 Spring AI 仓库设置之外，通常不需要额外的配置：

```properties
# Koog 聊天内存 Starter 默认值
koog.spring.ai.chat-memory.enabled=true
koog.spring.ai.chat-memory.dispatcher.type=AUTO
```

如果您只有一个 `ChatMemoryRepository` Bean，一切都会自动工作。
适配器会将其包装到 Koog `ChatHistoryProvider` 中。

### 使用示例

使用自动配置的 `ChatHistoryProvider` 在您的代理上安装 `ChatMemory` 功能：

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

### 配置属性 (`koog.spring.ai.chat-memory`)

| 属性 | 类型 | 默认值 | 描述 |
|---|---|---|---|
| `enabled` | `Boolean` | `true` | 启用或禁用聊天内存自动配置 |
| `chat-memory-repository-bean-name` | `String?` | `null` | 当存在多个仓库时，要使用的 `ChatMemoryRepository` 的 Bean 名称 |
| `dispatcher.type` | `AUTO` / `IO` | `AUTO` | 用于阻塞仓库调用的调度器 |
| `dispatcher.parallelism` | `Int` | `0` (= 无限制) | `IO` 调度器的最大并发数 |

### 多仓库上下文

当注册了多个 `ChatMemoryRepository` Bean 时，请指定要使用的 Bean：

```properties
koog.spring.ai.chat-memory.chat-memory-repository-bean-name=jdbcChatMemoryRepository
```

如果没有选择器，自动配置仅在存在单个候选对象时才会激活。

### 当前限制

- 仅持久化文本对话历史记录
- 不持久化工具调用、工具结果、推理消息和附件
- 加载时跳过 Spring AI `TOOL` 消息
- 往返过程中不保留消息元数据

## 矢量存储 Starter

### 概览

`koog-spring-ai-starter-vector-store` Starter 将 Spring AI 矢量存储抽象与 Koog 的 RAG 存储接口连接起来。
它会自动配置：

- 一个作为 Koog `KoogVectorStore` 公开的 `SpringAiKoogVectorStore` 适配器

`KoogVectorStore` 结合了：

- `WriteStorage<TextDocument>`
- `SearchStorage<TextDocument, SimilaritySearchRequest>`
- `FilteringDeletionStorage`

示例通常使用 `DocumentWithMetadata` 作为具体的文档类型。

### 添加依赖项

在添加 Spring AI 矢量存储 Starter 的同时添加此依赖项：

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

### 支持的提供商

该 Starter 适用于公开 `VectorStore` 的任何 Spring AI 实现，包括 PgVector、
Azure AI Search、Cassandra、Chroma、Elasticsearch、Milvus、MongoDB Atlas、Neo4j、OpenSearch、
Oracle、Pinecone、Qdrant、Redis、Typesense 和 Weaviate。

### 配置

除了 Spring AI 矢量存储设置之外，通常不需要额外的 Koog 配置：

```properties
# Koog 矢量存储 Starter 默认值
koog.spring.ai.vectorstore.enabled=true
koog.spring.ai.vectorstore.dispatcher.type=AUTO
```

如果您只有一个 `VectorStore` Bean，一切都会自动工作。
适配器会将其包装到 Koog `KoogVectorStore` 中。

### 使用示例

将 `KoogVectorStore` 直接注入到您的 Spring 组件中：

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

### 配置属性 (`koog.spring.ai.vectorstore`)

| 属性 | 类型 | 默认值 | 描述 |
|---|---|---|---|
| `enabled` | `Boolean` | `true` | 启用或禁用矢量存储自动配置 |
| `vector-store-bean-name` | `String?` | `null` | 当存在多个存储时，要使用的 `VectorStore` 的 Bean 名称 |
| `dispatcher.type` | `AUTO` / `IO` | `AUTO` | 用于阻塞矢量存储调用的调度器 |
| `dispatcher.parallelism` | `Int` | `0` (= 无限制) | `IO` 调度器的最大并发数 |

### 多存储上下文

当注册了多个 `VectorStore` Bean 时，请指定要使用的 Bean：

```properties
koog.spring.ai.vectorstore.vector-store-bean-name=pgVectorStore
```

如果没有选择器，自动配置仅在存在单个候选对象时才会激活。

### 当前限制

- Spring AI 的 `VectorStore` 契约仅公开相似性搜索
- 更新操作实现为先执行 `delete(ids)` 后执行 `add(documents)`，因此它不是事务性的
- 未实现 `LookupStorage`，因为 Spring AI 没有可移植的按 ID 读取 API
- `delete(ids)` 返回输入的 ID 且不作修改；Spring AI 不确认实际删除了哪些文档
- `delete(filterExpression)` 返回一个空列表；Spring AI 不返回匹配文档的 ID
- 未实现命名空间作用域 (Namespace scoping)
- 元数据值必须是基本类型，如 `String`、`Number` 或 `Boolean`

## 后续步骤

- 了解 [基础代理](agents/basic-agents.md) 以构建最小化 AI 工作流
- 探索用于高级用例的 [基于图的代理](agents/graph-based-agents.md)
- 查看 [工具概览](tools-overview.md) 以扩展代理的能力
- 阅读 [检索增强生成](retrieval-augmented-generation.md) 以了解 RAG 概念
- 查看 [示例](examples.md) 以了解真实世界的实现
- 阅读 [Spring Boot 集成](spring-boot.md) 指南以了解直接使用 Koog Starter 的方法