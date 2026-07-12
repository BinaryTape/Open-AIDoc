[//]: # (title: 属性)

<no-index/>

在初级教程中，你已经学习了如何使用属性来声明类实例的特征以及如何访问它们。本章节将深入探讨 Kotlin 中属性的工作原理，并探索在代码中使用属性的其他方式。

## 支持字段 (Backing fields)

在 Kotlin 中，属性拥有默认的 `get()` 和 `set()` 函数，它们被称为属性访问器，负责处理值的检索和修改。虽然这些默认函数在代码中不是显式可见的，但编译器会自动生成它们，以便在后台管理属性访问。这些访问器使用一个**支持字段**来存储实际的属性值。

如果满足以下任一条件，则存在支持字段：

* 你为属性使用了默认的 `get()` 或 `set()` 函数。
* 你尝试在代码中使用 `field` 关键字访问属性值。

> `get()` 和 `set()` 函数也被称为 getter 和 setter。
>
{style="tip"}

例如，这段代码中的 `category` 属性没有自定义的 `get()` 或 `set()` 函数，因此使用默认实现：

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

在这个例子中：

* `get()` 函数从字段中检索属性值：`""`。
* `set()` 函数接受 `value` 作为参数并将其赋值给字段，此时 `value` 为 `""`。 

当你想要在 `get()` 或 `set()` 函数中添加额外逻辑而不引起无限循环时，访问支持字段非常有用。例如，你有一个包含 `name` 属性的 `Person` 类：

```kotlin
class Person {
    var name: String = ""
}
```

你想要确保 `name` 属性的首字母大写，因此创建了一个自定义的 `set()` 函数，并使用了 [`.replaceFirstChar()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.text/replace-first-char.html) 和 [`.uppercase()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.text/uppercase-char.html) 扩展函数。但是，如果你在 `set()` 函数中直接引用该属性，就会创建一个无限循环，并在运行时看到 `StackOverflowError`：

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

要修复此问题，你可以在 `set()` 函数中使用支持字段，方法是通过 `field` 关键字引用它：

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

当你想要添加日志记录、在属性值更改时发送通知，或使用比较属性旧值和新值的额外逻辑时，支持字段也很有用。

欲了解更多信息，请参阅[支持字段](properties.md#backing-fields)。

## 扩展属性

正如扩展函数一样，也有扩展属性。扩展属性允许你在不修改源代码的情况下向现有类添加新属性。但是，Kotlin 中的扩展属性**没有**支持字段。这意味着你需要自己编写 `get()` 和 `set()` 函数。此外，由于缺乏支持字段，它们无法持有任何状态。

要声明扩展属性，请写出你想要扩展的类名，后跟一个 `.` 和你的属性名称。就像普通的类属性一样，你需要为属性声明一个类型。例如：

```kotlin
val String.lastChar: Char
```
{validate="false"}

当你希望属性包含计算值而又不使用继承时，扩展属性最为有用。你可以将扩展属性看作是一个只有一个参数（接收者）的函数。

例如，假设你有一个名为 `Person` 的数据类，它有两个属性：`firstName` 和 `lastName`。

```kotlin
data class Person(val firstName: String, val lastName: String)
```

你希望能够在不修改 `Person` 数据类或继承它的情况下访问人的全名。你可以通过创建一个带有自定义 `get()` 函数的扩展属性来实现：

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

就像扩展函数一样，Kotlin 标准库也广泛使用了扩展属性。例如，请参阅 `CharSequence` 的 [`lastIndex` 属性](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.text/last-index.html)。

## 委托属性

你已经在[类与接口](kotlin-tour-intermediate-classes-interfaces.md#delegation)章节中学习了委托。你也可以在属性上使用委托，将其属性访问器委托给另一个对象。当你对存储属性有更复杂的需求，而简单的支持字段无法处理时（例如将值存储在数据库表、浏览器会话或映射中），这非常有用。使用委托属性还能减少模板代码，因为获取和设置属性的逻辑仅包含在你委托的对象中。

其语法与在类上使用委托类似，但在不同层级上操作。声明你的属性，后跟 `by` 关键字以及你想要委托的对象。例如：

```kotlin
val displayName: String by Delegate
```

在这里，委托属性 `displayName` 将其属性访问器引用到 `Delegate` 对象。

你委托的每个对象**必须**有一个 `getValue()` 运算符函数，Kotlin 使用它来检索委托属性的值。如果属性是可变的，它还必须有一个 `setValue()` 运算符函数，以便 Kotlin 设置其值。

默认情况下，`getValue()` 和 `setValue()` 函数具有以下结构：

```kotlin
operator fun getValue(thisRef: Any?, property: KProperty<*>): String {}

operator fun setValue(thisRef: Any?, property: KProperty<*>, value: String) {}
```
{validate="false"}

在这些函数中：

* `operator` 关键字将这些函数标记为运算符函数，使它们能够重载 `get()` 和 `set()` 函数。
* `thisRef` 参数引用**包含**委托属性的对象。默认情况下，类型设置为 `Any?`，但你可能需要声明一个更具体的类型。
* `property` 参数引用其值被访问或更改的属性。你可以使用此参数来访问属性名称或类型等信息。默认情况下，类型设置为 `KProperty<*>`，但你也可以使用 `Any?`。你不需要担心在代码中更改这一点。

`getValue()` 函数默认返回类型为 `String`，但你可以根据需要进行调整。

`setValue()` 函数有一个额外的参数 `value`，用于持有分配给该属性的新值。

那么，这在实践中是什么样的呢？假设你想要一个计算属性（例如用户的显示名称），由于该操作开销较大且你的应用对性能敏感，因此只需计算一次。你可以使用委托属性来缓存显示名称，这样它就只会被计算一次，但可以随时访问而不会影响性能。

首先，你需要创建要委托的对象。在本例中，该对象将是 `CachedStringDelegate` 类的一个实例：

```kotlin
class CachedStringDelegate {
    var cachedValue: String? = null
}
```

`cachedValue` 属性包含缓存的值。在 `CachedStringDelegate` 类中，将你希望从委托属性的 `get()` 函数中获得的行为添加到 `getValue()` 运算符函数体中：

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

`getValue()` 函数检查 `cachedValue` 属性是否为 `null`。如果是，该函数将分配 `"Default Value"` 并打印一条用于日志记录的字符串。如果 `cachedValue` 属性已经计算过，则该属性不为 `null`。在这种情况下，会打印另一条用于日志记录的字符串。最后，该函数使用 Elvis 运算符返回缓存的值，或者如果值为 `null` 则返回 `"Unknown"`。

现在，你可以将想要缓存的属性 (`val displayName`) 委托给 `CachedStringDelegate` 类的一个实例：

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

    // 第一次访问会计算并缓存值
    println(user.displayName)
    // Computed and cached: John Doe
    // John Doe

    // 后续访问从缓存中检索值
    println(user.displayName)
    // Accessed from cache: John Doe
    // John Doe
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3" id="kotlin-tour-properties-delegated"}

这个例子：

* 创建了一个 `User` 类，其头部有两个属性 `firstName` 和 `lastName`，类体中有一个属性 `displayName`。
* 将 `displayName` 属性委托给 `CachedStringDelegate` 类的一个实例。
* 创建了一个名为 `user` 的 `User` 类实例。
* 打印了在 `user` 实例上访问 `displayName` 属性的结果。

注意，在 `getValue()` 函数中，`thisRef` 参数的类型从 `Any?` 类型缩小到了对象类型：`User`。这是为了让编译器能够访问 `User` 类的 `firstName` 和 `lastName` 属性。

### 标准委托

Kotlin 标准库提供了一些有用的委托，这样你就不必总是从头开始创建自己的委托。如果你使用这些委托之一，则不需要定义 `getValue()` 和 `setValue()` 函数，因为标准库会自动提供它们。

#### 延迟加载属性 (Lazy properties)

要仅在首次访问时才初始化属性，请使用延迟加载属性。标准库提供了 `Lazy` 接口用于委托。 

要创建 `Lazy` 接口的实例，请使用 `lazy()` 函数，并为其提供一个在首次调用 `get()` 函数时执行的 lambda 表达式。后续对 `get()` 函数的任何调用都将返回与第一次调用时提供的相同结果。延迟加载属性使用[尾随闭包](kotlin-tour-functions.md#trailing-lambdas)语法来传递 lambda 表达式。

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
    // 第一次访问 databaseConnection
    fetchData()
    // Connecting to the database...
    // Data: [Data1, Data2, Data3]

    // 后续访问使用现有连接
    fetchData()
    // Data: [Data1, Data2, Data3]
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3" id="kotlin-tour-properties-lazy"}

在这个例子中：

* 有一个包含 `connect()` 和 `query()` 成员函数的 `Database` 类。 
* `connect()` 函数向控制台打印一条字符串，`query()` 函数接受一个 SQL 查询并返回一个列表。
* 有一个名为 `databaseConnection` 的属性，它是一个延迟加载属性。
* 提供给 `lazy()` 函数的 lambda 表达式：
  * 创建了 `Database` 类的一个实例。
  * 在该实例 (`db`) 上调用了 `connect()` 成员函数。
  * 返回该实例。
* 有一个 `fetchData()` 函数，它：
  * 通过在 `databaseConnection` 属性上调用 `query()` 函数来创建一个 SQL 查询。
  * 将 SQL 查询结果赋值给 `data` 变量。
  * 将 `data` 变量打印到控制台。
* `main()` 函数调用了 `fetchData()` 函数。第一次调用时，延迟加载属性被初始化。第二次调用时，返回与第一次调用相同的结果。

延迟加载属性不仅在初始化资源密集时非常有用，而且在属性可能根本不会在代码中使用时也很有用。此外，延迟加载属性默认是线程安全的，这在你于并发环境下工作时特别有益。

欲了解更多信息，请参阅[延迟加载属性](delegated-properties.md#lazy-properties)。

#### 可观察属性 (Observable properties)

要监控属性值是否发生变化，请使用可观察属性。当你想要检测属性值的更改并利用该信息触发反应时，可观察属性非常有用。标准库提供了 `Delegates` 对象用于委托。

要创建可观察属性，你必须首先导入 `kotlin.properties.Delegates.observable`。然后，使用 `observable()` 函数，并为其提供一个每当属性更改时执行的 lambda 表达式。就像延迟加载属性一样，可观察属性使用[尾随闭包](kotlin-tour-functions.md#trailing-lambdas)语法来传递 lambda 表达式。

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

在这个例子中：

* 有一个 `Thermostat` 类，它包含一个可观察属性：`temperature`。
* `observable()` 函数接受 `20.0` 作为参数并使用它来初始化属性。
* 提供给 `observable()` 函数的 lambda 表达式：
  * 有三个参数：
    * `_`，引用属性本身。
    * `old`，属性的旧值。
    * `new`，属性的新值。
  * 检查 `new` 参数是否大于 `25`，并根据结果向控制台打印一条字符串。
* `main()` 函数：
  * 创建了 `Thermostat` 类的一个名为 `thermostat` 的实例。
  * 将该实例的 `temperature` 属性值更新为 `22.5`，这会触发打印带有温度更新信息的语句。
  * 将该实例的 `temperature` 属性值更新为 `27.0`，这会触发打印带有警告信息的语句。

可观察属性不仅对日志记录和调试有用。你还可以将其用于更新 UI 或执行额外检查（如验证数据的有效性）等用例。

欲了解更多信息，请参阅[可观察属性](delegated-properties.md#observable-properties)。

## 练习 {completion-point="true"}

### 练习 1 {initial-collapse-state="collapsed" collapsible="true" id="properties-exercise-1"}

你正在管理一家书店的库存系统。库存存储在一个列表中，其中每个项目代表特定书籍的数量。例如，`listOf(3, 0, 7, 12)` 表示书店有 3 本第一种书，0 本第二种书，7 本第三种书，以及 12 本第四种书。

编写一个名为 `findOutOfStockBooks()` 的函数，返回所有缺货书籍的索引列表。

<deflist collapsible="true">
    <def title="提示 1">
        使用来自标准库的 <a href="https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.collections/indices.html"><code>indices</code></a> 扩展属性。
    </def>
</deflist>

<deflist collapsible="true">
    <def title="提示 2">
        你可以使用 <a href="https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.collections/build-list.html"><code>buildList()</code></a> 函数来创建和管理列表，而不是手动创建并返回一个可变列表。<code>buildList()</code> 函数使用了一个带接收者的 lambda，你在之前的章节中已经学习过。
    </def>
</deflist>

|--|--|

```kotlin
fun findOutOfStockBooks(inventory: List<Int>): List<Int> {
    // 在此处编写你的代码
}

fun main() {
    val inventory = listOf(3, 0, 7, 0, 5)
    println(findOutOfStockBooks(inventory))
    // [1, 3]
}
```
{validate="false" kotlin-runnable="true" kotlin-min-compiler-version="1.3" id="kotlin-tour-properties-exercise-1"}

|---|---|
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
{initial-collapse-state="collapsed" collapsible="true" collapsed-title="示例解法 1" id="kotlin-tour-properties-solution-1-1"}

|---|---|
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
{initial-collapse-state="collapsed" collapsible="true" collapsed-title="示例解法 2" id="kotlin-tour-properties-solution-1-2"}

### 练习 2 {initial-collapse-state="collapsed" collapsible="true" id="properties-exercise-2"}

你有一个旅游应用，需要同时以千米和英里显示距离。为 `Double` 类型创建一个名为 `asMiles` 的扩展属性，将以千米为单位的距离转换为英里：

> 将千米转换为英里的公式是 `miles = kilometers * 0.621371`。
>
{style="note"}

<deflist collapsible="true">
    <def title="提示">
        记住扩展属性需要一个自定义的 <code>get()</code> 函数。
    </def>
</deflist>

|---|---|

```kotlin
val // 在此处编写你的代码

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

|---|---|
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
{initial-collapse-state="collapsed" collapsible="true" collapsed-title="示例解法" id="kotlin-tour-properties-solution-2"}

### 练习 3 {initial-collapse-state="collapsed" collapsible="true" id="properties-exercise-3"}

你有一个系统健康检查器，可以确定云系统的状态。然而，它可以运行以执行健康检查的两个函数都是性能密集型的。使用延迟加载属性来初始化检查，以便仅在需要时运行这些昂贵的函数：

|---|---|

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
    // 在此处编写你的代码

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

|---|---|
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
{initial-collapse-state="collapsed" collapsible="true" collapsed-title="示例解法" id="kotlin-tour-properties-solution-3"}

### 练习 4 {initial-collapse-state="collapsed" collapsible="true" id="properties-exercise-4"}

你正在构建一个简单的预算跟踪应用。该应用需要观察用户剩余预算的变化，并在预算低于特定阈值时通知他们。你有一个 `Budget` 类，它通过包含初始预算金额的 `totalBudget` 属性进行初始化。在该类中，创建一个名为 `remainingBudget` 的可观察属性，它会打印：

* 当值低于初始预算的 20% 时发出警告。
* 当预算从先前值增加时发出鼓励信息。

|---|---|

```kotlin
import kotlin.properties.Delegates.observable

class Budget(val totalBudget: Int) {
    var remainingBudget: Int // 在此处编写你的代码
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

|---|---|
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
{initial-collapse-state="collapsed" collapsible="true" collapsed-title="示例解法" id="kotlin-tour-properties-solution-4"}

<seealso></seealso>

<list columns="2" id="tour-nav">
  <li>
    <a as="button" href="kotlin-tour-intermediate-open-special-classes.md" mode="outline" icon="arrow-left" icon-position="left">上一步</a>
  </li>
  <li>
    <a as="button" href="kotlin-tour-intermediate-null-safety.md" mode="classic" icon="arrow-right" icon-position="right">下一步</a>
  </li>
</list>