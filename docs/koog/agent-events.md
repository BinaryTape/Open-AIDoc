# Agent 事件

Agent 事件是在 Agent 工作流中发生的操作或交互。它们包括：

- Agent 生命周期事件
- 策略事件
- 节点执行事件
- LLM 调用事件
- LLM 流式传输事件
- 工具执行事件

注意：特性（Feature）事件在 `agents-core` 模块中定义，位于包 `ai.koog.agents.core.feature.model.events` 下。`agents-features-trace` 和 `agents-features-event-handler` 等特性会使用这些事件来处理和转发 Agent 执行期间创建的消息。

## 预定义事件类型

Koog 提供了可在自定义消息处理器中使用的预定义事件类型。根据它们所关联的实体，预定义事件可以分为以下几类：

- [Agent 事件](#agent-events)
- [策略事件](#strategy-events)
- [节点事件](#node-events)
- [子图事件](#subgraph-events)
- [LLM 调用事件](#llm-call-events)
- [LLM 流式传输事件](#llm-streaming-events)
- [工具执行事件](#tool-execution-events)

### Agent 事件

#### AgentStartingEvent

表示 Agent 运行的开始。包含以下字段：

| 名称 | 数据类型 | 必填 | 默认值 | 描述 |
|-----------------|---------------------|----------|---------|----------------------------------------------------------------------------|
| `eventId`       | String              | 是      |         | 事件或一组事件的唯一标识符。 |
| `executionInfo` | AgentExecutionInfo  | 是      |         | 提供与此事件关联的执行上下文信息。 |
| `agentId`       | String              | 是      |         | AI Agent 的唯一标识符。 |
| `runId`         | String              | 是      |         | AI Agent 运行的唯一标识符。 |

#### AgentCompletedEvent

表示 Agent 运行的结束。包含以下字段：

| 名称 | 数据类型 | 必填 | 默认值 | 描述 |
|-----------------|---------------------|----------|---------|---------------------------------------------------------------------------------|
| `eventId`       | String              | 是      |         | 事件或一组事件的唯一标识符。 |
| `executionInfo` | AgentExecutionInfo  | 是      |         | 提供与此事件关联的执行上下文信息。 |
| `agentId`       | String              | 是      |         | AI Agent 的唯一标识符。 |
| `runId`         | String              | 是      |         | AI Agent 运行的唯一标识符。 |
| `result`        | String              | 是      |         | Agent 运行的结果。如果没有结果，可以为 `null`。 |

#### AgentExecutionFailedEvent

表示 Agent 运行期间发生的错误。包含以下字段：

| 名称 | 数据类型 | 必填 | 默认值 | 描述 |
|-----------------|---------------------|----------|---------|-----------------------------------------------------------------------------------------------------------------|
| `eventId`       | String              | 是      |         | 事件或一组事件的唯一标识符。 |
| `executionInfo` | AgentExecutionInfo  | 是      |         | 提供与此事件关联的执行上下文信息。 |
| `agentId`       | String              | 是      |         | AI Agent 的唯一标识符。 |
| `runId`         | String              | 是      |         | AI Agent 运行的唯一标识符。 |
| `error`         | AIAgentError        | 是      |         | Agent 运行期间发生的特定错误。有关更多信息，请参阅 [AIAgentError](#aiagenterror)。 |

#### AgentClosingEvent

表示 Agent 的关闭或终止。包含以下字段：

| 名称 | 数据类型 | 必填 | 默认值 | 描述 |
|-----------------|---------------------|----------|---------|----------------------------------------------------------------------------|
| `eventId`       | String              | 是      |         | 事件或一组事件的唯一标识符。 |
| `executionInfo` | AgentExecutionInfo  | 是      |         | 提供与此事件关联的执行上下文信息。 |
| `agentId`       | String              | 是      |         | AI Agent 的唯一标识符。 |

<a id="aiagenterror"></a>
`AIAgentError` 类提供了关于 Agent 运行期间发生错误的更多细节。包含以下字段：

| 名称 | 数据类型 | 必填 | 默认值 | 描述 |
|--------------|-----------|----------|---------|------------------------------------------------------------------|
| `message`    | String    | 是      |         | 提供关于特定错误更多细节的消息。 |
| `stackTrace` | String    | 是      |         | 直到最后执行的代码的堆栈记录集合。 |
| `cause`      | String    | 否       | null    | 错误的根本原因（如果可用）。 |

<a id="agentexecutioninfo"></a>
`AgentExecutionInfo` 类提供了关于执行路径的上下文信息，从而能够跟踪 Agent 运行中的嵌套执行上下文。包含以下字段：

| 名称 | 数据类型 | 必填 | 默认值 | 描述 |
|------------|---------------------|----------|---------|------------------------------------------------------------------------------------------------|
| `parent`   | AgentExecutionInfo  | 否       | null    | 对父级执行上下文的引用。如果为 null，则表示根执行级别。 |
| `partName` | String              | 是      |         | 表示当前执行部分或片段名称的字符串。 |

### 策略事件

#### GraphStrategyStartingEvent

表示基于图的策略运行的开始。包含以下字段：

| 名称 | 数据类型 | 必填 | 默认值 | 描述 |
|-----------------|------------------------|----------|---------|----------------------------------------------------------------------------|
| `eventId`       | String                 | 是      |         | 事件或一组事件的唯一标识符。 |
| `executionInfo` | AgentExecutionInfo     | 是      |         | 提供与此事件关联的执行上下文信息。 |
| `runId`         | String                 | 是      |         | 策略运行的唯一标识符。 |
| `strategyName`  | String                 | 是      |         | 策略的名称。 |
| `graph`         | StrategyEventGraph     | 是      |         | 表示策略工作流的图结构。 |

#### FunctionalStrategyStartingEvent

表示函数式策略运行的开始。包含以下字段：

| 名称 | 数据类型 | 必填 | 默认值 | 描述 |
|-----------------|---------------------|----------|---------|----------------------------------------------------------------------------|
| `eventId`       | String              | 是      |         | 事件或一组事件的唯一标识符。 |
| `executionInfo` | AgentExecutionInfo  | 是      |         | 提供与此事件关联的执行上下文信息。 |
| `runId`         | String              | 是      |         | 策略运行的唯一标识符。 |
| `strategyName`  | String              | 是      |         | 策略的名称。 |

#### StrategyCompletedEvent

表示策略运行的结束。包含以下字段：

| 名称 | 数据类型 | 必填 | 默认值 | 描述 |
|-----------------|---------------------|----------|---------|----------------------------------------------------------------------------|
| `eventId`       | String              | 是      |         | 事件或一组事件的唯一标识符。 |
| `executionInfo` | AgentExecutionInfo  | 是      |         | 提供与此事件关联的执行上下文信息。 |
| `runId`         | String              | 是      |         | 策略运行的唯一标识符。 |
| `strategyName`  | String              | 是      |         | 策略的名称。 |
| `result`        | String              | 是      |         | 运行的结果。如果没有结果，可以为 `null`。 |

### 节点事件

#### NodeExecutionStartingEvent

表示节点运行的开始。包含以下字段：

| 名称 | 数据类型 | 必填 | 默认值 | 描述 |
|-----------------|---------------------|----------|---------|----------------------------------------------------------------------------|
| `eventId`       | String              | 是      |         | 事件或一组事件的唯一标识符。 |
| `executionInfo` | AgentExecutionInfo  | 是      |         | 提供与此事件关联的执行上下文信息。 |
| `runId`         | String              | 是      |         | 策略运行的唯一标识符。 |
| `nodeName`      | String              | 是      |         | 开始运行的节点名称。 |
| `input`         | JsonElement         | 否       | null    | 节点的输入值。 |

#### NodeExecutionCompletedEvent

表示节点运行的结束。包含以下字段：

| 名称 | 数据类型 | 必填 | 默认值 | 描述 |
|-----------------|---------------------|----------|---------|----------------------------------------------------------------------------|
| `eventId`       | String              | 是      |         | 事件或一组事件的唯一标识符。 |
| `executionInfo` | AgentExecutionInfo  | 是      |         | 提供与此事件关联的执行上下文信息。 |
| `runId`         | String              | 是      |         | 策略运行的唯一标识符。 |
| `nodeName`      | String              | 是      |         | 结束运行的节点名称。 |
| `input`         | JsonElement         | 否       | null    | 节点的输入值。 |
| `output`        | JsonElement         | 否       | null    | 节点产生的输出值。 |

#### NodeExecutionFailedEvent

表示节点运行期间发生的错误。包含以下字段：

| 名称 | 数据类型 | 必填 | 默认值 | 描述 |
|-----------------|---------------------|----------|---------|-----------------------------------------------------------------------------------------------------------------|
| `eventId`       | String              | 是      |         | 事件或一组事件的唯一标识符。 |
| `executionInfo` | AgentExecutionInfo  | 是      |         | 提供与此事件关联的执行上下文信息。 |
| `runId`         | String              | 是      |         | 策略运行的唯一标识符。 |
| `nodeName`      | String              | 是      |         | 发生错误的节点名称。 |
| `input`         | JsonElement         | 否       | null    | 提供给节点的输入数据。 |
| `error`         | AIAgentError        | 是      |         | 节点运行期间发生的特定错误。有关更多信息，请参阅 [AIAgentError](#aiagenterror)。 |

### 子图事件

#### SubgraphExecutionStartingEvent

表示子图运行的开始。包含以下字段：

| 名称 | 数据类型 | 必填 | 默认值 | 描述 |
|-----------------|---------------------|----------|---------|----------------------------------------------------------------------------|
| `eventId`       | String              | 是      |         | 事件或一组事件的唯一标识符。 |
| `executionInfo` | AgentExecutionInfo  | 是      |         | 提供与此事件关联的执行上下文信息。 |
| `runId`         | String              | 是      |         | 策略运行的唯一标识符。 |
| `subgraphName`  | String              | 是      |         | 开始运行的子图名称。 |
| `input`         | JsonElement         | 否       | null    | 子图的输入值。 |

#### SubgraphExecutionCompletedEvent

表示子图运行的结束。包含以下字段：

| 名称 | 数据类型 | 必填 | 默认值 | 描述 |
|-----------------|---------------------|----------|---------|----------------------------------------------------------------------------|
| `eventId`       | String              | 是      |         | 事件或一组事件的唯一标识符。 |
| `executionInfo` | AgentExecutionInfo  | 是      |         | 提供与此事件关联的执行上下文信息。 |
| `runId`         | String              | 是      |         | 策略运行的唯一标识符。 |
| `subgraphName`  | String              | 是      |         | 结束运行的子图名称。 |
| `input`         | JsonElement         | 否       | null    | 子图的输入值。 |
| `output`        | JsonElement         | 否       | null    | 子图产生的输出值。 |

#### SubgraphExecutionFailedEvent

表示子图运行期间发生的错误。包含以下字段：

| 名称 | 数据类型 | 必填 | 默认值 | 描述 |
|-----------------|---------------------|----------|---------|-----------------------------------------------------------------------------------------------------------------|
| `eventId`       | String              | 是      |         | 事件或一组事件的唯一标识符。 |
| `executionInfo` | AgentExecutionInfo  | 是      |         | 提供与此事件关联的执行上下文信息。 |
| `runId`         | String              | 是      |         | 策略运行的唯一标识符。 |
| `subgraphName`  | String              | 是      |         | 发生错误的子图名称。 |
| `input`         | JsonElement         | 否       | null    | 提供给子图的输入数据。 |
| `error`         | AIAgentError        | 是      |         | 子图运行期间发生的特定错误。有关更多信息，请参阅 [AIAgentError](#aiagenterror)。 |

### LLM 调用事件

#### LLMCallStartingEvent

表示 LLM 调用的开始。包含以下字段：

| 名称 | 数据类型 | 必填 | 默认值 | 描述 |
|-----------------|---------------------|----------|---------|------------------------------------------------------------------------------------|
| `eventId`       | String              | 是      |         | 事件或一组事件的唯一标识符。 |
| `executionInfo` | AgentExecutionInfo  | 是      |         | 提供与此事件关联的执行上下文信息。 |
| `runId`         | String              | 是      |         | LLM 运行的唯一标识符。 |
| `prompt`        | Prompt              | 是      |         | 发送给模型的提示词。有关更多信息，请参阅 [Prompt](#prompt)。 |
| `model`         | ModelInfo           | 是      |         | 模型信息。请参阅 [ModelInfo](#modelinfo)。 |
| `tools`         | `List<String>`        | 是      |         | 模型可以调用的工具列表。 |

<a id="prompt"></a>
`Prompt` 类表示提示词的数据结构，由消息列表、唯一标识符和语言模型设置的可选形参组成。包含以下字段：

| 名称 | 数据类型 | 必填 | 默认值 | 描述 |
|------------|---------------------|----------|-------------|--------------------------------------------------------------|
| `messages` | `List<Message>`       | 是      |             | 组成提示词的消息列表。 |
| `id`       | String              | 是      |             | 提示词的唯一标识符。 |
| `params`   | LLMParams           | 否       | LLMParams() | 控制 LLM 生成内容方式的设置。 |

<a id="modelinfo"></a>
`ModelInfo` 类表示关于语言模型的信息，包括其提供商、模型标识符和特征。包含以下字段：

| 名称 | 数据类型 | 必填 | 默认值 | 描述 |
|-------------------|-----------|----------|---------|--------------------------------------------------------------------------|
| `provider`        | String    | 是      |         | 提供商标识符（例如 "openai"、"google"、"anthropic"）。 |
| `model`           | String    | 是      |         | 模型标识符（例如 "gpt-4"、"claude-3"）。 |
| `displayName`     | String    | 否       | null    | 模型的可选人类可读显示名称。 |
| `contextLength`   | Long      | 否       | null    | 模型可以处理的最大 Token 数量。 |
| `maxOutputTokens` | Long      | 否       | null    | 模型可以生成的最大 Token 数量。 |

#### LLMCallCompletedEvent

表示 LLM 调用的结束。包含以下字段：

| 名称 | 数据类型 | 必填 | 默认值 | 描述 |
|----------------------|------------------------|----------|---------|---------------------------------------------------------------------------------|
| `eventId`            | String                 | 是      |         | 事件或一组事件的唯一标识符。 |
| `executionInfo`      | AgentExecutionInfo     | 是      |         | 提供与此事件关联的执行上下文信息。 |
| `runId`              | String                 | 是      |         | LLM 运行的唯一标识符。 |
| `prompt`             | Prompt                 | 是      |         | 调用中使用的提示词。 |
| `model`              | ModelInfo              | 是      |         | 模型信息。请参阅 [ModelInfo](#modelinfo)。 |
| `responses`          | `List<Message.Response>` | 是      |         | 模型返回的一个或多个响应。 |
| `moderationResponse` | ModerationResult       | 否       | null    | 审核响应（如果有）。 |

### LLM 流式传输事件

#### LLMStreamingStartingEvent

表示 LLM 流式调用开始。包含以下字段：

| 名称 | 数据类型 | 必填 | 默认值 | 描述 |
|-----------------|---------------------|----------|---------|---------------------------------------------------------------------------------|
| `eventId`       | String              | 是      |         | 事件或一组事件的唯一标识符。 |
| `executionInfo` | AgentExecutionInfo  | 是      |         | 提供与此事件关联的执行上下文信息。 |
| `runId`         | String              | 是      |         | LLM 运行的唯一标识符。 |
| `prompt`        | Prompt              | 是      |         | 发送给模型的提示词。 |
| `model`         | ModelInfo           | 是      |         | 模型信息。请参阅 [ModelInfo](#modelinfo)。 |
| `tools`         | `List<String>`        | 是      |         | 模型可以调用的工具列表。 |

#### LLMStreamingFrameReceivedEvent

表示从 LLM 接收到的流式帧。包含以下字段：

| 名称 | 数据类型 | 必填 | 默认值 | 描述 |
|-----------------|---------------------|----------|---------|---------------------------------------------------------------------------------|
| `eventId`       | String              | 是      |         | 事件或一组事件的唯一标识符。 |
| `executionInfo` | AgentExecutionInfo  | 是      |         | 提供与此事件关联的执行上下文信息。 |
| `runId`         | String              | 是      |         | LLM 运行的唯一标识符。 |
| `prompt`        | Prompt              | 是      |         | 发送给模型的提示词。 |
| `model`         | ModelInfo           | 是      |         | 模型信息。请参阅 [ModelInfo](#modelinfo)。 |
| `frame`         | StreamFrame         | 是      |         | 从流中接收到的帧。 |

#### LLMStreamingFailedEvent

表示 LLM 流式调用期间发生的错误。包含以下字段：

| 名称 | 数据类型 | 必填 | 默认值 | 描述 |
|-----------------|---------------------|----------|---------|-------------------------------------------------------------------------------------------------------------|
| `eventId`       | String              | 是      |         | 事件或一组事件的唯一标识符。 |
| `executionInfo` | AgentExecutionInfo  | 是      |         | 提供与此事件关联的执行上下文信息。 |
| `runId`         | String              | 是      |         | LLM 运行的唯一标识符。 |
| `prompt`        | Prompt              | 是      |         | 发送给模型的提示词。 |
| `model`         | ModelInfo           | 是      |         | 模型信息。请参阅 [ModelInfo](#modelinfo)。 |
| `error`         | AIAgentError        | 是      |         | 流式传输期间发生的特定错误。有关更多信息，请参阅 [AIAgentError](#aiagenterror)。 |

#### LLMStreamingCompletedEvent

表示 LLM 流式调用的结束。包含以下字段：

| 名称 | 数据类型 | 必填 | 默认值 | 描述 |
|-----------------|---------------------|----------|---------|---------------------------------------------------------------------------------|
| `eventId`       | String              | 是      |         | 事件或一组事件的唯一标识符。 |
| `executionInfo` | AgentExecutionInfo  | 是      |         | 提供与此事件关联的执行上下文信息。 |
| `runId`         | String              | 是      |         | LLM 运行的唯一标识符。 |
| `prompt`        | Prompt              | 是      |         | 发送给模型的提示词。 |
| `model`         | ModelInfo           | 是      |         | 模型信息。请参阅 [ModelInfo](#modelinfo)。 |
| `tools`         | `List<String>`        | 是      |         | 模型可以调用的工具列表。 |

### 工具执行事件

#### ToolCallStartingEvent

表示模型调用工具的事件。包含以下字段：

| 名称 | 数据类型 | 必填 | 默认值 | 描述 |
|-----------------|---------------------|----------|---------|----------------------------------------------------------------------------|
| `eventId`       | String              | 是      |         | 事件或一组事件的唯一标识符。 |
| `executionInfo` | AgentExecutionInfo  | 是      |         | 提供与此事件关联的执行上下文信息。 |
| `runId`         | String              | 是      |         | 策略/Agent 运行的唯一标识符。 |
| `toolCallId`    | String              | 否       | null    | 工具调用的标识符（如果可用）。 |
| `toolName`      | String              | 是      |         | 工具的名称。 |
| `toolArgs`      | JsonObject          | 是      |         | 提供给工具的实参。 |

#### ToolValidationFailedEvent

表示在工具调用期间发生的验证错误。包含以下字段：

| 名称 | 数据类型 | 必填 | 默认值 | 描述 |
|-------------------|---------------------|----------|---------|----------------------------------------------------------------------------|
| `eventId`         | String              | 是      |         | 事件或一组事件的唯一标识符。 |
| `executionInfo`   | AgentExecutionInfo  | 是      |         | 提供与此事件关联的执行上下文信息。 |
| `runId`           | String              | 是      |         | 策略/Agent 运行的唯一标识符。 |
| `toolCallId`      | String              | 否       | null    | 工具调用的标识符（如果可用）。 |
| `toolName`        | String              | 是      |         | 验证失败的工具名称。 |
| `toolArgs`        | JsonObject          | 是      |         | 提供给工具的实参。 |
| `toolDescription` | String              | 否       | null    | 遇到验证错误的工具的描述。 |
| `message`         | String              | 否       | null    | 描述验证错误的消息。 |
| `error`           | AIAgentError        | 是      |         | 发生的特定错误。有关更多信息，请参阅 [AIAgentError](#aiagenterror)。 |

#### ToolCallFailedEvent

表示执行工具失败。包含以下字段：

| 名称 | 数据类型 | 必填 | 默认值 | 描述 |
|-------------------|---------------------|----------|---------|-------------------------------------------------------------------------------------------------------------------------|
| `eventId`         | String              | 是      |         | 事件或一组事件的唯一标识符。 |
| `executionInfo`   | AgentExecutionInfo  | 是      |         | 提供与此事件关联的执行上下文信息。 |
| `runId`           | String              | 是      |         | 策略/Agent 运行的唯一标识符。 |
| `toolCallId`      | String              | 否       | null    | 工具调用的标识符（如果可用）。 |
| `toolName`        | String              | 是      |         | 工具的名称。 |
| `toolArgs`        | JsonObject          | 是      |         | 提供给工具的实参。 |
| `toolDescription` | String              | 否       | null    | 失败工具的描述。 |
| `error`           | AIAgentError        | 是      |         | 尝试调用工具时发生的特定错误。有关更多信息，请参阅 [AIAgentError](#aiagenterror)。 |

#### ToolCallCompletedEvent

表示成功调用工具并返回结果。包含以下字段：

| 名称 | 数据类型 | 必填 | 默认值 | 描述 |
|-------------------|---------------------|----------|---------|----------------------------------------------------------------------------|
| `eventId`         | String              | 是      |         | 事件或一组事件的唯一标识符。 |
| `executionInfo`   | AgentExecutionInfo  | 是      |         | 提供与此事件关联的执行上下文信息。 |
| `runId`           | String              | 是      |         | 运行的唯一标识符。 |
| `toolCallId`      | String              | 否       | null    | 工具调用的标识符。 |
| `toolName`        | String              | 是      |         | 工具的名称。 |
| `toolArgs`        | JsonObject          | 是      |         | 提供给工具的实参。 |
| `toolDescription` | String              | 否       | null    | 已执行工具的描述。 |
| `result`          | JsonElement         | 否       | null    | 工具调用的结果。 |

## 常见问题与故障排除

以下部分包含了与跟踪（Tracing）特性相关的常见问题及解答。

### 我该如何仅跟踪 Agent 执行的特定部分？

使用 `messageFilter` 属性来过滤事件。例如，要仅跟踪节点执行：

=== "Kotlin"

    <!--- INCLUDE
    import ai.koog.agents.core.agent.AIAgent
    import ai.koog.agents.core.feature.model.events.LLMCallCompletedEvent
    import ai.koog.agents.core.feature.model.events.LLMCallStartingEvent
    import ai.koog.agents.example.exampleTracing01.outputPath
    import ai.koog.agents.features.tracing.feature.Tracing
    import ai.koog.agents.features.tracing.writer.TraceFeatureMessageFileWriter
    import ai.koog.prompt.executor.llms.all.simpleOllamaAIExecutor
    import ai.koog.prompt.executor.ollama.client.OllamaModels
    import kotlinx.coroutines.runBlocking
    const val input = "What's the weather like in New York?"
    fun main() {
    runBlocking {
    // Creating an agent
    val agent = AIAgent(
    promptExecutor = simpleOllamaAIExecutor(),
    llmModel = OllamaModels.Meta.LLAMA_3_2,
    ) {
    -->
    <!--- SUFFIX
            }
        }
    }
    -->
    ```kotlin
    install(Tracing) {
        val fileWriter = TraceFeatureMessageFileWriter.create(outputPath)
        addMessageProcessor(fileWriter)
        
        // 仅跟踪 LLM 调用
        fileWriter.setMessageFilter { message ->
            message is LLMCallStartingEvent || message is LLMCallCompletedEvent
        }
    }
    ```
    <!--- KNIT example-events-01.kt -->

=== "Java"

    <!--- INCLUDE
    import ai.koog.agents.core.agent.AIAgent;
    import ai.koog.agents.core.feature.model.events.LLMCallCompletedEvent;
    import ai.koog.agents.core.feature.model.events.LLMCallStartingEvent;
    import ai.koog.agents.features.tracing.feature.Tracing;
    import ai.koog.agents.features.tracing.writer.TraceFeatureMessageFileWriter;
    import ai.koog.prompt.executor.model.PromptExecutor;
    import ai.koog.prompt.executor.ollama.client.OllamaModels;
    import java.nio.file.Files;
    import java.nio.file.Path;
    public class exampleEventsJava01 {
        public static void main(String[] args) {
            var outputPath = Path.of("/path/to/trace.log");
            var agent = AIAgent.builder()
                .promptExecutor(PromptExecutor.builder().ollama().build())
                .llmModel(OllamaModels.Meta.LLAMA_3_2)
    -->
    <!--- SUFFIX
            .build();
        }
    }
    -->
    ```java
    .install(Tracing.Feature, config -> {
        var fileWriter = TraceFeatureMessageFileWriter.create(outputPath);
        config.addMessageProcessor(fileWriter);

        // 仅跟踪 LLM 调用
        fileWriter.setMessageFilter(message ->
            message instanceof LLMCallStartingEvent || message instanceof LLMCallCompletedEvent
        );
    })
    ```
    <!--- KNIT exampleEventsJava01.java -->

### 我可以使用多个消息处理器吗？

是的，您可以添加多个消息处理器以同时跟踪到不同的目的地：

=== "Kotlin"

    <!--- INCLUDE
    import ai.koog.agents.core.agent.AIAgent
    import ai.koog.agents.core.feature.remote.server.config.DefaultServerConnectionConfig
    import ai.koog.agents.example.exampleTracing01.outputPath
    import ai.koog.agents.features.tracing.feature.Tracing
    import ai.koog.agents.features.tracing.writer.TraceFeatureMessageFileWriter
    import ai.koog.agents.features.tracing.writer.TraceFeatureMessageLogWriter
    import ai.koog.agents.features.tracing.writer.TraceFeatureMessageRemoteWriter
    import ai.koog.prompt.executor.llms.all.simpleOllamaAIExecutor
    import ai.koog.prompt.executor.ollama.client.OllamaModels
    import io.github.oshai.kotlinlogging.KotlinLogging
    import kotlinx.coroutines.runBlocking
    import kotlinx.io.buffered
    import kotlinx.io.files.Path
    import kotlinx.io.files.SystemFileSystem
    const val input = "What's the weather like in New York?"
    val logger = KotlinLogging.logger {}
    val connectionConfig = DefaultServerConnectionConfig(host = ai.koog.agents.example.exampleTracing06.host, port = ai.koog.agents.example.exampleTracing06.port)
    fun main() {
    runBlocking {
    // Creating an agent
    val agent = AIAgent(
    promptExecutor = simpleOllamaAIExecutor(),
    llmModel = OllamaModels.Meta.LLAMA_3_2,
    ) {
    -->
    <!--- SUFFIX
            }
        }
    }
    -->
    ```kotlin
    install(Tracing) {
        addMessageProcessor(TraceFeatureMessageLogWriter(logger))
        addMessageProcessor(TraceFeatureMessageFileWriter.create(outputPath))
        addMessageProcessor(TraceFeatureMessageRemoteWriter(connectionConfig))
    }
    ```
    <!--- KNIT example-events-02.kt -->

=== "Java"

    <!--- INCLUDE
    import ai.koog.agents.core.agent.AIAgent;
    import ai.koog.agents.features.tracing.feature.Tracing;
    import ai.koog.agents.features.tracing.writer.TraceFeatureMessageFileWriter;
    import ai.koog.agents.features.tracing.writer.TraceFeatureMessageLogWriter;
    import ai.koog.agents.features.tracing.writer.TraceFeatureMessageRemoteWriter;
    import ai.koog.prompt.executor.model.PromptExecutor;
    import ai.koog.prompt.executor.ollama.client.OllamaModels;
    import org.slf4j.LoggerFactory;
    import java.nio.file.Files;
    import java.nio.file.Path;
    public class exampleEventsJava02 {
        public static void main(String[] args) {
            var logger = LoggerFactory.getLogger("tracing");
            var outputPath = Path.of("/path/to/trace.log");
            var agent = AIAgent.builder()
                .promptExecutor(PromptExecutor.builder().ollama().build())
                .llmModel(OllamaModels.Meta.LLAMA_3_2)
    -->
    <!--- SUFFIX
            .build();
        }
    }
    -->
    ```java
    .install(Tracing.Feature, config -> {
        config.addMessageProcessor(TraceFeatureMessageLogWriter.create(logger));
        config.addMessageProcessor(TraceFeatureMessageFileWriter.create(outputPath));
        config.addMessageProcessor(new TraceFeatureMessageRemoteWriter());
    })
    ```
    <!--- KNIT exampleEventsJava02.java -->

### 我该如何创建自定义消息处理器？

实现 `FeatureMessageProcessor` 接口：

=== "Kotlin"

    <!--- INCLUDE
    import ai.koog.agents.core.agent.AIAgent
    import ai.koog.agents.core.feature.model.events.NodeExecutionStartingEvent
    import ai.koog.agents.core.feature.model.events.LLMCallCompletedEvent
    import ai.koog.agents.core.feature.message.FeatureMessage
    import ai.koog.agents.core.feature.message.FeatureMessageProcessor
    import ai.koog.agents.features.tracing.feature.Tracing
    import ai.koog.prompt.executor.llms.all.simpleOllamaAIExecutor
    import ai.koog.prompt.executor.ollama.client.OllamaModels
    import kotlinx.coroutines.flow.MutableStateFlow
    import kotlinx.coroutines.flow.StateFlow
    import kotlinx.coroutines.flow.asStateFlow
    import kotlinx.coroutines.runBlocking
    fun main() {
    runBlocking {
    -->
    <!--- SUFFIX
        }
    }
    -->
    ```kotlin
    class CustomTraceProcessor : FeatureMessageProcessor() {

        override suspend fun processMessage(message: FeatureMessage) {
            // 自定义处理逻辑
            if (message is NodeExecutionStartingEvent) {
                // 处理节点开始事件
            } else if (message is LLMCallCompletedEvent) {
                // 处理 LLM 调用结束事件
            } else {
                // 处理其他事件类型
            }
        }

        override suspend fun close() {
            // 如果已建立连接，则关闭它们
        }
    }

    val agent = AIAgent(
        promptExecutor = simpleOllamaAIExecutor(),
        llmModel = OllamaModels.Meta.LLAMA_3_2,
    ) {
        install(Tracing) {
            // 使用您的自定义处理器
            addMessageProcessor(CustomTraceProcessor())
        }
    }
    ```
    <!--- KNIT example-events-03.kt -->

=== "Java"

    <!--- INCLUDE
    import ai.koog.agents.core.agent.AIAgent;
    import ai.koog.agents.core.feature.message.FeatureMessage;
    import ai.koog.agents.core.feature.message.FeatureMessageProcessor;
    import ai.koog.agents.core.feature.model.events.NodeExecutionStartingEvent;
    import ai.koog.agents.core.feature.model.events.LLMCallCompletedEvent;
    import ai.koog.agents.features.tracing.feature.Tracing;
    import ai.koog.prompt.executor.model.PromptExecutor;
    import ai.koog.prompt.executor.ollama.client.OllamaModels;
    public class exampleEventsJava03 {
        public static void main(String[] args) {
    -->
    <!--- SUFFIX
        }
    }
    -->
    ```java
    class CustomTraceProcessor extends FeatureMessageProcessor {

        @Override
        protected void handleMessage(FeatureMessage message) {
            // 自定义处理逻辑
            if (message instanceof NodeExecutionStartingEvent) {
                // 处理节点开始事件
            } else if (message instanceof LLMCallCompletedEvent) {
                // 处理 LLM 调用结束事件
            } else {
                // 处理其他事件类型
            }
        }

        @Override
        public void handleClose() {
            // 如果已建立连接，则关闭它们
        }
    }

    var agent = AIAgent.builder()
        .promptExecutor(PromptExecutor.builder().ollama().build())
        .llmModel(OllamaModels.Meta.LLAMA_3_2)

        .install(Tracing.Feature, config -> {
            // 使用您的自定义处理器
            config.addMessageProcessor(new CustomTraceProcessor());
        })
        .build();
    ```
    <!--- KNIT exampleEventsJava03.java -->

有关可由消息处理器处理的现有事件类型的更多信息，请参阅 [预定义事件类型](#predefined-event-types)。