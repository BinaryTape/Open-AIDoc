# 代理内存

## 功能概览

AgentMemory 功能是 Koog 框架的一个组件，它允许 AI 代理跨对话存储、检索和使用信息。

### 目的

AgentMemory 功能通过以下方式解决在 AI 代理交互中维持上下文的挑战：

- 存储从对话中提取的重要事实。
- 按概念、主体和作用域组织信息。
- 在未来的交互中需要时检索相关信息。
- 基于用户偏好和历史记录实现个性化。

### 架构

AgentMemory 功能基于层次结构构建。
该结构的元素在以下章节中列出并说明。

#### 事实 (Facts)

***事实***是存储在内存中的单个信息片段。
事实代表实际存储的信息。
共有两种类型的事实：

- **SingleFact**：与某个概念关联的单个值。例如，IDE 用户当前首选的主题：
<!--- INCLUDE
import ai.koog.agents.memory.model.Concept
import ai.koog.agents.memory.model.FactType
import ai.koog.agents.memory.model.SingleFact
import kotlin.time.Clock
-->
```kotlin
// 存储首选 IDE 主题（单个值）
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
- **MultipleFacts**：与某个概念关联的多个值。例如，用户掌握的所有语言：
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

***概念***是带有相关元数据的信息类别。

- **Keyword**：概念的唯一标识符。
- **Description**：对概念所代表内容的详细解释。
- **FactType**：概念存储的是单个事实还是多个事实（`FactType.SINGLE` 或 `FactType.MULTIPLE`）。

#### 主体 (Subjects)

***主体***是事实可以关联的实体。

常见的主体示例包括：

- **User**：个人偏好和设置
- **Environment**：与应用程序环境相关的信息

存在一个预定义的 `MemorySubject.Everything`，您可以将其作为所有事实的默认主体。
此外，您可以通过扩展 `MemorySubject` 抽象类来定义自己的自定义内存主体：

<!--- INCLUDE
import ai.koog.agents.memory.model.MemorySubject
import kotlinx.serialization.Serializable
-->
```kotlin
object MemorySubjects {
    /**
     * 特定于本地机器环境的信息
     * 示例：安装的工具、SDK、操作系统配置、可用命令
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

***内存作用域***是事实相关的上下文：

- **Agent**：特定于某个代理。
- **Feature**：特定于某个功能。
- **Product**：特定于某个产品。
- **CrossProduct**：跨多个产品相关。

## 配置与初始化

该功能通过 `AgentMemory` 类与代理流水线集成，该类提供了保存和加载事实的方法，并且可以作为代理配置中的一个功能进行安装。

### 配置

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

### 安装

要在代理中安装 AgentMemory 功能，请遵循下面代码示例中提供的模式。

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

以下代码片段演示了内存存储的基本设置，以及如何向内存保存事实和从内存加载事实。

1) 设置内存存储
<!--- INCLUDE
import ai.koog.agents.memory.providers.LocalFileMemoryProvider
import ai.koog.agents.memory.providers.LocalMemoryConfig
import ai.koog.agents.memory.storage.SimpleStorage
import ai.koog.rag.base.files.JVMFileSystemProvider
import kotlin.io.path.Path
-->
```kotlin
// 创建一个内存提供程序
val memoryProvider = LocalFileMemoryProvider(
    config = LocalMemoryConfig("customer-support-memory"),
    storage = SimpleStorage(JVMFileSystemProvider.ReadWrite),
    fs = JVMFileSystemProvider.ReadWrite,
    root = Path("path/to/memory/root")
)
```
<!--- KNIT example-agent-memory-06.kt -->

2) 在内存中存储一个事实
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

#### 使用内存节点

AgentMemory 功能提供了以下预定义的内存节点，可用于代理策略：

* [nodeLoadAllFactsFromMemory](api:agents-features-memory::ai.koog.agents.memory.feature.nodes.nodeLoadAllFactsFromMemory)：为给定概念从内存中加载关于主体的所有事实。
* [nodeLoadFromMemory](api:agents-features-memory::ai.koog.agents.memory.feature.nodes.nodeLoadFromMemory)：为给定概念从内存中加载特定事实。
* [nodeSaveToMemory](api:agents-features-memory::ai.koog.agents.memory.feature.nodes.nodeSaveToMemory)：将一个事实保存到内存中。
* [nodeSaveToMemoryAutoDetectFacts](api:agents-features-memory::ai.koog.agents.memory.feature.nodes.nodeSaveToMemoryAutoDetectFacts)：自动从聊天历史记录中检测并提取事实，并将其保存到内存中。使用 LLM 来识别概念。

以下是在代理策略中如何实现节点的示例：

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
    // 自动检测并保存事实的节点
    val detectFacts by nodeSaveToMemoryAutoDetectFacts<Unit>(
        subjects = listOf(MemorySubjects.User, MemorySubjects.Machine)
    )

    // 加载特定事实的节点
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

#### 确保内存安全

您可以使用加密来确保敏感信息在内存提供程序使用的加密存储中得到保护。

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

以下是一个 AgentMemory 在真实场景中用于记住用户偏好（特别是用户首选的编程语言）的示例。

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

#### 带有内存的自定义节点

您也可以在任何节点内的 `withMemory` 子句中使用内存。开箱即用的 `loadFactsToAgent` 和 `saveFactsFromHistory` 高级抽象可以将事实保存到历史记录、从中加载事实并更新 LLM 聊天：

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

您还可以要求 LLM 使用 `nodeSaveToMemoryAutoDetectFacts` 方法从代理的历史记录中检测所有事实：

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

在上面的示例中，LLM 将搜索与用户相关的事实和与项目相关的事实，确定概念，并将其保存到内存中。

## 最佳做法

1. **从简单开始**
    - 从不带加密的基本存储开始
    - 在转向多个事实之前，先使用单个事实

2. **良好组织**
    - 使用清晰的概念名称
    - 添加有用的描述
    - 将相关信息保持在同一个主体下

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

有关错误处理的更多详情，请参阅[错误处理和边缘情况](#error-handling-and-edge-cases)。

## 错误处理和边缘情况

AgentMemory 功能包含了多种处理边缘情况的机制：

1. **NoMemory 提供程序**：一个默认实现，不存储任何内容，在未指定内存提供程序时使用。

2. **主体特异性处理**：加载事实时，该功能会根据定义的 `priorityLevel` 优先处理来自更具体主体的事实。

3. **作用域过滤**：可以按作用域过滤事实，以确保仅加载相关信息。

4. **时间戳跟踪**：事实与时间戳一起存储，以跟踪它们的创建时间。

5. **事实类型处理**：该功能支持单个事实和多个事实，并为每种类型提供适当的处理。

## API 文档

有关 AgentMemory 功能相关的完整 API 参考，请参阅 [agents-features-memory](api:agents-features-memory::) 模块的参考文档。

特定软件包的 API 文档：

- [ai.koog.agents.local.memory.feature](api:agents-features-memory::ai.koog.agents.memory.feature)：包括 `AgentMemory` 类和 AI 代理内存核心功能的实现。
- [ai.koog.agents.local.memory.feature.nodes](api:agents-features-memory::ai.koog.agents.memory.feature.nodes)：包括可在子图中使用的预定义内存相关节点。
- [ai.koog.agents.local.memory.config](api:agents-features-memory::ai.koog.agents.memory.config)：提供用于内存操作的内存作用域定义。
- [ai.koog.agents.local.memory.model](api:agents-features-memory::ai.koog.agents.memory.model)：包括核心数据结构和接口的定义，这些结构和接口允许代理跨不同上下文和时间段存储、组织和检索信息。
- [ai.koog.agents.local.memory.feature.history](api:agents-features-memory::ai.koog.agents.memory.feature.history)：提供历史压缩策略，用于从过去的会话活动或存储的内存中检索并纳入关于特定概念的事实知识。
- [ai.koog.agents.local.memory.providers](api:agents-features-memory::ai.koog.agents.memory.providers)：提供定义以结构化、上下文感知的方式存储和检索知识的基本操作的核心接口及其实现。
- [ai.koog.agents.local.memory.storage](api:agents-features-memory::ai.koog.agents.memory.storage)：提供用于跨不同平台和存储后端的文操作的核心接口和特定实现。

## 常见问题解答与故障排除

### 如何实现自定义内存提供程序？

要实现自定义内存提供程序，请创建一个实现 `AgentMemoryProvider` 接口的类：

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

事实根据主体特异性确定优先级。加载事实时，如果同一个概念在多个主体中都有事实，将使用来自最具体主体的事实。

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

这允许您为该概念存储多个值，检索时将以列表形式返回。