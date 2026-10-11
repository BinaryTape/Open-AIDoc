[//]: # (title: 自定义序列化格式)
<primary-label ref="experimental-general"/>

[//]: # (description: 了解如何为 Kotlin 序列化创建自定义格式，包括编码器、解码器、顺序解码以及对格式特定类型的支持。)

JSON 目前是 Kotlin 序列化中唯一稳定的格式。
Kotlin 序列化还为 [CBOR](serialization-cbor.md) 和 [ProtoBuf](serialization-protobuf.md) 二进制格式提供了实验性支持，此外还提供了将类表示为以 `String` 为键的扁平 Map 的 [`Properties`](https://kotlinlang.org/api/kotlinx.serialization/kotlinx-serialization-properties/kotlinx.serialization.properties/-properties/) 格式。

这些实验性格式实现已达到生产质量，但未来的版本可能会对其默认序列化行为进行更改。
它们也可能存在特定于格式的局限性，或者在表示 Kotlin 数据的方式上存在限制。

如果这些格式都不符合你的用例，你可以创建自定义格式来控制值和结构的编码与解码方式。

## 创建自定义格式 {id="create-custom-formats"}

要为 Kotlin 序列化创建自定义格式，请实现 [`Encoder`](https://kotlinlang.org/api/kotlinx.serialization/kotlinx-serialization-core/kotlinx.serialization.encoding/-encoder/) 和 [`Decoder`](https://kotlinlang.org/api/kotlinx.serialization/kotlinx-serialization-core/kotlinx.serialization.encoding/-decoder/) 接口。
序列化器使用这些实现来编码和解码值。

在编码或解码结构化值（例如类和集合）时，序列化器会调用这些实现上的 [`beginStructure()`](https://kotlinlang.org/api/kotlinx.serialization/kotlinx-serialization-core/kotlinx.serialization.encoding/-encoder/begin-structure.html) 函数。
该函数返回一个 [`CompositeEncoder`](https://kotlinlang.org/api/kotlinx.serialization/kotlinx-serialization-core/kotlinx.serialization.encoding/-composite-encoder/) 或 [`CompositeDecoder`](https://kotlinlang.org/api/kotlinx.serialization/kotlinx-serialization-core/kotlinx.serialization.encoding/-composite-decoder/) 接口，其中包含用于编码或解码每个属性或元素的函数。

虽然 `Encoder` 和 `Decoder` 接口功能十分广泛，但你可以使用 [`AbstractEncoder`](https://kotlinlang.org/api/kotlinx.serialization/kotlinx-serialization-core/kotlinx.serialization.encoding/-abstract-encoder/) 和 [`AbstractDecoder`](https://kotlinlang.org/api/kotlinx.serialization/kotlinx-serialization-core/kotlinx.serialization.encoding/-abstract-decoder/) 类来简化创建自定义编码器和解码器实现的过程。
这些类实现了 `Encoder`、`Decoder`、`CompositeEncoder` 和 `CompositeDecoder` 接口，因此在简单格式中，你可以使用同一个类来处理基本类型值和结构化值。

`AbstractEncoder` 类为大多数编码函数（例如 [`encodeString()`](https://kotlinlang.org/api/kotlinx.serialization/kotlinx-serialization-core/kotlinx.serialization.encoding/-abstract-encoder/encode-string.html)）提供了默认实现，这些函数委托给 [`encodeValue(value: Any)`](https://kotlinlang.org/api/kotlinx.serialization/kotlinx-serialization-core/kotlinx.serialization.encoding/-abstract-encoder/encode-value.html) 函数。
这意味着只需重写 `encodeValue()` 函数，你就可以轻松创建一个基本且功能可用的自定义格式。

以下各节将使用这些 API 创建一个自定义格式：将值编码到列表中、从该列表中解码值，然后逐步添加顺序解码、集合支持以及 null 支持。

### 创建基础编码器 {id="create-a-basic-encoder"}

要构建自定义编码器，可以继承 `AbstractEncoder` 类。
这允许你重写默认实现，而无需从头实现 `Encoder` 和 `CompositeEncoder` 接口。

要创建基础编码器：

1. 创建一个继承 `AbstractEncoder` 的类以定义自定义序列化逻辑：

    ```kotlin
    @ExperimentalSerializationApi
    class ListEncoder : AbstractEncoder() {
        val list = mutableListOf<Any>()
    
        override val serializersModule: SerializersModule = EmptySerializersModule()
    }
    ```

2. 在 `ListEncoder` 类中，重写 `encodeValue()` 以定义编码器如何处理每个值。

    ```kotlin
        override fun encodeValue(value: Any) {
            list.add(value)
        }
    ```

3. 创建一个使用该编码器序列化值的函数：

    ```kotlin
    @ExperimentalSerializationApi
    fun <T> encodeToList(serializer: SerializationStrategy<T>, value: T): List<Any> {
        val encoder = ListEncoder()
        encoder.encodeSerializableValue(serializer, value)
        return encoder.list
    }
    ```

4. 添加一个使用带有具体化（reified）类型形参的 `serializer()` 的内联重载，这样调用方就无需显式传递序列化器：

    ```kotlin
    @ExperimentalSerializationApi
    inline fun <reified T> encodeToList(value: T) = encodeToList(serializer(), value)
    ```

> 由于编码器通常会被应用程序的其他部分使用，因此请传递传播 `@ExperimentalSerializationApi` 注解，而不是仅在单个函数内部选择启用。
>
{style="note"}

以下是一个最小示例，它将对象图中的基本类型值按序列化顺序编码为一个扁平列表：

```kotlin
import kotlinx.serialization.*
import kotlinx.serialization.descriptors.*
import kotlinx.serialization.encoding.*
import kotlinx.serialization.modules.*

// 创建一个将序列化值存储在列表中的自定义编码器
@ExperimentalSerializationApi
class ListEncoder : AbstractEncoder() {
    val list = mutableListOf<Any>()

    override val serializersModule: SerializersModule = EmptySerializersModule()

    // 存储每个编码值
    override fun encodeValue(value: Any) {
        list.add(value)
    }
}

// 编码一个值并将收集的值作为列表返回
@ExperimentalSerializationApi
fun <T> encodeToList(serializer: SerializationStrategy<T>, value: T): List<Any> {
    val encoder = ListEncoder()
    encoder.encodeSerializableValue(serializer, value)
    return encoder.list
}

// 提供类型安全的内联重载以方便调用
@ExperimentalSerializationApi
inline fun <reified T> encodeToList(value: T) = encodeToList(serializer(), value)

@Serializable
data class Project(val name: String, val owner: User, val votes: Int)

@Serializable
data class User(val name: String)

@OptIn(ExperimentalSerializationApi::class)
fun main() {
    val data = Project("kotlinx.serialization", User("kotlin"), 9000)
    println(encodeToList(data))
    // [kotlinx.serialization, kotlin, 9000]
}
```
{kotlin-runnable="true"}

输出显示，编码器按序列化顺序将所有序列化的值收集到了一个扁平列表中。
当你需要统一处理这些值时（例如计算哈希或摘要），这会非常有用。

### 创建基础解码器 {id="create-a-basic-decoder"}

要构建自定义解码器，可以继承 `AbstractDecoder` 类。
这允许你重写默认实现，而无需从头实现 `Decoder` 和 `CompositeDecoder` 接口。

要创建基础解码器：

1. 创建一个继承 `AbstractDecoder` 的类以定义自定义反序列化逻辑：

    ```kotlin
    @ExperimentalSerializationApi
    class ListDecoder(val list: ArrayDeque<Any>) : AbstractDecoder() {
        private var elementIndex = 0
    
        override val serializersModule: SerializersModule = EmptySerializersModule()
    }
    ```

2. 在 `ListDecoder` 类中，重写 [`decodeValue()`](https://kotlinlang.org/api/kotlinx.serialization/kotlinx-serialization-core/kotlinx.serialization.encoding/-abstract-decoder/decode-value.html) 函数以定义解码器如何反序列化值：

    ```kotlin
        override fun decodeValue(): Any = list.removeFirst()
    ```

3. 重写 [`decodeElementIndex()`](https://kotlinlang.org/api/kotlinx.serialization/kotlinx-serialization-core/kotlinx.serialization.encoding/-composite-decoder/decode-element-index.html) 函数以指示接下来解码哪个元素，并在结构处理完成时返回 `DECODE_DONE`：

    ```kotlin
        override fun decodeElementIndex(descriptor: SerialDescriptor): Int {
            if (elementIndex == descriptor.elementsCount) return CompositeDecoder.DECODE_DONE
            return elementIndex++
        }
    ```

   该格式按序列化顺序反序列化值，因此可以使用简单的 `elementIndex` 计数器来跟踪进度。
   更复杂的格式通常需要额外的逻辑来查找下一个要解码的元素。

   > 要了解自定义序列化器如何使用来自 `decodeElementIndex()` 函数的元素索引，请参阅[创建自定义复合序列化器](serialization-create-and-use-serializers.md#create-a-custom-composite-serializer)。
   >
   {style="tip"}

4. 重写 [`beginStructure()`](https://kotlinlang.org/api/kotlinx.serialization/kotlinx-serialization-core/kotlinx.serialization.encoding/-abstract-decoder/begin-structure.html) 函数为每个嵌套结构创建新的解码器，从而使每个递归解码的结构保持其各自的 `elementIndex` 状态：

    ```kotlin
        override fun beginStructure(descriptor: SerialDescriptor): CompositeDecoder =
            ListDecoder(list)
    ```

5. 创建一个使用该解码器反序列化值的函数：

    ```kotlin
    @ExperimentalSerializationApi
    fun <T> decodeFromList(list: List<Any>, deserializer: DeserializationStrategy<T>): T {
        val decoder = ListDecoder(ArrayDeque(list))
        return decoder.decodeSerializableValue(deserializer)
    }
    ```

6. 添加一个内联重载以使反序列化更容易调用：

    ```kotlin
    @ExperimentalSerializationApi
    inline fun <reified T> decodeFromList(list: List<Any>): T = decodeFromList(list, serializer())
    ```

以下是一个完整的示例，展示了如何将基本类型值列表解码回对象：

```kotlin
import kotlinx.serialization.*
import kotlinx.serialization.descriptors.*
import kotlinx.serialization.encoding.*
import kotlinx.serialization.modules.*

// 创建一个将序列化值存储在列表中的自定义编码器
@ExperimentalSerializationApi
class ListEncoder : AbstractEncoder() {
    val list = mutableListOf<Any>()

    override val serializersModule: SerializersModule = EmptySerializersModule()

    // 存储每个编码值
    override fun encodeValue(value: Any) {
       list.add(value)
    }
}

// 编码一个值并将收集的值作为列表返回
@ExperimentalSerializationApi
fun <T> encodeToList(serializer: SerializationStrategy<T>, value: T): List<Any> {
    val encoder = ListEncoder()
    encoder.encodeSerializableValue(serializer, value)
    return encoder.list
}

// 提供类型安全的内联版本 encodeToList 以方便调用
@ExperimentalSerializationApi
inline fun <reified T> encodeToList(value: T) = encodeToList(serializer(), value)

//sampleStart
// 创建一个从列表中解码序列化值的自定义解码器
@ExperimentalSerializationApi
class ListDecoder(val list: ArrayDeque<Any>) : AbstractDecoder() {
    private var elementIndex = 0

    override val serializersModule: SerializersModule = EmptySerializersModule()

    // 从列表中返回下一个值
    override fun decodeValue(): Any = list.removeFirst()
    
    // 指示下一个元素索引或发出解码完成的信号
    override fun decodeElementIndex(descriptor: SerialDescriptor): Int {
        if (elementIndex == descriptor.elementsCount) return CompositeDecoder.DECODE_DONE
        return elementIndex++
    }

    // 为每个嵌套结构创建新的解码器
    override fun beginStructure(descriptor: SerialDescriptor): CompositeDecoder =
        ListDecoder(list)
}

// 使用自定义解码器从列表中反序列化对象
@ExperimentalSerializationApi
fun <T> decodeFromList(list: List<Any>, deserializer: DeserializationStrategy<T>): T {
    val decoder = ListDecoder(ArrayDeque(list))
    return decoder.decodeSerializableValue(deserializer)
}

// 提供类型安全的内联版本 decodeFromList 以方便调用
@ExperimentalSerializationApi
inline fun <reified T> decodeFromList(list: List<Any>): T = decodeFromList(list, serializer())

@Serializable
data class Project(val name: String, val owner: User, val votes: Int)

@Serializable
data class User(val name: String)

@OptIn(ExperimentalSerializationApi::class)
fun main() {
    val data = Project("kotlinx.serialization", User("kotlin"), 9000)
    val list = encodeToList(data)
    println(list)
    // [kotlinx.serialization, kotlin, 9000]

    val obj = decodeFromList<Project>(list)
    println(obj)
    // Project(name=kotlinx.serialization, owner=User(name=kotlin), votes=9000)
}
//sampleEnd
```
{kotlin-runnable="true"}

输出显示解码器按序列化顺序重新读取列表，并重建了原始对象。

`decodeElementIndex()` 函数指示接下来处理哪个属性，而 `beginStructure()` 函数为嵌套对象创建新的解码器状态。

### 通过顺序解码进行优化 {id="optimize-with-sequential-decoding"}

如果你的格式始终按声明顺序存储值，并且不支持[跳过可选元素](serialization-create-and-use-serializers.md#encode-default-values-in-custom-serializers)，则可以使用 [`decodeSequentially()`](https://kotlinlang.org/api/kotlinx.serialization/kotlinx-serialization-core/kotlinx.serialization.encoding/-composite-decoder/decode-sequentially.html) 函数来优化解码。

当此函数返回 `true` 时，支持顺序解码的序列化器可以按顺序读取值，而无需重复请求下一个元素索引。
这可以提高反序列化按顺序格式存储的数据时的性能。由 `kotlinx.serialization` 插件生成的序列化器使用了这种优化。

从 `decodeSequentially()` 函数返回 `true` 并不保证使用你解码器的序列化器一定会采用顺序解码。
因此，请确保你的解码器同时支持通过 `decodeElementIndex()` 函数进行的常规解码。

> 要了解序列化器在反序列化期间如何使用 `decodeSequentially()` 函数，请参阅[通过顺序解码优化反序列化](serialization-create-and-use-serializers.md#optimize-deserialization-with-sequential-decoding)。
>
{style="tip"}

以下是将此优化应用于自定义 `ListDecoder` 的方法：

```kotlin
import kotlinx.serialization.*
import kotlinx.serialization.descriptors.*
import kotlinx.serialization.encoding.*
import kotlinx.serialization.modules.*

@ExperimentalSerializationApi
class ListEncoder : AbstractEncoder() {
    val list = mutableListOf<Any>()

    override val serializersModule: SerializersModule = EmptySerializersModule()

    override fun encodeValue(value: Any) {
        list.add(value)
    }
}

@ExperimentalSerializationApi
fun <T> encodeToList(serializer: SerializationStrategy<T>, value: T): List<Any> {
    val encoder = ListEncoder()
    encoder.encodeSerializableValue(serializer, value)
    return encoder.list
}

@ExperimentalSerializationApi
inline fun <reified T> encodeToList(value: T) = encodeToList(serializer(), value)

//sampleStart
@ExperimentalSerializationApi
class ListDecoder(val list: ArrayDeque<Any>) : AbstractDecoder() {
    private var elementIndex = 0

    override val serializersModule: SerializersModule = EmptySerializersModule()

    override fun decodeValue(): Any = list.removeFirst()

    // 当序列化器未使用顺序解码时添加常规解码支持
    override fun decodeElementIndex(descriptor: SerialDescriptor): Int {
        if (elementIndex == descriptor.elementsCount) return CompositeDecoder.DECODE_DONE
        return elementIndex++
    }

    override fun beginStructure(descriptor: SerialDescriptor): CompositeDecoder =
        ListDecoder(list)

    // 为支持它的序列化器启用顺序解码
    override fun decodeSequentially(): Boolean = true
}

//sampleEnd
@ExperimentalSerializationApi
fun <T> decodeFromList(list: List<Any>, deserializer: DeserializationStrategy<T>): T {
    val decoder = ListDecoder(ArrayDeque(list))
    return decoder.decodeSerializableValue(deserializer)
}

@ExperimentalSerializationApi
inline fun <reified T> decodeFromList(list: List<Any>): T = decodeFromList(list, serializer())

@Serializable
data class Project(val name: String, val owner: User, val votes: Int)

@Serializable
data class User(val name: String)

@OptIn(ExperimentalSerializationApi::class)
fun main() {
    val data = Project("kotlinx.serialization", User("kotlin"), 9000)
    val list = encodeToList(data)
    println(list)
    // [kotlinx.serialization, kotlin, 9000]

    val obj = decodeFromList<Project>(list)
    println(obj)
    // Project(name=kotlinx.serialization, owner=User(name=kotlin), votes=9000)
}
```
{kotlin-runnable="true"}

在此示例中，`ListDecoder` 重写了 `decodeSequentially()` 函数以返回 `true`。
这使得受支持的序列化器可以直接按声明顺序读取值，而无需逐个查询每个元素索引。

### 添加集合支持 {id="add-collection-support"}

基础自定义格式可以逐个编码集合元素，但解码时也需要知道属于该集合的元素数量。

要在自定义格式中支持集合，请将集合大小与其元素一起编码，以便解码器知道集合在何处结束：

1. 在编码器中实现 [`beginCollection()`](https://kotlinlang.org/api/kotlinx.serialization/kotlinx-serialization-core/kotlinx.serialization.encoding/-encoder/begin-collection.html) 函数以处理集合大小。
2. 如果编码器不需要额外的集合特定状态，则从 `beginCollection()` 函数返回编码器实例本身。
3. 在解码器中实现 [`decodeCollectionSize()`](https://kotlinlang.org/api/kotlinx.serialization/kotlinx-serialization-core/kotlinx.serialization.encoding/-composite-decoder/decode-collection-size.html) 函数，以便在反序列化期间解码并存储集合大小。
4. 如果格式预先存储了集合大小且值是按顺序读取的，则从 `decodeSequentially()` 函数返回 `true`。

以下是为 `ListEncoder` 添加集合支持的完整示例：

```kotlin
import kotlinx.serialization.*
import kotlinx.serialization.descriptors.*
import kotlinx.serialization.encoding.*
import kotlinx.serialization.modules.*

@ExperimentalSerializationApi
fun <T> encodeToList(serializer: SerializationStrategy<T>, value: T): List<Any> {
   val encoder = ListEncoder()
   encoder.encodeSerializableValue(serializer, value)
   return encoder.list
}

@ExperimentalSerializationApi
inline fun <reified T> encodeToList(value: T) = encodeToList(serializer(), value)

@ExperimentalSerializationApi
fun <T> decodeFromList(list: List<Any>, deserializer: DeserializationStrategy<T>): T {
   val decoder = ListDecoder(ArrayDeque(list))
   return decoder.decodeSerializableValue(deserializer)
}

@ExperimentalSerializationApi
inline fun <reified T> decodeFromList(list: List<Any>): T = decodeFromList(list, serializer())

@Serializable
data class Project(val name: String, val owners: List<User>, val votes: Int)

@Serializable
data class User(val name: String)

//sampleStart
@ExperimentalSerializationApi
class ListEncoder : AbstractEncoder() {
    val list = mutableListOf<Any>()

    override val serializersModule: SerializersModule = EmptySerializersModule()

    override fun encodeValue(value: Any) {
        list.add(value)
    }

    // 在元素之前存储集合大小
    override fun beginCollection(descriptor: SerialDescriptor, collectionSize: Int): CompositeEncoder {
        encodeInt(collectionSize)
        // 返回相同的编码器，因为不需要额外的集合特定状态
        return this
    }
}

@ExperimentalSerializationApi
class ListDecoder(val list: ArrayDeque<Any>, var elementsCount: Int = 0) : AbstractDecoder() {
    private var elementIndex = 0

    override val serializersModule: SerializersModule = EmptySerializersModule()

    override fun decodeValue(): Any = list.removeFirst()

    override fun decodeElementIndex(descriptor: SerialDescriptor): Int {
        if (elementIndex == elementsCount) return CompositeDecoder.DECODE_DONE
        return elementIndex++
    }

    override fun beginStructure(descriptor: SerialDescriptor): CompositeDecoder =
        ListDecoder(list, descriptor.elementsCount)

    // 发出按顺序解码值的信号，因为预先已知集合大小
    override fun decodeSequentially(): Boolean = true

    // 在读取集合元素之前解码并存储集合大小
    override fun decodeCollectionSize(descriptor: SerialDescriptor): Int =
        decodeInt().also { elementsCount = it }
}

@OptIn(ExperimentalSerializationApi::class)
fun main() {
    val data = Project("kotlinx.serialization", listOf(User("kotlin"), User("jetbrains")), 9000)
    val list = encodeToList(data)
    println(list)
    // [kotlinx.serialization, 2, kotlin, jetbrains, 9000]

    val obj = decodeFromList<Project>(list)
    println(obj)
    // Project(name=kotlinx.serialization, owners=[User(name=kotlin), User(name=jetbrains)], votes=9000)
}
//sampleEnd
```
{kotlin-runnable="true"}

在此示例中，编码后的列表在集合元素之前包含了集合大小，因此解码器能够正确解码集合。

### 添加 null 支持 {id="add-null-support"}

要在自定义格式中支持 null 值，需要有一种方法将 `null` 与常规值区分开来。

这通常涉及在每个可为 null 的值之前添加一个“null 指示标记”，用于区分 `null` 值与实际数据。

要在自定义格式中添加对 null 值的支持：

1. 在编码器中重写 [`encodeNull()`](https://kotlinlang.org/api/kotlinx.serialization/kotlinx-serialization-core/kotlinx.serialization.encoding/-abstract-encoder/encode-null.html) 以指定如何标记 `null` 值。
2. 在编码器中重写 [`encodeNotNullMark()`](https://kotlinlang.org/api/kotlinx.serialization/kotlinx-serialization-core/kotlinx.serialization.encoding/-encoder/encode-not-null-mark.html) 以标记非 null 值。
3. 在解码器中重写 [`decodeNotNullMark()`](https://kotlinlang.org/api/kotlinx.serialization/kotlinx-serialization-core/kotlinx.serialization.encoding/-decoder/decode-not-null-mark.html) 以在解码该值之前检查该标记。

以下是为 `ListEncoder` 和 `ListDecoder` 实现添加 `null` 支持的示例：

```kotlin
import kotlinx.serialization.*
import kotlinx.serialization.descriptors.*
import kotlinx.serialization.encoding.*
import kotlinx.serialization.modules.*

@ExperimentalSerializationApi
fun <T> encodeToList(serializer: SerializationStrategy<T>, value: T): List<Any> {
   val encoder = ListEncoder()
   encoder.encodeSerializableValue(serializer, value)
   return encoder.list
}

@ExperimentalSerializationApi
inline fun <reified T> encodeToList(value: T) = encodeToList(serializer(), value)

@ExperimentalSerializationApi
fun <T> decodeFromList(list: List<Any>, deserializer: DeserializationStrategy<T>): T {
   val decoder = ListDecoder(ArrayDeque(list))
   return decoder.decodeSerializableValue(deserializer)
}

@ExperimentalSerializationApi
inline fun <reified T> decodeFromList(list: List<Any>): T = decodeFromList(list, serializer())

@Serializable
data class Project(val name: String, val owner: User?, val votes: Int?)

@Serializable
data class User(val name: String)

//sampleStart
@ExperimentalSerializationApi
class ListEncoder : AbstractEncoder() {
    val list = mutableListOf<Any>()

    override val serializersModule: SerializersModule = EmptySerializersModule()

    override fun encodeValue(value: Any) {
        list.add(value)
    }

    override fun beginCollection(descriptor: SerialDescriptor, collectionSize: Int): CompositeEncoder {
        encodeInt(collectionSize)
        return this
    }

    // 将 null 值表示为 NULL
    override fun encodeNull() = encodeValue("NULL")

    // 使用 "!!" 将值标记为非 null
    override fun encodeNotNullMark() = encodeValue("!!")
}

@ExperimentalSerializationApi
class ListDecoder(val list: ArrayDeque<Any>, var elementsCount: Int = 0) : AbstractDecoder() {
    private var elementIndex = 0

    override val serializersModule: SerializersModule = EmptySerializersModule()

    override fun decodeValue(): Any = list.removeFirst()

    override fun decodeElementIndex(descriptor: SerialDescriptor): Int {
        if (elementIndex == elementsCount) return CompositeDecoder.DECODE_DONE
        return elementIndex++
    }

    override fun beginStructure(descriptor: SerialDescriptor): CompositeDecoder =
        ListDecoder(list, descriptor.elementsCount)

    override fun decodeSequentially(): Boolean = true

    override fun decodeCollectionSize(descriptor: SerialDescriptor): Int =
        decodeInt().also { elementsCount = it }

    // 检查下一个值是否为 "NULL"，以确定下一个可为 null 的值是否为 null
    override fun decodeNotNullMark(): Boolean = decodeString() != "NULL"
}

@OptIn(ExperimentalSerializationApi::class)
fun main() {
    val data = Project("kotlinx.serialization", User("kotlin"), null)
    val list = encodeToList(data)
    println(list)
    // [kotlinx.serialization, !!, kotlin, NULL]

    val obj = decodeFromList<Project>(list)
    println(obj)
    // Project(name=kotlinx.serialization, owner=User(name=kotlin), votes=null)
}
//sampleEnd
```
{kotlin-runnable="true"}

在此示例中，编码器在非 null 值之前写入 `!!`，并针对 `null` 值写入 `NULL`。
解码器检查这些标记以决定是解码值还是返回 `null`。

### 创建紧凑的二进制格式 {id="create-a-compact-binary-format"}

二进制格式通常因其紧凑的数据表示形式而被使用，非常适合需要尽量减少存储或传输数据量的场景。

自定义二进制格式允许你在底层控制数据的序列化与反序列化方式。
这为你提供了优化性能以及与其他系统保持兼容性的灵活性。

你可以通过实现 [`java.io.DataOutput`](https://docs.oracle.com/javase/8/docs/api/java/io/DataOutput.html) 和 [`java.io.DataInput`](https://docs.oracle.com/javase/8/docs/api/java/io/DataInput.html) 接口，使用 Kotlin 序列化创建自定义二进制格式。

以下示例展示了如何使用 `DataOutput` 和 `DataInput` 将 [`ListEncoder`](#create-a-basic-encoder) 和 [`ListDecoder`](#create-a-basic-decoder) 实现转变为紧凑的二进制格式：

1. 为每个基本类型重写编码函数，例如用于整数的 `encodeInt()` 或用于字符串的 `encodeString()`。
   这些针对特定类型的编码函数可以[避免装箱](numbers.md#boxing-and-caching-numbers-on-the-jvm)，并允许你为每个[基本类型](serialization-serialize-builtin-types.md#basic-types)定义二进制表示。
   在此示例中，值直接编码到 `DataOutput` 流中：

    ```kotlin
        override fun encodeBoolean(value: Boolean) = output.writeByte(if (value) 1 else 0)
        override fun encodeByte(value: Byte) = output.writeByte(value.toInt())
        override fun encodeShort(value: Short) = output.writeShort(value.toInt())
        override fun encodeInt(value: Int) = output.writeInt(value)
        override fun encodeLong(value: Long) = output.writeLong(value)
        override fun encodeFloat(value: Float) = output.writeFloat(value)
        override fun encodeDouble(value: Double) = output.writeDouble(value)
        override fun encodeChar(value: Char) = output.writeChar(value.code)
        override fun encodeString(value: String) = output.writeUTF(value)
        override fun encodeEnum(enumDescriptor: SerialDescriptor, index: Int) = output.writeInt(index)
    ```

2. 为每个基本类型实现解码函数，例如 `decodeInt()` 或 `decodeString()`。
   这使解码器能够直接从 `DataInput` 流中解码值并重建原始数据结构：

    ```kotlin
        override fun decodeBoolean(): Boolean = input.readByte().toInt() != 0
        override fun decodeByte(): Byte = input.readByte()
        override fun decodeShort(): Short = input.readShort()
        override fun decodeInt(): Int = input.readInt()
        override fun decodeLong(): Long = input.readLong()
        override fun decodeFloat(): Float = input.readFloat()
        override fun decodeDouble(): Double = input.readDouble()
        override fun decodeChar(): Char = input.readChar()
        override fun decodeString(): String = input.readUTF()
        override fun decodeEnum(enumDescriptor: SerialDescriptor): Int = input.readInt()
    ```

3. 使用这些类以二进制格式序列化和反序列化 Kotlin 对象：

    ```kotlin
    import kotlinx.serialization.*
    import kotlinx.serialization.Serializable
    import kotlinx.serialization.descriptors.*
    import kotlinx.serialization.encoding.*
    import kotlinx.serialization.modules.*
    import java.io.*

    @ExperimentalSerializationApi
    class DataOutputEncoder(val output: DataOutput) : AbstractEncoder() {
        override val serializersModule: SerializersModule = EmptySerializersModule()

        // 直接以二进制形式编码基本类型值
        override fun encodeBoolean(value: Boolean) = output.writeByte(if (value) 1 else 0)
        override fun encodeByte(value: Byte) = output.writeByte(value.toInt())
        override fun encodeShort(value: Short) = output.writeShort(value.toInt())
        override fun encodeInt(value: Int) = output.writeInt(value)
        override fun encodeLong(value: Long) = output.writeLong(value)
        override fun encodeFloat(value: Float) = output.writeFloat(value)
        override fun encodeDouble(value: Double) = output.writeDouble(value)
        override fun encodeChar(value: Char) = output.writeChar(value.code)
        override fun encodeString(value: String) = output.writeUTF(value)
        override fun encodeEnum(enumDescriptor: SerialDescriptor, index: Int) = output.writeInt(index)

        override fun beginCollection(descriptor: SerialDescriptor, collectionSize: Int): CompositeEncoder {
            encodeInt(collectionSize)
            return this
        }

        override fun encodeNull() = encodeBoolean(false)
        override fun encodeNotNullMark() = encodeBoolean(true)
    }
   
    @ExperimentalSerializationApi
    fun <T> encodeTo(output: DataOutput, serializer: SerializationStrategy<T>, value: T) {
        val encoder = DataOutputEncoder(output)
        encoder.encodeSerializableValue(serializer, value)
    }

    @ExperimentalSerializationApi
    inline fun <reified T> encodeTo(output: DataOutput, value: T) = encodeTo(output, serializer(), value)

    @ExperimentalSerializationApi
    class DataInputDecoder(val input: DataInput, var elementsCount: Int = 0) : AbstractDecoder() {
        private var elementIndex = 0
        override val serializersModule: SerializersModule = EmptySerializersModule()

        // 直接从二进制形式解码基本类型值
        override fun decodeBoolean(): Boolean = input.readByte().toInt() != 0
        override fun decodeByte(): Byte = input.readByte()
        override fun decodeShort(): Short = input.readShort()
        override fun decodeInt(): Int = input.readInt()
        override fun decodeLong(): Long = input.readLong()
        override fun decodeFloat(): Float = input.readFloat()
        override fun decodeDouble(): Double = input.readDouble()
        override fun decodeChar(): Char = input.readChar()
        override fun decodeString(): String = input.readUTF()
        override fun decodeEnum(enumDescriptor: SerialDescriptor): Int = input.readInt()

        override fun decodeElementIndex(descriptor: SerialDescriptor): Int {
            if (elementIndex == elementsCount) return CompositeDecoder.DECODE_DONE
            return elementIndex++
        }

        override fun beginStructure(descriptor: SerialDescriptor): CompositeDecoder =
            DataInputDecoder(input, descriptor.elementsCount)
 
        override fun decodeSequentially(): Boolean = true
  
        override fun decodeCollectionSize(descriptor: SerialDescriptor): Int =
            decodeInt().also { elementsCount = it }
 
        override fun decodeNotNullMark(): Boolean = decodeBoolean()
    }

    @ExperimentalSerializationApi
    fun <T> decodeFrom(input: DataInput, deserializer: DeserializationStrategy<T>): T {
        val decoder = DataInputDecoder(input)
        return decoder.decodeSerializableValue(deserializer)
    }

    @ExperimentalSerializationApi
    inline fun <reified T> decodeFrom(input: DataInput): T = decodeFrom(input, serializer())

    fun ByteArray.toAsciiHexString() = joinToString("") {
        if (it in 32..127) it.toInt().toChar().toString() else
            "{${it.toUByte().toString(16).padStart(2, '0').uppercase()}}"
    }
    //sampleStart
    @Serializable
    data class Project(val name: String, val language: String)

    @OptIn(ExperimentalSerializationApi::class)
    fun main() {
        val data = Project("kotlinx.serialization", "Kotlin")
        // 将对象编码为自定义二进制格式
        val output = ByteArrayOutputStream()
        encodeTo(DataOutputStream(output), data)

        val bytes = output.toByteArray()
        println(bytes.toAsciiHexString())
        // {00}{15}kotlinx.serialization{00}{06}Kotlin

        // 从自定义二进制格式解码对象
        val input = ByteArrayInputStream(bytes)
        val obj = decodeFrom<Project>(DataInputStream(input))
        println(obj)
        // Project(name=kotlinx.serialization, language=Kotlin)
    }
    //sampleEnd
    ```
    {kotlin-runnable="true"}

在此示例中，自定义格式仅以二进制形式编码序列化的值，而不包含键或属性名称，并将其解码回 `Project` 对象。
这使得在需要紧凑表示以及对二进制编码进行精确控制的场景下，可以更轻松地调整格式。

### 添加对特定格式类型的支持 {id="add-support-for-format-specific-types"}

自定义格式可以支持无法直接映射到标准基本类型编码函数的类型。

为了支持此类类型，请在编码器中重写 `encodeSerializableValue()` 函数，并在解码器中重写 `decodeSerializableValue()` 函数。
这使你能够为特定格式类型[定义自定义序列化逻辑](#create-custom-formats)，同时保持对非标准数据表示的高效处理和灵活性。

为了正确检测类型，请将 `serializer.descriptor` 属性与该类型的序列化器描述符进行比较，而不是检查值的运行时类型。
即使某个类型使用了自定义序列化器，或者与另一个类型共享相同的底层表示，这样做也可以保留声明的序列化形式。

让我们看一个示例，了解如何通过对 `ByteArray` 类型的专门支持来扩展[紧凑二进制格式示例](#create-a-compact-binary-format)：

1. 获取特定格式类型的序列化器，以便编码器可以通过描述符检测到它：

    ```kotlin
    private val byteArraySerializer = serializer<ByteArray>()
    ```   

    > 你也可以使用内置的 [`ByteArraySerializer()`](https://kotlinlang.org/api/kotlinx.serialization/kotlinx-serialization-core/kotlinx.serialization.builtins/-byte-array-serializer.html) 函数获得类似的结果。
    >
    {style="tip"}

2. 在编码器中重写 `encodeSerializableValue()` 函数，以便通过描述符检测 `ByteArray` 值并使用专门的编码路径。然后定义辅助函数来编码字节数组：

   ```kotlin
   override fun <T> encodeSerializableValue(serializer: SerializationStrategy<T>, value: T) {
       if (serializer.descriptor == byteArraySerializer.descriptor)
           encodeByteArray(value as ByteArray)
       else
           super.encodeSerializableValue(serializer, value)
   }

   // 使用大小的紧凑表示来编码 ByteArray
   private fun encodeByteArray(bytes: ByteArray) {
       encodeCompactSize(bytes.size)
       output.write(bytes)
   }

   // 用单个字节编码最大为 254 的大小
   private fun encodeCompactSize(value: Int) {
       if (value < 0xff) {
           output.writeByte(value)
       } else {
           output.writeByte(0xff)
           output.writeInt(value)
       }
   }
   ```

3. 在解码器中重写 [`decodeSerializableValue()`](https://kotlinlang.org/api/kotlinx.serialization/kotlinx-serialization-core/kotlinx.serialization.encoding/-decoder/decode-serializable-value.html) 函数，以便通过描述符检测 `ByteArray` 值并使用匹配的紧凑大小格式反序列化它们：

   ```kotlin
       @Suppress("UNCHECKED_CAST")
       override fun <T> decodeSerializableValue(deserializer: DeserializationStrategy<T>, previousValue: T?): T =
           if (deserializer.descriptor == byteArraySerializer.descriptor)
               decodeByteArray() as T
           else
               super.decodeSerializableValue(deserializer, previousValue)
   
       // 解码 ByteArray 数据
       private fun decodeByteArray(): ByteArray {
           val bytes = ByteArray(decodeCompactSize())
           input.readFully(bytes)
           return bytes
       }
   
       // 使用紧凑格式高效解码大小
       private fun decodeCompactSize(): Int {
           val byte = input.readByte().toInt() and 0xff
           if (byte < 0xff) return byte
           return input.readInt()
       }
   ```
   {collapsible="true" default-state="expanded" collapsed-title="override fun <T> decodeSerializableValue(deserializer: DeserializationStrategy<T>, previousValue: T?)"}

4. 序列化和反序列化带有嵌入 `ByteArray` 数据的对象：

   ```kotlin
   @Serializable
   data class Project(val name: String, val attachment: ByteArray)
   
   @OptIn(ExperimentalSerializationApi::class)
   fun main() {
       val data = Project("kotlinx.serialization", byteArrayOf(0x0A, 0x0B, 0x0C, 0x0D))
       val output = ByteArrayOutputStream()
       encodeTo(DataOutputStream(output), data)
       val bytes = output.toByteArray()
       println(bytes.toAsciiHexString())
       // {00}{15}kotlinx.serialization{04}{0A}{0B}{0C}{0D}

       val input = ByteArrayInputStream(bytes)
       val obj = decodeFrom<Project>(DataInputStream(input))
       println(obj)
       // Project(name=kotlinx.serialization, attachment=[10, 11, 12, 13])
   }
   ```
   {collapsible="true" default-state="expanded" collapsed-title="data class Project(val name: String, val attachment: ByteArray)"}

以下是完整的示例，展示了如何使用专门的编码和解码路径序列化和反序列化带有 `ByteArray` 属性的类：

```kotlin
import kotlinx.serialization.*
import kotlinx.serialization.Serializable
import kotlinx.serialization.descriptors.*
import kotlinx.serialization.modules.*
import kotlinx.serialization.encoding.*
import java.io.*

// 声明用于按描述符检测 ByteArray 的序列化器
private val byteArraySerializer = serializer<ByteArray>()

@ExperimentalSerializationApi
class DataOutputEncoder(val output: DataOutput) : AbstractEncoder() {
    override val serializersModule: SerializersModule = EmptySerializersModule()

    // 这些函数用于编码基本类型
    override fun encodeBoolean(value: Boolean) = output.writeByte(if (value) 1 else 0)
    override fun encodeByte(value: Byte) = output.writeByte(value.toInt())
    override fun encodeShort(value: Short) = output.writeShort(value.toInt())
    override fun encodeInt(value: Int) = output.writeInt(value)
    override fun encodeLong(value: Long) = output.writeLong(value)
    override fun encodeFloat(value: Float) = output.writeFloat(value)
    override fun encodeDouble(value: Double) = output.writeDouble(value)
    override fun encodeChar(value: Char) = output.writeChar(value.code)
    override fun encodeString(value: String) = output.writeUTF(value)
    override fun encodeEnum(enumDescriptor: SerialDescriptor, index: Int) = output.writeInt(index)

    override fun beginCollection(descriptor: SerialDescriptor, collectionSize: Int): CompositeEncoder {
        encodeInt(collectionSize)
        return this
    }

    override fun encodeNull() = encodeBoolean(false)
    override fun encodeNotNullMark() = encodeBoolean(true)

    // 通过描述符检测 ByteArray 并使用专门的编码路径
    override fun <T> encodeSerializableValue(serializer: SerializationStrategy<T>, value: T) {
        if (serializer.descriptor == byteArraySerializer.descriptor)
            encodeByteArray(value as ByteArray)
        else
            super.encodeSerializableValue(serializer, value)
    }

    // 使用紧凑大小表示编码 ByteArray
    private fun encodeByteArray(bytes: ByteArray) {
        encodeCompactSize(bytes.size)
        output.write(bytes)
    }

    // 用单个字节编码最大为 254 的大小
    private fun encodeCompactSize(value: Int) {
        if (value < 0xff) {
            output.writeByte(value)
        } else {
            output.writeByte(0xff)
            output.writeInt(value)
        }
    }
}

@ExperimentalSerializationApi
fun <T> encodeTo(output: DataOutput, serializer: SerializationStrategy<T>, value: T) {
    val encoder = DataOutputEncoder(output)
    encoder.encodeSerializableValue(serializer, value)
}

@ExperimentalSerializationApi
inline fun <reified T> encodeTo(output: DataOutput, value: T) = encodeTo(output, serializer(), value)

@ExperimentalSerializationApi
class DataInputDecoder(val input: DataInput, var elementsCount: Int = 0) : AbstractDecoder() {
    private var elementIndex = 0
    override val serializersModule: SerializersModule = EmptySerializersModule()

    // 这些函数用于解码基本类型
    override fun decodeBoolean(): Boolean = input.readByte().toInt() != 0
    override fun decodeByte(): Byte = input.readByte()
    override fun decodeShort(): Short = input.readShort()
    override fun decodeInt(): Int = input.readInt()
    override fun decodeLong(): Long = input.readLong()
    override fun decodeFloat(): Float = input.readFloat()
    override fun decodeDouble(): Double = input.readDouble()
    override fun decodeChar(): Char = input.readChar()
    override fun decodeString(): String = input.readUTF()
    override fun decodeEnum(enumDescriptor: SerialDescriptor): Int = input.readInt()

    override fun decodeElementIndex(descriptor: SerialDescriptor): Int {
        if (elementIndex == elementsCount) return CompositeDecoder.DECODE_DONE
        return elementIndex++
    }

    override fun beginStructure(descriptor: SerialDescriptor): CompositeDecoder =
        DataInputDecoder(input, descriptor.elementsCount)

    override fun decodeSequentially(): Boolean = true

    override fun decodeCollectionSize(descriptor: SerialDescriptor): Int =
        decodeInt().also { elementsCount = it }

    override fun decodeNotNullMark(): Boolean = decodeBoolean()

    // 通过描述符检测 ByteArray 并使用专门的解码路径
    @Suppress("UNCHECKED_CAST")
    override fun <T> decodeSerializableValue(deserializer: DeserializationStrategy<T>, previousValue: T?): T =
        if (deserializer.descriptor == byteArraySerializer.descriptor)
            decodeByteArray() as T
        else
            super.decodeSerializableValue(deserializer, previousValue)

    // 解码数组大小，然后解码字节数组内容
    private fun decodeByteArray(): ByteArray {
        val bytes = ByteArray(decodeCompactSize())
        input.readFully(bytes)
        return bytes
    }

    // 从单个字节解码最大为 254 的大小
    private fun decodeCompactSize(): Int {
        val byte = input.readByte().toInt() and 0xff
        if (byte < 0xff) return byte
        return input.readInt()
    }
}

@ExperimentalSerializationApi
fun <T> decodeFrom(input: DataInput, deserializer: DeserializationStrategy<T>): T {
    val decoder = DataInputDecoder(input)
    return decoder.decodeSerializableValue(deserializer)
}

@ExperimentalSerializationApi
inline fun <reified T> decodeFrom(input: DataInput): T = decodeFrom(input, serializer())

fun ByteArray.toAsciiHexString() = joinToString("") {
    if (it in 32..127) it.toInt().toChar().toString() else
        "{${it.toUByte().toString(16).padStart(2, '0').uppercase()}}"
}

@Serializable
data class Project(val name: String, val attachment: ByteArray)

//sampleStart
@OptIn(ExperimentalSerializationApi::class)
fun main() {
    val data = Project("kotlinx.serialization", byteArrayOf(0x0A, 0x0B, 0x0C, 0x0D))
    val output = ByteArrayOutputStream()
    encodeTo(DataOutputStream(output), data)
    val bytes = output.toByteArray()
    println(bytes.toAsciiHexString())
    // {00}{15}kotlinx.serialization{04}{0A}{0B}{0C}{0D}

    val input = ByteArrayInputStream(bytes)
    val obj = decodeFrom<Project>(DataInputStream(input))
    println(obj)
    // Project(name=kotlinx.serialization, attachment=[10, 11, 12, 13])
}
//sampleEnd
```
{kotlin-runnable="true"}

### 定义特定格式的 `@Serializable` 注解 {id="define-a-format-specific-serializable-annotation"}

你可以使用 [`@MetaSerializable`](https://kotlinlang.org/api/kotlinx.serialization/kotlinx-serialization-core/kotlinx.serialization/-meta-serializable/) 注解来定义特定格式的 `@Serializable` 注解。
将特定格式的注解添加到类上以替代 `@Serializable`，可使该类可序列化，并将注解数据包含在生成的序列描述符中。

以下是定义 `@BinarySerializable` 注解的示例：

```kotlin
import kotlinx.serialization.ExperimentalSerializationApi
import kotlinx.serialization.MetaSerializable

//sampleStart
@OptIn(ExperimentalSerializationApi::class)
// 定义使被注解类可序列化的特定格式注解
@MetaSerializable
@Target(AnnotationTarget.CLASS)
annotation class BinarySerializable(val typeId: Int)

@BinarySerializable(typeId = 1)
data class Project(val name: String, val language: String)

@OptIn(ExperimentalSerializationApi::class)
fun main() {
    // 序列化插件为 Project 生成序列化器的方式
    // 与使用 @Serializable 注解的类相同
    val descriptor = Project.serializer().descriptor

    // 从序列描述符的注解中检索类标识符
    val typeId = descriptor.annotations
        .filterIsInstance<BinarySerializable>()
        .first()
        .typeId

    println(typeId)
    // 1
}
//sampleEnd
```
{kotlin-runnable="true"}

## 后续步骤 {id="what-s-next"}

* 了解如何以 [CBOR 格式](serialization-cbor.md)序列化数据。
* 探索以 [ProtoBuf 格式](serialization-protobuf.md)进行的 Protocol Buffers 序列化。