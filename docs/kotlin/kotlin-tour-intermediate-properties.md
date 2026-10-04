[//]: # (title: 属性)

<no-index/>

在初学者教程中，您学习了如何使用属性来声明类实例的特征以及如何访问它们。本章将更深入地探讨属性在 Kotlin 中的工作原理，并探索在代码中使用属性的其他方式。

## 支持字段 {id="backing-fields"}

在 Kotlin 中，属性具有默认的 `get()` 和 `set()` 函数（称为属性访问器），用于处理检索和修改其值。虽然这些默认函数在代码中不是显式可见的，但编译器会自动生成它们以在后台管理属性访问。这些访问器使用**支持字段** (backing field) 来存储实际的属性值。

满足以下任一条件时，就会存在支持字段：

* 属性使用了默认的 `get()` 或 `set()` 函数。
* 尝试在代码中使用 `field` 关键字访问该属性的值。

> `get()` 和 `set()` 函数也称为 getter 和 setter。
>
{style="tip"}

例如，以下代码中的 `category` 属性没有自定义的 `get()` 或 `set()` 函数，因此使用的是默认实现：

```kotlin
class Contact(val id: Int, var email: String) {
    var category: String = ""
}
```

在底层，这等同于以下伪代码：

```kotlin
class Contact(val id: Int, var email: String) {
    var category: String = ""
        get() = field
        set(value) {
            field = value
        }
}
```
{validate="false"}

在此示例中：

* `get()` 函数从字段中检索属性值：`""`。
* `set()` 函数接受 `value` 作为形参并将其赋值给该字段，其中 `value` 为 `""`。 

当您想在 `get()` 或 `set()` 函数中添加额外逻辑而不引起无限循环时，访问支持字段会很有用。例如，您有一个带有 `name` 属性的 `Person` 类：

```kotlin
class Person {
    var name: String = ""
}
```

您希望确保 `name` 属性的首字母大写，因此创建了一个自定义 `set()` 函数，该函数使用了 [`.replaceFirstChar()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.text/replace-first-char.html) 和 [`.uppercase()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.text/uppercase-char.html) 扩展函数。但是，如果您在 `set()` 函数中直接引用该属性，就会导致无限循环，并在运行时出现 `StackOverflowError`：

```kotlin
class Person {
    var name: String = ""
        set(value) {
            // 这会导致运行时错误
            name = value.replaceFirstChar { firstChar -> firstChar.uppercase() }
        }
}

fun main() {
    val person = Person()
    person.name = "kodee"
    println(person.name)
    // Exception in thread "main" java.lang.StackOverflowError
}
```
{validate="false" kotlin-runnable="true" kotlin-min-compiler-version="1.3" id="kotlin-tour-properties-stackoverflow"}

为了解决此问题，您可以改而在 `set()` 函数中使用支持字段，即通过 `field` 关键字来引用它：

```kotlin
class Person {
    var name: String = ""
        set(value) {
            field = value.replaceFirstChar { firstChar -> firstChar.uppercase() }
        }
}

fun main() {
    val person = Person()
    person.name = "kodee"
    println(person.name)
    // Kodee
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3" id="kotlin-tour-properties-backingfield"}

当您想要添加日志记录、在属性值更改时发送通知，或者使用额外的逻辑来比较属性的新旧值时，支持字段也非常有用。

要了解更多信息，请参阅[支持字段](properties.md#backing-fields)。

## 扩展属性 {id="extension-properties"}

就像扩展函数一样，也存在扩展属性。扩展属性允许您在不修改现有类源代码的情况下向其添加新属性。但是，Kotlin 中的扩展属性**没有**支持字段。这意味着您需要自行编写 `get()` 和 `set()` 函数。此外，缺少支持字段意味着它们无法保存任何状态。

要声明扩展属性，请先写出要扩展的类的名称，紧接着写一个 `.`，然后写上属性的名称。与普通的类属性一样，您需要为属性声明类型。例如：

```kotlin
val String.lastChar: Char
```
{validate="false"}

当您希望属性包含计算值而无需使用继承时，扩展属性最为有用。您可以将扩展属性视为仅带有一个形参（即接收者）的函数。

例如，假设您有一个名为 `Person` 的数据类，其中包含两个属性：`firstName` 和 `lastName`。

```kotlin
data class Person(val firstName: String, val lastName: String)
```

您希望能够在不修改 `Person` 数据类或继承自它的情况下访问此人的全名。可以通过创建一个带有自定义 `get()` 函数的扩展属性来实现这一点：

```kotlin
data class Person(val firstName: String, val lastName: String)

// 用于获取全名的扩展属性
val Person.fullName: String
    get() = "$firstName $lastName"

fun main() {
    val person = Person(firstName = "John", lastName = "Doe")

    // 使用扩展属性
    println(person.fullName)
    // John Doe
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3" id="kotlin-tour-properties-extension"}

> 扩展属性不能重写类中已有的属性。
> 
{style="note"}

就像扩展函数一样，Kotlin 标准库也广泛使用了扩展属性。例如，请参见针对 `CharSequence` 的 [`lastIndex` 属性](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.text/last-index.html)。

## 委托属性 {id="delegated-properties"}

您已经在[类和接口](kotlin-tour-intermediate-classes-interfaces.md#delegation)一章中了解了委托。您还可以将委托与属性结合使用，将其属性访问器委托给另一个对象。当您对属性存储有更复杂的要求，而简单的支持字段无法处理时（例如将值存储在数据库表、浏览器会话或 Map 中），这会非常有用。使用委托属性还可以减少模板代码，因为获取和设置属性的逻辑仅包含在被委托的对象中。

其语法类似于在类中使用委托，但作用于不同的层级。声明您的属性，后跟 `by` 关键字以及要委托给的对象。例如：

```kotlin
val displayName: String by Delegate
```

在这里，委托属性 `displayName` 将其属性访问器指向 `Delegate` 对象。

所委托的每个对象**必须**具有一个 `getValue()` 运算符函数，Kotlin 使用该函数来检索委托属性的值。如果属性是可变的，它还必须具有一个 `setValue()` 运算符函数，以便 Kotlin 设置其值。

默认情况下，`getValue()` 和 `setValue()` 函数具有以下结构：

```kotlin
operator fun getValue(thisRef: Any?, property: KProperty<*>): String {}

operator fun setValue(thisRef: Any?, property: KProperty<*>, value: String) {}
```
{validate="false"}

在这些函数中：

* `operator` 关键字将这些函数标记为运算符函数，使其能够重载 `get()` 和 `set()` 函数。
* `thisRef` 形参引用**包含**委托属性的对象。默认情况下，其类型设置为 `Any?`，但您可能需要声明更具体的类型。
* `property` 形参引用其值被访问或更改的属性。您可以使用此形参来访问属性的名称或类型等信息。默认情况下，其类型设置为 `KProperty<*>`，但也可以使用 `Any?`。您无需担心在代码中对其进行更改。

`getValue()` 函数的返回值类型默认为 `String`，但您可以根据需要进行调整。

`setValue()` 函数有一个额外的形参 `value`，用于保存赋给该属性的新值。

那么，在实践中这是什么样子的呢？假设您想拥有一个计算属性（例如用户的显示名称），并且由于该操作开销较大且应用程序对性能敏感，因此只计算一次。您可以使用委托属性来缓存显示名称，这样它仅计算一次，但可以随时访问而不会影响性能。

首先，您需要创建要委托给的对象。在本例中，该对象将是 `CachedStringDelegate` 类的一个实例：

```kotlin
class CachedStringDelegate {
    var cachedValue: String? = null
}
```

`cachedValue` 属性包含缓存的值。在 `CachedStringDelegate` 类中，将您希望委托属性的 `get()` 函数具备的行为添加到 `getValue()` 运算符函数体中：

```kotlin
class CachedStringDelegate {
    var cachedValue: String? = null

    operator fun getValue(thisRef: Any?, property: Any?): String {
        if (cachedValue == null) {
            cachedValue = "Default Value"
            println("Computed and cached: $cachedValue")
        } else {
            println("Accessed from cache: $cachedValue")
        }
        return cachedValue ?: "Unknown"
    }
}
```

`getValue()` 函数会检查 `cachedValue` 属性是否为 `null`。如果是，该函数会赋值 `"Default Value"` 并打印一个字符串以用于日志记录。如果 `cachedValue` 属性已被计算，该属性则不为 `null`。在这种情况下，会打印另一个字符串以用于日志记录。最后，该函数使用 Elvis 运算符返回缓存的值，如果值为 `null` 则返回 `"Unknown"`。

现在，您可以将想要缓存的属性（`val displayName`）委托给 `CachedStringDelegate` 类的一个实例：

```kotlin
class CachedStringDelegate {
    var cachedValue: String? = null

    operator fun getValue(thisRef: User, property: Any?): String {
        if (cachedValue == null) {
            cachedValue = "${thisRef.firstName} ${thisRef.lastName}"
            println("Computed and cached: $cachedValue")
        } else {
            println("Accessed from cache: $cachedValue")
        }
        return cachedValue ?: "Unknown"
    }
}

class User(val firstName: String, val lastName: String) {
    val displayName: String by CachedStringDelegate()
}

fun main() {
    val user = User("John", "Doe")

    // 首次访问会计算并缓存值
    println(user.displayName)
    // Computed and cached: John Doe
    // John Doe

    // 后续访问会从缓存中检索值
    println(user.displayName)
    // Accessed from cache: John Doe
    // John Doe
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3" id="kotlin-tour-properties-delegated"}

在此示例中：

* 创建了一个 `User` 类，在其头部包含两个属性 `firstName` 和 `lastName`，并在类体中包含一个属性 `displayName`。
* 将 `displayName` 属性委托给 `CachedStringDelegate` 类的一个实例。
* 创建了一个名为 `user` 的 `User` 类实例。
* 打印在 `user` 实例上访问 `displayName` 属性的结果。

请注意，在 `getValue()` 函数中，`thisRef` 形参的类型已从 `Any?` 类型缩小为对象类型：`User`。这样做是为了让编译器能够访问 `User` 类的 `firstName` 和 `lastName` 属性。

### 标准委托 {id="standard-delegates"}

Kotlin 标准库提供了一些有用的委托，因此您不必总是从头开始创建自己的委托。如果您使用这些委托之一，则无需定义 `getValue()` 和 `setValue()` 函数，因为标准库会自动提供它们。

#### 延迟属性 {id="lazy-properties"}

要仅在首次访问属性时对其进行初始化，请使用延迟属性。标准库提供了用于委托的 `Lazy` 接口。

要创建 `Lazy` 接口的实例，请使用 `lazy()` 函数，并向其提供一个在首次调用 `get()` 函数时执行的 lambda表达式。后续对 `get()` 函数的任何调用都将返回与首次调用时相同的结果。延迟属性使用[尾随 lambda](kotlin-tour-functions.md#trailing-lambdas) 语法来传递 lambda表达式。

例如：

```kotlin
class Database {
    fun connect() {
        println("Connecting to the database...")
    }

    fun query(sql: String): List<String> {
        return listOf("Data1", "Data2", "Data3")
    }
}

val databaseConnection: Database by lazy {
    val db = Database()
    db.connect()
    db
}

fun fetchData() {
    val data = databaseConnection.query("SELECT * FROM data")
    println("Data: $data")
}

fun main() {
    // 首次访问 databaseConnection
    fetchData()
    // Connecting to the database...
    // Data: [Data1, Data2, Data3]

    // 后续访问使用现有的连接
    fetchData()
    // Data: [Data1, Data2, Data3]
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3" id="kotlin-tour-properties-lazy"}

在此示例中：

* 有一个带有 `connect()` 和 `query()` 成员函数的 `Database` 类。
* `connect()` 函数向控制台打印一个字符串，而 `query()` 函数接受一条 SQL 查询并返回一个列表。
* 有一个作为延迟属性的 `databaseConnection` 属性。
* 提供给 `lazy()` 函数的 lambda表达式：
  * 创建 `Database` 类的一个实例。
  * 在此实例（`db`）上调用 `connect()` 成员函数。
  * 返回该实例。
* 有一个 `fetchData()` 函数：
  * 通过在 `databaseConnection` 属性上调用 `query()` 函数来创建一条 SQL 查询。
  * 将 SQL 查询结果赋值给 `data` 变量。
  * 将 `data` 变量打印到控制台。
* `main()` 函数调用了 `fetchData()` 函数。首次调用时，延迟属性被初始化。第二次调用时，返回与首次调用相同的结果。

延迟属性不仅在初始化消耗资源较多时有用，而且在代码中可能根本不会用到某个属性时也非常有用。此外，延迟属性默认是线程安全的，这在并发环境中工作时尤其有益。

要了解更多信息，请参阅[延迟属性](delegated-properties.md#lazy-properties)。

#### 可观察属性 {id="observable-properties"}

要监视属性的值是否发生更改，请使用可观察属性。当您想要检测属性值的更改并利用这一信息触发相应的响应时，可观察属性非常有用。标准库提供了用于委托的 `Delegates` 对象。

要创建可观察属性，必须首先导入 `kotlin.properties.Delegates.observable`。然后，使用 `observable()` 函数并向其提供一个在属性每次更改时执行的 lambda表达式。与延迟属性一样，可观察属性使用[尾随 lambda](kotlin-tour-functions.md#trailing-lambdas) 语法来传递 lambda表达式。

例如：

```kotlin
import kotlin.properties.Delegates.observable

class Thermostat {
    var temperature: Double by observable(20.0) { _, old, new ->
        if (new > 25) {
            println("Warning: Temperature is too high! ($old°C -> $new°C)")
        } else {
            println("Temperature updated: $old°C -> $new°C")
        }
    }
}

fun main() {
    val thermostat = Thermostat()
    thermostat.temperature = 22.5
    // Temperature updated: 20.0°C -> 22.5°C

    thermostat.temperature = 27.0
    // Warning: Temperature is too high! (22.5°C -> 27.0°C)
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3" id="kotlin-tour-properties-observable"}

在此示例中：

* 有一个包含可观察属性 `temperature` 的 `Thermostat` 类。
* `observable()` 函数接受 `20.0` 作为形参，并用它来初始化该属性。
* 提供给 `observable()` 函数的 lambda表达式：
  * 具有三个形参：
    * `_`，指代属性本身。
    * `old`，属性的旧值。
    * `new`，属性的新值。
  * 检查 `new` 形参是否大于 `25`，并根据结果向控制台打印字符串。
* `main()` 函数：
  * 创建一个名为 `thermostat` 的 `Thermostat` 类实例。
  * 将该实例的 `temperature` 属性值更新为 `22.5`，这将触发带有温度更新的打印语句。
  * 将该实例的 `temperature` 属性值更新为 `27.0`，这将触发带有警告的打印语句。

可观察属性不仅可用于日志记录和调试目的。您还可以将它们用于更新 UI 或执行额外检查（例如验证数据的有效性）等用例。

要了解更多信息，请参阅[可观察属性](delegated-properties.md#observable-properties)。

## 练习 {completion-point="true" id="practice"}

<deflist appearance="clear" collapsible="true" numbered="true">
<def title="查找缺货图书" id="properties-exercise-1">

您在一家书店管理库存系统。库存存储在一个列表中，其中每个条目表示特定图书的数量。例如，`listOf(3, 0, 7, 12)` 表示书店有第 1 本书 3 本，第 2 本书 0 本，第 3 本书 7 本，以及第 4 本书 12 本。

编写一个名为 `findOutOfStockBooks()` 的函数，该函数返回所有缺货图书的索引列表。

<deflist collapsible="true">
    <def title="提示 1">
        使用标准库中的 <a href="https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.collections/indices.html"><code>indices</code></a> 扩展属性。
    </def>
</deflist>

<deflist collapsible="true">
    <def title="提示 2">
        您可以使用 <a href="https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.collections/build-list.html"><code>buildList()</code></a> 函数来创建和管理列表，而不是手动创建并返回可变列表。<code>buildList()</code> 函数使用了带有接收者的 lambda，您在前面的章节中已了解过这一点。
    </def>
</deflist>

```kotlin
fun findOutOfStockBooks(inventory: List<Int>): List<Int> {
    // 在此处编写您的代码
}

fun main() {
    val inventory = listOf(3, 0, 7, 0, 5)
    println(findOutOfStockBooks(inventory))
    // [1, 3]
}
```
{validate="false" kotlin-runnable="true" kotlin-min-compiler-version="1.3" id="kotlin-tour-properties-exercise-1"}

```kotlin
fun findOutOfStockBooks(inventory: List<Int>): List<Int> {
    val outOfStockIndices = mutableListOf<Int>()
    for (index in inventory.indices) {
        if (inventory[index] == 0) {
            outOfStockIndices.add(index)
        }
    }
    return outOfStockIndices
}

fun main() {
    val inventory = listOf(3, 0, 7, 0, 5)
    println(findOutOfStockBooks(inventory))
    // [1, 3]
}
```
{initial-collapse-state="collapsed" collapsible="true" collapsed-title="参考解决方案 1" id="kotlin-tour-properties-solution-1-1"}

```kotlin
fun findOutOfStockBooks(inventory: List<Int>): List<Int> = buildList {
    for (index in inventory.indices) {
        if (inventory[index] == 0) {
            add(index)
        }
    }
}

fun main() {
    val inventory = listOf(3, 0, 7, 0, 5)
    println(findOutOfStockBooks(inventory))
    // [1, 3]
}
```
{initial-collapse-state="collapsed" collapsible="true" collapsed-title="参考解决方案 2" id="kotlin-tour-properties-solution-1-2"}

</def>
<def title="将千米转换为英里" id="properties-exercise-2">

您有一个旅行应用，需要同时以千米和英里显示距离。为 `Double` 类型创建一个名为 `asMiles` 的扩展属性，将以千米为单位的距离转换为英里：

> 将千米转换为英里的公式为 `miles = kilometers * 0.621371`。
>
{style="note"}

<deflist collapsible="true">
    <def title="提示">
        请记住，扩展属性需要自定义的 <code>get()</code> 函数。
    </def>
</deflist>

```kotlin
val // 在此处编写您的代码

fun main() {
    val distanceKm = 5.0
    println("$distanceKm km is ${distanceKm.asMiles} miles")
    // 5.0 km is 3.106855 miles

    val marathonDistance = 42.195
    println("$marathonDistance km is ${marathonDistance.asMiles} miles")
    // 42.195 km is 26.218757 miles
}
```
{validate="false" kotlin-runnable="true" kotlin-min-compiler-version="1.3" id="kotlin-tour-properties-exercise-2"}

```kotlin
val Double.asMiles: Double
    get() = this * 0.621371

fun main() {
    val distanceKm = 5.0
    println("$distanceKm km is ${distanceKm.asMiles} miles")
    // 5.0 km is 3.106855 miles

    val marathonDistance = 42.195
    println("$marathonDistance km is ${marathonDistance.asMiles} miles")
    // 42.195 km is 26.218757 miles
}
```
{initial-collapse-state="collapsed" collapsible="true" collapsed-title="参考解决方案" id="kotlin-tour-properties-solution-2"}

</def>
<def title="延迟初始化健康检查" id="properties-exercise-3">

您有一个能够确定云系统状态的系统健康检查器。但是，它用于执行健康检查的两个函数都是性能密集型的。使用延迟属性来初始化检查，以便仅在需要时才运行这些高开销函数：

```kotlin
fun checkAppServer(): Boolean {
    println("Performing application server health check...")
    return true
}

fun checkDatabase(): Boolean {
    println("Performing database health check...")
    return false
}

fun main() {
    // 在此处编写您的代码

    when {
        isAppServerHealthy -> println("Application server is online and healthy")
        isDatabaseHealthy -> println("Database is healthy")
        else -> println("System is offline")
    }
    // Performing application server health check...
    // Application server is online and healthy
}
```
{validate="false" kotlin-runnable="true" kotlin-min-compiler-version="1.3" id="kotlin-tour-properties-exercise-3"}

```kotlin
fun checkAppServer(): Boolean {
    println("Performing application server health check...")
    return true
}

fun checkDatabase(): Boolean {
    println("Performing database health check...")
    return false
}

fun main() {
    val isAppServerHealthy by lazy { checkAppServer() }
    val isDatabaseHealthy by lazy { checkDatabase() }

    when {
        isAppServerHealthy -> println("Application server is online and healthy")
        isDatabaseHealthy -> println("Database is healthy")
        else -> println("System is offline")
    }
   // Performing application server health check...
   // Application server is online and healthy
}
```
{initial-collapse-state="collapsed" collapsible="true" collapsed-title="参考解决方案" id="kotlin-tour-properties-solution-3"}

</def>
<def title="跟踪预算变动" id="properties-exercise-4">

您正在构建一个简单的预算跟踪应用。该应用需要观察用户剩余预算的变动，并在其低于特定阈值时通知用户。您有一个 `Budget` 类，它通过包含初始预算金额的 `totalBudget` 属性进行初始化。在该类内部，创建一个名为 `remainingBudget` 的可观察属性，它会在以下情况打印信息：

* 当值低于初始预算的 20% 时发出警告。
* 当预算比先前的值增加时显示鼓励信息。

```kotlin
import kotlin.properties.Delegates.observable

class Budget(val totalBudget: Int) {
    var remainingBudget: Int // 在此处编写您的代码
}

fun main() {
    val myBudget = Budget(totalBudget = 1000)
    myBudget.remainingBudget = 800
    myBudget.remainingBudget = 150
    // Warning: Your remaining budget (150) is below 20% of your total budget.
    myBudget.remainingBudget = 50
    // Warning: Your remaining budget (50) is below 20% of your total budget.
    myBudget.remainingBudget = 300
    // Good news: Your remaining budget increased to 300.
}
```
{validate="false" kotlin-runnable="true" kotlin-min-compiler-version="1.3" id="kotlin-tour-properties-exercise-4"}

```kotlin
import kotlin.properties.Delegates.observable

class Budget(val totalBudget: Int) {
    var remainingBudget: Int by observable(totalBudget) { _, oldValue, newValue ->
        if (newValue < totalBudget * 0.2) {
            println("Warning: Your remaining budget ($newValue) is below 20% of your total budget.")
        } else if (newValue > oldValue) {
            println("Good news: Your remaining budget increased to $newValue.")
        }
    }
}

fun main() {
    val myBudget = Budget(totalBudget = 1000)
    myBudget.remainingBudget = 800
    myBudget.remainingBudget = 150
    // Warning: Your remaining budget (150) is below 20% of your total budget.
    myBudget.remainingBudget = 50
    // Warning: Your remaining budget (50) is below 20% of your total budget.
    myBudget.remainingBudget = 300
    // Good news: Your remaining budget increased to 300.
}
```
{initial-collapse-state="collapsed" collapsible="true" collapsed-title="参考解决方案" id="kotlin-tour-properties-solution-4"}

</def>
</deflist>

<seealso></seealso>

<list columns="2" id="tour-nav">
  <li>
    <a as="button" href="kotlin-tour-intermediate-open-special-classes.md" mode="outline" icon="arrow-left" icon-position="left">上一步</a>
  </li>
  <li>
    <a as="button" href="kotlin-tour-intermediate-null-safety.md" mode="classic" icon="arrow-right" icon-position="right">下一步</a>
  </li>
</list>