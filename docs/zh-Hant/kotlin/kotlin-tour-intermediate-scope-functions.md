[//]: # (title: 作用域函式)

<no-index/>

在本章節中，你將基於對擴充方法的理解，學習如何使用作用域函式（scope functions）來撰寫更道地的程式碼。

## 作用域函式 (Scope functions)

在程式設計中，作用域（scope）是變數或物件被辨識的區域。最常提到的作用域是全域作用域和區域作用域：

* **全域作用域 (Global scope)** – 可以從程式中任何地方存取的變數或物件。
* **區域作用域 (Local scope)** – 僅能在定義該變數或物件的區塊或函式內存取的變數或物件。

在 Kotlin 中，還有作用域函式，允許你圍繞物件建立一個臨時作用域並執行一些程式碼。

作用域函式使你的程式碼更加簡潔，因為你不需要在臨時作用域內引用物件的名稱。根據作用域函式的不同，你可以透過關鍵字 `this` 引用物件，或者透過關鍵字 `it` 將其作為引數使用。

Kotlin 總共有五個作用域函式：`let`、`apply`、`run`、`also` 和 `with`。

每個作用域函式都接受一個 Lambda 運算式，並傳回物件本身或 Lambda 運算式的結果。在本導覽中，我們將解釋每個作用域函式及其使用方法。

> 你也可以觀看由 Kotlin 技術傳教士 Sebastian Aigner 主講的關於作用域函式的演講：[Back to the Stdlib: Making the Most of Kotlin's Standard Library](https://youtu.be/DdvgvSHrN9g?feature=shared&t=1511)。
> 
{style="tip"}

### Let

當你想在程式碼中執行 null 檢查，並在隨後對傳回的物件執行進一步操作時，請使用 `let` 作用域函式。

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

該範例有兩個函式：
* `sendNotification()`：具有一個函式參數 `recipientAddress` 並傳回一個字串。
* `getNextAddress()`：沒有函式參數並傳回一個字串。

該範例建立了一個變數 `address`，其型別為可為 null 的 `String`。但在呼叫 `sendNotification()` 函式時會出現問題，因為該函式不預期 `address` 可能是 `null` 值。結果編譯器會報告錯誤： 

```text
Argument type mismatch: actual type is 'String?', but 'String' was expected.
```

在入門導覽中，你已經知道可以使用 if 條件執行 null 檢查，或使用 [Elvis 運算子 `?:`](kotlin-tour-null-safety.md#use-elvis-operator)。但如果你想在程式碼稍後使用傳回的物件呢？你可以透過 if 條件**以及** else 分支來實現：

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
* 對 `address` 變數使用 `let` 作用域函式的安全呼叫。
* 在 `let` 作用域函式內建立一個臨時作用域。
* 將 `sendNotification()` 函式作為 Lambda 運算式傳遞到 `let` 作用域函式中。
* 使用臨時作用域透過 `it` 引用 `address` 變數。
* 將結果指派給 `confirm` 變數。

透過這種方法，你的程式碼可以處理 `address` 變數可能為 `null` 的情況，並且你可以在程式碼稍後使用 `confirm` 變數。

### Apply

使用 `apply` 作用域函式在建立物件（如類別執行個體）時對其進行初始化，而不是在程式碼的後續位置。這種方法使你的程式碼更易於閱讀和管理。

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

該範例有一個 `Client` 類別，包含一個名為 `token` 的屬性和三個成員函數：`connect()`、`authenticate()` 和 `getData()`。

該範例在 `main()` 函式中初始化 `token` 屬性並呼叫其成員函數之前，先建立了 `client` 作為 `Client` 類別的執行個體。

雖然這個範例很精簡，但在現實世界中，從建立類別執行個體到配置並使用它（及其成員函數）可能需要一段時間。然而，如果使用 `apply` 作用域函式，你可以在程式碼的同一位置建立、配置並使用類別執行個體上的成員函數：

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

* 建立 `client` 作為 `Client` 類別的執行個體。
* 對 `client` 執行個體使用 `apply` 作用域函式。
* 在 `apply` 作用域函式內建立一個臨時作用域，以便在存取其屬性或函式時不需要明確引用 `client` 執行個體。
* 向 `apply` 作用域函式傳遞一個 Lambda 運算式，用於更新 `token` 屬性並呼叫 `connect()` 和 `authenticate()` 函式。
* 在 `main()` 函式中呼叫 `client` 執行個體上的 `getData()` 成員函數。

如你所見，當你處理大量程式碼時，這種策略非常方便。

### Run

與 `apply` 類似，你可以使用 `run` 作用域函式來初始化物件，但最好使用 `run` 在程式碼的特定時刻初始化物件**並**立即計算結果。

讓我們繼續前一個 `apply` 函式的範例，但這一次，你希望將 `connect()` 和 `authenticate()` 函式分組，以便在每次請求時呼叫它們。

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

* 建立 `client` 作為 `Client` 類別的執行個體。
* 對 `client` 執行個體使用 `apply` 作用域函式。
* 在 `apply` 作用域函式內建立一個臨時作用域，以便在存取其屬性或函式時不需要明確引用 `client` 執行個體。
* 向 `apply` 作用域函式傳遞一個 Lambda 運算式，用於更新 `token` 屬性。

`main()` 函式：

* 建立一個型別為 `String` 的 `result` 變數。
* 對 `client` 執行個體使用 `run` 作用域函式。
* 在 `run` 作用域函式內建立一個臨時作用域，以便在存取其屬性或函式時不需要明確引用 `client` 執行個體。
* 向 `run` 作用域函式傳遞一個 Lambda 運算式，呼叫 `connect()`、`authenticate()` 和 `getData()` 函式。
* 將結果指派給 `result` 變數。

現在你可以在程式碼中進一步使用傳回的結果。

### Also

使用 `also` 作用域函式對物件執行額外操作，然後傳回該物件以在程式碼中繼續使用它，例如撰寫日誌。

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
* 對 `medals` 變數使用 `.map()` 擴充方法。
* 向 `.map()` 函式傳遞一個 Lambda 運算式，該運算式透過 `it` 關鍵字引用 `medals` 並對其呼叫 `.uppercase()` 擴充方法。
* 對 `medals` 變數使用 `.filter()` 擴充方法。
* 向 `.filter()` 函式傳遞一個 Lambda 運算式作為謂詞，該運算式透過 `it` 關鍵字引用 `medals` 並檢查清單中的項目是否超過 4 個字元。
* 對 `medals` 變數使用 `.reversed()` 擴充方法。
* 將結果指派給 `reversedLongUpperCaseMedals` 變數。
* 列印 `reversedLongUpperCaseMedals` 變數中包含的清單。

在函式呼叫之間添加一些日誌記錄以查看 `medals` 變數發生了什麼會很有用。`also` 函式對此很有幫助：

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

* 對 `medals` 變數使用 `also` 作用域函式。
* 在 `also` 作用域函式內建立一個臨時作用域，以便在將 `medals` 變數作為函式參數使用時不需要明確引用它。
* 向 `also` 作用域函式傳遞一個 Lambda 運算式，該運算式透過 `it` 關鍵字使用 `medals` 變數作為函式參數來呼叫 `println()` 函式。

由於 `also` 函式會傳回物件本身，因此它不僅適用於日誌記錄，還適用於偵錯、鏈接多個操作以及執行其他不影響程式碼主要流程的副作用操作。

### With

與其他作用域函式不同，`with` 不是擴充方法，因此語法不同。你將接收器物件作為引數傳遞給 `with`。

當你想對一個物件呼叫多個函式時，請使用 `with` 作用域函式。

請看這個範例：

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

該範例建立了一個 `Canvas` 類別，它有三個成員函數：`rect()`、`circ()` 和 `text()`。這些成員函數中的每一個都會列印一條根據你提供的函式參數建構的敘述。

該範例在對執行個體呼叫具有不同函式參數的一系列成員函數之前，先建立了 `mainMonitorPrimaryBufferBackedCanvas` 作為 `Canvas` 類別的執行個體。

你可以看到這段程式碼很難閱讀。如果你使用 `with` 函式，程式碼會變得簡潔：

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

這個範例：
* 使用 `with` 作用域函式，並以 `mainMonitorSecondaryBufferBackedCanvas` 執行個體作為接收器。
* 在 `with` 作用域函式內建立一個臨時作用域，以便在呼叫其成員函數時不需要明確引用 `mainMonitorSecondaryBufferBackedCanvas` 執行個體。
* 向 `with` 作用域函式傳遞一個 Lambda 運算式，該運算式呼叫具有不同函式參數的一系列成員函數。

現在這段程式碼更容易閱讀，你也更不容易出錯。

## 使用案例概覽

本節介紹了 Kotlin 中可用的不同作用域函式及其主要使用案例，以使你的程式碼更加道地。你可以將此表格作為快速參考。重要的是要注意，你不需要完全理解這些函式的工作原理即可在程式碼中使用它們。

| 函式 | 透過以下方式存取 `x` | 傳回值 | 使用案例 |
|----------|-------------------|---------------|----------------------------------------------------------------------------------------------|
| `let`    | `it`              | Lambda 結果 | 在程式碼中執行 null 檢查，隨後對傳回的物件執行進一步操作。 |
| `apply`  | `this`            | `x`           | 在建立物件時進行初始化。 |
| `run`    | `this`            | Lambda 結果 | 在建立物件時進行初始化**並**計算結果。 |
| `also`   | `it`              | `x`           | 在傳回物件之前完成額外操作。 |
| `with`   | `this`            | Lambda 結果 | 對一個物件呼叫多個函式。 |

有關作用域函式的更多資訊，請參閱[作用域函式](scope-functions.md)。

## 練習 {completion-point="true"}

### 練習 1 {initial-collapse-state="collapsed" collapsible="true" id="scope-functions-exercise-1"}

將 `.getPriceInEuros()` 函式改寫為使用安全呼叫運算子 `?.` 和 `let` 作用域函式的單運算式函式。

<deflist collapsible="true">
    <def title="提示">
        使用安全呼叫運算子 <code>?.</code> 從 <code>getProductInfo()</code> 函式中安全地存取 <code>priceInDollars</code> 屬性。然後，使用 <code>let</code> 作用域函式將 <code>priceInDollars</code> 的值轉換為歐元。
    </def>
</deflist>

|---|---|
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

|---|---|
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
{initial-collapse-state="collapsed" collapsible="true" collapsed-title="範例解答" id="kotlin-tour-scope-functions-solution-1"}

### 練習 2 {initial-collapse-state="collapsed" collapsible="true" id="scope-functions-exercise-2"}

你有一個 `updateEmail()` 函式用於更新使用者的電子郵件地址。使用 `apply` 作用域函式來更新電子郵件地址，然後使用 `also` 作用域函式來列印一條日誌訊息：`Updating email for user with ID: ${it.id}`。

|---|---|
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

|---|---|
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
{initial-collapse-state="collapsed" collapsible="true" collapsed-title="範例解答" id="kotlin-tour-scope-functions-solution-2"}

<seealso></seealso>

<list columns="2" id="tour-nav">
  <li>
    <a as="button" href="kotlin-tour-intermediate-extension-functions.md" mode="outline" icon="arrow-left" icon-position="left">上一步</a>
  </li>
  <li>
    <a as="button" href="kotlin-tour-intermediate-lambdas-receiver.md" mode="classic" icon="arrow-right" icon-position="right">下一步</a>
  </li>
</list>