[//]: # (title: Kotlin Multiplatform 快速入门)

<web-summary>JetBrains 为 IntelliJ IDEA 和 Android Studio 提供官方 Kotlin IDE 支持。</web-summary>

<secondary-label ref="IntelliJ IDEA"/>
<secondary-label ref="Android Studio"/>

在本教程中，你将学习如何构建并运行一个带有 Compose Multiplatform UI 的简单 Kotlin Multiplatform 应用。

## 选择构建工具 {id="choose-a-build-tool"}

本快速入门指南使用 Gradle 在 IDE 中创建并运行一个新的 Kotlin Multiplatform 项目。
Gradle 既支持新项目，也支持已在使用它的项目。
本快速入门适用于希望将 Kotlin Multiplatform 引入其项目，或只是想使用熟悉环境的 Gradle 用户。

对于全新项目，你也可以尝试 Kotlin Toolchain，这是 JetBrains 专为 Kotlin Multiplatform 打造的工具。
它提供 CLI 和透明的配置格式，非常适合 AI 工作流。

<Links href="/kmp/kotlin-toolchain" summary="undefined">使用 Kotlin Toolchain 开始使用 KMP</Links>

## 配置环境 {id="set-up-the-environment"}

配置 IntelliJ IDEA 或 Android Studio、`ANDROID_HOME` 变量以及 Xcode：

1. 选择并安装 IDE：IntelliJ IDEA 和 Android Studio 全面支持 KMP。
    
    建议使用 [JetBrains Toolbox app](https://www.jetbrains.com/toolbox/app/) 安装 IDE。
    如需独立安装，请下载 [IntelliJ IDEA](https://www.jetbrains.com/idea/download/) 
    或 [Android Studio](https://developer.android.com/studio) 的安装程序。

    为获得最佳效果，请使用最新的稳定版本。

2. 安装 Kotlin Multiplatform IDE 插件。
   你可以在插件市场（**Settings | Plugins | Marketplace**）中找到它，
   也可以从[插件网页](https://plugins.jetbrains.com/plugin/14936-kotlin-multiplatform)进行安装。
    
3. 如果尚未设置 `ANDROID_HOME` 环境变量，请配置系统使其识别该变量：

    <Tabs>
    <TabItem title= "Bash or Zsh">
   
    将以下命令添加到你的 `.profile` 或 `.zprofile` 中：
        
    ```shell
    export ANDROID_HOME=~/Library/Android/sdk
    ```
   
    </TabItem>
    <TabItem title= "Windows PowerShell or CMD">

    对于 PowerShell，你可以使用以下命令添加持久环境变量
    （详情请参阅 [PowerShell 文档](https://learn.microsoft.com/en-us/powershell/module/microsoft.powershell.core/about/about_environment_variables)）：

    ```shell
    [Environment]::SetEnvironmentVariable('ANDROID_HOME', '<path to the SDK>', 'Machine')
    ```

    对于 CMD，请使用 [`setx`](https://learn.microsoft.com/en-us/windows-server/administration/windows-commands/setx) 命令：
    
    ```shell
    setx ANDROID_HOME "<path to the SDK>"
    ```
    </TabItem>
    </Tabs>

4. 要创建 iOS 应用程序，你需要一台安装了 [Xcode](https://apps.apple.com/us/app/xcode/id497799835) 的 macOS 计算机。
    IDE 会在后台运行 Xcode 来构建 iOS 框架。

    在开始处理 KMP 项目之前，请确保至少启动过一次 Xcode，以便它完成初始设置。

    > 每次更新 Xcode 时，你都必须手动启动它并下载更新的工具集。
    > Kotlin Multiplatform IDE 插件会执行预检并在 Xcode 配置不正确时向你发出提醒。
    >
    {style="note"}

## 创建项目 {id="create-a-project"}

<Tabs>
<TabItem title= "IntelliJ IDEA">

使用 Kotlin Multiplatform 生成器创建项目：

1. 在主菜单中选择 **File** | **New** | **Project**。
2. 在左侧列表中选择 **Kotlin Multiplatform**。
   根据需要设置 **Name** 和 **Location**。
   **Project ID** 会根据名称自动生成。
3. 本页的其余部分将介绍 **Gradle** 项目：确保在 **Build system** 开关中选中了它以便继续。
4. 要试用所有受支持的平台，请选择 Android、iOS、Desktop、Web 和 Server。
   在 **UI implementation** 选项中，保持选中 **Share UI**，以便在相应目标中使用 Compose Multiplatform 作为 UI 框架。

   > Desktop 目标自动包含 [Compose Hot Reload](compose-hot-reload.md) 功能，让你在保存代码更改后立即看到 UI 变化。
   > 即使你并不打算开发桌面应用，也可以在项目中添加 Desktop 目标，以加快 UI 代码的迭代速度。
   > 
   {style="note"}

5. 点击 **Create** 按钮，等待 IDE 生成并导入项目。

![采用默认设置且选中了 Android、iOS、桌面和 Web 平台的 IntelliJ IDEA 向导](idea-wizard-1step.png){width=600}

</TabItem>
<TabItem title= "Android Studio">

使用向导创建新项目：

1. 在主菜单中选择 **File** | **New** | **New project**。
2. 在默认的 **Phone and Tablet** 模板类别中选择 **Kotlin Multiplatform**。

    ![Android Studio 中的新建项目第一步](as-wizard-1.png){width="400"}

3. 根据需要设置项目名称、软件包名称和保存位置，然后点击 **Next**。
   **Build configuration language** 应保持设置为 Kotlin DSL。
4. 要创建一个完整的演示，请选择所有可用平台：Android、iOS、Desktop、Web 和 Server。
   在可用处保持选中 **Share UI** 选项，以便在相应目标中使用 Compose Multiplatform 作为 UI 框架。

   > Desktop 目标自动包含 [Compose Hot Reload](compose-hot-reload.md) 功能，让你在保存代码更改后立即看到 UI 变化。
   > 即使你并不打算开发桌面应用，也可以在项目中添加 Desktop 目标，以加快 UI 代码的迭代速度。
   >
   {style="note"}

5. 点击 **Finish** 按钮，等待 IDE 生成并导入项目。

![选中了 Android、iOS、桌面和 Web 平台的 Android Studio 向导最后一步](as-wizard-3step.png){width=600}

</TabItem>
</Tabs>

你可以在 `shared` 模块中找到平台间共享的代码。
`Platform.kt` 文件包含一个用于检索平台名称的 [`expect`](multiplatform-expect-actual.md) 声明。

当你运行针对不同平台构建的应用时，可以看到相同的 UI 布局，但其中显示的平台名称由原生调用提供，各不相同。

## 查看预检 {id="consult-the-preflight-checks"}

为确保项目设置中不存在环境问题，
请打开 **Project Environment Preflight Checks** 工具窗口：
点击右侧边栏或底部工具栏上的预检图标 ![带有飞机的 Project Environment Preflight Checks 图标](ide-preflight-checks.png){width="20"}。

在该工具窗口中，你可以查看哪些检查已通过、重新运行检查或更改其设置。
通常情况下，检测到问题时该窗口会自动打开，否则保持隐藏。

预检命令也可在 **Search Everywhere** 对话框中使用。
连按两次 <shortcut>Shift 键</shortcut> 并搜索包含单词 "preflight" 的命令：

![输入了单词 "preflight" 的 Search Everywhere 菜单](double-shift-preflight-checks.png){width=600}

## 生成项目中的模块 {id="modules-in-the-generated-project"}

根据在 Kotlin Multiplatform 向导中选择的平台组合，IDE 导入项目后你将看到以下模块：

* **androidApp** 是构建 Android 应用程序的模块。
* **desktopApp** 是构建桌面 JVM 应用程序的模块。
* **iosApp** 是构建 iOS 应用程序的 Xcode 项目。它依赖并使用 **shared** 模块作为 iOS 框架。
* **shared** 是一个 Kotlin Multiplatform 模块，包含 Android、桌面、iOS 和 Web 应用程序的通用代码。
* **webApp** 是构建 Web 应用程序的模块，同时支持 Kotlin/JS 和 Kotlin/Wasm。
* **server** 和 **core** 模块仅在选择服务器平台时创建：
  **core** 保存服务器与客户端应用之间共享的代码；
  **server** 配置一个端点。

  > 选择服务器平台后，IDE 会将应用程序入口点归拢在 `app` 目录下。
  > 否则，应用模块将在项目根目录下创建。
  >
  {style="tip"} 

`shared` 模块会针对每个目标单独编译。
例如，在构建 Android 应用时，它会被视为 Kotlin/JVM 模块；在构建 iOS 应用时，则会被视为 Kotlin/Native 模块。

## 运行示例应用 {id="run-the-sample-apps"}

IDE 向导创建的项目包含为 iOS、Android、桌面和 Web 应用程序生成的运行配置，以及用于运行服务器应用的 Gradle 任务。

要启动运行配置，请找到 IDE 右上角的下拉菜单，然后点击 **Run** 按钮：

<Tabs>
<TabItem title="Android">

要运行 Android 应用，请启动 **androidApp** 运行配置：

![高亮显示 Android 运行配置的下拉菜单](run-android-configuration.png){width=250}

默认情况下，它会在第一个可用的虚拟设备上运行：

![在虚拟设备上运行的 Android 应用](run-android-app.png){width=300}

如需手动创建 Android 运行配置（**Run | Edit Configurations**），
请选择 **Android App** 作为运行配置模板，并选择模块 **[project name].androidApp**。

</TabItem>
<TabItem title="iOS">

> 你需要一台安装了 Xcode 的 macOS 计算机来构建 iOS 应用。
>
{style="note"}

选择 **iosApp** 运行配置和模拟设备：

![高亮显示 iOS 运行配置的下拉菜单](run-ios-configuration.png){width=250}

该运行配置会在后台使用 Xcode 构建 iOS 应用，并通过 iOS 模拟器启动它。
首次构建会收集原生依赖项并缓存构建数据，以便加快后续运行速度：

![在虚拟设备上运行的 iOS 应用](run-ios-app.png){width=350}

</TabItem>
<TabItem title="Desktop">

桌面应用的默认运行配置创建为 **desktopApp [hot] 🔥**：

![高亮显示默认桌面运行配置的下拉菜单](run-desktop-configuration.png){width=250}

使用此配置可以运行 JVM 桌面应用：

![JVM 应用](run-desktop-app.png){width=600}

如需手动创建带有热重载的桌面运行配置（**Run | Edit Configurations**），
请选择 **Gradle** 运行配置模板，并通过以下命令指向 **[app name]:desktopApp** Gradle 项目：

```shell
hotRun --mainClass "com.example.demo.MainKt"
```

</TabItem>
<TabItem title="Web">

默认情况下，会为 Web 创建两个运行配置：**webApp [wasmJs]** 和 **webApp [js]**。
两者均运行相同的应用，分别使用 Kotlin/Wasm 或 Kotlin/JS 构建：

![高亮显示默认 Wasm 运行配置的下拉菜单](run-wasm-configuration.png){width=250}

运行此配置时，IDE 会构建 Kotlin/Wasm 应用并在默认浏览器中将其打开：

![浏览器中的 Web 应用](run-wasm-app.png){width=600}

如需手动创建 Web 运行配置，请选择 **Gradle** 运行配置模板，并通过 `wasmJsBrowserDevelopmentRun` 任务指向
**[app name]:webApp** Gradle 项目（Kotlin/JS 版本则使用 `jsBrowserDevelopmentRun`）。

</TabItem>
</Tabs>

## 故障排除 {id="troubleshooting"}

Kotlin Multiplatform 设置出现问题通常是由于 Java、Android SDK 或 Xcode 未正确配置所致。  

### Java 和 JDK {id="java-and-jdk"}

以下是与 Java 配置相关的最常见问题：

* 某些工具可能找不到 Java 安装或使用了错误的版本。
  要解决此问题，请将 `JAVA_HOME` 环境变量设置为安装合适 JDK 的目录
  （建议使用 [JetBrains Runtime](https://github.com/JetBrains/JetBrainsRuntime)），
  然后将 `JAVA_HOME` 内的 `bin` 文件夹路径追加到 `PATH` 变量中。
* 如果在 Android Studio 中遇到有关 Gradle JDK 的问题，请确保其配置正确：
  选择 **Settings** | **Build, Execution, Deployment** | **Build Tools** | **Gradle**。

### Android 工具 {id="android-tools"}

如果在启动 `adb` 等 Android 工具时遇到问题，
请确保已将 `ANDROID_HOME/tools`、`ANDROID_HOME/tools/bin` 和
`ANDROID_HOME/platform-tools` 路径添加到 `PATH` 环境变量中。

### Xcode {id="xcode"}

如果 iOS 运行配置报告没有可运行的虚拟设备，或者预检失败，
请确保启动 Xcode 并检查是否有 iOS SDK 更新。

### 获取帮助 {id="get-help"}

* **Kotlin Slack**：获取[邀请](https://surveys.jetbrains.com/s3/kotlin-slack-sign-up)并加入 [#multiplatform](https://kotlinlang.slack.com/archives/C3PQML5NU) 频道。
* **Kotlin Multiplatform Tooling 问题跟踪器**：[报告新问题](https://youtrack.jetbrains.com/newIssue?project=KMT)。

## 后续步骤 {id="what-s-next"}

详细了解 KMP 项目的结构以及如何编写共享代码：

* [完全共享代码：时区选择器应用](compose-multiplatform-new-project.md)：初学者入门教程，介绍如何使用 Compose Multiplatform 处理共享 UI 代码。
* [原生 UI：REST API 请求的共享逻辑](multiplatform-upgrade-app.md)：初学者入门教程，介绍如何在包含原生 UI 代码的多平台项目中处理共享代码。

深入了解特定的 Kotlin Multiplatform 用例：

* [使用多平台依赖项](multiplatform-add-dependencies.md)
* [围绕多平台工件组织代码和构件](multiplatform-project-configuration.md)
* 了解 Compose Multiplatform UI 框架及其在 Compose 生态系统中的定位：[Compose Multiplatform 与 Jetpack Compose 的关系](compose-multiplatform-and-jetpack-compose.md)

探索现有的 KMP 代码：

* [示例](multiplatform-samples.md)：JetBrains 官方示例以及展示 KMP 能力的精选项目列表。
* GitHub 话题：
  * [kotlin-multiplatform](https://github.com/topics/kotlin-multiplatform)：使用 Kotlin Multiplatform 实现的项目。
  * [kotlin-multiplatform-sample](https://github.com/topics/kotlin-multiplatform-sample)：使用 KMP 编写的示例项目列表。
* [klibs.io](https://klibs.io)：KMP 库的搜索平台。
  它对来自 GitHub 的项目和来自 Maven Central 的构件建立索引，支持对搜索结果进行精确筛选，
  并提供[对 AI 工作流的支持](https://klibs.io/ai)。