# エラーの処理

このページでは、組み込みのリトライおよびタイムアウトメカニズムを使用して、LLMクライアントとプロンプトエグゼキュータの失敗（エラー）を処理する方法について説明します。

## リトライ機能

LLMプロバイダーを利用する際、レート制限や一時的なサービスの停止といった一時的なエラー（transient errors）が発生することがあります。
`RetryingLLMClient` デコレータを使用すると、KotlinとJavaの両方で、任意のLLMクライアントに自動リトライロジックを追加できます。

### 基本的な使い方

既存のクライアントをリトライ機能でラップします。

=== "Kotlin"

    <!--- INCLUDE
    import ai.koog.prompt.executor.clients.openai.OpenAILLMClient
    import ai.koog.prompt.executor.clients.openai.OpenAIModels
    import ai.koog.prompt.executor.clients.retry.RetryingLLMClient
    import ai.koog.prompt.dsl.prompt
    import kotlinx.coroutines.runBlocking
    fun main() {
        runBlocking {
            val apiKey = System.getenv("OPENAI_API_KEY")
            val prompt = prompt("test") {
                user("Hello")
            }
    -->
    <!--- SUFFIX
        }
    }
    -->
    ```kotlin
    // 任意のクライアントをリトライ機能でラップします
    val client = OpenAILLMClient(apiKey)
    val resilientClient = RetryingLLMClient(client)

    // これで、すべての操作は一時的なエラーが発生した際に自動的にリトライされます
    val response = resilientClient.execute(prompt, OpenAIModels.Chat.GPT4o)
    ```
    <!--- KNIT example-handling-failures-01.kt -->

=== "Java"

    <!--- INCLUDE
    /**
    -->
    <!--- SUFFIX
    **/
    -->
    ```java
    OpenAILLMClient client = new OpenAILLMClient(apiKey);
    RetryingLLMClient resilientClient = new RetryingLLMClient(client);

    // これで、すべての操作は一時的なエラーが発生した際に自動的にリトライされます
    `List<Message.Response>` response = resilientClient.execute(prompt, OpenAIModels.Chat.GPT4o);
    ```
    <!--- KNIT example-handling-failures-java-01.java -->

### リトライ動作の設定

デフォルトでは、`RetryingLLMClient` は最大3回のリトライ試行、1秒の初期遅延、および30秒の最大遅延でLLMクライアントを設定します。
`RetryingLLMClient` に `RetryConfig` を渡すことで、異なるリトライ設定を指定できます。
例：

=== "Kotlin"

    <!--- INCLUDE
    import ai.koog.prompt.executor.clients.openai.OpenAILLMClient
    import ai.koog.prompt.executor.clients.retry.RetryConfig
    import ai.koog.prompt.executor.clients.retry.RetryingLLMClient
    val apiKey = System.getenv("OPENAI_API_KEY")
    val client = OpenAILLMClient(apiKey)
    -->
    ```kotlin
    // 定義済みの構成を使用する
    val conservativeClient = RetryingLLMClient(
        delegate = client,
        config = RetryConfig.CONSERVATIVE
    )
    ```
    <!--- KNIT example-handling-failures-02.kt -->

=== "Java"

    <!--- INCLUDE
    /**
    -->
    <!--- SUFFIX
    **/
    -->
    ```java
    OpenAILLMClient client = new OpenAILLMClient(apiKey);
    // 定義済みの構成を使用する
    RetryingLLMClient conservativeClient = new RetryingLLMClient(
        client,
        RetryConfig.Companion.getCONSERVATIVE()
    );
    ```
    <!--- KNIT example-handling-failures-java-02.java -->

Koogは、Kotlinの `RetryConfig` およびJavaの `RetryConfig.Companion` を通じて、いくつかの定義済みリトライ構成を提供しています。

| 構成 (Kotlin) | 最大試行回数 | 初期遅延 | 最大遅延 | ユースケース |
|----------------------------|--------------|---------------|-----------|----------------------------------------------------------------------------------------------------------|
| `RetryConfig.DISABLED` | 1 (リトライなし) | - | - | 開発、テスト、およびデバッグ。 |
| `RetryConfig.CONSERVATIVE` | 3 | 2s | 30s | 速度よりも信頼性が重要なバックグラウンドタスクやスケジュールされたタスク。 |
| `RetryConfig.AGGRESSIVE` | 5 | 500ms | 20s | APIコールの削減よりも、一時的なエラーからの迅速な回復が重要なクリティカルな操作。 |
| `RetryConfig.PRODUCTION` | 3 | 1s | 20s | 一般的な本番環境での利用。 |

これらを直接使用するか、カスタム構成を作成することもできます。

<!--- INCLUDE
import ai.koog.prompt.executor.clients.openai.OpenAILLMClient
import ai.koog.prompt.executor.clients.retry.RetryConfig
import ai.koog.prompt.executor.clients.retry.RetryingLLMClient
import kotlin.time.Duration.Companion.seconds

val apiKey = System.getenv("OPENAI_API_KEY")
val client = OpenAILLMClient(apiKey)
-->
```kotlin
// またはカスタム構成を作成する
val customClient = RetryingLLMClient(
    delegate = client,
    config = RetryConfig(
        maxAttempts = 5,
        initialDelay = 1.seconds,
        maxDelay = 30.seconds,
        backoffMultiplier = 2.0,
        jitterFactor = 0.2
    )
)
```
<!--- KNIT example-handling-failures-03.kt -->

### リトライエラーのパターン

デフォルトでは、`RetryingLLMClient` は一般的な一時的エラーを認識します。
この動作は [`RetryConfig.retryablePatterns`](api:prompt-executor-clients::ai.koog.prompt.executor.clients.retry.RetryConfig.retryablePatterns) パターンによって制御されます。
各パターンは [`RetryablePattern`](api:prompt-executor-clients::ai.koog.prompt.executor.clients.retry.RetryablePattern) として表され、失敗したリクエストからのエラーメッセージをチェックし、リトライすべきかどうかを判断します。

Koogは、サポートされているすべてのLLMプロバイダーで動作する定義済みのリトライ構成とパターンを提供しています。
デフォルトのまま使用することも、特定のニーズに合わせてカスタマイズすることも可能です。

#### パターンの種類

以下のパターンタイプを使用し、それらを任意に組み合わせることができます。

* `RetryablePattern.Status`: エラーメッセージ内の特定のHTTPステータスコード（`429`、`500`、`502` など）に一致させます。
* `RetryablePattern.Keyword`: エラーメッセージ内のキーワード（`rate limit` や `request timeout` など）に一致させます。
* `RetryablePattern.Regex`: エラーメッセージ内の正規表現に一致させます。
* `RetryablePattern.Custom`: ラムダ関数を使用したカスタムロジックで一致させます。

いずれかのパターンが `true` を返した場合、そのエラーはリトライ可能とみなされ、LLMクライアントはリクエストを再試行します。

#### デフォルトのパターン

リトライ構成をカスタマイズしない限り、以下のパターンがデフォルトで使用されます。

* **HTTPステータスコード**:
    * `429`: レート制限（Rate limit）
    * `500`: 内部サーバーエラー（Internal server error）
    * `502`: 不正なゲートウェイ（Bad gateway）
    * `503`: サービス利用不可（Service unavailable）
    * `504`: ゲートウェイタイムアウト（Gateway timeout）
    * `529`: Anthropic 過負荷（Anthropic overloaded）

* **エラーキーワード**:
    * rate limit
    * too many requests
    * request timeout
    * connection timeout
    * read timeout
    * write timeout
    * connection reset by peer
    * connection refused
    * temporarily unavailable
    * service unavailable

これらのデフォルトパターンは、Koog内で [`RetryConfig.DEFAULT_PATTERNS`](api:prompt-executor-clients::ai.koog.prompt.executor.clients.retry.RetryConfig.Companion.DEFAULT_PATTERNS) として定義されています。

#### カスタムパターン

特定のニーズに合わせてカスタムパターンを定義できます。

<!--- INCLUDE
import ai.koog.prompt.executor.clients.retry.RetryConfig
import ai.koog.prompt.executor.clients.retry.RetryablePattern
-->
```kotlin
val config = RetryConfig(
    retryablePatterns = listOf(
        RetryablePattern.Status(429),   // 特定のステータスコード
        RetryablePattern.Keyword("quota"),  // エラーメッセージ内のキーワード
        RetryablePattern.Regex(Regex("ERR_\\d+")),  // カスタム正規表現パターン
        RetryablePattern.Custom { error ->  // カスタムロジック
            error.contains("temporary") && error.length > 20
        }
    )
)
```
<!--- KNIT example-handling-failures-04.kt -->

また、デフォルトの `RetryConfig.DEFAULT_PATTERNS` にカスタムパターンを追加することもできます。

<!--- INCLUDE
import ai.koog.prompt.executor.clients.retry.RetryConfig
import ai.koog.prompt.executor.clients.retry.RetryablePattern
-->
```kotlin
val config = RetryConfig(
    retryablePatterns = RetryConfig.DEFAULT_PATTERNS + listOf(
        RetryablePattern.Keyword("custom_error")
    )
)
```
<!--- KNIT example-handling-failures-05.kt -->

### リトライを伴うストリーミング

ストリーミング操作もオプションでリトライ可能です。この機能はデフォルトでは無効になっています。

<!--- INCLUDE
import ai.koog.prompt.executor.clients.openai.OpenAILLMClient
import ai.koog.prompt.executor.clients.openai.OpenAIModels
import ai.koog.prompt.executor.clients.retry.RetryConfig
import ai.koog.prompt.executor.clients.retry.RetryingLLMClient
import ai.koog.prompt.dsl.prompt
import kotlinx.coroutines.runBlocking
fun main() {
    runBlocking {
        val baseClient = OpenAILLMClient(System.getenv("OPENAI_API_KEY"))
        val prompt = prompt("test") {
            user("Generate a story")
        }
-->
<!--- SUFFIX
    }
}
-->
```kotlin
val config = RetryConfig(
    maxAttempts = 3
)

val client = RetryingLLMClient(baseClient, config)
val stream = client.executeStreaming(prompt, OpenAIModels.Chat.GPT4o)
```
<!--- KNIT example-handling-failures-06.kt -->

!!!note
    ストリーミングのリトライは、最初のトークンを受信する前に発生した接続失敗にのみ適用されます。
    ストリーミングが開始されると、リトライロジックは無効になります。
    ストリーミング中にエラーが発生した場合、操作は終了します。

### プロンプトエグゼキュータでのリトライ

プロンプトエグゼキュータを使用する場合、KotlinとJavaの両方で、エグゼキュータを作成する前に基盤となるLLMクライアントをリトライメカニズムでラップできます。
プロンプトエグゼキュータの詳細については、[プロンプトエグゼキュータ](prompt-executors.md)を参照してください。

=== "Kotlin"

    <!--- INCLUDE
    import ai.koog.prompt.executor.clients.anthropic.AnthropicLLMClient
    import ai.koog.prompt.executor.clients.bedrock.BedrockLLMClient
    import ai.koog.prompt.executor.clients.openai.OpenAILLMClient
    import ai.koog.prompt.executor.clients.retry.RetryConfig
    import ai.koog.prompt.executor.clients.retry.RetryingLLMClient
    import ai.koog.prompt.executor.llms.MultiLLMPromptExecutor
    import ai.koog.prompt.llm.LLMProvider
    import aws.sdk.kotlin.runtime.auth.credentials.StaticCredentialsProvider
    -->
    ```kotlin
    // リトライ機能付きの単一プロバイダーエグゼキュータ
    val resilientClient = RetryingLLMClient(
        OpenAILLMClient(System.getenv("OPENAI_API_KEY")),
        RetryConfig.PRODUCTION
    )
    val executor = MultiLLMPromptExecutor(resilientClient)

    // 柔軟なクライアント構成を持つマルチプロバイダーエグゼキュータ
    val multiExecutor = MultiLLMPromptExecutor(
        LLMProvider.OpenAI to RetryingLLMClient(
            OpenAILLMClient(System.getenv("OPENAI_API_KEY")),
            RetryConfig.CONSERVATIVE
        ),
        LLMProvider.Anthropic to RetryingLLMClient(
            AnthropicLLMClient(System.getenv("ANTHROPIC_API_KEY")),
            RetryConfig.AGGRESSIVE  
        ),
        // BedrockクライアントにはすでにAWS SDKのリトライ機能が組み込まれています
        LLMProvider.Bedrock to BedrockLLMClient(
            identityProvider = StaticCredentialsProvider {
                accessKeyId = System.getenv("AWS_ACCESS_KEY_ID")
                secretAccessKey = System.getenv("AWS_SECRET_ACCESS_KEY")
                sessionToken = System.getenv("AWS_SESSION_TOKEN")
            },
        ),
    )
    ```
    <!--- KNIT example-handling-failures-07.kt -->

=== "Java"

    <!--- INCLUDE
    /**
    -->
    <!--- SUFFIX
    **/
    -->
    ```java
    // リトライ機能付きの単一プロバイダーエグゼキュータ (Java)
    RetryingLLMClient resilientClient = new RetryingLLMClient(
        new OpenAILLMClient(System.getenv("OPENAI_API_KEY")),
        RetryConfig.Companion.getPRODUCTION()
    );

    MultiLLMPromptExecutor executor = new MultiLLMPromptExecutor(resilientClient);

    // 柔軟なクライアント構成を持つマルチプロバイダーエグゼキュータ (Java)
    LLMClient openai = new RetryingLLMClient(
        new OpenAILLMClient(System.getenv("OPENAI_API_KEY")),
        RetryConfig.Companion.getCONSERVATIVE()
    );

    LLMClient anthropic = new RetryingLLMClient(
        new AnthropicLLMClient(System.getenv("ANTHROPIC_API_KEY")),
        RetryConfig.Companion.getAGGRESSIVE()
    );

    Map<LLMProvider, LLMClient> clients = Map.of(
        LLMProvider.OpenAI, openai,
        LLMProvider.Anthropic, anthropic
    );

    MultiLLMPromptExecutor multiExecutor = new MultiLLMPromptExecutor(clients);
    ```
    <!--- KNIT example-handling-failures-java-03.java -->

## タイムアウトの設定

すべてのLLMクライアントは、リクエストのハングを防ぐため、KotlinとJavaの両方でタイムアウト設定をサポートしています。
クライアントの作成時に、[`ConnectionTimeoutConfig`](api:prompt-executor-clients::ai.koog.prompt.executor.clients.ConnectionTimeoutConfig) クラスを使用してネットワーク接続のタイムアウト値を指定できます。

`ConnectionTimeoutConfig` には以下のプロパティがあります。

| プロパティ | デフォルト値 | 説明 |
|------------------------|----------------------|---------------------------------------------------------------|
| `connectTimeoutMillis` | 60秒 (60,000) | サーバーとの接続を確立するまでの最大時間。 |
| `requestTimeoutMillis` | 15分 (900,000) | リクエスト全体が完了するまでの最大時間。 |
| `socketTimeoutMillis` | 15分 (900,000) | 確立された接続を通じてデータを待機する最大時間。 |

特定のニーズに合わせてこれらの値をカスタマイズできます。例：

=== "Kotlin"

    <!--- INCLUDE
    import ai.koog.prompt.executor.clients.ConnectionTimeoutConfig
    import ai.koog.prompt.executor.clients.openai.OpenAIClientSettings
    import ai.koog.prompt.executor.clients.openai.OpenAILLMClient
    val apiKey = System.getenv("OPENAI_API_KEY")    
    -->
    ```kotlin
    val client = OpenAILLMClient(
        apiKey = apiKey,
        settings = OpenAIClientSettings(
            timeoutConfig = ConnectionTimeoutConfig(
                connectTimeoutMillis = 5000,    // 接続確立まで5秒
                requestTimeoutMillis = 60000,    // リクエスト全体で60秒
                socketTimeoutMillis = 120000   // ソケット上のデータ待機に120秒
            )
        )
    )
    ```
    <!--- KNIT example-handling-failures-08.kt -->

=== "Java"

    <!--- INCLUDE
    /**
    -->
    <!--- SUFFIX
    **/
    -->
    ```java
    String apiKey = System.getenv("OPENAI_API_KEY");
    ConnectionTimeoutConfig timeouts = new ConnectionTimeoutConfig(
        5000L,   // connectTimeoutMillis
        60000L,  // requestTimeoutMillis
        120000L  // socketTimeoutMillis
    );
    OpenAIClientSettings settings = new OpenAIClientSettings(
        "https://api.openai.com", // baseUrl
        timeouts,
        "v1/chat/completions",    // chatCompletionsPath
        "v1/responses",           // responsesAPIPath
        "v1/embeddings",          // embeddingsPath
        "v1/moderations",         // moderationsPath
        "v1/models"               // modelsPath
    );
    OpenAILLMClient client = new OpenAILLMClient(apiKey, settings);
    ```
    <!--- KNIT example-handling-failures-java-04.java -->

!!! tip
    実行時間が長いコールやストリーミングコールの場合は、`requestTimeoutMillis` と `socketTimeoutMillis` に大きな値を設定してください。

## エラーハンドリング

本番環境でLLMを扱う際は、以下のようなエラーハンドリングを実装する必要があります。

- 予期しないエラーを処理するための **Try-catch ブロック**。
- デバッグのための **コンテキストを含めたエラーログの記録**。
- 重要な操作のための **フォールバック（代替策）**。
- 繰り返し発生する問題を特定するための **リトライパターンの監視**。

以下は、KotlinとJavaにおけるエラーハンドリングの例です。

=== "Kotlin"

    <!--- INCLUDE
    import ai.koog.prompt.executor.clients.openai.OpenAILLMClient
    import ai.koog.prompt.executor.clients.openai.OpenAIModels
    import ai.koog.prompt.executor.clients.retry.RetryingLLMClient
    import ai.koog.prompt.executor.clients.retry.RetryConfig
    import ai.koog.prompt.dsl.prompt
    import kotlinx.coroutines.runBlocking
    import org.slf4j.LoggerFactory
    fun main() {
        runBlocking {
    -->
    <!--- SUFFIX
        }
    }
    -->
    ```kotlin
    val logger = LoggerFactory.getLogger("Example")
    val resilientClient = RetryingLLMClient(
        OpenAILLMClient(System.getenv("OPENAI_API_KEY")),
        RetryConfig.PRODUCTION
    )
    val prompt = prompt("test") { user("Hello") }
    val model = OpenAIModels.Chat.GPT4o

    fun processResponse(response: Any) { /* 実装 */ }
    fun scheduleRetryLater() { /* 実装 */ }
    fun notifyAdministrator() { /* 実装 */ }
    fun useDefaultResponse() { /* 実装 */ }

    try {
        val response = resilientClient.execute(prompt, model)
        processResponse(response)
    } catch (e: Exception) {
        logger.error("LLM操作に失敗しました", e)

        when {
            e.message?.contains("rate limit") == true -> {
                // レート制限を個別に処理する
                scheduleRetryLater()
            }
            e.message?.contains("invalid api key") == true -> {
                // 認証エラーを処理する
                notifyAdministrator()
            }
            else -> {
                // 代替ソリューションにフォールバックする
                useDefaultResponse()
            }
        }
    }
    ```
    <!--- KNIT example-handling-failures-09.kt -->

=== "Java"

    <!--- INCLUDE
    import ai.koog.prompt.dsl.Prompt;
    import ai.koog.prompt.executor.clients.openai.OpenAILLMClient;
    import ai.koog.prompt.executor.clients.openai.OpenAIModels;
    import ai.koog.prompt.executor.clients.retry.RetryConfig;
    import ai.koog.prompt.executor.clients.retry.RetryingLLMClient;
    import ai.koog.prompt.executor.llms.MultiLLMPromptExecutor;
    import ai.koog.prompt.message.Message;
    import org.slf4j.Logger;
    import org.slf4j.LoggerFactory;
    import java.util.List;
    import java.util.function.Consumer;
    class exampleHandlingFailuresJava05 {
        public static void main(String[] args) {
    -->
    <!--- SUFFIX
        }
    }
    -->
    ```java
    Logger logger = LoggerFactory.getLogger("Example");
    RetryingLLMClient resilientClient = new RetryingLLMClient(
            new OpenAILLMClient(System.getenv("OPENAI_API_KEY")),
            RetryConfig.PRODUCTION
    );
    Prompt prompt = Prompt.builder("test")
            .user("Hello")
            .build();
    MultiLLMPromptExecutor promptExecutor = new MultiLLMPromptExecutor(resilientClient);

    Consumer<List<Message.Response>> processResponse = (resp) -> { /* 実装 */ };
    Runnable scheduleRetryLater = () -> { /* 実装 */ };
    Runnable notifyAdministrator = () -> { /* 実装 */ };
    Runnable useDefaultResponse = () -> { /* 実装 */ };

    try {
        `List<Message.Response>` response = promptExecutor.execute(prompt, OpenAIModels.Chat.GPT4o);
        processResponse.accept(response);
    } catch (Exception e) {
        logger.error("LLM操作に失敗しました", e);
        String msg = e.getMessage() == null ? "" : e.getMessage().toLowerCase();
        if (msg.contains("rate limit")) {
            scheduleRetryLater.run();
        } else if (msg.contains("invalid api key")) {
            notifyAdministrator.run();
        } else {
            useDefaultResponse.run();
        }
    }
    ```
    <!--- KNIT example-handling-failures-java-05.java -->