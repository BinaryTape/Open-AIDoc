[//]: # (title: 函数式 (SAM) 接口)

只有一个抽象成员函数的接口称为_函数式接口_，或_单一抽象方法 (SAM) 接口_。函数式接口可以有多个非抽象成员函数，但只能有一个抽象成员函数。

要在 Kotlin 中声明函数式接口，请使用 `fun` 修饰符。

```kotlin
fun interface KRunnable {
    fun invoke()
}
```

## SAM 转换 {id="sam-conversions"}

对于函数式接口，可以使用 SAM 转换，通过 [lambda表达式](lambdas.md#lambda-expressions-and-anonymous-functions) 让代码更加简洁易读。

无需手动创建实现函数式接口的类，你可以直接使用 lambda表达式。借助 SAM 转换，Kotlin 可以将任何签名与接口中单一方法的签名相匹配的 lambda表达式转换为可动态实例化该接口实现的代码。

例如，考虑以下 Kotlin 函数式接口：

```kotlin
fun interface IntPredicate {
    fun accept(i: Int): Boolean
}
```

如果不使用 SAM 转换，则需要编写如下代码：

```kotlin
// 创建类的实例
val isEven = object : IntPredicate {
    override fun accept(i: Int): Boolean {
        return i % 2 == 0
    }
}
```

通过利用 Kotlin 的 SAM 转换，可以改写为以下代码：

```kotlin
// 使用 lambda 创建实例
val isEven = IntPredicate { it % 2 == 0 }
```

一段简短的 lambda表达式取代了所有不必要的代码。

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

将[对象表达式](object-declarations.md#object-expressions)替换为 SAM 转换可能会改变对象的唯一标识。对象表达式每次求值时都会创建一个新实例，而 SAM 转换可能会创建新实例或重用现有实例。因此：

* 如果每次都需要一个不同的实例（例如每次注册时），请使用对象表达式或显式创建类的实例。
* 如果后续需要引用同一个实例（例如移除监听器），请将其存储在变量中。

你还可以使用[针对 Java 接口的 SAM 转换](java-interop.md#sam-conversions)。

### 将可调用引用传递给 SAM 形参 {id="pass-callable-references-to-sam-parameters"}

如果所需行为已经存在作为具名函数，你可以传递[可调用引用](lambdas.md#callable-reference)。Kotlin 会将兼容的可调用引用适配为预期的函数式接口：

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

    // Kotlin 将引用适配为 Action 实例
    execute(::start)
    // Run from a callable reference
}
```
{kotlin-runnable="true"}

`execute { start() }` 中的 lambda 是一个函数字面值，因此 Kotlin 使用 SAM 转换来创建 `Action` 实例。而在 `execute(::start)` 中，`::start` 是对现有 `start()` 函数的可调用引用。因为 `execute()` 预期接收一个 `Action`，所以编译器会创建一个兼容的 `Action` 实例，并将 `start()` 作为 `Action.run()` 的实现。此过程称为 _SAM 适配_。

## 从带有构造函数的接口迁移到函数式接口 {id="migration-from-an-interface-with-constructor-function-to-a-functional-interface"}

从 1.6.20 开始，Kotlin 支持对函数式接口构造函数的可调用引用，这提供了一种源码兼容的方式，用于从带有构造函数的接口迁移到函数式接口。请看以下代码：

```kotlin
interface Printer { 
    fun print() 
}

fun Printer(block: () -> Unit): Printer = object : Printer {
    override fun print() = block()
}
```

在启用了对函数式接口构造函数的可调用引用的情况下，这段代码可以替换为仅包含一个函数式接口声明：

```kotlin
fun interface Printer { 
    fun print()
}
```

其构造函数将被隐式创建，任何使用 `::Printer` 函数引用的代码都可以编译。例如：

```kotlin
documentsStorage.addPrinter(::Printer)
```

通过使用带有 `DeprecationLevel.HIDDEN` 的 [`@Deprecated`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin/-deprecated/) 注解标记旧版函数 `Printer`，以保持二进制兼容性：

```kotlin
@Deprecated(message = "Your message about the deprecation", level = DeprecationLevel.HIDDEN)
fun Printer(...) {...}
```

## 函数式接口与类型别名 {id="functional-interfaces-vs-type-aliases"}

你也可以直接使用针对函数类型的[类型别名](type-aliases.md)重写上述代码：

```kotlin
typealias IntPredicate = (i: Int) -> Boolean

val isEven: IntPredicate = { it % 2 == 0 }

fun main() {
    println("Is 7 even? - ${isEven(7)}")
}
```

但是，函数式接口和[类型别名](type-aliases.md)的用途不同。类型别名只是现有类型的别名——它们不会创建新类型，而函数式接口会。你可以提供特定于某个函数式接口的扩展，使其不适用于普通函数或其类型别名。

类型别名只能有一个成员，而函数式接口可以有多个非抽象成员函数和一个抽象成员函数。函数式接口还可以实现和扩展其他接口。

函数式接口比类型别名更灵活且提供更多功能，但无论在语法上还是运行时开销都可能更高，因为它们可能需要转换到特定接口。在代码中选择使用哪一种时，请考虑你的需求：
* 如果你的 API 需要接收一个具有特定形参和返回值类型的函数（任意函数）——请使用简单的函数类型，或定义一个类型别名为对应的函数类型提供更短的名称。
* 如果你的 API 接收的实体比函数更复杂——例如，它具有无法在函数类型签名中表达的重要协定和/或操作——请为其声明一个单独的函数式接口。