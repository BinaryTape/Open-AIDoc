[//]: # (title: 함수)

Kotlin에서 함수를 선언하려면 다음을 수행합니다:
* `fun` 키워드를 사용합니다.
* 괄호 `()` 안에 파라미터를 지정합니다.
* 필요한 경우 [반환 타입](#return-types)을 포함합니다.

예를 들어:

```kotlin
//sampleStart
// 'double'은 함수의 이름입니다.
// 'x'는 Int 타입의 파라미터입니다.
// 예상되는 반환 값 역시 Int 타입입니다.
fun double(x: Int): Int {
    return 2 * x
}
//sampleEnd

fun main() {
    println(double(5))
    // 10
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3" validate="false" id="kotlin-function-double"}

## 함수 사용법

함수는 표준 방식으로 호출합니다:

```kotlin
val result = double(2)
```

[멤버](classes.md) 또는 [확장 함수](extensions.md#extension-functions)를 호출하려면 마침표 `.`를 사용합니다:

```kotlin
// Stream 클래스의 인스턴스를 생성하고 read()를 호출합니다.
Stream().read()
```

### 파라미터

함수 파라미터는 파스칼 표기법(Pascal notation)인 `name: Type` 형식을 사용하여 선언합니다.
파라미터는 쉼표로 구분해야 하며, 각 파라미터에 명시적으로 타입을 지정해야 합니다:

```kotlin
fun powerOf(number: Int, exponent: Int): Int { /*...*/ }
```

함수 본문 내에서 전달받은 인자(arguments)는 읽기 전용입니다(암시적으로 `val`로 선언됨):

```kotlin
fun powerOf(number: Int, exponent: Int): Int {
    number = 2 // 오류: 'val'은 재할당할 수 없습니다.
}
```

함수 파라미터를 선언할 때 [후행 쉼표(trailing comma)](coding-conventions.md#trailing-commas)를 사용할 수 있습니다:

```kotlin
fun powerOf(
    number: Int,
    exponent: Int, // 후행 쉼표
) { /*...*/ }
```

후행 쉼표는 리팩터링과 코드 유지보수에 도움이 됩니다. 어떤 파라미터가 마지막이 될지 걱정하지 않고 선언 내에서 파라미터의 위치를 옮길 수 있습니다.

> Kotlin 함수는 다른 함수를 파라미터로 받을 수 있으며, 인자로 전달될 수도 있습니다.
> 자세한 내용은 [](lambdas.md)를 참조하세요.
> 
{style="note"}

### 기본값을 가진 파라미터 {id="parameters-with-default-values"}

함수 파라미터에 기본값을 지정하여 선택적(optional)으로 만들 수 있습니다.
Kotlin은 파라미터에 대응하는 인자를 제공하지 않고 함수를 호출할 때 기본값을 사용합니다.
기본값이 있는 파라미터는 _선택적 파라미터(optional parameters)_라고도 합니다.

선택적 파라미터를 사용하면 적절한 기본값으로 파라미터를 생략할 수 있게 해주므로, 단순히 파라미터 생략을 허용하기 위해 함수를 여러 번 오버로드할 필요성이 줄어듭니다.

파라미터 선언 뒤에 `=`를 붙여 기본값을 설정합니다:

```kotlin
fun read(
    b: ByteArray,
    // 'off'의 기본값은 0입니다.
    off: Int = 0,
    // 'len'의 기본값은 'b' 배열의 크기로
    // 계산됩니다.
    len: Int = b.size,
) { /*...*/ }
```

기본값이 **있는** 파라미터를 기본값이 **없는** 파라미터보다 먼저 선언하는 경우, [이름 붙은 인자(named arguments)](#named-arguments)를 사용해야만 기본값을 사용할 수 있습니다:

```kotlin
fun greeting(
    userId: Int = 0,
    message: String,
) { /*...*/ }

fun main() {
    // 'userId'에 기본값 0을 사용합니다.
    greeting(message = "Hello!")
    
    // 오류: 'userId' 파라미터에 값이 전달되지 않았습니다.
    greeting("Hello!")
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3" validate="false" id="default-before-ordinary"}

마지막 파라미터가 전달된 함수와 일치해야 하는 [후행 람다(trailing lambdas)](lambdas.md#passing-trailing-lambdas)는 이 규칙의 예외입니다:

```kotlin
fun main () {
//sampleStart    
fun greeting(
    userId: Int = 0,
    message: () -> Unit,
)
{ println(userId)
  message() }
    
// 'userId'에 기본값을 사용합니다.
greeting() { println ("Hello!") }
// 0
// Hello!
//sampleEnd
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3" id="default-before-trailing-lambda"}

[메서드 오버라이딩](inheritance.md#overriding-methods) 시에는 항상 기본 메서드의 기본 파라미터 값을 사용합니다. 기본 파라미터 값이 있는 메서드를 오버라이드할 때는 시그니처에서 기본 파라미터 값을 생략해야 합니다:

```kotlin
open class Shape {
    open fun draw(width: Int = 10, height: Int = 5) { /*...*/ }
}

class Rectangle : Shape() {
    // 여기에서 기본값을 지정하는 것은 허용되지 않지만,
    // 이 함수도 기본적으로 'width'에 10, 'height'에 5를
    // 사용합니다.
    override fun draw(width: Int, height: Int) { /*...*/ }
}
```

#### 기본값으로 사용되는 비상수 표현식

파라미터에 상수가 아닌 기본값을 할당할 수 있습니다.
예를 들어, 기본값은 아래 예제의 `len` 파라미터처럼 함수 호출 결과나 다른 인자의 값을 사용하는 계산 결과가 될 수 있습니다:

```kotlin
fun read(
    b: ByteArray,
    off: Int = 0,
    len: Int = b.size,
) { /*...*/ }
```

다른 파라미터의 값을 참조하는 파라미터는 순서상 나중에 선언되어야 합니다. 이 예제에서 `len`은 `b` 다음에 선언되어야 합니다.

일반적으로 파라미터의 기본값으로 모든 표현식을 할당할 수 있습니다.
하지만 기본값은 해당 파라미터 **없이** 함수가 호출되어 기본값을 할당해야 할 때만 평가됩니다.
예를 들어, 다음 함수는 `print` 파라미터 없이 호출될 때만 한 줄을 출력합니다:

```kotlin
fun main() {
//sampleStart
    fun read(
        b: Int,
        print: Unit? = println("No argument passed for 'print'")
    ) { println(b) }
    
    // "No argument passed for 'print'"를 출력한 후 "1"을 출력합니다.
    read(1)
    // "1"만 출력합니다.
    read(1, null)
    //sampleEnd
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3" id="non-constant-default"}

함수 선언의 마지막 파라미터가 함수형 타입(functional type)인 경우, 대응하는 [람다](lambdas.md#lambda-expression-syntax) 인자를 이름 붙은 인자로 전달하거나 [괄호 밖](lambdas.md#passing-trailing-lambdas)으로 전달할 수 있습니다:

```kotlin
fun main() {
    //sampleStart
    fun log(
        level: Int = 0,
        code:  Int = 1,
        action: () -> Unit,
    ) { println (level)
        println (code)
        action() }
    
    // 'level'에 1을 전달하고 'code'에 기본값 1을 사용합니다.
    log(1) { println("Connection established") }
    
    // 'level'에 0, 'code'에 1인 두 기본값을 모두 사용합니다.
    log(action = { println("Connection established") })
    
    // 이전 호출과 동일하게 두 기본값을 모두 사용합니다.
    log { println("Connection established") }
    //sampleEnd
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3" id="lambda-outside-parentheses"}

### 이름 붙은 인자

함수를 호출할 때 하나 이상의 함수 인자에 이름을 붙일 수 있습니다.
이는 함수 호출에 인자가 많을 때 유용할 수 있습니다. 특히 값이 `null`이거나 불리언 값인 경우 값을 인자와 연관 짓기 어렵기 때문에 이런 상황에서 도움이 됩니다.

함수 호출에서 이름 붙은 인자를 사용할 때, 순서에 상관없이 나열할 수 있습니다.

기본값을 가진 4개의 인자가 있는 `reformat()` 함수를 고려해 보세요:

```kotlin
fun reformat(
    str: String,
    normalizeCase: Boolean = true,
    upperCaseFirstLetter: Boolean = true,
    divideByCamelHumps: Boolean = false,
    wordSeparator: Char = ' ',
) { /*...*/ }
```

이 함수를 호출할 때 인자 일부에 이름을 붙일 수 있습니다:

```kotlin
reformat(
    "String!",
    normalizeCase = false,
    upperCaseFirstLetter = false,
    divideByCamelHumps = true,
    '_'
)
```

기본값이 있는 모든 인자를 생략할 수 있습니다:

```kotlin
reformat("This is a long String!")
```

또한 모든 인자를 생략하는 대신 기본값이 있는 _일부_ 인자만 생략할 수도 있습니다.
하지만 첫 번째로 생략된 인자 이후의 모든 후속 인자에는 이름을 붙여야 합니다:

```kotlin
reformat(
    "This is a short String!",
    upperCaseFirstLetter = false,
    wordSeparator = '_'
)
```

대응하는 인자에 이름을 붙여서 [가변 인자(varargs)](#variable-number-of-arguments-varargs)(`vararg`)를 전달할 수 있습니다. 이 예제에서는 배열입니다:

```kotlin
fun mergeStrings(vararg strings: String) { /*...*/ }

mergeStrings(strings = arrayOf("a", "b", "c"))
```

<!-- Rationale for named arguments interaction with varargs is here https://youtrack.jetbrains.com/issue/KT-52505#focus=Comments-27-6147916.0-0 -->

> JVM에서 Java 함수를 호출할 때는 Java 바이트코드가 함수 파라미터의 이름을 항상 보존하지 않기 때문에 이름 붙은 인자 구문을 사용할 수 없습니다.
>
{style="note"}

### 반환 타입

중괄호 `{}` 안에 명령문을 넣는 블록 본문을 사용하여 함수를 선언할 때는 항상 반환 타입을 명시적으로 지정해야 합니다.
단, `Unit`을 반환하는 경우에는 [반환 타입 지정이 선택 사항입니다](#unit-returning-functions).

Kotlin은 블록 본문을 가진 함수의 반환 타입을 추론하지 않습니다. 블록 본문은 제어 흐름이 복잡할 수 있어 읽는 사람이나 때로는 컴파일러에게도 반환 타입이 명확하지 않을 수 있기 때문입니다.
하지만 [단일 표현식 함수](#single-expression-functions)의 경우 반환 타입을 명시하지 않아도 Kotlin이 반환 타입을 추론할 수 있습니다.

### 단일 표현식 함수

함수 본문이 단일 표현식으로 구성된 경우, 중괄호를 생략하고 `=` 기호 뒤에 본문을 지정할 수 있습니다:

```kotlin
fun double(x: Int): Int = x * 2
```

대부분의 경우 [반환 타입](#return-types)을 명시적으로 선언하지 않아도 됩니다:

```kotlin
// 컴파일러가 함수가 Int를 반환함을 추론합니다.
fun double(x: Int) = x * 2
```

단일 표현식에서 반환 타입을 추론할 때 컴파일러가 문제를 겪는 경우가 가끔 있습니다.
이러한 경우에는 반환 타입을 명시적으로 추가해야 합니다.
예를 들어, 재귀 함수나 상호 재귀 함수(서로 호출하는 함수), 그리고 `fun empty() = null`과 같이 타입이 없는 표현식이 있는 함수는 항상 반환 타입이 필요합니다.

추론된 반환 타입을 사용할 때는 컴파일러가 덜 유용한 타입을 추론할 수 있으므로 실제 결과를 반드시 확인해야 합니다.
위의 예에서 `double()` 함수가 `Int` 대신 `Number`를 반환하도록 하려면 이를 명시적으로 선언해야 합니다.

### Unit을 반환하는 함수

함수가 블록 본문(중괄호 `{}` 안의 명령문)을 가지고 있고 유용한 값을 반환하지 않는 경우, 컴파일러는 반환 타입을 `Unit`으로 간주합니다.
`Unit`은 `Unit`이라는 하나의 값만 가지는 타입입니다.

함수형 타입 파라미터를 제외하고는 반환 타입으로 `Unit`을 명시할 필요가 없습니다. 또한 `Unit`을 명시적으로 반환할 필요도 없습니다.

예를 들어, `Unit`을 반환하지 않고 `printHello()` 함수를 선언할 수 있습니다:

```kotlin
// 함수형 타입 파라미터('action')의 선언에는 
// 여전히 명시적인 반환 타입이 필요합니다.
fun printHello(name: String?, action: () -> Unit) {
    if (name != null)
        println("Hello $name")
    else
        println("Hi there!")

    action()
}

fun main() {
    printHello("Kodee") {
        println("This runs after the greeting.")
    }
    // Hello Kodee
    // This runs after the greeting.

    printHello(null) {
        println("No name provided, but action still runs.")
    }
    // No name provided, but action still runs
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3" validate="false" id="return-unit-implicit"}

이는 다음의 장황한 선언과 동일합니다:

```kotlin
//sampleStart
fun printHello(name: String?, action: () -> Unit): Unit {
    if (name != null)
        println("Hello $name")
    else
        println("Hi there!")

    action()
    return Unit
}
//sampleEnd
fun main() {
    printHello("Kodee") {
        println("This runs after the greeting.")
    }
    // Hello Kodee
    // This runs after the greeting.

    printHello(null) {
        println("No name provided, but action still runs.")
    }
    // No name provided, but action still runs
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3" validate="false" id="return-unit-explicit"}

함수의 반환 타입이 명시적으로 지정된 경우 표현식 본문 내에서 `return` 문을 사용할 수 있습니다:

```kotlin
fun getDisplayNameOrDefault(userId: String?): String =
    getDisplayName(userId ?: return "default")
```

### 가변 인자 (varargs)

함수에 가변 개수의 인자를 전달하려면 파라미터(보통 마지막 파라미터) 중 하나에 `vararg` 수정자를 표시할 수 있습니다.
함수 내부에서 `T` 타입의 `vararg` 파라미터는 `T`의 배열로 사용할 수 있습니다:

```kotlin
fun <T> asList(vararg ts: T): `List<T>` {
    val result = ArrayList<T>()
    for (t in ts) // ts는 Array입니다.
        result.add(t)
    return result
}
```

그런 다음 가변 개수의 인자를 함수에 전달할 수 있습니다:

```kotlin
fun <T> asList(vararg ts: T): `List<T>` {
    val result = ArrayList<T>()
    for (t in ts) // ts는 Array입니다.
        result.add(t)
    return result
}

fun main() {
    //sampleStart
    val list = asList(1, 2, 3)
    println(list)
    // [1, 2, 3]
    //sampleEnd
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3" validate="false" id="varargs-aslist"}

단 하나의 파라미터만 `vararg`로 표시할 수 있습니다.
`vararg` 파라미터가 파라미터 리스트의 마지막이 아닌 곳에 선언된 경우, 후속 파라미터의 값은 이름 붙은 인자를 사용하여 전달해야 합니다.
파라미터가 함수 타입인 경우 괄호 밖에 람다를 배치하여 값을 전달할 수도 있습니다.

`vararg` 함수를 호출할 때 `asList(1, 2, 3)` 예제처럼 인자를 개별적으로 전달할 수 있습니다.
이미 배열이 있고 그 내용을 `vararg` 파라미터로 또는 그 일부로 함수에 전달하려는 경우, 배열 이름 앞에 `*`를 붙여 [스프레드 연산자(spread operator)](arrays.md#pass-variable-number-of-arguments-to-a-function)를 사용합니다:

```kotlin
fun <T> asList(vararg ts: T): `List<T>` {
    val result = ArrayList<T>()
    for (t in ts)
        result.add(t)
    return result
}

fun main() {
    //sampleStart
    val a = arrayOf(1, 2, 3)

    // 함수는 배열 [-1, 0, 1, 2, 3, 4]를 받습니다.
    list = asList(-1, 0, *a, 4)

    println(list)
    // [-1, 0, 1, 2, 3, 4]
    //sampleEnd
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3" validate="false" id="varargs-aslist-with-array"}

[원시 타입 배열(primitive type arrays)](arrays.md#primitive-type-arrays)을 `vararg`로 전달하려면 [`.toTypedArray()`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.collections/to-typed-array.html) 함수를 사용하여 일반(타입이 지정된) 배열로 변환해야 합니다:

```kotlin
// 'a'는 원시 타입 배열인 IntArray입니다.
val a = intArrayOf(1, 2, 3)
val list = asList(-1, 0, *a.toTypedArray(), 4)
```

### 중위 표기법 (Infix notation)

`infix` 키워드를 사용하여 괄호나 점(.) 없이 호출할 수 있는 함수를 선언할 수 있습니다.
이를 통해 코드에서 간단한 함수 호출을 더 읽기 쉽게 만들 수 있습니다.

```kotlin
infix fun Int.shl(x: Int): Int { /*...*/ }

// 일반적인 표기법을 사용하여 함수를 호출합니다.
1.shl(2)

// 중위 표기법을 사용하여 함수를 호출합니다.
1 shl 2
```

중위 함수(Infix functions)는 다음 요구 사항을 충족해야 합니다:

* 클래스의 멤버 함수이거나 [확장 함수](extensions.md)여야 합니다.
* 단일 파라미터를 가져야 합니다.
* 파라미터는 [가변 인자](#variable-number-of-arguments-varargs)(`vararg`)를 허용하지 않아야 하며 [기본값](#parameters-with-default-values)이 없어야 합니다.

> 중위 함수 호출은 산술 연산자, 타입 캐스트 및 `rangeTo` 연산자보다 우선순위가 낮습니다.
> 다음 표현식은 서로 동일합니다:
> * `1 shl 2 + 3`은 `1 shl (2 + 3)`과 동일합니다.
> * `0 until n * 2`는 `0 until (n * 2)`와 동일합니다.
> * `xs union ys as Set<*>`는 `xs union (ys as Set<*>)`과 동일합니다.
>
> 반면, 중위 함수 호출의 우선순위는 불리언 연산자 `&&` 및 `||`, `is`- 및 `in`-검사 및 일부 다른 연산자보다 높습니다. 다음 표현식도 서로 동일합니다:
> * `a && b xor c`는 `a && (b xor c)`와 동일합니다.
> * `a xor b in c`는 `(a xor b) in c`와 동일합니다.
>
{style="note"}

중위 함수는 항상 수신 객체(receiver)와 파라미터가 모두 지정되어야 합니다.
중위 표기법을 사용하여 현재 수신 객체에서 메서드를 호출할 때는 `this`를 명시적으로 사용하세요. 이는 모호하지 않은 파싱을 보장하기 위함입니다.

```kotlin
class MyStringCollection {
    val items = mutableListOf<String>()

    infix fun add(s: String) {
        println("Adding: $s")
        items += s
    }

    fun build() {
        add("first")      // 올바름: 일반적인 함수 호출
        this add "second" // 올바름: 명시적 수신 객체를 사용한 중위 호출
        // add "third"    // 컴파일러 오류: 명시적 수신 객체가 필요함
    }

    fun printAll() = println("Items = $items")
}

fun main() {
    val myStrings = MyStringCollection()
    // 리스트에 "first"와 "second"를 두 번 추가합니다.
    myStrings.build()
      
    myStrings.printAll()
    // Adding: first
    // Adding: second
    // Items = [first, second]
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3" id="infix-notation-example"}

## 함수 범위

Kotlin 함수는 파일의 최상위 레벨에서 선언할 수 있습니다. 즉, 함수를 담기 위해 클래스를 만들 필요가 없습니다.
함수는 _멤버 함수_ 또는 _확장 함수_로서 로컬로 선언될 수도 있습니다.

### 로컬 함수

Kotlin은 다른 함수 안에 선언된 함수인 로컬 함수를 지원합니다.
예를 들어, 다음 코드는 주어진 그래프에 대한 깊이 우선 탐색(DFS) 알고리즘을 구현합니다.
외부 `dfs()` 함수 내부의 로컬 `dfs()` 함수는 구현을 숨기고 재귀 호출을 처리합니다:

```kotlin
class Person(val name: String) {
    val friends = mutableListOf<Person>()
}
class SocialGraph(val people: List<Person>)
//sampleStart
fun dfs(graph: SocialGraph) {
    fun dfs(current: Person, visited: MutableSet<Person>) {
        if (!visited.add(current)) return
        println("Visited ${current.name}")
        for (friend in current.friends)
            dfs(friend, visited)
    }
    dfs(graph.people[0], HashSet())
}
//sampleEnd
fun main() {
    val alice = Person("Alice")
    val bob = Person("Bob")
    val charlie = Person("Charlie")
    alice.friends += bob
    bob.friends += charlie
    charlie.friends += alice
    val network = SocialGraph(listOf(alice, bob, charlie))
    dfs(network)
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3" id="local-functions-dfs"}

로컬 함수는 외부 함수의 로컬 변수(클로저)에 접근할 수 있습니다.
위의 경우, `visited` 함수 파라미터는 로컬 변수가 될 수 있습니다:

```kotlin
class Person(val name: String) {
    val friends = mutableListOf<Person>()
}
class SocialGraph(val people: List<Person>)
//sampleStart
fun dfs(graph: SocialGraph) {
    val visited = HashSet<Person>()
    fun dfs(current: Person) {
        if (!visited.add(current)) return
        println("Visited ${current.name}")
        for (friend in current.friends)
            dfs(friend)
    }
    dfs(graph.people[0])
}
//sampleEnd
fun main() {
    val alice = Person("Alice")
    val bob = Person("Bob")
    val charlie = Person("Charlie")
    alice.friends += bob
    bob.friends += charlie
    charlie.friends += alice
    val network = SocialGraph(listOf(alice, bob, charlie))
    dfs(network)
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3" id="local-functions-dfs-with-local-variable"}

### 멤버 함수

멤버 함수는 클래스나 객체 내부에서 정의된 함수입니다:

```kotlin
class Sample {
    fun foo() { print("Foo") }
}
```

멤버 함수를 호출하려면 인스턴스 또는 객체 이름을 쓴 다음 `.`을 추가하고 함수 이름을 씁니다:

```kotlin
// Stream 클래스의 인스턴스를 생성하고 read()를 호출합니다.
Stream().read()
```

클래스 및 멤버 오버라이딩에 대한 자세한 정보는 [클래스](classes.md) 및 [상속](classes.md#inheritance)을 참조하세요.

## 제네릭 함수

함수 이름 앞에 꺾쇠괄호 `<>`를 사용하여 함수의 제네릭 파라미터를 지정할 수 있습니다:

```kotlin
fun <T> singletonList(item: T): `List<T>` { /*...*/ }
```

제네릭 함수에 대한 자세한 내용은 [제네릭(Generics)](generics.md)을 참조하세요.

## 꼬리 재귀 함수

Kotlin은 [꼬리 재귀(tail recursion)](https://en.wikipedia.org/wiki/Tail_call)라고 알려진 함수형 프로그래밍 스타일을 지원합니다.
보통 루프를 사용하는 일부 알고리즘의 경우, 스택 오버플로의 위험 없이 재귀 함수를 대신 사용할 수 있습니다.
함수가 `tailrec` 수정자로 표시되고 필요한 공식 조건을 충족하면, 컴파일러는 재귀를 제거하고 빠르고 효율적인 루프 기반 버전으로 최적화합니다:

```kotlin
import kotlin.math.cos
import kotlin.math.abs

// 임의의 "충분한" 정밀도
val eps = 1E-10

tailrec fun findFixPoint(x: Double = 1.0): Double =
    if (abs(x - cos(x)) < eps) x else findFixPoint(cos(x))
```

이 코드는 코사인(수학 상수)의 고정점을 계산합니다.
결과가 더 이상 변하지 않을 때까지 `1.0`부터 시작하여 `cos()`를 반복적으로 호출하며, 지정된 `eps` 정밀도에 대해 `0.7390851332151611`이라는 결과를 산출합니다.
이 코드는 다음과 같은 보다 전통적인 스타일과 동일합니다:

```kotlin
import kotlin.math.cos
import kotlin.math.abs

// 임의의 "충분한" 정밀도
val eps = 1E-10

private fun findFixPoint(): Double {
    var x = 1.0
    while (true) {
        val y = cos(x)
        if (abs(x - y) < eps) return x
        x = cos(x)
    }
}
```

`tailrec` 수정자는 함수가 마지막 작업으로 자기 자신을 호출할 때만 적용할 수 있습니다.
재귀 호출 이후에 더 많은 코드가 있거나, [`try`/`catch`/`finally` 블록](exceptions.md#handle-exceptions-using-try-catch-blocks) 내에 있거나, 함수가 [open](inheritance.md)인 경우에는 꼬리 재귀를 사용할 수 없습니다.

**참고 항목**:
* [인라인 함수(Inline functions)](inline-functions.md)
* [확장 함수(Extension functions)](extensions.md)
* [고차 함수와 람다(Higher-order functions and lambdas)](lambdas.md)