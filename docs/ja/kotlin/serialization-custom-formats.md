[//]: # (title: カスタムシリアライズフォーマット)
<primary-label ref="experimental-general"/>

[//]: # (description: エンコーダー、デコーダー、シーケンシャルデコード、およびフォーマット固有の型のサポートを含む、Kotlin シリアライゼーションのカスタムフォーマットを作成する方法を学びます。)

JSON は現在、Kotlin シリアライゼーションにおいて唯一の安定した（stable）フォーマットです。
Kotlin シリアライゼーションは、バイナリフォーマットである [CBOR](serialization-cbor.md) や [ProtoBuf](serialization-protobuf.md) に加えて、クラスを `String` キーを持つフラットなマップとして表現する [`Properties`](https://kotlinlang.org/api/kotlinx.serialization/kotlinx-serialization-properties/kotlinx.serialization.properties/-properties/) フォーマットの実験的サポートも提供しています。

これらの実験的フォーマットの実装はプロダクション品質ですが、将来のリリースでデフォルトのシリアライズ動作に変更が加えられる可能性があります。
また、Kotlin データの表現方法に関して、フォーマット固有の制約や制限が存在する場合もあります。

これらのフォーマットのいずれもユースケースに合致しない場合は、値や構造がどのようにエンコードおよびデコードされるかを制御するカスタムフォーマットを作成できます。

## カスタムフォーマットの作成 {id="create-custom-formats"}

Kotlin シリアライゼーション用のカスタムフォーマットを作成するには、
[`Encoder`](https://kotlinlang.org/api/kotlinx.serialization/kotlinx-serialization-core/kotlinx.serialization.encoding/-encoder/) および [`Decoder`](https://kotlinlang.org/api/kotlinx.serialization/kotlinx-serialization-core/kotlinx.serialization.encoding/-decoder/) インターフェースを実装します。
シリアライザーはこれらの実装を使用して値をエンコードおよびデコードします。

シリアライザーは、クラスやコレクションなどの構造化された値をエンコードまたはデコードする際に、これらの実装の [`beginStructure()`](https://kotlinlang.org/api/kotlinx.serialization/kotlinx-serialization-core/kotlinx.serialization.encoding/-encoder/begin-structure.html) 関数を呼び出します。
この関数は、各プロパティまたは要素をエンコードまたはデコードする関数を持つ [`CompositeEncoder`](https://kotlinlang.org/api/kotlinx.serialization/kotlinx-serialization-core/kotlinx.serialization.encoding/-composite-encoder/) または [`CompositeDecoder`](https://kotlinlang.org/api/kotlinx.serialization/kotlinx-serialization-core/kotlinx.serialization.encoding/-composite-decoder/) インターフェースを返します。

`Encoder` および `Decoder` インターフェースは広範にわたりますが、[`AbstractEncoder`](https://kotlinlang.org/api/kotlinx.serialization/kotlinx-serialization-core/kotlinx.serialization.encoding/-abstract-encoder/) および [`AbstractDecoder`](https://kotlinlang.org/api/kotlinx.serialization/kotlinx-serialization-core/kotlinx.serialization.encoding/-abstract-decoder/) クラスを使用することで、カスタムのエンコーダーおよびデコーダー実装を作成するプロセスを簡素化できます。
これらのクラスは `Encoder`、`Decoder`、`CompositeEncoder`、および `CompositeDecoder` インターフェースを実装しているため、シンプルなフォーマットであれば同じクラスを使用してプリミティブ値と構造化された値の両方を処理できます。

`AbstractEncoder` クラスは、[`encodeString()`](https://kotlinlang.org/api/kotlinx.serialization/kotlinx-serialization-core/kotlinx.serialization.encoding/-abstract-encoder/encode-string.html) などのほとんどのエンコード関数のデフォルト実装を提供しており、
これらは内部で [`encodeValue(value: Any)`](https://kotlinlang.org/api/kotlinx.serialization/kotlinx-serialization-core/kotlinx.serialization.encoding/-abstract-encoder/encode-value.html) 関数に処理を委譲（delegate）します。
つまり、`encodeValue()` 関数をオーバーライドするだけで、最小限の労力で基本的な機能を持つカスタムフォーマットを作成できます。

以下のセクションでは、これらの API を使用して、値をリストにエンコードし、そのリストから値をデコードするカスタムフォーマットを作成した上で、シーケンシャルデコード、コレクションのサポート、および null のサポートを追加していきます。

### 基本的なエンコーダーの作成 {id="create-a-basic-encoder"}

カスタムエンコーダーを構築するには、`AbstractEncoder` クラスを継承します。
これにより、`Encoder` および `CompositeEncoder` インターフェースを最初からゼロベースで実装する代わりに、デフォルトの実装をオーバーライドできます。

基本的なエンコーダーを作成する手順は以下のとおりです。

1. カスタムのシリアライズロジックを定義するために、`AbstractEncoder` を継承したクラスを作成します。

    ```kotlin
    @ExperimentalSerializationApi
    class ListEncoder : AbstractEncoder() {
        val list = mutableListOf<Any>()
    
        override val serializersModule: SerializersModule = EmptySerializersModule()
    }
    ```

2. `ListEncoder` クラスで `encodeValue()` をオーバーライドし、エンコーダーが各値をどのように処理するかを定義します。

    ```kotlin
        override fun encodeValue(value: Any) {
            list.add(value)
        }
    ```

3. エンコーダーを使用して値をシリアライズする関数を作成します。

    ```kotlin
    @ExperimentalSerializationApi
    fun <T> encodeToList(serializer: SerializationStrategy<T>, value: T): List<Any> {
        val encoder = ListEncoder()
        encoder.encodeSerializableValue(serializer, value)
        return encoder.list
    }
    ```

4. 呼び出し元がシリアライザーを明示的に渡さなくても済むように、具象化された型パラメータ（reified type parameter）を持つ `serializer()` を使用したインラインオーバーロードを追加します。

    ```kotlin
    @ExperimentalSerializationApi
    inline fun <reified T> encodeToList(value: T) = encodeToList(serializer(), value)
    ```

> エンコーダーは通常、アプリケーションの他の部分から使用されるため、
> 個々の関数の内部でのみオプトインするのではなく、`@ExperimentalSerializationApi` アノテーションを伝播させてください。
>
{style="note"}

以下は、オブジェクトグラフからプリミティブ値をシリアライズ順にフラットなリストへとエンコードする最小限の例です。

```kotlin
import kotlinx.serialization.*
import kotlinx.serialization.descriptors.*
import kotlinx.serialization.encoding.*
import kotlinx.serialization.modules.*

// シリアライズされた値をリストに保存するカスタムエンコーダーを作成
@ExperimentalSerializationApi
class ListEncoder : AbstractEncoder() {
    val list = mutableListOf<Any>()

    override val serializersModule: SerializersModule = EmptySerializersModule()

    // エンコードされた各値を保存
    override fun encodeValue(value: Any) {
        list.add(value)
    }
}

// 値をエンコードし、収集された値をリストとして返す
@ExperimentalSerializationApi
fun <T> encodeToList(serializer: SerializationStrategy<T>, value: T): List<Any> {
    val encoder = ListEncoder()
    encoder.encodeSerializableValue(serializer, value)
    return encoder.list
}

// 利便性のための型安全なインラインオーバーロードを提供
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

出力から、エンコーダーがシリアライズされたすべての値をシリアライズ順にフラットなリストに収集していることがわかります。
これは、ハッシュやダイジェストを計算する場合など、それらの値を一様に処理する必要がある場合に役立ちます。

### 基本的なデコーダーの作成 {id="create-a-basic-decoder"}

カスタムデコーダーを構築するには、`AbstractDecoder` クラスを継承します。
これにより、`Decoder` および `CompositeDecoder` インターフェースを一から実装する代わりに、デフォルトの実装をオーバーライドできます。

基本的なデコーダーを作成する手順は以下のとおりです。

1. カスタムのデシリアライズロジックを定義するために、`AbstractDecoder` を継承したクラスを作成します。

    ```kotlin
    @ExperimentalSerializationApi
    class ListDecoder(val list: ArrayDeque<Any>) : AbstractDecoder() {
        private var elementIndex = 0
    
        override val serializersModule: SerializersModule = EmptySerializersModule()
    }
    ```

2. `ListDecoder` クラスで [`decodeValue()`](https://kotlinlang.org/api/kotlinx.serialization/kotlinx-serialization-core/kotlinx.serialization.encoding/-abstract-decoder/decode-value.html) 関数をオーバーライドし、デコーダーが値をどのようにデシリアライズするかを定義します。

    ```kotlin
        override fun decodeValue(): Any = list.removeFirst()
    ```

3. [`decodeElementIndex()`](https://kotlinlang.org/api/kotlinx.serialization/kotlinx-serialization-core/kotlinx.serialization.encoding/-composite-decoder/decode-element-index.html) 関数をオーバーライドして、次にどの要素がデコードされるかを通知し、構造が完了したときに `DECODE_DONE` を返します。

    ```kotlin
        override fun decodeElementIndex(descriptor: SerialDescriptor): Int {
            if (elementIndex == descriptor.elementsCount) return CompositeDecoder.DECODE_DONE
            return elementIndex++
        }
    ```

   このフォーマットはシリアライズ順に値をデシリアライズするため、シンプルな `elementIndex` カウンターを使用して進捗を追跡できます。
   より複雑なフォーマットでは、次にデコードされる要素を見つけるために追加のロジックが必要になることがよくあります。

   > カスタムシリアライザーが `decodeElementIndex()` 関数の要素インデックスをどのように使用するかについては、[カスタム複合シリアライザーの作成](serialization-create-and-use-serializers.md#create-a-custom-composite-serializer)を参照してください。
   >
   {style="tip"}

4. [`beginStructure()`](https://kotlinlang.org/api/kotlinx.serialization/kotlinx-serialization-core/kotlinx.serialization.encoding/-abstract-decoder/begin-structure.html) 関数をオーバーライドして、ネストされた構造ごとに新しいデコーダーを作成します。これにより、再帰的にデコードされる各構造が自身の `elementIndex` 状態を保持します。

    ```kotlin
        override fun beginStructure(descriptor: SerialDescriptor): CompositeDecoder =
            ListDecoder(list)
    ```

5. デコーダーを使用して値をデシリアライズする関数を作成します。

    ```kotlin
    @ExperimentalSerializationApi
    fun <T> decodeFromList(list: List<Any>, deserializer: DeserializationStrategy<T>): T {
        val decoder = ListDecoder(ArrayDeque(list))
        return decoder.decodeSerializableValue(deserializer)
    }
    ```

6. デシリアライズの呼び出しを容易にするインラインオーバーロードを追加します。

    ```kotlin
    @ExperimentalSerializationApi
    inline fun <reified T> decodeFromList(list: List<Any>): T = decodeFromList(list, serializer())
    ```

以下は、プリミティブ値のリストをオブジェクトへとデコードして復元する完全な例です。

```kotlin
import kotlinx.serialization.*
import kotlinx.serialization.descriptors.*
import kotlinx.serialization.encoding.*
import kotlinx.serialization.modules.*

// シリアライズされた値をリストに保存するカスタムエンコーダーを作成
@ExperimentalSerializationApi
class ListEncoder : AbstractEncoder() {
    val list = mutableListOf<Any>()

    override val serializersModule: SerializersModule = EmptySerializersModule()

    // エンコードされた各値を保存
    override fun encodeValue(value: Any) {
       list.add(value)
    }
}

// 値をエンコードし、収集された値をリストとして返す
@ExperimentalSerializationApi
fun <T> encodeToList(serializer: SerializationStrategy<T>, value: T): List<Any> {
    val encoder = ListEncoder()
    encoder.encodeSerializableValue(serializer, value)
    return encoder.list
}

// 利便性のための型安全なインライン版 encodeToList を提供
@ExperimentalSerializationApi
inline fun <reified T> encodeToList(value: T) = encodeToList(serializer(), value)

//sampleStart
// シリアライズされた値をリストからデコードするカスタムデコーダーを作成
@ExperimentalSerializationApi
class ListDecoder(val list: ArrayDeque<Any>) : AbstractDecoder() {
    private var elementIndex = 0

    override val serializersModule: SerializersModule = EmptySerializersModule()

    // リストから次の値を返す
    override fun decodeValue(): Any = list.removeFirst()
    
    // 次の要素インデックスを通知するか、デコード完了のシグナルを返す
    override fun decodeElementIndex(descriptor: SerialDescriptor): Int {
        if (elementIndex == descriptor.elementsCount) return CompositeDecoder.DECODE_DONE
        return elementIndex++
    }

    // ネストされた構造ごとに新しいデコーダーを作成
    override fun beginStructure(descriptor: SerialDescriptor): CompositeDecoder =
        ListDecoder(list)
}

// カスタムデコーダーを使用してリストからオブジェクトをデシリアライズ
@ExperimentalSerializationApi
fun <T> decodeFromList(list: List<Any>, deserializer: DeserializationStrategy<T>): T {
    val decoder = ListDecoder(ArrayDeque(list))
    return decoder.decodeSerializableValue(deserializer)
}

// 利便性のための型安全なインライン版 decodeFromList を提供
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

出力から、デコーダーがシリアライズ順にリストを読み戻し、元のオブジェクトを再構築していることがわかります。

`decodeElementIndex()` 関数は次にどのプロパティが来るかを通知し、`beginStructure()` 関数はネストされたオブジェクト用に新しいデコーダー状態を作成します。

### シーケンシャルデコードによる最適化 {id="optimize-with-sequential-decoding"}

フォーマットが常に宣言順に値を格納し、[オプショナルな要素のスキップ](serialization-create-and-use-serializers.md#encode-default-values-in-custom-serializers)をサポートしていない場合は、[`decodeSequentially()`](https://kotlinlang.org/api/kotlinx.serialization/kotlinx-serialization-core/kotlinx.serialization.encoding/-composite-decoder/decode-sequentially.html) 関数を使用してデコードを最適化できます。

この関数が `true` を返すと、シーケンシャルデコードをサポートするシリアライザーは、次の要素インデックスを繰り返し要求することなく、順番通りに値を読み取ることができます。
これにより、シーケンシャルなフォーマットで格納されたデータをデシリアライズする際のパフォーマンスが向上します。`kotlinx.serialization` プラグインによって生成されたシリアライザーは、この最適化を利用します。

`decodeSequentially()` 関数から `true` を返しても、デコーダーを使用するシリアライザーが必ずシーケンシャルデコードを使用するとは限りません。
そのため、デコーダーが `decodeElementIndex()` 関数による通常のデコードもサポートしていることを確認してください。

> デシリアライズ中にシリアライザーがどのように `decodeSequentially()` 関数を使用するかについては、[シーケンシャルデコードによるデシリアライズの最適化](serialization-create-and-use-serializers.md#optimize-deserialization-with-sequential-decoding)を参照してください。
>
{style="tip"}

カスタムの `ListDecoder` にこの最適化を適用する方法は以下のとおりです。

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

    // シリアライザーがシーケンシャルデコードを使用しない場合のための通常デコードのサポートを追加
    override fun decodeElementIndex(descriptor: SerialDescriptor): Int {
        if (elementIndex == descriptor.elementsCount) return CompositeDecoder.DECODE_DONE
        return elementIndex++
    }

    override fun beginStructure(descriptor: SerialDescriptor): CompositeDecoder =
        ListDecoder(list)

    // シーケンシャルデコードをサポートするシリアライザーに対してそれを有効化
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

この例では、`ListDecoder` が `decodeSequentially()` 関数をオーバーライドして `true` を返しています。
これにより、対応するシリアライザーは各要素インデックスを1つずつ問い合わせる代わりに、宣言順に直接値を読み取ることができます。

### コレクションのサポートを追加 {id="add-collection-support"}

基本的なカスタムフォーマットではコレクション要素を1つずつエンコードできますが、デコード時にはコレクションに属する要素数も把握する必要があります。

カスタムフォーマットでコレクションをサポートするには、デコーダーがコレクションの終了位置を認識できるように、要素とともにコレクションサイズもエンコードします。

1. エンコーダーに [`beginCollection()`](https://kotlinlang.org/api/kotlinx.serialization/kotlinx-serialization-core/kotlinx.serialization.encoding/-encoder/begin-collection.html) 関数を実装してコレクションサイズを処理します。
2. エンコーダーに追加のコレクション固有の状態が必要ない場合は、`beginCollection()` 関数からそのエンコーダーインスタンス自身を返します。
3. デコーダーに [`decodeCollectionSize()`](https://kotlinlang.org/api/kotlinx.serialization/kotlinx-serialization-core/kotlinx.serialization.encoding/-composite-decoder/decode-collection-size.html) 関数を実装し、デシリアライズ中にコレクションサイズをデコードして保存します。
4. フォーマットがあらかじめコレクションサイズを格納し、値が順番に読み取られる場合は、`decodeSequentially()` 関数から `true` を返します。

以下は、`ListEncoder` にコレクションサポートを追加する完全な例です。

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

    // 要素の前にコレクションサイズを保存
    override fun beginCollection(descriptor: SerialDescriptor, collectionSize: Int): CompositeEncoder {
        encodeInt(collectionSize)
        // 追加のコレクション固有の状態が必要ないため、同じエンコーダーを返す
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

    // コレクションサイズがあらかじめ分かっているため、値が順番にデコードされることを通知
    override fun decodeSequentially(): Boolean = true

    // コレクション要素を読み取る前に、コレクションサイズをデコードして保存
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

この例では、エンコードされたリストのコレクション要素の前にコレクションサイズが含まれているため、デコーダーはコレクションを正しくデコードできます。

### null のサポートを追加 {id="add-null-support"}

カスタムフォーマットで null 値をサポートするには、`null` と通常の値を区別する方法が必要です。

これは通常、null 許容値の前に、`null` 値と実際のデータを区別する「null インジケーター」を追加することで行われます。

カスタムフォーマットに null 値のサポートを追加する手順は以下のとおりです。

1. エンコーダーで [`encodeNull()`](https://kotlinlang.org/api/kotlinx.serialization/kotlinx-serialization-core/kotlinx.serialization.encoding/-abstract-encoder/encode-null.html) をオーバーライドして、`null` 値がどのようにマークされるかを指定します。
2. エンコーダーで [`encodeNotNullMark()`](https://kotlinlang.org/api/kotlinx.serialization/kotlinx-serialization-core/kotlinx.serialization.encoding/-encoder/encode-not-null-mark.html) をオーバーライドして、非 null 値をマークします。
3. デコーダーで [`decodeNotNullMark()`](https://kotlinlang.org/api/kotlinx.serialization/kotlinx-serialization-core/kotlinx.serialization.encoding/-decoder/decode-not-null-mark.html) をオーバーライドして、値をデコードする前にそのマーカーをチェックします。

以下は、`ListEncoder` と `ListDecoder` の実装に `null` サポートを追加する例です。

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

    // null 値を NULL として表現
    override fun encodeNull() = encodeValue("NULL")

    // 非 null 値を "!!" でマーク
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

    // 次の値が "NULL" かどうかをチェックして、次の null 許容値が null であるかを判定
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

この例では、エンコーダーは非 null 値の前に `!!` を書き込み、`null` 値に対しては `NULL` を書き込みます。
デコーダーはこれらのマーカーをチェックして、値をデコードするか `null` を返すかを決定します。

### コンパクトなバイナリフォーマットの作成 {id="create-a-compact-binary-format"}

バイナリフォーマットはデータをコンパクトに表現できるためによく使用され、保存または送信されるデータ量を最小限に抑えることが重要なシナリオに最適です。

カスタムバイナリフォーマットを使用すると、データが低レベルでどのようにシリアライズおよびデシリアライズされるかを制御できます。
これにより、パフォーマンスを最適化し、他のシステムとの互換性を維持するための柔軟性が得られます。

[`java.io.DataOutput`](https://docs.oracle.com/javase/8/docs/api/java/io/DataOutput.html) および [`java.io.DataInput`](https://docs.oracle.com/javase/8/docs/api/java/io/DataInput.html) インターフェースを実装することで、Kotlin シリアライゼーションでカスタムバイナリフォーマットを作成できます。

以下は、`DataOutput` と `DataInput` を使用して、[`ListEncoder`](#create-a-basic-encoder) と [`ListDecoder`](#create-a-basic-decoder) の実装をコンパクトなバイナリフォーマットに変換する例です。

1. 整数用の `encodeInt()` や文字列用の `encodeString()` など、各プリミティブ型に対応するエンコード関数をオーバーライドします。
   これらの型固有のエンコード関数は[ボクシングを回避](numbers.md#boxing-and-caching-numbers-on-the-jvm)し、各[プリミティブ型](serialization-serialize-builtin-types.md#basic-types)のバイナリ表現を定義できるようにします。
   この例では、値は `DataOutput` ストリームに直接エンコードされます。

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

2. `decodeInt()` や `decodeString()` など、各プリミティブ型のデコード関数を実装します。
   これにより、デコーダーは `DataInput` ストリームから直接値をデコードし、元のデータ構造を再構築できます。

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

3. これらのクラスを使用して、バイナリフォーマットで Kotlin オブジェクトをシリアライズおよびデシリアライズします。

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

        // プリミティブ値をバイナリ形式で直接エンコード
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

        // プリミティブ値をバイナリ形式から直接デコード
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
        // オブジェクトをカスタムバイナリフォーマットにエンコード
        val output = ByteArrayOutputStream()
        encodeTo(DataOutputStream(output), data)

        val bytes = output.toByteArray()
        println(bytes.toAsciiHexString())
        // {00}{15}kotlinx.serialization{00}{06}Kotlin

        // カスタムバイナリフォーマットからオブジェクトをデコード
        val input = ByteArrayInputStream(bytes)
        val obj = decodeFrom<Project>(DataInputStream(input))
        println(obj)
        // Project(name=kotlinx.serialization, language=Kotlin)
    }
    //sampleEnd
    ```
    {kotlin-runnable="true"}

この例では、カスタムフォーマットはキーやプロパティ名を含めずに、シリアライズされた値のみをバイナリ形式でエンコードし、それらを `Project` オブジェクトにデコードして復元します。
これにより、コンパクトな表現とバイナリエンコーディングに対する精密な制御が必要なユースケースに合わせて、フォーマットを簡単に適合させることができます。

### フォーマット固有の型のサポートを追加 {id="add-support-for-format-specific-types"}

カスタムフォーマットでは、標準的なプリミティブエンコード関数に直接マッピングされない型をサポートすることもできます。

このような型をサポートするには、エンコーダーの `encodeSerializableValue()` 関数とデコーダーの `decodeSerializableValue()` 関数をオーバーライドします。
これにより、フォーマット固有の型に対して[カスタムシリアライズロジックを定義](#create-custom-formats)できると同時に、非標準のデータ表現に対する効率的な処理と柔軟性を維持できます。

型を正しく検出するには、値の実行時型をチェックするのではなく、`serializer.descriptor` プロパティをその型のシリアライザーの記述子（descriptor）と比較します。
これにより、型がカスタムシリアライザーを使用している場合や、別の型と同じ基底表現を共有している場合でも、宣言されたシリアライズ形式が維持されます。

[コンパクトなバイナリフォーマットの例](#create-a-compact-binary-format)を拡張し、`ByteArray` 型専用のサポートを追加する例を見てみましょう。

1. エンコーダーが記述子によって型を検出できるように、フォーマット固有の型のシリアライザーを取得します。

    ```kotlin
    private val byteArraySerializer = serializer<ByteArray>()
    ```   

    > 同様の結果を得るために、組み込みの [`ByteArraySerializer()`](https://kotlinlang.org/api/kotlinx.serialization/kotlinx-serialization-core/kotlinx.serialization.builtins/-byte-array-serializer.html) 関数を使用することもできます。
    >
    {style="tip"}

2. エンコーダーの `encodeSerializableValue()` 関数をオーバーライドして、記述子によって `ByteArray` 値を検出し、専用のエンコードパスを使用するようにします。
   次に、バイト配列をエンコードするためのヘルパー関数を定義します。

   ```kotlin
   override fun <T> encodeSerializableValue(serializer: SerializationStrategy<T>, value: T) {
       if (serializer.descriptor == byteArraySerializer.descriptor)
           encodeByteArray(value as ByteArray)
       else
           super.encodeSerializableValue(serializer, value)
   }

   // ByteArray をそのサイズをコンパクトに表現してエンコード
   private fun encodeByteArray(bytes: ByteArray) {
       encodeCompactSize(bytes.size)
       output.write(bytes)
   }

   // 254 までのサイズを 1 バイトでエンコード
   private fun encodeCompactSize(value: Int) {
       if (value < 0xff) {
           output.writeByte(value)
       } else {
           output.writeByte(0xff)
           output.writeInt(value)
       }
   }
   ```

3. デコーダーの [`decodeSerializableValue()`](https://kotlinlang.org/api/kotlinx.serialization/kotlinx-serialization-core/kotlinx.serialization.encoding/-decoder/decode-serializable-value.html) 関数をオーバーライドして、記述子によって `ByteArray` 値を検出し、対応するコンパクトサイズフォーマットでそれらをデシリアライズします。

   ```kotlin
       @Suppress("UNCHECKED_CAST")
       override fun <T> decodeSerializableValue(deserializer: DeserializationStrategy<T>, previousValue: T?): T =
           if (deserializer.descriptor == byteArraySerializer.descriptor)
               decodeByteArray() as T
           else
               super.decodeSerializableValue(deserializer, previousValue)
   
       // ByteArray データをデコード
       private fun decodeByteArray(): ByteArray {
           val bytes = ByteArray(decodeCompactSize())
           input.readFully(bytes)
           return bytes
       }
   
       // コンパクトフォーマットを使用して効率的にサイズをデコード
       private fun decodeCompactSize(): Int {
           val byte = input.readByte().toInt() and 0xff
           if (byte < 0xff) return byte
           return input.readInt()
       }
   ```
   {collapsible="true" default-state="expanded" collapsed-title="override fun <T> decodeSerializableValue(deserializer: DeserializationStrategy<T>, previousValue: T?)"}

4. 組み込まれた `ByteArray` データを含むオブジェクトをシリアライズおよびデシリアライズします。

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

以下は、専用のエンコードおよびデコードパスを使用して `ByteArray` プロパティを持つクラスをシリアライズおよびデシリアライズする完全な例です。

```kotlin
import kotlinx.serialization.*
import kotlinx.serialization.Serializable
import kotlinx.serialization.descriptors.*
import kotlinx.serialization.modules.*
import kotlinx.serialization.encoding.*
import java.io.*

// 記述子によって ByteArray を検出するために使用されるシリアライザーを宣言
private val byteArraySerializer = serializer<ByteArray>()

@ExperimentalSerializationApi
class DataOutputEncoder(val output: DataOutput) : AbstractEncoder() {
    override val serializersModule: SerializersModule = EmptySerializersModule()

    // これらの関数はプリミティブ型をエンコード
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

    // 記述子によって ByteArray を検出し、専用のエンコードパスを使用
    override fun <T> encodeSerializableValue(serializer: SerializationStrategy<T>, value: T) {
        if (serializer.descriptor == byteArraySerializer.descriptor)
            encodeByteArray(value as ByteArray)
        else
            super.encodeSerializableValue(serializer, value)
    }

    // コンパクトなサイズ表現で ByteArray をエンコード
    private fun encodeByteArray(bytes: ByteArray) {
        encodeCompactSize(bytes.size)
        output.write(bytes)
    }

    // 254 までのサイズを 1 バイトでエンコード
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

    // これらの関数はプリミティブ型をデコード
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

    // 記述子によって ByteArray を検出し、専用のデコードパスを使用
    @Suppress("UNCHECKED_CAST")
    override fun <T> decodeSerializableValue(deserializer: DeserializationStrategy<T>, previousValue: T?): T =
        if (deserializer.descriptor == byteArraySerializer.descriptor)
            decodeByteArray() as T
        else
            super.decodeSerializableValue(deserializer, previousValue)

    // 配列サイズをデコードしてから、バイト配列の内容をデコード
    private fun decodeByteArray(): ByteArray {
        val bytes = ByteArray(decodeCompactSize())
        input.readFully(bytes)
        return bytes
    }

    // 1 バイトから 254 までのサイズをデコード
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

### フォーマット固有の `@Serializable` アノテーションの定義 {id="define-a-format-specific-serializable-annotation"}

[`@MetaSerializable`](https://kotlinlang.org/api/kotlinx.serialization/kotlinx-serialization-core/kotlinx.serialization/-meta-serializable/) アノテーションを使用すると、フォーマット固有の `@Serializable` アノテーションを定義できます。
クラスに `@Serializable` の代わりにフォーマット固有のアノテーションを付加することで、そのクラスをシリアライズ可能にし、生成されるシリアル記述子（serial descriptor）にアノテーションデータを含めることができます。

以下は、`@BinarySerializable` アノテーションを定義する例です。

```kotlin
import kotlinx.serialization.ExperimentalSerializationApi
import kotlinx.serialization.MetaSerializable

//sampleStart
@OptIn(ExperimentalSerializationApi::class)
// アノテーションが付加されたクラスをシリアライズ可能にするフォーマット固有のアノテーションを定義
@MetaSerializable
@Target(AnnotationTarget.CLASS)
annotation class BinarySerializable(val typeId: Int)

@BinarySerializable(typeId = 1)
data class Project(val name: String, val language: String)

@OptIn(ExperimentalSerializationApi::class)
fun main() {
    // シリアライゼーションプラグインは、@Serializable が付加されたクラスと同様に
    // Project のシリアライザーを生成する
    val descriptor = Project.serializer().descriptor

    // シリアル記述子内のアノテーションからクラス識別子を取得
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

## 次のステップ {id="what-s-next"}

* [CBOR フォーマット](serialization-cbor.md)でデータをシリアライズする方法を学びます。
* [ProtoBuf フォーマット](serialization-protobuf.md)での Protocol Buffers シリアライゼーションを探索します。