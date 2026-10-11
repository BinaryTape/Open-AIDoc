[//]: # (title: 클래스 직렬화)

[`@Serializable`](https://kotlinlang.org/api/kotlinx.serialization/kotlinx-serialization-core/kotlinx.serialization/-serializable/) 어노테이션을 사용하면 [뒷받침하는 필드(backing field)](properties.md#backing-fields)가 있는 모든 클래스 프로퍼티의 기본 직렬화가 활성화됩니다.
필요에 따라 이 동작을 커스터마이징할 수 있습니다.
이 페이지에서는 직렬화할 프로퍼티를 지정하는 방법과 직렬화 프로세스를 관리하는 방법을 포함한 다양한 직렬화 기법을 다룹니다.

시작하기 전에 [필요한 라이브러리 의존성](serialization-get-started.md)을 추가했는지 확인하세요.

## @Serializable 어노테이션 {id="the-serializable-annotation"}

`@Serializable` 어노테이션은 클래스 프로퍼티의 자동 직렬화를 활성화하여
클래스를 JSON과 같은 포맷으로 상호 변환할 수 있도록 해줍니다.

Kotlin에서는 뒷받침하는 필드가 있는 프로퍼티만 직렬화됩니다.

```kotlin
// 직렬화 라이브러리의 선언을 import합니다.
import kotlinx.serialization.*
import kotlinx.serialization.json.*

//sampleStart
@Serializable
class Project(
    // 뒷받침하는 필드가 있는 프로퍼티 – 직렬화됨
    var name: String
) {
    // 뒷받침하는 필드가 있는 프로퍼티 – 직렬화됨
    var stars: Int = 0

    // 뒷받침하는 필드가 없는 게터 전용 프로퍼티 - 직렬화되지 않음
    val path: String
        get() = "kotlin/$name"

    // 위임된 프로퍼티 - 직렬화되지 않음
    var id by ::name
}

fun main() {
    val data = Project("kotlinx.serialization").apply { stars = 9000 }
    // name과 stars 프로퍼티만 출력됩니다.
    println(Json.encodeToString(data))
    // {"name":"kotlinx.serialization","stars":9000}
}
//sampleEnd
```
{kotlin-runnable="true" id="serialize-annotation-example"}

### 클래스 참조 직렬화 {id="serialize-class-references"}

`@Serializable`이 지정된 클래스는 다른 클래스를 참조하는 프로퍼티를 포함할 수 있습니다.
참조되는 클래스 역시 `@Serializable` 어노테이션이 붙어 있어야 합니다.
JSON으로 인코딩되면 이는 중첩된 JSON 객체로 변환됩니다.

```kotlin
// 직렬화 라이브러리의 선언을 import합니다.
import kotlinx.serialization.*
import kotlinx.serialization.json.*

//sampleStart
@Serializable
// owner 프로퍼티는 직렬화 가능한 또 다른 클래스인 User를 참조합니다.
class Project(val name: String, val owner: User)

// 참조되는 클래스 역시 @Serializable이 지정되어야 합니다.
@Serializable
class User(val name: String)

fun main() {
    val owner = User("kotlin")
    val data = Project("kotlinx.serialization", owner)
    println(Json.encodeToString(data))
    // {"name":"kotlinx.serialization","owner":{"name":"kotlin"}}
}
//sampleEnd
```
{kotlin-runnable="true" id="serialize-class-references-example"}

> 직렬화할 수 없는 클래스를 참조하려면 해당 프로퍼티에 [`@Transient`](#exclude-properties-with-the-transient-annotation)를 추가하거나
> [커스텀 직렬화기(custom serializer)](serialization-create-and-use-serializers.md)를 제공하세요.
>
{style="tip"}

### 중복된 객체 참조의 직렬화 {id="serialization-of-repeated-object-references"}

Kotlin 직렬화는 순수 데이터(plain data)를 인코딩 및 디코딩하도록 설계되었습니다. 따라서 동일한 객체 참조가 중복된 임의의 객체 그래프 복원은 지원하지 않습니다.
예를 들어 동일한 인스턴스를 두 번 참조하는 객체를 직렬화하면 두 번 인코딩됩니다.

```kotlin
// 직렬화 라이브러리의 선언을 import합니다.
import kotlinx.serialization.*
import kotlinx.serialization.json.*

//sampleStart
@Serializable
class Project(val name: String, val owner: User, val maintainer: User)

@Serializable
class User(val name: String)

fun main() {
    val owner = User("kotlin")
    // owner를 두 번 참조합니다.
    val data = Project("kotlinx.serialization", owner, owner)
    println(Json.encodeToString(data))
    // {"name":"kotlinx.serialization","owner":{"name":"kotlin"},"maintainer":{"name":"kotlin"}}
}
//sampleEnd
```
{kotlin-runnable="true" id="serialize-repeated-references"}

> 순환 구조를 직렬화하려고 시도하면 스택 오버플로(stack overflow)가 발생합니다.
> 참조를 직렬화에서 제외하려면 [@Transient 어노테이션](#exclude-properties-with-the-transient-annotation)을 사용하세요.
>
{style="tip"}

### 제네릭 클래스 직렬화 {id="serialize-generic-classes"}

Kotlin의 제네릭 클래스는 타입 다형성(type-polymorphism)을 지원하며, 이는 Kotlin 직렬화에 의해 컴파일 타임에 강제됩니다. 예를 들어 다음과 같은 제네릭 직렬화 가능 클래스 `Payload<T>`를 살펴보겠습니다.

```kotlin
// 직렬화 라이브러리의 선언을 import합니다.
import kotlinx.serialization.*
import kotlinx.serialization.json.*

//sampleStart
@Serializable
// Payload<T> 클래스는 Int와 같은 기본 내장 타입이나
// Repository와 같이 @Serializable이 지정된 사용자 정의 타입과 함께 사용할 수 있습니다.
class Payload<T>(val value: T)

@Serializable
data class Repository(val name: String, val language: String)

@Serializable
class BackupData(
    val issueCount: Payload<Int>,
    val mainRepo: Payload<Repository>
)

fun main() {
    val backup = BackupData(
        Payload(42),
        Payload(Repository("kotlinx.serialization", "Kotlin"))
    )
    println(Json.encodeToString(backup))
    // {"issueCount":{"value":42},"mainRepo":{"value":{"name":"kotlinx.serialization","language":"Kotlin"}}}
}
//sampleEnd
```
{kotlin-runnable="true" id="serialize-generic-classes-example"}

`Box<T>`와 같은 제네릭 클래스를 직렬화할 때 JSON 출력 결과는 컴파일 타임에 `T`에 지정한 실제 타입에 따라 달라집니다.
해당 타입이 직렬화 가능하지 않다면 컴파일 타임 오류가 발생합니다.

## 선택적 프로퍼티 {id="optional-properties"}

_기본값(default value)_을 가진 프로퍼티는 역직렬화 시 선택 사항이 되며, 포맷 설정에 따라 직렬화 시 건너뛸 수도 있습니다.
예를 들어 기본 JSON 구성에서는 기본값 인코딩을 건너뜁니다.

### 선택적 프로퍼티에 기본값 설정 {id="set-default-values-for-optional-properties"}

Kotlin에서는 입력 데이터에 모든 프로퍼티가 존재해야만 객체를 역직렬화할 수 있습니다.
직렬화 시 프로퍼티를 선택 사항으로 만들려면 입력에 값이 제공되지 않을 때 사용할 기본값을 설정하세요.

```kotlin
// 직렬화 라이브러리의 선언을 import합니다.
import kotlinx.serialization.*
import kotlinx.serialization.json.*

//sampleStart
@Serializable
// 선택적 language 프로퍼티에 기본값을 설정합니다.
data class Project(val name: String, val language: String = "Kotlin")

fun main() {
    val data = Json.decodeFromString<Project>("""
        {"name":"kotlinx.serialization"}
    """)
    println(data)
    // Project(name=kotlinx.serialization, language=Kotlin)
}
//sampleEnd
```
{kotlin-runnable="true" id="deserialize-optional-properties"}

### 널 허용(Nullable) 프로퍼티 직렬화 {id="serialize-nullable-properties"}

Kotlin 직렬화는 널 허용 프로퍼티를 기본적으로 지원합니다.
[다른 기본값과 마찬가지로](#manage-the-serialization-of-default-properties-with-encodedefault), `null` 값은 JSON 출력에서 인코딩되지 않습니다.

```kotlin
// 직렬화 라이브러리의 선언을 import합니다.
import kotlinx.serialization.*
import kotlinx.serialization.json.*

//sampleStart
@Serializable
// 기본값이 null인 널 허용 프로퍼티 renamedTo를 가진 클래스를 정의합니다.
class Project(val name: String, val renamedTo: String? = null)

fun main() {
    val data = Project("kotlinx.serialization")
    // renamedTo 프로퍼티는 값이 null이므로 인코딩되지 않습니다.
    println(Json.encodeToString(data))
    // {"name":"kotlinx.serialization"}
}
//sampleEnd
```
{kotlin-runnable="true" id="nullable-properties-example"}

또한 역직렬화 중에는 Kotlin의 [널 안전성(null safety)](null-safety.md)이 엄격하게 적용됩니다.
JSON 객체에 널을 허용하지 않는 프로퍼티에 대한 `null` 값이 포함되어 있다면, 해당 프로퍼티에 기본값이 있더라도 예외가 발생합니다.

```kotlin
// 직렬화 라이브러리의 선언을 import합니다.
import kotlinx.serialization.*
import kotlinx.serialization.json.*

//sampleStart
@Serializable
data class Project(val name: String, val language: String = "Kotlin")

fun main() {
    val data = Json.decodeFromString<Project>("""
        {"name":"kotlinx.serialization","language":null}
    """)
    println(data)
    // JsonDecodingException
}
//sampleEnd
```
{kotlin-runnable="true" validate="false" id="deserialize-nullable-exception-example"}

> 서드파티 JSON의 `null` 값을 처리해야 하는 경우 [기본값으로 강제 변환(coerce)](serialization-json-configuration.md#coerce-input-values)할 수 있습니다.
> 
> 또한 `explicitNulls` 프로퍼티를 사용하여 인코딩된 JSON에서 [명시적 `null` 값을 생략](serialization-json-configuration.md#omit-explicit-nulls)할 수도 있습니다.
>
{style="tip"}

### 선택적 프로퍼티의 초기화 식 {id="initializers-in-optional-properties"}

직렬화 입력에 선택적 프로퍼티의 값이 포함되어 있으면 해당 프로퍼티의 초기화 식(initializer)은 호출되지 않습니다.
이러한 이유로 프로퍼티 초기화 식에서는 부수 효과(side effect)가 있는 코드를 피하는 것이 좋습니다.

다음은 예시입니다.

```kotlin
// 직렬화 라이브러리의 선언을 import합니다.
import kotlinx.serialization.*
import kotlinx.serialization.json.*

//sampleStart
fun computeLanguage(): String {
    println("Computing")
    return "Kotlin"
}

@Serializable
// 입력에 language가 있으면 초기화 식을 건너뜁니다.
data class Project(val name: String, val language: String = computeLanguage())

fun main() {
    val data = Json.decodeFromString<Project>("""
        {"name":"kotlinx.serialization","language":"Java"}
    """)
    println(data)
    // Project(name=kotlinx.serialization, language=Java)
}
//sampleEnd
```
{kotlin-runnable="true" id="deserialize-initializer-example"}

이 예시에서는 입력에 `language` 프로퍼티가 지정되어 있으므로 출력에 `Computing` 문자열이 출력되지 않습니다.

### `@EncodeDefault`를 사용한 기본 프로퍼티 직렬화 관리 {id="manage-the-serialization-of-default-properties-with-encodedefault"}

기본적으로 JSON 직렬화는 기본값이 있는 프로퍼티를 제외합니다.
이렇게 하면 직렬화된 데이터의 크기가 줄어들고 불필요한 시각적 복잡성을 방지할 수 있습니다.

다음은 `language` 프로퍼티의 값이 기본값과 같아서 출력에서 제외되는 예시입니다.

```kotlin
// 직렬화 라이브러리의 선언을 import합니다.
import kotlinx.serialization.*
import kotlinx.serialization.json.*

//sampleStart
@Serializable
data class Project(val name: String, val language: String = "Kotlin")

fun main() {
    val data = Project("kotlinx.serialization")
    println(Json.encodeToString(data))
    // {"name":"kotlinx.serialization"}
}
//sampleEnd
```
{kotlin-runnable="true" id="default-properties-example"}

> 기본적으로 모든 프로퍼티에 대해 [기본값을 인코딩](serialization-json-configuration.md#encode-default-values)하도록 `Json` 인스턴스를 설정할 수 있습니다.
>
{style="tip"}

값이나 포맷 설정에 관계없이 프로퍼티를 항상 직렬화하려면 [`@EncodeDefault`](https://kotlinlang.org/api/kotlinx.serialization/kotlinx-serialization-core/kotlinx.serialization/-encode-default/) 어노테이션을 사용하세요.
또는 [`EncodeDefault.Mode`](https://kotlinlang.org/api/kotlinx.serialization/kotlinx-serialization-core/kotlinx.serialization/-encode-default/-mode/) 파라미터를 설정하여 이 동작을 변경할 수 있습니다.

`language` 프로퍼티는 직렬화된 출력에 항상 포함되고, `projects` 프로퍼티는 빈 리스트일 때 제외되는 예시를 살펴보겠습니다.

```kotlin
// 직렬화 라이브러리의 선언을 import합니다.
import kotlinx.serialization.*
import kotlinx.serialization.json.*
import kotlinx.serialization.EncodeDefault.Mode.NEVER

//sampleStart
@Serializable
data class Project(
    val name: String,
    // 기본값 "Kotlin"을 갖더라도 직렬화된 출력에
    // 항상 language 프로퍼티를 포함합니다.
    @EncodeDefault val language: String = "Kotlin"
)

@Serializable
data class User(
    val name: String,
    // 기본값이 있더라도 빈 리스트일 경우 projects를 제외합니다.
    @EncodeDefault(NEVER) val projects: List<Project> = emptyList()
)

fun main() {
    val adminUser = User("Alice", listOf(Project("kotlinx.serialization")))
    val guestUser = User("Bob")
    // projects에 값이 포함되어 있으므로 직렬화됩니다.
    // language는 항상 직렬화됩니다.
    println(Json.encodeToString(adminUser))
    // {"name":"Alice","projects":[{"name":"kotlinx.serialization","language":"Kotlin"}]}

    // projects가 빈 리스트이고 EncodeDefault.Mode가 NEVER로 설정되어 있으므로
    // 직렬화되지 않고 제외됩니다.
    println(Json.encodeToString(guestUser))
    // {"name":"Bob"}
}
//sampleEnd
```
{kotlin-runnable="true" id="serialize-encode-default"}

### `@Required` 어노테이션을 사용하여 필수 프로퍼티로 지정 {id="make-properties-required-with-the-required-annotation"}

프로퍼티에 [`@Required`](https://kotlinlang.org/api/kotlinx.serialization/kotlinx-serialization-core/kotlinx.serialization/-required/) 어노테이션을 추가하여 입력 시 필수 프로퍼티로 만들 수 있습니다.
이렇게 하면 [기본값](#set-default-values-for-optional-properties)이 있더라도 입력 데이터에 해당 프로퍼티가 반드시 포함되어야 합니다.

```kotlin
// 직렬화 라이브러리의 선언을 import합니다.
import kotlinx.serialization.*
import kotlinx.serialization.json.*
import kotlinx.serialization.Required

//sampleStart
@Serializable
// language 프로퍼티를 필수로 표시합니다.
data class Project(val name: String, @Required val language: String = "Kotlin")

fun main() {
    val data = Json.decodeFromString<Project>("""
        {"name":"kotlinx.serialization"}
    """)
    println(data)
    // MissingFieldException
}
//sampleEnd
```
{kotlin-runnable="true" id="required-annotation-example"}

## 클래스 직렬화 커스터마이징 {id="customize-class-serialization"}

Kotlin 직렬화는 클래스가 직렬화되는 방식을 수정할 수 있는 몇 가지 방법을 제공합니다.
이 섹션에서는 프로퍼티 이름 커스터마이징, 프로퍼티 포함 여부 제어 등의 기법을 다룹니다.

### 시리얼 이름(Serial name) 커스터마이징 {id="customize-serial-names"}

기본적으로 JSON과 같은 직렬화 출력의 프로퍼티 이름은 소스 코드의 이름과 일치합니다.

[`@SerialName`](https://kotlinlang.org/api/kotlinx.serialization/kotlinx-serialization-core/kotlinx.serialization/-serial-name/) 어노테이션을 사용하면 _시리얼 이름(serial name)_이라고 부르는 이 이름을 커스터마이징할 수 있습니다.
직렬화된 출력에서 프로퍼티 이름을 더 명확하게 표현하고자 할 때 사용할 수 있습니다.

```kotlin
// 직렬화 라이브러리의 선언을 import합니다.
import kotlinx.serialization.*
import kotlinx.serialization.json.*

//sampleStart
@Serializable
// @SerialName을 사용하여 lang 프로퍼티를 language로 변경합니다.
class Project(val name: String, @SerialName("language") val lang: String)

fun main() {
    val data = Project("kotlinx.serialization", "Kotlin")
    // JSON 출력에 더 명확한 프로퍼티 이름이 출력됩니다.
    println(Json.encodeToString(data))
    // {"name":"kotlinx.serialization","language":"Kotlin"}
}
//sampleEnd
```
{kotlin-runnable="true" id="serial-names"}

### 직렬화를 위한 생성자 프로퍼티 정의 {id="define-constructor-properties-for-serialization"}

`@Serializable`이 지정된 클래스는 기본 생성자(primary constructor)의 모든 파라미터를 프로퍼티로 선언해야 합니다.

프로퍼티에 값을 할당하기 전에 추가적인 초기화 로직을 수행해야 한다면 [보조 생성자(secondary constructor)](classes.md#secondary-constructors)를 사용하세요.
기본 생성자는 `private`으로 유지하면서 프로퍼티 초기화를 처리할 수 있습니다.

다음은 보조 생성자가 문자열을 두 개의 값으로 파싱한 후, 이를 직렬화를 위한 기본 생성자로 전달하는 예시입니다.

```kotlin
// 직렬화 라이브러리의 선언을 import합니다.
import kotlinx.serialization.*
import kotlinx.serialization.json.*

//sampleStart
@Serializable
class Project private constructor(val owner: String, val name: String) {
    // path 문자열을 사용하여 Project 객체를 생성합니다.
    constructor(path: String) : this(
        owner = path.substringBefore('/'),
        name = path.substringAfter('/')
    )

    val path: String
        get() = "$owner/$name"
}
fun main() {
    println(Json.encodeToString(Project("kotlin/kotlinx.serialization")))
    // {"owner":"kotlin","name":"kotlinx.serialization"}
}
//sampleEnd
```
{kotlin-runnable="true" id="serialize-constructor-properties"}

### 기본 생성자에서 데이터 유효성 검사 {id="validate-data-in-the-primary-constructor"}

역직렬화 후, `kotlinx.serialization` 플러그인은 인스턴스를 생성할 때와 마찬가지로 클래스의 [초기화 블록(`init` 블록)](classes.md#initializer-blocks)을 실행합니다.
이를 통해 역직렬화 중에 생성자 파라미터의 유효성을 검사하고 유효하지 않은 데이터를 거부할 수 있습니다.

다음은 예시입니다.

```kotlin
// 직렬화 라이브러리의 선언을 import합니다.
import kotlinx.serialization.*
import kotlinx.serialization.json.*

//sampleStart
@Serializable
class Project(val name: String) {
    // name이 비어있지 않은지 검증합니다.
    init {
        require(name.isNotEmpty()) { "name cannot be empty" }
    }
}

fun main() {
    val data = Json.decodeFromString<Project>("""
        {"name":""}
    """)
    println(data)
    // Exception in thread "main" java.lang.IllegalArgumentException: name cannot be empty
}
//sampleEnd
```
{kotlin-runnable="true" id="validate-constructor-example"}

### `@Transient` 어노테이션으로 프로퍼티 제외 {id="exclude-properties-with-the-transient-annotation"}

[`@Transient`](https://kotlinlang.org/api/kotlinx.serialization/kotlinx-serialization-core/kotlinx.serialization/-transient/) 어노테이션을 사용하여 직렬화에서 프로퍼티를 제외할 수 있습니다.
Transient 프로퍼티는 반드시 기본값을 가져야 합니다.

입력 데이터에 transient 프로퍼티에 대한 값을 명시적으로 지정하면 기본값과 일치하더라도 `JsonDecodingException`이 발생합니다.

```kotlin
// 직렬화 라이브러리의 선언을 import합니다.
import kotlinx.serialization.*
import kotlinx.serialization.Transient
import kotlinx.serialization.json.*

//sampleStart
@Serializable
// language 프로퍼티를 직렬화에서 제외합니다.
data class Project(val name: String, @Transient val language: String = "Kotlin")

fun main() {
    // 입력값이 기본값과 일치하더라도 예외가 발생합니다.
    val data = Json.decodeFromString<Project>("""
        {"name":"kotlinx.serialization","language":"Kotlin"}
    """)
    println(data)
    // JsonDecodingException
}
//sampleEnd
```
{kotlin-runnable="true" validate="false" id="transient-annotation-example"}

> `@Transient` 어노테이션이 지정된 키를 포함하여 JSON의 알 수 없는 키로 인해 발생하는 예외를 방지하려면 [`ignoreUnknownKeys`](https://kotlinlang.org/api/kotlinx.serialization/kotlinx-serialization-json/kotlinx.serialization.json/-json-builder/ignore-unknown-keys.html) 설정 프로퍼티를 활성화하세요.
> 자세한 내용은 [알 수 없는 키 무시](serialization-json-configuration.md#ignore-unknown-keys) 섹션을 참조하세요.
>
{style="tip"}

## 다음 단계 {id="what-s-next"}

* [JSON 직렬화 개요](serialization-configure-json-serialization.md)에서 더 복잡한 JSON 직렬화 시나리오를 살펴보세요.
* [직렬화기 생성 및 사용](serialization-create-and-use-serializers.md)에서 생성된 직렬화기를 가져오고, 커스텀 직렬화기를 만들며, 직렬화기를 적용하는 방법을 알아보세요.