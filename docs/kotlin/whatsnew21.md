[//]: # (title: Kotlin 2.1.0 最新变化)

<web-summary>阅读 Kotlin 2.1.0 发布说明，涵盖新语言功能、Kotlin Multiplatform、JVM、Native、JS 和 Wasm 的更新，以及对 Gradle 和 Maven 的构建工具支持。</web-summary>

_[发布日期：2024 年 11 月 27 日](releases.md#release-history)_

Kotlin 2.1.0 正式发布！以下是本次发布的主要亮点：

* **预览阶段的新语言功能**：[带主语的 `when` 中的守卫条件（guard conditions）](#guard-conditions-in-when-with-a-subject)、[非局部 `break` 和 `continue`](#non-local-break-and-continue) 以及[多美元符号字符串插值](#multi-dollar-string-interpolation)。
* **K2 编译器更新**：[更灵活的编译器检查](#extra-compiler-checks)以及[对 kapt 实现的改进](#improved-k2-kapt-implementation)。
* **Kotlin Multiplatform**：引入[对 Swift 导出的基础支持](#basic-support-for-swift-export)、[用于编译器选项的稳定版 Gradle DSL](#new-gradle-dsl-for-compiler-options-in-multiplatform-projects-promoted-to-stable) 等。
* **Kotlin/Native**：[改进了对 `iosArm64` 的支持](#iosarm64-promoted-to-tier-1)及其他更新。
* **Kotlin/Wasm**：多项更新，包括[支持增量编译](#support-for-incremental-compilation)。
* **Gradle 支持**：[改进了与较新版本 Gradle 和 Android Gradle 插件的兼容性](#gradle-improvements)，以及[针对 Kotlin Gradle 插件 API 的更新](#new-api-for-kotlin-gradle-plugin-extensions)。
* **文档**：[对 Kotlin 文档进行了重大改进](#documentation-updates)。

> 有关 Kotlin 发布周期的信息，请参阅 [Kotlin 发布流程](releases.md)。
>
{style="tip"}

## IDE 支持 {id="ide-support"}

支持 2.1.0 的 Kotlin 插件已捆绑在最新的 IntelliJ IDEA 和 Android Studio 中。
您无需在 IDE 中手动更新 Kotlin 插件。
只需在构建脚本中将 Kotlin 版本更改为 2.1.0 即可。

有关详情，请参阅[更新到新的 Kotlin 版本](releases.md#update-to-a-new-kotlin-version)。

## 语言 {id="language"}

继推出配备 K2 编译器的 Kotlin 2.0.0 之后，JetBrains 团队正专注于通过引入新功能来改进语言本身。
在此版本中，我们很高兴宣布多项全新的语言设计改进。

这些功能目前处于预览阶段，我们鼓励您体验并分享反馈：

* [带主语的 `when` 中的守卫条件](#guard-conditions-in-when-with-a-subject)
* [非局部 `break` 和 `continue`](#non-local-break-and-continue)
* [多美元符号插值：改进字符串文字中 `$` 的处理](#multi-dollar-string-interpolation)

> 在最新版且启用了 K2 模式的 IntelliJ IDEA 2024.3 中，所有上述功能均已获得 IDE 支持。
>
> 详细了解请参阅 [IntelliJ IDEA 2024.3 博客文章](https://blog.jetbrains.com/idea/2024/11/intellij-idea-2024-3/)。
>
{style="tip"}

[查看 Kotlin 语言设计功能和提案的完整列表](kotlin-language-features-and-proposals.md)。

本次发布还带来了以下语言更新：

* [](#support-for-requiring-opt-in-to-extend-apis)
* [](#improved-overload-resolution-for-functions-with-generic-types)
* [](#improved-exhaustiveness-checks-for-when-expressions-with-sealed-classes)

### 带主语的 when 中的守卫条件 {id="guard-conditions-in-when-with-a-subject"}

> 该功能处于[预览阶段](kotlin-evolution-principles.md#pre-stable-features)，
> 需要显式选择加入（详见下文）。
> 
> 欢迎在 [YouTrack](https://youtrack.jetbrains.com/issue/KT-71140) 中向我们提供反馈。
>
{style="warning"}

从 2.1.0 开始，您可以在带有主语的 `when` 表达式或语句中使用守卫条件（guard conditions）。

守卫条件允许您为 `when` 表达式的分支包含多个条件，
使复杂的控制流更加清晰明了、简洁凝练，同时展平代码结构。

要在分支中添加守卫条件，请将其放在主条件之后，并用 `if` 分隔：

```kotlin
sealed interface Animal {
    data class Cat(val mouseHunter: Boolean) : Animal {
        fun feedCat() {}
    }

    data class Dog(val breed: String) : Animal {
        fun feedDog() {}
    }
}

fun feedAnimal(animal: Animal) {
    when (animal) {
        // 仅包含主条件的分支。当 `animal` 为 `Dog` 时调用 `feedDog()`
        is Animal.Dog -> animal.feedDog()
        // 同时包含主条件和守卫条件的分支。当 `animal` 为 `Cat` 且不是 `mouseHunter` 时调用 `feedCat()`
        is Animal.Cat if !animal.mouseHunter -> animal.feedCat()
        // 如果以上条件均不匹配，则输出 "Unknown animal"
        else -> println("Unknown animal")
    }
}
```

在单个 `when` 表达式中，您可以将带有守卫条件的分支与不带守卫条件的分支结合使用。
带有守卫条件的分支中的代码仅在主条件和守卫条件均为 `true` 时才会执行。
如果主条件不匹配，则不会对守卫条件求值。
此外，守卫条件还支持 `else if`。

要在项目中启用守卫条件，请在命令行中使用以下编译器选项：

```bash
kotlinc -Xwhen-guards main.kt
```

或者将其添加到 Gradle 构建文件的 `compilerOptions {}` 代码块中：

```kotlin
// build.gradle.kts
kotlin {
    compilerOptions {
        freeCompilerArgs.add("-Xwhen-guards")
    }
}
```

### 非局部 break 和 continue {id="non-local-break-and-continue"}

> 该功能处于[预览阶段](kotlin-evolution-principles.md#pre-stable-features)，
> 需要显式选择加入（详见下文）。
> 
> 欢迎在 [YouTrack](https://youtrack.jetbrains.com/issue/KT-1436) 中向我们提供反馈。
>
{style="warning"}

Kotlin 2.1.0 预览了另一项备受期待的功能：使用非局部 `break` 和 `continue` 的能力。
此功能扩展了您在内联函数作用域内可用的工具集，并减少了项目中的模板代码。

此前，您只能使用非局部 return。
现在，Kotlin 还支持以非局部方式使用 `break` 和 `continue` [跳转表达式](returns.md)。
这意味着您可以在传递给封闭循环的内联函数的 lambda 表达式内部应用它们：

```kotlin
fun processList(elements: List<Int>): Boolean {
    for (element in elements) {
        val variable = element.nullableMethod() ?: run {
            log.warning("Element is null or invalid, continuing...")
            continue
        }
        if (variable == 0) return true // 如果 variable 为 0，则返回 true
    }
    return false
}
```

要在项目中试用该功能，请在命令行中使用 `-Xnon-local-break-continue` 编译器选项：

```bash
kotlinc -Xnon-local-break-continue main.kt
```

或者将其添加到 Gradle 构建文件的 `compilerOptions {}` 代码块中：

```kotlin
// build.gradle.kts
kotlin {
    compilerOptions {
        freeCompilerArgs.add("-Xnon-local-break-continue")
    }
}
```

我们计划在未来的 Kotlin 版本中将此功能转为稳定版（Stable）。
如果您在使用非局部 `break` 和 `continue` 时遇到任何问题，
请向我们的[问题跟踪器](https://youtrack.jetbrains.com/issue/KT-1436)报告。

### 多美元符号字符串插值 {id="multi-dollar-string-interpolation"}

> 该功能处于[预览阶段](kotlin-evolution-principles.md#pre-stable-features)，
> 需要显式选择加入（详见下文）。
> 
> 欢迎在 [YouTrack](https://youtrack.jetbrains.com/issue/KT-2425) 中向我们提供反馈。
>
{style="warning"}

Kotlin 2.1.0 引入了对多美元符号字符串插值的支持，
改进了字符串文字中美元符号（`$`）的处理方式。
此功能在需要多个美元符号的上下文中非常有用，
例如模板引擎、JSON 架构或其他数据格式。

Kotlin 中的字符串插值使用单个美元符号。
然而，在字符串中使用字面量美元符号（在财务数据和模板系统中很常见）以往需要类似 `${'$'}` 的变通方法。
启用多美元符号插值功能后，您可以配置由多少个美元符号来触发插值，
少于该数量的美元符号将被视为普通字符串文字。

以下是一个生成带有 `$` 占位符的 JSON 架构多行字符串的示例：

```kotlin
val KClass<*>.jsonSchema : String
    get() = $$"""
    {
      "$schema": "https://json-schema.org/draft/2020-12/schema",
      "$id": "https://example.com/product.schema.json",
      "$dynamicAnchor": "meta"
      "title": "$${simpleName ?: qualifiedName ?: "unknown"}",
      "type": "object"
    }
    """
```

在此示例中，开头的 `$$` 表示需要**两个美元符号**（`$$`）才能触发插值。
它可以防止 `$schema`、`$id` 和 `$dynamicAnchor` 被解释为插值标记。

在与使用美元符号作为占位符语法的系统进行交互时，这种方法尤其有用。

要启用该功能，请在命令行中使用以下编译器选项：

```bash
kotlinc -Xmulti-dollar-interpolation main.kt
```

或者，更新 Gradle 构建文件的 `compilerOptions {}` 代码块：

```kotlin
// build.gradle.kts
kotlin {
    compilerOptions {
        freeCompilerArgs.add("-Xmulti-dollar-interpolation")
    }
}
```

如果您的代码已在使用带单个美元符号的标准字符串插值，则无需进行任何更改。
每当需要在字符串中使用字面量美元符号时，您都可以使用 `$$`。

### 支持要求显式选择加入以扩展 API {id="support-for-requiring-opt-in-to-extend-apis"}

Kotlin 2.1.0 引入了 [`@SubclassOptInRequired`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin/-subclass-opt-in-required/) 注解，
允许库作者在用户实现实验性接口或扩展实验性类之前，要求其显式选择加入（opt-in）。

当库 API 足够稳定可供直接使用，但未来可能会通过新增抽象函数进行演进（从而导致继承不稳定）时，此功能非常有用。

要向 API 元素添加选择加入要求，请使用引用了注解类的 `@SubclassOptInRequired` 注解：

```kotlin
@RequiresOptIn(
level = RequiresOptIn.Level.WARNING,
message = "Interfaces in this library are experimental"
)
annotation class UnstableApi()

@SubclassOptInRequired(UnstableApi::class)
interface CoreLibraryApi
```

在此示例中，用户在实现 `CoreLibraryApi` 接口之前必须选择加入。
用户可以这样选择加入：

```kotlin
@OptIn(UnstableApi::class)
interface MyImplementation: CoreLibraryApi
```

> 当您使用 `@SubclassOptInRequired` 注解要求选择加入时，
> 该要求不会传播到任何[内部类或嵌套类](nested-classes.md)。
>
{style="note"}

有关如何在您的 API 中使用 `@SubclassOptInRequired` 注解的实际示例，
请查看 `kotlinx.coroutines` 库中的 [`SharedFlow`](https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines.flow/-shared-flow/) 接口。

### 改进带泛型类型函数的重载解析 {id="improved-overload-resolution-for-functions-with-generic-types"}

此前，如果某个函数存在多个重载，其中一些在同一位置包含泛型类型的值形参，
而另一些则包含函数类型，那么解析行为有时可能会出现不一致。

这会导致依据重载是成员函数还是扩展函数而表现出不同的行为。
例如：

```kotlin
class KeyValueStore<K, V> {
    fun store(key: K, value: V) {} // 1
    fun store(key: K, lazyValue: () -> V) {} // 2
}

fun <K, V> KeyValueStore<K, V>.storeExtension(key: K, value: V) {} // 1 
fun <K, V> KeyValueStore<K, V>.storeExtension(key: K, lazyValue: () -> V) {} // 2

fun test(kvs: KeyValueStore<String, Int>) {
    // 成员函数
    kvs.store("", 1)    // 解析到 1
    kvs.store("") { 1 } // 解析到 2

    // 扩展函数
    kvs.storeExtension("", 1)    // 解析到 1
    kvs.storeExtension("") { 1 } // 无法解析
}
```

在此示例中，`KeyValueStore` 类针对 `store()` 函数提供了两个重载：
一个重载的函数形参具有泛型类型 `K` 和 `V`，
另一个重载则包含一个返回泛型类型 `V` 的 lambda 函数。
同样，扩展函数 `storeExtension()` 也有两个重载。

当在调用 `store()` 函数时传入或不传入 lambda 函数，
编译器都能成功解析到正确的重载。
然而，当使用 lambda 函数调用扩展函数 `storeExtension()` 时，
编译器却无法解析到正确的重载，因为它错误地认为两个重载均适用。

为了解决此问题，我们引入了一种新的启发式方法，以便编译器在泛型类型的函数形参无法根据其他实参的信息接受 lambda 函数时，
舍弃可能适用的重载。
此项更改使成员函数和扩展函数的行为保持一致，
并且在 Kotlin 2.1.0 中默认启用。

### 改进带密封类的 when 表达式的穷尽性检查 {id="improved-exhaustiveness-checks-for-when-expressions-with-sealed-classes"}

在早期版本的 Kotlin 中，对于具有密封上界的类型形参，即使 `sealed class` 层次结构中的所有情况均已被覆盖，
编译器仍要求在 `when` 表达式中包含 `else` 分支。
这一行为在 Kotlin 2.1.0 中得到了处理和改进，
穷尽性检查变得更加强大，允许您移除多余的 `else` 分支，
使 `when` 表达式更清晰、更直观。

以下示例演示了此项更改：

```kotlin
sealed class Result
object Error: Result()
class Success(val value: String): Result()

fun <T : Result> render(result: T) = when (result) {
    Error -> "Error!"
    is Success -> result.value
    // 不需要 else 分支
}
```

## Kotlin K2 编译器 {id="kotlin-k2-compiler"}

在 Kotlin 2.1.0 中，K2 编译器在[处理编译器检查](#extra-compiler-checks)和[警告](#global-warning-suppression)时提供了[更高的灵活性](#extra-compiler-checks)，
同时[改进了对 kapt 插件的支持](#improved-k2-kapt-implementation)。

### 额外的编译器检查 {id="extra-compiler-checks"}

在 Kotlin 2.1.0 中，您现在可以在 K2 编译器中启用额外的检查。
这些额外的声明、表达式和类型检查通常对编译并非至关重要，
但如果您希望对以下情况进行验证，它们仍然非常有用：

| 检查类型 | 说明 |
|---|---|
| `REDUNDANT_NULLABLE` | 使用了 `Boolean??` 而非 `Boolean?` |
| `PLATFORM_CLASS_MAPPED_TO_KOTLIN` | 使用了 `java.lang.String` 而非 `kotlin.String` |
| `ARRAY_EQUALITY_OPERATOR_CAN_BE_REPLACED_WITH_EQUALS` | 使用了 `arrayOf("") == arrayOf("")` 而非 `arrayOf("").contentEquals(arrayOf(""))` |
| `REDUNDANT_CALL_OF_CONVERSION_METHOD` | 使用了 `42.toInt()` 而非 `42` |
| `USELESS_CALL_ON_NOT_NULL` | 使用了 `"".orEmpty()` 而非 `""` |
| `REDUNDANT_SINGLE_EXPRESSION_STRING_TEMPLATE` | 使用了 `"$string"` 而非 `string` |
| `UNUSED_ANONYMOUS_PARAMETER` | 在 lambda 表达式中传入了形参但从未使用 |
| `REDUNDANT_VISIBILITY_MODIFIER` | 使用了 `public class Klass` 而非 `class Klass` |
| `REDUNDANT_MODALITY_MODIFIER` | 使用了 `final class Klass` 而非 `class Klass` |
| `REDUNDANT_SETTER_PARAMETER_TYPE` | 使用了 `set(value: Int)` 而非 `set(value)` |
| `CAN_BE_VAL` | 定义了 `var local = 0` 但从未重新赋值，可以替换为 `val local = 42` |
| `ASSIGNED_VALUE_IS_NEVER_READ` | 定义了 `val local = 42` 但在后续代码中从未使用 |
| `UNUSED_VARIABLE` | 定义了 `val local = 0` 但在代码中从未使用 |
| `REDUNDANT_RETURN_UNIT_TYPE` | 使用了 `fun foo(): Unit {}` 而非 `fun foo() {}` |
| `UNREACHABLE_CODE` | 存在代码语句但永远无法被执行 |

如果检查项判定为 true，您将收到一条编译器警告，其中包含有关如何修复该问题的建议。

额外的检查默认处于禁用状态。
要启用它们，请在命令行中使用 `-Wextra` 编译器选项，
或者在 Gradle 构建文件的 `compilerOptions {}` 代码块中指定 `extraWarnings`：

```kotlin
// build.gradle.kts
kotlin {
    compilerOptions {
        extraWarnings.set(true)
    }
}
```

有关如何定义和使用编译器选项的更多信息，
请参阅 [Kotlin Gradle 插件中的编译器选项](gradle-compiler-options.md)。

### 全局抑制警告 {id="global-warning-suppression"}

在 2.1.0 中，Kotlin 编译器迎来了广受期待的功能——全局抑制警告的能力。

您现在可以通过在命令行中使用 `-Xsuppress-warning=WARNING_NAME` 语法，
或者在构建文件的 `compilerOptions {}` 代码块中使用 `freeCompilerArgs` 属性，在整个项目中抑制特定警告。

例如，如果您在项目中启用了[额外的编译器检查](#extra-compiler-checks)但希望抑制其中某一个，请使用：

```kotlin
// build.gradle.kts
kotlin {
    compilerOptions {
        extraWarnings.set(true)
        freeCompilerArgs.add("-Xsuppress-warning=CAN_BE_VAL")
    }
}
```

如果您想抑制某个警告但不知道其名称，请选中该元素并点击灯泡图标（或使用快捷键 <shortcut>Cmd + Enter</shortcut>/<shortcut>Alt + Enter</shortcut>）：

![警告名称意图](warning-name-intention.png){width=500}

这一新的编译器选项目前处于[实验性阶段](components-stability.md#stability-levels-explained)。
此外还需注意以下细节：

* 不允许抑制错误（Error）。
* 如果传入未知的警告名称，编译将报错。
* 您可以一次指定多个警告：
  
   <tabs>
   <tab title="命令行">

   ```bash
   kotlinc -Xsuppress-warning=NOTHING_TO_INLINE -Xsuppress-warning=NO_TAIL_CALLS_FOUND main.kt
   ```

   </tab>
   <tab title="构建文件">

   ```kotlin
   // build.gradle.kts
   kotlin {
       compilerOptions {
           freeCompilerArgs.addAll(
               listOf(
                   "-Xsuppress-warning=NOTHING_TO_INLINE",
                   "-Xsuppress-warning=NO_TAIL_CALLS_FOUND"
               )
           )
       }
   }
   ```

   </tab>
   </tabs>

### 改进的 K2 kapt 实现 {id="improved-k2-kapt-implementation"}

> 适用于 K2 编译器的 kapt 插件（K2 kapt）目前处于 [Alpha 阶段](components-stability.md#stability-levels-explained)。
> 它可能会随时发生更改。
> 
> 欢迎在 [YouTrack](https://youtrack.jetbrains.com/issue/KT-71439/K2-kapt-feedback) 中向我们提供反馈。
>
{style="warning"}

目前，使用 [kapt](kapt.md) 插件的项目默认使用 K1 编译器，
支持最高到 1.9 的 Kotlin 版本。

在 Kotlin 1.9.20 中，我们推出了基于 K2 编译器的 kapt 插件实验性实现（K2 kapt）。
现在，我们对 K2 kapt 的内部实现进行了改进，以缓解技术和性能问题。

虽然新的 K2 kapt 实现没有引入新功能，
但与之前的 K2 kapt 实现相比，其性能得到了显著提升。
此外，K2 kapt 插件的行为现在更加贴近 K1 kapt。

要使用新的 K2 kapt 插件实现，其启用方式与先前的 K2 kapt 插件相同。
只需在项目的 `gradle.properties` 文件中添加以下选项：

```kotlin
kapt.use.k2=true
```

在后续版本中，K2 kapt 实现将替代 K1 kapt 成为默认启用项，
届时您将不再需要手动启用。

在该新实现稳定之前，我们非常期待收到您的[反馈](https://youtrack.jetbrains.com/issue/KT-71439/K2-kapt-feedback)。

### 解决无符号类型与非基元类型之间的重载冲突 {id="resolution-for-overload-conflicts-between-unsigned-and-non-primitive-types"}

此版本解决了早期版本中针对无符号类型和非基元类型进行函数重载时可能出现的重载冲突解析问题，
如下例所示：

#### 重载的扩展函数 {id="overloaded-extension-functions"}

```kotlin
fun Any.doStuff() = "Any"
fun UByte.doStuff() = "UByte"

fun main() {
    val uByte: UByte = UByte.MIN_VALUE
    uByte.doStuff() // 在 Kotlin 2.1.0 之前会出现重载解析多义性
}
```

在较早版本中，调用 `uByte.doStuff()` 会导致歧义，因为 `Any` 和 `UByte` 扩展均适用。

#### 重载的顶级函数 {id="overloaded-top-level-functions"}

```kotlin
fun doStuff(value: Any) = "Any"
fun doStuff(value: UByte) = "UByte"

fun main() {
    val uByte: UByte = UByte.MIN_VALUE
    doStuff(uByte) // 在 Kotlin 2.1.0 之前会出现重载解析多义性
}
```

类似地，对 `doStuff(uByte)` 的调用也是模棱两可的，因为编译器无法确定是使用 `Any` 还是 `UByte` 版本。
在 2.1.0 中，编译器现在可以正确处理这些情况，通过优先选用更具体的类型（在此例中为 `UByte`）来消除歧义。

## Kotlin/JVM {id="kotlin-jvm"}

从 2.1.0 版本开始，编译器可以生成包含 Java 23 字节码的类。

### 将 JSpecify 为 null 性不匹配诊断级别更改为严格（strict） {id="change-of-jspecify-nullability-mismatch-diagnostics-severity-to-strict"}

Kotlin 2.1.0 强化了对来自 `org.jspecify.annotations` 的为 null 性注解的严格处理，
提升了 Java 互操作的类型安全性。

受影响的为 null 性注解如下：

* `org.jspecify.annotations.Nullable`
* `org.jspecify.annotations.NonNull`
* `org.jspecify.annotations.NullMarked`
* `org.jspecify.nullness` 中的旧版注解（JSpecify 0.2 及更早版本）

从 Kotlin 2.1.0 开始，为 null 性不匹配的默认严重级别已从警告提升为错误。
这确保了在类型检查期间强制执行 `@NonNull` 和 `@Nullable` 等注解，
从而防止运行时出现意外的为 null 性问题。

`@NullMarked` 注解还会影响其作用域内所有成员的为 null 性，
使得在处理带有注解的 Java 代码时行为更加可预测。

以下示例展示了全新的默认行为：

```java
// Java
import org.jspecify.annotations.*;
public class SomeJavaClass {
    @NonNull
    public String foo() { //...
    }

    @Nullable
    public String bar() { //...
    }
}
```

```kotlin
// Kotlin
fun test(sjc: SomeJavaClass) {
    // 访问非 null 结果，允许执行
    sjc.foo().length

    // 在默认的严格模式下会报错，因为结果是可空的
    // 为避免报错，请改用 ?.length
    sjc.bar().length
}
```

您可以手动控制这些注解的诊断严重级别。
为此，请使用 `-Xnullability-annotations` 编译器选项选择一种模式：

* `ignore`：忽略为 null 性不匹配。
* `warning`：针对为 null 性不匹配报告警告。
* `strict`：针对为 null 性不匹配报告错误（默认模式）。

有关更多信息，请参阅[为 null 性注解](java-interop.md#nullability-annotations)。

## Kotlin Multiplatform {id="kotlin-multiplatform"}

Kotlin 2.1.0 引入了[对 Swift 导出的基础支持](#basic-support-for-swift-export)，并使得[从任意主机发布 Kotlin Multiplatform 库更加容易](#ability-to-publish-kotlin-libraries-from-any-host)。
此外，该版本还专注于围绕 Gradle 进行改进，稳定了[用于配置编译器选项的新 DSL](#new-gradle-dsl-for-compiler-options-in-multiplatform-projects-promoted-to-stable)，
并带来了[隔离项目（Isolated Projects）功能的预览](#preview-gradle-s-isolated-projects-in-kotlin-multiplatform)。

### 用于多平台项目中编译器选项的新 Gradle DSL 转为稳定版 {id="new-gradle-dsl-for-compiler-options-in-multiplatform-projects-promoted-to-stable"}

在 Kotlin 2.0.0 中，[我们引入了一个新的实验性 Gradle DSL](whatsnew20.md#new-gradle-dsl-for-compiler-options-in-multiplatform-projects)，
用于简化跨多平台项目的编译器选项配置。
在 Kotlin 2.1.0 中，该 DSL 已提升为稳定版（Stable）。

现在整体项目配置分为三个层级。最高层是扩展（extension）级别，
其次是目标（target）级别，最低层是编译单元（compilation unit，通常是编译任务）：

![Kotlin 编译器选项层级](compiler-options-levels.svg){width=700}

要详细了解不同级别以及如何在它们之间配置编译器选项，
请参阅[编译器选项](https://kotlinlang.org/docs/multiplatform/multiplatform-dsl-reference.html#compiler-options)。

### 预览 Kotlin Multiplatform 中 Gradle 的隔离项目功能 {id="preview-gradle-s-isolated-projects-in-kotlin-multiplatform"}

> 该功能处于[实验性阶段](components-stability.md#stability-levels-explained)，目前在 Gradle 中处于 pre-Alpha 状态。
> 请仅在 Gradle 8.10 版本下使用，且仅用于评估目的。该功能可能会随时废弃或更改。
> 
> 欢迎在 [YouTrack](https://youtrack.jetbrains.com/issue/KT-57279/Support-Gradle-Project-Isolation-Feature-for-Kotlin-Multiplatform) 中向我们提供反馈。
> 需要显式选择加入（详见下文）。
>
{style="warning"}

在 Kotlin 2.1.0 中，
您可以在多平台项目中预览 Gradle 的[隔离项目（Isolated Projects）](https://docs.gradle.org/current/userguide/isolated_projects.html)功能。

Gradle 中的隔离项目功能通过将各个 Gradle 项目的配置彼此“隔离”来提高构建性能。
每个项目的构建逻辑都被限制为无法直接访问其他项目的可变状态，
从而使它们能够安全地并行运行。
为了支持此功能，我们对 Kotlin Gradle 插件的模型进行了某些更改，
并希望在此预览阶段了解您的使用体验。

启用 Kotlin Gradle 插件新模型的方法有两种：

* 方式 1：**在不启用隔离项目的情况下测试兼容性**——
  若要在不启用“隔离项目”功能的情况下检查与 Kotlin Gradle 插件新模型的兼容性，
  请在项目的 `gradle.properties` 文件中添加以下 Gradle 属性：

  ```none
  # gradle.properties
  kotlin.kmp.isolated-projects.support=enable
  ```

* 方式 2：**在启用隔离项目的情况下进行测试**——
  在 Gradle 中启用“隔离项目”功能会自动将 Kotlin Gradle 插件配置为使用新模型。
  要启用隔离项目功能，请[设置系统属性](https://docs.gradle.org/current/userguide/isolated_projects.html#how_do_i_use_it)。
  在这种情况下，您无需在项目中为 Kotlin Gradle 插件添加上述 Gradle 属性。

### 对 Swift 导出的基础支持 {id="basic-support-for-swift-export"}

> 该功能目前处于早期开发阶段。可能会随时废弃或更改。
> 需要显式选择加入（详见下文），且您应仅将其用于评估目的。
> 欢迎在 [YouTrack](https://kotl.in/issue) 中向我们提供反馈。
> 
{style="warning"}

2.1.0 版本迈出了在 Kotlin 中提供 Swift 导出支持的第一步，
允许您直接将 Kotlin 源码导出为 Swift 接口，而无需使用 Objective-C 头文件。
这将使面向 Apple 目标的多平台开发更加容易。

目前的基础支持包括以下能力：

* 将多个 Gradle 模块从 Kotlin 直接导出到 Swift。
* 使用 `moduleName` 属性自定义 Swift 模块名称。
* 使用 `flattenPackage` 属性为包结构设置折叠规则。

您可以将以下构建文件用作在项目中设置 Swift 导出的起点：

```kotlin
// build.gradle.kts 
kotlin {

    iosX64()
    iosArm64()
    iosSimulatorArm64()

    @OptIn(ExperimentalSwiftExportDsl::class)
    swiftExport {
        // 根模块名称
        moduleName = "Shared"

        // 折叠规则
        // 从生成的 Swift 代码中移除包名前缀
        flattenPackage = "com.example.sandbox"

        // 导出外部模块
        export(project(":subproject")) {
            // 导出的模块名称
            moduleName = "Subproject"
            // 折叠导出依赖项规则
            flattenPackage = "com.subproject.library"
        }
    }
}
```

您还可以克隆我们已配置好 Swift 导出的[公开示例](https://github.com/Kotlin/swift-export-sample)。

编译器会自动生成所有必需的文件（包括 `swiftmodule` 文件、静态 `a` 库、头文件以及 `modulemap` 文件）并将其复制到应用程序的构建目录中，
您可以从 Xcode 访问该目录。

#### 如何启用 Swift 导出 {id="how-to-enable-swift-export"}

请注意，该功能目前仅处于早期开发阶段。

Swift 导出目前适用于使用[直接集成](https://kotlinlang.org/docs/multiplatform/multiplatform-direct-integration.html)将 iOS 框架连接到 Xcode 项目的项目。
这是在 Android Studio 中或通过 [Web 向导](https://kmp.jetbrains.com/)创建的 Kotlin Multiplatform 项目的标准配置。

要在项目中试用 Swift 导出：

1. 将以下 Gradle 选项添加到 `gradle.properties` 文件中：

   ```none
   # gradle.properties
   kotlin.experimental.swift-export.enabled=true
   ```

2. 在 Xcode 中打开项目设置。
3. 在 **Build Phases** 选项卡上，找到带有 `embedAndSignAppleFrameworkForXcode` 任务的 **Run Script** 阶段。
4. 调整该脚本，以便在运行脚本阶段改为使用 `embedSwiftExportForXcode` 任务：

   ```bash
   ./gradlew :<Shared module name>:embedSwiftExportForXcode
   ```

   ![添加 Swift 导出脚本](xcode-swift-export-run-script-phase.png){width=700}

#### 针对 Swift 导出留下反馈 {id="leave-feedback-on-swift-export"}

我们计划在未来的 Kotlin 版本中扩展并稳定 Swift 导出支持。
请在[此 YouTrack issue](https://youtrack.jetbrains.com/issue/KT-64572) 中留下您的反馈。

### 能够从任意主机发布 Kotlin 库 {id="ability-to-publish-kotlin-libraries-from-any-host"}

> 该功能目前处于[实验性阶段](components-stability.md#stability-levels-explained)。
> 需要显式选择加入（详见下文），且您应仅将其用于评估目的。
> 欢迎在 [YouTrack](https://youtrack.jetbrains.com/issue/KT-71290) 中向我们提供反馈。
>
{style="warning"}

Kotlin 编译器会生成用于发布 Kotlin 库的 `.klib` 构件。
此前，您可以从任何主机获取所需的构件，但面向 Apple 平台的目标除外——它们需要 Mac 机器。
这给针对 iOS、macOS、tvOS 和 watchOS 目标的 Kotlin Multiplatform 项目带来了特殊限制。

Kotlin 2.1.0 消除了这一限制，新增了对交叉编译的支持。
现在，您可以使用任何[受支持的主机](native-target-support.md#hosts)来生成 `.klib` 构件，
这将极大简化 Kotlin 和 Kotlin Multiplatform 库的发布流程。

#### 如何启用从任意主机发布库 {id="how-to-enable-publishing-libraries-from-any-host"}

要在项目中尝试交叉编译，请在 `gradle.properties` 文件中添加以下二进制选项：

```none
# gradle.properties
kotlin.native.enableKlibsCrossCompilation=true
```

此功能目前处于实验性阶段，存在一些限制。在以下情况下，您仍然需要使用 Mac 机器：

* 您的库具有 [cinterop 依赖项](native-c-interop.md)。
* 您的项目中配置了 [CocoaPods 集成](https://kotlinlang.org/docs/multiplatform/multiplatform-cocoapods-overview.html)。
* 您需要为 Apple 目标构建或测试[最终二进制文件](https://kotlinlang.org/docs/multiplatform/multiplatform-build-native-binaries.html)。

#### 针对从任意主机发布库留下反馈 {id="leave-feedback-on-publishing-libraries-from-any-host"}

我们计划在未来的 Kotlin 版本中稳定此功能并进一步改进库发布体验。
请在我们的问题跟踪器 [YouTrack](https://youtrack.jetbrains.com/issue/KT-71290) 中留下您的反馈。

有关更多信息，请参阅[发布多平台库](https://kotlinlang.org/docs/multiplatform/multiplatform-publish-lib-setup.html)。

### 支持未打包的 klib {id="support-for-non-packed-klibs"}

Kotlin 2.1.0 支持生成未打包的 `.klib` 文件构件。
这使您可以选择直接配置对 klib 的依赖项，而无需先将其解压。

此更改还可以提升性能，
缩短 Kotlin/Wasm、Kotlin/JS 和 Kotlin/Native 项目中的编译和链接时间。

例如，
我们的基准测试显示，在包含 1 个链接任务和 10 个编译任务的项目中，总构建时间的性能提升了大约 3%
（该项目构建依赖于 9 个简化项目的单个原生可执行二进制文件）。
不过，对构建时间的实际影响取决于子项目的数量及其各自的规模。

#### 如何配置您的项目 {id="how-to-set-up-your-project"}

默认情况下，Kotlin 编译和链接任务现在已配置为使用新的未打包构件。

如果您设置了用于解析 klib 的自定义构建逻辑，并希望使用新的未解包构件，
则需要在 Gradle 构建文件中显式指定首选的 klib 软件包解析变体：

```kotlin
// build.gradle.kts
import org.jetbrains.kotlin.gradle.plugin.attributes.KlibPackaging
// ...
val resolvableConfiguration = configurations.resolvable("resolvable") {

    // 针对新的未打包配置：
    attributes.attribute(KlibPackaging.ATTRIBUTE, project.objects.named(KlibPackaging.NON_PACKED))

    // 针对先前的已打包配置：
    attributes.attribute(KlibPackaging.ATTRIBUTE, project.objects.named(KlibPackaging.PACKED))
}
```

未打包的 `.klib` 文件生成在项目构建目录中与先前打包文件相同的路径下。
相应地，打包后的 klib 现在位于 `build/libs` 目录中。

如果未指定任何属性，则使用打包变体。
您可以使用以下控制台命令查看可用属性和变体的列表：

```shell
./gradlew outgoingVariants
```

欢迎在 [YouTrack](https://kotl.in/issue) 中针对此功能留下您的反馈。

### 进一步弃用旧版 `android` 目标 {id="further-deprecation-of-old-android-target"}

在 Kotlin 2.1.0 中，对旧版 `android` 目标名称的弃用警告已提升为错误。

目前，我们建议在面向 Android 的 Kotlin Multiplatform 项目中使用 `androidTarget` 选项。
这是一个临时解决方案，目的是为即将推出的来自 Google 的 Android/KMP 插件让出 `android` 名称。

当新插件可用时，我们将提供进一步的迁移说明。
来自 Google 的新 DSL 将成为 Kotlin Multiplatform 中 Android 目标支持的首选选项。

有关更多信息，
请参阅 [Kotlin Multiplatform 兼容性指南](https://kotlinlang.org/docs/multiplatform/multiplatform-compatibility-guide.html#rename-of-android-target-to-androidtarget)。

### 放弃对声明同类型多个目标的支持 {id="dropped-support-for-declaring-multiple-targets-of-the-same-type"}

在 Kotlin 2.1.0 之前，您可以在多平台项目中声明相同类型的多个目标。
然而，这使得区分各个目标以及有效支持共享源集变得非常困难。
在大多数情况下，使用更简单的设置（例如使用单独的 Gradle 项目）效果更好。
有关详细指南和迁移示例，
请参阅 Kotlin Multiplatform 兼容性指南中的[声明多个类似目标](https://kotlinlang.org/docs/multiplatform/multiplatform-compatibility-guide.html#declaring-several-similar-targets)。

从 Kotlin 1.9.20 开始，如果您在多平台项目中声明相同类型的多个目标，就会触发弃用警告。
在 Kotlin 2.1.0 中，除 Kotlin/JS 目标外，针对所有目标的该弃用警告现已升级为错误。
若想详细了解 Kotlin/JS 目标为何豁免，
请参阅 [YouTrack 中的此问题](https://youtrack.jetbrains.com/issue/KT-47038/KJS-MPP-Split-JS-target-into-JsBrowser-and-JsNode)。

## Kotlin/Native {id="kotlin-native"}

Kotlin 2.1.0 包含[对 `iosArm64` 目标支持的升级](#iosarm64-promoted-to-tier-1)、[改进的 cinterop 缓存流程](#changes-to-caching-in-cinterop)及其他更新。

### iosArm64 提升至第一层级（Tier 1） {id="iosarm64-promoted-to-tier-1"}

对 [Kotlin Multiplatform](https://kotlinlang.org/docs/multiplatform/get-started.html) 开发至关重要的 `iosArm64` 目标已被提升至 Tier 1。这是 Kotlin/Native 编译器中的最高支持级别。

这意味着该目标会在 CI 流水线上接受定期测试，以确保其能够编译并运行。
我们还会在编译器各版本之间为该目标提供源代码和二进制兼容性保障。

有关目标层级的更多信息，请参阅 [Kotlin/Native 目标支持](native-target-support.md)。

### LLVM 从 11.1.0 更新至 16.0.0 {id="llvm-update-from-11-1-0-to-16-0-0"}

在 Kotlin 2.1.0 中，我们将 LLVM 从版本 11.1.0 更新到了 16.0.0。
新版本包含错误修复和安全更新。
在特定情况下，它还能提供编译器优化并加快编译速度。

如果您的项目中有 Linux 目标，
请注意 Kotlin/Native 编译器现在对所有 Linux 目标默认使用 `lld` 链接器。

此更新不会影响您的代码，但如果您遇到任何问题，请向我们的[问题跟踪器](http://kotl.in/issue)报告。

### cinterop 缓存机制的变更 {id="changes-to-caching-in-cinterop"}

在 Kotlin 2.1.0 中，我们对 cinterop 缓存流程进行了调整。它不再具备
[`CacheableTask`](https://docs.gradle.org/current/javadoc/org/gradle/api/tasks/CacheableTask.html) 注解类型。
现在推荐的新方法是使用 [`cacheIf`](https://docs.gradle.org/current/kotlin-dsl/gradle/org.gradle.api.tasks/-task-outputs/cache-if.html)
输出类型来缓存任务的结果。

这应该能解决 `UP-TO-DATE`
检查无法检测到[定义文件](native-definition-file.md)中指定的头文件更改，从而导致构建系统无法重新编译代码的问题。

### 弃用 mimalloc 内存分配器 {id="deprecation-of-the-mimalloc-memory-allocator"}

早在 Kotlin 1.9.0 中我们就引入了新的内存分配器，并在 Kotlin 1.9.20 中将其设为默认启用。
新分配器旨在提高垃圾回收效率，
并提升 Kotlin/Native 内存管理器的运行时性能。

新的内存分配器取代了先前的默认分配器 [mimalloc](https://github.com/microsoft/mimalloc)。
现在，是时候在 Kotlin/Native 编译器中弃用 mimalloc 了。

您现在可以从构建脚本中移除 `-Xallocator=mimalloc` 编译器选项。
如果遇到任何问题，请向我们的[问题跟踪器](http://kotl.in/issue)报告。

有关 Kotlin 中内存分配器和垃圾回收的更多信息，
请参阅 [Kotlin/Native 内存管理](native-memory-manager.md)。

## Kotlin/Wasm {id="kotlin-wasm"}

Kotlin/Wasm 获得了多项更新，并带来了[对增量编译的支持](#support-for-incremental-compilation)。

### 支持增量编译 {id="support-for-incremental-compilation"}

此前，当您修改 Kotlin 代码中的某些内容时，Kotlin/Wasm 工具链必须重新编译整个代码库。

从 2.1.0 开始，Wasm 目标开始支持增量编译。
在开发任务中，编译器现在仅重新编译与上次编译后所发生更改相关的文件，
从而显著缩短了编译时间。

此项更改目前使编译速度提升了一倍，并计划在未来版本中进一步加以改进。

在当前设置中，面向 Wasm 目标的增量编译默认处于禁用状态。
要启用增量编译，请在项目的 `local.properties` 或 `gradle.properties` 文件中添加以下行：

```none
# gradle.properties
kotlin.incremental.wasm=true
```

欢迎试用 Kotlin/Wasm 增量编译
并[分享您的反馈](https://youtrack.jetbrains.com/issue/KT-72158/Kotlin-Wasm-incremental-compilation-feedback)。
您的洞察将有助于尽快使该功能稳定并成为默认启用项。

### 浏览器 API 移至独立的 kotlinx-browser 库 {id="browser-apis-moved-to-the-kotlinx-browser-stand-alone-library"}

此前，Web API 和相关目标实用程序的声明是 Kotlin/Wasm 标准库的一部分。

在本次发布中，`org.w3c.*`
声明已从 Kotlin/Wasm 标准库移至全新的 [kotlinx-browser 库](https://github.com/kotlin/kotlinx-browser)。
该库还包含其他 Web 相关的包，例如 `org.khronos.webgl`、`kotlin.dom` 以及 `kotlinx.browser`。

这种分离提供了更好的模块化，使得 Web 相关的 API 可以在 Kotlin 发布周期之外独立更新。
此外，Kotlin/Wasm 标准库现在仅包含在任何 JavaScript 环境中均可用的声明。

若要使用已迁移包中的声明，
您需要在项目的构建配置文件中添加 `kotlinx-browser` 依赖项：

```kotlin
// build.gradle.kts
val wasmJsMain by getting {
    dependencies {
        implementation("org.jetbrains.kotlinx:kotlinx-browser:0.3")
    }
}
```

### 改进 Kotlin/Wasm 的调试体验 {id="improved-debugging-experience-for-kotlin-wasm"}

此前，在 Web 浏览器中调试 Kotlin/Wasm 代码时，您可能会在调试界面中遇到变量值的低级表示形式。
这往往使得追踪应用程序的当前状态变得十分困难。

![Kotlin/Wasm 旧版调试器](wasm-old-debugger.png){width=700}

为了改善这一体验，变量视图中添加了自定义格式化程序。
该实现使用了[自定义格式化程序 API](https://firefox-source-docs.mozilla.org/devtools-user/custom_formatters/index.html)，
该 API 在 Firefox 以及基于 Chromium 的各大主流浏览器中均受支持。

通过此项更改，您现在可以以更人性化、更易于理解的方式显示和查找变量值。

![Kotlin/Wasm 改进后的调试器](wasm-debugger-improved.png){width=700}

若要尝试全新的调试体验：

1. 在 `wasmJs {}` 编译器选项中添加以下编译器选项：

   ```kotlin
   // build.gradle.kts
   kotlin {
       wasmJs {
           // ...
   
           compilerOptions {
               freeCompilerArgs.add("-Xwasm-debugger-custom-formatters")
           }
       }
   }
   ```

2. 在浏览器中启用自定义格式化程序：

   * 在 Chrome DevTools 中，可通过 **Settings \| Preferences \| Console** 进行配置：

     ![在 Chrome 中启用自定义格式化程序](wasm-custom-formatters-chrome.png){width=700}

   * 在 Firefox DevTools 中，可通过 **Settings \| Advanced settings** 进行配置：

     ![在 Firefox 中启用自定义格式化程序](wasm-custom-formatters-firefox.png){width=700}

### 减小 Kotlin/Wasm 二进制文件体积 {id="reduced-size-of-kotlin-wasm-binaries"}

由生产环境构建生成的 Wasm 二进制文件体积将减少多达 30%，
并且您可能会看到一些性能提升。
这是因为 `--closed-world`、`--type-ssa` 和 `--type-merging` 这几个
Binaryen 选项现在被认为对于所有 Kotlin/Wasm 项目均可安全使用，并且已被默认启用。

### 改进 Kotlin/Wasm 中的 JavaScript 数组互操作性 {id="improved-javascript-array-interoperability-in-kotlin-wasm"}

虽然 Kotlin/Wasm 的标准库为 JavaScript 数组提供了 `JsArray<T>` 类型，
但过去并没有直接将 `JsArray<T>` 转换为 Kotlin 原生 `Array` 或 `List` 类型的方法。

这一空白使得开发者不得不编写用于数组转换的自定义函数，使 Kotlin 与 JavaScript 代码之间的互操作性变得复杂。

此版本引入了一个适配器函数，可在 `JsArray<T>` 与 `Array<T>` 之间进行自动互转，
简化了数组操作。

以下是泛型类型之间转换的示例：将 Kotlin 的 `List<T>` 和 `Array<T>` 转换为 JavaScript 的 `JsArray<T>`。

```kotlin
val list: List<JsString> =
    listOf("Kotlin", "Wasm").map { it.toJsString() }

// 使用 .toJsArray() 将 List 或 Array 转换为 JsArray
val jsArray: JsArray<JsString> = list.toJsArray()

// 使用 .toArray() 和 .toList() 将其转换回 Kotlin 类型 
val kotlinArray: Array<JsString> = jsArray.toArray()
val kotlinList: List<JsString> = jsArray.toList()
```

类似的函数也可用于将类型化数组转换为其对应的 Kotlin 类型
（例如 `IntArray` 和 `Int32Array`）。如需详细信息和具体实现，
请参阅 [`kotlinx-browser` 仓库](https://github.com/Kotlin/kotlinx-browser/blob/dfbdceed314567983c98f1d66e8c2e10d99c5a55/src/wasmJsMain/kotlin/arrayCopy.kt)。

以下是类型化数组之间转换的示例：将 Kotlin 的 `IntArray` 转换为 JavaScript 的 `Int32Array`。

```kotlin
import org.khronos.webgl.*

    // ...

    val intArray: IntArray = intArrayOf(1, 2, 3)
    
    // 使用 .toInt32Array() 将 Kotlin IntArray 转换为 JavaScript Int32Array
    val jsInt32Array: Int32Array = intArray.toInt32Array()
    
    // 使用 toIntArray() 将 JavaScript Int32Array 转换回 Kotlin IntArray
    val kotlinIntArray: IntArray = jsInt32Array.toIntArray()
```

### 支持在 Kotlin/Wasm 中访问 JavaScript 异常详细信息 {id="support-for-accessing-javascript-exception-details-in-kotlin-wasm"}

此前，当 Kotlin/Wasm 中发生 JavaScript 异常时，
`JsException` 类型仅提供一条通用消息，而不包含来自原始 JavaScript 错误的详细信息。

从 Kotlin 2.1.0 开始，您可以通过启用特定编译器选项，配置 `JsException`
以包含原始错误消息和堆栈跟踪。
这提供了更多上下文，有助于诊断源自 JavaScript 的问题。

该行为依赖于 `WebAssembly.JSTag` API，该 API 仅在特定浏览器中可用：

* **Chrome**：从 115 版本开始支持
* **Firefox**：从 129 版本开始支持
* **Safari**：暂不支持

要启用此功能（默认禁用），
请在 `build.gradle.kts` 文件中添加以下编译器选项：

```kotlin
// build.gradle.kts
kotlin {
    wasmJs {
        compilerOptions {
            freeCompilerArgs.add("-Xwasm-attach-js-exception")
        }
    }
}
```

以下示例演示了这一新行为：

```kotlin
external object JSON {
    fun <T: JsAny> parse(json: String): T
}

fun main() {
    try {
        JSON.parse("an invalid JSON")
    } catch (e: JsException) {
        println("Thrown value is: ${e.thrownValue}")
        // SyntaxError: Unexpected token 'a', "an invalid JSON" is not valid JSON

        println("Message: ${e.message}")
        // Message: Unexpected token 'a', "an invalid JSON" is not valid JSON

        println("Stacktrace:")
        // Stacktrace:

        // 打印完整的 JavaScript 堆栈跟踪 
        e.printStackTrace()
    }
}
```

启用 `-Xwasm-attach-js-exception` 选项后，`JsException` 会提供来自 JavaScript 错误的具体详细信息。
若未启用该选项，`JsException` 仅包含一条通用消息，说明在运行 JavaScript 代码时抛出了异常。

### 弃用默认导出（Default Exports） {id="deprecation-of-default-exports"}

作为向具名导出（named exports）迁移的一部分，
此前在 JavaScript 中对 Kotlin/Wasm 导出使用默认导入（default import）时，控制台会输出错误。

在 2.1.0 中，已彻底移除默认导入，以全面支持具名导出。

针对 Kotlin/Wasm 目标编写 JavaScript 代码时，您现在必须使用对应的具名导入，而不是默认导入。

此项更改标志着向具名导出迁移的弃用周期的最后阶段：

**在 2.0.0 版本中：** 控制台输出警告消息，说明通过默认导出导出实体已被弃用。

**在 2.0.20 版本中：** 发生错误，要求使用对应的具名导入。

**在 2.1.0 版本中：** 完全移除了对默认导入的使用支持。

### 子项目专属的 Node.js 设置 {id="subproject-specific-node-js-settings"}

您可以通过为 `rootProject` 定义 `NodeJsRootPlugin` 类的属性来配置项目的 Node.js 设置。
在 2.1.0 中，您可以使用新类 `NodeJsPlugin` 为每个子项目单独配置这些设置。
以下示例演示了如何为子项目设置特定的 Node.js 版本：

```kotlin
// build.gradle.kts
project.plugins.withType<org.jetbrains.kotlin.gradle.targets.js.nodejs.NodeJsPlugin> {
    project.the<org.jetbrains.kotlin.gradle.targets.js.nodejs.NodeJsEnvSpec>().version = "22.0.0"
}
```

若要为整个项目使用该新类，请在 `allprojects {}` 代码块中添加相同的代码：

```kotlin
// build.gradle.kts
allprojects {
    project.plugins.withType<org.jetbrains.kotlin.gradle.targets.js.nodejs.NodeJsPlugin> {
        project.the<org.jetbrains.kotlin.gradle.targets.js.nodejs.NodeJsEnvSpec>().version = "your Node.js version"
    }
}
```

您还可以使用 Gradle 约定插件将这些设置应用到特定的一组子项目中。

## Kotlin/JS {id="kotlin-js"}

### 支持属性中使用非标识符字符 {id="support-for-non-identifier-characters-in-properties"}

Kotlin/JS 此前不允许在[测试方法的名称](coding-conventions.md#names-for-test-methods)中使用由反引号括起来的空格。

同样，也无法访问包含 Kotlin 标识符中不允许的字符（例如连字符或空格）的 JavaScript 对象属性：

```kotlin
external interface Headers {
    var accept: String?

    // 由于连字符，不是合法的 Kotlin 标识符
    var `content-length`: String?
}

val headers: Headers = TODO("value provided by a JS library")
val accept = headers.accept
// 由于属性名称中包含连字符，导致报错
val length = headers.`content-length`
```

这种行为与 JavaScript 和 TypeScript 不同，后者允许使用非标识符字符访问此类属性。

从 Kotlin 2.1.0 开始，此功能默认启用。
Kotlin/JS 现在允许您使用反引号（``）和 `@JsName` 注解
来与包含非标识符字符的 JavaScript 属性交互，并在测试方法名称中使用它们。

此外，
您还可以使用 `@JsName` 和 `@JsQualifier` 注解将 Kotlin 属性名称映射到 JavaScript 对应项：

```kotlin
object Bar {
    val `property example`: String = "bar"
}

@JsQualifier("fooNamespace")
external object Foo {
    val `property example`: String
}

@JsExport
object Baz {
    val `property example`: String = "bar"
}

fun main() {
    // 在 JavaScript 中，这会被编译为 Bar.property_example_HASH
    println(Bar.`property example`)
    // 在 JavaScript 中，这会被编译为 fooNamespace["property example"]
    println(Foo.`property example`)
    // 在 JavaScript 中，这会被编译为 Baz["property example"]
    println(Baz.`property example`)
}
```

### 支持生成 ES2015 箭头函数 {id="support-for-generating-es2015-arrow-functions"}

在 Kotlin 2.1.0 中，Kotlin/JS 引入了对生成 ES2015 箭头函数（例如 `(a, b) => expression`）以代替匿名函数的支持。

使用箭头函数可以减小项目的打包体积，
尤其是在使用实验性的 `-Xir-generate-inline-anonymous-functions` 模式时。
这也使得生成的代码更加贴合现代 JS。

当目标设为 ES2015 时，此功能默认启用。
或者，您也可以通过使用 `-Xes-arrow-functions` 命令行参数来启用它。

在[官方文档中详细了解 ES2015（ECMAScript 2015，ES6）](https://262.ecma-international.org/6.0/)。

## Gradle 改进 {id="gradle-improvements"}

Kotlin 2.1.0 完全兼容 Gradle 7.6.3 至 8.6。
对 Gradle 8.7 至 8.10 版本也同样支持，仅有一个例外：
如果您使用 Kotlin Multiplatform Gradle 插件，
在 JVM 目标中调用 `withJava()` 函数的多平台项目中可能会看到弃用警告。
我们计划尽快修复该问题。

有关更多信息，
请参阅 [YouTrack 上的相关 issue](https://youtrack.jetbrains.com/issue/KT-66542)。

您也可以使用最高至最新发布的 Gradle 版本，
但如果这样做，请注意可能会遇到弃用警告，或者某些 Gradle 新功能可能无法正常工作。

### 支持的最低 AGP 版本提升至 7.3.1 {id="minimum-supported-agp-version-bumped-to-7-3-1"}

从 Kotlin 2.1.0 开始，支持的最低 Android Gradle 插件版本为 7.3.1。

### 支持的最低 Gradle 版本提升至 7.6.3 {id="minimum-supported-gradle-version-bumped-to-7-6-3"}

从 Kotlin 2.1.0 开始，支持的最低 Gradle 版本为 7.6.3。

### 针对 Kotlin Gradle 插件扩展的新 API {id="new-api-for-kotlin-gradle-plugin-extensions"}

Kotlin 2.1.0 引入了新的 API，以便更轻松地创建用于配置 Kotlin Gradle 插件的自定义插件。
该更改弃用了 `KotlinTopLevelExtension` 和 `KotlinTopLevelExtensionConfig`
接口，并为插件作者引入了以下接口：

| 名称 | 说明 |
|---|---|
| `KotlinBaseExtension` | 一种插件 DSL 扩展类型，用于为整个项目配置通用的 Kotlin JVM、Android 和 Multiplatform 插件选项：<list><li>`org.jetbrains.kotlin.jvm`</li><li>`org.jetbrains.kotlin.android`</li><li>`org.jetbrains.kotlin.multiplatform`</li></list> |
| `KotlinJvmExtension` | 一种插件 DSL 扩展类型，用于为整个项目配置 Kotlin **JVM** 插件选项。 |
| `KotlinAndroidExtension` | 一种插件 DSL 扩展类型，用于为整个项目配置 Kotlin **Android** 插件选项。 |

例如，如果您想同时为 JVM 和 Android 项目配置编译器选项，请使用 `KotlinBaseExtension`：

```kotlin
configure<KotlinBaseExtension> {
    if (this is HasConfigurableKotlinCompilerOptions<*>) {
        with(compilerOptions) {
            if (this is KotlinJvmCompilerOptions) {
                jvmTarget.set(JvmTarget.JVM_17)
            }
        }
    }
}
```

这会将 JVM 和 Android 项目的 JVM 目标均配置为 17。

若要专门为 JVM 项目配置编译器选项，请使用 `KotlinJvmExtension`：

```kotlin
configure<KotlinJvmExtension> {
    compilerOptions {
        jvmTarget.set(JvmTarget.JVM_17)
    }

    target.mavenPublication {
        groupId = "com.example"
        artifactId = "example-project"
        version = "1.0-SNAPSHOT"
    }
}
```

该示例同样将 JVM 项目的 JVM 目标配置为 17。
它还为该项目配置了 Maven 发布，以便将其输出发布到 Maven 仓库。

您可以以完全相同的方式使用 `KotlinAndroidExtension`。

### 对 Kotlin Gradle 插件 API 隐藏编译器符号 {id="compiler-symbols-hidden-from-the-kotlin-gradle-plugin-api"}

此前，KGP 在其运行时依赖项中包含了 `org.jetbrains.kotlin:kotlin-compiler-embeddable`，
这使得内部编译器符号暴露在构建脚本类路径中。
这些符号原本仅供内部使用。

从 Kotlin 2.1.0 开始，KGP 在其 JAR 文件中捆绑了 `org.jetbrains.kotlin:kotlin-compiler-embeddable` 类文件的子集，并逐步将其移除。
此项更改旨在防止兼容性问题并简化 KGP 的维护。

如果构建逻辑的其他部分（例如像 `kotlinter` 这样的插件）所依赖的 `org.jetbrains.kotlin:kotlin-compiler-embeddable` 版本
与 KGP 捆绑的版本不同，则可能会导致冲突和运行时异常。

为了防止此类问题，如果 `org.jetbrains.kotlin:kotlin-compiler-embeddable` 与 KGP 一起出现在构建类路径中，KGP 现在会显示一条警告。

作为长期解决方案，如果您是使用 `org.jetbrains.kotlin:kotlin-compiler-embeddable` 类的插件作者，我们建议在隔离的类加载器中运行它们。
例如，您可以使用具有类加载器或进程隔离特性的 [Gradle Workers API](https://docs.gradle.org/current/userguide/worker_api.html) 来实现这一点。

#### 使用 Gradle Workers API {id="using-the-gradle-workers-api"}

本示例演示了如何在生成 Gradle 插件的项目中安全使用 Kotlin 编译器。
首先，在构建脚本中添加一个 compile-only 依赖项。
这使得该符号仅在编译时可用：

```kotlin
// build.gradle.kts
dependencies {
    compileOnly("org.jetbrains.kotlin:kotlin-compiler-embeddable:%kotlinVersion%")
}
```

接下来，定义一个 Gradle work action 来输出 Kotlin 编译器版本：

```kotlin
import org.gradle.workers.WorkAction
import org.gradle.workers.WorkParameters
import org.jetbrains.kotlin.config.KotlinCompilerVersion
abstract class ActionUsingKotlinCompiler : WorkAction<WorkParameters.None> {
    override fun execute() {
        println("Kotlin compiler version: ${KotlinCompilerVersion.getVersion()}")
    }
}
```

现在创建一个任务，使用类加载器隔离将该操作提交给 worker 执行器：

```kotlin
import org.gradle.api.DefaultTask
import org.gradle.api.file.ConfigurableFileCollection
import org.gradle.api.tasks.Classpath
import org.gradle.api.tasks.TaskAction
import org.gradle.workers.WorkerExecutor
import javax.inject.Inject
abstract class TaskUsingKotlinCompiler: DefaultTask() {
    @get:Inject
    abstract val executor: WorkerExecutor

    @get:Classpath
    abstract val kotlinCompiler: ConfigurableFileCollection

    @TaskAction
    fun compile() {
        val workQueue = executor.classLoaderIsolation {
            classpath.from(kotlinCompiler)
        }
        workQueue.submit(ActionUsingKotlinCompiler::class.java) {}
    }
}
```

最后，在 Gradle 插件中配置 Kotlin 编译器类路径：

```kotlin
import org.gradle.api.Plugin
import org.gradle.api.Project
abstract class MyPlugin: Plugin<Project> {
    override fun apply(target: Project) {
        val myDependencyScope = target.configurations.create("myDependencyScope")
        target.dependencies.add(myDependencyScope.name, "$KOTLIN_COMPILER_EMBEDDABLE:$KOTLIN_COMPILER_VERSION")
        val myResolvableConfiguration = target.configurations.create("myResolvable") {
            extendsFrom(myDependencyScope)
        }
        target.tasks.register("myTask", TaskUsingKotlinCompiler::class.java) {
            kotlinCompiler.from(myResolvableConfiguration)
        }
    }

    companion object {
        const val KOTLIN_COMPILER_EMBEDDABLE = "org.jetbrains.kotlin:kotlin-compiler-embeddable"
        const val KOTLIN_COMPILER_VERSION = "%kotlinVersion%"
    }
}
```

## Compose 编译器更新 {id="compose-compiler-updates"}

### 支持多个稳定性配置文件 {id="support-for-multiple-stability-configuration-files"}

Compose 编译器可以解析多个稳定性配置文件，
但 Compose 编译器 Gradle 插件的 `stabilityConfigurationFile` 选项此前仅允许指定单个文件。
在 Kotlin 2.1.0 中，对该功能进行了重构，允许您为单个模块使用多个稳定性配置文件：

* `stabilityConfigurationFile` 选项已被弃用。
* 新增了一个类型为 `ListProperty<RegularFile>` 的新选项 `stabilityConfigurationFiles`。

以下演示了如何使用新选项向 Compose 编译器传递多个文件：

```kotlin
// build.gradle.kt
composeCompiler {
    stabilityConfigurationFiles.addAll(
        project.layout.projectDirectory.file("configuration-file1.conf"),
        project.layout.projectDirectory.file("configuration-file2.conf"),
    )
}
```

### 可暂停组合（Pausable composition） {id="pausable-composition"}

可暂停组合是一项新的实验性功能，它改变了编译器生成可跳过函数的方式。
启用此功能后，组合可以在运行时在跳过点处挂起，
从而允许将耗时较长的组合过程分散到多个帧中。
可暂停组合用于惰性列表和其他性能密集型组件，以预取内容，
避免在以阻塞方式执行时引起掉帧。

若要试用可暂停组合，请在 Compose 编译器的 Gradle 配置中添加以下功能标志：

```kotlin
// build.gradle.kts
composeCompiler {
    featureFlags = setOf(
        ComposeFeatureFlag.PausableComposition
    )
}
```

> 对该功能的运行时支持已添加到 1.8.0-alpha02 版本的 `androidx.compose.runtime` 中。
> 在与较旧的运行时版本一起使用时，该功能标志不起作用。
>
{style="note"}

### open 和被重写的 @Composable 函数的变更 {id="changes-to-open-and-overridden-composable-functions"}

虚（open、abstract 和被重写的）`@Composable` 函数不能再是可重启的（restartable）。
用于可重启分组的代码生成在与继承搭配使用时[无法正常工作](https://issuetracker.google.com/329477544)，会导致运行时崩溃。

这意味着虚函数将不会被重启或跳过：
每当它们的状态失效时，运行时将改为重新组合其父级可组合项。
如果您的代码对重组比较敏感，您可能会注意到运行时行为的变化。

### 性能改进 {id="performance-improvements"}

Compose 编译器过去会创建模块 IR 的完整副本以转换 `@Composable` 类型。
除了在复制与 Compose 无关的元素时会增加内存消耗外，
此行为在[某些边缘情况](https://issuetracker.google.com/365066530)下还会破坏下游编译器插件。

这一复制操作已被移除，从而可能带来更快的编译速度。

## 标准库 {id="standard-library"}

### 标准库 API 弃用严重级别的变更 {id="changes-to-the-deprecation-severity-of-standard-library-apis"}

在 Kotlin 2.1.0 中，我们将多个标准库 API 的弃用严重级别从警告提升为错误。
如果您的代码依赖于这些 API，则需要对其进行更新以确保兼容性。
最值得注意的变更包括：

* **区域性相关的 `Char` 和 `String` 大小写转换函数已弃用：**
  像 `Char.toLowerCase()`、`Char.toUpperCase()`、`String.toUpperCase()`
  和 `String.toLowerCase()` 这样的函数现已被弃用，使用它们会导致报错。
  请将它们替换为与区域性无关的替代函数或其他大小写转换机制。
  如果您希望继续使用默认区域设置，请显式指定区域设置，将类似 `String.toLowerCase()` 的调用替换为 `String.lowercase(Locale.getDefault())`。
  对于与区域性无关的转换，请将其替换为默认使用不变区域设置的 `String.lowercase()`。

* **Kotlin/Native 冻结（Freezing）API 已弃用：**
  使用先前标有 `@FreezingIsDeprecated` 注解的冻结相关声明现在会导致报错。
  这一变更反映了 Kotlin/Native 中旧版内存管理器的退役，
  旧管理器要求冻结对象才能在线程之间共享它们。
  若想了解如何在新的内存模型下迁移冻结相关的 API，
  请参阅 [Kotlin/Native 迁移指南](native-migration-guide.md#update-your-code)。
  有关更多信息，请参阅[有关弃用冻结机制的公告](whatsnew1720.md#freezing)。

* **`appendln()` 已弃用，建议改用 `appendLine()`：**
  `StringBuilder.appendln()` 和 `Appendable.appendln()` 函数现已被弃用，使用它们会导致报错。
  若要替换它们，请改用 `StringBuilder.appendLine()` 或 `Appendable.appendLine()` 函数。
  `appendln()` 函数之所以被弃用，是因为在 Kotlin/JVM 上它使用的是 `line.separator` 系统属性，
  而该属性在各个操作系统上的默认值不同。在 Kotlin/JVM 上，该属性在 Windows 上默认为 `\r\n` (CR LF)，在其他系统上默认为 `\n` (LF)。
  另一方面，`appendLine()` 函数始终使用 `\n` (LF) 作为行分隔符，确保跨平台行为一致。

有关此版本中受影响 API 的完整列表，请参阅 [KT-71628](https://youtrack.jetbrains.com/issue/KT-71628) YouTrack issue。

### java.nio.file.Path 的稳定文件树遍历扩展 {id="stable-file-tree-traversal-extensions-for-java-nio-file-path"}

Kotlin 1.7.20 引入了针对 `java.nio.file.Path` 类的实验性[扩展函数](extensions.md#extension-functions)，
允许遍历文件树。
在 Kotlin 2.1.0 中，以下文件树遍历扩展现已达到[稳定版（Stable）](components-stability.md#stability-levels-explained)：

* `walk()` 惰性遍历以指定路径为根的文件树。
* `fileVisitor()` 支持单独创建 `FileVisitor`。
  `FileVisitor` 指定了在遍历期间对目录和文件要执行的操作。
* `visitFileTree(fileVisitor: FileVisitor, ...)` 遍历文件树，
  对遇到的每个条目调用指定的 `FileVisitor`，并在底层使用 `java.nio.file.Files.walkFileTree()` 函数。
* `visitFileTree(..., builderAction: FileVisitorBuilder.() -> Unit)` 使用提供的 `builderAction` 创建一个 `FileVisitor`
  并调用 `visitFileTree(fileVisitor, ...)` 函数。
* `sealed interface FileVisitorBuilder` 允许您定义自定义的 `FileVisitor` 实现。
* `enum class PathWalkOption` 为 `Path.walk()` 函数提供遍历选项。

以下示例演示了如何使用这些文件遍历 API 创建自定义的 `FileVisitor` 行为，
允许您定义用于访问文件和目录的特定操作。

例如，您可以显式创建一个 `FileVisitor` 并在后续使用它：

```kotlin
val cleanVisitor = fileVisitor {
    onPreVisitDirectory { directory, attributes ->
        // 占位符：添加访问目录时的逻辑
        FileVisitResult.CONTINUE
    }

    onVisitFile { file, attributes ->
        // 占位符：添加访问文件时的逻辑
        FileVisitResult.CONTINUE
    }
}

// 占位符：在此添加遍历前常规设置的逻辑
projectDirectory.visitFileTree(cleanVisitor)
```

您还可以使用 `builderAction` 创建一个 `FileVisitor` 并立即将其用于遍历：

```kotlin
projectDirectory.visitFileTree {
    // 定义 builderAction：
    onPreVisitDirectory { directory, attributes ->
        // 访问目录时的某些逻辑
        FileVisitResult.CONTINUE
    }

    onVisitFile { file, attributes ->
        // 访问文件时的某些逻辑
        FileVisitResult.CONTINUE
    }
}
```

此外，您还可以使用 `walk()` 函数遍历以指定路径为根的文件树：

```kotlin
fun traverseFileTree() {
    val cleanVisitor = fileVisitor {
        onPreVisitDirectory { directory, _ ->
            if (directory.name == "build") {
                directory.toFile().deleteRecursively()
                FileVisitResult.SKIP_SUBTREE
            } else {
                FileVisitResult.CONTINUE
            }
        }

        // 删除带有 .class 扩展名的文件
        onVisitFile { file, _ ->
            if (file.extension == "class") {
                file.deleteExisting()
            }
            FileVisitResult.CONTINUE
        }
    }

    // 设置根目录和文件
    val rootDirectory = createTempDirectory("Project")

    // 创建包含 A.kt 和 A.class 文件的 src 目录
    rootDirectory.resolve("src").let { srcDirectory ->
        srcDirectory.createDirectory()
        srcDirectory.resolve("A.kt").createFile()
        srcDirectory.resolve("A.class").createFile()
    }

    // 创建包含 Project.jar 文件的 build 目录
    rootDirectory.resolve("build").let { buildDirectory ->
        buildDirectory.createDirectory()
        buildDirectory.resolve("Project.jar").createFile()
    }

    // 使用 walk() 函数：
    val directoryStructure = rootDirectory.walk(PathWalkOption.INCLUDE_DIRECTORIES)
        .map { it.relativeTo(rootDirectory).toString() }
        .toList().sorted()
    println(directoryStructure)
    // "[, build, build/Project.jar, src, src/A.class, src/A.kt]"
  
    // 使用 cleanVisitor 遍历文件树，应用 rootDirectory.visitFileTree(cleanVisitor) 清理规则
    val directoryStructureAfterClean = rootDirectory.walk(PathWalkOption.INCLUDE_DIRECTORIES)
        .map { it.relativeTo(rootDirectory).toString() }
        .toList().sorted()
    println(directoryStructureAfterClean)
    // "[, src, src/A.kt]"
}
```

## 文档更新 {id="documentation-updates"}

Kotlin 文档迎来了一些重大变更：

### 语言概念 {id="language-concepts"}

* 改进了[空安全（Null safety）](null-safety.md)页面——了解如何在代码中安全地处理 `null` 值。
* 改进了[对象声明与表达式](object-declarations.md)页面——了解如何通过单个步骤定义类并创建实例。
* 改进了 [When 表达式和语句](control-flow.md#when-expressions-and-statements)小节——了解 `when` 条件语句及其用法。
* 更新了 [Kotlin 路线图](roadmap.md)、[Kotlin 演进原则](kotlin-evolution-principles.md)以及 [Kotlin 语言功能与提案](kotlin-language-features-and-proposals.md)页面——了解 Kotlin 的规划、正在进行的开发工作以及指导原则。

### Compose 编译器 {id="compose-compiler"}

* [Compose 编译器文档](compose-compiler-migration-guide.md)现已移至“编译器与插件”部分——了解 Compose 编译器、编译器选项以及迁移步骤。

### API 参考 {id="api-references"}

* 全新的 [Kotlin Gradle 插件 API 参考](https://kotlinlang.org/api/kotlin-gradle-plugin)——探索针对 Kotlin Gradle 插件和 Compose 编译器 Gradle 插件的 API 参考文档。

### 多平台开发 {id="multiplatform-development"}

* 新增[构建多平台 Kotlin 库](https://kotlinlang.org/docs/api-guidelines-build-for-multiplatform.html)页面——了解如何为 Kotlin Multiplatform 设计 Kotlin 库。
* 新增 [Kotlin Multiplatform 简介](https://kotlinlang.org/docs/multiplatform/get-started.html)页面——了解 Kotlin Multiplatform 的核心概念、依赖项、库等内容。
* 新增 [iOS 集成](https://kotlinlang.org/docs/multiplatform/multiplatform-ios-integration-overview.html)部分——了解如何将 Kotlin Multiplatform 共享模块集成到 iOS 应用中。
* 新增 [Kotlin/Native 定义文件](native-definition-file.md)页面——了解如何创建定义文件以使用 C 和 Objective-C 库。
* [WASI 快速入门指南](wasm-wasi.md)——了解如何在各种 WebAssembly 虚拟机中使用 WASI 运行简单的 Kotlin/Wasm 应用程序。

### 工具 {id="tooling"}

* [全新的 Dokka 迁移指南](dokka-migration.md)——了解如何迁移到 Dokka Gradle 插件 v2。

## Kotlin 2.1.0 兼容性指南 {id="compatibility-guide-for-kotlin-2-1-0"}

Kotlin 2.1.0 是一个功能版本，因此可能会引入与针对该语言早期版本编写的代码不兼容的更改。
如需查看这些变更的详细列表，请参阅 [Kotlin 2.1.0 兼容性指南](compatibility-guide-21.md)。

## 安装 Kotlin 2.1.0 {id="install-kotlin-2-1-0"}

从 IntelliJ IDEA 2023.3 和 Android Studio Iguana (2023.2.1) Canary 15 开始，Kotlin 插件作为随 IDE 一同提供的捆绑插件进行分发。这意味着您无法再从 JetBrains Marketplace 安装该插件。

若要更新到新的 Kotlin 版本，请在构建脚本中[将 Kotlin 版本更改](releases.md#update-to-a-new-kotlin-version)为 2.1.0 即可。