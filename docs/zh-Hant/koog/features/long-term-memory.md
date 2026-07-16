# 長期記憶

`LongTermMemory` 功能透過兩組獨立的設定為 Koog AI 代理增加持久性記憶：
- **Retrieval**（檢索） — 使用來自記憶儲存空間的相關上下文（檢索增強生成，即 RAG）來增強 LLM 提示詞。
- **Ingestion**（攝取） — 將對話訊息持久化到記憶儲存空間中，以供未來檢索。

## 快速入門

=== "Kotlin"

    ```kotlin
    val myStorage = InMemoryRecordStorage() // 或您的向量資料庫適配器

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

    agent.run("我們昨天討論了什麼？")
    ```

=== "Java"

    ```java
    InMemoryRecordStorage myStorage = new InMemoryRecordStorage();

    AIAgent agent = AIAgent.builder()
        .promptExecutor(executor)
        .llmModel(OpenAIModels.Chat.GPT4o)
        .systemPrompt("您是一位樂於助人的助手。")
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

    Object result = agent.run("我們昨天討論了什麼？");
    ```

## 僅檢索 (RAG)

當您已有預先填充的知識庫時，請使用不含攝取的檢索：

=== "Kotlin"

    ```kotlin
    install(LongTermMemory) {
        retrieval {
            storage = myVectorDbStorage
            namespace = "my-collection"  // 選填：限定於特定的命名空間/集合
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

### 提示詞增強器 (Prompt Augmenters)

| 增強器 | 行為 |
|---|---|
| `SystemPromptAugmenter()` | 在提示詞開頭插入上下文作為系統訊息（若無系統訊息則不執行任何操作） |
| `UserPromptAugmenter()` | 在最後一則使用者訊息前插入上下文作為獨立的使用者訊息 |
| `PromptAugmenter { prompt, context -> ... }` | 透過 lambda 進行自訂增強 |

### 搜尋查詢提供者 (Search Query Providers)

預設情況下，檢索流程使用最後一則使用者訊息作為搜尋查詢。您可以透過提供 `SearchQueryProvider` 來自訂此行為：

| 提供者 | 行為 |
|---|---|
| `LastUserMessageQueryProvider()` | 使用最後一則使用者訊息的內容（預設） |
| `SearchQueryProvider { prompt -> ... }` | 透過 lambda 進行自訂查詢衍生 |

=== "Kotlin"

    ```kotlin
    install(LongTermMemory) {
        retrieval {
            storage = myStorage
            searchQueryProvider = SearchQueryProvider { prompt ->
                // 合併最後兩則使用者訊息作為搜尋查詢
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

### 搜尋策略 (Search Strategies)

| 策略 | 行為 |
|-----------------------------------------------------------|--------------------------|
| `SimilaritySearchStrategy()` | 向量相似度語義搜尋 — **預設** |
| `query -> new SimilaritySearchRequest(query, 20, 0, 0.0, null)` | 透過 lambda 進行自訂搜尋 |

## 僅攝取

使用不含檢索的攝取來隨著時間建立記憶儲存空間：

=== "Kotlin"

    ```kotlin
    install(LongTermMemory) {
        ingestion {
            storage = myVectorDbStorage
            namespace = "my-collection"  // 選填：限定於特定的命名空間/集合
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

攝取會在代理執行完成時執行一次：最終累積的工作階段提示詞/歷程記錄會以單一批次的形式傳遞給配置的 `documentExtractor`。

## 停用自動行為

預設情況下，檢索和攝取會自動執行（檢索在每次 LLM 呼叫之前執行；攝取在代理完成時執行一次）。您可以停用自動行為，同時仍可從策略節點內存取已配置的儲存空間和策略：

=== "Kotlin"

    ```kotlin
    install(LongTermMemory) {
        retrieval {
            storage = myStorage
            enableAutomaticRetrieval = false  // 不進行自動提示詞增強
        }
        ingestion {
            storage = myStorage
            enableAutomaticIngestion = false  // 不進行自動訊息持久化
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

這為您提供了三種純淨模式：

1. **全自動**（預設）：安裝功能、配置儲存空間 — 檢索和攝取會自動運作。
2. **僅手動**：設定 `enableAutomaticRetrieval = false` / `enableAutomaticIngestion = false`，並在您的圖表策略節點中使用儲存空間和策略。
3. **混合**：將自動攝取與手動檢索結合（反之亦然）。

## 從策略節點存取長期記憶

在策略節點內使用 `withLongTermMemory { }` 來直接搜尋或新增記錄：

```kotlin
val myNode by node<String, Unit> {
    withLongTermMemory {
        // 手動新增記錄
        val record = MemoryRecord(content = "重要事實")
        ingestionStorage?.add(listOf(record), namespace = "my-namespace")

        // 手動搜尋
        val request = SimilaritySearchRequest(queryText = input, limit = 5)
        val results = retrievalStorage?.search(request, namespace = "my-namespace")
    }
}
```

使用 `longTermMemory()` 直接獲取功能執行個體：

```kotlin
val myNode by node<String, Unit> {
    val memory = longTermMemory()
    val storage = memory.ingestionStorage
}
```

## 自訂文件擷取器

實作 `DocumentExtractor` 以控制訊息在儲存前的轉換方式：

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

## 實作自訂儲存空間

實作 `SearchStorage` 和/或 `WriteStorage` 以連接到您的向量資料庫：

```kotlin
class MyVectorDbStorage : SearchStorage<TextDocument, SearchRequest>, WriteStorage<TextDocument> {
    override suspend fun search(
        request: SearchRequest, namespace: String?
    ): List<SearchResult<TextDocument>> {
        // 查詢您的向量資料庫
    }

    override suspend fun add(
        records: List<TextDocument>, namespace: String?
    ): `List<String>` {
        // 更新或插入 (Upsert) 至您的向量資料庫並傳回新增記錄的 ID
    }
}
```

進行測試時，請使用內建的 `InMemoryRecordStorage`，它將記錄保留在記憶體中。它同時支援 `KeywordSearchRequest`（實作方式為不區分大小寫的子字串比對）和 `SimilaritySearchRequest`（實作方式為對不區分大小寫的單字集進行 Jaccard 係數計算）；不使用向量嵌入 (vector embeddings)。