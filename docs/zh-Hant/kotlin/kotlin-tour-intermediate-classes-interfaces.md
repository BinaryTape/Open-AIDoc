[//]: # (title: 類別與介面)

<no-index/>

在初學者導覽中，你學習了如何使用類別與資料類別來儲存資料，並維護可在程式碼中共用的一組特性。最終，你會希望建立階層結構，以便在專案中有效率地共用程式碼。本章將說明 Kotlin 提供的共用程式碼選項，以及它們如何讓你的程式碼更安全、更易於維護。

## 類別繼承 {id="class-inheritance"}

在先前的章節中，我們介紹了如何使用擴充函式在不修改原始原始碼的情況下擴充類別。但是，如果你正在處理複雜的架構，而在類別**之間**共用程式碼會很有幫助，該怎麼辦？在這種情況下，你可以使用類別繼承。

預設情況下，Kotlin 中的類別無法被繼承。Kotlin 這樣設計是為了防止意外繼承，並使你的類別更易於維護。

Kotlin 類別僅支援**單一繼承**，這表示**一次只能繼承一個類別**。這個類別被稱為**父類別 (parent)**。

一個類別的父類別又繼承自另一個類別（祖父類別），從而形成階層結構。在 Kotlin 類別階層結構的最頂端是共同的父類別：`Any`。所有類別最終都繼承自 `Any` 類別：

![包含 Any 型別的類別階層結構範例](any-type-class.png){width="200"}

`Any` 類別會自動提供 `toString()` 函式作為成員函式。因此，你可以在任何類別中使用這個繼承來的函式。例如：

```kotlin
class Car(val make: String, val model: String, val numberOfDoors: Int)

fun main() {
    //sampleStart
    val car1 = Car("Toyota", "Corolla", 4)

    // 透過字串範本使用 .toString() 函式來列印類別屬性
    println("Car1: make=${car1.make}, model=${car1.model}, numberOfDoors=${car1.numberOfDoors}")
    // Car1: make=Toyota, model=Corolla, numberOfDoors=4
    //sampleEnd
}
```
{kotlin-runnable="true" id="kotlin-tour-any-class"}

如果你想使用繼承在類別之間共用部分程式碼，請先考慮使用抽象類別。

### 抽象類別 {id="abstract-classes"}

抽象類別預設可被繼承。抽象類別的目的是提供供其他類別繼承或實作的成員。因此，它們具有建構函式，但你無法從中建立執行個體。在子類別中，你可以使用 `override` 關鍵字來定義父類別屬性與函式的行為。透過這種方式，你可以說子類別「覆寫」了父類別的成員。

> 當你定義繼承函式或屬性的行為時，我們稱之為**實作**。
> 
{style="tip"}

抽象類別可以同時包含**帶有**實作的函式與屬性，以及**沒有**實作的函式與屬性（稱為抽象函式與抽象屬性）。

若要建立抽象類別，請使用 `abstract` 關鍵字：

```kotlin
abstract class Animal
```

若要宣告**沒有**實作的函式或屬性，也請使用 `abstract` 關鍵字：

```kotlin
abstract fun makeSound()
abstract val sound: String
```

例如，假設你想建立一個名為 `Product` 的抽象類別，並可從中建立子類別來定義不同的產品類別：

```kotlin
abstract class Product(val name: String, var price: Double) {
    // 產品類別的抽象屬性
    abstract val category: String

    // 所有產品共用的函式
    fun productInfo(): String {
        return "Product: $name, Category: $category, Price: $price"
    }
}
```

在該抽象類別中：

* 建構函式有兩個用於產品 `name` 與 `price` 的參數。
* 有一個以字串形式包含產品類別的抽象屬性。
* 有一個會列印產品資訊的函式。

讓我們為電子產品建立一個子類別。在子類別中為 `category` 屬性定義實作之前，你必須使用 `override` 關鍵字：

```kotlin
class Electronic(name: String, price: Double, val warranty: Int) : Product(name, price) {
    override val category = "Electronic"
}
```

`Electronic` 類別：

* 繼承自 `Product` 抽象類別。
* 建構函式中有一個額外的參數：`warranty`，這是電子產品特有的。
* 覆寫 `category` 屬性，使其包含字串 `"Electronic"`。

現在，你可以這樣使用這些類別：

```kotlin
abstract class Product(val name: String, var price: Double) {
    // 產品類別的抽象屬性
    abstract val category: String

    // 所有產品共用的函式
    fun productInfo(): String {
        return "Product: $name, Category: $category, Price: $price"
    }
}

class Electronic(name: String, price: Double, val warranty: Int) : Product(name, price) {
    override val category = "Electronic"
}

//sampleStart
fun main() {
    // 建立 Electronic 類別的執行個體
    val laptop = Electronic(name = "Laptop", price = 1000.0, warranty = 2)

    println(laptop.productInfo())
    // Product: Laptop, Category: Electronic, Price: 1000.0
}
//sampleEnd
```
{kotlin-runnable="true" id="kotlin-tour-abstract-class"}

雖然抽象類別非常適合以這種方式共用程式碼，但它們受到限制，因為 Kotlin 中的類別僅支援單一繼承。如果你需要從多個來源繼承，請考慮使用介面。

## 介面 {id="interfaces"}

介面與類別相似，但它們有一些差異：

* 你無法建立介面的執行個體。它們沒有建構函式或標頭。
* 它們的函式與屬性預設為隱式可繼承。在 Kotlin 中，我們稱之為「open」。
* 如果未提供實作，你不需要將其函式標記為 `abstract`。

與抽象類別類似，你可以使用介面來定義一組函式與屬性，供類別隨後繼承並實作。這種方法有助於你專注於介面所描述的抽象概念，而不是具體的實作細節。使用介面可以讓你的程式碼：

* 更具模組化，因為它隔離了不同部分，使它們能夠獨立演進。
* 將相關函式分組為一個具凝聚力的集合，使程式碼更易於理解。
* 更易於測試，因為你可以快速將實作替換為 Mock 以進行測試。

若要宣告介面，請使用 `interface` 關鍵字：

```kotlin
interface PaymentMethod
```

### 介面實作 {id="interface-implementation"}

介面支援多重繼承，因此一個類別可以同時實作多個介面。首先，讓我們考慮類別實作**一個**介面的情境。

若要建立實作介面的類別，請在類別標頭後方加上冒號，後面接著你要實作的介面名稱。介面名稱後面不需要使用圓括號 `()`，因為介面沒有建構函式：

```kotlin
class CreditCardPayment : PaymentMethod
```

例如：

```kotlin
interface PaymentMethod {
    // 函式預設可繼承
    fun initiatePayment(amount: Double): String
}

class CreditCardPayment(val cardNumber: String, val cardHolderName: String, val expiryDate: String) : PaymentMethod {
    override fun initiatePayment(amount: Double): String {
        // 模擬使用信用卡處理付款
        return "Payment of $$amount initiated using Credit Card ending in ${cardNumber.takeLast(4)}."
    }
}

fun main() {
    val paymentMethod = CreditCardPayment("1234 5678 9012 3456", "John Doe", "12/25")
    println(paymentMethod.initiatePayment(100.0))
    // Payment of $100.0 initiated using Credit Card ending in 3456.
}
```
{kotlin-runnable="true" id="kotlin-tour-interface-inheritance"}

在該範例中：

* `PaymentMethod` 是一個擁有未實作之 `initiatePayment()` 函式的介面。
* `CreditCardPayment` 是一個實作了 `PaymentMethod` 介面的類別。
* `CreditCardPayment` 類別覆寫了繼承而來的 `initiatePayment()` 函式。
* `paymentMethod` 是 `CreditCardPayment` 類別的執行個體。
* 在 `paymentMethod` 執行個體上呼叫覆寫後的 `initiatePayment()` 函式，並傳入參數 `100.0`。

若要建立實作**多個**介面的類別，請在類別標頭後加上冒號，接著填入你要實作的介面名稱，並以逗號分隔：

```kotlin
class CreditCardPayment : PaymentMethod, PaymentType
```

例如：

```kotlin
interface PaymentMethod {
    fun initiatePayment(amount: Double): String
}

interface PaymentType {
    val paymentType: String
}

class CreditCardPayment(val cardNumber: String, val cardHolderName: String, val expiryDate: String) : PaymentMethod,
    PaymentType {
    override fun initiatePayment(amount: Double): String {
        // 模擬使用信用卡處理付款
        return "Payment of $$amount initiated using Credit Card ending in ${cardNumber.takeLast(4)}."
    }

    override val paymentType: String = "Credit Card"
}

fun main() {
    val paymentMethod = CreditCardPayment("1234 5678 9012 3456", "John Doe", "12/25")
    println(paymentMethod.initiatePayment(100.0))
    // Payment of $100.0 initiated using Credit Card ending in 3456.

    println("Payment is by ${paymentMethod.paymentType}")
    // Payment is by Credit Card
}
```
{kotlin-runnable="true" id="kotlin-tour-interface-multiple-inheritance"}

在該範例中：

* `PaymentMethod` 是一個擁有未實作之 `initiatePayment()` 函式的介面。
* `PaymentType` 是一個擁有未初始化之 `paymentType` 屬性的介面。
* `CreditCardPayment` 是一個實作了 `PaymentMethod` 和 `PaymentType` 介面的類別。
* `CreditCardPayment` 類別覆寫了繼承而來的 `initiatePayment()` 函式與 `paymentType` 屬性。
* `paymentMethod` 是 `CreditCardPayment` 類別的執行個體。
* 在 `paymentMethod` 執行個體上呼叫覆寫後的 `initiatePayment()` 函式，並傳入參數 `100.0`。
* 在 `paymentMethod` 執行個體上存取覆寫後的 `paymentType` 屬性。

如需關於介面與介面繼承的詳細資訊，請參閱[介面](interfaces.md)。

## 委託 {id="delegation"}

介面非常實用，但如果你的介面包含許多函式，其子類別最終可能會產生大量樣板程式碼。如果你只想覆寫類別行為的一小部分，就必須進行許多重複的工作。

> 樣板程式碼是指在軟體專案的多個部分中，幾乎或完全不加修改便重複使用的一段程式碼。
> 
{style="tip"}

例如，假設你有一個名為 `DrawingTool` 的介面，其中包含多個函式以及一個名為 `color` 的屬性：

```kotlin
interface DrawingTool {
    val color: String
    fun draw(shape: String)
    fun erase(area: String)
    fun getToolInfo(): String
}
```

你建立了一個名為 `PenTool` 的類別，該類別實作了 `DrawingTool` 介面並為其所有成員提供實作：

```kotlin
class PenTool : DrawingTool {
    override val color: String = "black"

    override fun draw(shape: String) {
        println("Drawing $shape using a pen in $color")
    }

    override fun erase(area: String) {
        println("Erasing $area with pen tool")
    }

    override fun getToolInfo(): String {
        return "PenTool(color=$color)"
    }
}
```

你想要建立一個類似 `PenTool` 的類別，具備相同的行為但具有不同的 `color` 值。一種做法是建立一個新類別，該類別預期接收一個實作 `DrawingTool` 介面的物件作為參數（例如 `PenTool` 類別的執行個體）。然後，在類別內部覆寫 `color` 屬性。

但在這種情況下，你必須為 `DrawingTool` 介面的每個成員新增實作：

```kotlin
interface DrawingTool {
    val color: String
    fun draw(shape: String)
    fun erase(area: String)
    fun getToolInfo(): String
}

class PenTool : DrawingTool {
    override val color: String = "black"

    override fun draw(shape: String) {
        println("Drawing $shape using a pen in $color")
    }

    override fun erase(area: String) {
        println("Erasing $area with pen tool")
    }

    override fun getToolInfo(): String {
        return "PenTool(color=$color)"
    }
}
//sampleStart
class CanvasSession(val tool: DrawingTool) : DrawingTool {
    override val color: String = "blue"

    override fun draw(shape: String) {
        tool.draw(shape)
    }

    override fun erase(area: String) {
        tool.erase(area)
    }

    override fun getToolInfo(): String {
        return tool.getToolInfo()
    }
}
//sampleEnd
fun main() {
    val pen = PenTool()
    val session = CanvasSession(pen)

    println("Pen color: ${pen.color}")
    // Pen color: black

    println("Session color: ${session.color}")
    // Session color: blue

    session.draw("circle")
    // Drawing circle with pen in black

    session.erase("top-left corner")
    // Erasing top-left corner with pen tool

    println(session.getToolInfo())
    // PenTool(color=black)
}
```
{kotlin-runnable="true" id="kotlin-tour-interface-non-delegation"}

你可以看到，如果 `DrawingTool` 介面中包含大量成員函式，`CanvasSession` 類別中的樣板程式碼數量可能會非常龐大。不過，還有另一種替代方案。

在 Kotlin 中，你可以使用 `by` 關鍵字將介面實作委託給類別執行個體。例如：

```kotlin
class CanvasSession(val tool: DrawingTool) : DrawingTool by tool
```

在這裡，`tool` 是被委託成員函式實作的 `PenTool` 類別執行個體名稱。

現在你不需要在 `CanvasSession` 類別中為成員函式新增實作。編譯器會自動從 `PenTool` 類別為你完成這項工作。這省去了編寫大量樣板程式碼的麻煩。相反地，你只需為想要變更的子類別行為新增程式碼。

例如，如果你想變更 `color` 屬性的值：

```kotlin
interface DrawingTool {
    val color: String
    fun draw(shape: String)
    fun erase(area: String)
    fun getToolInfo(): String
}

class PenTool : DrawingTool {
    override val color: String = "black"

    override fun draw(shape: String) {
        println("Drawing $shape using a pen in $color")
    }

    override fun erase(area: String) {
        println("Erasing $area with pen tool")
    }

    override fun getToolInfo(): String {
        return "PenTool(color=$color)"
    }
}

//sampleStart
class CanvasSession(val tool: DrawingTool) : DrawingTool by tool {
    // 沒有樣板程式碼！
    override val color: String = "blue"
}
//sampleEnd
fun main() {
    val pen = PenTool()
    val session = CanvasSession(pen)

    println("Pen color: ${pen.color}")
    // Pen color: black

    println("Session color: ${session.color}")
    // Session color: blue

    session.draw("circle")
    // Drawing circle with pen in black

    session.erase("top-left corner")
    // Erasing top-left corner with pen tool

    println(session.getToolInfo())
    // PenTool(color=black)
}
```
{kotlin-runnable="true" id="kotlin-tour-interface-delegation"}

如果你願意，也可以在 `CanvasSession` 類別中覆寫繼承的成員函式行為，但現在你不需要為每個繼承的成員函式都新增程式碼行。

如需詳細資訊，請參閱[委託](delegation.md)。

## 練習 {completion-point="true" id="practice"}

<deflist appearance="clear" collapsible="true" numbered="true">
<def title="使用抽象類別實作智慧裝置" id="classes-interfaces-exercise-1">

想像你正在開發一個智慧家庭系統。智慧家庭通常有不同類型的裝置，它們都具有一些基本功能，但也有各自獨特的行為。在下方的程式碼範例中，完成名為 `SmartDevice` 的 `abstract` 類別，使子類別 `SmartLight` 能夠成功編譯。

接著，建立另一個名為 `SmartThermostat` 的子類別，該類別繼承自 `SmartDevice` 類別，並實作 `turnOn()` 與 `turnOff()` 函式，列印描述哪個恆溫器正在供暖或已關閉的陳述式。最後，新增另一個名為 `adjustTemperature()` 的函式，該函式接受溫度測量值作為輸入，並列印：`$name thermostat set to $temperature°C.`

<deflist collapsible="true">
    <def title="提示">
        在 <code>SmartDevice</code> 類別中新增 <code>turnOn()</code> 和 <code>turnOff()</code> 函式，以便稍後在 <code>SmartThermostat</code> 類別中覆寫它們的行為。
    </def>
</deflist>

```kotlin
abstract class // 在此處編寫你的程式碼

class SmartLight(name: String) : SmartDevice(name) {
    override fun turnOn() {
        println("$name is now ON.")
    }

    override fun turnOff() {
        println("$name is now OFF.")
    }

   fun adjustBrightness(level: Int) {
        println("Adjusting $name brightness to $level%.")
    }
}

class SmartThermostat // 在此處編寫你的程式碼

fun main() {
    val livingRoomLight = SmartLight("Living Room Light")
    val bedroomThermostat = SmartThermostat("Bedroom Thermostat")
    
    livingRoomLight.turnOn()
    // Living Room Light is now ON.
    livingRoomLight.adjustBrightness(10)
    // Adjusting Living Room Light brightness to 10%.
    livingRoomLight.turnOff()
    // Living Room Light is now OFF.

    bedroomThermostat.turnOn()
    // Bedroom Thermostat thermostat is now heating.
    bedroomThermostat.adjustTemperature(5)
    // Bedroom Thermostat thermostat set to 5°C.
    bedroomThermostat.turnOff()
    // Bedroom Thermostat thermostat is now off.
}
```
{validate="false" kotlin-runnable="true" kotlin-min-compiler-version="1.3" id="kotlin-tour-classes-interfaces-exercise-1"}

```kotlin
abstract class SmartDevice(val name: String) {
    abstract fun turnOn()
    abstract fun turnOff()
}

class SmartLight(name: String) : SmartDevice(name) {
    override fun turnOn() {
        println("$name is now ON.")
    }

    override fun turnOff() {
        println("$name is now OFF.")
    }

   fun adjustBrightness(level: Int) {
        println("Adjusting $name brightness to $level%.")
    }
}

class SmartThermostat(name: String) : SmartDevice(name) {
    override fun turnOn() {
        println("$name thermostat is now heating.")
    }

    override fun turnOff() {
        println("$name thermostat is now off.")
    }

   fun adjustTemperature(temperature: Int) {
        println("$name thermostat set to $temperature°C.")
    }
}

fun main() {
    val livingRoomLight = SmartLight("Living Room Light")
    val bedroomThermostat = SmartThermostat("Bedroom Thermostat")
    
    livingRoomLight.turnOn()
    // Living Room Light is now ON.
    livingRoomLight.adjustBrightness(10)
    // Adjusting Living Room Light brightness to 10%.
    livingRoomLight.turnOff()
    // Living Room Light is now OFF.

    bedroomThermostat.turnOn()
    // Bedroom Thermostat thermostat is now heating.
    bedroomThermostat.adjustTemperature(5)
    // Bedroom Thermostat thermostat set to 5°C.
    bedroomThermostat.turnOff()
    // Bedroom Thermostat thermostat is now off.
}
```
{initial-collapse-state="collapsed" collapsible="true" collapsed-title="參考解答" id="kotlin-tour-classes-interfaces-solution-1"}

</def>
<def title="實作媒體介面" id="classes-interfaces-exercise-2">

建立一個名為 `Media` 的介面，你可以用它來實作特定的媒體類別，例如 `Audio`、`Video` 或 `Podcast`。你的介面必須包含：

* 名為 `title` 的屬性，用於表示媒體的標題。
* 名為 `play()` 的函式，用於播放媒體。

接著，建立一個實作 `Media` 介面的類別 `Audio`。`Audio` 類別必須在其建構函式中使用 `title` 屬性，並包含一個型別為 `String` 的額外屬性 `composer`。在該類別中實作 `play()` 函式以列印以下內容：`"Playing audio: $title, composed by $composer"`。

<deflist collapsible="true">
    <def title="提示">
        你可以在類別標頭中使用 <code>override</code> 關鍵字，以在建構函式中實作來自介面的屬性。
    </def>
</deflist>

```kotlin
interface // 在此處編寫你的程式碼

class // 在此處編寫你的程式碼

fun main() {
    val audio = Audio("Symphony No. 5", "Beethoven")
    audio.play()
   // Playing audio: Symphony No. 5, composed by Beethoven
}
```
{validate="false" kotlin-runnable="true" kotlin-min-compiler-version="1.3" id="kotlin-tour-classes-interfaces-exercise-2"}

```kotlin
interface Media {
    val title: String
    fun play()
}

class Audio(override val title: String, val composer: String) : Media {
    override fun play() {
        println("Playing audio: $title, composed by $composer")
    }
}

fun main() {
    val audio = Audio("Symphony No. 5", "Beethoven")
    audio.play()
   // Playing audio: Symphony No. 5, composed by Beethoven
}
```
{initial-collapse-state="collapsed" collapsible="true" collapsed-title="參考解答" id="kotlin-tour-classes-interfaces-solution-2"}

</def>
<def title="結合介面與抽象類別" id="classes-interfaces-exercise-3">

你正在為電子商務應用程式建構付款處理系統。每種付款方式都需要能夠授權付款並處理交易。某些付款方式還需要能夠處理退款。

1. 在 `Refundable` 介面中新增一個名為 `refund()` 的函式以處理退款。

2. 在 `PaymentMethod` 抽象類別中：
   * 新增一個名為 `authorize()` 的函式，該函式接收金額並列印包含該金額的訊息。
   * 新增一個名為 `processPayment()` 的抽象函式，該函式同樣接收金額。

3. 建立一個實作 `Refundable` 介面與 `PaymentMethod` 抽象類別的名為 `CreditCard` 的類別。在此類別中，為 `refund()` 和 `processPayment()` 函式新增實作，使其列印以下陳述式：
   * `"Refunding $amount to the credit card."`
   * `"Processing credit card payment of $amount."`

```kotlin
interface Refundable {
    // 在此處編寫你的程式碼
}

abstract class PaymentMethod(val name: String) {
    // 在此處編寫你的程式碼
}

class CreditCard // 在此處編寫你的程式碼

fun main() {
    val visa = CreditCard("Visa")
    
    visa.authorize(100.0)
    // Authorizing payment of $100.0.
    visa.processPayment(100.0)
    // Processing credit card payment of $100.0.
    visa.refund(50.0)
    // Refunding $50.0 to the credit card.
}
```
{validate="false" kotlin-runnable="true" kotlin-min-compiler-version="1.3" id="kotlin-tour-classes-interfaces-exercise-3"}

```kotlin
interface Refundable {
    fun refund(amount: Double)
}

abstract class PaymentMethod(val name: String) {
    fun authorize(amount: Double) {
        println("Authorizing payment of $$amount.")
    }

    abstract fun processPayment(amount: Double)
}

class CreditCard(name: String) : PaymentMethod(name), Refundable {
    override fun processPayment(amount: Double) {
        println("Processing credit card payment of $$amount.")
    }

    override fun refund(amount: Double) {
        println("Refunding $$amount to the credit card.")
    }
}

fun main() {
    val visa = CreditCard("Visa")
    
    visa.authorize(100.0)
    // Authorizing payment of $100.0.
    visa.processPayment(100.0)
    // Processing credit card payment of $100.0.
    visa.refund(50.0)
    // Refunding $50.0 to the credit card.
}
```
{initial-collapse-state="collapsed" collapsible="true" collapsed-title="參考解答" id="kotlin-tour-classes-interfaces-solution-3"}

</def>
<def title="透過介面委託自訂行為" id="classes-interfaces-exercise-4">

你有一個具有一些基本功能的簡易訊息應用程式，但你希望在不大量重複程式碼的情況下，新增一些用於*智慧*訊息的功能。

在下方的程式碼中，定義一個名為 `SmartMessenger` 的類別，該類別繼承自 `Messenger` 介面，但將實作委託給 `BasicMessenger` 類別的執行個體。

在 `SmartMessenger` 類別中，覆寫 `sendMessage()` 函式以傳送智慧訊息。該函式必須接收 `message` 作為輸入並列印陳述式：`"Sending a smart message: $message"`。此外，呼叫來自 `BasicMessenger` 類別的 `sendMessage()` 函式，並在訊息前加上前綴 `[smart]`。

> 你不需要在 `SmartMessenger` 類別中重寫 `receiveMessage()` 函式。
> 
{style="note"}

```kotlin
interface Messenger {
    fun sendMessage(message: String)
    fun receiveMessage(): String
}

class BasicMessenger : Messenger {
    override fun sendMessage(message: String) {
        println("Sending message: $message")
    }

    override fun receiveMessage(): String {
        return "You've got a new message!"
    }
}

class SmartMessenger // 在此處編寫你的程式碼

fun main() {
    val basicMessenger = BasicMessenger()
    val smartMessenger = SmartMessenger(basicMessenger)
    
    basicMessenger.sendMessage("Hello!")
    // Sending message: Hello!
    println(smartMessenger.receiveMessage())
    // You've got a new message!
    smartMessenger.sendMessage("Hello from SmartMessenger!")
    // Sending a smart message: Hello from SmartMessenger!
    // Sending message: [smart] Hello from SmartMessenger!
}
```
{validate="false" kotlin-runnable="true" kotlin-min-compiler-version="1.3" id="kotlin-tour-classes-interfaces-exercise-4"}

```kotlin
interface Messenger {
    fun sendMessage(message: String)
    fun receiveMessage(): String
}

class BasicMessenger : Messenger {
    override fun sendMessage(message: String) {
        println("Sending message: $message")
    }

    override fun receiveMessage(): String {
        return "You've got a new message!"
    }
}

class SmartMessenger(val basicMessenger: BasicMessenger) : Messenger by basicMessenger {
    override fun sendMessage(message: String) {
        println("Sending a smart message: $message")
        basicMessenger.sendMessage("[smart] $message")
    }
}

fun main() {
    val basicMessenger = BasicMessenger()
    val smartMessenger = SmartMessenger(basicMessenger)
    
    basicMessenger.sendMessage("Hello!")
    // Sending message: Hello!
    println(smartMessenger.receiveMessage())
    // You've got a new message!
    smartMessenger.sendMessage("Hello from SmartMessenger!")
    // Sending a smart message: Hello from SmartMessenger!
    // Sending message: [smart] Hello from SmartMessenger!
}
```
{initial-collapse-state="collapsed" collapsible="true" collapsed-title="參考解答" id="kotlin-tour-classes-interfaces-solution-4"}

</def>
</deflist>

<seealso></seealso>

<list columns="2" id="tour-nav">
  <li>
    <a as="button" href="kotlin-tour-intermediate-lambdas-receiver.md" mode="outline" icon="arrow-left" icon-position="left">上一步</a>
  </li>
  <li>
    <a as="button" href="kotlin-tour-intermediate-objects.md" mode="classic" icon="arrow-right" icon-position="right">下一步</a>
  </li>
</list>