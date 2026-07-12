[//]: # (title: 对象)

<no-index/>

在本章节中，你将通过探索对象声明来扩展你对类的理解。这些知识将帮助你在项目中高效地管理行为。

## 对象声明

在 Kotlin 中，你可以使用**对象声明**来声明一个具有单个实例的类。从某种意义上说，你在声明类的同时创建了该类的唯一实例。当你想要创建一个类作为程序的单一引用点，或者用于协调系统内的行为时，对象声明非常有用。

> 只有一个实例且易于访问的类被称为**单例**。
>
{style="tip"}

Kotlin 中的对象是**延迟**创建的，这意味着它们仅在被访问时才会被创建。Kotlin 还确保所有对象的创建都是线程安全的，因此你无需手动进行检查。

要创建一个对象声明，请使用 `object` 关键字：

```kotlin
object DoAuth {}
```

在 `object` 的名称之后，在由花括号 `{}` 定义的对象主体内添加任何属性或成员函数。

> 对象不能拥有构造函数，因此它们不像类那样拥有类头。
>
{style="note"}

例如，假设你想要创建一个名为 `DoAuth` 的对象，负责身份验证：

```kotlin
object DoAuth {
    fun takeParams(username: String, password: String) {
        println("input Auth parameters = $username:$password")
    }
}

fun main(){
    // 对象在调用 takeParams() 函数时被创建
    DoAuth.takeParams("coding_ninja", "N1njaC0ding!")
    // input Auth parameters = coding_ninja:N1njaC0ding!
}
```
{kotlin-runnable="true" id="kotlin-tour-object-declarations"}

该对象有一个名为 `takeParams` 的成员函数，它接受 `username` 和 `password` 变量作为形参，并将一个字符串打印到控制台。`DoAuth` 对象仅在函数首次被调用时才会被创建。

> 对象可以继承自类和接口。例如：
> 
> ```kotlin
> interface Auth {
>     fun takeParams(username: String, password: String)
> }
>
> object DoAuth : Auth {
>     override fun takeParams(username: String, password: String) {
>         println("input Auth parameters = $username:$password")
>     }
> }
> ```
>
{style="note"}

#### 数据对象

为了更方便地打印对象声明的内容，Kotlin 提供了**数据**对象。类似于你在初级教程中学到的数据类，数据对象会自动带有额外的成员函数：`toString()` 和 `equals()`。

> 与数据类不同，数据对象不会自动带有 `copy()` 成员函数，因为它们只有一个实例，无法被复制。
>
{type ="note"}

要创建一个数据对象，请使用与对象声明相同的语法，但要加上 `data` 关键字前缀：

```kotlin
data object AppConfig {}
```

例如：

```kotlin
data object AppConfig {
    var appName: String = "My Application"
    var version: String = "1.0.0"
}

fun main() {
    println(AppConfig)
    // AppConfig
    
    println(AppConfig.appName)
    // My Application
}
```
{kotlin-runnable="true" id="kotlin-tour-data-objects"}

有关数据对象的更多信息，请参阅 [](object-declarations.md#data-objects)。

#### 伴生对象

在 Kotlin 中，类可以拥有一个对象：**伴生**对象。每个类只能拥有**一个**伴生对象。伴生对象仅在首次引用其所属类时才会被创建。

在伴生对象内部声明的任何属性或函数都会在所有类实例之间共享。

要在类中创建伴生对象，请使用与对象声明相同的语法，但要加上 `companion` 关键字前缀：

```kotlin
companion object Bonger {}
```

> 伴生对象不一定非要有名称。如果你不定义名称，默认名称为 `Companion`。
> 
{style="note"}

要访问伴生对象的任何属性或函数，请引用类名。例如：

```kotlin
class BigBen {
    companion object Bonger {
        fun getBongs(nTimes: Int) {
            repeat(nTimes) { print("BONG ") }
            }
        }
    }

fun main() {
    // 伴生对象在类首次被引用时创建。
    BigBen.getBongs(12)
    // BONG BONG BONG BONG BONG BONG BONG BONG BONG BONG BONG BONG 
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3" id="kotlin-tour-classes-companion-object"}

此示例创建了一个名为 `BigBen` 的类，其中包含一个名为 `Bonger` 的伴生对象。该伴生对象有一个名为 `getBongs()` 的成员函数，它接受一个整数，并向控制台打印与该整数相同次数的 `"BONG"`。

在 `main()` 函数中，通过引用类名来调用 `getBongs()` 函数。伴生对象在此刻被创建。`getBongs()` 函数以实参 `12` 被调用。

欲了解更多信息，请参阅 [](object-declarations.md#companion-objects)。

## 练习 {completion-point="true"}

### 习题 1 {initial-collapse-state="collapsed" collapsible="true" id="objects-exercise-1"}

你经营着一家咖啡店，并拥有一套用于跟踪客户订单的系统。请参考下面的代码，完成第二个数据对象的声明，以便 `main()` 函数中的后续代码能成功运行：

|---|---|

```kotlin
interface Order {
    val orderId: String
    val customerName: String
    val orderTotal: Double
}

data object OrderOne: Order {
    override val orderId = "001"
    override val customerName = "Alice"
    override val orderTotal = 15.50
}

data object // 在此处编写你的代码

fun main() {
    // 打印每个数据对象的名称
    println("Order name: $OrderOne")
    // Order name: OrderOne
    println("Order name: $OrderTwo")
    // Order name: OrderTwo

    // 检查订单是否完全相同
    println("Are the two orders identical? ${OrderOne == OrderTwo}")
    // Are the two orders identical? false

    if (OrderOne == OrderTwo) {
        println("The orders are identical.")
    } else {
        println("The orders are unique.")
        // The orders are unique.
    }

    println("Do the orders have the same customer name? ${OrderOne.customerName == OrderTwo.customerName}")
    // Do the orders have the same customer name? false
}
```
{validate="false" kotlin-runnable="true" kotlin-min-compiler-version="1.3" id="kotlin-tour-objects-exercise-1"}

|---|---|
```kotlin
interface Order {
    val orderId: String
    val customerName: String
    val orderTotal: Double
}

data object OrderOne: Order {
    override val orderId = "001"
    override val customerName = "Alice"
    override val orderTotal = 15.50
}

data object OrderTwo: Order {
    override val orderId = "002"
    override val customerName = "Bob"
    override val orderTotal = 12.75
}

fun main() {
    // 打印每个数据对象的名称
    println("Order name: $OrderOne")
    // Order name: OrderOne
    println("Order name: $OrderTwo")
    // Order name: OrderTwo

    // 检查订单是否完全相同
    println("Are the two orders identical? ${OrderOne == OrderTwo}")
    // Are the two orders identical? false

    if (OrderOne == OrderTwo) {
        println("The orders are identical.")
    } else {
        println("The orders are unique.")
        // The orders are unique.
    }

    println("Do the orders have the same customer name? ${OrderOne.customerName == OrderTwo.customerName}")
    // Do the orders have the same customer name? false
}
```
{initial-collapse-state="collapsed" collapsible="true" collapsed-title="示例解决方案" id="kotlin-tour-objects-solution-1"}

### 习题 2 {initial-collapse-state="collapsed" collapsible="true" id="objects-exercise-2"}

创建一个继承自 `Vehicle` 接口的对象声明，以创建一个独特的载具类型：`FlyingSkateboard`。在你的对象中实现 `name` 属性和 `move()` 函数，以便 `main()` 函数中的后续代码能成功运行：

|---|---|

```kotlin
interface Vehicle {
    val name: String
    fun move(): String
}

object // 在此处编写你的代码

fun main() {
    println("${FlyingSkateboard.name}: ${FlyingSkateboard.move()}")
    // Flying Skateboard: Glides through the air with a hover engine
    println("${FlyingSkateboard.name}: ${FlyingSkateboard.fly()}")
    // Flying Skateboard: Woooooooo
}
```
{validate="false" kotlin-runnable="true" kotlin-min-compiler-version="1.3" id="kotlin-tour-objects-exercise-2"}

|---|---|
```kotlin
interface Vehicle {
    val name: String
    fun move(): String
}

object FlyingSkateboard : Vehicle {
    override val name = "Flying Skateboard"
    override fun move() = "Glides through the air with a hover engine"

   fun fly(): String = "Woooooooo"
}

fun main() {
    println("${FlyingSkateboard.name}: ${FlyingSkateboard.move()}")
    // Flying Skateboard: Glides through the air with a hover engine
    println("${FlyingSkateboard.name}: ${FlyingSkateboard.fly()}")
    // Flying Skateboard: Woooooooo
}
```
{initial-collapse-state="collapsed" collapsible="true" collapsed-title="示例解决方案" id="kotlin-tour-objects-solution-2"}

### 习题 3 {initial-collapse-state="collapsed" collapsible="true" id="objects-exercise-3"}

你有一个应用需要记录温度。该类本身以摄氏度存储信息，但你希望提供一种也能够以华氏度创建实例的简便方法。完成该数据类，以便 `main()` 函数中的后续代码能成功运行：

<deflist collapsible="true">
    <def title="提示">
        使用伴生对象。
    </def>
</deflist>

|---|---|
```kotlin
data class Temperature(val celsius: Double) {
    val fahrenheit: Double = celsius * 9 / 5 + 32

    // 在此处编写你的代码
}

fun main() {
    val fahrenheit = 90.0
    val temp = Temperature.fromFahrenheit(fahrenheit)
    println("${temp.celsius}°C is $fahrenheit °F")
    // 32.22222222222222°C is 90.0 °F
}
```
{validate="false" kotlin-runnable="true" kotlin-min-compiler-version="1.3" id="kotlin-tour-objects-exercise-3"}

|---|---|
```kotlin
data class Temperature(val celsius: Double) {
    val fahrenheit: Double = celsius * 9 / 5 + 32

    companion object {
        fun fromFahrenheit(fahrenheit: Double): Temperature = Temperature((fahrenheit - 32) * 5 / 9)
    }
}

fun main() {
    val fahrenheit = 90.0
    val temp = Temperature.fromFahrenheit(fahrenheit)
    println("${temp.celsius}°C is $fahrenheit °F")
    // 32.22222222222222°C is 90.0 °F
}
```
{initial-collapse-state="collapsed" collapsible="true" collapsed-title="示例解决方案" id="kotlin-tour-objects-solution-3"}

<seealso></seealso>

<list columns="2" id="tour-nav">
  <li>
    <a as="button" href="kotlin-tour-intermediate-classes-interfaces.md" mode="outline" icon="arrow-left" icon-position="left">上一步</a>
  </li>
  <li>
    <a as="button" href="kotlin-tour-intermediate-open-special-classes.md" mode="classic" icon="arrow-right" icon-position="right">下一步</a>
  </li>
</list>