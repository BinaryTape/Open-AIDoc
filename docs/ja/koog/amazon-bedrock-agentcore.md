---
status: beta
---

# Amazon Bedrock AgentCore

--8<-- "versioning-snippets.md:beta"

Koog は、Amazon Bedrock AgentCore サービスを使用してエージェントを実行するための統合機能を提供します。

## Amazon Bedrock AgentCore Runtime

`koog-bedrock-agentcore-runtime` モジュールは、[Amazon Bedrock AgentCore Runtime](https://docs.aws.amazon.com/bedrock-agentcore/latest/devguide/runtime.html) HTTP コントラクトを通じて Koog エージェントを公開する Ktor ルートインストーラーを提供します。これは、構成された Ktor ルートに対して以下のエンドポイントをインストールします。

- `POST /invocations`: エージェントのリクエストを処理します。
- `GET /ping`: エージェントのヘルス状態とバックグラウンドアクティビティを報告します。

このモジュールは、型付き JSON ハンドラーに加えて、テキスト、バイナリ、マルチパート、およびストリーミングペイロードをサポートしています。インボケーションハンドラーは Ktor の `RoutingContext` 内で実行されるため、`koog-ktor` プラグインがインストールされている場合は、`aiAgent()` などの Koog ルーティング拡張機能を使用できます。

### 依存関係の追加

AgentCore Runtime モジュールを Gradle ビルドに追加します：

```kotlin
dependencies {
    implementation("ai.koog:koog-bedrock-agentcore-runtime:$koogVersion")
}
```

このモジュールには JVM 17 以降、Kotlin 2.x、および Ktor 3.x が必要です。

### Runtime ルートのインストール

以下の例では、Koog と Ktor のコンテントネゴシエーションをインストールし、型付き JSON インボケーションハンドラーを公開します：

```kotlin
import ai.koog.agentcore.runtime.agentCoreRuntime
import ai.koog.agentcore.runtime.handle
import ai.koog.ktor.Koog
import ai.koog.ktor.aiAgent
import ai.koog.ktor.llm
import ai.koog.prompt.executor.clients.bedrock.BedrockModels
import io.ktor.serialization.kotlinx.json.json
import io.ktor.server.application.Application
import io.ktor.server.application.install
import io.ktor.server.plugins.contentnegotiation.ContentNegotiation
import io.ktor.server.routing.routing
import kotlinx.serialization.Serializable

@Serializable
data class InvocationRequest(val prompt: String)

@Serializable
data class InvocationResponse(val answer: String)

fun Application.module() {
    install(ContentNegotiation) {
        json()
    }

    install(Koog) {
        llm {
            bedrock()
        }
    }

    routing {
        agentCoreRuntime {
            handle<InvocationRequest, InvocationResponse> { request, context ->
                val sessionId = context.getHeader("X-Amzn-Bedrock-AgentCore-Runtime-Session-Id")
                val answer = aiAgent(
                    input = request.prompt,
                    model = BedrockModels.AmazonNovaMicro,
                )
                InvocationResponse(answer)
            }
        }
    }
}
```

型付きハンドラーは、リクエストのデシリアライズとレスポンスのシリアライズを Ktor の `ContentNegotiation` プラグインに委譲します。ホストアプリケーションは、JSON のリクエストとレスポンスのための `json()` など、受け入れるメディアタイプに応じたコンバーターをインストールする必要があります。サーバーエンジン、ポート、およびその他のアプリケーションプラグインも、ホストアプリケーションの制御下にあります。

### さまざまなペイロードタイプの処理

非 JSON ペイロードやマルチモーダルレスポンスの場合は、統合された `handler` を構成します。これは `InvocationInput` と `AgentCoreContext` を受け取り、`InvocationResult` を返します：

```kotlin
routing {
    agentCoreRuntime {
        handler = { input, context ->
            when (input) {
                is InvocationInput.Text -> InvocationResult.Text(
                    aiAgent(input.body, model = BedrockModels.AmazonNovaMicro)
                )
                is InvocationInput.Binary -> InvocationResult.Binary(input.bytes, input.contentType)
                is InvocationInput.Stream -> InvocationResult.Text("Received a streamed request")
                is InvocationInput.Multipart -> InvocationResult.Text("Received multipart data")
            }
        }
    }
}
```

統合ハンドラーは以下をサポートします：

- `InvocationResult.Text`: `Accept` ヘッダーに基づいたコンテントネゴシエーションを行う、ワンショットのテキスト出力。
- `InvocationResult.Binary`: 明示的なコンテンツタイプを持つ、生の画像、音声、ビデオ、またはドキュメントのバイトデータ。
- `InvocationResult.TextStream`: 即座にフラッシュされる `text/event-stream` イベントとして出力される `Flow<String>`。
- `InvocationResult.BinaryStream`: 呼び出し側が選択したコンテンツタイプを持つ、生のストリーミングチャンク。

ストリーミングレスポンスは直接書き込まれるため、Ktor の `SSE` プラグインは必要ありません。

### リクエスト処理の構成

`AgentCoreRuntimeConfig` では以下のオプションを提供しています：

| オプション | 説明 | デフォルト |
|---|---|---|
| `handler` | 型付きの `handle<I, O>` ハンドラーが登録されていない場合に使用される統合ハンドラー。 | 未設定 |
| `binaryStreamThresholdBytes` | このサイズを超えるバイナリボディ、または `Content-Length` がないバイナリボディは `InvocationInput.Stream` として公開されます。 | 1 MiB |
| `maxRequestBytes` | 宣言された `Content-Length` が制限を超えているリクエストを HTTP 413 で拒否します。 | 100 MiB |
| `handlerTimeoutMillis` | ハンドラーがこのタイムアウトを超えると HTTP 504 を返します。正でない値はタイムアウトを無効にします。 | `0` |
| `pingService` | `/ping` エンドポイント用のカスタムヘルスサービス。 | タスクを認識するデフォルトサービス |
| `taskTracker` | `AgentCoreContext` を通じて公開され、デフォルトのヘルスサービスによって使用されるトラッカー。 | 新規の `AgentCoreTaskTracker` |

`Content-Length` ヘッダーのないリクエストは `maxRequestBytes` による事前チェックが行われません。その場合でも、基盤となるサーバーエンジンの制限が適用されます。

### ヘルス状態とバックグラウンドタスクの監視

`/ping` エンドポイントは以下を返します：

- エージェントにアクティブなバックグラウンドタスクがない場合は、HTTP 200 で `Healthy`。
- `AgentCoreTaskTracker` がアクティブな処理を報告している間は、HTTP 200 で `HealthyBusy`。
- ヘルスチェックで問題が検出された場合は、HTTP 503 で `Unhealthy`。

長時間実行されるバックグラウンド処理を開始するときは、`AgentCoreContext` から利用可能なトラッカーを使用してください。これにより、Runtime はエージェントがまだアクティブであることを認識し続けることができます。デフォルトの動作を置き換えるには、カスタムの `AgentCorePingService` を `pingService` に割り当てます。

レート制限もホストアプリケーションによって制御されます。Ktor の `RateLimit` プラグインをグローバルにインストールするか、`agentCoreRuntime` ルートを名前付きの `rateLimit` ブロックで囲んで、目的のポリシーを適用してください。

## Amazon Bedrock AgentCore Memory

Koog は、[Amazon Bedrock AgentCore Memory](https://docs.aws.amazon.com/bedrock-agentcore/latest/devguide/memory.html) と 2 つの方法で統合されています：

- `agents-features-chat-history-aws` モジュールは、会話履歴を AgentCore イベントとして永続化します。
- `agents-features-longterm-memory-aws` モジュールは、AgentCore メモリ戦略によって生成されたレコードを取得し、エージェントのプロンプトに追加します。

どちらの統合にも JVM 17 以降と AgentCore メモリリソースが必要です。AWS 認証情報とリージョンは、標準の AWS SDK 認証情報およびリージョンプロバイダーチェーンを介して構成してください。

### 依存関係の追加

一方または両方の Memory 統合モジュールを Gradle ビルドに追加します：

```kotlin
dependencies {
    implementation("ai.koog:agents-features-chat-history-aws:$koogVersion")
    implementation("ai.koog:agents-features-longterm-memory-aws:$koogVersion")
}
```

どちらのモジュールも、公開 API で使用される AWS SDK for Kotlin の `BedrockAgentCoreClient` を公開します。長期メモリは、メモリ戦略の発見のために `BedrockAgentCoreControlClient` も公開します。

### 会話履歴の永続化

`AgentcoreChatHistoryProvider` は、AgentCore の `createEvent` および `listEvents` API を使用して Koog の `ChatHistoryProvider` を実装します。`ChatMemory` 機能を通じてこれをインストールします：

```kotlin
import ai.koog.agents.chatMemory.feature.ChatMemory
import ai.koog.agents.core.agent.AIAgent
import ai.koog.agents.features.chathistory.aws.AgentcoreChatHistoryProvider
import aws.sdk.kotlin.services.bedrockagentcore.BedrockAgentCoreClient

val agentCoreClient = BedrockAgentCoreClient { region = "us-west-2" }
val chatHistoryProvider = AgentcoreChatHistoryProvider(
    client = agentCoreClient,
    memoryId = "memory-id",
)

val agent = AIAgent(/* ... */) {
    install(ChatMemory) {
        chatHistoryProvider = chatHistoryProvider
    }
}

val result = agent.run(
    agentInput = "Remember that I prefer window seats.",
    conversationId = "user-123:trip-456",
)
```

会話 ID は `actorId:sessionId` または単に `actorId` のいずれかになります。セッション部分が省略された場合、コンストラクタで `defaultSession` を設定していない限り、プロバイダーは `default-session` を使用します。

プロバイダーは、プレーンテキストの `Message.User` および `Message.Assistant` メッセージを保存します。AgentCore からロードされたメッセージにはメタデータにイベント ID が含まれているため、履歴全体を再度保存する際に、プロバイダーは新しいメッセージのみを保存できます。システム、ツール、推論、およびテキスト以外のコンテンツはデフォルトでスキップされます。これらを拒否するようにするには、`ignoreUnsupportedValues = false` を設定してください。`listEvents` のページネーションを制御するには `pageSize` を使用し、ロードされるイベント数を制限するには `totalEventsLimit` を使用します。

### 長期メモリの取得

`LongTermMemory` は、各 LLM リクエストの前に 1 つ以上の AgentCore メモリ戦略をクエリできます。`agentcore` DSL は複合的な取得を作成するため、単一のブロックで複数の戦略タイプとネームスペーススコープを組み合わせることができます：

```kotlin
import ai.koog.agents.features.longtermmemory.aws.dsl.agentcore
import ai.koog.agents.longtermmemory.feature.LongTermMemory

val agent = AIAgent(/* ... */) {
    install(LongTermMemory) {
        retrieval {
            agentcore(agentCoreClient, memoryId = "memory-id") {
                semantic(
                    strategyId = "semantic-strategy-id",
                    actorId = "user-123",
                    topK = 5,
                )
                userPreferences(
                    strategyId = "preference-strategy-id",
                    actorId = "user-123",
                    limit = 20,
                )
                summary(
                    strategyId = "summary-strategy-id",
                    actorId = "user-123",
                    sessionId = "trip-456",
                    topK = 3,
                )
            }
        }
    }
}
```

DSL は以下のヘルパーを提供します：

| ヘルパー | AgentCore 戦略 | ネームスペーススコープ | 取得方法 |
|---|---|---|---|
| `semantic` | セマンティックメモリ | Actor | 類似性検索 |
| `userPreferences` | ユーザー設定 | Actor | レコード一覧 |
| `summary` | 要約 | Actor および session | 類似性検索 |
| `episodes` | エピソード (Episodic episodes) | Actor および session | 類似性検索 |
| `reflections` | リフレクション (Episodic reflections) | Actor | 類似性検索 |
| `episodic` | エピソードおよびリフレクション | 両方のスコープ | 複合類似性検索 |

デフォルトでは、ネームスペースは AWS のドキュメントに記載されているレイアウトに従います。Actor スコープのメモリは `/strategies/{strategyId}/actors/{actorId}/`、session スコープのメモリは `/strategies/{strategyId}/actors/{actorId}/sessions/{sessionId}/` となります。メモリリソースがカスタムネームスペーステンプレートを使用している場合は、`agentcore` ブロックで `AgentcoreNamespaceResolver` を割り当ててください。

デフォルトの `AgentcorePromptAugmenter` は、セマンティック、ユーザー設定、エピソード、およびリフレクションのレコードをシステムメッセージに配置します。要約レコードは最新のユーザーメッセージに追加されます。別の Koog `PromptAugmenter` を使用するには、ブロック内で `augmenter` を設定してください。

### 構成済みメモリ戦略の発見

戦略 ID やネームスペーステンプレートをハードコードしたくない場合は、AWS `BedrockAgentCoreControlClient` で `AgentcoreStrategyDiscovery` を使用し、その結果を `agentcoreDiscovered` に渡します。発見 DSL は、メモリリソースに対して返されたすべてのサポートされている戦略を構成し、取得制限、スコア、フィルタ、ネームスペースパターンの上書き、または個別の戦略の除外を行うことができます。発見されたセットに要約またはエピソード戦略が含まれている場合は、`sessionId` が必要です。

AgentCore は、保存されたイベントから非同期に長期レコードを作成します。そのため、`ChatMemory` によって書き込まれたイベントは、すぐに `LongTermMemory` で利用可能にならない場合があります。