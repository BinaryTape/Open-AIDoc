[//]: # (title: Kotlin 1.1의 새로운 기능)

<web-summary>새로운 언어 기능, Kotlin/JVM 및 JS 업데이트, Gradle 및 Maven용 빌드 도구 지원을 포함한 Kotlin 1.1 릴리스 노트를 읽어보세요.</web-summary>

_릴리스 날짜: 2016년 2월 15일_

## 목차 {id="table-of-contents"}

* [코루틴](#coroutines-experimental)
* [기타 언어 기능](#other-language-features)
* [표준 라이브러리](#standard-library)
* [JVM 백엔드](#jvm-backend)
* [JavaScript 백엔드](#javascript-backend)

> Kotlin 릴리스 주기에 대한 정보는 [Kotlin 릴리스 프로세스](releases.md)를 참조하세요.
>
{style="tip"}

## JavaScript {id="javascript"}

Kotlin 1.1부터 JavaScript 타겟은 더 이상 실험적 기능으로 간주되지 않습니다. 모든 언어 기능이 지원되며, 프론트엔드 개발 환경과의 통합을 위한 많은 새로운 도구들이 추가되었습니다. 변경 사항에 대한 자세한 목록은 [아래](#javascript-backend)를 참조하세요.

## 코루틴 (실험적) {id="coroutines-experimental"}

Kotlin 1.1의 핵심적인 새로운 기능은 *코루틴(coroutines)*으로, `async`/`await`, `yield` 및 유사한 프로그래밍 패턴을 지원합니다. Kotlin 설계의 핵심 특징은 코루틴 실행 구현이 언어가 아닌 라이브러리의 일부라는 점입니다. 따라서 특정 프로그래밍 패러다임이나 동시성 라이브러리에 얽매이지 않습니다.

코루틴은 사실상 나중에 중단되었다가 다시 재개될 수 있는 가벼운 스레드입니다. 코루틴은 _[중단 함수(suspending functions)](coroutines-basics.md)_를 통해 지원됩니다. 이러한 함수를 호출하면 잠재적으로 코루틴을 중단시킬 수 있으며, 새로운 코루틴을 시작하기 위해 보통 익명 중단 함수(즉, 중단 람다)를 사용합니다.

외부 라이브러리인 [kotlinx.coroutines](https://github.com/kotlin/kotlinx.coroutines)에 구현된 `async`/`await` 예시를 살펴보겠습니다:

```kotlin
// 백그라운드 스레드 풀에서 코드를 실행합니다.
fun asyncOverlay() = async(CommonPool) {
    // 두 개의 비동기 작업을 시작합니다.
    val original = asyncLoadImage("original")
    val overlay = asyncLoadImage("overlay")
    // 그런 다음 두 결과에 오버레이를 적용합니다.
    applyOverlay(original.await(), overlay.await())
}

// UI 컨텍스트에서 새 코루틴을 실행합니다.
launch(UI) {
    // 비동기 오버레이가 완료될 때까지 기다립니다.
    val image = asyncOverlay().await()
    // 그런 다음 UI에 표시합니다.
    showImage(image)
}
```

여기서 `async { ... }`는 코루틴을 시작하고, `await()`를 사용하면 대기 중인 작업이 실행되는 동안 코루틴 실행이 중단되었다가, 작업이 완료되면 (다른 스레드에서일 수도 있음) 재개됩니다.

표준 라이브러리는 `yield` 및 `yieldAll` 함수를 사용하여 *지연 생성되는 시퀀스(lazily generated sequences)*를 지원하기 위해 코루틴을 사용합니다. 이러한 시퀀스에서 시퀀스 요소를 반환하는 코드 블록은 각 요소가 검색된 후 중단되고, 다음 요소가 요청될 때 재개됩니다. 예시는 다음과 같습니다:

```kotlin
import kotlin.coroutines.experimental.*

fun main(args: Array<String>) {
    val seq = buildSequence {
      for (i in 1..5) {
          // i의 제곱을 산출(yield)합니다.
          yield(i * i)
      }
      // 범위를 산출(yield)합니다.
      yieldAll(26..28)
    }

    // 시퀀스를 출력합니다.
    println(seq.toList())
}
```

위의 코드를 실행하여 결과를 확인해 보세요. 자유롭게 편집하고 다시 실행해 보셔도 됩니다!

더 자세한 정보는 [코루틴 문서](coroutines-overview.md) 및 [튜토리얼](coroutines-and-channels.md)을 참조하세요.

코루틴은 현재 **실험적 기능**으로 간주되므로, Kotlin 팀은 1.1 최종 릴리스 이후 이 기능의 하위 호환성을 보장하지 않습니다.

## 기타 언어 기능 {id="other-language-features"}

### 타입 별칭 (Type aliases) {id="type-aliases"}

타입 별칭을 사용하면 기존 타입에 대해 대체 이름을 정의할 수 있습니다. 이는 컬렉션과 같은 제네릭 타입이나 함수 타입에 가장 유용합니다. 예시는 다음과 같습니다:

```kotlin
//sampleStart
typealias OscarWinners = Map<String, String>

fun countLaLaLand(oscarWinners: OscarWinners) =
        oscarWinners.count { it.value.contains("La La Land") }

// 원래 타입 이름과 타입 별칭은 서로 바꿔서 사용할 수 있습니다:
fun checkLaLaLandIsTheBestMovie(oscarWinners: Map<String, String>) =
        oscarWinners["Best picture"] == "La La Land"
//sampleEnd

fun oscarWinners(): OscarWinners {
    return mapOf(
            "Best song" to "City of Stars (La La Land)",
            "Best actress" to "Emma Stone (La La Land)",
            "Best picture" to "Moonlight" /* ... */)
}

fun main(args: Array<String>) {
    val oscarWinners = oscarWinners()

    val laLaLandAwards = countLaLaLand(oscarWinners)
    println("LaLaLandAwards = $laLaLandAwards (in our small example), but actually it's 6.")

    val laLaLandIsTheBestMovie = checkLaLaLandIsTheBestMovie(oscarWinners)
    println("LaLaLandIsTheBestMovie = $laLaLandIsTheBestMovie")
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3"}

자세한 내용은 [타입 별칭 문서](type-aliases.md)와 [KEEP](https://github.com/Kotlin/KEEP/blob/master/proposals/type-aliases.md)을 참조하세요.

### 바운드 호출 가능 참조 (Bound callable references) {id="bound-callable-references"}

이제 `::` 연산자를 사용하여 특정 객체 인스턴스의 메서드나 프로퍼티를 가리키는 [멤버 참조(member reference)](reflection.md#function-references)를 얻을 수 있습니다. 이전에는 람다로만 표현할 수 있었습니다. 예시는 다음과 같습니다:

```kotlin
//sampleStart
val numberRegex = "\\d+".toRegex()
val numbers = listOf("abc", "123", "456").filter(numberRegex::matches)
//sampleEnd

fun main(args: Array<String>) {
    println("Result is $numbers")
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3"}

자세한 내용은 [문서](reflection.md)와 [KEEP](https://github.com/Kotlin/KEEP/blob/master/proposals/bound-callable-references.md)을 참조하세요.

### 봉인된 클래스와 데이터 클래스 (Sealed and data classes) {id="sealed-and-data-classes"}

Kotlin 1.1은 Kotlin 1.0에 있었던 봉인된(sealed) 클래스와 데이터(data) 클래스에 대한 일부 제한을 제거했습니다. 이제 최상위 봉인된 클래스의 하위 클래스를 봉인된 클래스의 중첩 클래스로서만이 아니라, 동일한 파일의 최상위 레벨에 정의할 수 있습니다. 데이터 클래스는 이제 다른 클래스를 상속받을 수 있습니다. 이를 통해 표현식 클래스 계층 구조를 멋지고 깔끔하게 정의할 수 있습니다:

```kotlin
//sampleStart
sealed class Expr

data class Const(val number: Double) : Expr()
data class Sum(val e1: Expr, val e2: Expr) : Expr()
object NotANumber : Expr()

fun eval(expr: Expr): Double = when (expr) {
    is Const -> expr.number
    is Sum -> eval(expr.e1) + eval(expr.e2)
    NotANumber -> Double.NaN
}
val e = eval(Sum(Const(1.0), Const(2.0)))
//sampleEnd

fun main(args: Array<String>) {
    println("e is $e") // 3.0
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3"}

자세한 내용은 [봉인된 클래스 문서](sealed-classes.md) 또는 [봉인된 클래스](https://github.com/Kotlin/KEEP/blob/master/proposals/sealed-class-inheritance.md) 및 [데이터 클래스](https://github.com/Kotlin/KEEP/blob/master/proposals/data-class-inheritance.md)에 대한 KEEP을 참조하세요.

### 람다에서의 구조 분해 (Destructuring in lambdas) {id="destructuring-in-lambdas"}

이제 [구조 분해 선언(destructuring declaration)](destructuring-declarations.md) 구문을 사용하여 람다에 전달된 인수를 언팩(unpack)할 수 있습니다. 예시는 다음과 같습니다:

```kotlin
fun main(args: Array<String>) {
//sampleStart
    val map = mapOf(1 to "one", 2 to "two")
    // 이전 방식
    println(map.mapValues { entry ->
      val (key, value) = entry
      "$key -> $value!"
    })
    // 현재 방식
    println(map.mapValues { (key, value) -> "$key -> $value!" })
//sampleEnd
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3"}

자세한 내용은 [구조 분해 선언 문서](destructuring-declarations.md)와 [KEEP](https://github.com/Kotlin/KEEP/blob/master/proposals/destructuring-in-parameters.md)을 참조하세요.

### 사용하지 않는 파라미터에 대한 언더스코어 (Underscores for unused parameters) {id="underscores-for-unused-parameters"}

파라미터가 여러 개인 람다의 경우, 사용하지 않는 파라미터의 이름을 대신하여 `_` 문자를 사용할 수 있습니다:

```kotlin
fun main(args: Array<String>) {
    val map = mapOf(1 to "one", 2 to "two")

//sampleStart
    map.forEach { _, value -> println("$value!") }
//sampleEnd
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3"}

이는 [구조 분해 선언](destructuring-declarations.md)에서도 작동합니다:

```kotlin
data class Result(val value: Any, val status: String)

fun getResult() = Result(42, "ok").also { println("getResult() returns $it") }

fun main(args: Array<String>) {
//sampleStart
    val (_, status) = getResult()
//sampleEnd
    println("status is '$status'")
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3"}

자세한 내용은 [KEEP](https://github.com/Kotlin/KEEP/blob/master/proposals/underscore-for-unused-parameters.md)을 참조하세요.

### 숫자 리터럴의 언더스코어 (Underscores in numeric literals) {id="underscores-in-numeric-literals"}

Java 8과 마찬가지로, Kotlin에서도 이제 숫자 리터럴에서 숫자를 그룹으로 구분하기 위해 언더스코어를 사용할 수 있습니다:

```kotlin
//sampleStart
val oneMillion = 1_000_000
val hexBytes = 0xFF_EC_DE_5E
val bytes = 0b11010010_01101001_10010100_10010010
//sampleEnd

fun main(args: Array<String>) {
    println(oneMillion)
    println(hexBytes.toString(16))
    println(bytes.toString(2))
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3"}

자세한 내용은 [KEEP](https://github.com/Kotlin/KEEP/blob/master/proposals/underscores-in-numeric-literals.md)을 참조하세요.

### 프로퍼티를 위한 짧은 구문 (Shorter syntax for properties) {id="shorter-syntax-for-properties"}

게터가 표현식 본문으로 정의된 프로퍼티의 경우, 이제 프로퍼티 타입을 생략할 수 있습니다:

```kotlin
//sampleStart
    data class Person(val name: String, val age: Int) {
    val isAdult get() = age >= 20 // 프로퍼티 타입이 'Boolean'으로 추론됨
}
//sampleEnd
fun main(args: Array<String>) {
    val akari = Person("Akari", 26)
    println("$akari.isAdult = ${akari.isAdult}")
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3"}

### 인라인 프로퍼티 접근자 (Inline property accessors) {id="inline-property-accessors"}

프로퍼티에 뒷받침하는 필드(backing field)가 없는 경우, 프로퍼티 접근자에 `inline` 수식어를 붙일 수 있습니다. 이러한 접근자는 [인라인 함수(inline functions)](inline-functions.md)와 동일한 방식으로 컴파일됩니다.

```kotlin
//sampleStart
public val <T> List<T>.lastIndex: Int
    inline get() = this.size - 1
//sampleEnd

fun main(args: Array<String>) {
    val list = listOf('a', 'b')
    // 게터가 인라인화됩니다.
    println("Last index of $list is ${list.lastIndex}")
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3"}

프로퍼티 전체를 `inline`으로 표시할 수도 있습니다. 이 경우 수식어가 두 접근자 모두에 적용됩니다.

자세한 내용은 [인라인 함수 문서](inline-functions.md#inline-properties)와 [KEEP](https://github.com/Kotlin/KEEP/blob/master/proposals/inline-properties.md)을 참조하세요.

### 로컬 위임된 프로퍼티 (Local delegated properties) {id="local-delegated-properties"}

이제 로컬 변수에도 [위임된 프로퍼티(delegated property)](delegated-properties.md) 구문을 사용할 수 있습니다. 지연 평가되는 로컬 변수를 정의하는 데 사용할 수 있습니다:

```kotlin
import java.util.Random

fun needAnswer() = Random().nextBoolean()

fun main(args: Array<String>) {
//sampleStart
    val answer by lazy {
        println("Calculating the answer...")
        42
    }
    if (needAnswer()) {                     // 랜덤 값을 반환함
        println("The answer is $answer.")   // 이 시점에서 answer가 계산됨
    }
    else {
        println("Sometimes no answer is the answer...")
    }
//sampleEnd
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3"}

자세한 내용은 [KEEP](https://github.com/Kotlin/KEEP/blob/master/proposals/local-delegated-properties.md)을 참조하세요.

### 위임된 프로퍼티 바인딩 가로채기 (Interception of delegated property binding) {id="interception-of-delegated-property-binding"}

[위임된 프로퍼티](delegated-properties.md)의 경우, `provideDelegate` 연산자를 사용하여 대리자(delegate)가 프로퍼티에 바인딩되는 것을 가로챌 수 있게 되었습니다. 예를 들어, 바인딩 전에 프로퍼티 이름을 확인하고 싶다면 다음과 같이 작성할 수 있습니다:

```kotlin
class ResourceLoader<T>(id: ResourceID<T>) {
    operator fun provideDelegate(thisRef: MyUI, prop: KProperty<*>): ReadOnlyProperty<MyUI, T> {
        checkProperty(thisRef, prop.name)
        ... // 프로퍼티 생성
    }

    private fun checkProperty(thisRef: MyUI, name: String) { ... }
}

fun <T> bindResource(id: ResourceID<T>): ResourceLoader<T> { ... }

class MyUI {
    val image by bindResource(ResourceID.image_id)
    val text by bindResource(ResourceID.text_id)
}
```

`provideDelegate` 메서드는 `MyUI` 인스턴스가 생성되는 동안 각 프로퍼티에 대해 호출되며, 즉시 필요한 유효성 검사를 수행할 수 있습니다.

자세한 내용은 [위임된 프로퍼티 문서](delegated-properties.md)를 참조하세요.

### 제네릭 열거형 값 액세스 (Generic enum value access) {id="generic-enum-value-access"}

이제 제네릭한 방식으로 열거형(enum) 클래스의 값을 나열할 수 있습니다.

```kotlin
//sampleStart
enum class RGB { RED, GREEN, BLUE }

inline fun <reified T : Enum<T>> printAllValues() {
    print(enumValues<T>().joinToString { it.name })
}
//sampleEnd

fun main(args: Array<String>) {
    printAllValues<RGB>() // RED, GREEN, BLUE를 출력함
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3"}

### DSL에서 암시적 수신 객체에 대한 범위 제어 (Scope control for implicit receivers in DSLs) {id="scope-control-for-implicit-receivers-in-dsls"}

[`@DslMarker`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin/-dsl-marker/index.html) 어노테이션을 사용하면 DSL 컨텍스트에서 외부 범위의 수신 객체(receiver) 사용을 제한할 수 있습니다. 전형적인 [HTML 빌더 예제](type-safe-builders.md)를 생각해 보세요:

```kotlin
table {
    tr {
        td { + "Text" }
    }
}
```

Kotlin 1.0에서 `td`에 전달된 람다 내의 코드는 `table`, `tr`, `td`에 전달된 세 개의 암시적 수신 객체에 액세스할 수 있습니다. 이로 인해 해당 컨텍스트에서 의미 없는 메서드를 호출할 수 있게 됩니다. 예를 들어 `td` 내부에서 `tr`을 호출하여 `<td>` 안에 `<tr>` 태그를 넣는 식입니다.

Kotlin 1.1에서는 이를 제한할 수 있어, `td`에 전달된 람다 내부에서는 `td`의 암시적 수신 객체에 정의된 메서드만 사용할 수 있게 됩니다. `@DslMarker` 메타 어노테이션으로 표시된 사용자 정의 어노테이션을 정의하고 이를 태그 클래스의 기본 클래스에 적용하여 설정할 수 있습니다.

자세한 내용은 [타입 세이프 빌더 문서](type-safe-builders.md)와 [KEEP](https://github.com/Kotlin/KEEP/blob/master/proposals/scope-control-for-implicit-receivers.md)을 참조하세요.

### rem 연산자 {id="rem-operator"}

`mod` 연산자는 이제 더 이상 권장되지 않으며(deprecated), 대신 `rem`이 사용됩니다. 동기에 대해서는 [이 이슈](https://youtrack.jetbrains.com/issue/KT-14650)를 참조하세요.

## 표준 라이브러리 {id="standard-library"}

### 문자열을 숫자로 변환 (String to number conversions) {id="string-to-number-conversions"}

String 클래스에 잘못된 숫자에 대해 예외를 던지지 않고 숫자로 변환하는 새로운 확장 기능들이 추가되었습니다: `String.toIntOrNull(): Int?`, `String.toDoubleOrNull(): Double?` 등입니다.

```kotlin
val port = System.getenv("PORT")?.toIntOrNull() ?: 80
```

또한 `Int.toString()`, `String.toInt()`, `String.toIntOrNull()`과 같은 정수 변환 함수들 각각에 변환 진수(2~36)를 지정할 수 있는 `radix` 파라미터가 포함된 오버로드가 추가되었습니다.

### onEach() {id="oneach"}

`onEach`는 컬렉션과 시퀀스를 위한 작지만 유용한 확장 함수로, 일련의 연산 과정에서 컬렉션/시퀀스의 각 요소에 대해 부수 효과(side-effect)가 있을 수 있는 어떤 동작을 수행할 수 있게 해줍니다. Iterable에서는 `forEach`처럼 동작하지만 Iterable 인스턴스를 다시 반환합니다. 시퀀스에서는 요소가 반복될 때 지정된 동작을 지연 적용하는 래핑 시퀀스를 반환합니다.

```kotlin
inputDir.walk()
        .filter { it.isFile && it.name.endsWith(".txt") }
        .onEach { println("Moving $it to $outputDir") }
        .forEach { moveFile(it, File(outputDir, it.toRelativeString(inputDir))) }
```

### also(), takeIf(), takeUnless() {id="also-takeif-and-takeunless"}

이들은 모든 수신 객체에 적용 가능한 세 가지 범용 확장 함수입니다.

`also`는 `apply`와 비슷합니다. 수신 객체를 취하고 그 위에서 어떤 동작을 수행한 후, 해당 수신 객체를 반환합니다. 차이점은 `apply` 내부 블록에서는 수신 객체를 `this`로 사용할 수 있는 반면, `also` 내부 블록에서는 `it`으로 사용할 수 있다는 점입니다(원하는 경우 다른 이름을 줄 수도 있습니다). 이는 외부 범위의 `this`를 가리고 싶지 않을 때 유용합니다:

```kotlin
class Block {
    lateinit var content: String
}

//sampleStart
fun Block.copy() = Block().also {
    it.content = this.content
}
//sampleEnd

// 대신 'apply'를 사용하는 경우
fun Block.copy1() = Block().apply {
    this.content = this@copy1.content
}

fun main(args: Array<String>) {
    val block = Block().apply { content = "content" }
    val copy = block.copy()
    println("Testing the content was copied:")
    println(block.content == copy.content)
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3"}

`takeIf`는 단일 값에 대한 `filter`와 같습니다. 수신 객체가 조건(predicate)을 만족하는지 확인하고, 만족하면 수신 객체를, 만족하지 않으면 `null`을 반환합니다. 엘비스 연산자(?:) 및 조기 반환(early returns)과 결합하여 다음과 같은 구문을 작성할 수 있습니다:

```kotlin
val outDirFile = File(outputDir.path).takeIf { it.exists() } ?: return false
// 존재하는 outDirFile로 무언가를 수행
```

```kotlin
fun main(args: Array<String>) {
    val input = "Kotlin"
    val keyword = "in"

//sampleStart
    val index = input.indexOf(keyword).takeIf { it >= 0 } ?: error("keyword not found")
    // 입력 문자열에서 키워드를 찾은 경우 해당 인덱스로 무언가를 수행
//sampleEnd
    
    println("'$keyword' was found in '$input'")
    println(input)
    println(" ".repeat(index) + "^")
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3"}

`takeUnless`는 `takeIf`와 동일하지만 반전된 조건을 취합니다. 조건에 만족하지 _않을_ 때 수신 객체를 반환하고, 그렇지 않으면 `null`을 반환합니다. 따라서 위의 예제 중 하나를 `takeUnless`를 사용하여 다음과 같이 다시 작성할 수 있습니다:

```kotlin
val index = input.indexOf(keyword).takeUnless { it < 0 } ?: error("keyword not found")
```

람다 대신 호출 가능 참조가 있을 때 사용하는 것도 편리합니다:

```kotlin
private fun testTakeUnless(string: String) {
//sampleStart
    val result = string.takeUnless(String::isEmpty)
//sampleEnd

    println("string = \"$string\"; result = \"$result\"")
}

fun main(args: Array<String>) {
    testTakeUnless("")
    testTakeUnless("abc")
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3"}

### groupingBy() {id="groupingby"}

이 API는 키별로 컬렉션을 그룹화하고 각 그룹을 동시에 접기(fold) 위해 사용될 수 있습니다. 예를 들어, 각 문자로 시작하는 단어의 수를 세는 데 사용할 수 있습니다:

```kotlin
fun main(args: Array<String>) {
    val words = "one two three four five six seven eight nine ten".split(' ')
//sampleStart
    val frequencies = words.groupingBy { it.first() }.eachCount()
//sampleEnd
    println("Counting first letters: $frequencies.")

    // 'groupBy'와 'mapValues'를 사용하는 대안적인 방법은 중간 맵을 생성하는 반면,
    // 'groupingBy' 방식은 즉석에서 카운트합니다.
    val groupBy = words.groupBy { it.first() }.mapValues { (_, list) -> list.size }
    println("Comparing the result with using 'groupBy': ${groupBy == frequencies}.")
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3"}

### Map.toMap() 및 Map.toMutableMap() {id="map-tomap-and-map-tomutablemap"}

이 함수들은 맵을 쉽게 복사하는 데 사용될 수 있습니다:

```kotlin
class ImmutablePropertyBag(map: Map<String, Any>) {
    private val mapCopy = map.toMap()
}
```

### Map.minus(key) {id="map-minus-key"}

`plus` 연산자는 읽기 전용 맵에 키-값 쌍을 추가하여 새로운 맵을 생성하는 방법을 제공하지만, 그 반대인 맵에서 키를 제거하는 간단한 방법은 없었습니다. 키를 제거하려면 `Map.filter()`나 `Map.filterKeys()`와 같이 덜 직관적인 방법에 의존해야 했습니다. 이제 `minus` 연산자가 이 공백을 메워줍니다. 단일 키, 키 컬렉션, 키 시퀀스, 키 배열을 제거하기 위한 4가지 오버로드가 제공됩니다.

```kotlin
fun main(args: Array<String>) {
//sampleStart
    val map = mapOf("key" to 42)
    val emptyMap = map - "key"
//sampleEnd
    
    println("map: $map")
    println("emptyMap: $emptyMap")
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3"}

### minOf() 및 maxOf() {id="minof-and-maxof"}

이 함수들은 원시 숫자나 `Comparable` 객체인 두 개 또는 세 개의 주어진 값 중에서 최솟값과 최댓값을 찾는 데 사용될 수 있습니다. 또한 `Comparable`이 아닌 객체들을 비교하고 싶을 때 추가적인 `Comparator` 인스턴스를 받는 오버로드도 각각 제공됩니다.

```kotlin
fun main(args: Array<String>) {
//sampleStart
    val list1 = listOf("a", "b")
    val list2 = listOf("x", "y", "z")
    val minSize = minOf(list1.size, list2.size)
    val longestList = maxOf(list1, list2, compareBy { it.size })
//sampleEnd
    
    println("minSize = $minSize")
    println("longestList = $longestList")
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3"}

### 배열 스타일의 List 인스턴스화 함수 {id="array-like-list-instantiation-functions"}

`Array` 생성자와 유사하게, 이제 `List` 및 `MutableList` 인스턴스를 생성하고 람다를 호출하여 각 요소를 초기화하는 함수들이 제공됩니다:

```kotlin
fun main(args: Array<String>) {
//sampleStart
    val squares = List(10) { index -> index * index }
    val mutable = MutableList(10) { 0 }
//sampleEnd

    println("squares: $squares")
    println("mutable: $mutable")
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3"}

### Map.getValue() {id="map-getvalue"}

`Map`에 대한 이 확장 함수는 지정된 키에 해당하는 기존 값을 반환하거나, 키를 찾을 수 없다는 메시지와 함께 예외를 던집니다. 맵이 `withDefault`로 생성된 경우, 이 함수는 예외를 던지는 대신 기본값을 반환합니다.

```kotlin
fun main(args: Array<String>) {
//sampleStart    
    val map = mapOf("key" to 42)
    // null이 될 수 없는 Int 값 42를 반환함
    val value: Int = map.getValue("key")

    val mapWithDefault = map.withDefault { k -> k.length }
    // 4를 반환함
    val value2 = mapWithDefault.getValue("key2")

    // map.getValue("anotherKey") // <- NoSuchElementException을 던짐
//sampleEnd
    
    println("value is $value")
    println("value2 is $value2")
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3"}

### 추상 컬렉션 (Abstract collections) {id="abstract-collections"}

이 추상 클래스들은 Kotlin 컬렉션 클래스를 구현할 때 기본 클래스로 사용될 수 있습니다. 읽기 전용 컬렉션 구현을 위해 `AbstractCollection`, `AbstractList`, `AbstractSet`, `AbstractMap`이 있으며, 가변 컬렉션을 위해 `AbstractMutableCollection`, `AbstractMutableList`, `AbstractMutableSet`, `AbstractMutableMap`이 있습니다. JVM에서 이러한 가변 추상 컬렉션은 대부분의 기능을 JDK의 추상 컬렉션으로부터 상속받습니다.

### 배열 조작 함수 {id="array-manipulation-functions"}

표준 라이브러리는 이제 배열에 대한 요소별 연산을 위한 일련의 함수를 제공합니다: 비교(`contentEquals` 및 `contentDeepEquals`), 해시 코드 계산(`contentHashCode` 및 `contentDeepHashCode`), 문자열 변환(`contentToString` 및 `contentDeepToString`) 등입니다. 이들은 JVM(여기서는 `java.util.Arrays`의 해당 함수에 대한 별칭으로 동작함)과 JS(Kotlin 표준 라이브러리에 구현이 제공됨) 모두에서 지원됩니다.

```kotlin
fun main(args: Array<String>) {
//sampleStart
    val array = arrayOf("a", "b", "c")
    println(array.toString())  // JVM 구현: 타입과 해시값으로 구성된 알 수 없는 문자열
    println(array.contentToString())  // 리스트처럼 깔끔하게 형식화됨
//sampleEnd
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3"}

## JVM 백엔드 {id="jvm-backend"}

### Java 8 바이트코드 지원 {id="java-8-bytecode-support"}

Kotlin은 이제 Java 8 바이트코드를 생성하는 옵션을 제공합니다(`-jvm-target 1.8` 명령줄 옵션 또는 Maven/Gradle의 해당 옵션). 현재는 바이트코드의 의미 체계가 변경되지는 않지만(특히 인터페이스의 기본 메서드와 람다는 Kotlin 1.0과 똑같이 생성됨), 나중에 이를 더 활용할 계획입니다.

### Java 8 표준 라이브러리 지원 {id="java-8-standard-library-support"}

Java 7 및 8에서 추가된 새로운 JDK API를 지원하는 별도 버전의 표준 라이브러리가 제공됩니다. 새로운 API에 대한 액세스가 필요한 경우 표준 `kotlin-stdlib` 대신 `kotlin-stdlib-jre7` 및 `kotlin-stdlib-jre8` Maven 아티팩트를 사용하세요. 이 아티팩트들은 `kotlin-stdlib` 위에 추가된 아주 작은 확장이며, 프로젝트에 전이 의존성(transitive dependency)으로 포함됩니다.

### 바이트코드의 파라미터 이름 {id="parameter-names-in-the-bytecode"}

Kotlin은 이제 바이트코드에 파라미터 이름을 저장하는 것을 지원합니다. 이는 `-java-parameters` 명령줄 옵션을 사용하여 활성화할 수 있습니다.

### 상수 인라이닝 (Constant inlining) {id="constant-inlining"}

컴파일러는 이제 `const val` 프로퍼티의 값을 해당 프로퍼티가 사용되는 위치에 인라인화합니다.

### 가변 클로저 변수 (Mutable closure variables) {id="mutable-closure-variables"}

람다에서 가변 클로저 변수를 캡처하는 데 사용되는 박스 클래스들에 더 이상 휘발성(volatile) 필드가 포함되지 않습니다. 이 변경으로 성능은 향상되지만, 드문 사용 시나리오에서 새로운 경쟁 상태(race condition)가 발생할 수 있습니다. 이에 영향을 받는 경우 변수 액세스에 대해 직접 동기화를 제공해야 합니다.

### javax.script 지원 {id="javax-script-support"}

Kotlin은 이제 [javax.script API](https://docs.oracle.com/javase/8/docs/api/javax/script/package-summary.html) (JSR-223)와 통합됩니다. 이 API를 사용하면 런타임에 코드 스니펫을 평가할 수 있습니다:

```kotlin
val engine = ScriptEngineManager().getEngineByExtension("kts")!!
engine.eval("val x = 3")
println(engine.eval("x + 2"))  // 5를 출력함
```

이 API를 사용하는 대규모 예제 프로젝트는 [여기](https://github.com/JetBrains/kotlin/tree/1.1.0/libraries/examples/kotlin-jsr223-local-example)를 참조하세요.

### kotlin.reflect.full {id="kotlin-reflect-full"}

[Java 9 지원을 준비](https://blog.jetbrains.com/kotlin/2017/01/kotlin-1-1-whats-coming-in-the-standard-library/)하기 위해 `kotlin-reflect.jar` 라이브러리의 확장 함수와 프로퍼티들이 `kotlin.reflect.full` 패키지로 이동되었습니다. 이전 패키지(`kotlin.reflect`)의 이름들은 더 이상 권장되지 않으며 Kotlin 1.2에서 제거될 예정입니다. 핵심 리플렉션 인터페이스(예: `KClass`)는 `kotlin-reflect`가 아닌 Kotlin 표준 라이브러리의 일부이므로 이 이동의 영향을 받지 않습니다.

## JavaScript 백엔드 {id="javascript-backend"}

### 통합 표준 라이브러리 {id="unified-standard-library"}

이제 Kotlin 표준 라이브러리의 훨씬 더 많은 부분이 JavaScript로 컴파일된 코드에서 사용될 수 있습니다. 특히 컬렉션(`ArrayList`, `HashMap` 등), 예외(`IllegalArgumentException` 등) 및 기타 몇 가지(`StringBuilder`, `Comparator`) 핵심 클래스들이 이제 `kotlin` 패키지 아래에 정의됩니다. JVM에서는 이러한 이름들이 해당 JDK 클래스에 대한 타입 별칭이며, JS에서는 Kotlin 표준 라이브러리에 클래스들이 구현되어 있습니다.

### 향상된 코드 생성 {id="better-code-generation"}

JavaScript 백엔드는 이제 미니파이어(minifiers), 옵티마이저(optimisers), 린터(linters) 등과 같은 JS 코드 처리 도구에 더 친숙하고 정적으로 확인 가능한 코드를 생성합니다.

### external 수식어 {id="the-external-modifier"}

Kotlin에서 JavaScript로 구현된 클래스에 타입 세이프한 방식으로 액세스해야 하는 경우, `external` 수식어를 사용하여 Kotlin 선언을 작성할 수 있습니다. (Kotlin 1.0에서는 대신 `@native` 어노테이션이 사용되었습니다.) JVM 타겟과 달리 JS 타겟은 클래스와 프로퍼티에 `external` 수식어를 사용하는 것을 허용합니다. 예를 들어, DOM `Node` 클래스를 선언하는 방법은 다음과 같습니다:

```kotlin
external class Node {
    val firstChild: Node

    fun appendChild(child: Node): Node

    fun removeChild(child: Node): Node

    // 등등
}
```

### 개선된 임포트 처리 {id="improved-import-handling"}

이제 JavaScript 모듈에서 임포트해야 하는 선언을 더 정확하게 기술할 수 있습니다. 외부 선언에 `@JsModule("<module-name>")` 어노테이션을 추가하면 컴파일 중에 모듈 시스템(CommonJS 또는 AMD)으로 적절하게 임포트됩니다. 예를 들어 CommonJS의 경우 선언은 `require(...)` 함수를 통해 임포트됩니다. 또한 선언을 모듈로서 또는 글로벌 JavaScript 객체로서 임포트하고 싶다면 `@JsNonModule` 어노테이션을 사용할 수 있습니다.

예를 들어 JQuery를 Kotlin 모듈로 임포트하는 방법은 다음과 같습니다:

```kotlin
external interface JQuery {
    fun toggle(duration: Int = definedExternally): JQuery
    fun click(handler: (Event) -> Unit): JQuery
}

@JsModule("jquery")
@JsNonModule
@JsName("$")
external fun jquery(selector: String): JQuery
```

이 경우 JQuery는 `jquery`라는 이름의 모듈로 임포트됩니다. 또는 Kotlin 컴파일러가 어떤 모듈 시스템을 사용하도록 설정되었는지에 따라 $-객체로 사용될 수 있습니다.

애플리케이션에서 다음과 같이 이러한 선언을 사용할 수 있습니다:

```kotlin
fun main(args: Array<String>) {
    jquery(".toggle-button").click {
        jquery(".toggle-panel").toggle(300)
    }
}
```
