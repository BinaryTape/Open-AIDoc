# 프롬프트 실행기 (Prompt executors)

프롬프트 실행기(Prompt executors)는 하나 또는 여러 LLM 클라이언트의 생명 주기(lifecycle)를 관리할 수 있게 해주는 고수준 추상화를 제공합니다.
공급자별 세부 사항을 추상화한 통합 인터페이스를 통해 여러 LLM 공급자와 작업할 수 있으며, 공급자 간의 동적 전환 및 폴백(fallback) 기능을 지원합니다.

## 실행기 유형 (Executor types)

Koog는 [`PromptExecutor`](api:prompt-executor-model::ai.koog.prompt.executor.model.PromptExecutor) 인터페이스를 구현하는 세 가지 주요 프롬프트 실행기 유형을 제공합니다:

| 유형 | <div style="width:175px">클래스</div> | 설명 |
|-----------------|--------------------------------------------------------------------------------------------------------------------------------------------------------------------|----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| 단일 제공자 (Single-provider) | [`SingleLLMPromptExecutor`](api:prompt-executor-model::ai.koog.prompt.executor.llms.SingleLLMPromptExecutor) | 단일 공급자를 위한 단일 LLM 클라이언트를 래핑합니다. 에이전트가 단일 LLM 공급자 내의 모델 간 전환만 필요한 경우 이 실행기를 사용하세요. |
| 다중 제공자 (Multi-provider) | [`MultiLLMPromptExecutor`](api:prompt-executor-model::ai.koog.prompt.executor.llms.MultiLLMPromptExecutor)   | 여러 LLM 클라이언트를 래핑하고 LLM 공급자에 따라 호출을 라우팅합니다. 선택적으로 요청된 클라이언트를 사용할 수 없을 때 구성된 폴백 공급자 및 LLM을 사용할 수 있습니다. 에이전트가 서로 다른 공급자의 LLM 간에 전환해야 하는 경우 이 실행기를 사용하세요. |
| 라우팅 (Routing) | [`RoutingLLMPromptExecutor`](api:prompt-executor-model::ai.koog.prompt.executor.llms.RoutingLLMPromptExecutor) | 라우팅 전략을 사용하여 지정된 LLM 모델에 대한 요청을 여러 클라이언트 인스턴스에 분산합니다. 속도 제한(rate limits)을 피하고, 처리량(throughput)을 개선하며, 부하 분산(load balancing)과 함께 장애 조치(failover) 전략을 구현하려면 이 실행기를 사용하세요. |

## 단일 제공자 실행기 생성하기

특정 LLM 공급자를 위한 프롬프트 실행기를 생성하려면 다음 단계를 수행하세요:

1. 해당 API 키를 사용하여 특정 공급자에 대한 LLM 클라이언트를 구성합니다.
2. [`MultiLLMPromptExecutor`](api:prompt-executor-model::ai.koog.prompt.executor.llms.MultiLLMPromptExecutor)를 사용하여 프롬프트 실행기를 생성합니다.

예제는 다음과 같습니다:

=== "Kotlin"

    <!--- INCLUDE
    import ai.koog.prompt.executor.clients.openai.OpenAILLMClient
    import ai.koog.prompt.executor.llms.MultiLLMPromptExecutor
    -->

    ```kotlin
    val openAIClient = OpenAILLMClient(System.getenv("OPENAI_API_KEY"))
    val promptExecutor = MultiLLMPromptExecutor(openAIClient)
    ```
    <!--- KNIT example-prompt-executors-01.kt -->

=== "Java"

    <!--- INCLUDE
    /**
    -->
    <!--- SUFFIX
    **/
    -->
    ```java
    OpenAILLMClient openAIClient = new OpenAILLMClient(System.getenv("OPENAI_API_KEY"));
    MultiLLMPromptExecutor promptExecutor = new MultiLLMPromptExecutor(openAIClient);
    ```
    <!--- KNIT example-prompt-executors-java-01.java -->

## 다중 제공자 실행기 생성하기

여러 LLM 공급자와 함께 작동하는 프롬프트 실행기를 생성하려면 다음 단계를 수행하세요:

1. 해당 API 키를 사용하여 필요한 LLM 공급자에 대한 클라이언트를 구성합니다.
2. 구성된 클라이언트들을 [`MultiLLMPromptExecutor`](api:prompt-executor-model::ai.koog.prompt.executor.llms.MultiLLMPromptExecutor) 클래스 생성자에 전달하여 여러 LLM 공급자를 갖춘 프롬프트 실행기를 생성합니다.

=== "Kotlin"

    <!--- INCLUDE
    import ai.koog.prompt.executor.clients.openai.OpenAILLMClient
    import ai.koog.prompt.executor.ollama.client.OllamaClient
    import ai.koog.prompt.executor.llms.MultiLLMPromptExecutor
    import ai.koog.prompt.llm.LLMProvider
    -->

    ```kotlin
    val openAIClient = OpenAILLMClient(System.getenv("OPENAI_API_KEY"))
    val ollamaClient = OllamaClient()

    val multiExecutor = MultiLLMPromptExecutor(
        LLMProvider.OpenAI to openAIClient,
        LLMProvider.Ollama to ollamaClient
    )
    ```
    <!--- KNIT example-prompt-executors-02.kt -->

=== "Java"

    <!--- INCLUDE
    /**
    -->
    <!--- SUFFIX
    **/
    -->
    ```java
    OpenAILLMClient openAIClient = new OpenAILLMClient(System.getenv("OPENAI_API_KEY"));
    OllamaClient ollamaClient = new OllamaClient();

    MultiLLMPromptExecutor promptExecutor = new MultiLLMPromptExecutor(openAIClient, ollamaClient);
    ```
    <!--- KNIT example-prompt-executors-java-02.java -->

## 라우팅 실행기 생성하기

!!! warning "실험적 API"
    라우팅 기능은 실험적이며 향후 릴리스에서 변경될 수 있습니다.
    이를 사용하려면 `@OptIn(ExperimentalRoutingApi::class)`를 통해 옵트인(opt in)하세요.

라우팅 전략을 사용하여 여러 LLM 클라이언트 인스턴스에 요청을 분산하는 프롬프트 실행기를 생성하려면 다음 단계를 수행하세요:

1. 해당 API 키를 사용하여 여러 클라이언트 인스턴스(동일하거나 서로 다른 LLM 공급자일 수 있음)를 구성합니다.
2. [`RoundRobinRouter`](api:prompt-executor-model::ai.koog.prompt.executor.llms.RoundRobinRouter)와 같은 라우팅 전략을 사용하여 라우터를 생성합니다.
3. 라우터를 [`RoutingLLMPromptExecutor`](api:prompt-executor-model::ai.koog.prompt.executor.llms.RoutingLLMPromptExecutor) 클래스 생성자에 전달합니다.

이는 속도 제한을 피하고, 처리량을 개선하며, 장애 조치 전략을 구현하는 데 유용합니다.

=== "Kotlin"

    <!--- INCLUDE
    import ai.koog.prompt.executor.clients.openai.OpenAILLMClient
    import ai.koog.prompt.executor.clients.anthropic.AnthropicLLMClient
    import ai.koog.prompt.executor.llms.RoundRobinRouter
    import ai.koog.prompt.executor.llms.RoutingLLMPromptExecutor
    -->
    ```kotlin
    // 여러 클라이언트 인스턴스 생성
    val openAI1 = OpenAILLMClient(apiKey = "openai-key-1")
    val openAI2 = OpenAILLMClient(apiKey = "openai-key-2")
    val anthropic = AnthropicLLMClient(apiKey = "anthropic-key")

    // 라운드 로빈 전략으로 라우터 생성
    val router = RoundRobinRouter(openAI1, openAI2, anthropic)

    // 라우팅 실행기 생성
    val routingExecutor = RoutingLLMPromptExecutor(router)
    ```
    <!--- KNIT example-prompt-executors-03.kt -->

=== "Java"

    <!--- INCLUDE
    /**
    -->
    <!--- SUFFIX
    **/
    -->
    ```java
    // 여러 클라이언트 인스턴스 생성
    OpenAILLMClient openAI1 = new OpenAILLMClient("openai-key-1");
    OpenAILLMClient openAI2 = new OpenAILLMClient("openai-key-2");
    AnthropicLLMClient anthropic = new AnthropicLLMClient("anthropic-key");

    // 라운드 로빈 전략으로 라우터 생성
    RoundRobinRouter router = new RoundRobinRouter(openAI1, openAI2, anthropic);

    // 라우팅 실행기 생성
    RoutingLLMPromptExecutor routingExecutor = new RoutingLLMPromptExecutor(router);
    ```
    <!--- KNIT example-prompt-executors-java-03.java -->

이 실행기로 프롬프트를 실행하면, OpenAI 모델에 대한 요청은 라운드 로빈 전략을 사용하여 `openAI1`과 `openAI2` 사이에서 번갈아 가며 수행됩니다.
Anthropic 모델에 대한 요청은 항상 단일 `anthropic` 클라이언트로 전달되는데, 라운드 로빈은 공급자별로 독립적인 카운터를 유지하기 때문입니다.

[`LLMClientRouter`](api:prompt-executor-model::ai.koog.prompt.executor.llms.LLMClientRouter) 인터페이스를 구현하는 클래스를 생성하여 커스텀 라우팅 전략을 구현할 수도 있습니다.

## 사전에 정의된 프롬프트 실행기

빠른 설정을 위해 Koog는 Kotlin과 Java 모두에서 일반적인 공급자에 대해 바로 사용할 수 있는 실행기 구현을 제공합니다.

다음 표는 특정 LLM 클라이언트로 구성된 `SingleLLMPromptExecutor`를 반환하는 **사전에 정의된 단일 제공자 실행기** 목록입니다.

<!--TODO: SingleLLMPromptExecutor is deprecated and is being replaced by PromptExecutor. Once it is implemented,
the predefined executors will return a PromptExecutor instance configured with a specific client.-->

| LLM 공급자 | 프롬프트 실행기 | 설명 |
|----------------|---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|----------------------------------------------------------------------------------|
| OpenAI         | [simpleOpenAIExecutor](api:prompt-executor-llms-all::ai.koog.prompt.executor.llms.all.simpleOpenAIExecutor)                                  | OpenAI 모델로 프롬프트를 실행하는 `OpenAILLMClient`를 래핑합니다. |
| OpenAI         | [simpleAzureOpenAIExecutor](api:prompt-executor-llms-all::ai.koog.prompt.executor.llms.all.simpleAzureOpenAIExecutor)                       | Azure OpenAI Service를 사용하도록 구성된 `OpenAILLMClient`를 래핑합니다. |
| Anthropic      | [simpleAnthropicExecutor](api:prompt-executor-llms-all::ai.koog.prompt.executor.llms.all.simpleAnthropicExecutor)                              | Anthropic 모델로 프롬프트를 실행하는 `AnthropicLLMClient`를 래핑합니다. |
| Google         | [simpleGoogleAIExecutor](api:prompt-executor-llms-all::ai.koog.prompt.executor.llms.all.simpleGoogleAIExecutor)                              | Google 모델로 프롬프트를 실행하는 `GoogleLLMClient`를 래핑합니다. |
| OpenRouter     | [simpleOpenRouterExecutor](api:prompt-executor-llms-all::ai.koog.prompt.executor.llms.all.simpleOpenRouterExecutor)                           | OpenRouter로 프롬프트를 실행하는 `OpenRouterLLMClient`를 래핑합니다. |
| Amazon Bedrock | [simpleBedrockExecutor](api:prompt-executor-llms-all::ai.koog.prompt.executor.llms.all.simpleBedrockExecutor)                                  | AWS Bedrock으로 프롬프트를 실행하는 `BedrockLLMClient`를 래핑합니다. |
| Amazon Bedrock | [simpleBedrockExecutorWithBearerToken](api:prompt-executor-llms-all::ai.koog.prompt.executor.llms.all.simpleBedrockExecutorWithBearerToken) | `BedrockLLMClient`를 래핑하며 제공된 Bedrock API 키를 사용하여 요청을 보냅니다. |
| Mistral        | [simpleMistralAIExecutor](api:prompt-executor-llms-all::ai.koog.prompt.executor.llms.all.simpleMistralAIExecutor)                            | Mistral 모델로 프롬프트를 실행하는 `MistralAILLMClient`를 래핑합니다. |
| Ollama         | [simpleOllamaAIExecutor](api:prompt-executor-llms-all::ai.koog.prompt.executor.llms.all.simpleOllamaAIExecutor)                              | Ollama로 프롬프트를 실행하는 `OllamaClient`를 래핑합니다. |

사전에 정의된 실행기를 생성하는 예제는 다음과 같습니다:

=== "Kotlin"

    <!--- INCLUDE
    import ai.koog.prompt.executor.llms.all.simpleOpenAIExecutor
    import ai.koog.prompt.executor.llms.MultiLLMPromptExecutor
    import ai.koog.prompt.executor.clients.anthropic.AnthropicLLMClient
    import ai.koog.prompt.executor.clients.google.GoogleLLMClient
    import ai.koog.prompt.executor.clients.openai.OpenAILLMClient
    import kotlinx.coroutines.runBlocking
    -->

    ```kotlin
    // OpenAI 실행기 생성
    val promptExecutor = simpleOpenAIExecutor("OPENAI_API_KEY")
    ```
    <!--- KNIT example-prompt-executors-04.kt -->

=== "Java"

    <!--- INCLUDE
    /**
    -->
    <!--- SUFFIX
    **/
    -->
    ```java
    // OpenAI 실행기 생성
    PromptExecutor openAIExecutor = simpleOpenAIExecutor("OPENAI_API_KEY");
    ```
    <!--- KNIT example-prompt-executors-java-04.java -->

## 프롬프트 실행하기

프롬프트 실행기를 사용하여 프롬프트를 실행하려면 다음 단계를 수행하세요:

1. 프롬프트 실행기를 생성합니다.
2. `execute()` 메서드를 사용하여 특정 LLM으로 프롬프트를 실행합니다.

예제는 다음과 같습니다:

=== "Kotlin"

    <!--- INCLUDE
    import ai.koog.prompt.dsl.prompt
    import ai.koog.prompt.executor.llms.all.simpleOpenAIExecutor
    import ai.koog.prompt.executor.clients.openai.OpenAIModels
    import kotlinx.coroutines.runBlocking
    fun main() {
        runBlocking {
    -->
    <!--- SUFFIX
        }
    }
    -->

    ```kotlin
    // OpenAI 실행기 생성
    val promptExecutor = simpleOpenAIExecutor("OPENAI_API_KEY")

    // 프롬프트 실행
    val response = promptExecutor.execute(
        prompt = prompt("demo") { user("Summarize this.") },
        model = OpenAIModels.Chat.GPT4o
    )
    ```
    <!--- KNIT example-prompt-executors-05.kt -->

=== "Java"

    <!--- INCLUDE
    /**
    -->
    <!--- SUFFIX
    **/
    -->
    ```java
    // OpenAI 실행기 생성
    PromptExecutor promptExecutor = simpleOpenAIExecutor("OPENAI_API_KEY");

    // 프롬프트 생성
    Prompt prompt = Prompt.builder("demo")
        .user("Summarize this.")
        .build();

    // 프롬프트 실행
    `List<Message.Response>` response = promptExecutor.execute(prompt, OpenAIModels.Chat.GPT4o);
    ```
    <!--- KNIT example-prompt-executors-java-05.java -->

이렇게 하면 `GPT4o` 모델로 프롬프트가 실행되고 응답이 반환됩니다.

!!! note
    프롬프트 실행기는 스트리밍, 다중 선택 생성(multiple choice generation), 콘텐츠 중재(content moderation) 등 다양한 기능을 사용하여 프롬프트를 실행하는 메서드를 제공합니다. 프롬프트 실행기는 LLM 클라이언트를 래핑하므로, 각 실행기는 해당 클라이언트의 기능을 지원합니다. 자세한 내용은 [LLM 클라이언트](llm-clients.md)를 참조하세요.

## 공급자 간 전환하기

`MultiLLMPromptExecutor`를 사용하여 여러 LLM 공급자와 작업할 때, 공급자 간에 전환할 수 있습니다. 프로세스는 다음과 같습니다:

1. 사용하려는 각 공급자에 대해 LLM 클라이언트 인스턴스를 생성합니다.
2. LLM 공급자를 LLM 클라이언트에 매핑하는 `MultiLLMPromptExecutor`를 생성합니다.
3. `execute()` 메서드의 인자로 전달된 클라이언트에 해당하는 모델로 프롬프트를 실행합니다. 프롬프트 실행기는 모델 공급자를 기반으로 해당 클라이언트를 사용하여 프롬프트를 실행합니다.

공급자 간 전환 예제는 다음과 같습니다:

=== "Kotlin"

    <!--- INCLUDE
    import ai.koog.prompt.executor.llms.MultiLLMPromptExecutor
    import ai.koog.prompt.executor.clients.anthropic.AnthropicLLMClient
    import ai.koog.prompt.executor.clients.google.GoogleLLMClient
    import ai.koog.prompt.executor.clients.openai.OpenAILLMClient
    import ai.koog.prompt.executor.clients.openai.OpenAIModels
    import ai.koog.prompt.executor.clients.anthropic.AnthropicModels
    import ai.koog.prompt.llm.LLMProvider
    import ai.koog.prompt.dsl.prompt
    import kotlinx.coroutines.runBlocking
    fun main() = runBlocking {
    -->
    <!--- SUFFIX
    }
    -->

    ```kotlin
    // OpenAI, Anthropic, Google 공급자를 위한 LLM 클라이언트 생성
    val openAIClient = OpenAILLMClient("OPENAI_API_KEY")
    val anthropicClient = AnthropicLLMClient("ANTHROPIC_API_KEY")
    val googleClient = GoogleLLMClient("GOOGLE_API_KEY")

    // LLM 공급자를 LLM 클라이언트에 매핑하는 MultiLLMPromptExecutor 생성
    val executor = MultiLLMPromptExecutor(
        LLMProvider.OpenAI to openAIClient,
        LLMProvider.Anthropic to anthropicClient,
        LLMProvider.Google to googleClient
    )

    // 프롬프트 생성
    val p = prompt("demo") { user("Summarize this.") }

    // OpenAI 모델로 프롬프트 실행; 프롬프트 실행기가 자동으로 OpenAI 클라이언트로 전환함
    val openAIResult = executor.execute(p, OpenAIModels.Chat.GPT4o)

    // Anthropic 모델로 프롬프트 실행; 프롬프트 실행기가 자동으로 Anthropic 클라이언트로 전환함
    val anthropicResult = executor.execute(p, AnthropicModels.Sonnet_4_5)
    ```
    <!--- KNIT example-prompt-executors-06.kt -->

=== "Java"

    <!--- INCLUDE
    /**
    -->
    <!--- SUFFIX
    **/
    -->
    ```java
    // OpenAI, Anthropic, Google 공급자를 위한 LLM 클라이언트 생성
    OpenAILLMClient openAIClient = new OpenAILLMClient("OPENAI_API_KEY");
    AnthropicLLMClient anthropicClient = new AnthropicLLMClient("ANTHROPIC_API_KEY");
    GoogleLLMClient googleClient = new GoogleLLMClient("GOOGLE_API_KEY");

    // LLM 공급자를 LLM 클라이언트에 매핑하는 MultiLLMPromptExecutor 생성
    MultiLLMPromptExecutor promptExecutor = new MultiLLMPromptExecutor(
        Map.of(
            LLMProvider.OpenAI, openAIClient,
            LLMProvider.Anthropic, anthropicClient,
            LLMProvider.Google, googleClient
        )
    );

    // 프롬프트 생성
    Prompt prompt = Prompt.builder("demo")
        .user("Summarize this.")
        .build();

    // OpenAI 모델로 프롬프트 실행; 프롬프트 실행기가 자동으로 OpenAI 클라이언트로 전환함
    `List<Message.Response>` openAIResult = promptExecutor.execute(prompt, OpenAIModels.Chat.GPT4o);

    // Anthropic 모델로 프롬프트 실행; 프롬프트 실행기가 자동으로 Anthropic 클라이언트로 전환함
    `List<Message.Response>` anthropicResult = promptExecutor.execute(prompt, AnthropicModels.Sonnet_4_5);
    ```
    <!--- KNIT example-prompt-executors-java-06.java -->

요청된 클라이언트를 사용할 수 없을 때 사용할 폴백(fallback) LLM 공급자 및 모델을 선택적으로 구성할 수 있습니다. 자세한 내용은 [폴백 구성하기](#configuring-fallbacks)를 참조하세요.

## 폴백 구성하기

다중 제공자 및 라우팅 프롬프트 실행기는 요청된 LLM 클라이언트를 사용할 수 없을 때 사용할 폴백 LLM 공급자 및 모델을 사용하도록 구성할 수 있습니다.

폴백 메커니즘을 구성하려면 `MultiLLMPromptExecutor` 또는 `RoutingLLMPromptExecutor`를 생성할 때 폴백 설정을 전달하세요:

=== "Kotlin"

    <!--- INCLUDE
    import ai.koog.prompt.executor.llms.MultiLLMPromptExecutor
    import ai.koog.prompt.executor.clients.openai.OpenAILLMClient
    import ai.koog.prompt.executor.ollama.client.OllamaClient
    import ai.koog.prompt.executor.ollama.client.OllamaModels
    import ai.koog.prompt.llm.LLMProvider
    -->

    ```kotlin
    val openAIClient = OpenAILLMClient(System.getenv("OPENAI_API_KEY"))
    val ollamaClient = OllamaClient()

    val multiExecutor = MultiLLMPromptExecutor(
        LLMProvider.OpenAI to openAIClient,
        LLMProvider.Ollama to ollamaClient,
        fallback = MultiLLMPromptExecutor.FallbackPromptExecutorSettings(
            fallbackProvider = LLMProvider.Ollama,
            fallbackModel = OllamaModels.Meta.LLAMA_3_2
        )
    )
    ```
    <!--- KNIT example-prompt-executors-07.kt -->

=== "Java"

    <!--- INCLUDE
    /**
    -->
    <!--- SUFFIX
    **/
    -->
    ```java
    OpenAILLMClient openAIClient = new OpenAILLMClient(System.getenv("OPENAI_API_KEY"));
    OllamaClient ollamaClient = new OllamaClient();

    MultiLLMPromptExecutor multiExecutor = new MultiLLMPromptExecutor(
        Map.of(
            LLMProvider.OpenAI, openAIClient,
            LLMProvider.Ollama, ollamaClient
        ),
        new MultiLLMPromptExecutor.FallbackPromptExecutorSettings(
            LLMProvider.Ollama,
            OllamaModels.Meta.LLAMA_3_2
        )
    );
    ```
    <!--- KNIT example-prompt-executors-java-07.java -->

만약 `MultiLLMPromptExecutor`에 포함되지 않은 LLM 공급자의 모델을 전달하면, 프롬프트 실행기는 폴백 모델을 사용합니다:

=== "Kotlin"

    <!--- INCLUDE
    import ai.koog.prompt.dsl.prompt
    import ai.koog.prompt.executor.llms.MultiLLMPromptExecutor
    import ai.koog.prompt.executor.clients.openai.OpenAILLMClient
    import ai.koog.prompt.executor.ollama.client.OllamaClient
    import ai.koog.prompt.executor.clients.google.GoogleModels
    import ai.koog.prompt.executor.ollama.client.OllamaModels
    import ai.koog.prompt.llm.LLMProvider
    import kotlinx.coroutines.runBlocking
    val openAIClient = OpenAILLMClient(System.getenv("OPENAI_API_KEY"))
    val ollamaClient = OllamaClient()
    val multiExecutor = MultiLLMPromptExecutor(
        LLMProvider.OpenAI to openAIClient,
        LLMProvider.Ollama to ollamaClient,
        fallback = MultiLLMPromptExecutor.FallbackPromptExecutorSettings(
            fallbackProvider = LLMProvider.Ollama,
            fallbackModel = OllamaModels.Meta.LLAMA_3_2
        )
    )
    fun main() = runBlocking {
    -->
    <!--- SUFFIX
    }
    -->

    ```kotlin
    // 프롬프트 생성
    val p = prompt("demo") { user("Summarize this") }
    // Google 모델을 전달하면 Google 클라이언트가 포함되어 있지 않으므로 프롬프트 실행기는 폴백 모델을 사용합니다
    val response = multiExecutor.execute(p, GoogleModels.Gemini2_5Pro)
    ```
    <!--- KNIT example-prompt-executors-08.kt -->

=== "Java"

    <!--- INCLUDE
    /**
    -->
    <!--- SUFFIX
    **/
    -->
    ```java
    // 프롬프트 생성
    Prompt p = Prompt.builder("demo")
        .user("Summarize this")
        .build();

    // Google 모델을 전달하면 Google 클라이언트가 포함되어 있지 않으므로 프롬프트 실행기는 폴백 모델을 사용합니다
    `List<Message.Response>` response = multiExecutor.execute(p, GoogleModels.Gemini2_5Pro);
    ```
    <!--- KNIT example-prompt-executors-java-08.java -->

!!! note
    폴백은 `execute()` 및 `executeMultipleChoices()` 메서드에서만 사용할 수 있습니다.