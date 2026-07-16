# LLM 客户端

LLM 客户端旨在直接与 LLM 提供者交互。
每个客户端都实现了 [`LLMClient`](api:prompt-executor-clients::ai.koog.prompt.executor.clients.LLMClient) 接口，该接口提供了执行 prompt 和流式传输响应的方法。

当你使用单个 LLM 提供者且不需要高级生命周期管理时，可以使用 LLM 客户端。
如果你需要管理多个 LLM 提供者，请使用 [prompt 执行器](prompt-executors.md)。

下表显示了可用的 LLM 客户端及其功能。

| LLM 提供者 | LLMClient | 工具调用 | 流式传输 | 多个选项 | 嵌入 | 审核 | <div style="width:50px">模型列表</div> | <div style="width:200px">备注</div> |
|-----------------------------------------------------|-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|------------------|-----------|----------------------|------------|------------|-------------------------------------------------|-----------------------------------------------------------------------------------------------------------------------------|
| [OpenAI](https://platform.openai.com/docs/overview) | [OpenAILLMClient](api:prompt-executor-openai-client::ai.koog.prompt.executor.clients.openai.OpenAILLMClient)                | ✓                | ✓         | ✓                    | ✓          | ✓[^1]      | ✓                                               |                                                                                                                             |
| [Anthropic](https://www.anthropic.com/)             | [AnthropicLLMClient](api:prompt-executor-anthropic-client::ai.koog.prompt.executor.clients.anthropic.AnthropicLLMClient)      | ✓                | ✓         | -                    | -          | -          | -                                               | -                                                                                                                           |
| [Google](https://ai.google.dev/)                    | [GoogleLLMClient](api:prompt-executor-google-client::ai.koog.prompt.executor.clients.google.GoogleLLMClient)                  | ✓                | ✓         | ✓                    | ✓          | -          | ✓                                               | -                                                                                                                           |
| [DeepSeek](https://www.deepseek.com/)               | [DeepSeekLLMClient](api:prompt-executor-deepseek-client::ai.koog.prompt.executor.clients.deepseek.DeepSeekLLMClient)         | ✓                | ✓         | ✓                    | -          | -          | ✓                                               | OpenAI 兼容的聊天客户端。 |
| [OpenRouter](https://openrouter.ai/)                | [OpenRouterLLMClient](api:prompt-executor-openrouter-client::ai.koog.prompt.executor.clients.openrouter.OpenRouterLLMClient) | ✓                | ✓         | ✓                    | -          | -          | ✓                                               | OpenAI 兼容的路由客户端。 |
| [Amazon Bedrock](https://aws.amazon.com/bedrock/)   | [BedrockLLMClient](api:prompt-executor-bedrock-client::ai.koog.prompt.executor.clients.bedrock.BedrockLLMClient)              | ✓                | ✓         | -                    | ✓          | ✓[^2]      | -                                               | 仅限 JVM 的 AWS SDK 客户端，支持多个模型系列。 |
| [Mistral](https://mistral.ai/)                      | [MistralAILLMClient](api:prompt-executor-mistralai-client::ai.koog.prompt.executor.clients.mistralai.MistralAILLMClient)    | ✓                | ✓         | ✓                    | ✓          | ✓[^3]      | ✓                                               | OpenAI 兼容的客户端。 |
| [Alibaba](https://www.alibabacloud.com/en?_p_lc=1)  | [DashScopeLLMClient](api:prompt-executor-dashscope-client::ai.koog.prompt.executor.clients.dashscope.DashscopeLLMClient)      | ✓                | ✓         | ✓                    | -          | -          | ✓                                               | OpenAI 兼容的客户端，公开了特定于提供者的参数（`enableSearch`、`parallelToolCalls`、`enableThinking`）。 |
| [Ollama](https://ollama.com/)                       | [OllamaClient](api:prompt-executor-ollama-client::ai.koog.prompt.executor.ollama.client.OllamaClient)                            | ✓                | ✓         | -                    | ✓          | ✓          | -                                               | 具有模型管理 API 的本地服务器客户端。 |

## 运行 prompt

要使用 LLM 客户端运行 prompt，请执行以下操作：

1. 创建一个 LLM 客户端，用于处理应用程序与 LLM 提供者之间的连接。
2. 调用 `execute()` 方法，并将 prompt 和 LLM 作为实参。

以下是使用 `OpenAILLMClient` 运行 prompt 的示例：

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
        // 创建 OpenAI 客户端
        val apiKey = System.getenv("OPENAI_API_KEY")
        val client = OpenAILLMClient(apiKey)

        // 创建 prompt
        val prompt = prompt("prompt_name", LLMParams()) {
            // 添加系统消息以设置上下文
            system("你是一个得力的助手。")

            // 添加用户消息
            user("跟我讲讲 Kotlin")

            // 你也可以为少样本示例添加助手消息
            assistant("Kotlin 是一门现代编程语言...")

            // 添加另一条用户消息
            user("它的主要特性是什么？")
        }

        // 运行 prompt
        val response = client.execute(prompt, OpenAIModels.Chat.GPT4o)
        // 打印响应
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
    // 创建 OpenAI 客户端
    String apiKey = System.getenv("OPENAI_API_KEY");
    OpenAILLMClient client = new OpenAILLMClient(apiKey);

    // 创建 prompt
    Prompt prompt = Prompt.builder("prompt_name")
        // 添加系统消息以设置上下文
        .system("你是一个得力的助手。")
        
        // 添加用户消息
        .user("跟我讲讲 Kotlin")

        // 你也可以为少样本示例添加助手消息
        .assistant("Kotlin 是一门现代编程语言...")

        // 添加另一条用户消息
        .user("它的主要特性是什么？")
        .build();

    // 运行 prompt
    `List<Message.Response>` response = client.execute(prompt, OpenAIModels.Chat.GPT4o, Collections.emptyList());
    // 打印响应
    System.out.println(response);

    client.close();
    ```
    <!--- KNIT example-llm-clients-java-01.java -->

## 流式传输响应

!!! note
    适用于所有 LLM 客户端。

当你需要处理实时生成的响应时，可以使用 Kotlin 中的 `executeStreaming()` 方法或 Java 中的 `executeStreamingWithPublisher()` 方法来流式传输模型输出。

流式传输 API 提供了不同的帧类型：

- **增量帧 (Delta frames)** (`TextDelta`、`ReasoningDelta`、`ToolCallDelta`) —— 以分块形式到达的增量内容
- **完成帧 (Complete frames)** (`TextComplete`、`ReasoningComplete`、`ToolCallComplete`) —— 接收到所有增量后的完整内容
- **结束帧 (End frame)** (`End`) —— 带有结束原因的流完成信号

对于支持推理的模型（如 Claude Sonnet 4.5 或 GPT-o1），在流式传输期间会发出推理帧。
有关使用帧的更多详细信息，请参阅 [流式传输 API 文档](../streaming-api.md)。

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
    // 使用你的 API 密钥设置 OpenAI 客户端
    val token = System.getenv("OPENAI_API_KEY")
    val client = OpenAILLMClient(token)

    val response = client.executeStreaming(
        prompt = prompt("stream_demo") { user("以短块形式流式传输此响应。") },
        model = OpenAIModels.Chat.GPT4_1
    )

    response.collect { frame ->
        when (frame) {
            is StreamFrame.TextDelta -> print(frame.text)
            is StreamFrame.ReasoningDelta -> print("[推理] ${frame.text}")
            is StreamFrame.ToolCallComplete -> println("
工具调用：${frame.name}")
            is StreamFrame.End -> println("
[完成] 原因：${frame.finishReason}")
            else -> {} // 如果需要，处理其他帧类型
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
    // 使用你的 API 密钥设置 OpenAI 客户端
    String token = System.getenv("OPENAI_API_KEY");
    OpenAILLMClient client = new OpenAILLMClient(token);

    Prompt prompt = Prompt.builder("stream_demo")
                .user("以短块形式流式传输此响应。")
                .build();
    
    Publisher<StreamFrame> response = client.executeStreamingWithPublisher(prompt, OpenAIModels.Chat.GPT4_1);

    // 订阅发布者以消费帧
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
                        System.out.print("[推理] " + reasoning.getText());
                case StreamFrame.ToolCallComplete toolCall ->
                        System.out.println("
工具调用：" + toolCall.getName());
                case StreamFrame.End end ->
                        System.out.println("
[完成] 原因：" + end.getFinishReason());
                default -> {} // 处理其他帧类型
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

## 多个选项

!!! note
    适用于除 `GoogleLLMClient`、`BedrockLLMClient` 和 `OllamaClient` 之外的所有 LLM 客户端。

你可以通过使用 `executeMultipleChoices()` 方法，在单次调用中向模型请求多个备选响应。
这需要在执行的 prompt 中额外指定 [`numberOfChoices`](prompt-creation/index.md#prompt-parameters) LLM 参数。

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
                system("你是一个富有创意的助手。")
                user("给我三个不同的故事开场白。")
            },
            model = OpenAIModels.Chat.GPT4o
        )

        choices.forEachIndexed { i, choice ->
            val text = choice.joinToString(" ") { it.content }
            println("第 #${i + 1} 行：$text")
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

    // 配置参数（LLMParams 构造函数在 Java 中需要全部 8 个参数）
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
        .system("你是一个富有创意的助手。")
        .user("给我三个不同的故事开场白。")
        .build()
        .withParams(params);

    // LLMChoice 是 `List<Message.Response>` 的类型别名
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
        System.out.println("第 #" + (i + 1) + " 行：" + text.toString().trim());
    }
    ```
    <!--- KNIT example-llm-clients-java-03.java -->

## 列出可用模型

!!! note
    适用于除 `AnthropicLLMClient`、`BedrockLLMClient` 和 `OllamaClient` 之外的所有 LLM 客户端。

要获取 LLM 客户端支持的可用模型 ID 列表，请使用 `models()` 方法：    

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
    适用于 `OpenAILLMClient`、`GoogleLLMClient`、`BedrockLLMClient`、`MistralAILLMClient` 和 `OllamaClient`。

你可以使用 `embed()` 方法将文本转换为嵌入向量。
选择一个嵌入模型并将你的文本传递给此方法：

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
        text = "这是一段用于嵌入的示例文本",
        model = OpenAIModels.Embeddings.TextEmbedding3Large
    )

    println("嵌入大小：${embedding.size}")
}
```
<!--- KNIT example-llm-clients-05.kt -->

## 审核

!!! note
    适用于以下 LLM 客户端：`OpenAILLMClient`、`BedrockLLMClient`、`MistralAILLMClient`、`OllamaClient`。

你可以将 `moderate()` 方法与审核模型结合使用，检查 prompt 是否包含不当内容：

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
                user("这是一条可能包含攻击性内容的测试消息。")
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
        .user("这是一条可能包含攻击性内容的测试消息。")
        .build();

    ModerationResult result = client.moderate(prompt, OpenAIModels.Moderation.Omni);
    System.out.println(result);
    ```
    <!--- KNIT example-llm-clients-java-05.java -->

## 与 prompt 执行器集成

[Prompt 执行器](prompt-executors.md)封装了 LLM 客户端，并提供附加功能，如路由、回退以及跨提供者的统一用法。
推荐在生产环境中使用它们，因为它们在处理多个提供者时提供了灵活性。

[^1]: 支持通过 OpenAI Moderation API 进行审核。
[^2]: 审核需要 Guardrails 配置。
[^3]: 支持通过 Mistral `v1/moderations` 端点进行审核。