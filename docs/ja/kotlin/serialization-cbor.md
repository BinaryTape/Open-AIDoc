[//]: # (title: CBOR フォーマット)
<primary-label ref="experimental-general"/>

Concise Binary Object Representation（[CBOR](https://datatracker.ietf.org/doc/html/rfc8949)）は、JSONデータモデルを拡張したコンパクトなバイナリフォーマットです。

## CBORの依存関係を追加する {id="add-dependencies-for-cbor"}

プロジェクトでCBORを使用するには、ビルドファイルにCBORシリアライゼーションライブラリの依存関係を追加します。

<tabs group="build-script">
<tab title="Gradle" group-key="gradle">

```kotlin
// build.gradle(.kts)
dependencies {
    implementation("org.jetbrains.kotlinx:kotlinx-serialization-cbor:%serializationVersion%")
}
```

</tab>

<tab title="Maven" group-key="maven">

```xml
<!-- pom.xml -->
<dependencies>
    <dependency>
        <groupId>org.jetbrains.kotlinx</groupId>
        <artifactId>kotlinx-serialization-cbor</artifactId>
        <version>%serializationVersion%</version>
    </dependency>
</dependencies>
```

</tab>
</tabs>

## バイナリシリアライゼーションにCBORを使用する {id="use-cbor-for-binary-serialization"}

[`Cbor`](https://kotlinlang.org/api/kotlinx.serialization/kotlinx-serialization-cbor/kotlinx.serialization.cbor/-cbor/) クラスは、以下の2つの関数を提供します。

* [`encodeToByteArray()`](https://kotlinlang.org/api/kotlinx.serialization/kotlinx-serialization-core/kotlinx.serialization/encode-to-byte-array.html) は、オブジェクトをバイト配列にシリアライズします。
* [`decodeFromByteArray()`](https://kotlinlang.org/api/kotlinx.serialization/kotlinx-serialization-core/kotlinx.serialization/decode-from-byte-array.html) は、バイト配列からオブジェクトをデシリアライズします。

以下は、`Project` オブジェクトをバイト配列にシリアライズし、その後元の形式にデシリアライズして戻す例です。

```kotlin
import kotlinx.serialization.*
import kotlinx.serialization.cbor.*

fun ByteArray.toAsciiHexString() = joinToString("") {
    // 印字可能なASCII範囲のバイトを文字に変換し、
    // その他のバイトを16進数値に変換します
    if (it in 32..126) it.toInt().toChar().toString() else
        "{${it.toUByte().toString(16).padStart(2, '0').uppercase()}}"
}

@Serializable
data class Project(val name: String, val language: String)

@OptIn(ExperimentalSerializationApi::class)
fun main() {
    val data = Project("kotlinx.serialization", "Kotlin")
    
    // オブジェクトをCBORバイト配列にシリアライズします
    val bytes = Cbor.encodeToByteArray(data)

    // バイト配列を人間が読める16進文字列に変換します
    println(bytes.toAsciiHexString())
    // {BF}dnameukotlinx.serializationhlanguagefKotlin{FF}
    
    // バイト配列をオブジェクトにデシリアライズします
    val obj = Cbor.decodeFromByteArray<Project>(bytes)
    println(obj)
    // Project(name=kotlinx.serialization, language=Kotlin)
}
```

この例では、エンコードされたバイトを読みやすい混合形式で出力します。印字可能なASCIIバイトは文字として表現され、印字不可能なバイトは16進数値として表現されます。

以下は、完全な [CBOR 16進表記（hex notation）](http://cbor.me/) による同じ出力です。

```none
Hex code                                             | CBOR type    | Description
-----------------------------------------------------|--------------|------------------------------------
BF                                                   | map(*)       | Start of a CBOR map
├── 64                                               | text(4)      | Length of the string
│   └── 6E616D65                                     | string       | The string "name"
├── 75                                               | text(21)     | Length of the string
│   └── 6B6F746C696E782E73657269616C697A6174696F6E   | string       | The string "kotlinx.serialization"
├── 68                                               | text(8)      | Length of the string
│   └── 6C616E6775616765                             | string       | The string "language"
├── 66                                               | text(6)      | Length of the string
│   └── 4B6F746C696E                                 | string       | The string "Kotlin"
└── FF                                               | primitive(*) | End of the CBOR map
```

## CBORで未知のキーを無視する {id="ignore-unknown-keys-in-cbor"}

CBORは、APIの進化に伴って新しいプロパティが追加される可能性がある[モノのインターネット（IoT: Internet of Things）](https://en.wikipedia.org/wiki/Internet_of_things)デバイスとの通信で一般的に使用されます。
デフォルトでは、デシリアライズ中に未知のキーに遭遇するとエラーになります。

[JSON](serialization-json-configuration.md#ignore-unknown-keys) と同様に、[`ignoreUnknownKeys`](https://kotlinlang.org/api/kotlinx.serialization/kotlinx-serialization-cbor/kotlinx.serialization.cbor/-cbor-builder/ignore-unknown-keys.html) プロパティを `true` に設定することで、デシリアライズ時にこれらを無視できます。

```kotlin
import kotlinx.serialization.*
import kotlinx.serialization.cbor.*

@Serializable
data class Project(val name: String)

@OptIn(ExperimentalSerializationApi::class)
fun main() {

    // デシリアライズ時に未知のキーを無視するCborインスタンスを作成します
    val format = Cbor { ignoreUnknownKeys = true }

    // 追加の未知の "language" キーを含むCBOR入力をデコードします
    val data = format.decodeFromHexString<Project>(
        "bf646e616d65756b6f746c696e782e73657269616c697a6174696f6e686c616e6775616765664b6f746c696eff"
    )
    println(data)
    // Project(name=kotlinx.serialization)
}
```

このCBOR入力では、以下のバイトが未知の `"language"` キーとその値を表しています。

* 未知のキー `"language"`:
    * `68`: キーの長さ
        * `6c616e6775616765`: キー本体
* 値 `"Kotlin"`:
    * `66`: 値の長さ
        * `4b6f746c696e`: 値本体

```none
Hex code                                             | CBOR type    | Description
-----------------------------------------------------|--------------|------------------------------------
BF                                                   | map(*)       | Start of a CBOR map
├── 64                                               | text(4)      | Length of the string
│   └── 6E616D65                                     | string       | The string "name"
├── 75                                               | text(21)     | Length of the string
│   └── 6B6F746C696E782E73657269616C697A6174696F6E   | string       | The string "kotlinx.serialization"
├── 68                                               | text(8)      | Length of the string
│   └── 6C616E6775616765                             | string       | The string "language"
├── 66                                               | text(6)      | Length of the string
│   └── 4B6F746C696E                                 | string       | The string "Kotlin"
└── FF                                               | primitive(*) | End of the CBOR map
```
{collapsible="true" collapsed-title="The full CBOR hex notation"}

## CBORデータエンコーディングのカスタマイズ {id="customize-cbor-data-encoding"}

[RFC 8949 Major Types](https://datatracker.ietf.org/doc/html/rfc8949#section-3.1) 仕様に従い、CBORは以下のデータ型をサポートしています。

* メジャータイプ 0: 符号なし整数（unsigned integer）
* メジャータイプ 1: 負の整数（negative integer）
* メジャータイプ 2: バイト文字列（byte string）
* メジャータイプ 3: テキスト文字列（text string）
* メジャータイプ 4: データ項目の配列（array of data items）
* メジャータイプ 5: データ項目のペアのマップ（map of pairs of data items）
* メジャータイプ 6: 他のメジャータイプのオプションのセマンティックタグ付け（optional semantic tagging of other major types）
* メジャータイプ 7: 浮動小数点数、内容を持たない単純データ型、および「break」停止コード

JSONとは異なり、CBORはユーザー定義クラスのインスタンスなど、構造化されたマップキーを持つマップをサポートしています。
しかし、[`jackson-dataformat-cbor`](https://github.com/FasterXML/jackson-dataformats-binary) などの一部のパーサーはこれらをサポートしていません。

> JSONにおける回避策については、[構造化されたマップキーを許可する](serialization-json-configuration.md#allow-structured-map-keys) を参照してください。
>
{style="tip"}

### `ByteArray` プロパティをバイト文字列としてエンコードする {id="encode-bytearray-properties-as-byte-strings"}

デフォルトのエンコーディングを使用する代わりにデータのCBOR表現をカスタマイズして、例えば外部スキーマで定義されたシリアライズ形式に合わせることができます。
場合によっては、これらのカスタマイズによってバイナリサイズを削減することもできます。

デフォルトでは、Kotlinの `ByteArray` 値はデータ項目の配列を表すメジャータイプ 4 としてエンコードされます。
`ByteArray` プロパティをバイト文字列であるメジャータイプ 2 としてエンコードするには、[`@ByteString`](https://kotlinlang.org/api/kotlinx.serialization/kotlinx-serialization-cbor/kotlinx.serialization.cbor/-byte-string/) アノテーションを使用します。

```kotlin
import kotlinx.serialization.*
import kotlinx.serialization.cbor.*

@Serializable
data class Data(
    // バイト配列をCBORのバイト文字列（メジャータイプ 2）としてエンコード
    @ByteString
    val type2: ByteArray,
    // バイト配列をCBORのメジャータイプ 4
    // （個々のデータ項目の配列）としてエンコード
    val type4: ByteArray
)

@OptIn(ExperimentalSerializationApi::class)
fun main() {
    // 2つのByteArrayフィールドを持つDataオブジェクトを作成
    val data = Data(byteArrayOf(1, 2, 3, 4), byteArrayOf(5, 6, 7, 8))

    // DataオブジェクトをCBORバイト配列にシリアライズ
    val bytes = Cbor.encodeToByteArray(data)

    println(bytes.toAsciiHexString())
    // {BF}etype2D{01}{02}{03}{04}etype4{9F}{05}{06}{07}{08}{FF}{FF}
    
    val obj = Cbor.decodeFromByteArray<Data>(bytes)
    println(obj)
    // Data(type2=[1, 2, 3, 4], type4=[5, 6, 7, 8])
}
```

この例では、プロパティが異なるCBORメジャータイプを使用しているため、各 `ByteArray` 値の前のバイトが異なります。

以下は、完全なCBOR 16進表記によるエンコードされたバイト配列です。

```none
Hex code               | CBOR type    | Description
-----------------------|--------------|-----------------------------------------
BF                     | map(*)       | Start of a CBOR map
├── 65                 | text(5)      | Length of the string
│   └── 7479706532     | string       | The property name "type2"
├── 44                 | bytes(4)     | Length of the byte string
│   └── 01020304       | byte string  | The byte string "\x01\x02\x03\x04"
├── 65                 | text(5)      | Length of the string
│   └── 7479706534     | string       | The property name "type4"
├── 9F                 | array(*)     | Start of a CBOR array
│   ├── 05             | unsigned(5)  | The unsigned integer 5
│   ├── 06             | unsigned(6)  | The unsigned integer 6
│   ├── 07             | unsigned(7)  | The unsigned integer 7
│   ├── 08             | unsigned(8)  | The unsigned integer 8
│   └── FF             | primitive(*) | End of the CBOR array
└── FF                 | primitive(*) | End of the CBOR map
```
{collapsible="true" collapsed-title="The full CBOR hex notation"}

各プロパティに `@ByteString` を付与することなく、すべての `ByteArray` 値をメジャータイプ 2 としてエンコードするには、[`alwaysUseByteString`](https://kotlinlang.org/api/kotlinx.serialization/kotlinx-serialization-cbor/kotlinx.serialization.cbor/-cbor-builder/always-use-byte-string.html) プロパティを `true` に設定します。

```kotlin
val format = Cbor {
    alwaysUseByteString = true
}
```

### クラスをCBOR配列としてエンコードする {id="encode-classes-as-cbor-arrays"}

デフォルトでは、クラスはメジャータイプ 5 に対応するCBORマップとしてシリアライズされます。
これは、クラスの各プロパティがキーと値のペアとして格納されることを意味します。

[`@CborArray`](https://kotlinlang.org/api/kotlinx.serialization/kotlinx-serialization-cbor/kotlinx.serialization.cbor/-cbor-array/) アノテーションを使用すると、クラスをCBOR配列（メジャータイプ 4）としてシリアライズできます。
これは、[RFC 9052](https://www.rfc-editor.org/rfc/rfc9052#section-2) でCBOR配列として定義されているCOSEメッセージ構造をエンコードする際に役立ちます。

以下に例を示します。

```kotlin
@Serializable
@CborArray
data class DataClass(
    val alg: Int,
    val kid: String?
)
 
Cbor.encodeToByteArray(DataClass(alg = -7, kid = null))
```

`@CborArray` アノテーションを付与すると、この例はCBOR配列としてエンコードされます：`0x8226f6`。
このアノテーションがない場合、同じクラスはCBORマップとしてエンコードされます：`0xa263616c6726636b6964f6`。

### CBORにおける確定長エンコーディングと不定長エンコーディング {id="definite-length-and-indefinite-length-encoding-in-cbor"}

CBORは、マップと配列に対して[2つのエンコーディング](https://datatracker.ietf.org/doc/html/rfc8949#section-3.2.2)（_確定長エンコーディング（definite-length encoding）_ と _不定長エンコーディング（indefinite-length encoding）_）をサポートしています。

デフォルトでは、Kotlinシリアライゼーションは不定長エンコーディングを使用します。
このエンコーディングでは、マップや配列の要素数は明示的にエンコードされません。代わりに、「break」停止コード（`0xFF`）がコレクションの終わりを示します。

確定長エンコーディングは終端バイトを省略し、マップや配列の先頭で要素数をエンコードします。

これら2つのモードを切り替えるには、[`useDefiniteLengthEncoding`](https://kotlinlang.org/api/kotlinx.serialization/kotlinx-serialization-cbor/kotlinx.serialization.cbor/-cbor-builder/use-definite-length-encoding.html) プロパティを使用します。

## CBORにおけるタグとラベル {id="tags-and-labels-in-cbor"}

CBORでは、プロパティや値に追加情報をエンコードする _タグ（tags）_ を定義できます。
これらのタグは、[`@KeyTags`](https://kotlinlang.org/api/kotlinx.serialization/kotlinx-serialization-cbor/kotlinx.serialization.cbor/-key-tags/) および [`@ValueTags`](https://kotlinlang.org/api/kotlinx.serialization/kotlinx-serialization-cbor/kotlinx.serialization.cbor/-value-tags/) アノテーションで指定できます。
`encodeKeyTags`、`encodeValueTags`、`verifyKeyTags`、および `verifyValueTags` プロパティによって、これらのタグのエンコードと検証を制御します。

> CBORでのタグ付けに関する詳細は、[RFC 8949 Tagging of Items](https://datatracker.ietf.org/doc/html/rfc8949#name-tagging-of-items) を参照してください。
>
{style="tip"}

また、[`@ObjectTags`](https://kotlinlang.org/api/kotlinx.serialization/kotlinx-serialization-cbor/kotlinx.serialization.cbor/-object-tags/) アノテーションを使用することで、クラスのすべてのインスタンスにタグを割り当てることもできます。

シリアライズ時、`@ObjectTags` はタグ付けされたオブジェクトのデータの直前にエンコードされます。
プロパティに値タグがあり、その型にオブジェクトタグがある場合、値タグはオブジェクトタグの前にエンコードされます。
`encodeObjectTags` および `verifyObjectTags` プロパティは、オブジェクトタグをエンコードおよび検証するかどうかを制御します。
値タグのみを検証し、オブジェクトタグを検証しない場合でも、デコーダーは追加のオブジェクトタグを持つデータをデシリアライズできます。

> よく知られたタグ（well-known tags）の一覧については、[`CborTag`](https://kotlinlang.org/api/kotlinx.serialization/kotlinx-serialization-cbor/kotlinx.serialization.cbor/-cbor-tag/) を参照してください。
>
{style="tip"}

CBORは任意の型のマップキーをサポートしています。
COSE（CBOR Object Signing and Encryption）では、これらのキーは文字列と数値に制限されており、_ラベル（labels）_ と呼ばれます。

文字列ラベルは [`@SerialName`](https://kotlinlang.org/api/kotlinx.serialization/kotlinx-serialization-core/kotlinx.serialization/-serial-name/) アノテーションで、数値ラベルは [`@CborLabel`](https://kotlinlang.org/api/kotlinx.serialization/kotlinx-serialization-cbor/kotlinx.serialization.cbor/-cbor-label/) アノテーションで割り当てることができます。
[`preferCborLabelsOverNames`](https://kotlinlang.org/api/kotlinx.serialization/kotlinx-serialization-cbor/kotlinx.serialization.cbor/-cbor-configuration/prefer-cbor-labels-over-names.html) プロパティを使用すると、両方が存在する場合にシリアル名（serial name）よりも数値ラベルを優先させることができます。
これを利用して、CBOR用にはコンパクトなラベルを維持しつつ、JSONへのシリアライズ時には読みやすい名前を維持することができます。

Kotlinシリアライゼーションは、COSEのエンコーディング要件に準拠した事前定義の [`Cbor.CoseCompliant`](https://kotlinlang.org/api/kotlinx.serialization/kotlinx-serialization-cbor/kotlinx.serialization.cbor/-cbor/-default/-cose-compliant.html) インスタンスも提供しています。
これは確定長エンコーディングを使用し、すべてのタグをエンコードおよび検証し、シリアル名よりも数値ラベルを優先します。

## カスタムCBOR固有シリアライザー {id="custom-cbor-specific-serializers"}

CBORエンコーダーおよびデコーダーは、[`CborEncoder`](https://kotlinlang.org/api/kotlinx.serialization/kotlinx-serialization-cbor/kotlinx.serialization.cbor/-cbor-encoder/) および [`CborDecoder`](https://kotlinlang.org/api/kotlinx.serialization/kotlinx-serialization-cbor/kotlinx.serialization.cbor/-cbor-decoder/) インターフェースを実装しています。

これらのインターフェースは汎用の `Encoder` および `Decoder` インターフェースを拡張しており、[`cbor`](https://kotlinlang.org/api/kotlinx.serialization/kotlinx-serialization-cbor/kotlinx.serialization.cbor/-cbor-encoder/cbor.html) プロパティを介してCBOR固有の設定へのアクセスを提供します。
カスタムシリアライザーはこのプロパティを使用して、現在の [`Cbor`](https://kotlinlang.org/api/kotlinx.serialization/kotlinx-serialization-cbor/kotlinx.serialization.cbor/-cbor/) インスタンスへのアクセス、埋め込みバイト配列の生成、ならびに `preferCborLabelsOverNames` や `useDefiniteLengthEncoding` などの現在の設定の読み取りを行うことができます。

カスタムシリアライザーの作成に関する詳細は、[カスタムシリアライザーの作成](serialization-custom-formats.md) を参照してください。