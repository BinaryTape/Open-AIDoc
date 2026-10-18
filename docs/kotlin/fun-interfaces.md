[//]: # (title: 函数式 \(SAM\) 接口)

只有一个抽象成员函数的接口称为*函数式接口*，或*单一抽象方法 (SAM) 接口*。函数式接口可以包含多个非抽象成员函数，但只能有一个抽象成员函数。

要在 Kotlin 中声明函数式接口，请使用 `fun` 修饰符。

```kotlin
fun interface KRunnable {
    fun invoke()
}
```

## SAM 转换 {id="sam-conversions"}

对于函数式接口，你可以使用 SAM 转换，通过 [lambda 表达式](lambdas.md#lambda-expressions-and-anonymous-functions)让代码更加简洁且易读。

你可以使用 lambda 表达式，而无需手动创建实现函数式接口的类。通过 SAM 转换，Kotlin 可以将任何签名与该接口单方法签名相匹配的 lambda 表达式转换为动态实例化该接口实现的代码。

例如，考虑以下 Kotlin 函数式接口：

```kotlin
fun interface IntPredicate {
    fun accept(i: Int): Boolean
}
```

如果不使用 SAM 转换，你需要编写类似这样的代码：

```kotlin
// 创建类的实例
val isEven = object : IntPredicate {
    override fun accept(i: Int): Boolean {
        return i % 2 == 0
    }
}
```

利用 Kotlin 的 SAM 转换，你可以编写以下等效代码作为替代：

```kotlin
// 使用 lambda 创建实例
val isEven = IntPredicate { it % 2 == 0 }
```

简短的 lambda 表达式替代了所有不必要的代码。

```kotlin
fun interface IntPredicate {
    fun accept(i: Int): Boolean
}

val isEven = IntPredicate { it % 2 == 0 }

fun main() {
    println("Is 7 even? - ${isEven.accept(7)}")
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.4"}

你还可以使用[适用于 Java 接口的 SAM 转换](java-interop.md#sam-conversions)。

### 将可调用引用传递给 SAM 形参 {id="pass-callable-references-to-sam-parameters"}

如果所需的行为已经作为命名函数存在，你可以传递[可调用引用](lambdas.md#callable-reference)。Kotlin 会将兼容的可调用引用适配为预期的函数式接口：

```kotlin
fun interface Action {
    fun run()
}

fun execute(action: Action) {
    action.run()
}

fun start() {
    println("Run from a callable reference")
}

fun main() {
    // Kotlin 将 lambda 转换为 Action 实例
    execute { start() }
    // Run from a callable reference

    // Kotlin 将该引用适配为 Action 实例
    execute(::start)
    // Run from a callable reference
}
```
{kotlin-runnable="true"}

`execute { start() }` 中的 lambda 是一个函数字面量，因此 Kotlin 使用 SAM 转换来创建 `Action` 实例。而在 `execute(::start)` 中，`::start` 是对现有 `start()` 函数的可调用引用。因为 `execute()` 预期接收一个 `Action`，编译器会创建一个兼容的 `Action` 实例，并将 `start()` 用作 `Action.run()` 的实现。此过程称为 *SAM 适配*。

## 从带有构造函数的接口迁移到函数式接口 {id="migration-from-an-interface-with-constructor-function-to-a-functional-interface"}

从 1.6.20 开始，Kotlin 支持对函数式接口构造函数的可调用引用，这为从带有构造函数的接口迁移到函数式接口提供了一种源码兼容的方式。考虑以下代码：

```kotlin
interface Printer { 
    fun print() 
}

fun Printer(block: () -> Unit): Printer = object : Printer {
    override fun print() = block()
}
```

在启用对函数式接口构造函数的可调用引用后，可以用单纯的函数式接口声明来替换这段代码：

```kotlin
fun interface Printer { 
    fun print()
}
```

其构造函数将隐式创建，任何使用 `::Printer` 函数引用的代码都将能够通过编译。例如：

```kotlin
documentsStorage.addPrinter(::Printer)
```

通过使用带有 `DeprecationLevel.HIDDEN` 的 [`@Deprecated`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin/-deprecated/) 注解标记旧版函数 `Printer`，可以保持二进制兼容性：

```kotlin
@Deprecated(message = "Your message about the deprecation", level = DeprecationLevel.HIDDEN)
fun Printer(...) {...}
```

## 函数式接口与类型别名 {id="functional-interfaces-vs-type-aliases"}

你也可以使用函数类型的[类型别名](type-aliases.md)简单重写上述内容：

```kotlin
typealias IntPredicate = (i: Int) -> Boolean

val isEven: IntPredicate = { it % 2 == 0 }

fun main() {
    println("Is 7 even? - ${isEven(7)}")
}
```

然而，函数式接口和[类型别名](type-aliases.md)服务于不同的目的。类型别名只是现有类型的名称——它们不会创建新类型，而函数式接口会。你可以提供特定于某一函数式接口的扩展，使其不适用于普通函数或其类型别名。

类型别名只能有一个成员，而函数式接口可以拥有多个非抽象成员函数和一个抽象成员函数。函数式接口还可以实现和继承其他接口。

函数式接口比类型别名更灵活且提供更多功能，但无论在语法上还是在运行时开销上都可能更高，因为它们可能需要转换为特定的接口。在代码中选择使用哪一种时，请考虑你的需求：
* 如果你的 API 需要接受一个具有特定形参和返回值类型的函数（任意函数）——请使用简单的函数类型，或定义一个类型别名为相应的函数类型提供一个更简短的名称。
* 如果你的 API 接受比函数更复杂的实体——例如，它具有无法在函数类型签名中表达的复杂契约和/或操作——请为其声明单独的函数式接口。