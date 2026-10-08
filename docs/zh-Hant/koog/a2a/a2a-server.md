---
status: beta
---

# A2A 伺服器

--8<-- "versioning-snippets.md:beta"

A2A 伺服器使你能夠透過標準化的 A2A (Agent-to-Agent) 協定公開 AI 代理。它提供了 [A2A 協定規範](https://a2a-protocol.org/latest/specification/) 的完整實作，處理用戶端請求、執行代理邏輯、管理複雜的任務生命週期，並支援即時串流回應。

## 相依性 {id="dependencies"}

要在你的專案中使用 A2A 伺服器，請將以下相依性新增到你的 `build.gradle.kts`：

```kotlin
dependencies {
    // 核心 A2A 伺服器程式庫
    implementation("ai.koog:a2a-server:$koogVersion")

    // HTTP JSON-RPC 傳輸（最常用）
    implementation("ai.koog:a2a-transport-server-jsonrpc-http:$koogVersion")

    // Ktor 伺服器引擎（選擇適合你需求的引擎）
    implementation("io.ktor:ktor-server-netty:$ktorVersion")
}
```

## 總覽 {id="overview"}

A2A 伺服器充當 A2A 協定傳輸層與你的自訂代理邏輯之間的橋樑。
它編排整個請求生命週期，同時保持協定合規性並提供健全的工作階段管理。

## 核心組件 {id="core-components"}

### A2AServer {id="a2aserver"}

實作完整 A2A 協定的主要伺服器類別。它作為中央協調器，負責：

- 根據協定規範**驗證**傳入的請求
- **管理**並行工作階段和任務生命週期
- **編排**傳輸、存儲和商務邏輯層之間的通訊
- **處理**所有協定操作：訊息發送、任務查詢、取消、推送通知

`A2AServer` 接受兩個必要參數：

* `AgentExecutor`：定義代理的商務邏輯實作
* `AgentCard`：定義代理的能力和元資料

以及一些可用於自訂其存儲和傳輸行為的可選參數。

### AgentExecutor {id="agentexecutor"}

`AgentExecutor` 介面是你實作代理核心商務邏輯的地方。
它充當 A2A 協定與你特定 AI 代理能力之間的橋樑。
要開始執行你的代理，你必須實作 `execute` 方法，在其中定義你的代理邏輯。
要取消代理，你必須實作 `cancel` 方法。

```kotlin
class MyAgentExecutor : AgentExecutor {
    override suspend fun execute(
        context: RequestContext<MessageSendParams>,
        eventProcessor: SessionEventProcessor
    ) {
        // 在此實作代理邏輯
    }

    override suspend fun cancel(
        context: RequestContext<TaskIdParams>,
        eventProcessor: SessionEventProcessor,
        agentJob: Deferred<Unit>?
    ) {
        // 在此取消代理，可選
    }
}
```

`RequestContext` 提供有關當前請求的豐富資訊，
包括當前工作階段的 `contextId` 和 `taskId`、發送的 `message` 以及請求的 `params`。

`SessionEventProcessor` 與用戶端進行通訊：

- **`sendMessage(message)`**：發送即時回應（對話式互動）
- **`sendTaskEvent(event)`**：發送任務相關更新（長時間運行的操作）

```kotlin
// 用於即時回應（如聊天機器人）
eventProcessor.sendMessage(
    Message(
        messageId = generateId(),
        role = Role.Agent,
        parts = listOf(TextPart("這是你的答案！")),
        contextId = context.contextId
    )
)

// 用於基於任務的操作
eventProcessor.sendTaskEvent(
    TaskStatusUpdateEvent(
        contextId = context.contextId,
        taskId = context.taskId,
        status = TaskStatus(
            state = TaskState.Working,
            message = Message(/* 進度更新 */),
            timestamp = Clock.System.now()
        ),
        final = false  // 後續還有更多更新
    )
)
```

### AgentCard {id="agentcard"}

`AgentCard` 作為代理的自我描述清單。它告訴用戶端你的代理可以做什麼、如何與其通訊以及有哪些安全性需求。

```kotlin
val agentCard = AgentCard(
    // 基本身份
    name = "進階食譜助手",
    description = "專精於烹飪建議、食譜生成和飲食規劃的 AI 代理",
    version = "2.1.0",
    protocolVersion = "0.3.0",

    // 通訊設定
    url = "https://api.example.com/a2a",
    preferredTransport = TransportProtocol.JSONRPC,

    // 可選：多傳輸支援
    additionalInterfaces = listOf(
        AgentInterface("https://api.example.com/a2a", TransportProtocol.JSONRPC),
    ),

    // 能力宣告
    capabilities = AgentCapabilities(
        streaming = true,              // 支援即時回應
        pushNotifications = true,      // 發送非同步通知
        stateTransitionHistory = true  // 維護任務歷史記錄
    ),

    // 內容類型支援
    defaultInputModes = listOf("text/plain", "text/markdown", "image/jpeg"),
    defaultOutputModes = listOf("text/plain", "text/markdown", "application/json"),

    // 定義可用的安全性方案
    securitySchemes = mapOf(
        "bearer" to HTTPAuthSecurityScheme(
            scheme = "Bearer",
            bearerFormat = "JWT",
            description = "JWT 權杖驗證"
        ),
        "api-key" to APIKeySecurityScheme(
            `in` = In.Header,
            name = "X-API-Key",
            description = "用於服務驗證的 API 金鑰"
        )
    ),

    // 指定安全性需求（需求的邏輯或 OR）
    security = listOf(
        mapOf("bearer" to listOf("read", "write")),  // 選項 1：具備讀取/寫入範圍的 JWT
        mapOf("api-key" to emptyList())              // 選項 2：API 金鑰
    ),

    // 為已驗證的使用者啟用擴充卡片
    supportsAuthenticatedExtendedCard = true,
    
    // 技能/能力
    skills = listOf(
        AgentSkill(
            id = "recipe-generation",
            name = "食譜生成",
            description = "根據食材、飲食限制和偏好生成自訂食譜",
            tags = listOf("cooking", "recipes", "nutrition"),
            examples = listOf(
                "建立一個包含蘑菇的純素義大利麵食譜",
                "我有雞肉、米飯和蔬菜。我可以做什麼？"
            )
        ),
        AgentSkill(
            id = "meal-planning",
            name = "飲食規劃",
            description = "規劃每週飲食並生成購物清單",
            tags = listOf("meal-planning", "nutrition", "shopping")
        )
    ),

    // 可選：品牌推廣
    iconUrl = "https://example.com/agent-icon.png",
    documentationUrl = "https://docs.example.com/recipe-agent",
    provider = AgentProvider(
        organization = "CookingAI Inc.",
        url = "https://cookingai.com"
    )
)
```

### 傳輸層 {id="transport-layer"}

A2A 本身支援多種用於與用戶端通訊的傳輸協定。
目前，Koog 提供了透過 HTTP 進行 JSON-RPC 伺服器傳輸的實作。

#### HTTP JSON-RPC 傳輸 {id="http-json-rpc-transport"}

```kotlin
val transport = HttpJSONRPCServerTransport(server)
transport.start(
    engineFactory = CIO,           // Ktor 引擎 (CIO, Netty, Jetty)
    port = 8080,                   // 伺服器連接埠
    path = "/a2a",                 // API 端點路徑
    wait = true                    // 阻塞直到伺服器停止
)
```

### 存儲 {id="storage"}

A2A 伺服器使用可插拔的存儲架構，將不同類型的資料分開。
所有存儲實作都是可選的，開發時預設為記憶體內變體。

- **TaskStorage**：任務生命週期管理 - 存儲和管理任務狀態、歷史記錄和構件
- **MessageStorage**：對話歷史記錄 - 管理對話內容中的訊息歷史記錄
- **PushNotificationConfigStorage**：Webhook 管理 - 管理用於非同步通知的 Webhook 配置

## 快速入門 {id="quickstart"}

### 1. 建立 AgentCard {id="1-create-agentcard"}
定義代理的能力和元資料。
```kotlin
val agentCard = AgentCard(
    name = "IO 助手",
    description = "專精於輸入修改的 AI 代理",
    version = "2.1.0",
    protocolVersion = "0.3.0",

    // 通訊設定
    url = "https://api.example.com/a2a",
    preferredTransport = TransportProtocol.JSONRPC,

    // 能力宣告
    capabilities =
        AgentCapabilities(
            streaming = true,              // 支援即時回應
            pushNotifications = true,      // 發送非同步通知
            stateTransitionHistory = true  // 維護任務歷史記錄
        ),

    // 內容類型支援
    defaultInputModes = listOf("text/plain", "text/markdown", "image/jpeg"),
    defaultOutputModes = listOf("text/plain", "text/markdown", "application/json"),

    // 技能/能力
    skills = listOf(
        AgentSkill(
            id = "echo",
            name = "echo",
            description = "回傳使用者的訊息",
            tags = listOf("io"),
        )
    )
)
```

### 2. 建立一個 AgentExecutor {id="2-create-an-agentexecutor"}
執行器負責實作代理邏輯，處理傳入的請求並發送回應。

```kotlin
class EchoAgentExecutor : AgentExecutor {
    override suspend fun execute(
        context: RequestContext<MessageSendParams>,
        eventProcessor: SessionEventProcessor
    ) {
        val userMessage = context.params.message
        val userText = userMessage.parts
            .filterIsInstance<TextPart>()
            .joinToString(" ") { it.text }

        // 回傳使用者的訊息
        val response = Message(
            messageId = UUID.randomUUID().toString(),
            role = Role.Agent,
            parts = listOf(TextPart("你說了：$userText")),
            contextId = context.contextId,
            taskId = context.taskId
        )

        eventProcessor.sendMessage(response)
    }
}
```

### 2. 建立伺服器 {id="2-create-the-server"}
將代理執行器和代理卡片傳遞給伺服器。

```kotlin
val server = A2AServer(
    agentExecutor = EchoAgentExecutor(),
    agentCard = agentCard
)
```

### 3. 加入傳輸層 {id="3-add-transport-layer"}
建立傳輸層並啟動伺服器。
```kotlin
// HTTP JSON-RPC 傳輸
val transport = HttpJSONRPCServerTransport(server)
transport.start(
    engineFactory = CIO,
    port = 8080,
    path = "/agent",
    wait = true
)
```

## 代理實作模式 {id="agent-implementation-patterns"}

### 簡單回應代理 {id="simple-response-agent"}
如果你的代理只需要回應單條訊息，你可以將其實作為簡單代理。
這也適用於代理執行邏輯不複雜且不耗時的情況。

```kotlin
class SimpleAgentExecutor : AgentExecutor {
    override suspend fun execute(
        context: RequestContext<MessageSendParams>,
        eventProcessor: SessionEventProcessor
    ) {
        val response = Message(
            messageId = UUID.randomUUID().toString(),
            role = Role.Agent,
            parts = listOf(TextPart("來自代理的問候！")),
            contextId = context.contextId,
            taskId = context.taskId
        )

        eventProcessor.sendMessage(response)
    }
}
```

### 基於任務的代理 {id="task-based-agent"}
如果你的代理執行邏輯複雜且需要多個步驟，你可以將其實作為基於任務的代理。
這也適用於代理執行邏輯耗時且需要掛起的情況。
```kotlin
class TaskAgentExecutor : AgentExecutor {
    override suspend fun execute(
        context: RequestContext<MessageSendParams>,
        eventProcessor: SessionEventProcessor
    ) {
        // 發送正在進行中的狀態
        eventProcessor.sendTaskEvent(
            TaskStatusUpdateEvent(
                contextId = context.contextId,
                taskId = context.taskId,
                status = TaskStatus(
                    state = TaskState.Working,
                    timestamp = Clock.System.now()
                ),
                final = false
            )
        )

        // 執行工作...

        // 發送完成狀態
        eventProcessor.sendTaskEvent(
            TaskStatusUpdateEvent(
                contextId = context.contextId,
                taskId = context.taskId,
                status = TaskStatus(
                    state = TaskState.Completed,
                    timestamp = Clock.System.now()
                ),
                final = true
            )
        )
    }
}
```
