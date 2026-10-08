[//]: # (title: Kotlin 1.2의 새로운 기능)

<web-summary>새로운 언어 기능, Kotlin 멀티플랫폼(Multiplatform), JVM 및 JS 업데이트, Gradle과 Maven용 빌드 도구 지원을 포함한 Kotlin 1.2 릴리스 노트를 확인해 보세요.</web-summary>

_릴리스 날짜: 2017년 11월 28일_

## 목차 {id="table-of-contents"}

* [멀티플랫폼 프로젝트](#multiplatform-projects-experimental)
* [기타 언어 기능](#other-language-features)
* [표준 라이브러리](#standard-library)
* [JVM 백엔드](#jvm-backend)
* [JavaScript 백엔드](#javascript-backend)

> Kotlin 릴리스 주기에 대한 정보는 [Kotlin 릴리스 프로세스](releases.md)를 참조하세요.
>
{style="tip"}

## 멀티플랫폼 프로젝트 (실험적 기능) {id="multiplatform-projects-experimental"}

멀티플랫폼 프로젝트는 Kotlin 1.2의 새로운 **실험적(experimental)** 기능으로, Kotlin이 지원하는 대상 플랫폼인 JVM, JavaScript 및 (향후 지원될) Native 간에 코드를 재사용할 수 있게 해줍니다. 멀티플랫폼 프로젝트에는 세 가지 종류의 모듈이 있습니다:

* **공통(common)** 모듈은 특정 플랫폼에 종속되지 않는 코드뿐만 아니라, 플랫폼 종속적인 API의 구현이 없는 선언을 포함합니다.
* **플랫폼(platform)** 모듈은 공통 모듈에 선언된 플랫폼 종속적 선언을 특정 플랫폼에 맞게 구현한 내용과 기타 플랫폼 종속적인 코드를 포함합니다.
* **일반(regular)** 모듈은 특정 플랫폼을 대상으로 하며, 플랫폼 모듈의 의존성이 되거나 플랫폼 모듈에 의존할 수 있습니다.

멀티플랫폼 프로젝트를 특정 플랫폼용으로 컴파일하면 공통 부분과 플랫폼 전용 부분의 코드가 모두 생성됩니다.

멀티플랫폼 프로젝트 지원의 핵심 기능은 `expect` 및 `actual` 선언을 통해 공통 코드의 플랫폼 전용 부분에 대한 의존성을 표현할 수 있다는 점입니다. `expect` 선언은 API(클래스, 인터페이스, 애노테이션, 최상위 선언 등)를 지정합니다. `actual` 선언은 해당 API의 플랫폼 종속적인 구현이거나, 외부 라이브러리에 있는 기존 API 구현을 참조하는 타입 별칭(type alias)입니다. 예시는 다음과 같습니다:

공통 코드:

```kotlin
// 예상되는(expected) 플랫폼 전용 API:
expect fun hello(world: String): String

fun greet() {
    // 예상 API 사용:
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

// 기존 플랫폼 전용 구현 사용:
actual typealias URL = java.net.URL
```

멀티플랫폼 프로젝트를 구축하는 방법과 자세한 내용은 [멀티플랫폼 프로그래밍 문서](https://kotlinlang.org/docs/multiplatform/get-started.html)를 참조하세요.

## 기타 언어 기능 {id="other-language-features"}

### 애노테이션에서의 배열 리터럴 {id="array-literals-in-annotations"}

Kotlin 1.2부터는 애노테이션의 배열 인자를 `arrayOf` 함수 대신 새로운 배열 리터럴 구문을 사용하여 전달할 수 있습니다.

```kotlin
@CacheConfig(cacheNames = ["books", "default"])
public class BookRepositoryImpl {
    // ...
}
```

배열 리터럴 구문은 애노테이션 인자로만 제한됩니다.

### Lateinit 최상위 프로퍼티 및 지역 변수 {id="lateinit-top-level-properties-and-local-variables"}

이제 `lateinit` 수정자를 최상위 프로퍼티와 지역 변수에서 사용할 수 있습니다. 지역 변수의 경우, 예를 들어 한 객체의 생성자 인자로 전달된 람다가 나중에 정의되어야 하는 다른 객체를 참조할 때 사용할 수 있습니다.

```kotlin
class Node<T>(val value: T, val next: () -> Node<T>)

fun main(args: Array<String>) {
    // 세 개의 노드로 구성된 순환 구조:
    lateinit var third: Node<Int>

    val second = Node(2, next = { third })
    val first = Node(1, next = { second })

    third = Node(3, next = { first })

    val nodes = generateSequence(first) { it.next() }
    println("Values in the cycle: ${nodes.take(7).joinToString { it.value.toString() }}, ...")
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3"}

### lateinit 변수의 초기화 여부 확인 {id="check-whether-a-lateinit-var-is-initialized"}

이제 프로퍼티 참조에서 `isInitialized`를 사용하여 `lateinit` 변수가 초기화되었는지 확인할 수 있습니다.

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
{kotlin-runnable="true" kotlin-min-compiler-version="1.3"}

### 기본 함수형 파라미터를 가진 인라인 함수 {id="inline-functions-with-default-functional-parameters"}

이제 인라인 함수(inline functions)의 인라인된 함수형 파라미터에 기본값을 가질 수 있습니다.

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
{kotlin-runnable="true" kotlin-min-compiler-version="1.3"}

### 타입 추론에 명시적 캐스트 정보 활용 {id="information-from-explicit-casts-is-used-for-type-inference"}

Kotlin 컴파일러는 이제 타입 캐스트 정보를 타입 추론에 사용할 수 있습니다. 타입 파라미터 `T`를 반환하는 제네릭 메서드를 호출하고 반환 값을 특정 타입 `Foo`로 캐스팅하는 경우, 컴파일러는 이 호출에 대한 `T`가 `Foo` 타입으로 바인딩되어야 함을 이해합니다.

이 기능은 특히 Android 개발자에게 중요한데, 컴파일러가 Android API 레벨 26의 제네릭 `findViewById` 호출을 올바르게 분석할 수 있기 때문입니다.

```kotlin
val button = findViewById(R.id.button) as Button
```

### 스마트 캐스트 개선 사항 {id="smart-cast-improvements"}

변수가 세이프 콜(safe call) 표현식에서 할당되고 null 여부를 확인하는 경우, 스마트 캐스트가 세이프 콜 수신 객체(receiver)에도 적용됩니다.

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
{kotlin-runnable="true" kotlin-min-compiler-version="1.3"}

또한, 람다 내부의 스마트 캐스트가 람다 이전에만 수정되는 지역 변수에 대해 허용됩니다.

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
{kotlin-runnable="true" kotlin-min-compiler-version="1.3"}

### this::foo의 축약형으로 ::foo 지원 {id="support-for-foo-as-a-shorthand-for-this-foo"}

`this` 멤버에 대한 바운드 호출 가능 참조(bound callable reference)를 이제 명시적 수신 객체 없이 `this::foo` 대신 `::foo`로 작성할 수 있습니다. 이를 통해 외부 수신 객체의 멤버를 참조하는 람다에서 호출 가능 참조를 더 편리하게 사용할 수 있습니다.

### 주요 변경 사항: try 블록 이후의 엄격한 스마트 캐스트 {id="breaking-change-sound-smart-casts-after-try-blocks"}

이전에는 Kotlin이 `try` 블록 내부에서 이루어진 할당을 블록 이후의 스마트 캐스트에 사용했는데, 이는 타입 및 null 안전성을 깨뜨리고 런타임 실패로 이어질 수 있었습니다. 이번 릴리스에서는 이 문제를 수정하여 스마트 캐스트를 더 엄격하게 만들었으나, 이러한 스마트 캐스트에 의존하던 일부 코드가 동작하지 않을 수 있습니다.

이전의 스마트 캐스트 동작으로 전환하려면 컴파일러 인자로 폴백(fallback) 플래그 `-Xlegacy-smart-cast-after-try`를 전달하세요. 이 플래그는 Kotlin 1.3에서 지원 중단(deprecated)될 예정입니다.

### 지원 중단: 데이터 클래스의 copy 재정의 {id="deprecation-data-classes-overriding-copy"}

이미 동일한 시그니처를 가진 `copy` 함수가 있는 타입에서 파생된 데이터 클래스의 경우, 데이터 클래스용으로 생성된 `copy` 구현이 상위 타입의 기본값을 사용하게 되어 직관적이지 않은 동작을 유발하거나, 상위 타입에 기본 파라미터가 없는 경우 런타임에 실패하는 문제가 있었습니다.

`copy` 충돌을 일으키는 상속은 Kotlin 1.2에서 경고와 함께 지원 중단되었으며, Kotlin 1.3에서는 에러로 처리될 예정입니다.

### 지원 중단: 열거형 엔트리 내의 중첩 타입 {id="deprecation-nested-types-in-enum-entries"}

열거형(enum) 엔트리 내부에서 `inner class`가 아닌 중첩 타입을 정의하는 것은 초기화 로직 문제로 인해 지원 중단되었습니다. 이는 Kotlin 1.2에서 경고를 발생시키며, Kotlin 1.3에서 에러가 될 예정입니다.

### 지원 중단: 가변 인자(vararg)에 대한 단일 이름 지정 인자 {id="deprecation-single-named-argument-for-vararg"}

애노테이션의 배열 리터럴과의 일관성을 위해, 가변 인자 파라미터에 단일 항목을 이름 지정 형태(`foo(items = i)`)로 전달하는 것이 지원 중단되었습니다. 대신 해당 배열 팩토리 함수와 함께 스프레드 연산자(spread operator)를 사용하세요.

```kotlin
foo(items = *arrayOf(1))
```

이러한 경우 불필요한 배열 생성을 제거하는 최적화가 적용되어 성능 저하를 방지합니다. 단일 인자 형태는 Kotlin 1.2에서 경고를 발생시키며 Kotlin 1.3에서 삭제될 예정입니다.

### 지원 중단: Throwable을 확장하는 제네릭 클래스의 내부 클래스 {id="deprecation-inner-classes-of-generic-classes-extending-throwable"}

`Throwable`을 상속받는 제네릭 타입의 내부 클래스는 throw-catch 시나리오에서 타입 안전성을 위반할 수 있어 지원 중단되었습니다. Kotlin 1.2에서는 경고, Kotlin 1.3에서는 에러가 발생합니다.

### 지원 중단: 읽기 전용 프로퍼티의 백킹 필드 수정 {id="deprecation-mutating-backing-field-of-a-read-only-property"}

커스텀 게터에서 `field = ...`을 할당하여 읽기 전용 프로퍼티의 백킹 필드(backing field)를 수정하는 것이 지원 중단되었습니다. Kotlin 1.2에서는 경고, Kotlin 1.3에서는 에러가 발생합니다.

## 표준 라이브러리 {id="standard-library"}

### Kotlin 표준 라이브러리 아티팩트 및 패키지 분할 {id="kotlin-standard-library-artifacts-and-split-packages"}

Kotlin 표준 라이브러리는 이제 패키지 분할(여러 jar 파일이 동일한 패키지에 클래스를 선언하는 것)을 금지하는 Java 9 모듈 시스템과 완전히 호환됩니다. 이를 지원하기 위해 이전의 `kotlin-stdlib-jre7` 및 `kotlin-stdlib-jre8`을 대체하는 새로운 아티팩트 `kotlin-stdlib-jdk7` 및 `kotlin-stdlib-jdk8`이 도입되었습니다.

새로운 아티팩트의 선언은 Kotlin 관점에서는 동일한 패키지 이름으로 보이지만, Java 관점에서는 다른 패키지 이름을 가집니다. 따라서 새로운 아티팩트로 전환하더라도 소스 코드를 변경할 필요는 없습니다.

새로운 모듈 시스템과의 호환성을 위해 변경된 또 다른 사항은 `kotlin-reflect` 라이브러리에서 `kotlin.reflect` 패키지의 지원 중단된 선언들을 제거한 것입니다. 만약 이를 사용하고 있었다면, Kotlin 1.1부터 지원되는 `kotlin.reflect.full` 패키지의 선언으로 전환해야 합니다.

### windowed, chunked, zipWithNext {id="windowed-chunked-zipwithnext"}

`Iterable<T>`, `Sequence<T>`, `CharSequence`에 대한 새로운 확장 함수들은 버퍼링 또는 일괄 처리(`chunked`), 슬라이딩 윈도우 및 이동 평균 계산(`windowed`), 그리고 연속된 항목 쌍 처리(`zipWithNext`)와 같은 사례를 지원합니다.

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
{kotlin-runnable="true" kotlin-min-compiler-version="1.3"}

### fill, replaceAll, shuffle/shuffled {id="fill-replaceall-shuffle-shuffled"}

리스트 조작을 위한 확장 함수 세트가 추가되었습니다: `MutableList`용 `fill`, `replaceAll`, `shuffle`, 그리고 읽기 전용 `List`용 `shuffled`입니다.

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
{kotlin-runnable="true" kotlin-min-compiler-version="1.3"}

### kotlin-stdlib의 수학 연산 {id="math-operations-in-kotlin-stdlib"}

오랫동안 기다려온 요청에 따라, Kotlin 1.2에는 JVM과 JS 공통으로 사용할 수 있는 수학 연산용 `kotlin.math` API가 추가되었습니다. 여기에는 다음이 포함됩니다:

* 상수: `PI` 및 `E`
* 삼각함수: `cos`, `sin`, `tan` 및 역함수: `acos`, `asin`, `atan`, `atan2`
* 쌍곡선 함수: `cosh`, `sinh`, `tanh` 및 역함수: `acosh`, `asinh`, `atanh`
* 거듭제곱: `pow`(확장 함수), `sqrt`, `hypot`, `exp`, `expm1`
* 로그: `log`, `log2`, `log10`, `ln`, `ln1p`
* 반올림:
    * `ceil`, `floor`, `truncate`, `round` (가장 가까운 짝수로 반올림) 함수
    * `roundToInt`, `roundToLong` (가장 가까운 정수로 반올림) 확장 함수
* 부호 및 절대값:
    * `abs` 및 `sign` 함수
    * `absoluteValue` 및 `sign` 확장 프로퍼티
    * `withSign` 확장 함수
* 두 값의 `max` 및 `min`
* 이진 표현:
    * `ulp` 확장 프로퍼티
    * `nextUp`, `nextDown`, `nextTowards` 확장 함수
    * `toBits`, `toRawBits`, `Double.fromBits` (이들은 `kotlin` 패키지에 있음)

동일한 함수 세트(상수 제외)를 `Float` 인자에 대해서도 사용할 수 있습니다.

### BigInteger 및 BigDecimal용 연산자 및 변환 {id="operators-and-conversions-for-biginteger-and-bigdecimal"}

Kotlin 1.2에는 `BigInteger` 및 `BigDecimal`을 조작하고 다른 숫자 타입에서 생성하기 위한 함수 세트가 도입되었습니다:

* `Int` 및 `Long`을 위한 `toBigInteger`
* `Int`, `Long`, `Float`, `Double`, `BigInteger`를 위한 `toBigDecimal`
* 산술 및 비트 연산자 함수:
    * 이진 연산자 `+`, `-`, `*`, `/`, `%` 및 중위(infix) 함수 `and`, `or`, `xor`, `shl`, `shr`
    * 단항 연산자 `-`, `++`, `--` 및 `inv` 함수

### 부동 소수점의 비트 변환 {id="floating-point-to-bits-conversions"}

`Double` 및 `Float`을 비트 표현으로 변환하거나 그 반대로 변환하는 새로운 함수가 추가되었습니다:

* `Double`의 경우 `Long`을, `Float`의 경우 `Int`를 반환하는 `toBits` 및 `toRawBits`
* 비트 표현에서 부동 소수점 숫자를 생성하는 `Double.fromBits` 및 `Float.fromBits`

### Regex의 직렬화 지원 {id="regex-is-now-serializable"}

`kotlin.text.Regex` 클래스가 `Serializable`이 되어 이제 직렬화 가능한 계층 구조에서 사용할 수 있습니다.

### Closeable.use 호출 시 Throwable.addSuppressed 지원 (가능한 경우) {id="closeable-use-calls-throwable-addsuppressed-if-available"}

`Closeable.use` 함수는 리소스를 닫는 중에 예외가 발생하고 그 전에 이미 다른 예외가 발생한 경우, `Throwable.addSuppressed`를 호출합니다.

이 동작을 활성화하려면 의존성에 `kotlin-stdlib-jdk7`이 포함되어 있어야 합니다.

## JVM 백엔드 {id="jvm-backend"}

### 생성자 호출 정규화 {id="constructor-calls-normalization"}

버전 1.0부터 Kotlin은 try-catch 표현식이나 인라인 함수 호출과 같이 복잡한 제어 흐름이 포함된 표현식을 지원해 왔습니다. 이러한 코드는 Java Virtual Machine 사양에 따라 유효합니다. 그러나 안타깝게도 일부 바이트코드 처리 도구는 생성자 호출의 인자에 이러한 표현식이 포함된 경우 이를 제대로 처리하지 못하는 경우가 있었습니다.

이러한 바이트코드 처리 도구 사용자들의 문제를 완화하기 위해, 컴파일러가 이러한 구문에 대해 더 Java와 유사한 바이트코드를 생성하도록 지시하는 커맨드 라인 컴파일러 옵션(`-Xnormalize-constructor-calls=MODE`)을 추가했습니다. 여기서 `MODE`는 다음 중 하나입니다:

* `disable` (기본값) – Kotlin 1.0 및 1.1과 동일한 방식으로 바이트코드를 생성합니다.
* `enable` – 생성자 호출에 대해 Java와 유사한 바이트코드를 생성합니다. 이로 인해 클래스가 로드되고 초기화되는 순서가 변경될 수 있습니다.
* `preserve-class-initialization` – 생성자 호출에 대해 Java와 유사한 바이트코드를 생성하면서 클래스 초기화 순서가 유지되도록 보장합니다. 이는 애플리케이션의 전반적인 성능에 영향을 줄 수 있으므로, 여러 클래스 간에 공유되는 복잡한 상태가 있고 클래스 초기화 시 업데이트되는 경우에만 사용하세요.

"수동" 해결 방법은 제어 흐름이 포함된 하위 표현식의 값을 호출 인자 내부에서 직접 평가하는 대신 변수에 저장하는 것입니다. 이는 `-Xnormalize-constructor-calls=enable`과 유사합니다.

### Java 기본(default) 메서드 호출 {id="java-default-method-calls"}

Kotlin 1.2 이전에는 JVM 1.6을 대상으로 하면서 Java 기본 메서드를 재정의하는 인터페이스 멤버가 super 호출을 수행할 때 `Super calls to Java default methods are deprecated in JVM target 1.6. Recompile with '-jvm-target 1.8'`이라는 경고를 발생시켰습니다. Kotlin 1.2에서는 대신 **에러**가 발생하므로, 이러한 코드는 반드시 JVM 대상 1.8로 컴파일해야 합니다.

### 주요 변경 사항: 플랫폼 타입에 대한 x.equals(null) 동작의 일관성 {id="breaking-change-consistent-behavior-of-x-equals-null-for-platform-types"}

Java 기본 타입으로 매핑되는 플랫폼 타입(`Int!`, `Boolean!`, `Short!`, `Long!`, `Float!`, `Double!`, `Char!`)에 대해 `x.equals(null)`을 호출하면 `x`가 null일 때 잘못되게 `true`를 반환했었습니다. Kotlin 1.2부터 플랫폼 타입의 null 값에 대해 `x.equals(...)`를 호출하면 **NPE가 발생**합니다(단, `x == ...`는 발생하지 않음).

1.2 이전의 동작으로 돌아가려면 컴파일러에 `-Xno-exception-on-explicit-equals-for-boxed-null` 플래그를 전달하세요.

### 주요 변경 사항: 인라인된 확장 수신 객체를 통한 플랫폼 null 탈출 수정 {id="breaking-change-fix-for-platform-null-escaping-through-an-inlined-extension-receiver"}

플랫폼 타입의 null 값에 대해 호출된 인라인 확장 함수는 수신 객체의 null 여부를 확인하지 않았으며, 이로 인해 null이 다른 코드로 탈출할 수 있었습니다. Kotlin 1.2는 호출 지점에서 이 확인을 강제하여 수신 객체가 null인 경우 예외를 발생시킵니다.

이전 동작으로 전환하려면 컴파일러에 `-Xno-receiver-assertions` 플래그를 전달하세요.

## JavaScript 백엔드 {id="javascript-backend"}

### TypedArrays 지원 기본 활성화 {id="typedarrays-support-enabled-by-default"}

`IntArray`, `DoubleArray`와 같은 Kotlin 원시 배열을 [JavaScript typed arrays](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Typed_arrays)로 변환하는 JS typed arrays 지원이 이전에는 선택 사항(opt-in)이었으나, 이제 기본적으로 활성화되었습니다.

## 도구 {id="tools"}

### 경고를 에러로 처리 {id="warnings-as-errors"}

컴파일러는 이제 모든 경고를 에러로 처리하는 옵션을 제공합니다. 커맨드 라인에서 `-Werror`를 사용하거나 다음 Gradle 스니펫을 사용하세요:

```groovy
compileKotlin {
    kotlinOptions.allWarningsAsErrors = true
}
```
