# 버전 관리

Koog는 `X.Y.Z` 형식(예: `1.1.0`)의 [유의적 버전(Semantic Versioning)](https://semver.org/)을 따릅니다.

프레임워크는 API 수준에서 안정적입니다. 공개 API가 한 번 릴리스되면 메이저 버전 업데이트 없이는 변경 사항이 발생하지(broken) 않습니다.

## 버전 구성 요소

| 구성 요소 | 이름 | 형식 | 의미 |
|-----------|---------|--------|---------|
| `X`       | 메이저 (Major) | `X.y.z` | 기존 API에 대한 파괴적 변경 |
| `Y`       | 마이너 (Minor) | `x.Y.z` | 새로운 API 추가 및 지원 중단; 모든 기존 API는 계속 작동함 |
| `Z`       | 버그 수정 (Bugfix) | `x.y.Z` | 버그 수정만 포함; API 변경 없음 |

### 메이저 (`X`)

- 기존 API에 파괴적 변경(breaking changes)이 도입될 수 있습니다.
- 오래된 API가 제거될 수 있습니다.
- 마이그레이션 가이드가 제공됩니다.
- 연간 최대 1회 릴리스됩니다.

### 마이너 (`Y`)

- 새로운 API가 추가될 수 있습니다.
- 기존 API를 지원 중단(deprecate)할 수 있으며(대체 기능 제공), 지원 중단된 API는 여전히 작동합니다.
- 파괴적 변경이 없습니다 — 이전 마이너 버전에서 컴파일된 모든 코드는 계속 컴파일되고 작동합니다.
- 월간 최대 1회 릴리스됩니다.

### 버그 수정 (`Z`)

- 버그 수정만 포함합니다.
- API 추가, 제거 또는 지원 중단이 없습니다.
- 주간 최대 1회 릴리스됩니다.

## 지원 중단 정책 (Deprecation Policy)

마이너 릴리스(`Y`)에서 지원 중단된 API는 최소한 다음 메이저 릴리스(`X`)까지 유지됩니다.
지원 중단 경고는 권장되는 대체 기능을 안내합니다.

## 안정 모듈 및 베타 모듈

일부 모듈은 실험적인 것으로 간주되어 표준 `X.Y.Z` 대신 `-beta` 버전 접미사(예: `1.1.0-beta`)를 붙여 배포됩니다. 모듈이 베타인 이유는 다음과 같습니다.

- **외부 통합 (External integrations)** — 기반 LLM 제공업체 API나 외부 프레임워크(예: Spring AI) 자체가 불안정하거나 잦은 변경이 예상되는 경우.
- **실험적 기능 (Experimental functionality)** — 해당 기능 영역이 아직 탐색 중이며 API 형태가 진화할 수 있는 경우(예: GOAP 계획 전략).
- **실험적 프로토콜 (Experimental protocols)** — 모듈이 구현하는 프로토콜 자체가 아직 안정적이지 않은 경우(예: A2A, Kotlin MCP).

베타 모듈의 안정성을 유지하기 위해 최선을 다하지만, 마이너 릴리스 간에 일부 API 변경이 발생할 수 있습니다. 베타 모듈의 변경 사항은 안정적인(stable) 모듈에 영향을 미치지 않습니다.

버전 `X.Y.Z`인 안정 모듈은 항상 버전 `X.Y.Z-beta`인 베타 모듈과 호환됩니다(반대도 마찬가지). 모든 모듈은 동기화되어 업데이트될 수 있습니다.

### 엄브렐러 모듈 (Umbrella Modules)

| 모듈 | 버전 | 내용 |
|--------|--------------|----------|
| `koog-agents` | `1.1.1`      | 모든 안정 모듈(전이적) — 권장되는 시작 지점 |
| `koog-agents-additions` | `1.1.1-beta` | 대부분의 베타/실험적 모듈 (독립형 외부 통합 제외) |

### 모듈 버전

=== "안정 모듈 (`1.1.1`)"
    
    | 모듈 | 버전 |
    |--------|---------|
    | `agents` | `1.1.1` |
    | `agents-core` | `1.1.1` |
    | `agents-features` | `1.1.1` |
    | `agents-features-chat-history-jdbc` | `1.1.1` |
    | `agents-features-chat-memory-sql` | `1.1.1` |
    | `agents-features-event-handler` | `1.1.1` |
    | `agents-features-memory` | `1.1.1` |
    | `agents-features-opentelemetry` | `1.1.1` |
    | `agents-features-persistence-jdbc` | `1.1.1` |
    | `agents-features-snapshot` | `1.1.1` |
    | `agents-features-sql` | `1.1.1` |
    | `agents-features-tokenizer` | `1.1.1` |
    | `agents-features-trace` | `1.1.1` |
    | `agents-mcp-metadata` | `1.1.1` |
    | `agents-test` | `1.1.1` |
    | `agents-tools` | `1.1.1` |
    | `agents-utils` | `1.1.1` |
    | `embeddings` | `1.1.1` |
    | `embeddings-base` | `1.1.1` |
    | `embeddings-llm` | `1.1.1` |
    | `http-client` | `1.1.1` |
    | `http-client-core` | `1.1.1` |
    | `http-client-java` | `1.1.1` |
    | `http-client-ktor` | `1.1.1` |
    | `http-client-okhttp` | `1.1.1` |
    | `http-client-test` | `1.1.1` |
    | `koog-agents` | `1.1.1` |
    | `koog-spring-ai` | `1.1.1` |
    | `prompt` | `1.1.1` |
    | `prompt-cache` | `1.1.1` |
    | `prompt-cache-files` | `1.1.1` |
    | `prompt-cache-model` | `1.1.1` |
    | `prompt-executor` | `1.1.1` |
    | `prompt-executor-anthropic-client` | `1.1.1` |
    | `prompt-executor-bedrock-client` | `1.1.1` |
    | `prompt-executor-cached` | `1.1.1` |
    | `prompt-executor-clients` | `1.1.1` |
    | `prompt-executor-model` | `1.1.1` |
    | `prompt-executor-ollama-client` | `1.1.1` |
    | `prompt-executor-openai-client` | `1.1.1` |
    | `prompt-executor-openai-client-base` | `1.1.1` |
    | `prompt-executor-openrouter-client` | `1.1.1` |
    | `prompt-llm` | `1.1.1` |
    | `prompt-markdown` | `1.1.1` |
    | `prompt-model` | `1.1.1` |
    | `prompt-processor` | `1.1.1` |
    | `prompt-structure` | `1.1.1` |
    | `prompt-tokenizer` | `1.1.1` |
    | `prompt-xml` | `1.1.1` |
    | `rag-base` | `1.1.1` |
    | `serialization` | `1.1.1` |
    | `serialization-core` | `1.1.1` |
    | `serialization-jackson` | `1.1.1` |
    | `serialization-test` | `1.1.1` |
    | `test-tck` | `1.1.1` |
    | `test-utils` | `1.1.1` |
    | `utils` | `1.1.1` |

=== "베타 모듈 (`1.1.1-beta`)"
    
    | 모듈 | 버전 |
    |--------|---------|
    | `a2a-client` | `1.1.1-beta` |
    | `a2a-core` | `1.1.1-beta` |
    | `a2a-server` | `1.1.1-beta` |
    | `a2a-test` | `1.1.1-beta` |
    | `a2a-test-server-tck` | `1.1.1-beta` |
    | `a2a-transport-client-jsonrpc-http` | `1.1.1-beta` |
    | `a2a-transport-core-jsonrpc` | `1.1.1-beta` |
    | `a2a-transport-server-jsonrpc-http` | `1.1.1-beta` |
    | `agents-ext` | `1.1.1-beta` |
    | `agents-features-a2a-client` | `1.1.1-beta` |
    | `agents-features-a2a-core` | `1.1.1-beta` |
    | `agents-features-a2a-server` | `1.1.1-beta` |
    | `agents-features-acp` | `1.1.1-beta` |
    | `agents-features-chat-history-aws` | `1.1.1-beta` |
    | `agents-features-longterm-memory` | `1.1.1-beta` |
    | `agents-features-longterm-memory-aws` | `1.1.1-beta` |
    | `agents-mcp` | `1.1.1-beta` |
    | `agents-mcp-server` | `1.1.1-beta` |
    | `agents-planner` | `1.1.1-beta` |
    | `koog-agents-additions` | `1.1.1-beta` |
    | `koog-ktor` | `1.1.1-beta` |
    | `koog-spring-ai-common` | `1.1.1-beta` |
    | `koog-spring-ai-starter-chat-memory` | `1.1.1-beta` |
    | `koog-spring-ai-starter-model-chat` | `1.1.1-beta` |
    | `koog-spring-ai-starter-model-embedding` | `1.1.1-beta` |
    | `koog-spring-ai-starter-vector-store` | `1.1.1-beta` |
    | `koog-spring-boot-starter` | `1.1.1-beta` |
    | `prompt-cache-redis` | `1.1.1-beta` |
    | `prompt-executor-dashscope-client` | `1.1.1-beta` |
    | `prompt-executor-deepseek-client` | `1.1.1-beta` |
    | `prompt-executor-google-client` | `1.1.1-beta` |
    | `prompt-executor-litert-client` | `1.1.1-beta` |
    | `prompt-executor-llms-all` | `1.1.1-beta` |
    | `prompt-executor-mistralai-client` | `1.1.1-beta` |
    | `rag-vector` | `1.1.1-beta` |