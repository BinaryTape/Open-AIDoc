[//]: # (title: 오픈 클래스와 특별한 클래스)

<no-index/>

이 장에서는 오픈(open) 클래스, 오픈 클래스가 인터페이스와 함께 작동하는 방식, 그리고 Kotlin에서 사용할 수 있는 다른 특별한 유형의 클래스들에 대해 알아봅니다.

## 오픈 클래스 (Open classes)

인터페이스나 추상 클래스를 사용할 수 없는 경우, 클래스를 **open**으로 선언하여 명시적으로 상속 가능하게 만들 수 있습니다.
이를 위해 클래스 선언 앞에 `open` 키워드를 사용합니다:

```kotlin
open class Vehicle(val make: String, val model: String)
```

다른 클래스를 상속받는 클래스를 만들려면, 클래스 헤더 뒤에 콜론(`:`)을 추가하고 상속받으려는 부모 클래스의 생성자 호출을 작성합니다. 이 예제에서 `Car` 클래스는 `Vehicle` 클래스를 상속받습니다:

```kotlin
open class Vehicle(val make: String, val model: String)

class Car(make: String, model: String, val numberOfDoors: Int) : Vehicle(make, model)

fun main() {
    // Car 클래스의 인스턴스를 생성합니다
    val car = Car("Toyota", "Corolla", 4)

    // 자동차의 상세 정보를 출력합니다
    println("Car Info: Make - ${car.make}, Model - ${car.model}, Number of doors - ${car.numberOfDoors}")
    // Car Info: Make - Toyota, Model - Corolla, Number of doors - 4
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3" id="kotlin-tour-classes-open-class"}

일반적인 클래스 인스턴스를 생성할 때와 마찬가지로, 클래스가 부모 클래스를 상속받는다면 부모 클래스 헤더에 선언된 모든 파라미터를 초기화해야 합니다. 따라서 예제에서 `Car` 클래스의 인스턴스인 `car`는 부모 클래스의 파라미터인 `make`와 `model`을 초기화합니다.

### 상속된 동작 오버라이딩 (Overriding inherited behavior)

클래스를 상속받으면서 일부 동작을 변경하고 싶다면, 상속된 동작을 오버라이드(override)할 수 있습니다.

기본적으로 부모 클래스의 멤버 함수나 프로퍼티를 오버라이드하는 것은 불가능합니다. 추상 클래스와 마찬가지로 특별한 키워드를 추가해야 합니다.

#### 멤버 함수

부모 클래스의 함수가 오버라이드될 수 있도록 허용하려면, 부모 클래스에서의 함수 선언 앞에 `open` 키워드를 사용합니다:

```kotlin
open fun displayInfo() {}
```
{validate="false"}

상속된 멤버 함수를 오버라이드하려면, 자식 클래스의 함수 선언 앞에 `override` 키워드를 사용합니다:

```kotlin
override fun displayInfo() {}
```
{validate="false"}

예를 들면 다음과 같습니다:

```kotlin
open class Vehicle(val make: String, val model: String) {
    open fun displayInfo() {
        println("Vehicle Info: Make - $make, Model - $model")
    }
}

class Car(make: String, model: String, val numberOfDoors: Int) : Vehicle(make, model) {
    override fun displayInfo() {
        println("Car Info: Make - $make, Model - $model, Number of Doors - $numberOfDoors")
    }
}

fun main() {
    val car1 = Car("Toyota", "Corolla", 4)
    val car2 = Car("Honda", "Civic", 2)

    // 오버라이드된 displayInfo() 함수를 사용합니다
    car1.displayInfo()
    // Car Info: Make - Toyota, Model - Corolla, Number of Doors - 4
    car2.displayInfo()
    // Car Info: Make - Honda, Model - Civic, Number of Doors - 2
}
```
{kotlin-runnable="true" id="kotlin-tour-class-override-function"}

이 예제는 다음과 같은 작업을 수행합니다:

* `Vehicle` 클래스를 상속받는 `Car` 클래스의 인스턴스 `car1`과 `car2`를 생성합니다.
* `Car` 클래스에서 `displayInfo()` 함수를 오버라이드하여 문 개수(number of doors)도 함께 출력하도록 합니다.
* `car1`과 `car2` 인스턴스에서 오버라이드된 `displayInfo()` 함수를 호출합니다.

#### 프로퍼티

Kotlin에서 `open` 키워드를 사용하여 프로퍼티를 상속 가능하게 만들고 나중에 오버라이드하는 것은 일반적인 관례가 아닙니다. 대부분의 경우 프로퍼티가 기본적으로 상속 가능한 추상 클래스나 인터페이스를 사용합니다.

오픈 클래스 내부의 프로퍼티는 자식 클래스에서 접근할 수 있습니다. 일반적으로는 프로퍼티를 새 프로퍼티로 오버라이드하기보다는 직접 접근하는 것이 더 좋습니다.

예를 들어, 나중에 오버라이드하고 싶은 `transmissionType`이라는 프로퍼티가 있다고 가정해 보겠습니다. 프로퍼티 오버라이딩 구문은 멤버 함수 오버라이딩과 완전히 동일합니다. 다음과 같이 할 수 있습니다:

```kotlin
open class Vehicle(val make: String, val model: String) {
    open val transmissionType: String = "Manual"
}

class Car(make: String, model: String, val numberOfDoors: Int) : Vehicle(make, model) {
    override val transmissionType: String = "Automatic"
}
```

하지만 이것은 좋은 관례가 아닙니다. 대신 상속 가능한 클래스의 생성자에 프로퍼티를 추가하고, `Car` 자식 클래스를 생성할 때 그 값을 선언할 수 있습니다:

```kotlin
open class Vehicle(val make: String, val model: String, val transmissionType: String = "Manual")

class Car(make: String, model: String, val numberOfDoors: Int) : Vehicle(make, model, "Automatic")
```

프로퍼티를 오버라이드하는 대신 직접 접근하면 코드가 더 단순해지고 가독성이 좋아집니다. 부모 클래스에서 프로퍼티를 한 번 선언하고 생성자를 통해 값을 전달함으로써, 자식 클래스에서 불필요하게 오버라이드할 필요를 없앨 수 있습니다.

클래스 상속 및 클래스 동작 오버라이딩에 대한 자세한 정보는 [상속(Inheritance)](inheritance.md)을 참조하세요.

### 오픈 클래스와 인터페이스

클래스 하나를 상속받는 **동시에** 여러 인터페이스를 구현하는 클래스를 만들 수 있습니다. 이 경우, 콜론 뒤에 부모 클래스를 먼저 선언하고 그 다음에 인터페이스 목록을 나열해야 합니다:

```kotlin
// 인터페이스 정의
interface EcoFriendly {
    val emissionLevel: String
}

interface ElectricVehicle {
    val batteryCapacity: Double
}

// 부모 클래스
open class Vehicle(val make: String, val model: String)

// 자식 클래스
open class Car(make: String, model: String, val numberOfDoors: Int) : Vehicle(make, model)

// Car를 상속받고 두 개의 인터페이스를 구현하는 새로운 클래스
class ElectricCar(
    make: String,
    model: String,
    numberOfDoors: Int,
    val capacity: Double,
    val emission: String
) : Car(make, model, numberOfDoors), EcoFriendly, ElectricVehicle {
    override val batteryCapacity: Double = capacity
    override val emissionLevel: String = emission
}
```

## 특별한 클래스 (Special classes)

추상 클래스, 오픈 클래스, 데이터 클래스 외에도 Kotlin에는 특정 동작을 제한하거나 작은 객체 생성 시 발생하는 성능 영향을 줄이기 위해 설계된 다양한 목적의 특별한 클래스 유형이 있습니다.

### 봉인된 클래스 (Sealed classes)

상속을 제한하고 싶을 때가 있을 수 있습니다. 이때 봉인된(sealed) 클래스를 사용할 수 있습니다. 봉인된 클래스는 [추상 클래스](kotlin-tour-intermediate-classes-interfaces.md#abstract-classes)의 특별한 유형입니다. 클래스를 `sealed`로 선언하면, 동일한 패키지 내에서만 자식 클래스를 만들 수 있습니다. 이 범위 밖에서는 봉인된 클래스를 상속받는 것이 불가능합니다.

> 패키지(package)는 일반적으로 하나의 디렉토리 내에 있는 관련 클래스와 함수들의 코드 모음입니다. Kotlin의 패키지에 대해 더 자세히 알아보려면 [패키지와 임포트(Packages and imports)](packages.md)를 참조하세요.
> 
{style="tip"}

봉인된 클래스를 만들려면 `sealed` 키워드를 사용합니다:

```kotlin
sealed class Mammal
```

봉인된 클래스는 `when` 표현식과 결합할 때 특히 유용합니다. `when` 표현식을 사용하면 가능한 모든 자식 클래스에 대한 동작을 정의할 수 있습니다. 예를 들면 다음과 같습니다:

```kotlin
sealed class Mammal(val name: String)

class Cat(val catName: String) : Mammal(catName)
class Human(val humanName: String, val job: String) : Mammal(humanName)

fun greetMammal(mammal: Mammal): String {
    when (mammal) {
        is Human -> return "Hello ${mammal.name}; You're working as a ${mammal.job}"
        is Cat -> return "Hello ${mammal.name}"   
    }
}

fun main() {
    println(greetMammal(Cat("Snowy")))
    // Hello Snowy
}
```
{kotlin-runnable="true" id="kotlin-tour-sealed-classes"}

이 예제에서:

* 생성자에 `name` 파라미터를 가진 `Mammal`이라는 봉인된 클래스가 있습니다.
* `Cat` 클래스는 `Mammal` 봉인된 클래스를 상속받으며, 자신의 생성자에 있는 `catName` 파라미터를 `Mammal` 클래스의 `name` 파라미터로 사용합니다.
* `Human` 클래스는 `Mammal` 봉인된 클래스를 상속받으며, 자신의 생성자에 있는 `humanName` 파라미터를 `Mammal` 클래스의 `name` 파라미터로 사용합니다. 또한 생성자에 `job` 파라미터를 가지고 있습니다.
* `greetMammal()` 함수는 `Mammal` 타입의 인자를 받아 문자열을 반환합니다.
* `greetMammal()` 함수 본문 내부에는 [`is` 연산자](typecasts.md#is-and-is-operators)를 사용하여 `mammal`의 타입을 확인하고 어떤 동작을 수행할지 결정하는 `when` 표현식이 있습니다.
* `main()` 함수는 `Cat` 클래스의 인스턴스와 `Snowy`라는 `name` 파라미터로 `greetMammal()` 함수를 호출합니다.

> 이 튜토리얼은 [널 안정성(Null safety)](kotlin-tour-intermediate-null-safety.md) 장에서 `is` 연산자에 대해 더 자세히 다룹니다.
> 
{style ="tip"}

봉인된 클래스와 권장되는 사용 사례에 대한 자세한 내용은 [봉인된 클래스와 인터페이스(Sealed classes and interfaces)](sealed-classes.md)를 참조하세요.

### 열거형 클래스 (Enum classes)

열거형(enum) 클래스는 클래스 내에서 유한한 고유 값 집합을 표현하고 싶을 때 유용합니다. 열거형 클래스는 열거형 상수를 포함하며, 이 상수들 자체가 열거형 클래스의 인스턴스입니다.

열거형 클래스를 만들려면 `enum` 키워드를 사용합니다:

```kotlin
enum class State
```

프로세스의 서로 다른 상태를 포함하는 열거형 클래스를 만들고 싶다고 가정해 보겠습니다. 각 열거형 상수는 쉼표(`,`)로 구분해야 합니다:

```kotlin
enum class State {
    IDLE, RUNNING, FINISHED
}
```

`State` 열거형 클래스는 `IDLE`, `RUNNING`, `FINISHED`라는 열거형 상수를 가집니다. 열거형 상수에 접근하려면 클래스 이름 뒤에 `.`과 열거형 상수의 이름을 붙여 사용합니다:

```kotlin
val state = State.RUNNING
```

이 열거형 클래스를 `when` 표현식과 함께 사용하여 열거형 상수의 값에 따라 수행할 동작을 정의할 수 있습니다:

```kotlin
enum class State {
    IDLE, RUNNING, FINISHED
}

fun main() {
    val state = State.RUNNING
    val message = when (state) {
        State.IDLE -> "It's idle"
        State.RUNNING -> "It's running"
        State.FINISHED -> "It's finished"
    }
    println(message)
    // It's running
}
```
{kotlin-runnable="true" id="kotlin-tour-enum-classes"}

열거형 클래스는 일반 클래스와 마찬가지로 프로퍼티와 멤버 함수를 가질 수 있습니다.

예를 들어, HTML 작업을 하면서 몇 가지 색상을 포함하는 열거형 클래스를 만들고 싶다고 가정해 보겠습니다. 각 색상이 16진수 RGB 값을 포함하는 `rgb`라는 프로퍼티를 갖기를 원합니다. 열거형 상수를 생성할 때 이 프로퍼티로 초기화해야 합니다:

```kotlin
enum class Color(val rgb: Int) {
    RED(0xFF0000),
    GREEN(0x00FF00),
    BLUE(0x0000FF),
    YELLOW(0xFFFF00)
}
```

> Kotlin은 16진수를 정수로 저장하므로 `rgb` 프로퍼티는 `String` 타입이 아니라 `Int` 타입입니다.
>
{style="note"}

이 클래스에 멤버 함수를 추가하려면 세미콜론(`;`)으로 열거형 상수와 구분해야 합니다:

```kotlin
enum class Color(val rgb: Int) {
    RED(0xFF0000),
    GREEN(0x00FF00),
    BLUE(0x0000FF),
    YELLOW(0xFFFF00);

    fun containsRed() = (this.rgb and 0xFF0000 != 0)
}

fun main() {
    val red = Color.RED
    
    // 열거형 상수에서 containsRed() 함수를 호출합니다
    println(red.containsRed())
    // true

    // 클래스 이름을 통해 열거형 상수에서 containsRed() 함수를 호출합니다
    println(Color.BLUE.containsRed())
    // false
  
    println(Color.YELLOW.containsRed())
    // true
}
```
{kotlin-runnable="true" id="kotlin-tour-interface-enum-classes-members"}

이 예제에서 `containsRed()` 멤버 함수는 `this` 키워드를 사용하여 열거형 상수의 `rgb` 프로퍼티 값에 접근하고, 16진수 값의 첫 번째 비트에 `FF`가 포함되어 있는지 확인하여 불리언(boolean) 값을 반환합니다.

자세한 내용은 [열거형 클래스(Enum classes)](enum-classes.md)를 참조하세요.

### 인라인 값 클래스 (Inline value classes)

때로는 코드 내에서 클래스로부터 작은 객체를 생성하고 아주 짧은 시간 동안만 사용하고 싶을 때가 있습니다. 이러한 방식은 성능에 영향을 줄 수 있습니다. 인라인 값(inline value) 클래스는 이러한 성능 영향을 피할 수 있는 특별한 유형의 클래스입니다. 단, 인라인 값 클래스는 값만 포함할 수 있습니다.

인라인 값 클래스를 만들려면 `value` 키워드와 `@JvmInline` 어노테이션을 사용합니다:

```kotlin
@JvmInline
value class Email
```

> `@JvmInline` 어노테이션은 코드가 컴파일될 때 최적화하도록 Kotlin에 지시합니다. 더 자세히 알아보려면 [어노테이션(Annotations)](annotations.md)을 참조하세요.
> 
{style="tip"}

인라인 값 클래스는 클래스 헤더에서 초기화되는 **단 하나**의 프로퍼티를 가져야 합니다.

이메일 주소를 수집하는 클래스를 만들고 싶다고 가정해 보겠습니다:

```kotlin
// address 프로퍼티는 클래스 헤더에서 초기화됩니다.
@JvmInline
value class Email(val address: String)

fun sendEmail(email: Email) {
    println("Sending email to ${email.address}")
}

fun main() {
    val myEmail = Email("example@example.com")
    sendEmail(myEmail)
    // Sending email to example@example.com
}
```
{kotlin-runnable="true" id="kotlin-tour-inline-value-class"}

이 예제에서:

* `Email`은 클래스 헤더에 `address`라는 하나의 프로퍼티를 가진 인라인 값 클래스입니다.
* `sendEmail()` 함수는 `Email` 타입의 객체를 받아 표준 출력으로 문자열을 출력합니다.
* `main()` 함수는 다음과 같은 작업을 수행합니다:
    * `myEmail`이라는 `Email` 클래스의 인스턴스를 생성합니다.
    * `myEmail` 객체로 `sendEmail()` 함수를 호출합니다.

인라인 값 클래스를 사용하면 클래스가 인라인화되어 객체를 생성하지 않고도 코드에서 직접 사용할 수 있습니다. 이는 메모리 사용량을 크게 줄이고 코드의 런타임 성능을 향상시킬 수 있습니다.

인라인 값 클래스에 대한 자세한 정보는 [인라인 값 클래스(Inline value classes)](inline-classes.md)를 참조하세요.

## 연습 문제 {completion-point="true"}

### 연습 문제 1 {initial-collapse-state="collapsed" collapsible="true" id="special-classes-exercise-1"}

배송 서비스를 관리하고 있으며 패키지의 상태를 추적하는 방법이 필요합니다. `Pending`, `InTransit`, `Delivered`, `Canceled` 상태를 표현하는 데이터 클래스를 포함하는 `DeliveryStatus`라는 봉인된 클래스를 만드세요. `main()` 함수의 코드가 성공적으로 실행되도록 `DeliveryStatus` 클래스 선언을 완성하세요:

|---|---|

```kotlin
sealed class // 여기에 코드를 작성하세요

fun printDeliveryStatus(status: DeliveryStatus) {
    when (status) {
        is DeliveryStatus.Pending -> {
            println("The package is pending pickup from ${status.sender}.")
        }
        is DeliveryStatus.InTransit -> {
            println("The package is in transit and expected to arrive by ${status.estimatedDeliveryDate}.")
        }
        is DeliveryStatus.Delivered -> {
            println("The package was delivered to ${status.recipient} on ${status.deliveryDate}.")
        }
        is DeliveryStatus.Canceled -> {
            println("The delivery was canceled due to: ${status.reason}.")
        }
    }
}

fun main() {
    val status1: DeliveryStatus = DeliveryStatus.Pending("Alice")
    val status2: DeliveryStatus = DeliveryStatus.InTransit("2024-11-20")
    val status3: DeliveryStatus = DeliveryStatus.Delivered("2024-11-18", "Bob")
    val status4: DeliveryStatus = DeliveryStatus.Canceled("Address not found")

    printDeliveryStatus(status1)
    // The package is pending pickup from Alice.
    printDeliveryStatus(status2)
    // The package is in transit and expected to arrive by 2024-11-20.
    printDeliveryStatus(status3)
    // The package was delivered to Bob on 2024-11-18.
    printDeliveryStatus(status4)
    // The delivery was canceled due to: Address not found.
}
```
{validate="false" kotlin-runnable="true" kotlin-min-compiler-version="1.3" id="kotlin-tour-special-classes-exercise-1"}

|---|---|
```kotlin
sealed class DeliveryStatus {
    data class Pending(val sender: String) : DeliveryStatus()
    data class InTransit(val estimatedDeliveryDate: String) : DeliveryStatus()
    data class Delivered(val deliveryDate: String, val recipient: String) : DeliveryStatus()
    data class Canceled(val reason: String) : DeliveryStatus()
}

fun printDeliveryStatus(status: DeliveryStatus) {
    when (status) {
        is DeliveryStatus.Pending -> {
            println("The package is pending pickup from ${status.sender}.")
        }
        is DeliveryStatus.InTransit -> {
            println("The package is in transit and expected to arrive by ${status.estimatedDeliveryDate}.")
        }
        is DeliveryStatus.Delivered -> {
            println("The package was delivered to ${status.recipient} on ${status.deliveryDate}.")
        }
        is DeliveryStatus.Canceled -> {
            println("The delivery was canceled due to: ${status.reason}.")
        }
    }
}

fun main() {
    val status1: DeliveryStatus = DeliveryStatus.Pending("Alice")
    val status2: DeliveryStatus = DeliveryStatus.InTransit("2024-11-20")
    val status3: DeliveryStatus = DeliveryStatus.Delivered("2024-11-18", "Bob")
    val status4: DeliveryStatus = DeliveryStatus.Canceled("Address not found")

    printDeliveryStatus(status1)
    // The package is pending pickup from Alice.
    printDeliveryStatus(status2)
    // The package is in transit and expected to arrive by 2024-11-20.
    printDeliveryStatus(status3)
    // The package was delivered to Bob on 2024-11-18.
    printDeliveryStatus(status4)
    // The delivery was canceled due to: Address not found.
}
```
{initial-collapse-state="collapsed" collapsible="true" collapsed-title="모범 답안" id="kotlin-tour-special-classes-solution-1"}

### 연습 문제 2 {initial-collapse-state="collapsed" collapsible="true" id="special-classes-exercise-2"}

프로그램에서 다양한 상태와 오류 유형을 처리하고 싶습니다. 데이터 클래스나 객체로 선언된 서로 다른 상태를 캡처하기 위한 봉인된 클래스가 있습니다. `NETWORK`, `TIMEOUT`, `UNKNOWN`이라는 서로 다른 문제 유형을 나타내는 `Problem`이라는 열거형 클래스를 생성하여 아래 코드를 완성하세요.

|---|---|

```kotlin
sealed class Status {
    data object Loading : Status()
    data class Error(val problem: Problem) : Status() {
        // 여기에 코드를 작성하세요
    }

    data class OK(val data: List<String>) : Status()
}

fun handleStatus(status: Status) {
    when (status) {
        is Status.Loading -> println("Loading...")
        is Status.OK -> println("Data received: ${status.data}")
        is Status.Error -> when (status.problem) {
            Status.Error.Problem.NETWORK -> println("Network issue")
            Status.Error.Problem.TIMEOUT -> println("Request timed out")
            Status.Error.Problem.UNKNOWN -> println("Unknown error occurred")
        }
    }
}

fun main() {
    val status1: Status = Status.Error(Status.Error.Problem.NETWORK)
    val status2: Status = Status.OK(listOf("Data1", "Data2"))

    handleStatus(status1)
    // Network issue
    handleStatus(status2)
    // Data received: [Data1, Data2]
}
```
{validate="false" kotlin-runnable="true" kotlin-min-compiler-version="1.3" id="kotlin-tour-special-classes-exercise-2"}

|---|---|
```kotlin
sealed class Status {
    data object Loading : Status()
    data class Error(val problem: Problem) : Status() {
        enum class Problem {
            NETWORK,
            TIMEOUT,
            UNKNOWN
        }
    }

    data class OK(val data: List<String>) : Status()
}

fun handleStatus(status: Status) {
    when (status) {
        is Status.Loading -> println("Loading...")
        is Status.OK -> println("Data received: ${status.data}")
        is Status.Error -> when (status.problem) {
            Status.Error.Problem.NETWORK -> println("Network issue")
            Status.Error.Problem.TIMEOUT -> println("Request timed out")
            Status.Error.Problem.UNKNOWN -> println("Unknown error occurred")
        }
    }
}

fun main() {
    val status1: Status = Status.Error(Status.Error.Problem.NETWORK)
    val status2: Status = Status.OK(listOf("Data1", "Data2"))

    handleStatus(status1)
    // Network issue
    handleStatus(status2)
    // Data received: [Data1, Data2]
}
```
{initial-collapse-state="collapsed" collapsible="true" collapsed-title="모범 답안" id="kotlin-tour-special-classes-solution-2"}

<seealso></seealso>

<list columns="2" id="tour-nav">
  <li>
    <a as="button" href="kotlin-tour-intermediate-objects.md" mode="outline" icon="arrow-left" icon-position="left">이전 단계</a>
  </li>
  <li>
    <a as="button" href="kotlin-tour-intermediate-properties.md" mode="classic" icon="arrow-right" icon-position="right">다음 단계</a>
  </li>
</list>