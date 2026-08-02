[//]: # (title: 设置 Kotlin/JS 项目)

Kotlin/JS 项目使用 Gradle 作为构建系统。为了让开发者能够轻松管理其 Kotlin/JS 项目，我们提供了 `kotlin.multiplatform` Gradle 插件，它提供了项目配置工具以及用于自动执行 JavaScript 开发中常见例程的辅助任务。

该插件在后台使用 [npm](https://www.npmjs.com/) 或 [Yarn](https://yarnpkg.com/) 软件包管理器下载 npm 依赖项，并使用 [webpack](https://webpack.js.org/) 从 Kotlin 项目构建 JavaScript bundle。依赖项管理和配置调整在很大程度上可以直接从 Gradle 构建文件中完成，并可以选择重写自动生成的配置以实现完全控制。

你可以在 `build.gradle(.kts)` 文件中手动将 `org.jetbrains.kotlin.multiplatform` 插件应用于 Gradle 项目：

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

Kotlin 多平台 Gradle 插件允许你在构建脚本的 `kotlin {}` 代码块中管理项目的各个方面：

```groovy
kotlin {
    // ...
}
```

在 `kotlin {}` 代码块内部，你可以管理以下方面：

* [目标执行环境](#execution-environments)：浏览器或 Node.js 
* [对 ES2015 功能的支持](#support-for-es2015-features)：类、模块和生成器
* [配置输出颗粒度](#configure-output-granularity)
* [生成 TypeScript 定义文件](#generation-of-typescript-declaration-files-d-ts)
* [项目依赖项](#dependencies)：Maven 和 npm
* [运行配置](#run-task)
* [测试配置](#test-task)
* 浏览器项目的 [捆绑](#webpack-bundling) 和 [CSS 支持](#css)
* [目标目录](#distribution-target-directory) 和 [模块名称](#module-name)
* 项目的 [`package.json` 文件](#package-json-customization)

## 执行环境

Kotlin/JS 项目可以针对两种不同的执行环境： 

* 浏览器：用于浏览器中的客户端脚本编写
* [Node.js](https://nodejs.org/)：用于在浏览器之外运行 JavaScript 代码，例如用于服务器端脚本编写。

要为 Kotlin/JS 项目定义目标执行环境，请在内部添加带有 `browser {}` 或 `nodejs {}` 的 `js {}` 代码块：

```kotlin
kotlin {
    js {
        browser {
        }
        binaries.executable()
    }
}
```

指令 `binaries.executable()` 明确指示 Kotlin 编译器生成可执行的 `.js` 文件。如果省略 `binaries.executable()`，编译器将仅生成 Kotlin 内部库文件，这些文件可以被其他项目使用，但不能独立运行。

> 这通常比创建可执行文件更快，并且在处理项目的非叶模块时可能是一种优化的选择。
>
{style="tip"}

Kotlin 多平台插件会自动配置其任务以使用所选环境。这包括下载并安装运行和测试应用程序所需的环境和依赖项。这使得开发者无需额外配置即可构建、运行和测试简单的项目。对于针对 Node.js 的项目，还可以选择使用现有的 Node.js 安装。了解如何[使用预安装的 Node.js](#use-pre-installed-node-js)。

## 对 ES2015 功能的支持

Kotlin 对 ES2015 功能提供支持，包括：

* 模块：简化你的代码库并提高可维护性。
* 类：允许整合 OOP 原则，从而产生更简洁、更直观的代码。
* 生成器：用于编译 [suspend 函数](https://kotlinlang.org/docs/composing-suspending-functions.html)，从而优化最终的 bundle 大小并有助于调试。
* [JavaScript 代码内联](js-interop.md#inline-javascript)。

你可以通过在 `build.gradle(.kts)` 文件中添加 `es2015` 编译目标来一次性启用所有受支持性 ES2015 功能：

```kotlin
tasks.withType<KotlinJsCompile>().configureEach {
    compilerOptions {
        target = "es2015"
    }
}
```

[在官方文档中详细了解 ES2015 (ECMAScript 2015, ES6)](https://262.ecma-international.org/6.0/)。

## 配置输出颗粒度

你可以选择编译器在项目中输出 `.js` 文件的方式：

* **每个模块一个**。默认情况下，JS 编译器会为每个项目模块输出单独的 `.js` 文件作为编译结果。
* **每个项目一个**。你可以通过在 `gradle.properties` 文件中添加以下行，将整个项目编译为单个 `.js` 文件：

  ```none
  kotlin.js.ir.output.granularity=whole-program // 默认为 'per-module'
  ```

* **每个文件一个**。你可以设置更细粒度的输出，为每个 Kotlin 文件生成一个（如果文件包含导出的声明，则为两个）JavaScript 文件。要启用按文件编译模式：
  1. 将 `es2015` 设置为 [编译目标](#support-for-es2015-features) 以支持项目中的 ES2015 功能。
  2. 在 `gradle.properties` 文件中添加以下行：
     ```none
     kotlin.js.ir.output.granularity=per-file // 默认为 'per-module'
     ```

## 生成 TypeScript 定义文件 (`d.ts`)
<primary-label ref="experimental-opt-in"/>

Kotlin/JS 编译器可以根据你的 Kotlin 代码生成 TypeScript 定义。在开发混合应用程序时，JavaScript 工具和 IDE 可以使用这些定义来：

* 提供自动补全
* 支持静态分析器
* 简化在 JavaScript 和 TypeScript 项目中添加 Kotlin 代码的过程

生成 TypeScript 定义对于 [业务逻辑共享用例](js-overview.md#use-cases-for-kotlin-js) 尤其有价值。

编译器会收集标记有 [`@JsExport`](js-to-kotlin-interop.md#jsexport-annotation) 的任何顶级声明，并自动在 `.d.ts` 文件中生成 TypeScript 定义。

要生成 TypeScript 定义，请在 Gradle 构建文件中显式配置它。在 [`js {}` 代码块](js-project-setup.md#execution-environments) 中将 `generateTypeScriptDefinitions()` 函数添加到你的 `build.gradle.kts` 文件中：

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

你可以在 `build/js/packages/<package_name>/kotlin` 目录中找到这些定义，与相应的未经过 webpack 处理的 JavaScript 代码放在一起。

## 依赖项

要声明依赖项，请在 `build.gradle(.kts)` 文件的 `jsMain` 源集中使用 `dependencies {}` 代码块：

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

只有包含 Kotlin/JS 构建工件的库才能作为依赖项使用。要解析依赖项，请在 `build.gradle(.kts)` 文件的 `repositories {}` 代码块中声明 Gradle 应在其中查找这些依赖项的仓库。例如：

```kotlin
repositories {
    mavenCentral()
}
```

如果你添加的库依赖于 [来自 npm 的软件包](#npm-dependencies)，Gradle 也会自动解析这些传递性依赖项。

### Kotlin 标准库

对 [标准库](https://kotlinlang.org/api/latest/jvm/stdlib/index.html) 的依赖项是自动添加的。标准库的版本与 Kotlin 多平台插件的版本相同。

对于多平台测试，可以使用 [`kotlin.test`](https://kotlinlang.org/api/latest/kotlin.test/) API。当你创建一个多平台项目时，可以通过在 `commonTest` 中使用单个依赖项来为所有源集添加测试依赖项：

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

### npm 依赖项

在 JavaScript 世界中，最常用的管理依赖项的方式是 [npm](https://www.npmjs.com/)。它提供了最大的 JavaScript 模块公共仓库。

Kotlin 多平台 Gradle 插件允许你在 Gradle 构建脚本中声明 npm 依赖项，就像声明任何其他依赖项一样。

要声明 npm 依赖项，请在依赖项声明中将其名称和版本传递给 `npm()` 函数。你还可以根据 [npm 的语义化版本 (semver) 语法](https://docs.npmjs.com/about-semantic-versioning) 指定一个或多个版本范围。

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

默认情况下，该插件使用 [Yarn](https://yarnpkg.com/lang/en/) 软件包管理器的独立实例来下载并安装 npm 依赖项。它开箱即用，无需额外配置，但你可以[根据特定需求对其进行调整](#yarn)。

你也可以直接使用 [npm](https://www.npmjs.com/) 软件包管理器来处理 npm 依赖项。要使用 npm 作为软件包管理器，请在 `gradle.properties` 文件中设置以下属性：

```none
kotlin.js.yarn=false
```

除了常规依赖项外，还有三种其他类型的依赖项可以从 Gradle DSL 中使用。要详细了解何时最适合使用每种类型的依赖项，请查看 npm 链接的官方文档：

* 通过 `devNpm(...)` 使用 [devDependencies](https://docs.npmjs.com/files/package.json#devdependencies)，
* 通过 `optionalNpm(...)` 使用 [optionalDependencies](https://docs.npmjs.com/files/package.json#optionaldependencies)，以及
* 通过 `peerNpm(...)` 使用 [peerDependencies](https://docs.npmjs.com/files/package.json#peerdependencies)。

一旦安装了 npm 依赖项，你就可以在代码中使用其 API，如 [在 Kotlin 中调用 JS](js-interop.md) 中所述。

## 运行任务

Kotlin 多平台 Gradle 插件提供了 `jsBrowserDevelopmentRun` 任务，允许你在无需额外配置的情况下运行纯 Kotlin/JS 项目。

对于在浏览器中运行 Kotlin/JS 项目，此任务是 `browserDevelopmentRun` 任务的别名（该任务在 Kotlin 多平台项目中也可用）。它使用 [webpack-dev-server](https://webpack.js.org/configuration/dev-server/) 来提供你的 JavaScript 构建工件。如果你想自定义 `webpack-dev-server` 使用的配置，例如调整服务器运行的端口，请使用 [webpack 配置文件](#webpack-bundling)。

对于运行针对 Node.js 的 Kotlin/JS 项目，请使用 `jsNodeDevelopmentRun` 任务，它是 `nodeRun` 任务的别名。

要运行项目，请执行标准的生命周期 `jsBrowserDevelopmentRun` 任务，或其对应的别名：

```bash
./gradlew jsBrowserDevelopmentRun
```

要在对源文件进行更改后自动触发应用程序的重新构建，请使用 Gradle 的 [持续构建](https://docs.gradle.org/current/userguide/command_line_interface.html#sec:continuous_build) 功能：

```bash
./gradlew jsBrowserDevelopmentRun --continuous
```

或者 

```bash
./gradlew jsBrowserDevelopmentRun -t
```

一旦项目构建成功，`webpack-dev-server` 将自动刷新浏览器页面。

## 测试任务

Kotlin 多平台 Gradle 插件会自动为项目设置测试基础设施。对于浏览器项目，它会下载并安装 [Karma](https://karma-runner.github.io/) 测试运行程序以及其他所需的依赖项；对于 Node.js 项目，使用 [Mocha](https://mochajs.org/) 测试框架。 

该插件还提供了有用的测试功能，例如：

* 生成源代码映射
* 生成测试报告
* 在控制台中显示测试运行结果

对于运行浏览器测试，该插件默认使用 [无头 Chrome (Headless Chrome)](https://chromium.googlesource.com/chromium/src/+/lkgr/headless/README.md)。你还可以通过在构建脚本的 `useKarma {}` 代码块中添加相应的条目，选择在其他浏览器中运行测试：

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

这种方法允许你为所有模块定义浏览器列表，然后在特定模块的构建脚本中添加特定浏览器。 

请注意，Kotlin 多平台 Gradle 插件不会自动为你安装这些浏览器，而只会使用其执行环境中可用的浏览器。例如，如果你在持续集成服务器上执行 Kotlin/JS 测试，请确保安装了你要测试的浏览器。

如果你想跳过测试，请将行 `enabled = false` 添加到 `testTask {}` 中：

```kotlin
kotlin {
    js {
        browser {
            testTask {
                enabled = false
            }
        }
        binaries.executable()
        // ...
    }
}
```

要运行测试，请执行标准的生命周期 `check` 任务：

```bash
./gradlew check
```

要指定 Node.js 测试运行程序使用的环境变量（例如，向测试传递外部信息或微调包解析），请在构建脚本的 `testTask {}` 代码块中使用带有键值对的 `environment()` 函数：

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

### Karma 配置

Kotlin 多平台 Gradle 插件在构建时会自动生成一个 Karma 配置文件，该文件包含了你从 `build.gradle(.kts)` 中的 [`kotlin.js.browser.testTask.useKarma {}` 代码块](#test-task) 进行的设置。你可以在 `build/js/packages/projectName-test/karma.conf.js` 中找到该文件。 
要调整 Karma 使用的配置，请将额外的配置文件放在项目根目录下名为 `karma.config.d` 的目录中。该目录中的所有 `.js` 配置文件都会被获取，并在构建时自动合并到生成的 `karma.conf.js` 中。

所有 Karma 配置功能在 Karma 的 [文档](https://karma-runner.github.io/5.0/config/configuration-file.html) 中都有详细描述。

## webpack 捆绑

对于浏览器目标，Kotlin 多平台 Gradle 插件使用广为人知的 [webpack](https://webpack.js.org/) 模块捆绑器。

### webpack 任务

最常用的 webpack 调整可以直接通过 Gradle 构建文件中的 `kotlin.js.browser.webpackTask {}` 配置块进行：
* `mainOutputFileName` - 经过 webpack 处理的输出文件名称。执行 webpack 任务后，它将在 `<projectDir>/build/kotlin-webpack/<targetName>/<binaryName>` 中生成。默认值为项目名称。
* `output.libraryTarget` - 经过 webpack 处理的输出的模块系统。详细了解 [适用于 Kotlin/JS 项目的可用模块系统](js-modules.md)。默认值为 `umd`。
  
```groovy
webpackTask {
    mainOutputFileName = "mycustomfilename.js"
    output.libraryTarget = "commonjs2"
}
```

你还可以在 `commonWebpackConfig {}` 代码块中配置通用的 webpack 设置，以便在捆绑、运行和测试任务中使用。

### webpack 配置文件 

Kotlin 多平台 Gradle 插件在构建时会自动生成一个标准的 webpack 配置文件。它位于 `build/js/packages/projectName/webpack.config.js`。

如果你想对 webpack 配置进行进一步调整，请将额外的配置文件放在项目根目录下名为 `webpack.config.d` 的目录中。构建项目时，所有 `.js` 配置文件都将自动合并到 `build/js/packages/projectName/webpack.config.js` 文件中。
例如，要添加一个新的 [webpack 加载器 (loader)](https://webpack.js.org/loaders/)，请将以下内容添加到 `webpack.config.d` 目录中的 `.js` 文件中：

> 在这种情况下，配置对象是 `config` 全局对象。你需要在脚本中对其进行修改。
>
{style="note"}

```groovy
config.module.rules.push({
    test: /\.extension$/,
    loader: 'loader-name'
});
```

所有 webpack 配置功能在 [文档](https://webpack.js.org/concepts/configuration/) 中都有详细描述。

### 构建可执行文件

为了通过 webpack 构建可执行的 JavaScript 构建工件，Kotlin 多平台 Gradle 插件包含 `jsBrowserDevelopmentWebpack` 和 `jsBrowserProductionWebpack` Gradle 任务。

* `jsBrowserDevelopmentWebpack` 创建开发构建工件，这些工件体积较大，但创建时间短。因此，在活跃开发期间请使用 `jsBrowserDevelopmentWebpack` 任务。
* `jsBrowserProductionWebpack` 对生成的构建工件应用无效代码消除，并压缩生成的 JavaScript 文件，这需要更多时间，但生成的执行文件体积更小。因此，在准备项目的生产环境用途时，请使用 `jsBrowserProductionWebpack` 任务。
 
执行其中任一任务即可获取相应的开发或生产构建工件。生成的文件将位于 `build/kotlin-webpack` 中，除非 [另有指定](#distribution-target-directory)。

```bash
./gradlew jsBrowserProductionWebpack
```

请注意，仅当你的目标被配置为生成可执行文件（通过 `binaries.executable()`）时，这些任务才可用。

要生成 `build/dist/<targetName>/<binaryName>` 目录下的分发文件，请改为运行 `jsBrowserDistribution` 任务：

```bash
./gradlew jsBrowserDistribution
```

此任务会生成一个包含项目资源的、随时可用的分发包。

## CSS

Kotlin 多平台 Gradle 插件还提供对 webpack 的 [CSS](https://webpack.js.org/loaders/css-loader/) 和 [style](https://webpack.js.org/loaders/style-loader/) 加载器的支持。虽然所有选项都可以通过直接修改用于构建项目的 [webpack 配置文件](#webpack-bundling) 来更改，但最常用的设置可以直接从 `build.gradle(.kts)` 文件中配置。

要在项目中开启 CSS 支持，请在 Gradle 构建文件的 `commonWebpackConfig {}` 代码块中设置 `cssSupport.enabled` 选项。使用向导创建新项目时，此配置也默认启用。

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

或者，你可以独立为 `webpackTask {}`、`runTask {}` 和 `testTask {}` 添加 CSS 支持：

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

在项目中激活 CSS 支持有助于防止尝试在未配置的项目中使用样式表时发生的常见错误，例如 `Module parse failed: Unexpected character '@' (14:0)`。

你可以使用 `cssSupport.mode` 来指定应如何处理遇到的 CSS。以下值可用：

* `"inline"`（默认）：样式被添加到全局 `<style>` 标记中。
* `"extract"`：样式被提取到单独的文件中。然后可以从 HTML 页面中包含它们。
* `"import"`：样式被作为字符串处理。如果你需要从代码中访问 CSS（例如 `val styles = require("main.css")`），这可能会很有用。

要为同一个项目使用不同的模式，请使用 `cssSupport.rules`。在这里，你可以指定一个 `KotlinWebpackCssRules` 列表，其中每一个都定义了一个模式，以及 [包含 (include)](https://webpack.js.org/configuration/module/#ruleinclude) 和 [排除 (exclude)](https://webpack.js.org/configuration/module/#ruleexclude) 模式。

## Node.js

对于针对 Node.js 的 Kotlin/JS 项目，该插件会自动在主机上下载并安装 Node.js 环境。如果你已经安装了 Node.js 实例，也可以使用它。

你可以为每个子项目配置 Node.js 设置，也可以为整个项目进行设置。

### 更改 Node.js 版本

默认的 Node.js 版本目前是 24.16.0，但你可以为特定的子项目使用不同的版本。在子项目的 `build.gradle(.kts)` 文件中添加以下行。例如：

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

要为整个项目（包括所有子项目）设置版本，请将相同的代码应用于 `allprojects {}` 代码块。例如：

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

### 使用预安装的 Node.js

如果构建 Kotlin/JS 项目的主机上已经安装了 Node.js，你可以配置 Kotlin 多平台 Gradle 插件来使用它，而不是安装自己的 Node.js 实例。

要使用预安装的 Node.js 实例，请将以下行添加到你的 `build.gradle(.kts)` 文件中：

<tabs group="build-script">
<tab title="Kotlin" group-key="kotlin">

```kotlin
project.plugins.withType<org.jetbrains.kotlin.gradle.targets.js.nodejs.NodeJsPlugin> {
    // 设置为 `true` 以使用默认行为
    project.the<org.jetbrains.kotlin.gradle.targets.js.nodejs.NodeJsEnvSpec>().download = false
}
```

</tab>
<tab title="Groovy" group-key="groovy">

```groovy
project.plugins.withType(org.jetbrains.kotlin.gradle.targets.js.nodejs.NodeJsPlugin) {
    // 设置为 `true` 以使用默认行为
    project.extensions.getByType(org.jetbrains.kotlin.gradle.targets.js.nodejs.NodeJsEnvSpec).download = false
}
```

</tab>
</tabs>

## Yarn

默认情况下，为了在构建时下载并安装你声明的依赖项，该插件管理其自身的 [Yarn](https://yarnpkg.com/lang/en/) 软件包管理器实例。它开箱即用，无需额外配置，但你可以对其进行调整或使用主机上已安装的 Yarn。

### 额外的 Yarn 功能：.yarnrc

要配置额外的 Yarn 功能，请在项目根目录下放置一个 `.yarnrc` 文件。在构建时，它会被自动获取。

例如，要为 npm 软件包使用自定义仓库，请在项目根目录下名为 `.yarnrc` 的文件中添加以下行：

```text
registry "http://my.registry/api/npm/"
```

要详细了解 `.yarnrc`，请访问 [官方 Yarn 文档](https://classic.yarnpkg.com/en/docs/yarnrc/)。

### 使用预安装的 Yarn

如果构建 Kotlin/JS 项目的主机上已经安装了 Yarn，你可以配置 Kotlin 多平台 Gradle 插件来使用它，而不是安装自己的 Yarn 实例。

要使用预安装的 Yarn 实例，请在 `build.gradle(.kts)` 中添加以下行：

<tabs group="build-script">
<tab title="Kotlin" group-key="kotlin">

```kotlin
rootProject.plugins.withType<org.jetbrains.kotlin.gradle.targets.js.yarn.YarnPlugin> {
    rootProject.the<org.jetbrains.kotlin.gradle.targets.js.yarn.YarnRootEnvSpec>().download = false
    // 默认行为为 "true"
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

### 通过 kotlin-js-store 进行版本锁定

项目根目录下的 `kotlin-js-store` 目录是由 Kotlin 多平台 Gradle 插件自动生成的，用于存放 `yarn.lock` 文件，这对于版本锁定是必要的。锁文件完全由 Yarn 插件管理，并在执行 `kotlinNpmInstall` Gradle 任务期间更新。

为了遵循 [建议的做法](https://classic.yarnpkg.com/blog/2016/11/24/lockfiles-for-all/)，请将 `kotlin-js-store` 及其内容提交到你的版本控制系统。这可以确保你的应用程序在所有机器上都使用完全相同的依赖树进行构建。

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

要详细了解 `yarn.lock`，请访问 [官方 Yarn 文档](https://classic.yarnpkg.com/lang/en/docs/yarn-lock/)。

### 报告 yarn.lock 已更新

Kotlin/JS 提供了 Gradle 设置，可以在 `yarn.lock` 文件更新时通知你。当你希望在 CI 构建过程中如果 `yarn.lock` 被静默更改时收到通知，可以使用这些设置：

* `YarnLockMismatchReport`：指定如何报告对 `yarn.lock` 文件的更改。你可以使用以下值之一：
    * `FAIL`：使相应的 Gradle 任务失败。这是默认设置。
    * `WARNING`：在警告日志中写入关于更改的信息。
    * `NONE`：禁用报告。
* `reportNewYarnLock`：显式报告最近创建的 `yarn.lock` 文件。默认情况下，此选项是禁用的：在第一次启动时生成一个新的 `yarn.lock` 文件是常见做法。你可以使用此选项来确保文件已被提交到你的仓库。
* `yarnLockAutoReplace`：每次运行 Gradle 任务时自动替换 `yarn.lock`。

To use these options, update `build.gradle(.kts)` as follows:

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

### 默认使用 --ignore-scripts 安装 npm 依赖项

为了降低执行来自受损 npm 软件包的恶意代码的可能性，Kotlin 多平台 Gradle 插件默认禁止在安装 npm 依赖项期间执行 [生命周期脚本](https://docs.npmjs.com/cli/v8/using-npm/scripts#life-cycle-scripts)。

你可以通过在 `build.gradle(.kts)` 中添加以下行来显式启用生命周期脚本执行：

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

## 分发目标目录

默认情况下，Kotlin/JS 项目构建的结果位于项目根目录下的 `/build/dist/<targetName>/<binaryName>` 目录中。

要为项目分发文件设置另一个位置，请在构建脚本的 `browser {}` 代码块中添加一个 `distribution {}` 代码块，并使用 `set()` 方法为 `outputDirectory` 属性赋值。一旦你运行项目构建任务，Gradle 将把输出 bundle 与项目资源一起保存到此位置。

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

## 模块名称

要调整 JavaScript *模块*（在 `build/js/packages/myModuleName` 中生成）的名称，包括相应的 `.js` 和 `.d.ts` 文件，请使用 `outputModuleName` 选项：

```kotlin
kotlin {
    js {
        outputModuleName = "myModuleName"
    }
}
```

请注意，这不会影响 `build/dist` 中经过 webpack 处理的输出。

## package.json 自定义

`package.json` 文件保存 JavaScript 软件包的元数据。流行的软件包注册表（如 npm）要求所有发布的软件包都具有这样一个文件。它们使用它来跟踪和管理软件包发布。  

Kotlin 多平台 Gradle 插件在构建期间会自动为 Kotlin/JS 项目生成 `package.json`。默认情况下，该文件包含基本数据：名称、版本、许可证、依赖项和一些其他软件包属性。

除了基本的软件包属性外，`package.json` 还可以定义 JavaScript 项目的行为方式，例如，标识可运行的脚本。

你可以通过 Gradle DSL 向项目的 `package.json` 添加自定义条目。要向你的 `package.json` 添加自定义字段，请在 `jsMain` 源集的 `packageJson` 代码块中使用 `customField()` 函数：

```kotlin
kotlin {
    sourceSets {
        jsMain {
            packageJson {
                customField("hello", mapOf("one" to 1, "two" to 2))
            }
        }
    }
}
```

当你构建项目时，此代码会向 `package.json` 文件添加以下代码块：

```json
"hello": {
    "one": 1,
    "two": 2
}
```

在 [npm 文档](https://docs.npmjs.com/cli/v6/configuring-npm/package-json) 中了解更多关于为 npm 注册表编写 `package.json` 文件的信息。