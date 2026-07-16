# W&B Weave 匯出器

Koog 使用 [OpenTelemetry](https://opentelemetry.io/) 發送 agent 追蹤 (trace)，這是一種用於觀測性資料的開放標準。
為了將這些追蹤傳送至 [W&B Weave](https://wandb.ai/site/weave/)，Koog 包含了一個內建的 OpenTelemetry 匯出器 —— 無需手動檢測 (instrumentation)。

連接後，Weave 的 [OpenTelemetry 支援](https://weave-docs.wandb.ai/guides/tracking/otel/) 讓您可以視覺化、分析並偵錯您的 agent 與 LLM、工具及外部 API 的互動方式。

---

## 設定說明

1. 在 [https://wandb.ai](https://wandb.ai) 建立 W&B 帳戶。
2. 從 [https://wandb.ai/authorize](https://wandb.ai/authorize) 獲取您的 API 金鑰。
3. 在 [W&B 儀表板](https://wandb.ai/home) 中找到您的實體 (entity) 名稱 —— 個人帳戶即為您的使用者名稱，共享工作區則為團隊/組織名稱。
4. 選擇一個專案名稱。如果專案尚不存在，則會在傳送第一個追蹤時自動建立。
5. 提供實體、專案名稱和 API 金鑰 —— 可以作為 [`addWeaveExporter()`](api:agents-features-opentelemetry::ai.koog.agents.features.opentelemetry.integration.weave.addWeaveExporter) 的參數，或透過環境變數設定：

```bash
export WEAVE_API_KEY="<your-api-key>"
export WEAVE_ENTITY="<your-entity>"
export WEAVE_PROJECT_NAME="koog-tracing"
```
<!--- KNIT example-weave-exporter-01.txt -->

## 組態

安裝 **OpenTelemetry 功能**並呼叫 [`addWeaveExporter()`](api:agents-features-opentelemetry::ai.koog.agents.features.opentelemetry.integration.weave.addWeaveExporter) 以啟用 Weave 匯出。

### 基本範例

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
                    null,        // weaveOtelBaseUrl: 備援至 WEAVE_URL，預設為 https://trace.wandb.ai
                    entity,
                    projectName  // 其餘參數 (apiKey, timeout) 使用預設值
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

## 哪些內容會被追蹤

Weave 匯出器擷取的活動與 Koog 的一般 OpenTelemetry 整合相同。
如需擷取的 span 完整清單，以及如何包含 LLM 提示與回應內容，請參閱[哪些內容會被追蹤](index.md#what-gets-traced)。

在 W&B Weave 中視覺化時，追蹤如下所示：
![W&B Weave 追蹤](/koog/opentelemetry-weave-exporter-light.png#only-light)
![W&B Weave 追蹤](/koog/opentelemetry-weave-exporter-dark.png#only-dark)

如需更多詳細資訊，請參閱官方的 [Weave OpenTelemetry 文件](https://weave-docs.wandb.ai/guides/tracking/otel/)。

---

## 疑難排解

- **未出現追蹤**：確認已設定 `WEAVE_API_KEY`、`WEAVE_ENTITY` 與 `WEAVE_PROJECT_NAME`，且您的 W&B 帳戶具有存取指定實體和專案的權限。
- **身份驗證錯誤**：驗證 `WEAVE_API_KEY` 是否有效，且具有對所選實體的寫入權限。
- **連線問題**：確認您的環境可以連線至 W&B 的 OpenTelemetry 擷取端點。

如需一般疑難排解，請參閱[疑難排解](index.md#troubleshooting)。