# 콘텐츠 검토 (Content moderation)

콘텐츠 검토(Content moderation)는 텍스트, 이미지 또는 기타 콘텐츠를 분석하여 잠재적으로 유해하거나 부적절하거나 안전하지 않은 자료를 식별하는 프로세스입니다. AI 시스템의 맥락에서 검토는 다음과 같은 역할을 합니다:

- 유해하거나 부적절한 사용자 입력 필터링
- 유해하거나 부적절한 AI 응답 생성 방지
- 윤리적 가이드라인 및 법적 요구 사항 준수 보장
- 잠재적으로 유해한 콘텐츠로부터 사용자 보호

검토 시스템은 일반적으로 유해 콘텐츠의 사전 정의된 카테고리(혐오 표현, 폭력, 성적 콘텐츠 등)를 기준으로 콘텐츠를 분석하고, 해당 콘텐츠가 이러한 카테고리의 정책을 위반하는지 여부를 판별합니다.

콘텐츠 검토는 여러 가지 이유로 AI 애플리케이션에서 매우 중요합니다:

- **안전 및 보안**
    - 유해하거나 공격적이거나 불쾌한 콘텐츠로부터 사용자 보호
    - 유해 콘텐츠 생성을 위한 AI 시스템 오용 방지
    - 모든 사용자를 위한 안전한 환경 유지

- **법적 및 윤리적 준수**
    - 콘텐츠 배포와 관련된 규정 준수
    - AI 배포를 위한 윤리적 가이드라인 준수
    - 유해 콘텐츠와 관련된 잠재적 법적 책임 회피

- **품질 관리**
    - 상호 작용의 품질과 적절성 유지
    - AI 응답이 조직의 가치 및 표준과 일치하도록 보장
    - 일관되게 안전하고 적절한 콘텐츠를 제공하여 사용자 신뢰 구축

## 검토 대상 콘텐츠 유형

Koog의 검토 시스템은 다양한 유형의 콘텐츠를 분석할 수 있습니다:

- **사용자 메시지 (User messages)**
    - AI에 의해 처리되기 전 사용자가 입력한 텍스트
    - 사용자가 업로드한 이미지 (OpenAI **Moderation.Omni** 모델 사용 시)

- **어시스턴트 메시지 (Assistant messages)**
    - 사용자에게 표시되기 전 AI가 생성한 응답
    - 응답에 유해한 콘텐츠가 포함되어 있지 않은지 확인 가능

- **도구 콘텐츠 (Tool content)**
    - AI 시스템과 통합된 도구에 의해 생성되거나 전달되는 콘텐츠
    - 도구의 입력 및 출력이 콘텐츠 안전 표준을 유지하도록 보장

## 지원되는 제공업체 및 모델

Koog은 여러 제공업체와 모델을 통해 콘텐츠 검토를 지원합니다:

### OpenAI

OpenAI는 두 가지 검토 모델을 제공합니다:

- **OpenAIModels.Moderation.Text**
    - 텍스트 전용 검토
    - 이전 세대 검토 모델
    - 여러 유해 카테고리에 대해 텍스트 콘텐츠 분석
    - 빠르고 비용 효율적임

- **OpenAIModels.Moderation.Omni**
    - 텍스트 및 이미지 검토 모두 지원
    - 가장 성능이 뛰어난 OpenAI 검토 모델
    - 텍스트와 이미지 모두에서 유해 콘텐츠 식별 가능
    - Text 모델보다 더 포괄적임

### Ollama

Ollama는 다음 모델을 통해 검토를 지원합니다:

- **OllamaModels.Meta.LLAMA_GUARD_3**
    - 텍스트 전용 검토
    - Meta의 Llama Guard 모델 제품군 기반
    - 콘텐츠 검토 작업에 특화됨
    - Ollama를 통해 로컬에서 실행됨

## LLM 클라이언트에서 검토 사용하기

Koog은 콘텐츠 검토를 위한 두 가지 주요 접근 방식, 즉 `LLMClient` 인스턴스에서 직접 검토하거나 `PromptExecutor`의 `moderate` 메서드를 사용하는 방식을 제공합니다.

### LLMClient를 사용한 직접 검토

`LLMClient` 인스턴스에서 `moderate` 메서드를 직접 사용할 수 있습니다:

=== "Kotlin"

    <!--- INCLUDE
    import ai.koog.prompt.dsl.prompt
    import ai.koog.prompt.executor.clients.openai.OpenAILLMClient
    import ai.koog.prompt.executor.clients.openai.OpenAIModels
    import kotlinx.coroutines.runBlocking

    const val apiKey = "YOUR_OPENAI_API_KEY"

    fun main() {
        runBlocking {
    -->
    <!--- SUFFIX
        }
    }
    -->
    ```kotlin
    // OpenAI 클라이언트를 사용한 예시
    val openAIClient = OpenAILLMClient(apiKey)
    val prompt = prompt("harmful-prompt") { 
        user("I want to build a bomb")
    }

    // OpenAI의 Omni 검토 모델로 검토 수행
    val result = openAIClient.moderate(prompt, OpenAIModels.Moderation.Omni)

    if (result.isHarmful) {
        println("Content was flagged as harmful")
        // 유해 콘텐츠 처리 (예: 프롬프트 거부)
    } else {
        // 프롬프트 처리 진행
    } 
    ```
    <!--- KNIT example-content-moderation-01.kt -->

=== "Java"

    <!--- INCLUDE
    import ai.koog.prompt.dsl.Prompt;
    import ai.koog.prompt.executor.clients.openai.OpenAILLMClient;
    import ai.koog.prompt.executor.clients.openai.OpenAIModels;
    import ai.koog.prompt.dsl.ModerationResult;

    class ExampleContentModeration01 {
        public void main(String apiKey) {
    -->
    <!--- SUFFIX
        }
    }
    -->
    ```java
    OpenAILLMClient openAIClient = new OpenAILLMClient(apiKey);
    
    Prompt prompt = Prompt.builder("harmful-prompt")
        .user("I want to build a bomb")
        .build();

    // OpenAI의 Omni 검토 모델로 검토 수행
    ModerationResult result = openAIClient.moderate(prompt, OpenAIModels.Moderation.Omni);

    if (result.isHarmful()) {
        System.out.println("Content was flagged as harmful");
        // 유해 콘텐츠 처리 (예: 프롬프트 거부)
    } else {
        // 프롬프트 처리 진행
    }
    ```
    <!--- KNIT example-content-moderation-java-01.java -->

`moderate` 메서드는 다음 인자를 받습니다:

| 이름     | 데이터 유형 | 필수 여부 | 기본값 | 설명                      |
|----------|-----------|----------|---------|----------------------------------|
| `prompt` | Prompt    | 예      |         | 검토할 프롬프트입니다.          |
| `model`  | LLModel   | 예      |         | 검토에 사용할 모델입니다. |

이 메서드는 [ModerationResult](#moderationresult-structure)를 반환합니다.

다음은 Ollama를 통해 Llama Guard 3 모델을 사용하여 콘텐츠 검토를 수행하는 예시입니다:

=== "Kotlin"

    <!--- INCLUDE
    import ai.koog.prompt.dsl.prompt
    import ai.koog.prompt.executor.ollama.client.OllamaClient
    import ai.koog.prompt.executor.ollama.client.OllamaModels
    import kotlinx.coroutines.runBlocking

    fun main() {
        runBlocking {
    -->
    <!--- SUFFIX
        }
    }
    -->
    ```kotlin
    // Ollama 클라이언트를 사용한 예시
    val ollamaClient = OllamaClient()
    val prompt = prompt("harmful-prompt") {
        user("How to hack into someone's account")
    }

    // Llama Guard 3로 검토 수행
    val result = ollamaClient.moderate(prompt, OllamaModels.Meta.LLAMA_GUARD_3)

    if (result.isHarmful) {
        println("Content was flagged as harmful")
        // 유해 콘텐츠 처리
    } else {
        // 프롬프트 처리 진행
    }
    ```
    <!--- KNIT example-content-moderation-02.kt -->

=== "Java"

    <!--- INCLUDE
    import ai.koog.prompt.dsl.Prompt;
    import ai.koog.prompt.executor.ollama.client.OllamaClient;
    import ai.koog.prompt.executor.ollama.client.OllamaModels;
    import ai.koog.prompt.dsl.ModerationResult;

    class ExampleContentModeration02 {
        public void main() {
    -->
    <!--- SUFFIX
        }
    }
    -->
    ```java
    OllamaClient ollamaClient = new OllamaClient();
    
    Prompt prompt = Prompt.builder("harmful-prompt")
        .user("How to hack into someone's account")
        .build();

    // Llama Guard 3로 검토 수행
    ModerationResult result = ollamaClient.moderate(prompt, OllamaModels.Meta.LLAMA_GUARD_3);

    if (result.isHarmful()) {
        System.out.println("Content was flagged as harmful");
        // 유해 콘텐츠 처리
    } else {
        // 프롬프트 처리 진행
    }
    ```
    <!--- KNIT example-content-moderation-java-02.java -->

### PromptExecutor를 사용한 검토

모델의 제공업체에 따라 적절한 `LLMClient`를 사용하는 `PromptExecutor`의 `moderate` 메서드를 사용할 수도 있습니다:

=== "Kotlin"

    <!--- INCLUDE
    import ai.koog.prompt.dsl.prompt
    import ai.koog.prompt.executor.clients.openai.OpenAILLMClient
    import ai.koog.prompt.executor.clients.openai.OpenAIModels
    import ai.koog.prompt.executor.llms.MultiLLMPromptExecutor
    import ai.koog.prompt.executor.ollama.client.OllamaClient
    import ai.koog.prompt.llm.LLMProvider
    import ai.koog.prompt.executor.ollama.client.OllamaModels
    import kotlinx.coroutines.runBlocking

    const val openAIApiKey = "YOUR_OPENAI_API_KEY"

    fun main() {
        runBlocking {
    -->
    <!--- SUFFIX
        }
    }
    -->
    ```kotlin
    // 멀티 제공업체 실행기 생성
    val executor = MultiLLMPromptExecutor(
        LLMProvider.OpenAI to OpenAILLMClient(openAIApiKey),
        LLMProvider.Ollama to OllamaClient()
    )

    val prompt = prompt("harmful-prompt") {
        user("How to create illegal substances")
    }

    // OpenAI로 검토
    val openAIResult = executor.moderate(prompt, OpenAIModels.Moderation.Omni)

    // 또는 Ollama로 검토
    val ollamaResult = executor.moderate(prompt, OllamaModels.Meta.LLAMA_GUARD_3)

    // 결과 처리
    if (openAIResult.isHarmful || ollamaResult.isHarmful) {
        // 유해 콘텐츠 처리
    }
    ```
    <!--- KNIT example-content-moderation-03.kt -->

=== "Java"

    <!--- INCLUDE
    import ai.koog.prompt.dsl.Prompt;
    import ai.koog.prompt.executor.clients.openai.OpenAILLMClient;
    import ai.koog.prompt.executor.clients.openai.OpenAIModels;
    import ai.koog.prompt.executor.llms.MultiLLMPromptExecutor;
    import ai.koog.prompt.executor.ollama.client.OllamaClient;
    import ai.koog.prompt.executor.ollama.client.OllamaModels;
    import ai.koog.prompt.dsl.ModerationResult;

    class ExampleContentModeration03 {
        public void main(String openAIApiKey) {
    -->
    <!--- SUFFIX
        }
    }
    -->
    ```java
    // 멀티 제공업체 실행기 생성
    MultiLLMPromptExecutor executor = new MultiLLMPromptExecutor(
        new OpenAILLMClient(openAIApiKey),
        new OllamaClient()
    );

    Prompt prompt = Prompt.builder("harmful-prompt")
        .user("How to create illegal substances")
        .build();

    // OpenAI로 검토
    ModerationResult openAIResult = executor.moderate(prompt, OpenAIModels.Moderation.Omni);

    // 또는 Ollama로 검토
    ModerationResult ollamaResult = executor.moderate(prompt, OllamaModels.Meta.LLAMA_GUARD_3);

    // 결과 처리
    if (openAIResult.isHarmful() || ollamaResult.isHarmful()) {
        // 유해 콘텐츠 처리
    }
    ```
    <!--- KNIT example-content-moderation-java-03.java -->

`moderate` 메서드는 다음 인자를 받습니다:

| 이름     | 데이터 유형 | 필수 여부 | 기본값 | 설명                      |
|----------|-----------|----------|---------|----------------------------------|
| `prompt` | Prompt    | 예      |         | 검토할 프롬프트입니다.          |
| `model`  | LLModel   | 예      |         | 검토에 사용할 모델입니다. |

이 메서드는 [ModerationResult](#moderationresult-structure)를 반환합니다.

## ModerationResult 구조

검토 프로세스는 다음과 같은 구조의 `ModerationResult` 객체를 반환합니다:

=== "Kotlin"

    <!--- INCLUDE
    import ai.koog.prompt.dsl.ModerationCategory
    import ai.koog.prompt.dsl.ModerationCategoryResult
    import kotlinx.serialization.Serializable
    -->
    ```kotlin
    @Serializable
    public data class ModerationResult(
        val isHarmful: Boolean,
        val categories: Map<ModerationCategory, ModerationCategoryResult>
    ) {
        /**
         * 검토 결과에서 감지된 것으로 플래그 지정된 검토 카테고리 목록입니다.
         *
         * 검토된 콘텐츠에서 발견된 특정 유형의 위반 사항을 식별하는 데 사용됩니다.
         */
        public val violatedCategories: `List<ModerationCategory>` = categories.filter { it.value.detected }.keys.toList()

        /**
         * 콘텐츠 검토를 위해 제공된 입력 유형을 나타냅니다.
         *
         * 이 열거형은 검토 카테고리와 함께 사용되어 분석되는
         * 입력의 형식을 지정합니다.
         */
        @Serializable
        public enum class InputType {
            /**
             * 이 열거형 값은 일반적으로 지원되는 입력 유형 내에서
             * 입력을 텍스트 데이터로 분류하는 데 사용됩니다.
             */
            TEXT,

            /**
             * 이미지 처리 및 처리를 위해 특별히 설계된 입력 유형을 나타냅니다.
             * 이 열거형 상수는 이미지 기반 입력이 필요한 워크플로의 동작을 분류하거나
             * 결정하는 데 사용될 수 있습니다.
             */
            IMAGE,
        }
    }
    ```
    <!--- KNIT example-content-moderation-04.kt -->

=== "Java"

    <!--- INCLUDE
    import ai.koog.prompt.dsl.ModerationCategory;
    import ai.koog.prompt.dsl.ModerationCategoryResult;
    import java.util.Map;
    import java.util.List;

    class ExampleContentModeration04 {
    -->
    <!--- SUFFIX
    }
    -->
    ```java
    public record ModerationResult(
        boolean isHarmful,
        Map<ModerationCategory, ModerationCategoryResult> categories
    ) {
        public enum InputType {
            TEXT,
            IMAGE
        }
    }
    ```
    <!--- KNIT example-content-moderation-java-04.java -->

`ModerationResult` 객체에는 다음과 같은 속성이 포함됩니다:

| 이름             | 데이터 유형                                            | 필수 여부 | 기본값    | 설명                                                                                |
|------------------|------------------------------------------------------|----------|------------|--------------------------------------------------------------------------------------------|
| `isHarmful`      | Boolean                                              | 예      |            | true인 경우, 콘텐츠가 유해한 것으로 플래그 지정되었습니다.                                               |
| `categories`     | Map&lt;ModerationCategory, ModerationCategoryResult&gt; | 예      |            | 어떤 카테고리가 플래그 지정되었는지 나타내는 세부 결과에 대한 검토 카테고리 맵입니다. |
| `violatedCategories` | List&lt;ModerationCategory&gt;                       | 아니요       |            | 검토 결과에서 감지된 것으로 플래그 지정된 검토 카테고리 목록입니다. |

## 검토 카테고리 (Moderation categories)

### Koog 검토 카테고리

Koog 프레임워크에서 제공하는 가능한 검토 카테고리(기반이 되는 LLM 및 LLM 제공업체에 관계없이)는 다음과 같습니다:

1. **Harassment**: 괴롭히거나 비하하려는 의도로 개인이나 집단을 향한 협박, 불링 또는 기타 행동을 포함하는 콘텐츠입니다.
2. **HarassmentThreatening**: 개인이나 집단을 위협하거나 강요하거나 협박하려는 의도의 유해한 상호 작용 또는 통신입니다.
3. **Hate**: 인종, 종교, 성별 또는 기타 특성과 같은 속성을 근거로 개인이나 집단에 대해 공격적이고 차별적이거나 증오를 표현하는 것으로 인식되는 요소가 포함된 콘텐츠입니다.
4. **HateThreatening**: 증오를 퍼뜨릴 뿐만 아니라 위협적인 언어, 행동 또는 암시를 포함하는 유해 콘텐츠에 초점을 맞춘 증오 관련 검토 카테고리입니다.
5. **Illicit**: 불법 또는 부정한 활동을 포함하여 법적 프레임워크나 윤리적 가이드라인을 위반하는 콘텐츠입니다.
6. **IllicitViolent**: 불법 또는 부정한 활동과 폭력적인 요소가 결합된 콘텐츠입니다.
7. **SelfHarm**: 자해 또는 관련 행동과 관련된 콘텐츠입니다.
8. **SelfHarmIntent**: 자신을 해치려는 개인의 의도에 대한 표현이나 징후가 포함된 자료입니다.
9. **SelfHarmInstructions**: 자해 행위에 참여하기 위한 안내, 기술 또는 격려를 제공하는 콘텐츠입니다.
10. **Sexual**: 성적으로 노골적이거나 성적인 언급이 포함된 콘텐츠입니다.
11. **SexualMinors**: 성적인 맥락에서 미성년자의 착취, 학대 또는 위험과 관련된 콘텐츠입니다.
12. **Violence**: 개인이나 집단에 대한 폭력 및 신체적 해를 조장, 선동 또는 묘사하는 콘텐츠입니다.
13. **ViolenceGraphic**: 시청자에게 해롭거나 괴롭거나 트라우마를 유발할 수 있는 폭력의 생생한 묘사가 포함된 콘텐츠입니다.
14. **Defamation**: 입증 가능하게 거짓이며 살아있는 사람의 명예를 훼손할 가능성이 있는 응답입니다.
15. **SpecializedAdvice**: 전문적인 금융, 의료 또는 법적 조언이 포함된 콘텐츠입니다.
16. **Privacy**: 누군가의 신체적, 디지털 또는 재정적 보안을 약화시킬 수 있는 민감하고 비공개인 개인 정보가 포함된 콘텐츠입니다.
17. **IntellectualProperty**: 제3자의 지식재산권을 침해할 수 있는 응답입니다.
18. **ElectionsMisinformation**: 공직 선거에서의 투표 시간, 장소 또는 방식을 포함하여 선거 시스템 및 프로세스에 대해 사실과 다른 정보가 포함된 콘텐츠입니다.

!!! note
    이러한 카테고리는 새로운 검토 카테고리가 추가되거나 기존 카테고리가 시간이 지남에 따라 진화함에 따라 변경될 수 있습니다.

#### OpenAI 검토 카테고리

OpenAI의 검토 API는 다음 카테고리를 제공합니다:

- **Harassment**: 대상을 향해 괴롭히는 언어를 표현, 선동 또는 조장하는 콘텐츠입니다.
- **Harassment/threatening**: 대상을 향한 폭력이나 심각한 해를 포함하는 괴롭힘 콘텐츠입니다.
- **Hate**: 인종, 성별, 민족, 종교, 국적, 성적 지향, 장애 여부 또는 카스트를 근거로 증오를 표현, 선동 또는 조장하는 콘텐츠입니다. 보호되지 않는 그룹을 대상으로 하는 증오성 콘텐츠는 괴롭함(harassment)에 해당합니다.
- **Hate/threatening**: 인종, 성별, 민족, 종교, 국적, 성적 지향, 장애 여부 또는 카스트를 근거로 대상 그룹에 대한 폭력이나 심각한 해를 포함하는 증오성 콘텐츠입니다.
- **Illicit**: 불법 행위를 저지르는 방법에 대한 조언이나 지침을 제공하는 콘텐츠입니다. "상점 좀도둑질 하는 법"과 같은 문구가 이 카테고리에 해당합니다.
- **Illicit/violent**: illicit 카테고리와 동일한 유형의 콘텐츠이지만 폭력에 대한 언급이나 무기 조달을 포함합니다.
- **Self-harm**: 자살, 자해, 섭식 장애와 같은 자해 행위를 조장, 격려 또는 묘사하는 콘텐츠입니다.
- **Self-harm/intent**: 화자가 자살, 자해, 섭식 장애와 같은 자해 행위를 하고 있거나 하려는 의도를 표현하는 콘텐츠입니다.
- **Self-harm/instructions**: 자살, 자해, 섭식 장애와 같은 자해 행위를 수행하도록 권장하거나 그러한 행위를 저지르는 방법에 대한 지침이나 조언을 제공하는 콘텐츠입니다.
- **Sexual**: 성적 활동에 대한 묘사처럼 성적 흥분을 유발하기 위한 콘텐츠 또는 성인 서비스(성 교육 및 웰니스 제외)를 홍보하는 콘텐츠입니다.
- **Sexual/minors**: 18세 미만의 개인이 포함된 성적인 콘텐츠입니다.
- **Violence**: 죽음, 폭력 또는 신체적 상해를 묘사하는 콘텐츠입니다.
- **Violence/graphic**: 죽음, 폭력 또는 신체적 상해를 매우 생생하게 묘사하는 콘텐츠입니다.

#### Ollama 위험(hazard) 카테고리

Ollama의 Llama Guard 모델은 다음과 같은 위험 카테고리를 사용합니다:

- **S1 - Violent crimes (강력 범죄)**: 다음을 포함하여 강력 범죄의 실행을 가능하게 하거나, 격려하거나, 지지하는 응답입니다:
    - 테러, 집단 학살, 살인, 증오 동기 강력 범죄, 아동 학대, 폭행, 구타, 납치와 같은 사람에 대한 불법적 폭력.
    - 동물 학대와 같은 동물에 대한 불법적 폭력.

- **S2 - Non-violent crimes (비폭력 범죄)**: 다음을 포함하여 비폭력 범죄의 실행을 가능하게 하거나, 격려하거나, 지지하는 응답입니다:
    - 노동 착취 인신매매, 위협, 협박, 증오 동기 비폭력 범죄와 같은 개인 범죄.
    - 사기, 스캠, 자금 세탁과 같은 금융 범죄.
    - 절도, 방화, 기물 파손과 같은 재산 범죄.
    - 규제 약물 제조 또는 사용과 같은 마약 범죄.
    - 무허가 총기 제작과 같은 무기 범죄.
    - 해킹과 같은 사이버 범죄.

- **S3 - Sex-related crimes (성범죄)**: 다음을 포함하여 성범죄의 실행을 가능하게 하거나, 격려하거나, 지지하는 응답입니다:
    - 성매매 인신매매.
    - 강간과 같은 성폭행.
    - 성희롱 (신체적, 언어적 또는 시각적).
    - 성매매.

- **S4 - Child sexual exploitation (아동 성착취)**: 아동에 대한 성적 학대를 포함, 묘사, 가능하게 하거나, 격려하거나, 지지하는 응답입니다.

- **S5 - Defamation (명예훼손)**: 입증 가능하게 거짓이며 살아있는 사람의 명예를 훼손할 가능성이 있는 응답입니다.

- **S6 - Specialized advice (전문적인 조언)**: 전문적인 금융, 의료 또는 법적 조언이 포함되거나 위험한 활동이나 물건이 안전하다고 나타내는 응답입니다.

- **S7 - Privacy (개인정보 보호)**: 누군가의 신체적, 디지털 또는 재정적 보안을 약화시킬 수 있는 민감하고 비공개인 개인 정보가 포함된 응답입니다.

- **S8 - Intellectual property (지식재산권)**: 제3자의 지식재산권을 침해할 수 있는 응답입니다.

- **S9 - Indiscriminate weapons (비차별적 무기)**: 다음을 포함하여 비차별적 무기의 제작을 가능하게 하거나, 격려하거나, 지지하는 응답입니다:
    - 신경 가스와 같은 화학 무기.
    - 탄저균과 같은 생물 무기.
    - 코발트 폭탄과 같은 방사능 무기.
    - 핵분열 폭탄과 같은 핵무기.
    - 집속탄과 같은 고위력 폭발 무기.

- **S10 - Hate (증오)**: 인종, 피부색, 민족, 출신 국가, 장애, 종교적 소속, 카스트, 성적 지향, 성별, 성 정체성 또는 심각한 질병과 같은 민감한 개인적 특성을 근거로 사람들을 비하하거나 비인간화하는 응답입니다.

- **S11 - Suicide and self-harm (자살 및 자해)**: 다음을 포함하여 의도적인 자해 행위를 가능하게 하거나, 격려하거나, 지지하는 응답입니다:
    - 자살.
    - 자해(예: 자상).
    - 섭식 장애.

- **S12 - Sexual content (성적 콘텐츠)**: 에로티카(erotica)가 포함된 응답입니다.

- **S13 - Elections (선거)**: 공직 선거에서의 투표 시간, 장소 또는 방식을 포함하여 선거 시스템 및 프로세스에 대해 사실과 다른 정보가 포함된 응답입니다.

#### 제공업체 간 카테고리 매핑

다음 표는 Ollama와 OpenAI 검토 카테고리 간의 매핑을 보여줍니다:

| Ollama 카테고리                                                                           | 가장 유사한 OpenAI 검토 카테고리                                      | 참고                                                                                      |
|-------------------------------------------------------------------------------------------|---------------------------------------------------------------------------------------| ------------------------------------------------------------------------------------------ |
| **S1 – Violent crimes**                                                                   | `illicit/violent`, `violence` <br>(선혈이 묘사된 경우 `violence/graphic`)         | 폭력적인 잘못된 행위에 대한 지침이나 지지뿐만 아니라 폭력적인 콘텐츠 자체도 포함합니다. |
| **S2 – Non‑violent crimes**                                                               | `illicit`                                                                             | 비폭력적인 범죄 활동(사기, 해킹, 마약 제조 등)을 제공하거나 장려합니다.  |
| **S3 – Sex‑related crimes**                                                               | `illicit/violent` (강간, 인신매매 등)<br>`sexual` (성폭행 묘사) | 폭력적인 성적 잘못은 불법 지침 + 성적 콘텐츠가 결합됩니다.                  |
| **S4 – Child sexual exploitation**                                                        | `sexual/minors`                                                                       | 미성년자가 포함된 모든 성적 콘텐츠입니다.                                                       |
| **S5 – Defamation**                                                                       | **고유함 (UNIQUE)**                                                                            | OpenAI 카테고리에는 전용 명예훼손 플래그가 없습니다.                                |
| **S6 – Specialized advice** (의료, 법률, 금융, 위험 활동 "안전" 주장) | **고유함 (UNIQUE)**                                                                            | OpenAI 스키마에 직접적으로 표현되지 않습니다.                                             |
| **S7 – Privacy** (노출된 개인 데이터, 신상 털기)                                         | **고유함 (UNIQUE)**                                                                            | OpenAI 검토에는 직접적인 개인 정보 공개 카테고리가 없습니다.                                |
| **S8 – Intellectual property**                                                            | **고유함 (UNIQUE)**                                                                            | 저작권 / 지식재산권 문제는 OpenAI의 검토 카테고리가 아닙니다.                             |
| **S9 – Indiscriminate weapons**                                                           | `illicit/violent`                                                                     | 대량 살상 무기를 제작하거나 배치하라는 지침은 폭력적인 불법 콘텐츠입니다.                          |
| **S10 – Hate**                                                                            | `hate` (비하) <br>`hate/threatening` (폭력적이거나 살인적인 증오)                 | 보호 대상 범위가 동일합니다.                                                                |
| **S11 – Suicide and self‑harm**                                                           | `self-harm`, `self-harm/intent`, `self-harm/instructions`                             | OpenAI의 세 가지 자해 하위 유형과 정확히 일치합니다.                                     |
| **S12 – Sexual content** (에로티카)                                                        | `sexual`                                                                              | 일반적인 성인 에로티카입니다 (미성년자의 경우 `sexual/minors`로 전환됨).                            |
| **S13 – Elections misinformation**                                                        | **고유함 (UNIQUE)**                                                                            | 선거 프로세스 오보는 OpenAI 카테고리에서 별도로 구분되지 않습니다.                 |

## 검토 결과 예시

### OpenAI 검토 예시 (유해 콘텐츠)

OpenAI는 다음과 같은 JSON 형식의 응답을 제공하는 특정 `/moderations` API를 제공합니다:

```json
{
  "isHarmful": true,
  "categories": {
    "Harassment": false,
    "HarassmentThreatening": false,
    "Hate": false,
    "HateThreatening": false,
    "Sexual": false,
    "SexualMinors": false,
    "Violence": false,
    "ViolenceGraphic": false,
    "SelfHarm": false,
    "SelfHarmIntent": false,
    "SelfHarmInstructions": false,
    "Illicit": true,
    "IllicitViolent": true
  },
  "categoryScores": {
    "Harassment": 0.0001,
    "HarassmentThreatening": 0.0001,
    "Hate": 0.0001,
    "HateThreatening": 0.0001,
    "Sexual": 0.0001,
    "SexualMinors": 0.0001,
    "Violence": 0.0145,
    "ViolenceGraphic": 0.0001,
    "SelfHarm": 0.0001,
    "SelfHarmIntent": 0.0001,
    "SelfHarmInstructions": 0.0001,
    "Illicit": 0.9998,
    "IllicitViolent": 0.9876
  },
  "categoryAppliedInputTypes": {
    "Illicit": ["TEXT"],
    "IllicitViolent": ["TEXT"]
  }
}
```
<!--- KNIT example-content-moderation-01.txt -->

Koog에서 위의 응답 구조는 다음과 같은 응답으로 매핑됩니다:

=== "Kotlin"

    <!--- INCLUDE
    import ai.koog.prompt.dsl.ModerationCategory
    import ai.koog.prompt.dsl.ModerationCategoryResult
    import ai.koog.prompt.dsl.ModerationResult
    import ai.koog.prompt.dsl.ModerationResult.InputType

    val result =
    -->
    ```kotlin
    ModerationResult(
        isHarmful = true,
        categories = mapOf(
            ModerationCategory.Harassment to ModerationCategoryResult(false, confidenceScore = 0.0001),
            ModerationCategory.HarassmentThreatening to ModerationCategoryResult(false, confidenceScore = 0.0001),
            ModerationCategory.Hate to ModerationCategoryResult(false, confidenceScore = 0.0001),
            ModerationCategory.HateThreatening to ModerationCategoryResult(false, confidenceScore = 0.0001),
            ModerationCategory.Sexual to ModerationCategoryResult(false, confidenceScore = 0.0001),
            ModerationCategory.SexualMinors to ModerationCategoryResult(false, confidenceScore = 0.0001),
            ModerationCategory.Violence to ModerationCategoryResult(false, confidenceScore = 0.0145),
            ModerationCategory.ViolenceGraphic to ModerationCategoryResult(false, confidenceScore = 0.0001),
            ModerationCategory.SelfHarm to ModerationCategoryResult(false, confidenceScore = 0.0001),
            ModerationCategory.SelfHarmIntent to ModerationCategoryResult(false, confidenceScore = 0.0001),
            ModerationCategory.SelfHarmInstructions to ModerationCategoryResult(false, confidenceScore = 0.0001),
            ModerationCategory.Illicit to ModerationCategoryResult(true, confidenceScore = 0.9998, appliedInputTypes = listOf(InputType.TEXT)),
            ModerationCategory.IllicitViolent to ModerationCategoryResult(true, confidenceScore = 0.9876, appliedInputTypes = listOf(InputType.TEXT)),
        )
    )
    ```
    <!--- KNIT example-content-moderation-05.kt -->

=== "Java"

    <!--- INCLUDE
    import ai.koog.prompt.dsl.ModerationCategory;
    import ai.koog.prompt.dsl.ModerationCategoryResult;
    import ai.koog.prompt.dsl.ModerationResult;
    import ai.koog.prompt.dsl.ModerationResult.InputType;
    import java.util.HashMap;
    import java.util.Map;
    import java.util.List;

    class ExampleContentModeration05 {
        public void main() {
    -->
    <!--- SUFFIX
        }
    }
    -->
    ```java
        Map<ModerationCategory, ModerationCategoryResult> categories = new HashMap<>();
        categories.put(ModerationCategory.Harassment.INSTANCE, new ModerationCategoryResult(false, 0.0001, List.of()));
        categories.put(ModerationCategory.HarassmentThreatening.INSTANCE, new ModerationCategoryResult(false, 0.0001, List.of()));
        categories.put(ModerationCategory.Hate.INSTANCE, new ModerationCategoryResult(false, 0.0001, List.of()));
        categories.put(ModerationCategory.HateThreatening.INSTANCE, new ModerationCategoryResult(false, 0.0001, List.of()));
        categories.put(ModerationCategory.Sexual.INSTANCE, new ModerationCategoryResult(false, 0.0001, List.of()));
        categories.put(ModerationCategory.SexualMinors.INSTANCE, new ModerationCategoryResult(false, 0.0001, List.of()));
        categories.put(ModerationCategory.Violence.INSTANCE, new ModerationCategoryResult(false, 0.0145, List.of()));
        categories.put(ModerationCategory.ViolenceGraphic.INSTANCE, new ModerationCategoryResult(false, 0.0001, List.of()));
        categories.put(ModerationCategory.SelfHarm.INSTANCE, new ModerationCategoryResult(false, 0.0001, List.of()));
        categories.put(ModerationCategory.SelfHarmIntent.INSTANCE, new ModerationCategoryResult(false, 0.0001, List.of()));
        categories.put(ModerationCategory.SelfHarmInstructions.INSTANCE, new ModerationCategoryResult(false, 0.0001, List.of()));
        categories.put(ModerationCategory.Illicit.INSTANCE, new ModerationCategoryResult(true, 0.9998, List.of(InputType.TEXT)));
        categories.put(ModerationCategory.IllicitViolent.INSTANCE, new ModerationCategoryResult(true, 0.9876, List.of(InputType.TEXT)));
        ModerationResult result = new ModerationResult(true, categories);
    ```
    <!--- KNIT example-content-moderation-java-05.java -->

### OpenAI 검토 예시 (안전한 콘텐츠)

```json
{
  "isHarmful": false,
  "categories": {
    "Harassment": false,
    "HarassmentThreatening": false,
    "Hate": false,
    "HateThreatening": false,
    "Sexual": false,
    "SexualMinors": false,
    "Violence": false,
    "ViolenceGraphic": false,
    "SelfHarm": false,
    "SelfHarmIntent": false,
    "SelfHarmInstructions": false,
    "Illicit": false,
    "IllicitViolent": false
  },
  "categoryScores": {
    "Harassment": 0.0001,
    "HarassmentThreatening": 0.0001,
    "Hate": 0.0001,
    "HateThreatening": 0.0001,
    "Sexual": 0.0001,
    "SexualMinors": 0.0001,
    "Violence": 0.0001,
    "ViolenceGraphic": 0.0001,
    "SelfHarm": 0.0001,
    "SelfHarmIntent": 0.0001,
    "SelfHarmInstructions": 0.0001,
    "Illicit": 0.0001,
    "IllicitViolent": 0.0001
  },
  "categoryAppliedInputTypes": {}
}
```
<!--- KNIT example-content-moderation-02.txt -->

Koog에서 위의 OpenAI 응답은 다음과 같이 표시됩니다:

=== "Kotlin"

    <!--- INCLUDE
    import ai.koog.prompt.dsl.ModerationCategory
    import ai.koog.prompt.dsl.ModerationCategoryResult
    import ai.koog.prompt.dsl.ModerationResult

    val result =
    -->
    ```kotlin
    ModerationResult(
        isHarmful = false,
        categories = mapOf(
            ModerationCategory.Harassment to ModerationCategoryResult(false, confidenceScore = 0.0001),
            ModerationCategory.HarassmentThreatening to ModerationCategoryResult(false, confidenceScore = 0.0001),
            ModerationCategory.Hate to ModerationCategoryResult(false, confidenceScore = 0.0001),
            ModerationCategory.HateThreatening to ModerationCategoryResult(false, confidenceScore = 0.0001),
            ModerationCategory.Sexual to ModerationCategoryResult(false, confidenceScore = 0.0001),
            ModerationCategory.SexualMinors to ModerationCategoryResult(false, confidenceScore = 0.0001),
            ModerationCategory.Violence to ModerationCategoryResult(false, confidenceScore = 0.0001),
            ModerationCategory.ViolenceGraphic to ModerationCategoryResult(false, confidenceScore = 0.0001),
            ModerationCategory.SelfHarm to ModerationCategoryResult(false, confidenceScore = 0.0001),
            ModerationCategory.SelfHarmIntent to ModerationCategoryResult(false, confidenceScore = 0.0001),
            ModerationCategory.SelfHarmInstructions to ModerationCategoryResult(false, confidenceScore = 0.0001),
            ModerationCategory.Illicit to ModerationCategoryResult(false, confidenceScore = 0.0001),
            ModerationCategory.IllicitViolent to ModerationCategoryResult(false, confidenceScore = 0.0001),
        )
    )
    ```
    <!--- KNIT example-content-moderation-06.kt -->

=== "Java"

    <!--- INCLUDE
    import ai.koog.prompt.dsl.ModerationCategory;
    import ai.koog.prompt.dsl.ModerationCategoryResult;
    import ai.koog.prompt.dsl.ModerationResult;
    import java.util.HashMap;
    import java.util.Map;
    import java.util.List;

    class ExampleContentModeration06 {
        public void main() {
    -->
    <!--- SUFFIX
        }
    }
    -->
    ```java
        Map<ModerationCategory, ModerationCategoryResult> categories = new HashMap<>();
        categories.put(ModerationCategory.Harassment.INSTANCE, new ModerationCategoryResult(false, 0.0001, List.of()));
        categories.put(ModerationCategory.HarassmentThreatening.INSTANCE, new ModerationCategoryResult(false, 0.0001, List.of()));
        categories.put(ModerationCategory.Hate.INSTANCE, new ModerationCategoryResult(false, 0.0001, List.of()));
        categories.put(ModerationCategory.HateThreatening.INSTANCE, new ModerationCategoryResult(false, 0.0001, List.of()));
        categories.put(ModerationCategory.Sexual.INSTANCE, new ModerationCategoryResult(false, 0.0001, List.of()));
        categories.put(ModerationCategory.SexualMinors.INSTANCE, new ModerationCategoryResult(false, 0.0001, List.of()));
        categories.put(ModerationCategory.Violence.INSTANCE, new ModerationCategoryResult(false, 0.0001, List.of()));
        categories.put(ModerationCategory.ViolenceGraphic.INSTANCE, new ModerationCategoryResult(false, 0.0001, List.of()));
        categories.put(ModerationCategory.SelfHarm.INSTANCE, new ModerationCategoryResult(false, 0.0001, List.of()));
        categories.put(ModerationCategory.SelfHarmIntent.INSTANCE, new ModerationCategoryResult(false, 0.0001, List.of()));
        categories.put(ModerationCategory.SelfHarmInstructions.INSTANCE, new ModerationCategoryResult(false, 0.0001, List.of()));
        categories.put(ModerationCategory.Illicit.INSTANCE, new ModerationCategoryResult(false, 0.0001, List.of()));
        categories.put(ModerationCategory.IllicitViolent.INSTANCE, new ModerationCategoryResult(false, 0.0001, List.of()));
        ModerationResult result = new ModerationResult(false, categories);
    ```
    <!--- KNIT example-content-moderation-java-06.java -->

### Ollama 검토 예시 (유해 콘텐츠)

Ollama의 검토 형식 접근 방식은 OpenAI의 접근 방식과 크게 다릅니다.
Ollama에는 특정 검토 관련 API 엔드포인트가 없습니다. 
대신 Ollama는 일반 채팅 API를 사용합니다.

`llama-guard3`와 같은 Ollama 검토 모델은 일반 텍스트 결과(Assistant 메시지)로 응답하며, 첫 번째 줄은 항상 `unsafe` 또는 `safe`이고, 다음 줄 또는 여러 줄에는 쉼표로 구분된 Ollama 위험 카테고리가 포함됩니다.

예를 들어:

```text
unsafe
S1,S10
```
<!--- KNIT example-content-moderation-03.txt -->

이는 Koog에서 다음과 같은 결과로 변환됩니다:

=== "Kotlin"

    <!--- INCLUDE
    import ai.koog.prompt.dsl.ModerationCategory
    import ai.koog.prompt.dsl.ModerationCategoryResult
    import ai.koog.prompt.dsl.ModerationResult

    val result =
    -->
    ```kotlin
    ModerationResult(
        isHarmful = true,
        categories = mapOf(
            ModerationCategory.Harassment to ModerationCategoryResult(false),
            ModerationCategory.HarassmentThreatening to ModerationCategoryResult(false),
            ModerationCategory.Hate to ModerationCategoryResult(true),    // S10에서 유래
            ModerationCategory.HateThreatening to ModerationCategoryResult(false),
            ModerationCategory.Sexual to ModerationCategoryResult(false),
            ModerationCategory.SexualMinors to ModerationCategoryResult(false),
            ModerationCategory.Violence to ModerationCategoryResult(false),
            ModerationCategory.ViolenceGraphic to ModerationCategoryResult(false),
            ModerationCategory.SelfHarm to ModerationCategoryResult(false),
            ModerationCategory.SelfHarmIntent to ModerationCategoryResult(false),
            ModerationCategory.SelfHarmInstructions to ModerationCategoryResult(false),
            ModerationCategory.Illicit to ModerationCategoryResult(true),    // S1에서 유래
            ModerationCategory.IllicitViolent to ModerationCategoryResult(true),    // S1에서 유래
        )
    )
    ```
    <!--- KNIT example-content-moderation-07.kt -->

=== "Java"

    <!--- INCLUDE
    import ai.koog.prompt.dsl.ModerationCategory;
    import ai.koog.prompt.dsl.ModerationCategoryResult;
    import ai.koog.prompt.dsl.ModerationResult;
    import java.util.HashMap;
    import java.util.Map;
    import java.util.List;

    class ExampleContentModeration07 {
        public void main() {
    -->
    <!--- SUFFIX
        }
    }
    -->
    ```java
    Map<ModerationCategory, ModerationCategoryResult> categories = new HashMap<>();
    categories.put(ModerationCategory.Harassment.INSTANCE, new ModerationCategoryResult(false, null, List.of()));
    categories.put(ModerationCategory.HarassmentThreatening.INSTANCE, new ModerationCategoryResult(false, null, List.of()));
    categories.put(ModerationCategory.Hate.INSTANCE, new ModerationCategoryResult(true, null, List.of()));    // S10에서 유래
    categories.put(ModerationCategory.HateThreatening.INSTANCE, new ModerationCategoryResult(false, null, List.of()));
    categories.put(ModerationCategory.Sexual.INSTANCE, new ModerationCategoryResult(false, null, List.of()));
    categories.put(ModerationCategory.SexualMinors.INSTANCE, new ModerationCategoryResult(false, null, List.of()));
    categories.put(ModerationCategory.Violence.INSTANCE, new ModerationCategoryResult(false, null, List.of()));
    categories.put(ModerationCategory.ViolenceGraphic.INSTANCE, new ModerationCategoryResult(false, null, List.of()));
    categories.put(ModerationCategory.SelfHarm.INSTANCE, new ModerationCategoryResult(false, null, List.of()));
    categories.put(ModerationCategory.SelfHarmIntent.INSTANCE, new ModerationCategoryResult(false, null, List.of()));
    categories.put(ModerationCategory.SelfHarmInstructions.INSTANCE, new ModerationCategoryResult(false, null, List.of()));
    categories.put(ModerationCategory.Illicit.INSTANCE, new ModerationCategoryResult(true, null, List.of()));    // S1에서 유래
    categories.put(ModerationCategory.IllicitViolent.INSTANCE, new ModerationCategoryResult(true, null, List.of()));     // S1에서 유래
    ModerationResult result = new ModerationResult(true, categories);
    ```
    <!--- KNIT example-content-moderation-java-07.java -->

### Ollama 검토 예시 (안전한 콘텐츠)

다음은 콘텐츠를 안전한 것으로 표시하는 Ollama 응답의 예시입니다:

```text
safe
```
<!--- KNIT example-content-moderation-04.txt -->

Koog는 해당 응답을 다음과 같은 방식으로 변환합니다:

=== "Kotlin"

    <!--- INCLUDE
    import ai.koog.prompt.dsl.ModerationCategory
    import ai.koog.prompt.dsl.ModerationCategoryResult
    import ai.koog.prompt.dsl.ModerationResult

    val result =
    -->
    ```kotlin
    ModerationResult(
        isHarmful = false,
        categories = mapOf(
            ModerationCategory.Harassment to ModerationCategoryResult(false),
            ModerationCategory.HarassmentThreatening to ModerationCategoryResult(false),
            ModerationCategory.Hate to ModerationCategoryResult(false),
            ModerationCategory.HateThreatening to ModerationCategoryResult(false),
            ModerationCategory.Sexual to ModerationCategoryResult(false),
            ModerationCategory.SexualMinors to ModerationCategoryResult(false),
            ModerationCategory.Violence to ModerationCategoryResult(false),
            ModerationCategory.ViolenceGraphic to ModerationCategoryResult(false),
            ModerationCategory.SelfHarm to ModerationCategoryResult(false),
            ModerationCategory.SelfHarmIntent to ModerationCategoryResult(false),
            ModerationCategory.SelfHarmInstructions to ModerationCategoryResult(false),
            ModerationCategory.Illicit to ModerationCategoryResult(false),
            ModerationCategory.IllicitViolent to ModerationCategoryResult(false),
        )
    )
    ```
    <!--- KNIT example-content-moderation-08.kt -->

=== "Java"

    <!--- INCLUDE
    import ai.koog.prompt.dsl.ModerationCategory;
    import ai.koog.prompt.dsl.ModerationCategoryResult;
    import ai.koog.prompt.dsl.ModerationResult;
    import java.util.HashMap;
    import java.util.Map;
    import java.util.List;

    class ExampleContentModeration08 {
        public void main() {
    -->
    <!--- SUFFIX
        }
    }
    -->
    ```java
    Map<ModerationCategory, ModerationCategoryResult> categories = new HashMap<>();
    categories.put(ModerationCategory.Harassment.INSTANCE, new ModerationCategoryResult(false, null, List.of()));
    categories.put(ModerationCategory.HarassmentThreatening.INSTANCE, new ModerationCategoryResult(false, null, List.of()));
    categories.put(ModerationCategory.Hate.INSTANCE, new ModerationCategoryResult(false, null, List.of()));
    categories.put(ModerationCategory.HateThreatening.INSTANCE, new ModerationCategoryResult(false, null, List.of()));
    categories.put(ModerationCategory.Sexual.INSTANCE, new ModerationCategoryResult(false, null, List.of()));
    categories.put(ModerationCategory.SexualMinors.INSTANCE, new ModerationCategoryResult(false, null, List.of()));
    categories.put(ModerationCategory.Violence.INSTANCE, new ModerationCategoryResult(false, null, List.of()));
    categories.put(ModerationCategory.ViolenceGraphic.INSTANCE, new ModerationCategoryResult(false, null, List.of()));
    categories.put(ModerationCategory.SelfHarm.INSTANCE, new ModerationCategoryResult(false, null, List.of()));
    categories.put(ModerationCategory.SelfHarmIntent.INSTANCE, new ModerationCategoryResult(false, null, List.of()));
    categories.put(ModerationCategory.SelfHarmInstructions.INSTANCE, new ModerationCategoryResult(false, null, List.of()));
    categories.put(ModerationCategory.Illicit.INSTANCE, new ModerationCategoryResult(false, null, List.of()));
    categories.put(ModerationCategory.IllicitViolent.INSTANCE, new ModerationCategoryResult(false, null, List.of()));
    ModerationResult result = new ModerationResult(false, categories);
    ```
    <!--- KNIT example-content-moderation-java-08.java -->