# W&B Weave 익스포터(exporter)

Koog는 관측성(observability) 데이터를 위한 개방형 표준인 [OpenTelemetry](https://opentelemetry.io/)를 사용하여 에이전트 트레이스(agent traces)를 내보냅니다.
[W&B Weave](https://wandb.ai/site/weave/)로 해당 트레이스를 전송하기 위해, Koog는 내장된 OpenTelemetry 익스포터를 제공하므로 별도의 수동 계측(instrumentation)이 필요하지 않습니다.

연결이 완료되면 Weave의 [OpenTelemetry 지원](https://weave-docs.wandb.ai/guides/tracking/otel/)을 통해 에이전트가 LLM, 도구 및 외부 API와 상호작용하는 방식을 시각화하고 분석하며 디버깅할 수 있습니다.

---

## 설정 지침

1. [https://wandb.ai](https://wandb.ai)에서 W&B 계정을 생성합니다.
2. [https://wandb.ai/authorize](https://wandb.ai/authorize)에서 API 키를 가져옵니다.
3. [W&B 대시보드](https://wandb.ai/home)에서 엔티티(entity) 이름을 찾습니다. 개인 계정인 경우 사용자 이름과 일치하며, 공유 워크스페이스인 경우 팀/조직 이름입니다.
4. 프로젝트 이름을 선택합니다. 프로젝트가 아직 존재하지 않는 경우, 첫 번째 트레이스가 전송될 때 자동으로 생성됩니다.
5. 엔티티, 프로젝트 이름 및 API 키를 [`addWeaveExporter()`](api:agents-features-opentelemetry::ai.koog.agents.features.opentelemetry.integration.weave.addWeaveExporter) 함수에 파라미터로 제공하거나, 아래와 같이 환경 변수를 통해 제공합니다.

```bash
export WEAVE_API_KEY="<your-api-key>"
export WEAVE_ENTITY="<your-entity>"
export WEAVE_PROJECT_NAME="koog-tracing"
```
<!--- KNIT example-weave-exporter-01.txt -->

## 구성

Weave 내보내기를 활성화하려면 **OpenTelemetry 피처(feature)**를 설치하고 [`addWeaveExporter()`](api:agents-features-opentelemetry::ai.koog.agents.features.opentelemetry.integration.weave.addWeaveExporter)를 호출하세요.

### 기본 예제

=== "Kotlin"

    <!--- INCLUDE
    import ai.koog.agents.core.agent.AIAgent
    import ai.koog.agents.features.opentelemetry.feature.OpenTelemetry
    import ai.koog.agents.features.opentelemetry.integration.weave.addWeaveExporter
    import ai.koog.prompt.executor.clients.openai.OpenAIModels
    import ai.koog.prompt.executor.llms.all.simpleOpenAIExecutor
    import kotlinx.coroutines.runBlocking
    val promptExecutor = simpleOpenAIExecutor("openai-api-key")
    -->
    ```kotlin
    fun main() = runBlocking {
        val entity = System.getenv()["WEAVE_ENTITY"] 
            ?: throw IllegalArgumentException("WEAVE_ENTITY is not set")
        
        val projectName = System.getenv()["WEAVE_PROJECT_NAME"] 
            ?: "koog-tracing"
        
        val agent = AIAgent(
            promptExecutor = promptExecutor,
            llmModel = OpenAIModels.Chat.GPT4oMini,
            systemPrompt = "You are a code assistant. Provide concise code examples."
        ) {
            install(OpenTelemetry) {
                addWeaveExporter()
            }
        }
    
        println("Running agent with Weave tracing")
    
        val result = agent.run("Tell me a joke about programming")
        println("Result: $result
See traces on https://wandb.ai/$entity/$projectName/weave/traces")
    }
    ```
    <!--- KNIT example-weave-exporter-01.kt -->

=== "Java"

    <!--- INCLUDE
    import ai.koog.agents.core.agent.AIAgent;
    import ai.koog.agents.features.opentelemetry.feature.OpenTelemetry;
    import ai.koog.agents.features.opentelemetry.integration.weave.WeaveKt;
    import ai.koog.prompt.executor.clients.openai.OpenAIModels;
    import ai.koog.prompt.executor.model.PromptExecutor;
    import java.util.Optional;
    public class exampleWeaveExporterJava01 {
        static PromptExecutor promptExecutor = PromptExecutor.builder()
            .openAI("openai-api-key")
            .build();
    -->
    <!--- SUFFIX
    }
    -->
    ```java
    public static void main(String[] args) {
        var entity = Optional.ofNullable(System.getenv("WEAVE_ENTITY"))
            .filter(env -> !env.isBlank())
            .orElseThrow(() -> new IllegalArgumentException("WEAVE_ENTITY is not set"));

        var projectName = Optional.ofNullable(System.getenv("WEAVE_PROJECT_NAME"))
            .filter(env -> !env.isBlank())
            .orElse("koog-tracing");

        var agent = AIAgent.builder()
            .promptExecutor(promptExecutor)
            .llmModel(OpenAIModels.Chat.GPT4oMini)
            .systemPrompt("You are a helpful assistant.")
            .install(OpenTelemetry.Feature, config ->
                WeaveKt.addWeaveExporter(
                    config,
                    null,        // weaveOtelBaseUrl: WEAVE_URL로 폴백되며, 기본값은 https://trace.wandb.ai 입니다
                    entity,
                    projectName  // 나머지 파라미터(apiKey, timeout)는 기본값을 사용합니다
                )
            )
            .build();

        System.out.println("Running agent with Weave tracing");

        var result = agent.run("Tell me a joke about programming");
        System.out.println("Result: " + result + "
See traces on https://wandb.ai/" + entity + "/" + projectName + "/weave/traces");
    }
    ```
    <!--- KNIT exampleWeaveExporterJava01.java -->

## 트레이스 대상

Weave 익스포터는 Koog의 일반 OpenTelemetry 통합과 동일한 활동을 캡처합니다.
캡처된 스팬(spans)의 전체 목록과 LLM 프롬프트 및 응답 내용을 포함하는 방법은 [트레이스 대상(What gets traced)](index.md#what-gets-traced) 섹션을 참조하세요.

W&B Weave에서 시각화하면 트레이스는 다음과 같이 나타납니다.
![W&B Weave traces](/koog/opentelemetry-weave-exporter-light.png#only-light)
![W&B Weave traces](/koog/opentelemetry-weave-exporter-dark.png#only-dark)

자세한 내용은 공식 [Weave OpenTelemetry 문서](https://weave-docs.wandb.ai/guides/tracking/otel/)를 참조하세요.

---

## 문제 해결

- **트레이스가 나타나지 않음**: `WEAVE_API_KEY`, `WEAVE_ENTITY`, `WEAVE_PROJECT_NAME`이 올바르게 설정되었는지, 그리고 W&B 계정이 지정된 엔티티 및 프로젝트에 액세스할 수 있는지 확인하세요.
- **인증 오류**: `WEAVE_API_KEY`가 유효하고 선택한 엔티티에 대해 쓰기 권한이 있는지 확인하세요.
- **연결 문제**: 사용자 환경에서 W&B의 OpenTelemetry 수집 엔드포인트에 도달할 수 있는지 확인하세요.

일반적인 문제 해결 방법은 [문제 해결(Troubleshooting)](index.md#troubleshooting)을 참조하세요.