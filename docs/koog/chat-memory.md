# 聊天记忆 (Chat Memory)

## 功能概览

ChatMemory 功能为 AI 代理提供了跨多次运行的持久化对话历史记录。安装后，代理会在每次运行开始时自动加载之前的消息，并在运行完成时存储更新后的对话，从而实现自然的多轮聊天。

### 核心能力

- 根据会话 ID (session ID) 自动加载/存储对话历史记录
- 通过 `ChatHistoryProvider` 实现可插拔的存储后端
- 内置预处理器，用以限制历史记录大小并过滤消息
- 支持自定义预处理器，以进行任意消息转换

## 安装 Koog 和 Memory 功能

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
    ChatMemory 从 **0.7.0** 版本开始提供，该版本尚未发布到 Maven 中央仓库。在此期间，您可以从本地构建或快照仓库中使用它。

## 配置与初始化

### 基础设置 (Kotlin)

在代理块中使用 `installChatMemory` DSL 快捷方式安装 ChatMemory。默认情况下，它使用不带预处理器的内存中提供程序：

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

配置自定义提供程序和预处理器：

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

### 使用会话 ID 运行

`agent.run()` 的第二个参数是 ChatMemory 用于标识对话的会话 ID：

```kotlin
// 第一轮
agent.run("What is the capital of France?", "session-1")

// 第二轮 — 代理会看到之前的交流内容
agent.run("And what about Germany?", "session-1")
```

不同的会话 ID 会产生完全隔离的历史记录。

## 预处理器

预处理器在加载时（在代理看到消息之前）和存储时（在持久化之前）转换消息列表。它们按照添加的顺序顺序运行。

### 内置预处理器

| 配置方法 | 预处理器类 | 行为 |
|---|---|---|
| `windowSize(n)` | `WindowSizePreProcessor` | 仅保留最后 `n` 条消息 |
| `filterMessages { ... }` | `FilterMessagesPreProcessor` | 保留符合谓词条件的消息 |

### 顺序很重要

预处理器是链式调用的——每一个的输出都是下一个的输入：

```kotlin
// 效果：保留最后 10 条消息，然后从这 10 条中过滤掉较短的消息
windowSize(10)
filterMessages { it.content.length <= 100 }

// 效果：先过滤掉较短的消息，然后保留剩余消息中的最后 10 条
filterMessages { it.content.length <= 100 }
windowSize(10)
```

### 自定义预处理器

实现 `ChatMemoryPreProcessor` 接口：

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

## 自定义历史记录提供程序

默认的 `InMemoryChatHistoryProvider` 是线程安全的，但非持久化的（重启后历史记录会丢失）。对于生产环境，请实现 `ChatHistoryProvider`：

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

核心契约：
- `store` 会替换给定 `conversationId` 的整个历史记录（而非仅追加）
- `load` 在不存在历史记录时返回空列表（绝不返回 null）
- 两个方法都是 `suspend` 的，因此异步 I/O 是安全的

## Java API

所有配置方法都返回 `ChatMemoryConfig` 以支持流式链式调用：

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

`MessageFilter` 是一个 `fun interface`（函数式接口），因此 Java lambda 表达式可以直接使用。

## 典型用例：后端应用程序

ChatMemory 的一个常见模式是作为一个代表客户端管理代理交互的后端服务。每个 HTTP 请求都携带一个会话 ID，代理加载匹配的对话历史记录，生成响应，并存储更新后的历史记录——这一切都是透明完成的。

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

// --- 服务 ---

@Service
class ChatAgentService(private val executor: SingleLLMPromptExecutor) {
    private val toolRegistry = ToolRegistry {
        // 在此处注册您的工具
    }

    private val agent = AIAgent(
        promptExecutor = executor,
        llmModel = OpenAIModels.Chat.GPT4oMini,
        systemPrompt = "You are a helpful assistant.",
        toolRegistry = toolRegistry,
    ) {
        install(ChatMemory) {
            chatHistoryProvider = MyDatabaseProvider() // 持久化存储
            windowSize(50)
        }
    }

    suspend fun chat(sessionId: String, message: String): String {
        return agent.run(message, sessionId)
    }
}
```

有关在 Spring Boot 中设置 Koog 的完整指南，请参阅 [Spring Boot 集成指南](spring-boot.md)。

## ChatMemory 与持久化 (Persistence)

ChatMemory 和 [代理持久化](agent-persistence.md) 的用途不同，且可以配合使用。

**ChatMemory** 将每次 `agent.run()` 调用视为一个原子的、自包含的循环。对话历史记录在运行开始前加载，并在运行成功完成后存储。如果代理在执行中途崩溃，进行中的消息**不会**被保存——历史记录将保持在该次运行开始前的状态。

**持久化 (Persistence)** 则在运行期间将代理的内部执行状态（图形节点、消息历史记录、输入/输出）捕捉为检查点。如果代理崩溃，它可以从最后一个检查点恢复，而不是重新开始。

| | ChatMemory | 持久化 (Persistence) |
|---|---|---|
| **保存内容** | 跨多次运行的对话消息 | 单次运行内的执行状态 |
| **保存时机** | `agent.run()` 完成后 | 每个图形节点之后（或手动） |
| **崩溃行为** | 进行中的运行丢失；之前的历史记录完好 | 可以从最后一个检查点恢复 |
| **典型用途** | 多轮对话的连续性 | 长时间运行的代理、崩溃恢复 |

如果您的代理执行长时间运行的任务，且执行中途崩溃的成本很高，请考虑同时安装这两个功能：

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

1. **务必设置窗口大小 (window size)** — 如果不设置，提示词大小会随对话长度无限增长。
2. **谨慎选择预处理器的顺序** — 先过滤再分窗与先分窗再过滤会产生不同的结果。
3. **使用有意义的会话 ID** — 这些是实现历史记录隔离的键。用户 ID、聊天线程 ID 或 UUID 都是不错的选择。
4. **在生产环境中实现持久化提供程序** — `InMemoryChatHistoryProvider` 会在重启时丢失历史记录。