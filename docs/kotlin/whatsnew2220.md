[//]: # (title: Kotlin 2.2.20 最新变化)

<web-summary>阅读 Kotlin 2.2.20 发行说明，涵盖新的语言功能、Kotlin Multiplatform、JVM、Native、JS 和 Wasm 的更新，以及对 Gradle 和 Maven 的构建工具支持。</web-summary>

_[发布日期：2025 年 9 月 10 日](releases.md#release-history)_

<tldr>
    <p>有关错误修复版本 2.2.21 的详细信息，请参阅 <a href="https://github.com/JetBrains/kotlin/releases/tag/v2.2.21">更改日志</a></p>
</tldr>

Kotlin 2.2.20 版本已发布，为 Web 开发带来了重要变更。[Kotlin/Wasm 现已进入 Beta 阶段](#kotlin-wasm)，
并改进了 [JavaScript 互操作中的异常处理](#improved-exception-handling-in-kotlin-wasm-and-javascript-interop)、
[npm 依赖项管理](#separated-npm-dependencies)、[内置浏览器调试支持](#support-for-debugging-in-browsers-without-configuration)，
以及一个新的 [用于 `js` 和 `wasmJs` 目标的共享源集](#shared-source-set-for-js-and-wasmjs-targets)。

此外，以下是一些主要亮点：

* **Kotlin Multiplatform**：[Swift 导出默认可用](#swift-export-available-by-default)、[Kotlin 库的稳定跨平台编译](#stable-cross-platform-compilation-for-kotlin-libraries)，以及一种 [声明公共依赖项的新方法](#new-approach-for-declaring-common-dependencies)。
* **语言**：[改进了将 Lambda 传递给具有挂起函数类型的重载时的重载解析](#improved-overload-resolution-for-lambdas-with-suspend-function-types)。
* **Kotlin/Native**：[支持 Xcode 26、栈保护 (Stack Canaries)，以及更小的发布二进制文件体积](#kotlin-native)。
* **Kotlin/JS**：[`Long` 值编译为 JavaScript `BigInt`](#usage-of-the-bigint-type-to-represent-kotlin-s-long-type)。

> Compose Multiplatform for web 进入 Beta 阶段。在我们的 [博客文章](https://blog.jetbrains.com/kotlin/2025/09/compose-multiplatform-1-9-0-compose-for-web-beta/) 中了解更多信息。
>
{style="note"}

您也可以在此视频中找到更新的简短概述：

<video src="https://www.youtube.com/v/QWpp5-LlTqA" title="What's new in Kotlin 2.2.21"/>

> 有关 Kotlin 发布周期的信息，请参阅 [Kotlin 发布过程](releases.md)。
>
{style="tip"}

## IDE 支持

支持 Kotlin 2.2.20 的 Kotlin 插件已捆绑在最新版本的 IntelliJ IDEA 和 Android Studio 中。
要进行更新，您只需在构建脚本中将 Kotlin 版本更改为 2.2.20。

有关详细信息，请参阅 [更新到新版本](releases.md#update-to-a-new-kotlin-version)。

## 语言

在 Kotlin 2.2.20 中，您可以试用计划用于 Kotlin 2.3.0 的后续语言功能，包括
[改进了将 Lambda 传递给具有 `suspend` 函数类型的重载时的重载解析](#improved-overload-resolution-for-lambdas-with-suspend-function-types)
以及 [支持在具有显式返回值类型的表达式体中使用 `return` 语句](#support-for-return-statements-in-expression-bodies-with-explicit-return-types)。此版本还包括
对 [`when` 表达式完备性检查](#data-flow-based-exhaustiveness-checks-for-when-expressions)的改进、
[具现化 `Throwable` 捕获](#support-for-reified-types-in-catch-clauses) 以及 [Kotlin 契约](#improved-kotlin-contracts)。

### 改进了具有 `suspend` 函数类型的 Lambda 的重载解析

以前，在传递 Lambda 时，同时使用常规函数类型和 `suspend` 函数类型重载函数会导致歧义
错误。您可以通过显式类型转换来解决此错误，但编译器会错误地
报告 `No cast needed` 警告：

```kotlin
// 定义两个重载
fun transform(block: () -> Int) {}
fun transform(block: suspend () -> Int) {}

fun test() {
    // 失败，出现重载解析歧义
    transform({ 42 })

    // 使用显式转换，但编译器错误地报告 
    // "No cast needed" 警告
    transform({ 42 } as () -> Int)
}
```

通过此更改，当您定义常规和 `suspend` 函数类型重载时，不带转换的 Lambda 将解析
为常规重载。使用 `suspend` 关键字可显式解析为挂起重载：

```kotlin
// 解析为 transform(() -> Int)
transform({ 42 })

// 解析为 transform(suspend () -> Int)
transform(suspend { 42 })
```

此行为将在 Kotlin 2.3.0 中默认启用。要现在进行测试，请使用
以下编译器选项将语言版本设置为 `2.3`：

```kotlin
-language-version 2.3
```

或者在您的 `build.gradle(.kts)` 文件中配置：

```kotlin
kotlin {
    compilerOptions {
        languageVersion.set(org.jetbrains.kotlin.gradle.dsl.KotlinVersion.KOTLIN_2_3)
    }
}
```

我们欢迎您在我们的问题跟踪器 [YouTrack](https://youtrack.jetbrains.com/issue/KT-23610) 中提供反馈。

### 支持在具有显式返回值类型的表达式体中使用 `return` 语句

以前，在表达式体中使用 `return` 会导致编译器错误，因为它可能导致函数的返回值类型
被推断为 `Nothing`。

```kotlin
fun example() = return 42
// 错误：禁止在具有表达式体的函数中使用 Return
```

通过此更改，您现在可以在表达式体中使用 `return`，只要明确写出返回值类型即可：

```kotlin
// 显式指定返回值类型
fun getDisplayNameOrDefault(userId: String?): String = getDisplayName(userId ?: return "default")

// 失败，因为它没有显式指定返回值类型
fun getDisplayNameOrDefault(userId: String?) = getDisplayName(userId ?: return "default")
```

类似地，Lambda 内部的 `return` 语句以及具有表达式体函数中的嵌套表达式以前会
在无意中编译。现在，只要显式指定了返回值类型，Kotlin 就支持这些情况。没有显式
返回值类型的情况将在 Kotlin 2.3.0 中被弃用：

```kotlin
// 未显式指定返回值类型，且 return 语句在 Lambda 内部
// 这将被弃用
fun returnInsideLambda() = run { return 42 }

// 未显式指定返回值类型，且 return 语句在局部变量的
// 初始值设定项内部，这将被弃用
fun returnInsideIf() = when {
    else -> {
        val result = if (someCondition()) return "" else "value"
        result
    }
}
```

此行为将在 Kotlin 2.3.0 中默认启用。要现在进行测试，请使用
以下编译器选项将语言版本设置为 `2.3`：

```kotlin
-language-version 2.3
```

或者在您的 `build.gradle(.kts)` 文件中配置：

```kotlin
kotlin {
    compilerOptions {
        languageVersion.set(org.jetbrains.kotlin.gradle.dsl.KotlinVersion.KOTLIN_2_3)
    }
}
```

我们欢迎您在我们的问题跟踪器 [YouTrack](https://youtrack.jetbrains.com/issue/KT-76926) 中提供反馈。

### 基于数据流的 `when` 表达式完备性检查
<primary-label ref="experimental-opt-in"/>

Kotlin 2.2.20 引入了 **基于数据流的** `when` 表达式完备性检查。
以前，编译器的检查仅限于 `when` 表达式本身，
通常迫使您添加冗余的 `else` 分支。
通过此次更新，编译器现在会跟踪先前的条件检查和早期返回，
因此您可以移除冗余的 `else` 分支。

例如，编译器现在可以识别出当满足 `if` 条件时函数会返回，
因此 `when` 表达式只需要处理剩余的情况：

```kotlin
enum class UserRole { ADMIN, MEMBER, GUEST }

fun getPermissionLevel(role: UserRole): Int {
    // 在 when 表达式之外覆盖 Admin 情况
    if (role == UserRole.ADMIN) return 99

    return when (role) {
        UserRole.MEMBER -> 10
        UserRole.GUEST -> 1
        // 您不再需要包含此 else 分支 
        // else -> throw IllegalStateException()
    }
}
```

此功能是 [实验性的](components-stability.md#stability-levels-explained)。
要启用它，请在您的 `build.gradle(.kts)` 文件中添加以下编译器选项：

```kotlin
kotlin {
    compilerOptions {
        freeCompilerArgs.add("-Xdata-flow-based-exhaustiveness")
    }
}
```

### 支持在 `catch` 子句中使用具现化类型
<primary-label ref="experimental-opt-in"/>

在 Kotlin 2.2.20 中，编译器现在允许在 `inline` 函数的 `catch` 子句中使用 [具现化泛型类型形参](inline-functions.md#reified-type-parameters)。

示例如下：

```kotlin
inline fun <reified ExceptionType : Throwable> handleException(block: () -> Unit) {
    try {
        block()
        // 更改后现在允许这样做
    } catch (e: ExceptionType) {
        println("Caught specific exception: ${e::class.simpleName}")
    }
}

fun main() {
    // 尝试执行可能抛出 IOException 的操作
    handleException<java.io.IOException> {
        throw java.io.IOException("File not found")
    }
    // Caught specific exception: IOException
}
```

以前，尝试在 `inline` 函数中捕获具现化的 `Throwable` 类型会导致错误。

此行为将在 Kotlin 2.4.0 中默认启用。
要在现在使用它，请在您的 `build.gradle(.kts)` 文件中添加以下编译器选项：

```kotlin
kotlin {
    compilerOptions {
        freeCompilerArgs.add("-Xallow-reified-type-in-catch")
    }
}
```

Kotlin 团队感谢外部贡献者 [Iven Krall](https://github.com/kralliv) 的贡献。

### 改进的 Kotlin 契约
<primary-label ref="experimental-opt-in"/>

Kotlin 2.2.20 对 [Kotlin 契约](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.contracts/contract.html) 进行了多项改进，包括：

* [支持契约类型断言中的泛型](#support-for-generics-in-contract-type-assertions)。
* [支持在属性访问器和特定运算符函数中使用契约](#support-for-contracts-inside-property-accessors-and-specific-operator-functions)。
* [支持在契约中使用 `returnsNotNull()` 函数](#support-for-the-returnsnotnull-function-in-contracts)，作为一种在满足条件时确保非 null 返回值的方法。
* [新的 `holdsIn` 关键字](#new-holdsin-keyword)，允许您假设在 Lambda 内部传递的条件为真。

这些改进是 [实验性的](components-stability.md#stability-levels-explained)。要启用，您在声明契约时仍需
使用 `@OptIn(ExperimentalContracts::class)` 注解。`holdsIn` 关键字和 `returnsNotNull()`
函数还需要 `@OptIn(ExperimentalExtendedContracts::class)` 注解。

要使用这些改进，您还需要添加下面各节中描述的编译器选项。

我们欢迎您在我们的 [问题跟踪器](https://kotl.in/issue) 中提供反馈。

#### 支持契约类型断言中的泛型

您现在可以编写对泛型类型执行类型断言的契约：

```kotlin
import kotlin.contracts.*

sealed class Failure {
    class HttpError(val code: Int) : Failure()
    // 在此处插入其他失败类型
}

sealed class Result<out T, out F : Failure> {
    class Success<T>(val data: T) : Result<T, Nothing>()
    class Failed<F : Failure>(val failure: F) : Result<Nothing, F>()
}

@OptIn(ExperimentalContracts::class)
// 使用契约断言泛型类型
fun <T, F : Failure> Result<T, F>.isHttpError(): Boolean {
    contract {
        returns(true) implies (this@isHttpError is Result.Failed<Failure.HttpError>)
    }
    return this is Result.Failed && this.failure is Failure.HttpError
}
```

在此示例中，契约对 `Result` 对象执行类型断言，允许编译器安全地将其 [智能转换](typecasts.md#smart-casts)
为断言的泛型类型。

此功能是 [实验性的](components-stability.md#stability-levels-explained)。要启用，请在您的 `build.gradle(.kts)` 文件中添加以下编译器
选项：

```kotlin
kotlin {
    compilerOptions {
        freeCompilerArgs.add("-Xallow-contracts-on-more-functions")
    }
}
```

#### 支持在属性访问器和特定运算符函数中使用契约

您现在可以在属性访问器和特定运算符函数内部定义契约。
这让您可以在更多类型的声明上使用契约，使其更加灵活。

例如，您可以在 Getter 内部使用契约，以便为接收者对象启用智能转换：

```kotlin
import kotlin.contracts.*

val Any.isHelloString: Boolean
    get() {
        @OptIn(ExperimentalContracts::class)
        // 当 Getter 返回 true 时，允许将接收者智能转换为 String
        contract { returns(true) implies (this@isHelloString is String) }
        return "hello" == this
    }

fun printIfHelloString(x: Any) {
    if (x.isHelloString) {
        // 在将接收者智能转换为 String 后打印长度
        println(x.length)
        // 5
    }
}
```

此外，您可以在以下运算符函数中使用契约：

* `invoke`
* `contains`
* `rangeTo`, `rangeUntil`
* `componentN`
* `iterator`
* `unaryPlus`, `unaryMinus`, `not`
* `inc`, `dec`

以下是在运算符函数中使用契约以确保 Lambda 内部变量初始化的示例：

```kotlin
import kotlin.contracts.*

class Runner {
    @OptIn(ExperimentalContracts::class)
    // 允许对 Lambda 内部赋值的变量进行初始化
    operator fun invoke(block: () -> Unit) {
        contract {
            callsInPlace(block, InvocationKind.EXACTLY_ONCE)
        }
        block()
    }
}

fun testOperator(runner: Runner) {
    val number: Int
    runner {
        number = 1
    }
    // 打印由契约保证的确定初始化后的值
    println(number)
    // 1
}
```

此功能是 [实验性的](components-stability.md#stability-levels-explained)。要启用，请在您的 `build.gradle(.kts)` 文件中添加以下编译器
选项：

```kotlin
kotlin {
    compilerOptions {
        freeCompilerArgs.add("-Xallow-contracts-on-more-functions")
    }
}
```

#### 支持在契约中使用 `returnsNotNull()` 函数

Kotlin 2.2.20 为契约引入了 [`returnsNotNull()`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.contracts/-contract-builder/returns-not-null.html) 函数。
您可以使用此函数来确保当满足特定条件时，函数会返回一个非 null 值。
这通过将单独的可为 null 和不可为 null 的函数重载替换为单个简洁的函数，从而简化了您的代码：

```kotlin
import kotlin.contracts.*

@OptIn(ExperimentalContracts::class, ExperimentalExtendedContracts::class)
fun decode(encoded: String?): String? {
    contract {
        // 保证当输入为非 null 时，返回值为非 null
        (encoded != null) implies (returnsNotNull())
    }
    if (encoded == null) return null
    return java.net.URLDecoder.decode(encoded, "UTF-8")
}

fun useDecodedValue(s: String?) {
    // 使用安全调用，因为返回值可能为 null
    decode(s)?.length
    if (s != null) {
        // 在智能转换后将返回值视为非 null
        decode(s).length
    }
}
```

在此示例中，`decode()` 函数中的契约允许编译器在输入为
非 null 时对其返回值进行智能转换，从而消除了对额外 null 检查或多个重载的需求。

此功能是 [实验性的](components-stability.md#stability-levels-explained)。要启用，请在您的 `build.gradle(.kts)` 文件中添加以下编译器
选项：

```kotlin
kotlin {
    compilerOptions {
        freeCompilerArgs.add("-Xallow-condition-implies-returns-contracts")
    }
}
```

#### 新的 `holdsIn` 关键字

Kotlin 2.2.20 为契约引入了新的 [`holdsIn`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.contracts/-contract-builder/holds-in.html) 关键字。
您可以使用它来确保在特定的 Lambda 内部，布尔条件被假定为 `true`。这让您可以使用契约
构建具有条件智能转换的 DSL。

示例如下：

```kotlin
import kotlin.contracts.*

@OptIn(ExperimentalContracts::class, ExperimentalExtendedContracts::class)
fun <T> T.alsoIf(condition: Boolean, block: (T) -> Unit): T {
    contract {
        // 声明 Lambda 最多运行一次
        callsInPlace(block, InvocationKind.AT_MOST_ONCE)
        // 声明在 Lambda 内部假设条件为真
        condition holdsIn block
    }
    if (condition) block(this)
    return this
}

fun useApplyIf(input: Any) {
    val result = listOf(1, 2, 3)
        .first()
        .alsoIf(input is Int) {
            // 在 Lambda 内部，输入参数被智能转换为 Int
            // 打印输入和列表第一个元素的总和
            println(input + it)
            // 2
        }
        .toString()
}
```

此功能是 [实验性的](components-stability.md#stability-levels-explained)。要启用，请在您的 `build.gradle(.kts)` 文件中添加以下编译器
选项：

```kotlin
kotlin {
    compilerOptions {
        freeCompilerArgs.add("-Xallow-holdsin-contract")
    }
}
```

## Kotlin/JVM：在 `when` 表达式中支持 `invokedynamic`
<primary-label ref="experimental-opt-in"/> 

在 Kotlin 2.2.20 中，您现在可以使用 `invokedynamic` 编译 `when` 表达式。以前，具有多个
类型检查的 `when` 表达式在字节码中会被编译为一长串 `instanceof` 检查。

现在，当满足以下条件时，您可以在 `when` 表达式中使用 `invokedynamic` 来生成更小的字节码，类似于
Java `switch` 语句产生的字节码：

* 除 `else` 之外的所有条件都是 `is` 或 `null` 检查。
* 表达式不包含 [守卫条件 (`if`)](control-flow.md#guard-conditions-in-when-expressions)。
* 条件不包括无法直接进行类型检查的类型，例如可变 Kotlin 集合 (`MutableList`) 或函数类型 (`kotlin.Function1`、`kotlin.Function2` 等)。
* 除 `else` 外至少有两个条件。
* 所有分支检查 `when` 表达式的同一个主体。

例如：

```kotlin
open class Example

class A : Example()
class B : Example()
class C : Example()

fun test(e: Example) = when (e) {
    // 使用 invokedynamic 和 SwitchBootstraps.typeSwitch
    is A -> 1
    is B -> 2
    is C -> 3
    else -> 0
}
```

启用新功能后，此示例中的 `when` 表达式会编译为单个 `invokedynamic` 类型切换，
而不是多个 `instanceof` 检查。

要启用此功能，请使用 JVM 目标版本 21 或更高版本编译您的 Kotlin 代码，并添加以下编译器选项：

```bash
-Xwhen-expressions=indy
```

或者将其添加到您的 `build.gradle(.kts)` 文件的 `compilerOptions {}` 代码块中：

```kotlin
kotlin {
    compilerOptions {
        freeCompilerArgs.add("-Xwhen-expressions=indy")
    }
}
```

此功能是 [实验性的](components-stability.md#stability-levels-explained)。我们欢迎您在我们的问题跟踪器 [YouTrack](https://youtrack.jetbrains.com/issue/KT-65688) 中提供反馈。

## Kotlin Multiplatform

Kotlin 2.2.20 为 Kotlin Multiplatform 带来了重大变更：Swift 导出默认可用、
新增了一个共享源集，并且您可以尝试一种管理公共依赖项的新方法。

### Swift 导出默认可用
<primary-label ref="experimental-general"/> 

Kotlin 2.2.20 引入了对 Swift 导出的实验性支持。它允许您直接导出 Kotlin 源代码
并以符合 Swift 习惯的方式调用 Kotlin 代码，从而无需 Objective-C 头文件。

这将显著改善 Apple 目标的多平台开发。例如，如果您有一个包含顶级
函数的 Kotlin 模块，Swift 导出可以实现干净的、特定于模块的导入，消除了令人困惑的 Objective-C 下划线
和修饰名称。

关键特性包括：

* **多模块支持**。每个 Kotlin 模块都作为一个单独的 Swift 模块导出，简化了函数调用。
* **软件包支持**。Kotlin 软件包在导出过程中会被显式保留，避免了生成的 Swift 代码中的命名冲突。
* **类型别名**。Kotlin 类型别名会被导出并在 Swift 中保留，提高了可读性。
* **增强的基元类型为 null 性**。与 Objective-C 互操作不同（后者需要将 `Int?` 之类的类型装箱到
  `KotlinInt` 等包装类中以保留为 null 性），Swift 导出直接转换为 null 性信息。
* **重载**。您可以在 Swift 中调用 Kotlin 的重载函数而不会产生歧义。
* **展平的软件包结构**。您可以将 Kotlin 软件包转换为 Swift 枚举，从而从生成的 Swift 代码中移除软件包前缀。
* **模块名称自定义**。您可以在 Kotlin 项目的 Gradle 配置中自定义生成的 Swift 模块名称。

#### 如何启用 Swift 导出

该功能目前处于 [实验性阶段](components-stability.md#stability-levels-explained)，仅在使用 [直接集成](https://kotlinlang.org/docs/multiplatform/multiplatform-direct-integration.html)
将 iOS 框架连接到 Xcode 项目的项目中有效。这是使用 IntelliJ IDEA 中的 Kotlin Multiplatform 插件或通过 [Web 向导](https://kmp.jetbrains.com/)
创建的多平台项目的标准配置。

要试用 Swift 导出，请配置您的 Xcode 项目：

1. 在 Xcode 中，打开项目设置。
2. 在 **Build Phases** 选项卡上，找到包含 `embedAndSignAppleFrameworkForXcode` 任务的 **Run Script** 阶段。
3. 调整脚本，使其在运行脚本阶段包含 `embedSwiftExportForXcode` 任务：

   ```bash
   ./gradlew :<Shared module name>:embedSwiftExportForXcode
   ```

   ![添加 Swift 导出脚本](xcode-swift-export-run-script-phase.png){width=700}

4. 构建项目。Swift 模块将在构建输出目录中生成。

该功能默认可用。如果您在之前的版本中已经启用了它，现在可以从 `gradle.properties` 文件中删除 `kotlin.experimental.swift-export.enabled`。

> 为了节省时间，请克隆我们已设置好 Swift 导出的 [公共示例](https://github.com/Kotlin/swift-export-sample)。
>
{style="tip"}

有关 Swift 导出的更多信息，请参阅我们的 [文档](native-swift-export.md)。

#### 留下反馈

我们计划在未来的 Kotlin 版本中扩展并逐步稳定 Swift 导出支持。在
Kotlin 2.2.20 之后，我们将专注于改进 Kotlin 和 Swift 之间的互操作性，特别是围绕协程和 Flow。

支持 Swift 导出是 Kotlin Multiplatform 的一项重大变更。我们欢迎您的反馈：

* 在 Kotlin Slack 中直接联系开发团队 – [获取邀请](https://surveys.jetbrains.com/s3/kotlin-slack-sign-up?_gl=1*ju6cbn*_ga*MTA3MTk5NDkzMC4xNjQ2MDY3MDU4*_ga_9J976DJZ68*MTY1ODMzNzA3OS4xMDAuMS4xNjU4MzQwODEwLjYw) 并加入 [#swift-export](https://kotlinlang.slack.com/archives/C073GUW6WN9) 频道。
* 在 [YouTrack](https://kotl.in/issue) 中报告您在使用 Swift 导出时遇到的任何问题。

### 用于 `js` 和 `wasmJs` 目标的共享源集

以前，Kotlin Multiplatform 默认不包含用于 JavaScript (`js`) 和 WebAssembly (`wasmJs`) Web 目标的共享源集。
要在 `js` 和 `wasmJs` 之间共享代码，您必须手动配置自定义源集或在两个地方编写代码，
一个版本用于 `js`，另一个版本用于 `wasmJs`。例如：

```kotlin
// commonMain
expect suspend fun readCopiedText(): String

// jsMain
external interface Navigator { val clipboard: Clipboard }
// JS 和 Wasm 中不同的互操作
external interface Clipboard { fun readText(): Promise<String> }
external val navigator: Navigator

suspend fun readCopiedText(): String {
    // JS 和 Wasm 中不同的互操作
    return navigator.clipboard.readText().await()
}

// wasmJsMain
external interface Navigator { val clipboard: Clipboard }
external interface Clipboard { fun readText(): Promise<JsString> }
external val navigator: Navigator

suspend fun readCopiedText(): String {
    return navigator.clipboard.readText().await().toString()
}
```

从该版本开始，当您使用 [默认层次结构模板](https://kotlinlang.org/docs/multiplatform/multiplatform-hierarchy.html#default-hierarchy-template) 时，
Kotlin Gradle 插件会添加一个新的 Web 共享源集（由 `webMain` 和 `webTest` 组成）。

通过此更改，`web` 源集成为 `js` 和 `wasmJs` 源集的父级。更新后的源集
层次结构如下所示：

![将默认层次结构模板与 web 结合使用的示例](default-hierarchy-example-with-web.svg)

新的源集允许您为 `js` 和 `wasmJs` 目标编写同一份代码。
您可以将共享代码放在 `webMain` 中，并使其自动适用于两者：

```kotlin
// commonMain
expect suspend fun readCopiedText(): String

// webMain
@OptIn(ExperimentalWasmJsInterop::class)
private suspend fun <R : JsAny?> Promise<R>.await(): R = suspendCancellableCoroutine { continuation ->
    this.then(
        onFulfilled = { continuation.resumeWith(Result.success(it)); null },
        onRejected = { continuation.resumeWithException(it.asJsException()); null }
    )
}

external interface Navigator { val clipboard: Clipboard }
external interface Clipboard { fun readText(): Promise<JsString> }
external val navigator: Navigator

actual suspend fun readCopiedText(): String {
    return navigator.clipboard.readText().await().toString()
}
```

此更新简化了 `js` 和 `wasmJs` 目标之间的代码共享。它在以下两种情况下特别有用：

* 如果您是库作者，并且希望为 `js` 和 `wasmJs` 目标同时添加支持，而无需重复代码。
* 如果您正在开发针对 Web 的 Compose Multiplatform 应用程序，启用对 `js` 和 `wasmJs` 目标的跨平台编译，
  以获得更广泛的浏览器兼容性。鉴于这种回退模式，当您创建一个网站时，它可以在所有浏览器上
  开箱即用，因为现代浏览器使用 `wasmJs`，而较旧的浏览器使用 `js`。

要试用此功能，请在您的 `build.gradle(.kts)` 文件的 `kotlin {}` 代码块中使用 [默认层次结构模板](https://kotlinlang.org/docs/multiplatform/multiplatform-hierarchy.html#default-hierarchy-template)：

```kotlin
kotlin {
    js()
    wasmJs()

    // 启用默认源集层次结构，包括 webMain 和 webTest
    applyDefaultHierarchyTemplate()
}
```

在应用默认层次结构之前，请仔细考虑如果您的项目具有自定义共享
源集或如果您重命名了 `js("web")` 目标，是否存在任何潜在冲突。要解决这些冲突，请重命名冲突的源集或目标，或者
不使用默认层次结构。

### 稳定的 Kotlin 库跨平台编译

Kotlin 2.2.20 完成了一个重要的 [路线图项目](https://youtrack.jetbrains.com/issue/KT-71290)，使
Kotlin 库的跨平台编译趋于稳定。

您现在可以使用任何 [支持的主机](native-target-support.md#hosts) 来生成用于发布 Kotlin 库的 `.klib` 构件。这显著简化了
发布过程，特别是对于以前需要 Mac 计算机的 Apple 目标。

该功能默认可用。如果您已经通过 `kotlin.native.enableKlibsCrossCompilation=true` 启用了跨平台编译，
现在可以从 `gradle.properties` 文件中将其删除。

遗憾的是，目前仍然存在一些限制。在以下情况下，您仍需要使用 Mac 计算机：

* 您的库或任何从属模块具有 [cinterop 依赖项](native-c-interop.md)。
* 您在项目中设置了 [CocoaPods 集成](https://kotlinlang.org/docs/multiplatform/multiplatform-cocoapods-overview.html)。
* 您需要为 Apple 目标构建或测试 [最终二进制文件](https://kotlinlang.org/docs/multiplatform/multiplatform-build-native-binaries.html)。

有关发布多平台库的更多信息，请参阅我们的 [文档](https://kotlinlang.org/docs/multiplatform/multiplatform-publish-lib-setup.html)。

### 声明公共依赖项的新方法
<primary-label ref="experimental-opt-in"/>

为了简化使用 Gradle 设置多平台项目，当您的项目使用 Gradle 8.8 或更高版本时，Kotlin 2.2.20 现在允许您
通过使用顶级 `dependencies {}` 代码块在 `kotlin {}` 代码块中声明公共依赖项。
这些依赖项的行为就像它们是在 `commonMain` 源集中声明的一样。此功能类似于
您用于 Kotlin/JVM 和仅限 Android 项目的依赖项块，现在它在 Kotlin 
Multiplatform 中处于 [实验性阶段](components-stability.md#stability-levels-explained)。

在项目级别声明公共依赖项可以减少跨源集的重复配置，并有助于简化
您的构建设置。您仍可以根据需要在每个源集中添加平台特定的依赖项。

要试用此功能，请通过在顶级 `dependencies {}` 代码块之前添加 `@OptIn(ExperimentalKotlinGradlePluginApi::class)` 注解来启用它。例如：

```kotlin
kotlin {
    @OptIn(ExperimentalKotlinGradlePluginApi::class)
    dependencies {
        implementation("org.jetbrains.kotlinx:kotlinx-coroutines-core:%coroutinesVersion%")
    }
}
```

我们欢迎您在 [YouTrack](https://youtrack.jetbrains.com/issue/KT-76446) 中对该功能提供反馈。

### 依赖项中目标支持的新诊断

在 Kotlin 2.2.20 之前，如果构建脚本中的依赖项不支持源集所需的所有目标，
Gradle 产生的错误消息会让人难以理解问题所在。

Kotlin 2.2.20 引入了一个新的诊断功能，可以清晰地显示每个依赖项支持哪些目标以及不支持哪些目标。

此诊断功能默认启用。如果由于某种原因您需要禁用它，请在此 [YouTrack 问题](https://kotl.in/kmp-dependencies-diagnostic-issue) 的评论中告知我们。
您可以在 `gradle.properties` 文件中使用以下 Gradle 属性来禁用诊断：

| 属性                                                      | 描述                                          |
|----------------------------------------------------------|---------------------------------------------|
| `kotlin.kmp.eagerUnresolvedDependenciesDiagnostic=false` | 仅针对元数据编译和导入运行诊断                            |
| `kotlin.kmp.unresolvedDependenciesDiagnostic=false`      | 完全禁用诊断                                      |

## Kotlin/Native

此版本带来了对 Xcode 26 的支持、对 Objective-C/Swift 互操作性的改进、调试功能改进以及新的二进制选项。

### 支持 Xcode 26

从 Kotlin 2.2.2**1** 开始，Kotlin/Native 编译器支持 Xcode 26（Xcode 的最新稳定版本）。
您现在可以更新您的 Xcode 并访问最新的 API，以继续为 Apple
操作系统开发 Kotlin 项目。

### 支持二进制文件中的栈保护 (Stack Canaries)

从 Kotlin 2.2.20 开始，Kotlin 在生成的 Kotlin/Native 二进制文件中增加了对栈保护 (Stack Canaries) 的支持。作为
堆栈保护的一部分，此安全功能可防止栈溢出攻击，从而减轻一些常见的应用程序漏洞。
该功能已在 Swift 和 Objective-C 中可用，现在 Kotlin 也支持它。

Kotlin/Native 中栈保护的实现遵循 [Clang](https://clang.llvm.org/docs/ClangCommandLineReference.html#cmdoption-clang-fstack-protector) 中栈保护器的行为。

要启用栈保护 (Stack Canaries)，请在您的 `gradle.properties` 文件中添加以下 [二进制选项](native-binary-options.md)：

```none
kotlin.native.binary.stackProtector=yes
```

该属性为所有容易受到栈溢出攻击的 Kotlin 函数启用此功能。其他模式包括：

* `kotlin.native.binary.stackProtector=strong`，对容易受到栈溢出攻击的函数使用更强的启发式方法。
* `kotlin.native.binary.stackProtector=all`，为所有函数启用栈保护器。

请注意，在某些情况下，栈保护可能会带来性能损耗。

### 更小的发布二进制文件体积
<primary-label ref="experimental-opt-in"/> 

Kotlin 2.2.20 引入了 `smallBinary` 选项，可以帮助您减小发布二进制文件的体积。
新选项实际上是在 LLVM 编译阶段将 `-Oz` 设置为编译器的默认优化参数。

启用 `smallBinary` 选项后，您可以减小发布二进制文件的体积并缩短构建时间。但是，它在某些情况下可能会
影响运行时性能。

这项新功能目前处于 [实验性阶段](components-stability.md#stability-levels-explained)。要在您的
项目中试用它，请在您的 `gradle.properties` 文件中添加以下 [二进制选项](native-binary-options.md)：

```none
kotlin.native.binary.smallBinary=true
```

Kotlin 团队感谢 [Troels Lund](https://github.com/troelsbjerre) 在实现此功能方面的帮助。

### 改进的调试器对象摘要

Kotlin/Native 现在为 LLDB 和 GDB 等调试工具生成更清晰的对象摘要。这提高了
生成的调试信息的可读性，并简化了您的调试体验。

例如，考虑以下对象：

```kotlin
class Point(val x: Int, val y: Int)
val point = Point(1, 2)
```

以前，检查只会显示有限的信息，包括指向对象内存地址的指针：

```none
(lldb) v point
(ObjHeader *) point = [x: ..., y: ...]
(lldb) v point->x
(int32_t *) x = 0x0000000100274048
```

在 Kotlin 2.2.20 中，调试器现在显示更丰富的详细信息，包括实际值：

```none
(lldb) v point
(ObjHeader *) point = Point(x=1, y=2)
(lldb) v point->x
(int32_t) point->x = 1
```

Kotlin 团队感谢 [Nikita Nazarov](https://github.com/nikita-nazarov) 在实现此功能方面的帮助。

有关 Kotlin/Native 调试的更多信息，请参阅 [文档](native-debugging.md)。

### Objective-C 头文件代码块类型中的显式名称

Kotlin 2.2.20 引入了一个选项，可以为从 Kotlin/Native 项目导出的 Objective-C 头文件的 Kotlin 函数类型
添加显式形参名称。形参名称可以改进 Xcode 中的自动补全建议，并有助于避免 Clang 警告。

以前，生成的 Objective-C 头文件中的代码块类型省略了形参名称。在这些情况下，Xcode 的自动补全
会建议在 Objective-C 代码块中调用此类函数时不带形参名称。生成的代码块会触发 Clang 警告。

例如，对于以下 Kotlin 代码：

```kotlin
// Kotlin:
fun greetUser(block: (name: String) -> Unit) = block("John")
```

生成的 Objective-C 头文件没有形参名称：

```objc
// Objective-C:
+ (void)greetUserBlock:(void (^)(NSString *))block __attribute__((swift_name("greetUser(block:)")));
```

因此，在 Xcode 中从 Objective-C 调用 `greetUserBlock()` 函数时，IDE 会建议：

```objc
// Objective-C:
greetUserBlock:^(NSString *) {
    // ...
};
```

建议中缺少的形参名称 `(NSString *)` 会导致 Clang 警告。

通过新选项，Kotlin 将形参名称从 Kotlin 函数类型转发到 Objective-C 代码块类型，因此 Xcode
会在建议中使用它们：

```objc
// Objective-C:
greetUserBlock:^(NSString *name) {
    // ...
};
```

要启用显式形参名称，请在您的 `gradle.properties` 文件中添加以下 [二进制选项](native-binary-options.md)：

```none
kotlin.native.binary.objcExportBlockExplicitParameterNames=true
```

Kotlin 团队感谢 [Yijie Jiang](https://github.com/edisongz) 实现此功能。

### 缩减了 Kotlin/Native 分发包的体积

Kotlin/Native 分发包曾经包含两个带有编译器代码的 JAR 文件：

* `konan/lib/kotlin-native.jar`
* `konan/lib/kotlin-native-compiler-embeddable.jar`。

从 Kotlin 2.2.20 开始，不再发布 `kotlin-native.jar`。

移除的 JAR 文件是可嵌入编译器的旧版本，已不再需要。此更改显著
缩减了分发包的体积。

因此，以下选项现已弃用并移除：

* `kotlin.native.useEmbeddableCompilerJar=false` Gradle 属性。相反，可嵌入编译器 JAR 文件始终
  用于 Kotlin/Native 项目。
* `KotlinCompilerPluginSupportPlugin.getPluginArtifactForNative()` 函数。相反，始终使用 [`getPluginArtifact()`](https://kotlinlang.org/api/kotlin-gradle-plugin/kotlin-gradle-plugin-api/org.jetbrains.kotlin.gradle.plugin/-kotlin-compiler-plugin-support-plugin/get-plugin-artifact.html)
  函数。

有关更多信息，请参阅 [YouTrack 问题](https://kotl.in/KT-51301)。

### 默认将 KDoc 导出到 Objective-C 头文件

在编译 Kotlin/Native 最终二进制文件期间生成 Objective-C 头文件时，[KDoc](kotlin-doc.md) 注释现在默认导出。

以前，您需要手动在构建文件中添加 `-Xexport-kdoc` 选项。现在，它会自动传递给编译任务。

此选项将 KDoc 注释嵌入到 klib 中，并在生成 Apple 框架时从 klib 中提取注释。因此，
类和方法上的注释会出现在自动补全过程中，例如在 Xcode 中。

您可以在 `build.gradle(.kts)` 文件的 `binaries {}` 代码块中禁用从 klib 到生成的 Apple 框架的 KDoc 注释导出：

```kotlin
import org.jetbrains.kotlin.gradle.ExperimentalKotlinGradlePluginApi

kotlin {
    iosArm64 {
        binaries {
            framework { 
                baseName = "sdk"
                @OptIn(ExperimentalKotlinGradlePluginApi::class)
                exportKdoc.set(false)
            }
        }
    }
}
```

有关更多信息，请参阅 [我们的文档](native-objc-interop.md#provide-documentation-with-kdoc-comments)。

### 弃用 `x86_64` Apple 目标

Apple 在几年前停止生产搭载 Intel 芯片的设备，并于 [最近宣布](https://www.youtube.com/live/51iONeETSng?t=3288s) 
macOS Tahoe 26 将是最后一个支持 Intel 架构的操作系统版本。

这使得我们越来越难以在构建代理上正确测试这些目标，特别是在未来的 Kotlin
版本中，我们将更新 macOS 26 附带的受支持 Xcode 版本。

从 Kotlin 2.2.20 开始，`macosX64` 和 `iosX64` 目标被降级为支持层级 2。这意味着该目标会
定期在 CI 上进行测试以确保其可编译，但可能不会自动进行测试以确保其可运行。

我们计划逐步弃用所有 `x86_64` Apple 目标，并最终在 Kotlin 2.2.20−2.4.0
发布周期内移除对它们的支持。这包括以下目标：

* `macosX64`
* `iosX64`
* `tvosX64`
* `watchosX64`

有关支持层级的更多信息，请参阅 [Kotlin/Native 目标支持](native-target-support.md)。

## Kotlin/Wasm

Kotlin/Wasm 现已进入 Beta 阶段，提供更高的稳定性以及诸如分离的 npm 依赖项、 
[改进的 JavaScript 互操作异常处理](#improved-exception-handling-in-kotlin-wasm-and-javascript-interop)、
[内置浏览器调试支持](#support-for-debugging-in-browsers-without-configuration) 等改进。

### 分离的 npm 依赖项

以前，在您的 Kotlin/Wasm 项目中，所有 [npm](https://www.npmjs.com/) 依赖项都安装在您的项目文件夹中，
包括 Kotlin 工具依赖项和您自己的依赖项。它们还一起记录在项目的锁定文件
（`package-lock.json` 或 `yarn.lock`）中。

结果是，每当 Kotlin 工具依赖项更新时，即使您没有添加
或更改任何内容，也必须更新锁定文件。

从 Kotlin 2.2.20 开始，Kotlin 工具 npm 依赖项安装在您的项目之外。现在，
工具和您（用户）的依赖项拥有单独的目录：

* **工具依赖项目录：**

  `<kotlin-user-home>/kotlin-npm-tooling/<yarn|npm>/hash/node_modules`

* **用户依赖项目录：**

  `build/wasm/node_modules`

此外，项目目录内的锁定文件仅包含用户定义的依赖项。

此改进使您的锁定文件仅专注于您自己的依赖项，有助于保持项目整洁，并
减少对文件的非必要更改。

此更改默认对 `wasm-js` 目标启用。该更改尚未对 `js` 目标实施。虽然
计划在未来的版本中实施，但在 Kotlin 2.2.20 中，对于 `js` 目标，npm 依赖项的行为保持不变。

### 改进了 Kotlin/Wasm 和 JavaScript 互操作中的异常处理

以前，Kotlin 难以理解在 JavaScript (JS) 中抛出并跨越到 Kotlin/Wasm 代码的异常（错误）。

在某些情况下，反方向也会发生问题，即异常被抛出或通过 Wasm
代码传递到 JS，并被包装到 `WebAssembly.Exception` 中而不包含任何详细信息。这些 Kotlin 异常处理问题使
调试变得困难。

从 Kotlin 2.2.20 开始，异常方面的开发体验在两个方向上都得到了改进：

* 当从 JS 抛出异常时，您可以在 Kotlin 端看到更多信息。
  当此类异常通过 Kotlin 传播回 JS 时，它不再被包装到 WebAssembly 中。
* 当从 Kotlin 抛出异常时，它们现在可以在 JS 端作为 JS 错误被捕获。

新的异常处理在支持 [`WebAssembly.JSTag`](https://webassembly.github.io/exception-handling/js-api/#dom-webassembly-jstag)
功能的现代浏览器中自动运行：

* Chrome 115+
* Firefox 129+
* Safari 18.4+

在旧版浏览器中，异常处理行为保持不变。

### 支持在浏览器中无需配置即可调试

以前，浏览器无法自动访问调试所需的 Kotlin/Wasm 项目源代码。
要在浏览器中调试 Kotlin/Wasm 应用程序，您必须手动配置构建以通过在 `build.gradle(.kts)` 文件中添加以下代码片段来提供这些源代码：

```kotlin
devServer = (devServer ?: KotlinWebpackConfig.DevServer()).apply {
    static = (static ?: mutableListOf()).apply {
        add(project.rootDir.path)
    }
}
```

从 Kotlin 2.2.20 开始，在 [现代浏览器](wasm-configuration.md#browser-versions) 中调试您的应用程序可以开箱即用。
当您运行 Gradle 开发任务 (`*DevRun`) 时，Kotlin 会自动将源文件提供给浏览器，从而允许您
设置断点、检查变量并逐步执行 Kotlin 代码，而无需额外设置。

此更改通过消除手动配置的需求来简化调试。所需的配置现在已包含
在 Kotlin Gradle 插件中。如果您之前将此配置添加到您的 `build.gradle(.kts)` 文件中，您应该将其删除以避免冲突。

浏览器调试默认对所有 Gradle `*DevRun` 任务启用。这些任务不仅提供应用程序， 
还提供其源文件，因此请仅将其用于本地开发，并避免在云端或生产环境中运行它们，
因为在这些环境中源代码会被公开。

#### 处理调试期间的重复重新加载

默认提供源代码可能会导致 [在 Kotlin 编译和打包完成之前，应用程序在浏览器中重复重新加载](https://youtrack.jetbrains.com/issue/KT-80582/Multiple-reloads-when-using-webpack-dev-server-after-2.2.20-Beta2#focus=Comments-27-12596427.0-0)。
作为变通方法，请调整您的 webpack 配置以忽略 Kotlin 源文件并禁用对所提供静态文件的监视。
在项目根目录下的 `webpack.config.d` 目录中添加一个具有以下内容的 `.js` 文件：

```kotlin
config.watchOptions = config.watchOptions || {
    ignored: ["**/*.kt", "**/node_modules"]
}

if (config.devServer) {
    config.devServer.static = config.devServer.static.map(file => {
        if (typeof file === "string") {
        return { directory: file,
                 watch: false,
        }
    } else {
        return file
    }
    })
}
```

### 消除空的 `yarn.lock` 文件

以前，Kotlin Gradle 插件 (KGP) 会自动生成一个 `yarn.lock` 文件，其中包含有关 
Kotlin 工具链所需的 npm 软件包的信息，以及来自项目或所用库的任何现有 [npm](https://www.npmjs.com/) 依赖项。

现在，KGP 分别管理工具链依赖项，并且除非
项目具有 npm 依赖项，否则不再生成项目级别的 `yarn.lock` 文件。

当添加 npm 依赖项时，KGP 会自动创建一个 `yarn.lock` 文件，并在删除 npm 依赖项时删除 `yarn.lock` 文件。

此更改清理了项目结构，并使其更容易跟踪何时引入了实际的 npm 依赖项。

配置此行为无需额外步骤。从 Kotlin 2.2.20 开始，它默认应用于 Kotlin/Wasm 项目。

### 完全限定类名中的新编译器错误

在 Kotlin/Wasm 上，编译器默认不会在生成的二进制文件中存储类的完全限定名称 (FQN)。
这种方法避免了增加应用程序体积。

因此，在以前的 Kotlin 版本中，调用 `KClass::qualifiedName` 属性会返回一个空字符串，而不是
类的限定名称。

从 Kotlin 2.2.20 开始，除非您显式启用了限定名称功能，否则当您在 Kotlin/Wasm 项目中使用 `KClass::qualifiedName` 属性时，编译器会报告错误。

此更改防止了调用 `qualifiedName` 属性时出现意外的空字符串，并通过在编译时捕获
问题来改进开发体验。

诊断默认启用，错误会自动报告。要禁用诊断并允许在
Kotlin/Wasm 中存储 FQN，请通过在您的 `build.gradle(.kts)` 文件中添加以下选项来指示编译器为所有类存储完全限定名称：

```kotlin
kotlin {
    wasmJs {
        ...
        compilerOptions {
            freeCompilerArgs.add("-Xwasm-kclass-fqn")
        }
    }
}
```

> 请记住，启用此选项会增加应用程序体积。
>
{style="note"}

## Kotlin/JS

Kotlin 2.2.20 支持使用 `BigInt` 类型来表示 Kotlin 的 `Long` 类型，从而在导出的
声明中允许使用 `Long`。此外，此版本还添加了一个 DSL 函数来清理 Node.js 参数。

### 使用 `BigInt` 类型来表示 Kotlin 的 `Long` 类型
<primary-label ref="experimental-opt-in"/>

在 ES2020 标准之前，JavaScript (JS) 不支持用于精确表示大于 53 位的整数的
基元类型。

由于这个原因，Kotlin/JS 过去使用包含两个 `number` 属性的 JavaScript 对象来表示 `Long` 值（其宽度为 64 位）。这种自定义实现使得 Kotlin 和 JavaScript 之间的互操作性更加复杂。

从 Kotlin 2.2.20 开始，当编译为现代 JavaScript (ES2020) 时，Kotlin/JS 现在使用 JavaScript 内置的 `BigInt` 类型来表示 Kotlin 的 `Long` 值。

此更改使得 [将 `Long` 类型导出到 JavaScript](#usage-of-long-in-exported-declarations) 成为可能，该功能也在
Kotlin 2.2.20 中引入。因此，此更改简化了 Kotlin 和 JavaScript 之间的互操作性。

要启用它，您需要在您的 `build.gradle(.kts)` 文件中添加以下编译器选项：

```kotlin
kotlin {
    js {
        ...
        compilerOptions {
            freeCompilerArgs.add("-Xes-long-as-bigint")
        }
    }
}
```

此功能是 [实验性的](components-stability.md#stability-levels-explained)。我们欢迎您在我们的问题跟踪器 [YouTrack](https://youtrack.jetbrains.com/issue/KT-57128) 中提供反馈。

#### 在导出的声明中使用 `Long`

由于 Kotlin/JS 使用了自定义的 `Long` 表示方式，因此很难提供一种直接的方法在 JavaScript 中与
Kotlin 的 `Long` 进行交互。结果是，您无法将使用 `Long` 类型的 Kotlin 代码导出到 JavaScript。
此问题影响了任何使用 `Long` 的代码，例如函数形参、类属性或构造函数。

现在 Kotlin 的 `Long` 类型可以编译为 JavaScript 的 `BigInt` 类型，Kotlin/JS 支持将 `Long` 值导出到 JavaScript，
简化了 Kotlin 和 JavaScript 代码之间的互操作性。

要启用此功能：

1. 通过在 `build.gradle(.kts)` 文件的 `freeCompilerArgs` 属性中添加以下编译器选项，允许在 Kotlin/JS 中导出 `Long`：

    ```kotlin
    kotlin {
        js {
            ...
            compilerOptions {                   
                freeCompilerArgs.add("-XXLanguage:+JsAllowLongInExportedDeclarations")
            }
        }
    }
    ```

2. 启用 `BigInt` 类型。请参阅 [使用 `BigInt` 类型来表示 Kotlin 的 `Long` 类型](#usage-of-the-bigint-type-to-represent-kotlin-s-long-type) 了解如何启用它。

### 用于更简洁参数的新 DSL 函数

当使用 Node.js 运行 Kotlin/JS 应用程序时，传递给程序的参数 (`args`) 曾经包括：

* 可执行文件 `Node` 的路径。
* 脚本的路径。
* 您提供的实际命令行参数。

然而，`args` 的预期行为是仅包含命令行参数。为了实现这一点，您必须
在 `build.gradle(.kts)` 文件或 Kotlin 代码中手动使用 `drop()` 函数跳过前两个参数：

```kotlin
fun main(args: Array<String>) {
    println(args.drop(2).joinToString(", "))
}
```

这种变通方法是重复的、容易出错的，并且在跨平台共享代码时效果不佳。

为了解决这个问题，Kotlin 2.2.20 引入了一个名为 `passCliArgumentsToMainFunction()` 的新 DSL 函数。

使用此函数，仅包含命令行参数，而排除了 `Node` 和脚本路径：

```kotlin
fun main(args: Array<String>) {
    // 无需 drop()，仅包含您的自定义参数 
    println(args.joinToString(", "))
}
```

此更改减少了模板代码，防止了手动丢弃参数造成的错误，并提高了跨平台兼容性。

要启用此功能，请在您的 `build.gradle(.kts)` 文件中添加以下 DSL 函数：

```kotlin
kotlin {
    js {
        nodejs {
            passCliArgumentsToMainFunction()
        }
    }
}
```

## Gradle

Kotlin 2.2.20 在 Gradle 构建报告中为 Kotlin/Native 任务添加了新的编译器性能指标，并对增量编译进行了
体验改进。

### 构建报告中 Kotlin/Native 任务的新编译器性能指标

在 Kotlin 1.7.0 中，我们引入了 [构建报告](gradle-compilation-and-caches.md#build-reports) 以帮助跟踪编译器
性能。自那时起，我们添加了更多指标，使这些报告更加详细，对于调查
性能问题非常有用。

在 Kotlin 2.2.20 中，构建报告现在包含 Kotlin/Native 任务的编译器性能指标。

要了解有关构建报告及其配置方式的更多信息，请参阅 [启用构建报告](gradle-compilation-and-caches.md#enabling-build-reports)。

### 预览 Kotlin/JVM 改进的增量编译
<primary-label ref="experimental-general"/>

Kotlin 2.0.0 引入了具有优化前端的新 K2 编译器。Kotlin 2.2.20 在此基础上，通过使用新的
前端来提高 Kotlin/JVM 在某些复杂增量编译场景中的性能。

在我们就稳定其行为开展工作期间，这些改进默认处于禁用状态。要启用它们，请在您的 `gradle.properties` 文件中添加以下
属性：

```none
kotlin.incremental.jvm.fir=true
```

目前，[`kapt` 编译器插件](kapt.md) 与此新行为不兼容。我们正致力于在未来的 Kotlin 版本中添加支持。

我们欢迎您在 [YouTrack](https://youtrack.jetbrains.com/issue/KT-72822) 中对该功能提供反馈。

### 增量编译检测内联函数 Lambda 中的更改

在 Kotlin 2.2.20 之前，如果您启用了增量编译并更改了内联函数中 Lambda 内部的逻辑，
编译器不会在其他模块中重新编译该内联函数的调用站点。因此，这些调用站点使用的是
之前版本的 Lambda，这可能会导致意外行为。

在 Kotlin 2.2.20 中，编译器现在可以检测内联函数 Lambda 中的更改并自动重新编译其调用站点。

### 库发布的改进

Kotlin 2.2.20 添加了新的 Gradle 任务，使库发布更加容易。这些任务可帮助您生成密钥对、上传
公钥，并运行本地检查以确保在上传到 Maven Central 仓库之前验证过程成功。

有关如何将这些任务作为发布过程一部分使用的更多信息，请参阅 [将您的库发布到 Maven Central](https://kotlinlang.org/docs/multiplatform/multiplatform-publish-libraries.html)。

#### 用于生成和上传 PGP 密钥的新 Gradle 任务

在 Kotlin 2.2.20 之前，如果您想将多平台库发布到 Maven Central 仓库，您必须安装
第三方程序（如 `gpg`）来生成用于对您的发布内容进行签名的密钥对。现在，Kotlin Gradle 插件附带了
Gradle 任务，允许您生成密钥对并上传公钥，因此您无需安装其他程序。

##### 生成密钥对

`generatePgpKeys` 任务生成密钥对。当您运行它时，必须按以下格式提供私有密钥库的
密码和您的姓名：

```bash
./gradlew -Psigning.password=example-password generatePgpKeys --name "John Smith <john@example.com>"
```

该任务将密钥对存储在 `build/pgp` 目录中。

> 将您的密钥对移动到安全位置，以防止意外删除或未经授权的访问。
> 
{style="warning"}

##### 上传公钥

`uploadPublicPgpKey` 任务将公钥上传到 Ubuntu 的密钥服务器：`keyserver.ubuntu.com`。运行该任务时， 
请提供 `.asc` 格式公钥的路径：

```bash
./gradlew uploadPublicPgpKey --keyring /path_to/build/pgp/public_KEY_ID.asc
```

#### 本地测试验证的新 Gradle 任务

Kotlin 2.2.20 还添加了 Gradle 任务，用于在将库上传到 Maven Central 仓库之前在本地测试验证。

如果您将 Kotlin Gradle 插件与 Gradle 的 [Signing 插件](https://docs.gradle.org/current/userguide/signing_plugin.html) 和 [Maven Publish 插件](https://docs.gradle.org/current/userguide/publishing_maven.html) 结合使用，您可以运行 `checkSigningConfiguration` 和 `checkPomFileFor<PUBLICATION_NAME>Publication` 任务来验证您的设置是否符合 Maven Central 的要求。将 `<PUBLICATION_NAME>` 替换为您的发布名称。

这些任务不会作为 Gradle `build` 或 `check` 任务的一部分自动运行，因此您需要手动运行它们。 
例如，如果您有一个 `KotlinMultiplatform` 发布：

```bash
./gradlew checkSigningConfiguration checkPomFileForKotlinMultiplatformPublication
```

`checkSigningConfiguration` 任务检查以下内容：

* Signing 插件已配置密钥。
* 配置的公钥已上传到 `keyserver.ubuntu.com` 或 `keys.openpgp.org` 密钥服务器。
* 所有发布都已启用签名。

如果这些检查中有任何一项失败，该任务将返回一个包含有关如何修复问题的信息的错误。

`checkPomFileFor<PUBLICATION_NAME>Publication` 任务检查 `pom.xml` 文件是否符合 Maven Central 的 [要求](https://central.sonatype.org/publish/requirements/#required-pom-metadata)。
如果不符合，该任务将返回一个错误，其中包含有关 `pom.xml` 文件哪些部分不合规的详细信息。

## Maven：`kotlin-maven-plugin` 中支持 Kotlin 守护进程

Kotlin 2.2.20 将 [Kotlin 2.2.0 中引入的构建工具 API](whatsnew22.md#new-experimental-build-tools-api) 更进
一步，在 `kotlin-maven-plugin` 中添加了对 [Kotlin 守护进程](kotlin-daemon.md) 的支持。使用 Kotlin 守护进程时，Kotlin
编译器在单独的隔离进程中运行，这可以防止其他 Maven 插件覆盖系统属性。您 
可以在此 [YouTrack 问题](https://youtrack.jetbrains.com/issue/KT-43894/Maven-Windows-error-RuntimeException-Could-not-find-installation-home-path) 中看到示例。

从 Kotlin 2.2.20 开始，默认使用 Kotlin 守护进程。如果您想恢复到以前的行为，可以通过在 `pom.xml` 文件中将以下属性设置为 `false` 来选择
退出：

```xml
<properties>
    <kotlin.compiler.daemon>false</kotlin.compiler.daemon>
</properties>
```

Kotlin 2.2.20 还引入了一个新的 `jvmArgs` 属性，您可以使用它来自定义 Kotlin 守护进程的默认 JVM 参数。例如，要覆盖 `-Xmx` 和 `-Xms` 选项，请在 `pom.xml` 文件中添加以下内容：

```xml
<properties>
    <kotlin.compiler.daemon.jvmArgs>Xmx1500m,Xms500m</kotlin.compiler.daemon.jvmArgs>
</properties>
```

## Kotlin 编译器选项的新公共架构

Kotlin 2.2.20 为发布在 [`org.jetbrains.kotlin:kotlin-compiler-arguments-description`](https://central.sonatype.com/artifact/org.jetbrains.kotlin/kotlin-compiler-arguments-description) 下的所有编译器选项引入了一个公共架构。
该构件包含所有编译器选项的代码表示形式和 JSON 等效形式（适用于非 JVM 使用者）、
它们的描述以及元数据（例如引入或稳定每个选项的版本）。您可以使用此
架构生成选项的自定义视图或根据需要对其进行分析。

## 标准库

此版本在标准库中引入了新的实验性功能：用于识别 Kotlin/JS 中接口
类型的反射支持、通用原子类型的更新函数，以及用于数组调整大小的 `copyOf()` 重载。

### 支持在 Kotlin/JS 中通过反射识别接口类型
<primary-label ref="experimental-opt-in"/>

Kotlin 2.2.20 在 Kotlin/JS 标准库中添加了 [实验性](components-stability.md#stability-levels-explained) [`KClass.isInterface`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.reflect/-k-class/is-interface.html) 属性。

使用此属性，您现在可以检查类引用是否代表 Kotlin 接口。这使得 Kotlin/JS 更接近于
与 Kotlin/JVM 同等，在 Kotlin/JVM 中您可以使用 `KClass.java.isInterface` 来检查类是否代表接口。

要启用，请使用 `@OptIn(ExperimentalStdlibApi::class)` 注解：

```kotlin
@OptIn(ExperimentalStdlibApi::class)
fun inspect(klass: `KClass<*>`) {
    // 对接口打印 true
    println(klass.isInterface)
}
```

我们欢迎您在我们的问题跟踪器 [YouTrack](https://youtrack.jetbrains.com/issue/KT-78581) 中提供反馈。

### 通用原子类型的新更新函数
<primary-label ref="experimental-opt-in"/>

Kotlin 2.2.20 引入了新的实验性函数，用于更新通用原子类型及其对应数组的元素。
每个函数都使用这些更新函数之一原子地计算一个新值并替换当前值，返回值取决于您使用哪个函数：

* [`update()`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.concurrent.atomics/update.html) 和 [`updateAt()`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.concurrent.atomics/update-at.html) 设置新值而不返回结果。
* [`fetchAndUpdate()`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.concurrent.atomics/fetch-and-update.html) 和 [`fetchAndUpdateAt()`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.concurrent.atomics/fetch-and-update-at.html) 设置新值并返回更改前的旧值。
* [`updateAndFetch()`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.concurrent.atomics/update-and-fetch.html) 和 [`updateAndFetchAt()`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.concurrent.atomics/update-and-fetch-at.html) 设置新值并返回更改后的更新值。

您可以使用这些函数来实现开箱即用不支持的原子转换，例如乘法或按位操作。
在此更改之前，增加通用原子类型并读取以前的值需要使用 [`compareAndSet()`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.concurrent/-atomic-int/compare-and-set.html) 函数进行循环。

与通用原子类型的所有 API 一样，这些函数也是 [实验性的](components-stability.md#stability-levels-explained)。
要启用，请使用 `@OptIn(ExperimentalAtomicApi::class)` 注解。

下面是一个执行不同类型更新并返回旧值或更新后值的代码示例：

```kotlin
import kotlin.concurrent.atomics.*
import kotlin.random.Random

@OptIn(ExperimentalAtomicApi::class)
fun main() {
    val counter = AtomicLong(Random.nextLong())
    val minSetBitsThreshold = 20

    // 设置新值而不使用结果
    counter.update { if (it < 0xDECAF) 0xCACA0 else 0xC0FFEE }

    // 检索当前值，然后对其进行更新
    val previousValue = counter.fetchAndUpdate { 0x1CEDL.shl(Long.SIZE_BITS - it.countLeadingZeroBits()) or it }

    // 更新值，然后检索结果
    val current = counter.updateAndFetch {
        if (it.countOneBits() < minSetBitsThreshold) it.shl(20) or 0x15BADL else it
    }

    val hexFormat = HexFormat {
        upperCase = true
        number {
            removeLeadingZeros = true
        }
    }
    println("Previous value: ${previousValue.toHexString(hexFormat)}")
    println("Current value: ${current.toHexString(hexFormat)}")
    println("Expected status flag set: ${current and 0xBAD != 0xBADL}")
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="2.2.20"}

我们欢迎您在我们的问题跟踪器 [YouTrack](https://youtrack.jetbrains.com/issue/KT-76389) 中提供反馈。

### 数组的 `copyOf()` 重载支持
<primary-label ref="experimental-opt-in"/>

Kotlin 2.2.20 为 [`copyOf()`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.collections/copy-of.html) 函数引入了实验性重载。
它适用于泛型类型 `Array<T>` 的数组和所有基元数组类型。

您可以使用此函数使数组变大，并使用初始值设定项 Lambda 中的值填充新元素。
这可以帮助您减少自定义模板代码，并解决了调整泛型 `Array<T>` 大小会产生可为 null 结果 (`Array<T?>`) 的常见痛点。

示例如下：

```kotlin
@OptIn(ExperimentalStdlibApi::class)
fun main() {
    val row1: `Array<String>` = arrayOf("one", "two")
    // 调整数组大小并使用 Lambda 填充新元素
    val row2: `Array<String>` = row1.copyOf(4) { "default" }
    println(row2.contentToString())
    // [one, two, default, default]
}
```

此 API 是 [实验性的](components-stability.md#stability-levels-explained)。要启用，请使用 `@OptIn(ExperimentalStdlibApi::class)` 注解。

我们欢迎您在我们的 [问题跟踪器](https://youtrack.jetbrains.com/issue/KT-70984) 中提供反馈。

## Compose 编译器

在此版本中，Compose 编译器通过添加新警告并改进构建指标的输出使其更易于阅读，从而带来了体验改进。

### 默认参数的语言版本限制

在此版本中，如果为编译指定的语言版本低于
支持抽象或开放可组合函数中的默认参数所需的版本，Compose 编译器会报告错误。

Compose 编译器从 Kotlin 2.1.0 开始支持抽象函数中的默认参数，从 Kotlin 2.2.0
开始支持开放函数中的默认参数。当针对旧版 Kotlin 语言版本使用较新版本的 Compose 编译器时，
库开发者应注意，即使语言版本不支持，抽象或开放函数中的默认参数仍可能出现在公共 API 中。

### K2 编译器的可组合目标警告

此版本在使用 K2 编译器时添加了关于 [`@ComposableTarget`](https://developer.android.com/reference/kotlin/androidx/compose/runtime/ComposableTarget)
不匹配的警告。

例如：

```text
@Composable fun App() {
  Box { // <-- `Box` 是 `@UiComposable`
    Path(...) // <-- `Path` 是 `@VectorComposable`
    ^^^^^^^^^
    warning: Calling a Vector composable function where a UI composable was expected
  }
}
```
### 构建指标中的完全限定名称

构建指标中报告的类名和函数名现在是完全限定的，从而更容易区分
不同软件包中同名的声明。

此外，构建指标不再包含默认参数中复杂表达式的转储，使其更易于阅读。

## 破坏性变更和弃用

本节重点介绍了值得注意的重要破坏性变更和弃用：

* [kapt](kapt.md) 编译器插件现在默认使用 K2 编译器。因此，控制插件是否使用 K2 编译器的 `kapt.use.k2` 属性已被弃用。如果您将此属性设置为 `false` 以选择
  退出使用 K2 编译器，Gradle 将显示警告。

## 文档更新

Kotlin 文档进行了一些显著更改：

* [Kotlin 路线图](roadmap.md) – 查看关于语言和生态系统演进的 Kotlin 优先级更新列表。
* [属性](properties.md) – 了解在 Kotlin 中使用属性的多种方式。
* [条件与循环](control-flow.md) – 了解条件和循环在 Kotlin 中如何工作。
* [Kotlin/JavaScript](js-overview.md) – 探索 Kotlin/JS 的用例。
* [针对 Web](gradle-configure-project.md#targeting-the-web) – 了解 Gradle 为 Web 开发提供的不同目标。
* [Kotlin 守护进程](kotlin-daemon.md) – 了解 Kotlin 守护进程以及它如何与构建系统和 Kotlin 编译器协作。
* [协程概述页面](coroutines-overview.md) – 了解协程概念并开始您的学习之旅。
* [Kotlin/Native 二进制选项](native-binary-options.md) – 了解 Kotlin/Native 的二进制选项以及如何配置它们。
* [调试 Kotlin/Native](native-debugging.md) – 探索使用 Kotlin/Native 进行调试的不同方式。
* [自定义 LLVM 后端的提示](native-llvm-passes.md) – 了解 Kotlin/Native 如何使用 LLVM 并调整优化路径。
* [Exposed 的 DAO API 入门](https://www.jetbrains.com/help/exposed/get-started-with-exposed-dao.html) – 了解如何使用 Exposed 的数据访问对象 (DAO) API 在关系数据库中存储和检索数据。
* Exposed 文档中有关 R2DBC 的新页面：
  * [使用数据库](https://www.jetbrains.com/help/exposed/working-with-database.html)
  * [使用 ConnectionFactory](https://www.jetbrains.com/help/exposed/working-with-connectionfactory.html)
  * [自定义类型映射](https://www.jetbrains.com/help/exposed/custom-type-mapping.html)
* [HTMX 集成](https://ktor.io/docs/htmx-integration.html) – 了解 Ktor 如何为 HTMX 提供实验性的、一流的支持。

## 如何更新到 Kotlin 2.2.20

Kotlin 插件作为捆绑插件在 IntelliJ IDEA 和 Android Studio 中分发。

要更新到新的 Kotlin 版本，请在您的构建脚本中 [将 Kotlin 版本更改](releases.md#update-to-a-new-kotlin-version) 为 2.2.20。