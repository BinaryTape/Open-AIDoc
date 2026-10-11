[//]: # (title: ProtoBufフォーマット)
<primary-label ref="experimental-general"/>

[Protocol Buffers](https://developers.google.com/protocol-buffers)（ProtoBuf）は言語中立なバイナリフォーマットであり、通常はプロトコルスキーマを定義するために個別の[`.proto`ファイル](#generate-a-protobuf-schema)を使用します。
名前の代わりにフィールドへ整数値を割り当てるため、CBORよりもコンパクトです。

Kotlinシリアライゼーションは[proto2のセマンティクス](https://protobuf.dev/programming-guides/proto2/)を使用し、すべてのフィールドが明示的に必須（required）または省略可能（optional）となります。

## ProtoBufの依存関係を追加する {id="add-dependencies-for-protobuf"}

プロジェクトでProtoBufを使用するには、ビルドファイルにProtoBufシリアライゼーションライブラリの依存関係を追加します。

<tabs group="build-script">
<tab title="Gradle" group-key="gradle">

```kotlin
// build.gradle(.kts)
dependencies {
    implementation("org.jetbrains.kotlinx:kotlinx-serialization-protobuf:%serializationVersion%")
}
```

</tab>

<tab title="Maven" group-key="maven">

```xml
<!-- pom.xml -->

<dependencies>
    <dependency>
        <groupId>org.jetbrains.kotlinx</groupId>
        <artifactId>kotlinx-serialization-protobuf</artifactId>
        <version>%serializationVersion%</version>
    </dependency>
</dependencies>
```

</tab>
</tabs>

## バイナリシリアライゼーションにProtoBufを使用する {id="use-protobuf-for-binary-serialization"}

ProtoBufでオブジェクトをシリアライズするには、[`ProtoBuf`](https://kotlinlang.org/api/kotlinx.serialization/kotlinx-serialization-protobuf/kotlinx.serialization.protobuf/-proto-buf/)クラスの[`.encodeToByteArray()`](https://kotlinlang.org/api/kotlinx.serialization/kotlinx-serialization-protobuf/kotlinx.serialization.protobuf/-proto-buf/encode-to-byte-array.html)関数および[`.decodeFromByteArray()`](https://kotlinlang.org/api/kotlinx.serialization/kotlinx-serialization-protobuf/kotlinx.serialization.protobuf/-proto-buf/decode-from-byte-array.html)関数を使用します。

```kotlin
import kotlinx.serialization.*
import kotlinx.serialization.protobuf.*

fun ByteArray.toAsciiHexString() = joinToString("") {
    if (it in 32..127) it.toInt().toChar().toString() else
        "{${it.toUByte().toString(16).padStart(2, '0').uppercase()}}"
}

@Serializable
data class Project(val name: String, val language: String)

@OptIn(ExperimentalSerializationApi::class)
fun main() {
    val data = Project("kotlinx.serialization", "Kotlin")
    // ProjectインスタンスをProtoBufのバイト配列にシリアライズします
    val bytes = ProtoBuf.encodeToByteArray(data)

    // 読みやすい混合形式でバイト配列を出力します
    println(bytes.toAsciiHexString())
    // {0A}{15}kotlinx.serialization{12}{06}Kotlin

    // ProtoBufのバイト配列をデシリアライズしてオブジェクトに戻します
    val obj = ProtoBuf.decodeFromByteArray<Project>(bytes)
    println(obj)
    // Project(name=kotlinx.serialization, language=Kotlin)
}
```

この例では、出力時に文字列値が読み取り可能なテキストとして出力され、残りのバイトは16進数形式で出力されます。
同じバイトは、[ProtoBufの16進表記（hex notation）](https://protogen.marcgravell.com/decode)では次の値に対応します。

```text
Field #1: 0A String Length = 21, Hex = 15, UTF8 = "kotlinx.serialization"
Field #2: 12 String Length = 6, Hex = 06, UTF8 = "Kotlin"
```

## ProtoBufシリアライゼーション用のフィールド番号を割り当てる {id="assign-field-numbers-for-protobuf-serialization"}

デフォルトでは、ProtoBufはフィールド番号を自動的に割り当てます。

長期にわたってスキーマの安定性を保つには、個別の`.proto`ファイルを用意しなくても、[`@ProtoNumber`](https://kotlinlang.org/api/kotlinx.serialization/kotlinx-serialization-protobuf/kotlinx.serialization.protobuf/-proto-number/)アノテーションを使用して明示的にフィールド番号を割り当てることができます。
例えば、`@ProtoNumber(1)`はプロパティにフィールド番号1を割り当てるため、KotlinシリアライゼーションのProtoBufフォーマットは自動割り当ての代わりにエンコードおよびデコード時にその番号を使用します。

プロパティの順序を変更する予定がある場合、フィールド番号を明示的に割り当てておくことでスキーマの安定性が保たれ、スキーマの進化に関するProtobufの互換性ルールにも適合します。

以下に例を示します。

```kotlin
import kotlinx.serialization.*
import kotlinx.serialization.protobuf.*

@OptIn(ExperimentalSerializationApi::class)
@Serializable
data class Project(
    // nameプロパティにフィールド番号1を割り当てます
    @ProtoNumber(1)
    val name: String,

    // languageプロパティにフィールド番号3を割り当てます
    @ProtoNumber(3)
    val language: String
)

@OptIn(ExperimentalSerializationApi::class)
fun main() {
    val data = Project("kotlinx.serialization", "Kotlin") 
    val bytes = ProtoBuf.encodeToByteArray(data)   

    println(bytes.toAsciiHexString())
    // {0A}{15}kotlinx.serialization{1A}{06}Kotlin

    val obj = ProtoBuf.decodeFromByteArray<Project>(bytes)

    println(obj)
    // Project(name=kotlinx.serialization, language=Kotlin)
}
```

この例では、`name`プロパティはフィールド番号1を使用し、そのエンコードされたタグは`0A`です。
`language`プロパティはフィールド番号3を使用し、そのエンコードされたタグは`1A`です。

ProtoBufの16進表記では、出力は以下と同等になります。

```text
Field #1: 0A String Length = 21, Hex = 15, UTF8 = "kotlinx.serialization" (total 21 chars)
Field #3: 1A String Length = 6, Hex = 06, UTF8 = "Kotlin"
```

> Protobufのフィールド番号の詳細については、[公式Protobuf言語ガイド](https://protobuf.dev/programming-guides/proto2/#assigning)を参照してください。
>
{style="tip"}

## ProtoBufでの整数エンコーディングを指定する {id="specify-integer-encoding-in-protobuf"}

ProtoBufは、デフォルトで[varintエンコーディング](https://protobuf.dev/programming-guides/encoding/#varints)を使用して整数プロパティをエンコードします。

プロパティに対して異なる整数エンコーディングを使用するには、[`@ProtoType`](https://kotlinlang.org/api/kotlinx.serialization/kotlinx-serialization-protobuf/kotlinx.serialization.protobuf/-proto-type/)アノテーションに[`ProtoIntegerType`](https://kotlinlang.org/api/kotlinx.serialization/kotlinx-serialization-protobuf/kotlinx.serialization.protobuf/-proto-integer-type/)の値を指定して適用します。
このアノテーションは、`Byte`、`Short`、`Int`、`Long`、および`Char`プロパティに影響します。

`ProtoIntegerType` enumは3つのオプションをサポートしています。

* [`DEFAULT`](https://kotlinlang.org/api/kotlinx.serialization/kotlinx-serialization-protobuf/kotlinx.serialization.protobuf/-proto-integer-type/-d-e-f-a-u-l-t/)オプションは、小さな非負数向けに最適化されたvarintエンコーディング（`intXX`）を使用します。例えば、値`1`は1バイトとして`01`にエンコードされます。
* [`SIGNED`](https://kotlinlang.org/api/kotlinx.serialization/kotlinx-serialization-protobuf/kotlinx.serialization.protobuf/-proto-integer-type/-s-i-g-n-e-d/)オプションは、符号付きZigZagエンコーディング（`sintXX`）を使用し、小さな符号付き整数に適しています。例えば、値`-2`は1バイトとして`03`にエンコードされます。
* [`FIXED`](https://kotlinlang.org/api/kotlinx.serialization/kotlinx-serialization-protobuf/kotlinx.serialization.protobuf/-proto-integer-type/-f-i-x-e-d/)オプションは、常に固定バイト数を使用する固定幅エンコーディング（`fixedXX`）を使用します。例えば、値`3`は4バイトとして`03 00 00 00`にエンコードされます。

> `uintXX`および`sfixedXX`のProtocol Buffer型はサポートされていません。
>
{style="note"}

以下の例は、サポートされている3つのオプションをすべて示しています。

```kotlin
import kotlinx.serialization.*
import kotlinx.serialization.protobuf.*

@OptIn(ExperimentalSerializationApi::class)
@Serializable
class Data(
    // DEFAULTエンコーディングを使用。小さな非負数向けに最適化
    @ProtoType(ProtoIntegerType.DEFAULT)
    val a: Int,

    // SIGNEDエンコーディングを使用。小さな符号付き整数向けに最適化
    @ProtoType(ProtoIntegerType.SIGNED)
    val b: Int,

    // FIXEDエンコーディングを使用。常に固定バイト数を使用
    @ProtoType(ProtoIntegerType.FIXED)
    val c: Int
)

@OptIn(ExperimentalSerializationApi::class)
fun main() {
    val data = Data(1, -2, 3) 
    println(ProtoBuf.encodeToByteArray(data).toAsciiHexString())
    // {08}{01}{10}{03}{1D}{03}{00}{00}{00}
}
```

## 数値コレクションをパックド（packed）フィールドとしてエンコードする {id="encode-numeric-collections-as-packed-fields"}

ProtoBufでは、パックドフィールドを使用すると、要素ごとにフィールドタグを繰り返す代わりにリストを単一の長さ区切りエントリとして書き込むことで、繰り返されるプリミティブ数値（repeated primitive numeric）をより効率的に格納できます。

[`@ProtoPacked`](https://kotlinlang.org/api/kotlinx.serialization/kotlinx-serialization-protobuf/kotlinx.serialization.protobuf/-proto-packed/)アノテーションを使用すると、マップを除くコレクション型をこの形式でシリアライズできます。
パックドエンコーディングは繰り返されるプリミティブ数値フィールドにのみ適用され、他の要素型ではアノテーションが無視されます。

[Protobufエンコーディング仕様](https://developers.google.com/protocol-buffers/docs/encoding#packed)によると、パーサーはパック形式と非パック形式の両方の繰り返し数値フィールドを受け入れるため、デコード結果は`@ProtoPacked`の有無に依存しません。

以下に例を示します。

```kotlin
import kotlinx.serialization.*
import kotlinx.serialization.protobuf.*

@OptIn(ExperimentalSerializationApi::class)
@Serializable
data class DataPacked(
    // valuesリストにパックドエンコーディングを使用します
    @ProtoPacked
    val values: List<Int>
)

@Serializable
data class DataRepeated(
    val values: List<Int>
)

@OptIn(ExperimentalSerializationApi::class)
fun main() {
    val packed = ProtoBuf.encodeToByteArray(
        DataPacked.serializer(),
        DataPacked(listOf(1, 2, 3))
    )
    println(packed.toAsciiHexString())
    // {0A}{03}{01}{02}{03}

    val repeated = ProtoBuf.encodeToByteArray(
        DataRepeated.serializer(),
        DataRepeated(listOf(1, 2, 3))
    )
    println(repeated.toAsciiHexString())
    // {08}{01}{08}{02}{08}{03}

    println(ProtoBuf.decodeFromByteArray(DataRepeated.serializer(), packed))
    // DataRepeated(values=[1, 2, 3])

    println(ProtoBuf.decodeFromByteArray(DataPacked.serializer(), repeated))
    // DataPacked(values=[1, 2, 3])
}
```

## `oneof`フィールドを表現する {id="represent-oneof-fields"}

[`oneof`](https://protobuf.dev/programming-guides/proto2/#oneof)フィールドは、一度に1つの値のみを設定できるフィールドのグループを定義します。

Kotlinシリアライゼーションでは、この構造を[ポリモーフィック（多相的）](serialization-polymorphism.md)な型で表現できます。

次のProtoBufメッセージ定義を考えてみます。

```text
message Data {
    required string name = 1;
    oneof phone {
        string home_phone = 2;
        string work_phone = 3;
    }
}
```

このメッセージをKotlinで表現するには、以下の手順を行います。

1. `oneof`宣言内のフィールドを表現するための`sealed interface`または`abstract class`を作成します。

    ```kotlin
    @Serializable
    sealed interface IPhoneType
    ```

2. メッセージ全体を表すクラスを定義します。`name`プロパティを追加して`@ProtoNumber(1)`を付与します。
ポリモーフィックな`IPhoneType`型の`phone`プロパティを追加し、[`@ProtoOneOf`](https://kotlinlang.org/api/kotlinx.serialization/kotlinx-serialization-protobuf/kotlinx.serialization.protobuf/-proto-one-of/)を付与します。

    ```kotlin
    @Serializable
    data class Data(
        @ProtoNumber(1)
        val name: String,
    
        @ProtoOneOf
        val phone: IPhoneType?,
    )
    ```

3. `oneof`宣言内の各フィールドに対して、そのフィールドに対応する単一のプロパティを持つサブクラスを作成します。各サブクラスは通常のクラス、データクラス、または値クラス（value class）にできます。

    ```kotlin
    @Serializable
    @JvmInline
    value class HomePhone(
        val number: String
    ) : IPhoneType
    
    @Serializable
    data class WorkPhone(
        val number: String
    ) : IPhoneType
    ```
   
4. 各サブクラスのプロパティに、`oneof`宣言のフィールド番号を使用して`@ProtoNumber`を付与します。

    ```kotlin
    @Serializable
    @JvmInline
    value class HomePhone(
        @ProtoNumber(2) val number: String
    ) : IPhoneType
    
    @Serializable
    data class WorkPhone(
        @ProtoNumber(3) val number: String
    ) : IPhoneType
    ```

以下は、`oneof`を使用して自宅の電話番号または職場の電話番号のいずれかを格納する詳細な例です。

```kotlin
import kotlinx.serialization.*
import kotlinx.serialization.protobuf.*

// oneofグループを表現
@Serializable
sealed interface IPhoneType

// home_phoneフィールドを表現
@OptIn(ExperimentalSerializationApi::class)
@Serializable @JvmInline value class HomePhone(@ProtoNumber(2) val number: String): IPhoneType

// work_phoneフィールドをデータクラスとして表現
@OptIn(ExperimentalSerializationApi::class)
@Serializable data class WorkPhone(@ProtoNumber(3) val number: String): IPhoneType

// oneofプロパティを持つデータクラスを定義
@OptIn(ExperimentalSerializationApi::class)
@Serializable
data class Data(
    // nameプロパティにフィールド番号1を割り当て
    @ProtoNumber(1) val name: String,

    // ポリモーフィックなプロパティをoneof宣言にマッピング
    @ProtoOneOf val phone: IPhoneType?,
)

@OptIn(ExperimentalSerializationApi::class)
fun main() {
    val dataTom = Data("Tom", HomePhone("123"))
    val stringTom = ProtoBuf.encodeToHexString(dataTom)
    val dataJerry = Data("Jerry", WorkPhone("789"))
    val stringJerry = ProtoBuf.encodeToHexString(dataJerry)

    println(stringTom)
    // 0a03546f6d1203313233

    println(stringJerry)
    // 0a054a657272791a03373839
  
    println(ProtoBuf.decodeFromHexString<Data>(stringTom))
    // Data(name=Tom, phone=HomePhone(number=123))

    println(ProtoBuf.decodeFromHexString<Data>(stringJerry))
    // Data(name=Jerry, phone=WorkPhone(number=789))
}
```

出力結果から、ProtoBufが各メッセージにおいて`oneof`宣言から1つのフィールドのみをエンコードしていることがわかります。

* `0a03546f6d1203313233`は`home_phone`を持つ`"Tom"`を表します。
* `0a054a657272791a03373839`は`work_phone`を持つ`"Jerry"`を表します。

> 潜在的なフィールド番号の競合や実行時の`IllegalArgumentException`を防ぐため、各`oneof`型階層は1つのデータクラスにのみマッピングしてください。
>
{style="note"}

データのデシリアライズのみが必要な場合は、`@ProtoOneOf`アノテーションを使用せずにクラスを定義することもできます。

例:

```kotlin
@Serializable  
data class Data(  
    @ProtoNumber(1) val name: String,
    @ProtoNumber(2) val homeNumber: String? = null,  
    @ProtoNumber(3) val workNumber: String? = null,  
)  
```

この方法を用いれば、sealed階層を使用せずに`oneof`フィールドをデシリアライズできます。

ただし、シリアライズ時に`homeNumber`と`workNumber`の排他性は強制されません。
両方のフィールドに値がある場合、シリアライズされた出力は元の`oneof`スキーマと一致しない可能性があり、他のProtoBufパーサーでは最後に読み取られたフィールドのみが保持される可能性があります。

## ProtoBufスキーマを生成する {id="generate-a-protobuf-schema"}

通常、ProtoBufの作業では`.proto`ファイルとコードジェネレータを使用して、シリアライゼーションおよびデシリアライゼーション用のコードを作成します。
しかし、Kotlinシリアライゼーションでは、`@Serializable`が付与されたKotlinクラスをスキーマのソースとして使用できるため、`.proto`ファイルは任意（オプション）となります。

関連するすべてのコードがKotlinで書かれている場合、このアプローチによりプロセスが簡素化されますが、他の言語との相互運用性には依然として`.proto`スキーマが必要になることがよくあります。

このスキーマを生成するには、[`ProtoBufSchemaGenerator`](https://kotlinlang.org/api/kotlinx.serialization/kotlinx-serialization-protobuf/kotlinx.serialization.protobuf.schema/-proto-buf-schema-generator/)を使用します。
これは、1つ以上の`SerialDescriptor`インスタンスからProto2互換のスキーマを生成します。

これにより、他のProtoBufツールで使用できる`.proto`スキーマが得られます。

以下は、Kotlinのデータクラスから`.proto`スキーマを生成する例です。

```kotlin
import kotlinx.serialization.*
import kotlinx.serialization.protobuf.*
import kotlinx.serialization.protobuf.schema.ProtoBufSchemaGenerator

@Serializable
data class SampleData(
    val amount: Long,
    val description: String?,
    val department: String = "QA"
)

@OptIn(ExperimentalSerializationApi::class)
fun main() {
    val descriptors = listOf(SampleData.serializer().descriptor)
    val schemas = ProtoBufSchemaGenerator.generateSchemaText(descriptors)
    println(schemas)
}
```

このコードにより、以下の`.proto`スキーマが生成されます。

```text
syntax = "proto2";

// serial name 'example.exampleFormats09.SampleData'
message SampleData {
  required int64 amount = 1;
  optional string description = 2;
  // WARNING: a default value decoded when value is missing
  optional string department = 3;
}
```

> Kotlinのデフォルト値は`.proto`ファイルでは表現されないため、生成されたスキーマではデフォルト値を持つプロパティに対して警告コメントが追加されます。
>
{style="note"}