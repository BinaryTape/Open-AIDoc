[//]: # (title: Json 인스턴스 커스터마이징)

기본 [`Json`](https://kotlinlang.org/api/kotlinx.serialization/kotlinx-serialization-json/kotlinx.serialization.json/-json/-default/) 인스턴스는 JSON 사양과 Kotlin 클래스의 선언을 엄격하게 따릅니다.

[`Json()`](https://kotlinlang.org/api/kotlinx.serialization/kotlinx-serialization-json/kotlinx.serialization.json/-json.html) 빌더 함수로 커스텀 `Json` 인스턴스를 생성하면 더 유연한 JSON 기능이나 타입 변환을 사용할 수 있습니다.

```kotlin
// 기본 구성을 기반으로 특수 부동소수점 값을 허용하는 Json 인스턴스를 생성합니다.
val customJson = Json {
    allowSpecialFloatingPointValues = true
}

// 문자열을 인코딩할 때 기본 인스턴스와 동일한 구문으로 customJson 인스턴스를 사용합니다.
val jsonString = customJson.encodeToString(Data(Double.NaN))
println(jsonString)
```

이러한 방식으로 생성된 `Json` 인스턴스는 불변(immutable)이며 스레드 안전(thread-safe)하므로, 재사용을 위해 최상위 프로퍼티에 안전하게 보관할 수 있습니다.

> 커스텀 `Json` 인스턴스를 재사용하면 클래스별 정보를 캐시할 수 있어 성능이 향상됩니다.
>
{style="tip"}

또한 동일한 빌더 구문을 사용하여 기존 인스턴스를 기반으로 새 `Json` 인스턴스를 만들고 설정을 수정할 수도 있습니다.

```kotlin
// 기존 Json을 기반으로 새 인스턴스를 생성합니다.
val lenientJson = Json(customJson) {
    isLenient = true
    prettyPrint = true
}
```

## JSON 구조 커스터마이징 {id="customize-json-structure"}

인코딩 및 디코딩 중에 `Json` 인스턴스가 데이터를 구조화하는 방식을 커스터마이징할 수 있습니다.
이를 통해 출력에 어떤 값이 나타날지, 특정 타입이 어떻게 표현될지 제어할 수 있습니다.

### 기본값 인코딩 {id="encode-default-values"}

기본적으로 JSON 인코더는 기본 프로퍼티 값을 생략합니다. 디코딩 시 누락된 프로퍼티에 기본값이 자동으로 적용되기 때문입니다.
이 동작은 불필요한 `null` 값을 쓰는 것을 방지하므로, null을 기본값으로 갖는 널 허용(nullable) 프로퍼티에 특히 유용합니다.
자세한 내용은 [기본 프로퍼티의 직렬화 관리](serialization-customization-options.md#manage-the-serialization-of-default-properties-with-encodedefault) 섹션을 참조하세요.

이 기본 동작을 변경하려면 `Json` 인스턴스에서 [`encodeDefaults`](https://kotlinlang.org/api/kotlinx.serialization/kotlinx-serialization-json/kotlinx.serialization.json/-json-builder/encode-defaults.html) 프로퍼티를 `true`로 설정하세요.

```kotlin
// 직렬화 라이브러리의 선언들을 임포트합니다.
import kotlinx.serialization.*
import kotlinx.serialization.json.*

//sampleStart
// 기본값을 인코딩하도록 Json 인스턴스를 구성합니다.
val format = Json { encodeDefaults = true }

@Serializable
class Project(
    val name: String,
    val language: String = "Kotlin",
    val website: String? = null
)

fun main() {
    val data = Project("kotlinx.serialization")

    // 기본값을 포함하여 모든 프로퍼티 값을 인코딩합니다.
    println(format.encodeToString(data))
    // {"name":"kotlinx.serialization","language":"Kotlin","website":null}
}
//sampleEnd
```
{kotlin-runnable="true" id="encode-default-values-example"}

### 명시적 null 생략 {id="omit-explicit-nulls"}

기본적으로 모든 `null` 값은 JSON 출력으로 인코딩됩니다.
`null` 값을 생략하려면 `Json` 인스턴스에서 [`explicitNulls`](https://kotlinlang.org/api/kotlinx.serialization/kotlinx-serialization-json/kotlinx.serialization.json/-json-builder/explicit-nulls.html) 프로퍼티를 `false`로 설정하세요.

```kotlin
// 직렬화 라이브러리의 선언들을 임포트합니다.
import kotlinx.serialization.*
import kotlinx.serialization.json.*

//sampleStart
// 직렬화 중 null 값을 생략하도록 Json 인스턴스를 구성합니다.
val format = Json { explicitNulls = false }

@Serializable
data class Project(
    val name: String,
    val language: String,
    val version: String? = "1.2.2",
    val website: String?,
    val description: String? = null
)

fun main() {
    val data = Project("kotlinx.serialization", "Kotlin", null, null, null)
    val json = format.encodeToString(data)

    // JSON 출력에서 version, website, description 프로퍼티를 생략합니다.
    println(json)
    // {"name":"kotlinx.serialization","language":"Kotlin"}

    // 기본값이 없는 누락된 널 허용 프로퍼티를 null로 처리합니다.
    // 기본값이 있는 프로퍼티는 해당 기본값으로 채웁니다.
    println(format.decodeFromString<Project>(json))
    // Project(name=kotlinx.serialization, language=Kotlin, version=1.2.2, website=null, description=null)
}
//sampleEnd
```
{kotlin-runnable="true" id="omit-nulls-example"}

`explicitNulls`를 `false`로 설정하면 인코딩과 디코딩이 비대칭적으로 동작할 수 있습니다.
이 예제에서 `version` 프로퍼티는 인코딩 전에는 `null`이었지만, 디코딩 후에는 `1.2.2`가 됩니다.

> [`coerceInputValues`](https://kotlinlang.org/api/kotlinx.serialization/kotlinx-serialization-json/kotlinx.serialization.json/-json-builder/coerce-input-values.html) 프로퍼티를 사용하여 특정 유효하지 않은 입력 값을 누락된 프로퍼티로 취급하도록 디코더를 구성할 수 있습니다.
> 자세한 내용은 [입력 값 강제 변환](#coerce-input-values) 섹션을 참조하세요.
>
{style="tip"}

### 구조화된 맵 키 허용 {id="allow-structured-map-keys"}

JSON 키는 원시 타입(primitive)이나 열거형(enum)만을 나타내는 문자열이어야 하므로, JSON 형식은 구조화된 키를 가진 맵을 기본적으로 지원하지 않습니다.
사용자 정의 클래스를 키로 사용하는 맵을 직렬화 및 역직렬화하려면 [`allowStructuredMapKeys`](https://kotlinlang.org/api/kotlinx.serialization/kotlinx-serialization-json/kotlinx.serialization.json/-json-builder/allow-structured-map-keys.html) 프로퍼티를 사용하세요.

```kotlin
// 직렬화 라이브러리의 선언들을 임포트합니다.
import kotlinx.serialization.*
import kotlinx.serialization.json.*

//sampleStart
// 구조화된 키를 가진 맵을 인코딩하도록 Json 인스턴스를 구성합니다.
val format = Json { allowStructuredMapKeys = true }

@Serializable
data class Project(val name: String)

fun main() {
    val map = mapOf(
        Project("kotlinx.serialization") to "Serialization",
        Project("kotlinx.coroutines") to "Coroutines"
    )
    // 구조화된 키를 가진 맵을 JSON 배열로 직렬화합니다:
    // [key1, value1, key2, value2,...]
    println(format.encodeToString(map))
    // [{"name":"kotlinx.serialization"},"Serialization",{"name":"kotlinx.coroutines"},"Coroutines"]
}
//sampleEnd
```
{kotlin-runnable="true" id="allow-structured-map-keys-example"}

### 특수 부동소수점 값 허용 {id="allow-special-floating-point-values"}

기본적으로 [`Double.NaN`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin/-double/-na-n.html) 및 무한대(infinities)와 같은 특수 부동소수점 값은 [JSON 사양](https://datatracker.ietf.org/doc/html/rfc8259#section-6)에서 금지하고 있으므로 JSON에서 지원되지 않습니다.

이러한 값의 인코딩과 디코딩을 활성화하려면 `Json` 인스턴스에서 [`allowSpecialFloatingPointValues`](https://kotlinlang.org/api/kotlinx.serialization/kotlinx-serialization-json/kotlinx.serialization.json/-json-builder/allow-special-floating-point-values.html) 프로퍼티를 `true`로 설정하세요.

```kotlin
// 직렬화 라이브러리의 선언들을 임포트합니다.
import kotlinx.serialization.*
import kotlinx.serialization.json.*

//sampleStart
// 특수 부동소수점 값을 허용하도록 Json 인스턴스를 구성합니다.
val format = Json { allowSpecialFloatingPointValues = true }

@Serializable
class Data(
    val value: Double
)

fun main() {
    val data = Data(Double.NaN)
    // 특수 부동소수점 값을 나타내는 데 사용되는 비표준 JSON 출력을 생성합니다.
    println(format.encodeToString(data))
    // {"value":NaN}
}
//sampleEnd
```
{kotlin-runnable="true" id="allow-special-float-point-example"}

### 다형성을 위한 클래스 판별자(Class Discriminator) 지정 {id="specify-class-discriminator-for-polymorphism"}

[다형성 데이터(Polymorphic data)](serialization-polymorphism.md)를 다룰 때, 직렬화된 다형성 객체의 타입을 식별하는 키 이름을 지정하기 위해 [`classDiscriminator`](https://kotlinlang.org/api/kotlinx.serialization/kotlinx-serialization-json/kotlinx.serialization.json/-json-builder/class-discriminator.html) 프로퍼티를 사용할 수 있습니다.
[`@SerialName` 어노테이션으로 정의된 명시적 직렬 이름(serial name)](serialization-customization-options.md#customize-serial-names)과 결합하면 결과 JSON 구조를 완벽하게 제어할 수 있습니다.

```kotlin
// 직렬화 라이브러리의 선언들을 임포트합니다.
import kotlinx.serialization.*
import kotlinx.serialization.json.*

//sampleStart
// 커스텀 클래스 판별자를 사용하도록 Json 인스턴스를 구성합니다.
val format = Json { classDiscriminator = "#class" }

@Serializable
sealed class Project {
    abstract val name: String
}

// OwnedProject 클래스에 커스텀 직렬 이름을 지정합니다.
@Serializable
@SerialName("owned")
class OwnedProject(override val name: String, val owner: String) : Project()

// SimpleProject 클래스에 커스텀 직렬 이름을 지정합니다.
@Serializable
@SerialName("simple")
class SimpleProject(override val name: String) : Project()

fun main() {
    val simpleProject: Project = SimpleProject("kotlinx.serialization")
    val ownedProject: Project = OwnedProject("kotlinx.coroutines", "kotlin")

    // #class: "simple"을 포함하여 SimpleProject를 직렬화합니다.
    println(format.encodeToString(simpleProject))
    // {"#class":"simple","name":"kotlinx.serialization"}

    // #class: "owned"를 포함하여 OwnedProject를 직렬화합니다.
    println(format.encodeToString(ownedProject))
    // {"#class":"owned","name":"kotlinx.coroutines","owner":"kotlin"}
}
//sampleEnd
```
{kotlin-runnable="true" id="class-discriminator-example"}

`Json` 인스턴스의 `classDiscriminator` 프로퍼티는 모든 다형성 타입에 대해 단일 판별자 키를 지정할 수 있게 해주는 반면, [실험적(Experimental)](components-stability.md#stability-levels-explained) 기능인 [`@JsonClassDiscriminator`](https://kotlinlang.org/api/kotlinx.serialization/kotlinx-serialization-json/kotlinx.serialization.json/-json-class-discriminator/) 어노테이션은 더 많은 유연성을 제공합니다.
이를 통해 기본(base) 클래스에 직접 커스텀 판별자를 정의할 수 있으며, 이 판별자는 모든 하위 클래스에 자동으로 상속됩니다.

> 상속 가능한 직렬 어노테이션에 대해 자세히 알아보려면 [`@InheritableSerialInfo`](https://kotlinlang.org/api/kotlinx.serialization/kotlinx-serialization-core/kotlinx.serialization/-inheritable-serial-info/)를 참조하세요.
> 
{style="tip"}

예시는 다음과 같습니다.

```kotlin
// 직렬화 라이브러리의 선언들을 임포트합니다.
import kotlinx.serialization.*
import kotlinx.serialization.json.*

//sampleStart
// @JsonClassDiscriminator 어노테이션은 상속 가능하므로 Base의 모든 하위 클래스는 동일한 판별자를 갖습니다.
@Serializable
@OptIn(ExperimentalSerializationApi::class)
@JsonClassDiscriminator("message_type")
sealed class Base

// Base로부터 판별자를 상속받습니다.
@Serializable
sealed class ErrorClass: Base()

// 메시지와 선택적 오류를 결합하는 클래스를 정의합니다.
@Serializable
data class Message(val message: Base, val error: ErrorClass?)

@Serializable
@SerialName("my.app.BaseMessage")
data class BaseMessage(val message: String) : Base()

@Serializable
@SerialName("my.app.GenericError")
data class GenericError(@SerialName("error_code") val errorCode: Int) : ErrorClass()

val format = Json { classDiscriminator = "#class" }

fun main() {
    val data = Message(BaseMessage("not found"), GenericError(404))
    // 모든 하위 클래스에 대해 Base의 판별자를 사용합니다.
    println(format.encodeToString(data))
    // {"message":{"message_type":"my.app.BaseMessage","message":"not found"},"error":{"message_type":"my.app.GenericError","error_code":404}}
}
//sampleEnd
```
{kotlin-runnable="true" id="jsonclass-discriminator-example"}

> 봉인된(sealed) 기본 클래스의 하위 클래스에서 서로 다른 클래스 판별자를 지정할 수는 없습니다.
> 서로 겹치지 않는 별개의 하위 클래스 계층 구조만 자체 판별자를 정의할 수 있습니다.
> 
> 둘 다 판별자를 지정한 경우, `@JsonClassDiscriminator`가 `Json` 구성의 판별자보다 우선 적용됩니다.
>
{style="note"}

### 클래스 판별자 출력 모드 설정 {id="set-class-discriminator-output-mode"}

[`JsonBuilder.classDiscriminatorMode`](https://kotlinlang.org/api/kotlinx.serialization/kotlinx-serialization-json/kotlinx.serialization.json/-json-builder/class-discriminator-mode.html) 프로퍼티를 사용하여 클래스 판별자가 JSON 출력에 추가되는 방식을 제어할 수 있습니다.
기본적으로 [판별자는 다형성 타입에 대해서만 추가](#specify-class-discriminator-for-polymorphism)되며, 이는 [다형성 클래스 계층 구조](serialization-polymorphism.md)를 다룰 때 유용합니다.

이 동작을 조정하려면 [`ClassDiscriminatorMode`](https://kotlinlang.org/api/kotlinx.serialization/kotlinx-serialization-json/kotlinx.serialization.json/-class-discriminator-mode/) 프로퍼티를 다음 옵션 중 하나로 설정하세요.

* [`POLYMORPHIC`](https://kotlinlang.org/api/kotlinx.serialization/kotlinx-serialization-json/kotlinx.serialization.json/-class-discriminator-mode/-p-o-l-y-m-o-r-p-h-i-c/): (기본값) 다형성 타입에 대해서만 클래스 판별자를 추가합니다.
* [`ALL_JSON_OBJECTS`](https://kotlinlang.org/api/kotlinx.serialization/kotlinx-serialization-json/kotlinx.serialization.json/-class-discriminator-mode/-a-l-l_-j-s-o-n_-o-b-j-e-c-t-s/): 가능한 모든 JSON 객체에 클래스 판별자를 추가합니다.
* [`NONE`](https://kotlinlang.org/api/kotlinx.serialization/kotlinx-serialization-json/kotlinx.serialization.json/-class-discriminator-mode/-n-o-n-e/): 클래스 판별자를 완전히 생략합니다.

다음은 `ClassDiscriminatorMode` 프로퍼티를 `NONE`으로 설정한 예시입니다.

```kotlin
// 직렬화 라이브러리의 선언들을 임포트합니다.
import kotlinx.serialization.*
import kotlinx.serialization.json.*

//sampleStart
// 출력에서 클래스 판별자를 생략하도록 Json 인스턴스를 구성합니다.
val format = Json { classDiscriminatorMode = ClassDiscriminatorMode.NONE }

@Serializable
sealed class Project {
    abstract val name: String
}

@Serializable
class OwnedProject(override val name: String, val owner: String) : Project()

fun main() {
    val data: Project = OwnedProject("kotlinx.coroutines", "kotlin")
    // 판별자 없이 직렬화합니다.
    println(format.encodeToString(data))
    // {"name":"kotlinx.coroutines","owner":"kotlin"}
}
//sampleEnd
```
{kotlin-runnable="true" id="set-classdiscriminatormode-example"}

> 판별자가 없으면 기본 클래스의 직렬 변환기(serializer)가 출력을 적절한 타입으로 다시 역직렬화할 수 없습니다.
>
{style="note"}

### 들여쓰기 출력 (Pretty printing) {id="pretty-printing"}

기본적으로 `Json`은 압축된 한 줄 출력을 생성합니다.

출력에서 pretty printing을 활성화하여 들여쓰기와 줄 바꿈을 추가하면 가독성을 높일 수 있습니다.
이렇게 하려면 `Json` 인스턴스에서 [`prettyPrint`](https://kotlinlang.org/api/kotlinx.serialization/kotlinx-serialization-json/kotlinx.serialization.json/-json-builder/pretty-print.html) 프로퍼티를 `true`로 설정하세요.

```kotlin
// 직렬화 라이브러리의 선언들을 임포트합니다.
import kotlinx.serialization.*
import kotlinx.serialization.json.*

//sampleStart
// 커스텀 Json 포맷을 생성합니다.
val format = Json { prettyPrint = true }

@Serializable
data class Project(val name: String, val language: String)

fun main() {
    val data = Project("kotlinx.serialization", "Kotlin")

    // 줄 바꿈과 들여쓰기가 적용된 JSON 출력을 출력합니다.
    println(format.encodeToString(data))
}
//sampleEnd
```
{kotlin-runnable="true" id="pretty-printing-example"}

이 예제는 다음과 같은 결과를 출력합니다.

```text
{
    "name": "kotlinx.serialization",
    "language": "Kotlin"
}
```

> [`prettyPrintIndent`](https://kotlinlang.org/api/kotlinx.serialization/kotlinx-serialization-json/kotlinx.serialization.json/-json-builder/pretty-print-indent.html) 옵션을 사용하여 들여쓰기 출력 시 적용할 들여쓰기를 커스터마이징할 수 있습니다.
>
> 예를 들어, 기본 4개의 공백을 `\t`나 `\n`과 같이 허용되는 공백 문자로 바꿀 수 있습니다.
>
{style="tip"}

## JSON 역직렬화 커스터마이징 {id="customize-json-deserialization"}

Kotlin의 `Json` 파서는 JSON 데이터의 파싱과 역직렬화를 커스터마이징할 수 있는 몇 가지 설정을 제공합니다.

### 알 수 없는 키 무시 {id="ignore-unknown-keys"}

서드파티 서비스나 기타 동적 소스의 JSON 데이터를 다룰 때, 시간이 지남에 따라 JSON 객체에 새로운 프로퍼티가 추가될 수 있습니다.

기본적으로 역직렬화 중에 알 수 없는 키(JSON 입력에 있는 프로퍼티 이름)가 있으면 오류가 발생합니다.
이를 방지하려면 `Json` 인스턴스에서 [`ignoreUnknownKeys`](https://kotlinlang.org/api/kotlinx.serialization/kotlinx-serialization-json/kotlinx.serialization.json/-json-builder/ignore-unknown-keys.html) 프로퍼티를 `true`로 설정하세요.

```kotlin
// 직렬화 라이브러리의 선언들을 임포트합니다.
import kotlinx.serialization.*
import kotlinx.serialization.json.*

//sampleStart
// 알 수 없는 키를 무시하도록 Json 인스턴스를 생성합니다.
val format = Json { ignoreUnknownKeys = true }

@Serializable
data class Project(val name: String)

fun main() {
    val data = format.decodeFromString<Project>("""
        {"name":"kotlinx.serialization","language":"Kotlin"}
    """)
    // language 키는 Project 클래스에 없으므로 무시됩니다.
    println(data)
    // Project(name=kotlinx.serialization)
}
//sampleEnd
```
{kotlin-runnable="true" id="ignore-unknown-keys-example"}

#### 특정 클래스에 대해 알 수 없는 키 무시 {id="ignore-unknown-keys-for-specific-classes"}
<primary-label ref="experimental-opt-in"/>

[모든 클래스에 대해 `ignoreUnknownKeys`를 활성화](#ignore-unknown-keys)하는 대신, `@JsonIgnoreUnknownKeys` 어노테이션을 사용하여 특정 클래스에 대해서만 알 수 없는 키를 무시할 수 있습니다.
이를 통해 기본적으로는 엄격한 역직렬화를 유지하면서 필요한 곳에만 유연성을 허용할 수 있습니다.

`@JsonIgnoreUnknownKeys` 어노테이션은 [실험적(Experimental)](components-stability.md#stability-levels-explained) 기능입니다.
사용하려면 `@OptIn(ExperimentalSerializationApi::class)` 어노테이션을 사용하거나 컴파일러 옵션 `-opt-in=kotlinx.serialization.ExperimentalSerializationApi`를 추가하세요.

```kotlin
// 직렬화 라이브러리의 선언들을 임포트합니다.
import kotlinx.serialization.*
import kotlinx.serialization.json.*

//sampleStart
@OptIn(ExperimentalSerializationApi::class)
@Serializable
// Outer의 알 수 없는 프로퍼티는 역직렬화 중에 무시됩니다.
@JsonIgnoreUnknownKeys
data class Outer(val a: Int, val inner: Inner)

@Serializable
data class Inner(val x: String)

fun main() {
    val outer = Json.decodeFromString<Outer>(
        """{"a":1,"inner":{"x":"value"},"unknownKey":42}"""
    )
    println(outer)
    // Outer(a=1, inner=Inner(x=value))

    // 예외가 발생합니다.
    // Inner에는 어노테이션이 지정되지 않았으므로 inner 내부의 unknownKey는 무시되지 않습니다.
    println(
        Json.decodeFromString<Outer>(
            """{"a":1,"inner":{"x":"value","unknownKey":"unexpected"}}"""
        )
    )
}
//sampleEnd
```
{kotlin-runnable="true" kotlin-min-compiler-version="2.2" validate="false" id="ignore-specific-unknown-keys-example"}

이 예제에서 `Inner`는 `@JsonIgnoreUnknownKeys` 어노테이션이 붙어있지 않기 때문에 알 수 없는 키에 대해 `SerializationException`을 던집니다.

### 입력 값 강제 변환 (Coerce input values) {id="coerce-input-values"}

서드파티 서비스나 기타 동적 소스의 JSON 데이터를 다룰 때 포맷이 변경될 수 있습니다.
이로 인해 실제 값이 예상 타입과 일치하지 않을 때 디코딩 중 예외가 발생할 수 있습니다.

기본 `Json` 구현은 [입력 타입에 대해 엄격합니다](serialization-customization-options.md#the-serializable-annotation).
이 제한을 완화하려면 `Json` 인스턴스에서 [`coerceInputValues`](https://kotlinlang.org/api/kotlinx.serialization/kotlinx-serialization-json/kotlinx.serialization.json/-json-builder/coerce-input-values.html) 프로퍼티를 `true`로 설정하세요.

```kotlin
// 직렬화 라이브러리의 선언들을 임포트합니다.
import kotlinx.serialization.*
import kotlinx.serialization.json.*

//sampleStart
val format = Json { coerceInputValues = true }

@Serializable
data class Project(val name: String, val language: String = "Kotlin")

fun main() {
    val data = format.decodeFromString<Project>("""
        {"name":"kotlinx.serialization","language":null}
    """)

    // language의 잘못된 null 값을 기본값으로 강제 변환합니다.
    println(data)
    // Project(name=kotlinx.serialization, language=Kotlin)
}
//sampleEnd
```
{kotlin-runnable="true"}

`coerceInputValues` 프로퍼티는 디코딩에만 영향을 줍니다. 특정 유효하지 않은 입력 값을 해당 프로퍼티가 누락된 것처럼 취급합니다.
현재 다음 경우에 적용됩니다.

* 널 불가(non-nullable) 타입에 대한 `null` 입력
* 열거형(enum)의 알 수 없는 값

> 이 목록은 향후 버전에서 확장될 수 있으며, 유효하지 않은 값을 기본값이나 `null`로 대체함으로써 이 프로퍼티가 설정된 `Json` 인스턴스를 훨씬 더 관대하게 만들 수 있습니다.
>
{style="note"}

값이 누락된 경우, 기본 프로퍼티 값이 존재한다면 기본값으로 대체됩니다.

열거형의 경우 다음 조건이 모두 충족될 때만 값이 `null`로 대체됩니다.

* 기본값이 정의되지 않음.
* [`explicitNulls`](#omit-explicit-nulls) 프로퍼티가 `false`로 설정됨.
* 프로퍼티가 널 허용(nullable)임.

`coerceInputValues`와 `explicitNulls` 프로퍼티를 결합하여 잘못된 열거형 값을 처리할 수 있습니다.

```kotlin
// 직렬화 라이브러리의 선언들을 임포트합니다.
import kotlinx.serialization.*
import kotlinx.serialization.json.*

//sampleStart
enum class Color { BLACK, WHITE }

@Serializable
data class Brush(val foreground: Color = Color.BLACK, val background: Color?)

val json = Json { 
  coerceInputValues = true
  explicitNulls = false
}

fun main() {

    // 알 수 없는 foreground 값을 기본값으로 강제 변환하고 background를 null로 강제 변환합니다.
    val brush = json.decodeFromString<Brush>("""{"foreground":"pink", "background":"purple"}""")
    println(brush)
    // Brush(foreground=BLACK, background=null)
}
//sampleEnd
```
{kotlin-runnable="true" id="coerce-input-values-example"}

### 후행 쉼표(Trailing commas) 허용 {id="allow-trailing-commas"}

JSON 입력에서 후행 쉼표를 허용하려면 [`allowTrailingComma`](https://kotlinlang.org/api/kotlinx.serialization/kotlinx-serialization-json/kotlinx.serialization.json/-json-builder/allow-trailing-comma.html) 프로퍼티를 `true`로 설정하세요.

```kotlin
// 직렬화 라이브러리의 선언들을 임포트합니다.
import kotlinx.serialization.*
import kotlinx.serialization.json.*

//sampleStart
// JSON 객체 및 배열에서 후행 쉼표를 허용합니다.
val format = Json { allowTrailingComma = true }

fun main() {
    val numbers = format.decodeFromString<List<Int>>(
        """
            [1, 2, 3,]
        """
    )
    println(numbers)
    // [1, 2, 3]
}
//sampleEnd
```
{kotlin-runnable="true" id="allow-trailing-commas-example"}

### JSON 내 주석 허용 {id="allow-comments-in-json"}

JSON 입력에서 주석을 허용하려면 [`allowComments`](https://kotlinlang.org/api/kotlinx.serialization/kotlinx-serialization-json/kotlinx.serialization.json/-json-builder/allow-comments.html) 프로퍼티를 사용하세요.
이 프로퍼티가 활성화되면 파서는 입력에서 다음과 같은 주석 형식을 허용합니다.

* 줄 바꿈 `\n`에서 끝나는 `//` 한 줄 주석
* `/* */` 블록 주석

예시는 다음과 같습니다.

```kotlin
// 직렬화 라이브러리의 선언들을 임포트합니다.
import kotlinx.serialization.*
import kotlinx.serialization.json.*

//sampleStart
// JSON 입력에서 주석을 허용합니다.
val format = Json { allowComments = true }

fun main() {
    val numbers = format.decodeFromString<List<Int>>(
        """
            [
                // 첫 번째 요소
                1,
                /* 두 번째 요소 */
                2
            ]
        """
    )
    println(numbers)
    // [1, 2]
}
//sampleEnd
```
{kotlin-runnable="true" id="allow-comments-example"}

### 관대한 파싱 (Lenient parsing) {id="lenient-parsing"}

기본적으로 `Json` 파서는 키와 문자열 리터럴을 따옴표로 묶도록 요구하는 [RFC-8259](https://www.ietf.org/rfc/rfc8259.txt) 사양을 준수하도록 엄격한 JSON 규칙을 적용합니다.

이러한 제한을 완화하려면 `Json` 인스턴스에서 [`isLenient`](https://kotlinlang.org/api/kotlinx.serialization/kotlinx-serialization-json/kotlinx.serialization.json/-json-builder/is-lenient.html) 프로퍼티를 `true`로 설정하세요.

```kotlin
// 직렬화 라이브러리의 선언들을 임포트합니다.
import kotlinx.serialization.*
import kotlinx.serialization.json.*

//sampleStart
val format = Json { isLenient = true }

enum class Status { SUPPORTED }

@Serializable
data class Project(val name: String, val status: Status, val votes: Int)

fun main() {
    // 관대한 파싱으로 JSON 문자열을 디코딩합니다.
    // 관대한 파싱은 따옴표가 없는 키, 문자열 및 열거형 값을 허용합니다.
    val data = format.decodeFromString<Project>("""
        {
            name   : kotlinx.serialization,
            status : SUPPORTED,
            votes  : "9000"
        }
    """)
    println(data)
    // Project(name=kotlinx.serialization, status=SUPPORTED, votes=9000)
}
//sampleEnd
```
{kotlin-runnable="true" id="lenient-parsing-example"}

## JSON과 Kotlin 간 이름 매핑 커스터마이징 {id="customize-name-mapping-between-json-and-kotlin"}

일부 JSON 데이터는 Kotlin의 명명 규칙이나 예상 형식과 완벽하게 일치하지 않을 수 있습니다.
이러한 문제를 해결하기 위해 Kotlin serialization은 이름 불일치를 관리하고, 여러 JSON 프로퍼티 이름을 처리하며, 직렬화된 데이터 전반에 일관된 명명 전략을 적용할 수 있는 여러 도구를 제공합니다.

### 단일 Kotlin 프로퍼티에 대해 여러 JSON 프로퍼티 이름 허용 {id="accept-alternative-json-property-names-for-a-single-kotlin-property"}

스키마 버전 간에 JSON 프로퍼티 이름이 변경되는 경우, [`@SerialName` 어노테이션을 사용하여 JSON 프로퍼티 이름을 바꿀 수 있습니다](serialization-customization-options.md#customize-serial-names).

그러나 이렇게 하면 이전 프로퍼티 이름을 여전히 사용하는 데이터를 디코딩할 수 없게 됩니다.
단일 프로퍼티에 대해 대체 가능한 여러 JSON 프로퍼티 이름을 허용하려면 [`@JsonNames`](https://kotlinlang.org/api/kotlinx.serialization/kotlinx-serialization-json/kotlinx.serialization.json/-json-names/) 어노테이션을 사용하세요.

```kotlin
// 직렬화 라이브러리의 선언들을 임포트합니다.
import kotlinx.serialization.*
import kotlinx.serialization.json.*

//sampleStart
@Serializable
// name과 title JSON 프로퍼티를 모두 name 프로퍼티에 매핑합니다.
data class Project(@JsonNames("title") val name: String)

fun main() {
    val project = Json.decodeFromString<Project>("""{"name":"kotlinx.serialization"}""")
    println(project)
    // Project(name=kotlinx.serialization)

    val oldProject = Json.decodeFromString<Project>("""{"title":"kotlinx.coroutines"}""")
    // name과 title Json 프로퍼티가 모두 name 프로퍼티에 해당합니다.
    println(oldProject)
    // Project(name=kotlinx.coroutines)
}
//sampleEnd
```
{kotlin-runnable="true" id="accept-alternative-json-property-example"}

> [`JsonBuilder`](https://kotlinlang.org/api/kotlinx.serialization/kotlinx-serialization-json/kotlinx.serialization.json/-json-builder/)의 [`useAlternativeNames`](https://kotlinlang.org/api/kotlinx.serialization/kotlinx-serialization-json/kotlinx.serialization.json/-json-builder/use-alternative-names.html) 프로퍼티는 `@JsonNames` 어노테이션을 활성화합니다.
> 이 프로퍼티는 기본적으로 `true`로 설정되어 있어 `Json`이 단일 프로퍼티에 대한 여러 이름을 인식하고 디코딩할 수 있도록 합니다.
> 
> `@JsonNames`를 사용하지 않으며 성능을 개선하고 싶은 경우(특히 `ignoreUnknownKeys`로 수많은 알 수 없는 프로퍼티를 건너뛸 때), 이 프로퍼티를 `false`로 설정할 수 있습니다.
>
{style="note"}

### 대소문자를 구분하지 않고 열거형 디코딩 {id="decode-enums-in-a-case-insensitive-manner"}

[Kotlin의 명명 규칙](coding-conventions.md#property-names)은 열거형 값을 대문자와 밑줄(SCREAMING_SNAKE_CASE) 또는 대문자 카멜 케이스(UpperCamelCase)로 작성하도록 권장합니다.
기본적으로 `Json`은 디코딩 시 Kotlin 열거형 상수의 정확한 이름을 사용합니다.

그러나 외부 소스의 JSON 데이터는 소문자나 혼합된 대소문자를 사용할 수 있습니다.
이러한 경우를 처리하려면 [`JsonBuilder.decodeEnumsCaseInsensitive`](https://kotlinlang.org/api/kotlinx.serialization/kotlinx-serialization-json/kotlinx.serialization.json/-json-builder/decode-enums-case-insensitive.html) 프로퍼티를 사용하여 대소문자를 구분하지 않고 열거형 값을 디코딩하도록 `Json` 인스턴스를 구성할 수 있습니다.

```kotlin
// 직렬화 라이브러리의 선언들을 임포트합니다.
import kotlinx.serialization.*
import kotlinx.serialization.json.*

//sampleStart
// 대소문자를 구분하지 않고 열거형 값을 디코딩하도록 Json 인스턴스를 구성합니다.
val format = Json { decodeEnumsCaseInsensitive = true }

enum class Cases { VALUE_A, @JsonNames("Alternative") VALUE_B }

@Serializable
data class CasesList(val cases: List<Cases>)

fun main() {
    // 대체 이름을 포함하여 대소문자에 관계없이 열거형 값을 디코딩합니다.
    println(format.decodeFromString<CasesList>("""{"cases":["value_A", "alternative"]}""")) 
    // CasesList(cases=[VALUE_A, VALUE_B])
}
//sampleEnd
```
{kotlin-runnable="true" id="decode-enums-caseinsensitive-example"}

> 이 프로퍼티는 [직렬 이름(serial names)](serialization-customization-options.md#customize-serial-names)과 `@JsonNames` 어노테이션으로 지정된 [대체 이름](#accept-alternative-json-property-names-for-a-single-kotlin-property) 모두에 적용되어, 모든 값이 성공적으로 디코딩되도록 보장합니다. 이 프로퍼티는 인코딩에는 영향을 미치지 않습니다.
>
{style="note"}

### 전역 명명 전략 적용 {id="apply-a-global-naming-strategy"}

JSON 입력의 프로퍼티 이름이 Kotlin의 프로퍼티 이름과 다른 경우, [`@SerialName`](serialization-customization-options.md#customize-serial-names) 어노테이션을 사용하여 각 프로퍼티의 이름을 명시적으로 지정할 수 있습니다.
그러나 다른 프레임워크나 레거시 코드베이스에서 마이그레이션할 때는 모든 직렬 이름을 동일한 방식으로 변환해야 할 수도 있습니다.

이러한 시나리오에서는 `Json` 인스턴스에서 [JsonBuilder.namingStrategy](https://kotlinlang.org/api/kotlinx.serialization/kotlinx-serialization-json/kotlinx.serialization.json/-json-builder/naming-strategy.html) 프로퍼티를 사용하여 전역 명명 전략을 지정할 수 있습니다.
Kotlin serialization은 [JsonNamingStrategy.SnakeCase](https://kotlinlang.org/api/kotlinx.serialization/kotlinx-serialization-json/kotlinx.serialization.json/-json-naming-strategy/-builtins/-snake-case.html)와 같은 기본 제공 전략을 지원합니다.

```kotlin
// 직렬화 라이브러리의 선언들을 임포트합니다.
import kotlinx.serialization.*
import kotlinx.serialization.json.*

//sampleStart
@Serializable
data class Project(val projectName: String, val projectOwner: String)

// SnakeCase 명명 전략을 적용하도록 Json 인스턴스를 구성합니다.
val format = Json { namingStrategy = JsonNamingStrategy.SnakeCase }

fun main() {
    val project = format.decodeFromString<Project>("""{"project_name":"kotlinx.coroutines", "project_owner":"Kotlin"}""")
    // 모든 직렬 이름이 카멜 케이스에서 스네이크 케이스로 변환된 것처럼 직렬화 및 역직렬화합니다.
    println(format.encodeToString(project.copy(projectName = "kotlinx.serialization")))
    // {"project_name":"kotlinx.serialization","project_owner":"Kotlin"}
}
//sampleEnd
```
{kotlin-runnable="true" id="global-naming-strategy-example"}

[`JsonNamingStrategy`](https://kotlinlang.org/api/kotlinx.serialization/kotlinx-serialization-json/kotlinx.serialization.json/-json-naming-strategy/)와 함께 전역 명명 전략을 사용할 때는 다음 사항을 유의하세요.

* _변환은 모든 프로퍼티에 적용됩니다._ 직렬 이름이 프로퍼티 이름에서 파생되었든 [`@SerialName`](https://kotlinlang.org/api/kotlinx.serialization/kotlinx-serialization-core/kotlinx.serialization/-serial-name/) 어노테이션으로 명시적으로 정의되었든 상관없이 적용됩니다. 직렬 이름을 지정한다고 해서 변환 대상에서 프로퍼티를 제외할 수는 없습니다. 직렬화 중에 특정 이름을 변경하지 않고 유지하려면 대신 `@JsonNames` 어노테이션을 사용하세요.
* 변환된 이름이 변환된 다른 프로퍼티 이름이나 `@JsonNames` 어노테이션으로 지정된 대체 이름과 충돌하는 경우, 역직렬화가 실패하고 예외가 발생합니다.
* 전역 명명 전략은 암시적(implicit)입니다. 클래스 정의만 보고는 직렬화된 이름을 파악하기 어렵게 만듭니다. 이로 인해 IDE에서의 **Find Usages(사용처 찾기)**, **Rename(이름 변경)** 또는 `grep` 같은 도구를 사용한 전문 검색(full-text search) 작업이 더 까다로워져 버그 발생 위험과 유지보수 비용이 증가할 수 있습니다.

이러한 요소를 고려하여 애플리케이션에 전역 명명 전략을 도입하기 전에 트레이드오프(trade-off)를 면밀히 검토하세요.

## 다음 단계 {id="what-s-next"}

* 데이터가 파싱되거나 직렬화되기 전에 JSON 데이터를 직접 조작하고 다루려면 [고급 JSON 요소 처리](serialization-json-elements.md)를 살펴보세요.
* 데이터를 더 정밀하게 제어하려면 [직렬화 및 역직렬화 중 JSON 변환](serialization-transform-json.md) 방법을 확인해 보세요.