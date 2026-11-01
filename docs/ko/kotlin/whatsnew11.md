[//]: # (title: Kotlin 1.1의 새로운 기능)

<web-summary>새로운 언어 기능, Kotlin/JVM 및 JS 업데이트, Gradle 및 Maven 빌드 도구 지원을 다루는 Kotlin 1.1 릴리스 노트를 확인해 보세요.</web-summary>

_출시일: 2016년 2월 15일_

## 목차 {id="table-of-contents"}

* [코루틴](#coroutines-experimental)
* [기타 언어 기능](#other-language-features)
* [표준 라이브러리](#standard-library)
* [JVM 백엔드](#jvm-backend)
* [JavaScript 백엔드](#javascript-backend)

> Kotlin 릴리스 주기에 대한 자세한 정보는 [Kotlin 릴리스 프로세스](releases.md)를 참조하세요.
>
{style="tip"}

## JavaScript {id="javascript"}

Kotlin 1.1부터 JavaScript 타깃은 더 이상 실험적인 기능으로 간주되지 않습니다. 모든 언어 기능이 지원되며, 프론트엔드 개발 환경과의 통합을 위한 여러 새로운 도구가 제공됩니다. 변경 사항에 대한 자세한 목록은 [아래](#javascript-backend)를 참조하세요.

## 코루틴 (실험적 기능) {id="coroutines-experimental"}

Kotlin 1.1의 핵심 신기능은 *코루틴(Coroutines)*으로, `async`/`await`, `yield` 및 유사한 프로그래밍 패턴을 지원합니다. Kotlin 설계의 핵심적인 특징은 코루틴 실행 구현이 언어 자체가 아닌 라이브러리의 일부라는 점이며, 따라서 특정 프로그래밍 패러다임이나 동시성 라이브러리에 종속되지 않습니다.

코루틴은 일시 중단(suspend)되었다가 나중에 다시 재개(resume)될 수 있는 사실상의 경량 스레드(light-weight thread)입니다.
코루틴은 _[일시 중단 함수(suspending functions)](coroutines-basics.md)_를 통해 지원됩니다. 이러한 함수를 호출하면 코루틴이 일시 중단될 수 있으며, 새 코루틴을 시작할 때는 일반적으로 익명 일시 중단 함수(즉, 일시 중단 람다)를 사용합니다.

외부 라이브러리인 [kotlinx.coroutines](https://github.com/kotlin/kotlinx.coroutines)에 구현된 `async`/`await`의 예를 살펴보겠습니다.

```kotlin
// 백그라운드 스레드 풀에서 코드를 실행합니다.
fun asyncOverlay() = async(CommonPool) {
    // 두 개의 비동기 작업을 시작합니다.
    val original = asyncLoadImage("original")
    val overlay = asyncLoadImage("overlay")
    // 두 결과에 오버레이를 적용합니다.
    applyOverlay(original.await(), overlay.await())
}

// UI 컨텍스트에서 새 코루틴을 실행합니다.
launch(UI) {
    // 비동기 오버레이 작업이 완료될 때까지 대기합니다.
    val image = asyncOverlay().await()
    // 그런 다음 UI에 표시합니다.
    showImage(image)
}
```

여기서 `async { ... }`는 코루틴을 시작하며, `await()`를 사용할 때 대기 중인 작업이 실행되는 동안 코루틴 실행이 일시 중단되고, 해당 작업이 완료되면 (다른 스레드일 수도 있는 곳에서) 다시 재개됩니다.

표준 라이브러리는 코루틴을 사용하여 `yield` 및 `yieldAll` 함수를 통한 *지연 생성 시퀀스(lazily generated sequences)*를 지원합니다.
이러한 시퀀스에서는 시퀀스 요소를 반환하는 코드 블록이 각 요소를 가져온 후 일시 중단되며, 다음 요소가 요청될 때 재개됩니다. 다음은 그 예시입니다.

```kotlin
import kotlin.coroutines.experimental.*

fun main(args: Array<String>) {
    val seq = buildSequence {
      for (i in 1..5) {
          // i의 제곱을 산출(yield)합니다.
          yield(i * i)
      }
      // 범위를 산출합니다.
      yieldAll(26..28)
    }

    // 시퀀스를 출력합니다.
    println(seq.toList())
}
```

결과를 확인하려면 위 코드를 실행해 보세요. 자유롭게 수정하고 다시 실행할 수 있습니다!

자세한 내용은 [코루틴 문서](coroutines-overview.md) 및 [튜토리얼](coroutines-and-channels.md)을 참조하세요.

현재 코루틴은 **실험적 기능(experimental feature)**으로 간주되며, 이는 Kotlin 팀이 1.1 최종 릴리스 이후 이 기능의 하위 호환성을 보장하지 않음을 의미합니다.

## 기타 언어 기능 {id="other-language-features"}

### 타입 별칭 {id="type-aliases"}

타입 별칭(Type aliases)을 사용하면 기존 타입에 대한 대체 이름을 정의할 수 있습니다.
이는 컬렉션과 같은 제네릭 타입이나 함수 타입에 가장 유용합니다.
다음은 예시입니다.

```kotlin
//sampleStart
typealias OscarWinners = Map<String, String>

fun countLaLaLand(oscarWinners: OscarWinners) =
        oscarWinners.count { it.value.contains("La La Land") }

// 원래 타입 이름과 타입 별칭은 서로 호환되어 사용할 수 있습니다.
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
{kotlin-runnable="true"}

자세한 내용은 [타입 별칭 문서](type-aliases.md) 및 [KEEP](https://github.com/Kotlin/KEEP/blob/master/proposals/type-aliases.md)을 참조하세요.

### 바인딩된 호출 가능 참조 {id="bound-callable-references"}

이제 `::` 연산자를 사용하여 특정 객체 인스턴스의 메서드나 프로퍼티를 가리키는 [멤버 참조](lambdas.md#function-references)를 얻을 수 있습니다. 이전에는 이를 람다로만 표현할 수 있었습니다.
다음은 예시입니다.

```kotlin
//sampleStart
val numberRegex = "\\d+".toRegex()
val numbers = listOf("abc", "123", "456").filter(numberRegex::matches)
//sampleEnd

fun main(args: Array<String>) {
    println("Result is $numbers")
}
```
{kotlin-runnable="true"}

자세한 내용은 [문서](reflection.md) 및 [KEEP](https://github.com/Kotlin/KEEP/blob/master/proposals/bound-callable-references.md)을 참조하세요.

### 봉인된 클래스 및 데이터 클래스 {id="sealed-and-data-classes"}

Kotlin 1.1에서는 Kotlin 1.0에 존재했던 봉인된 클래스(sealed class)와 데이터 클래스(data class)에 대한 일부 제한 사항이 제거되었습니다.
이제 최상위 봉인된 클래스의 하위 클래스를 해당 클래스의 중첩 클래스로 작성할 필요 없이, 동일한 파일 내의 최상위 레벨에 정의할 수 있습니다.
또한 데이터 클래스가 다른 클래스를 상속할 수 있게 되었습니다.
이를 통해 표현식 클래스 계층 구조를 깔끔하고 명확하게 정의할 수 있습니다.

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
{kotlin-runnable="true"}

자세한 내용은 [봉인된 클래스 문서](sealed-classes.md) 또는 [봉인된 클래스 KEEP](https://github.com/Kotlin/KEEP/blob/master/proposals/sealed-class-inheritance.md) 및 [데이터 클래스 KEEP](https://github.com/Kotlin/KEEP/blob/master/proposals/data-class-inheritance.md)을 참조하세요.

### 람다에서의 구조 분해 {id="destructuring-in-lambdas"}

이제 [구조 분해 선언(destructuring declaration)](destructuring-declarations.md) 구문을 사용하여 람다에 전달된 인수를 언팩할 수 있습니다.
다음은 예시입니다.

```kotlin
fun main(args: Array<String>) {
//sampleStart
    val map = mapOf(1 to "one", 2 to "two")
    // 기존 방식
    println(map.mapValues { entry ->
      val (key, value) = entry
      "$key -> $value!"
    })
    // 현재 방식
    println(map.mapValues { (key, value) -> "$key -> $value!" })
//sampleEnd
}
```
{kotlin-runnable="true"}

자세한 내용은 [구조 분해 선언 문서](destructuring-declarations.md) 및 [KEEP](https://github.com/Kotlin/KEEP/blob/master/proposals/destructuring-in-parameters.md)을 참조하세요.

### 사용하지 않는 매개변수에 대한 밑줄 기호 {id="underscores-for-unused-parameters"}

여러 매개변수가 있는 람다의 경우, 사용하지 않는 매개변수 이름을 `_` 문자로 대체할 수 있습니다.

```kotlin
fun main(args: Array<String>) {
    val map = mapOf(1 to "one", 2 to "two")

//sampleStart
    map.forEach { _, value -> println("$value!") }
//sampleEnd
}
```
{kotlin-runnable="true"}

이는 [구조 분해 선언](destructuring-declarations.md)에서도 작동합니다.

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
{kotlin-runnable="true"}

자세한 내용은 [KEEP](https://github.com/Kotlin/KEEP/blob/master/proposals/underscore-for-unused-parameters.md)을 참조하세요.

### 숫자 리터럴의 밑줄 기호 {id="underscores-in-numeric-literals"}

Java 8과 마찬가지로, 이제 Kotlin에서도 숫자 리터럴에서 자릿수를 그룹화하기 위해 밑줄(`_`)을 사용할 수 있습니다.

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
{kotlin-runnable="true"}

자세한 내용은 [KEEP](https://github.com/Kotlin/KEEP/blob/master/proposals/underscores-in-numeric-literals.md)을 참조하세요.

### 프로퍼티를 위한 더 짧은 구문 {id="shorter-syntax-for-properties"}

게터(getter)가 표현식 본문으로 정의된 프로퍼티의 경우, 이제 프로퍼티 타입을 생략할 수 있습니다.

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
{kotlin-runnable="true"}

### 인라인 프로퍼티 접근자 {id="inline-property-accessors"}

프로퍼티에 뒷받침하는 필드(backing field)가 없는 경우, 프로퍼티 접근자에 `inline` 제어자를 붙일 수 있습니다.
이러한 접근자는 [인라인 함수](inline-functions.md)와 동일한 방식으로 컴파일됩니다.

```kotlin
//sampleStart
public val <T> List<T>.lastIndex: Int
    inline get() = this.size - 1
//sampleEnd

fun main(args: Array<String>) {
    val list = listOf('a', 'b')
    // 게터가 인라인 처리됨
    println("Last index of $list is ${list.lastIndex}")
}
```
{kotlin-runnable="true"}

프로퍼티 전체를 `inline`으로 표시할 수도 있으며, 이 경우 해당 제어자가 두 접근자 모두에 적용됩니다.

자세한 내용은 [인라인 함수 문서](inline-functions.md#inline-properties) 및 [KEEP](https://github.com/Kotlin/KEEP/blob/master/proposals/inline-properties.md)을 참조하세요.

### 로컬 위임 프로퍼티 {id="local-delegated-properties"}

이제 로컬 변수에도 [위임 프로퍼티(delegated property)](delegated-properties.md) 구문을 사용할 수 있습니다.
지연 초기화되는 로컬 변수를 정의하는 것이 대표적인 활용 예입니다.

```kotlin
import java.util.Random

fun needAnswer() = Random().nextBoolean()

fun main(args: Array<String>) {
//sampleStart
    val answer by lazy {
        println("Calculating the answer...")
        42
    }
    if (needAnswer()) {                     // 무작위 값을 반환
        println("The answer is $answer.")   // 이 시점에 answer가 계산됨
    }
    else {
        println("Sometimes no answer is the answer...")
    }
//sampleEnd
}
```
{kotlin-runnable="true"}

자세한 내용은 [KEEP](https://github.com/Kotlin/KEEP/blob/master/proposals/local-delegated-properties.md)을 참조하세요.

### 위임 프로퍼티 바인딩 가로채기 {id="interception-of-delegated-property-binding"}

[위임 프로퍼티](delegated-properties.md)의 경우, 이제 `provideDelegate` 연산자를 사용하여 위임 객체와 프로퍼티 간의 바인딩을 가로챌 수 있습니다.
예를 들어 바인딩 전에 프로퍼티 이름을 검사하려는 경우 다음과 같이 작성할 수 있습니다.

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

`provideDelegate` 메서드는 `MyUI` 인스턴스를 생성하는 동안 각 프로퍼티에 대해 호출되며, 즉시 필요한 유효성 검사를 수행할 수 있습니다.

자세한 내용은 [위임 프로퍼티 문서](delegated-properties.md)를 참조하세요.

### 제네릭 enum 값 접근 {id="generic-enum-value-access"}

이제 제네릭한 방식으로 enum 클래스의 값을 열거할 수 있습니다.

```kotlin
//sampleStart
enum class RGB { RED, GREEN, BLUE }

inline fun <reified T : Enum<T>> printAllValues() {
    print(enumValues<T>().joinToString { it.name })
}
//sampleEnd

fun main(args: Array<String>) {
    printAllValues<RGB>() // RED, GREEN, BLUE 출력
}
```
{kotlin-runnable="true"}

### DSL에서 암시적 수신 객체에 대한 스코프 제어 {id="scope-control-for-implicit-receivers-in-dsls"}

[`@DslMarker`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin/-dsl-marker/index.html) 어노테이션을 사용하면 DSL 컨텍스트에서 외부 스코프의 수신 객체 사용을 제한할 수 있습니다.
대표적인 [HTML 빌더 예제](type-safe-builders.md)를 살펴보겠습니다.

```kotlin
table {
    tr {
        td { + "Text" }
    }
}
```

Kotlin 1.0에서는 `td`에 전달된 람다 내의 코드가 세 개의 암시적 수신 객체(`table`에 전달된 객체, `tr`에 전달된 객체, `td`에 전달된 객체)에 모두 접근할 수 있었습니다. 이로 인해 해당 컨텍스트에서 의미가 없는 메서드를 호출할 수 있었습니다. 예를 들어 `td` 내부에서 `tr`을 호출하여 `<td>` 안에 `<tr>` 태그를 넣는 등의 동작이 가능했습니다.

Kotlin 1.1에서는 이를 제한하여 `td`의 암시적 수신 객체에 정의된 메서드만 `td`에 전달된 람다 내부에서 사용할 수 있도록 만들 수 있습니다. `@DslMarker` 메타 어노테이션이 지정된 사용자 정의 어노테이션을 정의하고, 이를 태그 클래스의 기본 클래스에 적용하면 됩니다.

자세한 내용은 [타입 안전한 빌더 문서](type-safe-builders.md) 및 [KEEP](https://github.com/Kotlin/KEEP/blob/master/proposals/scope-control-for-implicit-receivers.md)을 참조하세요.

### rem 연산자 {id="rem-operator"}

`mod` 연산자는 이제 지원 중단(deprecated)되었으며 대신 `rem`이 사용됩니다. 자세한 배경은 [이 이슈](https://youtrack.jetbrains.com/issue/KT-14650)를 참조하세요.

## 표준 라이브러리 {id="standard-library"}

### 문자열-숫자 변환 {id="string-to-number-conversions"}

유효하지 않은 숫자에 대해 예외를 발생시키지 않고 숫자로 변환하는 String 클래스의 새로운 확장 기능들이 다수 추가되었습니다:
`String.toIntOrNull(): Int?`, `String.toDoubleOrNull(): Double?` 등.

```kotlin
val port = System.getenv("PORT")?.toIntOrNull() ?: 80
```

또한 `Int.toString()`, `String.toInt()`, `String.toIntOrNull()`과 같은 정수 변환 함수에 변환 진법(2~36)을 지정할 수 있는 `radix` 매개변수 오버로드가 추가되었습니다.

### onEach() {id="oneach"}

`onEach`는 컬렉션과 시퀀스를 위한 작지만 유용한 확장 함수로, 일련의 연산 체인에서 컬렉션/시퀀스의 각 요소에 대해 부수 효과(side-effect)가 수반될 수 있는 특정 작업을 수행할 수 있도록 합니다.
이터러블(iterable)에서는 `forEach`처럼 동작하지만 이터러블 인스턴스 자체를 계속해서 반환합니다. 시퀀스에서는 요소가 순회될 때 주어진 작업을 지연 적용하는 래핑 시퀀스를 반환합니다.

```kotlin
inputDir.walk()
        .filter { it.isFile && it.name.endsWith(".txt") }
        .onEach { println("Moving $it to $outputDir") }
        .forEach { moveFile(it, File(outputDir, it.toRelativeString(inputDir))) }
```

### also(), takeIf(), takeUnless() {id="also-takeif-and-takeunless"}

모든 수신 객체에 적용할 수 있는 세 가지 범용 확장 함수입니다.
 
`also`는 `apply`와 유사합니다. 수신 객체를 받아 작업을 수행한 후 해당 수신 객체를 반환합니다.
차이점은 `apply` 내부 블록에서는 수신 객체를 `this`로 사용할 수 있는 반면, `also` 내부 블록에서는 `it`으로 사용할 수 있다는 점입니다(원하는 경우 다른 이름을 지정할 수도 있습니다).
이는 외부 스코프의 `this`를 가리고 싶지 않을 때 유용합니다.

```kotlin
class Block {
    lateinit var content: String
}

//sampleStart
fun Block.copy() = Block().also {
    it.content = this.content
}
//sampleEnd

// 'apply'를 대신 사용하는 경우
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
{kotlin-runnable="true"}

`takeIf`는 단일 값을 위한 `filter`와 유사합니다. 수신 객체가 조건식(predicate)을 충족하는지 확인하고, 충족하면 수신 객체를 반환하고 그렇지 않으면 `null`을 반환합니다.
엘비스 연산자(`?:`) 및 조기 반환(early return)과 결합하여 다음과 같은 구문을 작성할 수 있습니다.

```kotlin
val outDirFile = File(outputDir.path).takeIf { it.exists() } ?: return false
// 존재하는 outDirFile로 작업 수행
```

```kotlin
fun main(args: Array<String>) {
    val input = "Kotlin"
    val keyword = "in"

//sampleStart
    val index = input.indexOf(keyword).takeIf { it >= 0 } ?: error("keyword not found")
    // 키워드가 검색된 경우 입력 문자열 내 키워드의 인덱스로 작업 수행
//sampleEnd
    
    println("'$keyword' was found in '$input'")
    println(input)
    println(" ".repeat(index) + "^")
}
```
{kotlin-runnable="true"}

`takeUnless`는 `takeIf`와 동일하지만 반대 조건식을 취합니다. 조건식을 충족하지 *않을* 때 수신 객체를 반환하고, 충족할 때는 `null`을 반환합니다. 따라서 위의 예시 중 하나를 `takeUnless`를 사용하여 다음과 같이 다시 작성할 수 있습니다.

```kotlin
val index = input.indexOf(keyword).takeUnless { it < 0 } ?: error("keyword not found")
```

또한 람다 대신 호출 가능 참조를 사용할 때도 편리하게 활용할 수 있습니다.

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
{kotlin-runnable="true"}

### groupingBy() {id="groupingby"}

이 API는 컬렉션을 키별로 그룹화하고 각 그룹을 동시에 접기(fold) 연산하는 데 사용할 수 있습니다. 예를 들어 각 문자로 시작하는 단어 수를 세는 데 사용할 수 있습니다.

```kotlin
fun main(args: Array<String>) {
    val words = "one two three four five six seven eight nine ten".split(' ')
//sampleStart
    val frequencies = words.groupingBy { it.first() }.eachCount()
//sampleEnd
    println("Counting first letters: $frequencies.")

    // 'groupBy'와 'mapValues'를 사용하는 대체 방식은 중간 맵을 생성하지만,
    // 'groupingBy' 방식은 즉석에서 바로 계산합니다.
    val groupBy = words.groupBy { it.first() }.mapValues { (_, list) -> list.size }
    println("Comparing the result with using 'groupBy': ${groupBy == frequencies}.")
}
```
{kotlin-runnable="true"}

### Map.toMap() 및 Map.toMutableMap() {id="map-tomap-and-map-tomutablemap"}

이 함수들을 사용하면 맵을 쉽게 복사할 수 있습니다.

```kotlin
class ImmutablePropertyBag(map: Map<String, Any>) {
    private val mapCopy = map.toMap()
}
```

### Map.minus(key) {id="map-minus-key"}

`plus` 연산자는 읽기 전용 맵에 키-값 쌍을 추가하여 새 맵을 만드는 방법을 제공하지만, 그 반대의 작업은 간단하지 않았습니다. 즉, 맵에서 키를 제거하려면 `Map.filter()`나 `Map.filterKeys()` 같은 직관적이지 않은 방법을 사용해야 했습니다.
이제 `minus` 연산자가 이 빈틈을 채워줍니다. 단일 키, 키 컬렉션, 키 시퀀스, 키 배열을 제거할 수 있는 4가지 오버로드가 제공됩니다.

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
{kotlin-runnable="true"}

### minOf() 및 maxOf() {id="minof-and-maxof"}

이 함수들은 주어진 두 개 또는 세 개의 값 중 가장 작거나 가장 큰 값을 찾는 데 사용할 수 있으며, 여기서 값은 원시 타입 숫자이거나 `Comparable` 객체입니다. 객체 자체가 비교 가능하지 않은 경우를 위해 추가 `Comparator` 인스턴스를 받는 각 함수의 오버로드도 제공됩니다.

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
{kotlin-runnable="true"}

### 배열 형태의 List 인스턴스화 함수 {id="array-like-list-instantiation-functions"}

`Array` 생성자와 유사하게, 이제 람다를 호출하여 각 요소를 초기화하면서 `List` 및 `MutableList` 인스턴스를 생성하는 함수가 제공됩니다.

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
{kotlin-runnable="true"}

### Map.getValue() {id="map-getvalue"}

`Map`의 이 확장 함수는 지정된 키에 해당하는 기존 값을 반환하거나, 어떤 키를 찾을 수 없는지 명시된 예외를 발생시킵니다.
해당 맵이 `withDefault`로 생성된 경우, 이 함수는 예외를 던지는 대신 기본값을 반환합니다.

```kotlin
fun main(args: Array<String>) {
//sampleStart    
    val map = mapOf("key" to 42)
    // null 불가능한 Int 값 42 반환
    val value: Int = map.getValue("key")

    val mapWithDefault = map.withDefault { k -> k.length }
    // 4 반환
    val value2 = mapWithDefault.getValue("key2")

    // map.getValue("anotherKey") // <- NoSuchElementException 발생
//sampleEnd
    
    println("value is $value")
    println("value2 is $value2")
}
```
{kotlin-runnable="true"}

### 추상 컬렉션 클래스 {id="abstract-collections"}

이러한 추상 클래스들은 Kotlin 컬렉션 클래스를 구현할 때 기본 클래스로 사용할 수 있습니다.
읽기 전용 컬렉션 구현을 위해 `AbstractCollection`, `AbstractList`, `AbstractSet`, `AbstractMap`이 제공되며, 가변 컬렉션을 위해 `AbstractMutableCollection`, `AbstractMutableList`, `AbstractMutableSet`, `AbstractMutableMap`이 제공됩니다.
JVM에서 이러한 추상 가변 컬렉션은 대부분의 기능을 JDK의 추상 컬렉션으로부터 상속받습니다.

### 배열 조작 함수 {id="array-manipulation-functions"}

이제 표준 라이브러리에서 배열에 대한 요소별 연산 세트를 제공합니다. 비교(`contentEquals` 및 `contentDeepEquals`), 해시 코드 계산(`contentHashCode` 및 `contentDeepHashCode`), 문자열 변환(`contentToString` 및 `contentDeepToString`) 등이 포함됩니다. 이 기능들은 JVM(`java.util.Arrays`의 해당 함수에 대한 별칭으로 작동)과 JS(Kotlin 표준 라이브러리에 구현 제공) 모두에서 지원됩니다.

```kotlin
fun main(args: Array<String>) {
//sampleStart
    val array = arrayOf("a", "b", "c")
    println(array.toString())  // JVM 구현: 타입 및 해시 문자열 출력
    println(array.contentToString())  // 리스트 형태로 깔끔하게 포맷팅되어 출력
//sampleEnd
}
```
{kotlin-runnable="true"}

## JVM 백엔드 {id="jvm-backend"}

### Java 8 바이트코드 지원 {id="java-8-bytecode-support"}

이제 Kotlin에서 Java 8 바이트코드를 생성하는 옵션(`-jvm-target 1.8` 명령줄 옵션 또는 Maven/Gradle의 해당 옵션)을 사용할 수 있습니다. 현재는 바이트코드의 시맨틱이 변경되지 않지만(특히 인터페이스의 기본 메서드와 람다는 Kotlin 1.0과 완전히 동일하게 생성됨), 향후 이를 더 활용할 계획입니다.

### Java 8 표준 라이브러리 지원 {id="java-8-standard-library-support"}

이제 Java 7 및 8에서 추가된 새로운 JDK API를 지원하는 표준 라이브러리의 별도 버전이 제공됩니다.
새로운 API에 접근해야 하는 경우 표준 `kotlin-stdlib` 대신 `kotlin-stdlib-jre7` 및 `kotlin-stdlib-jre8` Maven 아티팩트를 사용하세요.
이 아티팩트들은 `kotlin-stdlib` 위에 추가된 소규모 확장이며, 프로젝트에 전이 의존성(transitive dependency)으로 포함됩니다.

### 바이트코드 내 매개변수 이름 {id="parameter-names-in-the-bytecode"}

Kotlin은 이제 바이트코드에 매개변수 이름을 저장하는 기능을 지원합니다. 이는 `-java-parameters` 명령줄 옵션을 사용하여 활성화할 수 있습니다.

### 상수 인라인화 {id="constant-inlining"}

컴파일러는 이제 `const val` 프로퍼티의 값을 사용되는 위치에 직접 인라인화합니다.

### 가변 클로저 변수 {id="mutable-closure-variables"}

람다에서 가변 클로저 변수를 캡처하는 데 사용되는 박스 클래스에 더 이상 volatile 필드가 포함되지 않습니다. 이 변경을 통해 성능이 향상되지만, 드문 사용 시나리오에서는 새로운 경쟁 상태(race condition)가 발생할 수 있습니다. 이로 인해 영향을 받는 경우 변수 접근을 위한 자체 동기화를 제공해야 합니다.

### javax.script 지원 {id="javax-script-support"}

Kotlin이 이제 [javax.script API](https://docs.oracle.com/javase/8/docs/api/javax/script/package-summary.html)(JSR-223)와 통합됩니다.
이 API를 사용하면 런타임에 코드 스니펫을 평가할 수 있습니다.

```kotlin
val engine = ScriptEngineManager().getEngineByExtension("kts")!!
engine.eval("val x = 3")
println(engine.eval("x + 2"))  // 5 출력
```

해당 API를 사용하는 더 큰 예제 프로젝트는 [여기](https://github.com/JetBrains/kotlin/tree/1.1.0/libraries/examples/kotlin-jsr223-local-example)를 참조하세요.

### kotlin.reflect.full {id="kotlin-reflect-full"}

[Java 9 지원 준비](https://blog.jetbrains.com/kotlin/2017/01/kotlin-1-1-whats-coming-in-the-standard-library/)를 위해 `kotlin-reflect.jar` 라이브러리의 확장 함수 및 프로퍼티가 `kotlin.reflect.full` 패키지로 이동되었습니다. 이전 패키지(`kotlin.reflect`)의 이름들은 지원 중단되었으며 Kotlin 1.2에서 제거될 예정입니다. 핵심 리플렉션 인터페이스(예: `KClass`)는 `kotlin-reflect`가 아닌 Kotlin 표준 라이브러리의 일부이므로 이 변경의 영향을 받지 않습니다.

## JavaScript 백엔드 {id="javascript-backend"}

### 통합 표준 라이브러리 {id="unified-standard-library"}

이제 JavaScript로 컴파일된 코드에서도 Kotlin 표준 라이브러리의 훨씬 더 많은 부분을 사용할 수 있습니다.
특히 컬렉션(`ArrayList`, `HashMap` 등), 예외(`IllegalArgumentException` 등) 및 기타 몇 가지 클래스(`StringBuilder`, `Comparator`)와 같은 핵심 클래스들이 이제 `kotlin` 패키지 아래에 정의됩니다. JVM에서 이 이름들은 해당 JDK 클래스의 타입 별칭이며, JS에서는 Kotlin 표준 라이브러리에 클래스로 구현되어 있습니다.

### 더 개선된 코드 생성 {id="better-code-generation"}

JavaScript 백엔드는 이제 정적 검사가 더 용이한 코드를 생성하므로 minifier, optimizer, linter 등과 같은 JS 코드 처리 도구와 더 잘 호환됩니다.

### external 제어자 {id="the-external-modifier"}

JavaScript로 구현된 클래스에 Kotlin에서 타입 안전한 방식으로 접근해야 하는 경우, `external` 제어자를 사용하여 Kotlin 선언을 작성할 수 있습니다. (Kotlin 1.0에서는 `@native` 어노테이션이 대신 사용되었습니다.)
JVM 타깃과 달리 JS 타깃은 클래스 및 프로퍼티에 external 제어자를 사용하는 것을 허용합니다.
예를 들어 DOM `Node` 클래스를 다음과 같이 선언할 수 있습니다.

```kotlin
external class Node {
    val firstChild: Node

    fun appendChild(child: Node): Node

    fun removeChild(child: Node): Node

    // 등등
}
```

### 개선된 import 처리 {id="improved-import-handling"}

이제 JavaScript 모듈에서 import해야 하는 선언을 더 정확하게 기술할 수 있습니다.
외부 선언에 `@JsModule("<module-name>")` 어노테이션을 추가하면 컴파일 중에 모듈 시스템(CommonJS 또는 AMD)으로 올바르게 import됩니다. 예를 들어 CommonJS의 경우 해당 선언은 `require(...)` 함수를 통해 import됩니다.
또한 선언을 모듈 또는 전역 JavaScript 객체로 import하려는 경우 `@JsNonModule` 어노테이션을 사용할 수 있습니다.

예를 들어 JQuery를 Kotlin 모듈로 import하는 방법은 다음과 같습니다.

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

이 경우 JQuery는 `jquery`라는 이름의 모듈로 import됩니다. 또는 Kotlin 컴파일러가 사용하도록 구성된 모듈 시스템에 따라 `$` 객체로 사용될 수도 있습니다.

애플리케이션에서 이러한 선언을 다음과 같이 사용할 수 있습니다.

```kotlin
fun main(args: Array<String>) {
    jquery(".toggle-button").click {
        jquery(".toggle-panel").toggle(300)
    }
}
```