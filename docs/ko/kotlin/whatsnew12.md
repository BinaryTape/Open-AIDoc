[//]: # (title: Kotlin 1.2의 새로운 기능)

<web-summary>새로운 언어 기능, Kotlin 멀티플랫폼, JVM 및 JS 업데이트, Gradle 및 Maven용 빌드 도구 지원을 다루는 Kotlin 1.2 릴리스 노트를 읽어보세요.</web-summary>

_출시일: 2017년 11월 28일_

## 목차 {id="table-of-contents"}

* [멀티플랫폼 프로젝트](#multiplatform-projects-experimental)
* [기타 언어 기능](#other-language-features)
* [표준 라이브러리](#standard-library)
* [JVM 백엔드](#jvm-backend)
* [JavaScript 백엔드](#javascript-backend)

> Kotlin 릴리스 주기에 대한 자세한 내용은 [Kotlin 릴리스 프로세스](releases.md)를 참조하세요.
>
{style="tip"}

## 멀티플랫폼 프로젝트 (실험적 기능) {id="multiplatform-projects-experimental"}

멀티플랫폼 프로젝트는 Kotlin 1.2의 새로운 **실험적(experimental)** 기능으로, Kotlin이 지원하는 대상 플랫폼인 JVM, JavaScript 및 (향후 지원될) Native 간에 코드를 재사용할 수 있도록 해줍니다. 멀티플랫폼 프로젝트에는 세 가지 종류의 모듈이 있습니다.

* *공통(common)* 모듈: 특정 플랫폼에 종속되지 않는 코드뿐만 아니라 플랫폼 종속적인 API의 구현부가 없는 선언을 포함합니다.
* *플랫폼(platform)* 모듈: 특정 플랫폼을 위해 공통 모듈에 선언된 플랫폼 종속적 선언의 구현부와 기타 플랫폼 종속 코드를 포함합니다.
* 일반 모듈: 특정 플랫폼을 대상으로 하며, 플랫폼 모듈의 의존성이 되거나 플랫폼 모듈에 의존할 수 있습니다.

특정 플랫폼을 대상으로 멀티플랫폼 프로젝트를 컴파일하면, 공통 부분과 플랫폼별 부분 모두에 대한 코드가 생성됩니다.

멀티플랫폼 프로젝트 지원의 핵심 기능은 *expected* 및 *actual* 선언을 통해 공통 코드가 플랫폼별 부분에 갖는 의존성을 표현할 수 있다는 점입니다. *expected* 선언은 API(클래스, 인터페이스, 애너테이션, 최상위 선언 등)를 지정합니다. *actual* 선언은 해당 API의 플랫폼 종속적인 구현이거나, 외부 라이브러리에 존재하는 해당 API의 구현을 가리키는 타입 별칭(type alias)입니다. 다음은 그 예시입니다.

공통 코드:

```kotlin
// expected 플랫폼별 API:
expect fun hello(world: String): String

fun greet() {
    // expected API의 사용:
    val greeting = hello("multiplatform world")
    println(greeting)
}

expect class URL(spec: String) {
    open fun getHost(): String
    open fun getPath(): String
}
```

JVM 플랫폼 코드:

```kotlin
actual fun hello(world: String): String =
    "Hello, $world, on the JVM platform!"

// 기존의 플랫폼별 구현 사용:
actual typealias URL = java.net.URL
```

멀티플랫폼 프로젝트 구축을 위한 자세한 내용과 단계는 [멀티플랫폼 프로그래밍 문서](https://kotlinlang.org/docs/multiplatform/get-started.html)를 참조하세요.

## 기타 언어 기능 {id="other-language-features"}

### 애너테이션의 배열 리터럴 {id="array-literals-in-annotations"}

Kotlin 1.2부터는 애너테이션의 배열 인자를 `arrayOf` 함수 대신 새로운 배열 리터럴 구문으로 전달할 수 있습니다.

```kotlin
@CacheConfig(cacheNames = ["books", "default"])
public class BookRepositoryImpl {
    // ...
}
```

배열 리터럴 구문은 애너테이션 인자로만 제한됩니다.

### 최상위 프로퍼티 및 로컬 변수의 lateinit 지원 {id="lateinit-top-level-properties-and-local-variables"}

이제 `lateinit` 수정자를 최상위 프로퍼티와 로컬 변수에도 사용할 수 있습니다. 로컬 변수의 경우, 예를 들어 한 객체의 생성자 인자로 전달된 람다가 나중에 정의되어야 하는 다른 객체를 참조할 때 유용하게 활용할 수 있습니다.

```kotlin
class Node<T>(val value: T, val next: () -> Node<T>)

fun main(args: Array<String>) {
    // 세 개의 노드로 이루어진 순환 구조:
    lateinit var third: Node<Int>

    val second = Node(2, next = { third })
    val first = Node(1, next = { second })

    third = Node(3, next = { first })

    val nodes = generateSequence(first) { it.next() }
    println("Values in the cycle: ${nodes.take(7).joinToString { it.value.toString() }}, ...")
}
```
{kotlin-runnable="true"}

### lateinit var 초기화 여부 확인 {id="check-whether-a-lateinit-var-is-initialized"}

이제 프로퍼티 참조에서 `isInitialized`를 사용하여 lateinit var가 초기화되었는지 확인할 수 있습니다.

```kotlin
class Foo {
    lateinit var lateinitVar: String

    fun initializationLogic() {
//sampleStart
        println("isInitialized before assignment: " + this::lateinitVar.isInitialized)
        lateinitVar = "value"
        println("isInitialized after assignment: " + this::lateinitVar.isInitialized)
//sampleEnd
    }
}

fun main(args: Array<String>) {
	Foo().initializationLogic()
}
```
{kotlin-runnable="true"}

### 기본 함수형 파라미터를 갖는 인라인 함수 {id="inline-functions-with-default-functional-parameters"}

이제 인라인 함수에서 인라인되는 함수형 파라미터에 기본값을 지정할 수 있습니다.

```kotlin
//sampleStart
inline fun <E> Iterable<E>.strings(transform: (E) -> String = { it.toString() }) =
    map { transform(it) }

val defaultStrings = listOf(1, 2, 3).strings()
val customStrings = listOf(1, 2, 3).strings { "($it)" } 
//sampleEnd

fun main(args: Array<String>) {
    println("defaultStrings = $defaultStrings")
    println("customStrings = $customStrings")
}
```
{kotlin-runnable="true"}

### 명시적 타입 변환 정보를 타입 추론에 활용 {id="information-from-explicit-casts-is-used-for-type-inference"}

Kotlin 컴파일러가 타입 추론 시 명시적 타입 캐스트 정보를 사용할 수 있게 되었습니다. 타입 파라미터 `T`를 반환하는 제네릭 메서드를 호출하고 반환값을 특정 타입 `Foo`로 캐스팅하는 경우, 컴파일러는 이 호출에 대한 `T`가 `Foo` 타입에 바인딩되어야 함을 인식합니다.

이는 Android API 레벨 26에서 제네릭 `findViewById` 호출을 컴파일러가 올바르게 분석할 수 있게 해주므로 Android 개발자에게 특히 중요합니다.

```kotlin
val button = findViewById(R.id.button) as Button
```

### 스마트 캐스트 개선 {id="smart-cast-improvements"}

안전한 호출(safe call) 표현식에서 변수가 할당되고 null 여부를 검사할 때, 이제 안전한 호출의 리시버(receiver)에도 스마트 캐스트가 적용됩니다.

```kotlin
fun countFirst(s: Any): Int {
//sampleStart
    val firstChar = (s as? CharSequence)?.firstOrNull()
    if (firstChar != null)
    return s.count { it == firstChar } // s: Any가 CharSequence로 스마트 캐스트됨

    val firstItem = (s as? Iterable<*>)?.firstOrNull()
    if (firstItem != null)
    return s.count { it == firstItem } // s: Any가 Iterable<*>로 스마트 캐스트됨
//sampleEnd
    return -1
}

fun main(args: Array<String>) {
  val string = "abacaba"
  val countInString = countFirst(string)
  println("called on \"$string\": $countInString")

  val list = listOf(1, 2, 3, 1, 2)
  val countInList = countFirst(list)
  println("called on $list: $countInList")
}
```
{kotlin-runnable="true"}

또한, 람다 내부에서의 스마트 캐스트가 람다 이전에만 수정되는 로컬 변수에 대해 허용됩니다.

```kotlin
fun main(args: Array<String>) {
//sampleStart
    val flag = args.size == 0
    var x: String? = null
    if (flag) x = "Yahoo!"

    run {
        if (x != null) {
            println(x.length) // x가 String으로 스마트 캐스트됨
        }
    }
//sampleEnd
}
```
{kotlin-runnable="true"}

### this::foo의 축약형으로 ::foo 지원 {id="support-for-foo-as-a-shorthand-for-this-foo"}

`this` 멤버에 바인딩된 호출 가능 참조(callable reference)를 명시적 리시버 없이 `this::foo` 대신 `::foo`로 작성할 수 있습니다. 이를 통해 바깥쪽 리시버의 멤버를 참조하는 람다에서 호출 가능 참조를 더욱 편리하게 사용할 수 있습니다.

### 호환성을 깨뜨리는 변경점: try 블록 이후의 안전하고 정확한 스마트 캐스트 {id="breaking-change-sound-smart-casts-after-try-blocks"}

이전에는 Kotlin이 `try` 블록 내부에서 수행된 할당을 블록 이후의 스마트 캐스트에 사용하여 타입 안전성과 null 안전성을 깨뜨리고 런타임 오류를 일으킬 수 있었습니다. 이번 릴리스에서는 이 문제를 수정하여 스마트 캐스트를 더욱 엄격하게 만들었지만, 이러한 스마트 캐스트에 의존하던 일부 코드가 동작하지 않을 수 있습니다.

이전의 스마트 캐스트 동작으로 되돌리려면 컴파일러 인자로 폴백 플래그인 `-Xlegacy-smart-cast-after-try`를 전달하세요. 이 플래그는 Kotlin 1.3에서 지원 중단될 예정입니다.

### 지원 중단: data 클래스의 copy 오버라이딩 {id="deprecation-data-classes-overriding-copy"}

동일한 시그니처를 가진 `copy` 함수가 이미 존재하는 타입으로부터 파생된 데이터 클래스의 경우, 데이터 클래스용으로 생성된 `copy` 구현이 상위 타입의 기본값을 사용하여 직관적이지 않은 동작을 초래하거나, 상위 타입에 기본 파라미터가 없는 경우 런타임에 실패했습니다.

이처럼 `copy` 충돌을 유발하는 상속은 Kotlin 1.2에서 경고와 함께 지원 중단되었으며, Kotlin 1.3에서는 오류로 처리됩니다.

### 지원 중단: enum 엔트리 내 중첩 타입 {id="deprecation-nested-types-in-enum-entries"}

초기화 로직 문제로 인해 enum 엔트리 내부에서 `inner class`가 아닌 중첩 타입을 정의하는 것이 지원 중단되었습니다. Kotlin 1.2에서는 경고가 발생하며, Kotlin 1.3에서는 오류가 됩니다.

### 지원 중단: vararg에 대한 단일 이름 지정 인자 {id="deprecation-single-named-argument-for-vararg"}

애너테이션의 배열 리터럴과의 일관성을 위해, vararg 파라미터에 이름 지정 형식(`foo(items = i)`)으로 단일 항목을 전달하는 방식이 지원 중단되었습니다. 해당 배열 팩토리 함수와 함께 스프레드 연산자(spread operator)를 사용하세요.

```kotlin
foo(items = *arrayOf(1))
```

이러한 경우 불필요한 배열 생성을 제거하는 최적화가 적용되어 있어 성능 저하를 방지합니다. 단일 인자 형식은 Kotlin 1.2에서 경고를 발생시키며 Kotlin 1.3에서는 제거될 예정입니다.

### 지원 중단: Throwable을 상속하는 제네릭 클래스의 내부 클래스 {id="deprecation-inner-classes-of-generic-classes-extending-throwable"}

`Throwable`을 상속하는 제네릭 타입의 내부 클래스(inner class)는 throw-catch 시나리오에서 타입 안전성을 위반할 수 있으므로 지원 중단되었습니다. Kotlin 1.2에서는 경고가 발생하고 Kotlin 1.3에서는 오류가 됩니다.

### 지원 중단: 읽기 전용 프로퍼티의 뒷받침하는 필드 변경 {id="deprecation-mutating-backing-field-of-a-read-only-property"}

커스텀 getter에서 `field = ...` 할당을 통해 읽기 전용 프로퍼티의 뒷받침하는 필드(backing field)를 변경하는 방식이 지원 중단되었습니다. Kotlin 1.2에서는 경고가 발생하고 Kotlin 1.3에서는 오류가 됩니다.

## 표준 라이브러리 {id="standard-library"}

### Kotlin 표준 라이브러리 아티팩트 및 분할 패키지 {id="kotlin-standard-library-artifacts-and-split-packages"}

이제 Kotlin 표준 라이브러리는 분할 패키지(여러 jar 파일이 동일한 패키지에 클래스를 선언하는 것)를 금지하는 Java 9 모듈 시스템과 완벽하게 호환됩니다. 이를 지원하기 위해 기존의 `kotlin-stdlib-jre7` 및 `kotlin-stdlib-jre8`을 대체하는 새로운 아티팩트 `kotlin-stdlib-jdk7` 및 `kotlin-stdlib-jdk8`이 도입되었습니다.

새 아티팩트의 선언들은 Kotlin 관점에서는 동일한 패키지 이름으로 보이지만, Java 관점에서는 서로 다른 패키지 이름을 가집니다. 따라서 새 아티팩트로 전환하더라도 소스 코드를 변경할 필요는 없습니다.

새로운 모듈 시스템과의 호환성을 위해 이루어진 또 다른 변경 사항은 `kotlin-reflect` 라이브러리의 `kotlin.reflect` 패키지에서 지원 중단된 선언들을 제거한 것입니다. 해당 선언들을 사용하고 있었다면, Kotlin 1.1부터 지원되는 `kotlin.reflect.full` 패키지의 선언을 사용하도록 전환해야 합니다.

### windowed, chunked, zipWithNext {id="windowed-chunked-zipwithnext"}

`Iterable<T>`, `Sequence<T>`, `CharSequence`를 위한 새로운 확장 함수가 추가되어 버퍼링 또는 일괄 처리(`chunked`), 슬라이딩 윈도우 및 이동 평균 계산(`windowed`), 연속된 항목 쌍 처리(`zipWithNext`) 등의 유스케이스를 지원합니다.

```kotlin
fun main(args: Array<String>) {
//sampleStart
    val items = (1..9).map { it * it }

    val chunkedIntoLists = items.chunked(4)
    val points3d = items.chunked(3) { (x, y, z) -> Triple(x, y, z) }
    val windowed = items.windowed(4)
    val slidingAverage = items.windowed(4) { it.average() }
    val pairwiseDifferences = items.zipWithNext { a, b -> b - a }
//sampleEnd

    println("items: $items\n")

    println("chunked into lists: $chunkedIntoLists")
    println("3D points: $points3d")
    println("windowed by 4: $windowed")
    println("sliding average by 4: $slidingAverage")
    println("pairwise differences: $pairwiseDifferences")
}
```
{kotlin-runnable="true"}

### fill, replaceAll, shuffle/shuffled {id="fill-replaceall-shuffle-shuffled"}

리스트 조작을 위한 확장 함수 세트가 추가되었습니다. `MutableList`용으로는 `fill`, `replaceAll`, `shuffle`이 추가되었고, 읽기 전용 `List`용으로는 `shuffled`가 추가되었습니다.

```kotlin
fun main(args: Array<String>) {
//sampleStart
    val items = (1..5).toMutableList()
    
    items.shuffle()
    println("Shuffled items: $items")
    
    items.replaceAll { it * 2 }
    println("Items doubled: $items")
    
    items.fill(5)
    println("Items filled with 5: $items")
//sampleEnd
}
```
{kotlin-runnable="true"}

### kotlin-stdlib의 수학 연산 {id="math-operations-in-kotlin-stdlib"}

오랫동안 요청되었던 기능으로, Kotlin 1.2에는 JVM과 JS에서 공통으로 사용할 수 있는 수학 연산용 `kotlin.math` API가 추가되었으며 다음 항목들을 포함합니다.

* 상수: `PI` 및 `E`
* 삼각함수: `cos`, `sin`, `tan` 및 역삼각함수: `acos`, `asin`, `atan`, `atan2`
* 쌍곡선 함수: `cosh`, `sinh`, `tanh` 및 역쌍곡선 함수: `acosh`, `asinh`, `atanh`
* 거듭제곱 및 지수/로그 관련: `pow` (확장 함수), `sqrt`, `hypot`, `exp`, `expm1`
* 로그: `log`, `log2`, `log10`, `ln`, `ln1p`
* 반올림/버림/올림:
    * `ceil`, `floor`, `truncate`, `round` (half to even) 함수
    * `roundToInt`, `roundToLong` (half to integer) 확장 함수
* 부호 및 절댓값:
    * `abs` 및 `sign` 함수
    * `absoluteValue` 및 `sign` 확장 프로퍼티
    * `withSign` 확장 함수
* 두 값의 `max` 및 `min`
* 이진 표현:
    * `ulp` 확장 프로퍼티
    * `nextUp`, `nextDown`, `nextTowards` 확장 함수
    * `toBits`, `toRawBits`, `Double.fromBits` (`kotlin` 패키지에 위치)

상수를 제외한 동일한 함수 세트가 `Float` 인자에도 제공됩니다.

### BigInteger 및 BigDecimal을 위한 연산자 및 변환 {id="operators-and-conversions-for-biginteger-and-bigdecimal"}

Kotlin 1.2에서는 `BigInteger` 및 `BigDecimal`을 다루고 다른 숫자 타입으로부터 생성하기 위한 함수 세트를 도입했습니다.

* `Int` 및 `Long`용 `toBigInteger`
* `Int`, `Long`, `Float`, `Double`, `BigInteger`용 `toBigDecimal`
* 산술 및 비트 연산자 함수:
    * 이항 연산자 `+`, `-`, `*`, `/`, `%` 및 중위(infix) 함수 `and`, `or`, `xor`, `shl`, `shr`
    * 단항 연산자 `-`, `++`, `--` 및 `inv` 함수

### 부동소수점과 비트 간 변환 {id="floating-point-to-bits-conversions"}

`Double` 및 `Float`을 비트 표현으로 상호 변환하기 위한 새로운 함수들이 추가되었습니다.

* `Double`에 대해 `Long`을 반환하고 `Float`에 대해 `Int`를 반환하는 `toBits` 및 `toRawBits`
* 비트 표현으로부터 부동소수점 숫자를 생성하는 `Double.fromBits` 및 `Float.fromBits`

### Regex 직렬화 지원 {id="regex-is-now-serializable"}

`kotlin.text.Regex` 클래스가 `Serializable`을 구현하여 직렬화 가능한 계층 구조에서 사용할 수 있게 되었습니다.

### Closeable.use에서 가능한 경우 Throwable.addSuppressed 호출 {id="closeable-use-calls-throwable-addsuppressed-if-available"}

`Closeable.use` 함수는 다른 예외가 발생한 후 리소스를 닫는 동안 또 다른 예외가 발생했을 때 `Throwable.addSuppressed`를 호출합니다.

이 동작을 활성화하려면 의존성에 `kotlin-stdlib-jdk7`이 포함되어 있어야 합니다.

## JVM 백엔드 {id="jvm-backend"}

### 생성자 호출 정규화 {id="constructor-calls-normalization"}

1.0 버전 이후로 Kotlin은 try-catch 표현식이나 인라인 함수 호출과 같이 복잡한 제어 흐름을 가진 표현식을 지원해 왔습니다. 이러한 코드는 Java 가상 머신 사양에 따라 유효합니다. 그러나 안타깝게도 일부 바이트코드 처리 도구는 생성자 호출의 인자에 이러한 표현식이 존재할 때 코드를 제대로 처리하지 못합니다.

이러한 바이트코드 처리 도구를 사용하는 사용자의 문제를 완화하기 위해, 컴파일러가 이러한 구조에 대해 더 Java와 유사한 바이트코드를 생성하도록 지시하는 커맨드 라인 컴파일러 옵션(`-Xnormalize-constructor-calls=MODE`)을 추가했습니다. 여기서 `MODE`는 다음 중 하나입니다.

* `disable` (기본값) – Kotlin 1.0 및 1.1과 동일한 방식으로 바이트코드를 생성합니다.
* `enable` – 생성자 호출에 대해 Java와 유사한 바이트코드를 생성합니다. 이는 클래스가 로드되고 초기화되는 순서를 변경할 수 있습니다.
* `preserve-class-initialization` – 클래스 초기화 순서가 보존되도록 보장하면서 생성자 호출에 대해 Java와 유사한 바이트코드를 생성합니다. 이는 애플리케이션의 전반적인 성능에 영향을 줄 수 있으므로, 여러 클래스 간에 공유되고 클래스 초기화 시 업데이트되는 복잡한 상태가 있는 경우에만 사용하세요.

"수동" 해결 방법은 호출 인자 내부에서 제어 흐름이 있는 하위 표현식을 직접 평가하는 대신, 해당 값을 변수에 저장하는 것입니다. 이는 `-Xnormalize-constructor-calls=enable`과 유사합니다.

### Java 디폴트 메서드 호출 {id="java-default-method-calls"}

Kotlin 1.2 이전에는 JVM 1.6을 타깃으로 하면서 Java 디폴트 메서드를 재정의하는 인터페이스 멤버의 super 호출에 대해 다음과 같은 경고가 발생했습니다. `Super calls to Java default methods are deprecated in JVM target 1.6. Recompile with '-jvm-target 1.8'`. Kotlin 1.2에서는 경고 대신 **오류**가 발생하므로 이러한 모든 코드는 JVM 타깃 1.8로 컴파일해야 합니다.

### 호환성을 깨뜨리는 변경점: 플랫폼 타입에 대한 x.equals(null)의 일관된 동작 {id="breaking-change-consistent-behavior-of-x-equals-null-for-platform-types"}

Java 기본형(primitive)에 매핑되는 플랫폼 타입(`Int!`, `Boolean!`, `Short!`, `Long!`, `Float!`, `Double!`, `Char!`)에서 `x.equals(null)`을 호출할 때 `x`가 null인 경우 잘못하여 `true`를 반환했습니다. Kotlin 1.2부터는 플랫폼 타입의 null 값에 대해 `x.equals(...)`를 호출하면 **NPE(NullPointerException)를 발생**시킵니다(`x == ...`는 발생시키지 않음).

1.2 이전 동작으로 되돌리려면 컴파일러에 `-Xno-exception-on-explicit-equals-for-boxed-null` 플래그를 전달하세요.

### 호환성을 깨뜨리는 변경점: 인라인 확장 리시버를 통한 플랫폼 null 누출 수정 {id="breaking-change-fix-for-platform-null-escaping-through-an-inlined-extension-receiver"}

플랫폼 타입의 null 값에 대해 호출된 인라인 확장 함수는 리시버의 null 여부를 검사하지 않아 null이 다른 코드로 누출될 수 있었습니다. Kotlin 1.2에서는 호출 위치에서 이 검사를 강제하여 리시버가 null인 경우 예외를 발생시킵니다.

이전 동작으로 전환하려면 컴파일러에 폴백 플래그인 `-Xno-receiver-assertions`를 전달하세요.

## JavaScript 백엔드 {id="javascript-backend"}

### TypedArrays 지원 기본 활성화 {id="typedarrays-support-enabled-by-default"}

`IntArray`, `DoubleArray`와 같은 Kotlin 원시 배열을 [JavaScript 형식화 배열(TypedArrays)](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Typed_arrays)로 변환하는 JS typed arrays 지원이 이전에는 선택적(opt-in) 기능이었으나, 이제 기본적으로 활성화됩니다.

## 도구 {id="tools"}

### 경고를 에러로 취급 {id="warnings-as-errors"}

컴파일러에서 모든 경고를 오류로 처리하는 옵션을 제공합니다. 커맨드 라인에서 `-Werror`를 사용하거나 다음 Gradle 스니펫을 사용할 수 있습니다.

```groovy
compileKotlin {
    kotlinOptions.allWarningsAsErrors = true
}
```