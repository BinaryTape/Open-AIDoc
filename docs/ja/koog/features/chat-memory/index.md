# チャットメモリ

`ChatMemory`機能を使用すると、AIエージェントが会話履歴を保存し、複数の実行にわたってその履歴を取得できるようになります。
インストールすると、エージェントは各実行の開始時に以前のメッセージを自動的に読み込み、実行完了時に更新された会話を保存します。これにより、自然なマルチターンのチャットが可能になります。

主な機能：

- セッションIDごとの会話履歴の自動読み込みと保存
- `ChatHistoryProvider`による差し替え可能なストレージバックエンド
- 履歴サイズを制限し、メッセージをフィルタリングするための組み込みプリプロセッサ
- 任意のメッセージ変換のためのカスタムプリプロセッサのサポート

## 依存関係の追加

チャットメモリはオプションの[機能](../index.md)であり、Koogではデフォルトでは利用できません。
Koogエージェントにチャットメモリを実装するには、[`ai.koog:agents-features-memory`](https://mvnrepository.com/artifact/ai.koog/agents-features-memory)の依存関係を追加してください。

=== "Gradle (Kotlin)"

    ```kotlin title="build.gradle.kts"
    dependencies {
        implementation("ai.koog:agents-features-memory:$koogVersion")
    }
    ```

=== "Gradle (Groovy)"

    ```groovy title="build.gradle"
    dependencies {
        implementation 'ai.koog:agents-features-memory:$koogVersion'
    }
    ```

=== "Maven"

    ```xml title="pom.xml"
    <dependency>
        <groupId>ai.koog</groupId>
        <artifactId>agents-features-memory-jvm</artifactId>
        <version>$koogVersion</version>
    </dependency>
    ```

!!! note
    `ChatMemory`機能は、Koogバージョン **0.7.0** 以降で利用可能です。

## チャットメモリの有効化

エージェントの作成時に`install()`メソッドを使用して`ChatMemory`をインストールします。

=== "Kotlin"
    
    ```kotlin
    val agent = AIAgent(
        promptExecutor = simpleOpenAIExecutor(System.getenv("OPENAI_API_KEY")),
        llmModel = OpenAIModels.Chat.GPT4oMini
    ) {
        install(ChatMemory)
    }
    ```
    
=== "Java"
    
    ```java
    AIAgent<String, String> agent = AIAgent.builder()
        .promptExecutor(executor)
        .llmModel(OpenAIModels.Chat.GPT4oMini)
        .install(ChatMemory.Feature)
        .build();
    ```

デフォルトでは、[プリプロセッサ](#preprocessors)のない、インメモリの[チャット履歴プロバイダー](#history-providers)を使用します。
カスタムのチャット履歴プロバイダーやプリプロセッサを使用するように`ChatMemory`機能を設定することも可能です。例：

=== "Kotlin"

    ```kotlin
    val agent = AIAgent(
        promptExecutor = simpleOpenAIExecutor(System.getenv("OPENAI_API_KEY")),
        llmModel = OpenAIModels.Chat.GPT4oMini
    ) {
        install(ChatMemory) {
            chatHistoryProvider = MyDatabaseChatHistoryProvider()
            windowSize(20)
            filterMessages { it is Message.User || it is Message.Assistant }
        }
    }
    ```

=== "Java"

    ```java
    AIAgent<String, String> agent = AIAgent.builder()
        .promptExecutor(executor)
        .llmModel(OpenAIModels.Chat.GPT4oMini)
        .install(ChatMemory.Feature, config -> config
                .chatHistoryProvider(new MyDatabaseChatHistoryProvider())
                .windowSize(20)
                .filterMessages(msg -> msg instanceof Message.User || msg instanceof Message.Assistant))
        .build();
    ```

## セッションID

`agent.run()`の第2引数としてセッションIDを指定します。
`ChatMemory`はこのIDを使用して会話の保存と読み込みを行います。

```kotlin
// 初回実行 - エージェントは終了時にチャット履歴を保存します
agent.run("What is the capital of France?", "session-1")

// 2回目の実行 — エージェントは以前のやり取りを読み込みます
agent.run("And what about Germany?", "session-1")
```

異なるセッションIDを使用すると、完全に分離された履歴が生成されます。

## 履歴プロバイダー

デフォルトの`InMemoryChatHistoryProvider`はスレッドセーフですが、永続的ではありません（再起動時に履歴が失われます）。
本番環境では、メッセージを永続的に保存する独自の`ChatHistoryProvider`を実装してください。

```kotlin
class MyDatabaseChatHistoryProvider(private val db: Database) : ChatHistoryProvider {
    override suspend fun store(conversationId: String, messages: List<Message>) {
        db.saveMessages(conversationId, messages)
    }

    override suspend fun load(conversationId: String): `List<Message>` {
        return db.loadMessages(conversationId) ?: emptyList()
    }
}
```

## プリプロセッサ

プリプロセッサは、読み込み時（エージェントがメッセージを参照する前）と保存時（保存する前）の両方でメッセージリストを変換します。
これらは、`ChatMemory`機能の設定に追加した順序で逐次実行されます。

### 組み込みプリプロセッサ

| 設定メソッド | プリプロセッサクラス | 動作 |
|--------------------------|------------------------------|---------------------------------------|
| `windowSize(n)` | `WindowSizePreProcessor` | 最後の`n`個のメッセージのみを保持する |
| `filterMessages { ... }` | `FilterMessagesPreProcessor` | 述語（predicate）に一致するメッセージのみを保持する |

### プリプロセッサの順序

プリプロセッサは逐次実行され、各出力が次の入力になります。
つまり、順序が重要になります。

```kotlin
// 効果：最後の10個のメッセージを保持し、その10個の中から短いメッセージをフィルタリングする
windowSize(10)
filterMessages { it.content.length <= 100 }

// 効果：最初に短いメッセージをフィルタリングし、残ったものの中から最後の10個を保持する
filterMessages { it.content.length <= 100 }
windowSize(10)
```

### カスタムプリプロセッサ

カスタムプリプロセッサを作成するには、`ChatMemoryPreProcessor`インターフェースを実装します。

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

## チャットメモリ vs エージェントの永続化

`ChatMemory`は、各`agent.run()`呼び出しをアトミックで自己完結したループとして扱います。
エージェントは実行前にチャット履歴を読み込み、実行が正常に終了した後に保存します。
実行中にエージェントがクラッシュした場合、現在のチャットメッセージは保存されません。
つまり、チャット履歴は実行前の状態のまま維持されます。

[永続化（Persistence）](../agent-persistence.md)は、実行中のチェックポイントとして、エージェントの内部実行状態（グラフノード、メッセージ履歴、入力、および出力）をキャプチャします。
エージェントがクラッシュした場合、最後のチェックポイントから再開できます。

| | ChatMemory | 永続化（Persistence） |
|--------------------|--------------------------------------------------|--------------------------------------------------------------------|
| **保存対象** | 会話メッセージ | 実行状態 |
| **保存タイミング** | `agent.run()`の完了後 | 各グラフノードの後、または実行中の手動で定義されたポイント |
| **クラッシュ時の動作** | 進行中の実行は失われるが、以前の履歴は無傷 | 最後のチェックポイントから再開可能 |
| **主な用途** | マルチターンのチャットの継続性 | クラッシュ復旧が必要な長時間実行エージェント |

エージェントが長時間実行されるタスクを実行し、実行途中のクラッシュによる損失が大きい場合は、両方の機能をインストールすることを検討してください。

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

- 会話が無制限に肥大化するのを防ぐため、**常にウィンドウサイズを設定してください**。
- フィルタリングしてからウィンドウイングを行うか、ウィンドウイングしてからフィルタリングするかで結果が異なるため、**プリプロセッサの順序には注意してください**。
- 履歴を分離するために、ユーザーID、チャットスレッドID、UUIDなど、**意味のあるセッションIDを使用してください**。
- デフォルトの`InMemoryChatHistoryProvider`は再起動時に履歴を失うため、**本番環境では永続的なプロバイダーを実装してください**。

## 次のステップ

- [メモリを備えたシンプルなCLIチャットループを構築する方法](chat-agent-with-memory.md)を学ぶ
- [メモリを備えたチャットエンドポイントの例](chat-backend-with-memory.md)を見る