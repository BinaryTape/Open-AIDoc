[//]: # (title: Compose Hot Reload)

Compose Hot Reload 可帮助你在开发 Compose Multiplatform 项目时直观呈现并尝试 UI 更改。
与适用于查看包含测试数据的独立组件的标准 [Compose 预览](compose-previews.md)不同，
Compose Hot Reload 会直接将代码更改应用到正在运行的应用程序中。

随附的 Compose Hot Reload Gradle 插件
需要 Kotlin 2.1.20+ 以及与 Java 21 或更早版本兼容的 JVM 目标。
要使用 Compose Hot Reload 的完整功能，
建议安装 [Kotlin Multiplatform IDE 插件](https://plugins.jetbrains.com/plugin/14936-kotlin-multiplatform)
（适用于 IntelliJ IDEA 2025.2.2 及更高版本以及 Android Studio Otter 2025.2.1 及更高版本）。

在我们探索增加对其他目标的支持的同时，你已经可以将桌面应用作为沙盒，
在不中断开发流程的情况下快速尝试公共代码中的 UI 更改。

<img src="KotlinConf-hot-reload.animated.gif" alt="Compose Hot Reload" width="600" preview-src="KotlinConf-hot-reload.png"/>

## 为项目添加 Compose Hot Reload {id="add-compose-hot-reload-to-your-project"}

可以通过以下两种方式添加 Compose Hot Reload：

* [在 IntelliJ IDEA 或 Android Studio 中从头创建项目](#从头创建)
* [为现有项目添加 Gradle 插件](#添加到现有项目)

### 从头创建 {id="from-scratch"}

本节将指导你在 IntelliJ IDEA 和
Android Studio 中创建包含桌面目标的多平台项目。项目创建完成后，将自动添加 Compose Hot Reload。

1. 按照[快速入门指南](quickstart.md)中的说明[设置用于 Kotlin Multiplatform 开发的环境](quickstart.md#set-up-the-environment)。
2. 在 IDE 中，选择 **File** | **New** | **Project**。
3. 在左侧面板中选择 **Kotlin Multiplatform**。
4. 在 **New Project** 窗口中指定 **Name**、**Group** 和 **Artifact** 字段。
5. 选择 **Desktop** 目标，然后点击 **Create**。
   ![创建包含桌面目标的多平台项目](create-desktop-project.png){width=600 style="block"}

### 添加到现有项目 {id="to-an-existing-project"}

从 Compose Multiplatform 1.10.0 开始，
Compose Hot Reload 插件已[内置](whats-new-compose-110.md#compose-hot-reload-integration)，
并对所有包含**桌面目标**的项目默认启用。

如果你的项目已包含桌面目标，
则可以升级到 Compose Multiplatform 1.10.0 或更高版本，开箱即用体验 Compose Hot Reload 功能。

虽然该插件默认已启用，
但你仍然可以显式声明 Compose Hot Reload 插件以使用特定的较旧版本。

#### 早期版本的 Compose Multiplatform {initial-collapse-state="collapsed" collapsible="true" id="earlier-versions-of-compose-multiplatform"}

对于使用 1.10.0 之前版本的 Compose Multiplatform 的多平台项目，
必须先配置桌面目标，然后显式添加 Compose Hot Reload 插件。
以下步骤以[快速入门指南](quickstart.md)教程中的项目作为参考。

1. 引入桌面目标：创建 `desktopApp` 目录，定义 `main()` 函数，
   并提供 `actual` 实现。
   如果你的项目已包含桌面目标，可以跳过此步骤。
   参考示例见[添加 JVM 入口点](migrate-from-android.md#optional-add-a-jvm-entry-point)。
 
2. 使用最新版本的 Compose Hot Reload 更新版本目录（参见 [Releases](https://github.com/JetBrains/compose-hot-reload/releases)）。
   在 `gradle/libs.versions.toml` 中添加以下代码：
   ```toml
   composeHotReload = { id = "org.jetbrains.compose.hot-reload", version.ref = "composeHotReload"}
   ```

   > 要详细了解如何使用版本目录集中管理整个项目的依赖项，请参阅我们的 [Gradle 最佳做法](https://kotlinlang.org/gradle-best-practices.html)。

3. 在父项目的 `build.gradle.kts`（`ComposeDemo/build.gradle.kts`）中，将以下代码添加到 `plugins {}` 代码块：
   ```kotlin
   plugins {
       alias(libs.plugins.composeHotReload) apply false
   }
   ```
   这可以防止 Compose Hot Reload 插件在各个子项目中被重复加载。

4. 在包含多平台应用程序的子项目的 `build.gradle.kts`（`ComposeDemo/sharedUI/build.gradle.kts`）中，将以下代码添加到 `plugins {}` 代码块：
   ```kotlin
   plugins { 
       alias(libs.plugins.composeHotReload)
   }
   ```

5. 你的项目必须在 [JetBrains Runtime](https://github.com/JetBrains/JetBrainsRuntime) (JBR) 上运行，这是支持增强类重定义的 OpenJDK 复刻版本。
   Compose Hot Reload 可以自动为你的项目配置兼容的 JBR。

   > 最新的 JetBrains Runtime 仅支持 Java 21：
   > 如果将 Compose Hot Reload 添加到仅兼容 Java 22 或更高版本的项目中，
   > 运行该项目将导致链接错误。
   > 
   {style="warning"}

   要允许自动配置，请将以下 Gradle 插件添加到 `settings.gradle.kts` 文件中：

   ```kotlin
   plugins {
       id("org.gradle.toolchains.foojay-resolver-convention") version "%foojayResolverConventionVersion%"
   }
   ```

6. 点击 **Sync Gradle Changes** 按钮同步 Gradle 文件：![同步 Gradle 文件](gradle-sync.png){width=50}

## 使用 Compose Hot Reload {id="use-compose-hot-reload"}

1. 在 `desktopApp` 源集中，打开 `main.kt` 文件并更新 `main()` 函数：
   ```kotlin
   fun main() = application {
       Window(
           onCloseRequest = ::exitApplication,
           alwaysOnTop = true,
           title = "composedemo",
       ) {
           App()
       }
   }
   ```
   通过将 `alwaysOnTop` 变量设置为 `true`，生成的桌面应用将始终保持在所有窗口的最顶层，从而更便于
   编辑代码并实时查看更改。

2. 打开 `App.kt` 文件并更新 `Button` 可组合项：
   ```kotlin
   Button(onClick = { showContent = !showContent }) {
       Column {
           Text(Greeting().greet())
       }
   }
   ```
   现在，按钮的文本由 `greet()` 函数控制。

3. 打开 `Greeting.kt` 文件并更新 `greet()` 函数：
   ```kotlin
    fun greet(): String {
        return "Hello!"
    }
   ```

4. 打开 `main.kt` 文件，然后点击装订区域中的 **Run** 图标。
   选择 **Run 'desktopApp' with Compose Hot Reload**。

   ![从装订区域运行 Compose Hot Reload](compose-hot-reload-gutter-run.png){width=350 border-effect="line"}

   ![桌面应用上的首次 Compose Hot Reload](compose-hot-reload-hello.png){width=500 border-effect="line"}

5. 更新 `greet()` 函数返回的字符串，然后保存所有文件（<shortcut>⌘ S</shortcut> / <shortcut>Ctrl+S</shortcut>），
   即可看到桌面应用自动更新。

   ![Compose Hot Reload](compose-hot-reload.animated.gif){width=500 preview-src="compose-hot-reload.png"}

   或者，也可以通过按下指定的快捷键或点击 **Reload UI** 按钮来显式触发重新加载。
   你可以在 **Settings | Tools | Compose Hot Reload** 页面中修改触发行为。

恭喜！你已经体验了 Compose Hot Reload 的实际运行。现在，你可以尝试更改文本、图像、格式设置、
UI 结构等内容，而无需在每次更改后都重新启动桌面运行配置。

## 面向 AI Agent 的 MCP 服务器 {id="mcp-server-for-ai-agents"}
<primary-label ref="Experimental"/>

从 Compose Multiplatform 1.12.0 开始，Compose Hot Reload 包含一个内置的
[Model Context Protocol (MCP)](https://modelcontextprotocol.io/) 服务器。
MCP 服务器允许 AI 编码 Agent 与正在运行的 Compose 应用程序进行交互：
触发 Compose Hot Reload、查看渲染的 UI、检查语义结构、模拟用户输入以及读取运行时日志。
对于具有多个窗口的应用程序，Agent 可以列出窗口并定位到其中的任意窗口。

这闭合了 AI Agent 编辑 Compose 代码时的反馈循环。
Agent 无需依赖你在每次编辑后手动检查结果，
而是可以自主迭代代码并验证每次更改。

### 连接 AI Agent {id="connect-an-ai-agent"}

要连接 AI Agent，请将 MCP 客户端配置为运行 `hotMcpServer` Gradle 任务。
例如，在 `.mcp.json` 中：

```json
{
  "mcpServers": {
    "compose-hot-reload": {
      "command": "./gradlew",
      "args": [
        "--no-daemon",
        "--quiet",
        "--console=plain",
        "hotMcpServer"
      ]
    }
  }
}
```

Gradle 会在所有子项目中搜索任务，并将短名称 `hotMcpServer` 匹配到特定目标变体
（例如 `hotMcpServerJvm` 或 `hotMcpServerDesktop`）。

如果你的模块定义了多个 JVM 目标，
请指定完全限定任务名称以避免歧义：`:<module>:hotMcpServer<Target>`，
例如 `:app:hotMcpServerDesktop` 或 `:composeApp:hotMcpServerJvm`。

### 可用的 MCP 工具 {id="available-mcp-tools"}

MCP 服务器公开了一系列 Agent 可以调用的工具，包括：

* `reload` — 重新编译项目并热重载已更改的类。
* `take_screenshot` — 截取应用程序窗口的当前状态。
* `get_semantic_tree` — 返回 Compose [语义树](compose-accessibility.md#semantic-properties)，
  以便 Agent 理解 UI 结构。
* `get_logs` — 返回正在运行的应用程序的近期日志输出，包括运行时异常。
* `click`、`type_text` 和 `scroll` — 模拟用户输入以测试交互流程。

有关 MCP 工具及其参数的完整列表，请参阅
[Compose Hot Reload README](https://github.com/JetBrains/compose-hot-reload#mcp-server-for-ai-agents)。

## 获取帮助 {id="get-help"}

如果你在使用 Compose Hot Reload 时遇到任何问题，请通过[创建 GitHub issue](https://github.com/JetBrains/compose-hot-reload/issues) 告知我们。