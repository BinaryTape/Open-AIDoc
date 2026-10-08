# Unity + Koog：從 Kotlin 代理驅動您的遊戲

[:material-github: Open on GitHub](
https://github.com/JetBrains/koog/blob/develop/examples/notebooks/UnityMcp.ipynb
){ .md-button .md-button--primary }
[:material-download: Download .ipynb](
https://raw.githubusercontent.com/JetBrains/koog/develop/examples/notebooks/UnityMcp.ipynb
){ .md-button }

本筆記本將引導您使用模型內容協定 (Model Context Protocol, MCP) 搭配 Koog 構建一個精通 Unity 的 AI 代理。我們將連線到 Unity MCP 伺服器、探索工具、使用大型語言模型 (LLM) 進行規劃，並對您開啟的場景執行操作。

> 前置需求
> - 已安裝 Unity-MCP 伺服器外掛程式的 Unity 專案
> - JDK 17+
> - 在 `OPENAI_API_KEY` 環境變數中設定 OpenAI API 金鑰

```kotlin
%useLatestDescriptors
%use koog

```

```kotlin
lateinit var process: Process

```

## 1) 提供您的 OpenAI API 金鑰 {id="1-provide-your-openai-api-key"}
我們從 `OPENAI_API_KEY` 環境變數讀取 API 金鑰，以便您可以讓機密資訊留在筆記本之外。

```kotlin
val token = System.getenv("OPENAI_API_KEY") ?: error("OPENAI_API_KEY environment variable not set")
val executor = simpleOpenAIExecutor(token)
```

## 2) 設定 Unity 代理 {id="2-configure-the-unity-agent"}
我們為 Unity 定義了一個簡潔的系統提示詞和代理設定。

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

## 3) 啟動 Unity MCP 伺服器 {id="3-start-the-unity-mcp-server"}
我們將從您的 Unity 專案目錄啟動 Unity MCP 伺服器，並透過 stdio 進行連線。

```kotlin
// https://github.com/IvanMurzak/Unity-MCP
val pathToUnityProject = "path/to/unity/project"
val process = ProcessBuilder(
    "$pathToUnityProject/com.ivanmurzak.unity.mcp.server/bin~/Release/net9.0/com.IvanMurzak.Unity.MCP.Server",
    "60606"
).start()
```

## 4) 從 Koog 連線並執行代理 {id="4-connect-from-koog-and-run-the-agent"}
我們從 Unity MCP 伺服器探索工具，建構一個簡單的「計畫優先」策略，並執行一個僅使用工具來修改您目前開啟場景的代理。

```kotlin
import kotlinx.coroutines.runBlocking

runBlocking {
    // 使用來自 MCP 伺服器的工具建立 ToolRegistry
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
            // 使用計畫進行工作
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

## 5) 關閉 MCP 程序 {id="5-shut-down-the-mcp-process"}
在執行結束時，請務必清理外部 Unity MCP 伺服器程序。

```kotlin
// 關閉 Unity MCP 程序
process.destroy()
```
