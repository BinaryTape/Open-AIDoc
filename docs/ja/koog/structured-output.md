# 構造化出力

## はじめに

Structured Output（構造化出力）APIは、大規模言語モデル（LLM）からのレスポンスが特定のデータ構造に従うことを保証する方法を提供します。
これは、自由形式のテキストではなく、予測可能で適切にフォーマットされたデータを必要とする信頼性の高いAIアプリケーションを構築するために不可欠です。

このページでは、このAPIを使用してデータ構造を定義し、スキーマを生成し、LLMに構造化されたレスポンスをリクエストする方法について説明します。

## 主要なコンポーネントと概念

Structured Output APIは、いくつかの主要なコンポーネントで構成されています。

1. **データ構造の定義**: `kotlinx.serialization` およびLLM固有のアノテーションが付加されたKotlinデータクラス。
2. **JSONスキーマ生成**: KotlinデータクラスからJSONスキーマを生成するためのツール。
3. **構造化LLMリクエスト**: 定義された構造に従うレスポンスをLLMにリクエストするためのメソッド。
4. **レスポンス処理**: 構造化されたレスポンスの処理とバリデーション。

## データ構造の定義

Structured Output APIを使用するための最初のステップは、Kotlinデータクラスを使用してデータ構造を定義することです。

### 基本構造

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

### 主要なアノテーション

- `@Serializable`: `kotlinx.serialization` がクラスを処理するために必要です。
- `@SerialName`: シリアライズ中に使用する名前を指定します。
- `@LLMDescription`: LLMに対してクラスの説明を提供します。フィールドのアノテーションには `@property:LLMDescription` を使用してください。

### サポートされている機能

このAPIは、幅広いデータ構造機能をサポートしています。

#### ネストされたクラス

<!--- INCLUDE
import ai.koog.agents.core.tools.annotations.LLMDescription
import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable
-->
```kotlin
@Serializable
@SerialName("WeatherForecast")
data class WeatherForecast(
    // その他のフィールド
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

#### コレクション（ListおよびMap）

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
    // その他のフィールド
    @property:LLMDescription("List of news articles")
    val news: List<WeatherNews>,
    @property:LLMDescription("Map of weather sources")
    val sources: Map<String, WeatherSource>
)
```
<!--- KNIT example-structured-data-03.kt -->

#### Enum（列挙型）

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

#### シールドクラスによるポリモーフィズム

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

### 例の提供

LLMが期待されるフォーマットを理解しやすくするために、例を提供することができます。

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
    // その他のフィールド
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

## 構造化レスポンスのリクエスト

Koogでは、構造化出力を使用できる3つの主要なレイヤーがあります。

1. **プロンプトエグゼキューターレイヤー**: プロンプトエグゼキューターを使用してLLMを直接呼び出す
2. **エージェントLLMコンテキストレイヤー**: 対話型コンテキストのエージェントセッション内で使用する
3. **ノードレイヤー**: 構造化出力機能を備えた再利用可能なエージェントノードを作成する

### レイヤー 1: プロンプトエグゼキューター

プロンプトエグゼキューターレイヤーは、構造化されたLLM呼び出しを行うための最も直接的な方法を提供します。単一のスタンドアロンリクエストには `executeStructured` メソッドを使用します。

このメソッドはプロンプトを実行し、以下の方法でレスポンスが適切に構造化されていることを保証します。

- [モデルの機能](./model-capabilities.md)に基づいて、最適な構造化出力のアプローチを自動的に選択します。
- 必要に応じて、元のプロンプトに構造化出力の指示を注入します。
- 利用可能な場合は、ネイティブの構造化出力サポートを使用します。
- パースに失敗した場合は、オプションで補助LLMによる自動エラー修正（`fixingParser` パラメーター経由）を提供します。

以下は `executeStructured` メソッドの使用例です。

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
// シンプルな、単一プロバイダーのプロンプトエグゼキューターを定義
val promptExecutor = simpleOpenAIExecutor(System.getenv("OPENAI_KEY"))

// 構造化されたレスポンスを返すLLM呼び出しを行う
val structuredResponse = promptExecutor.executeStructured<WeatherForecast>(
        // プロンプト（システムメッセージとユーザーメッセージの両方）を定義
        prompt = prompt("structured-data") {
            system(
                """
                You are a weather forecasting assistant.
                When asked for a weather forecast, provide a realistic but fictional forecast.
                """.trimIndent()
            )
            user(
              "What is the weather forecast for Amsterdam?"
            )
        },
        // リクエストを実行するメインモデルを定義
        model = OpenAIModels.Chat.GPT4oMini,
        // オプション: モデルがフォーマットを理解するのを助けるための例を提供
        examples = exampleForecasts,
        // オプション: エラー修正のための修正パーサーを提供
        fixingParser = StructureFixingParser(
            model = OpenAIModels.Chat.GPT4o,
            retries = 3
        )
    )
```
<!--- KNIT example-structured-data-07.kt -->

`executeStructured` メソッドは以下の引数を取ります。

| 名前 | データ型 | 必須 | デフォルト | 説明 |
|----------------|------------------------|----------|---------------|-----------------------------------------------------------------------------------------------------------------|
| `prompt` | Prompt | はい | | 実行するプロンプト。詳細については[Prompts](prompts/index.md)を参照。 |
| `model` | LLModel | はい | | プロンプトを実行するメインモデル。 |
| `examples` | `List<T>` | いいえ | `emptyList()` | モデルが期待されるフォーマットを理解するのを助けるための、オプションの例のリスト。 |
| `fixingParser` | StructureFixingParser? | いいえ | `null` | 補助LLMを使用してパースエラーをインテリジェントに修正することで、不正な形式のレスポンスを処理するオプションのパーサー。指定された場合、エラー修正を伴うパース失敗の再試行を自動的に行います。 |

このメソッドは、正常にパースされた構造化データまたはエラーを含む `Result<StructuredResponse<T>>` を返します。

### レイヤー 2: エージェントLLMコンテキスト

エージェントLLMコンテキストレイヤーを使用すると、エージェントセッション内で構造化されたレスポンスをリクエストできます。これは、フローの特定のポイントで構造化データを必要とする対話型エージェントを構築する場合に便利です。

エージェントベースのインタラクションについては、`writeSession` 内で `requestLLMStructured` メソッドを使用します。

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

`fixingParser` パラメーターは、不正な形式のJSONレスポンスに対する自動エラー修正を提供します。パースに失敗した場合、指定された再試行回数まで、補助LLMを使用してインテリジェントにレスポンスを修正します。

**StructureFixingParserのパラメーター:**
- `model: LLModel` - 不正な形式のJSON出力を修正するために使用されるLLM
- `retries: Int` - 修正試行の最大回数（デフォルト: 3）
- `prompt` - 修正プロセス用のオプションのカスタムプロンプト関数（デフォルトは組み込みの修正プロンプト）

修正プロセスでは、パースエラーを反復的に補助モデルに渡し、補助モデルは元のデータを保持しつつ最小限の変更でJSONを修正しようと試みます。

#### エージェントストラテジーとの統合

構造化データ処理をエージェントストラテジーに統合できます。

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
        Response structure:
        $structuredResponse
        """.trimIndent()
    }

    edge(nodeStart forwardTo setup)
    edge(setup forwardTo getStructuredForecast)
    edge(getStructuredForecast forwardTo nodeFinish)
}
```
<!--- KNIT example-structured-data-09.kt -->

### レイヤー 3: ノードレイヤー

ノードレイヤーは、エージェントワークフローにおける構造化出力の最高レベルの抽象化を提供します。`nodeLLMRequestStructured` を使用して、構造化データを処理する再利用可能なエージェントノードを作成します。

これにより、以下のことを行うエージェントノードが作成されます。
- `String` 入力（ユーザーメッセージ）を受け取る
- メッセージをLLMプロンプトに追加する
- LLMに構造化出力をリクエストする
- `Result<StructuredResponse<MyStruct>>` を返す

#### ノードレイヤーの例

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
        "Please provide a weather forecast for Amsterdam"
    }
    
    // デリゲート構文を使用して構造化出力ノードを作成
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
                "Weather forecast: $forecast"
            }
            result.isFailure -> {
                "Failed to get structured forecast: ${result.exceptionOrNull()?.message}"
            }
            else -> "Unknown result state"
        }
    }

    edge(nodeStart forwardTo setup)
    edge(setup forwardTo getWeatherForecast)
    edge(getWeatherForecast forwardTo processResult)
    edge(processResult forwardTo nodeFinish)
}
```
<!--- KNIT example-structured-data-10.kt -->

#### 完全なコードサンプル

以下は、Structured Output APIを使用した完全な例です。

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
// 注意: 簡潔にするためにインポート文は省略されています
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

val token = System.getenv("OPENAI_KEY") ?: error("Environment variable OPENAI_KEY is not set")

fun main(): Unit = runBlocking {
    // サンプルの予報を作成
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

    // JSONスキーマを生成
    val forecastStructure = JsonStructure.create<SimpleWeatherForecast>(
        schemaGenerator = BasicJsonSchemaGenerator.Default,
        examples = exampleForecasts
    )

    // エージェントストラテジーを定義
    val agentStrategy = strategy("weather-forecast") {
        val setup by nodeLLMRequest()
  
        val getStructuredForecast by node<Message.Response, String> { _ ->
            val structuredResponse = llm.writeSession {
                requestLLMStructured<SimpleWeatherForecast>()
            }
  
            """
            Response structure:
            $structuredResponse
            """.trimIndent()
        }
  
        edge(nodeStart forwardTo setup)
        edge(setup forwardTo getStructuredForecast)
        edge(getStructuredForecast forwardTo nodeFinish)
    }

    // エージェントを設定して実行
    val agentConfig = AIAgentConfig(
        prompt = prompt("weather-forecast-prompt") {
            system(
                """
                You are a weather forecasting assistant.
                When asked for a weather forecast, provide a realistic but fictional forecast.
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

    runner.run("Get weather forecast for Paris")
}
```
<!--- KNIT example-structured-data-11.kt -->

## 高度な使用法

上記の例では、モデルの機能に基づいて最適な構造化出力アプローチを自動的に選択する簡略化されたAPIを示しました。
構造化出力プロセスをより細かく制御するには、手動のスキーマ作成やプロバイダー固有の設定が可能な高度なAPIを使用できます。

### 手動のスキーマ作成と設定

自動スキーマ生成に依存する代わりに、`JsonStructure.create` を使用して明示的にスキーマを作成し、`StructuredOutput` クラスを介して構造化出力の動作を手動で設定できます。

主な違いは、`examples` や `fixingParser` のような単純なパラメーターを渡す代わりに、以下を細かく制御できる `StructuredRequestConfig` オブジェクトを作成することです。

- **スキーマ生成**: 特定のジェネレーターを選択（Standard、Basic、またはプロバイダー固有）
- **出力モード**: ネイティブの構造化出力サポート vs 手動プロンプト
- **プロバイダーマッピング**: LLMプロバイダーごとに異なる設定
- **フォールバック戦略**: プロバイダー固有の設定が利用できない場合のデフォルトの動作

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
// 異なるジェネレーターを使用して異なるスキーマ構造を作成する
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

// 高度なAPIでは、単純なパラメーターの代わりに StructuredRequestConfig を使用します
val structuredResponse = promptExecutor.executeStructured(
    prompt = prompt("structured-data") {
        system("You are a weather forecasting assistant.")
        user("What is the weather forecast for Amsterdam?")
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

### スキーマジェネレーター

ニーズに応じて、さまざまなスキーマジェネレーターを利用できます。

- **StandardJsonSchemaGenerator**: ポリモーフィズム、定義、および再帰的参照をサポートする完全なJSONスキーマ。
- **BasicJsonSchemaGenerator**: ポリモーフィズムをサポートしない簡略化されたスキーマで、より多くのモデルと互換性があります。
- **プロバイダー固有のジェネレーター**: 特定のLLMプロバイダー（OpenAI、Anthropic、Googleなど）向けに最適化されたスキーマ。

### すべてのレイヤーでの使用

高度な設定は、APIの3つのレイヤーすべてで一貫して機能します。メソッド名は同じで、パラメーターが単純な引数から、より高度な `StructuredRequestConfig` に変わるだけです。

- **プロンプトエグゼキューター**: `executeStructured(prompt, model, config: StructuredRequestConfig<T>)`
- **エージェントLLMコンテキスト**: `requestLLMStructured(config: StructuredRequestConfig<T>)`
- **ノードレイヤー**: `nodeLLMRequestStructured(config: StructuredRequestConfig<T>)`

ほとんどのユースケースでは簡略化されたAPI（`examples` および `fixingParser` パラメーターのみを使用）が推奨されますが、必要に応じて高度なAPIによって追加の制御が可能になります。

## ベストプラクティス

1. **明確な説明を使用する**: LLMが期待されるデータを理解できるように、`@LLMDescription` アノテーションを使用して明確で詳細な説明を提供してください。

2. **例を提供する**: LLMをガイドするために、有効なデータ構造の例を含めてください。

3. **エラーを適切に処理する**: LLMが有効な構造を生成しない可能性があるケースに対処するために、適切なエラー処理を実装してください。

4. **適切なスキーマタイプを使用する**: ニーズと使用しているLLMの機能に基づいて、適切なスキーマフォーマットとタイプを選択してください。

5. **異なるモデルでテストする**: LLMによって構造化フォーマットに従う能力が異なるため、可能であれば複数のモデルでテストしてください。

6. **シンプルに始める**: シンプルな構造から始め、必要に応じて徐々に複雑さを加えてください。

7. **ポリモーフィズムを慎重に使用する**: APIはシールドクラスによるポリモーフィズムをサポートしていますが、LLMが正しく処理するのがより難しくなる可能性があることに注意してください。