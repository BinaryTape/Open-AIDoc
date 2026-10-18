[//]: # (title: 고차 함수와 람다)

Kotlin 함수는 [일급(First-class)](https://en.wikipedia.org/wiki/First-class_function)입니다. 즉, 함수를 변수나 데이터 구조에 저장할 수 있으며, 다른 [고차 함수](#higher-order-functions)의 인자로 전달하거나 함수에서 반환할 수도 있습니다. 함수가 아닌 다른 일반 값으로 수행할 수 있는 모든 작업을 함수에도 수행할 수 있습니다.

이를 원활하게 지원하기 위해, 정적 타입 지정 언어인 Kotlin은 함수를 표현하기 위한 일련의 [함수 타입](#function-types)을 사용하며, [람다 식](#lambda-expressions-and-anonymous-functions)과 같은 특화된 언어 구문 세트를 제공합니다.

## 고차 함수 {id="higher-order-functions"}

고차 함수(Higher-order function)는 함수를 매개변수로 받거나 함수를 반환하는 함수입니다.

고차 함수의 좋은 예로는 컬렉션에서 사용되는 [함수형 프로그래밍 관용구인 `fold`](https://en.wikipedia.org/wiki/Fold_(higher-order_function))가 있습니다. 이 함수는 초기 누적 값(accumulator)과 결합 함수를 받아서, 현재 누적 값과 각 컬렉션 요소를 연속적으로 결합하여 매번 누적 값을 대체하면서 최종 반환값을 만듭니다.

```kotlin
fun <T, R> Collection<T>.fold(
    initial: R, 
    combine: (acc: R, nextElement: T) -> R
): R {
    var accumulator: R = initial
    for (element: T in this) {
        accumulator = combine(accumulator, element)
    }
    return accumulator
}
```

위 코드에서 `combine` 매개변수는 `(R, T) -> R`이라는 [함수 타입](#function-types)을 가지므로, `R`과 `T` 타입의 두 인자를 받아 `R` 타입의 값을 반환하는 함수를 인수로 받습니다.
이 함수는 `for` 루프 내부에서 [호출](#invoking-a-function-type-instance)되며, 그 반환값이 다시 `accumulator`에 할당됩니다.

`fold`를 호출하려면 [함수 타입의 인스턴스](#instantiating-a-function-type)를 인자로 전달해야 합니다. 고차 함수를 호출할 때는 이러한 목적으로 람다 식([아래에서 자세히 설명](#lambda-expressions-and-anonymous-functions))이 널리 사용됩니다.

```kotlin
fun main() {
    //sampleStart
    val items = listOf(1, 2, 3, 4, 5)
    
    // 람다는 중괄호로 둘러싸인 코드 블록입니다.
    items.fold(0, { 
        // 람다에 매개변수가 있는 경우 먼저 선언하고 뒤에 '->'를 붙입니다.
        acc: Int, i: Int -> 
        print("acc = $acc, i = $i, ") 
        val result = acc + i
        println("result = $result")
        // 람다의 마지막 표현식은 반환값으로 취급됩니다.
        result
    })
    
    // 타입을 추론할 수 있는 경우 람다의 매개변수 타입을 생략할 수 있습니다.
    val joinedToString = items.fold("Elements:", { acc, i -> acc + " " + i })
    
    // 고차 함수 호출에는 함수 참조를 사용할 수도 있습니다.
    val product = items.fold(1, Int::times)
    //sampleEnd
    println("joinedToString = $joinedToString")
    println("product = $product")
}
```
{kotlin-runnable="true"}

## 함수 타입 {id="function-types"}

Kotlin은 함수를 다루는 선언을 위해 `(Int) -> String`과 같은 함수 타입을 사용합니다: `val onClick: () -> Unit = ...`.

이러한 타입은 매개변수와 반환값 등 함수의 시그니처에 대응하는 특별한 표기법을 갖습니다.

* 모든 함수 타입은 괄호로 묶인 매개변수 타입 목록과 반환 타입을 가집니다. 예를 들어 `(A, B) -> C`는 `A`와 `B` 타입의 두 인수를 받아 `C` 타입의 값을 반환하는 함수를 나타내는 타입입니다.
  `() -> A`처럼 매개변수 타입 목록은 비어 있을 수 있습니다. [`Unit` 반환 타입](functions.md#unit-returning-functions)은 생략할 수 없습니다.

* 함수 타입은 선택적으로 추가 *수신 객체(Receiver)* 타입을 가질 수 있으며, 이는 표기법에서 점 앞에 지정됩니다.
  예를 들어 `A.(B) -> C` 타입은 수신 객체 `A`에서 매개변수 `B`를 전달받아 호출되고 `C` 값을 반환하는 함수를 나타냅니다.
  [수신 객체 지정 함수 리터럴](#function-literals-with-receiver)은 이러한 타입과 함께 자주 사용됩니다.

* [중단 함수(Suspending functions)](coroutines-basics.md)는 표기법에 `suspend` 한정자가 붙는 특별한 종류의 함수 타입에 속합니다(예: `suspend () -> Unit` 또는 `suspend A.(B) -> C`).

함수 타입 표기에는 선택적으로 함수 매개변수의 이름을 포함할 수 있습니다: `(x: Int, y: Int) -> Point`.
이러한 이름은 매개변수의 의미를 문서화하는 데 유용할 수 있습니다.

함수 타입이 [널 가능(Nullable)](null-safety.md#nullable-types-and-non-nullable-types)하도록 지정하려면 다음과 같이 괄호를 사용합니다.
`((Int, Int) -> Int)?`.

괄호를 사용하여 함수 타입을 조합할 수도 있습니다: `(Int) -> ((Int) -> Unit)`.

> 화살표 표기법은 오른쪽 결합(right-associative)을 따르므로, `(Int) -> (Int) -> Unit`은 바로 앞의 예제와 동일하지만 `((Int) -> (Int)) -> Unit`과는 다릅니다.
>
{style="note"}

[타입 별칭(Type alias)](type-aliases.md)을 사용하여 함수 타입에 다른 이름을 부여할 수도 있습니다.

```kotlin
typealias ClickHandler = (Button, ClickEvent) -> Unit
```

### 함수 타입 인스턴스화 {id="instantiating-a-function-type"}

함수 타입의 인스턴스를 얻는 방법에는 여러 가지가 있습니다.

* 함수 리터럴 내부의 코드 블록을 다음 형태 중 하나로 사용합니다.
    * [람다 식](#lambda-expressions-and-anonymous-functions): `{ a, b -> a + b }`
    * [익명 함수](#anonymous-functions): `fun(s: String): Int { return s.toIntOrNull() ?: 0 }`

  [수신 객체 지정 함수 리터럴](#function-literals-with-receiver)은 수신 객체가 있는 함수 타입의 값으로 사용할 수 있습니다.

* 기존 선언에 대한 호출 가능한 참조(Callable reference)를 사용합니다.
    * 최상위, 로컬, 멤버 또는 확장 [함수](#function-references): `::isOdd`, `String::toInt`
    * 최상위, 멤버 또는 확장 [프로퍼티](#property-references): `List<Int>::size`
    * [생성자](#constructor-references): `::Regex`

  여기에는 특정 인스턴스의 멤버를 가리키는 [바인딩된 호출 가능한 참조](#bound-and-unbound-references)도 포함됩니다: `foo::toString`.

* 함수 타입을 인터페이스로서 구현하는 커스텀 클래스의 인스턴스를 사용합니다.

```kotlin
class IntTransformer: (Int) -> Int {
    override operator fun invoke(x: Int): Int = TODO()
}

val intFunction: (Int) -> Int = IntTransformer()
```

정보가 충분하다면 컴파일러가 변수의 함수 타입을 추론할 수 있습니다.

```kotlin
val a = { i: Int -> i + 1 } // 추론된 타입은 (Int) -> Int입니다.
```

수신 객체가 있는 함수 타입과 없는 함수 타입의 *리터럴이 아닌* 값은 서로 호환되므로, 수신 객체가 첫 번째 매개변수를 대신할 수 있고 그 반대도 가능합니다. 예를 들어, `A.(B) -> C` 타입의 값이 필요한 곳에 `(A, B) -> C` 타입의 값을 전달하거나 할당할 수 있으며, 그 반대의 경우도 마찬가지입니다.

```kotlin
fun main() {
    //sampleStart
    val repeatFun: String.(Int) -> String = { times -> this.repeat(times) }
    val twoParameters: (String, Int) -> String = repeatFun // 가능
    
    fun runTransformation(f: (String, Int) -> String): String {
        return f("hello", 3)
    }
    val result = runTransformation(repeatFun) // 가능
    //sampleEnd
    println("result = $result")
}
```
{kotlin-runnable="true"}

> 변수가 확장 함수에 대한 참조로 초기화되더라도, 기본적으로는 수신 객체가 없는 함수 타입으로 추론됩니다.
> 이를 변경하려면 변수 타입을 명시적으로 지정하세요.
>
{style="note"}

### 함수 타입 인스턴스 호출 {id="invoking-a-function-type-instance"}

함수 타입의 값은 [`invoke(...)` 연산자](operator-overloading.md#invoke-operator)를 사용하여 호출할 수 있습니다: `f.invoke(x)` 또는 간단히 `f(x)`.

값에 수신 객체 타입이 있는 경우, 수신 객체는 첫 번째 인자로 전달되어야 합니다.
수신 객체가 있는 함수 타입 값을 호출하는 또 다른 방법은 해당 값이 [확장 함수](extensions.md)인 것처럼 수신 객체를 앞에 붙여 호출하는 것입니다: `1.foo(2)`.

예시:

```kotlin
fun main() {
    //sampleStart
    val stringPlus: (String, String) -> String = String::plus
    val intPlus: Int.(Int) -> Int = Int::plus
    
    println(stringPlus.invoke("<-", "->"))
    println(stringPlus("Hello, ", "world!"))
    
    println(intPlus.invoke(1, 1))
    println(intPlus(1, 2))
    println(2.intPlus(3)) // 확장 함수 형태의 호출
    //sampleEnd
}
```
{kotlin-runnable="true"}

### 인라인 함수 {id="inline-functions"}

때로는 고차 함수에 유연한 제어 흐름을 제공하는 [인라인 함수(Inline functions)](inline-functions.md)를 사용하는 것이 유용합니다.

## 호출 가능한 참조 {id="callable-reference"}

호출 가능한 참조(Callable reference)를 사용하면 함수, 프로퍼티 또는 생성자를 즉시 호출하거나 액세스하지 않고 참조할 수 있습니다.
이 참조를 변수에 저장하거나 다른 함수로 전달하거나 나중에 호출할 수 있습니다.

호출 가능한 참조를 생성하려면 `::` 연산자를 사용합니다.

```kotlin
fun isOdd(number: Int) = number % 2 != 0

fun main() {
    val numbers = listOf(1, 2, 3, 4, 5)

    // isOdd()에 대한 참조 전달
    println(numbers.filter(::isOdd))
    // [1, 3, 5]
}
```
{kotlin-runnable="true"}

호출 가능한 참조 객체는 `KFunction`, `KProperty`와 같은 [리플렉션(Reflection)](reflection.md) 인터페이스를 구현합니다.

### 함수 참조 {id="function-references"}

기존 함수를 값으로 전달하거나 저장하려면 함수 참조를 사용하세요. 최상위 또는 로컬 명명된 함수를 참조하려면 `::functionName` 형식을 사용합니다.

```kotlin
fun calculateLength(text: String) = text.length

fun main() {
    val length: (String) -> Int = ::calculateLength

    println(length("Kotlin"))
    // 6
    println(::calculateLength.name)
    // calculateLength
}
```
{kotlin-runnable="true"}

함수 참조는 매개변수 개수에 따라 [`KFunction<out R>`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.reflect/-k-function/)의 하위 타입 중 하나에 속합니다.
예를 들어, `KFunction3<T1, T2, T3, R>`과 같습니다.

여러 함수가 동일한 이름을 갖는 경우, 컴파일러는 기대되는 함수 타입을 기반으로 일치하는 오버로드를 선택합니다.

```kotlin
fun parse(value: String) = "String: $value"
fun parse(value: Int) = "Int: $value"

fun main() {
    val parseString: (String) -> String = ::parse
    val parseInt: (Int) -> String = ::parse

    println(parseString("Kotlin"))
    // String: Kotlin
    println(parseInt(22))
    // Int: 22
}
```
{kotlin-runnable="true"}

### 프로퍼티 참조 {id="property-references"}

정적으로 검사되는 프로퍼티 접근자를 전달해야 할 때 프로퍼티 참조를 사용하세요. 예를 들어 다른 함수에서 어떤 값을 읽거나 업데이트할지 선택하기 위해 이 참조를 사용할 수 있습니다.

프로퍼티 참조를 만들려면 `::` 연산자를 사용합니다. 참조를 함수처럼 호출하거나 `get()` 함수를 사용하여 프로퍼티를 읽을 수 있습니다. 변경 가능한 프로퍼티(mutable property) 참조는 `set()`도 제공합니다.

```kotlin
var greeting = "Hello"

class User(var name: String)

fun main() {
    // 최상위 프로퍼티 참조
    // 수신 객체가 필요하지 않음
    println(::greeting.get())
    // Hello

    ::greeting.set("Hi")
    println(greeting)
    // Hi

    val user = User("Jane")

    // 바인딩되지 않은 멤버 프로퍼티 참조
    // User 수신 객체를 명시적으로 전달해야 함
    val unboundName = User::name
    println(unboundName.get(user))
    // Jane

    unboundName.set(user, "Jane Doe")
    println(user.name)
    // Jane Doe

    // 바인딩된 멤버 프로퍼티 참조
    // user 수신 객체를 캡처함
    val boundName = user::name

    println(boundName.get())
    // Jane Doe

    boundName.set("Jane Smith")
    println(user.name)
    // Jane Smith
}
```
{kotlin-runnable="true"}

프로퍼티 참조 타입은 필요한 수신 객체의 수를 나타냅니다.

* [`KProperty0<V>`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.reflect/-k-property0/)는 수신 객체가 필요하지 않습니다. 최상위 프로퍼티나 객체에 바인딩된 프로퍼티가 여기에 해당합니다.
* [`KProperty1<T, V>`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.reflect/-k-property1/)는 1개의 수신 객체가 필요합니다.
* [`KProperty2<D, E, V>`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.reflect/-k-property2/)는 2개의 수신 객체가 필요하며 멤버 확장 프로퍼티를 나타냅니다. 하나는 선언된 클래스를 위한 수신 객체이고 다른 하나는 확장 대상 타입을 위한 수신 객체입니다.

변경 가능한 프로퍼티에는 이에 대응하는 [`KMutableProperty0`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.reflect/-k-mutable-property0/), [`KMutableProperty1`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.reflect/-k-mutable-property1/), [`KMutableProperty2`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.reflect/-k-mutable-property2/) 타입이 있습니다.
일반적으로 컴파일러가 참조로부터 타입을 추론하므로 이러한 타입을 명시적으로 작성할 필요는 없습니다.

> 런타임에 프로퍼티를 동적으로 탐색하려면 [Kotlin 리플렉션](reflection.md)을 사용하세요.
>
{style="tip"}

### 생성자 참조 {id="constructor-references"}

어떤 API에 팩토리가 필요하고 기존 생성자가 이미 요구되는 매개변수와 반환 타입을 가지고 있는 경우 생성자 참조를 사용하세요. 생성자 참조를 통해 API는 함수 값을 거쳐 새 인스턴스를 생성할 수 있습니다.

생성자에 대한 참조를 만들려면 `::ClassName`을 사용합니다.

```kotlin
data class User(val name: String, val age: Int)

fun createUser(factory: (String, Int) -> User): User =
    factory("Jane Doe", 22)

fun main() {
    val user = createUser(::User)
    println(user)
    // User(name=Jane Doe, age=22)
}
```
{kotlin-runnable="true"}

생성자에 대한 호출 가능한 참조는 매개변수 개수에 따라 [`KFunction<out R>`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.reflect/-k-function/)의 하위 타입 중 하나로 타입이 지정됩니다.

### 바인딩된 참조와 바인딩되지 않은 참조 {id="bound-and-unbound-references"}

멤버에 대한 참조는 _바인딩(Bound)_되거나 _바인딩되지 않을(Unbound)_ 수 있습니다.

* 바인딩된 참조(Bound reference)는 특정 인스턴스를 캡처하며 함수의 선언된 인수만 필요로 합니다. 모든 호출에서 동일한 객체를 사용해야 할 때 사용합니다.
* 바인딩되지 않은 참조(Unbound reference)는 인스턴스에 연결되어 있지 않으므로 함수 타입에 수신 객체가 포함됩니다. 호출자가 객체를 제공해야 할 때 사용합니다.

```kotlin
class User(val name: String) {
    fun hasName(prefix: String) = name.startsWith(prefix)
}

fun main() {
    // 바인딩되지 않은 참조의 첫 번째 매개변수는 User 수신 객체입니다.
    val unbound: (User, String) -> Boolean = User::hasName
    println(unbound(User("Jane"), "Ja"))
    // true

    val jane = User("Jane")

    // 참조가 jane을 수신 객체로 캡처합니다.
    val bound: (String) -> Boolean = jane::hasName
    println(bound("Doe"))
    // false
}
```
{kotlin-runnable="true"}

확장 함수도 동일한 규칙을 따릅니다. 예를 들어 `String::isBlank`는 바인딩되지 않았으며 `String` 수신 객체가 필요합니다. 반면 `"Kotlin"::isBlank`는 바인딩되어 있으며 매개변수를 받지 않습니다.

## 람다 식과 익명 함수 {id="lambda-expressions-and-anonymous-functions"}

람다 식과 익명 함수는 *함수 리터럴(Function literals)*입니다. 함수 리터럴이란 선언되지 않고 표현식으로서 즉시 전달되는 함수를 의미합니다. 다음 예제를 살펴보겠습니다.

```kotlin
max(strings, { a, b -> a.length < b.length })
```

`max` 함수는 두 번째 인수로 함수 값을 받으므로 고차 함수입니다. 이 두 번째 인수는 그 자체로 함수인 표현식이며 이를 함수 리터럴이라고 부릅니다. 이는 다음과 같은 명명된 함수와 동일합니다.

```kotlin
fun compare(a: String, b: String): Boolean = a.length < b.length
```

`suspend` 키워드를 사용하여 _중단 람다 식(Suspending lambda expression)_을 만들 수도 있습니다.
중단 람다는 `suspend () -> Unit` 함수 타입을 가지며 다른 중단 함수를 호출할 수 있습니다.

```kotlin
val suspendingTask = suspend { doSuspendingWork() }
```

### 람다 식 문법 {id="lambda-expression-syntax"}

람다 식의 완전한 구문 형태는 다음과 같습니다.

```kotlin
val sum: (Int, Int) -> Int = { x: Int, y: Int -> x + y }
```

* 람다 식은 항상 중괄호로 둘러싸여 있습니다.
* 완전한 구문 형태에서 매개변수 선언은 중괄호 안에 들어가며 선택적으로 타입 표기를 가질 수 있습니다.
* 본문은 `->` 뒤에 옵니다.
* 추론된 람다의 반환 타입이 `Unit`이 아닌 경우, 람다 본문 내의 마지막(또는 유일한) 표현식이 반환값으로 취급됩니다.

선택적 표기를 모두 생략하면 다음과 같은 형태가 됩니다.

```kotlin
val sum = { x: Int, y: Int -> x + y }
```

### 후행 람다 전달 {id="passing-trailing-lambdas"}

Kotlin 관례에 따라 함수의 마지막 매개변수가 함수인 경우, 해당 인수로 전달되는 람다 식은 괄호 밖에 배치할 수 있습니다.

```kotlin
val product = items.fold(1) { acc, e -> acc * e }
```

이러한 문법을 *후행 람다(Trailing lambda)*라고 부릅니다.

람다가 해당 호출의 유일한 인수라면 괄호 자체를 완전히 생략할 수 있습니다.

```kotlin
run { println("...") }
```

### it: 단일 매개변수의 암시적 이름 {id="it-implicit-name-of-a-single-parameter"}

람다 식이 단 하나의 매개변수만 갖는 경우는 매우 흔합니다.

컴파일러가 매개변수 없이도 시그니처를 파악할 수 있는 경우 매개변수를 선언할 필요가 없으며 `->`도 생략할 수 있습니다. 이때 매개변수는 `it`이라는 이름으로 암시적으로 선언됩니다.

```kotlin
ints.filter { it > 0 } // 이 리터럴의 타입은 '(it: Int) -> Boolean'입니다.
```

### 람다 식에서 값 반환하기 {id="returning-a-value-from-a-lambda-expression"}

[레이블이 지정된 반환(Qualified return)](returns.md#return-to-labels) 문법을 사용하여 람다에서 명시적으로 값을 반환할 수 있습니다. 그렇지 않은 경우 마지막 표현식의 값이 암시적으로 반환됩니다.

따라서 다음 두 스니펫은 동일합니다.

```kotlin
ints.filter {
    val shouldFilter = it > 0
    shouldFilter
}

ints.filter {
    val shouldFilter = it > 0
    return@filter shouldFilter
}
```

이러한 규칙은 [람다 식을 괄호 밖에 전달하는 방식](#passing-trailing-lambdas)과 함께 [LINQ 스타일](https://learn.microsoft.com/en-us/dotnet/csharp/programming-guide/concepts/linq/)의 코드를 작성할 수 있게 해줍니다.

```kotlin
strings.filter { it.length == 5 }.sortedBy { it }.map { it.uppercase() }
```

### 사용하지 않는 변수에 밑줄 사용 {id="underscore-for-unused-variables"}

람다 매개변수가 사용되지 않는 경우 이름 대신 밑줄을 사용할 수 있습니다.

```kotlin
map.forEach { (_, value) -> println("$value!") }
```

### 람다에서의 구조분해 {id="destructuring-in-lambdas"}

람다에서의 구조분해는 [구조분해 선언(Destructuring declarations)](destructuring-declarations.md#destructuring-in-lambdas)의 일부로 설명되어 있습니다.

### 익명 함수 {id="anonymous-functions"}

위의 람다 식 문법에는 함수의 반환 타입을 직접 지정할 수 있는 기능이 빠져 있습니다. 대부분의 경우 반환 타입을 자동으로 추론할 수 있기 때문에 이는 불필요합니다. 그러나 반환 타입을 명시적으로 지정해야 하는 경우 *익명 함수(Anonymous function)*라는 대체 문법을 사용할 수 있습니다.

```kotlin
fun(x: Int, y: Int): Int = x + y
```

익명 함수는 이름이 생략된다는 점을 제외하면 일반 함수 선언과 매우 유사하게 생겼습니다. 본문은 표현식(위의 예시) 또는 블록일 수 있습니다.

```kotlin
fun(x: Int, y: Int): Int {
    return x + y
}
```

매개변수와 반환 타입은 일반 함수와 동일한 방식으로 지정됩니다. 단, 문맥에서 매개변수 타입을 추론할 수 있는 경우 매개변수 타입을 생략할 수 있습니다.

```kotlin
ints.filter(fun(item) = item > 0)
```

익명 함수의 반환 타입 추론은 일반 함수와 동일하게 작동합니다. 표현식 본문을 가진 익명 함수의 반환 타입은 자동으로 추론되지만, 블록 본문을 가진 익명 함수의 경우 명시적으로 지정해야 합니다(지정하지 않으면 `Unit`으로 간주됨).

> 익명 함수를 매개변수로 전달할 때는 괄호 안에 넣어야 합니다. 함수를 괄호 밖에 둘 수 있는 축약 문법은 람다 식에만 적용됩니다.
>
{style="note"}

람다 식과 익명 함수의 또 다른 차이점은 [비로컬 반환(Non-local returns)](inline-functions.md#returns)의 동작 방식입니다. 레이블이 없는 `return` 문은 항상 `fun` 키워드로 선언된 함수에서 반환됩니다. 즉, 람다 식 내부의 `return`은 람다를 둘러싸고 있는 바깥쪽 함수에서 반환되지만, 익명 함수 내부의 `return`은 익명 함수 자체에서 반환됩니다.

### 클로저 {id="closures"}

람다 식이나 익명 함수([로컬 함수](functions.md#local-functions) 및 [객체 표현식](object-declarations.md#object-expressions) 포함)는 외부 범위에 선언된 변수를 포함하는 *클로저(Closure)*에 접근할 수 있습니다. 클로저에 캡처된 변수는 람다 내부에서 수정할 수 있습니다.

```kotlin
var sum = 0
ints.filter { it > 0 }.forEach {
    sum += it
}
print(sum)
```

### 수신 객체 지정 함수 리터럴 {id="function-literals-with-receiver"}

`A.(B) -> C`와 같이 수신 객체가 있는 [함수 타입](#function-types)은 특수한 형태의 함수 리터럴인 '수신 객체 지정 함수 리터럴(Function literals with receiver)'로 인스턴스화할 수 있습니다.

앞서 언급했듯이, Kotlin은 *수신 객체(Receiver object)*를 제공하면서 수신 객체가 있는 함수 타입의 인스턴스를 [호출할 수 있는 기능](#invoking-a-function-type-instance)을 제공합니다.

함수 리터럴의 본문 내부에서 호출 시 전달된 수신 객체는 *암시적인(implicit)* `this`가 되므로, 추가 한정자 없이 해당 수신 객체의 멤버에 접근하거나 [`this` 표현식](this-expressions.md)을 사용하여 수신 객체에 접근할 수 있습니다.

이 동작은 함수 본문 내부에서 수신 객체의 멤버에 접근할 수 있도록 해주는 [확장 함수](extensions.md)와 유사합니다.

다음은 수신 객체에서 `plus`를 호출하는 수신 객체 지정 함수 리터럴과 그 타입의 예시입니다.

```kotlin
val sum: Int.(Int) -> Int = { other -> plus(other) }
```

익명 함수 문법을 사용하면 함수 리터럴의 수신 객체 타입을 직접 지정할 수 있습니다.
이 방식은 수신 객체가 있는 함수 타입의 변수를 선언한 다음 나중에 사용해야 할 때 유용할 수 있습니다.

```kotlin
val sum = fun Int.(other: Int): Int = this + other
```

문맥에서 수신 객체 타입을 추론할 수 있는 경우 람다 식을 수신 객체 지정 함수 리터럴로 사용할 수 있습니다. 이를 활용한 가장 대표적인 예 중 하나가 [타입 안전한 빌더(Type-safe builders)](type-safe-builders.md)입니다.

```kotlin
class HTML {
    fun body() { ... }
}

fun html(init: HTML.() -> Unit): HTML {
    val html = HTML()  // 수신 객체 생성
    html.init()        // 수신 객체를 람다에 전달
    return html
}

html {       // 수신 객체 지정 람다가 여기서 시작됨
    body()   // 수신 객체의 메서드 호출
}
```