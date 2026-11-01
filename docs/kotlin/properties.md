[//]: # (title: 属性)

在 Kotlin 中，属性允许你存储和管理数据，而无需编写专门的函数来访问或修改这些数据。
你可以在[类](classes.md)、[接口](interfaces.md)、[对象](object-declarations.md)、[伴生对象](object-declarations.md#companion-objects)中使用属性，
甚至可以在这些结构体外部将其用作顶层属性。

每个属性都包含一个名称、一个类型，以及一个自动生成的 `get()` 函数（称为 getter）。你可以使用 getter
来读取属性的值。如果该属性是可变的，它还会包含一个 `set()` 函数（称为 setter），允许
你修改该属性的值。

> Getter 和 setter 被统称为_访问器_（accessor）。
> 
{style="tip"}

## 声明属性 {id="declaring-properties"}

属性可以是可变的（`var`）或只读的（`val`）。
你可以将它们在 `.kt` 文件中声明为顶层属性。顶层属性可以看作是归属于某个包的全局变量：

```kotlin
// 文件：Constants.kt
package my.app

val pi = 3.14159
var counter = 0
```

你也可以在类、接口或对象内部声明属性：

```kotlin
// 包含属性的类
class Address {
    var name: String = "Holmes, Sherlock"
    var street: String = "Baker"
    var city: String = "London"
}

// 包含属性的接口
interface ContactInfo {
    val email: String
}

// 包含属性的对象
object Company {
    var name: String = "Detective Inc."
    val country: String = "UK"
}

// 实现该接口的类
class PersonContact : ContactInfo {
    override val email: String = "sherlock@example.com"
}
```

若要使用属性，直接通过其名称进行引用即可：

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
{kotlin-runnable="true" id="kotlin-access-properties"}

在 Kotlin 中，我们建议在声明属性时就对其进行初始化，以保证代码的安全性和可读性。不过，
在特殊情况下你也可以[稍后对其进行初始化](#late-initialized-properties-and-variables)。

如果编译器可以从初始值设定项或 getter 的返回值类型推断出属性类型，则属性类型的声明是可选的：

```kotlin
var initialized = 1 // 推断出的类型为 Int
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
{kotlin-runnable="true" id="kotlin-custom-getter"}

如果编译器能从 getter 中推断出属性类型，则可以省略类型声明：

```kotlin
val area get() = this.width * this.height
```

每次向属性赋值时（初始化期间除外），都会运行自定义 setter。
按照约定，setter 形参的名称为 `value`，但你也可以选择其他名称：

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
{kotlin-runnable="true" id="kotlin-custom-setter"}

### 更改可见性或添加注解 {id="changing-visibility-or-adding-annotations"}

在 Kotlin 中，你可以在不替换默认实现的情况下更改访问器的可见性或添加[注解](annotations.md)。
你无需在主体花括号 `{}` 内进行这些更改。

要更改访问器的可见性，请在 `get` 或 `set` 关键字前添加修饰符：

```kotlin
class BankAccount(initialBalance: Int) {
    var balance: Int = initialBalance
        // 仅类本身可以修改余额
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
{kotlin-runnable="true" id="kotlin-private-setter"}

要为访问器添加注解，请在 `get` 或 `set` 关键字前添加注解：

```kotlin
// 定义可应用于 getter 的注解
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

本例使用[反射](reflection.md)来展示 getter 和 setter 上存在哪些注解。

## 支持字段 {id="backing-fields"}

当属性的值需要存储在内存中时，编译器会自动为该属性生成支持字段。

例如，当你使用默认的 `get()` 和 `set()` 函数时，编译器会创建一个支持字段，因为它们
负责读取和写入已存储的值：

```kotlin
var count = 0
```

你可以在[自定义 `get()` 或 `set()` 函数](#custom-getters-and-setters)中使用 `field` 关键字来访问支持字段。
例如，你可以为 getter 或 setter 添加额外的逻辑，或者在属性更改时触发附加操作。

在下例中，`score` 属性在 `set()` 函数内部使用了支持字段，因此更新该值的同时还会触发日志记录事件：

```kotlin
class Scoreboard {
    var score: Int = 0
        set(value) {
            field = value
            // 在更新值时添加日志记录
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
{kotlin-runnable="true" id="kotlin-backing-field"}

编译器不会为所有属性都默认创建支持字段，因为某些属性可能并不需要它们。例如，`isEmpty`
属性就没有支持字段，因为它的值是在每次访问时根据 `size` 属性计算得出的：

```kotlin
val isEmpty: Boolean
    get() = this.size == 0
```

### 显式支持字段 {id="explicit-backing-fields"}

有时你可能需要更大的灵活性。例如，在设计 API 时，你可能希望允许在内部修改属性，但在外部只读。在这种情况下，你可以使用_显式支持字段_。

在以下示例中，`ShoppingCart` 类具有一个代表购物车中所有物品的 `items` 属性。
该类将 `items` 属性公开为只读的字符串列表，但在内部，它使用显式支持字段将数据存储在可变列表中：

```kotlin
class ShoppingCart {
    // 带有显式支持字段的公开只读视图
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

在这个例子中，编译器根据 `mutableListOf()` 调用推断出支持字段的类型为 `MutableList<String>`。
你也可以显式声明支持字段的类型：

```kotlin
val items: List<String>
    // 带有显式类型的显式支持字段
    field: MutableList<String> = mutableListOf()
```
{validate="false"}

在 `ShoppingCart` 类的示例中，编译器会将 `items` 属性智能转换为 `MutableList<String>` 类型，因此该
类可以通过 `add()` 和 `remove()` 函数向购物车中添加和移除物品。在类的外部，编译器
使用公开的属性类型 `List<String>`，因此 API 用户只能读取 `items` 列表中的内容。

#### 限制 {id="limitations"}

若要使用显式支持字段，属性及其支持字段本身必须遵循特定规则。属性
仅在满足以下条件时才能拥有显式支持字段：

* 没有自定义 getter。
* 为只读属性（`val`）。
* 不是 `open`。
* 不是[委托属性](delegated-properties.md)。
* 不是[编译时常量](#compile-time-constants)。

此外，支持字段的类型必须是该属性类型的子类型，且具有 [`private` 可见性](visibility-modifiers.md)。

你可以通过改用支持属性来绕过这些限制。

### 支持属性 {id="backing-properties"}

如果显式支持字段不符合你的使用场景，你可以尝试使用一种被称为_支持属性_的代码模式。

例如，如果你的属性需要一个自定义 getter：

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
{kotlin-runnable="true" id="kotlin-backing-property-custom-getter"}

> 在为支持属性命名时，请使用前导下划线以遵循 Kotlin [代码规范](coding-conventions.md#names-for-backing-properties)。
>
{style="tip"}

在这个示例中，`UserDirectory` 类包含一个只读的 `users` 属性，用于列出目录中的所有用户。
`_users` 变量则是包含实际列表的私有支持属性。公开的 `users` 属性的 getter
会在返回条目之前对其进行排序。

## 编译时常量 {id="compile-time-constants"}

如果只读属性的值在编译时已知，可以使用 `const` 修饰符将其标记为_编译时常量_。
编译时常量会在编译期内联，因此每次引用都会被替换为其字面值。对它们的访问
更加高效，因为无需调用 getter：

```kotlin
// 文件：AppConfig.kt
package com.example

// 编译时常量
const val MAX_LOGIN_ATTEMPTS = 3
```

编译时常量必须满足以下要求：

* 必须是顶层属性，或者为 [`object` 声明](object-declarations.md#object-declarations-overview)或[伴生对象](object-declarations.md#companion-objects)的成员。
* 必须使用 `String` 类型或[基本类型](types-overview.md)的值进行初始化。
* 不能拥有自定义 getter。

编译时常量仍然具有支持字段，因此你可以使用[反射](reflection.md)与其进行交互。

你还可以在注解中使用这些属性：

```kotlin
const val SUBSYSTEM_DEPRECATED: String = "This subsystem is deprecated"

@Deprecated(SUBSYSTEM_DEPRECATED) fun processLegacyOrders() { ... }
```

## 延迟初始化属性与变量 {id="late-initialized-properties-and-variables"}

通常情况下，必须在构造函数中初始化属性。
然而，这并不总是方便的。例如，你可能会通过依赖注入或在单元测试的 setup 方法中来初始化属性。

为了应对这些情况，可以使用 `lateinit` 修饰符标记该属性：

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
* 类主体内部的属性。

对于类属性：

* 不能在主构造函数中声明它们。
* 它们不得具有自定义 getter 或 setter。

在所有情况下，该属性或变量必须是不可为空的（non-nullable），且不能是[基本类型](types-overview.md)。

如果在初始化之前访问 `lateinit` 属性，Kotlin 会抛出一个特定的异常，指出正在访问未初始化的属性：

```kotlin
class ReportGenerator {
    lateinit var report: String

    fun printReport() {
        // 在初始化之前被访问，因此抛出异常
        println(report)
    }
}

fun main() {
    val generator = ReportGenerator()
    generator.printReport()
    // 线程 "main" 中的异常 kotlin.UninitializedPropertyAccessException: lateinit property report has not been initialized
}
```
{kotlin-runnable="true" id="kotlin-lateinit-property" validate="false"}

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
{kotlin-runnable="true" id="kotlin-lateinit-property-check-initialization"}

仅当可以在代码中直接访问某个属性时，才能对其使用 `isInitialized`。该属性必须声明在
同一个类中、外部类中，或作为同一文件中的顶层属性声明。

## 重写属性 {id="overriding-properties"}

请参阅[重写属性](inheritance.md#overriding-properties)。

## 委托属性 {id="delegated-properties"}

为了重用逻辑并减少代码重复，你可以将获取和设置属性的职责委托给另一个单独的对象。

委托访问器行为可以保持属性访问器逻辑的集中化，使其更容易复用。这种方法
在实现如下行为时非常有用：

* 延迟计算值（惰性加载）。
* 通过指定键从映射（Map）中读取。
* 访问数据库。
* 在访问属性时通知监听器。

你可以自己在库中实现这些常见行为，也可以使用外部库提供的现有委托。
欲了解更多信息，请参阅[委托属性](delegated-properties.md)。