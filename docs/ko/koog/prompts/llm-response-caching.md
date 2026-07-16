# LLM 응답 캐싱

프롬프트 실행기(prompt executor)를 통해 실행하는 반복적인 요청의 경우, Kotlin과 Java 모두에서 성능을 최적화하고 비용을 절감하기 위해 LLM 응답을 캐싱할 수 있습니다.
Koog에서는 `PromptExecutor`를 감싸 캐싱 기능을 추가하는 래퍼(wrapper)인 `CachedPromptExecutor`를 통해 모든 프롬프트 실행기에서 캐싱을 사용할 수 있습니다.
이를 통해 이전에 실행된 프롬프트의 응답을 저장하고, 동일한 프롬프트가 다시 실행될 때 이를 가져올 수 있습니다.

Kotlin 또는 Java에서 캐싱된 프롬프트 실행기를 생성하려면 다음 단계를 수행하세요:

1. 응답을 캐싱하려는 프롬프트 실행기를 생성합니다.
2. 원하는 캐시와 생성한 프롬프트 실행기를 전달하여 `CachedPromptExecutor` 인스턴스를 생성합니다.
3. 생성된 `CachedPromptExecutor`를 원하는 프롬프트 및 모델과 함께 실행합니다.

다음은 예제입니다:

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
    // 프롬프트 실행기 생성
    val client = OpenAILLMClient(System.getenv("OPENAI_API_KEY"))
    val promptExecutor = MultiLLMPromptExecutor(client)

    // 캐싱된 프롬프트 실행기 생성
    val cachedExecutor = CachedPromptExecutor(
        cache = FilePromptCache(Path("path/to/your/cache/directory")),
        nested = promptExecutor
    )

    // 캐싱된 프롬프트 실행기를 처음으로 실행
    // 이 과정에서 실제 LLM 요청이 수행됩니다.
    val firstTime = measureTimeMillis {
        val firstResponse = cachedExecutor.execute(prompt, OpenAIModels.Chat.GPT4o)
        println("First response: ${firstResponse.first().content}")
    }
    println("First execution took: ${firstTime}ms")

    // 캐싱된 프롬프트 실행기를 두 번째로 실행
    // 캐시에서 즉시 결과를 반환합니다.
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
    // 프롬프트 생성
    Prompt prompt = Prompt.builder("test")
            .user("Hello")
            .build();

    // 프롬프트 실행기 생성
    OpenAILLMClient client = new OpenAILLMClient(System.getenv("OPENAI_API_KEY"));
    MultiLLMPromptExecutor promptExecutor = new MultiLLMPromptExecutor(client);

    // 캐싱된 프롬프트 실행기 생성
    FilePromptCache cache = new FilePromptCache(Path.of("path/to/your/cache/directory"), null);
    CachedPromptExecutor cachedExecutor = new CachedPromptExecutor(cache, promptExecutor, Clock.System.INSTANCE);

    // 캐싱된 프롬프트 실행기를 처음으로 실행
    // 이 과정에서 실제 LLM 요청이 수행됩니다.
    long start1 = System.nanoTime();
    `List<Message.Response>` firstResponse = cachedExecutor.execute(prompt, OllamaModels.Meta.LLAMA_3_2);
    long firstTimeMs = (System.nanoTime() - start1) / 1_000_000L;
    System.out.println("First response: " + firstResponse.getFirst().getContent());
    System.out.println("First execution took: " + firstTimeMs + "ms");

    // 캐싱된 프롬프트 실행기를 두 번째로 실행
    // 캐시에서 즉시 결과를 반환합니다.
    long start2 = System.nanoTime();
    `List<Message.Response>` secondResponse = cachedExecutor.execute(prompt, OllamaModels.Meta.LLAMA_3_2);
    long secondTimeMs = (System.nanoTime() - start2) / 1_000_000L;
    System.out.println("Second response: " + secondResponse.getFirst().getContent());
    System.out.println("Second execution took: " + secondTimeMs + "ms");
    ```
    <!--- KNIT example-llm-response-caching-java-01.java -->

이 예제는 다음과 같은 출력을 생성합니다:

```
First response: Hello! It seems like we're starting a new conversation. What can I help you with today?
First execution took: 48ms
Second response: Hello! It seems like we're starting a new conversation. What can I help you with today?
Second execution took: 1ms
```
두 번째 응답은 캐시에서 가져왔으며, 단 1ms밖에 걸리지 않았습니다.

!!!note
    * 캐싱된 프롬프트 실행기에서 Kotlin의 `executeStreaming()` 또는 Java의 `executeStreamingWithPublisher()`를 호출하면 응답이 단일 청크(single chunk)로 생성됩니다.
    * Kotlin 또는 Java에서 캐싱된 프롬프트 실행기로 `moderate()`를 호출하면 요청을 내포된(nested) 프롬프트 실행기로 전달하며 캐시를 사용하지 않습니다.
    * Kotlin과 Java 모두에서 객관식 응답(`executeMultipleChoices()`)의 캐싱은 지원되지 않습니다.