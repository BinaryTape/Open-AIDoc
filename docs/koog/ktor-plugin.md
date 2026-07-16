# Ktor 集成：Koog 插件

Koog 自然地融入您的 Ktor 服务器，允许您在两端使用惯用的 Kotlin API 编写服务器端 AI 应用。

只需安装一次 Koog 插件，在 `application.conf`/YAML 或代码中配置您的 LLM 提供者，然后直接从您的路由中调用 Agent。不再需要跨模块连接 LLM 客户端——您的路由只需请求一个 Agent 即可准备就绪。

## 概览

`koog-ktor` 模块为服务器端智能体 (agentic) 开发提供惯用的 Kotlin/Ktor 集成：

- 即插即用的 Ktor 插件：在您的 Application 中执行 `install(Koog)`
- 对 OpenAI、Anthropic、Google、OpenRouter、DeepSeek 和 Ollama 的一流支持
- 通过 YAML/CONF 和/或代码进行集中式配置
- 使用提示词、工具、功能设置 Agent；为路由提供简单的扩展函数
- 直接使用 LLM（execute、executeStreaming、moderate）
- 仅限 JVM 的模型上下文协议 (MCP) 工具集成

## 添加依赖项

```kotlin
dependencies {
    implementation("ai.koog:koog-ktor:$koogVersion")
}
```

## 快速入门

1) 配置提供者（在 `application.yaml` 或 `application.conf` 中）

使用 `koog.&lt;provider&gt;` 下的嵌套键。插件会自动获取它们。

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
  # 当存在任何 koog.ollama.* 键时，Ollama 就会启用
  ollama:
    enable: true
    baseUrl: http://localhost:11434
```

可选：配置当请求的提供者未配置时，直接 LLM 调用所使用的回退 (fallback)。

```yaml
koog:
  llm:
    fallback:
      provider: openai
      # 参见下文的模型标识符部分
      model: openai.chat.gpt4_1
```

2) 安装插件并定义路由

```kotlin
fun Application.module() {
    install(Koog) {
        // 您也可以通过编程方式配置提供者（见下文）
    }

    routing {
        route("/ai") {
            post("/chat") {
                val userInput = call.receiveText()
                // 使用特定模型创建并运行默认的单次运行 Agent
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

注意事项

- aiAgent 需要一个具体的模型 (LLModel) —— 按路由或按用途选择。
- 对于更底层的 LLM 访问，直接使用 llm() (PromptExecutor) 。

## 直接从路由使用 LLM

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

    // 将所有助手消息连接成一个字符串
    val text = messages.joinToString(separator = "") { it.content }
    call.respond(HttpStatusCode.OK, text)
}
```

流式传输

```kotlin
get("/stream") {
    val flow = llm().executeStreaming(
        prompt("streaming") { user("Stream this response, please") },
        OpenRouterModels.GPT4o
    )

    // 示例：缓冲并作为一个块发送
    val sb = StringBuilder()
    flow.collect { chunk -> sb.append(chunk) }
    call.respondText(sb.toString())
}
```

审核

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

## 代码编程配置（在代码中）

所有的提供者和 Agent 行为都可以通过 install(Koog) {} 进行配置。

```kotlin
install(Koog) {
    llm {
        openAI(apiKey = System.getenv("OPENAI_API_KEY") ?: "") {
            baseUrl = "https://api.openai.com"
            timeouts { // 下面显示了默认值
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

        // 可选：当提供者未配置时，PromptExecutor 使用的回退
        fallback {
            provider = LLMProvider.OpenAI
            model = OpenAIModels.Chat.GPT4_1
        }
    }

    agentConfig {
        // 为您的 Agent 提供可重用的基础提示词
        prompt(name = "agent") {
            system("You are a helpful server‑side agent")
        }

        // 限制失控的工具/循环
        maxAgentIterations = 10

        // 注册 Agent 默认可用的工具
        registerTools {
            // tool(::yourTool) // 详情请参阅工具概览
        }

        // 安装 Agent 功能（跟踪等）
        // install(OpenTelemetry) { /* ... */ }
    }
}
```

## 配置中的模型标识符 (回退)

在 YAML/CONF 中配置 llm.fallback 时，请使用以下标识符格式：

- OpenAI: openai.chat.gpt4_1, openai.reasoning.o3, openai.costoptimized.gpt4_1mini, openai.audio.gpt4oaudio, openai.moderation.omni
- Anthropic: anthropic.sonnet_4_5, anthropic.opus_4, anthropic.haiku_4_5
- Google: google.gemini2_5pro, google.gemini2_0flash001
- OpenRouter: openrouter.gpt4o, openrouter.gpt4, openrouter.claude3sonnet
- DeepSeek: deepseek.deepseek-v4-flash, deepseek.deepseek-v4-pro, deepseek.deepseek-chat, deepseek.deepseek-reasoner
- Ollama: ollama.meta.llama3.2, ollama.alibaba.qwq:32b, ollama.groq.llama3-grok-tool-use:8b

注意

- 对于 OpenAI，您必须包含类别 (chat, reasoning, costoptimized, audio, embeddings, moderation)。
- 对于 Ollama，同时支持 ollama.model 和 ollama.&lt;maker&gt;.&lt;model&gt;。

## MCP 工具（仅限 JVM）

在 JVM 上，您可以将来自 MCP 服务器的工具添加到您的 Agent 工具注册表中：

```kotlin
install(Koog) {
    agentConfig {
        mcp {
            // 通过 SSE 注册
            sse("https://your-mcp-server.com/sse")

            // 或通过生成的进程注册 (stdio 传输)
            // process(Runtime.getRuntime().exec("your-mcp-binary ..."))

            // 或从现有的 MCP 客户端实例注册
            // client(existingMcpClient)
        }
    }
}
```
## 为什么选择 Koog + Ktor？

- 在服务器中使用 Kotlin 优先、类型安全的方式开发 Agent
- 集中式配置，配合简洁且可测试的路由代码
- 为每个路由使用合适的模型，或者在直接调用 LLM 时自动回退
- 生产就绪的功能：工具、审核、流式传输和跟踪 (tracing)