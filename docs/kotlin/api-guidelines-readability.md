[//]: # (title: 可读性)

创建具有良好可读性的 API 不仅仅是编写简洁的代码。
它需要深思熟虑的设计，以简化集成和使用。
本节探讨如何通过在构建库时考虑组合性、利用领域专用语言 (DSL) 进行简洁且具有表现力的设置，以及使用扩展函数与属性来编写清晰且易于维护的代码，从而增强 API 的可读性。

## 优先选择显式组合性

库通常提供允许自定义的高级运算符。
例如，某项操作可能允许用户提供自己的数据结构、网络通道、定时器或生命周期观察者。
但是，通过额外的函数参数引入这些自定义选项会显著增加 API 的复杂性。

与其为自定义添加更多参数，不如设计一个可以将不同行为组合在一起的 API，这种方式更为有效。
例如，在协程 Flow API 中，[缓冲和合并](coroutines-flow-operators.md#concurrent-processing-operators)都是作为独立的函数实现的。
它们可以与 [`filter`](https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines.flow/filter.html) 和 [`map`](https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines.flow/map.html) 等更基础的操作链式结合，而不是让每个基础操作都接受用于控制缓冲和合并的参数。

另一个例子涉及 [Jetpack Compose 中的 Modifier API](https://developer.android.com/develop/ui/compose/modifiers)。
它允许 Composable 组件接受单个 `Modifier` 参数，用于处理常见的自定义选项，如内边距、尺寸和背景颜色。
这种方法避免了每个 Composable 组件都需要为这些自定义选项接受单独参数的需求，从而简化了 API 并降低了复杂性。

```kotlin
Box(
    modifier = Modifier
        .padding(10.dp)
        .onClick { println("Box clicked!") }
        .fillMaxWidth()
        .fillMaxHeight()
        .verticalScroll(rememberScrollState())
        .horizontalScroll(rememberScrollState())
) {
    // 此处为 Box 内容
}
```

## 使用 DSL

Kotlin 库可以通过提供构建器 DSL 来显著提高可读性。
使用 DSL 可以让你简洁地重复领域特定的数据声明。
例如，考虑以下基于 Ktor 的服务器应用程序示例：

```kotlin
fun Application.module() {
    install(ContentNegotiation) {
        json(Json {
            prettyPrint = true
            isLenient = true
        })
    }
    routing {
        post("/article") {
            call.respond<String>(HttpStatusCode.Created, ...)
        }
        get("/article/list") {
            call.respond<List<CreateArticle>>(...)
        }
        get("/article/{id}") {
            call.respond<Article>(...)
        }
    }
}
```

这将设置一个应用程序，安装配置为使用 Json 序列化的 `ContentNegotiation` 插件，并设置路由，以便应用程序响应各种 `/article` 端点的请求。

有关创建 DSL 的详细说明，请参阅[类型安全构建器](type-safe-builders.md)。
在创建库的背景下，以下几点值得注意：

* DSL 中使用的函数是构建器函数，它们将带接收者的 lambda 作为最后一个参数。
  这种设计允许在调用这些函数时省略圆括号，使语法更清晰。
  传递的 lambda 可用于配置正在创建的实体。在上面的示例中，传递给 `routing` 函数的 lambda 用于配置路由详情。
* 创建类实例的工厂函数应与返回值类型同名，并以大写字母开头。
  你可以在上面创建 `Json` 实例的示例中看到这一点。
  这些函数仍可能接受用于配置的 lambda 参数。欲了解更多信息，请参阅[编码规范](coding-conventions.md#function-names)。
* 由于无法在编译时确保在提供给构建器函数的 lambda 中设置了必需属性，我们建议将必需值作为函数参数传递。

使用 DSL 构建对象不仅能提高可读性，还能改善向后兼容性，并简化文档编写过程。例如，考虑以下函数：

```kotlin
fun Json(prettyPrint: Boolean, isLenient: Boolean): Json
```

此函数可以替代 `Json{}` DSL 构建器。然而，DSL 方法具有明显的优势：

* 使用 DSL 构建器比使用此函数更容易维护向后兼容性，因为添加新的配置选项只需添加新属性（或在其他示例中添加新函数），这是一种向后兼容的更改，而不像更改现有函数的参数列表那样。
* 它还使创建和维护文档变得更加容易。你可以分别在每个属性的声明处编写文档，而无需在一个地方为函数的所有参数编写文档。

## 使用扩展函数与属性

我们建议使用[扩展函数与属性](extensions.md)来提高可读性。

类和接口应定义类型的核心概念。
附加功能和信息应编写为扩展函数与属性。
这向读者明确了附加功能可以在核心概念之上实现，并且附加信息可以从类型中的数据计算得出。

例如，[`CharSequence`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin/-char-sequence/) 类型（`String` 也实现了该类型）仅包含访问其内容的最基本信息和运算符：

```kotlin
interface CharSequence {
    val length: Int
    operator fun get(index: Int): Char
    fun subSequence(startIndex: Int, endIndex: Int): CharSequence
}
```

通常与字符串相关的功能大多被定义为扩展函数，它们都可以在该类型的核心概念和基础 API 之上实现：

```kotlin
inline fun CharSequence.isEmpty(): Boolean = length == 0
inline fun CharSequence.isNotEmpty(): Boolean = length > 0

inline fun CharSequence.trimStart(predicate: (Char) -> Boolean): CharSequence {
    for (index in this.indices)
        if (!predicate(this[index]))
           return subSequence(index, length)
    return ""
}
```

考虑将计算属性和普通方法声明为扩展。
默认情况下，只有常规属性、重写和重载运算符才应声明为成员。

## 避免使用布尔类型作为实参

考虑以下函数：

```kotlin
fun doWork(optimizeForSpeed: Boolean) { ... }
```

如果你在 API 中提供此函数，它可以按如下方式调用：

```kotlin
doWork(true)
doWork(optimizeForSpeed=true)
```

在第一次调用中，除非你在启用了形参提示的 IDE 中阅读代码，否则无法推断布尔实参的用途。
使用命名实参确实能澄清意图，但无法强制用户采用这种风格。
因此，为了提高可读性，你的代码不应使用布尔类型作为实参。

或者，API 可以专门为受布尔实参控制的任务创建一个单独的函数。
该函数应具有描述性名称，以指示其功能。

例如，[`Iterable`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/-iterable/) 接口上提供了以下扩展：

```kotlin
fun <T, R> Iterable<T>.map(transform: (T) -> R): List<R>
fun <T, R : Any> Iterable<T>.mapNotNull(
    transform: (T) -> R?
): List<R>
```

而不是使用单个方法：

```kotlin
fun <T, R> Iterable<T>.map(
    includeNullResults: Boolean = true, 
    transform: (T) -> R
): List<R>
```

另一种好的方法是使用 `enum` 类来定义不同的操作模式。
如果有多种操作模式，或者你预期这些模式会随着时间推移而改变，那么这种方法非常有用。

## 正确使用数值类型

Kotlin 定义了一组可在 API 中使用的数值类型。以下是正确使用它们的方法：

* 将 `Int`、`Long` 和 `Double` 类型用作算术类型。它们代表参与计算的值。
* 避免将算术类型用于非算术实体。例如，如果你将 ID 表示为 `Long`，用户可能会倾向于比较 ID，并假设它们是按顺序分配的。
  这可能导致不可靠或无意义的结果，或者对可能在不发出警告的情况下发生变化的实现产生依赖。
  更好的策略是为 ID 抽象定义一个专门的类。你可以使用[内联值类](inline-classes.md)来构建此类抽象，而不会影响性能。请参考 [`Duration`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.time/-duration/) 类作为示例。
* `Byte`、`Float` 和 `Short` 类型是内存布局类型。它们用于限制存储值可用的内存量，例如在缓存中或通过网络传输数据时。
  只有当底层数据确实适合该类型且不需要计算时，才应使用这些类型。
* 应使用无符号整数类型 `UByte`、`UShort`、`UInt` 和 `ULong` 来利用给定格式中完整的正值范围。它们适用于需要超出有符号类型范围的值或与原生库进行互操作的场景。但是，请避免在领域仅需要[非负整数](unsigned-integer-types.md#non-goals)的情况下使用它们。

## 下一步

在指南的下一部分中，你将学习有关一致性的内容。

[转到下一部分](api-guidelines-consistency.md)