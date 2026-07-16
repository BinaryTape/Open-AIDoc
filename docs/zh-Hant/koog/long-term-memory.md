# 長期記憶功能 (實驗性)

`LongTermMemory` 功能透過兩組獨立的設定為 Koog AI 代理增加持久性記憶：
- **檢索 (Retrieval)** — 透過來自存儲空間的相關上下文增強 LLM 提示詞 (檢索增強生成，簡稱 RAG)
- **擷取 (Ingestion)** — 將對話訊息持久化到存儲空間中，以便未來檢索

## 快速入門

> **注意：** `LongTermMemory` 是實驗性 API。請在您的程式碼加上 `@OptIn(ExperimentalAgentsApi::class)` 註解，或在檔案頂部添加 `@file:OptIn(ExperimentalAgentsApi::class)`。

```kotlin
@OptIn(ExperimentalAgentsApi::class)
val storage = InMemoryRecordStorage() // 或您的向量資料庫轉接器

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

## 僅限檢索 (RAG)

當您已有預先填充的知識庫時，可以使用不含擷取的檢索功能：

```kotlin
@OptIn(ExperimentalAgentsApi::class)
install(LongTermMemory) {
    retrieval {
        storage = myVectorDbStorage
        namespace = "my-collection"  // 選填：限定於特定的命名空間/集合
        searchStrategy = SimilaritySearchStrategy(topK = 3, similarityThreshold = 0.7)
        promptAugmenter = SystemPromptAugmenter()
    }
}
```

### 提示詞增強器

| 增強器 | 行為 |
|---|---|
| `SystemPromptAugmenter()` | 在提示詞開頭將上下文作為系統訊息插入 (若無系統訊息則不執行任何操作) |
| `UserPromptAugmenter()` | 在最後一則使用者訊息之前，將上下文作為獨立的使用者訊息插入 |
| `PromptAugmenter { prompt, context -> ... }` | 透過 lambda 進行自訂增強 |

## 僅限擷取

使用不含檢索的擷取功能隨時間建立記憶存儲：

```kotlin
@OptIn(ExperimentalAgentsApi::class)
install(LongTermMemory) {
    ingestion {
        storage = myVectorDbStorage
        namespace = "my-collection"  // 選填：限定於特定的命名空間/集合
        extractor = FilteringMemoryRecordExtractor(
            messageRolesToExtract = setOf(Message.Role.User, Message.Role.Assistant)
        )
        timing = IngestionTiming.ON_LLM_CALL
    }
}
```

### 擷取時機

| 時機 | 行為 |
|---|---|
| `ON_LLM_CALL` | 在每次 LLM 呼叫/串流時擷取訊息 (啟用工作階段內 RAG) |
| `ON_AGENT_COMPLETION` | 當代理執行完成時，一次性擷取所有訊息 |

## 從策略節點存取長期記憶

在策略節點內使用 `withLongTermMemory { }` 來直接搜尋或新增記錄：

```kotlin
@OptIn(ExperimentalAgentsApi::class)
val myNode by node<String, Unit> {
    withLongTermMemory {
        // 手動新增記錄
        val record = MemoryRecord(content = "important fact")
        this.getIngestionStorage()?.add(listOf(record), ingestionSettings?.namespace)

        // 手動搜尋
        val request = SimilaritySearchRequest(query = input, limit = 5)
        val results = this.getRetrievalStorage()?.search(request, retrievalSettings?.namespace)
    }
}
```

使用 `longTermMemory()` 直接獲取功能執行個體：

```kotlin
@OptIn(ExperimentalAgentsApi::class)
val myNode by node<String, Unit> {
    val memory = longTermMemory()
    val storage = memory.getIngestionStorage()
}
```

## 自訂記憶記錄擷取器

實作 `MemoryRecordExtractor` 以控制訊息在存儲前的轉換方式：

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

## 自訂搜尋請求

配合 lambda 使用 `searchStrategy` 以控制如何將使用者查詢轉換為搜尋請求：

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

## 實作自訂存儲

實作 `RetrievalStorage` 及/或 `IngestionStorage` 以連接到您的向量資料庫：

```kotlin
class MyVectorDbStorage : RetrievalStorage, IngestionStorage {
    override suspend fun search(
        request: SearchRequest, namespace: String?
    ): `List<SearchResult>` {
        // 查詢您的向量資料庫
    }

    override suspend fun add(
        records: List<MemoryRecord>, namespace: String?
    ) {
        // 更新（Upsert）到您的向量資料庫
    }
}
```

若要進行測試，請使用內建的 `InMemoryRecordStorage`，它會將記錄保存在記憶體中並支援基於關鍵字的搜尋。