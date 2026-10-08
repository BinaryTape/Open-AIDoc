---
status: beta
---

# A2A 및 Koog 통합

--8<-- "versioning-snippets.md:beta"

Koog는 A2A 프로토콜과의 매끄러운 통합을 제공하여, Koog 에이전트를 A2A 서버로 노출하거나 Koog 에이전트를 다른 A2A 준수 에이전트에 연결할 수 있도록 합니다.

## 의존성 {id="dependencies"}

A2A Koog 통합은 사용 사례에 따라 특정 기능 모듈이 필요합니다.

### Koog 에이전트를 A2A 서버로 노출하는 경우 {id="for-exposing-koog-agents-as-a2a-servers"}

`build.gradle.kts`에 다음 의존성을 추가하세요:

```kotlin
dependencies {
    // Koog A2A 서버 통합 기능
    implementation("ai.koog:agents-features-a2a-server:$koogVersion")

    // HTTP JSON-RPC 트랜스포트
    implementation("ai.koog:a2a-transport-server-jsonrpc-http:$koogVersion")

    // Ktor 서버 엔진 (필요에 맞는 엔진 선택)
    implementation("io.ktor:ktor-server-netty:$ktorVersion")
}
```

### Koog 에이전트를 A2A 에이전트에 연결하는 경우 {id="for-connecting-koog-agents-to-a2a-agents"}

`build.gradle.kts`에 다음 의존성을 추가하세요:

```kotlin
dependencies {
    // Koog A2A 클라이언트 통합 기능
    implementation("ai.koog:agents-features-a2a-client:$koogVersion")

    // HTTP JSON-RPC 트랜스포트
    implementation("ai.koog:a2a-transport-client-jsonrpc-http:$koogVersion")

    // Ktor 클라이언트 엔진 (필요에 맞는 엔진 선택)
    implementation("io.ktor:ktor-client-cio:$ktorVersion")
}
```

## 개요 {id="overview"}

이 통합은 두 가지 주요 패턴을 지원합니다:

1. **Koog 에이전트를 A2A 서버로 노출** - Koog 에이전트를 A2A 프로토콜을 통해 검색 및 액세스 가능하게 만듭니다.
2. **Koog 에이전트를 A2A 에이전트에 연결** - Koog 에이전트가 다른 A2A 준수 에이전트와 통신할 수 있도록 합니다.

## Koog 에이전트를 A2A 서버로 노출하기 {id="exposing-koog-agents-as-a2a-servers"}

### A2A 기능이 포함된 Koog 에이전트 정의하기 {id="define-koog-agent-with-a2a-feature"}

먼저 Koog 에이전트를 정의해 보겠습니다. 에이전트의 로직은 다양할 수 있지만, 여기서는 도구(tools)가 포함된 기본적인 단일 실행 에이전트의 예시를 보여줍니다.
에이전트는 사용자로부터 메시지를 수신하고 이를 LLM에 전달합니다.
LLM 응답에 도구 호출(tool call)이 포함된 경우, 에이전트는 도구를 실행하고 그 결과를 LLM에 전달합니다.
LLM 응답에 어시스턴트 메시지가 포함된 경우, 에이전트는 어시스턴트 메시지를 사용자에게 전송하고 종료합니다.

입력 처리 시 에이전트는 입력 메시지와 함께 작업 제출(task submitted) 이벤트를 A2A 클라이언트에 보냅니다.
각 도구 호출 시 에이전트는 도구 호출 내용 및 결과와 함께 작업 진행 중(task working) 이벤트를 A2A 클라이언트에 보냅니다.
어시스턴트 메시지 생성 시 에이전트는 어시스턴트 메시지와 함께 작업 완료(task complete) 이벤트를 A2A 클라이언트에 보냅니다.

```kotlin
/**
 * A2A 기능이 포함된 Koog 에이전트 생성
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
        // 여기에 도구 선언
    },
    strategy = strategy<A2AMessage, Unit>("test") {
        val nodeSetup by node<A2AMessage, Unit> { inputMessage ->
            // A2A 메시지를 Koog 메시지로 변환하는 편의 함수
            val input = inputMessage.toKoogMessage()
            llm.writeSession {
                appendPrompt {
                    message(input)
                }
            }
            // A2A 클라이언트에 업데이트 이벤트 전송
            withA2AAgentServer {
                sendTaskUpdate("Request submitted: ${input.content}", TaskState.Submitted)
            }
        }

        // LLM 호출
        val nodeLLMRequest by node<Unit, Message> {
            llm.writeSession {
                requestLLM()
            }
        }

        // 도구 실행
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

        // 어시스턴트 메시지 전송
        val nodeProcessAssistant by node<String, Unit> { assistantMessage ->
            withA2AAgentServer {
                sendTaskUpdate(assistantMessage, TaskState.Completed)
            }
        }

        edge(nodeStart forwardTo nodeSetup)
        edge(nodeSetup forwardTo nodeLLMRequest)

        // LLM에서 도구 호출이 반환되면 도구 처리 노드로 전달한 후 다시 LLM으로 복귀
        edge(nodeLLMRequest forwardTo nodeProcessTool onToolCall { true })
        edge(nodeProcessTool forwardTo nodeLLMRequest)

        // LLM에서 어시스턴트 메시지가 반환되면 어시스턴트 처리 노드로 전달한 후 종료
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
 * A2A 클라이언트에 작업 업데이트 이벤트를 전송하는 편의 함수
 * @param content 메시지 내용
 * @param state 작업 상태
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

## A2AAgentServer 기능 메커니즘 {id="a2aagentserver-feature-mechanism"}

`A2AAgentServer`는 Koog 에이전트와 A2A 프로토콜 간의 원활한 통합을 가능하게 하는 Koog 에이전트 기능입니다.
`A2AAgentServer` 기능은 Koog 에이전트 내부에서 A2A 클라이언트와 통신하는 데 사용되는 `RequestContext` 및 `SessionEventProcessor` 엔티티에 대한 액세스를 제공합니다.

기능을 설치하려면 에이전트에서 `install` 함수를 호출하고 `RequestContext` 및 `SessionEventProcessor`와 함께 `A2AAgentServer` 기능을 전달합니다.
```kotlin
// 기능 설치
install(A2AAgentServer) {
    this.context = context
    this.eventProcessor = eventProcessor
}
```

Koog 에이전트 전략에서 이러한 엔티티에 액세스할 수 있도록, 이 기능은 에이전트 노드가 실행 컨텍스트 내에서 A2A 서버 기능에 액세스할 수 있게 해주는 `withA2AAgentServer` 함수를 제공합니다.
이 함수는 설치된 `A2AAgentServer` 기능을 검색하여 액션 블록의 수신자(receiver)로 제공합니다.

```kotlin
// 에이전트 노드 내에서의 사용
withA2AAgentServer {
    // 'this'는 이제 A2AAgentServer 인스턴스입니다.
    eventProcessor.sendTaskUpdate("Processing your request...", TaskState.Working)
}
```

### A2A 서버 시작하기 {id="start-a2a-server"}
서버를 실행하면 Koog 에이전트는 A2A 프로토콜을 통해 검색 및 액세스가 가능해집니다.

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
// 서버 설정
val server = A2AServer(agentExecutor = KoogAgentExecutor(), agentCard = agentCard)
val transport = HttpJSONRPCServerTransport(server)
transport.start(engineFactory = Netty, port = 8080, path = "/chat", wait = true)
```

## Koog 에이전트를 A2A 에이전트에 연결하기 {id="connecting-koog-agents-to-a2a-agents"}

### A2A 클라이언트 생성 및 A2A 서버에 연결하기 {id="create-a2a-client-and-connect-to-the-a2a-server"}

```kotlin
val transport = HttpJSONRPCClientTransport(url = "http://localhost:9999/koog")
val agentCardResolver =
    UrlAgentCardResolver(baseUrl = "http://localhost:9999", path = "/koog")
val client = A2AClient(transport = transport, agentCardResolver = agentCardResolver)

val agentId = "koog"
client.connect()
```

### Koog 에이전트 생성 및 A2AAgentClient 기능에 A2A 클라이언트 추가하기 {id="create-koog-agent-and-add-a2a-client-to-a2aagentclient-feature"}
Koog 에이전트에서 A2A 에이전트에 연결하려면 A2A 에이전트 연결을 위한 클라이언트 API를 제공하는 `A2AAgentClient` 기능을 사용할 수 있습니다.
클라이언트의 원칙은 서버와 동일합니다. 기능을 설치하고 `RequestContext` 및 `SessionEventProcessor`와 함께 `A2AAgentClient` 기능을 전달합니다.

```kotlin
val agent = AIAgent(
    promptExecutor = MultiLLMPromptExecutor(
        LLMProvider.Google to GoogleLLMClient("api-key")
    ),
    toolRegistry = ToolRegistry {
        // 여기에 도구 선언
    },
    strategy = strategy<String, Unit>("test") {

        val nodeCheckStreaming by nodeA2AClientGetAgentCard().transform { it.capabilities.streaming }

        val nodeA2ASendMessageStreaming by nodeA2AClientSendMessageStreaming()
        val nodeA2ASendMessage by nodeA2AClientSendMessage()

        val nodeProcessStreaming by node<Flow<Response<Event>>, Unit> {
            it.collect { response ->
                when (response.data) {
                    is Task -> {
                        // 작업 처리
                    }

                    is A2AMessage -> {
                        // 메시지 처리
                    }

                    is TaskStatusUpdateEvent -> {
                        // 작업 상태 업데이트 처리
                    }

                    is TaskArtifactUpdateEvent -> {
                        // 작업 아티팩트 업데이트 처리
                    }
                }
            }
        }

        val nodeProcessEvent by node<CommunicationEvent, Unit> { event ->
            when (event) {
                is Task -> {
                    // 작업 처리
                }

                is A2AMessage -> {
                    // 메시지 처리
                }
            }
        }

        // 스트리밍이 지원되는 경우 메시지를 보내고 응답을 처리한 후 종료
        edge(nodeStart forwardTo nodeCheckStreaming transformed { agentId })
        edge(
            nodeCheckStreaming forwardTo nodeA2ASendMessageStreaming
                onCondition { it == true } transformed { buildA2ARequest(agentId) }
        )
        edge(nodeA2ASendMessageStreaming forwardTo nodeProcessStreaming)
        edge(nodeProcessStreaming forwardTo nodeFinish)

        // 스트리밍이 지원되지 않는 경우 메시지를 보내고 응답을 처리한 후 종료
        edge(
            nodeCheckStreaming forwardTo nodeA2ASendMessage
                onCondition { it == false } transformed { buildA2ARequest(agentId) }
        )
        edge(nodeA2ASendMessage forwardTo nodeProcessEvent)
        edge(nodeProcessEvent forwardTo nodeFinish)

        // 에이전트 카드를 가져오지 못한 경우 종료
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
