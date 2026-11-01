[//]: # (title: 作用域函式)

<no-index/>

在本章中，你將基於對擴充函式的理解，學習如何使用作用域函式來撰寫更符合慣用語法（idiomatic）的程式碼。

## 作用域函式 {id="scope-functions"}

在程式設計中，作用域（scope）是識別變數或物件的有效範圍。最常提到的作用域是全域作用域和區域作用域：

* **全域作用域** – 可從程式中任何位置存取的變數或物件。
* **區域作用域** – 僅能在定義它的區塊或函式內部存取的變數或物件。

在 Kotlin 中，還有作用域函式（scope functions），允許你圍繞某個物件建立一個暫時作用域並執行特定程式碼。

作用域函式能讓程式碼更簡潔，因為你不需要在暫時作用域內重複參照該物件的名稱。根據所使用的作用域函式不同，你可以透過關鍵字 `this` 參照物件，或透過關鍵字 `it` 將其作為引數使用。

Kotlin 共有五個作用域函式：`let`、`apply`、`run`、`also` 與 `with`。

每個作用域函式都接受一個 Lambda 運算式，並傳回物件本身或該 Lambda 運算式的結果。在本導覽中，我們將說明每個作用域函式及其用法。

> 你也可以觀看 Kotlin 技術傳教士 Sebastian Aigner 關於作用域函式的演講：[Back to the Stdlib: Making the Most of Kotlin's Standard Library](https://youtu.be/DdvgvSHrN9g?feature=shared&t=1511)。
> 
{style="tip"}

### Let {id="let"}

當你想要在程式碼中進行 null 檢查，並在隨後使用傳回的物件執行進一步操作時，請使用 `let` 作用域函式。

請參考以下範例：

```kotlin
fun sendNotification(recipientAddress: String): String {
    println("Yo $recipientAddress!")
    return "Notification sent!"
}

fun getNextAddress(): String {
    return "sebastian@jetbrains.com"
}

fun main() {
    val address: String? = getNextAddress()
    sendNotification(address)
}
```
{validate = "false"}

該範例包含兩個函式：
* `sendNotification()`：具有一個函式參數 `recipientAddress`，並傳回字串。
* `getNextAddress()`：沒有函式參數，並傳回字串。

該範例建立了一個可為 null 的 `String` 型別變數 `address`。但當你呼叫 `sendNotification()` 函式時會出現問題，因為該函式未預期 `address` 可能為 `null` 值。
因此編譯器會報告錯誤：

```text
Argument type mismatch: actual type is 'String?', but 'String' was expected.
```

從初學者導覽中，你已經知道可以使用 if 條件進行 null 檢查，或是使用 [Elvis 運算子 `?:`](kotlin-tour-null-safety.md#use-elvis-operator)。
但如果你想在後續的程式碼中使用傳回的物件該怎麼辦？你可以透過 if 條件**以及** else 分支來達成：

```kotlin
fun sendNotification(recipientAddress: String): String {
    println("Yo $recipientAddress!")
    return "Notification sent!"
}

fun getNextAddress(): String {
    return "sebastian@jetbrains.com"
}

fun main() { 
    //sampleStart
    val address: String? = getNextAddress()
    val confirm = if(address != null) {
        sendNotification(address)
    } else { null }
    //sampleEnd
}
```
{kotlin-runnable="true" id="kotlin-tour-scope-function-let-non-null-if"}

然而，更簡潔的做法是使用 `let` 作用域函式：

```kotlin
fun sendNotification(recipientAddress: String): String {
    println("Yo $recipientAddress!")
    return "Notification sent!"
}

fun getNextAddress(): String {
    return "sebastian@jetbrains.com"
}

fun main() {
    //sampleStart
    val address: String? = getNextAddress()
    val confirm = address?.let {
        sendNotification(it)
    }
    //sampleEnd
}
```
{kotlin-runnable="true" id="kotlin-tour-scope-function-let-non-null"}

此範例：
* 建立了名為 `address` 與 `confirm` 的變數。
* 在 `address` 變數上對 `let` 作用域函式使用安全呼叫。
* 在 `let` 作用域函式內建立一個暫時作用域。
* 將 `sendNotification()` 函式作為 Lambda 運算式傳入 `let` 作用域函式中。
* 利用暫時作用域，透過 `it` 參照 `address` 變數。
* 將結果指派給 `confirm` 變數。

透過這種方式，你的程式碼可以安全處理 `address` 變數可能為 `null` 的情況，並且你可以在後續程式碼中使用 `confirm` 變數。

### Apply {id="apply"}

使用 `apply` 作用域函式可以在建立物件（例如類別執行個體）的當下立即將其初始化，而不是在後續的程式碼中進行。這種做法能讓程式碼更易於閱讀與維護。

請參考以下範例：

```kotlin
class Client() {
    var token: String? = null
    fun connect() = println("connected!")
    fun authenticate() = println("authenticated!")
    fun getData() : String {
        println("getting data!")
        return "Mock data"
    }
}

val client = Client()

fun main() {
    client.token = "asdf"
    client.connect()
    // connected!
    client.authenticate()
    // authenticated!
    client.getData()
    // getting data!
}
```
{kotlin-runnable="true" id="kotlin-tour-scope-function-apply-before"}

該範例包含一個 `Client` 類別，其中包含一個名為 `token` 的屬性，以及三個成員函式：`connect()`、`authenticate()` 和 `getData()`。

該範例在 `main()` 函式中初始化其 `token` 屬性並呼叫其成員函式之前，先建立了 `Client` 類別的執行個體 `client`。

雖然這個範例很簡短，但在實際開發中，在建立類別執行個體之後，可能需要過一段時間才會設定並使用該執行個體（及其成員函式）。然而，如果使用 `apply` 作用域函式，你就可以在程式碼中的同一處完成類別執行個體的建立、設定以及成員函式的使用：

```kotlin
class Client() {
    var token: String? = null
    fun connect() = println("connected!")
    fun authenticate() = println("authenticated!")
    fun getData() : String {
        println("getting data!")
        return "Mock data"
    }
}
//sampleStart
val client = Client().apply {
    token = "asdf"
    connect()
    // connected!
    authenticate()
    // authenticated!
}

fun main() {
    client.getData()
    // getting data!
}
//sampleEnd
```
{kotlin-runnable="true" id="kotlin-tour-scope-function-apply-after"}

此範例：

* 建立 `Client` 類別的執行個體 `client`。
* 在 `client` 執行個體上使用 `apply` 作用域函式。
* 在 `apply` 作用域函式內建立一個暫時作用域，這樣在存取其屬性或函式時就不需要明確參照 `client` 執行個體。
* 向 `apply` 作用域函式傳遞一個 Lambda 運算式，用於更新 `token` 屬性並呼叫 `connect()` 與 `authenticate()` 函式。
* 在 `main()` 函式中呼叫 `client` 執行個體上的 `getData()` 成員函式。

如你所見，在處理較龐大的程式碼時，這種策略非常實用。

### Run {id="run"}

與 `apply` 類似，你可以使用 `run` 作用域函式來初始化物件，但更適合使用 `run` 的情況是在程式碼的特定時刻初始化物件**並且**立即計算出結果。

讓我們延續前面 `apply` 函式的範例，但這次希望將 `connect()` 和 `authenticate()` 函式歸組，以便在每次請求時一併呼叫。

例如：

```kotlin
class Client() {
    var token: String? = null
    fun connect() = println("connected!")
    fun authenticate() = println("authenticated!")
    fun getData() : String {
        println("getting data!")
        return "Mock data"
    }
}

//sampleStart
val client: Client = Client().apply {
    token = "asdf"
}

fun main() {
    val result: String = client.run {
        connect()
        // connected!
        authenticate()
        // authenticated!
        getData()
        // getting data!
    }
}
//sampleEnd
```
{kotlin-runnable="true" id="kotlin-tour-scope-function-run"}

此範例：

* 建立 `Client` 類別的執行個體 `client`。
* 在 `client` 執行個體上使用 `apply` 作用域函式。
* 在 `apply` 作用域函式內建立一個暫時作用域，這樣在存取其屬性或函式時就不需要明確參照 `client` 執行個體。
* 向 `apply` 作用域函式傳遞一個 Lambda 運算式以更新 `token` 屬性。

`main()` 函式：

* 建立一個型別為 `String` 的 `result` 變數。
* 在 `client` 執行個體上使用 `run` 作用域函式。
* 在 `run` 作用域函式內建立一個暫時作用域，這樣在存取其屬性或函式時就不需要明確參照 `client` 執行個體。
* 向 `run` 作用域函式傳遞一個呼叫 `connect()`、`authenticate()` 與 `getData()` 函式的 Lambda 運算式。
* 將結果指派給 `result` 變數。

現在，你可以在後續的程式碼中使用傳回的結果。

### Also {id="also"}

當你想對某個物件執行額外操作（例如記錄日誌），然後傳回該物件以在程式碼中繼續使用它時，請使用 `also` 作用域函式。

請參考以下範例：

```kotlin
fun main() {
    val medals: List<String> = listOf("Gold", "Silver", "Bronze")
    val reversedLongUppercaseMedals: List<String> =
        medals
            .map { it.uppercase() }
            .filter { it.length > 4 }
            .reversed()
    println(reversedLongUppercaseMedals)
    // [BRONZE, SILVER]
}
```
{kotlin-runnable="true" id="kotlin-tour-scope-function-also-before"}

此範例：

* 建立了包含字串清單的 `medals` 變數。
* 建立了具有 `List<String>` 型別的 `reversedLongUppercaseMedals` 變數。
* 在 `medals` 變數上使用 `.map()` 擴充函式。
* 向 `.map()` 函式傳遞一個 Lambda 運算式，該運算式透過關鍵字 `it` 參照 `medals` 並對其呼叫 `.uppercase()` 擴充函式。
* 在 `medals` 變數上使用 `.filter()` 擴充函式。
* 向 `.filter()` 函式傳遞一個 Lambda 運算式作為謂詞（predicate），透過關鍵字 `it` 參照 `medals` 並檢查清單中的項目字元數是否大於 4。
* 在 `medals` 變數上使用 `.reversed()` 擴充函式。
* 將結果指派給 `reversedLongUppercaseMedals` 變數。
* 印出 `reversedLongUppercaseMedals` 變數中包含的清單。

如果在函式呼叫之間新增一些記錄以查看 `medals` 變數發生了什麼變化，將會非常有幫助。`also` 函式正好可以派上用場：

```kotlin
fun main() {
    val medals: List<String> = listOf("Gold", "Silver", "Bronze")
    val reversedLongUppercaseMedals: List<String> =
        medals
            .map { it.uppercase() }
            .also { println(it) }
            // [GOLD, SILVER, BRONZE]
            .filter { it.length > 4 }
            .also { println(it) }
            // [SILVER, BRONZE]
            .reversed()
    println(reversedLongUppercaseMedals)
    // [BRONZE, SILVER]
}
```
{kotlin-runnable="true" id="kotlin-tour-scope-function-also-after"}

現在此範例：

* 在 `medals` 變數上使用 `also` 作用域函式。
* 在 `also` 作用域函式內建立一個暫時作用域，這樣在將 `medals` 變數作為函式參數使用時，就不需要明確參照它。
* 向 `also` 作用域函式傳遞一個 Lambda 運算式，透過關鍵字 `it` 將 `medals` 變數作為函式參數傳入並呼叫 `println()` 函式。

由於 `also` 函式會傳回物件本身，因此它不僅適用於記錄，也適用於偵錯、鏈結多個操作以及執行其他不會影響程式碼主流程的副作用操作。

### With {id="with"}

與其他作用域函式不同，`with` 不是擴充函式，因此語法有所不同。你需要將接收者物件作為引數傳遞給 `with`。

當你想在同一個物件上呼叫多個函式時，請使用 `with` 作用域函式。

請參考以下範例：

```kotlin
class Canvas {
    fun rect(x: Int, y: Int, w: Int, h: Int): Unit = println("$x, $y, $w, $h")
    fun circ(x: Int, y: Int, rad: Int): Unit = println("$x, $y, $rad")
    fun text(x: Int, y: Int, str: String): Unit = println("$x, $y, $str")
}

fun main() {
    val mainMonitorPrimaryBufferBackedCanvas = Canvas()

    mainMonitorPrimaryBufferBackedCanvas.text(10, 10, "Foo")
    mainMonitorPrimaryBufferBackedCanvas.rect(20, 30, 100, 50)
    mainMonitorPrimaryBufferBackedCanvas.circ(40, 60, 25)
    mainMonitorPrimaryBufferBackedCanvas.text(15, 45, "Hello")
    mainMonitorPrimaryBufferBackedCanvas.rect(70, 80, 150, 100)
    mainMonitorPrimaryBufferBackedCanvas.circ(90, 110, 40)
    mainMonitorPrimaryBufferBackedCanvas.text(35, 55, "World")
    mainMonitorPrimaryBufferBackedCanvas.rect(120, 140, 200, 75)
    mainMonitorPrimaryBufferBackedCanvas.circ(160, 180, 55)
    mainMonitorPrimaryBufferBackedCanvas.text(50, 70, "Kotlin")
}
```
{kotlin-runnable="true" id="kotlin-tour-scope-function-with-before"}

該範例建立了一個 `Canvas` 類別，其中包含三個成員函式：`rect()`、`circ()` 和 `text()`。這些成員函式中的每一個都會印出一行由你提供的函式參數所構成的陳述。

該範例建立了 `Canvas` 類別的執行個體 `mainMonitorPrimaryBufferBackedCanvas`，然後使用不同的函式參數依序呼叫該執行個體的一連串成員函式。

你可以看到這段程式碼很難閱讀。如果使用 `with` 函式，程式碼就會變得更流暢：

```kotlin
class Canvas {
    fun rect(x: Int, y: Int, w: Int, h: Int): Unit = println("$x, $y, $w, $h")
    fun circ(x: Int, y: Int, rad: Int): Unit = println("$x, $y, $rad")
    fun text(x: Int, y: Int, str: String): Unit = println("$x, $y, $str")
}

fun main() {
    //sampleStart
    val mainMonitorSecondaryBufferBackedCanvas = Canvas()
    with(mainMonitorSecondaryBufferBackedCanvas) {
        text(10, 10, "Foo")
        rect(20, 30, 100, 50)
        circ(40, 60, 25)
        text(15, 45, "Hello")
        rect(70, 80, 150, 100)
        circ(90, 110, 40)
        text(35, 55, "World")
        rect(120, 140, 200, 75)
        circ(160, 180, 55)
        text(50, 70, "Kotlin")
    }
    //sampleEnd
}
```
{kotlin-runnable="true" id="kotlin-tour-scope-function-with-after"}

此範例：
* 使用 `with` 作用域函式，並將 `mainMonitorSecondaryBufferBackedCanvas` 執行個體作為接收者傳入。
* 在 `with` 作用域函式內建立一個暫時作用域，這樣在呼叫其成員函式時就不需要明確參照 `mainMonitorSecondaryBufferBackedCanvas` 執行個體。
* 向 `with` 作用域函式傳遞一個 Lambda 運算式，以不同的函式參數依序呼叫一系列成員函式。

現在這段程式碼變得更容易閱讀，你也更不容易犯錯。

## 使用案例概覽 {id="use-case-overview"}

本節介紹了 Kotlin 中提供的各種作用域函式，以及讓程式碼更符合慣用語法的主要使用案例。你可以將下表作為快速參考。值得注意的是，你不需要完全理解這些函式的內部工作原理，就能在程式碼中使用它們。

| 函式 | 存取 `x` 的方式 | 傳回值 | 使用案例 |
|----------|-------------------|---------------|----------------------------------------------------------------------------------------------|
| `let`    | `it`              | Lambda 結果 | 在程式碼中執行 null 檢查，隨後使用傳回的物件執行進一步操作。 |
| `apply`  | `this`            | `x`           | 在建立物件時對其進行初始化。 |
| `run`    | `this`            | Lambda 結果 | 在建立物件時對其進行初始化**並且**計算結果。 |
| `also`   | `it`              | `x`           | 在傳回物件之前完成額外操作。 |
| `with`   | `this`            | Lambda 結果 | 在同一個物件上呼叫多個函式。 |

有關作用域函式的更多資訊，請參閱[作用域函式](scope-functions.md)。

## 練習 {completion-point="true" id="practice"}

<deflist appearance="clear" collapsible="true" numbered="true">
<def title="使用安全呼叫與 let 改寫函式" id="scope-functions-exercise-1">

將 `.getPriceInEuros()` 函式改寫為使用安全呼叫運算子 `?.` 與 `let` 作用域函式的單一運算式函式。

<deflist collapsible="true">
    <def title="提示">
        使用安全呼叫運算子 <code>?.</code> 安全地存取來自 <code>getProductInfo()</code> 函式的 <code>priceInDollars</code> 屬性。接著，使用 <code>let</code> 作用域函式將 <code>priceInDollars</code> 的值轉換為歐元。
    </def>
</deflist>

```kotlin
data class ProductInfo(val priceInDollars: Double?)

class Product {
    fun getProductInfo(): ProductInfo? {
        return ProductInfo(100.0)
    }
}

// Rewrite this function
fun Product.getPriceInEuros(): Double? {
    val info = getProductInfo()
    if (info == null) return null
    val price = info.priceInDollars
    if (price == null) return null
    return convertToEuros(price)
}

fun convertToEuros(dollars: Double): Double {
    return dollars * 0.85
}

fun main() {
    val product = Product()
    val priceInEuros = product.getPriceInEuros()

    if (priceInEuros != null) {
        println("Price in Euros: €$priceInEuros")
        // Price in Euros: €85.0
    } else {
        println("Price information is not available.")
    }
}
```
{kotlin-runnable="true" kotlin-target-platform="exercise" kotlin-hidden-files="ExerciseUtils.kt,tour/intermediate/GetPriceInEurosTest.kt" validate="false" id="kotlin-tour-scope-functions-exercise-1"}

```kotlin
data class ProductInfo(val priceInDollars: Double?)

class Product {
    fun getProductInfo(): ProductInfo? {
        return ProductInfo(100.0)
    }
}

fun Product.getPriceInEuros() = getProductInfo()?.priceInDollars?.let { convertToEuros(it) }

fun convertToEuros(dollars: Double): Double {
    return dollars * 0.85
}

fun main() {
    val product = Product()
    val priceInEuros = product.getPriceInEuros()

    if (priceInEuros != null) {
        println("Price in Euros: €$priceInEuros")
        // Price in Euros: €85.0
    } else {
        println("Price information is not available.")
    }
}
```
{kotlin-runnable="true" kotlin-target-platform="exercise" kotlin-hidden-files="ExerciseUtils.kt,tour/intermediate/GetPriceInEurosTest.kt" initial-collapse-state="collapsed" collapsible="true" collapsed-title="範例解答" id="kotlin-tour-scope-functions-solution-1"}

</def>
<def title="鏈結 apply 與 also" id="scope-functions-exercise-2">

你有一個用於更新使用者電子郵件地址的 `updateEmail()` 函式。請使用 `apply` 作用域函式更新電子郵件地址，然後使用 `also` 作用域函式印出記錄訊息：`Updating email for user with ID: ${it.id}`。

```kotlin
data class User(val id: Int, var email: String)

fun updateEmail(user: User, newEmail: String): User = TODO("Replace the TODO() function")

fun main() {
    val user = User(1, "old_email@example.com")
    val updatedUser = updateEmail(user, "new_email@example.com")
    // Updating email for user with ID: 1

    println("Updated User: $updatedUser")
    // Updated User: User(id=1, email=new_email@example.com)
}
```
{kotlin-runnable="true" kotlin-target-platform="exercise" kotlin-hidden-files="ExerciseUtils.kt,tour/intermediate/UpdateEmailTest.kt" validate="false" id="kotlin-tour-scope-functions-exercise-2"}

```kotlin
data class User(val id: Int, var email: String)

fun updateEmail(user: User, newEmail: String): User = user.apply {
    this.email = newEmail
}.also { println("Updating email for user with ID: ${it.id}") }

fun main() {
    val user = User(1, "old_email@example.com")
    val updatedUser = updateEmail(user, "new_email@example.com")
    // Updating email for user with ID: 1

    println("Updated User: $updatedUser")
    // Updated User: User(id=1, email=new_email@example.com)
}
```
{kotlin-runnable="true" kotlin-target-platform="exercise" kotlin-hidden-files="ExerciseUtils.kt,tour/intermediate/UpdateEmailTest.kt" initial-collapse-state="collapsed" collapsible="true" collapsed-title="範例解答" id="kotlin-tour-scope-functions-solution-2"}

</def>
</deflist>

<seealso></seealso>

<list columns="2" id="tour-nav">
  <li>
    <a as="button" href="kotlin-tour-intermediate-extension-functions.md" mode="outline" icon="arrow-left" icon-position="left">上一步</a>
  </li>
  <li>
    <a as="button" href="kotlin-tour-intermediate-lambdas-receiver.md" mode="classic" icon="arrow-right" icon-position="right">下一步</a>
  </li>
</list>