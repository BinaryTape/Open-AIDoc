[//]: # (title: 프로퍼티)

Kotlin에서 프로퍼티(property)를 사용하면 데이터에 접근하거나 변경하기 위한 함수를 별도로 작성하지 않고도 데이터를 저장하고 관리할 수 있습니다.
프로퍼티는 [클래스](classes.md), [인터페이스](interfaces.md), [객체](object-declarations.md), [동반 객체(companion objects)](object-declarations.md#companion-objects)뿐만 아니라 이러한 구조 외부에서 최상위(top-level) 프로퍼티로도 사용할 수 있습니다.

모든 프로퍼티는 이름과 타입, 그리고 게터(getter)라고 불리는 자동 생성된 `get()` 함수를 갖습니다. 게터를 사용하여 프로퍼티의 값을 읽을 수 있습니다. 프로퍼티가 가변(mutable)인 경우, 프로퍼티의 값을 변경할 수 있는 세터(setter)라고 불리는 `set()` 함수도 갖게 됩니다.

> 게터와 세터를 _접근자(accessors)_라고 부릅니다.
> 
{style="tip"}

## 프로퍼티 선언 {id="declaring-properties"}

프로퍼티는 가변(`var`)이거나 읽기 전용(`val`)일 수 있습니다.
`.kt` 파일 내에서 최상위 프로퍼티로 선언할 수 있습니다. 최상위 프로퍼티는 패키지에 속하는 전역 변수처럼 생각할 수 있습니다.

```kotlin
// 파일: Constants.kt
package my.app

val pi = 3.14159
var counter = 0
```

클래스, 인터페이스 또는 객체 내부에서도 프로퍼티를 선언할 수 있습니다.

```kotlin
// 프로퍼티를 가진 클래스
class Address {
    var name: String = "Holmes, Sherlock"
    var street: String = "Baker"
    var city: String = "London"
}

// 프로퍼티를 가진 인터페이스
interface ContactInfo {
    val email: String
}

// 프로퍼티를 가진 객체
object Company {
    var name: String = "Detective Inc."
    val country: String = "UK"
}

// 인터페이스를 구현하는 클래스
class PersonContact : ContactInfo {
    override val email: String = "sherlock@example.com"
}
```

프로퍼티를 사용하려면 프로퍼티 이름을 참조하면 됩니다.

```kotlin
class Address {
    var name: String = "Holmes, Sherlock"
    var street: String = "Baker"
    var city: String = "London"
}

interface ContactInfo {
    val email: String
}

object Company {
    var name: String = "Detective Inc."
    val country: String = "UK"
}

class PersonContact : ContactInfo {
    override val email: String = "sherlock@example.com"
}

//sampleStart
fun copyAddress(address: Address): Address {
    val result = Address()
    // result 인스턴스의 프로퍼티에 접근
    result.name = address.name
    result.street = address.street
    result.city = address.city
    return result
}

fun main() {
    val sherlockAddress = Address()
    val copy = copyAddress(sherlockAddress)
    // copy 인스턴스의 프로퍼티에 접근
    println("Copied address: ${copy.name}, ${copy.street}, ${copy.city}")
    // Copied address: Holmes, Sherlock, Baker, London

    // Company 객체의 프로퍼티에 접근
    println("Company: ${Company.name} in ${Company.country}")
    // Company: Detective Inc. in UK
    
    val contact = PersonContact()
    // contact 인스턴스의 프로퍼티에 접근
    println("Email: ${contact.email}")
    // Email: sherlock@email.com
}
//sampleEnd
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3" id="kotlin-access-properties"}

Kotlin에서는 코드의 안전성과 가독성을 위해 프로퍼티를 선언할 때 초기화하는 것을 권장합니다. 하지만 특별한 경우에는 [나중에 초기화](#late-initialized-properties-and-variables)할 수도 있습니다.

컴파일러가 초기화 식이나 게터의 반환 타입으로부터 타입을 추론할 수 있는 경우, 프로퍼티 타입을 명시하지 않아도 됩니다.

```kotlin
var initialized = 1 // 추론된 타입은 Int
var allByDefault    // 오류: 프로퍼티를 반드시 초기화해야 합니다.
```
{validate="false"}

## 커스텀 게터와 세터 {id="custom-getters-and-setters"}

기본적으로 Kotlin은 게터와 세터를 자동으로 생성합니다. 유효성 검사, 포맷팅 또는 다른 프로퍼티를 기반으로 한 계산과 같이 추가적인 로직이 필요한 경우 커스텀 접근자를 직접 정의할 수 있습니다.

커스텀 게터는 프로퍼티에 접근할 때마다 실행됩니다.

```kotlin
//sampleStart
class Rectangle(val width: Int, val height: Int) {
    val area: Int
        get() = this.width * this.height
}
//sampleEnd
fun main() {
    val rectangle = Rectangle(3, 4)
    println("Width=${rectangle.width}, height=${rectangle.height}, area=${rectangle.area}")
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3" id="kotlin-custom-getter"}

컴파일러가 게터로부터 타입을 추론할 수 있다면 타입을 생략할 수 있습니다.

```kotlin
val area get() = this.width * this.height
```

커스텀 세터는 초기화할 때를 제외하고 프로퍼티에 값을 할당할 때마다 실행됩니다.
관례상 세터의 매개변수 이름은 `value`이지만, 다른 이름을 지정할 수도 있습니다.

```kotlin
class Point(var x: Int, var y: Int) {
    var coordinates: String
        get() = "$x,$y"
        set(value) {
            val parts = value.split(",")
            x = parts[0].toInt()
            y = parts[1].toInt()
        }
}

fun main() {
    val location = Point(1, 2)
    println(location.coordinates) 
    // 1,2

    location.coordinates = "10,20"
    println("${location.x}, ${location.y}") 
    // 10, 20
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3" id="kotlin-custom-setter"}

### 가시성 변경 또는 애너테이션 추가 {id="changing-visibility-or-adding-annotations"}

Kotlin에서는 기본 구현을 대체하지 않고도 접근자의 가시성을 변경하거나 [애너테이션](annotations.md)을 추가할 수 있습니다. 본문 `{}`을 작성하지 않고도 이러한 변경이 가능합니다.

접근자의 가시성을 변경하려면 `get` 또는 `set` 키워드 앞에 가시성 한정자를 사용합니다.

```kotlin
class BankAccount(initialBalance: Int) {
    var balance: Int = initialBalance
        // 클래스 내부에서만 balance를 수정할 수 있음
        private set 

    fun deposit(amount: Int) {
        if (amount > 0) balance += amount
    }

    fun withdraw(amount: Int) {
        if (amount > 0 && amount <= balance) balance -= amount
    }
}

fun main() {
    val account = BankAccount(100)
    println("Initial balance: ${account.balance}") 
    // 100

    account.deposit(50)
    println("After deposit: ${account.balance}") 
    // 150

    account.withdraw(70)
    println("After withdrawal: ${account.balance}") 
    // 80

    // account.balance = 1000  
    // 오류: 세터가 private이므로 값을 할당할 수 없습니다
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3" id="kotlin-private-setter"}

접근자에 애너테이션을 적용하려면 `get` 또는 `set` 키워드 앞에 애너테이션을 사용합니다.

```kotlin
// 게터에 적용할 수 있는 애너테이션 정의
@Target(AnnotationTarget.PROPERTY_GETTER)
annotation class Inject

class Service {
    var dependency: String = "Default Service"
        // 게터에 애너테이션 적용
        @Inject get 
}

fun main() {
    val service = Service()
    println(service.dependency)
    // Default service
    println(service::dependency.getter.annotations)
    // [@Inject()]
    println(service::dependency.setter.annotations)
    // []
}
```
{validate="false"}

이 예제에서는 [리플렉션](reflection.md)을 사용하여 게터와 세터에 어떤 애너테이션이 존재하는지 확인합니다.

## 백킹 필드 (Backing fields) {id="backing-fields"}

컴파일러는 메모리에 값을 저장해야 할 때 프로퍼티에 대한 백킹 필드(뒷받침하는 필드)를 자동으로 생성합니다.

예를 들어, 기본 `get()` 및 `set()` 함수는 저장된 값을 읽고 쓰기 때문에 컴파일러가 백킹 필드를 생성합니다.

```kotlin
var count = 0
```

[커스텀 `get()` 또는 `set()` 함수](#custom-getters-and-setters) 내부에서 `field` 키워드를 사용하여 백킹 필드에 접근할 수 있습니다. 예를 들어, 게터나 세터에 추가적인 로직을 더하거나 프로퍼티가 변경될 때 부가적인 동작을 실행하도록 할 수 있습니다.

다음 예제에서 `score` 프로퍼티는 `set()` 함수 내부에서 백킹 필드를 사용하여 값을 업데이트할 때 로그 이벤트도 함께 발생시킵니다.

```kotlin
class Scoreboard {
    var score: Int = 0
        set(value) {
            field = value
            // 값 업데이트 시 로깅 추가
            println("Score updated to $field")
        }
}

fun main() {
    val board = Scoreboard()
    board.score = 10  
    // Score updated to 10
    board.score = 20  
    // Score updated to 20
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3" id="kotlin-backing-field"}

모든 프로퍼티에 기본적으로 백킹 필드가 생성되는 것은 아니며, 필요하지 않은 경우에는 생성되지 않습니다. 예를 들어 `isEmpty` 프로퍼티는 접근할 때마다 `size` 프로퍼티로부터 값을 계산하므로 백킹 필드를 갖지 않습니다.

```kotlin
val isEmpty: Boolean
    get() = this.size == 0
```

### 명시적 백킹 필드 (Explicit backing fields) {id="explicit-backing-fields"}

때로는 더 많은 유연성이 필요할 수 있습니다. 예를 들어 프로퍼티를 내부적으로는 수정할 수 있지만 외부에는 수정할 수 없도록 공개하는 API를 만들고자 하는 경우입니다. 이런 상황에서는 _명시적 백킹 필드(explicit backing field)_를 사용할 수 있습니다.

다음 예제에서 `ShoppingCart` 클래스는 장바구니에 담긴 모든 항목을 나타내는 `items` 프로퍼티를 가집니다. 클래스는 `items` 프로퍼티를 읽기 전용 문자열 리스트로 노출하지만, 내부적으로는 명시적 백킹 필드를 사용하여 가변 리스트로 데이터를 저장합니다.

```kotlin
class ShoppingCart {
    // 명시적 백킹 필드를 갖는 공개 읽기 전용 뷰
    val items: List<String>
        field = mutableListOf()
    
    fun addItem(item: String) {
        items.add(item)
    }

    fun removeItem(item: String) {
        items.remove(item)
    }
}

fun main() {
    val cart = ShoppingCart()
    cart.addItem("Apple")
    cart.addItem("Banana")

    println(cart.items) 
    // [Apple, Banana]
    
    cart.removeItem("Apple")
    println(cart.items) 
    // [Banana]
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="2.4" id="kotlin-explicit-backing-field"}

이 예제에서 컴파일러는 `mutableListOf()` 호출로부터 백킹 필드의 타입을 `MutableList<String>`으로 추론합니다. 백킹 필드의 타입을 명시적으로 선언할 수도 있습니다.

```kotlin
val items: List<String>
    // 명시적 타입이 지정된 명시적 백킹 필드
    field: MutableList<String> = mutableListOf()
```
{validate="false"}

`ShoppingCart` 클래스 예제에서 컴파일러는 `items` 프로퍼티를 `MutableList<String>` 타입으로 스마트 캐스트하므로, 클래스는 `add()` 및 `remove()` 함수를 통해 장바구니의 항목을 추가하고 제거할 수 있습니다. 클래스 외부에서는 컴파일러가 공개 프로퍼티 타입인 `List<String>`을 사용하므로, API 사용자는 `items` 리스트에 있는 내용만 읽을 수 있습니다.

#### 제약 사항 {id="limitations"}

명시적 백킹 필드를 사용하려면 해당 프로퍼티와 백킹 필드 자체가 특정 규칙을 따라야 합니다. 프로퍼티는 다음과 같은 조건에서만 명시적 백킹 필드를 가질 수 있습니다.

* 커스텀 게터가 없어야 합니다.
* 읽기 전용(`val`)이어야 합니다.
* `open`이 아니어야 합니다.
* [위임된 프로퍼티(delegated property)](delegated-properties.md)가 아니어야 합니다.
* [컴파일 타임 상수](#compile-time-constants)가 아니어야 합니다.

또한, 백킹 필드의 타입은 프로퍼티 타입의 하위 타입이어야 하며 [`private` 가시성](visibility-modifiers.md)을 가져야 합니다.

이러한 제약 사항은 백킹 프로퍼티를 대신 사용하여 해결할 수 있습니다.

### 백킹 프로퍼티 (Backing properties) {id="backing-properties"}

명시적 백킹 필드가 사용 사례에 맞지 않는다면, _백킹 프로퍼티(backing property)_라는 코딩 패턴을 사용할 수 있습니다.

예를 들어, 프로퍼티에 커스텀 게터가 필요한 경우 다음과 같이 작성할 수 있습니다.

```kotlin
class UserDirectory {
    private val _users = mutableListOf(
        "sarah",
        "mike",
        "emma"
    )

    val users: List<String>
        get() = _users.sorted()

    fun addUser(username: String) {
        _users.add(username)
    }
}

fun main() {
    val directory = UserDirectory()

    directory.addUser("alex")
    println(directory.users)
    // [alex, emma, mike, sarah]
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3" id="kotlin-backing-property-custom-getter"}

> 백킹 프로퍼티의 이름을 지을 때는 Kotlin [코딩 컨벤션](coding-conventions.md#names-for-backing-properties)에 따라 맨 앞에 밑줄(underscore)을 붙이세요.
>
{style="tip"}

이 예제에서 `UserDirectory` 클래스는 디렉터리의 모든 사용자를 나열하는 읽기 전용 `users` 프로퍼티를 가집니다. `_users` 변수는 실제 리스트를 담고 있는 private 백킹 프로퍼티입니다. 공개된 `users` 프로퍼티의 게터는 엔트리를 반환하기 전에 정렬합니다.

## 컴파일 타임 상수 {id="compile-time-constants"}

읽기 전용 프로퍼티의 값을 컴파일 타임에 알 수 있는 경우, `const` 한정자를 사용하여 _컴파일 타임 상수_로 표시하세요.
컴파일 타임 상수는 컴파일 시점에 인라인되므로 각 참조가 실제 값으로 대체됩니다. 게터가 호출되지 않기 때문에 더 효율적으로 접근할 수 있습니다.

```kotlin
// 파일: AppConfig.kt
package com.example

// 컴파일 타임 상수
const val MAX_LOGIN_ATTEMPTS = 3
```

컴파일 타임 상수는 다음 요구 사항을 충족해야 합니다.

* 최상위 프로퍼티이거나 [`object` 선언](object-declarations.md#object-declarations-overview) 또는 [동반 객체](object-declarations.md#companion-objects)의 멤버여야 합니다.
* `String` 타입 또는 [원시 타입(primitive type)](types-overview.md)의 값으로 초기화되어야 합니다.
* 커스텀 게터를 가질 수 없습니다.

컴파일 타임 상수도 백킹 필드를 유지하므로 [리플렉션](reflection.md)을 사용하여 상호작용할 수 있습니다.

이러한 프로퍼티는 애너테이션에서도 사용할 수 있습니다.

```kotlin
const val SUBSYSTEM_DEPRECATED: String = "This subsystem is deprecated"

@Deprecated(SUBSYSTEM_DEPRECATED) fun processLegacyOrders() { ... }
```

## 지연 초기화 프로퍼티 및 변수 {id="late-initialized-properties-and-variables"}

일반적으로 프로퍼티는 생성자에서 초기화해야 합니다.
그러나 이것이 항상 편리한 것은 아닙니다. 예를 들어, 의존성 주입(dependency injection)을 통해 프로퍼티를 초기화하거나 단위 테스트의 셋업 메서드 내부에서 초기화할 수도 있습니다.

이러한 상황을 처리하려면 프로퍼티에 `lateinit` 한정자를 지정하세요.

```kotlin
public class OrderServiceTest {
    lateinit var orderService: OrderService

    @SetUp fun setup() {
        orderService = OrderService()
    }

    @Test fun processesOrderSuccessfully() {
        // null 체크나 초기화 여부 확인 없이
        // orderService를 직접 호출
        orderService.processOrder()  
    }
}
```

`lateinit` 한정자는 다음과 같이 선언된 `var` 프로퍼티에 사용할 수 있습니다.

* 최상위 프로퍼티
* 지역 변수
* 클래스 본문 내부의 프로퍼티

클래스 프로퍼티의 경우:

* 기본 생성자(primary constructor)에 선언할 수 없습니다.
* 커스텀 게터나 세터를 가질 수 없습니다.

모든 경우에 프로퍼티나 변수는 널 불가능(non-nullable)이어야 하며, [원시 타입](types-overview.md)이 아니어야 합니다.

초기화하기 전에 `lateinit` 프로퍼티에 접근하면, Kotlin은 접근된 미초기화 프로퍼티를 식별하는 특정한 예외를 던집니다.

```kotlin
class ReportGenerator {
    lateinit var report: String

    fun printReport() {
        // 초기화되기 전에 접근하므로 예외를 던짐
        println(report)
    }
}

fun main() {
    val generator = ReportGenerator()
    generator.printReport()
    // Exception in thread "main" kotlin.UninitializedPropertyAccessException: lateinit property report has not been initialized
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3" id="kotlin-lateinit-property" validate="false"}

`lateinit var`가 이미 초기화되었는지 확인하려면 [해당 프로퍼티에 대한 참조](lambdas.md#property-references)에서 [`isInitialized`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin/is-initialized.html) 프로퍼티를 사용하세요.

```kotlin
class WeatherStation {
    lateinit var latestReading: String

    fun printReading() {
        // 프로퍼티가 초기화되었는지 확인
        if (this::latestReading.isInitialized) {
            println("Latest reading: $latestReading")
        } else {
            println("No reading available")
        }
    }
}

fun main() {
    val station = WeatherStation()

    station.printReading()
    // No reading available
    station.latestReading = "22°C, sunny"
    station.printReading()
    // Latest reading: 22°C, sunny
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3" id="kotlin-lateinit-property-check-initialization"}

`isInitialized`는 코드에서 해당 프로퍼티에 직접 접근할 수 있는 경우에만 사용할 수 있습니다. 프로퍼티는 동일한 클래스, 외부 클래스, 또는 같은 파일의 최상위 프로퍼티로 선언되어 있어야 합니다.

## 프로퍼티 재정의 {id="overriding-properties"}

[프로퍼티 재정의(Overriding properties)](inheritance.md#overriding-properties)를 참조하세요.

## 위임된 프로퍼티 (Delegated properties) {id="delegated-properties"}

로직을 재사용하고 코드 중복을 줄이기 위해, 프로퍼티의 값을 읽고 설정하는 책임을 별도의 객체에 위임할 수 있습니다.

접근자 동작을 위임하면 프로퍼티의 접근자 로직을 중앙에서 관리할 수 있어 재사용하기가 더 쉬워집니다. 이 방식은 다음과 같은 동작을 구현할 때 유용합니다.

* 값을 지연 계산(lazy computation)할 때
* 주어진 키로 맵(map)에서 값을 읽을 때
* 데이터베이스에 접근할 때
* 프로퍼티에 접근할 때 리스너에 알림을 보낼 때

이러한 공통 동작을 라이브러리에 직접 구현하거나 외부 라이브러리에서 제공하는 기존 델리게이트(delegate)를 사용할 수 있습니다. 자세한 내용은 [위임된 프로퍼티(delegated properties)](delegated-properties.md)를 참조하세요.