# 에이전트 지속성 (Agent persistence)

에이전트 지속성(Agent Persistence)은 Koog 프레임워크에서 AI 에이전트에게 체크포인트 기능을 제공하는 기능입니다.
이 기능을 사용하면 실행 중 특정 시점의 에이전트 상태를 저장하고 복원할 수 있어 다음과 같은 작업이 가능해집니다.

- 특정 시점부터 에이전트 실행 재개
- 이전 상태로 롤백(Rolling back)
- 세션 간 에이전트 상태 유지

## 핵심 개념 (Key concepts)

### 체크포인트 (Checkpoints)

체크포인트는 실행 중 특정 시점의 에이전트 전체 상태를 캡처하며, 다음 내용을 포함합니다.

- 메시지 기록 (사용자, 시스템, 어시스턴트, 도구 간의 모든 상호작용)
- 현재 실행 중인 노드 (Node)
- 현재 노드에 대한 입력 데이터
- 생성 타임스탬프

체크포인트는 고유 ID로 식별되며 특정 에이전트와 연결됩니다.

## 설치 (Installation)

에이전트 지속성 기능을 사용하려면 에이전트 설정에 추가하세요.

=== "Kotlin"

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

=== "Java"

    <!--- INCLUDE
    /**
    var executor = SimplePromptExecutorsKt.simpleOllamaAIExecutor("http://localhost:11434")
    -->
    <!--- SUFFIX
    **/
    -->
    ```java
    AIAgent<String, String> agent = AIAgent.builder()
        .promptExecutor(executor)
        .llmModel(OllamaModels.Meta.LLAMA_3_2)
        .install(Persistence.Feature, cfg -> {
            // 스냅샷을 위해 인메모리 스토리지를 사용합니다.
            cfg.setStorage(new InMemoryPersistenceStorageProvider());
        })
    .build();
    ```
    <!--- KNIT example-agent-persistence-java-01.java -->

## 설정 옵션 (Configuration options)

에이전트 지속성 기능에는 세 가지 주요 설정 옵션이 있습니다.

- **스토리지 프로바이더 (Storage provider)**: 체크포인트를 저장하고 검색하는 데 사용되는 프로바이더입니다.
- **연속 지속성 (Continuous persistence)**: 각 노드가 실행된 후 체크포인트를 자동으로 생성합니다.
- **롤백 전략 (Rollback strategy)**: 체크포인트로 롤백할 때 복원할 상태를 결정합니다.

### 스토리지 프로바이더 (Storage provider)

체크포인트를 저장하고 검색하는 데 사용할 스토리지 프로바이더를 설정합니다.

=== "Kotlin"

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

=== "Java"

    <!--- INCLUDE
    /**
    var executor = SimplePromptExecutorsKt.simpleOllamaAIExecutor("http://localhost:11434")
    -->
    <!--- SUFFIX
    **/
    -->
    ```java
    AIAgent<String, String> agent = AIAgent.builder()
        .promptExecutor(executor)
        .llmModel(OllamaModels.Meta.LLAMA_3_2)
        .install(Persistence.Feature, cfg -> {
            cfg.setStorage(new InMemoryPersistenceStorageProvider());
        })
        .build();
    ```
    <!--- KNIT example-agent-persistence-java-02.java -->

프레임워크에는 다음과 같은 내장 프로바이더가 포함되어 있습니다.

- `InMemoryPersistenceStorageProvider`: 체크포인트를 메모리에 저장합니다 (애플리케이션 재시작 시 손실됨).
- `FilePersistenceStorageProvider`: 체크포인트를 파일 시스템에 유지합니다.
- `NoPersistenceStorageProvider`: 체크포인트를 저장하지 않는 무동작(no-op) 구현체입니다. 기본 프로바이더입니다.

또한 `PersistenceStorageProvider` 인터페이스를 구현하여 사용자 정의 스토리지 프로바이더를 만들 수도 있습니다.
자세한 내용은 [사용자 정의 스토리지 프로바이더](#사용자-정의-스토리지-프로바이더)를 참조하세요.

### 연속 지속성 (Continuous persistence)

연속 지속성은 각 노드가 실행된 후 체크포인트가 자동으로 생성됨을 의미합니다.
연속 지속성을 비활성화하려면 아래 코드를 사용하세요.

=== "Kotlin"

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

=== "Java"

    <!--- INCLUDE
    /**
    var executor = SimplePromptExecutorsKt.simpleOllamaAIExecutor("http://localhost:11434")
    -->
    <!--- SUFFIX
    **/
    -->
    ```java
    AIAgent<String, String> agent = AIAgent.builder()
        .promptExecutor(executor)
        .llmModel(OllamaModels.Meta.LLAMA_3_2)
        .install(Persistence.Feature, cfg -> {
            cfg.setEnableAutomaticPersistence(true);
        })
        .build();
    ```
    <!--- KNIT example-agent-persistence-java-03.java -->

연속 지속성이 비활성화된 경우에도 수동으로 체크포인트를 생성할 수 있습니다.

## 기본 사용법 (Basic usage)

### 체크포인트 생성하기

에이전트 실행 중 특정 시점에 체크포인트를 생성하는 방법은 아래 코드 샘플을 참조하세요.

=== "Kotlin"

    <!--- INCLUDE
    import ai.koog.agents.core.agent.context.AIAgentContext
    import ai.koog.agents.snapshot.feature.persistence
    import ai.koog.serialization.typeToken
    const val outputData = "some-output-data"
    val outputType = typeToken<String>()
    -->
    ```kotlin
    suspend fun example(context: AIAgentContext) {
        // 현재 상태로 체크포인트 생성
        val checkpoint = context.persistence().createCheckpointAfterNode(
            agentContext = context,
            nodePath = context.executionInfo.path(),
            lastOutput = outputData,
            lastOutputType = outputType,
            checkpointId = context.runId,
            version = 0L
        )

        // 나중에 사용하기 위해 체크포인트 ID를 저장할 수 있습니다.
        val checkpointId = checkpoint?.checkpointId
    }
    ```
    <!--- KNIT example-agent-persistence-04.kt -->

=== "Java"

    <!--- INCLUDE
    /**
    -->
    <!--- SUFFIX
    **/
    -->
    ```java
    // PersistenceKt.persistence()는 Kotlin 확장 함수의 Java 접근용 형태입니다.
    Persistence persistence = PersistenceKt.persistence(context);

    // 현재 상태로 체크포인트 생성
    AgentCheckpointData checkpoint = persistence.createCheckpointAfterNode(
        context,
        context.getExecutionInfo().path(),
        outputData,
        TypeToken.of(String.class),
        0L,
        context.getRunId()
    );

    // 나중에 사용하기 위해 체크포인트 ID를 저장할 수 있습니다.
    String checkpointId = checkpoint != null ? checkpoint.getCheckpointId() : null;
    ```
    <!--- KNIT example-agent-persistence-java-04.java -->

### 체크포인트에서 복원하기

특정 체크포인트에서 에이전트의 상태를 복원하려면 아래 코드 샘플을 따르세요.

=== "Kotlin"

    <!--- INCLUDE
    import ai.koog.agents.core.agent.context.AIAgentContext
    import ai.koog.agents.snapshot.feature.persistence
    -->
    ```kotlin
    suspend fun example(context: AIAgentContext, checkpointId: String) {
        // 특정 체크포인트로 롤백
        context.persistence().rollbackToCheckpoint(checkpointId, context)

        // 또는 최신 체크포인트로 롤백
        context.persistence().rollbackToLatestCheckpoint(context)
    }
    ```
    <!--- KNIT example-agent-persistence-05.kt -->

=== "Java"

    <!--- INCLUDE
    /**
    -->
    <!--- SUFFIX
    **/
    -->
    ```java
    Persistence persistence = PersistenceKt.persistence(context);

    // 특정 체크포인트로 롤백
    persistence.rollbackToCheckpoint(checkpointId, context);

    // 또는 최신 체크포인트로 롤백
    persistence.rollbackToLatestCheckpoint(context);
    ```
    <!--- KNIT example-agent-persistence-java-05.java -->

#### 도구에 의해 발생한 모든 부수 효과 롤백하기

일부 도구가 부수 효과(side-effects)를 생성하는 것은 매우 흔한 일입니다. 특히 백엔드에서 에이전트를 실행할 때 일부 도구는 데이터베이스 트랜잭션을 수행할 수 있습니다. 이는 에이전트가 과거로 되돌아가는 것을 훨씬 어렵게 만듭니다.

데이터베이스에 새 사용자를 생성하는 `createUser` 도구가 있다고 가정해 보겠습니다. 그리고 에이전트가 시간이 지남에 따라 여러 도구 호출을 수행했습니다.

```
도구 호출: createUser "Alex"

->>>> checkpoint-1 <<<<-

도구 호출: createUser "Daniel"
도구 호출: createUser "Maria"
```
 <!--- KNIT example-agent-persistence-01.txt -->

이제 체크포인트로 롤백하려고 합니다. 에이전트의 상태(메시지 기록 및 전략 그래프 노드 포함)만 복원하는 것으로는 체크포인트 이전의 정확한 세계 상태를 달성하기에 충분하지 않습니다. 도구 호출로 인해 발생한 부수 효과도 복원해야 합니다. 이 예시의 경우 데이터베이스에서 `Maria`와 `Daniel`을 제거하는 것을 의미합니다.

Koog Persistence를 사용하면 `Persistence` 기능 설정에 `RollbackToolRegistry`를 제공하여 이를 달성할 수 있습니다.

=== "Kotlin"

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
            // 모든 `createUser` 도구 호출에 대해 역순으로 `removeUser`가 호출됩니다.
            // 참고: `removeUser` 도구는 `createUser`와 정확히 동일한 인수를 가져야 합니다.
            // `removeUser` 호출이 `createUser`의 모든 부수 효과를 롤백하도록 보장하는 것은 개발자의 책임입니다.
            registerRollback(::createUser, ::removeUser)
        }
    }
    ```
    <!--- KNIT example-agent-persistence-06.kt -->

=== "Java"

    <!--- INCLUDE
    /**
    var executor = SimplePromptExecutorsKt.simpleOllamaAIExecutor("http://localhost:11434")
    -->
    <!--- SUFFIX
    **/
    -->
    ```java
    AIAgent<String, String> agent = AIAgent.builder()
        .promptExecutor(executor)
        .llmModel(OllamaModels.Meta.LLAMA_3_2)
        .install(Persistence.Feature, cfg -> {
            cfg.setEnableAutomaticPersistence(true);
            cfg.setRollbackToolRegistry(
                RollbackToolRegistry.builder()
                    // 롤백 시 UserToolSet의 모든 도구에 대해 
                    // UserRollbackToolSet의 대응하는 롤백 도구가 역순으로 호출됩니다.
                    // UserRollbackToolSet 메서드는 UserToolSet의 해당 도구와 
                    // 연결하기 위해 @Reverts 어노테이션을 지정해야 합니다.
                    .registerRollbacks(new UserToolSet(), new UserRollbackToolSet())
                    .build()
            );
        })
        .build();
    ```
    <!--- KNIT example-agent-persistence-java-06.java -->

### 확장 함수 사용하기

에이전트 지속성 기능은 체크포인트 작업을 위한 편리한 확장 함수를 제공합니다.

=== "Kotlin"

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

=== "Java"

    <!--- INCLUDE
    /**
    -->
    <!--- SUFFIX
    **/
    -->
    ```java
    // PersistenceKt(Kotlin 확장 함수)를 통해 지속성 기능에 액세스
    Persistence persistence = PersistenceKt.persistence(context);

    // 지속성 기능을 직접 사용하여 체크포인트 생성
    persistence.createCheckpointAfterNode(
        context,
        context.getExecutionInfo().path(),
        outputData,
        TypeToken.of(String.class),
        0L,
        context.getRunId()
    );
    ```
    <!--- KNIT example-agent-persistence-java-07.java -->

## 고급 사용법 (Advanced usage)

### 사용자 정의 스토리지 프로바이더 (Custom storage providers)

`PersistenceStorageProvider` 인터페이스를 구현하여 사용자 정의 스토리지 프로바이더를 만들 수 있습니다.

=== "Kotlin"

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

=== "Java"

    <!--- INCLUDE
    /**
    -->
    <!--- SUFFIX
    **/
    -->
    ```java
    class MyCustomStorageProvider extends AsyncPersistenceStorageProvider<Object> {
        @Override
        public CompletableFuture<List<AgentCheckpointData>> getCheckpointsAsync(
                String agentId, Object filter) {
            throw new UnsupportedOperationException("아직 구현되지 않음");
        }

        @Override
        public CompletableFuture<Boolean> saveCheckpointAsync(
                String agentId, AgentCheckpointData checkpointData) {
            throw new UnsupportedOperationException("아직 구현되지 않음");
        }

        @Override
        public CompletableFuture<AgentCheckpointData> getLatestCheckpointAsync(
                String agentId, Object filter) {
            throw new UnsupportedOperationException("아직 구현되지 않음");
        }
    }
    ```
    <!--- KNIT example-agent-persistence-java-08.java -->

기능 설정에서 사용자 정의 프로바이더를 사용하려면 에이전트의 에이전트 지속성 기능을 구성할 때 이를 스토리지로 설정하세요.

=== "Kotlin"

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

=== "Java"

    <!--- INCLUDE
    /**
    var executor = SimplePromptExecutorsKt.simpleOllamaAIExecutor("http://localhost:11434")
    -->
    <!--- SUFFIX
    **/
    -->
    ```java
    AIAgent<String, String> agent = AIAgent.builder()
        .promptExecutor(executor)
        .llmModel(OllamaModels.Meta.LLAMA_3_2)
        .install(Persistence.Feature, cfg -> {
            cfg.setStorage(new MyCustomStorageProvider());
        })
        .build();
    ```
    <!--- KNIT example-agent-persistence-java-09.java -->

### 실행 지점 설정 (Setting execution points)

고급 제어를 위해 에이전트의 실행 지점을 직접 설정할 수 있습니다.

=== "Kotlin"

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
    suspend fun example(context: AIAgentContext) {
        // 특정 노드 이전으로 실행 지점을 설정하고 해당 노드에 대한 입력을 제공할 수 있습니다.
        context.persistence().setExecutionPoint(
            agentContext = context,
            nodePath = context.executionInfo.path(),
            messageHistory = customMessageHistory,
            input = customInput
        )

        // 또는 특정 노드 이후로 실행 지점을 설정하고 해당 노드의 출력을 제공할 수 있습니다.
        context.persistence().setExecutionPointAfterNode(
            agentContext = context,
            nodePath = context.executionInfo.path(),
            messageHistory = customMessageHistory,
            output = customOutput
        )
    }

    ```
    <!--- KNIT example-agent-persistence-10.kt -->

=== "Java"

    <!--- INCLUDE
    /**
    -->
    <!--- SUFFIX
    **/
    -->
    ```java
    Persistence persistence = PersistenceKt.persistence(context);

    // 특정 노드 이전으로 실행 지점을 설정하고 해당 노드에 대한 입력을 제공합니다.
    persistence.setExecutionPoint(
        context,
        context.getExecutionInfo().path(),
        customMessageHistory,
        customInput
    );

    // 또는 특정 노드 이후로 실행 지점을 설정하고 해당 노드의 출력을 제공합니다.
    persistence.setExecutionPointAfterNode(
        context,
        context.getExecutionInfo().path(),
        customMessageHistory,
        customOutput
    );
    ```
    <!--- KNIT example-agent-persistence-java-10.java -->

이를 통해 단순히 체크포인트에서 복원하는 것 이상으로 에이전트의 상태를 더욱 세밀하게 제어할 수 있습니다.