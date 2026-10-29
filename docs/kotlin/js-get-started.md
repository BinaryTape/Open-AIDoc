[//]: # (title: Kotlin/JS 入门)

本教程展示了如何使用 Kotlin/JavaScript (Kotlin/JS) 创建一个针对浏览器的 Web 应用程序。
要创建您的应用，请选择最适合您工作流的工具：

* **[IntelliJ IDEA](#create-your-application-in-intellij-idea)**：从版本控制中克隆项目模板，并在 IntelliJ IDEA 中进行开发。
* **[Gradle 构建系统](#create-your-application-using-gradle)**：手动为您的项目创建构建文件，以更好地了解底层设置的工作原理。

> 除了针对浏览器外，您还可以使用 Kotlin/JS 为其他环境进行编译。
> 欲了解更多信息，请参阅[执行环境](js-project-setup.md#execution-environments)。
> 
{style="tip"}

## 在 IntelliJ IDEA 中创建应用程序 {id="create-your-application-in-intellij-idea"}

要创建您的 Kotlin/JS Web 应用程序，您可以使用 [IntelliJ IDEA](https://www.jetbrains.com/idea/download/)。

### 设置环境 {id="set-up-the-environment"}

1. 下载并安装最新版本的 [IntelliJ IDEA](https://www.jetbrains.com/idea/)。
2. 安装 [Kotlin Multiplatform IDE 插件](https://plugins.jetbrains.com/plugin/14936-kotlin-multiplatform)（不要将其与 Kotlin Multiplatform Gradle 插件混淆）。

### 创建您的项目 {id="create-your-project"}

1. 在 IntelliJ IDEA 中，选择 **File** | **New** | **Project from Version Control**。
2. 输入 [Kotlin/JS 模板项目](https://github.com/Kotlin/kmp-js-wizard) 的 URL：

   ```text
   https://github.com/Kotlin/kmp-js-wizard
   ```   
   
3. 点击 **Clone**。

### 配置您的项目 {id="configure-your-project"}

1. 打开 `kmp-js-wizard/gradle/libs.versions.toml` 文件。它包含了项目依赖项的版本目录。 
2. 确保 Kotlin 版本与 Kotlin Multiplatform Gradle 插件的版本相匹配，这是创建针对 Kotlin/JS 的 Web 应用程序所必需的：

   ```toml
   [versions]
   kotlin = "%kotlinVersion%"
   
   [plugins]
   kotlin-multiplatform = { id = "org.jetbrains.kotlin.multiplatform", version.ref = "kotlin" }
   ```

3. 同步 Gradle 文件（如果您更新了 `libs.versions.toml` 文件）。点击构建文件中出现的 **Load Gradle Changes** 图标。

   ![加载 Gradle 更改按钮](load-gradle-changes.png){width=300}

   或者，点击 Gradle 工具窗口中的刷新按钮。

欲了解更多关于多平台项目 Gradle 配置的信息，请参阅 [Multiplatform Gradle DSL 参考](https://kotlinlang.org/docs/multiplatform/multiplatform-dsl-reference.html)。

### 构建并运行应用程序 {id="build-and-run-the-application"}

1. 打开 `src/jsMain/kotlin/Main.kt` 文件。

   * `src/jsMain/kotlin/` 目录包含了您项目中 JavaScript 目标的主要 Kotlin 源代码文件。
   * `Main.kt` 文件包含的代码使用了 [`kotlinx.browser`](https://github.com/Kotlin/kotlinx-browser) API 在浏览器页面上渲染 "Hello, Kotlin/JS!"。

2. 点击 `main()` 函数中的 **运行** 图标以运行代码。

   ![运行应用程序](js-run-gutter.png){width=500}

Web 应用程序会自动在您的浏览器中打开。
或者，您可以在运行完成后在浏览器中打开以下 URL：

```text
   http://localhost:8080/
```

您可以看到该 Web 应用程序：

![应用程序输出](js-output-gutter-1.png){width=600}

在您第一次运行应用程序后，IntelliJ IDEA 会在顶部栏创建其对应的运行配置 (**jsMain [js]**)：

![Gradle 运行配置](js-run-config.png){width=500}

> 在拥有 Ultimate 订阅的 IntelliJ IDEA 中，
> 您可以使用 [JS 调试器](https://www.jetbrains.com/help/idea/configuring-javascript-debugger.html)
> 直接从 IDE 中调试代码。
> 
> {style="tip"}

### 启用连续构建 {id="enable-continuous-build"}

每当您进行更改时，Gradle 都可以自动重新构建您的项目：

1. 在运行配置列表中选择 **jsMain [js]**，然后点击 **More Actions** | **Edit**。

    ![编辑 Gradle 运行配置](js-edit-run-config.png){width=500}

2. 在 **运行/调试配置** 对话框中，在 **Run** 字段内输入 `jsBrowserDevelopmentRun --continuous`。

    ![连续运行配置](js-continuous-run-config.png){width=500}

3. 点击 **OK**。

现在，当您运行应用程序并进行任何更改时，每当您保存 (<shortcut>Ctrl + S</shortcut>/<shortcut>Cmd + S</shortcut>) 或更改类文件时，Gradle 都会自动为项目执行增量构建并热重载浏览器。 

### 修改应用程序 {id="modify-the-application"}

修改应用程序以添加一个统计单词中字母数量的功能。

#### 添加输入元素 {id="add-an-input-element"}

1. 在 `src/jsMain/kotlin/Main.kt` 文件中，通过 [扩展函数](extensions.md#extension-functions) 添加一个 [HTML 输入元素](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/input) 以读取用户输入：

   ```kotlin
   // 替换 Element.appendMessage() 函数
   fun Element.appendInput() {
       val input = document.createElement("input")
       appendChild(input)
   }
   ```

2. 在 `main()` 中调用 `appendInput()` 函数。它会在页面上显示一个输入元素：

   ```kotlin
   fun main() {
       // 替换 document.body!!.appendMessage(message)
       document.body?.appendInput()
   }
   ```

3. [再次运行应用程序](#build-and-run-the-application)。

    您的应用程序如下所示：

   ![包含输入元素的应用程序](js-added-input-element.png){width=600}

#### 添加输入事件处理 {id="add-an-input-event-handling"}

1. 在 `appendInput()` 函数内部添加一个监听器，以读取输入值并对更改做出反应：

    ```kotlin
   // 替换当前的 appendInput() 函数
    fun Element.appendInput(onChange: (String) -> Unit = {}) {
        val input = document.createElement("input").apply {
            addEventListener("change") { event ->
                onChange(event.target.unsafeCast<HTMLInputElement>().value)
            }
        }
        appendChild(input)
    }
    ```

2. 按照 IDE 的建议导入 `HTMLInputElement` 依赖项。

   ![导入依赖项](js-import-dependency.png){width=600}

3. 在 `main()` 中调用 `onChange` 回调。它会读取并处理输入值：

    ```kotlin
    fun main() {
        // 替换 document.body?.appendInput()
        document.body?.appendInput(onChange = { println(it) })
    }
   ```

#### 添加输出元素 {id="add-an-output-element"}

1. 定义一个创建段落的 [扩展函数](extensions.md#extension-functions)，添加一个用于显示输出的文本元素：

   ```kotlin
    fun Element.appendTextContainer(): Element {
        return document.createElement("p").also(::appendChild)
    }
   ```
   
2. 在 `main()` 中调用 `appendTextContainer()` 函数。它会创建输出元素：

   ```kotlin
    fun main() {
        // 为我们的输出创建一个文本容器
        // 替换 val message = Message(topic = "Kotlin/JS", content = "Hello!")
        val output = document.body?.appendTextContainer()
   
        // 读取输入值
        document.body?.appendInput(onChange = { println(it) })
    }
   ```
   
#### 处理输入以统计字母数量 {id="process-the-input-to-count-the-letters"}

通过移除空格并显示带有字母数量的输出来处理输入。

将以下代码添加到 `main()` 函数内的 `appendInput()` 函数中：

```kotlin
fun main() {
    // 为我们的输出创建一个文本容器
    val output = document.body?.appendTextContainer()

    // 读取输入值
    // 替换当前的 appendInput() 函数
    document.body?.appendInput(onChange = { name ->
        name.replace(" ", "").let {
            output?.textContent = "Your name contains ${it.length} letters"
        }
    })
}
```

在上面的代码中：

* [`replace()` 函数](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.text/replace.html) 移除了名字中的空格。
* [`let{}` 作用域函数](scope-functions.md#let) 在对象上下文中运行该函数。
* [字符串模板](strings.md#string-templates) (`${it.length}`) 通过在变量名前加上美元符号 (`$`) 并将其包含在花括号 (`{}`) 中，将单词的长度插入到字符串中。
  而 `it` 是 [lambda 参数](coding-conventions.md#lambda-parameters) 的默认名称。

#### 运行应用程序 {id="run-the-application"}

1. [运行应用程序](#build-and-run-the-application)。
2. 输入您的名字。
3. 按下 <shortcut>输入</shortcut>。 

您可以看到结果：

![应用程序输出](js-output-gutter-2.png){width=600}

#### 处理输入以统计不重复字母的数量 {id="process-the-input-to-count-unique-letters"}

作为一项额外练习，让我们处理输入以计算并显示单词中不重复字母的数量：

1. 在 `src/jsMain/kotlin/Main.kt` 文件中，为 `String` 添加 `.countDistinctCharacters()` [扩展函数](extensions.md#extension-functions)：

   ```kotlin
   fun String.countDistinctCharacters() = lowercase().toList().distinct().count()
   ```

   在上面的代码中：

   * [`.lowercase()` 函数](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.text/lowercase.html) 将名字转换为小写。
   * [`toList()` 函数](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.text/to-list.html) 将输入字符串转换为字符列表。
   * [`distinct()` 函数](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/distinct.html) 仅从单词中选择不重复的字符。
   * [`count()` 函数](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/count.html) 统计不重复字符的数量。

2. 在 `main()` 中调用 `.countDistinctCharacters()` 函数。它会统计您名字中不重复的字母：

   ```kotlin
    fun main() {
        // 为我们的输出创建一个文本容器
        val output = document.body?.appendTextContainer()
   
        // 读取输入值
        document.body?.appendInput(onChange = { name ->
            name.replace(" ", "").let {
                // 打印不重复字母的数量
                // 替换 output?.textContent = "Your name contains ${it.length} letters"
                output?.textContent = "Your name contains ${it.countDistinctCharacters()} unique letters"
            }
        })
   }
   ```

3. 按照步骤 [运行应用程序并输入您的名字](#run-the-application)。

您可以看到结果：

![应用程序输出](js-output-gutter-3.png){width=600}

## 使用 Gradle 创建应用程序 {id="create-your-application-using-gradle"}

在本节中，您可以学习如何使用 [Gradle](https://gradle.org) 手动创建一个 Kotlin/JS 应用程序。

Gradle 是 Kotlin/JS 和 Kotlin 多平台项目的默认构建系统。它也广泛应用于 Java、Android 和其他生态系统。

### 创建项目文件 {id="create-project-files"}

1. 确保您使用的 Gradle 版本与 Kotlin Gradle 插件 (KGP) 兼容。详情请参阅 [兼容性表](gradle-configure-project.md#apply-the-plugin)。
2. 使用文件管理器、命令行或您喜欢的任何工具为项目创建一个空目录。 
3. 在项目目录内，创建一个具有以下内容的 `build.gradle.kts` 文件：

   <tabs group="build-script">
   <tab title="Kotlin" group-key="kotlin">

   ```kotlin
   // build.gradle.kts
   plugins {
       kotlin("multiplatform") version "%kotlinVersion%"
   }

   repositories {
       mavenCentral()
   }

   kotlin {
       js {
           // 使用 browser() 以在浏览器中运行，或使用 nodejs() 以在 Node.js 中运行
           browser() 
           binaries.executable()
       }
   }
   ```

   </tab>
   <tab title="Groovy" group-key="groovy">

   ```groovy
   // build.gradle
   plugins {
       id 'org.jetbrains.kotlin.multiplatform' version '%kotlinVersion%'
   }

   repositories {
       mavenCentral()
   }

   kotlin {
       js {
           // 使用 browser() 以在浏览器中运行，或使用 nodejs() 以在 Node.js 中运行
           browser() 
           binaries.executable()
       }
   }
   ```

   </tab>
   </tabs>

   > 您可以使用不同的 [执行环境](js-project-setup.md#execution-environments)，
   > 例如 `browser()` 或 `nodejs()`。 
   > 每个环境定义了代码运行的位置，并决定了 Gradle 如何在项目中生成任务名称。
   >
   > {style="note"}

4. 在项目目录内，创建一个空的 `settings.gradle.kts` 文件。
5. 在项目目录内，创建一个 `src/jsMain/kotlin` 目录。
6. 在 `src/jsMain/kotlin` 目录内，添加一个具有以下内容的 `hello.kt` 文件：

   ```kotlin
   fun main() {
       println("Hello, Kotlin/JS!")
   }
   ```

   按照约定，所有源代码都位于 `src/<target name>[Main|Test]/kotlin` 目录： 
   * `Main` 是源代码的位置。
   * `Test` 是测试的位置。 
   * `<target name>` 对应目标平台（在本例中为 `js`）。

**对于 `browser` 环境**

> 如果您使用的是 `browser` 环境，请遵循以下步骤。如果您使用的是 `nodejs` 环境，请转到 [构建并运行项目](#build-and-run-the-project) 部分。
> 
> {style="note"}

1. 在项目目录内，创建一个 `src/jsMain/resources` 目录。
2. 在 `src/jsMain/resources` 目录内，创建一个具有以下内容的 `index.html` 文件：

   ```html
   <!DOCTYPE html>
   <html lang="en">
   <head>
       <meta charset="UTF-8">
       <title>Application title</title>
   </head>
   <body>
       <script src="$NAME_OF_YOUR_PROJECT_DIRECTORY.js"></script>
   </body>
   </html>
   ```

3. 将 `<$NAME_OF_YOUR_PROJECT_DIRECTORY>` 占位符替换为您的项目目录名称。

### 构建并运行项目 {id="build-and-run-the-project"}

要构建项目，请在项目根目录运行以下命令：

```bash
# 对于浏览器
gradle jsBrowserDevelopmentRun

# 或者

# 对于 Node.js
gradle jsNodeDevelopmentRun 
```

如果您使用的是 `browser` 环境，您可以看到浏览器打开了 `index.html` 文件，并在浏览器控制台中打印了 `"Hello, Kotlin/JS!"`。您可以使用 <shortcut>Ctrl + Shift + J</shortcut>/<shortcut>Cmd + Option + J</shortcut> 命令打开控制台。

![应用程序输出](js-output-gutter-4.png){width=600}

如果您使用的是 `nodejs` 环境，您可以看到终端打印了 `"Hello, Kotlin/JS!"`。

![应用程序输出](js-output-gutter-5.png){width=500}

### 在 IDE 中打开项目 {id="open-the-project-in-an-ide"}

您可以在任何支持 Gradle 的 IDE 中打开您的项目。 

如果您使用 IntelliJ IDEA：

1. 选择 **File** | **Open**。
2. 找到项目目录。
3. 点击 **Open**。

IntelliJ IDEA 会自动检测这是否是一个 Kotlin/JS 项目。如果您在项目上遇到问题，IntelliJ IDEA 会在 **Build** 窗格中显示错误信息。

## 下一步 {id="what-s-next"}

<!-- * Complete the [Create a multiplatform app targeting Web](native-app-with-c-and-libcurl.md) tutorial that explains how
  to share your Kotlin code with a JavaScript/TypeScript application.]: -->

* [设置您的 Kotlin/JS 项目](js-project-setup.md)。
* 了解如何 [调试 Kotlin/JS 应用程序](js-debugging.md)。
* 了解如何 [使用 Kotlin/JS 编写并运行测试](js-running-tests.md)。
* 了解如何 [为实际的 Kotlin/JS 项目编写 Gradle 构建脚本](https://kotlinlang.org/docs/multiplatform/multiplatform-dsl-reference.html)。
* 阅读更多关于 [Gradle 构建系统](gradle.md) 的信息。