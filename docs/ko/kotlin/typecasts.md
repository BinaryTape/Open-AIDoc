[//]: # (title: 타입 검사 및 캐스트)

Kotlin에서는 런타임에 타입과 관련하여 두 가지 작업을 할 수 있습니다. 객체가 특정 타입인지 확인하거나, 객체를 다른 타입으로 변환하는 것입니다.
타입 **검사(check)**는 다루고 있는 객체의 종류를 확인하는 데 도움이 되며, 타입 **캐스트(cast)**는 객체를 다른 타입으로 변환하려고 시도합니다.

> 제네릭(generics) 타입 검사 및 캐스트(예: `List<T>`, `Map<K,V>`)에 대해 구체적으로 알아보려면 [제네릭 타입 검사 및 캐스트](generics.md#generics-type-checks-and-casts)를 참고하세요.
>
{style="tip"}

## `is` 및 `!is` 연산자를 사용한 검사 {id="is-and-is-operators"}

런타임에 객체가 특정 타입과 일치하는지 확인하려면 `is` 연산자(또는 부정을 위한 `!is`)를 사용하세요.

```kotlin
fun main() {
    val input: Any = "Hello, Kotlin"

    if (input is String) {
        println("Message length: ${input.length}")
        // Message length: 13
    }

    if (input !is String) { // !(input is String)과 동일
        println("Input is not a valid message")
    } else {
        println("Processing message: ${input.length} characters")
        // Processing message: 13 characters
    }
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3" id="kotlin-typecasts-is-operator"}

`is` 및 `!is` 연산자를 사용하여 객체가 하위 타입(subtype)과 일치하는지 확인할 수도 있습니다.

```kotlin
interface Animal {
    val name: String
    fun speak()
}

class Dog(override val name: String) : Animal {
    override fun speak() = println("$name says: Woof!")
}

class Cat(override val name: String) : Animal {
    override fun speak() = println("$name says: Meow!")
}
//sampleStart
fun handleAnimal(animal: Animal) {
    println("Handling animal: ${animal.name}")
    animal.speak()
    
    // is 연산자를 사용하여 하위 타입 확인
    if (animal is Dog) {
        println("Special care instructions: This is a dog.")
    } else if (animal is Cat) {
        println("Special care instructions: This is a cat.")
    }
}
//sampleEnd
fun main() {
    val pets: List<Animal> = listOf(
        Dog("Buddy"),
        Cat("Whiskers"),
        Dog("Rex")
    )

    for (pet in pets) {
        handleAnimal(pet)
        println("---")
    }
    // Handling animal: Buddy
    // Buddy says: Woof!
    // Special care instructions: This is a dog.
    // ---
    // Handling animal: Whiskers
    // Whiskers says: Meow!
    // Special care instructions: This is a cat.
    // ---
    // Handling animal: Rex
    // Rex says: Woof!
    // Special care instructions: This is a dog.
    // ---
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3" id="kotlin-typecasts-is-operator-subtype"}

이 예제에서는 `is` 연산자를 사용하여 `Animal` 클래스 인스턴스가 하위 타입인 `Dog` 또는 `Cat`인지 확인하고 관련 관리 지침을 출력합니다.

객체가 선언된 타입의 상위 타입(supertype)인지 확인할 수도 있지만, 결과가 항상 true이므로 큰 의미는 없습니다. 모든 클래스 인스턴스는 이미 해당 상위 타입의 인스턴스이기 때문입니다.

> 런타임에 객체의 타입을 식별하려면 [리플렉션(Reflection)](reflection.md)을 참고하세요.
> 
{type="tip"}

## 타입 캐스트

Kotlin에서 객체의 타입을 다른 타입으로 변환하는 것을 **캐스팅(casting)**이라고 합니다.

어떤 경우에는 컴파일러가 자동으로 객체를 캐스팅해 줍니다. 이를 스마트 캐스트(smart-cast)라고 합니다.

타입을 명시적으로 캐스팅해야 하는 경우, `as?` 또는 `as` [캐스트 연산자](#unsafe-cast-operator)를 사용하세요.

## 스마트 캐스트

컴파일러는 불변 값에 대한 타입 검사와 [명시적 캐스트](#unsafe-cast-operator)를 추적하여 암시적인(안전한) 캐스트를 자동으로 삽입합니다.

```kotlin
fun logMessage(data: Any) {
    // data가 String으로 자동 캐스트됨
    if (data is String) {
        println("Received text: ${data.length} characters")
    }
}

fun main() {
    logMessage("Server started")
    // Received text: 14 characters
    logMessage(404)
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3" id="kotlin-typecasts-smartcast"}

컴파일러는 부정 검사 후에 반환(return)되는 경우에도 캐스트가 안전하다는 것을 알 정도로 똑똑합니다.

```kotlin
fun logMessage(data: Any) {
    // data가 String으로 자동 캐스트됨
    if (data !is String) return

    println("Received text: ${data.length} characters")
}

fun main() {
    logMessage("User signed in")
    // Received text: 14 characters
    logMessage(true)
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3" id="kotlin-typecasts-smartcast-negative"}

### 제어 흐름

스마트 캐스트는 `if` 조건식뿐만 아니라 [`when` 식](control-flow.md#when-expressions-and-statements)에서도 작동합니다.

```kotlin
fun processInput(data: Any) {
    when (data) {
        // data가 Int로 자동 캐스트됨
        is Int -> println("Log: Assigned new ID ${data + 1}")
        // data가 String으로 자동 캐스트됨
        is String -> println("Log: Received message \"$data\"")
        // data가 IntArray로 자동 캐스트됨
        is IntArray -> println("Log: Processed scores, total = ${data.sum()}")
    }
}

fun main() {
    processInput(1001)
    // Log: Assigned new ID 1002
    processInput("System rebooted")
    // Log: Received message "System rebooted"
    processInput(intArrayOf(10, 20, 30))
    // Log: Processed scores, total = 60
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3" id="kotlin-typecasts-smartcast-when"}

또한 [`while` 루프](control-flow.md#while-loops)에서도 작동합니다.

```kotlin
sealed interface Status
data class Ok(val currentRoom: String) : Status
data object Error : Status

class RobotVacuum(val rooms: List<String>) {
    var index = 0

    fun status(): Status =
        if (index < rooms.size) Ok(rooms[index])
        else Error

    fun clean(): Status {
        println("Finished cleaning ${rooms[index]}")
        index++
        return status()
    }
}

fun main() {
    //sampleStart
    val robo = RobotVacuum(listOf("Living Room", "Kitchen", "Hallway"))

    var status: Status = robo.status()
    while (status is Ok) {
        // 컴파일러가 status를 OK 타입으로 스마트 캐스트하므로,
        // currentRoom 프로퍼티에 접근할 수 있습니다.
        println("Cleaning ${status.currentRoom}...")
        status = robo.clean()
    }
    // Cleaning Living Room...
    // Finished cleaning Living Room
    // Cleaning Kitchen...
    // Finished cleaning Kitchen
    // Cleaning Hallway...
    // Finished cleaning Hallway
    //sampleEnd
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3" id="kotlin-typecasts-smartcast-while"}

이 예제에서 봉인된(sealed) 인터페이스 `Status`에는 데이터 클래스 `Ok`와 데이터 객체 `Error`라는 두 가지 구현이 있습니다. 오직 `Ok` 데이터 클래스에만 `currentRoom` 프로퍼티가 있습니다. `while` 루프 조건이 true로 평가되면 컴파일러는 `status` 변수를 `Ok` 타입으로 스마트 캐스트하여 루프 본문 내에서 `currentRoom` 프로퍼티에 접근할 수 있도록 합니다.

`if`, `when` 또는 `while` 조건에서 사용하기 전에 `Boolean` 타입의 변수를 선언하면, 컴파일러가 해당 변수에 대해 수집한 모든 정보가 스마트 캐스트를 위해 해당 블록에서 접근 가능해집니다.

이는 불리언 조건을 변수로 추출하고 싶을 때 유용할 수 있습니다. 변수에 의미 있는 이름을 부여하여 코드 가독성을 높이고 나중에 코드에서 변수를 재사용할 수 있게 해줍니다. 예를 들어:

```kotlin
class Cat {
    fun purr() {
        println("Purr purr")
    }
}
//sampleStart
fun petAnimal(animal: Any) {
    val isCat = animal is Cat
    if (isCat) {
        // 컴파일러는 isCat에 대한 정보에 접근할 수 있으므로,
        // animal이 Cat 타입으로 스마트 캐스트되었음을 알 수 있습니다.
        // 따라서 purr() 함수를 호출할 수 있습니다.
        animal.purr()
    }
}

fun main(){
    val kitty = Cat()
    petAnimal(kitty)
    // Purr purr
}
//sampleEnd
```
{kotlin-runnable="true" kotlin-min-compiler-version="2.0" id="kotlin-smart-casts-local-variables" validate="false"}

### 논리 연산자

컴파일러는 `&&` 또는 `||` 연산자의 왼쪽에서 타입 검사(일반 또는 부정)가 이루어진 경우, 오른쪽에서도 스마트 캐스트를 수행할 수 있습니다.

```kotlin
// x는 `||` 연산자의 오른쪽에서 String으로 자동 캐스트됨
if (x !is String || x.length == 0) return

// x는 `&&` 연산자의 오른쪽에서 String으로 자동 캐스트됨
if (x is String && x.length > 0) {
    print(x.length) // x는 String으로 자동 캐스트됨
}
```

`&&` 연산자로 객체에 대한 타입 검사를 결합하면, 컴파일러는 객체를 체크된 모든 타입으로 동시에 스마트 캐스트합니다. 자세한 내용은 [교차 타입(Intersection types)](#intersection-types)을 참고하세요.

객체에 대한 타입 검사를 `or` 연산자(`||`)와 결합하면, 가장 가까운 공통 상위 타입으로 스마트 캐스트가 이루어집니다.

```kotlin
interface Status {
    fun signal() {}
}

interface Ok : Status
interface Postponed : Status
interface Declined : Status

fun signalCheck(signalStatus: Any) {
    if (signalStatus is Postponed || signalStatus is Declined) {
        // signalStatus는 공통 상위 타입인 Status로 스마트 캐스트됨
        signalStatus.signal()
    }
}
```

> 공통 상위 타입은 [합집합 타입(union type)](https://en.wikipedia.org/wiki/Union_type)의 **근사치**입니다. 합집합 타입은 [현재 Kotlin에서 지원되지 않습니다](https://youtrack.jetbrains.com/issue/KT-13108/Denotable-union-and-intersection-types).
>
{style="note"}

### 교차 타입(Intersection types)

컴파일러가 여러 `&&` 검사를 통해 객체를 스마트 캐스트할 때, [*교차 타입(intersection type)*](https://kotlinlang.org/spec/type-system.html#intersection-types)을 추론합니다. 이는 체크된 모든 제약 조건을 동시에 충족하는 내부 타입입니다.

```kotlin
interface Bird {
    fun fly()
}

interface Fish {
    fun swim()
}

fun describe(animal: Any) {
    // Bird 및 Fish 타입을 추론함
    if (animal is Bird && animal is Fish) {
        // 추가 검사나 캐스트 없이 fly() 및 swim()에 접근 가능
        animal.fly()
        animal.swim()
    }
}
```

교차 타입은 명시적으로 표현할 수 없습니다(non-denotable). 타입 검사 중에 타입 정보를 보존하기 위해 컴파일러의 내부 타입 시스템에만 존재합니다. Kotlin 코드에서 이를 직접 작성할 수는 없습니다. 컴파일러 에러 메시지나 IDE 툴팁에서 일반적으로 `A & B` 형태로 표시되는 교차 타입을 볼 수도 있습니다.
한 가지 예외는 [명확히 널이 될 수 없는 타입(definitely non-nullable types)](generics.md#definitely-non-nullable-types)을 선언하는 `T & Any`입니다. 이 구문은 타입 파라미터와 `Any`를 결합하기 위해 특별히 예약되어 있습니다.

```kotlin
fun  <T> T.assertNotNull(): T & Any = this ?: throw IllegalStateException("null value")
```

### 인라인 함수

컴파일러는 [인라인 함수(inline functions)](inline-functions.md)에 전달된 람다 함수 내에서 캡처된 변수를 스마트 캐스트할 수 있습니다.

인라인 함수는 암시적인 [`callsInPlace`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.contracts/-contract-builder/calls-in-place.html) 계약을 가진 것으로 처리됩니다. 이는 인라인 함수에 전달된 모든 람다 함수가 그 자리에서 호출됨을 의미합니다. 람다 함수가 그 자리에서 호출되므로, 컴파일러는 람다 함수가 해당 함수 본문 내에 포함된 변수에 대한 참조를 외부로 유출할 수 없음을 알게 됩니다.

컴파일러는 이 지식과 다른 분석을 함께 사용하여 캡처된 변수를 스마트 캐스트하는 것이 안전한지 결정합니다. 예를 들어:

```kotlin
interface Processor {
    fun process()
}

inline fun inlineAction(f: () -> Unit) = f()

fun nextProcessor(): Processor? = null

fun runProcessor(): Processor? {
    var processor: Processor? = null
    inlineAction {
        // 컴파일러는 processor가 지역 변수이고 inlineAction()이
        // 인라인 함수이므로 processor에 대한 참조가 유출될 수 없음을 압니다.
        // 따라서 processor를 스마트 캐스트하는 것이 안전합니다.
      
        // processor가 null이 아니면 processor는 스마트 캐스트됨
        if (processor != null) {
            // 컴파일러는 processor가 null이 아님을 알기에 세이프 콜(safe call)이 
            // 필요하지 않습니다.
            processor.process()
        }

        processor = nextProcessor()
    }

    return processor
}
```

### 예외 처리

스마트 캐스트 정보는 `catch` 및 `finally` 블록으로 전달됩니다. 컴파일러가 객체가 널 허용(nullable) 타입인지 여부를 추적하므로 코드가 더 안전해집니다. 예를 들어:

```kotlin
//sampleStart
fun testString() {
    var stringInput: String? = null
    // stringInput이 String 타입으로 스마트 캐스트됨
    stringInput = ""
    try {
        // 컴파일러는 stringInput이 null이 아님을 압니다.
        println(stringInput.length)
        // 0

        // 컴파일러는 stringInput에 대한 이전 스마트 캐스트 정보를 무효화합니다.
        // 이제 stringInput은 String? 타입을 가집니다.
        stringInput = null

        // 예외 발생
        if (2 > 1) throw Exception()
        stringInput = ""
    } catch (exception: Exception) {
        // 컴파일러는 stringInput이 null일 수 있음을 알기에
        // stringInput은 널 허용 상태로 유지됩니다.
        println(stringInput?.length)
        // null
    }
}
//sampleEnd
fun main() {
    testString()
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="2.0" id="kotlin-smart-casts-exception-handling"}

### 스마트 캐스트 전제 조건

스마트 캐스트는 검사와 사용 사이에 변수가 변하지 않는다고 컴파일러가 보장할 수 있을 때만 작동합니다. 스마트 캐스트는 다음 조건에서 사용할 수 있습니다.

<table style="none">
    <tr>
        <td>
            <code>val</code> 지역 변수
        </td>
        <td>
            항상 가능. 단, <a href="delegated-properties.md">지역 위임 프로퍼티(local delegated properties)</a>는 제외.
        </td>
    </tr>
    <tr>
        <td>
            <code>val</code> 프로퍼티
        </td>
        <td>
            프로퍼티가 <code>private</code> 또는 <code>internal</code>이거나, 프로퍼티가 선언된 동일한 <a href="visibility-modifiers.md#modules">모듈(module)</a> 내에서 검사가 수행되는 경우. <code>open</code> 프로퍼티나 커스텀 게터가 있는 프로퍼티에는 스마트 캐스트를 사용할 수 없습니다.
        </td>
    </tr>
    <tr>
        <td>
            <code>var</code> 지역 변수
        </td>
        <td>
            검사와 사용 사이에 변수가 수정되지 않고, 변수를 수정하는 람다에 캡처되지 않으며, 지역 위임 프로퍼티가 아닌 경우.
        </td>
    </tr>
    <tr>
        <td>
            <code>var</code> 프로퍼티
        </td>
        <td>
            불가능. 다른 코드에 의해 언제든지 변수가 수정될 수 있기 때문입니다.
        </td>
    </tr>
</table>

## `as` 및 `as?` 캐스트 연산자 {id="unsafe-cast-operator"}

Kotlin에는 `as`와 `as?`라는 두 가지 캐스트 연산자가 있습니다. 둘 다 캐스팅에 사용할 수 있지만 동작 방식이 다릅니다.

`as` 연산자를 사용했을 때 캐스트에 실패하면 런타임에 `ClassCastException`이 발생합니다. 그래서 이를 **안전하지 않은(unsafe)** 연산자라고도 부릅니다.
`as`는 null이 아닌 타입으로 캐스팅할 때 사용할 수 있습니다.

```kotlin
fun main() {
    val rawInput: Any = "user-1234"

    // String으로 성공적으로 캐스트됨
    val userId = rawInput as String
    println("Logging in user with ID: $userId")
    // Logging in user with ID: user-1234

    // ClassCastException 발생
    val wrongCast = rawInput as Int
    println("wrongCast contains: $wrongCast")
    // Exception in thread "main" java.lang.ClassCastException
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="2.0" id="kotlin-unsafe-cast-operator" validate="false"}

대신 `as?` 연산자를 사용하면 캐스트가 실패할 때 연산자가 `null`을 반환합니다. 그래서 이를 **안전한(safe)** 연산자라고도 부릅니다.

```kotlin
fun main() {
    val rawInput: Any = "user-1234"

    // String으로 성공적으로 캐스트됨
    val userId = rawInput as? String
    println("Logging in user with ID: $userId")
    // Logging in user with ID: user-1234

    // wrongCast에 null 값을 할당함
    val wrongCast = rawInput as? Int
    println("wrongCast contains: $wrongCast")
    // wrongCast contains: null
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="2.0" id="kotlin-safe-cast-operator"}

널 허용 타입을 안전하게 캐스팅하려면 `as?` 연산자를 사용하여 캐스트 실패 시 `ClassCastException`이 발생하는 것을 방지하세요.

`as`를 널 허용 타입과 함께 사용할 *수* 있습니다. 이 경우 결과가 `null`이 될 수 있지만, 캐스트가 성공하지 못하면 여전히 `ClassCastException`을 발생시킵니다. 이러한 이유로 `as?`가 더 안전한 옵션입니다.

```kotlin
fun main() {
    val config: Map<String, Any?> = mapOf(
        "username" to "kodee",
        "alias" to null,
        "loginAttempts" to 3
    )

    // 널 허용 String으로 안전하지 않게 캐스트
    val username: String? = config["username"] as String?
    println("Username: $username")
    // Username: kodee

    // null 값을 널 허용 String으로 안전하지 않게 캐스트
    val alias: String? = config["alias"] as String?
    println("Alias: $alias")
    // Alias: null

    // 널 허용 String으로 캐스트 실패 및 ClassCastException 발생
    // val unsafeAttempts: String? = config["loginAttempts"] as String?
    // println("Login attempts (unsafe): $unsafeAttempts")
    // Exception in thread "main" java.lang.ClassCastException

    // 널 허용 String으로 캐스트 실패 및 null 반환
    val safeAttempts: String? = config["loginAttempts"] as? String
    println("Login attempts (safe): $safeAttempts")
    // Login attempts (safe): null
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="2.0" id="kotlin-cast-nullable-types"}

### 업캐스팅 및 다운캐스팅

Kotlin에서는 객체를 상위 타입 및 하위 타입으로 캐스팅할 수 있습니다.

객체를 상위 클래스의 인스턴스로 캐스팅하는 것을 **업캐스팅(upcasting)**이라고 합니다. 업캐스팅은 특별한 구문이나 캐스트 연산자가 필요하지 않습니다. 예를 들어:

```kotlin
interface Animal {
    fun makeSound()
}

class Dog : Animal {
    // makeSound()에 대한 동작 구현
    override fun makeSound() {
        println("Dog says woof!")
    }
}

fun printAnimalInfo(animal: Animal) {
    animal.makeSound()
}

fun main() {
    val dog = Dog()
    // Dog 인스턴스를 Animal로 업캐스트
    printAnimalInfo(dog)  
    // Dog says woof!
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="2.0" id="kotlin-upcast"}

이 예제에서 `Dog` 인스턴스로 `printAnimalInfo()` 함수를 호출하면, 기대되는 파라미터 타입이 `Animal`이므로 컴파일러가 이를 업캐스트합니다. 실제 객체는 여전히 `Dog` 인스턴스이므로 컴파일러는 `Dog` 클래스의 `makeSound()` 함수를 동적으로 해결하여 `"Dog says woof!"`를 출력합니다.

Kotlin API에서 동작이 추상 타입에 의존하는 경우 명시적 업캐스팅을 자주 보게 됩니다. 또한 Jetpack Compose나 UI 툴킷에서도 흔히 볼 수 있는데, 일반적으로 모든 UI 요소를 상위 타입으로 취급하고 나중에 특정 하위 클래스에서 작동하도록 합니다.

```kotlin
    val textView = TextView(this)
    textView.text = "Hello, View!"

    // TextView에서 View로 업캐스트
    val view: View = textView  

    // View 함수 사용
    view.setPadding(20, 20, 20, 20)
    // Activity는 View 타입을 기대함
    setContentView(view)
```

객체를 하위 클래스의 인스턴스로 캐스팅하는 것을 **다운캐스팅(downcasting)**이라고 합니다. 다운캐스팅은 안전하지 않을 수 있으므로 명시적 캐스트 연산자를 사용해야 합니다. 캐스트 실패 시 예외가 발생하는 것을 피하려면, 캐스트 실패 시 `null`을 반환하는 안전한 캐스트 연산자 `as?`를 사용하는 것이 권장됩니다.

```kotlin
interface Animal {
    fun makeSound()
}

class Dog : Animal {
    override fun makeSound() {
        println("Dog says woof!")
    }

    fun bark() {
        println("BARK!")
    }
}

fun main() {
    // Animal 타입을 가진 Dog 인스턴스로 animal 생성
    val animal: Animal = Dog()
    
    // animal을 Dog 타입으로 안전하게 다운캐스트
    val dog: Dog? = animal as? Dog

    // dog가 null이 아닌 경우 bark()를 호출하기 위해 세이프 콜 사용
    dog?.bark()
    // "BARK!"
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="2.0" id="kotlin-downcast"}

이 예제에서 `animal`은 `Animal` 타입으로 선언되었지만 `Dog` 인스턴스를 보유하고 있습니다. 코드는 `animal`을 `Dog` 타입으로 안전하게 캐스팅하고 [세이프 콜(safe call)](null-safety.md#safe-call-operator)(`?.`)을 사용하여 `bark()` 함수에 접근합니다.

직렬화 시 기본 클래스를 특정 하위 타입으로 역직렬화할 때 다운캐스팅을 사용하게 됩니다. 또한 상위 타입 객체를 반환하는 Java 라이브러리와 작업할 때도 흔히 사용되며, Kotlin에서 이를 다운캐스팅해야 할 수 있습니다.