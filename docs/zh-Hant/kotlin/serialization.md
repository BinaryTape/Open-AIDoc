[//]: # (title: 序列化)

**序列化 (Serialization)** 是將應用程式所使用的資料轉換為可透過網路傳輸，或儲存於資料庫或檔案之格式的過程。反序列化 (Deserialization) 則是相反的過程，將外部資料轉回執行階段物件。
兩者相輔相成，對於大多數需要與第三方交換資料的應用程式而言不可或缺。

某些資料序列化格式特別常見，例如 [JSON](https://www.json.org/json-en.html) 與 [Protocol Buffers](https://protobuf.dev/)。
這些格式具備語言中立性與平台中立性，因此你可以使用它們在以任何現代語言編寫的系統之間交換資料。
Kotlin 透過支援多平台與資料格式的 [`kotlinx.serialization` 程式庫](#kotlin-serialization-libraries) 提供此功能性。

如果你是 Kotlin 序列化的新手，我們建議從[開始使用序列化](serialization-get-started.md)教學開始。
它會引導你在專案中設定 Kotlin 序列化，並展示如何序列化與反序列化你的第一個類別。

<a href="serialization-get-started.md"><img src="get-started-serialization.svg" width="700" alt="開始使用序列化" style="block"/></a>

## Kotlin 序列化程式庫 {id="kotlin-serialization-libraries"}

Kotlin 序列化支援所有平台，包括 JVM、JavaScript 和 Native。
無論目標平台為何，你都可以使用相同的[相依性宣告](serialization-get-started.md#add-plugins-and-dependencies)。

Kotlin 序列化透過不同的序列化格式程式庫，支援多種序列化格式，例如 JSON、CBOR 和 Protocol buffers。
這些程式庫建置於 `kotlinx-serialization-core` 程式庫之上。
如需受支援序列化格式的完整清單，請參閱[受支援的序列化格式](#supported-serialization-formats)。

所有 `kotlinx.serialization` 格式程式庫均屬於 `org.jetbrains.kotlinx:` 群組，其名稱以 `kotlinx-serialization-` 開頭，並帶有反映序列化格式的後綴。
例如：

* `org.jetbrains.kotlinx:kotlinx-serialization-json` 提供 JSON 序列化。
* `org.jetbrains.kotlinx:kotlinx-serialization-cbor` 提供 CBOR 序列化。

`kotlinx.serialization` 程式庫遵循其獨立於 Kotlin 的版本控制。
你可以在 [GitHub](https://github.com/Kotlin/kotlinx.serialization/releases) 上找到最新的釋出版本。

> 當你不使用特定格式程式庫時（例如編寫自己的序列化格式時），
> 請使用 `kotlinx-serialization-core` 程式庫作為相依性。
>
{style="tip"}

## 受支援的序列化格式 {id="supported-serialization-formats"}

`kotlinx.serialization` 專案為各種序列化格式提供了相應的程式庫：

| 格式       | Artifact ID                                                                                                                    | 平台                | 狀態       |
|--------------|--------------------------------------------------------------------------------------------------------------------------------|-------------------------|--------------|
| [JSON](https://www.json.org/json-en.html)            | [`kotlinx-serialization-json`](https://github.com/Kotlin/kotlinx.serialization/blob/master/formats/README.md#json)             | 所有受支援的平台 | 穩定 (Stable)       |
| [HOCON](https://github.com/lightbend/config/blob/master/HOCON.md) | [`kotlinx-serialization-hocon`](https://github.com/Kotlin/kotlinx.serialization/blob/master/formats/README.md#hocon)           | 僅限 JVM                | 實驗性 (Experimental) |
| [Protocol Buffers](https://protobuf.dev/)            | [`kotlinx-serialization-protobuf`](https://github.com/Kotlin/kotlinx.serialization/blob/master/formats/README.md#protobuf)     | 所有受支援的平台 | 實驗性 (Experimental) |
| [CBOR](https://cbor.io/)                             | [`kotlinx-serialization-cbor`](https://github.com/Kotlin/kotlinx.serialization/blob/master/formats/README.md#cbor)             | 所有受支援的平台 | 實驗性 (Experimental) |
| [Properties](https://en.wikipedia.org/wiki/.properties) | [`kotlinx-serialization-properties`](https://github.com/Kotlin/kotlinx.serialization/blob/master/formats/README.md#properties) | 所有受支援的平台 | 實驗性 (Experimental) |

除 JSON 序列化程式庫 (`kotlinx-serialization-json`) 外，所有序列化格式程式庫均處於[實驗性 (Experimental)](components-stability.md#stability-levels-explained)階段。其 API 可能隨時變更。
如需有關 JSON 序列化的更多詳細資訊，請參閱 [JSON 序列化概觀](serialization-configure-json-serialization.md)。

此外也有社群維護的程式庫支援更多序列化格式，例如 [YAML](https://yaml.org/) 或 [Apache Avro](https://avro.apache.org/)。

你可以在[自訂序列化格式](serialization-custom-formats.md)中進一步了解其他替代與自訂的實驗性序列化格式。

## 受支援的序列化型別 {id="supported-serialization-types"}

Kotlin 序列化支援多種內建型別，包括所有基本型別以及 Kotlin 標準庫中的大多數複合型別（例如 `List` 型別）。
如需詳細資訊，請參閱[序列化內建型別](serialization-serialize-builtin-types.md)。

此外，標註有 `@Serializable` 的類別完全支援序列化，從而實現類別執行個體與 JSON 等格式之間的相互轉換。
如需詳細資訊，請參閱[序列化類別](serialization-customization-options.md)。

## 後續步驟 {id="what-s-next"}

* 在[開始使用序列化教學](serialization-get-started.md)中學習 Kotlin 序列化的基礎知識。
* 了解 Kotlin 序列化如何處理[基本型別、集合與其他內建型別](serialization-serialize-builtin-types.md)。
* 在 [JSON 序列化概觀](serialization-configure-json-serialization.md)中探索更複雜的 JSON 序列化情境。
* 深入閱讀[序列化類別](serialization-customization-options.md)，學習如何序列化類別並修改 `@Serializable` 註解的預設行為。
* 在[建立與使用序列化器](serialization-create-and-use-serializers.md)中學習如何取得產生的序列化器、建立自訂序列化器以及套用序列化器。
* 在[序列化多型類別](serialization-polymorphism.md)中了解如何透過共用基底型別來序列化不同型別。
* 在[自訂序列化格式](serialization-custom-formats.md)中學習如何建立自訂格式。
* 探索諸如 [CBOR](serialization-cbor.md) 與 [ProtoBuf](serialization-protobuf.md) 等實驗性序列化格式。