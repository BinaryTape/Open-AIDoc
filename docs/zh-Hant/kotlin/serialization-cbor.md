[//]: # (title: CBOR 格式)
<primary-label ref="experimental-general"/>

簡明二進位物件表示法（Concise Binary Object Representation，簡稱 [CBOR](https://datatracker.ietf.org/doc/html/rfc8949)）是一種緊湊的二進制格式，擴充了 JSON 資料模型。

## 為 CBOR 新增相依性 {id="add-dependencies-for-cbor"}

要在專案中使用 CBOR，請將 CBOR 序列化程式庫相依性新增至您的建置檔案中：

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

## 使用 CBOR 進行二進制序列化 {id="use-cbor-for-binary-serialization"}

[`Cbor`](https://kotlinlang.org/api/kotlinx.serialization/kotlinx-serialization-cbor/kotlinx.serialization.cbor/-cbor/) 類別提供兩個函式：

* [`encodeToByteArray()`](https://kotlinlang.org/api/kotlinx.serialization/kotlinx-serialization-core/kotlinx.serialization/encode-to-byte-array.html) 將物件序列化為位元組陣列。
* [`decodeFromByteArray()`](https://kotlinlang.org/api/kotlinx.serialization/kotlinx-serialization-core/kotlinx.serialization/decode-from-byte-array.html) 從位元組陣列反序列化為物件。

以下範例將 `Project` 物件序列化為位元組陣列，然後再反序列化回其原始形式：

```kotlin
import kotlinx.serialization.*
import kotlinx.serialization.cbor.*

fun ByteArray.toAsciiHexString() = joinToString("") {
    // Converts bytes in the printable ASCII range to characters
    // and other bytes to hex values
    if (it in 32..126) it.toInt().toChar().toString() else
        "{${it.toUByte().toString(16).padStart(2, '0').uppercase()}}"
}

@Serializable
data class Project(val name: String, val language: String)

@OptIn(ExperimentalSerializationApi::class)
fun main() {
    val data = Project("kotlinx.serialization", "Kotlin")
    
    // 將物件序列化為 CBOR 位元組陣列
    val bytes = Cbor.encodeToByteArray(data)

    // 將位元組陣列轉換為易於閱讀的十六進位字串
    println(bytes.toAsciiHexString())
    // {BF}dnameukotlinx.serializationhlanguagefKotlin{FF}
    
    // 將位元組陣列反序列化回物件
    val obj = Cbor.decodeFromByteArray<Project>(bytes)
    println(obj)
    // Project(name=kotlinx.serialization, language=Kotlin)
}
```

此範例以可讀的混合形式輸出編碼後的位元組。它將可列印的 ASCII 位元組表示為字元，並將不可列印的位元組表示為十六進位數值。

以下是相同輸出的完整 [CBOR 十六進位標記法](http://cbor.me/)：

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

## 在 CBOR 中忽略未知索引鍵 {id="ignore-unknown-keys-in-cbor"}

CBOR 常用於與[物聯網 (IoT)](https://en.wikipedia.org/wiki/Internet_of_things) 裝置的通訊，這些裝置可能會在 API 演進過程中新增屬性。
預設情況下，反序列化過程中遇到未知索引鍵會導致錯誤。

就像在 [JSON](serialization-json-configuration.md#ignore-unknown-keys) 中一樣，您可以將 [`ignoreUnknownKeys`](https://kotlinlang.org/api/kotlinx.serialization/kotlinx-serialization-cbor/kotlinx.serialization.cbor/-cbor-builder/ignore-unknown-keys.html) 屬性設定為 `true`，以在反序列化期間忽略它們：

```kotlin
import kotlinx.serialization.*
import kotlinx.serialization.cbor.*

@Serializable
data class Project(val name: String)

@OptIn(ExperimentalSerializationApi::class)
fun main() {

    // 建立一個在反序列化期間忽略未知索引鍵的 Cbor 執行個體
    val format = Cbor { ignoreUnknownKeys = true }

    // 解碼帶有額外未知 "language" 索引鍵的 CBOR 輸入
    val data = format.decodeFromHexString<Project>(
        "bf646e616d65756b6f746c696e782e73657269616c697a6174696f6e686c616e6775616765664b6f746c696eff"
    )
    println(data)
    // Project(name=kotlinx.serialization)
}
```

在此 CBOR 輸入中，以下位元組代表未知的 `"language"` 索引鍵及其值：

* 未知索引鍵 `"language"`：
    * `68`：索引鍵的長度
        * `6c616e6775616765`：索引鍵
* 值 `"Kotlin"`：
    * `66`：值的長度
        * `4b6f746c696e`：值

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
{collapsible="true" collapsed-title="完整的 CBOR 十六進位標記法"}

## 自訂 CBOR 資料編碼 {id="customize-cbor-data-encoding"}

根據 [RFC 8949 主要類型 (Major Types)](https://datatracker.ietf.org/doc/html/rfc8949#section-3.1) 規範，CBOR 支援以下資料型別：

* 主要類型 0：無號整數
* 主要類型 1：負整數
* 主要類型 2：位元組字串
* 主要類型 3：文字字串
* 主要類型 4：資料項目陣列
* 主要類型 5：成對資料項目的映射 (map)
* 主要類型 6：其他主要類型的可選語意標籤
* 主要類型 7：浮點數、無內容的簡單資料型別，以及「中斷 (break)」停止碼

與 JSON 不同，CBOR 支援具有結構化映射鍵 (structured map keys) 的 map，例如使用者定義類別的執行個體。
然而，某些剖析器（例如 [`jackson-dataformat-cbor`](https://github.com/FasterXML/jackson-dataformats-binary)）並不支援它們。

> 關於 JSON 的暫代解決方案，請參閱[允許結構化映射鍵](serialization-json-configuration.md#allow-structured-map-keys)。
>
{style="tip"}

### 將 `ByteArray` 屬性編碼為位元組字串 {id="encode-bytearray-properties-as-byte-strings"}

您可以自訂資料的 CBOR 表示法，而不是使用預設編碼，例如為了符合外部架構所定義的序列化形式。
在某些情況下，這些自訂設定還可以縮減二進制檔案大小。

預設情況下，Kotlin `ByteArray` 值會編碼為主要類型 4，表示資料項目陣列。
若要將 `ByteArray` 屬性編碼為主要類型 2（位元組字串），請使用 [`@ByteString`](https://kotlinlang.org/api/kotlinx.serialization/kotlinx-serialization-cbor/kotlinx.serialization.cbor/-byte-string/) 註解：

```kotlin
import kotlinx.serialization.*
import kotlinx.serialization.cbor.*

@Serializable
data class Data(
    // 將位元組陣列編碼為 CBOR 位元組字串（主要類型 2）
    @ByteString
    val type2: ByteArray,
    // 將位元組陣列編碼為 CBOR 主要類型 4：
    // 個別資料項目的陣列
    val type4: ByteArray
)

@OptIn(ExperimentalSerializationApi::class)
fun main() {
    // 建立具有兩個 ByteArray 欄位的 Data 物件
    val data = Data(byteArrayOf(1, 2, 3, 4), byteArrayOf(5, 6, 7, 8))

    // 將 Data 物件序列化為 CBOR 位元組陣列
    val bytes = Cbor.encodeToByteArray(data)

    println(bytes.toAsciiHexString())
    // {BF}etype2D{01}{02}{03}{04}etype4{9F}{05}{06}{07}{08}{FF}{FF}
    
    val obj = Cbor.decodeFromByteArray<Data>(bytes)
    println(obj)
    // Data(type2=[1, 2, 3, 4], type4=[5, 6, 7, 8])
}
```

在此範例中，每個 `ByteArray` 值之前的位元組不同，因為這些屬性使用了不同的 CBOR 主要類型。

以下是完整 CBOR 十六進位標記法下的已編碼位元組陣列：

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
{collapsible="true" collapsed-title="完整的 CBOR 十六進位標記法"}

若要將所有 `ByteArray` 值編碼為主要類型 2，而無需在每個屬性上加上 `@ByteString` 註解，請將 [`alwaysUseByteString`](https://kotlinlang.org/api/kotlinx.serialization/kotlinx-serialization-cbor/kotlinx.serialization.cbor/-cbor-builder/always-use-byte-string.html) 屬性設定為 `true`：

```kotlin
val format = Cbor {
    alwaysUseByteString = true
}
```

### 將類別編碼為 CBOR 陣列 {id="encode-classes-as-cbor-arrays"}

預設情況下，類別會序列化為 CBOR map，對應於主要類型 5。
這意味著類別的每個屬性都儲存為鍵值對。

您可以使用 [`@CborArray`](https://kotlinlang.org/api/kotlinx.serialization/kotlinx-serialization-cbor/kotlinx.serialization.cbor/-cbor-array/) 註解將類別序列化為 CBOR 陣列（主要類型 4）。
這對於編碼 COSE 訊息結構非常有用，因為 [RFC 9052](https://www.rfc-editor.org/rfc/rfc9052#section-2) 將其定義為 CBOR 陣列。

以下是一個範例：

```kotlin
@Serializable
@CborArray
data class DataClass(
    val alg: Int,
    val kid: String?
)
 
Cbor.encodeToByteArray(DataClass(alg = -7, kid = null))
```

使用 `@CborArray` 註解時，此範例會編碼為 CBOR 陣列：`0x8226f6`。
若沒有該註解，相同的類別將編碼為 CBOR map：`0xa263616c6726636b6964f6`。

### CBOR 中的定長與不定長編碼 {id="definite-length-and-indefinite-length-encoding-in-cbor"}

CBOR 對於 map 和陣列支援[兩種編碼方式](https://datatracker.ietf.org/doc/html/rfc8949#section-3.2.2)：*定長編碼 (definite-length encoding)* 與 *不定長編碼 (indefinite-length encoding)*。

預設情況下，Kotlin serialization 使用不定長編碼。
在此編碼中，map 或陣列中的元素數量不會明確編碼。相反地，會使用「中斷」停止碼 (`0xFF`) 來標記集合的結束。

定長編碼則會省略終止位元組，並在 map 或陣列的開頭編碼元素數量。

若要在這兩種模式之間切換，請使用 [`useDefiniteLengthEncoding`](https://kotlinlang.org/api/kotlinx.serialization/kotlinx-serialization-cbor/kotlinx.serialization.cbor/-cbor-builder/use-definite-length-encoding.html) 屬性。

## CBOR 中的標籤 (Tags) 與標號 (Labels) {id="tags-and-labels-in-cbor"}

CBOR 允許您定義*標籤 (tags)*，用來為屬性和值編碼額外資訊。
您可以使用 [`@KeyTags`](https://kotlinlang.org/api/kotlinx.serialization/kotlinx-serialization-cbor/kotlinx.serialization.cbor/-key-tags/) 與 [`@ValueTags`](https://kotlinlang.org/api/kotlinx.serialization/kotlinx-serialization-cbor/kotlinx.serialization.cbor/-value-tags/) 註解來指定這些標籤。
`encodeKeyTags`、`encodeValueTags`、`verifyKeyTags` 與 `verifyValueTags` 屬性控制著
這些標籤的編碼與驗證。

> 有關 CBOR 標籤的更多資訊，請參閱 [RFC 8949 項目的標籤化 (Tagging of Items)](https://datatracker.ietf.org/doc/html/rfc8949#name-tagging-of-items)。
>
{style="tip"}

您還可以使用 [`@ObjectTags`](https://kotlinlang.org/api/kotlinx.serialization/kotlinx-serialization-cbor/kotlinx.serialization.cbor/-object-tags/) 註解為類別的所有執行個體指派標籤。

序列化時，`@ObjectTags` 會直接編碼在已標記物件的資料之前。
如果屬性具有值標籤且其型別具有物件標籤，則值標籤會在物件標籤之前編碼。
`encodeObjectTags` 與 `verifyObjectTags` 屬性控制是否對物件標籤進行編碼和驗證。
如果您僅驗證值標籤而不驗證物件標籤，解碼器仍可反序列化帶有額外物件標籤的資料。

> 如需已知標籤的清單，請參閱 [`CborTag`](https://kotlinlang.org/api/kotlinx.serialization/kotlinx-serialization-cbor/kotlinx.serialization.cbor/-cbor-tag/)。
>
{style="tip"}

CBOR 支援任何型別的 map 鍵。
在 COSE（CBOR 物件簽署與加密）中，這些鍵僅限於字串與數字，並被稱為*標號 (labels)*。

您可以使用 [`@SerialName`](https://kotlinlang.org/api/kotlinx.serialization/kotlinx-serialization-core/kotlinx.serialization/-serial-name/) 註解指派字串標號，並使用 [`@CborLabel`](https://kotlinlang.org/api/kotlinx.serialization/kotlinx-serialization-cbor/kotlinx.serialization.cbor/-cbor-label/) 註解指派數值標號。
當兩者同時存在時，[`preferCborLabelsOverNames`](https://kotlinlang.org/api/kotlinx.serialization/kotlinx-serialization-cbor/kotlinx.serialization.cbor/-cbor-configuration/prefer-cbor-labels-over-names.html) 屬性允許優先使用數值標號而非序列名稱。
您可以使用它來為 CBOR 保留緊湊的標號，同時在序列化為 JSON 時仍保留易讀的名稱。

Kotlin serialization 還提供了一個預定義的 [`Cbor.CoseCompliant`](https://kotlinlang.org/api/kotlinx.serialization/kotlinx-serialization-cbor/kotlinx.serialization.cbor/-cbor/-default/-cose-compliant.html) 執行個體，該執行個體遵循 COSE 編碼需求。
它使用定長編碼、編碼並驗證所有標籤，且優先使用數值標號而非序列名稱。

## 自訂 CBOR 專用序列化器 {id="custom-cbor-specific-serializers"}

CBOR 編碼器和解碼器實作了 [`CborEncoder`](https://kotlinlang.org/api/kotlinx.serialization/kotlinx-serialization-cbor/kotlinx.serialization.cbor/-cbor-encoder/) 與 [`CborDecoder`](https://kotlinlang.org/api/kotlinx.serialization/kotlinx-serialization-cbor/kotlinx.serialization.cbor/-cbor-decoder/) 介面。

這些介面擴充了一般的 `Encoder` 與 `Decoder` 介面，透過 [`cbor`](https://kotlinlang.org/api/kotlinx.serialization/kotlinx-serialization-cbor/kotlinx.serialization.cbor/-cbor-encoder/cbor.html) 屬性提供對 CBOR 專用配置的存取。
自訂序列化器可以使用此屬性存取目前的 [`Cbor`](https://kotlinlang.org/api/kotlinx.serialization/kotlinx-serialization-cbor/kotlinx.serialization.cbor/-cbor/) 執行個體、產生內嵌的位元組陣列，並讀取目前設定，例如 `preferCborLabelsOverNames` 與 `useDefiniteLengthEncoding`。

有關建立自訂序列化器的更多資訊，請參閱[建立自訂序列化器](serialization-custom-formats.md)。