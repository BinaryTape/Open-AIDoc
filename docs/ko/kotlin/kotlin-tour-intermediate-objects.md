[//]: # (title: 객체(Objects))

<no-index/>

이 장에서는 객체 선언(object declaration)을 살펴보며 클래스에 대한 이해를 넓혀봅니다. 이 지식은 프로젝트 전반에서 동작을 효율적으로 관리하는 데 도움이 됩니다.

## 객체 선언 (Object declarations) {id="object-declarations"}

Kotlin에서는 **객체 선언(object declaration)**을 사용하여 인스턴스가 하나만 존재하는 클래스를 선언할 수 있습니다. 즉, 클래스를 선언하는 것과 단일 인스턴스를 생성하는 것이 _동시에_ 이루어집니다. 객체 선언은 프로그램 전체에서 단일 참조 지점으로 사용하거나 시스템 전반의 동작을 조율하는 클래스를 만들 때 유용합니다.

> 쉽게 접근할 수 있는 인스턴스를 오직 하나만 가지는 클래스를 **싱글톤(singleton)**이라고 부릅니다.
>
{style="tip"}

Kotlin의 객체는 **지연(lazy)** 초기화됩니다. 즉, 해당 객체에 처음 접근할 때 비로소 생성됩니다. 또한 Kotlin은 모든 객체가 스레드 안전(thread-safe)하게 생성되도록 보장하므로, 이를 직접 수동으로 확인할 필요가 없습니다.

객체 선언을 생성하려면 `object` 키워드를 사용합니다.

```kotlin
object DoAuth {}
```

`object` 이름 뒤에 중괄호 `{}`로 감싼 객체 본문을 두고, 그 안에 필요한 프로퍼티나 멤버 함수를 추가합니다.

> 객체는 생성자를 가질 수 없으므로 클래스와 같은 헤더를 갖지 않습니다.
>
{style="note"}

예를 들어, 인증을 담당하는 `DoAuth`라는 객체를 생성한다고 가정해 보겠습니다.

```kotlin
object DoAuth {
    fun takeParams(username: String, password: String) {
        println("input Auth parameters = $username:$password")
    }
}

fun main(){
    // takeParams() 함수가 호출될 때 객체가 생성됩니다.
    DoAuth.takeParams("coding_ninja", "N1njaC0ding!")
    // input Auth parameters = coding_ninja:N1njaC0ding!
}
```
{kotlin-runnable="true" id="kotlin-tour-object-declarations"}

이 객체에는 `username`과 `password` 변수를 파라미터로 받아 콘솔에 문자열을 출력하는 `takeParams` 멤버 함수가 있습니다. `DoAuth` 객체는 이 함수가 처음으로 호출될 때 비로소 생성됩니다.

> 객체는 클래스와 인터페이스를 상속할 수도 있습니다. 예를 들면 다음과 같습니다.
> 
> ```kotlin
> interface Auth {
>     fun takeParams(username: String, password: String)
> }
>
> object DoAuth : Auth {
>     override fun takeParams(username: String, password: String) {
>         println("input Auth parameters = $username:$password")
>     }
> }
> ```
>
{style="note"}

#### 데이터 객체 (Data objects) {id="data-objects"}

객체 선언의 내용을 더 쉽게 출력할 수 있도록 Kotlin은 **데이터 객체(data object)**를 제공합니다. 입문 투어에서 배운 데이터 클래스와 마찬가지로, 데이터 객체에는 `toString()`과 `equals()` 멤버 함수가 자동으로 생성됩니다.

> 데이터 클래스와 달리 데이터 객체에는 `copy()` 멤버 함수가 자동으로 포함되지 않습니다. 복사할 수 없는 단 하나의 인스턴스만 갖기 때문입니다.
>
{type ="note"}

데이터 객체를 생성하려면 객체 선언과 동일한 구문을 사용하되 앞에 `data` 키워드를 붙입니다.

```kotlin
data object AppConfig {}
```

예를 들면 다음과 같습니다.

```kotlin
data object AppConfig {
    var appName: String = "My Application"
    var version: String = "1.0.0"
}

fun main() {
    println(AppConfig)
    // AppConfig
    
    println(AppConfig.appName)
    // My Application
}
```
{kotlin-runnable="true" id="kotlin-tour-data-objects"}

데이터 객체에 대한 자세한 내용은 [](object-declarations.md#data-objects)를 참고하세요.

#### 동반 객체 (Companion objects) {id="companion-objects"}

Kotlin에서는 클래스 내부에 객체를 둘 수 있는데, 이를 **동반 객체(companion object)**라고 합니다. 클래스당 단 **하나**의 동반 객체만 가질 수 있습니다. 동반 객체는 해당 클래스가 처음으로 참조될 때 생성됩니다.

동반 객체 내부에 선언된 모든 프로퍼티와 함수는 클래스의 모든 인스턴스에서 공유됩니다.

클래스 내에 동반 객체를 생성하려면 객체 선언과 동일한 구문을 사용하되 앞에 `companion` 키워드를 붙입니다.

```kotlin
companion object Bonger {}
```

> 동반 객체는 이름을 생략할 수 있습니다. 이름을 정의하지 않으면 기본값은 `Companion`이 됩니다.
> 
{style="note"}

동반 객체의 프로퍼티나 함수에 접근하려면 클래스 이름을 참조합니다. 예를 들면 다음과 같습니다.

```kotlin
class BigBen {
    companion object Bonger {
        fun getBongs(nTimes: Int) {
            repeat(nTimes) { print("BONG ") }
            }
        }
    }

fun main() {
    // 클래스가 처음으로 참조될 때 동반 객체가 생성됩니다.
    BigBen.getBongs(12)
    // BONG BONG BONG BONG BONG BONG BONG BONG BONG BONG BONG BONG 
}
```
{kotlin-runnable="true" id="kotlin-tour-classes-companion-object"}

이 예제는 `Bonger`라는 동반 객체를 포함하는 `BigBen` 클래스를 생성합니다. 동반 객체에는 정수를 전달받아 해당 횟수만큼 콘솔에 `"BONG "`을 출력하는 `getBongs()` 멤버 함수가 있습니다.

`main()` 함수에서는 클래스 이름을 참조하여 `getBongs()` 함수를 호출합니다. 바로 이 시점에 동반 객체가 생성됩니다. `getBongs()` 함수는 인자 `12`와 함께 호출됩니다.

자세한 내용은 [](object-declarations.md#companion-objects)를 참고하세요.

## 연습 문제 {completion-point="true" id="practice"}

<deflist appearance="clear" collapsible="true" numbered="true">
<def title="주문 추적을 위한 데이터 객체 구현하기" id="objects-exercise-1">

커피숍을 운영하며 고객 주문을 추적하는 시스템을 개발하고 있습니다. 아래 코드를 살펴보고, `main()` 함수의 코드가 정상적으로 실행되도록 두 번째 데이터 객체의 선언을 완성하세요.

```kotlin
interface Order {
    val orderId: String
    val customerName: String
    val orderTotal: Double
}

data object OrderOne: Order {
    override val orderId = "001"
    override val customerName = "Alice"
    override val orderTotal = 15.50
}

data object // 여기에 코드를 작성하세요

fun main() {
    // 각 데이터 객체의 이름 출력
    println("Order name: $OrderOne")
    // Order name: OrderOne
    println("Order name: $OrderTwo")
    // Order name: OrderTwo

    // 두 주문이 동일한지 확인
    println("Are the two orders identical? ${OrderOne == OrderTwo}")
    // Are the two orders identical? false

    if (OrderOne == OrderTwo) {
        println("The orders are identical.")
    } else {
        println("The orders are unique.")
        // The orders are unique.
    }

    println("Do the orders have the same customer name? ${OrderOne.customerName == OrderTwo.customerName}")
    // Do the orders have the same customer name? false
}
```
{kotlin-runnable="true" kotlin-target-platform="exercise" kotlin-hidden-files="ExerciseUtils.kt,tour/intermediate/OrderTwoTest.kt" validate="false" id="kotlin-tour-objects-exercise-1"}

```kotlin
interface Order {
    val orderId: String
    val customerName: String
    val orderTotal: Double
}

data object OrderOne: Order {
    override val orderId = "001"
    override val customerName = "Alice"
    override val orderTotal = 15.50
}

data object OrderTwo: Order {
    override val orderId = "002"
    override val customerName = "Bob"
    override val orderTotal = 12.75
}

fun main() {
    // 각 데이터 객체의 이름 출력
    println("Order name: $OrderOne")
    // Order name: OrderOne
    println("Order name: $OrderTwo")
    // Order name: OrderTwo

    // 두 주문이 동일한지 확인
    println("Are the two orders identical? ${OrderOne == OrderTwo}")
    // Are the two orders identical? false

    if (OrderOne == OrderTwo) {
        println("The orders are identical.")
    } else {
        println("The orders are unique.")
        // The orders are unique.
    }

    println("Do the orders have the same customer name? ${OrderOne.customerName == OrderTwo.customerName}")
    // Do the orders have the same customer name? false
}
```
{kotlin-runnable="true" kotlin-target-platform="exercise" kotlin-hidden-files="ExerciseUtils.kt,tour/intermediate/OrderTwoTest.kt" initial-collapse-state="collapsed" collapsible="true" collapsed-title="Example solution" id="kotlin-tour-objects-solution-1"}

</def>
<def title="객체 선언 생성하기" id="objects-exercise-2">

`Vehicle` 인터페이스를 상속하여 독특한 탈것 유형인 `FlyingSkateboard`를 나타내는 객체 선언을 만드세요. `main()` 함수의 코드가 정상적으로 실행되도록 객체 내에 `name` 프로퍼티와 `move()` 함수를 구현하세요.

```kotlin
interface Vehicle {
    val name: String
    fun move(): String
}

object // 여기에 코드를 작성하세요

fun main() {
    println("${FlyingSkateboard.name}: ${FlyingSkateboard.move()}")
    // Flying Skateboard: Glides through the air with a hover engine
    println("${FlyingSkateboard.name}: ${FlyingSkateboard.fly()}")
    // Flying Skateboard: Woooooooo
}
```
{kotlin-runnable="true" kotlin-target-platform="exercise" kotlin-hidden-files="ExerciseUtils.kt,tour/intermediate/FlyingSkateboardTest.kt" validate="false" id="kotlin-tour-objects-exercise-2"}

```kotlin
interface Vehicle {
    val name: String
    fun move(): String
}

object FlyingSkateboard : Vehicle {
    override val name = "Flying Skateboard"
    override fun move() = "Glides through the air with a hover engine"

   fun fly(): String = "Woooooooo"
}

fun main() {
    println("${FlyingSkateboard.name}: ${FlyingSkateboard.move()}")
    // Flying Skateboard: Glides through the air with a hover engine
    println("${FlyingSkateboard.name}: ${FlyingSkateboard.fly()}")
    // Flying Skateboard: Woooooooo
}
```
{kotlin-runnable="true" kotlin-target-platform="exercise" kotlin-hidden-files="ExerciseUtils.kt,tour/intermediate/FlyingSkateboardTest.kt" initial-collapse-state="collapsed" collapsible="true" collapsed-title="Example solution" id="kotlin-tour-objects-solution-2"}

</def>
<def title="사용자 생성 전 이메일 주소 유효성 검사하기" id="objects-exercise-3">

앱의 사용자 등록 모듈을 구축하고 있습니다. 이메일 유효성 검사 로직을 `User` 클래스와 연관 지어 유지하면서도, 이메일 주소가 유효하지 않은 경우 불필요하게 `User` 인스턴스가 생성되지 않도록 하려고 합니다.

이 연습 문제에서는 이메일 주소에 `@`와 `.`이 모두 포함되어 있으면 유효한 것으로 간주합니다. `main()` 함수의 코드가 정상적으로 실행되도록 데이터 클래스를 완성하세요.

<deflist collapsible="true">
    <def title="힌트">
        `User` 클래스의 동반 객체 안에 이메일 유효성 검사 함수를 추가하여 `User`에서 함수를 직접 호출할 수 있도록 해보세요.
    </def>
</deflist>

```kotlin
data class User(val name: String, val email: String) {
    // 여기에 코드를 작성하세요
}

fun main() {
    val candidates = listOf(
        Pair("Alice", "alice@example.com"),
        Pair("Bob", "bob2example-com")
    )

    for ((name, email) in candidates) {
        if (User.isValidEmail(email)) {
            val user = User(name, email)
            println("Registered: ${user.name}, ${user.email}")
            // Registered: Alice, alice@example.com
        } else {
            println("Error: '${email}' is not valid. The email should contain '@' and '.'")
            // Error: 'bob2example-com' is not valid. The email should contain '@' and '.'
        }
    }
}
```
{kotlin-runnable="true" kotlin-target-platform="exercise" kotlin-hidden-files="ExerciseUtils.kt,tour/intermediate/UserTest.kt" validate="false" id="kotlin-tour-objects-exercise-3"}

```kotlin
data class User(val name: String, val email: String) {
    companion object {
        fun isValidEmail(email: String): Boolean =
            email.contains('@') && email.contains('.')
    }
}

fun main() {
    val candidates = listOf(
        Pair("Alice", "alice@example.com"),
        Pair("Bob", "bob2example-com")
    )

    for ((name, email) in candidates) {
        if (User.isValidEmail(email)) {
            val user = User(name, email)
            println("Registered: ${user.name}, ${user.email}")
            // Registered: Alice, alice@example.com
        } else {
            println("Error: '${email}' is not valid. The email should contain '@' and '.'")
            // Error: 'bob2example-com' is not valid. The email should contain '@' and '.'
        }
    }
}
```
{kotlin-runnable="true" kotlin-target-platform="exercise" kotlin-hidden-files="ExerciseUtils.kt,tour/intermediate/UserTest.kt" initial-collapse-state="collapsed" collapsible="true" collapsed-title="Example solution" id="kotlin-tour-objects-solution-3"}

> 이 연습 문제의 확장으로, 동반 객체의 함수를 팩토리 메서드로 사용하여 클래스의 인스턴스를 생성해 보세요. 이 패턴에 대한 예제 및 자세한 내용은 [](object-declarations.md#companion-objects)를 참고하세요.
>
{style="tip"}

</def>
</deflist>

<seealso></seealso>

<list columns="2" id="tour-nav">
  <li>
    <a as="button" href="kotlin-tour-intermediate-classes-interfaces.md" mode="outline" icon="arrow-left" icon-position="left">이전 단계</a>
  </li>
  <li>
    <a as="button" href="kotlin-tour-intermediate-open-special-classes.md" mode="classic" icon="arrow-right" icon-position="right">다음 단계</a>
  </li>
</list>