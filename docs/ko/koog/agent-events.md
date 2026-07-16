# 에이전트 이벤트

에이전트 이벤트는 에이전트 워크플로의 일부로 발생하는 동작이나 상호작용입니다. 여기에는 다음이 포함됩니다:

- 에이전트 라이프사이클 이벤트
- 전략(Strategy) 이벤트
- 노드 실행 이벤트
- LLM 호출 이벤트
- LLM 스트리밍 이벤트
- 도구 실행 이벤트

참고: 기능(Feature) 이벤트는 `agents-core` 모듈에 정의되어 있으며 `ai.koog.agents.core.feature.model.events` 패키지 아래에 위치합니다. `agents-features-trace` 및 `agents-features-event-handler`와 같은 기능은 이러한 이벤트를 소비하여 에이전트 실행 중에 생성된 메시지를 처리하고 전달합니다.

## 사전 정의된 이벤트 유형

Koog는 커스텀 메시지 프로세서에서 사용할 수 있는 사전 정의된 이벤트 유형을 제공합니다. 사전 정의된 이벤트는 관련 엔티티에 따라 여러 카테고리로 분류할 수 있습니다:

- [에이전트 이벤트](#agent-events)
- [전략 이벤트](#strategy-events)
- [노드 이벤트](#node-events)
- [서브그래프 이벤트](#subgraph-events)
- [LLM 호출 이벤트](#llm-call-events)
- [LLM 스트리밍 이벤트](#llm-streaming-events)
- [도구 실행 이벤트](#tool-execution-events)

### 에이전트 이벤트

#### AgentStartingEvent

에이전트 실행의 시작을 나타냅니다. 다음 필드를 포함합니다:

| 이름 | 데이터 타입 | 필수 여부 | 기본값 | 설명 |
|-----------------|---------------------|----------|---------|----------------------------------------------------------------------------|
| `eventId`       | String              | 예      |         | 이벤트 또는 이벤트 그룹에 대한 고유 식별자입니다. |
| `executionInfo` | AgentExecutionInfo  | 예      |         | 이 이벤트와 연관된 실행에 대한 컨텍스트 정보를 제공합니다. |
| `agentId`       | String              | 예      |         | AI 에이전트의 고유 식별자입니다. |
| `runId`         | String              | 예      |         | AI 에이전트 실행(run)의 고유 식별자입니다. |

#### AgentCompletedEvent

에이전트 실행의 종료를 나타냅니다. 다음 필드를 포함합니다:

| 이름 | 데이터 타입 | 필수 여부 | 기본값 | 설명 |
|-----------------|---------------------|----------|---------|---------------------------------------------------------------------------------|
| `eventId`       | String              | 예      |         | 이벤트 또는 이벤트 그룹에 대한 고유 식별자입니다. |
| `executionInfo` | AgentExecutionInfo  | 예      |         | 이 이벤트와 연관된 실행에 대한 컨텍스트 정보를 제공합니다. |
| `agentId`       | String              | 예      |         | AI 에이전트의 고유 식별자입니다. |
| `runId`         | String              | 예      |         | AI 에이전트 실행(run)의 고유 식별자입니다. |
| `result`        | String              | 예      |         | 에이전트 실행 결과입니다. 결과가 없는 경우 `null`일 수 있습니다. |

#### AgentExecutionFailedEvent

에이전트 실행 중 오류 발생을 나타냅니다. 다음 필드를 포함합니다:

| 이름 | 데이터 타입 | 필수 여부 | 기본값 | 설명 |
|-----------------|---------------------|----------|---------|-----------------------------------------------------------------------------------------------------------------|
| `eventId`       | String              | 예      |         | 이벤트 또는 이벤트 그룹에 대한 고유 식별자입니다. |
| `executionInfo` | AgentExecutionInfo  | 예      |         | 이 이벤트와 연관된 실행에 대한 컨텍스트 정보를 제공합니다. |
| `agentId`       | String              | 예      |         | AI 에이전트의 고유 식별자입니다. |
| `runId`         | String              | 예      |         | AI 에이전트 실행(run)의 고유 식별자입니다. |
| `error`         | AIAgentError        | 예      |         | 에이전트 실행 중 발생한 구체적인 오류입니다. 자세한 내용은 [AIAgentError](#aiagenterror)를 참조하세요. |

#### AgentClosingEvent

에이전트의 종료 또는 해제를 나타냅니다. 다음 필드를 포함합니다:

| 이름 | 데이터 타입 | 필수 여부 | 기본값 | 설명 |
|-----------------|---------------------|----------|---------|----------------------------------------------------------------------------|
| `eventId`       | String              | 예      |         | 이벤트 또는 이벤트 그룹에 대한 고유 식별자입니다. |
| `executionInfo` | AgentExecutionInfo  | 예      |         | 이 이벤트와 연관된 실행에 대한 컨텍스트 정보를 제공합니다. |
| `agentId`       | String              | 예      |         | AI 에이전트의 고유 식별자입니다. |

<a id="aiagenterror"></a>
`AIAgentError` 클래스는 에이전트 실행 중 발생한 오류에 대한 자세한 정보를 제공합니다. 다음 필드를 포함합니다:

| 이름 | 데이터 타입 | 필수 여부 | 기본값 | 설명 |
|--------------|-----------|----------|---------|------------------------------------------------------------------|
| `message`    | String    | 예      |         | 특정 오류에 대한 자세한 정보를 제공하는 메시지입니다. |
| `stackTrace` | String    | 예      |         | 마지막으로 실행된 코드까지의 스택 기록 모음입니다. |
| `cause`      | String    | 아니요   | null    | 가능한 경우 오류의 원인입니다. |

<a id="agentexecutioninfo"></a>
`AgentExecutionInfo` 클래스는 실행 경로에 대한 컨텍스트 정보를 제공하여 에이전트 실행 내에서 중첩된 실행 컨텍스트를 추적할 수 있도록 합니다. 다음 필드를 포함합니다:

| 이름 | 데이터 타입 | 필수 여부 | 기본값 | 설명 |
|------------|---------------------|----------|---------|------------------------------------------------------------------------------------------------|
| `parent`   | AgentExecutionInfo  | 아니요   | null    | 부모 실행 컨텍스트에 대한 참조입니다. null인 경우 루트 실행 레벨을 나타냅니다. |
| `partName` | String              | 예      |         | 실행의 현재 파트 또는 세그먼트 이름을 나타내는 문자열입니다. |

### 전략 이벤트

#### GraphStrategyStartingEvent

그래프 기반 전략 실행의 시작을 나타냅니다. 다음 필드를 포함합니다:

| 이름 | 데이터 타입 | 필수 여부 | 기본값 | 설명 |
|-----------------|------------------------|----------|---------|----------------------------------------------------------------------------|
| `eventId`       | String                 | 예      |         | 이벤트 또는 이벤트 그룹에 대한 고유 식별자입니다. |
| `executionInfo` | AgentExecutionInfo     | 예      |         | 이 이벤트와 연관된 실행에 대한 컨텍스트 정보를 제공합니다. |
| `runId`         | String                 | 예      |         | 전략 실행의 고유 식별자입니다. |
| `strategyName`  | String                 | 예      |         | 전략의 이름입니다. |
| `graph`         | StrategyEventGraph     | 예      |         | 전략 워크플로를 나타내는 그래프 구조입니다. |

#### FunctionalStrategyStartingEvent

함수형 전략 실행의 시작을 나타냅니다. 다음 필드를 포함합니다:

| 이름 | 데이터 타입 | 필수 여부 | 기본값 | 설명 |
|-----------------|---------------------|----------|---------|----------------------------------------------------------------------------|
| `eventId`       | String              | 예      |         | 이벤트 또는 이벤트 그룹에 대한 고유 식별자입니다. |
| `executionInfo` | AgentExecutionInfo  | 예      |         | 이 이벤트와 연관된 실행에 대한 컨텍스트 정보를 제공합니다. |
| `runId`         | String              | 예      |         | 전략 실행의 고유 식별자입니다. |
| `strategyName`  | String              | 예      |         | 전략의 이름입니다. |

#### StrategyCompletedEvent

전략 실행의 종료를 나타냅니다. 다음 필드를 포함합니다:

| 이름 | 데이터 타입 | 필수 여부 | 기본값 | 설명 |
|-----------------|---------------------|----------|---------|----------------------------------------------------------------------------|
| `eventId`       | String              | 예      |         | 이벤트 또는 이벤트 그룹에 대한 고유 식별자입니다. |
| `executionInfo` | AgentExecutionInfo  | 예      |         | 이 이벤트와 연관된 실행에 대한 컨텍스트 정보를 제공합니다. |
| `runId`         | String              | 예      |         | 전략 실행의 고유 식별자입니다. |
| `strategyName`  | String              | 예      |         | 전략의 이름입니다. |
| `result`        | String              | 예      |         | 실행 결과입니다. 결과가 없는 경우 `null`일 수 있습니다. |

### 노드 이벤트

#### NodeExecutionStartingEvent

노드 실행의 시작을 나타냅니다. 다음 필드를 포함합니다:

| 이름 | 데이터 타입 | 필수 여부 | 기본값 | 설명 |
|-----------------|---------------------|----------|---------|----------------------------------------------------------------------------|
| `eventId`       | String              | 예      |         | 이벤트 또는 이벤트 그룹에 대한 고유 식별자입니다. |
| `executionInfo` | AgentExecutionInfo  | 예      |         | 이 이벤트와 연관된 실행에 대한 컨텍스트 정보를 제공합니다. |
| `runId`         | String              | 예      |         | 전략 실행의 고유 식별자입니다. |
| `nodeName`      | String              | 예      |         | 실행이 시작된 노드의 이름입니다. |
| `input`         | JsonElement         | 아니요   | null    | 노드에 대한 입력값입니다. |

#### NodeExecutionCompletedEvent

노드 실행의 종료를 나타냅니다. 다음 필드를 포함합니다:

| 이름 | 데이터 타입 | 필수 여부 | 기본값 | 설명 |
|-----------------|---------------------|----------|---------|----------------------------------------------------------------------------|
| `eventId`       | String              | 예      |         | 이벤트 또는 이벤트 그룹에 대한 고유 식별자입니다. |
| `executionInfo` | AgentExecutionInfo  | 예      |         | 이 이벤트와 연관된 실행에 대한 컨텍스트 정보를 제공합니다. |
| `runId`         | String              | 예      |         | 전략 실행의 고유 식별자입니다. |
| `nodeName`      | String              | 예      |         | 실행이 종료된 노드의 이름입니다. |
| `input`         | JsonElement         | 아니요   | null    | 노드에 대한 입력값입니다. |
| `output`        | JsonElement         | 아니요   | null    | 노드에서 생성된 출력값입니다. |

#### NodeExecutionFailedEvent

노드 실행 중 발생한 오류를 나타냅니다. 다음 필드를 포함합니다:

| 이름 | 데이터 타입 | 필수 여부 | 기본값 | 설명 |
|-----------------|---------------------|----------|---------|-----------------------------------------------------------------------------------------------------------------|
| `eventId`       | String              | 예      |         | 이벤트 또는 이벤트 그룹에 대한 고유 식별자입니다. |
| `executionInfo` | AgentExecutionInfo  | 예      |         | 이 이벤트와 연관된 실행에 대한 컨텍스트 정보를 제공합니다. |
| `runId`         | String              | 예      |         | 전략 실행의 고유 식별자입니다. |
| `nodeName`      | String              | 예      |         | 오류가 발생한 노드의 이름입니다. |
| `input`         | JsonElement         | 아니요   | null    | 노드에 제공된 입력 데이터입니다. |
| `error`         | AIAgentError        | 예      |         | 노드 실행 중 발생한 구체적인 오류입니다. 자세한 내용은 [AIAgentError](#aiagenterror)를 참조하세요. |

### 서브그래프 이벤트

#### SubgraphExecutionStartingEvent

서브그래프 실행의 시작을 나타냅니다. 다음 필드를 포함합니다:

| 이름 | 데이터 타입 | 필수 여부 | 기본값 | 설명 |
|-----------------|---------------------|----------|---------|----------------------------------------------------------------------------|
| `eventId`       | String              | 예      |         | 이벤트 또는 이벤트 그룹에 대한 고유 식별자입니다. |
| `executionInfo` | AgentExecutionInfo  | 예      |         | 이 이벤트와 연관된 실행에 대한 컨텍스트 정보를 제공합니다. |
| `runId`         | String              | 예      |         | 전략 실행의 고유 식별자입니다. |
| `subgraphName`  | String              | 예      |         | 실행이 시작된 서브그래프의 이름입니다. |
| `input`         | JsonElement         | 아니요   | null    | 서브그래프에 대한 입력값입니다. |

#### SubgraphExecutionCompletedEvent

서브그래프 실행의 종료를 나타냅니다. 다음 필드를 포함합니다:

| 이름 | 데이터 타입 | 필수 여부 | 기본값 | 설명 |
|-----------------|---------------------|----------|---------|----------------------------------------------------------------------------|
| `eventId`       | String              | 예      |         | 이벤트 또는 이벤트 그룹에 대한 고유 식별자입니다. |
| `executionInfo` | AgentExecutionInfo  | 예      |         | 이 이벤트와 연관된 실행에 대한 컨텍스트 정보를 제공합니다. |
| `runId`         | String              | 예      |         | 전략 실행의 고유 식별자입니다. |
| `subgraphName`  | String              | 예      |         | 실행이 종료된 서브그래프의 이름입니다. |
| `input`         | JsonElement         | 아니요   | null    | 서브그래프에 대한 입력값입니다. |
| `output`        | JsonElement         | 아니요   | null    | 서브그래프에서 생성된 출력값입니다. |

#### SubgraphExecutionFailedEvent

서브그래프 실행 중 발생한 오류를 나타냅니다. 다음 필드를 포함합니다:

| 이름 | 데이터 타입 | 필수 여부 | 기본값 | 설명 |
|-----------------|---------------------|----------|---------|-----------------------------------------------------------------------------------------------------------------|
| `eventId`       | String              | 예      |         | 이벤트 또는 이벤트 그룹에 대한 고유 식별자입니다. |
| `executionInfo` | AgentExecutionInfo  | 예      |         | 이 이벤트와 연관된 실행에 대한 컨텍스트 정보를 제공합니다. |
| `runId`         | String              | 예      |         | 전략 실행의 고유 식별자입니다. |
| `subgraphName`  | String              | 예      |         | 오류가 발생한 서브그래프의 이름입니다. |
| `input`         | JsonElement         | 아니요   | null    | 서브그래프에 제공된 입력 데이터입니다. |
| `error`         | AIAgentError        | 예      |         | 서브그래프 실행 중 발생한 구체적인 오류입니다. 자세한 내용은 [AIAgentError](#aiagenterror)를 참조하세요. |

### LLM 호출 이벤트

#### LLMCallStartingEvent

LLM 호출의 시작을 나타냅니다. 다음 필드를 포함합니다:

| 이름 | 데이터 타입 | 필수 여부 | 기본값 | 설명 |
|-----------------|---------------------|----------|---------|------------------------------------------------------------------------------------|
| `eventId`       | String              | 예      |         | 이벤트 또는 이벤트 그룹에 대한 고유 식별자입니다. |
| `executionInfo` | AgentExecutionInfo  | 예      |         | 이 이벤트와 연관된 실행에 대한 컨텍스트 정보를 제공합니다. |
| `runId`         | String              | 예      |         | LLM 실행의 고유 식별자입니다. |
| `prompt`        | Prompt              | 예      |         | 모델에 전송되는 프롬프트입니다. 자세한 내용은 [Prompt](#prompt)를 참조하세요. |
| `model`         | ModelInfo           | 예      |         | 모델 정보입니다. [ModelInfo](#modelinfo)를 참조하세요. |
| `tools`         | `List<String>`        | 예      |         | 모델이 호출할 수 있는 도구 목록입니다. |

<a id="prompt"></a>
`Prompt` 클래스는 프롬프트를 위한 데이터 구조로, 메시지 목록, 고유 식별자 및 언어 모델 설정을 위한 선택적 매개변수로 구성됩니다. 다음 필드를 포함합니다:

| 이름 | 데이터 타입 | 필수 여부 | 기본값 | 설명 |
|------------|---------------------|----------|-------------|--------------------------------------------------------------|
| `messages` | `List<Message>`       | 예      |             | 프롬프트를 구성하는 메시지 목록입니다. |
| `id`       | String              | 예      |             | 프롬프트의 고유 식별자입니다. |
| `params`   | LLMParams           | 아니요   | LLMParams() | LLM이 콘텐츠를 생성하는 방식을 제어하는 설정입니다. |

<a id="modelinfo"></a>
`ModelInfo` 클래스는 공급자(provider), 모델 식별자 및 특성을 포함한 언어 모델에 대한 정보를 나타냅니다. 다음 필드를 포함합니다:

| 이름 | 데이터 타입 | 필수 여부 | 기본값 | 설명 |
|-------------------|-----------|----------|---------|--------------------------------------------------------------------------|
| `provider`        | String    | 예      |         | 공급자 식별자 (예: "openai", "google", "anthropic"). |
| `model`           | String    | 예      |         | 모델 식별자 (예: "gpt-4", "claude-3"). |
| `displayName`     | String    | 아니요   | null    | 모델의 사람이 읽을 수 있는 선택적 표시 이름입니다. |
| `contextLength`   | Long      | 아니요   | null    | 모델이 처리할 수 있는 최대 토큰 수입니다. |
| `maxOutputTokens` | Long      | 아니요   | null    | 모델이 생성할 수 있는 최대 토큰 수입니다. |

#### LLMCallCompletedEvent

LLM 호출의 종료를 나타냅니다. 다음 필드를 포함합니다:

| 이름 | 데이터 타입 | 필수 여부 | 기본값 | 설명 |
|----------------------|------------------------|----------|---------|---------------------------------------------------------------------------------|
| `eventId`            | String                 | 예      |         | 이벤트 또는 이벤트 그룹에 대한 고유 식별자입니다. |
| `executionInfo`      | AgentExecutionInfo     | 예      |         | 이 이벤트와 연관된 실행에 대한 컨텍스트 정보를 제공합니다. |
| `runId`              | String                 | 예      |         | LLM 실행의 고유 식별자입니다. |
| `prompt`             | Prompt                 | 예      |         | 호출에 사용된 프롬프트입니다. |
| `model`              | ModelInfo              | 예      |         | 모델 정보입니다. [ModelInfo](#modelinfo)를 참조하세요. |
| `responses`          | `List<Message.Response>` | 예      |         | 모델에서 반환된 하나 이상의 응답입니다. |
| `moderationResponse` | ModerationResult       | 아니요   | null    | 모더레이션(moderation) 응답이 있는 경우의 응답입니다. |

### LLM 스트리밍 이벤트

#### LLMStreamingStartingEvent

LLM 스트리밍 호출의 시작을 나타냅니다. 다음 필드를 포함합니다:

| 이름 | 데이터 타입 | 필수 여부 | 기본값 | 설명 |
|-----------------|---------------------|----------|---------|---------------------------------------------------------------------------------|
| `eventId`       | String              | 예      |         | 이벤트 또는 이벤트 그룹에 대한 고유 식별자입니다. |
| `executionInfo` | AgentExecutionInfo  | 예      |         | 이 이벤트와 연관된 실행에 대한 컨텍스트 정보를 제공합니다. |
| `runId`         | String              | 예      |         | LLM 실행의 고유 식별자입니다. |
| `prompt`        | Prompt              | 예      |         | 모델에 전송되는 프롬프트입니다. |
| `model`         | ModelInfo           | 예      |         | 모델 정보입니다. [ModelInfo](#modelinfo)를 참조하세요. |
| `tools`         | `List<String>`        | 예      |         | 모델이 호출할 수 있는 도구 목록입니다. |

#### LLMStreamingFrameReceivedEvent

LLM으로부터 수신된 스트리밍 프레임을 나타냅니다. 다음 필드를 포함합니다:

| 이름 | 데이터 타입 | 필수 여부 | 기본값 | 설명 |
|-----------------|---------------------|----------|---------|---------------------------------------------------------------------------------|
| `eventId`       | String              | 예      |         | 이벤트 또는 이벤트 그룹에 대한 고유 식별자입니다. |
| `executionInfo` | AgentExecutionInfo  | 예      |         | 이 이벤트와 연관된 실행에 대한 컨텍스트 정보를 제공합니다. |
| `runId`         | String              | 예      |         | LLM 실행의 고유 식별자입니다. |
| `prompt`        | Prompt              | 예      |         | 모델에 전송되는 프롬프트입니다. |
| `model`         | ModelInfo           | 예      |         | 모델 정보입니다. [ModelInfo](#modelinfo)를 참조하세요. |
| `frame`         | StreamFrame         | 예      |         | 스트림에서 수신된 프레임입니다. |

#### LLMStreamingFailedEvent

LLM 스트리밍 호출 중 오류 발생을 나타냅니다. 다음 필드를 포함합니다:

| 이름 | 데이터 타입 | 필수 여부 | 기본값 | 설명 |
|-----------------|---------------------|----------|---------|-------------------------------------------------------------------------------------------------------------|
| `eventId`       | String              | 예      |         | 이벤트 또는 이벤트 그룹에 대한 고유 식별자입니다. |
| `executionInfo` | AgentExecutionInfo  | 예      |         | 이 이벤트와 연관된 실행에 대한 컨텍스트 정보를 제공합니다. |
| `runId`         | String              | 예      |         | LLM 실행의 고유 식별자입니다. |
| `prompt`        | Prompt              | 예      |         | 모델에 전송되는 프롬프트입니다. |
| `model`         | ModelInfo           | 예      |         | 모델 정보입니다. [ModelInfo](#modelinfo)를 참조하세요. |
| `error`         | AIAgentError        | 예      |         | 스트리밍 중 발생한 구체적인 오류입니다. 자세한 내용은 [AIAgentError](#aiagenterror)를 참조하세요. |

#### LLMStreamingCompletedEvent

LLM 스트리밍 호출의 종료를 나타냅니다. 다음 필드를 포함합니다:

| 이름 | 데이터 타입 | 필수 여부 | 기본값 | 설명 |
|-----------------|---------------------|----------|---------|---------------------------------------------------------------------------------|
| `eventId`       | String              | 예      |         | 이벤트 또는 이벤트 그룹에 대한 고유 식별자입니다. |
| `executionInfo` | AgentExecutionInfo  | 예      |         | 이 이벤트와 연관된 실행에 대한 컨텍스트 정보를 제공합니다. |
| `runId`         | String              | 예      |         | LLM 실행의 고유 식별자입니다. |
| `prompt`        | Prompt              | 예      |         | 모델에 전송되는 프롬프트입니다. |
| `model`         | ModelInfo           | 예      |         | 모델 정보입니다. [ModelInfo](#modelinfo)를 참조하세요. |
| `tools`         | `List<String>`        | 예      |         | 모델이 호출할 수 있는 도구 목록입니다. |

### 도구 실행 이벤트

#### ToolCallStartingEvent

모델이 도구를 호출하는 이벤트를 나타냅니다. 다음 필드를 포함합니다:

| 이름 | 데이터 타입 | 필수 여부 | 기본값 | 설명 |
|-----------------|---------------------|----------|---------|----------------------------------------------------------------------------|
| `eventId`       | String              | 예      |         | 이벤트 또는 이벤트 그룹에 대한 고유 식별자입니다. |
| `executionInfo` | AgentExecutionInfo  | 예      |         | 이 이벤트와 연관된 실행에 대한 컨텍스트 정보를 제공합니다. |
| `runId`         | String              | 예      |         | 전략/에이전트 실행의 고유 식별자입니다. |
| `toolCallId`    | String              | 아니요   | null    | 도구 호출 식별자입니다(사용 가능한 경우). |
| `toolName`      | String              | 예      |         | 도구의 이름입니다. |
| `toolArgs`      | JsonObject          | 예      |         | 도구에 제공된 인자입니다. |

#### ToolValidationFailedEvent

도구 호출 중 검증 오류 발생을 나타냅니다. 다음 필드를 포함합니다:

| 이름 | 데이터 타입 | 필수 여부 | 기본값 | 설명 |
|-------------------|---------------------|----------|---------|----------------------------------------------------------------------------|
| `eventId`         | String              | 예      |         | 이벤트 또는 이벤트 그룹에 대한 고유 식별자입니다. |
| `executionInfo`   | AgentExecutionInfo  | 예      |         | 이 이벤트와 연관된 실행에 대한 컨텍스트 정보를 제공합니다. |
| `runId`           | String              | 예      |         | 전략/에이전트 실행의 고유 식별자입니다. |
| `toolCallId`      | String              | 아니요   | null    | 도구 호출 식별자입니다(사용 가능한 경우). |
| `toolName`        | String              | 예      |         | 검증에 실패한 도구의 이름입니다. |
| `toolArgs`        | JsonObject          | 예      |         | 도구에 제공된 인자입니다. |
| `toolDescription` | String              | 아니요   | null    | 검증 오류가 발생한 도구에 대한 설명입니다. |
| `message`         | String              | 아니요   | null    | 검증 오류를 설명하는 메시지입니다. |
| `error`           | AIAgentError        | 예      |         | 발생한 구체적인 오류입니다. 자세한 내용은 [AIAgentError](#aiagenterror)를 참조하세요. |

#### ToolCallFailedEvent

도구 실행 실패를 나타냅니다. 다음 필드를 포함합니다:

| 이름 | 데이터 타입 | 필수 여부 | 기본값 | 설명 |
|-------------------|---------------------|----------|---------|-------------------------------------------------------------------------------------------------------------------------|
| `eventId`         | String              | 예      |         | 이벤트 또는 이벤트 그룹에 대한 고유 식별자입니다. |
| `executionInfo`   | AgentExecutionInfo  | 예      |         | 이 이벤트와 연관된 실행에 대한 컨텍스트 정보를 제공합니다. |
| `runId`           | String              | 예      |         | 전략/에이전트 실행의 고유 식별자입니다. |
| `toolCallId`      | String              | 아니요   | null    | 도구 호출 식별자입니다(사용 가능한 경우). |
| `toolName`        | String              | 예      |         | 도구의 이름입니다. |
| `toolArgs`        | JsonObject          | 예      |         | 도구에 제공된 인자입니다. |
| `toolDescription` | String              | 아니요   | null    | 실패한 도구에 대한 설명입니다. |
| `error`           | AIAgentError        | 예      |         | 도구 호출 시도 중 발생한 구체적인 오류입니다. 자세한 내용은 [AIAgentError](#aiagenterror)를 참조하세요. |

#### ToolCallCompletedEvent

결과 반환과 함께 성공적인 도구 호출을 나타냅니다. 다음 필드를 포함합니다:

| 이름 | 데이터 타입 | 필수 여부 | 기본값 | 설명 |
|-------------------|---------------------|----------|---------|----------------------------------------------------------------------------|
| `eventId`         | String              | 예      |         | 이벤트 또는 이벤트 그룹에 대한 고유 식별자입니다. |
| `executionInfo`   | AgentExecutionInfo  | 예      |         | 이 이벤트와 연관된 실행에 대한 컨텍스트 정보를 제공합니다. |
| `runId`           | String              | 예      |         | 실행의 고유 식별자입니다. |
| `toolCallId`      | String              | 아니요   | null    | 도구 호출의 식별자입니다. |
| `toolName`        | String              | 예      |         | 도구의 이름입니다. |
| `toolArgs`        | JsonObject          | 예      |         | 도구에 제공된 인자입니다. |
| `toolDescription` | String              | 아니요   | null    | 실행된 도구에 대한 설명입니다. |
| `result`          | JsonElement         | 아니요   | null    | 도구 호출의 결과입니다. |

## FAQ 및 트러블슈팅

다음 섹션에는 트레이싱(Tracing) 기능과 관련된 자주 묻는 질문과 답변이 포함되어 있습니다.

### 에이전트 실행의 특정 부분만 트레이싱하려면 어떻게 해야 하나요?

`messageFilter` 속성을 사용하여 이벤트를 필터링하세요. 예를 들어, 노드 실행만 트레이싱하려면 다음과 같이 합니다:

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
        
        // LLM 호출만 트레이싱
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

        // LLM 호출만 트레이싱
        fileWriter.setMessageFilter(message ->
            message instanceof LLMCallStartingEvent || message instanceof LLMCallCompletedEvent
        );
    })
    ```
    <!--- KNIT exampleEventsJava01.java -->

### 여러 개의 메시지 프로세서를 사용할 수 있나요?

네, 여러 메시지 프로세서를 추가하여 여러 대상에 동시에 트레이싱할 수 있습니다:

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

### 커스텀 메시지 프로세서는 어떻게 만드나요?

`FeatureMessageProcessor` 인터페이스를 구현하세요:

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
            // 커스텀 처리 로직
            if (message is NodeExecutionStartingEvent) {
                // 노드 시작 이벤트 처리
            } else if (message is LLMCallCompletedEvent) {
                // LLM 호출 종료 이벤트 처리
            } else {
                // 다른 이벤트 유형 처리
            }
        }

        override suspend fun close() {
            // 연결이 수립된 경우 종료
        }
    }

    val agent = AIAgent(
        promptExecutor = simpleOllamaAIExecutor(),
        llmModel = OllamaModels.Meta.LLAMA_3_2,
    ) {
        install(Tracing) {
            // 커스텀 프로세서 사용
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
            // 커스텀 처리 로직
            if (message instanceof NodeExecutionStartingEvent) {
                // 노드 시작 이벤트 처리
            } else if (message instanceof LLMCallCompletedEvent) {
                // LLM 호출 종료 이벤트 처리
            } else {
                // 다른 이벤트 유형 처리
            }
        }

        @Override
        public void handleClose() {
            // 연결이 수립된 경우 종료
        }
    }

    var agent = AIAgent.builder()
        .promptExecutor(PromptExecutor.builder().ollama().build())
        .llmModel(OllamaModels.Meta.LLAMA_3_2)

        .install(Tracing.Feature, config -> {
            // 커스텀 프로세서 사용
            config.addMessageProcessor(new CustomTraceProcessor());
        })
        .build();
    ```
    <!--- KNIT exampleEventsJava03.java -->

메시지 프로세서에서 처리할 수 있는 기존 이벤트 유형에 대한 자세한 내용은 [사전 정의된 이벤트 유형](#predefined-event-types)을 참조하세요.