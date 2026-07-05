[//]: # (title: 密封類別與介面)

_密封 (Sealed)_ 類別與介面為您的類別階層結構提供受控的繼承機制。
密封類別的所有直接子類別在編譯時期都是已知的。在定義密封類別的模組與
套件之外，不得出現其他子類別。同樣的邏輯也適用於密封介面及其實作：
一旦編譯了包含密封介面的模組，就無法再建立新的實作。

> 直接子類別是指直接繼承其父類別的類別。
> 
> 間接子類別是指繼承自父類別下方超過一個層級的類別。
>
{style="note"}

當您將密封類別與介面結合 `when` 運算式使用時，可以涵蓋所有可能
子類別的行為，並確保不會建立新的子類別來對您的程式碼造成不利影響。

密封類別最適合用於以下情境：

* **需要限制類別繼承：** 您有一組預定義且有限的子類別來擴充某個類別，且這些子類別在編譯時期皆為已知。
* **需要型別安全設計：** 安全性與模式配對在您的專案中至關重要。特別是對於狀態管理或處理複雜的條件邏輯。範例請參閱[將密封類別與 when 運算式搭配使用](#use-sealed-classes-with-when-expression)。
* **使用封閉式 API：** 您希望為程式庫建立健全且易於維護的公開 API，以確保第三方用戶端依預期方式使用這些 API。

如需更詳細的實際應用，請參閱[使用案例情境](#use-case-scenarios)。

> Java 15 引入了[類似的概念](https://docs.oracle.com/en/java/javase/15/language/sealed-classes-and-interfaces.html#GUID-0C709461-CC33-419A-82BF-61461336E65F)，
> 其中密封類別使用 `sealed` 關鍵字配合 `permits` 子句來定義受限的階層結構。
>
{style="tip"}

## 宣告密封類別或介面

要宣告密封類別或介面，請使用 `sealed` 修飾符：

```kotlin
// 建立一個密封介面
sealed interface Error

// 建立一個實作密封介面 Error 的密封類別
sealed class IOError(): Error

// 定義擴充密封類別 'IOError' 的子類別
class FileReadError(val file: File): IOError()
class DatabaseError(val source: DataSource): IOError()

// 建立一個實作 'Error' 密封介面的單例物件
object RuntimeError : Error
```

此範例可以代表一個程式庫的 API，其中包含錯誤類別，讓程式庫使用者能處理其可能拋出的錯誤。
如果此類錯誤類別的階層結構包含在公開 API 中可見的介面或抽象類別，那麼就無法
阻止其他開發人員在用戶端程式碼中實作或擴充它們。
由於程式庫不知道在其外部宣告的錯誤，因此無法對其進行與自身類別一致的處理。
然而，透過錯誤類別的 **密封** 階層結構，程式庫作者可以確信他們知道所有可能的錯誤
型別，且稍後不會出現其他錯誤型別。

該範例的階層結構如下所示：

![密封類別與介面的階層結構圖示](sealed-classes-interfaces.svg){width=700}

### 建構函式

密封類別本身始終是一個[抽象類別](classes.md#abstract-classes)，因此無法直接具現化。
不過，它可以包含或繼承建構函式。這些建構函式不是為了建立密封類別本身的執行個體，
而是為了其子類別。請參考以下範例，其中有一個名為 `Error` 的密封類別及其多個子類別，
我們將其實現化：

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

您可以在密封類別中使用 [`enum`](enum-classes.md) 類別，利用列舉常值來表示狀態並提供
額外細節。每個列舉常值僅以 **單一** 執行個體存在，而密封類別的子類別則可以
擁有 **多個** 執行個體。
在範例中，`sealed class Error` 及其多個子類別採用了 `enum` 來表示錯誤嚴重程度。
每個子類別建構函式都會初始化 `severity` 並可以更改其狀態：

```kotlin
enum class ErrorSeverity { MINOR, MAJOR, CRITICAL }

sealed class Error(val severity: ErrorSeverity) {
    class FileReadError(val file: File): Error(ErrorSeverity.MAJOR)
    class DatabaseError(val source: DataSource): Error(ErrorSeverity.CRITICAL)
    object RuntimeError : Error(ErrorSeverity.CRITICAL)
    // 此處可新增額外的錯誤型別
}
```

密封類別的建構函式可以具有兩種[可見性](visibility-modifiers.md)之一：`protected`（預設）或
`private`：

```kotlin
sealed class IOError {
    // 密封類別建構函式預設具有 protected 可見性。它在此類別及其子類別內部可見 
    constructor() { /*...*/ }

    // 私有建構函式，僅在此類別內部可見。 
    // 在密封類別中使用私有建構函式可以更嚴格地控制具現化，從而在類別內啟用特定的初始化程序。
    private constructor(description: String): this() { /*...*/ }

    // 這會引發錯誤，因為密封類別中不允許使用 public 和 internal 建構函式
    // public constructor(code: Int): this() {} 
}
```

## 繼承

密封類別與介面的直接子類別必須宣告在同一個套件中。它們可以是頂層宣告，也可以巢狀
於任意數量的其他具名類別、具名介面或具名物件中。只要符合 Kotlin 的一般繼承規則，
包括[覆寫屬性](inheritance.md#overriding-properties)的規則，子類別可以具有任何[可見性](visibility-modifiers.md)。

密封類別的子類別必須具有適當的合格名稱。它們不能是區域物件或匿名物件。

> `enum` 類別無法擴充密封類別或任何其他類別。然而，它們可以實作密封介面：
>
> ```kotlin
> sealed interface Error
> 
> // 實作密封介面 Error 的 enum 類別
> enum class ErrorType : Error {
>     FILE_ERROR, DATABASE_ERROR
> }
>
> ```
> 
{style="note"}

這些限制不適用於間接子類別。如果密封類別的直接子類別未標記為 sealed，
則可以按照其修飾符允許的任何方式對其進行擴充：

```kotlin
// 密封介面 'Error' 僅在同一個套件與模組中有實作
sealed interface Error

// 密封類別 'IOError' 擴充 'Error'，且僅在同一個套件內可被擴充
sealed class IOError(): Error

// Open 類別 'CustomError' 擴充 'Error'，且可以在任何可見之處被擴充
open class CustomError(): Error
```

### 多平台專案中的繼承

在[多平台專案](https://kotlinlang.org/docs/multiplatform/get-started.html)中還有一個繼承限制：密封類別的直接子類別必須
位於同一個[原始碼集](https://kotlinlang.org/docs/multiplatform/multiplatform-discover-project.html#source-sets)。這適用於不帶 [expect 與 actual 修飾符](https://kotlinlang.org/docs/multiplatform/multiplatform-expect-actual.html)的密封類別。

如果密封類別在通用原始碼集中宣告為 `expect`，並在平台原始碼集中有 `actual` 實作，
則 `expect` 與 `actual` 版本都可以在其各自的原始碼集中擁有子類別。此外，如果您使用階層結構，
您可以在 `expect` 與 `actual` 宣告之間的任何原始碼集中建立子類別。 

[進一步了解多平台專案的階層結構](https://kotlinlang.org/docs/multiplatform/multiplatform-hierarchy.html)。 

## 將密封類別與 when 運算式搭配使用

使用密封類別的主要好處在於將其應用於 [`when`](control-flow.md#when-expressions-and-statements)
運算式時。
當 `when` 運算式搭配密封類別使用時，Kotlin 編譯器能窮舉檢查是否已涵蓋所有可能的情況。 
在這種情況下，您不需要新增 `else` 子句：

```kotlin
// 密封類別及其子類別
sealed class Error {
    class FileReadError(val file: String): Error()
    class DatabaseError(val source: String): Error()
    object RuntimeError : Error()
}

//sampleStart
// 用於記錄錯誤的函式
fun log(e: Error) = when(e) {
    is Error.FileReadError -> println("Error while reading file ${e.file}")
    is Error.DatabaseError -> println("Error while reading from database ${e.source}")
    Error.RuntimeError -> println("Runtime error")
    // 不需要 `else` 子句，因為已涵蓋所有情況
}
//sampleEnd

// 列出所有錯誤
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

> 為了減少 `when` 運算式中的重複內容，請嘗試使用上下文相關解析（目前為預覽版）。
> 此功能允許您在已知預期型別的情況下，於匹配密封類別成員時省略型別名稱。
>
> 如需更多資訊，請參閱 [上下文相關解析預覽](whatsnew22.md#preview-of-context-sensitive-resolution) 或相關的 [KEEP 提案](https://github.com/Kotlin/KEEP/blob/improved-resolution-expected-type/proposals/context-sensitive-resolution.md)。
> 
{style="tip"}

將密封類別與 `when` 運算式搭配使用時，您也可以新增守衛條件，在單個分支中包含額外檢查。
如需更多資訊，請參閱 [`when` 運算式中的守衛條件](control-flow.md#guard-conditions-in-when-expressions)。

> 在多平台專案中，如果您在通用程式碼中將帶有 `when` 運算式的密封類別作為 
> [預期宣告](https://kotlinlang.org/docs/multiplatform/multiplatform-expect-actual.html)，您仍然需要 `else` 分支。 
> 這是因為 `actual` 平台實作的子類別可能會擴充在通用程式碼中未知的密封類別。
>
{style="note"}

## 使用案例情境

讓我們探索密封類別與介面特別有用的一些實際案例。

### UI 應用程式中的狀態管理

您可以使用密封類別來表示應用程式中不同的 UI 狀態。 
這種方法允許對 UI 變更進行結構化且安全的處理。 
此範例展示了如何管理各種 UI 狀態：

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

### 付款方式處理

在實際的商業應用程式中，有效處理各種付款方式是常見的需求。
您可以將密封類別與 `when` 運算式搭配使用來實作此類商業邏輯。
透過將不同的付款方式表示為密封類別的子類別，它為處理交易建立了一個清晰且易於管理的
結構：

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

`Payment` 是一個密封類別，代表電子商務系統中不同的付款方式： 
`CreditCard`、`PayPal` 與 `Cash`。每個子類別都可以有其特定屬性，例如 `CreditCard` 的 `number` 與 `expiryDate`，
以及 `PayPal` 的 `email`。 

`processPayment()` 函式展示了如何處理不同的付款方式。
這種方法確保考慮了所有可能的付款型別，並且系統對於未來新增付款
方式保持彈性。

### API 請求與回應處理

您可以使用密封類別與密封介面來實作一個處理 API 請求與回應的使用者驗證系統。 
該使用者驗證系統具有登入與登出功能。 
`ApiRequest` 密封介面定義了特定的請求型別：用於登入的 `LoginRequest`，以及用於登出操作的 `LogoutRequest`。 
密封類別 `ApiResponse` 封裝了不同的回應情境：帶有使用者資料的 `UserSuccess`、用於使用者不存在情況的 `UserNotFound`，
以及用於任何失敗情況的 `Error`。`handleRequest` 函式使用 `when` 運算式以型別安全的方式處理這些請求，
而 `getUserById` 則模擬使用者擷取：

```kotlin
// 匯入必要的模組
import io.ktor.server.application.*
import io.ktor.server.resources.*

import kotlinx.serialization.*

// 使用 Ktor 資源定義 API 請求的密封介面
@Resource("api")
sealed interface ApiRequest

@Serializable
@Resource("login")
data class LoginRequest(val username: String, val password: String) : ApiRequest

@Serializable
@Resource("logout")
object LogoutRequest : ApiRequest

// 定義具有詳細回應型別的 ApiResponse 密封類別
sealed class ApiResponse {
    data class UserSuccess(val user: UserData) : ApiResponse()
    data object UserNotFound : ApiResponse()
    data class Error(val message: String) : ApiResponse()
}

// 用於成功回應的使用者資料類別
data class UserData(val userId: String, val name: String, val email: String)

// 驗證使用者憑據的函式（僅供示範使用）
fun isValidUser(username: String, password: String): Boolean {
    // 某些驗證邏輯（這只是一個佔位符）
    return username == "validUser" && password == "validPass"
}

// 處理具有詳細回應之 API 請求的函式
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
            // 在此範例中假設登出操作始終成功
            ApiResponse.UserSuccess(UserData("userId", "userName", "userEmail")) // 僅供示範
        }
    }
}

// 模擬 getUserById 呼叫的函式
fun getUserById(userId: String): ApiResponse {
    return if (userId == "validUserId") {
        ApiResponse.UserSuccess(UserData("validUserId", "John Doe", "john@example.com"))
    } else {
        ApiResponse.UserNotFound
    }
    // 錯誤處理也會導致 Error 回應。
}

// 示範用法的 main 函式
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

進一步了解 [Kotlin 中的繼承](inheritance.md)。