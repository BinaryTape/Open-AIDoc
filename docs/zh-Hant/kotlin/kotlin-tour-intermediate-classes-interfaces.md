[//]: # (title: 類別與介面)

<no-index/>

在入門導覽中，你學習了如何使用類別與資料類別來儲存資料，並維護可在程式碼中共享的特性集合。最終，你會希望建立階層結構，以便在專案中有效率地共享程式碼。本章將說明 Kotlin 為共享程式碼所提供的選項，以及它們如何讓你的程式碼更安全且更易於維護。

## 類別繼承 {id="class-inheritance"}

在前面的章節中，我們介紹了如何使用擴充函式來擴充類別，而無需修改原始程式碼。但如果你正在處理較複雜的情況，且在類別**之間**共享程式碼會很有幫助時，該怎麼辦？在這種情況下，你可以使用類別繼承。

預設情況下，Kotlin 中的類別無法被繼承。Kotlin 採用這種設計是為了防止非預期的繼承，並讓你的類別更容易維護。

Kotlin 類別僅支援**單一繼承**，這意味著一次只能繼承**一個類別**。這個類別被稱為**父類別**。

一個類別的父類別又繼承自另一個類別（祖父類別），從而形成階層結構。在 Kotlin 類別階層結構的頂端是共同的父類別：`Any`。所有類別最終都繼承自 `Any` 類別：

![具有 Any 型別的類別階層結構範例](any-type-class.png){width="200"}

`Any` 類別會自動提供 `toString()` 函式作為成員函式。因此，你可以在任何類別中使用這個繼承而來的函式。例如：

```kotlin
class Car(val make: String, val model: String, val numberOfDoors: Int)

fun main() {
    //sampleStart
    val car1 = Car("Toyota", "Corolla", 4)

    // 透過字串範本使用 .toString() 函式來印出類別屬性
    println("Car1: make=${car1.make}, model=${car1.model}, numberOfDoors=${car1.numberOfDoors}")
    // Car1: make=Toyota, model=Corolla, numberOfDoors=4
    //sampleEnd
}
```
{kotlin-runnable="true" id="kotlin-tour-any-class"}

如果你想使用繼承在類別之間共享某些程式碼，請先考慮使用抽象類別。

### 抽象類別 {id="abstract-classes"}

抽象類別預設可以被繼承。抽象類別的目的是提供供其他類別繼承或實作的成員。因此，它們擁有建構函式，但你無法從中建立執行個體。在子類別中，你可以使用 `override` 關鍵字來定義父類別屬性與函式的行為。透過這種方式，你可以說子類別「覆寫」了父類別的成員。

> 當你定義繼承函式或屬性的行為時，我們稱之為**實作**。
> 
{style="tip"}

抽象類別既可以包含**帶有**實作的函式與屬性，也可以包含**沒有**實作的函式與屬性（稱為抽象函式與抽象屬性）。

若要建立抽象類別，請使用 `abstract` 關鍵字：

```kotlin
abstract class Animal
```

若要宣告**沒有**實作的函式或屬性，也是使用 `abstract` 關鍵字：

```kotlin
abstract fun makeSound()
abstract val sound: String
```

例如，假設你想建立一個名為 `Product` 的抽象類別，以便從中建立子類別來定義不同的產品類別：

```kotlin
abstract class Product(val name: String, var price: Double) {
    // 產品類別的抽象屬性
    abstract val category: String

    // 所有產品都可以共享的函式
    fun productInfo(): String {
        return "Product: $name, Category: $category, Price: $price"
    }
}
```

在此抽象類別中：

* 建構函式有兩個代表產品 `name` 和 `price` 的參數。
* 有一個抽象屬性，以字串形式包含產品類別。
* 有一個印出產品資訊的函式。

讓我們為電子產品建立一個子類別。在子類別中為 `category` 屬性定義實作之前，你必須使用 `override` 關鍵字：

```kotlin
class Electronic(name: String, price: Double, val warranty: Int) : Product(name, price) {
    override val category = "Electronic"
}
```

`Electronic` 類別：

* 繼承自 `Product` 抽象類別。
* 在建構函式中有一個額外的參數：`warranty`，這是電子產品特有的。
* 覆寫 `category` 屬性使其包含字串 `"Electronic"`。

現在，你可以像這樣使用這些類別：

```kotlin
abstract class Product(val name: String, var price: Double) {
    // 產品類別的抽象屬性
    abstract val category: String

    // 所有產品都可以共享的函式
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

雖然抽象類別非常適合以這種方式共享程式碼，但它們受到限制，因為 Kotlin 中的類別僅支援單一繼承。如果你需要從多個來源繼承，請考慮使用介面。

## 介面 {id="interfaces"}

介面與類別相似，但它們有一些差異：

* 你無法建立介面的執行個體。它們沒有建構函式或標頭。
* 它們的函式與屬性預設為隱式可繼承。在 Kotlin 中，我們稱之為「open」。
* 如果你沒有為函式提供實作，則不需要將其標記為 `abstract`。

與抽象類別類似，你可以使用介面來定義一組函式與屬性，供類別後續繼承與實作。這種方法有助於你專注於介面所描述的抽象概念，而非具體的實作細節。使用介面可讓你的程式碼：

* 更模組化，因為它隔離了不同部分，使它們能夠獨立演進。
* 更易於理解，將相關的函式組織成一個具凝聚力的集合。
* 更易於測試，因為你可以快速將實作替換為 Mock 以進行測試。

若要宣告介面，請使用 `interface` 關鍵字：

```kotlin
interface PaymentMethod
```

### 介面實作 {id="interface-implementation"}

介面支援多重繼承，因此一個類別可以同時實作多個介面。首先，讓我們看看一個類別實作**一個**介面的情境。

若要建立實作介面的類別，請在類別標頭後方加上冒號，接著加上你想實作的介面名稱。介面名稱後不需要加上圓括號 `()`，因為介面沒有建構函式：

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

在此範例中：

* `PaymentMethod` 是一個介面，包含一個沒有實作的 `initiatePayment()` 函式。
* `CreditCardPayment` 是一個實作了 `PaymentMethod` 介面的類別。
* `CreditCardPayment` 類別覆寫了繼承而來的 `initiatePayment()` 函式。
* `paymentMethod` 是 `CreditCardPayment` 類別的執行個體。
* 在 `paymentMethod` 執行個體上呼叫覆寫後的 `initiatePayment()` 函式，並帶入參數 `100.0`。

若要建立實作**多個**介面的類別，請在類別標頭後加上冒號，接著加上你想實作的介面名稱，並以逗號分隔：

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

在此範例中：

* `PaymentMethod` 是一個介面，包含一個沒有實作的 `initiatePayment()` 函式。
* `PaymentType` 是一個介面，包含一個未初始化的 `paymentType` 屬性。
* `CreditCardPayment` 是一個實作了 `PaymentMethod` 與 `PaymentType` 介面的類別。
* `CreditCardPayment` 類別覆寫了繼承而來的 `initiatePayment()` 函式與 `paymentType` 屬性。
* `paymentMethod` 是 `CreditCardPayment` 類別的執行個體。
* 在 `paymentMethod` 執行個體上呼叫覆寫後的 `initiatePayment()` 函式，並帶入參數 `100.0`。
* 在 `paymentMethod` 執行個體上存取覆寫後的 `paymentType` 屬性。

如需關於介面與介面繼承的更多資訊，請參閱[介面](interfaces.md)。

## 委託 {id="delegation"}

介面很有用，但如果你的介面包含許多函式，其子類別最終可能會產生大量樣板程式碼。如果你只想覆寫類別行為的一小部分，你就必須撰寫許多重複的程式碼。

> 樣板程式碼是指在軟體專案中多個部分重複使用，且幾乎不加修改或完全不修改的一段程式碼。
> 
{style="tip"}

例如，假設你有一個名為 `DrawingTool` 的介面，其中包含若干函式以及一個名為 `color` 的屬性：

```kotlin
interface DrawingTool {
    val color: String
    fun draw(shape: String)
    fun erase(area: String)
    fun getToolInfo(): String
}
```

你建立了一個名為 `PenTool` 的類別，該類別實作了 `DrawingTool` 介面，並為其所有成員提供了實作：

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

你想建立一個類似 `PenTool` 的類別，具備相同的行為但具有不同的 `color` 值。一種方法是建立一個新類別，該類別接受實作了 `DrawingTool` 介面的物件作為參數（例如 `PenTool` 類別的執行個體）。接著，在該類別內部覆寫 `color` 屬性。

但是在這種情境下，你必須為 `DrawingTool` 介面的每個成員新增實作：

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

你可以看到，如果 `DrawingTool` 介面中包含大量成員函式，`CanvasSession` 類別中的樣板程式碼數量可能會非常可觀。然而，還有一種替代方案。

在 Kotlin 中，你可以使用 `by` 關鍵字將介面實作委託給一個類別執行個體。例如：

```kotlin
class CanvasSession(val tool: DrawingTool) : DrawingTool by tool
```

在這裡，`tool` 是被委託實作成員函式的 `PenTool` 類別執行個體的名稱。

現在你不需要在 `CanvasSession` 類別中為成員函式新增實作。編譯器會自動為你從 `PenTool` 類別中完成此操作。這能讓你免於編寫大量樣板程式碼。相反地，你只需為子類別中想要改變的行為新增程式碼。

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
    // No boilerplate code!
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

如果你願意，也可以在 `CanvasSession` 類別中覆寫繼承而來的成員函式的行為，但現在你不需要為每個繼承而來的成員函式都新增程式碼行。

如需更多資訊，請參閱[委託](delegation.md)。

## 練習 {completion-point="true" id="practice"}

<deflist appearance="clear" collapsible="true" numbered="true">
<def title="使用抽象類別實作智慧裝置" id="classes-interfaces-exercise-1">

想像你正在開發一個智慧家庭系統。智慧家庭通常具有不同類型的裝置，它們都具備某些基本功能，但也有各自獨特的行為。在下方的程式碼範例中，完成名為 `SmartDevice` 的 `abstract` 類別，使子類別 `SmartLight` 能夠成功編譯。

接著，建立另一個名為 `SmartThermostat` 的子類別，該類別繼承自 `SmartDevice` 類別，並實作 `turnOn()` 與 `turnOff()` 函式，以印出描述哪個溫控器正在加熱或已關閉的陳述式。最後，新增另一個名為 `adjustTemperature()` 的函式，該函式接受溫度測量值作為輸入，並印出：`$name thermostat set to $temperature°C.`

<deflist collapsible="true">
    <def title="提示">
        在 <code>SmartDevice</code> 類別中新增 <code>turnOn()</code> 與 <code>turnOff()</code> 函式，以便稍後在 <code>SmartThermostat</code> 類別中覆寫它們的行為。
    </def>
</deflist>

```kotlin
abstract class // Write your code here

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

class SmartThermostat // Write your code here

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
{kotlin-runnable="true" kotlin-target-platform="exercise" kotlin-hidden-files="ExerciseUtils.kt,tour/intermediate/SmartDeviceTest.kt" validate="false" id="kotlin-tour-classes-interfaces-exercise-1"}

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
{kotlin-runnable="true" kotlin-target-platform="exercise" kotlin-hidden-files="ExerciseUtils.kt,tour/intermediate/SmartDeviceTest.kt" initial-collapse-state="collapsed" collapsible="true" collapsed-title="範例解答" id="kotlin-tour-classes-interfaces-solution-1"}

</def>
<def title="實作媒體介面" id="classes-interfaces-exercise-2">

建立一個名為 `Media` 的介面，用於實作具體的媒體類別（例如 `Audio`、`Video` 或 `Podcast`）。你的介面必須包含：

* 一個名為 `title` 的屬性，用以表示媒體的標題。
* 一個名為 `play()` 的函式，用以播放媒體。

接著，建立一個實作了 `Media` 介面的 `Audio` 類別。`Audio` 類別必須在其建構函式中使用 `title` 屬性，並擁有一個名為 `composer` 且型別為 `String` 的額外屬性。在該類別中，實作 `play()` 函式以印出：`"Playing audio: $title, composed by $composer"`。

<deflist collapsible="true">
    <def title="提示">
        你可以在類別標頭中使用 <code>override</code> 關鍵字，以在建構函式中實作介面中的屬性。
    </def>
</deflist>

```kotlin
interface // Write your code here

class // Write your code here

fun main() {
    val audio = Audio("Symphony No. 5", "Beethoven")
    audio.play()
   // Playing audio: Symphony No. 5, composed by Beethoven
}
```
{kotlin-runnable="true" kotlin-target-platform="exercise" kotlin-hidden-files="ExerciseUtils.kt,tour/intermediate/AudioTest.kt" validate="false" id="kotlin-tour-classes-interfaces-exercise-2"}

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
{kotlin-runnable="true" kotlin-target-platform="exercise" kotlin-hidden-files="ExerciseUtils.kt,tour/intermediate/AudioTest.kt" initial-collapse-state="collapsed" collapsible="true" collapsed-title="範例解答" id="kotlin-tour-classes-interfaces-solution-2"}

</def>
<def title="結合介面與抽象類別" id="classes-interfaces-exercise-3">

你正在為電子商務應用程式建構付款處理系統。每種付款方式都需要能夠授權付款並處理交易。某些付款方式還需要能夠處理退款。

1. 在 `Refundable` 介面中，新增一個名為 `refund()` 的函式以處理退款。

2. 在 `PaymentMethod` 抽象類別中：
   * 新增一個名為 `authorize()` 的函式，該函式接受一個金額並印出包含該金額的訊息。
   * 新增一個名為 `processPayment()` 的抽象函式，同樣接受一個金額。

3. 建立一個名為 `CreditCard` 的類別，實作 `Refundable` 介面與 `PaymentMethod` 抽象類別。在此類別中，為 `refund()` 和 `processPayment()` 函式新增實作，使它們印出以下陳述式：
   * `"Refunding $amount to the credit card."`
   * `"Processing credit card payment of $amount."`

```kotlin
interface Refundable {
    // Write your code here
}

abstract class PaymentMethod(val name: String) {
    // Write your code here
}

class CreditCard // Write your code here

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
{kotlin-runnable="true" kotlin-target-platform="exercise" kotlin-hidden-files="ExerciseUtils.kt,tour/intermediate/CreditCardTest.kt" validate="false" id="kotlin-tour-classes-interfaces-exercise-3"}

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
{kotlin-runnable="true" kotlin-target-platform="exercise" kotlin-hidden-files="ExerciseUtils.kt,tour/intermediate/CreditCardTest.kt" initial-collapse-state="collapsed" collapsible="true" collapsed-title="範例解答" id="kotlin-tour-classes-interfaces-solution-3"}

</def>
<def title="使用介面委託自訂行為" id="classes-interfaces-exercise-4">

你有一個具備基本功能的簡易傳訊應用程式，但你希望為「智慧（_smart_）」訊息新增一些功能，同時不大幅重複你的程式碼。

在下方的程式碼中，定義一個名為 `SmartMessenger` 的類別，該類別繼承自 `Messenger` 介面，但將實作委託給 `BasicMessenger` 類別的執行個體。

在 `SmartMessenger` 類別中，覆寫 `sendMessage()` 函式以傳送智慧訊息。該函式必須接受 `message` 作為輸入，並印出陳述式：`"Sending a smart message: $message"`。此外，呼叫來自 `BasicMessenger` 類別的 `sendMessage()` 函式，並在訊息前加上前綴 `[smart]`。

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

class SmartMessenger // Write your code here

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
{kotlin-runnable="true" kotlin-target-platform="exercise" kotlin-hidden-files="ExerciseUtils.kt,tour/intermediate/SmartMessengerTest.kt" validate="false" id="kotlin-tour-classes-interfaces-exercise-4"}

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
{kotlin-runnable="true" kotlin-target-platform="exercise" kotlin-hidden-files="ExerciseUtils.kt,tour/intermediate/SmartMessengerTest.kt" initial-collapse-state="collapsed" collapsible="true" collapsed-title="範例解答" id="kotlin-tour-classes-interfaces-solution-4"}

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