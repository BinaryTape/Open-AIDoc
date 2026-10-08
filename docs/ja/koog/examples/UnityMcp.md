# Unity + Koog: Kotlinエージェントによるゲーム操作

[:material-github: Open on GitHub](
https://github.com/JetBrains/koog/blob/develop/examples/notebooks/UnityMcp.ipynb
){ .md-button .md-button--primary }
[:material-download: Download .ipynb](
https://raw.githubusercontent.com/JetBrains/koog/develop/examples/notebooks/UnityMcp.ipynb
){ .md-button }

このノートブックでは、Model Context Protocol (MCP) を使用して、KoogでUnityに対応したAIエージェントを構築する手順を解説します。Unity MCPサーバーに接続し、ツールの検出、LLMによるプランニングを行い、開いているシーンに対してアクションを実行します。

> 前提条件
> - Unity-MCPサーバープラグインがインストールされたUnityプロジェクト
> - JDK 17以上
> - 環境変数 `OPENAI_API_KEY` に設定されたOpenAI APIキー

```kotlin
%useLatestDescriptors
%use koog

```

```kotlin
lateinit var process: Process

```

## 1) OpenAI APIキーの提供 {id="1-provide-your-openai-api-key"}
シークレットをノートブックに含めないようにするため、`OPENAI_API_KEY` 環境変数からAPIキーを読み取ります。

```kotlin
val token = System.getenv("OPENAI_API_KEY") ?: error("OPENAI_API_KEY environment variable not set")
val executor = simpleOpenAIExecutor(token)
```

## 2) Unityエージェントの設定 {id="2-configure-the-unity-agent"}
Unity用のコンパクトなシステムプロンプトとエージェント設定を定義します。

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

## 3) Unity MCPサーバーの起動 {id="3-start-the-unity-mcp-server"}
UnityプロジェクトのディレクトリからUnity MCPサーバーを起動し、標準入出力（stdio）経由で接続します。

```kotlin
// https://github.com/IvanMurzak/Unity-MCP
val pathToUnityProject = "path/to/unity/project"
val process = ProcessBuilder(
    "$pathToUnityProject/com.ivanmurzak.unity.mcp.server/bin~/Release/net9.0/com.IvanMurzak.Unity.MCP.Server",
    "60606"
).start()
```

## 4) Koogからの接続とエージェントの実行 {id="4-connect-from-koog-and-run-the-agent"}
Unity MCPサーバーからツールを検出し、小規模な「プラン優先（plan-first）」戦略を構築し、ツールのみを使用して開いているシーンを変更するエージェントを実行します。

```kotlin
import kotlinx.coroutines.runBlocking

runBlocking {
    // MCPサーバーからのツールを使用してToolRegistryを作成
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
            // プランに基づいて動作
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

## 5) MCPプロセスの終了 {id="5-shut-down-the-mcp-process"}
実行の最後には、必ず外部のUnity MCPサーバープロセスをクリーンアップしてください。

```kotlin
// Unity MCPプロセスを終了
process.destroy()
```
