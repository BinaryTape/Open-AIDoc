[//]: # (title: ProtoBuf 格式)
<primary-label ref="experimental-general"/>

[Protocol Buffers](https://developers.google.com/protocol-buffers) (ProtoBuf) 是一種語言中立的二進制格式，通常使用獨立的 [`.proto` 檔案](#generate-a-protobuf-schema) 來定義協議架構。
它比 CBOR 更緊湊，因為它為欄位指派整數編號而不是名稱。

Kotlin serialization 使用 [proto2 語意](https://protobuf.dev/programming-guides/proto2/)，其中所有欄位都明確為 required 或 optional。

## 為 ProtoBuf 新增相依性 {id="add-dependencies-for-protobuf"}

要在你的專案中使用 ProtoBuf，請將 ProtoBuf 序列化程式庫相依性新增至你的組建檔案中：

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

## 使用 ProtoBuf 進行二進制序列化 {id="use-protobuf-for-binary-serialization"}

要使用 ProtoBuf 序列化物件，請使用 [`ProtoBuf`](https://kotlinlang.org/api/kotlinx.serialization/kotlinx-serialization-protobuf/kotlinx.serialization.protobuf/-proto-buf/) 類別搭配 [`.encodeToByteArray()`](https://kotlinlang.org/api/kotlinx.serialization/kotlinx-serialization-protobuf/kotlinx.serialization.protobuf/-proto-buf/encode-to-byte-array.html) 與 [`.decodeFromByteArray()`](https://kotlinlang.org/api/kotlinx.serialization/kotlinx-serialization-protobuf/kotlinx.serialization.protobuf/-proto-buf/decode-from-byte-array.html) 函式：

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
    // 將 Project 執行個體序列化為 ProtoBuf 位元組陣列
    val bytes = ProtoBuf.encodeToByteArray(data)

    // 以可讀的混合形式印數位元組陣列
    println(bytes.toAsciiHexString())
    // {0A}{15}kotlinx.serialization{12}{06}Kotlin

    // 將 ProtoBuf 位元組陣列還原序列化回物件
    val obj = ProtoBuf.decodeFromByteArray<Project>(bytes)
    println(obj)
    // Project(name=kotlinx.serialization, language=Kotlin)
}
```

在此範例中，輸出會將字串值印為可讀文字，其餘位元組則以十六進位形式顯示。
相同的位元組對應於以下 [ProtoBuf 十六進位表示法](https://protogen.marcgravell.com/decode) 中的值：

```text
Field #1: 0A String Length = 21, Hex = 15, UTF8 = "kotlinx.serialization"
Field #2: 12 String Length = 6, Hex = 06, UTF8 = "Kotlin"
```

## 為 ProtoBuf 序列化指派欄位編號 {id="assign-field-numbers-for-protobuf-serialization"}

預設情況下，ProtoBuf 會自動指派欄位編號。

為了隨著時間推移保持架構穩定，請使用 [`@ProtoNumber`](https://kotlinlang.org/api/kotlinx.serialization/kotlinx-serialization-protobuf/kotlinx.serialization.protobuf/-proto-number/) 註解明確指派欄位編號，無需額外的 `.proto` 檔案。
例如，`@ProtoNumber(1)` 為屬性指派欄位編號 1，因此 Kotlin serialization 的 ProtoBuf 格式在編碼與解碼期間會使用該編號，而不是自動指派。

如果你計劃重新排列屬性順序，明確指派欄位編號可保持架構穩定，並符合 Protobuf 的演進架構相容性規則。

範例如下：

```kotlin
import kotlinx.serialization.*
import kotlinx.serialization.protobuf.*

@OptIn(ExperimentalSerializationApi::class)
@Serializable
data class Project(
    // 為 name 屬性指派欄位編號 1
    @ProtoNumber(1)
    val name: String,

    // 為 language 屬性指派欄位編號 3
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

在此範例中，`name` 屬性使用欄位編號 1，其編碼標籤為 `0A`。
`language` 屬性使用欄位編號 3，其編碼標籤為 `1A`。

在 ProtoBuf 十六進位表示法中，輸出等同於以下內容：

```text
Field #1: 0A String Length = 21, Hex = 15, UTF8 = "kotlinx.serialization" (total 21 chars)
Field #3: 1A String Length = 6, Hex = 06, UTF8 = "Kotlin"
```

> 有關 Protobuf 欄位編號的詳細資訊，請參閱 [官方 Protobuf 語言指南](https://protobuf.dev/programming-guides/proto2/#assigning)。
>
{style="tip"}

## 在 ProtoBuf 中指定整數編碼 {id="specify-integer-encoding-in-protobuf"}

ProtoBuf 預設使用 [varint 編碼](https://protobuf.dev/programming-guides/encoding/#varints) 對整數屬性進行編碼。

若要對屬性使用不同的整數編碼，請套用帶有 [`ProtoIntegerType`](https://kotlinlang.org/api/kotlinx.serialization/kotlinx-serialization-protobuf/kotlinx.serialization.protobuf/-proto-integer-type/) 值的 [`@ProtoType`](https://kotlinlang.org/api/kotlinx.serialization/kotlinx-serialization-protobuf/kotlinx.serialization.protobuf/-proto-type/) 註解。
此註解會影響 `Byte`、`Short`、`Int`、`Long` 和 `Char` 屬性。

`ProtoIntegerType` 列舉支援三種選項：

* [`DEFAULT`](https://kotlinlang.org/api/kotlinx.serialization/kotlinx-serialization-protobuf/kotlinx.serialization.protobuf/-proto-integer-type/-d-e-f-a-u-l-t/) 選項使用 varint 編碼 (`intXX`)，針對較小的非負數進行了最佳化。例如，值 `1` 會被編碼為一個位元組 `01`。
* [`SIGNED`](https://kotlinlang.org/api/kotlinx.serialization/kotlinx-serialization-protobuf/kotlinx.serialization.protobuf/-proto-integer-type/-s-i-g-n-e-d/) 選項使用帶正負號的 ZigZag 編碼 (`sintXX`)，適合較小的帶正負號整數。例如，它將值 `-2` 編碼為一個位元組 `03`。
* [`FIXED`](https://kotlinlang.org/api/kotlinx.serialization/kotlinx-serialization-protobuf/kotlinx.serialization.protobuf/-proto-integer-type/-f-i-x-e-d/) 選項使用固定寬度編碼 (`fixedXX`)，一律使用固定數量的位元組。例如，它將值 `3` 編碼為四個位元組 `03 00 00 00`。

> 不支援 `uintXX` 和 `sfixedXX` Protocol Buffer 型別。
>
{style="note"}

以下範例展示了所有三種支援的選項：

```kotlin
import kotlinx.serialization.*
import kotlinx.serialization.protobuf.*

@OptIn(ExperimentalSerializationApi::class)
@Serializable
class Data(
    // 使用 DEFAULT 編碼，針對小型非負數進行了最佳化
    @ProtoType(ProtoIntegerType.DEFAULT)
    val a: Int,

    // 使用 SIGNED 編碼，針對小型帶正負號整數進行了最佳化
    @ProtoType(ProtoIntegerType.SIGNED)
    val b: Int,

    // 使用 FIXED 編碼，一律使用固定數量的位元組
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

## 將數值集合編碼為 packed 欄位 {id="encode-numeric-collections-as-packed-fields"}

在 ProtoBuf 中，packed 欄位透過將清單寫入為單一長度分隔項目，而不是為每個元素重複欄位標籤，從而更有效率地儲存重複的原生數值。

你可以使用 [`@ProtoPacked`](https://kotlinlang.org/api/kotlinx.serialization/kotlinx-serialization-protobuf/kotlinx.serialization.protobuf/-proto-packed/) 註解以此形式序列化除 Map 以外的集合型別。
Packed 編碼僅適用於重複的原生數值欄位，對於其他元素型別，該註解會被忽略。

根據 [Protobuf 編碼規格](https://developers.google.com/protocol-buffers/docs/encoding#packed)，語法剖析器同時接受 packed 和 unpacked 的重複數值欄位，因此解碼不依賴於是否存在 `@ProtoPacked`。

範例如下：

```kotlin
import kotlinx.serialization.*
import kotlinx.serialization.protobuf.*

@OptIn(ExperimentalSerializationApi::class)
@Serializable
data class DataPacked(
    // 對 values 清單使用 packed 編碼
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

## 表示 `oneof` 欄位 {id="represent-oneof-fields"}

[`oneof`](https://protobuf.dev/programming-guides/proto2/#oneof) 欄位定義了一組欄位，其中一次只能設定一個值。

在 Kotlin serialization 中，你可以使用[多型](serialization-polymorphism.md)型別來表示此結構。

考慮以下 ProtoBuf 訊息定義：

```text
message Data {
    required string name = 1;
    oneof phone {
        string home_phone = 2;
        string work_phone = 3;
    }
}
```

要在 Kotlin 中表示此訊息：

1. 建立一個 `sealed interface` 或 `abstract class` 來表示 `oneof` 宣告內的欄位：

    ```kotlin
    @Serializable
    sealed interface IPhoneType
    ```

2. 為整個訊息定義一個類別。新增一個 `name` 屬性並使用 `@ProtoNumber(1)` 對其進行註解。
新增一個多型 `IPhoneType` 的 `phone` 屬性，並使用 [`@ProtoOneOf`](https://kotlinlang.org/api/kotlinx.serialization/kotlinx-serialization-protobuf/kotlinx.serialization.protobuf/-proto-one-of/) 對其進行註解：

    ```kotlin
    @Serializable
    data class Data(
        @ProtoNumber(1)
        val name: String,
    
        @ProtoOneOf
        val phone: IPhoneType?,
    )
    ```

3. 對於 `oneof` 宣告中的每個欄位，建立一個具有對應該欄位的單一屬性的子類別。每個子類別可以是常規類別、資料類別或值類別：

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
   
4. 使用 `oneof` 宣告中的欄位編號，為每個子類別屬性加上 `@ProtoNumber` 註解：

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

以下是一個更詳細的範例，其中使用 `oneof` 來儲存住家電話或公司電話：

```kotlin
import kotlinx.serialization.*
import kotlinx.serialization.protobuf.*

// 表示 oneof 群組
@Serializable
sealed interface IPhoneType

// 表示 home_phone 欄位
@OptIn(ExperimentalSerializationApi::class)
@Serializable @JvmInline value class HomePhone(@ProtoNumber(2) val number: String): IPhoneType

// 將 work_phone 欄位表示為資料類別
@OptIn(ExperimentalSerializationApi::class)
@Serializable data class WorkPhone(@ProtoNumber(3) val number: String): IPhoneType

// 定義帶有 oneof 屬性的資料類別
@OptIn(ExperimentalSerializationApi::class)
@Serializable
data class Data(
    // 為 name 屬性指派欄位編號 1
    @ProtoNumber(1) val name: String,

    // 將多型屬性對應到 oneof 宣告
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

輸出顯示 ProtoBuf 在每條訊息中僅對 `oneof` 宣告中的一個欄位進行編碼：

* `0a03546f6d1203313233` 表示帶有 `home_phone` 的 `"Tom"`。
* `0a054a657272791a03373839` 表示帶有 `work_phone` 的 `"Jerry"`。

> 為避免潛在的欄位編號衝突或執行階段的 `IllegalArgumentException`，請將每個 `oneof` 型別階層結構僅對應到一個資料類別。
>
{style="note"}

如果你只需要還原序列化資料，也可以定義一個沒有 `@ProtoOneOf` 註解的類別。

例如：

```kotlin
@Serializable  
data class Data(  
    @ProtoNumber(1) val name: String,
    @ProtoNumber(2) val homeNumber: String? = null,  
    @ProtoNumber(3) val workNumber: String? = null,  
)  
```

這樣，你就可以在不使用密封階層的情況下還原序列化 `oneof` 欄位。

但是，它在序列化期間不會強制 `homeNumber` 和 `workNumber` 之間的互斥性。
如果兩個欄位都有值，序列化輸出可能與原始 `oneof` 架構不符，且另一個 ProtoBuf 語法剖析器可能只保留其讀取的最後一個欄位。

## 產生 ProtoBuf 架構 {id="generate-a-protobuf-schema"}

通常，使用 ProtoBuf 涉及使用 `.proto` 檔案和程式碼產生器來建立用於序列化和還原序列化的程式碼。
然而，透過 Kotlin serialization，你可以使用帶有 `@Serializable` 註解的 Kotlin 類別作為架構的來源，讓 `.proto` 檔案成為可選項目。

當涉及的所有程式碼都用 Kotlin 編寫時，此方法簡化了流程，但與其他語言的互通性通常仍需要 `.proto` 架構。

要產生此架構，請使用 [`ProtoBufSchemaGenerator`](https://kotlinlang.org/api/kotlinx.serialization/kotlinx-serialization-protobuf/kotlinx.serialization.protobuf.schema/-proto-buf-schema-generator/)。
它會從一個或多個 `SerialDescriptor` 執行個體產生與 Proto2 相容的架構。

這會為你提供一個可用於其他 ProtoBuf 工具的 `.proto` 架構。

以下是從 Kotlin 資料類別產生 `.proto` 架構的範例：

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

此程式碼會產生以下 `.proto` 架構：

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

> Kotlin 預設值在 `.proto` 檔案中無法表示，因此產生的架構會為具有預設值的屬性新增警告註解。
>
{style="note"}