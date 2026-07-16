# 對話記憶

## 功能概覽

ChatMemory 功能讓 AI 代理可以在多次執行（run）之間保持持久化的對話歷程記錄。
安裝後，代理會在每次執行開始時自動載入先前的訊息，並在執行完成時儲存更新後的對話，進而實現自然的多次對話。

### 核心能力

- 按會話 ID 自動載入/儲存對話歷程記錄
- 透過 `ChatHistoryProvider` 提供可插拔的儲存後端
- 內建前置處理器以限制歷程記錄大小並篩選訊息
- 支援自訂前置處理器以進行任意訊息轉換

## 安裝 Koog 與 Memory 功能

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
    ChatMemory 從 **0.7.0** 版本開始提供，該版本尚未發佈到 Maven Central。
    在此期間，您可以從本機組建或快照儲存庫中使用它。

## 配置與初始化

### 基本設定 (Kotlin)

在 agent 區塊內使用 `installChatMemory` DSL 捷徑來安裝 ChatMemory。
預設情況下，它使用不含前置處理器的記憶體內提供者：

```kotlin
val toolRegistry = ToolRegistry {
    // 您的工具
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

要配置自訂提供者和前置處理器：

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

### 使用會話 ID 執行

`agent.run()` 的第二個引數是 ChatMemory 用於識別對話的會話 ID：

```kotlin
// 第一輪
agent.run("What is the capital of France?", "session-1")

// 第二輪 — 代理會看到先前的交流內容
agent.run("And what about Germany?", "session-1")
```

不同的會話 ID 會產生完全隔離的歷程記錄。

## 前置處理器

前置處理器在載入時（在代理看到訊息之前）和儲存時（在持久化之前）轉換訊息清單。它們按照被加入的順序依序執行。

### 內建前置處理器

| 配置方法 | 前置處理器類別 | 行為 |
|---|---|---|
| `windowSize(n)` | `WindowSizePreProcessor` | 僅保留最後 `n` 條訊息 |
| `filterMessages { ... }` | `FilterMessagesPreProcessor` | 保留符合謂詞的訊息 |

### 順序很重要

前置處理器是鏈式呼叫的 — 每個處理器的輸出就是下一個處理器的輸入：

```kotlin
// 效果：保留最後 10 條訊息，然後從這 10 條訊息中篩選掉較短的訊息
windowSize(10)
filterMessages { it.content.length <= 100 }

// 效果：先篩選掉短訊息，然後保留剩餘訊息中的最後 10 條
filterMessages { it.content.length <= 100 }
windowSize(10)
```

### 自訂前置處理器

實作 `ChatMemoryPreProcessor` 介面：

```kotlin
class RedactEmailsPreProcessor : ChatMemoryPreProcessor {
    override fun preprocess(messages: List<Message>): `List<Message>` {
        return messages.map { message ->
            // 取代訊息內容中的電子郵件地址
            Message.User(message.content.replace(Regex("[\\w.]+@[\\w.]+"), "[REDACTED]"))
        }
    }
}
```

然後將其加入配置：

```kotlin
install(ChatMemory) {
    addPreProcessor(RedactEmailsPreProcessor())
    windowSize(50)
}
```

## 自訂歷程記錄提供者

預設的 `InMemoryChatHistoryProvider` 是執行緒安全的，但非持久化的（歷程記錄在重啟時會遺失）。
對於生產環境，請實作 `ChatHistoryProvider`：

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

核心規範：
- `store` 會取代指定 `conversationId` 的整個歷程記錄（並非僅追加）
- 當不存在歷程記錄時，`load` 回傳一個空清單（絕不為 null）
- 兩個方法都是 `suspend`，因此非同步 I/O 是安全的

## Java API

所有配置方法都會回傳 `ChatMemoryConfig` 以供流式鏈結：

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

`MessageFilter` 是一個 `fun interface`，因此 Java lambda 運算式可以直接運作。

## 典型使用案例：後端應用程式

ChatMemory 的一個常見模式是代表用戶端管理代理互動的後端服務。每個 HTTP 請求都帶有一個會話 ID，代理載入匹配的對話歷程記錄，產生回應並儲存更新後的歷程記錄 — 這一切都是透明進行的。

```kotlin
// --- 控制器 ---

@RestController
class ChatController(private val agentService: ChatAgentService) {
    @PostMapping("/chat")
    suspend fun chat(@RequestBody request: ChatRequest): ChatResponse {
        val reply = agentService.chat(request.sessionId, request.message)
        return ChatResponse(reply)
    }
}

// --- 服務 ---

@Service
class ChatAgentService(private val executor: SingleLLMPromptExecutor) {
    private val toolRegistry = ToolRegistry {
        // 在此處註冊您的工具
    }

    private val agent = AIAgent(
        promptExecutor = executor,
        llmModel = OpenAIModels.Chat.GPT4oMini,
        systemPrompt = "You are a helpful assistant.",
        toolRegistry = toolRegistry,
    ) {
        install(ChatMemory) {
            chatHistoryProvider = MyDatabaseProvider() // 持久化儲存
            windowSize(50)
        }
    }

    suspend fun chat(sessionId: String, message: String): String {
        return agent.run(message, sessionId)
    }
}
```

有關在 Spring Boot 中設定 Koog 的完整指南，請參閱
[Spring Boot 整合指南](spring-boot.md)。

## ChatMemory vs Persistence

ChatMemory 和 [代理持久化 (Persistence)](agent-persistence.md) 用途不同，可以結合使用。

**ChatMemory** 將每次 `agent.run()` 呼叫視為一個原子的、自包含的循環。
對話歷程記錄在執行開始前載入，並在執行成功完成後儲存。如果代理在執行過程中崩潰，進行中的訊息將 **不會** 被儲存 — 歷程記錄將保持在該次執行開始前的狀態。

**Persistence** 在執行期間將代理的內部執行狀態（圖節點、訊息歷程記錄、輸入/輸出）擷取為檢查點。如果代理崩潰，它可以從最後一個檢查點恢復，而不是重新開始。

| | ChatMemory | Persistence |
|---|---|---|
| **儲存內容** | 跨執行的對話訊息 | 單次執行內的執行狀態 |
| **儲存時機** | `agent.run()` 完成後 | 每個圖節點後（或手動） |
| **崩潰行為** | 進行中的執行遺失；先前的歷程記錄完好 | 可從最後一個檢查點恢復 |
| **典型用途** | 多輪對話連貫性 | 長時間運行的代理、崩潰恢復 |

如果您的代理執行長時間運行的任務，且執行中途崩潰代價高昂，請考慮安裝這兩個功能：

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

## 最佳實務

1. **務必設定視窗大小** — 若不設定，提示詞大小會隨對話長度無限制地增長。
2. **仔細選擇前置處理器順序** — 先篩選後取視窗與先取視窗後篩選會產生不同的結果。
3. **使用有意義的會話 ID** — 這些是歷程記錄隔離的關鍵。使用者 ID、對話執行緒 ID 或 UUID 都是不錯的選擇。
4. **在生產環境中實作持久化提供者** — `InMemoryChatHistoryProvider` 在重啟時會遺失歷程記錄。