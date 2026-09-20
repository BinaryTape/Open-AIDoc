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

[`ContentNegotiation`](https://api.ktor.io/ktor-client-content-negotiation/io.ktor.client.plugins.contentnegotiation/-content-negotiation)
外掛程式有兩個主要用途：
* 使用 `Accept` 和 `Content-Type` 標頭在用戶端與伺服器之間協商媒體類型。
* 在支援的格式中序列化 [請求 (request)](client-requests.md) 內文以及反序列化 [回應 (response)](client-responses.md) 內文。Ktor 內建支援 JSON、XML、CBOR 和 ProtoBuf。

> 在伺服器上，Ktor 提供了 [`ContentNegotiation`](server-serialization.md) 外掛程式用於序列化與反序列化內容。
>
{style="tip"}

## 新增相依性 {id="add_dependencies"}

### 內容協商 {id="add_content_negotiation_dependency"}

<p>
    要使用 <code>%plugin_name%</code>，請在您的組建指令碼中新增 <code>%artifact_name%</code> 構件：
</p>
<Tabs group="languages">
    <TabItem title="Gradle (Kotlin)" group-key="kotlin">
        <code-block lang="Kotlin" code="            implementation(&quot;io.ktor:%artifact_name%:$ktor_version&quot;)"/>
    </TabItem>
    <TabItem title="Gradle (Groovy)" group-key="groovy">
        <code-block lang="Groovy" code="            implementation &quot;io.ktor:%artifact_name%:$ktor_version&quot;"/>
    </TabItem>
    <TabItem title="Maven" group-key="maven">
        <code-block lang="XML" code="            &lt;dependency&gt;&#10;                &lt;groupId&gt;io.ktor&lt;/groupId&gt;&#10;                &lt;artifactId&gt;%artifact_name%-jvm&lt;/artifactId&gt;&#10;                &lt;version&gt;${ktor_version}&lt;/version&gt;&#10;            &lt;/dependency&gt;"/>
    </TabItem>
</Tabs>

> 特定格式的序列化程式需要額外的構件。
> 
> 例如，`kotlinx.serialization` 需要 `ktor-serialization-kotlinx-json` 相依性才能支援 JSON。根據包含的構件，Ktor 會自動選擇預設的序列化程式。如果需要，您可以明確[指定序列化程式](#configure_serializer)並對其進行配置。
> 
{style="note"}

<tip>
    若要進一步了解 Ktor 用戶端所需的構件，請參閱<Links href="/ktor/client-dependencies" summary="了解如何向現有專案新增用戶端相依性。">新增用戶端相依性</Links>。
</tip>

### 序列化 {id="serialization_dependency"}

在使用 `kotlinx.serialization` 轉換器之前，請按照[安裝 (Setup)](https://github.com/Kotlin/kotlinx.serialization#setup) 區段中的說明新增 Kotlin 序列化外掛程式。

#### JSON {id="add_json_dependency"}

要序列化與反序列化 JSON 資料，請在專案中新增序列化程式庫。Ktor 支援 `kotlinx.serialization`、Gson 或 Jackson。

<Tabs group="json-libraries">
<TabItem title="kotlinx.serialization" group-key="kotlinx">

在您的組建指令碼中新增 `ktor-serialization-kotlinx-json` 構件：

<var name="artifact_name" value="ktor-serialization-kotlinx-json"/>
<Tabs group="languages">
    <TabItem title="Gradle (Kotlin)" group-key="kotlin">
        <code-block lang="Kotlin" code="            implementation(&quot;io.ktor:%artifact_name%:$ktor_version&quot;)"/>
    </TabItem>
    <TabItem title="Gradle (Groovy)" group-key="groovy">
        <code-block lang="Groovy" code="            implementation &quot;io.ktor:%artifact_name%:$ktor_version&quot;"/>
    </TabItem>
    <TabItem title="Maven" group-key="maven">
        <code-block lang="XML" code="            &lt;dependency&gt;&#10;                &lt;groupId&gt;io.ktor&lt;/groupId&gt;&#10;                &lt;artifactId&gt;%artifact_name%-jvm&lt;/artifactId&gt;&#10;                &lt;version&gt;${ktor_version}&lt;/version&gt;&#10;            &lt;/dependency&gt;"/>
    </TabItem>
</Tabs>

</TabItem>
<TabItem title="Gson" group-key="gson">

在您的組建指令碼中新增 `ktor-serialization-gson` 構件：

<var name="artifact_name" value="ktor-serialization-gson"/>
<Tabs group="languages">
    <TabItem title="Gradle (Kotlin)" group-key="kotlin">
        <code-block lang="Kotlin" code="            implementation(&quot;io.ktor:%artifact_name%:$ktor_version&quot;)"/>
    </TabItem>
    <TabItem title="Gradle (Groovy)" group-key="groovy">
        <code-block lang="Groovy" code="            implementation &quot;io.ktor:%artifact_name%:$ktor_version&quot;"/>
    </TabItem>
    <TabItem title="Maven" group-key="maven">
        <code-block lang="XML" code="            &lt;dependency&gt;&#10;                &lt;groupId&gt;io.ktor&lt;/groupId&gt;&#10;                &lt;artifactId&gt;%artifact_name%-jvm&lt;/artifactId&gt;&#10;                &lt;version&gt;${ktor_version}&lt;/version&gt;&#10;            &lt;/dependency&gt;"/>
    </TabItem>
</Tabs>

</TabItem>
<TabItem title="Jackson" group-key="jackson">

在您的組建指令碼中新增 `ktor-serialization-jackson` 構件：

<var name="artifact_name" value="ktor-serialization-jackson"/>
<Tabs group="languages">
    <TabItem title="Gradle (Kotlin)" group-key="kotlin">
        <code-block lang="Kotlin" code="            implementation(&quot;io.ktor:%artifact_name%:$ktor_version&quot;)"/>
    </TabItem>
    <TabItem title="Gradle (Groovy)" group-key="groovy">
        <code-block lang="Groovy" code="            implementation &quot;io.ktor:%artifact_name%:$ktor_version&quot;"/>
    </TabItem>
    <TabItem title="Maven" group-key="maven">
        <code-block lang="XML" code="            &lt;dependency&gt;&#10;                &lt;groupId&gt;io.ktor&lt;/groupId&gt;&#10;                &lt;artifactId&gt;%artifact_name%-jvm&lt;/artifactId&gt;&#10;                &lt;version&gt;${ktor_version}&lt;/version&gt;&#10;            &lt;/dependency&gt;"/>
    </TabItem>
</Tabs>

</TabItem>
</Tabs>

#### XML {id="add_xml_dependency"}

要序列化與反序列化 XML，請在您的組建指令碼中新增 `ktor-serialization-kotlinx-xml` 構件：

<var name="artifact_name" value="ktor-serialization-kotlinx-xml"/>
<Tabs group="languages">
    <TabItem title="Gradle (Kotlin)" group-key="kotlin">
        <code-block lang="Kotlin" code="            implementation(&quot;io.ktor:%artifact_name%:$ktor_version&quot;)"/>
    </TabItem>
    <TabItem title="Gradle (Groovy)" group-key="groovy">
        <code-block lang="Groovy" code="            implementation &quot;io.ktor:%artifact_name%:$ktor_version&quot;"/>
    </TabItem>
    <TabItem title="Maven" group-key="maven">
        <code-block lang="XML" code="            &lt;dependency&gt;&#10;                &lt;groupId&gt;io.ktor&lt;/groupId&gt;&#10;                &lt;artifactId&gt;%artifact_name%-jvm&lt;/artifactId&gt;&#10;                &lt;version&gt;${ktor_version}&lt;/version&gt;&#10;            &lt;/dependency&gt;"/>
    </TabItem>
</Tabs>

#### CBOR {id="add_cbor_dependency"}

要序列化與反序列化 CBOR，請在您的組建指令碼中新增 `ktor-serialization-kotlinx-cbor` 構件：

<var name="artifact_name" value="ktor-serialization-kotlinx-cbor"/>
<Tabs group="languages">
    <TabItem title="Gradle (Kotlin)" group-key="kotlin">
        <code-block lang="Kotlin" code="            implementation(&quot;io.ktor:%artifact_name%:$ktor_version&quot;)"/>
    </TabItem>
    <TabItem title="Gradle (Groovy)" group-key="groovy">
        <code-block lang="Groovy" code="            implementation &quot;io.ktor:%artifact_name%:$ktor_version&quot;"/>
    </TabItem>
    <TabItem title="Maven" group-key="maven">
        <code-block lang="XML" code="            &lt;dependency&gt;&#10;                &lt;groupId&gt;io.ktor&lt;/groupId&gt;&#10;                &lt;artifactId&gt;%artifact_name%-jvm&lt;/artifactId&gt;&#10;                &lt;version&gt;${ktor_version}&lt;/version&gt;&#10;            &lt;/dependency&gt;"/>
    </TabItem>
</Tabs>

#### ProtoBuf {id="add_protobuf_dependency"}

要序列化與反序列化 ProtoBuf，請在您的組建指令碼中新增 `ktor-serialization-kotlinx-protobuf` 構件：

<var name="artifact_name" value="ktor-serialization-kotlinx-protobuf"/>
<Tabs group="languages">
    <TabItem title="Gradle (Kotlin)" group-key="kotlin">
        <code-block lang="Kotlin" code="            implementation(&quot;io.ktor:%artifact_name%:$ktor_version&quot;)"/>
    </TabItem>
    <TabItem title="Gradle (Groovy)" group-key="groovy">
        <code-block lang="Groovy" code="            implementation &quot;io.ktor:%artifact_name%:$ktor_version&quot;"/>
    </TabItem>
    <TabItem title="Maven" group-key="maven">
        <code-block lang="XML" code="            &lt;dependency&gt;&#10;                &lt;groupId&gt;io.ktor&lt;/groupId&gt;&#10;                &lt;artifactId&gt;%artifact_name%-jvm&lt;/artifactId&gt;&#10;                &lt;version&gt;${ktor_version}&lt;/version&gt;&#10;            &lt;/dependency&gt;"/>
    </TabItem>
</Tabs>

## 安裝 `ContentNegotiation` {id="install_plugin"}

要安裝 `ContentNegotiation` 外掛程式，請將其傳遞給[用戶端配置區塊](client-create-and-configure.md#configure-client)內的 `install` 函式：

```kotlin
val client = HttpClient(CIO) {
    install(ContentNegotiation)
}
```

然後您可以[配置](#configure_serializer)所需的 JSON 序列化程式。

## 配置序列化程式 {id="configure_serializer"}

### JSON 序列化程式 {id="register_json"}

<Tabs group="json-libraries">
<TabItem title="kotlinx.serialization" group-key="kotlinx">

要在您的應用程式中註冊 JSON 序列化程式，請呼叫 `json()` 函式：

```kotlin
import io.ktor.client.plugins.contentnegotiation.*
import io.ktor.serialization.kotlinx.json.*

val client = HttpClient(CIO) {
    install(ContentNegotiation) {
        json()
    }
}
```

要自訂 JSON 序列化，請在 `json()` 建構函式中傳遞 `Json` 配置：

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

有關可用的配置選項，請參閱 [`JsonBuilder`](https://kotlinlang.org/api/kotlinx.serialization/kotlinx-serialization-json/kotlinx.serialization.json/-json-builder/)。

> 有關完整範例，請參閱 [client-json-kotlinx](https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/client-json-kotlinx)。
>
{style="tip"}

</TabItem>
<TabItem title="Gson" group-key="gson">

要在您的應用程式中註冊 Gson 序列化程式，請呼叫 [`gson()`](https://api.ktor.io/ktor-serialization-gson/io.ktor.serialization.gson/gson.html) 函式：

```kotlin
import io.ktor.client.plugins.contentnegotiation.*
import io.ktor.serialization.gson.*

val client = HttpClient(CIO) {
    install(ContentNegotiation) {
        gson()
    }
}
```

要自訂 Gson 序列化，請將配置區塊傳遞給 `gson()` 函式。有關可用的配置選項，請參閱 [`GsonBuilder`](https://www.javadoc.io/doc/com.google.code.gson/gson/latest/com.google.gson/com/google/gson/GsonBuilder.html)。

</TabItem>
<TabItem title="Jackson" group-key="jackson">

要在您的應用程式中註冊 Jackson 序列化程式，請呼叫 [`jackson()`](https://api.ktor.io/ktor-serialization-jackson/io.ktor.serialization.jackson/jackson.html) 函式：

```kotlin
import io.ktor.client.plugins.contentnegotiation.*
import io.ktor.serialization.jackson.*

val client = HttpClient(CIO) {
    install(ContentNegotiation) {
        jackson()
    }
}
```

要自訂 Jackson 序列化，請使用由 [`ObjectMapper`](https://fasterxml.github.io/jackson-databind/javadoc/2.17.2/com/fasterxml/jackson/databind/ObjectMapper.html) 提供的設定：

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

要在您的應用程式中註冊 XML 序列化程式，請呼叫 `xml()` 函式：

```kotlin
import io.ktor.client.plugins.contentnegotiation.*
import io.ktor.serialization.kotlinx.xml.*

val client = HttpClient(CIO) {
    install(ContentNegotiation) {
        xml()
    }
}
```

要自訂 XML 序列化，請將所需的選項傳遞給 `xml()` 函式：

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

要在您的應用程式中註冊 CBOR 序列化程式，請呼叫 `cbor()` 函式：

```kotlin
import io.ktor.client.plugins.contentnegotiation.*
import io.ktor.serialization.kotlinx.cbor.*

val client = HttpClient(CIO) {
    install(ContentNegotiation) {
        cbor()
    }
}
```

要自訂 CBOR 序列化，請在 `cbor()` 建構函式中傳遞 `Cbor` 配置：

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

有關可用的配置選項，請參閱 [`CborBuilder`](https://kotlinlang.org/api/kotlinx.serialization/kotlinx-serialization-cbor/kotlinx.serialization.cbor/-cbor-builder/)。

### ProtoBuf 序列化程式 {id="register_protobuf"}

要在您的應用程式中註冊 ProtoBuf 序列化程式，請呼叫 `protobuf()` 函式：

```kotlin
import io.ktor.client.plugins.contentnegotiation.*
import io.ktor.serialization.kotlinx.protobuf.*

val client = HttpClient(CIO) {
    install(ContentNegotiation) {
        protobuf()
    }
}
```

要自訂 ProtoBuf 序列化，請將 `ProtoBuf` 配置傳遞給 `protobuf()` 函式：

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

有關可用的選項，請參閱 [`ProtoBufBuilder`](https://kotlinlang.org/api/kotlinx.serialization/kotlinx-serialization-protobuf/kotlinx.serialization.protobuf/-proto-buf-builder/)。

## 配置 `Accept` 標頭 {id="configure_accept_header"}

預設情況下，`ContentNegotiation` 外掛程式會將已註冊的內容類型新增至傳出請求的 `Accept` 標頭中。

如果您明確設定了 `Accept` 標頭，且不希望外掛程式新增已註冊的內容類型，請將 `acceptHeaderMergeStrategy` 屬性設定為 `ContentTypeMergeStrategy.SkipIfPresent`：

```kotlin
val client = HttpClient(CIO) {
    install(ContentNegotiation) {
        register(ContentType.Application.Json, noOpJsonConverter)
        acceptHeaderMergeStrategy = ContentTypeMergeStrategy.SkipIfPresent
    }
}
```

使用 `SkipIfPresent` 時，外掛程式會保留現有的 `Accept` 標頭。如果請求中不包含 `Accept` 標頭，外掛程式將照常新增已註冊的內容類型。

## 傳送和接收資料 {id="receive_send_data"}

### 建立資料類別 {id="create_data_class"}

以下範例使用 `Customer` 資料類別來表示用戶端傳送和接收的資料：

```kotlin
data class Customer(val id: Int, val firstName: String, val lastName: String)
```

如果您使用 `kotlinx.serialization`，請為該類別加上 `@Serializable` 註解：

```kotlin
@Serializable
data class Customer(val id: Int, val firstName: String, val lastName: String)
```

kotlinx.serialization 程式庫支援以下類型的序列化/反序列化：

- [內建類別](https://github.com/Kotlin/kotlinx.serialization/blob/master/docs/builtin-classes.md)
- [序列 (Sequences)](https://kotlinlang.org/docs/sequences.html) 的反序列化
- [流程 (Flows)](https://kotlinlang.org/docs/flow.html) 的序列化

### 傳送資料 {id="send_data"}

要在 [請求 (request)](client-requests.md) 內文中傳送[類別執行個體](#create_data_class)，請使用 `setBody()` 函式指派此執行個體，並使用 `contentType()` 函式設定內容類型。

以下範例以 JSON 格式傳送 `Customer` 物件：

```kotlin
val response: HttpResponse = client.post("http://localhost:8080/customer") {
    contentType(ContentType.Application.Json)
    setBody(Customer(3, "Jet", "Brains"))
}
```

`ContentNegotiation` 外掛程式會使用已配置的序列化程式將請求內文轉換為指定的格式。

若要以其他已註冊的格式傳送資料，請指定對應的內容類型，例如 `ContentType.Application.Xml` 或 `ContentType.Application.Cbor`。

### 接收資料 {id="receive_data"}

當伺服器傳回具有支援之內容類型的 [回應 (response)](client-responses.md) 時，`ContentNegotiation` 外掛程式可以將回應內文反序列化為預期的型別。

例如，要將 JSON 回應反序列化為 `Customer` 物件，請呼叫 `body()` 函式：

```kotlin
val customer: Customer = client.get("http://localhost:8080/customer/3").body()
```

> 有關完整範例，請參閱 [client-json-kotlinx](https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/client-json-kotlinx)。
>
{style="tip"}