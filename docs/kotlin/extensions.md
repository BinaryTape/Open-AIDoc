[//]: # (title: 扩展)

Kotlin 的_扩展_（Extension）允许你在不使用继承或 _Decorator_ 等设计模式的情况下，为类或接口扩展新功能。在处理无法直接修改的第三方库时，这种机制非常有用。创建扩展后，你可以像调用原类或原接口的成员一样调用这些扩展。

扩展最常见的形式是[扩展函数](#extension-functions)和[扩展属性](#extension-properties)。

需要注意的是，扩展并不会修改它们所扩展的类或接口。定义扩展时，你并没有添加新的成员，而只是让新函数可以通过相同语法被调用，或让新属性能够以相同语法被访问。

## 接收者 {id="receivers"}

扩展总是在接收者（Receiver）上调用的。接收者的类型必须与所扩展的类或接口的类型相同。
要使用扩展，需要在函数或属性名前加上接收者，后跟一个 `.`。

例如，来自标准库的 [`.appendLine()`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.text/append-line.html) 扩展函数扩展了 `StringBuilder` 类。
因此在这种情况下，接收者是一个 `StringBuilder` 实例，而_接收者类型_是 `StringBuilder`：

```kotlin
fun main() { 
//sampleStart
    // builder 是 StringBuilder 的一个实例
    val builder = StringBuilder()
        // 在 builder 上调用 .appendLine() 扩展函数
        .appendLine("Hello")
        .appendLine()
        .appendLine("World")
    println(builder.toString())
    // Hello
    //
    // World
}
//sampleEnd
```
{kotlin-runnable="true" id="kotlin-extension-function-stringbuilder"}

## 扩展函数 {id="extension-functions"}

在创建自己的扩展函数之前，请先查看 Kotlin [标准库](https://kotlinlang.org/api/core/kotlin-stdlib/)中是否已提供了你需要的功能。
标准库提供了许多有用的扩展函数，用于：

* 操作集合：[`.map()`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.collections/map.html)、[`.filter()`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.collections/filter.html)、[`.reduce()`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.collections/reduce.html)、[`.fold()`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.collections/fold.html)、[`.groupBy()`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.collections/group-by.html)。
* 转换为字符串：[`.joinToString()`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.collections/join-to-string.html)。
* 处理 null 值：[`.filterNotNull()`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.collections/filter-not-null.html)。

要创建自己的扩展函数，需要在其函数名称前加上接收者类型，后跟一个 `.`。在下面的示例中，`.truncate()` 函数扩展了 `String` 类，因此接收者类型是 `String`：

```kotlin
fun String.truncate(maxLength: Int): String {
    return if (this.length <= maxLength) this else take(maxLength - 3) + "..."
}

fun main() {
    val shortUsername = "KotlinFan42"
    val longUsername = "JetBrainsLoverForever"

    println("Short username: ${shortUsername.truncate(15)}") 
    // KotlinFan42
    println("Long username:  ${longUsername.truncate(15)}")
    // JetBrainsLov...
}
```
{kotlin-runnable="true" id="kotlin-extension-function-truncate"}

`.truncate()` 函数会将调用它的任意字符串按 `maxLength` 实参截断，并添加省略号 `...`。
如果字符串短于 `maxLength`，该函数将返回原始字符串。

在下面的示例中，`.displayInfo()` 函数扩展了 `User` 接口：

```kotlin
interface User {
    val name: String
    val email: String
}

fun User.displayInfo(): String = "User(name=$name, email=$email)"

// 继承并实现 User 接口的属性
class RegularUser(override val name: String, override val email: String) : User

fun main() {
    val user = RegularUser("Alice", "alice@example.com")
    println(user.displayInfo()) 
    // User(name=Alice, email=alice@example.com)
}
```
{kotlin-runnable="true" id="kotlin-extension-function-interface"}

`.displayInfo()` 函数返回一个包含 `RegularUser` 实例的 `name` 和 `email` 的字符串。像这样在接口上定义扩展，非常适合用于一次性为所有实现该接口的类型添加通用功能。

在下面的示例中，`.mostVoted()` 函数扩展了 `Map<String, Int>` 类：

```kotlin
fun Map<String, Int>.mostVoted(): String? {
    return maxByOrNull { (key, value) -> value }?.key
}

fun main() {
    val poll = mapOf(
        "Cats" to 37,
        "Dogs" to 58,
        "Birds" to 22
    )

    println("Top choice: ${poll.mostVoted()}") 
    // Dogs
}
```
{kotlin-runnable="true" id="kotlin-extension-function-mostvoted"}

`.mostVoted()` 函数遍历调用它的 Map 的键值对，并使用 [`maxByOrNull()`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.collections/max-by-or-null.html) 函数返回包含最大值的键值对中的键。如果 Map 为空，`maxByOrNull()` 函数将返回 `null`。`mostVoted()` 函数使用安全调用 `?.`，确保仅在 `maxByOrNull()` 函数返回非 null 值时才访问 `key` 属性。

### 泛型扩展函数 {id="generic-extension-functions"}

要创建泛型扩展函数，请在函数名称之前声明泛型类型形参，使其在接收者类型表达式中可用。在下面的示例中，`.endpoints()` 函数扩展了 `List<T>`，其中 `T` 可以是任何类型：

```kotlin
fun <T> List<T>.endpoints(): Pair<T, T> {
    return first() to last()
}

fun main() {
    val cities = listOf("Paris", "London", "Berlin", "Prague")
    val temperatures = listOf(21.0, 19.5, 22.3)

    val cityEndpoints = cities.endpoints()
    val tempEndpoints = temperatures.endpoints()

    println("First and last cities: $cityEndpoints")
    // (Paris, Prague)
    println("First and last temperatures: $tempEndpoints") 
    // (21.0, 22.3)
}
```
{kotlin-runnable="true" id="kotlin-extension-function-endpoints"}

`.endpoints()` 函数返回一个 Pair，其中包含调用它的列表的第一个和最后一个元素。
在函数体内，它调用了 `first()` 和 `last()` 函数，并使用 `to` 中缀函数将其返回值组合为 `Pair`。

有关泛型的更多信息，请参阅[泛型函数](generics.md)。

### 可空接收者 {id="nullable-receivers"}

你可以使用可空接收者类型定义扩展函数，这样即使变量的值为 null，也可以对其调用该扩展函数。当接收者为 `null` 时，`this` 也为 `null`。请确保在函数内部正确处理为 null 性。例如，在函数体内使用 `this == null` 检查、[安全调用 `?.`](null-safety.md#safe-call-operator) 或 [Elvis 运算符 `?:`](null-safety.md#elvis-operator)。

在下面的示例中，你可以直接调用 `.toString()` 函数而无需检查 `null`，因为该检查已经在扩展函数内部完成了：

```kotlin
fun main() {
    //sampleStart
    // 可空 Any 上的扩展函数
    fun Any?.toString(): String {
        if (this == null) return "null"
        // 经过 null 检查后，`this` 会被智能转换为非空 Any
        // 因此该调用会解析为常规的 toString() 函数
        return toString()
    }
    
    val number: Int? = 42
    val nothing: Any? = null
    
    println(number.toString())
    // 42
    println(nothing.toString()) 
    // null
    //sampleEnd
}
```
{kotlin-runnable="true" id="kotlin-extension-function-nullable-receiver"}

### 扩展函数还是成员函数？ {id="extension-or-member-functions"}

由于扩展函数和成员函数调用的表示法相同，编译器如何确定使用哪一个？
扩展函数是_静态_分发的，这意味着编译器在编译期根据接收者类型来决定调用哪个函数。例如：

```kotlin
fun main() {
//sampleStart
    open class Shape
    class Rectangle: Shape()
    
    fun Shape.getName() = "Shape"
    fun Rectangle.getName() = "Rectangle"
    
    fun printClassName(shape: Shape) {
        println(shape.getName())
    }
    
    printClassName(Rectangle())
    // Shape
//sampleEnd
}
```
{kotlin-runnable="true" id="kotlin-extension-function-shape"}

在这个示例中，编译器调用的是 `Shape.getName()` 扩展函数，因为形参 `shape` 被声明为 `Shape` 类型。由于扩展函数是静态解析的，编译器会根据所声明的类型而非实际的实例来选择函数。

因此，即使该示例传入了一个 `Rectangle` 实例，`.getName()` 函数仍然会解析为 `Shape.getName()`，因为该变量被声明为 `Shape` 类型。

如果一个类拥有一个成员函数，同时存在一个具有相同接收者类型、相同名称且实参兼容的扩展函数，则成员函数优先。例如：

```kotlin
fun main() {
//sampleStart
    class Example {
        fun printFunctionType() { println("Member function") }
    }
    
    fun Example.printFunctionType() { println("Extension function") }
    
    Example().printFunctionType()
    // Member function
//sampleEnd
}
```
{kotlin-runnable="true" id="kotlin-extension-function-member-function"}

然而，扩展函数可以重载同名但签名_不同_的成员函数：

```kotlin
fun main() {
//sampleStart
    class Example {
        fun printFunctionType() { println("Member function") }
    }
    
    // 同名但签名不同
    fun Example.printFunctionType(index: Int) { println("Extension function #$index") }
    
    Example().printFunctionType(1)
    // Extension function #1
//sampleEnd
}
```
{kotlin-runnable="true" id="kotlin-extension-function-member-function-overload"}

在此示例中，由于将 `Int` 传递给了 `.printFunctionType()` 函数，编译器会选择扩展函数，因为它的签名相匹配。编译器会忽略不带参数的成员函数。

### 匿名扩展函数 {id="anonymous-extension-functions"}

你可以定义不带名称的扩展函数。当你希望避免污染全局命名空间，或者需要将某些扩展行为作为参数传递时，这非常有用。

例如，假设你想为某个数据类扩展一个一次性的函数来计算运费，且无需为该函数命名：

```kotlin
fun main() {
    //sampleStart
    data class Order(val weight: Double)
    val calculateShipping = fun Order.(rate: Double): Double = this.weight * rate
    
    val order = Order(2.5)
    val cost = order.calculateShipping(3.0)
    println("Shipping cost: $cost") 
    // Shipping cost: 7.5
}
```
{kotlin-runnable="true" id="kotlin-extension-function-anonymous"}

要将扩展行为作为参数传递，可以使用带有类型注解的 [lambda表达式](lambdas.md#lambda-expression-syntax)。
例如，假设你想检查一个数字是否在某个范围内，而无需定义具名函数：

```kotlin
fun main() {
    val isInRange: Int.(min: Int, max: Int) -> Boolean = { min, max -> this in min..max }

    println(5.isInRange(1, 10))
    // true
    println(20.isInRange(1, 10))
    // false
}
```
 {kotlin-runnable="true" id="kotlin-extension-function-anonymous-lambda"}

在这个示例中，`isInRange` 变量持有一个类型为 `Int.(min: Int, max: Int) -> Boolean` 的函数。该类型是 `Int` 类上的扩展函数，接受 `min` 和 `max` 参数并返回 `Boolean`。

Lambda 体 `{ min, max -> this in min..max }` 会检查调用该函数的 `Int` 值是否在 `min` 和 `max` 形参构成的范围之内。如果检查通过，lambda 返回 `true`。

有关更多信息，请参阅 [Lambda 表达式和匿名函数](lambdas.md)。

## 扩展属性 {id="extension-properties"}

Kotlin 支持扩展属性，这对于执行数据转换或创建 UI 显示辅助方法非常有用，而不会让正在处理的类变得杂乱无章。

要创建扩展属性，请先写下要扩展的类的名称，后跟一个 `.` 和属性名称。

例如，假设你有一个表示包含名字和姓氏的用户的属性数据类，并且你想创建一个在访问时返回电子邮件风格用户名的属性。你的代码可能如下所示：

```kotlin
data class User(val firstName: String, val lastName: String)

// 用于获取用户名风格电子邮件名称的扩展属性
val User.emailUsername: String
    get() = "${firstName.lowercase()}.${lastName.lowercase()}"

fun main() {
    val user = User("Mickey", "Mouse")
    // 调用扩展属性
    println("Generated email username: ${user.emailUsername}")
    // Generated email username: mickey.mouse
}
```
{kotlin-runnable="true" id="kotlin-extension-function-property"}

由于扩展实际上并不会向类添加成员，因此扩展属性无法以有效的方式拥有[支持字段](properties.md#backing-fields)。这就是为什么扩展属性不允许有初始值设定项的原因。你只能通过显式提供 getter 和 setter 来定义其行为。例如：

```kotlin
data class House(val streetName: String)

// 无法编译，因为没有 getter 和 setter
// var House.number = 1
// Error: Initializers are not allowed for extension properties

// 编译成功
val houseNumbers = mutableMapOf<House, Int>()
var House.number: Int
    get() = houseNumbers[this] ?: 1
    set(value) {
        println("Setting house number for ${this.streetName} to $value")
        houseNumbers[this] = value
    }

fun main() {
    val house = House("Maple Street")

    // 显示默认值
    println("Default number: ${house.number} ${house.streetName}") 
    // Default number: 1 Maple Street
    
    house.number = 99
    // Setting house number for Maple Street to 99

    // 显示更新后的门牌号
    println("Updated number: ${house.number} ${house.streetName}") 
    // Updated number: 99 Maple Street
}
```
{kotlin-runnable="true" id="kotlin-extension-function-property-error"}

在此示例中，getter 使用 [Elvis 运算符](null-safety.md#elvis-operator)来返回 `houseNumbers` 映射中的门牌号（如果存在），否则返回 `1`。要了解关于如何编写 getter 和 setter 的更多信息，请参阅[自定义 getter 与 setter](properties.md#custom-getters-and-setters)。

## 伴生对象扩展 {id="companion-object-extensions"}

如果一个类定义了[伴生对象](object-declarations.md#companion-objects)，你也可以为该伴生对象定义扩展函数和属性。就像伴生对象的常规成员一样，你可以仅使用类名作为限定符来调用它们。编译器默认将伴生对象命名为 `Companion`：

```kotlin
class Logger {
    companion object { }
}

fun Logger.Companion.logStartupMessage() {
    println("Application started.")
}

fun main() {
    Logger.logStartupMessage()
    // Application started.
}
```
{kotlin-runnable="true" id="kotlin-extension-function-companion-object"}

## 将扩展声明为成员 {id="declaring-extensions-as-members"}

你可以在一个类的内部为另一个类声明扩展。这类扩展拥有多个_隐式接收者_。
隐式接收者是指其成员无需使用 [`this`](this-expressions.md#qualified-this) 限定即可直接访问的对象：

* 声明扩展的类被称为_分发接收者_（Dispatch receiver）。
* 扩展函数的接收者类型被称为_扩展接收者_（Extension receiver）。

考虑以下示例，其中 `Connection` 类中包含一个针对 `Host` 类的扩展函数 `printConnectionString()`：

```kotlin
class Host(val hostname: String) {
    fun printHostname() { print(hostname) }
}

class Connection(val host: Host, val port: Int) {
    fun printPort() { print(port) }

    // Host 是扩展接收者
    fun Host.printConnectionString() {
        // 调用 Host.printHostname()
        printHostname() 
        print(":")
        // 调用 Connection.printPort()
        // Connection 是分发接收者
        printPort()
    }

    fun connect() {
        /*...*/
        // 调用扩展函数
        host.printConnectionString() 
    }
}

fun main() {
    Connection(Host("kotl.in"), 443).connect()
    // kotl.in:443
    
    // 会引发错误，因为扩展函数在 Connection 外部不可用
    // Host("kotl.in").printConnectionString()
    // Unresolved reference 'printConnectionString'.
}
```
{kotlin-runnable="true" id="kotlin-extension-function-members"}

该示例在 `Connection` 类中声明了 `printConnectionString()` 函数，因此 `Connection` 类是分发接收者。扩展函数的接收者类型是 `Host` 类，因此 `Host` 类是扩展接收者。

如果分发接收者与扩展接收者拥有同名成员，则扩展接收者的成员优先。若要显式访问分发接收者的成员，请使用[带限定符的 `this` 语法](this-expressions.md#qualified-this)：

```kotlin
class Connection {
    fun Host.getConnectionString() {
        // 调用 Host.toString()
        toString()
        // 调用 Connection.toString()
        this@Connection.toString()
    }
}
```

### 重写成员扩展 {id="overriding-member-extensions"}

你可以将成员扩展声明为 `open`，并在子类中重写它们，这在你想针对每个子类自定义扩展行为时非常有用。编译器对每种接收者类型的处理方式有所不同：

| 接收者类型 | 解析时间 | 分发类型 |
|--------------------|-----------------|---------------|
| 分发接收者 | 运行时 | 虚分发 (Virtual) |
| 扩展接收者 | 编译期 | 静态分发 (Static) |

考虑以下示例，其中 `User` 类是 `open` 的，`Admin` 类继承自它。`NotificationSender` 类为 `User` 和 `Admin` 类分别定义了 `sendNotification()` 扩展函数，而 `SpecialNotificationSender` 类重写了它们：

```kotlin
open class User

class Admin : User()

open class NotificationSender {
    open fun User.sendNotification() {
        println("Sending user notification from normal sender")
    }

    open fun Admin.sendNotification() {
        println("Sending admin notification from normal sender")
    }

    fun notify(user: User) {
        user.sendNotification()
    }
}

class SpecialNotificationSender : NotificationSender() {
    override fun User.sendNotification() {
        println("Sending user notification from special sender")
    }

    override fun Admin.sendNotification() {
        println("Sending admin notification from special sender")
    }
}

fun main() {
    // 分发接收者为 NotificationSender
    // 扩展接收者为 User
    // 解析为 NotificationSender 中的 User.sendNotification()
    NotificationSender().notify(User())
    // Sending user notification from normal sender
    
    // 分发接收者为 SpecialNotificationSender
    // 扩展接收者为 User
    // 解析为 SpecialNotificationSender 中的 User.sendNotification()
    SpecialNotificationSender().notify(User())
    // Sending user notification from special sender 
    
    // 分发接收者为 SpecialNotificationSender
    // 扩展接收者为 User 而不是 Admin
    // notify() 函数将 user 声明为 User 类型
    // 静态解析为 SpecialNotificationSender 中的 User.sendNotification()
    SpecialNotificationSender().notify(Admin())
    // Sending user notification from special sender 
}
```
{kotlin-runnable="true" id="kotlin-extension-open"}

分发接收者在运行时通过虚分发进行解析，这使得 `main()` 函数中的行为更容易理解。令人意外的可能是，当你在 `Admin` 实例上调用 `notify()` 函数时，编译器会根据所声明的类型（`user: User`）来选择扩展，因为它是静态解析扩展接收者的。

## 扩展与可见性修饰符 {id="extensions-and-visibility-modifiers"}

扩展使用与在相同作用域内声明的常规函数相同的[可见性修饰符](visibility-modifiers.md)，这同样适用于声明为其他类成员的扩展。

例如，在文件顶层声明的扩展可以访问同一文件中的其他 `private` 顶层声明：

```kotlin
// 文件：StringUtils.kt

private fun removeWhitespace(input: String): String {
    return input.replace("\\s".toRegex(), "")
}

fun String.cleaned(): String {
    return removeWhitespace(this)
}

fun main() {
    val rawEmail = "  user @example. com  "
    val cleaned = rawEmail.cleaned()
    println("Raw:     '$rawEmail'")
    // Raw:     '  user @example. com  '
    println("Cleaned: '$cleaned'")
    // Cleaned: 'user@example.com'
    println("Looks like an email: ${cleaned.contains("@") && cleaned.contains(".")}") 
    // Looks like an email: true
}
```
{kotlin-runnable="true" id="kotlin-extension-visibility-top-level"}

如果扩展是在其接收者类型之外声明的，则无法访问该接收者的 `private` 或 `protected` 成员：

```kotlin
class User(private val password: String) {
    fun isLoggedIn(): Boolean = true
    fun passwordLength(): Int = password.length
}

// 在类外部声明的扩展
fun User.isSecure(): Boolean {
    // 无法访问 password，因为它是私有的：
    // return password.length >= 8

    // 相反，我们依赖公共成员：
    return passwordLength() >= 8 && isLoggedIn()
}

fun main() {
    val user = User("supersecret")
    println("Is user secure: ${user.isSecure()}") 
    // Is user secure: true
}
```
{kotlin-runnable="true" id="kotlin-extension-visibility-outside-receiver"}

如果将扩展标记为 `internal`，则它仅在其[模块](visibility-modifiers.md#modules)内部可访问：

```kotlin
// Networking 模块
// JsonParser.kt
internal fun String.parseJson(): Map<String, Any> {
    return mapOf("fakeKey" to "fakeValue")
}
```

## 扩展的作用域 {id="scope-of-extensions"}

在大多数情况下，你会在顶层直接在包下定义扩展：

```kotlin
package org.example.declarations

fun List<String>.getLongestString() { /*...*/}
```

要在其声明包之外使用扩展，请在调用站点导入它：

```kotlin
package org.example.usage

import org.example.declarations.getLongestString

fun main() {
    val list = listOf("red", "green", "blue")
    list.getLongestString()
}
```

有关更多信息，请参阅[导入](packages.md#imports)。