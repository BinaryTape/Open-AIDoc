# 에이전트 메모리(Agent memory)

## 기능 개요

AgentMemory 기능은 AI 에이전트가 대화 전반에 걸쳐 정보를 저장, 검색 및 사용할 수 있도록 지원하는 Koog 프레임워크의 구성 요소입니다.

### 목적

AgentMemory 기능은 다음과 같은 방식을 통해 AI 에이전트 상호작용에서 컨텍스트를 유지하는 문제를 해결합니다:

- 대화에서 추출된 중요한 팩트(Fact)를 저장합니다.
- 개념(Concept), 주체(Subject), 범위(Scope)별로 정보를 정리합니다.
- 향후 상호작용 시 필요한 관련 정보를 검색합니다.
- 사용자 선호도 및 이력을 바탕으로 개인화를 구현합니다.

### 아키텍처

AgentMemory 기능은 계층적 구조를 기반으로 구축되었습니다.
구조의 각 요소는 아래 섹션에서 설명합니다.

#### 팩트(Facts)

***팩트(Facts)***는 메모리에 저장되는 개별 정보 단위입니다.
팩트는 실제로 저장된 정보를 나타내며, 두 가지 유형이 있습니다:

- **SingleFact**: 개념과 관련된 단일 값입니다. 예를 들어, IDE 사용자가 현재 선호하는 테마는 다음과 같습니다:
<!--- INCLUDE
import ai.koog.agents.memory.model.Concept
import ai.koog.agents.memory.model.FactType
import ai.koog.agents.memory.model.SingleFact
import kotlin.time.Clock
-->
```kotlin
// 선호하는 IDE 테마 저장 (단일 값)
val themeFact = SingleFact(
    concept = Concept(
        "ide-theme", 
        "User's preferred IDE theme", 
        factType = FactType.SINGLE),
    value = "Dark Theme",
    timestamp = Clock.System.now().toEpochMilliseconds(),
)
```
<!--- KNIT example-agent-memory-01.kt -->
- **MultipleFacts**: 개념과 관련된 여러 값입니다. 예를 들어, 사용자가 알고 있는 모든 언어는 다음과 같습니다:
<!--- INCLUDE
import ai.koog.agents.memory.model.Concept
import ai.koog.agents.memory.model.FactType
import ai.koog.agents.memory.model.MultipleFacts
import kotlin.time.Clock
-->
```kotlin
// 프로그래밍 언어 저장 (다중 값)
val languagesFact = MultipleFacts(
    concept = Concept(
        "programming-languages",
        "Languages the user knows",
        factType = FactType.MULTIPLE
    ),
    values = listOf("Kotlin", "Java", "Python"),
    timestamp = Clock.System.now().toEpochMilliseconds(),
)
```
<!--- KNIT example-agent-memory-02.kt -->

#### 개념(Concepts)

***개념(Concepts)***은 메타데이터가 연결된 정보의 범주입니다.

- **키워드(Keyword)**: 개념을 식별하는 고유 식별자입니다.
- **설명(Description)**: 개념이 무엇을 나타내는지에 대한 자세한 설명입니다.
- **팩트 유형(FactType)**: 개념이 단일 팩트를 저장하는지 또는 다중 팩트를 저장하는지 여부입니다 (`FactType.SINGLE` 또는 `FactType.MULTIPLE`).

#### 주체(Subjects)

***주체(Subjects)***는 팩트와 연관될 수 있는 엔티티(Entity)입니다.

주체의 일반적인 예시는 다음과 같습니다:

- **사용자(User)**: 개인의 선호도 및 설정
- **환경(Environment)**: 애플리케이션의 환경과 관련된 정보

모든 팩트의 기본 주체로 사용할 수 있는 미리 정의된 `MemorySubject.Everything`이 있습니다.
또한, `MemorySubject` 추상 클래스를 상속하여 자신만의 커스텀 메모리 주체를 정의할 수 있습니다:

<!--- INCLUDE
import ai.koog.agents.memory.model.MemorySubject
import kotlinx.serialization.Serializable
-->
```kotlin
object MemorySubjects {
    /**
     * 로컬 머신 환경에 특화된 정보
     * 예: 설치된 도구, SDK, OS 설정, 사용 가능한 명령어
     */
    @Serializable
    data object Machine : MemorySubject() {
        override val name: String = "machine"
        override val promptDescription: String =
            "Technical environment (installed tools, package managers, packages, SDKs, OS, etc.)"
        override val priorityLevel: Int = 1
    }

    /**
     * 사용자에 특화된 정보
     * 예: 대화 선호도, 이슈 이력, 연락처 정보
     */
    @Serializable
    data object User : MemorySubject() {
        override val name: String = "user"
        override val promptDescription: String =
            "User information (conversation preferences, issue history, contact details, etc.)"
        override val priorityLevel: Int = 1
    }
}
```
<!--- KNIT example-agent-memory-03.kt -->

#### 범위(Scopes)

***메모리 범위(Memory scopes)***는 팩트가 유효한 컨텍스트입니다:

- **에이전트(Agent)**: 특정 에이전트에 한정됩니다.
- **기능(Feature)**: 특정 기능에 한정됩니다.
- **제품(Product)**: 특정 제품에 한정됩니다.
- **교차 제품(CrossProduct)**: 여러 제품에 걸쳐 유효합니다.

## 구성 및 초기화

이 기능은 팩트를 저장하고 로드하는 메서드를 제공하는 `AgentMemory` 클래스를 통해 에이전트 파이프라인과 통합되며, 에이전트 구성에서 기능(Feature)으로 설치할 수 있습니다.

### 구성(Configuration)

`AgentMemory.Config` 클래스는 AgentMemory 기능을 위한 구성 클래스입니다.

<!--- INCLUDE
import ai.koog.agents.core.feature.config.FeatureConfig
import ai.koog.agents.memory.config.MemoryScopesProfile
import ai.koog.agents.memory.providers.AgentMemoryProvider
import ai.koog.agents.memory.providers.NoMemory
-->
```kotlin
class Config(
    var memoryProvider: AgentMemoryProvider = NoMemory,
    var scopesProfile: MemoryScopesProfile = MemoryScopesProfile(),

    var agentName: String,
    var featureName: String,
    var organizationName: String,
    var productName: String
) : FeatureConfig()
```
<!--- KNIT example-agent-memory-04.kt -->

### 설치(Installation)

에이전트에 AgentMemory 기능을 설치하려면 아래 코드 샘플에 제공된 패턴을 따르십시오.

<!--- INCLUDE
import ai.koog.agents.core.agent.AIAgent
import ai.koog.agents.memory.feature.AgentMemory
import ai.koog.agents.example.exampleAgentMemory06.memoryProvider
import ai.koog.prompt.executor.llms.all.simpleOllamaAIExecutor
import ai.koog.prompt.executor.ollama.client.OllamaModels
-->
```kotlin
val agent = AIAgent(
    promptExecutor = simpleOllamaAIExecutor(),
    llmModel = OllamaModels.Meta.LLAMA_3_2,
) {
    install(AgentMemory) {
        memoryProvider = memoryProvider
        agentName = "your-agent-name"
        featureName = "your-feature-name"
        organizationName = "your-organization-name"
        productName = "your-product-name"
    }
}
```
<!--- KNIT example-agent-memory-05.kt -->

## 예제 및 빠른 시작

### 기본 사용법

다음 코드 스니펫은 메모리 저장소의 기본 설정 방법과 메모리에서 팩트를 저장하고 로드하는 방법을 보여줍니다.

1) 메모리 저장소 설정
<!--- INCLUDE
import ai.koog.agents.memory.providers.LocalFileMemoryProvider
import ai.koog.agents.memory.providers.LocalMemoryConfig
import ai.koog.agents.memory.storage.SimpleStorage
import ai.koog.rag.base.files.JVMFileSystemProvider
import kotlin.io.path.Path
-->
```kotlin
// 메모리 프로바이더 생성
val memoryProvider = LocalFileMemoryProvider(
    config = LocalMemoryConfig("customer-support-memory"),
    storage = SimpleStorage(JVMFileSystemProvider.ReadWrite),
    fs = JVMFileSystemProvider.ReadWrite,
    root = Path("path/to/memory/root")
)
```
<!--- KNIT example-agent-memory-06.kt -->

2) 메모리에 팩트 저장
<!--- INCLUDE
import ai.koog.agents.example.exampleAgentMemory03.MemorySubjects
import ai.koog.agents.example.exampleAgentMemory06.memoryProvider
import ai.koog.agents.memory.model.Concept
import ai.koog.agents.memory.model.FactType
import ai.koog.agents.memory.model.MemoryScope
import ai.koog.agents.memory.model.SingleFact
import kotlin.time.Clock

suspend fun main() {
-->
<!--- SUFFIX
}
-->
```kotlin
memoryProvider.save(
    fact = SingleFact(
        concept = Concept("greeting", "User's name", FactType.SINGLE),
        value = "John",
        timestamp = Clock.System.now().toEpochMilliseconds(),
    ),
    subject = MemorySubjects.User,
    scope = MemoryScope.Product("my-app"),
)
```
<!--- KNIT example-agent-memory-07.kt -->

3) 팩트 검색
<!--- INCLUDE
import ai.koog.agents.example.exampleAgentMemory03.MemorySubjects
import ai.koog.agents.example.exampleAgentMemory06.memoryProvider
import ai.koog.agents.memory.model.Concept
import ai.koog.agents.memory.model.FactType
import ai.koog.agents.memory.model.MemoryScope

suspend fun main() {
-->
<!--- SUFFIX
}
-->
```kotlin
// 저장된 정보 가져오기
val greeting = memoryProvider.load(
    concept = Concept("greeting", "User's name", FactType.SINGLE),
    subject = MemorySubjects.User,
    scope = MemoryScope.Product("my-app")
)
if (greeting.size > 1) {
    println("Memories found: ${greeting.joinToString(", ")}")
} else {
    println("Information not found. First time here?")
}
```
<!--- KNIT example-agent-memory-08.kt -->

#### 메모리 노드 사용하기

AgentMemory 기능은 에이전트 전략(Strategy)에서 사용할 수 있도록 다음과 같이 미리 정의된 메모리 노드를 제공합니다:

* [nodeLoadAllFactsFromMemory](api:agents-features-memory::ai.koog.agents.memory.feature.nodes.nodeLoadAllFactsFromMemory): 특정 개념에 대해 주체와 관련된 모든 팩트를 메모리에서 로드합니다.
* [nodeLoadFromMemory](api:agents-features-memory::ai.koog.agents.memory.feature.nodes.nodeLoadFromMemory): 특정 개념에 대해 특정 팩트를 메모리에서 로드합니다.
* [nodeSaveToMemory](api:agents-features-memory::ai.koog.agents.memory.feature.nodes.nodeSaveToMemory): 팩트를 메모리에 저장합니다.
* [nodeSaveToMemoryAutoDetectFacts](api:agents-features-memory::ai.koog.agents.memory.feature.nodes.nodeSaveToMemoryAutoDetectFacts): 채팅 이력에서 팩트를 자동으로 감지 및 추출하여 메모리에 저장합니다. LLM을 사용하여 개념을 식별합니다.

다음은 에이전트 전략에서 노드를 구현하는 예제입니다:

<!--- INCLUDE
import ai.koog.agents.core.dsl.builder.forwardTo
import ai.koog.agents.core.dsl.builder.strategy
import ai.koog.agents.core.dsl.builder.node
import ai.koog.agents.core.dsl.builder.subgraph
import ai.koog.agents.example.exampleAgentMemory03.MemorySubjects
import ai.koog.agents.memory.feature.nodes.nodeSaveToMemoryAutoDetectFacts
import ai.koog.agents.memory.feature.withMemory
import ai.koog.agents.memory.model.Concept
import ai.koog.agents.memory.model.FactType
-->
```kotlin
val strategy = strategy("example-agent") {
    // 팩트를 자동으로 감지하고 저장하는 노드
    val detectFacts by nodeSaveToMemoryAutoDetectFacts<Unit>(
        subjects = listOf(MemorySubjects.User, MemorySubjects.Machine)
    )

    // 특정 팩트를 로드하는 노드
    val loadPreferences by node<Unit, Unit> {
        withMemory {
            loadFactsToAgent(
                llm = llm,
                concept = Concept("user-preference", "User's preferred programming language", FactType.SINGLE),
                subjects = listOf(MemorySubjects.User)
            )
        }
    }

    // 전략 내에서 노드 연결
    edge(nodeStart forwardTo detectFacts)
    edge(detectFacts forwardTo loadPreferences)
    edge(loadPreferences forwardTo nodeFinish)
}
```
<!--- KNIT example-agent-memory-09.kt -->

#### 메모리 보안 설정하기

메모리 프로바이더가 사용하는 암호화된 저장소 내에서 민감한 정보를 보호하기 위해 암호화를 사용할 수 있습니다.

<!--- INCLUDE
import ai.koog.agents.memory.storage.EncryptedStorage
import ai.koog.rag.base.files.JVMFileSystemProvider
import ai.koog.agents.memory.storage.Aes256GCMEncryptor
-->
```kotlin
// 간단한 암호화 저장소 설정
val secureStorage = EncryptedStorage(
    fs = JVMFileSystemProvider.ReadWrite,
    encryption = Aes256GCMEncryptor("your-secret-key")
)
```
<!--- KNIT example-agent-memory-10.kt -->

#### 예제: 사용자 선호도 기억하기

다음은 실생활 시나리오에서 AgentMemory를 사용하여 사용자의 선호도(특히 사용자가 선호하는 프로그래밍 언어)를 기억하는 방법의 예시입니다.

<!--- INCLUDE
import ai.koog.agents.example.exampleAgentMemory03.MemorySubjects
import ai.koog.agents.example.exampleAgentMemory06.memoryProvider
import ai.koog.agents.memory.model.Concept
import ai.koog.agents.memory.model.FactType
import ai.koog.agents.memory.model.MemoryScope
import ai.koog.agents.memory.model.SingleFact
import kotlin.time.Clock

suspend fun main() {
-->
<!--- SUFFIX
}
-->
```kotlin
memoryProvider.save(
    fact = SingleFact(
        concept = Concept("preferred-language", "What programming language is preferred by the user?", FactType.SINGLE),
        value = "Kotlin",
        timestamp = Clock.System.now().toEpochMilliseconds(),
    ),
    subject = MemorySubjects.User,
    scope = MemoryScope.Product("my-app")
)
```
<!--- KNIT example-agent-memory-11.kt -->

### 고급 사용법

#### 메모리를 사용한 커스텀 노드

어느 노드 안에서든 `withMemory` 절을 사용하여 메모리를 사용할 수 있습니다. 바로 사용할 수 있는 상위 수준 추상화인 `loadFactsToAgent` 및 `saveFactsFromHistory`는 이력에 팩트를 저장하고, 이력에서 팩트를 로드하며, LLM 채팅을 업데이트합니다:

<!--- INCLUDE
import ai.koog.agents.core.dsl.builder.strategy
import ai.koog.agents.core.dsl.builder.node
import ai.koog.agents.core.dsl.builder.subgraph
import ai.koog.agents.example.exampleAgentMemory03.MemorySubjects
import ai.koog.agents.memory.feature.withMemory
import ai.koog.agents.memory.model.Concept
import ai.koog.agents.memory.model.FactType
import ai.koog.agents.memory.model.MemoryScope

fun main() {
    val strategy = strategy<Unit, Unit>("example-agent") {
-->
<!--- SUFFIX
    }
}
-->
```kotlin
val loadProjectInfo by node<Unit, Unit> {
    withMemory {
        loadFactsToAgent(
            llm = llm,
            concept = Concept("preferred-language", "What programming language is preferred by the user?", FactType.SINGLE)
        )
    }
}

val saveProjectInfo by node<Unit, Unit> {
    withMemory {
        saveFactsFromHistory(
            llm = llm,
            concept = Concept("preferred-language", "What programming language is preferred by the user?", FactType.SINGLE),
            subject = MemorySubjects.User,
            scope = MemoryScope.Product("my-app")
        )
    }
}
```
<!--- KNIT example-agent-memory-12.kt -->

#### 자동 팩트 감지

`nodeSaveToMemoryAutoDetectFacts` 메서드를 사용하여 LLM이 에이전트의 이력에서 모든 팩트를 감지하도록 요청할 수도 있습니다:

<!--- INCLUDE
import ai.koog.agents.core.dsl.builder.strategy
import ai.koog.agents.core.dsl.builder.node
import ai.koog.agents.core.dsl.builder.subgraph
import ai.koog.agents.example.exampleAgentMemory03.MemorySubjects
import ai.koog.agents.memory.feature.nodes.nodeSaveToMemoryAutoDetectFacts

fun main() {
    val strategy = strategy<Unit, Unit>("example-agent") {

-->
<!--- SUFFIX
    }
}
-->
```kotlin
val saveAutoDetect by nodeSaveToMemoryAutoDetectFacts<Unit>(
    subjects = listOf(MemorySubjects.User, MemorySubjects.Machine)
)
```
<!--- KNIT example-agent-memory-13.kt -->

위의 예시에서 LLM은 사용자와 관련된 팩트 및 프로젝트와 관련된 팩트를 검색하고, 개념을 결정하여 메모리에 저장합니다.

## 권장 사항(Best practices)

1. **단순하게 시작하기**
    - 암호화가 없는 기본 저장소부터 시작하십시오.
    - 다중 팩트로 넘어가기 전에 단일 팩트를 사용해 보십시오.

2. **잘 정리하기**
    - 명확한 개념 이름을 사용하십시오.
    - 유용한 설명을 추가하십시오.
    - 관련 정보를 동일한 주체 아래에 유지하십시오.

3. **오류 처리**
<!--- INCLUDE
import ai.koog.agents.example.exampleAgentMemory03.MemorySubjects
import ai.koog.agents.example.exampleAgentMemory06.memoryProvider
import ai.koog.agents.memory.model.Concept
import ai.koog.agents.memory.model.FactType
import ai.koog.agents.memory.model.MemoryScope
import ai.koog.agents.memory.model.SingleFact
import kotlinx.coroutines.runBlocking
import kotlin.time.Clock

fun main() {
    runBlocking {
        val fact = SingleFact(
            concept = Concept("preferred-language", "What programming language is preferred by the user?", FactType.SINGLE),
            value = "Kotlin",
            timestamp = Clock.System.now().toEpochMilliseconds()
        )
        val subject = MemorySubjects.User
        val scope = MemoryScope.Product("my-app")
-->
<!--- SUFFIX
    }
}
-->
```kotlin
try {
    memoryProvider.save(fact, subject, scope)
} catch (e: Exception) {
    println("Oops! Couldn't save: ${e.message}")
}
```
<!--- KNIT example-agent-memory-14.kt -->

오류 처리에 대한 자세한 내용은 [오류 처리 및 예외 상황](#error-handling-and-edge-cases) 섹션을 참조하십시오.

## 오류 처리 및 예외 상황

AgentMemory 기능에는 예외 상황을 처리하기 위한 여러 메커니즘이 포함되어 있습니다:

1. **NoMemory 프로바이더**: 메모리 프로바이더가 지정되지 않았을 때 사용되며, 아무것도 저장하지 않는 기본 구현체입니다.

2. **주체 특이성(Subject specificity) 처리**: 팩트를 로드할 때, 정의된 `priorityLevel`을 기준으로 더 구체적인 주체의 팩트에 우선순위를 둡니다.

3. **범위 필터링**: 팩트를 범위별로 필터링하여 관련 정보만 로드되도록 보장할 수 있습니다.

4. **타임스탬프 추적**: 팩트가 생성된 시점을 추적하기 위해 타임스탬프와 함께 저장됩니다.

5. **팩트 유형 처리**: 단일 팩트와 다중 팩트를 모두 지원하며, 각 유형에 적절한 처리를 수행합니다.

## API 문서

AgentMemory 기능과 관련된 전체 API 참조는 [agents-features-memory](api:agents-features-memory::) 모듈의 참조 문서를 확인하십시오.

특정 패키지에 대한 API 문서:

- [ai.koog.agents.local.memory.feature](api:agents-features-memory::ai.koog.agents.memory.feature): `AgentMemory` 클래스와 AI 에이전트 메모리 기능의 핵심 구현을 포함합니다.
- [ai.koog.agents.local.memory.feature.nodes](api:agents-features-memory::ai.koog.agents.memory.feature.nodes): 서브그래프에서 사용할 수 있는 미리 정의된 메모리 관련 노드들을 포함합니다.
- [ai.koog.agents.local.memory.config](api:agents-features-memory::ai.koog.agents.memory.config): 메모리 작업에 사용되는 메모리 범위에 대한 정의를 제공합니다.
- [ai.koog.agents.local.memory.model](api:agents-features-memory::ai.koog.agents.memory.model): 에이전트가 다양한 컨텍스트와 시간대에서 정보를 저장, 정리 및 검색할 수 있도록 하는 핵심 데이터 구조 및 인터페이스의 정의를 포함합니다.
- [ai.koog.agents.local.memory.feature.history](api:agents-features-memory::ai.koog.agents.memory.feature.history): 과거 세션 활동이나 저장된 메모리에서 특정 개념에 대한 팩트 지식을 검색하고 통합하기 위한 이력 압축 전략을 제공합니다.
- [ai.koog.agents.local.memory.providers](api:agents-features-memory::ai.koog.agents.memory.providers): 구조화되고 컨텍스트를 인식하는 방식으로 지식을 저장하고 검색하기 위한 기본 연산을 정의하는 핵심 인터페이스 및 해당 구현체를 제공합니다.
- [ai.koog.agents.local.memory.storage](api:agents-features-memory::ai.koog.agents.memory.storage): 다양한 플랫폼 및 스토리지 백엔드에 걸친 파일 작업을 위한 핵심 인터페이스 및 특정 구현체를 제공합니다.

## FAQ 및 문제 해결

### 커스텀 메모리 프로바이더는 어떻게 구현하나요?

커스텀 메모리 프로바이더를 구현하려면 `AgentMemoryProvider` 인터페이스를 구현하는 클래스를 생성하십시오:

<!--- INCLUDE
import ai.koog.agents.memory.model.Concept
import ai.koog.agents.memory.model.Fact
import ai.koog.agents.memory.model.MemoryScope
import ai.koog.agents.memory.model.MemorySubject
import ai.koog.agents.memory.providers.AgentMemoryProvider

/* 
// KNIT: Ignore example
-->
<!--- SUFFIX
*/
-->
```kotlin
class MyCustomMemoryProvider : AgentMemoryProvider {
    override suspend fun save(fact: Fact, subject: MemorySubject, scope: MemoryScope) {
        // 팩트 저장을 위한 구현
    }

    override suspend fun load(concept: Concept, subject: MemorySubject, scope: MemoryScope): `List<Fact>` {
        // 개념별 팩트 로드를 위한 구현
    }

    override suspend fun loadAll(subject: MemorySubject, scope: MemoryScope): `List<Fact>` {
        // 모든 팩트 로드를 위한 구현
    }

    override suspend fun loadByDescription(
        description: String,
        subject: MemorySubject,
        scope: MemoryScope
    ): `List<Fact>` {
        // 설명별 팩트 로드를 위한 구현
    }
}
```
<!--- KNIT example-agent-memory-15.kt -->

### 여러 주체로부터 로드할 때 팩트의 우선순위는 어떻게 결정되나요?

팩트는 주체 특이성을 기준으로 우선순위가 결정됩니다. 팩트를 로드할 때 동일한 개념이 여러 주체로부터의 팩트를 가지고 있는 경우, 가장 구체적인 주체의 팩트가 사용됩니다.

### 동일한 개념에 대해 여러 값을 저장할 수 있나요?

네, `MultipleFacts` 유형을 사용하여 가능합니다. 개념을 정의할 때 `factType`을 `FactType.MULTIPLE`로 설정하십시오:
<!--- INCLUDE
import ai.koog.agents.memory.model.Concept
import ai.koog.agents.memory.model.FactType
-->
```kotlin
val concept = Concept(
    keyword = "user-skills",
    description = "Programming languages the user is skilled in",
    factType = FactType.MULTIPLE
)
```
<!--- KNIT example-agent-memory-16.kt -->

이를 통해 개념에 대해 여러 값을 저장할 수 있으며, 검색 시 리스트 형태로 반환됩니다.