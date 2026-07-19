[//]: # (title: Kotlin 2.4.0 最新变化)

<show-structure depth="1"/>

<web-summary>阅读 Kotlin 2.4.0 版本说明，了解新的语言功能、Kotlin Multiplatform、JVM、Native、JS 和 Wasm 的更新，以及 Gradle 和 Maven 的构建工具支持。</web-summary>

<tldr>
    <p> 有关错误修复版本 2.4.10 的详细信息，请参阅 <a href="https://github.com/JetBrains/kotlin/releases/tag/v2.4.10">更改列表</a></p>
</tldr>

Kotlin 2.4.0 正式发布！以下是主要亮点：

* **语言：** [上下文参数已稳定、显式支持字段，以及针对注解使用处目标的多个功能](#stable-features)
* **标准库：** [稳定了对 UUID API 的支持](#stable-uuid-api-in-the-common-kotlin-standard-library) 以及 [支持检查排序顺序](#support-for-checking-sorted-order)
* **Kotlin/JVM：** [支持 Java 26](#support-for-java-26) 并且 [默认启用元数据中的注解](#annotations-in-metadata-enabled-by-default)
* **Kotlin/Native：** [支持将 Swift 软件包作为依赖项、Swift 导出更新，以及默认启用 CMS GC](#kotlin-native)
* **Kotlin/Wasm：** [默认启用增量编译并支持 WebAssembly 组件模型](#kotlin-wasm)
* **Kotlin/JS**：[支持值类导出以及在 JS 代码内联中使用 ES2015 功能](#kotlin-js)
* **Gradle：** [兼容 Gradle 9.5.0](#gradle)
* **Maven：** [Java 和 JVM 目标版本之间的自动对齐](#maven)
* **Kotlin 编译器：** [在 `.klib` 编译期间更加一致的内联函数行为](#consistent-intra-module-function-inlining-during-klib-compilation)

> 有关 Kotlin 发布周期的信息，请参阅 [Kotlin 发布过程](releases.md)。
>
{style="tip"}

## 更新至 Kotlin 2.4.0

最新版本的 Kotlin 已包含在最新版本的 [IntelliJ IDEA](https://www.jetbrains.com/idea/download/) 和 [Android Studio](https://developer.android.com/studio) 中。

要更新到新的 Kotlin 版本，请确保您的 IDE 已更新到最新版本，并在构建脚本中将 [Kotlin 版本更改](releases.md#update-to-a-new-kotlin-version) 为 2.4.0。

## 新功能 {id=new-stable-features}
<primary-label ref="stable"/>

在之前的 Kotlin 版本中，有几项新功能作为 Experimental（实验性）引入。以下功能现在在 Kotlin 2.4.0 中已晋升为 [Stable](components-stability.md#stability-levels-explained)（稳定版），因此您不再需要选择加入（opt-in）即可使用它们：

* [上下文参数](context-parameters.md)，除了 [上下文实参](#explicit-context-arguments-for-context-parameters) 和 [可调用引用](https://github.com/Kotlin/KEEP/blob/context-parameters/proposals/context-parameters.md#callable-references)
* [属性的 `@all` 元目标](annotations.md#all-meta-target)
* [未指定使用处目标时注解的新默认规则](annotations.md#defaults-when-no-use-site-targets-are-specified)
* [显式支持字段](properties.md#explicit-backing-fields)
* [公共 Kotlin 标准库中稳定的 UUID API](#stable-uuid-api-in-the-common-kotlin-standard-library)
* [在 JVM 上将无符号整数转换为 `BigInteger` 的新 API](#new-api-for-converting-unsigned-integers-to-biginteger-on-the-jvm)
* [支持检查排序顺序](#support-for-checking-sorted-order)
* [支持将值类导出到 JavaScript/TypeScript](#support-for-value-class-export-to-javascript-typescript)
* [内联 JS 代码时支持 ES2015 功能](#support-for-es2015-features-when-inlining-js-code)
* [Maven：Java 和 JVM 目标版本之间的自动对齐](#automatic-alignment-between-java-and-jvm-target-versions)
* [支持 Maven Toolchains](#support-for-maven-toolchains)

## 新功能 {id=new-experimental-features}
<primary-label ref="experimental-exp"/>

* [上下文参数的显式上下文实参](#explicit-context-arguments-for-context-parameters)
* [支持集合字面量](#support-for-collection-literals)
* [改进的编译时常量](#improved-compile-time-constants)
* [改进的高阶函数未使用结果检查](#improved-unused-result-checks-for-higher-order-functions) 
* [新的 `@IntroducedAt` 注解，用于为可选形参生成基于版本的重载](#new-introducedat-annotation-to-generate-version-based-overloads-for-optional-parameters)
* [新的 Map 回退函数，用于区分 `null` 值和缺失的键](#new-map-fallback-functions-to-distinguish-null-values-and-missing-keys)
* [Swift 软件包导入](#swift-package-import)
* [Swift 导出进入 Alpha 阶段，并改进了并发支持](#swift-export-goes-alpha-with-improved-concurrency-support)
* [支持 WebAssembly 组件模型](#support-for-the-webassembly-component-model)

## 语言

Kotlin 2.4.0 将上下文参数、显式支持字段和注解使用处目标功能提升为 [Stable](components-stability.md#stability-levels-explained)。此版本还引入了 [针对上下文参数的显式上下文实参](#explicit-context-arguments-for-context-parameters)。

### 稳定功能
<secondary-label ref="language"/>

Kotlin 2.2.0 和 2.3.0 引入了一些作为 [Experimental](components-stability.md#stability-levels-explained) 的语言功能。我们很高兴地宣布，以下语言功能在此版本中已达到 [Stable](components-stability.md#stability-levels-explained)：

* [上下文参数](whatsnew22.md#preview-of-context-parameters)，除了 [上下文实参](#explicit-context-arguments-for-context-parameters) 和 [可调用引用](https://github.com/Kotlin/KEEP/blob/context-parameters/proposals/context-parameters.md#callable-references)
* [属性的 `@all` 元目标](annotations.md#all-meta-target)
* [未指定使用处目标时注解的新默认规则](annotations.md#defaults-when-no-use-site-targets-are-specified)
* [显式支持字段](properties.md#explicit-backing-fields)

[查看 Kotlin 语言设计功能和提案的完整列表](kotlin-language-features-and-proposals.md)。

### 导入语句的最后一段不再出现弃用警告
<secondary-label ref="language"/>

在以前的 Kotlin 版本中，当导入一个已弃用的类时，弃用错误会同时在调用处和导入指令本身报错。由于无法在导入时抑制弃用错误，您可能不得不通过抑制整个文件的弃用报告或使用星号导入来解决此问题。

由于在导入被调用符号时报告弃用在大多数情况下并无用处，Kotlin 2.4.0 在导入指令的最后一段引用已弃用符号时不再发出警告。

欲了解更多信息，请参阅 [KT-30155](https://youtrack.jetbrains.com/issue/KT-30155)。

### 上下文参数的显式上下文实参
<primary-label ref="experimental-opt-in"/>

<secondary-label ref="language"/>

> 在 IntelliJ IDEA 中使用上下文参数的显式上下文实参的功能将在 2026.2 版本中提供。
> 
{style="note"}

Kotlin 2.4.0 为 [上下文参数](context-parameters.md) 引入了显式上下文实参。

Kotlin 2.3.20 [更改了上下文参数的重载解析方式](whatsnew2320.md#changes-to-overload-resolution-for-context-parameters)。因此，仅因上下文参数而不同的重载调用可能会变得模棱两可。

您现在可以通过在调用处传递显式上下文实参来解决这种歧义。

示例如下：

```kotlin
class EmailSender
class SmsSender

context(emailSender: EmailSender)
fun sendNotification() {
    println("Sent email notification")
}

context(smsSender: SmsSender)
fun sendNotification() {
    println("Sent SMS notification")
}

context(defaultEmailSender: EmailSender, defaultSmsSender: SmsSender)
fun notifyUser() {
    
    // 选择带有 EmailSender 上下文参数的重载
    sendNotification(emailSender = defaultEmailSender)

    // 选择带有 SmsSender 上下文参数的重载
    sendNotification(smsSender = defaultSmsSender)
}
```

您还可以使用显式上下文实参来代替 `context()` 函数，以减少嵌套并使某些调用更易读。如果您需要在多个调用中使用相同的上下文实参，请改用 `context()` 函数。

此功能为 [Experimental](components-stability.md#stability-levels-explained)。要启用它，请在您的构建文件中添加以下编译器选项：

<tabs group="build-system">
<tab title="Gradle" group-key="gradle">

```kotlin
kotlin {
    compilerOptions {
        freeCompilerArgs.add("-Xexplicit-context-arguments")
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
                    <arg>-Xexplicit-context-arguments</arg>
                </args>
            </configuration>
        </plugin>
    </plugins>
</build>
```

</tab>
</tabs>

欲了解更多信息，请参阅该功能的 [KEEP](https://github.com/Kotlin/KEEP/blob/main/proposals/KEEP-0448-explicit-context-arguments.md)。

### 支持集合字面量
<primary-label ref="experimental-opt-in"/>

<secondary-label ref="language"/>

Kotlin 2.4.0 引入了对集合字面量的实验性支持。您现在可以使用方括号 `[]` 以更简单、更简洁的方式创建集合。

例如：

```kotlin
fun main() {
    // 带有显式类型声明的可变列表
    // val shapes: MutableList<String> = mutableListOf("triangle", "square", "circle")

    // 使用方括号语法的可变列表
    val shapes: MutableList<String> = ["triangle", "square", "circle"]
    println(shapes)
    // [triangle, square, circle]
}
```
{validate="false"}

> 目前，集合字面量不能用于构建在 Java 中定义的集合。欲了解更多信息，请参阅 [KT-80494](https://youtrack.jetbrains.com/issue/KT-80494)。
>
{style="note"}

如果编译器没有足够的信息来推断集合类型，它将默认使用 `List` 类型：

```kotlin
fun main() {
    val fruit = ["apple", "banana", "cherry"]
    
    println(fruit)
    // [apple, banana, cherry]
}
```
{validate="false"}

您还可以声明自定义的 `operator fun of` 函数，以便对您自己的类型使用方括号语法。例如，如果您有以下 `DoubleMatrix` 类：

```kotlin
class DoubleMatrix(vararg val rows: Row) {
    companion object {
        operator fun of(vararg rows: Row) = DoubleMatrix(*rows)
    }
    class Row(vararg val elements: Double) {
        companion object {
            operator fun of(vararg elements: Double) = Row(*elements)
        }
    }
}
```
{validate="false"}

您可以像这样创建一个 `identityMatrix` 类实例：

```kotlin
fun main() {
    val identityMatrix: DoubleMatrix = [
        [1.0, 0.0, 0.0],
        [0.0, 1.0, 0.0],
        [0.0, 0.0, 1.0],
    ]
}
```
{validate="false"}

在此示例中，编译器将嵌套的集合字面量转换为对相应 `operator fun of` 函数的调用。编译器递归地解析这些调用，并使用预期类型来选择正确的重载。

此功能为 [Experimental](components-stability.md#stability-levels-explained)。要启用它，请在您的构建文件中添加以下编译器选项：

<tabs group="build-system">
<tab title="Gradle" group-key="gradle">

```kotlin
kotlin {
    compilerOptions {
        freeCompilerArgs.add("-Xcollection-literals")
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
                    <arg>-Xcollection-literals</arg>
                </args>
            </configuration>
        </plugin>
    </plugins>
</build>
```

</tab>
</tabs>

欲了解更多信息，请参阅该功能的 [KEEP](https://github.com/Kotlin/KEEP/blob/main/proposals/KEEP-0416-collection-literals.md)。

### 改进的编译时常量
<primary-label ref="experimental-opt-in"/>

<secondary-label ref="language"/>

Kotlin 2.4.0 对 [编译时常量](properties.md#compile-time-constants) 带来了实验性改进，使对数字和字符串类型的支持更加一致且易于使用。这些改进包括支持：

* 无符号类型操作。
* 字符串的标准库函数，如 `.lowercase()`、`.uppercase()` 和 `.trim()` 函数。
* 对 [枚举常量](enum-classes.md#working-with-enum-constants) 的 `.name` 属性和 [`KCallable` 接口](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.reflect/-k-callable/) 进行求值。

为了明确哪些函数在编译时求值，Kotlin 2.4.0 引入了 `IntrinsicConstEvaluation` 注解。某些函数已在编译时求值，但尚未添加该注解。后续版本将为剩余函数添加该注解。有关受支持函数的列表，请参阅 KEEP 的 [附录](https://github.com/Kotlin/KEEP/blob/main/proposals/KEEP-0444-improve-compile-time-constants.md#appendix)。

此功能为 [Experimental](components-stability.md#stability-levels-explained)。要启用它，请在您的构建文件中添加以下编译器选项：

<tabs group="build-system">
<tab title="Gradle" group-key="gradle">

```kotlin
kotlin {
    compilerOptions {
        freeCompilerArgs.add("-Xintrinsic-const-evaluation")
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
                    <arg>-Xintrinsic-const-evaluation</arg>
                </args>
            </configuration>
        </plugin>
    </plugins>
</build>
```

</tab>
</tabs>

欲了解更多信息，请参阅该功能的 [KEEP](https://github.com/Kotlin/KEEP/blob/main/proposals/KEEP-0444-improve-compile-time-constants.md)。

### 改进的高阶函数未使用结果检查
<primary-label ref="experimental-opt-in"/>

<secondary-label ref="language"/>

Kotlin 2.4.0 引入了一个新的实验性 `returnsResultOf()` 契约，以改进 [未使用返回值检查器](unused-return-value-checker.md)。

此契约使检查器能够区分可以忽略的未使用结果，以及来自返回 lambda 结果的高阶函数（如 `let` 作用域函数）的有意义未使用结果。

> Kotlin 契约是 [Experimental](components-stability.md#stability-levels-explained)。要启用此功能，请在声明带有契约的函数时添加 `@OptIn(ExperimentalContracts::class)` 注解。
>
{style="warning"}

要使用此功能，请将 `returnsResultOf()` 添加到函数的契约中：

```kotlin
import kotlin.contracts.ExperimentalContracts
import kotlin.contracts.contract

@OptIn(ExperimentalContracts::class)
inline fun <T, R> T.customLet(block: (T) -> R): R {
    contract {
        returnsResultOf(block)
    }
    return block(this)
}
```

以下是一个对可空值使用自定义 `.customLet()` 函数的示例：

```kotlin
fun handleNullablePackageName(packageName: String?, builder: StringBuilder) {
    // 检查器不会报告警告
    // 因为 append() 函数的返回值可以被忽略
    packageName?.customLet { builder.append(it) }

    // 检查器会报告警告，因为返回的字符串未被使用
    packageName?.customLet { "kotlin.$it" }
}
```

未使用返回值检查器是 [Experimental](components-stability.md#stability-levels-explained)，且必须启用才能报告未使用的返回值。
有关启用和配置检查器的更多信息，请参阅 [未使用返回值检查器](unused-return-value-checker.md#configure-the-unused-return-value-checker)。

#### 如何启用 {id=how-to-enable-unused-return-value-checker}

`returnsResultOf()` 契约是 [Experimental](components-stability.md#stability-levels-explained)。请注意，使用它会产生预发布二进制文件，早期版本的 Kotlin 编译器无法读取。要启用它，请在您的构建文件中添加以下编译器选项：

<tabs group="build-system">
<tab title="Gradle" group-key="gradle">

```kotlin
// build.gradle(.kts)
kotlin {
    compilerOptions {
        freeCompilerArgs.add("-Xallow-returns-result-of")
    }
}
```

</tab> <tab title="Maven" group-key="maven">

```xml
<!-- pom.xml -->
<build>
    <plugins>
        <plugin>
            <groupId>org.jetbrains.kotlin</groupId>
            <artifactId>kotlin-maven-plugin</artifactId>
            <configuration>
                <args>
                    <arg>-Xallow-returns-result-of</arg>
                </args>
            </configuration>
        </plugin>
    </plugins>
</build>
```
</tab> 
</tabs>

### 新的 `@IntroducedAt` 注解，用于为可选形参生成基于版本的重载
<primary-label ref="experimental-opt-in"/>

<secondary-label ref="language"/>

Kotlin 2.4.0 引入了 `@IntroducedAt` 注解，用于在向已发布的 API 添加新的可选参数时保持二进制兼容性。

以前，向函数添加可选参数通常需要使用 `@JvmOverloads`，这可能会生成超出需要的重载。或者，为了保持二进制兼容性，您必须将旧签名保留为隐藏的已弃用重载。

使用 `@IntroducedAt` 注解，您可以用新添加的可选参数引入的版本对其进行标记。编译器使用此信息自动生成相应的隐藏重载。

此注解是 [Experimental](components-stability.md#stability-levels-explained)。要启用它，请使用 `@OptIn(ExperimentalVersionOverloading::class)` 注解。

示例如下：

```kotlin
@OptIn(ExperimentalVersionOverloading::class)
fun Button(
    label: String = "",
    color: Color = DefaultColor,
    @IntroducedAt("1.1") borderColor: Color = DefaultBorderColor,
    @IntroducedAt("1.2") borderStyle: Style = DefaultBorderStyle,
    @IntroducedAt("1.2") borderWidth: Int = 1,
    onClick: () -> Unit
) {
    // 函数体
}
```

在此示例中，编译器为旧版本的 `Button()` 函数生成了隐藏重载。

由于 `@IntroducedAt` 和 `@JvmOverloads` 都会生成重载，同时使用它们可能会导致重载冲突。如果您同时使用这两个注解，编译器会报告警告。如果您抑制该警告，编译器会优先考虑从 `@IntroducedAt` 注解生成的重载。

## 标准库

Kotlin 2.4.0 稳定了公共 Kotlin 标准库中对 UUID 的支持。它还添加了用于在 JVM 上将无符号整数转换为 `BigInteger` 的新扩展函数，以及对检查排序顺序的支持。

### 公共 Kotlin 标准库中稳定的 UUID API
<secondary-label ref="standard-library"/>

Kotlin 2.0.20 引入了一个 [用于生成 UUID 的类](whatsnew2020.md#support-for-uuids-in-the-common-kotlin-standard-library)（通用唯一标识符），并添加了对 Kotlin 和 Java UUID 之间转换的支持。随后的版本通过添加对以下内容的支持，逐渐改进了这一实验性功能：

* [使用 `<` 和 `>` 运算符比较 UUID](whatsnew2120.md#changes-in-uuid-parsing-formatting-and-comparability)
* [从十六进制加连字符格式和纯文本格式解析 UUID](uuids.md#parse-uuids)
* [在解析无效 UUID 时返回 `null`](whatsnew23.md#support-for-returning-null-when-parsing-invalid-uuids)。

在 Kotlin 2.4.0 中，[`kotlin.uuid.Uuid` API](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.uuid/-uuid/) 变为 [Stable](components-stability.md#stability-levels-explained)。唯一的例外是 [用于生成 V4 和 V7 UUID 的函数](whatsnew23.md#support-for-generating-v7-uuids-for-specific-timestamps)，它们仍保持 [Experimental](components-stability.md#stability-levels-explained) 状态，仍需手动启用。

有关如何使用 UUID 的更多信息，请参阅 [UUID](uuids.md)。

### 支持检查排序顺序
<secondary-label ref="standard-library"/>

Kotlin 2.4.0 为可迭代对象、数组和序列添加了新的扩展函数，用于检查排序顺序。

这包括以下扩展函数：

* `.isSorted()`
* `.isSortedDescending()`
* `.isSortedWith(comparator)`
* `.isSortedBy(selector)`
* `.isSortedByDescending(selector)`

您可以使用这些扩展函数来检查元素是否已经排序，而无需再次排序或创建自己的辅助函数。如果元素按指定顺序排列，或者元素少于两个，它们将返回 `true`，否则返回 `false`。这些函数在遇到无序对时会立即停止，这使得它们对大型输入非常高效。

以下是使用 `.isSorted()` 和 `.isSortedBy()` 函数检查排序顺序的示例：

```kotlin
data class User(val name: String, val age: Int)

fun main() {
    val numbers = listOf(1, 2, 3, 4)
    println(numbers.isSorted())
    // true

    val users = listOf(
        User("Alice", 24),
        User("Bob", 31),
        User("Charlie", 29),
    )
    println(users.isSortedBy(User::age))
    // false
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="2.4.0-Beta2" id="kotlin-2-4-0-check-sorted-order"}

### 在 JVM 上将无符号整数转换为 `BigInteger` 的新 API
<secondary-label ref="standard-library"/>

Kotlin 2.4.0 在 JVM 上引入了 `UInt.toBigInteger()` 和 `ULong.toBigInteger()` 扩展函数。

以前，将 `UInt` 和 `ULong` 值转换为 `BigInteger` 需要使用基于字符串的变通方法或自定义转换逻辑。从 Kotlin 2.4.0 开始，您现在可以直接使用 `.toBigInteger()` 将无符号整数值转换为 `BigInteger`。

示例如下：

```kotlin
fun main() {
    //sampleStart
    val unsignedLong = Long.MAX_VALUE.toULong() + 1uL
    val unsignedInt = UInt.MAX_VALUE

    println(unsignedLong.toBigInteger())
    // 9223372036854775808

    println(unsignedInt.toBigInteger())
    // 4294967295
   //sampleEnd
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="2.4.0-Beta2" id="kotlin-2-4-0-convert-unsigned-int"}

### 新的 Map 回退函数，用于区分 `null` 值和缺失的键
<primary-label ref="experimental-opt-in"/>

<secondary-label ref="standard-library"/>

Kotlin 2.4.0 为具有可空值的 Map 添加了现有 [`.getOrElse()`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.collections/get-or-else.html) 和 [`.getOrPut()`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.collections/get-or-put.html) [Map 扩展函数](map-operations.md) 的新变体。这些函数检索键的值或使用默认值作为回退。对于具有可空值的 Map，新变体允许您选择存储的 `null` 值表现得像缺失的键还是现有的值，并在其函数名称中明确该选择。

新的扩展函数包括：

* `.getOrElseIfNull(key, defaultValue)` 和 `.getOrPutIfNull(key, defaultValue)`：如果键缺失或值为 `null`，则返回默认值，类似于现有的 `.getOrElse()` 和 `.getOrPut()` 函数。
* `.getOrElseIfMissing(key, defaultValue)` 和 `.getOrPutIfMissing(key, defaultValue)`：仅当 Map 不包含指定键时才返回默认值。

这些 API 为 [Experimental](components-stability.md#stability-levels-explained)，且需要使用 `@OptIn(ExperimentalStdlibApi::class)` 注解进行启用。

以下示例演示了当键存在且值为 `null` 时，`.getOrPutIfNull()` 和 `.getOrPutIfMissing()` 之间的区别：

```kotlin
@OptIn(ExperimentalStdlibApi::class)
fun main() {
    val mapForNull = mutableMapOf<String, String?>("user" to null)
    val mapForMissing = mutableMapOf<String, String?>("user" to null)

    // 如果 "user" 的值为 null，则替换该值
    mapForNull.getOrPutIfNull("user") { "default_user" }

    println(mapForNull)
    // {user=default_user}

    // 保留 null 值，因为 Map 中存在 "user" 键
    mapForMissing.getOrPutIfMissing("user") { "default_user" }

    println(mapForMissing)
    // {user=null}
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="2.4.0" id="kotlin-2-4-0-getorput-diff"}

您还可以将 `.getOrElseIfMissing()` 和 `.getOrPutIfMissing()` 函数用于存储可空值的缓存。如果 `defaultValue` 返回 `null`，Map 会存储它，并且不会再次为相同的键调用 `defaultValue`。

示例如下：

```kotlin
data class Response(val body: String)

class Service {
    var queryCount = 0

    fun query(key: String): Response? {
        queryCount += 1
        return null
    }
}

//sampleStart
@OptIn(ExperimentalStdlibApi::class)
fun main() {
    val service = Service()
    val cache = mutableMapOf<String, Response?>()

    fun getCachedResponseOrQuery(key: String): Response? =
        cache.getOrPutIfMissing(key) { service.query(key) }

    // 由于缓存不包含 "user"，因此存储 null
    getCachedResponseOrQuery("user")

    println(cache)
    // {user=null}

    // 使用缓存的 null，不再查询服务
    getCachedResponseOrQuery("user")

    println(service.queryCount)
    // 1
}
//sampleEnd
```
{kotlin-runnable="true" kotlin-min-compiler-version="2.4.0" id="kotlin-2-4-0-getorif-missing"}

我们欢迎您在 [YouTrack](https://youtrack.jetbrains.com/issue/KT-67337) 中提供反馈。

## Kotlin/JVM

Kotlin 2.4.0 支持新的 Java 版本，并默认在元数据中启用注解。

### 支持 Java 26
<secondary-label ref="jvm"/>

从 Kotlin 2.4.0 开始，编译器可以生成包含 Java 26 字节码的类。

### 元数据中的注解默认启用
<secondary-label ref="jvm"/>

Kotlin 2.2.0 中的 Kotlin Metadata JVM 库 [引入了对读取存储在 Kotlin 元数据中的注解的支持](whatsnew22.md#support-for-reading-and-writing-annotations-in-kotlin-metadata)。通过此支持，Kotlin 编译器将注解与 JVM 字节码一起写入元数据，使其可供 Kotlin Metadata JVM 库访问。因此，注解处理器和其他工具可以在元数据级别理解和操作这些注解，而无需使用反射或修改源代码。

在 Kotlin 2.4.0 中，此支持默认启用。

## Kotlin/Native

从 Kotlin 2.4.0 开始，[Swift 导出晋升为 Alpha 阶段](#swift-export-goes-alpha-with-improved-concurrency-support)。此版本还带来了对 [Swift 软件包导入](#swift-package-import) 的支持、Xcode 26.4 支持，以及对内存消耗和垃圾回收的改进。

### 垃圾回收器默认启用并发标记
<secondary-label ref="native"/>

在 Kotlin 2.0.20 中，Kotlin 团队 [引入了实验性支持](whatsnew2020.md#concurrent-marking-in-garbage-collector) 用于并发标记清除垃圾回收器 (CMS GC)。在处理了用户反馈并修复了回归问题后，我们现在准备从 Kotlin 2.4.0 开始默认启用 CMS。

垃圾回收器中之前的默认并行标记并发清除 (PMCS) 设置在 GC 标记堆中的对象时必须暂停应用程序线程。相比之下，CMS 允许标记阶段与应用程序线程并发运行。

这显著改善了 GC 暂停时间和应用响应速度，这对于延迟敏感型应用程序的性能至关重要。CMS 在使用 [Compose Multiplatform 构建的 UI 应用程序基准测试](https://blog.jetbrains.com/kotlin/2024/10/compose-multiplatform-1-7-0-released/#performance-improvements-on-ios)中已经证明了其有效性。

如果您遇到问题，可以切换回 PMCS。为此，请在您的 `gradle.properties` 文件中设置以下 [二进制选项](native-binary-options.md)：

```none
kotlin.native.binary.gc=pmcs
```

有关 Kotlin/Native 垃圾回收器的更多信息，请参阅我们的 [文档](native-memory-manager.md#garbage-collector)。

### 减少去虚拟化分析期间的内存消耗
<secondary-label ref="native"/>

以前，去虚拟化分析是 Kotlin/Native 编译器中内存消耗最高的阶段之一。具体来说，链接发布任务消耗了过多的内存，尤其是在大型项目中。

Kotlin 2.4.0 引入了多项改进，有助于减少链接发布任务期间的峰值内存消耗。

根据我们的一位 EAP 用户的基准测试，改进后的去虚拟化分析将链接发布任务的内存消耗降低了一半，节省了至少 13 GB 内存。

### 支持 Xcode 26.4
<secondary-label ref="native"/>

从 Kotlin 2.4.0 开始，Kotlin/Native 编译器支持 Xcode 26.4 —— Xcode 的最新稳定版本之一。

您现在可以更新您的 Xcode 并访问最新的 API，以继续在针对 Apple 操作系统的 Kotlin 项目上工作。

### LLVM 更新至版本 21
<secondary-label ref="native"/>

在 Kotlin 2.4.0 中，我们将 LLVM 从版本 19 更新到 21。新版本包括性能改进，并有助于使 Kotlin/Native 编译器保持最新状态。

此更新不应影响您的代码，但如果您遇到任何问题，请报告至我们的 [问题跟踪器](http://kotl.in/issue)。

### Apple 目标支持的更改
<secondary-label ref="native"/>

Kotlin 2.4.0 提高了 Apple 目标的默认最低支持版本：

* iOS 和 tvOS 从 14.0 提升至 15.0。
* macOS 从 11.0 提升至 12.0。
* watchOS 从 7.0 提升至 8.0。

如果您的项目需要支持比默认版本更低的版本，请在您的构建文件中使用 `freeCompilerArgs` 选项：

```kotlin
kotlin {
    targets.withType<org.jetbrains.kotlin.gradle.plugin.mpp.KotlinNativeTarget>().configureEach {
        binaries.configureEach {
            freeCompilerArgs += "-Xoverride-konan-properties=minVersion.ios=14.0"
            freeCompilerArgs += "-Xoverride-konan-properties=minVersion.macos=11.0"
            freeCompilerArgs += "-Xoverride-konan-properties=minVersion.tvos=14.0"
            freeCompilerArgs += "-Xoverride-konan-properties=minVersion.watchos=7.0"
        }
    }
}
```

### Swift 导出进入 Alpha 阶段，并改进了并发支持
<primary-label ref="alpha"/>

<secondary-label ref="native"/>

从 Kotlin 2.4.0 开始，Kotlin 通过 Swift 导出与 Swift 的互操作性正式进入 Alpha 阶段！此版本对并发支持进行了重大改进，为 Swift 导出添加了原生且直接的结构化并发，并能够将 `kotlinx.coroutines` flow 导出到 Swift。

#### 支持结构化并发
您现在可以从 Swift 无缝调用 Kotlin 挂起代码。Kotlin [`suspend` 函数](composing-suspending-functions.md) 和挂起函数类型被导出为 Swift 惯用的 `async` 对应版本：

```kotlin
// Kotlin
suspend fun hello(): String {
    delay(1000)
    return "Hello Swift! This is Kotlin."
}
```

```swift
// Swift
let msg = try await hello()
```
#### 将 flow 类型导出到 Swift

此更新还增加了对将 `kotlinx.coroutines` flow 导出到 Swift 的支持。`kotlinx.coroutines` 中的 flow 代表可以并发发送和消费的异步数据流。它们通常用于响应式编程模式，例如侦听数据库更新、网络请求或 UI 事件。

以前，从 [`kotlinx.coroutines.flow`](https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines.flow/-flow/) 向 Swift 公开 `Flow` 接口的唯一方法是通过第三方解决方案。现在，您可以将 flow 开箱即用地导出到 Swift 的惯用对应版本：[`AsyncSequence`](https://developer.apple.com/documentation/Swift/AsyncSequence)。

此功能默认启用。您可以向 Swift 导出任何带有 `Flow` 类型的公共 API，同时保留类型信息。示例如下：

```kotlin
// Kotlin
// 导出 Flow 时保留 String 类型
fun flowOfStrings(): Flow<String> = flowOf("hello", "any", "world")
```

```Swift
// Swift
var actual: [String] = []

// 从 Kotlin 正确推断出 String 类型
for try await element in flowOfStrings().asAsyncSequence() {
    actual.append(element)
}
```

有关 Swift 导出的更多信息，请参阅我们的 [文档](native-swift-export.md)。

### Swift 软件包导入
<primary-label ref="experimental-general"/>

<secondary-label ref="native"/>

Kotlin Multiplatform 项目现在可以在其 Gradle 配置中为 iOS 应用声明 [Swift 软件包](https://docs.swift.org/swiftpm/documentation/packagemanagerdocs/) 作为依赖项：

```kotlin
// build.gradle.kts
kotlin {
    swiftPMDependencies {
        swiftPackage(
            url = url("https://github.com/firebase/firebase-ios-sdk.git"),
            version = from("12.11.0"),
            products = listOf(
                product("FirebaseAI"),
                product("FirebaseAnalytics"),
                ...
}
```
{validate="false"}

有关工作示例和更详细的信息，请参阅 [SwiftPM 导入](https://kotlinlang.org/docs/multiplatform/multiplatform-spm-import.html)。

如果您的项目依赖 CocoaPods 依赖项，您可以将当前设置迁移为使用 Swift 软件包。KMP 工具考虑到了这一用例，并帮助您自动重新配置项目。有关详细信息，请参阅我们的 [CocoaPods 迁移指南](https://kotlinlang.org/docs/multiplatform/multiplatform-cocoapods-spm-migration.html)。

## Kotlin/Wasm

Kotlin 2.4.0 默认启用 Kotlin/Wasm 的增量编译，并引入了对 WebAssembly 组件模型的支持。

### 默认启用增量编译
<secondary-label ref="wasm"/>

Kotlin/Wasm 在 Kotlin 2.1.0 中引入了增量编译。从 Kotlin 2.4.0 开始，它已达到 [Stable](components-stability.md#stability-levels-explained) 状态并默认启用。通过此功能，编译器仅重新构建受最近更改影响的文件，从而显著缩短构建时间。

要禁用增量编译，请在项目的 `local.properties` 或 `gradle.properties` 文件中添加以下行：

```none
# gradle.properties
kotlin.incremental.wasm=false
```

如果您遇到任何问题，请在 [YouTrack](https://kotl.in/issue) 中报告。

### 改进 Chrome DevTools 中内部变量的显示
<secondary-label ref="wasm"/>

Kotlin 2.4.0 通过使临时变量、合成变量和内部变量更容易与用户定义的变量区分开来，改进了 Chrome DevTools 中 Kotlin/Wasm 的调试体验。

Kotlin 编译器和编译器插件（如 Compose）可以生成这些变量。它们现在默认使用 `~` 前缀，因此它们会被组合在一起并移至变量列表的末尾（Chrome DevTools 按名称对列表进行排序）。

### 支持 WebAssembly 组件模型
<primary-label ref="experimental-general"/>

<secondary-label ref="wasm"/>

Kotlin/Wasm 在 Kotlin 2.4.0 中更进一步，引入了对 [WebAssembly 组件模型](https://component-model.bytecodealliance.org/) 的实验性支持。该提案定义了一种通过标准化接口和类型从 Wasm 模块构建组件的方法。这种方法有助于 Wasm 从低级二进制指令格式演变为一个用于组合可重用、与语言无关的组件的系统。它使 Kotlin/Wasm 能够超越浏览器。例如，Kotlin 和 WebAssembly 非常适合函数即服务（Function-as-a-Service，也称为 FaaS 或无服务器）应用。

要尝试此功能，请查看 [一个使用 `wasi:http` 构建的简单服务器](https://github.com/Kotlin/sample-wasi-http-kotlin/)。

<img src="kotlin-wasm-wasi-http.gif" alt="Kotlin/Wasm 配合 WebAssembly 组件模型" width="600"/>

在 [YouTrack](https://youtrack.jetbrains.com/issue/KT-64569/Kotlin-Wasm-Support-Component-Model) 中分享您的反馈。

## Kotlin/JS

Kotlin 2.4.0 进一步改进了向 JavaScript/TypeScript 的导出，包括支持导出值类、接口和类型差异（variance），以及内联 JS 代码时的 ES2015 功能。

### 支持将值类导出到 JavaScript/TypeScript
<secondary-label ref="js"/>

以前，只有常规 Kotlin 类可以导出到 JavaScript/TypeScript。Kotlin 2.4.0 取消了这一限制。您现在可以将 Kotlin 的 [内联值类](inline-classes.md) 导出为常规 TypeScript 类。

要导出值类，请在 Kotlin 侧使用 `@JsExport` 注解标记它：

```Kotlin
// Kotlin
@JsExport
@JvmInline
value class Email(val address: String) {
    init { require(address.contains("@")) { "Invalid email" } }
}

@JsExport
class AuthService {
    suspend fun login(email: Email): String = ...
}
```

在 TypeScript 侧，它看起来像一个常规类：

```TypeScript
// TypeScript
import { AuthService, Email } from "..."
const auth = new AuthService();

console.log(await auth.login(new Email("jane@example.com"))); 
// "Welcome, jane@example.com!"
console.log(await auth.login(new Email("not-an-email"))); 
// "Invalid email"
```

有关更多信息，请参阅 [`@JsExport` 注解](js-to-kotlin-interop.md#jsexport-annotation)。

### 内联 JS 代码时支持 ES2015 功能
<secondary-label ref="js"/>

从 Kotlin 2.4.0 开始，JavaScript 代码内联全面支持 [ES2015 功能](js-project-setup.md#support-for-es2015-features)。

这对于与第三方库的互操作性以及直接控制自动生成应用代码非常有用。

现在，您可以在 [`js()`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.js/js.html) 调用中使用现代 JS 功能，包括：

* `const` 和 `let` 变量声明
* ES 类
* 生成器（Generators）
* Lambda（[箭头函数](whatsnew21.md#support-for-generating-es2015-arrow-functions)）
* 展开（Spread）和剩余（Rest）运算符
* 模板字符串

请记住，`js()` 函数的参数应该是一个字符串常量，因为它是在编译时解析并按原样转换为 JavaScript 代码的。例如，要内联展开运算符，请使用：

```kotlin
fun spreadExample(): dynamic = js("""
    const add = (a, b, c) => a + b + c;

    const nums = [1, 2, 3];
    const sum = add(...nums);

    const a = [1, 2, 3];
    const b = [...a, 4, 5, 6];

    return { sum, b: b };
""")
```

有关内联 JavaScript 代码的更多信息，请参阅 [我们的文档](js-interop.md#inline-javascript)。

### 导出到 TypeScript 时保留类型差异
<secondary-label ref="js"/>

以前，在向 TypeScript 导出类型时，泛型位置的 Kotlin [差异](generics.md#variance) 信息会丢失。

在 Kotlin 2.4.0 中，差异注解现在会在导出期间保存，并映射到 TypeScript 的 [差异注解](https://www.typescriptlang.org/docs/handbook/2/generics.html#variance-annotations)。

在您的 Kotlin 代码中，定义泛型类型参数的差异：

```Kotlin
// Kotlin
// 'out' 表示协变（接口仅生产 T）
interface Producer<out T> {
    fun produce(): T
}

// 'in' 表示逆变（接口仅消费 T）
interface Consumer<in T> {
    fun consume(item: T)
}
```

在 Kotlin 2.4.0 中，生成的 TypeScript 输出中将保留 `in` 和 `out` 关键字：

```TypeScript
// 生成的 .d.ts
export interface Producer<out T> {
    produce(): T;
}

export interface Consumer<in T> {
    consume(item: T): void;
}
```

### 改进了向 JavaScript/TypeScript 的接口导出
<secondary-label ref="js"/>

Kotlin 2.4.0 使得向 JavaScript/TypeScript 导出 Kotlin 接口更加方便。

新的 `@JsNoRuntime` 注解移除了以前实现 Kotlin 接口所需的元数据，允许直接映射到常规 TypeScript 接口，类似于外部接口默认的行为方式。

要导出 Kotlin 接口（例如在您的 Kotlin Multiplatform 项目中），请在公共代码中使用 `@JsNoRuntime` 进行注解：

```kotlin
// commonMain
import kotlin.js.JsNoRuntime

@JsNoRuntime
expect interface DataProcessor {
    fun process(data: String): Int 
}
```

然后在您的 JS 特定源代码中提供实际实现：

```kotlin
// jsMain
@JsNoRuntime
actual interface DataProcessor {
    actual fun process(data: String)
} 
```

由于删除了实现 Kotlin 接口所需的元数据，该接口被映射为一个常规 TypeScript 接口：

```TypeScript
// 生成的 .d.ts
export interface DataProcessor {
    process(data: string): void;
}
```

`@JsNoRuntime` 注解仅允许在标准接口上使用，以便 TypeScript 可以将 Kotlin 接口视为常规 TypeScript 接口。因此，以下操作是被禁止的：

* `is` 和 `as` 类型检查。
* 使用 [`::class` 语法](js-reflection.md) 的类引用。
* 将接口作为具体化（reified）类型参数传递。

> 避免对外部接口使用 `@JsNoRuntime` 注解，因为这会导致编译器警告。
>
{type="note"}

### 解除导出接口的限制
<primary-label ref="experimental-general"/>

<secondary-label ref="js"/>

Kotlin 2.4.0 在 `@JsExport` 的稳定化方面又迈出了一步，改进了 Kotlin 接口的导出方式。

现在您可以导出带有嵌套类和命名伴生对象的 Kotlin 接口：

```kotlin
@JsExport
interface Identity {
    class Metadata(val tag: String)

    companion object Registry {
        val defaultTag = "GUEST"
    }
}
```

有关更多信息，请参阅 [`@JsExport` 注解](js-to-kotlin-interop.md#jsexport-annotation)。

## Gradle

Kotlin 2.4.0 完全兼容 Gradle 7.6.3 到 9.5.0。您也可以使用截至最新 Gradle 发布版的 Gradle 版本。但请注意，这样做可能会导致弃用警告，并且某些新的 Gradle 功能可能无法工作。Kotlin 2.4.0 还带来了多项改进，如跨平台一致的默认模块名称，以及向 Kotlin/JVM 的 Problems API 写入的编译器消息。

### 最低支持的 AGP 版本提升至 8.5.2
<secondary-label ref="gradle"/>

从 Kotlin 2.4.0 开始，最低支持的 Android Gradle 插件版本为 8.5.2。

### 跨平台一致的模块名称
<secondary-label ref="gradle"/>

在 Kotlin 2.4.0 之前，默认模块名称在不同平台上各不相同。这种不一致可能会导致命名冲突和解析问题。Kotlin 2.4.0 在所有平台上将默认名称标准化为 `{group}:{project_name}`。

如果您需要将 JVM 模块名称还原为之前的版本，请在 Kotlin/JVM 项目的 `build.gradle.kts` 文件中添加以下内容：

```kotlin
kotlin {
    compilerOptions.moduleName(project.name)
}
```

对于多平台项目：

```kotlin
kotlin {
    jvm {
        compilerOptions.moduleName(project.name)
    }
}
```

### 向 Kotlin/JVM 的 Problems API 写入编译器消息
<secondary-label ref="gradle"/>

在 Kotlin 2.2.0 中，Kotlin Gradle 插件 (KGP) 开始向 [Gradle 的 Problems API](https://docs.gradle.org/current/userguide/reporting_problems.html) 报告诊断信息，以在 Gradle 的 CLI 和 IntelliJ IDEA 中提供一致的体验。

在 Kotlin 2.4.0 中，该插件还将编译器消息写入 Kotlin/JVM 的 Problems API，使该 API 更接近于成为所有日志和消息的单一来源。

## Maven

Kotlin 2.4.0 通过支持 Maven Toolchains 以及 Java 和 JVM 目标版本之间的自动对齐，使项目配置变得更加容易。

### Java 和 JVM 目标版本之间的自动对齐
<secondary-label ref="maven"/>

为了简化项目配置并防止兼容性问题，Kotlin Maven 插件现在会自动将 JVM 目标版本与项目中配置的 Java 编译器版本对齐。

这确保了 Kotlin 和 Maven 编译器针对相同的字节码版本，避免了 Kotlin 生成的字节码与项目其余部分或预期的部署环境不兼容的问题。

启用 `<extensions>` 选项后，您无需设置 `kotlin.compiler.jvmTarget` 或 `kotlin.compiler.jdkRelease` 选项。如果两者都未定义，Kotlin Maven 插件会按以下顺序自动解析 JVM 目标版本：

1. 作为 `maven.compiler.release` 版本，该版本可以定义为项目属性，也可以在 `maven-compiler-plugin` 配置中定义。

   在这种情况下，Kotlin 编译器将同时设置 `jvmTarget` 和 `jdkRelease` 编译器选项，从而将 API 限制在特定的 JDK 版本。

2. 如果未设置 Maven 发布版本，则作为 `maven.compiler.target` 版本。编译器目标可以定义为项目属性，也可以在 `maven-compiler-plugin` 配置中定义。

   在这种情况下，仅设置 Kotlin 的 `jvmTarget`，API 不受特定 JDK 版本的限制。

这极大地简化了您的 Kotlin 项目配置，因此您的 `pom.xml` 文件可以如下所示：

```xml
<properties>
    <maven.compiler.release>17</maven.compiler.release>
    <kotlin.version>%kotlinVersion%</kotlin.version>
</properties>

<build>
    <plugins>
        <plugin>
            <groupId>org.jetbrains.kotlin</groupId>
            <artifactId>kotlin-maven-plugin</artifactId>
            <version>${kotlin.version}</version>
            <extensions>true</extensions>
        </plugin>
    </plugins>
</build>
```

在构建过程中，插件会输出类似的消息：

```none
[INFO] Using jvmTarget=17 (derived from maven.compiler.release=17)
```

> `<extensions>` 选项仅检查项目级属性和全局 `maven-compiler-plugin` 配置。它不会检查插件的 `<executions>` 部分中定义的配置。
>
{style="note"}

有关自动项目配置的更多信息，请参阅 [我们的文档](maven-configure-project.md#jvm-target-version)。

### 支持 Maven Toolchains
<secondary-label ref="maven"/>

Kotlin 2.4.0 为 Kotlin Maven 插件引入了对 [Maven Toolchains](https://maven.apache.org/guides/mini/guide-using-toolchains.html) 的支持。

该功能有助于管理构建中的 JDK 版本。使用 Maven Toolchains，您可以指定用于 Kotlin 编译的 JDK 版本，而独立于运行 Maven 的 JVM 版本（设置在 `JAVA_HOME` 中）。当在构建中配置了 `maven-toolchains-plugin` 时，Kotlin Maven 插件会自动选取选定的 JDK 工具链，就像 Maven 编译器插件和其他 Maven 插件所做的一样。这允许您配置单一工具链来控制构建中所有插件使用的 JDK，包括 Kotlin 编译：

```xml
<plugin>
    <groupId>org.apache.maven.plugins</groupId>
    <artifactId>maven-toolchains-plugin</artifactId>
    <version>3.2.0</version>
    <executions>
        <execution>
            <goals>
                <goal>toolchain</goal>
            </goals>
        </execution>
    </executions>
    <configuration>
        <toolchains>
            <jdk>
                <version>21</version>
            </jdk>
        </toolchains>
    </configuration>
</plugin>
```
请记住设置 JDK 版本的不同方式的优先级：

1. `kotlin-maven-plugin` 配置中的 `jdkHome`。显式设置的 `jdkHome` 选项始终优先于工具链版本。 
2. `maven-toolchains-plugin` 中的 JDK 版本。通过 Maven Toolchains 设置的 JDK 版本会覆盖 `JAVA_HOME` 路径中设置的 JDK 版本。
3. `JAVA_HOME` 路径。

您还可以使用特定于插件的 `<jdkToolchain>` 选项来直接设置 `kotlin-maven-plugin` 工具链中的 JDK 版本。与使用 `maven-toolchains-plugin` 相比，此参数仅影响 Kotlin 编译，对构建中的其他插件没有影响。

> 目前，将 `maven-toolchains-plugin` 设置为使用特定的 JDK 版本不会影响 `kotlin-maven-plugin` 的 `kapt` 和 `test-kapt` 目标。要解决此问题，请在 `JAVA_HOME` 路径中设置所需的版本。更多详细信息请参见 [KT-79897](https://youtrack.jetbrains.com/issue/KT-79897)。
>
{style="note"}

有关配置 Kotlin Maven 项目的更多信息，请参阅我们的 [文档](maven-configure-project.md)。

## 构建工具 API

Kotlin 2.4.0 对构建工具 API (BTA) 进行了多项改进。BTA：

* 为大多数 JVM 和通用编译器选项引入了新的类型安全抽象。BTA 现在代客户端处理它们的格式，从而降低了出错风险并提供了额外的辅助层。此更改在运行时是向后兼容的，但可能会破坏源代码兼容性。
* 现在可以跟踪增量编译中的非源代码更改，例如配置不同的 Kotlin 版本或更改编译器选项。构建系统可以通过 `BaseIncrementalCompilationConfiguration.TRACK_CONFIGURATION_INPUTS` 选项控制此行为。
* 通过 `AbiValidationToolchain` 支持 [二进制兼容性验证](gradle-binary-compatibility-validation.md)，使其他构建系统更容易添加此功能。
* 引入了一项新功能，使构建系统可以通过 [`CompilerMessageRenderer`](https://github.com/JetBrains/kotlin/blob/2.4.0/compiler/build-tools/kotlin-build-tools-api/src/main/kotlin/org/jetbrains/kotlin/buildtools/api/CompilerMessageRenderer.kt) 接口和 [`JvmCompilationOperation` 构建器](https://github.com/JetBrains/kotlin/blob/2.4.0/compiler/build-tools/kotlin-build-tools-api/src/main/kotlin/org/jetbrains/kotlin/buildtools/api/jvm/operations/JvmCompilationOperation.kt#L59) 自定义编译器消息的显示方式。
* 引入了用于配置 [Kotlin 守护进程](kotlin-daemon.md) 日志的新选项：
  * `LOGS_PATH` —— 守护进程日志文件的目录。
  * `LOGS_FILE_SIZE_LIMIT` —— 日志文件的最大大小（以字节为单位）。
  * `LOGS_FILE_COUNT_LIMIT` —— 保留的日志文件最大数量。

  默认情况下，限制设置为特定于 Kotlin 编译器版本的值。若要不设限制，构建工具必须将选项设置为 `null`。

  构建系统可以在配置执行策略时设置该选项：

  ```kotlin
  val executionPolicy = kotlinToolchains.daemonExecutionPolicy {
      set(ExecutionPolicy.WithDaemon.LOGS_PATH, Paths("/var/log/kotlin-daemon"))
      set(ExecutionPolicy.WithDaemon.LOGS_FILE_SIZE_LIMIT, 10_485_760L)
      set(ExecutionPolicy.WithDaemon.LOGS_FILE_COUNT_LIMIT, 10)
  }
  ```

## Kotlin 编译器

Kotlin 2.4.0 在 `.klib` 编译期间对同一模块中声明的内联函数包含了更加一致的行为。

### 在 klib 编译期间一致的模块内函数内联
<secondary-label ref="compiler"/>

以前，[函数内联](inline-functions.md) 在不同的 Kotlin 平台上的行为不一致。JetBrains 团队正在努力在所有支持的平台上统一它，以确保相同的兼容性保证。

在 Kotlin/JVM 上，函数内联发生在编译时。因此，当使用 Kotlin/JVM 编译器编译 Kotlin 源代码时，生成的类文件在字节码中没有内联函数调用，因为内联函数的主体被内联到了它们的调用处，所以它们的行为在编译期间就已固定。

相反，在 Kotlin/Native、Kotlin/JS 和 Kotlin/Wasm 上，函数内联并不发生在源代码到 klib 的编译期间，而只发生在二进制文件生成期间。因此，内联函数的行为在 `.klib` 编译期间并未固定，且 `.klib` 库无法提供与 Kotlin/JVM 相同的内联函数兼容性保证。

Kotlin 2.4.0 在生成 `.klib` 构件时通过启用模块内内联，迈出了统一内联函数行为的第一步：

```kotlin
// 现有的 logging.klib 库
inline fun logDebug(message: String) {
    println("[DEBUG] $message")
}
```

```kotlin
// 当前编译的 App 模块
inline fun greetUser(name: String) {
    println("Hello, $name!")
}

fun main() {
    logDebug("App started") // 未内联：在另一个模块中声明
    greetUser("Alice")      // 已内联：在同一个模块中声明
}
```

编译为 `.klib` 时，代码看起来大致如下：

```kotlin
// 伪代码
fun main() {
    logDebug("App started")  // 未内联，在另一个模块中声明
    val tmp0 = "Alice"
    println("Hello, $tmp0!") // 从 greetUser() 内联
}
```

这意味着在 `.klib` 编译期间，只有在同一模块中声明的内联函数才会被内联。在这种情况下，其他函数在生成平台特定的二进制文件期间会被内联。

#### 如何启用 {id=how-to-enable-intra-module-inlining}

从 2.4.0 开始，针对 Kotlin/Native、Kotlin/JS 和 Kotlin/Wasm，默认启用了模块内内联。

如果您在使用此功能时遇到意外问题，可以在命令行中使用以下编译器选项禁用它：

```bash
-Xklib-ir-inliner=disabled
```

下一步是启用跨模块内联，以确保项目中的所有内联函数都得到一致的内联。此更改计划在未来的 Kotlin 版本中实施，但您已经可以在命令行中使用以下编译器选项进行尝试：

```bash
-Xklib-ir-inliner=full
```

请在 [YouTrack](https://kotl.in/issue) 中分享您的反馈并报告任何问题。

### 跨 Kotlin 编译器一致的部分库链接
<secondary-label ref="compiler"/>

在 Kotlin 1.9.0 中，Kotlin/Native 和 Kotlin/JS 编译器默认启用了部分库链接，随后 Kotlin/Wasm 在 Kotlin 2.0.0 中也紧随其后。此功能有效地使编译器处理 Kotlin 库中的链接问题与 Kotlin/JVM 保持一致。

自那以后，我们没有收到负面反馈，也没有注意到用户在他们的项目中禁用部分链接。这就是为什么从 Kotlin 2.4.0 开始，部分链接始终启用，且 `-Xpartial-linkage` 编译器选项现已弃用。

所有 Kotlin 编译器的默认日志级别为 `SILENT`。编译期间不会报告链接问题。要在您的项目中更改此行为，请在构建文件中设置 `-Xpartial-linkage-loglevel` 编译器选项：

```kotlin
// build.gradle.kts
kotlin {
    macosX64("native") {
        binaries.executable()
        
        compilations.configureEach {
            compilerOptions.configure {
                // 以 “info” 日志级别报告链接问题：
                freeCompilerArgs.add("-Xpartial-linkage-loglevel=INFO")

                // 将问题作为错误报告：
                freeCompilerArgs.add("-Xpartial-linkage-loglevel=ERROR")
            }
        }
    }
}
```
{validate="false"}

* `INFO` 以 “info” 日志级别报告链接问题。
* `WARNING` 在编译时报告警告并将其记录在编译日志中。
* `ERROR` 允许在出现链接问题时编译失败，并在编译日志中报告错误。使用此选项可以更仔细地检查链接问题。

如果您遇到此功能的问题，请在 [我们的问题跟踪器](https://kotl.in/issue) 中报告。

## Kotlin 编译器插件

在 Kotlin 2.4.0 中，Kotlin 的编译器插件也收到了显著更新。kapt 插件现在可以从编译类路径中排除不必要的注解处理器，而 Power-assert 插件通过新的运行时库提供了简化的配置。

### kapt：从编译类路径中排除注解处理器

Kotlin 2.4.0 增加了对注解处理器发现的 `includeCompileClasspath` 配置选项的支持，类似于 Kotlin Gradle 插件。新选项允许您从编译类路径中排除不必要的注解处理器。

要在构建文件中配置此选项，请在 kapt 插件的 `<execution>` 部分将 `includeCompileClasspath` 选项设置为 `false`：

```xml
<execution>
    <id>kapt</id>
        <goals><goal>kapt</goal></goals>
        <configuration>
            <!-- 添加新选项 -->
            <includeCompileClasspath>false</includeCompileClasspath> 
            <sourceDirs>...</sourceDirs>
            <annotationProcessorPaths>...</annotationProcessorPaths>
        </configuration>
</execution>
```

或者，您可以在 `<properties>` 部分使用 `kapt.include.compile.classpath` 执行相同的操作：

```xml
<properties>
    <kapt.include.compile.classpath>false</kapt.include.compile.classpath>
</properties>
```

将该选项设置为 `false` 后，未包含在 kapt 配置的 `<annotationProcessorPaths>` 部分中的注解处理器将被排除在 kapt 处理之外。

如果未设置 `includeCompileClasspath` 且 kapt 在编译类路径上检测到未在 `<annotationProcessorPaths>` 部分显式定义的注解处理器，您将看到以下弃用警告：

```text
[WARNING] Annotation processors discovery from compile classpath is deprecated. Set 'kapt.include.compile.classpath=false' to disable discovery.
```

有关 kapt 配置的更多信息，请参阅我们的 [文档](kapt.md)。

### Power-assert：新的运行时库

Kotlin 2.4.0 通过新的运行时库使 Power-assert 支持的函数更易于发现且更易于配置。

以前，采用 Power-assert 需要复杂的构建配置和函数参数约定。从这个版本开始，支持 Power-assert 的函数可以使用新的运行时库直接与编译器插件转换集成。

这为插件用户和库作者都带来了重大改进：

* 新的 `CallExplanation` 数据结构提供了关于调用处的详细信息。这使得能够为断言失败提供更动态的图表渲染，并更好地与外部工具集成。
* 新的 `@PowerAssert` 注解使断言函数能够立即被编译器插件发现。这样，您现在可以为您的库添加开箱即用的 Power-assert 支持。

> 使用我们的 [示例合集](https://github.com/bnorm/power-assert-examples#power-assert-examples) 作为试验新功能的游乐场。
>
{style="tip"}

有关更多信息，请参阅我们的 [文档](power-assert.md#use-the-power-assert-plugin)。

## Compose 编译器

在 Kotlin 2.4.0 中，Compose 编译器提供了更一致的增量编译，并推进了几个功能标记的弃用周期。

### 针对内部声明的一致增量编译
<secondary-label ref="compose-compiler"/>

从 Kotlin 2.4.0 开始，Compose 编译器提供了更一致的增量编译。不同文件之间内部类型的稳定性现在在运行时推断。这允许 Compose 更新推断的稳定性值，即使类用法未被重新编译。

作为一个副作用，每当 `@Composable` 函数使用来自不同文件的 `internal` 类作为参数时，您的构件大小可能会增加。这是由于编译器为稳定和不稳定两种情况都编码了执行路径，因为稳定性必须在运行时决定。运行时的这种稳定性开销会被执行全应用优化的压缩工具（如 R8）移除，因为它们能够推断出不必要的执行路径并将其消除。

此更新不会改变最终的稳定性值，因此 `@Composable` 函数的行为保持不变。

### 功能标记弃用
<secondary-label ref="compose-compiler"/>

Kotlin 2.4.0 推进了已达到稳定并现已默认启用的实验性功能标记的弃用周期：

* `StrongSkipping`、`IntrinsicRemember` 及相关的 DSL 属性已推进至 `DeprecationLevel.ERROR`。它们将在 Kotlin 2.5.0 中被移除。
* `OptimizeNonSkippingGroups` 和 `PausableComposition` 现已弃用。它们计划在 Kotlin 2.6.0 中被移除。

## 破坏性变更和弃用

本节重点介绍重要的破坏性变更和弃用。有关完整概述，请参阅我们的 [兼容性指南](compatibility-guide-24.md)。

* 从 Kotlin 2.4.0 开始，编译器不再支持 `-language-version=1.9`。因此，K1 编译器不再受支持。
* Kotlin 2.4.0 精简了 Kotlin Gradle 插件中用于二进制兼容性验证的 DSL，并弃用了一些部分。有关最新的 DSL，请参阅 [Kotlin Gradle 插件中的二进制兼容性验证](gradle-binary-compatibility-validation.md)。
* [通过 `KotlinScriptMojo` Maven 插件执行 Kotlin 脚本的支持已被移除](compatibility-guide-22.md#deprecations-to-kotlin-scripting)。

## 文档更新
我们在 Kotlin 生态系统中进行了以下文档更改：

* [Compose Multiplatform 应用中的 Liquid Glass](https://kotlinlang.org/docs/multiplatform/ios-liquid-glass.html) —— 将 iOS 应用从完全由 Compose 驱动的导航迁移到具有 iOS 26 Liquid Glass 样式的原生 SwiftUI 导航。
* [将 Swift 软件包作为依赖项添加到 KMP 模块](https://kotlinlang.org/docs/multiplatform/multiplatform-spm-import.html) —— 了解如何在您的 KMP 项目中设置 SwiftPM 依赖项。
* [手动](https://kotlinlang.org/docs/multiplatform/multiplatform-cocoapods-spm-migration.html) 或 [使用 Junie](https://kotlinlang.org/docs/multiplatform/multiplatform-cocoapods-spm-migration-ai.html) 将 Kotlin Multiplatform 项目从 CocoaPods 切换到 SwiftPM 依赖项 —— 了解如何利用 Junie 和 Kotlin AI 技能使迁移更容易。
* [为 KMP 应用配置 TeamCity](https://kotlinlang.org/docs/multiplatform/configure-teamcity-for-kmp.html) —— 使用 TeamCity 构建、测试和部署您的 KMP 应用程序。
* [Navigation 3 推荐的序列化方法](https://kotlinlang.org/docs/multiplatform/compose-navigation-3.html#recommended-serialization-approaches) —— 寻找在 CMP 应用程序中配合 Navigation 3 使用序列化的最佳方式。
* [多平台 ViewModel](https://kotlinlang.org/docs/multiplatform/compose-viewmodel.html) —— 了解如何在多平台项目中设置和使用 ViewModel。
* [使用 Kotlin 进行后端开发](server-overview.md) —— 探索可用于后端开发的不同框架。
* [使用 Spring Boot 和 Claude 创建任务管理器应用](spring-boot-claude.md) —— 了解 Claude 如何帮助您从头开始使用 Spring Boot 创建应用。
* [配置 Maven 项目](maven-configure-project.md) —— 在现有的 Java Maven 项目或新的 Kotlin Maven 项目中设置 Kotlin 编译。
* [使用 Maven 测试 Kotlin 项目](jvm-test-maven.md) —— 了解如何使用 JUnit 创建测试并使用 Maven 插件运行单元测试和集成测试。
* [在 Kotlin 项目中使用注解处理器](jvm-annotation-processors.md) —— 在后端项目中选择使用 kapt 或 KSP 来处理注解。
* [Kotlin AI 技能](kotlin-ai-skills.md) —— 使用代理技能帮助您执行特定于 Kotlin 的任务。
* [Kotlin 语言服务器](kotlin-lsp.md) —— 阅读关于 JetBrains 对 Kotlin 语言服务器协议 (LSP) 的官方实现。
* [数字](numbers.md) —— 探索 Kotlin 的数字类型以及如何操作它们。
* [KSP 快速入门](ksp-quickstart.md) —— 了解如何向项目添加基于 KSP 的处理器或创建您自己的处理器。
* [从 kapt 迁移到 KSP](ksp-kapt-migration.md) —— 迁移您的注解处理器以充分利用 Kotlin 的功能。
* [Lincheck 概述](lincheck-guide.md) —— 了解 Lincheck 如何在后台工作以测试 JVM 上的并发代码。
* [Lincheck 入门](lincheck-getting-started.md) —— 创建项目并使用 Lincheck 运行测试。
* [使用 Lincheck 测试任意代码](lincheck-testing-arbitrary-code.md) —— 了解如何使用 Lincheck 测试并发代码。
* [如何使用 Lincheck 测试数据结构](lincheck-how-to-test-data-structures.md) —— 深入了解 Lincheck 的数据结构测试过程。
* [使用 Lincheck 的测试策略](lincheck-testing-strategies.md) —— 了解 Lincheck 的测试策略：模型检查和压力测试。
* [使用 Lincheck 配置测试策略](lincheck-testing-strategies-options.md) —— 探索 Lincheck 测试策略的不同选项。
* [使用 Dokku 部署 Ktor 应用程序](https://ktor.io/docs/dokku.html) —— 了解使用 Dokku 的部署工作流。