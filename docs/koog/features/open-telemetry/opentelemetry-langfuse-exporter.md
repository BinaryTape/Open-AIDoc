# Langfuse 导出器

Koog 使用 [OpenTelemetry](https://opentelemetry.io/) 发送 agent 跟踪，OpenTelemetry 是可观测性数据的开放标准。
为了将这些跟踪发送到 [Langfuse](https://langfuse.com/)，Koog 包含了一个内置的 OpenTelemetry 导出器 —— 无需手动插桩。

连接后，Langfuse 的 [OpenTelemetry 支持](https://langfuse.com/integrations/native/opentelemetry) 可让您可视化、分析及调试您的 agent 与 LLM、工具和外部 API 的交互方式。

---

## 设置说明

1. 使用 [设置指南](https://langfuse.com/docs/get-started#create-new-project-in-langfuse) 创建 Langfuse 项目。
2. 从 [Organization Settings > API Keys](https://langfuse.com/faq/all/where-are-langfuse-api-keys) 获取您的 `public key`（公钥）和 `secret key`（密钥）。
3. 提供主机、公钥和密钥 —— 既可以作为 [`addLangfuseExporter()`](api:agents-features-opentelemetry::ai.koog.agents.features.opentelemetry.integration.langfuse.addLangfuseExporter) 函数的参数，也可以通过环境变量提供：

```bash
   export LANGFUSE_HOST="https://cloud.langfuse.com"
   export LANGFUSE_PUBLIC_KEY="<your-public-key>"
   export LANGFUSE_SECRET_KEY="<your-secret-key>"
```
<!--- KNIT example-langfuse-exporter-01.txt -->

## 配置

安装 **OpenTelemetry 功能**并调用 [`addLangfuseExporter()`](api:agents-features-opentelemetry::ai.koog.agents.features.opentelemetry.integration.langfuse.addLangfuseExporter) 来启用 Langfuse 导出。

### 基础示例

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

## 跟踪属性

当 Koog 将 agent 活动发送到 Langfuse 时，它会以一系列 *span* 的形式发送 —— 即单个工作记录，例如 LLM 调用或工具执行。相关的 span 会被分到同一个 *跟踪* (trace) 中，这代表了从开始到结束的完整 agent 运行。

[`addLangfuseExporter()`](api:agents-features-opentelemetry::ai.koog.agents.features.opentelemetry.integration.langfuse.addLangfuseExporter) 接受一个 `traceAttributes` 参数 —— 即附加到每个跟踪根部的键值对列表。这些属性启用了 Langfuse 特定功能，如会话、环境和标签，从而方便在 Langfuse UI 中过滤和分组跟踪。

有关支持的属性完整列表，请参阅 [Langfuse OpenTelemetry 文档](https://langfuse.com/integrations/native/opentelemetry#trace-level-attributes)。

建议包含的常用属性：

- **会话 ID (Session ID)** (`langfuse.session.id`)：将相关跟踪分组，以便进行聚合指标分析、成本分析和评分。
- **环境 (Environment)** (`langfuse.environment`)：将生产环境跟踪与开发和暂存环境隔离。
- **标签 (Tags)** (`langfuse.trace.tags`)：使用功能名称、实验 ID 或客户细分标记跟踪（字符串数组）。

### 包含会话和标签的示例

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

        // 使用相同会话 ID 的多次运行将在 Langfuse 中进行分组
        agent.run("What is Kotlin?")
        agent.run("Show me a coroutine example")
    }
    ```
    <!--- KNIT example-langfuse-exporter-02.kt -->

=== "Java"

    !!! note
        目前不支持从 Java 设置 `traceAttributes`，因为底层的 Kotlin 函数携带了一个 [`kotlin.time.Duration`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.time/-duration/) 参数（一个值类），这会导致包括其后参数在内的所有重载出现 JVM 名称修饰（mangling）问题。需要 `traceAttributes` 时，请使用上面的 Kotlin 示例。

## 跟踪的内容

Langfuse 导出器捕获的内容与 Koog 的常规 OpenTelemetry 集成相同。
它还会捕获 Langfuse 显示 [Agent 图表](https://langfuse.com/docs/observability/features/agent-graphs) 所需的 span 属性。

有关捕获的 span 的完整列表以及如何包含 LLM 提示词和响应内容，请参阅 [跟踪的内容](index.md#what-gets-traced)。

在 Langfuse 中可视化时，跟踪显示如下：
![Langfuse traces](/koog/opentelemetry-langfuse-exporter-light.png#only-light)
![Langfuse traces](/koog/opentelemetry-langfuse-exporter-dark.png#only-dark)

有关 Langfuse OpenTelemetry 跟踪的更多详细信息，请参阅：  
[Langfuse OpenTelemetry 文档](https://langfuse.com/integrations/native/opentelemetry#opentelemetry-endpoint)。

---

## 故障排除

- **没有跟踪出现**：确认已设置 `LANGFUSE_HOST`、`LANGFUSE_PUBLIC_KEY` 和 `LANGFUSE_SECRET_KEY`，且密钥对属于正确的项目。
- **连接问题**：如果运行的是私有化部署的 Langfuse，请确认您的环境可以访问 `LANGFUSE_HOST`。

有关常规故障排除，请参阅 [故障排除](index.md#troubleshooting)。