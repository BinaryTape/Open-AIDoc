---
status: beta
---

# エージェントクライアントプロトコル (Agent Client Protocol)

--8<-- "versioning-snippets.md:beta"

エージェントクライアントプロトコル (Agent Client Protocol: ACP) は、クライアントアプリケーションが一貫した双方向インターフェースを介して AI エージェントと通信できるようにする、オープンソースの標準化されたプロトコルです。
Koog エージェントに ACP を実装することで、IDE などの ACP 準拠のあらゆる環境に簡単に統合できるようになります。

プロトコルの詳細については、[Agent Client Protocol] のドキュメントを参照してください。

## Koog との統合 {id="integration-with-koog"}

Koog フレームワークは、[ACP Kotlin SDK] を使用し、追加の API 拡張機能を介して ACP と統合します。
この統合により、以下が可能になります。

* Koog エージェントと ACP 準拠のクライアントアプリケーション間の標準化された通信
* ツール呼び出し、エージェントの思考 (thought)、および完了に関する実行状況の自動更新
* Koog のマルチモーダルメッセージ形式と ACP のコンテンツブロック間のシームレスなメッセージ変換
* Koog のエージェントの状態から ACP セッションイベントへのライフサイクルマッピング

!!! note

    [ACP Kotlin SDK] は JVM 固有であるため、ACP 統合は現在 JVM プラットフォームでのみ利用可能です。

### 依存関係の追加 {id="add-dependencies"}

ACP サポートはオプションの[機能 (feature)](features/index.md) であり、Koog ではデフォルトでは利用できません。
Koog エージェントに ACP を実装するには、[ai.koog:agents-features-acp](https://mvnrepository.com/artifact/ai.koog/agents-features-acp) の依存関係を追加してください。
このモジュール自体が [com.agentclientprotocol:acp](https://mvnrepository.com/artifact/com.agentclientprotocol/acp) に依存しています。

例えば、`build.gradle.kts` の場合は以下のようになります。

```kotlin
dependencies {
    implementation("ai.koog:agents-features-acp:$koogVersion")
}
```

### Koog エージェントで ACP を有効にする {id="enable-acp-for-a-koog-agent"}

Koog エージェントの内部[イベントシステム](agent-events.md)を ACP プロトコルと橋渡しするには、`ai.koog.agents.features.acp.AcpAgent` 機能をインストールします。
インストールされると、この機能はライフサイクルイベント（ツール呼び出しや LLM のレスポンスなど）をリッスンし、それらを ACP クライアントに送信します。

<!--- CLEAR -->
<!--- INCLUDE
import ai.koog.agents.core.agent.AIAgent
import ai.koog.agents.features.acp.AcpAgent
import ai.koog.prompt.executor.clients.openai.OpenAIModels
import ai.koog.prompt.executor.llms.all.simpleOpenAIExecutor

-->
```kotlin
val agent = AIAgent(
    promptExecutor = simpleOpenAIExecutor(System.getenv("OPENAI_API_KEY")),
    llmModel = OpenAIModels.Chat.GPT4o
) {
    install(AcpAgent) {
        this.sessionId = sessionId
        this.protocol = protocol
        this.eventsProducer = eventsProducer
        this.setDefaultNotifications = true
    }
}
```
<!--- KNIT example-agent-client-protocol-01.kt -->

主な構成オプション:

*   **`sessionId`**: 現在の会話セッションを識別する一意の文字列。
*   **`protocol`**: 低レベルの通信に使用される [`com.agentclientprotocol.protocol.Protocol`](https://github.com/agentclientprotocol/kotlin-sdk/blob/master/acp/src/commonMain/kotlin/com/agentclientprotocol/protocol/Protocol.kt) のインスタンス。
*   **`eventsProducer`**: ACP イベントが送信される `kotlinx.coroutines.channels.ProducerScope<Event>`。
    詳細については、[イベントストリーミング](#event-streaming)を参照してください。
*   **`setDefaultNotifications`**: エージェントのライフサイクルイベントに対してデフォルトの通知ハンドラーを登録するかどうか。
    詳細については、[エージェント通知の処理](#handling-agent-notifications)を参照してください。

このエージェントは、次の章で説明するように、ACP セッションのスコープ内で実行する必要があります。

### ACP 対応エージェントの実装 {id="implement-an-acp-enabled-agent"}

Koog エージェントを ACP クライアントに接続するには、[ACP Kotlin SDK](https://github.com/agentclientprotocol/kotlin-sdk) の 2 つのコアインターフェースを実装します。

- [`AgentSupport`](https://github.com/agentclientprotocol/kotlin-sdk/blob/master/acp/src/commonMain/kotlin/com/agentclientprotocol/agent/AgentSupport.kt):
  エージェントのアイデンティティ、機能、およびセッションのライフサイクル（セッションの作成や読み込み）を管理します。
- [`AgentSession`](https://github.com/agentclientprotocol/kotlin-sdk/blob/master/acp/src/commonMain/kotlin/com/agentclientprotocol/agent/AgentSession.kt):
  単一の会話セッションを管理し、`prompt` の実行を処理し、キャンセルの管理を行います。

`AgentSession` の `prompt()` メソッド内で、ACP 対応の Koog エージェントを初期化して実行します。以下に例を示します。

=== "AgentSession"

    <!--- INCLUDE
    import ai.koog.agents.core.agent.AIAgent
    import ai.koog.agents.core.agent.config.AIAgentConfig
    import ai.koog.agents.features.acp.AcpAgent
    import ai.koog.agents.features.acp.toKoogMessage
    import ai.koog.prompt.Prompt
    import ai.koog.prompt.dsl.prompt
    import ai.koog.prompt.executor.clients.openai.OpenAIModels
    import ai.koog.prompt.executor.model.PromptExecutor
    import com.agentclientprotocol.agent.AgentSession
    import com.agentclientprotocol.common.Event
    import com.agentclientprotocol.model.ContentBlock
    import com.agentclientprotocol.model.SessionId
    import com.agentclientprotocol.protocol.Protocol
    import kotlinx.coroutines.Deferred
    import kotlinx.coroutines.async
    import kotlinx.coroutines.flow.Flow
    import kotlinx.coroutines.flow.channelFlow
    import kotlinx.coroutines.sync.Mutex
    import kotlinx.coroutines.sync.withLock
    import ai.koog.utils.time.KoogClock
    import kotlinx.serialization.json.JsonElement
    -->
    ```kotlin
    class MyAgentSession(
        override val sessionId: SessionId,
        private val promptExecutor: PromptExecutor,
        private val protocol: Protocol,
        private val clock: KoogClock
    ) : AgentSession {
    
        private var agentJob: Deferred<Unit>? = null
        private val agentMutex = Mutex()
    
        override suspend fun prompt(
            content: List<ContentBlock>,
            _meta: JsonElement?
        ): Flow<Event> = channelFlow {
            val agentConfig = AIAgentConfig(
                prompt = prompt("acp") {
                    system("You are a helpful assistant.")
                }.appendPrompt(content),
                model = OpenAIModels.Chat.GPT4o,
                maxAgentIterations = 1000
            )
    
            // 一度に 1 つのエージェントセッションのみが実行されるようにする
            agentMutex.withLock {
                val agent = AIAgent(
                    promptExecutor = promptExecutor,
                    agentConfig = agentConfig
                ) {
                    install(AcpAgent) {
                        this.sessionId = this@MyAgentSession.sessionId.value
                        this.protocol = this@MyAgentSession.protocol
                        this.eventsProducer = this@channelFlow
                        this.setDefaultNotifications = true
                    }
                }

                agentJob = async { agent.run("Hello. How can you help me?") }
                agentJob?.await()
            }
        }
    
        private fun Prompt.appendPrompt(content: List<ContentBlock>): Prompt {
            return withMessages { messages ->
                messages + listOf(content.toKoogMessage(clock))
            }
        }
    
        override suspend fun cancel() {
            agentJob?.cancel()
        }
    }
    ```
    <!--- KNIT example-agent-client-protocol-02.kt -->

=== "AgentSupport"

    <!--- INCLUDE
    import ai.koog.prompt.executor.model.PromptExecutor
    import com.agentclientprotocol.agent.AgentInfo
    import com.agentclientprotocol.agent.AgentSession
    import com.agentclientprotocol.agent.AgentSupport
    import com.agentclientprotocol.client.ClientInfo
    import com.agentclientprotocol.common.Event
    import com.agentclientprotocol.common.SessionCreationParameters
    import com.agentclientprotocol.model.AgentCapabilities
    import com.agentclientprotocol.model.ContentBlock
    import com.agentclientprotocol.model.LATEST_PROTOCOL_VERSION
    import com.agentclientprotocol.model.PromptCapabilities
    import com.agentclientprotocol.model.SessionId
    import com.agentclientprotocol.protocol.Protocol
    import kotlinx.coroutines.flow.Flow
    import kotlinx.serialization.json.JsonElement
    import ai.koog.utils.time.KoogClock
    import kotlin.uuid.ExperimentalUuidApi
    import kotlin.uuid.Uuid
    class MyAgentSession(
        override val sessionId: SessionId,
        private val promptExecutor: PromptExecutor,
        private val protocol: Protocol,
        private val clock: KoogClock
    ): AgentSession {
        override suspend fun prompt(
            content: List<ContentBlock>,
            _meta: JsonElement?
        ): Flow<Event> {
            TODO("Not yet implemented")
        }
    }
    -->
    ```kotlin
    class MyAgentSupport(
        private val promptExecutor: PromptExecutor,
        private val clock: KoogClock,
        private val protocol: Protocol,
    ) : AgentSupport {
    
        override suspend fun initialize(clientInfo: ClientInfo): AgentInfo {
            return AgentInfo(
                protocolVersion = LATEST_PROTOCOL_VERSION,
                capabilities = AgentCapabilities(
                    loadSession = false, // セッションの永続化を実装する場合は true に設定
                    promptCapabilities = PromptCapabilities(
                        audio = false,
                        image = false,
                        embeddedContext = true
                    )
                )
            )
        }
    
        @OptIn(ExperimentalUuidApi::class)
        override suspend fun createSession(sessionParameters: SessionCreationParameters): AgentSession {
            val sessionId = SessionId(Uuid.random().toString())
            return MyAgentSession(sessionId, promptExecutor, protocol, clock)
        }
    
        override suspend fun loadSession(sessionId: SessionId, sessionParameters: SessionCreationParameters): AgentSession {
            throw UnsupportedOperationException("Session loading not implemented")
        }
    }
    ```
    <!--- KNIT example-agent-client-protocol-03.kt -->

## イベントストリーミング {id="event-streaming"}

例の `AgentSession` では、イベントの `channelFlow` を返す `prompt()` 関数を定義しています。
次に、`this@channelFlow` を `eventsProducer` として `AcpAgent` 機能をインストールします。
これにより、異なるコルーチンからイベントを送信できるようになります。

## 実行の同期化 {id="execution-synchronization"}

例の `AgentSession` では、ACP が前の実行が終了するまで新しいエージェントの実行をトリガーすべきではないため、ミューテックスを使用してエージェントインスタンスへのアクセスを同期しています。
このため、エージェントの作成と実行は、定義されたミューテックスに対する `withLock` のスコープ内で行われます。

また、エージェントが途中でキャンセルされないように、`channelFlow` スコープ内でエージェントを非同期実行し、`agentJob` という Deferred ジョブとして管理しています。

## ACP クライアント入力の処理 {id="handling-acp-client-input"}

ACP クライアントは、ユーザー入力を [`ContentBlock`](https://agentclientprotocol.com/protocol/schema#contentblock) オブジェクトのリストとして送信します。
これらを Koog で処理するには、`List<ContentBlock>.toKoogMessage()` 拡張関数を使用して ACP コンテンツブロックを [`Message.User`](api:prompt-model::ai.koog.prompt.message.Message.User) に変換し、それを[エージェントのプロンプト](prompts/index.md)に追加します。

例の `AgentSession` では、ACP セッションで初期エージェントプロンプトを拡張するためのプライベート関数を定義しています。

<!--- INCLUDE
import ai.koog.agents.features.acp.toKoogMessage
import ai.koog.prompt.Prompt
import com.agentclientprotocol.model.ContentBlock
import ai.koog.utils.time.KoogClock

val clock: KoogClock = KoogClock.System
-->
```kotlin
private fun Prompt.appendPrompt(content: List<ContentBlock>): Prompt {
    return withMessages { messages ->
        messages + listOf(content.toKoogMessage(clock))
    }
}
```
<!--- KNIT example-agent-client-protocol-04.kt -->

!!! note

    メッセージにタイムスタンプを付与するために、`KoogClock` インスタンスが必要です。

詳細については、[メッセージの変換](#converting-messages)を参照してください。

## メッセージの変換 {id="converting-messages"}

`agents-features-acp` モジュールは、Koog の内部メッセージタイプと [ACP コンテンツブロック](https://agentclientprotocol.com/protocol/content)をシームレスに変換するための拡張関数を提供します。

ACP クライアントから入力を受信する際は、以下の関数を使用します。

- `List<ContentBlock>.toKoogMessage()` は、ACP コンテンツブロックのリストを [`Message.User`](api:prompt-model::ai.koog.prompt.message.Message.User) に変換します。
- `ContentBlock.toKoogContentPart()` は、単一の ACP コンテンツブロックを [`ContentPart`](api:prompt-model::ai.koog.prompt.message.ContentPart) に変換します。

Koog メッセージから ACP イベントまたはコンテンツブロックを作成する際は、以下の関数を使用します。

- `Message.Response.toAcpEvents()` は、[`Message.Response`](api:prompt-model::ai.koog.prompt.message.Message.Response) を ACP セッション更新イベントのリストに変換します。
- `ContentPart.toAcpContentBlock()` は、[`ContentPart`](api:prompt-model::ai.koog.prompt.message.ContentPart) を単一の ACP コンテンツブロックに変換します。

## エージェント通知の処理 {id="handling-agent-notifications"}

デフォルトでは `setDefaultNotifications` は `true` に設定されており、ACP 対応エージェントは以下の通知を自動的に処理します。

- **エージェントの完了**

    エージェントが正常に完了したときに、`StopReason.END_TURN` を含む `PromptResponseEvent` を送信します。

- **エージェント実行の失敗**

    適切な停止理由を含む `PromptResponseEvent` を送信します。

    - エージェントが最大反復回数を超えた場合は `StopReason.MAX_TURN_REQUESTS`
    - その他の実行失敗については `StopReason.REFUSAL`
  
- **LLM のレスポンス**

    LLM のレスポンスを ACP イベント（テキスト、ツール呼び出し、推論）として変換し、送信します。

- **ツール呼び出しのライフサイクル**

    ツール呼び出しのステータス変更を報告します。

    - ツール呼び出し開始時の `ToolCallStatus.IN_PROGRESS`
    - ツール呼び出し成功時の `ToolCallStatus.COMPLETED`
    - ツール呼び出し失敗時の `ToolCallStatus.FAILED`

通知処理をカスタマイズしたい場合は、`setDefaultNotifications = false` に設定し、仕様に従ってエージェントイベントを処理してください。

## カスタムイベントの送信 {id="sending-custom-events"}

自動通知に加えて、`withAcpAgent` ブロック内の `sendEvent` を使用して、エージェント実行中の任意の時点で ACP クライアントにカスタムイベントを送信できます。
これは、進捗状況の更新、カスタムステータスメッセージ、またはプランの更新に役立ちます。

これは `AIAgentContext` 内、例えばノード内で行うことができます。

<!--- INCLUDE
import ai.koog.agents.core.dsl.builder.strategy
import ai.koog.agents.core.dsl.builder.node
import ai.koog.agents.features.acp.withAcpAgent
import com.agentclientprotocol.common.Event
import com.agentclientprotocol.model.Plan
import com.agentclientprotocol.model.SessionUpdate
import com.agentclientprotocol.protocol.sendRequest
-->
```kotlin
val plan: Plan = TODO()

val strategy = strategy<Unit, Unit>("my-strategy") {
    val node by node<Unit, Unit> {
        withAcpAgent {
            sendEvent(
                Event.SessionUpdateEvent(
                    SessionUpdate.PlanUpdate(plan.entries)
                )
            )
        }
    }
}
```
<!--- KNIT example-agent-client-protocol-05.kt -->

また、基盤となる `protocol` にアクセスして、認証リクエストなどのカスタムリクエストをクライアントに送信することもできます。

<!--- INCLUDE
import ai.koog.agents.core.dsl.builder.strategy
import ai.koog.agents.core.dsl.builder.node
import ai.koog.agents.features.acp.withAcpAgent
import com.agentclientprotocol.model.AcpMethod
import com.agentclientprotocol.model.AuthMethodId
import com.agentclientprotocol.model.AuthenticateRequest
import com.agentclientprotocol.protocol.sendRequest
-->
```kotlin
val strategy = strategy<Unit, Unit>("my-strategy") {
    val node by node<Unit, Unit> {
        withAcpAgent {
            protocol.sendRequest(
                AcpMethod.AgentMethods.Authenticate,
                AuthenticateRequest(methodId = AuthMethodId("Google"))
            )
        }
    }
}
```
<!--- KNIT example-agent-client-protocol-06.kt -->

## 使用例 {id="examples"}

Koog リポジトリの [/examples](https://github.com/JetBrains/koog/tree/develop/examples/) の下に、動作する Koog エージェントの例があります。

### コンソールベースの ACP クライアントの実行 {id="running-a-console-based-acp-client"}

この例では、シンプルな Koog エージェントとやり取りするコンソールベースの ACP クライアントを実行します。

1. [/examples/simple-examples](https://github.com/JetBrains/koog/blob/develop/examples/simple-examples/) を開きます。
2. LLM プロバイダーの API キーを構成する方法については、[README](https://github.com/JetBrains/koog/blob/develop/examples/simple-examples/README.md) を参照してください。
3. `runExampleAcpApp` Gradle タスクを実行します。
4. コンソールで ACP クライアントが起動したら、エージェントへのリクエストを入力します。例：
    ```text
    List files in the current directory and create a new file named 'acp-test.txt' with the content 'Hello from ACP!'.
    ```
5. コンソールのイベントトレースを観察します。Koog イベントがどのように ACP イベントに変換され、クライアントに送信されるかを確認できます。

### ACP 対応の Koog エージェントを JetBrains IDE に接続する {id="connecting-an-acp-enabled-koog-agent-to-a-jetbrains-ide"}

この例では、ACP 対応エージェントを作成し、IntelliJ IDEA に接続する方法を示します。

1. [/examples/acp-agent](https://github.com/JetBrains/koog/tree/develop/examples/acp-agent) を開きます。
2. `installDist` Gradle タスクを実行します。
3. これにより、エージェントの実行ファイル `build/install/acp-agent/bin/acp-agent` （Windows の場合は `acp-agent.bat`）が作成されます。
4. IntelliJ IDEA (または他の JetBrains IDE) を開きます。
5. **AI Chat** > **Options** > **Add Custom Agent** に移動します。
6. 開いた `acp.json` ファイルに、以下を貼り付けます。

    ```json
    {
        "agent_servers": {
            "Koog Agent": {
                "command": "/absolute/path/to/acp-agent/build/install/acp-agent/bin/acp-agent",
                "args": [],
                "env": {
                    "OPENAI_API_KEY": "ここにAPIキーを貼り付け"
                }
            }
        }
    }
    ```

    構成パラメータ:

    - `agent_servers`: 1 つ以上のエージェント構成を含むオブジェクト
    - `Koog Agent`: IDE のエージェントセレクターに表示される表示名
    - `command`: エージェント実行ファイルへの絶対パス
    - `args`: コマンドライン引数（このエージェントの場合は空）
    - `env`: エージェントプロセスに渡される環境変数（この例では OpenAI API キー）

7. エージェントが **AI Chat** ツールウィンドウで利用可能になります。

カスタムエージェントを IDE に追加する方法の詳細については、[AI Assistant のドキュメント](https://www.jetbrains.com/help/ai-assistant/acp.html#add-custom-agent)および[こちらのブログ記事](https://blog.jetbrains.com/ai/2026/02/koog-x-acp-connect-an-agent-to-your-ide-and-more/)を参照してください。

[Agent Client Protocol]: https://agentclientprotocol.com
[ACP Kotlin SDK]: https://github.com/agentclientprotocol/kotlin-sdk