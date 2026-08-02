---
status: beta
---

# Amazon Bedrock AgentCore

--8<-- "versioning-snippets.md:beta"

Koog 提供與 Amazon Bedrock AgentCore 服務執行代理程式的整合。

## Amazon Bedrock AgentCore Runtime

`koog-bedrock-agentcore-runtime` 模組提供了一個 Ktor 路由安裝器，透過 [Amazon Bedrock AgentCore Runtime](https://docs.aws.amazon.com/bedrock-agentcore/latest/devguide/runtime.html) HTTP 合約公開 Koog 代理程式。它會在配置的 Ktor 路由下安裝以下端點：

- `POST /invocations` 處理代理程式請求。
- `GET /ping` 回報代理程式健康狀況與背景活動。

此模組支援具類型的 JSON 處理常式，以及文字、二進位、多部分 (Multipart) 與串流承載內容 (Payload)。叫用處理常式執行於 Ktor 的 `RoutingContext` 中，因此當安裝了 `koog-ktor` 外掛程式時，它們可以使用 Koog 路由擴充功能，例如 `aiAgent()`。

### 新增相依性

將 AgentCore Runtime 模組新增至您的 Gradle 組建中：

```kotlin
dependencies {
    implementation("ai.koog:koog-bedrock-agentcore-runtime:$koogVersion")
}
```

此模組需要 JVM 17 或更新版本、Kotlin 2.x 以及 Ktor 3.x。

### 安裝 Runtime 路由

以下範例安裝了 Koog 與 Ktor 的內容交涉 (Content Negotiation)，接著公開一個具類型的 JSON 叫用處理常式：

```kotlin
import ai.koog.agentcore.runtime.agentCoreRuntime
import ai.koog.agentcore.runtime.handle
import ai.koog.ktor.Koog
import ai.koog.ktor.aiAgent
import ai.koog.ktor.llm
import ai.koog.prompt.executor.clients.bedrock.BedrockModels
import io.ktor.serialization.kotlinx.json.json
import io.ktor.server.application.Application
import io.ktor.server.application.install
import io.ktor.server.plugins.contentnegotiation.ContentNegotiation
import io.ktor.server.routing.routing
import kotlinx.serialization.Serializable

@Serializable
data class InvocationRequest(val prompt: String)

@Serializable
data class InvocationResponse(val answer: String)

fun Application.module() {
    install(ContentNegotiation) {
        json()
    }

    install(Koog) {
        llm {
            bedrock()
        }
    }

    routing {
        agentCoreRuntime {
            handle<InvocationRequest, InvocationResponse> { request, context ->
                val sessionId = context.getHeader("X-Amzn-Bedrock-AgentCore-Runtime-Session-Id")
                val answer = aiAgent(
                    input = request.prompt,
                    model = BedrockModels.AmazonNovaMicro,
                )
                InvocationResponse(answer)
            }
        }
    }
}
```

具類型的處理常式將請求反序列化與回應序列化委派給 Ktor 的 `ContentNegotiation` 外掛程式。宿主應用程式必須為其接受的媒體類型安裝轉換器，例如用於 JSON 請求與回應的 `json()`。伺服器引擎、連接埠與其他應用程式外掛程式也仍由宿主應用程式控制。

### 處理不同的承載內容 (Payload) 類型

對於非 JSON 承載內容或多模態回應，請配置統一的 `handler`。它會接收 `InvocationInput` 與 `AgentCoreContext`，並回傳 `InvocationResult`：

```kotlin
routing {
    agentCoreRuntime {
        handler = { input, context ->
            when (input) {
                is InvocationInput.Text -> InvocationResult.Text(
                    aiAgent(input.body, model = BedrockModels.AmazonNovaMicro)
                )
                is InvocationInput.Binary -> InvocationResult.Binary(input.bytes, input.contentType)
                is InvocationInput.Stream -> InvocationResult.Text("Received a streamed request")
                is InvocationInput.Multipart -> InvocationResult.Text("Received multipart data")
            }
        }
    }
}
```

統一處理常式支援：

- `InvocationResult.Text` 用於基於 `Accept` 內容交涉的一次性文字輸出。
- `InvocationResult.Binary` 用於具有明確內容類型的原始影像、音訊、影片或文件位元組。
- `InvocationResult.TextStream` 用於以即時排清的 `text/event-stream` 事件發出的 `Flow<String>`。
- `InvocationResult.BinaryStream` 用於具有呼叫方選定內容類型的原始串流分塊。

串流回應是直接寫入的，不需要 Ktor 的 `SSE` 外掛程式。

### 配置請求處理

`AgentCoreRuntimeConfig` 提供以下選項：

| 選項 | 說明 | 預設值 |
|---|---|---|
| `handler` | 除非註冊了具類型的 `handle<I, O>` 處理常式，否則使用的統一處理常式。 | 未設定 |
| `binaryStreamThresholdBytes` | 超過此大小或沒有 `Content-Length` 的二進位主體將公開為 `InvocationInput.Stream`。 | 1 MiB |
| `maxRequestBytes` | 以 HTTP 413 拒絕宣告的 `Content-Length` 超過限制的請求。 | 100 MiB |
| `handlerTimeoutMillis` | 當處理常式超過此逾時時間時回傳 HTTP 504。非正值會停用逾時。 | `0` |
| `pingService` | 用於 `/ping` 端點的自訂健康服務。 | 任務感知 (Task-aware) 的預設服務 |
| `taskTracker` | 透過 `AgentCoreContext` 公開並由預設健康服務使用的追蹤器。 | 新的 `AgentCoreTaskTracker` |

沒有 `Content-Length` 標頭的請求不會針對 `maxRequestBytes` 進行預檢；底層伺服器引擎的限制仍然適用。

### 監視健康狀況與背景任務

`/ping` 端點回傳：

- 當代理程式沒有作用中的背景任務時，回傳 `Healthy` 與 HTTP 200。
- 當 `AgentCoreTaskTracker` 回報有作用中的工作時，回傳 `HealthyBusy` 與 HTTP 200。
- 當健康檢查偵測到問題時，回傳 `Unhealthy` 與 HTTP 503。

在啟動長時間執行的背景工作時，請使用從 `AgentCoreContext` 取得的追蹤器。這能讓 Runtime 獲知代理程式仍處於作用中。您可以透過將自訂的 `AgentCorePingService` 指派給 `pingService` 來取代預設行為。

速率限制 (Rate limiting) 也由宿主應用程式控制。全域安裝 Ktor 的 `RateLimit` 外掛程式，或將 `agentCoreRuntime` 路由封裝在具名的 `rateLimit` 區塊中，以套用所需的策略。

## Amazon Bedrock AgentCore Memory

Koog 透過兩種方式與 [Amazon Bedrock AgentCore Memory](https://docs.aws.amazon.com/bedrock-agentcore/latest/devguide/memory.html) 整合：

- `agents-features-chat-history-aws` 模組將對話歷史持久化為 AgentCore 事件。
- `agents-features-longterm-memory-aws` 模組檢索由 AgentCore 記憶策略產生的記錄，並將其新增至代理程式提示中。

這兩種整合都需要 JVM 17 或更新版本以及 AgentCore 記憶資源。透過標準的 AWS SDK 憑據與區域供應商鏈來配置 AWS 憑據與區域。

### 新增相依性

將一個或兩個 Memory 整合模組新增至您的 Gradle 組建中：

```kotlin
dependencies {
    implementation("ai.koog:agents-features-chat-history-aws:$koogVersion")
    implementation("ai.koog:agents-features-longterm-memory-aws:$koogVersion")
}
```

這兩個模組都會公開其公用 API 使用的 AWS SDK for Kotlin `BedrockAgentCoreClient`。長期記憶也會針對記憶策略探索公開 `BedrockAgentCoreControlClient`。

### 持續對話歷史

`AgentcoreChatHistoryProvider` 使用 AgentCore 的 `createEvent` 與 `listEvents` API 實作了 Koog 的 `ChatHistoryProvider`。透過 `ChatMemory` 特性安裝它：

```kotlin
import ai.koog.agents.chatMemory.feature.ChatMemory
import ai.koog.agents.core.agent.AIAgent
import ai.koog.agents.features.chathistory.aws.AgentcoreChatHistoryProvider
import aws.sdk.kotlin.services.bedrockagentcore.BedrockAgentCoreClient

val agentCoreClient = BedrockAgentCoreClient { region = "us-west-2" }
val chatHistoryProvider = AgentcoreChatHistoryProvider(
    client = agentCoreClient,
    memoryId = "memory-id",
)

val agent = AIAgent(/* ... */) {
    install(ChatMemory) {
        chatHistoryProvider = chatHistoryProvider
    }
}

val result = agent.run(
    agentInput = "Remember that I prefer window seats.",
    conversationId = "user-123:trip-456",
)
```

對話 ID 可以是 `actorId:sessionId` 或僅為 `actorId`。當省略工作階段 (Session) 部分時，除非您在其建構函式中設定 `defaultSession`，否則供應商會使用 `default-session`。

供應商會儲存純文字的 `Message.User` 與 `Message.Assistant` 訊息。從 AgentCore 載入的訊息會在元資料中包含其事件 ID，這讓供應商在重新儲存完整歷史時僅儲存新訊息。系統、工具、推理與非文字內容預設會被跳過；將 `ignoreUnsupportedValues = false` 設定為拒絕這些內容。使用 `pageSize` 控制 `listEvents` 分頁，並使用 `totalEventsLimit` 限制載入的事件數量。

### 檢索長期記憶

`LongTermMemory` 可以在每次 LLM 請求之前查詢一個或多個 AgentCore 記憶策略。`agentcore` DSL 會建立複合檢索，因此單一區塊可以結合多種策略類型與命名空間作用域：

```kotlin
import ai.koog.agents.features.longtermmemory.aws.dsl.agentcore
import ai.koog.agents.longtermmemory.feature.LongTermMemory

val agent = AIAgent(/* ... */) {
    install(LongTermMemory) {
        retrieval {
            agentcore(agentCoreClient, memoryId = "memory-id") {
                semantic(
                    strategyId = "semantic-strategy-id",
                    actorId = "user-123",
                    topK = 5,
                )
                userPreferences(
                    strategyId = "preference-strategy-id",
                    actorId = "user-123",
                    limit = 20,
                )
                summary(
                    strategyId = "summary-strategy-id",
                    actorId = "user-123",
                    sessionId = "trip-456",
                    topK = 3,
                )
            }
        }
    }
}
```

此 DSL 提供以下幫助程式：

| 幫助程式 | AgentCore 策略 | 命名空間作用域 | 檢索 |
|---|---|---|---|
| `semantic` | 語意記憶 | 參與者 (Actor) | 相似性搜尋 |
| `userPreferences` | 使用者偏好 | 參與者 (Actor) | 記錄列表 |
| `summary` | 摘要 | 參與者與工作階段 | 相似性搜尋 |
| `episodes` | 情節式片段 (Episodes) | 參與者與工作階段 | 相似性搜尋 |
| `reflections` | 情節式反思 (Reflections) | 參與者 (Actor) | 相似性搜尋 |
| `episodic` | 片段與反思 | 兩種作用域 | 複合相似性搜尋 |

預設情況下，命名空間遵循 AWS 文件的配置：參與者作用域記憶為 `/strategies/{strategyId}/actors/{actorId}/`，工作階段作用域記憶為 `/strategies/{strategyId}/actors/{actorId}/sessions/{sessionId}/`。如果記憶資源使用自訂的命名空間範本，請在 `agentcore` 區塊中指派 `AgentcoreNamespaceResolver`。

預設的 `AgentcorePromptAugmenter` 將語意、偏好、片段與反思記錄放在系統訊息中。摘要記錄會附加至最新的使用者訊息。在區塊中設定 `augmenter` 以使用另一個 Koog `PromptAugmenter`。

### 探索已配置的記憶策略

當策略 ID 或命名空間範本不應硬編碼時，請搭配 AWS `BedrockAgentCoreControlClient` 使用 `AgentcoreStrategyDiscovery`，然後將其結果傳遞給 `agentcoreDiscovered`。探索 DSL 會配置為記憶資源傳回的所有受支援策略，並讓您覆寫檢索限制、分數、篩選器與命名空間模式，或排除個別策略。當探索到的組合包含摘要或情節式策略時，必須提供 `sessionId`。

AgentCore 會從儲存的事件非同步建立長期記錄。因此，由 `ChatMemory` 寫入的事件可能無法立即供 `LongTermMemory` 使用。