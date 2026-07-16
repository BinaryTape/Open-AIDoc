# Agent 記憶

## 功能概覽

AgentMemory 功能是 Koog 架構的一個組件，讓 AI Agent 能夠在不同的對話中儲存、檢索及使用資訊。

### 目的

AgentMemory 功能透過以下方式解決在 AI Agent 互動中維持上下文的挑戰：

- 儲存從對話中擷取的重要事實。
- 依據概念、主體和作用域組織資訊。
- 在未來的互動中，於需要時檢索相關資訊。
- 根據使用者偏好和歷程記錄實現個性化。

### 架構

AgentMemory 功能建立在階層結構之上。
該結構的元素列出並說明如下。

#### 事實 (Facts)

***事實 (Facts)*** 是儲存在記憶中的單一資訊片段。
事實代表實際儲存的資訊。
共有兩種類型的事實：

- **SingleFact**：與概念相關聯的單一值。例如，IDE 使用者目前偏好的佈景主題：
<!--- INCLUDE
import ai.koog.agents.memory.model.Concept
import ai.koog.agents.memory.model.FactType
import ai.koog.agents.memory.model.SingleFact
import kotlin.time.Clock
-->
```kotlin
// 儲存偏好的 IDE 佈景主題 (單一值)
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
- **MultipleFacts**：與概念相關聯的多個值。例如，使用者知曉的所有語言：
<!--- INCLUDE
import ai.koog.agents.memory.model.Concept
import ai.koog.agents.memory.model.FactType
import ai.koog.agents.memory.model.MultipleFacts
import kotlin.time.Clock
-->
```kotlin
// 儲存程式語言 (多個值)
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

***概念 (Concepts)*** 是帶有相關元資料的資訊類別。

- **Keyword**：概念的唯一識別符號。
- **Description**：概念所代表意義的詳細說明。
- **FactType**：該概念儲存的是單一事實還是多個事實 (`FactType.SINGLE` 或 `FactType.MULTIPLE`)。

#### 主體 (Subjects)

***主體 (Subjects)*** 是事實可以關聯到的實體。

常見的主體範例包括：

- **User**：個人偏好與設定
- **Environment**：與應用程式環境相關的資訊

有一個預定義的 `MemorySubject.Everything`，您可以將其作為所有事實的預設主體。
此外，您可以透過繼承 `MemorySubject` 抽象類別來定義自訂的記憶主體：

<!--- INCLUDE
import ai.koog.agents.memory.model.MemorySubject
import kotlinx.serialization.Serializable
-->
```kotlin
object MemorySubjects {
    /**
     * 特定於本機環境的資訊
     * 範例：已安裝的工具、SDK、作業系統配置、可用指令
     */
    @Serializable
    data object Machine : MemorySubject() {
        override val name: String = "machine"
        override val promptDescription: String =
            "Technical environment (installed tools, package managers, packages, SDKs, OS, etc.)"
        override val priorityLevel: Int = 1
    }

    /**
     * 特定於使用者的資訊
     * 範例：對話偏好、問題歷程記錄、聯絡資訊
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

***記憶作用域 (Memory scopes)*** 是事實適用的上下文：

- **Agent**：特定於某個 Agent。
- **Feature**：特定於某項功能。
- **Product**：特定於某項產品。
- **CrossProduct**：適用於多項產品。

## 配置與初始化

此功能透過 `AgentMemory` 類別與 Agent 管線整合，該類別提供了儲存和載入事實的方法，並可作為一個功能安裝在 Agent 配置中。

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

若要在 Agent 中安裝 AgentMemory 功能，請參考下方程式碼範例中提供的模式。

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

下列程式碼片段展示了記憶儲存的基本設定，以及如何將事實儲存到記憶中或從中載入。

1) 設定記憶儲存
<!--- INCLUDE
import ai.koog.agents.memory.providers.LocalFileMemoryProvider
import ai.koog.agents.memory.providers.LocalMemoryConfig
import ai.koog.agents.memory.storage.SimpleStorage
import ai.koog.rag.base.files.JVMFileSystemProvider
import kotlin.io.path.Path
-->
```kotlin
// 建立記憶提供者
val memoryProvider = LocalFileMemoryProvider(
    config = LocalMemoryConfig("customer-support-memory"),
    storage = SimpleStorage(JVMFileSystemProvider.ReadWrite),
    fs = JVMFileSystemProvider.ReadWrite,
    root = Path("path/to/memory/root")
)
```
<!--- KNIT example-agent-memory-06.kt -->

2) 在記憶中儲存事實
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

3) 檢索事實
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
// 獲取儲存的資訊
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

#### 使用記憶節點

AgentMemory 功能提供了下列預定義的記憶節點，可用於 Agent 策略：

* [nodeLoadAllFactsFromMemory](api:agents-features-memory::ai.koog.agents.memory.feature.nodes.nodeLoadAllFactsFromMemory)：針對給定的概念，從記憶中載入該主體的所有事實。
* [nodeLoadFromMemory](api:agents-features-memory::ai.koog.agents.memory.feature.nodes.nodeLoadFromMemory)：針對給定的概念，從記憶中載入特定事實。
* [nodeSaveToMemory](api:agents-features-memory::ai.koog.agents.memory.feature.nodes.nodeSaveToMemory)：將事實儲存到記憶中。
* [nodeSaveToMemoryAutoDetectFacts](api:agents-features-memory::ai.koog.agents.memory.feature.nodes.nodeSaveToMemoryAutoDetectFacts)：自動偵測並從聊天記錄中擷取事實，並將其儲存到記憶中。使用 LLM 識別概念。

以下是在 Agent 策略中實作節點的範例：

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
    // 自動偵測並儲存事實的節點
    val detectFacts by nodeSaveToMemoryAutoDetectFacts<Unit>(
        subjects = listOf(MemorySubjects.User, MemorySubjects.Machine)
    )

    // 載入特定事實的節點
    val loadPreferences by node<Unit, Unit> {
        withMemory {
            loadFactsToAgent(
                llm = llm,
                concept = Concept("user-preference", "User's preferred programming language", FactType.SINGLE),
                subjects = listOf(MemorySubjects.User)
            )
        }
    }

    // 在策略中連接節點
    edge(nodeStart forwardTo detectFacts)
    edge(detectFacts forwardTo loadPreferences)
    edge(loadPreferences forwardTo nodeFinish)
}
```
<!--- KNIT example-agent-memory-09.kt -->

#### 確保記憶安全

您可以使用加密來確保敏感資訊在記憶提供者使用的加密儲存空間內受到保護。

<!--- INCLUDE
import ai.koog.agents.memory.storage.EncryptedStorage
import ai.koog.rag.base.files.JVMFileSystemProvider
import ai.koog.agents.memory.storage.Aes256GCMEncryptor
-->
```kotlin
// 簡單的加密儲存設定
val secureStorage = EncryptedStorage(
    fs = JVMFileSystemProvider.ReadWrite,
    encryption = Aes256GCMEncryptor("your-secret-key")
)
```
<!--- KNIT example-agent-memory-10.kt -->

#### 範例：記住使用者偏好

以下範例展示了 AgentMemory 如何在真實場景中用於記住使用者的偏好，具體來說是使用者偏好的程式語言。

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

#### 具備記憶功能的自訂節點

您也可以在任何節點內的 `withMemory` 子句中使用記憶功能。開箱即用的 `loadFactsToAgent` 和 `saveFactsFromHistory` 高階抽象化功能可以將事實儲存到歷程記錄、從中載入事實，並更新 LLM 聊天：

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

#### 自動事實偵測

您也可以使用 `nodeSaveToMemoryAutoDetectFacts` 方法要求 LLM 從 Agent 的歷程記錄中偵測所有事實：

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

在上述範例中，LLM 會搜尋與使用者及專案相關的事實，判定概念，並將其存入記憶。

## 最佳實務

1. **從簡易開始**
    - 先從不含加密的基本儲存開始。
    - 在轉向多個事實 (multiple facts) 之前，先使用單一事實 (single facts)。

2. **良好的組織**
    - 使用清晰的概念名稱。
    - 加入有用的說明。
    - 將相關資訊歸類在同一個主體下。

3. **處理錯誤**
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

有關錯誤處理的更多詳細資訊，請參閱[錯誤處理與邊緣情況](#error-handling-and-edge-cases)。

## 錯誤處理與邊緣情況

AgentMemory 功能包含多種機制來處理邊緣情況：

1. **NoMemory 提供者**：預設的實作，不儲存任何內容，在未指定記憶提供者時使用。

2. **主體特異性處理**：載入事實時，該功能會根據定義的 `priorityLevel` 優先載入來自更具體主體的事實。

3. **作用域過濾**：事實可以按作用域進行過濾，以確保僅載入相關資訊。

4. **時間戳記追蹤**：事實儲存時帶有時間戳記，以追蹤其建立時間。

5. **事實類型處理**：該功能支援單一事實和多個事實，並針對每種類型提供適當的處理。

## API 文件

如需與 AgentMemory 功能相關的完整 API 參考，請參閱 [agents-features-memory](api:agents-features-memory::) 模組的參考文件。

特定套件的 API 文件：

- [ai.koog.agents.local.memory.feature](api:agents-features-memory::ai.koog.agents.memory.feature)：包含 `AgentMemory` 類別及 AI Agent 記憶功能的核實實作。
- [ai.koog.agents.local.memory.feature.nodes](api:agents-features-memory::ai.koog.agents.memory.feature.nodes)：包含可用於子圖的預定義記憶相關節點。
- [ai.koog.agents.local.memory.config](api:agents-features-memory::ai.koog.agents.memory.config)：提供記憶操作所使用的記憶作用域定義。
- [ai.koog.agents.local.memory.model](api:agents-features-memory::ai.koog.agents.memory.model)：包含核心資料結構與介面的定義，讓 Agent 能在不同上下文和時間段內儲存、組織及檢索資訊。
- [ai.koog.agents.local.memory.feature.history](api:agents-features-memory::ai.koog.agents.memory.feature.history)：提供歷程記錄壓縮策略，用於檢索並整合來自過去對話活動或已儲存記憶中關於特定概念的事實知識。
- [ai.koog.agents.local.memory.providers](api:agents-features-memory::ai.koog.agents.memory.providers)：提供核心介面及其实作，定義了以結構化、上下文感知的方式儲存及檢索知識的基本操作。
- [ai.koog.agents.local.memory.storage](api:agents-features-memory::ai.koog.agents.memory.storage)：提供核心介面與特定實作，用於跨不同平台與儲存後端的檔案操作。

## 常見問題與疑難排解

### 如何實作自訂的記憶提供者？

要實作自訂的記憶提供者，請建立一個實作 `AgentMemoryProvider` 介面的類別：

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
        // 儲存事實的實作
    }

    override suspend fun load(concept: Concept, subject: MemorySubject, scope: MemoryScope): `List<Fact>` {
        // 依概念載入事實的實作
    }

    override suspend fun loadAll(subject: MemorySubject, scope: MemoryScope): `List<Fact>` {
        // 載入所有事實的實作
    }

    override suspend fun loadByDescription(
        description: String,
        subject: MemorySubject,
        scope: MemoryScope
    ): `List<Fact>` {
        // 依說明載入事實的實作
    }
}
```
<!--- KNIT example-agent-memory-15.kt -->

### 從多個主體載入時，事實的優先級是如何確定的？

事實的優先級是根據主體特異性確定的。載入事實時，如果同一個概念在多個主體中都有事實，則會使用來自最具特異性主體的事實。

### 我可以為同一個概念儲存多個值嗎？

可以，透過使用 `MultipleFacts` 類型。定義概念時，將其 `factType` 設定為 `FactType.MULTIPLE`：
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

這讓您可以為該概念儲存多個值，檢索時會以列表形式回傳。