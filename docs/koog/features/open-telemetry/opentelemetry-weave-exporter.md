# W&B Weave 导出器

Koog 使用 [OpenTelemetry](https://opentelemetry.io/) 发送智能体跟踪，这是一种观测数据的开放标准。
为了将这些跟踪发送到 [W&B Weave](https://wandb.ai/site/weave/)，Koog 包含了一个内置的 OpenTelemetry 导出器 —— 无需手动检测。

连接后，Weave 的 [OpenTelemetry 支持](https://weave-docs.wandb.ai/guides/tracking/otel/) 允许您对智能体与 LLM、工具和外部 API 的交互进行可视化、分析和调试。

---

## 设置说明

1. 在 [https://wandb.ai](https://wandb.ai) 创建一个 W&B 帐号。
2. 从 [https://wandb.ai/authorize](https://wandb.ai/authorize) 获取您的 API 密钥。
3. 在 [W&B 仪表板](https://wandb.ai/home) 查找您的实体名称 —— 对于个人帐户，它与您的用户名匹配，对于共享工作区，则匹配团队/组织名称。
4. 选择一个项目名称。如果项目尚不存在，它将在发送第一条跟踪时自动创建。
5. 提供实体、项目名称和 API 密钥 —— 既可以作为 [`addWeaveExporter()`](api:agents-features-opentelemetry::ai.koog.agents.features.opentelemetry.integration.weave.addWeaveExporter) 函数的参数提供，也可以通过环境变量提供：

```bash
export WEAVE_API_KEY="<your-api-key>"
export WEAVE_ENTITY="<your-entity>"
export WEAVE_PROJECT_NAME="koog-tracing"
```
<!--- KNIT example-weave-exporter-01.txt -->

## 配置

安装 **OpenTelemetry 功能**并调用 [`addWeaveExporter()`](api:agents-features-opentelemetry::ai.koog.agents.features.opentelemetry.integration.weave.addWeaveExporter) 以启用 Weave 导出。

### 基本示例

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
                    null,        // weaveOtelBaseUrl: 回退到 WEAVE_URL，默认为 https://trace.wandb.ai
                    entity,
                    projectName  // 其余参数 (apiKey, timeout) 使用默认值
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

## 跟踪的内容

Weave 导出器捕获的内容与 Koog 的通用 OpenTelemetry 集成相同。
有关捕获的 span 的完整列表以及如何包含 LLM 提示词和响应内容，请参阅[跟踪的内容](index.md#what-gets-traced)。

在 W&B Weave 中进行可视化时，跟踪显示如下：
![W&B Weave 跟踪](/koog/opentelemetry-weave-exporter-light.png#only-light)
![W&B Weave 跟踪](/koog/opentelemetry-weave-exporter-dark.png#only-dark)

有关更多详细信息，请参阅官方 [Weave OpenTelemetry 文档](https://weave-docs.wandb.ai/guides/tracking/otel/)。

---

## 故障排除

- **没有跟踪**：确认设置了 `WEAVE_API_KEY`、`WEAVE_ENTITY` 和 `WEAVE_PROJECT_NAME`，并且您的 W&B 帐号具有访问指定实体和项目的权限。
- **身份验证错误**：验证 `WEAVE_API_KEY` 是否有效，并具有所选实体的写入权限。
- **连接问题**：确认您的环境可以访问 W&B 的 OpenTelemetry 摄取端点。

有关通用故障排除，请参阅[故障排除](index.md#troubleshooting)。