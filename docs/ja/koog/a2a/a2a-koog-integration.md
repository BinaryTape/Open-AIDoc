---
status: beta
---

# A2AとKoogの統合

--8<-- "versioning-snippets.md:beta"

KoogはA2Aプロトコルとのシームレスな統合を提供し、KoogエージェントをA2Aサーバーとして公開したり、Koogエージェントを他のA2A準拠のエージェントに接続したりすることを可能にします。

## 依存関係 {id="dependencies"}

A2AとKoogの統合には、ユースケースに応じて特定のフィーチャー（feature）モジュールが必要です：

### KoogエージェントをA2Aサーバーとして公開する場合 {id="for-exposing-koog-agents-as-a2a-servers"}

以下の依存関係を `build.gradle.kts` に追加してください：

```kotlin
dependencies {
    // Koog A2Aサーバー統合フィーチャー
    implementation("ai.koog:agents-features-a2a-server:$koogVersion")

    // HTTP JSON-RPCトランスポート
    implementation("ai.koog:a2a-transport-server-jsonrpc-http:$koogVersion")

    // Ktorサーバーエンジン（ニーズに合ったものを選択してください）
    implementation("io.ktor:ktor-server-netty:$ktorVersion")
}
```

### KoogエージェントをA2Aエージェントに接続する場合 {id="for-connecting-koog-agents-to-a2a-agents"}

以下の依存関係を `build.gradle.kts` に追加してください：

```kotlin
dependencies {
    // Koog A2Aクライアント統合フィーチャー
    implementation("ai.koog:agents-features-a2a-client:$koogVersion")

    // HTTP JSON-RPCトランスポート
    implementation("ai.koog:a2a-transport-client-jsonrpc-http:$koogVersion")

    // Ktorクライアントエンジン（ニーズに合ったものを選択してください）
    implementation("io.ktor:ktor-client-cio:$ktorVersion")
}
```

## 概要 {id="overview"}

この統合により、主に2つのパターンが可能になります：

1. **KoogエージェントをA2Aサーバーとして公開する** - A2Aプロトコルを介してKoogエージェントを検出・アクセス可能にします。
2. **KoogエージェントをA2Aエージェントに接続する** - Koogエージェントが他のA2A準拠のエージェントと通信できるようにします。

## KoogエージェントをA2Aサーバーとして公開する {id="exposing-koog-agents-as-a2a-servers"}

### A2Aフィーチャーを使用したKoogエージェントの定義 {id="define-koog-agent-with-a2a-feature"}

まず、Koogエージェントを定義しましょう。エージェントのロジックはさまざまですが、ここではツールを備えた基本的なシングルランエージェントの例を示します。
このエージェントはユーザーからメッセージを受け取り、それをLLMに転送します。
LLMのレスポンスにツール呼び出し（tool call）が含まれている場合、エージェントはツールを実行し、その結果をLLMに転送します。
LLMのレスポンスにアシスタントメッセージが含まれている場合、エージェントはアシスタントメッセージをユーザーに送信して終了します。

入力時（input resize）、エージェントは入力メッセージとともに「タスク送信済み（submitted）」イベントをA2Aクライアントに送信します。
各ツール呼び出し時、エージェントはツール呼び出しと実行結果とともに「タスク実行中（working）」イベントをA2Aクライアントに送信します。
アシスタントメッセージの受信時、エージェントはアシスタントメッセージとともに「タスク完了（complete）」イベントをA2Aクライアントに送信します。

```kotlin
/**
 * A2Aフィーチャーを備えたKoogエージェントを作成する
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
        // ここにツールを宣言します
    },
    strategy = strategy<A2AMessage, Unit>("test") {
        val nodeSetup by node<A2AMessage, Unit> { inputMessage ->
            // A2AメッセージをKoogメッセージに変換する便利な関数
            val input = inputMessage.toKoogMessage()
            llm.writeSession {
                appendPrompt {
                    message(input)
                }
            }
            // A2Aクライアントに更新イベントを送信する
            withA2AAgentServer {
                sendTaskUpdate("Request submitted: ${input.content}", TaskState.Submitted)
            }
        }

        // LLMの呼び出し
        val nodeLLMRequest by node<Unit, Message> {
            llm.writeSession {
                requestLLM()
            }
        }

        // ツールの実行
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

        // アシスタントメッセージの送信
        val nodeProcessAssistant by node<String, Unit> { assistantMessage ->
            withA2AAgentServer {
                sendTaskUpdate(assistantMessage, TaskState.Completed)
            }
        }

        edge(nodeStart forwardTo nodeSetup)
        edge(nodeSetup forwardTo nodeLLMRequest)

        // LLMからツール呼び出しが返された場合、ツール処理ノードに転送し、その後LLMに戻る
        edge(nodeLLMRequest forwardTo nodeProcessTool onToolCall { true })
        edge(nodeProcessTool forwardTo nodeLLMRequest)

        // LLMからアシスタントメッセージが返された場合、アシスタント処理ノードに転送して終了する
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
 * A2Aクライアントにタスク更新イベントを送信するための便利な関数
 * @param content メッセージ内容
 * @param state タスクの状態
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

## A2AAgentServer フィーチャーの仕組み {id="a2aagentserver-feature-mechanism"}

`A2AAgentServer` は、KoogエージェントとA2Aプロトコルのシームレスな統合を可能にするKoogエージェントのフィーチャーです。
`A2AAgentServer` フィーチャーは、`RequestContext` および `SessionEventProcessor` エンティティへのアクセスを提供します。これらは、Koogエージェント内部でA2Aクライアントと通信するために使用されます。

このフィーチャーをインストールするには、エージェントで `install` 関数を呼び出し、`RequestContext` と `SessionEventProcessor` とともに `A2AAgentServer` フィーチャーを渡します：
```kotlin
// フィーチャーのインストール
install(A2AAgentServer) {
    this.context = context
    this.eventProcessor = eventProcessor
}
```

Koogエージェントのストラテジー（strategy）からこれらのエンティティにアクセスするために、このフィーチャーは `withA2AAgentServer` 関数を提供します。これにより、エージェントノードはその実行コンテキスト内でA2Aサーバーの機能にアクセスできるようになります。
これは、インストールされている `A2AAgentServer` フィーチャーを取得し、アクションブロックのレシーバー（receiver）として提供します。

```kotlin
// エージェントノード内での使用
withA2AAgentServer {
    // 'this' は A2AAgentServer インスタンスになります
    eventProcessor.sendTaskUpdate("Processing your request...", TaskState.Working)
}
```

### A2Aサーバーの起動 {id="start-a2a-server"}
サーバーを実行すると、KoogエージェントはA2Aプロトコルを介して検出およびアクセス可能になります。

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
// サーバーのセットアップ
val server = A2AServer(agentExecutor = KoogAgentExecutor(), agentCard = agentCard)
val transport = HttpJSONRPCServerTransport(server)
transport.start(engineFactory = Netty, port = 8080, path = "/chat", wait = true)
```

## KoogエージェントをA2Aエージェントに接続する {id="connecting-koog-agents-to-a2a-agents"}

### A2Aクライアントの作成とA2Aサーバーへの接続 {id="create-a2a-client-and-connect-to-the-a2a-server"}

```kotlin
val transport = HttpJSONRPCClientTransport(url = "http://localhost:9999/koog")
val agentCardResolver =
    UrlAgentCardResolver(baseUrl = "http://localhost:9999", path = "/koog")
val client = A2AClient(transport = transport, agentCardResolver = agentCardResolver)

val agentId = "koog"
client.connect()
```

### Koogエージェントの作成とA2AAgentClientフィーチャーへのA2Aクライアントの追加 {id="create-koog-agent-and-add-a2a-client-to-a2aagentclient-feature"}
KoogエージェントからA2Aエージェントに接続するには、A2Aエージェントに接続するためのクライアントAPIを提供する `A2AAgentClient` フィーチャーを使用できます。
クライアントの仕組みはサーバーと同じです。フィーチャーをインストールし、`RequestContext` と `SessionEventProcessor` とともに `A2AAgentClient` フィーチャーを渡します。

```kotlin
val agent = AIAgent(
    promptExecutor = MultiLLMPromptExecutor(
        LLMProvider.Google to GoogleLLMClient("api-key")
    ),
    toolRegistry = ToolRegistry {
        // ここにツールを宣言します
    },
    strategy = strategy<String, Unit>("test") {

        val nodeCheckStreaming by nodeA2AClientGetAgentCard().transform { it.capabilities.streaming }

        val nodeA2ASendMessageStreaming by nodeA2AClientSendMessageStreaming()
        val nodeA2ASendMessage by nodeA2AClientSendMessage()

        val nodeProcessStreaming by node<Flow<Response<Event>>, Unit> {
            it.collect { response ->
                when (response.data) {
                    is Task -> {
                        // タスクを処理
                    }

                    is A2AMessage -> {
                        // メッセージを処理
                    }

                    is TaskStatusUpdateEvent -> {
                        // タスクステータスの更新を処理
                    }

                    is TaskArtifactUpdateEvent -> {
                        // タスクアーティファクトの更新を処理
                    }
                }
            }
        }

        val nodeProcessEvent by node<CommunicationEvent, Unit> { event ->
            when (event) {
                is Task -> {
                    // タスクを処理
                }

                is A2AMessage -> {
                    // メッセージを処理
                }
            }
        }

        // ストリーミングがサポートされている場合、メッセージを送信し、レスポンスを処理して終了する
        edge(nodeStart forwardTo nodeCheckStreaming transformed { agentId })
        edge(
            nodeCheckStreaming forwardTo nodeA2ASendMessageStreaming
                onCondition { it == true } transformed { buildA2ARequest(agentId) }
        )
        edge(nodeA2ASendMessageStreaming forwardTo nodeProcessStreaming)
        edge(nodeProcessStreaming forwardTo nodeFinish)

        // ストリーミングがサポートされていない場合、メッセージを送信し、レスポンスを処理して終了する
        edge(
            nodeCheckStreaming forwardTo nodeA2ASendMessage
                onCondition { it == false } transformed { buildA2ARequest(agentId) }
        )
        edge(nodeA2ASendMessage forwardTo nodeProcessEvent)
        edge(nodeProcessEvent forwardTo nodeFinish)

        // ストリーミングがサポートされていない場合、またはエージェントカードの取得に失敗した場合
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
