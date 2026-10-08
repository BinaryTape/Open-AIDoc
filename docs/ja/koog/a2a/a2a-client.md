---
status: beta
---

# A2Aクライアント

--8<-- "versioning-snippets.md:beta"

A2Aクライアントを使用すると、ネットワーク経由でA2A準拠のエージェントと通信できるようになります。
このクライアントは、[A2Aプロトコル仕様](https://a2a-protocol.org/latest/specification/)の完全な実装を提供し、エージェントのディスカバリ（発見）、メッセージ交換、タスク管理、およびリアルタイムのストリーミングレスポンスを処理します。

## 依存関係 {id="dependencies"}

プロジェクトでA2Aクライアントを使用するには、以下の依存関係を `build.gradle.kts` に追加してください。

```kotlin
dependencies {
    // A2Aクライアントのコアライブラリ
    implementation("ai.koog:a2a-client:$koogVersion")

    // HTTP JSON-RPCトランスポート（最も一般的）
    implementation("ai.koog:a2a-transport-client-jsonrpc-http:$koogVersion")

    // Ktorクライアントエンジン（ニーズに合ったものを1つ選択してください）
    implementation("io.ktor:ktor-client-cio:$ktorVersion")
}
```

## 概要 {id="overview"}

A2Aクライアントは、アプリケーションとA2A準拠のエージェントとの間の架け橋として機能します。
プロトコルへの準拠を維持し、堅牢なセッション管理を提供しながら、通信のライフサイクル全体をオーケストレートします。

## 主要コンポーネント {id="core-components"}

### A2AClient {id="a2aclient"}

完全なA2Aプロトコルを実装するメインのクライアントクラスです。以下を行う中心的なコーディネーターとして機能します。

- プラグイン可能なリゾルバー（resolver）を通じて、接続とエージェントのディスカバリを**管理**する
- 自動的なプロトコル準拠により、メッセージ交換とタスク操作を**オーケストレート**する
- エージェントがサポートしている場合、ストリーミングレスポンスとリアルタイム通信を**処理**する
- 堅牢なアプリケーションのために、包括的なエラー処理とフォールバックメカニズムを**提供**する

`A2AClient` は、以下の2つの必須パラメータを受け取ります。

* `ClientTransport`: ネットワーク通信レイヤーを処理します。
* `AgentCardResolver`: エージェントのディスカバリとメタデータの取得を処理します。

`A2AClient` インターフェースは、A2Aエージェントと対話するためのいくつかの主要なメソッドを提供します。

* `connect` メソッド - エージェントに接続してその機能（capabilities）を取得します。これにより、エージェントが何を実行できるかを検出し、AgentCardをキャッシュします。
* `sendMessage` メソッド - シンプルなリクエスト・レスポンスパターンのために、エージェントにメッセージを送信し、単一のレスポンスを受け取ります。
* `sendMessageStreaming` メソッド - リアルタイムレスポンスのためにストリーミングサポート付きでメッセージを送信します。部分的なメッセージやタスクの更新を含むイベントの `Flow` を返します。
* `getTask` メソッド - 特定のタスクのステータスと詳細を照会します。
* `cancelTask` メソッド - エージェントがキャンセルをサポートしている場合、実行中のタスクをキャンセルします。
* `cachedAgentCard` メソッド - ネットワークリクエストを行わずに、キャッシュされたエージェントカードを取得します。`connect` がまだ呼び出されていない場合は null を返します。

### ClientTransport {id="clienttransport"}

`ClientTransport` インターフェースは低レベルのネットワーク通信を処理し、A2Aクライアントはプロトコルロジックを管理します。
トランスポート固有の詳細を抽象化するため、異なるプロトコルをシームレスに使用できます。

#### HTTP JSON-RPC トランスポート {id="http-json-rpc-transport"}

A2Aエージェントで最も一般的なトランスポートです。

```kotlin
val transport = HttpJSONRPCClientTransport(
    url = "https://agent.example.com/a2a",        // エージェントのエンドポイントURL
    httpClient = HttpClient(CIO) {                // オプション：カスタムHTTPクライアント
        install(ContentNegotiation) {
            json()
        }
        install(HttpTimeout) {
            requestTimeoutMillis = 30000
        }
    }
)
```

### AgentCardResolver {id="agentcardresolver"}

`AgentCardResolver` インターフェースは、エージェントのメタデータと機能を取得します。
さまざまなソースからのエージェント探索を可能にし、最適なパフォーマンスのためのキャッシュ戦略をサポートします。

#### URL Agent Card Resolver {id="url-agent-card-resolver"}

A2Aの慣例に従い、HTTPエンドポイントからエージェントカードを取得します。

```kotlin
val agentCardResolver = UrlAgentCardResolver(
    baseUrl = "https://agent.example.com",           // エージェントサービスのベースURL
    path = "/.well-known/agent-card.json",           // 標準的なエージェントカードの場所
    httpClient = HttpClient(CIO),                    // オプション：カスタムHTTPクライアント
)
```

## クイックスタート {id="quickstart"}

### 1. クライアントの作成 {id="1-create-the-client"}

トランスポートとエージェントカードリゾルバーを定義し、クライアントを作成します。

```kotlin
// HTTP JSON-RPC トランスポート
val transport = HttpJSONRPCClientTransport(
    url = "https://agent.example.com/a2a"
)

// エージェントカードリゾルバー
val agentCardResolver = UrlAgentCardResolver(
    baseUrl = "https://agent.example.com",
    path = "/.well-known/agent-card.json"
)

// クライアントの作成
val client = A2AClient(transport, agentCardResolver)
```

### 2. 接続とディスカバリ {id="2-connect-and-discover"}

エージェントに接続し、そのカードを取得します。
エージェントのカードを取得することで、その機能を照会したり、その他の操作を実行したりできるようになります。例えば、ストリーミングをサポートしているかどうかの確認などが可能です。

```kotlin
// 接続してエージェントの機能を取得
client.connect()
val agentCard = client.cachedAgentCard()

println("接続先: ${agentCard.name}")
println("ストリーミングのサポート: ${agentCard.capabilities.streaming}")
```

### 3. メッセージの送信 {id="3-send-messages"}

エージェントにメッセージを送信し、単一のレスポンスを受け取ります。
レスポンスは、エージェントが直接応答した場合はメッセージ、エージェントがタスクを実行している場合はタスクイベントのいずれかになります。

```kotlin
val message = Message(
    messageId = UUID.randomUUID().toString(),
    role = Role.User,
    parts = listOf(TextPart("Hello, agent!")),
    contextId = "conversation-1"
)

val request = Request(data = MessageSendParams(message))
val response = client.sendMessage(request)

// レスポンスの処理
when (val event = response.data) {
    is Message -> {
        val text = event.parts
            .filterIsInstance<TextPart>()
            .joinToString { it.text }
        print(text)
    }
    is TaskEvent -> {
        if (event.final) {
            println("\nタスク完了")
        }
    }
}
```

### 4. メッセージのストリーミング送信 {id="4-send-messages-streaming"}

A2Aクライアントは、リアルタイム通信のためのストリーミングレスポンスをサポートしています。
単一のレスポンスを受け取る代わりに、メッセージやタスクの更新を含むイベントの `Flow` を返します。

```kotlin
// エージェントがストリーミングをサポートしているか確認
if (client.cachedAgentCard()?.capabilities?.streaming == true) {
    client.sendMessageStreaming(request).collect { response ->
        when (val event = response.data) {
            is Message -> {
                val text = event.parts
                    .filterIsInstance<TextPart>()
                    .joinToString { it.text }
                print(text) // 部分的なレスポンスをストリーム表示
            }
            is TaskStatusUpdateEvent -> {
                if (event.final) {
                    println("\nタスク完了")
                }
            }
        }
    }
} else {
    // ストリーミング非対応の場合のフォールバック
    val response = client.sendMessage(request)
    // 単一のレスポンスを処理
}
```

### 5. タスクの管理 {id="5-manage-tasks"}

A2Aクライアントは、サーバータスクのステータスを照会したり、キャンセルしたりするためのメソッドを提供します。

```kotlin
// タスクステータスの照会
val taskRequest = Request(data = TaskQueryParams(taskId = "task-123"))
val taskResponse = client.getTask(taskRequest)
val task = taskResponse.data

println("タスクの状態: ${task.status.state}")

// 実行中のタスクをキャンセル
if (task.status.state == TaskState.Working) {
    val cancelRequest = Request(data = TaskIdParams(taskId = "task-123"))
    val cancelledTask = client.cancelTask(cancelRequest).data
    println("タスクがキャンセルされました: ${cancelledTask.status.state}")
}
```
