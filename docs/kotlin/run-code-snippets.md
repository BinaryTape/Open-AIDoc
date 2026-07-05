[//]: # (title: 运行代码片段)

Kotlin 代码通常被组织成项目，您可以使用 IDE、文本编辑器或其他工具来处理。然而，如果您想快速查看某个函数的工作原理或查找某个表达式的值，则无需创建新项目并进行构建。看看这三种在不同环境中立即运行 Kotlin 代码的便捷方法：

*   IDE 中的 [临时文件](#ide-scratches-and-worksheets)。
*   浏览器中的 [Kotlin Playground](#browser-kotlin-playground)。
*   命令行中的 [ki shell](#command-line-ki-shell)。

## IDE：临时文件 {id="ide-scratches-and-worksheets"}

IntelliJ IDEA 和 Android Studio 支持 Kotlin [临时文件](https://www.jetbrains.com/help/idea/kotlin-repl.html#efb8fb32)。

_临时文件_（或简称 _scratches_）允许您在与项目相同的 IDE 窗口中创建代码草案并实时运行。临时文件不与项目绑定；您可以从操作系统上的任何 IntelliJ IDEA 窗口访问并运行所有临时文件。

要创建 Kotlin 临时文件，请点击 **File** | **New** | **Scratch File** 并选择 **Kotlin** 类型。

临时文件中支持语法高亮显示、代码补全以及其他 IntelliJ IDEA 代码编辑功能。无需声明 `main()` 函数 —— 您编写的所有代码都将像在 `main()` 函数体中一样执行。

在临时文件中完成代码编写后，点击 **Run**。执行结果将出现在代码对应的行中。

![运行临时文件](scratch-run.png){width=700}

### 交互模式

IDE 可以自动运行临时文件中的代码。为了在停止输入后立即获得执行结果，请开启 **Interactive mode**（交互模式）。

![临时文件交互模式](scratch-interactive.png){width=700}

### 使用模块

您可以在临时文件中使用 Kotlin 项目中的类或函数。

要在临时文件中使用项目中的类或函数，请像往常一样使用 `import` 语句将它们导入临时文件。然后编写代码，并在 **Use classpath of module** 列表中选择相应的模块后运行。

临时文件使用连接模块的已编译版本。因此，如果您修改了模块的源文件，更改将在您重新构建模块时传播到临时文件。要在每次运行临时文件前自动重新构建模块，请选择 **Make module before Run**。

![临时文件选择模块](scratch-select-module.png){width=700}

## 浏览器：Kotlin Playground

[Kotlin Playground](https://play.kotlinlang.org/) 是一个在线应用程序，用于在浏览器中编写、运行和共享 Kotlin 代码。

### 编写和编辑代码

在 Playground 的编辑器区域，您可以像在源文件中一样编写代码：
*   以任意顺序添加您自己的类、函数和顶级声明。
*   在 `main()` 函数体中编写可执行部分。

与典型的 Kotlin 项目一样，Playground 中的 `main()` 函数可以包含 `args` 形参，也可以不带任何参数。要在执行时传递程序实参，请将其写在 **Program arguments** 字段中。

![Playground：代码补全](playground-completion.png){width=700}

Playground 会高亮显示代码，并在您输入时显示代码补全选项。它会自动从标准库和 [`kotlinx.coroutines`](coroutines-overview.md) 中导入声明。

### 选择执行环境

Playground 提供了自定义执行环境的方法：
*   多个 Kotlin 版本，包括可用的 [未来版本的预览版](eap.md)。
*   运行代码的多个后端：JVM、JS（旧版或 [IR 编译器](js-ir-compiler.md)，或 Canvas）或 JUnit。

![Playground：环境设置](playground-env-setup.png){width=700}

对于 JS 后端，您还可以查看生成的 JS 代码。

![Playground：生成的 JS](playground-generated-js.png){width=700}

### 在线共享代码

使用 Playground 与他人共享您的代码 —— 点击 **Copy link** 并将其发送给任何您想展示代码的人。

您还可以将 Playground 中的代码片段嵌入到其他网站中，甚至使其可运行。点击 **Share code** 将您的示例嵌入到任何网页或 [Medium](https://medium.com/) 文章中。

![Playground：共享代码](playground-share.png){width=700}

## 命令行：ki shell

[ki shell](https://github.com/Kotlin/kotlin-interactive-shell)（_Kotlin Interactive Shell_）是一个用于在终端中运行 Kotlin 代码的命令行工具。它适用于 Linux、macOS 和 Windows。

ki shell 提供基础的代码评估能力，以及如下高级功能：
*   代码补全
*   类型检查
*   外部依赖项
*   代码片段的粘贴模式
*   脚本支持

更多详情请参阅 [ki shell GitHub 仓库](https://github.com/Kotlin/kotlin-interactive-shell)。

### 安装并运行 ki shell

要安装 ki shell，请从 [GitHub](https://github.com/Kotlin/kotlin-interactive-shell) 下载其最新版本，并将其解压缩到您选择的目录中。

在 macOS 上，您还可以通过运行以下命令使用 Homebrew 安装 ki shell：

```shell
brew install ki
```

要启动 ki shell，请在 Linux 和 macOS 上运行 `bin/ki.sh`（如果使用 Homebrew 安装则只需运行 `ki`），或者在 Windows 上运行 `bin\ki.bat`。

shell 运行后，您可以立即开始在终端中编写 Kotlin 代码。输入 `:help`（或 `:h`）查看 ki shell 中可用的命令。

### 代码补全与高亮显示

当您按下 **Tab** 键时，ki shell 会显示代码补全选项。它还会在您输入时提供语法高亮显示。您可以通过输入 `:syntax off` 禁用此功能。

![ki shell 高亮显示与补全](ki-shell-highlight-completion.png){width=700}

当您按下 **Enter** 时，ki shell 会评估输入的行并打印结果。表达式的值将以自动生成的变量名（如 `res*`）打印。您随后可以在运行的代码中使用这些变量。如果输入的构造不完整（例如，只有 `if` 条件但没有主体），shell 会打印三个点并等待剩余部分。

![ki shell 结果](ki-shell-results.png){width=700}

### 检查表达式的类型

对于复杂的表达式或您不熟悉的 API，ki shell 提供了 `:type`（或 `:t`）命令，用于显示表达式的类型：

![ki shell 类型](ki-shell-type.png){width=700}

### 加载代码

如果您需要的代码存储在其他地方，有两种方法可以将其加载并在 ki shell 中使用：
*   使用 `:load`（或 `:l`）命令加载源文件。
*   使用 `:paste`（或 `:p`）命令在粘贴模式下复制并粘贴代码段。

![ki shell 加载文件](ki-shell-load.png){width=700}

`ls` 命令显示可用的符号（变量和函数）。

### 添加外部依赖项

除了标准库之外，ki shell 还支持外部依赖项。这让您无需创建整个项目即可在其中尝试第三方库。

要在 ki shell 中添加第三方库，请使用 `:dependsOn` 命令。默认情况下，ki shell 与 Maven Central 配合使用，但如果您使用 `:repository` 命令连接其他仓库，也可以使用它们：

![ki shell 外部依赖项](ki-shell-dependency.png){width=700}