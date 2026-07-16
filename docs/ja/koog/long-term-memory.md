# 長期メモリ機能 (試験的)

`LongTermMemory` 機能は、2つの独立した設定グループを介して Koog AI エージェントに永続的なメモリを追加します。
- **リトリーバル (Retrieval)** — メモリストレージからの関連するコンテキストを使用して LLM プロンプトを強化します (検索拡張生成：Retrieval-Augmented Generation、または RAG)
- **インジェスチョン (Ingestion)** — 将来のリトリーバルのために、会話メッセージをメモリストレージに保存（永続化）します

## クイックスタート

> **注意:** `LongTermMemory` は試験的な API です。コードに `@OptIn(ExperimentalAgentsApi::class)` を付与するか、ファイルの先頭に `@file:OptIn(ExperimentalAgentsApi::class)` を追加してください。

```kotlin
@OptIn(ExperimentalAgentsApi::class)
val storage = InMemoryRecordStorage() // またはベクトル DB アダプター

@OptIn(ExperimentalAgentsApi::class)
val agent = AIAgent(
    promptExecutor = executor,
    strategy = singleRunStrategy(),
    agentConfig = agentConfig,
    toolRegistry = ToolRegistry.EMPTY
) {
    install(LongTermMemory) {
        retrieval {
            storage = storage
            searchStrategy = KeywordSearchStrategy(topK = 5)
        }
        ingestion {
            storage = storage
        }
    }
}

agent.run("What did we discuss yesterday?")
```

## リトリーバルのみ (RAG)

すでにデータが投入済みのナレッジベースがある場合は、インジェスチョンなしでリトリーバルを使用します。

```kotlin
@OptIn(ExperimentalAgentsApi::class)
install(LongTermMemory) {
    retrieval {
        storage = myVectorDbStorage
        namespace = "my-collection"  // オプション：特定のネームスペース/コレクションにスコープを制限
        searchStrategy = SimilaritySearchStrategy(topK = 3, similarityThreshold = 0.7)
        promptAugmenter = SystemPromptAugmenter()
    }
}
```

### プロンプトオーグメンター (Prompt Augmenters)

| オーグメンター | 動作 |
|---|---|
| `SystemPromptAugmenter()` | プロンプトの先頭にシステムメッセージとしてコンテキストを挿入します（システムメッセージがない場合は何もしません） |
| `UserPromptAugmenter()` | 最後のユーザーメッセージの前に、別のユーザーメッセージとしてコンテキストを挿入します |
| `PromptAugmenter { prompt, context -> ... }` | ラムダによるカスタム拡張 |

## インジェスチョンのみ

時間をかけてメモリストレージを構築していくには、リトリーバルなしでインジェスチョンを使用します。

```kotlin
@OptIn(ExperimentalAgentsApi::class)
install(LongTermMemory) {
    ingestion {
        storage = myVectorDbStorage
        namespace = "my-collection"  // オプション：特定のネームスペース/コレクションにスコープを制限
        extractor = FilteringMemoryRecordExtractor(
            messageRolesToExtract = setOf(Message.Role.User, Message.Role.Assistant)
        )
        timing = IngestionTiming.ON_LLM_CALL
    }
}
```

### インジェスチョンのタイミング (Ingestion Timing)

| タイミング | 動作 |
|---|---|
| `ON_LLM_CALL` | 各 LLM 呼び出し/ストリーム時にメッセージを取り込みます（セッション内 RAG を有効にします） |
| `ON_AGENT_COMPLETION` | エージェントの実行が完了したときに、すべてのメッセージを一括で取り込みます |

## ストラテジーノードからの長期メモリへのアクセス

ストラテジーノード内で `withLongTermMemory { }` を使用して、レコードを直接検索または追加できます。

```kotlin
@OptIn(ExperimentalAgentsApi::class)
val myNode by node<String, Unit> {
    withLongTermMemory {
        // レコードを手動で追加
        val record = MemoryRecord(content = "important fact")
        this.getIngestionStorage()?.add(listOf(record), ingestionSettings?.namespace)

        // 手動で検索
        val request = SimilaritySearchRequest(query = input, limit = 5)
        val results = this.getRetrievalStorage()?.search(request, retrievalSettings?.namespace)
    }
}
```

`longTermMemory()` を使用して、機能のインスタンスを直接取得することもできます。

```kotlin
@OptIn(ExperimentalAgentsApi::class)
val myNode by node<String, Unit> {
    val memory = longTermMemory()
    val storage = memory.getIngestionStorage()
}
```

## カスタムメモリレコードエクストラクター

保存前にメッセージをどのように変換するかを制御するには、`MemoryRecordExtractor` を実装します。

```kotlin
@OptIn(ExperimentalAgentsApi::class)
val summarizingExtractor = MemoryRecordExtractor { messages ->
    messages
        .filter { it.role == Message.Role.Assistant }
        .map { MemoryRecord(content = summarize(it.content)) }
}

install(LongTermMemory) {
    ingestion {
        storage = myStorage
        extractor = summarizingExtractor
    }
}
```

## カスタム検索リクエスト

ユーザーのクエリがどのように検索リクエストに変換されるかを制御するには、ラムダで `searchStrategy` を使用します。

```kotlin
@OptIn(ExperimentalAgentsApi::class)
install(LongTermMemory) {
    retrieval {
        storage = myStorage
        searchStrategy = SearchStrategy { query ->
            SimilaritySearchRequest(query = rephrase(query), limit = 10)
        }
    }
}
```

## カスタムストレージの実装

独自のベクトルデータベースに接続するには、`RetrievalStorage` または `IngestionStorage`（あるいはその両方）を実装します。

```kotlin
class MyVectorDbStorage : RetrievalStorage, IngestionStorage {
    override suspend fun search(
        request: SearchRequest, namespace: String?
    ): `List<SearchResult>` {
        // ベクトル DB へのクエリ
    }

    override suspend fun add(
        records: List<MemoryRecord>, namespace: String?
    ) {
        // ベクトル DB へのアップサート (更新・挿入)
    }
}
```

テスト用には、キーワードベースの検索でレコードをメモリ内に保持する、組み込みの `InMemoryRecordStorage` を使用してください。