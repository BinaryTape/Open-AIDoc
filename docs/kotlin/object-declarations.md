[//]: # (title: 对象声明与对象表达式)

在 Kotlin 中，对象允许你一步完成类的定义以及其实例的创建。
当你需要一个可复用的单例实例或一次性对象时，这非常有用。
为了处理这些场景，Kotlin 提供了两种关键方法：用于创建单例的 *对象声明 (object declarations)*，以及用于创建匿名一次性对象的 *对象表达式 (object expressions)*。

> 单例确保一个类只有一个实例，并为其提供一个全局访问点。
> 
{style="tip"}

对象声明和对象表达式最适合用于以下场景：

* **将单例用于共享资源：** 你需要确保整个应用程序中仅存在该类的一个实例。例如管理数据库连接池。
* **创建工厂方法：** 你需要一种方便且高效创建实例的方式。[伴生对象](#companion-objects)允许你定义绑定到类的类级函数和属性，从而简化这些实例的创建和管理。
* **临时修改现有类的行为：** 你希望修改现有类的行为，而无需创建新的子类。例如，为特定操作临时向对象添加功能。
* **需要类型安全设计：** 你需要使用对象表达式一次性实现接口或[抽象类](classes.md#abstract-classes)。这对于按钮点击处理程序等场景非常有用。

## 对象声明 {id="object-declarations"}
{id="object-declarations-overview"}

你可以在 Kotlin 中使用对象声明来创建对象的单个实例，对象声明在 `object` 关键字之后始终带有一个名称。
这允许你一步完成类的定义及其单一实例的创建，这对于实现单例非常有用：

```kotlin
//sampleStart
// 声明一个单例对象来管理数据提供程序
object DataProviderManager {
    private val providers = mutableListOf<DataProvider>()

    // 注册新的数据提供程序
    fun registerDataProvider(provider: DataProvider) {
        providers.add(provider)
    }

    // 获取所有已注册的数据提供程序
    val allDataProviders: Collection<DataProvider> 
        get() = providers
}
//sampleEnd

// 数据提供程序接口示例
interface DataProvider {
    fun provideData(): String
}

// 数据提供程序实现示例
class ExampleDataProvider : DataProvider {
    override fun provideData(): String {
        return "Example data"
    }
}

fun main() {
    // 创建 ExampleDataProvider 的实例
    val exampleProvider = ExampleDataProvider()

    // 若要引用该对象，直接使用其名称即可
    DataProviderManager.registerDataProvider(exampleProvider)

    // 获取并输出所有数据提供程序
    println(DataProviderManager.allDataProviders.map { it.provideData() })
    // [Example data]
}
```
{kotlin-runnable="true" id="object-declaration-register-provider"}

> 对象声明的初始化是线程安全的，并且是在首次访问时进行的。
>
{style="tip"}

若要引用该 `object`，直接使用其名称即可：

```kotlin
DataProviderManager.registerDataProvider(exampleProvider)
```

对象声明也可以拥有超类型，这与[匿名对象可以继承现有类或实现接口](#inherit-anonymous-objects-from-supertypes)类似：

```kotlin
object DefaultListener : MouseAdapter() {
    override fun mouseClicked(e: MouseEvent) { ... }

    override fun mouseEntered(e: MouseEvent) { ... }
}
```

与变量声明一样，对象声明不是表达式，因此它们不能用在赋值语句的右侧：

```kotlin
// 语法错误：对象表达式不能绑定名称。
val myObject = object MySingleton {
    val name = "Singleton"
}
```

你可以将对象声明嵌套在其他对象声明或非内部类中，但不能直接嵌套在函数内部，因为对象声明不能是局部的。嵌套的对象声明仍然是单例，你可以通过其外部对象或类的名称来访问它。

由于对象声明不能直接嵌套在函数内部，因此请改用[对象表达式](#object-expressions)。此类对象是匿名的：你可以将它们赋值给局部变量，但不能为 `object` 关键字指定名称：

```kotlin
// 声明嵌套在另一个对象声明中的对象
object Outer {
    val name = "Outer"

    object Nested {
        val name = "Nested in Outer"
    }
}

// 声明嵌套在类中的对象
class Server {
    object Config {
        const val port = 8080
    }
}

fun main() {
    // 要访问嵌套对象，请使用其外层对象的名称进行引用
    println(Outer.Nested.name)
    // Nested in Outer

    println(Server.Config.port)
    // 8080

    // 对象表达式可以嵌套在函数内部
    val local = object {
        val name = "Nested in main()"
    }
    println(local.name)
    // Nested in main()

    // 对象声明不能嵌套在函数内部
    // object Local {
    //     val name = "Nested in main()"
    // }
}
```
{kotlin-runnable="true" id="object-declaration-nested"}

### 数据对象 {id="data-objects"}

在 Kotlin 中输出普通对象声明时，其字符串表示形式既包含其名称，也包含该 `object` 的哈希值：

```kotlin
object MyObject

fun main() {
    println(MyObject) 
    // MyObject@hashcode
}
```
{kotlin-runnable="true" id="object-declaration-plain"}

然而，通过使用 `data` 修饰符标记对象声明，你可以指示编译器在调用 `toString()` 时返回该对象的实际名称，其工作机制与[数据类](data-classes.md)相同：

```kotlin
data object MyDataObject {
    val number: Int = 3
}

fun main() {
    println(MyDataObject) 
    // MyDataObject
}
```
{kotlin-runnable="true" id="object-declaration-dataobject"}

此外，编译器还会为你的 `data object` 生成若干函数：

* `toString()` 返回数据对象的名称
* `equals()`/`hashCode()` 用于启用相等性检查以及基于散列的集合

  > 你不能为 `data object` 提供自定义的 `equals` 或 `hashCode` 实现。
  >
  {style="note"}

`data object` 的 `equals()` 函数可确保所有具有该 `data object` 类型的对象都被视为相等。在大多数情况下，运行时只会存在该 `data object` 的单个实例，因为 `data object` 声明的是单例。然而，在运行时生成了同一类型的另一个对象的边缘情况下（例如，通过 `java.lang.reflect` 使用平台反射，或者在底层使用该 API 的 JVM 序列化库），这可确保这些对象被视为相等。

> 请确保仅对 `data object` 进行结构化比较（使用 `==` 运算符），切勿通过引用比较（使用 `===` 运算符）。这有助于你在运行时存在多个数据对象实例时避免陷阱。
>
{style="warning"}

```kotlin
import java.lang.reflect.Constructor

data object MySingleton

fun main() {
    val evilTwin = createInstanceViaReflection()

    println(MySingleton) 
    // MySingleton

    println(evilTwin) 
    // MySingleton

    // 即使某个库强制创建了 MySingleton 的第二个实例，
    // 其 equals() 函数仍返回 true：
    println(MySingleton == evilTwin) 
    // true

    // 不要使用 === 比较数据对象
    println(MySingleton === evilTwin) 
    // false
}

fun createInstanceViaReflection(): MySingleton {
    // Kotlin 反射不允许实例化数据对象。
    // 这将“强制”创建一个新的 MySingleton 实例（使用 Java 平台反射）
    // 请勿自行执行此操作！
    return (MySingleton.javaClass.declaredConstructors[0].apply { isAccessible = true } as Constructor<MySingleton>).newInstance()
}
```

生成的 `hashCode()` 函数具有与 `equals()` 函数一致的行为，因此 `data object` 的所有运行时实例都具有相同的哈希码。

#### 数据对象与数据类之间的差异 {id="differences-between-data-objects-and-data-classes"}

虽然 `data object` 与 `data class` 声明经常一起使用并且有一些相似之处，但有某些函数不会为 `data object` 生成：

* 没有 `copy()` 函数。由于 `data object` 声明旨在用作单例，因此不会生成 `copy()` 函数。单例将类的实例化限制为单个实例，如果允许创建该实例的副本则会破坏该原则。
* 没有 `componentN()` 函数。与 `data class` 不同，`data object` 不具有任何数据属性。由于尝试在没有数据属性的情况下对此类对象进行析构毫无意义，因此不会生成 `componentN()` 函数。

#### 在密封层次结构中使用数据对象 {id="use-data-objects-with-sealed-hierarchies"}

数据对象声明对于密封层次结构（如[密封类或密封接口](sealed-classes.md)）尤其有用。它们使你能够与可能在对象旁边定义的数据类保持对称。

在此示例中，将 `EndOfFile` 声明为 `data object` 而不是普通 `object`，意味着它将自动获取 `toString()` 函数，而无需手动重写它：

```kotlin
sealed interface ReadResult
data class Number(val number: Int) : ReadResult
data class Text(val text: String) : ReadResult
data object EndOfFile : ReadResult

fun main() {
    println(Number(7)) 
    // Number(number=7)
    println(EndOfFile) 
    // EndOfFile
}
```
{kotlin-runnable="true" id="data-objects-sealed-hierarchies"}

### 伴生对象 {id="companion-objects"}

*伴生对象 (Companion objects)* 允许你定义类级别的函数和属性。这使得创建工厂方法、保存常量以及访问共享实用程序变得非常容易。

类内部的对象声明可以使用 `companion` 关键字标记：

```kotlin
class MyClass {
    companion object Factory {
        fun create(): MyClass = MyClass()
    }
}
```

只需使用类名作为限定符即可调用 `companion object` 的成员：

```kotlin
class User(val name: String) {
    // 定义一个伴生对象，充当创建 User 实例的工厂
    companion object Factory {
        fun create(name: String): User = User(name)
    }
}

fun main(){
    // 使用类名作为限定符调用伴生对象的工厂方法。
    // 创建一个新的 User 实例
    val userInstance = User.create("John Doe")
    println(userInstance.name)
    // John Doe
}
```
{kotlin-runnable="true" id="object-expression-companion-object"}

伴生对象的名称可以省略，在这种情况下将使用默认名称 `Companion`：

```kotlin
class User(val name: String) {
    // 定义一个没有名称的伴生对象
    companion object { }
}

// 访问伴生对象
val companionUser = User.Companion
```

类成员可以访问其对应 `companion object` 的 `private` 成员：

```kotlin
class User(val name: String) {
    companion object {
        private val defaultGreeting = "Hello"
    }

    fun sayHi() {
        println(defaultGreeting)
    }
}
User("Nick").sayHi()
// Hello
```

当单独使用类名时，它充当对该类伴生对象的引用，无论伴生对象是否命名：

```kotlin
//sampleStart
class User1 {
    // 定义一个命名的伴生对象
    companion object Named {
        fun show(): String = "User1's Named Companion Object"
    }
}

// 使用类名引用 User1 的伴生对象
val reference1 = User1

class User2 {
    // 定义一个未命名的伴生对象
    companion object {
        fun show(): String = "User2's Companion Object"
    }
}

// 使用类名引用 User2 的伴生对象
val reference2 = User2
//sampleEnd

fun main() {
    // 调用 User1 伴生对象中的 show() 函数
    println(reference1.show()) 
    // User1's Named Companion Object

    // 调用 User2 伴生对象中的 show() 函数
    println(reference2.show()) 
    // User2's Companion Object
}
```
{kotlin-runnable="true" id="object-expression-companion-object-names"}

尽管 Kotlin 中伴生对象的成员看起来类似于其他语言中的 static 成员，但它们实际上是伴生对象的实例成员，即它们属于该对象本身。这使得伴生对象能够实现接口：

```kotlin
interface Factory<T> {
    fun create(name: String): T
}

class User(val name: String) {
    // 定义一个实现 Factory 接口的伴生对象
    companion object : Factory<User> {
        override fun create(name: String): User = User(name)
    }
}

fun main() {
    // 将伴生对象用作 Factory
    val userFactory: Factory<User> = User
    val newUser = userFactory.create("Example User")
    println(newUser.name)
    // Example User
}
```
{kotlin-runnable="true" id="object-expression-factory"}

然而，在 JVM 上，如果你使用 `@JvmStatic` 注解，可以将伴生对象的成员生成为真正的 static 方法和字段。更多详情请参阅 [Java 互操作性](java-to-kotlin-interop.md#static-fields)部分。

## 对象表达式 {id="object-expressions"}

对象表达式在声明类的同时创建该类的实例，但不会为它们命名。这些类适用于一次性使用的场景。它们既可以从头创建，也可以继承自现有类或实现接口。这些类的实例也称为 *匿名对象*，因为它们是由表达式定义的，而不是由名称定义的。

### 从头创建匿名对象 {id="create-anonymous-objects-from-scratch"}

对象表达式以 `object` 关键字开头。

如果该对象不扩展任何类也不实现任何接口，你可以直接在 `object` 关键字后面的花括号中定义对象的成员：

```kotlin
fun main() {
//sampleStart
    val helloWorld = object {
        val hello = "Hello"
        val world = "World"
        // 对象表达式扩展了 Any 类，该类已经具有 toString() 函数，
        // 因此必须对其进行重写
        override fun toString() = "$hello $world"
    }

    print(helloWorld)
    // Hello World
//sampleEnd
}
```
{kotlin-runnable="true" id="object-expression-object"}

### 继承超类型的匿名对象 {id="inherit-anonymous-objects-from-supertypes"}

要创建继承自某种（或某些）类型的匿名对象，请在 `object` 和冒号 `:` 后面指定该类型。然后实现或重写该类的成员，就像你正在[继承](inheritance.md)它一样：

```kotlin
window.addMouseListener(object : MouseAdapter() {
    override fun mouseClicked(e: MouseEvent) { /*...*/ }

    override fun mouseEntered(e: MouseEvent) { /*...*/ }
})
```

如果超类型具有构造函数，请向其传递适当的构造函数实参。在冒号后可以指定多个超类型，以逗号分隔：

```kotlin
//sampleStart
// 创建一个带有 balance 属性的 open 类 BankAccount
open class BankAccount(initialBalance: Int) {
    open val balance: Int = initialBalance
}

// 定义一个带有 execute() 函数的接口 Transaction
interface Transaction {
    fun execute()
}

// 在 BankAccount 上执行特殊交易的函数
fun specialTransaction(account: BankAccount) {
    // 创建一个继承自 BankAccount 类并实现 Transaction 接口的匿名对象
    // 所提供账户的余额被传递给 BankAccount 超类的构造函数
    val temporaryAccount = object : BankAccount(account.balance), Transaction {

        override val balance = account.balance + 500  // 临时奖励金

        // 实现 Transaction 接口中的 execute() 函数
        override fun execute() {
            println("Executing special transaction. New balance is $balance.")
        }
    }
    // 执行交易
    temporaryAccount.execute()
}
//sampleEnd
fun main() {
    // 创建一个初始余额为 1000 的 BankAccount
    val myAccount = BankAccount(1000)
    // 对创建的账户执行特殊交易
    specialTransaction(myAccount)
    // Executing special transaction. New balance is 1500.
}
```
{kotlin-runnable="true" id="object-expression-anonymous-object"}

### 将匿名对象用作返回值类型和值类型 {id="use-anonymous-objects-as-return-and-value-types"}

当你从局部或 [`private`](visibility-modifiers.md#packages) 函数或属性返回匿名对象时，该匿名对象的所有成员都可以通过该函数或属性访问：

```kotlin
//sampleStart
class UserPreferences {
    private fun getPreferences() = object {
        val theme: String = "Dark"
        val fontSize: Int = 14
    }

    fun printPreferences() {
        val preferences = getPreferences()
        println("Theme: ${preferences.theme}, Font Size: ${preferences.fontSize}")
    }
}
//sampleEnd

fun main() {
    val userPreferences = UserPreferences()
    userPreferences.printPreferences()
    // Theme: Dark, Font Size: 14
}
```
{kotlin-runnable="true" id="object-expression-object-return"}

这允许你返回具有特定属性的匿名对象，从而提供一种无需创建单独类即可封装数据或行为的简单方法。

如果返回匿名对象的函数或属性具有 `public`、`protected` 或 `internal` 可见性，则其实际类型为：

* 如果匿名对象没有声明超类型，则为 `Any`。
* 如果匿名对象恰好有一个声明的超类型，则为该超类型。
* 如果声明了多个超类型，则为显式声明的类型。

在所有这些情况下，在匿名对象中添加的成员均无法访问。如果重写的成员在该函数或属性的实际类型中声明，则这些成员可以访问。例如：

```kotlin
//sampleStart
interface Notification {
    // 在 Notification 接口中声明 notifyUser()
    fun notifyUser()
}

interface DetailedNotification

class NotificationManager {
    // 返回值类型为 Any。message 属性不可访问。
    // 当返回值类型为 Any 时，只有 Any 类的成员可以访问。
    fun getNotification() = object {
        val message: String = "General notification"
    }

    // 返回值类型为 Notification，因为匿名对象仅实现了一个接口
    // notifyUser() 函数可访问，因为它是 Notification 接口的一部分
    // message 属性不可访问，因为它未在 Notification 接口中声明
    fun getEmailNotification() = object : Notification {
        override fun notifyUser() {
            println("Sending email notification")
        }
        val message: String = "You've got mail!"
    }

    // 返回值类型为 DetailedNotification。notifyUser() 函数和 message 属性均不可访问
    // 只有在 DetailedNotification 接口中声明的成员才可访问
    fun getDetailedNotification(): DetailedNotification = object : Notification, DetailedNotification {
        override fun notifyUser() {
            println("Sending detailed notification")
        }
        val message: String = "Detailed message content"
    }
}
//sampleEnd
fun main() {
    // 这不会产生任何输出
    val notificationManager = NotificationManager()

    // 这里的 message 属性不可访问，因为返回值类型为 Any
    // 这不会产生任何输出
    val notification = notificationManager.getNotification()

    // notifyUser() 函数可访问
    // 这里的 message 属性不可访问，因为返回值类型为 Notification
    val emailNotification = notificationManager.getEmailNotification()
    emailNotification.notifyUser()
    // Sending email notification

    // 这里的 notifyUser() 函数和 message 属性均不可访问，因为返回值类型为 DetailedNotification
    // 这不会产生任何输出
    val detailedNotification = notificationManager.getDetailedNotification()
}
```
{kotlin-runnable="true" id="object-expression-object-override"}

### 从匿名对象访问变量 {id="access-variables-from-anonymous-objects"}

对象表达式体内的代码可以访问来自外部作用域的变量：

```kotlin
import java.awt.event.MouseAdapter
import java.awt.event.MouseEvent

fun countClicks(window: JComponent) {
    var clickCount = 0
    var enterCount = 0

    // MouseAdapter 为鼠标事件函数提供默认实现
    // 模拟 MouseAdapter 处理鼠标事件
    window.addMouseListener(object : MouseAdapter() {
        override fun mouseClicked(e: MouseEvent) {
            clickCount++
        }

        override fun mouseEntered(e: MouseEvent) {
            enterCount++
        }
    })
    // clickCount 和 enterCount 变量在对象表达式内部是可访问的
}
```

## 对象声明与对象表达式之间的行为差异 {id="behavior-difference-between-object-declarations-and-expressions"}

对象声明和对象表达式在初始化行为上存在差异：

* 对象表达式在被使用的地方被*立即*执行（并初始化）。
* 对象声明是在首次被访问时*延迟*初始化的。
* 伴生对象在其对应的类被加载（解析）时初始化，这与 Java static 初始化的语义相吻合。