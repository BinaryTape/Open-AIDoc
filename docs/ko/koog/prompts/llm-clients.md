# LLM 클라이언트

LLM 클라이언트는 LLM 프로바이더(LLM provider)와 직접 상호작용하기 위해 설계되었습니다.
각 클라이언트는 프롬프트 실행 및 응답 스트리밍 메서드를 제공하는 [`LLMClient`](api:prompt-executor-clients::ai.koog.prompt.executor.clients.LLMClient) 인터페이스를 구현합니다.

단일 LLM 프로바이더를 사용하며 고급 수명 주기 관리가 필요하지 않은 경우 LLM 클라이언트를 사용할 수 있습니다.
여러 LLM 프로바이더를 관리해야 하는 경우에는 [프롬프트 실행기(prompt executor)](prompt-executors.md)를 사용하세요.

아래 표는 사용 가능한 LLM 클라이언트와 해당 기능을 보여줍니다.

| LLM 프로바이더                                        | LLMClient                                                                                                                                                                                                   | 도구<br/>호출 | 스트리밍 | 다중<br/>선택 | 임베딩 | 모더레이션 | <div style="width:50px">모델<br/>목록 조회</div> | <div style="width:200px">비고</div>                                                                                        |
|-----------------------------------------------------|-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|------------------|-----------|----------------------|------------|------------|-------------------------------------------------|-----------------------------------------------------------------------------------------------------------------------------|
| [OpenAI](https://platform.openai.com/docs/overview) | [OpenAILLMClient](api:prompt-executor-openai-client::ai.koog.prompt.executor.clients.openai.OpenAILLMClient)                | ✓                | ✓         | ✓                    | ✓          | ✓[^1]      | ✓                                               |                                                                                                                             |
| [Anthropic](https://www.anthropic.com/)             | [AnthropicLLMClient](api:prompt-executor-anthropic-client::ai.koog.prompt.executor.clients.anthropic.AnthropicLLMClient)      | ✓                | ✓         | -                    | -          | -          | -                                               | -                                                                                                                           |
| [Google](https://ai.google.dev/)                    | [GoogleLLMClient](api:prompt-executor-google-client::ai.koog.prompt.executor.clients.google.GoogleLLMClient)                  | ✓                | ✓         | ✓                    | ✓          | -          | ✓                                               | -                                                                                                                           |
| [DeepSeek](https://www.deepseek.com/)               | [DeepSeekLLMClient](api:prompt-executor-deepseek-client::ai.koog.prompt.executor.clients.deepseek.DeepSeekLLMClient)         | ✓                | ✓         | ✓                    | -          | -          | ✓                                               | OpenAI 호환 채팅 클라이언트.                                                                                              |
| [OpenRouter](https://openrouter.ai/)                | [OpenRouterLLMClient](api:prompt-executor-openrouter-client::ai.koog.prompt.executor.clients.openrouter.OpenRouterLLMClient) | ✓                | ✓         | ✓                    | -          | -          | ✓                                               | OpenAI 호환 라우터 클라이언트.                                                                                            |
| [Amazon Bedrock](https://aws.amazon.com/bedrock/)   | [BedrockLLMClient](api:prompt-executor-bedrock-client::ai.koog.prompt.executor.clients.bedrock.BedrockLLMClient)              | ✓                | ✓         | -                    | ✓          | ✓[^2]      | -                                               | 여러 모델 제품군을 지원하는 JVM 전용 AWS SDK 클라이언트.                                                              |
| [Mistral](https://mistral.ai/)                      | [MistralAILLMClient](api:prompt-executor-mistralai-client::ai.koog.prompt.executor.clients.mistralai.MistralAILLMClient)    | ✓                | ✓         | ✓                    | ✓          | ✓[^3]      | ✓                                               | OpenAI 호환 클라이언트.                                                                                                   |
| [Alibaba](https://www.alibabacloud.com/en?_p_lc=1)  | [DashScopeLLMClient](api:prompt-executor-dashscope-client::ai.koog.prompt.executor.clients.dashscope.DashscopeLLMClient)      | ✓                | ✓         | ✓                    | -          | -          | ✓                                               | 프로바이더 전용 파라미터(`enableSearch`, `parallelToolCalls`, `enableThinking`)를 제공하는 OpenAI 호환 클라이언트. |
| [Ollama](https://ollama.com/)                       | [OllamaClient](api:prompt-executor-ollama-client::ai.koog.prompt.executor.ollama.client.OllamaClient)                            | ✓                | ✓         | -                    | ✓          | ✓          | -                                               | 모델 관리 API를 포함한 로컬 서버 클라이언트.                                                                             |

## 프롬프트 실행하기

LLM 클라이언트를 사용하여 프롬프트를 실행하려면 다음 단계를 수행하세요.

1. 애플리케이션과 LLM 프로바이더 사이의 연결을 처리하는 LLM 클라이언트를 생성합니다.
2. 프롬프트와 LLM을 인자로 하여 `execute()` 메서드를 호출합니다.

다음은 `OpenAILLMClient`를 사용하여 프롬프트를 실행하는 예시입니다.

=== "Kotlin"

    <!--- INCLUDE
    import ai.koog.prompt.dsl.prompt
    import ai.koog.prompt.executor.clients.openai.OpenAILLMClient
    import ai.koog.prompt.executor.clients.openai.OpenAIModels
    import ai.koog.prompt.params.LLMParams
    import kotlinx.coroutines.runBlocking
    -->

    ```kotlin
    fun main() = runBlocking {
        // OpenAI 클라이언트 생성
        val apiKey = System.getenv("OPENAI_API_KEY")
        val client = OpenAILLMClient(apiKey)

        // 프롬프트 생성
        val prompt = prompt("prompt_name", LLMParams()) {
            // 컨텍스트 설정을 위해 시스템 메시지 추가
            system("You are a helpful assistant.")

            // 사용자 메시지 추가
            user("Tell me about Kotlin")

            // 퓨샷(few-shot) 예시를 위해 어시스턴트 메시지를 추가할 수도 있습니다
            assistant("Kotlin is a modern programming language...")

            // 또 다른 사용자 메시지 추가
            user("What are its key features?")
        }

        // 프롬프트 실행
        val response = client.execute(prompt, OpenAIModels.Chat.GPT4o)
        // 응답 출력
        println(response)
    }
    ```
    <!--- KNIT example-llm-clients-01.kt -->

=== "Java"

    <!--- INCLUDE
    /**
    -->
    <!--- SUFFIX
    **/
    -->
    ```java
    // OpenAI 클라이언트 생성
    String apiKey = System.getenv("OPENAI_API_KEY");
    OpenAILLMClient client = new OpenAILLMClient(apiKey);

    // 프롬프트 생성
    Prompt prompt = Prompt.builder("prompt_name")
        // 컨텍스트 설정을 위해 시스템 메시지 추가
        .system("You are a helpful assistant.")
        
        // 사용자 메시지 추가
        .user("Tell me about Kotlin")

        // 퓨샷(few-shot) 예시를 위해 어시스턴트 메시지를 추가할 수도 있습니다
        .assistant("Kotlin is a modern programming language...")

        // 또 다른 사용자 메시지 추가
        .user("What are its key features?")
        .build();

    // 프롬프트 실행
    `List<Message.Response>` response = client.execute(prompt, OpenAIModels.Chat.GPT4o, Collections.emptyList());
    // 응답 출력
    System.out.println(response);

    client.close();
    ```
    <!--- KNIT example-llm-clients-java-01.java -->

## 응답 스트리밍

!!! note
    모든 LLM 클라이언트에서 사용 가능합니다.

응답이 생성되는 대로 처리해야 하는 경우, Kotlin에서는 `executeStreaming()` 메서드를, Java에서는 `executeStreamingWithPublisher()`를 사용하여 모델 출력을 스트리밍할 수 있습니다.

스트리밍 API는 다양한 프레임 타입을 제공합니다.

- **델타 프레임 (Delta frames)** (`TextDelta`, `ReasoningDelta`, `ToolCallDelta`) — 청크 단위로 도착하는 증분 콘텐츠
- **완료 프레임 (Complete frames)** (`TextComplete`, `ReasoningComplete`, `ToolCallComplete`) — 모든 델타를 수신한 후의 전체 콘텐츠
- **종료 프레임 (End frame)** (`End`) — 종료 사유와 함께 스트림 완료를 알림

추론(reasoning)을 지원하는 모델(예: Claude Sonnet 4.5 또는 GPT-o1)의 경우, 스트리밍 중에 추론 프레임이 방출됩니다.
프레임 작업에 대한 자세한 내용은 [스트리밍 API 문서](../streaming-api.md)를 참조하세요.

=== "Kotlin"

    <!--- INCLUDE
    import ai.koog.prompt.dsl.prompt
    import ai.koog.prompt.executor.clients.openai.OpenAILLMClient
    import ai.koog.prompt.executor.clients.openai.OpenAIModels
    import ai.koog.prompt.streaming.StreamFrame
    import kotlinx.coroutines.runBlocking
    fun main() = runBlocking {
    -->
    <!--- SUFFIX
    }
    -->
    ```kotlin
    // API 키를 사용하여 OpenAI 클라이언트 설정
    val token = System.getenv("OPENAI_API_KEY")
    val client = OpenAILLMClient(token)

    val response = client.executeStreaming(
        prompt = prompt("stream_demo") { user("Stream this response in short chunks.") },
        model = OpenAIModels.Chat.GPT4_1
    )

    response.collect { frame ->
        when (frame) {
            is StreamFrame.TextDelta -> print(frame.text)
            is StreamFrame.ReasoningDelta -> print("[Reasoning] ${frame.text}")
            is StreamFrame.ToolCallComplete -> println("
Tool call: ${frame.name}")
            is StreamFrame.End -> println("
[done] Reason: ${frame.finishReason}")
            else -> {} // 필요한 경우 다른 프레임 타입 처리
        }
    }
    ```
    <!--- KNIT example-llm-clients-02.kt -->

=== "Java"

    <!--- INCLUDE
    /**
    -->
    <!--- SUFFIX
    **/
    -->
    ```java
    // API 키를 사용하여 OpenAI 클라이언트 설정
    String token = System.getenv("OPENAI_API_KEY");
    OpenAILLMClient client = new OpenAILLMClient(token);

    Prompt prompt = Prompt.builder("stream_demo")
                .user("Stream this response in short chunks.")
                .build();
    
    Publisher<StreamFrame> response = client.executeStreamingWithPublisher(prompt, OpenAIModels.Chat.GPT4_1);

    // 프레임을 소비하기 위해 Publisher 구독
    response.subscribe(new Subscriber<StreamFrame>() {
        private Subscription subscription;

        @Override
        public void onSubscribe(Subscription s) {
            this.subscription = s;
            s.request(Long.MAX_VALUE);
        }

        @Override
        public void onNext(StreamFrame frame) {
            switch (frame) {
                case StreamFrame.TextDelta delta ->
                        System.out.print(delta.getText());
                case StreamFrame.ReasoningDelta reasoning ->
                        System.out.print("[Reasoning] " + reasoning.getText());
                case StreamFrame.ToolCallComplete toolCall ->
                        System.out.println("
Tool call: " + toolCall.getName());
                case StreamFrame.End end ->
                        System.out.println("
[done] Reason: " + end.getFinishReason());
                default -> {} // 다른 프레임 타입 처리
            }
        }

        @Override
        public void onError(Throwable t) {
            t.printStackTrace();
        }

        @Override
        public void onComplete() { }
    });
    ```
    <!--- KNIT example-llm-clients-java-02.java -->

## 다중 선택

!!! note
    `GoogleLLMClient`, `BedrockLLMClient`, `OllamaClient`를 제외한 모든 LLM 클라이언트에서 사용 가능합니다.

`executeMultipleChoices()` 메서드를 사용하면 단일 호출로 모델로부터 여러 개의 대체 응답을 요청할 수 있습니다.
이 기능을 사용하려면 실행할 프롬프트에 [`numberOfChoices`](prompt-creation/index.md#prompt-parameters) LLM 파라미터를 추가로 지정해야 합니다.

=== "Kotlin"

    <!--- INCLUDE
    import ai.koog.prompt.dsl.prompt
    import ai.koog.prompt.executor.clients.openai.OpenAILLMClient
    import ai.koog.prompt.executor.clients.openai.OpenAIModels
    import ai.koog.prompt.params.LLMParams
    import kotlinx.coroutines.runBlocking
    -->
    ```kotlin
    fun main() = runBlocking {
        val apiKey = System.getenv("OPENAI_API_KEY")
        val client = OpenAILLMClient(apiKey)

        val choices = client.executeMultipleChoices(
            prompt = prompt("n_best", params = LLMParams(numberOfChoices = 3)) {
                system("You are a creative assistant.")
                user("Give me three different opening lines for a story.")
            },
            model = OpenAIModels.Chat.GPT4o
        )

        choices.forEachIndexed { i, choice ->
            val text = choice.joinToString(" ") { it.content }
            println("Line #${i + 1}: $text")
        }
    }
    ```
    <!--- KNIT example-llm-clients-03.kt -->

=== "Java"

    <!--- INCLUDE
    /**
    -->
    <!--- SUFFIX
    **/
    -->
    ```java
    String apiKey = System.getenv("OPENAI_API_KEY");
    OpenAILLMClient client = new OpenAILLMClient(apiKey);

    // 파라미터 구성 (Java에서 LLMParams 생성자는 8개의 인자를 모두 필요로 합니다)
    LLMParams params = new LLMParams(
        null, // temperature
        null, // maxTokens
        3,    // numberOfChoices
        null, // speculation
        null, // schema
        null, // toolChoice
        null, // user
        null  // additionalProperties
    );

    Prompt prompt = Prompt.builder("n_best")
        .system("You are a creative assistant.")
        .user("Give me three different opening lines for a story.")
        .build()
        .withParams(params);

    // LLMChoice는 List<Message.Response>의 타입 별칭입니다
    List<List<Message.Response>> choices = client.executeMultipleChoices(
        prompt, 
        OpenAIModels.Chat.GPT4o
    );

    for (int i = 0; i < choices.size(); i++) {
        `List<Message.Response>` choice = choices.get(i);
        StringBuilder text = new StringBuilder();
        for (Message.Response msg : choice) {
            text.append(msg.getContent()).append(" ");
        }
        System.out.println("Line #" + (i + 1) + ": " + text.toString().trim());
    }
    ```
    <!--- KNIT example-llm-clients-java-03.java -->

## 사용 가능한 모델 목록 조회

!!! note
    `AnthropicLLMClient`, `BedrockLLMClient`, `OllamaClient`를 제외한 모든 LLM 클라이언트에서 사용 가능합니다.

LLM 클라이언트가 지원하는 사용 가능한 모델 ID 목록을 가져오려면 `models()` 메서드를 사용하세요.

=== "Kotlin"

    <!--- INCLUDE
    import ai.koog.prompt.dsl.prompt
    import ai.koog.prompt.executor.clients.openai.OpenAILLMClient
    import ai.koog.prompt.executor.clients.openai.OpenAIModels
    import ai.koog.prompt.llm.LLModel
    import kotlinx.coroutines.runBlocking
    -->
    ```kotlin
    fun main() = runBlocking {
        val apiKey = System.getenv("OPENAI_API_KEY")
        val client = OpenAILLMClient(apiKey)

        val models: `List<LLModel>` = client.models()
        models.forEach { println(it.id) }
    }
    ```
    <!--- KNIT example-llm-clients-04.kt -->

=== "Java"

    <!--- INCLUDE
    /**
    -->
    <!--- SUFFIX
    **/
    -->
    ```java
    String apiKey = System.getenv("OPENAI_API_KEY");
    OpenAILLMClient client = new OpenAILLMClient(apiKey);

    `List<LLModel>` models = client.models();
    for (LLModel model : models) {
        System.out.println(model.getId());
    }
    ```
    <!--- KNIT example-llm-clients-java-04.java -->

## 임베딩

!!! note
    `OpenAILLMClient`, `GoogleLLMClient`, `BedrockLLMClient`, `MistralAILLMClient`, `OllamaClient`에서 사용 가능합니다.

`embed()` 메서드를 사용하여 텍스트를 임베딩 벡터로 변환할 수 있습니다.
임베딩 모델을 선택하고 텍스트를 이 메서드에 전달하세요.

<!--- INCLUDE
import ai.koog.prompt.dsl.prompt
import ai.koog.prompt.executor.clients.openai.OpenAILLMClient
import ai.koog.prompt.executor.clients.openai.OpenAIModels
import kotlinx.coroutines.runBlocking
-->
```kotlin
fun main() = runBlocking {
    val apiKey = System.getenv("OPENAI_API_KEY")
    val client = OpenAILLMClient(apiKey)

    val embedding = client.embed(
        text = "This is a sample text for embedding",
        model = OpenAIModels.Embeddings.TextEmbedding3Large
    )

    println("Embedding size: ${embedding.size}")
}
```
<!--- KNIT example-llm-clients-05.kt -->

## 모더레이션

!!! note
    다음 LLM 클라이언트에서 사용 가능합니다: `OpenAILLMClient`, `BedrockLLMClient`, `MistralAILLMClient`, `OllamaClient`.

모더레이션(moderation) 모델과 함께 `moderate()` 메서드를 사용하여 프롬프트에 부적절한 콘텐츠가 포함되어 있는지 확인할 수 있습니다.

=== "Kotlin"

    <!--- INCLUDE
    import ai.koog.prompt.dsl.prompt
    import ai.koog.prompt.executor.clients.openai.OpenAILLMClient
    import ai.koog.prompt.executor.clients.openai.OpenAIModels
    import kotlinx.coroutines.runBlocking
    -->
    ```kotlin
    fun main() = runBlocking {
        val apiKey = System.getenv("OPENAI_API_KEY")
        val client = OpenAILLMClient(apiKey)

        val result = client.moderate(
            prompt = prompt("moderation") {
                user("This is a test message that may contain offensive content.")
            },
            model = OpenAIModels.Moderation.Omni
        )

        println(result)
    }
    ```
    <!--- KNIT example-llm-clients-06.kt -->

=== "Java"

    <!--- INCLUDE
    /**
    -->
    <!--- SUFFIX
    **/
    -->
    ```java
    String apiKey = System.getenv("OPENAI_API_KEY");
    OpenAILLMClient client = new OpenAILLMClient(apiKey);

    Prompt prompt = Prompt.builder("moderation")
        .user("This is a test message that may contain offensive content.")
        .build();

    ModerationResult result = client.moderate(prompt, OpenAIModels.Moderation.Omni);
    System.out.println(result);
    ```
    <!--- KNIT example-llm-clients-java-05.java -->

## 프롬프트 실행기와의 통합

[프롬프트 실행기(Prompt executors)](prompt-executors.md)는 LLM 클라이언트를 래핑하여 라우팅, 폴백(fallback), 프로바이더 간 통합 사용과 같은 추가 기능을 제공합니다.
여러 프로바이더를 사용할 때 유연성을 제공하므로 프로덕션 환경에서는 프롬프트 실행기를 사용하는 것이 권장됩니다.

[^1]: OpenAI Moderation API를 통한 모더레이션을 지원합니다.
[^2]: 모더레이션을 위해서는 Guardrails 설정이 필요합니다.
[^3]: Mistral `v1/moderations` 엔드포인트를 통한 모더레이션을 지원합니다.