[//]: # (title: 异常与错误处理)

<web-summary>了解 Kotlin 如何使用异常来处理运行时错误。</web-summary>

异常可以帮助你的代码更具可预测性地运行，即使在发生可能中断程序执行的运行时错误时也是如此。
Kotlin 默认将所有异常视为**不受检的** (unchecked)。
不受检异常简化了异常处理过程：你可以捕获异常，但不需要显式地处理或[声明](java-to-kotlin-interop.md#checked-exceptions)它们。 

> 在 [与 Java、Swift 和 Objective-C 的异常互操作性](#exception-interoperability-with-java-swift-and-objective-c) 部分，详细了解 Kotlin 在与 Java、Swift 和 Objective-C 交互时如何处理异常。
> 
{style="tip"}

使用异常主要包括两个操作：

* **抛出异常：** 指示问题何时发生。
* **捕获异常：** 通过解决问题或通知开发者或应用程序用户，手动处理非预期异常。

异常由 [`Exception`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin/-exception/) 类的子类表示，而该类又是 [`Throwable`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin/-throwable/) 类的子类。有关层次结构的更多信息，请参阅 [异常层次结构](#exception-hierarchy) 部分。由于 `Exception` 是一个 [`open class`](inheritance.md)，你可以创建 [自定义异常](#create-custom-exceptions) 来满足应用程序的特定需求。

## 抛出异常

你可以使用 `throw` 关键字手动抛出异常。
抛出异常表示代码中发生了非预期的运行时错误。
异常是[对象](classes.md#creating-instances)，抛出异常会创建异常类的一个实例。

你可以抛出不带任何形参的异常： 

```kotlin
throw IllegalArgumentException()
```

为了更好地理解问题根源，可以包含额外信息，例如自定义消息和原始原因：

```kotlin
val cause = IllegalStateException("Original cause: illegal state")

// 如果 userInput 为负数，则抛出 IllegalArgumentException 
// 此外，它还会显示由 cause IllegalStateException 表示的原始原因
if (userInput < 0) {
    throw IllegalArgumentException("Input must be non-negative", cause)
}
```

在此示例中，当用户输入负值时会抛出 `IllegalArgumentException`。
你可以创建自定义错误消息并保留异常的原始原因 (`cause`)，该原因将包含在 [堆栈跟踪](#stack-trace) 中。

### 使用前置条件函数抛出异常

Kotlin 提供了使用前置条件函数自动抛出异常的其他方式。前置条件函数包括：

| 前置条件函数 | 用例 | 抛出的异常 |
|----------------------------------|------------------------------------------|------------------------------------------------------------------------------------------------------------------|
| [`require()`](#require-function) | 检查用户输入的有效性 | [`IllegalArgumentException`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin/-illegal-argument-exception/)   |
| [`check()`](#check-function) | 检查对象或变量状态的有效性 | [`IllegalStateException`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin/-illegal-state-exception/)         |
| [`error()`](#error-function) | 指示非法状态或条件 | [`IllegalStateException`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin/-illegal-state-exception/)         |

这些函数适用于如果未满足特定条件则程序流无法继续的情况。
这可以简化你的代码并使这些检查的处理更加高效。

#### require() 函数

当输入实参对于函数的运行至关重要，且如果这些实参无效则函数无法继续执行时，请使用 [`require()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin/require.html) 函数来验证输入实参。

如果 `require()` 中的条件未满足，它将抛出 [`IllegalArgumentException`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin/-illegal-argument-exception/)：

```kotlin
fun getIndices(count: Int): `List<Int>` {
    require(count >= 0) { "Count must be non-negative. You set count to $count." }
    return List(count) { it + 1 }
}

fun main() {
    // 这将失败并抛出 IllegalArgumentException
    println(getIndices(-1))
    
    // 取消注释下面这行可以查看正常运行的示例
    // println(getIndices(3))
    // [1, 2, 3]
}
```
{kotlin-runnable="true"}

> `require()` 函数允许编译器执行 [智能转换](typecasts.md#smart-casts)。
> 检查成功后，变量将自动转换为非导空类型。
> 这些函数通常用于为 null 性检查，以确保变量在继续执行前不为 null。例如：
>
> ```kotlin
> fun printNonNullString(str: String?) {
>     // 为 null 性检查
>     require(str != null) 
>     // 在此检查成功后，'str' 保证不为 
>     // null，并自动智能转换为非导空 String
>     println(str.length)
> }
> ```
>
{style="note"}

#### check() 函数

使用 [`check()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin/check.html) 函数验证对象或变量的状态。
如果检查失败，则表示存在需要解决的逻辑错误。

如果 `check()` 函数中指定的条件为 `false`，它将抛出 [`IllegalStateException`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin/-illegal-state-exception/)：

```kotlin
fun main() {
    var someState: String? = null

    fun getStateValue(): String {

        val state = checkNotNull(someState) { "State must be set beforehand!" }
        check(state.isNotEmpty()) { "State must be non-empty!" }
        return state
    }
    // 如果你取消注释下面这行，程序将失败并抛出 IllegalStateException
    // getStateValue()

    someState = ""

    // 如果你取消注释下面这行，程序将失败并抛出 IllegalStateException
    // getStateValue() 
    someState = "non-empty-state"

    // 这将打印 "non-empty-state"
    println(getStateValue())
}
```
{kotlin-runnable="true"}

> `check()` 函数允许编译器执行 [智能转换](typecasts.md#smart-casts)。
> 检查成功后，变量将自动转换为非导空类型。
> 这些函数通常用于为 null 性检查，以确保变量在继续执行前不为 null。例如：
>
> ```kotlin
> fun printNonNullString(str: String?) {
>     // 为 null 性检查
>     check(str != null) 
>     // 在此检查成功后，'str' 保证不为 
>     // null，并自动智能转换为非导空 String
>     println(str.length)
> }
> ```
>
{style="note"}

#### error() 函数

[`error()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin/error.html) 函数用于在代码中发出逻辑上不应发生的非法状态或条件的信号。
它适用于你想在代码中有意抛出异常的场景，例如当代码遇到意外状态时。
该函数在 `when` 表达式中特别有用，提供了一种清晰的方式来处理逻辑上不应发生的情况。

在以下示例中，`error()` 函数用于处理未定义的用户角色。
如果角色不是预定义角色之一，则会抛出 [`IllegalStateException`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin/-illegal-state-exception/)：

```kotlin
class User(val name: String, val role: String)

fun processUserRole(user: User) {
    when (user.role) {
        "admin" -> println("${user.name} is an admin.")
        "editor" -> println("${user.name} is an editor.")
        "viewer" -> println("${user.name} is a viewer.")
        else -> error("Undefined role: ${user.role}")
    }
}

fun main() {
    // 这将按预期工作
    val user1 = User("Alice", "admin")
    processUserRole(user1)
    // Alice is an admin.

    // 这将抛出 IllegalStateException
    val user2 = User("Bob", "guest")
    processUserRole(user2)
}
```
{kotlin-runnable="true"}

## 使用 try-catch 块处理异常

当异常被抛出时，它会中断程序的正常执行。
你可以使用 `try` 和 `catch` 关键字优雅地处理异常，以保持程序的稳定性。
`try` 块包含可能抛出异常的代码，而 `catch` 块则捕获并处理发生的异常。
异常由第一个匹配其特定类型或异常[基类](inheritance.md)的 `catch` 块捕获。

以下是同时使用 `try` 和 `catch` 关键字的方法：

```kotlin
try {
    // 可能抛出异常的代码
} catch (e: SomeException) {
    // 处理异常的代码
}
```

将 `try-catch` 作为表达式使用是一种常见的方法，因此它可以从 `try` 块或 `catch` 块返回一个值：

```kotlin
fun main() {
    val num: Int = try {

        // 如果 count() 成功完成，其返回值将赋值给 num
        count()
        
    } catch (e: ArithmeticException) {
        
        // 如果 count() 抛出异常，catch 块返回 -1，
        // 并将其赋值给 num
        -1
    }
    println("Result: $num")
}

// 模拟可能抛出 ArithmeticException 的函数
fun count(): Int {
    
    // 更改此值以向 num 返回不同的值
    val a = 0
    
    return 10 / a
}
```
{kotlin-runnable="true"}

你可以为同一个 `try` 块使用多个 `catch` 处理程序。
你可以根据需要添加任意数量的 `catch` 块，以分别处理不同的异常。
当有多个 `catch` 块时，务必按照从最具体到最不具体异常的顺序排列它们，即在代码中遵循从上到下的顺序。
这种顺序与程序的执行流一致。

考虑这个使用 [自定义异常](#create-custom-exceptions) 的示例：

```kotlin
open class WithdrawalException(message: String) : Exception(message)
class InsufficientFundsException(message: String) : WithdrawalException(message)

fun processWithdrawal(amount: Double, availableFunds: Double) {
    if (amount > availableFunds) {
        throw InsufficientFundsException("Insufficient funds for the withdrawal.")
    }
    if (amount < 1 || amount % 1 != 0.0) {
        throw WithdrawalException("Invalid withdrawal amount.")
    }
    println("Withdrawal processed")
}

fun main() {
    val availableFunds = 500.0

    // 更改此值以测试不同的场景
    val withdrawalAmount = 500.5

    try {
        processWithdrawal(withdrawalAmount.toDouble(), availableFunds)

    // catch 块的顺序很重要！
    } catch (e: InsufficientFundsException) {
        println("Caught an InsufficientFundsException: ${e.message}")
    } catch (e: WithdrawalException) {
        println("Caught a WithdrawalException: ${e.message}")
    }
}
```
{kotlin-runnable="true"}

处理 `WithdrawalException` 的通用 catch 块会捕获其类型的所有异常，包括像 `InsufficientFundsException` 这样的特定异常，除非它们之前已被更具体的 catch 块捕获。

### finally 块

`finally` 块包含无论 `try` 块是成功完成还是抛出异常都始终执行的代码。
使用 `finally` 块，你可以在 `try` 和 `catch` 块执行后清理代码。
这在处理文件或网络连接等资源时尤为重要，因为 `finally` 保证它们被正确关闭或释放。

以下是通常将 `try-catch-finally` 块一起使用的方式：

```kotlin
try {
    // 可能抛出异常的代码
}
catch (e: YourException) {
    // 异常处理程序
}
finally {
    // 始终执行的代码
}
```

`try` 表达式的返回值由 `try` 或 `catch` 块中最后执行的表达式决定。
如果没有异常发生，结果来自 `try` 块；如果处理了异常，结果来自 `catch` 块。
`finally` 块始终执行，但它不会改变 `try-catch` 块的结果。

让我们通过一个示例来演示：

```kotlin
fun divideOrNull(a: Int): Int {
    
    // try 块始终执行
    // 这里的异常（除以零）会导致立即跳转到 catch 块
    try {
        val b = 44 / a
        println("try block: Executing division: $b")
        return b
    }
    
    // 由于 ArithmeticException（如果 a == 0 则除以零）而执行 catch 块
    catch (e: ArithmeticException) {
        println("catch block: Encountered ArithmeticException $e")
        return -1
    }
    finally {
        println("finally block: The finally block is always executed")
    }
}

fun main() {
    
    // 更改此值以获得不同的结果。ArithmeticException 将返回：-1
    divideOrNull(0)
}
```
{kotlin-runnable="true"}

> 在 Kotlin 中，管理实现 [`AutoClosable`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin/-auto-closeable/) 接口的资源（例如 `FileInputStream` 或 `FileOutputStream` 等文件流）的惯用方法是使用 [`.use()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin/use.html) 函数。 
> 该函数在代码块完成后自动关闭资源，无论是否抛出异常，从而消除了对 `finally` 块的需求。 
> 因此，Kotlin 不需要像 [Java 的 try-with-resources](https://docs.oracle.com/javase/tutorial/essential/exceptions/tryResourceClose.html) 那样特殊的语法来进行资源管理。
> 
> ```kotlin
> FileWriter("test.txt").use { writer ->
>     writer.write("some text")
>     // 在此块之后，.use 函数自动调用 writer.close()，类似于 finally 块
> }
> ```
> 
{style="note"}

如果你的代码需要清理资源而无需处理异常，你也可以使用带有 `finally` 块但没有 `catch` 块的 `try`：

```kotlin
class MockResource { 
    fun use() { 
        println("Resource being used") 
        // 模拟资源正在被使用 
        // 如果发生除以零，这将抛出 ArithmeticException
        val result = 100 / 0
        
        // 如果抛出异常，这行将不会执行
        println("Result: $result") 
    }
    
    fun close() { 
        println("Resource closed") 
    }
}

fun main() { 
    val resource = MockResource()
//sampleStart 
    try {
        
        // 尝试使用资源 
        resource.use()
        
    } finally {
        
        // 确保资源始终关闭，即使发生异常 
        resource.close()
    }

    // 如果抛出异常，这行将不会打印
    println("End of the program")
//sampleEnd
}
```
{kotlin-runnable="true"}

如你所见，`finally` 块都能保证资源被关闭，无论是否发生异常。

在 Kotlin 中，你可以根据具体需求灵活地仅使用 `catch` 块、仅使用 `finally` 块，或者两者都用，但 `try` 块必须始终伴随至少一个 `catch` 块或一个 `finally` 块。

## 创建自定义异常

在 Kotlin 中，你可以通过创建继承自内置 `Exception` 类的类来定义自定义异常。 
这允许你创建针对应用程序需求量身定制的更具体的错误类型。

要创建一个，你可以定义一个继承自 `Exception` 的类：

```kotlin
class MyException: Exception("My message")
```

在此示例中，有一个默认错误消息 "My message"，但如果你愿意，可以将其留空。

> Kotlin 中的异常是有状态的对象，携带了与其创建上下文相关的特定信息，即 [堆栈跟踪](#stack-trace)。
> 避免使用 [对象声明](object-declarations.md#object-declarations-overview) 创建异常。
> 相反，每次需要时都应创建一个新的异常实例。
> 这样可以确保异常的状态准确反映特定的上下文。
>
{style="tip"}

自定义异常也可以是任何现有异常子类的子类，例如 `ArithmeticException` 子类：

```kotlin
class NumberTooLargeException: ArithmeticException("My message")
```

> 如果你想创建自定义异常的子类，必须将父类声明为 `open`，
> 因为 [类默认是 final 的](inheritance.md)，否则无法创建子类。
> 
> 例如：
>
> ```kotlin
> // 将自定义异常声明为 open class，使其可被继承
> open class MyCustomException(message: String): Exception(message)
>
> // 创建自定义异常的子类
> class SpecificCustomException: MyCustomException("Specific error message")
> ```
>
{style="note"}

自定义异常的行为与内置异常完全相同。你可以使用 `throw` 关键字抛出它们，并使用 `try-catch-finally` 块处理它们。让我们通过一个示例来演示：

```kotlin
class NegativeNumberException: Exception("Parameter is less than zero.")
class NonNegativeNumberException: Exception("Parameter is a non-negative number.")

fun myFunction(number: Int) {
    if (number < 0) throw NegativeNumberException()
    else if (number >= 0) throw NonNegativeNumberException()
}

fun main() {
    
    // 更改此函数中的值以获取不同的异常
    myFunction(1)
}
```
{kotlin-runnable="true"}

在具有多样化错误场景的应用程序中，
创建异常层次结构有助于使代码更清晰、更具体。
你可以通过使用 [抽象类](classes.md#abstract-classes) 或 [密封类](sealed-classes.md#constructors) 作为通用异常功能的基类，并为详细的异常类型创建特定的子类来实现这一点。
此外，包含带默认值形参的自定义异常提供了灵活性，允许使用不同的消息进行初始化，从而实现更细粒度的错误处理。

让我们来看一个使用密封类 `AccountException` 作为异常层次结构基类的示例，以及子类 `APIKeyExpiredException`，它展示了使用带默认值形参来改进异常细节：

```kotlin
//sampleStart
// 创建一个密封类作为账户相关错误异常层次结构的基类
sealed class AccountException(message: String, cause: Throwable? = null):
Exception(message, cause)

// 创建 AccountException 的子类
class InvalidAccountCredentialsException : AccountException("Invalid account credentials detected")

// 创建 AccountException 的子类，允许添加自定义消息和原因
class APIKeyExpiredException(message: String = "API key expired", cause: Throwable? = null)	: AccountException(message, cause)

// 更改占位符函数的值以获得不同的结果
fun areCredentialsValid(): Boolean = true
fun isAPIKeyExpired(): Boolean = true
//sampleEnd

// 验证账户凭据和 API 密钥
fun validateAccount() {
    if (!areCredentialsValid()) throw InvalidAccountCredentialsException()
    if (isAPIKeyExpired()) {
        // 抛出带有特定原因的 APIKeyExpiredException 的示例
        val cause = RuntimeException("API key validation failed due to network error")
        throw APIKeyExpiredException(cause = cause)
    }
}

fun main() {
    try {
        validateAccount()
        println("Operation successful: Account credentials and API key are valid.")
    } catch (e: AccountException) {
        println("Error: ${e.message}")
        e.cause?.let { println("Caused by: ${it.message}") }
    }
}
```
{kotlin-runnable="true"}

## Nothing 类型

在 Kotlin 中，每个表达式都有一个类型。
表达式 `throw IllegalArgumentException()` 的类型是 [`Nothing`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin/-nothing.html)，这是一个内置类型，它是所有其他类型的子类型，也称为 [底层类型 (bottom type)](https://en.wikipedia.org/wiki/Bottom_type)。 
这意味着 `Nothing` 可以用作返回值类型或泛型类型，在需要任何其他类型的地方使用，而不会导致类型错误。

`Nothing` 是 Kotlin 中的一种特殊类型，用于表示从未成功完成的函数或表达式，
原因可能是它们始终抛出异常，或者进入了无限循环等无休止的执行路径。
你可以使用 `Nothing` 来标记尚未实现或设计为始终抛出异常的函数，
从而向编译器和代码读者清晰地指示你的意图。
如果编译器在方法签名中推断出 `Nothing` 类型，它会向你发出警告。
显式定义 `Nothing` 作为返回值类型可以消除此警告。

这段 Kotlin 代码演示了 `Nothing` 类型的使用，编译器会将函数调用后的代码标记为无法访问：

```kotlin
class Person(val name: String?)

fun fail(message: String): Nothing {
    throw IllegalArgumentException(message)
    // 此函数永远不会成功返回。
    // 它将始终抛出异常。
}

fun main() {
    // 创建一个 'name' 为 null 的 Person 实例
    val person = Person(name = null)
    
    val s: String = person.name ?: fail("Name required")

    // 此时保证 's' 已初始化
    println(s)
}
```
{kotlin-runnable="true"}

Kotlin 的 [`TODO()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin/-t-o-d-o.html) 函数也使用了 `Nothing` 类型，它作为一个占位符来突出显示代码中需要未来实现的部分：

```kotlin
fun notImplementedFunction(): Int {
    TODO("This function is not yet implemented")
}

fun main() {
    val result = notImplementedFunction()
    // 这将抛出 NotImplementedError
    println(result)
}
```
{kotlin-runnable="true"}

如你所见，`TODO()` 函数始终抛出 [`NotImplementedError`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin/-not-implemented-error/) 异常。

## 异常类

让我们探索 Kotlin 中一些常见的异常类型，它们都是 [`RuntimeException`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin/-runtime-exception/) 类的子类：

* [`ArithmeticException`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin/-arithmetic-exception/)：当算术运算无法执行时（如除以零）发生此异常。

    ```kotlin
    val example = 2 / 0 // 抛出 ArithmeticException
    ```

* [`IndexOutOfBoundsException`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin/-index-out-of-bounds-exception/)：抛出此异常以指示某种索引（如数组或字符串）超出范围。

    ```kotlin
    val myList = mutableListOf(1, 2, 3)
    myList.removeAt(3)  // 抛出 IndexOutOfBoundsException
    ```

    > 为避免此异常，请使用更安全的选择，例如 [`getOrNull()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/get-or-null.html) 函数：
    > 
    > ```kotlin
    > val myList = listOf(1, 2, 3)
    > // 返回 null，而不是抛出 IndexOutOfBoundsException
    > val element = myList.getOrNull(3)
    > println("Element at index 3: $element")
    > ```
    > 
    {style="note"}

* [`NoSuchElementException`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin/-no-such-element-exception/)：当访问特定集合中不存在的元素时，抛出此异常。它在使用期望特定元素的方法（如 [`first()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/first.html) 或 [`last()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/last.html)）时发生。

    ```kotlin
    val emptyList = listOf<Int>()
    val firstElement = emptyList.first()  // 抛出 NoSuchElementException
    ```

    > 为避免此异常，请使用更安全的选择，例如 [`firstOrNull()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/first-or-null.html) 函数：
    >
    > ```kotlin
    > val emptyList = listOf<Int>()
    > // 返回 null，而不是抛出 NoSuchElementException
    > val firstElement = emptyList.firstOrNull()
    > println("First element in empty list: $firstElement")
    > ```
    >
    {style="note"}

* [`NumberFormatException`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin/-number-format-exception/)：当尝试将字符串转换为数值类型，但字符串格式不正确时，会发生此异常。

    ```kotlin
    val string = "This is not a number"
    val number = string.toInt() // 抛出 NumberFormatException
    ```
    
    > 为避免此异常，请使用更安全的选择，例如 [`toIntOrNull()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.text/to-int-or-null.html) 函数：
    >
    > ```kotlin
    > val nonNumericString = "not a number"
    > // 返回 null，而不是抛出 NumberFormatException
    > val number = nonNumericString.toIntOrNull()
    > println("Converted number: $number")
    > ```
    >
    {style="note"}

* [`NullPointerException`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin/-null-pointer-exception/)：当应用程序尝试使用具有 `null` 值的对象引用时，抛出此异常。虽然 Kotlin 的空安全功能显著降低了 `NullPointerException` 的风险，但它们仍可能通过故意使用 `!!` 运算符或在与缺乏 Kotlin 空安全的 Java 交互时发生。

    ```kotlin
    val text: String? = null
    println(text!!.length)  // 抛出 NullPointerException
    ```

虽然 Kotlin 中的所有异常都是不受检的，且你不必显式捕获它们，但如果需要，你仍然可以灵活地捕获它们。

### 异常层次结构

Kotlin 异常层次结构的根是 [`Throwable`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin/-throwable/) 类。
它有两个直接子类，[`Error`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin/-error/) 和 [`Exception`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin/-exception/)：

* `Error` 子类表示应用程序本身可能无法恢复的严重基础问题。这些是你通常不会尝试处理的问题，例如 [`OutOfMemoryError`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin/-out-of-memory-error/) 或 `StackOverflowError`。

* `Exception` 子类用于你可能想要处理的情况。`Exception` 类型的子类型，例如 [`RuntimeException`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin/-runtime-exception/) 和 `IOException` (输入/输出异常)，用于处理应用程序中的异常事件。

![异常层次结构 - Throwable 类](throwable.svg){width=700}

`RuntimeException` 通常是由程序代码中检查不足引起的，可以通过编程方式预防。
Kotlin 有助于防止常见的 `RuntimeException`（如 `NullPointerException`），并为潜在的运行时错误（如除以零）提供编译时警告。下图展示了从 `RuntimeException` 派生的子类型层次结构：

![RuntimeException 层次结构](runtime-exception.svg){width=700}

## 堆栈跟踪

**堆栈跟踪** (stack trace) 是由运行时环境生成的报告，用于调试。
它显示了导致程序中特定点（尤其是发生错误或异常的地方）的函数调用序列。

让我们看一个示例，其中在 JVM 环境中由于异常而自动打印堆栈跟踪：

```kotlin
fun main() {
//sampleStart    
    throw ArithmeticException("This is an arithmetic exception!")
//sampleEnd    
}
```
{kotlin-runnable="true"}

在 JVM 环境中运行此代码会产生以下输出：

```text
Exception in thread "main" java.lang.ArithmeticException: This is an arithmetic exception!
    at MainKt.main(Main.kt:3)
    at MainKt.main(Main.kt)
```

第一行是异常描述，其中包括：

* 异常类型：`java.lang.ArithmeticException`
* 线程：`main` 
* 异常消息：`"This is an arithmetic exception!"`

异常描述后以 `at` 开头的每一行都是堆栈跟踪。单行被称为**堆栈跟踪元素** (stack trace element) 或**栈帧** (stack frame)：

* `at MainKt.main (Main.kt:3)`：这显示了方法名称 (`MainKt.main`) 以及调用该方法的源文件和行号 (`Main.kt:3`)。
* `at MainKt.main (Main.kt)`：这显示异常发生在 `Main.kt` 文件的 `main()` 函数中。

## 与 Java、Swift 和 Objective-C 的异常互操作性

由于 Kotlin 将所有异常都视为不受检的，因此当这些异常从区分受检和不受检异常的语言中调用时，可能会导致复杂情况。
为了解决 Kotlin 与 Java、Swift 和 Objective-C 等语言在异常处理上的这种差异，
你可以使用 [`@Throws`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin/-throws/) 注解。
该注解会向调用者发出可能出现异常的警示。
有关更多信息，请参阅 [在 Java 中调用 Kotlin](java-to-kotlin-interop.md#checked-exceptions) 和
[与 Swift/Objective-C 的互操作性](native-objc-interop.md#errors-and-exceptions)。