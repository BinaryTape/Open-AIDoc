[//]: # (title: 범위 지정 함수(Scope functions))

Kotlin 표준 라이브러리에는 객체의 컨텍스트 내에서 코드 블록을 실행하는 것만을 목적으로 하는 여러 함수가 포함되어 있습니다. [람다 표현식](lambdas.md)을 제공하여 객체에서 이러한 함수를 호출하면 임시 범위(scope)가 형성됩니다. 이 범위 내에서는 객체의 이름 없이도 해당 객체에 접근할 수 있습니다. 이러한 함수들을 _범위 지정 함수(Scope functions)_라고 부릅니다.
여기에는 [`let`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin/let.html), [`run`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin/run.html), [`with`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin/with.html), [`apply`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin/apply.html), [`also`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin/also.html)의 다섯 가지가 있습니다.

기본적으로 이 함수들은 모두 동일한 동작을 수행합니다. 바로 어떤 객체에 대해 코드 블록을 실행하는 것입니다. 다른 점은 이 객체가 블록 내부에서 어떻게 사용 가능해지는지, 그리고 전체 표현식의 결과가 무엇인지입니다.

범위 지정 함수를 사용하는 전형적인 예는 다음과 같습니다.

```kotlin
data class Person(var name: String, var age: Int, var city: String) {
    fun moveTo(newCity: String) { city = newCity }
    fun incrementAge() { age++ }
}

fun main() {
//sampleStart
    Person("Alice", 20, "Amsterdam").let {
        println(it)
        it.moveTo("London")
        it.incrementAge()
        println(it)
    }
//sampleEnd
}
```
{kotlin-runnable="true"}

`let` 없이 동일한 코드를 작성한다면 새로운 변수를 선언하고, 해당 변수를 사용할 때마다 그 이름을 반복해서 써야 합니다.

```kotlin
data class Person(var name: String, var age: Int, var city: String) {
    fun moveTo(newCity: String) { city = newCity }
    fun incrementAge() { age++ }
}

fun main() {
//sampleStart
    val alice = Person("Alice", 20, "Amsterdam")
    println(alice)
    alice.moveTo("London")
    alice.incrementAge()
    println(alice)
//sampleEnd
}
```
{kotlin-runnable="true"}

범위 지정 함수가 새로운 기술적 기능을 도입하는 것은 아니지만, 코드를 더 간결하고 읽기 쉽게 만들어 줄 수 있습니다.

범위 지정 함수들 간에는 유사한 점이 많기 때문에, 상황에 맞는 올바른 함수를 선택하기가 까다로울 수 있습니다. 선택은 주로 의도와 프로젝트 내에서의 사용 일관성에 따라 달라집니다. 아래에서는 범위 지정 함수 간의 차이점과 규칙에 대해 자세히 설명합니다.

## 함수 선택 {id="function-selection"}

목적에 맞는 올바른 범위 지정 함수를 선택하는 데 도움이 되도록, 주요 차이점을 요약한 표를 제공합니다.

| 함수                                                                      | 객체 참조        | 반환값          | 확장 함수 여부                               |
|---------------------------------------------------------------------------|------------------|----------------|----------------------------------------------|
| [`let`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin/let.html)     | `it`             | 람다 결과       | 예                                           |
| [`run`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin/run.html)     | `this`           | 람다 결과       | 예                                           |
| [`run`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin/run.html)     | -                | 람다 결과       | 아니오: 컨텍스트 객체 없이 호출됨             |
| [`with`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin/with.html)   | `this`           | 람다 결과       | 아니오: 컨텍스트 객체를 인수로 받음           |
| [`apply`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin/apply.html) | `this`           | 컨텍스트 객체   | 예                                           |
| [`also`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin/also.html)   | `it`             | 컨텍스트 객체   | 예                                           |

이 함수들에 대한 자세한 정보는 아래의 전용 섹션에서 제공합니다.

다음은 용도에 따라 범위 지정 함수를 선택하기 위한 간단한 가이드입니다.

* 널이 될 수 없는(non-nullable) 객체에 대해 람다 실행: `let`
* 로컬 범위에서 표현식을 변수로 도입: `let`
* 객체 설정(configuration): `apply`
* 객체 설정 및 결과 계산: `run`
* 표현식이 필요한 곳에서 문장(statement) 실행: 비확장 `run`
* 추가적인 부가 효과(Additional effects): `also`
* 어떤 객체에 대한 함수 호출 그룹화: `with`

서로 다른 범위 지정 함수의 사용 사례는 겹치는 부분이 있으므로, 프로젝트나 팀에서 사용하는 특정 규칙에 따라 사용할 함수를 선택할 수 있습니다.

범위 지정 함수가 코드를 더 간결하게 만들어 줄 수는 있지만 과도한 사용은 피해야 합니다. 코드를 읽기 어렵게 만들고 오류를 유발할 수 있기 때문입니다. 또한 범위 지정 함수를 중첩하는 것은 피하고 체이닝할 때 주의를 기울이는 것이 좋습니다. 현재 컨텍스트 객체와 `this` 또는 `it`의 값을 혼동하기 쉽습니다.

## 차이점 {id="distinctions"}

범위 지정 함수는 본질적으로 유사하기 때문에 그 차이점을 이해하는 것이 중요합니다.
각 범위 지정 함수 간에는 크게 두 가지 차이점이 있습니다.
* 컨텍스트 객체를 참조하는 방식
* 반환값

### 컨텍스트 객체: this 또는 it {id="context-object-this-or-it"}

범위 지정 함수에 전달된 람다 내부에서는 실제 이름 대신 짧은 참조를 통해 컨텍스트 객체에 접근할 수 있습니다. 각 범위 지정 함수는 컨텍스트 객체를 참조하기 위해 람다 [수신 객체(receiver)](lambdas.md#function-literals-with-receiver)(`this`)로 참조하거나 람다 인수(`it`)로 참조하는 두 가지 방법 중 하나를 사용합니다. 두 방법 모두 동일한 기능을 제공하므로, 다양한 사용 사례에 대한 각각의 장단점을 설명하고 사용 권장 사항을 제시합니다.

```kotlin
fun main() {
    val str = "Hello"
    // this
    str.run {
        println("The string's length: $length")
        //println("The string's length: ${this.length}") // 동일하게 동작함
    }

    // it
    str.let {
        println("The string's length is ${it.length}")
    }
}
```
{kotlin-runnable="true"}

#### this {id="this"}

`run`, `with`, `apply`는 컨텍스트 객체를 람다 [수신 객체](lambdas.md#function-literals-with-receiver)로 참조하며, 키워드 `this`를 사용합니다. 따라서 해당 람다 내에서는 일반적인 클래스 함수에서와 마찬가지로 객체를 사용할 수 있습니다.

대부분의 경우 수신 객체의 멤버에 접근할 때 `this`를 생략할 수 있어 코드가 더 짧아집니다. 반면에 `this`를 생략하면 수신 객체의 멤버와 외부 객체 또는 함수를 구분하기 어려워질 수 있습니다. 따라서 컨텍스트 객체를 수신 객체(`this`)로 가지는 것은 주로 함수의 호출이나 프로퍼티에 값을 할당하여 객체의 멤버를 조작하는 람다에 사용하는 것이 좋습니다.

```kotlin
data class Person(var name: String, var age: Int = 0, var city: String = "")

fun main() {
//sampleStart
    val adam = Person("Adam").apply { 
        age = 20                       // this.age = 20 과 동일
        city = "London"
    }
    println(adam)
//sampleEnd
}
```
{kotlin-runnable="true"}

#### it {id="it"}

반면 `let`과 `also`는 컨텍스트 객체를 람다 [인수](lambdas.md#lambda-expression-syntax)로 참조합니다. 인수의 이름이 지정되지 않으면 암시적인 기본 이름인 `it`으로 객체에 접근합니다. `it`은 `this`보다 짧으며 `it`을 사용하는 표현식은 일반적으로 읽기가 더 쉽습니다.

하지만 객체의 함수나 프로퍼티를 호출할 때 `this`처럼 객체를 암시적으로 사용할 수는 없습니다. 따라서 컨텍스트 객체가 주로 함수 호출의 인수로 사용되는 경우에는 `it`을 통해 컨텍스트 객체에 접근하는 것이 더 낫습니다. 코드 블록에서 여러 변수를 사용하는 경우에도 `it`이 더 좋습니다.

```kotlin
import kotlin.random.Random

fun writeToLog(message: String) {
    println("INFO: $message")
}

fun main() {
//sampleStart
    fun getRandomInt(): Int {
        return Random.nextInt(100).also {
            writeToLog("getRandomInt() generated value $it")
        }
    }
    
    val i = getRandomInt()
    println(i)
//sampleEnd
}
```
{kotlin-runnable="true"}

아래 예제는 컨텍스트 객체를 람다 인수로 참조하면서 인수 이름을 `value`로 지정하는 방법을 보여줍니다.

```kotlin
import kotlin.random.Random

fun writeToLog(message: String) {
    println("INFO: $message")
}

fun main() {
//sampleStart
    fun getRandomInt(): Int {
        return Random.nextInt(100).also { value ->
            writeToLog("getRandomInt() generated value $value")
        }
    }
    
    val i = getRandomInt()
    println(i)
//sampleEnd
}
```
{kotlin-runnable="true"}

### 반환값 {id="return-value"}

범위 지정 함수는 반환하는 결과에 따라 차이가 있습니다.
* `apply`와 `also`는 컨텍스트 객체를 반환합니다.
* `let`, `run`, `with`는 람다 결과를 반환합니다.

코드에서 다음에 무엇을 하고자 하는지에 따라 어떤 반환값을 원하는지 신중하게 고려해야 합니다. 이를 통해 사용할 최적의 범위 지정 함수를 선택할 수 있습니다.

#### 컨텍스트 객체 {id="context-object"}

`apply`와 `also`의 반환값은 컨텍스트 객체 자체입니다. 따라서 _부가적인 단계(side steps)_로서 호출 체인에 포함될 수 있습니다. 즉, 동일한 객체에 대해 연속해서 함수 호출을 체이닝할 수 있습니다.

```kotlin
fun main() {
//sampleStart
    val numberList = mutableListOf<Double>()
    numberList.also { println("Populating the list") }
        .apply {
            add(2.71)
            add(3.14)
            add(1.0)
        }
        .also { println("Sorting the list") }
        .sort()
//sampleEnd
    println(numberList)
}
```
{kotlin-runnable="true"}

컨텍스트 객체를 반환하는 함수의 `return` 문에도 사용할 수 있습니다.

```kotlin
import kotlin.random.Random

fun writeToLog(message: String) {
    println("INFO: $message")
}

fun main() {
//sampleStart
    fun getRandomInt(): Int {
        return Random.nextInt(100).also {
            writeToLog("getRandomInt() generated value $it")
        }
    }
    
    val i = getRandomInt()
//sampleEnd
}
```
{kotlin-runnable="true"}

#### 람다 결과 {id="lambda-result"}

`let`, `run`, `with`는 람다 결과를 반환합니다. 따라서 결과를 변수에 할당하거나, 결과에 대한 연산을 체이닝하는 등의 용도로 사용할 수 있습니다.

```kotlin
fun main() {
//sampleStart
    val numbers = mutableListOf("one", "two", "three")
    val countEndsWithE = numbers.run { 
        add("four")
        add("five")
        count { it.endsWith("e") }
    }
    println("There are $countEndsWithE elements that end with e.")
//sampleEnd
}
```
{kotlin-runnable="true"}

추가적으로, 반환값을 무시하고 지역 변수를 위한 임시 범위를 생성하는 용도로 범위 지정 함수를 사용할 수도 있습니다.

```kotlin
fun main() {
//sampleStart
    val numbers = mutableListOf("one", "two", "three")
    with(numbers) {
        val firstItem = first()
        val lastItem = last()        
        println("First item: $firstItem, last item: $lastItem")
    }
//sampleEnd
}
```
{kotlin-runnable="true"}

## 함수별 상세 설명 {id="functions"}

상황에 맞는 올바른 범위 지정 함수를 선택하는 데 도움을 주기 위해 각 함수를 자세히 설명하고 사용 권장 사항을 제공합니다. 기술적으로 범위 지정 함수는 많은 경우 서로 대체 가능하므로, 아래 예제들은 각 함수의 관용적인 사용법을 보여줍니다.

### let {id="let"}

- **컨텍스트 객체**는 인수(`it`)로 사용할 수 있습니다.
- **반환값**은 람다 결과입니다.

[`let`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin/let.html)은 호출 체인의 결과에 대해 하나 이상의 함수를 호출하는 데 사용할 수 있습니다. 예를 들어 다음 코드는 컬렉션에 대한 두 가지 연산 결과를 출력합니다.

```kotlin
fun main() {
//sampleStart
    val numbers = mutableListOf("one", "two", "three", "four", "five")
    val resultList = numbers.map { it.length }.filter { it > 3 }
    println(resultList)    
//sampleEnd
}
```
{kotlin-runnable="true"}

`let`을 사용하면 리스트 연산의 결과를 변수에 할당하지 않도록 위 예제를 다시 작성할 수 있습니다.

```kotlin
fun main() {
//sampleStart
    val numbers = mutableListOf("one", "two", "three", "four", "five")
    numbers.map { it.length }.filter { it > 3 }.let { 
        println(it)
        // 필요한 경우 추가 함수 호출
    } 
//sampleEnd
}
```
{kotlin-runnable="true"}

`let`에 전달된 코드 블록이 `it`을 단일 인수로 받는 단일 함수를 포함하고 있다면, 람다 인수 대신 메서드 참조(`::`)를 사용할 수 있습니다.

```kotlin
fun main() {
//sampleStart
    val numbers = mutableListOf("one", "two", "three", "four", "five")
    numbers.map { it.length }.filter { it > 3 }.let(::println)
//sampleEnd
}
```
{kotlin-runnable="true"}

`let`은 널이 아닌(non-null) 값을 포함하는 코드 블록을 실행하는 데 자주 사용됩니다. 널이 될 수 있는(nullable) 객체에 대해 작업을 수행하려면 해당 객체에 [안전 호출 연산자 `?.`](null-safety.md#safe-call-operator)를 사용하고, 람다 내에 작업 내용을 담아 `let`을 호출하세요.

```kotlin
fun processNonNullString(str: String) {}

fun main() {
//sampleStart
    val str: String? = "Hello"   
    //processNonNullString(str)       // 컴파일 오류: str이 null일 수 있음
    val length = str?.let { 
        println("let() called on $it")        
        processNonNullString(it)      // 정상: '?.let { }' 내부에서 'it'은 null이 아님
        it.length
    }
//sampleEnd
}
```
{kotlin-runnable="true"}

또한 제한된 범위를 가진 지역 변수를 도입하여 코드를 읽기 쉽게 만들기 위해 `let`을 사용할 수도 있습니다. 컨텍스트 객체에 새 변수명을 정의하려면 기본 `it` 대신 사용할 이름을 람다 인수로 지정하세요.

```kotlin
fun main() {
//sampleStart
    val numbers = listOf("one", "two", "three", "four")
    val modifiedFirstItem = numbers.first().let { firstItem ->
        println("The first item of the list is '$firstItem'")
        if (firstItem.length >= 5) firstItem else "!" + firstItem + "!"
    }.uppercase()
    println("First item after modifications: '$modifiedFirstItem'")
//sampleEnd
}
```
{kotlin-runnable="true"}

### with {id="with"}

- **컨텍스트 객체**는 수신 객체(`this`)로 사용할 수 있습니다.
- **반환값**은 람다 결과입니다.

[`with`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin/with.html)는 확장 함수가 아닙니다. 컨텍스트 객체는 인수로 전달되지만 람다 내부에서는 수신 객체(`this`)로 사용할 수 있습니다.

반환된 결과를 사용할 필요가 없을 때 컨텍스트 객체에 대한 함수를 호출하기 위해 `with`를 사용하는 것을 권장합니다. 코드에서 `with`는 "_이 객체를 가지고 다음 작업을 수행하라._"로 읽을 수 있습니다.

```kotlin
fun main() {
//sampleStart
    val numbers = mutableListOf("one", "two", "three")
    with(numbers) {
        println("'with' is called with argument $this")
        println("It contains $size elements")
    }
//sampleEnd
}
```
{kotlin-runnable="true"}

값을 계산하는 데 프로퍼티나 함수가 사용되는 헬퍼 객체를 도입할 때도 `with`를 사용할 수 있습니다.

```kotlin
fun main() {
//sampleStart
    val numbers = mutableListOf("one", "two", "three")
    val firstAndLast = with(numbers) {
        "The first element is ${first()}," +
        " the last element is ${last()}"
    }
    println(firstAndLast)
//sampleEnd
}
```
{kotlin-runnable="true"}

### run {id="run"}

- **컨텍스트 객체**는 수신 객체(`this`)로 사용할 수 있습니다.
- **반환값**은 람다 결과입니다.

[`run`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin/run.html)은 `with`와 동일한 작업을 수행하지만 확장 함수로 구현되어 있습니다. 따라서 `let`처럼 점 표기법(dot notation)을 사용하여 컨텍스트 객체에서 호출할 수 있습니다.

`run`은 람다가 객체를 초기화하고 반환값을 계산하는 두 가지 작업을 모두 수행할 때 유용합니다.

```kotlin
class MultiportService(var url: String, var port: Int) {
    fun prepareRequest(): String = "Default request"
    fun query(request: String): String = "Result for query '$request'"
}

fun main() {
//sampleStart
    val service = MultiportService("https://example.kotlinlang.org", 80)

    val result = service.run {
        port = 8080
        query(prepareRequest() + " to port $port")
    }
    
    // let() 함수를 사용하여 작성한 동일한 코드:
    val letResult = service.let {
        it.port = 8080
        it.query(it.prepareRequest() + " to port ${it.port}")
    }
//sampleEnd
}
```
{kotlin-runnable="true"}

비확장 함수로 `run`을 호출할 수도 있습니다. `run`의 비확장 버전은 컨텍스트 객체가 없지만 여전히 람다 결과를 반환합니다. 비확장 `run`을 사용하면 표현식이 필요한 곳에서 여러 문장으로 구성된 블록을 실행할 수 있습니다. 코드에서 비확장 `run`은 "_코드 블록을 실행하고 결과를 계산하라._"로 읽을 수 있습니다.

```kotlin
fun main() {
//sampleStart
    val hexNumberRegex = run {
        val digits = "0-9"
        val hexDigits = "A-Fa-f"
        val sign = "+-"
        
        Regex("[$sign]?[$digits$hexDigits]+")
    }
    
    for (match in hexNumberRegex.findAll("+123 -FFFF !%*& 88 XYZ")) {
        println(match.value)
    }
//sampleEnd
}
```
{kotlin-runnable="true"}

### apply {id="apply"}

- **컨텍스트 객체**는 수신 객체(`this`)로 사용할 수 있습니다.
- **반환값**은 객체 자신입니다.

[`apply`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin/apply.html)는 컨텍스트 객체 자체를 반환하므로 값을 반환하지 않고 주로 수신 객체의 멤버를 조작하는 코드 블록에 사용하는 것을 권장합니다. `apply`의 가장 일반적인 사용 사례는 객체 구성(configuration)입니다. 이러한 호출은 "_객체에 다음 할당을 적용하라._"로 읽을 수 있습니다.

```kotlin
data class Person(var name: String, var age: Int = 0, var city: String = "")

fun main() {
//sampleStart
    val adam = Person("Adam").apply {
        age = 32
        city = "London"        
    }
    println(adam)
//sampleEnd
}
```
{kotlin-runnable="true"}

`apply`의 또 다른 사용 사례는 더 복잡한 처리를 위해 다중 호출 체인에 `apply`를 포함하는 것입니다.

### also {id="also"}

- **컨텍스트 객체**는 인수(`it`)로 사용할 수 있습니다.
- **반환값**은 객체 자신입니다.

[`also`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin/also.html)는 컨텍스트 객체를 인수로 취하는 동작을 수행할 때 유용합니다. 객체의 프로퍼티와 함수보다는 객체 자체에 대한 참조가 필요한 동작이나, 외부 범위의 `this` 참조를 섀도잉(가리는 것)하고 싶지 않을 때 `also`를 사용하세요.

코드에서 `also`를 보면 "_그리고 객체를 사용하여 다음 작업도 수행하라._"로 읽을 수 있습니다.

```kotlin
fun main() {
//sampleStart
    val numbers = mutableListOf("one", "two", "three")
    numbers
        .also { println("The list elements before adding new one: $it") }
        .add("four")
//sampleEnd
}
```
{kotlin-runnable="true"}

## takeIf 및 takeUnless {id="takeif-and-takeunless"}

표준 라이브러리에는 범위 지정 함수 외에도 [`takeIf`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin/take-if.html) 및 [`takeUnless`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin/take-unless.html) 함수가 포함되어 있습니다. 이 함수들을 사용하면 호출 체인 내에 객체 상태에 대한 검사를 포함할 수 있습니다.

조건식(predicate)과 함께 객체에서 호출되었을 때, `takeIf`는 주어진 조건식을 만족하면 이 객체를 반환합니다. 그렇지 않으면 `null`을 반환합니다. 따라서 `takeIf`는 단일 객체에 대한 필터링 함수입니다.

`takeUnless`는 `takeIf`와 반대의 로직을 갖습니다. 조건식과 함께 객체에서 호출되었을 때, `takeUnless`는 주어진 조건식을 만족하면 `null`을 반환합니다. 그렇지 않으면 객체를 반환합니다.

`takeIf`나 `takeUnless`를 사용할 때 객체는 람다 인수(`it`)로 사용할 수 있습니다.

```kotlin
import kotlin.random.*

fun main() {
//sampleStart
    val number = Random.nextInt(100)

    val evenOrNull = number.takeIf { it % 2 == 0 }
    val oddOrNull = number.takeUnless { it % 2 == 0 }
    println("even: $evenOrNull, odd: $oddOrNull")
//sampleEnd
}
```
{kotlin-runnable="true"}

> `takeIf` 및 `takeUnless` 뒤에 다른 함수를 체이닝할 때는 반환값이 nullable이므로 null 검사를 수행하거나 안전 호출(`?.`)을 사용하는 것을 잊지 마세요.
>
{style="tip"}

```kotlin
fun main() {
//sampleStart
    val str = "Hello"
    val caps = str.takeIf { it.isNotEmpty() }?.uppercase()
   //val caps = str.takeIf { it.isNotEmpty() }.uppercase() // 컴파일 오류
    println(caps)
//sampleEnd
}
```
{kotlin-runnable="true"}

`takeIf`와 `takeUnless`는 범위 지정 함수와 함께 사용할 때 특히 유용합니다. 예를 들어 `takeIf` 및 `takeUnless`를 `let`과 체이닝하여 주어진 조건식과 일치하는 객체에 대해서만 코드 블록을 실행할 수 있습니다. 이렇게 하려면 객체에서 `takeIf`를 호출한 다음 안전 호출(`?`)을 사용하여 `let`을 호출하세요. 조건식과 일치하지 않는 객체의 경우 `takeIf`가 `null`을 반환하므로 `let`은 호출되지 않습니다.

```kotlin
fun main() {
//sampleStart
    fun displaySubstringPosition(input: String, sub: String) {
        input.indexOf(sub).takeIf { it >= 0 }?.let {
            println("The substring $sub is found in $input.")
            println("Its start position is $it.")
        }
    }

    displaySubstringPosition("010000011", "11")
    displaySubstringPosition("010000011", "12")
//sampleEnd
}
```
{kotlin-runnable="true"}

비교를 위해, `takeIf`나 범위 지정 함수를 사용하지 않고 동일한 함수를 작성하는 방법의 예는 다음과 같습니다.

```kotlin
fun main() {
//sampleStart
    fun displaySubstringPosition(input: String, sub: String) {
        val index = input.indexOf(sub)
        if (index >= 0) {
            println("The substring $sub is found in $input.")
            println("Its start position is $index.")
        }
    }

    displaySubstringPosition("010000011", "11")
    displaySubstringPosition("010000011", "12")
//sampleEnd
}
```
{kotlin-runnable="true"}