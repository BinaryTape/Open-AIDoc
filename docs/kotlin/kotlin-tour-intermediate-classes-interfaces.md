[//]: # (title: 类与接口)

<no-index/>

在初学者之旅中，你学习了如何使用类和数据类来存储数据并维护一组可在代码中共享的特征。最终，你将希望创建层次结构以便在项目中高效共享代码。本章将介绍 Kotlin 为共享代码提供的各种选项，以及它们如何让你的代码更安全、更易于维护。

## 类继承 {id="class-inheritance"}

在上一章中，我们介绍了如何使用扩展函数在不修改原始源代码的情况下扩展类。但如果你正在处理复杂的情况，在类**之间**共享代码会很有用，该怎么办呢？在这些情况下，你可以使用类继承。

默认情况下，Kotlin 中的类不能被继承。Kotlin 采用这种设计是为了防止非预期的继承，并使你的类更容易维护。

Kotlin 类仅支持**单继承**，这意味着一次只能继承自**一个类**。这个类被称为**父类 (parent)**。

一个类的父类可以继承自另一个类（祖父类），从而形成层次结构。在 Kotlin 类层次结构的最顶层是通用的父类：`Any`。所有类最终都继承自 `Any` 类：

![包含 Any 类型的类层次结构示例](any-type-class.png){width="200"}

`Any` 类会自动提供 `toString()` 函数作为成员函数。因此，你可以在自己的任何类中使用这个继承而来的函数。例如：

```kotlin
class Car(val make: String, val model: String, val numberOfDoors: Int)

fun main() {
    //sampleStart
    val car1 = Car("Toyota", "Corolla", 4)

    // 通过字符串模板使用 .toString() 函数打印类属性
    println("Car1: make=${car1.make}, model=${car1.model}, numberOfDoors=${car1.numberOfDoors}")
    // Car1: make=Toyota, model=Corolla, numberOfDoors=4
    //sampleEnd
}
```
{kotlin-runnable="true" id="kotlin-tour-any-class"}

如果你想使用继承在类之间共享代码，首先请考虑使用抽象类。

### 抽象类 {id="abstract-classes"}

抽象类默认可以被继承。抽象类的目的是提供供其他类继承或实现的成员。因此，它们拥有构造函数，但你无法创建它们的实例。在子类中，可以使用 `override` 关键字来定义父类属性和函数的行为。通过这种方式，可以说子类“重写”了父类的成员。

> 当你为继承的函数或属性定义行为时，我们称之为**实现**。
> 
{style="tip"}

抽象类既可以包含**具有**实现的函数和属性，也可以包含**不具**实现的函数和属性（称为抽象函数和抽象属性）。

要创建抽象类，请使用 `abstract` 关键字：

```kotlin
abstract class Animal
```

要声明**没有**实现的函数或属性，同样使用 `abstract` 关键字：

```kotlin
abstract fun makeSound()
abstract val sound: String
```

例如，假设你想创建一个名为 `Product` 的抽象类，以便从中创建子类来定义不同的产品类别：

```kotlin
abstract class Product(val name: String, var price: Double) {
    // 产品类别的抽象属性
    abstract val category: String

    // 可由所有产品共享的函数
    fun productInfo(): String {
        return "Product: $name, Category: $category, Price: $price"
    }
}
```

在抽象类中：

* 构造函数有两个用于产品 `name` 和 `price` 的形参。
* 包含一个以字符串形式保存产品类别的抽象属性。
* 包含一个打印产品信息的函数。

我们来为电子产品创建一个子类。在为子类中的 `category` 属性定义实现之前，必须使用 `override` 关键字：

```kotlin
class Electronic(name: String, price: Double, val warranty: Int) : Product(name, price) {
    override val category = "Electronic"
}
```

`Electronic` 类：

* 继承自 `Product` 抽象类。
* 在构造函数中包含一个电子产品特有的额外形参：`warranty`。
* 重写了 `category` 属性以包含字符串 `"Electronic"`。

现在，你可以像这样使用这些类：

```kotlin
abstract class Product(val name: String, var price: Double) {
    // 产品类别的抽象属性
    abstract val category: String

    // 可由所有产品共享的函数
    fun productInfo(): String {
        return "Product: $name, Category: $category, Price: $price"
    }
}

class Electronic(name: String, price: Double, val warranty: Int) : Product(name, price) {
    override val category = "Electronic"
}

//sampleStart
fun main() {
    // 创建 Electronic 类的实例
    val laptop = Electronic(name = "Laptop", price = 1000.0, warranty = 2)

    println(laptop.productInfo())
    // Product: Laptop, Category: Electronic, Price: 1000.0
}
//sampleEnd
```
{kotlin-runnable="true" id="kotlin-tour-abstract-class"}

虽然抽象类以这种方式共享代码非常出色，但它们受到了限制，因为 Kotlin 中的类仅支持单继承。如果你需要从多个来源继承，请考虑使用接口。

## 接口 {id="interfaces"}

接口与类类似，但存在一些区别：

* 你无法创建接口的实例。它们没有构造函数或类头。
* 它们的函数和属性默认隐式可继承。在 Kotlin 中，我们称它们是“开放 (open)”的。
* 如果不为其提供实现，你不需要将它们的函数标记为 `abstract`。

与抽象类类似，你可以使用接口来定义一组供类后续继承和实现的函数和属性。这种方法有助于你专注于接口所描述的抽象，而不是具体的实现细节。使用接口可以使你的代码：

* 更具模块化，因为它隔离了不同部分，使它们能够独立演进。
* 更容易理解，因为它将相关函数归类为一个内聚的集合。
* 更容易测试，因为你可以快速将实现替换为用于测试的模拟实现。

要声明接口，请使用 `interface` 关键字：

```kotlin
interface PaymentMethod
```

### 接口实现 {id="interface-implementation"}

接口支持多继承，因此一个类可以同时实现多个接口。首先，我们来看一个类实现**一个**接口的场景。

要创建实现接口的类，请在类头后添加冒号，接着输入要实现的接口名称。接口名称后面不要使用圆括号 `()`，因为接口没有构造函数：

```kotlin
class CreditCardPayment : PaymentMethod
```

例如：

```kotlin
interface PaymentMethod {
    // 函数默认可继承
    fun initiatePayment(amount: Double): String
}

class CreditCardPayment(val cardNumber: String, val cardHolderName: String, val expiryDate: String) : PaymentMethod {
    override fun initiatePayment(amount: Double): String {
        // 模拟使用信用卡处理支付
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

在此示例中：

* `PaymentMethod` 是一个包含未实现函数 `initiatePayment()` 的接口。
* `CreditCardPayment` 是一个实现了 `PaymentMethod` 接口的类。
* `CreditCardPayment` 类重写了继承来的 `initiatePayment()` 函数。
* `paymentMethod` 是 `CreditCardPayment` 类的一个实例。
* 在 `paymentMethod` 实例上调用了重写的 `initiatePayment()` 函数，并传入实参 `100.0`。

要创建一个实现**多个**接口的类，请在类头后面添加冒号，接着输入要实现的各个接口的名称，并用逗号分隔：

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
        // 模拟使用信用卡处理支付
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

在此示例中：

* `PaymentMethod` 是一个包含未实现函数 `initiatePayment()` 的接口。
* `PaymentType` 是一个包含未初始化属性 `paymentType` 的接口。
* `CreditCardPayment` 是一个实现了 `PaymentMethod` 和 `PaymentType` 接口的类。
* `CreditCardPayment` 类重写了继承来的 `initiatePayment()` 函数和 `paymentType` 属性。
* `paymentMethod` 是 `CreditCardPayment` 类的一个实例。
* 在 `paymentMethod` 实例上调用了重写的 `initiatePayment()` 函数，并传入实参 `100.0`。
* 访问了 `paymentMethod` 实例上的重写属性 `paymentType`。

有关接口和接口继承的更多信息，请参阅[接口](interfaces.md)。

## 委托 {id="delegation"}

接口非常有用，但如果接口包含许多函数，其子类中可能会产生大量模板代码。如果你只想重写类的一小部分行为，就需要进行大量重复编写。

> 模板代码是指在软件项目的多个部分中几乎不作修改或完全不作修改地复用的一段代码。
> 
{style="tip"}

例如，假设你有一个名为 `DrawingTool` 的接口，其中包含若干函数和一个名为 `color` 的属性：

```kotlin
interface DrawingTool {
    val color: String
    fun draw(shape: String)
    fun erase(area: String)
    fun getToolInfo(): String
}
```

你创建了一个名为 `PenTool` 的类，该类实现了 `DrawingTool` 接口并为其所有成员提供了实现：

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

你想要创建一个类似于 `PenTool` 的类，具有相同的行为但具有不同的 `color` 值。一种方法是创建一个新类，该类接收一个实现了 `DrawingTool` 接口的对象作为形参（例如 `PenTool` 类的实例）。然后，在该类内部重写 `color` 属性。

但在此场景中，你需要为 `DrawingTool` 接口的每个成员都添加实现：

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

可以看到，如果 `DrawingTool` 接口中包含大量成员函数，那么 `CanvasSession` 类中的模板代码量将会非常可观。然而，还有另一种替代方案。

在 Kotlin 中，你可以使用 `by` 关键字将接口实现委托给一个类实例。例如：

```kotlin
class CanvasSession(val tool: DrawingTool) : DrawingTool by tool
```

在这里，`tool` 是接收成员函数实现委托的 `PenTool` 类实例的名称。

现在你无需在 `CanvasSession` 类中为成员函数添加实现。编译器会自动从 `PenTool` 类为你完成这项工作。这避免了编写大量模板代码。相反，你只需为你想要为子类更改的行为添加代码即可。

例如，如果你想要更改 `color` 属性的值：

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
    // 无模板代码！
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

如果需要，你也可以在 `CanvasSession` 类中重写继承的成员函数的行为，但现在你无需为每个继承的成员函数都添加新行代码。

要了解更多信息，请参阅[委托](delegation.md)。

## 练习 {completion-point="true" id="practice"}

<deflist appearance="clear" collapsible="true" numbered="true">
<def title="使用抽象类实现智能设备" id="classes-interfaces-exercise-1">

设想你正在开发一个智能家居系统。智能家居通常包含不同类型的设备，它们都具有一些基本功能，但也有各自独有的行为。在下面的代码示例中，补全名为 `SmartDevice` 的 `abstract` 类，以便子类 `SmartLight` 能够成功编译。

然后，创建另一个名为 `SmartThermostat` 的子类，该类继承自 `SmartDevice` 类并实现 `turnOn()` 和 `turnOff()` 函数，这些函数通过 print 语句输出描述哪个恒温器正在加热或已关闭。最后，添加另一个名为 `adjustTemperature()` 的函数，该函数接收温度测量值作为输入并打印：
`$name thermostat set to $temperature°C.`

<deflist collapsible="true">
    <def title="提示">
        在 <code>SmartDevice</code> 类中添加 <code>turnOn()</code> 和 <code>turnOff()</code> 函数，以便稍后可以在 <code>SmartThermostat</code> 类中重写它们的行为。
    </def>
</deflist>

```kotlin
abstract class // 在此处编写你的代码

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

class SmartThermostat // 在此处编写你的代码

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
{initial-collapse-state="collapsed" collapsible="true" collapsed-title="示例解决方案" id="kotlin-tour-classes-interfaces-solution-1"}

</def>
<def title="实现媒体接口" id="classes-interfaces-exercise-2">

创建一个名为 `Media` 的接口，以便用来实现具体的媒体类（例如 `Audio`、`Video` 或 `Podcast`）。你的接口必须包含：

* 名为 `title` 的属性，用于表示媒体的标题。
* 名为 `play()` 的函数，用于播放媒体。

然后，创建一个实现 `Media` 接口的类 `Audio`。`Audio` 类必须在其构造函数中使用 `title` 属性，并且还必须具有一个名为 `composer`、类型为 `String` 的额外属性。在该类中实现 `play()` 函数，以打印以下内容：`"Playing audio: $title, composed by $composer"`。

<deflist collapsible="true">
    <def title="提示">
        你可以在类头中使用 <code>override</code> 关键字在构造函数中实现接口中的属性。
    </def>
</deflist>

```kotlin
interface // 在此处编写你的代码

class // 在此处编写你的代码

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
{initial-collapse-state="collapsed" collapsible="true" collapsed-title="示例解决方案" id="kotlin-tour-classes-interfaces-solution-2"}

</def>
<def title="结合接口与抽象类" id="classes-interfaces-exercise-3">

你正在为一个电子商务应用程序构建支付处理系统。每种支付方式都需要能够对支付进行授权并处理交易。某些支付方式还需要能够处理退款。

1. 在 `Refundable` 接口中，添加一个名为 `refund()` 的函数来处理退款。

2. 在 `PaymentMethod` 抽象类中：
   * 添加一个名为 `authorize()` 的函数，该函数接收金额并打印一条包含该金额的消息。
   * 添加一个名为 `processPayment()` 的抽象函数，该函数同样接收金额。

3. 创建一个名为 `CreditCard` 的类，该类实现 `Refundable` 接口和 `PaymentMethod` 抽象类。在该类中，为 `refund()` 和 `processPayment()` 函数添加实现，使其打印以下语句：
   * `"Refunding $amount to the credit card."`
   * `"Processing credit card payment of $amount."`

```kotlin
interface Refundable {
    // 在此处编写你的代码
}

abstract class PaymentMethod(val name: String) {
    // 在此处编写你的代码
}

class CreditCard // 在此处编写你的代码

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
{initial-collapse-state="collapsed" collapsible="true" collapsed-title="示例解决方案" id="kotlin-tour-classes-interfaces-solution-3"}

</def>
<def title="通过接口委托自定义行为" id="classes-interfaces-exercise-4">

你拥有一个具有基本功能的简易消息应用，但你想为“智能 (smart)”消息添加一些功能，同时又不想大量重复代码。

在下面的代码中，定义一个名为 `SmartMessenger` 的类，该类继承自 `Messenger` 接口，但将实现委托给 `BasicMessenger` 类的一个实例。

在 `SmartMessenger` 类中，重写 `sendMessage()` 函数以发送智能消息。该函数必须接收 `message` 作为输入并输出打印语句：`"Sending a smart message: $message"`。此外，调用 `BasicMessenger` 类中的 `sendMessage()` 函数，并在消息前添加前缀 `[smart]`。

> 你不需要在 `SmartMessenger` 类中重写 `receiveMessage()` 函数。
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

class SmartMessenger // 在此处编写你的代码

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
{initial-collapse-state="collapsed" collapsible="true" collapsed-title="示例解决方案" id="kotlin-tour-classes-interfaces-solution-4"}

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