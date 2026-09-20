[//]: # (title: 用於 AI 驅動應用程式開發的 Kotlin)
[//]: # (description: 了解如何使用 Koog、MCP Kotlin SDK、各大 LLM 供應商、RAG 管線、AI 代理人、Spring AI 與 LangChain4j，透過 Kotlin 建構 AI 驅動的應用程式。)

<web-summary>了解 Koog 如何協助您使用 Kotlin 建構 AI 驅動的應用程式。</web-summary>

Kotlin 為建構 AI 驅動的應用程式提供了現代且實用的基礎。  
它可以用於跨平台開發，與成熟的 AI 架構良好整合，並支援常見的 AI 開發模式。

## Koog {id="koog"}

[Koog](https://koog.ai) 是來自 JetBrains 的開源架構，用於建構從簡單到複雜的 AI 代理人。
它提供多平台支援、Spring Boot 與 Ktor 整合、慣用的 DSL，以及開箱即用的生產就緒功能。

### 透過幾行程式碼建立簡單的代理人 {id="create-a-simple-agent-in-a-few-lines"}

```kotlin
fun main() {
    runBlocking {
        val agent = AIAgent(
            // 使用 Anthropic、Google、OpenRouter 或任何其他供應商
            executor = simpleOpenAIExecutor(System.getenv("OPENAI_API_KEY")),
            systemPrompt = "You are a helpful assistant. Answer user questions concisely.",
            llmModel = OpenAIModels.Chat.GPT4o
        )

        val result = agent.run("Hello! How can you help me?")
        println(result)
    }
}
```

<a href="https://docs.koog.ai/quickstart/" as="button" mode="rock" icon="arrow-right" icon-position="right">立即開始使用 Koog</a>

### 主要功能 {id="key-features"}

* **支援多平台開發**。多平台支援讓開發者能為 JVM、JavaScript、WebAssembly、Android 與 iOS 建構代理應用程式。
* **可靠性與容錯能力**。透過內建的重試機制，Koog 讓開發人員能夠處理逾時或工具錯誤等失敗情況。代理人的持久化功能讓恢復完整的代理人狀態機成為可能，而不僅僅是聊天訊息。
* **針對長內容內建歷史記錄壓縮技術**。Koog 隨附進階策略，無需額外設定即可壓縮並管理長時間運行的對話。
* **企業級整合**。Koog 與熱門的 JVM 架構整合，例如 [Spring Boot](https://spring.io/projects/spring-boot) 和 [Ktor](https://ktor.io)。
* **透過 OpenTelemetry 匯出器實現可觀察性**。Koog 提供與 W&B Weave 和 Langfuse 等熱門可觀察性供應商的即用型整合，用於監控與偵錯 AI 應用程式。
* **LLM 切換與無縫的歷史記錄適應**。Koog 允許在任何時間點切換到具有新工具集的不同 LLM，且不會遺失現有的對話歷史記錄。它還支援在多個 LLM 供應商之間進行重新路由，包括 OpenAI、Anthropic、Google 等。您可以透過 Koog 與 Ollama 的整合，在本機使用本機模型執行代理人。
* **與 JVM 和 Kotlin 應用程式整合**。Koog 為 JVM 與 Kotlin 開發人員提供了慣用的、型別安全的 DSL。
* **Model Context Protocol (MCP) 整合**。Koog 支援在代理人中使用 MCP 工具。
* **知識檢索與記憶**。透過嵌入 (embeddings)、分級文件存儲以及共享的代理人記憶，Koog 本身會在對話中主動保留知識。
* **串流功能**。Koog 讓開發人員能夠透過串流支援與平行工具呼叫即時處理回應。

### 從何處開始 {id="where-to-start"}

* 在 [總覽 (Overview)](https://docs.koog.ai/) 中探索 Koog 的功能。
* 參考 [快速入門指南](https://docs.koog.ai/quickstart/) 建構您的第一個 Koog 代理人。
* 在 [Koog 版本說明](https://github.com/JetBrains/koog/releases) 中查看最新更新。
* 從 [範例](https://docs.koog.ai/examples/) 中學習。

## Model Context Protocol (MCP) Kotlin SDK {id="model-context-protocol-mcp-kotlin-sdk"}

[MCP Kotlin SDK](https://github.com/modelcontextprotocol/kotlin-sdk) 是 Model Context Protocol 的 Kotlin 多平台實作。 
該 SDK 讓開發人員能以 Kotlin 建構 AI 驅動的應用程式，並與 JVM、WebAssembly 及 iOS 上的 LLM 介面整合。

透過 MCP Kotlin SDK，您可以：

* 透過將上下文處理與 LLM 互動分離，以結構化且標準化的方式向 LLM 提供上下文。
* 建構 MCP 用戶端，以使用來自現有伺服器的資源。
* 建立 MCP 伺服器，向 LLM 公開提示、工具與資源。
* 使用標準通訊傳輸協定，如 stdio、SSE 和 WebSocket。
* 處理所有 MCP 協定訊息與生命週期事件。

## 探索其他 AI 驅動的應用程式情境 {id="explore-other-ai-powered-application-scenarios"}

得益於與 Java 的無縫互通性以及 Kotlin 多平台，您可以將 Kotlin 與成熟的 AI SDK 和架構結合，建構後端以及桌面/行動裝置 UI，並採用 RAG 和基於代理人的工作流程等模式。

> 您可以從 [Kotlin-AI-Examples](https://github.com/Kotlin/Kotlin-AI-Examples) 存儲庫中探索並執行範例。
> 每個專案都是獨立的。您可以將每個專案作為建構基於 Kotlin 的 AI 應用程式的參考或範本。

### 連接到主要的模型供應商 {id="connect-to-major-model-providers"}

使用 Kotlin 連接到主要的模型供應商，如 OpenAI、Anthropic、Google 等：

* [OpenAI](https://github.com/openai/openai-java) — OpenAI API 的官方 Java SDK。它涵蓋了回應與對話、圖片及音訊。
* [Anthropic (Claude)](https://github.com/anthropics/anthropic-sdk-java) — Claude Messages API 的官方 Java SDK。它包含用於 Vertex AI 與 Bedrock 整合的模組。 
* [Google AI (Gemini / Vertex AI)](https://github.com/googleapis/java-genai) — 官方 Java SDK，具有可在 Gemini API 與 Vertex AI 之間切換的單一用戶端。
* [Azure OpenAI](https://github.com/Azure/azure-sdk-for-java/tree/main/sdk/openai/azure-ai-openai) — Azure OpenAI 服務的官方 Java 用戶端。它支援對話補全與嵌入。
* [AWS Bedrock](https://github.com/aws/aws-sdk-kotlin) — 用於調用基礎模型的官方 SDK。它包含用於 Bedrock 與 Bedrock Runtime 的 Kotlin SDK 與 Java SDK。

### 建立 RAG 管線與基於代理人的應用程式 {id="create-rag-pipelines-and-agent-based-apps"}

* [Spring AI](https://github.com/spring-projects/spring-ai) — 用於提示、對話、嵌入、工具與函式呼叫以及向量存儲的多供應商抽象。
* [LangChain4j](https://docs.langchain4j.dev/tutorials/kotlin/) — 帶有 Kotlin 擴充功能的 JVM 工具包，用於提示、工具、檢索增強生成 (RAG) 管線與代理人。

## 下一步 {id="what-s-next"}

* 完成 [使用 Spring AI 建立回答問題的 Kotlin 應用程式](spring-ai-guide.md) 教學，進一步了解如何在 IntelliJ IDEA 中將 Spring AI 與 Kotlin 搭配使用
* 加入 [Kotlin 社群](https://kotlinlang.org/community/)，與其他使用 Kotlin 建構 AI 應用程式的開發人員交流
* 了解 [可用於協助您進行 Kotlin 開發的 AI 工具](ai-for-development.md)。