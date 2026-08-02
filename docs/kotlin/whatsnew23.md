[//]: # (title: Kotlin 2.3.0 最新变化)

<web-summary>阅读 Kotlin 2.3.0 版本说明，涵盖新语言功能、Kotlin 多平台、JVM、Native、JS 和 Wasm 的更新，以及对 Gradle 和 Maven 的构建工具支持。</web-summary>

_[发布日期：2025 年 12 月 16 日](releases.md#release-history)_

<tldr>
    <p>有关错误修复版本 2.3.10 的详细信息，请参阅 <a href="https://github.com/JetBrains/kotlin/releases/tag/v2.3.10">变更日志</a></p>
</tldr>

Kotlin 2.3.0 版本正式发布！以下是主要亮点：

* **语言**：[更多稳定和默认功能、未使用的返回值检查器、显式支持字段，以及对上下文相关解析的更改](#language)。
* **Kotlin/JVM**：[支持 Java 25](#kotlin-jvm-support-for-java-25)。
* **Kotlin/Native**：[通过 Swift 导出改进互操作性、提高发布任务的构建时间、Beta 版中支持 C 和 Objective-C 库导入](#kotlin-native)。
* **Kotlin/Wasm**：[默认启用完全限定名称和新的异常处理提案，以及针对 Latin-1 字符的新紧凑存储](#kotlin-wasm)。
* **Kotlin/JS**：[新的实验性挂起函数导出、`LongArray` 表示、统一的伴生对象访问等](#kotlin-js)。
* **Gradle**：[兼容 Gradle 9.0 以及用于注册生成源的新 API](#gradle)。
* **Compose 编译器**：[针对混淆后的 Android 应用程序的堆栈跟踪](#compose-compiler-stack-traces-for-minified-android-applications)。
* **标准库**：[稳定的时间跟踪功能以及改进的 UUID 生成和解析](#standard-library)。

您也可以在此视频中查看更新概览：

<video src="https://www.youtube.com/v/_6PSSkqwbp8" title="Kotlin 2.3 实战"/>

> 有关 Kotlin 发布周期的信息，请参阅 [Kotlin 发布流程](releases.md)。
> 
{style="tip"}

## IDE 支持

支持 2.3.0 的 Kotlin 插件已捆绑在最新版本的 IntelliJ IDEA 和 Android Studio 中。
您无需在 IDE 中更新 Kotlin 插件。
您只需在构建脚本中将 [Kotlin 版本更改](releases.md#update-to-a-new-kotlin-version)为 2.3.0。

有关详细信息，请参阅[更新到新版本](releases.md#update-to-a-new-kotlin-version)。

## 语言

Kotlin 2.3.0 专注于功能稳定化，引入了一种用于检测未使用返回值的新机制，并改进了上下文相关解析。

### 稳定功能

在之前的 Kotlin 版本中，有几个新语言功能作为实验性和 Beta 版引入。
以下功能现已在 Kotlin 2.3.0 中晋升为[稳定版](components-stability.md#stability-levels-explained)：

* [支持嵌套类型别名](whatsnew22.md#support-for-nested-type-aliases)
* [针对 `when` 表达式的基于数据流的穷举性检查](whatsnew2220.md#data-flow-based-exhaustiveness-checks-for-when-expressions)

### 默认启用的功能

在 Kotlin 2.3.0 中，支持[带有显式返回值类型的表达式体中的 `return` 语句](whatsnew2220.md#support-for-return-statements-in-expression-bodies-with-explicit-return-types)现在已默认启用。

[查看 Kotlin 语言功能和提案的完整列表](kotlin-language-features-and-proposals.md)。

### 未使用的返回值检查器
<primary-label ref="experimental-general"/>

Kotlin 2.3.0 引入了未使用的返回值检查器，以帮助防止忽略结果。
每当表达式返回除 `Unit` 或 `Nothing` 以外的值，且未传递给函数、未在条件中检查或以其他方式使用时，它都会向您发出警告。

该检查器有助于捕获因函数调用产生了有意义的结果但被静默丢弃而导致的错误，这可能会导致意外行为或难以跟踪的问题。

> 该检查器会忽略从 `++` 和 `--` 等递增操作返回的值。
>
{style="note"}

考虑以下示例：

```kotlin
fun formatGreeting(name: String): String {
    if (name.isBlank()) return "Hello, anonymous user!"
    if (!name.contains(' ')) {
        // 检查器报告警告，指出该结果被忽略
        "Hello, " + name.replaceFirstChar(Char::titlecase) + "!"
    }
    val (first, last) = name.split(' ')
    return "Hello, $first! Or should I call you Dr. $last?"
}
```

在此示例中，创建了一个字符串但从未被使用，因此检查器将其报告为被忽略的结果。

此功能是[实验性功能](components-stability.md#stability-levels-explained)。
要选择性启用，请在您的构建文件中添加以下编译器选项：

<tabs group="build-system">
<tab title="Gradle" group-key="gradle">

```kotlin
kotlin {
    compilerOptions {
        freeCompilerArgs.add("-Xreturn-value-checker=check")
    }
}
```

</tab>
<tab title="Maven" group-key="maven">

```xml
<build>
    <plugins>
        <plugin>
            <groupId>org.jetbrains.kotlin</groupId>
            <artifactId>kotlin-maven-plugin</artifactId>
            <configuration>
                <args>
                    <arg>-Xreturn-value-checker=check</arg>
                </args>
            </configuration>
        </plugin>
    </plugins>
</build>
```

</tab>
</tabs>

使用此选项时，检查器仅报告来自已标记表达式（例如 Kotlin 标准库中的大多数函数）的忽略结果。

要标记您的函数，请使用 `@MustUseReturnValues` 注解来标记您希望检查器报告忽略返回值的范围。

例如，您可以标记整个文件：

```kotlin
// 标记此文件中的所有函数和类，以便检查器报告未使用的返回值
@file:MustUseReturnValues

package my.project

fun someFunction(): String
```

或者，您可以标记特定的类：

```kotlin
// 标记此类中的所有函数，以便检查器报告未使用的返回值
@MustUseReturnValues
class Greeter {
    fun greet(name: String): String = "Hello, $name"
}

fun someFunction(): Int = ...
```
{validate="false"}

您还可以通过在构建文件中添加以下编译器选项来标记整个项目：

<tabs group="build-system">
<tab title="Gradle" group-key="gradle">

```kotlin
kotlin {
    compilerOptions {
        freeCompilerArgs.add("-Xreturn-value-checker=full")
    }
}
```

</tab>
<tab title="Maven" group-key="maven">

```xml
<build>
    <plugins>
        <plugin>
            <groupId>org.jetbrains.kotlin</groupId>
            <artifactId>kotlin-maven-plugin</artifactId>
            <configuration>
                <args>
                    <arg>-Xreturn-value-checker=full</arg>
                </args>
            </configuration>
        </plugin>
    </plugins>
</build>
```

</tab>
</tabs>

使用此设置后，Kotlin 会自动将您编译的文件视为已使用 `@MustUseReturnValues` 注解，并且检查器会报告您项目函数的所有返回值。

您可以通过使用 `@IgnorableReturnValue` 注解标记特定函数来抑制警告。
对那些通常且预期会忽略返回值的函数进行注解，例如 `MutableList.add`：

```kotlin
@IgnorableReturnValue
fun <T> MutableList<T>.addAndIgnoreResult(element: T): Boolean {
    return add(element)
}
```

您可以在不将函数本身标记为可忽略的情况下抑制警告。
为此，请将结果分配给带下划线 (`_`) 的特殊匿名变量：

```kotlin
// 不可忽略的函数
fun computeValue(): Int = 42

fun main() {
    // 报告警告：结果被忽略
    computeValue()

    // 仅在此调用处通过特殊的未使用变量抑制警告
    val _ = computeValue()
}
```

有关更多信息，请参阅该功能的 [KEEP](https://github.com/Kotlin/KEEP/blob/main/proposals/KEEP-0412-unused-return-value-checker.md)。

我们欢迎您在 [YouTrack](https://youtrack.jetbrains.com/issue/KT-12719) 中提供反馈。

### 显式支持字段
<primary-label ref="experimental-opt-in"/>

Kotlin 2.3.0 引入了显式支持字段——这是一种用于显式声明持有属性值的底层字段的新语法，与现有的隐式支持字段相对。

您可以在此视频中查看该功能的概览：

<video src="https://www.youtube.com/v/PU-VdH8HhVA" title="显式支持字段在 Kotlin 2.3 中处于实验阶段"/>

新的显式语法简化了常见的支持属性模式，即属性的内部类型与其公开的 API 类型不同。例如，您可能在内部使用 `ArrayList`，而将其公开为只读 `List` 或 `MutableList`。
以前，这需要一个额外的私有属性。

通过显式支持字段，`field` 的实现类型直接在属性范围内定义。
这消除了对单独私有属性的需求，并允许编译器在同一私有范围内自动对支持字段类型执行智能转换。

之前：

```kotlin
private val _city = MutableStateFlow<String>("")
val city: StateFlow<String> get() = _city

fun updateCity(newCity: String) {
    _city.value = newCity
}
```

之后：

```kotlin
val city: StateFlow<String>
    field = MutableStateFlow("")

fun updateCity(newCity: String) {
    // 智能转换自动生效
    city.value = newCity
}
```

此功能是[实验性功能](components-stability.md#stability-levels-explained)。
要选择性启用，请在您的构建文件中添加以下编译器选项：

<tabs group="build-system">
<tab title="Gradle" group-key="gradle">

```kotlin
kotlin {
    compilerOptions {
        freeCompilerArgs.add("-Xexplicit-backing-fields")
    }
}
```

</tab>
<tab title="Maven" group-key="maven">

```xml
<build>
    <plugins>
        <plugin>
            <groupId>org.jetbrains.kotlin</groupId>
            <artifactId>kotlin-maven-plugin</artifactId>
            <configuration>
                <args>
                    <arg>-Xexplicit-backing-fields</arg>
                </args>
            </configuration>
        </plugin>
    </plugins>
</build>
```

</tab>
</tabs>

有关更多信息，请参阅该功能的 [KEEP](https://github.com/Kotlin/KEEP/blob/explicit-backing-fields/proposals/explicit-backing-fields.md)。

我们欢迎您在 [YouTrack](https://youtrack.jetbrains.com/issue/KT-14663) 中提供反馈。

### 上下文相关解析的更改
<primary-label ref="experimental-general"/>

上下文相关解析仍处于[实验性阶段](components-stability.md#stability-levels-explained)，但我们正在根据用户反馈不断改进该功能：

* 当前类型的密封（sealed）和外围超类型现在被视为搜索上下文范围的一部分。不考虑其他超类型范围。有关动机和示例，请参阅 [KT-77823](https://youtrack.jetbrains.com/issue/KT-77823) YouTrack 问题。
* 当涉及类型运算符和相等性时，如果使用上下文相关解析导致解析产生歧义，编译器现在会报告警告。例如，当导入了冲突的类声明时，就可能发生这种情况。有关动机和示例，请参阅 [KT-77821](https://youtrack.jetbrains.com/issue/KT-77821) YouTrack 问题。

请在 [KEEP](https://github.com/Kotlin/KEEP/blob/main/proposals/KEEP-0379-context-sensitive-resolution.md) 中查看当前提案的全文。

## Kotlin/JVM：支持 Java 25

从 Kotlin 2.3.0 开始，编译器可以生成包含 Java 25 字节码的类。

## Kotlin/Native

Kotlin 2.3.0 引入了对 Swift 导出支持以及 C 和 Objective-C 库导入的改进，并增强了发布任务的构建时间。

### 通过 Swift 导出改进互操作性
<primary-label ref="experimental-general"/>

Kotlin 2.3.0 通过 Swift 导出进一步改进了 Kotlin 与 Swift 的互操作性，增加了对原生枚举类和可变参数函数参数的支持。

以前，Kotlin 枚举被导出为普通的 Swift 类。现在映射是直接的，您可以使用常规的原生 Swift 枚举。例如：

```kotlin
// Kotlin
enum class Color(val rgb: Int) {
    RED(0xFF0000),
    GREEN(0x00FF00),
    BLUE(0x0000FF)
}

val color = Color.RED
```

```Swift
// Swift
public enum Color: Swift.CaseIterable, Swift.LosslessStringConvertible, Swift.RawRepresentable {
    case RED, GREEN, BLUE

    var rgb: Int { get }
}
```

此外，Kotlin 的 [`vararg`](functions.md#variable-number-of-arguments-varargs) 函数现在直接映射到 Swift 的可变参数函数参数。

此类函数允许您传递可变数量的实参。当您预先不知道实参数量，或者想要在不指定类型的情况下创建或传递集合时，这非常有用。例如：

```kotlin
// Kotlin
fun log(vararg messages: String)
```

```Swift
// Swift
public func log(messages: Swift.String...)
```

> 尚不支持可变参数函数参数中的泛型类型。
>
{style="note"}

### C 和 Objective-C 库导入进入 Beta 阶段
<primary-label ref="beta"/>

对在 Kotlin/Native 项目中[导入 C](native-c-interop.md) 和 [Objective-C](native-objc-interop.md) 库的支持目前处于 [Beta](components-stability.md#stability-levels-explained) 阶段。

虽然仍不能保证与不同版本的 Kotlin、依赖项和 Xcode 的完全兼容性，但在发生二进制兼容性问题时，编译器现在会发出更好的诊断信息。

导入功能尚未稳定，在您的项目中使用 C 和 Objective-C 库进行某些与 C 和 Objective-C 互操作性相关的事情时，仍需要 `@ExperimentalForeignApi` 选择性同意注解，包括：

* `kotlinx.cinterop.*` 软件包中的某些 API，在处理原生库或内存时需要使用。
* 原生库中的所有声明，[平台库](native-platform-libs.md)除外。

为了保持兼容性并防止您必须更改源代码，新的稳定状态并未反映在注解名称中。

有关更多信息，请参阅 [C 和 Objective-C 库导入的稳定性](native-lib-import-stability.md)。

### Objective-C 标头中块类型的默认显式名称

[Kotlin 2.2.20 中引入](whatsnew2220.md#explicit-names-in-block-types-for-objective-c-headers)的 Kotlin 函数类型中的显式形参名称，现在是 Kotlin/Native 项目导出的 Objective-C 标头的默认设置。这些形参名称改进了 Xcode 中的自动补全建议，并有助于避免 Clang 警告。

考虑以下 Kotlin 代码：

```kotlin
// Kotlin:
fun greetUser(block: (name: String) -> Unit) = block("John")
```

Kotlin 将形参名称从 Kotlin 函数类型转发到 Objective-C 块类型，允许 Xcode 在建议中使用它们：

```ObjC
// Objective-C:
greetUserBlock:^(NSString *name) {
    // ...
};
```

如果您遇到问题，可以禁用显式形参名称。
为此，请将以下[二进制选项](native-binary-options.md)添加到您的 `gradle.properties` 文件中：

```none
kotlin.native.binary.objcExportBlockExplicitParameterNames=false
```

请在 [YouTrack](https://kotl.in/issue) 中报告任何问题。

### 提高发布任务的构建时间

Kotlin/Native 在 2.3.0 中获得了多项性能改进。这缩短了 `linkRelease*`（例如 `linkReleaseFrameworkIosArm64`）等发布任务的构建时间。

根据我们的基准测试，根据项目大小的不同，发布构建的速度最高可提升 40%。这些改进在针对 iOS 的 Kotlin 多平台项目中最为显著。

有关提高项目编译时间的更多提示，请参阅[文档](native-improving-compilation-time.md)。

### Apple 目标支持的更改

Kotlin 2.3.0 提高了 Apple 目标的最低支持版本：

* 对于 iOS 和 tvOS，从 12.0 提高到 14.0。
* 对于 watchOS，从 5.0 提高到 7.0。

根据公开数据，旧版本的使用已经非常有限。此更改简化了我们对整体 Apple 目标的维护，并为 Kotlin/Native 支持 [Mac Catalyst](https://developer.apple.com/documentation/uikit/mac-catalyst) 提供了机会。

如果您必须在项目中保留旧版本，请将以下几行添加到您的构建文件中：

```kotlin
kotlin {
    targets.withType<org.jetbrains.kotlin.gradle.plugin.mpp.KotlinNativeTarget>().configureEach {
        binaries.configureEach {
            freeCompilerArgs += "-Xoverride-konan-properties=minVersion.ios=12.0"
            freeCompilerArgs += "-Xoverride-konan-properties=minVersion.tvos=12.0"
        }
    }
}
```

请注意，这种设置不能保证成功编译，并且可能会在构建期间或运行时导致应用崩溃。

此版本还迈出了 [基于 Intel 芯片的 Apple 目标弃用周期](whatsnew2220.md#deprecation-of-x86-64-apple-targets)的下一步。

从 Kotlin 2.3.0 开始，`macosX64`、`iosX64`、`tvosX64` 和 `watchosX64` 目标被降级为第 3 级支持。这意味着它们不保证在 CI 上进行测试，并且不同编译器版本之间可能不提供源代码和二进制兼容性。我们计划最终在 Kotlin 2.4.0 中移除对 `x86_64` Apple 目标的支持。

有关更多信息，请参阅 [Kotlin/Native 目标支持](native-target-support.md)。

## Kotlin/Wasm

Kotlin 2.3.0 默认启用 Kotlin/Wasm 目标的完全限定名称、`wasmWasi` 目标的新异常处理提案，并引入了 Latin-1 字符的紧凑存储。

### 默认启用完全限定名称

在 Kotlin/Wasm 目标上，完全限定名称 (FQN) 在运行时默认未启用。
您必须手动启用对 `KClass.qualifiedName` 属性的支持才能使用 FQN。

以前只能访问类名（不带包名），这导致从 JVM 移植到 Wasm 目标的代码或期望在运行时使用完全限定名称的库出现问题。

在 Kotlin 2.3.0 中，`KClass.qualifiedName` 属性在 Kotlin/Wasm 目标上默认启用。
这意味着 FQN 在运行时可用，无需任何额外配置。

默认启用 FQN 提高了代码的可移植性，并通过显示完全限定名称使运行时错误更具信息性。

得益于编译器优化（通过对 Latin-1 字符串文字使用紧凑存储来减少元数据），此更改不会增加编译后的 Wasm 二进制文件的大小。

### Latin-1 字符的紧凑存储

以前，Kotlin/Wasm 按原样存储字符串文字数据，这意味着每个字符都以 UTF-16 编码。对于仅包含或主要包含 Latin-1 字符的文本，这并不是最优的。

从 Kotlin 2.3.0 开始，Kotlin/Wasm 编译器以 UTF-8 格式存储仅包含 Latin-1 字符的字符串文字。

正如在 JetBrains 的 [KotlinConf 应用程序](https://github.com/JetBrains/kotlinconf-app)上进行的实验所显示的那样，这种优化显著减少了元数据。其结果包括：

* 与未进行优化的构建相比，Wasm 二进制文件缩小了高达 13%。
* 与不存储 FQN 的早期版本相比，即使启用了完全限定名称，Wasm 二进制文件也缩小了高达 8%。

这种紧凑存储对于下载和启动时间至关重要的 Web 环境非常重要。此外，这种优化移除了先前阻止存储[类的完全限定名称并默认启用 `KClass.qualifiedName`](#fully-qualified-names-enabled-by-default) 的大小障碍。

此更改默认启用，无需进一步操作。

### `wasmWasi` 默认启用新的异常处理提案

以前，Kotlin/Wasm 对所有目标（包括 [`wasmWasi`](wasm-overview.md#kotlin-wasm-and-wasi)）都使用[旧版异常处理提案](https://github.com/WebAssembly/exception-handling/blob/master/proposals/exception-handling/legacy/Exceptions.md)。然而，大多数独立的 WebAssembly 虚拟机 (VM) 正在向[新版本的异常处理提案](https://github.com/WebAssembly/exception-handling/blob/main/proposals/exception-handling/Exceptions.md)看齐。

从 Kotlin 2.3.0 开始，新的 WebAssembly 异常处理提案对 `wasmWasi` 目标默认启用，确保与现代 WebAssembly 运行时的更好兼容性。

对于 `wasmWasi` 目标，提前引入此更改是安全的，因为针对该目标的应用通常运行在多样性较低的运行时环境中（通常在单个特定 VM 上运行），该环境通常由用户控制，从而降低了兼容性问题的风险。

新的异常处理提案在 [`wasmJs` 目标](wasm-overview.md#kotlin-wasm-and-compose-multiplatform)上仍默认关闭。您可以使用 `-Xwasm-use-new-exception-proposal` 编译器选项手动启用它。

## Kotlin/JS

Kotlin 2.3.0 带来了将挂起函数导出到 JavaScript 的实验性支持，以及使用 `BigInt64Array` 类型来表示 Kotlin 的 `LongArray` 类型。

在此版本中，您现在可以以统一的方式访问接口内部的伴生对象，在带有伴生对象的接口中使用 `@JsStatic` 注解，在单个函数和类中使用 `@JsQualifier` 注解，并通过新注解 `@JsExport.Default` 进行默认导出。

### 使用 `JsExport` 导出挂起函数
<primary-label ref="experimental-opt-in"/>

以前，`@JsExport` 注解不允许将挂起函数（或包含此类函数的类和接口）导出到 JavaScript。您必须手动包装每个挂起函数，这既繁琐又容易出错。

从 Kotlin 2.3.0 开始，挂起函数可以使用 `@JsExport` 注解直接导出到 JavaScript。

启用挂起函数导出可以减少模板代码，并改进 Kotlin/JS 与 JavaScript/TypeScript (JS/TS) 之间的互操作性。Kotlin 的异步函数现在可以直接从 JS/TS 调用，无需额外代码。

要启用此功能，请在您的 `build.gradle.kts` 文件中添加以下编译器选项：

```kotlin
kotlin {
    compilerOptions {
        freeCompilerArgs.add("-Xenable-suspend-function-exporting")
    }
}
```

启用后，标记有 `@JsExport` 注解的类和函数可以包含挂起函数，而无需额外的包装器。

它们可以作为常规的 JavaScript 异步函数被消费，也可以作为异步函数被重写：

```kotlin
@JsExport
open class Foo {
    suspend fun foo() = "Foo"
}
```

```typescript
class Bar extends Foo {
    override async foo(): Promise<string> {
        return "Bar"
    }
}
```

此功能是[实验性功能](components-stability.md#stability-levels-explained)。我们欢迎您在我们的问题跟踪器 [YouTrack](https://youtrack.jetbrains.com/issue/KT-56281/KJS-Cant-export-suspend-functions) 中提供反馈。

### 使用 `BigInt64Array` 类型表示 Kotlin 的 `LongArray` 类型
<primary-label ref="experimental-opt-in"/>

以前，Kotlin/JS 将其 `LongArray` 表示为 JavaScript 的 `Array<bigint>`。这种方法可行，但对于期望使用类型化数组的 JavaScript API 互操作来说并不是理想的。

从该版本开始，当编译为 JavaScript 时，Kotlin/JS 现在使用 JavaScript 内置的 `BigInt64Array` 类型来表示 Kotlin 的 `LongArray` 值。

使用 `BigInt64Array` 简化了与使用类型化数组的 JavaScript API 的互操作。它还允许接受或返回 `LongArray` 的 API 更自然地从 Kotlin 导出到 JavaScript。

要启用此功能，请在您的 `build.gradle.kts` 文件中添加以下编译器选项：

```kotlin
kotlin {
    js {
        // ...
        compilerOptions {
            freeCompilerArgs.add("-Xes-long-as-bigint")
        }
    }
}
```

此功能是[实验性功能](components-stability.md#stability-levels-explained)。我们欢迎您在我们的问题跟踪器 [YouTrack](https://youtrack.jetbrains.com/issue/KT-79284/Use-BigInt64Array-for-LongArray) 中提供反馈。

### 跨 JS 模块系统的统一伴生对象访问

以前，当您使用 `@JsExport` 注解将带有伴生对象的 Kotlin 接口导出到 JavaScript/TypeScript 时，在 TypeScript 中使用该接口时，ES 模块与其他模块系统的工作方式不同。

因此，您必须根据模块系统在 TypeScript 侧调整对输出的使用。

考虑以下 Kotlin 代码：

```kotlin
@JsExport
interface Foo {
    companion object {
        fun bar() = "OK"
    }
}
```

您必须根据模块系统以不同的方式调用它：

```kotlin
// 适用于 CommonJS、AMD、UMD 和无模块
Foo.bar()

// 适用于 ES 模块
Foo.getInstance().bar() 
```

在此版本中，Kotlin 统一了所有 JavaScript 模块系统的伴生对象导出。

现在，对于每种模块系统（ES 模块、CommonJS、AMD、UMD、无模块），接口内部的伴生对象始终以相同的方式访问（就像类中的伴生对象一样）：

```kotlin
// 适用于所有模块系统
Foo.Companion.bar()
```

这项改进还修复了集合的互操作性。之前，必须根据模块系统以不同的方式访问集合工厂函数：

```kotlin
// 适用于 CommonJS、AMD、UMD 和无模块
KtList.fromJsArray([1, 2, 3])

// 适用于 ES 模块
KtList.getInstance().fromJsArray([1, 2, 3])
```

现在，在所有模块系统中，访问集合工厂函数的方式都是相似的：

```kotlin
// 适用于所有模块系统
KtList.fromJsArray([1, 2, 3])
```

这一更改减少了模块系统之间不一致的行为，并避免了错误和互操作性问题。

此功能默认启用。

### 支持带有伴生对象的接口中的 `@JsStatic` 注解

以前，导出的带有伴生对象的接口内部不允许使用 `@JsStatic` 注解。

例如，以下代码会产生错误，因为只有类伴生对象的成员才能使用 `@JsStatic` 进行注解：

```kotlin
@JsExport
interface Foo {
    companion object {
        @JsStatic // 错误
        fun bar() = "OK"
    }
}
```

在这种情况下，您必须放弃 `@JsStatic` 注解，并按以下方式从 JavaScript (JS) 访问伴生对象：

```kotlin
// 对于所有模块系统
Foo.Companion.bar()
```

现在，带有伴生对象的接口支持 `@JsStatic` 注解。
您可以在此类伴生对象上使用此注解，并直接从 JS 调用该函数，就像对类所做的那样：

```kotlin
// 对于所有模块系统
Foo.bar()
```

此更改简化了 JS 中的 API 使用，允许在接口上使用静态工厂方法，并消除了类和接口之间的不一致性。

此功能默认启用。

### 允许在单个函数和类中使用 `@JsQualifier` 注解

以前，您只能在文件级应用 `@JsQualifier` 注解，这要求将所有外部 JavaScript (JS) 声明放在单独的文件中。

从 Kotlin 2.3.0 开始，您可以直接在单个函数和类上应用 `@JsQualifier` 注解，就像使用 `@JsModule` 和 `@JsNonModule` 注解一样。

例如，您现在可以在同一文件中的常规 Kotlin 声明旁边编写以下外部函数代码：

```kotlin
@JsQualifier("jsPackage")
private external fun jsFun()
```

此更改简化了 Kotlin/JS 互操作性，保持了项目结构的整洁，并使 Kotlin/JS 与其他平台处理外部声明的方式保持一致。

此功能默认启用。

### 支持 JavaScript 默认导出

以前，Kotlin/JS 无法从 Kotlin 代码生成 JavaScript 的默认导出。相反，Kotlin/JS 仅生成命名导出，例如：

```javascript
export { SomeDeclaration };
```

如果您需要默认导出，则必须在编译器内部使用变通方法，例如将 `@JsName` 注解与 `default` 加上空格作为参数：

```kotlin
@JsExport
@JsName("default ")
class SomeDeclaration
```

Kotlin/JS 现在通过一个新注解直接支持默认导出：

```kotlin
@JsExport.Default
```

当您将此注解应用于 Kotlin 声明（类、对象、函数或属性）时，生成的 JavaScript 会自动为 ES 模块包含一个 `export default` 语句：

```javascript
export default HelloWorker;
```

> 对于不同于 ES 模块的模块系统，新的 `@JsExport.Default` 注解的工作方式类似于常规的 `@JsExport` 注解。
>
{style="note"}

此更改使 Kotlin 代码能够符合 JavaScript 约定，对于 Cloudflare Workers 等平台或 `React.lazy` 等框架尤为重要。

此功能默认启用。您只需要使用 `@JsExport.Default` 注解。

## Gradle

Kotlin 2.3.0 与 Gradle 7.6.3 至 9.0.0 完全兼容。您也可以使用截至最新发布的 Gradle 版本。但请注意，这样做可能会导致弃用警告，并且某些新的 Gradle 功能可能无法工作。

此外，支持的最低 Android Gradle 插件版本现在为 8.2.2，支持的最高版本为 8.13.0。

Kotlin 2.3.0 还引入了一个用于在 Gradle 项目中注册生成源的新 API。

### 在 Gradle 项目中注册生成源的新 API
<primary-label ref="experimental-general"/>

Kotlin 2.3.0 在 [`KotlinSourceSet`](https://kotlinlang.org/api/kotlin-gradle-plugin/kotlin-gradle-plugin-api/org.jetbrains.kotlin.gradle.plugin/-kotlin-source-set/) 接口中引入了一个新的[实验性](components-stability.md#stability-levels-explained) API，您可以使用它在 Gradle 项目中注册生成源。

这项新 API 是一个易用性改进，有助于 IDE 区分生成的代码和常规源文件。该 API 允许 IDE 在 UI 中以不同方式高亮显示生成的代码，并在导入项目时触发生成任务。我们目前正致力于在 IntelliJ IDEA 中添加此支持。该 API 对于生成代码的第三方插件或工具（例如 [KSP](ksp-overview.md) (Kotlin 符号处理)）也非常有用。

有关更多信息，请参阅[注册生成源](gradle-configure-project.md#register-generated-sources)。

## 标准库

Kotlin 2.3.0 稳定了新的时间跟踪功能 [`kotlin.time.Clock` 和 `kotlin.time.Instant`](whatsnew2120.md#new-time-tracking-functionality)，并对实验性 UUID API 进行了多项改进。

### 改进的 UUID 生成和解析
<primary-label ref="experimental-opt-in"/>

Kotlin 2.3.0 为 UUID API 引入了多项改进，包括：

* [支持在解析无效 UUID 时返回 `null`](#support-for-returning-null-when-parsing-invalid-uuids)
* [用于生成 v4 和 v7 UUID 的新函数](#new-functions-to-generate-v4-and-v7-uuids)
* [支持为特定时间戳生成 v7 UUID](#support-for-generating-v7-uuids-for-specific-timestamps)

标准库中的 UUID 支持目前是[实验性](components-stability.md#stability-levels-explained)的，但[计划在将来稳定化](https://youtrack.jetbrains.com/issue/KT-81395)。
要选择性启用，请使用 `@OptIn(ExperimentalUuidApi::class)` 注解，或在您的构建文件中添加以下编译器选项：

<tabs group="build-system">
<tab title="Gradle" group-key="gradle">

```kotlin
kotlin {
    compilerOptions {
        freeCompilerArgs.add("-opt-in=kotlin.uuid.ExperimentalUuidApi")
    }
}
```

</tab>
<tab title="Maven" group-key="maven">

```xml
<build>
    <plugins>
        <plugin>
            <groupId>org.jetbrains.kotlin</groupId>
            <artifactId>kotlin-maven-plugin</artifactId>
            <configuration>
                <args>
                    <arg>-opt-in=kotlin.uuid.ExperimentalUuidApi</arg>
                </args>
            </configuration>
        </plugin>
    </plugins>
</build>
```

</tab>
</tabs>

我们欢迎您在 [YouTrack](https://youtrack.jetbrains.com/issue/KT-81395) 或相关的 [Slack 频道](https://slack-chats.kotlinlang.org/c/uuid)中提供反馈。

#### 支持在解析无效 UUID 时返回 `null`

Kotlin 2.3.0 引入了从字符串创建 `Uuid` 实例的新函数，如果字符串不是有效的 UUID，这些函数将返回 `null` 而不是抛出异常。

这些函数包括：

* `Uuid.parseOrNull()` – 解析十六进制加连字符格式或纯十六进制格式的 UUID。
* `Uuid.parseHexDashOrNull()` – 仅解析十六进制加连字符格式的 UUID，否则返回 `null`。
* `Uuid.parseHexOrNull()` – 仅解析纯十六进制格式的 UUID，否则返回 `null`。

示例如下：

```kotlin
import kotlin.uuid.ExperimentalUuidApi
import kotlin.uuid.Uuid

@OptIn(ExperimentalUuidApi::class)
fun main() {
    val valid = Uuid.parseOrNull("550e8400-e29b-41d4-a716-446655440000")
    println(valid)
    // 550e8400-e29b-41d4-a716-446655440000

    val invalid = Uuid.parseOrNull("not-a-uuid")
    println(invalid)
    // null

    val hexDashValid = Uuid.parseHexDashOrNull("550e8400-e29b-41d4-a716-446655440000")
    println(hexDashValid)
    // 550e8400-e29b-41d4-a716-446655440000

    val hexDashInvalid = Uuid.parseHexDashOrNull("550e8400e29b41d4a716446655440000")
    println(hexDashInvalid)
    // null
}
```
{kotlin-runnable="true"}

#### 用于生成 v4 和 v7 UUID 的新函数

Kotlin 2.3.0 引入了两个用于生成 UUID 的新函数：`Uuid.generateV4()` 和 `Uuid.generateV7()`。

使用 `Uuid.generateV4()` 函数生成版本 4 UUID，或使用 `Uuid.generateV7()` 函数生成版本 7 UUID。

> `Uuid.random()` 函数保持不变，仍然生成版本 4 UUID，就像 `Uuid.generateV4()` 一样。
>
{style="note"}

示例如下：

```kotlin
import kotlin.uuid.ExperimentalUuidApi
import kotlin.uuid.Uuid

@OptIn(ExperimentalUuidApi::class)
fun main() {
    // 生成 v4 UUID
    val v4 = Uuid.generateV4()
    println(v4)

    // 生成 v7 UUID
    val v7 = Uuid.generateV7()
    println(v7)

    // 生成 v4 UUID
    val random = Uuid.random()
    println(random)
}
```
{kotlin-runnable="true"}

#### 支持为特定时间戳生成 v7 UUID

Kotlin 2.3.0 引入了新的 `Uuid.generateV7NonMonotonicAt()` 函数，您可以使用它为特定时间点生成版本 7 UUID。

> 与 `Uuid.generateV7()` 不同，`Uuid.generateV7NonMonotonicAt()` 不保证单调排序，因此为同一时间戳创建的多个 UUID 可能不是顺序的。
>
{style="note"}

当您需要绑定到已知时间戳的标识符时，请使用此函数，例如在重新创建事件 ID 或生成反映事物最初发生时间的数据库条目时。

例如，要为特定时刻创建版本 7 UUID，请使用以下代码：

```kotlin
import kotlin.uuid.ExperimentalUuidApi
import kotlin.uuid.Uuid
import kotlin.time.ExperimentalTime
import kotlin.time.Instant

@OptIn(ExperimentalUuidApi::class, ExperimentalTime::class)
fun main() {
    val timestamp = Instant.fromEpochMilliseconds(1577836800000) // 2020-01-01T00:00:00Z

    // 为指定时间戳生成 v7 UUID（不保证单调性）
    val v7AtTimestamp = Uuid.generateV7NonMonotonicAt(timestamp)
    println(v7AtTimestamp)
}
```
{kotlin-runnable="true"}

## Compose 编译器：针对混淆后的 Android 应用程序的堆栈跟踪

从 Kotlin 2.3.0 开始，当应用程序由 R8 混淆时，编译器会为 Compose 堆栈跟踪输出 ProGuard 映射。这扩展了以前仅在可调试变体中可用的实验性堆栈跟踪功能。

发布变体的堆栈跟踪包含组密钥 (group keys)，这些密钥可用于在混淆后的应用中识别组合函数，而无需在运行时记录源信息的开销。组密钥堆栈跟踪要求您的应用使用 Compose runtime 1.10 或更新版本构建。

要启用组密钥堆栈跟踪，请在初始化任何 `@Composable` 内容之前添加以下行：

```kotlin
Composer.setDiagnosticStackTraceMode(ComposeStackTraceMode.GroupKeys)
```

启用这些堆栈跟踪后，在组合、测量或绘制过程中捕获到崩溃后，Compose 运行时将附加自己的堆栈跟踪，即使应用已混淆：

```text
java.lang.IllegalStateException: <message>
        at <original trace>
    Suppressed: androidx.compose.runtime.DiagnosticComposeException: Composition stack when thrown:
        at $compose.m$123(SourceFile:1)
        at $compose.m$234(SourceFile:1)
        ...
```

Jetpack Compose 1.10 在此模式下生成的堆栈跟踪仅包含仍需反混淆的组密钥。Kotlin 2.3.0 版本通过 Compose Compiler Gradle 插件解决了这个问题，该插件现在会将组密钥条目附加到 R8 生成 ProGuard 映射文件中。如果您在编译器无法为某些函数创建映射的情况下看到新警告，请将其报告给 [Google IssueTracker](https://issuetracker.google.com/issues/new?component=610764&template=1424126)。

> 由于依赖于 R8 映射文件，Compose Compiler Gradle 插件仅在为构建启用 R8 时才会为组密钥堆栈跟踪创建反混淆映射。
>
{style="note"}

默认情况下，无论您是否启用跟踪，映射文件 Gradle 任务都会运行。如果它们在您的构建中引起问题，您可以完全禁用该功能。在 Gradle 配置的 `composeCompiler {}` 块中添加以下属性：

```kotlin
composeCompiler {
    includeComposeMappingFile.set(false)
}
```

> 在 Android Gradle 插件提供的项目文件中，存在某些代码未显示在堆栈跟踪中的已知问题：[KT-83099](https://youtrack.jetbrains.com/issue/KT-83099)。
>
{style="warning"}

请将遇到的任何问题报告给 [Google IssueTracker](https://issuetracker.google.com/issues/new?component=610764&template=1424126)。

## 破坏性更改和弃用

本节重点介绍重要的破坏性更改和弃用。
如需完整概览，请参阅我们的[兼容性指南](compatibility-guide-23.md)。

* 从 Kotlin 2.3.0 开始，编译器[不再支持 `-language-version=1.8`](compatibility-guide-23.md#drop-support-in-language-version-for-1-8-and-1-9)。非 JVM 平台也不再支持 `-language-version=1.9`。
* 不支持早于 2.0 的语言功能集（JVM 平台的 1.9 除外），但语言本身仍与 Kotlin 1.0 完全向后兼容。

  如果您在 Gradle 项目中同时使用 `kotlin-dsl` **和** `kotlin("jvm")` 插件，您可能会看到关于不支持的 Kotlin 插件版本的 Gradle 警告。有关迁移步骤的指导，请参阅我们的[兼容性指南](compatibility-guide-23.md#unsupported-kgp-version-warning-when-using-kotlin-dsl-and-kotlin-jvm-plugins)。

* 在 Kotlin 多平台中，对 Android 目标的支持现在通过 Google 的 [`com.android.kotlin.multiplatform.library` 插件](https://developer.android.com/kotlin/multiplatform/plugin)提供。请将带有 Android 目标的项目迁移到新插件，并将您的 `androidTarget` 块重命名为 `android`。

* 如果您继续在 Android Gradle 插件 (AGP) 9.0.0 或更高版本中为 Android 目标使用 Kotlin 多平台 Gradle 插件，您将在使用 `androidTarget` 块时看到配置错误，以及提供迁移指导的诊断消息。您可以通过使用 AGP 8.x 并更新到 Kotlin 2.3.10，或迁移到 [Google 针对 Android 目标的插件](https://kotlinlang.org/docs/multiplatform/multiplatform-compatibility-guide.html#migrate-to-google-s-plugin-for-android-targets)来避免此错误。

* AGP 9.0.0 包含了[对 Kotlin 的内置支持](https://developer.android.com/build/releases/agp-preview#android-gradle-plugin-built-in-kotlin)。从 Kotlin 2.3.0 开始，[如果您将此版本的 AGP 与 `kotlin-android` 插件一起使用，您将看到配置错误](compatibility-guide-23.md#deprecate-kotlin-android-plugin-for-agp-versions-9-0-0-and-later)，因为该插件不再是必需的。提供了新的诊断消息来帮助您迁移。如果您使用旧版本的 AGP，您将看到弃用警告。

* 不再支持 Ant 构建系统。

## 文档更新

Kotlin 多平台文档已移动到 kotlinlang.org。现在您可以在一处切换 Kotlin 和 KMP 文档。我们还刷新了语言指南的目录并引入了新的导航。

自上一个 Kotlin 版本以来的其他重大更改：

* [KMP 概览](https://kotlinlang.org/docs/multiplatform/kmp-overview.html) – 在单页上探索 Kotlin 多平台生态系统。
* [Kotlin 多平台快速入门](https://kotlinlang.org/docs/multiplatform/quickstart.html) – 了解如何使用 KMP IDE 插件设置环境。
* [Compose 多平台 1.9.3 最新变化](https://kotlinlang.org/docs/multiplatform/whats-new-compose-190.html) – 了解最新版本的亮点。
* [Kotlin/JS 入门](js-get-started.md) – 使用 Kotlin/JavaScript 为浏览器创建 Web 应用程序。
* [类](classes.md) – 了解在 Kotlin 中使用类的基础知识和最佳实践。
* [扩展](extensions.md) – 了解如何在 Kotlin 中扩展类和接口。
* [协程基础知识](coroutines-basics.md) – 探索关键的协程概念并学习如何创建您的第一个协程。
* [取消与超时](coroutines-cancellation.md) – 了解协程取消的工作原理以及如何使协程响应取消。
* [Kotlin/Native 库](native-libraries.md) – 了解如何生成 `klib` 库工件。
* [Kotlin Notebook 概览](kotlin-notebook-overview.md) – 使用 Kotlin Notebook 插件创建交互式笔记本。
* [将 Kotlin 添加到 Java 项目中](mixing-java-kotlin-intellij.md) – 配置 Java 项目以同时使用 Kotlin 和 Java。
* [使用 Kotlin 测试 Java 代码](jvm-test-using-junit.md) – 使用 JUnit 测试混合了 Java 和 Kotlin 的项目。
* [新的案例研究页面](https://kotlinlang.org/case-studies/) – 了解不同公司如何应用 Kotlin。

## 如何更新到 Kotlin 2.3.0

Kotlin 插件作为捆绑插件在 IntelliJ IDEA 和 Android Studio 中分发。

要更新到新的 Kotlin 版本，请在您的构建脚本中将 [Kotlin 版本更改](releases.md#update-to-a-new-kotlin-version)为 2.3.0。