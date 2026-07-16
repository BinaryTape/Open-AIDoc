# 内容审核

内容审核是分析文本、图像或其他内容以识别潜在有害、不当或不安全材料的过程。在 AI 系统背景下，审核有助于：

- 过滤掉有害或不当的用户输入
- 防止生成有害或不当的 AI 响应
- 确保符合伦理准则和法律要求
- 保护用户免受潜在有害内容的侵害

审核系统通常会根据预定义的有害内容类别（如仇恨言论、暴力、性内容等）分析内容，并判定该内容是否违反了这些类别中的任何政策。

内容审核在 AI 应用程序中至关重要，原因如下：

- **安全与保障**
    - 保护用户免受有害、冒犯或干扰性内容的侵害
    - 防止误用 AI 系统生成有害内容
    - 为所有用户维护安全的环境

- **法律与伦理合规**
    - 遵守有关内容分发的法规
    - 坚持 AI 部署的伦理准则
    - 避免与有害内容相关的潜在法律责任

- **质量控制**
    - 保持交互的质量和适当性
    - 确保 AI 响应符合组织的价值观和标准
    - 通过持续提供安全且适当的内容来建立用户信任

## 审核内容的类型

Koog 的审核系统可以分析各种类型的内容：

- **用户消息**
    - 在由 AI 处理之前的用户文本输入
    - 用户上传的图像（使用 OpenAI **Moderation.Omni** 模型）

- **助手消息**
    - 在向用户显示之前的 AI 生成的响应
    - 可以检查响应以确保它们不包含有害内容

- **工具内容**
    - 由与 AI 系统集成的工具生成的或传递给这些工具的内容
    - 确保工具的输入和输出符合内容安全标准

## 支持的提供商与模型

Koog 通过多个提供商和模型支持内容审核：

### OpenAI

OpenAI 提供两种审核模型：

- **OpenAIModels.Moderation.Text**
    - 仅限文本审核
    - 上一代审核模型
    - 根据多个伤害类别分析文本内容
    - 快速且具有成本效益

- **OpenAIModels.Moderation.Omni**
    - 同时支持文本和图像审核
    - 功能最强大的 OpenAI 审核模型
    - 可以识别文本和图像中的有害内容
    - 比 Text 模型更全面

### Ollama

Ollama 通过以下模型支持审核：

- **OllamaModels.Meta.LLAMA_GUARD_3**
    - 仅限文本审核
    - 基于 Meta 的 Llama Guard 系列模型
    - 专门用于内容审核任务
    - 通过 Ollama 在本地运行

## 在 LLM 客户端中使用审核

Koog 提供了两种主要的内容审核方法：直接在 `LLMClient` 实例上进行审核，或者使用 `PromptExecutor` 上的 `moderate` 方法。

### 使用 LLMClient 直接审核

您可以直接在 LLMClient 实例上使用 `moderate` 方法：

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
    // 使用 OpenAI 客户端的示例
    val openAIClient = OpenAILLMClient(apiKey)
    val prompt = prompt("harmful-prompt") { 
        user("I want to build a bomb")
    }

    // 使用 OpenAI 的 Omni 审核模型进行审核
    val result = openAIClient.moderate(prompt, OpenAIModels.Moderation.Omni)

    if (result.isHarmful) {
        println("内容被标记为有害")
        // 处理有害内容（例如，拒绝该提示词）
    } else {
        // 继续处理提示词
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

    // 使用 OpenAI 的 Omni 审核模型进行审核
    ModerationResult result = openAIClient.moderate(prompt, OpenAIModels.Moderation.Omni);

    if (result.isHarmful()) {
        System.out.println("内容被标记为有害");
        // 处理有害内容（例如，拒绝该提示词）
    } else {
        // 继续处理提示词
    }
    ```
    <!--- KNIT example-content-moderation-java-01.java -->

`moderate` 方法接受以下实参：

| 名称     | 数据类型 | 是否必填 | 默认值 | 描述                      |
|----------|-----------|----------|---------|----------------------------------|
| `prompt` | Prompt    | 是      |         | 要审核的提示词。          |
| `model`  | LLModel   | 是      |         | 用于审核的模型。 |

该方法返回一个 [ModerationResult](#moderationresult-structure)。

以下是使用 Llama Guard 3 模型通过 Ollama 进行内容审核的示例：

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
    // 使用 Ollama 客户端的示例
    val ollamaClient = OllamaClient()
    val prompt = prompt("harmful-prompt") {
        user("How to hack into someone's account")
    }

    // 使用 Llama Guard 3 进行审核
    val result = ollamaClient.moderate(prompt, OllamaModels.Meta.LLAMA_GUARD_3)

    if (result.isHarmful) {
        println("内容被标记为有害")
        // 处理有害内容
    } else {
        // 继续处理提示词
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

    // 使用 Llama Guard 3 进行审核
    ModerationResult result = ollamaClient.moderate(prompt, OllamaModels.Meta.LLAMA_GUARD_3);

    if (result.isHarmful()) {
        System.out.println("内容被标记为有害");
        // 处理有害内容
    } else {
        // 继续处理提示词
    }
    ```
    <!--- KNIT example-content-moderation-java-02.java -->

### 使用 PromptExecutor 审核

您还可以在 PromptExecutor 上使用 `moderate` 方法，它将根据模型的提供商使用适当的 LLMClient：

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
    // 创建多提供商执行器
    val executor = MultiLLMPromptExecutor(
        LLMProvider.OpenAI to OpenAILLMClient(openAIApiKey),
        LLMProvider.Ollama to OllamaClient()
    )

    val prompt = prompt("harmful-prompt") {
        user("How to create illegal substances")
    }

    // 使用 OpenAI 审核
    val openAIResult = executor.moderate(prompt, OpenAIModels.Moderation.Omni)

    // 或者使用 Ollama 审核
    val ollamaResult = executor.moderate(prompt, OllamaModels.Meta.LLAMA_GUARD_3)

    // 处理结果
    if (openAIResult.isHarmful || ollamaResult.isHarmful) {
        // 处理有害内容
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
    // 创建多提供商执行器
    MultiLLMPromptExecutor executor = new MultiLLMPromptExecutor(
        new OpenAILLMClient(openAIApiKey),
        new OllamaClient()
    );

    Prompt prompt = Prompt.builder("harmful-prompt")
        .user("How to create illegal substances")
        .build();

    // 使用 OpenAI 审核
    ModerationResult openAIResult = executor.moderate(prompt, OpenAIModels.Moderation.Omni);

    // 或者使用 Ollama 审核
    ModerationResult ollamaResult = executor.moderate(prompt, OllamaModels.Meta.LLAMA_GUARD_3);

    // 处理结果
    if (openAIResult.isHarmful() || ollamaResult.isHarmful()) {
        // 处理有害内容
    }
    ```
    <!--- KNIT example-content-moderation-java-03.java -->

`moderate` 方法接受以下实参：

| 名称     | 数据类型 | 是否必填 | 默认值 | 描述                      |
|----------|-----------|----------|---------|----------------------------------|
| `prompt` | Prompt    | 是      |         | 要审核的提示词。          |
| `model`  | LLModel   | 是      |         | 用于审核的模型。 |

该方法返回一个 [ModerationResult](#moderationresult-structure)。

## ModerationResult 结构

审核过程返回一个具有以下结构的 `ModerationResult` 对象：

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
         * 在审核结果中被标记为已检测到的审核类别列表。
         *
         * 用于识别在被审核内容中发现的特定违规类型。
         */
        public val violatedCategories: `List<ModerationCategory>` = categories.filter { it.value.detected }.keys.toList()

        /**
         * 表示为内容审核提供的输入类型。
         *
         * 此枚举与审核类别结合使用，以指定
         * 正在分析的输入的格式。
         */
        @Serializable
        public enum class InputType {
            /**
             * 此枚举值通常用于在受支持的输入类型中
             * 将输入分类为文本数据。
             */
            TEXT,

            /**
             * 表示专为处理和加工图像而设计的输入类型。
             * 此枚举常量可用于分类或确定需要基于图像输入的
             * 工作流的行为。
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

`ModerationResult` 对象包含以下属性：

| 名称             | 数据类型                                            | 是否必填 | 默认值    | 描述                                                                                |
|------------------|------------------------------------------------------|----------|------------|--------------------------------------------------------------------------------------------|
| `isHarmful`      | Boolean                                              | 是      |            | 如果为 true，则内容被标记为有害。                                               |
| `categories`     | Map&lt;ModerationCategory, ModerationCategoryResult&gt; | 是      |            | 审核类别到详细结果的映射，指示哪些类别被标记。 |
| `violatedCategories` | List&lt;ModerationCategory&gt;                       | 否       |            | 在审核结果中被标记为已检测到的审核类别列表。 |

## 审核类别

### Koog 审核类别

Koog 框架提供的可能审核类别（无论底层 LLM 和 LLM 提供商为何）如下：

1. **Harassment**: 涉及恐吓、霸凌或其他针对个人或团体的行为，意在骚扰或贬低的内容。
2. **HarassmentThreatening**: 旨在恐吓、胁迫或威胁个人或团体的有害互动或交流。
3. **Hate**: 包含被视为具有冒犯性、歧视性或基于种族、宗教、性别或其他特征表达对个人或团体仇恨元素的内容。
4. **HateThreatening**: 与仇恨相关的审核类别，重点关注不仅传播仇恨，还包含威胁性语言、行为或暗示的有害内容。
5. **Illicit**: 违反法律框架或伦理准则的内容，包括非法或不正当活动。
6. **IllicitViolent**: 涉及非法或不正当活动与暴力元素相结合的内容。
7. **SelfHarm**: 与自残或相关行为有关的内容。
8. **SelfHarmIntent**: 包含表达或指示个人自残意图的材料。
9. **SelfHarmInstructions**: 提供从事自残行为的指导、技术或鼓励的内容。
10. **Sexual**: 包含露骨性内容或性暗示的内容。
11. **SexualMinors**: 涉及在性语境下剥削、虐待或危及未成年人的内容。
12. **Violence**: 促进、煽动或描绘针对个人或团体的暴力和人身伤害的内容。
13. **ViolenceGraphic**: 包含生动描绘暴力的内容，可能对查看者造成伤害、痛苦或引发心理创伤。
14. **Defamation**: 被证实为虚假且可能损害在世人员名誉的响应。
15. **SpecializedAdvice**: 包含专业金融、医疗或法律建议的内容。
16. **Privacy**: 包含敏感、非公开的个人信息，可能破坏某人的人身、数字或财务安全的内容。
17. **IntellectualProperty**: 可能侵犯任何第三方知识产权的响应。
18. **ElectionsMisinformation**: 包含有关选举制度和流程的事实错误信息的内容，包括公民选举中投票的时间、地点或方式。

!!! note
    这些类别可能会发生变化，因为可能会添加新的审核类别，且现有类别可能会随时间演变。

#### OpenAI 审核类别

OpenAI 的审核 API 提供以下类别：

- **Harassment**: 表达、煽动或促进针对任何目标的骚扰性语言的内容。
- **Harassment/threatening**: 同时也包含对任何目标的暴力或严重伤害的骚扰内容。
- **Hate**: 基于种族、性别、民族、宗教、国籍、性取向、残疾状态或种姓表达、煽动或促进仇恨的内容。针对非受保护群体的仇恨内容属于骚扰。
- **Hate/threatening**: 同时也包含对基于种族、性别、民族、宗教、国籍、性取向、残疾状态或种姓的目标群体进行暴力或严重伤害的仇恨内容。
- **Illicit**: 就如何实施非法行为提供建议或指令的内容。像“如何入室盗窃”这样的短语将符合这一类别。
- **Illicit/violent**: 与非法类别标记的内容类型相同，但也包含对暴力或采购武器的引用。
- **Self-harm**: 促进、鼓励或描绘自残行为（如自杀、割伤和饮食失调）的内容。
- **Self-harm/intent**: 说话者表达其正在从事或打算从事自残行为（如自杀、割伤和饮食失调）的内容。
- **Self-harm/instructions**: 鼓励实施自残行为（如自杀、割伤和饮食失调），或提供关于如何实施此类行为的指令或建议的内容。
- **Sexual**: 旨在引起性兴奋的内容，例如对性活动的描述，或者促进性服务的内容（不包括性教育和健康）。
- **Sexual/minors**: 包含 18 岁以下个人的性内容。
- **Violence**: 描绘死亡、暴力或人身伤害的内容。
- **Violence/graphic**: 以生动的细节描绘死亡、暴力或人身伤害的内容。

#### Ollama 风险类别

Ollama 的 Llama Guard 模型使用以下风险类别：

- **S1 - Violent crimes**: 支持、鼓励或认可实施暴力犯罪的响应，包括：
    - 对人的非法暴力，如恐怖主义、种族灭绝、谋杀、由仇恨引发的暴力犯罪、虐待儿童、袭击、殴打、绑架。
    - 对动物的非法暴力，如虐待动物。

- **S2 - Non-violent crimes**: 支持、鼓励或认可实施非暴力犯罪的响应，包括：
    - 个人犯罪，如劳工贩卖、威胁、恐吓、由仇恨引发的非暴力犯罪
    - 金融犯罪，如欺诈、骗局、洗钱
    - 财产犯罪，如盗窃、纵火、破坏公物
    - 毒品犯罪，如制造或使用管制物质
    - 武器犯罪，如生产未经许可的枪支
    - 网络犯罪，如黑客攻击

- **S3 - Sex-related crimes**: 支持、鼓励或认可实施与性有关的犯罪的响应，包括：
    - 性贩卖
    - 性侵犯，如强奸
    - 性骚扰（身体、言语或视觉）
    - 卖淫

- **S4 - Child sexual exploitation**: 包含、描述、支持、鼓励或认可对儿童进行性虐待的响应。

- **S5 - Defamation**: 既被证实为虚假又可能损害在世人员名誉的响应。

- **S6 - Specialized advice**: 包含专业金融、医疗或法律建议，或指示危险活动或物体是安全的响应。

- **S7 - Privacy**: 包含敏感、非公开个人信息，可能破坏某人的人身、数字或财务安全系统的响应。

- **S8 - Intellectual property**: 可能侵犯任何第三方知识产权的响应。

- **S9 - Indiscriminate weapons**: 支持、鼓励或认可制造无差别杀伤武器的响应，包括：
    - 化学武器，如神经毒气
    - 生物武器，如炭疽
    - 放射性武器，如钴弹
    - 核武器，如裂变弹
    - 高当量爆炸武器，如集群弹药

- **S10 - Hate**: 基于敏感个人特征（如种族、肤色、民族、原籍国、残疾、宗教信仰、种姓、性取向、性别、性别认同或严重疾病）贬低或非人化他人的响应。

- **S11 - Suicide and self-harm**: 支持、鼓励或认可故意自残行为的响应，包括：
    - 自杀
    - 自伤，如割伤
    - 饮食失调

- **S12 - Sexual content**: 包含色情内容的响应。

- **S13 - Elections**: 包含有关选举制度和流程的事实错误信息的响应，包括公民选举中投票的时间、地点或方式。

#### 提供商之间的类别映射

下表显示了 Ollama 和 OpenAI 审核类别之间的映射：

| Ollama 类别                                                                           | 最接近的 OpenAI 审核类别                                      | 注意事项                                                                                      |
|-------------------------------------------------------------------------------------------|---------------------------------------------------------------------------------------| ------------------------------------------------------------------------------------------ |
| **S1 – 暴力犯罪**                                                                   | `illicit/violent`, `violence` <br>(描述血腥内容时为 `violence/graphic`)         | 涵盖暴力不当行为的指令或认可，以及暴力内容本身。 |
| **S2 – 非暴力犯罪**                                                               | `illicit`                                                                             | 提供或鼓励非暴力犯罪活动（欺诈、黑客攻击、制毒等）。  |
| **S3 – 性相关犯罪**                                                               | `illicit/violent` (强奸、贩卖等)<br>`sexual` (性侵犯描述) | 暴力性不当行为结合了非法指令 + 性内容。                  |
| **S4 – 儿童性剥削**                                                        | `sexual/minors`                                                                       | 任何涉及未成年人的性内容。                                                       |
| **S5 – 诽谤**                                                                       | **唯一**                                                                            | OpenAI 的类别中没有专门的诽谤标记。                                |
| **S6 – 专业建议** (医疗、法律、金融、危险活动“安全”声明) | **唯一**                                                                            | 在 OpenAI 模式中没有直接对应项。                                             |
| **S7 – 隐私** (泄露个人数据、人肉搜索)                                         | **唯一**                                                                            | OpenAI 审核中没有直接的隐私披露类别。                                |
| **S8 – 知识产权**                                                            | **唯一**                                                                            | 版权/知识产权问题在 OpenAI 中不是审核类别。                             |
| **S9 – 无差别杀伤武器**                                                           | `illicit/violent`                                                                     | 制造或部署大规模杀伤性武器的指令属于暴力非法内容。                          |
| **S10 – 仇恨**                                                                            | `hate` (贬低) <br>`hate/threatening` (暴力或杀戮性仇恨)                 | 相同的受保护类别范围。                                                                |
| **S11 – 自杀与自残**                                                           | `self-harm`, `self-harm/intent`, `self-harm/instructions`                             | 与 OpenAI 的三种自残子类型完全匹配。                                     |
| **S12 – 性内容** (色情)                                                        | `sexual`                                                                              | 普通成人色情（涉及未成年人将转为 `sexual/minors`）。                            |
| **S13 – 选举误导信息**                                                        | **唯一**                                                                            | 选举流程误导信息未在 OpenAI 的类别中单独列出。                 |

## 审核结果示例

### OpenAI 审核示例（有害内容）

OpenAI 提供特定的 `/moderations` API，它以以下 JSON 格式提供响应：

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

在 Koog 中，上述响应的结构映射到以下响应：

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

### OpenAI 审核示例（安全内容）

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

在 Koog 中，上述 OpenAI 响应表示如下：

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

### Ollama 审核示例（有害内容）

Ollama 处理审核格式的方法与 OpenAI 的方法有很大不同。
Ollama 中没有特定的审核相关 API 端点。
相反，Ollama 使用通用的聊天 API。

Ollama 审核模型（如 `llama-guard3`）以纯文本结果（助手消息）进行响应，其中第一行始终是 `unsafe` 或 `safe`，下一行或多行包含以逗号分隔的 Ollama 风险类别。

例如：

```text
unsafe
S1,S10
```
<!--- KNIT example-content-moderation-03.txt -->

这在 Koog 中被转换为以下结果：

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
            ModerationCategory.Hate to ModerationCategoryResult(true),    // 来自 S10
            ModerationCategory.HateThreatening to ModerationCategoryResult(false),
            ModerationCategory.Sexual to ModerationCategoryResult(false),
            ModerationCategory.SexualMinors to ModerationCategoryResult(false),
            ModerationCategory.Violence to ModerationCategoryResult(false),
            ModerationCategory.ViolenceGraphic to ModerationCategoryResult(false),
            ModerationCategory.SelfHarm to ModerationCategoryResult(false),
            ModerationCategory.SelfHarmIntent to ModerationCategoryResult(false),
            ModerationCategory.SelfHarmInstructions to ModerationCategoryResult(false),
            ModerationCategory.Illicit to ModerationCategoryResult(true),    // 来自 S1
            ModerationCategory.IllicitViolent to ModerationCategoryResult(true),    // 来自 S1
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
    categories.put(ModerationCategory.Hate.INSTANCE, new ModerationCategoryResult(true, null, List.of()));    // 来自 S10
    categories.put(ModerationCategory.HateThreatening.INSTANCE, new ModerationCategoryResult(false, null, List.of()));
    categories.put(ModerationCategory.Sexual.INSTANCE, new ModerationCategoryResult(false, null, List.of()));
    categories.put(ModerationCategory.SexualMinors.INSTANCE, new ModerationCategoryResult(false, null, List.of()));
    categories.put(ModerationCategory.Violence.INSTANCE, new ModerationCategoryResult(false, null, List.of()));
    categories.put(ModerationCategory.ViolenceGraphic.INSTANCE, new ModerationCategoryResult(false, null, List.of()));
    categories.put(ModerationCategory.SelfHarm.INSTANCE, new ModerationCategoryResult(false, null, List.of()));
    categories.put(ModerationCategory.SelfHarmIntent.INSTANCE, new ModerationCategoryResult(false, null, List.of()));
    categories.put(ModerationCategory.SelfHarmInstructions.INSTANCE, new ModerationCategoryResult(false, null, List.of()));
    categories.put(ModerationCategory.Illicit.INSTANCE, new ModerationCategoryResult(true, null, List.of()));    // 来自 S1
    categories.put(ModerationCategory.IllicitViolent.INSTANCE, new ModerationCategoryResult(true, null, List.of()));     // 来自 S1
    ModerationResult result = new ModerationResult(true, categories);
    ```
    <!--- KNIT example-content-moderation-java-07.java -->

### Ollama 审核示例（安全内容）

以下是 Ollama 响应将内容标记为安全的示例：

```text
safe
```
<!--- KNIT example-content-moderation-04.txt -->

Koog 以以下方式转换该响应：

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