[//]: # (title: 使用 Kotlin Toolchain 创建并构建 Kotlin Multiplatform 应用程序)

[Kotlin Toolchain](https://kotlin-toolchain.org/) 是 JetBrains 推出的一款用于创建、构建、测试和运行 Kotlin 项目的工具。
它提供了命令行工具 (CLI) 和声明式配置，因此你可以在终端、IDE 中工作，或借助 AI 辅助开发工具展开开发。

本页将指导你使用 Kotlin Toolchain 从零开始搭建 Kotlin Multiplatform 项目。

> Kotlin Toolchain 目前处于 [Alpha](supported-platforms.md#general-kotlin-stability-levels) 阶段。
> 欢迎在你的 Kotlin Multiplatform 项目中试用。
> 非常感谢你在 [YouTrack](https://youtrack.jetbrains.com/issues/KTC) 和[专用 Slack 频道](https://kotlinlang.slack.com/archives/C062WG3A7T8)中向我们提供反馈。
>
{style="note"}

## 先决条件 {id="prerequisites"}

### 安装 Kotlin Toolchain CLI {id="toolchain-script-install"}

你可以使用 [SDKMAN!](https://sdkman.io/) 安装 Kotlin Toolchain CLI：

```shell
sdk install kotlintoolchain
```

或者通过安装脚本安装：

<Tabs>
<TabItem title="macOS or Linux">

```shell
curl -fsSL https://kotl.in/install.sh | sh

# 重启终端或运行此命令
# 使 'kotlin' 可用
exec $SHELL
```

</TabItem>

<TabItem title="Windows">

```shell
powershell -ExecutionPolicy ByPass -c "irm 'https://kotl.in/install.ps1' | iex"
```

</TabItem>
</Tabs>

运行 `kotlin --version` 检查 CLI 是否可用。

### 构建 iOS 应用 {id="building-ios-apps"}

要构建并运行 iOS 应用程序，请安装 [Xcode](https://apps.apple.com/us/app/xcode/id497799835) 及所需的 SDK。

当实际需要构建或运行模块时，Kotlin Toolchain CLI 会显示有关如何配置 Xcode 的说明。

## 创建项目 {id="create-a-project"}

要使用 Kotlin Toolchain 生成新项目：

1. 转到你希望创建项目目录的位置。
2. 运行以下命令：

   ```shell
   kotlin new
   ```

3. 当提示输入项目路径时，输入目录名称，例如 `ktc-kmp`。
4. 在呈现的模板选项中选择 **Compose Multiplatform application**。
5. 按 **Enter** 键确认默认选中的目标。
6. 提供一个将在整个项目中用于标识应用的 project ID（默认会根据目录名称生成）。
   该 ID 将用于 Kotlin 包名、Android 命名空间和 application ID，以及 iOS bundle ID。

Kotlin Toolchain 会生成项目，包括配置文件、源代码和包装器脚本。
默认情况下，它还会初始化一个 Git 仓库。

生成的项目包含几个带有各平台应用程序入口点的 `*App` 模块，以及一个包含公共代码的 `shared` 模块。
每个模块都在全局 `project.yaml` 文件中列出，并通过各自的 `module.yaml` 文件进行配置。
每个应用程序模块都显式依赖 shared 模块，例如：

```yaml
# androidApp/module.yaml
product: android/app

dependencies:
  # Shared 模块依赖
  - //shared
  # Android 专属依赖
  - $libs.androidx.activity.compose

settings:
  compose: enabled
  android:
    namespace: org.example.toolchainfirst
    applicationId: org.example.toolchainfirst
```

每个模块的基本结构都遵循 [KMP 源集模型](multiplatform-discover-project.md#source-sets)，只是将例如 `androidMain` 替换成了 `src@android`。

## 运行项目 {id="run-the-project"}

要运行项目：

1. 转到项目目录（在上述示例中为 `ktc-kmp`）。
2. 运行 `kotlin run` 调出可运行的应用程序列表。
   可用的模块对应于你在生成项目时选择的目标：

    ```shell
    $ kotlin run
    
    Multiple modules are available to run, please choose:
    ❯ desktopApp (with Hot Reload 🔥)
    androidApp
    iosApp    
    webApp
    ```

3. 你还可以通过使用 `-m`（`--module`）选项直接运行特定模块，例如：

    ```shell
    # 构建并运行桌面 JVM 应用
    kotlin run -m desktopApp
    ```

## 在 IntelliJ IDEA 或 Android Studio 中开发项目 {id="work-on-a-project-in-intellij-idea-or-android-studio"}

你可以在 IntelliJ IDEA 或 Android Studio 中开发并运行该项目。
为了在 Android Studio 上获得完整的 Kotlin Toolchain 功能体验，请使用最新的稳定版本 [Android Studio Rabbit](https://developer.android.com/studio/releases)。

安装以下插件，使你的 IDE 能够识别 Kotlin Toolchain 和 Kotlin Multiplatform 项目：

* [Kotlin Multiplatform 插件](https://plugins.jetbrains.com/plugin/14936-kotlin-multiplatform)是正确支持 KMP 项目所必需的。
* [Kotlin Toolchain 插件](https://plugins.jetbrains.com/plugin/31850-kotlin-toolchain)可帮助 IDE 识别 Kotlin Toolchain 项目结构、生成运行配置等。

### 直接在 IDE 中创建项目 {id="create-a-project-directly-in-the-ide"}

安装 Kotlin Multiplatform 和 Kotlin Toolchain 插件后，你也可以直接在 IDE 中创建新项目：

1. 打开 IntelliJ IDEA 或 Android Studio。
2. 选择 **File** | **New** | **Project**。
3. 选择 **Kotlin Multiplatform**，并在 **Build system** 选项中选择 **Kotlin Toolchain**。
4. 填写其余的项目详细信息，然后点击 **Create**。

当项目创建并导入后，IDE 会自动为所有声明的模块注册运行配置，以便你可以直接从 IDE 工具栏运行相应的应用程序。

## 发布应用程序 {id="publish-the-applications"}

当你对应用的运行效果感到满意后，即可发布这些应用程序。

有关生成工件的完整说明，请参阅 Kotlin Toolchain 文档：

* [发布 Android 应用](https://kotlin-toolchain.org/latest/user-guide/product-types/android-app/#publishing)
* [发布 iOS 应用](https://kotlin-toolchain.org/latest/user-guide/product-types/ios-app/#publishing)

你也可以打包 JVM 应用或 Wasm 应用，但目前尚未完全支持针对这些目标的发布。

## 后续步骤 {id="what-s-next"}

* 想要详细了解什么是 Kotlin Toolchain 以及它的作用，请查看[产品常见问题解答](https://kotlin-toolchain.org/dev/faq/)。
* [从零开始的教程](https://kotlin-toolchain.org/dev/getting-started/tutorial/)演示了如何创建 Kotlin Toolchain 的“Hello, World!”并逐步将其转换为具有复杂模板化配置的多平台项目。
* 要深入了解 Kotlin Toolchain，请参阅[用户指南](https://kotlin-toolchain.org/latest/user-guide/)。