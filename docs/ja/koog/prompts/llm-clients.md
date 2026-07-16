# LLMクライアント

LLMクライアントは、LLMプロバイダーと直接やり取りするために設計されています。
各クライアントは、プロンプトの実行とレスポンスのストリーミングを行うメソッドを提供する[`LLMClient`](api:prompt-executor-clients::ai.koog.prompt.executor.clients.LLMClient)インターフェースを実装しています。

単一のLLMプロバイダーを使用し、高度なライフサイクル管理が必要ない場合は、LLMクライアントを使用できます。
複数のLLMプロバイダーを管理する必要がある場合は、[プロンプトエグゼキューター](prompt-executors.md)を使用してください。

下の表は、利用可能なLLMクライアントとその機能を示しています。

| LLMプロバイダー | LLMClient | ツール<br/>呼び出し | ストリーミング | 複数<br/>回答 | エンベディング | モデレーション | <div style="width:50px">モデル<br/>一覧取得</div> | <div style="width:200px">備考</div> |
|-----------------------------------------------------|-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|------------------|-----------|----------------------|------------|------------|-------------------------------------------------|-----------------------------------------------------------------------------------------------------------------------------|
| [OpenAI](https://platform.openai.com/docs/overview) | [OpenAILLMClient](api:prompt-executor-openai-client::ai.koog.prompt.executor.clients.openai.OpenAILLMClient)                | ✓                | ✓         | ✓                    | ✓          | ✓[^1]      | ✓                                               |                                                                                                                             |
| [Anthropic](https://www.anthropic.com/)             | [AnthropicLLMClient](api:prompt-executor-anthropic-client::ai.koog.prompt.executor.clients.anthropic.AnthropicLLMClient)      | ✓                | ✓         | -                    | -          | -          | -                                               | -                                                                                                                           |
| [Google](https://ai.google.dev/)                    | [GoogleLLMClient](api:prompt-executor-google-client::ai.koog.prompt.executor.clients.google.GoogleLLMClient)                  | ✓                | ✓         | ✓                    | ✓          | -          | ✓                                               | -                                                                                                                           |
| [DeepSeek](https://www.deepseek.com/)               | [DeepSeekLLMClient](api:prompt-executor-deepseek-client::ai.koog.prompt.executor.clients.deepseek.DeepSeekLLMClient)         | ✓                | ✓         | ✓                    | -          | -          | ✓                                               | OpenAI互換のチャットクライアント。 |
| [OpenRouter](https://openrouter.ai/)                | [OpenRouterLLMClient](api:prompt-executor-openrouter-client::ai.koog.prompt.executor.clients.openrouter.OpenRouterLLMClient) | ✓                | ✓         | ✓                    | -          | -          | ✓                                               | OpenAI互換のルータークライアント。 |
| [Amazon Bedrock](https://aws.amazon.com/bedrock/)   | [BedrockLLMClient](api:prompt-executor-bedrock-client::ai.koog.prompt.executor.clients.bedrock.BedrockLLMClient)              | ✓                | ✓         | -                    | ✓          | ✓[^2]      | -                                               | 複数のモデルファミリーをサポートするJVM専用のAWS SDKクライアント。 |
| [Mistral](https://mistral.ai/)                      | [MistralAILLMClient](api:prompt-executor-mistralai-client::ai.koog.prompt.executor.clients.mistralai.MistralAILLMClient)    | ✓                | ✓         | ✓                    | ✓          | ✓[^3]      | ✓                                               | OpenAI互換のクライアント。 |
| [Alibaba](https://www.alibabacloud.com/en?_p_lc=1)  | [DashScopeLLMClient](api:prompt-executor-dashscope-client::ai.koog.prompt.executor.clients.dashscope.DashscopeLLMClient)      | ✓                | ✓         | ✓                    | -          | -          | ✓                                               | プロバイダー固有のパラメータ（`enableSearch`、`parallelToolCalls`、`enableThinking`）を公開するOpenAI互換のクライアント。 |
| [Ollama](https://ollama.com/)                       | [OllamaClient](api:prompt-executor-ollama-client::ai.koog.prompt.executor.ollama.client.OllamaClient)                            | ✓                | ✓         | -                    | ✓          | ✓          | -                                               | モデル管理APIを備えたローカルサーバークライアント。 |

## プロンプトの実行

LLMクライアントを使用してプロンプトを実行するには、以下の手順を行います。

1. アプリケーションとLLMプロバイダー間の接続を処理するLLMクライアントを作成します。
2. 引数にプロンプトとLLMを指定して、`execute()`メソッドを呼び出します。

以下は、`OpenAILLMClient`を使用してプロンプトを実行する例です。

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
        // OpenAIクライアントを作成する
        val apiKey = System.getenv("OPENAI_API_KEY")
        val client = OpenAILLMClient(apiKey)

        // プロンプトを作成する
        val prompt = prompt("prompt_name", LLMParams()) {
            // コンテキストを設定するためのシステムメッセージを追加する
            system("You are a helpful assistant.")

            // ユーザーメッセージを追加する
            user("Tell me about Kotlin")

            // フューショット（few-shot）例としてアシスタントメッセージを追加することも可能
            assistant("Kotlin is a modern programming language...")

            // 別のユーザーメッセージを追加する
            user("What are its key features?")
        }

        // プロンプトを実行する
        val response = client.execute(prompt, OpenAIModels.Chat.GPT4o)
        // レスポンスを出力する
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
    // OpenAIクライアントを作成する
    String apiKey = System.getenv("OPENAI_API_KEY");
    OpenAILLMClient client = new OpenAILLMClient(apiKey);

    // プロンプトを作成する
    Prompt prompt = Prompt.builder("prompt_name")
        // コンテキストを設定するためのシステムメッセージを追加する
        .system("You are a helpful assistant.")
        
        // ユーザーメッセージを追加する
        .user("Tell me about Kotlin")

        // フューショット（few-shot）例としてアシスタントメッセージを追加することも可能
        .assistant("Kotlin is a modern programming language...")

        // 別のユーザーメッセージを追加する
        .user("What are its key features?")
        .build();

    // プロンプトを実行する
    `List<Message.Response>` response = client.execute(prompt, OpenAIModels.Chat.GPT4o, Collections.emptyList());
    // レスポンスを出力する
    System.out.println(response);

    client.close();
    ```
    <!--- KNIT example-llm-clients-java-01.java -->

## レスポンスのストリーミング

!!! note
    すべてのLLMクライアントで使用可能です。

生成されるレスポンスを順次処理する必要がある場合は、Kotlinでは`executeStreaming()`メソッド、Javaでは`executeStreamingWithPublisher()`を使用して、モデルの出力をストリーミングできます。

ストリーミングAPIは、以下の異なるフレームタイプを提供します：

- **デルタフレーム** (`TextDelta`, `ReasoningDelta`, `ToolCallDelta`) — チャンクで届く増分コンテンツ
- **コンプリートフレーム** (`TextComplete`, `ReasoningComplete`, `ToolCallComplete`) — すべてのデルタを受信した後の完全なコンテンツ
- **エンドフレーム** (`End`) — 終了理由とともにストリームの完了を通知

推論（reasoning）をサポートするモデル（Claude Sonnet 4.5やGPT-o1など）の場合、ストリーミング中に推論フレーム（reasoning frames）が送出されます。
フレームの扱いに関する詳細は、[ストリーミングAPIドキュメント](../streaming-api.md)を参照してください。

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
    // APIキーを使用してOpenAIクライアントをセットアップする
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
            else -> {} // 必要に応じて他のフレームタイプを処理する
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
    // APIキーを使用してOpenAIクライアントをセットアップする
    String token = System.getenv("OPENAI_API_KEY");
    OpenAILLMClient client = new OpenAILLMClient(token);

    Prompt prompt = Prompt.builder("stream_demo")
                .user("Stream this response in short chunks.")
                .build();
    
    Publisher<StreamFrame> response = client.executeStreamingWithPublisher(prompt, OpenAIModels.Chat.GPT4_1);

    // Publisherをサブスクライブしてフレームを消費する
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
                default -> {} // 他のフレームタイプを処理する
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

## 複数回答

!!! note
    `GoogleLLMClient`、`BedrockLLMClient`、`OllamaClient`を除くすべてのLLMクライアントで使用可能です。

`executeMultipleChoices()`メソッドを使用すると、1回の呼び出しでモデルから複数の代替回答をリクエストできます。
実行するプロンプト内で、[`numberOfChoices`](prompt-creation/index.md#prompt-parameters) LLMパラメータを追加で指定する必要があります。

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

    // パラメータを設定する（JavaではLLMParamsコンストラクタに8つの引数すべてが必要です）
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

    // LLMChoiceは `List<Message.Response>` の型エイリアスです
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

## 利用可能なモデルの一覧取得

!!! note
    `AnthropicLLMClient`、`BedrockLLMClient`、`OllamaClient`を除くすべてのLLMクライアントで使用可能です。

LLMクライアントがサポートする利用可能なモデルIDの一覧を取得するには、`models()`メソッドを使用します。

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

## エンベディング

!!! note
    `OpenAILLMClient`、`GoogleLLMClient`、`BedrockLLMClient`、`MistralAILLMClient`、`OllamaClient`で使用可能です。

`embed()`メソッドを使用して、テキストをエンベディング（埋め込み）ベクトルに変換します。
エンベディングモデルを選択し、このメソッドにテキストを渡します。

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

## モデレーション

!!! note
    以下のLLMクライアントで使用可能です：`OpenAILLMClient`、`BedrockLLMClient`、`MistralAILLMClient`、`OllamaClient`。

`moderate()`メソッドをモデレーションモデルと共に使用して、プロンプトに不適切なコンテンツが含まれていないかを確認できます。

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

## プロンプトエグゼキューターとの統合

[プロンプトエグゼキューター](prompt-executors.md)はLLMクライアントをラップし、ルーティング、フォールバック、プロバイダー間での統一された利用などの追加機能を提供します。
これらは複数のプロバイダーを扱う際に柔軟性を提供するため、本番環境での使用が推奨されます。

[^1]: OpenAI Moderation APIを介したモデレーションをサポートしています。
[^2]: モデレーションにはGuardrailsの設定が必要です。
[^3]: Mistralの`v1/moderations`エンドポイントを介したモデレーションをサポートしています。