[//]: # (title: 고차 함수와 람다)

코틀린 함수는 [일급(first-class)](https://en.wikipedia.org/wiki/First-class_function) 함수입니다. 즉, 함수를 변수나 자료구조에 저장할 수 있으며, 다른 [고차 함수](#higher-order-functions)의 인자로 전달하거나 함수에서 반환할 수 있습니다. 함수가 아닌 다른 값들에 가능한 모든 연산을 함수에 대해서도 수행할 수 있습니다.

이를 용이하게 하기 위해, 정적 타입 지정 언어인 코틀린은 함수를 표현하기 위해 일련의 [함수 타입(function types)](#function-types)을 사용하며, [람다 표현식(lambda expressions)](#lambda-expressions-and-anonymous-functions)과 같은 특수한 언어 구조를 제공합니다.

## 고차 함수 (Higher-order functions) {id="higher-order-functions"}

고차 함수는 함수를 매개변수로 받거나 함수를 반환하는 함수를 말합니다.

고차 함수의 좋은 예로 컬렉션에 대한 [함수형 프로그래밍 이디엄인 `fold`](https://en.wikipedia.org/wiki/Fold_(higher-order_function))가 있습니다. 이 함수는 초기 누적값과 결합 함수를 받아, 현재 누적값과 각 컬렉션 요소를 연속적으로 결합하여 누적값을 매번 교체하며 최종 반환 값을 만듭니다.

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

위의 코드에서 `combine` 매개변수는 [함수 타입](#function-types) `(R, T) -> R`을 가집니다. 즉, `R`과 `T` 타입의 두 인자를 받아 `R` 타입의 값을 반환하는 함수를 인자로 받습니다. 이 함수는 `for` 루프 내부에서 [호출(invoked)](#invoking-a-function-type-instance)되며, 그 반환 값은 `accumulator`에 할당됩니다.

`fold`를 호출하려면 [함수 타입의 인스턴스](#instantiating-a-function-type)를 인자로 전달해야 하며, 고차 함수 호출 시에는 람다 표현식([아래에서 자세히 설명](#lambda-expressions-and-anonymous-functions))이 널리 사용됩니다.

```kotlin
fun main() {
    //sampleStart
    val items = listOf(1, 2, 3, 4, 5)
    
    // 람다는 중괄호로 둘러싸인 코드 블록입니다.
    items.fold(0, { 
        // 람다에 매개변수가 있으면 먼저 쓰고 그 뒤에 '->'를 붙입니다.
        acc: Int, i: Int -> 
        print("acc = $acc, i = $i, ") 
        val result = acc + i
        println("result = $result")
        // 람다의 마지막 표현식은 반환 값으로 간주됩니다.
        result
    })
    
    // 람다의 매개변수 타입을 추론할 수 있다면 생략 가능합니다.
    val joinedToString = items.fold("Elements:", { acc, i -> acc + " " + i })
    
    // 고차 함수 호출 시 함수 참조를 사용할 수도 있습니다.
    val product = items.fold(1, Int::times)
    //sampleEnd
    println("joinedToString = $joinedToString")
    println("product = $product")
}
```
{kotlin-runnable="true"}

## 함수 타입 (Function types) {id="function-types"}

코틀린은 함수를 다루는 선언을 위해 `(Int) -> String`과 같은 함수 타입을 사용합니다: `val onClick: () -> Unit = ...`.

이러한 타입은 함수의 시그니처(매개변수와 반환 값)에 대응하는 특별한 표기법을 가집니다.

* 모든 함수 타입은 괄호로 둘러싸인 매개변수 타입 목록과 반환 타입을 가집니다: `(A, B) -> C`는 `A`와 `B` 타입의 인자 두 개를 받아 `C` 타입의 값을 반환하는 함수를 나타냅니다. 매개변수 목록은 `() -> A`와 같이 비어있을 수 있습니다. [`Unit` 반환 타입](functions.md#unit-returning-functions)은 생략할 수 없습니다.

* 함수 타입은 선택적으로 추가적인 *수신 객체(receiver)* 타입을 가질 수 있으며, 이는 표기법에서 점(.) 앞에 지정됩니다: `A.(B) -> C` 타입은 수신 객체 `A`에 대해 매개변수 `B`를 가지고 호출되어 값 `C`를 반환하는 함수를 나타냅니다. [수신 객체가 있는 함수 리터럴](#function-literals-with-receiver)은 종종 이러한 타입과 함께 사용됩니다.

* [일시 중단 함수(Suspending functions)](coroutines-basics.md)는 `suspend () -> Unit` 또는 `suspend A.(B) -> C`와 같이 표기법에 *suspend* 수식어가 붙는 특별한 종류의 함수 타입에 속합니다.

함수 타입 표기법에는 선택적으로 함수 매개변수의 이름을 포함할 수 있습니다: `(x: Int, y: Int) -> Point`. 이러한 이름은 매개변수의 의미를 문서화하는 데 유용할 수 있습니다.

함수 타입이 [널 허용(nullable)](null-safety.md#nullable-types-and-non-nullable-types)임을 지정하려면 다음과 같이 괄호를 사용합니다: `((Int, Int) -> Int)?`.

함수 타입은 괄호를 사용하여 조합할 수도 있습니다: `(Int) -> ((Int) -> Unit)`.

> 화살표 표기법은 오른쪽 결합(right-associative)입니다. `(Int) -> (Int) -> Unit`은 이전 예제와 동일하지만, `((Int) -> (Int)) -> Unit`과는 다릅니다.
>
{style="note"}

[타입 별칭(type alias)](type-aliases.md)을 사용하여 함수 타입에 다른 이름을 부여할 수도 있습니다.

```kotlin
typealias ClickHandler = (Button, ClickEvent) -> Unit
```

### 함수 타입 인스턴스화하기 {id="instantiating-a-function-type"}

함수 타입의 인스턴스를 얻는 방법은 여러 가지가 있습니다.

* 함수 리터럴 내에서 다음 형태 중 하나의 코드 블록을 사용합니다:
    * [람다 표현식](#lambda-expressions-and-anonymous-functions): `{ a, b -> a + b }`
    * [익명 함수](#anonymous-functions): `fun(s: String): Int { return s.toIntOrNull() ?: 0 }`

  [수신 객체가 있는 함수 리터럴](#function-literals-with-receiver)은 수신 객체가 있는 함수 타입의 값으로 사용될 수 있습니다.

* 기존 선언에 대한 호출 가능한 참조(callable reference)를 사용합니다:
    * 최상위, 지역, 멤버 또는 확장 [함수](reflection.md#function-references): `::isOdd`, `String::toInt`
    * 최상위, 멤버 또는 확장 [프로퍼티](reflection.md#property-references): `List<Int>::size`
    * [생성자](reflection.md#constructor-references): `::Regex`

  특정 인스턴스의 멤버를 가리키는 [바인딩된 호출 가능한 참조(bound callable references)](reflection.md#bound-function-and-property-references)도 포함됩니다: `foo::toString`.

* 함수 타입을 인터페이스로 구현하는 커스텀 클래스의 인스턴스를 사용합니다:

```kotlin
class IntTransformer: (Int) -> Int {
    override operator fun invoke(x: Int): Int = TODO()
}

val intFunction: (Int) -> Int = IntTransformer()
```

정보가 충분하다면 컴파일러가 변수의 함수 타입을 추론할 수 있습니다.

```kotlin
val a = { i: Int -> i + 1 } // 추론된 타입은 (Int) -> Int 입니다.
```

수신 객체가 있는 함수 타입과 없는 함수 타입의 *리터럴이 아닌* 값들은 서로 대체 가능하므로, 수신 객체가 첫 번째 매개변수를 대신할 수 있고 그 반대도 가능합니다. 예를 들어, `(A, B) -> C` 타입의 값은 `A.(B) -> C` 타입이 기대되는 곳에 전달되거나 할당될 수 있으며 그 반대의 경우도 마찬가지입니다.

```kotlin
fun main() {
    //sampleStart
    val repeatFun: String.(Int) -> String = { times -> this.repeat(times) }
    val twoParameters: (String, Int) -> String = repeatFun // OK
    
    fun runTransformation(f: (String, Int) -> String): String {
        return f("hello", 3)
    }
    val result = runTransformation(repeatFun) // OK
    //sampleEnd
    println("result = $result")
}
```
{kotlin-runnable="true"}

> 확장 함수에 대한 참조로 변수를 초기화하더라도 기본적으로 수신 객체가 없는 함수 타입으로 추론됩니다. 이를 변경하려면 변수 타입을 명시적으로 지정하십시오.
>
{style="note"}

### 함수 타입 인스턴스 호출하기 {id="invoking-a-function-type-instance"}

함수 타입의 값은 [`invoke(...)` 연산자](operator-overloading.md#invoke-operator)를 사용하여 호출할 수 있습니다: `f.invoke(x)` 또는 단순히 `f(x)`.

값에 수신 객체 타입이 있는 경우 수신 객체는 첫 번째 인자로 전달되어야 합니다. 수신 객체가 있는 함수 타입의 값을 호출하는 다른 방법은, 마치 해당 값이 [확장 함수](extensions.md)인 것처럼 수신 객체 앞에 붙여 호출하는 것입니다: `1.foo(2)`.

예제:

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

### 인라인 함수 (Inline functions) {id="inline-functions"}

때로는 고차 함수에 유연한 제어 흐름을 제공하는 [인라인 함수(inline functions)](inline-functions.md)를 사용하는 것이 유리할 때가 있습니다.

## 람다 표현식과 익명 함수 {id="lambda-expressions-and-anonymous-functions"}

람다 표현식과 익명 함수는 *함수 리터럴*입니다. 함수 리터럴은 선언되지 않았지만 표현식으로 즉시 전달되는 함수입니다. 다음 예제를 고려해 보십시오.

```kotlin
max(strings, { a, b -> a.length < b.length })
```

`max` 함수는 두 번째 인자로 함수 값을 받으므로 고차 함수입니다. 이 두 번째 인자는 그 자체로 함수인 표현식으로, 함수 리터럴이라 불리며 다음의 명명된 함수와 동일합니다.

```kotlin
fun compare(a: String, b: String): Boolean = a.length < b.length
```

`suspend` 키워드를 사용하여 _일시 중단 람다 표현식(suspending lambda expression)_을 만들 수도 있습니다. 일시 중단 람다는 `suspend () -> Unit` 함수 타입을 가지며 다른 일시 중단 함수를 호출할 수 있습니다.

```kotlin
val suspendingTask = suspend { doSuspendingWork() }
```

### 람다 표현식 문법 {id="lambda-expression-syntax"}

람다 표현식의 전체 문법 형태는 다음과 같습니다.

```kotlin
val sum: (Int, Int) -> Int = { x: Int, y: Int -> x + y }
```

* 람다 표현식은 항상 중괄호로 둘러싸여 있습니다.
* 전체 문법 형태에서 매개변수 선언은 중괄호 안에 들어가며 선택적으로 타입 어노테이션을 가질 수 있습니다.
* 본문은 `->` 뒤에 옵니다.
* 람다의 추론된 반환 타입이 `Unit`이 아니라면, 람다 본문 내의 마지막(또는 유일한) 표현식이 반환 값으로 처리됩니다.

모든 선택적 어노테이션을 제거하면 다음과 같습니다.

```kotlin
val sum = { x: Int, y: Int -> x + y }
```

### 후행 람다 전달하기 {id="passing-trailing-lambdas"}

코틀린 관례에 따라, 함수의 마지막 매개변수가 함수인 경우 대응하는 인자로 전달되는 람다 표현식을 괄호 밖에 배치할 수 있습니다.

```kotlin
val product = items.fold(1) { acc, e -> acc * e }
```

이러한 문법을 *후행 람다(trailing lambda)*라고도 합니다.

람다가 해당 호출의 유일한 인자인 경우 괄호를 완전히 생략할 수 있습니다.

```kotlin
run { println("...") }
```

### it: 단일 매개변수의 암시적 이름 {id="it-implicit-name-of-a-single-parameter"}

람다 표현식에 매개변수가 하나만 있는 경우가 매우 흔합니다.

컴파일러가 매개변수 없이 시그니처를 파악할 수 있다면 매개변수를 선언하지 않아도 되며 `->`를 생략할 수 있습니다. 매개변수는 `it`이라는 이름으로 암시적으로 선언됩니다.

```kotlin
ints.filter { it > 0 } // 이 리터럴의 타입은 '(it: Int) -> Boolean'입니다.
```

### 람다 표현식에서 값 반환하기 {id="returning-a-value-from-a-lambda-expression"}

[한정된 반환(qualified return)](returns.md#return-to-labels) 문법을 사용하여 람다에서 명시적으로 값을 반환할 수 있습니다. 그렇지 않으면 마지막 표현식의 값이 암시적으로 반환됩니다.

따라서 다음 두 코드 조각은 동일합니다.

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

이 관례와 [괄호 밖에 람다 표현식 전달하기](#passing-trailing-lambdas)를 함께 사용하면 [LINQ 스타일](https://learn.microsoft.com/en-us/dotnet/csharp/programming-guide/concepts/linq/)의 코드가 가능해집니다.

```kotlin
strings.filter { it.length == 5 }.sortedBy { it }.map { it.uppercase() }
```

### 사용하지 않는 변수를 위한 언더스코어 {id="underscore-for-unused-variables"}

람다 매개변수를 사용하지 않는 경우, 이름 대신 언더스코어를 사용할 수 있습니다.

```kotlin
map.forEach { (_, value) -> println("$value!") }
```

### 람다에서의 구조 분해 {id="destructuring-in-lambdas"}

람다에서의 구조 분해는 [구조 분해 선언(destructuring declarations)](destructuring-declarations.md#destructuring-in-lambdas)의 일부로 설명되어 있습니다.

### 익명 함수 (Anonymous functions) {id="anonymous-functions"}

위의 람다 표현식 문법에서 한 가지 빠진 것은 함수의 반환 타입을 지정하는 기능입니다. 대부분의 경우 반환 타입을 자동으로 추론할 수 있으므로 이는 불필요합니다. 그러나 명시적으로 지정해야 하는 경우 *익명 함수*라는 대체 문법을 사용할 수 있습니다.

```kotlin
fun(x: Int, y: Int): Int = x + y
```

익명 함수는 이름이 생략된다는 점을 제외하면 일반 함수 선언과 매우 유사해 보입니다. 본문은 위와 같이 표현식일 수도 있고 블록일 수도 있습니다.

```kotlin
fun(x: Int, y: Int): Int {
    return x + y
}
```

매개변수와 반환 타입은 일반 함수와 동일한 방식으로 지정되지만, 문맥에서 매개변수 타입을 추론할 수 있는 경우 생략할 수 있습니다.

```kotlin
ints.filter(fun(item) = item > 0)
```

익명 함수의 반환 타입 추론은 일반 함수와 동일하게 작동합니다. 표현식 본문이 있는 익명 함수는 반환 타입이 자동으로 추론되지만, 블록 본문이 있는 익명 함수는 명시적으로 지정해야 합니다(또는 `Unit`으로 간주됨).

> 익명 함수를 매개변수로 전달할 때는 괄호 안에 넣으십시오. 함수를 괄호 밖에 둘 수 있게 해주는 축약 문법은 람다 표현식에만 적용됩니다.
>
{style="note"}

람다 표현식과 익명 함수의 또 다른 차이점은 [비지역 반환(non-local returns)](inline-functions.md#returns)의 동작입니다. 레이블이 없는 `return` 문은 항상 `fun` 키워드로 선언된 함수에서 반환됩니다. 즉, 람다 표현식 내부의 `return`은 람다를 감싸고 있는 함수에서 반환되지만, 익명 함수 내부의 `return`은 익명 함수 자체에서 반환됩니다.

### 클로저 (Closures) {id="closures"}

람다 표현식이나 익명 함수(그리고 [지역 함수](functions.md#local-functions), [객체 표현식](object-declarations.md#object-expressions))는 자신의 *클로저(closure)*에 접근할 수 있습니다. 클로저에는 외부 범위에서 선언된 변수가 포함됩니다. 클로저에 캡처된 변수는 람다 안에서 수정할 수 있습니다.

```kotlin
var sum = 0
ints.filter { it > 0 }.forEach {
    sum += it
}
print(sum)
```

### 수신 객체가 있는 함수 리터럴 {id="function-literals-with-receiver"}

`A.(B) -> C`와 같은 수신 객체가 있는 [함수 타입](#function-types)은 특별한 형태의 함수 리터럴인 '수신 객체가 있는 함수 리터럴'로 인스턴스화할 수 있습니다.

앞서 언급했듯이, 코틀린은 *수신 객체*를 제공하면서 수신 객체가 있는 함수 타입의 인스턴스를 [호출](#invoking-a-function-type-instance)하는 기능을 제공합니다.

함수 리터럴의 본문 내부에서 호출 시 전달된 수신 객체는 *암시적* `this`가 되므로, 추가적인 한정자 없이 해당 수신 객체의 멤버에 접근하거나 [`this` 표현식](this-expressions.md)을 사용하여 수신 객체에 접근할 수 있습니다.

이 동작은 [확장 함수](extensions.md)와 유사하며, 확장 함수 또한 함수 본문 내에서 수신 객체의 멤버에 접근할 수 있게 해줍니다.

다음은 수신 객체에서 `plus`가 호출되는, 타입과 함께 작성된 수신 객체가 있는 함수 리터럴의 예입니다.

```kotlin
val sum: Int.(Int) -> Int = { other -> plus(other) }
```

익명 함수 문법을 사용하면 함수 리터럴의 수신 객체 타입을 직접 지정할 수 있습니다. 이는 수신 객체가 있는 함수 타입의 변수를 선언하고 나중에 사용해야 할 때 유용할 수 있습니다.

```kotlin
val sum = fun Int.(other: Int): Int = this + other
```

문맥에서 수신 객체 타입을 추론할 수 있는 경우 람다 표현식을 수신 객체가 있는 함수 리터럴로 사용할 수 있습니다. 이러한 사용법의 가장 중요한 예 중 하나가 [타입 안전한 빌더(type-safe builders)](type-safe-builders.md)입니다.

```kotlin
class HTML {
    fun body() { ... }
}

fun html(init: HTML.() -> Unit): HTML {
    val html = HTML()  // 수신 객체 생성
    html.init()        // 수신 객체를 람다에 전달
    return html
}

html {       // 수신 객체가 있는 람다가 여기서 시작됨
    body()   // 수신 객체의 메서드 호출
}
```
