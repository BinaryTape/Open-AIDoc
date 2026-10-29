# 基于注解的工具

基于注解的工具为在 Kotlin 和 Java 中将函数和方法公开为大语言模型 (LLM) 的工具提供了一种声明式方式。
通过使用注解，您可以将任何函数或方法转换为 LLM 可以理解并使用的工具。

当您需要在 Kotlin 或 Java 中向 LLM 公开现有功能而无需手动编写工具描述时，这种方法非常有用。

!!! note
    基于注解的工具仅限 JVM，不适用于其他平台。对于多平台支持，请使用 [基于类的工具 API](class-based-tools.md)。

## 关键注解 {id="key-annotations"}

要在项目中使用基于注解的工具，您需要了解以下关键注解：

| 注解                | 描述                                     |
|-------------------|----------------------------------------|
| `@Tool`           | 将函数标记为应公开给 LLM 的工具。                    |
| `@LLMDescription` | 提供有关工具及其组件的描述性信息。                      |

## @Tool 注解 {id="tool-annotation"}

`@Tool` 注解用于将函数 (Kotlin) 或方法 (Java) 标记为应公开给 LLM 的工具。
带有 `@Tool` 注解的函数和方法通过反射从实现 `ToolSet` 接口的对象中收集。详情请参阅 [实现 ToolSet 接口](#1-implement-the-toolset-interface)。

### 定义 {id="definition"}

```kotlin
@Target(AnnotationTarget.FUNCTION)
public annotation class Tool(val customName: String = "")
```
<!--- KNIT example-annotation-based-tools-01.txt -->

### 参数 {id="parameters"}

| <div style="width:100px">名称</div> | 必选 | 描述                                       |
|-----------------------------------|----|------------------------------------------|
| `customName`                      | 否  | 指定工具的自定义名称。如果未提供，则使用函数名称。                |

### 用法 {id="usage"}

要将函数或方法标记为工具，请在实现 `ToolSet` 接口的类中对该函数或方法应用 `@Tool` 注解：

=== "Kotlin"

    <!--- INCLUDE
    import ai.koog.agents.core.tools.annotations.Tool
    import ai.koog.agents.core.tools.reflect.ToolSet
    -->
    ```kotlin
    class MyToolSet : ToolSet {
        @Tool
        fun myTool(): String {
            // 工具实现
            return "Result"
        }
    
        @Tool(customName = "customToolName")
        fun anotherTool(): String {
            // 工具实现
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
            // 工具实现
            return "Result";
        }
    
        @Tool(customName = "customToolName")
        public String anotherTool() {
            // 工具实现
            return "Result";
        }
    }
    ```
    <!--- KNIT example-annotation-based-tools-java-01.java -->

## @LLMDescription 注解 {id="llmdescription-annotation"}

`@LLMDescription` 注解为 LLM 提供有关代码元素（类、函数、方法、形参等）的描述性信息。
这有助于 LLM 理解这些元素的用途和用法。

### 定义

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

### 参数

| 名称            | 必选 | 描述               |
|---------------|----|------------------|
| `description` | 是  | 描述被注解元素的字符串。     |

### 用法

`@LLMDescription` 注解可以应用于各个层级。例如：

* 函数层级：

=== "Kotlin"

    <!--- INCLUDE
    import ai.koog.agents.core.tools.annotations.LLMDescription
    import ai.koog.agents.core.tools.annotations.Tool
    -->
    ```kotlin
    @Tool
    @LLMDescription("执行特定操作并返回结果")
    fun myTool(): String {
        // 函数实现
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
    @LLMDescription(description = "执行特定操作并返回结果")
    public String myTool() {
        // 函数实现
        return "Result";
    }
    ```
    <!--- KNIT example-annotation-based-tools-java-02.java -->

    
* 形参层级：

=== "Kotlin"

    <!--- INCLUDE
    import ai.koog.agents.core.tools.annotations.LLMDescription
    import ai.koog.agents.core.tools.annotations.Tool
    -->
    ```kotlin
    @Tool
    @LLMDescription("处理输入数据")
    fun processTool(
        @LLMDescription("要处理的输入数据")
        input: String,
    
        @LLMDescription("可选的配置参数")
        config: String = ""
    ): String {
        // 函数实现
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
    @LLMDescription(description = "处理输入数据")
    public String processTool(
            @LLMDescription(description = "要处理的输入数据") String input,
            @LLMDescription(description = "可选的配置参数") String config
    ) {
        // 函数实现
        return "Processed: " + input + " with config: " + config;
    }
    ```
    <!--- KNIT example-annotation-based-tools-java-03.java -->

## 创建工具 {id="creating-a-tool"}

### 1. 实现 ToolSet 接口 {id="1-implement-the-toolset-interface"}

创建一个实现 [`ToolSet`](api:agents-tools::ai.koog.agents.core.tools.reflect.ToolSet) 接口的类。
此接口将您的类标记为工具容器。

=== "Kotlin"

    <!--- INCLUDE
    import ai.koog.agents.core.tools.reflect.ToolSet
    -->
    ```kotlin
    class MyFirstToolSet : ToolSet {
        // 工具将放在这里
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
        // 工具将放在这里
    }
    ```
    <!--- KNIT example-annotation-based-tools-java-04.java -->

### 2. 添加工具函数 {id="2-add-tool-functions"}

向您的类添加函数或方法，并使用 `@Tool` 对其进行注解，以便将其作为工具公开：

=== "Kotlin"

    <!--- INCLUDE
    import ai.koog.agents.core.tools.annotations.Tool
    import ai.koog.agents.core.tools.reflect.ToolSet
    -->
    ```kotlin
    class MyFirstToolSet : ToolSet {
        @Tool
        fun getWeather(location: String): String {
            // 在实际实现中，您会调用天气 API
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
            // 在实际实现中，您会调用天气 API
            return "The weather in " + location + " is sunny and 72°F";
        }
    }
    ```
    <!--- KNIT example-annotation-based-tools-java-05.java -->

### 3. 添加描述 {id="3-add-descriptions"}

添加 `@LLMDescription` 注解以为 LLM 提供上下文：

=== "Kotlin"

    <!--- INCLUDE
    import ai.koog.agents.core.tools.reflect.ToolSet
    import ai.koog.agents.core.tools.annotations.LLMDescription
    import ai.koog.agents.core.tools.annotations.Tool
    -->
    ```kotlin
    @LLMDescription("用于获取天气信息的工具")
    class MyFirstToolSet : ToolSet {
        @Tool
        @LLMDescription("获取指定地点的当前天气")
        fun getWeather(
            @LLMDescription("城市和州/国家")
            location: String
        ): String {
            // 在实际实现中，您会调用天气 API
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
    @LLMDescription(description = "用于获取天气信息的工具")
    public class MyFirstToolSet implements ToolSet {
        @Tool
        @LLMDescription(description = "获取指定地点的当前天气")
        public String getWeather(
                @LLMDescription(description = "城市和州/国家") String location
        ) {
            // 在实际实现中，您会调用天气 API
            return "The weather in " + location + " is sunny and 72°F";
        }
    }
    ```
    <!--- KNIT example-annotation-based-tools-java-06.java -->

### 4. 在 Agent 中使用您的工具 {id="4-use-your-tools-with-an-agent"}

现在您可以在 Agent 中使用您的工具了：

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
            // 创建您的工具集
            val weatherTools = MyFirstToolSet()
    
            // 使用您的工具创建 Agent
    
            val agent = AIAgent(
                promptExecutor = simpleOpenAIExecutor(apiToken),
                systemPrompt = "Provide weather information for a given location.",
                llmModel = OpenAIModels.Chat.GPT4o,
                toolRegistry = ToolRegistry {
                    tools(weatherTools)
                }
            )
    
            // 现在 Agent 可以使用您的天气工具了
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

    // 创建您的工具集
     MyFirstToolSet weatherTools = new MyFirstToolSet();

    ToolRegistry toolRegistry = ToolRegistry.builder()
        .tools(weatherTools)
        .build();

    // 使用您的工具创建 Agent
    AIAgent<String, String> agent = AIAgent.builder()
        .promptExecutor(simpleOpenAIExecutor(System.getenv("OPENAI_API_KEY")))
        .systemPrompt("Provide weather information for a given location.")
        .llmModel(OpenAIModels.Chat.GPT4o)
        .toolRegistry(toolRegistry)
        .build();

    // 现在 Agent 可以使用您的天气工具了
    String result = agent.run("What's the weather like in New York?");
    System.out.println(result);
    ```
    <!--- KNIT example-annotation-based-tools-java-07.java -->

## 用法示例 {id="usage-examples"}

以下是一些工具注解的实际示例。

### 基础示例：开关控制器 {id="basic-example-switch-controller"}

此示例显示了一个用于控制开关的简单工具集：

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
    @LLMDescription("用于控制开关的工具")
    class SwitchTools(val switch: Switch) : ToolSet {
        @Tool
        @LLMDescription("切换开关的状态")
        fun switch(
            @LLMDescription("要设置的状态（true 为开启，false 为关闭）")
            state: Boolean
        ): String {
            switch.switch(state)
            return "Switched to ${if (state) "on" else "off"}"
        }
    
        @Tool
        @LLMDescription("返回开关的当前状态")
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

        // "switch" 在 Java 中是保留关键字，因此我们使用不同的方法名称
        public void setState(boolean state) {
            this.state = state;
        }

        public boolean isOn() {
            return state;
        }
    }
    
    @LLMDescription(description = "用于控制开关的工具")
    public class SwitchTools implements ToolSet {
        private final Switch sw;

        public SwitchTools(Switch sw) {
            this.sw = sw;
        }

        @Tool
        @LLMDescription(description = "切换开关的状态")
        public String switchStateTo(
                @LLMDescription(description = "要设置的状态（true 为开启，false 为关闭）") boolean state
        ) {
            sw.setState(state);
            return "Switched to " + (state ? "on" : "off");
        }

        @Tool
        @LLMDescription(description = "返回开关的当前状态")
        public String switchState() {
            return "Switch is " + (sw.isOn() ? "on" : "off");
        }
    }
    ```
    <!--- KNIT example-annotation-based-tools-java-08.java -->

当 LLM 需要控制开关时，它可以从提供的描述中理解以下信息：

- 工具的目的和功能。
- 使用工具所需的参数。
- 每个参数的可接受值。
- 执行后预期的返回值。

### 高级示例：诊断工具 {id="advanced-example-diagnostic-tools"}

此示例显示了一个更复杂的设备诊断工具集：

=== "Kotlin"

    <!--- INCLUDE
    import ai.koog.agents.core.tools.reflect.ToolSet
    import ai.koog.agents.core.tools.annotations.LLMDescription
    import ai.koog.agents.core.tools.annotations.Tool
    -->
    ```kotlin
    @LLMDescription("用于对设备进行诊断和故障排除的工具")
    class DiagnosticToolSet : ToolSet {
        @Tool
        @LLMDescription("在设备上运行诊断以检查其状态并识别任何问题")
        fun runDiagnostic(
            @LLMDescription("要诊断的设备 ID")
            deviceId: String,
    
            @LLMDescription("诊断的附加信息（可选）")
            additionalInfo: String = ""
        ): String {
            // 实现
            return "Diagnostic results for device $deviceId"
        }
    
        @Tool
        @LLMDescription("分析错误代码以确定其含义和可能的解决方案")
        fun analyzeError(
            @LLMDescription("要分析的错误代码（例如 'E1001'）")
            errorCode: String
        ): String {
            // 实现
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
    @LLMDescription(description = "用于对设备进行诊断和故障排除的工具")
    public class DiagnosticToolSet implements ToolSet {
        // 便捷重载（不作为工具公开）
        public String runDiagnostic(String deviceId) {
            return runDiagnostic(deviceId, "");
        }
    
        @Tool
        @LLMDescription(description = "在设备上运行诊断以检查其状态并识别任何问题")
        public String runDiagnostic(
                @LLMDescription(description = "要诊断的设备 ID") String deviceId,
                @LLMDescription(description = "诊断的附加信息（可选）") String additionalInfo
        ) {
            // 实现
            return "Diagnostic results for device " + deviceId;
        }
    
        @Tool
        @LLMDescription(description = "分析错误代码以确定其含义和可能的解决方案")
        public String analyzeError(
                @LLMDescription(description = "要分析的错误代码（例如 'E1001'）") String errorCode
        ) {
            // 实现
            return "Analysis of error code " + errorCode;
        }
    }
    ```
    <!--- KNIT example-annotation-based-tools-java-09.java -->

## 最佳做法 {id="best-practices"}

* **提供清晰的描述**：编写清晰、简洁的描述，解释工具、形参和返回值的目的与行为。
* **描述所有形参**：为所有形参添加 `@LLMDescription`，以帮助 LLM 理解每个形参的用途。
* **使用一致的命名**：为工具和形参使用一致的命名约定，使它们更具直观性。
* **将相关的工具分组**：在同一个 `ToolSet` 实现中对相关工具进行分组，并提供类级别的描述。
* **返回包含丰富信息的返回值**：确保工具返回值提供有关操作结果的清晰信息。
* **优雅地处理错误**：在工具中包含错误处理并返回包含信息的错误消息。
* **记录默认值**：当形参具有默认值 (Kotlin) 或重载 (Java) 时，请在描述中记录这一点。
* **保持工具功能单一**：每个工具应执行特定的、定义明确的任务，而不是试图做太多的事情。

## 故障排除常见问题 {id="troubleshooting-common-issues"}

在使用工具注解时，您可能会遇到一些常见问题。

### 工具未被识别 {id="tools-not-being-recognized"}

如果 Agent 无法识别您的工具，请检查以下各项：

- 您的类实现了 `ToolSet` 接口。
- 所有工具函数或方法都使用了 `@Tool` 注解。
- 工具函数或方法具有适当的返回值类型（为简单起见，建议使用 `String`）。
- 您的工具已正确注册到 Agent。

### 工具描述不清晰 {id="unclear-tool-descriptions"}

如果 LLM 未正确使用您的工具或误解了其用途，请尝试以下操作：

- 尽可能使用原始参数类型（Kotlin 中的 `String`、`Boolean`、`Int`，或 Java 中的 `String`、`boolean`、`int`）。
- 在形参描述中清楚地描述预期格式。
- 对于复杂类型，考虑使用具有特定格式的 `String` 形参并在工具中解析它们。
- 在形参描述中包含有效输入的示例。
- 请注意 Java 不支持默认参数。请改用方法重载。

### 形参类型问题 {id="parameter-type-issues"}

如果 LLM 提供了错误的形参类型，请尝试以下操作：

- 尽可能使用简单的形参类型（`String`、`Boolean`、`Int`）。
- 在形参描述中清楚地描述预期格式。
- 对于复杂类型，考虑使用具有特定格式的 `String` 形参并在工具中解析它们。
- 在形参描述中包含有效输入的示例。

### 性能问题 {id="performance-issues"}

如果您的工具导致性能问题，请尝试以下操作：

- 保持工具实现轻量化。
- 对于资源密集型操作，考虑实现异步处理。
- 在适当的时候缓存结果。
- 记录工具使用情况以识别瓶颈。