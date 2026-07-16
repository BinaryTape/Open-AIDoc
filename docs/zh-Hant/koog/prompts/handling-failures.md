# 處理失敗

本頁面說明如何使用內建的重試與逾時機制來處理 LLM 用戶端和提示執行器的失敗情況。

## 重試功能

使用 LLM 供應商時，可能會發生速率限制或暫時性服務不可用等暫時性錯誤。
`RetryingLLMClient` 裝飾器可為 Kotlin 和 Java 中的任何 LLM 用戶端添加自動重試邏輯。

### 基本用法

使用重試功能包裝任何現有的用戶端：

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
    // 使用重試功能包裝任何用戶端
    val client = OpenAILLMClient(apiKey)
    val resilientClient = RetryingLLMClient(client)

    // 現在所有作業在遇到暫時性錯誤時都會自動重試
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

    // 現在所有作業在遇到暫時性錯誤時都會自動重試
    `List<Message.Response>` response = resilientClient.execute(prompt, OpenAIModels.Chat.GPT4o);
    ```
    <!--- KNIT example-handling-failures-java-01.java -->

### 設定重試行為

預設情況下，`RetryingLLMClient` 配置 LLM 用戶端時，最大重試次數為 3 次，初始延遲為 1 秒，
以及最大延遲為 30 秒。
您可以透過傳遞給 `RetryingLLMClient` 的 `RetryConfig` 來指定不同的重試配置。
例如：

=== "Kotlin"

    <!--- INCLUDE
    import ai.koog.prompt.executor.clients.openai.OpenAILLMClient
    import ai.koog.prompt.executor.clients.retry.RetryConfig
    import ai.koog.prompt.executor.clients.retry.RetryingLLMClient
    val apiKey = System.getenv("OPENAI_API_KEY")
    val client = OpenAILLMClient(apiKey)
    -->
    ```kotlin
    // 使用預定義的配置
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
    // 使用預定義的配置
    RetryingLLMClient conservativeClient = new RetryingLLMClient(
        client,
        RetryConfig.Companion.getCONSERVATIVE()
    );
    ```
    <!--- KNIT example-handling-failures-java-02.java -->

Koog 提供多種預定義的重試配置，在 Kotlin 中可透過 `RetryConfig` 存取，在 Java 中則透過 `RetryConfig.Companion` 存取：

| 配置 (Kotlin) | 最大重試次數 | 初始延遲 | 最大延遲 | 使用案例 |
|----------------------------|--------------|---------------|-----------|----------------------------------------------------------------------------------------------------------|
| `RetryConfig.DISABLED` | 1 (不重試) | - | - | 開發、測試與偵錯。 |
| `RetryConfig.CONSERVATIVE` | 3 | 2s | 30s | 可靠性比速度更重要的背景或排程任務。 |
| `RetryConfig.AGGRESSIVE` | 5 | 500ms | 20s | 關鍵作業，從暫時性錯誤快速復原比減少 API 呼叫更重要。 |
| `RetryConfig.PRODUCTION` | 3 | 1s | 20s | 一般生產環境使用。 |

您可以直接使用這些配置或建立自定義配置：

<!--- INCLUDE
import ai.koog.prompt.executor.clients.openai.OpenAILLMClient
import ai.koog.prompt.executor.clients.retry.RetryConfig
import ai.koog.prompt.executor.clients.retry.RetryingLLMClient
import kotlin.time.Duration.Companion.seconds

val apiKey = System.getenv("OPENAI_API_KEY")
val client = OpenAILLMClient(apiKey)
-->
```kotlin
// 或建立自定義配置
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

### 重試錯誤模式

預設情況下，`RetryingLLMClient` 會識別常見的暫時性錯誤。
此行為由 [`RetryConfig.retryablePatterns`](api:prompt-executor-clients::ai.koog.prompt.executor.clients.retry.RetryConfig.retryablePatterns) 模式控制。
每個模式由 
[`RetryablePattern`](api:prompt-executor-clients::ai.koog.prompt.executor.clients.retry.RetryablePattern) 
表示，用於檢查失敗請求的錯誤訊息並決定是否應重試。

Koog 提供的預定義重試配置和模式適用於所有支援的 LLM 供應商。
您可以保留預設值或根據特定需求進行自訂。

#### 模式類型

您可以使用以下模式類型並組合任意數量的模式：

* `RetryablePattern.Status`：比對錯誤訊息中特定的 HTTP 狀態碼（例如 `429`、`500`、`502` 等）。
* `RetryablePattern.Keyword`：比對錯誤訊息中的關鍵字（例如 `rate limit` 或 `request timeout`）。
* `RetryablePattern.Regex`：比對錯誤訊息中的正規表示式。
* `RetryablePattern.Custom`：使用 lambda 函式比對自訂邏輯。

如果任何模式回傳 `true`，該錯誤將被視為可重試，LLM 用戶端將重試該請求。

#### 預設模式

除非您自訂重試配置，否則預設使用以下模式：

* **HTTP 狀態碼**：
    * `429`：速率限制 (Rate limit)
    * `500`：內部伺服器錯誤 (Internal server error)
    * `502`：不正確的閘道 (Bad gateway)
    * `503`：服務不可用 (Service unavailable)
    * `504`：閘道逾時 (Gateway timeout)
    * `529`：Anthropic 負載過重 (Anthropic overloaded)

* **錯誤關鍵字**：
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

這些預設模式在 Koog 中定義為 [`RetryConfig.DEFAULT_PATTERNS`](api:prompt-executor-clients::ai.koog.prompt.executor.clients.retry.RetryConfig.Companion.DEFAULT_PATTERNS)。

#### 自訂模式

您可以針對特定需求定義自訂模式：

<!--- INCLUDE
import ai.koog.prompt.executor.clients.retry.RetryConfig
import ai.koog.prompt.executor.clients.retry.RetryablePattern
-->
```kotlin
val config = RetryConfig(
    retryablePatterns = listOf(
        RetryablePattern.Status(429),   // 特定狀態碼
        RetryablePattern.Keyword("quota"),  // 錯誤訊息中的關鍵字
        RetryablePattern.Regex(Regex("ERR_\\d+")),  // 自訂正規表示式模式
        RetryablePattern.Custom { error ->  // 自訂邏輯
            error.contains("temporary") && error.length > 20
        }
    )
)
```
<!--- KNIT example-handling-failures-04.kt -->

您也可以將自訂模式附加到預設的 `RetryConfig.DEFAULT_PATTERNS`：

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

### 串流重試

串流作業可以選擇性地進行重試。此功能預設為停用。

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
    串流重試僅適用於接收到第一個 token 之前發生的連線失敗。
    一旦串流開始，重試邏輯就會停用。
    如果串流過程中發生錯誤，該作業將會終止。

### 搭配提示執行器使用重試

使用提示執行器時，您可以在 Kotlin 和 Java 中建立執行器之前，先使用重試機制包裝底層的 LLM 用戶端。
若要了解更多關於提示執行器的資訊，請參閱 [提示執行器](prompt-executors.md)。

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
    // 具有重試功能的單一供應商執行器
    val resilientClient = RetryingLLMClient(
        OpenAILLMClient(System.getenv("OPENAI_API_KEY")),
        RetryConfig.PRODUCTION
    )
    val executor = MultiLLMPromptExecutor(resilientClient)

    // 具有靈活用戶端配置的多供應商執行器
    val multiExecutor = MultiLLMPromptExecutor(
        LLMProvider.OpenAI to RetryingLLMClient(
            OpenAILLMClient(System.getenv("OPENAI_API_KEY")),
            RetryConfig.CONSERVATIVE
        ),
        LLMProvider.Anthropic to RetryingLLMClient(
            AnthropicLLMClient(System.getenv("ANTHROPIC_API_KEY")),
            RetryConfig.AGGRESSIVE  
        ),
        // Bedrock 用戶端已經內建 AWS SDK 重試機制
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
    // 具有重試功能的單一供應商執行器 (Java)
    RetryingLLMClient resilientClient = new RetryingLLMClient(
        new OpenAILLMClient(System.getenv("OPENAI_API_KEY")),
        RetryConfig.Companion.getPRODUCTION()
    );

    MultiLLMPromptExecutor executor = new MultiLLMPromptExecutor(resilientClient);

    // 具有靈活用戶端配置的多供應商執行器 (Java)
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

## 逾時配置

Kotlin 和 Java 中的所有 LLM 用戶端都支援逾時配置，以防止請求掛起。
建立用戶端時，您可以使用 [`ConnectionTimeoutConfig`](api:prompt-executor-clients::ai.koog.prompt.executor.clients.ConnectionTimeoutConfig) 類別指定網路連線的逾時值。

`ConnectionTimeoutConfig` 具有以下屬性：

| 屬性 | 預設值 | 說明 |
|------------------------|----------------------|---------------------------------------------------------------|
| `connectTimeoutMillis` | 60 秒 (60,000) | 建立與伺服器連線的最大時間。 |
| `requestTimeoutMillis` | 15 分鐘 (900,000) | 整個請求完成的最大時間。 |
| `socketTimeoutMillis` | 15 分鐘 (900,000) | 在已建立的連線上等待資料的最大時間。 |

您可以根據特定需求自訂這些值。例如：

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
                connectTimeoutMillis = 5000,    // 5 秒建立連線
                requestTimeoutMillis = 60000,    // 整個請求 60 秒
                socketTimeoutMillis = 120000   // Socket 資料傳輸 120 秒
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
    對於長時間執行或串流呼叫，請為 `requestTimeoutMillis` 和 `socketTimeoutMillis` 設定較高的值。

## 錯誤處理

在生產環境中使用 LLM 時，您需要實作錯誤處理，包括：

- **Try-catch 區塊**：處理非預期錯誤。
- **記錄帶有上下文的錯誤**：用於偵錯。
- **備援 (Fallbacks)**：用於關鍵作業。
- **監控重試模式**：識別重複發生的問題。

以下是 Kotlin 和 Java 中錯誤處理的範例：

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

    fun processResponse(response: Any) { /* 實作 */ }
    fun scheduleRetryLater() { /* 實作 */ }
    fun notifyAdministrator() { /* 實作 */ }
    fun useDefaultResponse() { /* 實作 */ }

    try {
        val response = resilientClient.execute(prompt, model)
        processResponse(response)
    } catch (e: Exception) {
        logger.error("LLM 作業失敗", e)

        when {
            e.message?.contains("rate limit") == true -> {
                // 特別處理速率限制
                scheduleRetryLater()
            }
            e.message?.contains("invalid api key") == true -> {
                // 處理驗證錯誤
                notifyAdministrator()
            }
            else -> {
                // 備援至替代方案
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

    Consumer<List<Message.Response>> processResponse = (resp) -> { /* 實作 */ };
    Runnable scheduleRetryLater = () -> { /* 實作 */ };
    Runnable notifyAdministrator = () -> { /* 實作 */ };
    Runnable useDefaultResponse = () -> { /* 實作 */ };

    try {
        `List<Message.Response>` response = promptExecutor.execute(prompt, OpenAIModels.Chat.GPT4o);
        processResponse.accept(response);
    } catch (Exception e) {
        logger.error("LLM 作業失敗", e);
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