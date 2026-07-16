# Spring Boot 整合

Koog 透過其自動組態 (auto-configuration) starter 提供無縫的 Spring Boot 整合，只需極少設定即可輕鬆將 AI agent 合併到您的 Spring Boot 應用程式中。

## 總覽

`koog-spring-boot-starter` 會根據您的應用程式屬性自動設定 LLM 用戶端，並提供現成的 bean 用於相依注入。它支援所有主流 LLM 提供者，包括：

- OpenAI
- Anthropic
- Google
- OpenRouter
- DeepSeek
- Mistral
- Ollama

## 快速入門

### 1. 新增相依性

將 Koog Spring Boot starter 新增至您的 Gradle 組建組態：

```kotlin
dependencies {
    implementation("ai.koog:koog-spring-boot-starter:$koogVersion")
}
```
<!--- KNIT example-spring-boot-01.txt -->

或使用 Maven：
```xml
<dependency>
    <groupId>ai.koog</groupId>
    <artifactId>koog-spring-boot-starter</artifactId>
    <version>$koogVersion</version>
</dependency>
```
<!--- KNIT example-spring-boot-02.txt -->

請確保您的 Kotlin 或 Java 專案具備：
- Spring Boot 3（需要 Java 17 或更高版本）
- Kotlin 版本 2.3.10+
- kotlinx-serialization 版本 1.10.0（即 kotlinx-serialization-core-jvm 與 kotlinx-serialization-json-jvm）

### 2. 設定提供者

在 `application.properties` 中設定您偏好的 LLM 提供者：

```properties
# OpenAI Configuration
ai.koog.openai.enabled=true
ai.koog.openai.api-key=${OPENAI_API_KEY}
ai.koog.openai.base-url=https://api.openai.com
# Anthropic Configuration  
ai.koog.anthropic.enabled=true
ai.koog.anthropic.api-key=${ANTHROPIC_API_KEY}
ai.koog.anthropic.base-url=https://api.anthropic.com
# Google Configuration
ai.koog.google.enabled=true
ai.koog.google.api-key=${GOOGLE_API_KEY}
ai.koog.google.base-url=https://generativelanguage.googleapis.com
# OpenRouter Configuration
ai.koog.openrouter.enabled=true
ai.koog.openrouter.api-key=${OPENROUTER_API_KEY}
ai.koog.openrouter.base-url=https://openrouter.ai
# DeepSeek Configuration
ai.koog.deepseek.enabled=true
ai.koog.deepseek.api-key=${DEEPSEEK_API_KEY}
ai.koog.deepseek.base-url=https://api.deepseek.com
# Mistral Configuration
ai.koog.mistral.enabled=true
ai.koog.mistral.api-key=${MISTRALAI_API_KEY}
ai.koog.mistral.base-url=https://api.mistral.ai
# Ollama Configuration (local - no API key required)
ai.koog.ollama.enabled=true
ai.koog.ollama.base-url=http://127.0.0.1:11434
```
<!--- KNIT example-spring-boot-03.txt -->

或使用 YAML 格式 (`application.yml`)：

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
            enabled: true # Set it to `true` explicitly to activate !!!
            base-url: http://127.0.0.1:11434
```
<!--- KNIT example-spring-boot-04.txt -->

`ai.koog.PROVIDER.api-key` 與 `ai.koog.PROVIDER.enabled` 屬性皆用於啟用提供者。

如果提供者支援 API 金鑰（如 OpenAI、Anthropic、Google），則 `ai.koog.PROVIDER.enabled` 預設為 `true`。

如果提供者不支援 API 金鑰，例如 Ollama，則 `ai.koog.PROVIDER.enabled` 預設為 `false`，且應在應用程式設定中明確啟用提供者。

提供者的基礎 URL 在 Spring Boot starter 中已設為其預設值，但您可以在應用程式中將其覆寫。

!!! tip "環境變數"

    建議使用環境變數來管理 API 金鑰，以保持其安全性並避免進入版本控制。
    Spring 設定使用 LLM 提供者眾所皆知的環境變數。
    例如，只需設定環境變數 `OPENAI_API_KEY` 即可啟用 OpenAI Spring 設定。

| LLM 提供者 | 環境變數 |
|--------------|-----------------------|
| Open AI      | `OPENAI_API_KEY`      |
| Anthropic    | `ANTHROPIC_API_KEY`   |
| Google       | `GOOGLE_API_KEY`      |
| OpenRouter   | `OPENROUTER_API_KEY`  |
| DeepSeek     | `DEEPSEEK_API_KEY`    |
| Mistral      | `MISTRALAI_API_KEY`   |

### 3. 在您的專案中使用

以下是自動組態執行器在 Spring MVC RestController 中的使用範例。它需要以下條件：
- spring-boot-starter-web 相依性
- 針對 Kotlin，應新增 kotlinx-coroutines-core 與 kotlinx-coroutines-reactor 相依性（Java 版本呼叫阻塞式 `execute` 方法）
- 透過屬性啟用了 Anthropic (ai.koog.anthropic.enabled=true)

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

Spring Framework 透過 bean 名稱 (`anthropicExecutor`) 注入了 Anthropic 的執行器，但您也可以使用 `@Qualifier` 註解來注入多個 `PromptExecutor` bean（請參閱下方的「多個 bean 錯誤」）。

## 進階用法
### LLM 提供者備援

設定多個 LLM 提供者後，您可以透過 `MultiLLMPromptExecutor` 將請求發送到多個 LLM：

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

您也可以註冊自己的 `MultiLLMPromptExecutor` bean 並將 `FallbackPromptExecutorSettings` 傳遞給它。若要覆寫 bean 的自動組態，可以使用 `@Primary` 註解。

## 設定參考

### 可用屬性

| 屬性 | 說明 | Bean 條件 | 預設值 |
|-------------------------------|---------------------|----------------------------------------|---------------------------------------------|
| `ai.koog.openai.api-key`      | OpenAI API 金鑰 | `openAIExecutor` bean 的必要項 | - |
| `ai.koog.openai.base-url`     | OpenAI 基礎 URL | 選填 | `https://api.openai.com` |
| `ai.koog.anthropic.api-key`   | Anthropic API 金鑰 | `anthropicExecutor` bean 的必要項 | - |
| `ai.koog.anthropic.base-url`  | Anthropic 基礎 URL | 選填 | `https://api.anthropic.com` |
| `ai.koog.google.api-key`      | Google API 金鑰 | `googleExecutor` bean 的必要項 | - |
| `ai.koog.google.base-url`     | Google 基礎 URL | 選填 | `https://generativelanguage.googleapis.com` |
| `ai.koog.openrouter.api-key`  | OpenRouter API 金鑰 | `openRouterExecutor` bean 的必要項 | - |
| `ai.koog.openrouter.base-url` | OpenRouter 基礎 URL | 選填 | `https://openrouter.ai` |
| `ai.koog.deepseek.api-key`    | DeepSeek API 金鑰 | `deepSeekExecutor` bean 的必要項 | - |
| `ai.koog.deepseek.base-url`   | DeepSeek 基礎 URL | 選填 | `https://api.deepseek.com` |
| `ai.koog.mistral.api-key`     | Mistral API 金鑰 | `mistralAIExecutor` bean 的必要項 | - |
| `ai.koog.mistral.base-url`    | Mistral 基礎 URL | 選填 | `https://api.mistral.ai` |
| `ai.koog.ollama.base-url`     | Ollama 基礎 URL | 選填 | `http://127.0.0.1:11434` |

### Bean 名稱

自動組態會建立以下 bean（若已設定）：

- `openAIExecutor` - OpenAI 執行器（需要 `ai.koog.openai.api-key`）
- `anthropicExecutor` - Anthropic 執行器（需要 `ai.koog.anthropic.api-key`）
- `googleExecutor` - Google 執行器（需要 `ai.koog.google.api-key`）
- `openRouterExecutor` - OpenRouter 執行器（需要 `ai.koog.openrouter.api-key`）
- `deepSeekExecutor` - DeepSeek 執行器（需要 `ai.koog.deepseek.api-key`）
- `mistralAIExecutor` - Mistral AI 執行器（需要 `ai.koog.mistral.api-key`）
- `ollamaExecutor` - Ollama 執行器（需要 `ai.koog.ollama.enabled=true`）
- `multiLLMPromptExecutor` - MultiLLMPromptExecutor

## 疑難排解

### 常見問題

**錯誤：No qualifying bean of type 'PromptExecutor' available**

**解決方案：** 請確保您已在屬性檔案中設定了至少一個提供者。

**錯誤：Multiple qualifying beans of type 'PromptExecutor' available**

**解決方案：** 使用 `@Qualifier` 來指定您想要的 bean：

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

**錯誤：API key is required but not provided**

**解決方案：** 檢查您的環境變數是否已正確設定，且您的 Spring Boot 應用程式可以存取這些變數。

## 最佳實務

1. **環境變數**：務必使用環境變數來管理 API 金鑰。
2. **可為 null 的注入**：使用可為 null 的型別來處理未設定提供者的情況。
3. **備援邏輯**：使用多個提供者時實作備援機制。
4. **錯誤處理**：在生產環境程式碼中，務必將執行器呼叫封裝在 try-catch 區塊中。
5. **測試**：在測試中使用 mock，以避免產生實際的 API 呼叫。
6. **設定驗證**：在使用執行器之前檢查其是否可用。

## 後續步驟

- 了解 [基礎 agent](agents/basic-agents.md) 以建置極簡的 AI 工作流程。
- 探索 [圖形式 agent](agents/graph-based-agents.md) 以處理進階使用案例。
- 參閱 [工具總覽](tools-overview.md) 以擴展您 agent 的功能。
- 查看 [範例](examples.md) 以了解實際的實作方式。
- 閱讀 [術語表](glossary.md) 以更深入了解框架。