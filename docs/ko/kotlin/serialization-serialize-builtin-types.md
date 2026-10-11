[//]: # (title: 기본 제공 타입 직렬화)

Kotlin 직렬화는 원시 타입(primitive) 및 문자열과 같은 기본 타입을 비롯하여 특정 표준 라이브러리 클래스를 포함한 다양한 기본 제공(built-in) 타입을 지원합니다.
다음 섹션에서는 이러한 타입들을 자세히 설명하고 직렬화하는 방법을 보여줍니다.

## 기본 타입 {id="basic-types"}

Kotlin 직렬화는 직렬화된 데이터에서 단일 값으로 표현되는 타입들을 위한 내장 시리얼라이저(serializer)를 제공합니다.
여기에는 원시 타입, 문자열, enum 등이 포함됩니다.

예를 들어, `Long` 타입을 직렬화하는 방법은 다음과 같습니다.

```kotlin
// 필요한 라이브러리 선언을 임포트합니다
import kotlinx.serialization.*
import kotlinx.serialization.json.*

//sampleStart
@Serializable
class Data(val signature: Long)

fun main() {
    val data = Data(0x1CAFE2FEED0BABE0)
    println(Json.encodeToString(data))
    // {"signature":2067120338512882656}
}
//sampleEnd
```
{kotlin-runnable="true" id="serialize-long-class"}

### 숫자 {id="numbers"}

정수 및 부동 소수점 숫자를 포함한 모든 Kotlin 숫자 타입을 자연스러운 JSON 표현 방식으로 직렬화할 수 있습니다.

```kotlin
import kotlinx.serialization.*
import kotlinx.serialization.json.*
import kotlin.math.PI

//sampleStart
@Serializable
class Data(
    val answer: Int,
    val pi: Double
)                     

fun main() {
    val data = Data(42, PI)
    println(Json.encodeToString(data))
    // {"answer":42,"pi":3.141592653589793}
}
//sampleEnd
```
{kotlin-runnable="true" id="serialize-numbers"}

### 부호 없는 숫자 {id="unsigned-numbers"}

Kotlin 직렬화는 `UByte`, `UInt`와 같은 Kotlin의 [부호 없는 정수 타입](unsigned-integer-types.md)을 지원합니다.
JSON에서 이러한 값은 일반적인 JSON 숫자로 직렬화되며 부호 없는 전체 범위를 그대로 유지합니다.

```kotlin
import kotlinx.serialization.*
import kotlinx.serialization.json.*

//sampleStart
@Serializable
class Counter(val counted: UByte, val description: String)

fun main() {
    val counted = 239.toUByte()
    println(Json.encodeToString(Counter(counted, "tries")))
    // {"counted":239,"description":"tries"}
}
//sampleEnd
```
{kotlin-runnable="true" id="serialize-unsigned-numbers"}

> JSON은 부호 없는 숫자의 전체 범위를 보존하지만, 다른 직렬화 형식은 이를 다르게 처리할 수 있습니다.
> 예를 들어, ProtoBuf 및 CBOR은 이러한 타입을 부호 있는 대응 타입으로 직렬화합니다.
>
{style="note"} 

### 문자열 형태의 `Long` 숫자 {id="long-numbers-as-strings"}

JSON에서 `Long` 숫자를 문자열로 표현할 수 있습니다.
이는 JavaScript 환경에서 유용한데, JavaScript의 `Number` 타입은 모든 Kotlin `Long` 값을 정확하게 표현할 수 없어 정밀도 손실(precision loss)이 발생할 수 있기 때문입니다.

`@Serializable` 어노테이션과 함께 [`LongAsStringSerializer`](https://kotlinlang.org/api/kotlinx.serialization/kotlinx-serialization-core/kotlinx.serialization.builtins/-long-as-string-serializer/)를 사용하여 JSON에서 `Long` 값을 문자열로 인코딩할 수 있습니다.

```kotlin
import kotlinx.serialization.*
import kotlinx.serialization.builtins.*
import kotlinx.serialization.json.*

//sampleStart
@Serializable
class Data(
    @Serializable(LongAsStringSerializer::class)
    val signature: Long
)

fun main() {
    val data = Data(0x1CAFE2FEED0BABE0)
    println(Json.encodeToString(data))
    // {"signature":"2067120338512882656"}
}
//sampleEnd
```
{kotlin-runnable="true" id="serialize-long-as-string"}

> 파일 내의 모든 프로퍼티에 대해 `LongAsStringSerializer`와 같은 시리얼라이저를 지정할 수도 있습니다.
> 자세한 내용은 [파일에 대한 시리얼라이저 지정](serialization-create-and-use-serializers.md#specify-a-serializer-for-a-file)을 참조하세요.
>
{style="tip"}

### Enum 클래스 {id="enum-classes"}

모든 `enum` 클래스는 기본적으로 `@Serializable` 어노테이션 없이도 직렬화할 수 있습니다.
JSON으로 직렬화될 때 `enum`은 문자열로 인코딩됩니다.

```kotlin
import kotlinx.serialization.*
import kotlinx.serialization.json.*

//sampleStart
// enum 클래스에는 @Serializable 어노테이션이 필요하지 않습니다
enum class Status { SUPPORTED }

@Serializable
class Project(val name: String, val status: Status) 

fun main() {
    val data = Project("kotlinx.serialization", Status.SUPPORTED)
    println(Json.encodeToString(data))
    // {"name":"kotlinx.serialization","status":"SUPPORTED"}
}
//sampleEnd
```
{kotlin-runnable="true" id="serialize-enum"}

> Kotlin/JS 또는 Kotlin/Native를 타겟으로 할 때, `encodeToString<Status>(Status.SUPPORTED)`와 같이 `enum` 클래스를 루트 객체로 사용하려면 `@Serializable` 어노테이션을 사용해야 합니다.
>
{style="note"}

#### enum 항목의 직렬화 이름 커스터마이징 {id="customize-serial-names-of-enum-entries"}

enum 항목의 직렬화 이름을 커스터마이징하려면 `@SerialName` 어노테이션을 사용하고 enum 클래스에 `@Serializable`을 지정합니다.

```kotlin
import kotlinx.serialization.*
import kotlinx.serialization.json.*

//sampleStart
// @SerialName을 사용하므로 @Serializable 어노테이션이 필요합니다
@Serializable
enum class Status { @SerialName("maintained") SUPPORTED }

@Serializable
class Project(val name: String, val status: Status) 

fun main() {
    val data = Project("kotlinx.serialization", Status.SUPPORTED)
    println(Json.encodeToString(data))
    // {"name":"kotlinx.serialization","status":"maintained"}
}
//sampleEnd
```
{kotlin-runnable="true" id="serialize-enum-serialname"}

직렬화 이름 커스터마이징에 대한 자세한 내용은 [직렬화 이름 커스터마이징](serialization-customization-options.md#customize-serial-names)을 참조하세요.

## 표준 라이브러리 타입 {id="standard-library-types"}

Kotlin 직렬화는 표준 라이브러리의 여러 타입을 지원하지만, 범위(range)나 [`Regex`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.text/-regex/) 클래스와 같은 일부 클래스는 지원되지 않습니다.

### Pair 및 Triple {id="pair-and-triple"}

Kotlin 표준 라이브러리의 [`Pair`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin/-pair/) 및 [`Triple`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin/-triple/) 클래스를 직렬화할 수 있습니다.

```kotlin
import kotlinx.serialization.*
import kotlinx.serialization.json.*

//sampleStart
@Serializable
class Project(val name: String)

fun main() {
    val pair = 1 to Project("kotlinx.serialization")
    println(Json.encodeToString(pair))
    // {"first":1,"second":{"name":"kotlinx.serialization"}}
}
//sampleEnd
```
{kotlin-runnable="true" id="serialize-pair"}

### 컬렉션 {id="collections"}

Kotlin 직렬화는 [`List`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/-list/), [`Set`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/-set/), [`Map`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/-map/)의 읽기 전용 및 가변(mutable) 변형을 포함한 컬렉션 타입을 지원합니다.
또한 [`ArrayList`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.collections/-array-list/) 및 [`LinkedHashSet`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.collections/-linked-hash-set/)과 같은 구체적인 구현체와 제네릭 및 원시 배열 타입도 지원합니다.
이러한 컬렉션이 표현되는 방식은 직렬화 형식에 따라 다릅니다.

JSON에서 리스트와 세트는 JSON 배열로 직렬화되고, 맵은 JSON 객체로 표현됩니다.

Kotlin은 JSON을 역직렬화할 때 선언된 타입을 사용합니다.
역직렬화하는 동안 결과 객체의 타입은 소스 코드에 지정된 정적 타입에 의해 결정됩니다.
이 타입은 프로퍼티의 타입이거나 디코딩 함수의 타입 파라미터일 수 있습니다.

#### 리스트 직렬화 {id="serialize-lists"}

Kotlin 직렬화는 [`List`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/-list/) 타입을 JSON 배열로 직렬화합니다.
다음은 클래스 리스트를 사용한 예제입니다.

```kotlin
import kotlinx.serialization.*
import kotlinx.serialization.json.*

//sampleStart
@Serializable
class Project(val name: String)

fun main() {
    val list = listOf(
        Project("kotlinx.serialization"),
        Project("kotlinx.coroutines")    
    )
    println(Json.encodeToString(list))
    // [{"name":"kotlinx.serialization"},{"name":"kotlinx.coroutines"}]
}
//sampleEnd
```
{kotlin-runnable="true" id="serialize-list"}

#### 세트 직렬화 {id="serialize-sets"}

[`Set`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/-set/) 타입은 [`List` 타입](#리스트-직렬화)과 마찬가지로 JSON 배열로 직렬화됩니다.

```kotlin
import kotlinx.serialization.*
import kotlinx.serialization.json.*

//sampleStart
@Serializable
class Project(val name: String)

fun main() {
    val set = setOf(
        Project("kotlinx.serialization"),
        Project("kotlinx.coroutines")    
    )
    println(Json.encodeToString(set))
    // [{"name":"kotlinx.serialization"},{"name":"kotlinx.coroutines"}]
}
//sampleEnd
```
{kotlin-runnable="true" id="serialize-set"}

> 기본적으로 중복 항목이 있는 세트를 역직렬화할 수 있습니다. 중복을 처리하는 동작은 구현에 따라 정의됩니다.
> 
{style="tip"}

#### 맵 직렬화 {id="serialize-maps"}

Kotlin 직렬화는 원시 타입 또는 enum 키를 사용하는 [`Map`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/-map/) 타입을 지원합니다.

```kotlin
import kotlinx.serialization.*
import kotlinx.serialization.json.*

//sampleStart
@Serializable
class Project(val name: String)

fun main() {
    // Int 키를 가진 맵을 생성합니다
    val map = mapOf(
        1 to Project("kotlinx.serialization"),
        2 to Project("kotlinx.coroutines")    
    )
    println(Json.encodeToString(map))
    // {"1":{"name":"kotlinx.serialization"},"2":{"name":"kotlinx.coroutines"}}
}
//sampleEnd
```
{kotlin-runnable="true" id="serialize-map"}

맵 직렬화는 형식에 따라 달라집니다.
JSON에서 맵은 객체로 표현됩니다. JSON 객체 키는 항상 문자열이므로, Kotlin에서 숫자인 키라 할지라도 문자열로 인코딩됩니다.
CBOR과 같은 다른 형식은 원시 타입이 아닌 키를 가진 맵을 지원하며 이를 그대로 유지합니다.

> JSON은 복합 키(complex or composite keys)를 기본적으로 지원하지 않습니다.
> 구조화된 객체를 맵 키로 인코딩하려면 [구조화된 맵 키 허용](serialization-json-configuration.md#allow-structured-map-keys)을 참조하세요.
>
{style="note"}

#### 컬렉션의 역직렬화 동작 {id="deserialization-behavior-of-collections"}

Kotlin은 JSON을 역직렬화할 때 선언된 타입을 사용합니다.
예를 들어 컬렉션의 경우, `List`는 중복을 유지하는 반면 `Set`은 고유성을 강제합니다.

```kotlin
import kotlinx.serialization.*
import kotlinx.serialization.json.*

//sampleStart
@Serializable
data class Data(
    val a: List<Int>,
    val b: Set<Int>
)

fun main() {
    val data = Json.decodeFromString<Data>("""
        {
            "a": [42, 42],
            "b": [42, 42]
        }
    """)
    // Set 타입은 고유한 요소를 강제하므로 data.b에서 중복이 제거됩니다
    println(data)
    // Data(a=[42, 42], b=[42])
}
//sampleEnd
```
{kotlin-runnable="true" id="serialize-collections"}

> Kotlin의 컬렉션에 대한 자세한 내용은 [컬렉션 개요](collections-overview.md)를 참조하세요.
>
{style="tip"}

### Unit 및 싱글톤 객체 {id="unit-and-singleton-objects"}

Kotlin의 [`Unit`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin/-unit/) 타입 및 기타 싱글톤 객체는 직렬화할 수 있습니다.
[싱글톤](object-declarations.md)은 인스턴스가 하나만 있는 클래스로, 상태가 외부 프로퍼티가 아닌 객체 자체에 의해 정의됩니다.
JSON에서 싱글톤 객체는 빈 구조로 직렬화됩니다.

```kotlin
import kotlinx.serialization.*
import kotlinx.serialization.json.*

//sampleStart
@Serializable
object SerializationVersion {
    val libraryVersion: String = "1.0.0"
}

fun main() {
    println(Json.encodeToString(SerializationVersion))
    // {}
    println(Json.encodeToString(Unit))
    // {}
}
//sampleEnd
```
{kotlin-runnable="true" id="serialize-singleton"}

> 직렬화된 싱글톤 객체를 [폐쇄된 다형성 계층 구조](serialization-polymorphism.md#serialize-closed-polymorphic-classes)에서 사용하여
> 추가 필드가 없는 경우를 나타낼 수 있습니다.
>
{style="tip"}

### Duration 및 Instant {id="duration-and-instant"}

Kotlin의 [`Duration`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.time/-duration/) 타입은 ISO-8601-2 형식을 사용하는 문자열로 직렬화됩니다.

```kotlin
import kotlinx.serialization.*
import kotlinx.serialization.json.*
import kotlin.time.*

//sampleStart
fun main() {
    val duration = 1000.toDuration(DurationUnit.SECONDS)
    println(Json.encodeToString(duration))
    // "PT16M40S"
}
//sampleEnd
```
{kotlin-runnable="true" id="serialize-duration"}

또한 특정 시점을 나타내는 Kotlin의 [`Instant`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.time/-instant/) 타입을
ISO-8601-1 형식을 사용하는 문자열로 직렬화할 수 있습니다.

```kotlin
import kotlinx.serialization.*
import kotlinx.serialization.json.*
import kotlin.time.*

//sampleStart
fun main() {
    val instant = Instant.fromEpochMilliseconds(1607505416124)
    println(Json.encodeToString(instant))
    // "2020-12-09T09:16:56.124Z"
}
//sampleEnd
```
{kotlin-runnable="true" kotlin-min-compiler-version="2.2" id="serialize-instant"}

### Nothing {id="nothing"}

[`Nothing`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin/-nothing.html) 타입은 기본적으로 직렬화할 수 있습니다.
이 타입은 인스턴스가 없으므로 인코딩하거나 디코딩하면 예외가 발생합니다.
[제네릭 기본 타입을 갖는 다형성 계층 구조](serialization-polymorphism.md#serialize-generic-subtypes-in-a-polymorphic-hierarchy)와 같이, 문법적으로 타입이 필요하지만 직렬화에는 관여하지 않는 경우에 `Nothing`을 사용하세요.

```kotlin
import kotlinx.serialization.*
import kotlinx.serialization.builtins.*
import kotlinx.serialization.json.*

//sampleStart
@Serializable
sealed class ParametrizedParent<out R> {
    @Serializable
    data class ChildWithoutParameter(val value: Int) : ParametrizedParent<Nothing>()
}

fun main() {
    println(Json.encodeToString(ParametrizedParent.ChildWithoutParameter(42)))
    // {"value":42}
}
//sampleEnd
```
{kotlin-runnable="true" id="serialize-nothing"}

## 다음 단계 {id="what-s-next"}

* [클래스 직렬화](serialization-customization-options.md)를 살펴보고 클래스를 직렬화하는 방법과 `@Serializable` 어노테이션의 기본 동작을 수정하는 방법을 알아보세요.
* 더 복잡한 JSON 직렬화 시나리오를 살펴보려면 [JSON 직렬화 개요](serialization-configure-json-serialization.md)를 참조하세요.
* [다형성 클래스 직렬화](serialization-polymorphism.md)에서 다형성과 공통 기반 타입을 통해 다양한 타입을 직렬화하는 방법에 대해 자세히 알아보세요.