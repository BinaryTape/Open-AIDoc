[//]: # (title: 커스텀 직렬화 포맷)
<primary-label ref="experimental-general"/>

[//]: # (description: 인코더, 디코더, 순차적 디코딩 및 포맷 전용 타입 지원을 포함하여 Kotlin 직렬화를 위한 커스텀 포맷을 생성하는 방법을 알아봅니다.)

JSON은 현재 Kotlin 직렬화(Kotlin serialization)에서 유일하게 안정적인(stable) 포맷입니다.
Kotlin 직렬화는 [CBOR](serialization-cbor.md) 및 [ProtoBuf](serialization-protobuf.md) 바이너리 포맷뿐만 아니라, 클래스를 `String` 키를 갖는 플랫 맵으로 표현하기 위한 [`Properties`](https://kotlinlang.org/api/kotlinx.serialization/kotlinx-serialization-properties/kotlinx.serialization.properties/-properties/) 포맷에 대한 실험적(experimental) 지원도 제공합니다.

이러한 실험적 포맷 구현체들은 프로덕션 환경에서 사용할 수 있는 품질이지만, 향후 릴리스에서 기본 직렬화 동작이 변경될 수 있습니다.
또한 Kotlin 데이터를 표현하는 방식에 포맷별 한계나 제약이 있을 수 있습니다.

이러한 포맷 중 사용 사례에 적합한 것이 없다면, 커스텀 포맷을 생성하여 값과 구조가 인코딩 및 디코딩되는 방식을 직접 제어할 수 있습니다.

## 커스텀 포맷 생성 {id="create-custom-formats"}

Kotlin 직렬화를 위한 커스텀 포맷을 생성하려면 [`Encoder`](https://kotlinlang.org/api/kotlinx.serialization/kotlinx-serialization-core/kotlinx.serialization.encoding/-encoder/) 및 [`Decoder`](https://kotlinlang.org/api/kotlinx.serialization/kotlinx-serialization-core/kotlinx.serialization.encoding/-decoder/) 인터페이스를 구현합니다.
시리얼라이저(Serializer)는 이러한 구현체를 사용하여 값을 인코딩하고 디코딩합니다.

시리얼라이저는 클래스 및 컬렉션과 같은 구조화된 값을 인코딩하거나 디코딩할 때 이러한 구현체의 [`beginStructure()`](https://kotlinlang.org/api/kotlinx.serialization/kotlinx-serialization-core/kotlinx.serialization.encoding/-encoder/begin-structure.html) 함수를 호출합니다.
이 함수는 각 프로퍼티나 요소를 인코딩 또는 디코딩하는 함수들이 포함된 [`CompositeEncoder`](https://kotlinlang.org/api/kotlinx.serialization/kotlinx-serialization-core/kotlinx.serialization.encoding/-composite-encoder/) 또는 [`CompositeDecoder`](https://kotlinlang.org/api/kotlinx.serialization/kotlinx-serialization-core/kotlinx.serialization.encoding/-composite-decoder/) 인터페이스를 반환합니다.

`Encoder`와 `Decoder` 인터페이스는 매우 방대하지만, [`AbstractEncoder`](https://kotlinlang.org/api/kotlinx.serialization/kotlinx-serialization-core/kotlinx.serialization.encoding/-abstract-encoder/) 및 [`AbstractDecoder`](https://kotlinlang.org/api/kotlinx.serialization/kotlinx-serialization-core/kotlinx.serialization.encoding/-abstract-decoder/) 클래스를 사용하여 커스텀 인코더 및 디코더 구현 과정을 단순화할 수 있습니다.
이 클래스들은 `Encoder`, `Decoder`, `CompositeEncoder`, `CompositeDecoder` 인터페이스를 구현하므로, 간단한 포맷에서는 동일한 클래스를 사용하여 프리미티브(primitive) 값과 구조화된 값을 모두 처리할 수 있습니다.

`AbstractEncoder` 클래스는 [`encodeString()`](https://kotlinlang.org/api/kotlinx.serialization/kotlinx-serialization-core/kotlinx.serialization.encoding/-abstract-encoder/encode-string.html)과 같이 대부분의 인코드 함수에 대한 기본 구현을 제공하며,
이 함수들은 내부적으로 [`encodeValue(value: Any)`](https://kotlinlang.org/api/kotlinx.serialization/kotlinx-serialization-core/kotlinx.serialization.encoding/-abstract-encoder/encode-value.html) 함수로 위임됩니다.
즉, `encodeValue()` 함수를 오버라이드하기만 하면 최소한의 작업으로 기본적인 동작이 가능한 커스텀 포맷을 만들 수 있습니다.

다음 섹션에서는 이러한 API를 사용하여 값을 리스트로 인코딩하고, 해당 리스트에서 값을 디코딩한 다음 순차적 디코딩, 컬렉션 지원 및 null 지원을 추가하는 커스텀 포맷을 만듭니다.

### 기본 인코더 생성 {id="create-a-basic-encoder"}

커스텀 인코더를 빌드하려면 `AbstractEncoder` 클래스를 상속할 수 있습니다.
이렇게 하면 `Encoder` 및 `CompositeEncoder` 인터페이스를 처음부터 구현하는 대신 기본 구현을 오버라이드할 수 있습니다.

기본 인코더를 생성하는 방법은 다음과 같습니다:

1. 커스텀 직렬화 로직을 정의하기 위해 `AbstractEncoder`를 상속하는 클래스를 생성합니다:

    ```kotlin
    @ExperimentalSerializationApi
    class ListEncoder : AbstractEncoder() {
        val list = mutableListOf<Any>()
    
        override val serializersModule: SerializersModule = EmptySerializersModule()
    }
    ```

2. `ListEncoder` 클래스에서 `encodeValue()`를 오버라이드하여 인코더가 각 값을 처리하는 방식을 정의합니다.

    ```kotlin
        override fun encodeValue(value: Any) {
            list.add(value)
        }
    ```

3. 인코더를 사용하여 값을 직렬화하는 함수를 생성합니다:

    ```kotlin
    @ExperimentalSerializationApi
    fun <T> encodeToList(serializer: SerializationStrategy<T>, value: T): List<Any> {
        val encoder = ListEncoder()
        encoder.encodeSerializableValue(serializer, value)
        return encoder.list
    }
    ```

4. 호출자가 시리얼라이저를 명시적으로 전달하지 않아도 되도록 reified 타입 파라미터를 가진 `serializer()`를 사용하는 인라인 오버로드를 추가합니다:

    ```kotlin
    @ExperimentalSerializationApi
    inline fun <reified T> encodeToList(value: T) = encodeToList(serializer(), value)
    ```

> 인코더는 일반적으로 애플리케이션의 다른 부분에서 사용되므로,
> 개별 함수 내부에서만 opt-in하는 대신 `@ExperimentalSerializationApi` 어노테이션을 전파(propagate)하는 것이 좋습니다.
>
{style="note"}

다음은 객체 그래프의 기본 타입 값들을 직렬화 순서대로 플랫(flat) 리스트로 인코딩하는 최소한의 예제입니다:

```kotlin
import kotlinx.serialization.*
import kotlinx.serialization.descriptors.*
import kotlinx.serialization.encoding.*
import kotlinx.serialization.modules.*

// 직렬화된 값을 리스트에 저장하는 커스텀 인코더를 생성합니다
@ExperimentalSerializationApi
class ListEncoder : AbstractEncoder() {
    val list = mutableListOf<Any>()

    override val serializersModule: SerializersModule = EmptySerializersModule()

    // 인코딩된 각 값을 저장합니다
    override fun encodeValue(value: Any) {
        list.add(value)
    }
}

// 값을 인코딩하고 수집된 값들을 리스트로 반환합니다
@ExperimentalSerializationApi
fun <T> encodeToList(serializer: SerializationStrategy<T>, value: T): List<Any> {
    val encoder = ListEncoder()
    encoder.encodeSerializableValue(serializer, value)
    return encoder.list
}

// 편의를 위해 타입 안전한 인라인 오버로드를 제공합니다
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

출력 결과를 보면 인코더가 직렬화된 모든 값을 직렬화 순서대로 플랫 리스트에 수집함을 알 수 있습니다.
이 기능은 해시나 다이제스트를 계산할 때처럼 해당 값들을 균일하게 처리해야 할 때 유용할 수 있습니다.

### 기본 디코더 생성 {id="create-a-basic-decoder"}

커스텀 디코더를 빌드하려면 `AbstractDecoder` 클래스를 상속할 수 있습니다.
이렇게 하면 `Decoder` 및 `CompositeDecoder` 인터페이스를 처음부터 구현하는 대신 기본 구현을 오버라이드할 수 있습니다.

기본 디코더를 생성하는 방법은 다음과 같습니다:

1. 커스텀 역직렬화 로직을 정의하기 위해 `AbstractDecoder`를 상속하는 클래스를 생성합니다:

    ```kotlin
    @ExperimentalSerializationApi
    class ListDecoder(val list: ArrayDeque<Any>) : AbstractDecoder() {
        private var elementIndex = 0
    
        override val serializersModule: SerializersModule = EmptySerializersModule()
    }
    ```

2. `ListDecoder` 클래스에서 [`decodeValue()`](https://kotlinlang.org/api/kotlinx.serialization/kotlinx-serialization-core/kotlinx.serialization.encoding/-abstract-decoder/decode-value.html) 함수를 오버라이드하여 디코더가 값을 역직렬화하는 방식을 정의합니다:

    ```kotlin
        override fun decodeValue(): Any = list.removeFirst()
    ```

3. [`decodeElementIndex()`](https://kotlinlang.org/api/kotlinx.serialization/kotlinx-serialization-core/kotlinx.serialization.encoding/-composite-decoder/decode-element-index.html) 함수를 오버라이드하여 다음으로 디코딩될 요소를 알리고 구조가 완료되면 `DECODE_DONE`을 반환합니다:

    ```kotlin
        override fun decodeElementIndex(descriptor: SerialDescriptor): Int {
            if (elementIndex == descriptor.elementsCount) return CompositeDecoder.DECODE_DONE
            return elementIndex++
        }
    ```

   이 포맷은 직렬화 순서대로 값을 역직렬화하므로 간단한 `elementIndex` 카운터를 사용하여 진행 상황을 추적할 수 있습니다.
   보다 복잡한 포맷에서는 다음에 디코딩할 요소를 찾기 위해 추가적인 로직이 필요한 경우가 많습니다.

   > 커스텀 시리얼라이저가 `decodeElementIndex()` 함수의 요소 인덱스를 사용하는 방법을 보려면 [커스텀 복합 시리얼라이저 생성](serialization-create-and-use-serializers.md#create-a-custom-composite-serializer)을 참조하세요.
   >
   {style="tip"}

4. 중첩된 각 구조에 대해 새 디코더를 생성하도록 [`beginStructure()`](https://kotlinlang.org/api/kotlinx.serialization/kotlinx-serialization-core/kotlinx.serialization.encoding/-abstract-decoder/begin-structure.html) 함수를 오버라이드하여 재귀적으로 디코딩되는 각 구조가 자체 `elementIndex` 상태를 유지하도록 합니다:

    ```kotlin
        override fun beginStructure(descriptor: SerialDescriptor): CompositeDecoder =
            ListDecoder(list)
    ```

5. 디코더를 사용하여 값을 역직렬화하는 함수를 생성합니다:

    ```kotlin
    @ExperimentalSerializationApi
    fun <T> decodeFromList(list: List<Any>, deserializer: DeserializationStrategy<T>): T {
        val decoder = ListDecoder(ArrayDeque(list))
        return decoder.decodeSerializableValue(deserializer)
    }
    ```

6. 역직렬화를 더 쉽게 호출할 수 있도록 인라인 오버로드를 추가합니다:

    ```kotlin
    @ExperimentalSerializationApi
    inline fun <reified T> decodeFromList(list: List<Any>): T = decodeFromList(list, serializer())
    ```

다음은 기본 타입 값 리스트를 다시 객체로 디코딩하는 완전한 예제입니다:

```kotlin
import kotlinx.serialization.*
import kotlinx.serialization.descriptors.*
import kotlinx.serialization.encoding.*
import kotlinx.serialization.modules.*

// 직렬화된 값을 리스트에 저장하는 커스텀 인코더를 생성합니다
@ExperimentalSerializationApi
class ListEncoder : AbstractEncoder() {
    val list = mutableListOf<Any>()

    override val serializersModule: SerializersModule = EmptySerializersModule()

    // 인코딩된 각 값을 저장합니다
    override fun encodeValue(value: Any) {
       list.add(value)
    }
}

// 값을 인코딩하고 수집된 값들을 리스트로 반환합니다
@ExperimentalSerializationApi
fun <T> encodeToList(serializer: SerializationStrategy<T>, value: T): List<Any> {
    val encoder = ListEncoder()
    encoder.encodeSerializableValue(serializer, value)
    return encoder.list
}

// 편의를 위해 encodeToList의 타입 안전한 인라인 버전을 제공합니다
@ExperimentalSerializationApi
inline fun <reified T> encodeToList(value: T) = encodeToList(serializer(), value)

//sampleStart
// 리스트에서 직렬화된 값을 디코딩하는 커스텀 디코더를 생성합니다
@ExperimentalSerializationApi
class ListDecoder(val list: ArrayDeque<Any>) : AbstractDecoder() {
    private var elementIndex = 0

    override val serializersModule: SerializersModule = EmptySerializersModule()

    // 리스트에서 다음 값을 반환합니다
    override fun decodeValue(): Any = list.removeFirst()
    
    // 다음 요소 인덱스를 보고하거나 디코딩이 완료되었음을 알립니다
    override fun decodeElementIndex(descriptor: SerialDescriptor): Int {
        if (elementIndex == descriptor.elementsCount) return CompositeDecoder.DECODE_DONE
        return elementIndex++
    }

    // 중첩된 각 구조에 대해 새 디코더를 생성합니다
    override fun beginStructure(descriptor: SerialDescriptor): CompositeDecoder =
        ListDecoder(list)
}

// 커스텀 디코더를 사용하여 리스트에서 객체를 역직렬화합니다
@ExperimentalSerializationApi
fun <T> decodeFromList(list: List<Any>, deserializer: DeserializationStrategy<T>): T {
    val decoder = ListDecoder(ArrayDeque(list))
    return decoder.decodeSerializableValue(deserializer)
}

// 편의를 위해 decodeFromList의 타입 안전한 인라인 버전을 제공합니다
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

출력 결과를 보면 디코더가 직렬화 순서대로 리스트를 다시 읽어와 원래 객체를 재구성함을 알 수 있습니다.

`decodeElementIndex()` 함수는 다음에 올 프로퍼티를 보고하고, `beginStructure()` 함수는 중첩된 객체를 위한 새로운 디코더 상태를 생성합니다.

### 순차적 디코딩을 통한 최적화 {id="optimize-with-sequential-decoding"}

포맷이 항상 선언 순서대로 값을 저장하고 [선택적 요소 건너뛰기](serialization-create-and-use-serializers.md#encode-default-values-in-custom-serializers)를 지원하지 않는 경우, [`decodeSequentially()`](https://kotlinlang.org/api/kotlinx.serialization/kotlinx-serialization-core/kotlinx.serialization.encoding/-composite-decoder/decode-sequentially.html) 함수를 통해 디코딩을 최적화할 수 있습니다.

이 함수가 `true`를 반환하면, 순차적 디코딩을 지원하는 시리얼라이저는 다음 요소 인덱스를 반복적으로 요청하지 않고도 순서대로 값을 읽을 수 있습니다.
이는 순차 포맷으로 저장된 데이터를 역직렬화할 때 성능을 향상시킬 수 있습니다. `kotlinx.serialization` 플러그인에 의해 생성된 시리얼라이저는 이 최적화를 사용합니다.

`decodeSequentially()` 함수에서 `true`를 반환한다고 해서 디코더를 사용하는 시리얼라이저가 반드시 순차적 디코딩을 사용한다는 보장은 없습니다.
따라서 디코더가 `decodeElementIndex()` 함수를 사용하는 일반적인 디코딩 방식도 지원하는지 확인해야 합니다.

> 역직렬화 도중 시리얼라이저가 `decodeSequentially()` 함수를 사용하는 방식을 보려면 [순차적 디코딩을 통한 역직렬화 최적화](serialization-create-and-use-serializers.md#optimize-deserialization-with-sequential-decoding)를 참조하세요.
>
{style="tip"}

커스텀 `ListDecoder`에 이 최적화를 적용하는 방법은 다음과 같습니다:

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

    // 시리얼라이저가 순차적 디코딩을 사용하지 않을 때를 대비해 일반 디코딩 지원을 추가합니다
    override fun decodeElementIndex(descriptor: SerialDescriptor): Int {
        if (elementIndex == descriptor.elementsCount) return CompositeDecoder.DECODE_DONE
        return elementIndex++
    }

    override fun beginStructure(descriptor: SerialDescriptor): CompositeDecoder =
        ListDecoder(list)

    // 순차적 디코딩을 지원하는 시리얼라이저를 위해 활성화합니다
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

이 예제에서 `ListDecoder`는 `decodeSequentially()` 함수를 오버라이드하여 `true`를 반환합니다.
이를 통해 지원되는 시리얼라이저는 각 요소 인덱스를 하나씩 조회하지 않고 선언 순서대로 값을 직접 읽을 수 있습니다.

### 컬렉션 지원 추가 {id="add-collection-support"}

기본적인 커스텀 포맷은 컬렉션 요소를 하나씩 인코딩할 수 있지만, 디코딩 시에는 몇 개의 요소가 컬렉션에 속하는지도 알아야 합니다.

커스텀 포맷에서 컬렉션을 지원하려면 컬렉션의 크기를 요소와 함께 인코딩하여 디코더가 컬렉션이 끝나는 지점을 알 수 있도록 해야 합니다:

1. 컬렉션 크기를 처리하기 위해 인코더에서 [`beginCollection()`](https://kotlinlang.org/api/kotlinx.serialization/kotlinx-serialization-core/kotlinx.serialization.encoding/-encoder/begin-collection.html) 함수를 구현합니다.
2. 인코더에 추가적인 컬렉션 전용 상태가 필요하지 않은 경우 `beginCollection()` 함수에서 인코더 인스턴스를 그대로 반환합니다.
3. 역직렬화 도중 컬렉션 크기를 디코딩하고 저장하기 위해 디코더에서 [`decodeCollectionSize()`](https://kotlinlang.org/api/kotlinx.serialization/kotlinx-serialization-core/kotlinx.serialization.encoding/-composite-decoder/decode-collection-size.html) 함수를 구현합니다.
4. 포맷이 컬렉션 크기를 미리 저장하고 값을 순서대로 읽는 경우 `decodeSequentially()` 함수에서 `true`를 반환합니다.

다음은 `ListEncoder`에 컬렉션 지원을 추가한 완전한 예제입니다:

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

    // 컬렉션 요소 앞에 컬렉션 크기를 저장합니다
    override fun beginCollection(descriptor: SerialDescriptor, collectionSize: Int): CompositeEncoder {
        encodeInt(collectionSize)
        // 추가적인 컬렉션 전용 상태가 필요하지 않으므로 동일한 인코더를 반환합니다
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

    // 컬렉션 크기를 미리 알고 있으므로 값이 순서대로 디코딩됨을 알립니다
    override fun decodeSequentially(): Boolean = true

    // 컬렉션 요소를 읽기 전에 컬렉션 크기를 디코딩하고 저장합니다
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

이 예제에서는 인코딩된 리스트의 컬렉션 요소 앞에 컬렉션 크기가 포함되므로 디코더가 컬렉션을 올바르게 디코딩할 수 있습니다.

### null 지원 추가 {id="add-null-support"}

커스텀 포맷에서 null 값을 지원하려면 일반 값과 `null`을 구분할 수 있는 방법이 필요합니다.

이는 일반적으로 `null` 값과 실제 데이터를 구분하기 위해 각 nullable 값 앞에 "null 지시자(null indicator)"를 추가하는 방식으로 이루어집니다.

커스텀 포맷에 null 값 지원을 추가하려면:

1. `null` 값이 표시되는 방식을 지정하기 위해 인코더에서 [`encodeNull()`](https://kotlinlang.org/api/kotlinx.serialization/kotlinx-serialization-core/kotlinx.serialization.encoding/-abstract-encoder/encode-null.html)을 오버라이드합니다.
2. null이 아닌 값을 표시하기 위해 인코더에서 [`encodeNotNullMark()`](https://kotlinlang.org/api/kotlinx.serialization/kotlinx-serialization-core/kotlinx.serialization.encoding/-encoder/encode-not-null-mark.html)을 오버라이드합니다.
3. 값을 디코딩하기 전에 해당 표식을 확인하기 위해 디코더에서 [`decodeNotNullMark()`](https://kotlinlang.org/api/kotlinx.serialization/kotlinx-serialization-core/kotlinx.serialization.encoding/-decoder/decode-not-null-mark.html)을 오버라이드합니다.

다음은 `ListEncoder` 및 `ListDecoder` 구현에 `null` 지원을 추가하는 예제입니다:

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

    // null 값을 NULL로 표현합니다
    override fun encodeNull() = encodeValue("NULL")

    // null이 아닌 값을 "!!"로 표시합니다
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

    // 다음 값이 "NULL"인지 확인하여 다음 nullable 값이 null인지 여부를 확인합니다
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

이 예제에서 인코더는 null이 아닌 값 앞에는 `!!`를 작성하고, `null` 값에는 `NULL`을 작성합니다.
디코더는 이 표식을 확인하여 값을 디코딩할지 아니면 `null`을 반환할지 결정합니다.

### 컴팩트 바이너리 포맷 생성 {id="create-a-compact-binary-format"}

바이너리 포맷은 데이터를 조밀하게 표현하므로 저장되거나 전송되는 데이터양을 최소화하는 것이 중요한 시나리오에 적합합니다.

커스텀 바이너리 포맷을 사용하면 로우 레벨에서 데이터가 직렬화 및 역직렬화되는 방식을 직접 제어할 수 있습니다.
이를 통해 성능을 최적화하고 다른 시스템과의 호환성을 유지할 수 있는 유연성을 확보할 수 있습니다.

[`java.io.DataOutput`](https://docs.oracle.com/javase/8/docs/api/java/io/DataOutput.html) 및 [`java.io.DataInput`](https://docs.oracle.com/javase/8/docs/api/java/io/DataInput.html) 인터페이스를 구현하여 Kotlin 직렬화로 커스텀 바이너리 포맷을 생성할 수 있습니다.

다음은 `DataOutput`과 `DataInput`을 사용하여 [`ListEncoder`](#create-a-basic-encoder) 및 [`ListDecoder`](#create-a-basic-decoder) 구현을 컴팩트 바이너리 포맷으로 전환하는 방법의 예제입니다:

1. 정수형을 위한 `encodeInt()`나 문자열을 위한 `encodeString()`과 같이 각 프리미티브 타입에 대한 인코드 함수를 오버라이드합니다.
   이러한 타입별 인코드 함수는 [박싱을 방지](numbers.md#boxing-and-caching-numbers-on-the-jvm)하며 각 [기본 타입](serialization-serialize-builtin-types.md#basic-types)에 대한 바이너리 표현을 정의할 수 있게 해줍니다.
   이 예제에서는 값이 `DataOutput` 스트림으로 직접 인코딩됩니다:

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

2. `decodeInt()` 또는 `decodeString()`과 같이 각 프리미티브 타입에 대한 디코드 함수를 구현합니다.
   이를 통해 디코더는 `DataInput` 스트림에서 값을 직접 디코딩하고 원래 데이터 구조를 재구성할 수 있습니다:

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

3. 이러한 클래스를 사용하여 Kotlin 객체를 바이너리 포맷으로 직렬화 및 역직렬화합니다:

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

        // 기본 타입 값을 바이너리 형태로 직접 인코딩합니다
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

        // 기본 타입 값을 바이너리 형태에서 직접 디코딩합니다
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
        // 객체를 커스텀 바이너리 포맷으로 인코딩합니다
        val output = ByteArrayOutputStream()
        encodeTo(DataOutputStream(output), data)

        val bytes = output.toByteArray()
        println(bytes.toAsciiHexString())
        // {00}{15}kotlinx.serialization{00}{06}Kotlin

        // 커스텀 바이너리 포맷에서 객체를 디코딩합니다
        val input = ByteArrayInputStream(bytes)
        val obj = decodeFrom<Project>(DataInputStream(input))
        println(obj)
        // Project(name=kotlinx.serialization, language=Kotlin)
    }
    //sampleEnd
    ```
    {kotlin-runnable="true"}

이 예제에서 커스텀 포맷은 바이너리 형태에서 키나 프로퍼티 이름 없이 직렬화된 값만을 인코딩하고, 이를 다시 `Project` 객체로 디코딩합니다.
이를 통해 컴팩트한 표현과 바이너리 인코딩에 대한 정밀한 제어가 필요한 경우에 포맷을 쉽게 적용할 수 있습니다.

### 포맷 전용 타입에 대한 지원 추가 {id="add-support-for-format-specific-types"}

커스텀 포맷은 표준 프리미티브 인코딩 함수에 직접 매핑되지 않는 타입을 지원할 수 있습니다.

이러한 타입을 지원하려면 인코더의 `encodeSerializableValue()` 함수와 디코더의 `decodeSerializableValue()` 함수를 오버라이드합니다.
이를 통해 비표준 데이터 표현에 대한 효율적인 처리와 유연성을 유지하면서 포맷 전용 타입에 대한 [커스텀 직렬화 로직을 정의](#create-custom-formats)할 수 있습니다.

타입을 올바르게 감지하려면 값의 런타임 타입을 확인하는 대신 `serializer.descriptor` 프로퍼티를 해당 타입 시리얼라이저의 디스크립터와 비교합니다.
이렇게 하면 타입이 커스텀 시리얼라이저를 사용하거나 다른 타입과 동일한 기본 표현을 공유하는 경우에도 선언된 직렬화 형태를 유지할 수 있습니다.

`ByteArray` 타입에 대한 특화된 지원을 [컴팩트 바이너리 포맷 예제](#create-a-compact-binary-format)에 확장하여 추가하는 방법을 살펴보겠습니다:

1. 인코더가 디스크립터를 통해 식별할 수 있도록 포맷 전용 타입에 대한 시리얼라이저를 가져옵니다:

    ```kotlin
    private val byteArraySerializer = serializer<ByteArray>()
    ```   

    > 내장 함수인 [`ByteArraySerializer()`](https://kotlinlang.org/api/kotlinx.serialization/kotlinx-serialization-core/kotlinx.serialization.builtins/-byte-array-serializer.html)를 사용해도 유사한 결과를 얻을 수 있습니다.
    >
    {style="tip"}

2. 디스크립터를 통해 `ByteArray` 값을 감지하고 특화된 인코딩 경로를 사용하도록 인코더의 `encodeSerializableValue()` 함수를 오버라이드합니다.
   그런 다음 바이트 배열을 인코딩할 도우미 함수를 정의합니다:

   ```kotlin
   override fun <T> encodeSerializableValue(serializer: SerializationStrategy<T>, value: T) {
       if (serializer.descriptor == byteArraySerializer.descriptor)
           encodeByteArray(value as ByteArray)
       else
           super.encodeSerializableValue(serializer, value)
   }

   // 크기를 컴팩트하게 표현하여 ByteArray를 인코딩합니다
   private fun encodeByteArray(bytes: ByteArray) {
       encodeCompactSize(bytes.size)
       output.write(bytes)
   }

   // 최대 254까지의 크기를 1바이트로 인코딩합니다
   private fun encodeCompactSize(value: Int) {
       if (value < 0xff) {
           output.writeByte(value)
       } else {
           output.writeByte(0xff)
           output.writeInt(value)
       }
   }
   ```

3. 디스크립터를 통해 `ByteArray` 값을 감지하고 일치하는 컴팩트 크기 포맷으로 역직렬화하도록 디코더의 [`decodeSerializableValue()`](https://kotlinlang.org/api/kotlinx.serialization/kotlinx-serialization-core/kotlinx.serialization.encoding/-decoder/decode-serializable-value.html) 함수를 오버라이드합니다:

   ```kotlin
       @Suppress("UNCHECKED_CAST")
       override fun <T> decodeSerializableValue(deserializer: DeserializationStrategy<T>, previousValue: T?): T =
           if (deserializer.descriptor == byteArraySerializer.descriptor)
               decodeByteArray() as T
           else
               super.decodeSerializableValue(deserializer, previousValue)
   
       // ByteArray 데이터를 디코딩합니다
       private fun decodeByteArray(): ByteArray {
           val bytes = ByteArray(decodeCompactSize())
           input.readFully(bytes)
           return bytes
       }
   
       // 컴팩트 포맷을 사용하여 크기를 효율적으로 디코딩합니다
       private fun decodeCompactSize(): Int {
           val byte = input.readByte().toInt() and 0xff
           if (byte < 0xff) return byte
           return input.readInt()
       }
   ```
   {collapsible="true" default-state="expanded" collapsed-title="override fun <T> decodeSerializableValue(deserializer: DeserializationStrategy<T>, previousValue: T?)"}

4. `ByteArray` 데이터가 포함된 객체를 직렬화 및 역직렬화합니다:

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

다음은 특화된 인코딩 및 디코딩 경로를 사용하여 `ByteArray` 프로퍼티를 가진 클래스를 직렬화하고 역직렬화하는 완전한 예제입니다:

```kotlin
import kotlinx.serialization.*
import kotlinx.serialization.Serializable
import kotlinx.serialization.descriptors.*
import kotlinx.serialization.modules.*
import kotlinx.serialization.encoding.*
import java.io.*

// 디스크립터로 ByteArray를 감지하는 데 사용할 시리얼라이저를 선언합니다
private val byteArraySerializer = serializer<ByteArray>()

@ExperimentalSerializationApi
class DataOutputEncoder(val output: DataOutput) : AbstractEncoder() {
    override val serializersModule: SerializersModule = EmptySerializersModule()

    // 기본 타입을 인코딩하는 함수들입니다
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

    // 디스크립터로 ByteArray를 감지하고 특화된 인코딩 경로를 사용합니다
    override fun <T> encodeSerializableValue(serializer: SerializationStrategy<T>, value: T) {
        if (serializer.descriptor == byteArraySerializer.descriptor)
            encodeByteArray(value as ByteArray)
        else
            super.encodeSerializableValue(serializer, value)
    }

    // 컴팩트한 크기 표현으로 ByteArray를 인코딩합니다
    private fun encodeByteArray(bytes: ByteArray) {
        encodeCompactSize(bytes.size)
        output.write(bytes)
    }

    // 최대 254까지의 크기를 1바이트로 인코딩합니다
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

    // 기본 타입을 디코딩하는 함수들입니다
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

    // 디스크립터로 ByteArray를 감지하고 특화된 디코딩 경로를 사용합니다
    @Suppress("UNCHECKED_CAST")
    override fun <T> decodeSerializableValue(deserializer: DeserializationStrategy<T>, previousValue: T?): T =
        if (deserializer.descriptor == byteArraySerializer.descriptor)
            decodeByteArray() as T
        else
            super.decodeSerializableValue(deserializer, previousValue)

    // 배열 크기를 디코딩한 다음 바이트 배열 내용을 디코딩합니다
    private fun decodeByteArray(): ByteArray {
        val bytes = ByteArray(decodeCompactSize())
        input.readFully(bytes)
        return bytes
    }

    // 1바이트에서 최대 254 크기를 디코딩합니다
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

### 포맷 전용 `@Serializable` 어노테이션 정의 {id="define-a-format-specific-serializable-annotation"}

[`@MetaSerializable`](https://kotlinlang.org/api/kotlinx.serialization/kotlinx-serialization-core/kotlinx.serialization/-meta-serializable/) 어노테이션을 사용하여 포맷 전용 `@Serializable` 어노테이션을 정의할 수 있습니다.
클래스에 `@Serializable` 대신 이 포맷 전용 어노테이션을 추가하면 해당 클래스가 직렬화 가능해지며 생성된 직렬 디스크립터(serial descriptor)에 어노테이션 데이터가 포함됩니다.

다음은 `@BinarySerializable` 어노테이션을 정의하는 예제입니다:

```kotlin
import kotlinx.serialization.ExperimentalSerializationApi
import kotlinx.serialization.MetaSerializable

//sampleStart
@OptIn(ExperimentalSerializationApi::class)
// 어노테이션이 지정된 클래스를 직렬화 가능하게 만드는 포맷 전용 어노테이션을 정의합니다
@MetaSerializable
@Target(AnnotationTarget.CLASS)
annotation class BinarySerializable(val typeId: Int)

@BinarySerializable(typeId = 1)
data class Project(val name: String, val language: String)

@OptIn(ExperimentalSerializationApi::class)
fun main() {
    // 직렬화 플러그인은 @Serializable로 어노테이션된 클래스와 
    // 동일한 방식으로 Project의 시리얼라이저를 생성합니다
    val descriptor = Project.serializer().descriptor

    // 직렬 디스크립터의 어노테이션에서 클래스 식별자를 검색합니다
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

## 다음 단계 {id="what-s-next"}

* [CBOR 포맷](serialization-cbor.md)으로 데이터를 직렬화하는 방법을 알아보세요.
* [ProtoBuf 포맷](serialization-protobuf.md)에서 프로토콜 버퍼 직렬화를 살펴보세요.