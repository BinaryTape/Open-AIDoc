# Ktor 整合：Koog 外掛程式

Koog 自然地融入您的 Ktor 伺服器，讓您能從兩端使用道地的 Kotlin API 編寫伺服器端 AI 應用程式。

安裝一次 Koog 外掛程式，在 `application.conf`/YAML 或程式碼中配置您的 LLM 提供者，然後直接在路由中呼叫 Agent。不再需要在模組之間手動連接 LLM 用戶端 —— 您的路由只需請求一個 Agent 即可就緒。

## 總覽

`koog-ktor` 模組為伺服器端 Agent 式開發提供了道地的 Kotlin/Ktor 整合：

- 隨插即用的 Ktor 外掛程式：在您的 `Application` 中使用 `install(Koog)`
- 對 OpenAI、Anthropic、Google、OpenRouter、DeepSeek 和 Ollama 的一等公民支援
- 透過 YAML/CONF 和/或程式碼進行集中化配置
- 具備提示詞、工具、功能的 Agent 設定；針對路由的簡單擴充函式
- 直接使用 LLM（`execute`、`executeStreaming`、`moderate`）
- 僅限 JVM 的 Model Context Protocol (MCP) 工具整合

## 新增相依性

```kotlin
dependencies {
    implementation("ai.koog:koog-ktor:$koogVersion")
}
```

## 快速入門

1) 配置提供者（在 `application.yaml` 或 `application.conf` 中）

使用 `koog.&lt;provider&gt;` 下的巢狀鍵值。外掛程式會自動取得這些設定。

```yaml
# application.yaml (Ktor 配置)
koog:
  openai:
    apikey: ${OPENAI_API_KEY}
    baseUrl: https://api.openai.com
  anthropic:
    apikey: ${ANTHROPIC_API_KEY}
    baseUrl: https://api.anthropic.com
  google:
    apikey: ${GOOGLE_API_KEY}
    baseUrl: https://generativelanguage.googleapis.com
  openrouter:
    apikey: ${OPENROUTER_API_KEY}
    baseUrl: https://openrouter.ai
  deepseek:
    apikey: ${DEEPSEEK_API_KEY}
    baseUrl: https://api.deepseek.com
  # 當任何 koog.ollama.* 鍵值存在時，即啟用 Ollama
  ollama:
    enable: true
    baseUrl: http://localhost:11434
```

選用：配置當請求的提供者未配置時，直接呼叫 LLM 所使用的備援（fallback）。

```yaml
koog:
  llm:
    fallback:
      provider: openai
      # 請參閱下方的模型識別碼章節
      model: openai.chat.gpt4_1
```

2) 安裝外掛程式並定義路由

```kotlin
fun Application.module() {
    install(Koog) {
        // 您也可以透過程式化方式配置提供者（見下文）
    }

    routing {
        route("/ai") {
            post("/chat") {
                val userInput = call.receiveText()
                // 使用特定模型建立並執行預設的單次執行 Agent
                val output = aiAgent(
                    strategy = reActStrategy(),
                    model = OpenAIModels.Chat.GPT4_1,
                    input = userInput
                )
                call.respond(HttpStatusCode.OK, output)
            }
        }
    }
}
```

備註

- `aiAgent` 需要具體的模型 (`LLModel`) —— 請根據每個路由或每次使用進行選擇。
- 對於較低層級的 LLM 存取，請直接使用 `llm()` (`PromptExecutor`)。

## 從路由直接使用 LLM

```kotlin
post("/llm-chat") {
    val userInput = call.receiveText()

    val messages = llm().execute(
        prompt("chat") {
            system("You are a helpful assistant that clarifies questions")
            user(userInput)
        },
        GoogleModels.Gemini2_5Pro
    )

    // 將所有助手訊息連接成單一字串
    val text = messages.joinToString(separator = "") { it.content }
    call.respond(HttpStatusCode.OK, text)
}
```

串流

```kotlin
get("/stream") {
    val flow = llm().executeStreaming(
        prompt("streaming") { user("Stream this response, please") },
        OpenRouterModels.GPT4o
    )

    // 範例：緩衝並作為一個區塊發送
    val sb = StringBuilder()
    flow.collect { chunk -> sb.append(chunk) }
    call.respondText(sb.toString())
}
```

內容審核

```kotlin
post("/moderated-chat") {
    val userInput = call.receiveText()

    val moderation = llm().moderate(
        prompt("moderation") { user(userInput) },
        OpenAIModels.Moderation.Omni
    )

    if (moderation.isHarmful) {
        call.respond(HttpStatusCode.BadRequest, "Harmful content detected")
        return@post
    }

    val output = aiAgent(
        strategy = reActStrategy(),
        model = OpenAIModels.Chat.GPT4_1,
        input = userInput
    )
    call.respond(HttpStatusCode.OK, output)
}
```

## 程式化配置（在程式碼中）

所有提供者和 Agent 行為都可以透過 `install(Koog) {}` 進行配置。

```kotlin
install(Koog) {
    llm {
        openAI(apiKey = System.getenv("OPENAI_API_KEY") ?: "") {
            baseUrl = "https://api.openai.com"
            timeouts { // 下方顯示預設值
                requestTimeout = 15.minutes
                connectTimeout = 60.seconds
                socketTimeout = 15.minutes
            }
        }
        anthropic(apiKey = System.getenv("ANTHROPIC_API_KEY") ?: "")
        google(apiKey = System.getenv("GOOGLE_API_KEY") ?: "")
        openRouter(apiKey = System.getenv("OPENROUTER_API_KEY") ?: "")
        deepSeek(apiKey = System.getenv("DEEPSEEK_API_KEY") ?: "")
        ollama { baseUrl = "http://localhost:11434" }

        // 選用的備援，當提供者未配置時由 PromptExecutor 使用
        fallback {
            provider = LLMProvider.OpenAI
            model = OpenAIModels.Chat.GPT4_1
        }
    }

    agentConfig {
        // 為您的 Agent 提供可重複使用的基礎提示詞
        prompt(name = "agent") {
            system("You are a helpful server‑side agent")
        }

        // 限制失控的工具/迴圈
        maxAgentIterations = 10

        // 註冊預設對 Agent 可用的工具
        registerTools {
            // tool(::yourTool) // 詳情請參閱工具總覽
        }

        // 安裝 Agent 功能（追蹤等）
        // install(OpenTelemetry) { /* ... */ }
    }
}
```

## 配置中的模型識別碼（備援）

在 YAML/CONF 中配置 `llm.fallback` 時，請使用以下識別碼格式：

- OpenAI：`openai.chat.gpt4_1`、`openai.reasoning.o3`、`openai.costoptimized.gpt4_1mini`、`openai.audio.gpt4oaudio`、`openai.moderation.omni`
- Anthropic：`anthropic.sonnet_4_5`、`anthropic.opus_4`、`anthropic.haiku_4_5`
- Google：`google.gemini2_5pro`、`google.gemini2_0flash001`
- OpenRouter：`openrouter.gpt4o`、`openrouter.gpt4`、`openrouter.claude3sonnet`
- DeepSeek：`deepseek.deepseek-v4-flash`、`deepseek.deepseek-v4-pro`、`deepseek.deepseek-chat`、`deepseek.deepseek-reasoner`
- Ollama：`ollama.meta.llama3.2`、`ollama.alibaba.qwq:32b`、`ollama.groq.llama3-grok-tool-use:8b`

備註

- 對於 OpenAI，您必須包含類別（`chat`、`reasoning`、`costoptimized`、`audio`、`embeddings`、`moderation`）。
- 對於 Ollama，同時支援 `ollama.model` 和 `ollama.&lt;maker&gt;.&lt;model&gt;`。

## MCP 工具（僅限 JVM）

在 JVM 上，您可以將 MCP 伺服器中的工具新增到您的 Agent 工具註冊表（registry）中：

```kotlin
install(Koog) {
    agentConfig {
        mcp {
            // 透過 SSE 註冊
            sse("https://your-mcp-server.com/sse")

            // 或透過啟動的程序（stdio 傳輸）註冊
            // process(Runtime.getRuntime().exec("your-mcp-binary ..."))

            // 或從現有的 MCP 用戶端執行個體註冊
            // client(existingMcpClient)
        }
    }
}
```
## 為什麼選擇 Koog + Ktor？

- Kotlin 優先、類型安全的伺服器端 Agent 開發
- 集中化配置與簡潔且可測試的路由程式碼
- 為每個路由使用正確的模型，或在直接呼叫 LLM 時自動執行備援
- 生產就緒的功能：工具、內容審核、串流與追蹤