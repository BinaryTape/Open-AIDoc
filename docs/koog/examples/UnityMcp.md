# Unity + Koog: 通过 Kotlin 代理驱动您的游戏

[:material-github: 在 GitHub 上打开](
https://github.com/JetBrains/koog/blob/develop/examples/notebooks/UnityMcp.ipynb
){ .md-button .md-button--primary }
[:material-download: 下载 .ipynb](
https://raw.githubusercontent.com/JetBrains/koog/develop/examples/notebooks/UnityMcp.ipynb
){ .md-button }

本笔记本将引导您使用模型上下文协议 (Model Context Protocol, MCP) 和 Koog 构建一个精通 Unity 的 AI 代理。我们将连接到 Unity MCP 服务器，发现工具，使用 LLM 进行规划，并针对您打开的场景执行操作。

> 前提条件
> - 一个安装了 Unity-MCP 服务器插件的 Unity 项目
> - JDK 17+
> - 在 `OPENAI_API_KEY` 环境变量中设置 OpenAI API 密钥

```kotlin
%useLatestDescriptors
%use koog

```

```kotlin
lateinit var process: Process

```

## 1) 提供您的 OpenAI API 密钥 {id="1-provide-your-openai-api-key"}
我们从 `OPENAI_API_KEY` 环境变量中读取 API 密钥，以便您可以将敏感信息保留在笔记本之外。

```kotlin
val token = System.getenv("OPENAI_API_KEY") ?: error("OPENAI_API_KEY environment variable not set")
val executor = simpleOpenAIExecutor(token)
```

## 2) 配置 Unity 代理 {id="2-configure-the-unity-agent"}
我们为 Unity 定义了一个简洁的系统提示词和代理设置。

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

## 3) 启动 Unity MCP 服务器 {id="3-start-the-unity-mcp-server"}
我们将从您的 Unity 项目目录启动 Unity MCP 服务器，并通过 stdio 进行连接。

```kotlin
// https://github.com/IvanMurzak/Unity-MCP
val pathToUnityProject = "path/to/unity/project"
val process = ProcessBuilder(
    "$pathToUnityProject/com.ivanmurzak.unity.mcp.server/bin~/Release/net9.0/com.IvanMurzak.Unity.MCP.Server",
    "60606"
).start()
```

## 4) 从 Koog 连接并运行代理 {id="4-connect-from-koog-and-run-the-agent"}
我们从 Unity MCP 服务器发现工具，构建一个简单的“规划优先”策略，并运行一个仅使用工具来修改打开场景的代理。

```kotlin
import kotlinx.coroutines.runBlocking

runBlocking {
    // 使用来自 MCP 服务器的工具创建 ToolRegistry
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
            // 处理规划
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

## 5) 关闭 MCP 进程 {id="5-shut-down-the-mcp-process"}
在运行结束时，请务必清理外部 Unity MCP 服务器进程。

```kotlin
// 关闭 Unity MCP 进程
process.destroy()
```
