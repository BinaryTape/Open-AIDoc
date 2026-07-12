[//]: # (title: Null 安全)

<no-index/>

在初學者導覽中，您學習了如何在程式碼中處理 `null` 值。本章節將介紹 Null 安全特性的常見使用案例，以及如何充分利用這些特性。

## 智慧轉換與安全轉換

Kotlin 有時可以在沒有顯式宣告的情況下推斷型別。當您告訴 Kotlin 將某個變數或物件視為屬於特定型別時，這個過程稱為 **轉換 (casting)**。當型別被自動轉換時（例如被推斷時），則稱為 **智慧轉換 (smart casting)**。

### is 與 !is 運算子

在探索轉換如何運作之前，讓我們先看看如何檢查物件是否具有特定型別。為此，您可以在 `when` 或 `if` 條件運算式中使用 `is` 和 `!is` 運算子：

* `is` 檢查物件是否具有該型別並傳回布林值。
* `!is` 檢查物件是否 **不具有** 該型別並傳回布林值。

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
  
    // 型別為 Int
    printObjectType(myInt)
    // It's an Integer with value 42

    // 型別為 List，因此它不是 Double。
    printObjectType(myList)
    // It's NOT a Double

    // 型別為 Double，因此觸發 else 分支。
    printObjectType(myDouble)
    // Unknown type
}
```
{kotlin-runnable="true" id="kotlin-tour-null-safety-casts"}

> 您已經在 [Open 與其他特殊類別](kotlin-tour-intermediate-open-special-classes.md#sealed-classes) 章節中看過如何在 `when` 條件運算式中使用 `is` 和 `!is` 運算子的範例。
> 
{style="tip"}

### as 與 as? 運算子

要將物件顯式 *轉換* 為任何其他型別，請使用 `as` 運算子。這包括從可為 null 型別轉換為其對應的不可為 null 型別。如果無法轉換，程式會在 **執行時 (runtime)** 崩潰。這就是為什麼它被稱為 **非安全** 轉換運算子。

```kotlin
fun main() {
//sampleStart
    val a: String? = null
    val b = a as String

    // 在執行時觸發錯誤
    print(b)
//sampleEnd
}
```
{kotlin-runnable="true" validate="false" id="kotlin-tour-null-safety-as-operator"}

若要將物件顯式轉換為不可為 null 型別，但在失敗時傳回 `null` 而不拋出錯誤，請使用 `as?` 運算子。由於 `as?` 運算子在失敗時不會觸發錯誤，因此它被稱為 **安全** 運算子。

```kotlin
fun main() {
//sampleStart
    val a: String? = null
    val b = a as? String

    // 傳回 null 值
    print(b)
    // null
//sampleEnd
}
```
{kotlin-runnable="true" id="kotlin-tour-null-safety-safe-operator"}

您可以將 `as?` 運算子與 Elvis 運算子 `?:` 結合使用，將幾行程式碼縮減為一行。例如，下方的 `calculateTotalStringLength()` 函式會計算混合列表中提供的所有字串總長度：

```kotlin
fun calculateTotalStringLength(items: List<Any>): Int {
    var totalLength = 0

    for (item in items) {
        totalLength += if (item is String) {
            item.length
        } else {
            0  // 對於非字串項目加 0
        }
    }

    return totalLength
}
```

這個範例：

* 使用 `totalLength` 變數作為計數器。
* 使用 `for` 迴圈來遍歷列表中的每個項目。
* 使用 `if` 和 `is` 運算子來檢查目前項目是否為字串：
  * 如果是，則將字串長度加到計數器。
  * 如果不是，則計數器不遞增。
* 傳回 `totalLength` 變數的最終值。

這段程式碼可以縮減為：

```kotlin
fun calculateTotalStringLength(items: List<Any>): Int {
    return items.sumOf { (it as? String)?.length ?: 0 }
}
```

該範例使用了 [`.sumOf()`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.collections/sum-of.html) 擴充函式並提供了一個 Lambda 運算式，該運算式會：

* 對於列表中的每個項目，使用 `as?` 進行到 `String` 的安全轉換。
* 如果呼叫未傳回 `null` 值，則使用安全呼叫 `?.` 來存取 `length` 屬性。
* 如果安全呼叫傳回 `null` 值，則使用 Elvis 運算子 `?:` 傳回 `0`。

## Null 值與集合

在 Kotlin 中，處理集合時通常涉及處理 `null` 值並過濾掉不必要的元素。Kotlin 擁有一些實用的函式，讓您在處理列表、集合 (Set)、Map 和其他類型的集合時，能夠編寫簡潔、高效且 Null 安全的程式碼。

若要從列表中過濾掉 `null` 值，請使用 [`filterNotNull()`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.collections/filter-not-null.html) 函式：

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

如果您想在建立列表時直接進行 `null` 值的過濾，請使用 [`listOfNotNull()`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.collections/list-of-not-null.html) 函式：

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

在這兩個範例中，如果所有項目都是 `null` 值，則會傳回一個空列表。

Kotlin 還提供了可用於在集合中尋找值的函式。如果找不到值，它們會傳回 `null` 值而不會觸發錯誤：

* [`maxOrNull()`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.collections/max-or-null.html) 尋找最大值。如果不存在，則傳回 `null` 值。
* [`minOrNull()`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.collections/min-or-null.html) 尋找最小值。如果不存在，則傳回 `null` 值。

例如：

```kotlin
fun main() {
//sampleStart
    // 一週內記錄的溫度
    val temperatures = listOf(15, 18, 21, 21, 19, 17, 16)
  
    // 尋找本週最高溫
    val maxTemperature = temperatures.maxOrNull()
    println("Highest temperature recorded: ${maxTemperature ?: "No data"}")
    // Highest temperature recorded: 21

    // 尋找本週最低溫
    val minTemperature = temperatures.minOrNull()
    println("Lowest temperature recorded: ${minTemperature ?: "No data"}")
    // Lowest temperature recorded: 15
//sampleEnd
}
```
{kotlin-runnable="true" id="kotlin-tour-null-safety-collections"}

此範例使用 Elvis 運算子 `?:` 在函式傳回 `null` 值時傳回列印陳述。

> `maxOrNull()` 和 `minOrNull()` 函式旨在與 **不包含** `null` 值的集合配合使用。否則，您將無法判斷函式是因為找不到所需的值還是因為找到了 `null` 值而傳回。
>
{style="note"}

您可以將 [`singleOrNull()`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.collections/single-or-null.html) 函式與 Lambda 運算式結合使用，以尋找符合條件的單個項目。如果不存在該項目或有多個符合條件的項目，函式將傳回 `null` 值：

```kotlin
fun main() {
//sampleStart
    // 一週內記錄的溫度
    val temperatures = listOf(15, 18, 21, 21, 19, 17, 16)

    // 檢查是否恰好有一天是 30 度
    val singleHotDay = temperatures.singleOrNull{ it == 30 }
    println("Single hot day with 30 degrees: ${singleHotDay ?: "None"}")
    // Single hot day with 30 degrees: None
//sampleEnd
}
```
{kotlin-runnable="true" id="kotlin-tour-null-safety-singleornull"}

> `singleOrNull()` 函式旨在與 **不包含** `null` 值的集合配合使用。
>
{style="note"}

某些函式使用 Lambda 運算式來轉換集合，如果無法實現其目的，則會傳回 `null` 值。

若要使用 Lambda 運算式轉換集合並傳回第一個非 `null` 的值，請使用 [`firstNotNullOfOrNull()`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.collections/first-not-null-of-or-null.html) 函式。如果不存在這樣的值，函式會傳回 `null` 值：

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

若要使用 Lambda 運算式依序處理每個集合項目並建立累加值（或在集合為空時傳回 `null` 值），請使用 [`reduceOrNull()`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.collections/reduce-or-null.html) 函式：

```kotlin
fun main() {
//sampleStart
    // 購物車中的商品價格
    val itemPrices = listOf(20, 35, 15, 40, 10)

    // 使用 reduceOrNull() 函式計算總價
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

此範例同樣使用 Elvis 運算子 `?:` 在函式傳回 `null` 值時傳回列印陳述。

> `reduceOrNull()` 函式旨在與 **不包含** `null` 值的集合配合使用。
>
{style="note"}

探索 Kotlin 的 [標準函式庫 (standard library)](https://kotlinlang.org/api/core/kotlin-stdlib/) 以尋找更多可用於提高程式碼安全性的函式。

## 提前傳回與 Elvis 運算子

在初學者導覽中，您學習了如何使用 [提前傳回](kotlin-tour-functions.md#early-returns-in-functions) 來停止函式在某個點之後繼續執行。您可以將 Elvis 運算子 `?:` 與提前傳回結合使用，以檢查函式中的先決條件。這種方法是保持程式碼簡潔的好方法，因為您不需要使用巢狀檢查。降低程式碼的複雜度也使其更容易維護。例如：

```kotlin
data class User(
    val id: Int,
    val name: String,
    // 好友使用者 ID 列表
    val friends: List<Int>
)

// 取得使用者好友數量的函式
fun getNumberOfFriends(users: Map<Int, User>, userId: Int): Int {
    // 檢索使用者，若找不到則傳回 -1
    val user = users[userId] ?: return -1
    // 傳回好友數量
    return user.friends.size
}

fun main() {
    // 建立一些範例使用者
    val user1 = User(1, "Alice", listOf(2, 3))
    val user2 = User(2, "Bob", listOf(1))
    val user3 = User(3, "Charlie", listOf(1))

    // 建立使用者 Map
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

在此範例中：

* 有一個 `User` 資料類別，具有使用者 `id`、`name` 和好友列表的屬性。
* `getNumberOfFriends()` 函式：
  * 接收一個 `User` 執行個體的 Map 和一個整數形式的使用者 ID。
  * 使用提供的使用者 ID 存取 `User` 執行個體 Map 的值。
  * 使用 Elvis 運算子，如果 Map 的值為 `null`，則提前傳回值 `-1`。
  * 將從 Map 中找到的值指派給 `user` 變數。
  * 使用 `size` 屬性傳回該使用者好友列表中的好友數量。
* `main()` 函式：
  * 建立三個 `User` 執行個體。 
  * 建立這些 `User` 執行個體的 Map 並將其指派給 `users` 變數。 
  * 在 `users` 變數上呼叫 `getNumberOfFriends()` 函式，傳入 `1` 和 `2` 分別傳回 `"Alice"` 的兩個好友和 `"Bob"` 的一個好友。
  * 在 `users` 變數上呼叫 `getNumberOfFriends()` 函式，傳入 `4`，這會觸發提前傳回並傳回值 `-1`。

您可能會注意到，不使用提前傳回的話程式碼可以更簡潔。然而，這種方法需要多次安全呼叫，因為 `users[userId]` 可能會傳回 `null` 值，這會使程式碼稍微難以閱讀：

```kotlin
fun getNumberOfFriends(users: Map<Int, User>, userId: Int): Int {
    // 檢索使用者，若找不到則傳回 -1
    return users[userId]?.friends?.size ?: -1
}
```
{validate="false"}

雖然此範例僅使用 Elvis 運算子檢查了一個條件，但您可以添加多個檢查來覆蓋任何關鍵的錯誤路徑。帶有 Elvis 運算子的提前傳回可防止您的程式執行不必要的運算，並透過在偵測到 `null` 值或無效情況時立即停止來提高程式碼的安全性。

有關如何在程式碼中使用 `return` 的更多資訊，請參閱 [傳回與跳轉 (Returns and jumps)](returns.md)。

## 練習 {completion-point="true"}

### 練習 1 {initial-collapse-state="collapsed" collapsible="true" id="null-safety-exercise-1"}

您正在為一個應用程式開發通知系統，使用者可以在其中啟用或停用不同類型的通知。完成 `getNotificationPreferences()` 函式，以便：

1. `validUser` 變數使用 `as?` 運算子檢查 `user` 是否為 `User` 類別的執行個體。如果不是，則傳回一個空列表。
2. `userName` 變數使用 Elvis `?:` 運算子確保在使用者名稱為 `null` 時預設為 `"Guest"`。
3. 最終的傳回陳述式使用 `.takeIf()` 函式，僅在啟用電子郵件和 SMS 通知偏好設定時才包含它們。
4. `main()` 函式成功執行並列印預期的輸出。

> [`takeIf()` 函式](scope-functions.md#takeif-and-takeunless) 在給定條件為 true 時傳回原始值，否則傳回 `null`。例如：
>
> ```kotlin
> fun main() {
>     // 使用者已登入
>     val userIsLoggedIn = true
>     // 使用者具有活動工作階段
>     val hasSession = true
> 
>     // 如果使用者已登入且具有活動工作階段，則授予儀表板存取權限
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

fun getNotificationPreferences(user: Any, emailEnabled: Boolean, smsEnabled: Boolean): List<String> {
    val validUser = // 在此處編寫您的程式碼
    val userName = // 在此處編寫您的程式碼

    return listOfNotNull( /* 在此處編寫您的程式碼 */)
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
{initial-collapse-state="collapsed" collapsible="true" collapsed-title="範例解答" id="kotlin-tour-null-safety-solution-1"}

### 練習 2 {initial-collapse-state="collapsed" collapsible="true" id="null-safety-exercise-2"}

您正在開發一個訂閱制的串流服務，使用者可以擁有多個訂閱，但 **一次只能有一個是啟用狀態**。完成 `getActiveSubscription()` 函式，使其使用帶有述句 (predicate) 的 `singleOrNull()` 函式，如果有多個啟用的訂閱，則傳回 `null` 值：

|--|--|

```kotlin
data class Subscription(val name: String, val isActive: Boolean)

fun getActiveSubscription(subscriptions: List<Subscription>): Subscription? // 在此處編寫您的程式碼

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
{initial-collapse-state="collapsed" collapsible="true" collapsed-title="範例解答 1" id="kotlin-tour-null-safety-solution-2-1"}

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
{initial-collapse-state="collapsed" collapsible="true" collapsed-title="範例解答 2" id="kotlin-tour-null-safety-solution-2-2"}

### 練習 3 {initial-collapse-state="collapsed" collapsible="true" id="null-safety-exercise-3"}

您正在開發一個社群媒體平台，其中使用者具有使用者名稱與帳號狀態。您想要查看目前啟用的使用者名稱列表。完成 `getActiveUsernames()` 函式，使 [`mapNotNull()` 函式](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.collections/map-not-null.html) 具有一個述句，如果該使用者是啟用的則傳回其使用者名稱，否則傳回 `null` 值：

|--|--|

```kotlin
data class User(val username: String, val isActive: Boolean)

fun getActiveUsernames(users: List<User>): List<String> {
    return users.mapNotNull { /* 在此處編寫您的程式碼 */ }
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

> 就像在練習 1 中一樣，您可以在檢查使用者是否啟用時使用 [`takeIf()` 函式](scope-functions.md#takeif-and-takeunless)。
>
{ style = "tip" }

|--|--|

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
{initial-collapse-state="collapsed" collapsible="true" collapsed-title="範例解答 1" id="kotlin-tour-null-safety-solution-3-1"}

|--|--|

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
{initial-collapse-state="collapsed" collapsible="true" collapsed-title="範例解答 2" id="kotlin-tour-null-safety-solution-3-2"}

### 練習 4 {initial-collapse-state="collapsed" collapsible="true" id="null-safety-exercise-4"}

您正在為電子商務平台開發庫存管理系統。在處理銷售之前，您需要根據可用庫存檢查產品的請求數量是否有效。

完成 `validateStock()` 函式，使其使用提前傳回和 Elvis 運算子（在適用處）來檢查是否：

* `requested` 變數為 `null`。
* `available` 變數為 `null`。
* `requested` 變數為負值。
* `requested` 變數中的數量高於 `available` 變數中的數量。

在上述所有情況下，函式必須提前傳回值 `-1`。

|--|--|

```kotlin
fun validateStock(requested: Int?, available: Int?): Int {
    // 在此處編寫您的程式碼
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
{initial-collapse-state="collapsed" collapsible="true" collapsed-title="範例解答" id="kotlin-tour-null-safety-solution-4"}

<seealso></seealso>

<list columns="2" id="tour-nav">
  <li>
    <a as="button" href="kotlin-tour-intermediate-properties.md" mode="outline" icon="arrow-left" icon-position="left">上一步</a>
  </li>
  <li>
    <a as="button" href="kotlin-tour-intermediate-libraries-and-apis.md" mode="classic" icon="arrow-right" icon-position="right">下一步</a>
  </li>
</list>