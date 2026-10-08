[//]: # (title: 选择加入要求)

Kotlin 标准库提供了一种机制，用于要求并给予使用某些 API 元素的显式许可。
这种机制允许库作者向用户告知需要选择加入的特定条件，
例如当 API 处于实验性状态且将来可能发生更改时。 

为了保护用户，编译器会对这些情况发出警告，并要求用户在能够使用该 API 之前进行选择加入。

## 选择加入 API {id="opt-in-to-api"}

如果库作者将库 API 中的某个声明标记为 **[要求选择加入](#require-opt-in-to-use-api)**，
则必须先给予显式许可，然后才能在代码中使用它。
有几种选择加入的方法。我们建议选择最适合你情况的方法。

### 局部选择加入 {id="opt-in-locally"}

要在代码中使用特定的 API 元素时局部地选择加入，请使用 [`@OptIn`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin/-opt-in/)
注解，并引用实验性 API 标记。例如，假设你想使用 `DateProvider` 类，
该类要求选择加入：

```kotlin
// 库代码
@RequiresOptIn(message = "This API is experimental. It could change in the future without notice.")
@Retention(AnnotationRetention.BINARY)
@Target(AnnotationTarget.CLASS, AnnotationTarget.FUNCTION)
annotation class MyDateTime

@MyDateTime
// 一个要求选择加入的类
class DateProvider
```

在你的代码中，在声明使用 `DateProvider` 类的函数之前，添加 `@OptIn` 注解并
引用 `MyDateTime` 注解类：

```kotlin
// 客户端代码
@OptIn(MyDateTime::class)

// 使用 DateProvider
fun getDate(): Date {
    val dateProvider: DateProvider
    // ...
}
```

需要注意的是，采用这种方法，如果 `getDate()` 函数在代码的其他地方被调用或被
另一位开发者使用，则不需要选择加入：

```kotlin
// 客户端代码
@OptIn(MyDateTime::class)

// 使用 DateProvider
fun getDate(): Date {
    val dateProvider: DateProvider
    // ...
}

fun displayDate() {
    // OK：不需要选择加入
    println(getDate()) 
}
```

选择加入要求不会被传播，这意味着其他人可能会在不知情的情况下使用实验性 API。为了避免这种情况，
传播选择加入要求会更安全。

#### 传播选择加入要求 {id="propagate-opt-in-requirements"}

当你在代码（例如库）中使用旨在供第三方使用的 API 时，也可以将其选择加入要求传播到
你的 API 中。为此，请使用库所使用的同一个 **[选择加入要求注解](#create-opt-in-requirement-annotations)**
来标记你的声明。

例如，在声明使用 `DateProvider` 类的函数之前，添加 `@MyDateTime` 注解：

```kotlin
// 客户端代码
@MyDateTime
fun getDate(): Date {
    // OK：该函数也要求选择加入
    val dateProvider: DateProvider
    // ...
}

fun displayDate() {
    println(getDate())
    // 错误：getDate() 要求选择加入
}
```

如本例所示，带注解的函数看起来像是 `@MyDateTime` API 的一部分。
该选择加入将选择加入要求传播给了 `getDate()` 函数的用户。

如果 API 元素的签名包含要求选择加入的类型，则签名本身也必须要求选择加入。
否则，如果 API 元素不要求选择加入，但其签名包含一个要求的类型，则使用该元素会触发错误。

```kotlin
// 客户端代码
@MyDateTime
fun getDate(dateProvider: DateProvider = DateProvider()): Date

@MyDateTime
fun displayDate() {
    // OK：该函数也要求选择加入
    println(getDate())
}
```

同样，如果你将 `@OptIn` 应用于一个签名中包含要求选择加入类型的声明，选择加入要求
仍会传播：

```kotlin
// 客户端代码
@OptIn(MyDateTime::class)
// 由于签名中存在 DateProvider，因此传播选择加入要求
fun getDate(dateProvider: DateProvider = DateProvider()): Date

fun displayDate() {
    println(getDate())
    // 错误：getDate() 要求选择加入
}
```

在传播选择加入要求时，务必理解一点：如果某个 API 元素变得稳定且不再
具有选择加入要求，则任何其他仍具有选择加入要求的 API 元素仍保持实验性。例如，
假设库作者删除了 `getDate()` 函数的选择加入要求，因为它现在已经稳定：

```kotlin
// 库代码
// 不再有选择加入要求
fun getDate(): Date {
    val dateProvider: DateProvider
    // ...
}
```

如果你在没有删除选择加入注解的情况下使用 `displayDate()` 函数，即使
不再需要选择加入，它也仍然是实验性的：

```kotlin
// 客户端代码

// 仍然是实验性的！
@MyDateTime 
fun displayDate() {
    // 使用一个稳定的库函数
    println(getDate())
}
```

#### 选择加入多个 API {id="opt-in-to-multiple-apis"}

要选择加入多个 API，请使用它们所有的选择加入要求注解来标记声明。例如：

```kotlin
@ExperimentalCoroutinesApi
@FlowPreview
```

或者使用 `@OptIn`：

```kotlin
@OptIn(ExperimentalCoroutinesApi::class, FlowPreview::class)
```

### 在文件中选择加入 {id="opt-in-a-file"}

要在文件中为所有函数和类使用要求选择加入的 API，请在包规范和导入之前的
文件顶部添加文件级注解 `@file:OptIn`。

 ```kotlin
 // 客户端代码
 @file:OptIn(MyDateTime::class)
 ```

### 在模块中选择加入 {id="opt-in-a-module"}

> `-opt-in` 编译器选项从 Kotlin 1.6.0 开始提供。对于早期的 Kotlin 版本，请使用 `-Xopt-in`。
>
{style="note"}

如果你不想为每个要求选择加入的 API 用法都添加注解，可以为整个模块选择加入它们。
要在模块中选择加入使用某个 API，请使用参数 `-opt-in` 进行编译，
并指定你所使用的 API 的选择加入要求注解的完全限定名称：`-opt-in=org.mylibrary.OptInAnnotation`。
使用此参数进行编译的效果等同于模块中的每个声明都具有注解 `@OptIn(OptInAnnotation::class)`。

如果你使用 Gradle 构建模块，可以像这样添加参数：

<tabs group="build-script">
<tab title="Kotlin" group-key="kotlin">

```kotlin
import org.jetbrains.kotlin.gradle.tasks.KotlinCompilationTask
// ...

tasks.named<KotlinCompilationTask<*>>("compileKotlin").configure {
    compilerOptions.optIn.add("org.mylibrary.OptInAnnotation")
}
```

</tab>
<tab title="Groovy" group-key="groovy">

```groovy
import org.jetbrains.kotlin.gradle.tasks.KotlinCompilationTask
// ...

tasks.named('compileKotlin', KotlinCompilationTask) {
    compilerOptions {
        optIn.add('org.mylibrary.OptInAnnotation')
    }
}
```

</tab>
</tabs>

如果你的 Gradle 模块是多平台模块，请使用 `optIn` 方法：

<tabs group="build-script">
<tab title="Kotlin" group-key="kotlin">

```kotlin
kotlin {
    compilerOptions {
        optIn.add("org.mylibrary.OptInAnnotation")
    }
}
```

</tab>
<tab title="Groovy" group-key="groovy">

```groovy
kotlin {
    compilerOptions {
        optIn.add('org.mylibrary.OptInAnnotation')
    }
}
```

</tab>
</tabs>

对于 Maven，请使用以下配置：

```xml
<build>
    <plugins>
        <plugin>
            <groupId>org.jetbrains.kotlin</groupId>
            <artifactId>kotlin-maven-plugin</artifactId>
            <version>${kotlin.version}</version>
            <executions>...</executions>
            <configuration>
                <args>
                    <arg>-opt-in=org.mylibrary.OptInAnnotation</arg>                    
                </args>
            </configuration>
        </plugin>
    </plugins>
</build>
```

要在模块级别选择加入多个 API，请为模块中使用的每个选择加入要求标记添加上述参数之一。

### 选择加入以从类或接口继承 {id="opt-in-to-inherit-from-a-class-or-interface"}

有时，库作者提供了 API，但希望要求用户在扩展它之前显式地选择加入。 
例如，库 API 的使用可能是稳定的，但继承可能并不稳定，因为它将来可能会通过
新的抽象函数进行扩展。库作者可以通过使用 [`@SubclassOptInRequired`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin/-subclass-opt-in-required/) 注解标记 [open](inheritance.md) 或 [抽象类](classes.md#abstract-classes) 以及 [非函数式接口](interfaces.md) 来强制执行此要求。

要在代码中选择加入使用此类 API 元素并对其进行扩展，请使用 `@SubclassOptInRequired` 注解
并引用该注解类。例如，假设你想使用 `CoreLibraryApi` 接口，该接口
要求选择加入：

```kotlin
// 库代码
@RequiresOptIn(
 level = RequiresOptIn.Level.WARNING,
 message = "Interfaces in this library are experimental"
)
annotation class UnstableApi()

@SubclassOptInRequired(UnstableApi::class)
// 一个要求选择加入以扩展的接口
interface CoreLibraryApi 
```

在你的代码中，在创建一个继承自 `CoreLibraryApi` 接口的新接口之前，添加 `@SubclassOptInRequired`
注解并引用 `UnstableApi` 注解类：

```kotlin
// 客户端代码
@SubclassOptInRequired(UnstableApi::class)
interface SomeImplementation : CoreLibraryApi
```

请注意，当你在类上使用 `@SubclassOptInRequired` 注解时，选择加入要求不会传播到
任何 [内部或嵌套类](nested-classes.md)：

```kotlin
// 库代码
@RequiresOptIn
annotation class ExperimentalFeature

@SubclassOptInRequired(ExperimentalFeature::class)
open class FileSystem {
    open class File
}

// 客户端代码

// 需要选择加入
class NetworkFileSystem : FileSystem()

// 嵌套类
// 不需要选择加入
class TextFile : FileSystem.File()
```

或者，你也可以通过使用 `@OptIn` 注解来选择加入。你还可以使用实验性标记注解
将该要求进一步传播到代码中该类的任何用法：

```kotlin
// 客户端代码
// 使用 @OptIn 注解
@OptInRequired(UnstableApi::class)
interface SomeImplementation : CoreLibraryApi

// 使用引用注解类的注解
// 进一步传播选择加入要求
@UnstableApi
interface SomeImplementation : CoreLibraryApi
```

## 要求选择加入以使用 API {id="require-opt-in-to-use-api"}

你可以要求库的用户在能够使用你的 API 之前进行选择加入。此外，你可以向用户
告知使用你的 API 的任何特殊条件，直到你决定删除选择加入要求为止。

### 创建选择加入要求注解 {id="create-opt-in-requirement-annotations"}

要要求选择加入以使用你模块的 API，请创建一个注解类作为 **选择加入要求注解**。
该类必须使用 [`@RequiresOptIn`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin/-requires-opt-in/) 进行注解：

```kotlin
@RequiresOptIn
@Retention(AnnotationRetention.BINARY)
@Target(AnnotationTarget.CLASS, AnnotationTarget.FUNCTION)
annotation class MyDateTime
```

选择加入要求注解必须满足几个要求。它们必须具有：

* `BINARY` 或 `RUNTIME` [保留期 (retention)](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.annotation/-retention/)。
* `EXPRESSION`、`FILE`、`TYPE` 或 `TYPE_PARAMETER` 以外的 [目标 (target)](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.annotation/-target/)。
* 无参数。

选择加入要求可以具有两种严重 [级别 (level)](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin/-requires-opt-in/-level/) 之一：

* `RequiresOptIn.Level.ERROR`。选择加入是强制性的。否则，使用标记 API 的代码将无法编译。这是默认级别。
* `RequiresOptIn.Level.WARNING`。选择加入不是强制性的，但建议这样做。如果不选择加入，编译器会发出警告。

要设置所需的级别，请指定 `@RequiresOptIn` 注解的 `level` 参数。

此外，你可以向 API 用户提供一条 `message`。编译器会向试图在未选择加入的情况下
使用该 API 的用户显示此消息：

```kotlin
@RequiresOptIn(level = RequiresOptIn.Level.WARNING, message = "This API is experimental. It can be incompatibly changed in the future.")
@Retention(AnnotationRetention.BINARY)
@Target(AnnotationTarget.CLASS, AnnotationTarget.FUNCTION)
annotation class ExperimentalDateTime
```

如果你发布了多个要求选择加入的独立功能，请为每个功能声明一个注解。
这会使你的客户端使用 API 时更安全，因为他们只能使用他们显式接受的功能。
这也意味着你可以独立地删除功能的选择加入要求，从而使你的 API 更易于
维护。

### 标记 API 元素 {id="mark-api-elements"}

要要求选择加入以使用 API 元素，请使用选择加入要求注解来标记其声明：

```kotlin
@MyDateTime
class DateProvider

@MyDateTime
fun getTime(): Time {}
```

请注意，对于某些语言元素，选择加入要求注解不适用：

* 你不能为属性的支持字段或 getter 添加注解，只能为属性本身添加注解。
* 你不能为局部变量或值参数添加注解。

## 要求选择加入以扩展 API {id="require-opt-in-to-extend-api"}

有时，你可能希望对 API 的哪些特定部分可以被使用和
扩展进行更精细的控制。例如，当你有一些 API 使用起来很稳定，但：

* 由于持续演进，**实现起来不稳定**，例如当你有一组接口，并预计在其中添加没有默认实现的新的抽象函数。
* **实现起来微妙或脆弱**，例如需要以协调方式运行的单个函数。
* **具有将来可能被削弱的契约**，且对于外部实现来说是以不向后兼容的方式更改，例如将输入参数 `T` 更改为可为 null 的版本 `T?`，而代码之前未考虑 `null` 值。

在这种情况下，你可以要求用户在进一步扩展你的 API 之前先选择加入。用户可以通过
继承 API 或实现抽象函数来扩展你的 API。通过使用 [`@SubclassOptInRequired`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin/-subclass-opt-in-required/) 注解，
你可以为 [open](inheritance.md) 或 [抽象类](classes.md#abstract-classes) 以及 [非函数式接口](interfaces.md) 强制执行此选择加入要求。

要向 API 元素添加选择加入要求，请使用 [`@SubclassOptInRequired`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin/-subclass-opt-in-required/)
注解并引用该注解类：

```kotlin
@RequiresOptIn(
 level = RequiresOptIn.Level.WARNING,
 message = "Interfaces in this library are experimental"
)
annotation class UnstableApi()

@SubclassOptInRequired(UnstableApi::class)
// 一个要求选择加入以扩展的接口
interface CoreLibraryApi 
```

请注意，当你使用 `@SubclassOptInRequired` 注解要求选择加入时，该要求不会传播到
任何 [内部或嵌套类](nested-classes.md)。

有关如何在 API 中使用 `@SubclassOptInRequired` 注解的真实示例，请查看 `kotlinx.coroutines` 库中的 [`SharedFlow`](https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines.flow/-shared-flow/)
接口。

## 预稳定 API 的选择加入要求 {id="opt-in-requirements-for-pre-stable-apis"}

如果你对尚未稳定的功能使用选择加入要求，请谨慎处理 API 晋级，以避免
破坏客户端代码。

一旦你的预稳定 API 晋级并以稳定状态发布，请从
声明中删除选择加入要求注解。之后客户端就可以不受限制地使用它们。但是，你应该将注解类
留在模块中，以便现有的客户端代码保持兼容。

为了鼓励 API 用户通过从代码中删除任何注解并重新编译来更新他们的模块，请将注解标记
为 [`@Deprecated`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin/-deprecated/)，并在弃用消息中提供说明。

```kotlin
@Deprecated("This opt-in requirement is not used anymore. Remove its usages from your code.")
@RequiresOptIn
annotation class ExperimentalDateTime
```
