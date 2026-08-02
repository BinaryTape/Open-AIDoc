---
status: beta
---

# Amazon Bedrock AgentCore

--8<-- "versioning-snippets.md:beta"

Koog는 Amazon Bedrock AgentCore 서비스에서 에이전트를 실행하기 위한 통합 기능을 제공합니다.

## Amazon Bedrock AgentCore Runtime

`koog-bedrock-agentcore-runtime` 모듈은 [Amazon Bedrock AgentCore Runtime](https://docs.aws.amazon.com/bedrock-agentcore/latest/devguide/runtime.html) HTTP 계약을 통해 Koog 에이전트를 노출하는 Ktor 라우트 설치 프로그램(route installer)을 제공합니다. 이 모듈은 설정된 Ktor 라우트를 기준으로 다음 엔드포인트를 설치합니다:

- `POST /invocations`: 에이전트 요청을 처리합니다.
- `GET /ping`: 에이전트의 상태(health) 및 백그라운드 활동을 보고합니다.

이 모듈은 타이핑된(typed) JSON 핸들러뿐만 아니라 텍스트, 바이너리, 멀티파트(multipart), 스트리밍 페이로드를 지원합니다. 호출 핸들러(Invocation handlers)는 Ktor `RoutingContext`에서 실행되므로, `koog-ktor` 플러그인이 설치된 경우 `aiAgent()`와 같은 Koog 라우팅 확장 기능을 사용할 수 있습니다.

### 의존성 추가

Gradle 빌드에 AgentCore 런타임 모듈을 추가하세요:

```kotlin
dependencies {
    implementation("ai.koog:koog-bedrock-agentcore-runtime:$koogVersion")
}
```

이 모듈은 JVM 17 이상, Kotlin 2.x, Ktor 3.x가 필요합니다.

### 런타임 라우트 설치

다음 예제는 Koog와 Ktor 콘텐츠 협상(content negotiation)을 설치한 후, 타이핑된 JSON 호출 핸들러를 노출하는 방법을 보여줍니다:

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

타이핑된 핸들러는 요청 역직렬화(deserialization)와 응답 직렬화(serialization)를 Ktor의 `ContentNegotiation` 플러그인에 위임합니다. 호스트 애플리케이션은 JSON 요청 및 응답을 위한 `json()`과 같이 허용하는 미디어 유형에 대한 변환기를 설치해야 합니다. 서버 엔진, 포트 및 기타 애플리케이션 플러그인 또한 호스트 애플리케이션의 제어 하에 유지됩니다.

### 다양한 페이로드 유형 처리

JSON이 아닌 페이로드나 멀티모달 응답의 경우, 통합 `handler`를 구성하세요. 이 핸들러는 `InvocationInput`과 `AgentCoreContext`를 수신하고 `InvocationResult`를 반환합니다:

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

통합 핸들러는 다음을 지원합니다:

- `InvocationResult.Text`: `Accept` 헤더 기반의 콘텐츠 협상을 통한 단발성(one-shot) 텍스트 출력.
- `InvocationResult.Binary`: 명시적인 콘텐츠 유형을 가진 원시(raw) 이미지, 오디오, 비디오 또는 문서 바이트.
- `InvocationResult.TextStream`: 즉시 플러시(flush)되는 `text/event-stream` 이벤트로 방출되는 `Flow<String>`.
- `InvocationResult.BinaryStream`: 호출자가 선택한 콘텐츠 유형을 가진 원시 스트리밍 청크.

스트리밍 응답은 직접 작성되며 Ktor의 `SSE` 플러그인이 필요하지 않습니다.

### 요청 처리 구성

`AgentCoreRuntimeConfig`는 다음 옵션을 제공합니다:

| 옵션 | 설명 | 기본값 |
|---|---|---|
| `handler` | 타이핑된 `handle<I, O>` 핸들러가 등록되지 않은 경우 사용되는 통합 핸들러입니다. | 설정되지 않음 |
| `binaryStreamThresholdBytes` | 이 크기를 초과하거나 `Content-Length`가 없는 바이너리 본문은 `InvocationInput.Stream`으로 노출됩니다. | 1 MiB |
| `maxRequestBytes` | 선언된 `Content-Length`가 제한을 초과하는 요청을 HTTP 413으로 거부합니다. | 100 MiB |
| `handlerTimeoutMillis` | 핸들러가 이 타임아웃을 초과하면 HTTP 504를 반환합니다. 0 이하의 값은 타임아웃을 비활성화합니다. | `0` |
| `pingService` | `/ping` 엔드포인트를 위한 커스텀 상태 서비스입니다. | 작업 감지형(Task-aware) 기본 서비스 |
| `taskTracker` | `AgentCoreContext`를 통해 노출되며 기본 상태 서비스에서 사용하는 트래커입니다. | 새 `AgentCoreTaskTracker` |

`Content-Length` 헤더가 없는 요청은 `maxRequestBytes`에 대해 사전 확인되지 않으며, 기본 서버 엔진의 제한이 계속 적용됩니다.

### 상태 및 백그라운드 작업 모니터링

`/ping` 엔드포인트는 다음을 반환합니다:

- `Healthy`: 에이전트에 활성 상태인 백그라운드 작업이 없을 때 HTTP 200과 함께 반환됩니다.
- `HealthyBusy`: `AgentCoreTaskTracker`가 활성 작업을 보고하는 동안 HTTP 200과 함께 반환됩니다.
- `Unhealthy`: 상태 확인에서 문제가 감지되면 HTTP 503과 함께 반환됩니다.

장시간 실행되는 백그라운드 작업을 시작할 때 `AgentCoreContext`에서 사용 가능한 트래커를 사용하세요. 이를 통해 런타임은 에이전트가 여전히 활성 상태임을 알 수 있습니다. `pingService`에 커스텀 `AgentCorePingService`를 할당하여 기본 동작을 대체할 수 있습니다.

속도 제한(Rate limiting) 또한 호스트 애플리케이션에 의해 제어됩니다. Ktor의 `RateLimit` 플러그인을 전역으로 설치하거나 `agentCoreRuntime` 라우트를 명명된 `rateLimit` 블록으로 감싸 원하는 정책을 적용하세요.

## Amazon Bedrock AgentCore Memory

Koog는 두 가지 방식으로 [Amazon Bedrock AgentCore Memory](https://docs.aws.amazon.com/bedrock-agentcore/latest/devguide/memory.html)와 통합됩니다:

- `agents-features-chat-history-aws` 모듈은 대화 기록을 AgentCore 이벤트로 유지(persist)합니다.
- `agents-features-longterm-memory-aws` 모듈은 AgentCore 메모리 전략에 의해 생성된 레코드를 검색하여 에이전트 프롬프트에 추가합니다.

두 통합 모두 JVM 17 이상과 AgentCore 메모리 리소스가 필요합니다. 표준 AWS SDK 자격 증명 및 리전 공급자 체인을 통해 AWS 자격 증명과 리전을 설정하세요.

### 의존성 추가

Gradle 빌드에 하나 또는 두 메모리 통합 모듈을 모두 추가하세요:

```kotlin
dependencies {
    implementation("ai.koog:agents-features-chat-history-aws:$koogVersion")
    implementation("ai.koog:agents-features-longterm-memory-aws:$koogVersion")
}
```

두 모듈 모두 공개 API에서 사용하는 Kotlin용 AWS SDK `BedrockAgentCoreClient`를 노출합니다. 장기 메모리(Long-term memory)는 메모리 전략 탐색을 위한 `BedrockAgentCoreControlClient`도 노출합니다.

### 대화 기록 유지

`AgentcoreChatHistoryProvider`는 AgentCore의 `createEvent` 및 `listEvents` API를 사용하여 Koog의 `ChatHistoryProvider`를 구현합니다. `ChatMemory` 기능을 통해 이를 설치하세요:

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

대화 ID는 `actorId:sessionId` 형태이거나 `actorId`만 사용할 수도 있습니다. 세션 부분이 생략되면 생성자에서 `defaultSession`을 설정하지 않는 한 공급자는 `default-session`을 사용합니다.

공급자는 일반 텍스트 형태의 `Message.User` 및 `Message.Assistant` 메시지를 저장합니다. AgentCore에서 로드된 메시지는 메타데이터에 이벤트 ID를 포함하고 있으므로, 전체 기록을 다시 저장할 때 공급자가 새 메시지만 저장할 수 있습니다. 시스템, 도구, 추론 및 텍스트가 아닌 콘텐츠는 기본적으로 건너뜁니다. 대신 이를 거부하려면 `ignoreUnsupportedValues = false`로 설정하세요. `listEvents` 페이지네이션을 제어하려면 `pageSize`를 사용하고, 로드되는 이벤트 수를 제한하려면 `totalEventsLimit`를 사용하세요.

### 장기 메모리 검색

`LongTermMemory`는 각 LLM 요청 전에 하나 이상의 AgentCore 메모리 전략을 쿼리할 수 있습니다. `agentcore` DSL은 복합 검색(composite retrieval)을 생성하므로, 단일 블록에서 여러 전략 유형과 네임스페이스 범위를 결합할 수 있습니다:

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

DSL은 다음 헬퍼(helper)들을 제공합니다:

| 헬퍼 | AgentCore 전략 | 네임스페이스 범위 | 검색 방식 |
|---|---|---|---|
| `semantic` | 시맨틱 메모리 (Semantic memory) | Actor | 유사도 검색 |
| `userPreferences` | 사용자 기본 설정 (User preferences) | Actor | 레코드 나열 |
| `summary` | 요약 (Summarization) | Actor 및 session | 유사도 검색 |
| `episodes` | 에피소드형 에피소드 (Episodic episodes) | Actor 및 session | 유사도 검색 |
| `reflections` | 에피소드형 성찰 (Episodic reflections) | Actor | 유사도 검색 |
| `episodic` | 에피소드 및 성찰 (Episodes and reflections) | 두 범위 모두 | 복합 유사도 검색 |

기본적으로 네임스페이스는 AWS 문서에 정의된 레이아웃을 따릅니다:
Actor 범위 메모리의 경우 `/strategies/{strategyId}/actors/{actorId}/`, 세션 범위 메모리의 경우 `/strategies/{strategyId}/actors/{actorId}/sessions/{sessionId}/`입니다. 메모리 리소스가 커스텀 네임스페이스 템플릿을 사용하는 경우, `agentcore` 블록에서 `AgentcoreNamespaceResolver`를 할당하세요.

기본 `AgentcorePromptAugmenter`는 시맨틱, 기본 설정, 에피소드 및 성찰 레코드를 시스템 메시지에 배치합니다. 요약 레코드는 최신 사용자 메시지에 추가됩니다. 다른 Koog `PromptAugmenter`를 사용하려면 블록에서 `augmenter`를 설정하세요.

### 구성된 메모리 전략 탐색

전략 ID나 네임스페이스 템플릿을 하드코딩하지 않아야 하는 경우, AWS `BedrockAgentCoreControlClient`와 함께 `AgentcoreStrategyDiscovery`를 사용한 다음 그 결과를 `agentcoreDiscovered`에 전달하세요. 탐색 DSL은 메모리 리소스에 대해 반환된 모든 지원 전략을 구성하며, 검색 제한, 점수, 필터 및 네임스페이스 패턴을 재정의하거나 개별 전략을 제외할 수 있게 해줍니다. 탐색된 세트에 요약 또는 에피소드형 전략이 포함된 경우 `sessionId`가 필요합니다.

AgentCore는 저장된 이벤트로부터 비동기적으로 장기 레코드를 생성합니다. 따라서 `ChatMemory`에 의해 작성된 이벤트가 `LongTermMemory`에서 즉시 사용 가능하지 않을 수 있습니다.