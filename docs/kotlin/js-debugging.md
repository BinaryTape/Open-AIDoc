[//]: # (title: 调试 Kotlin/JS 代码)

JavaScript 源代码映射 (source maps) 提供了打包器或压缩器生成的压缩代码与开发者编写的实际源代码之间的映射。通过这种方式，源代码映射支持在代码执行期间对其进行调试。

Kotlin 多平台 Gradle 插件会自动为项目构建生成源代码映射，无需任何额外配置即可使用。

## 在浏览器中调试

大多数现代浏览器都提供了允许检查页面内容并调试其上运行的代码的工具。有关更多详细信息，请参阅浏览器的文档。

要在浏览器中调试 Kotlin/JS：

1. 通过调用其中一个可用的 *run* Gradle 任务来运行项目，例如 `jsBrowserDevelopmentRun`。
   详细了解[运行 Kotlin/JS](running-kotlin-js.md#run-the-browser-target)。
2. 在浏览器中转到该页面并启动其开发人员工具（例如，通过右键点击并选择**检查** (Inspect) 操作）。了解如何在常用浏览器中[查找开发人员工具](https://balsamiq.com/support/faqs/browserconsole/)。
3. 如果您的程序正在将信息记录到控制台，请转到 **控制台** (Console) 选项卡以查看此输出。根据您的浏览器，这些日志可以引用其来源的 Kotlin 源文件和行：

![Chrome DevTools 控制台](devtools-console.png){width="600"}

4. 点击右侧的文件引用可转到相应的代码行。或者，您可以手动切换到 **Sources** 选项卡并在文件树中找到所需的文件。转到 Kotlin 文件将显示常规的 Kotlin 代码（而不是压缩后的 JavaScript）：

![在 Chrome DevTools 中调试](devtools-sources.png){width="600"}

您现在可以开始调试程序了。点击其中一个行号即可设置断点。开发人员工具甚至支持在语句内设置断点。与常规 JavaScript 代码一样，设置的任何断点都将在页面重新加载后保持。这也可以调试在首次加载脚本时执行的 Kotlin `main()` 方法。

## 在 IDE 中调试

[IntelliJ IDEA](https://www.jetbrains.com/idea/) Ultimate 订阅提供了一套强大的工具，用于在开发过程中调试代码。

要在 IntelliJ IDEA 中调试 Kotlin/JS，您需要一个 **JavaScript Debug** 配置。要添加此类调试配置：

1. 转到 **Run | Edit Configurations**。
2. 点击 **+** 并选择 **JavaScript Debug**。
3. 指定配置 **Name** 并提供项目运行的 **URL**（默认为 `http://localhost:8080`）。

![JavaScript 调试配置](debug-config.png){width=700}

4. 保存配置。

详细了解[设置 JavaScript 调试配置](https://www.jetbrains.com/help/idea/configuring-javascript-debugger.html)。

现在您已准备好调试您的项目了！

1. 通过调用其中一个可用的 *run* Gradle 任务来运行项目，例如 `jsBrowserDevelopmentRun`。
   详细了解[运行 Kotlin/JS](running-kotlin-js.md#run-the-browser-target)。
2. 通过运行您之前创建的 JavaScript 调试配置来启动调试会话：

![运行 JavaScript 调试配置](debug-config-run.png){width=700}

3. 您可以在 IntelliJ IDEA 的**调试** (Debug) 窗口中查看程序的控制台输出。输出项会引用其来源的 Kotlin 源文件和行：

![IDE 中的 JavaScript 调试输出](ide-console-output.png){width=700}

4. 点击右侧的文件引用可转到相应的代码行。

您现在可以使用 IDE 提供的整套工具（断点、步进、表达式计算等）开始调试程序。详细了解 [IntelliJ IDEA 中的调试](https://www.jetbrains.com/help/idea/debugging-javascript-in-chrome.html)。

> 由于当前 IntelliJ IDEA 中 JavaScript 调试器的限制，您可能需要重新运行 JavaScript 调试才能使执行停在断点处。
>
{style="note"}

## 在 Node.js 中调试

如果您的项目以 Node.js 为目标，您可以在此运行时中对其进行调试。

要调试以 Node.js 为目标的 Kotlin/JS 应用程序：

1. 通过运行 `build` Gradle 任务来构建项目。
2. 在项目目录下的 `build/js/packages/your-module/kotlin/` 目录中找到生成的针对 Node.js 的 `.js` 文件。
3. 按照 [Node.js 调试指南](https://nodejs.org/en/docs/guides/debugging-getting-started/#jetbrains-webstorm-2017-1-and-other-jetbrains-ides)中的说明在 Node.js 中对其进行调试。

## 下一步

既然您已经知道如何启动 Kotlin/JS 项目的调试会话，请学习如何高效地使用调试工具：

* 学习如何[在 Google Chrome 中调试 JavaScript](https://developer.chrome.com/docs/devtools/javascript/)
* 熟悉 [IntelliJ IDEA JavaScript 调试器](https://www.jetbrains.com/help/idea/debugging-javascript-in-chrome.html)
* 了解如何[在 Node.js 中调试](https://nodejs.org/en/docs/guides/debugging-getting-started/)。

## 如果遇到任何问题

如果您在调试 Kotlin/JS 时遇到任何问题，请将其报告给我们的问题跟踪器 [YouTrack](https://kotl.in/issue)