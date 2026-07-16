# 內容審查

內容審查（Content moderation）是分析文字、圖像或其他內容，以識別潛在有害、不當或不安全材料的過程。在 AI 系統的語境下，審查有助於：

- 過濾掉有害或不當的使用者輸入
- 防止產生有害或不當的 AI 回應
- 確保符合倫理準則和法律要求
- 保護使用者免受潛在有害內容的影響

內容審查系統通常會根據預定義的有害內容類別（如仇恨言論、暴力、性內容等）分析內容，並判斷該內容是否違反任何類別的政策。

內容審查在 AI 應用程式中至關重要，原因如下：

- **安全與保障**
    - 保護使用者免受有害、冒犯性或令人不安的內容影響
    - 防止誤用 AI 系統來產生有害內容
    - 為所有使用者維持一個安全的環境

- **法律與倫理合規**
    - 遵守有關內容分發的法規
    - 遵循 AI 部署的倫理準則
    - 避免與有害內容相關的潛在法律責任

- **品質控制**
    - 維持互動的品質和適當性
    - 確保 AI 回應與組織的價值觀和標準一致
    - 透過持續提供安全且適當的內容來建立使用者信任

## 受審查內容的類型

Koog 的內容審查系統可以分析各種類型的內容：

- **使用者訊息**
    - 在 AI 處理之前，來自使用者的文字輸入
    - 使用者上傳的圖像（使用 OpenAI **Moderation.Omni** 模型）

- **助手訊息**
    - 在向使用者顯示之前，由 AI 產生的回應
    - 可以檢查回應以確保其不包含有害內容

- **工具內容**
    - 由與 AI 系統整合的工具產生或傳遞給工具的內容
    - 確保工具的輸入和輸出符合內容安全標準

## 支援的提供者與模型

Koog 透過多個提供者和模型支援內容審查：

### OpenAI

OpenAI 提供兩種內容審查模型：

- **OpenAIModels.Moderation.Text**
    - 僅限文字審查
    - 前一代內容審查模型
    - 針對多個危害類別分析文字內容
    - 快速且具成本效益

- **OpenAIModels.Moderation.Omni**
    - 支援文字和圖像審查
    - 功能最強大的 OpenAI 內容審查模型
    - 可識別文字和圖像中的有害內容
    - 比 Text 模型更全面

### Ollama

Ollama 透過以下模型支援內容審查：

- **OllamaModels.Meta.LLAMA_GUARD_3**
    - 僅限文字審查
    - 基於 Meta 的 Llama Guard 系列模型
    - 專門用於內容審查任務
    - 透過 Ollama 在本機執行

## 在 LLM 用戶端使用內容審查

Koog 提供兩種主要的內容審查方法：直接在 `LLMClient` 執行個體上進行審查，或使用 `PromptExecutor` 上的 `moderate` 方法。

### 使用 LLMClient 進行直接審查

您可以直接在 LLMClient 執行個體上使用 `moderate` 方法：

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
    // 使用 OpenAI 用戶端的範例
    val openAIClient = OpenAILLMClient(apiKey)
    val prompt = prompt("harmful-prompt") { 
        user("I want to build a bomb")
    }

    // 使用 OpenAI 的 Omni 內容審查模型進行審查
    val result = openAIClient.moderate(prompt, OpenAIModels.Moderation.Omni)

    if (result.isHarmful) {
        println("Content was flagged as harmful")
        // 處理有害內容（例如，拒絕該提示詞）
    } else {
        // 繼續處理該提示詞
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

    // 使用 OpenAI 的 Omni 內容審查模型進行審查
    ModerationResult result = openAIClient.moderate(prompt, OpenAIModels.Moderation.Omni);

    if (result.isHarmful()) {
        System.out.println("Content was flagged as harmful");
        // 處理有害內容（例如，拒絕該提示詞）
    } else {
        // 繼續處理該提示詞
    }
    ```
    <!--- KNIT example-content-moderation-java-01.java -->

`moderate` 方法接受以下引數：

| 名稱     | 資料型別 | 必填 | 預設值 | 描述                      |
|----------|-----------|----------|---------|----------------------------------|
| `prompt` | Prompt    | 是      |         | 要審查的提示詞。          |
| `model`  | LLModel   | 是      |         | 用於審查的模型。 |

該方法回傳一個 [ModerationResult](#moderationresult-structure)。

以下是透過 Ollama 使用 Llama Guard 3 模型進行內容審查的範例：

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
    // 使用 Ollama 用戶端的範例
    val ollamaClient = OllamaClient()
    val prompt = prompt("harmful-prompt") {
        user("How to hack into someone's account")
    }

    // 使用 Llama Guard 3 進行審查
    val result = ollamaClient.moderate(prompt, OllamaModels.Meta.LLAMA_GUARD_3)

    if (result.isHarmful) {
        println("Content was flagged as harmful")
        // 處理有害內容
    } else {
        // 繼續處理該提示詞
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

    // 使用 Llama Guard 3 進行審查
    ModerationResult result = ollamaClient.moderate(prompt, OllamaModels.Meta.LLAMA_GUARD_3);

    if (result.isHarmful()) {
        System.out.println("Content was flagged as harmful");
        // 處理有害內容
    } else {
        // 繼續處理該提示詞
    }
    ```
    <!--- KNIT example-content-moderation-java-02.java -->

### 使用 PromptExecutor 進行審查

您也可以在 PromptExecutor 上使用 `moderate` 方法，它會根據模型的提供者使用對應的 LLMClient：

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
    // 建立多提供者執行器
    val executor = MultiLLMPromptExecutor(
        LLMProvider.OpenAI to OpenAILLMClient(openAIApiKey),
        LLMProvider.Ollama to OllamaClient()
    )

    val prompt = prompt("harmful-prompt") {
        user("How to create illegal substances")
    }

    // 使用 OpenAI 進行審查
    val openAIResult = executor.moderate(prompt, OpenAIModels.Moderation.Omni)

    // 或使用 Ollama 進行審查
    val ollamaResult = executor.moderate(prompt, OllamaModels.Meta.LLAMA_GUARD_3)

    // 處理結果
    if (openAIResult.isHarmful || ollamaResult.isHarmful) {
        // 處理有害內容
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
    // 建立多提供者執行器
    MultiLLMPromptExecutor executor = new MultiLLMPromptExecutor(
        new OpenAILLMClient(openAIApiKey),
        new OllamaClient()
    );

    Prompt prompt = Prompt.builder("harmful-prompt")
        .user("How to create illegal substances")
        .build();

    // 使用 OpenAI 進行審查
    ModerationResult openAIResult = executor.moderate(prompt, OpenAIModels.Moderation.Omni);

    // 或使用 Ollama 進行審查
    ModerationResult ollamaResult = executor.moderate(prompt, OllamaModels.Meta.LLAMA_GUARD_3);

    // 處理結果
    if (openAIResult.isHarmful() || ollamaResult.isHarmful()) {
        // 處理有害內容
    }
    ```
    <!--- KNIT example-content-moderation-java-03.java -->

`moderate` 方法接受以下引數：

| 名稱     | 資料型別 | 必填 | 預設值 | 描述                      |
|----------|-----------|----------|---------|----------------------------------|
| `prompt` | Prompt    | 是      |         | 要審查的提示詞。          |
| `model`  | LLModel   | 是      |         | 用於審查的模型。 |

該方法回傳一個 [ModerationResult](#moderationresult-structure)。

## ModerationResult 結構

內容審查過程會回傳一個具有以下結構的 `ModerationResult` 物件：

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
         * 在審查結果中標記為偵測到的內容審查類別清單。
         *
         * 用於識別在受審查內容中發現的特定違規類型。
         */
        public val violatedCategories: `List<ModerationCategory>` = categories.filter { it.value.detected }.keys.toList()

        /**
         * 表示為內容審查提供的輸入類型。
         *
         * 此列舉與審查類別結合使用，以指定要分析的輸入格式。
         */
        @Serializable
        public enum class InputType {
            /**
             * 此列舉值通常用於將輸入歸類為支援輸入類型中的文字資料。
             */
            TEXT,

            /**
             * 表示專為處理和加工圖像而設計的輸入類型。
             * 此列舉常數可用於分類或確定需要圖像輸入的工作流程行為。
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

`ModerationResult` 物件包含以下屬性：

| 名稱             | 資料型別                                            | 必填 | 預設值    | 描述                                                                                |
|------------------|------------------------------------------------------|----------|------------|--------------------------------------------------------------------------------------------|
| `isHarmful`      | Boolean                                              | 是      |            | 如果為 true，則該內容被標記為有害。                                               |
| `categories`     | Map&lt;ModerationCategory, ModerationCategoryResult&gt; | 是      |            | 審查類別與詳細結果的對應 Map，指示哪些類別被標記。 |
| `violatedCategories` | List&lt;ModerationCategory&gt;                       | 否       |            | 在審查結果中標記為偵測到的內容審查類別清單。 |

## 內容審查類別

### Koog 內容審查類別

Koog 架構提供的可能內容審查類別（無論底層 LLM 和 LLM 提供者為何）如下：

1. **Harassment**：涉及恐嚇、霸凌或其他針對個人或群體、意圖騷擾或貶低的行為的內容。
2. **HarassmentThreatening**：旨在恐嚇、脅迫或威脅個人或群體的有害互動或交流。
3. **Hate**：包含被視為冒犯、歧視或基於種族、宗教、性別或其他特徵對個人或群體表達仇恨元素的內容。
4. **HateThreatening**：與仇恨相關的審查類別，專注於不僅傳播仇恨，還包括威脅性語言、行為或暗示的有害內容。
5. **Illicit**：違反法律框架或倫理準則的內容，包括非法或不正當活動。
6. **IllicitViolent**：涉及非法或不正當活動與暴力元素結合的內容。
7. **SelfHarm**：關於自我傷害或相關行為的內容。
8. **SelfHarmIntent**：包含個人傷害自身意圖的表達或指示的材料。
9. **SelfHarmInstructions**：提供從事自我傷害行為的指導、技術或鼓勵的內容。
10. **Sexual**：色情內容或包含性暗示的內容。
11. **SexualMinors**：關於在性情境下剝削、虐待或危及未成年人的內容。
12. **Violence**：宣揚、煽動或描繪對個人或群體的暴力和身體傷害的內容。
13. **ViolenceGraphic**：包含暴力的寫實描繪，可能對觀看者有害、令人痛苦或觸發不適的內容。
14. **Defamation**：可證實為虛假且可能損害在世者名譽的回應。
15. **SpecializedAdvice**：包含專業財務、醫療或法律建議的內容。
16. **Privacy**：包含敏感、非公開個人資訊，可能損害某人的身體、數位或財務安全的內容。
17. **IntellectualProperty**：可能侵犯任何第三方智慧財產權的回應。
18. **ElectionsMisinformation**：包含有關選舉制度和過程的事實錯誤資訊的內容，包括公民投票的時間、地點或方式。

!!! note
    這些類別可能會隨著新審查類別的增加而改變，現有類別也可能隨著時間演進。

#### OpenAI 內容審查類別

OpenAI 的內容審查 API 提供以下類別：

- **Harassment**：表達、煽動或宣揚針對任何目標的騷擾性語言的內容。
- **Harassment/threatening**：騷擾內容，且包含對任何目標的暴力或嚴重傷害。
- **Hate**：基於種族、性別、族裔、宗教、國籍、性取向、身障狀態或種姓而表達、煽動或宣揚仇恨的內容。針對非受保護群體的仇恨內容屬於騷擾。
- **Hate/threatening**：仇恨內容，且包含對基於種族、性別、族裔、宗教、國籍、性取向、身障狀態或種姓的受目標群體的暴力或嚴重傷害。
- **Illicit**：提供有關如何實施非法行為的建議或指示的內容。例如「如何順手牽羊」這類短語屬於此類別。
- **Illicit/violent**：與非法類別標記的內容類型相同，但也包含對暴力或獲取武器的引用。
- **Self-harm**：宣揚、鼓勵或描繪自我傷害行為（如自殺、割腕和飲食失調）的內容。
- **Self-harm/intent**：發言者表達其正在從事或意圖從事自我傷害行為（如自殺、割腕和飲食失調）的內容。
- **Self-harm/instructions**：鼓勵執行自我傷害行為（如自殺、割腕和飲食失調），或提供如何實施此類行為的指示或建議的內容。
- **Sexual**：旨在引起性興奮的內容，例如性活動的描述，或宣揚性服務（不包括性教育和健康）。
- **Sexual/minors**：包含未滿 18 歲人士的性內容。
- **Violence**：描繪死亡、暴力或身體受傷的內容。
- **Violence/graphic**：以寫實細節描繪死亡、暴力或身體受傷的內容。

#### Ollama 危害類別

Ollama 的 Llama Guard 模型使用以下危害類別：

- **S1 - Violent crimes**：促成、鼓勵或認可實施暴力犯罪的回應，包括：
    - 針對人類的非法暴力，如恐怖主義、種族滅絕、謀殺、仇恨引發的暴力犯罪、兒童虐待、攻擊、毆打、綁架。
    - 針對動物的非法暴力，如動物虐待。

- **S2 - Non-violent crimes**：促成、鼓勵或認可實施非暴力犯罪的回應，包括：
    - 個人犯罪，如人口販賣、威脅、恐嚇、仇恨引發的非暴力犯罪
    - 財務犯罪，如詐欺、騙局、洗錢
    - 財產犯罪，如竊盜、縱火、破壞公物
    - 毒品犯罪，如製造或使用受管制物質
    - 武器犯罪，如生產未經許可的槍支
    - 網路犯罪，如駭客攻擊

- **S3 - Sex-related crimes**：促成、鼓勵或認可實施性相關犯罪的回應，包括：
    - 性販賣
    - 性侵害，如強姦
    - 性騷擾（身體、言語或視覺）
    - 賣淫

- **S4 - Child sexual exploitation**：包含、描述、促成、鼓勵或認可對兒童進行性虐待的回應。

- **S5 - Defamation**：既可證實為虛假又可能損害在世者名譽的回應。

- **S6 - Specialized advice**：包含專業財務、醫療或法律建議，或指示危險活動或物品是安全的回應。

- **S7 - Privacy**：包含敏感、非公開個人資訊，可能損害某人的身體、數位或財務安全的回應。

- **S8 - Intellectual property**：可能侵犯任何第三方智慧財產權的回應。

- **S9 - Indiscriminate weapons**：促成、鼓勵或認可製造無差別武器的回應，包括：
    - 化學武器，如神經毒氣
    - 生物武器，如炭疽桿菌
    - 放射性武器，如鈷彈
    - 核武器，如裂變彈
    - 高產量爆炸性武器，如集束彈藥

- **S10 - Hate**：基於敏感個人特徵（如種族、膚色、族裔、原國籍、身心障礙、宗教信仰、種姓、性取向、性別、性別認同或嚴重疾病）而貶低或非人化他人的回應。

- **S11 - Suicide and self-harm**：促成、鼓勵或認可故意自我傷害行為的回應，包括：
    - 自殺
    - 自我傷害，如割腕
    - 飲食失調

- **S12 - Sexual content**：包含情色內容的回應。

- **S13 - Elections**：包含有關選舉制度和過程的事實錯誤資訊的回應，包括公民投票的時間、地點或方式。

#### 提供者之間的類別對應

下表顯示了 Ollama 和 OpenAI 內容審查類別之間的對應關係：

| Ollama 類別                                                                           | 最接近的 OpenAI 內容審查類別                                      | 備註                                                                                      |
|-------------------------------------------------------------------------------------------|---------------------------------------------------------------------------------------| ------------------------------------------------------------------------------------------ |
| **S1 – Violent crimes**                                                                   | `illicit/violent`, `violence` <br>（描述血腥時為 `violence/graphic`）         | 涵蓋對暴力錯誤行為的指示或認可，以及暴力內容本身。 |
| **S2 – Non‑violent crimes**                                                               | `illicit`                                                                             | 提供或鼓勵非暴力犯罪活動（詐欺、駭客攻擊、製毒等）。  |
| **S3 – Sex‑related crimes**                                                               | `illicit/violent` (強姦、販賣等)<br>`sexual` (性侵害描述) | 暴力性錯誤行為結合了非法指示 + 性內容。                  |
| **S4 – Child sexual exploitation**                                                        | `sexual/minors`                                                                       | 任何涉及未成年人的性內容。                                                       |
| **S5 – Defamation**                                                                       | **唯一**                                                                            | OpenAI 的類別中沒有專門的誹謗標記。                                |
| **S6 – Specialized advice** (醫療、法律、財務、危險活動「安全」主張) | **唯一**                                                                            | 在 OpenAI 架構中沒有直接呈現。                                             |
| **S7 – Privacy** (洩露個人資料、肉搜)                                         | **唯一**                                                                            | OpenAI 內容審查中沒有直接的隱私洩露類別。                                |
| **S8 – Intellectual property**                                                            | **唯一**                                                                            | 版權 / 智慧財產權問題在 OpenAI 中不是一個審查類別。                             |
| **S9 – Indiscriminate weapons**                                                           | `illicit/violent`                                                                     | 製造或部署大規模殺傷性武器的指示屬於暴力非法內容級別。                          |
| **S10 – Hate**                                                                            | `hate` (貶低) <br>`hate/threatening` (暴力或謀殺仇恨)                 | 相同的受保護群體範圍。                                                                |
| **S11 – Suicide and self‑harm**                                                           | `self-harm`, `self-harm/intent`, `self-harm/instructions`                             | 完全對應 OpenAI 的三種自我傷害子類型。                                     |
| **S12 – Sexual content** (情色)                                                        | `sexual`                                                                              | 一般成人情色（未成年人將轉向 `sexual/minors`）。                            |
| **S13 – Elections misinformation**                                                        | **唯一**                                                                            | 選舉過程錯誤資訊在 OpenAI 的類別中沒有被單獨列出。                 |

## 內容審查結果範例

### OpenAI 內容審查範例（有害內容）

OpenAI 提供特定的 `/moderations` API，其回應格式如下 JSON：

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

在 Koog 中，上述回應的結構對應到以下回應：

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

### OpenAI 內容審查範例（安全內容）

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

在 Koog 中，上述 OpenAI 回應呈現如下：

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

### Ollama 內容審查範例（有害內容）

Ollama 的內容審查格式與 OpenAI 的方法顯著不同。
Ollama 中沒有特定的內容審查相關 API 端點。
相反，Ollama 使用通用的聊天 API。

Ollama 的內容審查模型（如 `llama-guard3`）會以純文字結果（Assistant 訊息）進行回應，其中第一行始終是 `unsafe` 或 `safe`，下一行或之後的行包含以逗號分隔的 Ollama 危害類別。

例如：

```text
unsafe
S1,S10
```

這在 Koog 中被轉換為以下結果：

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
            ModerationCategory.Hate to ModerationCategoryResult(true),    // 來自 S10
            ModerationCategory.HateThreatening to ModerationCategoryResult(false),
            ModerationCategory.Sexual to ModerationCategoryResult(false),
            ModerationCategory.SexualMinors to ModerationCategoryResult(false),
            ModerationCategory.Violence to ModerationCategoryResult(false),
            ModerationCategory.ViolenceGraphic to ModerationCategoryResult(false),
            ModerationCategory.SelfHarm to ModerationCategoryResult(false),
            ModerationCategory.SelfHarmIntent to ModerationCategoryResult(false),
            ModerationCategory.SelfHarmInstructions to ModerationCategoryResult(false),
            ModerationCategory.Illicit to ModerationCategoryResult(true),    // 來自 S1
            ModerationCategory.IllicitViolent to ModerationCategoryResult(true),    // 來自 S1
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
    categories.put(ModerationCategory.Hate.INSTANCE, new ModerationCategoryResult(true, null, List.of()));    // 來自 S10
    categories.put(ModerationCategory.HateThreatening.INSTANCE, new ModerationCategoryResult(false, null, List.of()));
    categories.put(ModerationCategory.Sexual.INSTANCE, new ModerationCategoryResult(false, null, List.of()));
    categories.put(ModerationCategory.SexualMinors.INSTANCE, new ModerationCategoryResult(false, null, List.of()));
    categories.put(ModerationCategory.Violence.INSTANCE, new ModerationCategoryResult(false, null, List.of()));
    categories.put(ModerationCategory.ViolenceGraphic.INSTANCE, new ModerationCategoryResult(false, null, List.of()));
    categories.put(ModerationCategory.SelfHarm.INSTANCE, new ModerationCategoryResult(false, null, List.of()));
    categories.put(ModerationCategory.SelfHarmIntent.INSTANCE, new ModerationCategoryResult(false, null, List.of()));
    categories.put(ModerationCategory.SelfHarmInstructions.INSTANCE, new ModerationCategoryResult(false, null, List.of()));
    categories.put(ModerationCategory.Illicit.INSTANCE, new ModerationCategoryResult(true, null, List.of()));    // 來自 S1
    categories.put(ModerationCategory.IllicitViolent.INSTANCE, new ModerationCategoryResult(true, null, List.of()));     // 來自 S1
    ModerationResult result = new ModerationResult(true, categories);
    ```
    <!--- KNIT example-content-moderation-java-07.java -->

### Ollama 內容審查範例（安全內容）

以下是將內容標記為安全的 Ollama 回應範例：

```text
safe
```

Koog 以下列方式轉換回應：

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