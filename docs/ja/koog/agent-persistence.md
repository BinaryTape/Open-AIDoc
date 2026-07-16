# エージェントの永続化 (Agent Persistence)

エージェントの永続化（Agent Persistence）は、KoogフレームワークにおけるAIエージェントにチェックポイント機能を提供する機能です。
これにより、実行中の特定のポイントでエージェントの状態を保存および復元できるようになり、次のような機能が可能になります：

- 特定のポイントからのエージェント実行の再開
- 以前の状態へのロールバック
- セッションをまたいだエージェント状態の保持

## 主要な概念 (Key concepts)

### チェックポイント (Checkpoints)

チェックポイントは、実行中の特定の時点におけるエージェントの完全な状態をキャプチャします。これには以下が含まれます：

- メッセージ履歴（ユーザー、システム、アシスタント、ツール間のすべてのやり取り）
- 現在実行中のノード
- 現在のノードへの入力データ
- 作成時のタイムスタンプ

チェックポイントは一意のIDによって識別され、特定のエージェントに関連付けられます。

## インストール

エージェントの永続化機能を使用するには、エージェントの設定に追加します：

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
        // スナップショット用にインメモリ・ストレージを使用
        storage = InMemoryPersistenceStorageProvider()
    }
}
```

<!--- KNIT example-agent-persistence-01.kt -->

## 設定オプション

エージェントの永続化機能には、主に3つの設定オプションがあります：

- **ストレージプロバイダー (Storage provider)**: チェックポイントの保存と取得に使用されるプロバイダー。
- **継続的な永続化 (Continuous persistence)**: 各ノードの実行後にチェックポイントを自動的に作成します。
- **ロールバック戦略 (Rollback strategy)**: チェックポイントにロールバックする際、どの状態を復元するかを決定します。

### ストレージプロバイダー (Storage provider)

チェックポイントの保存と取得に使用するストレージプロバイダーを設定します：

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

フレームワークには、以下の組み込みプロバイダーが含まれています：

- `InMemoryPersistenceStorageProvider`: チェックポイントをメモリに保存します（アプリケーションの再起動時に失われます）。
- `FilePersistenceStorageProvider`: チェックポイントをファイルシステムに永続化します。
- `NoPersistenceStorageProvider`: チェックポイントを保存しない、何もしない（no-op）実装です。これがデフォルトのプロバイダーです。

また、`PersistenceStorageProvider` インターフェースを実装することで、カスタムストレージプロバイダーを実装することも可能です。
詳細については、[カスタムストレージプロバイダー](#カスタムストレージプロバイダー) を参照してください。

### 継続的な永続化 (Continuous persistence)

継続的な永続化とは、各ノードの実行後にチェックポイントが自動的に作成されることを意味します。
継続的な永続化を無効にするには、以下のコードを使用します：

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

継続的な永続化が無効になっている場合でも、手動でチェックポイントを作成することができます。

## 基本的な使い方

### チェックポイントの作成

エージェント実行中の特定のポイントでチェックポイントを作成する方法については、以下のコードサンプルを参照してください：

<!--- INCLUDE
import ai.koog.agents.core.agent.context.AIAgentContext
import ai.koog.agents.snapshot.feature.persistence
import ai.koog.serialization.typeToken

const val outputData = "some-output-data"
val outputType = typeToken<String>()
-->

```kotlin
suspend fun example(context: AIAgentContext) {
    // 現在の状態のチェックポイントを作成する
    val checkpoint = context.persistence().createCheckpointAfterNode(
        agentContext = context,
        nodePath = context.executionInfo.path(),
        lastOutput = outputData,
        lastOutputType = outputType,
        checkpointId = context.runId,
        version = 0L
    )

    // チェックポイントIDは後で使用するために保存できます
    val checkpointId = checkpoint?.checkpointId
}
```

<!--- KNIT example-agent-persistence-04.kt -->

### チェックポイントからの復元

特定のチェックポイントからエージェントの状態を復元するには、以下のコードサンプルに従ってください：

<!--- INCLUDE
import ai.koog.agents.core.agent.context.AIAgentContext
import ai.koog.agents.snapshot.feature.persistence
-->

```kotlin
suspend fun example(context: AIAgentContext, checkpointId: String) {
    // 特定のチェックポイントにロールバックする
    context.persistence().rollbackToCheckpoint(checkpointId, context)

    // または、最新のチェックポイントにロールバックする
    context.persistence().rollbackToLatestCheckpoint(context)
}
```

<!--- KNIT example-agent-persistence-05.kt -->

#### ツールによって生成されたすべての副作用をロールバックする

一部のツールが副作用を生じさせることはよくあります。特に、バックエンドでエージェントを実行している場合、一部のツールはデータベーストランザクションなどを実行する可能性があります。これにより、エージェントが「過去に遡る」ことが非常に困難になります。

例えば、データベースに新しいユーザーを作成する `createUser` というツールがあるとします。エージェントは時間の経過とともに複数のツール呼び出しを蓄積してきました：
```
tool call: createUser "Alex"

->>>> checkpoint-1 <<<<-

tool call: createUser "Daniel"
tool call: createUser "Maria"
```

ここで、チェックポイントにロールバックしたいとします。エージェントの状態（メッセージ履歴や戦略グラフのノードを含む）を復元するだけでは、チェックポイント前の世界の正確な状態を実現するには不十分です。ツール呼び出しによって生成された副作用も復元（取り消し）する必要があります。この例では、データベースから `Maria` と `Daniel` を削除することを意味します。

Koog Persistenceでは、`Persistence` 機能の設定に `RollbackToolRegistry` を提供することで、これを実現できます：

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
        // 目的の実行ポイントにロールバックする際、すべての `createUser` ツール呼び出しに対して、
        // 逆順で `removeUser` が呼び出されます。
        // 注：`removeUser` ツールは `createUser` と全く同じ引数を取る必要があります。
        // `removeUser` の呼び出しが `createUser` のすべての副作用をロールバックすることを保証するのは開発者の責任です：
        registerRollback(::createUser, ::removeUser)
    }
}
```

<!--- KNIT example-agent-persistence-06.kt -->

### 拡張関数の使用

Agent Persistence機能は、チェックポイントを操作するための便利な拡張関数を提供します：

<!--- INCLUDE
import ai.koog.agents.core.agent.context.AIAgentContext
import ai.koog.agents.example.exampleAgentPersistence04.outputData
import ai.koog.agents.example.exampleAgentPersistence04.outputType
import ai.koog.agents.snapshot.feature.persistence
import ai.koog.agents.snapshot.feature.withPersistence
-->

```kotlin
suspend fun example(context: AIAgentContext) {
    // チェックポイント機能にアクセスする
    val checkpointFeature = context.persistence()

    // または、チェックポイント機能を使用してアクションを実行する
    context.withPersistence { ctx ->
        // 'this' はチェックポイント機能です
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

## 高度な使い方

### カスタムストレージプロバイダー

`PersistenceStorageProvider` インターフェースを実装することで、独自のストレージプロバイダーを実装できます：

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
        TODO("未実装")
    }

    override suspend fun saveCheckpoint(sessionId: String, agentCheckpointData: AgentCheckpointData) {
        TODO("未実装")
    }

    override suspend fun getLatestCheckpoint(sessionId: String, filter: MyFilterType?): AgentCheckpointData? {
        TODO("未実装")
    }
}

```

<!--- KNIT example-agent-persistence-08.kt -->

カスタムプロバイダーを使用するには、エージェントで Agent Persistence 機能を設定する際に、`storage` として設定します。

<!--- INCLUDE
import ai.koog.agents.core.agent.AIAgent
import ai.koog.agents.snapshot.feature.AgentCheckpointData
import ai.koog.agents.snapshot.feature.Persistence
import ai.koog.agents.snapshot.providers.PersistenceStorageProvider
import ai.koog.prompt.executor.llms.all.simpleOllamaAIExecutor
import ai.koog.prompt.executor.ollama.client.OllamaModels

class MyCustomStorageProvider<MyFilterType> : PersistenceStorageProvider<MyFilterType> {
    override suspend fun getCheckpoints(sessionId: String, filter: MyFilterType?): `List<AgentCheckpointData>` {
        TODO("未実装")
    }

    override suspend fun saveCheckpoint(sessionId: String, agentCheckpointData: AgentCheckpointData) {
        TODO("未実装")
    }

    override suspend fun getLatestCheckpoint(sessionId: String, filter: MyFilterType?): AgentCheckpointData? {
        TODO("未実装")
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

### 実行ポイントの設定

高度な制御のために、エージェントの実行ポイントを直接設定できます：

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
    // 特定のノードの前に実行ポイントを設定し、そのノードへの入力を提供できます：
    context.persistence().setExecutionPoint(
        agentContext = context,
        nodePath = context.executionInfo.path(),
        messageHistory = customMessageHistory,
        input = customInput
    )

    // または、特定のノードの後に実行ポイントを設定し、そのノードからの出力を提供できます：
    context.persistence().setExecutionPointAfterNode(
        agentContext = context,
        nodePath = context.executionInfo.path(),
        messageHistory = customMessageHistory,
        output = customOutput
    )
}

```

<!--- KNIT example-agent-persistence-10.kt -->

これにより、単なるチェックポイントからの復元を超えて、エージェントの状態をよりきめ細かく制御することが可能になります。