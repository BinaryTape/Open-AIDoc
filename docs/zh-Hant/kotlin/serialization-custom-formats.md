[//]: # (title: 自訂序列化格式)
<primary-label ref="experimental-general"/>

[//]: # (description: 了解如何為 Kotlin 序列化建立自訂格式，包括編碼器、解碼器、循序解碼以及對特定格式型別的支援。)

JSON 是目前 Kotlin 序列化中唯一的穩定格式。
Kotlin 序列化也為 [CBOR](serialization-cbor.md) 和 [ProtoBuf](serialization-protobuf.md) 二進位格式，以及用於將類別表示為以 `String` 為鍵的扁平 Map 的 [`Properties`](https://kotlinlang.org/api/kotlinx.serialization/kotlinx-serialization-properties/kotlinx.serialization.properties/-properties/) 格式提供了實驗性支援。

這些實驗性格式實作已達到生產等級品質，但未來的版本可能會變更其預設的序列化行為。
它們也可能在如何表示 Kotlin 資料方面具有特定格式的限制或約束。

如果這些格式都不符合你的使用案例，你可以建立自訂格式來控制值與結構的編碼和解碼方式。

## 建立自訂格式 {id="create-custom-formats"}

若要為 Kotlin 序列化建立自訂格式，
請實作 [`Encoder`](https://kotlinlang.org/api/kotlinx.serialization/kotlinx-serialization-core/kotlinx.serialization.encoding/-encoder/) 和 [`Decoder`](https://kotlinlang.org/api/kotlinx.serialization/kotlinx-serialization-core/kotlinx.serialization.encoding/-decoder/) 介面。
序列化器會使用這些實作來對值進行編碼與解碼。

當編碼或解碼結構化值（例如類別和集合）時，序列化器會呼叫這些實作上的 [`beginStructure()`](https://kotlinlang.org/api/kotlinx.serialization/kotlinx-serialization-core/kotlinx.serialization.encoding/-encoder/begin-structure.html) 函式。
此函式會傳回一個 [`CompositeEncoder`](https://kotlinlang.org/api/kotlinx.serialization/kotlinx-serialization-core/kotlinx.serialization.encoding/-composite-encoder/) 或 [`CompositeDecoder`](https://kotlinlang.org/api/kotlinx.serialization/kotlinx-serialization-core/kotlinx.serialization.encoding/-composite-decoder/) 介面，其中包含用於編碼或解碼每個屬性或元素的函式。

`Encoder` 和 `Decoder` 介面包含廣泛的 API，但你可以使用 [`AbstractEncoder`](https://kotlinlang.org/api/kotlinx.serialization/kotlinx-serialization-core/kotlinx.serialization.encoding/-abstract-encoder/) 和 [`AbstractDecoder`](https://kotlinlang.org/api/kotlinx.serialization/kotlinx-serialization-core/kotlinx.serialization.encoding/-abstract-decoder/) 類別來簡化建立自訂編碼器與解碼器實作的過程。
這些類別實作了 `Encoder`、`Decoder`、`CompositeEncoder` 和 `CompositeDecoder` 介面，因此你可以使用同一個類別來處理簡單格式中的基本型別值與結構化值。

`AbstractEncoder` 類別為大多數編碼函式提供了預設實作，例如 [`encodeString()`](https://kotlinlang.org/api/kotlinx.serialization/kotlinx-serialization-core/kotlinx.serialization.encoding/-abstract-encoder/encode-string.html)，
這些函式會委託給 [`encodeValue(value: Any)`](https://kotlinlang.org/api/kotlinx.serialization/kotlinx-serialization-core/kotlinx.serialization.encoding/-abstract-encoder/encode-value.html) 函式。
這意味著只要覆寫 `encodeValue()` 函式，你就可以輕鬆建立一個基本且功能齊全的自訂格式。

以下章節將使用這些 API 建立一個自訂格式：先將值編碼至列表中、從該列表解碼值，接著再加上循序解碼、集合支援以及 null 支援。

### 建立基本編碼器 {id="create-a-basic-encoder"}

若要建置自訂編碼器，你可以繼承 `AbstractEncoder` 類別。
這可讓你覆寫預設實作，而無需從頭開始實作 `Encoder` 和 `CompositeEncoder` 介面。

建立基本編碼器的步驟如下：

1. 建立一個繼承 `AbstractEncoder` 的類別，以定義自訂序列化邏輯：

    ```kotlin
    @ExperimentalSerializationApi
    class ListEncoder : AbstractEncoder() {
        val list = mutableListOf<Any>()
    
        override val serializersModule: SerializersModule = EmptySerializersModule()
    }
    ```

2. 在 `ListEncoder` 類別中，覆寫 `encodeValue()` 以定義編碼器處理每個值的方式。

    ```kotlin
        override fun encodeValue(value: Any) {
            list.add(value)
        }
    ```

3. 建立一個使用該編碼器來序列化值的函式：

    ```kotlin
    @ExperimentalSerializationApi
    fun <T> encodeToList(serializer: SerializationStrategy<T>, value: T): List<Any> {
        val encoder = ListEncoder()
        encoder.encodeSerializableValue(serializer, value)
        return encoder.list
    }
    ```

4. 新增一個帶有具體化型別參數（reified type parameter）並使用 `serializer()` 的 inline 多載，讓呼叫端無需明確傳遞序列化器：

    ```kotlin
    @ExperimentalSerializationApi
    inline fun <reified T> encodeToList(value: T) = encodeToList(serializer(), value)
    ```

> 由於編碼器通常會被應用程式的其他部分使用，
> 請傳播 `@ExperimentalSerializationApi` 註解，而不是僅在個別函式內部啟用選擇性加入（opt-in）。
>
{style="note"}

以下是一個極簡範例，依序列化順序將物件圖中的基本型別值編碼為扁平列表：

```kotlin
import kotlinx.serialization.*
import kotlinx.serialization.descriptors.*
import kotlinx.serialization.encoding.*
import kotlinx.serialization.modules.*

// 建立自訂編碼器，將序列化後的值存儲在列表中
@ExperimentalSerializationApi
class ListEncoder : AbstractEncoder() {
    val list = mutableListOf<Any>()

    override val serializersModule: SerializersModule = EmptySerializersModule()

    // 存儲每個編碼的值
    override fun encodeValue(value: Any) {
        list.add(value)
    }
}

// 對值進行編碼並將收集到的值作為列表返回
@ExperimentalSerializationApi
fun <T> encodeToList(serializer: SerializationStrategy<T>, value: T): List<Any> {
    val encoder = ListEncoder()
    encoder.encodeSerializableValue(serializer, value)
    return encoder.list
}

// 為了方便起見，提供型別安全的 inline 多載
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

輸出結果顯示，編碼器按照序列化順序將所有序列化的值收集到一個扁平列表中。
當你需要統一處理這些值時（例如計算雜湊值或摘要），這種做法非常有用。

### 建立基本解碼器 {id="create-a-basic-decoder"}

若要建置自訂解碼器，你可以繼承 `AbstractDecoder` 類別。
這可讓你覆寫預設實作，而無需從頭開始實作 `Decoder` 和 `CompositeDecoder` 介面。

建立基本解碼器的步驟如下：

1. 建立一個繼承 `AbstractDecoder` 的類別，以定義自訂反序列化邏輯：

    ```kotlin
    @ExperimentalSerializationApi
    class ListDecoder(val list: ArrayDeque<Any>) : AbstractDecoder() {
        private var elementIndex = 0
    
        override val serializersModule: SerializersModule = EmptySerializersModule()
    }
    ```

2. 在 `ListDecoder` 類別中，覆寫 [`decodeValue()`](https://kotlinlang.org/api/kotlinx.serialization/kotlinx-serialization-core/kotlinx.serialization.encoding/-abstract-decoder/decode-value.html) 函式以定義解碼器反序列化值的方式：

    ```kotlin
        override fun decodeValue(): Any = list.removeFirst()
    ```

3. 覆寫 [`decodeElementIndex()`](https://kotlinlang.org/api/kotlinx.serialization/kotlinx-serialization-core/kotlinx.serialization.encoding/-composite-decoder/decode-element-index.html) 函式以回報接下來要解碼的元素，並在結構完成時傳回 `DECODE_DONE`：

    ```kotlin
        override fun decodeElementIndex(descriptor: SerialDescriptor): Int {
            if (elementIndex == descriptor.elementsCount) return CompositeDecoder.DECODE_DONE
            return elementIndex++
        }
    ```

   此格式依照序列化順序反序列化值，因此你可以使用簡單的 `elementIndex` 計數器來追蹤進度。
   較複雜的格式通常需要額外的邏輯來尋找下一個要解碼的元素。

   > 若要了解自訂序列化器如何使用來自 `decodeElementIndex()` 函式的元素索引，請參閱[建立自訂複合序列化器](serialization-create-and-use-serializers.md#create-a-custom-composite-serializer)。
   >
   {style="tip"}

4. 覆寫 [`beginStructure()`](https://kotlinlang.org/api/kotlinx.serialization/kotlinx-serialization-core/kotlinx.serialization.encoding/-abstract-decoder/begin-structure.html) 函式以針對每個巢狀結構建立新的解碼器，以便每個遞迴解碼的結構保持自己的 `elementIndex` 狀態：

    ```kotlin
        override fun beginStructure(descriptor: SerialDescriptor): CompositeDecoder =
            ListDecoder(list)
    ```

5. 建立一個使用該解碼器來反序列化值的函式：

    ```kotlin
    @ExperimentalSerializationApi
    fun <T> decodeFromList(list: List<Any>, deserializer: DeserializationStrategy<T>): T {
        val decoder = ListDecoder(ArrayDeque(list))
        return decoder.decodeSerializableValue(deserializer)
    }
    ```

6. 新增 inline 多載以讓反序列化呼叫更加簡便：

    ```kotlin
    @ExperimentalSerializationApi
    inline fun <reified T> decodeFromList(list: List<Any>): T = decodeFromList(list, serializer())
    ```

以下是將基本型別值列表解碼回物件的完整範例：

```kotlin
import kotlinx.serialization.*
import kotlinx.serialization.descriptors.*
import kotlinx.serialization.encoding.*
import kotlinx.serialization.modules.*

// 建立自訂編碼器，將序列化後的值存儲在列表中
@ExperimentalSerializationApi
class ListEncoder : AbstractEncoder() {
    val list = mutableListOf<Any>()

    override val serializersModule: SerializersModule = EmptySerializersModule()

    // 存儲每個編碼的值
    override fun encodeValue(value: Any) {
       list.add(value)
    }
}

// 對值進行編碼並將收集到的值作為列表返回
@ExperimentalSerializationApi
fun <T> encodeToList(serializer: SerializationStrategy<T>, value: T): List<Any> {
    val encoder = ListEncoder()
    encoder.encodeSerializableValue(serializer, value)
    return encoder.list
}

// 為了方便起見，提供 encodeToList 的型別安全 inline 版本
@ExperimentalSerializationApi
inline fun <reified T> encodeToList(value: T) = encodeToList(serializer(), value)

//sampleStart
// 建立自訂解碼器，從列表中解碼序列化的值
@ExperimentalSerializationApi
class ListDecoder(val list: ArrayDeque<Any>) : AbstractDecoder() {
    private var elementIndex = 0

    override val serializersModule: SerializersModule = EmptySerializersModule()

    // 從列表中返回下一個值
    override fun decodeValue(): Any = list.removeFirst()
    
    // 回報下一個元素索引或指示解碼已完成
    override fun decodeElementIndex(descriptor: SerialDescriptor): Int {
        if (elementIndex == descriptor.elementsCount) return CompositeDecoder.DECODE_DONE
        return elementIndex++
    }

    // 為每個巢狀結構建立新的解碼器
    override fun beginStructure(descriptor: SerialDescriptor): CompositeDecoder =
        ListDecoder(list)
}

// 使用自訂解碼器從列表反序列化物件
@ExperimentalSerializationApi
fun <T> decodeFromList(list: List<Any>, deserializer: DeserializationStrategy<T>): T {
    val decoder = ListDecoder(ArrayDeque(list))
    return decoder.decodeSerializableValue(deserializer)
}

// 為了方便起見，提供 decodeFromList 的型別安全 inline 版本
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

輸出結果顯示，解碼器按照序列化順序讀回列表並重構原始物件。

`decodeElementIndex()` 函式會回報接下來要讀取哪個屬性，而 `beginStructure()` 函式則為巢狀物件建立新的解碼器狀態。

### 使用循序解碼進行最佳化 {id="optimize-with-sequential-decoding"}

如果你的格式一律依照宣告順序儲存值，且不支援[跳過選用元素](serialization-create-and-use-serializers.md#encode-default-values-in-custom-serializers)，你可以使用 [`decodeSequentially()`](https://kotlinlang.org/api/kotlinx.serialization/kotlinx-serialization-core/kotlinx.serialization.encoding/-composite-decoder/decode-sequentially.html) 函式來最佳化解碼流程。

當此函式傳回 `true` 時，支援循序解碼的序列化器可以依序讀取值，而無需重複請求下一個元素索引。
在反序列化以循序格式儲存的資料時，這可以提升效能。由 `kotlinx.serialization` 外掛程式產生的序列化器會採用此最佳化機制。

從 `decodeSequentially()` 函式傳回 `true` 並不保證使用你解碼器的序列化器一定會採用循序解碼。
因此，請確保你的解碼器也透過 `decodeElementIndex()` 函式支援常規解碼。

> 若要了解序列化器在反序列化期間如何使用 `decodeSequentially()` 函式，請參閱[使用循序解碼最佳化反序列化](serialization-create-and-use-serializers.md#optimize-deserialization-with-sequential-decoding)。
>
{style="tip"}

以下說明如何將此最佳化套用至自訂的 `ListDecoder`：

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

    // 當序列化器不使用循序解碼時，提供常規解碼支援
    override fun decodeElementIndex(descriptor: SerialDescriptor): Int {
        if (elementIndex == descriptor.elementsCount) return CompositeDecoder.DECODE_DONE
        return elementIndex++
    }

    override fun beginStructure(descriptor: SerialDescriptor): CompositeDecoder =
        ListDecoder(list)

    // 為支援的序列化器啟用循序解碼
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

在此範例中，`ListDecoder` 覆寫了 `decodeSequentially()` 函式以傳回 `true`。
這讓受支援的序列化器可以直接按照宣告順序讀取值，而無需逐一查詢每個元素索引。

### 新增集合支援 {id="add-collection-support"}

基本的自訂格式可以逐一編碼集合元素，但解碼時也需要知道集合中包含多少個元素。

若要在自訂格式中支援集合，請將集合大小與其元素一起編碼，以便解碼器知道集合在哪裡結束：

1. 在編碼器中實作 [`beginCollection()`](https://kotlinlang.org/api/kotlinx.serialization/kotlinx-serialization-core/kotlinx.serialization.encoding/-encoder/begin-collection.html) 函式以處理集合大小。
2. 如果編碼器不需要額外的集合特定狀態，請從 `beginCollection()` 函式傳回編碼器執行個體。
3. 在解碼器中實作 [`decodeCollectionSize()`](https://kotlinlang.org/api/kotlinx.serialization/kotlinx-serialization-core/kotlinx.serialization.encoding/-composite-decoder/decode-collection-size.html) 函式，以在反序列化期間解碼並儲存集合大小。
4. 如果格式預先儲存了集合大小且值是依序讀取的，請從 `decodeSequentially()` 函式傳回 `true`。

以下是為 `ListEncoder` 新增集合支援的完整範例：

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

    // 在集合元素之前儲存集合大小
    override fun beginCollection(descriptor: SerialDescriptor, collectionSize: Int): CompositeEncoder {
        encodeInt(collectionSize)
        // 由於不需要額外的集合特定狀態，因此返回相同的編碼器
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

    // 指示值是按順序解碼的，因為集合大小已預先得知
    override fun decodeSequentially(): Boolean = true

    // 在讀取集合元素之前解碼並儲存集合大小
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

在此範例中，編碼後的列表會在集合元素之前包含集合大小，因此解碼器可以正確解碼集合。

### 新增 null 支援 {id="add-null-support"}

若要在自訂格式中支援 null 值，你需要一種方法來區分 `null` 與常規值。

這通常涉及在每個可為 null 的值之前加上「null 指示器」，以區分 `null` 值與實際資料。

若要在自訂格式中新增對 null 值的支援：

1. 在編碼器中覆寫 [`encodeNull()`](https://kotlinlang.org/api/kotlinx.serialization/kotlinx-serialization-core/kotlinx.serialization.encoding/-abstract-encoder/encode-null.html)，以指定如何標記 `null` 值。
2. 在編碼器中覆寫 [`encodeNotNullMark()`](https://kotlinlang.org/api/kotlinx.serialization/kotlinx-serialization-core/kotlinx.serialization.encoding/-encoder/encode-not-null-mark.html) 以標記非 null 值。
3. 在解碼器中覆寫 [`decodeNotNullMark()`](https://kotlinlang.org/api/kotlinx.serialization/kotlinx-serialization-core/kotlinx.serialization.encoding/-decoder/decode-not-null-mark.html)，以在解碼值之前檢查該標記。

以下是為 `ListEncoder` 和 `ListDecoder` 實作新增 `null` 支援的範例：

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

    // 將 null 值表示為 NULL
    override fun encodeNull() = encodeValue("NULL")

    // 使用 "!!" 將值標記為非 null
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

    // 檢查下一個值是否為 "NULL"，以確定下一個可為 null 的值是否為 null
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

在此範例中，編碼器在非 null 值之前寫入 `!!`，並為 `null` 值寫入 `NULL`。
解碼器會檢查這些標記以決定解碼該值還是傳回 `null`。

### 建立緊湊二進位格式 {id="create-a-compact-binary-format"}

二進位格式常因其緊湊的資料表示方式而被採用，非常適合需要盡量減少儲存或傳輸資料量的場景。

自訂二進位格式可讓你在底層控制資料序列化與反序列化的方式。
這為你提供了最佳化效能並保持與其他系統相容性的彈性。

你可以透過實作 [`java.io.DataOutput`](https://docs.oracle.com/javase/8/docs/api/java/io/DataOutput.html) 和 [`java.io.DataInput`](https://docs.oracle.com/javase/8/docs/api/java/io/DataInput.html) 介面，使用 Kotlin 序列化建立自訂二進位格式。

以下範例展示如何使用 `DataOutput` 和 `DataInput` 將 [`ListEncoder`](#create-a-basic-encoder) 與 [`ListDecoder`](#create-a-basic-decoder) 實作轉換為緊湊二進位格式：

1. 覆寫每個基本型別的編碼函式，例如針對整數的 `encodeInt()` 或針對字串的 `encodeString()`。
   這些針對特定型別的編碼函式可以[避免裝箱（boxing）](numbers.md#boxing-and-caching-numbers-on-the-jvm)，並允許你為每個[基本型別](serialization-serialize-builtin-types.md#basic-types)定義二進位表示方式。
   在此範例中，值直接編碼到 `DataOutput` 串流中：

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

2. 實作每個基本型別的解碼函式，例如 `decodeInt()` 或 `decodeString()`。
   這可讓解碼器直接從 `DataInput` 串流解碼值，並重構原始資料結構：

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

3. 使用這些類別以二進位格式序列化和反序列化 Kotlin 物件：

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

        // 直接以二進位形式編碼基本型別值
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

        // 直接從二進位形式解碼基本型別值
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
        // 將物件編碼為自訂二進位格式
        val output = ByteArrayOutputStream()
        encodeTo(DataOutputStream(output), data)

        val bytes = output.toByteArray()
        println(bytes.toAsciiHexString())
        // {00}{15}kotlinx.serialization{00}{06}Kotlin

        // 從自訂二進位格式解碼物件
        val input = ByteArrayInputStream(bytes)
        val obj = decodeFrom<Project>(DataInputStream(input))
        println(obj)
        // Project(name=kotlinx.serialization, language=Kotlin)
    }
    //sampleEnd
    ```
    {kotlin-runnable="true"}

在此範例中，自訂格式僅以二進位形式編碼序列化的值（不包含鍵或屬性名稱），並將其解碼回 `Project` 物件。
這讓格式更容易調整以適應需要緊湊表示以及精確控制二進位編碼的情境。

### 新增對特定格式型別的支援 {id="add-support-for-format-specific-types"}

自訂格式可以支援無法直接對應到標準基本型別編碼函式的型別。

若要支援此類型別，請覆寫編碼器中的 `encodeSerializableValue()` 函式與解碼器中的 `decodeSerializableValue()` 函式。
這可讓你為特定格式的型別[定義自訂序列化邏輯](#create-custom-formats)，
同時針對非標準資料表示方式保持高效率的處理和靈活性。

為了正確偵測型別，請將 `serializer.descriptor` 屬性與該型別序列化器的描述項（descriptor）進行比較，而不是檢查值的執行階段型別。
即使某個型別使用了自訂序列化器或與另一個型別共享相同的底層表示方式，這種做法也能保留宣告的序列化形式。

讓我們看一個範例，說明如何針對 `ByteArray` 型別的特殊支援來擴充[緊湊二進位格式範例](#create-a-compact-binary-format)：

1. 取得特定格式型別的序列化器，讓編碼器可以透過描述項偵測它：

    ```kotlin
    private val byteArraySerializer = serializer<ByteArray>()
    ```   

    > 你也可以使用內建的 [`ByteArraySerializer()`](https://kotlinlang.org/api/kotlinx.serialization/kotlinx-serialization-core/kotlinx.serialization.builtins/-byte-array-serializer.html) 函式來達到類似效果。
    >
    {style="tip"}

2. 覆寫編碼器中的 `encodeSerializableValue()` 函式，以透過描述項偵測 `ByteArray` 值並使用專門的編碼路徑。
   接著定義幫助函式來編碼位元組陣列：

   ```kotlin
   override fun <T> encodeSerializableValue(serializer: SerializationStrategy<T>, value: T) {
       if (serializer.descriptor == byteArraySerializer.descriptor)
           encodeByteArray(value as ByteArray)
       else
           super.encodeSerializableValue(serializer, value)
   }

   // 使用緊湊大小表示法編碼 ByteArray
   private fun encodeByteArray(bytes: ByteArray) {
       encodeCompactSize(bytes.size)
       output.write(bytes)
   }

   // 將最多 254 的大小編碼為單一位元組
   private fun encodeCompactSize(value: Int) {
       if (value < 0xff) {
           output.writeByte(value)
       } else {
           output.writeByte(0xff)
           output.writeInt(value)
       }
   }
   ```

3. 覆寫解碼器中的 [`decodeSerializableValue()`](https://kotlinlang.org/api/kotlinx.serialization/kotlinx-serialization-core/kotlinx.serialization.encoding/-decoder/decode-serializable-value.html) 函式，以透過描述項偵測 `ByteArray` 值，並使用相符的緊湊大小格式對其進行反序列化：

   ```kotlin
       @Suppress("UNCHECKED_CAST")
       override fun <T> decodeSerializableValue(deserializer: DeserializationStrategy<T>, previousValue: T?): T =
           if (deserializer.descriptor == byteArraySerializer.descriptor)
               decodeByteArray() as T
           else
               super.decodeSerializableValue(deserializer, previousValue)
   
       // 解碼 ByteArray 資料
       private fun decodeByteArray(): ByteArray {
           val bytes = ByteArray(decodeCompactSize())
           input.readFully(bytes)
           return bytes
       }
   
       // 使用緊湊格式高效率解碼大小
       private fun decodeCompactSize(): Int {
           val byte = input.readByte().toInt() and 0xff
           if (byte < 0xff) return byte
           return input.readInt()
       }
   ```
   {collapsible="true" default-state="expanded" collapsed-title="override fun <T> decodeSerializableValue(deserializer: DeserializationStrategy<T>, previousValue: T?)"}

4. 序列化和反序列化包含嵌入 `ByteArray` 資料的物件：

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

以下是使用專門編碼與解碼路徑序列化和反序列化包含 `ByteArray` 屬性之類別的完整範例：

```kotlin
import kotlinx.serialization.*
import kotlinx.serialization.Serializable
import kotlinx.serialization.descriptors.*
import kotlinx.serialization.modules.*
import kotlinx.serialization.encoding.*
import java.io.*

// 宣告用於透過描述項偵測 ByteArray 的序列化器
private val byteArraySerializer = serializer<ByteArray>()

@ExperimentalSerializationApi
class DataOutputEncoder(val output: DataOutput) : AbstractEncoder() {
    override val serializersModule: SerializersModule = EmptySerializersModule()

    // 這些函式用於編碼基本型別
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

    // 透過描述項偵測 ByteArray 並使用專門的編碼路徑
    override fun <T> encodeSerializableValue(serializer: SerializationStrategy<T>, value: T) {
        if (serializer.descriptor == byteArraySerializer.descriptor)
            encodeByteArray(value as ByteArray)
        else
            super.encodeSerializableValue(serializer, value)
    }

    // 以緊湊大小表示法編碼 ByteArray
    private fun encodeByteArray(bytes: ByteArray) {
        encodeCompactSize(bytes.size)
        output.write(bytes)
    }

    // 將最多 254 的大小編碼為單一位元組
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

    // 這些函式用於解碼基本型別
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

    // 透過描述項偵測 ByteArray 並使用專門的解碼路徑
    @Suppress("UNCHECKED_CAST")
    override fun <T> decodeSerializableValue(deserializer: DeserializationStrategy<T>, previousValue: T?): T =
        if (deserializer.descriptor == byteArraySerializer.descriptor)
            decodeByteArray() as T
        else
            super.decodeSerializableValue(deserializer, previousValue)

    // 解碼陣列大小，然後解碼位元組陣列內容
    private fun decodeByteArray(): ByteArray {
        val bytes = ByteArray(decodeCompactSize())
        input.readFully(bytes)
        return bytes
    }

    // 從單一位元組解碼最多 254 的大小
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

### 定義特定格式的 `@Serializable` 註解 {id="define-a-format-specific-serializable-annotation"}

你可以使用 [`@MetaSerializable`](https://kotlinlang.org/api/kotlinx.serialization/kotlinx-serialization-core/kotlinx.serialization/-meta-serializable/) 註解來定義特定格式的 `@Serializable` 註解。
在類別上新增特定格式的註解而不是 `@Serializable`，可使該類別可序列化，並將註解資料包含在產生的序列描述項中。

以下是定義 `@BinarySerializable` 註解的範例：

```kotlin
import kotlinx.serialization.ExperimentalSerializationApi
import kotlinx.serialization.MetaSerializable

//sampleStart
@OptIn(ExperimentalSerializationApi::class)
// 定義特定格式的註解，使標註的類別可序列化
@MetaSerializable
@Target(AnnotationTarget.CLASS)
annotation class BinarySerializable(val typeId: Int)

@BinarySerializable(typeId = 1)
data class Project(val name: String, val language: String)

@OptIn(ExperimentalSerializationApi::class)
fun main() {
    // 序列化外掛程式為 Project 產生序列化器的方式
    // 與使用 @Serializable 標註的類別相同
    val descriptor = Project.serializer().descriptor

    // 從序列描述項中的註解擷取類別識別碼
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

## 下一步 {id="what-s-next"}

* 了解如何以 [CBOR 格式](serialization-cbor.md)序列化資料。
* 探索以 [ProtoBuf 格式](serialization-protobuf.md)進行 Protocol Buffers 序列化。