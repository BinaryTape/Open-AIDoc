# Agent 持久化

Agent 持久化 (Agent Persistence) 是一項為 Koog 架構中的 AI Agent 提供檢查點 (checkpoint) 功能的特性。
它讓您能夠在執行過程中的特定點儲存與還原 Agent 的狀態，從而實現以下功能：

- 從特定點恢復 Agent 執行
- 復原 (Rolling back) 到先前的狀態
- 在不同工作階段 (session) 之間持久化 Agent 狀態

## 核心概念

### 檢查點 (Checkpoints)

檢查點會擷取 Agent 在執行過程中特定點的完整狀態，包括：

- 訊息歷程記錄 (使用者、系統、助手和工具之間的所有互動)
- 當前正在執行的節點
- 當前節點的輸入資料
- 建立時間戳記

檢查點透過唯一的 ID 進行識別，並與特定的 Agent 關聯。

## 安裝

若要使用 Agent 持久化功能，請將其新增至您的 Agent 配置中：

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
            // 使用記憶體內存儲來存放快照
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
            // 使用記憶體內存儲來存放快照
            cfg.setStorage(new InMemoryPersistenceStorageProvider());
        })
    .build();
    ```
    <!--- KNIT example-agent-persistence-java-01.java -->

## 配置選項

Agent 持久化功能具有三個主要配置選項：

- **存儲提供者 (Storage provider)**：用於儲存與檢索檢查點的提供者。
- **連續持久化 (Continuous persistence)**：在每個節點執行後自動建立檢查點。
- **復原策略 (Rollback strategy)**：決定復原到檢查點時將還原哪個狀態。

### 存儲提供者 (Storage provider)

設定用於儲存與檢索檢查點的存儲提供者：

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

架構包含以下內建提供者：

- `InMemoryPersistenceStorageProvider`：將檢查點儲存在記憶體中（應用程式重啟時會遺失）。
- `FilePersistenceStorageProvider`：將檢查點持久化到檔案系統。
- `NoPersistenceStorageProvider`：不儲存檢查點的無操作 (no-op) 實作。這是預設提供者。

您也可以透過實作 `PersistenceStorageProvider` 介面來實作自訂存儲提供者。
如需更多資訊，請參閱 [自訂存儲提供者](#自訂存儲提供者)。

### 連續持久化 (Continuous persistence)

連續持久化意味著在每個節點執行後會自動建立檢查點。
若要停用連續持久化，請使用以下程式碼：

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

如果停用了連續持久化，您仍然可以手動建立檢查點。

## 基本用法

### 建立檢查點

若要了解如何在 Agent 執行的特定點建立檢查點，請參閱下方的程式碼範例：

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
        // 使用當前狀態建立檢查點
        val checkpoint = context.persistence().createCheckpointAfterNode(
            agentContext = context,
            nodePath = context.executionInfo.path(),
            lastOutput = outputData,
            lastOutputType = outputType,
            checkpointId = context.runId,
            version = 0L
        )

        // 檢查點 ID 可以儲存供以後使用
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
    // PersistenceKt.persistence() 是 Kotlin 擴充函式的 Java 可存取形式
    Persistence persistence = PersistenceKt.persistence(context);

    // 使用當前狀態建立檢查點
    AgentCheckpointData checkpoint = persistence.createCheckpointAfterNode(
        context,
        context.getExecutionInfo().path(),
        outputData,
        TypeToken.of(String.class),
        0L,
        context.getRunId()
    );

    // 檢查點 ID 可以儲存供以後使用
    String checkpointId = checkpoint != null ? checkpoint.getCheckpointId() : null;
    ```
    <!--- KNIT example-agent-persistence-java-04.java -->

### 從檢查點還原

若要從特定的檢查點還原 Agent 的狀態，請遵循下方的程式碼範例：

=== "Kotlin"

    <!--- INCLUDE
    import ai.koog.agents.core.agent.context.AIAgentContext
    import ai.koog.agents.snapshot.feature.persistence
    -->
    ```kotlin
    suspend fun example(context: AIAgentContext, checkpointId: String) {
        // 復原到特定的檢查點
        context.persistence().rollbackToCheckpoint(checkpointId, context)

        // 或復原到最新的檢查點
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

    // 復原到特定的檢查點
    persistence.rollbackToCheckpoint(checkpointId, context);

    // 或復原到最新的檢查點
    persistence.rollbackToLatestCheckpoint(context);
    ```
    <!--- KNIT example-agent-persistence-java-05.java -->

#### 復原由工具產生的所有副作用

某些工具產生副作用是很常見的。具體而言，當您在後端執行 Agent 時，某些工具可能會執行一些資料庫交易。這會讓您的 Agent 更難以回溯時間。

想像您有一個工具 `createUser` 會在資料庫中建立新使用者。而您的 Agent 隨著時間推移已填入了多個工具呼叫：

```
tool call: createUser "Alex"

->>>> checkpoint-1 <<<<-

tool call: createUser "Daniel"
tool call: createUser "Maria"
```
 <!--- KNIT example-agent-persistence-01.txt -->

現在您想要復原到一個檢查點。僅還原 Agent 的狀態（包括訊息歷程記錄和策略圖節點）並不足以達成檢查點之前世界的確切狀態。您還應該還原工具呼叫所產生的副作用。在我們的範例中，這意味著要從資料庫中移除 `Maria` 和 `Daniel`。

使用 Koog Persistence，您可以透過向 `Persistence` 功能配置提供 `RollbackToolRegistry` 來達成此目的：

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
            // 當復原到所需的執行點時，
            // 對於每個 `createUser` 工具呼叫，都會按相反順序呼叫一次 `removeUser` 呼叫。
            // 注意：`removeUser` 工具應接收與 `createUser` 完全相同的引數。
            // 開發人員有責任確保 `removeUser` 的調用能復原 `createUser` 的所有副作用：
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
                    // 對於 UserToolSet 中的每個工具，UserRollbackToolSet 中都會有相應的復原工具，
                    // 並在復原時按相反順序呼叫。
                    // UserRollbackToolSet 方法必須使用 @Reverts 進行註解，
                    // 以將其連結到 UserToolSet 中的相應工具。
                    .registerRollbacks(new UserToolSet(), new UserRollbackToolSet())
                    .build()
            );
        })
        .build();
    ```
    <!--- KNIT example-agent-persistence-java-06.java -->

### 使用擴充函式

Agent 持久化功能提供了便於處理檢查點的擴充函式：

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
        // 存取檢查點功能
        val checkpointFeature = context.persistence()

        // 或使用檢查點功能執行操作
        context.withPersistence { ctx ->
            // 'this' 即為檢查點功能
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
    // 透過 PersistenceKt (Kotlin 擴充函式) 存取持久化功能
    Persistence persistence = PersistenceKt.persistence(context);

    // 直接使用持久化功能來建立檢查點
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

## 進階用法

### 自訂存儲提供者

您可以透過實作 `PersistenceStorageProvider` 介面來實作自訂存儲提供者：

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
            TODO("尚未實作")
        }

        override suspend fun saveCheckpoint(sessionId: String, agentCheckpointData: AgentCheckpointData) {
            TODO("尚未實作")
        }

        override suspend fun getLatestCheckpoint(sessionId: String, filter: MyFilterType?): AgentCheckpointData? {
            TODO("尚未實作")
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
            throw new UnsupportedOperationException("尚未實作");
        }

        @Override
        public CompletableFuture<Boolean> saveCheckpointAsync(
                String agentId, AgentCheckpointData checkpointData) {
            throw new UnsupportedOperationException("尚未實作");
        }

        @Override
        public CompletableFuture<AgentCheckpointData> getLatestCheckpointAsync(
                String agentId, Object filter) {
            throw new UnsupportedOperationException("尚未實作");
        }
    }
    ```
    <!--- KNIT example-agent-persistence-java-08.java -->

若要在功能配置中使用您的自訂提供者，請在 Agent 中配置 Agent 持久化功能時將其設定為 storage。

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
            TODO("尚未實作")
        }
        override suspend fun saveCheckpoint(sessionId: String, agentCheckpointData: AgentCheckpointData) {
            TODO("尚未實作")
        }
        override suspend fun getLatestCheckpoint(sessionId: String, filter: MyFilterType?): AgentCheckpointData? {
            TODO("尚未實作")
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

### 設定執行點

為了進行進階控制，您可以直接設定 Agent 的執行點：

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
        // 您可以在某個節點之前設定執行點並為其提供輸入：
        context.persistence().setExecutionPoint(
            agentContext = context,
            nodePath = context.executionInfo.path(),
            messageHistory = customMessageHistory,
            input = customInput
        )

        // 或在某個節點之後設定執行點並提供該節點的輸出：
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

    // 在節點之前設定執行點並為其提供輸入：
    persistence.setExecutionPoint(
        context,
        context.getExecutionInfo().path(),
        customMessageHistory,
        customInput
    );

    // 或在節點之後設定執行點並提供該節點的輸出：
    persistence.setExecutionPointAfterNode(
        context,
        context.getExecutionInfo().path(),
        customMessageHistory,
        customOutput
    );
    ```
    <!--- KNIT example-agent-persistence-java-10.java -->

這允許對 Agent 的狀態進行比僅從檢查點還原更細微的控制。