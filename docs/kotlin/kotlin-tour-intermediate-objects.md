[//]: # (title: 对象)

<no-index/>

在本章中，你将通过探索对象声明来加深对类的理解。这些知识将帮助你在项目中高效地管理行为。

## 对象声明 {id="object-declarations"}

在 Kotlin 中，你可以使用**对象声明**来声明一个只拥有单个实例的类。从某种意义上说，你在声明类的同时创建了该单一实例。当你希望创建一个类作为程序的唯一定位点，或者在整个系统中协调行为时，对象声明非常有用。

> 只有一个实例且易于访问的类被称为**单例**（singleton）。
>
{style="tip"}

Kotlin 中的对象是**惰性的**，这意味着它们仅在被访问时才会被创建。Kotlin 还确保所有对象均以线程安全的方式创建，因此你无需手动检查这一点。

要创建对象声明，请使用 `object` 关键字：

```kotlin
object DoAuth {}
```

在 `object` 名称之后，可以在由花括号 `{}` 定义的对象体中添加任何属性或成员函数。

> 对象不能拥有构造函数，因此它们不像类那样具有类头。
>
{style="note"}

例如，假设你想要创建一个名为 `DoAuth` 的对象来负责身份验证：

```kotlin
object DoAuth {
    fun takeParams(username: String, password: String) {
        println("input Auth parameters = $username:$password")
    }
}

fun main(){
    // 当 takeParams() 函数被调用时，该对象会被创建
    DoAuth.takeParams("coding_ninja", "N1njaC0ding!")
    // input Auth parameters = coding_ninja:N1njaC0ding!
}
```
{kotlin-runnable="true" id="kotlin-tour-object-declarations"}

该对象包含一个名为 `takeParams` 的成员函数，该函数接收 `username` 和 `password` 变量作为形参，并将字符串输出到控制台。`DoAuth` 对象仅在首次调用该函数时才会被创建。

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

为了更容易打印对象声明的内容，Kotlin 提供了**数据**对象（data object）。类似于你在新手教程中了解到的数据类，数据对象会自动附带额外的成员函数：`toString()` 和 `equals()`。

> 与数据类不同，数据对象不会自动带有 `copy()` 成员函数，因为它们只有单个实例，无法被复制。
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

在 Kotlin 中，类可以拥有一个对象：**伴生**对象（companion object）。每个类只能有**一个**伴生对象。伴生对象仅在其类首次被引用时才会被创建。

在伴生对象内部声明的所有属性或函数都会在类的所有实例之间共享。

要在类中创建伴生对象，请使用与对象声明相同的语法，但在其前面加上 `companion` 关键字前缀：

```kotlin
companion object Bonger {}
```

> 伴生对象不必命名。如果你不为其定义名称，则默认名称为 `Companion`。
> 
{style="note"}

要访问伴生对象的任何属性或函数，只需引用类名即可。例如：

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

此示例创建了一个名为 `BigBen` 的类，其中包含一个名为 `Bonger` 的伴生对象。伴生对象包含一个名为 `getBongs()` 的成员函数，该函数接收一个整数，并向控制台输出相应次数的 `"BONG"`。

在 `main()` 函数中，通过引用类名来调用 `getBongs()` 函数。伴生对象正是在此时被创建。调用 `getBongs()` 函数时传入了实参 `12`。

有关更多信息，请参阅 [](object-declarations.md#companion-objects)。

## 练习 {completion-point="true" id="practice"}

<deflist appearance="clear" collapsible="true" numbered="true">
<def title="实现一个用于订单跟踪的数据对象" id="objects-exercise-1">

你经营着一家咖啡馆，并拥有一个用于跟踪客户订单的系统。请观察以下代码并补全第二个数据对象的声明，以使 `main()` 函数中的后续代码能够成功运行：

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

    // 检查两个订单是否完全相同
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

    // 检查两个订单是否完全相同
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

</def>
<def title="创建一个对象声明" id="objects-exercise-2">

创建一个继承自 `Vehicle` 接口的对象声明，以构建一个独特的载具类型：`FlyingSkateboard`。
在你的对象中实现 `name` 属性和 `move()` 函数，以使 `main()` 函数中的后续代码能够成功运行：

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

</def>
<def title="在创建用户前验证电子邮件地址" id="objects-exercise-3">

你正在为一个应用构建用户注册模块。你希望将电子邮件验证功能与 `User` 类关联起来，但又不希望在电子邮件地址无效时创建不必要的 `User` 实例。

在本练习中，如果电子邮件地址同时包含 `@` 和 `.`，则视为有效。请补全该数据类，以使 `main()` 函数中的后续代码能够成功运行：

<deflist collapsible="true">
    <def title="提示">
        在 `User` 类的伴生对象中添加一个电子邮件验证函数，以便你可以直接在 `User` 上调用该函数。
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
{validate="false" kotlin-runnable="true" kotlin-min-compiler-version="1.3" id="kotlin-tour-objects-exercise-3"}

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
{initial-collapse-state="collapsed" collapsible="true" collapsed-title="示例解决方案" id="kotlin-tour-objects-solution-3"}

> 作为本练习的扩展，尝试将伴生对象中的函数用作工厂方法来构造类的实例。有关该模式的示例和更多信息，请参阅 [](object-declarations.md#companion-objects)。
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