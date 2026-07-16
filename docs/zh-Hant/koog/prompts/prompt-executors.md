# Prompt 執行器

Prompt 執行器提供更高層級的抽象，讓您可以管理一個或多個 LLM 用戶端的生命週期。
您可以透過統一的介面與多個 LLM 提供者協作，將特定提供者的細節抽象化，
並在它們之間進行動態切換與備援。

## 執行器類型

Koog 提供三類實作了 [`PromptExecutor`](api:prompt-executor-model::ai.koog.prompt.executor.model.PromptExecutor) 介面的主要 Prompt 執行器：

| 類型 | <div style="width:175px">類別</div> | 說明 |
|-----------------|--------------------------------------------------------------------------------------------------------------------------------------------------------------------|----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| 單一提供者 | [`SingleLLMPromptExecutor`](api:prompt-executor-model::ai.koog.prompt.executor.llms.SingleLLMPromptExecutor) | 封裝單一提供者的單一 LLM 用戶端。如果您的代理只需要在單一 LLM 提供者內部的模型之間進行切換，請使用此執行器。 |
| 多個提供者 | [`MultiLLMPromptExecutor`](api:prompt-executor-model::ai.koog.prompt.executor.llms.MultiLLMPromptExecutor) | 封裝多個 LLM 用戶端，並根據 LLM 提供者路由呼叫。當請求的用戶端無法使用時，它可以選擇性地使用配置的備援提供者與 LLM。如果您的代理需要在不同提供者的 LLM 之間切換，請使用此執行器。 |
| 路由 | [`RoutingLLMPromptExecutor`](api:prompt-executor-model::ai.koog.prompt.executor.llms.RoutingLLMPromptExecutor) | 使用路由策略將對指定 LLM 模型的請求分發到多個用戶端執行個體。使用此執行器可避免速率限制、提高吞吐量，並實作具備負載平衡的容錯移轉策略。 |

## 建立單一提供者執行器

若要為特定的 LLM 提供者建立 Prompt 執行器，請執行以下操作：

1. 為特定提供者配置包含對應 API 金鑰的 LLM 用戶端。
2. 使用 [`MultiLLMPromptExecutor`](api:prompt-executor-model::ai.koog.prompt.executor.llms.MultiLLMPromptExecutor) 建立 Prompt 執行器。

以下是一個範例：

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

## 建立多個提供者執行器

若要建立可與多個 LLM 提供者協作的 Prompt 執行器，請執行以下操作：

1. 為需要的 LLM 提供者配置包含對應 API 金鑰的用戶端。
2. 將配置好的用戶端傳遞給 [`MultiLLMPromptExecutor`](api:prompt-executor-model::ai.koog.prompt.executor.llms.MultiLLMPromptExecutor) 類別建構函式，以建立具有多個 LLM 提供者的 Prompt 執行器。

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

## 建立路由執行器

!!! warning "實驗性 API"
    路由功能為實驗性，且可能在未來的版本中變更。
    若要使用，請透過 `@OptIn(ExperimentalRoutingApi::class)` 啟用。

若要建立使用路由策略將請求分發到多個 LLM 用戶端執行個體的 Prompt 執行器，請執行以下操作：

1. 配置多個用戶端執行個體（可屬於相同或不同的 LLM 提供者）及其對應的 API 金鑰。
2. 使用路由策略建立路由員（router），例如 [`RoundRobinRouter`](api:prompt-executor-model::ai.koog.prompt.executor.llms.RoundRobinRouter)。
3. 將路由員傳遞給 [`RoutingLLMPromptExecutor`](api:prompt-executor-model::ai.koog.prompt.executor.llms.RoutingLLMPromptExecutor) 類別建構函式。

這對於避免速率限制、提高吞吐量以及實作容錯移轉策略非常有用。

=== "Kotlin"

    <!--- INCLUDE
    import ai.koog.prompt.executor.clients.openai.OpenAILLMClient
    import ai.koog.prompt.executor.clients.anthropic.AnthropicLLMClient
    import ai.koog.prompt.executor.llms.RoundRobinRouter
    import ai.koog.prompt.executor.llms.RoutingLLMPromptExecutor
    -->
    ```kotlin
    // Create multiple client instances
    val openAI1 = OpenAILLMClient(apiKey = "openai-key-1")
    val openAI2 = OpenAILLMClient(apiKey = "openai-key-2")
    val anthropic = AnthropicLLMClient(apiKey = "anthropic-key")

    // Create router with round-robin strategy
    val router = RoundRobinRouter(openAI1, openAI2, anthropic)

    // Create routing executor
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
    // Create multiple client instances
    OpenAILLMClient openAI1 = new OpenAILLMClient("openai-key-1");
    OpenAILLMClient openAI2 = new OpenAILLMClient("openai-key-2");
    AnthropicLLMClient anthropic = new AnthropicLLMClient("anthropic-key");

    // Create router with round-robin strategy
    RoundRobinRouter router = new RoundRobinRouter(openAI1, openAI2, anthropic);

    // Create routing executor
    RoutingLLMPromptExecutor routingExecutor = new RoutingLLMPromptExecutor(router);
    ```
    <!--- KNIT example-prompt-executors-java-03.java -->

當您使用此執行器執行 Prompt 時，對 OpenAI 模型的請求將根據輪詢（round-robin）策略在 `openAI1` 與 `openAI2` 之間交替切換。
對 Anthropic 模型的請求一律會發送到單一的 `anthropic` 用戶端，因為輪詢策略會為每個提供者維護獨立的計數器。

您也可以透過建立一個實作了 [`LLMClientRouter`](api:prompt-executor-model::ai.koog.prompt.executor.llms.LLMClientRouter) 介面的類別來實作自訂路由策略。

## 預定義的 Prompt 執行器

為了更快速的設定，Koog 為 Kotlin 與 Java 的常見提供者提供了即開即用的執行器實作。

下表包含返回配置了特定 LLM 用戶端的 `SingleLLMPromptExecutor` 的 **預定義單一提供者執行器**。

<!--TODO: SingleLLMPromptExecutor is deprecated and is being replaced by PromptExecutor. Once it is implemented,
the predefined executors will return a PromptExecutor instance configured with a specific client.-->

| LLM 提供者 | Prompt 執行器 | 說明 |
|----------------|---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|----------------------------------------------------------------------------------|
| OpenAI | [simpleOpenAIExecutor](api:prompt-executor-llms-all::ai.koog.prompt.executor.llms.all.simpleOpenAIExecutor) | 封裝使用 OpenAI 模型執行 Prompt 的 `OpenAILLMClient`。 |
| OpenAI | [simpleAzureOpenAIExecutor](api:prompt-executor-llms-all::ai.koog.prompt.executor.llms.all.simpleAzureOpenAIExecutor) | 封裝配置為使用 Azure OpenAI Service 的 `OpenAILLMClient`。 |
| Anthropic | [simpleAnthropicExecutor](api:prompt-executor-llms-all::ai.koog.prompt.executor.llms.all.simpleAnthropicExecutor) | 封裝使用 Anthropic 模型執行 Prompt 的 `AnthropicLLMClient`。 |
| Google | [simpleGoogleAIExecutor](api:prompt-executor-llms-all::ai.koog.prompt.executor.llms.all.simpleGoogleAIExecutor) | 封裝使用 Google 模型執行 Prompt 的 `GoogleLLMClient`。 |
| OpenRouter | [simpleOpenRouterExecutor](api:prompt-executor-llms-all::ai.koog.prompt.executor.llms.all.simpleOpenRouterExecutor) | 封裝與 OpenRouter 搭配執行 Prompt 的 `OpenRouterLLMClient`。 |
| Amazon Bedrock | [simpleBedrockExecutor](api:prompt-executor-llms-all::ai.koog.prompt.executor.llms.all.simpleBedrockExecutor) | 封裝與 AWS Bedrock 搭配執行 Prompt 的 `BedrockLLMClient`。 |
| Amazon Bedrock | [simpleBedrockExecutorWithBearerToken](api:prompt-executor-llms-all::ai.koog.prompt.executor.llms.all.simpleBedrockExecutorWithBearerToken) | 封裝 `BedrockLLMClient` 並使用提供的 Bedrock API 金鑰發送請求。 |
| Mistral | [simpleMistralAIExecutor](api:prompt-executor-llms-all::ai.koog.prompt.executor.llms.all.simpleMistralAIExecutor) | 封裝使用 Mistral 模型執行 Prompt 的 `MistralAILLMClient`。 |
| Ollama | [simpleOllamaAIExecutor](api:prompt-executor-llms-all::ai.koog.prompt.executor.llms.all.simpleOllamaAIExecutor) | 封裝與 Ollama 搭配執行 Prompt 的 `OllamaClient`。 |

以下是建立預定義執行器的範例：

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
    // Create an OpenAI executor
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
    // Create an OpenAI executor
    PromptExecutor openAIExecutor = simpleOpenAIExecutor("OPENAI_API_KEY");
    ```
    <!--- KNIT example-prompt-executors-java-04.java -->

## 執行 Prompt

若要使用 Prompt 執行器執行 Prompt，請執行以下操作：

1. 建立一個 Prompt 執行器。
2. 使用 `execute()` 方法搭配特定的 LLM 執行 Prompt。

以下是一個範例：

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
    // Create an OpenAI executor
    val promptExecutor = simpleOpenAIExecutor("OPENAI_API_KEY")

    // Execute a prompt
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
    // Create an OpenAI executor
    PromptExecutor promptExecutor = simpleOpenAIExecutor("OPENAI_API_KEY");

    // Create a prompt
    Prompt prompt = Prompt.builder("demo")
        .user("Summarize this.")
        .build();

    // Run the prompt
    `List<Message.Response>` response = promptExecutor.execute(prompt, OpenAIModels.Chat.GPT4o);
    ```
    <!--- KNIT example-prompt-executors-java-05.java -->

這將使用 `GPT4o` 模型執行 Prompt 並傳回回應。

!!! note
    Prompt 執行器提供了使用各種功能執行 Prompt 的方法，例如串流、多重選擇產生和內容審查。
    由於 Prompt 執行器封裝了 LLM 用戶端，因此每個執行器都支援對應用戶端的功能。
    如需詳細資訊，請參閱 [LLM 用戶端](llm-clients.md)。

## 在提供者之間切換

當您使用 `MultiLLMPromptExecutor` 與多個 LLM 提供者協作時，您可以在它們之間切換。
流程如下：

1. 為您想要使用的每個提供者建立一個 LLM 用戶端執行個體。
2. 建立一個將 LLM 提供者對應到 LLM 用戶端的 `MultiLLMPromptExecutor`。
3. 使用對應用戶端的模型執行 Prompt，並將其作為引數傳遞給 `execute()` 方法。
   Prompt 執行器將根據模型提供者使用對應的用戶端來執行 Prompt。

以下是在提供者之間切換的範例：

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
    // Create LLM clients for OpenAI, Anthropic, and Google providers
    val openAIClient = OpenAILLMClient("OPENAI_API_KEY")
    val anthropicClient = AnthropicLLMClient("ANTHROPIC_API_KEY")
    val googleClient = GoogleLLMClient("GOOGLE_API_KEY")

    // Create a MultiLLMPromptExecutor that maps LLM providers to LLM clients
    val executor = MultiLLMPromptExecutor(
        LLMProvider.OpenAI to openAIClient,
        LLMProvider.Anthropic to anthropicClient,
        LLMProvider.Google to googleClient
    )

    // Create a prompt
    val p = prompt("demo") { user("Summarize this.") }

    // Run the prompt with an OpenAI model; the prompt executor automatically switches to the OpenAI client
    val openAIResult = executor.execute(p, OpenAIModels.Chat.GPT4o)

    // Run the prompt with an Anthropic model; the prompt executor automatically switches to the Anthropic client
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
    // Create LLM clients for OpenAI, Anthropic, and Google providers
    OpenAILLMClient openAIClient = new OpenAILLMClient("OPENAI_API_KEY");
    AnthropicLLMClient anthropicClient = new AnthropicLLMClient("ANTHROPIC_API_KEY");
    GoogleLLMClient googleClient = new GoogleLLMClient("GOOGLE_API_KEY");

    // Create a MultiLLMPromptExecutor that maps LLM providers to LLM clients
    MultiLLMPromptExecutor promptExecutor = new MultiLLMPromptExecutor(
        Map.of(
            LLMProvider.OpenAI, openAIClient,
            LLMProvider.Anthropic, anthropicClient,
            LLMProvider.Google, googleClient
        )
    );

    // Create a prompt
    Prompt prompt = Prompt.builder("demo")
        .user("Summarize this.")
        .build();

    // Run the prompt with an OpenAI model; the prompt executor automatically switches to the OpenAI client
    `List<Message.Response>` openAIResult = promptExecutor.execute(prompt, OpenAIModels.Chat.GPT4o);

    // Run the prompt with an Anthropic model; the prompt executor automatically switches to the Anthropic client
    `List<Message.Response>` anthropicResult = promptExecutor.execute(prompt, AnthropicModels.Sonnet_4_5);
    ```
    <!--- KNIT example-prompt-executors-java-06.java -->

您可以選擇性地配置一個備援 LLM 提供者與模型，以便在請求的用戶端無法使用時使用。
如需詳細資訊，請參閱 [配置備援](#configuring-fallbacks)。

## 配置備援

多個提供者與路由 Prompt 執行器可以配置為在請求的 LLM 用戶端無法使用時使用備援 LLM 提供者與模型。

若要配置備援機制，請在建立 `MultiLLMPromptExecutor` 或 `RoutingLLMPromptExecutor` 時傳遞備援設定：

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

如果您傳遞一個不包含在 `MultiLLMPromptExecutor` 中的 LLM 提供者的模型，
Prompt 執行器將會使用備援模型：

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
    // Create a prompt
    val p = prompt("demo") { user("Summarize this") }
    // If you pass a Google model, the prompt executor will use the fallback model, as the Google client is not included
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
    // Create a prompt
    Prompt p = Prompt.builder("demo")
        .user("Summarize this")
        .build();

    // If you pass a Google model, the prompt executor will use the fallback model, as the Google client is not included
    `List<Message.Response>` response = multiExecutor.execute(p, GoogleModels.Gemini2_5Pro);
    ```
    <!--- KNIT example-prompt-executors-java-08.java -->

!!! note
    備援僅適用於 `execute()` 與 `executeMultipleChoices()` 方法。