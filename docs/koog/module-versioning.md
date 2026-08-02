# 版本控制

Koog 遵循 [语义化版本控制](https://semver.org/)，格式为 `X.Y.Z`（例如 `1.1.0`）。

该框架是 API 稳定的：一旦发布了公共 API，在没有主版本升级的情况下不会对其进行破坏。

## 版本组件

| 组件 | 名称 | 格式 | 含义 |
|-----------|---------|--------|---------|
| `X`       | 主版本 | `X.y.z` | 对现有 API 的破坏性变更 |
| `Y`       | 次版本 | `x.Y.z` | 新 API 添加和弃用；所有现有 API 继续工作 |
| `Z`       | 修订版本 | `x.y.Z` | 仅包含 Bug 修复；无 API 变更 |

### 主版本 (`X`)

- 可能对现有 API 引入破坏性变更。
- 旧的 API 可能会被移除。
- 将提供迁移指南。
- 每年最多发布一次。

### 次版本 (`Y`)

- 可能添加新 API。
- 可能弃用现有 API（提供替代方案），但被弃用的 API 仍可正常使用。
- 无破坏性变更 — 所有针对上一个次版本编译的代码将继续编译并运行。
- 每月最多发布一次。

### 修订版本 (`Z`)

- 仅包含 Bug 修复。
- 无 API 添加、移除或弃用。
- 每周最多发布一次。

## 弃用政策

在次版本（`Y`）中弃用的 API 将至少保留到下一个主版本（`X`）。
弃用警告将标明推荐的替代方案。

## 稳定模块与 Beta 模块

一些模块被认为是实验性的，发布的版本带有 `-beta` 版本后缀（例如 `1.1.0-beta`），而不是标准的 `X.Y.Z`。一个模块处于 Beta 阶段可能是由于以下原因之一：

- **外部集成** — 底层 LLM 提供商 API 或外部框架（如 Spring AI）本身可能不稳定，或者会发生频繁或预期的更改。
- **实验性功能** — 该功能领域仍在探索中，API 形状可能会发生演变（例如 GOAP 规划策略）。
- **实验性协议** — 该模块实现了一个本身尚不稳定的协议（例如 A2A、Kotlin MCP）。

虽然我们尽力保持 Beta 模块的稳定，但跨次版本可能会发生一些 API 变更。Beta 变更不会影响任何稳定模块。

版本为 `X.Y.Z` 的稳定模块始终与版本为 `X.Y.Z-beta` 的 Beta 模块兼容（反之亦然）。所有模块都可以同步更新。

### 汇总模块

| 模块 | 版本 | 内容 |
|--------|--------------|----------|
| `koog-agents` | `1.1.1` | 所有稳定模块（传递性）— 推荐的起点 |
| `koog-agents-additions` | `1.1.1-beta` | 大多数 Beta/实验性模块（独立外部集成除外） |

### 模块版本

=== "稳定模块 (`1.1.1`)"
    
    | 模块 | 版本 |
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

=== "Beta 模块 (`1.1.1-beta`)"
    
    | 模块 | 版本 |
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