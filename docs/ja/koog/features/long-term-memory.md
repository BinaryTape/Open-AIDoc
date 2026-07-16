# 長期メモリ (Long-term memory)

`LongTermMemory`機能は、2つの独立した設定グループを介してKoog AIエージェントに永続的なメモリを追加します。
- **Retrieval (検索)** — メモリストレージからの関連するコンテキストを使用してLLMプロンプトを拡張します（検索拡張生成、Retrieval-Augmented Generation または RAG）。
- **Ingestion (取り込み)** — 将来の検索のために、会話メッセージをメモリストレージに永続化します。

## クイックスタート

=== "Kotlin"

    ```kotlin
    val myStorage = InMemoryRecordStorage() // または独自のベクトルDBアダプター

    val agent = AIAgent(
        promptExecutor = executor,
        strategy = singleRunStrategy(),
        agentConfig = agentConfig,
        toolRegistry = ToolRegistry.EMPTY
    ) {
        install(LongTermMemory) {
            retrieval {
                storage = myStorage
                searchStrategy = SimilaritySearchStrategy(topK = 5)
            }
        }
    }

    agent.run("昨日は何を話しましたか？")
    ```

=== "Java"

    ```java
    InMemoryRecordStorage myStorage = new InMemoryRecordStorage();

    AIAgent agent = AIAgent.builder()
        .promptExecutor(executor)
        .llmModel(OpenAIModels.Chat.GPT4o)
        .systemPrompt("You are a helpful assistant.")
        .install(LongTermMemory.Feature, config -> {
            config.retrieval(
                new LongTermMemory.RetrievalSettingsBuilder()
                    .withStorage(myStorage)
                    .withSearchStrategy(
                        SearchStrategy.builder().similarity().withTopK(5).build()
                    )
                    .build()
            );
        })
        .build();

    Object result = agent.run("昨日は何を話しましたか？");
    ```

## Retrievalのみ (RAG)

すでにデータが投入済みの知識ベースがある場合は、取り込み（Ingestion）なしで検索（Retrieval）のみを使用します。

=== "Kotlin"

    ```kotlin
    install(LongTermMemory) {
        retrieval {
            storage = myVectorDbStorage
            namespace = "my-collection"  // オプション：特定のネームスペース/コレクションにスコープを限定
            searchStrategy = SimilaritySearchStrategy(topK = 3, similarityThreshold = 0.7)
            promptAugmenter = SystemPromptAugmenter()
        }
    }
    ```

=== "Java"

    ```java
    var retrievalSettings = new LongTermMemory.RetrievalSettingsBuilder()
        .withStorage(myVectorDbStorage)
        .withSearchStrategy(
            SearchStrategy.builder().similarity().withTopK(3).withSimilarityThreshold(0.7).build()
        )
        .withPromptAugmenter(PromptAugmenter.builder().system().build())
        .build();
    ```

### Prompt Augmenters (プロンプト拡張機能)

| Augmenter | 動作 |
|---|---|
| `SystemPromptAugmenter()` | プロンプトの開始位置にシステムメッセージとしてコンテキストを挿入します（システムメッセージがない場合は何もしません）。 |
| `UserPromptAugmenter()` | 最後のユーザーメッセージの前に、別のユーザーメッセージとしてコンテキストを挿入します。 |
| `PromptAugmenter { prompt, context -> ... }` | ラムダによるカスタム拡張。 |

### Search Query Providers (検索クエリプロバイダー)

デフォルトでは、検索フローは最後のユーザーメッセージを検索クエリとして使用します。`SearchQueryProvider`を指定することで、これをカスタマイズできます。

| Provider | 動作 |
|---|---|
| `LastUserMessageQueryProvider()` | 最後のユーザーメッセージの内容を使用します（デフォルト）。 |
| `SearchQueryProvider { prompt -> ... }` | ラムダによるカスタムクエリ抽出。 |

=== "Kotlin"

    ```kotlin
    install(LongTermMemory) {
        retrieval {
            storage = myStorage
            searchQueryProvider = SearchQueryProvider { prompt ->
                // 直近2つのユーザーメッセージを組み合わせて検索クエリとする
                prompt.messages
                    .filter { it.role == Message.Role.User }
                    .takeLast(2)
                    .joinToString(" ") { it.content }
                    .ifEmpty { null }
            }
        }
    }
    ```

=== "Java"

    ```java
    var retrievalSettings = new LongTermMemory.RetrievalSettingsBuilder()
        .withStorage(myStorage)
        .withSearchQueryProvider(prompt -> {
            var userMessages = prompt.getMessages().stream()
                .filter(m -> m.getRole() == Message.Role.User)
                .toList();
            if (userMessages.isEmpty()) return null;
            return userMessages.get(userMessages.size() - 1).getContent();
        })
        .build();
    ```

### Search Strategies (検索戦略)

| Strategy                                                  | 動作                 |
|-----------------------------------------------------------|--------------------------|
| `SimilaritySearchStrategy()`                              | ベクトル類似性によるセマンティック検索 — **デフォルト** |
| `query -> new SimilaritySearchRequest(query, 20, 0, 0.0, null)` | ラムダによるカスタム検索 |

## Ingestionのみ

RetrievalなしでIngestionのみを使用して、時間の経過とともにメモリストレージを構築します。

=== "Kotlin"

    ```kotlin
    install(LongTermMemory) {
        ingestion {
            storage = myVectorDbStorage
            namespace = "my-collection"  // オプション：特定のネームスペース/コレクションにスコープを限定
            documentExtractor = MessagePassingDocumentExtractor(
                messageRolesToExtract = setOf(Message.Role.User, Message.Role.Assistant)
            )
        }
    }
    ```

=== "Java"

    ```java
    var ingestionSettings = new LongTermMemory.IngestionSettingsBuilder()
        .withStorage(myVectorDbStorage)
        .withDocumentExtractor(
            DocumentExtractor.builder()
                .filtering()
                .withExtractRoles(new HashSet<>(Arrays.asList(Message.Role.User, Message.Role.Assistant)))
                .build()
        )
        .build();
    ```

取り込み（Ingestion）は、エージェントの実行完了時に一度だけ実行されます。最終的に蓄積されたセッションのプロンプト/履歴が、単一のバッチとして設定済みの`documentExtractor`に渡されます。

## 自動動作の無効化

デフォルトでは、検索と取り込みは自動的に実行されます（検索は各LLM呼び出しの前に実行され、取り込みはエージェントの完了時に一度実行されます）。自動動作を無効にしながらも、ストラテジーノード内から設定済みのストレージや戦略にアクセスできるようにすることが可能です。

=== "Kotlin"

    ```kotlin
    install(LongTermMemory) {
        retrieval {
            storage = myStorage
            enableAutomaticRetrieval = false  // プロンプトの自動拡張を行わない
        }
        ingestion {
            storage = myStorage
            enableAutomaticIngestion = false  // メッセージの自動永続化を行わない
        }
    }
    ```

=== "Java"

    ```java
    config.retrieval(
        new LongTermMemory.RetrievalSettingsBuilder()
            .withStorage(myStorage)
            .withEnableAutomaticRetrieval(false)
            .build()
    );
    config.ingestion(
        new LongTermMemory.IngestionSettingsBuilder()
            .withStorage(myStorage)
            .withEnableAutomaticIngestion(false)
            .build()
    );
    ```

これにより、以下の3つの明確なモードを利用できます。

1. **フルオート (デフォルト)**: 機能をインストールしてストレージを設定するだけで、検索と取り込みが自動的に動作します。
2. **マニュアルのみ**: `enableAutomaticRetrieval = false` / `enableAutomaticIngestion = false` を設定し、グラフのストラテジーノード内でストレージや戦略を使用します。
3. **ハイブリッド**: 自動取り込みと手動検索を組み合わせる（またはその逆）。

## ストラテジーノードからの長期メモリへのアクセス

ストラテジーノード内で `withLongTermMemory { }` を使用して、レコードの検索や追加を直接行います。

```kotlin
val myNode by node<String, Unit> {
    withLongTermMemory {
        // レコードを手動で追加
        val record = MemoryRecord(content = "重要な事実")
        ingestionStorage?.add(listOf(record), namespace = "my-namespace")

        // 手動で検索
        val request = SimilaritySearchRequest(queryText = input, limit = 5)
        val results = retrievalStorage?.search(request, namespace = "my-namespace")
    }
}
```

`longTermMemory()` を使用して、機能のインスタンスを直接取得します。

```kotlin
val myNode by node<String, Unit> {
    val memory = longTermMemory()
    val storage = memory.ingestionStorage
}
```

## カスタムドキュメント抽出機能 (Custom Document Extractor)

保存前にメッセージがどのように変換されるかを制御するには、`DocumentExtractor`を実装します。

```kotlin
val summarizingExtractor = DocumentExtractor { messages ->
    messages
        .filter { it.role == Message.Role.Assistant }
        .map { MemoryRecord(content = summarize(it.content)) }
}

install(LongTermMemory) {
    ingestion {
        storage = myStorage
        documentExtractor = summarizingExtractor
    }
}
```

## カスタムストレージの実装

独自のベクトルデータベースに接続するには、`SearchStorage` または `WriteStorage`（あるいはその両方）を実装します。

```kotlin
class MyVectorDbStorage : SearchStorage<TextDocument, SearchRequest>, WriteStorage<TextDocument> {
    override suspend fun search(
        request: SearchRequest, namespace: String?
    ): List<SearchResult<TextDocument>> {
        // ベクトルDBにクエリを実行
    }

    override suspend fun add(
        records: List<TextDocument>, namespace: String?
    ): `List<String>` {
        // ベクトルDBにアップサートを実行し、追加されたレコードのIDを返します
    }
}
```

テスト用には、レコードをメモリ内に保持する組み込みの `InMemoryRecordStorage` を使用してください。これは `KeywordSearchRequest`（大文字小文字を区別しない部分一致として実装）と `SimilaritySearchRequest`（大文字小文字を区別しない単語セットに対するジャカード係数として実装）の両方をサポートしています。ベクトル埋め込み（embeddings）は使用されません。