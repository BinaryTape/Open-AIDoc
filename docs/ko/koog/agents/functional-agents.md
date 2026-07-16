# 함수형 에이전트 (Functional agents)

함수형 에이전트를 사용하면 사용자 입력을 처리하고, LLM과 상호작용하며, 필요한 경우 도구를 호출하고, 최종 출력을 생성하는 로직을 하나의 함수로 구현합니다.
[그래프 기반 에이전트](graph-based-agents.md)와 비교했을 때, 이는 보통 다음과 같은 단점이 있지만 더 빠른 프로토타이핑이 가능함을 의미합니다:

- 시각화가 쉽지 않음
- 상태 유지(state persistence)가 없음

??? note "사전 요구 사항 (Prerequisites)"

    --8<-- "quickstart-snippets.md:prerequisites"

    --8<-- "quickstart-snippets.md:dependencies"

    --8<-- "quickstart-snippets.md:api-key"

    이 페이지의 예제들은 Ollama를 통해 로컬에서 Llama 3.2를 실행하고 있다고 가정합니다.

이 페이지에서는 에이전트를 위한 커스텀 로직을 빠르게 프로토타이핑하기 위해 함수형 전략을 구현하는 방법을 설명합니다.

## 최소한의 함수형 에이전트 생성하기

최소한의 함수형 에이전트를 만들려면, [기본 에이전트](basic-agents.md)와 동일하게 [`AIAgent`](https://api.koog.ai/agents/agents-core/ai.koog.agents.core.agent/-a-i-agent/index.html) 인터페이스를 사용하고 [`AIAgentFunctionalStrategy`](https://api.koog.ai/agents/agents-core/ai.koog.agents.core.agent/-a-i-agent-functional-strategy/index.html) 인스턴스를 전달합니다.
입력을 받아 출력을 반환하고, 한 번의 LLM 호출을 수행한 후 응답에서 어시스턴트 메시지의 내용을 반환하는 함수형 전략을 정의할 수 있습니다.

Kotlin에서는 `functionalStrategy {...}` DSL 메서드를 사용하는 것이 가장 편리합니다. Java에서는 `AIAgent` 빌더의 `functionalStrategy` 메서드를 사용할 수 있습니다.

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

에이전트는 다음과 같은 출력을 생성할 수 있습니다:

```text
The answer to 12 × 9 is 108.
```
<!--- KNIT example-functional-agent-01.txt -->

## 순차적 LLM 호출하기

이전 전략을 확장하여 여러 번의 순차적인 LLM 호출을 수행할 수 있습니다:

=== "Kotlin"

    <!--- INCLUDE
    import ai.koog.agents.core.agent.functionalStrategy
    -->
    ```kotlin
    val strategy = functionalStrategy<String, String> { input ->
        // 첫 번째 LLM 호출은 사용자 입력을 기반으로 초기 초안을 생성합니다.
        val draft = requestLLM("Draft: $input").asAssistantMessage().content
        // 두 번째 LLM 호출은 초기 초안을 개선합니다.
        val improved = requestLLM("Improve and clarify.").asAssistantMessage().content
        // 마지막 LLM 호출은 개선된 텍스트의 형식을 지정하고 결과를 반환합니다.
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
            // 첫 번째 LLM 호출은 사용자 입력을 기반으로 초기 초안을 생성합니다.
            Message.Response draftResponse = context.requestLLM("Draft: " + input);
            String draft = "";
            if (draftResponse instanceof Message.Assistant) {
                draft = ((Message.Assistant) draftResponse).getContent();
            }

            // 두 번째 LLM 호출은 초기 초안을 개선합니다.
            Message.Response improvedResponse = context.requestLLM("Improve and clarify.");
            String improved = "";
            if (improvedResponse instanceof Message.Assistant) {
                improved = ((Message.Assistant) improvedResponse).getContent();
            }

            // 마지막 LLM 호출은 개선된 텍스트의 형식을 지정하고 결과를 반환합니다.
            Message.Response finalResponse = context.requestLLM("Format the result as bold.");
            if (finalResponse instanceof Message.Assistant) {
                return ((Message.Assistant) finalResponse).getContent();
            }
            return "";
        })
        .build();
    ```
    <!--- KNIT example-functional-agent-java-02.java -->

에이전트는 다음과 같은 출력을 생성할 수 있습니다:

```text
To calculate the product of 12 and 9, we multiply these two numbers together.

12 × 9 = **108**
```
<!--- KNIT example-functional-agent-02.txt -->

## 도구 추가하기

많은 경우, 함수형 에이전트는 데이터 읽기 및 쓰기, API 호출 또는 기타 결정론적 작업 수행과 같은 특정 작업을 완료해야 합니다.
Koog에서는 이러한 기능을 [도구(tools)](../tools-overview.md)로 노출하고 LLM이 이를 호출할 시점을 결정하게 할 수 있습니다.

수행해야 할 작업은 다음과 같습니다:

1. [어노테이션 기반 도구](../annotation-based-tools.md)를 생성합니다.
2. 도구 레지스트리(tool registry)에 추가하고 레지스트리를 에이전트에 전달합니다.
3. 에이전트 전략이 LLM 응답에서 도구 호출을 식별하고, 요청된 도구를 실행하며, 그 결과를 다시 LLM에 보내고, 더 이상 도구 호출이 남지 않을 때까지 이 과정을 반복할 수 있는지 확인합니다.

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
            // 이는 필수는 아니지만, 콘솔 출력에서 도구 호출을 확인하는 데 도움이 됩니다.
            println("Multiplying $a and $b...")
            return a * b
        }
    }

    val toolRegistry = ToolRegistry {
        tool(MathTools()::multiply)
    }

    val strategy = functionalStrategy<String, String> { input ->
        // 사용자 입력을 LLM에 보냅니다.
        var responses = requestLLMMultiple(input)

        // LLM이 도구를 요청하는 동안에만 루프를 돕니다.
        while (responses.containsToolCalls()) {
            // 응답에서 도구 호출을 추출합니다.
            val pendingCalls = extractToolCalls(responses)
            // 도구를 실행하고 결과를 반환합니다.
            val results = executeMultipleTools(pendingCalls)
            // 도구 결과를 다시 LLM에 보냅니다. LLM은 더 많은 도구를 호출하거나 최종 출력을 반환할 수 있습니다.
            responses = sendMultipleToolResults(results)
        }

        // 남은 도구 호출이 없으면, 응답에서 어시스턴트 메시지 내용을 추출하여 반환합니다.
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
            // 이는 필수는 아니지만, 콘솔 출력에서 도구 호출을 확인하는 데 도움이 됩니다.
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
                // 사용자 입력을 LLM에 보냅니다.
                `List<Message.Response>` responses = context.requestLLMMultiple(input);

                // LLM이 도구를 요청하는 동안에만 루프를 돕니다.
                while (context.containsToolCalls(responses)) {
                    // 응답에서 도구 호출을 추출합니다.
                    `List<Message.Tool.Call>` pendingCalls = context.extractToolCalls(responses);
                    // 도구를 실행하고 결과를 반환합니다.
                    `List<ReceivedToolResult>` results = context.executeMultipleTools(pendingCalls, false);
                    // 도구 결과를 다시 LLM에 보냅니다.
                    responses = context.sendMultipleToolResults(results);
                }

                // 응답에서 어시스턴트 메시지 내용을 추출하여 반환합니다.
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

에이전트는 다음과 같은 출력을 생성할 수 있습니다:

```text
Multiplying 3 and 4...
Multiplying 12 and 5...
The result of multiplying 3 by 4 is 12. Multiplying 12 by 5 gives us a final answer of 60.
```
<!--- KNIT example-functional-agent-03.txt -->

## 다음 단계

- [그래프 기반 에이전트(graph-based agents)](graph-based-agents.md)를 만드는 방법 알아보기