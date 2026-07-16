# 记忆 (Memory)

## 功能概览

AgentMemory 功能是 Koog 框架的一个组件，它允许 AI Agent 在对话中存储、检索和使用信息。

### 目的

AgentMemory 功能通过以下方式解决在 AI Agent 交互中维持上下文的挑战：

- 存储从对话中提取的重要事实。
- 按概念、主体和作用域组织信息。
- 在未来的交互中根据需要检索相关信息。
- 根据用户偏好和历史记录实现个性化。

### 架构

AgentMemory 功能建立在分层结构之上。
结构的各个元素在下文中列出并进行了解释。

#### 事实 (Facts)

***事实 (Facts)*** 是存储在记忆中的单个信息片段。
事实代表了实际存储的信息。
事实有两种类型：

- **SingleFact**：与一个概念关联的单个值。例如，IDE 用户当前偏好的主题：
<!--- INCLUDE
import ai.koog.agents.memory.model.Concept
import ai.koog.agents.memory.model.FactType
import ai.koog.agents.memory.model.SingleFact
import kotlin.time.Clock
-->
```kotlin
// 存储偏好的 IDE 主题（单个值）
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
- **MultipleFacts**：与一个概念关联的多个值。例如，用户掌握的所有语言：
<!--- INCLUDE
import ai.koog.agents.memory.model.Concept
import ai.koog.agents.memory.model.FactType
import ai.koog.agents.memory.model.MultipleFacts
import kotlin.time.Clock
-->
```kotlin
// 存储编程语言（多个值）
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

#### 概念 (Concepts)

***概念 (Concepts)*** 是带有相关元数据的信息类别。

- **Keyword**：概念的唯一标识符。
- **Description**：对概念所代表内容的详细说明。
- **FactType**：概念存储的是单个事实还是多个事实（`FactType.SINGLE` 或 `FactType.MULTIPLE`）。

#### 主体 (Subjects)

***主体 (Subjects)*** 是可以与事实相关联的实体。

常见的主体示例包括：

- **User**：个人偏好和设置
- **Environment**：与应用程序环境相关的信息

存在一个预定义的 `MemorySubject.Everything`，你可以将其用作所有事实的默认主体。
此外，你还可以通过继承 `MemorySubject` 抽象类来定义自定义的记忆主体：

<!--- INCLUDE
import ai.koog.agents.memory.model.MemorySubject
import kotlinx.serialization.Serializable
-->
```kotlin
object MemorySubjects {
    /**
     * 特定于本地机器环境的信息
     * 示例：已安装的工具、SDK、OS 配置、可用命令
     */
    @Serializable
    data object Machine : MemorySubject() {
        override val name: String = "machine"
        override val promptDescription: String =
            "Technical environment (installed tools, package managers, packages, SDKs, OS, etc.)"
        override val priorityLevel: Int = 1
    }

    /**
     * 特定于用户的信息
     * 示例：对话偏好、问题历史记录、联系信息
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

#### 作用域 (Scopes)

***记忆作用域 (Memory Scopes)*** 是事实相关的上下文：

- **Agent**：特定于某个 Agent。
- **Feature**：特定于某个功能。
- **Product**：特定于某个产品。
- **CrossProduct**：在多个产品之间相关。

## 配置与初始化

该功能通过 `AgentMemory` 类与 Agent 流水线集成，该类提供了保存和加载事实的方法，并且可以作为功能安装在 Agent 配置中。

### 配置 (Configuration)

`AgentMemory.Config` 类是 AgentMemory 功能的配置类。

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

### 安装 (Installation)

要在 Agent 中安装 AgentMemory 功能，请遵循下面代码示例中提供的模式。

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

## 示例与快速入门

### 基本用法

以下代码片段演示了记忆存储的基本设置，以及如何向记忆保存事实和从记忆加载事实。

1) 设置记忆存储
<!--- INCLUDE
import ai.koog.agents.memory.providers.LocalFileMemoryProvider
import ai.koog.agents.memory.providers.LocalMemoryConfig
import ai.koog.agents.memory.storage.SimpleStorage
import ai.koog.rag.base.files.JVMFileSystemProvider
import kotlin.io.path.Path
-->
```kotlin
// 创建一个记忆提供程序
val memoryProvider = LocalFileMemoryProvider(
    config = LocalMemoryConfig("customer-support-memory"),
    storage = SimpleStorage(JVMFileSystemProvider.ReadWrite),
    fs = JVMFileSystemProvider.ReadWrite,
    root = Path("path/to/memory/root")
)
```
<!--- KNIT example-agent-memory-06.kt -->

2) 在记忆中存储一个事实
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

3) 检索事实
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
// 获取存储的信息
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

#### 使用记忆节点

AgentMemory 功能提供了以下预定义的记忆节点，可用于 Agent 策略中：

* [nodeLoadAllFactsFromMemory](api:agents-features-memory::ai.koog.agents.memory.feature.nodes.nodeLoadAllFactsFromMemory)：从记忆中加载特定概念的关于主体的所有事实。
* [nodeLoadFromMemory](api:agents-features-memory::ai.koog.agents.memory.feature.nodes.nodeLoadFromMemory)：从记忆中加载特定概念的具体事实。
* [nodeSaveToMemory](api:agents-features-memory::ai.koog.agents.memory.feature.nodes.nodeSaveToMemory)：向记忆保存一个事实。
* [nodeSaveToMemoryAutoDetectFacts](api:agents-features-memory::ai.koog.agents.memory.feature.nodes.nodeSaveToMemoryAutoDetectFacts)：自动从聊天历史记录中检测并提取事实，并将其保存到记忆中。使用 LLM 来识别概念。

以下是在 Agent 策略中实现节点的示例：

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
    // 用于自动检测并保存事实的节点
    val detectFacts by nodeSaveToMemoryAutoDetectFacts<Unit>(
        subjects = listOf(MemorySubjects.User, MemorySubjects.Machine)
    )

    // 用于加载特定事实的节点
    val loadPreferences by node<Unit, Unit> {
        withMemory {
            loadFactsToAgent(
                llm = llm,
                concept = Concept("user-preference", "User's preferred programming language", FactType.SINGLE),
                subjects = listOf(MemorySubjects.User)
            )
        }
    }

    // 在策略中连接节点
    edge(nodeStart forwardTo detectFacts)
    edge(detectFacts forwardTo loadPreferences)
    edge(loadPreferences forwardTo nodeFinish)
}
```
<!--- KNIT example-agent-memory-09.kt -->

#### 保护记忆安全

你可以使用加密技术来确保敏感信息在记忆提供程序使用的加密存储中受到保护。

<!--- INCLUDE
import ai.koog.agents.memory.storage.EncryptedStorage
import ai.koog.rag.base.files.JVMFileSystemProvider
import ai.koog.agents.memory.storage.Aes256GCMEncryptor
-->
```kotlin
// 简单的加密存储设置
val secureStorage = EncryptedStorage(
    fs = JVMFileSystemProvider.ReadWrite,
    encryption = Aes256GCMEncryptor("your-secret-key")
)
```
<!--- KNIT example-agent-memory-10.kt -->

#### 示例：记住用户偏好

以下是在真实场景中使用 AgentMemory 记住用户偏好（具体来说是用户偏好的编程语言）的示例。

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

### 高级用法

#### 带有记忆的自定义节点

你还可以在任何节点内的 `withMemory` 子句中使用记忆。现成的 `loadFactsToAgent` 和 `saveFactsFromHistory` 高级抽象可以将事实保存到历史记录、从中加载事实并更新 LLM 聊天：

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

#### 自动事实检测

你还可以使用 `nodeSaveToMemoryAutoDetectFacts` 方法要求 LLM 从 Agent 的历史记录中检测所有事实：

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

在上面的示例中，LLM 将搜索与用户相关的和与项目相关的事实，确定概念，并将其保存到记忆中。

## 最佳做法

1. **从简单开始**
    - 从不带加密的基本存储开始
    - 在过渡到多个事实之前先使用单个事实

2. **良好组织**
    - 使用清晰的概念名称
    - 添加有用的描述
    - 将相关信息保留在同一主体下

3. **处理错误**
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

有关错误处理的更多详细信息，请参阅[错误处理和边缘情况](#error-handling-and-edge-cases)。

## 错误处理和边缘情况

AgentMemory 功能包含了多种机制来处理边缘情况：

1. **NoMemory 提供程序**：一个不存储任何内容的默认实现，在未指定记忆提供程序时使用。

2. **主体特异性处理**：加载事实时，该功能会根据定义的 `priorityLevel` 优先处理来自更具体主体的事实。

3. **作用域过滤**：可以按作用域过滤事实，以确保仅加载相关信息。

4. **时间戳跟踪**：事实存储时带有时间戳，以便跟踪它们的创建时间。

5. **事实类型处理**：该功能支持单个事实和多个事实，并为每种类型提供适当的处理。

## API 文档

有关 AgentMemory 功能相关的完整 API 参考，请参阅 [agents-features-memory](api:agents-features-memory::) 模块的参考文档。

特定软件包的 API 文档：

- [ai.koog.agents.local.memory.feature](api:agents-features-memory::ai.koog.agents.memory.feature)：包括 `AgentMemory` 类和 AI Agent 记忆功能的核心实现。
- [ai.koog.agents.local.memory.feature.nodes](api:agents-features-memory::ai.koog.agents.memory.feature.nodes)：包括可在子图中使用的预定义记忆相关节点。
- [ai.koog.agents.local.memory.config](api:agents-features-memory::ai.koog.agents.memory.config)：提供用于记忆操作的记忆作用域定义。
- [ai.koog.agents.local.memory.model](api:agents-features-memory::ai.koog.agents.memory.model)：包括核心数据结构和接口的定义，使 Agent 能够跨不同上下文和时间段存储、组织和检索信息。
- [ai.koog.agents.local.memory.feature.history](api:agents-features-memory::ai.koog.agents.memory.feature.history)：提供历史压缩策略，用于从过去的会话活动或存储的记忆中检索和整合关于特定概念的事实知识。
- [ai.koog.agents.local.memory.providers](api:agents-features-memory::ai.koog.agents.memory.providers)：提供核心接口（定义了以结构化、上下文感知的方式存储和检索知识的基本操作）及其实现。
- [ai.koog.agents.local.memory.storage](api:agents-features-memory::ai.koog.agents.memory.storage)：提供核心接口和跨不同平台及存储后端的具体文件操作实现。

## 常见问题解答与故障排除

### 如何实现自定义记忆提供程序？

要实现自定义记忆提供程序，请创建一个实现 `AgentMemoryProvider` 接口的类：

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
        // 保存事实的实现
    }

    override suspend fun load(concept: Concept, subject: MemorySubject, scope: MemoryScope): `List<Fact>` {
        // 按概念加载事实的实现
    }

    override suspend fun loadAll(subject: MemorySubject, scope: MemoryScope): `List<Fact>` {
        // 加载所有事实的实现
    }

    override suspend fun loadByDescription(
        description: String,
        subject: MemorySubject,
        scope: MemoryScope
    ): `List<Fact>` {
        // 按描述加载事实的实现
    }
}
```
<!--- KNIT example-agent-memory-15.kt -->

### 从多个主体加载事实时如何确定优先级？

事实根据主体特异性确定优先级。加载事实时，如果同一个概念在多个主体中都有事实，则将使用来自最具体主体的事实。

### 我可以为同一个概念存储多个值吗？

可以，通过使用 `MultipleFacts` 类型。在定义概念时，将其 `factType` 设置为 `FactType.MULTIPLE`：
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

这允许你为概念存储多个值，这些值将作为列表检索。