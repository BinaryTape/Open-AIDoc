# 处理失败

本页面介绍了如何使用内置的重试和超时机制来处理 LLM 客户端和 prompt 执行器的失败。

## 重试功能

在使用 LLM 提供程序时，可能会出现速率限制或临时服务不可用等瞬态错误。
`RetryingLLMClient` 修饰器为 Kotlin 和 Java 中的任何 LLM 客户端添加了自动重试逻辑。

### 基本用法

为任何现有客户端包装重试功能：

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
    // 为任何客户端包装重试功能
    val client = OpenAILLMClient(apiKey)
    val resilientClient = RetryingLLMClient(client)

    // 现在，所有操作都将在发生瞬态错误时自动进行重试
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

    // 现在，所有操作都将在发生瞬态错误时自动进行重试
    `List<Message.Response>` response = resilientClient.execute(prompt, OpenAIModels.Chat.GPT4o);
    ```
    <!--- KNIT example-handling-failures-java-01.java -->

### 配置重试行为

默认情况下，`RetryingLLMClient` 为 LLM 客户端配置的最大重试次数为 3 次，初始延迟为 1 秒，最大延迟为 30 秒。
您可以使用传递给 `RetryingLLMClient` 的 `RetryConfig` 来指定不同的重试配置。
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
    // 使用预定义配置
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
    // 使用预定义配置
    RetryingLLMClient conservativeClient = new RetryingLLMClient(
        client,
        RetryConfig.Companion.getCONSERVATIVE()
    );
    ```
    <!--- KNIT example-handling-failures-java-02.java -->

Koog 提供了几种预定义的重试配置，在 Kotlin 中可以通过 `RetryConfig` 获取，在 Java 中可以通过 `RetryConfig.Companion` 获取：

| 配置 (Kotlin) | 最大重试次数 | 初始延迟 | 最大延迟 | 用例 |
|----------------------------|--------------|---------------|-----------|----------------------------------------------------------------------------------------------------------|
| `RetryConfig.DISABLED` | 1（不重试） | - | - | 开发、测试和调试。 |
| `RetryConfig.CONSERVATIVE` | 3 | 2 秒 | 30 秒 | 可靠性比速度更重要的后台或计划任务。 |
| `RetryConfig.AGGRESSIVE` | 5 | 500 毫秒 | 20 秒 | 快速从瞬态错误中恢复比减少 API 调用更重要的关键操作。 |
| `RetryConfig.PRODUCTION` | 3 | 1 秒 | 20 秒 | 通用生产环境使用。 |

您可以直接使用它们或创建自定义配置：

<!--- INCLUDE
import ai.koog.prompt.executor.clients.openai.OpenAILLMClient
import ai.koog.prompt.executor.clients.retry.RetryConfig
import ai.koog.prompt.executor.clients.retry.RetryingLLMClient
import kotlin.time.Duration.Companion.seconds

val apiKey = System.getenv("OPENAI_API_KEY")
val client = OpenAILLMClient(apiKey)
-->
```kotlin
// 或者创建自定义配置
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

### 重试错误模式

默认情况下，`RetryingLLMClient` 会识别常见的瞬态错误。
此行为由 [`RetryConfig.retryablePatterns`](api:prompt-executor-clients::ai.koog.prompt.executor.clients.retry.RetryConfig.retryablePatterns) 模式控制。
每个模式由 [`RetryablePattern`](api:prompt-executor-clients::ai.koog.prompt.executor.clients.retry.RetryablePattern) 表示，它会检查失败请求返回的错误消息并确定是否应进行重试。

Koog 提供了预定义的重试配置和模式，适用于所有支持的 LLM 提供程序。
您可以保留默认设置，也可以根据特定需求进行自定义。

#### 模式类型

您可以使用以下模式类型并组合其中的任意数量：

* `RetryablePattern.Status`：匹配错误消息中特定的 HTTP 状态码（如 `429`、`500`、`502` 等）。
* `RetryablePattern.Keyword`：匹配错误消息中的关键字（如 `rate limit` 或 `request timeout`）。
* `RetryablePattern.Regex`：匹配错误消息中的正则表达式。
* `RetryablePattern.Custom`：使用 lambda 函数匹配自定义逻辑。

如果任何模式返回 `true`，则该错误被视为可重试，LLM 客户端将重试该请求。

#### 默认模式

除非您自定义重试配置，否则默认使用以下模式：

* **HTTP 状态码**：
    * `429`：速率限制
    * `500`：内部服务器错误
    * `502`：错误网关
    * `503`：服务不可用
    * `504`：网关超时
    * `529`：Anthropic 负载过高

* **错误关键字**：
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

这些默认模式在 Koog 中定义为 [`RetryConfig.DEFAULT_PATTERNS`](api:prompt-executor-clients::ai.koog.prompt.executor.clients.retry.RetryConfig.Companion.DEFAULT_PATTERNS)。

#### 自定义模式

您可以根据特定需求定义自定义模式：

<!--- INCLUDE
import ai.koog.prompt.executor.clients.retry.RetryConfig
import ai.koog.prompt.executor.clients.retry.RetryablePattern
-->
```kotlin
val config = RetryConfig(
    retryablePatterns = listOf(
        RetryablePattern.Status(429),   // 特定状态码
        RetryablePattern.Keyword("quota"),  // 错误消息中的关键字
        RetryablePattern.Regex(Regex("ERR_\\d+")),  // 自定义正则表达式模式
        RetryablePattern.Custom { error ->  // 自定义逻辑
            error.contains("temporary") && error.length > 20
        }
    )
)
```
<!--- KNIT example-handling-failures-04.kt -->

您还可以将自定义模式附加到默认的 `RetryConfig.DEFAULT_PATTERNS` 中：

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

### 带重试的流式传输

流式操作可以可选地进行重试。此功能默认禁用。

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
    流式重试仅适用于接收到第一个令牌 (token) 之前发生的连接失败。
    流式传输一旦开始，重试逻辑就会被禁用。
    如果在流式传输过程中发生错误，操作将终止。

### 在 prompt 执行器中使用重试

在 Kotlin 和 Java 中使用 prompt 执行器时，您都可以在创建执行器之前将底层的 LLM 客户端包装在重试机制中。
要了解更多关于 prompt 执行器的信息，请参阅 [Prompt 执行器](prompt-executors.md)。

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
    // 带重试的单提供程序执行器
    val resilientClient = RetryingLLMClient(
        OpenAILLMClient(System.getenv("OPENAI_API_KEY")),
        RetryConfig.PRODUCTION
    )
    val executor = MultiLLMPromptExecutor(resilientClient)

    // 具有灵活客户端配置的多提供程序执行器
    val multiExecutor = MultiLLMPromptExecutor(
        LLMProvider.OpenAI to RetryingLLMClient(
            OpenAILLMClient(System.getenv("OPENAI_API_KEY")),
            RetryConfig.CONSERVATIVE
        ),
        LLMProvider.Anthropic to RetryingLLMClient(
            AnthropicLLMClient(System.getenv("ANTHROPIC_API_KEY")),
            RetryConfig.AGGRESSIVE  
        ),
        // Bedrock 客户端已经内置了 AWS SDK 重试机制 
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
    // 带重试的单提供程序执行器 (Java)
    RetryingLLMClient resilientClient = new RetryingLLMClient(
        new OpenAILLMClient(System.getenv("OPENAI_API_KEY")),
        RetryConfig.Companion.getPRODUCTION()
    );

    MultiLLMPromptExecutor executor = new MultiLLMPromptExecutor(resilientClient);

    // 具有灵活客户端配置的多提供程序执行器 (Java)
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

## 超时配置

在 Kotlin 和 Java 中，所有 LLM 客户端都支持超时配置以防止请求挂起。
您可以在使用 [`ConnectionTimeoutConfig`](api:prompt-executor-clients::ai.koog.prompt.executor.clients.ConnectionTimeoutConfig) 类创建客户端时指定网络连接的超时值。

`ConnectionTimeoutConfig` 具有以下属性：

| 属性 | 默认值 | 描述 |
|------------------------|----------------------|---------------------------------------------------------------|
| `connectTimeoutMillis` | 60 秒 (60,000) | 与服务器建立连接的最大时间。 |
| `requestTimeoutMillis` | 15 分钟 (900,000) | 整个请求完成的最大时间。 |
| `socketTimeoutMillis` | 15 分钟 (900,000) | 在已建立的连接上等待数据的最大时间。 |

您可以根据特定需求自定义这些值。例如：

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
                connectTimeoutMillis = 5000,    // 5 秒建立连接
                requestTimeoutMillis = 60000,    // 60 秒完成整个请求
                socketTimeoutMillis = 120000   // 120 秒在套接字上等待数据
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
    对于长时间运行或流式调用，请为 `requestTimeoutMillis` 和 `socketTimeoutMillis` 设置更高的值。

## 错误处理

在生产环境中使用 LLM 时，您需要实现错误处理，包括：

- **Try-catch 块**用于处理意外错误。
- **记录带有上下文的错误日志**以便调试。
- **回退方案**用于关键操作。
- **监控重试模式**以识别重复发生的问题。

以下是 Kotlin 和 Java 中的错误处理示例：

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

    fun processResponse(response: Any) { /* 实现 */ }
    fun scheduleRetryLater() { /* 实现 */ }
    fun notifyAdministrator() { /* 实现 */ }
    fun useDefaultResponse() { /* 实现 */ }

    try {
        val response = resilientClient.execute(prompt, model)
        processResponse(response)
    } catch (e: Exception) {
        logger.error("LLM operation failed", e)

        when {
            e.message?.contains("rate limit") == true -> {
                // 专门处理速率限制
                scheduleRetryLater()
            }
            e.message?.contains("invalid api key") == true -> {
                // 处理身份验证错误
                notifyAdministrator()
            }
            else -> {
                // 回退到备选方案
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

    Consumer<List<Message.Response>> processResponse = (resp) -> { /* 实现 */ };
    Runnable scheduleRetryLater = () -> { /* 实现 */ };
    Runnable notifyAdministrator = () -> { /* 实现 */ };
    Runnable useDefaultResponse = () -> { /* 实现 */ };

    try {
        `List<Message.Response>` response = promptExecutor.execute(prompt, OpenAIModels.Chat.GPT4o);
        processResponse.accept(response);
    } catch (Exception e) {
        logger.error("LLM operation failed", e);
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