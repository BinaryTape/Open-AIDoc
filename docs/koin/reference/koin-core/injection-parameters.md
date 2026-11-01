---
title: 注入形参
---

# 注入形参

有些对象需要一个只有调用方知道的值，例如用户 ID 或当前屏幕。注入形参（Injected Parameters）允许调用方在向 Koin 请求实例时传递这些值。本页涵盖了如何在定义中声明形参、如何传递它，以及 Koin 如何将值与形参进行匹配。本文假定你已了解如何声明定义（请参阅[定义](/docs/reference/koin-core/definitions)）。

## 声明并传递形参 {id="declare-and-pass-a-parameter"}

标记哪些构造函数形参来自调用方。其他形参则像往常一样从容器中解析：

**编译器插件 DSL**
```kotlin
import org.koin.core.annotation.InjectedParam

class UserPresenter(
    @InjectedParam val userId: String,
    val repository: UserRepository,
)

val appModule = module {
    single<UserRepository>()
    factory<UserPresenter>()
}
```

`@InjectedParam` 来自 `koin-annotations` 构件。它告知编译器插件 `userId` 不是一个定义，因此构建期检查不会将其报告为缺失。

**注解**
```kotlin
@Factory
class UserPresenter(
    @InjectedParam val userId: String,
    val repository: UserRepository,
)
```

`@InjectedParam` 同样适用于提供者函数（provider function）形参。

**构造函数 / 传统 DSL**
定义 lambda 会将形参作为 `params` 接收：

```kotlin
val appModule = module {
    singleOf(::UserRepository)
    factory { params -> UserPresenter(userId = params.get(), repository = get()) }
}
```

调用方使用 `parametersOf()` 传递值，顺序与形参保持一致：

```kotlin
import org.koin.core.parameter.parametersOf

val presenter: UserPresenter = get { parametersOf("user-42") }

// 或延迟获取
val presenter: UserPresenter by inject { parametersOf("user-42") }
```

形参块是一个 lambda，因此会在创建实例时读取这些值。使用 `by inject()` 时，则是在首次访问时进行读取。

注入形参专用于 `factory` 定义。`single` 只会创建一次：仅使用首次传递的值，后续传入的值都将被忽略。

各个平台的 API 均接受相同的代码块：Compose 中的 `koinInject { parametersOf(userId) }`（请参阅 [Koin for Compose](/docs/reference/koin-compose/compose)），以及用于 ViewModel 的 `by viewModel { parametersOf(userId) }` 或 `koinViewModel { parametersOf(userId) }`（请参阅 [ViewModel](/docs/reference/koin-core/viewmodel)）。

## 多个形参 {id="several-parameters"}

**编译器插件 DSL**
```kotlin
class OrderPresenter(
    @InjectedParam val userId: String,
    @InjectedParam val orderId: Long,
    val repository: OrderRepository,
)

val appModule = module {
    factory<OrderPresenter>()
}
```

**注解**
```kotlin
@Factory
class OrderPresenter(
    @InjectedParam val userId: String,
    @InjectedParam val orderId: Long,
    val repository: OrderRepository,
)
```

**构造函数 / 传统 DSL**
在 lambda 中对形参进行析构：

```kotlin
val appModule = module {
    factory { (userId: String, orderId: Long) ->
        OrderPresenter(userId, orderId, get())
    }
}
```

或者通过索引读取它们，使用 `params[i]` 或 `params.get<T>(i)`：

```kotlin
val appModule = module {
    factory { params -> OrderPresenter(params[0], params[1], get()) }
}
```

析构最多支持 5 个值，并且不会针对调用方传递的内容检查声明的类型。如果顺序有误，类型转换将在运行时失败。

```kotlin
val presenter: OrderPresenter = get { parametersOf("user-42", 1001L) }
```

## Koin 如何匹配值 {id="how-koin-matches-values"}

`params.get<T>()` 和生成的代码遵循以下规则查找每个值：

- Koin 首先检查当前位置的值。如果该值符合所请求的类型，Koin 将返回该值并移动到下一个位置。
- 否则，Koin 会返回所请求类型的第一个值（无论其位于何处）。
- 当未传递该类型的值时，`params.getOrNull<T>()` 返回 `null`。而 `get<T>()` 则会抛出 `DefinitionParameterException`。

在实际使用中，请按照构造函数的顺序传递值：`parametersOf("user-42", 1001L)` 会先填充 `userId`，再填充 `orderId`，两个 `String` 形参会按顺序接收两个 `String` 值。

如果你只需要单一的匹配行为，可以使用其他函数构建形参：

| 函数 | 匹配方式 |
|----------|----------|
| `parametersOf(...)` | 位置优先，其次是类型（默认行为，见上述规则） |
| `parameterArrayOf(...)` | 仅基于位置。当前位置的值必须符合所请求的类型 |
| `parameterSetOf(...)` | 仅基于类型。每次调用 `get<T>()` 都会返回该类型的第一个值 |

```kotlin
val byIndex = parameterArrayOf(1, 2, 3)
byIndex.get<Int>() // 1
byIndex.get<Int>() // 2

val byType = parameterSetOf("a_string", 42)
byType.get<Int>()    // 42
byType.get<Int>()    // 42
```

## 从形参解析值 {id="values-resolved-from-parameters"}

当 Koin 使用形参创建实例时，定义内部直接调用的 `get()` 会在查询容器之前先检查传入的值。即使是没有标记的形参，也仍然可以接收传入的值：

```kotlin
val appModule = module {
    factory { UserPresenter(userId = get(), repository = get()) }
}

get<UserPresenter> { parametersOf("user-42") } // userId = "user-42"
```

这也适用于更深层级的依赖项：如果 `UserPresenter` 依赖的 `Tracker` 需要屏幕名称，那么为 presenter 传递的值同样可以渗透到 `Tracker` 的定义中。

无论如何，建议优先使用 `@InjectedParam` 或 `params.get()`：它们能清晰明确地表明值的来源，并且编译器插件可以借此对依赖图的其余部分进行检查。

:::warning
如果传入的值与所请求定义的类型相同，Koin 会直接返回该值，而绝不会执行该定义。例如，`get<String> { parametersOf("x") }` 会直接返回 `"x"`。当形参可能与定义的类型发生冲突时，请将它们封装进专属的类型中（例如 value class）。
:::

带有限定符的请求（例如 `get(named("local"))`）绝不会从形参中获取值。形参不携带任何限定符。

## 相关内容 {id="related"}

- [注入](/docs/reference/koin-core/injection)：用于传递形参的 `get()` 和 `inject()`。
- [定义](/docs/reference/koin-core/definitions#constructor-parameters)：其他构造函数形参的解析方式。
- [ViewModel](/docs/reference/koin-core/viewmodel)：适用于 ViewModel 的形参以及 `SavedStateHandle`。
- [限定符](/docs/reference/koin-core/qualifiers)：在多个定义之间进行选择，而不是传递值。
- [注解参考](/docs/reference/koin-annotations/annotations-inventory)：`@InjectedParam` 及其他形参注解。