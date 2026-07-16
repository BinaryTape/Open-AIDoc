# Spring Boot 통합

Koog는 자동 구성(auto-configuration) 스타터를 통해 원활한 Spring Boot 통합을 제공하므로, 최소한의 설정만으로 Spring Boot 애플리케이션에 AI 에이전트를 쉽게 통합할 수 있습니다.

## 개요

`koog-spring-boot-starter`는 애플리케이션 속성(properties)을 기반으로 LLM 클라이언트를 자동으로 구성하고, 의존성 주입(dependency injection)을 위해 즉시 사용 가능한 빈(bean)을 제공합니다. 다음과 같은 모든 주요 LLM 제공자를 지원합니다:

- OpenAI
- Anthropic
- Google
- OpenRouter
- DeepSeek
- Mistral
- Ollama

## 시작하기

### 1. 의존성 추가

Gradle 빌드 설정에 Koog Spring Boot 스타터를 추가합니다:

```kotlin
dependencies {
    implementation("ai.koog:koog-spring-boot-starter:$koogVersion")
}
```
<!--- KNIT example-spring-boot-01.txt -->

또는 Maven의 경우:
```xml
<dependency>
    <groupId>ai.koog</groupId>
    <artifactId>koog-spring-boot-starter</artifactId>
    <version>$koogVersion</version>
</dependency>
```
<!--- KNIT example-spring-boot-02.txt -->

사용 중인 Kotlin 또는 Java 프로젝트가 다음 요구 사항을 충족하는지 확인하세요:
- Spring Boot 3 (Java 17 이상 필요)
- Kotlin 버전 2.3.10+
- kotlinx-serialization 버전 1.10.0 (구체적으로 kotlinx-serialization-core-jvm 및 kotlinx-serialization-json-jvm)

### 2. 제공자 설정

`application.properties`에서 선호하는 LLM 제공자를 설정합니다:

```properties
# OpenAI 설정
ai.koog.openai.enabled=true
ai.koog.openai.api-key=${OPENAI_API_KEY}
ai.koog.openai.base-url=https://api.openai.com
# Anthropic 설정  
ai.koog.anthropic.enabled=true
ai.koog.anthropic.api-key=${ANTHROPIC_API_KEY}
ai.koog.anthropic.base-url=https://api.anthropic.com
# Google 설정
ai.koog.google.enabled=true
ai.koog.google.api-key=${GOOGLE_API_KEY}
ai.koog.google.base-url=https://generativelanguage.googleapis.com
# OpenRouter 설정
ai.koog.openrouter.enabled=true
ai.koog.openrouter.api-key=${OPENROUTER_API_KEY}
ai.koog.openrouter.base-url=https://openrouter.ai
# DeepSeek 설정
ai.koog.deepseek.enabled=true
ai.koog.deepseek.api-key=${DEEPSEEK_API_KEY}
ai.koog.deepseek.base-url=https://api.deepseek.com
# Mistral 설정
ai.koog.mistral.enabled=true
ai.koog.mistral.api-key=${MISTRALAI_API_KEY}
ai.koog.mistral.base-url=https://api.mistral.ai
# Ollama 설정 (로컬 - API 키 불필요)
ai.koog.ollama.enabled=true
ai.koog.ollama.base-url=http://127.0.0.1:11434
```
<!--- KNIT example-spring-boot-03.txt -->

또는 YAML 형식(`application.yml`)을 사용합니다:

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
            enabled: true # 활성화하려면 명시적으로 `true`로 설정해야 합니다 !!!
            base-url: http://127.0.0.1:11434
```
<!--- KNIT example-spring-boot-04.txt -->

`ai.koog.PROVIDER.api-key`와 `ai.koog.PROVIDER.enabled` 속성은 모두 제공자를 활성화하는 데 사용됩니다.

제공자가 API 키를 지원하는 경우(OpenAI, Anthropic, Google 등), `ai.koog.PROVIDER.enabled`는 기본적으로 `true`로 설정됩니다.

Ollama와 같이 제공자가 API 키를 지원하지 않는 경우, `ai.koog.PROVIDER.enabled`는 기본적으로 `false`로 설정되며 애플리케이션 설정에서 명시적으로 활성화해야 합니다.

제공자의 기본 URL은 Spring Boot 스타터에 기본값으로 설정되어 있지만, 애플리케이션에서 이를 재정의할 수 있습니다.

!!! tip "환경 변수"

    API 키를 안전하게 보호하고 버전 관리 시스템에 노출되지 않도록 환경 변수를 사용하는 것이 좋습니다.
    Spring 설정은 LLM 제공자의 잘 알려진 환경 변수를 사용합니다.
    예를 들어, 환경 변수 `OPENAI_API_KEY`를 설정하는 것만으로도 OpenAI Spring 설정이 활성화되기에 충분합니다.

| LLM 제공자 | 환경 변수 |
|--------------|-----------------------|
| Open AI      | `OPENAI_API_KEY`      |
| Anthropic    | `ANTHROPIC_API_KEY`   |
| Google       | `GOOGLE_API_KEY`      |
| OpenRouter   | `OPENROUTER_API_KEY`  |
| DeepSeek     | `DEEPSEEK_API_KEY`    |
| Mistral      | `MISTRALAI_API_KEY`   |

### 3. 프로젝트에서 사용하기

다음은 Spring MVC RestController에서 자동 구성된 실행기(executor)를 사용하는 예시입니다. 다음 사항들이 필요합니다:
- spring-boot-starter-web 의존성
- Kotlin의 경우 kotlinx-coroutines-core 및 kotlinx-coroutines-reactor 의존성 추가 필요 (Java 버전은 블로킹 `execute` 메서드를 호출함)
- 속성을 통해 Anthropic 활성화 (ai.koog.anthropic.enabled=true)

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

Spring Framework는 빈 이름(`anthropicExecutor`)을 통해 Anthropic용 실행기를 주입했지만, `@Qualifier` 어노테이션을 사용하여 여러 개의 `PromptExecutor` 빈을 주입할 수도 있습니다 (아래 "중복 빈 오류" 섹션 참조).

## 고급 사용법
### LLM 제공자 폴백(Fallback)

여러 LLM 제공자를 구성한 후, `MultiLLMPromptExecutor`를 통해 여러 LLM에 요청을 보낼 수 있습니다:

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

사용자 정의 `MultiLLMPromptExecutor` 빈을 직접 등록하고 `FallbackPromptExecutorSettings`를 전달할 수도 있습니다. 자동 구성을 재정의하려면 직접 만든 빈에 `@Primary` 어노테이션을 사용하면 됩니다.

## 구성 참조

### 사용 가능한 속성

| 속성 | 설명 | 빈 조건 | 기본값 |
|-------------------------------|---------------------|----------------------------------------|---------------------------------------------|
| `ai.koog.openai.api-key`      | OpenAI API 키      | `openAIExecutor` 빈을 위해 필수       | -                                           |
| `ai.koog.openai.base-url`     | OpenAI 기본 URL     | 선택 사항                               | `https://api.openai.com`                    |
| `ai.koog.anthropic.api-key`   | Anthropic API 키   | `anthropicExecutor` 빈을 위해 필수    | -                                           |
| `ai.koog.anthropic.base-url`  | Anthropic 기본 URL  | 선택 사항                               | `https://api.anthropic.com`                 |
| `ai.koog.google.api-key`      | Google API 키      | `googleExecutor` 빈을 위해 필수       | -                                           |
| `ai.koog.google.base-url`     | Google 기본 URL     | 선택 사항                               | `https://generativelanguage.googleapis.com` |
| `ai.koog.openrouter.api-key`  | OpenRouter API 키  | `openRouterExecutor` 빈을 위해 필수   | -                                           |
| `ai.koog.openrouter.base-url` | OpenRouter 기본 URL | 선택 사항                               | `https://openrouter.ai`                     |
| `ai.koog.deepseek.api-key`    | DeepSeek API 키    | `deepSeekExecutor` 빈을 위해 필수     | -                                           |
| `ai.koog.deepseek.base-url`   | DeepSeek 기본 URL   | 선택 사항                               | `https://api.deepseek.com`                  |
| `ai.koog.mistral.api-key`     | Mistral API 키     | `mistralAIExecutor` 빈을 위해 필수    | -                                           |
| `ai.koog.mistral.base-url`    | Mistral 기본 URL    | 선택 사항                               | `https://api.mistral.ai`                    |
| `ai.koog.ollama.base-url`     | Ollama 기본 URL     | 선택 사항                               | `http://127.0.0.1:11434`                    |

### 빈(Bean) 이름

자동 구성은 (설정된 경우) 다음과 같은 빈을 생성합니다:

- `openAIExecutor` - OpenAI 실행기 (`ai.koog.openai.api-key` 필요)
- `anthropicExecutor` - Anthropic 실행기 (`ai.koog.anthropic.api-key` 필요)
- `googleExecutor` - Google 실행기 (`ai.koog.google.api-key` 필요)
- `openRouterExecutor` - OpenRouter 실행기 (`ai.koog.openrouter.api-key` 필요)
- `deepSeekExecutor` - DeepSeek 실행기 (`ai.koog.deepseek.api-key` 필요)
- `mistralAIExecutor` - Mistral AI 실행기 (`ai.koog.mistral.api-key` 필요)
- `ollamaExecutor` - Ollama 실행기 (`ai.koog.ollama.enabled=true` 필요)
- `multiLLMPromptExecutor` - MultiLLMPromptExecutor

## 문제 해결

### 일반적인 문제

**오류: No qualifying bean of type 'PromptExecutor' available**

**해결 방법:** 속성 파일에 하나 이상의 제공자가 설정되어 있는지 확인하세요.

**오류: Multiple qualifying beans of type 'PromptExecutor' available**

**해결 방법:** `@Qualifier`를 사용하여 원하는 빈을 명시하세요:

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

**오류: API key is required but not provided**

**해결 방법:** 환경 변수가 제대로 설정되었고 Spring Boot 애플리케이션에서 접근 가능한지 확인하세요.

## 권장 사항

1. **환경 변수**: API 키에는 항상 환경 변수를 사용하세요.
2. **Nullable 주입**: 제공자가 설정되지 않은 경우를 처리하려면 Nullable 타입을 사용하세요.
3. **폴백 로직**: 여러 제공자를 사용할 때는 폴백 메커니즘을 구현하세요.
4. **예외 처리**: 프로덕션 코드에서는 항상 실행기 호출을 try-catch 블록으로 감싸세요.
5. **테스트**: 실제 API 호출을 피하기 위해 테스트에서는 모의 객체(mock)를 사용하세요.
6. **구성 유효성 검사**: 실행기를 사용하기 전에 사용 가능한지 확인하세요.

## 다음 단계

- 최소한의 AI 워크플로를 구축하기 위한 [기본 에이전트](agents/basic-agents.md)에 대해 알아보세요.
- 고급 사용 사례를 위한 [그래프 기반 에이전트](agents/graph-based-agents.md)를 살펴보세요.
- 에이전트의 기능을 확장하기 위한 [도구 개요](tools-overview.md)를 확인하세요.
- 실제 구현 사례는 [예제](examples.md)를 참조하세요.
- 프레임워크를 더 잘 이해하려면 [용어집](glossary.md)을 읽어보세요.