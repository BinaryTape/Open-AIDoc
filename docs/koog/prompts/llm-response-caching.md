# LLM 响应缓存

对于使用 prompt executor 运行的重复请求，您可以缓存 LLM 响应，以在 Kotlin 和 Java 中优化性能并降低成本。
在 Koog 中，通过 `CachedPromptExecutor` 为所有 prompt executor 提供了缓存功能，它是 `PromptExecutor` 的包装器，增加了缓存功能。
它允许您存储之前执行过的 prompt 响应，并在再次运行相同的 prompt 时对其进行检索。

要以 Kotlin 或 Java 创建缓存的 prompt executor，请执行以下操作：

1. 为您想要缓存其响应的 prompt executor 创建一个实例。
2. 通过提供所需的缓存和您创建的 prompt executor 来创建一个 `CachedPromptExecutor` 实例。
3. 使用所需的 prompt 和模型运行创建的 `CachedPromptExecutor`。

这是一个示例：

=== "Kotlin"

    <!--- INCLUDE
    import ai.koog.prompt.executor.clients.openai.OpenAILLMClient
    import ai.koog.prompt.executor.clients.openai.OpenAIModels
    import ai.koog.prompt.executor.llms.MultiLLMPromptExecutor
    import ai.koog.prompt.executor.cached.CachedPromptExecutor
    import ai.koog.prompt.cache.files.FilePromptCache
    import kotlin.system.measureTimeMillis
    import ai.koog.prompt.dsl.prompt
    import kotlin.io.path.Path
    import kotlinx.coroutines.runBlocking
    fun main() {
        runBlocking {
            val prompt = prompt("test") {
                user("Hello")
            }
    -->
    <!--- SUFFIX
        }
    }
    -->
    ```kotlin
    // 创建一个 prompt executor
    val client = OpenAILLMClient(System.getenv("OPENAI_API_KEY"))
    val promptExecutor = MultiLLMPromptExecutor(client)

    // 创建一个缓存的 prompt executor
    val cachedExecutor = CachedPromptExecutor(
        cache = FilePromptCache(Path("path/to/your/cache/directory")),
        nested = promptExecutor
    )

    // 第一次运行缓存的 prompt executor
    // 这将执行实际的 LLM 请求
    val firstTime = measureTimeMillis {
        val firstResponse = cachedExecutor.execute(prompt, OpenAIModels.Chat.GPT4o)
        println("First response: ${firstResponse.first().content}")
    }
    println("First execution took: ${firstTime}ms")

    // 第二次运行缓存的 prompt executor
    // 这将立即从缓存中返回结果
    val secondTime = measureTimeMillis {
        val secondResponse = cachedExecutor.execute(prompt, OpenAIModels.Chat.GPT4o)
        println("Second response: ${secondResponse.first().content}")
    }
    println("Second execution took: ${secondTime}ms")
    ```
    <!--- KNIT example-llm-response-caching-01.kt -->

=== "Java"

    <!--- INCLUDE
    /**
    -->
    <!--- SUFFIX
    **/
    -->
    ```java
    // 创建一个 prompt
    Prompt prompt = Prompt.builder("test")
            .user("Hello")
            .build();

    // 创建一个 prompt executor
    OpenAILLMClient client = new OpenAILLMClient(System.getenv("OPENAI_API_KEY"));
    MultiLLMPromptExecutor promptExecutor = new MultiLLMPromptExecutor(client);

    // 创建一个缓存的 prompt executor
    FilePromptCache cache = new FilePromptCache(Path.of("path/to/your/cache/directory"), null);
    CachedPromptExecutor cachedExecutor = new CachedPromptExecutor(cache, promptExecutor, Clock.System.INSTANCE);

    // 第一次运行缓存的 prompt executor
    // 这将执行实际的 LLM 请求
    long start1 = System.nanoTime();
    `List<Message.Response>` firstResponse = cachedExecutor.execute(prompt, OllamaModels.Meta.LLAMA_3_2);
    long firstTimeMs = (System.nanoTime() - start1) / 1_000_000L;
    System.out.println("First response: " + firstResponse.getFirst().getContent());
    System.out.println("First execution took: " + firstTimeMs + "ms");

    // 第二次运行缓存的 prompt executor
    // 这将立即从缓存中返回结果
    long start2 = System.nanoTime();
    `List<Message.Response>` secondResponse = cachedExecutor.execute(prompt, OllamaModels.Meta.LLAMA_3_2);
    long secondTimeMs = (System.nanoTime() - start2) / 1_000_000L;
    System.out.println("Second response: " + secondResponse.getFirst().getContent());
    System.out.println("Second execution took: " + secondTimeMs + "ms");
    ```
    <!--- KNIT example-llm-response-caching-java-01.java -->

该示例产生以下输出：

```
First response: Hello! It seems like we're starting a new conversation. What can I help you with today?
First execution took: 48ms
Second response: Hello! It seems like we're starting a new conversation. What can I help you with today?
Second execution took: 1ms
```
第二个响应是从缓存中检索的，仅耗时 1 ms。

!!!note
    * 如果您对 Kotlin 中的 `executeStreaming()` 或 Java 中的 `executeStreamingWithPublisher()` 调用缓存的 prompt executor，它会以单个块 (chunk) 的形式产生响应。
    * 如果您在 Kotlin 或 Java 中对缓存的 prompt executor 调用 `moderate()`，它会将请求转发到嵌套的 prompt executor，且不使用缓存。
    * Kotlin 和 Java 均不支持多项选择响应 (`executeMultipleChoices()`) 的缓存。