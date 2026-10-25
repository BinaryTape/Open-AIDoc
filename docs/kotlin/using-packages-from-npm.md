[//]: # (title: 使用来自 npm 的依赖项)

在 Kotlin/JS 项目中，所有依赖项都可以通过 Gradle 插件进行管理。这包括 Kotlin/Multiplatform 库，例如 `kotlinx.coroutines`、`kotlinx.serialization` 或 `ktor-client`。

对于依赖来自 [npm](https://www.npmjs.com/) 的 JavaScript 软件包，Gradle DSL 公开了 `npm` 函数，允许你指定想要从 npm 导入的软件包。我们来看一下导入名为 [`is-sorted`](https://www.npmjs.com/package/is-sorted) 的 npm 软件包的示例。

Gradle 构建文件中的相应部分如下所示：

```kotlin
dependencies {
    // ...
    implementation(npm("is-sorted", "^1.0.5"))
}
```

因为 JavaScript 模块通常是动态类型的，而 Kotlin 是一门静态类型语言，所以你需要提供一种适配器。在 Kotlin 中，此类适配器被称为_外部声明_。对于仅提供一个函数的 `is-sorted` 软件包，该声明编写起来很简单。在源文件夹内，创建一个名为 `is-sorted.kt` 的新文件，并填入以下内容：

```kotlin
@JsModule("is-sorted")
@JsNonModule
external fun <T> sorted(a: Array<T>): Boolean
```

请注意，如果你使用 CommonJS 作为目标，则需要相应地调整 `@JsModule` 和 `@JsNonModule` 注解。

该 JavaScript 函数现在可以像普通的 Kotlin 函数一样使用。因为我们在头文件中提供了类型信息（而不是仅仅将形参和返回值类型定义为 `dynamic`），所以也可以获得良好的编译器支持和类型检查。

```kotlin
console.log("Hello, Kotlin/JS!")
console.log(sorted(arrayOf(1,2,3)))
console.log(sorted(arrayOf(3,1,2)))
```

无论在浏览器还是在 Node.js 中运行这三行代码，输出均显示对 `sorted` 的调用已正确映射到 `is-sorted` 软件包所导出的函数：

```kotlin
Hello, Kotlin/JS!
true
false
```

由于 JavaScript 生态系统具有在软件包中公开函数的多种方式（例如，通过命名导出或默认导出），因此其他 npm 软件包的外部声明可能需要稍微调整结构。

要详细了解如何编写声明，请参阅[从 Kotlin 中调用 JavaScript](js-interop.md)。