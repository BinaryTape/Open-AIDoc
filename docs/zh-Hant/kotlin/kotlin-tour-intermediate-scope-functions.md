[//]: # (title: 作用域函式)

<no-index/>

在本章中，你將在對擴充函式理解的基礎上，學習如何使用作用域函式來撰寫更符合慣用法的程式碼。

## 作用域函式 {id="scope-functions"}

在程式設計中，作用域是變數或物件被辨識的有效範圍。最常提到的作用域是全域作用域和區域作用域：

* **全域作用域** – 可從程式中任何地方存取的變數或物件。
* **區域作用域** – 僅能在定義它的區塊或函式內存取的變數或物件。

在 Kotlin 中，還有作用域函式，可讓你圍繞物件建立一個臨時作用域並執行特定程式碼。

作用域函式能讓你的程式碼更加簡潔，因為你不需要在臨時作用域內重複參照物件的名稱。根據所用的作用域函式，你可以透過關鍵字 `this` 來參照該物件，或是透過關鍵字 `it` 將其作為引數來存取。

Kotlin 總共有五個作用域函式：`let`、`apply`、`run`、`also` 和 `with`。

每個作用域函式都接受一個 Lambda 運算式，並傳回該物件或 Lambda 運算式的結果。在此導覽中，我們將解釋每個作用域函式及其用法。

> 你也可以觀看 Kotlin 技術傳教士 Sebastian Aigner 關於作用域函式的演講：[Back to the Stdlib: Making the Most of Kotlin's Standard Library](https://youtu.be/DdvgvSHrN9g?feature=shared&t=1511)。
> 
{style="tip"}

### Let {id="let"}

當你想要在程式碼中執行 null 檢查，並在隨後對傳回的物件執行進一步操作時，請使用 `let` 作用域函式。

請看以下範例：

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

此範例包含兩個函式：
* `sendNotification()`：具有函式參數 `recipientAddress` 並傳回一個字串。
* `getNextAddress()`：沒有函式參數並傳回一個字串。

範例中建立了一個具有可為 null 的 `String` 型別的變數 `address`。但在呼叫 `sendNotification()` 函式時會出現問題，因為該函式未預期 `address` 可能為 `null` 值。因此編譯器會回報錯誤：

```text
Argument type mismatch: actual type is 'String?', but 'String' was expected.
```

在初學者導覽中，你已經知道可以使用 if 條件進行 null 檢查，或使用 [Elvis 運算子 `?:`](kotlin-tour-null-safety.md#use-elvis-operator)。但如果你之後想在程式碼中使用傳回的物件該怎麼辦？你可以使用 if 條件**以及** else 分支來達成：

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

然而，更簡潔的方法是使用 `let` 作用域函式：

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

該範例：
* 建立了名為 `address` 和 `confirm` 的變數。
* 在 `address` 變數上對 `let` 作用域函式使用安全呼叫。
* 在 `let` 作用域函式中建立了一個臨時作用域。
* 將 `sendNotification()` 函式作為 Lambda 運算式傳入 `let` 作用域函式。
* 利用臨時作用域，透過 `it` 參照 `address` 變數。
* 將結果指派給 `confirm` 變數。

透過這種方法，你的程式碼可以處理 `address` 變數可能為 `null` 值的狀況，並且你可以在後續程式碼中使用 `confirm` 變數。

### Apply {id="apply"}

使用 `apply` 作用域函式在建立物件（例如類別執行個體）時立即進行初始化，而不是延後到後續程式碼中處理。這種做法使你的程式碼更容易閱讀和管理。

請看以下範例：

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

該範例包含一個 `Client` 類別，其中具有一個名為 `token` 的屬性以及三個成員函數：`connect()`、`authenticate()` 和 `getData()`。

該範例建立了 `Client` 類別的執行個體 `client`，隨後在 `main()` 函式中初始化其 `token` 屬性並呼叫其成員函數。

雖然這個範例很簡短，但在實際開發中，在建立類別執行個體後，可能需要經過一段時間才能對其（及其成員函數）進行設定與使用。然而，如果使用 `apply` 作用域函式，你便可以在程式碼的同一處建立、設定並使用類別執行個體的成員函數：

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

該範例：

* 建立了 `Client` 類別的執行個體 `client`。
* 在 `client` 執行個體上使用 `apply` 作用域函式。
* 在 `apply` 作用域函式中建立了一個臨時作用域，這樣你在存取其屬性或函式時就不需要明確參照 `client` 執行個體。
* 向 `apply` 作用域函式傳遞一個 Lambda 運算式，用以更新 `token` 屬性並呼叫 `connect()` 與 `authenticate()` 函式。
* 在 `main()` 函式中呼叫 `client` 執行個體上的 `getData()` 成員函數。

如你所見，當你處理大型程式碼區塊時，這種策略非常方便。

### Run {id="run"}

與 `apply` 類似，你可以使用 `run` 作用域函式來初始化物件，但更好的做法是使用 `run` 在程式碼的特定時刻初始化物件，**並**立即計算出結果。

讓我們繼續先前 `apply` 函式的範例，但這次你希望將 `connect()` 與 `authenticate()` 函式分組，以便在每次請求時呼叫它們。

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

該範例：

* 建立了 `Client` 類別的執行個體 `client`。
* 在 `client` 執行個體上使用 `apply` 作用域函式。
* 在 `apply` 作用域函式中建立了一個臨時作用域，這樣你在存取其屬性或函式時就不需要明確參照 `client` 執行個體。
* 向 `apply` 作用域函式傳遞一個 Lambda 運算式，用以更新 `token` 屬性。

`main()` 函式：

* 建立了型別為 `String` 的 `result` 變數。
* 在 `client` 執行個體上使用 `run` 作用域函式。
* 在 `run` 作用域函式中建立了一個臨時作用域，這樣你在存取其屬性或函式時就不需要明確參照 `client` 執行個體。
* 向 `run` 作用域函式傳遞一個 Lambda 運算式，用以呼叫 `connect()`、`authenticate()` 和 `getData()` 函式。
* 將結果指派給 `result` 變數。

現在你可以在後續程式碼中進一步使用傳回的結果。

### Also {id="also"}

當你需要對物件執行額外動作（例如記錄日誌），然後傳回該物件以在程式碼中繼續使用時，請使用 `also` 作用域函式。

請看以下範例：

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

該範例：

* 建立了包含字串清單的 `medals` 變數。
* 建立了具有 `List<String>` 型別的 `reversedLongUpperCaseMedals` 變數。
* 在 `medals` 變數上使用 `.map()` 擴充函式。
* 向 `.map()` 函式傳遞一個 Lambda 運算式，該運算式透過關鍵字 `it` 參照 `medals`，並對其呼叫 `.uppercase()` 擴充函式。
* 在 `medals` 變數上使用 `.filter()` 擴充函式。
* 向 `.filter()` 函式傳遞一個 Lambda 運算式作為述詞（predicate），該運算式透過關鍵字 `it` 參照 `medals`，並檢查清單中的項目是否超過 4 個字元。
* 在 `medals` 變數上使用 `.reversed()` 擴充函式。
* 將結果指派給 `reversedLongUpperCaseMedals` 變數。
* 列印 `reversedLongUpperCaseMedals` 變數中包含的清單。

在各個函式呼叫之間新增一些記錄以查看 `medals` 變數的變化會很有幫助。`also` 函式正好可以幫上忙：

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

現在該範例：

* 在 `medals` 變數上使用 `also` 作用域函式。
* 在 `also` 作用域函式中建立了一個臨時作用域，這樣在將 `medals` 變數用作函式參數時，就不需要明確參照它。
* 向 `also` 作用域函式傳遞一個 Lambda 運算式，該運算式透過關鍵字 `it` 將 `medals` 變數作為函式參數來呼叫 `println()` 函式。

由於 `also` 函式會傳回該物件，因此它不僅可用於日誌記錄，還適用於偵錯、鏈結多個操作以及執行其他不影響程式碼主流程的副作用操作。

### With {id="with"}

與其他作用域函式不同，`with` 不是擴充函式，因此語法有所不同。你是將接收者物件作為引數傳遞給 `with`。

當你想在同一個物件上呼叫多個函式時，請使用 `with` 作用域函式。

請看以下範例：

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

該範例建立了一個 `Canvas` 類別，其中包含三個成員函數：`rect()`、`circ()` 和 `text()`。每個成員函數都會列印由你提供的函式參數所構成的陳述式。

該範例建立了 `Canvas` 類別的執行個體 `mainMonitorPrimaryBufferBackedCanvas`，隨後使用不同的函式參數對該執行個體依序呼叫一系列成員函數。

你可以看到這段程式碼很難閱讀。如果使用 `with` 函式，程式碼就會變得簡練流暢：

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

該範例：
* 使用 `with` 作用域函式，並以 `mainMonitorSecondaryBufferBackedCanvas` 執行個體作為接收者。
* 在 `with` 作用域函式中建立了一個臨時作用域，這樣在呼叫其成員函數時，就不需要明確參照 `mainMonitorSecondaryBufferBackedCanvas` 執行個體。
* 向 `with` 作用域函式傳遞一個 Lambda 運算式，以不同的函式參數依序呼叫一系列成員函數。

現在這段程式碼更加易讀，出錯的機率也大幅降低。

## 使用案例概覽 {id="use-case-overview"}

本節介紹了 Kotlin 中可用的各種作用域函式，以及讓你的程式碼更具慣用語意的主要使用案例。你可以將此表格作為快速參考。值得注意的是，你不需要完全理解這些函式的底層運作方式，就能在程式碼中使用它們。

| 函式 | 透過以下方式存取 `x` | 傳回值 | 使用案例 |
|----------|-------------------|---------------|----------------------------------------------------------------------------------------------|
| `let` | `it` | Lambda 結果 | 在程式碼中執行 null 檢查，隨後對傳回的物件執行進一步操作。 |
| `apply` | `this` | `x` | 在建立物件時進行初始化。 |
| `run` | `this` | Lambda 結果 | 在建立物件時進行初始化**並**計算結果。 |
| `also` | `it` | `x` | 在傳回物件前完成額外操作。 |
| `with` | `this` | Lambda 結果 | 在物件上呼叫多個函式。 |

若要深入了解作用域函式，請參閱[作用域函式](scope-functions.md)。

## 練習 {completion-point="true" id="practice"}

<deflist appearance="clear" collapsible="true" numbered="true">
<def title="使用安全呼叫與 let 改寫函式" id="scope-functions-exercise-1">

將 `.getPriceInEuros()` 函式改寫為使用安全呼叫運算子 `?.` 與 `let` 作用域函式的單一運算式函式。

<deflist collapsible="true">
    <def title="提示">
        使用安全呼叫運算子 <code>?.</code> 安全地存取來自 <code>getProductInfo()</code> 函式的 <code>priceInDollars</code> 屬性。然後，使用 <code>let</code> 作用域函式將 <code>priceInDollars</code> 的值轉換為歐元。
    </def>
</deflist>

```kotlin
data class ProductInfo(val priceInDollars: Double?)

class Product {
    fun getProductInfo(): ProductInfo? {
        return ProductInfo(100.0)
    }
}

// 改寫此函式
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
{validate="false" kotlin-runnable="true" kotlin-min-compiler-version="1.3" id="kotlin-tour-scope-functions-exercise-1"}

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
{initial-collapse-state="collapsed" collapsible="true" collapsed-title="參考解答" id="kotlin-tour-scope-functions-solution-1"}

</def>
<def title="鏈結 apply 與 also" id="scope-functions-exercise-2">

你有一個用於更新使用者電子郵件地址的 `updateEmail()` 函式。請使用 `apply` 作用域函式來更新電子郵件地址，然後使用 `also` 作用域函式列印記錄訊息：`Updating email for user with ID: ${it.id}`。

```kotlin
data class User(val id: Int, var email: String)

fun updateEmail(user: User, newEmail: String): User = // 在此處編寫你的程式碼

fun main() {
    val user = User(1, "old_email@example.com")
    val updatedUser = updateEmail(user, "new_email@example.com")
    // Updating email for user with ID: 1

    println("Updated User: $updatedUser")
    // Updated User: User(id=1, email=new_email@example.com)
}
```
{validate="false" kotlin-runnable="true" kotlin-min-compiler-version="1.3" id="kotlin-tour-scope-functions-exercise-2"}

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
{initial-collapse-state="collapsed" collapsible="true" collapsed-title="參考解答" id="kotlin-tour-scope-functions-solution-2"}

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