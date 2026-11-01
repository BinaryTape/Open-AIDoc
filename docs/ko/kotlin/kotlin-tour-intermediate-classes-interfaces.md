[//]: # (title: 클래스와 인터페이스)

<no-index/>

입문 튜토리얼에서는 클래스와 데이터 클래스를 사용하여 데이터를 저장하고, 코드에서 공유할 수 있는 특성들의 모음을 유지 관리하는 방법을 배웠습니다. 개발을 진행하다 보면 프로젝트 내에서 코드를 효율적으로 공유하기 위해 계층 구조를 만들고 싶어질 것입니다. 이 장에서는 코드를 공유하기 위해 Kotlin이 제공하는 옵션들과, 이러한 옵션들이 어떻게 코드를 더 안전하고 유지 관리하기 쉽게 만들어 주는지 설명합니다.

## 클래스 상속 {id="class-inheritance"}

이전 장에서는 원본 소스 코드를 수정하지 않고 확장 함수를 사용하여 클래스를 확장하는 방법을 살펴보았습니다. 하지만 클래스 **간에** 코드를 공유하는 것이 유용한 복잡한 작업을 할 때는 어떻게 해야 할까요? 이러한 경우 클래스 상속을 사용할 수 있습니다.

기본적으로 Kotlin의 클래스는 상속될 수 없습니다. Kotlin은 의도치 않은 상속을 방지하고 클래스를 더 쉽게 유지 관리할 수 있도록 이렇게 설계되었습니다.

Kotlin 클래스는 **단일 상속(single inheritance)**만 지원하므로, **한 번에 하나의 클래스**로부터만 상속받을 수 있습니다. 상속해 주는 이 클래스를 **부모(parent)** 클래스라고 합니다.

한 클래스의 부모가 또 다른 클래스(조부모)로부터 상속받아 계층 구조를 형성합니다. Kotlin의 클래스 계층 구조 최상위에는 공통 부모 클래스인 `Any`가 있습니다. 모든 클래스는 궁극적으로 `Any` 클래스를 상속받습니다.

![Any 타입을 포함한 클래스 계층 구조 예시](any-type-class.png){width="200"}

`Any` 클래스는 멤버 함수로 `toString()` 함수를 자동으로 제공합니다. 따라서 상속받은 이 함수를 모든 클래스에서 사용할 수 있습니다. 예를 들면 다음과 같습니다.

```kotlin
class Car(val make: String, val model: String, val numberOfDoors: Int)

fun main() {
    //sampleStart
    val car1 = Car("Toyota", "Corolla", 4)

    // Uses the .toString() function via string templates to print class properties
    println("Car1: make=${car1.make}, model=${car1.model}, numberOfDoors=${car1.numberOfDoors}")
    // Car1: make=Toyota, model=Corolla, numberOfDoors=4
    //sampleEnd
}
```
{kotlin-runnable="true" id="kotlin-tour-any-class"}

클래스 간에 일부 코드를 공유하기 위해 상속을 사용하려는 경우, 먼저 추상 클래스 사용을 고려해 보세요.

### 추상 클래스 {id="abstract-classes"}

추상 클래스는 기본적으로 상속이 가능합니다. 추상 클래스의 목적은 다른 클래스가 상속하거나 구현할 멤버를 제공하는 것입니다. 따라서 추상 클래스는 생성자를 가지지만, 직접 인스턴스를 생성할 수는 없습니다. 자식(child) 클래스 내에서는 `override` 키워드를 사용하여 부모의 프로퍼티와 함수의 동작을 정의합니다. 이렇게 자식 클래스가 부모 클래스의 멤버를 "오버라이드(재정의)"한다고 말합니다.

> 상속받은 함수나 프로퍼티의 동작을 정의하는 것을 **구현(implementation)**이라고 합니다.
> 
{style="tip"}

추상 클래스는 구현이 **있는** 함수 및 프로퍼티뿐만 아니라, 추상 함수 및 추상 프로퍼티로 알려진 구현이 **없는** 함수 및 프로퍼티도 포함할 수 있습니다.

추상 클래스를 만들려면 `abstract` 키워드를 사용합니다.

```kotlin
abstract class Animal
```

구현이 **없는** 함수나 프로퍼티를 선언할 때도 `abstract` 키워드를 사용합니다.

```kotlin
abstract fun makeSound()
abstract val sound: String
```

예를 들어, 서로 다른 제품 카테고리를 정의하기 위해 자식 클래스를 만들 수 있는 `Product`라는 추상 클래스를 생성한다고 가정해 보겠습니다.

```kotlin
abstract class Product(val name: String, var price: Double) {
    // Abstract property for the product category
    abstract val category: String

    // A function that can be shared by all products
    fun productInfo(): String {
        return "Product: $name, Category: $category, Price: $price"
    }
}
```

이 추상 클래스에는 다음이 포함되어 있습니다.

* 제품의 `name`과 `price`를 받는 두 개의 생성자 파라미터가 있습니다.
* 제품 카테고리를 문자열로 담는 추상 프로퍼티가 있습니다.
* 제품에 대한 정보를 출력하는 함수가 있습니다.

이제 전자 제품을 위한 자식 클래스를 만들어 보겠습니다. 자식 클래스에서 `category` 프로퍼티의 구현을 정의하기 전에 반드시 `override` 키워드를 사용해야 합니다.

```kotlin
class Electronic(name: String, price: Double, val warranty: Int) : Product(name, price) {
    override val category = "Electronic"
}
```

`Electronic` 클래스는 다음과 같습니다.

* `Product` 추상 클래스를 상속합니다.
* 전자 제품에 특화된 생성자의 추가 파라미터인 `warranty`를 갖습니다.
* `category` 프로퍼티를 오버라이드하여 `"Electronic"` 문자열을 갖도록 합니다.

이제 이러한 클래스들을 다음과 같이 사용할 수 있습니다.

```kotlin
abstract class Product(val name: String, var price: Double) {
    // Abstract property for the product category
    abstract val category: String

    // A function that can be shared by all products
    fun productInfo(): String {
        return "Product: $name, Category: $category, Price: $price"
    }
}

class Electronic(name: String, price: Double, val warranty: Int) : Product(name, price) {
    override val category = "Electronic"
}

//sampleStart
fun main() {
    // Creates an instance of the Electronic class
    val laptop = Electronic(name = "Laptop", price = 1000.0, warranty = 2)

    println(laptop.productInfo())
    // Product: Laptop, Category: Electronic, Price: 1000.0
}
//sampleEnd
```
{kotlin-runnable="true" id="kotlin-tour-abstract-class"}

추상 클래스는 이러한 방식으로 코드를 공유하기에 훌륭하지만, Kotlin의 클래스가 단일 상속만 지원하기 때문에 제한적입니다. 만약 여러 소스로부터 상속을 받아야 한다면 인터페이스 사용을 고려해 보세요.

## 인터페이스 {id="interfaces"}

인터페이스는 클래스와 유사하지만 몇 가지 차이점이 있습니다.

* 인터페이스의 인스턴스는 생성할 수 없습니다. 생성자나 헤더가 없습니다.
* 인터페이스의 함수와 프로퍼티는 기본적으로 암시적 상속이 가능합니다. Kotlin에서는 이를 "열려 있다(open)"고 표현합니다.
* 구현을 제공하지 않더라도 함수를 `abstract`로 표시할 필요가 없습니다.

추상 클래스와 마찬가지로 인터페이스를 사용하여 나중에 클래스가 상속하고 구현할 수 있는 함수와 프로퍼티 집합을 정의합니다. 이러한 접근 방식은 구체적인 구현 세부 정보보다는 인터페이스가 설명하는 추상화에 집중할 수 있도록 도와줍니다. 인터페이스를 사용하면 코드가 다음과 같이 개선됩니다.

* 서로 다른 부분을 격리하여 독립적으로 발전시킬 수 있으므로 **더 모듈화**됩니다.
* 관련된 기능들을 응집력 있는 세트로 그룹화하여 **이해하기 더 쉬워집니다**.
* 테스트를 위해 구현을 모의 객체(mock)로 빠르게 교체할 수 있으므로 **테스트하기 더 쉬워집니다**.

인터페이스를 선언하려면 `interface` 키워드를 사용합니다.

```kotlin
interface PaymentMethod
```

### 인터페이스 구현 {id="interface-implementation"}

인터페이스는 다중 상속을 지원하므로 하나의 클래스가 여러 인터페이스를 동시에 구현할 수 있습니다. 먼저 클래스가 **하나의** 인터페이스를 구현하는 시나리오를 살펴보겠습니다.

인터페이스를 구현하는 클래스를 만들려면 클래스 헤더 뒤에 콜론을 추가하고 구현하려는 인터페이스 이름을 지정합니다. 인터페이스에는 생성자가 없으므로 인터페이스 이름 뒤에 괄호 `()`를 사용하지 않습니다.

```kotlin
class CreditCardPayment : PaymentMethod
```

예를 들면 다음과 같습니다.

```kotlin
interface PaymentMethod {
    // Functions are inheritable by default
    fun initiatePayment(amount: Double): String
}

class CreditCardPayment(val cardNumber: String, val cardHolderName: String, val expiryDate: String) : PaymentMethod {
    override fun initiatePayment(amount: Double): String {
        // Simulate processing payment with credit card
        return "Payment of $$amount initiated using Credit Card ending in ${cardNumber.takeLast(4)}."
    }
}

fun main() {
    val paymentMethod = CreditCardPayment("1234 5678 9012 3456", "John Doe", "12/25")
    println(paymentMethod.initiatePayment(100.0))
    // Payment of $100.0 initiated using Credit Card ending in 3456.
}
```
{kotlin-runnable="true" id="kotlin-tour-interface-inheritance"}

이 예제에서:

* `PaymentMethod`는 구현이 없는 `initiatePayment()` 함수를 가진 인터페이스입니다.
* `CreditCardPayment`는 `PaymentMethod` 인터페이스를 구현하는 클래스입니다.
* `CreditCardPayment` 클래스는 상속받은 `initiatePayment()` 함수를 오버라이드합니다.
* `paymentMethod`는 `CreditCardPayment` 클래스의 인스턴스입니다.
* `paymentMethod` 인스턴스에서 `100.0` 파라미터와 함께 오버라이드된 `initiatePayment()` 함수가 호출됩니다.

**여러** 인터페이스를 구현하는 클래스를 만들려면 클래스 헤더 뒤에 콜론을 추가하고 구현하려는 인터페이스들의 이름을 쉼표로 구분하여 나열합니다.

```kotlin
class CreditCardPayment : PaymentMethod, PaymentType
```

예를 들면 다음과 같습니다.

```kotlin
interface PaymentMethod {
    fun initiatePayment(amount: Double): String
}

interface PaymentType {
    val paymentType: String
}

class CreditCardPayment(val cardNumber: String, val cardHolderName: String, val expiryDate: String) : PaymentMethod,
    PaymentType {
    override fun initiatePayment(amount: Double): String {
        // Simulate processing payment with credit card
        return "Payment of $$amount initiated using Credit Card ending in ${cardNumber.takeLast(4)}."
    }

    override val paymentType: String = "Credit Card"
}

fun main() {
    val paymentMethod = CreditCardPayment("1234 5678 9012 3456", "John Doe", "12/25")
    println(paymentMethod.initiatePayment(100.0))
    // Payment of $100.0 initiated using Credit Card ending in 3456.

    println("Payment is by ${paymentMethod.paymentType}")
    // Payment is by Credit Card
}
```
{kotlin-runnable="true" id="kotlin-tour-interface-multiple-inheritance"}

이 예제에서:

* `PaymentMethod`는 구현이 없는 `initiatePayment()` 함수를 가진 인터페이스입니다.
* `PaymentType`은 초기화되지 않은 `paymentType` 프로퍼티를 가진 인터페이스입니다.
* `CreditCardPayment`는 `PaymentMethod` 및 `PaymentType` 인터페이스를 구현하는 클래스입니다.
* `CreditCardPayment` 클래스는 상속받은 `initiatePayment()` 함수와 `paymentType` 프로퍼티를 오버라이드합니다.
* `paymentMethod`는 `CreditCardPayment` 클래스의 인스턴스입니다.
* `paymentMethod` 인스턴스에서 `100.0` 파라미터와 함께 오버라이드된 `initiatePayment()` 함수가 호출됩니다.
* `paymentMethod` 인스턴스에서 오버라이드된 `paymentType` 프로퍼티에 접근합니다.

인터페이스 및 인터페이스 상속에 대한 자세한 내용은 [인터페이스](interfaces.md)를 참고하세요.

## 위임 {id="delegation"}

인터페이스는 유용하지만, 인터페이스에 많은 함수가 포함되어 있으면 자식 클래스에 많은 양의 보일러플레이트 코드(boilerplate code)가 생길 수 있습니다. 클래스 동작의 일부분만 재정의하고 싶을 때도 많은 코드를 반복해서 작성해야 합니다.

> 보일러플레이트 코드란 소프트웨어 프로젝트의 여러 부분에서 거의 또는 전혀 수정하지 않고 재사용되는 코드 조각을 의미합니다.
> 
{style="tip"}

예를 들어, 여러 함수와 `color`라는 프로퍼티 하나를 포함하는 `DrawingTool`이라는 인터페이스가 있다고 가정해 보겠습니다.

```kotlin
interface DrawingTool {
    val color: String
    fun draw(shape: String)
    fun erase(area: String)
    fun getToolInfo(): String
}
```

`DrawingTool` 인터페이스를 구현하고 모든 멤버에 대한 구현을 제공하는 `PenTool` 클래스를 만듭니다.

```kotlin
class PenTool : DrawingTool {
    override val color: String = "black"

    override fun draw(shape: String) {
        println("Drawing $shape using a pen in $color")
    }

    override fun erase(area: String) {
        println("Erasing $area with pen tool")
    }

    override fun getToolInfo(): String {
        return "PenTool(color=$color)"
    }
}
```

`PenTool`과 동작은 같지만 `color` 값만 다른 클래스를 만들고 싶다고 해보겠습니다. 한 가지 방법은 `PenTool` 클래스 인스턴스처럼 `DrawingTool` 인터페이스를 구현하는 객체를 파라미터로 받는 새 클래스를 만드는 것입니다. 그런 다음 클래스 내부에서 `color` 프로퍼티를 오버라이드할 수 있습니다.

하지만 이 시나리오에서는 `DrawingTool` 인터페이스의 각 멤버에 대한 구현을 모두 추가해야 합니다.

```kotlin
interface DrawingTool {
    val color: String
    fun draw(shape: String)
    fun erase(area: String)
    fun getToolInfo(): String
}

class PenTool : DrawingTool {
    override val color: String = "black"

    override fun draw(shape: String) {
        println("Drawing $shape using a pen in $color")
    }

    override fun erase(area: String) {
        println("Erasing $area with pen tool")
    }

    override fun getToolInfo(): String {
        return "PenTool(color=$color)"
    }
}
//sampleStart
class CanvasSession(val tool: DrawingTool) : DrawingTool {
    override val color: String = "blue"

    override fun draw(shape: String) {
        tool.draw(shape)
    }

    override fun erase(area: String) {
        tool.erase(area)
    }

    override fun getToolInfo(): String {
        return tool.getToolInfo()
    }
}
//sampleEnd
fun main() {
    val pen = PenTool()
    val session = CanvasSession(pen)

    println("Pen color: ${pen.color}")
    // Pen color: black

    println("Session color: ${session.color}")
    // Session color: blue

    session.draw("circle")
    // Drawing circle with pen in black

    session.erase("top-left corner")
    // Erasing top-left corner with pen tool

    println(session.getToolInfo())
    // PenTool(color=black)
}
```
{kotlin-runnable="true" id="kotlin-tour-interface-non-delegation"}

`DrawingTool` 인터페이스에 멤버 함수가 많다면 `CanvasSession` 클래스의 보일러플레이트 코드 양이 매우 많아질 수 있음을 알 수 있습니다. 하지만 대안이 있습니다.

Kotlin에서는 `by` 키워드를 사용하여 인터페이스 구현을 클래스 인스턴스에 위임할 수 있습니다. 예를 들면 다음과 같습니다.

```kotlin
class CanvasSession(val tool: DrawingTool) : DrawingTool by tool
```

여기서 `tool`은 멤버 함수의 구현을 위임받는 `PenTool` 클래스 인스턴스의 이름입니다.

이제 `CanvasSession` 클래스에서 멤버 함수에 대한 구현을 추가할 필요가 없습니다. 컴파일러가 `PenTool` 클래스를 바탕으로 이를 자동으로 처리해 줍니다. 덕분에 많은 보일러플레이트 코드를 작성하지 않아도 됩니다. 대신 자식 클래스에서 변경하려는 동작에 대한 코드만 추가하면 됩니다.

예를 들어 `color` 프로퍼티의 값을 변경하려는 경우:

```kotlin
interface DrawingTool {
    val color: String
    fun draw(shape: String)
    fun erase(area: String)
    fun getToolInfo(): String
}

class PenTool : DrawingTool {
    override val color: String = "black"

    override fun draw(shape: String) {
        println("Drawing $shape using a pen in $color")
    }

    override fun erase(area: String) {
        println("Erasing $area with pen tool")
    }

    override fun getToolInfo(): String {
        return "PenTool(color=$color)"
    }
}

//sampleStart
class CanvasSession(val tool: DrawingTool) : DrawingTool by tool {
    // No boilerplate code!
    override val color: String = "blue"
}
//sampleEnd
fun main() {
    val pen = PenTool()
    val session = CanvasSession(pen)

    println("Pen color: ${pen.color}")
    // Pen color: black

    println("Session color: ${session.color}")
    // Session color: blue

    session.draw("circle")
    // Drawing circle with pen in black

    session.erase("top-left corner")
    // Erasing top-left corner with pen tool

    println(session.getToolInfo())
    // PenTool(color=black)
}
```
{kotlin-runnable="true" id="kotlin-tour-interface-delegation"}

원하는 경우 `CanvasSession` 클래스에서 상속받은 멤버 함수의 동작을 오버라이드할 수도 있지만, 이제 상속받은 모든 멤버 함수마다 새로운 코드 줄을 추가할 필요는 없습니다.

자세한 내용은 [위임(Delegation)](delegation.md)을 참고하세요.

## 연습 문제 {completion-point="true" id="practice"}

<deflist appearance="clear" collapsible="true" numbered="true">
<def title="추상 클래스를 사용하여 스마트 디바이스 구현하기" id="classes-interfaces-exercise-1">

스마트 홈 시스템을 개발하고 있다고 상상해 보세요. 일반적인 스마트 홈에는 기본적인 기능을 공유하면서도 각각 고유한 동작을 가진 다양한 유형의 기기가 있습니다. 아래 코드 샘플에서 자식 클래스인 `SmartLight`가 성공적으로 컴파일될 수 있도록 `SmartDevice`라는 `abstract` 클래스를 완성하세요.

그런 다음 `SmartDevice` 클래스를 상속받고, 어떤 온도 조절기가 가열 중이거나 꺼져 있는지를 설명하는 출력문을 반환하는 `turnOn()` 및 `turnOff()` 함수를 구현한 또 다른 자식 클래스 `SmartThermostat`를 생성하세요. 마지막으로 온도 측정값을 입력받아 다음과 같이 출력하는 `adjustTemperature()` 함수를 추가하세요.
`$name thermostat set to $temperature°C.`

<deflist collapsible="true">
    <def title="힌트">
        <code>SmartDevice</code> 클래스에 <code>turnOn()</code>과 <code>turnOff()</code> 함수를 추가하여 나중에 <code>SmartThermostat</code> 클래스에서 그 동작을 오버라이드할 수 있도록 하세요.
    </def>
</deflist>

```kotlin
abstract class // Write your code here

class SmartLight(name: String) : SmartDevice(name) {
    override fun turnOn() {
        println("$name is now ON.")
    }

    override fun turnOff() {
        println("$name is now OFF.")
    }

   fun adjustBrightness(level: Int) {
        println("Adjusting $name brightness to $level%.")
    }
}

class SmartThermostat // Write your code here

fun main() {
    val livingRoomLight = SmartLight("Living Room Light")
    val bedroomThermostat = SmartThermostat("Bedroom Thermostat")
    
    livingRoomLight.turnOn()
    // Living Room Light is now ON.
    livingRoomLight.adjustBrightness(10)
    // Adjusting Living Room Light brightness to 10%.
    livingRoomLight.turnOff()
    // Living Room Light is now OFF.

    bedroomThermostat.turnOn()
    // Bedroom Thermostat thermostat is now heating.
    bedroomThermostat.adjustTemperature(5)
    // Bedroom Thermostat thermostat set to 5°C.
    bedroomThermostat.turnOff()
    // Bedroom Thermostat thermostat is now off.
}
```
{kotlin-runnable="true" kotlin-target-platform="exercise" kotlin-hidden-files="ExerciseUtils.kt,tour/intermediate/SmartDeviceTest.kt" validate="false" id="kotlin-tour-classes-interfaces-exercise-1"}

```kotlin
abstract class SmartDevice(val name: String) {
    abstract fun turnOn()
    abstract fun turnOff()
}

class SmartLight(name: String) : SmartDevice(name) {
    override fun turnOn() {
        println("$name is now ON.")
    }

    override fun turnOff() {
        println("$name is now OFF.")
    }

   fun adjustBrightness(level: Int) {
        println("Adjusting $name brightness to $level%.")
    }
}

class SmartThermostat(name: String) : SmartDevice(name) {
    override fun turnOn() {
        println("$name thermostat is now heating.")
    }

    override fun turnOff() {
        println("$name thermostat is now off.")
    }

   fun adjustTemperature(temperature: Int) {
        println("$name thermostat set to $temperature°C.")
    }
}

fun main() {
    val livingRoomLight = SmartLight("Living Room Light")
    val bedroomThermostat = SmartThermostat("Bedroom Thermostat")
    
    livingRoomLight.turnOn()
    // Living Room Light is now ON.
    livingRoomLight.adjustBrightness(10)
    // Adjusting Living Room Light brightness to 10%.
    livingRoomLight.turnOff()
    // Living Room Light is now OFF.

    bedroomThermostat.turnOn()
    // Bedroom Thermostat thermostat is now heating.
    bedroomThermostat.adjustTemperature(5)
    // Bedroom Thermostat thermostat set to 5°C.
    bedroomThermostat.turnOff()
    // Bedroom Thermostat thermostat is now off.
}
```
{kotlin-runnable="true" kotlin-target-platform="exercise" kotlin-hidden-files="ExerciseUtils.kt,tour/intermediate/SmartDeviceTest.kt" initial-collapse-state="collapsed" collapsible="true" collapsed-title="모범 답안" id="kotlin-tour-classes-interfaces-solution-1"}

</def>
<def title="미디어 인터페이스 구현하기" id="classes-interfaces-exercise-2">

`Audio`, `Video`, `Podcast`와 같은 특정 미디어 클래스를 구현하는 데 사용할 수 있는 `Media` 인터페이스를 만드세요. 인터페이스에는 다음이 포함되어야 합니다.

* 미디어의 제목을 나타내는 `title` 프로퍼티
* 미디어를 재생하는 `play()` 함수

그런 다음 `Media` 인터페이스를 구현하는 `Audio` 클래스를 만드세요. `Audio` 클래스는 생성자에서 `title` 프로퍼티를 사용해야 하며, `String` 타입의 `composer`라는 추가 프로퍼티를 가져야 합니다. 클래스 내부에서 `play()` 함수를 구현하여 다음을 출력하도록 하세요: `"Playing audio: $title, composed by $composer"`

<deflist collapsible="true">
    <def title="힌트">
        생성자에서 인터페이스의 프로퍼티를 구현하기 위해 클래스 헤더에서 <code>override</code> 키워드를 사용할 수 있습니다.
    </def>
</deflist>

```kotlin
interface // Write your code here

class // Write your code here

fun main() {
    val audio = Audio("Symphony No. 5", "Beethoven")
    audio.play()
   // Playing audio: Symphony No. 5, composed by Beethoven
}
```
{kotlin-runnable="true" kotlin-target-platform="exercise" kotlin-hidden-files="ExerciseUtils.kt,tour/intermediate/AudioTest.kt" validate="false" id="kotlin-tour-classes-interfaces-exercise-2"}

```kotlin
interface Media {
    val title: String
    fun play()
}

class Audio(override val title: String, val composer: String) : Media {
    override fun play() {
        println("Playing audio: $title, composed by $composer")
    }
}

fun main() {
    val audio = Audio("Symphony No. 5", "Beethoven")
    audio.play()
   // Playing audio: Symphony No. 5, composed by Beethoven
}
```
{kotlin-runnable="true" kotlin-target-platform="exercise" kotlin-hidden-files="ExerciseUtils.kt,tour/intermediate/AudioTest.kt" initial-collapse-state="collapsed" collapsible="true" collapsed-title="모범 답안" id="kotlin-tour-classes-interfaces-solution-2"}

</def>
<def title="인터페이스와 추상 클래스 함께 사용하기" id="classes-interfaces-exercise-3">

전자상거래 애플리케이션을 위한 결제 처리 시스템을 구축하고 있습니다. 각 결제 수단은 결제를 승인하고 거래를 처리할 수 있어야 합니다. 일부 결제는 환불도 처리할 수 있어야 합니다.

1. `Refundable` 인터페이스에 환불을 처리하는 `refund()` 함수를 추가하세요.

2. `PaymentMethod` 추상 클래스에서:
   * 금액을 받아 해당 금액이 포함된 메시지를 출력하는 `authorize()` 함수를 추가하세요.
   * 마찬가지로 금액을 받는 `processPayment()` 추상 함수를 추가하세요.

3. `Refundable` 인터페이스와 `PaymentMethod` 추상 클래스를 구현하는 `CreditCard` 클래스를 만드세요. 이 클래스에서 `refund()` 및 `processPayment()` 함수의 구현을 추가하여 다음 문장을 출력하도록 하세요.
   * `"Refunding $amount to the credit card."`
   * `"Processing credit card payment of $amount."`

```kotlin
interface Refundable {
    // Write your code here
}

abstract class PaymentMethod(val name: String) {
    // Write your code here
}

class CreditCard // Write your code here

fun main() {
    val visa = CreditCard("Visa")
    
    visa.authorize(100.0)
    // Authorizing payment of $100.0.
    visa.processPayment(100.0)
    // Processing credit card payment of $100.0.
    visa.refund(50.0)
    // Refunding $50.0 to the credit card.
}
```
{kotlin-runnable="true" kotlin-target-platform="exercise" kotlin-hidden-files="ExerciseUtils.kt,tour/intermediate/CreditCardTest.kt" validate="false" id="kotlin-tour-classes-interfaces-exercise-3"}

```kotlin
interface Refundable {
    fun refund(amount: Double)
}

abstract class PaymentMethod(val name: String) {
    fun authorize(amount: Double) {
        println("Authorizing payment of $$amount.")
    }

    abstract fun processPayment(amount: Double)
}

class CreditCard(name: String) : PaymentMethod(name), Refundable {
    override fun processPayment(amount: Double) {
        println("Processing credit card payment of $$amount.")
    }

    override fun refund(amount: Double) {
        println("Refunding $$amount to the credit card.")
    }
}

fun main() {
    val visa = CreditCard("Visa")
    
    visa.authorize(100.0)
    // Authorizing payment of $100.0.
    visa.processPayment(100.0)
    // Processing credit card payment of $100.0.
    visa.refund(50.0)
    // Refunding $50.0 to the credit card.
}
```
{kotlin-runnable="true" kotlin-target-platform="exercise" kotlin-hidden-files="ExerciseUtils.kt,tour/intermediate/CreditCardTest.kt" initial-collapse-state="collapsed" collapsible="true" collapsed-title="모범 답안" id="kotlin-tour-classes-interfaces-solution-3"}

</def>
<def title="인터페이스 위임으로 동작 커스터마이징하기" id="classes-interfaces-exercise-4">

기본적인 기능이 있는 간단한 메시징 앱이 있으며, 코드를 크게 중복하지 않고 _스마트_ 메시지를 위한 기능을 추가하려고 합니다.

아래 코드에서 `Messenger` 인터페이스를 상속받되 구현을 `BasicMessenger` 클래스의 인스턴스에 위임하는 `SmartMessenger` 클래스를 정의하세요.

`SmartMessenger` 클래스에서 스마트 메시지를 전송하도록 `sendMessage()` 함수를 오버라이드하세요. 이 함수는 `message`를 입력받아 `"Sending a smart message: $message"`라는 문장을 출력해야 합니다. 또한 `BasicMessenger` 클래스의 `sendMessage()` 함수를 호출하고 메시지 앞에 `[smart]` 접두사를 붙이세요.

> `SmartMessenger` 클래스에서 `receiveMessage()` 함수를 다시 작성할 필요는 없습니다.
> 
{style="note"}

```kotlin
interface Messenger {
    fun sendMessage(message: String)
    fun receiveMessage(): String
}

class BasicMessenger : Messenger {
    override fun sendMessage(message: String) {
        println("Sending message: $message")
    }

    override fun receiveMessage(): String {
        return "You've got a new message!"
    }
}

class SmartMessenger // Write your code here

fun main() {
    val basicMessenger = BasicMessenger()
    val smartMessenger = SmartMessenger(basicMessenger)
    
    basicMessenger.sendMessage("Hello!")
    // Sending message: Hello!
    println(smartMessenger.receiveMessage())
    // You've got a new message!
    smartMessenger.sendMessage("Hello from SmartMessenger!")
    // Sending a smart message: Hello from SmartMessenger!
    // Sending message: [smart] Hello from SmartMessenger!
}
```
{kotlin-runnable="true" kotlin-target-platform="exercise" kotlin-hidden-files="ExerciseUtils.kt,tour/intermediate/SmartMessengerTest.kt" validate="false" id="kotlin-tour-classes-interfaces-exercise-4"}

```kotlin
interface Messenger {
    fun sendMessage(message: String)
    fun receiveMessage(): String
}

class BasicMessenger : Messenger {
    override fun sendMessage(message: String) {
        println("Sending message: $message")
    }

    override fun receiveMessage(): String {
        return "You've got a new message!"
    }
}

class SmartMessenger(val basicMessenger: BasicMessenger) : Messenger by basicMessenger {
    override fun sendMessage(message: String) {
        println("Sending a smart message: $message")
        basicMessenger.sendMessage("[smart] $message")
    }
}

fun main() {
    val basicMessenger = BasicMessenger()
    val smartMessenger = SmartMessenger(basicMessenger)
    
    basicMessenger.sendMessage("Hello!")
    // Sending message: Hello!
    println(smartMessenger.receiveMessage())
    // You've got a new message!
    smartMessenger.sendMessage("Hello from SmartMessenger!")
    // Sending a smart message: Hello from SmartMessenger!
    // Sending message: [smart] Hello from SmartMessenger!
}
```
{kotlin-runnable="true" kotlin-target-platform="exercise" kotlin-hidden-files="ExerciseUtils.kt,tour/intermediate/SmartMessengerTest.kt" initial-collapse-state="collapsed" collapsible="true" collapsed-title="모범 답안" id="kotlin-tour-classes-interfaces-solution-4"}

</def>
</deflist>

<seealso></seealso>

<list columns="2" id="tour-nav">
  <li>
    <a as="button" href="kotlin-tour-intermediate-lambdas-receiver.md" mode="outline" icon="arrow-left" icon-position="left">이전 단계</a>
  </li>
  <li>
    <a as="button" href="kotlin-tour-intermediate-objects.md" mode="classic" icon="arrow-right" icon-position="right">다음 단계</a>
  </li>
</list>