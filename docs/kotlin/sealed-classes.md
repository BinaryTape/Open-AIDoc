[//]: # (title: 密封类与密封接口)

*密封*（Sealed）类和接口为类层次结构提供了受控的继承。
密封类的所有直接子类在编译时都是已知的。在定义该密封类的模块和包之外，不能出现其他子类。
同样的逻辑也适用于密封接口及其实现：一旦包含密封接口的模块编译完成，就不能创建新的实现。

> 直接子类是指直接继承自其超类的类。
> 
> 间接子类是指从其超类向下继承超过一级的类。
>
{style="note"}

当将密封类和接口与 `when` 表达式结合使用时，你可以覆盖所有可能子类的行为，并确保不会创建可能对你的代码产生负面影响的新子类。

密封类最适合用于以下场景：

* **需要受限的类继承：** 你拥有一组预定义的、有限的子类来扩展某个类，并且它们在编译时都是已知的。
* **需要类型安全的设计：** 安全性和模式匹配在你的项目中至关重要，特别是在状态管理或处理复杂的条件逻辑时。有关示例，请参阅[将密封类与 when 表达式结合使用](#use-sealed-classes-with-when-expression)。
* **处理闭源 API：** 你希望为库提供健壮且易于维护的公共 API，以确保第三方客户端按预期使用这些 API。

有关更详细的实际应用，请参阅[用例场景](#use-case-scenarios)。

> Java 15 引入了[类似的概念](https://docs.oracle.com/en/java/javase/15/language/sealed-classes-and-interfaces.html#GUID-0C709461-CC33-419A-82BF-61461336E65F)，其中密封类使用 `sealed` 关键字配合 `permits` 子句来定义受限的层次结构。
>
{style="tip"}

## 声明密封类或接口 {id="declare-a-sealed-class-or-interface"}

要声明密封类或接口，请使用 `sealed` 修饰符：

```kotlin
// 创建一个密封接口
sealed interface Error

// 创建一个实现密封接口 Error 的密封类
sealed class IOError(): Error

// 定义扩展密封类 'IOError' 的子类
class FileReadError(val file: File): IOError()
class DatabaseError(val source: DataSource): IOError()

// 创建一个实现 'Error' 密封接口的单例对象
object RuntimeError : Error
```

该示例可以代表一个库的 API，其中包含错误类以供库用户处理它可能抛出的错误。
如果此类错误类的层次结构包含在公共 API 中可见的接口或抽象类，那么没有什么可以阻止其他开发者在客户端代码中实现或扩展它们。
由于库不知道在其外部声明的错误，因此无法像对待自己的类那样一致地处理它们。
然而，通过**密封**的错误类层次结构，库的作者可以确信他们了解所有可能的错误类型，并且以后不会出现其他错误类型。

该示例的层次结构如下所示：

![密封类与接口层次结构图](sealed-classes-interfaces.svg){width=700}

### 构造函数 {id="constructors"}

密封类本身始终是[抽象类](classes.md#abstract-classes)，因此无法直接实例化。
不过，它可以包含或继承构造函数。这些构造函数不是为了创建密封类本身的实例，而是为了其子类。
思考以下名为 `Error` 的密封类及其几个子类的示例，我们对这些子类进行实例化：

```kotlin
sealed class Error(val message: String) {
    class NetworkError : Error("Network failure")
    class DatabaseError : Error("Database cannot be reached")
    class UnknownError : Error("An unknown error has occurred")
}

fun main() {
    val errors = listOf(Error.NetworkError(), Error.DatabaseError(), Error.UnknownError())
    errors.forEach { println(it.message) }
}
// Network failure 
// Database cannot be reached 
// An unknown error has occurred
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.5"}

你可以在密封类中使用 [`enum`](enum-classes.md) 类，以使用枚举常量来表示状态并提供更多细节。
每个枚举常量仅作为**单个**实例存在，而密封类的子类可以拥有**多个**实例。
在示例中，`sealed class Error` 连同其几个子类一起，采用一个 `enum` 来表示错误严重性。
每个子类构造函数都会初始化 `severity` 并且可以改变其状态：

```kotlin
enum class ErrorSeverity { MINOR, MAJOR, CRITICAL }

sealed class Error(val severity: ErrorSeverity) {
    class FileReadError(val file: File): Error(ErrorSeverity.MAJOR)
    class DatabaseError(val source: DataSource): Error(ErrorSeverity.CRITICAL)
    object RuntimeError : Error(ErrorSeverity.CRITICAL)
    // 可以在此处添加其他错误类型
}
```

密封类的构造函数可以具有两种[可见性](visibility-modifiers.md)之一：默认的 `protected`，或 `private`：

```kotlin
sealed class IOError {
    // 密封类构造函数默认具有 protected 可见性。它在该类及其子类内部可见
    constructor() { /*...*/ }

    // 私有构造函数，仅在该类内部可见。
    // 在密封类中使用私有构造函数可以更严格地控制实例化，从而在类内部启用特定的初始化过程。
    private constructor(description: String): this() { /*...*/ }

    // 这将引发错误，因为密封类中不允许使用 public 和 internal 构造函数
    // public constructor(code: Int): this() {} 
}
```

## 继承 {id="inheritance"}

密封类和接口的直接子类必须声明在同一个包中。它们可以是顶级声明，也可以嵌套在任意数量的其他已命名类、已命名接口或已命名对象中。子类可以具有任何[可见性](visibility-modifiers.md)，只要它们符合 Kotlin 中的普通继承规则（包括[重写属性](inheritance.md#overriding-properties)的规则）即可。

密封类的子类必须具有正确限定的名称。它们不能是局部对象或匿名对象。

> `enum` 类无法扩展密封类或任何其他类。但是，它们可以实现密封接口：
>
> ```kotlin
> sealed interface Error
> 
> // 扩展密封接口 Error 的枚举类
> enum class ErrorType : Error {
>     FILE_ERROR, DATABASE_ERROR
> }
>
> ```
> 
{style="note"}

这些限制不适用于间接子类。如果密封类的直接子类未被标记为密封，则可以按照其修饰符允许的任何方式对其进行扩展：

```kotlin
// 密封接口 'Error' 仅在同一个包和模块中具有实现
sealed interface Error

// 密封类 'IOError' 扩展了 'Error'，且只能在同一个包内被扩展
sealed class IOError(): Error

// 开放类 'CustomError' 扩展了 'Error'，可以在其可见的任何地方被扩展
open class CustomError(): Error
```

### 多平台项目中的继承 {id="inheritance-in-multiplatform-projects"}

在[多平台项目](https://kotlinlang.org/docs/multiplatform/get-started.html)中还有一个继承限制：密封类的直接子类必须位于同一个[源集](https://kotlinlang.org/docs/multiplatform/multiplatform-discover-project.html#source-sets)中。这适用于没有 [expected 和 actual 修饰符](https://kotlinlang.org/docs/multiplatform/multiplatform-expect-actual.html)的密封类。

如果一个密封类在公共源集中被声明为 `expect`，并在平台源集中具有 `actual` 实现，则 `expect` 和 `actual` 版本都可以拥有位于各自源集中的子类。此外，如果你使用层次结构，可以在 `expect` 和 `actual` 声明之间的任何源集中创建子类。

[详细了解多平台项目的层次结构](https://kotlinlang.org/docs/multiplatform/multiplatform-hierarchy.html)。

## 将密封类与 when 表达式结合使用 {id="use-sealed-classes-with-when-expression"}

使用密封类的关键优势在于将它们与 [`when`](control-flow.md#when-expressions-and-statements) 表达式结合使用。
与密封类一起使用时，`when` 表达式允许 Kotlin 编译器穷举检查是否涵盖了所有可能的情况。
在这些情况下，你无需添加 `else` 子句：

```kotlin
// 密封类及其子类
sealed class Error {
    class FileReadError(val file: String): Error()
    class DatabaseError(val source: String): Error()
    object RuntimeError : Error()
}

//sampleStart
// 用于记录错误的函数
fun log(e: Error) = when(e) {
    is Error.FileReadError -> println("Error while reading file ${e.file}")
    is Error.DatabaseError -> println("Error while reading from database ${e.source}")
    Error.RuntimeError -> println("Runtime error")
    // 无需 `else` 子句，因为已涵盖所有情况
}
//sampleEnd

// 列出所有错误
fun main() {
    val errors = listOf(
        Error.FileReadError("example.txt"),
        Error.DatabaseError("usersDatabase"),
        Error.RuntimeError
    )

    errors.forEach { log(it) }
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.5"}

> 为了减少 `when` 表达式中的重复代码，可以尝试使用上下文相关解析（目前处于预览阶段）。
> 如果预期类型已知，此功能允许你在匹配密封类成员时省略类型名称。
>
> 更多信息请参阅[上下文相关解析预览](whatsnew22.md#preview-of-context-sensitive-resolution)或相关的 [KEEP 提案](https://github.com/Kotlin/KEEP/blob/improved-resolution-expected-type/proposals/context-sensitive-resolution.md)。
> 
{style="tip"}

将密封类与 `when` 表达式结合使用时，你还可以添加保护条件以在单个分支中包含额外的检查。
更多信息请参阅 [when 表达式中的保护条件](control-flow.md#guard-conditions-in-when-expressions)。

> 在多平台项目中，如果你在公共代码中将密封类与 `when` 表达式作为[预期声明 (expected declaration)](https://kotlinlang.org/docs/multiplatform/multiplatform-expect-actual.html) 使用，你仍然需要一个 `else` 分支。
> 这是因为 `actual` 平台实现的子类可能会扩展公共代码中未知的密封类。
>
{style="note"}

## 通过反射检查密封子类 {id="inspect-sealed-subclasses-with-reflection"}

你可以使用[反射](reflection.md)功能在运行时检查密封类或接口的直接子类。
这有助于框架代码发现密封层次结构的分支。例如，你可以注册序列化器或验证每个分支是否都有处理程序。

如果你需要检查已知的直接子类，请使用 [sealedSubclasses](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.reflect/-k-class/sealed-subclasses.html)。
该方法返回一个可表示普通类或对象声明的 [`KClass`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.reflect/-k-class/)。对于对象声明，
[`objectInstance`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.reflect/-k-class/object-instance.html) 会返回其单例实例：

```kotlin
sealed interface Status
data class Send(val message: String) : Status
data object Start : Status
data object Stop : Status

fun main() {
    // 获取该密封层次结构已知的直接子类
    val subclasses = Status::class.sealedSubclasses
    println(subclasses.mapNotNull { it.simpleName })
    // [Send, Start, Stop]

    val singletonStatus = subclasses.mapNotNull { subclass ->
        // 对于 Send 返回 null，因为它是普通类
        subclass.objectInstance
    }
    println(singletonStatus)
    // [Start, Stop]
}
```

在此示例中，`objectInstance` 会过滤掉 `Send`，因为每个 `Send` 值都必须单独构造。由于 `Start` 和 `Stop` 是对象声明，编译器会返回它们现有的单例实例。

> 如果某个直接子类也是密封的，请递归遍历其 `sealedSubclasses` 以收集完整的层次结构。
> 
{style="tip"}

## 用例场景 {id="use-case-scenarios"}

让我们来了解一些密封类和接口特别有用的实际场景。

### UI 应用程序中的状态管理 {id="state-management-in-ui-applications"}

你可以使用密封类来表示应用程序中不同的 UI 状态。
这种方法可以结构化且安全地处理 UI 更改。
以下示例演示了如何管理各种 UI 状态：

```kotlin
sealed class UIState { 
    data object Loading : UIState()
    data class Success(val data: String) : UIState()
    data class Error(val exception: Exception) : UIState()
}

fun updateUI(state: UIState) { 
    when (state) {
        is UIState.Loading -> showLoadingIndicator()
        is UIState.Success -> showData(state.data)
        is UIState.Error -> showError(state.exception) 
    }
}
```

### 支付方式处理 {id="payment-method-handling"}

在实际的业务应用程序中，高效处理各种支付方式是一项常见需求。
你可以将密封类与 `when` 表达式结合使用来实现此类业务逻辑。
通过将不同的支付方式表示为密封类的子类，它建立了一个清晰且易于管理的交易处理结构：

```kotlin
sealed class Payment {
    data class CreditCard(val number: String, val expiryDate: String) : Payment()
    data class PayPal(val email: String) : Payment()
    data object Cash : Payment()
}

fun processPayment(payment: Payment) { 
    when (payment) {
        is Payment.CreditCard -> processCreditCardPayment(payment.number, payment.expiryDate)
        is Payment.PayPal -> processPayPalPayment(payment.email)
        is Payment.Cash -> processCashPayment() 
    }
}
```

`Payment` 是一个密封类，表示电子商务系统中的不同支付方式：
`CreditCard`、`PayPal` 和 `Cash`。每个子类都可以有其特定的属性，例如针对 `CreditCard` 的 `number` 和 `expiryDate`，以及针对 `PayPal` 的 `email`。

`processPayment()` 函数演示了如何处理不同的支付方式。
这种方法确保了所有可能的支付类型都得到了考虑，并且系统对于将来添加新的支付方式保持了灵活性。

### API 请求-响应处理 {id="api-request-response-handling"}

你可以使用密封类和密封接口来实现处理 API 请求和响应的用户身份验证系统。
该用户身份验证系统具有登录和注销功能。
`ApiRequest` 密封接口定义了特定的请求类型：登录操作为 `LoginRequest`，注销操作为 `LogoutRequest`。
密封类 `ApiResponse` 封装了不同的响应场景：包含用户数据的 `UserSuccess`、表示用户不存在的 `UserNotFound`，以及表示任何失败的 `Error`。`handleRequest` 函数使用 `when` 表达式以类型安全的方式处理这些请求，而 `getUserById` 则模拟用户检索：

```kotlin
// 导入必要的模块
import io.ktor.server.application.*
import io.ktor.server.resources.*

import kotlinx.serialization.*

// 使用 Ktor resources 定义用于 API 请求的密封接口
@Resource("api")
sealed interface ApiRequest

@Serializable
@Resource("login")
data class LoginRequest(val username: String, val password: String) : ApiRequest

@Serializable
@Resource("logout")
object LogoutRequest : ApiRequest

// 定义包含详细响应类型的 ApiResponse 密封类
sealed class ApiResponse {
    data class UserSuccess(val user: UserData) : ApiResponse()
    data object UserNotFound : ApiResponse()
    data class Error(val message: String) : ApiResponse()
}

// 用于成功响应的用户数据类
data class UserData(val userId: String, val name: String, val email: String)

// 用于验证用户凭据的函数（用于演示目的）
fun isValidUser(username: String, password: String): Boolean {
    // 某些验证逻辑（这只是一个占位符）
    return username == "validUser" && password == "validPass"
}

// 用于处理带有详细响应的 API 请求的函数
fun handleRequest(request: ApiRequest): ApiResponse {
    return when (request) {
        is LoginRequest -> {
            if (isValidUser(request.username, request.password)) {
                ApiResponse.UserSuccess(UserData("userId", "userName", "userEmail"))
            } else {
                ApiResponse.Error("Invalid username or password")
            }
        }
        is LogoutRequest -> {
            // 在本例中假定注销操作始终成功
            ApiResponse.UserSuccess(UserData("userId", "userName", "userEmail")) // 仅供演示
        }
    }
}

// 模拟 getUserById 调用的函数
fun getUserById(userId: String): ApiResponse {
    return if (userId == "validUserId") {
        ApiResponse.UserSuccess(UserData("validUserId", "John Doe", "john@example.com"))
    } else {
        ApiResponse.UserNotFound
    }
    // 错误处理也会导致返回 Error 响应。
}

// 演示用法的 main 函数
fun main() {
    val loginResponse = handleRequest(LoginRequest("user", "pass"))
    println(loginResponse)

    val logoutResponse = handleRequest(LogoutRequest)
    println(logoutResponse)

    val userResponse = getUserById("validUserId")
    println(userResponse)

    val userNotFoundResponse = getUserById("invalidId")
    println(userNotFoundResponse)
}
```

## 下一步 {id="what-s-next"}

详细了解 [Kotlin 中的继承](inheritance.md)。