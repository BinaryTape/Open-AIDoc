# LLMレスポンスのキャッシュ

プロンプトエグゼキューター（prompt executor）で実行される繰り返しのリクエストに対して、KotlinとJavaの両方で、LLMレスポンスをキャッシュすることでパフォーマンスを最適化し、コストを削減できます。
Koogでは、すべてのプロンプトエグゼキューターで `CachedPromptExecutor` を介してキャッシュを利用できます。これは `PromptExecutor` のラッパーであり、キャッシュ機能を追加します。
これにより、以前に実行されたプロンプトからのレスポンスを保存し、同じプロンプトが再度実行されたときにそれらを取得できるようになります。

KotlinまたはJavaでキャッシュされたプロンプトエグゼキューターを作成するには、以下の手順を実行します：

1. レスポンスをキャッシュしたいプロンプトエグゼキューターを作成します。
2. 目的のキャッシュと、作成したプロンプトエグゼキューターを指定して `CachedPromptExecutor` インスタンスを作成します。
3. 作成した `CachedPromptExecutor` を目的のプロンプトとモデルで実行します。

以下に例を示します：

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
    // プロンプトエグゼキューターを作成する
    val client = OpenAILLMClient(System.getenv("OPENAI_API_KEY"))
    val promptExecutor = MultiLLMPromptExecutor(client)

    // キャッシュされたプロンプトエグゼキューターを作成する
    val cachedExecutor = CachedPromptExecutor(
        cache = FilePromptCache(Path("path/to/your/cache/directory")),
        nested = promptExecutor
    )

    // キャッシュされたプロンプトエグゼキューターを初めて実行する
    // これは実際のLLMリクエストを実行します
    val firstTime = measureTimeMillis {
        val firstResponse = cachedExecutor.execute(prompt, OpenAIModels.Chat.GPT4o)
        println("First response: ${firstResponse.first().content}")
    }
    println("First execution took: ${firstTime}ms")

    // キャッシュされたプロンプトエグゼキューターを2回目に実行する
    // これはキャッシュから即座に結果を返します
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
    // プロンプトを作成する
    Prompt prompt = Prompt.builder("test")
            .user("Hello")
            .build();

    // プロンプトエグゼキューターを作成する
    OpenAILLMClient client = new OpenAILLMClient(System.getenv("OPENAI_API_KEY"));
    MultiLLMPromptExecutor promptExecutor = new MultiLLMPromptExecutor(client);

    // キャッシュされたプロンプトエグゼキューターを作成する
    FilePromptCache cache = new FilePromptCache(Path.of("path/to/your/cache/directory"), null);
    CachedPromptExecutor cachedExecutor = new CachedPromptExecutor(cache, promptExecutor, Clock.System.INSTANCE);

    // キャッシュされたプロンプトエグゼキューターを初めて実行する
    // これは実際のLLMリクエストを実行します
    long start1 = System.nanoTime();
    `List<Message.Response>` firstResponse = cachedExecutor.execute(prompt, OllamaModels.Meta.LLAMA_3_2);
    long firstTimeMs = (System.nanoTime() - start1) / 1_000_000L;
    System.out.println("First response: " + firstResponse.getFirst().getContent());
    System.out.println("First execution took: " + firstTimeMs + "ms");

    // キャッシュされたプロンプトエグゼキューターを2回目に実行する
    // これはキャッシュから即座に結果を返します
    long start2 = System.nanoTime();
    `List<Message.Response>` secondResponse = cachedExecutor.execute(prompt, OllamaModels.Meta.LLAMA_3_2);
    long secondTimeMs = (System.nanoTime() - start2) / 1_000_000L;
    System.out.println("Second response: " + secondResponse.getFirst().getContent());
    System.out.println("Second execution took: " + secondTimeMs + "ms");
    ```
    <!--- KNIT example-llm-response-caching-java-01.java -->

この例では、以下の出力が生成されます：

```
First response: Hello! It seems like we're starting a new conversation. What can I help you with today?
First execution took: 48ms
Second response: Hello! It seems like we're starting a new conversation. What can I help you with today?
Second execution took: 1ms
```
2回目のレスポンスはキャッシュから取得されたため、わずか1msしかかかりませんでした。

!!!note
    * Kotlinで `executeStreaming()`、またはJavaで `executeStreamingWithPublisher()` をキャッシュされたプロンプトエグゼキューターで呼び出すと、レスポンスは単一のチャンク（chunk）として生成されます。
    * KotlinまたはJavaのいずれかで、キャッシュされたプロンプトエグゼキューターで `moderate()` を呼び出すと、リクエストはネストされたプロンプトエグゼキューターに転送され、キャッシュは使用されません。
    * KotlinまたはJavaのいずれにおいても、選択肢形式のレスポンス（`executeMultipleChoices()`）のキャッシュはサポートされていません。