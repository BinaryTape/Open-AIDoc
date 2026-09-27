# 版本管理

Koog 遵循 [語意化版本](https://semver.org/) (Semantic Versioning)，格式為 `X.Y.Z` (例如 `1.3.0`)。

本架構具備 API 穩定性：一旦發布公開 API，除非進行主要版本升級，否則不會產生破壞性變更。

## 版本組成 {id="version-components"}

| 元件 | 名稱 | 格式 | 意義 |
|-----------|---------|--------|---------|
| `X` | Major (主要) | `X.y.z` | 對現有 API 的破壞性變更 |
| `Y` | Minor (次要) | `x.Y.z` | 新增 API 與棄用項；所有現有 API 仍可正常運作 |
| `Z` | Bugfix (錯誤修正) | `x.y.Z` | 僅包含錯誤修正；無 API 變更 |

### Major (`X`) {id="major-x"}

- 可能對現有 API 引入破壞性變更。
- 可能移除舊的 API。
- 將提供遷移指南。
- 每年最多發布一次。

### Minor (`Y`) {id="minor-y"}

- 可能新增 API。
- 可能棄用現有 API (並提供替代方案)，但已棄用的 API 仍具備功能。
- 無破壞性變更 — 所有基於前一個次要版本編譯的程式碼皆可繼續編譯與運作。
- 每月最多發布一次。

### Bugfix (`Z`) {id="bugfix-z"}

- 僅包含錯誤修正。
- 無 API 新增、移除或棄用。
- 每週最多發布一次。

## 棄用政策 {id="deprecation-policy"}

在次要版本 (`Y`) 中棄用的 API 將至少保留至下一個主要版本 (`X`)。
棄用警告將指明建議的替代方案。

## 穩定模組與 Beta 模組 {id="stable-and-beta-modules"}

某些模組被視為實驗性，並以 `-beta` 版本後綴 (例如 `1.3.0-beta`) 而非標準的 `X.Y.Z` 發布。模組處於 beta 階段可能有以下原因：

- **外部整合** — 底層 LLM 提供者 API 或外部架構 (例如 Spring AI) 本身可能不穩定，或面臨頻繁或預期的變動。
- **實驗性功能** — 該功能領域仍處於探索階段，API 形式可能會演進 (例如 GOAP 規劃策略)。
- **實驗性協定** — 該模組實作了本身尚未穩定的協定 (例如 A2A，Kotlin MCP)。

雖然我們盡力保持 beta 模組的穩定性，但在次要版本之間仍可能發生某些 API 變更。Beta 變更不會影響任何穩定模組。

版本為 `X.Y.Z` 的穩定模組始終與版本為 `X.Y.Z-beta` 的 beta 模組相容 (反之亦然)。所有模組皆可同步更新。

### Umbrella 模組 {id="umbrella-modules"}

| 模組 | 版本 | 內容 |
|--------|--------------|----------|
| `koog-agents` | `1.3.0` | 所有穩定模組 (遞移性) — 建議的入門起點 |
| `koog-agents-additions` | `1.3.0-beta` | 大多數 beta/實驗性模組 (獨立的外部整合除外) |

### 模組版本 {id="module-versions"}

=== "穩定模組 (`1.3.0`)"
    
    | 模組 | 版本 |
    |--------|---------|
    | `agents` | `1.3.0` |
    | `agents-core` | `1.3.0` |
    | `agents-features` | `1.3.0` |
    | `agents-features-chat-history-jdbc` | `1.3.0` |
    | `agents-features-chat-memory-sql` | `1.3.0` |
    | `agents-features-event-handler` | `1.3.0` |
    | `agents-features-memory` | `1.3.0` |
    | `agents-features-opentelemetry` | `1.3.0` |
    | `agents-features-persistence-jdbc` | `1.3.0` |
    | `agents-features-snapshot` | `1.3.0` |
    | `agents-features-sql` | `1.3.0` |
    | `agents-features-tokenizer` | `1.3.0` |
    | `agents-features-trace` | `1.3.0` |
    | `agents-mcp-metadata` | `1.3.0` |
    | `agents-test` | `1.3.0` |
    | `agents-tools` | `1.3.0` |
    | `agents-utils` | `1.3.0` |
    | `embeddings` | `1.3.0` |
    | `embeddings-base` | `1.3.0` |
    | `embeddings-llm` | `1.3.0` |
    | `http-client` | `1.3.0` |
    | `http-client-core` | `1.3.0` |
    | `http-client-java` | `1.3.0` |
    | `http-client-ktor` | `1.3.0` |
    | `http-client-okhttp` | `1.3.0` |
    | `http-client-test` | `1.3.0` |
    | `koog-agents` | `1.3.0` |
    | `koog-spring-ai` | `1.3.0` |
    | `prompt` | `1.3.0` |
    | `prompt-cache` | `1.3.0` |
    | `prompt-cache-files` | `1.3.0` |
    | `prompt-cache-model` | `1.3.0` |
    | `prompt-executor` | `1.3.0` |
    | `prompt-executor-anthropic-client` | `1.3.0` |
    | `prompt-executor-bedrock-client` | `1.3.0` |
    | `prompt-executor-cached` | `1.3.0` |
    | `prompt-executor-clients` | `1.3.0` |
    | `prompt-executor-model` | `1.3.0` |
    | `prompt-executor-ollama-client` | `1.3.0` |
    | `prompt-executor-openai-client` | `1.3.0` |
    | `prompt-executor-openai-client-base` | `1.3.0` |
    | `prompt-executor-openrouter-client` | `1.3.0` |
    | `prompt-llm` | `1.3.0` |
    | `prompt-markdown` | `1.3.0` |
    | `prompt-model` | `1.3.0` |
    | `prompt-processor` | `1.3.0` |
    | `prompt-structure` | `1.3.0` |
    | `prompt-tokenizer` | `1.3.0` |
    | `prompt-xml` | `1.3.0` |
    | `rag-base` | `1.3.0` |
    | `serialization` | `1.3.0` |
    | `serialization-core` | `1.3.0` |
    | `serialization-jackson` | `1.3.0` |
    | `serialization-test` | `1.3.0` |
    | `test-tck` | `1.3.0` |
    | `test-utils` | `1.3.0` |
    | `utils` | `1.3.0` |

=== "Beta 模組 (`1.3.0-beta`)"
    
    | 模組 | 版本 |
    |--------|---------|
    | `a2a-client` | `1.3.0-beta` |
    | `a2a-core` | `1.3.0-beta` |
    | `a2a-server` | `1.3.0-beta` |
    | `a2a-test` | `1.3.0-beta` |
    | `a2a-test-server-tck` | `1.3.0-beta` |
    | `a2a-transport-client-jsonrpc-http` | `1.3.0-beta` |
    | `a2a-transport-core-jsonrpc` | `1.3.0-beta` |
    | `a2a-transport-server-jsonrpc-http` | `1.3.0-beta` |
    | `agents-ext` | `1.3.0-beta` |
    | `agents-features-a2a-client` | `1.3.0-beta` |
    | `agents-features-a2a-core` | `1.3.0-beta` |
    | `agents-features-a2a-server` | `1.3.0-beta` |
    | `agents-features-acp` | `1.3.0-beta` |
    | `agents-features-chat-history-aws` | `1.3.0-beta` |
    | `agents-features-longterm-memory` | `1.3.0-beta` |
    | `agents-features-longterm-memory-aws` | `1.3.0-beta` |
    | `agents-mcp` | `1.3.0-beta` |
    | `agents-mcp-server` | `1.3.0-beta` |
    | `agents-planner` | `1.3.0-beta` |
    | `koog-agents-additions` | `1.3.0-beta` |
    | `koog-ktor` | `1.3.0-beta` |
    | `koog-spring-ai-common` | `1.3.0-beta` |
    | `koog-spring-ai-starter-chat-memory` | `1.3.0-beta` |
    | `koog-spring-ai-starter-model-chat` | `1.3.0-beta` |
    | `koog-spring-ai-starter-model-embedding` | `1.3.0-beta` |
    | `koog-spring-ai-starter-vector-store` | `1.3.0-beta` |
    | `koog-spring-boot-starter` | `1.3.0-beta` |
    | `prompt-cache-redis` | `1.3.0-beta` |
    | `prompt-executor-dashscope-client` | `1.3.0-beta` |
    | `prompt-executor-deepseek-client` | `1.3.0-beta` |
    | `prompt-executor-google-client` | `1.3.0-beta` |
    | `prompt-executor-litert-client` | `1.3.0-beta` |
    | `prompt-executor-llms-all` | `1.3.0-beta` |
    | `prompt-executor-mistralai-client` | `1.3.0-beta` |
    | `rag-vector` | `1.3.0-beta` |