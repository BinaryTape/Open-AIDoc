[//]: # (title: 널 안전성(Null safety))

<no-index/>

초급 둘러보기에서는 코드에서 `null` 값을 다루는 방법을 배웠습니다. 이 챕터에서는 널 안전성(Null safety) 기능의 일반적인 사용 사례와 이를 최대한 활용하는 방법을 다룹니다.

## 스마트 캐스트와 안전한 캐스트 {id="smart-casts-and-safe-casts"}

Kotlin은 명시적인 선언 없이도 타입을 추론할 수 있는 경우가 있습니다. Kotlin에게 변수나 객체를 특정 타입에 속하는 것처럼 처리하도록 지시하는 과정을 **캐스팅(casting)**이라고 합니다. 타입이 추론되는 경우처럼 자동으로 캐스팅되는 것을 **스마트 캐스팅(smart casting)**이라고 부릅니다.

### is 및 !is 연산자 {id="is-and-is-operators"}

캐스팅이 어떻게 작동하는지 살펴보기 전에, 객체가 특정 타입을 가졌는지 확인하는 방법을 알아보겠습니다. 이를 위해 `when` 또는 `if` 조건식과 함께 `is` 및 `!is` 연산자를 사용할 수 있습니다.

* `is`는 객체가 해당 타입인지 확인하고 불리언(boolean) 값을 반환합니다.
* `!is`는 객체가 해당 타입이 **아닌지** 확인하고 불리언 값을 반환합니다.

예를 들면 다음과 같습니다.

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
  
    // The type is Int
    printObjectType(myInt)
    // It's an Integer with value 42

    // The type is List, so it's NOT a Double.
    printObjectType(myList)
    // It's NOT a Double

    // The type is Double, so the else branch is triggered.
    printObjectType(myDouble)
    // Unknown type
}
```
{kotlin-runnable="true" id="kotlin-tour-null-safety-casts"}

> `when` 조건식과 `is` 및 `!is` 연산자를 사용하는 예시는 이미 [열린 클래스와 기타 특수 클래스](kotlin-tour-intermediate-open-special-classes.md#sealed-classes) 챕터에서 확인했습니다.
> 
{style="tip"}

### as 및 as? 연산자 {id="as-and-as-operators"}

객체를 다른 타입으로 명시적으로 _캐스팅_하려면 `as` 연산자를 사용합니다. 여기에는 널 가능(nullable) 타입에서 널 불가(non-nullable) 대응 타입으로의 캐스팅도 포함됩니다. 캐스팅이 불가능한 경우, 프로그램은 **런타임에** 비정상 종료(crash)됩니다. 이러한 이유로 `as`를 **안전하지 않은(unsafe)** 캐스트 연산자라고 부릅니다.

```kotlin
fun main() {
//sampleStart
    val a: String? = null
    val b = a as String

    // Triggers an error at runtime
    print(b)
//sampleEnd
}
```
{kotlin-runnable="true" validate="false" id="kotlin-tour-null-safety-as-operator"}

객체를 널 불가 타입으로 명시적으로 캐스팅하되 실패 시 오류를 발생시키는 대신 `null`을 반환하게 하려면 `as?` 연산자를 사용합니다. `as?` 연산자는 실패 시 오류를 유발하지 않으므로 **안전한(safe)** 연산자라고 부릅니다.

```kotlin
fun main() {
//sampleStart
    val a: String? = null
    val b = a as? String

    // Returns null value
    print(b)
    // null
//sampleEnd
}
```
{kotlin-runnable="true" id="kotlin-tour-null-safety-safe-operator"}

`as?` 연산자를 엘비스 연산자 `?:`와 결합하면 여러 줄의 코드를 한 줄로 줄일 수 있습니다. 예를 들어, 다음 `calculateTotalStringLength()` 함수는 여러 타입이 섞인 리스트에서 모든 문자열의 총 길이를 계산합니다.

```kotlin
fun calculateTotalStringLength(items: List<Any>): Int {
    var totalLength = 0

    for (item in items) {
        totalLength += if (item is String) {
            item.length
        } else {
            0  // Add 0 for non-String items
        }
    }

    return totalLength
}
```

이 예제는 다음과 같이 동작합니다.

* `totalLength` 변수를 카운터로 사용합니다.
* 리스트의 모든 항목을 순회하기 위해 `for` 루프를 사용합니다.
* `if`와 `is` 연산자를 사용하여 현재 항목이 문자열인지 확인합니다.
  * 문자열인 경우, 해당 문자열의 길이를 카운터에 더합니다.
  * 문자열이 아닌 경우, 카운터를 증가시키지 않습니다.
* `totalLength` 변수의 최종값을 반환합니다.

이 코드는 다음과 같이 줄일 수 있습니다.

```kotlin
fun calculateTotalStringLength(items: List<Any>): Int {
    return items.sumOf { (it as? String)?.length ?: 0 }
}
```

이 예제에서는 [`.sumOf()`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.collections/sum-of.html) 확장 함수를 사용하고 다음을 수행하는 람다 표현식을 제공합니다.

* 리스트의 각 항목에 대해 `as?`를 사용하여 `String`으로 안전한 캐스팅을 수행합니다.
* 호출 결과가 `null` 값이 아닌 경우 안전한 호출(safe call) `?.`을 사용하여 `length` 프로퍼티에 접근합니다.
* 안전한 호출이 `null` 값을 반환하는 경우 엘비스 연산자 `?:`를 사용하여 `0`을 반환합니다.

## 널 값과 컬렉션 {id="null-values-and-collections"}

Kotlin에서 컬렉션을 다룰 때는 종종 `null` 값을 처리하고 불필요한 요소를 필터링해야 합니다. Kotlin에는 리스트, 세트, 맵 및 기타 유형의 컬렉션을 다룰 때 깔끔하고 효율적이며 널 안전한 코드를 작성할 수 있도록 도와주는 유용한 함수들이 있습니다.

리스트에서 `null` 값을 필터링하려면 [`filterNotNull()`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.collections/filter-not-null.html) 함수를 사용합니다.

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

리스트를 생성할 때 직접 `null` 값 필터링을 수행하려면 [`listOfNotNull()`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.collections/list-of-not-null.html) 함수를 사용합니다.

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

이 두 예제 모두 모든 항목이 `null` 값인 경우 빈 리스트가 반환됩니다.

Kotlin은 컬렉션에서 값을 찾는 데 사용할 수 있는 함수도 제공합니다. 값을 찾지 못하면 오류를 발생시키는 대신 `null` 값을 반환합니다.

* [`maxOrNull()`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.collections/max-or-null.html)은 가장 큰 값을 찾습니다. 값이 존재하지 않으면 `null` 값을 반환합니다.
* [`minOrNull()`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.collections/min-or-null.html)은 가장 작은 값을 찾습니다. 값이 존재하지 않으면 `null` 값을 반환합니다.

예를 들면 다음과 같습니다.

```kotlin
fun main() {
//sampleStart
    // Temperatures recorded over a week
    val temperatures = listOf(15, 18, 21, 21, 19, 17, 16)
  
    // Find the highest temperature of the week
    val maxTemperature = temperatures.maxOrNull()
    println("Highest temperature recorded: ${maxTemperature ?: "No data"}")
    // Highest temperature recorded: 21

    // Find the lowest temperature of the week
    val minTemperature = temperatures.minOrNull()
    println("Lowest temperature recorded: ${minTemperature ?: "No data"}")
    // Lowest temperature recorded: 15
//sampleEnd
}
```
{kotlin-runnable="true" id="kotlin-tour-null-safety-collections"}

이 예제에서는 엘비스 연산자 `?:`를 사용하여 함수가 `null` 값을 반환할 때 대체 출력문을 반환하도록 합니다.

> `maxOrNull()` 및 `minOrNull()` 함수는 `null` 값을 포함하지 **않는** 컬렉션과 함께 사용하도록 설계되었습니다. 그렇지 않으면 함수가 원하는 값을 찾지 못한 것인지, 아니면 `null` 값을 찾은 것인지 구별할 수 없습니다.
>
{style="note"}

조건과 일치하는 단일 항목을 찾기 위해 람다 표현식과 함께 [`singleOrNull()`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.collections/single-or-null.html) 함수를 사용할 수 있습니다. 일치하는 항목이 존재하지 않거나 여러 개가 있는 경우, 이 함수는 `null` 값을 반환합니다.

```kotlin
fun main() {
//sampleStart
    // Temperatures recorded over a week
    val temperatures = listOf(15, 18, 21, 21, 19, 17, 16)

    // Check if there was exactly one day with 30 degrees
    val singleHotDay = temperatures.singleOrNull{ it == 30 }
    println("Single hot day with 30 degrees: ${singleHotDay ?: "None"}")
    // Single hot day with 30 degrees: None
//sampleEnd
}
```
{kotlin-runnable="true" id="kotlin-tour-null-safety-singleornull"}

> `singleOrNull()` 함수는 `null` 값을 포함하지 **않는** 컬렉션과 함께 사용하도록 설계되었습니다.
>
{style="note"}

일부 함수는 람다 표현식을 사용하여 컬렉션을 변환하며, 의도한 결과를 낼 수 없는 경우 `null` 값을 반환합니다.

람다 표현식으로 컬렉션을 변환하고 `null`이 아닌 첫 번째 값을 반환하려면 [`firstNotNullOfOrNull()`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.collections/first-not-null-of-or-null.html) 함수를 사용합니다. 그러한 값이 존재하지 않으면 이 함수는 `null` 값을 반환합니다.

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

람다 표현식을 사용하여 컬렉션의 각 항목을 순차적으로 처리하고 누적된 값을 생성하거나(컬렉션이 비어 있는 경우 `null` 값 반환) 하려면 [`reduceOrNull()`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.collections/reduce-or-null.html) 함수를 사용합니다.

```kotlin
fun main() {
//sampleStart
    // Prices of items in a shopping cart
    val itemPrices = listOf(20, 35, 15, 40, 10)

    // Calculate the total price using the reduceOrNull() function
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

이 예제 역시 엘비스 연산자 `?:`를 사용하여 함수가 `null` 값을 반환할 때 대체 출력문을 반환하도록 합니다.

> `reduceOrNull()` 함수는 `null` 값을 포함하지 **않는** 컬렉션과 함께 사용하도록 설계되었습니다.
>
{style="note"}

코드를 더 안전하게 만드는 데 사용할 수 있는 더 많은 함수를 찾으려면 Kotlin의 [표준 라이브러리](https://kotlinlang.org/api/core/kotlin-stdlib/)를 살펴보세요.

## 조기 반환(Early return)과 엘비스 연산자 {id="early-returns-and-the-elvis-operator"}

초급 둘러보기에서는 함수가 특정 지점을 지나 더 이상 처리되지 않도록 중단하는 [조기 반환(early return)](kotlin-tour-functions.md#early-returns-in-functions) 사용법을 배웠습니다. 함수의 전제 조건을 확인하기 위해 엘비스 연산자 `?:`와 함께 조기 반환을 사용할 수 있습니다. 이 접근 방식은 중첩된 검사를 사용할 필요가 없으므로 코드를 간결하게 유지하는 좋은 방법입니다. 코드의 복잡성이 줄어들면 유지보수도 더 쉬워집니다. 예를 들면 다음과 같습니다.

```kotlin
data class User(
    val id: Int,
    val name: String,
    // List of friend user IDs
    val friends: List<Int>
)

// Function to get the number of friends for a user
fun getNumberOfFriends(users: Map<Int, User>, userId: Int): Int {
    // Retrieves the user or return -1 if not found
    val user = users[userId] ?: return -1
    // Returns the number of friends
    return user.friends.size
}

fun main() {
    // Creates some sample users
    val user1 = User(1, "Alice", listOf(2, 3))
    val user2 = User(2, "Bob", listOf(1))
    val user3 = User(3, "Charlie", listOf(1))

    // Creates a map of users
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

이 예제에서는:

* 사용자의 `id`, `name`, 그리고 친구 목록 프로퍼티를 가진 `User` 데이터 클래스가 있습니다.
* `getNumberOfFriends()` 함수는:
  * `User` 인스턴스들의 맵과 정수형 사용자 ID를 인자로 받습니다.
  * 전달받은 사용자 ID로 `User` 인스턴스 맵의 값에 접근합니다.
  * 맵의 값이 `null` 값인 경우 엘비스 연산자를 사용하여 `-1` 값으로 함수를 조기 반환합니다.
  * 맵에서 찾은 값을 `user` 변수에 할당합니다.
  * `size` 프로퍼티를 사용하여 사용자의 친구 목록에 있는 친구 수를 반환합니다.
* `main()` 함수는:
  * 세 개의 `User` 인스턴스를 생성합니다.
  * 이러한 `User` 인스턴스들의 맵을 생성하여 `users` 변수에 할당합니다.
  * `users` 변수와 값 `1` 및 `2`를 넘겨 `getNumberOfFriends()` 함수를 호출하여 `"Alice"`에 대해서는 2명의 친구를, `"Bob"`에 대해서는 1명의 친구를 반환받습니다.
  * `users` 변수와 값 `4`를 넘겨 `getNumberOfFriends()` 함수를 호출하며, 이는 `-1` 값을 반환하는 조기 반환을 트리거합니다.

조기 반환이 없어도 코드가 더 간결해질 수 있다는 점을 눈치챘을 수도 있습니다. 하지만 이 방식은 `users[userId]`가 `null` 값을 반환할 수 있으므로 여러 번의 안전한 호출이 필요하여 코드를 읽기가 약간 더 어려워집니다.

```kotlin
fun getNumberOfFriends(users: Map<Int, User>, userId: Int): Int {
    // Retrieve the user or return -1 if not found
    return users[userId]?.friends?.size ?: -1
}
```
{validate="false"}

이 예제에서는 엘비스 연산자로 하나의 조건만 확인하지만, 중요한 오류 경로를 처리하기 위해 여러 검사를 추가할 수도 있습니다. 엘비스 연산자를 사용한 조기 반환은 불필요한 작업을 방지하고, `null` 값이나 유효하지 않은 케이스가 감지되는 즉시 중단하므로 코드를 더욱 안전하게 만듭니다.

코드에서 `return`을 사용하는 방법에 대한 자세한 내용은 [반환과 점프](returns.md)를 참조하세요.

## 실습 {completion-point="true" id="practice"}

<deflist appearance="clear" collapsible="true" numbered="true">
<def title="안전한 캐스트와 엘비스 연산자를 사용한 사용자 데이터 유효성 검사" id="null-safety-exercise-1">

사용자가 다양한 유형의 알림을 활성화하거나 비활성화할 수 있는 앱의 알림 시스템을 개발하고 있습니다.
다음을 만족하도록 `getNotificationPreferences()` 함수를 완성하세요.

1. `validUser` 변수는 `as?` 연산자를 사용하여 `user`가 `User` 클래스의 인스턴스인지 확인합니다. 인스턴스가 아니라면 빈 리스트를 반환합니다.
2. `userName` 변수는 엘비스 `?:` 연산자를 사용하여 사용자 이름이 `null`인 경우 기본값으로 `"Guest"`를 지정하도록 합니다.
3. 최종 반환문은 `.takeIf()` 함수를 사용하여 활성화된 경우에만 이메일 및 SMS 알림 설정을 포함합니다.
4. `main()` 함수가 성공적으로 실행되고 예상된 출력을 출력합니다.

> [`takeIf()` 함수](scope-functions.md#takeif-and-takeunless)는 주어진 조건이 참이면 원래 값을 반환하고,
> 그렇지 않으면 `null`을 반환합니다. 예를 들면 다음과 같습니다.
>
> ```kotlin
> fun main() {
>     // The user is logged in
>     val userIsLoggedIn = true
>     // The user has an active session
>     val hasSession = true
> 
>     // Gives access to the dashboard if the user is logged in
>     // and has an active session
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
    val validUser = // Write your code here
    val userName = // Write your code here

    return listOfNotNull( /* Write your code here */)
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
{kotlin-runnable="true" kotlin-target-platform="exercise" kotlin-hidden-files="ExerciseUtils.kt,tour/intermediate/GetNotificationPreferencesTest.kt" validate="false" id="kotlin-tour-null-safety-exercise-1"}

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
{kotlin-runnable="true" kotlin-target-platform="exercise" kotlin-hidden-files="ExerciseUtils.kt,tour/intermediate/GetNotificationPreferencesTest.kt" initial-collapse-state="collapsed" collapsible="true" collapsed-title="Example solution" id="kotlin-tour-null-safety-solution-1"}

</def>
<def title="singleOrNull()을 사용하여 단일 활성 구독 찾기" id="null-safety-exercise-2">

사용자가 여러 구독을 가질 수 있지만 **한 번에 하나만 활성화될 수 있는** 구독 기반 스트리밍 서비스에서 작업하고 있습니다. 활성 구독이 둘 이상인 경우 `null` 값을 반환하도록 술어(predicate)와 함께 `singleOrNull()` 함수를 사용하도록 `getActiveSubscription()` 함수를 완성하세요.

```kotlin
data class Subscription(val name: String, val isActive: Boolean)

fun getActiveSubscription(subscriptions: List<Subscription>): Subscription? = TODO("Replace the TODO() function")

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
{kotlin-runnable="true" kotlin-target-platform="exercise" kotlin-hidden-files="ExerciseUtils.kt,tour/intermediate/GetActiveSubscriptionTest.kt" validate="false" id="kotlin-tour-null-safety-exercise-2"}

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
{kotlin-runnable="true" kotlin-target-platform="exercise" kotlin-hidden-files="ExerciseUtils.kt,tour/intermediate/GetActiveSubscriptionTest.kt" initial-collapse-state="collapsed" collapsible="true" collapsed-title="Example solution 1" id="kotlin-tour-null-safety-solution-2-1"}

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
{kotlin-runnable="true" kotlin-target-platform="exercise" kotlin-hidden-files="ExerciseUtils.kt,tour/intermediate/GetActiveSubscriptionTest.kt" initial-collapse-state="collapsed" collapsible="true" collapsed-title="Example solution 2" id="kotlin-tour-null-safety-solution-2-2"}

</def>
<def title="mapNotNull()을 사용하여 활성 사용자 이름 필터링하기" id="null-safety-exercise-3">

사용자 이름과 계정 상태가 있는 소셜 미디어 플랫폼에서 작업하고 있습니다. 현재 활성화된 사용자 이름 목록을 보려고 합니다. [`mapNotNull()` 함수](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.collections/map-not-null.html)가 사용자가 활성 상태이면 사용자 이름을 반환하고, 그렇지 않으면 `null` 값을 반환하는 술어를 갖도록 `getActiveUsernames()` 함수를 완성하세요.

```kotlin
data class User(val username: String, val isActive: Boolean)

fun getActiveUsernames(users: List<User>): List<String> {
    return users.mapNotNull { /* Write your code here */ }
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
{kotlin-runnable="true" kotlin-target-platform="exercise" kotlin-hidden-files="ExerciseUtils.kt,tour/intermediate/GetActiveUsernamesTest.kt" validate="false" id="kotlin-tour-null-safety-exercise-3"}

> 연습 문제 1에서와 마찬가지로, 사용자가 활성 상태인지 확인할 때 [`takeIf()` 함수](scope-functions.md#takeif-and-takeunless)를 사용할 수 있습니다.
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
{kotlin-runnable="true" kotlin-target-platform="exercise" kotlin-hidden-files="ExerciseUtils.kt,tour/intermediate/GetActiveUsernamesTest.kt" initial-collapse-state="collapsed" collapsible="true" collapsed-title="Example solution 1" id="kotlin-tour-null-safety-solution-3-1"}

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
{kotlin-runnable="true" kotlin-target-platform="exercise" kotlin-hidden-files="ExerciseUtils.kt,tour/intermediate/GetActiveUsernamesTest.kt" initial-collapse-state="collapsed" collapsible="true" collapsed-title="Example solution 2" id="kotlin-tour-null-safety-solution-3-2"}

</def>
<def title="조기 반환과 엘비스 연산자를 사용한 재고 유효성 검사" id="null-safety-exercise-4">

전자상거래 플랫폼의 재고 관리 시스템에서 작업하고 있습니다. 판매를 처리하기 전에 사용 가능한 재고를 기준으로 제품의 요청 수량이 유효한지 확인해야 합니다.

조기 반환과 엘비스 연산자(해당하는 경우)를 사용하여 다음을 확인하도록 `validateStock()` 함수를 완성하세요.

* `requested` 변수가 `null`인 경우.
* `available` 변수가 `null`인 경우.
* `requested` 변수가 음수 값인 경우.
* `requested` 변수의 수량이 `available` 변수의 수량보다 많은 경우.

위의 모든 경우에 함수는 `-1` 값으로 조기 반환해야 합니다.

```kotlin
fun validateStock(requested: Int?, available: Int?): Int {
    // Write your code here
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
{kotlin-runnable="true" kotlin-target-platform="exercise" kotlin-hidden-files="ExerciseUtils.kt,tour/intermediate/ValidateStockTest.kt" validate="false" id="kotlin-tour-null-safety-exercise-4"}

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
{kotlin-runnable="true" kotlin-target-platform="exercise" kotlin-hidden-files="ExerciseUtils.kt,tour/intermediate/ValidateStockTest.kt" initial-collapse-state="collapsed" collapsible="true" collapsed-title="Example solution" id="kotlin-tour-null-safety-solution-4"}

</def>
</deflist>

<seealso></seealso>

<list columns="2" id="tour-nav">
  <li>
    <a as="button" href="kotlin-tour-intermediate-properties.md" mode="outline" icon="arrow-left" icon-position="left">Previous step</a>
  </li>
  <li>
    <a as="button" href="kotlin-tour-intermediate-libraries-and-apis.md" mode="classic" icon="arrow-right" icon-position="right">Next step</a>
  </li>
</list>