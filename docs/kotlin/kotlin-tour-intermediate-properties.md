[//]: # (title: 属性)

<no-index/>

在初学者教程中，你已经学习了如何使用属性来声明类实例的特征以及如何访问它们。本章将更深入地探讨属性在 Kotlin 中的工作原理，并探索在代码中使用它们的其他方式。

## 支持字段 {id="backing-fields"}

在 Kotlin 中，属性具有默认的 `get()` 和 `set()` 函数（称为属性访问器），用于处理其值的检索与修改。虽然这些默认函数在代码中不是显式可见的，但编译器会自动生成它们以在后台管理属性访问。这些访问器使用一个**支持字段**（backing field）来存储实际的属性值。

如果满足以下任一条件，则存在支持字段：

* 你使用了该属性的默认 `get()` 或 `set()` 函数。
* 你尝试在代码中使用 `field` 关键字访问该属性值。

> `get()` 和 `set()` 函数也称为 getter 和 setter。
>
{style="tip"}

例如，以下代码中的 `category` 属性没有自定义的 `get()` 或 `set()` 函数，因此使用默认实现：

```kotlin
class Contact(val id: Int, var email: String) {
    var category: String = ""
}
```

在底层，这相当于以下伪代码：

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
* `set()` 函数接受 `value` 作为形参并将其赋值给字段，其中 `value` 为 `""`。 

当你希望在 `get()` 或 `set()` 函数中添加额外逻辑而不引起死循环时，访问支持字段会非常有用。例如，你有一个包含 `name` 属性的 `Person` 类：

```kotlin
class Person {
    var name: String = ""
}
```

你希望确保 `name` 属性的首字母大写，因此创建了一个自定义的 `set()` 函数，该函数使用了 [`.replaceFirstChar()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.text/replace-first-char.html) 和 [`.uppercase()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.text/uppercase-char.html) 扩展函数。但是，如果你在 `set()` 函数中直接引用该属性，就会造成死循环，并在运行时出现 `StackOverflowError`：

```kotlin
class Person {
    var name: String = ""
        set(value) {
            // This causes a runtime error
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
{validate="false" kotlin-runnable="true" id="kotlin-tour-properties-stackoverflow"}

要解决此问题，可以在 `set()` 函数中使用 `field` 关键字引用支持字段：

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
{kotlin-runnable="true" id="kotlin-tour-properties-backingfield"}

当你想添加日志记录、在属性值发生变化时发送通知，或者使用额外的逻辑来比较属性的新旧值时，支持字段也非常有用。

要了解更多信息，请参阅[支持字段](properties.md#backing-fields)。

## 扩展属性 {id="extension-properties"}

就像扩展函数一样，也存在扩展属性。扩展属性允许你为现有类添加新属性，而无需修改其源代码。但是，Kotlin 中的扩展属性**没有**支持字段。这意味着你必须自行编写 `get()` 和 `set()` 函数。此外，缺少支持字段意味着它们无法保存任何状态。

要声明扩展属性，请编写要扩展的类名称，后跟一个 `.` 和属性名称。就像普通的类属性一样，你需要为属性声明类型。例如：

```kotlin
val String.lastChar: Char
```
{validate="false"}

当你想让某个属性包含计算出的值而无需使用继承时，扩展属性最为有用。你可以将扩展属性视作只有一个参数（接收者）的函数。

例如，假设你有一个名为 `Person` 的数据类，其中包含两个属性：`firstName` 和 `lastName`。

```kotlin
data class Person(val firstName: String, val lastName: String)
```

你希望能够在不修改 `Person` 数据类或继承自该类的情况下访问人员的全名。你可以通过创建一个带有自定义 `get()` 函数的扩展属性来实现这一点：

```kotlin
data class Person(val firstName: String, val lastName: String)

// Extension property to get the full name
val Person.fullName: String
    get() = "$firstName $lastName"

fun main() {
    val person = Person(firstName = "John", lastName = "Doe")

    // Use the extension property
    println(person.fullName)
    // John Doe
}
```
{kotlin-runnable="true" id="kotlin-tour-properties-extension"}

> 扩展属性不能重写类的现有属性。
> 
{style="note"}

就像扩展函数一样，Kotlin 标准库广泛使用了扩展属性。例如，请参见 `CharSequence` 的 [`lastIndex` 属性](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.text/last-index.html)。

## 委托属性 {id="delegated-properties"}

你已经在[类和接口](kotlin-tour-intermediate-classes-interfaces.md#delegation)一章中了解了委托。你也可以对属性使用委托，将其属性访问器委托给另一个对象。当你对属性存储有更复杂的需求，而简单的支持字段无法满足时（例如将值存储在数据库表、浏览器会话或映射中），这会非常有用。使用委托属性还可以减少模板代码，因为获取和设置属性的逻辑仅包含在委托目标对象中。

其语法类似于类的委托，但在不同的层次上运作。先声明你的属性，后跟 `by` 关键字以及你要委托的目标对象。例如：

```kotlin
val displayName: String by Delegate
```

在这里，委托属性 `displayName` 将其属性访问器委托给 `Delegate` 对象。

你所委托的每个对象**必须**具有一个 `getValue()` 运算符函数，Kotlin 使用该函数来检索委托属性的值。如果该属性是可变的，它还必须具有一个 `setValue()` 运算符函数，供 Kotlin 用于设置其值。

默认情况下，`getValue()` 和 `setValue()` 函数具有以下结构：

```kotlin
operator fun getValue(thisRef: Any?, property: KProperty<*>): String {}

operator fun setValue(thisRef: Any?, property: KProperty<*>, value: String) {}
```
{validate="false"}

在这些函数中：

* `operator` 关键字将这些函数标记为运算符函数，使它们能够重载 `get()` 和 `set()` 函数。
* `thisRef` 形参引用**包含**该委托属性的对象。默认情况下，类型设置为 `Any?`，但你可能需要声明一个更具体的类型。
* `property` 形参引用被访问或修改其值的属性。你可以使用此参数来访问诸如属性名称或类型之类的信息。默认情况下，类型设置为 `KProperty<*>`，但你也可以使用 `Any?`。你无需担心在代码中修改它。

`getValue()` 函数默认的返回值类型为 `String`，但你可以根据需要进行调整。

`setValue()` 函数有一个额外的形参 `value`，用于保存赋给属性的新值。

那么，这在实际中是如何运作的呢？假设你想要一个计算属性（例如用户的显示名称），并且由于该操作开销较大且应用程序对性能敏感，因此只计算一次。你可以使用委托属性来缓存显示名称，这样它仅计算一次，但在任何时候访问都不会影响性能。

首先，你需要创建委托目标对象。在此情况下，该对象将是 `CachedStringDelegate` 类的一个实例：

```kotlin
class CachedStringDelegate {
    var cachedValue: String? = null
}
```

`cachedValue` 属性包含缓存的值。在 `CachedStringDelegate` 类中，将你希望委托属性的 `get()` 函数执行的行为添加到 `getValue()` 运算符函数体中：

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

`getValue()` 函数检查 `cachedValue` 属性是否为 `null`。如果是，该函数将赋值 `"Default value"` 并输出一个字符串用于日志记录。如果 `cachedValue` 属性已被计算过，则该属性不为 `null`。在这种情况下，会输出另一个字符串用于日志记录。最后，该函数使用 Elvis 运算符返回缓存的值，或者在值为 `null` 时返回 `"Unknown"`。

现在你可以将想要缓存的属性 (`val displayName`) 委托给 `CachedStringDelegate` 类的实例：

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

    // First access computes and caches the value
    println(user.displayName)
    // Computed and cached: John Doe
    // John Doe

    // Subsequent accesses retrieve the value from cache
    println(user.displayName)
    // Accessed from cache: John Doe
    // John Doe
}
```
{kotlin-runnable="true" id="kotlin-tour-properties-delegated"}

此示例：

* 创建了一个 `User` 类，其类头中有两个属性：`firstName` 和 `lastName`，类体中有一个属性：`displayName`。
* 将 `displayName` 属性委托给 `CachedStringDelegate` 类的实例。
* 创建了 `User` 类的一个名为 `user` 的实例。
* 输出访问 `user` 实例上的 `displayName` 属性的结果。

请注意，在 `getValue()` 函数中，`thisRef` 形参的类型从 `Any?` 类型缩窄到了对象类型：`User`。这样做是为了让编译器能够访问 `User` 类的 `firstName` 和 `lastName` 属性。

### 标准委托 {id="standard-delegates"}

Kotlin 标准库提供了一些有用的委托，因此你不必总是从头开始创建自己的委托。如果使用这些委托之一，你无需定义 `getValue()` 和 `setValue()` 函数，因为标准库会自动提供它们。

#### 延迟属性 {id="lazy-properties"}

要仅在首次访问属性时才对其进行初始化，请使用延迟属性。标准库提供了用于委托的 `Lazy` 接口。

要创建 `Lazy` 接口的实例，请使用 `lazy()` 函数，并向其提供一个 lambda表达式，在首次调用 `get()` 函数时执行该表达式。后续对 `get()` 函数的任何调用都将返回首次调用时提供的相同结果。延迟属性使用[尾随 lambda](kotlin-tour-functions.md#trailing-lambdas) 语法来传递 lambda表达式。

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
    // First time accessing databaseConnection
    fetchData()
    // Connecting to the database...
    // Data: [Data1, Data2, Data3]

    // Subsequent access uses the existing connection
    fetchData()
    // Data: [Data1, Data2, Data3]
}
```
{kotlin-runnable="true" id="kotlin-tour-properties-lazy"}

在此示例中：

* 有一个包含 `connect()` 和 `query()` 成员函数的 `Database` 类。 
* `connect()` 函数将一个字符串输出到控制台，而 `query()` 函数接受一个 SQL 查询并返回一个列表。
* 有一个属于延迟属性的 `databaseConnection` 属性。
* 提供给 `lazy()` 函数的 lambda表达式：
  * 创建 `Database` 类的一个实例。
  * 在此实例 (`db`) 上调用 `connect()` 成员函数。
  * 返回该实例。
* 有一个 `fetchData()` 函数：
  * 通过在 `databaseConnection` 属性上调用 `query()` 函数来创建 SQL 查询。
  * 将 SQL 查询结果赋值给 `data` 变量。
  * 将 `data` 变量输出到控制台。
* `main()` 函数调用 `fetchData()` 函数。首次调用时，延迟属性被初始化。第二次调用时，返回与首次调用相同的结果。

延迟属性不仅在初始化耗费资源时有用，在代码中可能根本用不到某个属性时也很有用。此外，延迟属性默认是线程安全的，如果你在并发环境中工作，这将格外有益。

要了解更多信息，请参阅[延迟属性](delegated-properties.md#lazy-properties)。

#### 可观察属性 {id="observable-properties"}

要监控属性的值是否发生变化，请使用可观察属性。当你想要检测属性值的变化并利用此信息触发相应反应时，可观察属性非常有用。标准库提供了用于委托的 `Delegates` 对象。

要创建可观察属性，必须先导入 `kotlin.properties.Delegates.observable`。然后，使用 `observable()` 函数并向其提供一个 lambda表达式，以便在属性发生变化时执行。与延迟属性一样，可观察属性使用[尾随 lambda](kotlin-tour-functions.md#trailing-lambdas) 语法来传递 lambda表达式。

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
{kotlin-runnable="true" id="kotlin-tour-properties-observable"}

在此示例中：

* 有一个 `Thermostat` 类，其中包含一个可观察属性：`temperature`。
* `observable()` 函数接受 `20.0` 作为形参，并用它来初始化该属性。
* 提供给 `observable()` 函数的 lambda表达式：
  * 具有三个形参：
    * `_`，引用属性本身。
    * `old`，属性的旧值。
    * `new`，属性的新值。
  * 检查 `new` 形参是否大于 `25`，并根据结果将字符串输出到控制台。
* `main()` 函数：
  * 创建 `Thermostat` 类的一个名为 `thermostat` 的实例。
  * 将该实例的 `temperature` 属性值更新为 `22.5`，从而触发带有温度更新的输出语句。
  * 将该实例的 `temperature` 属性值更新为 `27.0`，从而触发带有警告的输出语句。

可观察属性不仅在日志记录和调试时有用。你还可以将其用于更新 UI 或执行额外检查（例如验证数据的有效性）等用例。

要了解更多信息，请参阅[可观察属性](delegated-properties.md#observable-properties)。

## 练习 {completion-point="true" id="practice"}

<deflist appearance="clear" collapsible="true" numbered="true">
<def title="找出缺货图书" id="properties-exercise-1">

你在一家书店管理库存系统。库存存储在一个列表中，其中每项表示特定图书的数量。例如，`listOf(3, 0, 7, 12)` 表示书店有 3 本第一种书、0 本第二种书、7 本第三种书和 12 本第四种书。

编写一个名为 `findOutOfStockBooks()` 的函数，返回所有缺货图书的索引列表。

<deflist collapsible="true">
    <def title="提示 1">
        使用来自标准库的 <a href="https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.collections/indices.html"><code>indices</code></a> 扩展属性。
    </def>
</deflist>

<deflist collapsible="true">
    <def title="提示 2">
        你可以使用 <a href="https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.collections/build-list.html"><code>buildList()</code></a> 函数来创建和管理列表，而不是手动创建并返回可变列表。<code>buildList()</code> 函数使用了带接收者的 lambda，你在前面的章节中已经了解过它。
    </def>
</deflist>

```kotlin
fun findOutOfStockBooks(inventory: List<Int>): List<Int> {
    // Write your code here
}

fun main() {
    val inventory = listOf(3, 0, 7, 0, 5)
    println(findOutOfStockBooks(inventory))
    // [1, 3]
}
```
{kotlin-runnable="true" kotlin-target-platform="exercise" kotlin-hidden-files="ExerciseUtils.kt,tour/intermediate/FindOutOfStockBooksTest.kt" validate="false" id="kotlin-tour-properties-exercise-1"}

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
{kotlin-runnable="true" kotlin-target-platform="exercise" kotlin-hidden-files="ExerciseUtils.kt,tour/intermediate/FindOutOfStockBooksTest.kt" initial-collapse-state="collapsed" collapsible="true" collapsed-title="示例解决方案 1" id="kotlin-tour-properties-solution-1-1"}

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
{kotlin-runnable="true" kotlin-target-platform="exercise" kotlin-hidden-files="ExerciseUtils.kt,tour/intermediate/FindOutOfStockBooksTest.kt" initial-collapse-state="collapsed" collapsible="true" collapsed-title="示例解决方案 2" id="kotlin-tour-properties-solution-1-2"}

</def>
<def title="将公里转换为英里" id="properties-exercise-2">

你有一个旅行应用，需要同时以公里和英里显示距离。为 `Double` 类型创建一个名为 `asMiles` 的扩展属性，将以公里为单位的距离转换为英里：

> 公里转换为英里的公式为 `miles = kilometers * 0.621371`。
>
{style="note"}

<deflist collapsible="true">
    <def title="提示">
        请记住，扩展属性需要自定义 <code>get()</code> 函数。
    </def>
</deflist>

```kotlin
val // Write your code here

fun main() {
    val distanceKm = 5.0
    println("$distanceKm km is ${distanceKm.asMiles} miles")
    // 5.0 km is 3.106855 miles

    val marathonDistance = 42.195
    println("$marathonDistance km is ${marathonDistance.asMiles} miles")
    // 42.195 km is 26.218749345 miles
}
```
{kotlin-runnable="true" kotlin-target-platform="exercise" kotlin-hidden-files="ExerciseUtils.kt,tour/intermediate/AsMilesTest.kt" validate="false" id="kotlin-tour-properties-exercise-2"}

```kotlin
val Double.asMiles: Double
    get() = this * 0.621371

fun main() {
    val distanceKm = 5.0
    println("$distanceKm km is ${distanceKm.asMiles} miles")
    // 5.0 km is 3.106855 miles

    val marathonDistance = 42.195
    println("$marathonDistance km is ${marathonDistance.asMiles} miles")
    // 42.195 km is 26.218749345 miles
}
```
{kotlin-runnable="true" kotlin-target-platform="exercise" kotlin-hidden-files="ExerciseUtils.kt,tour/intermediate/AsMilesTest.kt" initial-collapse-state="collapsed" collapsible="true" collapsed-title="示例解决方案" id="kotlin-tour-properties-solution-2"}

</def>
<def title="延迟初始化健康检查" id="properties-exercise-3">

你有一个系统健康检查器，可以确定云系统的状态。但是，它可以运行用于执行健康检查的两个函数性能开销很大。使用延迟属性来初始化这些检查，以便仅在需要时才运行高开销的函数：

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
    // Write your code here

    when {
        isAppServerHealthy -> println("Application server is online and healthy")
        isDatabaseHealthy -> println("Database is healthy")
        else -> println("System is offline")
    }
    // Performing application server health check...
    // Application server is online and healthy
}
```
{kotlin-runnable="true" kotlin-target-platform="exercise" kotlin-hidden-files="ExerciseUtils.kt,tour/intermediate/LazyHealthCheckTest.kt" validate="false" id="kotlin-tour-properties-exercise-3"}

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
{kotlin-runnable="true" kotlin-target-platform="exercise" kotlin-hidden-files="ExerciseUtils.kt,tour/intermediate/LazyHealthCheckTest.kt" initial-collapse-state="collapsed" collapsible="true" collapsed-title="示例解决方案" id="kotlin-tour-properties-solution-3"}

</def>
<def title="跟踪预算变更" id="properties-exercise-4">

你正在构建一个简单的预算跟踪应用。该应用需要观察用户剩余预算的变化，并在预算低于特定阈值时通知他们。你有一个 `Budget` 类，它通过包含初始预算金额的 `totalBudget` 属性进行初始化。在该类内部，创建一个名为 `remainingBudget` 的可观察属性，打印：

* 当该值低于初始预算的 20% 时发出警告。
* 当预算比先前的值增加时显示鼓励信息。

```kotlin
import kotlin.properties.Delegates.observable

class Budget(val totalBudget: Int) {
    var remainingBudget: Int // Write your code here
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
{kotlin-runnable="true" kotlin-target-platform="exercise" kotlin-hidden-files="ExerciseUtils.kt,tour/intermediate/BudgetTest.kt" validate="false" id="kotlin-tour-properties-exercise-4"}

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
{kotlin-runnable="true" kotlin-target-platform="exercise" kotlin-hidden-files="ExerciseUtils.kt,tour/intermediate/BudgetTest.kt" initial-collapse-state="collapsed" collapsible="true" collapsed-title="示例解决方案" id="kotlin-tour-properties-solution-4"}

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