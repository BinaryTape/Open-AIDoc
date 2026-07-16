# Spring AI 통합

Koog는 Spring AI의 추상화와 Koog 에이전트 프레임워크를 연결하는 Spring AI 통합 스타터를 제공합니다.
이미 모델 접근, 메모리 또는 벡터 저장소를 위해 Spring AI를 사용하고 있다면, 기존 Spring AI 설정을 교체하지 않고도 Koog를 그 위에 얹어 사용할 수 있습니다.

## `koog-spring-boot-starter`와의 차이점

| | `koog-spring-boot-starter` | `koog-spring-ai` 스타터 |
|---|---|---|
| **LLM 전송(Transport)** | Koog 자체 HTTP 클라이언트 | `ChatModel` 및 `EmbeddingModel`과 같은 Spring AI 빈(bean)에 위임 |
| **설정** | 제공자별 `ai.koog.*` 속성 | Spring AI 스타터에 의해 관리되는 표준 `spring.ai.*` 속성 및 `koog.spring.ai.*` 어댑터 속성 |
| **사용 시점** | Koog가 모델 연결을 직접 관리하길 원할 때 | 이미 Spring AI를 사용 중이며 그 위에 Koog 에이전트, 메모리 또는 RAG를 추가하고 싶을 때 |

두 방식은 독립적입니다.
직접적인 Koog 스타터 접근 방식은 [Spring Boot 통합](spring-boot.md)을 참조하세요.

## 사용 가능한 스타터

| 모듈 | 용도 |
|---|---|
| `koog-spring-ai-starter-model-chat` | Spring AI `ChatModel`(선택 사항인 `ModerationModel` 포함)을 Koog `LLMClient` 및 `PromptExecutor`로 변환 |
| `koog-spring-ai-starter-model-embedding` | Spring AI `EmbeddingModel`을 Koog `LLMEmbeddingProvider`로 변환 |
| `koog-spring-ai-starter-chat-memory` | Spring AI `ChatMemoryRepository`를 Koog `ChatHistoryProvider`로 변환 |
| `koog-spring-ai-starter-vector-store` | Spring AI `VectorStore`를 데이터 수집, 검색 및 삭제를 위한 Koog `KoogVectorStore`로 변환 |

각 스타터는 자체 자동 설정(auto-configuration)과 설정 속성을 가진 독립적인 Spring Boot 스타터입니다.
하나의 스타터만 사용하거나 동일한 애플리케이션에서 여러 스타터를 조합하여 사용할 수 있습니다.

## 디스패처 타입 (Dispatcher Types)

네 가지 스타터 모두 동일한 디스패처 설정 패턴을 지원합니다:

- **`AUTO`** (기본값): 가능한 경우 Spring이 관리하는 `AsyncTaskExecutor`를 사용하며, 그렇지 않으면 `Dispatchers.IO`로 대체됩니다.
- **`IO`**: 항상 `Dispatchers.IO`를 사용합니다.
- **`dispatcher.parallelism`**: 이 값이 `0`보다 크고 `type=IO`인 경우, `Dispatchers.IO.limitedParallelism(parallelism)`을 사용하여 동시성을 제한합니다.

특히 Spring Boot 가상 스레드(virtual threads)를 사용하는 경우 일반적으로 `AUTO`가 가장 간단한 선택입니다.

## Chat Model 스타터

### 개요

`koog-spring-ai-starter-model-chat` 스타터는 Spring AI의 채팅 모델 추상화와 Koog 에이전트 프레임워크를 연결합니다.
다음을 자동으로 설정합니다:

- Spring AI `ChatModel`에 위임하는 Koog `LLMClient` (`SpringAiLLMClient`)
- 사용 가능한 모든 `LLMClient` 빈들로 조립된 `PromptExecutor` (`MultiLLMPromptExecutor`)

도구(Tools)는 항상 Koog 에이전트 프레임워크에 의해 실행됩니다.
Spring AI는 도구 정의 및 스키마(schema)만 전달받으며, `internalToolExecutionEnabled` 플래그는 `false`로 설정됩니다.

### 의존성 추가

Spring AI 채팅 모델 스타터와 함께 의존성을 추가합니다:

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

### 지원되는 제공자

이 스타터는 Spring AI가 `ChatModel`을 생성하는 모든 제공자와 함께 작동하며, 다음을 포함합니다:
Anthropic, Azure OpenAI, Bedrock Converse, DeepSeek, Google GenAI, HuggingFace, MiniMax,
Mistral AI, OCI GenAI, Ollama, OpenAI, Vertex AI, ZhiPu AI.

### 설정

해당하는 Spring AI 스타터를 통해 제공자를 설정한 다음, 필요한 경우 Koog 속성을 추가하세요:

```properties
# Spring AI 제공자 설정 예시
spring.ai.openai.api-key=${OPENAI_API_KEY}

# Koog 채팅 스타터 기본값
koog.spring.ai.chat.enabled=true
koog.spring.ai.chat.dispatcher.type=AUTO
```

단일 `ChatModel` 빈이 있는 경우 모든 것이 자동으로 작동합니다.
어댑터가 이를 Koog `LLMClient`로 감싸고 즉시 사용 가능한 `PromptExecutor`를 생성합니다.

### 사용 예시

`PromptExecutor`를 주입받아 Koog 에이전트를 실행하는 데 사용하세요:

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

또는 고유한 `PromptExecutor` 빈을 제공하여 자동 설정된 빈을 완전히 대체할 수 있습니다.

### 설정 속성 (`koog.spring.ai.chat`)

| 속성 | 타입 | 기본값 | 설명 |
|---|---|---|---|
| `enabled` | `Boolean` | `true` | 채팅 자동 설정 활성화/비활성화 |
| `chat-model-bean-name` | `String?` | `null` | 다중 모델이 존재할 때 사용할 `ChatModel`의 빈 이름 |
| `moderation-model-bean-name` | `String?` | `null` | 사용할 `ModerationModel`의 빈 이름 |
| `provider` | `String?` | `null` | `ChatModel` 클래스에서 자동 감지하는 대신 노출할 Koog 제공자 ID |
| `dispatcher.type` | `AUTO` / `IO` | `AUTO` | 블로킹 모델 호출을 위한 디스패처 |
| `dispatcher.parallelism` | `Int` | `0` (= 제한 없음) | `IO` 디스패처의 최대 동시성 |

### 다중 모델 컨텍스트

여러 개의 `ChatModel` 또는 `ModerationModel` 빈이 등록된 경우, 사용할 빈을 지정하세요:

```properties
koog.spring.ai.chat.chat-model-bean-name=openAiChatModel
koog.spring.ai.chat.moderation-model-bean-name=openAiModerationModel
```

선택자가 없으면 자동 설정은 후보가 하나만 존재할 때만 활성화됩니다.

### 확장 포인트

- **`ChatOptionsCustomizer`**: 이 인터페이스를 구현하는 Spring 빈을 등록하여 `ChatOptions`를 커스터마이징할 수 있습니다.

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

- **커스텀 `LLMClient`**: 고유한 `LLMClient` 빈을 등록할 수 있습니다. `springAiChatModelLLMClient`라는 이름의 빈을 교체하지 않는 한, 자동 설정된 어댑터와 함께 구성됩니다.
- **커스텀 `PromptExecutor`**: 고유한 `PromptExecutor` 빈을 등록하여 자동 설정된 `MultiLLMPromptExecutor`를 대체할 수 있습니다.

## Embedding Model Starter

### 개요

`koog-spring-ai-starter-model-embedding` 스타터는 Spring AI의 임베딩 모델 추상화와 Koog 에이전트 프레임워크를 연결합니다.
다음을 자동으로 설정합니다:

- Spring AI `EmbeddingModel`에 위임하는 Koog `LLMEmbeddingProvider` (`SpringAiLLMEmbeddingProvider`)

어댑터는 Koog 모델 ID를 Spring AI `EmbeddingOptions`로 전달하므로, 런타임 모델 선택을 지원하는 백엔드에서 이를 활용할 수 있습니다.

### 의존성 추가

Spring AI 임베딩 모델 스타터와 함께 의존성을 추가합니다:

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

### 지원되는 제공자

이 스타터는 Spring AI가 `EmbeddingModel`을 생성하는 모든 제공자와 함께 작동하며, 다음을 포함합니다:
Anthropic, Azure OpenAI, Bedrock, Google GenAI, HuggingFace, Mistral AI, OCI GenAI,
Ollama, OpenAI, Transformers, Vertex AI, ZhiPu AI.

### 설정

Spring AI를 통해 임베딩 제공자를 설정한 다음, 필요한 경우 Koog 속성을 추가하세요:

```properties
# Spring AI 제공자 설정 예시
spring.ai.openai.api-key=${OPENAI_API_KEY}

# Koog 임베딩 스타터 기본값
koog.spring.ai.embedding.enabled=true
koog.spring.ai.embedding.dispatcher.type=AUTO
```

단일 `EmbeddingModel` 빈이 있는 경우 모든 것이 자동으로 작동합니다.
어댑터가 이를 Koog `LLMEmbeddingProvider`로 감싸줍니다.

### 사용 예시

`LLMEmbeddingProvider`를 주입받아 임베딩 작업에 사용하세요:

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

또는 고유한 `LLMEmbeddingProvider` 빈을 제공하여 자동 설정된 어댑터를 완전히 대체할 수 있습니다.

### 설정 속성 (`koog.spring.ai.embedding`)

| 속성 | 타입 | 기본값 | 설명 |
|---|---|---|---|
| `enabled` | `Boolean` | `true` | 임베딩 자동 설정 활성화/비활성화 |
| `embedding-model-bean-name` | `String?` | `null` | 다중 모델이 존재할 때 사용할 `EmbeddingModel`의 빈 이름 |
| `dispatcher.type` | `AUTO` / `IO` | `AUTO` | 블로킹 임베딩 호출을 위한 디스패처 |
| `dispatcher.parallelism` | `Int` | `0` (= 제한 없음) | `IO` 디스패처의 최대 동시성 |

### 다중 모델 컨텍스트

여러 개의 `EmbeddingModel` 빈이 등록된 경우, 사용할 빈을 지정하세요:

```properties
koog.spring.ai.embedding.embedding-model-bean-name=openAiEmbeddingModel
```

선택자가 없으면 자동 설정은 후보가 하나만 존재할 때만 활성화됩니다.

### 확장 포인트

- **커스텀 `LLMEmbeddingProvider`**: 고유한 빈을 등록하여 자동 설정된 어댑터를 완전히 대체할 수 있습니다.

## Chat Memory 스타터

### 개요

`koog-spring-ai-starter-chat-memory` 스타터는 Spring AI의 채팅 메모리 추상화와 Koog 에이전트 프레임워크를 연결합니다.
다음을 자동으로 설정합니다:

- Spring AI `ChatMemoryRepository`에 위임하는 Koog `ChatHistoryProvider` (`SpringAiChatHistoryProvider`)

이 스타터는 텍스트 전용 대화 영속성을 제공하며, 전체 Koog 실행 상태 영속성은 제공하지 않습니다.

### 텍스트 전용 규약

플레인 텍스트 형태의 `System`, `User`, `Assistant` 메시지만 영속화됩니다.
다음 항목들은 저장 시 자동으로 제외(drop)됩니다:

- `Message.Tool.Call`
- `Message.Tool.Result`
- `Message.Reasoning`
- 첨부 파일이 포함된 모든 메시지

로드 시 Spring AI `TOOL` 행은 자동으로 무시됩니다.
타임스탬프, 토큰 수, 종료 사유(finish reason) 및 커스텀 메타데이터와 같은 메타데이터는 유지되지 않습니다.

### 의존성 추가

Spring AI 채팅 메모리 리포지토리 구현체와 함께 의존성을 추가합니다:

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

### 지원되는 제공자

이 스타터는 JDBC, Redis, Cassandra, Cosmos DB, MongoDB, Neo4j 기반 리포지토리를 포함하여 `ChatMemoryRepository`를 노출하는 모든 Spring AI 채팅 메모리 리포지토리 구현체와 함께 작동합니다.

### 설정

일반적으로 Spring AI 리포지토리 설정 외에 추가 설정은 필요하지 않습니다:

```properties
# Koog 채팅 메모리 스타터 기본값
koog.spring.ai.chat-memory.enabled=true
koog.spring.ai.chat-memory.dispatcher.type=AUTO
```

단일 `ChatMemoryRepository` 빈이 있는 경우 모든 것이 자동으로 작동합니다.
어댑터가 이를 Koog `ChatHistoryProvider`로 감싸줍니다.

### 사용 예시

자동 설정된 `ChatHistoryProvider`를 사용하여 에이전트에 `ChatMemory` 기능을 설치하세요:

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

### 설정 속성 (`koog.spring.ai.chat-memory`)

| 속성 | 타입 | 기본값 | 설명 |
|---|---|---|---|
| `enabled` | `Boolean` | `true` | 채팅 메모리 자동 설정 활성화/비활성화 |
| `chat-memory-repository-bean-name` | `String?` | `null` | 다중 리포지토리가 존재할 때 사용할 `ChatMemoryRepository`의 빈 이름 |
| `dispatcher.type` | `AUTO` / `IO` | `AUTO` | 블로킹 리포지토리 호출을 위한 디스패처 |
| `dispatcher.parallelism` | `Int` | `0` (= 제한 없음) | `IO` 디스패처의 최대 동시성 |

### 다중 리포지토리 컨텍스트

여러 개의 `ChatMemoryRepository` 빈이 등록된 경우, 사용할 빈을 지정하세요:

```properties
koog.spring.ai.chat-memory.chat-memory-repository-bean-name=jdbcChatMemoryRepository
```

선택자가 없으면 자동 설정은 후보가 하나만 존재할 때만 활성화됩니다.

### 현재 제한 사항

- 텍스트 대화 기록만 영속화됩니다.
- 도구 호출, 도구 결과, 추론 메시지 및 첨부 파일은 영속화되지 않습니다.
- 로드 시 Spring AI `TOOL` 메시지는 무시됩니다.
- 메시지 메타데이터는 라운드 트립 과정에서 보존되지 않습니다.

## Vector Store 스타터

### 개요

`koog-spring-ai-starter-vector-store` 스타터는 Spring AI 벡터 저장소 추상화와 Koog의 RAG 저장소 인터페이스를 연결합니다.
다음을 자동으로 설정합니다:

- Koog `KoogVectorStore`로 노출되는 `SpringAiKoogVectorStore` 어댑터

`KoogVectorStore`는 다음을 결합합니다:

- `WriteStorage<TextDocument>`
- `SearchStorage<TextDocument, SimilaritySearchRequest>`
- `FilteringDeletionStorage`

예제에서는 일반적으로 `DocumentWithMetadata`를 구체적인 문서 타입으로 사용합니다.

### 의존성 추가

Spring AI 벡터 저장소 스타터와 함께 의존성을 추가합니다:

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

### 지원되는 제공자

이 스타터는 PgVector, Azure AI Search, Cassandra, Chroma, Elasticsearch, Milvus, MongoDB Atlas, Neo4j, OpenSearch, Oracle, Pinecone, Qdrant, Redis, Typesense, Weaviate 등을 포함하여 `VectorStore`를 노출하는 모든 Spring AI 구현체와 함께 작동합니다.

### 설정

일반적으로 Spring AI 벡터 저장소 설정 외에 추가적인 Koog 설정은 필요하지 않습니다:

```properties
# Koog 벡터 저장소 스타터 기본값
koog.spring.ai.vectorstore.enabled=true
koog.spring.ai.vectorstore.dispatcher.type=AUTO
```

단일 `VectorStore` 빈이 있는 경우 모든 것이 자동으로 작동합니다.
어댑터가 이를 Koog `KoogVectorStore`로 감싸줍니다.

### 사용 예시

`KoogVectorStore`를 Spring 컴포넌트에 직접 주입하세요:

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

### 설정 속성 (`koog.spring.ai.vectorstore`)

| 속성 | 타입 | 기본값 | 설명 |
|---|---|---|---|
| `enabled` | `Boolean` | `true` | 벡터 저장소 자동 설정 활성화/비활성화 |
| `vector-store-bean-name` | `String?` | `null` | 다중 저장소가 존재할 때 사용할 `VectorStore`의 빈 이름 |
| `dispatcher.type` | `AUTO` / `IO` | `AUTO` | 블로킹 벡터 저장소 호출을 위한 디스패처 |
| `dispatcher.parallelism` | `Int` | `0` (= 제한 없음) | `IO` 디스패처의 최대 동시성 |

### 다중 저장소 컨텍스트

여러 개의 `VectorStore` 빈이 등록된 경우, 사용할 빈을 지정하세요:

```properties
koog.spring.ai.vectorstore.vector-store-bean-name=pgVectorStore
```

선택자가 없으면 자동 설정은 후보가 하나만 존재할 때만 활성화됩니다.

### 현재 제한 사항

- Spring AI의 `VectorStore` 규약은 유사도 검색(similarity search)만 노출합니다.
- 업데이트는 `delete(ids)` 이후 `add(documents)`를 수행하는 방식으로 구현되어 있으므로 트랜잭션이 보장되지 않습니다.
- Spring AI에는 이식 가능한 ID 기반 읽기(read-by-id) API가 없으므로 `LookupStorage`는 구현되지 않았습니다.
- `delete(ids)`는 입력된 ID를 그대로 반환합니다. Spring AI는 실제로 어떤 문서가 삭제되었는지 확인해주지 않습니다.
- `delete(filterExpression)`는 빈 리스트를 반환합니다. Spring AI는 일치하는 문서의 ID를 반환하지 않습니다.
- 네임스페이스 스코핑(Namespace scoping)은 구현되지 않았습니다.
- 메타데이터 값은 `String`, `Number`, `Boolean`과 같은 기본 타입(primitive values)이어야 합니다.

## 다음 단계

- 최소한의 AI 워크플로우 구축을 위한 [기본 에이전트](agents/basic-agents.md) 알아보기
- 고급 유스케이스를 위한 [그래프 기반 에이전트](agents/graph-based-agents.md) 탐색하기
- 에이전트 기능 확장을 위한 [도구 개요](tools-overview.md) 확인하기
- RAG 개념을 위한 [검색 증강 생성(RAG)](retrieval-augmented-generation.md) 읽어보기
- 실제 구현 사례를 위해 [예제](examples.md) 확인하기
- 직접적인 Koog 스타터 접근 방식을 위해 [Spring Boot 통합](spring-boot.md) 가이드 읽어보기