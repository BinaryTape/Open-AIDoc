# Langfuseエクスポーター

Koogは、オブザーバビリティ（可観測性）データのオープン標準である[OpenTelemetry](https://opentelemetry.io/)を使用して、エージェントのトレースを出力します。
これらのトレースを[Langfuse](https://langfuse.com/)に送信するために、Koogには組み込みのOpenTelemetryエクスポーターが含まれています。手動でのインストルメンテーション（instrumentation）は不要です。

接続されると、Langfuseの[OpenTelemetryサポート](https://langfuse.com/integrations/native/opentelemetry)により、エージェントがLLM、ツール、外部APIとどのように相互作用するかを可視化、分析、デバッグできるようになります。

---

## セットアップ手順

1. [セットアップガイド](https://langfuse.com/docs/get-started#create-new-project-in-langfuse)に従って、Langfuseプロジェクトを作成します。
2. [Organization Settings > API Keys](https://langfuse.com/faq/all/where-are-langfuse-api-keys)から、`public key` と `secret key` を取得します。
3. ホスト、パブリックキー、シークレットキーを指定します。これらは、[`addLangfuseExporter()`](api:agents-features-opentelemetry::ai.koog.agents.features.opentelemetry.integration.langfuse.addLangfuseExporter) のパラメータとして渡すか、以下のように環境変数を介して設定できます。

```bash
   export LANGFUSE_HOST="https://cloud.langfuse.com"
   export LANGFUSE_PUBLIC_KEY="<your-public-key>"
   export LANGFUSE_SECRET_KEY="<your-secret-key>"
```
<!--- KNIT example-langfuse-exporter-01.txt -->

## 設定

Langfuseへのエクスポートを有効にするには、**OpenTelemetry機能**をインストールし、[`addLangfuseExporter()`](api:agents-features-opentelemetry::ai.koog.agents.features.opentelemetry.integration.langfuse.addLangfuseExporter) を呼び出します。

### 基本的な例

=== "Kotlin"

    <!--- INCLUDE
    import ai.koog.agents.core.agent.AIAgent
    import ai.koog.agents.features.opentelemetry.feature.OpenTelemetry
    import ai.koog.agents.features.opentelemetry.integration.langfuse.addLangfuseExporter
    import ai.koog.prompt.executor.clients.openai.OpenAIModels
    import ai.koog.prompt.executor.llms.all.simpleOpenAIExecutor
    import kotlinx.coroutines.runBlocking
    val promptExecutor = simpleOpenAIExecutor("openai-api-key")
    -->
    ```kotlin
    fun main() = runBlocking {
        val agent = AIAgent(
            promptExecutor = promptExecutor,
            llmModel = OpenAIModels.Chat.GPT4oMini,
            systemPrompt = "You are a code assistant. Provide concise code examples."
        ) {
            install(OpenTelemetry) {
                addLangfuseExporter()
            }
        }
    
        println("Running agent with Langfuse tracing")
    
        val result = agent.run("Tell me a joke about programming")
        println("Result: $result
See traces on the Langfuse instance")
    }
    ```
    <!--- KNIT example-langfuse-exporter-01.kt -->

=== "Java"

    <!--- INCLUDE
    import ai.koog.agents.core.agent.AIAgent;
    import ai.koog.agents.features.opentelemetry.feature.OpenTelemetry;
    import ai.koog.agents.features.opentelemetry.integration.langfuse.LangfuseKt;
    import ai.koog.prompt.executor.clients.openai.OpenAIModels;
    import ai.koog.prompt.executor.model.PromptExecutor;
    public class exampleLangfuseExporterJava01 {
        static PromptExecutor promptExecutor = PromptExecutor.builder()
            .openAI("openai-api-key")
            .build();
    -->
    <!--- SUFFIX
    }
    -->
    ```java
    public static void main(String[] args) {
        var agent = AIAgent.builder()
            .promptExecutor(promptExecutor)
            .llmModel(OpenAIModels.Chat.GPT4oMini)
            .systemPrompt("You are a code assistant. Provide concise code examples.")
            .install(OpenTelemetry.Feature, config ->
                LangfuseKt.addLangfuseExporter(config)
            )
            .build();

        System.out.println("Running agent with Langfuse tracing");

        var result = agent.run("Tell me a joke about programming");
        System.out.println("Result: " + result + "
See traces on the Langfuse instance");
    }
    ```
    <!--- KNIT exampleLangfuseExporterJava01.java -->

## トレース属性

KoogがエージェントのアクティビティをLangfuseに送信する際、LLMの呼び出しやツールの実行など、個々の作業記録である「スパン（span）」のシリーズとして送信されます。関連するスパンは「トレース（trace）」にグループ化され、開始から終了までのエージェントの完全な実行を表します。

[`addLangfuseExporter()`](api:agents-features-opentelemetry::ai.koog.agents.features.opentelemetry.integration.langfuse.addLangfuseExporter) は、各トレースのルートに付与されるキーと値のペアのリストである `traceAttributes` パラメータを受け取ります。これにより、セッション、環境、タグなどのLangfuse固有の機能が有効になり、LangfuseのUIでトレースを簡単にフィルタリングしたりグループ化したりできるようになります。

サポートされている属性の完全なリストについては、[Langfuse OpenTelemetryドキュメント](https://langfuse.com/integrations/native/opentelemetry#trace-level-attributes)を参照してください。

よく使用される属性：

- **セッションID** (`langfuse.session.id`): 関連するトレースをグループ化し、集計メトリクス、コスト分析、スコアリングに使用します。
- **環境** (`langfuse.environment`): 開発やステージングのトレースを本番環境から分離します。
- **タグ** (`langfuse.trace.tags`): 機能名、実験ID、または顧客セグメントなどのラベルをトレースに付けます（文字列の配列）。

### セッションとタグを使用した例

=== "Kotlin"

    <!--- INCLUDE
    import ai.koog.agents.core.agent.AIAgent
    import ai.koog.agents.features.opentelemetry.attribute.CustomAttribute
    import ai.koog.agents.features.opentelemetry.feature.OpenTelemetry
    import ai.koog.agents.features.opentelemetry.integration.langfuse.addLangfuseExporter
    import ai.koog.prompt.executor.clients.openai.OpenAIModels
    import ai.koog.prompt.executor.llms.all.simpleOpenAIExecutor
    import kotlinx.coroutines.runBlocking
    import java.util.UUID
    val promptExecutor = simpleOpenAIExecutor("openai-api-key")
    -->
    ```kotlin
    fun main() = runBlocking {
        val sessionId = UUID.randomUUID().toString()
    
        val agent = AIAgent(
            promptExecutor = promptExecutor,
            llmModel = OpenAIModels.Chat.GPT4oMini,
            systemPrompt = "You are a helpful assistant."
        ) {
            install(OpenTelemetry) {
                addLangfuseExporter(
                    traceAttributes = listOf(
                        CustomAttribute("langfuse.session.id", sessionId),
                        CustomAttribute("langfuse.trace.tags", listOf("chat", "kotlin", "production"))
                    )
                )
            }
        }
    
        println("Running agent with Langfuse tracing")

        // 同じセッションIDでの複数の実行は、Langfuse内でグループ化されます
        agent.run("What is Kotlin?")
        agent.run("Show me a coroutine example")
    }
    ```
    <!--- KNIT example-langfuse-exporter-02.kt -->

=== "Java"

    !!! note
        現在、Javaから `traceAttributes` を設定することはサポートされていません。これは、基盤となるKotlin関数が [`kotlin.time.Duration`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.time/-duration/) パラメータ（値クラス/value class）を保持しており、それ以降のパラメータを含むすべてのオーバーロードにおいてJVM名のマングリング（mangling）が発生するためです。`traceAttributes` が必要な場合は、上記のKotlinの例を使用してください。

## トレースされる内容

Langfuseエクスポーターは、Koogの一般的なOpenTelemetry統合と同じアクティビティをキャプチャします。
また、Langfuseで[エージェント・グラフ](https://langfuse.com/docs/observability/features/agent-graphs)を表示するために必要なスパン属性もキャプチャします。

キャプチャされるスパンの完全なリスト、およびLLMのプロンプトとレスポンスの内容を含める方法については、[トレースされる内容](index.md#what-gets-traced)を参照してください。

Langfuseで視覚化すると、トレースは次のように表示されます：
![Langfuse traces](/koog/opentelemetry-langfuse-exporter-light.png#only-light)
![Langfuse traces](/koog/opentelemetry-langfuse-exporter-dark.png#only-dark)

Langfuse OpenTelemetryトレースの詳細については、以下を参照してください：  
[Langfuse OpenTelemetry Docs](https://langfuse.com/integrations/native/opentelemetry#opentelemetry-endpoint).

---

## トラブルシューティング

- **トレースが表示されない**: `LANGFUSE_HOST`、`LANGFUSE_PUBLIC_KEY`、および `LANGFUSE_SECRET_KEY` が設定されていること、およびキーペアが正しいプロジェクトのものであることを確認してください。
- **接続の問題**: セルフホスト型のLangfuseを実行している場合は、アプリケーション環境から `LANGFUSE_HOST` に到達可能であることを確認してください。

一般的なトラブルシューティングについては、[トラブルシューティング](index.md#troubleshooting)を参照してください。