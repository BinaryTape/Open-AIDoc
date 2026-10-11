[//]: # (title: 转换 JSON 结构)
<primary-label ref="advanced"/>

要控制序列化过程中生成的 JSON 的结构和内容，你可以创建[自定义序列化器](serialization-create-and-use-serializers.md#create-custom-serializers)。
对于较小的调整（例如包装值或展开数组），[`JsonTransformingSerializer`](https://kotlinlang.org/api/kotlinx.serialization/kotlinx-serialization-json/kotlinx.serialization.json/-json-transforming-serializer/) 类提供了一种更简单的方式来修改 JSON，它可以直接操作 JSON 元素树，而无需手动使用 [`Encoder`](https://kotlinlang.org/api/kotlinx.serialization/kotlinx-serialization-core/kotlinx.serialization.encoding/-encoder/) 或 [`Decoder`](https://kotlinlang.org/api/kotlinx.serialization/kotlinx-serialization-core/kotlinx.serialization.encoding/-decoder/)。

> 这些章节基于[创建和使用序列化器](serialization-create-and-use-serializers.md)中所述的概念。
> 如果你还不熟悉自定义序列化器，建议先阅读该页面。
>
{style="note"}

`JsonTransformingSerializer` 是一个特定于 JSON 的抽象序列化器，实现了 [`KSerializer`](https://kotlinlang.org/api/kotlinx.serialization/kotlinx-serialization-core/kotlinx.serialization/-k-serializer/) 接口。
它提供了 [`transformSerialize()`](https://kotlinlang.org/api/kotlinx.serialization/kotlinx-serialization-json/kotlinx.serialization.json/-json-transforming-serializer/transform-serialize.html) 和 [`transformDeserialize()`](https://kotlinlang.org/api/kotlinx.serialization/kotlinx-serialization-json/kotlinx.serialization.json/-json-transforming-serializer/transform-deserialize.html) 函数，你可以重写这些函数以在序列化或反序列化之前调整 JSON 元素树。

除了转换 JSON 结构之外，你还可以使用 `JsonContentPolymorphicSerializer` 来[根据 JSON 内容选择适当的多态类](#select-the-appropriate-polymorphic-class-based-on-the-json-content)。

## 修改 JSON 结构 {id="modify-json-structure"}

你可以通过转换 JSON 元素树来调整 JSON 结构。
以下示例演示了常见的用例，例如包装或展开数组以及省略特定属性。

### 在反序列化期间将单个对象包装到数组中 {id="wrap-a-single-object-in-an-array-during-deserialization"}

某些 API 在返回单个条目时使用单个 JSON 对象，而在返回多个条目时使用 JSON 数组。
要将这两种情况都反序列化为 [`List`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/-list/)：

1. 创建 `JsonTransformingSerializer` 的子类，并在其构造函数中指定一个序列化器。
   要使用标准转换逻辑，请传入目标类型的默认序列化器，例如针对列表使用 [`ListSerializer()`](https://kotlinlang.org/api/kotlinx.serialization/kotlinx-serialization-core/kotlinx.serialization.builtins/-list-serializer.html)。
2. 重写 `transformDeserialize()` 函数。

示例如下：

```kotlin
// 从序列化库中导入声明
import kotlinx.serialization.*
import kotlinx.serialization.builtins.*
import kotlinx.serialization.json.*

//sampleStart
@Serializable
data class Project(
    val name: String,
    // 指定 UserListSerializer 来处理 users 属性的序列化
    @Serializable(with = UserListSerializer::class)
    val users: List<User>
)

@Serializable
data class User(val name: String)

// 创建一个序列化器，用于转换默认 List 序列化器的结果
object UserListSerializer : JsonTransformingSerializer<List<User>>(ListSerializer(User.serializer())) {
    override fun transformDeserialize(element: JsonElement): JsonElement =
        // 如果元素不是 JsonArray，则将其包装到单元素数组中
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

### 在序列化期间展开单元素数组 {id="unwrap-a-single-element-array-during-serialization"}

要在序列化期间将单元素列表展开为单个 JSON 对象，请重写 `transformSerialize()` 函数：

```kotlin
// 从序列化库中导入声明
import kotlinx.serialization.*
import kotlinx.serialization.builtins.*
import kotlinx.serialization.json.*

//sampleStart
@Serializable
data class Project(
    val name: String,
    // 指定 UserListSerializer 来处理 users 属性的序列化
    @Serializable(with = UserListSerializer::class)
    val users: List<User>
)

@Serializable
data class User(val name: String)

// 创建一个序列化器，用于转换默认 List 序列化器的结果
object UserListSerializer : JsonTransformingSerializer<List<User>>(ListSerializer(User.serializer())) {

    override fun transformSerialize(element: JsonElement): JsonElement {
        require(element is JsonArray)
        // 将单元素列表展开为单个 JSON 对象
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

### 在序列化期间省略特定属性 {id="omit-specific-properties-during-serialization"}

如果你无法[指定默认值](serialization-customization-options.md#set-default-values-for-optional-properties)，但仍希望在属性具有特定值时将其省略，请使用 `JsonTransformingSerializer`：

1. 创建 `JsonTransformingSerializer` 的子类，并在其构造函数中指定一个序列化器。
2. 重写 `transformSerialize()` 函数。

以下示例中，`Project` 类具有一个 `language` 属性，当其值为 `"Kotlin"` 时会被省略：

```kotlin
// 从序列化库中导入声明
import kotlinx.serialization.*
import kotlinx.serialization.builtins.*
import kotlinx.serialization.json.*

//sampleStart
@Serializable
class Project(val name: String, val language: String)

// 创建一个自定义序列化器，如果 language 属性等于 "Kotlin" 则将其省略
object ProjectSerializer : JsonTransformingSerializer<Project>(Project.serializer()) {
    override fun transformSerialize(element: JsonElement): JsonElement =
        // 如果 language 属性的值为 "Kotlin"，则将其省略
        JsonObject(element.jsonObject.filterNot {
            (k, v) -> k == "language" && v.jsonPrimitive.content == "Kotlin"
        })
}

fun main() {
    val data = Project("kotlinx.serialization", "Kotlin")

    // 使用默认序列化器
    println(Json.encodeToString(data))
    // {"name":"kotlinx.serialization","language":"Kotlin"}

    // 应用自定义序列化器以省略 language 属性
    println(Json.encodeToString(ProjectSerializer, data))
    // {"name":"kotlinx.serialization"}
}
//sampleEnd
```
{kotlin-runnable="true"}

> 直接序列化对象时，你需要显式地将自定义序列化器传递给 `encodeToString()`
> 函数，以确保应用自定义序列化逻辑。更多信息请参阅[手动传递序列化器](serialization-create-and-use-serializers.md#pass-a-serializer-manually)。
>
{style="note"}

## 根据 JSON 内容选择适当的多态类 {id="select-the-appropriate-polymorphic-class-based-on-the-json-content"}

在[多态序列化](serialization-polymorphism.md)中，JSON 通常包含一个专用的*类鉴别器 (class discriminator)* 属性，用于在反序列化期间识别具体的子类型。

如果输入的 JSON 不包含类鉴别器，你可以使用 [`JsonContentPolymorphicSerializer`](https://kotlinlang.org/api/kotlinx.serialization/kotlinx-serialization-json/kotlinx.serialization.json/-json-content-polymorphic-serializer/) 从 JSON 的结构推断类型。
该序列化器允许你重写 `selectDeserializer()` 函数，以根据 JSON 内容选择正确的反序列化器。

以下示例中，所有值都共享一个带有 `name` 属性的通用基类型：

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

> 在此示例中，序列化器根据 JSON 内容选择要使用的子类型，因此该类层次结构不需要使用 `sealed` 类。
>
{style="note"}

要区分 `BasicProject` 和 `OwnedProject`，请重写 `selectDeserializer()` 函数。
你可以使用该函数检查 JSON 对象是否包含 `owner` 键，并返回相应的序列化器：

```kotlin
// 创建一个根据 "owner" 是否存在来选择反序列化器的自定义序列化器
object ProjectSerializer : JsonContentPolymorphicSerializer<Project>(Project::class) {
    override fun selectDeserializer(element: JsonElement) = when {
        // 如果 JSON 对象包含 "owner" 键，则选择 OwnedProject 序列化器
        "owner" in element.jsonObject -> OwnedProject.serializer()
        else -> BasicProject.serializer()
    }
}
```

当你使用此序列化器序列化数据时，Kotlin 序列化将使用该值实际运行时类型的序列化器。
这可以是[在 `SerializersModule` 中指定的](serialization-polymorphism.md#serialize-closed-polymorphic-classes)序列化器，也可以是默认序列化器：

```kotlin
// 从序列化库中导入声明
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

// 创建一个根据 "owner" 是否存在来选择反序列化器的自定义序列化器
object ProjectSerializer : JsonContentPolymorphicSerializer<Project>(Project::class) {
    override fun selectDeserializer(element: JsonElement) = when {
        // 如果 JSON 对象包含 "owner" 键，则选择 OwnedProject 序列化器
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
    // JSON 输出中没有类鉴别器
    val string = Json.encodeToString(ListSerializer(ProjectSerializer), data)

    println(string)
    // [{"name":"kotlinx.serialization","owner":"kotlin"},{"name":"example"}]

    println(Json.decodeFromString(ListSerializer(ProjectSerializer), string))
    // [OwnedProject(name=kotlinx.serialization, owner=kotlin), BasicProject(name=example)]
}
//sampleEnd
```
{kotlin-runnable="true"}

## 为默认序列化器添加自定义行为 {id="add-custom-behavior-to-the-default-serializer"}
<primary-label ref="experimental-opt-in"/>

你可以通过将默认序列化器用作委托，为 Kotlin 序列化生成的默认序列化器添加自定义行为。

为此，请使用[实验性](components-stability.md#stability-levels-explained)的 [`@KeepGeneratedSerializer`](https://kotlinlang.org/api/kotlinx.serialization/kotlinx-serialization-core/kotlinx.serialization/-keep-generated-serializer/) 注解可序列化类，并在自定义的 `JsonTransformingSerializer` 中使用自动生成的 `generatedSerializer()` 作为基础序列化器。

以下示例通过在反序列化期间将多个输入属性合并为目标类所需的单个 `name` 属性，从而更新 JSON 结构：

```kotlin
// 从序列化库中导入声明
import kotlinx.serialization.*
import kotlinx.serialization.json.*

//sampleStart
@OptIn(ExperimentalSerializationApi::class)
@KeepGeneratedSerializer
@Serializable(with = UserNameSerializer::class)
// 定义一个带有 name 属性的类型
data class User(val name: String)

// 为默认序列化器添加自定义逻辑，以便在反序列化期间合并输入属性
object UserNameSerializer : JsonTransformingSerializer<User>(User.generatedSerializer()) {
    override fun transformDeserialize(element: JsonElement): JsonElement {
        val jsonObject = element.jsonObject
        val first = jsonObject["firstName"]?.jsonPrimitive?.content
        val last = jsonObject["lastName"]?.jsonPrimitive?.content

        // 如果输入与预期结构不匹配，
        // 则将输入属性合并到 name 属性中
        return if (first != null && last != null) {
            JsonObject(mapOf("name" to JsonPrimitive("$first $last")))
        } else {
            jsonObject
        }
    }
}

fun main() {
    // 反序列化 name 属性分散在多个输入属性中的 JSON
   val fromExternalData = Json.decodeFromString<User>(
        """{"firstName":"John","lastName":"Smith"}"""
    )
    println(fromExternalData)
    // User(name=John Smith)

    // 反序列化 name 属性与预期结构匹配的 JSON
    val fromInternalData = Json.decodeFromString<User>(
        """{"name":"John Smith"}"""
    )
    println(fromInternalData)
    // User(name=John Smith)
}
//sampleEnd
```
{kotlin-runnable="true"}

## 在 JSON 中实现自定义序列化逻辑 {id="implement-custom-serialization-logic-in-json"}
<primary-label ref="experimental-general"/>

如果 `JsonTransformingSerializer` 或 `JsonContentPolymorphicSerializer` 提供的转换函数无法满足需求，你可以通过定义自己的 [`KSerializer`](https://kotlinlang.org/api/kotlinx.serialization/kotlinx-serialization-core/kotlinx.serialization/-k-serializer/) 类来实现自定义序列化逻辑。

你可以通过直接重写 `serialize()` 和 `deserialize()` 函数来完全控制值的序列化和反序列化方式。

在为 JSON 实现自定义序列化逻辑时，可以将 `Encoder` 转换为 [`JsonEncoder`](https://kotlinlang.org/api/kotlinx.serialization/kotlinx-serialization-json/kotlinx.serialization.json/-json-encoder/)，并将 `Decoder` 转换为 [`JsonDecoder`](https://kotlinlang.org/api/kotlinx.serialization/kotlinx-serialization-json/kotlinx.serialization.json/-json-decoder/)，以调用特定于 JSON 的函数 [`decodeJsonElement()`](https://kotlinlang.org/api/kotlinx.serialization/kotlinx-serialization-json/kotlinx.serialization.json/-json-decoder/decode-json-element.html) 和 [`encodeToJsonElement()`](https://kotlinlang.org/api/kotlinx.serialization/kotlinx-serialization-json/kotlinx.serialization.json/encode-to-json-element.html)。
这些函数允许你从解码器当前处理的值中检索 JSON 元素，或将 JSON 元素插入其中。

`JsonDecoder` 和 `JsonEncoder` 都公开了一个 `json` 属性，用于访问控制值如何编码和解码的当前活跃 `Json` 实例。
通过该实例，你可以使用 [`encodeToJsonElement()`](https://kotlinlang.org/api/kotlinx.serialization/kotlinx-serialization-json/kotlinx.serialization.json/encode-to-json-element.html) 和 [`decodeFromJsonElement()`](https://kotlinlang.org/api/kotlinx.serialization/kotlinx-serialization-json/kotlinx.serialization.json/decode-from-json-element.html) 在 [`JsonElement`](https://kotlinlang.org/api/kotlinx.serialization/kotlinx-serialization-json/kotlinx.serialization.json/-json-element/) 实例与 Kotlin 对象之间进行转换。

使用这些 API，你可以实现两阶段转换：

* 先将输入解码为 `JsonElement`，然后再将该元素转换为 Kotlin 值。
* 先将 Kotlin 值转换为 `JsonElement`，然后再使用编码器对该元素进行编码。

让我们看一个自定义 `KSerializer` 的示例，该序列化器完全控制了 `Response` 类型的值在 JSON 中的编码和解码方式。
该序列化器将 `Ok` 响应直接编码为 JSON 值，将 `Error` 响应编码为包含错误消息的 JSON 对象：

```kotlin
// 从序列化库中导入声明
import kotlinx.serialization.*
import kotlinx.serialization.builtins.*
import kotlinx.serialization.json.*
import kotlinx.serialization.descriptors.*
import kotlinx.serialization.encoding.*

// 为 API 响应定义一个密封类 (sealed class)
@Serializable(with = ResponseSerializer::class)
sealed class Response<out T> {
    data class Ok<out T>(val data: T) : Response<T>()
    data class Error(val message: String) : Response<Nothing>()
}

// 为 Response 实现自定义序列化逻辑
class ResponseSerializer<T>(
    private val dataSerializer: KSerializer<T>
) : KSerializer<Response<T>> {
    override val descriptor: SerialDescriptor = buildClassSerialDescriptor("Response") {
        element("Ok", dataSerializer.descriptor)
        element("Error", buildClassSerialDescriptor("Error") {
            element<String>("message")
        })
    }
    // 从 JSON 反序列化 Response 值
    override fun deserialize(decoder: Decoder): Response<T> {
        // 确保解码器为 JsonDecoder
        require(decoder is JsonDecoder)

        // 将输入解码为 JsonElement
        val element = decoder.decodeJsonElement()

        // 将 JsonElement 转换为相应的 Response 值
        return if (element is JsonObject && "error" in element) {
            Response.Error(element["error"]!!.jsonPrimitive.content)
        } else {
            Response.Ok(
                decoder.json.decodeFromJsonElement(dataSerializer, element)
            )
        }
    }

    // 将 Response 值序列化为 JSON
    override fun serialize(encoder: Encoder, value: Response<T>) {
        // 确保编码器为 JsonEncoder
        require(encoder is JsonEncoder)

        // 将 Response 值转换为 JsonElement
        val element = when (value) {
            is Response.Ok ->
                encoder.json.encodeToJsonElement(dataSerializer, value.data)
            is Response.Error ->
                buildJsonObject { put("error", value.message) }
        }

        // 使用编码器对 JsonElement 进行编码
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

### 保留未知的 JSON 属性 {id="preserve-unknown-json-attributes"}

特定于 JSON 的自定义序列化器的一个常见用例是保留输入中未在可序列化类中定义的 JSON 属性。
默认情况下，这些属性在反序列化期间会被忽略。

要保留这些 JSON 属性，请实现一个特定于 JSON 的自定义序列化器，该序列化器在反序列化期间将目标类中未定义的所有属性收集到专用的 [`JsonObject`](https://kotlinlang.org/api/kotlinx.serialization/kotlinx-serialization-json/kotlinx.serialization.json/-json-object/) 字段中。
这允许你在可序列化类中保留这些属性，而无需修改原始的 JSON 结构。

示例如下：

```kotlin
// 从序列化库中导入声明
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
        // 确保解码器特定于 JSON
        val jsonInput = decoder as? JsonDecoder ?: error("Can be deserialized only by JSON")

        // 将全部内容作为 JSON 读取
        val json = jsonInput.decodeJsonElement().jsonObject

        // 提取并移除 name 属性
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
    // 将包含未在可序列化类中定义的属性的 JSON 反序列化为 UnknownProject
    println(Json.decodeFromString(UnknownProjectSerializer, """{"type":"unknown","name":"example","maintainer":"Unknown","license":"Apache 2.0"}"""))
    // UnknownProject(name=example, details={"type":"unknown","maintainer":"Unknown","license":"Apache 2.0"})

}
//sampleEnd
```
{kotlin-runnable="true"}

在此示例中，保留下来的 JSON 属性与可序列化类中定义的属性在输入 JSON 对象中保持处于同一层级。

## 下一步 {id="what-s-next"}

* 了解如何[序列化多态类](serialization-polymorphism.md)并处理共享层次结构中各种类型的对象。
* 了解如何在[自定义序列化格式](serialization-custom-formats.md)中创建自定义格式。
* 探索其他序列化格式，例如 [CBOR](serialization-cbor.md) 和 [ProtoBuf](serialization-protobuf.md)。