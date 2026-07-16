# 提示执行器

提示执行器提供了一种更高级别的抽象，让您可以管理一个或多个 LLM 客户端的生命周期。
您可以通过统一接口与多个 LLM 提供商协作，从特定提供商的细节中抽象出来，并在它们之间进行动态切换和回退。

## 执行器类型

Koog 提供了三种主要类型的提示执行器，它们实现了 [`PromptExecutor`](api:prompt-executor-model::ai.koog.prompt.executor.model.PromptExecutor) 接口：

| 类型            | <div style="width:175px">类</div>                                                                                                                               | 描述                                                                                                                                                                                                                                                          |
|-----------------|--------------------------------------------------------------------------------------------------------------------------------------------------------------------|----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| 单提供商 | [`SingleLLMPromptExecutor`](api:prompt-executor-model::ai.koog.prompt.executor.llms.SingleLLMPromptExecutor) | 包装单个提供商的单个 LLM 客户端。如果您的智能体仅需要在单个 LLM 提供商内的模型之间切换，请使用此执行器。                                                                                                                     |
| 多提供商  | [`MultiLLMPromptExecutor`](api:prompt-executor-model::ai.koog.prompt.executor.llms.MultiLLMPromptExecutor)   | 包装多个 LLM 客户端，并根据 LLM 提供商路由调用。当请求的客户端不可用时，它可以选择性地使用配置的回退提供商和 LLM。如果您的智能体需要在不同提供商的 LLM 之间切换，请使用此执行器。 |
| 路由         | [`RoutingLLMPromptExecutor`](api:prompt-executor-model::ai.koog.prompt.executor.llms.RoutingLLMPromptExecutor) | 使用路由策略将请求分发到多个客户端实例中的给定 LLM 模型。使用此执行器可以避免速率限制、提高吞吐量，并通过负载均衡实现故障转移策略。                                               |

## 创建单提供商执行器

要为特定的 LLM 提供商创建提示执行器，请执行以下操作：

1. 使用相应的 API 密钥为特定提供商配置 LLM 客户端。
2. 使用 [`MultiLLMPromptExecutor`](api:prompt-executor-model::ai.koog.prompt.executor.llms.MultiLLMPromptExecutor) 创建提示执行器。

示例如下：

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

## 创建多提供商执行器

要创建可与多个 LLM 提供商协作的提示执行器，请执行以下操作：

1. 使用相应的 API 密钥为所需的 LLM 提供商配置客户端。
2. 将配置好的客户端传递给 [`MultiLLMPromptExecutor`](api:prompt-executor-model::ai.koog.prompt.executor.llms.MultiLLMPromptExecutor) 类构造函数，以创建包含多个 LLM 提供商的提示执行器。

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

## 创建路由执行器

!!! warning "实验性 API"
    路由功能处于实验性阶段，可能会在未来的版本中发生变化。
    要使用它们，请通过 `@OptIn(ExperimentalRoutingApi::class)` 进行选择性加入。

要创建使用路由策略在多个 LLM 客户端实例之间分发请求的提示执行器，请执行以下操作：

1. 配置多个客户端实例（可以针对相同或不同的 LLM 提供商）及其相应的 API 密钥。
2. 使用路由策略创建路由器，例如 [`RoundRobinRouter`](api:prompt-executor-model::ai.koog.prompt.executor.llms.RoundRobinRouter)。
3. 将路由器传递给 [`RoutingLLMPromptExecutor`](api:prompt-executor-model::ai.koog.prompt.executor.llms.RoutingLLMPromptExecutor) 类构造函数。

这对于避免速率限制、提高吞吐量和实现故障转移策略非常有用。

=== "Kotlin"

    <!--- INCLUDE
    import ai.koog.prompt.executor.clients.openai.OpenAILLMClient
    import ai.koog.prompt.executor.clients.anthropic.AnthropicLLMClient
    import ai.koog.prompt.executor.llms.RoundRobinRouter
    import ai.koog.prompt.executor.llms.RoutingLLMPromptExecutor
    -->
    ```kotlin
    // 创建多个客户端实例
    val openAI1 = OpenAILLMClient(apiKey = "openai-key-1")
    val openAI2 = OpenAILLMClient(apiKey = "openai-key-2")
    val anthropic = AnthropicLLMClient(apiKey = "anthropic-key")

    // 使用轮询策略创建路由器
    val router = RoundRobinRouter(openAI1, openAI2, anthropic)

    // 创建路由执行器
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
    // 创建多个客户端实例
    OpenAILLMClient openAI1 = new OpenAILLMClient("openai-key-1");
    OpenAILLMClient openAI2 = new OpenAILLMClient("openai-key-2");
    AnthropicLLMClient anthropic = new AnthropicLLMClient("anthropic-key");

    // 使用轮询策略创建路由器
    RoundRobinRouter router = new RoundRobinRouter(openAI1, openAI2, anthropic);

    // 创建路由执行器
    RoutingLLMPromptExecutor routingExecutor = new RoutingLLMPromptExecutor(router);
    ```
    <!--- KNIT example-prompt-executors-java-03.java -->

当您使用此执行器执行提示时，发往 OpenAI 模型的请求将在 `openAI1` 和 `openAI2` 之间轮流切换（使用轮询策略）。
发往 Anthropic 模型的请求将始终转到单个 `anthropic` 客户端，因为轮询策略会为每个提供商维护独立的计数器。

您还可以通过创建一个实现 [`LLMClientRouter`](api:prompt-executor-model::ai.koog.prompt.executor.model.LLMClientRouter) 接口的类来实现自定义路由策略。

## 预定义提示执行器

为了更快地进行设置，Koog 为 Kotlin 和 Java 中的常用提供商提供了现成的执行器实现。

下表包含了返回配置有特定 LLM 客户端的 `SingleLLMPromptExecutor` 的**预定义单提供商执行器**。

<!--TODO: SingleLLMPromptExecutor is deprecated and is being replaced by PromptExecutor. Once it is implemented,
the predefined executors will return a PromptExecutor instance configured with a specific client.-->

| LLM 提供商   | 提示执行器                                                                                                                                                                             | 描述                                                                      |
|----------------|---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|----------------------------------------------------------------------------------|
| OpenAI         | [simpleOpenAIExecutor](api:prompt-executor-llms-all::ai.koog.prompt.executor.llms.all.simpleOpenAIExecutor)                                  | 包装使用 OpenAI 模型运行提示的 `OpenAILLMClient`。                    |
| OpenAI         | [simpleAzureOpenAIExecutor](api:prompt-executor-llms-all::ai.koog.prompt.executor.llms.all.simpleAzureOpenAIExecutor)                       | 包装为使用 Azure OpenAI Service 而配置的 `OpenAILLMClient`。               |
| Anthropic      | [simpleAnthropicExecutor](api:prompt-executor-llms-all::ai.koog.prompt.executor.llms.all.simpleAnthropicExecutor)                              | 包装使用 Anthropic 模型运行提示的 `AnthropicLLMClient`。              |
| Google         | [simpleGoogleAIExecutor](api:prompt-executor-llms-all::ai.koog.prompt.executor.llms.all.simpleGoogleAIExecutor)                              | 包装使用 Google 模型运行提示的 `GoogleLLMClient`。                    |
| OpenRouter     | [simpleOpenRouterExecutor](api:prompt-executor-llms-all::ai.koog.prompt.executor.llms.all.simpleOpenRouterExecutor)                           | 包装使用 OpenRouter 运行提示的 `OpenRouterLLMClient`。                   |
| Amazon Bedrock | [simpleBedrockExecutor](api:prompt-executor-llms-all::ai.koog.prompt.executor.llms.all.simpleBedrockExecutor)                                  | 包装使用 AWS Bedrock 运行提示的 `BedrockLLMClient`。                     |
| Amazon Bedrock | [simpleBedrockExecutorWithBearerToken](api:prompt-executor-llms-all::ai.koog.prompt.executor.llms.all.simpleBedrockExecutorWithBearerToken) | 包装 `BedrockLLMClient` 并使用提供的 Bedrock API 密钥发送请求。 |
| Mistral        | [simpleMistralAIExecutor](api:prompt-executor-llms-all::ai.koog.prompt.executor.llms.all.simpleMistralAIExecutor)                            | 包装使用 Mistral 模型运行提示的 `MistralAILLMClient`。                |
| Ollama         | [simpleOllamaAIExecutor](api:prompt-executor-llms-all::ai.koog.prompt.executor.llms.all.simpleOllamaAIExecutor)                              | 包装使用 Ollama 运行提示的 `OllamaClient`。                              |

下面是创建预定义执行器的示例：

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
    // 创建 OpenAI 执行器
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
    // 创建 OpenAI 执行器
    PromptExecutor openAIExecutor = simpleOpenAIExecutor("OPENAI_API_KEY");
    ```
    <!--- KNIT example-prompt-executors-java-04.java -->

## 运行提示

要使用提示执行器运行提示，请执行以下操作：

1. 创建提示执行器。
2. 使用 `execute()` 方法运行带有特定 LLM 的提示。

示例如下：

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
    // 创建 OpenAI 执行器
    val promptExecutor = simpleOpenAIExecutor("OPENAI_API_KEY")

    // 执行提示
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
    // 创建 OpenAI 执行器
    PromptExecutor promptExecutor = simpleOpenAIExecutor("OPENAI_API_KEY");

    // 创建提示
    Prompt prompt = Prompt.builder("demo")
        .user("Summarize this.")
        .build();

    // 运行提示
    `List<Message.Response>` response = promptExecutor.execute(prompt, OpenAIModels.Chat.GPT4o);
    ```
    <!--- KNIT example-prompt-executors-java-05.java -->

这将使用 `GPT4o` 模型运行提示并返回响应。

!!! note
    提示执行器提供了使用各种能力运行提示的方法，例如流式处理、多项选择生成和内容审核。由于提示执行器包装了 LLM 客户端，每个执行器都支持相应客户端的功能。详情请参阅 [LLM 客户端](llm-clients.md)。

## 在提供商之间切换

当您使用 `MultiLLMPromptExecutor` 与多个 LLM 提供商协作时，可以在它们之间进行切换。过程如下：

1. 为您想要使用的每个提供商创建一个 LLM 客户端实例。
2. 创建一个将 LLM 提供商映射到 LLM 客户端的 `MultiLLMPromptExecutor`。
3. 将来自相应客户端的模型作为参数传递给 `execute()` 方法来运行提示。提示执行器将根据模型提供商使用相应的客户端来运行提示。

在提供商之间切换的示例如下：

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
    // 为 OpenAI、Anthropic 和 Google 提供商创建 LLM 客户端
    val openAIClient = OpenAILLMClient("OPENAI_API_KEY")
    val anthropicClient = AnthropicLLMClient("ANTHROPIC_API_KEY")
    val googleClient = GoogleLLMClient("GOOGLE_API_KEY")

    // 创建一个将 LLM 提供商映射到 LLM 客户端的 MultiLLMPromptExecutor
    val executor = MultiLLMPromptExecutor(
        LLMProvider.OpenAI to openAIClient,
        LLMProvider.Anthropic to anthropicClient,
        LLMProvider.Google to googleClient
    )

    // 创建提示
    val p = prompt("demo") { user("Summarize this.") }

    // 使用 OpenAI 模型运行提示；提示执行器会自动切换到 OpenAI 客户端
    val openAIResult = executor.execute(p, OpenAIModels.Chat.GPT4o)

    // 使用 Anthropic 模型运行提示；提示执行器会自动切换到 Anthropic 客户端
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
    // 为 OpenAI、Anthropic 和 Google 提供商创建 LLM 客户端
    OpenAILLMClient openAIClient = new OpenAILLMClient("OPENAI_API_KEY");
    AnthropicLLMClient anthropicClient = new AnthropicLLMClient("ANTHROPIC_API_KEY");
    GoogleLLMClient googleClient = new GoogleLLMClient("GOOGLE_API_KEY");

    // 创建一个将 LLM 提供商映射到 LLM 客户端的 MultiLLMPromptExecutor
    MultiLLMPromptExecutor promptExecutor = new MultiLLMPromptExecutor(
        Map.of(
            LLMProvider.OpenAI, openAIClient,
            LLMProvider.Anthropic, anthropicClient,
            LLMProvider.Google, googleClient
        )
    );

    // 创建提示
    Prompt prompt = Prompt.builder("demo")
        .user("Summarize this.")
        .build();

    // 使用 OpenAI 模型运行提示；提示执行器会自动切换到 OpenAI 客户端
    `List<Message.Response>` openAIResult = promptExecutor.execute(prompt, OpenAIModels.Chat.GPT4o);

    // 使用 Anthropic 模型运行提示；提示执行器会自动切换到 Anthropic 客户端
    `List<Message.Response>` anthropicResult = promptExecutor.execute(prompt, AnthropicModels.Sonnet_4_5);
    ```
    <!--- KNIT example-prompt-executors-java-06.java -->

您可以选择配置回退 LLM 提供商和模型，以便在请求的客户端不可用时使用。有关详情，请参阅[配置回退](#configuring-fallbacks)。

## 配置回退

多提供商和路由提示执行器可以配置为：在请求的 LLM 客户端不可用时使用回退 LLM 提供商和模型。

要配置回退机制，请在创建 `MultiLLMPromptExecutor` 或 `RoutingLLMPromptExecutor` 时传递回退设置：

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

如果您传递的模型所属的 LLM 提供商未包含在 `MultiLLMPromptExecutor` 中，提示执行器将使用回退模型：

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
    // 创建提示
    val p = prompt("demo") { user("Summarize this") }
    // 如果您传递一个 Google 模型，提示执行器将使用回退模型，因为不包含 Google 客户端
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
    // 创建提示
    Prompt p = Prompt.builder("demo")
        .user("Summarize this")
        .build();

    // 如果您传递一个 Google 模型，提示执行器将使用回退模型，因为不包含 Google 客户端
    `List<Message.Response>` response = multiExecutor.execute(p, GoogleModels.Gemini2_5Pro);
    ```
    <!--- KNIT example-prompt-executors-java-08.java -->

!!! note
    回退功能仅适用于 `execute()` 和 `executeMultipleChoices()` 方法。