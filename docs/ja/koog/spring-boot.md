# Spring Boot 統合

Koogは、オートコンフィグレーション（自動設定）スターターを通じてシームレスなSpring Boot統合を提供します。これにより、最小限のセットアップでSpring BootアプリケーションにAIエージェントを簡単に組み込むことができます。

## 概要

`koog-spring-boot-starter` は、アプリケーションのプロパティに基づいてLLMクライアントを自動的に構成し、依存性注入（Dependency Injection）ですぐに使用できるBeanを提供します。以下を含むすべての主要なLLMプロバイダーをサポートしています。

- OpenAI
- Anthropic
- Google
- OpenRouter
- DeepSeek
- Mistral
- Ollama

## はじめに

### 1. 依存関係の追加

Gradleのビルド設定に Koog Spring Boot スターターを追加します。

```kotlin
dependencies {
    implementation("ai.koog:koog-spring-boot-starter:$koogVersion")
}
```
<!--- KNIT example-spring-boot-01.txt -->

Maven の場合は以下のように追加します。
```xml
<dependency>
    <groupId>ai.koog</groupId>
    <artifactId>koog-spring-boot-starter</artifactId>
    <version>$koogVersion</version>
</dependency>
```
<!--- KNIT example-spring-boot-02.txt -->

Kotlin または Java プロジェクトが以下の条件を満たしていることを確認してください：
- Spring Boot 3（Java 17 以上が必要）
- Kotlin バージョン 2.3.10+
- kotlinx-serialization バージョン 1.10.0（具体的には `kotlinx-serialization-core-jvm` および `kotlinx-serialization-json-jvm`）

### 2. プロバイダーの設定

`application.properties` で利用したいLLMプロバイダーを設定します。

```properties
# OpenAI の設定
ai.koog.openai.enabled=true
ai.koog.openai.api-key=${OPENAI_API_KEY}
ai.koog.openai.base-url=https://api.openai.com
# Anthropic の設定  
ai.koog.anthropic.enabled=true
ai.koog.anthropic.api-key=${ANTHROPIC_API_KEY}
ai.koog.anthropic.base-url=https://api.anthropic.com
# Google の設定
ai.koog.google.enabled=true
ai.koog.google.api-key=${GOOGLE_API_KEY}
ai.koog.google.base-url=https://generativelanguage.googleapis.com
# OpenRouter の設定
ai.koog.openrouter.enabled=true
ai.koog.openrouter.api-key=${OPENROUTER_API_KEY}
ai.koog.openrouter.base-url=https://openrouter.ai
# DeepSeek の設定
ai.koog.deepseek.enabled=true
ai.koog.deepseek.api-key=${DEEPSEEK_API_KEY}
ai.koog.deepseek.base-url=https://api.deepseek.com
# Mistral の設定
ai.koog.mistral.enabled=true
ai.koog.mistral.api-key=${MISTRALAI_API_KEY}
ai.koog.mistral.base-url=https://api.mistral.ai
# Ollama の設定 (ローカル - APIキーは不要)
ai.koog.ollama.enabled=true
ai.koog.ollama.base-url=http://127.0.0.1:11434
```
<!--- KNIT example-spring-boot-03.txt -->

または、YAML形式（`application.yml`）を使用する場合：

```yaml
ai:
    koog:
        openai:
            enabled: true
            api-key: ${OPENAI_API_KEY}
            base-url: https://api.openai.com
        anthropic:
            enabled: true
            api-key: ${ANTHROPIC_API_KEY}
            base-url: https://api.anthropic.com
        google:
            enabled: true
            api-key: ${GOOGLE_API_KEY}
            base-url: https://generativelanguage.googleapis.com
        openrouter:
            enabled: true
            api-key: ${OPENROUTER_API_KEY}
            base-url: https://openrouter.ai
        deepseek:
            enabled: true
            api-key: ${DEEPSEEK_API_KEY}
            base-url: https://api.deepseek.com
        mistral:
            enabled: true
            api-key: ${MISTRALAI_API_KEY}
            base-url: https://api.mistral.ai
        ollama:
            enabled: true # 有効にするには明示的に `true` を設定してください !!!
            base-url: http://127.0.0.1:11434
```
<!--- KNIT example-spring-boot-04.txt -->

プロバイダーを有効化するために、`ai.koog.PROVIDER.api-key` と `ai.koog.PROVIDER.enabled` の両方のプロパティが使用されます。

OpenAI、Anthropic、GoogleのようにAPIキーをサポートしているプロバイダーの場合、`ai.koog.PROVIDER.enabled` はデフォルトで `true` に設定されます。

OllamaのようにAPIキーをサポートしていないプロバイダーの場合、`ai.koog.PROVIDER.enabled` はデフォルトで `false` に設定されており、アプリケーション設定で明示的に有効にする必要があります。

プロバイダーのベースURLは、Spring Bootスターター内でデフォルト値が設定されていますが、アプリケーションで上書きすることも可能です。

!!! tip "環境変数"

    APIキーを安全に保ち、バージョン管理に含めないために、環境変数を使用することをお勧めします。
    Springの設定では、LLMプロバイダーのよく知られた環境変数を使用します。
    例えば、環境変数 `OPENAI_API_KEY` を設定するだけで、OpenAIのSpring設定がアクティブになります。

| LLMプロバイダー | 環境変数 |
|--------------|-----------------------|
| Open AI      | `OPENAI_API_KEY`      |
| Anthropic    | `ANTHROPIC_API_KEY`   |
| Google       | `GOOGLE_API_KEY`      |
| OpenRouter   | `OPENROUTER_API_KEY`  |
| DeepSeek     | `DEEPSEEK_API_KEY`    |
| Mistral      | `MISTRALAI_API_KEY`   |

### 3. プロジェクトでの使用

以下は、Spring MVCの `RestController` で自動構成されたエグゼキューターを使用する例です。これには以下のものが必要です。
- `spring-boot-starter-web` 依存関係
- Kotlin の場合、`kotlinx-coroutines-core` および `kotlinx-coroutines-reactor` 依存関係が必要（Java版はブロッキングな `execute` メソッドを呼び出します）
- プロパティで Anthropic が有効化されていること（`ai.koog.anthropic.enabled=true`）

=== "Kotlin"

    ```kotlin
    import ai.koog.prompt.dsl.prompt
    import ai.koog.prompt.executor.clients.anthropic.AnthropicModels
    import ai.koog.prompt.executor.model.PromptExecutor
    import org.springframework.http.ResponseEntity
    import org.springframework.web.bind.annotation.PostMapping
    import org.springframework.web.bind.annotation.RequestBody
    import org.springframework.web.bind.annotation.RequestMapping
    import org.springframework.web.bind.annotation.RestController

    @RestController
    @RequestMapping("/api/chat")
    class ChatController(private val anthropicExecutor: PromptExecutor) {

        @PostMapping
        suspend fun chat(@RequestBody request: ChatRequest): ResponseEntity<ChatResponse> {
            return try {
                val prompt = prompt("chat") {
                    system("You are a helpful assistant")
                    user(request.message)
                }

                val result = anthropicExecutor.execute(prompt, AnthropicModels.Haiku_4_5)
                ResponseEntity.ok(ChatResponse(result.first().content))
            } catch (e: Exception) {
                ResponseEntity.internalServerError()
                    .body(ChatResponse("Error processing request"))
            }
        }
    }

    data class ChatRequest(val message: String)
    data class ChatResponse(val response: String)
    ```
    <!--- KNIT example-spring-boot-kotlin-01.txt -->

=== "Java"

    ```java
    import ai.koog.prompt.dsl.Prompt;
    import ai.koog.prompt.executor.clients.anthropic.AnthropicModels;
    import ai.koog.prompt.executor.model.PromptExecutor;
    import ai.koog.prompt.message.Message;
    import org.springframework.http.ResponseEntity;
    import org.springframework.web.bind.annotation.PostMapping;
    import org.springframework.web.bind.annotation.RequestBody;
    import org.springframework.web.bind.annotation.RequestMapping;
    import org.springframework.web.bind.annotation.RestController;

    import java.util.List;

    @RestController
    @RequestMapping("/api/chat")
    public class ChatController {
        private final PromptExecutor anthropicExecutor;

        public ChatController(PromptExecutor anthropicExecutor) {
            this.anthropicExecutor = anthropicExecutor;
        }

        @PostMapping
        public ResponseEntity<ChatResponse> chat(@RequestBody ChatRequest request) {
            try {
                Prompt prompt = Prompt.builder("chat")
                        .system("You are a helpful assistant")
                        .user(request.message())
                        .build();

                `List<Message.Response>` result = anthropicExecutor.execute(prompt, AnthropicModels.Haiku_4_5);
                return ResponseEntity.ok(new ChatResponse(result.get(0).getContent()));
            } catch (Exception e) {
                return ResponseEntity.internalServerError()
                        .body(new ChatResponse("Error processing request"));
            }
        }
    }

    record ChatRequest(String message) {
    }

    record ChatResponse(String response) {
    }
    ```
    <!--- KNIT example-spring-boot-java-01.txt -->

Spring Framework は Bean 名（`anthropicExecutor`）によって Anthropic のエグゼキューターを注入しましたが、`@Qualifier` アノテーションを使用して複数の `PromptExecutor` Bean を注入することも可能です（下記の「複数の Bean エラー」を参照）。

## 高度な使い方
### LLM プロバイダーのフォールバック

複数の LLM プロバイダーを設定した後、`MultiLLMPromptExecutor` を介して複数の LLM にリクエストを送信できます。

=== "Kotlin"

    ```kotlin
    import ai.koog.prompt.dsl.prompt
    import ai.koog.prompt.executor.clients.anthropic.AnthropicModels.Haiku_4_5
    import ai.koog.prompt.executor.clients.openai.OpenAIModels.Chat.GPT4oMini
    import ai.koog.prompt.executor.clients.openrouter.OpenRouterModels.Claude3Haiku
    import ai.koog.prompt.executor.llms.MultiLLMPromptExecutor
    import org.slf4j.Logger
    import org.slf4j.LoggerFactory
    import org.springframework.stereotype.Service

    @Service
    class RobustAIService(private val multiLLMPromptExecutor: MultiLLMPromptExecutor) {

        private val llms = listOf(GPT4oMini, Haiku_4_5, Claude3Haiku)

        suspend fun generateWithFallback(input: String): String {
            val prompt = prompt("robust") {
                system("You are a helpful AI assistant")
                user(input)
            }

            for (llm in llms) {
                try {
                    val result = multiLLMPromptExecutor.execute(prompt, llm)
                    return result.first().content
                } catch (e: Exception) {
                    logger.warn("{} executor failed, trying next: {}", llm.id, e.message)
                }
            }

            throw IllegalStateException("All AI providers failed")
        }

        companion object {
            private val logger = LoggerFactory.getLogger(RobustAIService::class.java)
        }
    }
    ```
    <!--- KNIT example-spring-boot-kotlin-02.txt -->

=== "Java"

    ```java
    import ai.koog.prompt.dsl.Prompt;
    import ai.koog.prompt.executor.clients.anthropic.AnthropicModels;
    import ai.koog.prompt.executor.clients.openai.OpenAIModels;
    import ai.koog.prompt.executor.clients.openrouter.OpenRouterModels;
    import ai.koog.prompt.executor.llms.MultiLLMPromptExecutor;
    import ai.koog.prompt.llm.LLModel;
    import ai.koog.prompt.message.Message;
    import org.slf4j.Logger;
    import org.slf4j.LoggerFactory;
    import org.springframework.stereotype.Service;

    import java.util.List;

    @Service
    public class RobustAIService {
        private static final Logger logger = LoggerFactory.getLogger(RobustAIService.class);

        private final `List<LLModel>` llms = List.of(OpenAIModels.Chat.GPT4oMini, AnthropicModels.Haiku_4_5, OpenRouterModels.Claude3Haiku);

        private final MultiLLMPromptExecutor multiLLMPromptExecutor;

        public RobustAIService(MultiLLMPromptExecutor multiLLMPromptExecutor) {
            this.multiLLMPromptExecutor = multiLLMPromptExecutor;
        }

        public String generateWithFallback(String input) {
            Prompt prompt = Prompt.builder("robust")
                .system("You are a helpful AI assistant")
                .user(input)
                .build();

            for (LLModel llm : llms) {
                try {
                    `List<Message.Response>` result = multiLLMPromptExecutor.execute(prompt, llm);
                    return result.get(0).getContent();
                } catch (Exception e) {
                    logger.warn("{} executor failed, trying next: {}", llm.getId(), e.getMessage());
                }
            }

            throw new IllegalStateException("All AI providers failed");
        }
    }
    ```
    <!--- KNIT example-spring-boot-java-02.txt -->

独自の `MultiLLMPromptExecutor` Bean を登録し、それに `FallbackPromptExecutorSettings` を渡すこともできます。オートコンフィグレーションを独自の Bean で上書きするには、`@Primary` アノテーションを使用できます。

## 設定リファレンス

### 利用可能なプロパティ

| プロパティ | 説明 | Bean の条件 | デフォルト値 |
|-------------------------------|---------------------|----------------------------------------|---------------------------------------------|
| `ai.koog.openai.api-key`      | OpenAI API キー     | `openAIExecutor` Bean に必要           | -                                           |
| `ai.koog.openai.base-url`     | OpenAI ベース URL    | オプション                             | `https://api.openai.com`                    |
| `ai.koog.anthropic.api-key`   | Anthropic API キー  | `anthropicExecutor` Bean に必要        | -                                           |
| `ai.koog.anthropic.base-url`  | Anthropic ベース URL | オプション                             | `https://api.anthropic.com`                 |
| `ai.koog.google.api-key`      | Google API キー     | `googleExecutor` Bean に必要           | -                                           |
| `ai.koog.google.base-url`     | Google ベース URL    | オプション                             | `https://generativelanguage.googleapis.com` |
| `ai.koog.openrouter.api-key`  | OpenRouter API キー | `openRouterExecutor` Bean に必要       | -                                           |
| `ai.koog.openrouter.base-url` | OpenRouter ベース URL| オプション                             | `https://openrouter.ai`                     |
| `ai.koog.deepseek.api-key`    | DeepSeek API キー   | `deepSeekExecutor` Bean に必要         | -                                           |
| `ai.koog.deepseek.base-url`   | DeepSeek ベース URL  | オプション                             | `https://api.deepseek.com`                  |
| `ai.koog.mistral.api-key`     | Mistral API キー     | `mistralAIExecutor` Bean に必要        | -                                           |
| `ai.koog.mistral.base-url`    | Mistral ベース URL    | オプション                             | `https://api.mistral.ai`                    |
| `ai.koog.ollama.base-url`     | Ollama ベース URL    | オプション                             | `http://127.0.0.1:11434`                    |

### Bean 名

自動構成により、（設定されている場合）以下の Bean が作成されます。

- `openAIExecutor` - OpenAI エグゼキューター (`ai.koog.openai.api-key` が必要)
- `anthropicExecutor` - Anthropic エグゼキューター (`ai.koog.anthropic.api-key` が必要)
- `googleExecutor` - Google エグゼキューター (`ai.koog.google.api-key` が必要)
- `openRouterExecutor` - OpenRouter エグゼキューター (`ai.koog.openrouter.api-key` が必要)
- `deepSeekExecutor` - DeepSeek エグゼキューター (`ai.koog.deepseek.api-key` が必要)
- `mistralAIExecutor` - Mistral AI エグゼキューター (`ai.koog.mistral.api-key` が必要)
- `ollamaExecutor` - Ollama エグゼキューター (`ai.koog.ollama.enabled=true` が必要)
- `multiLLMPromptExecutor` - MultiLLMPromptExecutor

## トラブルシューティング

### よくある問題

**エラー: No qualifying bean of type 'PromptExecutor' available**

**解決策:** プロパティファイルで少なくとも1つのプロバイダーが設定されていることを確認してください。

**エラー: Multiple qualifying beans of type 'PromptExecutor' available**

**解決策:** `@Qualifier` を使用して、どの Bean を使用するか指定してください。

=== "Kotlin"

    ```kotlin
    @Service
    class MyService(
        @Qualifier("openAIExecutor") private val openAIExecutor: PromptExecutor,
        @Qualifier("anthropicExecutor") private val anthropicExecutor: PromptExecutor
    ) {
        // ...
    }
    ```
    <!--- KNIT example-spring-boot-kotlin-03.txt -->

=== "Java"

    ```java
    @Service
    public class MyService {
        private final PromptExecutor openAIExecutor;
        private final PromptExecutor anthropicExecutor;

        public MyService(@Qualifier("openAIExecutor") PromptExecutor openAIExecutor,
                         @Qualifier("anthropicExecutor") PromptExecutor anthropicExecutor) {
            this.openAIExecutor = openAIExecutor;
            this.anthropicExecutor = anthropicExecutor;
        }
        // ...
    }
    ```
    <!--- KNIT example-spring-boot-java-03.txt -->

**エラー: API key is required but not provided**

**解決策:** 環境変数が正しく設定され、Spring Boot アプリケーションからアクセス可能であることを確認してください。

## ベストプラクティス

1. **環境変数**: API キーには常に環境変数を使用してください。
2. **Nullable な注入**: プロバイダーが設定されていないケースを処理するために、Nullable 型を使用してください。
3. **フォールバックロジック**: 複数のプロバイダーを使用する場合は、フォールバックメカニズムを実装してください。
4. **エラーハンドリング**: 本番環境のコードでは、エグゼキューターの呼び出しを常に try-catch ブロックで囲んでください。
5. **テスト**: 実際の API 呼び出しを避けるため、テストではモックを使用してください。
6. **設定の検証**: 使用する前にエグゼキューターが利用可能かどうかを確認してください。

## 次のステップ

- [基本的なエージェント](agents/basic-agents.md) について学び、最小限の AI ワークフローを構築する
- 高度なユースケースのために [グラフベースのエージェント](agents/graph-based-agents.md) を探索する
- エージェントの機能を拡張するために [ツールの概要](tools-overview.md) を参照する
- 実践的な実装については [サンプル](examples.md) を確認する
- フレームワークをより深く理解するために [用語集](glossary.md) を読む