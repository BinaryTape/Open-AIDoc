[//]: # (title: Ktor Client 中的內容協商與序列化)

<show-structure for="chapter" depth="2"/>
<primary-label ref="client-plugin"/>

<var name="plugin_name" value="ContentNegotiation"/>
<var name="artifact_name" value="ktor-client-content-negotiation"/>

<tldr>
<p>
<b>所需的相依性</b>：<code>io.ktor:%artifact_name%</code>
</p>
<var name="example_name" value="client-json-kotlinx"/>
<p>
    <b>程式碼範例</b>：
    <a href="https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/%example_name%">
        %example_name%
    </a>
</p>
</tldr>

<link-summary>
ContentNegotiation 外掛程式有兩個主要用途：在用戶端與伺服器之間協商媒體類型，以及在傳送請求和接收回應時以特定格式序列化/反序列化內容。
</link-summary>

[ContentNegotiation](https://api.ktor.io/ktor-client-content-negotiation/io.ktor.client.plugins.contentnegotiation/-content-negotiation) 外掛程式有兩個主要用途：
* 在用戶端與伺服器之間協商媒體類型。為此，它會使用 `Accept` 和 `Content-Type` 標頭。
* 在傳送 [請求 (requests)](client-requests.md) 和接收 [回應 (responses)](client-responses.md) 時，以特定格式序列化/反序列化內容。Ktor 開箱即用支援以下格式：JSON、XML、CBOR 和 ProtoBuf。

> 在伺服器上，Ktor 提供了 [ContentNegotiation](server-serialization.md) 外掛程式用於序列化/反序列化內容。

## 新增相依性 {id="add_dependencies"}
### ContentNegotiation {id="add_content_negotiation_dependency"}

<p>
    要使用 <code>%plugin_name%</code>，您需要在組建指令碼中包含 <code>%artifact_name%</code> 構件：
</p>
<Tabs group="languages">
    <TabItem title="Gradle (Kotlin)" group-key="kotlin">
        <code-block lang="Kotlin" code="            implementation(&quot;io.ktor:%artifact_name%:$ktor_version&quot;)"></code-block>
    </TabItem>
    <TabItem title="Gradle (Groovy)" group-key="groovy">
        <code-block lang="Groovy" code="            implementation &quot;io.ktor:%artifact_name%:$ktor_version&quot;"></code-block>
    </TabItem>
    <TabItem title="Maven" group-key="maven">
        <code-block lang="XML" code="            &lt;dependency&gt;&#10;                &lt;groupId&gt;io.ktor&lt;/groupId&gt;&#10;                &lt;artifactId&gt;%artifact_name%-jvm&lt;/artifactId&gt;&#10;                &lt;version&gt;${ktor_version}&lt;/version&gt;&#10;            &lt;/dependency&gt;"></code-block>
    </TabItem>
</Tabs>
<tip>
    您可以從 <Links href="/ktor/client-dependencies" summary="了解如何向現有專案新增用戶端相依性。">新增用戶端相依性</Links> 進一步了解 Ktor 用戶端所需的構件。
</tip>

請注意，特定格式的序列化程式需要額外的構件。例如，kotlinx.serialization 需要 `ktor-serialization-kotlinx-json` 相依性才能支援 JSON。根據包含的構件，Ktor 會自動選擇預設的序列化程式。如果需要，您可以明確 [指定序列化程式](#configure_serializer) 並對其進行配置。

### 序列化 {id="serialization_dependency"}

在使用 kotlinx.serialization 轉換器之前，您需要按照 [安裝 (Setup)](https://github.com/Kotlin/kotlinx.serialization#setup) 區段中的說明新增 Kotlin 序列化外掛程式。

#### JSON {id="add_json_dependency"}

要序列化/反序列化 JSON 資料，您可以選擇以下任一程式庫：kotlinx.serialization、Gson 或 Jackson。

<Tabs group="json-libraries">
<TabItem title="kotlinx.serialization" group-key="kotlinx">

在組建指令碼中新增 `ktor-serialization-kotlinx-json` 構件：

<var name="artifact_name" value="ktor-serialization-kotlinx-json"/>
<Tabs group="languages">
    <TabItem title="Gradle (Kotlin)" group-key="kotlin">
        <code-block lang="Kotlin" code="            implementation(&quot;io.ktor:%artifact_name%:$ktor_version&quot;)"></code-block>
    </TabItem>
    <TabItem title="Gradle (Groovy)" group-key="groovy">
        <code-block lang="Groovy" code="            implementation &quot;io.ktor:%artifact_name%:$ktor_version&quot;"></code-block>
    </TabItem>
    <TabItem title="Maven" group-key="maven">
        <code-block lang="XML" code="            &lt;dependency&gt;&#10;                &lt;groupId&gt;io.ktor&lt;/groupId&gt;&#10;                &lt;artifactId&gt;%artifact_name%-jvm&lt;/artifactId&gt;&#10;                &lt;version&gt;${ktor_version}&lt;/version&gt;&#10;            &lt;/dependency&gt;"></code-block>
    </TabItem>
</Tabs>

</TabItem>
<TabItem title="Gson" group-key="gson">

在組建指令碼中新增 `ktor-serialization-gson` 構件：

<var name="artifact_name" value="ktor-serialization-gson"/>
<Tabs group="languages">
    <TabItem title="Gradle (Kotlin)" group-key="kotlin">
        <code-block lang="Kotlin" code="            implementation(&quot;io.ktor:%artifact_name%:$ktor_version&quot;)"></code-block>
    </TabItem>
    <TabItem title="Gradle (Groovy)" group-key="groovy">
        <code-block lang="Groovy" code="            implementation &quot;io.ktor:%artifact_name%:$ktor_version&quot;"></code-block>
    </TabItem>
    <TabItem title="Maven" group-key="maven">
        <code-block lang="XML" code="            &lt;dependency&gt;&#10;                &lt;groupId&gt;io.ktor&lt;/groupId&gt;&#10;                &lt;artifactId&gt;%artifact_name%-jvm&lt;/artifactId&gt;&#10;                &lt;version&gt;${ktor_version}&lt;/version&gt;&#10;            &lt;/dependency&gt;"></code-block>
    </TabItem>
</Tabs>

</TabItem>
<TabItem title="Jackson" group-key="jackson">

在組建指令碼中新增 `ktor-serialization-jackson` 構件：

<var name="artifact_name" value="ktor-serialization-jackson"/>
<Tabs group="languages">
    <TabItem title="Gradle (Kotlin)" group-key="kotlin">
        <code-block lang="Kotlin" code="            implementation(&quot;io.ktor:%artifact_name%:$ktor_version&quot;)"></code-block>
    </TabItem>
    <TabItem title="Gradle (Groovy)" group-key="groovy">
        <code-block lang="Groovy" code="            implementation &quot;io.ktor:%artifact_name%:$ktor_version&quot;"></code-block>
    </TabItem>
    <TabItem title="Maven" group-key="maven">
        <code-block lang="XML" code="            &lt;dependency&gt;&#10;                &lt;groupId&gt;io.ktor&lt;/groupId&gt;&#10;                &lt;artifactId&gt;%artifact_name%-jvm&lt;/artifactId&gt;&#10;                &lt;version&gt;${ktor_version}&lt;/version&gt;&#10;            &lt;/dependency&gt;"></code-block>
    </TabItem>
</Tabs>

</TabItem>
</Tabs>

#### XML {id="add_xml_dependency"}

要序列化/反序列化 XML，請在組建指令碼中新增 `ktor-serialization-kotlinx-xml`：

<var name="artifact_name" value="ktor-serialization-kotlinx-xml"/>
<Tabs group="languages">
    <TabItem title="Gradle (Kotlin)" group-key="kotlin">
        <code-block lang="Kotlin" code="            implementation(&quot;io.ktor:%artifact_name%:$ktor_version&quot;)"></code-block>
    </TabItem>
    <TabItem title="Gradle (Groovy)" group-key="groovy">
        <code-block lang="Groovy" code="            implementation &quot;io.ktor:%artifact_name%:$ktor_version&quot;"></code-block>
    </TabItem>
    <TabItem title="Maven" group-key="maven">
        <code-block lang="XML" code="            &lt;dependency&gt;&#10;                &lt;groupId&gt;io.ktor&lt;/groupId&gt;&#10;                &lt;artifactId&gt;%artifact_name%-jvm&lt;/artifactId&gt;&#10;                &lt;version&gt;${ktor_version}&lt;/version&gt;&#10;            &lt;/dependency&gt;"></code-block>
    </TabItem>
</Tabs>

> 請注意，`jsNode` 目標 [不支援 XML 序列化](https://github.com/pdvrieze/xmlutil/issues/83)。
{style="note"}

#### CBOR {id="add_cbor_dependency"}

要序列化/反序列化 CBOR，請在組建指令碼中新增 `ktor-serialization-kotlinx-cbor`：

<var name="artifact_name" value="ktor-serialization-kotlinx-cbor"/>
<Tabs group="languages">
    <TabItem title="Gradle (Kotlin)" group-key="kotlin">
        <code-block lang="Kotlin" code="            implementation(&quot;io.ktor:%artifact_name%:$ktor_version&quot;)"></code-block>
    </TabItem>
    <TabItem title="Gradle (Groovy)" group-key="groovy">
        <code-block lang="Groovy" code="            implementation &quot;io.ktor:%artifact_name%:$ktor_version&quot;"></code-block>
    </TabItem>
    <TabItem title="Maven" group-key="maven">
        <code-block lang="XML" code="            &lt;dependency&gt;&#10;                &lt;groupId&gt;io.ktor&lt;/groupId&gt;&#10;                &lt;artifactId&gt;%artifact_name%-jvm&lt;/artifactId&gt;&#10;                &lt;version&gt;${ktor_version}&lt;/version&gt;&#10;            &lt;/dependency&gt;"></code-block>
    </TabItem>
</Tabs>

#### ProtoBuf {id="add_protobuf_dependency"}

要序列化/反序列化 ProtoBuf，請在組建指令碼中新增 `ktor-serialization-kotlinx-protobuf`：

<var name="artifact_name" value="ktor-serialization-kotlinx-protobuf"/>
<Tabs group="languages">
    <TabItem title="Gradle (Kotlin)" group-key="kotlin">
        <code-block lang="Kotlin" code="            implementation(&quot;io.ktor:%artifact_name%:$ktor_version&quot;)"></code-block>
    </TabItem>
    <TabItem title="Gradle (Groovy)" group-key="groovy">
        <code-block lang="Groovy" code="            implementation &quot;io.ktor:%artifact_name%:$ktor_version&quot;"></code-block>
    </TabItem>
    <TabItem title="Maven" group-key="maven">
        <code-block lang="XML" code="            &lt;dependency&gt;&#10;                &lt;groupId&gt;io.ktor&lt;/groupId&gt;&#10;                &lt;artifactId&gt;%artifact_name%-jvm&lt;/artifactId&gt;&#10;                &lt;version&gt;${ktor_version}&lt;/version&gt;&#10;            &lt;/dependency&gt;"></code-block>
    </TabItem>
</Tabs>

## 安裝 ContentNegotiation {id="install_plugin"}

要安裝 `ContentNegotiation`，請將其傳遞給 [用戶端配置區塊](client-create-and-configure.md#configure-client) 內的 `install` 函式：

```kotlin
val client = HttpClient(CIO) {
    install(ContentNegotiation)
}
```
現在您可以 [配置](#configure_serializer) 所需的 JSON 序列化程式。

## 配置序列化程式 {id="configure_serializer"}

### JSON 序列化程式 {id="register_json"}

<Tabs group="json-libraries">
<TabItem title="kotlinx.serialization" group-key="kotlinx">

要在您的應用程式中註冊 JSON 序列化程式，請呼叫 `json` 方法：
```kotlin
import io.ktor.client.plugins.contentnegotiation.*
import io.ktor.serialization.kotlinx.json.*

val client = HttpClient(CIO) {
    install(ContentNegotiation) {
        json()
    }
}
```

在 `json` 建構函式中，您可以存取 [JsonBuilder](https://kotlinlang.org/api/kotlinx.serialization/kotlinx-serialization-json/kotlinx.serialization.json/-json-builder/) API，例如：
```kotlin
val client = HttpClient(CIO) {
    install(ContentNegotiation) {
        json(Json {
            prettyPrint = true
            isLenient = true
        })
    }
}
```

您可以在這裡找到完整的範例：[client-json-kotlinx](https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/client-json-kotlinx)。

</TabItem>
<TabItem title="Gson" group-key="gson">

要在您的應用程式中註冊 Gson 序列化程式，請呼叫 [gson](https://api.ktor.io/ktor-serialization-gson/io.ktor.serialization.gson/gson.html) 方法：
```kotlin
import io.ktor.client.plugins.contentnegotiation.*
import io.ktor.serialization.gson.*

val client = HttpClient(CIO) {
    install(ContentNegotiation) {
        gson()
    }
}
```

`gson` 方法還允許您調整由 [GsonBuilder](https://www.javadoc.io/doc/com.google.code.gson/gson/latest/com.google.gson/com/google/gson/GsonBuilder.html) 提供的序列化設定。

</TabItem>
<TabItem title="Jackson" group-key="jackson">

要在您的應用程式中註冊 Jackson 序列化程式，請呼叫 [jackson](https://api.ktor.io/ktor-serialization-jackson/io.ktor.serialization.jackson/jackson.html) 方法：

```kotlin
import io.ktor.client.plugins.contentnegotiation.*
import io.ktor.serialization.jackson.*

val client = HttpClient(CIO) {
    install(ContentNegotiation) {
        jackson()
    }
}
```

`jackson` 方法還允許您調整由 [ObjectMapper](https://fasterxml.github.io/jackson-databind/javadoc/2.17.2/com/fasterxml/jackson/databind/ObjectMapper.html) 提供的序列化設定，例如：

```kotlin
import io.ktor.client.plugins.contentnegotiation.*
import io.ktor.serialization.jackson.*
import com.fasterxml.jackson.databind.*
import java.text.DateFormat

val client = HttpClient(CIO) {
    install(ContentNegotiation) {
        jackson {
            enable(SerializationFeature.INDENT_OUTPUT)
            dateFormat = DateFormat.getDateInstance()
        }
    }
}
```

</TabItem>
</Tabs>

### XML 序列化程式 {id="register_xml"}

要在您的應用程式中註冊 XML 序列化程式，請呼叫 `xml` 方法：
```kotlin
import io.ktor.client.plugins.contentnegotiation.*
import io.ktor.serialization.kotlinx.xml.*

val client = HttpClient(CIO) {
    install(ContentNegotiation) {
        xml()
    }
}
```

`xml` 方法還允許您存取 XML 序列化設定，例如：

```kotlin
import io.ktor.client.plugins.contentnegotiation.*
import io.ktor.serialization.kotlinx.xml.*
import nl.adaptivity.xmlutil.*
import nl.adaptivity.xmlutil.serialization.*

val client = HttpClient(CIO) {
    install(ContentNegotiation) {
        xml(format = XML {
            xmlDeclMode = XmlDeclMode.Charset
        })
    }
}
```

### CBOR 序列化程式 {id="register_cbor"}
要在您的應用程式中註冊 CBOR 序列化程式，請呼叫 `cbor` 方法：
```kotlin
import io.ktor.client.plugins.contentnegotiation.*
import io.ktor.serialization.kotlinx.cbor.*

val client = HttpClient(CIO) {
    install(ContentNegotiation) {
        cbor()
    }
}
```

`cbor` 方法還允許您存取由 [CborBuilder](https://kotlinlang.org/api/kotlinx.serialization/kotlinx-serialization-cbor/kotlinx.serialization.cbor/-cbor-builder/) 提供的 CBOR 序列化設定，例如：

```kotlin
import io.ktor.client.plugins.contentnegotiation.*
import io.ktor.serialization.kotlinx.cbor.*
import kotlinx.serialization.cbor.*

val client = HttpClient(CIO) {
    install(ContentNegotiation) {
        cbor(Cbor {
            ignoreUnknownKeys = true
        })
    }
}
```

### ProtoBuf 序列化程式 {id="register_protobuf"}
要在您的應用程式中註冊 ProtoBuf 序列化程式，請呼叫 `protobuf` 方法：
```kotlin
import io.ktor.client.plugins.contentnegotiation.*
import io.ktor.serialization.kotlinx.protobuf.*

val client = HttpClient(CIO) {
    install(ContentNegotiation) {
        protobuf()
    }
}
```

`protobuf` 方法還允許您存取由 [ProtoBufBuilder](https://kotlinlang.org/api/kotlinx.serialization/kotlinx-serialization-protobuf/kotlinx.serialization.protobuf/-proto-buf-builder/) 提供的 ProtoBuf 序列化設定，例如：

```kotlin
import io.ktor.client.plugins.contentnegotiation.*
import io.ktor.serialization.kotlinx.protobuf.*
import kotlinx.serialization.protobuf.*

val client = HttpClient(CIO) {
    install(ContentNegotiation) {
        protobuf(ProtoBuf {
            encodeDefaults = true
        })
    }
}
```

## 接收和傳送資料 {id="receive_send_data"}
### 建立資料類別 {id="create_data_class"}

要接收和傳送資料，您需要有一個資料類別，例如：
```kotlin
data class Customer(val id: Int, val firstName: String, val lastName: String)
```

如果您使用 kotlinx.serialization，請確保該類別具有 `@Serializable` 註解：
```kotlin
@Serializable
data class Customer(val id: Int, val firstName: String, val lastName: String)
```

kotlinx.serialization 程式庫支援以下類型的序列化/反序列化：

- [內建類別](https://github.com/Kotlin/kotlinx.serialization/blob/master/docs/builtin-classes.md)
- [序列 (Sequences)](https://kotlinlang.org/docs/sequences.html) 的反序列化
- [流程 (Flows)](https://kotlinlang.org/docs/flow.html) 的序列化

### 傳送資料 {id="send_data"}

要將 [類別執行個體](#create_data_class) 作為 JSON 在 [請求 (request)](client-requests.md) 內容中傳送，請使用 `setBody` 函式指派此執行個體，並透過呼叫 `contentType` 將內容類型設定為 `application/json`：

```kotlin
val response: HttpResponse = client.post("http://localhost:8080/customer") {
    contentType(ContentType.Application.Json)
    setBody(Customer(3, "Jet", "Brains"))
}
```

要以 XML 或 CBOR 格式傳送資料，請分別將 `contentType` 設定為 `ContentType.Application.Xml` 或 `ContentType.Application.Cbor`。

### 接收資料 {id="receive_data"}

當伺服器傳送內容類型為 `application/json`、`application/xml` 或 `application/cbor` 的 [回應 (response)](client-responses.md) 時，您可以透過指定 [資料類別](#create_data_class) 作為用於接收回應有效負載之函式的參數（在下方範例中為 `body`）來將其反序列化：
```kotlin
val customer: Customer = client.get("http://localhost:8080/customer/3").body()
```

您可以在這裡找到完整的範例：[client-json-kotlinx](https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/client-json-kotlinx)。