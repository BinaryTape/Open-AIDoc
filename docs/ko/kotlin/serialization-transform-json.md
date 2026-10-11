[//]: # (title: JSON 구조 변환)
<primary-label ref="advanced"/>

직렬화 중에 생성되는 JSON의 구조와 내용을 제어하기 위해 [커스텀 직렬화기(custom serializer)](serialization-create-and-use-serializers.md#create-custom-serializers)를 만들 수 있습니다.
값을 감싸거나(wrapping) 배열을 푸는(unwrapping) 것과 같은 작은 조정의 경우, [`JsonTransformingSerializer`](https://kotlinlang.org/api/kotlinx.serialization/kotlinx-serialization-json/kotlinx.serialization.json/-json-transforming-serializer/) 클래스를 사용하면 [`Encoder`](https://kotlinlang.org/api/kotlinx.serialization/kotlinx-serialization-core/kotlinx.serialization.encoding/-encoder/)나 [`Decoder`](https://kotlinlang.org/api/kotlinx.serialization/kotlinx-serialization-core/kotlinx.serialization.encoding/-decoder/)를 수동으로 다루는 대신 JSON 요소 트리(JSON element tree)를 직접 조작하여 JSON을 훨씬 간단하게 수정할 수 있습니다.

> 이 섹션은 [직렬화기 생성 및 사용](serialization-create-and-use-serializers.md)에서 설명한 개념을 기반으로 합니다.
> 커스텀 직렬화기에 익숙하지 않다면 해당 문서를 먼저 읽어보는 것을 권장합니다.
>
{style="note"}

`JsonTransformingSerializer`는 [`KSerializer`](https://kotlinlang.org/api/kotlinx.serialization/kotlinx-serialization-core/kotlinx.serialization/-k-serializer/) 인터페이스를 구현하는 JSON 전용 추상 직렬화기입니다.
이 클래스는 직렬화 또는 역직렬화 전에 JSON 요소 트리를 조정하기 위해 재정의할 수 있는 [`transformSerialize()`](https://kotlinlang.org/api/kotlinx.serialization/kotlinx-serialization-json/kotlinx.serialization.json/-json-transforming-serializer/transform-serialize.html) 및 [`transformDeserialize()`](https://kotlinlang.org/api/kotlinx.serialization/kotlinx-serialization-json/kotlinx.serialization.json/-json-transforming-serializer/transform-deserialize.html) 함수를 제공합니다.

JSON 구조를 변환하는 것 외에도, `JsonContentPolymorphicSerializer`를 사용하여 [JSON 내용을 기반으로 적절한 다형성 클래스를 선택](#select-the-appropriate-polymorphic-class-based-on-the-json-content)할 수도 있습니다.

## JSON 구조 수정 {id="modify-json-structure"}

JSON 요소 트리를 변환하여 JSON 구조를 조정할 수 있습니다.
다음 예제들은 배열을 감싸거나 풀기, 특정 프로퍼티 생략 등과 같은 일반적인 사용 사례를 보여줍니다.

### 역직렬화 중 단일 객체를 배열로 감싸기 {id="wrap-a-single-object-in-an-array-during-deserialization"}

일부 API는 항목이 하나일 때는 단일 JSON 객체를 반환하고, 항목이 여러 개일 때는 JSON 배열을 반환합니다.
두 경우 모두 [`List`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/-list/)로 역직렬화하려면 다음과 같이 합니다.

1. `JsonTransformingSerializer`의 서브클래스를 만들고 생성자에 직렬화기를 지정합니다.
   표준 변환 로직을 사용하려면 대상 타입의 기본 직렬화기(예: 리스트의 경우 [`ListSerializer()`](https://kotlinlang.org/api/kotlinx.serialization/kotlinx-serialization-core/kotlinx.serialization.builtins/-list-serializer.html))를 전달합니다.
2. `transformDeserialize()` 함수를 재정의합니다.

예제는 다음과 같습니다.

```kotlin
// 직렬화 라이브러리의 선언들을 임포트합니다.
import kotlinx.serialization.*
import kotlinx.serialization.builtins.*
import kotlinx.serialization.json.*

//sampleStart
@Serializable
data class Project(
    val name: String,
    // users 프로퍼티의 직렬화를 처리하도록 UserListSerializer를 지정합니다.
    @Serializable(with = UserListSerializer::class)
    val users: List<User>
)

@Serializable
data class User(val name: String)

// 기본 List 직렬화기의 결과를 변환하는 직렬화기를 생성합니다.
object UserListSerializer : JsonTransformingSerializer<List<User>>(ListSerializer(User.serializer())) {
    override fun transformDeserialize(element: JsonElement): JsonElement =
        // 요소가 JsonArray가 아닌 경우, 단일 요소 배열로 감쌉니다.
        if (element !is JsonArray) JsonArray(listOf(element)) else element
}

fun main() {
    println(Json.decodeFromString<Project>("""
        {"name":"kotlinx.serialization","users":{"name":"kotlin"}}
    """))
    // Project(name=kotlinx.serialization, users=[User(name=kotlin)])
   
    println(Json.decodeFromString<Project>("""
        {"name":"kotlinx.serialization","users":[{"name":"kotlin"},{"name":"jetbrains"}]}
    """))
    // Project(name=kotlinx.serialization, users=[User(name=kotlin), User(name=jetbrains)])
}
//sampleEnd
```
{kotlin-runnable="true"}

### 직렬화 중 단일 요소 배열 풀기 {id="unwrap-a-single-element-array-during-serialization"}

직렬화할 때 단일 요소 리스트를 단일 JSON 객체로 풀려면 `transformSerialize()` 함수를 재정의합니다.

```kotlin
// 직렬화 라이브러리의 선언들을 임포트합니다.
import kotlinx.serialization.*
import kotlinx.serialization.builtins.*
import kotlinx.serialization.json.*

//sampleStart
@Serializable
data class Project(
    val name: String,
    // users 프로퍼티의 직렬화를 처리하도록 UserListSerializer를 지정합니다.
    @Serializable(with = UserListSerializer::class)
    val users: List<User>
)

@Serializable
data class User(val name: String)

// 기본 List 직렬화기의 결과를 변환하는 직렬화기를 생성합니다.
object UserListSerializer : JsonTransformingSerializer<List<User>>(ListSerializer(User.serializer())) {

    override fun transformSerialize(element: JsonElement): JsonElement {
        require(element is JsonArray)
        // 단일 요소 리스트를 단일 JSON 객체로 풉니다.
        return element.singleOrNull() ?: element
    }
}
  
fun main() {
    val data = Project("kotlinx.serialization", listOf(User("kotlin")))
    println(Json.encodeToString(data))
    // {"name":"kotlinx.serialization","users":{"name":"kotlin"}}
}
//sampleEnd
```
{kotlin-runnable="true"}

### 직렬화 중 특정 프로퍼티 생략 {id="omit-specific-properties-during-serialization"}

[기본값을 지정](serialization-customization-options.md#set-default-values-for-optional-properties)할 수 없지만, 프로퍼티가 특정 값을 가질 때 생략하고 싶다면 `JsonTransformingSerializer`를 사용합니다.

1. `JsonTransformingSerializer`의 서브클래스를 만들고 생성자에 직렬화기를 지정합니다.
2. `transformSerialize()` 함수를 재정의합니다.

다음은 `Project` 클래스에 `language` 프로퍼티가 있고, 해당 값이 `"Kotlin"`일 때 생략하는 예제입니다.

```kotlin
// 직렬화 라이브러리의 선언들을 임포트합니다.
import kotlinx.serialization.*
import kotlinx.serialization.builtins.*
import kotlinx.serialization.json.*

//sampleStart
@Serializable
class Project(val name: String, val language: String)

// language 프로퍼티가 "Kotlin"과 같으면 생략하는 커스텀 직렬화기를 생성합니다.
object ProjectSerializer : JsonTransformingSerializer<Project>(Project.serializer()) {
    override fun transformSerialize(element: JsonElement): JsonElement =
        // 값이 "Kotlin"인 경우 language 프로퍼티를 생략합니다.
        JsonObject(element.jsonObject.filterNot {
            (k, v) -> k == "language" && v.jsonPrimitive.content == "Kotlin"
        })
}

fun main() {
    val data = Project("kotlinx.serialization", "Kotlin")

    // 기본 직렬화기를 사용합니다.
    println(Json.encodeToString(data))
    // {"name":"kotlinx.serialization","language":"Kotlin"}

    // 커스텀 직렬화기를 적용하여 language 프로퍼티를 생략합니다.
    println(Json.encodeToString(ProjectSerializer, data))
    // {"name":"kotlinx.serialization"}
}
//sampleEnd
```
{kotlin-runnable="true"}

> 객체를 직접 직렬화할 때 커스텀 직렬화 로직이 적용되도록 하려면 커스텀 직렬화기를 `encodeToString()` 함수에 명시적으로 전달해야 합니다. 자세한 내용은 [직렬화기 수동 전달](serialization-create-and-use-serializers.md#pass-a-serializer-manually)을 참조하세요.
>
{style="note"}

## JSON 내용을 기반으로 적절한 다형성 클래스 선택 {id="select-the-appropriate-polymorphic-class-based-on-the-json-content"}

[다형성 직렬화(polymorphic serialization)](serialization-polymorphism.md)에서 JSON은 대개 역직렬화 시 구체적인 서브타입을 식별하는 전용 _클래스 판별자(class discriminator)_ 프로퍼티를 포함합니다.

JSON 입력에 클래스 판별자가 없는 경우, [`JsonContentPolymorphicSerializer`](https://kotlinlang.org/api/kotlinx.serialization/kotlinx-serialization-json/kotlinx.serialization.json/-json-content-polymorphic-serializer/)를 사용하여 JSON 구조로부터 타입을 추론할 수 있습니다.
이 직렬화기를 사용하면 `selectDeserializer()` 함수를 재정의하여 JSON 내용을 기반으로 올바른 역직렬화기를 선택할 수 있습니다.

다음은 모든 값이 `name` 프로퍼티를 가진 공통 기본 타입을 공유하는 예제입니다.

```kotlin
@Serializable
abstract class Project {
    abstract val name: String
}

@Serializable
data class BasicProject(override val name: String): Project()

@Serializable
data class OwnedProject(override val name: String, val owner: String) : Project()
```

> 이 예제에서는 직렬화기가 JSON 내용을 기반으로 사용할 서브타입을 선택하므로 클래스 계층 구조에 `sealed` 클래스를 사용할 필요가 없습니다.
>
{style="note"}

`BasicProject`와 `OwnedProject`를 구별하려면 `selectDeserializer()` 함수를 재정의합니다.
이 함수를 사용하여 JSON 객체에 `owner` 키가 포함되어 있는지 확인하고 해당 직렬화기를 반환할 수 있습니다.

```kotlin
// "owner"의 존재 여부를 기반으로 역직렬화기를 선택하는 커스텀 직렬화기를 생성합니다.
object ProjectSerializer : JsonContentPolymorphicSerializer<Project>(Project::class) {
    override fun selectDeserializer(element: JsonElement) = when {
        // JSON 객체에 "owner" 키가 포함되어 있으면 OwnedProject 직렬화기를 선택합니다.
        "owner" in element.jsonObject -> OwnedProject.serializer()
        else -> BasicProject.serializer()
    }
}
```

이 직렬화기를 사용하여 데이터를 직렬화할 때 Kotlin 직렬화는 값의 실제 런타임 타입의 직렬화기를 사용합니다.
이는 [`SerializersModule`에 지정된 직렬화기](serialization-polymorphism.md#serialize-closed-polymorphic-classes)이거나 기본 직렬화기일 수 있습니다.

```kotlin
// 직렬화 라이브러리의 선언들을 임포트합니다.
import kotlinx.serialization.*
import kotlinx.serialization.builtins.*
import kotlinx.serialization.json.*

@Serializable
abstract class Project {
    abstract val name: String
}

@Serializable
data class BasicProject(override val name: String): Project()

@Serializable
data class OwnedProject(override val name: String, val owner: String) : Project()

// "owner"의 존재 여부를 기반으로 역직렬화기를 선택하는 커스텀 직렬화기를 생성합니다.
object ProjectSerializer : JsonContentPolymorphicSerializer<Project>(Project::class) {
    override fun selectDeserializer(element: JsonElement) = when {
        // JSON 객체에 "owner" 키가 포함되어 있으면 OwnedProject 직렬화기를 선택합니다.
        "owner" in element.jsonObject -> OwnedProject.serializer()
        else -> BasicProject.serializer()
    }
}

//sampleStart
fun main() {
    val data = listOf(
        OwnedProject("kotlinx.serialization", "kotlin"),
        BasicProject("example")
    )
    // JSON 출력에 클래스 판별자가 없습니다.
    val string = Json.encodeToString(ListSerializer(ProjectSerializer), data)

    println(string)
    // [{"name":"kotlinx.serialization","owner":"kotlin"},{"name":"example"}]

    println(Json.decodeFromString(ListSerializer(ProjectSerializer), string))
    // [OwnedProject(name=kotlinx.serialization, owner=kotlin), BasicProject(name=example)]
}
//sampleEnd
```
{kotlin-runnable="true"}

## 기본 직렬화기에 커스텀 동작 추가 {id="add-custom-behavior-to-the-default-serializer"}
<primary-label ref="experimental-opt-in"/>

기본 직렬화기를 위임(delegate)으로 사용하여 Kotlin 직렬화가 생성하는 기본 직렬화기에 커스텀 동작을 추가할 수 있습니다.

이렇게 하려면 직렬화 가능한 클래스에 [실험적(Experimental)](components-stability.md#stability-levels-explained) 기능인 [`@KeepGeneratedSerializer`](https://kotlinlang.org/api/kotlinx.serialization/kotlinx-serialization-core/kotlinx.serialization/-keep-generated-serializer/) 어노테이션을 달고, 커스텀 `JsonTransformingSerializer`의 기본 직렬화기로 자동 생성된 `generatedSerializer()`를 사용합니다.

다음은 대상 클래스에서 예상하는 단일 `name` 프로퍼티로 여러 입력 프로퍼티를 결합하여 역직렬화 중에 JSON 구조를 업데이트하는 예제입니다.

```kotlin
// 직렬화 라이브러리의 선언들을 임포트합니다.
import kotlinx.serialization.*
import kotlinx.serialization.json.*

//sampleStart
@OptIn(ExperimentalSerializationApi::class)
@KeepGeneratedSerializer
@Serializable(with = UserNameSerializer::class)
// name 프로퍼티를 가진 타입을 정의합니다.
data class User(val name: String)

// 역직렬화 중 입력 프로퍼티들을 결합하도록 기본 직렬화기에 커스텀 로직을 추가합니다.
object UserNameSerializer : JsonTransformingSerializer<User>(User.generatedSerializer()) {
    override fun transformDeserialize(element: JsonElement): JsonElement {
        val jsonObject = element.jsonObject
        val first = jsonObject["firstName"]?.jsonPrimitive?.content
        val last = jsonObject["lastName"]?.jsonPrimitive?.content

        // 입력이 예상된 구조와 일치하지 않는 경우
        // 입력 프로퍼티들을 name 프로퍼티로 결합합니다.
        return if (first != null && last != null) {
            JsonObject(mapOf("name" to JsonPrimitive("$first $last")))
        } else {
            jsonObject
        }
    }
}

fun main() {
    // name 프로퍼티가 여러 입력 프로퍼티로 나뉘어 있는 JSON을 역직렬화합니다.
   val fromExternalData = Json.decodeFromString<User>(
        """{"firstName":"John","lastName":"Smith"}"""
    )
    println(fromExternalData)
    // User(name=John Smith)

    // name 프로퍼티가 예상 구조와 일치하는 JSON을 역직렬화합니다.
    val fromInternalData = Json.decodeFromString<User>(
        """{"name":"John Smith"}"""
    )
    println(fromInternalData)
    // User(name=John Smith)
}
//sampleEnd
```
{kotlin-runnable="true"}

## JSON에서 커스텀 직렬화 로직 구현 {id="implement-custom-serialization-logic-in-json"}
<primary-label ref="experimental-general"/>

`JsonTransformingSerializer` 또는 `JsonContentPolymorphicSerializer`가 제공하는 변환 함수로 충분하지 않다면, 자체 [`KSerializer`](https://kotlinlang.org/api/kotlinx.serialization/kotlinx-serialization-core/kotlinx.serialization/-k-serializer/) 클래스를 정의하여 커스텀 직렬화 로직을 구현할 수 있습니다.

`serialize()` 및 `deserialize()` 함수를 직접 재정의하여 값이 직렬화 및 역직렬화되는 방식을 완벽하게 제어할 수 있습니다.

JSON에 대한 커스텀 직렬화 로직을 구현할 때, `Encoder`를 [`JsonEncoder`](https://kotlinlang.org/api/kotlinx.serialization/kotlinx-serialization-json/kotlinx.serialization.json/-json-encoder/)로, `Decoder`를 [`JsonDecoder`](https://kotlinlang.org/api/kotlinx.serialization/kotlinx-serialization-json/kotlinx.serialization.json/-json-decoder/)로 캐스팅하여 JSON 전용 함수인 [`decodeJsonElement()`](https://kotlinlang.org/api/kotlinx.serialization/kotlinx-serialization-json/kotlinx.serialization.json/-json-decoder/decode-json-element.html) 및 [`encodeToJsonElement()`](https://kotlinlang.org/api/kotlinx.serialization/kotlinx-serialization-json/kotlinx.serialization.json/encode-to-json-element.html)를 호출할 수 있습니다.
이러한 함수를 사용하면 디코더가 현재 처리 중인 값에서 JSON 요소를 가져오거나 인코더에 JSON 요소를 삽입할 수 있습니다.

`JsonDecoder`와 `JsonEncoder`는 모두 활성 `Json` 인스턴스에 대한 접근을 제공하는 `json` 프로퍼티를 노출하며, 이 인스턴스는 값이 인코딩 및 디코딩되는 방식을 제어합니다.
해당 인스턴스를 통해 [`encodeToJsonElement()`](https://kotlinlang.org/api/kotlinx.serialization/kotlinx-serialization-json/kotlinx.serialization.json/encode-to-json-element.html) 및 [`decodeFromJsonElement()`](https://kotlinlang.org/api/kotlinx.serialization/kotlinx-serialization-json/kotlinx.serialization.json/decode-from-json-element.html)를 사용하여 [`JsonElement`](https://kotlinlang.org/api/kotlinx.serialization/kotlinx-serialization-json/kotlinx.serialization.json/-json-element/) 인스턴스와 Kotlin 객체 간을 변환할 수 있습니다.

이러한 API를 사용하여 2단계 변환을 구현할 수 있습니다.

* 입력을 먼저 `JsonElement`로 디코딩한 다음 해당 요소를 Kotlin 값으로 변환합니다.
* Kotlin 값을 먼저 `JsonElement`로 변환한 다음 인코더를 사용하여 해당 요소를 인코딩합니다.

`Response` 타입의 값이 JSON에서 인코딩 및 역직렬화되는 방식을 완전히 제어하는 커스텀 `KSerializer` 예제를 살펴보겠습니다.
이 직렬화기는 `Ok` 응답을 JSON 값으로 직접 인코딩하고, `Error` 응답은 오류 메시지를 포함하는 JSON 객체로 인코딩합니다.

```kotlin
// 직렬화 라이브러리의 선언들을 임포트합니다.
import kotlinx.serialization.*
import kotlinx.serialization.builtins.*
import kotlinx.serialization.json.*
import kotlinx.serialization.descriptors.*
import kotlinx.serialization.encoding.*

// API 응답을 위한 봉인된 클래스(sealed class)를 정의합니다.
@Serializable(with = ResponseSerializer::class)
sealed class Response<out T> {
    data class Ok<out T>(val data: T) : Response<T>()
    data class Error(val message: String) : Response<Nothing>()
}

// Response에 대한 커스텀 직렬화 로직을 구현합니다.
class ResponseSerializer<T>(
    private val dataSerializer: KSerializer<T>
) : KSerializer<Response<T>> {
    override val descriptor: SerialDescriptor = buildClassSerialDescriptor("Response") {
        element("Ok", dataSerializer.descriptor)
        element("Error", buildClassSerialDescriptor("Error") {
            element<String>("message")
        })
    }
    // JSON에서 Response 값을 역직렬화합니다.
    override fun deserialize(decoder: Decoder): Response<T> {
        // 디코더가 JsonDecoder인지 확인합니다.
        require(decoder is JsonDecoder)

        // 입력을 JsonElement로 디코딩합니다.
        val element = decoder.decodeJsonElement()

        // JsonElement를 해당하는 Response 값으로 변환합니다.
        return if (element is JsonObject && "error" in element) {
            Response.Error(element["error"]!!.jsonPrimitive.content)
        } else {
            Response.Ok(
                decoder.json.decodeFromJsonElement(dataSerializer, element)
            )
        }
    }

    // Response 값을 JSON으로 직렬화합니다.
    override fun serialize(encoder: Encoder, value: Response<T>) {
        // 인코더가 JsonEncoder인지 확인합니다.
        require(encoder is JsonEncoder)

        // Response 값을 JsonElement로 변환합니다.
        val element = when (value) {
            is Response.Ok ->
                encoder.json.encodeToJsonElement(dataSerializer, value.data)
            is Response.Error ->
                buildJsonObject { put("error", value.message) }
        }

        // 인코더를 사용하여 JsonElement를 인코딩합니다.
        encoder.encodeJsonElement(element)
    }
}

@Serializable
data class Project(val name: String)

fun main() {
    val responses = listOf(
        Response.Ok(Project("kotlinx.serialization")),
        Response.Error("Not found")
    )

    val json = Json.encodeToString(responses)
    println(json)
    // [{"name":"kotlinx.serialization"},{"error":"Not found"}]

    println(Json.decodeFromString<List<Response<Project>>>(json))
    // [Ok(data=Project(name=kotlinx.serialization)), Error(message=Not found)]
}
```
{kotlin-runnable="true"}

### 알 수 없는 JSON 속성 보존 {id="preserve-unknown-json-attributes"}

커스텀 JSON 전용 직렬화기의 일반적인 사용 사례는 직렬화 가능한 클래스에 정의되지 않은 JSON 프로퍼티를 입력에서 보존하는 것입니다.
기본적으로 이러한 프로퍼티는 역직렬화 중에 무시됩니다.

이러한 JSON 프로퍼티를 보존하려면 역직렬화 중에 대상 클래스에 정의되지 않은 모든 프로퍼티를 전용 [`JsonObject`](https://kotlinlang.org/api/kotlinx.serialization/kotlinx-serialization-json/kotlinx.serialization.json/-json-object/) 필드로 수집하는 커스텀 JSON 전용 직렬화기를 구현합니다.
이렇게 하면 원본 JSON 구조를 수정하지 않고도 직렬화 가능한 클래스에서 해당 프로퍼티들을 보존할 수 있습니다.

예제는 다음과 같습니다.

```kotlin
// 직렬화 라이브러리의 선언들을 임포트합니다.
import kotlinx.serialization.*
import kotlinx.serialization.builtins.*
import kotlinx.serialization.json.*
import kotlinx.serialization.descriptors.*
import kotlinx.serialization.encoding.*

//sampleStart
data class UnknownProject(val name: String, val details: JsonObject)

object UnknownProjectSerializer : KSerializer<UnknownProject> {
    override val descriptor: SerialDescriptor = buildClassSerialDescriptor("UnknownProject") {
        element<String>("name")
        element<JsonElement>("details")
    }

    override fun deserialize(decoder: Decoder): UnknownProject {
        // 디코더가 JSON 전용인지 확인합니다.
        val jsonInput = decoder as? JsonDecoder ?: error("Can be deserialized only by JSON")

        // 전체 내용을 JSON으로 읽어옵니다.
        val json = jsonInput.decodeJsonElement().jsonObject

        // name 프로퍼티를 추출하고 제거합니다.
        val name = json.getValue("name").jsonPrimitive.content
        val details = json.toMutableMap()
        details.remove("name")
        return UnknownProject(name, JsonObject(details))
    }

    override fun serialize(encoder: Encoder, value: UnknownProject) {
        error("Serialization is not supported")
    }
}

fun main() {
    // 직렬화 가능한 클래스에 정의되지 않은 프로퍼티가 포함된 JSON을 UnknownProject로 역직렬화합니다.
    println(Json.decodeFromString(UnknownProjectSerializer, """{"type":"unknown","name":"example","maintainer":"Unknown","license":"Apache 2.0"}"""))
    // UnknownProject(name=example, details={"type":"unknown","maintainer":"Unknown","license":"Apache 2.0"})

}
//sampleEnd
```
{kotlin-runnable="true"}

이 예제에서 보존된 JSON 프로퍼티는 직렬화 가능한 클래스에 정의된 프로퍼티와 마찬가지로 입력 JSON 객체 내에서 동일한 레벨에 유지됩니다.

## 다음 단계 {id="what-s-next"}

* [다형성 클래스를 직렬화](serialization-polymorphism.md)하고 공유 계층 내에서 다양한 타입의 객체를 처리하는 방법을 알아보세요.
* [커스텀 직렬화 형식](serialization-custom-formats.md)에서 커스텀 포맷을 만드는 방법을 알아보세요.
* [CBOR](serialization-cbor.md) 및 [ProtoBuf](serialization-protobuf.md)와 같은 대체 직렬화 형식을 살펴보세요.