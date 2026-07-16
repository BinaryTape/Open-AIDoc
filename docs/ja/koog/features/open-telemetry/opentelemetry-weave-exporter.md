# W&B Weave エクスポーター

Koog は、オブザーバビリティ（可観測性）データのオープン標準である [OpenTelemetry](https://opentelemetry.io/) を使用してエージェントトレースを生成します。
[W&B Weave](https://wandb.ai/site/weave/) にこれらのトレースを送信するために、Koog には組み込みの OpenTelemetry エクスポーターが含まれており、手動でのインストルメンテーション（コードの挿入）は不要です。

接続されると、Weave の [OpenTelemetry サポート](https://weave-docs.wandb.ai/guides/tracking/otel/) により、エージェントが LLM、ツール、外部 API とどのようにやり取りするかを可視化、分析、デバッグできるようになります。

---

## セットアップ手順

1. [https://wandb.ai](https://wandb.ai) で W&B アカウントを作成します。
2. [https://wandb.ai/authorize](https://wandb.ai/authorize) から API キーを取得します。
3. [W&B ダッシュボード](https://wandb.ai/home) でエンティティ名（entity name）を確認します。これは、個人アカウントの場合はユーザー名、共有ワークスペースの場合はチーム名または組織名に一致します。
4. プロジェクト名を選択します。プロジェクトがまだ存在しない場合は、最初のトレースが送信される際に自動的に作成されます。
5. エンティティ、プロジェクト名、API キーを、[`addWeaveExporter()`](api:agents-features-opentelemetry::ai.koog.agents.features.opentelemetry.integration.weave.addWeaveExporter) 関数のパラメータとして渡すか、以下のように環境変数を使用して設定します。

```bash
export WEAVE_API_KEY="<your-api-key>"
export WEAVE_ENTITY="<your-entity>"
export WEAVE_PROJECT_NAME="koog-tracing"
```
<!--- KNIT example-weave-exporter-01.txt -->

## 設定

**OpenTelemetry 機能**をインストールし、[`addWeaveExporter()`](api:agents-features-opentelemetry::ai.koog.agents.features.opentelemetry.integration.weave.addWeaveExporter) を呼び出すことで Weave へのエクスポートを有効にします。

### 基本的な例

=== "Kotlin"

    <!--- INCLUDE
    import ai.koog.agents.core.agent.AIAgent
    import ai.koog.agents.features.opentelemetry.feature.OpenTelemetry
    import ai.koog.agents.features.opentelemetry.integration.weave.addWeaveExporter
    import ai.koog.prompt.executor.clients.openai.OpenAIModels
    import ai.koog.prompt.executor.llms.all.simpleOpenAIExecutor
    import kotlinx.coroutines.runBlocking
    val promptExecutor = simpleOpenAIExecutor("openai-api-key")
    -->
    ```kotlin
    fun main() = runBlocking {
        val entity = System.getenv()["WEAVE_ENTITY"] 
            ?: throw IllegalArgumentException("WEAVE_ENTITY is not set")
        
        val projectName = System.getenv()["WEAVE_PROJECT_NAME"] 
            ?: "koog-tracing"
        
        val agent = AIAgent(
            promptExecutor = promptExecutor,
            llmModel = OpenAIModels.Chat.GPT4oMini,
            systemPrompt = "You are a code assistant. Provide concise code examples."
        ) {
            install(OpenTelemetry) {
                addWeaveExporter()
            }
        }
    
        println("Running agent with Weave tracing")
    
        val result = agent.run("Tell me a joke about programming")
        println("Result: $result
See traces on https://wandb.ai/$entity/$projectName/weave/traces")
    }
    ```
    <!--- KNIT example-weave-exporter-01.kt -->

=== "Java"

    <!--- INCLUDE
    import ai.koog.agents.core.agent.AIAgent;
    import ai.koog.agents.features.opentelemetry.feature.OpenTelemetry;
    import ai.koog.agents.features.opentelemetry.integration.weave.WeaveKt;
    import ai.koog.prompt.executor.clients.openai.OpenAIModels;
    import ai.koog.prompt.executor.model.PromptExecutor;
    import java.util.Optional;
    public class exampleWeaveExporterJava01 {
        static PromptExecutor promptExecutor = PromptExecutor.builder()
            .openAI("openai-api-key")
            .build();
    -->
    <!--- SUFFIX
    }
    -->
    ```java
    public static void main(String[] args) {
        var entity = Optional.ofNullable(System.getenv("WEAVE_ENTITY"))
            .filter(env -> !env.isBlank())
            .orElseThrow(() -> new IllegalArgumentException("WEAVE_ENTITY is not set"));

        var projectName = Optional.ofNullable(System.getenv("WEAVE_PROJECT_NAME"))
            .filter(env -> !env.isBlank())
            .orElse("koog-tracing");

        var agent = AIAgent.builder()
            .promptExecutor(promptExecutor)
            .llmModel(OpenAIModels.Chat.GPT4oMini)
            .systemPrompt("You are a helpful assistant.")
            .install(OpenTelemetry.Feature, config ->
                WeaveKt.addWeaveExporter(
                    config,
                    null,        // weaveOtelBaseUrl: WEAVE_URL にフォールバックし、デフォルトは https://trace.wandb.ai です
                    entity,
                    projectName  // その他のパラメータ（apiKey, timeout）はデフォルト値を使用します
                )
            )
            .build();

        System.out.println("Running agent with Weave tracing");

        var result = agent.run("Tell me a joke about programming");
        System.out.println("Result: " + result + "
See traces on https://wandb.ai/" + entity + "/" + projectName + "/weave/traces");
    }
    ```
    <!--- KNIT exampleWeaveExporterJava01.java -->

## トレースされる内容

Weave エクスポーターは、Koog の一般的な OpenTelemetry 統合と同じアクティビティをキャプチャします。
キャプチャされるスパンの全リスト、および LLM のプロンプトとレスポンスの内容を含める方法については、[トレースされる内容](index.md#what-gets-traced)を参照してください。

W&B Weave で可視化すると、トレースは次のように表示されます：
![W&B Weave traces](/koog/opentelemetry-weave-exporter-light.png#only-light)
![W&B Weave traces](/koog/opentelemetry-weave-exporter-dark.png#only-dark)

詳細については、公式の [Weave OpenTelemetry ドキュメント](https://weave-docs.wandb.ai/guides/tracking/otel/)を参照してください。

---

## トラブルシューティング

- **トレースが表示されない**: `WEAVE_API_KEY`、`WEAVE_ENTITY`、および `WEAVE_PROJECT_NAME` が設定されていること、および W&B アカウントが指定されたエンティティとプロジェクトへのアクセス権を持っていることを確認してください。
- **認証エラー**: `WEAVE_API_KEY` が有効であり、選択したエンティティに対して書き込み権限があることを確認してください。
- **接続の問題**: お使いの環境から W&B の OpenTelemetry 受信エンドポイントへのネットワークアクセスが可能であることを確認してください。

一般的なトラブルシューティングについては、[トラブルシューティング](index.md#troubleshooting)を参照してください。