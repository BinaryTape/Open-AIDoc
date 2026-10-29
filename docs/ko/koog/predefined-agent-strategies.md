# 사전 정의된 에이전트 전략

에이전트 구현을 보다 쉽게 만들기 위해, Koog는 일반적인 에이전트 사용 사례에 적합한 사전 정의된 에이전트 전략을 제공합니다.
현재 다음과 같은 사전 정의된 전략을 사용할 수 있습니다.

- [채팅 에이전트 전략](#chat-agent-strategy)
- [ReAct 전략](#react-strategy)

## 채팅 에이전트 전략 {id="chat-agent-strategy"}

채팅 에이전트 전략은 채팅 상호작용 프로세스를 실행하도록 설계되었습니다.
이 전략은 사용자 입력을 처리하고, 도구를 실행하며, 채팅 방식의 응답을 제공하기 위해 서로 다른 단계, 노드 및 도구 간의 상호작용을 조정합니다.

### 개요 {id="overview"}

채팅 에이전트 전략은 에이전트가 다음과 같은 패턴을 따르도록 구현합니다:

1. 사용자 입력을 받습니다.
2. LLM을 사용하여 입력을 프로세싱합니다.
3. 도구를 호출하거나 직접 응답을 제공합니다.
4. 도구 실행 결과를 처리하고 대화를 이어갑니다.
5. LLM이 도구를 사용하는 대신 일반 텍스트로 응답하려고 시도할 경우 피드백을 제공합니다.

이러한 접근 방식은 에이전트가 사용자의 요청을 충족하기 위해 도구를 사용할 수 있는 대화형 인터페이스를 생성합니다.

### 설정 및 의존성 {id="setup-and-dependencies"}

Koog에서 채팅 에이전트 전략은 `chatAgentStrategy` 함수를 통해 구현됩니다. 에이전트 코드에서 이 함수를 사용하려면 다음 의존성을 추가하세요:

```
ai.koog.agents.ext.agent.chatAgentStrategy
```
<!--- KNIT example-predefined-strategies-01.txt -->

이 전략을 사용하려면 아래 패턴에 따라 AI 에이전트를 생성하세요:

=== "Kotlin"

    <!--- INCLUDE
    import ai.koog.agents.core.agent.AIAgent
    import ai.koog.prompt.executor.llms.all.simpleOpenAIExecutor
    import ai.koog.agents.ext.agent.chatAgentStrategy
    import ai.koog.agents.core.tools.ToolRegistry
    import ai.koog.prompt.executor.clients.openai.OpenAIModels

    val apiKey = System.getenv("OPENAI_API_KEY") ?: error("Please set OPENAI_API_KEY environment variable")
    val promptExecutor =simpleOpenAIExecutor(apiKey)
    val toolRegistry = ToolRegistry.EMPTY
    val model =  OpenAIModels.Chat.O4Mini
    -->
    ```kotlin
    val chatAgent = AIAgent(
        promptExecutor = promptExecutor,
        toolRegistry = toolRegistry,
        llmModel = model,
        // chatAgentStrategy를 에이전트 전략으로 설정
        strategy = chatAgentStrategy()
    )
    ```
    <!--- KNIT example-predefined-strategies-01.kt -->

=== "Java"

    <!--- INCLUDE
    import ai.koog.agents.core.agent.AIAgent;
    import ai.koog.agents.core.tools.ToolRegistry;
    import ai.koog.prompt.executor.clients.openai.OpenAIModels;
    import ai.koog.prompt.executor.model.PromptExecutor;
    import ai.koog.agents.ext.agent.AIAgentStrategies;
    class examplePredefinedStrategiesJava01 {
        public static void main(String[] args) {
    -->
    <!--- SUFFIX
        }
    }
    -->
    ```java
    AIAgent<String, String> chatAgent = AIAgent.builder()
        .promptExecutor(PromptExecutor.builder().openAI("OPENAI_API_KEY").build())
        .llmModel(OpenAIModels.Chat.O4Mini)
        .toolRegistry(ToolRegistry.builder().build())
        // chatAgentStrategy를 에이전트 전략으로 설정
        .graphStrategy(AIAgentStrategies.chatAgentStrategy())
        .build();
    ```
    <!--- KNIT examplePredefinedStrategiesJava01.java -->

### 채팅 에이전트 전략을 사용하는 경우 {id="when-to-use-the-chat-agent-strategy"}

채팅 에이전트 전략은 특히 다음과 같은 경우에 유용합니다:

- 도구를 사용해야 하는 대화형 에이전트 구축
- 사용자 요청에 따라 작업을 수행할 수 있는 어시스턴트 제작
- 외부 시스템이나 데이터에 액세스해야 하는 챗봇 구현
- 일반 텍스트 응답보다 도구 사용을 강제하고 싶은 시나리오

### 예제 {id="example"}

다음은 사전 정의된 채팅 에이전트 전략(`chatAgentStrategy`)과 에이전트가 사용할 수 있는 도구를 구현한 AI 에이전트의 코드 샘플입니다:

=== "Kotlin"

    <!--- INCLUDE
    import ai.koog.agents.core.agent.AIAgent
    import ai.koog.prompt.executor.llms.all.simpleOpenAIExecutor
    import ai.koog.agents.ext.agent.chatAgentStrategy
    import ai.koog.agents.core.tools.ToolRegistry
    import ai.koog.prompt.executor.clients.openai.OpenAIModels
    import ai.koog.agents.ext.tool.AskUser
    import ai.koog.agents.ext.tool.SayToUser

    typealias searchTool = AskUser
    typealias weatherTool = SayToUser

    val apiKey = System.getenv("OPENAI_API_KEY") ?: error("Please set OPENAI_API_KEY environment variable")
    val promptExecutor =simpleOpenAIExecutor(apiKey)
    val toolRegistry = ToolRegistry.EMPTY
    val model =  OpenAIModels.Chat.O4Mini
    -->
    ```kotlin
    val chatAgent = AIAgent(
        promptExecutor = promptExecutor,
        llmModel = model,
        // chatAgentStrategy를 에이전트 전략으로 사용
        strategy = chatAgentStrategy(),
        // 에이전트가 사용할 수 있는 도구 추가
        toolRegistry = ToolRegistry {
            tool(searchTool)
            tool(weatherTool)
        }
    )

    suspend fun main() { 
        // 사용자 쿼리로 에이전트 실행
        val result = chatAgent.run("오늘 날씨는 어때? 우산을 챙겨야 할까?")
    }
    ```
    <!--- KNIT example-predefined-strategies-02.kt -->

=== "Java"

    <!--- INCLUDE
    import ai.koog.agents.core.agent.AIAgent;
    import ai.koog.agents.core.tools.ToolRegistry;
    import ai.koog.agents.core.tools.reflect.ToolSet;
    import ai.koog.agents.core.tools.annotations.Tool;
    import ai.koog.agents.core.tools.annotations.LLMDescription;
    import ai.koog.prompt.executor.clients.openai.OpenAIModels;
    import ai.koog.prompt.executor.model.PromptExecutor;
    import ai.koog.agents.ext.agent.AIAgentStrategies;
    class examplePredefinedStrategiesJava02 {
        static class SearchAndWeatherTools implements ToolSet {
            @Tool
            @LLMDescription("정보 검색")
            public String search(@LLMDescription("검색 쿼리") String query) {
                return "검색 결과: " + query;
            }
            @Tool
            @LLMDescription("날씨 정보 조회")
            public String weather(@LLMDescription("위치") String location) {
                return location + "의 날씨: 맑음";
            }
        }
        public static void main(String[] args) {
    -->
    <!--- SUFFIX
        }
    }
    -->
    ```java
    // 에이전트가 사용할 수 있는 도구 추가
    ToolRegistry toolRegistry = ToolRegistry.builder()
        .tools(new SearchAndWeatherTools())
        .build();

    AIAgent<String, String> chatAgent = AIAgent.builder()
        .promptExecutor(PromptExecutor.builder().openAI("OPENAI_API_KEY").build())
        .llmModel(OpenAIModels.Chat.O4Mini)
        // chatAgentStrategy를 에이전트 전략으로 사용
        .graphStrategy(AIAgentStrategies.chatAgentStrategy())
        .toolRegistry(toolRegistry)
        .build();

    // 사용자 쿼리로 에이전트 실행
    String result = chatAgent.run("오늘 날씨는 어때? 우산을 챙겨야 할까?");
    ```
    <!--- KNIT examplePredefinedStrategiesJava02.java -->

## ReAct 전략 {id="react-strategy"}

ReAct(Reasoning and Acting, 추론 및 실행) 전략은 태스크를 동적으로 처리하고 대규모 언어 모델(LLM)에 출력을 요청하기 위해 추론 단계와 실행 단계를 번갈아 수행하는 AI 에이전트 전략입니다.

### 개요

ReAct 전략은 에이전트가 다음과 같은 패턴을 따르도록 구현합니다:

1. 현재 상태에 대해 추론하고 다음 단계를 계획합니다.
2. 해당 추론을 바탕으로 액션을 수행합니다.
3. 액션의 결과를 관찰합니다.
4. 이 사이클을 반복합니다.

이 접근 방식은 추론(문제를 단계별로 생각하기)과 실행(정보를 수집하거나 작업을 수행하기 위해 도구 실행)의 장점을 결합한 것입니다.

### 흐름도 {id="flow-diagram"}

ReAct 전략의 흐름도는 다음과 같습니다:

![Koog flow diagram](img/koog-react-diagram-light.png#only-light)
![Koog flow diagram](img/koog-react-diagram-dark.png#only-dark)

### 설정 및 의존성

Koog에서 ReAct 전략은 `reActStrategy` 함수를 통해 구현됩니다.

이 전략을 사용하려면 아래 패턴에 따라 AI 에이전트를 생성하세요:

=== "Kotlin"

    <!--- INCLUDE
    import ai.koog.agents.core.agent.AIAgent
    import ai.koog.prompt.executor.llms.all.simpleOpenAIExecutor
    import ai.koog.agents.ext.agent.reActStrategy
    import ai.koog.agents.core.tools.ToolRegistry
    import ai.koog.prompt.executor.clients.openai.OpenAIModels

    val apiKey = System.getenv("OPENAI_API_KEY") ?: error("Please set OPENAI_API_KEY environment variable")
    val promptExecutor = simpleOpenAIExecutor(apiKey)
    val toolRegistry = ToolRegistry.EMPTY
    val model =  OpenAIModels.Chat.O4Mini
    -->
    ```kotlin hl_lines="5-10"
    val reActAgent = AIAgent(
        promptExecutor = promptExecutor,
        toolRegistry = toolRegistry,
        llmModel = model,
        // reActStrategy를 에이전트 전략으로 설정
        strategy = reActStrategy(
            // 선택적 파라미터 값 설정
            reasoningInterval = 1,
            name = "react_agent"
        )
    )
    ```
    <!--- KNIT example-predefined-strategies-03.kt -->

=== "Java"

    <!--- INCLUDE
    import ai.koog.agents.core.agent.AIAgent;
    import ai.koog.agents.core.tools.ToolRegistry;
    import ai.koog.prompt.executor.clients.openai.OpenAIModels;
    import ai.koog.prompt.executor.model.PromptExecutor;
    import ai.koog.agents.ext.agent.AIAgentStrategies;
    class examplePredefinedStrategiesJava03 {
        public static void main(String[] args) {
    -->
    <!--- SUFFIX
        }
    }
    -->
    ```java
    AIAgent<String, String> reActAgent = AIAgent.builder()
        .promptExecutor(PromptExecutor.builder().openAI("OPENAI_API_KEY").build())
        .llmModel(OpenAIModels.Chat.O4Mini)
        .toolRegistry(ToolRegistry.builder().build())
        // reActStrategy를 에이전트 전략으로 설정
        .graphStrategy(AIAgentStrategies.reActStrategy(
            // 선택적 파라미터 값 설정
            1, // reasoningInterval
            "react_agent" // name
        ))
        .build();
    ```
    

### 파라미터 {id="parameters"}

`reActStrategy` 함수는 다음과 같은 파라미터를 가집니다:

| 파라미터 | 타입 | 기본값 | 설명 |
|---------------------|--------|----------|---------------------------------------------------------------------|
| `reasoningInterval` | Int    | 1        | 추론 단계의 간격을 지정합니다. 0보다 커야 합니다. |
| `name`              | String | `re_act` | 전략의 이름입니다. |

### 사용 사례 예시 {id="example-use-case"}

간단한 뱅킹 에이전트와 함께 ReAct 전략이 어떻게 작동하는지에 대한 예시입니다:

#### 1. 사용자 입력 {id="1-user-input"}

사용자가 초기 프롬프트를 보냅니다. 예를 들어, `지난달에 내가 얼마나 썼어?`와 같은 질문일 수 있습니다.

#### 2. 추론 (Reasoning) {id="2-reasoning"}

에이전트는 사용자 입력과 추론 프롬프트를 바탕으로 초기 추론을 수행합니다. 추론 내용은 다음과 같을 수 있습니다:

```text
다음 단계를 따라야 합니다:
1. 지난달의 모든 거래 내역을 가져옵니다.
2. 입금 내역(양수 금액)을 제외합니다.
3. 총 지출액을 계산합니다.
```
<!--- KNIT example-predefined-strategies-02.txt -->

#### 3. 액션 및 실행 (Action and execution), 1단계 {id="3-action-and-execution-phase-1"}

에이전트가 이전 단계에서 정의한 작업 항목을 바탕으로, 지난달의 모든 거래 내역을 가져오는 도구를 실행합니다.

이 경우 실행할 도구는 `get_transactions`이며, 지난달의 모든 거래를 가져오라는 요청과 일치하는 `startDate` 및 `endDate` 인자를 함께 전달합니다:

```text
{tool: "get_transactions", args: {startDate: "2025-05-19", endDate: "2025-06-18"}}
```
<!--- KNIT example-predefined-strategies-03.txt -->

도구는 다음과 같은 결과를 반환할 수 있습니다:

```text
[
  {date: "2025-05-25", amount: -100.00, description: "Grocery Store"},
  {date: "2025-05-31", amount: +1000.00, description: "Salary Deposit"},
  {date: "2025-06-10", amount: -500.00, description: "Rent Payment"},
  {date: "2025-06-13", amount: -200.00, description: "Utilities"}
]
```
<!--- KNIT example-predefined-strategies-04.txt -->

#### 4. 추론 (Reasoning) {id="4-reasoning"}

도구에서 반환된 결과를 가지고, 에이전트는 흐름의 다음 단계를 결정하기 위해 다시 추론을 수행합니다:

```text
거래 내역을 확인했습니다. 이제 다음 작업이 필요합니다:
1. +1000.00의 급여 입금 내역을 제거합니다.
2. 남은 거래 내역을 합산합니다.
```
<!--- KNIT example-predefined-strategies-05.txt -->

#### 5. 액션 및 실행 (Action and execution), 2단계 {id="5-action-and-execution-phase-2"}

이전 추론 단계를 바탕으로, 에이전트는 도구 인자로 제공된 금액들을 합산하는 `calculate_sum` 도구를 호출합니다. 추론 결과 거래 내역에서 양수 금액을 제거하기로 했으므로, 도구 인자로 제공되는 금액은 음수 금액들뿐입니다:

```text
{tool: "calculate_sum", args: {amounts: [-100.00, -500.00, -200.00]}}
```
<!--- KNIT example-predefined-strategies-06.txt -->

도구가 최종 결과를 반환합니다:

```text
-800.00
```
<!--- KNIT example-predefined-strategies-07.txt -->

#### 6. 최종 응답 {id="6-final-response"}

에이전트는 계산된 합계가 포함된 최종 응답(어시스턴트 메시지)을 반환합니다:

```text
지난달에 식료품, 월세, 공과금으로 총 $800.00를 지출하셨습니다.
```
<!--- KNIT example-predefined-strategies-08.txt -->

### ReAct 전략을 사용하는 경우 {id="when-to-use-the-react-strategy"}

ReAct 전략은 특히 다음과 같은 경우에 유용합니다:

- 다단계 추론이 필요한 복잡한 태스크
- 에이전트가 최종 답변을 제공하기 전에 정보를 수집해야 하는 시나리오
- 문제를 더 작은 단계로 나누었을 때 도움이 되는 문제들
- 분석적 사고와 도구 사용이 모두 필요한 태스크

### 예제

다음은 사전 정의된 ReAct 전략(`reActStrategy`)과 에이전트가 사용할 수 있는 도구를 구현한 AI 에이전트의 코드 샘플입니다:

=== "Kotlin"

    <!--- INCLUDE
    import ai.koog.agents.core.agent.AIAgent
    import ai.koog.prompt.executor.llms.all.simpleOpenAIExecutor
    import ai.koog.agents.ext.agent.reActStrategy
    import ai.koog.agents.core.tools.ToolRegistry
    import ai.koog.prompt.executor.clients.openai.OpenAIModels
    import ai.koog.agents.ext.tool.AskUser
    import ai.koog.agents.ext.tool.SayToUser

    typealias Input = String

    typealias getTransactions = AskUser
    typealias calculateSum = SayToUser

    val apiKey = System.getenv("OPENAI_API_KEY") ?: error("Please set OPENAI_API_KEY environment variable")
    val promptExecutor = simpleOpenAIExecutor(apiKey)
    val toolRegistry = ToolRegistry.EMPTY
    val model =  OpenAIModels.Chat.O4Mini
    -->
    ```kotlin
    val bankingAgent = AIAgent(
        promptExecutor = promptExecutor,
        llmModel = model,
        // reActStrategy를 에이전트 전략으로 사용
        strategy = reActStrategy(
            reasoningInterval = 1,
            name = "banking_agent"
        ),
        // 에이전트가 사용할 수 있는 도구 추가
        toolRegistry = ToolRegistry {
            tool(getTransactions)
            tool(calculateSum)
        }
    )

    suspend fun main() { 
        // 사용자 쿼리로 에이전트 실행
        val result = bankingAgent.run("지난달에 내가 얼마나 썼어?")
    }
    ```
    <!--- KNIT example-predefined-strategies-04.kt -->

=== "Java"

    <!--- INCLUDE
    import ai.koog.agents.core.agent.AIAgent;
    import ai.koog.agents.core.tools.ToolRegistry;
    import ai.koog.agents.core.tools.reflect.ToolSet;
    import ai.koog.agents.core.tools.annotations.Tool;
    import ai.koog.agents.core.tools.annotations.LLMDescription;
    import ai.koog.prompt.executor.clients.openai.OpenAIModels;
    import ai.koog.prompt.executor.model.PromptExecutor;
    import ai.koog.agents.ext.agent.AIAgentStrategies;
    class examplePredefinedStrategiesJava04 {
        static class BankingTools implements ToolSet {
            @Tool
            @LLMDescription("날짜 범위에 대한 거래 내역 조회")
            public String getTransactions(
                @LLMDescription("시작 날짜") String startDate,
                @LLMDescription("종료 날짜") String endDate
            ) {
                return "[{amount: -100.00}, {amount: +1000.00}, {amount: -500.00}]";
            }
            @Tool
            @LLMDescription("금액 합계 계산")
            public String calculateSum(@LLMDescription("합산할 금액들") String amounts) {
                return "-800.00";
            }
        }
        public static void main(String[] args) {
    -->
    <!--- SUFFIX
        }
    }
    -->
    ```java
    // 에이전트가 사용할 수 있는 도구 추가
    ToolRegistry toolRegistry = ToolRegistry.builder()
        .tools(new BankingTools())
        .build();

    AIAgent<String, String> bankingAgent = AIAgent.<String, String>builder()
        .promptExecutor(PromptExecutor.builder().openAI("OPENAI_API_KEY").build())
        .llmModel(OpenAIModels.Chat.O4Mini)
        // reActStrategy를 에이전트 전략으로 사용
        .graphStrategy(AIAgentStrategies.reActStrategy(1, "banking_agent"))
        .toolRegistry(toolRegistry)
        .build();

    // 사용자 쿼리로 에이전트 실행
    String result = bankingAgent.run("지난달에 내가 얼마나 썼어?");
    ```
    <!--- KNIT examplePredefinedStrategiesJava03.java -->