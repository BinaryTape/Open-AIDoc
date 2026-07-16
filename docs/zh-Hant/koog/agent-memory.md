# Memory

## 功能總覽

AgentMemory 功能是 Koog 架構的一個組件，讓 AI agent 能夠在對話中存儲、檢索和使用資訊。

### 目的

AgentMemory 功能透過以下方式解決 AI agent 互動中維持上下文的挑戰：

- 存儲從對話中提取的重要 Facts。
- 依據 Concepts、Subjects 和 Scopes 組織資訊。
- 在未來的互動中，根據需要檢索相關資訊。
- 根據 User 偏好與歷史記錄實現個人化。

### 架構

AgentMemory 功能建立在階層式結構之上。
下文將列出並解釋該結構的各個元素。

#### Facts 

***Facts*** 是存儲在記憶中的個別資訊片段。 
Facts 代表實際存儲的資訊。
共有兩種類型的 Facts：

- **SingleFact**：與一個 Concept 關聯的單一值。例如，IDE User 目前偏好的佈景主題：
<!--- INCLUDE
import ai.koog.agents.memory.model.Concept
import ai.koog.agents.memory.model.FactType
import ai.koog.agents.memory.model.SingleFact
import kotlin.time.Clock
-->
```kotlin
// Storing favorite IDE theme (single value)
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
- **MultipleFacts**：與一個 Concept 關聯的多個值。例如，User 掌握的所有語言：
<!--- INCLUDE
import ai.koog.agents.memory.model.Concept
import ai.koog.agents.memory.model.FactType
import ai.koog.agents.memory.model.MultipleFacts
import kotlin.time.Clock
-->
```kotlin
// Storing programming languages (multiple values)
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

#### Concepts 

***Concepts*** 是帶有相關元資料的資訊類別。

- **Keyword**：Concept 的唯一識別符。
- **Description**：該 Concept 所代表內容的詳細說明。
- **FactType**：該 Concept 存儲的是單一還是多個 Facts（`FactType.SINGLE` 或 `FactType.MULTIPLE`）。

#### Subjects

***Subjects*** 是可以與 Facts 關聯的實體。

Subjects 的常見範例包括：

- **User**：個人偏好與設定。
- **Environment**：與應用程式環境相關的資訊。

有一個預定義的 `MemorySubject.Everything`，您可以將其作為所有 Facts 的預設 Subject。
此外，您可以透過擴充 `MemorySubject` 抽象類別來定義自訂的 memory subjects：

<!--- INCLUDE
import ai.koog.agents.memory.model.MemorySubject
import kotlinx.serialization.Serializable
-->
```kotlin
object MemorySubjects {
    /**
     * Information specific to the local machine environment
     * Examples: Installed tools, SDKs, OS configuration, available commands
     */
    @Serializable
    data object Machine : MemorySubject() {
        override val name: String = "machine"
        override val promptDescription: String =
            "Technical environment (installed tools, package managers, packages, SDKs, OS, etc.)"
        override val priorityLevel: Int = 1
    }

    /**
     * Information specific to the user
     * Examples: Conversation preferences, issue history, contact information
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

#### Scopes 

***Memory scopes*** 是 Facts 相關的上下文：

- **Agent**：特定於某個 agent。
- **Feature**：特定於某個功能。
- **Product**：特定於某個產品。
- **CrossProduct**：適用於多個產品。

## 配置與初始化

此功能透過 `AgentMemory` 類別與 agent 管線整合，該類別提供了儲存與載入 Facts 的方法，並可以作為 agent 配置中的一個功能進行安裝。

### 配置

`AgentMemory.Config` 類別是 AgentMemory 功能的配置類別。

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

### 安裝

若要在 agent 中安裝 AgentMemory 功能，請遵循下方程式碼範例中提供的模式。

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

## 範例與快速入門

### 基本用法

以下程式碼片段展示了 memory 存儲的基本設定，以及如何將 Facts 儲存至 memory 或從中載入。

1) 設定 memory 存儲
<!--- INCLUDE
import ai.koog.agents.memory.providers.LocalFileMemoryProvider
import ai.koog.agents.memory.providers.LocalMemoryConfig
import ai.koog.agents.memory.storage.SimpleStorage
import ai.koog.rag.base.files.JVMFileSystemProvider
import kotlin.io.path.Path
-->
```kotlin
// Create a memory provider
val memoryProvider = LocalFileMemoryProvider(
    config = LocalMemoryConfig("customer-support-memory"),
    storage = SimpleStorage(JVMFileSystemProvider.ReadWrite),
    fs = JVMFileSystemProvider.ReadWrite,
    root = Path("path/to/memory/root")
)
```
<!--- KNIT example-agent-memory-06.kt -->

2) 在 memory 中存儲一個 Fact
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

3) 檢索 Fact
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
// Get the stored information
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

#### 使用 memory 節點

AgentMemory 功能提供了以下預定義的 memory 節點，可用於 agent 策略：

* [nodeLoadAllFactsFromMemory](api:agents-features-memory::ai.koog.agents.memory.feature.nodes.nodeLoadAllFactsFromMemory)：針對給定的 Concept，從 memory 中載入關於 Subject 的所有 Facts。
* [nodeLoadFromMemory](api:agents-features-memory::ai.koog.agents.memory.feature.nodes.nodeLoadFromMemory)：針對給定的 Concept，從 memory 中載入特定的 Facts。
* [nodeSaveToMemory](api:agents-features-memory::ai.koog.agents.memory.feature.nodes.nodeSaveToMemory)：將一個 Fact 儲存到 memory 中。
* [nodeSaveToMemoryAutoDetectFacts](api:agents-features-memory::ai.koog.agents.memory.feature.nodes.nodeSaveToMemoryAutoDetectFacts)：自動從聊天歷史記錄中偵測並提取 Facts 並將其儲存到 memory 中。使用 LLM 來辨別 Concepts。

以下是節點如何在 agent 策略中實作的範例：

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
    // Node to automatically detect and save facts
    val detectFacts by nodeSaveToMemoryAutoDetectFacts<Unit>(
        subjects = listOf(MemorySubjects.User, MemorySubjects.Machine)
    )

    // Node to load specific facts
    val loadPreferences by node<Unit, Unit> {
        withMemory {
            loadFactsToAgent(
                llm = llm,
                concept = Concept("user-preference", "User's preferred programming language", FactType.SINGLE),
                subjects = listOf(MemorySubjects.User)
            )
        }
    }

    // Connect nodes in the strategy
    edge(nodeStart forwardTo detectFacts)
    edge(detectFacts forwardTo loadPreferences)
    edge(loadPreferences forwardTo nodeFinish)
}
```
<!--- KNIT example-agent-memory-09.kt -->

#### 確保 memory 安全

您可以使用加密功能，確保敏感資訊在 memory provider 使用的加密存儲中受到保護。

<!--- INCLUDE
import ai.koog.agents.memory.storage.EncryptedStorage
import ai.koog.rag.base.files.JVMFileSystemProvider
import ai.koog.agents.memory.storage.Aes256GCMEncryptor
-->
```kotlin
// Simple encrypted storage setup
val secureStorage = EncryptedStorage(
    fs = JVMFileSystemProvider.ReadWrite,
    encryption = Aes256GCMEncryptor("your-secret-key")
)
```
<!--- KNIT example-agent-memory-10.kt -->

#### 範例：記住 User 偏好

以下範例展示了 AgentMemory 如何在實際場景中被用來記住 User 的偏好，具體而言是 User 偏好的程式語言。

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

### 進階用法

#### 帶有 memory 的自定義節點

您也可以在任何節點內部的 `withMemory` 子句中使用 memory。現成的 `loadFactsToAgent` 和 `saveFactsFromHistory` 高階抽象功能可以將 Facts 儲存到歷史記錄、從中載入 Facts，並更新 LLM 聊天內容：

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

#### 自動 Fact 偵測

您也可以使用 `nodeSaveToMemoryAutoDetectFacts` 方法要求 LLM 從 agent 的歷史記錄中偵測所有的 Facts：

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

在上述範例中，LLM 會搜尋與 User 相關及與專案相關的 Facts，確定 Concepts，並將其存儲到 memory 中。

## 最佳實務

1. **從簡單開始**
    - 從不含加密的基本存儲開始。
    - 在過渡到 MultipleFacts 之前先使用單一 Facts。

2. **良好的組織**
    - 使用清晰的 Concept 名稱。
    - 加入有幫助的描述。
    - 將相關資訊保持在同一個 Subject 下。

3. **錯誤處理**
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

有關錯誤處理的更多詳細資訊，請參閱[錯誤處理與邊緣情況](#錯誤處理與邊緣情況)。

## 錯誤處理與邊緣情況

AgentMemory 功能包含多個處理邊緣情況的機制：

1. **NoMemory provider**：一個預設實作，不存儲任何內容，在未指定 memory provider 時使用。

2. **Subject 特異性處理**：載入 Facts 時，此功能會根據定義的 `priorityLevel` 優先載入來自更具特異性 Subjects 的 Facts。

3. **Scope 篩選**：可以按 Scope 篩選 Facts，以確保僅載入相關資訊。

4. **時戳追蹤**：Facts 在存儲時帶有時戳，以追蹤其建立時間。

5. **Fact 類型處理**：此功能支援單一 Facts 和多個 Facts，並對每種類型進行適當處理。

## API 文件

如需與 AgentMemory 功能相關的完整 API 參考，請參閱 [agents-features-memory](api:agents-features-memory::) 模組的參考文件。

特定套件的 API 文件：

- [ai.koog.agents.local.memory.feature](api:agents-features-memory::ai.koog.agents.memory.feature)：包含 `AgentMemory` 類別及 AI agents memory 功能的核心實作。
- [ai.koog.agents.local.memory.feature.nodes](api:agents-features-memory::ai.koog.agents.memory.feature.nodes)：包含可用於子圖的預定義 memory 相關節點。
- [ai.koog.agents.local.memory.config](api:agents-features-memory::ai.koog.agents.memory.config)：提供用於 memory 操作的 memory scopes 定義。
- [ai.koog.agents.local.memory.model](api:agents-features-memory::ai.koog.agents.memory.model)：包含核心資料結構和介面的定義，讓 agents 能夠在不同上下文和時間段內存儲、組織和檢索資訊。
- [ai.koog.agents.local.memory.feature.history](api:agents-features-memory::ai.koog.agents.memory.feature.history)：提供歷史記錄壓縮策略，用於從過去的工作階段活動或存儲的 memory 中檢索並納入關於特定 Concepts 的事實知識。
- [ai.koog.agents.local.memory.providers](api:agents-features-memory::ai.koog.agents.memory.providers)：提供核心介面，定義以結構化、上下文感知的方式存儲和檢索知識的基本操作及其實作。
- [ai.koog.agents.local.memory.storage](api:agents-features-memory::ai.koog.agents.memory.storage)：提供核心介面和特定實作，用於跨不同平台和存儲後端的檔案操作。

## 常見問題與疑難排解

### 如何實作自訂的 memory provider？

若要實作自訂的 memory provider，請建立一個實作 `AgentMemoryProvider` 介面的類別：

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
        // Implementation for saving facts
    }

    override suspend fun load(concept: Concept, subject: MemorySubject, scope: MemoryScope): `List<Fact>` {
        // Implementation for loading facts by concept
    }

    override suspend fun loadAll(subject: MemorySubject, scope: MemoryScope): `List<Fact>` {
        // Implementation for loading all facts
    }

    override suspend fun loadByDescription(
        description: String,
        subject: MemorySubject,
        scope: MemoryScope
    ): `List<Fact>` {
        // Implementation for loading facts by description
    }
}
```
<!--- KNIT example-agent-memory-15.kt -->

### 從多個 Subjects 載入時，Facts 的優先級是如何確定的？

Facts 根據 Subject 的特異性進行排序。載入 Facts 時，如果同一個 Concept 在多個 Subjects 中都有 Facts，則會使用來自最具特異性 Subject 的 Fact。

### 我可以為同一個 Concept 存儲多個值嗎？

可以，透過使用 `MultipleFacts` 類型。定義 Concept 時，將其 `factType` 設定為 `FactType.MULTIPLE`：
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

這讓您可以為該 Concept 存儲多個值，並以清單形式檢索。