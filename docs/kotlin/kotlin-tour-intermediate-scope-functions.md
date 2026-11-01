[//]: # (title: 作用域函数)

<no-index/>

在本章中，你将在理解扩展函数的基础上，学习如何使用作用域函数来编写更符合惯用法的代码。

## 作用域函数 {id="scope-functions"}

在编程中，作用域是识别变量或对象的区域。最常提到的作用域是全局作用域和局部作用域：

* **全局作用域** – 可以在程序中的任何位置访问的变量或对象。
* **局部作用域** – 仅在定义它的代码块或函数中可访问的变量或对象。

在 Kotlin 中，还有作用域函数，允许你围绕某个对象创建一个临时作用域并执行一些代码。

作用域函数使你的代码更加简洁，因为你无需在临时作用域内引用对象的名称。根据具体的作用域函数，你可以通过关键字 `this` 引用该对象，也可以通过关键字 `it` 将其作为实参来访问。

Kotlin 一共有五个作用域函数：`let`、`apply`、`run`、`also` 和 `with`。

每个作用域函数都接受一个 lambda表达式，并返回该对象或 lambda表达式的结果。在本教程中，我们将解释各个作用域函数及其使用方法。

> 你也可以观看 Kotlin 技术布道师 Sebastian Aigner 关于作用域函数的演讲：[Back to the Stdlib: Making the Most of Kotlin's Standard Library](https://youtu.be/DdvgvSHrN9g?feature=shared&t=1511)。
> 
{style="tip"}

### Let {id="let"}

当你想要在代码中执行 null 检查，随后对返回的对象执行进一步操作时，可以使用 `let` 作用域函数。

参见以下示例：

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

该示例包含两个函数：
* `sendNotification()`，它包含一个形参 `recipientAddress` 并返回一个字符串。
* `getNextAddress()`，它没有形参并返回一个字符串。

该示例创建了一个可空 `String` 类型的变量 `address`。但在调用 `sendNotification()` 函数时会出现问题，因为该函数不期望 `address` 可能是 `null` 值。
结果，编译器会报告错误：

```text
Argument type mismatch: actual type is 'String?', but 'String' was expected.
```

在初学者教程中，你已经知道可以通过 if 条件执行 null 检查，或者使用 [Elvis 运算符 `?:`](kotlin-tour-null-safety.md#use-elvis-operator)。但如果你稍后想在代码中使用返回的对象该怎么办？你可以通过 if 条件**以及** else 分支来实现：

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

但是，更简洁的方法是使用 `let` 作用域函数：

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

该示例：
* 创建了名为 `address` 和 `confirm` 的变量。
* 在 `address` 变量上对 `let` 作用域函数使用安全调用。
* 在 `let` 作用域函数中创建一个临时作用域。
* 将 `sendNotification()` 函数作为 lambda表达式传递到 `let` 作用域函数中。
* 使用临时作用域，通过 `it` 引用 `address` 变量。
* 将结果赋值给 `confirm` 变量。

通过这种方法，你的代码可以处理 `address` 变量可能为 `null` 值的情况，并且你稍后可以在代码中使用 `confirm` 变量。

### Apply {id="apply"}

使用 `apply` 作用域函数在创建对象（例如类实例）时立即对其进行初始化，而不是稍后在代码中初始化。这种方法使你的代码更易于阅读和管理。

参见以下示例：

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

该示例包含一个 `Client` 类，其中包含一个名为 `token` 的属性和三个成员函数：`connect()`、`authenticate()` 和 `getData()`。

该示例先将 `client` 创建为 `Client` 类的实例，然后在 `main()` 函数中初始化其 `token` 属性并调用其成员函数。

尽管这个示例很紧凑，但在实际开发中，创建类实例后可能要隔一段时间才能对其进行配置并使用（及其成员函数）。不过，如果使用 `apply` 作用域函数，你可以在代码中的同一位置创建、配置类实例并在其上使用成员函数：

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

该示例：

* 将 `client` 创建为 `Client` 类的实例。
* 在 `client` 实例上使用 `apply` 作用域函数。
* 在 `apply` 作用域函数中创建一个临时作用域，这样在访问其属性或函数时就无需显式引用 `client` 实例。
* 向 `apply` 作用域函数传递一个 lambda表达式，用于更新 `token` 属性并调用 `connect()` 和 `authenticate()` 函数。
* 在 `main()` 函数中调用 `client` 实例上的 `getData()` 成员函数。

正如你所看到的，在处理大段代码时，这种策略非常方便。

### Run {id="run"}

与 `apply` 类似，你可以使用 `run` 作用域函数来初始化对象，但更推荐使用 `run` 在代码中的特定时刻初始化对象**并**立即计算结果。

让我们继续前面针对 `apply` 函数的示例，但这一次，你希望将 `connect()` 和 `authenticate()` 函数组合在一起，以便在每次请求时调用它们。

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

该示例：

* 将 `client` 创建为 `Client` 类的实例。
* 在 `client` 实例上使用 `apply` 作用域函数。
* 在 `apply` 作用域函数中创建一个临时作用域，这样在访问其属性或函数时就无需显式引用 `client` 实例。
* 向 `apply` 作用域函数传递一个更新 `token` 属性的 lambda表达式。

`main()` 函数：

* 创建类型为 `String` 的 `result` 变量。
* 在 `client` 实例上使用 `run` 作用域函数。
* 在 `run` 作用域函数中创建一个临时作用域，这样在访问其属性或函数时就无需显式引用 `client` 实例。
* 向 `run` 作用域函数传递一个 lambda表达式，调用 `connect()`、`authenticate()` 和 `getData()` 函数。
* 将结果赋值给 `result` 变量。

现在你可以在代码中进一步使用返回的结果。

### Also {id="also"}

使用 `also` 作用域函数对对象执行附加操作，然后返回该对象以便在代码中继续使用它（例如记录日志）。

参见以下示例：

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

该示例：

* 创建包含字符串列表的 `medals` 变量。
* 创建类型为 `List<String>` 的 `reversedLongUpperCaseMedals` 变量。
* 在 `medals` 变量上使用 `.map()` 扩展函数。
* 向 `.map()` 函数传递一个 lambda表达式，该表达式通过 `it` 关键字引用 `medals` 并在其上调用 `.uppercase()` 扩展函数。
* 在 `medals` 变量上使用 `.filter()` 扩展函数。
* 向 `.filter()` 函数传递一个 lambda表达式作为谓词，该表达式通过 `it` 关键字引用 `medals` 并检查列表中的项是否超过 4 个字符。
* 在 `medals` 变量上使用 `.reversed()` 扩展函数。
* 将结果赋值给 `reversedLongUpperCaseMedals` 变量。
* 打印 `reversedLongUpperCaseMedals` 变量中包含的列表。

在函数调用之间添加一些日志以查看 `medals` 变量的变化情况会很有用。`also` 函数正好能帮上忙：

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

现在该示例：

* 在 `medals` 变量上使用 `also` 作用域函数。
* 在 `also` 作用域函数中创建一个临时作用域，这样在将其用作函数形参时无需显式引用 `medals` 变量。
* 向 `also` 作用域函数传递一个 lambda表达式，通过 `it` 关键字将 `medals` 变量用作函数实参来调用 `println()` 函数。

由于 `also` 函数返回该对象本身，因此它不仅适用于日志记录，还适用于调试、链式调用多个操作以及执行其他不影响代码主流程的副作用操作。

### With {id="with"}

与其他作用域函数不同，`with` 不是扩展函数，因此其语法有所不同。你需要将接收者对象作为实参传递给 `with`。

当你想要在某个对象上调用多个函数时，可以使用 `with` 作用域函数。

参见以下示例：

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

该示例创建了一个具有三个成员函数（`rect()`、`circ()` 和 `text()`）的 `Canvas` 类。这些成员函数中的每一个都会打印一条由你提供的函数形参构建的语句。

该示例先将 `mainMonitorPrimaryBufferBackedCanvas` 创建为 `Canvas` 类的实例，然后使用不同的函数形参对该实例调用一系列成员函数。

可以看出，这段代码很难阅读。如果使用 `with` 函数，代码将变得更加精简：

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

该示例：
* 将 `mainMonitorSecondaryBufferBackedCanvas` 实例作为接收者使用 `with` 作用域函数。
* 在 `with` 作用域函数中创建一个临时作用域，这样在调用其成员函数时就无需显式引用 `mainMonitorSecondaryBufferBackedCanvas` 实例。
* 向 `with` 作用域函数传递一个 lambda表达式，以使用不同的函数形参调用一系列成员函数。

现在这段代码易读得多，你也更不容易犯错。

## 用例概览 {id="use-case-overview"}

本节介绍了 Kotlin 中可用的不同作用域函数以及它们的主要用例，以使你的代码更加符合惯用法。你可以将此表作为快速参考。需要注意的是，你不需要完全理解这些函数的工作原理，就可以在代码中使用它们。

| 函数 | 通过以下方式访问 `x` | 返回值 | 用例 |
|---|---|---|---|
| `let` | `it` | Lambda 结果 | 在代码中执行 null 检查，随后对返回的对象执行进一步操作。 |
| `apply` | `this` | `x` | 在创建对象时对其进行初始化。 |
| `run` | `this` | Lambda 结果 | 在创建对象时对其进行初始化**并**计算结果。 |
| `also` | `it` | `x` | 在返回对象之前完成附加操作。 |
| `with` | `this` | Lambda 结果 | 在某个对象上调用多个函数。 |

有关作用域函数的更多信息，请参阅[作用域函数](scope-functions.md)。

## 练习 {completion-point="true" id="practice"}

<deflist appearance="clear" collapsible="true" numbered="true">
<def title="使用安全调用和 let 重写函数" id="scope-functions-exercise-1">

将 `.getPriceInEuros()` 函数重写为使用安全调用运算符 `?.` 和 `let` 作用域函数的单表达式函数。

<deflist collapsible="true">
    <def title="提示">
        使用安全调用运算符 <code>?.</code> 安全地从 <code>getProductInfo()</code> 函数中访问 <code>priceInDollars</code> 属性。然后，使用 <code>let</code> 作用域函数将 <code>priceInDollars</code> 的值转换为欧元。
    </def>
</deflist>

```kotlin
data class ProductInfo(val priceInDollars: Double?)

class Product {
    fun getProductInfo(): ProductInfo? {
        return ProductInfo(100.0)
    }
}

// 重写此函数
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
{kotlin-runnable="true" kotlin-target-platform="exercise" kotlin-hidden-files="ExerciseUtils.kt,tour/intermediate/GetPriceInEurosTest.kt" initial-collapse-state="collapsed" collapsible="true" collapsed-title="示例解决方案" id="kotlin-tour-scope-functions-solution-1"}

</def>
<def title="链式调用 apply 和 also" id="scope-functions-exercise-2">

你有一个用于更新用户电子邮件地址的 `updateEmail()` 函数。使用 `apply` 作用域函数更新电子邮件地址，然后使用 `also` 作用域函数打印一条日志消息：`Updating email for user with ID: ${it.id}`。

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
{kotlin-runnable="true" kotlin-target-platform="exercise" kotlin-hidden-files="ExerciseUtils.kt,tour/intermediate/UpdateEmailTest.kt" initial-collapse-state="collapsed" collapsible="true" collapsed-title="示例解决方案" id="kotlin-tour-scope-functions-solution-2"}

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