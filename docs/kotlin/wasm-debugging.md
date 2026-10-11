[//]: # (title: 调试 Kotlin/Wasm 代码)

<primary-label ref="beta"/> 

本教程演示了如何使用 IntelliJ IDEA 和浏览器来调试使用 Kotlin/Wasm 构建的 [Compose Multiplatform](https://www.jetbrains.com/lp/compose-multiplatform/) 应用程序。

## 开始之前 {id="before-you-start"}

1. [搭建适用于 Kotlin Multiplatform 开发的环境](https://kotlinlang.org/docs/multiplatform/quickstart.html#set-up-the-environment)。
2. 按照说明[创建一个以 Kotlin/Wasm 为目标平台的 Kotlin Multiplatform 项目](wasm-get-started.md#create-a-project)。

> 要在 IntelliJ IDEA 中调试 Kotlin/Wasm 代码，必须安装 JavaScript Debugger 插件。[详细了解关于该插件的更多信息及安装方法。](https://www.jetbrains.com/help/idea/debugging-javascript-in-chrome.html#ws_js_debugging_chrome_before_you_start)
>
{style="note"}

## 在 IntelliJ IDEA 中调试 {id="debug-in-intellij-idea"}

你创建的 Kotlin Multiplatform 项目包含一个由 Kotlin/Wasm 驱动的 Compose Multiplatform 应用程序。
你可以在 IntelliJ IDEA 中开箱即用地调试此应用程序，无需额外配置。

1. 在 IntelliJ IDEA 中，打开要调试的 Kotlin 文件。在本教程中，我们将使用 Kotlin Multiplatform 项目中以下目录下的 `Greeting.kt` 文件：

   `WasmDemo/composeApp/src/wasmJsMain/kotlin/wasm.project.demo.wasmdemo`

2. 点击行号，在想要检查的代码上设置断点。

   ![设置断点](wasm-breakpoints-intellij.png){width=650}

3. 在运行配置列表中，选择 **composeApp[wasmJs]**。
4. 点击屏幕顶部的调试图标以调试模式运行代码。

   ![以调试模式运行](wasm-debug-run-configurations.png){width=600}

   应用程序启动后，将在新的浏览器窗口中打开。

   ![浏览器中的 Compose 应用](wasm-composeapp-browser.png){width=600}

   同时，IntelliJ IDEA 中会自动打开 **Debug** 面板。

   ![Compose 应用调试器](wasm-debug-pane.png){width=600}

### 检查应用程序 {id="inspect-your-application"}

> 如果你[在浏览器中调试](#debug-in-your-browser)，也可以按照相同的步骤来检查应用程序。
>
{style="note"}

1. 在应用程序的浏览器窗口中，点击 **Click me!** 按钮与应用程序进行交互。此操作会触发代码执行，当执行到达断点时，调试器将暂停。

2. 在调试面板中，使用调试控制按钮在断点处检查变量和代码执行：
    * ![步过](wasm-debug-step-over.png){width=30}{type="joined"} 步过以执行当前行并在下一行暂停。
    * ![步入](wasm-debug-step-into.png){width=30}{type="joined"} 步入以更深入地调查函数。
    * ![步出](wasm-debug-step-out.png){width=30}{type="joined"} 步出以执行代码直至退出当前函数。

3. 查看 **Threads & Variables** 面板。它可以帮助你跟踪函数调用序列并精确定位任何错误的位置。

   ![查看 Threads & Variables](wasm-debug-panes-intellij.png){width=700}

4. 修改代码并重新运行应用程序，以验证其运行效果。
5. 完成调试后，点击带有断点的行号以移除断点。

## 在浏览器中调试 {id="debug-in-your-browser"}

你也可以在浏览器中调试此 Compose Multiplatform 应用程序，无需额外配置。

当你运行开发相关的 Gradle 任务（`*DevRun`）时，Kotlin 会自动将源文件提供给浏览器，从而允许你设置断点、检查变量并逐步执行 Kotlin 代码。

在浏览器中提供 Kotlin/Wasm 项目源码的配置现已包含在 Kotlin Gradle 插件中。如果你之前在 `build.gradle.kts` 文件中添加过此配置，应将其移除以避免冲突。

> 本教程使用 Chrome 浏览器，但你也可以在其他浏览器中按照这些步骤操作。更多信息请参阅[浏览器版本](wasm-configuration.md#browser-versions)。
>
{style="tip"}

1. 按照说明[运行 Compose Multiplatform 应用程序](wasm-get-started.md#run-the-application)。

2. 在应用程序的浏览器窗口中，右键点击并选择 **检查** 操作以访问开发者工具。或者，可以使用快捷键 **F12**，或选择 **视图** | **开发者** | **开发者工具**。

3. 切换到 **Sources**（源代码）选项卡并选择要调试的 Kotlin 文件。在本教程中，我们将使用 `Greeting.kt` 文件。

4. 点击行号，在想要检查的代码上设置断点。只有显示较暗数字的行才能设置断点 —— 在本例中为 4、7、8 和 9。

   ![设置断点](wasm-breakpoints-browser.png){width=700}

5. 与[在 IntelliJ IDEA 中调试](#inspect-your-application)类似，检查你的应用程序。

    在浏览器中调试时，用于跟踪函数调用序列并精确定位任何错误的面板为 **Scope** 和 **Call Stack**。

   ![查看调用堆栈](wasm-debug-scope.png){width=450}

### 使用自定义格式化程序 {id="use-custom-formatters"}

在浏览器中调试 Kotlin/Wasm 代码时，自定义格式化程序有助于以更人性化、更易理解的方式显示和查找变量值。

自定义格式化程序在 Kotlin/Wasm 开发构建中默认处于启用状态，但你仍需要确保在浏览器的开发者工具中启用了自定义格式化程序：

* 在 Chrome DevTools 中，找到 **Settings | Preferences | Console** 中的 **Custom formatters** 复选框：

  ![在 Chrome 中启用自定义格式化程序](wasm-custom-formatters-chrome.png){width=400}

* 在 Firefox DevTools 中，找到 **Settings | Advanced settings** 中的 **Enable custom formatters** 复选框：

  ![在 Firefox 中启用自定义格式化程序](wasm-custom-formatters-firefox.png){width=400}

此功能使用了[自定义格式化程序 API](https://firefox-source-docs.mozilla.org/devtools-user/custom_formatters/index.html)，并受 Firefox 以及基于 Chromium 的浏览器支持。

鉴于自定义格式化程序默认仅对 Kotlin/Wasm 开发构建生效，如果你想在生产构建中使用它们，则需要调整 Gradle 配置。请在 `wasmJs {}` 块中添加以下编译器选项：

```kotlin
// build.gradle.kts
kotlin {
    wasmJs {
        // ...

        compilerOptions {
            freeCompilerArgs.add("-Xwasm-debugger-custom-formatters")
        }
    }
}
```

## 留下反馈 {id="leave-feedback"}

如果你对调试体验有任何反馈，我们将不胜感激！

* ![Slack](slack.svg){width=25}{type="joined"} Slack：[获取 Slack 邀请](https://surveys.jetbrains.com/s3/kotlin-slack-sign-up)，并在我们的 [#webassembly](https://kotlinlang.slack.com/archives/CDFP59223) 频道中直接向开发者提供反馈。
* 在 [YouTrack](https://youtrack.jetbrains.com/issue/KT-56492) 中提供你的反馈。

## 下一步 {id="what-s-next"}

* 观看此 [YouTube 视频](https://www.youtube.com/watch?v=t3FUWfJWrjU&t=2703s)，了解实际操作中的 Kotlin/Wasm 调试。
* 尝试更多 Kotlin/Wasm 示例：
  * [KotlinConf 应用程序](https://github.com/JetBrains/kotlinconf-app)
  * [Compose 图像查看器](https://github.com/JetBrains/compose-multiplatform/tree/master/examples/imageviewer)
  * [Node.js 示例](https://github.com/Kotlin/kotlin-wasm-nodejs-template)
  * [WASI 示例](https://github.com/Kotlin/kotlin-wasm-wasi-template)
  * [Compose 示例](https://github.com/Kotlin/kotlin-wasm-compose-template)