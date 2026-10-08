# Unity + Koog: Kotlin 에이전트로 게임 제어하기

[:material-github: GitHub에서 열기](
https://github.com/JetBrains/koog/blob/develop/examples/notebooks/UnityMcp.ipynb
){ .md-button .md-button--primary }
[:material-download: .ipynb 다운로드](
https://raw.githubusercontent.com/JetBrains/koog/develop/examples/notebooks/UnityMcp.ipynb
){ .md-button }

이 노트북은 Model Context Protocol(MCP)을 사용하여 Koog로 Unity를 이해하는 AI 에이전트를 구축하는 과정을 안내합니다. Unity MCP 서버에 연결하고, 도구(tools)를 검색하고, LLM으로 계획을 세우고, 열려 있는 씬(scene)에 대해 액션을 실행해 보겠습니다.

> 사전 요구 사항
> - Unity-MCP 서버 플러그인이 설치된 Unity 프로젝트
> - JDK 17+
> - `OPENAI_API_KEY` 환경 변수에 설정된 OpenAI API 키

```kotlin
%useLatestDescriptors
%use koog

```

```kotlin
lateinit var process: Process

```

## 1) OpenAI API 키 제공 {id="1-provide-your-openai-api-key"}
노트북에 보안 정보를 노출하지 않도록 `OPENAI_API_KEY` 환경 변수에서 API 키를 읽어옵니다.

```kotlin
val token = System.getenv("OPENAI_API_KEY") ?: error("OPENAI_API_KEY environment variable not set")
val executor = simpleOpenAIExecutor(token)
```

## 2) Unity 에이전트 설정 {id="2-configure-the-unity-agent"}
Unity를 위한 간결한 시스템 프롬프트와 에이전트 설정을 정의합니다.

```kotlin
val agentConfig = AIAgentConfig(
    prompt = prompt("cook_agent_system_prompt") {
        system {
            "You are a Unity assistant. You can execute different tasks by interacting with tools from the Unity engine."
        }
    },
    model = OpenAIModels.Chat.GPT4o,
    maxAgentIterations = 1000
)
```

```kotlin

```

## 3) Unity MCP 서버 시작 {id="3-start-the-unity-mcp-server"}
Unity 프로젝트 디렉토리에서 Unity MCP 서버를 실행하고 stdio를 통해 연결합니다.

```kotlin
// https://github.com/IvanMurzak/Unity-MCP
val pathToUnityProject = "path/to/unity/project"
val process = ProcessBuilder(
    "$pathToUnityProject/com.ivanmurzak.unity.mcp.server/bin~/Release/net9.0/com.IvanMurzak.Unity.MCP.Server",
    "60606"
).start()
```

## 4) Koog에서 연결 및 에이전트 실행 {id="4-connect-from-koog-and-run-the-agent"}
Unity MCP 서버에서 도구들을 검색하고, 간단한 선 계획(plan-first) 전략을 구축한 뒤, 도구만을 사용하여 열려 있는 씬을 수정하는 에이전트를 실행합니다.

```kotlin
import kotlinx.coroutines.runBlocking

runBlocking {
    // MCP 서버의 도구들로 ToolRegistry 생성
    val toolRegistry = McpToolRegistryProvider.fromTransport(
        transport = McpToolRegistryProvider.defaultStdioTransport(process)
    )

    toolRegistry.tools.forEach {
        println(it.name)
        println(it.descriptor)
    }

    val strategy = strategy<String, String>("unity_interaction") {
        val nodePlanIngredients by nodeLLMRequest(allowToolCalls = false)
        val interactionWithUnity by subgraphWithTask<String, String>(
            // 계획에 따라 작업 수행
            tools = toolRegistry.tools,
        ) { input ->
            "Start interacting with Unity according to the plan: $input"
        }

        edge(
            nodeStart forwardTo nodePlanIngredients transformed {
                "Create detailed plan for " + agentInput + "" +
                    "using the following tools: ${toolRegistry.tools.joinToString("
") {\n                        it.name + "
description:" + it.descriptor\n                    }}"
            }
        )
        edge(nodePlanIngredients forwardTo interactionWithUnity onAssistantMessage { true })
        edge(interactionWithUnity forwardTo nodeFinish)
    }

    val agent = AIAgent(
        promptExecutor = executor,
        strategy = strategy,
        agentConfig = agentConfig,
        toolRegistry = toolRegistry,
        installFeatures = {
            install(Tracing)

            install(EventHandler) {
                onAgentStarting { eventContext ->
                    println("OnAgentStarting first (strategy: ${strategy.name})")
                }

                onAgentStarting { eventContext ->
                    println("OnAgentStarting second (strategy: ${strategy.name})")
                }

                onAgentCompleted { eventContext ->
                    println(
                        "OnAgentCompleted (agent id: ${eventContext.agent.id}, result: ${eventContext.result})"
                    )
                }
            }
        }
    )

    val result = agent.run(
        " extend current opened scene for the towerdefence game. " +
            "Add more placements for the towers, change the path for the enemies"
    )

    result
}
```

## 5) MCP 프로세스 종료 {id="5-shut-down-the-mcp-process"}
실행이 끝나면 항상 외부 Unity MCP 서버 프로세스를 정리해야 합니다.

```kotlin
// Unity MCP 프로세스 종료
process.destroy()
```
