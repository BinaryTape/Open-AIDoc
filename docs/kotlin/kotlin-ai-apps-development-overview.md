[//]: # (title: 用于 AI 驱动应用开发的 Kotlin)
<web-summary>了解如何通过 Koog、MCP Kotlin SDK、主流 LLM 提供商、RAG 流水线、AI Agent、Spring AI 和 LangChain4j，使用 Kotlin 构建 AI 驱动的应用程序。</web-summary>

<web-summary>了解 Koog 如何帮助你使用 Kotlin 构建 AI 驱动的应用程序。</web-summary>

Kotlin 为构建 AI 驱动的应用程序提供了现代且实用的基础。  
它可以跨平台使用，能与成熟的 AI 框架良好集成，并支持常见的 AI 开发模式。

## Koog {id="koog"}

[Koog](https://koog.ai) 是 JetBrains 推出的开源框架，用于构建从简单到复杂的 AI Agent。
它提供了多平台支持、Spring Boot 和 Ktor 集成、符合惯用法的 DSL，
以及开箱即用的生产就绪特性。

### 只需数行代码即可创建简单的 Agent {id="create-a-simple-agent-in-a-few-lines"}

```kotlin
fun main() {
    runBlocking {
        val agent = AIAgent(
            // 使用 Anthropic、Google、OpenRouter 或任何其他提供商
            executor = simpleOpenAIExecutor(System.getenv("OPENAI_API_KEY")),
            systemPrompt = "You are a helpful assistant. Answer user questions concisely.",
            llmModel = OpenAIModels.Chat.GPT4o
        )

        val result = agent.run("Hello! How can you help me?")
        println(result)
    }
}
```

<a href="https://docs.koog.ai/quickstart/" as="button" mode="rock" icon="arrow-right" icon-position="right">Koog 入门</a>

### 主要特性 {id="key-features"}

* **支持多平台开发**。多平台支持使开发者能够面向 JVM、JavaScript、WebAssembly、Android 和 iOS 构建基于 Agent 的应用程序。
* **可靠性与容错能力**。凭借内置的重试机制，Koog 让开发者能够处理超时或工具错误等故障。Agent 持久化使得恢复完整的 Agent 状态机成为可能，而不仅仅是恢复聊天消息。
* **针对长上下文的内置历史压缩技术**。Koog 附带高级策略，无需额外设置即可压缩并管理长期运行的对话。
* **企业级集成**。Koog 与 [Spring Boot](https://spring.io/projects/spring-boot) 和 [Ktor](https://ktor.io) 等主流 JVM 框架集成。
* **通过 OpenTelemetry 导出程序实现可观测性**。Koog 提供了与 W&B Weave 和 Langfuse 等主流可观测性提供商的开箱即用集成，用于监控和调试 AI 应用程序。
* **LLM 切换与无缝历史适配**。Koog 允许在任何阶段切换到拥有新工具集的其他 LLM，而不会丢失现有的对话历史记录。它还支持在包括 OpenAI、Anthropic、Google 等在内的多个 LLM 提供商之间重新路由。你还可以通过 Koog 与 Ollama 的集成，配合本地模型在本地运行 Agent。
* **与 JVM 及 Kotlin 应用程序集成**。Koog 专为 JVM 和 Kotlin 开发者提供了符合习惯用法且类型安全的 DSL。
* **模型上下文协议 (MCP) 集成**。Koog 支持在 Agent 中使用 MCP 工具。
* **知识检索与记忆**。借助嵌入 (Embedding)、排序文档存储和共享 Agent 记忆，Koog 自身可以在跨会话中主动保留知识。
* **流式传输能力**。Koog 支持流式传输和并行工具调用，让开发者能够实时处理响应。

### 从何处入手 {id="where-to-start"}

* 在[概述](https://docs.koog.ai/)中探索 Koog 的功能。
* 通过[快速入门指南](https://docs.koog.ai/quickstart/)构建你的第一个 Koog Agent。
* 在 [Koog 发布说明](https://github.com/JetBrains/koog/releases)中查看最新更新。
* 从[示例](https://docs.koog.ai/examples/)中学习。

## Model Context Protocol (MCP) Kotlin SDK {id="model-context-protocol-mcp-kotlin-sdk"}

[MCP Kotlin SDK](https://github.com/modelcontextprotocol/kotlin-sdk) 是 Model Context Protocol（模型上下文协议）的 Kotlin Multiplatform 实现。
该 SDK 让开发者能够使用 Kotlin 构建 AI 驱动的应用程序，并跨 JVM、WebAssembly 和 iOS 与 LLM 交互界面进行集成。

借助 MCP Kotlin SDK，你可以：

* 通过将上下文处理与 LLM 交互分离开来，以结构化且标准化的方式向 LLM 提供上下文。
* 构建 MCP 客户端以使用现有服务器中的资源。
* 创建 MCP 服务器，向 LLM 公开 Prompt、工具和资源。
* 使用诸如 stdio、SSE 和 WebSocket 等标准通信传输协议。
* 处理所有 MCP 协议消息和生命周期事件。

## 探索其他 AI 驱动的应用场景 {id="explore-other-ai-powered-application-scenarios"}

得益于无缝的 Java 互操作性与 Kotlin Multiplatform，你可以将 Kotlin 与成熟的 AI SDK 和框架相结合，构建后端以及桌面/移动端 UI，并采用诸如 RAG 和基于 Agent 的工作流等模式。

> 你可以探索并运行来自 [Kotlin-AI-Examples](https://github.com/Kotlin/Kotlin-AI-Examples) 仓库的示例。
> 每个项目都是自包含的。你可以将各个项目用作构建基于 Kotlin 的 AI 应用程序的参考或模板。

### 连接主流模型提供商 {id="connect-to-major-model-providers"}

使用 Kotlin 连接诸如 OpenAI、Anthropic、Google 等主流模型提供商：

* [OpenAI](https://github.com/openai/openai-java) — OpenAI API 的官方 Java SDK。它涵盖了响应与聊天、图像以及音频。
* [Anthropic (Claude)](https://github.com/anthropics/anthropic-sdk-java) — Claude Messages API 的官方 Java SDK。它包含用于 Vertex AI 和 Bedrock 集成的模块。
* [Google AI (Gemini / Vertex AI)](https://github.com/googleapis/java-genai) — 官方 Java SDK，可通过单个客户端在 Gemini API 与 Vertex AI 之间切换。
* [Azure OpenAI](https://github.com/Azure/azure-sdk-for-java/tree/main/sdk/openai/azure-ai-openai) — Azure OpenAI Service 的官方 Java 客户端。它支持聊天补全与嵌入 (Embedding)。
* [AWS Bedrock](https://github.com/aws/aws-sdk-kotlin) — 用于调用基础模型的官方 SDK。它包含适用于 Bedrock 和 Bedrock Runtime 的 Kotlin SDK 与 Java SDK。

### 创建 RAG 流水线与基于 Agent 的应用 {id="create-rag-pipelines-and-agent-based-apps"}

* [Spring AI](https://github.com/spring-projects/spring-ai) — 针对 Prompt、聊天、嵌入、工具与函数调用以及向量存储的多提供商抽象。
* [LangChain4j](https://docs.langchain4j.dev/tutorials/kotlin/) — 包含 Kotlin 扩展的 JVM 工具包，适用于 Prompt、工具、检索增强生成 (RAG) 流水线以及 Agent。

## 后续步骤 {id="what-s-next"}

* 完成[使用 Spring AI 创建能够回答问题的 Kotlin 应用](spring-ai-guide.md)教程，详细了解如何在 IntelliJ IDEA 中结合使用 Spring AI 与 Kotlin
* 加入 [Kotlin 社区](https://kotlinlang.org/community/)，与其他使用 Kotlin 构建 AI 应用程序的开发者交流
* 了解[可用于协助 Kotlin 开发的 AI 工具](ai-for-development.md)。