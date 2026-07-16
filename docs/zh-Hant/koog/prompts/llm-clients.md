# LLM 用戶端

LLM 用戶端旨在與 LLM 供應商進行直接互動。
每個用戶端都實作了 [`LLMClient`](api:prompt-executor-clients::ai.koog.prompt.executor.clients.LLMClient) 介面，該介面提供執行 prompt 與串流回應的方法。

當您只需與單一 LLM 供應商合作，且不需要進階的生命週期管理時，可以使用 LLM 用戶端。
如果您需要管理多個 LLM 供應商，請使用 [prompt executor](prompt-executors.md)。

下表顯示了可用的 LLM 用戶端及其功能。

| LLM 供應商                                        | LLMClient                                                                                                                                                                                                   | 工具<br/>呼叫 | 串流 | 多個<br/>選項 | 嵌入 (Embeddings) | 審核 (Moderation) | <div style="width:50px">模型<br/>列表</div> | <div style="width:200px">備註</div>                                                                                        |
|-----------------------------------------------------|-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|------------------|-----------|----------------------|------------|------------|-------------------------------------------------|-----------------------------------------------------------------------------------------------------------------------------|
| [OpenAI](https://platform.openai.com/docs/overview) | [OpenAILLMClient](api:prompt-executor-openai-client::ai.koog.prompt.executor.clients.openai.OpenAILLMClient)                | ✓                | ✓         | ✓                    | ✓          | ✓[^1]      | ✓                                               |                                                                                                                             |
| [Anthropic](https://www.anthropic.com/)             | [AnthropicLLMClient](api:prompt-executor-anthropic-client::ai.koog.prompt.executor.clients.anthropic.AnthropicLLMClient)      | ✓                | ✓         | -                    | -          | -          | -                                               | -                                                                                                                           |
| [Google](https://ai.google.dev/)                    | [GoogleLLMClient](api:prompt-executor-google-client::ai.koog.prompt.executor.clients.google.GoogleLLMClient)                  | ✓                | ✓         | ✓                    | ✓          | -          | ✓                                               | -                                                                                                                           |
| [DeepSeek](https://www.deepseek.com/)               | [DeepSeekLLMClient](api:prompt-executor-deepseek-client::ai.koog.prompt.executor.clients.deepseek.DeepSeekLLMClient)         | ✓                | ✓         | ✓                    | -          | -          | ✓                                               | 相容於 OpenAI 的聊天用戶端。                                                                                              |
| [OpenRouter](https://openrouter.ai/)                | [OpenRouterLLMClient](api:prompt-executor-openrouter-client::ai.koog.prompt.executor.clients.openrouter.OpenRouterLLMClient) | ✓                | ✓         | ✓                    | -          | -          | ✓                                               | 相容於 OpenAI 的路由用戶端。                                                                                            |
| [Amazon Bedrock](https://aws.amazon.com/bedrock/)   | [BedrockLLMClient](api:prompt-executor-bedrock-client::ai.koog.prompt.executor.clients.bedrock.BedrockLLMClient)              | ✓                | ✓         | -                    | ✓          | ✓[^2]      | -                                               | 僅限 JVM 的 AWS SDK 用戶端，支援多個模型系列。                                                              |
| [Mistral](https://mistral.ai/)                      | [MistralAILLMClient](api:prompt-executor-mistralai-client::ai.koog.prompt.executor.clients.mistralai.MistralAILLMClient)    | ✓                | ✓         | ✓                    | ✓          | ✓[^3]      | ✓                                               | 相容於 OpenAI 的用戶端。                                                                                                   |
| [Alibaba](https://www.alibabacloud.com/en?_p_lc=1)  | [DashScopeLLMClient](api:prompt-executor-dashscope-client::ai.koog.prompt.executor.clients.dashscope.DashscopeLLMClient)      | ✓                | ✓         | ✓                    | -          | -          | ✓                                               | 相容於 OpenAI 的用戶端，並公開供應商專屬參數 (`enableSearch`、`parallelToolCalls`、`enableThinking`)。 |
| [Ollama](https://ollama.com/)                       | [OllamaClient](api:prompt-executor-ollama-client::ai.koog.prompt.executor.ollama.client.OllamaClient)                            | ✓                | ✓         | -                    | ✓          | ✓          | -                                               | 具備模型管理 API 的本機伺服器用戶端。                                                                             |

## 執行 prompt

若要使用 LLM 用戶端執行 prompt，請執行以下操作：

1. 建立一個 LLM 用戶端，負責處理應用程式與 LLM 供應商之間的連線。
2. 呼叫 `execute()` 方法，並將 prompt 與 LLM 作為引數傳入。

以下是使用 `OpenAILLMClient` 執行 prompt 的範例：

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
        // 建立 OpenAI 用戶端
        val apiKey = System.getenv("OPENAI_API_KEY")
        val client = OpenAILLMClient(apiKey)

        // 建立 prompt
        val prompt = prompt("prompt_name", LLMParams()) {
            // 新增系統訊息以設定上下文
            system("You are a helpful assistant.")

            // 新增使用者訊息
            user("Tell me about Kotlin")

            // 也可以新增 assistant 訊息作為 few-shot 範例
            assistant("Kotlin is a modern programming language...")

            // 新增另一個使用者訊息
            user("What are its key features?")
        }

        // 執行 prompt
        val response = client.execute(prompt, OpenAIModels.Chat.GPT4o)
        // 印出回應
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
    // 建立 OpenAI 用戶端
    String apiKey = System.getenv("OPENAI_API_KEY");
    OpenAILLMClient client = new OpenAILLMClient(apiKey);

    // 建立 prompt
    Prompt prompt = Prompt.builder("prompt_name")
        // 新增系統訊息以設定上下文
        .system("You are a helpful assistant.")
        
        // 新增使用者訊息
        .user("Tell me about Kotlin")

        // 也可以新增 assistant 訊息作為 few-shot 範例
        .assistant("Kotlin is a modern programming language...")

        // 新增另一個使用者訊息
        .user("What are its key features?")
        .build();

    // 執行 prompt
    `List<Message.Response>` response = client.execute(prompt, OpenAIModels.Chat.GPT4o, Collections.emptyList());
    // 印出回應
    System.out.println(response);

    client.close();
    ```
    <!--- KNIT example-llm-clients-java-01.java -->

## 串流回應

!!! note
    適用於所有 LLM 用戶端。

當您需要在回應生成時即時處理它們，可以使用 Kotlin 中的 `executeStreaming()` 方法或 Java 中的 `executeStreamingWithPublisher()` 來串流模型輸出。

串流 API 提供不同的框架（frame）型別：

- **Delta 框架** (`TextDelta`、`ReasoningDelta`、`ToolCallDelta`) — 以區塊形式到達的增量內容
- **完整框架** (`TextComplete`、`ReasoningComplete`、`ToolCallComplete`) — 接收完所有 delta 後的完整內容
- **結束框架** (`End`) — 發出串流完成訊號並包含結束原因

對於支援推理（reasoning）的模型（例如 Claude Sonnet 4.5 或 GPT-o1），串流期間將發出推理框架。
關於使用框架的更多詳細資訊，請參閱 [串流 API 文件](../streaming-api.md)。

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
    // 使用您的 API 金鑰設定 OpenAI 用戶端
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
            else -> {} // 視需要處理其他框架型別
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
    // 使用您的 API 金鑰設定 OpenAI 用戶端
    String token = System.getenv("OPENAI_API_KEY");
    OpenAILLMClient client = new OpenAILLMClient(token);

    Prompt prompt = Prompt.builder("stream_demo")
                .user("Stream this response in short chunks.")
                .build();
    
    Publisher<StreamFrame> response = client.executeStreamingWithPublisher(prompt, OpenAIModels.Chat.GPT4_1);

    // 訂閱 Publisher 以取用框架
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
                default -> {} // 處理其他框架型別
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

## 多個選項

!!! note
    適用於除 `GoogleLLMClient`、`BedrockLLMClient` 和 `OllamaClient` 之外的所有 LLM 用戶端

您可以透過使用 `executeMultipleChoices()` 方法，在單次呼叫中向模型請求多個替代回應。
這需要在正在執行的 prompt 中額外指定 [`numberOfChoices`](prompt-creation/index.md#prompt-parameters) LLM 參數。

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

    // 配置參數（LLMParams 建構函式在 Java 中需要全部 8 個引數）
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

    // LLMChoice 是 `List<Message.Response>` 的型別別名
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

## 列出可用模型

!!! note
    適用於除 `AnthropicLLMClient`、`BedrockLLMClient` 和 `OllamaClient` 之外的所有 LLM 用戶端。

要獲取 LLM 用戶端支援的可用模型 ID 列表，請使用 `models()` 方法：    

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

## 嵌入 (Embeddings)

!!! note
    適用於 `OpenAILLMClient`、`GoogleLLMClient`、`BedrockLLMClient`、`MistralAILLMClient` 和 `OllamaClient`。

您可以使用 `embed()` 方法將文字轉換為嵌入向量。
選擇一個嵌入模型並將您的文字傳遞給此方法：

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

## 審核 (Moderation)

!!! note
    適用於以下 LLM 用戶端：`OpenAILLMClient`、`BedrockLLMClient`、`MistralAILLMClient`、`OllamaClient`。

您可以使用 `moderate()` 方法配合審核模型，來檢查 prompt 是否包含不當內容：

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

## 與 prompt executor 整合

[Prompt executors](prompt-executors.md) 封裝了 LLM 用戶端並提供額外的功能，例如路由、備援以及跨供應商的統一用法。
建議在生產環境中使用它們，因為它們在處理多個供應商時提供了靈活性。

[^1]: 支援透過 OpenAI Moderation API 進行審核。
[^2]: 審核需要 Guardrails 配置。
[^3]: 支援透過 Mistral `v1/moderations` 端點進行審核。