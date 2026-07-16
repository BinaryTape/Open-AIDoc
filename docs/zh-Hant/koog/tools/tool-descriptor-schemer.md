# ToolDescriptorSchemer

`ToolDescriptorSchemer` 是一個擴充點，負責將 `ToolDescriptor` 轉換為與特定 LLM 提供者相容的 JSON Schema 物件。它可以用 Kotlin 和 Java 實作。

關鍵點：

- 位置：`ai.koog.agents.core.tools.serialization.ToolDescriptorSchemer`
- 規範：單個函式 `scheme(toolDescriptor: ToolDescriptor): JsonObject` 或 `generate(ToolDescriptor toolDescriptor): JsonObject` (Java)
- 提供的實作：
  - `OpenAICompatibleToolDescriptorSchemer` — 產生與 OpenAI 風格的函式/工具定義相容的架構 (schema)。
  - `OllamaToolDescriptorSchemer` — 產生與 Ollama 工具 JSON 相容的架構 (schema)。

<!--- INCLUDE
import ai.koog.agents.core.tools.ToolDescriptor
import ai.koog.agents.core.tools.ToolParameterDescriptor
import ai.koog.agents.core.tools.ToolParameterType
import kotlinx.serialization.json.JsonObject
-->
```kotlin
// 介面
interface ToolDescriptorSchemaGenerator {
fun generate(toolDescriptor: ToolDescriptor): JsonObject
}
```
<!--- KNIT example-tool-descriptor-schemer-01.kt -->

## 為什麼要使用它

如果您想為 Kotlin 或 Java 中現有或新的 LLM 提供者提供自訂架構 (scheme)，請實作此介面以將 Koog 的 `ToolDescriptor` 轉換為預期的 JSON Schema 格式。

## 實作範例

以下是一個 Kotlin 和 Java 的極簡自訂實作，僅呈現參數型別的子集，用以說明如何接入 SPI。實際實作應涵蓋所有 `ToolParameterType`（String、Integer、Float、Boolean、Null、Enum、List、Object、AnyOf）。

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
                            else -> put("type", "string") // 為了簡潔起見的備援方案
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

            // 屬性
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
                    prop.put("type", JsonPrimitive("string")); // 為了簡潔起見的備援方案
                }

                props.put(p.getName(), new JsonObject(prop));
            }
            root.put("properties", new JsonObject(props));

            // 必要陣列
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

## 搭配用戶端的使用範例

通常您不需要直接呼叫 schemer。Koog 用戶端接受 `ToolDescriptor` 物件清單，並在為提供者序列化請求時，於內部套用正確的 schemer。

下面的範例定義了一個簡單的工具，並將其傳遞給 OpenAI 用戶端。用戶端將在底層使用 `OpenAICompatibleToolDescriptorSchemer` 來建置 JSON 架構。

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
                            else -> put("type", "string") // 為了簡潔起見的備援方案
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
    // 擴充 OpenAI 相容 schemer 的自訂 schemer 在文件中僅提供 Kotlin 版本；Java 範例中我們重複使用上方的 MinimalSchemer。
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

如果您需要直接存取產生的架構（用於偵錯或自訂傳輸），您可以具現化特定提供者的 schemer 並自行序列化 JSON：

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