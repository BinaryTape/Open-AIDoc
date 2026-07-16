# Agent 持久化

Agent 持久化是为 Koog 框架中的 AI agent 提供检查点功能的一项功能。
它允许您在执行期间的特定点保存和恢复 agent 的状态，从而实现以下功能：

- 从特定点恢复 agent 执行
- 回滚到之前的状态
- 跨会话持久化 agent 状态

## 核心概念

### 检查点

检查点捕获 agent 在执行过程中特定点的完整状态，包括：

- 消息历史（用户、系统、助手和工具之间的所有交互）
- 正在执行的当前节点
- 当前节点的输入数据
- 创建时间戳

检查点通过唯一 ID 进行标识，并与特定的 agent 关联。

## 安装

要使用 Agent 持久化功能，请将其添加到 agent 的配置中：

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

## 配置选项

Agent 持久化功能有三个主要配置选项：

- **存储提供者 (Storage provider)**：用于保存和检索检查点的提供者。
- **连续持久化 (Continuous persistence)**：在每个节点运行后自动创建检查点。
- **回滚策略 (Rollback strategy)**：确定回滚到检查点时将恢复哪个状态。

### 存储提供者

设置将用于保存和检索检查点的存储提供者：

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

框架包含以下内置提供者：

- `InMemoryPersistenceStorageProvider`：将检查点存储在内存中（应用程序重启时会丢失）。
- `FilePersistenceStorageProvider`：将检查点持久化到文件系统。
- `NoPersistenceStorageProvider`：不存储检查点的空操作实现。这是默认提供者。

您还可以通过实现 `PersistenceStorageProvider` 接口来手动实现自定义存储提供者。
欲了解更多信息，请参阅[自定义存储提供者](#自定义存储提供者)。

### 连续持久化

连续持久化意味着在每个节点运行后都会自动创建一个检查点。
要禁用连续持久化，请使用以下代码：

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

如果禁用了连续持久化，您仍然可以手动创建检查点。

## 基本用法

### 创建检查点

要了解如何在 agent 执行的特定点创建检查点，请参阅下面的代码示例：

<!--- INCLUDE
import ai.koog.agents.core.agent.context.AIAgentContext
import ai.koog.agents.snapshot.feature.persistence
import ai.koog.serialization.typeToken

const val outputData = "some-output-data"
val outputType = typeToken<String>()
-->

```kotlin
suspend fun example(context: AIAgentContext) {
    // 创建当前状态的检查点
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

### 从检查点恢复

要从特定检查点恢复 agent 的状态，请参考以下代码示例：

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

#### 回滚工具产生的所有副作用

某些工具产生副作用是很常见的。具体来说，当您在后端运行 agent 时，某些工具可能会执行一些数据库事务。这使得您的 agent 更难进行“时间旅行”。

想象一下，您有一个工具 `createUser` 用于在数据库中创建新用户。您的 agent 随着时间的推移已经填充了多个工具调用：
```
tool call: createUser "Alex"

->>>> checkpoint-1 <<<<-

tool call: createUser "Daniel"
tool call: createUser "Maria"
```

现在您想回滚到一个检查点。仅恢复 agent 的状态（包括消息历史和策略图节点）不足以实现检查点之前的确切世界状态。您还应该恢复工具调用产生的副作用。在我们的示例中，这意味着从数据库中删除 `Maria` 和 `Daniel`。

使用 Koog Persistence，您可以通过向 `Persistence` 功能配置提供 `RollbackToolRegistry` 来实现这一点：

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
        // 对于每个 `createUser` 工具调用，回滚到所需的执行点时，
        // 将按相反顺序调用 `removeUser`。
        // 注意：`removeUser` 工具应采用与 `createUser` 完全相同的参数。
        // 开发者有责任确保 `removeUser` 的调用能回滚 `createUser` 的所有副作用：
        registerRollback(::createUser, ::removeUser)
    }
}
```

<!--- KNIT example-agent-persistence-06.kt -->

### 使用扩展函数

Agent 持久化功能提供了处理检查点的便捷扩展函数：

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

    // 或者使用检查点功能执行操作
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

## 高级用法

### 自定义存储提供者

您可以通过实现 `PersistenceStorageProvider` 接口来实现自定义存储提供者：

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

要在功能配置中使用您的自定义提供者，请在 agent 中配置 Agent 持久化功能时将其设置为存储。

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

### 设置执行点

对于高级控制，您可以直接设置 agent 的执行点：

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

这允许在仅从检查点恢复之外，对 agent 的状态进行更细粒度的控制。