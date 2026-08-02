---
status: beta
---

# Amazon Bedrock AgentCore

--8<-- "versioning-snippets.md:beta"

Koog 提供了与 Amazon Bedrock AgentCore 服务运行 agent 的集成。

## Amazon Bedrock AgentCore Runtime

`koog-bedrock-agentcore-runtime` 模块提供了一个 Ktor 路由安装程序，通过 [Amazon Bedrock AgentCore Runtime](https://docs.aws.amazon.com/bedrock-agentcore/latest/devguide/runtime.html) HTTP 契约公开 Koog agent。它会安装相对于其配置的 Ktor 路由的以下端点：

- `POST /invocations` 处理 agent 请求。
- `GET /ping` 报告 agent 健康状况和后台活动。

该模块支持类型化 JSON 处理程序，以及文本、二进制、多部分 (multipart) 和流式有效负载。调用处理程序在 Ktor `RoutingContext` 中运行，因此当安装了 `koog-ktor` 插件时，它们可以使用 Koog 路由扩展（例如 `aiAgent()`）。

### 添加依赖项

将 AgentCore Runtime 模块添加到您的 Gradle 构建中：

```kotlin
dependencies {
    implementation("ai.koog:koog-bedrock-agentcore-runtime:$koogVersion")
}
```

该模块需要 JVM 17 或更高版本、Kotlin 2.x 以及 Ktor 3.x。

### 安装 Runtime 路由

以下示例安装了 Koog 和 Ktor 内容协商，然后公开了一个类型化 JSON 调用处理程序：

```kotlin
import ai.koog.agentcore.runtime.agentCoreRuntime
import ai.koog.agentcore.runtime.handle
import ai.koog.ktor.Koog
import ai.koog.ktor.aiAgent
import ai.koog.ktor.llm
import ai.koog.prompt.executor.clients.bedrock.BedrockModels
import io.ktor.serialization.kotlinx.json.json
import io.ktor.server.application.Application
import io.ktor.server.application.install
import io.ktor.server.plugins.contentnegotiation.ContentNegotiation
import io.ktor.server.routing.routing
import kotlinx.serialization.Serializable

@Serializable
data class InvocationRequest(val prompt: String)

@Serializable
data class InvocationResponse(val answer: String)

fun Application.module() {
    install(ContentNegotiation) {
        json()
    }

    install(Koog) {
        llm {
            bedrock()
        }
    }

    routing {
        agentCoreRuntime {
            handle<InvocationRequest, InvocationResponse> { request, context ->
                val sessionId = context.getHeader("X-Amzn-Bedrock-AgentCore-Runtime-Session-Id")
                val answer = aiAgent(
                    input = request.prompt,
                    model = BedrockModels.AmazonNovaMicro,
                )
                InvocationResponse(answer)
            }
        }
    }
}
```

类型化处理程序将请求反序列化和响应序列化委托给 Ktor 的 `ContentNegotiation` 插件。宿主应用程序必须为其接受的媒体类型安装转换器，例如用于 JSON 请求和响应的 `json()`。服务器引擎、端口和其他应用程序插件也仍由宿主应用程序控制。

### 处理不同的有效负载类型

对于非 JSON 有效负载或多模态响应，请配置统一的 `handler`。它接收 `InvocationInput` 和 `AgentCoreContext`，并返回 `InvocationResult`：

```kotlin
routing {
    agentCoreRuntime {
        handler = { input, context ->
            when (input) {
                is InvocationInput.Text -> InvocationResult.Text(
                    aiAgent(input.body, model = BedrockModels.AmazonNovaMicro)
                )
                is InvocationInput.Binary -> InvocationResult.Binary(input.bytes, input.contentType)
                is InvocationInput.Stream -> InvocationResult.Text("Received a streamed request")
                is InvocationInput.Multipart -> InvocationResult.Text("Received multipart data")
            }
        }
    }
}
```

统一处理程序支持：

- `InvocationResult.Text` 用于基于 `Accept` 内容协商的一次性文本输出。
- `InvocationResult.Binary` 用于带有显式内容类型的原始图像、音频、视频或文档字节。
- `InvocationResult.TextStream` 用于作为立即刷新的 `text/event-stream` 事件发送的 `Flow<String>`。
- `InvocationResult.BinaryStream` 用于具有调用者选择的内容类型的原始流式分块。

流式响应是直接写入的，不需要 Ktor 的 `SSE` 插件。

### 配置请求处理

`AgentCoreRuntimeConfig` 提供以下选项：

| 选项 | 描述 | 默认值 |
|---|---|---|
| `handler` | 除非注册了类型化 `handle<I, O>` 处理程序，否则使用的统一处理程序。 | 未设置 |
| `binaryStreamThresholdBytes` | 超过此大小或没有 `Content-Length` 的二进制主体将作为 `InvocationInput.Stream` 公开。 | 1 MiB |
| `maxRequestBytes` | 拒绝声明的 `Content-Length` 超过限制的请求，返回 HTTP 413。 | 100 MiB |
| `handlerTimeoutMillis` | 当处理程序超过此超时时间时返回 HTTP 504。非正值将禁用超时。 | `0` |
| `pingService` | 用于 `/ping` 端点的自定义健康服务。 | 任务感知型默认服务 |
| `taskTracker` | 通过 `AgentCoreContext` 公开并由默认健康服务使用的跟踪器。 | 新的 `AgentCoreTaskTracker` |

不带 `Content-Length` 标头的请求不会针对 `maxRequestBytes` 进行预检查；底层服务器引擎的限制仍然适用。

### 监控健康状况和后台任务

`/ping` 端点返回：

- 当 agent 没有活动的后台任务时，返回 `Healthy` 和 HTTP 200。
- 当 `AgentCoreTaskTracker` 报告有活动工作时，返回 `HealthyBusy` 和 HTTP 200。
- 当健康检查检测到问题时，返回 `Unhealthy` 和 HTTP 503。

在开始运行时间较长的后台工作时，请使用 `AgentCoreContext` 中提供的跟踪器。这可以让 Runtime 获知 agent 仍处于活跃状态。您可以通过为 `pingService` 分配自定义 `AgentCorePingService` 来替换默认行为。

速率限制也由宿主应用程序控制。全局安装 Ktor 的 `RateLimit` 插件，或将 `agentCoreRuntime` 路由包装在命名的 `rateLimit` 块中，以应用所需的策略。

## Amazon Bedrock AgentCore Memory

Koog 通过两种方式与 [Amazon Bedrock AgentCore Memory](https://docs.aws.amazon.com/bedrock-agentcore/latest/devguide/memory.html) 集成：

- `agents-features-chat-history-aws` 模块将对话历史记录作为 AgentCore 事件持久化。
- `agents-features-longterm-memory-aws` 模块检索由 AgentCore 记忆策略生成的记录，并将其添加到 agent 提示词中。

这两种集成都需要 JVM 17 或更高版本以及 AgentCore 记忆资源。通过标准的 AWS SDK 凭据和区域提供者链配置 AWS 凭据和区域。

### 添加依赖项

将一个或两个 Memory 集成模块添加到您的 Gradle 构建中：

```kotlin
dependencies {
    implementation("ai.koog:agents-features-chat-history-aws:$koogVersion")
    implementation("ai.koog:agents-features-longterm-memory-aws:$koogVersion")
}
```

这两个模块都公开了其公共 API 使用的 AWS SDK for Kotlin `BedrockAgentCoreClient`。长期记忆还公开了用于记忆策略发现的 `BedrockAgentCoreControlClient`。

### 持久化对话历史记录

`AgentcoreChatHistoryProvider` 通过 AgentCore `createEvent` 和 `listEvents` API 实现了 Koog 的 `ChatHistoryProvider`。通过 `ChatMemory` 功能安装它：

```kotlin
import ai.koog.agents.chatMemory.feature.ChatMemory
import ai.koog.agents.core.agent.AIAgent
import ai.koog.agents.features.chathistory.aws.AgentcoreChatHistoryProvider
import aws.sdk.kotlin.services.bedrockagentcore.BedrockAgentCoreClient

val agentCoreClient = BedrockAgentCoreClient { region = "us-west-2" }
val chatHistoryProvider = AgentcoreChatHistoryProvider(
    client = agentCoreClient,
    memoryId = "memory-id",
)

val agent = AIAgent(/* ... */) {
    install(ChatMemory) {
        chatHistoryProvider = chatHistoryProvider
    }
}

val result = agent.run(
    agentInput = "Remember that I prefer window seats.",
    conversationId = "user-123:trip-456",
)
```

会话 ID 可以是 `actorId:sessionId` 或仅为 `actorId`。当省略会话部分时，提供者将使用 `default-session`，除非您在其构造函数中设置了 `defaultSession`。

提供者存储纯文本 `Message.User` 和 `Message.Assistant` 消息。从 AgentCore 加载的消息在其元数据中携带事件 ID，从而允许提供者在再次保存完整历史记录时仅存储新消息。系统、工具、推理和非文本内容默认会被跳过；将 `ignoreUnsupportedValues = false` 设置为拒绝此类内容。使用 `pageSize` 控制 `listEvents` 分页，使用 `totalEventsLimit` 限制加载事件的数量。

### 检索长期记忆

`LongTermMemory` 可以在每次 LLM 请求之前查询一个或多个 AgentCore 记忆策略。`agentcore` DSL 创建一个复合检索，因此单个代码块可以组合多种策略类型和命名空间作用域：

```kotlin
import ai.koog.agents.features.longtermmemory.aws.dsl.agentcore
import ai.koog.agents.longtermmemory.feature.LongTermMemory

val agent = AIAgent(/* ... */) {
    install(LongTermMemory) {
        retrieval {
            agentcore(agentCoreClient, memoryId = "memory-id") {
                semantic(
                    strategyId = "semantic-strategy-id",
                    actorId = "user-123",
                    topK = 5,
                )
                userPreferences(
                    strategyId = "preference-strategy-id",
                    actorId = "user-123",
                    limit = 20,
                )
                summary(
                    strategyId = "summary-strategy-id",
                    actorId = "user-123",
                    sessionId = "trip-456",
                    topK = 3,
                )
            }
        }
    }
}
```

该 DSL 提供以下辅助方法：

| 辅助方法 | AgentCore 策略 | 命名空间作用域 | 检索 |
|---|---|---|---|
| `semantic` | 语义记忆 | Actor | 相似性搜索 |
| `userPreferences` | 用户偏好 | Actor | 记录列表 |
| `summary` | 摘要 | Actor 和会话 | 相似性搜索 |
| `episodes` | 片段式回放 (Episodic episodes) | Actor 和会话 | 相似性搜索 |
| `reflections` | 片段式反思 (Episodic reflections) | Actor | 相似性搜索 |
| `episodic` | 片段和反思 | 两个作用域 | 复合相似性搜索 |

默认情况下，命名空间遵循 AWS 文档化的布局：
对于 actor 作用域记忆为 `/strategies/{strategyId}/actors/{actorId}/`，对于会话作用域记忆为 `/strategies/{strategyId}/actors/{actorId}/sessions/{sessionId}/`。如果记忆资源使用自定义命名空间模板，请在 `agentcore` 块中分配 `AgentcoreNamespaceResolver`。

默认的 `AgentcorePromptAugmenter` 将语义、偏好、片段 (episode) 和反思 (reflection) 记录放置在系统消息中。摘要记录会附加到最新的用户消息中。在块中设置 `augmenter` 以使用另一个 Koog `PromptAugmenter`。

### 发现配置的记忆策略

当不应硬编码策略 ID 或命名空间模板时，请将 `AgentcoreStrategyDiscovery` 与 AWS `BedrockAgentCoreControlClient` 配合使用，然后将其结果传递给 `agentcoreDiscovered`。发现 DSL 会配置为记忆资源返回的所有支持的策略，并允许您覆盖检索限制、分数、过滤器和命名空间模式，或排除单个策略。当发现的集合包含摘要或片段式策略时，需要 `sessionId`。

AgentCore 会根据存储的事件异步创建长期记录。因此，由 `ChatMemory` 写入的事件可能无法立即供 `LongTermMemory` 使用。