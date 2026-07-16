# Langfuse 匯出器

Koog 使用 [OpenTelemetry](https://opentelemetry.io/) 傳送 agent 追蹤，這是一種可觀測性資料的開放標準。
為了將這些追蹤發送到 [Langfuse](https://langfuse.com/)，Koog 包含了一個內建的 OpenTelemetry 匯出器 — 不需要手動檢測 (manual instrumentation)。

連接後，Langfuse 的 [OpenTelemetry 支援](https://langfuse.com/integrations/native/opentelemetry) 可讓您視覺化、分析並偵錯您的 agent 如何與 LLM、工具及外部 API 互動。

---

## 設定說明

1. 使用 [設定指南](https://langfuse.com/docs/get-started#create-new-project-in-langfuse) 建立 Langfuse 專案。
2. 從 [Organization Settings > API Keys](https://langfuse.com/faq/all/where-are-langfuse-api-keys) 取得您的 `public key` 與 `secret key`。
3. 提供主機、public key 與 secret key — 可以作為 [`addLangfuseExporter()`](api:agents-features-opentelemetry::ai.koog.agents.features.opentelemetry.integration.langfuse.addLangfuseExporter) 的參數提供，或透過環境變數提供：

```bash
   export LANGFUSE_HOST="https://cloud.langfuse.com"
   export LANGFUSE_PUBLIC_KEY="<your-public-key>"
   export LANGFUSE_SECRET_KEY="<your-secret-key>"
```
<!--- KNIT example-langfuse-exporter-01.txt -->

## 配置

安裝 **OpenTelemetry feature** 並呼叫 [`addLangfuseExporter()`](api:agents-features-opentelemetry::ai.koog.agents.features.opentelemetry.integration.langfuse.addLangfuseExporter) 以啟用 Langfuse 匯出。

### 基本範例

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

## 追蹤屬性

當 Koog 將 agent 活動發送到 Langfuse 時，它是以一系列 *span* 的形式進行的 — 這些是個別的工作記錄，例如 LLM 呼叫或工具執行。相關的 span 會被分組到一個 *追蹤* (trace) 中，代表一個 agent 從開始到結束的完整執行過程。

[`addLangfuseExporter()`](api:agents-features-opentelemetry::ai.koog.agents.features.opentelemetry.integration.langfuse.addLangfuseExporter) 接受一個 `traceAttributes` 參數 — 這是一個附加到每個追蹤根部的鍵值對清單。這些屬性啟用了 Langfuse 的特定功能，例如工作階段、環境和標籤，讓您在 Langfuse UI 中輕鬆篩選與分組追蹤。

如需支援屬性的完整清單，請參閱 [Langfuse OpenTelemetry 文件](https://langfuse.com/integrations/native/opentelemetry#trace-level-attributes)。

常見包含的屬性：

- **工作階段 ID** (`langfuse.session.id`)：將相關追蹤分組，以便進行聚合指標、成本分析和評分
- **環境** (`langfuse.environment`)：將生產環境追蹤與開發和暫存（staging）隔離
- **標籤** (`langfuse.trace.tags`)：使用功能名稱、實驗 ID 或客戶細分標記追蹤（字串陣列）

### 帶有工作階段和標籤的範例

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

        // Multiple runs with the same session ID will be grouped in Langfuse
        agent.run("What is Kotlin?")
        agent.run("Show me a coroutine example")
    }
    ```
    <!--- KNIT example-langfuse-exporter-02.kt -->

=== "Java"

    !!! note
        目前不支援從 Java 設定 `traceAttributes`，因為底層 Kotlin 函式包含一個 [`kotlin.time.Duration`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.time/-duration/) 參數（一個 value class），這會導致所有多載（包含其後的參數）產生 JVM 名稱混淆 (name mangling)。當您需要 `traceAttributes` 時，請使用上方的 Kotlin 範例。

## 追蹤內容

Langfuse 匯出器擷取的活動與 Koog 常規的 OpenTelemetry 整合相同。
它還會擷取 Langfuse 顯示 [Agent 圖表 (Agent Graphs)](https://langfuse.com/docs/observability/features/agent-graphs) 所需的 span 屬性。

如需擷取的 span 完整清單，以及如何包含 LLM 提示和回應內容，請參閱 [追蹤內容](index.md#what-gets-traced)。

在 Langfuse 中視覺化時，追蹤如下所示：
![Langfuse traces](/koog/opentelemetry-langfuse-exporter-light.png#only-light)
![Langfuse traces](/koog/opentelemetry-langfuse-exporter-dark.png#only-dark)

有關 Langfuse OpenTelemetry 追蹤的更多詳細資訊，請參閱：  
[Langfuse OpenTelemetry 文件](https://langfuse.com/integrations/native/opentelemetry#opentelemetry-endpoint)。

---

## 疑難排解

- **沒有追蹤**：確認已設定 `LANGFUSE_HOST`、`LANGFUSE_PUBLIC_KEY` 與 `LANGFUSE_SECRET_KEY`，且金鑰配對屬於正確的專案。
- **連線問題**：如果執行自我託管 (self-hosted) 的 Langfuse，請確認您的環境可以連通 `LANGFUSE_HOST`。

如需一般疑難排解，請參閱 [疑難排解](index.md#troubleshooting)。