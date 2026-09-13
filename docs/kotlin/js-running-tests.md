[//]: # (title: 在 Kotlin/JS 中运行测试)

Kotlin 多平台 Gradle 插件允许您通过 Gradle 构建配置指定的各种测试运行程序来运行测试。

在 Kotlin/JS 中运行测试的一般工作流程是：添加测试依赖项、在构建文件中配置测试任务、添加测试并运行它们。

对于浏览器测试，您可以在以下选项之间进行选择：

* [Karma](https://karma-runner.github.io/) 测试运行程序。
* 用于浏览器测试的新 DSL。

> Karma 项目已[弃用](https://github.com/karma-runner/karma#karma)。预计不会再有新功能或错误修复。作为替代方案，请尝试用于浏览器测试的新 Kotlin DSL。
>
> 用于浏览器测试的新 DSL 目前处于[实验性阶段](components-stability.md#stability-levels-explained)。它可能随时发生更改。需要使用 `@OptIn(ExperimentalJsTestDsl::class)` 注解选择加入。
>
{style="warning"}

## 添加测试依赖项 {id="add-test-dependencies"}

创建多平台项目时，您可以通过在 `commonTest` 中使用单个依赖项，为包括 JavaScript 目标在内的所有源集添加测试依赖项：

<tabs group="build-script">
<tab title="Kotlin" group-key="kotlin">

```kotlin
// build.gradle.kts
kotlin {
    sourceSets {
        commonTest.dependencies {
            implementation(kotlin("test")) // 这使得测试注解和功能在 JS 中可用
        }
    }
}
```

</tab>
<tab title="Groovy" group-key="groovy">

```groovy
// build.gradle
kotlin {
    sourceSets {
        commonTest {
            dependencies {
                implementation kotlin("test") // 这使得测试注解和功能在 JS 中可用
            }
        }
    }
}
```

</tab>
</tabs>

## 配置浏览器 {id="configure-browsers"}

您可以在 Kotlin/JS 中针对特定浏览器运行测试。为此，请调整 Gradle 构建文件中的 `browser {}` 配置块中的设置。

默认情况下，该插件使用 [Headless Chrome](https://chromium.googlesource.com/chromium/src/+/lkgr/headless/README.md) 运行浏览器测试。Kotlin 多平台 Gradle 插件默认不捆绑任何浏览器。若要启用其他浏览器，请对 Karma 使用 `testTask {}` 代码块，对用于浏览器测试的新 DSL 使用 `test {}` 代码块。请在此处查看所有可用选项：

<tabs group="js-test-dsl">
<tab title="Karma" group-key="karma">

```kotlin
kotlin {
    js {
        browser {
            testTask {
                useKarma {
                    useIe()
                    useSafari()
                    useFirefox()
                    useChrome()
                    useChromeCanary()
                    useChromeHeadless()
                    usePhantomJS()
                    useOpera()
                }
            }
        }
    }
}
```

使用 Karma 时，您需要在目标系统（本地或 CI 中）上安装所有必需的浏览器。

有关 Karma 功能的更多信息，请参阅[设置 Kotlin/JS 项目](js-project-setup.md#karma)。

</tab>
<tab title="用于浏览器测试的 DSL" group-key="Browser-test-dsl">

```kotlin
import org.jetbrains.kotlin.gradle.ExperimentalJsTestDsl

kotlin {
    js {
        browser {
            @OptIn(ExperimentalJsTestDsl::class)
            test {
                chromium()
                firefox()
                webkit() // Safari 浏览器
            }
        }
    }
}
```

借助用于浏览器测试的新 DSL，Kotlin 多平台 Gradle 插件在首次运行时会通过使用 [`playwright install`](https://playwright.dev/docs/browsers#install-browsers) 命令安装必需的浏览器。随后 Playwright 会管理这些浏览器的位置，而不会使用本地安装的浏览器。

有关用于浏览器测试的新 DSL 中可用的其他设置，请参阅[高级配置](#advanced-configuration)。

</tab>
</tabs>

## 添加测试 {id="add-a-test"}

要检查测试是否正确执行，请创建包含以下内容的文件 `src/jsTest/kotlin/AppTest.kt`：

```kotlin
import kotlin.test.Test
import kotlin.test.assertEquals

@Test
fun thingsShouldWork() {
    assertEquals(listOf(3,2,1), listOf(1,2,3).reversed())
}

@Test
fun thingsShouldBreak() {
    assertEquals(listOf(1,2,3), listOf(1,2,3).reversed())
}
```

## 运行测试 {id="run-tests"}

要在浏览器中运行测试，请执行 `jsBrowserTest` 任务，或使用 IntelliJ IDEA 中的装订区域图标执行全部或单个测试：

![Gradle browserTest 任务](browsertest-task.png){width=700}

或者，如果您想在命令行中运行测试，请使用 Gradle wrapper：

```bash
./gradlew jsBrowserTest
```

在 IntelliJ IDEA 中运行测试后，**运行** 工具窗口将显示测试结果。您可以点击失败的测试以查看其堆栈跟踪，并通过双击导航到对应的测试实现。

![IntelliJ IDEA 中的测试结果](test-stacktrace-ide.png){width=700}

每次测试运行后，无论您以何种方式执行测试，都可以在 `build/reports/tests/jsBrowserTest/index.html` 中找到由 Gradle 生成的格式规范的测试报告。在浏览器中打开此文件即可查看测试结果的另一份概览：

![Gradle 测试摘要](test-summary.png){width=700}

如果您使用的是上面代码段中所示的示例测试集，则一个测试通过，一个测试失败，从而得出 50% 的成功率。要获取有关单个测试用例的更多信息，请使用提供的链接：

![Gradle 摘要中失败测试的堆栈跟踪](failed-test.png){width=700}

## 高级配置 {id="advanced-configuration"}
<primary-label ref="experimental-opt-in"/>

> 本节仅适用于用于浏览器测试的全新实验性 DSL。
>
{style="note"}

用于浏览器测试的新 DSL 旨在保持极简且与工具无关。当前的实现包括：

* [Playwright](https://playwright.dev/) 作为浏览器驱动程序和分发管理器，支持 Chromium、Firefox 和 WebKit (Safari) 浏览器引擎。
* [Mocha](https://mochajs.org/) 作为测试运行程序。
* [webpack](https://webpack.js.org/) 作为打包器（将在[未来版本](https://youtrack.jetbrains.com/issue/KT-48308/)中替换为 [Vite](https://vite.dev/)）。

该 DSL 将超时、无头模式以及针对每个运行程序的选项公开为 Gradle 属性，因此您可以在运行程序之间共享默认值、为特定浏览器重写这些值，并使用 provider 延迟计算值：

```kotlin
import org.jetbrains.kotlin.gradle.ExperimentalJsTestDsl
import kotlin.time.Duration.Companion.seconds

kotlin {
    js {
        browser {
            @OptIn(ExperimentalJsTestDsl::class)
            test {
                // 使用 kotlin.Duration 为所有运行程序配置默认超时
                timeout = 30.seconds

                // 使用 Gradle provider 配置无头模式
                headless = providers
                    .environmentVariable("IS_IN_CI")
                    .map { it.toBoolean() }
                    .orElse(false)

                // 启用并使用自定义名称配置 Chromium 运行程序
                chromium("chromium-no-webgl2") {
                    // 重写此运行程序的默认超时
                    timeout = 10.seconds

                    // Chromium 特定的额外启动参数
                    launchArgs.add("--disable-webgl2")
                }

                // 启用 Firefox 运行程序
                firefox()

                // 启用并配置 WebKit 运行程序
                webkit("safari") {
                    timeout = 35.seconds
                }
            }
        }
    }
}
```

您可以直接在 `test {}` 块中为所有测试运行程序设置选项。若要为特定运行程序重写这些通用选项，请为其使用自定义名称，并在运行程序块中提供不同的值。在此示例中，Chromium 和 WebKit (Safari) 浏览器分别使用 10 秒和 35 秒的超时，而 Firefox 使用通用的 30 秒超时。

每个运行程序都以其自己的名称进行注册，因此测试报告会告知您特定结果来自哪个浏览器。

## 针对插件作者的配置 {id="configuration-for-plugin-authors"}
<primary-label ref="experimental-opt-in"/>

> 本节仅适用于用于浏览器测试的全新实验性 DSL。
>
{style="note"}

如果您在 Kotlin 多平台 Gradle 插件的基础上开发 Gradle 插件，用于浏览器测试的新 DSL 还允许您访问浏览器运行程序以及生成的测试 bundle 的位置。

Kotlin 使用默认的[测试运行程序页面](https://github.com/Kotlin/kotlin-web-helpers/blob/main/static/test.html)生成用于运行浏览器测试的测试 bundle。您可以通过在 `testsLocation` 属性中指向不同的位置来替换它：

```kotlin
kotlin {
    js {
        browser {
            @OptIn(ExperimentalJsTestDsl::class)
            test {
                // 实现 customJsTestsLocation 以修改或替换默认的 JS 测试 bundle
                @OptIn(DelicateKotlinGradlePluginApi::class)
                testsLocation = customJsTestsLocation(extendFrom = defaultTestsLocationProvider)

                chromium()
            }
        }
    }
}
```

您的自定义测试打包工具可以包含您自己的开发服务器、打包器或测试运行程序。`defaultTestsLocationProvider` 属性使您可以访问默认位置，因此您可以基于它进行构建，而无需从头实现所有内容。

每个测试位置都通过 `KotlinJsTestsLocation` 接口公开包含生成的测试 bundle 的目录 (`bundleLocation`)、测试页面的名称 (`testHtmlFileName`) 以及浏览器打开的 URL (`url`)。

通过访问这些 API，您可以：

* 自定义浏览器打开的 URL。每个浏览器运行程序都有其自己的测试位置，因此您可以在 `test {}` 块中为所有运行程序重写该位置，也可以为特定运行程序重写。
* 重写 bundle 位置本身，例如向 bundle 添加额外的文件。
* 对生成的测试 bundle 进行后处理。注册您自己的任务，并在浏览器打开文件之前对其进行修改，例如将您自己的配置注入到 `test.html` 中。

在使用这些 API 构建插件时，请记住以下限制：

* 配置 `subtarget.test` 会启用新的测试流水线并禁用 Karma。目前没有可靠的方法来检测用户选择了哪条流水线。
* 目前没有可靠的方法可以延迟配置特定的浏览器运行程序，因此配置必须在 `afterEvaluate` 中进行。请考虑要求用户显式设置测试位置，或者改为公开类似 `myPluginChromium()` 的装饰函数。

## 提供反馈 {id="leave-feedback"}

用于浏览器测试的新 DSL 正在积极开发中。计划在随后的 Kotlin 版本中推出调试等新功能。

欢迎在 [YouTrack](https://youtrack.jetbrains.com/issue/KT-66897) 或 [#javascript](https://kotlinlang.slack.com/archives/C0B8L3U69) Slack 频道中向我们提供反馈。