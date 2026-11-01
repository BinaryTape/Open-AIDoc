[//]: # (title: 对象)

<no-index/>

在本章中，你将通过探索对象声明来扩展对类的理解。这些知识将帮助你在项目中高效地管理行为。

## 对象声明 {id="object-declarations"}

在 Kotlin 中，你可以使用**对象声明**（object declaration）来声明一个只有一个实例的类。在某种意义上，你是在*同一时间*声明了该类并创建了该单一实例。当你希望创建一个类作为程序的唯一定位引用点，或者在系统各处协调行为时，对象声明非常有用。

> 只有一个实例且易于访问的类被称为**单例**（singleton）。
>
{style="tip"}

Kotlin 中的对象是**延迟加载**（lazy）的，这意味着它们仅在被访问时才会被创建。Kotlin 还会确保所有对象都以线程安全的方式创建，因此你无需手动进行检查。

要创建对象声明，请使用 `object` 关键字：

```kotlin
object DoAuth {}
```

紧跟在 `object` 的名称之后，可以在花括号 `{}` 定义的对象体内部添加任何属性或成员函数。

> 对象不能拥有构造函数，因此它们不像类那样具有类头。
>
{style="note"}

例如，假设你想创建一个名为 `DoAuth` 的对象来负责身份验证：

```kotlin
object DoAuth {
    fun takeParams(username: String, password: String) {
        println("input Auth parameters = $username:$password")
    }
}

fun main(){
    // 当调用 takeParams() 函数时，该对象被创建
    DoAuth.takeParams("coding_ninja", "N1njaC0ding!")
    // input Auth parameters = coding_ninja:N1njaC0ding!
}
```
{kotlin-runnable="true" id="kotlin-tour-object-declarations"}

该对象有一个名为 `takeParams` 的成员函数，它接受 `username` 和 `password` 变量作为形参，并将字符串打印到控制台。`DoAuth` 对象仅在首次调用该函数时才会被创建。

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

#### 数据对象 {id="data-objects"}

为了更轻松地打印对象声明的内容，Kotlin 提供了**数据**对象（data object）。与你在初级教程中了解到的数据类类似，数据对象会自动附带额外的成员函数：`toString()` 和 `equals()`。

> 与数据类不同，数据对象不会自动附带 `copy()` 成员函数，因为它们只有一个实例，无法进行复制。
>
{type ="note"}

要创建数据对象，请使用与对象声明相同的语法，但在其前面加上 `data` 关键字前缀：

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

#### 伴生对象 {id="companion-objects"}

在 Kotlin 中，类可以包含一个对象：**伴生**对象（companion object）。每个类只能有**一个**伴生对象。伴生对象仅在其所属的类被首次引用时才会被创建。

在伴生对象内部声明的所有属性或函数都将在该类的所有实例之间共享。

要在类中创建伴生对象，请使用与对象声明相同的语法，但在其前面加上 `companion` 关键字前缀：

```kotlin
companion object Bonger {}
```

> 伴生对象不一定需要有名称。如果未定义名称，则默认名称为 `Companion`。
> 
{style="note"}

要访问伴生对象的任何属性或函数，请引用该类名。例如：

```kotlin
class BigBen {
    companion object Bonger {
        fun getBongs(nTimes: Int) {
            repeat(nTimes) { print("BONG ") }
            }
        }
    }

fun main() {
    // 伴生对象在类被首次引用时创建。
    BigBen.getBongs(12)
    // BONG BONG BONG BONG BONG BONG BONG BONG BONG BONG BONG BONG 
}
```
{kotlin-runnable="true" id="kotlin-tour-classes-companion-object"}

此示例创建了一个名为 `BigBen` 的类，其中包含一个名为 `Bonger` 的伴生对象。该伴生对象具有一个名为 `getBongs()` 的成员函数，该函数接受一个整数，并在控制台上打印与该整数相同次数的 `"BONG"`。

在 `main()` 函数中，通过引用类名来调用 `getBongs()` 函数。伴生对象即在此处被创建。调用 `getBongs()` 函数时传入了实参 `12`。

要了解更多信息，请参阅 [](object-declarations.md#companion-objects)。

## 练习 {completion-point="true" id="practice"}

<deflist appearance="clear" collapsible="true" numbered="true">
<def title="实现一个用于订单跟踪的数据对象" id="objects-exercise-1">

你经营着一家咖啡店，并且拥有一套用于跟踪客户订单的系统。请参考下面的代码并补全第二个数据对象的声明，以便 `main()` 函数中的以下代码可以成功运行：

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
{kotlin-runnable="true" kotlin-target-platform="exercise" kotlin-hidden-files="ExerciseUtils.kt,tour/intermediate/OrderTwoTest.kt" validate="false" id="kotlin-tour-objects-exercise-1"}

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
{kotlin-runnable="true" kotlin-target-platform="exercise" kotlin-hidden-files="ExerciseUtils.kt,tour/intermediate/OrderTwoTest.kt" initial-collapse-state="collapsed" collapsible="true" collapsed-title="参考答案" id="kotlin-tour-objects-solution-1"}

</def>
<def title="创建对象声明" id="objects-exercise-2">

创建一个继承自 `Vehicle` 接口的对象声明，以实现一种独特的载具类型：`FlyingSkateboard`。在你的对象中实现 `name` 属性和 `move()` 函数，以便 `main()` 函数中的以下代码可以成功运行：

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
{kotlin-runnable="true" kotlin-target-platform="exercise" kotlin-hidden-files="ExerciseUtils.kt,tour/intermediate/FlyingSkateboardTest.kt" validate="false" id="kotlin-tour-objects-exercise-2"}

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
{kotlin-runnable="true" kotlin-target-platform="exercise" kotlin-hidden-files="ExerciseUtils.kt,tour/intermediate/FlyingSkateboardTest.kt" initial-collapse-state="collapsed" collapsible="true" collapsed-title="参考答案" id="kotlin-tour-objects-solution-2"}

</def>
<def title="在创建用户前验证电子邮件地址" id="objects-exercise-3">

你正在为一个应用程序构建用户注册模块。你希望将电子邮件验证逻辑与 `User` 类关联起来，但又不想在电子邮件地址无效时创建不必要的 `User` 实例。

在本练习中，如果电子邮件地址同时包含 `@` 和 `.`，则视其为有效。补全该数据类，以便 `main()` 函数中的以下代码可以成功运行：

<deflist collapsible="true">
    <def title="提示">
        在 `User` 类的伴生对象中添加一个电子邮件验证函数，以便可以直接在 `User` 上调用该函数。
    </def>
</deflist>

```kotlin
data class User(val name: String, val email: String) {
    // 在此处编写你的代码
}

fun main() {
    val candidates = listOf(
        Pair("Alice", "alice@example.com"),
        Pair("Bob", "bob2example-com")
    )

    for ((name, email) in candidates) {
        if (User.isValidEmail(email)) {
            val user = User(name, email)
            println("Registered: ${user.name}, ${user.email}")
            // Registered: Alice, alice@example.com
        } else {
            println("Error: '${email}' is not valid. The email should contain '@' and '.'")
            // Error: 'bob2example-com' is not valid. The email should contain '@' and '.'
        }
    }
}
```
{kotlin-runnable="true" kotlin-target-platform="exercise" kotlin-hidden-files="ExerciseUtils.kt,tour/intermediate/UserTest.kt" validate="false" id="kotlin-tour-objects-exercise-3"}

```kotlin
data class User(val name: String, val email: String) {
    companion object {
        fun isValidEmail(email: String): Boolean =
            email.contains('@') && email.contains('.')
    }
}

fun main() {
    val candidates = listOf(
        Pair("Alice", "alice@example.com"),
        Pair("Bob", "bob2example-com")
    )

    for ((name, email) in candidates) {
        if (User.isValidEmail(email)) {
            val user = User(name, email)
            println("Registered: ${user.name}, ${user.email}")
            // Registered: Alice, alice@example.com
        } else {
            println("Error: '${email}' is not valid. The email should contain '@' and '.'")
            // Error: 'bob2example-com' is not valid. The email should contain '@' and '.'
        }
    }
}
```
{kotlin-runnable="true" kotlin-target-platform="exercise" kotlin-hidden-files="ExerciseUtils.kt,tour/intermediate/UserTest.kt" initial-collapse-state="collapsed" collapsible="true" collapsed-title="参考答案" id="kotlin-tour-objects-solution-3"}

> 作为本练习的扩展，可以尝试使用伴生对象中的函数作为工厂方法来构造类的实例。有关此模式的示例和更多信息，请参阅 [](object-declarations.md#companion-objects)。
>
{style="tip"}

</def>
</deflist>

<seealso></seealso>

<list columns="2" id="tour-nav">
  <li>
    <a as="button" href="kotlin-tour-intermediate-classes-interfaces.md" mode="outline" icon="arrow-left" icon-position="left">上一步</a>
  </li>
  <li>
    <a as="button" href="kotlin-tour-intermediate-open-special-classes.md" mode="classic" icon="arrow-right" icon-position="right">下一步</a>
  </li>
</list>