# 에이전트 지속성 (Agent Persistence)

에이전트 지속성(Agent Persistence)은 Koog 프레임워크에서 AI 에이전트를 위한 체크포인트 기능을 제공하는 기능입니다.
이 기능을 사용하면 실행 중 특정 시점에서 에이전트의 상태를 저장하고 복원할 수 있으며, 다음과 같은 기능을 구현할 수 있습니다:

- 특정 시점부터 에이전트 실행 재개
- 이전 상태로 롤백(Rollback)
- 여러 세션에 걸친 에이전트 상태 유지

## 핵심 개념

### 체크포인트 (Checkpoints)

체크포인트는 실행 중 특정 시점의 에이전트 전체 상태를 캡처하며, 다음 내용을 포함합니다:

- 메시지 기록 (사용자, 시스템, 어시스턴트, 도구 간의 모든 상호작용)
- 현재 실행 중인 노드
- 현재 노드에 대한 입력 데이터
- 생성 타임스탬프

체크포인트는 고유 ID로 식별되며 특정 에이전트와 연결됩니다.

## 설치

에이전트 지속성 기능을 사용하려면 에이전트 설정에 추가하십시오:

<!--- INCLUDE
import ai.koog.agents.core.agent.AIAgent
import ai.koog.agents.snapshot.feature.Persistence
import ai.koog.agents.snapshot.providers.InMemoryPersistenceStorageProvider
import ai.koog.prompt.executor.llms.all.simpleOllamaAIExecutor
import ai.koog.prompt.executor.ollama.client.OllamaModels
import ai.koog.agents.core.agent.context.RollbackStrategy

val executor = simpleOllamaAIExecutor()
-->

```kotlin
val agent = AIAgent(
    promptExecutor = executor,
    llmModel = OllamaModels.Meta.LLAMA_3_2,
) {
    install(Persistence) {
        // 스냅샷을 위해 인메모리 스토리지를 사용합니다.
        storage = InMemoryPersistenceStorageProvider()
    }
}
```

<!--- KNIT example-agent-persistence-01.kt -->

## 설정 옵션

에이전트 지속성 기능에는 세 가지 주요 설정 옵션이 있습니다:

- **스토리지 프로바이더 (Storage provider)**: 체크포인트를 저장하고 검색하는 데 사용되는 프로바이더입니다.
- **지속적 지속성 (Continuous persistence)**: 각 노드가 실행된 후 체크포인트를 자동으로 생성합니다.
- **롤백 전략 (Rollback strategy)**: 체크포인트로 롤백할 때 어떤 상태를 복원할지 결정합니다.

### 스토리지 프로바이더 (Storage provider)

체크포인트를 저장하고 검색하는 데 사용할 스토리지 프로바이더를 설정합니다:

<!--- INCLUDE
import ai.koog.agents.core.agent.AIAgent
import ai.koog.agents.snapshot.feature.Persistence
import ai.koog.agents.snapshot.providers.InMemoryPersistenceStorageProvider
import ai.koog.prompt.executor.llms.all.simpleOllamaAIExecutor
import ai.koog.prompt.executor.ollama.client.OllamaModels

val agent = AIAgent(
    promptExecutor = simpleOllamaAIExecutor(),
    llmModel = OllamaModels.Meta.LLAMA_3_2,
) {
-->
<!--- SUFFIX 
} 
-->

```kotlin
install(Persistence) {
    storage = InMemoryPersistenceStorageProvider()
}
```

<!--- KNIT example-agent-persistence-02.kt -->

프레임워크에는 다음과 같은 기본 제공 프로바이더가 포함되어 있습니다:

- `InMemoryPersistenceStorageProvider`: 체크포인트를 메모리에 저장합니다 (애플리케이션 재시작 시 데이터 손실).
- `FilePersistenceStorageProvider`: 체크포인트를 파일 시스템에 유지합니다.
- `NoPersistenceStorageProvider`: 체크포인트를 저장하지 않는 무동작(no-op) 구현체입니다. 기본 프로바이더입니다.

`PersistenceStorageProvider` 인터페이스를 구현하여 커스텀 스토리지 프로바이더를 만들 수도 있습니다.
자세한 내용은 [커스텀 스토리지 프로바이더](#custom-storage-providers)를 참조하십시오.

### 지속적 지속성 (Continuous persistence)

지속적 지속성은 각 노드가 실행된 후 체크포인트가 자동으로 생성됨을 의미합니다.
지속적 지속성을 비활성화하려면 아래 코드를 사용하십시오:

<!--- INCLUDE
import ai.koog.agents.core.agent.AIAgent
import ai.koog.agents.snapshot.feature.Persistence
import ai.koog.agents.snapshot.providers.InMemoryPersistenceStorageProvider
import ai.koog.prompt.executor.llms.all.simpleOllamaAIExecutor
import ai.koog.prompt.executor.ollama.client.OllamaModels

val agent = AIAgent(
    promptExecutor = simpleOllamaAIExecutor(),
    llmModel = OllamaModels.Meta.LLAMA_3_2,
) {
-->
<!--- SUFFIX 
} 
-->

```kotlin
install(Persistence) {
    enableAutomaticPersistence = false
}
```

<!--- KNIT example-agent-persistence-03.kt -->

지속적 지속성이 비활성화된 경우에도 수동으로 체크포인트를 생성할 수 있습니다.

## 기본 사용법

### 체크포인트 생성하기

에이전트 실행 중 특정 지점에서 체크포인트를 생성하는 방법은 아래 코드 샘플을 참조하십시오:

<!--- INCLUDE
import ai.koog.agents.core.agent.context.AIAgentContext
import ai.koog.agents.snapshot.feature.persistence
import ai.koog.serialization.typeToken

const val outputData = "some-output-data"
val outputType = typeToken<String>()
-->

```kotlin
suspend fun example(context: AIAgentContext) {
    // 현재 상태로 체크포인트를 생성합니다.
    val checkpoint = context.persistence().createCheckpointAfterNode(
        agentContext = context,
        nodePath = context.executionInfo.path(),
        lastOutput = outputData,
        lastOutputType = outputType,
        checkpointId = context.runId,
        version = 0L
    )

    // 체크포인트 ID는 나중에 사용하기 위해 저장할 수 있습니다.
    val checkpointId = checkpoint?.checkpointId
}
```

<!--- KNIT example-agent-persistence-04.kt -->

### 체크포인트에서 복원하기

특정 체크포인트에서 에이전트의 상태를 복원하려면 아래 코드 샘플을 따르십시오:

<!--- INCLUDE
import ai.koog.agents.core.agent.context.AIAgentContext
import ai.koog.agents.snapshot.feature.persistence
-->

```kotlin
suspend fun example(context: AIAgentContext, checkpointId: String) {
    // 특정 체크포인트로 롤백합니다.
    context.persistence().rollbackToCheckpoint(checkpointId, context)

    // 또는 최신 체크포인트로 롤백합니다.
    context.persistence().rollbackToLatestCheckpoint(context)
}
```

<!--- KNIT example-agent-persistence-05.kt -->

#### 도구에 의해 생성된 모든 사이드 이펙트 롤백하기

일부 도구가 사이드 이펙트(side-effects, 부수 효과)를 생성하는 것은 흔한 일입니다. 특히 백엔드에서 에이전트를 실행할 때 일부 도구는 데이터베이스 트랜잭션을 수행할 수 있습니다. 이는 에이전트가 과거로 되돌아가는 것을 훨씬 어렵게 만듭니다.

데이터베이스에 새 사용자를 생성하는 `createUser` 도구가 있다고 가정해 보겠습니다. 그리고 에이전트가 시간이 지나면서 여러 번의 도구 호출을 수행했습니다:
```
tool call: createUser "Alex"

->>>> checkpoint-1 <<<<-

tool call: createUser "Daniel"
tool call: createUser "Maria"
```

이제 특정 체크포인트로 롤백하고 싶을 때, 에이전트의 상태(메시지 기록 및 전략 그래프 노드 포함)를 복원하는 것만으로는 체크포인트 이전의 실제 세계 상태를 완벽하게 재현하기에 부족합니다. 도구 호출로 인해 발생한 사이드 이펙트도 복원해야 합니다. 위 예시에서는 데이터베이스에서 `Maria`와 `Daniel`을 삭제하는 것을 의미합니다.

Koog Persistence에서는 `Persistence` 기능 설정에 `RollbackToolRegistry`를 제공하여 이를 달성할 수 있습니다:

<!--- INCLUDE
import ai.koog.agents.core.agent.AIAgent
import ai.koog.agents.snapshot.feature.Persistence
import ai.koog.agents.snapshot.providers.InMemoryPersistenceStorageProvider
import ai.koog.prompt.executor.llms.all.simpleOllamaAIExecutor
import ai.koog.prompt.executor.ollama.client.OllamaModels
import ai.koog.agents.snapshot.feature.RollbackToolRegistry

fun createUser(name: String) {}

fun removeUser(name: String) {}

val agent = AIAgent(
    promptExecutor = simpleOllamaAIExecutor(),
    llmModel = OllamaModels.Meta.LLAMA_3_2,
) {
-->
<!--- SUFFIX 
} 
-->

```kotlin
install(Persistence) {
    enableAutomaticPersistence = true
    rollbackToolRegistry = RollbackToolRegistry {
        // 원하는 실행 지점으로 롤백할 때, 
        // 모든 `createUser` 도구 호출에 대해 역순으로 `removeUser` 호출이 발생합니다.
        // 참고: `removeUser` 도구는 `createUser`와 정확히 동일한 인자를 받아야 합니다.
        // `removeUser` 호출이 `createUser`의 모든 사이드 이펙트를 롤백하도록 보장하는 것은 개발자의 책임입니다.
        registerRollback(::createUser, ::removeUser)
    }
}
```

<!--- KNIT example-agent-persistence-06.kt -->

### 확장 함수 사용하기

에이전트 지속성 기능은 체크포인트 작업을 위한 편리한 확장 함수를 제공합니다:

<!--- INCLUDE
import ai.koog.agents.core.agent.context.AIAgentContext
import ai.koog.agents.example.exampleAgentPersistence04.outputData
import ai.koog.agents.example.exampleAgentPersistence04.outputType
import ai.koog.agents.snapshot.feature.persistence
import ai.koog.agents.snapshot.feature.withPersistence
-->

```kotlin
suspend fun example(context: AIAgentContext) {
    // 체크포인트 기능에 액세스
    val checkpointFeature = context.persistence()

    // 또는 체크포인트 기능으로 작업 수행
    context.withPersistence { ctx ->
        // 'this'는 체크포인트 기능입니다.
        createCheckpointAfterNode(
            agentContext = ctx,
            nodePath = ctx.executionInfo.path(),
            lastOutput = outputData,
            lastOutputType = outputType,
            checkpointId = ctx.runId,
            version = 0L
        )
    }
}
```
<!--- KNIT example-agent-persistence-07.kt -->

## 고급 사용법

### 커스텀 스토리지 프로바이더

`PersistenceStorageProvider` 인터페이스를 구현하여 커스텀 스토리지 프로바이더를 구현할 수 있습니다:

<!--- INCLUDE
import ai.koog.agents.snapshot.feature.AgentCheckpointData
import ai.koog.agents.snapshot.providers.PersistenceStorageProvider

/*
// KNIT: Ignore example
-->
<!--- SUFFIX
*/
-->
```kotlin
class MyCustomStorageProvider<MyFilterType> : PersistenceStorageProvider<MyFilterType> {
    override suspend fun getCheckpoints(sessionId: String, filter: MyFilterType?): `List<AgentCheckpointData>` {
        TODO("아직 구현되지 않음")
    }

    override suspend fun saveCheckpoint(sessionId: String, agentCheckpointData: AgentCheckpointData) {
        TODO("아직 구현되지 않음")
    }

    override suspend fun getLatestCheckpoint(sessionId: String, filter: MyFilterType?): AgentCheckpointData? {
        TODO("아직 구현되지 않음")
    }
}

```

<!--- KNIT example-agent-persistence-08.kt -->

커스텀 프로바이더를 기능 설정에서 사용하려면, 에이전트의 에이전트 지속성 기능을 구성할 때 이를 스토리지로 설정하십시오.

<!--- INCLUDE
import ai.koog.agents.core.agent.AIAgent
import ai.koog.agents.snapshot.feature.AgentCheckpointData
import ai.koog.agents.snapshot.feature.Persistence
import ai.koog.agents.snapshot.providers.PersistenceStorageProvider
import ai.koog.prompt.executor.llms.all.simpleOllamaAIExecutor
import ai.koog.prompt.executor.ollama.client.OllamaModels

class MyCustomStorageProvider<MyFilterType> : PersistenceStorageProvider<MyFilterType> {
    override suspend fun getCheckpoints(sessionId: String, filter: MyFilterType?): `List<AgentCheckpointData>` {
        TODO("아직 구현되지 않음")
    }

    override suspend fun saveCheckpoint(sessionId: String, agentCheckpointData: AgentCheckpointData) {
        TODO("아직 구현되지 않음")
    }

    override suspend fun getLatestCheckpoint(sessionId: String, filter: MyFilterType?): AgentCheckpointData? {
        TODO("아직 구현되지 않음")
    }
}

val agent = AIAgent(
    promptExecutor = simpleOllamaAIExecutor(),
    llmModel = OllamaModels.Meta.LLAMA_3_2,
) {
-->
<!--- SUFFIX 
} 
-->

```kotlin
install(Persistence) {
    storage = MyCustomStorageProvider<Any>()
}
```

<!--- KNIT example-agent-persistence-09.kt -->

### 실행 지점 설정하기

고급 제어를 위해 에이전트의 실행 지점을 직접 설정할 수 있습니다:

<!--- INCLUDE
import ai.koog.agents.core.agent.context.AIAgentContext
import ai.koog.agents.snapshot.feature.persistence
import ai.koog.prompt.message.Message.User
import ai.koog.serialization.JSONPrimitive

val customInput = JSONPrimitive("custom-input")
val customOutput = JSONPrimitive("custom-output")
val customMessageHistory = emptyList<User>()
-->

```kotlin
fun example(context: AIAgentContext) {
    // 특정 노드 이전으로 실행 지점을 설정하고 해당 노드에 대한 입력을 제공할 수 있습니다:
    context.persistence().setExecutionPoint(
        agentContext = context,
        nodePath = context.executionInfo.path(),
        messageHistory = customMessageHistory,
        input = customInput
    )

    // 또는 특정 노드 이후로 실행 지점을 설정하고 노드로부터의 출력을 제공할 수 있습니다:
    context.persistence().setExecutionPointAfterNode(
        agentContext = context,
        nodePath = context.executionInfo.path(),
        messageHistory = customMessageHistory,
        output = customOutput
    )
}

```

<!--- KNIT example-agent-persistence-10.kt -->

이를 통해 단순히 체크포인트에서 복원하는 것 이상으로 에이전트 상태를 세밀하게 제어할 수 있습니다.