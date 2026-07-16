# Agent 持久化

Agent 持久化是一項為 Koog 架構中的 AI Agent 提供檢查點 (checkpoint) 功能的特性。
它讓您可以儲存並在執行過程中的特定點回復 Agent 的狀態，從而實現以下功能：

- 從特定點恢復 Agent 執行
- 回復至先前的狀態
- 在不同工作階段之間持久化 Agent 狀態

## 核心概念

### 檢查點 (Checkpoints)

檢查點會擷取 Agent 在執行過程中特定點的完整狀態，包括：

- 訊息歷程記錄（使用者、系統、小助手與工具之間的所有互動）
- 目前正在執行的節點
- 目前節點的輸入資料
- 建立的時間戳記

檢查點由唯一 ID 識別，並與特定的 Agent 相關聯。

## 安裝

要使用 Agent 持久化特性，請將其新增至您的 Agent 配置中：

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

## 配置選項

Agent 持久化特性有三個主要的配置選項：

- **儲存提供者 (Storage provider)**：用於儲存與檢索檢查點的提供者。
- **連續持久化 (Continuous persistence)**：在每個節點執行後自動建立檢查點。
- **回復策略 (Rollback strategy)**：決定在回復至檢查點時將回復哪些狀態。

### 儲存提供者 (Storage provider)

設定用於儲存與檢索檢查點的儲存提供者：

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

該架構包含以下內建提供者：

- `InMemoryPersistenceStorageProvider`：將檢查點儲存在記憶體中（應用程式重啟時會遺失）。
- `FilePersistenceStorageProvider`：將檢查點持久化到檔案系統。
- `NoPersistenceStorageProvider`：不儲存檢查點的無操作 (no-op) 實作。這是預設的提供者。

您也可以透過實作 `PersistenceStorageProvider` 介面來實作自訂儲存提供者。
如需更多資訊，請參閱 [自訂儲存提供者](#自訂儲存提供者)。

### 連續持久化 (Continuous persistence)

連續持久化意味著在每個節點執行後都會自動建立一個檢查點。
要停用連續持久化，請使用以下程式碼：

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

如果停用了連續持久化，您仍然可以手動建立檢查點。

## 基本用法

### 建立檢查點

若要了解如何在 Agent 執行的特定點建立檢查點，請參閱下方的程式碼範例：

<!--- INCLUDE
import ai.koog.agents.core.agent.context.AIAgentContext
import ai.koog.agents.snapshot.feature.persistence
import ai.koog.serialization.typeToken

const val outputData = "some-output-data"
val outputType = typeToken<String>()
-->

```kotlin
suspend fun example(context: AIAgentContext) {
    // 建立帶有目前狀態的檢查點
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

### 從檢查點回復

若要從特定檢查點回復 Agent 的狀態，請參考下方的程式碼範例：

<!--- INCLUDE
import ai.koog.agents.core.agent.context.AIAgentContext
import ai.koog.agents.snapshot.feature.persistence
-->

```kotlin
suspend fun example(context: AIAgentContext, checkpointId: String) {
    // 回復至特定的檢查點
    context.persistence().rollbackToCheckpoint(checkpointId, context)

    // 或者回復至最新的檢查點
    context.persistence().rollbackToLatestCheckpoint(context)
}
```

<!--- KNIT example-agent-persistence-05.kt -->

#### 回復由工具產生的所有副作用

某些工具產生副作用是非常常見的。具體來說，當您在後端執行 Agent 時，某些工具可能會執行一些資料庫交易。這使得您的 Agent 進行時光旅行（回復到過去）變得更加困難。

想像一下，您有一個工具 `createUser` 會在資料庫中建立一個新使用者。而您的 Agent 隨著時間產生了多個工具呼叫：
```
工具呼叫：createUser "Alex"

->>>> 檢查點-1 <<<<-

工具呼叫：createUser "Daniel"
工具呼叫：createUser "Maria"
```

現在您想要回復到某個檢查點。僅僅回復 Agent 的狀態（包括訊息歷程記錄和策略圖節點）不足以實現檢查點之前的確切世界狀態。您還應該回復由工具呼叫產生的副作用。在我們的範例中，這意味著要從資料庫中移除 `Maria` 和 `Daniel`。

使用 Koog Persistence，您可以透過在 `Persistence` 特性配置中提供 `RollbackToolRegistry` 來達成此目的：

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
        // 對於每個 `createUser` 工具呼叫，在回復到所需的執行點時，
        // 將以相反的順序調用 `removeUser`。
        // 注意：`removeUser` 工具應採用與 `createUser` 完全相同的引數。
        // 開發人員有責任確保 `removeUser` 的調用能回復 `createUser` 的所有副作用：
        registerRollback(::createUser, ::removeUser)
    }
}
```

<!--- KNIT example-agent-persistence-06.kt -->

### 使用擴充函式

Agent 持久化特性提供了便於操作檢查點的擴充函式：

<!--- INCLUDE
import ai.koog.agents.core.agent.context.AIAgentContext
import ai.koog.agents.example.exampleAgentPersistence04.outputData
import ai.koog.agents.example.exampleAgentPersistence04.outputType
import ai.koog.agents.snapshot.feature.persistence
import ai.koog.agents.snapshot.feature.withPersistence
-->

```kotlin
suspend fun example(context: AIAgentContext) {
    // 存取檢查點特性
    val checkpointFeature = context.persistence()

    // 或者使用檢查點特性執行操作
    context.withPersistence { ctx ->
        // 'this' 即為檢查點特性
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

## 進階用法

### 自訂儲存提供者

您可以透過實作 `PersistenceStorageProvider` 介面來實作自訂儲存提供者：

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

要在特性配置中使用您的自訂提供者，請在 Agent 中配置 Agent 持久化特性時將其設定為儲存。

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

### 設定執行點

為了進行進階控制，您可以直接設定 Agent 的執行點：

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
fun example(context: AIAgentContext) {
    // 您可以在某個節點之前設定執行點，並為其提供輸入：
    context.persistence().setExecutionPoint(
        agentContext = context,
        nodePath = context.executionInfo.path(),
        messageHistory = customMessageHistory,
        input = customInput
    )

    // 或者在某個節點之後設定執行點，並提供該節點的輸出：
    context.persistence().setExecutionPointAfterNode(
        agentContext = context,
        nodePath = context.executionInfo.path(),
        messageHistory = customMessageHistory,
        output = customOutput
    )
}

```

<!--- KNIT example-agent-persistence-10.kt -->

除了僅僅從檢查點回復之外，這還允許對 Agent 的狀態進行更細粒度的控制。