# 대화 메모리 (Chat Memory)

## 기능 개요

ChatMemory 기능은 AI 에이전트가 여러 번의 실행에 걸쳐 지속적인 대화 기록(persistent conversation history)을 가질 수 있도록 합니다.
이 기능이 설치되면 에이전트는 각 실행이 시작될 때 이전 메시지를 자동으로 로드하고, 실행이 완료되면 업데이트된 대화를 저장하여 자연스러운 멀티턴(multi-turn) 채팅을 가능하게 합니다.

### 주요 기능

- 세션 ID별 대화 기록 자동 로드/저장
- `ChatHistoryProvider`를 통한 플러그형 저장소 백엔드
- 히스토리 크기 제한 및 메시지 필터링을 위한 내장 전처리기(preprocessors)
- 임의의 메시지 변환을 위한 사용자 정의 전처리기 지원

## Koog 및 Memory 기능 설치

=== "Gradle (Kotlin)"

    ```kotlin title="build.gradle.kts"
    dependencies {
        implementation("ai.koog:koog-agents:0.7.0")
        implementation("ai.koog:agents-features-memory:0.7.0")
    }
    ```

=== "Gradle (Groovy)"

    ```groovy title="build.gradle"
    dependencies {
        implementation 'ai.koog:koog-agents:0.7.0'
        implementation 'ai.koog:agents-features-memory:0.7.0'
    }
    ```

=== "Maven"

    ```xml title="pom.xml"
    <dependency>
        <groupId>ai.koog</groupId>
        <artifactId>koog-agents-jvm</artifactId>
        <version>0.7.0</version>
    </dependency>
    <dependency>
        <groupId>ai.koog</groupId>
        <artifactId>agents-features-memory-jvm</artifactId>
        <version>0.7.0</version>
    </dependency>
    ```

!!! note
    ChatMemory는 **0.7.0** 버전부터 사용할 수 있으며, 아직 Maven Central에 게시되지 않았습니다.
    그동안은 로컬 빌드나 스냅샷 저장소를 통해 사용할 수 있습니다.

## 구성 및 초기화

### 기본 설정 (Kotlin)

에이전트 블록 내에서 `installChatMemory` DSL 단축어를 사용하여 ChatMemory를 설치합니다.
기본적으로 전처리기가 없는 인메모리 프로바이더를 사용합니다.

```kotlin
val toolRegistry = ToolRegistry {
    // 도구 구성
}

val agent = AIAgent(
    promptExecutor = executor,
    llmModel = OpenAIModels.Chat.GPT4oMini,
    systemPrompt = "You are a helpful assistant.",
    toolRegistry = toolRegistry,
) {
    install(ChatMemory)
}
```

사용자 정의 프로바이더 및 전처리기를 구성하려면 다음과 같이 합니다:

```kotlin
val agent = AIAgent(
    promptExecutor = executor,
    llmModel = OpenAIModels.Chat.GPT4oMini,
    systemPrompt = "You are a helpful assistant.",
    toolRegistry = toolRegistry,
) {
    install(ChatMemory) {
        chatHistoryProvider = MyDatabaseProvider()
        windowSize(20)
        filterMessages { it is Message.User || it is Message.Assistant }
    }
}
```

### 세션 ID로 실행하기

`agent.run()`의 두 번째 인자는 ChatMemory가 대화를 구분하기 위해 사용하는 세션 ID입니다.

```kotlin
// 첫 번째 턴
agent.run("What is the capital of France?", "session-1")

// 두 번째 턴 — 에이전트가 이전 대화 내용을 확인합니다.
agent.run("And what about Germany?", "session-1")
```

서로 다른 세션 ID는 완전히 격리된 히스토리를 생성합니다.

## 전처리기 (Preprocessors)

전처리기는 로드 시점(에이전트가 확인하기 전)과 저장 시점(지속 저장하기 전) 모두에서 메시지 목록을 변환합니다. 전처리기는 추가된 순서대로 순차적으로 실행됩니다.

### 내장 전처리기

| 구성 메서드 | 전처리기 클래스 | 동작 |
|---|---|---|
| `windowSize(n)` | `WindowSizePreProcessor` | 마지막 `n`개의 메시지만 유지 |
| `filterMessages { ... }` | `FilterMessagesPreProcessor` | 조건(predicate)과 일치하는 메시지만 유지 |

### 순서의 중요성

전처리기는 체인 방식으로 연결됩니다. 즉, 각 전처리기의 출력이 다음 전처리기의 입력이 됩니다.

```kotlin
// 효과: 마지막 10개의 메시지를 유지한 후, 해당 10개 중에서 짧은 메시지를 필터링합니다.
windowSize(10)
filterMessages { it.content.length <= 100 }

// 효과: 먼저 짧은 메시지를 필터링한 후, 남은 메시지 중 마지막 10개를 유지합니다.
filterMessages { it.content.length <= 100 }
windowSize(10)
```

### 사용자 정의 전처리기

`ChatMemoryPreProcessor` 인터페이스를 구현합니다:

```kotlin
class RedactEmailsPreProcessor : ChatMemoryPreProcessor {
    override fun preprocess(messages: List<Message>): `List<Message>` {
        return messages.map { message ->
            // 메시지 본문에서 이메일 주소를 대체합니다.
            Message.User(message.content.replace(Regex("[\\w.]+@[\\w.]+"), "[REDACTED]"))
        }
    }
}
```

그런 다음 구성에 추가합니다:

```kotlin
install(ChatMemory) {
    addPreProcessor(RedactEmailsPreProcessor())
    windowSize(50)
}
```

## 사용자 정의 히스토리 프로바이더

기본 제공되는 `InMemoryChatHistoryProvider`는 스레드 세이프(thread-safe)하지만 비지속적입니다(재시작 시 히스토리가 손실됨). 운영 환경에서는 `ChatHistoryProvider`를 구현하여 사용하세요.

```kotlin
class DatabaseChatHistoryProvider(private val db: Database) : ChatHistoryProvider {
    override suspend fun store(conversationId: String, messages: List<Message>) {
        db.saveMessages(conversationId, messages)
    }

    override suspend fun load(conversationId: String): `List<Message>` {
        return db.loadMessages(conversationId) ?: emptyList()
    }
}
```

주요 규약(Contract):
- `store`는 지정된 `conversationId`에 대한 전체 히스토리를 교체합니다 (추가 전용이 아님).
- `load`는 히스토리가 없을 때 빈 리스트를 반환합니다 (절대 null을 반환하지 않음).
- 두 메서드 모두 `suspend`이므로 비동기 I/O를 안전하게 수행할 수 있습니다.

## Java API

모든 구성 메서드는 유연한 체이닝을 위해 `ChatMemoryConfig`를 반환합니다:

```java
AIAgent<String, String> agent = AIAgent.builder()
    .promptExecutor(executor)
    .llmModel(OpenAIModels.Chat.GPT4oMini)
    .systemPrompt("You are a helpful assistant.")
    .install(ChatMemory.Feature, config -> config
            .chatHistoryProvider(new MyDatabaseProvider())
            .windowSize(20)
            .filterMessages(msg -> msg instanceof Message.User))
    .build();
```

`MessageFilter`는 `fun interface`이므로 Java 람다를 직접 사용할 수 있습니다.

## 일반적인 유스케이스: 백엔드 애플리케이션

ChatMemory의 일반적인 패턴은 클라이언트를 대신해 에이전트 상호작용을 관리하는 백엔드 서비스입니다. 각 HTTP 요청은 세션 ID를 포함하고, 에이전트는 일치하는 대화 기록을 로드하여 응답을 생성하고 업데이트된 기록을 저장하는 과정을 투명하게 처리합니다.

```kotlin
// --- 컨트롤러 ---

@RestController
class ChatController(private val agentService: ChatAgentService) {
    @PostMapping("/chat")
    suspend fun chat(@RequestBody request: ChatRequest): ChatResponse {
        val reply = agentService.chat(request.sessionId, request.message)
        return ChatResponse(reply)
    }
}

// --- 서비스 ---

@Service
class ChatAgentService(private val executor: SingleLLMPromptExecutor) {
    private val toolRegistry = ToolRegistry {
        // 여기에 도구 등록
    }

    private val agent = AIAgent(
        promptExecutor = executor,
        llmModel = OpenAIModels.Chat.GPT4oMini,
        systemPrompt = "You are a helpful assistant.",
        toolRegistry = toolRegistry,
    ) {
        install(ChatMemory) {
            chatHistoryProvider = MyDatabaseProvider() // 지속성 저장소
            windowSize(50)
        }
    }

    suspend fun chat(sessionId: String, message: String): String {
        return agent.run(message, sessionId)
    }
}
```

Spring Boot에서 Koog를 설정하는 전체 가이드는 [Spring Boot 통합 가이드](spring-boot.md)를 참조하세요.

## ChatMemory vs Persistence

ChatMemory와 [에이전트 지속성(Agent Persistence)](agent-persistence.md)은 서로 다른 용도로 사용되며 함께 사용할 수 있습니다.

**ChatMemory**는 각 `agent.run()` 호출을 원자적이고 독립적인 루프로 취급합니다. 대화 기록은 실행이 시작되기 전에 로드되고 실행이 성공적으로 완료된 후에 저장됩니다. 실행 중에 에이전트가 중단되면 진행 중인 메시지는 저장되지 않으며, 히스토리는 해당 실행이 시작되기 전 상태로 유지됩니다.

**Persistence**는 실행 중에 체크포인트로서 에이전트의 내부 실행 상태(그래프 노드, 메시지 히스토리, 입출력)를 캡처합니다. 에이전트가 중단되더라도 처음부터 다시 시작하는 대신 마지막 체크포인트부터 다시 시작할 수 있습니다.

| | ChatMemory | Persistence |
|---|---|---|
| **저장 대상** | 여러 실행에 걸친 대화 메시지 | 실행 내에서의 실행 상태 |
| **저장 시점** | `agent.run()` 완료 후 | 각 그래프 노드 완료 후 (또는 수동) |
| **크래시 발생 시 동작** | 진행 중인 실행 내용은 손실되나 이전 히스토리는 보존됨 | 마지막 체크포인트부터 재개 가능 |
| **일반적인 용도** | 멀티턴 대화의 연속성 유지 | 장시간 실행되는 에이전트, 크래시 복구 |

에이전트가 실행 중 중단되었을 때 비용이 많이 발생하는 장시간 작업을 수행하는 경우, 두 기능을 모두 설치하는 것이 좋습니다.

```kotlin
val agent = AIAgent(
    promptExecutor = executor,
    llmModel = OpenAIModels.Chat.GPT4oMini,
    systemPrompt = "You are a helpful assistant.",
) {
    install(ChatMemory) {
        chatHistoryProvider = MyDatabaseProvider()
        windowSize(50)
    }
    install(Persistence) {
        storage = MyPersistenceStorageProvider()
        enableAutomaticPersistence = true
    }
}
```

## 권장 사항

1. **항상 윈도우 크기(window size)를 설정하세요** — 설정하지 않으면 대화 길이에 따라 프롬프트 크기가 무제한으로 커집니다.
2. **전처리기 순서를 신중하게 선택하세요** — 윈도우 크기 제한 전 필터링과 제한 후 필터링은 서로 다른 결과를 생성합니다.
3. **의미 있는 세션 ID를 사용하세요** — 세션 ID는 히스토리 격리를 위한 키입니다. 사용자 ID, 채팅 스레드 ID 또는 UUID 등이 적합합니다.
4. **운영 환경에서는 지속성 프로바이더를 구현하세요** — `InMemoryChatHistoryProvider`는 재시작 시 히스토리가 손실됩니다.