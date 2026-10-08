[//]: # (title: 支持的版本与配置)

<primary-label ref="beta"/> 

本页面提供了关于 [WebAssembly 提案](https://webassembly.org/roadmap/)、受支持的浏览器以及高效开发 Kotlin/Wasm 的配置建议的详细信息。

## 浏览器版本 {id="browser-versions"}

Kotlin/Wasm 依赖于最新的 WebAssembly 提案，例如 [垃圾回收 (WasmGC)](#garbage-collection-proposal) 和 [异常处理](#exception-handling-proposal)，以便在 WebAssembly 中引入改进和新功能。

为了确保这些功能正常运行，请提供一个支持最新提案的环境。请检查你的浏览器版本是默认支持新的 WasmGC，还是需要对环境进行更改。

### Chrome {id="chrome"}

* **对于 119 或更高版本：**

  默认支持。

* **对于旧版本：**

  > 要在较旧的浏览器中运行应用程序，你需要 1.9.20 之前的 Kotlin 版本。
  >
  {style="note"}

  1. 在浏览器中转到 `chrome://flags/#enable-webassembly-garbage-collection`。
  2. 启用 **WebAssembly Garbage Collection**。
  3. 重新启动浏览器。

### 基于 Chromium 的浏览器 {id="chromium-based"}

包括 Edge、Brave、Opera 或 Samsung Internet 等基于 Chromium 的浏览器。

* **对于 119 或更高版本：**

  默认支持。

* **对于旧版本：**

   > 要在较旧的浏览器中运行应用程序，你需要 1.9.20 之前的 Kotlin 版本。
   >
   {style="note"}

  使用 `--js-flags=--experimental-wasm-gc` 命令行参数运行应用程序。

### Firefox {id="firefox"}

* **对于 120 或更高版本：**

  默认支持。

* **对于 119 版本：**

  1. 在浏览器中转到 `about:config`。
  2. 启用 `javascript.options.wasm_gc` 选项。
  3. 刷新页面。

### Safari/WebKit {id="safari-webkit"}

* **对于 18.2 或更高版本：**

  默认支持。

* **对于旧版本：**

   不支持。

> Safari 18.2 适用于 iOS 18.2、iPadOS 18.2、visionOS 2.2、macOS 15.2、macOS Sonoma 和 macOS Ventura。
> 在 iOS 和 iPadOS 上，Safari 18.2 与操作系统捆绑在一起。要获取它，请将你的设备更新到 18.2 或更高版本。
>
> 欲了解更多信息，请参阅 [Safari 发行说明](https://developer.apple.com/documentation/safari-release-notes/safari-18_2-release-notes#Overview)。
>
{style="note"}

## Wasm 提案支持情况 {id="wasm-proposals-support"}

Kotlin/Wasm 的改进基于 [WebAssembly 提案](https://webassembly.org/roadmap/)。在此你可以找到关于 WebAssembly 垃圾回收提案和（旧版）异常处理提案支持的详细信息。

### 垃圾回收提案 {id="garbage-collection-proposal"}

自 Kotlin 1.9.20 起，Kotlin 工具链使用最新版本的 [Wasm 垃圾回收](https://github.com/WebAssembly/gc) (WasmGC) 提案。

因此，我们强烈建议你将 Wasm 项目更新到最新版本的 Kotlin。我们还建议你在 Wasm 环境中使用最新版本的浏览器。

### 异常处理提案 {id="exception-handling-proposal"}

Kotlin 工具链同时支持 [旧版](https://github.com/WebAssembly/exception-handling/blob/master/proposals/exception-handling/legacy/Exceptions.md) 和 [新版](https://github.com/WebAssembly/exception-handling/blob/main/proposals/exception-handling/Exceptions.md) 的异常处理提案。这使得 Kotlin 生成的 Wasm 二进制文件可以在更广泛的环境中运行。

[`wasmJs` 目标](wasm-overview.md#kotlin-wasm-and-compose-multiplatform) 默认使用旧版异常处理提案。要为 `wasmJs` 目标启用新版异常处理提案，请使用 `-Xwasm-use-new-exception-proposal` 编译器选项。

相比之下，[`wasmWasi` 目标](wasm-overview.md#kotlin-wasm-and-wasi) 默认使用新提案，以确保与现代 WebAssembly 运行时有更好的兼容性。要切换到旧版提案，请使用 `-Xwasm-use-new-exception-proposal=false` 编译器选项。

对于 `wasmWasi` 目标，采用新的异常处理提案是安全的。针对此环境的应用程序通常在多样性较低的运行时环境中运行（通常运行在单个特定的虚拟机上），这些环境通常由用户控制，从而降低了兼容性问题的风险。

> 通过我们的 [Kotlin/Wasm 示例](https://github.com/Kotlin/kotlin-wasm-examples#readme) 详细了解项目设置、使用依赖项以及其他任务。
>
{style="tip"}

## 使用默认导入 {id="use-default-import"}

[将 Kotlin/Wasm 代码导入 JavaScript](wasm-js-interop.md) 已转向命名导出 (named exports)，不再使用默认导出 (default exports)。

如果你仍想使用默认导入，请生成一个新的 JavaScript 包装器模块。创建一个包含以下代码段的 `.mjs` 文件：

```Javascript
// 指定主 .mjs 文件的路径
import * as moduleExports from "./wasm-test.mjs";

export { moduleExports as default };
```

你可以将新的 `.mjs` 文件放置在资源文件夹中，在构建过程中它会自动放置在主 `.mjs` 文件旁边。

你也可以将 `.mjs` 文件放置在自定义位置。在这种情况下，你需要手动将其移动到主 `.mjs` 文件旁边，或者调整 import 语句中的路径以匹配其位置。

## Kotlin/Wasm 增量编译 {id="kotlin-wasm-incremental-compilation"}

Kotlin/Wasm 目标支持增量编译，这使编译器能够仅重新编译受近期更改影响的文件。这有助于减少编译时间。

Wasm 目标的增量编译默认处于启用状态。要禁用它，请将以下行添加到项目的 `local.properties` 或 `gradle.properties` 文件中：

```text
kotlin.incremental.wasm=false
```

## 完全限定类名中的诊断 {id="diagnostics-in-fully-qualified-class-names"}

在 Kotlin/Wasm 上，编译器默认不会在生成的二进制文件中存储类的完全限定名称 (FQN)，以避免增加应用程序的大小。

因此，除非你显式启用了完全限定名称功能，否则当你在 Kotlin/Wasm 项目中调用 `KClass::qualifiedName` 属性时，编译器会报错。

此诊断默认启用，并且会自动报告错误。要禁用该诊断并允许在 Kotlin/Wasm 中使用 `qualifiedName`，请通过在 `build.gradle.kts` 文件中添加以下选项来指示编译器存储所有类的完全限定名称：

```kotlin
// build.gradle.kts
kotlin {
   wasmJs {
       ...
       compilerOptions {
           freeCompilerArgs.add("-Xwasm-kclass-fqn")
       }
   }
}
```

请记住，启用此选项会增加应用程序的大小。

### 完全限定名称 {id="fully-qualified-names"}

在 Kotlin/Wasm 目标上，无需任何额外配置即可在运行时使用完全限定名称 (FQN)。这意味着 `KClass.qualifiedName` 属性是默认启用的。

使用 FQN 提高了代码从 JVM 到 Wasm 目标的便携性，并通过显示完整的完全限定名称使运行时错误更具信息量。

## 数组越界访问与陷阱 {id="array-out-of-bounds-access-and-traps"}

在 Kotlin/Wasm 中，使用超出其边界的索引访问数组会触发 WebAssembly 陷阱 (trap)，而不是常规的 Kotlin 异常。陷阱会立即停止当前的执行堆栈。

在 JavaScript 环境中运行时，这些陷阱表现为 `WebAssembly.RuntimeError`，可以在 JavaScript 侧捕获。

在链接可执行文件时，通过在命令行中使用以下编译器选项，可以避免在 Kotlin/Wasm 环境中出现此类陷阱：

```
-Xwasm-enable-array-range-checks
```

或者将其添加到 Gradle 构建文件的 `compilerOptions {}` 块中：

```kotlin
// build.gradle.kts
kotlin {
    compilerOptions {
        freeCompilerArgs.add("-Xwasm-enable-array-range-checks")
    }
}
```

启用该编译器选项后，将抛出 `IndexOutOfBoundsException` 而不是触发陷阱。

请参阅此 [YouTrack 问题](https://youtrack.jetbrains.com/issue/KT-73452/K-Wasm-turning-on-range-checks-by-default) 以了解更多详细信息并分享你的反馈。

## 实验性注解 {id="experimental-annotations"}

Kotlin/Wasm 为通用的 WebAssembly 互操作性提供了几个实验性注解。

[`@WasmImport`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.wasm/-wasm-import/) 和 [`@WasmExport`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.wasm/-wasm-export/) 分别允许你调用 Kotlin/Wasm 模块外部定义的函数，以及将 Kotlin 函数暴露给宿主或其他 Wasm 模块。

由于这些机制仍在演进中，所有注解都被标记为实验性。你必须显式 [选择加入以使用它们](opt-in-requirements.md)，并且其设计或行为可能会在未来的 Kotlin 版本中发生变化。

## 调试期间的重新加载 {id="reloads-during-debugging"}

在 [现代浏览器](#browser-versions) 中 [调试](wasm-debugging.md) 你的应用程序是开箱即用的。当你运行开发 Gradle 任务 (`*DevRun`) 时，Kotlin 会自动将源文件提供给浏览器。

然而，默认提供源文件可能会导致 [在 Kotlin 编译和打包完成之前，应用程序在浏览器中反复重新加载](https://youtrack.jetbrains.com/issue/KT-80582/Multiple-reloads-when-using-webpack-dev-server-after-2.2.20-Beta2#focus=Comments-27-12596427.0-0)。作为一种变通方法，请调整你的 webpack 配置以忽略 Kotlin 源文件并禁用对所提供静态文件的监视。在项目根目录的 `webpack.config.d` 目录中添加一个包含以下内容的 `.js` 文件：

```kotlin
config.watchOptions = config.watchOptions || {
    ignored: ["**/*.kt", "**/node_modules"]
}

if (config.devServer) {
    config.devServer.static = config.devServer.static.map(file => {
        if (typeof file === "string") {
            return {
                directory: file,
                watch: false,
            }
        } else {
            return file
        }
    })
}
```
