[//]: # (title: 예외 및 에러 처리)

<web-summary>Kotlin에서 런타임 오류를 처리하기 위해 예외를 사용하는 방법을 알아봅니다.</web-summary>

예외는 프로그램 실행을 방해할 수 있는 런타임 오류가 발생하더라도 코드가 더 예측 가능하게 실행되도록 돕습니다.
Kotlin은 기본적으로 모든 예외를 _언체크(unchecked)_ 예외로 취급합니다.
언체크 예외는 예외 처리 과정을 단순화합니다. 예외를 포착(catch)할 수 있지만, 명시적으로 처리하거나 [선언](java-to-kotlin-interop.md#checked-exceptions)할 필요는 없습니다. 

> Java, Swift 및 Objective-C와 상호 작용할 때 Kotlin이 예외를 처리하는 방법에 대한 자세한 내용은
> [Java, Swift 및 Objective-C와의 예외 상호 운용성](#exception-interoperability-with-java-swift-and-objective-c) 섹션을 참조하세요.
> 
{style="tip"}

예외 작업은 두 가지 주요 동작으로 구성됩니다:

* **예외 발생시키기(Throwing exceptions):** 문제가 발생했음을 알립니다.
* **예외 포착하기(Catching exceptions):** 문제를 해결하거나 개발자 또는 애플리케이션 사용자에게 알림으로써 예상치 못한 예외를 수동으로 처리합니다.

예외는 [`Throwable`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin/-throwable/) 클래스의 하위 클래스인 
[`Exception`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin/-exception/) 클래스의 하위 클래스로 표현됩니다. 계층 구조에 대한 자세한 내용은 [예외 계층 구조](#exception-hierarchy) 섹션을 참조하세요. `Exception`은 [`open 클래스`](inheritance.md)이므로, 애플리케이션의 특정 요구 사항에 맞게 [커스텀 예외](#create-custom-exceptions)를 생성할 수 있습니다.

## 예외 발생시키기

`throw` 키워드를 사용하여 수동으로 예외를 발생시킬 수 있습니다.
예외를 던지는 것은 코드에서 예상치 못한 런타임 오류가 발생했음을 나타냅니다.
예외는 [객체](classes.md#creating-instances)이며, 예외를 던지면 예외 클래스의 인스턴스가 생성됩니다.

매개변수 없이 예외를 던질 수 있습니다: 

```kotlin
throw IllegalArgumentException()
```

문제의 원인을 더 잘 이해하기 위해 커스텀 메시지 및 원래 원인과 같은 추가 정보를 포함하세요:

```kotlin
val cause = IllegalStateException("Original cause: illegal state")

// userInput이 음수이면 IllegalArgumentException을 던집니다. 
// 또한 cause IllegalStateException으로 표현된 원래 원인을 보여줍니다.
if (userInput < 0) {
    throw IllegalArgumentException("Input must be non-negative", cause)
}
```

이 예제에서는 사용자가 음수 값을 입력할 때 `IllegalArgumentException`이 발생합니다.
커스텀 에러 메시지를 작성하고 예외의 원래 원인(`cause`)을 유지할 수 있으며, 이는 [스택 트레이스](#stack-trace)에 포함됩니다.

### 전제 조건 함수를 사용한 예외 발생시키기

Kotlin은 전제 조건(precondition) 함수를 사용하여 자동으로 예외를 던지는 추가적인 방법을 제공합니다.
전제 조건 함수는 다음과 같습니다:

| 전제 조건 함수 | 사용 사례 | 던져지는 예외 |
|----------------------------------|------------------------------------------|------------------------------------------------------------------------------------------------------------------|
| [`require()`](#require-function) | 사용자 입력 유효성 검사 | [`IllegalArgumentException`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin/-illegal-argument-exception/)   |
| [`check()`](#check-function) | 객체 또는 변수 상태 유효성 검사 | [`IllegalStateException`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin/-illegal-state-exception/)         |
| [`error()`](#error-function) | 불법적인 상태 또는 조건임을 나타냄 | [`IllegalStateException`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin/-illegal-state-exception/)         |

이러한 함수는 특정 조건이 충족되지 않으면 프로그램의 흐름을 계속할 수 없는 상황에 적합합니다.
이는 코드를 간소화하고 이러한 검사를 효율적으로 처리할 수 있게 해줍니다.

#### require() 함수

함수의 작동에 입력 인수가 중요하고, 이 인수가 유효하지 않으면 함수가 진행될 수 없을 때 [`require()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin/require.html) 함수를 사용하여 입력 인수의 유효성을 검사합니다.

`require()`의 조건이 충족되지 않으면 [`IllegalArgumentException`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin/-illegal-argument-exception/)을 던집니다:

```kotlin
fun getIndices(count: Int): List<Int> {
    require(count >= 0) { "Count must be non-negative. You set count to $count." }
    return List(count) { it + 1 }
}

fun main() {
    // IllegalArgumentException과 함께 실패합니다.
    println(getIndices(-1))
    
    // 동작하는 예제를 보려면 아래 줄의 주석을 해제하세요.
    // println(getIndices(3))
    // [1, 2, 3]
}
```
{kotlin-runnable="true"}

> `require()` 함수를 사용하면 컴파일러가 [스마트 캐스트(smart casting)](typecasts.md#smart-casts)를 수행할 수 있습니다.
> 검사에 성공하면 변수는 자동으로 null이 될 수 없는(non-nullable) 타입으로 캐스팅됩니다.
> 이러한 함수는 작업을 진행하기 전에 변수가 null이 아님을 보장하기 위한 null 가능성 검사에 자주 사용됩니다. 예를 들어:
>
> ```kotlin
> fun printNonNullString(str: String?) {
>     // Null 가능성 검사
>     require(str != null) 
>     // 이 검사에 성공한 후 'str'은 null이 아님이 보장되며 
>     // null이 될 수 없는 String으로 자동으로 스마트 캐스트됩니다.
>     println(str.length)
> }
> ```
>
{style="note"}

#### check() 함수

객체나 변수의 상태를 검증하려면 [`check()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin/check.html) 함수를 사용하세요.
검사에 실패하면 해결해야 할 로직 오류가 있음을 나타냅니다.

`check()` 함수에 지정된 조건이 `false`이면 [`IllegalStateException`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin/-illegal-state-exception/)을 던집니다:

```kotlin
fun main() {
    var someState: String? = null

    fun getStateValue(): String {

        val state = checkNotNull(someState) { "State must be set beforehand!" }
        check(state.isNotEmpty()) { "State must be non-empty!" }
        return state
    }
    // 아래 줄의 주석을 해제하면 프로그램이 IllegalStateException과 함께 실패합니다.
    // getStateValue()

    someState = ""

    // 아래 줄의 주석을 해제하면 프로그램이 IllegalStateException과 함께 실패합니다.
    // getStateValue() 
    someState = "non-empty-state"

    // "non-empty-state"를 출력합니다.
    println(getStateValue())
}
```
{kotlin-runnable="true"}

> `check()` 함수를 사용하면 컴파일러가 [스마트 캐스트(smart casting)](typecasts.md#smart-casts)를 수행할 수 있습니다.
> 검사에 성공하면 변수는 자동으로 null이 될 수 없는 타입으로 캐스팅됩니다.
> 이러한 함수는 작업을 진행하기 전에 변수가 null이 아님을 보장하기 위한 null 가능성 검사에 자주 사용됩니다. 예를 들어:
>
> ```kotlin
> fun printNonNullString(str: String?) {
>     // Null 가능성 검사
>     check(str != null) 
>     // 이 검사에 성공한 후 'str'은 null이 아님이 보장되며 
>     // null이 될 수 없는 String으로 자동으로 스마트 캐스트됩니다.
>     println(str.length)
> }
> ```
>
{style="note"}

#### error() 함수

[`error()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin/error.html) 함수는 논리적으로 발생해서는 안 되는 코드 내의 잘못된 상태나 조건을 알리는 데 사용됩니다.
예상치 못한 상태를 만났을 때와 같이 코드에서 의도적으로 예외를 던지고 싶을 때 적합합니다.
이 함수는 특히 `when` 식에서 유용하며, 논리적으로 발생할 수 없는 케이스를 처리하는 명확한 방법을 제공합니다.

다음 예제에서 `error()` 함수는 정의되지 않은 사용자 역할을 처리하는 데 사용됩니다.
역할이 미리 정의된 역할 중 하나가 아니면 [`IllegalStateException`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin/-illegal-state-exception/)이 발생합니다:

```kotlin
class User(val name: String, val role: String)

fun processUserRole(user: User) {
    when (user.role) {
        "admin" -> println("${user.name} is an admin.")
        "editor" -> println("${user.name} is an editor.")
        "viewer" -> println("${user.name} is a viewer.")
        else -> error("Undefined role: ${user.role}")
    }
}

fun main() {
    // 예상대로 작동합니다.
    val user1 = User("Alice", "admin")
    processUserRole(user1)
    // Alice is an admin.

    // IllegalStateException을 던집니다.
    val user2 = User("Bob", "guest")
    processUserRole(user2)
}
```
{kotlin-runnable="true"}

## try-catch 블록을 사용한 예외 처리

예외가 발생하면 프로그램의 정상적인 실행이 중단됩니다.
`try` 및 `catch` 키워드를 사용하여 예외를 우아하게 처리함으로써 프로그램을 안정적으로 유지할 수 있습니다.
`try` 블록은 예외가 발생할 수 있는 코드를 포함하고, `catch` 블록은 예외가 발생할 경우 이를 포착하고 처리합니다.
예외는 해당 타입 또는 예외의 [상위 클래스(superclass)](inheritance.md)와 일치하는 첫 번째 `catch` 블록에 의해 포착됩니다.

다음은 `try`와 `catch` 키워드를 함께 사용하는 방법입니다:

```kotlin
try {
    // 예외가 발생할 수 있는 코드
} catch (e: SomeException) {
    // 예외 처리를 위한 코드
}
```

`try-catch`를 식으로 사용하는 것이 일반적인 접근 방식이므로, `try` 블록이나 `catch` 블록 중 하나에서 값을 반환할 수 있습니다:

```kotlin
fun main() {
    val num: Int = try {

        // count()가 성공적으로 완료되면 그 반환 값이 num에 할당됩니다.
        count()
        
    } catch (e: ArithmeticException) {
        
        // count()에서 예외가 발생하면 catch 블록이 -1을 반환하고,
        // 이 값이 num에 할당됩니다.
        -1
    }
    println("Result: $num")
}

// ArithmeticException을 발생시킬 수 있는 함수를 시뮬레이션합니다.
fun count(): Int {
    
    // 이 값을 변경하여 num에 다른 값을 반환해 보세요.
    val a = 0
    
    return 10 / a
}
```
{kotlin-runnable="true"}

예외 인스턴스를 사용하지 않고 예외를 처리할 수 있습니다.
예를 들어, `catch` 블록에서 대체 값이나 일반적인 에러 메시지를 제공할 수 있습니다.

예외 인스턴스를 의도적으로 무시함을 나타내기 위해 예외 매개변수 이름 대신 언더스코어(`_`)를 사용하세요:

```kotlin
import java.io.File
import java.io.IOException

//sampleStart
fun main() {
    val userSettings = try {
        File("user-settings.json").readText()
    
    // 예외 인스턴스를 사용하지 않고 IOException을 포착합니다.
    } catch (_: IOException) {
        // 파일 로드에 실패하면 대체 값을 사용합니다.
        "{}"
    }

    println(userSettings)
}
//sampleEnd
```
{kotlin-runnable="true"}

동일한 `try` 블록에 대해 여러 개의 `catch` 핸들러를 사용할 수 있습니다.
서로 다른 예외를 별도로 처리하기 위해 필요한 만큼 `catch` 블록을 추가할 수 있습니다.
여러 개의 `catch` 블록이 있을 때는 코드에서 위에서 아래 방향으로 가장 구체적인 예외부터 가장 덜 구체적인 예외 순으로 배치하는 것이 중요합니다.
이러한 순서는 프로그램의 실행 흐름과 일치합니다.

[커스텀 예외](#create-custom-exceptions)를 사용한 다음 예제를 살펴보세요:

```kotlin
open class WithdrawalException(message: String) : Exception(message)
class InsufficientFundsException(message: String) : WithdrawalException(message)

fun processWithdrawal(amount: Double, availableFunds: Double) {
    if (amount > availableFunds) {
        throw InsufficientFundsException("Insufficient funds for the withdrawal.")
    }
    if (amount < 1 || amount % 1 != 0.0) {
        throw WithdrawalException("Invalid withdrawal amount.")
    }
    println("Withdrawal processed")
}

fun main() {
    val availableFunds = 500.0

    // 이 값을 변경하여 다른 시나리오를 테스트해 보세요.
    val withdrawalAmount = 500.5

    try {
        processWithdrawal(withdrawalAmount.toDouble(), availableFunds)

    // catch 블록의 순서가 중요합니다!
    } catch (e: InsufficientFundsException) {
        println("Caught an InsufficientFundsException: ${e.message}")
    } catch (e: WithdrawalException) {
        println("Caught a WithdrawalException: ${e.message}")
    }
}
```
{kotlin-runnable="true"}

`WithdrawalException`을 처리하는 일반적인 catch 블록은 더 구체적인 catch 블록에서 먼저 포착되지 않는 한, `InsufficientFundsException`과 같은 특정 예외를 포함하여 해당 타입의 모든 예외를 포착합니다.

### finally 블록

`finally` 블록은 `try` 블록의 성공 여부나 예외 발생 여부와 관계없이 항상 실행되는 코드를 포함합니다.
`finally` 블록을 사용하면 `try` 및 `catch` 블록 실행 후 코드를 정리할 수 있습니다.
이는 파일이나 네트워크 연결과 같은 리소스로 작업할 때 특히 중요한데, `finally`가 리소스를 적절히 닫거나 해제하도록 보장하기 때문입니다.

일반적으로 `try-catch-finally` 블록을 함께 사용하는 방법은 다음과 같습니다:

```kotlin
try {
    // 예외가 발생할 수 있는 코드
}
catch (e: YourException) {
    // 예외 핸들러
}
finally {
    // 항상 실행되는 코드
}
```

`try` 식의 반환 값은 `try` 또는 `catch` 블록에서 마지막으로 실행된 식에 의해 결정됩니다.
예외가 발생하지 않으면 결과는 `try` 블록에서 나오고, 예외가 처리되면 `catch` 블록에서 나옵니다.
`finally` 블록은 항상 실행되지만 `try-catch` 블록의 결과는 바꾸지 않습니다.

이를 보여주는 예제를 살펴보겠습니다:

```kotlin
fun divideOrNull(a: Int): Int {
    
    // try 블록은 항상 실행됩니다.
    // 여기서 예외(0으로 나누기)가 발생하면 즉시 catch 블록으로 점프합니다.
    try {
        val b = 44 / a
        println("try block: Executing division: $b")
        return b
    }
    
    // ArithmeticException(a == 0일 때 0으로 나누기)으로 인해 catch 블록이 실행됩니다.
    catch (e: ArithmeticException) {
        println("catch block: Encountered ArithmeticException $e")
        return -1
    }
    finally {
        println("finally block: The finally block is always executed")
    }
}

fun main() {
    
    // 다른 결과를 얻으려면 이 값을 변경해 보세요. ArithmeticException은 -1을 반환합니다.
    divideOrNull(0)
}
```
{kotlin-runnable="true"}

> Kotlin에서 `FileInputStream` 또는 `FileOutputStream`과 같은 파일 스트림처럼 [`AutoClosable`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin/-auto-closeable/) 인터페이스를 구현하는 리소스를 관리하는 관용적인 방법은 [`.use()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin/use.html) 함수를 사용하는 것입니다. 
> 이 함수는 예외 발생 여부와 관계없이 코드 블록이 완료되면 리소스를 자동으로 닫아주므로 `finally` 블록이 필요하지 않습니다. 
> 결과적으로 Kotlin은 리소스 관리를 위해 [Java의 try-with-resources](https://docs.oracle.com/javase/tutorial/essential/exceptions/tryResourceClose.html)와 같은 특별한 구문을 필요로 하지 않습니다.
> 
> ```kotlin
> FileWriter("test.txt").use { writer ->
>     writer.write("some text")
>     // 이 블록이 끝나면 .use 함수는 finally 블록과 유사하게 자동으로 writer.close()를 호출합니다.
> }
> ```
> 
{style="note"}

예외를 처리하지 않고 리소스 정리만 필요한 경우, `catch` 블록 없이 `finally` 블록이 있는 `try`를 사용할 수도 있습니다:

```kotlin
class MockResource { 
    fun use() { 
        println("Resource being used") 
        // 리소스 사용을 시뮬레이션합니다. 
        // 0으로 나누기가 발생하면 ArithmeticException을 던집니다.
        val result = 100 / 0
        
        // 예외가 발생하면 이 줄은 실행되지 않습니다.
        println("Result: $result") 
    }
    
    fun close() { 
        println("Resource closed") 
    }
}

fun main() { 
    val resource = MockResource()
//sampleStart 
    try {
        
        // 리소스 사용을 시도합니다. 
        resource.use()
        
    } finally {
        
        // 예외가 발생하더라도 리소스가 항상 닫히도록 보장합니다. 
        resource.close()
    }

    // 예외가 발생하면 이 줄은 출력되지 않습니다.
    println("End of the program")
//sampleEnd
}
```
{kotlin-runnable="true"}

보시다시피 `finally` 블록은 예외 발생 여부와 관계없이 리소스가 닫히도록 보장합니다.

Kotlin에서는 특정 요구 사항에 따라 `catch` 블록만, `finally` 블록만, 또는 둘 다 유연하게 사용할 수 있지만, `try` 블록은 항상 최소한 하나 이상의 `catch` 블록 또는 `finally` 블록과 함께 사용해야 합니다.

## 커스텀 예외 생성

Kotlin에서는 내장된 `Exception` 클래스를 확장하는 클래스를 생성하여 커스텀 예외를 정의할 수 있습니다. 
이를 통해 애플리케이션의 요구 사항에 맞는 더욱 구체적인 에러 타입을 만들 수 있습니다.

커스텀 예외를 만들려면 `Exception`을 확장하는 클래스를 정의합니다:

```kotlin
class MyException: Exception("My message")
```

이 예제에서는 기본 에러 메시지인 "My message"가 있지만, 원한다면 비워둘 수도 있습니다.

> Kotlin의 예외는 상태가 있는(stateful) 객체로, [스택 트레이스](#stack-trace)라고 불리는 생성 당시의 컨텍스트 정보를 전달합니다.
> [객체 선언(object declarations)](object-declarations.md#object-declarations-overview)을 사용하여 예외를 생성하지 마세요.
> 대신 예외가 필요할 때마다 매번 새로운 예외 인스턴스를 생성하세요.
> 그래야 예외 상태가 특정 컨텍스트를 정확하게 반영할 수 있습니다.
>
{style="tip"}

커스텀 예외는 `ArithmeticException` 하위 클래스와 같이 기존의 어떤 예외 하위 클래스의 하위 클래스도 될 수 있습니다:

```kotlin
class NumberTooLargeException: ArithmeticException("My message")
```

> 커스텀 예외의 하위 클래스를 만들고 싶다면, [클래스는 기본적으로 final](inheritance.md)이어서 하위 클래스를 만들 수 없으므로 부모 클래스를 `open`으로 선언해야 합니다.
> 
> 예를 들어:
>
> ```kotlin
> // 커스텀 예외를 open 클래스로 선언하여 하위 클래스를 생성할 수 있게 합니다.
> open class MyCustomException(message: String): Exception(message)
>
> // 커스텀 예외의 하위 클래스를 생성합니다.
> class SpecificCustomException: MyCustomException("Specific error message")
> ```
>
{style="note"}

커스텀 예외는 내장 예외와 똑같이 동작합니다. `throw` 키워드를 사용하여 던질 수 있고, `try-catch-finally` 블록으로 처리할 수 있습니다. 이를 보여주는 예제를 살펴보겠습니다:

```kotlin
class NegativeNumberException: Exception("Parameter is less than zero.")
class NonNegativeNumberException: Exception("Parameter is a non-negative number.")

fun myFunction(number: Int) {
    if (number < 0) throw NegativeNumberException()
    else if (number >= 0) throw NonNegativeNumberException()
}

fun main() {
    
    // 이 함수의 값을 변경하여 다른 예외를 발생시켜 보세요.
    myFunction(1)
}
```
{kotlin-runnable="true"}

다양한 에러 시나리오가 있는 애플리케이션에서는 예외 계층 구조를 만들면 코드를 더 명확하고 구체적으로 만드는 데 도움이 될 수 있습니다.
공통된 예외 기능의 기반으로 [추상 클래스(abstract class)](classes.md#abstract-classes) 또는 [봉인된 클래스(sealed class)](sealed-classes.md#constructors)를 사용하고, 세부적인 예외 유형에 대한 구체적인 하위 클래스를 만들어 이를 달성할 수 있습니다.
또한 기본값이 있는 매개변수를 포함하는 커스텀 예외는 유연성을 제공하여 다양한 메시지로 초기화할 수 있게 해주며, 이를 통해 더욱 세밀한 에러 처리가 가능해집니다.

봉인된 클래스 `AccountException`을 예외 계층의 기반으로 사용하고, 기본값이 있는 매개변수를 사용하여 향상된 예외 상세 정보를 보여주는 하위 클래스 `APIKeyExpiredException`을 사용하는 예제를 살펴보겠습니다:

```kotlin
//sampleStart
// 계정 관련 에러를 위한 예외 계층의 기반으로 봉인된 클래스를 생성합니다.
sealed class AccountException(message: String, cause: Throwable? = null):
Exception(message, cause)

// AccountException의 하위 클래스를 생성합니다.
class InvalidAccountCredentialsException : AccountException("Invalid account credentials detected")

// 커스텀 메시지와 원인(cause)을 추가할 수 있는 AccountException의 하위 클래스를 생성합니다.
class APIKeyExpiredException(message: String = "API key expired", cause: Throwable? = null)	: AccountException(message, cause)

// 다른 결과를 얻으려면 플레이스홀더 함수의 값을 변경하세요.
fun areCredentialsValid(): Boolean = true
fun isAPIKeyExpired(): Boolean = true
//sampleEnd

// 계정 자격 증명 및 API 키를 검증합니다.
fun validateAccount() {
    if (!areCredentialsValid()) throw InvalidAccountCredentialsException()
    if (isAPIKeyExpired()) {
        // 특정 원인과 함께 APIKeyExpiredException을 던지는 예제
        val cause = RuntimeException("API key validation failed due to network error")
        throw APIKeyExpiredException(cause = cause)
    }
}

fun main() {
    try {
        validateAccount()
        println("Operation successful: Account credentials and API key are valid.")
    } catch (e: AccountException) {
        println("Error: ${e.message}")
        e.cause?.let { println("Caused by: ${it.message}") }
    }
}
```
{kotlin-runnable="true"}

## Nothing 타입

Kotlin에서 모든 식은 타입을 가집니다.
`throw IllegalArgumentException()` 식의 타입은 [`Nothing`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin/-nothing.html)입니다. 이는 모든 다른 타입의 하위 타입인 내장 타입으로, [바텀 타입(bottom type)](https://en.wikipedia.org/wiki/Bottom_type)으로도 알려져 있습니다. 
즉, 타입 에러를 발생시키지 않고 다른 타입이 예상되는 모든 곳에서 `Nothing`을 반환 타입이나 제네릭 타입으로 사용할 수 있습니다.

`Nothing`은 항상 예외를 던지거나 무한 루프와 같이 끝없는 실행 경로로 진입하여 절대 성공적으로 완료되지 않는 함수나 식을 나타내기 위해 Kotlin에서 사용하는 특별한 타입입니다.
아직 구현되지 않았거나 항상 예외를 던지도록 설계된 함수에 `Nothing`을 사용하여 컴파일러와 코드 독자 모두에게 의도를 명확하게 알릴 수 있습니다.
컴파일러가 함수 시그니처에서 `Nothing` 타입을 추론하면 경고를 보냅니다.
반환 타입을 `Nothing`으로 명시적으로 정의하면 이 경고를 없앨 수 있습니다.

이 Kotlin 코드는 `Nothing` 타입의 사용을 보여주며, 컴파일러는 함수 호출 뒤에 오는 코드를 도달할 수 없는(unreachable) 코드로 표시합니다:

```kotlin
class Person(val name: String?)

fun fail(message: String): Nothing {
    throw IllegalArgumentException(message)
    // 이 함수는 절대로 성공적으로 반환되지 않습니다.
    // 항상 예외를 던집니다.
}

fun main() {
    // 'name'이 null인 Person 인스턴스를 생성합니다.
    val person = Person(name = null)
    
    val s: String = person.name ?: fail("Name required")

    // 이 시점에서 's'는 반드시 초기화되었음이 보장됩니다.
    println(s)
}
```
{kotlin-runnable="true"}

마찬가지로 `Nothing` 타입을 사용하는 Kotlin의 [`TODO()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin/-t-o-d-o.html) 함수는 향후 구현이 필요한 코드 영역을 강조하기 위한 플레이스홀더 역할을 합니다:

```kotlin
fun notImplementedFunction(): Int {
    TODO("This function is not yet implemented")
}

fun main() {
    val result = notImplementedFunction()
    // 이는 NotImplementedError를 던집니다.
    println(result)
}
```
{kotlin-runnable="true"}

보시다시피 `TODO()` 함수는 항상 [`NotImplementedError`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin/-not-implemented-error/) 예외를 던집니다.

## 예외 클래스

Kotlin에서 흔히 볼 수 있는 몇 가지 일반적인 예외 유형을 살펴보겠습니다. 이들은 모두 [`RuntimeException`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin/-runtime-exception/) 클래스의 하위 클래스입니다:

* [`ArithmeticException`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin/-arithmetic-exception/): 0으로 나누기와 같이 산술 연산을 수행할 수 없을 때 발생하는 예외입니다.

    ```kotlin
    val example = 2 / 0 // ArithmeticException을 던집니다.
    ```

* [`IndexOutOfBoundsException`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin/-index-out-of-bounds-exception/): 배열이나 문자열과 같은 인덱스가 범위를 벗어났음을 나타내기 위해 발생하는 예외입니다.

    ```kotlin
    val myList = mutableListOf(1, 2, 3)
    myList.removeAt(3)  // IndexOutOfBoundsException을 던집니다.
    ```

    > 이 예외를 피하려면 [`getOrNull()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/get-or-null.html) 함수와 같은 더 안전한 대안을 사용하세요:
    > 
    > ```kotlin
    > val myList = listOf(1, 2, 3)
    > // IndexOutOfBoundsException 대신 null을 반환합니다.
    > val element = myList.getOrNull(3)
    > println("Element at index 3: $element")
    > ```
    > 
    {style="note"}

* [`NoSuchElementException`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin/-no-such-element-exception/): 특정 컬렉션에 존재하지 않는 요소에 접근할 때 발생하는 예외입니다. [`first()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/first.html) 또는 [`last()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/last.html)와 같이 특정 요소를 기대하는 메서드를 사용할 때 발생합니다.

    ```kotlin
    val emptyList = listOf<Int>()
    val firstElement = emptyList.first()  // NoSuchElementException을 던집니다.
    ```

    > 이 예외를 피하려면 [`firstOrNull()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/first-or-null.html) 함수와 같은 더 안전한 대안을 사용하세요:
    >
    > ```kotlin
    > val emptyList = listOf<Int>()
    > // NoSuchElementException 대신 null을 반환합니다.
    > val firstElement = emptyList.firstOrNull()
    > println("First element in empty list: $firstElement")
    > ```
    >
    {style="note"}

* [`NumberFormatException`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin/-number-format-exception/): 문자열을 숫자 타입으로 변환하려고 시도했지만 문자열의 형식이 적절하지 않을 때 발생하는 예외입니다.

    ```kotlin
    val string = "This is not a number"
    val number = string.toInt() // NumberFormatException을 던집니다.
    ```
    
    > 이 예외를 피하려면 [`toIntOrNull()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.text/to-int-or-null.html) 함수와 같은 더 안전한 대안을 사용하세요:
    >
    > ```kotlin
    > val nonNumericString = "not a number"
    > // NumberFormatException 대신 null을 반환합니다.
    > val number = nonNumericString.toIntOrNull()
    > println("Converted number: $number")
    > ```
    >
    {style="note"}

* [`NullPointerException`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin/-null-pointer-exception/): 애플리케이션이 `null` 값을 가진 객체 참조를 사용하려고 시도할 때 발생하는 예외입니다.
Kotlin의 널 안전성(null safety) 기능은 NullPointerException의 위험을 크게 줄여주지만, `!!` 연산자를 의도적으로 사용하거나 Kotlin의 널 안전성이 부족한 Java와 상호 작용할 때 여전히 발생할 수 있습니다.

    ```kotlin
    val text: String? = null
    println(text!!.length)  // NullPointerException을 던집니다.
    ```

Kotlin에서는 모든 예외가 언체크 예외이므로 명시적으로 포착할 필요는 없지만, 원한다면 유연하게 포착할 수 있습니다.

### 예외 계층 구조

Kotlin 예외 계층 구조의 뿌리는 [`Throwable`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin/-throwable/) 클래스입니다.
여기에는 [`Error`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin/-error/)와 [`Exception`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin/-exception/)이라는 두 가지 직접적인 하위 클래스가 있습니다:

* `Error` 하위 클래스는 애플리케이션이 스스로 복구하지 못할 수도 있는 심각하고 근본적인 문제를 나타냅니다. 
이들은 일반적으로 [`OutOfMemoryError`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin/-out-of-memory-error/) 또는 `StackOverflowError`와 같이 처리를 시도하지 않는 문제들입니다.

* `Exception` 하위 클래스는 처리하고 싶을 수도 있는 조건들에 사용됩니다. 
[`RuntimeException`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin/-runtime-exception/) 및 `IOException`(입출력 예외)과 같은 `Exception` 타입의 하위 타입들은 애플리케이션의 예외적인 상황들을 다룹니다.

![예외 계층 구조 - Throwable 클래스](throwable.svg){width=700}

`RuntimeException`은 대개 프로그램 코드의 불충분한 검사로 인해 발생하며 프로그래밍 방식으로 방지할 수 있습니다.
Kotlin은 `NullPointerException`과 같은 일반적인 `RuntimeException`을 방지하도록 돕고, 0으로 나누기와 같은 잠재적인 런타임 오류에 대해 컴파일 타임 경고를 제공합니다. 다음 그림은 `RuntimeException`에서 파생된 하위 타입의 계층 구조를 보여줍니다:

![RuntimeException 계층 구조](runtime-exception.svg){width=700}

## 스택 트레이스

_스택 트레이스(stack trace)_는 디버깅을 위해 런타임 환경에서 생성된 보고서입니다.
이는 에러나 예외가 발생한 지점까지 이어지는 함수 호출 시퀀스를 보여줍니다.

JVM 환경에서 예외로 인해 스택 트레이스가 자동으로 출력되는 예제를 살펴보겠습니다:

```kotlin
fun main() {
//sampleStart    
    throw ArithmeticException("This is an arithmetic exception!")
//sampleEnd    
}
```
{kotlin-runnable="true"}

JVM 환경에서 이 코드를 실행하면 다음과 같은 출력이 생성됩니다:

```text
Exception in thread "main" java.lang.ArithmeticException: This is an arithmetic exception!
    at MainKt.main(Main.kt:3)
    at MainKt.main(Main.kt)
```

첫 번째 줄은 다음을 포함하는 예외 설명입니다:

* 예외 타입: `java.lang.ArithmeticException`
* 스레드: `main` 
* 예외 메시지: `"This is an arithmetic exception!"`

예외 설명 이후 `at`으로 시작하는 각 줄이 스택 트레이스입니다. 한 줄을 _스택 트레이스 요소(stack trace element)_ 또는 _스택 프레임(stack frame)_이라고 합니다:

* `at MainKt.main (Main.kt:3)`: 메서드 이름(`MainKt.main`)과 메서드가 호출된 소스 파일 및 줄 번호(`Main.kt:3`)를 보여줍니다.
* `at MainKt.main (Main.kt)`: 예외가 `Main.kt` 파일의 `main()` 함수에서 발생했음을 보여줍니다.

## Java, Swift 및 Objective-C와의 예외 상호 운용성

Kotlin은 모든 예외를 언체크 예외로 취급하기 때문에, 체크 예외와 언체크 예외를 구분하는 언어에서 이러한 예외를 호출할 때 복잡한 상황이 발생할 수 있습니다.
Kotlin과 Java, Swift, Objective-C와 같은 언어 간의 이러한 예외 처리 차이를 해결하기 위해 [`@Throws`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin/-throws/) 어노테이션을 사용할 수 있습니다.
이 어노테이션은 호출자에게 발생 가능한 예외에 대해 경고합니다.
자세한 내용은 [Java에서 Kotlin 호출하기](java-to-kotlin-interop.md#checked-exceptions) 및 [Swift/Objective-C와의 상호 운용성](native-objc-interop.md#errors-and-exceptions)을 참조하세요.