# 結構化輸出

## 簡介

Structured Output API 提供了一種方式，確保來自大型語言模型 (LLM) 的回應符合特定的資料結構。
這對於建立可靠的 AI 應用程式至關重要，因為你需要可預測且格式良好的資料，而非自由格式的文本。

本頁面說明如何使用此 API 來定義資料結構、產生架構 (schema)，以及向 LLM 請求結構化回應。

## 關鍵組件與概念

Structured Output API 由幾個關鍵組件組成：

1. **資料結構定義**：使用 kotlinx.serialization 和 LLM 特定註解標記的 Kotlin 資料類別。
2. **JSON 架構 (JSON Schema) 產生**：從 Kotlin 資料類別產生 JSON 架構的工具。
3. **結構化 LLM 請求**：向 LLM 請求符合定義結構之回應的方法。
4. **回應處理**：處理並驗證結構化回應。

## 定義資料結構

使用 Structured Output API 的第一步是使用 Kotlin 資料類別定義你的資料結構。

### 基本結構

<!--- INCLUDE
import ai.koog.agents.core.tools.annotations.LLMDescription
import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable
-->
```kotlin
@Serializable
@SerialName("WeatherForecast")
@LLMDescription("Weather forecast for a given location")
data class WeatherForecast(
    @property:LLMDescription("Temperature in Celsius")
    val temperature: Int,
    @property:LLMDescription("Weather conditions (e.g., sunny, cloudy, rainy)")
    val conditions: String,
    @property:LLMDescription("Chance of precipitation in percentage")
    val precipitation: Int
)
```
<!--- KNIT example-structured-data-01.kt -->

### 關鍵註解

- `@Serializable`：kotlinx.serialization 處理該類別所必需。
- `@SerialName`：指定序列化期間使用的名稱。
- `@LLMDescription`：為 LLM 提供類別的描述。對於欄位註解，請使用 `@property:LLMDescription`。

### 支援的特性

此 API 支援廣泛的資料結構特性：

#### 巢狀類別 (Nested classes)

<!--- INCLUDE
import ai.koog.agents.core.tools.annotations.LLMDescription
import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable
-->
```kotlin
@Serializable
@SerialName("WeatherForecast")
data class WeatherForecast(
    // 其他欄位
    @property:LLMDescription("Coordinates of the location")
    val latLon: LatLon
) {
    @Serializable
    @SerialName("LatLon")
    data class LatLon(
        @property:LLMDescription("Latitude of the location")
        val lat: Double,
        @property:LLMDescription("Longitude of the location")
        val lon: Double
    )
}
```
<!--- KNIT example-structured-data-02.kt -->

#### 集合 (清單與映射)

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
    // 其他欄位
    @property:LLMDescription("List of news articles")
    val news: List<WeatherNews>,
    @property:LLMDescription("Map of weather sources")
    val sources: Map<String, WeatherSource>
)
```
<!--- KNIT example-structured-data-03.kt -->

#### 列舉 (Enums)

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

#### 使用密封類別的多型 (Polymorphism)

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
        @property:LLMDescription("Wind speed in km/h")
        val windSpeed: Double
    ) : WeatherAlert()

    @Serializable
    @SerialName("FloodAlert")
    data class FloodAlert(
        override val severity: Severity,
        override val message: String,
        @property:LLMDescription("Expected rainfall in mm")
        val expectedRainfall: Double
    ) : WeatherAlert()
}
```
<!--- KNIT example-structured-data-05.kt -->

### 提供範例

你可以提供範例來幫助 LLM 理解預期的格式：

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
    // 其他欄位
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

## 請求結構化回應

在 Koog 中，你可以在三個主要層級使用結構化輸出：

1. **Prompt executor 層**：使用 prompt executor 直接進行 LLM 呼叫
2. **Agent LLM 上下文層**：在 agent 工作階段 (session) 內用於對話上下文
3. **Node 層**：建立具有結構化輸出能力的可重複使用 agent 節點

### 層級 1：Prompt executor

Prompt executor 層提供了進行結構化 LLM 呼叫最直接的方式。對於單個、獨立的請求，請使用 `executeStructured` 方法：

此方法執行一個 prompt，並透過以下方式確保回應結構正確：

- 根據 [模型能力 (model capabilities)](./model-capabilities.md) 自動選擇最佳的結構化輸出方法
- 在需要時將結構化輸出指令注入原始 prompt
- 在可用時使用原生的結構化輸出支援
- 選填：當剖析失敗時，透過輔助 LLM 提供自動錯誤修正（經由 `fixingParser` 參數）

以下是使用 `executeStructured` 方法的範例：

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
// 定義一個簡單的單一提供者 prompt executor
val promptExecutor = simpleOpenAIExecutor(System.getenv("OPENAI_KEY"))

// 進行 LLM 呼叫並傳回結構化回應
val structuredResponse = promptExecutor.executeStructured<WeatherForecast>(
        // 定義 prompt（包含系統和使用者訊息）
        prompt = prompt("structured-data") {
            system(
                """
                你是一位天氣預報助手。
                當被詢問天氣預報時，請提供一個真實但虛構的預報。
                """.trimIndent()
            )
            user(
              "阿姆斯特丹的天氣預報是什麼？"
            )
        },
        // 定義將執行請求的主要模型
        model = OpenAIModels.Chat.GPT4oMini,
        // 選填：提供範例以幫助模型理解格式
        examples = exampleForecasts,
        // 選填：提供一個修復剖析器以進行錯誤修正
        fixingParser = StructureFixingParser(
            model = OpenAIModels.Chat.GPT4o,
            retries = 3
        )
    )
```
<!--- KNIT example-structured-data-07.kt -->

`executeStructured` 方法接受以下引數：

| 名稱 | 資料型別 | 是否必填 | 預設值 | 說明 |
|----------------|------------------------|----------|---------------|-------------------------------------------------------------------------------------------------|
| `prompt` | Prompt | 是 | | 要執行的 prompt。若要了解更多資訊，請參閱 [Prompts](prompts/index.md)。 |
| `model` | LLModel | 是 | | 執行 prompt 的主要模型。 |
| `examples` | `List<T>` | 否 | `emptyList()` | 選填的範例清單，可幫助模型理解預期格式。 |
| `fixingParser` | StructureFixingParser? | 否 | `null` | 選填的剖析器，透過使用輔助 LLM 智慧地修復剖析錯誤來處理格式錯誤的回應。提供時，會自動對剖析失敗進行錯誤修正並重試。 |

此方法會傳回一個 `Result<StructuredResponse<T>>`，其中包含成功剖析的結構化資料或錯誤。

### 層級 2：Agent LLM 上下文

Agent LLM 上下文層允許你在 agent 工作階段中請求結構化回應。這對於在對話流程中的特定點需要結構化資料的對話型 agent 來說非常有用。

在 `writeSession` 中使用 `requestLLMStructured` 方法進行基於 agent 的互動：

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

`fixingParser` 參數為格式錯誤的 JSON 回應提供自動錯誤修正。當剖析失敗時，它會使用輔助 LLM 智慧地修復回應，直到達到指定的重試次數。

**StructureFixingParser 參數：**
- `model: LLModel` - 用於修復格式錯誤 JSON 輸出的 LLM
- `retries: Int` - 修復嘗試的最大次數（預設值：3）
- `prompt` - 選填的修復過程自訂 prompt 函式（預設為內建的修復 prompt）

修復過程會反覆將剖析錯誤傳遞給輔助模型，輔助模型會嘗試修正 JSON，同時保留原始資料並進行最小程度的更改。

#### 與 agent 策略整合

你可以將結構化資料處理整合到你的 agent 策略中：

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
        回應結構：
        $structuredResponse
        """.trimIndent()
    }

    edge(nodeStart forwardTo setup)
    edge(setup forwardTo getStructuredForecast)
    edge(getStructuredForecast forwardTo nodeFinish)
}
```
<!--- KNIT example-structured-data-09.kt -->

### 層級 3：Node 層

Node 層為 agent 工作流程中的結構化輸出提供了最高層級的抽象。使用 `nodeLLMRequestStructured` 來建立處理結構化資料的可重複使用 agent 節點。

這會建立一個 agent 節點，它：
- 接受 `String` 輸入（使用者訊息）
- 將訊息附加到 LLM prompt
- 向 LLM 請求結構化輸出
- 傳回 `Result<StructuredResponse<MyStruct>>`

#### Node 層範例

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
        "請提供阿姆斯特丹的天氣預報"
    }
    
    // 使用委派語法建立結構化輸出節點
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
                "天氣預報：$forecast"
            }
            result.isFailure -> {
                "無法取得結構化預報：${result.exceptionOrNull()?.message}"
            }
            else -> "未知的結果狀態"
        }
    }

    edge(nodeStart forwardTo setup)
    edge(setup forwardTo getWeatherForecast)
    edge(getWeatherForecast forwardTo processResult)
    edge(processResult forwardTo nodeFinish)
}
```
<!--- KNIT example-structured-data-10.kt -->

#### 完整程式碼範例

以下是使用 Structured Output API 的完整範例：

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
// 注意：為了簡潔起見，省略了匯入陳述式
@Serializable
@SerialName("SimpleWeatherForecast")
@LLMDescription("Simple weather forecast for a location")
data class SimpleWeatherForecast(
    @property:LLMDescription("Location name")
    val location: String,
    @property:LLMDescription("Temperature in Celsius")
    val temperature: Int,
    @property:LLMDescription("Weather conditions (e.g., sunny, cloudy, rainy)")
    val conditions: String
)

val token = System.getenv("OPENAI_KEY") ?: error("環境變數 OPENAI_KEY 未設定")

fun main(): Unit = runBlocking {
    // 建立範例預報
    val exampleForecasts = listOf(
        SimpleWeatherForecast(
            location = "New York",
            temperature = 25,
            conditions = "Sunny"
        ),
        SimpleWeatherForecast(
            location = "London",
            temperature = 18,
            conditions = "Cloudy"
        )
    )

    // 產生 JSON 架構 (JSON Schema)
    val forecastStructure = JsonStructure.create<SimpleWeatherForecast>(
        schemaGenerator = BasicJsonSchemaGenerator.Default,
        examples = exampleForecasts
    )

    // 定義 agent 策略
    val agentStrategy = strategy("weather-forecast") {
        val setup by nodeLLMRequest()
  
        val getStructuredForecast by node<Message.Response, String> { _ ->
            val structuredResponse = llm.writeSession {
                requestLLMStructured<SimpleWeatherForecast>()
            }
  
            """
            回應結構：
            $structuredResponse
            """.trimIndent()
        }
  
        edge(nodeStart forwardTo setup)
        edge(setup forwardTo getStructuredForecast)
        edge(getStructuredForecast forwardTo nodeFinish)
    }

    // 配置並執行 agent
    val agentConfig = AIAgentConfig(
        prompt = prompt("weather-forecast-prompt") {
            system(
                """
                你是一位天氣預報助手。
                當被詢問天氣預報時，請提供一個真實但虛構的預報。
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

    runner.run("取得巴黎的天氣預報")
}
```
<!--- KNIT example-structured-data-11.kt -->

## 進階用法

上述範例展示了簡易版 API，它會根據模型能力自動選擇最佳的結構化輸出方法。
若要對結構化輸出過程進行更多控制，你可以使用進階 API，手動建立架構並進行特定提供者的配置。

### 手動架構建立與配置

與其依賴自動架構產生，你可以使用 `JsonStructure.create` 明確建立架構，並透過 `StructuredOutput` 類別手動配置結構化輸出行為。

關鍵區別在於，你不需要傳遞簡單的參數（如 `examples` 和 `fixingParser`），而是建立一個 `StructuredRequestConfig` 物件，這允許對以下內容進行細粒度控制：

- **架構產生**：選擇特定的產生器（標準 Standard、基本 Basic 或特定提供者 Provider-specific）
- **輸出模式**：原生結構化輸出支援 vs 手動 prompt 指導
- **提供者對應**：針對不同 LLM 提供者進行不同配置
- **回退策略**：當特定提供者的配置不可用時的預設行為

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
// 使用不同的產生器建立不同的架構結構
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

// 進階 API 使用 StructuredRequestConfig 而非簡單參數
val structuredResponse = promptExecutor.executeStructured(
    prompt = prompt("structured-data") {
        system("你是一位天氣預報助手。")
        user("阿姆斯特丹的天氣預報是什麼？")
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

### 架構產生器 (Schema generators)

根據你的需求，可以使用不同的架構產生器：

- **StandardJsonSchemaGenerator**：完整的 JSON 架構，支援多型、定義和遞迴參照
- **BasicJsonSchemaGenerator**：簡化的架構，不支援多型，與更多模型相容
- **Provider-specific generators**：針對特定 LLM 提供者（OpenAI、Anthropic、Google 等）最佳化的架構

### 跨所有層級的使用

進階配置在 API 的所有三個層級中運作方式一致。方法名稱保持不變，僅參數從簡單引數變更為更進階的 `StructuredRequestConfig`：

- **Prompt executor**：`executeStructured(prompt, model, config: StructuredRequestConfig<T>)`
- **Agent LLM 上下文**：`requestLLMStructured(config: StructuredRequestConfig<T>)`
- **Node 層**：`nodeLLMRequestStructured(config: StructuredRequestConfig<T>)`

對於大多數使用案例，建議使用簡易 API（僅使用 `examples` 和 `fixingParser` 參數），而進階 API 則在需要時提供額外的控制。

## 最佳實務

1. **使用清晰的描述**：使用 `@LLMDescription` 註解提供清晰詳盡的描述，以幫助 LLM 理解預期的資料。

2. **提供範例**：包含有效資料結構的範例以引導 LLM。

3. **優雅地處理錯誤**：實作適當的錯誤處理，以應對 LLM 可能無法產生有效結構的情況。

4. **使用適當的架構類型**：根據你的需求和你正在使用的 LLM 的能力，選擇適當的架構格式和類型。

5. **測試不同的模型**：不同的 LLM 遵循結構化格式的能力各異，因此請儘可能測試多個模型。

6. **從簡單開始**：從簡單的結構開始，並根據需要逐漸增加複雜度。

7. **謹慎使用多型**：雖然此 API 支援密封類別的多型，但請注意，這對於 LLM 正確處理可能更具挑戰性。