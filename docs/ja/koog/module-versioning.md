# バージョニング

Koogは、`X.Y.Z` 形式（例: `1.3.0`）の[セマンティック バージョニング](https://semver.org/)に従います。

このフレームワークはAPI安定性を備えています。パブリックAPIが一度リリースされると、メジャーバージョンの更新なしに破壊的変更が行われることはありません。

## バージョン構成 {id="version-components"}

| コンポーネント | 名前 | 形式 | 意味 |
|-----------|---------|--------|---------|
| `X`       | メジャー | `X.y.z` | 既存のAPIに対する破壊的変更 |
| `Y`       | マイナー | `x.Y.z` | 新しいAPIの追加と非推奨化。既存のすべてのAPIは引き続き動作します |
| `Z`       | バグ修正 | `x.y.Z` | バグ修正のみ。APIの変更はありません |

### メジャー (`X`) {id="major-x"}

- 既存のAPIに破壊的変更が導入される場合があります。
- 古いAPIが削除される可能性があります。
- 移行ガイドが提供されます。
- リリースは最大で年1回です。

### マイナー (`Y`) {id="minor-y"}

- 新しいAPIが追加される場合があります。
- 既存のAPIが非推奨になる（代替手段が提供される）場合がありますが、非推奨のAPIも引き続き機能します。
- 破壊的変更はありません。前のマイナーバージョンに対してコンパイルされたすべてのコードは、引き続きコンパイルおよび動作します。
- リリースは最大で月1回です。

### バグ修正 (`Z`) {id="bugfix-z"}

- バグ修正のみを含みます。
- APIの追加、削除、非推奨化はありません。
- リリースは最大で週1回です。

## 非推奨ポリシー {id="deprecation-policy"}

マイナーリリース（`Y`）で非推奨になったAPIは、少なくとも次のメジャーリリース（`X`）まで利用可能なまま維持されます。
非推奨の警告には、推奨される代替手段が示されます。

## 安定版およびベータ版モジュール {id="stable-and-beta-modules"}

一部のモジュールは実験的であると見なされ、標準の `X.Y.Z` ではなく、`-beta` バージョンサフィックス（例: `1.3.0-beta`）を付けて公開されます。モジュールがベータ版である理由には、以下のいずれかが含まれます。

- **外部統合** — 基盤となるLLMプロバイダーのAPIや外部フレームワーク（例: Spring AI）自体が不安定であったり、頻繁な変更や変更が予想される対象であったりする場合。
- **実験的な機能** — 機能領域がまだ調査中であり、APIの形状が進化する可能性がある場合（例: GOAPプランニング戦略）。
- **実験的なプロトコル** — モジュールが、それ自体がまだ安定していないプロトコルを実装している場合（例: A2A、Kotlin MCP）。

ベータ版モジュールの安定性を維持するためにあらゆる努力を払っていますが、マイナーリリースをまたいで一部のAPI変更が発生する可能性があります。ベータ版の変更が安定版モジュールに影響を与えることはありません。

バージョン `X.Y.Z` の安定版モジュールは、常にバージョン `X.Y.Z-beta` のベータ版モジュールと互換性があります（その逆も同様です）。すべてのモジュールを同期してアップデートできます。

### アンブレラモジュール {id="umbrella-modules"}

| モジュール | バージョン | 内容 |
|--------|--------------|----------|
| `koog-agents` | `1.3.0` | すべての安定版モジュール（推移的） — 推奨される開始ポイント |
| `koog-agents-additions` | `1.3.0-beta` | ほとんどのベータ/実験的モジュール（スタンドアロンの外部統合を除く） |

### モジュールバージョン {id="module-versions"}

=== "安定版モジュール (`1.3.0`)"
    
    | モジュール | バージョン |
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

=== "ベータ版モジュール (`1.3.0-beta`)"
    
    | モジュール | バージョン |
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