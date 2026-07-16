[//]: # (title: 例外與錯誤處理)

<web-summary>了解 Kotlin 如何使用例外來處理執行階段錯誤。</web-summary>

例外有助於讓您的程式碼執行更加可預測，即使發生可能中斷程式執行的執行階段錯誤也是如此。
Kotlin 預設將所有例外視為 *非受檢 (unchecked)*。
非受檢例外簡化了例外處理程序：您可以擷取例外，但不需明確地處理或[宣告](java-to-kotlin-interop.md#checked-exceptions)它們。 

> 若要進一步了解 Kotlin 在與 Java、Swift 及 Objective-C 互動時如何處理例外，請參閱
> [與 Java、Swift 及 Objective-C 的例外互通性](#exception-interoperability-with-java-swift-and-objective-c)章節。
> 
{style="tip"}

處理例外包含兩個主要操作：

* **拋出例外 (Throwing exceptions)：** 指出問題何時發生。
* **擷取例外 (Catching exceptions)：** 透過解決問題或通知開發者或應用程式使用者，手動處理非預期的例外。

例外由 
[`Exception`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin/-exception/) 類別的子類別表示，而該類別又是 
[`Throwable`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin/-throwable/) 類別的子類別。有關階層結構的更多資訊，請參閱[例外階層結構](#exception-hierarchy)章節。由於 `Exception` 是一個 [`open class`](inheritance.md)，您可以建立[自訂例外](#create-custom-exceptions)以符合您應用程式的特定需求。

## 拋出例外

您可以使用 `throw` 關鍵字手動拋出例外。
拋出例外表示程式碼中發生了非預期的執行階段錯誤。
例外是[物件](classes.md#creating-instances)，拋出例外會建立例外類別的一個執行個體。

您可以拋出不帶任何參數的例外： 

```kotlin
throw IllegalArgumentException()
```

為了更清楚了解問題的來源，可以包含額外的資訊，例如自訂訊息和原始原因：

```kotlin
val cause = IllegalStateException("Original cause: illegal state")

// 如果 userInput 為負數，則拋出 IllegalArgumentException 
// 此外，它還會顯示由 cause IllegalStateException 表示的原始原因
if (userInput < 0) {
    throw IllegalArgumentException("Input must be non-negative", cause)
}
```

在此範例中，當使用者輸入負值時，會拋出 `IllegalArgumentException`。
您可以建立自訂錯誤訊息並保留例外的原始原因 (`cause`)，
這將會包含在[堆疊追蹤](#stack-trace)中。

### 使用前置條件函式拋出例外

Kotlin 提供了使用前置條件函式 (precondition functions) 自動拋出例外的其他方式。
前置條件函式包括：

| 前置條件函式            | 使用案例                                 | 拋出的例外                                                                                                 |
|----------------------------------|------------------------------------------|------------------------------------------------------------------------------------------------------------------|
| [`require()`](#require-function) | 檢查使用者輸入的有效性               | [`IllegalArgumentException`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin/-illegal-argument-exception/)   |
| [`check()`](#check-function)     | 檢查物件或變數狀態的有效性 | [`IllegalStateException`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin/-illegal-state-exception/)         |
| [`error()`](#error-function)     | 表示不合法的狀態或條件  | [`IllegalStateException`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin/-illegal-state-exception/)         |

這些函式適用於如果未滿足特定條件則程式流程無法繼續的情況。
這可以簡化您的程式碼並使處理這些檢查變得有效率。

#### require() 函式

當輸入引數對於函式的運作至關重要，且如果這些引數無效則函式無法繼續執行時，請使用 [`require()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin/require.html) 函式來驗證輸入引數。

如果未滿足 `require()` 中的條件，它會拋出 [`IllegalArgumentException`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin/-illegal-argument-exception/)：

```kotlin
fun getIndices(count: Int): `List<Int>` {
    require(count >= 0) { "Count must be non-negative. You set count to $count." }
    return List(count) { it + 1 }
}

fun main() {
    // 這會失敗並拋出 IllegalArgumentException
    println(getIndices(-1))
    
    // 取消註解下面這行以查看運作範例
    // println(getIndices(3))
    // [1, 2, 3]
}
```
{kotlin-runnable="true"}

> `require()` 函式允許編譯器執行[智慧轉型](typecasts.md#smart-casts)。
> 在成功檢查後，變數會自動轉型為不可為 null 的型別。
> 這些函式常用於可 null 性檢查，以確保變數在繼續執行前不是 null。例如：
>
> ```kotlin
> fun printNonNullString(str: String?) {
>     // 可 null 性檢查
>     require(str != null) 
>     // 在此成功檢查後，保證 'str' 不為 null
>     // 並自動智慧轉型為不可為 null 的 String
>     println(str.length)
> }
> ```
>
{style="note"}

#### check() 函式

使用 [`check()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin/check.html) 函式來驗證物件或變數的狀態。
如果檢查失敗，則表示需要解決的邏輯錯誤。

如果 `check()` 函式中指定的條件為 `false`，它會拋出 [`IllegalStateException`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin/-illegal-state-exception/)：

```kotlin
fun main() {
    var someState: String? = null

    fun getStateValue(): String {

        val state = checkNotNull(someState) { "State must be set beforehand!" }
        check(state.isNotEmpty()) { "State must be non-empty!" }
        return state
    }
    // 如果您取消註解下面這行，程式將因 IllegalStateException 而失敗
    // getStateValue()

    someState = ""

    // 如果您取消註解下面這行，程式將因 IllegalStateException 而失敗
    // getStateValue() 
    someState = "non-empty-state"

    // 這會列印 "non-empty-state"
    println(getStateValue())
}
```
{kotlin-runnable="true"}

> `check()` 函式允許編譯器執行[智慧轉型](typecasts.md#smart-casts)。
> 在成功檢查後，變數會自動轉型為不可為 null 的型別。
> 這些函式常用於可 null 性檢查，以確保變數在繼續執行前不是 null。例如：
>
> ```kotlin
> fun printNonNullString(str: String?) {
>     // 可 null 性檢查
>     check(str != null) 
>     // 在此成功檢查後，保證 'str' 不為 null
>     // 並自動智慧轉型為不可為 null 的 String
>     println(str.length)
> }
> ```
>
{style="note"}

#### error() 函式

[`error()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin/error.html) 函式用於發出不合法狀態或程式碼中邏輯上不應發生之條件的訊號。
這適用於您想要在程式碼中刻意拋出例外的場景，例如當程式碼遇到非預期的狀態時。 
此函式在 `when` 運算式中特別有用，提供了一種清晰的方式來處理邏輯上不應發生的情況。

在下列範例中，`error()` 函式用於處理未定義的使用者角色。
如果角色不是預定義的角色之一，則會拋出 [`IllegalStateException`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin/-illegal-state-exception/)：

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
    // 這會按預期運作
    val user1 = User("Alice", "admin")
    processUserRole(user1)
    // Alice is an admin.

    // 這會拋出 IllegalStateException
    val user2 = User("Bob", "guest")
    processUserRole(user2)
}
```
{kotlin-runnable="true"}

## 使用 try-catch 區塊處理例外

當拋出例外時，它會中斷程式的正常執行。
您可以使用 `try` 和 `catch` 關鍵字優雅地處理例外，以保持程式穩定。
`try` 區塊包含可能拋出例外的程式碼，而 `catch` 區塊則在例外發生時擷取並處理它。
例外會由第一個與其特定型別或該例外的[父類別](inheritance.md)相符的 `catch` 區塊所擷取。

以下是您可以將 `try` 和 `catch` 關鍵字結合使用的方法：

```kotlin
try {
    // 可能拋出例外的程式碼
} catch (e: SomeException) {
    // 處理例外的程式碼
}
```

使用 `try-catch` 作為運算式是一種常見的方法，因此它可以從 `try` 區塊或 `catch` 區塊傳回值：

```kotlin
fun main() {
    val num: Int = try {

        // 如果 count() 成功完成，其傳回值將指派給 num
        count()
        
    } catch (e: ArithmeticException) {
        
        // 如果 count() 拋出例外，catch 區塊會傳回 -1，
        // 並將其指派給 num
        -1
    }
    println("Result: $num")
}

// 模擬一個可能拋出 ArithmeticException 的函式
fun count(): Int {
    
    // 更改此值以將不同的值傳回給 num
    val a = 0
    
    return 10 / a
}
```
{kotlin-runnable="true"}

您可以為同一個 `try` 區塊使用多個 `catch` 處理常式。
您可以根據需要新增任意數量的 `catch` 區塊，以分別處理不同的例外。
當您有多個 `catch` 區塊時，請務必按照從最具體到最不具體的例外順序排列，並在程式碼中遵循從上到下的順序。
此順序與程式的執行流程一致。

請考慮這個使用[自訂例外](#create-custom-exceptions)的範例：

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

    // 更改此值以測試不同場景
    val withdrawalAmount = 500.5

    try {
        processWithdrawal(withdrawalAmount.toDouble(), availableFunds)

    // catch 區塊的順序很重要！
    } catch (e: InsufficientFundsException) {
        println("Caught an InsufficientFundsException: ${e.message}")
    } catch (e: WithdrawalException) {
        println("Caught a WithdrawalException: ${e.message}")
    }
}
```
{kotlin-runnable="true"}

一個處理 `WithdrawalException` 的通用擷取區塊會擷取其型別的所有例外，包括像 `InsufficientFundsException` 這樣具體的例外，除非它們先前已被更具體的擷取區塊所擷取。

### finally 區塊

`finally` 區塊包含無論 `try` 區塊成功完成還是拋出例外都一律執行的程式碼。
使用 `finally` 區塊，您可以在執行 `try` 和 `catch` 區塊後清理程式碼。
這在處理檔案或網路連線等資源時特別重要，因為 `finally` 保證它們會被正確關閉或釋放。

以下是您通常如何將 `try-catch-finally` 區塊結合使用的方法：

```kotlin
try {
    // 可能拋出例外的程式碼
}
catch (e: YourException) {
    // 例外處理常式
}
finally {
    // 始終執行的程式碼
}
```

`try` 運算式的傳回值是由 `try` 或 `catch` 區塊中最後執行的運算式決定的。
如果沒有發生例外，結果來自 `try` 區塊；如果處理了例外，則結果來自 `catch` 區塊。
`finally` 區塊一律會執行，但它不會改變 `try-catch` 區塊的結果。

讓我們看一個範例來示範：

```kotlin
fun divideOrNull(a: Int): Int {
    
    // try 區塊始終執行
    // 這裡的例外（除以零）會導致立即跳轉到 catch 區塊
    try {
        val b = 44 / a
        println("try block: Executing division: $b")
        return b
    }
    
    // 由於 ArithmeticException（如果 a == 0 則除以零）而執行 catch 區塊
    catch (e: ArithmeticException) {
        println("catch block: Encountered ArithmeticException $e")
        return -1
    }
    finally {
        println("finally block: The finally block is always executed")
    }
}

fun main() {
    
    // 更改此值以獲得不同結果。ArithmeticException 將傳回：-1
    divideOrNull(0)
}
```
{kotlin-runnable="true"}

> 在 Kotlin 中，管理實作了 [`AutoClosable`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin/-auto-closeable/) 介面之資源（例如 `FileInputStream` 或 `FileOutputStream` 等檔案串流）的慣用法是使用 [`.use()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin/use.html) 函式。 
> 此函式會在程式碼區塊完成時自動關閉資源，無論是否拋出例外，進而消除了對 `finally` 區塊的需求。 
> 因此，Kotlin 不需要像 [Java 的 try-with-resources](https://docs.oracle.com/javase/tutorial/essential/exceptions/tryResourceClose.html) 這樣用於資源管理的特殊語法。
> 
> ```kotlin
> FileWriter("test.txt").use { writer ->
>     writer.write("some text")
>     // 在此區塊之後，.use 函式會自動呼叫 writer.close()，類似於 finally 區塊
> }
> ```
> 
{style="note"}

如果您的程式碼需要資源清理而不需處理例外，您也可以將 `try` 與 `finally` 區塊配合使用，而不帶 `catch` 區塊：

```kotlin
class MockResource { 
    fun use() { 
        println("Resource being used") 
        // 模擬正在使用的資源 
        // 如果發生除以零，這會拋出 ArithmeticException
        val result = 100 / 0
        
        // 如果拋出例外，則不會執行這行
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
        
        // 嘗試使用資源 
        resource.use()
        
    } finally {
        
        // 確保資源始終關閉，即使發生例外也是如此 
        resource.close()
    }

    // 如果拋出例外，則不列印此行
    println("End of the program")
//sampleEnd
}
```
{kotlin-runnable="true"}

如您所見，`finally` 區塊保證了資源會被關閉，無論是否發生例外。

在 Kotlin 中，您可以根據特定需求靈活地僅使用 `catch` 區塊、僅使用 `finally` 區塊，或者兩者都使用，但 `try` 區塊必須始終至少搭配一個 `catch` 區塊或一個 `finally` 區塊。

## 建立自訂例外

在 Kotlin 中，您可以藉由建立擴充內建 `Exception` 類別的類別來定義自訂例外。這允許您建立針對應用程式需求量身打造的更具體錯誤型別。

要建立一個自訂例外，您可以定義一個擴充 `Exception` 的類別：

```kotlin
class MyException: Exception("My message")
```

在此範例中，有一個預設錯誤訊息 "My message"，但如果您願意，也可以將其留空。

> Kotlin 中的例外是具狀態的物件，帶有與建立時的上下文相關的資訊，稱為[堆疊追蹤](#stack-trace)。
> 避免使用[物件宣告](object-declarations.md#object-declarations-overview)來建立例外。
> 相反地，每次需要時都請建立例外的新執行個體。
> 這樣，您可以確保例外的狀態準確地反映特定上下文。
>
{style="tip"}

自訂例外也可以是任何現有例外子類別的子類別，例如 `ArithmeticException` 子類別：

```kotlin
class NumberTooLargeException: ArithmeticException("My message")
```

> 如果您想要建立自訂例外的子類別，必須將父類別宣告為 `open`，因為 [類別預設為 final](inheritance.md)，否則無法建立子類別。
> 
> 例如：
>
> ```kotlin
> // 將自訂例外宣告為 open class，使其可被繼承
> open class MyCustomException(message: String): Exception(message)
>
> // 建立自訂例外的子類別
> class SpecificCustomException: MyCustomException("Specific error message")
> ```
>
{style="note"}

自訂例外的行為與內建例外完全相同。您可以使用 `throw` 關鍵字拋出它們，並使用 `try-catch-finally` 區塊來處理它們。讓我們看一個範例來示範：

```kotlin
class NegativeNumberException: Exception("Parameter is less than zero.")
class NonNegativeNumberException: Exception("Parameter is a non-negative number.")

fun myFunction(number: Int) {
    if (number < 0) throw NegativeNumberException()
    else if (number >= 0) throw NonNegativeNumberException()
}

fun main() {
    
    // 更改此函式中的值以獲得不同的例外
    myFunction(1)
}
```
{kotlin-runnable="true"}

在具有多樣化錯誤場景的應用程式中，建立例外階層結構有助於使程式碼更清晰、更具體。
您可以透過使用[抽象類別](classes.md#abstract-classes)或[密封類別](sealed-classes.md#constructors)作為通用例外功能的基礎，並為詳細的例外型別建立特定子類別來達成此目的。
此外，包含具有預設值參數的自訂例外提供了靈活性，允許使用各種訊息進行初始化，從而實現更精細的錯誤處理。

讓我們看一個範例，使用密封類別 `AccountException` 作為例外階層結構的基礎，而子類別 `APIKeyExpiredException` 則展示了使用具有預設值參數來改進例外細節：

```kotlin
//sampleStart
// 建立一個密封類別作為帳戶相關錯誤例外階層結構的基礎
sealed class AccountException(message: String, cause: Throwable? = null):
Exception(message, cause)

// 建立 AccountException 的子類別
class InvalidAccountCredentialsException : AccountException("Invalid account credentials detected")

// 建立 AccountException 的子類別，允許新增自訂訊息和原因
class APIKeyExpiredException(message: String = "API key expired", cause: Throwable? = null)	: AccountException(message, cause)

// 更改占位符號函式的值以獲得不同結果
fun areCredentialsValid(): Boolean = true
fun isAPIKeyExpired(): Boolean = true
//sampleEnd

// 驗證帳戶憑據和 API 金鑰
fun validateAccount() {
    if (!areCredentialsValid()) throw InvalidAccountCredentialsException()
    if (isAPIKeyExpired()) {
        // 拋出具有特定原因的 APIKeyExpiredException 的範例
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

## Nothing 型別

在 Kotlin 中，每個運算式都有一個型別。
運算式 `throw IllegalArgumentException()` 的型別是 [`Nothing`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin/-nothing.html)，這是一個內建型別，是所有其他型別的子型別，也稱為 [底端型別 (bottom type)](https://en.wikipedia.org/wiki/Bottom_type)。 
這意味著 `Nothing` 可以用作傳回型別或泛型型別，用於預期任何其他型別的地方，而不會導致型別錯誤。

`Nothing` 是 Kotlin 中的一個特殊型別，用於表示永遠無法成功完成的函式或運算式，
原因可能是它們總是拋出例外，或是進入了像無限迴圈這樣的無止盡執行路徑。
您可以使用 `Nothing` 來標記尚未實作或設計為一律拋出例外的函式，
向編譯器和程式碼讀者清晰地表明您的意圖。
如果編譯器在函式簽章中推論出 `Nothing` 型別，它將會發出警告。
明確地將 `Nothing` 定義為傳回型別可以消除此警告。

這段 Kotlin 程式碼示範了 `Nothing` 型別的使用，編譯器會將函式呼叫後的程式碼標記為無法到達：

```kotlin
class Person(val name: String?)

fun fail(message: String): Nothing {
    throw IllegalArgumentException(message)
    // 此函式永遠不會成功傳回。
    // 它一律會拋出例外。
}

fun main() {
    // 建立 Person 的執行個體，其中 'name' 為 null
    val person = Person(name = null)
    
    val s: String = person.name ?: fail("Name required")

    // 到此處時，'s' 保證已初始化
    println(s)
}
```
{kotlin-runnable="true"}

Kotlin 的 [`TODO()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin/-t-o-d-o.html) 函式也使用了 `Nothing` 型別，作為一個占位符號來強調程式碼中需要未來實作的區域：

```kotlin
fun notImplementedFunction(): Int {
    TODO("This function is not yet implemented")
}

fun main() {
    val result = notImplementedFunction()
    // 這會拋出 NotImplementedError
    println(result)
}
```
{kotlin-runnable="true"}

如您所見，`TODO()` 函式一律會拋出 [`NotImplementedError`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin/-not-implemented-error/) 例外。

## 例外類別

讓我們探索 Kotlin 中常見的一些例外型別，它們都是 [`RuntimeException`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin/-runtime-exception/) 類別的子類別：

* [`ArithmeticException`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin/-arithmetic-exception/)：當無法執行算術運算（例如除以零）時，就會發生此例外。

    ```kotlin
    val example = 2 / 0 // 拋出 ArithmeticException
    ```

* [`IndexOutOfBoundsException`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin/-index-out-of-bounds-exception/)：拋出此例外以表示某種索引（例如陣列或字串）超出範圍。

    ```kotlin
    val myList = mutableListOf(1, 2, 3)
    myList.removeAt(3)  // 拋出 IndexOutOfBoundsException
    ```

    > 若要避免此例外，請使用更安全的替代方案，例如 [`getOrNull()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/get-or-null.html) 函式：
    > 
    > ```kotlin
    > val myList = listOf(1, 2, 3)
    > // 傳回 null，而不是 IndexOutOfBoundsException
    > val element = myList.getOrNull(3)
    > println("Element at index 3: $element")
    > ```
    > 
    {style="note"}

* [`NoSuchElementException`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin/-no-such-element-exception/)：當存取特定集合中不存在的元素時，會拋出此例外。它發生在使用了預期特定元素的函式時，例如 [`first()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/first.html) 或 [`last()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/last.html)。

    ```kotlin
    val emptyList = listOf<Int>()
    val firstElement = emptyList.first()  // 拋出 NoSuchElementException
    ```

    > 若要避免此例外，請使用更安全的替代方案，例如 [`firstOrNull()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/first-or-null.html) 函式：
    >
    > ```kotlin
    > val emptyList = listOf<Int>()
    > // 傳回 null，而不是 NoSuchElementException
    > val firstElement = emptyList.firstOrNull()
    > println("First element in empty list: $firstElement")
    > ```
    >
    {style="note"}

* [`NumberFormatException`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin/-number-format-exception/)：當嘗試將字串轉換為數值型別，但該字串格式不正確時，就會發生此例外。

    ```kotlin
    val string = "This is not a number"
    val number = string.toInt() // 拋出 NumberFormatException
    ```
    
    > 若要避免此例外，請使用更安全的替代方案，例如 [`toIntOrNull()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.text/to-int-or-null.html) 函式：
    >
    > ```kotlin
    > val nonNumericString = "not a number"
    > // 傳回 null，而不是 NumberFormatException
    > val number = nonNumericString.toIntOrNull()
    > println("Converted number: $number")
    > ```
    >
    {style="note"}

* [`NullPointerException`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin/-null-pointer-exception/)：當應用程式嘗試使用值為 `null` 的物件參考時，會拋出此例外。
雖然 Kotlin 的 null 安全特性顯著降低了 NullPointerExceptions 的風險，但它們仍可能發生，不論是透過刻意使用 `!!` 運算子，還是與缺乏 Kotlin null 安全特性的 Java 互動時。

    ```kotlin
    val text: String? = null
    println(text!!.length)  // 拋出 NullPointerException
    ```

雖然在 Kotlin 中所有例外都是非受檢的，且您不一定要明確地擷取它們，但如果您有需要，仍可以靈活地擷取它們。

### 例外階層結構

Kotlin 例外階層結構的根源是 [`Throwable`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin/-throwable/) 類別。
它有兩個直接子類別，即 [`Error`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin/-error/) 和 [`Exception`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin/-exception/)：

* `Error` 子類別表示應用程式本身可能無法恢復的嚴重基本問題。 
這些通常是您不會嘗試處理的問題，例如 [`OutOfMemoryError`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin/-out-of-memory-error/) 或 `StackOverflowError`。

* `Exception` 子類別用於您可能想要處理的條件。 
`Exception` 型別的子型別，例如 [`RuntimeException`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin/-runtime-exception/) 和 `IOException` (Input/Output Exception)，處理應用程式中的例外事件。

![例外階層結構 - Throwable 類別](throwable.svg){width=700}

`RuntimeException` 通常是由程式碼中檢查不足引起的，可以透過程式設計來預防。
Kotlin 有助於防止常見的 `RuntimeExceptions`（例如 `NullPointerException`），並針對潛在的執行階段錯誤（例如除以零）提供編譯期警告。下圖展示了從 `RuntimeException` 衍生出的子型別階層結構：

![RuntimeException 階層結構](runtime-exception.svg){width=700}

## 堆疊追蹤

*堆疊追蹤 (stack trace)* 是由執行環境產生的報告，用於偵錯。
它顯示了導致程式中特定點（尤其是發生錯誤或例外之處）的函式呼叫序列。

讓我們看一個在 JVM 環境中因例外而自動列印堆疊追蹤的範例：

```kotlin
fun main() {
//sampleStart    
    throw ArithmeticException("This is an arithmetic exception!")
//sampleEnd    
}
```
{kotlin-runnable="true"}

在 JVM 環境中執行此程式碼會產生以下輸出：

```text
Exception in thread "main" java.lang.ArithmeticException: This is an arithmetic exception!
    at MainKt.main(Main.kt:3)
    at MainKt.main(Main.kt)
```

第一行是例外描述，其中包括：

* 例外型別：`java.lang.ArithmeticException`
* 執行緒：`main` 
* 例外訊息：`"This is an arithmetic exception!"`

例外描述後每一行以 `at` 開頭的行就是堆疊追蹤。單行稱為 *堆疊追蹤元素 (stack trace element)* 或 *堆疊框架 (stack frame)*：

* `at MainKt.main (Main.kt:3)`：這顯示了方法名稱 (`MainKt.main`)，以及呼叫該方法的原始程式檔和行號 (`Main.kt:3`)。
* `at MainKt.main (Main.kt)`：這顯示例外發生在 `Main.kt` 檔案的 `main()` 函式中。

## 與 Java、Swift 及 Objective-C 的例外互通性

由於 Kotlin 將所有例外視為非受檢，因此當從區分受檢 (checked) 與非受檢例外的語言呼叫此類例外時，可能會導致複雜情況。
為了解決 Kotlin 與 Java、Swift 及 Objective-C 等語言在例外處理上的差異，
您可以使用 [`@Throws`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin/-throws/) 註解。
此註解會提醒呼叫者可能發生的例外。
如需更多資訊，請參閱[從 Java 呼叫 Kotlin](java-to-kotlin-interop.md#checked-exceptions) 和
[與 Swift/Objective-C 的互通性](native-objc-interop.md#errors-and-exceptions)。