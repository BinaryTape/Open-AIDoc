[//]: # (title: 用於 AI 驅動應用程式開發的 Kotlin)
<web-summary>了解如何使用 Kotlin 搭配 Koog、MCP Kotlin SDK、主流 LLM 提供商、RAG 管線、AI 代理、Spring AI 及 LangChain4j 來建置 AI 驅動應用程式。</web-summary>

<web-summary>了解 Koog 如何協助你使用 Kotlin 建置 AI 驅動應用程式。</web-summary>

Kotlin 為建置 AI 驅動應用程式提供了現代且實用的基礎。  
它具備跨平台能力，能與成熟的 AI 架構良好整合，並支援常見的 AI 開發模式。

## Koog {id="koog"}

[Koog](https://koog.ai) 是 JetBrains 推出的開源架構，專門用於建置從簡單到複雜的各類 AI 代理。
它提供多平台支援、Spring Boot 與 Ktor 整合、慣用語法 DSL，以及開箱即用的生產環境等級功能。

### 只需幾行程式碼即可建立簡易代理 {id="create-a-simple-agent-in-a-few-lines"}

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

<a href="https://docs.koog.ai/quickstart/" as="button" mode="rock" icon="arrow-right" icon-position="right">開始使用 Koog</a>

### 主要特色 {id="key-features"}

* **支援多平台開發**。多平台支援讓開發者能夠在 JVM、JavaScript、WebAssembly、Android 和 iOS 上建置代理型應用程式。
* **可靠性與容錯機制**。透過內建的重試機制，Koog 讓開發人員能夠處理超時或工具錯誤等失敗狀況。
    代理狀態持久化功能使得恢復完整的代理狀態機成為可能，而不僅僅是聊天訊息。
* **適用於長上下文的內建歷程記錄壓縮技術**。Koog 隨附進階策略，無需額外設定即可壓縮並管理長時間運行的對話。
* **企業級整合**。Koog 可與 [Spring Boot](https://spring.io/projects/spring-boot) 和 [Ktor](https://ktor.io) 等常見的 JVM 架構無縫整合。
* **透過 OpenTelemetry 匯出程式實現可觀測性**。Koog 提供與 W&B Weave 和 Langfuse 等主流可觀測性提供商現成可用的整合功能，用於監控與偵錯 AI 應用程式。
* **LLM 切換與無縫歷程記錄調適**。Koog 允許隨時切換至具有全新工具組的不同 LLM，且不會遺失現有的對話歷程記錄。
    它還支援在多個 LLM 提供商之間重新路由，包含 OpenAI、Anthropic、Google 等。
    你也可以透過 Koog 與 Ollama 的整合，使用本機模型在本機執行代理。
* **與 JVM 和 Kotlin 應用程式整合**。Koog 專為 JVM 和 Kotlin 開發人員提供了符合慣用語法且型別安全的 DSL。
* **Model Context Protocol (MCP) 整合**。Koog 允許在代理中使用 MCP 工具。
* **知識檢索與記憶**。透過嵌入（embedding）、排序文件儲存以及共享代理記憶體，
    Koog 本身能在跨對話中主動保留知識。
* **串流功能**。Koog 具備串流支援與平行工具呼叫能力，讓開發人員能即時處理回應。

### 從何處開始 {id="where-to-start"}

* 在[概覽](https://docs.koog.ai/)中探索 Koog 的功能。
* 透過[快速入門指南](https://docs.koog.ai/quickstart/)建置你的第一個 Koog 代理。
* 在 [Koog 版本資訊](https://github.com/JetBrains/koog/releases)中查看最新更新。
* 從[範例](https://docs.koog.ai/examples/)中學習。

## Model Context Protocol (MCP) Kotlin SDK {id="model-context-protocol-mcp-kotlin-sdk"}

[MCP Kotlin SDK](https://github.com/modelcontextprotocol/kotlin-sdk) 是 Model Context Protocol 的 Kotlin Multiplatform 實作。
該 SDK 讓開發人員能夠使用 Kotlin 建置 AI 驅動應用程式，並在 JVM、WebAssembly 和 iOS 等環境中整合 LLM 介面。

使用 MCP Kotlin SDK，你可以：

* 透過將上下文處理與 LLM 互動分離，以結構化且標準化的方式為 LLM 提供上下文。
* 建置使用現有伺服器資源的 MCP 用戶端。
* 建立向 LLM 公開提示詞、工具與資源的 MCP 伺服器。
* 使用標準通訊傳輸方式，例如 stdio、SSE 和 WebSocket。
* 處理所有 MCP 協定訊息和生命週期事件。

## 探索其他 AI 驅動應用程式情境 {id="explore-other-ai-powered-application-scenarios"}

歸功於與 Java 的無縫互通性以及 Kotlin Multiplatform，你可以將 Kotlin 與成熟的 AI SDK 和架構結合使用，
建置後端與桌面/行動端 UI，並採用 RAG 及基於代理的工作流程等模式。

> 你可以在 [Kotlin-AI-Examples](https://github.com/Kotlin/Kotlin-AI-Examples) 存儲庫中探索並執行範例。
> 每個專案都是獨立完整的。你可以將各個專案作為建置 Kotlin AI 應用程式的參考或範本。

### 連線至主流模型提供商 {id="connect-to-major-model-providers"}

使用 Kotlin 連線至 OpenAI、Anthropic、Google 等主流模型提供商：

* [OpenAI](https://github.com/openai/openai-java) — OpenAI API 的官方 Java SDK。涵蓋回應與聊天、圖片和音訊。
* [Anthropic (Claude)](https://github.com/anthropics/anthropic-sdk-java) — Claude Messages API 的官方 Java SDK。包含用於 Vertex AI 和 Bedrock 整合的模組。 
* [Google AI (Gemini / Vertex AI)](https://github.com/googleapis/java-genai) — 官方 Java SDK，具備可在 Gemini API 與 Vertex AI 之間切換的單一用戶端。
* [Azure OpenAI](https://github.com/Azure/azure-sdk-for-java/tree/main/sdk/openai/azure-ai-openai) — Azure OpenAI Service 的官方 Java 用戶端。支援聊天補全與嵌入。
* [AWS Bedrock](https://github.com/aws/aws-sdk-kotlin) — 用於調用基礎模型的官方 SDK。包含適用於 Bedrock 和 Bedrock Runtime 的 Kotlin SDK 與 Java SDK。

### 建立 RAG 管線與代理型應用程式 {id="create-rag-pipelines-and-agent-based-apps"}

* [Spring AI](https://github.com/spring-projects/spring-ai) — 適用於提示詞、聊天、嵌入、工具與函式呼叫以及向量儲存的多提供商抽象層。
* [LangChain4j](https://docs.langchain4j.dev/tutorials/kotlin/) — 帶有 Kotlin 擴充套件的 JVM 工具組，適用於提示詞、工具、檢索增強生成 (RAG) 管線與代理。

## 後續步驟 {id="what-s-next"}

* 完成[建立一個使用 Spring AI 回答問題的 Kotlin 應用程式](spring-ai-guide.md)教學，深入了解如何在 IntelliJ IDEA 中搭配 Kotlin 使用 Spring AI
* 加入 [Kotlin 社群](https://kotlinlang.org/community/)，與其他使用 Kotlin 建置 AI 應用程式的開發人員交流
* 了解[可用於協助你進行 Kotlin 開發的 AI 工具](ai-for-development.md)。