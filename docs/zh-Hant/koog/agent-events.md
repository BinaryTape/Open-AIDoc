# Agent 事件

Agent 事件是作為 Agent 工作流（workflow）一部分發生的操作或互動。它們包括：

- Agent 生命週期事件
- 策略（Strategy）事件
- 節點（Node）執行事件
- LLM 呼叫事件
- LLM 串流事件
- 工具（Tool）執行事件

註：功能事件定義在 `agents-core` 模組中，並位於套件 `ai.koog.agents.core.feature.model.events` 下。諸如 `agents-features-trace` 和 `agents-features-event-handler` 等功能會取用這些事件，以處理並轉發 Agent 執行期間建立的訊息。

## 預定義事件類型

Koog 提供預定義的事件類型，可用於自訂訊息處理器。根據其相關的實體，預定義事件可分為以下幾類：

- [Agent 事件](#agent-events)
- [策略事件](#strategy-events)
- [節點事件](#node-events)
- [子圖（Subgraph）事件](#subgraph-events)
- [LLM 呼叫事件](#llm-call-events)
- [LLM 串流事件](#llm-streaming-events)
- [工具執行事件](#tool-execution-events)

### Agent 事件

#### AgentStartingEvent

代表 Agent 執行的開始。包含以下欄位：

| 名稱 | 資料型別 | 必填 | 預設值 | 描述 |
|-----------------|---------------------|----------|---------|----------------------------------------------------------------------------|
| `eventId`       | String              | 是      |         | 事件或事件組的唯一識別碼。 |
| `executionInfo` | AgentExecutionInfo  | 是      |         | 提供與此事件關聯的執行上下文資訊。 |
| `agentId`       | String              | 是      |         | AI Agent 的唯一識別碼。 |
| `runId`         | String              | 是      |         | AI Agent 執行的唯一識別碼。 |

#### AgentCompletedEvent

代表 Agent 執行的結束。包含以下欄位：

| 名稱 | 資料型別 | 必填 | 預設值 | 描述 |
|-----------------|---------------------|----------|---------|---------------------------------------------------------------------------------|
| `eventId`       | String              | 是      |         | 事件或事件組的唯一識別碼。 |
| `executionInfo` | AgentExecutionInfo  | 是      |         | 提供與此事件關聯的執行上下文資訊。 |
| `agentId`       | String              | 是      |         | AI Agent 的唯一識別碼。 |
| `runId`         | String              | 是      |         | AI Agent 執行的唯一識別碼。 |
| `result`        | String              | 是      |         | Agent 執行的結果。如果沒有結果，可以為 `null`。 |

#### AgentExecutionFailedEvent

代表 Agent 執行期間發生的錯誤。包含以下欄位：

| 名稱 | 資料型別 | 必填 | 預設值 | 描述 |
|-----------------|---------------------|----------|---------|-----------------------------------------------------------------------------------------------------------------|
| `eventId`       | String              | 是      |         | 事件或事件組的唯一識別碼。 |
| `executionInfo` | AgentExecutionInfo  | 是      |         | 提供與此事件關聯的執行上下文資訊。 |
| `agentId`       | String              | 是      |         | AI Agent 的唯一識別碼。 |
| `runId`         | String              | 是      |         | AI Agent 執行的唯一識別碼。 |
| `error`         | AIAgentError        | 是      |         | Agent 執行期間發生的特定錯誤。欲了解更多資訊，請參閱 [AIAgentError](#aiagenterror)。 |

#### AgentClosingEvent

代表 Agent 的關閉或終止。包含以下欄位：

| 名稱 | 資料型別 | 必填 | 預設值 | 描述 |
|-----------------|---------------------|----------|---------|----------------------------------------------------------------------------|
| `eventId`       | String              | 是      |         | 事件或事件組的唯一識別碼。 |
| `executionInfo` | AgentExecutionInfo  | 是      |         | 提供與此事件關聯的執行上下文資訊。 |
| `agentId`       | String              | 是      |         | AI Agent 的唯一識別碼。 |

<a id="aiagenterror"></a>
`AIAgentError` 類別提供有關 Agent 執行期間發生錯誤的更多詳細資訊。包含以下欄位：

| 名稱 | 資料型別 | 必填 | 預設值 | 描述 |
|--------------|-----------|----------|---------|------------------------------------------------------------------|
| `message`    | String    | 是      |         | 提供有關特定錯誤的詳細資訊訊息。 |
| `stackTrace` | String    | 是      |         | 到最後執行程式碼為止的堆疊記錄集合。 |
| `cause`      | String    | 否       | null    | 錯誤原因（如果可用）。 |

<a id="agentexecutioninfo"></a>
`AgentExecutionInfo` 類別提供有關執行路徑的上下文資訊，以便追蹤 Agent 執行中的巢狀執行上下文。包含以下欄位：

| 名稱 | 資料型別 | 必填 | 預設值 | 描述 |
|------------|---------------------|----------|---------|------------------------------------------------------------------------------------------------|
| `parent`   | AgentExecutionInfo  | 否       | null    | 對父級執行上下文的引用。如果為 null，則代表根執行層級。 |
| `partName` | String              | 是      |         | 代表當前執行部分或片段名稱的字串。 |

### 策略事件

#### GraphStrategyStartingEvent

代表基於圖（graph-based）的策略執行的開始。包含以下欄位：

| 名稱 | 資料型別 | 必填 | 預設值 | 描述 |
|-----------------|------------------------|----------|---------|----------------------------------------------------------------------------|
| `eventId`       | String                 | 是      |         | 事件或事件組的唯一識別碼。 |
| `executionInfo` | AgentExecutionInfo     | 是      |         | 提供與此事件關聯的執行上下文資訊。 |
| `runId`         | String                 | 是      |         | 策略執行的唯一識別碼。 |
| `strategyName`  | String                 | 是      |         | 策略的名稱。 |
| `graph`         | StrategyEventGraph     | 是      |         | 代表策略工作流的圖結構。 |

#### FunctionalStrategyStartingEvent

代表函數式（functional）策略執行的開始。包含以下欄位：

| 名稱 | 資料型別 | 必填 | 預設值 | 描述 |
|-----------------|---------------------|----------|---------|----------------------------------------------------------------------------|
| `eventId`       | String              | 是      |         | 事件或事件組的唯一識別碼。 |
| `executionInfo` | AgentExecutionInfo  | 是      |         | 提供與此事件關聯的執行上下文資訊。 |
| `runId`         | String              | 是      |         | 策略執行的唯一識別碼。 |
| `strategyName`  | String              | 是      |         | 策略的名稱。 |

#### StrategyCompletedEvent

代表策略執行的結束。包含以下欄位：

| 名稱 | 資料型別 | 必填 | 預設值 | 描述 |
|-----------------|---------------------|----------|---------|----------------------------------------------------------------------------|
| `eventId`       | String              | 是      |         | 事件或事件組的唯一識別碼。 |
| `executionInfo` | AgentExecutionInfo  | 是      |         | 提供與此事件關聯的執行上下文資訊。 |
| `runId`         | String              | 是      |         | 策略執行的唯一識別碼。 |
| `strategyName`  | String              | 是      |         | 策略的名稱。 |
| `result`        | String              | 是      |         | 執行的結果。如果沒有結果，可以為 `null`。 |

### 節點事件

#### NodeExecutionStartingEvent

代表節點執行的開始。包含以下欄位：

| 名稱 | 資料型別 | 必填 | 預設值 | 描述 |
|-----------------|---------------------|----------|---------|----------------------------------------------------------------------------|
| `eventId`       | String              | 是      |         | 事件或事件組的唯一識別碼。 |
| `executionInfo` | AgentExecutionInfo  | 是      |         | 提供與此事件關聯的執行上下文資訊。 |
| `runId`         | String              | 是      |         | 策略執行的唯一識別碼。 |
| `nodeName`      | String              | 是      |         | 開始執行的節點名稱。 |
| `input`         | JsonElement         | 否       | null    | 節點的輸入值。 |

#### NodeExecutionCompletedEvent

代表節點執行的結束。包含以下欄位：

| 名稱 | 資料型別 | 必填 | 預設值 | 描述 |
|-----------------|---------------------|----------|---------|----------------------------------------------------------------------------|
| `eventId`       | String              | 是      |         | 事件或事件組的唯一識別碼。 |
| `executionInfo` | AgentExecutionInfo  | 是      |         | 提供與此事件關聯的執行上下文資訊。 |
| `runId`         | String              | 是      |         | 策略執行的唯一識別碼。 |
| `nodeName`      | String              | 是      |         | 結束執行的節點名稱。 |
| `input`         | JsonElement         | 否       | null    | 節點的輸入值。 |
| `output`        | JsonElement         | 否       | null    | 節點產生的輸出值。 |

#### NodeExecutionFailedEvent

代表節點執行期間發生的錯誤。包含以下欄位：

| 名稱 | 資料型別 | 必填 | 預設值 | 描述 |
|-----------------|---------------------|----------|---------|-----------------------------------------------------------------------------------------------------------------|
| `eventId`       | String              | 是      |         | 事件或事件組的唯一識別碼。 |
| `executionInfo` | AgentExecutionInfo  | 是      |         | 提供與此事件關聯的執行上下文資訊。 |
| `runId`         | String              | 是      |         | 策略執行的唯一識別碼。 |
| `nodeName`      | String              | 是      |         | 發生錯誤的節點名稱。 |
| `input`         | JsonElement         | 否       | null    | 提供給節點的輸入資料。 |
| `error`         | AIAgentError        | 是      |         | 節點執行期間發生的特定錯誤。欲了解更多資訊，請參閱 [AIAgentError](#aiagenterror)。 |

### 子圖事件

#### SubgraphExecutionStartingEvent

代表子圖（subgraph）執行的開始。包含以下欄位：

| 名稱 | 資料型別 | 必填 | 預設值 | 描述 |
|-----------------|---------------------|----------|---------|----------------------------------------------------------------------------|
| `eventId`       | String              | 是      |         | 事件或事件組的唯一識別碼。 |
| `executionInfo` | AgentExecutionInfo  | 是      |         | 提供與此事件關聯的執行上下文資訊。 |
| `runId`         | String              | 是      |         | 策略執行的唯一識別碼。 |
| `subgraphName`  | String              | 是      |         | 開始執行的子圖名稱。 |
| `input`         | JsonElement         | 否       | null    | 子圖的輸入值。 |

#### SubgraphExecutionCompletedEvent

代表子圖執行的結束。包含以下欄位：

| 名稱 | 資料型別 | 必填 | 預設值 | 描述 |
|-----------------|---------------------|----------|---------|----------------------------------------------------------------------------|
| `eventId`       | String              | 是      |         | 事件或事件組的唯一識別碼。 |
| `executionInfo` | AgentExecutionInfo  | 是      |         | 提供與此事件關聯的執行上下文資訊。 |
| `runId`         | String              | 是      |         | 策略執行的唯一識別碼。 |
| `subgraphName`  | String              | 是      |         | 結束執行的子圖名稱。 |
| `input`         | JsonElement         | 否       | null    | 子圖的輸入值。 |
| `output`        | JsonElement         | 否       | null    | 子圖產生的輸出值。 |

#### SubgraphExecutionFailedEvent

代表子圖執行期間發生的錯誤。包含以下欄位：

| 名稱 | 資料型別 | 必填 | 預設值 | 描述 |
|-----------------|---------------------|----------|---------|-----------------------------------------------------------------------------------------------------------------|
| `eventId`       | String              | 是      |         | 事件或事件組的唯一識別碼。 |
| `executionInfo` | AgentExecutionInfo  | 是      |         | 提供與此事件關聯的執行上下文資訊。 |
| `runId`         | String              | 是      |         | 策略執行的唯一識別碼。 |
| `subgraphName`  | String              | 是      |         | 發生錯誤的子圖名稱。 |
| `input`         | JsonElement         | 否       | null    | 提供給子圖的輸入資料。 |
| `error`         | AIAgentError        | 是      |         | 子圖執行期間發生的特定錯誤。欲了解更多資訊，請參閱 [AIAgentError](#aiagenterror)。 |

### LLM 呼叫事件

#### LLMCallStartingEvent

代表 LLM 呼叫的開始。包含以下欄位：

| 名稱 | 資料型別 | 必填 | 預設值 | 描述 |
|-----------------|---------------------|----------|---------|------------------------------------------------------------------------------------|
| `eventId`       | String              | 是      |         | 事件或事件組的唯一識別碼。 |
| `executionInfo` | AgentExecutionInfo  | 是      |         | 提供與此事件關聯的執行上下文資訊。 |
| `runId`         | String              | 是      |         | LLM 執行的唯一識別碼。 |
| `prompt`        | Prompt              | 是      |         | 傳送給模型的提示。欲了解更多資訊，請參閱 [Prompt](#prompt)。 |
| `model`         | ModelInfo           | 是      |         | 模型資訊。請參閱 [ModelInfo](#modelinfo)。 |
| `tools`         | `List<String>`        | 是      |         | 模型可以呼叫的工具列表。 |

<a id="prompt"></a>
`Prompt` 類別代表提示的資料結構，由訊息列表、唯一識別碼和語言模型設定的選用參數組成。包含以下欄位：

| 名稱 | 資料型別 | 必填 | 預設值 | 描述 |
|------------|---------------------|----------|-------------|--------------------------------------------------------------|
| `messages` | `List<Message>`       | 是      |             | 組成提示的訊息列表。 |
| `id`       | String              | 是      |             | 提示的唯一識別碼。 |
| `params`   | LLMParams           | 否       | LLMParams() | 控制 LLM 產生內容方式的設定。 |

<a id="modelinfo"></a>
`ModelInfo` 類別代表有關語言模型的資訊，包括其提供者、模型識別碼和特性。包含以下欄位：

| 名稱 | 資料型別 | 必填 | 預設值 | 描述 |
|-------------------|-----------|----------|---------|--------------------------------------------------------------------------|
| `provider`        | String    | 是      |         | 提供者識別碼（例如 "openai"、"google"、"anthropic"）。 |
| `model`           | String    | 是      |         | 模型識別碼（例如 "gpt-4"、"claude-3"）。 |
| `displayName`     | String    | 否       | null    | 選用的模型易讀顯示名稱。 |
| `contextLength`   | Long      | 否       | null    | 模型可以處理的最大權杖（tokens）數量。 |
| `maxOutputTokens` | Long      | 否       | null    | 模型可以產生的最大權杖數量。 |

#### LLMCallCompletedEvent

代表 LLM 呼叫的結束。包含以下欄位：

| 名稱 | 資料型別 | 必填 | 預設值 | 描述 |
|----------------------|------------------------|----------|---------|---------------------------------------------------------------------------------|
| `eventId`            | String                 | 是      |         | 事件或事件組的唯一識別碼。 |
| `executionInfo`      | AgentExecutionInfo     | 是      |         | 提供與此事件關聯的執行上下文資訊。 |
| `runId`              | String                 | 是      |         | LLM 執行的唯一識別碼。 |
| `prompt`             | Prompt                 | 是      |         | 呼叫中使用的提示。 |
| `model`              | ModelInfo              | 是      |         | 模型資訊。請參閱 [ModelInfo](#modelinfo)。 |
| `responses`          | `List<Message.Response>` | 是      |         | 模型傳回的一或多個回應。 |
| `moderationResponse` | ModerationResult       | 否       | null    | 稽核回應（如果有）。 |

### LLM 串流事件

#### LLMStreamingStartingEvent

代表 LLM 串流呼叫的開始。包含以下欄位：

| 名稱 | 資料型別 | 必填 | 預設值 | 描述 |
|-----------------|---------------------|----------|---------|---------------------------------------------------------------------------------|
| `eventId`       | String              | 是      |         | 事件或事件組的唯一識別碼。 |
| `executionInfo` | AgentExecutionInfo  | 是      |         | 提供與此事件關聯的執行上下文資訊。 |
| `runId`         | String              | 是      |         | LLM 執行的唯一識別碼。 |
| `prompt`        | Prompt              | 是      |         | 傳送給模型的提示。 |
| `model`         | ModelInfo           | 是      |         | 模型資訊。請參閱 [ModelInfo](#modelinfo)。 |
| `tools`         | `List<String>`        | 是      |         | 模型可以呼叫的工具列表。 |

#### LLMStreamingFrameReceivedEvent

代表從 LLM 收到的串流影格（frame）。包含以下欄位：

| 名稱 | 資料型別 | 必填 | 預設值 | 描述 |
|-----------------|---------------------|----------|---------|---------------------------------------------------------------------------------|
| `eventId`       | String              | 是      |         | 事件或事件組的唯一識別碼。 |
| `executionInfo` | AgentExecutionInfo  | 是      |         | 提供與此事件關聯的執行上下文資訊。 |
| `runId`         | String              | 是      |         | LLM 執行的唯一識別碼。 |
| `prompt`        | Prompt              | 是      |         | 傳送給模型的提示。 |
| `model`         | ModelInfo           | 是      |         | 模型資訊。請參閱 [ModelInfo](#modelinfo)。 |
| `frame`         | StreamFrame         | 是      |         | 從串流收到的影格。 |

#### LLMStreamingFailedEvent

代表 LLM 串流呼叫期間發生的錯誤。包含以下欄位：

| 名稱 | 資料型別 | 必填 | 預設值 | 描述 |
|-----------------|---------------------|----------|---------|-------------------------------------------------------------------------------------------------------------|
| `eventId`       | String              | 是      |         | 事件或事件組的唯一識別碼。 |
| `executionInfo` | AgentExecutionInfo  | 是      |         | 提供與此事件關聯的執行上下文資訊。 |
| `runId`         | String              | 是      |         | LLM 執行的唯一識別碼。 |
| `prompt`        | Prompt              | 是      |         | 傳送給模型的提示。 |
| `model`         | ModelInfo           | 是      |         | 模型資訊。請參閱 [ModelInfo](#modelinfo)。 |
| `error`         | AIAgentError        | 是      |         | 串流期間發生的特定錯誤。欲了解更多資訊，請參閱 [AIAgentError](#aiagenterror)。 |

#### LLMStreamingCompletedEvent

代表 LLM 串流呼叫的結束。包含以下欄位：

| 名稱 | 資料型別 | 必填 | 預設值 | 描述 |
|-----------------|---------------------|----------|---------|---------------------------------------------------------------------------------|
| `eventId`       | String              | 是      |         | 事件或事件組的唯一識別碼。 |
| `executionInfo` | AgentExecutionInfo  | 是      |         | 提供與此事件關聯的執行上下文資訊。 |
| `runId`         | String              | 是      |         | LLM 執行的唯一識別碼。 |
| `prompt`        | Prompt              | 是      |         | 傳送給模型的提示。 |
| `model`         | ModelInfo           | 是      |         | 模型資訊。請參閱 [ModelInfo](#modelinfo)。 |
| `tools`         | `List<String>`        | 是      |         | 模型可以呼叫的工具列表。 |

### 工具執行事件

#### ToolCallStartingEvent

代表模型呼叫工具的事件。包含以下欄位：

| 名稱 | 資料型別 | 必填 | 預設值 | 描述 |
|-----------------|---------------------|----------|---------|----------------------------------------------------------------------------|
| `eventId`       | String              | 是      |         | 事件或事件組的唯一識別碼。 |
| `executionInfo` | AgentExecutionInfo  | 是      |         | 提供與此事件關聯的執行上下文資訊。 |
| `runId`         | String              | 是      |         | 策略/Agent 執行的唯一識別碼。 |
| `toolCallId`    | String              | 否       | null    | 工具呼叫的識別碼（如果可用）。 |
| `toolName`      | String              | 是      |         | 工具的名稱。 |
| `toolArgs`      | JsonObject          | 是      |         | 提供給工具的引數。 |

#### ToolValidationFailedEvent

代表工具呼叫期間發生的驗證錯誤。包含以下欄位：

| 名稱 | 資料型別 | 必填 | 預設值 | 描述 |
|-------------------|---------------------|----------|---------|----------------------------------------------------------------------------|
| `eventId`         | String              | 是      |         | 事件或事件組的唯一識別碼。 |
| `executionInfo`   | AgentExecutionInfo  | 是      |         | 提供與此事件關聯的執行上下文資訊。 |
| `runId`           | String              | 是      |         | 策略/Agent 執行的唯一識別碼。 |
| `toolCallId`      | String              | 否       | null    | 工具呼叫的識別碼（如果可用）。 |
| `toolName`        | String              | 是      |         | 驗證失敗的工具名稱。 |
| `toolArgs`        | JsonObject          | 是      |         | 提供給工具的引數。 |
| `toolDescription` | String              | 否       | null    | 遇到驗證錯誤的工具描述。 |
| `message`         | String              | 否       | null    | 描述驗證錯誤的訊息。 |
| `error`           | AIAgentError        | 是      |         | 發生的特定錯誤。欲了解更多資訊，請參閱 [AIAgentError](#aiagenterror)。 |

#### ToolCallFailedEvent

代表執行工具失敗。包含以下欄位：

| 名稱 | 資料型別 | 必填 | 預設值 | 描述 |
|-------------------|---------------------|----------|---------|-------------------------------------------------------------------------------------------------------------------------|
| `eventId`         | String              | 是      |         | 事件或事件組的唯一識別碼。 |
| `executionInfo`   | AgentExecutionInfo  | 是      |         | 提供與此事件關聯的執行上下文資訊。 |
| `runId`           | String              | 是      |         | 策略/Agent 執行的唯一識別碼。 |
| `toolCallId`      | String              | 否       | null    | 工具呼叫的識別碼（如果可用）。 |
| `toolName`        | String              | 是      |         | 工具的名稱。 |
| `toolArgs`        | JsonObject          | 是      |         | 提供給工具的引數。 |
| `toolDescription` | String              | 否       | null    | 失敗的工具描述。 |
| `error`           | AIAgentError        | 是      |         | 嘗試呼叫工具時發生的特定錯誤。欲了解更多資訊，請參閱 [AIAgentError](#aiagenterror)。 |

#### ToolCallCompletedEvent

代表成功的工具呼叫並傳回結果。包含以下欄位：

| 名稱 | 資料型別 | 必填 | 預設值 | 描述 |
|-------------------|---------------------|----------|---------|----------------------------------------------------------------------------|
| `eventId`         | String              | 是      |         | 事件或事件組的唯一識別碼。 |
| `executionInfo`   | AgentExecutionInfo  | 是      |         | 提供與此事件關聯的執行上下文資訊。 |
| `runId`           | String              | 是      |         | 執行的唯一識別碼。 |
| `toolCallId`      | String              | 否       | null    | 工具呼叫的識別碼。 |
| `toolName`        | String              | 是      |         | 工具的名稱。 |
| `toolArgs`        | JsonObject          | 是      |         | 提供給工具的引數。 |
| `toolDescription` | String              | 否       | null    | 已執行工具的描述。 |
| `result`          | JsonElement         | 否       | null    | 工具呼叫的結果。 |

## 常見問題與疑難排解

以下部分包含與追蹤（Tracing）功能相關的常見問題及解答。

### 如何僅追蹤 Agent 執行的特定部分？

使用 `messageFilter` 屬性來篩選事件。例如，僅追蹤節點執行：

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
        
        // 僅追蹤 LLM 呼叫
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

        // 僅追蹤 LLM 呼叫
        fileWriter.setMessageFilter(message ->
            message instanceof LLMCallStartingEvent || message instanceof LLMCallCompletedEvent
        );
    })
    ```
    <!--- KNIT exampleEventsJava01.java -->

### 我可以使用多個訊息處理器嗎？

可以，您可以新增多個訊息處理器，同時將追蹤記錄傳送到不同的目的地：

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

### 如何建立自訂訊息處理器？

實作 `FeatureMessageProcessor` 介面：

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
            // 自訂處理邏輯
            if (message is NodeExecutionStartingEvent) {
                // 處理節點啟動事件
            } else if (message is LLMCallCompletedEvent) {
                // 處理 LLM 呼叫結束事件
            } else {
                // 處理其他事件類型
            }
        }

        override suspend fun close() {
            // 關閉已建立的連線
        }
    }

    val agent = AIAgent(
        promptExecutor = simpleOllamaAIExecutor(),
        llmModel = OllamaModels.Meta.LLAMA_3_2,
    ) {
        install(Tracing) {
            // 使用您的自訂處理器
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
            // 自訂處理邏輯
            if (message instanceof NodeExecutionStartingEvent) {
                // 處理節點啟動事件
            } else if (message instanceof LLMCallCompletedEvent) {
                // 處理 LLM 呼叫結束事件
            } else {
                // 處理其他事件類型
            }
        }

        @Override
        public void handleClose() {
            // 關閉已建立的連線
        }
    }

    var agent = AIAgent.builder()
        .promptExecutor(PromptExecutor.builder().ollama().build())
        .llmModel(OllamaModels.Meta.LLAMA_3_2)

        .install(Tracing.Feature, config -> {
            // 使用您的自訂處理器
            config.addMessageProcessor(new CustomTraceProcessor());
        })
        .build();
    ```
    <!--- KNIT exampleEventsJava03.java -->

欲了解更多可由訊息處理器處理的現有事件類型資訊，請參閱 [預定義事件類型](#predefined-event-types)。