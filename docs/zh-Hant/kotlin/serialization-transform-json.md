[//]: # (title: 轉換 JSON 結構)
<primary-label ref="advanced"/>

若要控制序列化期間產生的 JSON 結構與內容，你可以建立[自訂序列化程式](serialization-create-and-use-serializers.md#create-custom-serializers)。
對於較小的調整（例如包裝值或解包陣列），[`JsonTransformingSerializer`](https://kotlinlang.org/api/kotlinx.serialization/kotlinx-serialization-json/kotlinx.serialization.json/-json-transforming-serializer/) 類別提供了一種更簡單的方式來修改 JSON，直接操作 JSON 元素樹，而無需手動使用 [`Encoder`](https://kotlinlang.org/api/kotlinx.serialization/kotlinx-serialization-core/kotlinx.serialization.encoding/-encoder/)
或 [`Decoder`](https://kotlinlang.org/api/kotlinx.serialization/kotlinx-serialization-core/kotlinx.serialization.encoding/-decoder/)。

> 這些章節建立在[建立與使用序列化程式](serialization-create-and-use-serializers.md)中說明的概念之上。
> 如果你還不熟悉自訂序列化程式，建議先閱讀該頁面。
>
{style="note"}

`JsonTransformingSerializer` 是一個 JSON 專用的抽象序列化程式，實作了 [`KSerializer`](https://kotlinlang.org/api/kotlinx.serialization/kotlinx-serialization-core/kotlinx.serialization/-k-serializer/) 介面。
它提供了 [`transformSerialize()`](https://kotlinlang.org/api/kotlinx.serialization/kotlinx-serialization-json/kotlinx.serialization.json/-json-transforming-serializer/transform-serialize.html) 與 [`transformDeserialize()`](https://kotlinlang.org/api/kotlinx.serialization/kotlinx-serialization-json/kotlinx.serialization.json/-json-transforming-serializer/transform-deserialize.html) 函式，你可以覆寫它們以在序列化或還原序列化之前調整 JSON 元素樹。

除了轉換 JSON 結構之外，你還可以使用 `JsonContentPolymorphicSerializer` 根據 [JSON 內容選取合適的多型類別](#select-the-appropriate-polymorphic-class-based-on-the-json-content)。

## 修改 JSON 結構 {id="modify-json-structure"}

你可以透過轉換 JSON 元素樹來調整 JSON 結構。
以下範例示範了常見的使用案例，例如包裝或解包陣列，以及省略特定屬性。

### 在還原序列化期間將單一物件包裝至陣列中 {id="wrap-a-single-object-in-an-array-during-deserialization"}

某些 API 在處理單一項目時會回傳單一 JSON 物件，而在處理多個項目時則會回傳 JSON 陣列。
若要將這兩種情況都還原序列化為 [`List`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/-list/)：

1. 建立 `JsonTransformingSerializer` 的子類別，並在其建構函式中指定一個序列化程式。
   若要使用標準轉換邏輯，請傳入目標型別的預設序列化程式，例如清單適用的 [`ListSerializer()`](https://kotlinlang.org/api/kotlinx.serialization/kotlinx-serialization-core/kotlinx.serialization.builtins/-list-serializer.html)。
2. 覆寫 `transformDeserialize()` 函式。

範例如下：

```kotlin
// Imports declarations from the serialization library
import kotlinx.serialization.*
import kotlinx.serialization.builtins.*
import kotlinx.serialization.json.*

//sampleStart
@Serializable
data class Project(
    val name: String,
    // Specifies UserListSerializer to handle the serialization of the users property
    @Serializable(with = UserListSerializer::class)
    val users: List<User>
)

@Serializable
data class User(val name: String)

// Creates a serializer that transforms the results of the default List serializer
object UserListSerializer : JsonTransformingSerializer<List<User>>(ListSerializer(User.serializer())) {
    override fun transformDeserialize(element: JsonElement): JsonElement =
        // If the element is not a JsonArray, wraps it into a single-element array
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

### 在序列化期間解包單元素陣列 {id="unwrap-a-single-element-array-during-serialization"}

若要在序列化期間將單元素清單解包為單一 JSON 物件，請覆寫 `transformSerialize()` 函式：

```kotlin
// Imports declarations from the serialization library
import kotlinx.serialization.*
import kotlinx.serialization.builtins.*
import kotlinx.serialization.json.*

//sampleStart
@Serializable
data class Project(
    val name: String,
    // Specifies UserListSerializer to handle serialization of the users property
    @Serializable(with = UserListSerializer::class)
    val users: List<User>
)

@Serializable
data class User(val name: String)

// Creates a serializer that transforms the results of the default List serializer
object UserListSerializer : JsonTransformingSerializer<List<User>>(ListSerializer(User.serializer())) {

    override fun transformSerialize(element: JsonElement): JsonElement {
        require(element is JsonArray)
        // Unwraps single-element lists into a single JSON object
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

### 在序列化期間省略特定屬性 {id="omit-specific-properties-during-serialization"}

如果你無法[指定預設值](serialization-customization-options.md#set-default-values-for-optional-properties)，但仍希望當屬性具有特定值時予以省略，可以使用 `JsonTransformingSerializer`：

1. 建立 `JsonTransformingSerializer` 的子類別，並在其建構函式中指定一個序列化程式。
2. 覆寫 `transformSerialize()` 函式。

以下範例中，`Project` 類別具有一個 `language` 屬性，當其值為 `"Kotlin"` 時會被省略：

```kotlin
// Imports declarations from the serialization library
import kotlinx.serialization.*
import kotlinx.serialization.builtins.*
import kotlinx.serialization.json.*

//sampleStart
@Serializable
class Project(val name: String, val language: String)

// Creates a custom serializer that omits the language property if it's equal to "Kotlin"
object ProjectSerializer : JsonTransformingSerializer<Project>(Project.serializer()) {
    override fun transformSerialize(element: JsonElement): JsonElement =
        // Omits the language property if its value is "Kotlin"
        JsonObject(element.jsonObject.filterNot {
            (k, v) -> k == "language" && v.jsonPrimitive.content == "Kotlin"
        })
}

fun main() {
    val data = Project("kotlinx.serialization", "Kotlin")

    // Uses the default serializer
    println(Json.encodeToString(data))
    // {"name":"kotlinx.serialization","language":"Kotlin"}

    // Applies the custom serializer to omit the language property 
    println(Json.encodeToString(ProjectSerializer, data))
    // {"name":"kotlinx.serialization"}
}
//sampleEnd
```
{kotlin-runnable="true"}

> 直接序列化物件時，你需要明確地將自訂序列化程式傳遞給 `encodeToString()`
> 函式，以確保套用自訂序列化邏輯。如需詳細資訊，請參閱[手動傳遞序列化程式](serialization-create-and-use-serializers.md#pass-a-serializer-manually)。
>
{style="note"}

## 根據 JSON 內容選取合適的多型類別 {id="select-the-appropriate-polymorphic-class-based-on-the-json-content"}

在[多型序列化](serialization-polymorphism.md)中，JSON 通常會包含一個專用的*類別鑑別器 (class discriminator)* 屬性，用於在還原序列化期間識別具體的子型別。

如果輸入的 JSON 未包含類別鑑別器，你可以使用 [`JsonContentPolymorphicSerializer`](https://kotlinlang.org/api/kotlinx.serialization/kotlinx-serialization-json/kotlinx.serialization.json/-json-content-polymorphic-serializer/) 根據 JSON 的結構來推斷型別。
此序列化程式可讓你覆寫 `selectDeserializer()` 函式，以根據 JSON 內容選擇正確的序列化程式。

以下範例中，所有值都共用一個包含 `name` 屬性的通用基底型別：

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

> 在此範例中，序列化程式會根據 JSON 內容選擇要使用的子型別，因此你的類別階層結構中不需要使用 `sealed` 類別。
>
{style="note"}

若要區分 `BasicProject` 與 `OwnedProject`，請覆寫 `selectDeserializer()` 函式。
你可以使用此函式來檢查 JSON 物件是否包含 `owner` 鍵，並回傳相對應的序列化程式：

```kotlin
// Creates a custom serializer that selects deserializer based on the presence of "owner"
object ProjectSerializer : JsonContentPolymorphicSerializer<Project>(Project::class) {
    override fun selectDeserializer(element: JsonElement) = when {
        // Selects the OwnedProject serializer if the JSON object contains an "owner" key
        "owner" in element.jsonObject -> OwnedProject.serializer()
        else -> BasicProject.serializer()
    }
}
```

當你使用此序列化程式來序列化資料時，Kotlin 序列化會使用該值實際執行時期型別的序列化程式。
這可以是[在 `SerializersModule` 中指定的序列化程式](serialization-polymorphism.md#serialize-closed-polymorphic-classes)或預設序列化程式：

```kotlin
// Imports declarations from the serialization library
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

// Creates a custom serializer that selects deserializer based on the presence of "owner"
object ProjectSerializer : JsonContentPolymorphicSerializer<Project>(Project::class) {
    override fun selectDeserializer(element: JsonElement) = when {
        // Selects the OwnedProject serializer if the JSON object contains an "owner" key
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
    // No class discriminator in the JSON output
    val string = Json.encodeToString(ListSerializer(ProjectSerializer), data)

    println(string)
    // [{"name":"kotlinx.serialization","owner":"kotlin"},{"name":"example"}]

    println(Json.decodeFromString(ListSerializer(ProjectSerializer), string))
    // [OwnedProject(name=kotlinx.serialization, owner=kotlin), BasicProject(name=example)]
}
//sampleEnd
```
{kotlin-runnable="true"}

## 為預設序列化程式新增自訂行為 {id="add-custom-behavior-to-the-default-serializer"}
<primary-label ref="experimental-opt-in"/>

你可以將 Kotlin 序列化產生的預設序列化程式作為委託，為其新增自訂行為。

為此，請使用[實驗性 (Experimental)](components-stability.md#stability-levels-explained) 的 [`@KeepGeneratedSerializer`](https://kotlinlang.org/api/kotlinx.serialization/kotlinx-serialization-core/kotlinx.serialization/-keep-generated-serializer/) 註解標記可序列化類別，並在自訂的 `JsonTransformingSerializer` 中使用自動產生的 `generatedSerializer()` 作為基底序列化程式。

以下範例透過在還原序列化期間將多個輸入屬性合併為目標類別所需的單一 `name` 屬性，藉此更新 JSON 結構：

```kotlin
// Imports declarations from the serialization library
import kotlinx.serialization.*
import kotlinx.serialization.json.*

//sampleStart
@OptIn(ExperimentalSerializationApi::class)
@KeepGeneratedSerializer
@Serializable(with = UserNameSerializer::class)
// Defines a type with a name property
data class User(val name: String)

// Adds custom logic to the default serializer to combine input properties during deserialization
object UserNameSerializer : JsonTransformingSerializer<User>(User.generatedSerializer()) {
    override fun transformDeserialize(element: JsonElement): JsonElement {
        val jsonObject = element.jsonObject
        val first = jsonObject["firstName"]?.jsonPrimitive?.content
        val last = jsonObject["lastName"]?.jsonPrimitive?.content

        // Combines input properties into the name property
        // if the input doesn't match the expected structure
        return if (first != null && last != null) {
            JsonObject(mapOf("name" to JsonPrimitive("$first $last")))
        } else {
            jsonObject
        }
    }
}

fun main() {
    // Deserializes JSON where the name property is split across multiple input properties
   val fromExternalData = Json.decodeFromString<User>(
        """{"firstName":"John","lastName":"Smith"}"""
    )
    println(fromExternalData)
    // User(name=John Smith)

    // Deserializes JSON where the name property matches the expected structure
    val fromInternalData = Json.decodeFromString<User>(
        """{"name":"John Smith"}"""
    )
    println(fromInternalData)
    // User(name=John Smith)
}
//sampleEnd
```
{kotlin-runnable="true"}

## 在 JSON 中實作自訂序列化邏輯 {id="implement-custom-serialization-logic-in-json"}
<primary-label ref="experimental-general"/>

如果 `JsonTransformingSerializer` 或 `JsonContentPolymorphicSerializer` 提供的轉換函式不足以滿足需求，你可以透過定義自己的 [`KSerializer`](https://kotlinlang.org/api/kotlinx.serialization/kotlinx-serialization-core/kotlinx.serialization/-k-serializer/) 類別來實作自訂序列化邏輯。

你可以透過直接覆寫 `serialize()` 與 `deserialize()` 函式，完全掌控值的序列化與還原序列化方式。

為 JSON 實作自訂序列化邏輯時，你可以將 `Encoder` 轉換為 [`JsonEncoder`](https://kotlinlang.org/api/kotlinx.serialization/kotlinx-serialization-json/kotlinx.serialization.json/-json-encoder/)，並將 `Decoder` 轉換為 [`JsonDecoder`](https://kotlinlang.org/api/kotlinx.serialization/kotlinx-serialization-json/kotlinx.serialization.json/-json-decoder/)，以呼叫 JSON 專用函式 [`decodeJsonElement()`](https://kotlinlang.org/api/kotlinx.serialization/kotlinx-serialization-json/kotlinx.serialization.json/-json-decoder/decode-json-element.html) 和 [`encodeToJsonElement()`](https://kotlinlang.org/api/kotlinx.serialization/kotlinx-serialization-json/kotlinx.serialization.json/encode-to-json-element.html)。
這些函式可讓你從解碼器目前正在處理的值中擷取 JSON 元素，或將 JSON 元素插入其中。

`JsonDecoder` 與 `JsonEncoder` 都公開了一個 `json` 屬性，可用於存取作用中的 `Json` 執行個體，該執行個體控制著值的編碼與解碼方式。
透過該執行個體，你可以使用 [`encodeToJsonElement()`](https://kotlinlang.org/api/kotlinx.serialization/kotlinx-serialization-json/kotlinx.serialization.json/encode-to-json-element.html) 與 [`decodeFromJsonElement()`](https://kotlinlang.org/api/kotlinx.serialization/kotlinx-serialization-json/kotlinx.serialization.json/decode-from-json-element.html) 在 [`JsonElement`](https://kotlinlang.org/api/kotlinx.serialization/kotlinx-serialization-json/kotlinx.serialization.json/-json-element/) 執行個體與 Kotlin 物件之間進行轉換。

使用這些 API，你可以實作兩階段轉換：

* 先將輸入解碼為 `JsonElement`，然後將該元素轉換為 Kotlin 值。
* 先將 Kotlin 值轉換為 `JsonElement`，然後使用編碼器對該元素進行編碼。

讓我們來看一個自訂 `KSerializer` 的範例，它完全控制了 `Response` 型別的值在 JSON 中的編碼與解碼方式。
此序列化程式會將 `Ok` 回應直接編碼為 JSON 值，並將 `Error` 回應編碼為包含錯誤訊息的 JSON 物件：

```kotlin
// Imports declarations from the serialization library
import kotlinx.serialization.*
import kotlinx.serialization.builtins.*
import kotlinx.serialization.json.*
import kotlinx.serialization.descriptors.*
import kotlinx.serialization.encoding.*

// Defines a sealed class for API responses
@Serializable(with = ResponseSerializer::class)
sealed class Response<out T> {
    data class Ok<out T>(val data: T) : Response<T>()
    data class Error(val message: String) : Response<Nothing>()
}

// Implements custom serialization logic for Response
class ResponseSerializer<T>(
    private val dataSerializer: KSerializer<T>
) : KSerializer<Response<T>> {
    override val descriptor: SerialDescriptor = buildClassSerialDescriptor("Response") {
        element("Ok", dataSerializer.descriptor)
        element("Error", buildClassSerialDescriptor("Error") {
            element<String>("message")
        })
    }
    // Deserializes a Response value from JSON
    override fun deserialize(decoder: Decoder): Response<T> {
        // Ensures that the decoder is a JsonDecoder
        require(decoder is JsonDecoder)

        // Decodes the input into a JsonElement
        val element = decoder.decodeJsonElement()

        // Converts the JsonElement into the corresponding Response value
        return if (element is JsonObject && "error" in element) {
            Response.Error(element["error"]!!.jsonPrimitive.content)
        } else {
            Response.Ok(
                decoder.json.decodeFromJsonElement(dataSerializer, element)
            )
        }
    }

    // Serializes a Response value to JSON
    override fun serialize(encoder: Encoder, value: Response<T>) {
        // Ensures that the encoder is a JsonEncoder
        require(encoder is JsonEncoder)

        // Converts the Response value into a JsonElement
        val element = when (value) {
            is Response.Ok ->
                encoder.json.encodeToJsonElement(dataSerializer, value.data)
            is Response.Error ->
                buildJsonObject { put("error", value.message) }
        }

        // Encodes the JsonElement using the encoder
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

### 保留未知的 JSON 屬性 {id="preserve-unknown-json-attributes"}

自訂 JSON 專用序列化程式的常見使用案例是保留輸入中存在、但在可序列化類別中未定義的 JSON 屬性。
預設情況下，這些屬性在還原序列化期間會被忽略。

若要保留這些 JSON 屬性，可以實作自訂的 JSON 專用序列化程式，在還原序列化期間將未在目標類別中定義的所有屬性收集到專用的 [`JsonObject`](https://kotlinlang.org/api/kotlinx.serialization/kotlinx-serialization-json/kotlinx.serialization.json/-json-object/) 欄位中。
這使你能夠在可序列化類別中保留這些屬性，而無需修改原始的 JSON 結構。

範例如下：

```kotlin
// Imports declarations from the serialization library
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
        // Ensures the decoder is JSON-specific
        val jsonInput = decoder as? JsonDecoder ?: error("Can be deserialized only by JSON")

        // Reads the entire content as JSON
        val json = jsonInput.decodeJsonElement().jsonObject

        // Extracts and removes the name property
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
    // Deserializes JSON with properties not defined in the serializable class into UnknownProject
    println(Json.decodeFromString(UnknownProjectSerializer, """{"type":"unknown","name":"example","maintainer":"Unknown","license":"Apache 2.0"}"""))
    // UnknownProject(name=example, details={"type":"unknown","maintainer":"Unknown","license":"Apache 2.0"})

}
//sampleEnd
```
{kotlin-runnable="true"}

在此範例中，保留的 JSON 屬性在輸入的 JSON 物件中，與可序列化類別中所定義的屬性保持在同一層級。

## 後續步驟 {id="what-s-next"}

* 了解如何[序列化多型類別](serialization-polymorphism.md)，以及如何處理共用階層結構中各種類型的物件。
* 在[自訂序列化格式](serialization-custom-formats.md)中了解如何建立自訂格式。
* 探索其他替代序列化格式，例如 [CBOR](serialization-cbor.md) 與 [ProtoBuf](serialization-protobuf.md)。