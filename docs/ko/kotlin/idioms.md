[//]: # (title: 관용구 (Idioms))

Kotlin에서 무작위로 선별되고 자주 사용되는 관용구 모음입니다. 선호하는 관용구가 있다면 풀 리퀘스트(Pull request)를 보내 기여해 주세요.

## DTO(POJO/POCO) 생성 {id="create-dtos-pojos-pocos"}

```kotlin
data class Customer(val name: String, val email: String)
```

위 코드는 다음과 같은 기능을 가진 `Customer` 클래스를 제공합니다.

* 모든 프로퍼티에 대한 게터(getter) (`var`의 경우 세터(setter) 포함)
* `equals()`
* `hashCode()`
* `toString()`
* `copy()`
* 모든 프로퍼티에 대한 `component1()`, `component2()`, ... ([데이터 클래스](data-classes.md) 참조)

## 함수 매개변수의 기본값 {id="default-values-for-function-parameters"}

```kotlin
fun foo(a: Int = 0, b: String = "") { ... }
```

## 리스트 필터링 {id="filter-a-list"}

```kotlin
val positives = list.filter { x -> x > 0 }
```

또는 더 짧게 작성할 수도 있습니다.

```kotlin
val positives = list.filter { it > 0 }
```

[Java와 Kotlin의 필터링 차이점](java-to-kotlin-collections-guide.md#filter-elements)에 대해 알아보세요.

## 컬렉션 내 요소 존재 여부 확인 {id="check-the-presence-of-an-element-in-a-collection"}

```kotlin
if ("john@example.com" in emailsList) { ... }

if ("jane@example.com" !in emailsList) { ... }
```

## 문자열 보간법 (String interpolation) {id="string-interpolation"}

```kotlin
println("Name $name")
```

[Java와 Kotlin의 문자열 연결 차이점](java-to-kotlin-idioms-strings.md#concatenate-strings)에 대해 알아보세요.

## 안전하게 표준 입력 읽기 {id="read-standard-input-safely"}

```kotlin
// 문자열을 읽고, 정수로 변환할 수 없으면 null을 반환합니다. 예: Hi there!
val wrongInt = readln().toIntOrNull()
println(wrongInt)
// null

// 정수로 변환할 수 있는 문자열을 읽어 정수를 반환합니다. 예: 13
val correctInt = readln().toIntOrNull()
println(correctInt)
// 13
```

자세한 내용은 [표준 입력 읽기](read-standard-input.md)를 참조하세요.

## 인스턴스 검사 {id="instance-checks"}

```kotlin
when (x) {
    is Foo -> ...
    is Bar -> ...
    else   -> ...
}
```

## 읽기 전용 리스트 {id="read-only-list"}

```kotlin
val list = listOf("a", "b", "c")
```
## 읽기 전용 맵 {id="read-only-map"}

```kotlin
val map = mapOf("a" to 1, "b" to 2, "c" to 3)
```

## 맵 엔트리 접근 {id="access-a-map-entry"}

```kotlin
println(map["key"])
map["key"] = value
```

## 맵 또는 쌍(Pair) 리스트 순회 {id="traverse-a-map-or-a-list-of-pairs"}

```kotlin
for ((k, v) in map) {
    println("$k -> $v")
}
```

`k`와 `v`는 `name`, `age`와 같이 사용하기 편한 어떤 이름이든 될 수 있습니다.

## 범위 반복 {id="iterate-over-a-range"}

```kotlin
for (i in 1..100) { ... }  // 100 포함
for (i in 1..<100) { ... } // 100 제외
for (x in 2..10 step 2) { ... }
for (x in 10 downTo 1) { ... }
(1..10).forEach { ... }
```

## 지연 프로퍼티 (Lazy property) {id="lazy-property"}

```kotlin
val p: String by lazy { // 최초 접근 시에만 값이 계산됨
    // 문자열 계산
}
```

## 확장 함수 {id="extension-functions"}

```kotlin
fun String.spaceToCamelCase() { ... }

"Convert this to camelcase".spaceToCamelCase()
```

## 싱글톤 생성 {id="create-a-singleton"}

```kotlin
object Resource {
    val name = "Name"
}
```

## 타입 안전한 값을 위한 인라인 값 클래스 사용 {id="use-inline-value-classes-for-type-safe-values"}

```kotlin
@JvmInline
value class EmployeeId(private val id: String)

@JvmInline
value class CustomerId(private val id: String)
```

실수로 `EmployeeId`와 `CustomerId`를 혼용하면 컴파일 오류가 발생합니다.

> `@JvmInline` 어노테이션은 JVM 백엔드에만 필요합니다.
>
{style="note"}

## 추상 클래스 인스턴스화 {id="instantiate-an-abstract-class"}

```kotlin
abstract class MyAbstractClass {
    abstract fun doSomething()
    abstract fun sleep()
}

fun main() {
    val myObject = object : MyAbstractClass() {
        override fun doSomething() {
            // ...
        }

        override fun sleep() { // ...
        }
    }
    myObject.doSomething()
}
```

## If-not-null 축약 표현 {id="if-not-null-shorthand"}

```kotlin
val files = File("Test").listFiles()

println(files?.size) // files가 null이 아니면 size가 출력됨
```

## If-not-null-else 축약 표현 {id="if-not-null-else-shorthand"}

```kotlin
val files = File("Test").listFiles()

// 간단한 대체(fallback) 값의 경우:
println(files?.size ?: "empty") // files가 null이면 "empty"를 출력함

// 코드 블록에서 더 복잡한 대체 값을 계산하려면 `run`을 사용합니다.
val filesSize = files?.size ?: run { 
    val someSize = getSomeSize()
    someSize * 2
}
println(filesSize)
```

## null일 때 표현식 실행 {id="execute-an-expression-if-null"}

```kotlin
val values = ...
val email = values["email"] ?: throw IllegalStateException("Email is missing!")
```

## 비어 있을 수 있는 컬렉션의 첫 번째 항목 가져오기 {id="get-first-item-of-a-possibly-empty-collection"}

```kotlin
val emails = ... // 비어 있을 수 있음
val mainEmail = emails.firstOrNull() ?: ""
```

[Java와 Kotlin의 첫 번째 항목 가져오기 차이점](java-to-kotlin-collections-guide.md#get-the-first-and-the-last-items-of-a-possibly-empty-collection)에 대해 알아보세요.

## null이 아닐 때 실행 {id="execute-if-not-null"}

```kotlin
val value = ...

value?.let {
    ... // null이 아니면 이 블록을 실행함
}
```

## null이 아닐 때 nullable 값 매핑하기 {id="map-nullable-value-if-not-null"}

```kotlin
val value = ...

val mapped = value?.let { transformValue(it) } ?: defaultValue 
// value 또는 변환 결과가 null인 경우 defaultValue가 반환됩니다.
```

## when 문에서 반환 {id="return-on-when-statement"}

```kotlin
fun transform(color: String): Int {
    return when (color) {
        "Red" -> 0
        "Green" -> 1
        "Blue" -> 2
        else -> throw IllegalArgumentException("Invalid color param value")
    }
}
```

## try-catch 표현식 {id="try-catch-expression"}

```kotlin
fun test() {
    val result = try {
        count()
    } catch (e: ArithmeticException) {
        throw IllegalStateException(e)
    }

    // result를 사용한 작업
}
```

## if 표현식 {id="if-expression"}

```kotlin
val y = if (x == 1) {
    "one"
} else if (x == 2) {
    "two"
} else {
    "other"
}
```

## Unit을 반환하는 메서드의 빌더 스타일 사용 {id="builder-style-usage-of-methods-that-return-unit"}

```kotlin
fun arrayOfMinusOnes(size: Int): IntArray {
    return IntArray(size).apply { fill(-1) }
}
```

## 단일 표현식 함수 {id="single-expression-functions"}

```kotlin
fun theAnswer() = 42
```

위 코드는 다음과 동일합니다.

```kotlin
fun theAnswer(): Int {
    return 42
}
```

이 방식은 다른 관용구와 효과적으로 결합하여 코드를 더 짧게 작성할 수 있습니다. 예를 들어, `when` 표현식과 함께 사용하는 경우:

```kotlin
fun transform(color: String): Int = when (color) {
    "Red" -> 0
    "Green" -> 1
    "Blue" -> 2
    else -> throw IllegalArgumentException("Invalid color param value")
}
```

## 객체 인스턴스에서 여러 메서드 호출하기 (with) {id="call-multiple-methods-on-an-object-instance-with"}

```kotlin
class Turtle {
    fun penDown()
    fun penUp()
    fun turn(degrees: Double)
    fun forward(pixels: Double)
}

val myTurtle = Turtle()
with(myTurtle) { // 100픽셀 정사각형 그리기
    penDown()
    for (i in 1..4) {
        forward(100.0)
        turn(90.0)
    }
    penUp()
}
```

## 객체의 프로퍼티 설정하기 (apply) {id="configure-properties-of-an-object-apply"}

```kotlin
val myRectangle = Rectangle().apply {
    length = 4
    breadth = 5
    color = 0xFAFAFA
}
```

객체 생성자에 없는 프로퍼티를 설정할 때 유용합니다.

## Java 7의 try-with-resources {id="java-7-s-try-with-resources"}

```kotlin
val stream = Files.newInputStream(Paths.get("/some/file.txt"))
stream.buffered().reader().use { reader ->
    println(reader.readText())
}
```

## 제네릭 타입 정보가 필요한 제네릭 함수 {id="generic-function-that-requires-the-generic-type-information"}

```kotlin
//  public final class Gson {
//     ...
//     public <T> T fromJson(JsonElement json, Class<T> classOfT) throws JsonSyntaxException {
//     ...

inline fun <reified T: Any> Gson.fromJson(json: JsonElement): T = this.fromJson(json, T::class.java)
```

## 두 변수 교환하기 {id="swap-two-variables"}

```kotlin
var a = 1
var b = 2
a = b.also { b = a }
```

## 미완성 코드로 표시하기 (TODO) {id="mark-code-as-incomplete-todo"}
 
Kotlin 표준 라이브러리에는 항상 `NotImplementedError`를 발생시키는 `TODO()` 함수가 있습니다.
이 함수의 반환 타입은 `Nothing`이므로 예상되는 타입에 관계없이 사용할 수 있습니다.
이유를 매개변수로 받는 오버로드도 제공됩니다.

```kotlin
fun calcTaxes(): BigDecimal = TODO("Waiting for feedback from accounting")
```

IntelliJ IDEA의 Kotlin 플러그인은 `TODO()`의 의미를 인식하여 TODO 도구 창에 코드 포인터를 자동으로 추가합니다. 

## 다음 단계 {id="what-s-next"}

* 관용적인 Kotlin 스타일을 사용하여 [Advent of Code 퍼즐 풀기](advent-of-code.md).
* [Java와 Kotlin에서 문자열을 사용한 일반적인 작업 수행 방법](java-to-kotlin-idioms-strings.md) 알아보기.
* [Java와 Kotlin에서 컬렉션을 사용한 일반적인 작업 수행 방법](java-to-kotlin-collections-guide.md) 알아보기.
* [Java와 Kotlin에서 널 가능성(Nullability) 처리 방법](java-to-kotlin-nullability-guide.md) 알아보기.