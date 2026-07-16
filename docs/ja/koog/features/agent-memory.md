# エージェントメモリ

## 機能の概要

AgentMemory機能は、AIエージェントが会話を通じて情報を保存、取得、および使用できるようにするKoogフレームワークのコンポーネントです。

### 目的

AgentMemory機能は、以下の方法でAIエージェントとのやり取りにおけるコンテキストの維持という課題に対応します。

- 会話から抽出された重要なファクト（事実）を保存する。
- コンセプト、サブジェクト、およびスコープによって情報を整理する。
- 将来のやり取りで必要になったときに、関連情報を取得する。
- ユーザーの好みや履歴に基づいたパーソナライズを可能にする。

### アーキテクチャ

AgentMemory機能は階層構造に基づいています。
構造の構成要素を以下のセクションで列挙し、説明します。

#### ファクト (Facts) 

***ファクト***は、メモリに保存される個々の情報です。
ファクトは、実際に保存された情報を表します。
ファクトには2つのタイプがあります。

- **SingleFact**: コンセプトに関連付けられた単一の値。例えば、IDEユーザーの現在の優先テーマなどです。
<!--- INCLUDE
import ai.koog.agents.memory.model.Concept
import ai.koog.agents.memory.model.FactType
import ai.koog.agents.memory.model.SingleFact
import kotlin.time.Clock
-->
```kotlin
// お気に入りのIDEテーマの保存（単一の値）
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
- **MultipleFacts**: コンセプトに関連付けられた複数の値。例えば、ユーザーが知っているすべての言語などです。
<!--- INCLUDE
import ai.koog.agents.memory.model.Concept
import ai.koog.agents.memory.model.FactType
import ai.koog.agents.memory.model.MultipleFacts
import kotlin.time.Clock
-->
```kotlin
// プログラミング言語の保存（複数の値）
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

#### コンセプト (Concepts) 

***コンセプト***は、関連するメタデータを持つ情報のカテゴリです。

- **キーワード (Keyword)**: コンセプトの一意の識別子。
- **説明 (Description)**: コンセプトが何を表すかについての詳細な説明。
- **FactType**: コンセプトが単一のファクトを保存するか、複数のファクトを保存するか（`FactType.SINGLE` または `FactType.MULTIPLE`）。

#### サブジェクト (Subjects)

***サブジェクト***は、ファクトを関連付けることができるエンティティです。

サブジェクトの一般的な例は以下の通りです。

- **User**: 個人の好みや設定
- **Environment**: アプリケーションの環境に関連する情報

すべてのファクトのデフォルトサブジェクトとして使用できる定義済みの `MemorySubject.Everything` があります。
さらに、`MemorySubject` 抽象クラスを継承することで、独自のカスタムメモリサブジェクトを定義できます。

<!--- INCLUDE
import ai.koog.agents.memory.model.MemorySubject
import kotlinx.serialization.Serializable
-->
```kotlin
object MemorySubjects {
    /**
     * ローカルマシンの環境に特化した情報
     * 例：インストールされているツール、SDK、OS設定、使用可能なコマンド
     */
    @Serializable
    data object Machine : MemorySubject() {
        override val name: String = "machine"
        override val promptDescription: String =
            "Technical environment (installed tools, package managers, packages, SDKs, OS, etc.)"
        override val priorityLevel: Int = 1
    }

    /**
     * ユーザーに特化した情報
     * 例：会話の好み、イシュー履歴、連絡先情報
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

#### スコープ (Scopes) 

***メモリスコープ***は、ファクトが関連性を持つコンテキストです。

- **Agent**: 特定のエージェントに固有。
- **Feature**: 特定の機能に固有。
- **Product**: 特定のプロダクトに固有。
- **CrossProduct**: 複数のプロダクトにわたって関連。

## 設定と初期化

この機能は `AgentMemory` クラスを通じてエージェントパイプラインに統合されます。このクラスはファクトの保存と読み込みのためのメソッドを提供し、エージェント設定に機能（feature）としてインストールできます。

### 設定

`AgentMemory.Config` クラスは、AgentMemory機能の設定クラスです。

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

### インストール

AgentMemory機能をエージェントにインストールするには、以下のコードサンプルに示すパターンに従ってください。

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

## 例とクイックスタート

### 基本的な使用法

以下のコードスニペットは、メモリストレージの基本的なセットアップと、メモリへのファクトの保存および読み込み方法を示しています。

1) メモリストレージのセットアップ
<!--- INCLUDE
import ai.koog.agents.memory.providers.LocalFileMemoryProvider
import ai.koog.agents.memory.providers.LocalMemoryConfig
import ai.koog.agents.memory.storage.SimpleStorage
import ai.koog.rag.base.files.JVMFileSystemProvider
import kotlin.io.path.Path
-->
```kotlin
// メモリプロバイダーの作成
val memoryProvider = LocalFileMemoryProvider(
    config = LocalMemoryConfig("customer-support-memory"),
    storage = SimpleStorage(JVMFileSystemProvider.ReadWrite),
    fs = JVMFileSystemProvider.ReadWrite,
    root = Path("path/to/memory/root")
)
```
<!--- KNIT example-agent-memory-06.kt -->

2) メモリへのファクトの保存
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

3) ファクトの取得
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
// 保存された情報の取得
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

#### メモリノードの使用

AgentMemory機能は、エージェントのストラテジーで使用できる以下の定義済みメモリノードを提供します。

* [nodeLoadAllFactsFromMemory](api:agents-features-memory::ai.koog.agents.memory.feature.nodes.nodeLoadAllFactsFromMemory): 指定されたコンセプトについて、サブジェクトに関するすべてのファクトをメモリから読み込みます。
* [nodeLoadFromMemory](api:agents-features-memory::ai.koog.agents.memory.feature.nodes.nodeLoadFromMemory): 指定されたコンセプトについて、特定のファクトをメモリから読み込みます。
* [nodeSaveToMemory](api:agents-features-memory::ai.koog.agents.memory.feature.nodes.nodeSaveToMemory): ファクトをメモリに保存します。
* [nodeSaveToMemoryAutoDetectFacts](api:agents-features-memory::ai.koog.agents.memory.feature.nodes.nodeSaveToMemoryAutoDetectFacts): チャット履歴からファクトを自動的に検出して抽出し、メモリに保存します。コンセプトの特定にはLLMを使用します。

以下は、エージェントストラテジーでノードを実装する方法の例です。

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
    // ファクトを自動検出して保存するノード
    val detectFacts by nodeSaveToMemoryAutoDetectFacts<Unit>(
        subjects = listOf(MemorySubjects.User, MemorySubjects.Machine)
    )

    // 特定のファクトを読み込むノード
    val loadPreferences by node<Unit, Unit> {
        withMemory {
            loadFactsToAgent(
                llm = llm,
                concept = Concept("user-preference", "User's preferred programming language", FactType.SINGLE),
                subjects = listOf(MemorySubjects.User)
            )
        }
    }

    // ストラテジー内でノードを接続
    edge(nodeStart forwardTo detectFacts)
    edge(detectFacts forwardTo loadPreferences)
    edge(loadPreferences forwardTo nodeFinish)
}
```
<!--- KNIT example-agent-memory-09.kt -->

#### メモリのセキュリティ保護

暗号化を使用することで、メモリプロバイダーが使用する暗号化されたストレージ内で機密情報が確実に保護されるようにできます。

<!--- INCLUDE
import ai.koog.agents.memory.storage.EncryptedStorage
import ai.koog.rag.base.files.JVMFileSystemProvider
import ai.koog.agents.memory.storage.Aes256GCMEncryptor
-->
```kotlin
// シンプルな暗号化ストレージのセットアップ
val secureStorage = EncryptedStorage(
    fs = JVMFileSystemProvider.ReadWrite,
    encryption = Aes256GCMEncryptor("your-secret-key")
)
```
<!--- KNIT example-agent-memory-10.kt -->

#### 例：ユーザーの好みを記憶する

以下は、ユーザーの好み、具体的にはユーザーのお気に入りのプログラミング言語を記憶するためにAgentMemoryが実際のシナリオでどのように使用されるかの例です。

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

### 高度な使用法

#### メモリを使用したカスタムノード

任意のノード内の `withMemory` 句からメモリを使用することもできます。すぐに使用できる `loadFactsToAgent` および `saveFactsFromHistory` という高レベルの抽象化により、履歴へのファクトの保存、履歴からの読み込み、およびLLMチャットの更新が行われます。

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

#### ファクトの自動検出

`nodeSaveToMemoryAutoDetectFacts` メソッドを使用して、LLMにエージェントの履歴からすべてのファクトを検出させることもできます。

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

上記の例では、LLMはユーザー関連のファクトとプロジェクト関連のファクトを検索し、コンセプトを決定して、それらをメモリに保存します。

## ベストプラクティス

1. **シンプルに始める**
    - 暗号化のない基本的なストレージから始める
    - 複数のファクト（MultipleFacts）に移行する前に単一のファクト（SingleFact）を使用する

2. **適切に整理する**
    - 明確なコンセプト名を使用する
    - 役立つ説明を追加する
    - 関連する情報を同じサブジェクトの下に保つ

3. **エラーを処理する**
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

エラー処理の詳細については、[エラー処理とエッジケース](#エラー処理とエッジケース)を参照してください。

## エラー処理とエッジケース

AgentMemory機能には、エッジケースを処理するためのいくつかのメカニズムが含まれています。

1. **NoMemory プロバイダー**: 何も保存しないデフォルトの実装で、メモリプロバイダーが指定されていない場合に使用されます。

2. **サブジェクト特異性の処理**: ファクトを読み込む際、この機能は定義された `priorityLevel` に基づいて、より具体的なサブジェクトからのファクトを優先します。

3. **スコープフィルタリング**: 関連する情報のみが読み込まれるように、ファクトをスコープでフィルタリングできます。

4. **タイムスタンプの追跡**: ファクトは、作成された時期を追跡するためにタイムスタンプとともに保存されます。

5. **ファクトタイプの処理**: この機能は、単一のファクトと複数のファクトの両方をサポートし、それぞれのタイプを適切に処理します。

## API ドキュメント

AgentMemory機能に関連する完全なAPIリファレンスについては、[agents-features-memory](api:agents-features-memory::) モジュールのリファレンスドキュメントを参照してください。

特定のパッケージのAPIドキュメント：

- [ai.koog.agents.local.memory.feature](api:agents-features-memory::ai.koog.agents.memory.feature): `AgentMemory` クラスとAIエージェントメモリ機能のコア実装が含まれています。
- [ai.koog.agents.local.memory.feature.nodes](api:agents-features-memory::ai.koog.agents.memory.feature.nodes): サブグラフで使用できる定義済みのメモリ関連ノードが含まれています。
- [ai.koog.agents.local.memory.config](api:agents-features-memory::ai.koog.agents.memory.config): メモリ操作に使用されるメモリスコープの定義を提供します。
- [ai.koog.agents.local.memory.model](api:agents-features-memory::ai.koog.agents.memory.model): エージェントが異なるコンテキストや期間にわたって情報を保存、整理、および取得できるようにするコアデータ構造とインターフェースの定義が含まれています。
- [ai.koog.agents.local.memory.feature.history](api:agents-features-memory::ai.koog.agents.memory.feature.history): 過去のセッションアクティビティや保存されたメモリから特定のコンセプトに関する事実の知識を取得し、組み込むための履歴圧縮ストラテジーを提供します。
- [ai.koog.agents.local.memory.providers](api:agents-features-memory::ai.koog.agents.memory.providers): 構造化され、コンテキストを認識した方法で知識を保存および取得するための基本的な操作を定義するコアインターフェースとその実装を提供します。
- [ai.koog.agents.local.memory.storage](api:agents-features-memory::ai.koog.agents.memory.storage): 異なるプラットフォームやストレージバックエンドにわたるファイル操作のためのコアインターフェースと特定の実装を提供します。

## FAQ とトラブルシューティング

### カスタムメモリプロバイダーを実装するにはどうすればよいですか？

カスタムメモリプロバイダーを実装するには、`AgentMemoryProvider` インターフェースを実装するクラスを作成します。

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
        // ファクトを保存するための実装
    }

    override suspend fun load(concept: Concept, subject: MemorySubject, scope: MemoryScope): `List<Fact>` {
        // コンセプトによってファクトを読み込むための実装
    }

    override suspend fun loadAll(subject: MemorySubject, scope: MemoryScope): `List<Fact>` {
        // すべてのファクトを読み込むための実装
    }

    override suspend fun loadByDescription(
        description: String,
        subject: MemorySubject,
        scope: MemoryScope
    ): `List<Fact>` {
        // 説明によってファクトを読み込むための実装
    }
}
```
<!--- KNIT example-agent-memory-15.kt -->

### 複数のサブジェクトから読み込む際、ファクトはどのように優先順位付けされますか？

ファクトはサブジェクトの特異性に基づいて優先順位付けされます。ファクトを読み込む際、同じコンセプトに複数のサブジェクトからのファクトがある場合、最も具体的なサブジェクトからのファクトが使用されます。

### 同じコンセプトに対して複数の値を保存できますか？

はい、`MultipleFacts` タイプを使用することで可能です。コンセプトを定義する際に、その `factType` を `FactType.MULTIPLE` に設定してください。
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

これにより、コンセプトに対して複数の値を保存でき、リストとして取得されます。