---
status: beta
---

# A2A 서버

--8<-- "versioning-snippets.md:beta"

A2A 서버를 사용하면 표준화된 A2A(Agent-to-Agent) 프로토콜을 통해 AI 에이전트를 노출할 수 있습니다. 이 서버는 [A2A 프로토콜 명세](https://a2a-protocol.org/latest/specification/)의 완전한 구현을 제공하며, 클라이언트 요청 처리, 에이전트 로직 실행, 복잡한 태스크 생명주기 관리 및 실시간 스트리밍 응답 지원 등을 담당합니다.

## 의존성 (Dependencies) {id="dependencies"}

프로젝트에서 A2A 서버를 사용하려면 `build.gradle.kts` 파일에 다음 의존성을 추가하세요.

```kotlin
dependencies {
    // 코어 A2A 서버 라이브러리
    implementation("ai.koog:a2a-server:$koogVersion")

    // HTTP JSON-RPC 전송 (가장 일반적임)
    implementation("ai.koog:a2a-transport-server-jsonrpc-http:$koogVersion")

    // Ktor 서버 엔진 (필요에 맞는 엔진 선택)
    implementation("io.ktor:ktor-server-netty:$ktorVersion")
}
```

## 개요 (Overview) {id="overview"}

A2A 서버는 A2A 프로토콜 전송 레이어(transport layer)와 사용자 정의 에이전트 로직 사이의 가교 역할을 합니다. 
프로토콜 준수 상태를 유지하고 강력한 세션 관리를 제공하면서 전체 요청 생명주기를 조율합니다.

## 핵심 컴포넌트 (Core components) {id="core-components"}

### A2AServer {id="a2aserver"}

완전한 A2A 프로토콜을 구현하는 메인 서버 클래스입니다. 다음과 같은 중앙 조정자 역할을 수행합니다.

- 프로토콜 명세에 따른 유입 요청 **검증**
- 동시 세션 및 태스크 생명주기 **관리**
- 전송, 스토리지 및 비즈니스 로직 레이어 간의 통신 **조율**
- 메시지 전송, 태스크 조회, 취소, 푸시 알림 등 모든 프로토콜 작업 **처리**

`A2AServer`는 두 개의 필수 파라미터를 받습니다.

* `AgentExecutor`: 에이전트의 비즈니스 로직 구현을 정의합니다.
* `AgentCard`: 에이전트의 기능과 메타데이터를 정의합니다.

또한 스토리지 및 전송 동작을 커스터마이징하는 데 사용할 수 있는 여러 선택적 파라미터가 있습니다.

### AgentExecutor {id="agentexecutor"}

`AgentExecutor` 인터페이스는 에이전트의 핵심 비즈니스 로직을 구현하는 곳입니다. 
A2A 프로토콜과 특정 AI 에이전트 기능 간의 브리지 역할을 합니다.
에이전트 실행을 시작하려면 에이전트 로직을 정의하는 `execute` 메서드를 구현해야 합니다.
에이전트를 취소하려면 `cancel` 메서드를 구현해야 합니다.

```kotlin
class MyAgentExecutor : AgentExecutor {
    override suspend fun execute(
        context: RequestContext<MessageSendParams>,
        eventProcessor: SessionEventProcessor
    ) {
        // 에이전트 로직을 여기에 구현하세요.
    }

    override suspend fun cancel(
        context: RequestContext<TaskIdParams>,
        eventProcessor: SessionEventProcessor,
        agentJob: Deferred<Unit>?
    ) {
        // 에이전트 취소 로직을 여기에 구현하세요 (선택 사항).
    }
}
```

`RequestContext`는 현재 세션의 `contextId` 및 `taskId`, 전송된 `message`, 요청의 `params`를 포함하여 현재 요청에 대한 풍부한 정보를 제공합니다.

`SessionEventProcessor`는 클라이언트와 통신합니다.

- **`sendMessage(message)`**: 즉각적인 응답 전송 (채팅 스타일 상호작용)
- **`sendTaskEvent(event)`**: 태스크 관련 업데이트 전송 (장기 실행 작업)

```kotlin
// 즉각적인 응답의 경우 (챗봇 등)
eventProcessor.sendMessage(
    Message(
        messageId = generateId(),
        role = Role.Agent,
        parts = listOf(TextPart("여기에 답변이 있습니다!")),
        contextId = context.contextId
    )
)

// 태스크 기반 작업의 경우
eventProcessor.sendTaskEvent(
    TaskStatusUpdateEvent(
        contextId = context.contextId,
        taskId = context.taskId,
        status = TaskStatus(
            state = TaskState.Working,
            message = Message(/* 진행 상황 업데이트 */),
            timestamp = Clock.System.now()
        ),
        final = false  // 추가 업데이트가 더 있을 예정
    )
)
```

### AgentCard {id="agentcard"}

`AgentCard`는 에이전트의 자기 기술(self-describing) 매니페스트 역할을 합니다. 클라이언트에게 에이전트가 무엇을 할 수 있는지, 어떻게 통신하는지, 보안 요구 사항은 무엇인지 알려줍니다.

```kotlin
val agentCard = AgentCard(
    // 기본 식별 정보
    name = "Advanced Recipe Assistant",
    description = "요리 조언, 레시피 생성 및 식단 계획에 특화된 AI 에이전트",
    version = "2.1.0",
    protocolVersion = "0.3.0",

    // 통신 설정
    url = "https://api.example.com/a2a",
    preferredTransport = TransportProtocol.JSONRPC,

    // 선택 사항: 다중 전송 지원
    additionalInterfaces = listOf(
        AgentInterface("https://api.example.com/a2a", TransportProtocol.JSONRPC),
    ),

    // 기능 선언
    capabilities = AgentCapabilities(
        streaming = true,              // 실시간 응답 지원
        pushNotifications = true,      // 비동기 알림 전송
        stateTransitionHistory = true  // 태스크 이력 유지
    ),

    // 콘텐츠 타입 지원
    defaultInputModes = listOf("text/plain", "text/markdown", "image/jpeg"),
    defaultOutputModes = listOf("text/plain", "text/markdown", "application/json"),

    // 사용 가능한 보안 스키마 정의
    securitySchemes = mapOf(
        "bearer" to HTTPAuthSecurityScheme(
            scheme = "Bearer",
            bearerFormat = "JWT",
            description = "JWT 토큰 인증"
        ),
        "api-key" to APIKeySecurityScheme(
            `in` = In.Header,
            name = "X-API-Key",
            description = "서비스 인증을 위한 API 키"
        )
    ),

    // 보안 요구 사항 지정 (요구 사항의 논리적 OR)
    security = listOf(
        mapOf("bearer" to listOf("read", "write")),  // 옵션 1: read/write 스코프를 가진 JWT
        mapOf("api-key" to emptyList())              // 옵션 2: API 키
    ),

    // 인증된 사용자를 위한 확장 카드 지원 여부
    supportsAuthenticatedExtendedCard = true,
    
    // 스킬/기능
    skills = listOf(
        AgentSkill(
            id = "recipe-generation",
            name = "Recipe Generation",
            description = "재료, 식단 제한 및 선호도에 따른 맞춤형 레시피 생성",
            tags = listOf("cooking", "recipes", "nutrition"),
            examples = listOf(
                "버섯을 곁들인 비건 파스타 레시피를 만들어 줘",
                "닭고기, 쌀, 채소가 있어. 무엇을 만들 수 있을까?"
            )
        ),
        AgentSkill(
            id = "meal-planning",
            name = "Meal Planning",
            description = "주간 식단 계획 및 쇼핑 리스트 생성",
            tags = listOf("meal-planning", "nutrition", "shopping")
        )
    ),

    // 선택 사항: 브랜딩
    iconUrl = "https://example.com/agent-icon.png",
    documentationUrl = "https://docs.example.com/recipe-agent",
    provider = AgentProvider(
        organization = "CookingAI Inc.",
        url = "https://cookingai.com"
    )
)
```

### 전송 레이어 (Transport Layer) {id="transport-layer"}

A2A 자체는 클라이언트와의 통신을 위해 여러 전송 프로토콜을 지원합니다. 
현재 Koog는 HTTP를 통한 JSON-RPC 서버 전송 구현을 제공합니다.

#### HTTP JSON-RPC 전송 {id="http-json-rpc-transport"}

```kotlin
val transport = HttpJSONRPCServerTransport(server)
transport.start(
    engineFactory = CIO,           // Ktor 엔진 (CIO, Netty, Jetty)
    port = 8080,                   // 서버 포트
    path = "/a2a",                 // API 엔드포인트 경로
    wait = true                    // 서버가 정지할 때까지 블록
)
```

### 스토리지 (Storage) {id="storage"}

A2A 서버는 서로 다른 유형의 데이터를 분리하는 플러그형 스토리지 아키텍처를 사용합니다.
모든 스토리지 구현은 선택 사항이며 개발을 위해 기본적으로 인메모리(in-memory) 변형으로 설정됩니다.

- **TaskStorage**: 태스크 생명주기 관리 - 태스크 상태, 이력 및 아티팩트(artifacts)를 저장하고 관리합니다.
- **MessageStorage**: 대화 이력 - 대화 컨텍스트 내에서 메시지 이력을 관리합니다.
- **PushNotificationConfigStorage**: 웹훅(Webhook) 관리 - 비동기 알림을 위한 웹훅 구성을 관리합니다.

## 빠른 시작 (Quickstart) {id="quickstart"}

### 1. AgentCard 생성 {id="1-create-agentcard"}
에이전트의 기능과 메타데이터를 정의합니다.
```kotlin
val agentCard = AgentCard(
    name = "IO Assistant",
    description = "입력 수정에 특화된 AI 에이전트",
    version = "2.1.0",
    protocolVersion = "0.3.0",

    // 통신 설정
    url = "https://api.example.com/a2a",
    preferredTransport = TransportProtocol.JSONRPC,

    // 기능 선언
    capabilities =
        AgentCapabilities(
            streaming = true,              // 실시간 응답 지원
            pushNotifications = true,      // 비동기 알림 전송
            stateTransitionHistory = true  // 태스크 이력 유지
        ),

    // 콘텐츠 타입 지원
    defaultInputModes = listOf("text/plain", "text/markdown", "image/jpeg"),
    defaultOutputModes = listOf("text/plain", "text/markdown", "application/json"),

    // 스킬/기능
    skills = listOf(
        AgentSkill(
            id = "echo",
            name = "echo",
            description = "사용자 메시지를 그대로 반환합니다",
            tags = listOf("io"),
        )
    )
)
```

### 2. AgentExecutor 생성 {id="2-create-an-agentexecutor"}
Executor는 에이전트 로직을 구현하고 유입되는 요청을 처리하며 응답을 전송합니다.

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

        // 사용자의 메시지를 그대로 에코(echo)하여 반환합니다.
        val response = Message(
            messageId = UUID.randomUUID().toString(),
            role = Role.Agent,
            parts = listOf(TextPart("You said: $userText")),
            contextId = context.contextId,
            taskId = context.taskId
        )

        eventProcessor.sendMessage(response)
    }
}
```

### 3. 서버 생성 {id="2-create-the-server"}
에이전트 실행기(executor)와 에이전트 카드를 서버에 전달합니다.

```kotlin
val server = A2AServer(
    agentExecutor = EchoAgentExecutor(),
    agentCard = agentCard
)
```

### 4. 전송 레이어 추가 {id="3-add-transport-layer"}
전송 레이어를 생성하고 서버를 시작합니다.
```kotlin
// HTTP JSON-RPC 전송
val transport = HttpJSONRPCServerTransport(server)
transport.start(
    engineFactory = CIO,
    port = 8080,
    path = "/agent",
    wait = true
)
```

## 에이전트 구현 패턴 {id="agent-implementation-patterns"}

### 단순 응답 에이전트 (Simple Response Agent) {id="simple-response-agent"}
에이전트가 단일 메시지에만 응답하면 되는 경우 단순 에이전트로 구현할 수 있습니다. 
에이전트 실행 로직이 복잡하지 않고 시간이 많이 소요되지 않는 경우에도 사용할 수 있습니다.

```kotlin
class SimpleAgentExecutor : AgentExecutor {
    override suspend fun execute(
        context: RequestContext<MessageSendParams>,
        eventProcessor: SessionEventProcessor
    ) {
        val response = Message(
            messageId = UUID.randomUUID().toString(),
            role = Role.Agent,
            parts = listOf(TextPart("Hello from agent!")),
            contextId = context.contextId,
            taskId = context.taskId
        )

        eventProcessor.sendMessage(response)
    }
}
```

### 태스크 기반 에이전트 (Task-Based Agent) {id="task-based-agent"}
에이전트의 실행 로직이 복잡하고 여러 단계가 필요한 경우 태스크 기반 에이전트로 구현할 수 있습니다. 
에이전트 실행 로직이 시간이 많이 걸리고 일시 중단(suspending)이 필요한 경우에도 사용할 수 있습니다.
```kotlin
class TaskAgentExecutor : AgentExecutor {
    override suspend fun execute(
        context: RequestContext<MessageSendParams>,
        eventProcessor: SessionEventProcessor
    ) {
        // 작업 중 상태 전송
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

        // 작업 수행...

        // 완료 전송
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
