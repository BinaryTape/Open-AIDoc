[//]: # (title: 创建与使用序列化器)

序列化器定义了 Kotlin 类型在其序列化形式下的结构，而诸如 `Json` 等格式实现则控制该结构如何被编码。

![图示：Kotlin 值被序列化器序列化为基本类型序列，由格式编码为编码数据，再解码回基本类型序列，并由序列化器反序列化为 Kotlin 值](serialization-encoding.svg){width="700"}

序列化器通过 [`KSerializer`](https://kotlinlang.org/api/kotlinx.serialization/kotlinx-serialization-core/kotlinx.serialization/-k-serializer/) 接口为类型定义序列化和反序列化策略。
Kotlin 序列化为内置类型、集合等提供了现成的序列化器。

你可以使用这些序列化器来序列化值或检查其序列化形式的结构，而自定义序列化器则允许你自己定义该结构。

## 获取序列化器 {id="obtain-serializers"}

当你使用 [`@Serializable`](https://kotlinlang.org/api/kotlinx.serialization/kotlinx-serialization-core/kotlinx.serialization/-serializable/) 注解修饰一个类时，Kotlin 序列化插件会为该类生成一个 [`KSerializer`](https://kotlinlang.org/api/kotlinx.serialization/kotlinx-serialization-core/kotlinx.serialization/-k-serializer/)。

要检索此自动生成的序列化器，请调用生成的 `.serializer()` 函数。
你可以直接在 `Json.encodeToString()` 等函数中使用序列化器，或者访问其 [`descriptor`](https://kotlinlang.org/api/kotlinx.serialization/kotlinx-serialization-core/kotlinx.serialization/-k-serializer/descriptor.html) 属性以检查该类型序列化形式的结构。

以下示例定义了一个具有单个整型属性的 `Color` 类，并检查了其序列化形式的结构：

```kotlin
import kotlinx.serialization.*

//sampleStart
@Serializable
data class Color(val rgb: Int)

fun main() {
    // 检索为 Color 类生成的序列化器
    val colorSerializer: KSerializer<Color> = Color.serializer()

    println(colorSerializer.descriptor)
    // Color(rgb: kotlin.Int)
}
//sampleEnd
```
{kotlin-runnable="true"}

> [内置基本类型和 `String`](serialization-serialize-builtin-types.md) 也通过 `.serializer()` 函数提供序列化器，例如 `Int.serializer()` 和 `String.serializer()`。
> 
{style="note"}

你可以使用顶层 `serializer<T>()` 函数来获取任意类型的序列化器，包括参数化类型：

```kotlin
import kotlinx.serialization.*

//sampleStart
@Serializable
@SerialName("Color")
class Color(val rgb: Int)

fun main() {
    // 检索 Map<String, Color> 的序列化器
    val stringToColorMapSerializer: KSerializer<Map<String, Color>> = serializer()

    // 输出：kotlin.collections.LinkedHashMap(PrimitiveDescriptor(kotlin.String), Color(rgb: kotlin.Int))
    println(stringToColorMapSerializer.descriptor)
}
//sampleEnd
```
{kotlin-runnable="true"}

对于泛型类，如果你想使用生成的 `.serializer()` 函数，需要为每个类型形参提供一个 `KSerializer` 实参：

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
    // 使用针对类型形参的 KSerializer 调用 .serializer()
    val boxedColorSerializer = Box.serializer(Color.serializer())

    println(boxedColorSerializer.descriptor)
    // Box(contents: Color)
}
//sampleEnd
```
{kotlin-runnable="true"}

### 获取集合类型的序列化器 {id="obtain-serializers-for-collection-types"}

与带有 `@Serializable` 注解的类不同，像 `List<T>` 这样的集合类型没有生成的 `.serializer()` 函数。

要获取集合类型的序列化器，可以使用 [`ListSerializer()`](https://kotlinlang.org/api/kotlinx.serialization/kotlinx-serialization-core/kotlinx.serialization.builtins/-list-serializer.html)、[`SetSerializer()`](https://kotlinlang.org/api/kotlinx.serialization/kotlinx-serialization-core/kotlinx.serialization.builtins/-set-serializer.html) 或 [`MapSerializer()`](https://kotlinlang.org/api/kotlinx.serialization/kotlinx-serialization-core/kotlinx.serialization.builtins/-map-serializer.html) 进行创建，并指定集合类型形参的序列化器。

以下示例使用 `ListSerializer()` 函数为 `List<String>` 创建序列化器：

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

## 创建自定义序列化器 {id="create-custom-serializers"}

如果你想更好地控制序列化数据的结构，可以创建自定义序列化器。
自定义序列化器允许你定义类型在其序列化形式中如何表示。

与生成的序列化器一样，自定义序列化器通过 [`KSerializer`](https://kotlinlang.org/api/kotlinx.serialization/kotlinx-serialization-core/kotlinx.serialization/-k-serializer/) 接口为类型定义序列化和反序列化逻辑。
为了同时支持两者，`KSerializer` 继承了 [`SerializationStrategy`](https://kotlinlang.org/api/kotlinx.serialization/kotlinx-serialization-core/kotlinx.serialization/-serialization-strategy/) 和 [`DeserializationStrategy`](https://kotlinlang.org/api/kotlinx.serialization/kotlinx-serialization-core/kotlinx.serialization/-deserialization-strategy/)。

> 对于 JSON 序列化，你还可以使用 `JsonTransformingSerializer` [修改现有序列化器生成的 JSON 输出](serialization-transform-json.md)，而无需重新定义其结构。
> 
{style="tip"}

### 创建自定义基本类型序列化器 {id="create-a-custom-primitive-serializer"}

使用基本类型序列化器可以将类表示为单个基本类型值，例如字符串或整数。

要创建自定义基本类型序列化器：

1. 将自定义序列化器创建为一个 `object`，并为被序列化的类实现 `KSerializer`：

    ```kotlin
    object YourSerializer : KSerializer<Type>
    ```

2. 重写 `descriptor` 属性以定义序列化数据的架构（schema）。

   使用 [`PrimitiveSerialDescriptor(serialName, kind)`](https://kotlinlang.org/api/kotlinx.serialization/kotlinx-serialization-core/kotlinx.serialization.descriptors/-primitive-serial-descriptor.html) 将序列化形式的结构定义为单个基本类型值。
   指定一个**唯一**的 `serialName`（例如完全限定名称），并使用与序列化器中编码器和解码器函数相匹配的 [`PrimitiveKind`](https://kotlinlang.org/api/kotlinx.serialization/kotlinx-serialization-core/kotlinx.serialization.descriptors/-primitive-kind/)：

    ```kotlin
    override val descriptor: SerialDescriptor =
        PrimitiveSerialDescriptor("com.example.Type", PrimitiveKind.STRING)
    ```
   
    > 如果 `descriptor` 与编码和解码函数不匹配，当 `kotlinx.serialization` 项目更新时，可能导致序列化器在某些格式下的行为不可预测。
    > 
    {style="warning"}

3. 实现 [`serialize()`](https://kotlinlang.org/api/kotlinx.serialization/kotlinx-serialization-core/kotlinx.serialization/-serialization-strategy/serialize.html) 函数以定义值如何转换为其序列化形式。选择与 `descriptor` 中的 `PrimitiveKind` 相匹配的 [`Encoder`](https://kotlinlang.org/api/kotlinx.serialization/kotlinx-serialization-core/kotlinx.serialization.encoding/-encoder/) 函数：

    ```kotlin
    override fun serialize(encoder: Encoder, value: Type) {
        val encodedValue: String = // 将 value 转换为基本类型表示
        encoder.encodeString(encodedValue)
    }
    ```

4. 实现 [`deserialize()`](https://kotlinlang.org/api/kotlinx.serialization/kotlinx-serialization-core/kotlinx.serialization/-deserialization-strategy/deserialize.html) 函数以定义如何将序列化数据转换回类的实例。[`Decoder`](https://kotlinlang.org/api/kotlinx.serialization/kotlinx-serialization-core/kotlinx.serialization.encoding/-decoder/) 提供了读取数据的函数，例如 [`decodeString()`](https://kotlinlang.org/api/kotlinx.serialization/kotlinx-serialization-core/kotlinx.serialization.encoding/-decoder/decode-string.html)。

    ```kotlin
    override fun deserialize(decoder: Decoder): Type {
        val decodedValue: String = decoder.decodeString()
        // 将 decodedValue 转换回 Type
        return ...
    }
   ```

5. 使用 [`@Serializable`](https://kotlinlang.org/api/kotlinx.serialization/kotlinx-serialization-core/kotlinx.serialization/-serializable/) 注解为类指定自定义序列化器：

    ```kotlin
    @Serializable(YourSerializer::class)
    data class Type(val stringValue: String)
   ```

以下是一个自定义基本类型序列化器的示例，它将 `Color` 序列化为十六进制字符串：

```kotlin
import kotlinx.serialization.*
import kotlinx.serialization.encoding.*
import kotlinx.serialization.descriptors.*
import kotlinx.serialization.json.*

//sampleStart
// 为 Color 类创建自定义序列化器
object ColorAsStringSerializer : KSerializer<Color> {
    // 将序列化数据的架构定义为单个字符串
    override val descriptor: SerialDescriptor =
        // 指定唯一名称和 PrimitiveKind
        PrimitiveSerialDescriptor("my.app.Color", PrimitiveKind.STRING)

    // 定义 Color 值如何序列化为字符串
    override fun serialize(encoder: Encoder, value: Color) {
        // 将 RGB 值转换为十六进制字符串
        val hexValue = value.rgb.toString(16).padStart(6, '0')
        // 将序列化值编码为字符串
        encoder.encodeString(hexValue)
    }

    // 定义 Color 值如何从字符串反序列化
    override fun deserialize(decoder: Decoder): Color {
        // 解码序列化的字符串值
        val hexValue = decoder.decodeString()
        // 将解码后的值转换回 Color
        return Color(hexValue.toInt(16))
    }
}
// 将 ColorAsStringSerializer 指定为 Color 类的自定义序列化器
@Serializable(ColorAsStringSerializer::class)
data class Color(val rgb: Int)

fun main() {
    val color = Color(0x00FF00)
    // 将 Color 值序列化为 JSON
    val jsonString = Json.encodeToString(color)

    println(jsonString)
    // "00ff00"

    // 将 JSON 字符串反序列化为 Color 值
    val deserializedColor = Json.decodeFromString<Color>(jsonString)

    println(deserializedColor.rgb)
    // 65280
}
//sampleEnd
```
{kotlin-runnable="true"}

### 将二进制数据序列化为 Base64 字符串 {id="serialize-binary-data-as-base64-strings"}

除了简单的值转换之外，你还可以使用自定义基本类型序列化器来解决常见的序列化任务。
其中一项任务是将二进制数据表示为 [Base64](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.io.encoding/-base64/) 字符串。

不同的 API 默认使用不同的 Base64 变体。
请选择与预期变体相匹配的 Kotlin Base64 编码器，例如 [`Base64.Default`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.io.encoding/-base64/-default/) 或 [`Base64.Mime`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.io.encoding/-base64/-default/-mime.html)。

以下示例在 JSON 格式中使用 `Base64.Default` 将 `ByteArray` 序列化为 Base64 字符串：

```kotlin
import kotlinx.serialization.*
import kotlinx.serialization.json.*
import kotlinx.serialization.encoding.Encoder
import kotlinx.serialization.encoding.Decoder
import kotlinx.serialization.descriptors.*
import kotlin.io.encoding.*

//sampleStart
// 创建自定义基本类型序列化器，
// 用于将 ByteArray 表示为 Base64 字符串
object ByteArrayAsBase64Serializer : KSerializer<ByteArray> {

    // 使用默认的 Base64 变体
    private val base64 = Base64.Default

    // 将序列化形式定义为单个 STRING 基本类型
    override val descriptor: SerialDescriptor
        get() = PrimitiveSerialDescriptor(
            "ByteArrayAsBase64Serializer",
            PrimitiveKind.STRING
        )

    // 将 ByteArray 编码为 Base64 字符串
    override fun serialize(encoder: Encoder, value: ByteArray) {
        val base64Encoded = base64.encode(value)
        encoder.encodeString(base64Encoded)
    }

    // 将 Base64 字符串解码回 ByteArray
    override fun deserialize(decoder: Decoder): ByteArray {
        val base64Decoded = decoder.decodeString()
        return base64.decode(base64Decoded)
    }
}

@Serializable
data class Value(
    // 为此属性指定自定义序列化器
    @Serializable(ByteArrayAsBase64Serializer::class)
    val base64Input: ByteArray
) {

    // 为 ByteArray 实现基于值的相等性比较
    override fun equals(other: Any?): Boolean {
        if (this === other) return true
        if (javaClass != other?.javaClass) return false
        other as Value
        return base64Input.contentEquals(other.base64Input)
    }

    // 基于数组内容计算 hashCode
    override fun hashCode(): Int {
        return base64Input.contentHashCode()
    }
}

fun main() {
    val string = "PNG_IMAGE_DATA"
    val value = Value(string.toByteArray())

    // 将 Value 序列化为 JSON
    val encoded = Json.encodeToString(value)

    println(encoded)
    // {"base64Input":"UE5HX0lNQUdFX0RBVEE="}

    // 将 JSON 反序列化回 Value
    val decoded = Json.decodeFromString<Value>(encoded)

    println(decoded.base64Input.decodeToString())
    // PNG_IMAGE_DATA
}
//sampleEnd
```
{kotlin-runnable="true"}

### 将序列化委托给另一个序列化器 {id="delegate-serialization-to-another-serializer"}

你可以通过将序列化逻辑委托给该类型的序列化器，从而将一个类序列化为另一种类型。
例如，你可以使用此方法将一个类序列化为非基本类型（如 `IntArray`）。

要委托序列化，请创建一个自定义序列化器，并在其中定义一个被委托类型序列化器的属性：

1. 重写 `descriptor` 属性以包装被委托序列化器的 `descriptor`。

    > 委托序列化时，你不能直接使用原始类的 `descriptor` 或被委托类型的 `descriptor`。
    > 相反，应该创建一个复用被委托序列化器结构的新 `descriptor`。
    > 
    {style="note"}

2. 重写 `serialize()` 函数以将你的类的实例转换为被委托类型，并使用 [`encoder.encodeSerializableValue()`](https://kotlinlang.org/api/kotlinx.serialization/kotlinx-serialization-core/kotlinx.serialization.encoding/-encoder/encode-serializable-value.html) 函数通过被委托序列化器对其进行编码。
3. 重写 `deserialize()` 函数，通过被委托序列化器使用 [`decoder.decodeSerializableValue()`](https://kotlinlang.org/api/kotlinx.serialization/kotlinx-serialization-core/kotlinx.serialization.encoding/-decoder/decode-serializable-value.html) 函数解码该值，并将其转换回你的类的实例。

以下示例通过将序列化逻辑委托给 `IntArraySerializer`，将 `Color` 类序列化为 `IntArray`：

```kotlin
import kotlinx.serialization.*
import kotlinx.serialization.encoding.*
import kotlinx.serialization.descriptors.*
import kotlinx.serialization.builtins.IntArraySerializer
import kotlinx.serialization.json.*

//sampleStart
// 创建委托给 IntArraySerializer 的自定义序列化器
class ColorIntArraySerializer : KSerializer<Color> {
    private val delegateSerializer = IntArraySerializer()
    override val descriptor = SerialDescriptor("my.app.Color", delegateSerializer.descriptor)

    // 将序列化逻辑委托给 IntArraySerializer
    override fun serialize(encoder: Encoder, value: Color) {
        val data = intArrayOf(
            (value.rgb shr 16) and 0xFF,
            (value.rgb shr 8) and 0xFF,
            value.rgb and 0xFF
        )
        encoder.encodeSerializableValue(delegateSerializer, data)
    }

    // 委托反序列化并将 IntArray 转换回 Color
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

虽然在 JSON 中使用数组表示并不符合常规习惯，但在与 `ByteArray` 和二进制格式配合使用时，它可以减小序列化数据的大小。

> 有关非 JSON 序列化格式如何处理数组的更多信息，请参阅 [CBOR 格式](serialization-cbor.md)和 [ProtoBuf 格式](serialization-protobuf.md)。
> 
{style="tip"}

### 使用代理类序列化类 {id="serialize-classes-with-a-surrogate-class"}

在以下情况下，你可以使用*代理类（surrogate class）*（即与另一个类的序列化形式相匹配的类）：

* 想要在不修改类本身的情况下更改类的序列化方式。
* 避免[创建复合序列化器](#创建自定义复合序列化器)。
* 在创建原始类之前验证序列化形式。
* 处理直接序列化不符合类规则的情况。

你可以将代理类设为 [`private`](visibility-modifiers.md#class-members)，并使用 `init` 块对类的序列化表示施加约束。
你还可以[定义自定义序列化名称](serialization-customization-options.md#customize-serial-names)以保持序列化类型名称不变。

让我们看一个将 `Color` 序列化为 JSON 对象并对 `r`、`g` 和 `b` 属性指定特定范围的示例：

```kotlin
// 定义与序列化形式相匹配的代理类
@Serializable
@SerialName("Color")
private class ColorSurrogate(val r: Int, val g: Int, val b: Int) {
    init {
        // 对序列化形式施加约束
        require(r in 0..255 && g in 0..255 && b in 0..255)
    }
}
```

与[将序列化委托给另一个序列化器](#将序列化委托给另一个序列化器)类似，自定义序列化器将原始类转换为另一种表示形式，并包装该表示形式自动生成的 `SerialDescriptor`。

> 代理类使用它们自己的 `serialName` 定义 `SerialDescriptor`。
> 你可以复用代理类 `SerialDescriptor` 的结构，但不能复用其 `serialName`，因为每个 `SerialDescriptor` 必须具有唯一的 `serialName`。
>
{style="note"}

要检索代理类生成的序列化器，请使用 `ColorSurrogate.serializer()`：

```kotlin
object ColorSerializer : KSerializer<Color> {
    // 描述符的 serialName 必须唯一
    override val descriptor: SerialDescriptor = SerialDescriptor("my.app.Color", ColorSurrogate.serializer().descriptor)

    // 将原始类转换为代理表示
    override fun serialize(encoder: Encoder, value: Color) {
        val surrogate = ColorSurrogate((value.rgb shr 16) and 0xff, (value.rgb shr 8) and 0xff, value.rgb and 0xff)
        encoder.encodeSerializableValue(ColorSurrogate.serializer(), surrogate)
    }

    // 将代理表示转换回原始类
    override fun deserialize(decoder: Decoder): Color {
        val surrogate = decoder.decodeSerializableValue(ColorSurrogate.serializer())
        return Color((surrogate.r shl 16) or (surrogate.g shl 8) or surrogate.b)
    }
}
```

最后，为该类指定自定义序列化器：

```kotlin
import kotlinx.serialization.*
import kotlinx.serialization.encoding.*
import kotlinx.serialization.descriptors.*
import kotlinx.serialization.builtins.IntArraySerializer
import kotlinx.serialization.json.*

// 定义带有自定义属性的私有代理类
@Serializable
@SerialName("Color")
private class ColorSurrogate(val r: Int, val g: Int, val b: Int) {
    init {
        // 对序列化形式施加约束
        require(r in 0..255 && g in 0..255 && b in 0..255)
    }
}

// 创建用于在原始类与代理类之间转换的自定义序列化器
object ColorSerializer : KSerializer<Color> {
    // 为包装的 SerialDescriptor 定义唯一的 serialName
    override val descriptor: SerialDescriptor =
        SerialDescriptor("my.app.Color", ColorSurrogate.serializer().descriptor)

    // 将原始类转换为代理表示
    override fun serialize(encoder: Encoder, value: Color) {
        val surrogate = ColorSurrogate((value.rgb shr 16) and 0xff, (value.rgb shr 8) and 0xff, value.rgb and 0xff)
        encoder.encodeSerializableValue(ColorSurrogate.serializer(), surrogate)
    }

    // 将代理表示转换回原始类
    override fun deserialize(decoder: Decoder): Color {
        val surrogate = decoder.decodeSerializableValue(ColorSurrogate.serializer())
        return Color((surrogate.r shl 16) or (surrogate.g shl 8) or surrogate.b)
    }
}

//sampleStart
// 将 ColorSerializer 指定为该类的自定义序列化器
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

### 创建自定义复合序列化器 {id="create-a-custom-composite-serializer"}

你可以使用复合序列化器来表示复杂的数据结构，例如具有多个属性的类。

与使用[代理类](#使用代理类序列化类)相比，自定义复合序列化器允许你直接定义原始类的序列化结构，而无需额外的转换步骤。
在某些情况下这也可以提升性能，但需要手动编写更多的序列化逻辑。

要创建自定义复合序列化器：

1. 将序列化器创建为一个 `object`，并为目标类实现 `KSerializer`：

    ```kotlin
    object YourSerializer : KSerializer<Type>
    ```

2. 重写 `descriptor` 属性并使用 [`buildClassSerialDescriptor()`](https://kotlinlang.org/api/kotlinx.serialization/kotlinx-serialization-core/kotlinx.serialization.descriptors/build-class-serial-descriptor.html) 函数定义序列化架构：

   ```kotlin
   override val descriptor: SerialDescriptor =
       buildClassSerialDescriptor("com.example.Type") {
           // ...
       }
   ```
   
3. 在 `buildClassSerialDescriptor()` 函数中使用 [`element()`](https://kotlinlang.org/api/kotlinx.serialization/kotlinx-serialization-core/kotlinx.serialization.descriptors/element.html) 函数指定每个属性。
   元素的顺序决定了它们的索引，从 `0` 开始。

   序列化器 `descriptor` 的 [`SerialKind`](https://kotlinlang.org/api/kotlinx.serialization/kotlinx-serialization-core/kotlinx.serialization.descriptors/-serial-kind/) 决定了每个 `element()` 所代表的含义。
   在类 `descriptor` 中，`element()` 代表一个属性；而在枚举 `descriptor` 中，`element()` 则代表诸如 `RED` 或 `GREEN` 等常量：

   ```kotlin
   override val descriptor: SerialDescriptor =
       buildClassSerialDescriptor("com.example.Type") {
           element<Int>("first")
           element<Int>("second")
       }
   ```

4. 使用 [`encodeStructure()`](https://kotlinlang.org/api/kotlinx.serialization/kotlinx-serialization-core/kotlinx.serialization.encoding/encode-structure.html) DSL 实现 `serialize()` 函数。
   在其代码块内部，lambda 接收者是一个 [`CompositeEncoder`](https://kotlinlang.org/api/kotlinx.serialization/kotlinx-serialization-core/kotlinx.serialization.encoding/-composite-encoder/)，你可以按照 `descriptor` 中定义的顺序，为每个字段调用诸如 [`encodeIntElement()`](https://kotlinlang.org/api/kotlinx.serialization/kotlinx-serialization-core/kotlinx.serialization.encoding/-composite-encoder/encode-int-element.html) 等函数：

   ```kotlin
   override fun serialize(encoder: Encoder, value: Type) =
       encoder.encodeStructure(descriptor) {
           encodeIntElement(descriptor, 0, value.first)
           encodeIntElement(descriptor, 1, value.second)
       }
   ```

5. 使用 [`decodeStructure()`](https://kotlinlang.org/api/kotlinx.serialization/kotlinx-serialization-core/kotlinx.serialization.encoding/decode-structure.html) DSL 实现 `deserialize()` 函数。
   在其代码块内部，lambda 接收者是一个 [`CompositeDecoder`](https://kotlinlang.org/api/kotlinx.serialization/kotlinx-serialization-core/kotlinx.serialization.encoding/-composite-decoder/)，你可以使用它调用诸如 [`decodeIntElement()`](https://kotlinlang.org/api/kotlinx.serialization/kotlinx-serialization-core/kotlinx.serialization.encoding/-composite-decoder/decode-int-element.html) 等函数来解码每个属性。

   大多数格式允许以任意顺序对数据进行编码，这可能与序列化器 `descriptor` 中的元素顺序不同。
   使用 [`decodeElementIndex()`](https://kotlinlang.org/api/kotlinx.serialization/kotlinx-serialization-core/kotlinx.serialization.encoding/-composite-decoder/decode-element-index.html) 函数来确定要解码哪一个 `element()`。
   当没有剩余元素时，它会返回 [`CompositeDecoder.DECODE_DONE`](https://kotlinlang.org/api/kotlinx.serialization/kotlinx-serialization-core/kotlinx.serialization.encoding/-composite-decoder/-companion/-d-e-c-o-d-e_-d-o-n-e.html)，你可以据此停止对当前结构的解码：

   ```kotlin
   override fun deserialize(decoder: Decoder): Type =
       decoder.decodeStructure(descriptor) {
           var first = 0
           var second = ""
   
           // 使用 decodeElementIndex 确保无论顺序如何都能正确解码
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

6. 使用 `@Serializable(YourSerializer::class)` 注解为类指定自定义序列化器。

   > 如果你只需要转换或重构数据而无需手动处理每个元素，
   > 可以考虑[将序列化委托给另一个序列化器](#将序列化委托给另一个序列化器)或使用[代理类](#使用代理类序列化类)，这是更简单的方法。
   >
   {style="tip"}

让我们看一个如何序列化具有多个属性的 `Color` 类的示例：

```kotlin
import kotlinx.serialization.*
import kotlinx.serialization.encoding.*
import kotlinx.serialization.descriptors.*
import kotlinx.serialization.json.*

//sampleStart
// 为具有多个属性的 Color 类创建自定义序列化器
object ColorAsObjectSerializer : KSerializer<Color> {
    // 为 Color 类定义架构
    override val descriptor: SerialDescriptor =
        buildClassSerialDescriptor("my.app.Color") {
            // 使用 element() 函数指定每个属性的类型和名称
            element<Int>("r")
            element<Int>("g")
            element<Int>("b")
        }

    // 按照描述符中指定的顺序序列化 Color
    override fun serialize(encoder: Encoder, value: Color) =
        encoder.encodeStructure(descriptor) {
            encodeIntElement(descriptor, 0, (value.rgb shr 16) and 0xff)
            encodeIntElement(descriptor, 1, (value.rgb shr 8) and 0xff)
            encodeIntElement(descriptor, 2, value.rgb and 0xff)
        }

    // 将数据反序列化回 Color 对象
    override fun deserialize(decoder: Decoder): Color =
        decoder.decodeStructure(descriptor) {
            // 用于保存解码值的临时变量
            var r = -1
            var g = -1
            var b = -1
            // 使用 decodeElementIndex()，因为元素顺序可能因格式而异
            while (true) {
                when (val index = decodeElementIndex(descriptor)) {
                    0 -> r = decodeIntElement(descriptor, 0)
                    1 -> g = decodeIntElement(descriptor, 1)
                    2 -> b = decodeIntElement(descriptor, 2)
                    CompositeDecoder.DECODE_DONE -> break
                    else -> error("Unexpected index: $index")
                }
            }
            // 验证值并重建 Color
            require(r in 0..255 && g in 0..255 && b in 0..255)
            Color((r shl 16) or (g shl 8) or b)
        }
}

// 为 Color 指定自定义序列化器
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

### 在自定义序列化器中编码默认值 {id="encode-default-values-in-custom-serializers"}

插件生成的序列化器会检查编码器是否需要对等于其默认值的值进行编码。
例如，在 JSON 中，这是通过 [`encodeDefaults`](https://kotlinlang.org/api/kotlinx.serialization/kotlinx-serialization-json/kotlinx.serialization.json/-json-builder/encode-defaults.html) 属性控制的。

要在自定义序列化器中实现相同的行为，请将序列化器的 `descriptor` 以及正在编码的元素索引传递给 [`shouldEncodeElementDefault()`](https://kotlinlang.org/api/kotlinx.serialization/kotlinx-serialization-core/kotlinx.serialization.encoding/-composite-encoder/should-encode-element-default.html) 函数。

> 如果某个属性带有 [`@EncodeDefault`](https://kotlinlang.org/api/kotlinx.serialization/kotlinx-serialization-core/kotlinx.serialization/-encode-default/) 注解，插件生成的序列化器将不会调用 `shouldEncodeElementDefault()`。
>
{style="note"}

以下示例展示了当启用 `encodeDefaults` 时，自定义序列化器如何编码默认的 `Color` 值：

```kotlin
import kotlinx.serialization.*
import kotlinx.serialization.encoding.*
import kotlinx.serialization.descriptors.*
import kotlinx.serialization.json.*

//sampleStart
// 为具有多个属性的 Color 类创建自定义序列化器
object ColorAsObjectSerializer : KSerializer<Color> {
    // 为 Color 类定义架构
    override val descriptor: SerialDescriptor =
        buildClassSerialDescriptor("my.app.Color") {
            // 使用 element() 函数指定每个属性的类型和名称
            element<Int>("r", isOptional = true)
            element<Int>("g", isOptional = true)
            element<Int>("b", isOptional = true)
        }
   
    override fun serialize(encoder: Encoder, value: Color) =
        encoder.encodeStructure(descriptor) {
            val r = (value.rgb shr 16) and 0xff
            val g = (value.rgb shr 8) and 0xff
            val b = value.rgb and 0xff

            // 如果 r 与其默认值不同，
            // 或者编码器需要编码第一个元素的默认值，则对 r 进行编码
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

    // 将数据反序列化回 Color 对象
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

// 为 Color 指定自定义序列化器
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

### 使用顺序解码优化反序列化 {id="optimize-deserialization-with-sequential-decoding"}
<primary-label ref="experimental-general"/>

某些格式使用严格有序的架构，并能够支持顺序解码。
对于这些格式，你可以使用 [`decodeSequentially()`](https://kotlinlang.org/api/kotlinx.serialization/kotlinx-serialization-core/kotlinx.serialization.encoding/-composite-decoder/decode-sequentially.html) 函数优化反序列化。
如果当前结构可以按顺序解码，该函数返回 `true`。
单独处理这种情况可以跳过无序解码各个元素的更复杂逻辑。

> 由 `kotlinx.serialization` 插件生成的序列化器便采用了这种优化。
> 
{style="tip"}

以下示例展示了如何在可能的情况下使用 `decodeSequentially()` 来优化反序列化：

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
            // 如果格式按顺序存储数据，则直接按顺序解码值
            @OptIn(ExperimentalSerializationApi::class)
            if (decodeSequentially()) {
                r = decodeIntElement(descriptor, 0)           
                g = decodeIntElement(descriptor, 1)  
                b = decodeIntElement(descriptor, 2)
            } else while (true) {
                // 确保对于元素可能无序的格式进行正确解码
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

### 为泛型创建自定义序列化器 {id="create-a-custom-serializer-for-generic-types"}

要为泛型类创建自定义序列化器，请将序列化器声明为 `class` 而非 `object`，并为每个泛型类型形参提供一个 `KSerializer` 构造函数形参。

你可以将每个类型形参的序列化逻辑委托给对应的 `KSerializer`，以便根据其自身的序列化规则对其进行编码。

让我们看一个使用泛型类 `Box<T>` 的示例：

```kotlin
import kotlinx.serialization.*
import kotlinx.serialization.encoding.*
import kotlinx.serialization.descriptors.*
import kotlinx.serialization.json.*

//sampleStart
@Serializable(BoxSerializer::class)
data class Box<T>(val contents: T)

// 为 Box<T> 创建作为 class 的自定义序列化器
class BoxSerializer<T>(private val dataSerializer: KSerializer<T>) : KSerializer<Box<T>> {
    // 为 Box<T> 描述符定义唯一的 serialName
    override val descriptor: SerialDescriptor =
        SerialDescriptor("my.app.Box", dataSerializer.descriptor)

    // 委托序列化与反序列化
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

### 将插件生成的序列化器与自定义序列化器结合使用 {id="use-a-plugin-generated-serializer-together-with-a-custom-serializer"}
<primary-label ref="experimental-general"/>

默认情况下，如果你通过 `@Serializable(YourSerializer::class)` 指定了自定义序列化器，Kotlin 序列化插件将不会生成序列化器。

但你可能仍希望使用插件生成的序列化器，例如：

* 将插件生成的序列化器用作回退策略。
* 检查插件生成的 `descriptor` 以访问默认结构。
* 在不使用自定义序列化器的子类中复用默认序列化行为。

你可以通过使用 [`@KeepGeneratedSerializer`](https://kotlinlang.org/api/kotlinx.serialization/kotlinx-serialization-core/kotlinx.serialization/-keep-generated-serializer/) 注解可序列化类，将自动生成的序列化器与自定义序列化器一同保留。
要访问插件生成的序列化器，请在该可序列化类的伴生对象上使用 `.generatedSerializer()` 函数。

这在使用 `JsonTransformingSerializer` [调整 JSON 结构并复用插件生成的序列化器以实现默认序列化逻辑](serialization-transform-json.md#add-custom-behavior-to-the-default-serializer)时也非常有用。

以下示例同时使用了自定义序列化器和插件生成的序列化器：

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

    // 使用自定义序列化器
    println(Json.encodeToString(green))
    // "00ff00"

    // 使用插件生成的序列化器
    println(Json.encodeToString(Color.generatedSerializer(), green))
    // {"rgb":65280}

}
//sampleEnd
```
{kotlin-runnable="true"}

## 应用序列化器 {id="apply-serializers"}

你可以将自定义序列化器应用于自己的类以及第三方类型。
像 [java.util.Date](https://docs.oracle.com/javase/8/docs/api/java/util/Date.html) 这样的第三方类型无法直接添加 [`@Serializable`](https://kotlinlang.org/api/kotlinx.serialization/kotlinx-serialization-core/kotlinx.serialization/-serializable/) 注解，因为其源代码无法修改。

### 手动传递序列化器 {id="pass-a-serializer-manually"}

要使用自定义序列化器序列化类型，请创建序列化器并将其显式传递给 [`Json.encodeToString()`](https://kotlinlang.org/api/kotlinx.serialization/kotlinx-serialization-json/kotlinx.serialization.json/-json/encode-to-string.html) 和 [`Json.decodeFromString()`](https://kotlinlang.org/api/kotlinx.serialization/kotlinx-serialization-json/kotlinx.serialization.json/-json/decode-from-string.html) 等函数的重载方法。

以下示例将 `Date` 值序列化为自 Unix 纪元以来的毫秒数：

```kotlin
import kotlinx.serialization.*
import kotlinx.serialization.encoding.*
import kotlinx.serialization.descriptors.*
import kotlinx.serialization.json.*
import java.util.Date
import java.text.SimpleDateFormat

//sampleStart
// 由于无法访问其源代码，不能在 Date 上使用 @Serializable
object DateAsLongSerializer : KSerializer<Date> {
    override val descriptor: SerialDescriptor = PrimitiveSerialDescriptor("my.app.DateAsLong", PrimitiveKind.LONG)
    override fun serialize(encoder: Encoder, value: Date) = encoder.encodeLong(value.time)
    override fun deserialize(decoder: Decoder): Date = Date(decoder.decodeLong())
}

fun main() {
    val kotlin10ReleaseDate = SimpleDateFormat("yyyy-MM-ddX").parse("2016-02-15+00") 

    // 将 Date 序列化为以毫秒为单位的 Long
    println(Json.encodeToString(DateAsLongSerializer, kotlin10ReleaseDate))    
    // 1455494400000
}
//sampleEnd
```
{kotlin-runnable="true"}

### 在属性上指定序列化器 {id="specify-a-serializer-on-a-property"}

当某个类型用作可序列化类中的属性时，可以使用 `@Serializable` 注解在该属性上指定其自定义序列化器：

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
    // 为 Date 属性指定自定义序列化器
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

### 在类型上指定序列化器 {id="specify-a-serializer-on-a-type"}

你也可以将 `@Serializable` 注解直接应用于类型。
当类型用作泛型类型实参时（例如在 `List<Date>` 中），你可以使用此方式为其指定自定义序列化器：

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
     // 为作为泛型类型实参的 Date 指定自定义序列化器
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

### 为文件指定序列化器 {id="specify-a-serializer-for-a-file"}

要将序列化器应用于源文件中给定类型的所有属性，请在文件开头添加 [`@UseSerializers`](https://kotlinlang.org/api/kotlinx.serialization/kotlinx-serialization-core/kotlinx.serialization/-use-serializers/) 注解：

```kotlin
@file:UseSerializers(DateAsLongSerializer::class)
```

这会将 `DateAsLongSerializer` 应用于该文件中该类型的所有实例，因此你无需单独为每个属性添加注解。

示例如下：

```kotlin
// 将自定义序列化器应用于文件中该类型的所有属性
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

// 为 Date 属性使用文件级序列化器
@Serializable
class ProgrammingLanguage(val name: String, val stableReleaseDate: Date)

fun main() {
    val data = ProgrammingLanguage("Kotlin", SimpleDateFormat("yyyy-MM-ddX").parse("2016-02-15+00"))
 
   println(Json.encodeToString(data))
    // {"name":"Kotlin","stableReleaseDate":1455494400000}
}
```
{kotlin-runnable="true"}

### 使用类型别名指定序列化器 {id="specify-serializers-with-type-aliases"}

在 Kotlin 序列化中，通常使用 `@Serializable` 注解显式指定序列化策略。
除了[上下文序列化](#实现上下文序列化)之外，它不提供全局序列化器配置。

如果你在多处重复使用相同的序列化器，可以定义附带序列化器注解的 [`typealias`](type-aliases.md)。

这样你就可以复用带注解的类型，而无需在每个使用位置都添加 `@Serializable` 注解。

以下是使用 `typealias` 将 `DateAsLongSerializer` 和 `DateAsSimpleTextSerializer` 应用于 `Date` 的示例：

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

// 定义将 Date 编码为格式化字符串 (yyyy-MM-dd) 的序列化器
object DateAsSimpleTextSerializer: KSerializer<Date> {
    override val descriptor: SerialDescriptor = PrimitiveSerialDescriptor("my.app.DateAsSimpleText", PrimitiveKind.LONG)
    private val format = SimpleDateFormat("yyyy-MM-dd").apply {
        // 将时区设置为 UTC 以获得一致的输出
        setTimeZone(TimeZone.getTimeZone("UTC"))
    }
    override fun serialize(encoder: Encoder, value: Date) = encoder.encodeString(format.format(value))
    override fun deserialize(decoder: Decoder): Date = format.parse(decoder.decodeString())
}

// 使用 typealias 应用全局序列化器，以避免在每处使用时都添加注解
typealias DateAsLong = @Serializable(DateAsLongSerializer::class) Date

typealias DateAsText = @Serializable(DateAsSimpleTextSerializer::class) Date

// 使用 typealias 为 Date 属性应用自定义序列化器
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

### 实现上下文序列化 {id="implement-contextual-serialization"}

默认情况下，序列化策略在编译时确定。
*上下文序列化（Contextual serialization）*允许你在运行时调整特定类型的序列化策略，即使它们嵌套在对象树的深处也是如此。

例如，你可以使用上下文序列化，根据所使用的协议版本，在 JSON 格式中将 `java.util.Date` 序列化为 ISO 8601 `String` 或 `Long`。
内置的 [`ContextualSerializer`](https://kotlinlang.org/api/kotlinx.serialization/kotlinx-serialization-core/kotlinx.serialization/-contextual-serializer/) 类支持该方式。

上下文序列化在运行时从 `SerializersModule` 中为类型选择自定义序列化器。

要实现上下文序列化：

1. 在可序列化类中使用 [`@Contextual`](https://kotlinlang.org/api/kotlinx.serialization/kotlinx-serialization-core/kotlinx.serialization/-contextual/) 注解标记属性。

   > [`@Contextual`](https://kotlinlang.org/api/kotlinx.serialization/kotlinx-serialization-core/kotlinx.serialization/-contextual/) 注解是 [`ContextualSerializer`](https://kotlinlang.org/api/kotlinx.serialization/kotlinx-serialization-core/kotlinx.serialization/-contextual-serializer/) 类的快捷方式。
   > 要对同一文件中的多个属性应用上下文序列化，请使用 [`@UseContextualSerialization`](https://kotlinlang.org/api/kotlinx.serialization/kotlinx-serialization-core/kotlinx.serialization/-use-contextual-serialization/) 注解。
   >
   {style="tip"}

2. 使用 [`SerializersModule()`](https://kotlinlang.org/api/kotlinx.serialization/kotlinx-serialization-core/kotlinx.serialization.modules/-serializers-module.html) 构建器函数创建 [`SerializersModule`](https://kotlinlang.org/api/kotlinx.serialization/kotlinx-serialization-core/kotlinx.serialization.modules/-serializers-module/)。
   使用 [`contextual()`](https://kotlinlang.org/api/kotlinx.serialization/kotlinx-serialization-core/kotlinx.serialization.modules/contextual.html) 函数注册用于上下文序列化的自定义序列化器。

    如果没有 `SerializersModule`，在对没有默认序列化器的上下文注解类型进行序列化或反序列化时，会抛出 `SerializationException`。

3. 创建 `Json` 实例并将 `SerializersModule` 传递给 [`serializersModule`](https://kotlinlang.org/api/kotlinx.serialization/kotlinx-serialization-json/kotlinx.serialization.json/-json-builder/serializers-module.html) 属性。

示例如下：

```kotlin
import kotlinx.serialization.*
import kotlinx.serialization.encoding.*
import kotlinx.serialization.descriptors.*
import kotlinx.serialization.json.*
import java.util.Date
import java.text.SimpleDateFormat

//sampleStart
// 为 Date 创建自定义序列化器
object DateAsLongSerializer : KSerializer<Date> {
    override val descriptor: SerialDescriptor = PrimitiveSerialDescriptor("my.app.Date", PrimitiveKind.LONG)
    override fun serialize(encoder: Encoder, value: Date) = encoder.encodeLong(value.time)
    override fun deserialize(decoder: Decoder): Date = Date(decoder.decodeLong())
}

@Serializable
class ProgrammingLanguage(
    val name: String,
    // 为 Date 指定上下文序列化
    @Contextual
    val stableReleaseDate: Date
)

// 定义 SerializersModule 并注册 Date 的上下文序列化器
private val module = SerializersModule { 
    contextual(DateAsLongSerializer)
}

// 使用自定义 SerializersModule 创建 Json 实例
val format = Json { serializersModule = module }

fun main() {
    val data = ProgrammingLanguage("Kotlin", SimpleDateFormat("yyyy-MM-ddX").parse("2016-02-15+00"))
 
   println(format.encodeToString(data))
    // {"name":"Kotlin","stableReleaseDate":1455494400000}
}
//sampleEnd
```
{kotlin-runnable="true"}

#### 上下文序列化泛型类 {id="serialize-generic-classes-contextually"}

要以上下文方式序列化泛型类，可以在 `SerializersModule` 中注册一个函数。
该函数接收泛型类型实参的序列化器，并在运行时创建相应的序列化器。

你不能为泛型类使用单个序列化器实例，因为[泛型类型实参可能会发生变化](#为泛型创建自定义序列化器)。
例如，以下方法仅适用于 `Box<Int>`，但不适用于 `Box<String>` 等其他类型：

```kotlin
val incorrectModule = SerializersModule {
    // 这仅适用于 Box<Int>，但不适用于 Box<String> 或其他类型
    contextual(BoxSerializer(Int.serializer()))
}
```

相反，应该注册一个基于类型实参的序列化器为 `Box<T>` 等泛型类型创建序列化器的函数。
示例如下：

```kotlin
val correctModule = SerializersModule {
    // args[0] 是针对 T 的序列化器，
    // 例如 Int.serializer() 或 String.serializer()
    contextual(Box::class) { args -> BoxSerializer(args[0]) }
}
```

> 你可以使用 `plus` 运算符组合多个 `SerializersModule` 实例，例如泛型类模块和非泛型类模块。
> 欲了解更多信息，请参阅[合并多个 `SerializersModule` 实例](serialization-polymorphism.md#merge-multiple-serializersmodule-instances)。
>
{style="tip"}

## 下一步 {id="what-s-next"}

* 探索如何通过修改 JSON 元素树来[转换 JSON 结构](serialization-transform-json.md)，而不是创建自定义序列化器。
* 在[自定义序列化格式](serialization-custom-formats.md)中了解如何创建自定义格式。
* 探索实验性序列化格式，例如 [CBOR](serialization-cbor.md) 和 [ProtoBuf](serialization-protobuf.md)。