# 실패 처리

이 페이지에서는 기본 제공되는 재시도(retry) 및 타임아웃(timeout) 메커니즘을 사용하여 LLM 클라이언트와 프롬프트 실행기(prompt executor)의 실패를 처리하는 방법을 설명합니다.

## 재시도 기능

LLM 제공업체를 이용할 때 레이트 리밋(rate limit)이나 일시적인 서비스 중단과 같은 일시적인 오류(transient errors)가 발생할 수 있습니다.
`RetryingLLMClient` 데코레이터는 Kotlin과 Java 모두에서 모든 LLM 클라이언트에 자동 재시도 로직을 추가합니다.

### 기본 사용법

기존 클라이언트를 재시도 기능으로 감쌉니다.

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
    // 모든 클라이언트를 재시도 기능으로 감쌉니다.
    val client = OpenAILLMClient(apiKey)
    val resilientClient = RetryingLLMClient(client)

    // 이제 모든 작업이 일시적인 오류 발생 시 자동으로 재시도됩니다.
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

    // 이제 모든 작업이 일시적인 오류 발생 시 자동으로 재시도됩니다.
    `List<Message.Response>` response = resilientClient.execute(prompt, OpenAIModels.Chat.GPT4o);
    ```
    <!--- KNIT example-handling-failures-java-01.java -->

### 재시도 동작 설정

기본적으로 `RetryingLLMClient`는 최대 3회의 재시도 횟수, 1초의 초기 지연 시간, 30초의 최대 지연 시간으로 LLM 클라이언트를 설정합니다.
`RetryingLLMClient`에 전달되는 `RetryConfig`를 사용하여 다른 재시도 설정을 지정할 수 있습니다.
예를 들어:

=== "Kotlin"

    <!--- INCLUDE
    import ai.koog.prompt.executor.clients.openai.OpenAILLMClient
    import ai.koog.prompt.executor.clients.retry.RetryConfig
    import ai.koog.prompt.executor.clients.retry.RetryingLLMClient
    val apiKey = System.getenv("OPENAI_API_KEY")
    val client = OpenAILLMClient(apiKey)
    -->
    ```kotlin
    // 미리 정의된 설정을 사용합니다.
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
    // 미리 정의된 설정을 사용합니다.
    RetryingLLMClient conservativeClient = new RetryingLLMClient(
        client,
        RetryConfig.Companion.getCONSERVATIVE()
    );
    ```
    <!--- KNIT example-handling-failures-java-02.java -->

Koog는 Kotlin의 `RetryConfig`와 Java의 `RetryConfig.Companion`을 통해 몇 가지 미리 정의된 재시도 설정을 제공합니다.

| 설정 (Kotlin) | 최대 시도 횟수 | 초기 지연 시간 | 최대 지연 시간 | 유스케이스 |
|----------------------------|--------------|---------------|-----------|----------------------------------------------------------------------------------------------------------|
| `RetryConfig.DISABLED`     | 1 (재시도 없음) | -             | -         | 개발, 테스트 및 디버깅. |
| `RetryConfig.CONSERVATIVE` | 3            | 2s            | 30s       | 속도보다 신뢰성이 더 중요한 백그라운드 또는 예약된 작업. |
| `RetryConfig.AGGRESSIVE`   | 5            | 500ms         | 20s       | API 호출 횟수를 줄이는 것보다 일시적인 오류로부터의 빠른 복구가 더 중요한 핵심 작업. |
| `RetryConfig.PRODUCTION`   | 3            | 1s            | 20s       | 일반적인 운영 환경에서의 사용. |

이를 직접 사용하거나 사용자 정의 설정을 생성할 수 있습니다.

<!--- INCLUDE
import ai.koog.prompt.executor.clients.openai.OpenAILLMClient
import ai.koog.prompt.executor.clients.retry.RetryConfig
import ai.koog.prompt.executor.clients.retry.RetryingLLMClient
import kotlin.time.Duration.Companion.seconds

val apiKey = System.getenv("OPENAI_API_KEY")
val client = OpenAILLMClient(apiKey)
-->
```kotlin
// 또는 사용자 정의 설정을 생성합니다.
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

### 재시도 오류 패턴

기본적으로 `RetryingLLMClient`는 일반적인 일시적 오류를 인식합니다.
이 동작은 [`RetryConfig.retryablePatterns`](api:prompt-executor-clients::ai.koog.prompt.executor.clients.retry.RetryConfig.retryablePatterns) 패턴에 의해 제어됩니다.
각 패턴은 실패한 요청의 오류 메시지를 확인하고 재시도 여부를 결정하는 [`RetryablePattern`](api:prompt-executor-clients::ai.koog.prompt.executor.clients.retry.RetryablePattern)으로 표현됩니다.

Koog는 지원되는 모든 LLM 제공업체에서 작동하는 미리 정의된 재시도 설정과 패턴을 제공합니다. 기본값을 그대로 유지하거나 특정 요구 사항에 맞게 사용자 정의할 수 있습니다.

#### 패턴 유형

다음과 같은 패턴 유형을 사용하고 원하는 만큼 조합할 수 있습니다.

* `RetryablePattern.Status`: 오류 메시지에서 특정 HTTP 상태 코드(예: `429`, `500`, `502` 등)와 일치하는지 확인합니다.
* `RetryablePattern.Keyword`: 오류 메시지에서 키워드(예: `rate limit` 또는 `request timeout`)와 일치하는지 확인합니다.
* `RetryablePattern.Regex`: 오류 메시지에서 정규식과 일치하는지 확인합니다.
* `RetryablePattern.Custom`: 람다 함수를 사용하여 사용자 정의 로직과 일치하는지 확인합니다.

어떤 패턴이라도 `true`를 반환하면 해당 오류는 재시도 가능한 것으로 간주되어 LLM 클라이언트가 요청을 재시도합니다.

#### 기본 패턴

재시도 설정을 사용자 정의하지 않으면 기본적으로 다음 패턴이 사용됩니다.

* **HTTP 상태 코드**:
    * `429`: 레이트 리밋(Rate limit)
    * `500`: 내부 서버 오류(Internal server error)
    * `502`: 잘못된 게이트웨이(Bad gateway)
    * `503`: 서비스를 사용할 수 없음(Service unavailable)
    * `504`: 게이트웨이 타임아웃(Gateway timeout)
    * `529`: Anthropic 과부하(Anthropic overloaded)

* **오류 키워드**:
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

이러한 기본 패턴은 Koog에서 [`RetryConfig.DEFAULT_PATTERNS`](api:prompt-executor-clients::ai.koog.prompt.executor.clients.retry.RetryConfig.Companion.DEFAULT_PATTERNS)로 정의되어 있습니다.

#### 사용자 정의 패턴

특정 요구 사항에 맞게 사용자 정의 패턴을 정의할 수 있습니다.

<!--- INCLUDE
import ai.koog.prompt.executor.clients.retry.RetryConfig
import ai.koog.prompt.executor.clients.retry.RetryablePattern
-->
```kotlin
val config = RetryConfig(
    retryablePatterns = listOf(
        RetryablePattern.Status(429),   // 특정 상태 코드
        RetryablePattern.Keyword("quota"),  // 오류 메시지의 키워드
        RetryablePattern.Regex(Regex("ERR_\\d+")),  // 사용자 정의 정규식 패턴
        RetryablePattern.Custom { error ->  // 사용자 정의 로직
            error.contains("temporary") && error.length > 20
        }
    )
)
```
<!--- KNIT example-handling-failures-04.kt -->

기본 `RetryConfig.DEFAULT_PATTERNS`에 사용자 정의 패턴을 추가할 수도 있습니다.

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

### 재시도를 포함한 스트리밍

스트리밍 작업에서도 선택적으로 재시도를 할 수 있습니다. 이 기능은 기본적으로 비활성화되어 있습니다.

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
    스트리밍 재시도는 첫 번째 토큰을 받기 전에 발생하는 연결 실패에만 적용됩니다.
    스트리밍이 시작되면 재시도 로직이 비활성화됩니다.
    스트리밍 도중 오류가 발생하면 작업이 종료됩니다.

### 프롬프트 실행기와 함께 재시도 사용

프롬프트 실행기를 사용할 때, Kotlin과 Java 모두에서 실행기를 생성하기 전에 기본 LLM 클라이언트를 재시도 메커니즘으로 감쌀 수 있습니다.
프롬프트 실행기에 대한 자세한 내용은 [프롬프트 실행기](prompt-executors.md)를 참조하세요.

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
    // 재시도가 포함된 단일 제공자 실행기
    val resilientClient = RetryingLLMClient(
        OpenAILLMClient(System.getenv("OPENAI_API_KEY")),
        RetryConfig.PRODUCTION
    )
    val executor = MultiLLMPromptExecutor(resilientClient)

    // 유연한 클라이언트 설정이 포함된 다중 제공자 실행기
    val multiExecutor = MultiLLMPromptExecutor(
        LLMProvider.OpenAI to RetryingLLMClient(
            OpenAILLMClient(System.getenv("OPENAI_API_KEY")),
            RetryConfig.CONSERVATIVE
        ),
        LLMProvider.Anthropic to RetryingLLMClient(
            AnthropicLLMClient(System.getenv("ANTHROPIC_API_KEY")),
            RetryConfig.AGGRESSIVE  
        ),
        // Bedrock 클라이언트는 이미 내장된 AWS SDK 재시도 기능을 가지고 있습니다. 
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
    // 재시도가 포함된 단일 제공자 실행기 (Java)
    RetryingLLMClient resilientClient = new RetryingLLMClient(
        new OpenAILLMClient(System.getenv("OPENAI_API_KEY")),
        RetryConfig.Companion.getPRODUCTION()
    );

    MultiLLMPromptExecutor executor = new MultiLLMPromptExecutor(resilientClient);

    // 유연한 클라이언트 설정이 포함된 다중 제공자 실행기 (Java)
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

## 타임아웃 설정

모든 LLM 클라이언트는 요청이 중단되는 것을 방지하기 위해 Kotlin과 Java 모두에서 타임아웃 설정을 지원합니다.
클라이언트를 생성할 때 [`ConnectionTimeoutConfig`](api:prompt-executor-clients::ai.koog.prompt.executor.clients.ConnectionTimeoutConfig) 클래스를 사용하여 네트워크 연결에 대한 타임아웃 값을 지정할 수 있습니다.

`ConnectionTimeoutConfig`는 다음과 같은 속성을 가집니다.

| 속성 | 기본값 | 설명 |
|------------------------|----------------------|---------------------------------------------------------------|
| `connectTimeoutMillis` | 60초 (60,000) | 서버와의 연결을 설정하는 최대 시간. |
| `requestTimeoutMillis` | 15분 (900,000) | 전체 요청이 완료될 때까지의 최대 시간. |
| `socketTimeoutMillis` | 15분 (900,000) | 설정된 연결을 통해 데이터를 대기하는 최대 시간. |

특정 요구 사항에 맞게 이 값들을 사용자 정의할 수 있습니다. 예를 들어:

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
                connectTimeoutMillis = 5000,    // 연결 설정에 5초
                requestTimeoutMillis = 60000,    // 전체 요청에 60초
                socketTimeoutMillis = 120000   // 소켓 데이터 대기에 120초
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
    오래 걸리는 호출이나 스트리밍 호출의 경우, `requestTimeoutMillis`와 `socketTimeoutMillis`에 더 높은 값을 설정하세요.

## 오류 처리

운영 환경에서 LLM을 사용할 때는 다음과 같은 오류 처리를 구현해야 합니다.

- 예기치 않은 오류를 처리하기 위한 **Try-catch 블록**.
- 디버깅을 위한 **컨텍스트가 포함된 오류 로깅**.
- 중요한 작업을 위한 **폴백(fallback)**.
- 반복되는 문제를 식별하기 위한 **재시도 패턴 모니터링**.

다음은 Kotlin과 Java에서의 오류 처리 예시입니다.

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

    fun processResponse(response: Any) { /* 구현부 */ }
    fun scheduleRetryLater() { /* 구현부 */ }
    fun notifyAdministrator() { /* 구현부 */ }
    fun useDefaultResponse() { /* 구현부 */ }

    try {
        val response = resilientClient.execute(prompt, model)
        processResponse(response)
    } catch (e: Exception) {
        logger.error("LLM operation failed", e)

        when {
            e.message?.contains("rate limit") == true -> {
                // 레이트 리밋(rate limit)을 구체적으로 처리합니다.
                scheduleRetryLater()
            }
            e.message?.contains("invalid api key") == true -> {
                // 인증 오류를 처리합니다.
                notifyAdministrator()
            }
            else -> {
                // 대안 해결책으로 폴백(fall back)합니다.
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

    Consumer<List<Message.Response>> processResponse = (resp) -> { /* 구현부 */ };
    Runnable scheduleRetryLater = () -> { /* 구현부 */ };
    Runnable notifyAdministrator = () -> { /* 구현부 */ };
    Runnable useDefaultResponse = () -> { /* 구현부 */ };

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