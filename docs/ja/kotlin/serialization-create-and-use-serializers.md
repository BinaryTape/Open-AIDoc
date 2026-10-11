[//]: # (title: シリアライザーの作成と使用)

シリアライザーは、シリアライズされた形式におけるKotlin型の構造を定義し、一方で `Json` などのフォーマット実装はその構造をどのようにエンコードするかを制御します。

![Kotlinの値がシリアライザーによってプリミティブのシーケンスにシリアライズされ、フォーマットによってエンコードされたデータにエンコードされ、デコードされて再びプリミティブのシーケンスに戻り、シリアライザーによってKotlinの値にデシリアライズされる図](serialization-encoding.svg){width="700"}

シリアライザーは、[`KSerializer`](https://kotlinlang.org/api/kotlinx.serialization/kotlinx-serialization-core/kotlinx.serialization/-k-serializer/) インターフェースを通じて型のシリアライズおよびデシリアライズ戦略を定義します。
Kotlinシリアライゼーションは、組み込み型やコレクションなどのためのシリアライザーを提供しています。

これらのシリアライザーを使用して値をシリアライズしたり、シリアライズされた形式の構造を検査したりできます。また、カスタムシリアライザーを使用すると、その構造を独自に定義できます。

## シリアライザーの取得 {id="obtain-serializers"}

クラスに [`@Serializable`](https://kotlinlang.org/api/kotlinx.serialization/kotlinx-serialization-core/kotlinx.serialization/-serializable/) アノテーションを付けると、Kotlinシリアライゼーションプラグインはそのクラス用の [`KSerializer`](https://kotlinlang.org/api/kotlinx.serialization/kotlinx-serialization-core/kotlinx.serialization/-k-serializer/) を生成します。

この自動生成されたシリアライザーを取得するには、生成された `.serializer()` 関数を呼び出します。
シリアライザーは `Json.encodeToString()` などの関数で直接使用することも、その [`descriptor`](https://kotlinlang.org/api/kotlinx.serialization/kotlinx-serialization-core/kotlinx.serialization/-k-serializer/descriptor.html) プロパティにアクセスして型のシリアライズされた形式の構造を検査することもできます。

以下は、単一の整数プロパティを持つ `Color` クラスを定義し、そのシリアライズされた形式の構造を検査する例です。

```kotlin
import kotlinx.serialization.*

//sampleStart
@Serializable
data class Color(val rgb: Int)

fun main() {
    // Colorクラス用に生成されたシリアライザーを取得
    val colorSerializer: KSerializer<Color> = Color.serializer()

    println(colorSerializer.descriptor)
    // Color(rgb: kotlin.Int)
}
//sampleEnd
```
{kotlin-runnable="true"}

> [組み込みのプリミティブ型と `String`](serialization-serialize-builtin-types.md) も、`Int.serializer()` や `String.serializer()` のように `.serializer()` 関数を介してシリアライザーを提供します。
> 
{style="note"}

トップレベルの `serializer<T>()` 関数を使用すると、パラメータ化された型を含む任意の型のシリアライザーを取得できます。

```kotlin
import kotlinx.serialization.*

//sampleStart
@Serializable
@SerialName("Color")
class Color(val rgb: Int)

fun main() {
    // Map<String, Color> のシリアライザーを取得
    val stringToColorMapSerializer: KSerializer<Map<String, Color>> = serializer()

    // 出力: kotlin.collections.LinkedHashMap(PrimitiveDescriptor(kotlin.String), Color(rgb: kotlin.Int))
    println(stringToColorMapSerializer.descriptor)
}
//sampleEnd
```
{kotlin-runnable="true"}

ジェネリッククラスの場合、生成された `.serializer()` 関数を使用するには、型パラメータごとに1つの `KSerializer` 引数を指定します。

```kotlin
import kotlinx.serialization.*

//sampleStart
@Serializable
@SerialName("Color")
class Color(val rgb: Int)

@Serializable
@SerialName("Box")
class Box<T>(val contents: T)    

fun main() {
    // 型パラメータ用のKSerializerを使用して .serializer() を呼び出す
    val boxedColorSerializer = Box.serializer(Color.serializer())

    println(boxedColorSerializer.descriptor)
    // Box(contents: Color)
}
//sampleEnd
```
{kotlin-runnable="true"}

### コレクション型用のシリアライザーの取得 {id="obtain-serializers-for-collection-types"}

`@Serializable` が注釈されたクラスとは異なり、`List<T>` のようなコレクション型には生成された `.serializer()` 関数がありません。

コレクション型用のシリアライザーを取得するには、[`ListSerializer()`](https://kotlinlang.org/api/kotlinx.serialization/kotlinx-serialization-core/kotlinx.serialization.builtins/-list-serializer.html)、[`SetSerializer()`](https://kotlinlang.org/api/kotlinx.serialization/kotlinx-serialization-core/kotlinx.serialization.builtins/-set-serializer.html)、または [`MapSerializer()`](https://kotlinlang.org/api/kotlinx.serialization/kotlinx-serialization-core/kotlinx.serialization.builtins/-map-serializer.html) を使用して作成し、コレクションの型パラメータに対するシリアライザーを指定します。

以下は、`ListSerializer()` 関数を使用して `List<String>` 用のシリアライザーを作成する例です。

```kotlin
import kotlinx.serialization.*
import kotlinx.serialization.builtins.*

//sampleStart
fun main() {   
    val stringListSerializer: KSerializer<List<String>> = ListSerializer(String.serializer()) 
    println(stringListSerializer.descriptor)
    // kotlin.collections.ArrayList(PrimitiveDescriptor(kotlin.String))
}
//sampleEnd
```
{kotlin-runnable="true"}

## カスタムシリアライザーの作成 {id="create-custom-serializers"}

シリアライズされるデータの構造をより細かく制御したい場合は、カスタムシリアライザーを作成できます。
カスタムシリアライザーを使用すると、型がシリアライズされた形式でどのように表現されるかを独自に定義できます。

生成されたシリアライザーと同様に、カスタムシリアライザーは [`KSerializer`](https://kotlinlang.org/api/kotlinx.serialization/kotlinx-serialization-core/kotlinx.serialization/-k-serializer/) インターフェースを通じて型のシリアライズとデシリアライズの両方を定義します。
両方をサポートするために、`KSerializer` は [`SerializationStrategy`](https://kotlinlang.org/api/kotlinx.serialization/kotlinx-serialization-core/kotlinx.serialization/-serialization-strategy/) と [`DeserializationStrategy`](https://kotlinlang.org/api/kotlinx.serialization/kotlinx-serialization-core/kotlinx.serialization/-deserialization-strategy/) を継承しています。

> JSONシリアライゼーションの場合、構造を再定義することなく `JsonTransformingSerializer` を使って既存のシリアライザーによって生成される [JSON出力を変更する](serialization-transform-json.md) こともできます。
> 
{style="tip"}

### カスタムプリミティブシリアライザーの作成 {id="create-a-custom-primitive-serializer"}

クラスを文字列や整数などの単一のプリミティブ値として表現するには、プリミティブシリアライザーを使用します。

カスタムプリミティブシリアライザーを作成するには:

1. シリアライズ対象のクラスに対して `KSerializer` を実装する `object` としてカスタムシリアライザーを作成します。

    ```kotlin
    object YourSerializer : KSerializer<Type>
    ```

2. `descriptor` プロパティをオーバーライドして、シリアライズされるデータのスキーマを定義します。

   [`PrimitiveSerialDescriptor(serialName, kind)`](https://kotlinlang.org/api/kotlinx.serialization/kotlinx-serialization-core/kotlinx.serialization.descriptors/-primitive-serial-descriptor.html) を使用して、シリアライズされた形式の構造を単一のプリミティブ値として定義します。
   完全修飾名などの**一意の** `serialName` を指定し、シリアライザーで使用されるエンコーダーおよびデコーダー関数に一致する [`PrimitiveKind`](https://kotlinlang.org/api/kotlinx.serialization/kotlinx-serialization-core/kotlinx.serialization.descriptors/-primitive-kind/) を使用します。

    ```kotlin
    override val descriptor: SerialDescriptor =
        PrimitiveSerialDescriptor("com.example.Type", PrimitiveKind.STRING)
    ```
   
    > `descriptor` がエンコードおよびデコード関数と一致しない場合、`kotlinx.serialization` プロジェクトの更新によって、一部のフォーマットでシリアライザーが予期しない動作をする可能性があります。
    > 
    {style="warning"}

3. [`serialize()`](https://kotlinlang.org/api/kotlinx.serialization/kotlinx-serialization-core/kotlinx.serialization/-serialization-strategy/serialize.html) 関数を実装して、値がどのようにシリアライズされた形式に変換されるかを定義します。`descriptor` の `PrimitiveKind` と一致する [`Encoder`](https://kotlinlang.org/api/kotlinx.serialization/kotlinx-serialization-core/kotlinx.serialization.encoding/-encoder/) 関数を選択します。

    ```kotlin
    override fun serialize(encoder: Encoder, value: Type) {
        val encodedValue: String = // 値をプリミティブ表現に変換
        encoder.encodeString(encodedValue)
    }
    ```

4. [`deserialize()`](https://kotlinlang.org/api/kotlinx.serialization/kotlinx-serialization-core/kotlinx.serialization/-deserialization-strategy/deserialize.html) 関数を実装して、シリアライズされたデータをクラスのインスタンスに戻す方法を定義します。[`Decoder`](https://kotlinlang.org/api/kotlinx.serialization/kotlinx-serialization-core/kotlinx.serialization.encoding/-decoder/) は、[`decodeString()`](https://kotlinlang.org/api/kotlinx.serialization/kotlinx-serialization-core/kotlinx.serialization.encoding/-decoder/decode-string.html) などのデータを読み取る関数を提供します。

    ```kotlin
    override fun deserialize(decoder: Decoder): Type {
        val decodedValue: String = decoder.decodeString()
        // decodedValue を Type に戻す
        return ...
    }
   ```

5. [`@Serializable`](https://kotlinlang.org/api/kotlinx.serialization/kotlinx-serialization-core/kotlinx.serialization/-serializable/) アノテーションを使用して、クラスにカスタムシリアライザーを指定します。

    ```kotlin
    @Serializable(YourSerializer::class)
    data class Type(val stringValue: String)
   ```

以下は、`Color` を16進数文字列としてシリアライズするカスタムプリミティブシリアライザーの例です。

```kotlin
import kotlinx.serialization.*
import kotlinx.serialization.encoding.*
import kotlinx.serialization.descriptors.*
import kotlinx.serialization.json.*

//sampleStart
// Colorクラス用のカスタムシリアライザーを作成
object ColorAsStringSerializer : KSerializer<Color> {
    // シリアライズされるデータのスキーマを単一の文字列として定義
    override val descriptor: SerialDescriptor =
        // 一意の名前とPrimitiveKindを指定
        PrimitiveSerialDescriptor("my.app.Color", PrimitiveKind.STRING)

    // Color値が文字列としてどのようにシリアライズされるかを定義
    override fun serialize(encoder: Encoder, value: Color) {
        // RGB値を16進数文字列に変換
        val hexValue = value.rgb.toString(16).padStart(6, '0')
        // シリアライズされた値を文字列としてエンコード
        encoder.encodeString(hexValue)
    }

    // Color値が文字列からどのようにデシリアライズされるかを定義
    override fun deserialize(decoder: Decoder): Color {
        // シリアライズされた文字列値をデコード
        val hexValue = decoder.decodeString()
        // デコードされた値をColorに戻す
        return Color(hexValue.toInt(16))
    }
}
// ColorAsStringSerializerをColorクラスのカスタムシリアライザーとして指定
@Serializable(ColorAsStringSerializer::class)
data class Color(val rgb: Int)

fun main() {
    val color = Color(0x00FF00)
    // Color値をJSONにシリアライズ
    val jsonString = Json.encodeToString(color)

    println(jsonString)
    // "00ff00"

    // JSON文字列をColor値にデシリアライズ
    val deserializedColor = Json.decodeFromString<Color>(jsonString)

    println(deserializedColor.rgb)
    // 65280
}
//sampleEnd
```
{kotlin-runnable="true"}

### バイナリデータをBase64文字列としてシリアライズする {id="serialize-binary-data-as-base64-strings"}

カスタムプリミティブシリアライザーを使用すると、単純な値の変換にとどまらず、一般的なシリアライズタスクを解決できます。
そのようなタスクの1つが、バイナリデータを [Base64](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.io.encoding/-base64/) 文字列として表現することです。

APIによってデフォルトで使用するBase64バリアントが異なります。
[`Base64.Default`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.io.encoding/-base64/-default/) や [`Base64.Mime`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.io.encoding/-base64/-default/-mime.html) など、期待されるバリアントに一致するKotlin Base64エンコーダーを選択してください。

以下は、JSONフォーマットにおいて `ByteArray` を `Base64.Default` でBase64文字列としてシリアライズする例です。

```kotlin
import kotlinx.serialization.*
import kotlinx.serialization.json.*
import kotlinx.serialization.encoding.Encoder
import kotlinx.serialization.encoding.Decoder
import kotlinx.serialization.descriptors.*
import kotlin.io.encoding.*

//sampleStart
// ByteArrayをBase64文字列として表現する
// カスタムプリミティブシリアライザーを作成
object ByteArrayAsBase64Serializer : KSerializer<ByteArray> {

    // デフォルトのBase64バリアントを使用
    private val base64 = Base64.Default

    // シリアライズされた形式を単一のSTRINGプリミティブとして定義
    override val descriptor: SerialDescriptor
        get() = PrimitiveSerialDescriptor(
            "ByteArrayAsBase64Serializer",
            PrimitiveKind.STRING
        )

    // ByteArrayをBase64文字列としてエンコード
    override fun serialize(encoder: Encoder, value: ByteArray) {
        val base64Encoded = base64.encode(value)
        encoder.encodeString(base64Encoded)
    }

    // Base64文字列をByteArrayに戻すデコード
    override fun deserialize(decoder: Decoder): ByteArray {
        val base64Decoded = decoder.decodeString()
        return base64.decode(base64Decoded)
    }
}

@Serializable
data class Value(
    // このプロパティにカスタムシリアライザーを指定
    @Serializable(ByteArrayAsBase64Serializer::class)
    val base64Input: ByteArray
) {

    // ByteArray用の値ベースの等価性を実装
    override fun equals(other: Any?): Boolean {
        if (this === other) return true
        if (javaClass != other?.javaClass) return false
        other as Value
        return base64Input.contentEquals(other.base64Input)
    }

    // 配列の内容に基づいてhashCodeを計算
    override fun hashCode(): Int {
        return base64Input.contentHashCode()
    }
}

fun main() {
    val string = "PNG_IMAGE_DATA"
    val value = Value(string.toByteArray())

    // ValueをJSONにシリアライズ
    val encoded = Json.encodeToString(value)

    println(encoded)
    // {"base64Input":"UE5HX0lNQUdFX0RBVEE="}

    // JSONをValueに戻すデシリアライズ
    val decoded = Json.decodeFromString<Value>(encoded)

    println(decoded.base64Input.decodeToString())
    // PNG_IMAGE_DATA
}
//sampleEnd
```
{kotlin-runnable="true"}

### 別のシリアライザーへのシリアライズ処理の委譲 {id="delegate-serialization-to-another-serializer"}

シリアライズロジックをその型のシリアライザーに委譲することで、あるクラスを別の型としてシリアライズできます。
たとえば、このアプローチを使用して、クラスを `IntArray` のような非プリミティブ型としてシリアライズできます。

シリアライズを委譲するには、委譲先となる型のシリアライザーのプロパティを定義したカスタムシリアライザーを作成します。

1. `descriptor` プロパティをオーバーライドして、委譲先のシリアライザーの `descriptor` をラップします。

    > シリアライズを委譲する場合、元のクラスの `descriptor` や委譲先型の `descriptor` を直接使用することはできません。
    > 代わりに、委譲先シリアライザーの構造を再利用する新しい `descriptor` を作成してください。
    > 
    {style="note"}

2. `serialize()` 関数をオーバーライドして、クラスのインスタンスを委譲先の型に変換し、[`encoder.encodeSerializableValue()`](https://kotlinlang.org/api/kotlinx.serialization/kotlinx-serialization-core/kotlinx.serialization.encoding/-encoder/encode-serializable-value.html) 関数を使用して委譲先シリアライザーでエンコードします。
3. `deserialize()` 関数をオーバーライドして、委譲先シリアライザーを指定した [`decoder.decodeSerializableValue()`](https://kotlinlang.org/api/kotlinx.serialization/kotlinx-serialization-core/kotlinx.serialization.encoding/-decoder/decode-serializable-value.html) 関数を使用して値をデコードし、それをクラスのインスタンスに戻します。

以下は、シリアライズロジックを `IntArraySerializer` に委譲して `Color` クラスを `IntArray` としてシリアライズする例です。

```kotlin
import kotlinx.serialization.*
import kotlinx.serialization.encoding.*
import kotlinx.serialization.descriptors.*
import kotlinx.serialization.builtins.IntArraySerializer
import kotlinx.serialization.json.*

//sampleStart
// IntArraySerializerに委譲するカスタムシリアライザーを作成
class ColorIntArraySerializer : KSerializer<Color> {
    private val delegateSerializer = IntArraySerializer()
    override val descriptor = SerialDescriptor("my.app.Color", delegateSerializer.descriptor)

    // シリアライズロジックをIntArraySerializerに委譲
    override fun serialize(encoder: Encoder, value: Color) {
        val data = intArrayOf(
            (value.rgb shr 16) and 0xFF,
            (value.rgb shr 8) and 0xFF,
            value.rgb and 0xFF
        )
        encoder.encodeSerializableValue(delegateSerializer, data)
    }

    // デシリアライズを委譲し、IntArrayをColorに戻す
    override fun deserialize(decoder: Decoder): Color {
        val array = decoder.decodeSerializableValue(delegateSerializer)
        return Color((array[0] shl 16) or (array[1] shl 8) or array[2])
    }
}

@Serializable(ColorIntArraySerializer::class)
class Color(val rgb: Int)

fun main() {
    val green = Color(0x00ff00)

    println(Json.encodeToString(green))
    // [0,255,0]
}
//sampleEnd
```
{kotlin-runnable="true"}

配列表現を使用することはJSONでは一般的ではありませんが、`ByteArray` やバイナリ形式と併用すると、シリアライズされたデータのサイズを削減できます。

> JSON以外のシリアライゼーションフォーマットが配列をどのように扱うかについての詳細は、[CBORフォーマット](serialization-cbor.md) および [ProtoBufフォーマット](serialization-protobuf.md) を参照してください。
> 
{style="tip"}

### サロゲートクラスを使用したクラスのシリアライズ {id="serialize-classes-with-a-surrogate-class"}

次のような場合に、別のクラスのシリアライズ形式と一致するクラスである*サロゲートクラス（surrogate class）*を使用できます。

* クラス自体を変更することなく、そのシリアライズ方法を変更したい場合。
* [コンポジットシリアライザーの作成](#カスタムコンポジットシリアライザーの作成) を避けたい場合。
* 元のクラスを作成する前に、シリアライズされた形式を検証したい場合。
* 直接シリアライズすることがクラスのルールに適合しない場合を処理したい場合。

サロゲートクラスは [`private`](visibility-modifiers.md#class-members) にすることができ、`init` ブロックを使用してクラスのシリアル表現に制約を課すことができます。
また、シリアライズされる型名を変更しないように [カスタムシリアル名を定義する](serialization-customization-options.md#customize-serial-names) こともできます。

`r`、`g`、`b` プロパティに特定の範囲を持つJSONオブジェクトとして `Color` をシリアライズする例を見てみましょう。

```kotlin
// シリアライズされた形式に一致するサロゲートを定義
@Serializable
@SerialName("Color")
private class ColorSurrogate(val r: Int, val g: Int, val b: Int) {
    init {
        // シリアライズされた形式に制約を課す
        require(r in 0..255 && g in 0..255 && b in 0..255)
    }
}
```

[別のシリアライザーへのシリアライズ処理の委譲](#別のシリアライザーへのシリアライズ処理の委譲) と同様に、カスタムシリアライザーは元のクラスを別の表現に変換し、その表現の自動生成された `SerialDescriptor` をラップします。

> サロゲートクラスは独自の `serialName` を持つ `SerialDescriptor` を定義します。
> 各 `SerialDescriptor` は一意の `serialName` を持たなければならないため、サロゲートクラスの `SerialDescriptor` の構造は再利用できますが、その `serialName` は再利用できません。
>
{style="note"}

サロゲートクラス用に生成されたシリアライザーを取得するには、`ColorSurrogate.serializer()` を使用します。

```kotlin
object ColorSerializer : KSerializer<Color> {
    // ディスクリプタのserialNameは一意である必要がある
    override val descriptor: SerialDescriptor = SerialDescriptor("my.app.Color", ColorSurrogate.serializer().descriptor)

    // 元のクラスをサロゲート表現に変換
    override fun serialize(encoder: Encoder, value: Color) {
        val surrogate = ColorSurrogate((value.rgb shr 16) and 0xff, (value.rgb shr 8) and 0xff, value.rgb and 0xff)
        encoder.encodeSerializableValue(ColorSurrogate.serializer(), surrogate)
    }

    // サロゲート表現を元のクラスに戻す
    override fun deserialize(decoder: Decoder): Color {
        val surrogate = decoder.decodeSerializableValue(ColorSurrogate.serializer())
        return Color((surrogate.r shl 16) or (surrogate.g shl 8) or surrogate.b)
    }
}
```

最後に、クラスにカスタムシリアライザーを指定します。

```kotlin
import kotlinx.serialization.*
import kotlinx.serialization.encoding.*
import kotlinx.serialization.descriptors.*
import kotlinx.serialization.builtins.IntArraySerializer
import kotlinx.serialization.json.*

// カスタムプロパティを持つprivateなサロゲートクラスを定義
@Serializable
@SerialName("Color")
private class ColorSurrogate(val r: Int, val g: Int, val b: Int) {
    init {
        // シリアライズされた形式に制約を課す
        require(r in 0..255 && g in 0..255 && b in 0..255)
    }
}

// サロゲートとの相互変換を行うカスタムシリアライザーを作成
object ColorSerializer : KSerializer<Color> {
    // ラップされたSerialDescriptor用に一意のserialNameを定義
    override val descriptor: SerialDescriptor =
        SerialDescriptor("my.app.Color", ColorSurrogate.serializer().descriptor)

    // 元のクラスをサロゲート表現に変換
    override fun serialize(encoder: Encoder, value: Color) {
        val surrogate = ColorSurrogate((value.rgb shr 16) and 0xff, (value.rgb shr 8) and 0xff, value.rgb and 0xff)
        encoder.encodeSerializableValue(ColorSurrogate.serializer(), surrogate)
    }

    // サロゲート表現を元のクラスに戻す
    override fun deserialize(decoder: Decoder): Color {
        val surrogate = decoder.decodeSerializableValue(ColorSurrogate.serializer())
        return Color((surrogate.r shl 16) or (surrogate.g shl 8) or surrogate.b)
    }
}

//sampleStart
// クラスのカスタムシリアライザーとしてColorSerializerを指定
@Serializable(ColorSerializer::class)
class Color(val rgb: Int)

fun main() {
    val green = Color(0x00ff00)

    println(Json.encodeToString(green))
    // {"r":0,"g":255,"b":0}
}
//sampleEnd
```
{kotlin-runnable="true"}

### カスタムコンポジットシリアライザーの作成 {id="create-a-custom-composite-serializer"}

複数のプロパティを持つクラスなどの複雑なデータ構造を表現するには、コンポジットシリアライザーを使用できます。

[サロゲートクラス](#サロゲートクラスを使用したクラスのシリアライズ) を使用する場合と比較して、カスタムコンポジットシリアライザーを使用すると、追加の変換ステップなしで元のクラスのシリアライズ構造を直接定義できます。
これにより場合によってはパフォーマンスが向上することもありますが、より多くのシリアライズロジックを手動で記述する必要があります。

カスタムコンポジットシリアライザーを作成するには:

1. 対象のクラスに対して `KSerializer` を実装する `object` としてシリアライザーを作成します。

    ```kotlin
    object YourSerializer : KSerializer<Type>
    ```

2. `descriptor` プロパティをオーバーライドし、[`buildClassSerialDescriptor()`](https://kotlinlang.org/api/kotlinx.serialization/kotlinx-serialization-core/kotlinx.serialization.descriptors/build-class-serial-descriptor.html) 関数を使用してシリアライズスキーマを定義します。

   ```kotlin
   override val descriptor: SerialDescriptor =
       buildClassSerialDescriptor("com.example.Type") {
           // ...
       }
   ```
   
3. `buildClassSerialDescriptor()` 関数内で、[`element()`](https://kotlinlang.org/api/kotlinx.serialization/kotlinx-serialization-core/kotlinx.serialization.descriptors/element.html) 関数を使用して各プロパティを指定します。
   要素の順序によって、`0` から始まるインデックスが決まります。

   シリアライザーの `descriptor` の [`SerialKind`](https://kotlinlang.org/api/kotlinx.serialization/kotlinx-serialization-core/kotlinx.serialization.descriptors/-serial-kind/) によって、各 `element()` が何を表すかが決まります。
   クラスの `descriptor` では `element()` はプロパティを表し、enumの `descriptor` では `element()` は `RED` や `GREEN` などの定数を表します。

   ```kotlin
   override val descriptor: SerialDescriptor =
       buildClassSerialDescriptor("com.example.Type") {
           element<Int>("first")
           element<Int>("second")
       }
   ```

4. [`encodeStructure()`](https://kotlinlang.org/api/kotlinx.serialization/kotlinx-serialization-core/kotlinx.serialization.encoding/encode-structure.html) DSLを使用して `serialize()` 関数を実装します。
   そのブロック内では、ラムダのレシーバーは [`CompositeEncoder`](https://kotlinlang.org/api/kotlinx.serialization/kotlinx-serialization-core/kotlinx.serialization.encoding/-composite-encoder/) になります。これを使用して、`descriptor` で定義された順序に従い、各フィールドに対して [`encodeIntElement()`](https://kotlinlang.org/api/kotlinx.serialization/kotlinx-serialization-core/kotlinx.serialization.encoding/-composite-encoder/encode-int-element.html) などの関数を呼び出します。

   ```kotlin
   override fun serialize(encoder: Encoder, value: Type) =
       encoder.encodeStructure(descriptor) {
           encodeIntElement(descriptor, 0, value.first)
           encodeIntElement(descriptor, 1, value.second)
       }
   ```

5. [`decodeStructure()`](https://kotlinlang.org/api/kotlinx.serialization/kotlinx-serialization-core/kotlinx.serialization.encoding/decode-structure.html) DSLを使用して `deserialize()` 関数を実装します。
   そのブロック内では、ラムダのレシーバーは [`CompositeDecoder`](https://kotlinlang.org/api/kotlinx.serialization/kotlinx-serialization-core/kotlinx.serialization.encoding/-composite-decoder/) になります。これを使用して、[`decodeIntElement()`](https://kotlinlang.org/api/kotlinx.serialization/kotlinx-serialization-core/kotlinx.serialization.encoding/-composite-decoder/decode-int-element.html) などの関数を呼び出し、各プロパティをデコードします。

   ほとんどのフォーマットではデータを任意の順序でエンコードでき、これはシリアライザーの `descriptor` 内の要素の順序と異なる場合があります。
   どの `element()` をデコードするかを特定するには、[`decodeElementIndex()`](https://kotlinlang.org/api/kotlinx.serialization/kotlinx-serialization-core/kotlinx.serialization.encoding/-composite-decoder/decode-element-index.html) 関数を使用します。
   これ以上要素が残っていない場合は [`CompositeDecoder.DECODE_DONE`](https://kotlinlang.org/api/kotlinx.serialization/kotlinx-serialization-core/kotlinx.serialization.encoding/-composite-decoder/-companion/-d-e-c-o-d-e_-d-o-n-e.html) を返します。これを使用して現在の構造のデコードを停止します。

   ```kotlin
   override fun deserialize(decoder: Decoder): Type =
       decoder.decodeStructure(descriptor) {
           var first = 0
           var second = ""
   
           // decodeElementIndexを使用して順序に関係なく正しくデコードする
           while (true) {
               when (val index = decodeElementIndex(descriptor)) {
                   0 -> first = decodeStringElement(descriptor, 0)
                   1 -> second = decodeIntElement(descriptor, 1)
                   CompositeDecoder.DECODE_DONE -> break
                   else -> error("Unexpected index: $index")
               }
           }
   
           Type(first, second)
       }
   ```

6. `@Serializable(YourSerializer::class)` アノテーションを使用して、クラスにカスタムシリアライザーを指定します。

   > 各要素を手動で処理することなくデータの変換や再構築だけを行いたい場合は、よりシンプルなアプローチとして [別のシリアライザーへのシリアライズ処理の委譲](#別のシリアライザーへのシリアライズ処理の委譲) や [サロゲートクラス](#サロゲートクラスを使用したクラスのシリアライズ) の使用を検討してください。
   >
   {style="tip"}

複数のプロパティを持つ `Color` クラスをシリアライズする方法の例を見てみましょう。

```kotlin
import kotlinx.serialization.*
import kotlinx.serialization.encoding.*
import kotlinx.serialization.descriptors.*
import kotlinx.serialization.json.*

//sampleStart
// 複数のプロパティを持つColorクラス用のカスタムシリアライザーを作成
object ColorAsObjectSerializer : KSerializer<Color> {
    // Colorクラスのスキーマを定義
    override val descriptor: SerialDescriptor =
        buildClassSerialDescriptor("my.app.Color") {
            // element()関数で各プロパティをその型と名前とともに指定
            element<Int>("r")
            element<Int>("g")
            element<Int>("b")
        }

    // descriptorで指定された順序でColorをシリアライズ
    override fun serialize(encoder: Encoder, value: Color) =
        encoder.encodeStructure(descriptor) {
            encodeIntElement(descriptor, 0, (value.rgb shr 16) and 0xff)
            encodeIntElement(descriptor, 1, (value.rgb shr 8) and 0xff)
            encodeIntElement(descriptor, 2, value.rgb and 0xff)
        }

    // データをColorオブジェクトに戻すデシリアライズ
    override fun deserialize(decoder: Decoder): Color =
        decoder.decodeStructure(descriptor) {
            // デコードされた値を保持する一時変数
            var r = -1
            var g = -1
            var b = -1
            // フォーマットによって要素の順序が異なる場合があるためdecodeElementIndex()を使用
            while (true) {
                when (val index = decodeElementIndex(descriptor)) {
                    0 -> r = decodeIntElement(descriptor, 0)
                    1 -> g = decodeIntElement(descriptor, 1)
                    2 -> b = decodeIntElement(descriptor, 2)
                    CompositeDecoder.DECODE_DONE -> break
                    else -> error("Unexpected index: $index")
                }
            }
            // 値を検証してColorを再構築
            require(r in 0..255 && g in 0..255 && b in 0..255)
            Color((r shl 16) or (g shl 8) or b)
        }
}

// Color用のカスタムシリアライザーを指定
@Serializable(ColorAsObjectSerializer::class)
data class Color(val rgb: Int)

fun main() {
    val color = Color(0x00ff00)
    val string = Json.encodeToString(color)

    println(string)
    // {"r":0,"g":255,"b":0}

    require(Json.decodeFromString<Color>(string) == color)
}
//sampleEnd
```
{kotlin-runnable="true"}

### カスタムシリアライザーでのデフォルト値のエンコード {id="encode-default-values-in-custom-serializers"}

プラグインによって生成されたシリアライザーは、デフォルト値と等しい値をエンコーダーがエンコードする必要があるかどうかをチェックします。
たとえば、JSONではこれは [`encodeDefaults`](https://kotlinlang.org/api/kotlinx.serialization/kotlinx-serialization-json/kotlinx.serialization.json/-json-builder/encode-defaults.html) プロパティによって制御されます。

カスタムシリアライザーで同じ動作を実現するには、シリアライザーの `descriptor` とエンコード対象の要素のインデックスを指定して [`shouldEncodeElementDefault()`](https://kotlinlang.org/api/kotlinx.serialization/kotlinx-serialization-core/kotlinx.serialization.encoding/-composite-encoder/should-encode-element-default.html) 関数を使用します。

> プロパティに [`@EncodeDefault`](https://kotlinlang.org/api/kotlinx.serialization/kotlinx-serialization-core/kotlinx.serialization/-encode-default/) が注釈されている場合、プラグイン生成シリアライザーは `shouldEncodeElementDefault()` を呼び出しません。
>
{style="note"}

以下は、`encodeDefaults` が有効な場合にカスタムシリアライザーがデフォルトの `Color` 値をエンコードする例です。

```kotlin
import kotlinx.serialization.*
import kotlinx.serialization.encoding.*
import kotlinx.serialization.descriptors.*
import kotlinx.serialization.json.*

//sampleStart
// 複数のプロパティを持つColorクラス用のカスタムシリアライザーを作成
object ColorAsObjectSerializer : KSerializer<Color> {
    // Colorクラスのスキーマを定義
    override val descriptor: SerialDescriptor =
        buildClassSerialDescriptor("my.app.Color") {
            // element()関数で各プロパティをその型と名前とともに指定
            element<Int>("r", isOptional = true)
            element<Int>("g", isOptional = true)
            element<Int>("b", isOptional = true)
        }
   
    override fun serialize(encoder: Encoder, value: Color) =
        encoder.encodeStructure(descriptor) {
            val r = (value.rgb shr 16) and 0xff
            val g = (value.rgb shr 8) and 0xff
            val b = value.rgb and 0xff

            // rがデフォルト値と異なる場合、
            // またはエンコーダーが第1要素のデフォルト値をエンコードする必要がある場合にrをエンコード
            if (r != 0 || shouldEncodeElementDefault(descriptor, 0)) {
                encodeIntElement(descriptor, 0, r)
            }
            if (g != 255 || shouldEncodeElementDefault(descriptor, 1)) {
                encodeIntElement(descriptor, 1, g)
            }
            if (b != 0 || shouldEncodeElementDefault(descriptor, 2)) {
                encodeIntElement(descriptor, 2, b)
            }
        }

    // データをColorオブジェクトに戻すデシリアライズ
    override fun deserialize(decoder: Decoder): Color =
        decoder.decodeStructure(descriptor) {
            var r = 0
            var g = 255
            var b = 0

            while (true) {
                when (val index = decodeElementIndex(descriptor)) {
                    0 -> r = decodeIntElement(descriptor, 0)
                    1 -> g = decodeIntElement(descriptor, 1)
                    2 -> b = decodeIntElement(descriptor, 2)
                    CompositeDecoder.DECODE_DONE -> break
                    else -> error("Unexpected index: $index")
                }
            }
            require(r in 0..255 && g in 0..255 && b in 0..255)
            Color((r shl 16) or (g shl 8) or b)
        }
}

// Color用のカスタムシリアライザーを指定
@Serializable(ColorAsObjectSerializer::class)
data class Color(val rgb: Int = 0x00ff00)

fun main() {
    val color = Color()
    val stringWithDefaults = Json { encodeDefaults = true }.encodeToString(color)
   
    println(stringWithDefaults)
    // {"r":0,"g":255,"b":0}
}
//sampleEnd
```
{kotlin-runnable="true"}

### シーケンシャルデコードによるデシリアライズの最適化 {id="optimize-deserialization-with-sequential-decoding"}
<primary-label ref="experimental-general"/>

一部のフォーマットは厳密に順序付けられたスキーマを使用し、シーケンシャル（順次）デコードをサポートできます。
これらのフォーマットでは、[`decodeSequentially()`](https://kotlinlang.org/api/kotlinx.serialization/kotlinx-serialization-core/kotlinx.serialization.encoding/-composite-decoder/decode-sequentially.html) 関数を使用してデシリアライズを最適化できます。
この関数は、現在の構造を順序通りにデコードできる場合に `true` を返します。
そのケースを個別に処理することで、個々の要素を順不同でデコードする複雑なロジックをスキップできます。

> `kotlinx.serialization` プラグインによって生成されたシリアライザーはこの最適化を使用します。
> 
{style="tip"}

以下は、可能な場合に `decodeSequentially()` を使用してデシリアライズを最適化する例です。

```kotlin
import kotlinx.serialization.*
import kotlinx.serialization.encoding.*
import kotlinx.serialization.descriptors.*
import kotlinx.serialization.json.*

object ColorAsObjectSerializer : KSerializer<Color> {

    override val descriptor: SerialDescriptor =
        buildClassSerialDescriptor("my.app.Color") {
            element<Int>("r")
            element<Int>("g")
            element<Int>("b")
        }

    override fun serialize(encoder: Encoder, value: Color) =
        encoder.encodeStructure(descriptor) {
            encodeIntElement(descriptor, 0, (value.rgb shr 16) and 0xff)
            encodeIntElement(descriptor, 1, (value.rgb shr 8) and 0xff)
            encodeIntElement(descriptor, 2, value.rgb and 0xff)
        }

//sampleStart
    override fun deserialize(decoder: Decoder): Color =
        decoder.decodeStructure(descriptor) {
            var r = -1
            var g = -1
            var b = -1
            // フォーマットがデータを順番に格納している場合は直接順序通りに値をデコード
            @OptIn(ExperimentalSerializationApi::class)
            if (decodeSequentially()) {
                r = decodeIntElement(descriptor, 0)           
                g = decodeIntElement(descriptor, 1)  
                b = decodeIntElement(descriptor, 2)
            } else while (true) {
                // 要素が順不同になる可能性があるフォーマット向けの正しいデコードを保証
                when (val index = decodeElementIndex(descriptor)) {
                    0 -> r = decodeIntElement(descriptor, 0)
                    1 -> g = decodeIntElement(descriptor, 1)
                    2 -> b = decodeIntElement(descriptor, 2)
                    CompositeDecoder.DECODE_DONE -> break
                    else -> error("Unexpected index: $index")
                }
            }
            require(r in 0..255 && g in 0..255 && b in 0..255)
            Color((r shl 16) or (g shl 8) or b)
        }
//sampleEnd
}

@Serializable(ColorAsObjectSerializer::class)
data class Color(val rgb: Int)

fun main() {
    val color = Color(0x00ff00)
    val string = Json.encodeToString(color)

    println(string)
    // {"r":0,"g":255,"b":0}

    require(Json.decodeFromString<Color>(string) == color)
}
```
{kotlin-runnable="true"}

### ジェネリック型用のカスタムシリアライザーの作成 {id="create-a-custom-serializer-for-generic-types"}

ジェネリッククラス用のカスタムシリアライザーを作成するには、シリアライザーを `object` ではなく `class` として宣言し、各ジェネリック型パラメータに対して1つの `KSerializer` コンストラクタパラメータを持たせます。

各型パラメータのシリアライズロジックを対応する `KSerializer` に委譲できるため、それぞれのシリアライズ規則に従ってエンコードされます。

ジェネリックな `Box<T>` クラスを使用した例を見てみましょう。

```kotlin
import kotlinx.serialization.*
import kotlinx.serialization.encoding.*
import kotlinx.serialization.descriptors.*
import kotlinx.serialization.json.*

//sampleStart
@Serializable(BoxSerializer::class)
data class Box<T>(val contents: T)

// Box<T>用のカスタムシリアライザーをクラスとして作成
class BoxSerializer<T>(private val dataSerializer: KSerializer<T>) : KSerializer<Box<T>> {
    // Box<T>ディスクリプタ用に一意のserialNameを定義
    override val descriptor: SerialDescriptor =
        SerialDescriptor("my.app.Box", dataSerializer.descriptor)

    // シリアライズとデシリアライズを委譲
    override fun serialize(encoder: Encoder, value: Box<T>) = dataSerializer.serialize(encoder, value.contents)
    override fun deserialize(decoder: Decoder) = Box(dataSerializer.deserialize(decoder))
}

@Serializable
data class Project(val name: String)

fun main() {
    val box = Box(Project("kotlinx.serialization"))
    val string = Json.encodeToString(box)

    println(string)
    // {"name":"kotlinx.serialization"}

    println(Json.decodeFromString<Box<Project>>(string))
    // Box(contents=Project(name=kotlinx.serialization))
}
//sampleEnd
```
{kotlin-runnable="true"}

### プラグイン生成シリアライザーとカスタムシリアライザーの併用 {id="use-a-plugin-generated-serializer-together-with-a-custom-serializer"}
<primary-label ref="experimental-general"/>

デフォルトでは、`@Serializable(YourSerializer::class)` を使用してカスタムシリアライザーを指定した場合、Kotlinシリアライゼーションプラグインはシリアライザーを生成しません。

しかし、以下のようなケースでは、プラグインが生成したシリアライザーを引き続き使用したい場合があります。

* プラグインが生成したシリアライザーをフォールバック戦略として使用する場合。
* デフォルトの構造にアクセスするために、プラグインが生成した `descriptor` を検査する場合。
* カスタムシリアライザーを使用しないサブクラスで、デフォルトのシリアライズ動作を再利用する場合。

シリアライズ可能なクラスに [`@KeepGeneratedSerializer`](https://kotlinlang.org/api/kotlinx.serialization/kotlinx-serialization-core/kotlinx.serialization/-keep-generated-serializer/) アノテーションを付けることで、カスタムシリアライザーと並行して自動生成されたシリアライザーを保持できます。
プラグインが生成したシリアライザーにアクセスするには、シリアライズ可能なクラスのコンパニオンオブジェクト上で `.generatedSerializer()` 関数を使用します。

これは、`JsonTransformingSerializer` を使用して [JSON構造を調整しつつ、デフォルトのシリアライズロジックのためにプラグイン生成シリアライザーを再利用する](serialization-transform-json.md#add-custom-behavior-to-the-default-serializer) 場合にも便利です。

以下は、カスタムシリアライザーとプラグイン生成シリアライザーの両方を使用する例です。

```kotlin
import kotlinx.serialization.*
import kotlinx.serialization.json.*
import kotlinx.serialization.encoding.*
import kotlinx.serialization.descriptors.*

object ColorAsStringSerializer : KSerializer<Color> {
    override val descriptor: SerialDescriptor = PrimitiveSerialDescriptor("my.app.ColorAsString", PrimitiveKind.STRING)

    override fun serialize(encoder: Encoder, value: Color) {
        val string = value.rgb.toString(16).padStart(6, '0')
        encoder.encodeString(string)
    }

    override fun deserialize(decoder: Decoder): Color {
        val string = decoder.decodeString()
        return Color(string.toInt(16))
    }
}

//sampleStart
@OptIn(ExperimentalSerializationApi::class)
@KeepGeneratedSerializer
@Serializable(ColorAsStringSerializer::class)
class Color(val rgb: Int)

fun main() {
    val green = Color(0x00ff00)

    // カスタムシリアライザーを使用
    println(Json.encodeToString(green))
    // "00ff00"

    // プラグインが生成したシリアライザーを使用
    println(Json.encodeToString(Color.generatedSerializer(), green))
    // {"rgb":65280}

}
//sampleEnd
```
{kotlin-runnable="true"}

## シリアライザーの適用 {id="apply-serializers"}

カスタムシリアライザーは、独自のクラスだけでなくサードパーティの型にも適用できます。
[java.util.Date](https://docs.oracle.com/javase/8/docs/api/java/util/Date.html) などのサードパーティの型はソースコードを変更できないため、直接 [`@Serializable`](https://kotlinlang.org/api/kotlinx.serialization/kotlinx-serialization-core/kotlinx.serialization/-serializable/) アノテーションを付けることはできません。

### シリアライザーを手動で渡す {id="pass-a-serializer-manually"}

カスタムシリアライザーを使用して型をシリアライズするには、シリアライザーを作成し、[`Json.encodeToString()`](https://kotlinlang.org/api/kotlinx.serialization/kotlinx-serialization-json/kotlinx.serialization.json/-json/encode-to-string.html) や [`Json.decodeFromString()`](https://kotlinlang.org/api/kotlinx.serialization/kotlinx-serialization-json/kotlinx.serialization.json/-json/decode-from-string.html) などの関数のオーバーロードに明示的に渡します。

以下は、`Date` 値をUnixエポックからのミリ秒数としてシリアライズする例です。

```kotlin
import kotlinx.serialization.*
import kotlinx.serialization.encoding.*
import kotlinx.serialization.descriptors.*
import kotlinx.serialization.json.*
import java.util.Date
import java.text.SimpleDateFormat

//sampleStart
// Dateのソースコードにアクセスできないため、@Serializableは使用できない
object DateAsLongSerializer : KSerializer<Date> {
    override val descriptor: SerialDescriptor = PrimitiveSerialDescriptor("my.app.DateAsLong", PrimitiveKind.LONG)
    override fun serialize(encoder: Encoder, value: Date) = encoder.encodeLong(value.time)
    override fun deserialize(decoder: Decoder): Date = Date(decoder.decodeLong())
}

fun main() {
    val kotlin10ReleaseDate = SimpleDateFormat("yyyy-MM-ddX").parse("2016-02-15+00") 

    // Dateをミリ秒単位のLongとしてシリアライズ
    println(Json.encodeToString(DateAsLongSerializer, kotlin10ReleaseDate))    
    // 1455494400000
}
//sampleEnd
```
{kotlin-runnable="true"}

### プロパティにシリアライザーを指定する {id="specify-a-serializer-on-a-property"}

型がシリアライズ可能なクラスのプロパティとして使用されている場合は、そのプロパティに `@Serializable` アノテーションを付けてカスタムシリアライザーを指定します。

```kotlin
import kotlinx.serialization.*
import kotlinx.serialization.encoding.*
import kotlinx.serialization.descriptors.*
import kotlinx.serialization.json.*
import java.util.Date
import java.text.SimpleDateFormat

object DateAsLongSerializer : KSerializer<Date> {
    override val descriptor: SerialDescriptor = PrimitiveSerialDescriptor("my.app.DateAsLong", PrimitiveKind.LONG)
    override fun serialize(encoder: Encoder, value: Date) = encoder.encodeLong(value.time)
    override fun deserialize(decoder: Decoder): Date = Date(decoder.decodeLong())
}

//sampleStart
@Serializable
class ProgrammingLanguage(
    val name: String,
    // Dateプロパティにカスタムシリアライザーを指定
    @Serializable(DateAsLongSerializer::class)
    val stableReleaseDate: Date
)

fun main() {
    val data = ProgrammingLanguage("Kotlin", SimpleDateFormat("yyyy-MM-ddX").parse("2016-02-15+00"))

    println(Json.encodeToString(data))
    // {"name":"Kotlin","stableReleaseDate":1455494400000}
}
//sampleEnd
```
{kotlin-runnable="true"}

### 型にシリアライザーを指定する {id="specify-a-serializer-on-a-type"}

`@Serializable` アノテーションは型に直接適用することもできます。
これを使用すると、`List<Date>` のようにジェネリック型引数として使用されている型に対してカスタムシリアライザーを指定できます。

```kotlin
import kotlinx.serialization.*
import kotlinx.serialization.encoding.*
import kotlinx.serialization.descriptors.*
import kotlinx.serialization.json.*
import java.util.Date
import java.text.SimpleDateFormat

object DateAsLongSerializer : KSerializer<Date> {
    override val descriptor: SerialDescriptor = PrimitiveSerialDescriptor("my.app.DateAsLong", PrimitiveKind.LONG)
    override fun serialize(encoder: Encoder, value: Date) = encoder.encodeLong(value.time)
    override fun deserialize(decoder: Decoder): Date = Date(decoder.decodeLong())
}

//sampleStart
@Serializable          
class ProgrammingLanguage(
    val name: String,
     // ジェネリック型引数としてのDateにカスタムシリアライザーを指定
    val releaseDates: List<@Serializable(DateAsLongSerializer::class) Date>
)

fun main() {
    val df = SimpleDateFormat("yyyy-MM-ddX")
    val data = ProgrammingLanguage("Kotlin", listOf(df.parse("2023-07-06+00"), df.parse("2023-04-25+00"), df.parse("2022-12-28+00")))
 
   println(Json.encodeToString(data))
    // {"name":"Kotlin","releaseDates":[1688601600000,1682380800000,1672185600000]}
}
//sampleEnd
```
{kotlin-runnable="true"}

### ファイル単位でシリアライザーを指定する {id="specify-a-serializer-for-a-file"}

ソースファイル内の指定された型のすべてのプロパティにシリアライザーを適用するには、ファイルの先頭に [`@UseSerializers`](https://kotlinlang.org/api/kotlinx.serialization/kotlinx-serialization-core/kotlinx.serialization/-use-serializers/) アノテーションを追加します。

```kotlin
@file:UseSerializers(DateAsLongSerializer::class)
```

これにより、ファイル内のその型のすべてのインスタンスに `DateAsLongSerializer` が適用されるため、各プロパティに個別に注釈を付ける必要がなくなります。

以下はその例です。

```kotlin
// ファイル内のその型のすべてのプロパティにカスタムシリアライザーを適用
@file:UseSerializers(DateAsLongSerializer::class)

import kotlinx.serialization.*
import kotlinx.serialization.encoding.*
import kotlinx.serialization.descriptors.*
import kotlinx.serialization.json.*
import java.util.Date
import java.text.SimpleDateFormat

object DateAsLongSerializer : KSerializer<Date> {
    override val descriptor: SerialDescriptor = PrimitiveSerialDescriptor("my.app.DateAsLong", PrimitiveKind.LONG)
    override fun serialize(encoder: Encoder, value: Date) = encoder.encodeLong(value.time)
    override fun deserialize(decoder: Decoder): Date = Date(decoder.decodeLong())
}

// Dateプロパティにファイルレベルのシリアライザーを使用
@Serializable
class ProgrammingLanguage(val name: String, val stableReleaseDate: Date)

fun main() {
    val data = ProgrammingLanguage("Kotlin", SimpleDateFormat("yyyy-MM-ddX").parse("2016-02-15+00"))
 
   println(Json.encodeToString(data))
    // {"name":"Kotlin","stableReleaseDate":1455494400000}
}
```
{kotlin-runnable="true"}

### 型エイリアス（typealias）でシリアライザーを指定する {id="specify-serializers-with-type-aliases"}

Kotlinシリアライゼーションでは、通常 `@Serializable` アノテーションを使用して明示的にシリアライズ戦略を指定します。[コンテキストシリアライゼーション](#コンテキストシリアライゼーションの実装) を除き、グローバルなシリアライザー設定は提供されていません。

同じシリアライザーを多くの場所で繰り返し使用する場合は、シリアライザーアノテーションを付加した [`typealias`](type-aliases.md) を定義できます。

これにより、使用する箇所ごとに `@Serializable` アノテーションを追加することなく、アノテーションが付与された型を再利用できます。

以下は、`typealias` を使用して `Date` に `DateAsLongSerializer` と `DateAsSimpleTextSerializer` を適用する例です。

```kotlin
import kotlinx.serialization.*
import kotlinx.serialization.encoding.*
import kotlinx.serialization.descriptors.*
import kotlinx.serialization.json.*
import java.util.Date
import java.text.SimpleDateFormat
import java.util.TimeZone

//sampleStart
object DateAsLongSerializer : KSerializer<Date> {
    override val descriptor: SerialDescriptor = PrimitiveSerialDescriptor("my.app.DateAsLong", PrimitiveKind.LONG)
    override fun serialize(encoder: Encoder, value: Date) = encoder.encodeLong(value.time)
    override fun deserialize(decoder: Decoder): Date = Date(decoder.decodeLong())
}

// Dateをフォーマットされた文字列（yyyy-MM-dd）としてエンコードするシリアライザーを定義
object DateAsSimpleTextSerializer: KSerializer<Date> {
    override val descriptor: SerialDescriptor = PrimitiveSerialDescriptor("my.app.DateAsSimpleText", PrimitiveKind.LONG)
    private val format = SimpleDateFormat("yyyy-MM-dd").apply {
        // 出力の一貫性を保つためにタイムゾーンをUTCに設定
        setTimeZone(TimeZone.getTimeZone("UTC"))
    }
    override fun serialize(encoder: Encoder, value: Date) = encoder.encodeString(format.format(value))
    override fun deserialize(decoder: Decoder): Date = format.parse(decoder.decodeString())
}

// 各出現箇所に注釈を付けるのを避けるため、typealiasを使用してグローバルシリアライザーを適用
typealias DateAsLong = @Serializable(DateAsLongSerializer::class) Date

typealias DateAsText = @Serializable(DateAsSimpleTextSerializer::class) Date

// Dateプロパティにカスタムシリアライザーを適用するためにtypealiasを使用
@Serializable          
class ProgrammingLanguage(val stableReleaseDate: DateAsText, val lastReleaseTimestamp: DateAsLong)

fun main() {
    val format = SimpleDateFormat("yyyy-MM-ddX")
    val data = ProgrammingLanguage(format.parse("2016-02-15+00"), format.parse("2022-07-07+00"))

    println(Json.encodeToString(data))
    // {"stableReleaseDate":"2016-02-15","lastReleaseTimestamp":1657152000000}
}
//sampleEnd
```
{kotlin-runnable="true"}

### コンテキストシリアライゼーションの実装 {id="implement-contextual-serialization"}

デフォルトでは、シリアライズ戦略はコンパイル時に定義されます。
*コンテキストシリアライゼーション（Contextual serialization）* を使用すると、オブジェクトツリーの深い位置にネストされている場合でも、実行時に特定の型のシリアライズ戦略を調整できます。

たとえば、コンテキストシリアライゼーションを使用すると、使用されているプロトコルのバージョンに応じて、JSON形式の `java.util.Date` を ISO 8601 の `String` としてシリアライズするか、`Long` としてシリアライズするかを切り替えることができます。
このアプローチは、組み込みの [`ContextualSerializer`](https://kotlinlang.org/api/kotlinx.serialization/kotlinx-serialization-core/kotlinx.serialization/-contextual-serializer/) クラスによってサポートされています。

コンテキストシリアライゼーションは、実行時に `SerializersModule` から型のカスタムシリアライザーを選択します。

コンテキストシリアライゼーションを実装するには:

1. シリアライズ可能なクラスのプロパティに [`@Contextual`](https://kotlinlang.org/api/kotlinx.serialization/kotlinx-serialization-core/kotlinx.serialization/-contextual/) アノテーションを付けます。

   > [`@Contextual`](https://kotlinlang.org/api/kotlinx.serialization/kotlinx-serialization-core/kotlinx.serialization/-contextual/) アノテーションは、[`ContextualSerializer`](https://kotlinlang.org/api/kotlinx.serialization/kotlinx-serialization-core/kotlinx.serialization/-contextual-serializer/) クラスのショートカットです。
   > 同じファイル内の複数のプロパティにコンテキストシリアライゼーションを適用するには、[`@UseContextualSerialization`](https://kotlinlang.org/api/kotlinx.serialization/kotlinx-serialization-core/kotlinx.serialization/-use-contextual-serialization/) アノテーションを使用します。
   >
   {style="tip"}

2. [`SerializersModule()`](https://kotlinlang.org/api/kotlinx.serialization/kotlinx-serialization-core/kotlinx.serialization.modules/-serializers-module.html) ビルダー関数を使用して [`SerializersModule`](https://kotlinlang.org/api/kotlinx.serialization/kotlinx-serialization-core/kotlinx.serialization.modules/-serializers-module/) を作成します。
   [`contextual()`](https://kotlinlang.org/api/kotlinx.serialization/kotlinx-serialization-core/kotlinx.serialization.modules/contextual.html) 関数を使用して、コンテキストシリアライゼーション用のカスタムシリアライザーを登録します。

    `SerializersModule` がないと、デフォルトのシリアライザーを持たないコンテキスト注釈付きの型のシリアライズまたはデシリアライズ中に `SerializationException` がスローされます。

3. `Json` インスタンスを作成し、[`serializersModule`](https://kotlinlang.org/api/kotlinx.serialization/kotlinx-serialization-json/kotlinx.serialization.json/-json-builder/serializers-module.html) プロパティに `SerializersModule` を渡します。

以下はその例です。

```kotlin
import kotlinx.serialization.*
import kotlinx.serialization.encoding.*
import kotlinx.serialization.descriptors.*
import kotlinx.serialization.json.*
import java.util.Date
import java.text.SimpleDateFormat

//sampleStart
// Date用のカスタムシリアライザーを作成
object DateAsLongSerializer : KSerializer<Date> {
    override val descriptor: SerialDescriptor = PrimitiveSerialDescriptor("my.app.Date", PrimitiveKind.LONG)
    override fun serialize(encoder: Encoder, value: Date) = encoder.encodeLong(value.time)
    override fun deserialize(decoder: Decoder): Date = Date(decoder.decodeLong())
}

@Serializable
class ProgrammingLanguage(
    val name: String,
    // Dateにコンテキストシリアライゼーションを指定
    @Contextual
    val stableReleaseDate: Date
)

// SerializersModuleを定義し、Date用のコンテキストシリアライザーを登録
private val module = SerializersModule { 
    contextual(DateAsLongSerializer)
}

// カスタムSerializersModuleを指定してJsonインスタンスを作成
val format = Json { serializersModule = module }

fun main() {
    val data = ProgrammingLanguage("Kotlin", SimpleDateFormat("yyyy-MM-ddX").parse("2016-02-15+00"))
 
   println(format.encodeToString(data))
    // {"name":"Kotlin","stableReleaseDate":1455494400000}
}
//sampleEnd
```
{kotlin-runnable="true"}

#### ジェネリッククラスのコンテキストシリアライズ {id="serialize-generic-classes-contextually"}

ジェネリッククラスをコンテキストに応じてシリアライズするには、`SerializersModule` に関数を登録できます。
この関数はジェネリック型引数のシリアライザーを受け取り、実行時に対応するシリアライザーを作成します。

[ジェネリック型引数は変化する可能性がある](#ジェネリック型用のカスタムシリアライザーの作成) ため、ジェネリッククラスに対して単一のシリアライザーインスタンスを使用することはできません。
たとえば、次のアプローチは `Box<Int>` に対してのみ機能し、`Box<String>` などの他の型には機能しません。

```kotlin
val incorrectModule = SerializersModule {
    // これはBox<Int>に対してのみ機能し、Box<String>や他の型には機能しない
    contextual(BoxSerializer(Int.serializer()))
}
```

代わりに、型引数のシリアライザーに基づいて `Box<T>` などのジェネリック型用のシリアライザーを作成する関数を登録します。
以下はその例です。

```kotlin
val correctModule = SerializersModule {
    // args[0] は T のシリアライザー
    // 例: Int.serializer() や String.serializer()
    contextual(Box::class) { args -> BoxSerializer(args[0]) }
}
```

> ジェネリッククラス用と非ジェネリッククラス用のモジュールなど、複数の `SerializersModule` インスタンスは `plus` 演算子を使用して結合できます。
> 詳細については、[複数の `SerializersModule` インスタンスのマージ](serialization-polymorphism.md#merge-multiple-serializersmodule-instances) を参照してください。
>
{style="tip"}

## 次のステップ {id="what-s-next"}

* カスタムシリアライザーを作成する代わりに、JSON要素ツリーを変更して [JSON構造を変換する](serialization-transform-json.md) 方法について確認してください。
* [カスタムシリアライゼーションフォーマット](serialization-custom-formats.md) でカスタムフォーマットの作成方法を学びます。
* [CBOR](serialization-cbor.md) や [ProtoBuf](serialization-protobuf.md) などの実験的なシリアライゼーションフォーマットを探索してください。