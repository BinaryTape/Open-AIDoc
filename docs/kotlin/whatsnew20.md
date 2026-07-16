[//]: # (title: Kotlin 2.0.0 的最新变化)

<web-summary>阅读 Kotlin 2.0.0 版本说明，涵盖新语言功能、Kotlin Multiplatform、JVM、Native、JS 和 Wasm 的更新，以及 Gradle 和 Maven 的构建工具支持。</web-summary>

_[发布日期：2024 年 5 月 21 日](releases.md#release-history)_

Kotlin 2.0.0 版本现已发布，[新的 Kotlin K2 编译器](#kotlin-k2-compiler)已达到稳定状态！此外，以下是其他一些亮点：

* [新的 Compose 编译器 Gradle 插件](#new-compose-compiler-gradle-plugin)
* [使用 invokedynamic 生成 lambda 函数](#generation-of-lambda-functions-using-invokedynamic)
* [kotlinx-metadata-jvm 库现已稳定](#the-kotlinx-metadata-jvm-library-is-stable)
* [在 Apple 平台上通过 signpost 监控 Kotlin/Native 的 GC 性能](#monitoring-gc-performance-with-signposts-on-apple-platforms)
* [解决 Kotlin/Native 中 Objective-C 方法的冲突](#resolving-conflicts-with-objective-c-methods)
* [Kotlin/Wasm 支持命名导出](#support-for-named-export)
* [Kotlin/Wasm 在带有 @JsExport 的函数中支持无符号原始类型](#support-for-unsigned-primitive-types-in-functions-with-jsexport)
* [默认使用 Binaryen 优化生产构建](#optimized-production-builds-by-default-using-binaryen)
* [多平台项目中用于编译器选项的新 Gradle DSL](#new-gradle-dsl-for-compiler-options-in-multiplatform-projects)
* [稳定替代 enum 类 values 泛型函数的方法](#stable-replacement-of-the-enum-class-values-generic-function)
* [稳定的 AutoCloseable 接口](#stable-autocloseable-interface)

Kotlin 2.0 是 JetBrains 团队的一个巨大里程碑。此版本是 KotlinConf 2024 的核心。请观看开幕主题演讲，我们在演讲中宣布了令人兴奋的更新，并介绍了 Kotlin 语言的最新进展：

<video src="https://www.youtube.com/v/Ar73Axsz2YA" title="KotlinConf'24 - 主题演讲"/>

> 有关 Kotlin 发布周期的信息，请参阅 [Kotlin 发布流程](releases.md)。
>
{style="tip"}

## IDE 支持

支持 Kotlin 2.0.0 的 Kotlin 插件已捆绑在最新的 IntelliJ IDEA 和 Android Studio 中。
您不需要更新 IDE 中的 Kotlin 插件。
您只需在构建脚本中将 [Kotlin 版本更改](releases.md#update-to-a-new-kotlin-version)为 Kotlin 2.0.0 即可。

* 有关 IntelliJ IDEA 对 Kotlin K2 编译器支持的详细信息，请参阅[在 IDE 中的支持](#support-in-ides)。
* 有关 IntelliJ IDEA 对 Kotlin 支持的更多详细信息，请参阅 [Kotlin 发布版本](releases.md#ide-support)。

## Kotlin K2 编译器

通往 K2 编译器之路漫长而艰辛，但现在 JetBrains 团队终于可以宣布其进入稳定阶段。
在 Kotlin 2.0.0 中，默认使用新的 Kotlin K2 编译器，并且它在所有目标平台（JVM、Native、Wasm 和 JS）上都已达到 [稳定](components-stability.md) 状态。新编译器带来了显著的性能提升，加快了新语言功能的开发速度，统一了 Kotlin 支持的所有平台，并为多平台项目提供了更好的架构。

JetBrains 团队通过成功编译来自选定用户和内部项目的 1000 万行代码，确保了新编译器的质量。1.8 万名开发者参与了稳定化过程，在总计 8 万个项目中测试了新的 K2 编译器，并报告了他们发现的任何问题。

为了帮助使迁移到新编译器的过程尽可能顺利，我们创建了 [K2 编译器迁移指南](k2-compiler-migration-guide.md)。
该指南解释了编译器的诸多优势，强调了您可能遇到的任何变化，并说明了在必要时如何回滚到以前的版本。

在[一篇博文](https://blog.jetbrains.com/kotlin/2024/04/k2-compiler-performance-benchmarks-and-how-to-measure-them-on-your-projects/)中，我们探索了 K2 编译器在不同项目中的性能。如果您想查看 K2 编译器表现的真实数据，并查找有关如何从您自己的项目中收集性能基准测试的说明，请阅读该博文。

您还可以观看 KotlinConf 2024 的这段演讲，首席语言设计师 Michail Zarečenskij 在演讲中讨论了 Kotlin 中的功能演进和 K2 编译器：

<video src="https://www.youtube.com/v/tAGJ5zJXJ7w" title="Kotlin Language Features in 2.0 and Beyond"/>

### 当前 K2 编译器的局限性

在您的 Gradle 项目中启用 K2 存在某些局限性，在以下情况下可能会影响使用 8.3 以下 Gradle 版本的项目：

* 编译来自 `buildSrc` 的源代码。
* 在包含的构建中编译 Gradle 插件。
* 如果其他 Gradle 插件用于 Gradle 版本低于 8.3 的项目中，则编译这些插件。
* 构建 Gradle 插件依赖项。

如果您遇到上述任何问题，可以采取以下步骤来解决：

* 为 `buildSrc`、任何 Gradle 插件及其依赖项设置语言版本：

  ```kotlin
  kotlin {
      compilerOptions {
          languageVersion.set(org.jetbrains.kotlin.gradle.dsl.KotlinVersion.KOTLIN_1_9)
          apiVersion.set(org.jetbrains.kotlin.gradle.dsl.KotlinVersion.KOTLIN_1_9)
      }
  }
  ```

  > 如果您为特定任务配置语言和 API 版本，这些值将覆盖 `compilerOptions` 扩展设置的值。在这种情况下，语言和 API 版本不应高于 1.9。
  >
  {style="note"}

* 将项目中的 Gradle 版本更新为 8.3 或更高版本。

### 智能转换改进

Kotlin 编译器可以在特定情况下自动将对象转换为某种类型，为您省去显式转换的麻烦。这被称为[智能转换 (smart casting)](typecasts.md#smart-casts)。
Kotlin K2 编译器现在比以前在更多场景中执行智能转换。

在 Kotlin 2.0.0 中，我们改进了以下领域的智能转换：

* [局部变量及其后的作用域](#local-variables-and-further-scopes)
* [带有逻辑或运算符的类型检查](#type-checks-with-logical-or-operator)
* [内联函数](#inline-functions)
* [具有函数类型的属性](#properties-with-function-types)
* [异常处理](#exception-handling)
* [自增与自减运算符](#increment-and-decrement-operators)

#### 局部变量及其后的作用域

以前，如果变量在 `if` 条件内被评估为非 `null`，则该变量将被智能转换。有关该变量的信息随后将在 `if` 块的作用域内进一步共享。

但是，如果您在 `if` 条件**之外**声明变量，则在 `if` 条件内将无法获得有关该变量的信息，因此无法进行智能转换。这种行为也出现在 `when` 表达式和 `while` 循环中。

从 Kotlin 2.0.0 开始，如果您在 `if`、`when` 或 `while` 条件中使用变量之前声明该变量，则编译器收集的有关该变量的任何信息都可以在相应的块中访问，以便进行智能转换。

当您想要执行诸如将布尔条件提取到变量中之类的操作时，这非常有用。然后，您可以为变量赋予一个有意义的名称，这将提高代码的可读性，并使以后在代码中重用该变量成为可能。例如：

```kotlin
class Cat {
    fun purr() {
        println("Purr purr")
    }
}

fun petAnimal(animal: Any) {
    val isCat = animal is Cat
    if (isCat) {
        // 在 Kotlin 2.0.0 中，编译器可以访问
        // 有关 isCat 的信息，因此它知道
        // animal 已被智能转换为 Cat 类型。
        // 因此，可以调用 purr() 函数。
        // 在 Kotlin 1.9.20 中，编译器不知道
        // 智能转换，因此调用 purr()
        // 函数会触发错误。
        animal.purr()
    }
}

fun main() {
    val kitty = Cat()
    petAnimal(kitty)
    // Purr purr
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="2.0" id="kotlin-smart-casts-k2-local-variables" validate="false"}

#### 带有逻辑或运算符的类型检查

在 Kotlin 2.0.0 中，如果您使用 `or` 运算符 (`||`) 组合对象的类型检查，则会智能转换为它们最近的公共超类型。在此更改之前，总是智能转换为 `Any` 类型。

在这种情况下，您仍然必须在之后手动检查对象类型，然后才能访问其任何属性或调用其函数。例如：

```kotlin
interface Status {
    fun signal() {}
}

interface Ok : Status
interface Postponed : Status
interface Declined : Status

fun signalCheck(signalStatus: Any) {
    if (signalStatus is Postponed || signalStatus is Declined) {
        // signalStatus 被智能转换为公共超类型 Status
        signalStatus.signal()
        // 在 Kotlin 2.0.0 之前，signalStatus 被智能转换为
        // Any 类型，因此调用 signal() 函数会触发
        // 未解析的引用 (Unresolved reference) 错误。signal() 函数只能
        // 在另一次类型检查后成功调用：

        // check(signalStatus is Status)
        // signalStatus.signal()
    }
}
```

> 公共超类型是联合类型的**近似**。[联合类型 (Union types)](https://en.wikipedia.org/wiki/Union_type) 在 Kotlin 中不受支持。
>
{style="note"}

#### 内联函数

在 Kotlin 2.0.0 中，K2 编译器以不同方式处理内联函数，结合其他编译器分析，使其能够确定智能转换是否安全。

具体来说，内联函数现在被视为具有隐式的 [`callsInPlace`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.contracts/-contract-builder/calls-in-place.html) 约定。这意味着传递给内联函数的任何 lambda 函数都会被就地调用。由于 lambda 函数是被就地调用的，编译器知道 lambda 函数不会泄漏其函数体中包含的任何变量的引用。

编译器将此知识与其他编译器分析结合使用，以决定智能转换任何捕获的变量是否安全。例如：

```kotlin
interface Processor {
    fun process()
}

inline fun inlineAction(f: () -> Unit) = f()

fun nextProcessor(): Processor? = null

fun runProcessor(): Processor? {
    var processor: Processor? = null
    inlineAction {
        // 在 Kotlin 2.0.0 中，编译器知道 processor 
        // 是一个局部变量，且 inlineAction() 是内联函数，因此 
        // 对 processor 的引用不会泄漏。因此，智能转换 
        // processor 是安全的。

        // 如果 processor 不为 null，则 processor 会被智能转换
        if (processor != null) {
            // 编译器知道 processor 不为 null，因此不需要 
            // 安全调用
            processor.process()

            // 在 Kotlin 1.9.20 中，您必须执行安全调用：
            // processor?.process()
        }

        processor = nextProcessor()
    }

    return processor
}
```

#### 具有函数类型的属性

在以前的 Kotlin 版本中，存在一个错误，导致具有函数类型的类属性无法进行智能转换。我们在 Kotlin 2.0.0 和 K2 编译器中修复了此行为。例如：

```kotlin
class Holder(val provider: (() -> Unit)?) {
    fun process() {
        // 在 Kotlin 2.0.0 中，如果 provider 不为 null，则
        // provider 会被智能转换
        if (provider != null) {
            // 编译器知道 provider 不为 null
            provider()

            // 在 1.9.20 中，编译器不知道 provider 不为 
            // null，因此会触发错误：
            // Reference has a nullable type '(() -> Unit)?', use explicit '?.invoke()' to make a function-like call instead
        }
    }
}
```

如果您重载了 `invoke` 运算符，此更改也适用。例如：

```kotlin
interface Provider {
    operator fun invoke()
}

interface Processor : () -> String

class Holder(val provider: Provider?, val processor: Processor?) {
    fun process() {
        if (provider != null) {
            provider()
            // 在 1.9.20 中，编译器会触发错误：
            // Reference has a nullable type 'Provider?' use explicit '?.invoke()' to make a function-like call instead
        }
    }
}
```

#### 异常处理

在 Kotlin 2.0.0 中，我们对异常处理进行了改进，以便智能转换信息可以传递给 `catch` 和 `finally` 块。此更改使您的代码更安全，因为编译器会跟踪您的对象是否具有可空类型。例如：

```kotlin
//sampleStart
fun testString() {
    var stringInput: String? = null
    // stringInput 被智能转换为 String 类型
    stringInput = ""
    try {
        // 编译器知道 stringInput 不为 null
        println(stringInput.length)
        // 0

        // 编译器拒绝 stringInput 之前的智能转换信息。 
        // 现在 stringInput 的类型为 String?。
        stringInput = null

        // 触发异常
        if (2 > 1) throw Exception()
        stringInput = ""
    } catch (exception: Exception) {
        // 在 Kotlin 2.0.0 中，编译器知道 stringInput 
        // 可能为 null，因此 stringInput 保持为可空。
        println(stringInput?.length)
        // null

        // 在 Kotlin 1.9.20 中，编译器会说不需要安全调用，
        // 但这是不正确的。
    }
}

//sampleEnd
fun main() {
    testString()
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="2.0" id="kotlin-smart-casts-k2-exception-handling"}

#### 自增与自减运算符

在 Kotlin 2.0.0 之前，编译器无法理解在使用自增或自减运算符后对象的类型可能会发生变化。由于编译器无法准确跟踪对象类型，您的代码可能会导致未解析的引用错误。在 Kotlin 2.0.0 中，这已被修复：

```kotlin
interface Rho {
    operator fun inc(): Sigma = TODO()
}

interface Sigma : Rho {
    fun sigma() = Unit
}

interface Tau {
    fun tau() = Unit
}

fun main(input: Rho) {
    var unknownObject: Rho = input

    // 检查 unknownObject 是否继承自 Tau 接口
    // 注意，unknownObject 有可能同时继承自
    // Rho 和 Tau 接口。
    if (unknownObject is Tau) {

        // 使用来自接口 Rho 的重载 inc() 运算符。
        // 在 Kotlin 2.0.0 中，unknownObject 的类型被智能转换为
        // Sigma。
        ++unknownObject

        // 在 Kotlin 2.0.0 中，编译器知道 unknownObject 的类型为
        // Sigma，因此可以成功调用 sigma() 函数。
        unknownObject.sigma()

        // 在 Kotlin 1.9.20 中，编译器在调用 inc() 时 
        // 不执行智能转换，因此编译器仍然认为 
        // unknownObject 的类型为 Tau。调用 sigma() 函数 
        // 会抛出编译时错误。
        
        // 在 Kotlin 2.0.0 中，编译器知道 unknownObject 的类型为
        // Sigma，因此调用 tau() 函数会抛出编译时 
        // 错误。
        unknownObject.tau()
        // Unresolved reference 'tau'

        // 在 Kotlin 1.9.20 中，由于编译器错误地认为 
        // unknownObject 的类型为 Tau，因此可以调用 tau() 函数，
        // 但它会抛出 ClassCastException。
    }
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="2.0" id="kotlin-smart-casts-k2-increment-decrement-operators" validate="false"}

### Kotlin Multiplatform 改进

在 Kotlin 2.0.0 中，我们对 K2 编译器中与 Kotlin Multiplatform 相关的以下领域进行了改进：

* [编译期间公共源集与平台源集的分离](#separation-of-common-and-platform-sources-during-compilation)
* [预期声明与实际声明的不同可见性级别](#different-visibility-levels-of-expected-and-actual-declarations)

#### 编译期间公共源集与平台源集的分离

以前，Kotlin 编译器的设计使其无法在编译时保持公共源集和平台源集的分离。结果，公共代码可以访问平台代码，从而导致不同平台之间的行为不一致。此外，来自公共代码的一些编译器设置和依赖项曾经会泄漏到平台代码中。

在 Kotlin 2.0.0 中，我们对新 Kotlin K2 编译器的实现包括对编译方案的重新设计，以确保公共源集和平台源集之间的严格分离。当您使用 [预期声明与实际声明函数](https://kotlinlang.org/docs/multiplatform/multiplatform-expect-actual.html#expected-and-actual-functions) 时，这种变化最为明显。以前，公共代码中的函数调用可能会解析为平台代码中的函数。例如：

<table>
   <tr>
       <td>公共代码</td>
       <td>平台代码</td>
   </tr>
   <tr>
<td>

```kotlin
fun foo(x: Any) = println("common foo")

fun exampleFunction() {
    foo(42)
}
```

</td>
<td>

```kotlin
// JVM
fun foo(x: Int) = println("platform foo")

// JavaScript
// JavaScript 平台上没有 foo() 函数重载
```

</td>
</tr>
</table>

在此示例中，公共代码的行为取决于其运行的平台：

* 在 JVM 平台上，在公共代码中调用 `foo()` 函数会导致平台代码中的 `foo()` 函数被调用，输出为 `platform foo`。
* 在 JavaScript 平台上，在公共代码中调用 `foo()` 函数会导致公共代码中的 `foo()` 函数被调用，输出为 `common foo`，因为平台代码中没有这样的函数。

在 Kotlin 2.0.0 中，公共代码无法访问平台代码，因此两个平台都成功将 `foo()` 函数解析为公共代码中的 `foo()` 函数，输出：`common foo`。

除了提高跨平台行为的一致性外，我们还努力修复了 IntelliJ IDEA 或 Android Studio 与编译器之间行为冲突的情况。例如，当您使用 [预期声明与实际声明类](https://kotlinlang.org/docs/multiplatform/multiplatform-expect-actual.html#expected-and-actual-classes) 时，会发生以下情况：

<table>
   <tr>
       <td>公共代码</td>
       <td>平台代码</td>
   </tr>
   <tr>
<td>

```kotlin
expect class Identity {
    fun confirmIdentity(): String
}

fun common() {
    // 在 2.0.0 之前，
    // 这会触发仅限 IDE 的错误
    Identity().confirmIdentity()
    // RESOLUTION_TO_CLASSIFIER : Expected class
    // Identity has no default constructor.
}
```

</td>
<td>

```kotlin
actual class Identity {
    actual fun confirmIdentity() = "expect class fun: jvm"
}
```

</td>
</tr>
</table>

在此示例中，预期声明类 `Identity` 没有默认构造函数，因此无法在公共代码中成功调用。以前，只有 IDE 会报告错误，但代码仍然在 JVM 上成功编译。但是，现在编译器会正确报告错误：

```none
Expected class 'expect class Identity : Any' does not have default constructor
```

##### 何时解析行为不改变

我们仍在迁移到新编译方案的过程中，因此当您调用不在同一源集内的函数时，解析行为仍然相同。当您在公共代码中使用来自多平台库的重载时，您会主要注意到这种差异。

假设您有一个库，它有两个具有不同签名的 `whichFun()` 函数：

```kotlin
// 示例库

// 模块: common
fun whichFun(x: Any) = println("common function")

// 模块: JVM
fun whichFun(x: Int) = println("platform function")
```

如果您在公共代码中调用 `whichFun()` 函数，则会解析库中具有最相关参数类型的函数：

```kotlin
// 一个针对 JVM 目标使用示例库的项目

// 模块: common
fun main() {
    whichFun(2)
    // platform function
}
```

相比之下，如果您在同一源集中声明 `whichFun()` 的重载，则公共代码中的函数将被解析，因为您的代码无法访问平台特定版本：

```kotlin
// 未使用示例库

// 模块: common
fun whichFun(x: Any) = println("common function")

fun main() {
    whichFun(2)
    // common function
}

// 模块: JVM
fun whichFun(x: Int) = println("platform function")
```

与多平台库类似，由于 `commonTest` 模块位于单独的源集中，它仍然可以访问平台特定的代码。因此，在 `commonTest` 模块中解析对函数的调用表现出与旧编译方案相同的行为。

将来，这些剩余的情况将与新编译方案更加一致。

#### 预期声明与实际声明的不同可见性级别

在 Kotlin 2.0.0 之前，如果您在 Kotlin Multiplatform 项目中使用 [预期声明与实际声明](https://kotlinlang.org/docs/multiplatform/multiplatform-expect-actual.html)，它们必须具有相同的 [可见性级别](visibility-modifiers.md)。
Kotlin 2.0.0 现在也支持不同的可见性级别，但**仅当**实际声明比预期声明更具宽松性时。例如：

```kotlin
expect internal class Attribute // 可见性为 internal
actual class Attribute          // 默认可见性为 public，
                                // 更加宽松
```

同样，如果您在实际声明中使用 [类型别名](type-aliases.md)，则**底层类型**的可见性应与预期声明相同或比其更具宽松性。例如：

```kotlin
expect internal class Attribute                 // 可见性为 internal
internal actual typealias Attribute = Expanded

class Expanded                                  // 默认可见性为 public，
                                                // 更加宽松
```

### 编译器插件支持

目前，Kotlin K2 编译器支持以下 Kotlin 编译器插件：

* [`all-open`](all-open-plugin.md)
* [AtomicFU](https://github.com/Kotlin/kotlinx-atomicfu)
* [`jvm-abi-gen`](https://github.com/JetBrains/kotlin/tree/master/plugins/jvm-abi-gen)
* [`js-plain-objects`](https://github.com/JetBrains/kotlin/tree/master/plugins/js-plain-objects)
* [kapt](whatsnew1920.md#preview-kapt-compiler-plugin-with-k2)
* [Lombok](lombok.md)
* [`no-arg`](no-arg-plugin.md)
* [Parcelize](https://plugins.gradle.org/plugin/org.jetbrains.kotlin.plugin.parcelize)
* [SAM with receiver](sam-with-receiver-plugin.md)
* [serialization](serialization.md)
* [Power-assert](power-assert.md)

此外，Kotlin K2 编译器支持：

* [Jetpack Compose](https://developer.android.com/jetpack/compose) 编译器插件 2.0.0，该插件已[移入 Kotlin 仓库](https://android-developers.googleblog.com/2024/04/jetpack-compose-compiler-moving-to-kotlin-repository.html)。
* 自 [KSP2](https://android-developers.googleblog.com/2023/12/ksp2-preview-kotlin-k2-standalone.html) 起的 [Kotlin 符号处理 (KSP) 插件](ksp-overview.md)。

> 如果您使用任何其他编译器插件，请查看其文档以了解它们是否与 K2 兼容。
>
{style="tip"}

### 实验性 Kotlin Power-assert 编译器插件

> Kotlin Power-assert 插件处于 [实验性](components-stability.md#stability-levels-explained) 阶段。
> 它可能随时被更改。
>
{style="warning"}

Kotlin 2.0.0 引入了实验性的 Power-assert 编译器插件。此插件通过在失败消息中包含上下文信息，改善了编写测试的体验，使调试更加轻松高效。

开发者通常需要使用复杂的断言库来编写有效的测试。Power-assert 插件通过自动生成包含断言表达式中间值的失败消息，简化了此过程。这有助于开发者快速了解测试失败的原因。

当测试中的断言失败时，改进后的错误消息会显示断言中所有变量和子表达式的值，从而明确是条件的哪一部分导致了失败。这对于检查多个条件的复杂断言特别有用。

要在您的项目中启用该插件，请在您的 `build.gradle(.kts)` 文件中配置它：

<tabs group="build-script">
<tab title="Kotlin" group-key="kotlin">

```kotlin
plugins {
    kotlin("multiplatform") version "2.0.0"
    kotlin("plugin.power-assert") version "2.0.0"
}

powerAssert {
    functions = listOf("kotlin.assert", "kotlin.test.assertTrue")
}
```

</tab>
<tab title="Groovy" group-key="groovy">

```groovy
plugins {
    id 'org.jetbrains.kotlin.multiplatform' version '2.0.0'
    id 'org.jetbrains.kotlin.plugin.power-assert' version '2.0.0'
}

powerAssert {
    functions = ["kotlin.assert", "kotlin.test.assertTrue"]
}
```

</tab>
</tabs>

在 [文档中了解有关 Kotlin Power-assert 插件的更多信息](power-assert.md)。

### 如何启用 Kotlin K2 编译器

从 Kotlin 2.0.0 开始，默认启用 Kotlin K2 编译器。不需要任何额外操作。

### 在 Kotlin Playground 中尝试 Kotlin K2 编译器

Kotlin Playground 支持 2.0.0 版本。[快来试试吧！](https://pl.kotl.in/czuoQprce)

### 在 IDE 中的支持

默认情况下，IntelliJ IDEA 和 Android Studio 仍使用以前的编译器进行代码分析、代码补全、高亮显示和其他 IDE 相关功能。要获得 IDE 中的完整 Kotlin 2.0 体验，请启用 K2 模式。

在您的 IDE 中，转到 **Settings** | **Languages & Frameworks** | **Kotlin** 并选择 **Enable K2 mode** 选项。IDE 将使用其 K2 模式分析您的代码。

![启用 K2 模式](k2-mode.png){width=200}

启用 K2 模式后，您可能会由于编译器行为的变化而注意到 IDE 分析的差异。在我们的 [迁移指南](k2-compiler-migration-guide.md) 中了解新的 K2 编译器与以前的编译器的区别。

* 在[我们的博客](https://blog.jetbrains.com/idea/2024/11/k2-mode-becomes-stable/)中了解更多关于 K2 模式的信息。
* 我们正在积极收集有关 K2 模式的反馈，请在我们的 [公共 Slack 频道](https://kotlinlang.slack.com/archives/C0B8H786P) 中分享您的想法。

### 留下您对新 K2 编译器的反馈

我们将感谢您的任何反馈！

* 在 [我们的问题跟踪器](https://kotl.in/issue) 中报告您在使用新 K2 编译器时遇到的任何问题。
* [启用“发送使用情况统计信息”选项](https://www.jetbrains.com/help/idea/settings-usage-statistics.html)，允许 JetBrains 收集有关 K2 使用情况的匿名数据。

## Kotlin/JVM

从 2.0.0 版本开始，编译器可以生成包含 Java 22 字节码的类。
此版本还带来了以下变化：

* [使用 invokedynamic 生成 lambda 函数](#generation-of-lambda-functions-using-invokedynamic)
* [kotlinx-metadata-jvm 库现已稳定](#the-kotlinx-metadata-jvm-library-is-stable)

### 使用 invokedynamic 生成 lambda 函数

Kotlin 2.0.0 引入了一种使用 `invokedynamic` 生成 lambda 函数的新默认方法。与传统的匿名类生成相比，此更改减小了应用程序的二进制大小。

自第一个版本以来，Kotlin 一直将 lambda 生成为匿名类。但是，从 [Kotlin 1.5.0](whatsnew15.md#lambdas-via-invokedynamic) 开始，通过使用 `-Xlambdas=indy` 编译器选项，可以使用 `invokedynamic` 生成选项。在 Kotlin 2.0.0 中，`invokedynamic` 已成为 lambda 生成的默认方法。此方法生成的二进制文件更轻量，并使 Kotlin 与 JVM 优化保持一致，确保应用程序从 JVM 性能的持续和未来改进中受益。

目前，与普通 lambda 编译相比，它有三个局限性：

* 编译为 `invokedynamic` 的 lambda 不可序列化。
* 实验性的 [`reflect()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.reflect.jvm/reflect.html) API 不支持由 `invokedynamic` 生成的 lambda。
* 对此类 lambda 调用 `.toString()` 会产生可读性较差的字符串表示形式：

```kotlin
fun main() {
    println({})

    // 使用 Kotlin 1.9.24 和反射，返回
    // () -> kotlin.Unit
    
    // 使用 Kotlin 2.0.0，返回
    // FileKt$Lambda$13/0x00007f88a0004608@506e1b77
}
```

要保留生成 lambda 函数的旧行为，您可以：

* 使用 `@JvmSerializableLambda` 注解特定的 lambda。
* 使用编译器选项 `-Xlambdas=class` 使用旧方法生成模块中的所有 lambda。

### kotlinx-metadata-jvm 库已稳定

在 Kotlin 2.0.0 中，`kotlinx-metadata-jvm` 库已达到 [稳定](components-stability.md#stability-levels-explained) 状态。现在该库已更改为 `kotlin` 软件包和坐标，您可以将其作为 `kotlin-metadata-jvm`（不带 "x"）找到。

以前，`kotlinx-metadata-jvm` 库有自己的发布方案和版本。现在，我们将作为 Kotlin 发布周期的一部分构建和发布 `kotlin-metadata-jvm` 更新，并具有与 Kotlin 标准库相同的向后兼容性保证。

`kotlin-metadata-jvm` 库提供了一个 API，用于读取和修改由 Kotlin/JVM 编译器生成的二进制文件的元数据。

<!-- 在 [文档](kotlin-metadata-jvm.md) 中了解有关 `kotlinx-metadata-jvm` 库的更多信息。 -->

## Kotlin/Native

此版本带来了以下变化：

* [通过 signpost 监控 GC 性能](#monitoring-gc-performance-with-signposts-on-apple-platforms)
* [解决 Objective-C 方法的冲突](#resolving-conflicts-with-objective-c-methods)
* [更改了 Kotlin/Native 中编译器参数的日志级别](#changed-log-level-for-compiler-arguments)
* [显式向 Kotlin/Native 添加了标准库和平台依赖项](#explicitly-added-standard-library-and-platform-dependencies-to-kotlin-native)
* [Gradle 配置缓存中的任务错误](#tasks-error-in-gradle-configuration-cache)

### 在 Apple 平台上通过 signpost 监控 GC 性能

以前，只能通过查看日志来监控 Kotlin/Native 垃圾回收 (GC) 的性能。但是，这些日志未与 Xcode Instruments 集成，Xcode Instruments 是一个用于调查 iOS 应用性能问题的流行工具集。

自 Kotlin 2.0.0 起，GC 使用 Instruments 中可用的 signpost 报告暂停。Signpost 允许在您的应用内进行自定义日志记录，因此现在在调试 iOS 应用性能时，您可以检查 GC 暂停是否对应于应用冻结。

在 [文档](native-memory-manager.md#monitor-gc-performance) 中了解有关 GC 性能分析的更多信息。

### 解决 Objective-C 方法的冲突

Objective-C 方法可以具有不同的名称，但具有相同数量和类型的形参。例如，[`locationManager:didEnterRegion:`](https://developer.apple.com/documentation/corelocation/cllocationmanagerdelegate/1423560-locationmanager?language=objc) 和 [`locationManager:didExitRegion:`](https://developer.apple.com/documentation/corelocation/cllocationmanagerdelegate/1423630-locationmanager?language=objc)。在 Kotlin 中，这些方法具有相同的签名，因此尝试使用它们会触发冲突的重载错误。

以前，您必须手动取消冲突的重载以避免此编译错误。为了提高 Kotlin 与 Objective-C 的互操作性，Kotlin 2.0.0 引入了新的 `@ObjCSignatureOverride` 注解。

该注解指示 Kotlin 编译器忽略冲突的重载，以防从 Objective-C 类继承了几个具有相同参数类型但不同参数名称的函数。

应用此注解也比常规错误抑制更安全。此注解只能在重写 Objective-C 方法的情况下使用（这些方法受支持并经过测试），而常规抑制可能会隐藏重要的错误并导致静默损坏的代码。

### 更改了编译器参数的日志级别

在此版本中，Kotlin/Native Gradle 任务（如 `compile`、`link` 和 `cinterop`）中编译器参数的日志级别已从 `info` 更改为 `debug`。

将 `debug` 作为其默认值后，日志级别与其他 Gradle 编译任务保持一致，并提供详细的调试信息，包括所有编译器参数。

### 显式向 Kotlin/Native 添加了标准库和平台依赖项

以前，Kotlin/Native 编译器隐式解析标准库和平台依赖项，这导致 Kotlin Gradle 插件在不同 Kotlin 目标上的工作方式不一致。

现在，每个 Kotlin/Native Gradle 编译都通过 `compileDependencyFiles` [编译参数](https://kotlinlang.org/docs/multiplatform/multiplatform-dsl-reference.html#compilation-parameters)在其编译时库路径中显式包含标准库和平台依赖项。

### Gradle 配置缓存中的任务错误

自 Kotlin 2.0.0 起，您可能会遇到配置缓存错误，消息指示：
`invocation of Task.project at execution time is unsupported`。

此错误出现在 `NativeDistributionCommonizerTask` 和 `KotlinNativeCompile` 等任务中。

但是，这是一个误报错误。根本原因是存在与 Gradle 配置缓存不兼容的任务，例如 `publish*` 任务。

这种差异可能不会立即显现，因为错误消息暗示了不同的根源。

由于错误报告中未明确说明准确原因，[Gradle 团队已经在处理该问题以修复报告](https://github.com/gradle/gradle/issues/21290)。

## Kotlin/Wasm

Kotlin 2.0.0 提高了性能以及与 JavaScript 的互操作性：

* [默认使用 Binaryen 优化生产构建](#optimized-production-builds-by-default-using-binaryen)
* [支持命名导出](#support-for-named-export)
* [支持在带有 `@JsExport` 的函数中使用无符号原始类型](#support-for-unsigned-primitive-types-in-functions-with-jsexport)
* [在 Kotlin/Wasm 中生成 TypeScript 声明文件](#generation-of-typescript-declaration-files-in-kotlin-wasm)
* [支持捕获 JavaScript 异常](#support-for-catching-javascript-exceptions)
* [新的异常处理提议现已作为选项受支持](#new-exception-handling-proposal-is-now-supported-as-an-option)
* [`withWasm()` 函数被拆分为 JS 和 WASI 变体](#the-withwasm-function-is-split-into-js-and-wasi-variants)

### 默认使用 Binaryen 优化生产构建

Kotlin/Wasm 工具链现在在生产编译期间对所有项目应用 [Binaryen](https://github.com/WebAssembly/binaryen) 工具，而不是之前的手动设置方法。根据我们的评估，它应该会提高运行时性能并减小项目的二进制大小。

> 此更改仅影响生产编译。开发编译过程保持不变。
>
{style="note"}

### 支持命名导出

以前，从 Kotlin/Wasm 导出的所有声明都使用默认导出导入到 JavaScript 中：

```javascript
//JavaScript:
import Module from "./index.mjs"

Module.add()
```

现在，您可以按名称导入每个标记有 `@JsExport` 的 Kotlin 声明：

```kotlin
// Kotlin:
@JsExport
fun add(a: Int, b: Int) = a + b
```

```javascript
//JavaScript:
import { add } from "./index.mjs"
```

命名导出使得在 Kotlin 和 JavaScript 模块之间共享代码变得更加容易。它们提高了可读性并帮助您管理模块之间的依赖关系。

### 支持在带有 @JsExport 的函数中使用无符号原始类型

从 Kotlin 2.0.0 开始，您可以在外部声明和带有 `@JsExport` 注解的函数中使用[无符号原始类型](unsigned-integer-types.md)，该注解使 Kotlin/Wasm 函数在 JavaScript 代码中可用。

这有助于缓解之前的限制，即阻止[无符号原始类型](unsigned-integer-types.md)直接在导出和外部声明中使用。现在您可以导出带有无符号原始类型作为返回值或参数类型的函数，并使用返回或使用无符号原始类型的外部声明。

有关 Kotlin/Wasm 与 JavaScript 互操作性的更多信息，请参阅 [文档](wasm-js-interop.md#use-javascript-code-in-kotlin)。

### 在 Kotlin/Wasm 中生成 TypeScript 声明文件

> 在 Kotlin/Wasm 中生成 TypeScript 声明文件处于 [实验性](components-stability.md#stability-levels-explained) 阶段。
> 它可能随时被弃用或更改。
>
{style="warning"}

在 Kotlin 2.0.0 中，Kotlin/Wasm 编译器现在能够从 Kotlin 代码中的任何 `@JsExport` 声明生成 TypeScript 定义。这些定义可由 IDE 和 JavaScript 工具使用，以提供代码自动补全，帮助进行类型检查，并使在 JavaScript 中包含 Kotlin 代码变得更加容易。

Kotlin/Wasm 编译器收集标记有 `@JsExport` 的任何 [顶层函数](wasm-js-interop.md#functions-with-the-jsexport-annotation)，并在 `.d.ts` 文件中自动生成 TypeScript 定义。

要生成 TypeScript 定义，请在您的 `build.gradle(.kts)` 文件的 `wasmJs {}` 块中添加 `generateTypeScriptDefinitions()` 函数：

```kotlin
kotlin {
    wasmJs {
        binaries.executable()
        browser {
        }
        generateTypeScriptDefinitions()
    }
}
```

### 支持捕获 JavaScript 异常

以前，Kotlin/Wasm 代码无法捕获 JavaScript 异常，这使得处理源自程序 JavaScript 侧的错误变得困难。

在 Kotlin 2.0.0 中，我们实现了在 Kotlin/Wasm 中捕获 JavaScript 异常的支持。此实现允许您使用 `try-catch` 块以及 `Throwable` 或 `JsException` 等特定类型来正确处理这些错误。

此外，无论是否发生异常都有助于执行代码的 `finally` 块也能正常工作。虽然我们引入了捕获 JavaScript 异常的支持，但在发生 JavaScript 异常（如调用堆栈）时不会提供额外信息。但是，[我们正在致力于这些实现](https://youtrack.jetbrains.com/issue/KT-68185/WasmJs-Attach-js-exception-object-to-JsException)。

### 新的异常处理提议现已作为选项受支持

在此版本中，我们引入了对 Kotlin/Wasm 中 WebAssembly 新版本 [异常处理提议](https://github.com/WebAssembly/exception-handling/blob/main/proposals/exception-handling/Exceptions.md) 的支持。

此次更新确保新提议符合 Kotlin 要求，从而能够在仅支持最新版本提议的虚拟机上使用 Kotlin/Wasm。

通过使用 `-Xwasm-use-new-exception-proposal` 编译器选项激活新的异常处理提议，该选项默认关闭。

### withWasm() 函数被拆分为 JS 和 WASI 变体

以前为层次结构模板提供 Wasm 目标的 `withWasm()` 函数已被弃用，取而代之的是专门的 `withWasmJs()` 和 `withWasmWasi()` 函数。

现在您可以将 WASI 和 JS 目标在树定义中的不同组之间分开。

## Kotlin/JS

在其他变化中，此版本为 Kotlin 带来了现代 JS 编译，支持来自 ES2015 标准的更多功能：

* [新编译目标](#new-compilation-target)
* [作为 ES2015 生成器的挂起函数](#suspend-functions-as-es2015-generators)
* [向 main 函数传递参数](#passing-arguments-to-the-main-function)
* [Kotlin/JS 项目的逐文件编译](#per-file-compilation-for-kotlin-js-projects)
* [改进的集合互操作性](#improved-collection-interoperability)
* [支持 createInstance()](#support-for-createinstance)
* [支持类型安全的普通 JavaScript 对象](#support-for-type-safe-plain-javascript-objects)
* [支持 npm 软件包管理器](#support-for-npm-package-manager)
* [编译任务的变更](#changes-to-compilation-tasks)
* [停止旧版 Kotlin/JS JAR 构件](#discontinuing-legacy-kotlin-js-jar-artifacts)

### 新编译目标

在 Kotlin 2.0.0 中，我们为 Kotlin/JS 添加了一个新的编译目标 `es2015`。这是您一次性启用 Kotlin 中支持的所有 ES2015 功能的新方法。

您可以在 `build.gradle(.kts)` 文件中按如下方式设置：

```kotlin
kotlin {
    js {
        compilerOptions {
            target.set("es2015")
        }
    }
}
```

新目标会自动开启 [ES 类和模块](whatsnew19.md#experimental-support-for-es2015-classes-and-modules) 以及新支持的 [ES 生成器](#suspend-functions-as-es2015-generators)。

### 作为 ES2015 生成器的挂起函数

此版本引入了对使用 ES2015 生成器编译 [挂起函数 (suspend functions)](composing-suspending-functions.md) 的 [实验性](components-stability.md#stability-levels-explained) 支持。

使用生成器而不是状态机应该会改善项目的最终包大小。例如，JetBrains 团队通过使用 ES2015 生成器成功将其 Space 项目的包大小减少了 20%。

[在官方文档中详细了解 ES2015 (ECMAScript 2015, ES6)](https://262.ecma-international.org/6.0/)。

### 向 main 函数传递参数

从 Kotlin 2.0.0 开始，您可以为 `main()` 函数指定 `args` 的来源。此功能使得使用命令行并传递参数变得更加容易。

为此，请使用新的 `passAsArgumentToMainFunction()` 函数定义 `js {}` 块，该函数返回一个字符串数组：

```kotlin
kotlin {
    js {
        binary.executable()
        passAsArgumentToMainFunction("Deno.args")
    }
}
```

该函数在运行时执行。它获取 JavaScript 表达式，并将其用作 `args: Array<String>` 实参，而不是调用 `main()` 函数。

此外，如果您使用 Node.js 运行时，则可以利用特殊别名。它允许您将 `process.argv` 传递给 `args` 形参一次，而无需每次手动添加：

```kotlin
kotlin {
    js {
        binary.executable()
        nodejs {
            passProcessArgvToMainFunction()
        }
    }
}
```

### Kotlin/JS 项目的逐文件编译

Kotlin 2.0.0 为 Kotlin/JS 项目输出引入了一个新的粒度选项。您现在可以设置逐文件编译，为每个 Kotlin 文件生成一个 JavaScript 文件。这有助于显著优化最终包的大小并缩短程序的加载时间。

以前只有两种输出选项。Kotlin/JS 编译器可以为整个项目生成单个 `.js` 文件。但是，此文件可能太大且使用不便。每当您想使用项目中的函数时，都必须包含整个 JavaScript 文件作为依赖项。或者，您可以为每个项目模块配置单独的 `.js` 文件的编译。这仍然是默认选项。

由于模块文件也可能太大，在 Kotlin 2.0.0 中，我们添加了更细粒度的输出，即为每个 Kotlin 文件生成一个（如果文件包含导出声明，则为两个）JavaScript 文件。要启用逐文件编译模式：

1. 将 [`useEsModules()`](whatsnew19.md#experimental-support-for-es2015-classes-and-modules) 函数添加到您的构建文件中，以支持 ECMAScript 模块：

   ```kotlin
   // build.gradle.kts
   kotlin {
       js(IR) {
           useEsModules() // 启用 ES2015 模块
           browser()
       }
   }
   ```

   您也可以为此使用新的 `es2015` [编译目标](#new-compilation-target)。

2. 应用 `-Xir-per-file` 编译器选项或更新您的 `gradle.properties` 文件：

   ```none
   # gradle.properties
   kotlin.js.ir.output.granularity=per-file // `per-module` 是默认值
   ```

### 改进的集合互操作性

从 Kotlin 2.0.0 开始，可以将签名中带有 Kotlin 集合类型的声明导出到 JavaScript（和 TypeScript）。这适用于 `Set`、`Map` 和 `List` 集合类型及其可变对应类型。

要在 JavaScript 中使用 Kotlin 集合，首先使用 [`@JsExport`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.js/-js-export/) 注解标记必要的声明：

```kotlin
// Kotlin
@JsExport
data class User(
    val name: String,
    val friends: `List<User>` = emptyList()
)

@JsExport
val me = User(
    name = "Me",
    friends = listOf(User(name = "Kodee"))
)
```

然后，您可以像使用常规 JavaScript 数组一样在 JavaScript 中使用它们：

```javascript
// JavaScript
import { User, me, KtList } from "my-module"

const allMyFriendNames = me.friends
    .asJsReadonlyArrayView()
    .map(x => x.name) // ['Kodee']
```

> 遗憾的是，从 JavaScript 创建 Kotlin 集合仍然不可用。我们计划在 Kotlin 2.0.20 中添加此功能。
>
{style="note"}

### 支持 createInstance()

从 Kotlin 2.0.0 开始，您可以使用 Kotlin/JS 目标中的 [`createInstance()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.reflect.full/create-instance.html) 函数。以前，它仅在 JVM 上可用。

来自 [KClass](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.reflect/-k-class/) 接口的此函数创建指定类的新实例，这对于获取 Kotlin 类的运行时引用非常有用。

### 支持类型安全的普通 JavaScript 对象

> `js-plain-objects` 插件处于 [实验性](components-stability.md#stability-levels-explained) 阶段。
> 它可能随时被弃用或更改。`js-plain-objects` 插件**仅**支持 K2 编译器。
>
{style="warning"}

为了更容易地使用 JavaScript API，在 Kotlin 2.0.0 中，我们提供了一个新插件：[`js-plain-objects`](https://github.com/JetBrains/kotlin/tree/master/plugins/js-plain-objects)，您可以使用它来创建类型安全的普通 JavaScript 对象。该插件会检查您的代码中是否有带有 `@JsPlainObject` 注解的 [外部接口](wasm-js-interop.md#external-interfaces)，并添加：

* 伴生对象内部的内联 `invoke` 运算符函数，您可以将其用作构造函数。
* 一个 `.copy()` 函数，您可以使用它创建对象的副本，同时调整其某些属性。

例如：

```kotlin
import kotlinx.js.JsPlainObject

@JsPlainObject
external interface User {
    var name: String
    val age: Int
    val email: String?
}

fun main() {
    // 创建一个 JavaScript 对象
    val user = User(name = "Name", age = 10)
    // 复制对象并添加电子邮件
    val copy = user.copy(age = 11, email = "some@user.com")

    println(JSON.stringify(user))
    // { "name": "Name", "age": 10 }
    println(JSON.stringify(copy))
    // { "name": "Name", "age": 11, "email": "some@user.com" }
}
```

使用这种方法创建的任何 JavaScript 对象都更安全，因为您不再只能在运行时看到错误，而是可以在编译时看到错误，甚至可以由 IDE 高亮显示。

请考虑以下示例，该示例使用 `fetch()` 函数通过外部接口与 JavaScript API 交互，以描述 JavaScript 对象的形状：

```kotlin
import kotlinx.js.JsPlainObject

@JsPlainObject
external interface FetchOptions {
    val body: String?
    val method: String
}

// Window.fetch 的包装器
suspend fun fetch(url: String, options: FetchOptions? = null) = TODO("在此处添加您的自定义行为")

// 由于 "metod" 未被识别为 method，因此会触发编译时错误
fetch("https://google.com", options = FetchOptions(metod = "POST"))
// 由于 method 是必需的，因此会触发编译时错误
fetch("https://google.com", options = FetchOptions(body = "SOME STRING")) 
```

相比之下，如果您改用 `js()` 函数来创建 JavaScript 对象，则只能在运行时发现错误，或者根本不触发错误：

```kotlin
suspend fun fetch(url: String, options: FetchOptions? = null) = TODO("在此处添加您的自定义行为")

// 不会触发错误。由于 "metod" 未被识别，因此使用了错误的方法 (GET)。
fetch("https://google.com", options = js("{ metod: 'POST' }"))

// 默认情况下，使用 GET 方法。由于 body 不应存在，因此会触发运行时错误。
fetch("https://google.com", options = js("{ body: 'SOME STRING' }"))
// TypeError: Window.fetch: HEAD or GET Request cannot have a body
```

要使用 `js-plain-objects` 插件，请在您的 `build.gradle(.kts)` 文件中添加以下内容：

<tabs group="build-script">
<tab title="Kotlin" group-key="kotlin">

```kotlin
plugins {
    kotlin("plugin.js-plain-objects") version "2.0.0"
}
```

</tab>
<tab title="Groovy" group-key="groovy">

```groovy
plugins {
    id "org.jetbrains.kotlin.plugin.js-plain-objects" version "2.0.0"
}
```

</tab>
</tabs>

### 支持 npm 软件包管理器

以前，Kotlin Multiplatform Gradle 插件只能使用 [Yarn](https://yarnpkg.com/lang/en/) 作为软件包管理器来下载和安装 npm 依赖项。从 Kotlin 2.0.0 开始，您可以改用 [npm](https://www.npmjs.com/) 作为软件包管理器。使用 npm 作为软件包管理器意味着您在设置期间可以少管理一个工具。

为了向后兼容，Yarn 仍然是默认的软件包管理器。要使用 npm 作为您的软件包管理器，请在您的 `gradle.properties` 文件中设置以下属性：

```kotlin
kotlin.js.yarn = false
```

### 编译任务的变更

以前，`webpack` 和 `distributeResources` 编译任务都以相同的目录为目标。此外，`distribution` 任务也将 `dist` 声明为其输出目录。这导致输出重叠并产生编译警告。

因此，从 Kotlin 2.0.0 开始，我们实施了以下更改：

* `webpack` 任务现在以单独的文件夹为目标。
* `distributeResources` 任务已完全移除。
* `distribution` 任务现在具有 `Copy` 类型并以 `dist` 文件夹为目标。

### 停止旧版 Kotlin/JS JAR 构件

从 Kotlin 2.0.0 开始，Kotlin 发行版不再包含具有 `.jar` 扩展名的旧版 Kotlin/JS 构件。旧版构件用于不受支持的旧 Kotlin/JS 编译器，对于使用 `klib` 格式的 IR 编译器来说是不必要的。

## Gradle 改进

Kotlin 2.0.0 与 Gradle 6.8.3 至 8.5 完全兼容。您也可以使用最新的 Gradle 发布版本，但如果这样做，请记住您可能会遇到弃用警告，或者某些新的 Gradle 功能可能无法使用。

此版本带来了以下变化：

* [多平台项目中用于编译器选项的新 Gradle DSL](#new-gradle-dsl-for-compiler-options-in-multiplatform-projects)
* [新的 Compose 编译器 Gradle 插件](#new-compose-compiler-gradle-plugin)
* [用于区分 JVM 和 Android 发布库的新属性](#new-attribute-to-distinguish-jvm-and-android-published-libraries)
* [改进了 Kotlin/Native 中 CInteropProcess 的 Gradle 依赖项处理](#improved-gradle-dependency-handling-for-cinteropprocess-in-kotlin-native)
* [Gradle 中的可见性变化](#visibility-changes-in-gradle)
* [Gradle 项目中 Kotlin 数据的新目录](#new-directory-for-kotlin-data-in-gradle-projects)
* [在需要时下载 Kotlin/Native 编译器](#kotlin-native-compiler-downloaded-when-needed)
* [弃用定义编译器选项的旧方法](#deprecated-old-ways-of-defining-compiler-options)
* [提高了支持的最低 AGP 版本](#bumped-minimum-supported-agp-version)
* [用于尝试最新语言版本的新 Gradle 属性](#new-gradle-property-for-trying-the-latest-language-version)
* [构建报告的新 JSON 输出格式](#new-json-output-format-for-build-reports)
* [kapt 配置从超配置继承注解处理器](#kapt-configurations-inherit-annotation-processors-from-superconfigurations)
* [Kotlin Gradle 插件不再使用弃用的 Gradle 约定](#kotlin-gradle-plugin-no-longer-uses-deprecated-gradle-conventions)

### 多平台项目中用于编译器选项的新 Gradle DSL

> 此功能处于 [实验性](components-stability.md#stability-levels-explained) 阶段。它可能随时被弃用或更改。请仅出于评估目的使用它。我们将在 [YouTrack](https://kotl.in/issue) 中感谢您对此的反馈。
>
{style="warning"}

在 Kotlin 2.0.0 之前，在 Gradle 的多平台项目中配置编译器选项只能在较低级别进行，例如按任务、编译或源集配置。为了更轻松地在项目中更通用地配置编译器选项，Kotlin 2.0.0 附带了一个新的 Gradle DSL。

通过这个新 DSL，您可以在扩展级别为所有目标和共享源集（如 `commonMain`）以及在目标级别为特定目标配置编译器选项：

```kotlin
kotlin {
    compilerOptions {
        // 扩展级别的公共编译器选项，用作
        // 所有目标和共享源集的默认值
        allWarningsAsErrors.set(true)
    }
    jvm {
        compilerOptions {
            // 目标级别的 JVM 编译器选项，用作
            // 此目标中所有编译的默认值
            noJdk.set(true)
        }
    }
}
```

现在的整体项目配置有三个层级。最高层是扩展级别，然后是目标级别，最低层是编译单元（通常是编译任务）：

![Kotlin 编译器选项层级](compiler-options-levels.svg){width=700}

较高级别的设置用作较低层级的约定（默认值）：

* 扩展编译器选项的值是目标编译器选项的默认值，包括共享源集，如 `commonMain`、`nativeMain` 和 `commonTest`。
* 目标编译器选项的值用作编译单元（任务）编译器选项的默认值，例如 `compileKotlinJvm` 和 `compileTestKotlinJvm` 任务。

反过来，在较低级别进行的配置会覆盖较高级别的相关设置：

* 任务级别的编译器选项会覆盖目标或扩展级别的相关配置。
* 目标级别的编译器选项会覆盖扩展级别的相关配置。

在配置您的项目时，请记住一些设置编译器选项的旧方法已 [弃用](#deprecated-old-ways-of-defining-compiler-options)。

我们鼓励您在多平台项目中尝试新 DSL，并在 [YouTrack](https://kotl.in/issue) 中留下反馈，因为我们计划将此 DSL 作为配置编译器选项的推荐方法。

### 新的 Compose 编译器 Gradle 插件

Jetpack Compose 编译器（将可组合项转换为 Kotlin 代码）现在已合并到 Kotlin 仓库中。这将有助于将 Compose 项目过渡到 Kotlin 2.0.0，因为 Compose 编译器将始终与 Kotlin 同时发货。这也将 Compose 编译器版本提升到 2.0.0。

要在您的项目中使用新的 Compose 编译器，请在您的 `build.gradle(.kts)` 文件中应用 `org.jetbrains.kotlin.plugin.compose` Gradle 插件，并将其版本设置为等于 Kotlin 2.0.0。

要了解有关此更改的更多信息并查看迁移说明，请参阅 [Compose 编译器](https://kotlinlang.org/docs/multiplatform/compose-compiler.html) 文档。

### 用于区分 JVM 和 Android 发布库的新属性

从 Kotlin 2.0.0 开始，[`org.gradle.jvm.environment`](https://docs.gradle.org/current/userguide/variant_attributes.html#sub:jvm_default_attributes) Gradle 属性默认随所有 Kotlin 变体一起发布。

该属性有助于区分 Kotlin Multiplatform 库的 JVM 和 Android 变体。它指示某个库变体更适合某种 JVM 环境。目标环境可以是 "android"、"standard-jvm" 或 "no-jvm"。

发布此属性还应该使来自非多平台客户端（例如仅 Java 的项目）使用带有 JVM 和 Android 目标的 Kotlin Multiplatform 库变得更加健壮。

如有必要，您可以禁用属性发布。为此，请在您的 `gradle.properties` 文件中添加以下 Gradle 选项：

```none
kotlin.publishJvmEnvironmentAttribute=false
```

### 改进了 Kotlin/Native 中 CInteropProcess 的 Gradle 依赖项处理

在此版本中，我们增强了对 `defFile` 属性的处理，以确保在 Kotlin/Native 项目中更好的 Gradle 任务依赖管理。

在此更新之前，如果 `defFile` 属性被指定为尚未执行的另一个任务的输出，Gradle 构建可能会失败。此问题的解决方法是添加对此任务的依赖项：

```kotlin
kotlin {
    macosArm64("native") {
        compilations.getByName("main") {
            cinterops {
                val cinterop by creating {
                    defFileProperty.set(createDefFileTask.flatMap { it.defFile.asFile })
                    project.tasks.named(interopProcessingTaskName).configure {
                        dependsOn(createDefFileTask)
                    }
                }
            }
        }
    }
}
```

为了解决这个问题，有一个名为 `definitionFile` 的新 `RegularFileProperty` 属性。现在，在连接的任务稍后在构建过程中运行后，Gradle 会延迟验证 `definitionFile` 属性的存在。这种新方法消除了对额外依赖项的需求。

`CInteropProcess` 任务和 `CInteropSettings` 类使用 `definitionFile` 属性而不是 `defFile` 和 `defFileProperty`：

<tabs group ="build-script">
<tab id="kotlin" title="Kotlin" group-key="kotlin">

```kotlin
kotlin {
    macosArm64("native") {
        compilations.getByName("main") {
            cinterops {
                val cinterop by creating {
                    definitionFile.set(project.file("def-file.def"))
                }
            }
        }
    }
}
```

</tab>
<tab id="groovy" title="Groovy" group-key="groovy">

```groovy
kotlin {
    macosArm64("native") {
        compilations.main {
            cinterops {
                cinterop {
                    definitionFile.set(project.file("def-file.def"))
                }
            }
        }
    }
}
```

</tab>
</tabs>

> `defFile` 和 `defFileProperty` 形参已弃用。
>
{style="warning"}

### Gradle 中的可见性变化

> 此更改仅影响 Kotlin DSL 用户。
>
{style="note"}

在 Kotlin 2.0.0 中，我们修改了 Kotlin Gradle 插件，以便在您的构建脚本中实现更好的控制和安全性。以前，某些旨在用于特定 DSL 上下文的 Kotlin DSL 函数和属性会无意中泄漏到其他 DSL 上下文中。这种泄漏可能导致使用错误的编译器选项、重复应用设置以及其他错误配置：

```kotlin
kotlin {
    // 目标 DSL 无法访问在
    // kotlin{} 扩展 DSL 中定义的方法和属性
    jvm {
        // 编译 DSL 无法访问在
        // kotlin{} 扩展 DSL 和 Kotlin jvm{} 目标 DSL 中定义的方法和属性
        compilations.configureEach {
            // 编译任务 DSL 无法访问在
            // kotlin{} 扩展、Kotlin jvm{}
            // 目标或 Kotlin 编译 DSL 中定义的方法和属性
            compileTaskProvider.configure {
                // 例如：
                explicitApi()
                // 错误，因为它定义在 kotlin{} 扩展 DSL 中
                mavenPublication {}
                // 错误，因为它定义在 Kotlin jvm{} 目标 DSL 中
                defaultSourceSet {}
                // 错误，因为它定义在 Kotlin 编译 DSL 中
            }
        }
    }
}
```

为了解决这个问题，我们添加了 `@KotlinGradlePluginDsl` 注解，防止将 Kotlin Gradle 插件 DSL 函数和属性暴露给不打算使其可用的层级。以下层级彼此分离：

* Kotlin 扩展
* Kotlin 目标
* Kotlin 编译
* Kotlin 编译任务

对于最流行的情况，如果您的构建脚本配置不正确，我们添加了编译器警告以及如何修复它们的建议。例如：

```kotlin
kotlin {
    jvm {
        sourceSets.getByName("jvmMain").dependencies {
            implementation("org.jetbrains.kotlinx:kotlinx-coroutines-core-jvm:1.7.3")
        }
    }
}
```

在这种情况下，`sourceSets` 的警告消息是：

```none
[DEPRECATION] 'sourceSets: NamedDomainObjectContainer<KotlinSourceSet>' is deprecated.Accessing 'sourceSets' container on the Kotlin target level DSL is deprecated. Consider configuring 'sourceSets' on the Kotlin extension level.
```

我们将感谢您对这一变化的反馈！请直接在我们的 [#gradle Slack 频道](https://kotlinlang.slack.com/archives/C19FD9681) 向 Kotlin 开发者分享您的评论。[获取 Slack 邀请](https://surveys.jetbrains.com/s3/kotlin-slack-sign-up)。

### Gradle 项目中 Kotlin 数据的新目录

> 不要将 `.kotlin` 目录提交到版本控制。
> 例如，如果您使用 Git，请将 `.kotlin` 添加到项目的 `.gitignore` 文件中。
>
{style="warning"}

在 Kotlin 1.8.20 中，Kotlin Gradle 插件切换到在 Gradle 项目缓存目录中存储其数据：`<project-root-directory>/.gradle/kotlin`。但是，`.gradle` 目录仅保留给 Gradle 使用，因此它不具备前瞻性。

为了解决这个问题，从 Kotlin 2.0.0 开始，我们默认将 Kotlin 数据存储在您的 `<project-root-directory>/.kotlin` 中。为了向后兼容，我们将继续在 `.gradle/kotlin` 目录中存储一些数据。

您可以配置的新 Gradle 属性如下：

| Gradle 属性                                     | 描述                                                                                                        |
|-----------------------------------------------------|--------------------------------------------------------------------------------------------------------------------|
| `kotlin.project.persistent.dir`                     | 配置存储项目级数据的位置。默认值：`<project-root-directory>/.kotlin`       |
| `kotlin.project.persistent.dir.gradle.disableWrite` | 一个布尔值，控制是否禁用向 `.gradle` 目录写入 Kotlin 数据。默认值：`false` |

将这些属性添加到项目中的 `gradle.properties` 文件中以使其生效。

### 在需要时下载 Kotlin/Native 编译器

在 Kotlin 2.0.0 之前，如果您在多平台项目的 Gradle 构建脚本中配置了 [Kotlin/Native 目标](native-target-support.md)，Gradle 总是会在 [配置阶段](https://docs.gradle.org/current/userguide/build_lifecycle.html#sec:configuration) 下载 Kotlin/Native 编译器。

即使没有任务要为预定在 [执行阶段](https://docs.gradle.org/current/userguide/build_lifecycle.html#sec:execution) 运行的 Kotlin/Native 目标编译代码，也会发生这种情况。以这种方式下载 Kotlin/Native 编译器对于只想检查项目中 JVM 或 JavaScript 代码的用户来说效率特别低。例如，作为 CI 过程的一部分，使用其 Kotlin 项目执行测试或检查。

在 Kotlin 2.0.0 中，我们更改了 Kotlin Gradle 插件中的此行为，以便在 [执行阶段](https://docs.gradle.org/current/userguide/build_lifecycle.html#sec:execution) 且**仅当**请求为 Kotlin/Native 目标进行编译时才下载 Kotlin/Native 编译器。

反过来，Kotlin/Native 编译器的依赖项现在不再作为编译器的一部分下载，而是在执行阶段下载。

如果您在使用新行为时遇到任何问题，可以通过在 `gradle.properties` 文件中添加以下 Gradle 属性暂时切换回之前的行为：

```none
kotlin.native.toolchain.enabled=false
```

从 Kotlin 1.9.20-Beta 开始，Kotlin/Native 发行版与 CDN 一起发布到 [Maven Central](https://repo.maven.apache.org/maven2/org/jetbrains/kotlin/kotlin-native-prebuilt/)。

这使我们能够更改 Kotlin 寻找和下载必要构件的方式。默认情况下，它现在使用您在项目的 `repositories {}` 块中指定的 Maven 仓库，而不是 CDN。

您可以通过在 `gradle.properties` 文件中设置以下 Gradle 属性来暂时切回此行为：

```none
kotlin.native.distribution.downloadFromMaven=false
```

请向我们的问题跟踪器 [YouTrack](https://kotl.in/issue) 报告任何问题。这两个更改默认行为的 Gradle 属性都是临时的，将在未来的版本中移除。

### 弃用定义编译器选项的旧方法

在此版本中，我们继续完善编译器选项的设置方式。它应该可以解决不同方法之间的歧义，并使项目配置更加直接。

自 Kotlin 2.0.0 起，以下用于指定编译器选项的 DSL 已弃用：

* 实现所有 Kotlin 编译任务的 `KotlinCompile` 接口中的 `kotlinOptions` DSL。请改用 `KotlinCompilationTask<CompilerOptions>`。
* 来自 `KotlinCompilation` 接口的具有 `HasCompilerOptions` 类型的 `compilerOptions` 属性。此 DSL 与其他 DSL 不一致，并且配置了与 `KotlinCompilation.compileTaskProvider` 编译任务内部的 `compilerOptions` 相同的 `KotlinCommonCompilerOptions` 对象，这令人困惑。

  相反，我们建议使用 Kotlin 编译任务中的 `compilerOptions` 属性：

  ```kotlin
  kotlinCompilation.compileTaskProvider.configure {
      compilerOptions { ... }
  }
  ```

  例如：

  ```kotlin
  kotlin {
      js(IR) {
          compilations.all {
              compileTaskProvider.configure {
                  compilerOptions.freeCompilerArgs.add("-Xir-minimized-member-names=false")
              }
          }
      }
  }
  ```

* `KotlinCompilation` 接口中的 `kotlinOptions` DSL。
* `KotlinNativeArtifactConfig` 接口、`KotlinNativeLink` 类和 `KotlinNativeLinkArtifactTask` 类中的 `kotlinOptions` DSL。请改用 `toolOptions` DSL。
* `KotlinJsDce` 接口中的 `dceOptions` DSL。请改用 `toolOptions` DSL。

有关如何在 Kotlin Gradle 插件中指定编译器选项的更多信息，请参阅 [如何定义选项](gradle-compiler-options.md#how-to-define-options)。

### 提高了支持的最低 AGP 版本

从 Kotlin 2.0.0 开始，支持的最低 Android Gradle 插件版本为 7.1.3。

### 用于尝试最新语言版本的新 Gradle 属性

在 Kotlin 2.0.0 之前，我们有以下 Gradle 属性来尝试新的 K2 编译器：`kotlin.experimental.tryK2`。现在 K2 编译器在 Kotlin 2.0.0 中已默认启用，我们决定将此属性演变为一种新形式，您可以使用它在项目中尝试最新的语言版本：`kotlin.experimental.tryNext`。当您在 `gradle.properties` 文件中使用此属性时，Kotlin Gradle 插件会将语言版本增加到比您的 Kotlin 版本的默认值高一个级别。例如，在 Kotlin 2.0.0 中，默认语言版本为 2.0，因此该属性会配置语言版本 2.1。

这个新的 Gradle 属性在 [构建报告](gradle-compilation-and-caches.md#build-reports) 中产生与之前 `kotlin.experimental.tryK2` 类似的指标。配置的语言版本包含在输出中。例如：

```none
##### 'kotlin.experimental.tryNext' results #####
:app:compileKotlin: 2.1 language version
:lib:compileKotlin: 2.1 language version
##### 100% (2/2) tasks have been compiled with Kotlin 2.1 #####
```

要详细了解如何启用构建报告及其内容，请参阅 [构建报告](gradle-compilation-and-caches.md#build-reports)。

### 构建报告的新 JSON 输出格式

在 Kotlin 1.7.0 中，我们引入了构建报告以帮助跟踪编译器性能。随着时间的推移，我们添加了更多指标，使这些报告在调查性能问题时更加详细和有用。以前，本地文件的唯一输出格式是 `*.txt` 格式。在 Kotlin 2.0.0 中，我们支持 JSON 输出格式，以便更轻松地使用其他工具进行分析。

要为您的构建报告配置 JSON 输出格式，请在您的 `gradle.properties` 文件中声明以下属性：

```none
kotlin.build.report.output=json

// 存储您的构建报告的目录
kotlin.build.report.json.directory=my/directory/path
```

或者，您可以运行以下命令：

```shell
./gradlew assemble -Pkotlin.build.report.output=json -Pkotlin.build.report.json.directory="my/directory/path"
``` 

配置完成后，Gradle 会在您指定的目录中生成构建报告，名称为：`${project_name}-date-time-<sequence_number>.json`。

以下是一个 JSON 输出格式构建报告的示例片段，其中包含构建指标和聚合指标：

```json
"buildOperationRecord": [
    {
     "path": ":lib:compileKotlin",
      "classFqName": "org.jetbrains.kotlin.gradle.tasks.KotlinCompile_Decorated",
      "startTimeMs": 1714730820601,
      "totalTimeMs": 2724,
      "buildMetrics": {
        "buildTimes": {
          "buildTimesNs": {
            "CLEAR_OUTPUT": 713417,
            "SHRINK_AND_SAVE_CURRENT_CLASSPATH_SNAPSHOT_AFTER_COMPILATION": 19699333,
            "IR_TRANSLATION": 281000000,
            "NON_INCREMENTAL_LOAD_CURRENT_CLASSPATH_SNAPSHOT": 14088042,
            "CALCULATE_OUTPUT_SIZE": 1301500,
            "GRADLE_TASK": 2724000000,
            "COMPILER_INITIALIZATION": 263000000,
            "IR_GENERATION": 74000000,
...
          }
        }
...
 "aggregatedMetrics": {
    "buildTimes": {
      "buildTimesNs": {
        "CLEAR_OUTPUT": 782667,
        "SHRINK_AND_SAVE_CURRENT_CLASSPATH_SNAPSHOT_AFTER_COMPILATION": 22031833,
        "IR_TRANSLATION": 333000000,
        "NON_INCREMENTAL_LOAD_CURRENT_CLASSPATH_SNAPSHOT": 14890292,
        "CALCULATE_OUTPUT_SIZE": 2370750,
        "GRADLE_TASK": 3234000000,
        "COMPILER_INITIALIZATION": 292000000,
        "IR_GENERATION": 89000000,
...
      }
    }
```

### kapt 配置从超配置继承注解处理器

在 Kotlin 2.0.0 之前，如果您想在单独的 Gradle 配置中定义一组公共的注解处理器，并在子项目的 kapt 特定配置中扩展此配置，kapt 会跳过注解处理，因为它找不到任何注解处理器。在 Kotlin 2.0.0 中，kapt 可以成功检测到您的注解处理器上存在间接依赖。

例如，对于使用 [Dagger](https://dagger.dev/) 的子项目，在您的 `build.gradle(.kts)` 文件中，使用以下配置：

```kotlin
val commonAnnotationProcessors by configurations.creating
configurations.named("kapt") { extendsFrom(commonAnnotationProcessors) }

dependencies {
    implementation("com.google.dagger:dagger:2.48.1")
    commonAnnotationProcessors("com.google.dagger:dagger-compiler:2.48.1")
}
```

在此示例中，`commonAnnotationProcessors` Gradle 配置是您希望用于所有项目的公共注解处理配置。您使用 [`extendsFrom()`](https://docs.gradle.org/current/dsl/org.gradle.api.artifacts.Configuration.html#org.gradle.api.artifacts.Configuration:extendsFrom) 方法将 `commonAnnotationProcessors` 添加为超配置。kapt 看到 `commonAnnotationProcessors` Gradle 配置依赖于 Dagger 注解处理器。因此，kapt 在其注解处理配置中包含 Dagger 注解处理器。

感谢 Christoph Loy 的 [实现](https://github.com/JetBrains/kotlin/pull/5198)！

### Kotlin Gradle 插件不再使用弃用的 Gradle 约定

在 Kotlin 2.0.0 之前，如果您使用 Gradle 8.2 或更高版本，Kotlin Gradle 插件会错误地使用在 Gradle 8.2 中已弃用的 Gradle 约定。这导致 Gradle 报告构建弃用。在 Kotlin 2.0.0 中，Kotlin Gradle 插件已更新，在您使用 Gradle 8.2 或更高版本时不再触发这些弃用警告。

## 标准库

此版本为 Kotlin 标准库带来了进一步的稳定性，并使更多现有函数在所有平台上通用：

* [稳定替代 enum 类 values 泛型函数的方法](#stable-replacement-of-the-enum-class-values-generic-function)
* [稳定的 AutoCloseable 接口](#stable-autocloseable-interface)
* [通用的受保护属性 AbstractMutableList.modCount](#common-protected-property-abstractmutablelist-modcount)
* [通用的受保护函数 AbstractMutableList.removeRange](#common-protected-function-abstractmutablelist-removerange)
* [通用的 String.toCharArray(destination)](#common-string-tochararray-destination-function)

### 稳定替代 enum 类 values 泛型函数的方法

在 Kotlin 2.0.0 中，`enumEntries<T>()` 函数达到 [稳定](components-stability.md#stability-levels-explained) 状态。`enumEntries<T>()` 函数是泛型 `enumValues<T>()` 函数的替代品。新函数返回给定枚举类型 `T` 的所有枚举条目的列表。之前引入并稳定了枚举类的 `entries` 属性，以替代合成的 `values()` 函数。有关条目属性的更多信息，请参阅 [Kotlin 1.8.20 的最新变化](whatsnew1820.md#a-modern-and-performant-replacement-of-the-enum-class-values-function)。

> `enumValues<T>()` 函数仍然受支持，但我们建议您改用 `enumEntries<T>()` 函数，因为它的性能影响较小。每次调用 `enumValues<T>()` 时，都会创建一个新数组，而每当您调用 `enumEntries<T>()` 时，每次都会返回同一个列表，这要高效得多。
>
{style="tip"}

例如：

```kotlin
enum class RGB { RED, GREEN, BLUE }

inline fun <reified T : Enum<T>> printAllValues() {
    print(enumEntries<T>().joinToString { it.name })
}

printAllValues<RGB>()
// RED, GREEN, BLUE
```

### 稳定的 AutoCloseable 接口

在 Kotlin 2.0.0 中，通用的 [`AutoCloseable`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin/-auto-closeable/) 接口达到 [稳定](components-stability.md#stability-levels-explained) 状态。它允许您轻松关闭资源，并包含两个有用的函数：

* `use()` 扩展函数，它在选定的资源上执行给定的块函数，然后正确关闭它，无论是否抛出异常。
* `AutoCloseable()` 构造函数，它创建 `AutoCloseable` 接口的实例。

在下面的示例中，我们定义了 `XMLWriter` 接口，并假设有一个实现它的资源。例如，此资源可以是一个打开文件、写入 XML 内容然后关闭它的类：

```kotlin
interface XMLWriter {
    fun document(encoding: String, version: String, content: XMLWriter.() -> Unit)
    fun element(name: String, content: XMLWriter.() -> Unit)
    fun attribute(name: String, value: String)
    fun text(value: String)

    fun flushAndClose()
}

fun writeBooksTo(writer: XMLWriter) {
    val autoCloseable = AutoCloseable { writer.flushAndClose() }
    autoCloseable.use {
        writer.document(encoding = "UTF-8", version = "1.0") {
            element("bookstore") {
                element("book") {
                    attribute("category", "fiction")
                    element("title") { text("Harry Potter and the Prisoner of Azkaban") }
                    element("author") { text("J. K. Rowling") }
                    element("year") { text("1999") }
                    element("price") { text("29.99") }
                }
                element("book") {
                    attribute("category", "programming")
                    element("title") { text("Kotlin in Action") }
                    element("author") { text("Dmitry Jemerov") }
                    element("author") { text("Svetlana Isakova") }
                    element("year") { text("2017") }
                    element("price") { text("25.19") }
                }
            }
        }
    }
}
```

### 通用的受保护属性 AbstractMutableList.modCount

在此版本中，`AbstractMutableList` 接口的 [`modCount`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/-abstract-mutable-list/mod-count.html) `protected` 属性变得通用。以前，`modCount` 属性在每个平台上都可用，但不在通用目标上可用。现在，您可以创建 `AbstractMutableList` 的自定义实现并在通用代码中访问该属性。

该属性跟踪对集合进行的结构修改次数。这包括更改集合大小的操作，或者以可能导致正在进行的迭代返回错误结果的方式更改列表的操作。

在实现自定义列表时，您可以使用 `modCount` 属性来注册和检测并发修改。

### 通用的受保护函数 AbstractMutableList.removeRange

在此版本中，`AbstractMutableList` 接口的 [`removeRange()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/-abstract-mutable-list/remove-range.html) `protected` 函数变得通用。以前，它在每个平台上都可用，但不在通用目标上可用。现在，您可以创建 `AbstractMutableList` 的自定义实现并在通用代码中重写该函数。

该函数按照指定的范围从此列表中移除元素。通过重写此函数，您可以利用自定义实现并提高列表操作的性能。

### 通用的 String.toCharArray(destination) 函数

此版本引入了通用的 [`String.toCharArray(destination)`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.text/to-char-array.html) 函数。以前，它仅在 JVM 上可用。

让我们将其与现有的 [`String.toCharArray()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.text/to-char-array.html) 函数进行比较。它创建一个包含指定字符串字符的新 `CharArray`。然而，新的通用 `String.toCharArray(destination)` 函数将 `String` 字符移动到现有的目标 `CharArray` 中。如果您已经有一个想要填充的缓冲区，这很有用：

```kotlin
fun main() {
    val myString = "Kotlin is awesome!"
    val destinationArray = CharArray(myString.length)

    // 转换字符串并将其存储在 destinationArray 中：
    myString.toCharArray(destinationArray)

    for (char in destinationArray) {
        print("$char ")
        // K o t l i n   i s   a w e s o m e ! 
    }
}
```
{kotlin-runnable="true"}

## 安装 Kotlin 2.0.0

从 IntelliJ IDEA 2023.3 和 Android Studio Iguana (2023.2.1) Canary 15 开始，Kotlin 插件作为捆绑插件包含在您的 IDE 中。这意味着您无法再从 JetBrains Marketplace 安装该插件。

要更新到新的 Kotlin 版本，请在您的构建脚本中将 [Kotlin 版本更改](releases.md#update-to-a-new-kotlin-version)为 2.0.0。