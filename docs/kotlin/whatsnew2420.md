[//]: # (title: Kotlin 2.4.20 的最新变化)

<show-structure depth="1"/>

<web-summary>阅读 Kotlin 2.4.20 发行说明，涵盖新的实验性功能以及对标准库、Native、Wasm、JS、Gradle、BTA 和 Kotlin 编译器的更新</web-summary>

_[发布时间：2026 年 9 月 7 日](releases.md#release-history)_

Kotlin 2.4.20 现已发布！以下是本次发行的亮点：

* **标准库：** [支持协程堆栈跟踪恢复，用于检查集合元素相等性与唯一性的新函数，以及针对 `kotlin.test` 断言函数的新重载](#standard-library)
* **Kotlin/Native：** [新的 Swift 导出功能、改进的增量编译，以及针对 SwiftPM 依赖项自动生成的 `Package.swift` 文件](#kotlin-native)
* **Kotlin/Wasm：** [`@JsFun` 声明中顶层 `require()` 调用的变更、伴生对象初始化顺序的改进、Kotlin Gradle 插件中对 Wasmtime 的支持、新的编译模式，以及缩减函数式接口的二进制文件大小](#kotlin-wasm)
* **Kotlin/JS：** [用于浏览器测试的新 DSL、支持将挂起 lambda 导出为异步函数、改进数据类的可导出性](#kotlin-js)
* **Gradle：** [支持 Gradle 9.7.0 以及改进 Problems API 中的报告](#gradle)
* **构建工具 API：** [支持新目标：Kotlin/JS、Kotlin/Wasm 和 Kotlin 元数据](#build-tools-api)
* **Kotlin 编译器：** [`kotlinr` 运行器命令和独立的原生镜像](#kotlin-compiler)

> 有关 Kotlin 发行周期的信息，请参阅 [Kotlin 发行流程](releases.md)。
>
{style="tip"}

## 更新至 Kotlin 2.4.20 {id="update-to-kotlin-2-4-20"}

最新版本的 Kotlin 已包含在最新版本的 [IntelliJ IDEA](https://www.jetbrains.com/idea/download/) 和 [Android Studio](https://developer.android.com/studio) 中。

要更新到新的 Kotlin 版本，请确保将 IDE 更新至最新版本，并在构建脚本中[将 Kotlin 版本更改](releases.md#update-to-a-new-kotlin-version)为 2.4.20。

## 新功能 {id=new-stable-features}
<primary-label ref="stable"/>

Kotlin 2.2.20 引入了在 JVM 21 及更高版本上使用 `invokedynamic` 编译 `when` 表达式的实验性支持。

在 Kotlin 2.4.20 中，该功能现已晋升为[稳定版](components-stability.md#stability-levels-explained)并默认启用。

有关详细信息，请参阅[文档](control-flow.md#bytecode-generation-on-the-jvm)。

## 新功能 {id=new-experimental-features}
<primary-label ref="experimental-exp"/>

以下稳定前阶段的功能已在此版本中提供，包括处于 [Beta](components-stability.md#stability-levels-explained)、[Alpha](components-stability.md#stability-levels-explained) 和[实验性](components-stability.md#stability-levels-explained)状态的功能：

* [标准库：支持协程堆栈跟踪恢复](#support-for-coroutine-stack-trace-recovery)
* [标准库：用于检查集合元素相等性与唯一性的新函数](#new-functions-to-check-collection-elements-for-equality-and-uniqueness)
* [标准库：`kotlin.test` 断言函数的新重载](#new-overloads-for-kotlin-test-assertion-functions)
* [Kotlin/Native：新的 Swift 导出功能](#new-swift-export-features)
* [Kotlin/Native：改进 `klib` 构建工件的增量编译](#improved-incremental-compilation-of-klib-artifacts)
* [Kotlin/JS：用于浏览器测试的新 DSL](#a-new-dsl-for-browser-testing)
* [Kotlin/JS：支持将挂起 lambda 导出为异步函数](#support-for-exporting-suspending-lambdas-as-async-functions)
* [构建工具 API：支持 Kotlin/JS、Kotlin/Wasm 和 Kotlin 元数据](#support-for-kotlin-js-kotlin-wasm-and-kotlin-metadata)
* [Kotlin 编译器：独立的原生镜像](#native-image)

## 标准库 {id="standard-library"}

Kotlin 2.4.20 增加了对协程堆栈跟踪恢复的支持，引入了用于检查集合元素相等性与唯一性的新函数，并为 `kotlin.test` 断言函数提供了新重载。

### 支持协程堆栈跟踪恢复 {id="support-for-coroutine-stack-trace-recovery"}
<primary-label ref="experimental-opt-in"/>
<secondary-label ref="standard-library"/>

Kotlin 2.4.20 向标准库中添加了 [`StackTraceRecoverable`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.coroutines.debug/-stack-trace-recoverable/) 接口。这改进了与 `kotlinx.coroutines` 库的集成，因为它允许你在不添加对 `kotlinx.coroutines` 依赖的情况下，定义如何为堆栈跟踪恢复创建新的异常实例。

堆栈跟踪恢复有助于在协程抛出异常并由另一个协程重新抛出时进行调试。它使你能够查看异常从何处产生，以及另一个协程在何处重新抛出它。

`kotlinx.coroutines` 库通过创建一个包含额外协程堆栈跟踪信息的新异常实例来执行堆栈跟踪恢复。对于构造函数仅接受异常消息、原因 (cause)、二者兼有或不接受实参的异常，这一过程会自动发生。

如果异常构造函数有额外的必需实参（例如行号或错误代码），请实现 `StackTraceRecoverable` 接口来定义 `kotlinx.coroutines` 库如何创建该异常的新实例。

要实现该接口，请重写 [`copyForStackTraceRecovery()`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.coroutines.debug/-stack-trace-recoverable/copy-for-stack-trace-recovery.html) 函数。在重写中，返回一个用于堆栈跟踪恢复的新异常实例；如果你不希望 `kotlinx.coroutines` 库复制该异常，则返回 `null`。

> `StackTraceRecoverable` 接口适用于所有目标平台，但 `kotlinx.coroutines` 库仅在 JVM 上将其用于堆栈跟踪恢复。
>
{style="note"}

这些 API 处于[实验性](components-stability.md#stability-levels-explained)阶段，需要使用 `@OptIn(ExperimentalStdlibCoroutineSupportApi::class)` 注解进行选择加入。

以下是一个自定义异常的示例，该异常在为堆栈跟踪恢复创建新实例时会保留 `line` 属性：

```kotlin
import kotlin.coroutines.ExperimentalStdlibCoroutineSupportApi
import kotlin.coroutines.debug.StackTraceRecoverable

@OptIn(ExperimentalStdlibCoroutineSupportApi::class)
class FileEditException
// 该实现需要一个私有构造函数
// 以将 cause 传递给 IllegalStateException 构造函数
private constructor(
    val line: Int,
    private val detail: String,
    cause: Throwable?,
) : IllegalStateException("When editing line $line: $detail", cause),
    // 实现 StackTraceRecoverable 以进行堆栈跟踪恢复
    StackTraceRecoverable<FileEditException> {

    constructor(line: Int, detail: String) : this(line, detail, null)

    // 复制行号和消息详情
    override fun copyForStackTraceRecovery(): FileEditException =
        FileEditException(line, detail, this)
    }

fun main() {
    val original = FileEditException(15, "Unexpected token")

    // 通常情况下，除非测试其行为，否则无需直接调用此函数
    // kotlinx.coroutines 库会在堆栈跟踪恢复期间自动调用它
    val copy = original.copyForStackTraceRecovery()

    println(copy.message)
    // When editing line 15: Unexpected token

    println(copy.cause == original)
    // true
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="2.4.20"}

有关详细信息，请参阅该功能的 [KEEP](https://github.com/Kotlin/KEEP/blob/main/proposals/stdlib/KEEP-0461-stacktrace-recoverable.md)。

欢迎在 [YouTrack](https://youtrack.jetbrains.com/issue/KT-86595) 中向我们提供反馈。

### 用于检查集合元素相等性与唯一性的新函数 {id="new-functions-to-check-collection-elements-for-equality-and-uniqueness"}
<primary-label ref="experimental-opt-in"/>
<secondary-label ref="standard-library"/>

在 Kotlin 2.4.20 之前，如果你想检查集合元素是否全部不同或全部相等，必须使用低效的代码模式。

Kotlin 2.4.20 引入了实验性函数来填补这一空白：

| 函数 | 检查内容 |
|---|---|
| [`allDistinct()`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.collections/all-distinct.html) | 集合中的每个值都是唯一的。 |
| [`allDistinctBy()`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.collections/all-distinct-by.html) | 每个对象在选定属性上都有唯一的值。 |
| [`allEqual()`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.collections/all-equal.html) | 集合中的每个值都是相同的。 |
| [`allEqualBy()`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.collections/all-equal-by.html) | 每个对象在选定属性上都有相同的值。 |

你可以在集合、序列和数组上使用这些函数。与其他集合操作一样，它们使用结构相等性来比较元素。

这些函数处于[实验性](components-stability.md#stability-levels-explained)阶段，需要使用 `@OptIn(ExperimentalStdlibApi::class)` 注解或 `-opt-in=kotlin.ExperimentalStdlibApi` 编译器选项进行选择加入：

```kotlin
@OptIn(ExperimentalStdlibApi::class)
fun main() {
    data class Response(
        val participantId: String,
        val answer: String,
        val responseDate: String
    )

    val responses = listOf(
        Response("P001", "Yes", "2026-07-21"),
        Response("P002", "Maybe", "2026-07-21"),
        Response("P003", "No", "2026-07-21")
    )

    // 检查是否所有参与者给出了相同的答案
    println(responses.allEqualBy { it.answer })
    // false

    // 检查是否存在重复的参与者
    println(responses.allDistinctBy { it.participantId })
    // true

    // 检查是否所有回复都在同一日期提交
    println(responses.allEqualBy { it.responseDate })
    // true

    val answers = responses.map { it.answer }

    // 检查答案是否完全相同
    println(answers.allEqual())
    // false

    // 检查答案是否各不相同
    println(answers.allDistinct())
    // true
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="2.4.20"}

欢迎在 [KEEP](https://github.com/Kotlin/KEEP/discussions/495) 中向我们提供反馈。

### `kotlin.test` 断言函数的新重载 {id="new-overloads-for-kotlin-test-assertion-functions"}
<primary-label ref="experimental-opt-in"/>
<secondary-label ref="standard-library"/>

Kotlin 2.4.20 为 `kotlin.test` 断言函数添加了新的重载。它们接受一个延迟生成错误消息的 lambda，仅在断言失败时才会生成。

此前，像 `assertTrue()` 或 `assertEquals()` 这样的 `kotlin.test` 断言函数仅接受预先格式化的错误消息，该消息在每次断言时都会构建，即使断言成功且从未实际使用该消息也是如此。

新的重载使 `kotlin.test` API 与 JUnit 5 保持一致，接受通过 lambda 提供的消息提供程序，而不是普通字符串。这提升了性能，特别是对于为断言生成详细错误消息的 [Power-assert 编译器插件](power-assert.md) 而言。

新的重载适用于以下断言函数：

| 函数 | 说明 |
|---|---|
| [`assertTrue()`](https://kotlinlang.org/api/core/kotlin-test/kotlin.test/assert-true.html) / [`assertFalse()`](https://kotlinlang.org/api/core/kotlin-test/kotlin.test/assert-false.html) | 检查值是否为 `true` 或 `false`。 |
| [`assertEquals()`](https://kotlinlang.org/api/core/kotlin-test/kotlin.test/assert-equals.html) / [`assertNotEquals()`](https://kotlinlang.org/api/core/kotlin-test/kotlin.test/assert-not-equals.html) | 检查值是否相等或不相等。 |
| [`assertSame()`](https://kotlinlang.org/api/core/kotlin-test/kotlin.test/assert-same.html) / [`assertNotSame()`](https://kotlinlang.org/api/core/kotlin-test/kotlin.test/assert-not-same.html) | 检查值是否引用同一实例。 |
| [`assertIs()`](https://kotlinlang.org/api/core/kotlin-test/kotlin.test/assert-is.html) / [`assertIsNot()`](https://kotlinlang.org/api/core/kotlin-test/kotlin.test/assert-is-not.html) | 检查值是否为指定类型。对于 `assertIs()`，该函数会将其智能转换为该类型。 |
| [`assertNull()`](https://kotlinlang.org/api/core/kotlin-test/kotlin.test/assert-null.html) | 检查值是否为 `null`。 |
| [`assertContains()`](https://kotlinlang.org/api/core/kotlin-test/kotlin.test/assert-contains.html) | 检查集合、数组、序列、区间或映射中是否存在该元素（键、字符、子字符串或正则表达式）。 |
| [`assertContentEquals()`](https://kotlinlang.org/api/core/kotlin-test/kotlin.test/assert-content-equals.html) | 检查集合、序列或数组是否以相同顺序包含相等的元素。 |

要使用新 API，请显式使用 `@OptIn(ExperimentalKotlinTestApi::class)` 注解进行选择加入：

```kotlin
import kotlin.test.ExperimentalKotlinTestApi
import kotlin.test.assertEquals
import kotlin.test.assertTrue

@OptIn(ExperimentalKotlinTestApi::class)
fun testValues(actual: Int, expected: Int, items: List<String>) {
    // 仅在断言失败时才会构建消息
    assertTrue(actual > 0) { "Expected a positive value but got $actual" }

    // 避免格式化列表，除非断言失败
    assertEquals(expected, actual) { "Unexpected value for items: ${items.joinToString()}" }
}
```

有关详细信息，请参阅该功能的 [KEEP](https://github.com/Kotlin/KEEP/blob/main/proposals/stdlib/KEEP-0465-kotlin.test-lazy-assertion-messages.md)。

## Kotlin/Native {id="kotlin-native"}

Kotlin 2.4.20 为 Kotlin Multiplatform 项目中的 SwiftPM 依赖项带来了 `Package.swift` 文件的自动生成、新的 Swift 导出功能（包括对密封类和跨语言继承的支持），以及改进的增量编译。

### 针对 SwiftPM 依赖项生成 `Package.swift` {id="generated-package-swift-for-swiftpm-dependencies"}
<secondary-label ref="native"/>

当导出依赖于 SwiftPM 软件包的 XCFramework 时，你必须发布生成的 SwiftPM 软件包以便正确解析。为了对此提供支持，`assembleSharedXCFramework` Gradle 任务现在会生成一个随 XCFramework 一起分发的 `Package.swift` 文件。

有关详情，请参阅 [SwiftPM 导出页面](https://kotlinlang.org/docs/multiplatform/multiplatform-spm-export.html)。

### 新的 Swift 导出功能 {id="new-swift-export-features"}
<primary-label ref="alpha"/>
<secondary-label ref="native"/>

#### 密封类 {id="sealed-classes"}

Kotlin 2.4.20 在 Swift 导出中增加了对密封类和接口的支持。

此前，你必须为针对密封类型的每个 `switch` 语句编写 `default` 分支。现在，在 Kotlin 中定义的密封层次结构会映射到 Swift 枚举，从而在 Xcode 中实现具有完整自动补全的穷举式 `switch` 语句。

Swift 导出会在每个密封类型上生成一个 `sealedType()` 方法。该方法返回一个 Swift 枚举，其成员与密封层次结构的直接子类匹配。你可以嵌套这些调用以匹配更深层次的结构。

例如，在 Kotlin 中声明一个包含类层次结构的密封接口：

```kotlin
// Kotlin
sealed interface Shape

class Circle : Shape {
    override fun toString(): String = "Circle"
}

class Rectangle : Shape {
    override fun toString(): String = "Rectangle"
}

fun createCircle(): Shape = Circle()
```

在 Swift 端，你可以使用不需要 `default` 分支的穷举式 `switch`：

```swift
// Swift
let shape = createCircle()

let name = switch shape.sealedType() {
    case let .circle(type): "It's a \(type.value)"
    case let .rectangle(type): "It's a \(type.value)"
}
// name == "It's a Circle"
```

由于 `switch` 是穷举式的，因此如果向密封层次结构中添加了新的子类，编译器会向你发出警告，以便你可以立即处理它，而无需依赖 `default` 分支。

#### Swift 导出中的跨语言继承 {id="cross-language-inheritance-in-swift-export"}

Kotlin 2.4.20 在 Swift 导出中引入了跨语言继承支持。

该功能的一个常见用例是[反向导入](native-lib-import-stability.md#swift-library-import)模式，即在 Kotlin 中定义契约，并在 Swift 端提供平台特定的实现。当你需要使用无法直接导入到 Kotlin 中的纯 Swift 库时，这尤其有用。

要实现该模式，请声明一个供 Swift 实现继承的 Kotlin 超类以及一个 Kotlin 接口。然后在 Swift 中实现该接口，并将 Swift 对象传递给接受该接口的 Kotlin 函数。
例如，针对 CryptoKit 库：

1. 在 Kotlin 端，声明一个接口、一个接受该接口的函数以及一个 `open` 基类：

   ```kotlin
   // Kotlin
   interface CryptoProvider {
       fun hashMD5(input: String): String
   }

   fun processHash(provider: CryptoProvider, input: String): String = provider.hashMD5(input)

   open class SwiftBase
   ```

2. 在 Swift 端，继承导出的 `SwiftBase` 类，使用纯 Swift 库实现该接口，并将对象传回 Kotlin：

   ```swift
   // Swift
   import CryptoKit

   final class IosCryptoProvider: SwiftBase, CryptoProvider {
       func hashMD5(input: String) -> String {
           guard let data = input.data(using: .utf8) else { return "failed" }
           return Insecure.MD5.hash(data: data).description
       }
   }

   let provider = IosCryptoProvider()

   // 调用 Kotlin 函数，该函数会回调 Swift 中的 hashMD5()
   print(processHash(provider: provider, input: "Hello, world!"))
   ```

当 Kotlin 接收到 Swift 对象时，会将其视为常规接口的实现，直接调用 Swift 代码。

有关 Swift 导出的更多详情，请参阅我们的[文档](native-swift-export.md)。

### 改进 `klib` 构建工件的增量编译 {id="improved-incremental-compilation-of-klib-artifacts"}
<primary-label ref="beta"/>
<secondary-label ref="native"/>

Kotlin 2.4.20 带来了对 `klib` 构建工件增量编译的稳定性改进，该功能目前处于 [Beta](components-stability.md#kotlin-native) 阶段。

此优化最早在 [Kotlin 1.9.20](whatsnew1920.md#incremental-compilation-of-klib-artifacts) 中引入，并证明可以大幅减少调试构建的编译时间。自那时起，我们修复了许多错误并提升了性能。

要体验增量编译，请将以下选项添加到 `gradle.properties` 文件中：

```properties
kotlin.incremental.native=true
```

我们正在积极收集反馈，并计划在后续的 Kotlin 版本中为所有项目默认启用增量编译。如果遇到任何问题，请将其报告到我们的[问题跟踪器](https://kotl.in/issue)。

## Kotlin/Wasm {id="kotlin-wasm"}

Kotlin 2.4.20 更改了 Kotlin/Wasm 处理 `@JsFun` 声明中顶层 `require()` 调用的方式，使伴生对象初始化顺序与 JVM 行为保持一致，缩减了函数式接口的二进制文件大小，引入了新的编译模式，并在 Kotlin Gradle 插件中添加了对 Wasmtime 作为 `wasmWasi` 目标运行时的支持。

### `@JsFun` 声明中顶层 `require()` 调用的变更 {id="changes-to-top-level-require-calls-in-jsfun-declarations"}
<secondary-label ref="wasm"/>

当 [`@JsFun`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin/-js-fun/) 声明使用顶层 `require()` 函数时，Kotlin/Wasm 现在会报告错误。

此前，编译器会在 `import-object.mjs` 文件中生成一个 `require` 变量，允许 `@JsFun` 声明调用 `require()`。

这种行为无意中暴露了编译器实现细节。为了支持迁离该做法，Kotlin/Wasm 移除了此生成的 `require` 声明，编译器现在会对此类调用报错。例如：

```kotlin
// 报告错误
@JsFun("(mod) => require(mod)")
external fun loadModule(mod: String): JsAny
```

要适应此变更，请将 `@JsFun` 声明中的顶层 `require()` 调用替换为 [`@JsModule`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.js/-js-module/) 注解：

```kotlin
@JsModule("module")
external val module: Module

external interface Module {
    // 定义预期的模块成员
}
```

对于动态模块加载，请改用 `import()` 表达式。
添加 `/* webpackIgnore: true */` 魔法注释以防止 webpack 解析动态导入：

```kotlin
@JsFun("""
    ((module) => () => module)(
        await import(/* webpackIgnore: true */ "module")
    )
""")
private external fun loadModuleDynamically(): JsAny?
```

你也可以有条件地使用 `import()` 表达式。例如，仅在 Node.js 中运行时加载模块：

```kotlin
@JsFun("""
    ((module) => () => module)(
        ((typeof process !== "undefined") && (process.release.name === "node"))
            ? await import(/* webpackIgnore: true */ "module")
            : null
    )
""")
private external fun loadNodeModule(): JsAny?
```

如果你的项目依赖需要顶层 `require()` 函数的依赖项，可以将其作为 `globalThis` 的属性添加作为变通方法：

```kotlin
@JsFun("""
    ((module) => {
        globalThis.require = module.default.createRequire(import.meta.url)
        return () => {}
    })(await import("node:module"))
""")
external fun defineRequire()
```

如果遇到任何问题，请在我们的[问题跟踪器](https://youtrack.jetbrains.com/issue/KT-86192)中分享你的反馈。

### 改进伴生对象初始化顺序 {id="improved-companion-object-initialization-order"}
<secondary-label ref="wasm"/>

Kotlin/Wasm 现在会在子类伴生对象之前初始化超类伴生对象，与 JVM 行为保持一致。
此前，初始化顺序可能是反向的，导致跨平台行为不一致。

本次更新改善了跨平台的一致性，并减少了类初始化行为中平台特定的差异。它还能够在更深的继承层次结构中正确处理伴生对象初始化，包括中间类未声明伴生对象的情况。

### Kotlin Gradle 插件支持 Wasmtime {id="support-for-wasmtime-in-the-kotlin-gradle-plugin"}
<secondary-label ref="wasm"/>

Kotlin 2.4.20 引入了在 Kotlin Gradle 插件中支持 [Wasmtime](https://docs.wasmtime.dev/) 作为 `wasmWasi` 目标的运行时。

此前，`wasmWasi` 目标仅支持 Node.js 运行时，这需要 JavaScript 引导程序来运行 WASI 应用程序。有了 Wasmtime 支持，你现在可以在独立的 WebAssembly 运行时上运行 Kotlin/Wasm 应用程序。

要使用 Wasmtime 作为 `wasmWasi` 目标的运行时，请将 `wasmtime()` 添加到 Gradle 构建文件中：

```kotlin
kotlin {
    wasmWasi {
        wasmtime()
    }
}
```

欢迎在 [YouTrack](https://youtrack.jetbrains.com/issue/KT-86633) 中向我们提供反馈。

### 新的编译模式 {id="new-compilation-modes"}
<secondary-label ref="wasm"/>

Kotlin 2.4.20 增加了对选择 Kotlin/Wasm 编译模式的支持，包括新的多模块模式。此前，编译器采用整块 (monolith) 编译模式，即将项目及其依赖项一起编译并生成单个二进制文件。这使编译器能够执行无效代码消除并生成最小的输出。

你现在可以选择以下编译模式之一：

| 编译模式 | 编译方式 | 输出 | 优化行为 |
|---|---|---|---|
| `monolith`（默认） | 将项目及其依赖项一起编译。 | 单个二进制文件 | 移除无法访问的声明，并对整个程序（包括依赖项）应用优化。 |
| `multimodule-open-world` | 独立编译每个模块，仅重新编译发生更改的模块。 | 每个模块对应一个独立的二进制文件 | 不应用跨模块优化，这会导致二进制文件体积较大。 |
| `multimodule-closed-world` | 在一次调用中处理所有模块，仅重新编译发生更改的模块。 | 相互依赖的多个独立二进制文件 | 移除无法访问的声明，但对每个 Wasm 二进制文件独立进行优化。 |

要选择编译模式，请将 `kotlin.wasm.compilationMode` 属性添加到 `gradle.properties` 文件中：

```properties
kotlin.wasm.compilationMode=multimodule-open-world
```

你还可以将 Kotlin/Wasm 配置为在开发构建中使用封闭世界多模块编译，而在生产构建中使用整块编译。这可以减少开发期间的重新编译时间，并为生产构建生成最小的输出。

要使用此配置，请将以下属性添加到 `gradle.properties` 文件中：

```properties
kotlin.wasm.compilationMode=multimodule-closed-world-only-in-dev
```

欢迎在 [YouTrack](https://youtrack.jetbrains.com/issue/KT-86919) 中向我们提供反馈。

### 缩减 lambda 和函数式接口的二进制文件大小 {id="reduced-binary-size-for-lambdas-and-functional-interfaces"}
<secondary-label ref="wasm"/>

Kotlin 2.4.20 更改了 Kotlin/Wasm 编译 lambda 和函数式接口的方式。
编译器现在不再生成单独的匿名类，而是生成函数并使用共享基类。

针对 [KotlinConf 应用程序](https://github.com/JetBrains/kotlinconf-app)的测试表明，该更改使 Wasm 二进制文件大小缩减了约 5–10%。

由于此更改引入了更多动态调用，可能会影响运行时性能。
如果遇到任何问题，请在我们的[问题跟踪器](https://youtrack.jetbrains.com/issue/KT-83159)中进行报告。

## Kotlin/JS {id="kotlin-js"}

Kotlin 2.4.20 改进了数据类的可导出性，引入了用于浏览器测试的全新实验性 DSL，并增加了对将挂起 lambda 导出为 JavaScript 异步函数的支持。

### 导出数据类上合成函数的可导出性保持一致 {id="consistent-exportability-of-synthetic-functions-on-exported-data-classes"}
<secondary-label ref="js"/>

Kotlin 2.4.20 修复了导致 `@JsExport.Ignore` 注解无法正确应用于数据类属性的问题。

此前，当你使用 `@JsExport` 注解标记数据类时，由于自动生成的 `copy()` 和 `componentN()` 函数，编译器仍会报告有关该数据类可导出性的警告。即使构造函数和属性已显式标记为带有 `@JsExport.Ignore` 忽略，也会发生这种情况。

例如，考虑导出到 JavaScript 的 `Session` 数据类，它还引用了不打算导出的内部 `DatabaseConnection` 类型：

```kotlin
// Kotlin
// 未导出到 JavaScript 的内部类型
class DatabaseConnection

@JsExport
data class Session @JsExport.Ignore constructor(
    val userId: String,
    @JsExport.Ignore val connection: DatabaseConnection,
)
```

现在该问题已修复，编译器会识别 `@JsExport.Ignore` 注解，因此 `Session` 的合成 `copy()` 和 `componentN()` 函数不再针对未导出的类型 `DatabaseConnection` 触发警告。这与 [`@ConsistentCopyVisibility` 和 `@ExposedCopyVisibility` 注解](whatsnew2020.md#data-class-copy-function-to-have-the-same-visibility-as-constructor)引入的可见性规则保持一致。

### 用于浏览器测试的新 DSL {id="a-new-dsl-for-browser-testing"}
<primary-label ref="experimental-opt-in"/>
<secondary-label ref="js"/>

Kotlin 2.4.20 引入了一个全新的实验性 DSL，用于在浏览器环境中运行 Kotlin/JS 测试。

目前，Kotlin Gradle 插件使用 [Karma](https://github.com/karma-runner/karma) 作为浏览器启动器在不同浏览器中运行 JavaScript 测试。Karma 项目已被弃用两年，这促使我们探索支持浏览器测试的替代方案。

新的 DSL 旨在取代 Karma 作为底层不同工具的管理器，其中包括：

* [Playwright](https://playwright.dev/) 作为浏览器驱动程序和分发管理器，支持 Chromium、Firefox 和 WebKit (Safari) 浏览器引擎。
* [Mocha](https://mochajs.org/) 作为测试运行程序。
* [webpack](https://webpack.js.org/) 作为打包器（将在[未来版本](https://youtrack.jetbrains.com/issue/KT-48308/)中被 [Vite](https://vite.dev/) 替换）。

要体验用于浏览器测试的新 DSL，请在 Kotlin/JS 目标的 `browser {}` 内部添加选择加入的 `test {}` 块：

```kotlin
import org.jetbrains.kotlin.gradle.ExperimentalJsTestDsl
import kotlin.time.Duration.Companion.seconds

kotlin {
    js {
        browser {
            // 添加并配置新的 test {} 块
            @OptIn(ExperimentalJsTestDsl::class)
            test {
                // 为所有运行程序配置默认超时
                timeout = 2.seconds
                // 使用 Gradle providers 配置无头模式
                headless = providers
                    .environmentVariable("IS_IN_CI")
                    .map { it.toBoolean() }
                    .orElse(false)
                // 启用并配置 Chromium 测试运行程序
                chromium {
                    // 重写常规超时选项
                    timeout = 5.seconds
                    // 添加额外的启动实参
                    launchArgs.add("--no-sandbox")
                }
                // 启用 Firefox 测试运行程序
                firefox()
                // 启用 WebKit 测试运行程序
                webkit()
                // 启用并配置额外的 WebKit 测试运行程序
                webkit("noheadless") {
                    // 设置自定义选项
                    headless = false
                }
            }
        }
    }
}
```

用于浏览器测试的新 DSL 正处于积极开发中。欢迎在 [YouTrack](https://youtrack.jetbrains.com/issue/KT-66897) 中向我们提供反馈。

有关详细信息，请参阅[在 Kotlin/JS 中运行测试](js-running-tests.md)。

### 支持将挂起 lambda 导出为异步函数 {id="support-for-exporting-suspending-lambdas-as-async-functions"}
<primary-label ref="experimental-general"/>
<secondary-label ref="js"/>

在 Kotlin 2.4.20 中，你现在可以将挂起 [lambda 表达式](lambdas.md#lambda-expressions-and-anonymous-functions)导出为 JavaScript `async` 函数。

此前，无法从 Kotlin/JS 库中导出包含挂起 lambda 的声明。现在，Kotlin 编译器会自动处理 Kotlin 的 `suspend` 函数与 JavaScript 原生 [`async`/`await`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/async_function) 模型之间的桥接，这对于混合的 Kotlin/TypeScript 代码库非常有用。

要启用此功能，请将以下编译器选项添加到你的 `build.gradle.kts` 文件中：

```kotlin
kotlin {
    js {
        compilations.all {
            compileTaskProvider.configure {
                compilerOptions {
                    freeCompilerArgs.add("-Xsuspend-lambda-exporting")
                }
            }
        }
    }
}
```

然后，使用 `@JsExport` 标记相关声明：

```kotlin
// Kotlin
@JsExport
class TaskRunner {
    suspend fun runTask(task: suspend () -> String): String {
        return task()
    }
}
```

在 TypeScript 端，挂起 lambda 会表现为普通的 `async` 函数：

```typescript
// TypeScript
import { TaskRunner } from "..."

const runner = new TaskRunner();
const result = await runner.runTask(async () => "done");
console.log(result); // "done"
```

有关 `@JsExport` 注解的更多信息，请参阅[我们的文档](js-to-kotlin-interop.md#jsexport-annotation)。

## Gradle {id="gradle"}

Kotlin 2.4.20 完全兼容 Gradle 7.6.3 至 9.7.0。你也可以使用最高到最新版本的 Gradle 发行版。但请注意，这样做可能会导致弃用警告，并且某些新的 Gradle 功能可能无法正常工作。

Kotlin 2.4.20 还改进了与 Problems API 的集成。

### 改进 Problems API 中的报告 {id="improved-reporting-in-problems-api"}
<secondary-label ref="gradle"/>

Kotlin 2.2.0 是 [Kotlin Gradle 插件 (KGP) 与 Gradle 的 Problems API 进行集成](whatsnew22.md#integration-of-problems-api-within-kgp-diagnostics)的首个版本。Kotlin 2.4.0 增加了对[将 Kotlin/JVM 的编译器消息写入 Problems API](whatsnew24.md#compiler-messages-written-to-problems-api-for-kotlin-jvm) 的支持。

Kotlin 2.4.20 在编译器传递给 [Problems API](https://docs.gradle.org/current/kotlin-dsl/gradle/org.gradle.api.problems/index.html) 的信息中添加了编译器诊断 ID。它还按这些 ID 对诊断进行分组，从而更容易识别编译问题的来源。

从 Gradle 8.6 开始，KGP 默认启用此集成。由于该 API 仍在演进中，建议使用最新的 Gradle 版本以体验最新改进。

## 构建工具 API {id="build-tools-api"}

Kotlin 2.4.20 在构建工具 API 中增加了对 Kotlin/JS、Kotlin/Wasm 和 Kotlin 元数据的实验性支持。

### 支持 Kotlin/JS、Kotlin/Wasm 和 Kotlin 元数据 {id="support-for-kotlin-js-kotlin-wasm-and-kotlin-metadata"}
<primary-label ref="experimental-general"/>
<secondary-label ref="bta"/>

在 [Kotlin 2.2.0](whatsnew22.md#new-experimental-build-tools-api) 中，构建工具 API (BTA) 开始支持 Kotlin/JVM。Kotlin 2.4.20 通过添加对新目标（Kotlin/JS、Kotlin/Wasm 和 Kotlin 元数据）的支持，朝着 BTA 稳定化迈出了下一步。

这使得 Kotlin Gradle 插件与编译器的交互更加一致。在某些情况下，你还可以享受到更快、更稳定的编译体验。

BTA 是一个通用 API，充当构建系统与 Kotlin 编译器生态系统之间的抽象层。它有助于在可用的构建工具中支持 Kotlin 功能以及与 Kotlin 编译器的兼容性。

在 Kotlin 2.4.20 中，BTA 针对新目标作为选择加入功能提供。要体验它，请将相应的属性添加到你的 `gradle.properties` 文件中：

```properties
kotlin.wasm.runViaBuildToolsApi=true
kotlin.js.runViaBuildToolsApi=true
kotlin.metadata.runViaBuildToolsApi=true
```

从 Kotlin 2.5.0 开始，我们计划在 Kotlin/JS、Kotlin/Wasm 和 Kotlin 元数据中默认启用 BTA。

如果你对 BTA 提案感到好奇或想分享反馈，请参阅此 [KEEP](https://github.com/Kotlin/KEEP/blob/build-tools-api/proposals/extensions/build-tools-api.md)。

## Kotlin 编译器 {id="kotlin-compiler"}

Kotlin 2.4.20 包含了关于已更改的 Kotlin 运行器命令 `kotlinr` 的更新，并引入了实验性的 Kotlin 编译器原生镜像。

### 将 Kotlin 运行器命令从 `kotlin` 更改为 `kotlinr` {id="changed-the-kotlin-runner-command-from-kotlin-to-kotlinr"}
<secondary-label ref="compiler"/>

`kotlinr` 命令取代了 `kotlin` 作为 Kotlin 运行器命令，以避免与 [Kotlin 工具链](https://kotlin-toolchain.org/latest/)中的 `kotlin` 命令发生命名冲突。当你使用 `kotlin` 命令时，Kotlin 运行器还会发出警告并建议改用 `kotlinr`。

### 原生镜像 {id="native-image"}
<primary-label ref="experimental-general"/>
<secondary-label ref="compiler"/>

Kotlin 2.4.20 推出了 Kotlin 编译器原生镜像的第一个[实验性](components-stability.md#stability-levels-explained)版本。该原生镜像可直接替代标准的 `kotlinc` 命令行工具，同时提供更快的启动时间和更高的性能。

要体验原生镜像，请从 [GitHub Releases](https://github.com/JetBrains/kotlin/releases/tag/v2.4.20) 下载对应构建版本。

该原生镜像还捆绑了以下编译器插件，你可以通过 `-Xplugin` 或 `-Xcompiler-plugin` CLI 选项使用它们：

* [Serialization](serialization.md)
* [Compose 编译器](compose-compiler-options.md)
* [All-open](all-open-plugin.md)
* [`no-arg`](no-arg-plugin.md)
* [带接收者的 SAM](sam-with-receiver-plugin.md)
* [Assignment](https://plugins.gradle.org/plugin/org.jetbrains.kotlin.plugin.assignment)
* [Lombok](lombok.md)
* [Power-assert](power-assert.md)

有关 Kotlin 编译器原生镜像的更多信息，请参阅其 [README](https://github.com/JetBrains/kotlin/blob/master/prepare/compiler-native-image/README.md)。

## 不兼容变更与弃用 {id="breaking-changes-and-deprecations"}

本节重点介绍重要的不兼容变更和弃用。有关完整概述，请参阅我们的[兼容性指南](compatibility-guide-24.md)。

* 由于 Apple 正在放弃对其 32 位 watchOS 目标的支持，`watchosArm32` [Kotlin/Native](native-target-support.md) 目标现已被弃用。计划在 Kotlin 2.5.0 中将其移除，以确保与 Xcode 27 兼容。
* 从 Kotlin 2.4.20 开始，Kotlin/Native 编译器禁止在 `public` 内联函数内部或从另一个文件调用的 `internal` 内联函数内部进行 AtomicFU 原子操作。
* Kotlin 2.4.20 将 webpack 的 npm 依赖项更新为 5.108.1。这可能会在两个方面影响你的项目：
  * webpack 已将其内置的压缩器 (minimizer) 依赖项从 `terser-webpack-plugin` 迁移到范围更广的 [`minimizer-webpack-plugin`](https://www.npmjs.com/package/minimizer-webpack-plugin)。Terser 仍然是默认的 JavaScript 压缩器，但如果你的项目直接配置或依赖于 `terser-webpack-plugin`，你可能需要更新其配置。
  * webpack 在确定 JavaScript 文件的模块类型时不再忽略 `import.meta`。如果存在 `import.meta`，webpack 会将该文件视为 ES 模块，这可能会破坏同时使用 CommonJS 构造的文件。对于 Kotlin/JS，你可以[使用 `useEsModules()` Gradle DSL 将目标配置为使用 ES 模块](js-modules.md#choose-the-target-module-system)。在大多数情况下，Kotlin/Wasm 无需额外配置即可正常工作。如果遇到有关 Kotlin/Wasm 的 `import.meta` 错误，请检查项目的源文件或直接/传递依赖项是否使用了 `import.meta`。根据需要更新你自己的代码。如果是依赖项导致了该问题，请将其更新为兼容版本（如果可用），或将问题报告给库维护人员。
* 从 Kotlin 2.4.20 开始，Kotlin/Wasm 弃用了生成的 JavaScript `wasmExports` API。编译器禁止访问除 `wasmExports.memory` 之外的所有导出项，后者暂时可用并伴随警告。请使用 `kotlin.wasm.unsafe.wasmMemory` 属性访问模块的 `WebAssembly.Memory` 对象。

## 文档更新 {id="documentation-updates"}

自上个版本以来，我们为 Kotlin 生态系统文档创建了新的页面和教程，并对现有内容进行了翻新：

* [配置 iOS 交付流水线](https://kotlinlang.org/docs/multiplatform/ios-ci-cd-teamcity.html) – 使用 TeamCity 为 Kotlin Multiplatform iOS 应用设置持续交付。
* Compose Multiplatform 更新：
  * [弹窗 (Popups)](https://kotlinlang.org/docs/multiplatform/compose-popups.html) – 了解如何在 Compose Multiplatform 中创建和配置弹窗。
  * [窗口和对话框 API v2](https://kotlinlang.org/docs/multiplatform/compose-desktop-top-level-windows-management.html#window-and-dialog-api-v2) – 探索在 Compose Multiplatform 中管理桌面窗口和对话框的新 API。
  * [托盘和通知](https://kotlinlang.org/docs/multiplatform/compose-desktop-tray.html) – 了解如何在桌面端 Compose Multiplatform 中向系统托盘添加应用程序图标以及发送系统通知。
  * [菜单栏](https://kotlinlang.org/docs/multiplatform/compose-desktop-menu-bar.html) – 了解如何在桌面端 Compose Multiplatform 中为特定窗口创建菜单栏。
  * [拖放](https://kotlinlang.org/docs/multiplatform/compose-drag-drop.html#platform-specific-data-handling) – 了解在 Compose Multiplatform 中实现拖放时如何处理平台特定数据。
  * [Liquid Glass 的 UIKit 替代方案](https://kotlinlang.org/docs/multiplatform/ios-liquid-glass.html#alternative-skip-swiftui-and-drive-uikit-from-kotlin) – 探索 Liquid Glass 的替代方案，该方案使用 UIKit 导航而非 SwiftUI。
  * [用于 AI Agent 的 MCP 服务器](https://kotlinlang.org/docs/multiplatform/compose-hot-reload.html#mcp-server-for-ai-agents) – 了解如何使用 Compose 热重载中的 MCP 服务器将 AI Agent 连接到你的开发工作流。
* [使用 Spring 进行缓存](https://spring.io/guides/gs/caching) – 通过新的 Kotlin 示例了解如何向 Spring 应用程序添加缓存。
* [Exposed IntelliJ IDEA 插件](https://www.jetbrains.com/help/idea/exposed.html) – 了解如何在 IntelliJ IDEA 中利用代码补全、数据库感知检查和实时模板来使用 Exposed。
* [Kotlin 序列化](serialization.md) – 了解如何序列化 Kotlin 数据、自定义 JSON 结构和类型表示，以及处理更高级的序列化场景。
* [Flow](coroutines-flow.md) 与 [Flow 操作符](coroutines-flow-operators.md) – 了解如何创建和收集冷流与热流、处理异常，以及使用各种 Flow 操作符。
* [调试协程](coroutines-debugging.md) – 了解如何使用调试模式、堆栈跟踪恢复和调试代理在 JVM 上调试协程。
* Lincheck – 了解 Lincheck 中[模型检查](lincheck-model-checking.md)的工作原理、如何使用[操作执行选项](lincheck-operation-execution-options.md)，以及如何[验证](lincheck-results-validation.md)测试结果。
* [kapt 编译器插件](kapt.md) – 了解如何在 Gradle、Maven 和命令行编译器中配置 kapt 编译器插件。
* [Kotlin 项目中的代码质量工具](jvm-code-analysis.md) – 探索用于分析 JVM 字节码和 Kotlin 代码的工具。
* [在 Maven 中使用 Power-assert 插件](jvm-test-maven.md#get-detailed-failure-messages) – 了解如何使用 Power-assert 插件获取更详细的测试失败消息。
* [KSP 多轮处理](ksp-multi-round.md) – 探索 KSP 在多个处理轮次中的工作机制，包括生成的文件、延迟符号和验证。
* 无法表示的类型 (Non-denotable types) – 了解 Kotlin 中的[平台类型](java-interop.md#null-safety-and-platform-types)、[捕获类型](generics.md#captured-types)和[交叉类型](typecasts.md#intersection-types)。
* [类型别名](type-aliases.md) – 了解类型别名的作用域和可见性。
* [This 表达式](this-expressions.md) – 了解隐式 `this` 是如何解析的，以及何时显式使用 `this` 来引用接收者。
* [字符串](strings.md) – 了解字符串模板、常见字符串操作、构建字符串以及类型转换。
* [软件包和导入](packages.md) – 了解如何使用软件包和导入来组织 Kotlin 代码。