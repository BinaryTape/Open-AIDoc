[//]: # (title: 设置 Kotlin/JS 项目)

Kotlin/JS 项目使用 Gradle 作为构建系统。为了让开发者能够轻松管理其 Kotlin/JS 项目，我们提供了 `kotlin.multiplatform` Gradle 插件，该插件提供了项目配置工具以及用于自动化 JavaScript 开发典型例程的帮助程序任务。

该插件在后台使用 [npm](https://www.npmjs.com/) 或 [Yarn](https://yarnpkg.com/) 软件包管理器下载 npm 依赖项，并使用 [webpack](https://webpack.js.org/) 从 Kotlin 项目构建 JavaScript bundle。依赖项管理和配置调整在很大程度上可直接在 Gradle 构建文件中完成，并可选择覆盖自动生成的配置以实现完全控制。

你可以通过在 `build.gradle(.kts)` 文件中手动将 `org.jetbrains.kotlin.multiplatform` 插件应用到 Gradle 项目：

<tabs group="build-script">
<tab title="Kotlin" group-key="kotlin">

```kotlin
plugins {
    kotlin("multiplatform") version "%kotlinVersion%"
}
```

</tab>
<tab title="Groovy" group-key="groovy">

```groovy
plugins {
    id 'org.jetbrains.kotlin.multiplatform' version '%kotlinVersion%'
}
```

</tab>
</tabs>

Kotlin Multiplatform Gradle 插件允许你在构建脚本的 `kotlin {}` 块中管理项目的各个方面：

```groovy
kotlin {
    // ...
}
```

在 `kotlin {}` 块内，你可以管理以下方面：

* [目标执行环境](#execution-environments)：浏览器或 Node.js 
* [设置 ECMAScript 目标](#set-an-ecmascript-target)：ES5、ES2015 或 ES2020
* [配置输出粒度](#configure-output-granularity)
* [生成 TypeScript 声明文件](#generation-of-typescript-declaration-files-d-ts)
* [项目依赖项](#dependencies)：Maven 与 npm
* [运行配置](#run-task)
* [测试配置](#test-task)
* 针对浏览器项目的[打包](#webpack-bundling)与 [CSS 支持](#css)
* [目标目录](#distribution-target-directory)与[模块名称](#module-name)
* [项目的 `package.json` 文件](#package-json-customization)

## 执行环境 {id="execution-environments"}

Kotlin/JS 项目可以面向两种不同的执行环境：

* 浏览器：用于在浏览器中执行客户端脚本
* [Node.js](https://nodejs.org/)：用于在浏览器之外运行 JavaScript 代码，例如用于服务器端脚本。

要为 Kotlin/JS 项目定义目标执行环境，请添加内部包含 `browser {}` 或 `nodejs {}` 的 `js {}` 块：

```kotlin
kotlin {
    js {
        browser {
        }
        binaries.executable()
    }
}
```

指令 `binaries.executable()` 会显式指示 Kotlin 编译器生成可执行的 `.js` 文件。
如果省略 `binaries.executable()`，编译器将仅生成 Kotlin 内部库文件，这些文件可以被其他项目使用，但不能单独运行。

> 这通常比创建可执行文件更快，
> 在处理项目的非叶子模块时，这可以作为一种可能的优化手段。
>
{style="tip"}

Kotlin Multiplatform 插件会自动配置用于与所选环境配合工作的任务。
这包括下载并安装运行和测试应用程序所需的环境与依赖项。
这使得开发者无需额外配置即可构建、运行和测试简单项目。此外，也可以选择使用现有的安装。了解如何[使用预安装的 Node.js](#use-pre-installed-node-js)。

## 设置 ECMAScript 目标 {id="set-an-ecmascript-target"}

Kotlin/JS 可以针对 ECMAScript 标准的 ES5、ES2015 和 ES2020 版本生成 JavaScript。请选择目标环境所支持的最新版本：

* `es5` 提供与较旧 JavaScript 环境的兼容性，也是默认目标。
* `es2015` 启用对 ES2015 功能的支持，包括：
    * 模块（Modules）：简化代码库并提高可维护性。
    * 类（Classes）：支持融入 OOP 原则，生成更整洁、更直观的代码。
    * 生成器（Generators）：用于编译[挂起函数](https://kotlinlang.org/docs/composing-suspending-functions.html)，可改善最终 bundle 大小并有助于调试。
    * [JavaScript 代码内联](js-interop.md#inline-javascript)。
* `es2020` 包含所有支持的 ES2015 功能，并允许编译器在生成的 JavaScript 代码中使用 ECMAScript 2020 功能。例如，它会将 Kotlin 的 `Long` 值编译为 JavaScript 的 `BigInt` 值。

要配置 ECMAScript 目标，请在 `build.gradle(.kts)` 文件中设置 `target` 属性。例如，要面向 ES2020：

```kotlin
tasks.withType<KotlinJsCompile>().configureEach {
    compilerOptions {
        target = "es2020"
    }
}
```

详细了解 [ES5](https://262.ecma-international.org/5.1/)、[ES2015](https://262.ecma-international.org/6.0/) 和 [ES2020](https://262.ecma-international.org/11.0/) 标准。

## 配置输出粒度 {id="configure-output-granularity"}

你可以选择编译器在项目中输出 `.js` 文件的方式：

* **每模块一个（One per module）**。默认情况下，JS 编译器会将每个项目模块单独输出为一个独立的 `.js` 文件作为编译结果。
* **每项目一个（One per project）**。你可以通过在 `gradle.properties` 文件中添加以下代码行，将整个项目编译为单个 `.js` 文件：

  ```properties
  # 默认值：per-module
  kotlin.js.ir.output.granularity=whole-program
  ```

* **每文件一个（One per file）**。你可以设置更细粒度的输出，为每个 Kotlin 文件生成一个（如果该文件包含导出的声明，则生成两个）JavaScript 文件。要启用逐文件编译模式：
  1. 将 `es2015` 或 `es2020` 设置为[编译目标](#set-an-ecmascript-target)，以在项目中支持 ES2015 功能。
  2. 在 `gradle.properties` 文件中添加以下代码行：
  
     ```properties
     # 默认值：per-module
     kotlin.js.ir.output.granularity=per-file
     ```

## 生成 TypeScript 声明文件 (`d.ts`) {id="generation-of-typescript-declaration-files-d-ts"}
<primary-label ref="experimental-opt-in"/>

Kotlin/JS 编译器可以根据你的 Kotlin 代码生成 TypeScript 定义。在开发混合应用程序时，JavaScript 工具和 IDE 可以使用这些定义来：

* 提供自动补全
* 支持静态分析器
* 简化在 JavaScript 和 TypeScript 项目中添加 Kotlin 代码的过程

生成 TypeScript 定义对于[共享业务逻辑用例](js-overview.md#use-cases-for-kotlin-js)尤其有价值。

编译器会收集标记有 [`@JsExport`](js-to-kotlin-interop.md#jsexport-annotation) 的所有顶层声明，并在 `.d.ts` 文件中自动生成 TypeScript 定义。

要生成 TypeScript 定义，请在 Gradle 构建文件中进行显式配置。
在 `build.gradle.kts` 文件的 [`js {}` 块](js-project-setup.md#execution-environments)中添加 `generateTypeScriptDefinitions()` 函数：

```kotlin
kotlin {
    js {
        binaries.executable()
        browser {
        }
        generateTypeScriptDefinitions()
    }
}
```

你可以在 `build/js/packages/<package_name>/kotlin` 目录下找到这些定义，它们与对应的未经 webpack 打包的 JavaScript 代码放在一起。

## 依赖项 {id="dependencies"}

要声明依赖项，请在 `build.gradle(.kts)` 文件的 `jsMain` 源集内使用 `dependencies {}` 块：

<tabs group="build-script">
<tab title="Kotlin" group-key="kotlin">

```kotlin
kotlin {
    sourceSets {
        jsMain {
            dependencies {
                implementation("org.example.myproject:1.1.0")
            }
        }
    }
}
```

</tab>
<tab title="Groovy" group-key="groovy">

```groovy
kotlin {
    sourceSets {
        jsMain {
            dependencies {
                implementation 'org.example.myproject:1.1.0'
            }
        }
    }
}
```

</tab>
</tabs>

只有包含 Kotlin/JS 构建工件的库才能用作依赖项。要解析依赖项，请在 `build.gradle(.kts)` 文件的 `repositories {}` 块中声明 Gradle 应当查找这些依赖项的仓库。例如：

```kotlin
repositories {
    mavenCentral()
}
```

如果你添加的库依赖于 [npm 中的软件包](#npm-dependencies)，Gradle 也会自动解析这些传递依赖项。

### Kotlin 标准库 {id="kotlin-standard-libraries"}

对[标准库](https://kotlinlang.org/api/latest/jvm/stdlib/index.html)的依赖项会自动添加。标准库的版本与 Kotlin Multiplatform 插件的版本相同。

对于多平台测试，可以使用 [`kotlin.test`](https://kotlinlang.org/api/latest/kotlin.test/) API。创建多平台项目时，你可以通过在 `commonTest` 中使用单个依赖项，为所有源集添加测试依赖项：

<tabs group="build-script">
<tab title="Kotlin" group-key="kotlin">

```kotlin
kotlin {
    sourceSets {
        commonTest.dependencies {
            implementation(kotlin("test")) // 自动引入所有平台依赖项
        }
    }
}
```

</tab>
<tab title="Groovy" group-key="groovy">

```groovy
kotlin {
    sourceSets {
        commonTest {
            dependencies {
                implementation kotlin("test") // 自动引入所有平台依赖项
            }
        }
    }
}
```

</tab>
</tabs>

### npm 依赖项 {id="npm-dependencies"}

在 JavaScript 领域，最常用的依赖项管理方式是 [npm](https://www.npmjs.com/)。
它提供了最大的 JavaScript 模块公共仓库。

Kotlin Multiplatform Gradle 插件允许你在 Gradle 构建脚本中声明 npm 依赖项，方式与声明其他依赖项完全一致。

要声明 npm 依赖项，请在依赖项声明中将名称和版本传递给 `npm()` 函数。
你还可以根据 [npm 的 semver 语法](https://docs.npmjs.com/about-semantic-versioning)指定一个或多个版本范围。

<tabs group="build-script">
<tab title="Kotlin" group-key="kotlin">

```kotlin
kotlin {
    sourceSets {
        jsMain {
            dependencies {
                implementation(npm("core-js", "^3.38.1"))
            }
        }
    }
}
```

</tab>
<tab title="Groovy" group-key="groovy">

```groovy
kotlin {
    sourceSets {
        jsMain {
            dependencies {
                implementation npm('core-js', '^3.38.1')
            }
        }
    }
}
```

</tab>
</tabs>

默认情况下，该插件使用 [Yarn](https://yarnpkg.com/lang/en/) 软件包管理器的独立实例来下载和安装 npm 依赖项。它无需额外配置即可开箱即用，但你也可以[根据特定需求对其进行调整](#yarn)。

你还可以直接改用 [npm](https://www.npmjs.com/) 软件包管理器来处理 npm 依赖项。
要在 `gradle.properties` 文件中使用 npm 作为软件包管理器，请设置以下属性：

```none
kotlin.js.yarn=false
```

除常规依赖项外，还可以在 Gradle DSL 中使用另外三种类型的依赖项。
要详细了解每种依赖项的最佳使用时机，请查看 npm 链接的官方文档：

* [devDependencies](https://docs.npmjs.com/files/package.json#devdependencies)，通过 `devNpm(...)`
* [optionalDependencies](https://docs.npmjs.com/files/package.json#optionaldependencies)，通过 `optionalNpm(...)`
* [peerDependencies](https://docs.npmjs.com/files/package.json#peerdependencies)，通过 `peerNpm(...)`

安装 npm 依赖项后，你可以按照[从 Kotlin 调用 JS](js-interop.md) 中的说明在代码中使用其 API。

## run 任务 {id="run-task"}

Kotlin Multiplatform Gradle 插件提供了一个 `jsBrowserDevelopmentRun` 任务，使你无需额外配置即可运行纯 Kotlin/JS 项目。

对于在浏览器中运行 Kotlin/JS 项目，该任务是 `browserDevelopmentRun` 任务的别名（该任务在 Kotlin 多平台项目中也可用）。它使用 [webpack-dev-server](https://webpack.js.org/configuration/dev-server/) 来提供 JavaScript 工件服务。
如果你想自定义 `webpack-dev-server` 使用的配置（例如调整服务器运行的端口），请使用 [webpack 配置文件](#webpack-bundling)。

对于面向 Node.js 运行的 Kotlin/JS 项目，请使用作为 `nodeRun` 任务别名的 `jsNodeDevelopmentRun` 任务。

要运行项目，请执行标准生命周期任务 `jsBrowserDevelopmentRun`，或其对应的别名：

```bash
./gradlew jsBrowserDevelopmentRun
```

要在修改源文件后自动触发应用程序重新构建，请使用 Gradle 的[持续构建](https://docs.gradle.org/current/userguide/command_line_interface.html#sec:continuous_build)功能：

```bash
./gradlew jsBrowserDevelopmentRun --continuous
```

或者

```bash
./gradlew jsBrowserDevelopmentRun -t
```

项目构建成功后，`webpack-dev-server` 将自动刷新浏览器页面。

## test 任务 {id="test-task"}

Kotlin Multiplatform Gradle 插件会自动为项目搭建测试基础架构。它会下载并安装所需的测试运行程序及其他依赖项。

对于浏览器项目，你可以在 [Karma](#karma) 测试运行程序和全新的[用于浏览器测试的 DSL](#dsl-for-browser-testing) 之间进行选择。
对于 Node.js 项目，可以使用 [Mocha](#node-js) 测试框架。

该插件还提供了实用的测试功能，例如：

* 源代码映射（Source map）生成
* 测试报告生成
* 控制台中的测试运行结果

### Karma {id="karma"}

> Karma 项目已被[弃用](https://github.com/karma-runner/karma#karma)。预计不会有新功能或错误修复。作为浏览器测试的替代方案，请尝试新的[用于浏览器测试的 DSL](#dsl-for-browser-testing)。
> 
{style="warning"}

要配置 [Karma](https://karma-runner.github.io/) 测试运行程序，请在 `build.gradle(.kts)` 文件中浏览器的 `testTask` 内添加 `useKarma {}` 块。例如，要在特定浏览器中运行测试，请使用：

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
        binaries.executable()
        // ...
    }
}
```

或者，你可以在 `gradle.properties` 文件中为浏览器添加测试目标：

```text
kotlin.js.browser.karma.browsers=firefox,safari
```

这允许你为所有模块定义一个浏览器列表，然后在特定模块的构建文件中添加特定的浏览器。

Kotlin Multiplatform Gradle 插件会在构建时自动在 `build/js/packages/projectName-test/karma.conf.js` 位置生成 Karma 配置文件。该文件包含你在构建文件的 `useKarma {}` 块中进行的设置。

你也可以在项目根目录下的 `karma.config.d` 目录中放置附加配置文件。构建时，该目录下的所有 `.js` 配置文件都会被读取并自动合并到生成的 `karma.conf.js` 中。

有关 Karma 配置的更多信息，请参阅 [Karma 文档](https://karma-runner.github.io/6.4/config/configuration-file.html)。

### 用于浏览器测试的 DSL {id="dsl-for-browser-testing"}
<primary-label ref="experimental-opt-in"/>

Kotlin 提供了一个用于在浏览器环境中运行 Kotlin/JS 测试的实验性 DSL。它被设计为与具体技术无关。
当前底层实现包括以下工具：

* [Playwright](https://playwright.dev/) 用作浏览器驱动程序和分发管理器，支持 Chromium、Firefox 和 WebKit (Safari) 浏览器引擎。
* [Mocha](https://mochajs.org/) 用作测试运行程序。
* [webpack](https://webpack.js.org/) 用作打包器（在[未来版本](https://youtrack.jetbrains.com/issue/KT-48308/)中将被 [Vite](https://vite.dev/) 取代）。

要试用新的浏览器测试 DSL，请在 Kotlin/JS 目标的 `browser {}` 内添加选择加入的 `test {}` 块：

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
                // 使用 Gradle provider 配置无头（headless）模式
                headless = providers
                    .environmentVariable("IS_IN_CI")
                    .map { it.toBoolean() }
                    .orElse(false)
                // 启用并配置自定义 Chromium 运行程序
                chromium("chromium-no-webgl2") {
                    // 覆盖此运行程序的默认超时
                    timeout = 10.seconds

                    // Chromium 特有的额外启动参数
                    launchArgs.add("--disable-webgl2")
                }
                // 启用 Firefox 运行程序
                firefox()
                // 启用 WebKit (Safari) 测试运行程序
                webkit()
                // 启用并配置自定义 WebKit 运行程序
                webkit("headful") {
                    headless = false
                }
            }
        }
    }
}
```

有关新浏览器测试 DSL 配置的更多信息，请参阅[在 Kotlin/JS 中运行测试](js-running-tests.md#advanced-configuration)。

### Node.js {id="node-js-test-task"}

对于 Node.js 项目，Kotlin Multiplatform Gradle 插件会自动配置 [Mocha](https://mochajs.org/) 测试框架。

要指定 Node.js 测试运行程序使用的环境变量（例如，将外部信息传递给测试，或微调包解析），请在构建文件的 `testTask {}` 块中使用带有键值对的 `environment()` 函数：

```kotlin
kotlin {
    js {
        nodejs {
            testTask {
                environment("key", "value")
            }
        }
    }
}
```

### 运行测试 {id="run-tests"}

默认情况下，Kotlin Multiplatform Gradle 插件使用 [Headless Chrome](https://chromium.googlesource.com/chromium/src/+/lkgr/headless/README.md) 来运行浏览器测试。该插件未捆绑任何浏览器；测试运行程序处理缺失浏览器的方式有所不同：

* 使用 [Karma](#karma) 时，计算机上应已安装好所需的其他浏览器，以便插件可以使用它们运行测试。如果你在持续集成服务器上执行 Kotlin/JS 测试，请确保要在其上测试的浏览器也已安装。
* 使用新的[用于浏览器测试的 DSL](#dsl-for-browser-testing) 时，插件会在首次运行时使用 [`playwright install`](https://playwright.dev/docs/browsers#install-browsers) 命令安装必要的浏览器。Playwright 会管理这些浏览器的位置，且不会使用本地已安装的浏览器。

要运行测试，请执行标准生命周期任务 `check`：

```bash
./gradlew check
```

如果想跳过测试，可以在构建文件的 `testTask {}` 块中禁用它们：

```kotlin
kotlin {
    js {
        browser {
            testTask {
                enabled.set(false)
            }
        }
        binaries.executable()
        // ...
    }
}
```

## webpack 打包 {id="webpack-bundling"}

对于浏览器目标，Kotlin Multiplatform Gradle 插件使用广为人知的 [webpack](https://webpack.js.org/) 模块打包器。

### webpack 任务 {id="webpack-task"}

最常见的 webpack 调整可直接通过 Gradle 构建文件中的 `kotlin.js.browser.webpackTask {}` 配置块进行设置：
* `mainOutputFileName` − webpack 输出文件的名称。执行 webpack 任务后，它将在 `<projectDir>/build/kotlin-webpack/<targetName>/<binaryName>` 中生成。默认值为项目名称。
* `output.libraryTarget` − webpack 输出的模块系统。详细了解[适用于 Kotlin/JS 项目的可用模块系统](js-modules.md)。默认值为 `umd`。
  
```groovy
webpackTask {
    mainOutputFileName = "mycustomfilename.js"
    output.libraryTarget = "commonjs2"
}
```

你还可以在 `commonWebpackConfig {}` 块中配置用于打包、运行和测试任务的通用 webpack 设置。

### webpack 配置文件 {id="webpack-configuration-file"}

Kotlin Multiplatform Gradle 插件在构建时会自动生成标准的 webpack 配置文件。它位于 `build/js/packages/projectName/webpack.config.js`。

如果你想对 webpack 配置进行进一步调整，请将附加配置文件放在项目根目录下名为 `webpack.config.d` 的目录中。构建项目时，所有 `.js` 配置文件都将自动合并到 `build/js/packages/projectName/webpack.config.js` 文件中。
例如，要添加新的 [webpack loader](https://webpack.js.org/loaders/)，请将以下内容添加到 `webpack.config.d` 目录下的 `.js` 文件中：

> 在这种情况下，配置对象为 `config` 全局对象。你需要在脚本中对其进行修改。
>
{style="note"}

```groovy
config.module.rules.push({
    test: /\.extension$/,
    loader: 'loader-name'
});
```

webpack 的所有配置功能在其[官方文档](https://webpack.js.org/concepts/configuration/)中均有详尽说明。

### 构建可执行文件 {id="building-executables"}

为了通过 webpack 构建可执行的 JavaScript 工件，Kotlin Multiplatform Gradle 插件包含了 `jsBrowserDevelopmentWebpack` 和 `jsBrowserProductionWebpack` Gradle 任务。

* `jsBrowserDevelopmentWebpack` 创建开发工件，虽然生成的文件体积较大，但耗时很少。因此，在活跃开发期间请使用 `jsBrowserDevelopmentWebpack` 任务。
* `jsBrowserProductionWebpack` 对生成的工件应用无效代码消除（Dead Code Elimination）并压缩生成的 JavaScript 文件，这需要更多时间，但生成的可执行文件体积更小。因此，在准备用于生产环境的项目时，请使用 `jsBrowserProductionWebpack` 任务。
 
执行这两个任务中的任意一个即可获取分别用于开发或生产的相应工件。除非[另有指定](#distribution-target-directory)，否则生成的文件将在 `build/kotlin-webpack` 中可用。

```bash
./gradlew jsBrowserProductionWebpack
```

请注意，仅当你的目标已配置为生成可执行文件（通过 `binaries.executable()`）时，这些任务才可用。

要在 `build/dist/<targetName>/<binaryName>` 目录中生成分发文件，请改为运行 `jsBrowserDistribution` 任务：

```bash
./gradlew jsBrowserDistribution
```

该任务会生成包含项目资源的即用型分发包。

## CSS {id="css"}

Kotlin Multiplatform Gradle 插件还提供对 webpack 的 [CSS](https://webpack.js.org/loaders/css-loader/) 和 [style](https://webpack.js.org/loaders/style-loader/) loader 的支持。虽然可以通过直接修改用于构建项目的 [webpack 配置文件](#webpack-bundling)来更改所有选项，但最常用的设置可直接在 `build.gradle(.kts)` 文件中进行配置。

要在项目中启用 CSS 支持，请在 Gradle 构建文件的 `commonWebpackConfig {}` 块中设置 `cssSupport.enabled` 选项。使用向导创建新项目时，此配置也默认处于启用状态。

<tabs group="build-script">
<tab title="Kotlin" group-key="kotlin">

```kotlin
browser {
    commonWebpackConfig {
        cssSupport {
            enabled.set(true)
        }
    }
}
```

</tab>
<tab title="Groovy" group-key="groovy">

```groovy
browser {
    commonWebpackConfig {
        cssSupport {
            it.enabled = true
        }
    }
}
```

</tab>
</tabs>

或者，你可以单独为 `webpackTask {}`、`runTask {}` 和 `testTask {}` 添加 CSS 支持：

<tabs group="build-script">
<tab title="Kotlin" group-key="kotlin">

```kotlin
browser {
    webpackTask {
        cssSupport {
            enabled.set(true)
        }
    }
    runTask {
        cssSupport {
            enabled.set(true)
        }
    }
    testTask {
        useKarma {
            // ...
            webpackConfig.cssSupport {
                enabled.set(true)
            }
        }
    }
}
```

</tab>
<tab title="Groovy" group-key="groovy">

```groovy
browser {
    webpackTask {
        cssSupport {
            it.enabled = true
        }
    }
    runTask {
        cssSupport {
            it.enabled = true
        }
    }
    testTask {
        useKarma {
            // ...
            webpackConfig.cssSupport {
                it.enabled = true
            }
        }
    }
}
```

</tab>
</tabs>

在项目中激活 CSS 支持有助于防止尝试从尚未配置的项目中使用样式表时发生的常见错误，例如 `Module parse failed: Unexpected character '@' (14:0)`。

你可以使用 `cssSupport.mode` 来指定应如何处理遇到的 CSS。可以使用以下值：

* `"inline"`（默认）：样式将添加到全局 `<style>` 标记中。
* `"extract"`：样式将被提取到单独的文件中。随后可以通过 HTML 页面引入它们。
* `"import"`：样式将作为字符串处理。如果需要从代码中访问 CSS（例如 `val styles = require("main.css")`），这会非常有用。

要在同一个项目中使用不同的模式，请使用 `cssSupport.rules`。在此处可以指定一个 `KotlinWebpackCssRules` 列表，其中每一项都定义了一种模式，以及 [include](https://webpack.js.org/configuration/module/#ruleinclude) 和 [exclude](https://webpack.js.org/configuration/module/#ruleexclude) 模式。

## Node.js {id="node-js"}

对于面向 Node.js 的 Kotlin/JS 项目，该插件会自动在主机上下载并安装 Node.js 环境。如果你已安装 Node.js，也可以使用现有的 Node.js 实例。

你可以为每个子项目配置 Node.js 设置，也可以为整个项目统一设置。

### 更改 Node.js 版本 {id="change-node-js-version"}

当前的默认 Node.js 版本为 24.16.0，但你可以为特定子项目使用其他版本。
请在子项目的 `build.gradle(.kts)` 文件中添加以下代码行。例如：

<tabs group="build-script">
<tab title="Kotlin" group-key="kotlin">

```kotlin
project.plugins.withType<org.jetbrains.kotlin.gradle.targets.js.nodejs.NodeJsPlugin> {
    project.the<org.jetbrains.kotlin.gradle.targets.js.nodejs.NodeJsEnvSpec>().version = "26.2.0"
}
```

</tab>
<tab title="Groovy" group-key="groovy">

```groovy
project.plugins.withType(org.jetbrains.kotlin.gradle.targets.js.nodejs.NodeJsPlugin) {
    project.extensions.getByType(org.jetbrains.kotlin.gradle.targets.js.nodejs.NodeJsEnvSpec).version = "26.2.0"
}
```

</tab>
</tabs>

要为包含所有子项目在内的整个项目设置版本，请将相同代码应用于 `allprojects {}` 块。例如：

<tabs group="build-script">
<tab title="Kotlin" group-key="kotlin">

```kotlin
allprojects {
    project.plugins.withType<org.jetbrains.kotlin.gradle.targets.js.nodejs.NodeJsPlugin> {
        project.the<org.jetbrains.kotlin.gradle.targets.js.nodejs.NodeJsEnvSpec>().version = "26.2.0"
    }
}
```

</tab>
<tab title="Groovy" group-key="groovy">

```groovy
allprojects {
    project.plugins.withType(org.jetbrains.kotlin.gradle.targets.js.nodejs.NodeJsPlugin) {
        project.extensions.getByType(org.jetbrains.kotlin.gradle.targets.js.nodejs.NodeJsEnvSpec).version = "26.2.0"
    }
}
```

</tab>
</tabs>

### 使用预安装的 Node.js {id="use-pre-installed-node-js"}

如果构建 Kotlin/JS 项目的主机上已经安装了 Node.js，你可以配置 Kotlin Multiplatform Gradle 插件以使用该实例，而不是让其安装自己的 Node.js 实例。

要使用预安装的 Node.js 实例，请在 `build.gradle(.kts)` 文件中添加以下代码行：

<tabs group="build-script">
<tab title="Kotlin" group-key="kotlin">

```kotlin
project.plugins.withType<org.jetbrains.kotlin.gradle.targets.js.nodejs.NodeJsPlugin> {
    // 设为 `true` 表示默认行为
    project.the<org.jetbrains.kotlin.gradle.targets.js.nodejs.NodeJsEnvSpec>().download = false
}
```

</tab>
<tab title="Groovy" group-key="groovy">

```groovy
project.plugins.withType(org.jetbrains.kotlin.gradle.targets.js.nodejs.NodeJsPlugin) {
    // 设为 `true` 表示默认行为
    project.extensions.getByType(org.jetbrains.kotlin.gradle.targets.js.nodejs.NodeJsEnvSpec).download = false
}
```

</tab>
</tabs>

## Yarn {id="yarn"}

默认情况下，为了在构建时下载并安装你声明的依赖项，该插件会管理其自带的 [Yarn](https://yarnpkg.com/lang/en/) 软件包管理器实例。它无需额外配置即可开箱即用，但你也可以对其进行微调，或者使用主机上已经安装的 Yarn。

### 更多 Yarn 功能：.yarnrc {id="additional-yarn-features-yarnrc"}

要配置其他 Yarn 功能，请在项目根目录中放置一个 `.yarnrc` 文件。
构建时，它会自动被识别。

例如，要对 npm 软件包使用自定义镜像源，请在项目根目录下名为 `.yarnrc` 的文件中添加以下代码行：

```text
registry "http://my.registry/api/npm/"
```

要详细了解 `.yarnrc`，请访问 [Yarn 官方文档](https://classic.yarnpkg.com/en/docs/yarnrc/)。

### 使用预安装的 Yarn {id="use-pre-installed-yarn"}

如果构建 Kotlin/JS 项目的主机上已经安装了 Yarn，你可以配置 Kotlin Multiplatform Gradle 插件使用该实例，而不是安装其自带的 Yarn 实例。

要使用预安装的 Yarn 实例，请在 `build.gradle(.kts)` 中添加以下代码行：

<tabs group="build-script">
<tab title="Kotlin" group-key="kotlin">

```kotlin
rootProject.plugins.withType<org.jetbrains.kotlin.gradle.targets.js.yarn.YarnPlugin> {
    rootProject.the<org.jetbrains.kotlin.gradle.targets.js.yarn.YarnRootEnvSpec>().download = false
    // "true" 为默认行为
}
```

</tab>
<tab title="Groovy" group-key="groovy">

```groovy
rootProject.plugins.withType(org.jetbrains.kotlin.gradle.targets.js.yarn.YarnPlugin) {
    rootProject.extensions.getByType(org.jetbrains.kotlin.gradle.targets.js.yarn.YarnRootEnvSpec).download = false
}
 
```

</tab>
</tabs>

### 通过 kotlin-js-store 进行版本锁定 {id="version-locking-via-kotlin-js-store"}

项目根目录中的 `kotlin-js-store` 目录由 Kotlin Multiplatform Gradle 插件自动生成，用于保存版本锁定所必需的 `yarn.lock` 文件。该锁文件完全由 Yarn 插件管理，并在执行 `kotlinNpmInstall` Gradle 任务期间更新。

为了遵循[推荐做法](https://classic.yarnpkg.com/blog/2016/11/24/lockfiles-for-all/)，请将 `kotlin-js-store` 及其内容提交到版本控制系统中。这可确保你的应用程序在所有计算机上使用完全相同的依赖项树进行构建。

如果需要，你可以在 `build.gradle(.kts)` 中更改目录和锁文件的名称：

<tabs group="build-script">
<tab title="Kotlin" group-key="kotlin">

```kotlin
rootProject.plugins.withType<org.jetbrains.kotlin.gradle.targets.js.yarn.YarnPlugin> {
    rootProject.the<org.jetbrains.kotlin.gradle.targets.js.yarn.YarnRootExtension>().lockFileDirectory =
        project.rootDir.resolve("my-kotlin-js-store")
    rootProject.the<org.jetbrains.kotlin.gradle.targets.js.yarn.YarnRootExtension>().lockFileName = "my-yarn.lock"
}
```

</tab>
<tab title="Groovy" group-key="groovy">

```groovy
rootProject.plugins.withType(org.jetbrains.kotlin.gradle.targets.js.yarn.YarnPlugin) {
    rootProject.extensions.getByType(org.jetbrains.kotlin.gradle.targets.js.yarn.YarnRootExtension).lockFileDirectory =
        file("my-kotlin-js-store")
    rootProject.extensions.getByType(org.jetbrains.kotlin.gradle.targets.js.yarn.YarnRootExtension).lockFileName = 'my-yarn.lock'
}
```

</tab>
</tabs>

> 更改锁文件的名称可能会导致依赖项检查工具无法再识别该文件。
> 
{style="warning"}

要详细了解 `yarn.lock`，请访问 [Yarn 官方文档](https://classic.yarnpkg.com/lang/en/docs/yarn-lock/)。

### 报告 yarn.lock 已更新 {id="reporting-that-yarn-lock-has-been-updated"}

Kotlin/JS 提供了在 `yarn.lock` 文件更新时向你发出通知的 Gradle 设置。
当你希望在 CI 构建过程中 `yarn.lock` 被静默更改时收到通知，可以使用这些设置：

* `YarnLockMismatchReport`：指定如何报告对 `yarn.lock` 文件的更改。你可以使用以下值之一：
    * `FAIL`：使相应的 Gradle 任务失败。这是默认设置。
    * `WARNING`：在警告日志中写入关于更改的信息。
    * `NONE`：禁用报告。
* `reportNewYarnLock`：显式报告新创建的 `yarn.lock` 文件。默认情况下，此选项处于禁用状态：在首次启动时生成新的 `yarn.lock` 文件是常见做法。你可以使用此选项来确保该文件已提交到仓库中。
* `yarnLockAutoReplace`：每次运行 Gradle 任务时自动替换 `yarn.lock`。

要使用这些选项，请按如下方式更新 `build.gradle(.kts)`：

<tabs group="build-script">
<tab title="Kotlin" group-key="kotlin">

```kotlin
import org.jetbrains.kotlin.gradle.targets.js.yarn.YarnLockMismatchReport
import org.jetbrains.kotlin.gradle.targets.js.yarn.YarnRootExtension

rootProject.plugins.withType<org.jetbrains.kotlin.gradle.targets.js.yarn.YarnPlugin> {
    rootProject.the<YarnRootExtension>().yarnLockMismatchReport =
        YarnLockMismatchReport.WARNING // NONE | FAIL
    rootProject.the<YarnRootExtension>().reportNewYarnLock = false // true
    rootProject.the<YarnRootExtension>().yarnLockAutoReplace = false // true
}
```

</tab>
<tab title="Groovy" group-key="groovy">

```groovy
import org.jetbrains.kotlin.gradle.targets.js.yarn.YarnLockMismatchReport
import org.jetbrains.kotlin.gradle.targets.js.yarn.YarnRootExtension

rootProject.plugins.withType(org.jetbrains.kotlin.gradle.targets.js.yarn.YarnPlugin) {
    rootProject.extensions.getByType(org.jetbrains.kotlin.gradle.targets.js.yarn.YarnRootExtension).yarnLockMismatchReport =
        YarnLockMismatchReport.WARNING // NONE | FAIL
    rootProject.extensions.getByType(org.jetbrains.kotlin.gradle.targets.js.yarn.YarnRootExtension).reportNewYarnLock = false // true
    rootProject.extensions.getByType(org.jetbrains.kotlin.gradle.targets.js.yarn.YarnRootExtension).yarnLockAutoReplace = false // true
}
```

</tab>
</tabs>

### 默认使用 --ignore-scripts 安装 npm 依赖项 {id="installing-npm-dependencies-with-ignore-scripts-by-default"}

为了降低执行来自受损 npm 软件包的恶意代码的几率，Kotlin Multiplatform Gradle 插件默认在安装 npm 依赖项期间阻止执行[生命周期脚本](https://docs.npmjs.com/cli/v8/using-npm/scripts#life-cycle-scripts)。

你可以通过在 `build.gradle(.kts)` 中添加以下代码行来显式启用生命周期脚本的执行：

<tabs group="build-script">
<tab title="Kotlin" group-key="kotlin">

```kotlin
rootProject.plugins.withType<org.jetbrains.kotlin.gradle.targets.js.yarn.YarnPlugin> { 
    rootProject.the<org.jetbrains.kotlin.gradle.targets.js.yarn.YarnRootExtension>().ignoreScripts = false
}
```

</tab>
<tab title="Groovy" group-key="groovy">

```groovy
rootProject.plugins.withType(org.jetbrains.kotlin.gradle.targets.js.yarn.YarnPlugin) {
    rootProject.extensions.getByType(org.jetbrains.kotlin.gradle.targets.js.yarn.YarnRootExtension).ignoreScripts = false
}
```

</tab>
</tabs>

## 分发目标目录 {id="distribution-target-directory"}

默认情况下，Kotlin/JS 项目构建的结果位于项目根目录内的 `/build/dist/<targetName>/<binaryName>` 目录下。

要为项目分发文件设置其他位置，请在构建脚本的 `browser {}` 块中添加一个 `distribution {}` 块，并使用 `set()` 方法为 `outputDirectory` 属性赋值。
运行项目构建任务后，Gradle 会将输出 bundle 与项目资源一起保存在该位置。

<tabs group="build-script">
<tab title="Kotlin" group-key="kotlin">

```kotlin
kotlin {
    js {
        browser {
            distribution {
                outputDirectory.set(projectDir.resolve("output"))
            }
        }
        binaries.executable()
        // ...
    }
}
```

</tab>
<tab title="Groovy" group-key="groovy">

```groovy
kotlin {
    js {
        browser {
            distribution {
                outputDirectory = file("$projectDir/output")
            }
        }
        binaries.executable()
        // ...
    }
}
```

</tab>
</tabs>

## 模块名称 {id="module-name"}

要调整 JavaScript _模块_的名称（在 `build/js/packages/myModuleName` 中生成），包括对应的 `.js` 和 `.d.ts` 文件，请使用 `outputModuleName` 选项：

```kotlin
kotlin {
    js {
        outputModuleName = "myModuleName"
    }
}
```

请注意，这不会影响 `build/dist` 中的 webpack 输出。

## 自定义 package.json {id="package-json-customization"}

`package.json` 文件保存了 JavaScript 软件包的元数据。诸如 npm 等流行的包注册中心要求所有已发布的包都包含此类文件。它们利用该文件来跟踪和管理包的发布。

Kotlin Multiplatform Gradle 插件会在构建期间自动为 Kotlin/JS 项目生成 `package.json`。默认情况下，该文件包含基本数据：名称、版本、许可证、依赖项以及一些其他包属性。

除了基本包属性外，`package.json` 还可以定义 JavaScript 项目的行为方式，例如识别可运行的脚本。

你可以通过 Gradle DSL 向项目的 `package.json` 添加自定义条目。要向 `package.json` 添加自定义字段，请在编译项的 `packageJson` 块中使用 `customField()` 函数：

```kotlin
kotlin {
    js {
        compilations["main"].packageJson {
            customField("hello", mapOf("one" to 1, "two" to 2))
        }
    }
}
```

构建项目时，此代码会将以下块添加到 `package.json` 文件中：

```json
"hello": {
    "one": 1,
    "two": 2
}
```

关于为 npm 注册表编写 `package.json` 文件的更多信息，请参阅 [npm 文档](https://docs.npmjs.com/cli/v6/configuring-npm/package-json)。