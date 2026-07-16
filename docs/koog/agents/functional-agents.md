# 功能型代理

使用功能型代理，您可以将逻辑实现为一个函数，用于处理用户输入、与 LLM 交互、在必要时调用工具并生成最终输出。
与[基于图的代理](graph-based-agents.md)相比，这通常意味着更快的原型设计，但也存在以下缺点：

- 不易可视化
- 无状态持久化

??? note "前提条件"

    --8<-- "quickstart-snippets.md:prerequisites"

    --8<-- "quickstart-snippets.md:dependencies"

    --8<-- "quickstart-snippets.md:api-key"

    本页中的示例假设您正在通过 Ollama 在本地运行 Llama 3.2。

本页介绍了如何实现功能型策略，以便为您的代理快速构建某些自定义逻辑的原型。

## 创建最小功能型代理

要创建一个最小功能型代理，请使用与[基础代理](basic-agents.md)相同的 [`AIAgent`](https://api.koog.ai/agents/agents-core/ai.koog.agents.core.agent/-a-i-agent/index.html) 接口，并向其传递一个 [`AIAgentFunctionalStrategy`](https://api.koog.ai/agents/agents-core/ai.koog.agents.core.agent/-a-i-agent-functional-strategy/index.html) 实例。
您可以定义一个功能型策略，该策略接收输入并返回输出，进行一次 LLM 调用，然后从响应中返回助手消息的内容。

在 Kotlin 中，最便捷的方法是使用 `functionalStrategy {...}` DSL 方法。在 Java 中，您可以使用 `AIAgent` 构建器上的 `functionalStrategy` 方法。

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

该代理可以生成以下输出：

```text
The answer to 12 × 9 is 108.
```
<!--- KNIT example-functional-agent-01.txt -->

## 进行顺序 LLM 调用

您可以扩展之前的策略以进行多次顺序 LLM 调用：

=== "Kotlin"

    <!--- INCLUDE
    import ai.koog.agents.core.agent.functionalStrategy
    -->
    ```kotlin
    val strategy = functionalStrategy<String, String> { input ->
        // 第一次 LLM 调用根据用户输入生成初稿
        val draft = requestLLM("Draft: $input").asAssistantMessage().content
        // 第二次 LLM 调用改进初稿
        val improved = requestLLM("Improve and clarify.").asAssistantMessage().content
        // 最后一次 LLM 调用对改进后的文本进行格式设置并返回结果
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
            // 第一次 LLM 调用根据用户输入生成初稿
            Message.Response draftResponse = context.requestLLM("Draft: " + input);
            String draft = "";
            if (draftResponse instanceof Message.Assistant) {
                draft = ((Message.Assistant) draftResponse).getContent();
            }

            // 第二次 LLM 调用改进初稿
            Message.Response improvedResponse = context.requestLLM("Improve and clarify.");
            String improved = "";
            if (improvedResponse instanceof Message.Assistant) {
                improved = ((Message.Assistant) improvedResponse).getContent();
            }

            // 最后一次 LLM 调用对改进后的文本进行格式设置并返回结果
            Message.Response finalResponse = context.requestLLM("Format the result as bold.");
            if (finalResponse instanceof Message.Assistant) {
                return ((Message.Assistant) finalResponse).getContent();
            }
            return "";
        })
        .build();
    ```
    <!--- KNIT example-functional-agent-java-02.java -->

该代理可以生成以下输出：

```text
To calculate the product of 12 and 9, we multiply these two numbers together.

12 × 9 = **108**
```
<!--- KNIT example-functional-agent-02.txt -->

## 添加工具

在许多情况下，功能型代理需要完成特定任务，例如读取和写入数据、调用 API 或执行其他确定性操作。
在 Koog 中，您可以将此类功能公开为[工具](../tools-overview.md)，并让 LLM 决定何时调用它们。

以下是您需要执行的操作：

1. 创建一个[基于注解的工具](../annotation-based-tools.md)。
2. 将其添加到工具注册表并将该注册表传递给代理。
3. 确保代理策略能够识别 LLM 响应中的工具调用、执行请求的工具、将结果发送回 LLM，并重复此过程直到不再有工具调用为止。

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
            // 这不是必需的，但有助于在控制台输出中查看工具调用
            println("Multiplying $a and $b...")
            return a * b
        }
    }

    val toolRegistry = ToolRegistry {
        tool(MathTools()::multiply)
    }

    val strategy = functionalStrategy<String, String> { input ->
        // 将用户输入发送给 LLM
        var responses = requestLLMMultiple(input)

        // 仅在 LLM 请求工具时循环
        while (responses.containsToolCalls()) {
            // 从响应中提取工具调用
            val pendingCalls = extractToolCalls(responses)
            // 执行工具并返回结果
            val results = executeMultipleTools(pendingCalls)
            // 将工具结果发送回 LLM。LLM 可能会调用更多工具或返回最终输出
            responses = sendMultipleToolResults(results)
        }

        // 当不再有工具调用时，从响应中提取并返回助手消息内容
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
            // 这不是必需的，但有助于在控制台输出中查看工具调用
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
                // 将用户输入发送给 LLM
                `List<Message.Response>` responses = context.requestLLMMultiple(input);

                // 仅在 LLM 请求工具时循环
                while (context.containsToolCalls(responses)) {
                    // 从响应中提取工具调用
                    `List<Message.Tool.Call>` pendingCalls = context.extractToolCalls(responses);
                    // 执行工具并返回结果
                    `List<ReceivedToolResult>` results = context.executeMultipleTools(pendingCalls, false);
                    // 将工具结果发送回 LLM
                    responses = context.sendMultipleToolResults(results);
                }

                // 从响应中提取并返回助手消息内容
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

该代理可以生成以下输出：

```text
Multiplying 3 and 4...
Multiplying 12 and 5...
The result of multiplying 3 by 4 is 12. Multiplying 12 by 5 gives us a final answer of 60.
```
<!--- KNIT example-functional-agent-03.txt -->

## 后续步骤

- 了解如何创建[基于图的代理](graph-based-agents.md)