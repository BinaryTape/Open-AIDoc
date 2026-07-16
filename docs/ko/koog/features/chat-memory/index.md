# 대화 메모리 (Chat memory)

`ChatMemory` 기능은 AI 에이전트가 대화 이력을 저장하고 여러 번의 실행에 걸쳐 이를 가져올 수 있게 해줍니다.
이 기능이 설치되면, 에이전트는 각 실행 시작 시 이전 메시지를 자동으로 로드하고
실행이 완료되면 업데이트된 대화를 저장하여 자연스러운 멀티턴(multi-turn) 채팅을 가능하게 합니다.

주요 기능:

- 세션 ID별 대화 이력 자동 로드 및 저장
- `ChatHistoryProvider`를 통한 플러그형 스토리지 백엔드
- 이력 크기 제한 및 메시지 필터링을 위한 내장 전처리기
- 임의의 메시지 변환을 위한 커스텀 전처리기 지원

## 의존성 추가

대화 메모리는 기본적으로 Koog에서 제공되지 않는 선택적 [기능](../index.md)입니다.
Koog 에이전트에 대화 메모리를 구현하려면 [`ai.koog:agents-features-memory`](https://mvnrepository.com/artifact/ai.koog/agents-features-memory) 의존성을 추가하세요:

=== "Gradle (Kotlin)"

    ```kotlin title="build.gradle.kts"
    dependencies {
        implementation("ai.koog:agents-features-memory:$koogVersion")
    }
    ```

=== "Gradle (Groovy)"

    ```groovy title="build.gradle"
    dependencies {
        implementation 'ai.koog:agents-features-memory:$koogVersion'
    }
    ```

=== "Maven"

    ```xml title="pom.xml"
    <dependency>
        <groupId>ai.koog</groupId>
        <artifactId>agents-features-memory-jvm</artifactId>
        <version>$koogVersion</version>
    </dependency>
    ```

!!! note
    `ChatMemory` 기능은 Koog 버전 **0.7.0**부터 사용할 수 있습니다.

## 대화 메모리 활성화

에이전트를 생성할 때 `install()` 메서드를 사용하여 `ChatMemory`를 설치합니다:

=== "Kotlin"
    
    ```kotlin
    val agent = AIAgent(
        promptExecutor = simpleOpenAIExecutor(System.getenv("OPENAI_API_KEY")),
        llmModel = OpenAIModels.Chat.GPT4oMini
    ) {
        install(ChatMemory)
    }
    ```
    
=== "Java"
    
    ```java
    AIAgent<String, String> agent = AIAgent.builder()
        .promptExecutor(executor)
        .llmModel(OpenAIModels.Chat.GPT4oMini)
        .install(ChatMemory.Feature)
        .build();
    ```

기본적으로 [전처리기](#preprocessors)가 없는 인메모리(in-memory) [대화 이력 제공자](#history-providers)를 사용합니다.
커스텀 대화 이력 제공자와 전처리기를 사용하도록 `ChatMemory` 기능을 구성하십시오. 예를 들어 다음과 같습니다:

=== "Kotlin"

    ```kotlin
    val agent = AIAgent(
        promptExecutor = simpleOpenAIExecutor(System.getenv("OPENAI_API_KEY")),
        llmModel = OpenAIModels.Chat.GPT4oMini
    ) {
        install(ChatMemory) {
            chatHistoryProvider = MyDatabaseChatHistoryProvider()
            windowSize(20)
            filterMessages { it is Message.User || it is Message.Assistant }
        }
    }
    ```

=== "Java"

    ```java
    AIAgent<String, String> agent = AIAgent.builder()
        .promptExecutor(executor)
        .llmModel(OpenAIModels.Chat.GPT4oMini)
        .install(ChatMemory.Feature, config -> config
                .chatHistoryProvider(new MyDatabaseChatHistoryProvider())
                .windowSize(20)
                .filterMessages(msg -> msg instanceof Message.User || msg instanceof Message.Assistant))
        .build();
    ```

## 세션 ID (Session IDs)

`agent.run()`의 두 번째 인자로 세션 ID를 제공하십시오.
`ChatMemory`는 이 ID를 사용하여 대화를 저장하고 로드합니다:

```kotlin
// 첫 번째 실행 - 실행 종료 시 에이전트가 대화 이력을 저장합니다.
agent.run("What is the capital of France?", "session-1")

// 두 번째 실행 - 에이전트가 이전 대화를 로드합니다.
agent.run("And what about Germany?", "session-1")
```

서로 다른 세션 ID는 완전히 격리된 이력을 생성합니다.

## 이력 제공자 (History providers)

기본 제공되는 `InMemoryChatHistoryProvider`는 스레드 안전(thread-safe)하지만 영구적이지는 않습니다(재시작 시 이력이 손실됨).
운영 환경에서는 메시지를 영구적으로 저장하는 자체 `ChatHistoryProvider`를 구현하십시오.

```kotlin
class MyDatabaseChatHistoryProvider(private val db: Database) : ChatHistoryProvider {
    override suspend fun store(conversationId: String, messages: List<Message>) {
        db.saveMessages(conversationId, messages)
    }

    override suspend fun load(conversationId: String): `List<Message>` {
        return db.loadMessages(conversationId) ?: emptyList()
    }
}
```

## 전처리기 (Preprocessors)

전처리기는 로드 시점(에이전트가 확인하기 전)과 저장 시점(저장하기 전) 모두에서 메시지 목록을 변환합니다.
전처리기는 `ChatMemory` 기능 구성에 추가한 순서대로 순차적으로 실행됩니다.

### 내장 전처리기

| 구성 메서드 | 전처리기 클래스 | 동작 |
|--------------------------|------------------------------|---------------------------------------|
| `windowSize(n)`          | `WindowSizePreProcessor`     | 마지막 `n`개의 메시지만 유지 |
| `filterMessages { ... }` | `FilterMessagesPreProcessor` | 조건(predicate)과 일치하는 메시지만 유지 |

### 전처리기 순서

전처리기는 순차적으로 실행되며, 각 출력이 다음 전처리기의 입력이 됩니다.
즉, 순서가 중요합니다.

```kotlin
// 효과: 마지막 10개의 메시지를 유지한 후, 그 10개 중에서 내용이 짧은 것을 필터링합니다.
windowSize(10)
filterMessages { it.content.length <= 100 }

// 효과: 짧은 메시지를 먼저 필터링한 후, 남은 메시지 중 마지막 10개를 유지합니다.
filterMessages { it.content.length <= 100 }
windowSize(10)
```

### 커스텀 전처리기

커스텀 전처리기를 만들려면 `ChatMemoryPreProcessor` 인터페이스를 구현하십시오:

```kotlin
class RedactEmailsPreProcessor : ChatMemoryPreProcessor {
    override fun preprocess(messages: List<Message>): `List<Message>` {
        return messages.map { message ->
            // 메시지 내용에서 이메일 주소를 대체합니다.
            Message.User(message.content.replace(Regex("[\\w.]+@[\\w.]+"), "[REDACTED]"))
        }
    }
}
```

그 다음 구성에 추가합니다:

```kotlin
install(ChatMemory) {
    addPreProcessor(RedactEmailsPreProcessor())
    windowSize(50)
}
```

## 대화 메모리 vs 에이전트 지속성 (Chat memory vs agent persistence)

`ChatMemory`는 각 `agent.run()` 호출을 원자적이고 독립적인 루프로 취급합니다.
에이전트는 실행 전에 대화 이력을 로드하고 성공적인 실행 후에 이를 저장합니다.
실행 중에 에이전트가 중단되면 현재 대화 메시지를 저장하지 않으므로,
대화 이력은 실행 전 상태로 유지됩니다.

[지속성(Persistence)](../agent-persistence.md)은 실행 중 체크포인트로서 에이전트의 내부 실행 상태(그래프 노드, 메시지 이력, 입력 및 출력)를 캡처합니다.
에이전트가 중단되어도 마지막 체크포인트부터 재개할 수 있습니다.

|                    | 대화 메모리 (ChatMemory) | 지속성 (Persistence) |
|--------------------|--------------------------------------------------|--------------------------------------------------------------------|
| **저장 내용** | 대화 메시지 | 실행 상태 |
| **저장 시점** | `agent.run()` 완료 후 | 각 그래프 노드 이후 또는 실행 중 수동으로 정의된 지점 |
| **중단 시 동작** | 진행 중인 실행은 손실됨; 이전 이력은 온전함 | 마지막 체크포인트부터 재개 가능 |
| **주요 용도** | 멀티턴 대화의 연속성 | 중단 복구가 필요한 장기 실행 에이전트 |

에이전트가 실행 중 중단되었을 때 비용이 많이 드는 장기 실행 작업을 수행하는 경우, 두 기능을 모두 설치하는 것을 고려하십시오:

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

- 무제한적인 대화 증가를 방지하기 위해 **항상 윈도우 크기(window size)를 설정**하십시오.
- 윈도우 설정 전 필터링과 필터링 전 윈도우 설정은 다른 결과를 생성하므로 **전처리기 순서를 신중하게 정하십시오**.
- 이력 격리를 위해 사용자 ID, 채팅 스레드 ID 또는 UUID와 같이 **의미 있는 세션 ID를 사용**하십시오.
- 기본 `InMemoryChatHistoryProvider`는 재시작 시 이력을 잃으므로 **운영 환경을 위해 영구 제공자(persistent provider)를 구현**하십시오.

## 다음 단계

- [메모리가 있는 간단한 CLI 채팅 루프 구축 방법](chat-agent-with-memory.md) 알아보기
- [메모리가 있는 채팅 엔드포인트](chat-backend-with-memory.md)의 예시 확인하기