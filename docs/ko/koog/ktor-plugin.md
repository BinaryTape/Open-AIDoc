# Ktor 통합: Koog 플러그인

Koog는 Ktor 서버에 자연스럽게 통합되어, 양측 모두에서 관용적인(idiomatic) Kotlin API를 사용하여 서버 사이드 AI 애플리케이션을 작성할 수 있게 해줍니다.

Koog 플러그인을 한 번 설치하고, `application.conf`/`YAML` 또는 코드에서 LLM 제공자(provider)를 설정한 다음 라우트(route)에서 바로 에이전트를 호출하세요. 더 이상 모듈 간에 LLM 클라이언트를 복잡하게 연결할 필요가 없습니다. 라우트에서 에이전트를 요청하기만 하면 바로 사용할 준비가 됩니다.

## 개요

`koog-ktor` 모듈은 서버 사이드 에이전트 개발을 위한 관용적인 Kotlin/Ktor 통합 기능을 제공합니다.

- 바로 사용 가능한 Ktor 플러그인: Application에서 `install(Koog)` 호출
- OpenAI, Anthropic, Google, OpenRouter, DeepSeek, Ollama에 대한 최고 수준의 지원
- YAML/CONF 및 코드를 통한 중앙 집중식 설정
- 프롬프트, 도구, 기능을 포함한 에이전트 설정 및 라우트를 위한 간단한 확장 함수
- 직접적인 LLM 사용 (`execute`, `executeStreaming`, `moderate`)
- JVM 전용 MCP(Model Context Protocol) 도구 통합

## 의존성 추가

```kotlin
dependencies {
    implementation("ai.koog:koog-ktor:$koogVersion")
}
```

## 빠른 시작

1) 제공자 설정 (`application.yaml` 또는 `application.conf`)

`koog.&lt;provider&gt;` 아래의 중첩된 키를 사용하세요. 플러그인이 자동으로 이를 인식합니다.

```yaml
# application.yaml (Ktor 설정)
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
  # koog.ollama.* 키가 존재하면 Ollama가 활성화됩니다.
  ollama:
    enable: true
    baseUrl: http://localhost:11434
```

선택 사항: 요청된 제공자가 설정되지 않았을 때 직접 LLM 호출에서 사용할 폴백(fallback)을 설정합니다.

```yaml
koog:
  llm:
    fallback:
      provider: openai
      # 아래의 모델 식별자 섹션을 참조하세요.
      model: openai.chat.gpt4_1
```

2) 플러그인 설치 및 라우트 정의

```kotlin
fun Application.module() {
    install(Koog) {
        // 프로그래밍 방식으로 제공자를 설정할 수도 있습니다 (아래 참조)
    }

    routing {
        route("/ai") {
            post("/chat") {
                val userInput = call.receiveText()
                // 특정 모델을 사용하여 기본 단일 실행 에이전트를 생성하고 실행합니다.
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

참고

- `aiAgent`는 구체적인 모델(`LLModel`)이 필요합니다. 라우트별 또는 용도별로 선택하세요.
- 더 낮은 수준의 LLM 액세스가 필요한 경우, `llm()`(`PromptExecutor`)을 직접 사용하세요.

## 라우트에서 직접 LLM 사용

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

    // 모든 어시스턴트 메시지를 하나의 문자열로 결합합니다.
    val text = messages.joinToString(separator = "") { it.content }
    call.respond(HttpStatusCode.OK, text)
}
```

스트리밍(Streaming)

```kotlin
get("/stream") {
    val flow = llm().executeStreaming(
        prompt("streaming") { user("Stream this response, please") },
        OpenRouterModels.GPT4o
    )

    // 예시: 버퍼링 후 하나의 청크로 전송
    val sb = StringBuilder()
    flow.collect { chunk -> sb.append(chunk) }
    call.respondText(sb.toString())
}
```

모데레이션(Moderation)

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

## 프로그래밍 방식 설정 (코드 내)

모든 제공자와 에이전트 동작은 `install(Koog) {}`를 통해 설정할 수 있습니다.

```kotlin
install(Koog) {
    llm {
        openAI(apiKey = System.getenv("OPENAI_API_KEY") ?: "") {
            baseUrl = "https://api.openai.com"
            timeouts { // 아래는 기본값입니다.
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

        // 제공자가 설정되지 않았을 때 PromptExecutor에서 사용할 선택적 폴백
        fallback {
            provider = LLMProvider.OpenAI
            model = OpenAIModels.Chat.GPT4_1
        }
    }

    agentConfig {
        // 에이전트를 위한 재사용 가능한 기본 프롬프트 제공
        prompt(name = "agent") {
            system("You are a helpful server‑side agent")
        }

        // 무한 도구 호출/루프 제한
        maxAgentIterations = 10

        // 에이전트가 기본적으로 사용할 수 있는 도구 등록
        registerTools {
            // tool(::yourTool) // 자세한 내용은 도구 개요를 참조하세요.
        }

        // 에이전트 기능 설치 (트레이싱 등)
        // install(OpenTelemetry) { /* ... */ }
    }
}
```

## 설정 내 모델 식별자 (폴백)

YAML/CONF에서 `llm.fallback`을 설정할 때 다음 식별자 형식을 사용하세요.

- OpenAI: `openai.chat.gpt4_1`, `openai.reasoning.o3`, `openai.costoptimized.gpt4_1mini`, `openai.audio.gpt4oaudio`, `openai.moderation.omni`
- Anthropic: `anthropic.sonnet_4_5`, `anthropic.opus_4`, `anthropic.haiku_4_5`
- Google: `google.gemini2_5pro`, `google.gemini2_0flash001`
- OpenRouter: `openrouter.gpt4o`, `openrouter.gpt4`, `openrouter.claude3sonnet`
- DeepSeek: `deepseek.deepseek-v4-flash`, `deepseek.deepseek-v4-pro`, `deepseek.deepseek-chat`, `deepseek.deepseek-reasoner`
- Ollama: `ollama.meta.llama3.2`, `ollama.alibaba.qwq:32b`, `ollama.groq.llama3-grok-tool-use:8b`

참고

- OpenAI의 경우 반드시 카테고리(`chat`, `reasoning`, `costoptimized`, `audio`, `embeddings`, `moderation`)를 포함해야 합니다.
- Ollama의 경우 `ollama.model` 및 `ollama.&lt;maker&gt;.&lt;model&gt;` 형식을 모두 지원합니다.

## MCP 도구 (JVM 전용)

JVM에서는 MCP 서버의 도구를 에이전트 도구 레지스트리에 추가할 수 있습니다.

```kotlin
install(Koog) {
    agentConfig {
        mcp {
            // SSE를 통해 등록
            sse("https://your-mcp-server.com/sse")

            // 또는 생성된 프로세스를 통해 등록 (stdio 전송)
            // process(Runtime.getRuntime().exec("your-mcp-binary ..."))

            // 또는 기존 MCP 클라이언트 인스턴스에서 등록
            // client(existingMcpClient)
        }
    }
}
```

## 왜 Koog + Ktor인가요?

- 서버에서 에이전트를 개발하기 위한 Kotlin 우선의 타입 안전한 환경
- 깔끔하고 테스트 가능한 라우트 코드와 중앙 집중식 설정
- 라우트별로 적합한 모델을 사용하거나, 직접 LLM 호출 시 자동으로 폴백 적용
- 도구(tools), 모데레이션(moderation), 스트리밍(streaming), 트레이싱(tracing) 등 프로덕션 환경에 적합한 기능 제공