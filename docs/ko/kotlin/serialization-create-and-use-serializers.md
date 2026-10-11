[//]: # (title: 시리얼라이저 생성 및 사용)

시리얼라이저(serializer)는 직렬화된 형태에서 Kotlin 타입의 구조를 정의하며, `Json`과 같은 포맷 구현체는 해당 구조가 인코딩되는 방식을 제어합니다.

![Kotlin 값이 시리얼라이저에 의해 기본 타입 시퀀스로 직렬화되고, 포맷에 의해 인코딩된 데이터로 인코딩된 다음, 다시 기본 타입 시퀀스로 디코딩되어 시리얼라이저에 의해 Kotlin 값으로 역직렬화되는 과정을 나타낸 다이어그램](serialization-encoding.svg){width="700"}

시리얼라이저는 [`KSerializer`](https://kotlinlang.org/api/kotlinx.serialization/kotlinx-serialization-core/kotlinx.serialization/-k-serializer/) 인터페이스를 통해 특정 타입에 대한 직렬화 및 역직렬화 전략을 정의합니다.
Kotlin serialization은 내장 타입, 컬렉션 등을 위한 시리얼라이저를 기본으로 제공합니다.

이러한 시리얼라이저를 사용하여 값을 직렬화하거나 직렬화된 형태의 구조를 검사할 수 있으며, 커스텀 시리얼라이저를 사용하면 구조를 직접 정의할 수도 있습니다.

## 시리얼라이저 가져오기 {id="obtain-serializers"}

클래스에 [`@Serializable`](https://kotlinlang.org/api/kotlinx.serialization/kotlinx-serialization-core/kotlinx.serialization/-serializable/) 애너테이션을 추가하면, Kotlin serialization 플러그인이 해당 클래스에 대한 [`KSerializer`](https://kotlinlang.org/api/kotlinx.serialization/kotlinx-serialization-core/kotlinx.serialization/-k-serializer/)를 생성합니다.

이렇게 자동 생성된 시리얼라이저를 가져오려면 생성된 `.serializer()` 함수를 호출합니다.
시리얼라이저를 `Json.encodeToString()`과 같은 함수에 직접 사용하거나, [`descriptor`](https://kotlinlang.org/api/kotlinx.serialization/kotlinx-serialization-core/kotlinx.serialization/-k-serializer/descriptor.html) 프로퍼티에 접근하여 해당 타입이 직렬화된 형태의 구조를 검사할 수 있습니다.

다음은 단일 정수 프로퍼티를 가진 `Color` 클래스를 정의하고 직렬화된 형태의 구조를 검사하는 예제입니다.

```kotlin
import kotlinx.serialization.*

//sampleStart
@Serializable
data class Color(val rgb: Int)

fun main() {
    // Color 클래스용으로 생성된 시리얼라이저를 가져옵니다.
    val colorSerializer: KSerializer<Color> = Color.serializer()

    println(colorSerializer.descriptor)
    // Color(rgb: kotlin.Int)
}
//sampleEnd
```
{kotlin-runnable="true"}

> [내장 기본 타입(Primitive types) 및 `String`](serialization-serialize-builtin-types.md) 또한 `Int.serializer()` 및 `String.serializer()`와 같이 `.serializer()` 함수를 통해 시리얼라이저를 제공합니다.
> 
{style="note"}

최상위 `serializer<T>()` 함수를 사용하면 파라미터화된 타입을 포함한 모든 타입의 시리얼라이저를 가져올 수 있습니다.

```kotlin
import kotlinx.serialization.*

//sampleStart
@Serializable
@SerialName("Color")
class Color(val rgb: Int)

fun main() {
    // Map<String, Color>에 대한 시리얼라이저를 가져옵니다.
    val stringToColorMapSerializer: KSerializer<Map<String, Color>> = serializer()

    // 출력: kotlin.collections.LinkedHashMap(PrimitiveDescriptor(kotlin.String), Color(rgb: kotlin.Int))
    println(stringToColorMapSerializer.descriptor)
}
//sampleEnd
```
{kotlin-runnable="true"}

제네릭 클래스의 경우 생성된 `.serializer()` 함수를 사용하려면 각 타입 파라미터마다 하나의 `KSerializer` 인수를 전달해야 합니다.

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
    // 타입 파라미터에 대한 KSerializer를 전달하여 .serializer()를 호출합니다.
    val boxedColorSerializer = Box.serializer(Color.serializer())

    println(boxedColorSerializer.descriptor)
    // Box(contents: Color)
}
//sampleEnd
```
{kotlin-runnable="true"}

### 컬렉션 타입의 시리얼라이저 가져오기 {id="obtain-serializers-for-collection-types"}

`@Serializable`이 지정된 클래스와 달리, `List<T>`와 같은 컬렉션 타입에는 생성된 `.serializer()` 함수가 없습니다.

컬렉션 타입에 대한 시리얼라이저를 얻으려면 [`ListSerializer()`](https://kotlinlang.org/api/kotlinx.serialization/kotlinx-serialization-core/kotlinx.serialization.builtins/-list-serializer.html), [`SetSerializer()`](https://kotlinlang.org/api/kotlinx.serialization/kotlinx-serialization-core/kotlinx.serialization.builtins/-set-serializer.html), 또는 [`MapSerializer()`](https://kotlinlang.org/api/kotlinx.serialization/kotlinx-serialization-core/kotlinx.serialization.builtins/-map-serializer.html)를 사용하여 생성하고 컬렉션의 타입 파라미터에 대한 시리얼라이저를 지정해야 합니다.

다음은 `ListSerializer()` 함수를 사용하여 `List<String>`에 대한 시리얼라이저를 생성하는 예제입니다.

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

## 커스텀 시리얼라이저 생성 {id="create-custom-serializers"}

직렬화된 데이터의 구조를 더 세밀하게 제어하고 싶다면 커스텀 시리얼라이저를 생성할 수 있습니다.
커스텀 시리얼라이저를 사용하면 타입이 직렬화된 형태로 표현되는 방식을 직접 정의할 수 있습니다.

생성된 시리얼라이저와 마찬가지로, 커스텀 시리얼라이저도 [`KSerializer`](https://kotlinlang.org/api/kotlinx.serialization/kotlinx-serialization-core/kotlinx.serialization/-k-serializer/) 인터페이스를 통해 특정 타입의 직렬화 및 역직렬화를 모두 정의합니다.
두 가지를 모두 지원하기 위해 `KSerializer`는 [`SerializationStrategy`](https://kotlinlang.org/api/kotlinx.serialization/kotlinx-serialization-core/kotlinx.serialization/-serialization-strategy/)와 [`DeserializationStrategy`](https://kotlinlang.org/api/kotlinx.serialization/kotlinx-serialization-core/kotlinx.serialization/-deserialization-strategy/)를 확장합니다.

> JSON 직렬화의 경우, `JsonTransformingSerializer`를 사용하여 구조를 재정의하지 않고도 기존 시리얼라이저가 생성한 [JSON 출력을 수정](serialization-transform-json.md)할 수 있습니다.
> 
{style="tip"}

### 커스텀 프리미티브 시리얼라이저 생성 {id="create-a-custom-primitive-serializer"}

클래스를 문자열이나 정수와 같은 단일 기본값(primitive value)으로 표현하려면 프리미티브 시리얼라이저를 사용합니다.

커스텀 프리미티브 시리얼라이저를 생성하는 방법은 다음과 같습니다.

1. 직렬화할 클래스에 대해 `KSerializer`를 구현하는 `object`로 커스텀 시리얼라이저를 생성합니다.

    ```kotlin
    object YourSerializer : KSerializer<Type>
    ```

2. 직렬화된 데이터의 스키마를 정의하기 위해 `descriptor` 프로퍼티를 오버라이드합니다.

   직렬화된 형태의 구조를 단일 프리미티브 값으로 정의하려면 [`PrimitiveSerialDescriptor(serialName, kind)`](https://kotlinlang.org/api/kotlinx.serialization/kotlinx-serialization-core/kotlinx.serialization.descriptors/-primitive-serial-descriptor.html)를 사용합니다.
   정규화된 이름(FQCN)과 같이 **고유한** `serialName`을 지정하고, 시리얼라이저에서 사용되는 인코더 및 디코더 함수와 일치하는 [`PrimitiveKind`](https://kotlinlang.org/api/kotlinx.serialization/kotlinx-serialization-core/kotlinx.serialization.descriptors/-primitive-kind/)를 사용합니다.

    ```kotlin
    override val descriptor: SerialDescriptor =
        PrimitiveSerialDescriptor("com.example.Type", PrimitiveKind.STRING)
    ```
   
    > `descriptor`가 인코딩 및 디코딩 함수와 일치하지 않으면 `kotlinx.serialization` 프로젝트 업데이트 시 일부 포맷에서 시리얼라이저가 예기치 않게 동작할 수 있습니다.
    > 
    {style="warning"}

3. 값이 직렬화된 형태로 변환되는 방식을 정의하기 위해 [`serialize()`](https://kotlinlang.org/api/kotlinx.serialization/kotlinx-serialization-core/kotlinx.serialization/-serialization-strategy/serialize.html) 함수를 구현합니다. `descriptor`의 `PrimitiveKind`와 일치하는 [`Encoder`](https://kotlinlang.org/api/kotlinx.serialization/kotlinx-serialization-core/kotlinx.serialization.encoding/-encoder/) 함수를 선택합니다.

    ```kotlin
    override fun serialize(encoder: Encoder, value: Type) {
        val encodedValue: String = // value를 프리미티브 표현으로 변환
        encoder.encodeString(encodedValue)
    }
    ```

4. 직렬화된 데이터를 다시 클래스의 인스턴스로 변환하는 방식을 정의하기 위해 [`deserialize()`](https://kotlinlang.org/api/kotlinx.serialization/kotlinx-serialization-core/kotlinx.serialization/-deserialization-strategy/deserialize.html) 함수를 구현합니다. [`Decoder`](https://kotlinlang.org/api/kotlinx.serialization/kotlinx-serialization-core/kotlinx.serialization.encoding/-decoder/)는 데이터를 읽기 위한 [`decodeString()`](https://kotlinlang.org/api/kotlinx.serialization/kotlinx-serialization-core/kotlinx.serialization.encoding/-decoder/decode-string.html)과 같은 함수를 제공합니다.

    ```kotlin
    override fun deserialize(decoder: Decoder): Type {
        val decodedValue: String = decoder.decodeString()
        // decodedValue를 Type으로 다시 변환
        return ...
    }
   ```

5. 클래스에 커스텀 시리얼라이저를 지정하려면 [`@Serializable`](https://kotlinlang.org/api/kotlinx.serialization/kotlinx-serialization-core/kotlinx.serialization/-serializable/) 애너테이션을 사용합니다.

    ```kotlin
    @Serializable(YourSerializer::class)
    data class Type(val stringValue: String)
   ```

다음은 `Color`를 16진수 문자열로 직렬화하는 커스텀 프리미티브 시리얼라이저의 예제입니다.

```kotlin
import kotlinx.serialization.*
import kotlinx.serialization.encoding.*
import kotlinx.serialization.descriptors.*
import kotlinx.serialization.json.*

//sampleStart
// Color 클래스를 위한 커스텀 시리얼라이저를 생성합니다.
object ColorAsStringSerializer : KSerializer<Color> {
    // 직렬화된 데이터의 스키마를 단일 문자열로 정의합니다.
    override val descriptor: SerialDescriptor =
        // 고유한 이름과 PrimitiveKind를 지정합니다.
        PrimitiveSerialDescriptor("my.app.Color", PrimitiveKind.STRING)

    // Color 값이 문자열로 직렬화되는 방식을 정의합니다.
    override fun serialize(encoder: Encoder, value: Color) {
        // RGB 값을 16진수 문자열로 변환합니다.
        val hexValue = value.rgb.toString(16).padStart(6, '0')
        // 직렬화된 값을 문자열로 인코딩합니다.
        encoder.encodeString(hexValue)
    }

    // Color 값이 문자열로부터 역직렬화되는 방식을 정의합니다.
    override fun deserialize(decoder: Decoder): Color {
        // 직렬화된 문자열 값을 디코딩합니다.
        val hexValue = decoder.decodeString()
        // 디코딩된 값을 Color로 다시 변환합니다.
        return Color(hexValue.toInt(16))
    }
}
// ColorAsStringSerializer를 Color 클래스의 커스텀 시리얼라이저로 지정합니다.
@Serializable(ColorAsStringSerializer::class)
data class Color(val rgb: Int)

fun main() {
    val color = Color(0x00FF00)
    // Color 값을 JSON으로 직렬화합니다.
    val jsonString = Json.encodeToString(color)

    println(jsonString)
    // "00ff00"

    // JSON 문자열을 Color 값으로 역직렬화합니다.
    val deserializedColor = Json.decodeFromString<Color>(jsonString)

    println(deserializedColor.rgb)
    // 65280
}
//sampleEnd
```
{kotlin-runnable="true"}

### 바이너리 데이터를 Base64 문자열로 직렬화 {id="serialize-binary-data-as-base64-strings"}

단순한 값 변환을 넘어 일반적인 직렬화 작업을 해결하기 위해 커스텀 프리미티브 시리얼라이저를 사용할 수 있습니다.
이러한 작업 중 하나는 바이너리 데이터를 [Base64](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.io.encoding/-base64/) 문자열로 표현하는 것입니다.

API마다 기본적으로 사용하는 Base64 변형이 다릅니다.
[`Base64.Default`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.io.encoding/-base64/-default/) 또는 [`Base64.Mime`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.io.encoding/-base64/-default/-mime.html)과 같이 예상되는 변형과 일치하는 Kotlin Base64 인코더를 선택하세요.

다음은 JSON 포맷에서 `Base64.Default`를 사용하여 `ByteArray`를 Base64 문자열로 직렬화하는 예제입니다.

```kotlin
import kotlinx.serialization.*
import kotlinx.serialization.json.*
import kotlinx.serialization.encoding.Encoder
import kotlinx.serialization.encoding.Decoder
import kotlinx.serialization.descriptors.*
import kotlin.io.encoding.*

//sampleStart
// ByteArray를 Base64 문자열로 표현하는
// 커스텀 프리미티브 시리얼라이저를 생성합니다.
object ByteArrayAsBase64Serializer : KSerializer<ByteArray> {

    // 기본 Base64 변형을 사용합니다.
    private val base64 = Base64.Default

    // 직렬화된 형태를 단일 STRING 프리미티브로 정의합니다.
    override val descriptor: SerialDescriptor
        get() = PrimitiveSerialDescriptor(
            "ByteArrayAsBase64Serializer",
            PrimitiveKind.STRING
        )

    // ByteArray를 Base64 문자열로 인코딩합니다.
    override fun serialize(encoder: Encoder, value: ByteArray) {
        val base64Encoded = base64.encode(value)
        encoder.encodeString(base64Encoded)
    }

    // Base64 문자열을 ByteArray로 다시 디코딩합니다.
    override fun deserialize(decoder: Decoder): ByteArray {
        val base64Decoded = decoder.decodeString()
        return base64.decode(base64Decoded)
    }
}

@Serializable
data class Value(
    // 이 프로퍼티에 커스텀 시리얼라이저를 지정합니다.
    @Serializable(ByteArrayAsBase64Serializer::class)
    val base64Input: ByteArray
) {

    // ByteArray에 대한 값 기반 동등성(equality)을 구현합니다.
    override fun equals(other: Any?): Boolean {
        if (this === other) return true
        if (javaClass != other?.javaClass) return false
        other as Value
        return base64Input.contentEquals(other.base64Input)
    }

    // 배열 내용을 기반으로 hashCode를 계산합니다.
    override fun hashCode(): Int {
        return base64Input.contentHashCode()
    }
}

fun main() {
    val string = "PNG_IMAGE_DATA"
    val value = Value(string.toByteArray())

    // Value를 JSON으로 직렬화합니다.
    val encoded = Json.encodeToString(value)

    println(encoded)
    // {"base64Input":"UE5HX0lNQUdFX0RBVEE="}

    // JSON을 Value로 다시 역직렬화합니다.
    val decoded = Json.decodeFromString<Value>(encoded)

    println(decoded.base64Input.decodeToString())
    // PNG_IMAGE_DATA
}
//sampleEnd
```
{kotlin-runnable="true"}

### 다른 시리얼라이저에 직렬화 위임 {id="delegate-serialization-to-another-serializer"}

직렬화 로직을 대상 타입의 시리얼라이저에 위임하여 클래스를 다른 타입으로 직렬화할 수 있습니다.
예를 들어, 이 접근 방식을 사용하여 클래스를 `IntArray`와 같은 비기본 타입(non-primitive type)으로 직렬화할 수 있습니다.

직렬화를 위임하려면 위임 대상 타입의 시리얼라이저 프로퍼티를 정의하는 커스텀 시리얼라이저를 생성합니다.

1. 위임된 시리얼라이저의 `descriptor`를 래핑하도록 `descriptor` 프로퍼티를 오버라이드합니다.

    > 직렬화를 위임할 때는 원래 클래스의 `descriptor`나 위임된 타입의 `descriptor`를 직접 사용할 수 없습니다.
    > 대신 위임된 시리얼라이저의 구조를 재사용하는 새 `descriptor`를 생성해야 합니다.
    > 
    {style="note"}

2. 클래스의 인스턴스를 위임된 타입으로 변환하고 [`encoder.encodeSerializableValue()`](https://kotlinlang.org/api/kotlinx.serialization/kotlinx-serialization-core/kotlinx.serialization.encoding/-encoder/encode-serializable-value.html) 함수를 사용하여 위임된 시리얼라이저로 인코딩하도록 `serialize()` 함수를 오버라이드합니다.
3. 위임된 시리얼라이저와 함께 [`decoder.decodeSerializableValue()`](https://kotlinlang.org/api/kotlinx.serialization/kotlinx-serialization-core/kotlinx.serialization.encoding/-decoder/decode-serializable-value.html) 함수를 사용하여 값을 디코딩하고 이를 다시 클래스의 인스턴스로 변환하도록 `deserialize()` 함수를 오버라이드합니다.

다음은 `IntArraySerializer`에 직렬화 로직을 위임하여 `Color` 클래스를 `IntArray`로 직렬화하는 예제입니다.

```kotlin
import kotlinx.serialization.*
import kotlinx.serialization.encoding.*
import kotlinx.serialization.descriptors.*
import kotlinx.serialization.builtins.IntArraySerializer
import kotlinx.serialization.json.*

//sampleStart
// IntArraySerializer에 위임하는 커스텀 시리얼라이저를 생성합니다.
class ColorIntArraySerializer : KSerializer<Color> {
    private val delegateSerializer = IntArraySerializer()
    override val descriptor = SerialDescriptor("my.app.Color", delegateSerializer.descriptor)

    // 직렬화 로직을 IntArraySerializer에 위임합니다.
    override fun serialize(encoder: Encoder, value: Color) {
        val data = intArrayOf(
            (value.rgb shr 16) and 0xFF,
            (value.rgb shr 8) and 0xFF,
            value.rgb and 0xFF
        )
        encoder.encodeSerializableValue(delegateSerializer, data)
    }

    // 역직렬화를 위임하고 IntArray를 Color로 다시 변환합니다.
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

배열 표현을 사용하는 것은 JSON에서는 일반적이지 않지만, `ByteArray` 및 바이너리 포맷과 함께 사용할 경우 직렬화된 데이터의 크기를 줄일 수 있습니다.

> JSON이 아닌 직렬화 포맷이 배열을 처리하는 방법에 대한 자세한 내용은 [CBOR 포맷](serialization-cbor.md) 및 [ProtoBuf 포맷](serialization-protobuf.md)을 참조하세요.
> 
{style="tip"}

### 대리 클래스(Surrogate class)를 사용한 클래스 직렬화 {id="serialize-classes-with-a-surrogate-class"}

다음과 같은 상황에서 다른 클래스의 직렬화된 형태와 일치하는 클래스인 _대리 클래스(surrogate class)_를 사용할 수 있습니다.

* 클래스 자체를 수정하지 않고 클래스의 직렬화 방식을 변경하려는 경우.
* [복합 시리얼라이저 생성](#create-a-custom-composite-serializer)을 피하려는 경우.
* 원래 클래스를 생성하기 전에 직렬화된 형태를 검증하려는 경우.
* 직접 직렬화하는 방식이 클래스의 규칙에 맞지 않는 경우를 처리하려는 경우.

대리 클래스를 [`private`](visibility-modifiers.md#class-members)으로 만들고, `init` 블록을 사용하여 클래스의 직렬화 표현에 제약 조건을 적용할 수 있습니다.
또한 [커스텀 시리얼 이름을 정의](serialization-customization-options.md#customize-serial-names)하여 직렬화된 타입 이름을 변경하지 않고 유지할 수도 있습니다.

`r`, `g`, `b` 프로퍼티에 특정 범위를 적용하여 `Color`를 JSON 객체로 직렬화하는 예제를 살펴보겠습니다.

```kotlin
// 직렬화된 형태와 일치하는 대리 클래스를 정의합니다.
@Serializable
@SerialName("Color")
private class ColorSurrogate(val r: Int, val g: Int, val b: Int) {
    init {
        // 직렬화된 형태에 제약 조건을 적용합니다.
        require(r in 0..255 && g in 0..255 && b in 0..255)
    }
}
```

[다른 시리얼라이저에 직렬화를 위임](#delegate-serialization-to-another-serializer)하는 것과 유사하게, 커스텀 시리얼라이저는 원래 클래스를 다른 표현으로 변환하고 해당 표현의 자동 생성된 `SerialDescriptor`를 래핑합니다.

> 대리 클래스는 자체 `serialName`을 가진 `SerialDescriptor`를 정의합니다.
> 각 `SerialDescriptor`는 고유한 `serialName`을 가져야 하므로, 대리 클래스의 `SerialDescriptor` 구조는 재사용할 수 있지만 `serialName`은 재사용할 수 없습니다.
>
{style="note"}

대리 클래스용으로 생성된 시리얼라이저를 가져오려면 `ColorSurrogate.serializer()`를 사용합니다.

```kotlin
object ColorSerializer : KSerializer<Color> {
    // 디스크립터의 serialName은 고유해야 합니다.
    override val descriptor: SerialDescriptor = SerialDescriptor("my.app.Color", ColorSurrogate.serializer().descriptor)

    // 원래 클래스를 대리 표현으로 변환합니다.
    override fun serialize(encoder: Encoder, value: Color) {
        val surrogate = ColorSurrogate((value.rgb shr 16) and 0xff, (value.rgb shr 8) and 0xff, value.rgb and 0xff)
        encoder.encodeSerializableValue(ColorSurrogate.serializer(), surrogate)
    }

    // 대리 표현을 다시 원래 클래스로 변환합니다.
    override fun deserialize(decoder: Decoder): Color {
        val surrogate = decoder.decodeSerializableValue(ColorSurrogate.serializer())
        return Color((surrogate.r shl 16) or (surrogate.g shl 8) or surrogate.b)
    }
}
```

마지막으로 클래스에 커스텀 시리얼라이저를 지정합니다.

```kotlin
import kotlinx.serialization.*
import kotlinx.serialization.encoding.*
import kotlinx.serialization.descriptors.*
import kotlinx.serialization.builtins.IntArraySerializer
import kotlinx.serialization.json.*

// 커스텀 프로퍼티를 가진 private 대리 클래스를 정의합니다.
@Serializable
@SerialName("Color")
private class ColorSurrogate(val r: Int, val g: Int, val b: Int) {
    init {
        // 직렬화된 형태에 제약 조건을 적용합니다.
        require(r in 0..255 && g in 0..255 && b in 0..255)
    }
}

// 대리 클래스로/로부터 상호 변환하는 커스텀 시리얼라이저를 생성합니다.
object ColorSerializer : KSerializer<Color> {
    // 래핑된 SerialDescriptor에 고유한 serialName을 정의합니다.
    override val descriptor: SerialDescriptor =
        SerialDescriptor("my.app.Color", ColorSurrogate.serializer().descriptor)

    // 원래 클래스를 대리 표현으로 변환합니다.
    override fun serialize(encoder: Encoder, value: Color) {
        val surrogate = ColorSurrogate((value.rgb shr 16) and 0xff, (value.rgb shr 8) and 0xff, value.rgb and 0xff)
        encoder.encodeSerializableValue(ColorSurrogate.serializer(), surrogate)
    }

    // 대리 표현을 다시 원래 클래스로 변환합니다.
    override fun deserialize(decoder: Decoder): Color {
        val surrogate = decoder.decodeSerializableValue(ColorSurrogate.serializer())
        return Color((surrogate.r shl 16) or (surrogate.g shl 8) or surrogate.b)
    }
}

//sampleStart
// ColorSerializer를 해당 클래스의 커스텀 시리얼라이저로 지정합니다.
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

### 커스텀 복합 시리얼라이저(Composite serializer) 생성 {id="create-a-custom-composite-serializer"}

여러 프로퍼티를 가진 클래스와 같은 복잡한 데이터 구조를 표현하려면 복합 시리얼라이저를 사용할 수 있습니다.

[대리 클래스](#serialize-classes-with-a-surrogate-class)를 사용하는 것과 비교할 때, 커스텀 복합 시리얼라이저를 사용하면 추가적인 변환 단계 없이 원래 클래스의 직렬화 구조를 직접 정의할 수 있습니다.
이는 경우에 따라 성능을 향상시킬 수도 있지만, 직렬화 로직을 수동으로 더 많이 작성해야 합니다.

커스텀 복합 시리얼라이저를 생성하는 방법은 다음과 같습니다.

1. 대상 클래스에 대해 `KSerializer`를 구현하는 `object`로 시리얼라이저를 생성합니다.

    ```kotlin
    object YourSerializer : KSerializer<Type>
    ```

2. `descriptor` 프로퍼티를 오버라이드하고 [`buildClassSerialDescriptor()`](https://kotlinlang.org/api/kotlinx.serialization/kotlinx-serialization-core/kotlinx.serialization.descriptors/build-class-serial-descriptor.html) 함수로 직렬화 스키마를 정의합니다.

   ```kotlin
   override val descriptor: SerialDescriptor =
       buildClassSerialDescriptor("com.example.Type") {
           // ...
       }
   ```
   
3. `buildClassSerialDescriptor()` 함수 내에서 [`element()`](https://kotlinlang.org/api/kotlinx.serialization/kotlinx-serialization-core/kotlinx.serialization.descriptors/element.html) 함수를 사용하여 각 프로퍼티를 지정합니다.
   요소의 순서에 따라 `0`부터 시작하는 인덱스가 결정됩니다.

   시리얼라이저의 `descriptor`에 지정된 [`SerialKind`](https://kotlinlang.org/api/kotlinx.serialization/kotlinx-serialization-core/kotlinx.serialization.descriptors/-serial-kind/)에 따라 각 `element()`가 나타내는 대상이 결정됩니다.
   클래스 `descriptor`에서 `element()`는 프로퍼티를 나타내며, enum `descriptor`에서는 `element()`가 `RED` 또는 `GREEN`과 같은 상수를 나타냅니다.

   ```kotlin
   override val descriptor: SerialDescriptor =
       buildClassSerialDescriptor("com.example.Type") {
           element<Int>("first")
           element<Int>("second")
       }
   ```

4. [`encodeStructure()`](https://kotlinlang.org/api/kotlinx.serialization/kotlinx-serialization-core/kotlinx.serialization.encoding/encode-structure.html) DSL을 사용하여 `serialize()` 함수를 구현합니다.
   블록 내부의 람다 수신 객체는 [`CompositeEncoder`](https://kotlinlang.org/api/kotlinx.serialization/kotlinx-serialization-core/kotlinx.serialization.encoding/-composite-encoder/)이며, 이를 사용하여 `descriptor`에 정의된 순서대로 각 필드에 대해 [`encodeIntElement()`](https://kotlinlang.org/api/kotlinx.serialization/kotlinx-serialization-core/kotlinx.serialization.encoding/-composite-encoder/encode-int-element.html)와 같은 함수를 호출합니다.

   ```kotlin
   override fun serialize(encoder: Encoder, value: Type) =
       encoder.encodeStructure(descriptor) {
           encodeIntElement(descriptor, 0, value.first)
           encodeIntElement(descriptor, 1, value.second)
       }
   ```

5. [`decodeStructure()`](https://kotlinlang.org/api/kotlinx.serialization/kotlinx-serialization-core/kotlinx.serialization.encoding/decode-structure.html) DSL을 사용하여 `deserialize()` 함수를 구현합니다.
   블록 내부의 람다 수신 객체는 [`CompositeDecoder`](https://kotlinlang.org/api/kotlinx.serialization/kotlinx-serialization-core/kotlinx.serialization.encoding/-composite-decoder/)이며, 이를 사용하여 [`decodeIntElement()`](https://kotlinlang.org/api/kotlinx.serialization/kotlinx-serialization-core/kotlinx.serialization.encoding/-composite-decoder/decode-int-element.html)와 같은 함수를 호출하여 각 프로퍼티를 디코딩합니다.

   대부분의 포맷은 데이터가 임의의 순서로 인코딩되는 것을 허용하므로, 시리얼라이저 `descriptor`의 요소 순서와 다를 수 있습니다.
   디코딩할 `element()`를 식별하려면 [`decodeElementIndex()`](https://kotlinlang.org/api/kotlinx.serialization/kotlinx-serialization-core/kotlinx.serialization.encoding/-composite-decoder/decode-element-index.html) 함수를 사용합니다.
   더 이상 요소가 남아 있지 않으면 [`CompositeDecoder.DECODE_DONE`](https://kotlinlang.org/api/kotlinx.serialization/kotlinx-serialization-core/kotlinx.serialization.encoding/-composite-decoder/-companion/-d-e-c-o-d-e_-d-o-n-e.html)을 반환하므로, 이를 사용하여 현재 구조의 디코딩을 중단합니다.

   ```kotlin
   override fun deserialize(decoder: Decoder): Type =
       decoder.decodeStructure(descriptor) {
           var first = 0
           var second = ""
   
           // 순서와 상관없이 올바르게 디코딩되도록 decodeElementIndex를 사용합니다.
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

6. `@Serializable(YourSerializer::class)` 애너테이션을 사용하여 클래스에 커스텀 시리얼라이저를 지정합니다.

   > 각 요소를 수동으로 처리하지 않고 데이터를 변환하거나 재구성하기만 하면 되는 경우, 더 간단한 접근 방식인 [다른 시리얼라이저에 직렬화 위임](#delegate-serialization-to-another-serializer) 또는 [대리 클래스](#serialize-classes-with-a-surrogate-class) 사용을 고려해 보세요.
   >
   {style="tip"}

여러 프로퍼티를 가진 `Color` 클래스를 직렬화하는 예제를 살펴보겠습니다.

```kotlin
import kotlinx.serialization.*
import kotlinx.serialization.encoding.*
import kotlinx.serialization.descriptors.*
import kotlinx.serialization.json.*

//sampleStart
// 여러 프로퍼티를 가진 Color 클래스를 위한 커스텀 시리얼라이저를 생성합니다.
object ColorAsObjectSerializer : KSerializer<Color> {
    // Color 클래스의 스키마를 정의합니다.
    override val descriptor: SerialDescriptor =
        buildClassSerialDescriptor("my.app.Color") {
            // element() 함수를 사용하여 각 프로퍼티의 타입과 이름을 지정합니다.
            element<Int>("r")
            element<Int>("g")
            element<Int>("b")
        }

    // 디스크립터에 지정된 순서대로 Color를 직렬화합니다.
    override fun serialize(encoder: Encoder, value: Color) =
        encoder.encodeStructure(descriptor) {
            encodeIntElement(descriptor, 0, (value.rgb shr 16) and 0xff)
            encodeIntElement(descriptor, 1, (value.rgb shr 8) and 0xff)
            encodeIntElement(descriptor, 2, value.rgb and 0xff)
        }

    // 데이터를 Color 객체로 다시 역직렬화합니다.
    override fun deserialize(decoder: Decoder): Color =
        decoder.decodeStructure(descriptor) {
            // 디코딩된 값을 보관할 임시 변수입니다.
            var r = -1
            var g = -1
            var b = -1
            // 요소 순서가 포맷에 따라 다를 수 있으므로 decodeElementIndex()를 사용합니다.
            while (true) {
                when (val index = decodeElementIndex(descriptor)) {
                    0 -> r = decodeIntElement(descriptor, 0)
                    1 -> g = decodeIntElement(descriptor, 1)
                    2 -> b = decodeIntElement(descriptor, 2)
                    CompositeDecoder.DECODE_DONE -> break
                    else -> error("Unexpected index: $index")
                }
            }
            // 값을 검증하고 Color를 재구성합니다.
            require(r in 0..255 && g in 0..255 && b in 0..255)
            Color((r shl 16) or (g shl 8) or b)
        }
}

// Color에 커스텀 시리얼라이저를 지정합니다.
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

### 커스텀 시리얼라이저에서 기본값 인코딩 {id="encode-default-values-in-custom-serializers"}

플러그인이 생성한 시리얼라이저는 인코더가 기본값과 동일한 값을 인코딩해야 하는지 확인합니다.
예를 들어 JSON에서는 [`encodeDefaults`](https://kotlinlang.org/api/kotlinx.serialization/kotlinx-serialization-json/kotlinx.serialization.json/-json-builder/encode-defaults.html) 프로퍼티를 통해 이를 제어합니다.

커스텀 시리얼라이저에서 동일한 동작을 구현하려면 시리얼라이저의 `descriptor` 및 인코딩 중인 요소의 인덱스와 함께 [`shouldEncodeElementDefault()`](https://kotlinlang.org/api/kotlinx.serialization/kotlinx-serialization-core/kotlinx.serialization.encoding/-composite-encoder/should-encode-element-default.html) 함수를 사용합니다.

> 프로퍼티에 [`@EncodeDefault`](https://kotlinlang.org/api/kotlinx.serialization/kotlinx-serialization-core/kotlinx.serialization/-encode-default/)가 지정되어 있으면 플러그인이 생성한 시리얼라이저는 `shouldEncodeElementDefault()`를 호출하지 않습니다.
>
{style="note"}

다음은 `encodeDefaults`가 활성화되었을 때 커스텀 시리얼라이저가 기본 `Color` 값을 인코딩하는 예제입니다.

```kotlin
import kotlinx.serialization.*
import kotlinx.serialization.encoding.*
import kotlinx.serialization.descriptors.*
import kotlinx.serialization.json.*

//sampleStart
// 여러 프로퍼티를 가진 Color 클래스를 위한 커스텀 시리얼라이저를 생성합니다.
object ColorAsObjectSerializer : KSerializer<Color> {
    // Color 클래스의 스키마를 정의합니다.
    override val descriptor: SerialDescriptor =
        buildClassSerialDescriptor("my.app.Color") {
            // element() 함수를 사용하여 각 프로퍼티의 타입과 이름을 지정합니다.
            element<Int>("r", isOptional = true)
            element<Int>("g", isOptional = true)
            element<Int>("b", isOptional = true)
        }
   
    override fun serialize(encoder: Encoder, value: Color) =
        encoder.encodeStructure(descriptor) {
            val r = (value.rgb shr 16) and 0xff
            val g = (value.rgb shr 8) and 0xff
            val b = value.rgb and 0xff

            // r이 기본값과 다르거나,
            // 인코더가 첫 번째 요소의 기본값을 인코딩해야 하는 경우 r을 인코딩합니다.
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

    // 데이터를 Color 객체로 다시 역직렬화합니다.
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

// Color에 커스텀 시리얼라이저를 지정합니다.
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

### 순차적 디코딩을 통한 역직렬화 최적화 {id="optimize-deserialization-with-sequential-decoding"}
<primary-label ref="experimental-general"/>

일부 포맷은 엄격하게 순서가 지정된 스키마를 사용하며 순차적 디코딩을 지원할 수 있습니다.
이러한 포맷의 경우 [`decodeSequentially()`](https://kotlinlang.org/api/kotlinx.serialization/kotlinx-serialization-core/kotlinx.serialization.encoding/-composite-decoder/decode-sequentially.html) 함수를 사용하여 역직렬화를 최적화할 수 있습니다.
이 함수는 현재 구조를 순서대로 디코딩할 수 있는 경우 `true`를 반환합니다.
이 경우를 별도로 처리하면 개별 요소를 순서 없이 디코딩하는 더 복잡한 로직을 건너뛸 수 있습니다.

> `kotlinx.serialization` 플러그인이 생성한 시리얼라이저는 이 최적화를 사용합니다.
> 
{style="tip"}

다음은 가능한 경우 `decodeSequentially()`를 사용하여 역직렬화를 최적화하는 예제입니다.

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
            // 포맷이 데이터를 순차적으로 저장하는 경우 순서대로 직접 값을 디코딩합니다.
            @OptIn(ExperimentalSerializationApi::class)
            if (decodeSequentially()) {
                r = decodeIntElement(descriptor, 0)           
                g = decodeIntElement(descriptor, 1)  
                b = decodeIntElement(descriptor, 2)
            } else while (true) {
                // 요소의 순서가 정해지지 않을 수 있는 포맷에 대해 올바른 디코딩을 보장합니다.
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

### 제네릭 타입을 위한 커스텀 시리얼라이저 생성 {id="create-a-custom-serializer-for-generic-types"}

제네릭 클래스를 위한 커스텀 시리얼라이저를 생성하려면 시리얼라이저를 `object` 대신 `class`로 선언하고, 각 제네릭 타입 파라미터마다 하나의 `KSerializer` 생성자 파라미터를 갖도록 합니다.

각 타입 파라미터에 대한 직렬화 로직을 해당 `KSerializer`에 위임하여 자체 직렬화 규칙에 따라 인코딩되도록 할 수 있습니다.

제네릭 `Box<T>` 클래스를 사용한 예제를 살펴보겠습니다.

```kotlin
import kotlinx.serialization.*
import kotlinx.serialization.encoding.*
import kotlinx.serialization.descriptors.*
import kotlinx.serialization.json.*

//sampleStart
@Serializable(BoxSerializer::class)
data class Box<T>(val contents: T)

// Box<T>를 위한 커스텀 시리얼라이저를 클래스로 생성합니다.
class BoxSerializer<T>(private val dataSerializer: KSerializer<T>) : KSerializer<Box<T>> {
    // Box<T> 디스크립터에 고유한 serialName을 정의합니다.
    override val descriptor: SerialDescriptor =
        SerialDescriptor("my.app.Box", dataSerializer.descriptor)

    // 직렬화 및 역직렬화를 위임합니다.
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

### 플러그인 생성 시리얼라이저와 커스텀 시리얼라이저 함께 사용 {id="use-a-plugin-generated-serializer-together-with-a-custom-serializer"}
<primary-label ref="experimental-general"/>

기본적으로 `@Serializable(YourSerializer::class)`를 통해 커스텀 시리얼라이저를 지정하면 Kotlin serialization 플러그인은 시리얼라이저를 생성하지 않습니다.

하지만 다음과 같은 이유로 플러그인이 생성한 시리얼라이저를 여전히 사용하고 싶을 수 있습니다.

* 플러그인이 생성한 시리얼라이저를 폴백(fallback) 전략으로 사용하려는 경우.
* 기본 구조에 접근하기 위해 플러그인이 생성한 `descriptor`를 검사하려는 경우.
* 커스텀 시리얼라이저를 사용하지 않는 서브클래스에서 기본 직렬화 동작을 재사용하려는 경우.

직렬화 가능한 클래스에 [`@KeepGeneratedSerializer`](https://kotlinlang.org/api/kotlinx.serialization/kotlinx-serialization-core/kotlinx.serialization/-keep-generated-serializer/) 애너테이션을 추가하면 커스텀 시리얼라이저와 함께 자동 생성된 시리얼라이저도 유지할 수 있습니다.
플러그인이 생성한 시리얼라이저에 접근하려면 직렬화 가능한 클래스의 동반 객체(companion object)에서 `.generatedSerializer()` 함수를 사용합니다.

이는 `JsonTransformingSerializer`를 사용하여 [JSON 구조를 조정하고 기본 직렬화 로직에는 플러그인 생성 시리얼라이저를 재사용](serialization-transform-json.md#add-custom-behavior-to-the-default-serializer)할 때도 유용합니다.

다음은 커스텀 시리얼라이저와 플러그인이 생성한 시리얼라이저를 모두 사용하는 예제입니다.

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

    // 커스텀 시리얼라이저를 사용합니다.
    println(Json.encodeToString(green))
    // "00ff00"

    // 플러그인이 생성한 시리얼라이저를 사용합니다.
    println(Json.encodeToString(Color.generatedSerializer(), green))
    // {"rgb":65280}

}
//sampleEnd
```
{kotlin-runnable="true"}

## 시리얼라이저 적용 {id="apply-serializers"}

커스텀 시리얼라이저는 자체 클래스뿐만 아니라 서드파티 타입에도 적용할 수 있습니다.
[java.util.Date](https://docs.oracle.com/javase/8/docs/api/java/util/Date.html)와 같은 서드파티 타입은 소스 코드를 수정할 수 없기 때문에 [`@Serializable`](https://kotlinlang.org/api/kotlinx.serialization/kotlinx-serialization-core/kotlinx.serialization/-serializable/) 애너테이션을 직접 추가할 수 없습니다.

### 시리얼라이저 수동 전달 {id="pass-a-serializer-manually"}

커스텀 시리얼라이저로 타입을 직렬화하려면 시리얼라이저를 생성한 다음 [`Json.encodeToString()`](https://kotlinlang.org/api/kotlinx.serialization/kotlinx-serialization-json/kotlinx.serialization.json/-json/encode-to-string.html) 및 [`Json.decodeFromString()`](https://kotlinlang.org/api/kotlinx.serialization/kotlinx-serialization-json/kotlinx.serialization.json/-json/decode-from-string.html)과 같은 함수의 오버로드에 명시적으로 전달합니다.

다음은 `Date` 값을 유닉스 에포크(Unix epoch) 이후의 밀리초 단위 숫자로 직렬화하는 예제입니다.

```kotlin
import kotlinx.serialization.*
import kotlinx.serialization.encoding.*
import kotlinx.serialization.descriptors.*
import kotlinx.serialization.json.*
import java.util.Date
import java.text.SimpleDateFormat

//sampleStart
// 소스 코드에 접근할 수 없으므로 Date에 @Serializable을 사용할 수 없습니다.
object DateAsLongSerializer : KSerializer<Date> {
    override val descriptor: SerialDescriptor = PrimitiveSerialDescriptor("my.app.DateAsLong", PrimitiveKind.LONG)
    override fun serialize(encoder: Encoder, value: Date) = encoder.encodeLong(value.time)
    override fun deserialize(decoder: Decoder): Date = Date(decoder.decodeLong())
}

fun main() {
    val kotlin10ReleaseDate = SimpleDateFormat("yyyy-MM-ddX").parse("2016-02-15+00") 

    // Date를 밀리초 단위의 Long으로 직렬화합니다.
    println(Json.encodeToString(DateAsLongSerializer, kotlin10ReleaseDate))    
    // 1455494400000
}
//sampleEnd
```
{kotlin-runnable="true"}

### 프로퍼티에 시리얼라이저 지정 {id="specify-a-serializer-on-a-property"}

타입이 직렬화 가능한 클래스의 프로퍼티로 사용되는 경우 `@Serializable` 애너테이션을 사용하여 해당 프로퍼티에 커스텀 시리얼라이저를 지정합니다.

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
    // Date 프로퍼티에 커스텀 시리얼라이저를 지정합니다.
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

### 타입에 시리얼라이저 지정 {id="specify-a-serializer-on-a-type"}

`@Serializable` 애너테이션을 타입에 직접 적용할 수도 있습니다.
이 방식은 `List<Date>`와 같이 타입이 제네릭 타입 인수로 사용될 때 해당 타입에 커스텀 시리얼라이저를 지정하는 데 유용합니다.

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
     // 제네릭 타입 인수인 Date에 커스텀 시리얼라이저를 지정합니다.
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

### 파일 단위로 시리얼라이저 지정 {id="specify-a-serializer-for-a-file"}

소스 파일 내 특정 타입의 모든 프로퍼티에 시리얼라이저를 적용하려면 파일 시작 부분에 [`@UseSerializers`](https://kotlinlang.org/api/kotlinx.serialization/kotlinx-serialization-core/kotlinx.serialization/-use-serializers/) 애너테이션을 추가합니다.

```kotlin
@file:UseSerializers(DateAsLongSerializer::class)
```

이렇게 하면 파일 내 해당 타입의 모든 인스턴스에 `DateAsLongSerializer`가 적용되므로 각 프로퍼티마다 개별적으로 애너테이션을 추가할 필요가 없습니다.

다음은 예제입니다.

```kotlin
// 파일 내 해당 타입의 모든 프로퍼티에 커스텀 시리얼라이저를 적용합니다.
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

// Date 프로퍼티에 파일 수준 시리얼라이저를 사용합니다.
@Serializable
class ProgrammingLanguage(val name: String, val stableReleaseDate: Date)

fun main() {
    val data = ProgrammingLanguage("Kotlin", SimpleDateFormat("yyyy-MM-ddX").parse("2016-02-15+00"))
 
   println(Json.encodeToString(data))
    // {"name":"Kotlin","stableReleaseDate":1455494400000}
}
```
{kotlin-runnable="true"}

### 타입 별칭(Type alias)으로 시리얼라이저 지정 {id="specify-serializers-with-type-aliases"}

Kotlin serialization에서는 일반적으로 `@Serializable` 애너테이션을 통해 직렬화 전략을 명시적으로 지정합니다.
[컨텍스트 직렬화(Contextual serialization)](#implement-contextual-serialization)를 제외하고는 전역 시리얼라이저 설정을 제공하지 않습니다.

동일한 시리얼라이저를 여러 곳에서 반복해서 사용하는 경우 시리얼라이저 애너테이션이 연결된 [`typealias`](type-aliases.md)를 정의할 수 있습니다.

이렇게 하면 사용하는 위치마다 `@Serializable` 애너테이션을 추가하지 않고도 애너테이션이 적용된 타입을 재사용할 수 있습니다.

다음은 `typealias`를 사용하여 `Date`에 `DateAsLongSerializer` 및 `DateAsSimpleTextSerializer`를 적용하는 예제입니다.

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

// Date를 형식화된 문자열(yyyy-MM-dd)로 인코딩하는 시리얼라이저를 정의합니다.
object DateAsSimpleTextSerializer: KSerializer<Date> {
    override val descriptor: SerialDescriptor = PrimitiveSerialDescriptor("my.app.DateAsSimpleText", PrimitiveKind.LONG)
    private val format = SimpleDateFormat("yyyy-MM-dd").apply {
        // 일관된 출력을 위해 시간대를 UTC로 설정합니다.
        setTimeZone(TimeZone.getTimeZone("UTC"))
    }
    override fun serialize(encoder: Encoder, value: Date) = encoder.encodeString(format.format(value))
    override fun deserialize(decoder: Decoder): Date = format.parse(decoder.decodeString())
}

// 각 사용처마다 애너테이션을 붙이지 않도록 typealias를 사용하여 전역 시리얼라이저를 적용합니다.
typealias DateAsLong = @Serializable(DateAsLongSerializer::class) Date

typealias DateAsText = @Serializable(DateAsSimpleTextSerializer::class) Date

// typealias를 사용하여 Date 프로퍼티에 커스텀 시리얼라이저를 적용합니다.
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

### 컨텍스트 직렬화(Contextual serialization) 구현 {id="implement-contextual-serialization"}

기본적으로 직렬화 전략은 컴파일 타임에 정의됩니다.
_컨텍스트 직렬화(Contextual serialization)_를 사용하면 객체 트리의 깊은 곳에 중첩되어 있더라도 런타임에 특정 타입의 직렬화 전략을 조정할 수 있습니다.

예를 들어 컨텍스트 직렬화를 사용하면 사용 중인 프로토콜 버전에 따라 JSON 형식의 `java.util.Date`를 ISO 8601 `String` 또는 `Long`으로 직렬화할 수 있습니다.
이 접근 방식은 기본 제공되는 [`ContextualSerializer`](https://kotlinlang.org/api/kotlinx.serialization/kotlinx-serialization-core/kotlinx.serialization/-contextual-serializer/) 클래스에서 지원합니다.

컨텍스트 직렬화는 런타임에 `SerializersModule`에서 타입에 맞는 커스텀 시리얼라이저를 선택합니다.

컨텍스트 직렬화를 구현하는 방법은 다음과 같습니다.

1. 직렬화 가능한 클래스의 프로퍼티에 [`@Contextual`](https://kotlinlang.org/api/kotlinx.serialization/kotlinx-serialization-core/kotlinx.serialization/-contextual/) 애너테이션을 추가합니다.

   > [`@Contextual`](https://kotlinlang.org/api/kotlinx.serialization/kotlinx-serialization-core/kotlinx.serialization/-contextual/) 애너테이션은 [`ContextualSerializer`](https://kotlinlang.org/api/kotlinx.serialization/kotlinx-serialization-core/kotlinx.serialization/-contextual-serializer/) 클래스의 축약형입니다.
   > 동일한 파일 내 여러 프로퍼티에 컨텍스트 직렬화를 적용하려면 [`@UseContextualSerialization`](https://kotlinlang.org/api/kotlinx.serialization/kotlinx-serialization-core/kotlinx.serialization/-use-contextual-serialization/) 애너테이션을 사용하세요.
   >
   {style="tip"}

2. [`SerializersModule()`](https://kotlinlang.org/api/kotlinx.serialization/kotlinx-serialization-core/kotlinx.serialization.modules/-serializers-module.html) 빌더 함수를 사용하여 [`SerializersModule`](https://kotlinlang.org/api/kotlinx.serialization/kotlinx-serialization-core/kotlinx.serialization.modules/-serializers-module/)을 생성합니다.
   [`contextual()`](https://kotlinlang.org/api/kotlinx.serialization/kotlinx-serialization-core/kotlinx.serialization.modules/contextual.html) 함수를 사용하여 컨텍스트 직렬화를 위한 커스텀 시리얼라이저를 등록합니다.

    `SerializersModule`이 없으면 기본 시리얼라이저가 없는 컨텍스트 애너테이션 적용 타입을 직렬화 또는 역직렬화할 때 `SerializationException`이 발생합니다.

3. `Json` 인스턴스를 생성하고 `SerializersModule`을 [`serializersModule`](https://kotlinlang.org/api/kotlinx.serialization/kotlinx-serialization-json/kotlinx.serialization.json/-json-builder/serializers-module.html) 프로퍼티에 전달합니다.

다음은 예제입니다.

```kotlin
import kotlinx.serialization.*
import kotlinx.serialization.encoding.*
import kotlinx.serialization.descriptors.*
import kotlinx.serialization.json.*
import java.util.Date
import java.text.SimpleDateFormat

//sampleStart
// Date를 위한 커스텀 시리얼라이저를 생성합니다.
object DateAsLongSerializer : KSerializer<Date> {
    override val descriptor: SerialDescriptor = PrimitiveSerialDescriptor("my.app.Date", PrimitiveKind.LONG)
    override fun serialize(encoder: Encoder, value: Date) = encoder.encodeLong(value.time)
    override fun deserialize(decoder: Decoder): Date = Date(decoder.decodeLong())
}

@Serializable
class ProgrammingLanguage(
    val name: String,
    // Date에 컨텍스트 직렬화를 지정합니다.
    @Contextual
    val stableReleaseDate: Date
)

// SerializersModule을 정의하고 Date용 컨텍스트 시리얼라이저를 등록합니다.
private val module = SerializersModule { 
    contextual(DateAsLongSerializer)
}

// 커스텀 SerializersModule이 포함된 Json 인스턴스를 생성합니다.
val format = Json { serializersModule = module }

fun main() {
    val data = ProgrammingLanguage("Kotlin", SimpleDateFormat("yyyy-MM-ddX").parse("2016-02-15+00"))
 
   println(format.encodeToString(data))
    // {"name":"Kotlin","stableReleaseDate":1455494400000}
}
//sampleEnd
```
{kotlin-runnable="true"}

#### 제네릭 클래스 컨텍스트 직렬화 {id="serialize-generic-classes-contextually"}

제네릭 클래스를 컨텍스트 방식으로 직렬화하려면 `SerializersModule`에 함수를 등록할 수 있습니다.
이 함수는 제네릭 타입 인수에 대한 시리얼라이저를 전달받아 런타임에 해당하는 시리얼라이저를 생성합니다.

[제네릭 타입 인수가 다양할 수 있으므로](#create-a-custom-serializer-for-generic-types) 제네릭 클래스에는 단일 시리얼라이저 인스턴스를 사용할 수 없습니다.
예를 들어 다음 접근 방식은 `Box<Int>`에는 동작하지만 `Box<String>`과 같은 다른 타입에는 동작하지 않습니다.

```kotlin
val incorrectModule = SerializersModule {
    // 이것은 Box<Int>에만 동작하며, Box<String>이나 다른 타입에는 동작하지 않습니다.
    contextual(BoxSerializer(Int.serializer()))
}
```

대신 타입 인수의 시리얼라이저를 기반으로 `Box<T>`와 같은 제네릭 타입의 시리얼라이저를 생성하는 함수를 등록합니다.
다음은 예제입니다.

```kotlin
val correctModule = SerializersModule {
    // args[0]은 T의 시리얼라이저입니다.
    // 예를 들어 Int.serializer() 또는 String.serializer()입니다.
    contextual(Box::class) { args -> BoxSerializer(args[0]) }
}
```

> 제네릭 클래스와 비제네릭 클래스를 위한 모듈 등 여러 `SerializersModule` 인스턴스를 `plus` 연산자로 결합할 수 있습니다.
> 자세한 내용은 [여러 `SerializersModule` 인스턴스 병합](serialization-polymorphism.md#merge-multiple-serializersmodule-instances)을 참조하세요.
>
{style="tip"}

## 다음 단계 {id="what-s-next"}

* 커스텀 시리얼라이저를 만드는 대신 JSON 엘리먼트 트리를 수정하여 [JSON 구조를 변환](serialization-transform-json.md)하는 방법을 알아보세요.
* [커스텀 직렬화 포맷](serialization-custom-formats.md)에서 커스텀 포맷을 만드는 방법을 알아보세요.
* [CBOR](serialization-cbor.md) 및 [ProtoBuf](serialization-protobuf.md)와 같은 실험적 직렬화 포맷을 살펴보세요.