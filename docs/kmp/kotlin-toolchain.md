[//]: # (title: 使用 Kotlin Toolchain 创建并发布 Kotlin Multiplatform 应用程序)

[Kotlin Toolchain](https://kotlin-toolchain.org/) 是 JetBrains 推出的一款用于构建、测试、运行和发布 Kotlin 项目的工具。
它提供了 CLI 和声明式配置，因此你可以在终端、IDE 或 AI 辅助开发工具中工作：
Kotlin Toolchain 允许你的编码 Agent（coding agent）只需极少设置和配置即可从新建项目一路推进到应用发布。

[Kotlin AI skills 官方仓库](https://github.com/Kotlin/kotlin-agent-skills/tree/main)包含了专门针对 Kotlin Toolchain 的 skills。

本页面将指导你使用 Kotlin Toolchain 从头开始搭建 Kotlin Multiplatform 项目。

你也可以直接向你的 Agent 提问：

```text
Create a new Kotlin Multiplatform app for Android, iOS, desktop, and web with the Kotlin Toolchain CLI (https://kotlin-toolchain.org/latest).
```

> Kotlin Toolchain 目前处于 [Alpha](supported-platforms.md#general-kotlin-stability-levels) 阶段。
> 欢迎在你的 Kotlin Multiplatform 项目中试用它。
> 期待你在 [YouTrack](https://youtrack.jetbrains.com/issues/KTC) 以及[专属 Slack 频道](https://kotlinlang.slack.com/archives/C062WG3A7T8)中提供反馈。
>
{style="note"}

## 前提条件 {id="prerequisites"}

### 安装 Kotlin Toolchain CLI {id="toolchain-script-install"}

你的 Agent 可以自行安装 Kotlin Toolchain，但你也可以使用安装脚本手动进行安装：

<Tabs>
<TabItem title="macOS 或 Linux">

```shell
curl -fsSL https://kotl.in/install.sh | sh
```

</TabItem>

<TabItem title="Windows">

```shell
powershell -ExecutionPolicy ByPass -c "irm 'https://kotl.in/install.ps1' | iex"
```

</TabItem>
</Tabs>

安装脚本会下载 Kotlin Toolchain CLI，将其放置在 `~/.local/bin` 中，并确保它已添加到你的 `PATH`。无需使用 `sudo` 命令。

运行 `kotlin --version` 检查 CLI 是否可用。

### 构建 iOS 应用 {id="building-ios-apps"}

借助 Kotlin Toolchain，你可以直接在 CLI 或 IDE 中处理绝大部分 iOS 开发工作流程，包括构建、运行和发布应用，无需打开 Xcode。

当需要 Xcode 时，Kotlin Toolchain 会提示安装它并说明如何进行配置。推荐的方式是从 [App Store](https://apps.apple.com/us/app/xcode/id497799835) 安装 Xcode。

安装 Xcode 是必要的，以便为 Kotlin Toolchain 提供用于 iOS 构建的 CLI 以及偶尔需要的特定项目工作流。

## 创建项目 {id="create-a-project"}

要使用 Kotlin Toolchain 生成新项目：

1. 导航到你希望 Kotlin Toolchain 创建项目的目录，例如 **Projects**。
2. 运行以下命令：

   ```shell
   kotlin new
   ```

3. 当提示输入项目路径时，输入目录名称，例如 `ktc-kmp`。
4. 在模板列表中，选择 **Kotlin Multiplatform application**。
5. 使用**空格**键选择或取消选择目标平台。按 **Enter** 键确认。

   > 即使你的最终应用只面向 Android 和 iOS，也建议考虑添加桌面目标。
   > 它可以实现更快的开发与迭代循环，并支持 [Compose Hot Reload](compose-hot-reload.md)，
   > 让你无需重启应用即可查看 UI 更改。
   >
   {style="tip"}

6. 输入项目 ID，或留空以根据目录名称生成默认 ID。

   该 ID 在整个项目中用于标识应用：包括 Kotlin 包名、Android 命名空间与 application ID，以及 iOS bundle ID。

7. 确认安装 AI Agent 配置：这将创建包含通用建议和 MCP 服务器配置的项目专用 AGENTS.md。
8. 使用**空格**键选择你偏好的 AI Agent。按 **Enter** 键确认。

Kotlin Toolchain 会生成项目，包括配置文件、源代码和包装器脚本。默认情况下，它还会初始化一个 Git 仓库。

生成的项目包含多个带有各平台应用程序入口点的 `*App` 模块，以及一个带有通用代码的 `shared` 模块。每个模块都会在全局 `project.yaml` 文件中列出，并通过其各自的 `module.yaml` 文件进行配置。每个应用程序模块都显式依赖于 `shared` 模块。例如，对于 Android 模块：

```yaml
# androidApp/module.yaml
product: android/app

dependencies:
  # Shared 模块依赖项
  - //shared
  # Android 专属依赖项
  - $libs.androidx.activity.compose
  - $compose.preview
  - $compose.uiTooling

settings:
  compose: enabled
  android:
    namespace: org.example.ktckmp
    applicationId: org.example.ktckmp
```

每个模块的基本结构遵循 [KMP 源集模型](multiplatform-discover-project.md#source-sets)，不同之处在于，例如不是 `androidMain`，而是 `src@android`。

## 运行项目 {id="run-the-project"}

要运行项目：

1. 导航到项目目录（上述示例中的 `ktc-kmp`）。
2. 运行 `kotlin run` 以调出可运行的应用程序列表。可用模块与你在生成项目时选择的目标平台相对应：

    ```shell
    $ kotlin run
    
    Multiple modules are available to run, please choose:
    ❯ desktopApp (with Hot Reload 🔥)
    androidApp
    iosApp    
    webApp
    ```

3. 你也可以使用 `-m`（`--module`）选项直接运行某个模块，例如：

    ```shell
    # 构建并运行桌面 JVM 应用
    kotlin run -m desktopApp
    ```

## 发布应用程序 {id="publish-the-applications"}

当你对应用的运行效果满意后，就可以发布应用程序了。

### 针对 iOS {id="for-ios"}

Kotlin Toolchain 可帮助你简化发布到 [TestFlight](https://developer.apple.com/testflight/) 的配置流程。要发布你的 iOS 应用，请运行：

```shell
kotlin publish testflight
```

该命令会启动一个带有详细说明的向导。它会引导你使用 [App Store Connect](https://appstoreconnect.apple.com/login) API 密钥配置发布流程，只需极少的手动操作。对于后续版本，使用同一命令即可自动进行发布。

有关手动设置和发布的说明，请参阅 [Kotlin Toolchain 文档](https://kotlin-toolchain.org/latest/user-guide/publishing/ios-application)。

### 针对 Android {id="for-android"}

要配置并发布你的 Android 应用，请按照 [Kotlin Toolchain 文档](https://kotlin-toolchain.org/latest/user-guide/publishing/android-application)中的说明进行操作。

### 其他目标平台 {id="other-target-platforms"}

你也可以打包 [JVM 应用](https://kotlin-toolchain.org/latest/user-guide/product-types/jvm-app/#packaging)或 [Wasm 应用](https://kotlin-toolchain.org/latest/user-guide/product-types/wasm-js-app/#packaging)，但尚未完全支持发布到这些平台。

## 在 IntelliJ IDEA 或 Android Studio 中开发项目 {id="work-on-a-project-in-intellij-idea-or-android-studio"}

你可以在 IntelliJ IDEA 或 Android Studio 中处理并运行该项目。

> 要在 Android Studio 中使用完整的 Kotlin Toolchain 功能，请使用[最新稳定版本](https://developer.android.com/studio/releases)，
> 至少为 Android Studio Rabbit。
>
{style="tip"}

安装 [Kotlin Multiplatform 插件](https://plugins.jetbrains.com/plugin/14936-kotlin-multiplatform)，即可为 Kotlin Multiplatform 项目添加 IDE 支持，同时支持 Kotlin Toolchain 的项目结构和运行配置。

### 直接在 IDE 中创建项目 {id="create-a-project-directly-in-the-ide"}

安装 Kotlin Multiplatform 和 Kotlin Toolchain 插件后，你还可以直接在 IDE 中创建新项目：

1. 打开 IntelliJ IDEA 或 Android Studio。
2. 选择 **File** | **New** | **Project**。
3. 选择 **Kotlin Multiplatform**，并在**构建系统**开关中选择 **Kotlin Toolchain**。
4. 填写其余的项目详细信息，然后点击 **Create**。

当项目创建并导入后，IDE 会自动为所有已声明的模块注册运行配置，以便你可以直接从 IDE 工具栏运行相应的应用程序。

## 后续步骤 {id="what-s-next"}

* 详细了解 Kotlin Toolchain 是什么及其作用，请参阅[产品常见问题解答](https://kotlin-toolchain.org/latest/faq/)。
* [从零开始的教程](https://kotlin-toolchain.org/latest/getting-started/tutorial/)演示了如何创建 Kotlin Toolchain "Hello, World!" 并逐步将其转换为具有复杂模板化配置的多平台项目。
* 要深入了解 Kotlin Toolchain，请参阅[用户指南](https://kotlin-toolchain.org/latest/user-guide/)。