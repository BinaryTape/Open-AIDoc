# 聊天记忆 (Chat memory)

`ChatMemory` 功能能够让 AI 智能体 (agent) 存储对话历史记录，并在多次运行之间检索这些记录。
安装后，智能体会在每次运行开始时自动加载之前的消息，并在运行完成时存储更新后的对话，从而实现自然的多轮对话。

核心能力：

- 按会话 ID (session ID) 自动加载和存储对话历史记录
- 通过 `ChatHistoryProvider` 提供可插拔的存储后端
- 内置预处理器 (preprocessor) 以限制历史记录大小和过滤消息
- 支持自定义预处理器，用于任意的消息转换

## 添加依赖项

聊天记忆是一个可选的[功能](../index.md)，默认情况下在 Koog 中不可用。
要为您的 Koog 智能体实现聊天记忆，请添加 [`ai.koog:agents-features-memory`](https://mvnrepository.com/artifact/ai.koog/agents-features-memory) 的依赖项：

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
    `ChatMemory` 功能从 Koog 版本 **0.7.0** 开始提供。

## 启用聊天记忆

在创建智能体时，使用 `install()` 方法安装 `ChatMemory`：

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

默认情况下，它使用不带[预处理器](#preprocessors)的内存中 (in-memory) [聊天历史记录提供程序](#history-providers)。
您可以配置 `ChatMemory` 功能来使用自定义聊天历史记录提供程序和预处理器，例如：

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

## 会话 ID (Session IDs)

将会话 ID 作为第二个实参传递给 `agent.run()`。
`ChatMemory` 使用此 ID 来存储和加载对话：

```kotlin
// 第一次运行 - 智能体在结束时保存聊天历史记录
agent.run("What is the capital of France?", "session-1")

// 第二次运行 — 智能体加载之前的交流内容
agent.run("And what about Germany?", "session-1")
```

不同的会话 ID 会产生完全隔离的历史记录。

## 历史记录提供程序 (History providers)

默认的 `InMemoryChatHistoryProvider` 是线程安全的，但不是持久化的（重启后历史记录会丢失）。
对于生产环境，请实现您自己的 `ChatHistoryProvider` 来持久化存储消息。

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

## 预处理器 (Preprocessors)

预处理器在加载时（在智能体看到消息列表之前）和存储时（在保存之前）转换消息列表。
它们按照您在 `ChatMemory` 功能配置中添加它们的顺序顺序运行。

### 内置预处理器

| 配置方法 | 预处理器类 | 行为 |
|--------------------------|------------------------------|---------------------------------------|
| `windowSize(n)` | `WindowSizePreProcessor` | 仅保留最后 `n` 条消息 |
| `filterMessages { ... }` | `FilterMessagesPreProcessor` | 保留符合谓词条件的消息 |

### 预处理器的顺序

预处理器顺序执行，每个处理器的输出将作为下一个处理器的输入。
这意味着顺序至关重要。

```kotlin
// 效果：保留最后 10 条消息，然后在这些消息中过滤掉较短的消息
windowSize(10)
filterMessages { it.content.length <= 100 }

// 效果：先过滤掉较短的消息，然后保留剩余消息中的最后 10 条
filterMessages { it.content.length <= 100 }
windowSize(10)
```

### 自定义预处理器

要创建自定义预处理器，请实现 `ChatMemoryPreProcessor` 接口：

```kotlin
class RedactEmailsPreProcessor : ChatMemoryPreProcessor {
    override fun preprocess(messages: List<Message>): `List<Message>` {
        return messages.map { message ->
            // 替换消息内容中的电子邮件地址
            Message.User(message.content.replace(Regex("[\\w.]+@[\\w.]+"), "[REDACTED]"))
        }
    }
}
```

然后将其添加到配置中：

```kotlin
install(ChatMemory) {
    addPreProcessor(RedactEmailsPreProcessor())
    windowSize(50)
}
```

## 聊天记忆 vs 智能体持久化

`ChatMemory` 将每次 `agent.run()` 调用视为一个原子的、自包含的循环。
智能体在运行前加载聊天历史记录，并在成功运行后存储它。
如果智能体在运行期间崩溃，它不会存储当前的聊天消息，这意味着聊天历史记录将保持运行前的状态。

[持久化 (Persistence)](../agent-persistence.md) 会在运行期间将智能体的内部执行状态（图节点、消息历史记录、输入和输出）捕获为检查点。
如果智能体崩溃，它可以从最后一个检查点恢复。

| | ChatMemory | 持久化 (Persistence) |
|--------------------|--------------------------------------------------|--------------------------------------------------------------------|
| **保存内容** | 对话消息 | 执行状态 |
| **保存时机** | `agent.run()` 完成后 | 每个图节点之后或运行期间手动定义的点 |
| **崩溃行为** | 正在进行的运行会丢失；之前的历史记录完好无损 | 可以从最后一个检查点恢复 |
| **典型用途** | 多轮对话的连续性 | 具有崩溃恢复能力的长时运行智能体 |

如果您的智能体执行长时运行的任务，且执行中途崩溃的代价很高，请考虑同时安装这两个功能：

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

## 最佳做法

- **始终设置窗口大小 (window size)** 以防止对话无限增长。
- **仔细安排预处理器的顺序**，因为在窗口化之前过滤与在过滤之前窗口化会产生不同的结果。
- **使用有意义的会话 ID** 进行历史记录隔离：用户 ID、聊天线程 ID 或 UUID 都是不错的选择。
- **为生产环境实现持久化提供程序**，因为默认的 `InMemoryChatHistoryProvider` 会在重启时丢失历史记录。

## 后续步骤

- 了解如何[构建一个带记忆的简单 CLI 聊天循环](chat-agent-with-memory.md)
- 查看[带记忆的聊天端点](chat-backend-with-memory.md)示例