[//]: # (title: Kotlin/JS 编译器特性)

Kotlin/JS 编译器在生成 JavaScript 代码之前，会先将 Kotlin 代码转换为中间表示 (IR)。
这一中间步骤使编译器能够针对性能、体积和开发速度对输出进行优化，并让你能够控制生成的 JavaScript 代码，例如目标 JavaScript 版本、模块系统、TypeScript 声明文件以及输出粒度。

## 设置目标 JavaScript 版本 {id="set-the-target-javascript-version"}

Kotlin/JS 编译器可以针对 ECMAScript 标准的 ES5、ES2015 和 ES2020 版本生成 JavaScript 代码。
请选择目标环境所支持的最新版本。
在 `build.gradle.kts` 文件中设置 `target` 属性。例如，要将目标设为 ES2020：

```kotlin
tasks.withType<KotlinJsCompile>().configureEach {
    compilerOptions {
        target = "es2020"
    }
}
```

有关各个目标可用的功能，请参阅[设置 ECMAScript 目标](js-project-setup.md#set-an-ecmascript-target)。

## 配置模块系统 {id="configure-the-module-system"}

Kotlin/JS 编译器可以为不同的模块系统生成代码，例如 UMD、CommonJS、AMD 和 ES 模块。
要选择目标模块系统，请在 `build.gradle.kts` 文件中设置 `moduleKind` 编译器选项：

```kotlin
tasks.withType<org.jetbrains.kotlin.gradle.targets.js.ir.KotlinJsIrLink> {
    compilerOptions.moduleKind.set(org.jetbrains.kotlin.gradle.dsl.JsModuleKind.MODULE_COMMONJS)
}
```

有关受支持的 `moduleKind` 取值及配置详情，请参阅 [JavaScript 模块](js-modules.md)。

## 生成 TypeScript 声明文件 (`d.ts`) {id="generate-typescript-declaration-files-d-ts"}
<primary-label ref="experimental-opt-in"/>

Kotlin/JS 编译器可以从你的 Kotlin 代码生成 TypeScript 定义。这些定义可为 JavaScript 工具和 IDE 中的代码补全与静态分析提供类型信息，使 Kotlin API 在 JavaScript 和 TypeScript 项目中更易于使用。

要生成定义文件，请使用 [`@JsExport`](js-to-kotlin-interop.md#jsexport-annotation) 注解 Kotlin 声明，并在 `build.gradle.kts` 文件的 `js {}` 代码块中添加 `generateTypeScriptDefinitions()` 函数：

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

编译器会收集标记有 `@JsExport` 的顶层声明，并在 `.d.ts` 文件中生成 TypeScript 定义。

有关更多详情，请参阅[生成 TypeScript 声明文件 (`d.ts`)](js-project-setup.md#generation-of-typescript-declaration-files-d-ts)。

## 配置输出粒度 {id="configure-output-granularity"}

你可以选择编译器在项目中输出 `.js` 文件的方式：

* **按模块 (Per module)**：为每个项目模块生成一个独立的 `.js` 文件（默认）。
* **整个程序 (Whole program)**：为整个程序生成单个 `.js` 文件。
* **按文件 (Per file)**：为每个 Kotlin 文件生成一个 `.js` 文件；如果该文件包含导出的声明，则生成两个 `.js` 文件（适用于 `es2015` 和 `es2020` 目标 JavaScript 版本）。

要更改输出粒度，请在 `gradle.properties` 文件中设置 `kotlin.js.ir.output.granularity` 属性：

```properties
# Default: per-module
kotlin.js.ir.output.granularity=whole-program
```

有关配置详情（包括按文件输出的要求），请参阅[配置输出粒度](js-project-setup.md#configure-output-granularity)。

## 顶层属性的延迟初始化 {id="lazy-initialization-of-top-level-properties"}

为了获得更好的应用程序启动性能，Kotlin/JS 编译器会延迟初始化顶层属性。这样一来，应用程序在加载时无需初始化代码中使用的所有顶层属性。它仅初始化启动时所需的属性；其他属性则会在使用它们的代码实际运行时才获取其值。

```kotlin
val a = run {
    val result = // intensive computations
    println(result)
    result
} // value is computed upon the first usage
```

如果出于某种原因需要及早初始化属性（在应用程序启动时初始化），请使用 [`@EagerInitialization`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.js/-eager-initialization/){nullable="true"} 注解对其进行标记。

## 开发二进制文件的增量编译 {id="incremental-compilation-for-development-binaries"}

Kotlin/JS 编译器提供了*开发二进制文件的增量编译模式*，以加快开发过程。
在该模式下，编译器会在模块级别缓存 `compileDevelopmentExecutableKotlinJs` Gradle 任务的结果。
在后续编译中，它会对未更改的源文件重用已缓存的编译结果，从而加快编译速度，尤其是在改动较小的情况下。

增量编译默认处于启用状态。要为开发二进制文件禁用增量编译，请将以下行添加到项目的 `gradle.properties` 或 `local.properties` 中：

```none
# Default: true
kotlin.incremental.js.ir=false
```

> 增量编译模式下的全新构建（clean build）通常会较慢，因为需要创建并填充缓存。
>
{style="note"}

## 生产环境中成员名称的缩减 {id="minification-of-member-names-in-production"}

Kotlin/JS 编译器利用其掌握的关于 Kotlin 类和函数关系的内部信息来执行更高效的缩减（minification），缩短函数、属性和类的名称。这减小了最终打包应用程序的体积。

当你在[生产](js-project-setup.md#building-executables)模式下构建 Kotlin/JS 应用程序时，会自动应用此类缩减，并且该功能默认处于启用状态。要禁用成员名称缩减，请使用 `-Xir-minimized-member-names` 编译器选项：

```kotlin
kotlin {
    js {
        compilations.all {
            compileTaskProvider.configure {
                compilerOptions.freeCompilerArgs.add("-Xir-minimized-member-names=false")
            }
        }
    }
}
```

## 无效代码消除 {id="dead-code-elimination"}

[无效代码消除](https://wikipedia.org/wiki/Dead_code_elimination) (DCE) 通过移除未使用的属性、函数和类，来减小生成的 JavaScript 代码体积。

未使用的声明可能会在以下情况下出现：

* 函数被内联并且从未被直接调用（除少数情况外通常都是如此）。
* 模块使用了共享库。如果没有 DCE，库中未使用的部分仍会包含在最终产物包中。
  例如，Kotlin 标准库包含用于操作列表、数组、字符序列的函数，以及用于 DOM（文档对象模型）的适配器等。所有这些功能如果作为 JavaScript 文件将占用约 1.3 MB。而一个简单的 "Hello, world" 应用程序仅需要控制台例程，整个文件只有几千字节。

在 Kotlin/JS 编译器中，DCE 会自动处理：

* DCE 在*开发*打包任务中被禁用，对应以下 Gradle 任务：

  * `jsBrowserDevelopmentRun`
  * `jsBrowserDevelopmentWebpack`
  * `jsNodeDevelopmentRun`
  * `compileDevelopmentExecutableKotlinJs`
  * `compileDevelopmentLibraryKotlinJs`
  * 名称中包含 "development" 的其他 Gradle 任务

* 如果构建*生产*包，则会启用 DCE，对应以下 Gradle 任务：

  * `jsBrowserProductionRun`
  * `jsBrowserProductionWebpack`
  * `compileProductionExecutableKotlinJs`
  * `compileProductionLibraryKotlinJs`
  * 名称中包含 "production" 的其他 Gradle 任务

通过使用 [`@JsExport`](js-to-kotlin-interop.md#jsexport-annotation) 注解，你可以指定希望 DCE 视为根节点的声明。