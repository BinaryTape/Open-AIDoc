[//]: # (title: 密封類別與介面)

_密封_（Sealed）類別與介面為您的類別階層結構提供了受控的繼承機制。
密封類別的所有直接子類別在編譯期都是已知的。在定義該密封類別的模組與套件之外，不能出現任何其他子類別。相同的邏輯也適用於密封介面及其實作：
一旦包含密封介面的模組編譯完成，就無法再建立新的實作。

> 直接子類別是指直接繼承自其超類別的類別。
> 
> 間接子類別是指繼承自其超類別一層以上的類別。
>
{style="note"}

當您將密封類別與介面結合 `when` 運算式使用時，可以涵蓋所有可能子類別的行為，並確保不會建立新的子類別而對您的程式碼造成負面影響。

密封類別最適合用於以下情境：

* **需要有限的類別繼承：** 您擁有預先定義、有限的子類別集合來擴充某個類別，且所有子類別在編譯期都是已知的。
* **需要型別安全的設計：** 安全性與模式配對在您的專案中至關重要。特別是用於狀態管理或處理複雜的條件邏輯。範例請參閱[搭配 when 運算式使用密封類別](#use-sealed-classes-with-when-expression)。
* **處理封閉式 API：** 您希望為程式庫建構健全且可維護的公開 API，確保第三方用戶端依照預期方式使用這些 API。

如需更詳細的實際應用，請參閱[使用案例情境](#use-case-scenarios)。

> Java 15 引入了[類似的概念](https://docs.oracle.com/en/java/javase/15/language/sealed-classes-and-interfaces.html#GUID-0C709461-CC33-419A-82BF-61461336E65F)，
> 其中密封類別使用 `sealed` 關鍵字搭配 `permits` 子句來定義受限的階層結構。
>
{style="tip"}

## 宣告密封類別或介面 {id="declare-a-sealed-class-or-interface"}

若要宣告密封類別或介面，請使用 `sealed` 修飾詞：

```kotlin
// 建立密封介面
sealed interface Error

// 建立實作密封介面 Error 的密封類別
sealed class IOError(): Error

// 定義擴充密封類別 'IOError' 的子類別
class FileReadError(val file: File): IOError()
class DatabaseError(val source: DataSource): IOError()

// 建立實作 'Error' 密封介面的單例物件
object RuntimeError : Error
```

此範例可以代表某個程式庫的 API，其中包含錯誤類別，以便讓程式庫使用者處理其可能擲回的錯誤。
如果此類錯誤類別的階層結構包含了在公開 API 中可見的介面或抽象類別，那麼沒有任何機制可以阻止其他開發人員在用戶端程式碼中實作或擴充它們。
由於該程式庫無法得知在其外部宣告的錯誤，因此無法與自己的類別一致地處理它們。
然而，透過錯誤類別的**密封**階層結構，程式庫作者可以確信他們知道所有可能的錯誤型別，且後續不會出現其他錯誤型別。

該範例的階層結構如下所示：

![密封類別與介面的階層結構圖](sealed-classes-interfaces.svg){width=700}

### 建構函式 {id="constructors"}

密封類別本身始終是[抽象類別](classes.md#abstract-classes)，因此無法直接具現化。
不過，它可以包含或繼承建構函式。這些建構函式不是用於建立密封類別本身的執行個體，而是用於其子類別。請參考以下名為 `Error` 的密封類別及其多個子類別的範例，我們對其進行具現化：

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

您可以在密封類別中使用 [`enum`](enum-classes.md) 類別，利用列舉常數來表示狀態並提供更多細節。每個列舉常數僅以**單一**執行個體存在，而密封類別的子類別可以擁有**多個**執行個體。
在該範例中，`sealed class Error` 及其數個子類別採用了 `enum` 來表示錯誤的嚴重程度。
每個子類別建構函式都會初始化 `severity` 並且可以變更其狀態：

```kotlin
enum class ErrorSeverity { MINOR, MAJOR, CRITICAL }

sealed class Error(val severity: ErrorSeverity) {
    class FileReadError(val file: File): Error(ErrorSeverity.MAJOR)
    class DatabaseError(val source: DataSource): Error(ErrorSeverity.CRITICAL)
    object RuntimeError : Error(ErrorSeverity.CRITICAL)
    // 此處可新增其他錯誤型別
}
```

密封類別的建構函式可以具備兩種[可見性](visibility-modifiers.md)之一：`protected`（預設）或 `private`：

```kotlin
sealed class IOError {
    // 密封類別建構函式預設具有 protected 可見性。在此類別及其子類別內部可見 
    constructor() { /*...*/ }

    // private 建構函式，僅在此類別內部可見。
    // 在密封類別中使用 private 建構函式可以更嚴格地控制具現化，從而在類別內部啟用特定的初始化流程。
    private constructor(description: String): this() { /*...*/ }

    // 這會引發錯誤，因為密封類別中不允許 public 和 internal 建構函式
    // public constructor(code: Int): this() {} 
}
```

## 繼承 {id="inheritance"}

密封類別和介面的直接子類別必須宣告在同一個套件中。它們可以是頂層宣告，也可以巢狀於任意數量的其他具名類別、具名介面或具名物件中。子類別可以具備任何[可見性](visibility-modifiers.md)，只要它們與 Kotlin 中的一般繼承規則相容即可，包括[覆寫屬性](inheritance.md#overriding-properties)的規則。

密封類別的子類別必須具有合適的完整限定名稱。它們不能是區域物件或匿名物件。

> `enum` 類別無法擴充密封類別或任何其他類別。但是，它們可以實作密封介面：
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

這些限制不適用於間接子類別。如果密封類別的直接子類別未被標記為密封，則可以按照其修飾詞允許的任何方式進行擴充：

```kotlin
// 密封介面 'Error' 僅在同一個套件與模組中具有實作
sealed interface Error

// 密封類別 'IOError' 繼承 'Error'，且僅在同一個套件內可擴充
sealed class IOError(): Error

// Open 類別 'CustomError' 繼承 'Error'，可以在其可見的任何地方被擴充
open class CustomError(): Error
```

### 多平台專案中的繼承 {id="inheritance-in-multiplatform-projects"}

在[多平台專案](https://kotlinlang.org/docs/multiplatform/get-started.html)中還有另一項繼承限制：密封類別的直接子類別必須位於同一個[原始碼集](https://kotlinlang.org/docs/multiplatform/multiplatform-discover-project.html#source-sets)中。這適用於沒有 [expected 與 actual 修飾詞](https://kotlinlang.org/docs/multiplatform/multiplatform-expect-actual.html)的密封類別。

如果密封類別在通用原始碼集中宣告為 `expect`，並且在平台原始碼集中具有 `actual` 實作，則 `expect` 和 `actual` 版本都可以在各自的原始碼集中擁有子類別。此外，如果您使用階層架構，可以在 `expect` 和 `actual` 宣告之間的任何原始碼集中建立子類別。

[進一步了解多平台專案的階層架構](https://kotlinlang.org/docs/multiplatform/multiplatform-hierarchy.html)。

## 搭配 when 運算式使用密封類別 {id="use-sealed-classes-with-when-expression"}

使用密封類別的核心優勢在於將它們運用在 [`when`](control-flow.md#when-expressions-and-statements) 運算式中。
將 `when` 運算式與密封類別結合使用時，Kotlin 編譯器能夠詳盡檢查所有可能的情況是否都已被涵蓋。
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
    // 不需要 `else` 子句，因為所有情況都已被涵蓋
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

> 為了減少 `when` 運算式中的重複程式碼，可以嘗試上下文相關的解析（目前處於預覽階段）。
> 如果預期型別已知，此功能可讓您在比對密封類別成員時省略型別名稱。
>
> 如需更多資訊，請參閱[上下文相關解析的預覽](whatsnew22.md#preview-of-context-sensitive-resolution)或相關的 [KEEP 提案](https://github.com/Kotlin/KEEP/blob/improved-resolution-expected-type/proposals/context-sensitive-resolution.md)。
> 
{style="tip"}

在搭配 `when` 運算式使用密封類別時，您還可以新增保護條件以在單一分支中包含額外檢查。
如需更多資訊，請參閱 [when 運算式中的保護條件](control-flow.md#guard-conditions-in-when-expressions)。

> 在多平台專案中，如果您在通用程式碼中將密封類別與 `when` 運算式作為 [expected 宣告](https://kotlinlang.org/docs/multiplatform/multiplatform-expect-actual.html)，您仍然需要一個 `else` 分支。
> 這是因為 `actual` 平台實作的子類別可能會擴充在通用程式碼中未知的密封類別。
>
{style="note"}

## 使用反射檢查密封子類別 {id="inspect-sealed-subclasses-with-reflection"}

您可以使用[反射](reflection.md)功能在執行階段檢查密封類別或介面的直接子類別。
這有助於框架程式碼探索密封階層結構的各個變體。例如，您可以註冊序列化器，或是驗證每個變體都具有處理常式。

如果您需要檢查已知的直接子類別，請使用 [sealedSubclasses](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.reflect/-k-class/sealed-subclasses.html)。
該方法會傳回一個 [`KClass`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.reflect/-k-class/)，它可以代表一般類別或物件宣告。對於物件宣告，[`objectInstance`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.reflect/-k-class/object-instance.html) 會傳回其單例執行個體：

```kotlin
sealed interface Status
data class Send(val message: String) : Status
data object Start : Status
data object Stop : Status

fun main() {
    // 取得密封階層結構中已知的直接子類別
    val subclasses = Status::class.sealedSubclasses
    println(subclasses.mapNotNull { it.simpleName })
    // [Send, Start, Stop]

    val singletonStatus = subclasses.mapNotNull { subclass ->
        // Send 會傳回 null，因為它是一般類別
        subclass.objectInstance
    }
    println(singletonStatus)
    // [Start, Stop]
}
```

在此範例中，`objectInstance` 會篩選掉 `Send`，因為每個 `Send` 值都必須單獨建構。由於 `Start` 和 `Stop` 是物件宣告，編譯器會傳回它們既有的單例執行個體。

> 如果其中一個直接子類別也是密封的，請遞迴遍歷其 `sealedSubclasses` 以收集完整的階層結構。
> 
{style="tip"}

## 使用案例情境 {id="use-case-scenarios"}

讓我們來探討一些密封類別與介面特別實用的實際情境。

### UI 應用程式中的狀態管理 {id="state-management-in-ui-applications"}

您可以使用密封類別來表示應用程式中不同的 UI 狀態。
這種方法允許結構化且安全地處理 UI 變更。
以下範例示範如何管理各種 UI 狀態：

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

### 付款方式處理 {id="payment-method-handling"}

在實際的商業應用中，有效率地處理各種付款方式是常見的需求。
您可以結合密封類別與 `when` 運算式來實作此類業務邏輯。
透過將不同的付款方式表示為密封類別的子類別，它建立了一個清晰且易於維護的架構來處理交易：

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

`Payment` 是一個密封類別，代表電子商務系統中的不同付款方式：
`CreditCard`、`PayPal` 和 `Cash`。每個子類別都可以有其特定屬性，例如 `CreditCard` 的 `number` 和 `expiryDate`，以及 `PayPal` 的 `email`。

`processPayment()` 函式示範了如何處理不同的付款方式。
這種方法確保考慮了所有可能的付款類型，並且系統保持靈活性，以便將來新增付款方式。

### API 請求與回應處理 {id="api-request-response-handling"}

您可以使用密封類別和密封介面來實作處理 API 請求與回應的使用者驗證系統。
該使用者驗證系統具有登入與登出功能。
`ApiRequest` 密封介面定義了特定的請求類型：登入作業使用 `LoginRequest`，登出作業使用 `LogoutRequest`。
密封類別 `ApiResponse` 封裝了不同的回應情境：包含使用者資料的 `UserSuccess`、針對不存在使用者的 `UserNotFound`，以及針對任何失敗情況的 `Error`。`handleRequest` 函式使用 `when` 運算式以型別安全的方式處理這些請求，而 `getUserById` 則模擬使用者的擷取作業：

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

// 用於成功回應中的使用者資料類別
data class UserData(val userId: String, val name: String, val email: String)

// 用於驗證使用者憑證的函式（僅供示範）
fun isValidUser(username: String, password: String): Boolean {
    // 某些驗證邏輯（此處僅為占位符號）
    return username == "validUser" && password == "validPass"
}

// 處理 API 請求並提供詳細回應的函式
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
            // 在此範例中假設登出作業總是成功
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
    // 錯誤處理也會產生 Error 回應。
}

// 示範用法的主函式
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

## 後續步驟 {id="what-s-next"}

進一步了解 [Kotlin 中的繼承](inheritance.md)。