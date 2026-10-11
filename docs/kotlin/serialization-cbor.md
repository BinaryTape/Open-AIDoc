[//]: # (title: CBOR 格式)
<primary-label ref="experimental-general"/>

简明二进制对象表示（Concise Binary Object Representation，简称 [CBOR](https://datatracker.ietf.org/doc/html/rfc8949)）是一种紧凑的二进制格式，它扩展了 JSON 数据模型。

## 为 CBOR 添加依赖项 {id="add-dependencies-for-cbor"}

要在项目中使用 CBOR，请在构建文件中添加 CBOR 序列化库依赖项：

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

## 使用 CBOR 进行二进制序列化 {id="use-cbor-for-binary-serialization"}

[`Cbor`](https://kotlinlang.org/api/kotlinx.serialization/kotlinx-serialization-cbor/kotlinx.serialization.cbor/-cbor/) 类提供了两个函数：

* [`encodeToByteArray()`](https://kotlinlang.org/api/kotlinx.serialization/kotlinx-serialization-core/kotlinx.serialization/encode-to-byte-array.html) 将对象序列化为字节数组。
* [`decodeFromByteArray()`](https://kotlinlang.org/api/kotlinx.serialization/kotlinx-serialization-core/kotlinx.serialization/decode-from-byte-array.html) 从字节数组反序列化为对象。

以下是一个示例，其中 `Project` 对象被序列化为字节数组，然后反序列化恢复为其原始形式：

```kotlin
import kotlinx.serialization.*
import kotlinx.serialization.cbor.*

fun ByteArray.toAsciiHexString() = joinToString("") {
    // 将可打印 ASCII 范围内的字节转换为字符，
    // 将其他字节转换为十六进制值
    if (it in 32..126) it.toInt().toChar().toString() else
        "{${it.toUByte().toString(16).padStart(2, '0').uppercase()}}"
}

@Serializable
data class Project(val name: String, val language: String)

@OptIn(ExperimentalSerializationApi::class)
fun main() {
    val data = Project("kotlinx.serialization", "Kotlin")
    
    // 将对象序列化为 CBOR 字节数组
    val bytes = Cbor.encodeToByteArray(data)

    // 将字节数组转换为人类可读的十六进制字符串
    println(bytes.toAsciiHexString())
    // {BF}dnameukotlinx.serializationhlanguagefKotlin{FF}
    
    // 将字节数组反序列化回对象
    val obj = Cbor.decodeFromByteArray<Project>(bytes)
    println(obj)
    // Project(name=kotlinx.serialization, language=Kotlin)
}
```

该示例以可读的混合形式输出编码后的字节。它将可打印的 ASCII 字节表示为字符，将不可打印的字节表示为十六进制值。

以下是完整的 [CBOR 十六进制表示法 (CBOR hex notation)](http://cbor.me/) 的相同输出：

```none
十六进制代码                                          | CBOR 类型     | 描述
-----------------------------------------------------|--------------|------------------------------------
BF                                                   | map(*)       | CBOR map 的开始
├── 64                                               | text(4)      | 字符串长度
│   └── 6E616D65                                     | string       | 字符串 "name"
├── 75                                               | text(21)     | 字符串长度
│   └── 6B6F746C696E782E73657269616C697A6174696F6E   | string       | 字符串 "kotlinx.serialization"
├── 68                                               | text(8)      | 字符串长度
│   └── 6C616E6775616765                             | string       | 字符串 "language"
├── 66                                               | text(6)      | 字符串长度
│   └── 4B6F746C696E                                 | string       | 字符串 "Kotlin"
└── FF                                               | primitive(*) | CBOR map 的结束
```

## 在 CBOR 中忽略未知键 {id="ignore-unknown-keys-in-cbor"}

CBOR 通常用于与[物联网 (IoT)](https://en.wikipedia.org/wiki/Internet_of_things) 设备进行通信，在此类场景中，随着 API 的演进可能会添加新的属性。
默认情况下，在反序列化过程中遇到未知键会导致错误。

就像在 [JSON](serialization-json-configuration.md#ignore-unknown-keys) 中一样，你可以将 [`ignoreUnknownKeys`](https://kotlinlang.org/api/kotlinx.serialization/kotlinx-serialization-cbor/kotlinx.serialization.cbor/-cbor-builder/ignore-unknown-keys.html) 属性设置为 `true`，以在反序列化期间忽略它们：

```kotlin
import kotlinx.serialization.*
import kotlinx.serialization.cbor.*

@Serializable
data class Project(val name: String)

@OptIn(ExperimentalSerializationApi::class)
fun main() {

    // 创建一个在反序列化期间忽略未知键的 Cbor 实例
    val format = Cbor { ignoreUnknownKeys = true }

    // 解码带有额外未知 "language" 键的 CBOR 输入
    val data = format.decodeFromHexString<Project>(
        "bf646e616d65756b6f746c696e782e73657269616c697a6174696f6e686c616e6775616765664b6f746c696eff"
    )
    println(data)
    // Project(name=kotlinx.serialization)
}
```

在此 CBOR 输入中，以下字节表示未知的 `"language"` 键及其对应的值：

* 未知键 `"language"`：
    * `68`：键的长度
        * `6c616e6775616765`：键的内容
* 值 `"Kotlin"`：
    * `66`：值的长度
        * `4b6f746c696e`：值的内容

```none
十六进制代码                                          | CBOR 类型     | 描述
-----------------------------------------------------|--------------|------------------------------------
BF                                                   | map(*)       | CBOR map 的开始
├── 64                                               | text(4)      | 字符串长度
│   └── 6E616D65                                     | string       | 字符串 "name"
├── 75                                               | text(21)     | 字符串长度
│   └── 6B6F746C696E782E73657269616C697A6174696F6E   | string       | 字符串 "kotlinx.serialization"
├── 68                                               | text(8)      | 字符串长度
│   └── 6C616E6775616765                             | string       | 字符串 "language"
├── 66                                               | text(6)      | 字符串长度
│   └── 4B6F746C696E                                 | string       | 字符串 "Kotlin"
└── FF                                               | primitive(*) | CBOR map 的结束
```
{collapsible="true" collapsed-title="完整的 CBOR 十六进制表示法"}

## 自定义 CBOR 数据编码 {id="customize-cbor-data-encoding"}

根据 [RFC 8949 主要类型 (Major Types)](https://datatracker.ietf.org/doc/html/rfc8949#section-3.1) 规范，CBOR 支持以下数据类型：

* 主要类型 0：无符号整数
* 主要类型 1：负整数
* 主要类型 2：字节字符串 (byte string)
* 主要类型 3：文本字符串 (text string)
* 主要类型 4：数据项数组 (array)
* 主要类型 5：数据项键值对映射 (map)
* 主要类型 6：对其他主要类型的可选语义标记 (semantic tagging)
* 主要类型 7：浮点数、无内容简单数据类型以及 "break" 停止代码

与 JSON 不同，CBOR 支持带有结构化 map 键的映射，例如用户定义类的实例。
但是，某些解析器（如 [`jackson-dataformat-cbor`](https://github.com/FasterXML/jackson-dataformats-binary)）不支持它们。

> 有关 JSON 的替代解决方案，请参阅[允许结构化 map 键](serialization-json-configuration.md#allow-structured-map-keys)。
>
{style="tip"}

### 将 `ByteArray` 属性编码为字节字符串 {id="encode-bytearray-properties-as-byte-strings"}

你可以自定义数据的 CBOR 表示形式以替代默认编码，例如，为了匹配外部架构定义的序列化形式。
在某些情况下，这些自定义设置还可以减小二进制体积。

默认情况下，Kotlin 的 `ByteArray` 值会被编码为主要类型 4，这表示一个数据项数组。
若要将 `ByteArray` 属性编码为主要类型 2（字节字符串），请使用 [`@ByteString`](https://kotlinlang.org/api/kotlinx.serialization/kotlinx-serialization-cbor/kotlinx.serialization.cbor/-byte-string/) 注解：

```kotlin
import kotlinx.serialization.*
import kotlinx.serialization.cbor.*

@Serializable
data class Data(
    // 将字节数组编码为 CBOR 字节字符串（主要类型 2）
    @ByteString
    val type2: ByteArray,
    // 将字节数组编码为 CBOR 主要类型 4：
    // 单独数据项的数组
    val type4: ByteArray
)

@OptIn(ExperimentalSerializationApi::class)
fun main() {
    // 创建一个包含两个 ByteArray 字段的 Data 对象
    val data = Data(byteArrayOf(1, 2, 3, 4), byteArrayOf(5, 6, 7, 8))

    // 将 Data 对象序列化为 CBOR 字节数组
    val bytes = Cbor.encodeToByteArray(data)

    println(bytes.toAsciiHexString())
    // {BF}etype2D{01}{02}{03}{04}etype4{9F}{05}{06}{07}{08}{FF}{FF}
    
    val obj = Cbor.decodeFromByteArray<Data>(bytes)
    println(obj)
    // Data(type2=[1, 2, 3, 4], type4=[5, 6, 7, 8])
}
```

在此示例中，每个 `ByteArray` 值之前的字节不同，因为这些属性使用了不同的 CBOR 主要类型。

以下是完整的 CBOR 十六进制表示法中的编码字节数组：

```none
十六进制代码            | CBOR 类型     | 描述
-----------------------|--------------|-----------------------------------------
BF                     | map(*)       | CBOR map 的开始
├── 65                 | text(5)      | 字符串长度
│   └── 7479706532     | string       | 属性名称 "type2"
├── 44                 | bytes(4)     | 字节字符串长度
│   └── 01020304       | byte string  | 字节字符串 "\x01\x02\x03\x04"
├── 65                 | text(5)      | 字符串长度
│   └── 7479706534     | string       | 属性名称 "type4"
├── 9F                 | array(*)     | CBOR array 的开始
│   ├── 05             | unsigned(5)  | 无符号整数 5
│   ├── 06             | unsigned(6)  | 无符号整数 6
│   ├── 07             | unsigned(7)  | 无符号整数 7
│   ├── 08             | unsigned(8)  | 无符号整数 8
│   └── FF             | primitive(*) | CBOR array 的结束
└── FF                 | primitive(*) | CBOR map 的结束
```
{collapsible="true" collapsed-title="完整的 CBOR 十六进制表示法"}

若要将所有 `ByteArray` 值编码为主要类型 2，而无需为每个属性添加 `@ByteString` 注解，请将 [`alwaysUseByteString`](https://kotlinlang.org/api/kotlinx.serialization/kotlinx-serialization-cbor/kotlinx.serialization.cbor/-cbor-builder/always-use-byte-string.html) 属性设置为 `true`：

```kotlin
val format = Cbor {
    alwaysUseByteString = true
}
```

### 将类编码为 CBOR 数组 {id="encode-classes-as-cbor-arrays"}

默认情况下，类会被序列化为 CBOR map，对应于主要类型 5。
这意味着类的每个属性都将作为键值对存储。

你可以使用 [`@CborArray`](https://kotlinlang.org/api/kotlinx.serialization/kotlinx-serialization-cbor/kotlinx.serialization.cbor/-cbor-array/) 注解将类序列化为 CBOR 数组（主要类型 4）。
这对于编码 COSE 消息结构非常有用，[RFC 9052](https://www.rfc-editor.org/rfc/rfc9052#section-2) 将其定义为 CBOR 数组。

示例如下：

```kotlin
@Serializable
@CborArray
data class DataClass(
    val alg: Int,
    val kid: String?
)
 
Cbor.encodeToByteArray(DataClass(alg = -7, kid = null))
```

使用 `@CborArray` 注解时，该示例会被编码为 CBOR 数组：`0x8226f6`。
若不使用该注解，同一个类会被编码为 CBOR map：`0xa263616c6726636b6964f6`。

### CBOR 中的定长与不定长编码 {id="definite-length-and-indefinite-length-encoding-in-cbor"}

CBOR 支持针对 map 和 array 的[两种编码方式](https://datatracker.ietf.org/doc/html/rfc8949#section-3.2.2)：_定长编码 (definite-length encoding)_ 与 _不定长编码 (indefinite-length encoding)_。

默认情况下，Kotlin 序列化使用不定长编码。
在这种编码方式中，map 或 array 中的元素数量不会被显式编码。而是通过一个 "break" 停止代码（`0xFF`）来标记集合的结束。

定长编码则省略终止字节，并在 map 或 array 的开头对元素数量进行编码。

若要在两种模式之间切换，请使用 [`useDefiniteLengthEncoding`](https://kotlinlang.org/api/kotlinx.serialization/kotlinx-serialization-cbor/kotlinx.serialization.cbor/-cbor-builder/use-definite-length-encoding.html) 属性。

## CBOR 中的标记和标签 {id="tags-and-labels-in-cbor"}

CBOR 允许你定义_标记 (tags)_，用于为属性和值编码附加信息。
你可以通过 [`@KeyTags`](https://kotlinlang.org/api/kotlinx.serialization/kotlinx-serialization-cbor/kotlinx.serialization.cbor/-key-tags/) 和 [`@ValueTags`](https://kotlinlang.org/api/kotlinx.serialization/kotlinx-serialization-cbor/kotlinx.serialization.cbor/-value-tags/) 注解来指定这些标记。
`encodeKeyTags`、`encodeValueTags`、`verifyKeyTags` 和 `verifyValueTags` 属性控制
这些标记的编码与验证。

> 有关 CBOR 中标记的更多信息，请参阅 [RFC 8949 项的标记 (Tagging of Items)](https://datatracker.ietf.org/doc/html/rfc8949#name-tagging-of-items)。
>
{style="tip"}

你还可以使用 [`@ObjectTags`](https://kotlinlang.org/api/kotlinx.serialization/kotlinx-serialization-cbor/kotlinx.serialization.cbor/-object-tags/) 注解为某个类的所有实例分配标记。

在序列化时，`@ObjectTags` 会直接编码在被标记对象的数据之前。
如果一个属性具有值标记（value tags），且其类型具有对象标记（object tags），则值标记会在对象标记之前编码。
`encodeObjectTags` 和 `verifyObjectTags` 属性控制是否对对象标记进行编码和验证。
如果仅验证值标记而不验证对象标记，解码器仍然可以反序列化带有额外对象标记的数据。

> 有关常用已知标记的列表，请参阅 [`CborTag`](https://kotlinlang.org/api/kotlinx.serialization/kotlinx-serialization-cbor/kotlinx.serialization.cbor/-cbor-tag/)。
>
{style="tip"}

CBOR 支持任意类型的 map 键。
在 COSE（CBOR 对象签名与加密）中，这些键被限定为字符串和数字，被称为_标签 (labels)_。

你可以使用 [`@SerialName`](https://kotlinlang.org/api/kotlinx.serialization/kotlinx-serialization-core/kotlinx.serialization/-serial-name/) 注解指定字符串标签，使用 [`@CborLabel`](https://kotlinlang.org/api/kotlinx.serialization/kotlinx-serialization-cbor/kotlinx.serialization.cbor/-cbor-label/) 注解指定数字标签。
当二者同时存在时，[`preferCborLabelsOverNames`](https://kotlinlang.org/api/kotlinx.serialization/kotlinx-serialization-cbor/kotlinx.serialization.cbor/-cbor-configuration/prefer-cbor-labels-over-names.html) 属性允许优先使用数字标签而非序列化名称。
你可以利用此特性在 CBOR 中保持紧凑的标签，同时在序列化为 JSON 时仍保留可读的名称。

Kotlin 序列化还提供了一个遵循 COSE 编码要求的预定义 [`Cbor.CoseCompliant`](https://kotlinlang.org/api/kotlinx.serialization/kotlinx-serialization-cbor/kotlinx.serialization.cbor/-cbor/-default/-cose-compliant.html) 实例。
它使用定长编码，编码并验证所有标记，并优先使用数字标签而非序列化名称。

## 自定义 CBOR 专属序列化器 {id="custom-cbor-specific-serializers"}

CBOR 编码器和解码器实现了 [`CborEncoder`](https://kotlinlang.org/api/kotlinx.serialization/kotlinx-serialization-cbor/kotlinx.serialization.cbor/-cbor-encoder/) 和 [`CborDecoder`](https://kotlinlang.org/api/kotlinx.serialization/kotlinx-serialization-cbor/kotlinx.serialization.cbor/-cbor-decoder/) 接口。

这些接口扩展了通用的 `Encoder` 和 `Decoder` 接口，通过 [`cbor`](https://kotlinlang.org/api/kotlinx.serialization/kotlinx-serialization-cbor/kotlinx.serialization.cbor/-cbor-encoder/cbor.html) 属性提供对 CBOR 专属配置的访问权限。
自定义序列化器可以使用该属性访问当前的 [`Cbor`](https://kotlinlang.org/api/kotlinx.serialization/kotlinx-serialization-cbor/kotlinx.serialization.cbor/-cbor/) 实例、生成内嵌的字节数组，并读取当前设置（例如 `preferCborLabelsOverNames` 和 `useDefiniteLengthEncoding`）。

有关创建自定义序列化器的更多信息，请参阅[创建自定义序列化器](serialization-custom-formats.md)。