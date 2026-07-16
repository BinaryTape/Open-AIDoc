# 结构化输出

## 简介

结构化输出 API 提供了一种方式，确保大语言模型 (LLM) 的响应符合特定的数据结构。
这对于构建可靠的 AI 应用程序至关重要，因为在这类程序中，您需要可预测、格式良好的数据，而非自由格式的文本。

本页面将说明如何使用此 API 定义数据结构、生成架构 (schema) 以及向 LLM 请求结构化响应。

## 关键组件与概念

结构化输出 API 由几个关键组件组成：

1. **数据结构定义**：使用 kotlinx.serialization 和 LLM 特定注解进行标注的 Kotlin 数据类。
2. **JSON 架构生成**：从 Kotlin 数据类生成 JSON 架构的工具。
3. **结构化 LLM 请求**：向 LLM 请求符合定义结构的响应的方法。
4. **响应处理**：处理和验证结构化响应。

## 定义数据结构

使用结构化输出 API 的第一步是使用 Kotlin 数据类定义数据结构。

### 基础结构

<!--- INCLUDE
import ai.koog.agents.core.tools.annotations.LLMDescription
import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable
-->
```kotlin
@Serializable
@SerialName("WeatherForecast")
@LLMDescription("给定地点的天气预报")
data class WeatherForecast(
    @property:LLMDescription("摄氏温度")
    val temperature: Int,
    @property:LLMDescription("天气状况（例如：晴天、多云、下雨）")
    val conditions: String,
    @property:LLMDescription("降水概率百分比")
    val precipitation: Int
)
```
<!--- KNIT example-structured-data-01.kt -->

### 关键注解

- `@Serializable`：kotlinx.serialization 处理该类所必需的。
- `@SerialName`：指定序列化时使用的名称。
- `@LLMDescription`：为 LLM 提供类的描述。对于字段注解，请使用 `@property:LLMDescription`。

### 支持的功能

该 API 支持广泛的数据结构功能：

#### 嵌套类

<!--- INCLUDE
import ai.koog.agents.core.tools.annotations.LLMDescription
import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable
-->
```kotlin
@Serializable
@SerialName("WeatherForecast")
data class WeatherForecast(
    // 其他字段
    @property:LLMDescription("地点的坐标")
    val latLon: LatLon
) {
    @Serializable
    @SerialName("LatLon")
    data class LatLon(
        @property:LLMDescription("地点的纬度")
        val lat: Double,
        @property:LLMDescription("地点的经度")
        val lon: Double
    )
}
```
<!--- KNIT example-structured-data-02.kt -->

#### 集合（列表和映射）

<!--- INCLUDE
import ai.koog.agents.core.tools.annotations.LLMDescription
import io.ktor.http.*
import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable

@Serializable
data class WeatherNews(val temperature: Double)

@Serializable
data class WeatherSource(val url: Url)
-->
```kotlin
@Serializable
@SerialName("WeatherForecast")
data class WeatherForecast(
    // 其他字段
    @property:LLMDescription("新闻文章列表")
    val news: List<WeatherNews>,
    @property:LLMDescription("天气源映射")
    val sources: Map<String, WeatherSource>
)
```
<!--- KNIT example-structured-data-03.kt -->

#### 枚举

<!--- INCLUDE
import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable
-->
```kotlin
@Serializable
@SerialName("Pollution")
enum class Pollution { Low, Medium, High }
```
<!--- KNIT example-structured-data-04.kt -->

#### 使用密封类的多态

<!--- INCLUDE
import ai.koog.agents.core.tools.annotations.LLMDescription
import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable
-->
```kotlin
@Serializable
@SerialName("WeatherAlert")
sealed class WeatherAlert {
    abstract val severity: Severity
    abstract val message: String

    @Serializable
    @SerialName("Severity")
    enum class Severity { Low, Moderate, Severe, Extreme }

    @Serializable
    @SerialName("StormAlert")
    data class StormAlert(
        override val severity: Severity,
        override val message: String,
        @property:LLMDescription("风速，单位 km/h")
        val windSpeed: Double
    ) : WeatherAlert()

    @Serializable
    @SerialName("FloodAlert")
    data class FloodAlert(
        override val severity: Severity,
        override val message: String,
        @property:LLMDescription("预期降雨量，单位 mm")
        val expectedRainfall: Double
    ) : WeatherAlert()
}
```
<!--- KNIT example-structured-data-05.kt -->

### 提供示例

您可以提供示例来帮助 LLM 理解预期的格式：

<!--- INCLUDE
import ai.koog.agents.example.exampleStructuredData03.WeatherForecast
import ai.koog.agents.example.exampleStructuredData03.WeatherNews
import ai.koog.agents.example.exampleStructuredData03.WeatherSource
import io.ktor.http.*
-->
```kotlin
val exampleForecasts = listOf(
  WeatherForecast(
    news = listOf(WeatherNews(0.0), WeatherNews(5.0)),
    sources = mutableMapOf(
      "openweathermap" to WeatherSource(Url("https://api.openweathermap.org/data/2.5/weather")),
      "googleweather" to WeatherSource(Url("https://weather.google.com"))
    )
    // 其他字段
  ),
  WeatherForecast(
    news = listOf(WeatherNews(25.0), WeatherNews(35.0)),
    sources = mutableMapOf(
      "openweathermap" to WeatherSource(Url("https://api.openweathermap.org/data/2.5/weather")),
      "googleweather" to WeatherSource(Url("https://weather.google.com"))
    )
  )
)

```
<!--- KNIT example-structured-data-06.kt -->

## 请求结构化响应

在 Koog 中，您可以在三个主要层级使用结构化输出：

1. **提示词执行器层**：使用提示词执行器直接进行 LLM 调用
2. **智能体 LLM 上下文层**：在智能体会话中用于对话上下文
3. **节点层**：创建具有结构化输出能力的可复用智能体节点

### 第 1 层：提示词执行器

提示词执行器层提供了进行结构化 LLM 调用最直接的方式。对于单个独立的请求，请使用 `executeStructured` 方法：

此方法执行提示词并确保响应结构正确，其方式包括：

- 根据[模型能力](./model-capabilities.md)自动选择最佳的结构化输出方案
- 必要时在原始提示词中注入结构化输出指令
- 在可用时使用原生结构化输出支持
- 可选地，当解析失败时，通过辅助 LLM 提供自动错误修正（通过 `fixingParser` 参数）

以下是使用 `executeStructured` 方法的示例：

<!--- INCLUDE
import ai.koog.agents.example.exampleStructuredData03.WeatherForecast
import ai.koog.agents.example.exampleStructuredData06.exampleForecasts
import ai.koog.prompt.dsl.prompt
import ai.koog.prompt.executor.clients.openai.OpenAIModels
import ai.koog.prompt.executor.llms.all.simpleOpenAIExecutor
import ai.koog.prompt.executor.model.executeStructured
import ai.koog.prompt.executor.model.StructureFixingParser
import kotlinx.coroutines.runBlocking

fun main() {
    runBlocking {
-->
<!--- SUFFIX
    }
}
-->
```kotlin
// 定义一个简单的单供应商提示词执行器
val promptExecutor = simpleOpenAIExecutor(System.getenv("OPENAI_KEY"))

// 进行返回结构化响应的 LLM 调用
val structuredResponse = promptExecutor.executeStructured<WeatherForecast>(
        // 定义提示词（包括系统消息和用户消息）
        prompt = prompt("structured-data") {
            system(
                """
                你是一个天气预报助手。
                当被问及天气预报时，请提供一个真实但虚构的预报。
                """.trimIndent()
            )
            user(
              "阿姆斯特丹的天气预报是什么？"
            )
        },
        // 定义执行请求的主模型
        model = OpenAIModels.Chat.GPT4oMini,
        // 可选：提供示例以帮助模型理解格式
        examples = exampleForecasts,
        // 可选：提供修复解析器用于错误修正
        fixingParser = StructureFixingParser(
            model = OpenAIModels.Chat.GPT4o,
            retries = 3
        )
    )
```
<!--- KNIT example-structured-data-07.kt -->

`executeStructured` 方法接受以下参数：

| 名称 | 数据类型 | 必填 | 默认值 | 描述 |
|----------------|------------------------|----------|---------------|-----------------------------------------------------------------------------------------------------------------|
| `prompt` | Prompt | 是 | | 要执行的提示词。有关更多信息，请参阅[提示词](prompts/index.md)。 |
| `model` | LLModel | 是 | | 执行提示词的主模型。 |
| `examples` | `List<T>` | 否 | `emptyList()` | 可选的示例列表，帮助模型理解预期的格式。 |
| `fixingParser` | StructureFixingParser? | 否 | `null` | 可选的解析器，通过使用辅助 LLM 智能修复解析错误来处理格式错误的响应。提供后，将自动对解析失败的响应进行带错误修正的重试。 |

该方法返回一个 `Result<StructuredResponse<T>>`，其中包含成功解析的结构化数据或错误。

### 第 2 层：智能体 LLM 上下文

智能体 LLM 上下文层允许您在智能体会话中请求结构化响应。这对于构建在流程中特定点需要结构化数据的对话智能体非常有用。

在 `writeSession` 中使用 `requestLLMStructured` 方法进行基于智能体的交互：

<!--- INCLUDE
import ai.koog.agents.core.dsl.builder.strategy
import ai.koog.agents.core.dsl.builder.node
import ai.koog.agents.example.exampleStructuredData03.WeatherForecast
import ai.koog.agents.example.exampleStructuredData06.exampleForecasts
import ai.koog.prompt.executor.clients.openai.OpenAIModels
import ai.koog.prompt.executor.model.StructureFixingParser

val strategy = strategy<Unit, Unit>("strategy-name") {
    val node by node<Unit, Unit> {
-->
<!--- SUFFIX
    }
}
-->
```kotlin
val structuredResponse = llm.writeSession {
    requestLLMStructured<WeatherForecast>(
        examples = exampleForecasts,
        fixingParser = StructureFixingParser(
            model = OpenAIModels.Chat.GPT4o,
            retries = 3
        )
    )
}
```
<!--- KNIT example-structured-data-08.kt -->

`fixingParser` 参数为格式错误的 JSON 响应提供自动错误修正。当解析失败时，它会使用辅助 LLM 智能地修复响应，直到达到指定的重试次数。

**StructureFixingParser 参数：**
- `model: LLModel` - 用于修复格式错误 JSON 输出的 LLM
- `retries: Int` - 最大修复尝试次数（默认值：3）
- `prompt` - 可选的自定义提示词函数，用于修复过程（默认为内置的修复提示词）

修复过程会迭代地将解析错误传递给辅助模型，该模型会尝试纠正 JSON，同时保留原始数据并进行最小限度的更改。

#### 与智能体策略集成

您可以将结构化数据处理集成到您的智能体策略中：

<!--- INCLUDE
import ai.koog.agents.core.dsl.builder.forwardTo
import ai.koog.agents.core.dsl.builder.strategy
import ai.koog.agents.core.dsl.builder.node
import ai.koog.agents.core.dsl.extension.nodeLLMRequest
import ai.koog.agents.example.exampleStructuredData03.WeatherForecast
import ai.koog.prompt.executor.clients.openai.OpenAIModels
import ai.koog.prompt.message.Message
import ai.koog.prompt.executor.model.StructureFixingParser
-->
```kotlin
val agentStrategy = strategy("weather-forecast") {
    val setup by nodeLLMRequest()

    val getStructuredForecast by node<Message.Response, String> { _ ->
        val structuredResponse = llm.writeSession {
            requestLLMStructured<WeatherForecast>(
                fixingParser = StructureFixingParser(
                    model = OpenAIModels.Chat.GPT4o,
                    retries = 3
                )
            )
        }

        """
        响应结构：
        $structuredResponse
        """.trimIndent()
    }

    edge(nodeStart forwardTo setup)
    edge(setup forwardTo getStructuredForecast)
    edge(getStructuredForecast forwardTo nodeFinish)
}
```
<!--- KNIT example-structured-data-09.kt -->

### 第 3 层：节点层

节点层为智能体工作流中的结构化输出提供了最高级别的抽象。使用 `nodeLLMRequestStructured` 创建处理结构化数据的可复用智能体节点。

这会创建一个智能体节点，该节点：
- 接收 `String` 输入（用户消息）
- 将消息附加到 LLM 提示词
- 向 LLM 请求结构化输出
- 返回 `Result<StructuredResponse<MyStruct>>`

#### 节点层示例

<!--- INCLUDE
import ai.koog.agents.core.dsl.builder.forwardTo
import ai.koog.agents.core.dsl.builder.strategy
import ai.koog.agents.core.dsl.builder.node
import ai.koog.agents.core.dsl.extension.nodeLLMRequest
import ai.koog.agents.core.dsl.extension.nodeLLMRequestStructured
import ai.koog.agents.example.exampleStructuredData03.WeatherForecast
import ai.koog.agents.example.exampleStructuredData06.exampleForecasts
import ai.koog.prompt.executor.clients.openai.OpenAIModels
import ai.koog.prompt.structure.StructuredResponse
import ai.koog.prompt.executor.model.StructureFixingParser
-->
```kotlin
val agentStrategy = strategy("weather-forecast") {
    val setup by node<Unit, String> { _ ->
        "请提供阿姆斯特丹的天气预报"
    }
    
    // 使用委托语法创建结构化输出节点
    val getWeatherForecast by nodeLLMRequestStructured<WeatherForecast>(
        name = "forecast-node",
        examples = exampleForecasts,
        fixingParser = StructureFixingParser(
            model = OpenAIModels.Chat.GPT4o,
            retries = 3
        )
    )
    
    val processResult by node<Result<StructuredResponse<WeatherForecast>>, String> { result ->
        when {
            result.isSuccess -> {
                val forecast = result.getOrNull()?.data
                "天气预报：$forecast"
            }
            result.isFailure -> {
                "获取结构化预报失败：${result.exceptionOrNull()?.message}"
            }
            else -> "未知结果状态"
        }
    }

    edge(nodeStart forwardTo setup)
    edge(setup forwardTo getWeatherForecast)
    edge(getWeatherForecast forwardTo processResult)
    edge(processResult forwardTo nodeFinish)
}
```
<!--- KNIT example-structured-data-10.kt -->

#### 完整代码示例

以下是使用结构化输出 API 的完整示例：

<!--- INCLUDE
import ai.koog.agents.core.agent.AIAgent
import ai.koog.agents.core.agent.config.AIAgentConfig
import ai.koog.agents.core.dsl.builder.forwardTo
import ai.koog.agents.core.dsl.builder.strategy
import ai.koog.agents.core.dsl.builder.node
import ai.koog.agents.core.dsl.extension.nodeLLMRequest
import ai.koog.agents.core.tools.ToolRegistry
import ai.koog.agents.core.tools.annotations.LLMDescription
import ai.koog.prompt.dsl.prompt
import ai.koog.prompt.executor.clients.openai.OpenAIModels
import ai.koog.prompt.executor.llms.all.simpleOpenAIExecutor
import ai.koog.prompt.message.Message
import ai.koog.prompt.structure.json.generator.BasicJsonSchemaGenerator
import ai.koog.prompt.structure.json.JsonStructure
import kotlinx.coroutines.runBlocking
import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable
-->
```kotlin
// 注意：为了简洁，省略了导入语句
@Serializable
@SerialName("SimpleWeatherForecast")
@LLMDescription("地点的简单天气预报")
data class SimpleWeatherForecast(
    @property:LLMDescription("地点名称")
    val location: String,
    @property:LLMDescription("摄氏温度")
    val temperature: Int,
    @property:LLMDescription("天气状况（例如：晴天、多云、下雨）")
    val conditions: String
)

val token = System.getenv("OPENAI_KEY") ?: error("未设置环境变量 OPENAI_KEY")

fun main(): Unit = runBlocking {
    // 创建示例预报
    val exampleForecasts = listOf(
        SimpleWeatherForecast(
            location = "纽约",
            temperature = 25,
            conditions = "晴天"
        ),
        SimpleWeatherForecast(
            location = "伦敦",
            temperature = 18,
            conditions = "多云"
        )
    )

    // 生成 JSON 架构
    val forecastStructure = JsonStructure.create<SimpleWeatherForecast>(
        schemaGenerator = BasicJsonSchemaGenerator.Default,
        examples = exampleForecasts
    )

    // 定义智能体策略
    val agentStrategy = strategy("weather-forecast") {
        val setup by nodeLLMRequest()
  
        val getStructuredForecast by node<Message.Response, String> { _ ->
            val structuredResponse = llm.writeSession {
                requestLLMStructured<SimpleWeatherForecast>()
            }
  
            """
            响应结构：
            $structuredResponse
            """.trimIndent()
        }
  
        edge(nodeStart forwardTo setup)
        edge(setup forwardTo getStructuredForecast)
        edge(getStructuredForecast forwardTo nodeFinish)
    }

    // 配置并运行智能体
    val agentConfig = AIAgentConfig(
        prompt = prompt("weather-forecast-prompt") {
            system(
                """
                你是一个天气预报助手。
                当被问及天气预报时，请提供一个真实但虚构的预报。
                """.trimIndent()
            )
        },
        model = OpenAIModels.Chat.GPT4o,
        maxAgentIterations = 5
    )

    val runner = AIAgent(
        promptExecutor = simpleOpenAIExecutor(token),
        toolRegistry = ToolRegistry.EMPTY,
        strategy = agentStrategy,
        agentConfig = agentConfig
    )

    runner.run("获取巴黎的天气预报")
}
```
<!--- KNIT example-structured-data-11.kt -->

## 高级用法

上述示例展示了根据模型能力自动选择最佳结构化输出方案的简化 API。
为了更好地控制结构化输出过程，您可以使用带有手动架构创建和供应商特定配置的高级 API。

### 手动架构创建与配置

除了依赖自动架构生成外，您还可以使用 `JsonStructure.create` 显式创建架构，并通过 `StructuredOutput` 类手动配置结构化输出行为。

关键区别在于，您不再传递简单的参数（如 `examples` 和 `fixingParser`），而是创建一个 `StructuredRequestConfig` 对象，以便对以下各项进行精细控制：

- **架构生成**：选择特定的生成器（标准版、基础版或供应商特定版）
- **输出模式**：原生结构化输出支持对比手动提示
- **供应商映射**：针对不同的 LLM 供应商使用不同的配置
- **回退策略**：当供应商特定配置不可用时的默认行为

<!--- INCLUDE
import ai.koog.agents.example.exampleStructuredData03.WeatherForecast
import ai.koog.agents.example.exampleStructuredData06.exampleForecasts
import ai.koog.prompt.dsl.prompt
import ai.koog.prompt.executor.clients.openai.OpenAIModels
import ai.koog.prompt.executor.clients.anthropic.AnthropicModels
import ai.koog.prompt.executor.llms.all.simpleOpenAIExecutor
import ai.koog.prompt.executor.model.executeStructured
import ai.koog.prompt.structure.StructuredRequest
import ai.koog.prompt.executor.model.StructureFixingParser
import ai.koog.prompt.structure.json.JsonStructure
import ai.koog.prompt.structure.json.generator.StandardJsonSchemaGenerator
import ai.koog.prompt.executor.clients.openai.base.structure.OpenAIBasicJsonSchemaGenerator
import ai.koog.prompt.executor.clients.anthropic.structure.AnthropicBasicJsonSchemaGenerator
import ai.koog.prompt.llm.LLMProvider
import kotlinx.coroutines.runBlocking
import ai.koog.prompt.structure.StructuredRequestConfig

fun main() {
    runBlocking {
-->
<!--- SUFFIX
    }
}
-->
```kotlin
// 使用不同的生成器创建不同的架构结构
val genericStructure = JsonStructure.create<WeatherForecast>(
    schemaGenerator = StandardJsonSchemaGenerator,
    examples = exampleForecasts
)

val openAiStructure = JsonStructure.create<WeatherForecast>(
    schemaGenerator = OpenAIBasicJsonSchemaGenerator,
    examples = exampleForecasts
)

val anthropicStructure = JsonStructure.create<WeatherForecast>(
    schemaGenerator = AnthropicBasicJsonSchemaGenerator,
    examples = exampleForecasts
)

val promptExecutor = simpleOpenAIExecutor(System.getenv("OPENAI_KEY"))

// 高级 API 使用 StructuredRequestConfig 而非简单参数
val structuredResponse = promptExecutor.executeStructured(
    prompt = prompt("structured-data") {
        system("你是一个天气预报助手。")
        user("阿姆斯特丹的天气预报是什么？")
    },
    model = OpenAIModels.Chat.GPT4oMini,
    config = StructuredRequestConfig(
        byProvider = mapOf(
            LLMProvider.OpenAI to StructuredRequest.Native(openAiStructure),
            LLMProvider.Anthropic to StructuredRequest.Native(anthropicStructure),
        ),
        default = StructuredRequest.Manual(genericStructure)
    ),
    fixingParser = StructureFixingParser(
        model = AnthropicModels.Haiku_4_5,
        retries = 2
    )
)
```
<!--- KNIT example-structured-data-12.kt -->

### 架构生成器

根据您的需求，可以使用不同的架构生成器：

- **StandardJsonSchemaGenerator**：完整的 JSON 架构，支持多态、定义和递归引用。
- **BasicJsonSchemaGenerator**：不带多态支持的简化架构，与更多模型兼容。
- **供应商特定生成器**：针对特定 LLM 供应商（OpenAI、Anthropic、Google 等）优化的架构。

### 跨层级用法

高级配置在 API 的所有三个层级中保持一致。方法名称保持不变，仅参数从简单参数变为更高级的 `StructuredRequestConfig`：

- **提示词执行器**：`executeStructured(prompt, model, config: StructuredRequestConfig<T>)`
- **智能体 LLM 上下文**：`requestLLMStructured(config: StructuredRequestConfig<T>)`
- **节点层**：`nodeLLMRequestStructured(config: StructuredRequestConfig<T>)`

对于大多数用例，建议使用简化 API（仅使用 `examples` 和 `fixingParser` 参数），而高级 API 则在需要额外控制时提供支持。

## 最佳做法

1. **使用清晰的描述**：使用 `@LLMDescription` 注解提供清晰详细的描述，帮助 LLM 理解预期数据。

2. **提供示例**：包含有效数据结构的示例以引导 LLM。

3. **优雅处理错误**：实现适当的错误处理，以应对 LLM 可能无法生成有效结构的情况。

4. **使用合适的架构类型**：根据您的需求和所使用的 LLM 的能力，选择合适的架构格式和类型。

5. **使用不同模型进行测试**：不同的 LLM 遵循结构化格式的能力各不相同，因此尽可能使用多个模型进行测试。

6. **从简单开始**：先从简单的结构开始，逐步根据需要增加复杂性。

7. **谨慎使用多态**：虽然 API 支持使用密封类的多态，但请注意，LLM 正确处理多态可能更具挑战性。