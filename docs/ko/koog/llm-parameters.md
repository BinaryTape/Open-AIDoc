# LLM 파라미터

이 페이지는 Koog 에이전틱 프레임워크(agentic framework)의 LLM 파라미터에 대한 세부 정보를 제공합니다. LLM 파라미터를 사용하면 언어 모델의 동작을 제어하고 커스터마이징할 수 있습니다.

## 개요 {id="overview"}

LLM 파라미터는 언어 모델이 응답을 생성하는 방식을 미세 조정할 수 있는 구성 옵션입니다. 이러한 파라미터는 응답의 무작위성, 길이, 형식 및 도구 사용과 같은 측면을 제어합니다. 파라미터를 조정하여 창의적인 콘텐츠 생성부터 결정론적인(deterministic) 구조화된 출력(structured outputs)까지, 다양한 유스케이스에 맞춰 모델 동작을 최적화할 수 있습니다.

Koog에서 `LLMParams` 클래스는 LLM 파라미터를 통합하며 언어 모델 동작 구성을 위한 일관된 인터페이스를 제공합니다. LLM 파라미터는 다음과 같은 방법으로 사용할 수 있습니다:

- 프롬프트를 생성할 때:

=== "Kotlin"

    <!--- INCLUDE
    import ai.koog.prompt.dsl.prompt
    import ai.koog.prompt.params.LLMParams
    -->
    ```kotlin
    val prompt = prompt(
        id = "dev-assistant",
        params = LLMParams(
            temperature = 0.7,
            maxTokens = 500
        )
    ) {
        // 컨텍스트 설정을 위해 시스템 메시지 추가
        system("You are a helpful assistant.")

        // 사용자 메시지 추가
        user("Tell me about Kotlin")
    }
    ```
    <!--- KNIT example-llm-parameters-01.kt -->

=== "Java"

    <!--- INCLUDE
    /**
    -->
    <!--- SUFFIX
    **/
    -->
    ```java
    Prompt prompt = Prompt.builder("dev-assistant")
        .withParams(new LLMParams(
            0.7,         // temperature
            500,         // maxTokens
            1,           // numberOfChoices
            null,        // speculation
            null,        // schema
            LLMParams.ToolChoice.Auto.INSTANCE, // toolChoice
            null,        // user
            null         // additionalProperties
        ))
        .system("You are a helpful assistant.")
        .user("Tell me about Kotlin")
        .build();
    ```
    <!--- KNIT example-llm-parameters-java-01.java -->

프롬프트 생성에 대한 자세한 내용은 [프롬프트(Prompts)](prompts/prompt-creation/index.md)를 참고하세요.

- 서브그래프(subgraph)를 생성할 때:

=== "Kotlin"

    <!--- INCLUDE
    import ai.koog.agents.core.dsl.builder.strategy
    import ai.koog.agents.ext.tool.SayToUser
    import ai.koog.prompt.executor.clients.openai.OpenAIModels
    import ai.koog.agents.ext.agent.subgraphWithTask
    import ai.koog.prompt.params.LLMParams
    val searchTool = SayToUser
    val calculatorTool = SayToUser
    val weatherTool = SayToUser
    val strategy = strategy<String, String>("strategy_name") {
    -->
    <!--- SUFFIX
    }
    -->
    ```kotlin
    val processQuery by subgraphWithTask<String, String>(
        tools = listOf(searchTool, calculatorTool, weatherTool),
        llmModel = OpenAIModels.Chat.GPT4o,
        llmParams = LLMParams(
            temperature = 0.7,
            maxTokens = 500
        ),
        parallelTools = false,
        assistantResponseRepeatMax = 3,
    ) { userQuery ->
        """
        You are a helpful assistant that can answer questions about various topics.
        Please help with the following query:
        $userQuery
        """
    }
    ```
    <!--- KNIT example-llm-parameters-02.kt -->

=== "Java"

    <!--- INCLUDE
    /**
    -->
    <!--- SUFFIX
    **/
    -->
    ```java
    ```
    <!--- KNIT example-llm-parameters-java-02.java -->

Koog에서 제공하는 기존 서브그래프 유형에 대한 자세한 내용은 [사전 정의된 서브그래프(Predefined subgraphs)](nodes-and-components.md#predefined-subgraphs)를 참고하세요. 직접 서브그래프를 생성하고 구현하는 방법을 알아보려면 [커스텀 서브그래프(Custom subgraphs)](custom-subgraphs.md)를 참고하세요.

- LLM 쓰기 세션(write session)에서 프롬프트를 업데이트할 때:

=== "Kotlin"

    <!--- INCLUDE
    import ai.koog.agents.core.dsl.builder.strategy
    import ai.koog.agents.core.dsl.builder.node
    import ai.koog.prompt.params.LLMParams
    val strategy = strategy<Unit, Unit>("strategy-name") {
    val node by node<Unit, Unit> {
    -->
    <!--- SUFFIX
       }
    }
    -->
    ```kotlin
    llm.writeSession {
        changeLLMParams(
            LLMParams(
                temperature = 0.7,
                maxTokens = 500
            )
        )
    }
    ```
    <!--- KNIT example-llm-parameters-03.kt -->

=== "Java"

    <!--- INCLUDE
    /**
    -->
    <!--- SUFFIX
    **/
    -->
    ```java
    ```
    <!--- KNIT example-llm-parameters-java-03.java -->

세션에 대한 자세한 내용은 [LLM 세션 및 수동 히스토리 관리](sessions.md)를 참고하세요.

## LLM 파라미터 레퍼런스 {id="llm-parameter-reference"}

다음 표는 `LLMParams` 클래스에 포함되어 있으며 Koog에서 기본적으로 제공하는 모든 LLM 제공자가 지원하는 LLM 파라미터 레퍼런스를 제공합니다.
특정 제공자 전용 파라미터 목록은 [제공자 전용 파라미터](#provider-specific-parameters)를 참고하세요.

| 파라미터 | 타입 | 설명 |
|------------------------|--------------------------------|-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `temperature`          | Double                         | 출력의 무작위성을 제어합니다. 0.7–1.0과 같이 높은 값은 더 다양하고 창의적인 응답을 생성하며, 낮은 값은 더 결정론적(deterministic)이고 집중된 응답을 생성합니다. |
| `maxTokens`            | Integer                        | 응답에서 생성할 최대 토큰 수입니다. 응답 길이를 제어하는 데 유용합니다. |
| `numberOfChoices`      | Integer                        | 생성할 대체 응답의 수입니다. 0보다 커야 합니다. |
| `speculation`          | String                         | 결과의 속도와 정확성을 향상시키기 위해 설계된, 모델 동작에 영향을 미치는 추측성(speculative) 구성 문자열입니다. 특정 모델에서만 지원되지만 속도와 정확성을 크게 향상시킬 수 있습니다. |
| `schema`               | Schema                         | 모델의 응답 형식 구조를 정의하여 JSON과 같은 구조화된 출력을 가능하게 합니다. 자세한 내용은 [스키마(Schema)](#schema)를 참고하세요. |
| `toolChoice`           | ToolChoice                     | 언어 모델의 도구 호출 동작을 제어합니다. 자세한 내용은 [도구 선택(Tool choice)](#tool-choice)을 참고하세요. |
| `user`                 | String                         | 요청을 수행하는 사용자의 식별자로, 추적 목적으로 사용할 수 있습니다. |
| `additionalProperties` | Map&lt;String, JsonElement&gt; | 특정 모델 제공자 전용의 커스텀 파라미터를 저장하는 데 사용할 수 있는 추가 속성입니다. |

각 파라미터의 기본값 목록은 해당 LLM 제공자 문서를 참고하세요:

- [OpenAI Chat](https://platform.openai.com/docs/api-reference/chat/create)
- [OpenAI Responses](https://platform.openai.com/docs/api-reference/responses/create)
- [Google](https://ai.google.dev/api/generate-content#generationconfig) β
- [Anthropic](https://platform.claude.com/docs/en/api/messages/create)
- [Mistral](https://docs.mistral.ai/api/#operation/chatCompletions) β
- [DeepSeek](https://api-docs.deepseek.com/api/create-chat-completion#request) β
- [OpenRouter](https://openrouter.ai/docs/api/reference/parameters)
- Alibaba β ([DashScope](https://www.alibabacloud.com/help/en/model-studio/qwen-api-reference))
- [Ollama](https://docs.ollama.com/api/openai-compatibility)

## 스키마 (Schema) {id="schema"}

`Schema` 인터페이스는 모델의 응답 형식 구조를 정의합니다.
Koog는 아래 섹션에 설명된 대로 JSON 스키마를 지원합니다.

### JSON 스키마 {id="json-schemas"}

JSON 스키마를 사용하면 언어 모델로부터 구조화된 JSON 데이터를 요청할 수 있습니다. Koog는 다음과 같은 두 가지 유형의 JSON 스키마를 지원합니다:

1) **기본 JSON 스키마** (`LLMParams.Schema.JSON.Basic`): 기본적인 JSON 처리 기능에 사용됩니다. 이 형식은 고급 JSON Schema 기능 없이 주로 중첩된 데이터 정의에 중점을 둡니다.

=== "Kotlin"

    <!--- INCLUDE
    import ai.koog.prompt.params.LLMParams
    import kotlinx.serialization.json.JsonObject
    import kotlinx.serialization.json.JsonArray
    import kotlinx.serialization.json.JsonPrimitive
    -->
    ```kotlin
    // 기본 JSON 스키마를 사용하여 파라미터 생성
    val jsonParams = LLMParams(
        temperature = 0.2,
        schema = LLMParams.Schema.JSON.Basic(
            name = "PersonInfo",
            schema = JsonObject(mapOf(
                "type" to JsonPrimitive("object"),
                "properties" to JsonObject(
                    mapOf(
                        "name" to JsonObject(mapOf("type" to JsonPrimitive("string"))),
                        "age" to JsonObject(mapOf("type" to JsonPrimitive("number"))),
                        "skills" to JsonObject(
                            mapOf(
                                "type" to JsonPrimitive("array"),
                                "items" to JsonObject(mapOf("type" to JsonPrimitive("string")))
                            )
                        )
                    )
                ),
                "additionalProperties" to JsonPrimitive(false),
                "required" to JsonArray(listOf(JsonPrimitive("name"), JsonPrimitive("age"), JsonPrimitive("skills")))
            ))
        )
    )
    ```
    <!--- KNIT example-llm-parameters-04.kt -->

=== "Java"

    <!--- INCLUDE
    /**
    -->
    <!--- SUFFIX
    **/
    -->
    ```java
    // 기본 JSON 스키마를 사용하여 파라미터 생성
    LLMParams jsonParams = new LLMParams(
        0.2,         // temperature
        null,        // maxTokens
        1,           // numberOfChoices
        null,        // speculation
        new LLMParams.Schema.JSON.Basic(
            "PersonInfo",
            new JsonObject(Map.of(
                "type", new JsonPrimitive("object"),
                "properties", new JsonObject(Map.of(
                    "name", new JsonObject(Map.of("type", new JsonPrimitive("string"))),
                    "age", new JsonObject(Map.of("type", new JsonPrimitive("number"))),
                    "skills", new JsonObject(Map.of(
                        "type", new JsonPrimitive("array"),
                        "items", new JsonObject(Map.of("type", new JsonPrimitive("string")))
                    ))
                )),
                "additionalProperties", new JsonPrimitive(false),
                "required", new JsonArray(List.of(
                    new JsonPrimitive("name"),
                    new JsonPrimitive("age"),
                    new JsonPrimitive("skills")
                ))
            ))
        ),
        LLMParams.ToolChoice.Auto.INSTANCE, // toolChoice
        null,        // user
        null         // additionalProperties
    );
    ```
    <!--- KNIT example-llm-parameters-java-04.java -->

2) **표준 JSON 스키마** (`LLMParams.Schema.JSON.Standard`): [json-schema.org](https://json-schema.org/)에 따른 표준 JSON 스키마를 나타냅니다. 이 형식은 공식 JSON Schema 사양의 적절한 하위 집합입니다. 모든 LLM 제공자가 전체 JSON 스키마를 지원하는 것은 아니므로 제공자마다 세부 사양이 다를 수 있음에 유의하세요.

=== "Kotlin"

    <!--- INCLUDE
    import ai.koog.prompt.params.LLMParams
    import kotlinx.serialization.json.JsonObject
    import kotlinx.serialization.json.JsonPrimitive
    import kotlinx.serialization.json.JsonArray
    -->
    ```kotlin
    // 표준 JSON 스키마를 사용하여 파라미터 생성
    val standardJsonParams = LLMParams(
        temperature = 0.2,
        schema = LLMParams.Schema.JSON.Standard(
            name = "ProductCatalog",
            schema = JsonObject(mapOf(
                "type" to JsonPrimitive("object"),
                "properties" to JsonObject(mapOf(
                    "products" to JsonObject(mapOf(
                        "type" to JsonPrimitive("array"),
                        "items" to JsonObject(mapOf(
                            "type" to JsonPrimitive("object"),
                            "properties" to JsonObject(mapOf(
                                "id" to JsonObject(mapOf("type" to JsonPrimitive("string"))),
                                "name" to JsonObject(mapOf("type" to JsonPrimitive("string"))),
                                "price" to JsonObject(mapOf("type" to JsonPrimitive("number"))),
                                "description" to JsonObject(mapOf("type" to JsonPrimitive("string")))
                            )),
                            "additionalProperties" to JsonPrimitive(false),
                            "required" to JsonArray(listOf(JsonPrimitive("id"), JsonPrimitive("name"), JsonPrimitive("price"), JsonPrimitive("description")))
                        ))
                    ))
                )),
                "additionalProperties" to JsonPrimitive(false),
                "required" to JsonArray(listOf(JsonPrimitive("products")))
            ))
        )
    )
    ```
    <!--- KNIT example-llm-parameters-05.kt -->

=== "Java"

    <!--- INCLUDE
    /**
    -->
    <!--- SUFFIX
    **/
    -->
    ```java
    // 표준 JSON 스키마를 사용하여 파라미터 생성
    LLMParams standardJsonParams = new LLMParams(
        0.2,         // temperature
        null,        // maxTokens
        1,           // numberOfChoices
        null,        // speculation
        new LLMParams.Schema.JSON.Standard(
            "ProductCatalog",
            new JsonObject(Map.of(
                "type", new JsonPrimitive("object"),
                "properties", new JsonObject(Map.of(
                    "products", new JsonObject(Map.of(
                        "type", new JsonPrimitive("array"),
                        "items", new JsonObject(Map.of(
                            "type", new JsonPrimitive("object"),
                            "properties", new JsonObject(Map.of(
                                "id", new JsonObject(Map.of("type", new JsonPrimitive("string"))),
                                "name", new JsonObject(Map.of("type", new JsonPrimitive("string"))),
                                "price", new JsonObject(Map.of("type", new JsonPrimitive("number"))),
                                "description", new JsonObject(Map.of("type", new JsonPrimitive("string")))
                            )),
                            "additionalProperties", new JsonPrimitive(false),
                            "required", new JsonArray(List.of(
                                new JsonPrimitive("id"),
                                new JsonPrimitive("name"),
                                new JsonPrimitive("price"),
                                new JsonPrimitive("description")
                            ))
                        ))
                    ))
                )),
                "additionalProperties", new JsonPrimitive(false),
                "required", new JsonArray(List.of(new JsonPrimitive("products")))
            ))
        ),
        LLMParams.ToolChoice.Auto.INSTANCE, // toolChoice
        null,        // user
        null         // additionalProperties
    );
    ```
    <!--- KNIT example-llm-parameters-java-05.java -->

## 도구 선택 (Tool choice) {id="tool-choice"}

`ToolChoice` 클래스는 언어 모델이 도구를 사용하는 방식을 제어합니다. 다음과 같은 옵션을 제공합니다:

* `LLMParams.ToolChoice.Named`: 언어 모델이 지정된 도구를 호출합니다. 호출할 도구의 이름을 나타내는 `name` 문자열 인자를 받습니다.
* `LLMParams.ToolChoice.All`: 언어 모델이 모든 도구를 호출합니다.
* `LLMParams.ToolChoice.None`: 언어 모델이 도구를 호출하지 않고 텍스트만 생성합니다.
* `LLMParams.ToolChoice.Auto`: 언어 모델이 도구 호출 여부와 호출할 도구를 자동으로 결정합니다.
* `LLMParams.ToolChoice.Required`: 언어 모델이 최소 하나 이상의 도구를 호출합니다.

다음은 특정 도구를 호출하기 위해 `LLMParams.ToolChoice.Named` 클래스를 사용하는 예시입니다:

=== "Kotlin"

    <!--- INCLUDE
    import ai.koog.prompt.params.LLMParams
    -->
    ```kotlin
    val specificToolParams = LLMParams(
        toolChoice = LLMParams.ToolChoice.Named(name = "calculator")
    )
    ```
    <!--- KNIT example-llm-parameters-06.kt -->

=== "Java"

    <!--- INCLUDE
    /**
    -->
    <!--- SUFFIX
    **/
    -->
    ```java
    LLMParams specificToolParams = new LLMParams(
        null,        // temperature
        null,        // maxTokens
        1,           // numberOfChoices
        null,        // speculation
        null,        // schema
        new LLMParams.ToolChoice.Named("calculator"), // toolChoice
        null,        // user
        null         // additionalProperties
    );
    ```
    <!--- KNIT example-llm-parameters-java-06.java -->

## 제공자 전용 파라미터 {id="provider-specific-parameters"}

Koog는 일부 LLM 제공자에 대해 제공자 전용 파라미터를 지원합니다. 이러한 파라미터는 기본 `LLMParams` 클래스를 확장하고 제공자 전용 기능을 추가합니다. 다음 클래스들은 각 제공자별로 특화된 파라미터를 포함합니다:

- `OpenAIChatParams`: OpenAI Chat Completions API 전용 파라미터.
- `OpenAIResponsesParams`: OpenAI Responses API 전용 파라미터.
- `GoogleParams`: Google 모델 전용 파라미터.
- `AnthropicParams`: Anthropic 모델 전용 파라미터.
- `MistralAIParams`: Mistral 모델 전용 파라미터.
- `DeepSeekParams`: DeepSeek 모델 전용 파라미터.
- `OpenRouterParams`: OpenRouter 모델 전용 파라미터.
- `DashscopeParams`: Alibaba 모델 전용 파라미터.
- `OllamaParams`: Ollama 모델 전용 파라미터.

Koog의 제공자 전용 파라미터에 대한 전체 레퍼런스는 다음과 같습니다:

=== "OpenAI Chat"

    --8<--
    llm-parameters-snippets.md:heading
    llm-parameters-snippets.md:audio
    llm-parameters-snippets.md:frequencyPenalty
    llm-parameters-snippets.md:logprobs
    llm-parameters-snippets.md:parallelToolCalls
    llm-parameters-snippets.md:presencePenalty
    llm-parameters-snippets.md:promptCacheKey
    llm-parameters-snippets.md:reasoningEffort
    llm-parameters-snippets.md:safetyIdentifier
    llm-parameters-snippets.md:serviceTier
    llm-parameters-snippets.md:stop
    llm-parameters-snippets.md:store
    llm-parameters-snippets.md:topLogprobs
    llm-parameters-snippets.md:topP
    llm-parameters-snippets.md:webSearchOptions
    --8<--

=== "OpenAI Responses"

    --8<--
    llm-parameters-snippets.md:heading
    llm-parameters-snippets.md:background
    llm-parameters-snippets.md:include
    llm-parameters-snippets.md:logprobs
    llm-parameters-snippets.md:maxToolCalls
    llm-parameters-snippets.md:parallelToolCalls
    llm-parameters-snippets.md:promptCacheKey
    llm-parameters-snippets.md:reasoning
    llm-parameters-snippets.md:safetyIdentifier
    llm-parameters-snippets.md:serviceTier
    llm-parameters-snippets.md:store
    llm-parameters-snippets.md:topLogprobs
    llm-parameters-snippets.md:topP
    llm-parameters-snippets.md:truncation
    --8<--

=== "Google"

    --8<--
    llm-parameters-snippets.md:heading
    llm-parameters-snippets.md:thinkingConfig
    llm-parameters-snippets.md:topK
    llm-parameters-snippets.md:topP
    --8<--

=== "Anthropic"

    --8<--
    llm-parameters-snippets.md:heading
    llm-parameters-snippets.md:container
    llm-parameters-snippets.md:mcpServers
    llm-parameters-snippets.md:serviceTier
    llm-parameters-snippets.md:stopSequences
    llm-parameters-snippets.md:thinking
    llm-parameters-snippets.md:topK
    llm-parameters-snippets.md:topP
    --8<--

=== "Mistral"

    --8<--
    llm-parameters-snippets.md:heading
    llm-parameters-snippets.md:frequencyPenalty
    llm-parameters-snippets.md:parallelToolCalls
    llm-parameters-snippets.md:presencePenalty
    llm-parameters-snippets.md:promptMode
    llm-parameters-snippets.md:randomSeed
    llm-parameters-snippets.md:safePrompt
    llm-parameters-snippets.md:stop
    llm-parameters-snippets.md:topP
    --8<--

=== "DeepSeek"

    --8<--
    llm-parameters-snippets.md:heading
    llm-parameters-snippets.md:frequencyPenalty
    llm-parameters-snippets.md:logprobs
    llm-parameters-snippets.md:presencePenalty
    llm-parameters-snippets.md:stop
    llm-parameters-snippets.md:topLogprobs
    llm-parameters-snippets.md:topP
    --8<--

=== "OpenRouter"

    --8<--
    llm-parameters-snippets.md:heading
    llm-parameters-snippets.md:frequencyPenalty
    llm-parameters-snippets.md:logprobs
    llm-parameters-snippets.md:minP
    llm-parameters-snippets.md:models
    llm-parameters-snippets.md:presencePenalty
    llm-parameters-snippets.md:provider
    llm-parameters-snippets.md:repetitionPenalty
    llm-parameters-snippets.md:route
    llm-parameters-snippets.md:stop
    llm-parameters-snippets.md:topA
    llm-parameters-snippets.md:topK
    llm-parameters-snippets.md:topLogprobs
    llm-parameters-snippets.md:topP
    llm-parameters-snippets.md:transforms
    --8<--

=== "Alibaba (DashScope)"

    --8<--
    llm-parameters-snippets.md:heading
    llm-parameters-snippets.md:enableSearch
    llm-parameters-snippets.md:enableThinking
    llm-parameters-snippets.md:frequencyPenalty
    llm-parameters-snippets.md:logprobs
    llm-parameters-snippets.md:parallelToolCalls
    llm-parameters-snippets.md:presencePenalty
    llm-parameters-snippets.md:stop
    llm-parameters-snippets.md:topLogprobs
    llm-parameters-snippets.md:topP
    --8<--

=== "Ollama"

    --8<--
    llm-parameters-snippets.md:heading
    llm-parameters-snippets.md:think
    --8<--

다음 예시는 제공자 전용 `OpenRouterParams` 클래스를 사용하여 정의된 OpenRouter LLM 파라미터를 보여줍니다:

=== "Kotlin"

    <!--- INCLUDE
    import ai.koog.prompt.executor.clients.openrouter.OpenRouterParams
    -->
    ```kotlin
    val openRouterParams = OpenRouterParams(
        temperature = 0.7,
        maxTokens = 500,
        frequencyPenalty = 0.5,
        presencePenalty = 0.5,
        topP = 0.9,
        topK = 40,
        repetitionPenalty = 1.1,
        models = listOf("anthropic/claude-3-opus", "anthropic/claude-3-sonnet"),
        transforms = listOf("middle-out")
    )
    ```
    <!--- KNIT example-llm-parameters-07.kt -->

=== "Java"

    <!--- INCLUDE
    /**
    -->
    <!--- SUFFIX
    **/
    -->
    ```java
    OpenRouterParams openRouterParams = new OpenRouterParams(
        0.7,         // temperature
        500,         // maxTokens
        1,           // numberOfChoices
        null,        // speculation
        null,        // schema
        null,        // toolChoice
        null,        // user
        null,        // additionalProperties
        0.5,         // frequencyPenalty
        null,        // logprobs
        null,        // minP
        Arrays.asList("anthropic/claude-3-opus", "anthropic/claude-3-sonnet"), // models
        0.5,         // presencePenalty
        null,        // provider
        1.1,         // repetitionPenalty
        null,        // route
        null,        // stop
        null,        // topA
        40,          // topK
        null,        // topLogprobs
        0.9,         // topP
        Arrays.asList("middle-out") // transforms
    );
    ```
    <!--- KNIT example-llm-parameters-java-07.java -->

## 사용 예시 {id="usage-examples"}

### 기본 사용법 {id="basic-usage"}

=== "Kotlin"

    <!--- INCLUDE
    import ai.koog.prompt.params.LLMParams
    -->
    ```kotlin
    // 길이가 제한된 기본 파라미터 세트
    val basicParams = LLMParams(
        temperature = 0.7,
        maxTokens = 150,
        toolChoice = LLMParams.ToolChoice.Auto
    )
    ```
    <!--- KNIT example-llm-parameters-08.kt -->

=== "Java"

    <!--- INCLUDE
    /**
    -->
    <!--- SUFFIX
    **/
    -->
    ```java
    // 길이가 제한된 기본 파라미터 세트
    LLMParams basicParams = new LLMParams(
        0.7,         // temperature
        150,         // maxTokens
        1,           // numberOfChoices
        null,        // speculation
        null,        // schema
        LLMParams.ToolChoice.Auto.INSTANCE, // toolChoice
        null,        // user
        null         // additionalProperties
    );
    ```
    <!--- KNIT example-llm-parameters-java-08.java -->

### 추론(Reasoning) 제어 {id="reasoning-control"}

모델의 추론을 제어하는 제공자 전용 파라미터를 통해 추론 제어를 구현합니다.
OpenAI Chat API 및 추론을 지원하는 모델을 사용하는 경우, `reasoningEffort` 파라미터를 사용하여 모델이 응답을 제공하기 전에 생성할 추론 토큰의 양을 제어할 수 있습니다:

=== "Kotlin"

    <!--- INCLUDE
    import ai.koog.prompt.executor.clients.openai.OpenAIChatParams
    import ai.koog.prompt.executor.clients.openai.base.models.ReasoningEffort
    -->
    ```kotlin
    val openAIReasoningEffortParams = OpenAIChatParams(
        reasoningEffort = ReasoningEffort.MEDIUM
    )
    ```
    <!--- KNIT example-llm-parameters-09.kt -->

=== "Java"

    <!--- INCLUDE
    /**
    -->
    <!--- SUFFIX
    **/
    -->
    ```java
    OpenAIChatParams openAIReasoningEffortParams = new OpenAIChatParams(
        null,        // temperature
        null,        // maxTokens
        1,           // numberOfChoices
        null,        // speculation
        null,        // schema
        null,        // toolChoice
        null,        // user
        null,        // additionalProperties
        null,        // audio
        null,        // frequencyPenalty
        null,        // logprobs
        null,        // parallelToolCalls
        null,        // presencePenalty
        null,        // promptCacheKey
        ReasoningEffort.MEDIUM, // reasoningEffort
        null,        // safetyIdentifier
        null,        // serviceTier
        null,        // stop
        null,        // store
        null,        // topLogprobs
        null,        // topP
        null         // webSearchOptions
    );
    ```
    <!--- KNIT example-llm-parameters-java-09.java -->

또한, 상태 비저장(stateless) 모드에서 OpenAI Responses API를 사용하는 경우, 추론 항목의 암호화된 히스토리를 유지하고 매 대화 차례(conversation turn)마다 이를 모델에 전송합니다. 암호화는 OpenAI 측에서 수행되며, 요청 시 `include` 파라미터를 `reasoning.encrypted_content`로 설정하여 암호화된 추론 토큰을 요청해야 합니다.
그런 다음 다음 대화 차례에서 암호화된 추론 토큰을 모델에 다시 전달할 수 있습니다.

=== "Kotlin"

    <!--- INCLUDE
    import ai.koog.prompt.executor.clients.openai.OpenAIResponsesParams
    import ai.koog.prompt.executor.clients.openai.models.OpenAIInclude
    -->
    ```kotlin
    val openAIStatelessReasoningParams = OpenAIResponsesParams(
        include = listOf(OpenAIInclude.REASONING_ENCRYPTED_CONTENT)
    )
    ```
    <!--- KNIT example-llm-parameters-10.kt -->

=== "Java"

    <!--- INCLUDE
    /**
    -->
    <!--- SUFFIX
    **/
    -->
    ```java
    OpenAIResponsesParams openAIStatelessReasoningParams = new OpenAIResponsesParams(
        null,        // temperature
        null,        // maxTokens
        1,           // numberOfChoices
        null,        // speculation
        null,        // schema
        null,        // toolChoice
        null,        // user
        null,        // additionalProperties
        null,        // background
        Arrays.asList(OpenAIInclude.REASONING_ENCRYPTED_CONTENT), // include
        null,        // logprobs
        null,        // maxToolCalls
        null,        // parallelToolCalls
        null,        // promptCacheKey
        null,        // reasoning
        null,        // safetyIdentifier
        null,        // serviceTier
        null,        // store
        null,        // topLogprobs
        null,        // topP
        null         // truncation
    );
    ```
    <!--- KNIT example-llm-parameters-java-10.java -->

### 커스텀 파라미터 {id="custom-parameters"}

제공자 전용이거나 Koog에서 기본적으로 지원하지 않는 커스텀 파라미터를 추가하려면 아래 예시와 같이 `additionalProperties` 속성을 사용하세요.

=== "Kotlin"

    <!--- INCLUDE
    import ai.koog.prompt.params.LLMParams
    import ai.koog.prompt.params.additionalPropertiesOf
    -->
    ```kotlin
    // 특정 모델 제공자를 위한 커스텀 파라미터 추가
    val customParams = LLMParams(
        additionalProperties = additionalPropertiesOf(
            "top_p" to 0.95,
            "frequency_penalty" to 0.5,
            "presence_penalty" to 0.5
        )
    )
    ```
    <!--- KNIT example-llm-parameters-11.kt -->

=== "Java"

    <!--- INCLUDE
    /**
    -->
    <!--- SUFFIX
    **/
    -->
    ```java
    // 특정 모델 제공자를 위한 커스텀 파라미터 추가
    LLMParams customParams = new LLMParams(
        null,        // temperature
        null,        // maxTokens
        1,           // numberOfChoices
        null,        // speculation
        null,        // schema
        null,        // toolChoice
        null,        // user
        AdditionalPropertiesKt.additionalPropertiesOf(
            "top_p", 0.95,
            "frequency_penalty", 0.5,
            "presence_penalty", 0.5
        )
    );
    ```
    <!--- KNIT example-llm-parameters-java-11.java -->

### 파라미터 설정 및 재정의(Overriding) {id="setting-and-overriding-parameters"}

아래 코드 샘플은 주로 사용할 LLM 파라미터 세트를 정의한 후, 원래 세트의 값을 일부 재정의하고 새 값을 추가하여 다른 세트를 생성하는 방법을 보여줍니다.
이를 통해 대부분의 요청에 공통적인 파라미터를 정의하고, 공통 파라미터를 반복할 필요 없이 더 구체적인 파라미터 조합을 추가할 수 있습니다.

=== "Kotlin"

    <!--- INCLUDE
    import ai.koog.prompt.params.LLMParams
    -->
    ```kotlin
    // 기본 파라미터 정의
    val defaultParams = LLMParams(
        temperature = 0.7,
        maxTokens = 150,
        toolChoice = LLMParams.ToolChoice.Auto
    )

    // 일부는 재정의하고 나머지는 기본값을 사용하는 파라미터 생성
    val overrideParams = LLMParams(
        temperature = 0.2,
        numberOfChoices = 3
    ).default(defaultParams)
    ```
    <!--- KNIT example-llm-parameters-12.kt -->

=== "Java"

    <!--- INCLUDE
    /**
    -->
    <!--- SUFFIX
    **/
    -->
    ```java
    // 기본 파라미터 정의
    LLMParams defaultParams = new LLMParams(
        0.7,         // temperature
        150,         // maxTokens
        1,           // numberOfChoices
        null,        // speculation
        null,        // schema
        LLMParams.ToolChoice.Auto.INSTANCE, // toolChoice
        null,        // user
        null         // additionalProperties
    );

    // 일부는 재정의하고 나머지는 기본값을 사용하는 파라미터 생성
    LLMParams overrideParams = new LLMParams(
        0.2,         // temperature
        null,        // maxTokens
        3,           // numberOfChoices
        null,        // speculation
        null,        // schema
        null,        // toolChoice
        null,        // user
        null         // additionalProperties
    ).applyDefaults(defaultParams);
    ```
    <!--- KNIT example-llm-parameters-java-12.java -->

결과로 생성된 `overrideParams` 세트의 값은 다음과 동일합니다:

=== "Kotlin"

    <!--- INCLUDE
    import ai.koog.prompt.params.LLMParams
    -->
    ```kotlin
    val overrideParams = LLMParams(
        temperature = 0.2,
        maxTokens = 150,
        toolChoice = LLMParams.ToolChoice.Auto,
        numberOfChoices = 3
    )
    ```
    <!--- KNIT example-llm-parameters-13.kt -->

=== "Java"

    <!--- INCLUDE
    /**
    -->
    <!--- SUFFIX
    **/
    -->
    ```java
    LLMParams overrideParams = new LLMParams(
        0.2,         // temperature
        150,         // maxTokens
        3,           // numberOfChoices
        null,        // speculation
        null,        // schema
        LLMParams.ToolChoice.Auto.INSTANCE, // toolChoice
        null,        // user
        null         // additionalProperties
    );
    ```
    <!--- KNIT example-llm-parameters-java-13.java -->