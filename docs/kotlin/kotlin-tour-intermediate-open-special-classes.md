[//]: # (title: open 类与特殊类)

<no-index/>

在本章中，您将学习 open 类、它们如何与接口配合使用，以及 Kotlin 中提供的其他特殊类型的类。

## open 类

如果无法使用接口或抽象类，可以通过将类声明为 **open** 来显式使其可继承。
为此，请在类声明之前使用 `open` 关键字：

```kotlin
open class Vehicle(val make: String, val model: String)
```

要创建一个继承自另一个类的类，请在类标头后添加冒号，然后调用要继承的父类的构造函数。在这个示例中，`Car` 类继承自 `Vehicle` 类：

```kotlin
open class Vehicle(val make: String, val model: String)

class Car(make: String, model: String, val numberOfDoors: Int) : Vehicle(make, model)

fun main() {
    // 创建 Car 类的实例
    val car = Car("Toyota", "Corolla", 4)

    // 打印汽车的详细信息
    println("Car Info: Make - ${car.make}, Model - ${car.model}, Number of doors - ${car.numberOfDoors}")
    // Car Info: Make - Toyota, Model - Corolla, Number of doors - 4
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3" id="kotlin-tour-classes-open-class"}

就像创建普通类实例时一样，如果您的类继承自父类，那么它必须初始化父类标头中声明的所有形参。因此在示例中，`Car` 类的 `car` 实例初始化了父类形参：`make` 和 `model`。

### 重写继承的行为

如果您想继承一个类但更改其中的某些行为，您可以重写继承的行为。

默认情况下，无法重写父类的成员函数或属性。与抽象类一样，您需要添加特殊的关键字。

#### 成员函数

要允许父类中的函数被重写，请在父类中的函数声明前使用 `open` 关键字：

```kotlin
open fun displayInfo() {}
```
{validate="false"}

要重写继承的成员函数，请在子类中的函数声明前使用 `override` 关键字：

```kotlin
override fun displayInfo() {}
```
{validate="false"}

例如：

```kotlin
open class Vehicle(val make: String, val model: String) {
    open fun displayInfo() {
        println("Vehicle Info: Make - $make, Model - $model")
    }
}

class Car(make: String, model: String, val numberOfDoors: Int) : Vehicle(make, model) {
    override fun displayInfo() {
        println("Car Info: Make - $make, Model - $model, Number of Doors - $numberOfDoors")
    }
}

fun main() {
    val car1 = Car("Toyota", "Corolla", 4)
    val car2 = Car("Honda", "Civic", 2)

    // 使用重写的 displayInfo() 函数
    car1.displayInfo()
    // Car Info: Make - Toyota, Model - Corolla, Number of Doors - 4
    car2.displayInfo()
    // Car Info: Make - Honda, Model - Civic, Number of Doors - 2
}
```
{kotlin-runnable="true" id="kotlin-tour-class-override-function"}

此示例：

* 创建了两个继承自 `Vehicle` 类的 `Car` 类实例：`car1` 和 `car2`。
* 在 `Car` 类中重写了 `displayInfo()` 函数，以同时打印车门数量。
* 在 `car1` 和 `car2` 实例上调用重写的 `displayInfo()` 函数。

#### 属性

在 Kotlin 中，使用 `open` 关键字使属性可继承并在以后重写它并不是常见的做法。大多数情况下，您会使用抽象类或接口，其中的属性默认是可继承的。

open 类内部的属性可以被其子类访问。通常情况下，直接访问它们比使用新属性重写它们更好。

例如，假设您有一个名为 `transmissionType` 的属性，您想稍后重写它。重写属性的语法与重写成员函数的语法完全相同。您可以这样做：

```kotlin
open class Vehicle(val make: String, val model: String) {
    open val transmissionType: String = "Manual"
}

class Car(make: String, model: String, val numberOfDoors: Int) : Vehicle(make, model) {
    override val transmissionType: String = "Automatic"
}
```

然而，这不是好的做法。相反，您可以将该属性添加到可继承类的构造函数中，并在创建 `Car` 子类时声明其值：

```kotlin
open class Vehicle(val make: String, val model: String, val transmissionType: String = "Manual")

class Car(make: String, model: String, val numberOfDoors: Int) : Vehicle(make, model, "Automatic")
```

直接访问属性，而不是重写它们，可以使代码更简单、更具可读性。通过在父类中声明一次属性并通过构造函数传递它们的值，您消除了子类中不必要的重写需求。

有关类继承和重写类行为的更多信息，请参阅 [继承](inheritance.md)。

### open 类与接口

您可以创建一个继承一个类 **并** 实现多个接口的类。在这种情况下，您必须在冒号之后先声明父类，然后再列出接口：

```kotlin
// 定义接口
interface EcoFriendly {
    val emissionLevel: String
}

interface ElectricVehicle {
    val batteryCapacity: Double
}

// 父类
open class Vehicle(val make: String, val model: String)

// 子类
open class Car(make: String, model: String, val numberOfDoors: Int) : Vehicle(make, model)

// 继承自 Car 并实现两个接口的新类
class ElectricCar(
    make: String,
    model: String,
    numberOfDoors: Int,
    val capacity: Double,
    val emission: String
) : Car(make, model, numberOfDoors), EcoFriendly, ElectricVehicle {
    override val batteryCapacity: Double = capacity
    override val emissionLevel: String = emission
}
```

## 特殊类

除了抽象类、open 类和数据类之外，Kotlin 还有为各种目的设计的特殊类型的类，例如限制特定行为或减少创建小对象的性能影响。

### 密封类

有时您可能想要限制继承。您可以使用密封类来实现这一点。密封类是一种特殊类型的 [抽象类](kotlin-tour-intermediate-classes-interfaces.md#abstract-classes)。一旦您声明一个类是密封的，您只能在同一个软件包内创建它的子类。在此作用域之外继承密封类是不可能的。

> 软件包是具有相关类和函数的代码集合，通常位于一个目录中。要详细了解 Kotlin 中的软件包，请参阅 [软件包与导入](packages.md)。
> 
{style="tip"}

要创建密封类，请使用 `sealed` 关键字：

```kotlin
sealed class Mammal
```

当与 `when` 表达式结合使用时，密封类特别有用。通过使用 `when` 表达式，您可以为所有可能的子类定义行为。例如：

```kotlin
sealed class Mammal(val name: String)

class Cat(val catName: String) : Mammal(catName)
class Human(val humanName: String, val job: String) : Mammal(humanName)

fun greetMammal(mammal: Mammal): String {
    when (mammal) {
        is Human -> return "Hello ${mammal.name}; You're working as a ${mammal.job}"
        is Cat -> return "Hello ${mammal.name}"   
    }
}

fun main() {
    println(greetMammal(Cat("Snowy")))
    // Hello Snowy
}
```
{kotlin-runnable="true" id="kotlin-tour-sealed-classes"}

在此示例中：

* 有一个名为 `Mammal` 的密封类，其构造函数中包含 `name` 形参。
* `Cat` 类继承自 `Mammal` 密封类，并在其自己的构造函数中使用 `catName` 形参作为 `Mammal` 类的 `name` 形参。
* `Human` 类继承自 `Mammal` 密封类，并在其自己的构造函数中使用 `humanName` 形参作为 `Mammal` 类的 `name` 形参。它的构造函数中还有一个 `job` 形参。
* `greetMammal()` 函数接收 `Mammal` 类型的实参并返回一个字符串。
* 在 `greetMammal()` 函数体内，有一个 `when` 表达式，它使用 [`is` 运算符](typecasts.md#is-and-is-operators) 来检查 `mammal` 的类型并决定执行哪个操作。
* `main()` 函数调用 `greetMammal()` 函数，传入一个 `Cat` 类实例和名为 `Snowy` 的 `name` 形参。

> 本教程在 [空安全](kotlin-tour-intermediate-null-safety.md) 章节中更详细地讨论了 `is` 运算符。
> 
{style ="tip"}

有关密封类及其推荐用例的更多信息，请参阅 [密封类与接口](sealed-classes.md)。

### 枚举类

当您想在类中表示有限的一组不同值时，枚举类非常有用。枚举类包含枚举常量，它们本身就是枚举类的实例。

要创建枚举类，请使用 `enum` 关键字：

```kotlin
enum class State
```

假设您想创建一个包含进程不同状态的枚举类。每个枚举常量必须用逗号 `,` 分隔：

```kotlin
enum class State {
    IDLE, RUNNING, FINISHED
}
```

`State` 枚举类具有枚举常量：`IDLE`、`RUNNING` 和 `FINISHED`。要访问枚举常量，请使用类名，后跟 `.` 和枚举常量的名称：

```kotlin
val state = State.RUNNING
```

您可以将此枚举类与 `when` 表达式结合使用，根据枚举常量的值定义要采取的操作：

```kotlin
enum class State {
    IDLE, RUNNING, FINISHED
}

fun main() {
    val state = State.RUNNING
    val message = when (state) {
        State.IDLE -> "It's idle"
        State.RUNNING -> "It's running"
        State.FINISHED -> "It's finished"
    }
    println(message)
    // It's running
}
```
{kotlin-runnable="true" id="kotlin-tour-enum-classes"}

枚举类可以像普通类一样拥有属性和成员函数。

例如，假设您正在处理 HTML，并且想要创建一个包含某些颜色的枚举类。您希望每种颜色都有一个属性，我们称之为 `rgb`，它包含它们的十六进制 RGB 值。创建枚举常量时，必须使用此属性对其进行初始化：

```kotlin
enum class Color(val rgb: Int) {
    RED(0xFF0000),
    GREEN(0x00FF00),
    BLUE(0x0000FF),
    YELLOW(0xFFFF00)
}
```

> Kotlin 将十六进制存储为整数，因此 `rgb` 属性的类型是 `Int`，而不是 `String` 类型。
>
{style="note"}

要向此类添加成员函数，请使用分号 `;` 将其与枚举常量分隔开：

```kotlin
enum class Color(val rgb: Int) {
    RED(0xFF0000),
    GREEN(0x00FF00),
    BLUE(0x0000FF),
    YELLOW(0xFFFF00);

    fun containsRed() = (this.rgb and 0xFF0000 != 0)
}

fun main() {
    val red = Color.RED
    
    // 在枚举常量上调用 containsRed() 函数
    println(red.containsRed())
    // true

    // 通过类名在枚举常量上调用 containsRed() 函数
    println(Color.BLUE.containsRed())
    // false
  
    println(Color.YELLOW.containsRed())
    // true
}
```
{kotlin-runnable="true" id="kotlin-tour-interface-enum-classes-members"}

在这个示例中，`containsRed()` 成员函数使用 `this` 关键字访问枚举常量的 `rgb` 属性的值，并检查十六进制值的第一位是否包含 `FF`，以返回一个布尔值。

有关更多信息，请参阅 [枚举类](enum-classes.md)。

### 内联值类

有时在代码中，您可能希望从类中创建小对象并仅短暂使用它们。这种做法可能会对性能产生影响。内联值类是一种特殊类型的类，可以避免这种性能影响。但是，它们只能包含值。

要创建内联值类，请使用 `value` 关键字和 `@JvmInline` 注解：

```kotlin
@JvmInline
value class Email
```

> `@JvmInline` 注解指示 Kotlin 在编译代码时对其进行优化。要了解更多信息，请参阅 [注解](annotations.md)。
> 
{style="tip"}

内联值类 **必须** 在类标头中初始化单个属性。

假设您想创建一个收集电子邮件地址的类：

```kotlin
// address 属性在类标头中初始化。
@JvmInline
value class Email(val address: String)

fun sendEmail(email: Email) {
    println("Sending email to ${email.address}")
}

fun main() {
    val myEmail = Email("example@example.com")
    sendEmail(myEmail)
    // Sending email to example@example.com
}
```
{kotlin-runnable="true" id="kotlin-tour-inline-value-class"}

在此示例中：

* `Email` 是一个内联值类，在类标头中有一个属性：`address`。
* `sendEmail()` 函数接收 `Email` 类型的对象，并将一个字符串打印到标准输出。
* `main()` 函数：
    * 创建了一个名为 `myEmail` 的 `Email` 类实例。
    * 在 `myEmail` 对象上调用 `sendEmail()` 函数。

通过使用内联值类，您可以使类内联，并可以直接在代码中使用它而无需创建对象。这可以显著减少内存占用并提高代码的运行时性能。

有关内联值类的更多信息，请参阅 [内联值类](inline-classes.md)。

## 练习 {completion-point="true"}

### 练习 1 {initial-collapse-state="collapsed" collapsible="true" id="special-classes-exercise-1"}

您管理着一家快递服务公司，需要一种方法来跟踪包裹的状态。创建一个名为 `DeliveryStatus` 的密封类，其中包含表示以下状态的数据类：`Pending`、`InTransit`、`Delivered`、`Canceled`。完成 `DeliveryStatus` 类的声明，使 `main()` 函数中的代码能够成功运行：

|---|---|

```kotlin
sealed class // 在此处编写您的代码

fun printDeliveryStatus(status: DeliveryStatus) {
    when (status) {
        is DeliveryStatus.Pending -> {
            println("The package is pending pickup from ${status.sender}.")
        }
        is DeliveryStatus.InTransit -> {
            println("The package is in transit and expected to arrive by ${status.estimatedDeliveryDate}.")
        }
        is DeliveryStatus.Delivered -> {
            println("The package was delivered to ${status.recipient} on ${status.deliveryDate}.")
        }
        is DeliveryStatus.Canceled -> {
            println("The delivery was canceled due to: ${status.reason}.")
        }
    }
}

fun main() {
    val status1: DeliveryStatus = DeliveryStatus.Pending("Alice")
    val status2: DeliveryStatus = DeliveryStatus.InTransit("2024-11-20")
    val status3: DeliveryStatus = DeliveryStatus.Delivered("2024-11-18", "Bob")
    val status4: DeliveryStatus = DeliveryStatus.Canceled("Address not found")

    printDeliveryStatus(status1)
    // The package is pending pickup from Alice.
    printDeliveryStatus(status2)
    // The package is in transit and expected to arrive by 2024-11-20.
    printDeliveryStatus(status3)
    // The package was delivered to Bob on 2024-11-18.
    printDeliveryStatus(status4)
    // The delivery was canceled due to: Address not found.
}
```
{validate="false" kotlin-runnable="true" kotlin-min-compiler-version="1.3" id="kotlin-tour-special-classes-exercise-1"}

|---|---|
```kotlin
sealed class DeliveryStatus {
    data class Pending(val sender: String) : DeliveryStatus()
    data class InTransit(val estimatedDeliveryDate: String) : DeliveryStatus()
    data class Delivered(val deliveryDate: String, val recipient: String) : DeliveryStatus()
    data class Canceled(val reason: String) : DeliveryStatus()
}

fun printDeliveryStatus(status: DeliveryStatus) {
    when (status) {
        is DeliveryStatus.Pending -> {
            println("The package is pending pickup from ${status.sender}.")
        }
        is DeliveryStatus.InTransit -> {
            println("The package is in transit and expected to arrive by ${status.estimatedDeliveryDate}.")
        }
        is DeliveryStatus.Delivered -> {
            println("The package was delivered to ${status.recipient} on ${status.deliveryDate}.")
        }
        is DeliveryStatus.Canceled -> {
            println("The delivery was canceled due to: ${status.reason}.")
        }
    }
}

fun main() {
    val status1: DeliveryStatus = DeliveryStatus.Pending("Alice")
    val status2: DeliveryStatus = DeliveryStatus.InTransit("2024-11-20")
    val status3: DeliveryStatus = DeliveryStatus.Delivered("2024-11-18", "Bob")
    val status4: DeliveryStatus = DeliveryStatus.Canceled("Address not found")

    printDeliveryStatus(status1)
    // The package is pending pickup from Alice.
    printDeliveryStatus(status2)
    // The package is in transit and expected to arrive by 2024-11-20.
    printDeliveryStatus(status3)
    // The package was delivered to Bob on 2024-11-18.
    printDeliveryStatus(status4)
    // The delivery was canceled due to: Address not found.
}
```
{initial-collapse-state="collapsed" collapsible="true" collapsed-title="示例解法" id="kotlin-tour-special-classes-solution-1"}

### 练习 2 {initial-collapse-state="collapsed" collapsible="true" id="special-classes-exercise-2"}

在您的程序中，您希望能够处理不同的状态和错误类型。您有一个密封类来捕获数据类或对象中声明的不同状态。通过创建一个名为 `Problem` 的枚举类来完成下面的代码，该枚举类表示不同的问题类型：`NETWORK`、`TIMEOUT` 和 `UNKNOWN`。

|---|---|

```kotlin
sealed class Status {
    data object Loading : Status()
    data class Error(val problem: Problem) : Status() {
        // 在此处编写您的代码
    }

    data class OK(val data: List<String>) : Status()
}

fun handleStatus(status: Status) {
    when (status) {
        is Status.Loading -> println("Loading...")
        is Status.OK -> println("Data received: ${status.data}")
        is Status.Error -> when (status.problem) {
            Status.Error.Problem.NETWORK -> println("Network issue")
            Status.Error.Problem.TIMEOUT -> println("Request timed out")
            Status.Error.Problem.UNKNOWN -> println("Unknown error occurred")
        }
    }
}

fun main() {
    val status1: Status = Status.Error(Status.Error.Problem.NETWORK)
    val status2: Status = Status.OK(listOf("Data1", "Data2"))

    handleStatus(status1)
    // Network issue
    handleStatus(status2)
    // Data received: [Data1, Data2]
}
```
{validate="false" kotlin-runnable="true" kotlin-min-compiler-version="1.3" id="kotlin-tour-special-classes-exercise-2"}

|---|---|
```kotlin
sealed class Status {
    data object Loading : Status()
    data class Error(val problem: Problem) : Status() {
        enum class Problem {
            NETWORK,
            TIMEOUT,
            UNKNOWN
        }
    }

    data class OK(val data: List<String>) : Status()
}

fun handleStatus(status: Status) {
    when (status) {
        is Status.Loading -> println("Loading...")
        is Status.OK -> println("Data received: ${status.data}")
        is Status.Error -> when (status.problem) {
            Status.Error.Problem.NETWORK -> println("Network issue")
            Status.Error.Problem.TIMEOUT -> println("Request timed out")
            Status.Error.Problem.UNKNOWN -> println("Unknown error occurred")
        }
    }
}

fun main() {
    val status1: Status = Status.Error(Status.Error.Problem.NETWORK)
    val status2: Status = Status.OK(listOf("Data1", "Data2"))

    handleStatus(status1)
    // Network issue
    handleStatus(status2)
    // Data received: [Data1, Data2]
}
```
{initial-collapse-state="collapsed" collapsible="true" collapsed-title="示例解法" id="kotlin-tour-special-classes-solution-2"}

<seealso></seealso>

<list columns="2" id="tour-nav">
  <li>
    <a as="button" href="kotlin-tour-intermediate-objects.md" mode="outline" icon="arrow-left" icon-position="left">上一步</a>
  </li>
  <li>
    <a as="button" href="kotlin-tour-intermediate-properties.md" mode="classic" icon="arrow-right" icon-position="right">下一步</a>
  </li>
</list>