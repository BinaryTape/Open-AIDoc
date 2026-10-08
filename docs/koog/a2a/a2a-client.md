---
status: beta
---

# A2A 客户端

--8<-- "versioning-snippets.md:beta"

A2A 客户端支持您通过网络与符合 A2A 规范的代理进行通信。
它提供了 [A2A 协议规范](https://a2a-protocol.org/latest/specification/) 的完整实现，处理代理发现、消息交换、任务管理和实时流式响应。

## 依赖项 {id="dependencies"}

要在您的项目中使用 A2A 客户端，请将以下依赖项添加到您的 `build.gradle.kts` 中：

```kotlin
dependencies {
    // 核心 A2A 客户端库
    implementation("ai.koog:a2a-client:$koogVersion")

    // HTTP JSON-RPC 传输（最常用）
    implementation("ai.koog:a2a-transport-client-jsonrpc-http:$koogVersion")

    // Ktor 客户端引擎（选择适合您需求的引擎）
    implementation("io.ktor:ktor-client-cio:$ktorVersion")
}
```

## 概览 {id="overview"}

A2A 客户端充当您的应用程序与符合 A2A 规范的代理之间的桥梁。
它在保持协议合规性的同时协调整个通信生命周期，并提供稳健的会话管理。

## 核心组件 {id="core-components"}

### A2AClient {id="a2aclient"}

实现完整 A2A 协议的主客户端类。它作为核心协调器，负责：

- 通过可插拔的解析器**管理**连接和代理发现
- 自动遵循协议合规性，**协调**消息交换和任务操作
- 在代理支持时**处理**流式响应和实时通信
- 为稳健的应用程序**提供**全面的错误处理和回退机制

`A2AClient` 接受两个必需参数：

* `ClientTransport`：处理网络通信层
* `AgentCardResolver`：处理代理发现和元数据检索

`A2AClient` 接口提供了几个与 A2A 代理交互的关键方法：

* `connect` 方法 - 连接到代理并检索其能力，发现代理的功能并缓存 `AgentCard`
* `sendMessage` 方法 - 向代理发送消息并接收单个响应，用于简单的请求-响应模式
* `sendMessageStreaming` 方法 - 发送支持流式传输的消息以获取实时响应，返回包含部分消息和任务更新的事件 Flow
* `getTask` 方法 - 查询特定任务的状态和详细信息
* `cancelTask` 方法 - 如果代理支持取消，则取消正在运行的任务
* `cachedAgentCard` 方法 - 在不发起网络请求的情况下获取缓存的代理卡，如果尚未调用 `connect` 则返回 null

### ClientTransport {id="clienttransport"}

`ClientTransport` 接口处理低层网络通信，而 A2A 客户端负责管理协议逻辑。
它抽象掉了传输特定的细节，允许您无缝使用不同的协议。

#### HTTP JSON-RPC 传输 {id="http-json-rpc-transport"}

A2A 代理最常用的传输方式：

```kotlin
val transport = HttpJSONRPCClientTransport(
    url = "https://agent.example.com/a2a",        // 代理端点 URL
    httpClient = HttpClient(CIO) {                // 可选：自定义 HTTP 客户端
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

`AgentCardResolver` 接口检索代理元数据和能力。
它支持从各种来源发现代理，并支持缓存策略以实现最佳性能。

#### URL 代理卡解析器 {id="url-agent-card-resolver"}

遵循 A2A 约定从 HTTP 端点获取代理卡：

```kotlin
val agentCardResolver = UrlAgentCardResolver(
    baseUrl = "https://agent.example.com",           // 代理服务的基准 URL
    path = "/.well-known/agent-card.json",           // 标准代理卡位置
    httpClient = HttpClient(CIO),                    // 可选：自定义 HTTP 客户端
)
```

## 快速入门 {id="quickstart"}

### 1. 创建客户端 {id="1-create-the-client"}

定义传输方式和代理卡解析器，并创建客户端。

```kotlin
// HTTP JSON-RPC 传输
val transport = HttpJSONRPCClientTransport(
    url = "https://agent.example.com/a2a"
)

// 代理卡解析器
val agentCardResolver = UrlAgentCardResolver(
    baseUrl = "https://agent.example.com",
    path = "/.well-known/agent-card.json"
)

// 创建客户端
val client = A2AClient(transport, agentCardResolver)
```

### 2. 连接与发现 {id="2-connect-and-discover"}

连接到代理并检索其卡片。
拥有代理卡后，您可以查询其能力并执行其他操作，例如检查其是否支持流式传输。

```kotlin
// 连接并检索代理能力
client.connect()
val agentCard = client.cachedAgentCard()

println("Connected to: ${agentCard.name}")
println("Supports streaming: ${agentCard.capabilities.streaming}")
```

### 3. 发送消息 {id="3-send-messages"}

向代理发送消息并接收单个响应。
响应可以是代理直接回复的消息，也可以是代理正在执行任务时的任务事件。

```kotlin
val message = Message(
    messageId = UUID.randomUUID().toString(),
    role = Role.User,
    parts = listOf(TextPart("Hello, agent!")),
    contextId = "conversation-1"
)

val request = Request(data = MessageSendParams(message))
val response = client.sendMessage(request)

// 处理响应
when (val event = response.data) {
    is Message -> {
        val text = event.parts
            .filterIsInstance<TextPart>()
            .joinToString { it.text }
        print(text) // 打印响应内容
    }
    is TaskEvent -> {
        if (event.final) {
            println("\nTask completed")
        }
    }
}
```

### 4. 发送流式消息 {id="4-send-messages-streaming"}

A2A 客户端支持用于实时通信的流式响应。
它不返回单个响应，而是返回一个包含消息和任务更新的事件 `Flow`。

```kotlin
// 检查代理是否支持流式传输
if (client.cachedAgentCard()?.capabilities?.streaming == true) {
    client.sendMessageStreaming(request).collect { response ->
        when (val event = response.data) {
            is Message -> {
                val text = event.parts
                    .filterIsInstance<TextPart>()
                    .joinToString { it.text }
                print(text) // 流式传输部分响应
            }
            is TaskStatusUpdateEvent -> {
                if (event.final) {
                    println("\nTask completed")
                }
            }
        }
    }
} else {
    // 回退到非流式传输
    val response = client.sendMessage(request)
    // 处理单个响应
}
```

### 5. 管理任务 {id="5-manage-tasks"}

A2A 客户端提供了通过查询状态和取消操作来控制服务器任务的方法。

```kotlin
// 查询任务状态
val taskRequest = Request(data = TaskQueryParams(taskId = "task-123"))
val taskResponse = client.getTask(taskRequest)
val task = taskResponse.data

println("Task state: ${task.status.state}")

// 取消正在运行的任务
if (task.status.state == TaskState.Working) {
    val cancelRequest = Request(data = TaskIdParams(taskId = "task-123"))
    val cancelledTask = client.cancelTask(cancelRequest).data
    println("Task cancelled: ${cancelledTask.status.state}")
}
```
