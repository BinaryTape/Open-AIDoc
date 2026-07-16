# ToolDescriptorSchemer

`ToolDescriptorSchemer` 是一个扩展点，用于将 `ToolDescriptor` 转换为与特定 LLM 提供者兼容的 JSON Schema 对象。它可以使用 Kotlin 和 Java 实现。

关键点：

- 位置：`ai.koog.agents.core.tools.serialization.ToolDescriptorSchemer`
- 约定：单个函数 `scheme(toolDescriptor: ToolDescriptor): JsonObject` 或 `generate(ToolDescriptor toolDescriptor): JsonObject` (Java)
- 提供的实现：
  - `OpenAICompatibleToolDescriptorSchemer` — 生成与 OpenAI 风格的函数/工具定义兼容的架构。
  - `OllamaToolDescriptorSchemer` — 生成与 Ollama 工具 JSON 兼容的架构。

<!--- INCLUDE
import ai.koog.agents.core.tools.ToolDescriptor
import ai.koog.agents.core.tools.ToolParameterDescriptor
import ai.koog.agents.core.tools.ToolParameterType
import kotlinx.serialization.json.JsonObject
-->
```kotlin
// 接口
interface ToolDescriptorSchemaGenerator {
fun generate(toolDescriptor: ToolDescriptor): JsonObject
}
```
<!--- KNIT example-tool-descriptor-schemer-01.kt -->

## 为什么要使用它

如果你想在 Kotlin 或 Java 中为现有或新的 LLM 提供者提供自定义架构，请实现此接口以将 Koog 的 `ToolDescriptor` 转换为预期的 JSON Schema 格式。

## 实现示例

以下是 Kotlin 和 Java 的最小化自定义实现，仅呈现形参类型的子集，以说明如何接入 SPI。实际实现应涵盖所有 `ToolParameterType`（String、Integer、Float、Boolean、Null、Enum、List、Object、AnyOf）。

=== "Kotlin"

    <!--- INCLUDE
    import ai.koog.agents.core.tools.ToolDescriptor
    import ai.koog.agents.core.tools.ToolParameterDescriptor
    import ai.koog.agents.core.tools.ToolParameterType
    import ai.koog.agents.core.tools.serialization.ToolDescriptorSchemaGenerator
    import kotlinx.serialization.json.JsonPrimitive
    import kotlinx.serialization.json.JsonObject
    import kotlinx.serialization.json.buildJsonObject
    import kotlinx.serialization.json.put
    import kotlinx.serialization.json.putJsonArray
    import kotlinx.serialization.json.putJsonObject
    -->
    ```kotlin
    
    class MinimalSchemer : ToolDescriptorSchemaGenerator {
        override fun generate(toolDescriptor: ToolDescriptor): JsonObject = buildJsonObject {
            put("type", "object")
            putJsonObject("properties") {
                (toolDescriptor.requiredParameters + toolDescriptor.optionalParameters).forEach { p ->
                    put(p.name, buildJsonObject {
                        put("description", p.description)
                        when (val t = p.type) {
                            ToolParameterType.String -> put("type", "string")
                            ToolParameterType.Integer -> put("type", "integer")
                            is ToolParameterType.Enum -> {
                                put("type", "string")
                                putJsonArray("enum") { t.entries.forEach { add(JsonPrimitive(it)) } }
                            }
                            else -> put("type", "string") // 为了简便起见，使用回退值
                        }
                    })
                }
            }
            putJsonArray("required") { toolDescriptor.requiredParameters.forEach { add(JsonPrimitive(it.name)) } }
        }
    }
    ```
    <!--- KNIT example-tool-descriptor-schemer-02.kt -->

=== "Java"

    <!--- INCLUDE
    /**
    -->
    <!--- SUFFIX
    **/
    -->
    ```java
    public static class MinimalSchemer extends OpenAICompatibleToolDescriptorSchemaGenerator {
        @Override
        public JsonObject generate(ToolDescriptor toolDescriptor) {
            Map<String, JsonElement> root = new LinkedHashMap<>();
            root.put("type", JsonPrimitive("object"));

            // 属性
            Map<String, JsonElement> props = new LinkedHashMap<>();
            for (ToolParameterDescriptor p : concat(toolDescriptor.getRequiredParameters(), toolDescriptor.getOptionalParameters())) {
                Map<String, JsonElement> prop = new LinkedHashMap<>();
                prop.put("description", JsonPrimitive(p.getDescription()));

                ToolParameterType t = p.getType();
                if (t == ToolParameterType.String.INSTANCE) {
                    prop.put("type", JsonPrimitive("string"));
                } else if (t == ToolParameterType.Integer.INSTANCE) {
                    prop.put("type", JsonPrimitive("integer"));
                } else if (t instanceof ToolParameterType.Enum) {
                    prop.put("type", JsonPrimitive("string"));
                    String[] entries = ((ToolParameterType.Enum) t).getEntries();
                    `List<JsonElement>` enumVals = new ArrayList<>();
                    for (String e : entries) enumVals.add(JsonPrimitive(e));
                    prop.put("enum", new JsonArray(enumVals));
                } else {
                    prop.put("type", JsonPrimitive("string")); // 为了简便起见，使用回退值
                }

                props.put(p.getName(), new JsonObject(prop));
            }
            root.put("properties", new JsonObject(props));

            // required 数组
            `List<JsonElement>` required = new ArrayList<>();
            for (ToolParameterDescriptor p : toolDescriptor.getRequiredParameters()) {
                required.add(JsonPrimitive(p.getName()));
            }
            root.put("required", new JsonArray(required));

            return new JsonObject(root);
        }

        private static `List<ToolParameterDescriptor>` concat(List<ToolParameterDescriptor> a, `List<ToolParameterDescriptor>` b) {
            `List<ToolParameterDescriptor>` res = new ArrayList<>(a.size() + b.size());
            res.addAll(a);
            res.addAll(b);
            return res;
        }
    }
    ```
    <!--- KNIT example-tool-descriptor-schemer-java-01.java -->

## 在客户端中使用

通常情况下，你不需要直接调用 schemer。Koog 客户端接受 `ToolDescriptor` 对象列表，并在序列化提供者请求时在内部应用正确的 schemer。

下面的示例定义了一个简单的工具并将其传递给 OpenAI 客户端。该客户端将在底层使用 `OpenAICompatibleToolDescriptorSchemer` 来构建 JSON schema。

=== "Kotlin"

    <!--- INCLUDE
    import ai.koog.prompt.executor.clients.openai.OpenAILLMClient
    import ai.koog.agents.core.tools.ToolDescriptor
    import ai.koog.agents.core.tools.ToolParameterDescriptor
    import ai.koog.agents.core.tools.ToolParameterType
    import ai.koog.prompt.dsl.Prompt
    import ai.koog.prompt.executor.clients.openai.OpenAIModels
    import ai.koog.prompt.executor.clients.openai.base.OpenAICompatibleToolDescriptorSchemaGenerator
    import kotlinx.serialization.json.JsonPrimitive
    import kotlinx.serialization.json.JsonObject
    import kotlinx.serialization.json.buildJsonObject
    import kotlinx.serialization.json.put
    import kotlinx.serialization.json.putJsonArray
    import kotlinx.serialization.json.putJsonObject
    import kotlinx.coroutines.runBlocking
    class MinimalSchemer : OpenAICompatibleToolDescriptorSchemaGenerator() {
        override fun generate(toolDescriptor: ToolDescriptor): JsonObject = buildJsonObject {
            put("type", "object")
            putJsonObject("properties") {
                (toolDescriptor.requiredParameters + toolDescriptor.optionalParameters).forEach { p ->
                    put(p.name, buildJsonObject {
                        put("description", p.description)
                        when (val t = p.type) {
                            ToolParameterType.String -> put("type", "string")
                            ToolParameterType.Integer -> put("type", "integer")
                            is ToolParameterType.Enum -> {
                                put("type", "string")
                                putJsonArray("enum") { t.entries.forEach { add(JsonPrimitive(it)) } }
                            }
                            else -> put("type", "string") // 为了简便起见，使用回退值
                        }
                    })
                }
            }
            putJsonArray("required") { toolDescriptor.requiredParameters.forEach { add(JsonPrimitive(it.name)) } }
        }
    }
    -->
    ```kotlin
    val client = OpenAILLMClient(apiKey = System.getenv("OPENAI_API_KEY"), toolsConverter = MinimalSchemer())
    
    val getUserTool = ToolDescriptor(
        name = "get_user",
        description = "Returns user profile by id",
        requiredParameters = listOf(
            ToolParameterDescriptor(
                name = "id",
                description = "User id",
                type = ToolParameterType.String
            )
        )
    )
    
    val prompt = Prompt.build(id = "p1") { user("Hello") }
    val responses = runBlocking {
        client.execute(
            prompt = prompt,
            model = OpenAIModels.Chat.GPT4o,
            tools = listOf(getUserTool)
        )
    }
    ```
    <!--- KNIT example-tool-descriptor-schemer-03.kt -->

=== "Java"

    <!--- INCLUDE
    /**
    -->
    <!--- SUFFIX
    **/
    -->
    ```java
    // 在文档中，扩展 OpenAI 兼容 schemer 的自定义 schemer 仅提供 Kotlin 示例；对于 Java 示例，我们复用上文的 MinimalSchemer。
    OpenAILLMClient client = new OpenAILLMClient(System.getenv("OPENAI_API_KEY"), new OpenAIClientSettings(), null, null, new OpenAICompatibleToolDescriptorSchemaGenerator());
    
    ToolDescriptor getUserTool = new ToolDescriptor(
        "get_user",
        "Returns user profile by id",
        Collections.singletonList(new ToolParameterDescriptor(
            "id",
            "User id",
            ToolParameterType.String.INSTANCE
        )),
        Collections.emptyList()
    );

    Prompt prompt = Prompt.builder("p1")
        .user("Hello")
        .build();

    `List<Message.Response>` responses = client.execute(prompt, OpenAIModels.Chat.GPT4o, java.util.List.of(getUserTool));
    ```
    <!--- KNIT example-tool-descriptor-schemer-java-02.java -->

如果你需要直接访问生成的架构（用于调试或自定义传输），你可以实例化特定于提供者的 schemer 并自行序列化 JSON：

=== "Kotlin"

    <!--- INCLUDE
    import kotlinx.serialization.json.Json
    import ai.koog.prompt.executor.clients.openai.base.OpenAICompatibleToolDescriptorSchemaGenerator
    import ai.koog.agents.core.tools.ToolDescriptor
    import ai.koog.agents.core.tools.ToolParameterDescriptor
    import ai.koog.agents.core.tools.ToolParameterType
    fun getUserTool(): ToolDescriptor {
        return ToolDescriptor(
            name = "get_user",
            description = "Returns user profile by id",
            requiredParameters = listOf(
                ToolParameterDescriptor(
                    name = "id",
                    description = "User id",
                    type = ToolParameterType.String
                )
            )
        )
    }
    -->
    
    ```kotlin
    val json = Json { prettyPrint = true }
    val schema = OpenAICompatibleToolDescriptorSchemaGenerator().generate(getUserTool())
    ```
    <!--- KNIT example-tool-descriptor-schemer-04.kt -->

=== "Java"

    <!--- INCLUDE
    /**
    -->
    <!--- SUFFIX
    **/
    -->
    ```java
    ```
    <!--- KNIT example-tool-descriptor-schemer-java-03.java -->