# Agent 持久化

Agent 持久化 (Agent Persistence) 是 Koog 框架中为 AI Agent 提供检查点 (checkpoint) 功能的一项功能。
它可以让您在执行过程中的特定点保存和恢复 Agent 的状态，从而实现以下功能：

- 从特定点恢复 Agent 执行
- 回滚到之前的状态
- 跨会话持久化 Agent 状态

## 核心概念

### 检查点 (Checkpoints)

检查点捕获 Agent 在其执行过程中特定点的完整状态，包括：

- 消息历史记录（用户、系统、助手和工具之间的所有交互）
- 当前正在执行的节点
- 当前节点的输入数据
- 创建时间戳

检查点通过唯一 ID 进行标识，并与特定的 Agent 相关联。

## 安装

要使用 Agent 持久化功能，请将其添加到 Agent 的配置中：

=== "Kotlin"

    <!--- INCLUDE
    import ai.koog.agents.core.agent.AIAgent
    import ai.koog.agents.snapshot.feature.Persistence
    import ai.koog.agents.snapshot.providers.InMemoryPersistenceStorageProvider
    import ai.koog.prompt.executor.llms.all.simpleOllamaAIExecutor
    import ai.koog.prompt.executor.ollama.client.OllamaModels
    import ai.koog.agents.core.agent.context.RollbackStrategy
    val executor = simpleOllamaAIExecutor()
    -->
    
    ```kotlin
    val agent = AIAgent(
        promptExecutor = executor,
        llmModel = OllamaModels.Meta.LLAMA_3_2,
    ) {
        install(Persistence) {
            // 为快照使用内存存储
            storage = InMemoryPersistenceStorageProvider()
        }
    }
    ```
    <!--- KNIT example-agent-persistence-01.kt -->

=== "Java"

    <!--- INCLUDE
    /**
    var executor = SimplePromptExecutorsKt.simpleOllamaAIExecutor("http://localhost:11434")
    -->
    <!--- SUFFIX
    **/
    -->
    ```java
    AIAgent<String, String> agent = AIAgent.builder()
        .promptExecutor(executor)
        .llmModel(OllamaModels.Meta.LLAMA_3_2)
        .install(Persistence.Feature, cfg -> {
            // 为快照使用内存存储
            cfg.setStorage(new InMemoryPersistenceStorageProvider());
        })
    .build();
    ```
    <!--- KNIT example-agent-persistence-java-01.java -->

## 配置选项

Agent 持久化功能有三个主要的配置选项：

- **存储提供者 (Storage provider)**：用于保存和检索检查点的提供者。
- **连续持久化 (Continuous persistence)**：每个节点运行后自动创建检查点。
- **回滚策略 (Rollback strategy)**：确定回滚到检查点时将恢复哪个状态。

### 存储提供者

设置将用于保存和检索检查点的存储提供者：

=== "Kotlin"

    <!--- INCLUDE
    import ai.koog.agents.core.agent.AIAgent
    import ai.koog.agents.snapshot.feature.Persistence
    import ai.koog.agents.snapshot.providers.InMemoryPersistenceStorageProvider
    import ai.koog.prompt.executor.llms.all.simpleOllamaAIExecutor
    import ai.koog.prompt.executor.ollama.client.OllamaModels
    val agent = AIAgent(
        promptExecutor = simpleOllamaAIExecutor(),
        llmModel = OllamaModels.Meta.LLAMA_3_2,
    ) {
    -->
    <!--- SUFFIX 
    } 
    -->
    ```kotlin
    install(Persistence) {
        storage = InMemoryPersistenceStorageProvider()
    }
    ```
    <!--- KNIT example-agent-persistence-02.kt -->

=== "Java"

    <!--- INCLUDE
    /**
    var executor = SimplePromptExecutorsKt.simpleOllamaAIExecutor("http://localhost:11434")
    -->
    <!--- SUFFIX
    **/
    -->
    ```java
    AIAgent<String, String> agent = AIAgent.builder()
        .promptExecutor(executor)
        .llmModel(OllamaModels.Meta.LLAMA_3_2)
        .install(Persistence.Feature, cfg -> {
            cfg.setStorage(new InMemoryPersistenceStorageProvider());
        })
        .build();
    ```
    <!--- KNIT example-agent-persistence-java-02.java -->

该框架包含以下内置提供者：

- `InMemoryPersistenceStorageProvider`：在内存中存储检查点（应用程序重启时丢失）。
- `FilePersistenceStorageProvider`：将检查点持久化到文件系统。
- `NoPersistenceStorageProvider`：不存储检查点的无操作 (no-op) 实现。这是默认提供者。

您还可以通过实现 `PersistenceStorageProvider` 接口来实现自定义存储提供者。
欲了解更多信息，请参阅 [自定义存储提供者](#custom-storage-providers)。

### 连续持久化

连续持久化意味着在每个节点运行后都会自动创建一个检查点。
要禁用连续持久化，请使用以下代码：

=== "Kotlin"

    <!--- INCLUDE
    import ai.koog.agents.core.agent.AIAgent
    import ai.koog.agents.snapshot.feature.Persistence
    import ai.koog.agents.snapshot.providers.InMemoryPersistenceStorageProvider
    import ai.koog.prompt.executor.llms.all.simpleOllamaAIExecutor
    import ai.koog.prompt.executor.ollama.client.OllamaModels
    val agent = AIAgent(
        promptExecutor = simpleOllamaAIExecutor(),
        llmModel = OllamaModels.Meta.LLAMA_3_2,
    ) {
    -->
    <!--- SUFFIX 
    } 
    -->
    
    ```kotlin
    install(Persistence) {
        enableAutomaticPersistence = false
    }
    ```
    <!--- KNIT example-agent-persistence-03.kt -->

=== "Java"

    <!--- INCLUDE
    /**
    var executor = SimplePromptExecutorsKt.simpleOllamaAIExecutor("http://localhost:11434")
    -->
    <!--- SUFFIX
    **/
    -->
    ```java
    AIAgent<String, String> agent = AIAgent.builder()
        .promptExecutor(executor)
        .llmModel(OllamaModels.Meta.LLAMA_3_2)
        .install(Persistence.Feature, cfg -> {
            cfg.setEnableAutomaticPersistence(true);
        })
        .build();
    ```
    <!--- KNIT example-agent-persistence-java-03.java -->

如果禁用了连续持久化，您仍然可以手动创建检查点。

## 基本用法

### 创建检查点

要了解如何在 Agent 执行过程中的特定点创建检查点，请参阅下面的代码示例：

=== "Kotlin"

    <!--- INCLUDE
    import ai.koog.agents.core.agent.context.AIAgentContext
    import ai.koog.agents.snapshot.feature.persistence
    import ai.koog.serialization.typeToken
    const val outputData = "some-output-data"
    val outputType = typeToken<String>()
    -->
    ```kotlin
    suspend fun example(context: AIAgentContext) {
        // 使用当前状态创建检查点
        val checkpoint = context.persistence().createCheckpointAfterNode(
            agentContext = context,
            nodePath = context.executionInfo.path(),
            lastOutput = outputData,
            lastOutputType = outputType,
            checkpointId = context.runId,
            version = 0L
        )

        // 检查点 ID 可以存储供以后使用
        val checkpointId = checkpoint?.checkpointId
    }
    ```
    <!--- KNIT example-agent-persistence-04.kt -->

=== "Java"

    <!--- INCLUDE
    /**
    -->
    <!--- SUFFIX
    **/
    -->
    ```java
    // PersistenceKt.persistence() 是 Kotlin 扩展函数的 Java 可访问形式
    Persistence persistence = PersistenceKt.persistence(context);

    // 使用当前状态创建检查点
    AgentCheckpointData checkpoint = persistence.createCheckpointAfterNode(
        context,
        context.getExecutionInfo().path(),
        outputData,
        TypeToken.of(String.class),
        0L,
        context.getRunId()
    );

    // 检查点 ID 可以存储供以后使用
    String checkpointId = checkpoint != null ? checkpoint.getCheckpointId() : null;
    ```
    <!--- KNIT example-agent-persistence-java-04.java -->

### 从检查点恢复

要从特定检查点恢复 Agent 的状态，请参考下面的代码示例：

=== "Kotlin"

    <!--- INCLUDE
    import ai.koog.agents.core.agent.context.AIAgentContext
    import ai.koog.agents.snapshot.feature.persistence
    -->
    ```kotlin
    suspend fun example(context: AIAgentContext, checkpointId: String) {
        // 回滚到特定检查点
        context.persistence().rollbackToCheckpoint(checkpointId, context)

        // 或者回滚到最新的检查点
        context.persistence().rollbackToLatestCheckpoint(context)
    }
    ```
    <!--- KNIT example-agent-persistence-05.kt -->

=== "Java"

    <!--- INCLUDE
    /**
    -->
    <!--- SUFFIX
    **/
    -->
    ```java
    Persistence persistence = PersistenceKt.persistence(context);

    // 回滚到特定检查点
    persistence.rollbackToCheckpoint(checkpointId, context);

    // 或者回滚到最新的检查点
    persistence.rollbackToLatestCheckpoint(context);
    ```
    <!--- KNIT example-agent-persistence-java-05.java -->

#### 回滚由工具产生的所有副作用

某些工具产生副作用是很常见的。具体来说，当您在后端运行 Agent 时，某些工具可能会执行一些数据库事务。这使得 Agent 回溯时间变得更加困难。

假设您有一个工具 `createUser`，它会在您的数据库中创建一个新用户。随着时间的推移，您的 Agent 已经产生了多个工具调用：

```
tool call: createUser "Alex"

->>>> checkpoint-1 <<<<-

tool call: createUser "Daniel"
tool call: createUser "Maria"
```
 <!--- KNIT example-agent-persistence-01.txt -->

现在您想回滚到一个检查点。仅恢复 Agent 的状态（包括消息历史记录和策略图节点）不足以实现检查点之前的确切世界状态。您还应该恢复工具调用产生的副作用。在我们的示例中，这意味着从数据库中移除 `Maria` 和 `Daniel`。

使用 Koog 持久化，您可以通过向 `Persistence` 功能配置提供 `RollbackToolRegistry` 来实现这一点：

=== "Kotlin"

    <!--- INCLUDE
    import ai.koog.agents.core.agent.AIAgent
    import ai.koog.agents.snapshot.feature.Persistence
    import ai.koog.agents.snapshot.providers.InMemoryPersistenceStorageProvider
    import ai.koog.prompt.executor.llms.all.simpleOllamaAIExecutor
    import ai.koog.prompt.executor.ollama.client.OllamaModels
    import ai.koog.agents.snapshot.feature.RollbackToolRegistry
    fun createUser(name: String) {}
    fun removeUser(name: String) {}
    val agent = AIAgent(
        promptExecutor = simpleOllamaAIExecutor(),
        llmModel = OllamaModels.Meta.LLAMA_3_2,
    ) {
    -->
    <!--- SUFFIX 
    } 
    -->
    ```kotlin
    install(Persistence) {
        enableAutomaticPersistence = true
        rollbackToolRegistry = RollbackToolRegistry {
            // 当回滚到所需的执行点时，
            // 对于每个 `createUser` 工具调用，都会按相反顺序调用一次 `removeUser`。
            // 注意：`removeUser` 工具应接收与 `createUser` 完全相同的参数。
            // 开发者有责任确保 `removeUser` 的调用能回滚 `createUser` 的所有副作用：
            registerRollback(::createUser, ::removeUser)
        }
    }
    ```
    <!--- KNIT example-agent-persistence-06.kt -->

=== "Java"

    <!--- INCLUDE
    /**
    var executor = SimplePromptExecutorsKt.simpleOllamaAIExecutor("http://localhost:11434")
    -->
    <!--- SUFFIX
    **/
    -->
    ```java
    AIAgent<String, String> agent = AIAgent.builder()
        .promptExecutor(executor)
        .llmModel(OllamaModels.Meta.LLAMA_3_2)
        .install(Persistence.Feature, cfg -> {
            cfg.setEnableAutomaticPersistence(true);
            cfg.setRollbackToolRegistry(
                RollbackToolRegistry.builder()
                    // 对于 UserToolSet 中的每个工具，在 UserRollbackToolSet 中都会有一个对应的回滚工具，
                    // 在回滚时按相反顺序调用。
                    // UserRollbackToolSet 方法必须使用 @Reverts 进行注解，以便将它们链接到 UserToolSet 中对应的工具。
                    .registerRollbacks(new UserToolSet(), new UserRollbackToolSet())
                    .build()
            );
        })
        .build();
    ```
    <!--- KNIT example-agent-persistence-java-06.java -->

### 使用扩展函数

Agent 持久化功能提供了用于处理检查点的便捷扩展函数：

=== "Kotlin"

    <!--- INCLUDE
    import ai.koog.agents.core.agent.context.AIAgentContext
    import ai.koog.agents.example.exampleAgentPersistence04.outputData
    import ai.koog.agents.example.exampleAgentPersistence04.outputType
    import ai.koog.agents.snapshot.feature.persistence
    import ai.koog.agents.snapshot.feature.withPersistence
    -->
    ```kotlin
    suspend fun example(context: AIAgentContext) {
        // 访问检查点功能
        val checkpointFeature = context.persistence()

        // 或使用检查点功能执行操作
        context.withPersistence { ctx ->
            // 'this' 是检查点功能
            createCheckpointAfterNode(
                agentContext = ctx,
                nodePath = ctx.executionInfo.path(),
                lastOutput = outputData,
                lastOutputType = outputType,
                checkpointId = ctx.runId,
                version = 0L
            )
        }
    }
    ```
    <!--- KNIT example-agent-persistence-07.kt -->

=== "Java"

    <!--- INCLUDE
    /**
    -->
    <!--- SUFFIX
    **/
    -->
    ```java
    // 通过 PersistenceKt（Kotlin 扩展函数）访问持久化功能
    Persistence persistence = PersistenceKt.persistence(context);

    // 直接使用持久化功能创建检查点
    persistence.createCheckpointAfterNode(
        context,
        context.getExecutionInfo().path(),
        outputData,
        TypeToken.of(String.class),
        0L,
        context.getRunId()
    );
    ```
    <!--- KNIT example-agent-persistence-java-07.java -->

## 高级用法

### 自定义存储提供者

您可以通过实现 `PersistenceStorageProvider` 接口来实现自定义存储提供者：

=== "Kotlin"

    <!--- INCLUDE
    import ai.koog.agents.snapshot.feature.AgentCheckpointData
    import ai.koog.agents.snapshot.providers.PersistenceStorageProvider
    /*
    // KNIT: Ignore example
    -->
    <!--- SUFFIX
    */
    -->
    ```kotlin
    class MyCustomStorageProvider<MyFilterType> : PersistenceStorageProvider<MyFilterType> {
        override suspend fun getCheckpoints(sessionId: String, filter: MyFilterType?): `List<AgentCheckpointData>` {
            TODO("尚未实现")
        }

        override suspend fun saveCheckpoint(sessionId: String, agentCheckpointData: AgentCheckpointData) {
            TODO("尚未实现")
        }

        override suspend fun getLatestCheckpoint(sessionId: String, filter: MyFilterType?): AgentCheckpointData? {
            TODO("尚未实现")
        }
    }
    ```
    <!--- KNIT example-agent-persistence-08.kt -->

=== "Java"

    <!--- INCLUDE
    /**
    -->
    <!--- SUFFIX
    **/
    -->
    ```java
    class MyCustomStorageProvider extends AsyncPersistenceStorageProvider<Object> {
        @Override
        public CompletableFuture<List<AgentCheckpointData>> getCheckpointsAsync(
                String agentId, Object filter) {
            throw new UnsupportedOperationException("尚未实现");
        }

        @Override
        public CompletableFuture<Boolean> saveCheckpointAsync(
                String agentId, AgentCheckpointData checkpointData) {
            throw new UnsupportedOperationException("尚未实现");
        }

        @Override
        public CompletableFuture<AgentCheckpointData> getLatestCheckpointAsync(
                String agentId, Object filter) {
            throw new UnsupportedOperationException("尚未实现");
        }
    }
    ```
    <!--- KNIT example-agent-persistence-java-08.java -->

要在功能配置中使用您的自定义提供者，请在 Agent 中配置 Agent 持久化功能时将其设置为存储。

=== "Kotlin"

    <!--- INCLUDE
    import ai.koog.agents.core.agent.AIAgent
    import ai.koog.agents.snapshot.feature.AgentCheckpointData
    import ai.koog.agents.snapshot.feature.Persistence
    import ai.koog.agents.snapshot.providers.PersistenceStorageProvider
    import ai.koog.prompt.executor.llms.all.simpleOllamaAIExecutor
    import ai.koog.prompt.executor.ollama.client.OllamaModels
    class MyCustomStorageProvider<MyFilterType> : PersistenceStorageProvider<MyFilterType> {
        override suspend fun getCheckpoints(sessionId: String, filter: MyFilterType?): `List<AgentCheckpointData>` {
            TODO("尚未实现")
        }
        override suspend fun saveCheckpoint(sessionId: String, agentCheckpointData: AgentCheckpointData) {
            TODO("尚未实现")
        }
        override suspend fun getLatestCheckpoint(sessionId: String, filter: MyFilterType?): AgentCheckpointData? {
            TODO("尚未实现")
        }
    }
    val agent = AIAgent(
        promptExecutor = simpleOllamaAIExecutor(),
        llmModel = OllamaModels.Meta.LLAMA_3_2,
    ) {
    -->
    <!--- SUFFIX 
    } 
    -->
    ```kotlin
    install(Persistence) {
        storage = MyCustomStorageProvider<Any>()
    }
    ```
    <!--- KNIT example-agent-persistence-09.kt -->

=== "Java"

    <!--- INCLUDE
    /**
    var executor = SimplePromptExecutorsKt.simpleOllamaAIExecutor("http://localhost:11434")
    -->
    <!--- SUFFIX
    **/
    -->
    ```java
    AIAgent<String, String> agent = AIAgent.builder()
        .promptExecutor(executor)
        .llmModel(OllamaModels.Meta.LLAMA_3_2)
        .install(Persistence.Feature, cfg -> {
            cfg.setStorage(new MyCustomStorageProvider());
        })
        .build();
    ```
    <!--- KNIT example-agent-persistence-java-09.java -->

### 设置执行点

为了进行高级控制，您可以直接设置 Agent 的执行点：

=== "Kotlin"

    <!--- INCLUDE
    import ai.koog.agents.core.agent.context.AIAgentContext
    import ai.koog.agents.snapshot.feature.persistence
    import ai.koog.prompt.message.Message.User
    import ai.koog.serialization.JSONPrimitive
    val customInput = JSONPrimitive("custom-input")
    val customOutput = JSONPrimitive("custom-output")
    val customMessageHistory = emptyList<User>()
    -->
    ```kotlin
    suspend fun example(context: AIAgentContext) {
        // 您可以在某个节点之前设置执行点并为其提供输入：
        context.persistence().setExecutionPoint(
            agentContext = context,
            nodePath = context.executionInfo.path(),
            messageHistory = customMessageHistory,
            input = customInput
        )

        // 或者在某个节点之后设置执行点并提供该节点的输出：
        context.persistence().setExecutionPointAfterNode(
            agentContext = context,
            nodePath = context.executionInfo.path(),
            messageHistory = customMessageHistory,
            output = customOutput
        )
    }

    ```
    <!--- KNIT example-agent-persistence-10.kt -->

=== "Java"

    <!--- INCLUDE
    /**
    -->
    <!--- SUFFIX
    **/
    -->
    ```java
    Persistence persistence = PersistenceKt.persistence(context);

    // 在节点之前设置执行点并为其提供输入：
    persistence.setExecutionPoint(
        context,
        context.getExecutionInfo().path(),
        customMessageHistory,
        customInput
    );

    // 或者在节点之后设置执行点并提供该节点的输出：
    persistence.setExecutionPointAfterNode(
        context,
        context.getExecutionInfo().path(),
        customMessageHistory,
        customOutput
    );
    ```
    <!--- KNIT example-agent-persistence-java-10.java -->

除了仅从检查点恢复之外，这还允许对 Agent 的状态进行更精细的控制。