# Ktor 統合: Koog プラグイン

Koog は Ktor サーバーに自然に適合し、両側からイディオマティックな Kotlin API を使用してサーバーサイド AI アプリケーションを記述できるようにします。

Koog プラグインを一度インストールし、`application.conf`/YAML またはコード内で LLM プロバイダーを設定すれば、ルートから直接エージェントを呼び出すことができます。モジュール間で LLM クライアントを接続する手間はもうありません。ルートでエージェントをリクエストするだけで、すぐに準備が整います。

## 概要

`koog-ktor` モジュールは、サーバーサイドのエージェント開発に向けた、イディオマティックな Kotlin/Ktor 統合を提供します。

- 簡単に導入できる Ktor プラグイン: Application で `install(Koog)` を実行
- OpenAI、Anthropic、Google、OpenRouter、DeepSeek、Ollama の第一級のサポート
- YAML/CONF および/またはコードによる集中管理された設定
- プロンプト、ツール、機能を使用したエージェントのセットアップ。ルート用のシンプルな拡張関数
- 直接的な LLM の使用 (`execute`、`executeStreaming`、`moderate`)
- JVM 限定の Model Context Protocol (MCP) ツール統合

## 依存関係の追加

```kotlin
dependencies {
    implementation("ai.koog:koog-ktor:$koogVersion")
}
```

## クイックスタート

1) プロバイダーの設定 (`application.yaml` または `application.conf`)

`koog.&lt;provider&gt;` の下のネストされたキーを使用します。プラグインが自動的にこれらを読み込みます。

```yaml
# application.yaml (Ktor 設定)
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
  # koog.ollama.* キーが存在する場合、Ollama が有効になります
  ollama:
    enable: true
    baseUrl: http://localhost:11434
```

オプション: リクエストされたプロバイダーが設定されていない場合に、直接的な LLM 呼び出しで使用されるフォールバックを設定します。

```yaml
koog:
  llm:
    fallback:
      provider: openai
      # 以下の「モデル識別子」セクションを参照
      model: openai.chat.gpt4_1
```

2) プラグインのインストールとルートの定義

```kotlin
fun Application.module() {
    install(Koog) {
        // プログラムによってプロバイダーを設定することも可能です（後述）
    }

    routing {
        route("/ai") {
            post("/chat") {
                val userInput = call.receiveText()
                // 特定のモデルを使用して、デフォルトのシングルランエージェントを作成し実行する
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

注意

- `aiAgent` には具体的なモデル (`LLModel`) が必要です。ルートごと、または使用ごとに選択してください。
- より低レベルな LLM アクセスには、`llm()` (`PromptExecutor`) を直接使用してください。

## ルートからの直接的な LLM の使用

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

    // すべてのアシスタントメッセージを単一の文字列に結合する
    val text = messages.joinToString(separator = "") { it.content }
    call.respond(HttpStatusCode.OK, text)
}
```

ストリーミング

```kotlin
get("/stream") {
    val flow = llm().executeStreaming(
        prompt("streaming") { user("Stream this response, please") },
        OpenRouterModels.GPT4o
    )

    // 例: バッファリングして単一のチャンクとして送信する
    val sb = StringBuilder()
    flow.collect { chunk -> sb.append(chunk) }
    call.respondText(sb.toString())
}
```

モデレーション

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

## プログラムによる設定 (コード内)

すべてのプロバイダーとエージェントの動作は `install(Koog) {}` を通じて設定できます。

```kotlin
install(Koog) {
    llm {
        openAI(apiKey = System.getenv("OPENAI_API_KEY") ?: "") {
            baseUrl = "https://api.openai.com"
            timeouts { // 以下にデフォルト値を示します
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

        // プロバイダーが設定されていない場合に PromptExecutor が使用するオプションのフォールバック
        fallback {
            provider = LLMProvider.OpenAI
            model = OpenAIModels.Chat.GPT4_1
        }
    }

    agentConfig {
        // エージェント用の再利用可能なベースプロンプトを提供
        prompt(name = "agent") {
            system("You are a helpful server‑side agent")
        }

        // ツールの暴走やループを制限
        maxAgentIterations = 10

        // デフォルトでエージェントが利用可能なツールを登録
        registerTools {
            // tool(::yourTool) // 詳細は「ツール概要」を参照
        }

        // エージェントの機能（トレーシングなど）をインストール
        // install(OpenTelemetry) { /* ... */ }
    }
}
```

## 設定におけるモデル識別子 (フォールバック)

YAML/CONF で `llm.fallback` を設定する際は、以下の識別子形式を使用してください。

- OpenAI: `openai.chat.gpt4_1`, `openai.reasoning.o3`, `openai.costoptimized.gpt4_1mini`, `openai.audio.gpt4oaudio`, `openai.moderation.omni`
- Anthropic: `anthropic.sonnet_4_5`, `anthropic.opus_4`, `anthropic.haiku_4_5`
- Google: `google.gemini2_5pro`, `google.gemini2_0flash001`
- OpenRouter: `openrouter.gpt4o`, `openrouter.gpt4`, `openrouter.claude3sonnet`
- DeepSeek: `deepseek.deepseek-v4-flash`, `deepseek.deepseek-v4-pro`, `deepseek.deepseek-chat`, `deepseek.deepseek-reasoner`
- Ollama: `ollama.meta.llama3.2`, `ollama.alibaba.qwq:32b`, `ollama.groq.llama3-grok-tool-use:8b`

注意

- OpenAI の場合、カテゴリ（chat, reasoning, costoptimized, audio, embeddings, moderation）を含める必要があります。
- Ollama の場合、`ollama.model` と `ollama.&lt;maker&gt;.&lt;model&gt;` の両方がサポートされています。

## MCP ツール (JVM 限定)

JVM では、MCP サーバーのツールをエージェントのツールレジストリに追加できます。

```kotlin
install(Koog) {
    agentConfig {
        mcp {
            // SSE 経由で登録
            sse("https://your-mcp-server.com/sse")

            // または、起動されたプロセス（stdio トランスポート）経由で登録
            // process(Runtime.getRuntime().exec("your-mcp-binary ..."))

            // または、既存の MCP クライアントインスタンスから
            // client(existingMcpClient)
        }
    }
}
```
## なぜ Koog + Ktor なのか？

- サーバーでの Kotlin ファーストかつ型安全なエージェント開発
- クリーンでテスト可能なルートコードによる集中管理された設定
- ルートごとに適切なモデルを使用、または直接的な LLM 呼び出しのために自動的にフォールバック
- 本番環境対応の機能: ツール、モデレーション、ストリーミング、トレーシング