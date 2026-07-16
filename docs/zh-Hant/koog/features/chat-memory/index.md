# 對話記憶

`ChatMemory` 功能讓 AI 代理能夠儲存對話歷程記錄，並在多次執行之間進行檢索。
安裝後，代理會在每次執行開始時自動載入之前的訊息，並在執行完成時儲存更新後的對話，從而實現自然的多次對話。

核心功能：

- 依據工作階段 ID 自動載入與儲存對話歷程記錄
- 透過 `ChatHistoryProvider` 提供可插拔的儲存後端
- 內建前置處理器以限制歷程記錄大小並篩選訊息
- 支援自訂前置處理器以進行任意訊息轉換

## 新增相依性

對話記憶是一個選用的 [功能](../index.md)，在 Koog 中預設不提供。
若要為您的 Koog 代理實作對話記憶，請新增 [`ai.koog:agents-features-memory`](https://mvnrepository.com/artifact/ai.koog/agents-features-memory) 的相依性：

=== "Gradle (Kotlin)"

    ```kotlin title="build.gradle.kts"
    dependencies {
        implementation("ai.koog:agents-features-memory:$koogVersion")
    }
    ```

=== "Gradle (Groovy)"

    ```groovy title="build.gradle"
    implementation 'ai.koog:agents-features-memory:$koogVersion'
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
    `ChatMemory` 功能自 Koog 版本 **0.7.0** 起提供。

## 啟用對話記憶

在建立代理時，使用 `install()` 方法安裝 `ChatMemory`：

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

預設情況下，它使用記憶體內 [對話歷程記錄提供者](#history-providers)，且不含 [前置處理器](#preprocessors)。
您可以配置 `ChatMemory` 功能來使用自訂的對話歷程記錄提供者和前置處理器，例如：

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

## 工作階段 ID

將工作階段 ID 作為 `agent.run()` 的第二個引數傳入。
`ChatMemory` 使用此 ID 來儲存與載入對話：

```kotlin
// 第一次執行 - 代理在結束時儲存對話歷程記錄
agent.run("法國的首都是哪裡？", "session-1")

// 第二次執行 — 代理載入之前的交流內容
agent.run("那麼德國呢？", "session-1")
```

不同的工作階段 ID 會產生完全隔離的歷程記錄。

## 歷程記錄提供者

預設的 `InMemoryChatHistoryProvider` 是執行緒安全的，但非持久性（重新啟動後歷程記錄會遺失）。
對於生產環境，請實作您自己的 `ChatHistoryProvider` 來持久化儲存訊息。

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

## 前置處理器

前置處理器在載入時（在代理看到訊息之前）和儲存時（在儲存之前）轉換訊息清單。
它們會按照您新增至 `ChatMemory` 功能配置中的順序依序執行。

### 內建前置處理器

| 配置方法 | 前置處理器類別 | 行為 |
|--------------------------|------------------------------|---------------------------------------|
| `windowSize(n)`          | `WindowSizePreProcessor`     | 僅保留最後 `n` 條訊息 |
| `filterMessages { ... }` | `FilterMessagesPreProcessor` | 保留符合述句的訊息 |

### 前置處理器的順序

前置處理器依序執行，每個處理器的輸出會成為下一個處理器的輸入。
這意味著順序非常重要。

```kotlin
// 效果：保留最後 10 條訊息，然後從這 10 條訊息中篩選出較短的訊息
windowSize(10)
filterMessages { it.content.length <= 100 }

// 效果：先篩選掉短訊息，然後在剩餘的訊息中保留最後 10 條
filterMessages { it.content.length <= 100 }
windowSize(10)
```

### 自訂前置處理器

若要建立自訂前置處理器，請實作 `ChatMemoryPreProcessor` 介面：

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

然後將其新增至配置中：

```kotlin
install(ChatMemory) {
    addPreProcessor(RedactEmailsPreProcessor())
    windowSize(50)
}
```

## 對話記憶 vs 代理持久化

`ChatMemory` 將每次 `agent.run()` 呼叫視為一個原子性的、自包含的迴圈。
代理在執行前載入對話歷程記錄，並在成功執行後進行儲存。
如果代理在執行過程中當機，則不會儲存目前的對話訊息，
這意味著對話歷程記錄將保持執行前的狀態。

[持久化](../agent-persistence.md) 會在執行期間將代理的內部執行狀態
（圖節點、訊息歷程記錄、輸入與輸出）擷取為檢查點。
如果代理當機，它可以從上一個檢查點恢復。

|                    | ChatMemory                                       | 持久化 (Persistence)                                                        |
|--------------------|--------------------------------------------------|--------------------------------------------------------------------|
| **儲存內容**  | 對話訊息                            | 執行狀態                                                    |
| **儲存時機**  | `agent.run()` 完成後                    | 在每個圖節點之後或執行期間手動定義的點 |
| **當機行為** | 進行中的執行將遺失；之前的歷程記錄完好無損 | 可以從上一個檢查點恢復                                    |
| **典型用途**    | 多次對話的連貫性                       | 具備當機恢復功能的長時間執行代理                            |

如果您的代理執行長時間任務，且中途當機的代價很高，請考慮同時安裝這兩個功能：

```kotlin
val agent = AIAgent(
    promptExecutor = executor,
    llmModel = OpenAIModels.Chat.GPT4oMini,
    systemPrompt = "您是一位得力的助手。",
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

- **務必設定視窗大小**，以防止對話內容無限制增長。
- **仔細安排前置處理器的順序**，因為在視窗化之前進行篩選，與在篩選之前進行視窗化，產生的結果會不同。
- **使用具備意義的工作階段 ID** 以實現歷程記錄隔離：使用者 ID、對話串 ID 或 UUID 都是不錯的選擇。
- **針對生產環境實作持久化提供者**，因為預設的 `InMemoryChatHistoryProvider` 在重新啟動時會遺失歷程記錄。

## 後續步驟

- 了解如何 [建置具有記憶功能的簡單 CLI 對話迴圈](chat-agent-with-memory.md)
- 查看 [具有記憶功能的對話端點](chat-backend-with-memory.md) 範例