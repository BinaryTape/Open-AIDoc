# バージョニング

Koogは、`X.Y.Z` 形式（例: `1.1.0`）の[セマンティック バージョニング](https://semver.org/)に従います。

このフレームワークはAPI安定性を備えています。パブリックAPIが一度リリースされると、メジャーバージョンの更新なしに破壊的変更が行われることはありません。

## バージョン構成

| コンポーネント | 名前 | 形式 | 意味 |
|-----------|---------|--------|---------|
| `X`       | メジャー | `X.y.z` | 既存のAPIに対する破壊的変更 |
| `Y`       | マイナー | `x.Y.z` | 新しいAPIの追加と非推奨化。既存のすべてのAPIは引き続き動作します |
| `Z`       | バグ修正 | `x.y.Z` | バグ修正のみ。APIの変更はありません |

### メジャー (`X`)

- 既存のAPIに破壊的変更が導入される場合があります。
- 古いAPIが削除される可能性があります。
- 移行ガイドが提供されます。
- リリースは最大で年1回です。

### マイナー (`Y`)

- 新しいAPIが追加される場合があります。
- 既存のAPIが非推奨になる（代替手段が提供される）場合がありますが、非推奨のAPIも引き続き機能します。
- 破壊的変更はありません。前のマイナーバージョンに対してコンパイルされたすべてのコードは、引き続きコンパイルおよび動作します。
- リリースは最大で月1回です。

### バグ修正 (`Z`)

- バグ修正のみを含みます。
- APIの追加、削除、非推奨化はありません。
- リリースは最大で週1回です。

## 非推奨ポリシー

マイナーリリース（`Y`）で非推奨になったAPIは、少なくとも次のメジャーリリース（`X`）まで利用可能なまま維持されます。
非推奨の警告には、推奨される代替手段が示されます。

## 安定版およびベータ版モジュール

一部のモジュールは実験的であると見なされ、標準の `X.Y.Z` ではなく、`-beta` バージョンサフィックス（例: `1.1.0-beta`）を付けて公開されます。モジュールがベータ版である理由には、以下のいずれかが含まれます。

- **外部統合** — 基盤となるLLMプロバイダーのAPIや外部フレームワーク（例: Spring AI）自体が不安定であったり、頻繁な変更や変更が予想される対象であったりする場合。
- **実験的な機能** — 機能領域がまだ調査中であり、APIの形状が進化する可能性がある場合（例: GOAPプランニング戦略）。
- **実験的なプロトコル** — モジュールが、それ自体がまだ安定していないプロトコルを実装している場合（例: A2A、Kotlin MCP）。

ベータ版モジュールの安定性を維持するためにあらゆる努力を払っていますが、マイナーリリースをまたいで一部のAPI変更が発生する可能性があります。ベータ版の変更が安定版モジュールに影響を与えることはありません。

バージョン `X.Y.Z` の安定版モジュールは、常にバージョン `X.Y.Z-beta` のベータ版モジュールと互換性があります（その逆も同様です）。すべてのモジュールを同期してアップデートできます。

### アンブレラモジュール

| モジュール | バージョン | 内容 |
|--------|---------|----------|
| `koog-agents` | `1.1.1` | すべての安定版モジュール（推移的） — 推奨される開始ポイント |
| `koog-agents-additions` | `1.1.1-beta` | ほとんどのベータ/実験的モジュール（スタンドアロンの外部統合を除く） |

### モジュールバージョン

=== "安定版モジュール (`1.1.1`)"
    
    | モジュール | バージョン |
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

=== "ベータ版モジュール (`1.1.1-beta`)"
    
    | モジュール | バージョン |
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