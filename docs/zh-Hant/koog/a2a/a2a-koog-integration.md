---
status: beta
---

# A2A 與 Koog 整合

--8<-- "versioning-snippets.md:beta"

Koog 提供與 A2A 協定的無縫整合，允許您將 Koog 代理公開為 A2A 伺服器，並將 Koog 代理連線至其他符合 A2A 規範的代理。

## 相依性 {id="dependencies"}

A2A Koog 整合需要根據您的使用案例使用特定的功能模組：

### 將 Koog 代理公開為 A2A 伺服器 {id="for-exposing-koog-agents-as-a2a-servers"}

將這些相依性新增至您的 `build.gradle.kts`：

```kotlin
dependencies {
    // Koog A2A 伺服器整合功能
    implementation("ai.koog:agents-features-a2a-server:$koogVersion")

    // HTTP JSON-RPC 傳輸
    implementation("ai.koog:a2a-transport-server-jsonrpc-http:$koogVersion")

    // Ktor 伺服器引擎（選擇一個符合您需求的引擎）
    implementation("io.ktor:ktor-server-netty:$ktorVersion")
}
```

### 將 Koog 代理連線至 A2A 代理 {id="for-connecting-koog-agents-to-a2a-agents"}

將這些相依性新增至您的 `build.gradle.kts`：

```kotlin
dependencies {
    // Koog A2A 用戶端整合功能
    implementation("ai.koog:agents-features-a2a-client:$koogVersion")

    // HTTP JSON-RPC 傳輸
    implementation("ai.koog:a2a-transport-client-jsonrpc-http:$koogVersion")

    // Ktor 用戶端引擎（選擇一個符合您需求的引擎）
    implementation("io.ktor:ktor-client-cio:$ktorVersion")
}
```

## 概覽 {id="overview"}

此整合支援兩種主要模式：

1. **將 Koog 代理公開為 A2A 伺服器** - 讓您的 Koog 代理可透過 A2A 協定被探索和存取
2. **將 Koog 代理連線至 A2A 代理** - 讓您的 Koog 代理能與其他符合 A2A 規範的代理進行通訊

## 將 Koog 代理公開為 A2A 伺服器 {id="exposing-koog-agents-as-a2a-servers"}

### 定義具備 A2A 功能的 Koog 代理 {id="define-koog-agent-with-a2a-feature"}

我們先定義一個 Koog 代理。代理的邏輯可以有所不同，但這裡有一個包含工具的基本單次執行代理範例。
代理接收來自使用者的訊息，並將其轉發給 llm。
如果 llm 回應包含工具呼叫，代理將執行該工具並將結果轉發給 llm。
如果 llm 回應包含助手訊息，代理會將助手訊息傳送給使用者並結束。

在輸入調整大小時，代理會向 A2A 用戶端傳送包含輸入訊息的任務已提交事件。
在每次工具呼叫時，代理會向 A2A 用戶端傳送包含工具呼叫和結果的任務處理中事件。
在收到助手訊息時，代理會向 A2A 用戶端傳送包含助手訊息的任務已完成事件。

```kotlin
/**
 * 建立具備 A2A 功能的 Koog 代理
 */
@OptIn(ExperimentalUuidApi::class)
private fun createAgent(
    context: RequestContext<MessageSendParams>,
    eventProcessor: SessionEventProcessor,
) = AIAgent(
    promptExecutor = MultiLLMPromptExecutor(
        LLMProvider.Google to GoogleLLMClient("api-key")
    ),
    toolRegistry = ToolRegistry {
        // 在此宣告工具
    },
    strategy = strategy<A2AMessage, Unit>("test") {
        val nodeSetup by node<A2AMessage, Unit> { inputMessage ->
            // 將 A2A 訊息轉換為 Koog 訊息的便利函式
            val input = inputMessage.toKoogMessage()
            llm.writeSession {
                appendPrompt {
                    message(input)
                }
            }
            // 傳送更新事件至 A2A 用戶端
            withA2AAgentServer {
                sendTaskUpdate("Request submitted: ${input.content}", TaskState.Submitted)
            }
        }

        // 呼叫 llm
        val nodeLLMRequest by node<Unit, Message> {
            llm.writeSession {
                requestLLM()
            }
        }

        // 執行工具
        val nodeProcessTool by node<MessagePart.Tool.Call, Unit> { toolCall ->
            withA2AAgentServer {
                sendTaskUpdate("Executing tool: ${toolCall.content}", TaskState.Working)
            }

            val toolResult = environment.executeTool(toolCall)

            llm.writeSession {
                appendPrompt {
                    tool {
                        result(toolResult)
                    }
                }
            }
            withA2AAgentServer {
                sendTaskUpdate("Tool result: ${toolResult.content}", TaskState.Working)
            }
        }

        // 傳送助手訊息
        val nodeProcessAssistant by node<String, Unit> { assistantMessage ->
            withA2AAgentServer {
                sendTaskUpdate(assistantMessage, TaskState.Completed)
            }
        }

        edge(nodeStart forwardTo nodeSetup)
        edge(nodeSetup forwardTo nodeLLMRequest)

        // 如果 llm 回傳工具呼叫，則轉發至工具處理節點，然後回到 llm
        edge(nodeLLMRequest forwardTo nodeProcessTool onToolCall { true })
        edge(nodeProcessTool forwardTo nodeLLMRequest)

        // 如果 llm 回傳助手訊息，則轉發至助手處理節點，然後結束
        edge(nodeLLMRequest forwardTo nodeProcessAssistant onAssistantMessage { true })
        edge(nodeProcessAssistant forwardTo nodeFinish)
    },
    agentConfig = AIAgentConfig(
        prompt = prompt("agent") { system("You are a helpful assistant.") },
        model = GoogleModels.Gemini2_5Pro,
        maxAgentIterations = 10
    ),
) {
    install(A2AAgentServer) {
        this.context = context
        this.eventProcessor = eventProcessor
    }
}

/**
 * 傳送任務更新事件至 A2A 用戶端的便利函式
 * @param content 訊息內容
 * @param state 任務狀態
 */
@OptIn(ExperimentalUuidApi::class)
private suspend fun A2AAgentServer.sendTaskUpdate(
    content: String,
    state: TaskState,
) {
    val message = A2AMessage(
        messageId = Uuid.random().toString(),
        role = Role.Agent,
        parts = listOf(
            TextPart(content)
        ),
        contextId = context.contextId,
        taskId = context.taskId,
    )

    val task = Task(
        id = context.taskId,
        contextId = context.contextId,
        status = TaskStatus(
            state = state,
            message = message,
            timestamp = Clock.System.now(),
        )
    )
    eventProcessor.sendTaskEvent(task)
}
```

## A2AAgentServer 功能機制 {id="a2aagentserver-feature-mechanism"}

`A2AAgentServer` 是一個 Koog 代理功能，可實現 Koog 代理與 A2A 協定之間的無縫整合。
`A2AAgentServer` 功能提供對 `RequestContext` 和 `SessionEventProcessor` 實體的存取，這些實體用於在 Koog 代理內部與 A2A 用戶端進行通訊。

要安裝此功能，請在代理上呼叫 `install` 函式，並傳入 `A2AAgentServer` 功能以及 `RequestContext` 和 `SessionEventProcessor`：
```kotlin
// 安裝功能
install(A2AAgentServer) {
    this.context = context
    this.eventProcessor = eventProcessor
}
```

為了從 Koog 代理策略存取這些實體，該功能提供了一個 `withA2AAgentServer` 函式，允許代理節點在執行上下文中存取 A2A 伺服器功能。
它會擷取已安裝的 `A2AAgentServer` 功能，並將其作為操作區塊的接收者。

```kotlin
// 在代理節點內使用
withA2AAgentServer {
    // 現在 'this' 是 A2AAgentServer 執行個體
    eventProcessor.sendTaskUpdate("Processing your request...", TaskState.Working)
}
```

### 啟動 A2A 伺服器 {id="start-a2a-server"}
執行伺服器後，Koog 代理將可透過 A2A 協定被探索和存取。

```kotlin
val agentCard = AgentCard(
    name = "Koog Agent",
    url = "http://localhost:9999/koog",
    description = "Simple universal agent powered by Koog",
    version = "1.0.0",
    protocolVersion = "0.3.0",
    preferredTransport = TransportProtocol.JSONRPC,
    capabilities = AgentCapabilities(streaming = true),
    defaultInputModes = listOf("text"),
    defaultOutputModes = listOf("text"),
    skills = listOf(
        AgentSkill(
            id = "koog",
            name = "Koog Agent",
            description = "Universal agent powered by Koog. Supports tool calling.",
            tags = listOf("chat", "tool"),
        )
    )
)
// 伺服器設定
val server = A2AServer(agentExecutor = KoogAgentExecutor(), agentCard = agentCard)
val transport = HttpJSONRPCServerTransport(server)
transport.start(engineFactory = Netty, port = 8080, path = "/chat", wait = true)
```

## 將 Koog 代理連線至 A2A 代理 {id="connecting-koog-agents-to-a2a-agents"}

### 建立 A2A 用戶端並連線至 A2A 伺服器 {id="create-a2a-client-and-connect-to-the-a2a-server"}

```kotlin
val transport = HttpJSONRPCClientTransport(url = "http://localhost:9999/koog")
val agentCardResolver =
    UrlAgentCardResolver(baseUrl = "http://localhost:9999", path = "/koog")
val client = A2AClient(transport = transport, agentCardResolver = agentCardResolver)

val agentId = "koog"
client.connect()
```

### 建立 Koog 代理並將 A2A 用戶端新增至 A2AAgentClient 功能 {id="create-koog-agent-and-add-a2a-client-to-a2aagentclient-feature"}
要從您的 Koog 代理連線至 A2A 代理，您可以使用 A2AAgentClient 功能，它提供了一個用於連線至 A2A 代理的用戶端 API。
用戶端的原理與伺服器相同：您安裝該功能並傳入 `A2AAgentClient` 功能以及 `RequestContext` 和 `SessionEventProcessor`。

```kotlin
val agent = AIAgent(
    promptExecutor = MultiLLMPromptExecutor(
        LLMProvider.Google to GoogleLLMClient("api-key")
    ),
    toolRegistry = ToolRegistry {
        // 在此宣告工具
    },
    strategy = strategy<String, Unit>("test") {

        val nodeCheckStreaming by nodeA2AClientGetAgentCard().transform { it.capabilities.streaming }

        val nodeA2ASendMessageStreaming by nodeA2AClientSendMessageStreaming()
        val nodeA2ASendMessage by nodeA2AClientSendMessage()

        val nodeProcessStreaming by node<Flow<Response<Event>>, Unit> {
            it.collect { response ->
                when (response.data) {
                    is Task -> {
                        // 處理任務
                    }

                    is A2AMessage -> {
                        // 處理訊息
                    }

                    is TaskStatusUpdateEvent -> {
                        // 處理任務狀態更新
                    }

                    is TaskArtifactUpdateEvent -> {
                        // 處理任務成品更新
                    }
                }
            }
        }

        val nodeProcessEvent by node<CommunicationEvent, Unit> { event ->
            when (event) {
                is Task -> {
                    // 處理任務
                }

                is A2AMessage -> {
                    // 處理訊息
                }
            }
        }

        // 如果支援串流，則傳送訊息、處理回應並結束
        edge(nodeStart forwardTo nodeCheckStreaming transformed { agentId })
        edge(
            nodeCheckStreaming forwardTo nodeA2ASendMessageStreaming
                onCondition { it == true } transformed { buildA2ARequest(agentId) }
        )
        edge(nodeA2ASendMessageStreaming forwardTo nodeProcessStreaming)
        edge(nodeProcessStreaming forwardTo nodeFinish)

        // 如果不支援串流，則傳送訊息、處理回應並結束
        edge(
            nodeCheckStreaming forwardTo nodeA2ASendMessage
                onCondition { it == false } transformed { buildA2ARequest(agentId) }
        )
        edge(nodeA2ASendMessage forwardTo nodeProcessEvent)
        edge(nodeProcessEvent forwardTo nodeFinish)

        // 如果不支援串流，則傳送訊息、處理回應並結束
        edge(nodeCheckStreaming forwardTo nodeFinish onCondition { it == null }
            transformed { println("Failed to get agents card") }
        )

    },
    agentConfig = AIAgentConfig(
        prompt = prompt("agent") { system("You are a helpful assistant.") },
        model = GoogleModels.Gemini2_5Pro,
        maxAgentIterations = 10
    ),
) {
    install(A2AAgentClient) {
        this.a2aClients = mapOf(agentId to client)
    }
}

@OptIn(ExperimentalUuidApi::class)
private fun AIAgentGraphContextBase.buildA2ARequest(agentId: String): A2AClientRequest<MessageSendParams> =
    A2AClientRequest(
        agentId = agentId,
        callContext = ClientCallContext.Default,
        params = MessageSendParams(
            message = A2AMessage(
                messageId = Uuid.random().toString(),
                role = Role.User,
                parts = listOf(
                    TextPart(agentInput as String)
                )
            )
        )
    )
```
