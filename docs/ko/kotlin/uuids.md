[//]: # (title: UUID)
<web-summary>생성, 파싱, 서식 지정, 직렬화, 멀티플랫폼 및 JVM 코드 전반에서의 UUID 값 활용을 포함하여 Kotlin에서 UUID를 사용하는 방법을 알아봅니다.</web-summary>

[`Uuid`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.uuid/-uuid/) 클래스는 GUID(Globally Unique Identifier)로도 알려진 UUID(Universally Unique Identifier, 범용 고유 식별자)를 나타냅니다.

`Uuid`는 ID를 할당하는 중앙 시스템에 의존하지 않고 엔터티를 고유하게 식별하는 데 사용되는 128비트 값입니다. 따라서 UUID는 분산 애플리케이션, 데이터베이스, 클라이언트에서 생성하는 레코드 또는 [Kotlin Multiplatform](https://kotlinlang.org/docs/multiplatform/get-started.html) 애플리케이션에서 유용하게 사용됩니다.

UUID 값을 다루려면 `Uuid` 클래스를 사용하세요. 일반 문자열과 달리, 전용 UUID 타입을 사용하면 코드가 더욱 명확해지고 유효하지 않은 값이 실수로 사용되는 것을 방지할 수 있습니다.

프로젝트에서 UUID를 사용하려면 `kotlin.uuid` 패키지에서 `Uuid` 클래스를 임포트하세요.

```kotlin
import kotlin.uuid.Uuid
```

## UUID 생성하기 {id="generate-uuids"}

사용자 또는 데이터베이스 ID와 같은 일반 식별자를 위한 랜덤 버전 4 UUID를 생성하려면 [`Uuid.random()`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.uuid/-uuid/-companion/random.html) 함수를 사용하세요.

```kotlin
import kotlin.uuid.Uuid

fun main() {
//sampleStart    
    val id = Uuid.random()
    println(id)
//sampleEnd    
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="2.0"}

다음 [실험적(Experimental)](components-stability.md#stability-levels-explained) 함수들을 사용하여 특정 버전의 UUID를 생성할 수도 있습니다.

* [`Uuid.generateV4()`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.uuid/-uuid/-companion/generate-v4.html) 함수는 `Uuid.random()` 함수와 동일한 유형의 UUID를 생성하지만, 해당 값이 버전 4 UUID임을 명시적으로 나타냅니다.
* [`Uuid.generateV7()`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.uuid/-uuid/-companion/generate-v7.html) 함수는 UUID 정렬에 사용할 수 있는 타임스탬프가 포함된 버전 7 UUID를 생성합니다.
* [`Uuid.generateV7NonMonotonicAt()`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.uuid/-uuid/-companion/generate-v7-non-monotonic-at.html) 함수는 특정 시점에 대한 버전 7 UUID를 생성합니다.

이러한 UUID 생성 함수는 실험적(Experimental) 기능입니다.
사용하려면 `@OptIn(ExperimentalUuidApi::class)` 어노테이션을 사용하거나 빌드 파일에 다음 컴파일러 옵션을 추가하세요.

<tabs group="build-system">
<tab title="Gradle" group-key="gradle">

```kotlin
kotlin {
    compilerOptions {
        freeCompilerArgs.add("-opt-in=kotlin.uuid.ExperimentalUuidApi")
    }
}
```

</tab>
<tab title="Maven" group-key="maven">

```xml
<build>
    <plugins>
        <plugin>
            <groupId>org.jetbrains.kotlin</groupId>
            <artifactId>kotlin-maven-plugin</artifactId>
            <configuration>
                <args>
                    <arg>-opt-in=kotlin.uuid.ExperimentalUuidApi</arg>
                </args>
            </configuration>
        </plugin>
    </plugins>
</build>
```

</tab>
</tabs>

다음은 특정 버전의 UUID를 생성하는 예제입니다.

```kotlin
import kotlin.time.Instant
import kotlin.time.ExperimentalTime
import kotlin.uuid.Uuid

@OptIn(kotlin.uuid.ExperimentalUuidApi::class, ExperimentalTime::class)
fun main() {
    // 버전 4 UUID를 생성합니다
    val idVersion4 = Uuid.generateV4()
    println(idVersion4)

    // 버전 7 UUID를 생성합니다
    val idVersion7 = Uuid.generateV7()
    println(idVersion7)

    // 지정된 타임스탬프에 대한 버전 7 UUID를 생성합니다
    val timestamp = Instant.fromEpochMilliseconds(1757440583000L)
    val idVersion7SpecificTime = Uuid.generateV7NonMonotonicAt(timestamp)
    println(idVersion7SpecificTime)
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="2.3"}

## UUID 파싱하기 {id="parse-uuids"}

UUID 값은 URL 매개변수나 데이터베이스 레코드 등에서 종종 문자열로 표현됩니다.

`String` 값을 `Uuid` 값으로 변환하려면 [`Uuid.parse()`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.uuid/-uuid/-companion/parse.html) 함수를 사용하세요.

```kotlin
import kotlin.uuid.Uuid

fun main() {
//sampleStart
    val id = Uuid.parse("de2bc56c-ea73-4f3c-8a37-5a46fdb2d79a")
    println(id)
//sampleEnd    
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="2.0"}

`Uuid.parse()` 함수는 표준 16진수 및 대시(hex-and-dash) 형식과 대시가 없는 16진수 형식을 모두 지원합니다.

입력값이 유효하지 않으면 `Uuid.parse()` 함수는 `IllegalArgumentException`을 발생시킵니다.

```kotlin
import kotlin.uuid.Uuid

fun main() { 
//sampleStart    
    val id = Uuid.parse("10")
    println(id)
//sampleEnd    
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="2.0"}

애플리케이션에서 한 가지 표현 형식만 허용해야 하는 경우, 형식 전용 함수를 사용하세요.

* [`Uuid.parseHexDash()`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.uuid/-uuid/-companion/parse-hex-dash.html): 16진수 및 대시로 이루어진 문자열 표현용
* [`Uuid.parseHex()`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.uuid/-uuid/-companion/parse-hex.html): 대시가 없는 16진수 문자열 표현용

예시:

```kotlin
import kotlin.uuid.Uuid

fun main() {
//sampleStart  
    val standard = Uuid.parseHexDash("de2bc56c-ea73-4f3c-8a37-5a46fdb2d79a")
    val compact = Uuid.parseHex("de2bc56cea734f3c8a375a46fdb2d79a")
    
    println(standard)
    println(compact)
//sampleEnd    
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="2.3"}

외부 소스로부터 UUID를 전달받아 유효하지 않은 입력을 안전하게 처리해야 한다면 [`Uuid.parseOrNull()`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.uuid/-uuid/-companion/parse-or-null.html), [`Uuid.parseHexDashOrNull()`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.uuid/-uuid/-companion/parse-hex-dash-or-null.html) 또는 [`Uuid.parseHexOrNull()`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.uuid/-uuid/-companion/parse-hex-or-null.html)을 사용하세요.
이 함수들은 입력값이 유효하지 않을 때 `null`을 반환합니다.

```kotlin
fun parseId(input: String): Uuid? { 
    return Uuid.parseOrNull(input) 
}
```

## UUID를 문자열로 변환하기 {id="convert-uuids-to-strings"}

다음 함수들을 사용하여 `Uuid` 값을 `String` 값으로 변환할 수 있습니다.

* [`toString()`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.uuid/-uuid/to-string.html): 표준 문자열 표현용
* [`toHexDashString()`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.uuid/-uuid/to-hex-dash-string.html): 16진수 및 대시(hex-and-dash) 형식용
* [`toHexString()`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.uuid/-uuid/to-hex-string.html): 대시가 없는 16진수 형식용

예시:

```kotlin
import kotlin.uuid.Uuid

fun main() {
//sampleStart    
    val id = Uuid.parse("de2bc56c-ea73-4f3c-8a37-5a46fdb2d79a")
    
    println(id.toString())
    // de2bc56c-ea73-4f3c-8a37-5a46fdb2d79a
    println(id.toHexDashString())
    // de2bc56c-ea73-4f3c-8a37-5a46fdb2d79a
    println(id.toHexString())
    // de2bc56cea734f3c8a375a46fdb2d79a 
//sampleEnd    
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="2.3"}

## UUID 비교하기 {id="compare-uuids"}

`==` 연산자를 사용하여 `Uuid` 값이 같은지 비교할 수 있습니다.

Kotlin은 텍스트 표현이 아닌 UUID 값 자체를 기준으로 비교합니다.
예를 들어, 서로 다른 형식으로 표현된 두 값이라도 동일한 128비트 값을 나타낸다면 서로 같습니다.

```kotlin
import kotlin.uuid.Uuid

fun main() {
//sampleStart    
    val first = Uuid.parse("de2bc56c-ea73-4f3c-8a37-5a46fdb2d79a")
    val second = Uuid.parse("de2bc56cea734f3c8a375a46fdb2d79a")

    println(first == second) 
    // true 
//sampleEnd    
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="2.3"}

이러한 특성 덕분에 서로 다른 형식의 동일한 값을 다른 값으로 취급하는 문자열 비교보다 `Uuid` 비교가 훨씬 더 신뢰할 수 있습니다.
`Uuid` 비교는 실제 식별자 값을 검사합니다.

`Uuid`는 `Comparable<Uuid>` 인터페이스를 구현하므로, `sorted()`와 같은 표준 컬렉션 함수로 UUID 값을 정렬할 수 있습니다. 이 경우 Kotlin은 사전순(lexicographically, 최상위 비트에서 최하위 비트 순)으로 값을 비교합니다.

```kotlin
import kotlin.uuid.Uuid

fun main() {
//sampleStart    
    val first = Uuid.generateV7()
    val second = Uuid.generateV7()

    val sorted = listOf(first, second).sorted()
    println(sorted) 
//sampleEnd    
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="2.3"}

## 바이너리 표현 다루기 {id="work-with-binary-representations"}

일부 API, 스토리지 포맷 및 바이너리 프로토콜은 UUID를 문자열로 표현하지 않습니다.
대신 다음과 같은 형태로 128비트 UUID 값을 저장합니다.

* 16바이트 배열
* 두 개의 64비트 값

바이너리 UUID 데이터를 요구하는 시스템과 UUID를 주고받아야 할 때 이러한 표현을 사용하세요.

UUID와 16바이트 표현 간에 상호 변환하려면 [`.toByteArray()`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.uuid/-uuid/to-byte-array.html) 및 [`Uuid.fromByteArray()`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.uuid/-uuid/-companion/from-byte-array.html) 함수를 사용하세요.

```kotlin
import kotlin.uuid.Uuid

fun main() {
//sampleStart 
    val id = Uuid.random()

    val bytes = id.toByteArray()
    val original = Uuid.fromByteArray(bytes)
  
    println(id)
    
    println(bytes)
    println(original)

    println(id == original) 
    // true
//sampleEnd  
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="2.0"}

동일한 128비트 UUID 값을 두 개의 `Long` 값으로 표현할 수도 있습니다.
Kotlin은 내장 128비트 정수 타입을 제공하지 않으므로 이 방식이 유용합니다.
두 `Long` 값은 UUID를 두 부분으로 나누어 저장합니다.

* `mostSignificantBits` 매개변수: UUID의 첫 64비트
* `leastSignificantBits` 매개변수: UUID의 마지막 64비트

두 개의 `Long` 값으로 `Uuid` 값을 생성하려면 [`Uuid.fromLongs()`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.uuid/-uuid/-companion/from-longs.html) 함수를 사용하세요.

```kotlin
import kotlin.uuid.Uuid

fun main() {
//sampleStart 
    val id = Uuid.fromLongs(
        mostSignificantBits = -4653685776373167443,
        leastSignificantBits = -6288180676521310383.toLong()
    )
    println(id) 
    // bf6ac971-52fd-4aad-a8bb-e4fdac78c751
//sampleEnd  
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="2.0"}

기존 `Uuid` 값에서 두 부분을 추출하려면 [`Uuid.toLongs()`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.uuid/-uuid/to-longs.html) 함수를 사용하세요.

```kotlin
import kotlin.uuid.Uuid

fun main() {
//sampleStart 
    val id = Uuid.random()
    
    id.toLongs { mostSignificantBits, leastSignificantBits ->
        println(mostSignificantBits)
        println(leastSignificantBits)
    }
//sampleEnd  
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="2.0"}

## UUID 직렬화하기 {id="serialize-uuids"}

Kotlin은 `Uuid` 값에 대한 직렬화를 지원합니다.
JSON API나 설정 파일 등 Kotlin 코드 외부로 UUID 값을 저장하거나 전송할 때 이를 활용할 수 있습니다.

애플리케이션에서 다른 형식을 요구하지 않는 한, `Uuid` 값을 직렬화할 때는 문자열로 표현합니다.
[`kotlinx.serialization`](https://kotlinlang.org/docs/serialization.html) 라이브러리는 16진수 및 대시(hex-and-dash) 형식을 사용합니다.

```kotlin
//sampleStart 
import kotlin.uuid.Uuid
import kotlinx.serialization.Serializable
import kotlinx.serialization.encodeToString
import kotlinx.serialization.json.Json

@Serializable
data class User(
    val id: Uuid,
    val name: String
)

fun main() {
    val user = User(
        id = Uuid.parse("de2bc56cea734f3c8a375a46fdb2d79a"),
        name = "Kotlin"
    )

    println(Json.encodeToString(user))
    // {"id":"de2bc56c-ea73-4f3c-8a37-5a46fdb2d79a","name":"Kotlin"}
}
//sampleEnd
```
{kotlin-runnable="true" kotlin-min-compiler-version="2.3"}

## Java API와 함께 UUID 사용하기 {id="use-uuids-with-java-apis"}

Java는 UUID를 표현하기 위해 `java.util.UUID` 클래스를 사용합니다. JVM에서 Java API는 이 타입을 받거나 반환할 수 있습니다. `java.util.UUID`와 `kotlin.uuid.Uuid`는 둘 다 UUID를 나타내지만, 서로 다른 두 개의 타입입니다.

Kotlin과 Java 간에 UUID를 전달하려면 값을 명시적으로 변환하세요.

* [`.toKotlinUuid()`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.uuid/to-kotlin-uuid.html) 확장 함수를 사용하여 Java UUID를 Kotlin UUID로 변환합니다.

  ```kotlin
  import kotlin.uuid.toKotlinUuid
  
  val kotlinId: Uuid = javaId.toKotlinUuid()
  ```

* [`.toJavaUuid()`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.uuid/to-java-uuid.html) 확장 함수를 사용하여 Kotlin UUID를 Java UUID로 변환합니다.

  ```kotlin
  import kotlin.uuid.toJavaUuid
  
  val javaId: java.util.UUID = kotlinId.toJavaUuid()
  ```

이러한 함수를 사용하면 JVM 상호 운용성(interoperability) 경계에서 UUID 값을 `Uuid`로 표현할 수 있습니다.

> `java.util.UUID`와 `kotlin.uuid.Uuid` 클래스는 비교 가능(comparable)하지만 정렬 순서가 다를 수 있습니다.
> Java API에서 Kotlin API로 마이그레이션하기 전에 UUID 정렬 순서에 의존하는 코드가 있는지 반드시 확인하세요.
>
{style="note"}

Kotlin은 Java 버퍼를 다루는 기능도 지원합니다.
`ByteBuffer`에서 UUID를 다루려면 JVM 전용 함수를 사용하세요.

* [`.getUuid()`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.uuid/get-uuid.html) 함수를 사용하여 버퍼에서 UUID를 읽습니다.
* [`.putUuid()`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.uuid/put-uuid.html) 함수를 사용하여 버퍼에 UUID를 씁니다.