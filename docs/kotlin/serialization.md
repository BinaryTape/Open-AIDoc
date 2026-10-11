[//]: # (title: 序列化)

**序列化**是将应用程序使用的数据转换为可以通过网络传输、或存储在数据库或文件中的格式的过程。反序列化则是相反的过程，将外部数据转换回运行时对象。两者结合，对于大多数需要与第三方交换数据的应用程序而言至关重要。

某些数据序列化格式特别常见，例如 [JSON](https://www.json.org/json-en.html) 和 [Protocol Buffers](https://protobuf.dev/)。这些格式与语言无关且与平台无关，因此你可以使用它们在用任何现代语言编写的系统之间交换数据。Kotlin 通过 [`kotlinx.serialization` 库](#kotlin-serialization-libraries)提供此功能，该库支持多种平台和数据格式。

如果你刚接触 Kotlin 中的序列化，建议从[序列化入门](serialization-get-started.md)教程开始。该教程将引导你在项目中设置 Kotlin 序列化，并演示如何序列化和反序列化你的第一个类。

<a href="serialization-get-started.md"><img src="get-started-serialization.svg" width="700" alt="序列化入门" style="block"/></a>

## Kotlin 序列化库 {id="kotlin-serialization-libraries"}

Kotlin 序列化支持所有平台，包括 JVM、JavaScript 和 Native。无论目标平台是什么，你都可以使用相同的[依赖项声明](serialization-get-started.md#add-plugins-and-dependencies)。

Kotlin 序列化通过不同的序列化格式库支持各种序列化格式，例如 JSON、CBOR 和 Protocol Buffers。这些库构建在 `kotlinx-serialization-core` 库之上。有关受支持序列化格式的完整列表，请参阅[受支持的序列化格式](#supported-serialization-formats)。

所有 `kotlinx.serialization` 格式库都属于 `org.jetbrains.kotlinx:` 组，其名称以 `kotlinx-serialization-` 开头，并以反映序列化格式的后缀结尾。例如：

* `org.jetbrains.kotlinx:kotlinx-serialization-json` 提供 JSON 序列化。
* `org.jetbrains.kotlinx:kotlinx-serialization-cbor` 提供 CBOR 序列化。

`kotlinx.serialization` 库遵循其自身的版本管理，独立于 Kotlin。你可以在 [GitHub](https://github.com/Kotlin/kotlinx.serialization/releases) 上找到最新的发布版本。

> 当你不使用特定格式的库时（例如，在编写自己的序列化格式时），请使用 `kotlinx-serialization-core` 库作为依赖项。
>
{style="tip"}

## 受支持的序列化格式 {id="supported-serialization-formats"}

`kotlinx.serialization` 项目为各种序列化格式提供了库：

| 格式 | Artifact ID | 平台 | 状态 |
|--------------|--------------------------------------------------------------------------------------------------------------------------------|-------------------------|--------------|
| [JSON](https://www.json.org/json-en.html)            | [`kotlinx-serialization-json`](https://github.com/Kotlin/kotlinx.serialization/blob/master/formats/README.md#json)             | 所有受支持的平台 | 稳定 |
| [HOCON](https://github.com/lightbend/config/blob/master/HOCON.md) | [`kotlinx-serialization-hocon`](https://github.com/Kotlin/kotlinx.serialization/blob/master/formats/README.md#hocon)           | 仅限 JVM | 实验性 |
| [Protocol Buffers](https://protobuf.dev/)            | [`kotlinx-serialization-protobuf`](https://github.com/Kotlin/kotlinx.serialization/blob/master/formats/README.md#protobuf)     | 所有受支持的平台 | 实验性 |
| [CBOR](https://cbor.io/)                             | [`kotlinx-serialization-cbor`](https://github.com/Kotlin/kotlinx.serialization/blob/master/formats/README.md#cbor)             | 所有受支持的平台 | 实验性 |
| [Properties](https://en.wikipedia.org/wiki/.properties) | [`kotlinx-serialization-properties`](https://github.com/Kotlin/kotlinx.serialization/blob/master/formats/README.md#properties) | 所有受支持的平台 | 实验性 |

除 JSON 序列化库（`kotlinx-serialization-json`）外，所有序列化格式库均为[实验性](components-stability.md#stability-levels-explained)。它们的 API 可能会随时更改。有关 JSON 序列化的更多详细信息，请参阅 [JSON 序列化概述](serialization-configure-json-serialization.md)。

此外，还有一些社区维护的库支持更多序列化格式，例如 [YAML](https://yaml.org/) 或 [Apache Avro](https://avro.apache.org/)。

你可以在[自定义序列化格式](serialization-custom-formats.md)中详细了解其他替代格式以及自定义的实验性序列化格式。

## 受支持的序列化类型 {id="supported-serialization-types"}

Kotlin 序列化支持各种内置类型，包括所有基本类型以及 Kotlin 标准库中的大部分复合类型（如 `List` 类型）。有关更多信息，请参阅[序列化内置类型](serialization-serialize-builtin-types.md)。

此外，完全支持对带有 `@Serializable` 注解的类进行序列化，从而能够将类实例与 JSON 等格式进行相互转换。有关更多信息，请参阅[序列化类](serialization-customization-options.md)。

## 下一步 {id="what-s-next"}

* 在[序列化入门教程](serialization-get-started.md)中学习 Kotlin 序列化的基础知识。
* 了解 Kotlin 序列化如何处理[基本类型、集合及其他内置类型](serialization-serialize-builtin-types.md)。
* 在 [JSON 序列化概述](serialization-configure-json-serialization.md)中探索更复杂的 JSON 序列化场景。
* 深入阅读[序列化类](serialization-customization-options.md)，学习如何序列化类并修改 `@Serializable` 注解的默认行为。
* 在[创建和使用序列化器](serialization-create-and-use-serializers.md)中学习如何获取生成的序列化器、创建自定义序列化器以及应用序列化器。
* 在[序列化多态类](serialization-polymorphism.md)中了解如何通过共享基类型来序列化不同的类型。
* 在[自定义序列化格式](serialization-custom-formats.md)中学习如何创建自定义格式。
* 探索诸如 [CBOR](serialization-cbor.md) 和 [ProtoBuf](serialization-protobuf.md) 等实验性序列化格式。