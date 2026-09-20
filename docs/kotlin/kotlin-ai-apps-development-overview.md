[//]: # (title: Kotlin 用于人工智能驱动的应用开发)
[//]: # (description: 了解如何使用 Koog、MCP Kotlin SDK、主流 LLM 提供商、RAG 流水线、AI 智能体、Spring AI 以及 LangChain4j 通过 Kotlin 构建人工智能驱动的应用程序。)

<web-summary>了解 Koog 如何帮助您使用 Kotlin 构建人工智能驱动的应用程序。</web-summary>

Kotlin 为构建人工智能驱动的应用程序提供了现代且实用的基础。  
它可以跨平台使用，能与成熟的 AI 框架良好集成，并支持常见的 AI 开发模式。

## Koog {id="koog"}

[Koog](https://koog.ai) 是 JetBrains 开发的一个开源框架，用于构建从简单到复杂的 AI 智能体。
它提供多平台支持、Spring Boot 与 Ktor 集成、惯用 DSL 以及开箱即用的生产就绪型功能。

### 通过寥寥几行代码创建一个简单的智能体 {id="create-a-simple-agent-in-a-few-lines"}

```kotlin
fun main() {
    runBlocking {
        val agent = AIAgent(
            // 使用 Anthropic、Google、OpenRouter 或任何其他提供商
            executor = simpleOpenAIExecutor(System.getenv("OPENAI_API_KEY")),
            systemPrompt = "你是一个乐于助人的助手。请简洁地回答用户的问题。",
            llmModel = OpenAIModels.Chat.GPT4o
        )

        val result = agent.run("你好！你能帮我做些什么？")
        println(result)
    }
}
```

<a href="https://docs.koog.ai/quickstart/" as="button" mode="rock" icon="arrow-right" icon-position="right">Koog 快速入门</a>

### 关键功能 {id="key-features"}

* **支持多平台开发**。多平台支持使得针对 JVM、JavaScript、WebAssembly、Android 和 iOS 的智能体应用程序开发成为可能。
* **可靠性与容错性**。凭借内置的重试机制，Koog 让开发者能够处理超时或工具错误等失败情况。智能体持久化使得恢复完整的智能体状态机（而非仅聊天消息）成为可能。
* **针对长上下文的内置历史压缩技术**。Koog 附带先进的策略，无需额外设置即可压缩并管理长时间运行的对话。
* **企业级集成**。Koog 与 [Spring Boot](https://spring.io/projects/spring-boot) 和 [Ktor](https://ktor.io) 等流行的 JVM 框架集成。
* **利用 OpenTelemetry 导出器实现可观测性**。Koog 提供了与 W&B Weave 和 Langfuse 等流行可观测性提供商的即用型集成，用于监控和调试 AI 应用程序。
* **LLM 切换与无缝历史适配**。Koog 允许在任何时间点切换到使用新工具集的不同 LLM，而不会丢失现有对话历史。它还支持在包括 OpenAI、Anthropic、Google 在内的多个 LLM 提供商之间进行重新路由。通过 Koog 与 Ollama 的集成，您可以在本地使用本地模型运行智能体。
* **与 JVM 和 Kotlin 应用程序集成**。Koog 为 JVM 和 Kotlin 开发者专门提供了一种惯用的、类型安全的 DSL。
* **模型上下文协议 (MCP) 集成**。Koog 支持在智能体中使用 MCP 工具。
* **知识检索与记忆**。通过嵌入 (embeddings)、分级文档存储和共享智能体记忆，Koog 自身能在对话中主动保留知识。
* **流式传输能力**。Koog 支持流式传输和并行工具调用，让开发者能够实时处理响应。

### 从哪里开始 {id="where-to-start"}

* 在[概览](https://docs.koog.ai/)中探索 Koog 的功能。
* 通过[快速入门指南](https://docs.koog.ai/quickstart/)构建您的第一个 Koog 智能体。
* 在 [Koog 发行说明](https://github.com/JetBrains/koog/releases)中查看最新更新。
* 通过[示例](https://docs.koog.ai/examples/)学习。

## 模型上下文协议 (MCP) Kotlin SDK {id="model-context-protocol-mcp-kotlin-sdk"}

[MCP Kotlin SDK](https://github.com/modelcontextprotocol/kotlin-sdk) 是模型上下文协议的 Kotlin 多平台实现。
该 SDK 让开发者能够使用 Kotlin 构建人工智能驱动的应用程序，并与跨 JVM、WebAssembly 和 iOS 的 LLM 界面进行集成。

通过 MCP Kotlin SDK，您可以：

* 通过将上下文处理与 LLM 交互分离，以结构化且标准化的方式向 LLM 提供上下文。
* 构建使用现有服务器资源的 MCP 客户端。
* 创建向 LLM 开放提示词、工具和资源的 MCP 服务器。
* 使用标准通信传输方式，如 stdio、SSE 和 WebSocket。
* 处理所有 MCP 协议消息和生命周期事件。

## 探索其他人工智能驱动的应用场景 {id="explore-other-ai-powered-application-scenarios"}

得益于无缝的 Java 互操作性和 Kotlin 多平台，您可以将 Kotlin 与成熟的 AI SDK 和框架相结合，构建后端以及桌面/移动 UI，并采用 RAG 和基于智能体的工作流等模式。

> 您可以探索并运行 [Kotlin-AI-Examples](https://github.com/Kotlin/Kotlin-AI-Examples) 仓库中的示例。每个项目都是独立的。您可以将每个项目用作构建基于 Kotlin 的 AI 应用程序的参考或模板。

### 连接到主要的模型提供商 {id="connect-to-major-model-providers"}

使用 Kotlin 连接到主要的模型提供商，如 OpenAI、Anthropic、Google 等：

* [OpenAI](https://github.com/openai/openai-java) — OpenAI API 的官方 Java SDK。它涵盖了响应与聊天、图像以及音频。
* [Anthropic (Claude)](https://github.com/anthropics/anthropic-sdk-java) — Claude Messages API 的官方 Java SDK。它包含用于 Vertex AI 和 Bedrock 集成的模块。
* [Google AI (Gemini / Vertex AI)](https://github.com/googleapis/java-genai) — 官方 Java SDK，其单个客户端可在 Gemini API 和 Vertex AI 之间切换。
* [Azure OpenAI](https://github.com/Azure/azure-sdk-for-java/tree/main/sdk/openai/azure-ai-openai) — Azure OpenAI 服务的官方 Java 客户端。它支持聊天补全和嵌入。
* [AWS Bedrock](https://github.com/aws/aws-sdk-kotlin) — 用于调用基础模型的官方 SDK。它包含适用于 Bedrock 和 Bedrock Runtime 的 Kotlin SDK 和 Java SDK。

### 创建 RAG 流水线和基于智能体的应用 {id="create-rag-pipelines-and-agent-based-apps"}

* [Spring AI](https://github.com/spring-projects/spring-ai) — 针对提示词、聊天、嵌入、工具和函数调用以及向量存储的多提供商抽象。
* [LangChain4j](https://docs.langchain4j.dev/tutorials/kotlin/) — 带有 Kotlin 扩展的 JVM 工具包，用于提示词、工具、检索增强生成 (RAG) 流水线和智能体。

## 下一步 {id="what-s-next"}

* 完成[使用 Spring AI 创建回答问题的 Kotlin 应用](spring-ai-guide.md)教程，详细了解如何在 IntelliJ IDEA 中将 Spring AI 与 Kotlin 结合使用。
* 加入 [Kotlin 社区](https://kotlinlang.org/community/)，与其他使用 Kotlin 构建 AI 应用程序的开发者建立联系。
* 了解[可用于协助 Kotlin 开发的 AI 工具](ai-for-development.md)。