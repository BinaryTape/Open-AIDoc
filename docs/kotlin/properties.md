[//]: # (title: 属性)

在 Kotlin 中，属性允许你存储和管理数据，而无需编写专门用于访问或修改这些数据的函数。
你可以在[类](classes.md)、[接口](interfaces.md)、[对象](object-declarations.md)、[伴生对象](object-declarations.md#companion-objects)中使用属性，
甚至可以在这些结构之外将其作为顶层属性使用。

每个属性都包含名称、类型，以及一个自动生成的 `get()` 函数（称为 getter）。你可以使用 getter
来读取属性的值。如果属性是可变的，它还会包含一个 `set()` 函数（称为 setter），允许
你修改属性的值。

> Getter 和 setter 被统称为*访问器 (accessor)*。
> 
{style="tip"}

## 声明属性 {id="declaring-properties"}

属性可以是可变的（`var`）或只读的（`val`）。
你可以在 `.kt` 文件中将其声明为顶层属性。可以将顶层属性视为属于某个包的全局变量：

```kotlin
// File: Constants.kt
package my.app

val pi = 3.14159
var counter = 0
```

你也可以在类、接口或对象内部声明属性：

```kotlin
// 带有属性的类
class Address {
    var name: String = "Holmes, Sherlock"
    var street: String = "Baker"
    var city: String = "London"
}

// 带有属性的接口
interface ContactInfo {
    val email: String
}

// 带有属性的对象
object Company {
    var name: String = "Detective Inc."
    val country: String = "UK"
}

// 实现该接口的类
class PersonContact : ContactInfo {
    override val email: String = "sherlock@example.com"
}
```

要使用属性，只需通过其名称引用即可：

```kotlin
class Address {
    var name: String = "Holmes, Sherlock"
    var street: String = "Baker"
    var city: String = "London"
}

interface ContactInfo {
    val email: String
}

object Company {
    var name: String = "Detective Inc."
    val country: String = "UK"
}

class PersonContact : ContactInfo {
    override val email: String = "sherlock@example.com"
}

//sampleStart
fun copyAddress(address: Address): Address {
    val result = Address()
    // 访问 result 实例中的属性
    result.name = address.name
    result.street = address.street
    result.city = address.city
    return result
}

fun main() {
    val sherlockAddress = Address()
    val copy = copyAddress(sherlockAddress)
    // 访问 copy 实例中的属性
    println("Copied address: ${copy.name}, ${copy.street}, ${copy.city}")
    // Copied address: Holmes, Sherlock, Baker, London

    // 访问 Company 对象中的属性
    println("Company: ${Company.name} in ${Company.country}")
    // Company: Detective Inc. in UK
    
    val contact = PersonContact()
    // 访问 contact 实例中的属性
    println("Email: ${contact.email}")
    // Email: sherlock@email.com
}
//sampleEnd
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3" id="kotlin-access-properties"}

在 Kotlin 中，为了保证代码的安全性和易读性，我们建议在声明属性时就对其进行初始化。不过，
在特殊情况下，你也可以[稍后进行初始化](#late-initialized-properties-and-variables)。

如果编译器可以根据初始值设定项或 getter 的返回值类型推断出属性类型，则可以省略类型声明：

```kotlin
var initialized = 1 // 推断类型为 Int
var allByDefault    // 错误：属性必须初始化。
```
{validate="false"}

## 自定义 getter 与 setter {id="custom-getters-and-setters"}

默认情况下，Kotlin 会自动生成 getter 和 setter。当你需要额外的逻辑时（例如验证、格式化或基于其他属性进行计算），
可以定义自己的自定义访问器。

每次访问属性时，都会运行自定义 getter：

```kotlin
//sampleStart
class Rectangle(val width: Int, val height: Int) {
    val area: Int
        get() = this.width * this.height
}
//sampleEnd
fun main() {
    val rectangle = Rectangle(3, 4)
    println("Width=${rectangle.width}, height=${rectangle.height}, area=${rectangle.area}")
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3" id="kotlin-custom-getter"}

如果编译器可以根据 getter 推断出类型，你可以省略该类型：

```kotlin
val area get() = this.width * this.height
```

每次为属性赋值时（初始化期间除外），都会运行自定义 setter。
按照惯例，setter 形参的名称为 `value`，但你也可以选择其他名称：

```kotlin
class Point(var x: Int, var y: Int) {
    var coordinates: String
        get() = "$x,$y"
        set(value) {
            val parts = value.split(",")
            x = parts[0].toInt()
            y = parts[1].toInt()
        }
}

fun main() {
    val location = Point(1, 2)
    println(location.coordinates) 
    // 1,2

    location.coordinates = "10,20"
    println("${location.x}, ${location.y}") 
    // 10, 20
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3" id="kotlin-custom-setter"}

### 更改可见性或添加注解 {id="changing-visibility-or-adding-annotations"}

在 Kotlin 中，你可以更改访问器的可见性或添加[注解](annotations.md)，而无需替换其默认实现。
你不需要在花括号 `{}` 体内进行这些修改。

要更改访问器的可见性，请在 `get` 或 `set` 关键字前添加修饰符：

```kotlin
class BankAccount(initialBalance: Int) {
    var balance: Int = initialBalance
        // 仅类内部可以修改 balance
        private set 

    fun deposit(amount: Int) {
        if (amount > 0) balance += amount
    }

    fun withdraw(amount: Int) {
        if (amount > 0 && amount <= balance) balance -= amount
    }
}

fun main() {
    val account = BankAccount(100)
    println("Initial balance: ${account.balance}") 
    // 100

    account.deposit(50)
    println("After deposit: ${account.balance}") 
    // 150

    account.withdraw(70)
    println("After withdrawal: ${account.balance}") 
    // 80

    // account.balance = 1000  
    // 错误：无法赋值，因为 setter 是 private 的
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3" id="kotlin-private-setter"}

要为访问器添加注解，请在 `get` 或 `set` 关键字前添加注解：

```kotlin
// 定义一个可以应用于 getter 的注解
@Target(AnnotationTarget.PROPERTY_GETTER)
annotation class Inject

class Service {
    var dependency: String = "Default Service"
        // 为 getter 添加注解
        @Inject get 
}

fun main() {
    val service = Service()
    println(service.dependency)
    // Default service
    println(service::dependency.getter.annotations)
    // [@Inject()]
    println(service::dependency.setter.annotations)
    // []
}
```
{validate="false"}

此示例使用[反射](reflection.md)来展示 getter 和 setter 上存在哪些注解。

## 支持字段 {id="backing-fields"}

当属性的值需要存储在内存中时，编译器会自动为属性生成支持字段（backing field）。

例如，当你使用默认的 `get()` 和 `set()` 函数时，编译器会创建一个支持字段，因为它们
会读写所存储的值：

```kotlin
var count = 0
```

你可以在[自定义 `get()` 或 `set()` 函数](#custom-getters-and-setters)中使用 `field` 关键字来访问支持字段。
例如，你可以为 getter 或 setter 添加额外逻辑，或者在属性更改时触发其他操作。

在此示例中，`score` 属性在 `set()` 函数内部使用了支持字段，因此在更新值的同时也会触发日志记录：

```kotlin
class Scoreboard {
    var score: Int = 0
        set(value) {
            field = value
            // 更新值时添加日志记录
            println("Score updated to $field")
        }
}

fun main() {
    val board = Scoreboard()
    board.score = 10  
    // Score updated to 10
    board.score = 20  
    // Score updated to 20
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3" id="kotlin-backing-field"}

默认情况下并不会为所有属性都创建支持字段，因为有些属性可能并不需要。例如，`isEmpty`
属性就没有支持字段，因为每次访问该属性时，它的值都是根据 `size` 属性计算得出的：

```kotlin
val isEmpty: Boolean
    get() = this.size == 0
```

### 显式支持字段 {id="explicit-backing-fields"}

有时你可能需要更大的灵活性。例如，当你设计的 API 允许在内部修改属性但在外部只读时。在这些情况下，可以使用*显式支持字段 (explicit backing field)*。

在以下示例中，`ShoppingCart` 类有一个表示购物车中所有商品的 `items` 属性。
该类将 `items` 属性以只读字符串列表的形式暴露给外部，但在内部通过显式支持字段将其存储在可变列表中：

```kotlin
class ShoppingCart {
    // 带有显式支持字段的公共只读视图
    val items: List<String>
        field = mutableListOf()
    
    fun addItem(item: String) {
        items.add(item)
    }

    fun removeItem(item: String) {
        items.remove(item)
    }
}

fun main() {
    val cart = ShoppingCart()
    cart.addItem("Apple")
    cart.addItem("Banana")

    println(cart.items) 
    // [Apple, Banana]
    
    cart.removeItem("Apple")
    println(cart.items) 
    // [Banana]
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="2.4" id="kotlin-explicit-backing-field"}

在此示例中，编译器根据 `mutableListOf()` 调用推断出支持字段的类型为：`MutableList<String>`。
你也可以显式声明支持字段的类型：

```kotlin
val items: List<String>
    // 带有显式类型的显式支持字段
    field: MutableList<String> = mutableListOf()
```
{validate="false"}

在 `ShoppingCart` 类的示例中，编译器将 `items` 属性智能转换为 `MutableList<String>` 类型，因此该类
可以通过 `add()` 和 `remove()` 函数向购物车添加和移除商品。在类外部，编译器
使用公共属性类型 `List<String>`，因此 API 使用者只能读取 `items` 列表中的内容。

#### 限制 {id="limitations"}

要使用显式支持字段，属性及其支持字段本身必须遵循特定规则。属性
仅在满足以下条件时才能拥有显式支持字段：

* 没有自定义 getter。
* 为只读（`val`）。
* 不是 `open` 的。
* 不是[委托属性](delegated-properties.md)。
* 不是[编译时常量](#compile-time-constants)。

此外，支持字段的类型必须是属性类型的子类型，并且具有 [`private` 可见性](visibility-modifiers.md)。

你可以通过改用支持属性来绕过这些限制。

### 支持属性 {id="backing-properties"}

如果显式支持字段不满足你的使用场景，可以尝试使用名为*支持属性 (backing property)* 的编码模式。

例如，当你的属性需要自定义 getter 时：

```kotlin
class UserDirectory {
    private val _users = mutableListOf(
        "sarah",
        "mike",
        "emma"
    )

    val users: List<String>
        get() = _users.sorted()

    fun addUser(username: String) {
        _users.add(username)
    }
}

fun main() {
    val directory = UserDirectory()

    directory.addUser("alex")
    println(directory.users)
    // [alex, emma, mike, sarah]
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3" id="kotlin-backing-property-custom-getter"}

> 为支持属性命名时请使用前导下划线，以符合 Kotlin [编码规范](coding-conventions.md#names-for-backing-properties)。
>
{style="tip"}

在此示例中，`UserDirectory` 类具有一个只读的 `users` 属性，用于列出目录中的每个用户。
`_users` 变量则是包含真实列表的私有支持属性。公共属性 `users` 的 getter
在返回条目之前会对它们进行排序。

## 编译时常量 {id="compile-time-constants"}

如果只读属性的值在编译时已知，可以使用 `const` 修饰符将其标记为*编译时常量*。
编译时常量会在编译期内联，因此对它的每个引用都会被替换为其具体的值。由于不会调用 getter，
对其访问也会更加高效：

```kotlin
// File: AppConfig.kt
package com.example

// 编译时常量
const val MAX_LOGIN_ATTEMPTS = 3
```

编译时常量必须满足以下要求：

* 必须是顶层属性，或者为 [`object` 声明](object-declarations.md#object-declarations-overview)或[伴生对象](object-declarations.md#companion-objects)的成员。
* 必须使用 `String` 类型或[基本类型](types-overview.md)的值进行初始化。
* 不能拥有自定义 getter。

编译时常量仍然具有支持字段，因此你可以通过[反射](reflection.md)与其交互。

你也可以在注解中使用这些属性：

```kotlin
const val SUBSYSTEM_DEPRECATED: String = "This subsystem is deprecated"

@Deprecated(SUBSYSTEM_DEPRECATED) fun processLegacyOrders() { ... }
```

## 延迟初始化属性与变量 {id="late-initialized-properties-and-variables"}

通常情况下，属性必须在构造函数中初始化。
然而，这并不总是方便的。例如，你可能需要通过依赖注入
或在单元测试的设置方法中初始化属性。

为了应对这些情况，可以使用 `lateinit` 修饰符标记属性：

```kotlin
public class OrderServiceTest {
    lateinit var orderService: OrderService

    @SetUp fun setup() {
        orderService = OrderService()
    }

    @Test fun processesOrderSuccessfully() {
        // 直接调用 orderService，无需进行 null 检查
        // 或初始化检查
        orderService.processOrder()  
    }
}
```

你可以在声明为以下形式的 `var` 属性上使用 `lateinit` 修饰符：

* 顶层属性。
* 局部变量。
* 类体内部的属性。

对于类属性：

* 不能在主构造函数中声明它们。
* 它们不得拥有自定义 getter 或 setter。

在所有情况下，属性或变量都必须是非空的，且不能是[基本类型](types-overview.md)。

如果在初始化之前访问 `lateinit` 属性，Kotlin 会抛出一个特定的异常，指明被访问的属性尚未初始化：

```kotlin
class ReportGenerator {
    lateinit var report: String

    fun printReport() {
        // 在初始化前被访问，因此会抛出异常
        println(report)
    }
}

fun main() {
    val generator = ReportGenerator()
    generator.printReport()
    // 线程 "main" 中的异常 kotlin.UninitializedPropertyAccessException: lateinit property report has not been initialized
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3" id="kotlin-lateinit-property" validate="false"}

要检查 `lateinit var` 是否已经初始化，请在该[属性的引用](lambdas.md#property-references)上使用 [`isInitialized`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin/is-initialized.html) 属性：

```kotlin
class WeatherStation {
    lateinit var latestReading: String

    fun printReading() {
        // 检查属性是否已初始化
        if (this::latestReading.isInitialized) {
            println("Latest reading: $latestReading")
        } else {
            println("No reading available")
        }
    }
}

fun main() {
    val station = WeatherStation()

    station.printReading()
    // No reading available
    station.latestReading = "22°C, sunny"
    station.printReading()
    // Latest reading: 22°C, sunny
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3" id="kotlin-lateinit-property-check-initialization"}

只有在代码中能够直接访问某个属性时，才能在该属性上使用 `isInitialized`。该属性必须声明在
同一个类中、外部类中，或者作为同一文件中的顶层属性。

## 重写属性 {id="overriding-properties"}

请参阅[重写属性](inheritance.md#overriding-properties)。

## 委托属性 {id="delegated-properties"}

为了复用逻辑并减少代码重复，你可以将获取和设置属性的职责委托给另一个单独的对象。

委托访问器行为可以使属性的访问器逻辑保持集中，从而更容易复用。在实现以下行为时，
这种方式非常有用：

* 延迟计算值（Lazy loading）。
* 根据给定键从映射中读取。
* 访问数据库。
* 在访问属性时通知监听器。

你可以在库中自行实现这些常见行为，也可以使用外部库提供的现有委托。
更多信息请参阅[委托属性](delegated-properties.md)。