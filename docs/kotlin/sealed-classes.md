[//]: # (title: 密封类与接口)

密封类与接口为您的类层次结构提供了受控继承。密封类的所有直接子类在编译时都是已知的。在该密封类定义的模块和软件包之外，不能出现其他子类。同样的逻辑也适用于密封接口及其实现：一旦编译了包含密封接口的模块，就无法创建新的实现。

> 直接子类是指直接继承自其超类的类。
> 
> 间接子类是指继承自其超类一级以下的类。
>
{style="note"}

当您将密封类与接口与 `when` 表达式结合使用时，可以覆盖所有可能子类的行为，并确保不会创建新的子类来对您的代码产生负面影响。

密封类最适合用于以下场景：

* **需要受限的类继承：** 您拥有一组预定义的、有限的子类来扩展一个类，且所有这些子类在编译时都是已知的。
* **需要类型安全的设计：** 安全性和模式匹配在您的项目中至关重要。特别是在状态管理或处理复杂的条件逻辑时。有关示例，请查看[将密封类与 when 表达式结合使用](#use-sealed-classes-with-when-expression)。
* **处理封闭 API：** 您希望为库提供稳健且可维护的公共 API，以确保第三方客户端按预期使用这些 API。

有关更详细的实际应用，请参阅[用例场景](#use-case-scenarios)。

> Java 15 引入了[类似的概念](https://docs.oracle.com/en/java/javase/15/language/sealed-classes-and-interfaces.html#GUID-0C709461-CC33-419A-82BF-61461336E65F)，其中密封类使用 `sealed` 关键字配合 `permits` 子句来定义受限的层次结构。
>
{style="tip"}

## 声明密封类或接口

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

此示例可以表示一个包含错误类的库 API，以便库用户处理它可能抛出的错误。如果此类错误类的层次结构包含在公共 API 中可见的接口或抽象类，那么没有什么能阻止其他开发者在客户端代码中实现或扩展它们。由于库不知道在其外部声明的错误，因此无法将其与其自身的类进行一致处理。然而，通过**密封**的错误类层次结构，库作者可以确信他们了解所有可能的错误类型，并且以后不会出现其他错误类型。

该示例的层次结构如下所示：

![密封类与接口的层次结构插图](sealed-classes-interfaces.svg){width=700}

### 构造函数

密封类本身始终是一个[抽象类](classes.md#abstract-classes)，因此不能直接实例化。但是，它可以包含或继承构造函数。这些构造函数不是为了创建密封类本身的实例，而是为了其子类。考虑以下示例，其中包含一个名为 `Error` 的密封类及其几个子类，我们对这些子类进行实例化：

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

您可以在密封类中使用 [`enum`](enum-classes.md) 类，利用枚举常量来表示状态并提供额外细节。每个枚举常量仅作为**单个**实例存在，而密封类的子类可以有**多个**实例。
在示例中，`sealed class Error` 及其几个子类采用 `enum` 来表示错误严重程度。每个子类构造函数都会初始化 `severity` 并且可以更改其状态：

```kotlin
enum class ErrorSeverity { MINOR, MAJOR, CRITICAL }

sealed class Error(val severity: ErrorSeverity) {
    class FileReadError(val file: File): Error(ErrorSeverity.MAJOR)
    class DatabaseError(val source: DataSource): Error(ErrorSeverity.CRITICAL)
    object RuntimeError : Error(ErrorSeverity.CRITICAL)
    // 此处可以添加其他错误类型
}
```

密封类的构造函数可以具有两种[可见性](visibility-modifiers.md)之一：`protected`（默认）或 `private`：

```kotlin
sealed class IOError {
    // 密封类构造函数默认具有 protected 可见性。它在此类及其子类中可见
    constructor() { /*...*/ }

    // 私有构造函数，仅在此类内部可见。
    // 在密封类中使用私有构造函数可以实现更严格的实例化控制，从而在类内部启用特定的初始化过程。
    private constructor(description: String): this() { /*...*/ }

    // 这将引发错误，因为密封类中不允许使用 public 和 internal 构造函数
    // public constructor(code: Int): this() {} 
}
```

## 继承

密封类和接口的直接子类必须在同一个软件包中声明。它们可以是顶层的，也可以嵌套在任何数量的其他命名类、命名接口或命名对象中。只要子类符合 Kotlin 中的常规继承规则（包括[重写属性](inheritance.md#overriding-properties)的规则），就可以具有任何[可见性](visibility-modifiers.md)。

密封类的子类必须具有正确的限定名称。它们不能是局部对象或匿名对象。

> `enum` 类不能扩展密封类或任何其他类。但是，它们可以实现密封接口：
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

这些限制不适用于间接子类。如果密封类的直接子类未标记为密封，则可以按其修饰符允许的任何方式对其进行扩展：

```kotlin
// 密封接口 'Error' 仅在同一个软件包和模块中有实现
sealed interface Error

// 密封类 'IOError' 扩展了 'Error'，且仅在同一个软件包内可扩展
sealed class IOError(): Error

// 开放类 'CustomError' 扩展了 'Error'，且可以在任何可见的地方被扩展
open class CustomError(): Error
```

### 多平台项目中的继承

在[多平台项目](https://kotlinlang.org/docs/multiplatform/get-started.html)中还有一个继承限制：密封类的直接子类必须位于同一个[源集](https://kotlinlang.org/docs/multiplatform/multiplatform-discover-project.html#source-sets)中。这适用于没有 [`expect` 和 `actual` 修饰符](https://kotlinlang.org/docs/multiplatform/multiplatform-expect-actual.html)的密封类。

如果一个密封类在通用源集中被声明为 `expect`，并在平台源集中有 `actual` 实现，那么 `expect` 和 `actual` 版本都可以在各自的源集中拥有子类。此外，如果您使用分层结构，可以在 `expect` 和 `actual` 声明之间的任何源集中创建子类。

[详细了解多平台项目的分层结构](https://kotlinlang.org/docs/multiplatform/multiplatform-hierarchy.html)。

## 将密封类与 when 表达式结合使用

使用密封类的主要好处在于您在 [`when`](control-flow.md#when-expressions-and-statements) 表达式中使用它们时。
与密封类配合使用的 `when` 表达式允许 Kotlin 编译器穷举检查是否覆盖了所有可能的情况。在这种情况下，您不需要添加 `else` 子句：

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
    // 不需要 `else` 子句，因为所有情况都已覆盖
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

> 为了减少 `when` 表达式中的重复，请尝试上下文相关解析（目前处于预览阶段）。
> 此功能允许您在已知预期类型时，在匹配密封类成员时省略类型名称。
>
> 有关更多信息，请参阅[上下文相关解析预览](whatsnew22.md#preview-of-context-sensitive-resolution)或相关的 [KEEP 提案](https://github.com/Kotlin/KEEP/blob/improved-resolution-expected-type/proposals/context-sensitive-resolution.md)。
> 
{style="tip"}

在将密封类与 `when` 表达式结合使用时，您还可以添加守卫条件，以便在单个分支中包含额外的检查。有关更多信息，请参阅 [`when` 表达式中的守卫条件](control-flow.md#guard-conditions-in-when-expressions)。

> 在多平台项目中，如果您的通用代码中有一个密封类作为 [expect 声明](https://kotlinlang.org/docs/multiplatform/multiplatform-expect-actual.html)并在 `when` 表达式中使用，您仍然需要一个 `else` 分支。这是因为 `actual` 平台实现的子类可能会扩展通用代码中未知的密封类。
>
{style="note"}

## 用例场景

让我们探索一些密封类和接口特别有用的实际场景。

### UI 应用程序中的状态 management

您可以使用密封类来表示应用程序中不同的 UI 状态。这种方法允许结构化且安全地处理 UI 更改。此示例演示了如何管理各种 UI 状态：

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

### 付款方式处理

在实际业务应用中，高效处理各种付款方式是一项常见要求。
您可以使用密封类配合 `when` 表达式来实现此类业务逻辑。
通过将不同的付款方式表示为密封类的子类，它为处理交易建立了一个清晰且易于管理的结构：

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

`Payment` 是一个密封类，代表电子商务系统中的不同付款方式：`CreditCard`、`PayPal` 和 `Cash`。每个子类可以具有其特定的属性，例如 `CreditCard` 的 `number` 和 `expiryDate`，以及 `PayPal` 的 `email`。

`processPayment()` 函数演示了如何处理不同的付款方式。
这种方法确保考虑了所有可能的付款类型，并使系统能够灵活地在未来添加新的付款方式。

### API 请求-响应处理

您可以使用密封类和密封接口来实现一个处理 API 请求和响应的用户身份验证系统。
该用户身份验证系统具有登录和注销功能。
`ApiRequest` 密封接口定义了特定的请求类型：登录操作使用 `LoginRequest`，注销操作使用 `LogoutRequest`。
密封类 `ApiResponse` 封装了不同的响应场景：包含用户数据的 `UserSuccess`、表示用户不存在的 `UserNotFound` 以及表示任何失败的 `Error`。`handleRequest` 函数使用 `when` 表达式以类型安全的方式处理这些请求，而 `getUserById` 模拟用户获取过程：

```kotlin
// 导入必要的模块
import io.ktor.server.application.*
import io.ktor.server.resources.*

import kotlinx.serialization.*

// 使用 Ktor 资源定义 API 请求的密封接口
@Resource("api")
sealed interface ApiRequest

@Serializable
@Resource("login")
data class LoginRequest(val username: String, val password: String) : ApiRequest

@Serializable
@Resource("logout")
object LogoutRequest : ApiRequest

// 定义具有详细响应类型的 ApiResponse 密封类
sealed class ApiResponse {
    data class UserSuccess(val user: UserData) : ApiResponse()
    data object UserNotFound : ApiResponse()
    data class Error(val message: String) : ApiResponse()
}

// 在成功响应中使用的用户数据类
data class UserData(val userId: String, val name: String, val email: String)

// 验证用户凭据的函数（用于演示目的）
fun isValidUser(username: String, password: String): Boolean {
    // 某些验证逻辑（这只是一个占位符）
    return username == "validUser" && password == "validPass"
}

// 处理 API 请求并提供详细响应的函数
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
            // 在此示例中假定注销操作始终成功
            ApiResponse.UserSuccess(UserData("userId", "userName", "userEmail")) // 用于演示
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
    // 错误处理也会导致 Error 响应。
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

## 下一步

详细了解 [Kotlin 中的继承](inheritance.md)。