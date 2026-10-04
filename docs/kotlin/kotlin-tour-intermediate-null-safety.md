[//]: # (title: 空安全)

<no-index/>

在初学者教程中，你已经学习了如何在代码中处理 `null` 值。本章将介绍空安全功能的常见用例，以及如何充分利用它们。

## 智能转换和安全转换 {id="smart-casts-and-safe-casts"}

Kotlin 有时可以在没有显式声明的情况下推断出类型。当你指示 Kotlin 将某个变量或对象视为属于特定类型时，该过程称为**转换 (casting)**。当类型被自动转换时（例如通过推断得出），则称为**智能转换 (smart casting)**。

### is 与 !is 运算符 {id="is-and-is-operators"}

在探索类型转换的工作原理之前，我们先来看看如何检查某个对象是否属于特定类型。为此，你可以在 `when` 或 `if` 条件表达式中使用 `is` 和 `!is` 运算符：

* `is` 检查对象是否为该类型，并返回布尔值。
* `!is` 检查对象**不是**该类型，并返回布尔值。

例如：

```kotlin
fun printObjectType(obj: Any) {
    when (obj) {
        is Int -> println("It's an Integer with value $obj")
        !is Double -> println("It's NOT a Double")
        else -> println("Unknown type")
    }
}

fun main() {
    val myInt = 42
    val myDouble = 3.14
    val myList = listOf(1, 2, 3)
  
    // 类型为 Int
    printObjectType(myInt)
    // It's an Integer with value 42

    // 类型为 List，因此它不是 Double。
    printObjectType(myList)
    // It's NOT a Double

    // 类型为 Double，因此触发 else 分支。
    printObjectType(myDouble)
    // Unknown type
}
```
{kotlin-runnable="true" id="kotlin-tour-null-safety-casts"}

> 你已经在[开放类与其他特殊类](kotlin-tour-intermediate-open-special-classes.md#sealed-classes)章节中看到了如何在 `when` 条件表达式中使用 `is` 和 `!is` 运算符的示例。
> 
{style="tip"}

### as 与 as? 运算符 {id="as-and-as-operators"}

要显式将对象*转换*为任意其他类型，请使用 `as` 运算符。这包括从可为 null 的类型转换为对应的不可为 null 类型。如果无法完成转换，程序会在**运行时**崩溃。这也是它被称为**不安全**转换运算符的原因。

```kotlin
fun main() {
//sampleStart
    val a: String? = null
    val b = a as String

    // 在运行时触发错误
    print(b)
//sampleEnd
}
```
{kotlin-runnable="true" validate="false" id="kotlin-tour-null-safety-as-operator"}

要显式将对象转换为不可为 null 的类型，但在失败时返回 `null` 而不是抛出错误，请使用 `as?` 运算符。由于 `as?` 运算符在失败时不会触发错误，因此它被称为**安全**转换运算符。

```kotlin
fun main() {
//sampleStart
    val a: String? = null
    val b = a as? String

    // 返回 null 值
    print(b)
    // null
//sampleEnd
}
```
{kotlin-runnable="true" id="kotlin-tour-null-safety-safe-operator"}

你可以将 `as?` 运算符与 Elvis 运算符 `?:` 结合使用，从而将多行代码简化为一行。例如，以下 `calculateTotalStringLength()` 函数计算混合列表中提供的所有字符串的总长度：

```kotlin
fun calculateTotalStringLength(items: List<Any>): Int {
    var totalLength = 0

    for (item in items) {
        totalLength += if (item is String) {
            item.length
        } else {
            0  // 对非 String 项加 0
        }
    }

    return totalLength
}
```

该示例：

* 使用 `totalLength` 变量作为计数器。
* 使用 `for` 循环遍历列表中的每一项。
* 使用 `if` 和 `is` 运算符检查当前项是否为字符串：
  * 如果是，则将该字符串的长度加到计数器中。
  * 如果不是，则计数器不递增。
* 返回 `totalLength` 变量的最终值。

这段代码可以简化为：

```kotlin
fun calculateTotalStringLength(items: List<Any>): Int {
    return items.sumOf { (it as? String)?.length ?: 0 }
}
```

该示例使用了 [`.sumOf()`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.collections/sum-of.html) 扩展方法，并提供了一个 lambda 表达式，该表达式：

* 针对列表中的每一项，使用 `as?` 执行到 `String` 的安全转换。
* 使用安全调用 `?.`，在调用不返回 `null` 值时访问 `length` 属性。
* 使用 Elvis 运算符 `?:`，在安全调用返回 `null` 值时返回 `0`。

## null 值与集合 {id="null-values-and-collections"}

在 Kotlin 中，使用集合通常涉及处理 `null` 值以及过滤掉不必要的元素。Kotlin 提供了许多实用的函数，可以在操作列表、集合、映射和其他类型的集合时编写整洁、高效且空安全的代码。

要从列表中过滤掉 `null` 值，请使用 [`filterNotNull()`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.collections/filter-not-null.html) 函数：

```kotlin
fun main() {
//sampleStart
    val emails: List<String?> = listOf("alice@example.com", null, "bob@example.com", null, "carol@example.com")

    val validEmails = emails.filterNotNull()

    println(validEmails)
    // [alice@example.com, bob@example.com, carol@example.com]
//sampleEnd
}
```
{kotlin-runnable="true" id="kotlin-tour-null-safety-filternotnull"}

如果你希望在创建列表时直接过滤 `null` 值，请使用 [`listOfNotNull()`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.collections/list-of-not-null.html) 函数：

```kotlin
fun main() {
//sampleStart
    val serverConfig = mapOf(
        "appConfig.json" to "App Configuration",
        "dbConfig.json" to "Database Configuration"
    )

    val requestedFile = "appConfig.json"
    val configFiles = listOfNotNull(serverConfig[requestedFile])

    println(configFiles)
    // [App Configuration]
//sampleEnd
}
```
{kotlin-runnable="true" id="kotlin-tour-null-safety-listofnotnull"}

在这两个示例中，如果所有元素均为 `null` 值，都将返回一个空列表。

Kotlin 还提供了一些用于在集合中查找值的函数。如果未找到值，它们会返回 `null` 值而不是触发错误：

* [`maxOrNull()`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.collections/max-or-null.html) 查找最大值。如果不存在，则返回 `null` 值。
* [`minOrNull()`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.collections/min-or-null.html) 查找最小值。如果不存在，则返回 `null` 值。

例如：

```kotlin
fun main() {
//sampleStart
    // 一周内记录的气温
    val temperatures = listOf(15, 18, 21, 21, 19, 17, 16)
  
    // 查找该周的最高气温
    val maxTemperature = temperatures.maxOrNull()
    println("Highest temperature recorded: ${maxTemperature ?: "No data"}")
    // Highest temperature recorded: 21

    // 查找该周的最低气温
    val minTemperature = temperatures.minOrNull()
    println("Lowest temperature recorded: ${minTemperature ?: "No data"}")
    // Lowest temperature recorded: 15
//sampleEnd
}
```
{kotlin-runnable="true" id="kotlin-tour-null-safety-collections"}

该示例使用 Elvis 运算符 `?:` 在函数返回 `null` 值时输出替代内容。

> `maxOrNull()` 和 `minOrNull()` 函数专用于**不包含** `null` 值的集合。否则，你将无法区分函数究竟是未能找到所需的值，还是找到了一个 `null` 值。
>
{style="note"}

你可以将 [`singleOrNull()`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.collections/single-or-null.html) 函数与 lambda 表达式结合使用，以查找匹配条件的单个元素。
如果不存在匹配元素或存在多个匹配元素，该函数将返回 `null` 值：

```kotlin
fun main() {
//sampleStart
    // 一周内记录的气温
    val temperatures = listOf(15, 18, 21, 21, 19, 17, 16)

    // 检查是否恰好有一天为 30 度
    val singleHotDay = temperatures.singleOrNull{ it == 30 }
    println("Single hot day with 30 degrees: ${singleHotDay ?: "None"}")
    // Single hot day with 30 degrees: None
//sampleEnd
}
```
{kotlin-runnable="true" id="kotlin-tour-null-safety-singleornull"}

> `singleOrNull()` 函数专用于**不包含** `null` 值的集合。
>
{style="note"}

某些函数使用 lambda 表达式对集合进行转换，并在无法实现其目的时返回 `null` 值。

若要使用 lambda 表达式转换集合并返回第一个非 `null` 的值，请使用 [`firstNotNullOfOrNull()`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.collections/first-not-null-of-or-null.html) 函数。如果不存在这样的值，该函数将返回 `null` 值：

```kotlin
fun main() {
//sampleStart
    data class User(val name: String?, val age: Int?)

    val users = listOf(
        User(null, 25),
        User("Alice", null),
        User("Bob", 30)
    )

    val firstNonNullName = users.firstNotNullOfOrNull { it.name }
    println(firstNonNullName)
    // Alice
//sampleEnd
}
```
{kotlin-runnable="true" id="kotlin-tour-null-safety-firstnotnullofornull"}

若要使用 lambda 表达式按顺序处理每个集合元素并生成累加值（或者在集合为空时返回 `null` 值），请使用 [`reduceOrNull()`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.collections/reduce-or-null.html) 函数：

```kotlin
fun main() {
//sampleStart
    // 购物车中商品的价格
    val itemPrices = listOf(20, 35, 15, 40, 10)

    // 使用 reduceOrNull() 函数计算总价
    val totalPrice = itemPrices.reduceOrNull { runningTotal, price -> runningTotal + price }
    println("Total price of items in the cart: ${totalPrice ?: "No items"}")
    // Total price of items in the cart: 120

    val emptyCart = listOf<Int>()
    val emptyTotalPrice = emptyCart.reduceOrNull { runningTotal, price -> runningTotal + price }
    println("Total price of items in the empty cart: ${emptyTotalPrice ?: "No items"}")
    // Total price of items in the empty cart: No items
//sampleEnd
}
```
{kotlin-runnable="true" id="kotlin-tour-null-safety-reduceornull"}

该示例同样使用 Elvis 运算符 `?:` 在函数返回 `null` 值时输出替代内容。

> `reduceOrNull()` 函数专用于**不包含** `null` 值的集合。
>
{style="note"}

探索 Kotlin 的[标准库](https://kotlinlang.org/api/core/kotlin-stdlib/)，以发现更多可用于提升代码安全性的函数。

## 提前返回与 Elvis 运算符 {id="early-returns-and-the-elvis-operator"}

在初学者教程中，你已经学习了如何使用[提前返回](kotlin-tour-functions.md#early-returns-in-functions)在达到特定条件时阻止函数继续执行。你可以将 Elvis 运算符 `?:` 与提前返回结合使用，以检查函数的前置条件。这种方法是保持代码简洁的绝佳方式，因为无需使用嵌套检查。降低代码复杂度还可以提高其可维护性。例如：

```kotlin
data class User(
    val id: Int,
    val name: String,
    // 好友用户 ID 列表
    val friends: List<Int>
)

// 获取用户好友数量的函数
fun getNumberOfFriends(users: Map<Int, User>, userId: Int): Int {
    // 检索用户，如果未找到则返回 -1
    val user = users[userId] ?: return -1
    // 返回好友数量
    return user.friends.size
}

fun main() {
    // 创建一些示例用户
    val user1 = User(1, "Alice", listOf(2, 3))
    val user2 = User(2, "Bob", listOf(1))
    val user3 = User(3, "Charlie", listOf(1))

    // 创建用户映射
    val users = mapOf(1 to user1, 2 to user2, 3 to user3)

    println(getNumberOfFriends(users, 1))
    // 2
    println(getNumberOfFriends(users, 2))
    // 1
    println(getNumberOfFriends(users, 4))
    // -1
}
```
{kotlin-runnable="true" id="kotlin-tour-null-safety-early-return"}

在该示例中：

* 定义了一个 `User` 数据类，包含用户的 `id`、`name` 和好友列表属性。
* `getNumberOfFriends()` 函数：
  * 接收一个 `User` 实例的映射和一个整型用户 ID。
  * 使用提供的用户 ID 获取 `User` 实例映射中的值。
  * 使用 Elvis 运算符，在映射值为 `null` 时提前从函数返回 `-1`。
  * 将从映射中找到的值赋值给 `user` 变量。
  * 通过使用 `size` 属性返回用户好友列表中的好友数量。
* `main()` 函数：
  * 创建了三个 `User` 实例。
  * 创建了这些 `User` 实例的映射并将其赋值给 `users` 变量。
  * 分别使用值 `1` 和 `2` 调用 `users` 变量上的 `getNumberOfFriends()` 函数，为 `"Alice"` 返回 2 个好友，为 `"Bob"` 返回 1 个好友。
  * 使用值 `4` 调用 `users` 变量上的 `getNumberOfFriends()` 函数，这将触发提前返回并返回 `-1`。

你可能会注意到，不使用提前返回的代码可能更加简短。但是，这种做法需要多次安全调用，因为 `users[userId]` 可能会返回 `null` 值，这会略微降低代码的可读性：

```kotlin
fun getNumberOfFriends(users: Map<Int, User>, userId: Int): Int {
    // 检索用户，如果未找到则返回 -1
    return users[userId]?.friends?.size ?: -1
}
```
{validate="false"}

尽管此示例仅使用 Elvis 运算符检查了一个条件，但你可以添加多个检查来覆盖所有严重错误路径。将提前返回与 Elvis 运算符结合使用，可以防止程序执行不必要的工作，并在检测到 `null` 值或无效情况时立即终止，从而使代码更加安全。

有关在代码中如何使用 `return` 的更多信息，请参阅[返回与跳转](returns.md)。

## 练习 {completion-point="true" id="practice"}

<deflist appearance="clear" collapsible="true" numbered="true">
<def title="使用安全转换和 Elvis 运算符验证用户数据" id="null-safety-exercise-1">

你正在为一个应用程序开发通知系统，用户可以在其中启用或禁用不同类型的通知。
补全 `getNotificationPreferences()` 函数，使得：

1. `validUser` 变量使用 `as?` 运算符检查 `user` 是否为 `User` 类的实例。如果不是，则返回一个空列表。
2. `userName` 变量使用 Elvis 运算符 `?:`，确保在用户名称为 `null` 时默认使用 `"Guest"`。
3. 最后的 return 语句使用 `.takeIf()` 函数，仅在启用对应通知时才包含电子邮件和短信通知首选项。
4. `main()` 函数成功运行并打印预期的输出。

> [`takeIf()` 函数](scope-functions.md#takeif-and-takeunless)在给定条件为 true 时返回原始值，
> 否则返回 `null`。例如：
>
> ```kotlin
> fun main() {
>     // 用户已登录
>     val userIsLoggedIn = true
>     // 用户拥有有效会话
>     val hasSession = true
> 
>     // 如果用户已登录且拥有有效会话，
>     // 则授予对仪表板的访问权限
>     val canAccessDashboard = userIsLoggedIn.takeIf { hasSession }
> 
>     println(canAccessDashboard ?: "Access denied")
>     // true
> }
> ```
>
{style = "tip"}

```kotlin
data class User(val name: String?)

fun getNotificationPreferences(user: Any, emailEnabled: Boolean, smsEnabled: Boolean): List<String> {
    val validUser = // 在此处编写你的代码
    val userName = // 在此处编写你的代码

    return listOfNotNull( /* 在此处编写你的代码 */)
}

fun main() {
    val user1 = User("Alice")
    val user2 = User(null)
    val invalidUser = "NotAUser"

    println(getNotificationPreferences(user1, emailEnabled = true, smsEnabled = false))
    // [Email Notifications enabled for Alice]
    println(getNotificationPreferences(user2, emailEnabled = false, smsEnabled = true))
    // [SMS Notifications enabled for Guest]
    println(getNotificationPreferences(invalidUser, emailEnabled = true, smsEnabled = true))
    // []
}
```
{validate="false" kotlin-runnable="true" kotlin-min-compiler-version="1.3" id="kotlin-tour-null-safety-exercise-1"}

```kotlin
data class User(val name: String?)

fun getNotificationPreferences(user: Any, emailEnabled: Boolean, smsEnabled: Boolean): List<String> {
    val validUser = user as? User ?: return emptyList()
    val userName = validUser.name ?: "Guest"

    return listOfNotNull(
        "Email Notifications enabled for $userName".takeIf { emailEnabled },
        "SMS Notifications enabled for $userName".takeIf { smsEnabled }
    )
}

fun main() {
    val user1 = User("Alice")
    val user2 = User(null)
    val invalidUser = "NotAUser"

    println(getNotificationPreferences(user1, emailEnabled = true, smsEnabled = false))
    // [Email Notifications enabled for Alice]
    println(getNotificationPreferences(user2, emailEnabled = false, smsEnabled = true))
    // [SMS Notifications enabled for Guest]
    println(getNotificationPreferences(invalidUser, emailEnabled = true, smsEnabled = true))
    // []
}
```
{initial-collapse-state="collapsed" collapsible="true" collapsed-title="示例解决方案" id="kotlin-tour-null-safety-solution-1"}

</def>
<def title="使用 singleOrNull() 查找单个有效订阅" id="null-safety-exercise-2">

你正在开发一个基于订阅的流媒体服务，用户可以拥有多个订阅，但**同一时间只能有一个订阅处于有效状态**。补全 `getActiveSubscription()` 函数，使其使用带有谓词的 `singleOrNull()` 函数，在存在多个有效订阅时返回 `null` 值：

```kotlin
data class Subscription(val name: String, val isActive: Boolean)

fun getActiveSubscription(subscriptions: List<Subscription>): Subscription? // 在此处编写你的代码

fun main() {
    val userWithPremiumPlan = listOf(
        Subscription("Basic Plan", false),
        Subscription("Premium Plan", true)
    )

    val userWithConflictingPlans = listOf(
        Subscription("Basic Plan", true),
        Subscription("Premium Plan", true)
    )

    println(getActiveSubscription(userWithPremiumPlan))
    // Subscription(name=Premium Plan, isActive=true)

    println(getActiveSubscription(userWithConflictingPlans))
    // null
}
```
{validate="false" kotlin-runnable="true" kotlin-min-compiler-version="1.3" id="kotlin-tour-null-safety-exercise-2"}

```kotlin
data class Subscription(val name: String, val isActive: Boolean)

fun getActiveSubscription(subscriptions: List<Subscription>): Subscription? {
    return subscriptions.singleOrNull { subscription -> subscription.isActive }
}

fun main() {
    val userWithPremiumPlan = listOf(
        Subscription("Basic Plan", false),
        Subscription("Premium Plan", true)
    )

    val userWithConflictingPlans = listOf(
        Subscription("Basic Plan", true),
        Subscription("Premium Plan", true)
    )

    println(getActiveSubscription(userWithPremiumPlan))
    // Subscription(name=Premium Plan, isActive=true)

    println(getActiveSubscription(userWithConflictingPlans))
    // null
}
```
{initial-collapse-state="collapsed" collapsible="true" collapsed-title="示例解决方案 1" id="kotlin-tour-null-safety-solution-2-1"}

```kotlin
data class Subscription(val name: String, val isActive: Boolean)

fun getActiveSubscription(subscriptions: List<Subscription>): Subscription? =
    subscriptions.singleOrNull { it.isActive }

fun main() {
    val userWithPremiumPlan = listOf(
        Subscription("Basic Plan", false),
        Subscription("Premium Plan", true)
    )

    val userWithConflictingPlans = listOf(
        Subscription("Basic Plan", true),
        Subscription("Premium Plan", true)
    )

    println(getActiveSubscription(userWithPremiumPlan))
    // Subscription(name=Premium Plan, isActive=true)

    println(getActiveSubscription(userWithConflictingPlans))
    // null
}
```
{initial-collapse-state="collapsed" collapsible="true" collapsed-title="示例解决方案 2" id="kotlin-tour-null-safety-solution-2-2"}

</def>
<def title="使用 mapNotNull() 过滤活跃用户名" id="null-safety-exercise-3">

你正在开发一个社交媒体平台，用户拥有用户名和账户状态。你希望查看当前活跃的用户名列表。补全 `getActiveUsernames()` 函数，为 [`mapNotNull()` 函数](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.collections/map-not-null.html)提供一个谓词，使其在用户处于活跃状态时返回用户名，非活跃状态时返回 `null` 值：

```kotlin
data class User(val username: String, val isActive: Boolean)

fun getActiveUsernames(users: List<User>): List<String> {
    return users.mapNotNull { /* 在此处编写你的代码 */ }
}

fun main() {
    val allUsers = listOf(
        User("alice123", true),
        User("bob_the_builder", false),
        User("charlie99", true)
    )

    println(getActiveUsernames(allUsers))
    // [alice123, charlie99]
}
```
{validate="false" kotlin-runnable="true" kotlin-min-compiler-version="1.3" id="kotlin-tour-null-safety-exercise-3"}

> 与练习 1 类似，在检查用户是否处于活跃状态时，你可以使用 [`takeIf()` 函数](scope-functions.md#takeif-and-takeunless)。
>
{ style = "tip" }

```kotlin
data class User(val username: String, val isActive: Boolean)

fun getActiveUsernames(users: List<User>): List<String> {
    return users.mapNotNull { user ->
        if (user.isActive) user.username else null
    }
}

fun main() {
    val allUsers = listOf(
        User("alice123", true),
        User("bob_the_builder", false),
        User("charlie99", true)
    )

    println(getActiveUsernames(allUsers))
    // [alice123, charlie99]
}
```
{initial-collapse-state="collapsed" collapsible="true" collapsed-title="示例解决方案 1" id="kotlin-tour-null-safety-solution-3-1"}

```kotlin
data class User(val username: String, val isActive: Boolean)

fun getActiveUsernames(users: List<User>): List<String> =
    users.mapNotNull { user -> user.username.takeIf { user.isActive } }

fun main() {
    val allUsers = listOf(
        User("alice123", true),
        User("bob_the_builder", false),
        User("charlie99", true)
    )

    println(getActiveUsernames(allUsers))
    // [alice123, charlie99]
}
```
{initial-collapse-state="collapsed" collapsible="true" collapsed-title="示例解决方案 2" id="kotlin-tour-null-safety-solution-3-2"}

</def>
<def title="使用提前返回和 Elvis 运算符验证库存" id="null-safety-exercise-4">

你正在为一个电子商务平台开发库存管理系统。在处理销售前，你需要根据可用库存检查商品的需求数量是否有效。

补全 `validateStock()` 函数，使其使用提前返回和 Elvis 运算符（在适用处）检查以下情况：

* `requested` 变量为 `null`。
* `available` 变量为 `null`。
* `requested` 变量为负数。
* `requested` 变量中的数量大于 `available` 变量中的数量。

在上述所有情况下，函数必须提前返回并返回值 `-1`。

```kotlin
fun validateStock(requested: Int?, available: Int?): Int {
    // 在此处编写你的代码
}

fun main() {
    println(validateStock(5,10))
    // 5
    println(validateStock(null,10))
    // -1
    println(validateStock(-2,10))
    // -1
}
```
{validate="false" kotlin-runnable="true" kotlin-min-compiler-version="1.3" id="kotlin-tour-null-safety-exercise-4"}

```kotlin
fun validateStock(requested: Int?, available: Int?): Int {
    val validRequested = requested ?: return -1
    val validAvailable = available ?: return -1

    if (validRequested < 0) return -1
    if (validRequested > validAvailable) return -1

    return validRequested
}

fun main() {
    println(validateStock(5,10))
    // 5
    println(validateStock(null,10))
    // -1
    println(validateStock(-2,10))
    // -1
}
```
{initial-collapse-state="collapsed" collapsible="true" collapsed-title="示例解决方案" id="kotlin-tour-null-safety-solution-4"}

</def>
</deflist>

<seealso></seealso>

<list columns="2" id="tour-nav">
  <li>
    <a as="button" href="kotlin-tour-intermediate-properties.md" mode="outline" icon="arrow-left" icon-position="left">上一步</a>
  </li>
  <li>
    <a as="button" href="kotlin-tour-intermediate-libraries-and-apis.md" mode="classic" icon="arrow-right" icon-position="right">下一步</a>
  </li>
</list>