) 在字符串字面量中的处理](#multi-dollar-string-interpolation)

> 在启用了 K2 模式的最新 2024.3 版本 IntelliJ IDEA 中，所有功能都获得了 IDE 支持。
>
> 详细了解 [IntelliJ IDEA 2024.3 博客文章](https://blog.jetbrains.com/idea/2024/11/intellij-idea-2024-3/)。
>
{style="tip"}

[查看 Kotlin 语言设计功能和提案的完整列表](kotlin-language-features-and-proposals.md)。

此版本还带来了以下语言更新：

* [支持要求在扩展 API 时进行选择性启用 (Opt-in)](#support-for-requiring-opt-in-to-extend-apis)
* [改进了带泛型类型函数的重载解析](#improved-overload-resolution-for-functions-with-generic-types)
* [改进了带密封类 (Sealed classes) 的 `when` 表达式的完备性检查](#improved-exhaustiveness-checks-for-when-expressions-with-sealed-classes)

### when 表达式带主题的守卫条件

> 此功能处于[预览阶段](kotlin-evolution-principles.md#pre-stable-features)，
> 且需要选择性启用 (Opt-in)（详见下文）。
> 
> 我们欢迎您在 [YouTrack](https://youtrack.jetbrains.com/issue/KT-71140) 中提供反馈。
>
{style="warning"}

从 2.1.0 开始，您可以在带主题的 `when` 表达式或语句中使用守卫条件。

守卫条件允许您为 `when` 表达式的分支包含多个条件，
使复杂的控制流更加显式和简洁，并能展平代码结构。

要在分支中包含守卫条件，请将其置于主要条件之后，并使用 `if` 分隔：

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
        // 仅包含主要条件的分支。当 `animal` 为 `Dog` 时调用 `feedDog()`
        is Animal.Dog -> animal.feedDog()
        // 同时包含主要条件和守卫条件的分支。当 `animal` 为 `Cat` 且不是 `mouseHunter` 时调用 `feedCat()`
        is Animal.Cat if !animal.mouseHunter -> animal.feedCat()
        // 如果以上条件都不匹配，则打印 "Unknown animal"
        else -> println("Unknown animal")
    }
}
```

在单个 `when` 表达式中，您可以组合使用带守卫条件和不带守卫条件的分支。
仅当主要条件和守卫条件均为 `true` 时，带守卫条件的分支中的代码才会运行。
如果主要条件不匹配，则不会评估守卫条件。 
此外，守卫条件支持 `else if`。

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

### 非局部 break 和 continue

> 此功能处于[预览阶段](kotlin-evolution-principles.md#pre-stable-features)，
> 且需要选择性启用 (Opt-in)（详见下文）。
> 
> 我们欢迎您在 [YouTrack](https://youtrack.jetbrains.com/issue/KT-1436) 中提供反馈。
>
{style="warning"}

Kotlin 2.1.0 添加了另一个期待已久的功能预览：使用非局部 `break` 和 `continue` 的能力。
此功能扩展了您在内联函数作用域内可以使用的工具集，并减少了项目中的模板代码。

以前，您只能使用非局部返回 (non-local returns)。
现在，Kotlin 还支持在非局部使用 `break` 和 `continue` [跳转表达式](returns.md)。
这意味着您可以在作为参数传递给包围循环的内联函数的 Lambda 表达式中应用它们：

```kotlin
fun processList(elements: List<Int>): Boolean {
    for (element in elements) {
        val variable = element.nullableMethod() ?: run {
            log.warning("Element is null or invalid, continuing...")
            continue
        }
        if (variable == 0) return true // 如果变量为零，返回 true
    }
    return false
}
```

要在项目中尝试此功能，请在命令行中使用 `-Xnon-local-break-continue` 编译器选项：

```bash
kotlinc -Xnon-local-break-continue main.kt
```

或者在 Gradle 构建文件的 `compilerOptions {}` 代码块中添加：

```kotlin
// build.gradle.kts
kotlin {
    compilerOptions {
        freeCompilerArgs.add("-Xnon-local-break-continue")
    }
}
```

我们计划在未来的 Kotlin 版本中使此功能达到 Stable。 
如果您在使用非局部 `break` 和 `continue` 时遇到任何问题， 
请报告至我们的[问题跟踪器](https://youtrack.jetbrains.com/issue/KT-1436)。

### 多美元符字符串插值

> 该功能处于[预览阶段](kotlin-evolution-principles.md#pre-stable-features)，
> 且需要选择性启用 (Opt-in)（详见下文）。
> 
> 我们欢迎您在 [YouTrack](https://youtrack.jetbrains.com/issue/KT-2425) 中提供反馈。
>
{style="warning"}

Kotlin 2.1.0 引入了对多美元符字符串插值的支持， 
改进了在字符串文字中处理美元符号 (`$`) 的方式。
此功能在需要多个美元符号的上下文中非常有用，
例如模板引擎、JSON 架构 (JSON schemas) 或其他数据格式。

Kotlin 中的字符串插值使用单个美元符号。 
然而，在字符串中使用字面量美元符号（这在财务数据和模板系统中很常见）需要诸如 `${'$'}` 之类的变通方法。
启用多美元符插值功能后，您可以配置由多少个美元符号触发插值，
而较少数量的美元符号将被视为字符串字面量。

以下是使用多美元符插值生成带占位符的 JSON 架构多行字符串的示例：

```kotlin
val `KClass<*>`.jsonSchema : String
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

在此示例中，开头的 `$$` 表示您需要**两个美元符号** (`$$`) 才能触发插值。
它防止了 `$schema`、`$id` 和 `$dynamicAnchor` 被解释为插值标记。

这种方法在处理使用美元符号作为占位符语法的系统时特别有用。

要在命令行中启用该功能，请使用以下编译器选项：

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

如果您的代码已经使用了带单个美元符号的标准字符串插值，则无需进行任何更改。
每当您需要在字符串中表示字面量美元符号时，都可以使用 `$`。

### 支持要求在扩展 API 时进行选择性启用 (Opt-in)

Kotlin 2.1.0 引入了 [`@SubclassOptInRequired`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin/-subclass-opt-in-required/) 注解，
它允许库作者要求用户在实现实验性接口或扩展实验性类之前，进行显式的选择性启用 (Opt-in)。

当库 API 足够稳定可以正常使用，但可能会随新的抽象函数而演进（从而导致其在继承方面不稳定）时，此功能非常有用。

要向 API 元素添加选择性启用要求，请使用 `@SubclassOptInRequired`
注解，并引用注解类：

```kotlin
@RequiresOptIn(
level = RequiresOptIn.Level.WARNING,
message = "Interfaces in this library are experimental"
)
annotation class UnstableApi()

@SubclassOptInRequired(UnstableApi::class)
interface CoreLibraryApi
```

在此示例中，`CoreLibraryApi` 接口要求用户在实现它之前进行选择性启用。
用户可以像这样启用：

```kotlin
@OptIn(UnstableApi::class)
interface MyImplementation: CoreLibraryApi
```

> 当您使用 `@SubclassOptInRequired` 注解要求选择性启用时， 
> 该要求不会传播到任何[内部类或嵌套类](nested-classes.md)。
>
{style="note"}

有关如何在 API 中使用 `@SubclassOptInRequired` 注解的真实示例，
请查看 `kotlinx.coroutines` 库中的 [`SharedFlow`](https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines.flow/-shared-flow/)
接口。

### 改进了带泛型类型函数的重载解析

以前，如果您为一个函数准备了多个重载，其中一些重载具有泛型类型的数值参数，
而另一些在相同位置具有函数类型，那么解析行为有时可能会不一致。

这导致了取决于您的重载是成员函数还是扩展函数而产生的不同行为。
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
    kvs.store("", 1)    // 解析为 1
    kvs.store("") { 1 } // 解析为 2

    // 扩展函数
    kvs.storeExtension("", 1)    // 解析为 1
    kvs.storeExtension("") { 1 } // 无法解析
}
```

在此示例中，`KeyValueStore` 类为 `store()` 函数提供了两个重载，
其中一个重载具有带泛型类型 `K` 和 `V` 的函数参数，
另一个具有返回泛型类型 `V` 的 Lambda 函数。
类似地，扩展函数 `storeExtension()` 也有两个重载。

当在调用 `store()` 函数时无论是否带 Lambda 函数，
编译器都能成功解析正确的重载。
然而，当带 Lambda 函数调用扩展函数 `storeExtension()` 时，
编译器无法解析正确的重载，因为它错误地认为两个重载都适用。

为了解决这个问题，我们引入了一种新的启发式算法，以便编译器在根据来自其他实参的信息，确定带泛型类型的函数形参无法接受 Lambda 函数时，可以舍弃可能的重载。
这一变化使得成员函数和扩展函数的行为保持一致，
并在 Kotlin 2.1.0 中默认启用。

### 改进了带密封类 (Sealed classes) 的 when 表达式的完备性检查

在以前的 Kotlin 版本中，即使涵盖了 `sealed class` 层次结构中的所有情况，
编译器仍要求在具有密封上限的类型参数的 `when` 表达式中提供 `else` 分支。
这一行为在 Kotlin 2.1.0 中得到了解决和改进，
使完备性检查更加强大，并允许您移除冗余的 `else` 分支，
从而保持 `when` 表达式更加整洁和直观。

以下是演示该变化的示例：

```kotlin
sealed class Result
object Error: Result()
class Success(val value: String): Result()

fun <T : Result> render(result: T) = when (result) {
    Error -> "Error!"
    is Success -> result.value
    // 不再需要 else 分支
}
```

## Kotlin K2 编译器

在 Kotlin 2.1.0 中，K2 编译器现在在处理[编译器检查](#extra-compiler-checks)
和[警告](#global-warning-suppression)时提供了[更多灵活性](#extra-compiler-checks)，并[改进了对 kapt 插件的支持](#improved-k2-kapt-implementation)。

### 额外的编译器检查

在 Kotlin 2.1.0 中，您现在可以在 K2 编译器中启用额外的检查。
这些是额外的声明、表达式和类型检查，通常对于编译不是至关重要的，
但如果您想验证以下情况，它们仍然很有用：

| 检查类型 | 注释 |
|-------------------------------------------------------|------------------------------------------------------------------------------------------|
| `REDUNDANT_NULLABLE` | 使用了 `Boolean??` 而不是 `Boolean?` |
| `PLATFORM_CLASS_MAPPED_TO_KOTLIN` | 使用了 `java.lang.String` 而不是 `kotlin.String` |
| `ARRAY_EQUALITY_OPERATOR_CAN_BE_REPLACED_WITH_EQUALS` | 使用了 `arrayOf("") == arrayOf("")` 而不是 `arrayOf("").contentEquals(arrayOf(""))` |
| `REDUNDANT_CALL_OF_CONVERSION_METHOD` | 使用了 `42.toInt()` 而不是 `42` |
| `USELESS_CALL_ON_NOT_NULL` | 使用了 `"".orEmpty()` 而不是 `""` |
| `REDUNDANT_SINGLE_EXPRESSION_STRING_TEMPLATE` | 使用了 `"$string"` 而不是 `string` |
| `UNUSED_ANONYMOUS_PARAMETER` | 在 lambda 表达式中传递了参数但从未被使用 |
| `REDUNDANT_VISIBILITY_MODIFIER` | 使用了 `public class Klass` 而不是 `class Klass` |
| `REDUNDANT_MODALITY_MODIFIER` | 使用了 `final class Klass` 而不是 `class Klass` |
| `REDUNDANT_SETTER_PARAMETER_TYPE` | 使用了 `set(value: Int)` 而不是 `set(value)` |
| `CAN_BE_VAL` | 定义了 `var local = 0` 但从未重新赋值，可以改为 `val local = 42` |
| `ASSIGNED_VALUE_IS_NEVER_READ` | 定义了 `val local = 42` 但之后在代码中从未读取 |
| `UNUSED_VARIABLE` | 定义了 `val local = 0` 但在代码中从未被使用 |
| `REDUNDANT_RETURN_UNIT_TYPE` | 使用了 `fun foo(): Unit {}` 而不是 `fun foo() {}` |
| `UNREACHABLE_CODE` | 存在代码语句但永远无法被执行 |

如果检查为真，您将收到一条编译器警告，并附带有关如何修复问题的建议。

额外检查默认处于禁用状态。
要启用它们，请在命令行中使用 `-Wextra` 编译器选项，或在 Gradle 构建文件的 `compilerOptions {}` 代码块中指定 `extraWarnings`：

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

### 全局警告抑制

在 2.1.0 中，Kotlin 编译器收到了一个备受期待的功能——全局抑制警告的能力。

您现在可以通过在命令行中使用 `-Xsuppress-warning=WARNING_NAME`
语法，或在构建文件的 `compilerOptions {}` 代码块中使用 `freeCompilerArgs` 属性，在整个项目中抑制特定警告。

例如，如果您在项目中启用了[额外的编译器检查](#extra-compiler-checks)，但想抑制其中一个警告，请使用：

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

新的编译器选项目前处于[实验性](components-stability.md#stability-levels-explained)阶段。
以下细节也值得注意：

* 不允许抑制错误 (Error)。
* 如果您传递了未知的警告名称，编译将导致错误。
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

### 改进的 K2 kapt 实现

> 用于 K2 编译器的 kapt 插件 (K2 kapt) 处于 [Alpha](components-stability.md#stability-levels-explained) 阶段。
> 它可能随时发生变化。
> 
> 我们欢迎您在 [YouTrack](https://youtrack.jetbrains.com/issue/KT-71439/K2-kapt-feedback) 中提供反馈。
>
{style="warning"}

目前，使用 [kapt](kapt.md) 插件的项目默认使用 K1 编译器，支持最高 1.9 版本的 Kotlin。

在 Kotlin 1.9.20 中，我们推出了使用 K2 编译器的 kapt 插件的实验性实现 (K2 kapt)。
我们现在改进了 K2 kapt 的内部实现，以减轻技术和性能问题。

虽然新的 K2 kapt 实现没有引入新功能，
但与之前的 K2 kapt 实现相比，其性能得到了显著提升。
此外，K2 kapt 插件的行为现在更接近 K1 kapt。

To use the new K2 kapt plugin implementation, enable it just like you did the previous K2 kapt plugin.
在项目的 `gradle.properties` 文件中添加以下选项：

```kotlin
kapt.use.k2=true
```

在即将发布的版本中，K2 kapt 实现将默认启用以取代 K1 kapt，
因此您将不再需要手动启用它。

在新的实现稳定之前，我们非常欢迎您的[反馈](https://youtrack.jetbrains.com/issue/KT-71439/K2-kapt-feedback)。

### 无符号类型与非基元类型之间重载冲突的解析

此版本解决了在以前版本中，当函数针对无符号类型和非基元类型进行重载时可能出现的重载冲突解析问题，
如下例所示：

#### 重载的扩展函数

```kotlin
fun Any.doStuff() = "Any"
fun UByte.doStuff() = "UByte"

fun main() {
    val uByte: UByte = UByte.MIN_VALUE
    uByte.doStuff() // 在 Kotlin 2.1.0 之前存在重载解析歧义
}
```

在早期版本中，调用 `uByte.doStuff()` 会导致歧义，因为 `Any` 和 `UByte` 的扩展函数均适用。

#### 重载的顶层函数

```kotlin
fun doStuff(value: Any) = "Any"
fun doStuff(value: UByte) = "UByte"

fun main() {
    val uByte: UByte = UByte.MIN_VALUE
    doStuff(uByte) // 在 Kotlin 2.1.0 之前存在重载解析歧义
}
```

同样，由于编译器无法决定使用 `Any` 还是 `UByte` 版本，对 `doStuff(uByte)` 的调用也存在歧义。
在 2.1.0 中，编译器现在可以正确处理这些情况，通过赋予更具体的类型（在本例中为 `UByte`）更高优先级来消除歧义。

## Kotlin/JVM

从 2.1.0 版本开始，编译器可以生成包含 Java 23 字节码的类。

### 将 JSpecify 为 null 性不匹配诊断的严重级别更改为 strict

Kotlin 2.1.0 强制执行对来自 `org.jspecify.annotations` 的为 null 性注解的严格处理，
从而提高了 Java 互操作性的类型安全性。

以下为 null 性注解受此影响：

* `org.jspecify.annotations.Nullable`
* `org.jspecify.annotations.NonNull`
* `org.jspecify.annotations.NullMarked`
* `org.jspecify.nullness` 中的旧版注解（JSpecify 0.2 及更早版本）

从 Kotlin 2.1.0 开始，为 null 性不匹配默认从警告提升为错误。
这确保了在类型检查期间强制执行 `@NonNull` 和 `@Nullable` 等注解，
防止运行时出现意外的为 null 性问题。

`@NullMarked` 注解还会影响其作用域内所有成员的为 null 性，
使您在处理带注解的 Java 代码时，行为更加可预测。

以下示例展示了新的默认行为：

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
    // 访问非 null 结果，这是允许的
    sjc.foo().length

    // 在默认的 strict 模式下会报错，因为结果是可为空的
    // 要避免报错，请改用 ?.length
    sjc.bar().length
}
```

您可以手动控制这些注解的诊断严重级别。
为此，请使用 `-Xnullability-annotations` 编译器选项来选择模式：

* `ignore`：忽略为 null 性不匹配。
* `warning`：报告为 null 性不匹配的警告。
* `strict`：报告为 null 性不匹配的错误（默认模式）。

有关更多信息，请参阅[为 null 性注解](java-interop.md#nullability-annotations)。

## Kotlin 多平台

Kotlin 2.1.0 引入了 [Swift 导出的基础支持](#basic-support-for-swift-export)，并使 
[Kotlin 多平台库的发布更加容易](#ability-to-publish-kotlin-libraries-from-any-host)。
它还专注于 Gradle 方面的改进，使[用于配置编译器选项的新 DSL](#new-gradle-dsl-for-compiler-options-in-multiplatform-projects-promoted-to-stable) 达到 Stable，并带来了 [隔离项目 (Isolated Projects) 功能的预览](#preview-gradle-s-isolated-projects-in-kotlin-multiplatform)。

### 用于多平台项目中编译器选项的新 Gradle DSL 已提升至 Stable

在 Kotlin 2.0.0 中，[我们引入了一个新的实验性 Gradle DSL](whatsnew20.md#new-gradle-dsl-for-compiler-options-in-multiplatform-projects)
以简化跨多平台项目的编译器选项配置。
在 Kotlin 2.1.0 中，该 DSL 已提升至 Stable。

整体项目配置现在分为三层。最高层是扩展 (extension) 级别， 
然后是目标 (target) 级别，最低层是编译单元 (compilation unit)（通常是一个编译任务）：

![Kotlin 编译器选项级别](compiler-options-levels.svg){width=700}

要详细了解不同级别以及如何在它们之间配置编译器选项， 
请参阅[编译器选项](https://kotlinlang.org/docs/multiplatform/multiplatform-dsl-reference.html#compiler-options)。

### 在 Kotlin 多平台中预览 Gradle 的隔离项目 (Isolated Projects)

> 此功能处于[实验性](components-stability.md#stability-levels-explained)阶段，目前在 Gradle 中处于 pre-Alpha 状态。
> 请仅在 Gradle 8.10 版本下使用，且仅用于评估目的。该功能可能随时被舍弃或更改。
> 
> 我们欢迎您在 [YouTrack](https://youtrack.jetbrains.com/issue/KT-57279/Support-Gradle-Project-Isolation-Feature-for-Kotlin-Multiplatform) 中提供反馈。 
> 需要选择性启用 (Opt-in)（详见下文）。
>
{style="warning"}

在 Kotlin 2.1.0 中， 
您可以在多平台项目中预览 Gradle 的 [隔离项目 (Isolated Projects)](https://docs.gradle.org/current/userguide/isolated_projects.html) 
功能。

Gradle 中的隔离项目功能通过将单个 Gradle 项目的配置彼此“隔离”来提高构建性能。
每个项目的构建逻辑被限制为不能直接访问其他项目的可变状态，
从而允许它们安全地并行运行。
为了支持这一功能，我们对 Kotlin Gradle 插件的模型进行了一些更改，
并有兴趣听取您在此预览阶段的体验。

有两种方法可以启用 Kotlin Gradle 插件的新模型：

* 选项 1：**在不启用隔离项目的情况下测试兼容性** –
  要在不启用隔离项目功能的情况下检查与 Kotlin Gradle 插件新模型的兼容性，
  请在项目的 `gradle.properties` 文件中添加以下 Gradle 属性：

  ```none
  # gradle.properties
  kotlin.kmp.isolated-projects.support=enable
  ```

* 选项 2：**在启用隔离项目的情况下进行测试** –
  在 Gradle 中启用隔离项目功能会自动将 Kotlin Gradle 插件配置为使用新模型。
  要启用隔离项目功能，请[设置系统属性](https://docs.gradle.org/current/userguide/isolated_projects.html#how_do_i_use_it)。
  在这种情况下，您不需要为项目添加 Kotlin Gradle 插件的 Gradle 属性。

### Swift 导出的基础支持

> 此功能目前处于早期开发阶段。它可能随时被舍弃或更改。
> 需要选择性启用 (Opt-in)（详见下文），且您应仅将其用于评估目的。
> 我们欢迎您在 [YouTrack](https://kotl.in/issue) 中提供反馈。
> 
{style="warning"}

2.1.0 版本迈出了为 Kotlin 提供 Swift 导出支持的第一步，
允许您在不使用 Objective-C 头文件的情况下直接将 Kotlin 源代码导出到 Swift 接口。
这应该会使针对 Apple 目标的多平台开发变得更加容易。

目前的基础支持包括以下能力：

* 将多个 Gradle 模块从 Kotlin 直接导出到 Swift。
* 使用 `moduleName` 属性定义自定义 Swift 模块名称。
* 使用 `flattenPackage` 属性设置包结构的折叠规则。

您可以将项目中的以下构建文件作为设置 Swift 导出的起点：

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
        // 从生成的 Swift 代码中移除包前缀
        flattenPackage = "com.example.sandbox"

        // 导出外部模块
        export(project(":subproject")) {
            // 导出的模块名称
            moduleName = "Subproject"
            // 折叠导出的依赖项规则
            flattenPackage = "com.subproject.library"
        }
    }
}
```

您也可以克隆我们已经设置好 Swift 导出的[公共示例](https://github.com/Kotlin/swift-export-sample)。

编译器会自动生成所有必要的文件（包括 `swiftmodule` 文件、 
静态 `a` 库以及头文件和 `modulemap` 文件），并将它们复制到应用的构建目录中，
您可以从 Xcode 访问这些文件。

#### 如何启用 Swift 导出

请记住，该功能目前仅处于早期开发阶段。

Swift 导出目前适用于使用[直接集成 (direct integration)](https://kotlinlang.org/docs/multiplatform/multiplatform-direct-integration.html) 将 iOS 框架连接到 Xcode 项目的项目。
这是在 Android Studio 中创建或通过 [Web 向导](https://kmp.jetbrains.com/) 创建的 Kotlin 多平台项目的标准配置。

要在您的项目中尝试 Swift 导出：

1. 在您的 `gradle.properties` 文件中添加以下 Gradle 选项：

   ```none
   # gradle.properties
   kotlin.experimental.swift-export.enabled=true
   ```

2. 在 Xcode 中，打开项目设置。
3. 在 **Build Phases** 选项卡上，找到带有 `embedAndSignAppleFrameworkForXcode` 任务的 **Run Script** 阶段。
4. 调整脚本，在运行脚本阶段改为使用 `embedSwiftExportForXcode` 任务：

   ```bash
   ./gradlew :<Shared module name>:embedSwiftExportForXcode
   ```

   ![添加 Swift 导出脚本](xcode-swift-export-run-script-phase.png){width=700}

#### 留下关于 Swift 导出的反馈

我们计划在未来的 Kotlin 版本中扩展并稳定 Swift 导出支持。
请在[这个 YouTrack 问题](https://youtrack.jetbrains.com/issue/KT-64572)中留下您的反馈。

### 能够从任何主机发布 Kotlin 库

> 此功能目前处于[实验性](components-stability.md#stability-levels-explained)阶段。
> 需要选择性启用 (Opt-in)（详见下文），且您应仅将其用于评估目的。
> 我们欢迎您在 [YouTrack](https://youtrack.jetbrains.com/issue/KT-71290) 中提供反馈。
>
{style="warning"}

Kotlin 编译器生产 `.klib` 工件用于发布 Kotlin 库。
以前，您可以从任何主机获取必要的工件，但需要 Mac 机器的 Apple 平台目标除外。 
这给针对 iOS、macOS、tvOS 和 watchOS 目标的 Kotlin 多平台项目带来了特殊的限制。

Kotlin 2.1.0 解除了这一限制，增加了对交叉编译的支持。
现在您可以使用任何[支持的主机](native-target-support.md#hosts)来生产 `.klib` 工件，
这将大大简化 Kotlin 和 Kotlin 多平台库的发布过程。

#### 如何启用从任何主机发布库

要在您的项目中尝试交叉编译，请在 `gradle.properties` 文件中添加以下二进制选项：

```none
# gradle.properties
kotlin.native.enableKlibsCrossCompilation=true
```

此功能目前处于实验性阶段，并有一些局限性。在以下情况下，您仍需使用 Mac 机器：

* 您的库具有 [cinterop 依赖项](native-c-interop.md)。
* 您的项目中设置了 [CocoaPods 集成](https://kotlinlang.org/docs/multiplatform/multiplatform-cocoapods-overview.html)。
* 您需要为 Apple 目标构建或测试[最终二进制文件](https://kotlinlang.org/docs/multiplatform/multiplatform-build-native-binaries.html)。

#### 留下关于从任何主机发布库的反馈

我们计划在未来的 Kotlin 版本中稳定此功能并进一步改进库发布。
请在我们的问题跟踪器 [YouTrack](https://youtrack.jetbrains.com/issue/KT-71290) 中留下您的反馈。

有关更多信息，请参阅[发布多平台库](https://kotlinlang.org/docs/multiplatform/multiplatform-publish-lib-setup.html)。

### 对非打包 klibs 的支持

Kotlin 2.1.0 使得生成非打包 `.klib` 文件工件成为可能。
这让您可以选择直接配置对 klibs 的依赖，而无需先解压它们。

这种变化还可以提高性能，
减少 Kotlin/Wasm、Kotlin/JS 和 Kotlin/Native 项目中的编译和链接时间。

例如，
我们的基准测试显示，在具有 1 个链接和 10 个编译任务的项目上（该项目构建了一个依赖于 9 个简化项目的单个原生可执行二进制文件），总构建时间提高了约 3%。
然而，对构建时间的实际影响取决于子项目的数量及其各自的大小。

#### 如何设置您的项目

默认情况下，Kotlin 编译和链接任务现在已配置为使用新的非打包工件。

如果您设置了用于解析 klibs 的自定义构建逻辑并希望使用新的解压工件，
您需要在 Gradle 构建文件中显式指定首选的 klib 包解析变体：

```kotlin
// build.gradle.kts
import org.jetbrains.kotlin.gradle.plugin.attributes.KlibPackaging
// ...
val resolvableConfiguration = configurations.resolvable("resolvable") {

    // 对于新的非打包配置：
    attributes.attribute(KlibPackaging.ATTRIBUTE, project.objects.named(KlibPackaging.NON_PACKED))

    // 对于之前的打包配置：
    attributes.attribute(KlibPackaging.ATTRIBUTE, project.objects.named(KlibPackaging.PACKED))
}
```

非打包 `.klib` 文件生成在项目构建目录中与之前打包文件相同的路径下。
相应地，打包的 klibs 现在位于 `build/libs` 目录下。

如果没有指定属性，则使用打包变体。
您可以使用以下控制台命令查看可用属性和变体的列表：

```shell
./gradlew outgoingVariants
```

我们欢迎您在 [YouTrack](https://kotl.in/issue) 中对该功能提供反馈。

### 旧版 `android` 目标的进一步弃用

在 Kotlin 2.1.0 中，对旧版 `android` 目标名称的弃用警告已提升为错误。

目前，我们建议在针对 Android 的 Kotlin 多平台项目中使用 `androidTarget` 选项。
这是一个临时解决方案，对于为 Google 即将推出的 Android/KMP 插件腾出 `android` 名称是必要的。

当新插件可用时，我们将提供进一步的迁移指令。
来自 Google 的新 DSL 将是 Kotlin 多平台中 Android 目标支持的首选选项。

有关更多信息，
请参阅 [Kotlin 多平台兼容性指南](https://kotlinlang.org/docs/multiplatform/multiplatform-compatibility-guide.html#rename-of-android-target-to-androidtarget)。

### 舍弃了对声明多个相同类型目标的支持

在 Kotlin 2.1.0 之前，您可以在多平台项目中声明多个相同类型的目标。
然而，这使得区分目标并有效支持共享源集变得具有挑战性。
在大多数情况下，更简单的设置（例如使用单独的 Gradle 项目）效果更好。
有关详细的指导和迁移示例，
请参阅 Kotlin 多平台兼容性指南中的[声明几个类似的目标](https://kotlinlang.org/docs/multiplatform/multiplatform-compatibility-guide.html#declaring-several-similar-targets)。

Kotlin 1.9.20 触发了一个弃用警告，如果您在多平台项目中声明了多个相同类型的目标。
在 Kotlin 2.1.0 中，对于除 Kotlin/JS 目标之外的所有目标，此弃用警告现在都是错误。
要了解为什么 Kotlin/JS 目标被豁免，
请参阅 [YouTrack 中的此问题](https://youtrack.jetbrains.com/issue/KT-47038/KJS-MPP-Split-JS-target-into-JsBrowser-and-JsNode)。

## Kotlin/Native

Kotlin 2.1.0 包括 [`iosArm64` 目标支持的升级](#iosarm64-promoted-to-tier-1)、
[改进的 cinterop 缓存过程](#changes-to-caching-in-cinterop)以及其他更新。

### iosArm64 提升为 Tier 1

对于 [Kotlin 多平台](https://kotlinlang.org/docs/multiplatform/get-started.html)开发至关重要的 `iosArm64` 目标
已提升为 Tier 1。这是 Kotlin/Native 编译器中的最高支持级别。

这意味着该目标会在 CI 流水线上进行定期测试，以确保其能够正常编译和运行。
我们还为该目标提供了编译器版本之间的源代码和二进制兼容性。

有关目标层级的更多信息，请参阅 [Kotlin/Native 目标支持](native-target-support.md)。

### LLVM 版本从 11.1.0 更新至 16.0.0

在 Kotlin 2.1.0 中，我们将 LLVM 版本从 11.1.0 更新到了 16.0.0。
新版本包括错误修复和安全更新。
在某些情况下，它还提供了编译器优化和更快的编译速度。

如果您的项目中有 Linux 目标，
请注意 Kotlin/Native 编译器现在默认对所有 Linux 目标使用 `lld` 链接器。

此更新不应影响您的代码，但如果您遇到任何问题，请报告至我们的[问题跟踪器](http://kotl.in/issue)。

### cinterop 缓存的变化

在 Kotlin 2.1.0 中，我们正在更改 cinterop 缓存过程。它不再具有
[`CacheableTask`](https://docs.gradle.org/current/javadoc/org/gradle/api/tasks/CacheableTask.html) 注解类型。
新的推荐方法是使用 [`cacheIf`](https://docs.gradle.org/current/kotlin-dsl/gradle/org.gradle.api.tasks/-task-outputs/cache-if.html) 
输出类型来缓存任务的结果。

这将解决 `UP-TO-DATE` 
检查无法检测到[定义文件 (definition file)](native-definition-file.md) 中指定的头文件变化的问题，
从而防止构建系统无法重新编译代码。

### 弃用 mimalloc 内存分配器

早在 Kotlin 1.9.0 中，我们就引入了新的内存分配器，随后我们在 Kotlin 1.9.20 中将其默认启用。
新的分配器旨在使垃圾回收更高效，
并提高 Kotlin/Native 内存管理器的运行时性能。

新的内存分配器取代了之前的默认分配器 [mimalloc](https://github.com/microsoft/mimalloc)。
现在是时候在 Kotlin/Native 编译器中弃用 mimalloc 了。

您现在可以从构建脚本中移除 `-Xallocator=mimalloc` 编译器选项。
如果您遇到任何问题，请报告至我们的[问题跟踪器](http://kotl.in/issue)。

有关 Kotlin 中内存分配器和垃圾回收的更多信息，
请参阅 [Kotlin/Native 内存管理](native-memory-manager.md)。

## Kotlin/Wasm

Kotlin/Wasm 收到了多项更新以及 [对增量编译的支持](#support-for-incremental-compilation)。

### 支持增量编译

以前，当您更改 Kotlin 代码中的某些内容时，Kotlin/Wasm 工具链必须重新编译整个代码库。

从 2.1.0 开始，Wasm 目标支持增量编译。
在开发任务中，编译器现在仅重新编译与自上次编译以来的更改相关的文件，
这显著减少了编译时间。

这一变化目前使编译速度提高了一倍，并计划在未来的版本中进一步改进。

在当前的设置中，Wasm 目标的增量编译默认处于禁用状态。
要启用增量编译，请在项目的 `local.properties` 或 `gradle.properties` 文件中添加以下行：

```none
# gradle.properties
kotlin.incremental.wasm=true
```

尝试 Kotlin/Wasm 增量编译
并 [分享您的反馈](https://youtrack.jetbrains.com/issue/KT-72158/Kotlin-Wasm-incremental-compilation-feedback)。
您的洞察将有助于使该功能更快地达到 Stable 并默认启用。

### 浏览器 API 已移至 kotlinx-browser 独立库

以前，Web API 的声明和相关的目标实用程序是 Kotlin/Wasm 标准库的一部分。

在此版本中，`org.w3c.*` 
声明已从 Kotlin/Wasm 标准库移至新的 [kotlinx-browser 库](https://github.com/kotlin/kotlinx-browser)。
该库还包括其他 Web 相关包，例如 `org.khronos.webgl`、`kotlin.dom` 和 `kotlinx.browser`。

这种分离提供了模块化，使得在 Kotlin 发布周期之外独立更新 Web 相关 API 成为可能。
此外，Kotlin/Wasm 标准库现在仅包含在任何 JavaScript 环境中都可用的声明。

要使用已移动包中的声明，
您需要在项目的构建配置文件中添加 `kotlinx-browser` 依赖项：

```kotlin
// build.gradle.kts
val wasmJsMain by getting {
    dependencies {
        implementation("org.jetbrains.kotlinx:kotlinx-browser:0.3")
    }
}
```

### 改进的 Kotlin/Wasm 调试体验

以前，在 Web 浏览器中调试 Kotlin/Wasm 代码时，您可能会在调试界面中遇到
变量值的低级表示。
这通常使得跟踪应用程序的当前状态变得具有挑战性。

![Kotlin/Wasm 旧版调试器](wasm-old-debugger.png){width=700}

为了改善这种体验，在变量视图中添加了自定义格式化程序。
该实现使用了 [自定义格式化程序 API (custom formatters API)](https://firefox-source-docs.mozilla.org/devtools-user/custom_formatters/index.html)，
该 API 在 Firefox 和基于 Chromium 的浏览器等主流浏览器中均受支持。

通过这一变化，您现在可以以更用户友好且易于理解的方式显示和定位变量值。

![Kotlin/Wasm 改进的调试器](wasm-debugger-improved.png){width=700}

要尝试新的调试体验：

1. 将以下编译器选项添加到 `wasmJs {}` 编译器选项中：

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

   * 在 Chrome DevTools 中，可以通过 **Settings | Preferences | Console** 找到：

     ![在 Chrome 中启用自定义格式化程序](wasm-custom-formatters-chrome.png){width=700}

   * 在 Firefox DevTools 中，可以通过 **Settings | Advanced settings** 找到：

     ![在 Firefox 中启用自定义格式化程序](wasm-custom-formatters-firefox.png){width=700}

### 减小 Kotlin/Wasm 二进制文件的大小

生产构建生成的 Wasm 二进制文件大小将减小多达 30%，
您可能还会看到一些性能改进。
这是因为 `--closed-world`、`--type-ssa` 和 `--type-merging` 
Binaryen 选项现在被认为对于所有 Kotlin/Wasm 项目都是安全的，并且默认启用。

### 改进的 Kotlin/Wasm 中的 JavaScript 数组互操作性

虽然 Kotlin/Wasm 的标准库为 JavaScript 数组提供了 `JsArray<T>` 类型，
但没有直接的方法将 `JsArray<T>` 转换为 Kotlin 的原生 `Array` 或 `List` 类型。

这种差距要求为数组转换创建自定义函数，使 Kotlin 和 JavaScript 代码之间的互操作性变得复杂。

此版本引入了一个适配器函数，该函数可自动将 `JsArray<T>` 转换为 `Array<T>`，反之亦然，
从而简化了数组操作。

以下是泛型类型之间转换的示例：Kotlin `List<T>` 和 `Array<T>` 转换为 JavaScript `JsArray<T>`。

```kotlin
val list: `List<JsString>` =
    listOf("Kotlin", "Wasm").map { it.toJsString() }

// 使用 .toJsArray() 将 List 或 Array 转换为 JsArray
val jsArray: JsArray<JsString> = list.toJsArray()

// 使用 .toArray() 和 .toList() 将其转换回 Kotlin 类型 
val kotlinArray: `Array<JsString>` = jsArray.toArray()
val kotlinList: `List<JsString>` = jsArray.toList()
```

类似的转换方法也适用于将类型化数组转换为其 Kotlin 等效项
（例如 `IntArray` 和 `Int32Array`）。有关详细信息和实现，
请参阅 [`kotlinx-browser` 仓库]( https://github.com/Kotlin/kotlinx-browser/blob/dfbdceed314567983c98f1d66e8c2e10d99c5a55/src/wasmJsMain/kotlin/arrayCopy.kt)。

以下是类型化数组之间转换的示例：Kotlin `IntArray` 转换为 JavaScript `Int32Array`。

```kotlin
import org.khronos.webgl.*

    // ...

    val intArray: IntArray = intArrayOf(1, 2, 3)
    
    // 使用 .toInt32Array() 将 Kotlin IntArray 转换为 JavaScript Int32Array
    val jsInt32Array: Int32Array = intArray.toInt32Array()
    
    // 使用 toIntArray() 将 JavaScript Int32Array 转换回 Kotlin IntArray
    val kotlinIntArray: IntArray = jsInt32Array.toIntArray()
```

### 支持在 Kotlin/Wasm 中访问 JavaScript 异常详细信息

以前，当 Kotlin/Wasm 中发生 JavaScript 异常时， 
`JsException` 类型仅提供一条通用消息，而没有来自原始 JavaScript 错误的详细信息。

从 Kotlin 2.1.0 开始，您可以通过启用特定的编译器选项来配置 `JsException` 
以包含原始错误消息和堆栈跟踪。这提供了更多上下文来帮助诊断源自 JavaScript 的问题。

此行为取决于 `WebAssembly.JSTag` API，该 API 仅在某些浏览器中可用：

* **Chrome**：从版本 115 开始支持
* **Firefox**：从版本 129 开始支持
* **Safari**：尚未支持

要启用此功能（默认处于禁用状态）， 
请将以下编译器选项添加到您的 `build.gradle.kts` 文件中：

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

以下示例演示了新的行为：

```kotlin
external object JSON {
    fun <T: JsAny> parse(json: String): T
}

fun main() {
    try {
        JSON.parse("an invalid JSON")
    } catch (e: JsException) {
        println("Thrown value is: ${e.thrownValue}")
        // Thrown value is: SyntaxError: Unexpected token 'a', "an invalid JSON" is not valid JSON

        println("Message: ${e.message}")
        // Message: Unexpected token 'a', "an invalid JSON" is not valid JSON

        println("Stacktrace:")
        // Stacktrace:

        // 打印完整的 JavaScript 堆栈跟踪 
        e.printStackTrace()
    }
}
```

在启用 `-Xwasm-attach-js-exception` 选项的情况下，`JsException` 会提供来自 JavaScript 错误的特定详细信息。如果没有该选项，`JsException` 仅包含一条通用消息，指出在运行 JavaScript 代码时抛出了异常。

### 弃用默认导出

作为向命名导出 (named exports) 迁移的一部分，
以前在 JavaScript 中对 Kotlin/Wasm 导出使用默认导入 (default import) 时，控制台会打印错误。

在 2.1.0 中，默认导入已被完全移除，以全面支持命名导出。

在针对 Kotlin/Wasm 目标编写 JavaScript 代码时，您现在需要使用相应的命名导入而不是默认导入。

这一变化标志着迁移到命名导出的弃用周期的最后阶段：

**在 2.0.0 版本中：** 控制台会打印警告消息，解释通过默认导出导出实体已被弃用。

**在 2.0.20 版本中：** 会发生错误，要求使用相应的命名导入。

**在 2.1.0 版本中：** 使用默认导入已被完全移除。

### 子项目特定的 Node.js 设置

您可以通过为 `rootProject` 定义 `NodeJsRootPlugin` 类的属性来为项目配置 Node.js 设置。
在 2.1.0 中，您可以使用新类 `NodeJsPlugin` 为每个子项目配置这些设置。
以下示例演示了如何为子项目设置特定的 Node.js 版本：

```kotlin
// build.gradle.kts
project.plugins.withType<org.jetbrains.kotlin.gradle.targets.js.nodejs.NodeJsPlugin> {
    project.the<org.jetbrains.kotlin.gradle.targets.js.nodejs.NodeJsEnvSpec>().version = "22.0.0"
}
```

要为整个项目使用新类，请在 `allprojects {}` 代码块中添加相同的代码：

```kotlin
// build.gradle.kts
allprojects {
    project.plugins.withType<org.jetbrains.kotlin.gradle.targets.js.nodejs.NodeJsPlugin> {
        project.the<org.jetbrains.kotlin.gradle.targets.js.nodejs.NodeJsEnvSpec>().version = "your Node.js version"
    }
}
```

您还可以使用 Gradle 约定插件 (convention plugins) 将设置应用于一组特定的子项目。

## Kotlin/JS

### 支持属性中的非标识符字符

Kotlin/JS 以前不允许对使用反引号括起来的[测试方法名称](coding-conventions.md#names-for-test-methods)包含空格。

同样，也无法访问包含 Kotlin 标识符中不允许的字符（如连字符或空格）的 JavaScript 对象属性：

```kotlin
external interface Headers {
    var accept: String?

    // 由于连字符，这是无效的 Kotlin 标识符
    var `content-length`: String?
}

val headers: Headers = TODO("value provided by a JS library")
val accept = headers.accept
// 由于属性名中的连字符，会导致错误
val length = headers.`content-length`
```

这种行为与 JavaScript 和 TypeScript 不同，后者允许使用非标识符字符访问此类属性。

从 Kotlin 2.1.0 开始，此功能默认启用。
Kotlin/JS 现在允许您使用反引号 (``) 和 `@JsName` 注解与包含非标识符字符的 JavaScript 属性进行交互，并能使用对应的测试方法名称。

此外，
您可以使用 `@JsName` 和 `@JsQualifier` 注解将 Kotlin 属性名称映射到 JavaScript 等效项：

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
    // 在 JavaScript 中，这被编译为 Bar.property_example_HASH
    println(Bar.`property example`)
    // 在 JavaScript 中，这被编译为 fooNamespace["property example"]
    println(Foo.`property example`)
    // 在 JavaScript 中，这被编译为 Baz["property example"]
    println(Baz.`property example`)
}
```

### 支持生成 ES2015 箭头函数

在 Kotlin 2.1.0 中，Kotlin/JS 引入了对生成 ES2015 箭头函数（例如 `(a, b) => expression`）而非匿名函数的支持。

使用箭头函数可以减小项目的包大小，尤其是在使用实验性的 `-Xir-generate-inline-anonymous-functions` 模式时。这还使得生成的代码更符合现代 JS 标准。

当以 ES2015 为目标时，此功能默认启用。或者，您可以通过使用 `-Xes-arrow-functions` 命令行参数来启用它。

详细了解 [官方文档中的 ES2015 (ECMAScript 2015, ES6)](https://262.ecma-international.org/6.0/)。

## Gradle 改进

Kotlin 2.1.0 与 Gradle 7.6.3 到 8.6 完全兼容。
Gradle 8.7 到 8.10 也受支持，但有一个例外。
如果您使用 Kotlin 多平台 Gradle 插件，
您可能会在调用 JVM 目标中的 `withJava()` 函数的多平台项目中看到弃用警告。我们计划尽快解决此问题。

有关更多信息，
请参阅 [YouTrack](https://youtrack.jetbrains.com/issue/KT-66542) 中的相关问题。

您也可以使用最新发布的 Gradle 版本，但如果这样做，请记住您可能会遇到弃用警告，或者某些新的 Gradle 功能可能无法工作。

### 支持的最低 AGP 版本提升至 7.3.1

从 Kotlin 2.1.0 开始，支持的最低 Android Gradle 插件版本为 7.3.1。

### 支持的最低 Gradle 版本提升至 7.6.3

从 Kotlin 2.1.0 开始，支持的最低 Gradle 版本为 7.6.3。

### 用于 Kotlin Gradle 插件扩展的新 API

Kotlin 2.1.0 引入了一个新 API，可以更轻松地创建自己的插件来配置 Kotlin Gradle 插件。
此项变更弃用了 `KotlinTopLevelExtension` 和 `KotlinTopLevelExtensionConfig` 
接口，并为插件作者引入了以下接口：

| 名称 | 描述 |
|--------------------------|----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `KotlinBaseExtension` | 一种插件 DSL 扩展类型，用于为整个项目配置通用 Kotlin JVM、Android 和多平台插件选项：<list><li>`org.jetbrains.kotlin.jvm`</li><li>`org.jetbrains.kotlin.android`</li><li>`org.jetbrains.kotlin.multiplatform`</li></list> |
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

要专门为 JVM 项目配置编译器选项，请使用 `KotlinJvmExtension`：

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

此示例同样将 JVM 项目的 JVM 目标配置为 17。
它还为项目配置了 Maven 发布，以便将其输出发布到 Maven 仓库。

您可以以完全相同的方式使用 `KotlinAndroidExtension`。

### 对 Kotlin Gradle 插件 API 隐藏编译器符号

以前，KGP 在其运行时依赖项中包含 `org.jetbrains.kotlin:kotlin-compiler-embeddable`，使得内部编译器符号在构建脚本类路径中可用。
这些符号仅供内部使用。

从 Kotlin 2.1.0 开始，KGP 在其 JAR 文件中捆绑了 `org.jetbrains.kotlin:kotlin-compiler-embeddable` 类文件的子集，并逐步移除它们。这一变更旨在防止兼容性问题并简化 KGP 维护。

如果您的构建逻辑的其他部分（例如像 `kotlinter` 这样的插件）依赖于与 KGP 捆绑版本不同的 `org.jetbrains.kotlin:kotlin-compiler-embeddable` 版本，
则可能会导致冲突和运行时异常。

为了防止此类问题，如果 `org.jetbrains.kotlin:kotlin-compiler-embeddable` 与 KGP 同时出现在构建类路径中，KGP 现在会显示警告。

作为长期解决方案，如果您是使用 `org.jetbrains.kotlin:kotlin-compiler-embeddable` 类的插件作者，我们建议在隔离的类加载器中运行它们。
例如，您可以使用 [Gradle Workers API](https://docs.gradle.org/current/userguide/worker_api.html) 通过类加载器或进程隔离来实现。

#### 使用 Gradle Workers API

此示例演示了如何在生成 Gradle 插件的项目中安全地使用 Kotlin 编译器。
首先，在构建脚本中添加一个 compile-only 依赖项。
这使得该符号仅在编译时可用：

```kotlin
// build.gradle.kts
dependencies {
    compileOnly("org.jetbrains.kotlin:kotlin-compiler-embeddable:%kotlinVersion%")
}
```

接下来，定义一个 Gradle work action 来打印 Kotlin 编译器版本：

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

现在创建一个任务，该任务使用类加载器隔离将此操作提交给 worker 运行器：

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

最后，在您的 Gradle 插件中配置 Kotlin 编译器类路径：

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

## Compose 编译器更新

### 支持多个稳定性配置文件

Compose 编译器可以解释多个稳定性配置文件，
但 Compose 编译器 Gradle 插件的 `stabilityConfigurationFile` 选项以前仅允许
指定单个文件。
在 Kotlin 2.1.0 中，此功能经过了重新设计，允许您为单个模块使用多个稳定性配置文件：

* `stabilityConfigurationFile` 选项已弃用。
* 有一个新选项 `stabilityConfigurationFiles`，其类型为 `ListProperty<RegularFile>`。

以下是如何使用新选项向 Compose 编译器传递多个文件：

```kotlin
// build.gradle.kt
composeCompiler {
    stabilityConfigurationFiles.addAll(
        project.layout.projectDirectory.file("configuration-file1.conf"),
        project.layout.projectDirectory.file("configuration-file2.conf"),
    )
}
```

### 可暂停的组合 (Pausable composition)

可暂停的组合是一项新的实验性功能，它改变了编译器生成可跳过函数的方式。 
启用此功能后，组合可以在运行时的跳过点挂起，
允许将运行时间较长的组合过程拆分到多个帧中。
可暂停的组合用于延迟列表和其他性能密集型组件中，用于预取内容，
这些内容如果以阻塞方式执行，可能会导致掉帧。

要尝试可暂停的组合，请在 Compose 编译器的 Gradle 配置中添加以下功能标志：

```kotlin
// build.gradle.kts
composeCompiler {
    featureFlags = setOf(
        ComposeFeatureFlag.PausableComposition
    )
}
```

> 此功能的运行时支持已在 `androidx.compose.runtime` 的 1.8.0-alpha02 版本中添加。
> 该功能标志在与旧版本运行时一起使用时无效。
>
{style="note"}

### 对 open 和被重写的 @Composable 函数的更改

虚拟（open、abstract 和被重写）的 `@Composable` 函数不再是可重启的 (restartable)。
可重启组的生成代码所生成的调用在[配合继承使用时无法正常工作](https://issuetracker.google.com/329477544)，会导致运行时崩溃。

这意味着虚拟函数将不会被重启或跳过：
每当它们的状态失效时，运行时将改为重新组合它们的父级组合。
如果您的代码对重新组合敏感，您可能会注意到运行时行为的变化。

### 性能改进

Compose 编译器过去会创建模块 IR 的完整副本以转换 `@Composable` 类型。
除了在复制与 Compose 无关的元素时增加内存消耗外，
这种行为在[某些极端情况](https://issuetracker.google.com/365066530)下还会破坏下游编译器插件。

此复制操作已被移除，可能会带来更快的编译速度。

## 标准库

### 标准库 API 弃用严重级别的变更

在 Kotlin 2.1.0 中，我们将多项标准库 API 的弃用严重级别从 warning 提升为 error。
如果您的代码依赖于这些 API，您需要对其进行更新以确保兼容性。
最显著的变化包括：

* **弃用了对 `Char` 和 `String` 的区域性相关的字母大小写转换函数：**
  像 `Char.toLowerCase()`、`Char.toUpperCase()`、`String.toUpperCase()` 
  和 `String.toLowerCase()` 这样的函数现已弃用，使用它们会导致错误。
  请将其替换为与区域性无关的函数替代方案或其他大小写转换机制。
  如果您想继续使用默认区域性，请将 `String.toLowerCase()` 等调用替换为 
  `String.lowercase(Locale.getDefault())`，显式指定区域性。
  对于与区域性无关的转换，请将其替换为 `String.lowercase()`，它默认使用固定不变的 (invariant) 区域性。

* **弃用了 Kotlin/Native 冻结 (freezing) API：**
  使用之前标有 `@FreezingIsDeprecated` 注解的冻结相关声明现在会导致错误。
  这一变更反映了 Kotlin/Native 从旧版内存管理器（要求冻结对象以便在线程间共享）的转型。
  要了解如何在新的内存模型中从冻结相关 API 进行迁移，
  请参阅 [Kotlin/Native 迁移指南](native-migration-guide.md#update-your-code)。
  有关更多信息，请参阅[关于弃用冻结的公告](whatsnew1720.md#freezing)。

* **`appendln()` 已弃用，建议改用 `appendLine()`：**
  `StringBuilder.appendln()` 和 `Appendable.appendln()` 函数现已弃用，使用它们会导致错误。
  要替换它们，请改用 `StringBuilder.appendLine()` 或 `Appendable.appendLine()` 函数。
  `appendln()` 函数被弃用是因为在 Kotlin/JVM 上，它使用 `line.separator` 系统属性，
  该属性在每个操作系统上的默认值不同。在 Kotlin/JVM 上，此属性在 Windows 上默认为 `\r
` (CR LF)，在其他系统上默认为 `
` (LF)。
  另一方面，`appendLine()` 函数始终使用 `
` (LF) 作为行分隔符，确保了跨平台的一致行为。

有关此版本中受影响 API 的完整列表，请参阅 [KT-71628](https://youtrack.jetbrains.com/issue/KT-71628) YouTrack 问题。

### java.nio.file.Path 的稳定文件树遍历扩展

Kotlin 1.7.20 为 `java.nio.file.Path` 类引入了实验性的[扩展函数](extensions.md#extension-functions)，
允许您遍历文件树。
在 Kotlin 2.1.0 中，以下文件树遍历扩展现在已达到 [Stable](components-stability.md#stability-levels-explained)：

* `walk()` 惰性遍历以指定路径为根的文件树。
* `fileVisitor()` 使得能够单独创建一个 `FileVisitor`。 
  `FileVisitor` 指定在遍历过程中对目录和文件执行的操作。
* `visitFileTree(fileVisitor: FileVisitor, ...)` 遍历文件树，
  在遇到每个条目时调用指定的 `FileVisitor`，它在底层使用了 `java.nio.file.Files.walkFileTree()` 函数。
* `visitFileTree(..., builderAction: FileVisitorBuilder.() -> Unit)` 使用提供的 `builderAction` 创建一个 `FileVisitor` 
  并调用 `visitFileTree(fileVisitor, ...)` 函数。
* `sealed interface FileVisitorBuilder` 允许您定义自定义 `FileVisitor` 实现。
* `enum class PathWalkOption` 为 `Path.walk()` 函数提供遍历选项。

下面的示例演示了如何使用这些文件遍历 API 来创建自定义 `FileVisitor` 行为，
这允许您定义访问文件和目录的特定操作。

例如，您可以显式创建一个 `FileVisitor` 并在以后使用它：

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

// 占位符：此处添加遍历前常规设置的逻辑
projectDirectory.visitFileTree(cleanVisitor)
```

您也可以使用 `builderAction` 创建一个 `FileVisitor` 并立即用于遍历：

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

此外，您可以使用 `walk()` 函数遍历以指定路径为根的文件树：

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

## 文档更新

Kotlin 文档收到了一些值得注意的变更：

### 语言概念

* 改进了[空安全](null-safety.md)页面 – 学习如何安全地处理代码中的 `null` 值。
* 改进了[对象声明和表达式](object-declarations.md)页面 – 
  学习如何在一个步骤中定义类并创建实例。
* 改进了 [`when` 表达式和语句](control-flow.md#when-expressions-and-statements)部分 – 
  学习 `when` 条件语句及其用法。
* 更新了 [Kotlin 路线图](roadmap.md)、[Kotlin 演进原则](kotlin-evolution-principles.md)
  以及 [Kotlin 语言功能和提案](kotlin-language-features-and-proposals.md)页面 – 
  学习 Kotlin 的计划、持续开发和指导原则。

### Compose 编译器

* [Compose 编译器文档](compose-compiler-migration-guide.md)现在位于“编译器和插件”部分 – 
  学习 Compose 编译器、编译器选项以及迁移步骤。

### API 参考

* 新的 [Kotlin Gradle 插件 API 参考](https://kotlinlang.org/api/kotlin-gradle-plugin) – 
  探索 Kotlin Gradle 插件和 Compose 编译器 Gradle 插件的 API 参考。

### 多平台开发

* 新的[为多平台构建 Kotlin 库](https://kotlinlang.org/docs/api-guidelines-build-for-multiplatform.html)页面 – 
  学习如何为 Kotlin 多平台设计您的 Kotlin 库。
* 新的 [Kotlin 多平台入门](https://kotlinlang.org/docs/multiplatform/get-started.html)页面 – 学习 Kotlin 多平台的核心概念、依赖项、库等。
* 新的 [iOS 集成](https://kotlinlang.org/docs/multiplatform/multiplatform-ios-integration-overview.html)部分 – 学习如何将 Kotlin 多平台共享模块集成到您的 iOS 应用中。
* 新的 [Kotlin/Native 定义文件](native-definition-file.md)页面 – 学习如何创建定义文件以使用 C 和 Objective-C 库。
* [WASI 入门](wasm-wasi.md) – 
  学习如何在各种 WebAssembly 虚拟机中使用 WASI 运行简单的 Kotlin/Wasm 应用程序。

### 工具

* [新的 Dokka 迁移指南](dokka-migration.md) – 学习如何迁移到 Dokka Gradle 插件 v2。

## Kotlin 2.1.0 兼容性指南

Kotlin 2.1.0 是一个功能版本，因此可能会带来与您为早期版本的语言编写的代码不兼容的更改。
请在 [Kotlin 2.1.0 兼容性指南](compatibility-guide-21.md)中找到这些更改的详细列表。

## 安装 Kotlin 2.1.0

从 IntelliJ IDEA 2023.3 和 Android Studio Iguana (2023.2.1) Canary 15 开始，Kotlin 插件作为捆绑插件包含在您的 IDE 中分发。这意味着您无法再从 JetBrains Marketplace 安装该插件。

要更新到新的 Kotlin 版本，请在您的构建脚本中将 [Kotlin 版本更改](releases.md#update-to-a-new-kotlin-version)为 2.1.0。