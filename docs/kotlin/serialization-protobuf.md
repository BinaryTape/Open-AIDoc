[//]: # (title: ProtoBuf 格式)
<primary-label ref="experimental-general"/>

[Protocol Buffers](https://developers.google.com/protocol-buffers) (ProtoBuf) 是一种语言中立的二进制格式，通常使用单独的 [`.proto` 文件](#generate-a-protobuf-schema)来定义协议架构。
它比 CBOR 更紧凑，因为它是为字段分配整数编号而不是名称。

Kotlin 序列化使用 [proto2 语义](https://protobuf.dev/programming-guides/proto2/)，其中所有字段都显式指定为必填（required）或可选（optional）。

## 为 ProtoBuf 添加依赖项 {id="add-dependencies-for-protobuf"}

要在项目中使用 ProtoBuf，请在构建文件中添加 ProtoBuf 序列化库依赖项：

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

## 使用 ProtoBuf 进行二进制序列化 {id="use-protobuf-for-binary-serialization"}

要使用 ProtoBuf 序列化对象，请使用 [`ProtoBuf`](https://kotlinlang.org/api/kotlinx.serialization/kotlinx-serialization-protobuf/kotlinx.serialization.protobuf/-proto-buf/) 类以及 [`.encodeToByteArray()`](https://kotlinlang.org/api/kotlinx.serialization/kotlinx-serialization-protobuf/kotlinx.serialization.protobuf/-proto-buf/encode-to-byte-array.html) 和 [`.decodeFromByteArray()`](https://kotlinlang.org/api/kotlinx.serialization/kotlinx-serialization-protobuf/kotlinx.serialization.protobuf/-proto-buf/decode-from-byte-array.html) 函数：

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
    // 将 Project 实例序列化为 ProtoBuf 字节数组
    val bytes = ProtoBuf.encodeToByteArray(data)

    // 以可读的混合格式打印字节数组
    println(bytes.toAsciiHexString())
    // {0A}{15}kotlinx.serialization{12}{06}Kotlin

    // 将 ProtoBuf 字节数组反序列化回对象
    val obj = ProtoBuf.decodeFromByteArray<Project>(bytes)
    println(obj)
    // Project(name=kotlinx.serialization, language=Kotlin)
}
```

在此示例中，输出将字符串值打印为可读文本，其余字节打印为十六进制形式。
这些字节对应于 [ProtoBuf 十六进制表示法](https://protogen.marcgravell.com/decode)中的以下值：

```text
Field #1: 0A String Length = 21, Hex = 15, UTF8 = "kotlinx.serialization"
Field #2: 12 String Length = 6, Hex = 06, UTF8 = "Kotlin"
```

## 为 ProtoBuf 序列化分配字段编号 {id="assign-field-numbers-for-protobuf-serialization"}

默认情况下，ProtoBuf 会自动分配字段编号。

为了保持架构随着时间的推移保持稳定，可以使用 [`@ProtoNumber`](https://kotlinlang.org/api/kotlinx.serialization/kotlinx-serialization-protobuf/kotlinx.serialization.protobuf/-proto-number/) 注解显式分配字段编号，而无需单独的 `.proto` 文件。
例如，`@ProtoNumber(1)` 为属性分配字段编号 1，因此 Kotlin 序列化的 ProtoBuf 格式在编码和解码期间会使用该编号，而不是自动分配一个编号。

如果您计划重新排列属性顺序，显式分配字段编号可以保持架构稳定，并符合 Protobuf 用于演化架构的兼容性规则。

示例如下：

```kotlin
import kotlinx.serialization.*
import kotlinx.serialization.protobuf.*

@OptIn(ExperimentalSerializationApi::class)
@Serializable
data class Project(
    // 为 name 属性分配字段编号 1
    @ProtoNumber(1)
    val name: String,

    // 为 language 属性分配字段编号 3
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

在此示例中，`name` 属性使用字段编号 1，其编码后的 tag 为 `0A`。
`language` 属性使用字段编号 3，其编码后的 tag 为 `1A`。

在 ProtoBuf 十六进制表示法中，输出等同于以下内容：

```text
Field #1: 0A String Length = 21, Hex = 15, UTF8 = "kotlinx.serialization" (total 21 chars)
Field #3: 1A String Length = 6, Hex = 06, UTF8 = "Kotlin"
```

> 有关 Protobuf 字段编号的更多信息，请参阅[官方 Protobuf 语言指南](https://protobuf.dev/programming-guides/proto2/#assigning)。
>
{style="tip"}

## 在 ProtoBuf 中指定整数编码 {id="specify-integer-encoding-in-protobuf"}

ProtoBuf 默认使用 [varint 编码](https://protobuf.dev/programming-guides/encoding/#varints)对整数属性进行编码。

要对属性使用不同的整数编码，请应用带有 [`ProtoIntegerType`](https://kotlinlang.org/api/kotlinx.serialization/kotlinx-serialization-protobuf/kotlinx.serialization.protobuf/-proto-integer-type/) 值的 [`@ProtoType`](https://kotlinlang.org/api/kotlinx.serialization/kotlinx-serialization-protobuf/kotlinx.serialization.protobuf/-proto-type/) 注解。
该注解影响 `Byte`、`Short`、`Int`、`Long` 和 `Char` 属性。

`ProtoIntegerType` 枚举支持三个选项：

* [`DEFAULT`](https://kotlinlang.org/api/kotlinx.serialization/kotlinx-serialization-protobuf/kotlinx.serialization.protobuf/-proto-integer-type/-d-e-f-a-u-l-t/) 选项使用 varint 编码（`intXX`），该编码针对较小的非负数进行了优化。例如，值 `1` 会被编码为单字节 `01`。
* [`SIGNED`](https://kotlinlang.org/api/kotlinx.serialization/kotlinx-serialization-protobuf/kotlinx.serialization.protobuf/-proto-integer-type/-s-i-g-n-e-d/) 选项使用带符号的 ZigZag 编码（`sintXX`），适用于较小的有符号整数。例如，它将值 `-2` 编码为单字节 `03`。
* [`FIXED`](https://kotlinlang.org/api/kotlinx.serialization/kotlinx-serialization-protobuf/kotlinx.serialization.protobuf/-proto-integer-type/-f-i-x-e-d/) 选项使用定长编码（`fixedXX`），始终使用固定数量的字节。例如，它将值 `3` 编码为四个字节 `03 00 00 00`。

> 不支持 `uintXX` 和 `sfixedXX` Protocol Buffer 类型。
>
{style="note"}

以下示例展示了所有三种支持的选项：

```kotlin
import kotlinx.serialization.*
import kotlinx.serialization.protobuf.*

@OptIn(ExperimentalSerializationApi::class)
@Serializable
class Data(
    // 使用 DEFAULT 编码，针对较小的非负数进行了优化
    @ProtoType(ProtoIntegerType.DEFAULT)
    val a: Int,

    // 使用 SIGNED 编码，针对较小的有符号整数进行了优化
    @ProtoType(ProtoIntegerType.SIGNED)
    val b: Int,

    // 使用 FIXED 编码，始终使用固定数量的字节
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

## 将数值集合编码为 packed 字段 {id="encode-numeric-collections-as-packed-fields"}

在 ProtoBuf 中，packed 字段通过将列表作为单个带长度界定的条目写入，而不是为每个元素重复字段 tag，从而更高效地存储重复的基本数值。

可以使用 [`@ProtoPacked`](https://kotlinlang.org/api/kotlinx.serialization/kotlinx-serialization-protobuf/kotlinx.serialization.protobuf/-proto-packed/) 注解以这种形式序列化除 Map 之外的集合类型。
Packed 编码仅适用于重复的基本数值字段，对于其他元素类型，该注解将被忽略。

根据 [Protobuf 编码规范](https://developers.google.com/protocol-buffers/docs/encoding#packed)，解析器既接受 packed 也接受 unpacked 重复数值字段，因此解码不依赖于是否存在 `@ProtoPacked`。

示例如下：

```kotlin
import kotlinx.serialization.*
import kotlinx.serialization.protobuf.*

@OptIn(ExperimentalSerializationApi::class)
@Serializable
data class DataPacked(
    // 对 values 列表使用 packed 编码
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

## 表示 `oneof` 字段 {id="represent-oneof-fields"}

[`oneof`](https://protobuf.dev/programming-guides/proto2/#oneof) 字段定义了一组字段，其中一次只能设置一个值。

在 Kotlin 序列化中，可以使用[多态](serialization-polymorphism.md)类型来表示这种结构。

考虑以下 ProtoBuf 消息定义：

```text
message Data {
    required string name = 1;
    oneof phone {
        string home_phone = 2;
        string work_phone = 3;
    }
}
```

要在 Kotlin 中表示此消息：

1. 创建一个 `sealed interface` 或 `abstract class` 来表示 `oneof` 声明内的字段：

    ```kotlin
    @Serializable
    sealed interface IPhoneType
    ```

2. 为整个消息定义一个类。添加一个 `name` 属性并使用 `@ProtoNumber(1)` 进行注解。
添加一个多态 `IPhoneType` 类型的 `phone` 属性，并使用 [`@ProtoOneOf`](https://kotlinlang.org/api/kotlinx.serialization/kotlinx-serialization-protobuf/kotlinx.serialization.protobuf/-proto-one-of/) 进行注解：

    ```kotlin
    @Serializable
    data class Data(
        @ProtoNumber(1)
        val name: String,
    
        @ProtoOneOf
        val phone: IPhoneType?,
    )
    ```

3. 对于 `oneof` 声明中的每个字段，创建一个仅包含与该字段对应的单个属性的子类。每个子类可以是普通类、数据类或值类（value class）：

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
   
4. 使用 `oneof` 声明中的字段编号，通过 `@ProtoNumber` 为每个子类属性添加注解：

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

下面是一个更详细的示例，其中 `oneof` 用于存储家庭电话或工作电话：

```kotlin
import kotlinx.serialization.*
import kotlinx.serialization.protobuf.*

// 表示 oneof 组
@Serializable
sealed interface IPhoneType

// 表示 home_phone 字段
@OptIn(ExperimentalSerializationApi::class)
@Serializable @JvmInline value class HomePhone(@ProtoNumber(2) val number: String): IPhoneType

// 将 work_phone 字段表示为数据类
@OptIn(ExperimentalSerializationApi::class)
@Serializable data class WorkPhone(@ProtoNumber(3) val number: String): IPhoneType

// 定义包含 oneof 属性的数据类
@OptIn(ExperimentalSerializationApi::class)
@Serializable
data class Data(
    // 为 name 属性分配字段编号 1
    @ProtoNumber(1) val name: String,

    // 将多态属性映射到 oneof 声明
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

输出表明 ProtoBuf 在每条消息中仅编码了 `oneof` 声明中的一个字段：

* `0a03546f6d1203313233` 表示带有 `home_phone` 的 `"Tom"`。
* `0a054a657272791a03373839` 表示带有 `work_phone` 的 `"Jerry"`。

> 为了防止潜在的字段编号冲突或运行时的 `IllegalArgumentException`，请将每个 `oneof` 类型层次结构仅映射到一个数据类。
>
{style="note"}

如果只需要反序列化数据，也可以定义一个不带 `@ProtoOneOf` 注解的类。

例如：

```kotlin
@Serializable  
data class Data(  
    @ProtoNumber(1) val name: String,
    @ProtoNumber(2) val homeNumber: String? = null,  
    @ProtoNumber(3) val workNumber: String? = null,  
)  
```

通过这种方式，无需使用密封层次结构即可反序列化 `oneof` 字段。

但是，它在序列化期间不强制 `homeNumber` 和 `workNumber` 之间的互斥性。
如果这两个字段都有值，序列化输出可能与原始的 `oneof` 架构不匹配，并且另一个 ProtoBuf 解析器可能仅保留它读取的最后一个字段。

## 生成 ProtoBuf 架构 {id="generate-a-protobuf-schema"}

通常，使用 ProtoBuf 涉及使用 `.proto` 文件和代码生成器来创建用于序列化和反序列化的代码。
然而，借助 Kotlin 序列化，可以使用带有 `@Serializable` 注解的 Kotlin 类作为架构的源，从而使 `.proto` 文件变为可选项。

当涉及的所有代码都是用 Kotlin 编写时，这种方法简化了流程，但与其他语言的互操作性通常仍需要 `.proto` 架构。

要生成此架构，请使用 [`ProtoBufSchemaGenerator`](https://kotlinlang.org/api/kotlinx.serialization/kotlinx-serialization-protobuf/kotlinx.serialization.protobuf.schema/-proto-buf-schema-generator/)。
它从一个或多个 `SerialDescriptor` 实例生成兼容 Proto2 的架构。

这为您提供了一个可与其他 ProtoBuf 工具一起使用的 `.proto` 架构。

以下是从 Kotlin 数据类生成 `.proto` 架构的示例：

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

此代码生成以下 `.proto` 架构：

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

> Kotlin 默认值不会在 `.proto` 文件中表示，因此生成的架构会为具有默认值的属性添加警告注释。
>
{style="note"}