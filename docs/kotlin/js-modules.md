[//]: # (title: JavaScript 模块)

你可以将 Kotlin 项目编译为适用于各种流行模块系统的 JavaScript 模块。我们目前支持以下 JavaScript 模块配置：

- [ES 模块](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Modules)，在 JavaScript 中声明模块的标准方式（使用 `import/export` JavaScript 语法）。如果 `target` 设置为 `es2015`，则默认使用它。
- [UMD (Unified Module Definitions)](https://github.com/umdjs/umd)，兼容 *AMD* 和 *CommonJS*。在不被导入或不存在模块系统的情况下，UMD 模块也能够执行。这是 `browser` 和 `nodejs` 目标的默认选项。
- [AMD (Asynchronous Module Definitions)](https://github.com/amdjs/amdjs-api/wiki/AMD)，特别是在 [RequireJS](https://requirejs.org/) 库中使用。
- [CommonJS](http://wiki.commonjs.org/wiki/Modules/1.1)，广泛用于 Node.js/npm（`require` 函数和 `module.exports` 对象）。
- Plain。不为任何模块系统编译。你可以通过其在全局作用域中的名称访问模块。

## Browser 目标 {id="browser-targets"}

如果你打算在 Web 浏览器环境中运行代码，并希望使用 UMD 以外的模块系统，可以在 `webpackTask` 配置块中指定所需的模块类型。例如，要切换到 CommonJS，请使用：

```groovy
kotlin {
    js {
        browser {
            webpackTask {
                output.libraryTarget = "commonjs2"
            }
        }
        binaries.executable()
    }
}

```

Webpack 提供两种不同的 CommonJS 变体：`commonjs` 和 `commonjs2`，它们会影响声明的使用方式。在大多数情况下，你可能需要 `commonjs2`，它会将 `module.exports` 语法添加到生成的库中。或者，你也可以选择严格遵循 CommonJS 规范的 `commonjs` 选项。
要了解更多关于 `commonjs` 和 `commonjs2` 之间差异的信息，请参阅 [Webpack 仓库](https://github.com/webpack/webpack/issues/1114)。

## JavaScript 库和 Node.js 文件 {id="javascript-libraries-and-node-js-files"}

如果你正在创建供 JavaScript 或 Node.js 环境使用的库，并希望使用不同的模块系统，则说明略有不同。

### 选择目标模块系统 {id="choose-the-target-module-system"}

要选择目标模块系统，请在 Gradle 构建脚本中设置 `moduleKind` 编译器选项：

<tabs group="build-script">
<tab title="Kotlin" group-key="kotlin">

```kotlin
tasks.withType<org.jetbrains.kotlin.gradle.targets.js.ir.KotlinJsIrLink> {
    compilerOptions.moduleKind.set(org.jetbrains.kotlin.gradle.dsl.JsModuleKind.MODULE_COMMONJS)
}
```

</tab>
<tab title="Groovy" group-key="groovy">

```groovy
compileKotlinJs.compilerOptions.moduleKind = org.jetbrains.kotlin.gradle.dsl.JsModuleKind.MODULE_COMMONJS
```

</tab>
</tabs>

可用的值包括：`umd`（默认）、`es`、`commonjs`、`amd`、`plain`。

> 这与调整 `webpackTask.output.libraryTarget` 不同。库目标会更改 *由 webpack 生成* 的输出（在代码编译之后）。`compilerOptions.moduleKind` 会更改 *由 Kotlin 编译器生成* 的输出。
>
{style="note"}  

在 Kotlin Gradle DSL 中，还有一个设置 CommonJS 和 ESM 模块类型的快捷方式：

```kotlin
kotlin {
    js {
        useCommonJs()
        // 或
        useEsModules()
        // ...
    }
}
```

## @JsModule 注解 {id="jsmodule-annotation"}

要告知 Kotlin 某个 `external` 类、软件包、函数或属性是一个 JavaScript 模块，你可以使用 `@JsModule` 注解。假设你有一个名为 "hello" 的 CommonJS 模块：

```javascript
module.exports.sayHello = function (name) { alert("Hello, " + name); }
```

你应该在 Kotlin 中这样声明它：

```kotlin
@JsModule("hello")
external fun sayHello(name: String)
```

### 将 @JsModule 应用于软件包 {id="apply-jsmodule-to-packages"}

某些 JavaScript 库导出的是软件包（命名空间）而不是函数和类。就 JavaScript 而言，它是一个包含类、函数和属性等成员的*对象*。将这些软件包导入为 Kotlin 对象通常看起来不自然。编译器可以使用以下表示法将导入的 JavaScript 软件包映射到 Kotlin 软件包：

```kotlin
@file:JsModule("extModule")

package ext.jspackage.name

external fun foo()

external class C
```

其中对应的 JavaScript 模块声明如下：

```javascript
module.exports = {
  foo: { /* 此处为某些代码 */ },
  C: { /* 此处为某些代码 */ }
}
```

标有 `@file:JsModule` 注解的文件不能声明非 external 成员。下面的示例会产生编译时错误：

```kotlin
@file:JsModule("extModule")

package ext.jspackage.name

external fun foo()

fun bar() = "!" + foo() + "!" // 此处报错
```

### 导入更深的软件包层次结构 {id="import-deeper-package-hierarchies"}

在前面的示例中，JavaScript 模块导出了单个软件包。然而，一些 JavaScript 库会从一个模块中导出多个软件包。Kotlin 也支持这种情况，但你必须为导入的每个软件包声明一个新的 `.kt` 文件。

例如，让示例变得稍微复杂一些：

```javascript
module.exports = {
  mylib: {
    pkg1: {
      foo: function () { /* 此处为某些代码 */ },
      bar: function () { /* 此处为某些代码 */ }
    },
    pkg2: {
      baz: function () { /* 此处为某些代码 */ }
    }
  }
}
```

要在 Kotlin 中导入此模块，你必须编写两个 Kotlin 源文件：

```kotlin
@file:JsModule("extModule")
@file:JsQualifier("mylib.pkg1")

package extlib.pkg1

external fun foo()

external fun bar()
```

以及

```kotlin
@file:JsModule("extModule")
@file:JsQualifier("mylib.pkg2")

package extlib.pkg2

external fun baz()
```

### @JsNonModule 注解 {id="jsnonmodule-annotation"}

当声明被标记为 `@JsModule` 时，如果不将其编译为 JavaScript 模块，则无法在 Kotlin 代码中使用它。通常，开发者既会将库作为 JavaScript 模块分发，也会将其作为可下载的 `.js` 文件分发，你可以将其复制到项目的静态资源中并通过 `<script>` 标签包含。要告知 Kotlin 在非模块环境中可以使用 `@JsModule` 声明，请添加 `@JsNonModule` 注解。例如，考虑以下 JavaScript 代码：

```javascript
function topLevelSayHello (name) { alert("Hello, " + name); }

if (module && module.exports) {
  module.exports = topLevelSayHello;
}
```

你可以从 Kotlin 中按如下方式描述它：

```kotlin
@JsModule("hello")
@JsNonModule
@JsName("topLevelSayHello")
external fun sayHello(name: String)
```

### Kotlin 标准库使用的模块系统 {id="module-system-used-by-the-kotlin-standard-library"}

Kotlin 与 Kotlin/JS 标准库以单个文件的形式分发，该文件本身被编译为 UMD 模块，因此你可以将其与上述任何模块系统一起使用。对于 Kotlin/JS 的大多数用例，建议使用对 `kotlin-stdlib-js` 的 Gradle 依赖项，该依赖项在 NPM 上也作为 [`kotlin`](https://www.npmjs.com/package/kotlin) 软件包提供。