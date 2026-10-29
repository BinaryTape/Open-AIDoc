# 基於註解的工具

基於註解的工具提供了一種宣告式的方法，將 Kotlin 和 Java 中的函式與方法公開為大型語言模型 (LLM) 的工具。
透過使用註解，您可以將任何函式或方法轉換為 LLM 可以理解並使用的工具。

當您需要將 Kotlin 或 Java 中現有的功能提供給 LLM，而不想手動實作工具描述時，這種方法非常有用。

!!! note
    基於註解的工具僅限 JVM，不適用於其他平台。如需多平台支援，請使用 [基於類別的工具 API](class-based-tools.md)。

## 關鍵註解 {id="key-annotations"}

要開始在您的專案中使用基於註解的工具，您需要了解以下關鍵註解：

| 註解 | 描述 |
|-------------------|-------------------------------------------------------------------------|
| `@Tool`           | 標記應作為工具公開給 LLM 的函式。 |
| `@LLMDescription` | 提供有關工具及其組件的描述性資訊。 |

## @Tool 註解 {id="tool-annotation"}

`@Tool` 註解用於標記應作為工具公開給 LLM 的函式 (Kotlin) 或方法 (Java)。
標記了 `@Tool` 的函式與方法會透過反射 (reflection) 從實作了 `ToolSet` 介面的物件中收集。詳細資訊請參閱 [實作 ToolSet 介面](#1-implement-the-toolset-interface)。

### 定義 {id="definition"}

```kotlin
@Target(AnnotationTarget.FUNCTION)
public annotation class Tool(val customName: String = "")
```
<!--- KNIT example-annotation-based-tools-01.txt -->

### 參數 {id="parameters"}

| <div style="width:100px">名稱</div> | 必填 | 描述 |
|-------------------------------------|----------|------------------------------------------------------------------------------------------|
| `customName`                        | 否 | 為工具指定自訂名稱。如果未提供，則使用函式的名稱。 |

### 用法 {id="usage"}

若要將函式或方法標記為工具，請在實作了 `ToolSet` 介面的類別中，將 `@Tool` 註解套用於該函式或方法：

=== "Kotlin"

    <!--- INCLUDE
    import ai.koog.agents.core.tools.annotations.Tool
    import ai.koog.agents.core.tools.reflect.ToolSet
    -->
    ```kotlin
    class MyToolSet : ToolSet {
        @Tool
        fun myTool(): String {
            // 工具實作
            return "Result"
        }
    
        @Tool(customName = "customToolName")
        fun anotherTool(): String {
            // 工具實作
            return "Result"
        }
    }
    ```
    <!--- KNIT example-annotation-based-tools-01.kt -->

=== "Java"

    <!--- INCLUDE
    /**
    -->
    <!--- SUFFIX
    **/
    -->
    ```java
    public class MyToolSet implements ToolSet {
        @Tool
        public String myTool() {
            // 工具實作
            return "Result";
        }
    
        @Tool(customName = "customToolName")
        public String anotherTool() {
            // 工具實作
            return "Result";
        }
    }
    ```
    <!--- KNIT example-annotation-based-tools-java-01.java -->

## @LLMDescription 註解 {id="llmdescription-annotation"}

`@LLMDescription` 註解向 LLM 提供有關程式碼元素（類別、函式、方法、參數等）的描述性資訊。
這有助於 LLM 了解這些元素的用途和用法。

### 定義

```kotlin
@Target(
    AnnotationTarget.PROPERTY,
    AnnotationTarget.CLASS,
    AnnotationTarget.TYPE,
    AnnotationTarget.VALUE_PARAMETER,
    AnnotationTarget.FUNCTION
)
public annotation class LLMDescription(val description: String)
```
<!--- KNIT example-annotation-based-tools-02.txt -->

### 參數

| 名稱 | 必填 | 描述 |
|---------------|----------|------------------------------------------------|
| `description` | 是 | 描述受註解元素的字串。 |

### 用法

`@LLMDescription` 註解可以套用於各個層級。例如：

* 函式層級：

=== "Kotlin"

    <!--- INCLUDE
    import ai.koog.agents.core.tools.annotations.LLMDescription
    import ai.koog.agents.core.tools.annotations.Tool
    -->
    ```kotlin
    @Tool
    @LLMDescription("執行特定操作並傳回結果")
    fun myTool(): String {
        // 函式實作
        return "Result"
    }
    ```
    <!--- KNIT example-annotation-based-tools-02.kt -->

=== "Java"

    <!--- INCLUDE
    /**
    -->
    <!--- SUFFIX
    **/
    -->
    ```java
    @Tool
    @LLMDescription(description = "執行特定操作並傳回結果")
    public String myTool() {
        // 函式實作
        return "Result";
    }
    ```
    <!--- KNIT example-annotation-based-tools-java-02.java -->

    
* 參數層級：

=== "Kotlin"

    <!--- INCLUDE
    import ai.koog.agents.core.tools.annotations.LLMDescription
    import ai.koog.agents.core.tools.annotations.Tool
    -->
    ```kotlin
    @Tool
    @LLMDescription("處理輸入資料")
    fun processTool(
        @LLMDescription("要處理的輸入資料")
        input: String,
    
        @LLMDescription("選用的組態參數")
        config: String = ""
    ): String {
        // 函式實作
        return "Processed: $input with config: $config"
    }
    ```
    <!--- KNIT example-annotation-based-tools-03.kt -->

=== "Java"

    <!--- INCLUDE
    /**
    -->
    <!--- SUFFIX
    **/
    -->
    ```java
    @Tool
    @LLMDescription(description = "處理輸入資料")
    public String processTool(
            @LLMDescription(description = "要處理的輸入資料") String input,
            @LLMDescription(description = "選用的組態參數") String config
    ) {
        // 函式實作
        return "Processed: " + input + " with config: " + config;
    }
    ```
    <!--- KNIT example-annotation-based-tools-java-03.java -->

## 建立工具 {id="creating-a-tool"}

### 1. 實作 ToolSet 介面 {id="1-implement-the-toolset-interface"}

建立一個實作 [`ToolSet`](api:agents-tools::ai.koog.agents.core.tools.reflect.ToolSet) 介面的類別。
此介面將您的類別標記為工具的容器。

=== "Kotlin"

    <!--- INCLUDE
    import ai.koog.agents.core.tools.reflect.ToolSet
    -->
    ```kotlin
    class MyFirstToolSet : ToolSet {
        // 工具將放在這裡
    }
    ```
    <!--- KNIT example-annotation-based-tools-04.kt -->

=== "Java"

    <!--- INCLUDE
    /**
    -->
    <!--- SUFFIX
    **/
    -->
    ```java
    public class MyFirstToolSet implements ToolSet {
        // 工具將放在這裡
    }
    ```
    <!--- KNIT example-annotation-based-tools-java-04.java -->

### 2. 新增工具函式 {id="2-add-tool-functions"}

將函式或方法新增到您的類別中，並使用 `@Tool` 標記它們，以將其作為工具公開：

=== "Kotlin"

    <!--- INCLUDE
    import ai.koog.agents.core.tools.annotations.Tool
    import ai.koog.agents.core.tools.reflect.ToolSet
    -->
    ```kotlin
    class MyFirstToolSet : ToolSet {
        @Tool
        fun getWeather(location: String): String {
            // 在實際實作中，您會呼叫天氣 API
            return "The weather in $location is sunny and 72°F"
        }
    }
    ```
    <!--- KNIT example-annotation-based-tools-05.kt -->

=== "Java"

    <!--- INCLUDE
    /**
    -->
    <!--- SUFFIX
    **/
    -->
    ```java
    public class MyFirstToolSet implements ToolSet {
        @Tool
        public String getWeather(String location) {
            // 在實際實作中，您會呼叫天氣 API
            return "The weather in " + location + " is sunny and 72°F";
        }
    }
    ```
    <!--- KNIT example-annotation-based-tools-java-05.java -->

### 3. 新增描述 {id="3-add-descriptions"}

新增 `@LLMDescription` 註解以為 LLM 提供上下文資訊：

=== "Kotlin"

    <!--- INCLUDE
    import ai.koog.agents.core.tools.reflect.ToolSet
    import ai.koog.agents.core.tools.annotations.LLMDescription
    import ai.koog.agents.core.tools.annotations.Tool
    -->
    ```kotlin
    @LLMDescription("取得天氣資訊的工具")
    class MyFirstToolSet : ToolSet {
        @Tool
        @LLMDescription("取得特定地點的當前天氣")
        fun getWeather(
            @LLMDescription("城市與州/國家")
            location: String
        ): String {
            // 在實際實作中，您會呼叫天氣 API
            return "The weather in $location is sunny and 72°F"
        }
    }
    ```
    <!--- KNIT example-annotation-based-tools-06.kt -->

=== "Java"

    <!--- INCLUDE
    /**
    -->
    <!--- SUFFIX
    **/
    -->
    ```java
    @LLMDescription(description = "取得天氣資訊的工具")
    public class MyFirstToolSet implements ToolSet {
        @Tool
        @LLMDescription(description = "取得特定地點的當前天氣")
        public String getWeather(
                @LLMDescription(description = "城市與州/國家") String location
        ) {
            // 在實際實作中，您會呼叫天氣 API
            return "The weather in " + location + " is sunny and 72°F";
        }
    }
    ```
    <!--- KNIT example-annotation-based-tools-java-06.java -->

### 4. 在代理中使用您的工具 {id="4-use-your-tools-with-an-agent"}

現在您可以在代理 (agent) 中使用您的工具了：

=== "Kotlin"
    
    <!--- INCLUDE
    import ai.koog.agents.core.agent.AIAgent
    import ai.koog.agents.core.tools.ToolRegistry
    import ai.koog.agents.example.exampleAnnotationBasedTools06.MyFirstToolSet
    import ai.koog.prompt.executor.clients.openai.OpenAIModels
    import ai.koog.prompt.executor.llms.all.simpleOpenAIExecutor
    import kotlinx.coroutines.runBlocking
    const val apiToken = ""
    -->
    ```kotlin
    fun main() {
        runBlocking {
            // 建立您的工具集
            val weatherTools = MyFirstToolSet()
    
            // 建立帶有工具的代理
    
            val agent = AIAgent(
                promptExecutor = simpleOpenAIExecutor(apiToken),
                systemPrompt = "Provide weather information for a given location.",
                llmModel = OpenAIModels.Chat.GPT4o,
                toolRegistry = ToolRegistry {
                    tools(weatherTools)
                }
            )
    
            // 代理現在可以使用您的天氣工具了
            agent.run("What's the weather like in New York?")
        }
    }
    ```
    <!--- KNIT example-annotation-based-tools-07.kt -->

=== "Java"

    <!--- INCLUDE
    /**
    -->
    <!--- SUFFIX
    **/
    -->
    ```java
    String apiToken = System.getenv("OPENAI_API_KEY");

    // 建立您的工具集
     MyFirstToolSet weatherTools = new MyFirstToolSet();

    ToolRegistry toolRegistry = ToolRegistry.builder()
        .tools(weatherTools)
        .build();

    // 建立帶有工具的代理
    AIAgent<String, String> agent = AIAgent.builder()
        .promptExecutor(simpleOpenAIExecutor(System.getenv("OPENAI_API_KEY")))
        .systemPrompt("Provide weather information for a given location.")
        .llmModel(OpenAIModels.Chat.GPT4o)
        .toolRegistry(toolRegistry)
        .build();

    // 代理現在可以使用您的天氣工具了
    String result = agent.run("What's the weather like in New York?");
    System.out.println(result);
    ```
    <!--- KNIT example-annotation-based-tools-java-07.java -->

## 用法範例 {id="usage-examples"}

以下是一些工具註解的實際範例。

### 基礎範例：開關控制器 {id="basic-example-switch-controller"}

此範例展示了一個用於控制開關的簡單工具集：

=== "Kotlin"

    <!--- INCLUDE
    import ai.koog.agents.core.tools.reflect.ToolSet
    import ai.koog.agents.core.tools.annotations.LLMDescription
    import ai.koog.agents.core.tools.annotations.Tool
    class Switch(private var state: Boolean) {
        fun switch(state: Boolean) {
            this.state = state
        }
        fun isOn(): Boolean {
            return state
        }
    }
    -->
    ```kotlin
    @LLMDescription("控制開關的工具")
    class SwitchTools(val switch: Switch) : ToolSet {
        @Tool
        @LLMDescription("切換開關的狀態")
        fun switch(
            @LLMDescription("要設定的狀態（true 為開啟，false 為關閉）")
            state: Boolean
        ): String {
            switch.switch(state)
            return "Switched to ${if (state) "on" else "off"}"
        }
    
        @Tool
        @LLMDescription("傳回開關的當前狀態")
        fun switchState(): String {
            return "Switch is ${if (switch.isOn()) "on" else "off"}"
        }
    }
    ```
    <!--- KNIT example-annotation-based-tools-08.kt -->

=== "Java"

    <!--- INCLUDE
    /**
    -->
    <!--- SUFFIX
    **/
    -->
    ```java
    public class Switch {
        private boolean state;

        public Switch(boolean state) {
            this.state = state;
        }

        // "switch" 在 Java 中是保留關鍵字，所以我們使用不同的方法名稱
        public void setState(boolean state) {
            this.state = state;
        }

        public boolean isOn() {
            return state;
        }
    }
    
    @LLMDescription(description = "控制開關的工具")
    public class SwitchTools implements ToolSet {
        private final Switch sw;

        public SwitchTools(Switch sw) {
            this.sw = sw;
        }

        @Tool
        @LLMDescription(description = "切換開關的狀態")
        public String switchStateTo(
                @LLMDescription(description = "要設定的狀態（true 為開啟，false 為關閉）") boolean state
        ) {
            sw.setState(state);
            return "Switched to " + (state ? "on" : "off");
        }

        @Tool
        @LLMDescription(description = "傳回開關的當前狀態")
        public String switchState() {
            return "Switch is " + (sw.isOn() ? "on" : "off");
        }
    }
    ```
    <!--- KNIT example-annotation-based-tools-java-08.java -->

當 LLM 需要控制開關時，它可以從提供的描述中理解以下資訊：

- 工具的用途與功能。
- 使用工具所需的參數。
- 每個參數可接受的值。
- 執行後預期的傳回值。

### 進階範例：診斷工具 {id="advanced-example-diagnostic-tools"}

此範例展示了一個更複雜的裝置診斷工具集：

=== "Kotlin"

    <!--- INCLUDE
    import ai.koog.agents.core.tools.reflect.ToolSet
    import ai.koog.agents.core.tools.annotations.LLMDescription
    import ai.koog.agents.core.tools.annotations.Tool
    -->
    ```kotlin
    @LLMDescription("用於對裝置執行診斷和疑難排解的工具")
    class DiagnosticToolSet : ToolSet {
        @Tool
        @LLMDescription("在裝置上執行診斷以檢查其狀態並識別任何問題")
        fun runDiagnostic(
            @LLMDescription("要診斷的裝置 ID")
            deviceId: String,
    
            @LLMDescription("診斷的額外資訊（選用）")
            additionalInfo: String = ""
        ): String {
            // 實作
            return "Diagnostic results for device $deviceId"
        }
    
        @Tool
        @LLMDescription("分析錯誤代碼以確定其含義和可能的解決方案")
        fun analyzeError(
            @LLMDescription("要分析的錯誤代碼（例如 'E1001'）")
            errorCode: String
        ): String {
            // 實作
            return "Analysis of error code $errorCode"
        }
    }
    ```
    <!--- KNIT example-annotation-based-tools-09.kt -->

=== "Java"

    <!--- INCLUDE
    /**
    -->
    <!--- SUFFIX
    **/
    -->
    ```java
    @LLMDescription(description = "用於對裝置執行診斷和疑難排解的工具")
    public class DiagnosticToolSet implements ToolSet {
        // 便利多載（未作為工具公開）
        public String runDiagnostic(String deviceId) {
            return runDiagnostic(deviceId, "");
        }
    
        @Tool
        @LLMDescription(description = "在裝置上執行診斷以檢查其狀態並識別任何問題")
        public String runDiagnostic(
                @LLMDescription(description = "要診斷的裝置 ID") String deviceId,
                @LLMDescription(description = "診斷的額外資訊（選用）") String additionalInfo
        ) {
            // 實作
            return "Diagnostic results for device " + deviceId;
        }
    
        @Tool
        @LLMDescription(description = "分析錯誤代碼以確定其含義和可能的解決方案")
        public String analyzeError(
                @LLMDescription(description = "要分析的錯誤代碼（例如 'E1001'）") String errorCode
        ) {
            // 實作
            return "Analysis of error code " + errorCode;
        }
    }
    ```
    <!--- KNIT example-annotation-based-tools-java-09.java -->

## 最佳實務 {id="best-practices"}

* **提供清晰的描述**：撰寫清晰、簡潔的描述，解釋工具、參數和傳回值的用途與行為。
* **描述所有參數**：為所有參數新增 `@LLMDescription`，以幫助 LLM 了解每個參數的用途。
* **使用一致的命名**：為工具和參數使用一致的命名慣例，使其更加直覺。
* **將相關工具分組**：將相關工具放在同一個 `ToolSet` 實作中，並提供類別層級的描述。
* **傳回具資訊量的結果**：確保工具傳回值能提供有關操作結果的清晰資訊。
* **優雅地處理錯誤**：在工具中加入錯誤處理並傳回具資訊量的錯誤訊息。
* **記錄預設值**：當參數有預設值 (Kotlin) 或多載 (Java) 時，請在描述中記錄這一點。
* **保持工具功能單一**：每個工具應執行特定的、定義明確的任務，而不是試圖做太多的事情。

## 常見問題疑難排解 {id="troubleshooting-common-issues"}

使用工具註解時，您可能會遇到一些常見問題。

### 工具未被辨識 {id="tools-not-being-recognized"}

如果代理無法辨識您的工具，請檢查以下各項：

- 您的類別是否實作了 `ToolSet` 介面。
- 所有工具函式或方法是否都標記了 `@Tool`。
- 工具函式或方法是否具有適當的傳回型別（為了簡單起見，建議使用 `String`）。
- 您的工具是否已正確註冊到代理中。

### 工具描述不清晰 {id="unclear-tool-descriptions"}

如果 LLM 未正確使用您的工具或誤解了它們的用途，請嘗試以下方法：

- 儘可能使用基本參數型別（Kotlin 中的 `String`、`Boolean`、`Int`，或 Java 中的 `String`、`boolean`、`int`）。
- 在參數描述中清晰地描述預期的格式。
- 對於複雜型別，考慮使用具有特定格式的 `String` 參數，並在工具中進行剖析。
- 在參數描述中包含有效輸入的範例。
- 請注意 Java 不支援預設參數。請改用方法多載。

### 參數型別問題 {id="parameter-type-issues"}

如果 LLM 提供了錯誤的參數型別，請嘗試以下方法：

- 儘可能使用簡單的參數型別（`String`、`Boolean`、`Int`）。
- 在參數描述中清晰地描述預期的格式。
- 對於複雜型別，考慮使用具有特定格式的 `String` 參數，並在工具中進行剖析。
- 在參數描述中包含有效輸入的範例。

### 效能問題 {id="performance-issues"}

如果您的工具導致效能問題，請嘗試以下方法：

- 保持工具實作輕量化。
- 對於資源密集型操作，考慮實作非同步處理。
- 在適當的時候快取結果。
- 記錄工具使用情況以識別瓶頸。