[//]: # (title: Kotlin/Native 入门)

在本教程中，你将学习如何创建 Kotlin/Native 应用程序。选择最适合你的工具，并使用以下方式创建应用：

* **[IDE](#在-ide-中)**。在此处，你可以从版本控制系统克隆项目模板，并在 IntelliJ IDEA 中使用它。
* **[Gradle 构建系统](#使用-gradle)**。为了更好地了解底层工作原理，手动为你的项目创建构建文件。
* **[命令行工具](#使用命令行编译器)**。你可以使用作为标准 Kotlin 分发的一部分提供的 Kotlin/Native 编译器，直接在命令行工具中创建应用。

  控制台编译可能看起来简单直接，但对于拥有数百个文件和库的大型项目来说扩展性不佳。对于此类项目，我们建议使用 IDE 或构建系统。

借助 Kotlin/Native，你可以面向[不同的目标平台](native-target-support.md)进行编译，包括 Linux、macOS 和 Windows。虽然跨平台编译是可行的（即在一个平台上为另一个不同的平台进行编译），但在本教程中，你的目标平台将与当前编译所在的平台相同。

> 如果你使用的是 Mac，并且想要为 macOS 或其他 Apple 目标创建并运行应用程序，你还需要先安装 [Xcode Command Line Tools](https://developer.apple.com/download/)，启动它并接受许可条款。
>
{style="note"}

## 在 IDE 中 {id="in-ide"}

在本节中，你将学习如何使用 IntelliJ IDEA 创建 Kotlin/Native 应用程序。

### 创建项目 {id="create-the-project"}

1. 下载并安装最新版本的 [IntelliJ IDEA](https://www.jetbrains.com/idea/)。
2. 在 IntelliJ IDEA 中选择 **File** | **New** | **Project from Version Control**，并使用以下 URL 克隆[项目模板](https://github.com/Kotlin/kmp-native-wizard)：

   ```none
   https://github.com/Kotlin/kmp-native-wizard
   ```   

3. 打开 `gradle/libs.versions.toml` 文件，它是项目依赖项的版本目录 (Version Catalog)。要创建 Kotlin/Native 应用程序，你需要 Kotlin Multiplatform Gradle 插件，其版本与 Kotlin 相同。请确保使用最新的 Kotlin 版本：

   ```toml
   [versions]
   kotlin = "%kotlinVersion%"
   ```

4. 按照提示重新加载 Gradle 文件：

   ![重新加载 Gradle 更改按钮](load-gradle-changes.png){width=295}

有关这些设置的详细信息，请参阅 [Multiplatform Gradle DSL 参考](https://kotlinlang.org/docs/multiplatform/multiplatform-dsl-reference.html)。

### 构建并运行应用程序 {id="build-and-run-the-application"}

打开 `src/nativeMain/kotlin/` 目录下的 `Main.kt` 文件：

* `src` 目录包含 Kotlin 源代码文件。
* `Main.kt` 文件包含使用 [`println()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.io/println.html) 函数输出 "Hello, Kotlin/Native!" 的代码。

点击装订区域中的绿色图标以运行代码：

![运行应用程序](native-run-gutter.png){width=450}

IntelliJ IDEA 使用 Gradle 任务运行代码，并在 **Run** 选项卡中输出结果：

![应用程序输出](native-output-gutter-1.png){width=450}

首次运行后，IDE 会在顶部创建相应的运行配置：

![Gradle 运行配置](native-run-config.png){width=500}

> 拥有 Ultimate 订阅的 IntelliJ IDEA 用户可以安装 [Native Debugging Support](https://plugins.jetbrains.com/plugin/12775-native-debugging-support) 插件，该插件允许调试已编译的原生可执行文件，并自动为导入的 Kotlin/Native 项目创建运行配置。

你可以[配置 IntelliJ IDEA](https://www.jetbrains.com/help/idea/compiling-applications.html#auto-build) 以自动构建项目：

1. 转到 **Settings | Build, Execution, Deployment | Compiler**。
2. 在 **Compiler** 页面上，勾选 **Build project automatically**。
3. 应用更改。

现在，当你对类文件进行更改或保存文件（<shortcut>Ctrl + S</shortcut>/<shortcut>Cmd + S</shortcut>）时，IntelliJ IDEA 会自动执行项目的增量构建。

### 更新应用程序 {id="update-the-application"}

让我们为应用程序添加一个功能，以便计算你名字中的字母数：

1. 在 `Main.kt` 文件中添加读取输入代码。使用 [`readln()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.io/readln.html) 函数读取输入值并将其赋值给 `name` 变量：

   ```kotlin
   fun main() {
       // 读取输入值。
       println("Hello, enter your name:")
       val name = readln()
   }
   ```

2. 要使用 Gradle 运行此应用，请在 `build.gradle.kts` 文件中指定 `System.in` 作为要使用的输入，并重新加载 Gradle 更改：

   ```kotlin
   kotlin {
       //...
       targets.withType<KotlinNativeTarget>().configureEach {
           binaries {
               executable {
                   entryPoint = "main"
                   runTaskProvider?.configure { standardInput = System.`in` }
               }
           }
       }
       //...
   }
   ```
   {initial-collapse-state="collapsed" collapsible="true" collapsed-title="runTaskProvider?.configure { standardInput = System.`in` }"}

3. 消除空格并统计字母：

   * 使用 [`replace()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.text/replace.html) 函数移除名字中的空格。
   * 使用作用域函数 [`let`](scope-functions.md#let) 在对象上下文中运行该函数。
   * 使用[字符串模板](strings.md#string-templates)，通过添加美元符号 `$` 并将其括在花括号中——`${it.length}`，将名字长度插入到字符串中。`it` 是 [lambda 形参](coding-conventions.md#lambda-parameters)的默认名称。

   ```kotlin
   fun main() {
       // 读取输入值。
       println("Hello, enter your name:")
       val name = readln()
       // 统计名字中的字母数。
       name.replace(" ", "").let {
           println("Your name contains ${it.length} letters")
       }
   }
   ```

4. 运行应用程序。
5. 输入你的名字并查看结果：

   ![应用程序输出](native-output-gutter-2.png){width=500}

现在，让我们只统计你名字中的不同字母：

1. 在 `Main.kt` 文件中，为 `String` 声明新的[扩展函数](extensions.md#extension-functions) `.countDistinctCharacters()`：

   * 使用 [`.lowercase()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.text/lowercase.html) 函数将名字转换为小写。
   * 使用 [`toList()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.text/to-list.html) 函数将输入字符串转换为字符列表。
   * 使用 [`distinct()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/distinct.html) 函数仅筛选出名字中的不重复字符。
   * 使用 [`count()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/count.html) 函数统计不重复字符的数量。

   ```kotlin
   fun String.countDistinctCharacters() = lowercase().toList().distinct().count()
   ```

2. 使用 `.countDistinctCharacters()` 函数统计你名字中的不重复字母数：

   ```kotlin
   fun String.countDistinctCharacters() = lowercase().toList().distinct().count()

   fun main() {
       // 读取输入值。
       println("Hello, enter your name:")
       val name = readln()
       // 统计名字中的字母数。
       name.replace(" ", "").let {
           println("Your name contains ${it.length} letters")
           // 输出不重复字母的数量。
           println("Your name contains ${it.countDistinctCharacters()} unique letters")
       }
   }
   ```

3. 运行应用程序。
4. 输入你的名字并查看结果：

   ![应用程序输出](native-output-gutter-3.png){width=500}

## 使用 Gradle {id="using-gradle"}

在本节中，你将学习如何使用 [Gradle](https://gradle.org) 手动创建 Kotlin/Native 应用程序。它是 Kotlin/Native 和 Kotlin Multiplatform 项目的默认构建系统，在 Java、Android 以及其他生态系统中也被广泛使用。

构建 Kotlin/Native 项目时，Kotlin Gradle 插件会下载以下工件：

* 主要的 Kotlin/Native 软件包，其中包括 `konanc`、`cinterop` 和 `jsinterop` 等各种工具。默认情况下，Kotlin/Native 软件包作为普通的 Gradle 依赖项从 [Maven Central](https://repo1.maven.org/maven2/org/jetbrains/kotlin/kotlin-native-prebuilt/) 仓库下载。
* `konanc` 本身所需的依赖项，例如 `llvm`。它们使用自定义逻辑从 JetBrains CDN 下载。

你可以在 Gradle 构建脚本的 `repositories {}` 块中更改主要软件包的下载源。

### 创建项目文件 {id="create-project-files"}

1. 首先，安装兼容版本的 [Gradle](https://gradle.org/install/)。请参阅[兼容性表](gradle-configure-project.md#apply-the-plugin)，查看 Kotlin Gradle 插件 (KGP) 与可用 Gradle 版本的兼容性。
2. 创建一个空的项目目录。在其中创建一个包含以下内容的 `build.gradle(.kts)` 文件：

   <tabs group="build-script">
   <tab title="Kotlin" group-key="kotlin">

   ```kotlin
   // build.gradle.kts
   import org.jetbrains.kotlin.gradle.plugin.mpp.KotlinNativeTarget

   plugins {
       kotlin("multiplatform") version "%kotlinVersion%"
   }

   repositories {
       // 指定下载主要软件包的源
       // 默认使用 Maven Central
       mavenCentral()
   }

   kotlin {
       macosArm64()    // 在 macOS 上
       // linuxArm64() // 在 Linux 上
       // mingwX64()   // 在 Windows 上
   
       targets.withType<KotlinNativeTarget>().configureEach {
           binaries {
               executable()
           }
       }
   }

   tasks.withType<Wrapper> {
       gradleVersion = "%gradleVersion%"
       distributionType = Wrapper.DistributionType.BIN
   }
   ```

   </tab>
   <tab title="Groovy" group-key="groovy">

   ```groovy
   // build.gradle
   import org.jetbrains.kotlin.gradle.plugin.mpp.KotlinNativeTarget

   plugins {
       id 'org.jetbrains.kotlin.multiplatform' version '%kotlinVersion%'
   }

   repositories {
       // 指定下载主要软件包的源
       // 默认使用 Maven Central
       mavenCentral()
   }

   kotlin {
       macosArm64()    // 在 macOS 上
       // linuxArm64() // 在 Linux 上
       // mingwX64()   // 在 Windows 上
   
       targets.withType(KotlinNativeTarget).configureEach {
           binaries {
               executable()
           }
       }
   }

   wrapper {
       gradleVersion = '%gradleVersion%'
       distributionType = 'BIN'
   }
   ```

   </tab>
   </tabs>

   你可以使用不同的[目标名称](native-target-support.md)（例如 `macosArm64`、`iosArm64`、`linuxArm64` 和 `mingwX64`）来定义用于编译代码的目标平台。目标名称用于在项目中生成源路径和任务名称。

3. 在项目目录中创建一个空的 `settings.gradle(.kts)` 文件。
4. 创建 `src/nativeMain/kotlin` 目录，并在其中放置一个包含以下内容的 `hello.kt` 文件：

   ```kotlin
   fun main() {
       println("Hello, Kotlin/Native!")
   }
   ```

按照约定，所有源代码都位于 `src/<平台名称>[Main|Test]/kotlin` 目录中，其中 `Main` 用于源代码，`Test` 用于测试。在本例中，`<平台名称>` 为 `native`。

### 构建并运行项目 {id="build-and-run-the-project"}

1. 在项目根目录下，针对你的目标运行 `<yourTargetName>Binaries` 构建命令，例如：

   ```bash
   ./gradlew macosArm64Binaries
   ```

   此命令会创建 `build/bin/<yourTargetName>` 目录，其中包含两个子目录：`debugExecutable` 和 `releaseExecutable`。它们包含相应的二进制文件。

   默认情况下，二进制文件的名称与项目目录相同。

2. 要运行项目，请针对你的目标执行 `build/bin/<yourTargetName>/debugExecutable/<project_name>.kexe` 命令，例如：

   ```bash
   build/bin/macosArm64/DebugExecutable/hello.kexe
   ```

终端将输出 "Hello, Kotlin/Native!"。

### 在 IDE 中打开项目 {id="open-the-project-in-ide"}

现在，你可以在任何支持 Gradle 的 IDE 中打开项目。如果你使用的是 IntelliJ IDEA：

1. 选择 **File** | **Open**。
2. 选择项目目录并点击 **Open**。IntelliJ IDEA 会自动检测它是否为 Kotlin/Native 项目。

如果遇到项目问题，IntelliJ IDEA 会在 **Build** 选项卡中显示错误消息。

## 使用命令行编译器 {id="using-the-command-line-compiler"}

在本节中，你将学习如何使用命令行工具中的 Kotlin 编译器创建 Kotlin/Native 应用程序。

### 下载并安装编译器 {id="download-and-install-the-compiler"}

要安装编译器：

1. 转到 Kotlin 的 [GitHub releases](%kotlinLatestUrl%) 页面并向下滚动到 **Assets** 部分。
2. 查找名称中包含 `kotlin-native` 的文件，并下载适合你的操作系统的文件，例如 `kotlin-native-prebuilt-linux-x86_64-%kotlinVersion%.tar.gz`。
3. 将归档文件解压缩到你选择的目录中。
4. 打开你的 Shell 配置文件，将编译器 `/bin` 目录的路径添加到 `PATH` 环境变量中： 

   ```bash
   export PATH="/<path to the compiler>/kotlin-native/bin:$PATH"
   ```

> 虽然编译器的输出产物没有依赖项或虚拟机要求，但编译器本身需要 Java 1.8 或更高版本的运行时环境。它受 [JDK 8 (JAVA SE 8) 或更高版本](https://www.oracle.com/java/technologies/downloads/)支持。
>
{style="note"}

### 创建程序 {id="create-the-program"}

选择一个工作目录并创建一个名为 `hello.kt` 的文件。使用以下代码更新它：

```kotlin
fun main() {
    println("Hello, Kotlin/Native!")
}
```

### 从控制台编译代码 {id="compile-the-code-from-the-console"}

要编译应用程序，请使用下载的编译器执行以下命令：

```bash
kotlinc-native hello.kt -o hello
```

`-o` 选项的值指定输出文件的名称，因此此调用在 macOS 和 Linux 上生成 `hello.kexe` 二进制文件（在 Windows 上生成 `hello.exe`）。

有关可用选项的完整列表，请参阅 [Kotlin 编译器选项](compiler-reference.md)。

### 运行程序 {id="run-the-program"}

要运行程序，请在命令行工具中导航到包含二进制文件的目录，并运行以下命令：

<tabs>
<tab title="macOS and Linux">

```none
./hello.kexe
```

</tab>
<tab title="Windows">

```none
./hello.exe
```

</tab>
</tabs>

应用程序会将 "Hello, Kotlin/Native" 输出到标准输出。

## 后续步骤 {id="what-s-next"}

* 完成[使用 C 互操作和 libcurl 创建应用](native-app-with-c-and-libcurl.md)教程，了解如何创建原生 HTTP 客户端并与 C 库进行互操作。
* 了解如何[为实际的 Kotlin/Native 项目编写 Gradle 构建脚本](https://kotlinlang.org/docs/multiplatform/multiplatform-dsl-reference.html)。
* 在[文档](gradle.md)中详细了解 Gradle 构建系统。