---
status: beta
---

# A2A 用戶端

--8<-- "versioning-snippets.md:beta"

A2A 用戶端讓您能夠透過網路與符合 A2A 規範的代理進行通訊。
它提供了 [A2A 通訊協定規格](https://a2a-protocol.org/latest/specification/) 的完整實作，處理代理探索、訊息交換、任務管理以及即時串流回應。

## 相依性 {id="dependencies"}

若要在您的專案中使用 A2A 用戶端，請將以下相依性新增至您的 `build.gradle.kts`：

```kotlin
dependencies {
    // 核心 A2A 用戶端程式庫
    implementation("ai.koog:a2a-client:$koogVersion")

    // HTTP JSON-RPC 傳輸 (最常見)
    implementation("ai.koog:a2a-transport-client-jsonrpc-http:$koogVersion")

    // Ktor 用戶端引擎 (選擇適合您需求的引擎)
    implementation("io.ktor:ktor-client-cio:$ktorVersion")
}
```

## 總覽 {id="overview"}

A2A 用戶端充當您的應用程式與符合 A2A 規範代理之間的橋樑。
它負責協調整個通訊生命週期，同時保持通訊協定合規性並提供穩健的工作階段管理。

## 核心元件 {id="core-components"}

### A2AClient {id="a2aclient"}

這是實作完整 A2A 通訊協定的主要用戶端類別。它作為中央協調器，負責：

- 透過可插拔的解析器 **管理** 連線與代理探索
- 自動符合通訊協定規範，**協調** 訊息交換與任務操作
- 在代理支援時，**處理** 串流回應與即時通訊
- 為穩健的應用程式 **提供** 全方位的錯誤處理與備援機制

`A2AClient` 接受兩個必要參數：

* `ClientTransport`：負責處理網路通訊層
* `AgentCardResolver`：負責處理代理探索與元資料擷取

`A2AClient` 介面提供了幾個與 A2A 代理互動的關鍵方法：

* `connect` 方法 - 用於連線至代理並獲取其能力，這會探索代理的功能並快取 `AgentCard`
* `sendMessage` 方法 - 向代理傳送訊息並接收單一回應，適用於簡單的請求-回應模式
* `sendMessageStreaming` 方法 - 傳送支援串流的訊息以獲取即時回應，這會回傳一個包含部分訊息與任務更新等事件的 `Flow`
* `getTask` 方法 - 用於查詢特定任務的狀態與詳細資訊
* `cancelTask` 方法 - 如果代理支援取消，則可用於取消執行中的任務
* `cachedAgentCard` 方法 - 用於獲取快取的代理卡而無需發起網路請求；如果尚未呼叫 `connect`，則回傳 null

### ClientTransport {id="clienttransport"}

`ClientTransport` 介面負責處理底層網路通訊，而 A2A 用戶端則管理通訊協定邏輯。
它抽象化了傳輸特定的細節，讓您能夠無縫使用不同的通訊協定。

#### HTTP JSON-RPC 傳輸 {id="http-json-rpc-transport"}

這是 A2A 代理最常用的傳輸方式：

```kotlin
val transport = HttpJSONRPCClientTransport(
    url = "https://agent.example.com/a2a",        // 代理端點 URL
    httpClient = HttpClient(CIO) {                // 選填：自訂 HTTP 用戶端
        install(ContentNegotiation) {
            json()
        }
        install(HttpTimeout) {
            requestTimeoutMillis = 30000
        }
    }
)
```

### AgentCardResolver {id="agentcardresolver"}

`AgentCardResolver` 介面用於擷取代理元資料與能力。
它支援從各種來源探索代理，並支援快取策略以達成最佳效能。

#### URL 代理卡解析器 {id="url-agent-card-resolver"}

遵循 A2A 慣例，從 HTTP 端點擷取代理卡：

```kotlin
val agentCardResolver = UrlAgentCardResolver(
    baseUrl = "https://agent.example.com",           // 代理服務的基礎 URL
    path = "/.well-known/agent-card.json",           // 標準代理卡位置
    httpClient = HttpClient(CIO),                    // 選填：自訂 HTTP 用戶端
)
```

## 快速入門 {id="quickstart"}

### 1. 建立用戶端 {id="1-create-the-client"}

定義傳輸與代理卡解析器，然後建立用戶端。

```kotlin
// HTTP JSON-RPC 傳輸
val transport = HttpJSONRPCClientTransport(
    url = "https://agent.example.com/a2a"
)

// 代理卡解析器
val agentCardResolver = UrlAgentCardResolver(
    baseUrl = "https://agent.example.com",
    path = "/.well-known/agent-card.json"
)

// 建立用戶端
val client = A2AClient(transport, agentCardResolver)
```

### 2. 連線與探索 {id="2-connect-and-discover"}

連線至代理並擷取其代理卡。
擁有代理卡後，您就可以查詢其能力並執行其他操作，例如檢查它是否支援串流。

```kotlin
// 連線並擷取代理能力
client.connect()
val agentCard = client.cachedAgentCard()

println("已連線至：${agentCard.name}")
println("支援串流：${agentCard.capabilities.streaming}")
```

### 3. 傳送訊息 {id="3-send-messages"}

向代理傳送訊息並接收單一回應。
如果代理直接回應，則回應可以是訊息；如果代理正在執行任務，則回應可以是任務事件。

```kotlin
val message = Message(
    messageId = UUID.randomUUID().toString(),
    role = Role.User,
    parts = listOf(TextPart("Hello, agent!")),
    contextId = "conversation-1"
)

val request = Request(data = MessageSendParams(message))
val response = client.sendMessage(request)

// 處理回應
when (val event = response.data) {
    is Message -> {
        val text = event.parts
            .filterIsInstance<TextPart>()
            .joinToString { it.text }
        print(text) // 串流部分回應
    }
    is TaskEvent -> {
        if (event.final) {
            println("\n任務已完成")
        }
    }
}
```

### 4. 傳送串流訊息 {id="4-send-messages-streaming"}

A2A 用戶端支援用於即時通訊的串流回應。
它不會只接收單一回應，而是回傳一個包含訊息與任務更新等事件的 `Flow`。

```kotlin
// 檢查代理是否支援串流
if (client.cachedAgentCard()?.capabilities?.streaming == true) {
    client.sendMessageStreaming(request).collect { response ->
        when (val event = response.data) {
            is Message -> {
                val text = event.parts
                    .filterIsInstance<TextPart>()
                    .joinToString { it.text }
                print(text) // 串流部分回應
            }
            is TaskStatusUpdateEvent -> {
                if (event.final) {
                    println("\n任務已完成")
                }
            }
        }
    }
} else {
    // 備援至非串流模式
    val response = client.sendMessage(request)
    // 處理單一回應
}
```

### 5. 管理任務 {id="5-manage-tasks"}

A2A 用戶端提供透過詢問狀態與取消來控制伺服器任務的方法。

```kotlin
// 查詢任務狀態
val taskRequest = Request(data = TaskQueryParams(taskId = "task-123"))
val taskResponse = client.getTask(taskRequest)
val task = taskResponse.data

println("任務狀態：${task.status.state}")

// 取消執行中的任務
if (task.status.state == TaskState.Working) {
    val cancelRequest = Request(data = TaskIdParams(taskId = "task-123"))
    val cancelledTask = client.cancelTask(cancelRequest).data
    println("任務已取消：${cancelledTask.status.state}")
}
```
