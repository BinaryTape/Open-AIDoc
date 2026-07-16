# チャットメモリ (Chat Memory)

## 機能の概要

ChatMemory機能は、AIエージェントに複数の実行にわたる永続的な会話履歴を提供します。
インストールすると、エージェントは各実行の開始時に自動的に以前のメッセージをロードし、
実行が完了すると更新された会話を保存します。これにより、自然なマルチターンチャットが可能になります。

### 主な機能

- セッションIDごとの会話履歴の自動ロード/保存
- `ChatHistoryProvider` によるプラグ可能なストレージバックエンド
- 履歴サイズの制限やメッセージのフィルタリングを行う組み込みプリプロセッサ
- 任意のメッセージ変換をサポートするカスタムプリプロセッサ

## KoogとMemory機能のインストール

=== "Gradle (Kotlin)"

    ```kotlin title="build.gradle.kts"
    dependencies {
        implementation("ai.koog:koog-agents:0.7.0")
        implementation("ai.koog:agents-features-memory:0.7.0")
    }
    ```

=== "Gradle (Groovy)"

    ```groovy title="build.gradle"
    dependencies {
        implementation 'ai.koog:koog-agents:0.7.0'
        implementation 'ai.koog:agents-features-memory:0.7.0'
    }
    ```

=== "Maven"

    ```xml title="pom.xml"
    <dependency>
        <groupId>ai.koog</groupId>
        <artifactId>koog-agents-jvm</artifactId>
        <version>0.7.0</version>
    </dependency>
    <dependency>
        <groupId>ai.koog</groupId>
        <artifactId>agents-features-memory-jvm</artifactId>
        <version>0.7.0</version>
    </dependency>
    ```

!!! note
    ChatMemoryはバージョン **0.7.0** から利用可能ですが、まだMaven Centralには公開されていません。
    それまでの間は、ローカルビルドまたはスナップショットリポジトリから使用できます。

## 設定と初期化

### 基本設定 (Kotlin)

エージェントブロック内の `installChatMemory` DSLショートカットを使用してChatMemoryをインストールします。
デフォルトでは、プリプロセッサなしのインメモリプロバイダーを使用します。

```kotlin
val toolRegistry = ToolRegistry {
    // ツールを定義
}

val agent = AIAgent(
    promptExecutor = executor,
    llmModel = OpenAIModels.Chat.GPT4oMini,
    systemPrompt = "You are a helpful assistant.",
    toolRegistry = toolRegistry,
) {
    install(ChatMemory)
}
```

カスタムプロバイダーやプリプロセッサを設定する場合：

```kotlin
val agent = AIAgent(
    promptExecutor = executor,
    llmModel = OpenAIModels.Chat.GPT4oMini,
    systemPrompt = "You are a helpful assistant.",
    toolRegistry = toolRegistry,
) {
    install(ChatMemory) {
        chatHistoryProvider = MyDatabaseProvider()
        windowSize(20)
        filterMessages { it is Message.User || it is Message.Assistant }
    }
}
```

### セッションIDを使用した実行

`agent.run()` の第2引数は、ChatMemoryが会話を識別するためのキーとして使用するセッションIDです。

```kotlin
// 1ターン目
agent.run("フランスの首都は何ですか？", "session-1")

// 2ターン目 — エージェントは前回のやり取りを把握しています
agent.run("では、ドイツはどうですか？", "session-1")
```

異なるセッションIDを使用すると、完全に隔離された履歴が作成されます。

## プリプロセッサ (Preprocessors)

プリプロセッサは、ロード時（エージェントが参照する前）と保存時（永続化する前）の両方でメッセージリストを変換します。これらは追加された順序で順次実行されます。

### 組み込みプリプロセッサ

| 設定メソッド | プリプロセッサクラス | 挙動 |
|---|---|---|
| `windowSize(n)` | `WindowSizePreProcessor` | 直近の `n` メッセージのみを保持 |
| `filterMessages { ... }` | `FilterMessagesPreProcessor` | 述語（predicate）に一致するメッセージのみを保持 |

### 順序の重要性

プリプロセッサはチェーン化されます。各プリプロセッサの出力が次のプリプロセッサの入力になります。

```kotlin
// 効果: 直近10メッセージを保持し、その10メッセージの中から短いものをフィルタリングする
windowSize(10)
filterMessages { it.content.length <= 100 }

// 効果: まず短いメッセージをフィルタリングし、残ったものの中から直近10メッセージを保持する
filterMessages { it.content.length <= 100 }
windowSize(10)
```

### カスタムプリプロセッサ

`ChatMemoryPreProcessor` インターフェースを実装します。

```kotlin
class RedactEmailsPreProcessor : ChatMemoryPreProcessor {
    override fun preprocess(messages: List<Message>): `List<Message>` {
        return messages.map { message ->
            // メッセージ内容に含まれるメールアドレスを置換
            Message.User(message.content.replace(Regex("[\\w.]+@[\\w.]+"), "[REDACTED]"))
        }
    }
}
```

その後、設定に追加します。

```kotlin
install(ChatMemory) {
    addPreProcessor(RedactEmailsPreProcessor())
    windowSize(50)
}
```

## カスタム履歴プロバイダー

デフォルトの `InMemoryChatHistoryProvider` はスレッドセーフですが、永続的ではありません（再起動時に履歴が失われます）。プロダクション環境で使用する場合は、`ChatHistoryProvider` を実装してください。

```kotlin
class DatabaseChatHistoryProvider(private val db: Database) : ChatHistoryProvider {
    override suspend fun store(conversationId: String, messages: List<Message>) {
        db.saveMessages(conversationId, messages)
    }

    override suspend fun load(conversationId: String): `List<Message>` {
        return db.loadMessages(conversationId) ?: emptyList()
    }
}
```

重要なコントラクト：
- `store` は指定された `conversationId` の履歴全体を置き換えます（追記のみではありません）。
- `load` は履歴が存在しない場合に空のリストを返します（決して null を返しません）。
- 両方のメソッドは `suspend` であるため、非同期 I/O を安全に行えます。

## Java API

すべての設定メソッドは `ChatMemoryConfig` を返すため、流れるようなインターフェース（fluent chaining）が可能です。

```java
AIAgent<String, String> agent = AIAgent.builder()
    .promptExecutor(executor)
    .llmModel(OpenAIModels.Chat.GPT4oMini)
    .systemPrompt("You are a helpful assistant.")
    .install(ChatMemory.Feature, config -> config
            .chatHistoryProvider(new MyDatabaseProvider())
            .windowSize(20)
            .filterMessages(msg -> msg instanceof Message.User))
    .build();
```

`MessageFilter` は `fun interface` であるため、Javaのラムダ式が直接動作します。

## 典型的なユースケース：バックエンドアプリケーション

ChatMemoryの一般的なパターンは、クライアントに代わってエージェントとの対話を管理するバックエンドサービスです。各HTTPリクエストがセッションIDを持ち、エージェントは一致する会話履歴をロードし、レスポンスを生成して、更新された履歴を保存します。これらすべてが透過的に行われます。

```kotlin
// --- Controller ---

@RestController
class ChatController(private val agentService: ChatAgentService) {
    @PostMapping("/chat")
    suspend fun chat(@RequestBody request: ChatRequest): ChatResponse {
        val reply = agentService.chat(request.sessionId, request.message)
        return ChatResponse(reply)
    }
}

// --- Service ---

@Service
class ChatAgentService(private val executor: SingleLLMPromptExecutor) {
    private val toolRegistry = ToolRegistry {
        // ここでツールを登録
    }

    private val agent = AIAgent(
        promptExecutor = executor,
        llmModel = OpenAIModels.Chat.GPT4oMini,
        systemPrompt = "You are a helpful assistant.",
        toolRegistry = toolRegistry,
    ) {
        install(ChatMemory) {
            chatHistoryProvider = MyDatabaseProvider() // 永続ストレージ
            windowSize(50)
        }
    }

    suspend fun chat(sessionId: String, message: String): String {
        return agent.run(message, sessionId)
    }
}
```

Spring BootでのKoogのセットアップに関する詳細なガイドについては、
[Spring Boot 統合ガイド](spring-boot.md) を参照してください。

## ChatMemory と Persistence の比較

ChatMemoryと [エージェントの永続化 (Agent Persistence)](agent-persistence.md) は異なる目的を持ち、組み合わせて使用することができます。

**ChatMemory** は、各 `agent.run()` 呼び出しをアトミックで自己完結したループとして扱います。会話履歴は実行が始まる前にロードされ、実行が正常に完了した後に保存されます。実行途中でエージェントがクラッシュした場合、進行中のメッセージは保存**されません**。履歴はその実行が始まる前の状態のままとなります。

**Persistence** は、実行中のエージェントの内部実行状態（グラフノード、メッセージ履歴、入力/出力）をチェックポイントとしてキャプチャします。エージェントがクラッシュした場合、最初からやり直すのではなく、最後のチェックポイントから再開できます。

| | ChatMemory | Persistence |
|---|---|---|
| **保存内容** | 実行をまたいだ会話メッセージ | 実行内の実行状態 |
| **保存タイミング** | `agent.run()` 完了後 | 各グラフノードの後（または手動） |
| **クラッシュ時の挙動** | 進行中の実行内容は失われる。以前の履歴は無傷。 | 最後のチェックポイントから再開可能 |
| **主な用途** | マルチターンチャットの継続性 | 長時間実行されるエージェント、クラッシュリカバリ |

実行途中でクラッシュした場合のコストが高い長時間実行タスクをエージェントが行う場合は、両方の機能をインストールすることを検討してください。

```kotlin
val agent = AIAgent(
    promptExecutor = executor,
    llmModel = OpenAIModels.Chat.GPT4oMini,
    systemPrompt = "You are a helpful assistant.",
) {
    install(ChatMemory) {
        chatHistoryProvider = MyDatabaseProvider()
        windowSize(50)
    }
    install(Persistence) {
        storage = MyPersistenceStorageProvider()
        enableAutomaticPersistence = true
    }
}
```

## ベストプラクティス

1. **常にウィンドウサイズを設定する** — 設定しない場合、プロンプトのサイズが会話の長さに応じて際限なく増加します。
2. **プリプロセッサの順序を慎重に選ぶ** — ウィンドウ処理の前にフィルタリングするか、フィルタリングの後にウィンドウ処理するかで結果が異なります。
3. **意味のあるセッションIDを使用する** — これらは履歴を隔離するためのキーです。ユーザーID、チャットスレッドID、またはUUIDなどが適しています。
4. **プロダクションでは永続プロバイダーを実装する** — `InMemoryChatHistoryProvider` は再起動時に履歴を失います。