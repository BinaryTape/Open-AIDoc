[//]: # (title: 进阶：Null 安全)

<no-index/>

<tldr>
    <p><img src="icon-1-done.svg" width="20" alt="第一步" /> <a href="kotlin-tour-intermediate-extension-functions.md">扩展函数</a><br />
        <img src="icon-2-done.svg" width="20" alt="第二步" /> <a href="kotlin-tour-intermediate-scope-functions.md">作用域函数</a><br />
        <img src="icon-3-done.svg" width="20" alt="第三步" /> <a href="kotlin-tour-intermediate-lambdas-receiver.md">带接收者的 Lambda 表达式</a><br />
        <img src="icon-4-done.svg" width="20" alt="第四步" /> <a href="kotlin-tour-intermediate-classes-interfaces.md">类与接口</a><br />
        <img src="icon-5-done.svg" width="20" alt="第五步" /> <a href="kotlin-tour-intermediate-objects.md">对象</a><br />
        <img src="icon-6-done.svg" width="20" alt="第六步" /> <a href="kotlin-tour-intermediate-open-special-classes.md">Open 类与特殊类</a><br />
        <img src="icon-7-done.svg" width="20" alt="第七步" /> <a href="kotlin-tour-intermediate-properties.md">属性</a><br />
        <img src="icon-8.svg" width="20" alt="第八步" /> <strong>Null 安全</strong><br />
        <img src="icon-9-todo.svg" width="20" alt="第九步" /> <a href="kotlin-tour-intermediate-libraries-and-apis.md">库与 API</a></p>
</tldr>

在初学者教程中，你已经学习了如何在代码中处理 `null` 值。本章将涵盖 Null 安全功能的常见用例，以及如何充分利用这些功能。

## 智能转换与安全转换

Kotlin 有时可以在没有显式声明的情况下推断类型。当你告诉 Kotlin 将某个变量或对象视为属于特定类型时，这个过程被称为**转换 (casting)**。当类型被自动转换（例如被推断）时，它被称为**智能转换 (smart casting)**。

### is 与 !is 运算符

在我们探索转换如何工作之前，让我们看看如何检查一个对象是否具有某种类型。为此，你可以将 `is` 和 `!is` 运算符与 `when` 或 `if` 条件表达式配合使用：

* `is` 检查对象是否属于该类型并返回布尔值。
* `!is` 检查对象是否**不**属于该类型并返回布尔值。

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
  
    // 类型是 Int
    printObjectType(myInt)
    // It's an Integer with value 42

    // 类型是 List，所以它不是 Double。
    printObjectType(myList)
    // It's NOT a Double

    // 类型是 Double，所以触发 else 分支。
    printObjectType(myDouble)
    // Unknown type
}
```
{kotlin-runnable="true" id="kotlin-tour-null-safety-casts"}

> 你已经在 [Open 类与其他特殊类](kotlin-tour-intermediate-open-special-classes.md#sealed-classes)章节中看过一个如何将 `when` 条件表达式与 `is` 和 `!is` 运算符配合使用的例子。
> 
{style="tip"}

### as 与 as? 运算符

要显式地将一个对象*转换*为任何其他类型，请使用 `as` 运算符。这包括从可空类型转换为其对应的不可空类型。如果转换无法执行，程序将在**运行时**崩溃。这就是为什么它被称为**不安全**转换运算符。

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

要显式地将一个对象转换为不可空类型，但在失败时返回 `null` 而不是抛出错误，请使用 `as?` 运算符。由于 `as?` 运算符在失败时不会触发错误，因此它被称为**安全**运算符。

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

你可以将 `as?` 运算符与 Elvis 运算符 `?:` 结合使用，将多行代码缩减为一行。例如，下面的 `calculateTotalStringLength()` 函数计算混合列表中提供的所有字符串的总长度：

```kotlin
fun calculateTotalStringLength(items: List<Any>): Int {
    var totalLength = 0

    for (item in items) {
        totalLength += if (item is String) {
            item.length
        } else {
            0  // 为非 String 项目添加 0
        }
    }

    return totalLength
}
```

该示例：

* 使用 `totalLength` 变量作为计数器。
* 使用 `for` 循环遍历列表中的每一项。
* 使用 `if` 和 `is` 运算符检查当前项是否为字符串：
  * 如果是，则将字符串长度添加到计数器中。
  * 如果不是，计数器不增加。
* 返回 `totalLength` 变量的最终值。

这段代码可以缩减为：

```kotlin
fun calculateTotalStringLength(items: List<Any>): Int {
    return items.sumOf { (it as? String)?.length ?: 0 }
}
```

该示例使用了 [`.sumOf()`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.collections/sum-of.html) 扩展函数并提供了一个 lambda 表达式，该表达式：

* 对于列表中的每一项，使用 `as?` 执行向 `String` 的安全转换。
* 使用安全调用 `?.` 在调用不返回 `null` 值的情况下访问 `length` 属性。
* 使用 Elvis 运算符 `?:` 在安全调用返回 `null` 值的情况下返回 `0`。

## Null 值与集合

在 Kotlin 中，处理集合通常涉及处理 `null` 值并过滤掉不需要的元素。Kotlin 提供了许多有用的函数，你可以在处理列表、集合 (set)、映射 (map) 和其他类型的集合时，使用它们来编写简洁、高效且 null 安全的代码。

要从列表中过滤 `null` 值，请使用 [`filterNotNull()`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.collections/filter-not-null.html) 函数：

```kotlin
fun main() {
//sampleStart
    val emails: `List<String?>` = listOf("alice@example.com", null, "bob@example.com", null, "carol@example.com")

    val validEmails = emails.filterNotNull()

    println(validEmails)
    // [alice@example.com, bob@example.com, carol@example.com]
//sampleEnd
}
```
{kotlin-runnable="true" id="kotlin-tour-null-safety-filternotnull"}

如果你想在创建列表时直接执行 `null` 值过滤，请使用 [`listOfNotNull()`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.collections/list-of-not-null.html) 函数：

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

在这两个示例中，如果所有项均为 `null` 值，则返回一个空列表。

Kotlin 还提供了用于在集合中查找值的函数。如果未找到值，它们将返回 `null` 值而不是触发错误：

* [`maxOrNull()`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.collections/max-or-null.html) 查找最大值。如果不存在，则返回 `null` 值。
* [`minOrNull()`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.collections/min-or-null.html) 查找最小值。如果不存在，则返回 `null` 值。

例如：

```kotlin
fun main() {
//sampleStart
    // 一周记录的温度
    val temperatures = listOf(15, 18, 21, 21, 19, 17, 16)
  
    // 查找本周最高温度
    val maxTemperature = temperatures.maxOrNull()
    println("Highest temperature recorded: ${maxTemperature ?: "No data"}")
    // Highest temperature recorded: 21

    // 查找本周最低温度
    val minTemperature = temperatures.minOrNull()
    println("Lowest temperature recorded: ${minTemperature ?: "No data"}")
    // Lowest temperature recorded: 15
//sampleEnd
}
```
{kotlin-runnable="true" id="kotlin-tour-null-safety-collections"}

该示例使用 Elvis 运算符 `?:` 在函数返回 `null` 值时返回打印语句。

> `maxOrNull()` 和 `minOrNull()` 函数设计用于**不包含** `null` 值的集合。否则，你无法区分是函数找不到所需的值，还是找到了一个 `null` 值。
>
{style="note"}

你可以将 [`singleOrNull()`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.collections/single-or-null.html) 函数与 lambda 表达式配合使用，以查找符合条件的单个项目。如果不存在该项或存在多个符合条件的项，该函数将返回 `null` 值：

```kotlin
fun main() {
//sampleStart
    // 一周记录的温度
    val temperatures = listOf(15, 18, 21, 21, 19, 17, 16)

    // 检查是否恰好有一天是 30 度
    val singleHotDay = temperatures.singleOrNull{ it == 30 }
    println("Single hot day with 30 degrees: ${singleHotDay ?: "None"}")
    // Single hot day with 30 degrees: None
//sampleEnd
}
```
{kotlin-runnable="true" id="kotlin-tour-null-safety-singleornull"}

> `singleOrNull()` 函数设计用于**不包含** `null` 值的集合。
>
{style="note"}

某些函数使用 lambda 表达式来转换集合，并在无法实现其目的时返回 `null` 值。

要使用 lambda 表达式转换集合并返回第一个非 `null` 的值，请使用 [`firstNotNullOfOrNull()`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.collections/first-not-null-of-or-null.html) 函数。如果不存在这样的值，该函数将返回 `null` 值：

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

要使用 lambda 表达式按顺序处理每个集合项并创建累加值（或在集合为空时返回 `null` 值），请使用 [`reduceOrNull()`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.collections/reduce-or-null.html) 函数：

```kotlin
fun main() {
//sampleStart
    // 购物车中物品的价格
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

该示例同样使用 Elvis 运算符 `?:` 在函数返回 `null` 值时返回打印语句。

> `reduceOrNull()` 函数设计用于**不包含** `null` 值的集合。
>
{style="note"}

探索 Kotlin 的[标准库](https://kotlinlang.org/api/core/kotlin-stdlib/)以查找更多可以使你的代码更安全的函数。

## 提前返回与 Elvis 运算符

在初学者教程中，你学习了如何使用[提前返回](kotlin-tour-functions.md#early-returns-in-functions)来防止函数在超过某一点后继续处理。你可以将 Elvis 运算符 `?:` 与提前返回结合使用，以在函数中检查前提条件。这种方法是保持代码简洁的绝佳方式，因为你不需要使用嵌套检查。代码复杂性的降低也使其更易于维护。例如：

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

* 有一个 `User` 数据类，包含用户的 `id`、`name` 和好友列表属性。
* `getNumberOfFriends()` 函数：
  * 接收一个 `User` 实例映射和一个整数形式的用户 ID。
  * 使用提供的用户 ID 访问 `User` 实例映射的值。
  * 使用 Elvis 运算符在映射值为 `null` 值时提前返回函数并返回 `-1`。
  * 将从映射中找到的值赋值给 `user` 变量。
  * 通过使用 `size` 属性返回用户好友列表中的好友数量。
* `main()` 函数：
  * 创建三个 `User` 实例。
  * 创建这些 `User` 实例的映射并将其赋值给 `users` 变量。
  * 在 `users` 变量上调用 `getNumberOfFriends()` 函数，参数为 `1` 和 `2`，分别为 `"Alice"` 返回两个好友，为 `"Bob"` 返回一个好友。
  * 在 `users` 变量上调用 `getNumberOfFriends()` 函数，参数为 `4`，这将触发提前返回并返回值 `-1`。

你可能会注意到，如果没有提前返回，代码可以更简洁。然而，这种方法需要多次安全调用，因为 `users[userId]` 可能会返回 `null` 值，这使得代码稍微难以阅读：

```kotlin
fun getNumberOfFriends(users: Map<Int, User>, userId: Int): Int {
    // 检索用户，如果未找到则返回 -1
    return users[userId]?.friends?.size ?: -1
}
```
{validate="false"}

虽然这个示例仅使用 Elvis 运算符检查了一个条件，但你可以添加多个检查来覆盖任何关键的错误路径。带有 Elvis 运算符的提前返回可以防止程序做不必要的工作，并通过在检测到 `null` 值或无效情况时立即停止，使你的代码更安全。

有关如何在代码中使用 `return` 的更多信息，请参阅[返回与跳转](returns.md)。

## 练习

### 练习 1 {initial-collapse-state="collapsed" collapsible="true" id="null-safety-exercise-1"}

你正在为一个应用开发通知系统，用户可以启用或禁用不同类型的通知。完成 `getNotificationPreferences()` 函数，要求：

1. `validUser` 变量使用 `as?` 运算符检查 `user` 是否为 `User` 类的实例。如果不是，返回一个空列表。
2. `userName` 变量使用 Elvis `?:` 运算符，确保如果用户名为 `null`，则默认为 `"Guest"`。
3. 最后的 return 语句使用 `.takeIf()` 函数，仅在启用电子邮件和短信通知时才包含对应的偏好设置。
4. `main()` 函数成功运行并打印预期的输出。

> [`takeIf()` 函数](scope-functions.md#takeif-and-takeunless)在给定条件为真时返回原始值，否则返回 `null`。例如：
>
> ```kotlin
> fun main() {
>     // 用户已登录
>     val userIsLoggedIn = true
>     // 用户拥有活动会话
>     val hasSession = true
> 
>     // 如果用户已登录且拥有活动会话，则授予仪表板访问权限
>     val canAccessDashboard = userIsLoggedIn.takeIf { hasSession }
> 
>     println(canAccessDashboard ?: "Access denied")
>     // true
> }
> ```
>
{style = "tip"}

|--|--|

```kotlin
data class User(val name: String?)

fun getNotificationPreferences(user: Any, emailEnabled: Boolean, smsEnabled: Boolean): `List<String>` {
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

|--|--|

```kotlin
data class User(val name: String?)

fun getNotificationPreferences(user: Any, emailEnabled: Boolean, smsEnabled: Boolean): `List<String>` {
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
{initial-collapse-state="collapsed" collapsible="true" collapsed-title="示例解法" id="kotlin-tour-null-safety-solution-1"}

### 练习 2 {initial-collapse-state="collapsed" collapsible="true" id="null-safety-exercise-2"}

你正在开发一个基于订阅的流媒体服务，用户可以拥有多个订阅，但**一次只能有一个处于活动状态**。完成 `getActiveSubscription()` 函数，使其使用带有谓词的 `singleOrNull()` 函数，如果存在多个活动订阅，则返回 `null` 值：

|--|--|

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

|--|--|

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
{initial-collapse-state="collapsed" collapsible="true" collapsed-title="示例解法 1" id="kotlin-tour-null-safety-solution-2-1"}

|--|--|

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
{initial-collapse-state="collapsed" collapsible="true" collapsed-title="示例解法 2" id="kotlin-tour-null-safety-solution-2-2"}

### 练习 3 {initial-collapse-state="collapsed" collapsible="true" id="null-safety-exercise-3"}

你正在开发一个社交媒体平台，用户拥有用户名和帐户状态。你想要查看当前活跃的用户列表。完成 `getActiveUsernames()` 函数，使 [`mapNotNull()` 函数](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.collections/map-not-null.html)包含一个谓词，如果用户处于活跃状态则返回用户名，否则返回 `null` 值：

|--|--|

```kotlin
data class User(val username: String, val isActive: Boolean)

fun getActiveUsernames(users: List<User>): `List<String>` {
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

|--|--|

> 就像在练习 1 中一样，当检查用户是否处于活动状态时，你可以使用 [`takeIf()` 函数](scope-functions.md#takeif-and-takeunless)。
>
{ style = "tip" }

|--|--|

```kotlin
data class User(val username: String, val isActive: Boolean)

fun getActiveUsernames(users: List<User>): `List<String>` {
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
{initial-collapse-state="collapsed" collapsible="true" collapsed-title="示例解法 1" id="kotlin-tour-null-safety-solution-3-1"}

|--|--|

```kotlin
data class User(val username: String, val isActive: Boolean)

fun getActiveUsernames(users: List<User>): `List<String>` =
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
{initial-collapse-state="collapsed" collapsible="true" collapsed-title="示例解法 2" id="kotlin-tour-null-safety-solution-3-2"}

### 练习 4 {initial-collapse-state="collapsed" collapsible="true" id="null-safety-exercise-4"}

你正在为一个电子商务平台开发库存管理系统。在处理销售之前，你需要根据可用库存检查请求的产品数量是否有效。

完成 `validateStock()` 函数，使其使用提前返回和 Elvis 运算符（如果适用）来检查：

* `requested` 变量是否为 `null`。
* `available` 变量是否为 `null`。
* `requested` 变量是否为负值。
* `requested` 变量中的数值是否高于 `available` 变量中的数值。

在上述所有情况下，函数必须提前返回并返回值 `-1`。

|--|--|

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

|--|--|

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
{initial-collapse-state="collapsed" collapsible="true" collapsed-title="示例解法" id="kotlin-tour-null-safety-solution-4"}

## 下一步

[进阶：库与 API](kotlin-tour-intermediate-libraries-and-apis.md)