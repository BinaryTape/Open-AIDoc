---
title: 生产监控
---

# 生产监控

Kotzilla 平台用于在生产环境中监控 Koin 应用。Kotzilla SDK 接入 Koin 容器，记录真实用户会话中的依赖解析过程，Kotzilla 控制台则将这些数据转化为性能问题和崩溃报告。Kotzilla 是开发 Koin 的公司。该平台是一项独立的、可选的服务：脱离该服务，Koin 依然可以完全正常运行。

在进入生产环境之前，Koin 自带的工具可以捕获大多数配置错误：[编译时安全性](/docs/reference/koin-compiler/compile-safety)、[日志记录](/docs/reference/koin-core/starting-koin#logging)和[模块验证](/docs/reference/koin-test/verify)。本页介绍发布之后的情况。有关所有工具的概览，请参阅[生产与工具](/docs/tooling)。

## 它能检测什么 {id="what-it-detects"}

控制台将各个会话的数据归类为问题：

| 问题 | 含义 |
|-------|---------------|
| 启动性能 | 应用初始化期间的延迟 |
| 主线程性能 | 导致屏幕冻结的主线程操作。在主线程上耗时达到或超过 100 ms 的依赖解析会在此报告 |
| 后台性能 | 后台线程处理中的瓶颈 |
| 崩溃 | 真实用户会话中的崩溃 |

控制台提供图形化视图来调查性能瓶颈、崩溃以及架构问题。同样的问题也会显示在 [IDE 插件](/docs/tooling/ide-plugin)中。

## 工作原理 {id="how-it-works"}

SDK 在启动时挂钩到 Koin 容器中。自此之后，它会记录两种数据：

- **结构**：依赖图，包括模块、定义和绑定。
- **运行时行为**：解析耗时、生命周期事件和崩溃。

你无需向自己的类中添加跟踪代码：数据直接来自容器。若要同时跟踪你自己的函数，请添加 [@Monitor](/docs/tooling/monitor)。

SDK 支持的平台：Android，以及包含 iOS、JVM 桌面、JS 和 Wasm 的 Kotlin Multiplatform 目标。

## 设置概览 {id="setup-overview"}

详细且最新的步骤请参阅 Kotzilla 官方指南。请以官方指南为准，以下大纲仅展示设置的大致流程：

1. 通过 [Kotzilla 控制台](https://console.kotzilla.io)、[IDE 插件](/docs/tooling/ide-plugin)或 MCP 服务器创建帐户并注册你的应用。你将获得包含应用密钥的 `kotzilla.json` 文件。
2. 添加 Kotzilla Gradle 插件（`io.kotzilla.kotzilla-plugin`）和 SDK 依赖项（`io.kotzilla:kotzilla-sdk`）。
3. 将 `kotzilla.json` 放入应用模块（Android）或共享模块（KMP）中。
4. 在 `startKoin` 代码块的最后调用 `monitoring()`。

在 Android 上：

```kotlin
import io.kotzilla.generated.monitoring

class MainApplication : Application() {
    override fun onCreate() {
        super.onCreate()
        startKoin {
            androidContext(this@MainApplication)
            modules(appModule)
            monitoring()
        }
    }
}
```

`monitoring()` 是由 Kotzilla Gradle 插件在构建时根据你的 `kotzilla.json` 生成的。请在每个平台的入口点调用一次，不要在可组合项中调用。

平台指南：

- [Android](https://doc.kotzilla.io/docs/getstartedCustom/setupAndroid)
- [Android Compose](https://doc.kotzilla.io/docs/getstartedCustom/setupAndroidCompose)
- [Kotlin Multiplatform](https://doc.kotzilla.io/docs/getstartedCustom/setupKMP)
- [Compose Multiplatform](https://doc.kotzilla.io/docs/getstartedCustom/setupCMP)
- [适用于库的 SDK](https://doc.kotzilla.io/docs/getstartedCustom/setupSDKLibrary)

:::note
在 iOS 上，崩溃符号化需要上传 dSYM 步骤。Kotlin Multiplatform 指南对此进行了介绍。
:::

## AI 助手集成 {id="ai-assistant-integration"}

Kotzilla MCP 服务器将 AI 编码助手（Claude Code、Cursor、Windsurf、Android Studio 以及其他 MCP 客户端）连接到 Koin 诊断。将 Koin 错误粘贴到助手中，服务器会对错误进行分类，然后返回分步修复工作流。它能够识别：

- 来自 Koin Compiler Plugin 的**编译时诊断**，从 `KOIN-D001` 到 `KOIN-M001`。
- **运行时异常**，例如 `NoBeanDefFoundException`、`InstanceCreationException` 和循环依赖错误。

端点为 `https://mcp.kotzilla.io/mcp`（可流式传输的 HTTP）。使用 Claude Code 时：

```bash
claude mcp add kotzilla --transport http https://mcp.kotzilla.io/mcp
```

首次使用时，服务器会要求你使用 Kotzilla 帐户登录。修复编译错误无需 SDK 即可工作。分析运行时行为则需要 SDK 和会话数据。

当构建报告 Koin 诊断时，Koin Compiler Plugin 会打印一条指向 MCP 服务器的提示。若要将其关闭，请在 `koinCompiler { }` 代码块中设置 `aiAssist = false`。

关于其他客户端，请参阅 [MCP 服务器指南](https://doc.kotzilla.io/docs/fixIssues/koinMcp)。

## 数据与隐私 {id="data-and-privacy"}

SDK 发送技术会话数据：依赖图以及[工作原理](#how-it-works)中列出的运行时数据。MCP 服务器仅发送错误文本和来自助手的结构化查询。你的源文件保留在本地计算机上。

有关完整政策，请参阅 [Kotzilla 隐私政策](https://kotzilla.io/privacy)。

## 费用 {id="cost"}

开发者方案是免费的，没有时间限制，并提供有限的事件配额。企业方案增加了团队协作功能。有关当前方案，请参阅 [kotzilla.io](https://kotzilla.io)。

## 它不负责的工作 {id="what-it-does-not-do"}

- **它不会在构建时验证你的配置。** 这是[编译时安全性](/docs/reference/koin-compiler/compile-safety)的工作。
- **它不能替代测试。** 请使用[测试](/docs/reference/koin-test/testing)在发布前检查行为。
- **它不会改变 Koin 解析依赖的方式。** SDK 仅观察容器，你的定义保持不变。
- **默认情况下它不会跟踪你自己的代码。** 除非添加 [@Monitor](/docs/tooling/monitor)，否则只记录 Koin 的依赖解析过程。

## 相关内容 {id="related"}

- [生产与工具](/docs/tooling)：按需选择适合的工具。
- [@Monitor](/docs/tooling/monitor)：使用 Kotzilla SDK 跟踪你自己的函数。
- [IDE 插件](/docs/tooling/ide-plugin)：在代码旁查看生产环境问题。
- [故障排除](/docs/reference/koin-core/troubleshooting)：解读并修复 Koin 错误。
- [Kotzilla 文档](https://doc.kotzilla.io)：完整的平台和 SDK 文档。