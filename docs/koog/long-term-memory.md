# Long Term Memory 功能（实验性）

`LongTermMemory` 功能通过两组独立的设置向 Koog AI agent 添加持久化记忆：
- **检索 (Retrieval)** — 通过存储在存储器中的相关上下文增强 LLM prompt（检索增强生成或 RAG）
- **摄取 (Ingestion)** — 将对话消息持久化到存储器中，以便将来检索

## 快速入门指南

> **注意：**`LongTermMemory` 是实验性 API。请在代码中使用 `@OptIn(ExperimentalAgentsApi::class)` 进行注解，或在文件顶部添加 `@file:OptIn(ExperimentalAgentsApi::class)`。

```kotlin
@OptIn(ExperimentalAgentsApi::class)
val storage = InMemoryRecordStorage() // 或您的向量数据库适配器

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

## 仅检索（RAG）

当您拥有预先填充的知识库时，可以使用检索而不使用摄取：

```kotlin
@OptIn(ExperimentalAgentsApi::class)
install(LongTermMemory) {
    retrieval {
        storage = myVectorDbStorage
        namespace = "my-collection"  // 可选：限定到特定的命名空间/集合
        searchStrategy = SimilaritySearchStrategy(topK = 3, similarityThreshold = 0.7)
        promptAugmenter = SystemPromptAugmenter()
    }
}
```

### Prompt 增强器

| 增强器 | 行为 |
|---|---|
| `SystemPromptAugmenter()` | 在 Prompt 开始处以系统消息形式插入上下文（如果没有系统消息，则不执行任何操作） |
| `UserPromptAugmenter()` | 在最后一条用户消息之前以单独的用户消息形式插入上下文 |
| `PromptAugmenter { prompt, context -> ... }` | 通过 lambda表达式 进行自定义增强 |

## 仅摄取

使用摄取而不使用检索，以随时间推移构建记忆存储：

```kotlin
@OptIn(ExperimentalAgentsApi::class)
install(LongTermMemory) {
    ingestion {
        storage = myVectorDbStorage
        namespace = "my-collection"  // 可选：限定到特定的命名空间/集合
        extractor = FilteringMemoryRecordExtractor(
            messageRolesToExtract = setOf(Message.Role.User, Message.Role.Assistant)
        )
        timing = IngestionTiming.ON_LLM_CALL
    }
}
```

### 摄取时机

| 时机 | 行为 |
|---|---|
| `ON_LLM_CALL` | 在每次 LLM 调用/流式传输时摄取消息（启用会话内 RAG） |
| `ON_AGENT_COMPLETION` | 在 agent 运行完成时一次性摄取所有消息 |

## 从策略节点访问长期记忆

在策略节点内部使用 `withLongTermMemory { }` 来直接搜索或添加记录：

```kotlin
@OptIn(ExperimentalAgentsApi::class)
val myNode by node<String, Unit> {
    withLongTermMemory {
        // 手动添加记录
        val record = MemoryRecord(content = "important fact")
        this.getIngestionStorage()?.add(listOf(record), ingestionSettings?.namespace)

        // 手动搜索
        val request = SimilaritySearchRequest(query = input, limit = 5)
        val results = this.getRetrievalStorage()?.search(request, retrievalSettings?.namespace)
    }
}
```

使用 `longTermMemory()` 直接获取功能实例：

```kotlin
@OptIn(ExperimentalAgentsApi::class)
val myNode by node<String, Unit> {
    val memory = longTermMemory()
    val storage = memory.getIngestionStorage()
}
```

## 自定义内存记录提取器

实现 `MemoryRecordExtractor` 以控制消息在存储前的转换方式：

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

## 自定义搜索请求

配合 lambda表达式 使用 `searchStrategy`，以控制如何将用户查询转换为搜索请求：

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

## 实现自定义存储

实现 `RetrievalStorage` 和/或 `IngestionStorage` 以连接到您的向量数据库：

```kotlin
class MyVectorDbStorage : RetrievalStorage, IngestionStorage {
    override suspend fun search(
        request: SearchRequest, namespace: String?
    ): `List<SearchResult>` {
        // 查询您的向量数据库
    }

    override suspend fun add(
        records: List<MemoryRecord>, namespace: String?
    ) {
        // 更新或插入 (Upsert) 到您的向量数据库
    }
}
```

对于测试，可以使用内置的 `InMemoryRecordStorage`，它通过基于关键字的搜索将记录保存在内存中。