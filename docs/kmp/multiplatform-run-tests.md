[//]: # (title: 测试多平台应用 − 教程)

<secondary-label ref="IntelliJ IDEA"/>
<secondary-label ref="Android Studio"/>

<tldr>
<p>本教程使用 IntelliJ IDEA，但您也可以在 Android Studio 中进行操作——两款 IDE 具有相同的核心功能和 Kotlin Multiplatform 支持。</p>
</tldr>

在本教程中，您将学习如何在 Kotlin Multiplatform 应用程序中创建、配置和运行测试。

多平台项目的测试可以分为两类：

* 通用代码测试。此类测试可以使用任何受支持的框架在任何平台上运行。
* 平台特定代码测试。这对于测试平台特定逻辑至关重要。它们使用平台特定的框架，并可以受益于其附加功能，例如更丰富的 API 和更广泛的断言。

多平台项目对这两类测试均提供支持。本教程将首先向您展示如何在简单的 Kotlin Multiplatform 项目中设置、创建并运行通用代码的单元测试。随后，您将处理一个更复杂的示例，该示例需要针对通用代码和平台特定代码同时编写测试。

> 本教程假定您已熟悉：
> * Kotlin Multiplatform 项目的布局。如果尚未了解，请在开始前完成[本教程](multiplatform-upgrade-app.md)。
> * 常用单元测试框架（如 [JUnit](https://junit.org/junit5/)）的基础知识。
>
{style="tip"}

## 测试简单的多平台项目 {id="test-a-simple-multiplatform-project"}

### 创建项目 {id="create-a-project"}

1. 在[快速入门指南](quickstart.md)中，按照说明[设置用于 Kotlin Multiplatform 开发的环境](quickstart.md#set-up-the-environment)。
2. 在 IntelliJ IDEA 中，选择 **File** | **New** | **Project**。
3. 在左侧面板中，选择 **Kotlin Multiplatform**。
4. 在 **New Project** 窗口中指定以下字段：

    * **Name**：KMP testing
    * **Project ID**：kmp.project.testing

5. 选择 **Android** 目标。
   如果您使用的是 Mac，也请选择 **iOS**。请务必选择 **Do not share UI** 选项。
6. 取消选中 **Include tests** 并点击 **Create**。

   ![创建简单的多平台项目](create-test-multiplatform-project.png){width=800}

### 编写代码 {id="write-code"}

在 `sharedLogic/src/commonMain/kotlin` 目录下，创建一个新的 `common.example.search` 软件包。
在此软件包中，创建包含以下函数的 Kotlin 文件 `Grep.kt`：

```kotlin
fun grep(lines: List<String>, pattern: String, action: (String) -> Unit) {
    val regex = pattern.toRegex()
    lines.filter(regex::containsMatchIn)
        .forEach(action)
}
```

该函数的设计类似于 [UNIX `grep` 命令](https://en.wikipedia.org/wiki/Grep)。在这里，该函数接受多行文本、一个用作正则表达式的模式，以及一个每当某行匹配该模式时调用的函数。

### 添加测试 {id="add-tests"}

现在，我们来测试通用代码。关键部分是用于通用测试的源集，它将 [`kotlin.test`](https://kotlinlang.org/api/latest/kotlin.test/) API 库作为依赖项。

1. 在 `sharedLogic/build.gradle.kts` 文件中，检查是否存在对 `kotlin.test` 库的依赖项：

    ```kotlin
   sourceSets {
       //...
       commonTest.dependencies {
           implementation(libs.kotlin.test)
       }
   }
   ```
   
2. `commonTest` 源集用于存储所有通用测试。您需要在项目中创建一个同名目录：

    1. 右键点击 `sharedLogic/src` 目录并选择 **New | Directory**。IDE 将显示选项列表。
    2. 开始键入 `commonTest/kotlin` 路径以缩小选择范围，然后从列表中选择该项：

      ![创建通用测试目录](create-common-test-dir.png){width=350}

3. 在 `commonTest/kotlin` 目录下，创建一个新的 `common.example.search` 软件包。
4. 在此软件包中，创建 `Grep.kt` 文件并使用以下单元测试进行更新：

    ```kotlin
    import kotlin.test.Test
    import kotlin.test.assertContains
    import kotlin.test.assertEquals
    
    class GrepTest {
        companion object {
            val sampleData = listOf(
                "123 abc",
                "abc 123",
                "123 ABC",
                "ABC 123"
            )
        }
    
        @Test
        fun shouldFindMatches() {
            val results = mutableListOf<String>()
            grep(sampleData, "[a-z]+") {
                results.add(it)
            }
    
            assertEquals(2, results.size)
            for (result in results) {
                assertContains(result, "abc")
            }
        }
    }
    ```

如您所见，导入的注解和断言既不针对特定平台，也不针对特定框架。
稍后运行此测试时，平台特定的框架将提供测试运行程序。

#### 探索 `kotlin.test` API {initial-collapse-state="collapsed" collapsible="true" id="explore-the-kotlin-test-api"}

[`kotlin.test`](https://kotlinlang.org/api/latest/kotlin.test/) 库提供了与平台无关的注解和断言，供您在测试中使用。诸如 `Test` 之类的注解会映射到所选框架提供的注解或其最接近的对等项。

断言通过 [`Asserter` 接口](https://kotlinlang.org/api/latest/kotlin.test/kotlin.test/-asserter/)的实现来执行。该接口定义了测试中通常执行的各种检查。该 API 拥有一个默认实现，但通常情况下您将使用特定于框架的实现。

例如，JVM 上支持 JUnit 4、JUnit 5 和 TestNG 框架。在 Android 上，调用 `assertEquals()` 可能会导致调用 `asserter.assertEquals()`，其中 `asserter` 对象是 `JUnit4Asserter` 的实例。而在 iOS 上，`Asserter` 类型的默认实现会与 Kotlin/Native 测试运行程序结合使用。

### 运行测试 {id="run-tests"}

您可以通过以下方式执行测试：

* 使用装订区域中的 **Run** 图标运行 `shouldFindMatches()` 测试函数。
* 使用测试文件的上下文菜单运行该测试文件。
* 使用装订区域中的 **Run** 图标运行 `GrepTest` 测试类。

还可以使用便捷的 <shortcut>⌃ ⇧ F10</shortcut>/<shortcut>Ctrl+Shift+F10</shortcut> 快捷键。
无论选择哪种方式，您都会看到用于运行测试的目标列表：

![运行测试任务](run-test-tasks.png){width=300}

对于 `android` 选项，测试使用 JUnit 4 运行。对于 `iosSimulatorArm64`，Kotlin 编译器会检测测试注解并创建一个*测试二进制文件*，该文件由 Kotlin/Native 自带的测试运行程序执行。

以下是成功运行测试所生成的输出示例：

![测试输出](run-test-results.png){width=700}

## 处理更复杂的项目 {id="work-with-more-complex-projects"}

### 为通用代码编写测试 {id="write-tests-for-common-code"}

您已经通过 `grep()` 函数为通用代码创建了测试。现在，让我们考虑使用 `CurrentRuntime` 类进行更高级的通用代码测试。该类包含执行代码所在平台的详细信息。
例如，对于在本地 JVM 上运行的 Android 单元测试，它可能包含值“OpenJDK”和“17.0”。

应使用平台的名称和版本字符串来创建 `CurrentRuntime` 的实例，其中版本是可选的。当存在版本时，如果可用，您只需提取字符串开头的数字部分。

1. 在 `commonMain/kotlin` 目录下，创建一个新的 `org.kmp.testing` 软件包。
2. 在此软件包中，创建 `CurrentRuntime.kt` 文件并使用以下实现进行更新：

    ```kotlin
    class CurrentRuntime(val name: String, rawVersion: String?) {
        companion object {
            val versionRegex = Regex("^[0-9]+(\\.[0-9]+)?")
        }
    
        val version = parseVersion(rawVersion)
    
        override fun toString() = "$name version $version"
    
        private fun parseVersion(rawVersion: String?): String {
            val result = rawVersion?.let { versionRegex.find(it) }
            return result?.value ?: "unknown"
        }
    }
    ```

3. 在 `commonTest/kotlin` 目录下，创建一个新的 `org.kmp.testing` 软件包。
4. 在此软件包中，创建 `CurrentRuntimeTest.kt` 文件并使用以下与平台及框架无关的测试进行更新：

    ```kotlin
    import kotlin.test.Test
    import kotlin.test.assertEquals

    class CurrentRuntimeTest {
        @Test
        fun shouldDisplayDetails() {
            val runtime = CurrentRuntime("MyRuntime", "1.1")
            assertEquals("MyRuntime version 1.1", runtime.toString())
        }
    
        @Test
        fun shouldHandleNullVersion() {
            val runtime = CurrentRuntime("MyRuntime", null)
            assertEquals("MyRuntime version unknown", runtime.toString())
        }
    
        @Test
        fun shouldParseNumberFromVersionString() {
            val runtime = CurrentRuntime("MyRuntime", "1.2 Alpha Experimental")
            assertEquals("MyRuntime version 1.2", runtime.toString())
        }
    
        @Test
        fun shouldHandleMissingVersion() {
            val runtime = CurrentRuntime("MyRuntime", "Alpha Experimental")
            assertEquals("MyRuntime version unknown", runtime.toString())
        }
    }
    ```

您可以使用 [IDE 中提供的](#run-tests)任何方式运行此测试。

### 添加平台特定测试 {id="add-platform-specific-tests"}

> 此处为了简明扼要，使用了 [expect 与 actual 声明机制](multiplatform-connect-to-apis.md)。在更复杂的代码中，更好的方法是使用接口和工厂函数。
>
{style="note"}

现在您已经具备了编写通用代码测试的经验，接下来我们来探索为 Android 和 iOS 编写平台特定测试。

为了创建 `CurrentRuntime` 的实例，请在通用的 `CurrentRuntime.kt` 文件中按如下方式声明一个函数：

```kotlin
expect fun determineCurrentRuntime(): CurrentRuntime
```

该函数应针对每个受支持的平台提供单独的实现。否则，构建将失败。
除了在每个平台上实现此函数之外，您还应该提供测试。让我们为 Android 和 iOS 创建测试。

#### 针对 Android {id="for-android"}

1. 在 `androidMain/kotlin` 目录下，创建一个新的 `org.kmp.testing` 软件包。
2. 在此软件包中，创建 `AndroidRuntime.kt` 文件并使用 expected `determineCurrentRuntime()` 函数的 actual 实现进行更新：

    ```kotlin
    actual fun determineCurrentRuntime(): CurrentRuntime {
        val name = System.getProperty("java.vm.name") ?: "Android"
    
        val version = System.getProperty("java.version")
    
        return CurrentRuntime(name, version)
    }
    ```

3. 在 `sharedLogic/src` 目录中创建用于测试的目录：
 
   1. 右键点击 `sharedLogic/src` 目录并选择 **New | Directory**。IDE 将显示选项列表。
   2. 开始键入 `androidHostTest/kotlin` 路径以缩小选择范围，然后从列表中选择该项：

      ![创建 Android 测试目录](create-android-test-dir.png){width=350}

4. 在 `androidHostTest/kotlin` 目录下，创建一个新的 `org.kmp.testing` 软件包。
5. 在此软件包中，创建 `AndroidRuntimeTest.kt` 文件并使用以下 Android 测试进行更新。
   为了使测试通过，请务必设置运行时的实际名称和版本（不过观察测试如何失败也很有帮助）：

    ```kotlin
    import kotlin.test.Test
    import kotlin.test.assertContains
    import kotlin.test.assertEquals
    
    class AndroidRuntimeTest {
        @Test
        fun shouldDetectAndroid() {
            val runtime = determineCurrentRuntime()
            assertContains(runtime.name, "OpenJDK")
            assertEquals(runtime.version, "21.0")
        }
    }
    ```
   
Android 特定的测试在本地 JVM 上运行可能看起来有些奇怪。这是因为这些测试作为本地单元测试在当前计算机上运行。如 [Android Studio 文档](https://developer.android.com/studio/test/test-in-android-studio)中所述，这些测试不同于在设备或模拟器上运行的插桩测试。

您可以向项目中添加其他类型的测试。若要了解插桩测试，请参阅这份 [Touchlab 指南](https://touchlab.co/understanding-and-configuring-your-kmm-test-suite/)。

#### 针对 iOS {id="for-ios"}

1. 在 `iosMain/kotlin` 目录下，创建一个新的 `org.kmp.testing` 目录。
2. 在此目录中，创建 `IOSRuntime.kt` 文件并使用 expected `determineCurrentRuntime()` 函数的 actual 实现进行更新：

    ```kotlin
    import kotlin.experimental.ExperimentalNativeApi
    import kotlin.native.Platform
    
    @OptIn(ExperimentalNativeApi::class)
    actual fun determineCurrentRuntime(): CurrentRuntime {
        val name = Platform.osFamily.name.lowercase()
        return CurrentRuntime(name, null)
    }
    ```

3. 在 `sharedLogic/src` 目录下创建一个新目录：
   
   1. 右键点击 `sharedLogic/src` 目录并选择 **New | Directory**。IDE 将显示选项列表。
   2. 开始键入 `iosTest/kotlin` 路径以缩小选择范围，然后从列表中选择该项：

4. 在 `iosTest/kotlin` 目录下，创建一个新的 `org.kmp.testing` 目录。
5. 在此目录中，创建 `IOSRuntimeTest.kt` 文件并使用以下 iOS 测试进行更新：

    ```kotlin 
    import kotlin.test.Test
    import kotlin.test.assertEquals
    
    class IOSRuntimeTest {
        @Test
        fun shouldDetectOS() {
            val runtime = determineCurrentRuntime()
            assertEquals(runtime.name, "ios")
            assertEquals(runtime.version, "unknown")
        }
    }
    ```

### 运行多个测试并分析报告 {id="run-multiple-tests-and-analyze-reports"}

至此，您已经拥有了通用、Android 和 iOS 实现的代码及其测试。
项目中的目录结构应类似于：

![整个项目结构](code-and-test-structure.png){width=300}

您可以从上下文菜单运行单个测试或使用快捷键。另一个选项是使用 Gradle 任务。例如，如果您运行 `allTests` Gradle 任务，项目中的每个测试都将使用相应的测试运行程序运行：

![Gradle 测试任务](gradle-alltests.png){width=700}

运行测试时，除了 IDE 中的输出外，还会生成 HTML 报告。您可以在 `sharedLogic/build/reports/tests` 目录中找到它们：

![多平台测试的 HTML 报告](shared-tests-folder-reports.png){width=300}

运行 `allTests` 任务并检查其生成的报告：

* `allTests/index.html` 文件包含通用测试和 iOS 测试的合并报告（iOS 测试依赖于通用测试，并在其之后运行）。
* `testDebugUnitTest` 和 `testReleaseUnitTest` 文件夹包含两个默认 Android 构建变体（flavor）的报告。（目前，Android 测试报告不会自动与 `allTests` 报告合并。）

![多平台测试的 HTML 报告](multiplatform-test-report.png){width=700}

## 在多平台项目中使用测试的规则 {id="rules-for-using-tests-in-multiplatform-projects"}

现在，您已经在 Kotlin Multiplatform 应用程序中创建、配置并执行了测试。
在未来的项目中处理测试时，请记住：

* 为通用代码编写测试时，仅使用多平台库，如 [kotlin.test](https://kotlinlang.org/api/latest/kotlin.test/)。请将依赖项添加到 `commonTest` 源集中。
* 来自 `kotlin.test` API 的 `Asserter` 类型应仅间接使用。虽然 `Asserter` 实例是可见的，但您无需在测试中使用它。
* 始终保持在测试库 API 范围内。幸运的是，编译器和 IDE 会阻止您使用特定于框架的功能。
* 尽管使用哪个框架在 `commonTest` 中运行测试并不重要，但最好使用您打算使用的各个框架来运行测试，以检查开发环境是否已正确设置。
* 考虑物理特性的差异。例如，滚动惯性和摩擦力数值因平台和设备而异，因此设置相同的滚动速度可能会导致不同的滚动位置。请务必在目标平台上测试组件，以确保符合预期行为。
* 为平台特定代码编写测试时，您可以使用相应框架的功能，例如注解和扩展。
* 您既可以从 IDE 运行测试，也可以使用 Gradle 任务运行测试。
* 运行测试时，会自动生成 HTML 测试报告。

## 后续步骤 {id="what-s-next"}

* 在[了解多平台项目结构](multiplatform-discover-project.md)中探索多平台项目的布局。
* [TestBalloon](https://infix-de.github.io/testBalloon/latest/) 是一个多平台测试框架，支持所有 Kotlin Multiplatform 目标以及 [Kotlin Power Assert](https://kotlinlang.org/docs/power-assert.html) 和其他断言库。
* [Kotest](https://kotest.io/) 是另一个多平台测试框架，允许以多种风格编写测试，并支持对常规测试的补充方法。其中包括[数据驱动型](https://kotest.io/docs/framework/datatesting/data-driven-testing.html)和[基于属性的](https://kotest.io/docs/proptest/property-based-testing.html)测试。