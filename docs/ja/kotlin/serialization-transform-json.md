[//]: # (title: JSON構造の変換)
<primary-label ref="advanced"/>

シリアライズ中に生成されるJSONの構造や内容を制御するために、[カスタムシリアライザー](serialization-create-and-use-serializers.md#create-custom-serializers)を作成できます。
値のラップや配列のアンラップといった小さな調整の場合、[`JsonTransformingSerializer`](https://kotlinlang.org/api/kotlinx.serialization/kotlinx-serialization-json/kotlinx.serialization.json/-json-transforming-serializer/) クラスを使用すると、[`Encoder`](https://kotlinlang.org/api/kotlinx.serialization/kotlinx-serialization-core/kotlinx.serialization.encoding/-encoder/) や [`Decoder`](https://kotlinlang.org/api/kotlinx.serialization/kotlinx-serialization-core/kotlinx.serialization.encoding/-decoder/) を手動で使用する代わりに、JSON要素ツリーを直接操作してJSONをよりシンプルに変更できます。

> これらのセクションは、[シリアライザーの作成と使用](serialization-create-and-use-serializers.md) で説明されている概念に基づいています。
> カスタムシリアライザーに慣れていない場合は、まずそのページを読むことをお勧めします。
>
{style="note"}

`JsonTransformingSerializer` は、[`KSerializer`](https://kotlinlang.org/api/kotlinx.serialization/kotlinx-serialization-core/kotlinx.serialization/-k-serializer/) インターフェースを実装したJSON専用の抽象シリアライザーです。
シリアライズまたはデシリアライズの前にJSON要素ツリーを調整するためにオーバーライド可能な [`transformSerialize()`](https://kotlinlang.org/api/kotlinx.serialization/kotlinx-serialization-json/kotlinx.serialization.json/-json-transforming-serializer/transform-serialize.html) 関数および [`transformDeserialize()`](https://kotlinlang.org/api/kotlinx.serialization/kotlinx-serialization-json/kotlinx.serialization.json/-json-transforming-serializer/transform-deserialize.html) 関数を提供します。

JSON構造の変換に加えて、`JsonContentPolymorphicSerializer` を使用して [JSONコンテンツに基づいて適切なポリモーフィッククラスを選択](#select-the-appropriate-polymorphic-class-based-on-the-json-content) することもできます。

## JSON構造の変更 {id="modify-json-structure"}

JSON要素ツリーを変換することで、JSON構造を調整できます。
以下の例では、配列のラップやアンラップ、特定のプロパティの除外といった一般的なユースケースを示します。

### デシリアライズ時に単一のオブジェクトを配列でラップする {id="wrap-a-single-object-in-an-array-during-deserialization"}

APIによっては、要素が1つの場合は単一のJSONオブジェクトを返し、複数の場合はJSON配列を返すことがあります。
両方のケースを [`List`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/-list/) にデシリアライズするには、次のようにします。

1. `JsonTransformingSerializer` のサブクラスを作成し、そのコンストラクタでシリアライザーを指定します。
   標準の変換ロジックを使用するには、リスト用の [`ListSerializer()`](https://kotlinlang.org/api/kotlinx.serialization/kotlinx-serialization-core/kotlinx.serialization.builtins/-list-serializer.html) など、対象タイプのデフォルトシリアライザーを渡します。
2. `transformDeserialize()` 関数をオーバーライドします。

以下に例を示します。

```kotlin
// シリアライゼーションライブラリから宣言をインポート
import kotlinx.serialization.*
import kotlinx.serialization.builtins.*
import kotlinx.serialization.json.*

//sampleStart
@Serializable
data class Project(
    val name: String,
    // usersプロパティのシリアライズを処理するためにUserListSerializerを指定
    @Serializable(with = UserListSerializer::class)
    val users: List<User>
)

@Serializable
data class User(val name: String)

// デフォルトのListシリアライザーの結果を変換するシリアライザーを作成
object UserListSerializer : JsonTransformingSerializer<List<User>>(ListSerializer(User.serializer())) {
    override fun transformDeserialize(element: JsonElement): JsonElement =
        // 要素がJsonArrayでない場合は、単一要素の配列にラップする
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

### シリアライズ時に単一要素の配列をアンラップする {id="unwrap-a-single-element-array-during-serialization"}

シリアライズ時に単一要素のリストを単一のJSONオブジェクトにアンラップするには、`transformSerialize()` 関数をオーバーライドします。

```kotlin
// シリアライゼーションライブラリから宣言をインポート
import kotlinx.serialization.*
import kotlinx.serialization.builtins.*
import kotlinx.serialization.json.*

//sampleStart
@Serializable
data class Project(
    val name: String,
    // usersプロパティのシリアライズを処理するためにUserListSerializerを指定
    @Serializable(with = UserListSerializer::class)
    val users: List<User>
)

@Serializable
data class User(val name: String)

// デフォルトのListシリアライザーの結果を変換するシリアライザーを作成
object UserListSerializer : JsonTransformingSerializer<List<User>>(ListSerializer(User.serializer())) {

    override fun transformSerialize(element: JsonElement): JsonElement {
        require(element is JsonArray)
        // 単一要素のリストを単一のJSONオブジェクトにアンラップする
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

### シリアライズ時に特定のプロパティを除外する {id="omit-specific-properties-during-serialization"}

[デフォルト値を指定](serialization-customization-options.md#set-default-values-for-optional-properties) できないものの、プロパティが特定の値を持つ場合に除外したいときは、`JsonTransformingSerializer` を使用します。

1. `JsonTransformingSerializer` のサブクラスを作成し、コンストラクタでシリアライザーを指定します。
2. `transformSerialize()` 関数をオーバーライドします。

以下は、`Project` クラスが `language` プロパティを持ち、その値が `"Kotlin"` である場合に除外する例です。

```kotlin
// シリアライゼーションライブラリから宣言をインポート
import kotlinx.serialization.*
import kotlinx.serialization.builtins.*
import kotlinx.serialization.json.*

//sampleStart
@Serializable
class Project(val name: String, val language: String)

// languageプロパティが"Kotlin"と等しい場合に除外するカスタムシリアライザーを作成
object ProjectSerializer : JsonTransformingSerializer<Project>(Project.serializer()) {
    override fun transformSerialize(element: JsonElement): JsonElement =
        // languageプロパティの値が"Kotlin"の場合は除外する
        JsonObject(element.jsonObject.filterNot {
            (k, v) -> k == "language" && v.jsonPrimitive.content == "Kotlin"
        })
}

fun main() {
    val data = Project("kotlinx.serialization", "Kotlin")

    // デフォルトのシリアライザーを使用
    println(Json.encodeToString(data))
    // {"name":"kotlinx.serialization","language":"Kotlin"}

    // カスタムシリアライザーを適用してlanguageプロパティを除外
    println(Json.encodeToString(ProjectSerializer, data))
    // {"name":"kotlinx.serialization"}
}
//sampleEnd
```
{kotlin-runnable="true"}

> オブジェクトを直接シリアライズする場合、カスタムのシリアライズロジックが確実に適用されるよう、`encodeToString()` 関数にカスタムシリアライザーを明示的に渡す必要があります。詳細については、[手動でシリアライザーを渡す](serialization-create-and-use-serializers.md#pass-a-serializer-manually) を参照してください。
>
{style="note"}

## JSONコンテンツに基づいて適切なポリモーフィッククラスを選択する {id="select-the-appropriate-polymorphic-class-based-on-the-json-content"}

[ポリモーフィックシリアライゼーション](serialization-polymorphism.md) では、JSONにデシリアライズ時の具体的なサブタイプを識別するための専用の *クラス識別子 (class discriminator)* プロパティが含まれていることがよくあります。

JSON入力にクラス識別子が含まれていない場合は、[`JsonContentPolymorphicSerializer`](https://kotlinlang.org/api/kotlinx.serialization/kotlinx-serialization-json/kotlinx.serialization.json/-json-content-polymorphic-serializer/) を使用してJSONの構造から型を推論できます。
このシリアライザーを使用すると、`selectDeserializer()` 関数をオーバーライドして、JSONコンテンツに基づいて正しいデシリアライザーを選択できます。

以下は、すべての値が `name` プロパティを持つ共通の基底クラスを共有している例です。

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

> この例では、シリアライザーがJSONコンテンツに基づいてどのサブタイプを使用するかを選択するため、クラス階層に `sealed` クラスを使用する必要はありません。
>
{style="note"}

`BasicProject` と `OwnedProject` を区別するには、`selectDeserializer()` 関数をオーバーライドします。
この関数を使用して、JSONオブジェクトに `owner` キーが含まれているかどうかを確認し、対応するシリアライザーを返すことができます。

```kotlin
// "owner"の存在に基づいてデシリアライザーを選択するカスタムシリアライザーを作成
object ProjectSerializer : JsonContentPolymorphicSerializer<Project>(Project::class) {
    override fun selectDeserializer(element: JsonElement) = when {
        // JSONオブジェクトに"owner"キーが含まれている場合はOwnedProjectシリアライザーを選択
        "owner" in element.jsonObject -> OwnedProject.serializer()
        else -> BasicProject.serializer()
    }
}
```

このシリアライザーを使用してデータをシリアライズする場合、Kotlinシリアライゼーションは値の実際の実行時型のシリアライザーを使用します。
これは、[`SerializersModule` で指定されたシリアライザー](serialization-polymorphism.md#serialize-closed-polymorphic-classes) またはデフォルトのシリアライザーになります。

```kotlin
// シリアライゼーションライブラリから宣言をインポート
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

// "owner"の存在に基づいてデシリアライザーを選択するカスタムシリアライザーを作成
object ProjectSerializer : JsonContentPolymorphicSerializer<Project>(Project::class) {
    override fun selectDeserializer(element: JsonElement) = when {
        // JSONオブジェクトに"owner"キーが含まれている場合はOwnedProjectシリアライザーを選択
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
    // JSON出力にはクラス識別子が含まれない
    val string = Json.encodeToString(ListSerializer(ProjectSerializer), data)

    println(string)
    // [{"name":"kotlinx.serialization","owner":"kotlin"},{"name":"example"}]

    println(Json.decodeFromString(ListSerializer(ProjectSerializer), string))
    // [OwnedProject(name=kotlinx.serialization, owner=kotlin), BasicProject(name=example)]
}
//sampleEnd
```
{kotlin-runnable="true"}

## デフォルトシリアライザーにカスタム動作を追加する {id="add-custom-behavior-to-the-default-serializer"}
<primary-label ref="experimental-opt-in"/>

Kotlinシリアライゼーションが生成するデフォルトのシリアライザーをデリゲート（委譲先）として使用することで、デフォルトシリアライザーにカスタムの動作を追加できます。

これを行うには、シリアライズ可能なクラスに[実験的 (Experimental)](components-stability.md#stability-levels-explained) な [`@KeepGeneratedSerializer`](https://kotlinlang.org/api/kotlinx.serialization/kotlinx-serialization-core/kotlinx.serialization/-keep-generated-serializer/) アノテーションを付与し、カスタム `JsonTransformingSerializer` 内で自動生成された `generatedSerializer()` をベースシリアライザーとして使用します。

以下は、複数の入力プロパティをターゲットクラスが期待する単一の `name` プロパティに結合することで、デシリアライズ中にJSON構造を更新する例です。

```kotlin
// シリアライゼーションライブラリから宣言をインポート
import kotlinx.serialization.*
import kotlinx.serialization.json.*

//sampleStart
@OptIn(ExperimentalSerializationApi::class)
@KeepGeneratedSerializer
@Serializable(with = UserNameSerializer::class)
// nameプロパティを持つ型を定義
data class User(val name: String)

// デシリアライズ時に入力プロパティを結合するためのカスタムロジックをデフォルトシリアライザーに追加
object UserNameSerializer : JsonTransformingSerializer<User>(User.generatedSerializer()) {
    override fun transformDeserialize(element: JsonElement): JsonElement {
        val jsonObject = element.jsonObject
        val first = jsonObject["firstName"]?.jsonPrimitive?.content
        val last = jsonObject["lastName"]?.jsonPrimitive?.content

        // 入力が期待される構造と一致しない場合、
        // 入力プロパティをnameプロパティに結合する
        return if (first != null && last != null) {
            JsonObject(mapOf("name" to JsonPrimitive("$first $last")))
        } else {
            jsonObject
        }
    }
}

fun main() {
    // nameプロパティが複数の入力プロパティに分かれているJSONをデシリアライズ
   val fromExternalData = Json.decodeFromString<User>(
        """{"firstName":"John","lastName":"Smith"}"""
    )
    println(fromExternalData)
    // User(name=John Smith)

    // nameプロパティが期待される構造と一致しているJSONをデシリアライズ
    val fromInternalData = Json.decodeFromString<User>(
        """{"name":"John Smith"}"""
    )
    println(fromInternalData)
    // User(name=John Smith)
}
//sampleEnd
```
{kotlin-runnable="true"}

## JSONでカスタムシリアライズロジックを実装する {id="implement-custom-serialization-logic-in-json"}
<primary-label ref="experimental-general"/>

`JsonTransformingSerializer` や `JsonContentPolymorphicSerializer` が提供する変換機能では不十分な場合は、独自の [`KSerializer`](https://kotlinlang.org/api/kotlinx.serialization/kotlinx-serialization-core/kotlinx.serialization/-k-serializer/) クラスを定義してカスタムシリアライズロジックを実装できます。

`serialize()` および `deserialize()` 関数を直接オーバーライドすることで、値がどのようにシリアライズおよびデシリアライズされるかを完全に制御できます。

JSON用のカスタムシリアライズロジックを実装する場合、`Encoder` を [`JsonEncoder`](https://kotlinlang.org/api/kotlinx.serialization/kotlinx-serialization-json/kotlinx.serialization.json/-json-encoder/) に、`Decoder` を [`JsonDecoder`](https://kotlinlang.org/api/kotlinx.serialization/kotlinx-serialization-json/kotlinx.serialization.json/-json-decoder/) にキャストして、JSON専用の関数である [`decodeJsonElement()`](https://kotlinlang.org/api/kotlinx.serialization/kotlinx-serialization-json/kotlinx.serialization.json/-json-decoder/decode-json-element.html) や [`encodeToJsonElement()`](https://kotlinlang.org/api/kotlinx.serialization/kotlinx-serialization-json/kotlinx.serialization.json/encode-to-json-element.html) を呼び出すことができます。
これらの関数を使用すると、デコーダーが現在処理している値からJSON要素を取得したり、エンコーダーにJSON要素を挿入したりできます。

`JsonDecoder` と `JsonEncoder` は両方とも、値のエンコードおよびデコード方法を制御するアクティブな `Json` インスタンスへのアクセスを提供する `json` プロパティを公開しています。
そのインスタンスを通じて、[`encodeToJsonElement()`](https://kotlinlang.org/api/kotlinx.serialization/kotlinx-serialization-json/kotlinx.serialization.json/encode-to-json-element.html) および [`decodeFromJsonElement()`](https://kotlinlang.org/api/kotlinx.serialization/kotlinx-serialization-json/kotlinx.serialization.json/decode-from-json-element.html) を使用して、[`JsonElement`](https://kotlinlang.org/api/kotlinx.serialization/kotlinx-serialization-json/kotlinx.serialization.json/-json-element/) インスタンスとKotlinオブジェクトの間で相互変換を行えます。

これらのAPIを使用すると、2段階の変換を実装できます。

* 入力をまず `JsonElement` にデコードし、その後その要素をKotlinの値に変換する。
* Kotlinの値をまず `JsonElement` に変換し、その後エンコーダーを使用してその要素をエンコードする。

`Response` 型の値がJSONでどのようにエンコードおよびデコードされるかを完全に制御するカスタム `KSerializer` の例を見てみましょう。
このシリアライザーは、`Ok` レスポンスをJSON値として直接エンコードし、`Error` レスポンスをエラーメッセージを含むJSONオブジェクトとしてエンコードします。

```kotlin
// シリアライゼーションライブラリから宣言をインポート
import kotlinx.serialization.*
import kotlinx.serialization.builtins.*
import kotlinx.serialization.json.*
import kotlinx.serialization.descriptors.*
import kotlinx.serialization.encoding.*

// APIレスポンス用のsealed classを定義
@Serializable(with = ResponseSerializer::class)
sealed class Response<out T> {
    data class Ok<out T>(val data: T) : Response<T>()
    data class Error(val message: String) : Response<Nothing>()
}

// Response用のカスタムシリアライズロジックを実装
class ResponseSerializer<T>(
    private val dataSerializer: KSerializer<T>
) : KSerializer<Response<T>> {
    override val descriptor: SerialDescriptor = buildClassSerialDescriptor("Response") {
        element("Ok", dataSerializer.descriptor)
        element("Error", buildClassSerialDescriptor("Error") {
            element<String>("message")
        })
    }
    // JSONからResponse値をデシリアライズする
    override fun deserialize(decoder: Decoder): Response<T> {
        // デコーダーがJsonDecoderであることを確認
        require(decoder is JsonDecoder)

        // 入力をJsonElementにデコード
        val element = decoder.decodeJsonElement()

        // JsonElementを対応するResponse値に変換
        return if (element is JsonObject && "error" in element) {
            Response.Error(element["error"]!!.jsonPrimitive.content)
        } else {
            Response.Ok(
                decoder.json.decodeFromJsonElement(dataSerializer, element)
            )
        }
    }

    // Response値をJSONにシリアライズする
    override fun serialize(encoder: Encoder, value: Response<T>) {
        // エンコーダーがJsonEncoderであることを確認
        require(encoder is JsonEncoder)

        // Response値をJsonElementに変換
        val element = when (value) {
            is Response.Ok ->
                encoder.json.encodeToJsonElement(dataSerializer, value.data)
            is Response.Error ->
                buildJsonObject { put("error", value.message) }
        }

        // エンコーダーを使用してJsonElementをエンコード
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

### 未知のJSON属性を保持する {id="preserve-unknown-json-attributes"}

JSON固有のカスタムシリアライザーの一般的なユースケースは、シリアライズ可能なクラスで定義されていない入力JSONプロパティを保持することです。
デフォルトでは、これらのプロパティはデシリアライズ中に無視されます。

これらのJSONプロパティを保持するには、ターゲットクラスで定義されていないすべてのプロパティを、デシリアライズ中に専用の [`JsonObject`](https://kotlinlang.org/api/kotlinx.serialization/kotlinx-serialization-json/kotlinx.serialization.json/-json-object/) フィールドに収集するカスタムJSON専用シリアライザーを実装します。
これにより、元のJSON構造を変更することなく、シリアライズ可能なクラス内でこれらのプロパティを保持できます。

以下に例を示します。

```kotlin
// シリアライゼーションライブラリから宣言をインポート
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
        // デコーダーがJSON専用であることを確認
        val jsonInput = decoder as? JsonDecoder ?: error("Can be deserialized only by JSON")

        // 全体のコンテンツをJSONとして読み取る
        val json = jsonInput.decodeJsonElement().jsonObject

        // nameプロパティを抽出して削除
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
    // シリアライズ可能なクラスで定義されていないプロパティを持つJSONをUnknownProjectにデシリアライズ
    println(Json.decodeFromString(UnknownProjectSerializer, """{"type":"unknown","name":"example","maintainer":"Unknown","license":"Apache 2.0"}"""))
    // UnknownProject(name=example, details={"type":"unknown","maintainer":"Unknown","license":"Apache 2.0"})

}
//sampleEnd
```
{kotlin-runnable="true"}

この例では、保持されたJSONプロパティは、シリアライズ可能なクラスで定義されたプロパティと同じ階層レベルで入力JSONオブジェクト内に残ります。

## 次のステップ {id="what-s-next"}

* [ポリモーフィッククラスのシリアライズ](serialization-polymorphism.md) について学び、共通階層内のさまざまな型のオブジェクトを処理する方法を確認する。
* [カスタムシリアライゼーションフォーマット](serialization-custom-formats.md) で独自のフォーマットを作成する方法を学ぶ。
* [CBOR](serialization-cbor.md) や [ProtoBuf](serialization-protobuf.md) などの代替シリアライゼーションフォーマットについて知る。