# 功能型代理 (Functional agents)

使用功能型代理 (functional agents) 時，您將邏輯實作為一個函式，用於處理使用者輸入、與 LLM 互動、在必要時呼叫工具並產生最終輸出。
與 [圖形化代理 (graph-based agents)](graph-based-agents.md) 相比，這通常意者更快的原型製作 (prototyping)，但具有以下缺點：

- 不易視覺化
- 無狀態持久化 (state persistence)

??? note "先決條件"

    --8<-- "quickstart-snippets.md:prerequisites"

    --8<-- "quickstart-snippets.md:dependencies"

    --8<-- "quickstart-snippets.md:api-key"

    本頁面中的範例假設您正透過 Ollama 在本機執行 Llama 3.2。

本頁面說明如何實作功能型策略，以為您的代理快速製作某些自訂邏輯的原型。

## 建立最小化功能型代理

若要建立最小化功能型代理，請使用與 [基本代理](basic-agents.md) 相同的 [`AIAgent`](https://api.koog.ai/agents/agents-core/ai.koog.agents.core.agent/-a-i-agent/index.html) 介面，並將 [`AIAgentFunctionalStrategy`](https://api.koog.ai/agents/agents-core/ai.koog.agents.core.agent/-a-i-agent-functional-strategy/index.html) 的執行個體傳遞給它。
您可以定義一個功能型策略，該策略預期一個輸入並傳回一個輸出，進行一次 LLM 呼叫，然後從回應中傳回助理訊息的內容。

在 Kotlin 中，最方便的方式是使用 `functionalStrategy {...}` DSL 方法。在 Java 中，您可以使用 `AIAgent` builder 上的 `functionalStrategy` 方法。

=== "Kotlin"

    <!--- INCLUDE
    import ai.koog.agents.core.agent.AIAgent
    import ai.koog.agents.core.agent.functionalStrategy
    import ai.koog.prompt.executor.llms.all.simpleOllamaAIExecutor
    import ai.koog.prompt.executor.ollama.client.OllamaModels
    import kotlinx.coroutines.runBlocking
    -->
    ```kotlin
    val strategy = functionalStrategy<String, String> { input ->
        val response = requestLLM(input)
        response.asAssistantMessage().content
    }

    val mathAgent = AIAgent(
        promptExecutor = simpleOllamaAIExecutor(),
        llmModel = OllamaModels.Meta.LLAMA_3_2,
        strategy = strategy
    )

    fun main() = runBlocking {
        val result = mathAgent.run("What is 12 × 9?")
        println(result)
    }
    ```
    <!--- KNIT example-functional-agent-01.kt -->

=== "Java"

    <!--- INCLUDE
    /**
    -->
    <!--- SUFFIX
    **/
    -->
    ```java
    AIAgent<String, String> mathAgent = AIAgent.builder()
        .promptExecutor(SimpleLLMExecutorsKt.simpleOllamaAIExecutor("http://localhost:11434"))
        .llmModel(OllamaModels.Meta.LLAMA_3_2)
        .functionalStrategy("mathStrategy", (AIAgentFunctionalContext context, String input) -> {
            Message.Response response = context.requestLLM(input);
            if (response instanceof Message.Assistant) {
                return ((Message.Assistant) response).getContent();
            }
            return "";
        })
        .build();

    String result = mathAgent.run("What is 12 × 9?");
    System.out.println(result);
    ```
   <!--- KNIT example-functional-agent-java-01.java -->

代理可以產生以下輸出：

```text
The answer to 12 × 9 is 108.
```
<!--- KNIT example-functional-agent-01.txt -->

## 進行循序的 LLM 呼叫

您可以擴充之前的策略以進行多次循序的 LLM 呼叫：

=== "Kotlin"

    <!--- INCLUDE
    import ai.koog.agents.core.agent.functionalStrategy
    -->
    ```kotlin
    val strategy = functionalStrategy<String, String> { input ->
        // 第一次 LLM 呼叫根據使用者輸入產生初步草案
        val draft = requestLLM("Draft: $input").asAssistantMessage().content
        // 第二次 LLM 呼叫改進初步草案
        val improved = requestLLM("Improve and clarify.").asAssistantMessage().content
        // 最後一次 LLM 呼叫將改進後的文字格式化並傳回結果
        requestLLM("Format the result as bold.").asAssistantMessage().content
    }
    ```
    <!--- KNIT example-functional-agent-02.kt -->

=== "Java"

    <!--- INCLUDE
    /**
    -->
    <!--- SUFFIX
    **/
    -->
    ```java
    AIAgent<String, String> mathAgent = AIAgent.builder()
        .promptExecutor(simpleOllamaAIExecutor("http://localhost:11434"))
        .systemPrompt("You are a precise math assistant.")
        .llmModel(OllamaModels.Meta.LLAMA_3_2)
        .functionalStrategy((AIAgentFunctionalContext context, String input) -> {
            // 第一次 LLM 呼叫根據使用者輸入產生初步草案
            Message.Response draftResponse = context.requestLLM("Draft: " + input);
            String draft = "";
            if (draftResponse instanceof Message.Assistant) {
                draft = ((Message.Assistant) draftResponse).getContent();
            }

            // 第二次 LLM 呼叫改進初步草案
            Message.Response improvedResponse = context.requestLLM("Improve and clarify.");
            String improved = "";
            if (improvedResponse instanceof Message.Assistant) {
                improved = ((Message.Assistant) improvedResponse).getContent();
            }

            // 最後一次 LLM 呼叫將改進後的文字格式化並傳回結果
            Message.Response finalResponse = context.requestLLM("Format the result as bold.");
            if (finalResponse instanceof Message.Assistant) {
                return ((Message.Assistant) finalResponse).getContent();
            }
            return "";
        })
        .build();
    ```
    <!--- KNIT example-functional-agent-java-02.java -->

代理可以產生以下輸出：

```text
To calculate the product of 12 and 9, we multiply these two numbers together.

12 × 9 = **108**
```
<!--- KNIT example-functional-agent-02.txt -->

## 加入工具

在許多情況下，功能型代理需要完成特定任務，例如讀取和寫入資料、呼叫 API 或執行其他確定性操作。在 Koog 中，您可以將這些功能公開為 [工具](../tools-overview.md)，並讓 LLM 決定何時呼叫它們。

以下是您需要執行的步驟：

1. 建立 [基於註解的工具](../annotation-based-tools.md)。
2. 將其加入工具註冊表 (tool registry) 並將註冊表傳遞給代理。
3. 確保代理策略可以識別 LLM 回應中的工具呼叫、執行要求的工具、將其結果傳送回 LLM，並重複此程序直到沒有剩餘的工具呼叫。

=== "Kotlin"

    <!--- INCLUDE
    import ai.koog.agents.core.agent.AIAgent
    import ai.koog.agents.core.agent.functionalStrategy
    import ai.koog.agents.core.tools.ToolRegistry
    import ai.koog.agents.core.tools.annotations.LLMDescription
    import ai.koog.agents.core.tools.annotations.Tool
    import ai.koog.agents.core.tools.reflect.ToolSet
    import ai.koog.prompt.executor.llms.all.simpleOllamaAIExecutor
    import ai.koog.prompt.executor.ollama.client.OllamaModels
    import kotlinx.coroutines.runBlocking
    -->
    ```kotlin
    @LLMDescription("Tools for performing math operations")
    class MathTools : ToolSet {
        @Tool
        @LLMDescription("Multiplies two numbers and returns the result")
        fun multiply(a: Int, b: Int): Int {
            // 這不是必須的，但有助於在主控台輸出中看到工具呼叫
            println("Multiplying $a and $b...")
            return a * b
        }
    }

    val toolRegistry = ToolRegistry {
        tool(MathTools()::multiply)
    }

    val strategy = functionalStrategy<String, String> { input ->
        // 將使用者輸入傳送至 LLM
        var responses = requestLLMMultiple(input)

        // 僅在 LLM 要求工具時進行迴圈
        while (responses.containsToolCalls()) {
            // 從回應中提取工具呼叫
            val pendingCalls = extractToolCalls(responses)
            // 執行工具並傳回結果
            val results = executeMultipleTools(pendingCalls)
            // 將工具結果傳送回 LLM。LLM 可能會呼叫更多工具或傳回最終輸出
            responses = sendMultipleToolResults(results)
        }

        // 當沒有剩餘工具呼叫時，從回應中提取並傳回助理訊息內容
        responses.single().asAssistantMessage().content
    }

    val mathAgentWithTools = AIAgent(
        promptExecutor = simpleOllamaAIExecutor(),
        llmModel = OllamaModels.Meta.LLAMA_3_2,
        toolRegistry = toolRegistry,
        strategy = strategy
    )

    fun main() = runBlocking {
        val result = mathAgentWithTools.run("Multiply 3 by 4, then multiply the result by 5.")
        println(result)
    }
    ```
    <!--- KNIT example-functional-agent-03.kt -->

=== "Java"

    <!--- INCLUDE
    /**
    -->
    <!--- SUFFIX
    **/
    -->
    ```java
    @LLMDescription(description = "Tools for performing math operations")
    public static class MathTools implements ToolSet {
        @Tool
        @LLMDescription(description = "Multiplies two numbers and returns the result")
        public int multiply(int a, int b) {
            // 這不是必須的，但有助於在主控台輸出中看到工具呼叫
            System.out.println("Multiplying " + a + " and " + b + "...");
            return a * b;
        }
    }

    public static void main(String[] args) {
        MathTools mathTools = new MathTools();
        ToolRegistry toolRegistry = ToolRegistry.builder()
            .tools(mathTools)
            .build();

        AIAgent<String, String> mathAgentWithTools = AIAgent.builder()
            .promptExecutor(SimpleLLMExecutorsKt.simpleOllamaAIExecutor("http://localhost:11434"))
            .llmModel(OllamaModels.Meta.LLAMA_3_2)
            .toolRegistry(toolRegistry)
            .functionalStrategy("mathWithTools", (AIAgentFunctionalContext context, String input) -> {
                // 將使用者輸入傳送至 LLM
                `List<Message.Response>` responses = context.requestLLMMultiple(input);

                // 僅在 LLM 要求工具時進行迴圈
                while (context.containsToolCalls(responses)) {
                    // 從回應中提取工具呼叫
                    `List<Message.Tool.Call>` pendingCalls = context.extractToolCalls(responses);
                    // 執行工具並傳回結果
                    `List<ReceivedToolResult>` results = context.executeMultipleTools(pendingCalls, false);
                    // 將工具結果傳送回 LLM
                    responses = context.sendMultipleToolResults(results);
                }

                // 從回應中提取並傳回助理訊息內容
                Message.Response finalResponse = responses.get(0);
                if (finalResponse instanceof Message.Assistant) {
                    return ((Message.Assistant) finalResponse).getContent();
                }
                return "";
            })
            .build();

        String result = mathAgentWithTools.run("Multiply 3 by 4, then multiply the result by 5.");
        System.out.println(result);
    }
    ```
   <!--- KNIT example-functional-agent-java-03.java -->

代理可以產生以下輸出：

```text
Multiplying 3 and 4...
Multiplying 12 and 5...
The result of multiplying 3 by 4 is 12. Multiplying 12 by 5 gives us a final answer of 60.
```
<!--- KNIT example-functional-agent-03.txt -->

## 後續步驟

- 了解如何建立 [圖形化代理 (graph-based agents)](graph-based-agents.md)