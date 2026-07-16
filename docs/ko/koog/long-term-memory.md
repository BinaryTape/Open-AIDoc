# 장기 기억(Long Term Memory) 기능 (실험적)

`LongTermMemory` 기능은 두 가지 독립적인 설정 그룹을 통해 Koog AI 에이전트에 영구 메모리(persistent memory)를 추가합니다:
- **검색(Retrieval)** — 메모리 저장소의 관련 컨텍스트를 사용하여 LLM 프롬프트를 보강합니다 (검색 증강 생성 또는 RAG)
- **수집(Ingestion)** — 향후 검색을 위해 대화 메시지를 메모리 저장소에 유지합니다.

## 빠른 시작

> **참고:** `LongTermMemory`는 실험적(experimental) API입니다. 코드에 `@OptIn(ExperimentalAgentsApi::class)`를 추가하거나 파일 상단에 `@file:OptIn(ExperimentalAgentsApi::class)`를 추가하세요.

```kotlin
@OptIn(ExperimentalAgentsApi::class)
val storage = InMemoryRecordStorage() // 또는 사용자의 벡터 DB 어댑터

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

## 검색 전용 (RAG)

이미 구축된 지식 베이스가 있는 경우 수집 없이 검색만 사용하십시오:

```kotlin
@OptIn(ExperimentalAgentsApi::class)
install(LongTermMemory) {
    retrieval {
        storage = myVectorDbStorage
        namespace = "my-collection"  // 선택 사항: 특정 네임스페이스/컬렉션으로 범위 제한
        searchStrategy = SimilaritySearchStrategy(topK = 3, similarityThreshold = 0.7)
        promptAugmenter = SystemPromptAugmenter()
    }
}
```

### 프롬프트 증강기 (Prompt Augmenters)

| 증강기 | 동작 |
|---|---|
| `SystemPromptAugmenter()` | 프롬프트 시작 부분에 시스템 메시지로 컨텍스트를 삽입합니다 (시스템 메시지가 없는 경우 아무 동작도 하지 않음) |
| `UserPromptAugmenter()` | 마지막 사용자 메시지 앞에 별도의 사용자 메시지로 컨텍스트를 삽입합니다 |
| `PromptAugmenter { prompt, context -> ... }` | 람다를 통한 사용자 정의 보강 |

## 수집 전용

시간이 지남에 따라 메모리 저장소를 구축하려면 검색 없이 수집만 사용하십시오:

```kotlin
@OptIn(ExperimentalAgentsApi::class)
install(LongTermMemory) {
    ingestion {
        storage = myVectorDbStorage
        namespace = "my-collection"  // 선택 사항: 특정 네임스페이스/컬렉션으로 범위 제한
        extractor = FilteringMemoryRecordExtractor(
            messageRolesToExtract = setOf(Message.Role.User, Message.Role.Assistant)
        )
        timing = IngestionTiming.ON_LLM_CALL
    }
}
```

### 수집 타이밍 (Ingestion Timing)

| 타이밍 | 동작 |
|---|---|
| `ON_LLM_CALL` | 각 LLM 호출/스트림 시 메시지를 수집합니다 (세션 내 RAG 가능) |
| `ON_AGENT_COMPLETION` | 에이전트 실행이 완료되면 모든 메시지를 한 번에 수집합니다 |

## 전략 노드에서 장기 기억 액세스하기

전략 노드 내부에서 `withLongTermMemory { }`를 사용하여 레코드를 직접 검색하거나 추가할 수 있습니다:

```kotlin
@OptIn(ExperimentalAgentsApi::class)
val myNode by node<String, Unit> {
    withLongTermMemory {
        // 수동으로 레코드 추가
        val record = MemoryRecord(content = "important fact")
        this.getIngestionStorage()?.add(listOf(record), ingestionSettings?.namespace)

        // 수동으로 검색
        val request = SimilaritySearchRequest(query = input, limit = 5)
        val results = this.getRetrievalStorage()?.search(request, retrievalSettings?.namespace)
    }
}
```

`longTermMemory()`를 사용하여 기능 인스턴스를 직접 가져올 수 있습니다:

```kotlin
@OptIn(ExperimentalAgentsApi::class)
val myNode by node<String, Unit> {
    val memory = longTermMemory()
    val storage = memory.getIngestionStorage()
}
```

## 사용자 정의 메모리 레코드 추출기 (Custom Memory Record Extractor)

저장 전에 메시지가 변환되는 방식을 제어하려면 `MemoryRecordExtractor`를 구현하십시오:

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

## 사용자 정의 검색 요청 (Custom Search Request)

사용자 쿼리가 검색 요청으로 변환되는 방식을 제어하려면 람다와 함께 `searchStrategy`를 사용하십시오:

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

## 사용자 정의 저장소 구현하기

벡터 데이터베이스에 연결하려면 `RetrievalStorage` 및/또는 `IngestionStorage`를 구현하십시오:

```kotlin
class MyVectorDbStorage : RetrievalStorage, IngestionStorage {
    override suspend fun search(
        request: SearchRequest, namespace: String?
    ): `List<SearchResult>` {
        // 벡터 DB 쿼리
    }

    override suspend fun add(
        records: List<MemoryRecord>, namespace: String?
    ) {
        // 벡터 DB에 Upsert
    }
}
```

테스트용으로 키워드 기반 검색을 지원하며 레코드를 메모리에 유지하는 내장된 `InMemoryRecordStorage`를 사용하십시오.