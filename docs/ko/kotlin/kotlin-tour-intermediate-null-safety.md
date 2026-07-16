[//]: # (title: 중급: 널 안전성)

<no-index/>

<tldr>
    <p><img src="icon-1-done.svg" width="20" alt="첫 번째 단계" /> <a href="kotlin-tour-intermediate-extension-functions.md">확장 함수</a><br />
        <img src="icon-2-done.svg" width="20" alt="두 번째 단계" /> <a href="kotlin-tour-intermediate-scope-functions.md">범위 함수</a><br />
        <img src="icon-3-done.svg" width="20" alt="세 번째 단계" /> <a href="kotlin-tour-intermediate-lambdas-receiver.md">수신 객체가 있는 람다 식</a><br />
        <img src="icon-4-done.svg" width="20" alt="네 번째 단계" /> <a href="kotlin-tour-intermediate-classes-interfaces.md">클래스 및 인터페이스</a><br />
        <img src="icon-5-done.svg" width="20" alt="다섯 번째 단계" /> <a href="kotlin-tour-intermediate-objects.md">객체</a><br />
        <img src="icon-6-done.svg" width="20" alt="여섯 번째 단계" /> <a href="kotlin-tour-intermediate-open-special-classes.md">Open 클래스 및 특수 클래스</a><br />
        <img src="icon-7-done.svg" width="20" alt="일곱 번째 단계" /> <a href="kotlin-tour-intermediate-properties.md">프로퍼티</a><br />
        <img src="icon-8.svg" width="20" alt="여덟 번째 단계" /> <strong>널 안전성</strong><br />
        <img src="icon-9-todo.svg" width="20" alt="아홉 번째 단계" /> <a href="kotlin-tour-intermediate-libraries-and-apis.md">라이브러리 및 API</a></p>
</tldr>

초보자 과정에서 코드의 `null` 값을 처리하는 방법을 배웠습니다. 이 장에서는 널 안전성(null safety) 기능의 일반적인 사용 사례와 이를 최대한 활용하는 방법을 다룹니다.

## 스마트 캐스트와 안전한 캐스트

코틀린은 때때로 명시적인 선언 없이도 타입을 추론할 수 있습니다. 변수나 객체를 특정 타입에 속하는 것처럼 취급하도록 코틀린에 지시하는 과정을 **캐스팅(casting)**이라고 합니다. 타입이 추론될 때와 같이 자동으로 캐스팅되는 경우를 **스마트 캐스트(smart casting)**라고 부릅니다.

### is 및 !is 연산자

캐스팅이 어떻게 작동하는지 살펴보기 전에, 객체가 특정 타입을 가졌는지 확인하는 방법을 알아보겠습니다. 이를 위해 `when` 또는 `if` 조건식과 함께 `is` 및 `!is` 연산자를 사용할 수 있습니다:

* `is`는 객체가 해당 타입인지 확인하고 불리언(boolean) 값을 반환합니다.
* `!is`는 객체가 해당 타입이 **아닌지** 확인하고 불리언 값을 반환합니다.

예시:

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
  
    // 타입이 Int임
    printObjectType(myInt)
    // It's an Integer with value 42

    // 타입이 List이므로 Double이 아님.
    printObjectType(myList)
    // It's NOT a Double

    // 타입이 Double이므로 else 분기가 실행됨.
    printObjectType(myDouble)
    // Unknown type
}
```
{kotlin-runnable="true" id="kotlin-tour-null-safety-casts"}

> `is` 및 `!is` 연산자와 함께 `when` 조건식을 사용하는 방법의 예시는 [Open 클래스 및 기타 특수 클래스](kotlin-tour-intermediate-open-special-classes.md#sealed-classes) 장에서 이미 살펴보았습니다.
> 
{style="tip"}

### as 및 as? 연산자

객체를 다른 타입으로 명시적으로 *캐스트*하려면 `as` 연산자를 사용합니다. 여기에는 널 허용(nullable) 타입에서 그에 대응하는 널 불허용(non-nullable) 타입으로의 캐스팅도 포함됩니다. 캐스팅이 불가능할 경우 프로그램은 **런타임 시점**에 충돌(crash)합니다. 이러한 이유로 이를 **안전하지 않은(unsafe)** 캐스트 연산자라고 부릅니다.

```kotlin
fun main() {
//sampleStart
    val a: String? = null
    val b = a as String

    // 런타임에 에러 발생
    print(b)
//sampleEnd
}
```
{kotlin-runnable="true" validate="false" id="kotlin-tour-null-safety-as-operator"}

객체를 널 불허용 타입으로 명시적으로 캐스트하되, 실패 시 에러를 던지는 대신 `null`을 반환하려면 `as?` 연산자를 사용하세요. `as?` 연산자는 실패 시 에러를 유발하지 않으므로 **안전한(safe)** 캐스트 연산자라고 부릅니다.

```kotlin
fun main() {
//sampleStart
    val a: String? = null
    val b = a as? String

    // null 값을 반환함
    print(b)
    // null
//sampleEnd
}
```
{kotlin-runnable="true" id="kotlin-tour-null-safety-safe-operator"}

`as?` 연산자를 엘비스 연산자 `?:`와 결합하면 여러 줄의 코드를 한 줄로 줄일 수 있습니다. 예를 들어, 다음 `calculateTotalStringLength()` 함수는 혼합된 리스트에 제공된 모든 문자열의 총 길이를 계산합니다:

```kotlin
fun calculateTotalStringLength(items: List<Any>): Int {
    var totalLength = 0

    for (item in items) {
        totalLength += if (item is String) {
            item.length
        } else {
            0  // 문자열이 아닌 항목에는 0을 더함
        }
    }

    return totalLength
}
```

이 예시는 다음을 수행합니다:

* `totalLength` 변수를 카운터로 사용합니다.
* `for` 루프를 사용하여 리스트의 모든 항목을 순회합니다.
* `if`와 `is` 연산자를 사용하여 현재 항목이 문자열인지 확인합니다:
  * 문자열인 경우, 해당 문자열의 길이를 카운터에 더합니다.
  * 문자열이 아닌 경우, 카운터를 증가시키지 않습니다.
* `totalLength` 변수의 최종 값을 반환합니다.

이 코드는 다음과 같이 줄일 수 있습니다:

```kotlin
fun calculateTotalStringLength(items: List<Any>): Int {
    return items.sumOf { (it as? String)?.length ?: 0 }
}
```

이 예시는 [`.sumOf()`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.collections/sum-of.html) 확장 함수를 사용하고 다음 작업을 수행하는 람다 식을 제공합니다:

* 리스트의 각 항목에 대해 `as?`를 사용하여 `String`으로 안전한 캐스트를 수행합니다.
* 호출 결과가 `null` 값이 아닌 경우 안전한 호출 `?.`을 사용하여 `length` 프로퍼티에 접근합니다.
* 안전한 호출이 `null` 값을 반환하는 경우 엘비스 연산자 `?:`를 사용하여 `0`을 반환합니다.

## 널 값과 컬렉션

코틀린에서 컬렉션을 다룰 때는 종종 `null` 값을 처리하고 불필요한 요소를 필터링하는 작업이 포함됩니다. 코틀린에는 리스트(list), 셋(set), 맵(map) 및 기타 타입의 컬렉션을 다룰 때 깨끗하고 효율적이며 널 안전한 코드를 작성하는 데 사용할 수 있는 유용한 함수들이 있습니다.

리스트에서 `null` 값을 필터링하려면 [`filterNotNull()`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.collections/filter-not-null.html) 함수를 사용하세요:

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

리스트를 생성할 때 직접 `null` 값을 필터링하려면 [`listOfNotNull()`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.collections/list-of-not-null.html) 함수를 사용하세요:

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

위의 두 예시 모두 모든 항목이 `null` 값인 경우 빈 리스트가 반환됩니다.

또한 코틀린은 컬렉션에서 값을 찾기 위해 사용할 수 있는 함수들을 제공합니다. 값을 찾지 못하면 에러를 유발하는 대신 `null` 값을 반환합니다:

* [`maxOrNull()`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.collections/max-or-null.html)은 가장 큰 값을 찾습니다. 존재하지 않으면 `null` 값을 반환합니다.
* [`minOrNull()`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.collections/min-or-null.html)은 가장 작은 값을 찾습니다. 존재하지 않으면 `null` 값을 반환합니다.

예시:

```kotlin
fun main() {
//sampleStart
    // 일주일간 기록된 기온
    val temperatures = listOf(15, 18, 21, 21, 19, 17, 16)
  
    // 이번 주 최고 기온 찾기
    val maxTemperature = temperatures.maxOrNull()
    println("Highest temperature recorded: ${maxTemperature ?: "No data"}")
    // Highest temperature recorded: 21

    // 이번 주 최저 기온 찾기
    val minTemperature = temperatures.minOrNull()
    println("Lowest temperature recorded: ${minTemperature ?: "No data"}")
    // Lowest temperature recorded: 15
//sampleEnd
}
```
{kotlin-runnable="true" id="kotlin-tour-null-safety-collections"}

이 예시는 함수가 `null` 값을 반환할 때 출력 문구를 반환하도록 엘비스 연산자 `?:`를 사용합니다.

> `maxOrNull()` 및 `minOrNull()` 함수는 `null` 값을 포함하지 **않는** 컬렉션과 함께 사용하도록 설계되었습니다. 그렇지 않으면 함수가 원하는 값을 찾지 못한 것인지, 아니면 `null` 값을 찾은 것인지 구분할 수 없기 때문입니다.
>
{style="note"}

조건과 일치하는 단일 항목을 찾으려면 [`singleOrNull()`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.collections/single-or-null.html) 함수를 람다 식과 함께 사용할 수 있습니다. 일치하는 항목이 없거나 일치하는 항목이 여러 개인 경우 함수는 `null` 값을 반환합니다:

```kotlin
fun main() {
//sampleStart
    // 일주일간 기록된 기온
    val temperatures = listOf(15, 18, 21, 21, 19, 17, 16)

    // 기온이 정확히 30도였던 날이 하루였는지 확인
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

일부 함수는 람다 식을 사용하여 컬렉션을 변환하고, 목적을 달성할 수 없는 경우 `null` 값을 반환합니다.

람다 식으로 컬렉션을 변환하고 `null`이 아닌 첫 번째 값을 반환하려면 [`firstNotNullOfOrNull()`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.collections/first-not-null-of-or-null.html) 함수를 사용하세요. 그러한 값이 존재하지 않으면 함수는 `null` 값을 반환합니다:

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

람다 식을 사용하여 각 컬렉션 항목을 순차적으로 처리하고 누적된 값을 생성하거나(또는 컬렉션이 비어있는 경우 `null` 값을 반환하거나) 하려면 [`reduceOrNull()`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.collections/reduce-or-null.html) 함수를 사용하세요:

```kotlin
fun main() {
//sampleStart
    // 장바구니에 담긴 항목의 가격
    val itemPrices = listOf(20, 35, 15, 40, 10)

    // reduceOrNull() 함수를 사용하여 총 가격 계산
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

이 예시 또한 함수가 `null` 값을 반환할 때 출력 문구를 반환하도록 엘비스 연산자 `?:`를 사용합니다.

> `reduceOrNull()` 함수는 `null` 값을 포함하지 **않는** 컬렉션과 함께 사용하도록 설계되었습니다.
>
{style="note"}

코드를 더 안전하게 만드는 데 사용할 수 있는 더 많은 함수들을 코틀린 [표준 라이브러리](https://kotlinlang.org/api/core/kotlin-stdlib/)에서 찾아보세요.

## 조기 반환과 엘비스 연산자

초보자 과정에서 함수가 특정 지점 이상으로 처리되지 않도록 중단하는 [조기 반환(early returns)](kotlin-tour-functions.md#early-returns-in-functions) 사용법을 배웠습니다. 함수 내에서 전제 조건을 확인하기 위해 엘비스 연산자 `?:`와 조기 반환을 함께 사용할 수 있습니다. 이 접근 방식은 중첩된 체크를 사용할 필요가 없으므로 코드를 간결하게 유지하는 좋은 방법입니다. 코드의 복잡성이 줄어들면 유지관리도 쉬워집니다. 예시:

```kotlin
data class User(
    val id: Int,
    val name: String,
    // 친구 유저 ID 목록
    val friends: List<Int>
)

// 유저의 친구 수를 가져오는 함수
fun getNumberOfFriends(users: Map<Int, User>, userId: Int): Int {
    // 유저를 검색하고 찾지 못하면 -1 반환
    val user = users[userId] ?: return -1
    // 친구 수 반환
    return user.friends.size
}

fun main() {
    // 몇몇 샘플 유저 생성
    val user1 = User(1, "Alice", listOf(2, 3))
    val user2 = User(2, "Bob", listOf(1))
    val user3 = User(3, "Charlie", listOf(1))

    // 유저 맵 생성
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

이 예시에서는:

* 유저의 `id`, `name` 및 친구 목록 프로퍼티를 가진 `User` 데이터 클래스가 있습니다.
* `getNumberOfFriends()` 함수는:
  * `User` 인스턴스 맵과 정수형 유저 ID를 받습니다.
  * 제공된 유저 ID로 `User` 인스턴스 맵의 값에 접근합니다.
  * 엘비스 연산자를 사용하여 맵 값이 `null` 값인 경우 `-1`을 반환하며 함수를 조기 종료합니다.
  * 맵에서 찾은 값을 `user` 변수에 할당합니다.
  * `size` 프로퍼티를 사용하여 유저의 친구 목록에 있는 친구 수를 반환합니다.
* `main()` 함수는:
  * 세 명의 `User` 인스턴스를 생성합니다.
  * 이 `User` 인스턴스들로 맵을 생성하고 `users` 변수에 할당합니다.
  * `users` 변수에 대해 값 `1`과 `2`를 인자로 `getNumberOfFriends()` 함수를 호출하여 `"Alice"`에게는 두 명의 친구를, `"Bob"`에게는 한 명의 친구를 반환받습니다.
  * `users` 변수에 대해 값 `4`를 인자로 `getNumberOfFriends()` 함수를 호출하며, 이는 `-1` 값과 함께 조기 반환을 유도합니다.

조기 반환이 없어도 코드를 더 간결하게 작성할 수 있다는 점을 눈치채셨을 것입니다. 그러나 이 접근 방식은 `users[userId]`가 `null` 값을 반환할 수 있기 때문에 여러 번의 안전한 호출이 필요하며, 코드를 읽기가 약간 더 어려워질 수 있습니다:

```kotlin
fun getNumberOfFriends(users: Map<Int, User>, userId: Int): Int {
    // 유저를 검색하거나 찾지 못하면 -1 반환
    return users[userId]?.friends?.size ?: -1
}
```
{validate="false"}

이 예시는 엘비스 연산자로 하나의 조건만 확인하지만, 중대한 오류 경로를 모두 다루기 위해 여러 체크를 추가할 수 있습니다. 엘비스 연산자를 사용한 조기 반환은 프로그램이 불필요한 작업을 하지 않도록 방지하고, `null` 값이나 유효하지 않은 케이스가 감지되는 즉시 중단함으로써 코드를 더 안전하게 만듭니다.

코드에서 `return`을 사용하는 방법에 대한 자세한 내용은 [반환 및 점프(Returns and jumps)](returns.md)를 참조하세요.

## 연습

### 연습 문제 1 {initial-collapse-state="collapsed" collapsible="true" id="null-safety-exercise-1"}

사용자가 다양한 유형의 알림을 활성화하거나 비활성화할 수 있는 앱의 알림 시스템을 개발하고 있습니다. 다음 조건에 맞게 `getNotificationPreferences()` 함수를 완성하세요:

1. `validUser` 변수는 `as?` 연산자를 사용하여 `user`가 `User` 클래스의 인스턴스인지 확인합니다. 인스턴스가 아니면 빈 리스트를 반환합니다.
2. `userName` 변수는 엘비스 `?:` 연산자를 사용하여 유저 이름이 `null`인 경우 기본값이 `"Guest"`가 되도록 보장합니다.
3. 마지막 return 문은 알림이 활성화된 경우에만 이메일 및 SMS 알림 설정을 포함하도록 `.takeIf()` 함수를 사용합니다.
4. `main()` 함수가 성공적으로 실행되고 예상된 출력을 인쇄합니다.

> [`takeIf()` 함수](scope-functions.md#takeif-and-takeunless)는 주어진 조건이 참이면 원래 값을 반환하고, 그렇지 않으면 `null`을 반환합니다. 예시:
>
> ```kotlin
> fun main() {
>     // 유저가 로그인함
>     val userIsLoggedIn = true
>     // 유저가 활성 세션을 가짐
>     val hasSession = true
> 
>     // 유저가 로그인되어 있고 활성 세션이 있는 경우에만 대시보드 접근 권한 부여
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
    val validUser = // 여기에 코드를 작성하세요
    val userName = // 여기에 코드를 작성하세요

    return listOfNotNull( /* 여기에 코드를 작성하세요 */)
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
{initial-collapse-state="collapsed" collapsible="true" collapsed-title="풀이 예시" id="kotlin-tour-null-safety-solution-1"}

### 연습 문제 2 {initial-collapse-state="collapsed" collapsible="true" id="null-safety-exercise-2"}

사용자가 여러 구독을 가질 수 있지만 **한 번에 하나만 활성화**될 수 있는 구독 기반 스트리밍 서비스를 작업하고 있습니다. 활성 구독이 둘 이상인 경우 `null` 값을 반환하도록 조건자(predicate)와 함께 `singleOrNull()` 함수를 사용하도록 `getActiveSubscription()` 함수를 완성하세요:

|--|--|

```kotlin
data class Subscription(val name: String, val isActive: Boolean)

fun getActiveSubscription(subscriptions: List<Subscription>): Subscription? // 여기에 코드를 작성하세요

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
{initial-collapse-state="collapsed" collapsible="true" collapsed-title="풀이 예시 1" id="kotlin-tour-null-safety-solution-2-1"}

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
{initial-collapse-state="collapsed" collapsible="true" collapsed-title="풀이 예시 2" id="kotlin-tour-null-safety-solution-2-2"}

### 연습 문제 3 {initial-collapse-state="collapsed" collapsible="true" id="null-safety-exercise-3"}

사용자 이름과 계정 상태가 있는 소셜 미디어 플랫폼에서 작업하고 있습니다. 현재 활성 상태인 사용자 이름 목록을 보려고 합니다. [`mapNotNull()` 함수](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.collections/map-not-null.html)가 사용자가 활성 상태이면 사용자 이름을 반환하고, 그렇지 않으면 `null` 값을 반환하는 조건자를 갖도록 `getActiveUsernames()` 함수를 완성하세요:

|--|--|

```kotlin
data class User(val username: String, val isActive: Boolean)

fun getActiveUsernames(users: List<User>): `List<String>` {
    return users.mapNotNull { /* 여기에 코드를 작성하세요 */ }
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

> 연습 문제 1에서와 마찬가지로, 사용자가 활성 상태인지 확인할 때 [`takeIf()` 함수](scope-functions.md#takeif-and-takeunless)를 사용할 수 있습니다.
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
{initial-collapse-state="collapsed" collapsible="true" collapsed-title="풀이 예시 1" id="kotlin-tour-null-safety-solution-3-1"}

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
{initial-collapse-state="collapsed" collapsible="true" collapsed-title="풀이 예시 2" id="kotlin-tour-null-safety-solution-3-2"}

### 연습 문제 4 {initial-collapse-state="collapsed" collapsible="true" id="null-safety-exercise-4"}

이커머스 플랫폼의 재고 관리 시스템을 작업하고 있습니다. 판매를 처리하기 전에 가용 재고를 기준으로 요청된 제품 수량이 유효한지 확인해야 합니다.

조기 반환과 엘비스 연산자를 사용하여(해당하는 경우) 다음 사항을 확인하도록 `validateStock()` 함수를 완성하세요:

* `requested` 변수가 `null`인지 여부.
* `available` 변수가 `null`인지 여부.
* `requested` 변수가 음수인지 여부.
* `requested` 변수의 수량이 `available` 변수보다 많은지 여부.

위의 모든 경우에서 함수는 `-1` 값을 조기 반환해야 합니다.

|--|--|

```kotlin
fun validateStock(requested: Int?, available: Int?): Int {
    // 여기에 코드를 작성하세요
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
{initial-collapse-state="collapsed" collapsible="true" collapsed-title="풀이 예시" id="kotlin-tour-null-safety-solution-4"}

## 다음 단계

[중급: 라이브러리 및 API](kotlin-tour-intermediate-libraries-and-apis.md)