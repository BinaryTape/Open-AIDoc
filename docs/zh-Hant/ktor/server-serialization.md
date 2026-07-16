[//]: # (title: Ktor Server 中的內容協商與序列化)

<show-structure for="chapter" depth="2"/>
<primary-label ref="server-plugin"/>

<var name="plugin_name" value="ContentNegotiation"/>
<var name="package_name" value="io.ktor.server.plugins.contentnegotiation"/>
<var name="artifact_name" value="ktor-server-content-negotiation"/>

<tldr>
<p>
<b>必要相依性</b>：<code>io.ktor:%artifact_name%</code>
</p>
<var name="example_name" value="json-kotlinx"/>
<p>
    <b>程式碼範例</b>：
    <a href="https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/%example_name%">
        %example_name%
    </a>
</p>
<p>
    <b><Links href="/ktor/server-native" summary="Ktor 支援 Kotlin/Native，並允許您在沒有額外執行階段或虛擬機的情況下執行伺服器。">原生伺服器</Links> 支援</b>：✅
</p>
</tldr>

<link-summary>
ContentNegotiation 外掛程式有兩個主要目的：在用戶端與伺服器之間協商媒體類型，以及以特定格式序列化/反序列化內容。
</link-summary>

[ContentNegotiation](https://api.ktor.io/ktor-server-content-negotiation/io.ktor.server.plugins.contentnegotiation/-content-negotiation.html) 外掛程式有兩個主要目的：
* 在用戶端與伺服器之間協商媒體類型。為此，它使用了 `Accept` 和 `Content-Type` 標頭。
* 以特定格式序列化/反序列化內容。Ktor 開箱即用支援以下格式：JSON、XML、CBOR 和 ProtoBuf。

> 在用戶端，Ktor 提供了 [ContentNegotiation](client-serialization.md) 外掛程式用於序列化/反序列化內容。

## 新增相依性 {id="add_dependencies"}

### ContentNegotiation {id="add_content_negotiation_dependency"}

<p>
    要使用 <code>%plugin_name%</code>，您需要在建置指令碼中包含 <code>%artifact_name%</code> 構件：
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

請注意，特定格式的序列化程式需要額外的構件。例如，kotlinx.serialization 需要 `ktor-serialization-kotlinx-json` 相依性來處理 JSON。

### 序列化 {id="serialization_dependency"}

<snippet id="add_serialization_dependency">

在開始使用 kotlinx.serialization 轉換器之前，您需要按照 [Setup](https://github.com/Kotlin/kotlinx.serialization#setup) 章節中的說明新增 Kotlin 序列化外掛程式。

#### JSON {id="add_json_dependency"}

要序列化/反序列化 JSON 資料，您可以選擇以下程式庫之一：kotlinx.serialization、Gson 或 Jackson。 

<Tabs group="json-libraries">
<TabItem title="kotlinx.serialization" group-key="kotlinx">

在建置指令碼中新增 `ktor-serialization-kotlinx-json` 構件：

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

在建置指令碼中新增 `ktor-serialization-gson` 構件：

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

在建置指令碼中新增 `ktor-serialization-jackson` 構件：

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

要序列化/反序列化 XML，請在建置指令碼中新增 `ktor-serialization-kotlinx-xml`：

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

> 請注意，XML 序列化 [在 `jsNode` 目標上不受支援](https://github.com/pdvrieze/xmlutil/issues/83)。
{style="note"}

#### CBOR {id="add_cbor_dependency"}

要序列化/反序列化 CBOR，請在建置指令碼中新增 `ktor-serialization-kotlinx-cbor`：

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

要序列化/反序列化 ProtoBuf，請在建置指令碼中新增 `ktor-serialization-kotlinx-protobuf`：

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

</snippet>

## 安裝 ContentNegotiation {id="install_plugin"}

<p>
    要將 <code>%plugin_name%</code> 外掛程式<a href="#install">安裝</a>到應用程式，請將其傳遞給指定<Links href="/ktor/server-modules" summary="模組允許您透過分組路由來建構應用程式。">模組</Links>中的 <code>install</code> 函式。
    下方的程式碼片段展示了如何安裝 <code>%plugin_name%</code> ...
</p>
<list>
    <li>
        ... 在 <code>embeddedServer</code> 函式呼叫中。
    </li>
    <li>
        ... 在明確定義的 <code>module</code> 中，它是 <code>Application</code> 類別的擴充函式。
    </li>
</list>
<Tabs>
    <TabItem title="embeddedServer">
        <code-block lang="kotlin" code="            import io.ktor.server.engine.*&#10;            import io.ktor.server.netty.*&#10;            import io.ktor.server.application.*&#10;            import %package_name%.*&#10;&#10;            fun main() {&#10;                embeddedServer(Netty, port = 8080) {&#10;                    install(%plugin_name%)&#10;                    // ...&#10;                }.start(wait = true)&#10;            }"></code-block>
    </TabItem>
    <TabItem title="module">
        <code-block lang="kotlin" code="            import io.ktor.server.application.*&#10;            import %package_name%.*&#10;            // ...&#10;            fun Application.module() {&#10;                install(%plugin_name%)&#10;                // ...&#10;            }"></code-block>
    </TabItem>
</Tabs>

## 配置序列化程式 {id="configure_serializer"}

Ktor 開箱即用支援以下格式：[JSON](#register_json)、[XML](#register_xml)、[CBOR](#register_cbor)。您也可以實作自訂序列化程式。

### JSON 序列化程式 {id="register_json"}

<Tabs group="json-libraries">
<TabItem title="kotlinx.serialization" group-key="kotlinx">

要在您的應用程式中註冊 JSON 序列化程式，請呼叫 `json` 方法：
```kotlin
import io.ktor.server.plugins.contentnegotiation.*
import io.ktor.serialization.kotlinx.json.*

install(ContentNegotiation) {
    json()
}
```

`json` 方法還允許您調整由 [JsonBuilder](https://kotlinlang.org/api/kotlinx.serialization/kotlinx-serialization-json/kotlinx.serialization.json/-json-builder/) 提供的序列化設定，例如：

```kotlin

    install(ContentNegotiation) {
        json(Json {
            prettyPrint = true
            isLenient = true
        })
```

</TabItem>
<TabItem title="Gson" group-key="gson">

要在您的應用程式中註冊 Gson 序列化程式，請呼叫 `gson` 方法：
```kotlin
import io.ktor.server.plugins.contentnegotiation.*
import io.ktor.serialization.gson.*

install(ContentNegotiation) {
    gson()
}
```

`gson` 方法還允許您調整由 [GsonBuilder](https://www.javadoc.io/doc/com.google.code.gson/gson/latest/com.google.gson/com/google/gson/GsonBuilder.html) 提供的序列化設定，例如：

```kotlin
install(ContentNegotiation) {
    gson {
        registerTypeAdapter(LocalDate::class.java, LocalDateAdapter())
        setDateFormat(DateFormat.LONG, DateFormat.SHORT)
        setPrettyPrinting()
    }
```

</TabItem>
<TabItem title="Jackson" group-key="jackson">

要在您的應用程式中註冊 Jackson 序列化程式，請呼叫 `jackson` 方法：

```kotlin
import io.ktor.server.plugins.contentnegotiation.*
import io.ktor.serialization.jackson.*

install(ContentNegotiation) {
    jackson()
}
```

`jackson` 方法還允許您調整由 [ObjectMapper](https://fasterxml.github.io/jackson-databind/javadoc/2.9/com/fasterxml/jackson/databind/ObjectMapper.html) 提供的序列化設定，例如：

```kotlin
install(ContentNegotiation) {
    jackson {
        configure(SerializationFeature.INDENT_OUTPUT, true)
        setDefaultPrettyPrinter(DefaultPrettyPrinter().apply {
            indentArraysWith(DefaultPrettyPrinter.FixedSpaceIndenter.instance)
            indentObjectsWith(DefaultIndenter("  ", "
"))
        })
        registerModule(JavaTimeModule())  // 支援 java.time.* 型別
    }
}
```

</TabItem>
</Tabs>

### XML 序列化程式 {id="register_xml"}

要在您的應用程式中註冊 XML 序列化程式，請呼叫 `xml` 方法：
```kotlin
import io.ktor.server.plugins.contentnegotiation.*
import io.ktor.serialization.kotlinx.xml.*

install(ContentNegotiation) {
    xml()
}
```

`xml` 方法還允許您存取 XML 序列化設定，例如：

```kotlin
import io.ktor.server.plugins.contentnegotiation.*
import io.ktor.serialization.kotlinx.xml.*
import nl.adaptivity.xmlutil.*
import nl.adaptivity.xmlutil.serialization.*

install(ContentNegotiation) {
    xml(format = XML {
        xmlDeclMode = XmlDeclMode.Charset
    })
}
```

### CBOR 序列化程式 {id="register_cbor"}
要在您的應用程式中註冊 CBOR 序列化程式，請呼叫 `cbor` 方法：
```kotlin
import io.ktor.server.plugins.contentnegotiation.*
import io.ktor.serialization.kotlinx.cbor.*

install(ContentNegotiation) {
    cbor()
}
```

`cbor` 方法還允許您存取由 [CborBuilder](https://kotlinlang.org/api/kotlinx.serialization/kotlinx-serialization-cbor/kotlinx.serialization.cbor/-cbor-builder/) 提供的 CBOR 序列化設定，例如：

```kotlin
import io.ktor.server.plugins.contentnegotiation.*
import io.ktor.serialization.kotlinx.cbor.*
import kotlinx.serialization.cbor.*

install(ContentNegotiation) {
    cbor(Cbor {
        ignoreUnknownKeys = true
    })
}
```

### ProtoBuf 序列化程式 {id="register_protobuf"}
要在您的應用程式中註冊 ProtoBuf 序列化程式，請呼叫 `protobuf` 方法：
```kotlin
import io.ktor.server.plugins.contentnegotiation.*
import io.ktor.serialization.kotlinx.protobuf.*

install(ContentNegotiation) {
    protobuf()
}
```

`protobuf` 方法還允許您存取由 [ProtoBufBuilder](https://kotlinlang.org/api/kotlinx.serialization/kotlinx-serialization-protobuf/kotlinx.serialization.protobuf/-proto-buf-builder/) 提供的 ProtoBuf 序列化設定，例如：

```kotlin
import io.ktor.server.plugins.contentnegotiation.*
import io.ktor.serialization.kotlinx.protobuf.*
import kotlinx.serialization.protobuf.*

install(ContentNegotiation) {
    protobuf(ProtoBuf {
        encodeDefaults = true
    })
}
```

### 自訂序列化程式 {id="register_custom"}

要為指定的 `Content-Type` 註冊自訂序列化程式，您需要呼叫 `register` 方法。在下方的範例中，註冊了兩個 [自訂序列化程式](#implement_custom_serializer) 來反序列化 `application/json` 和 `application/xml` 資料：

```kotlin
install(ContentNegotiation) {
    register(ContentType.Application.Json, CustomJsonConverter())
    register(ContentType.Application.Xml, CustomXmlConverter())
}
```

## 接收與發送資料 {id="receive_send_data"}

### 建立資料類別 {id="create_data_class"}
要將接收到的資料反序列化為物件，您需要建立一個資料類別，例如：
```kotlin
data class Customer(val id: Int, val firstName: String, val lastName: String)
```

如果您使用 kotlinx.serialization，請確保該類別具有 `@Serializable` 註解：
```kotlin
import kotlinx.serialization.*
@Serializable
data class Customer(val id: Int, val firstName: String, val lastName: String)
```

<snippet id="serialization_types">

kotlinx.serialization 程式庫支援以下型別的序列化/反序列化：

- [內建類別](https://github.com/Kotlin/kotlinx.serialization/blob/master/docs/builtin-classes.md)
- 反序列化 [Sequences](https://kotlinlang.org/docs/sequences.html)
- 序列化 [Flows](https://kotlinlang.org/docs/flow.html)

</snippet>

### 接收資料 {id="receive_data"}
要接收並轉換請求內容，請呼叫接受資料類別作為參數的 `receive` 方法：
```kotlin

        post("/customer") {
            val customer = call.receive<Customer>()
            customerStorage.add(customer)
            call.respondText("Customer stored correctly", status = HttpStatusCode.Created)
```

請求的 `Content-Type` 將被用來選擇處理請求的 [序列化程式](#configure_serializer)。下方的範例展示了一個包含 JSON 或 XML 資料的範例 [HTTP 用戶端](https://www.jetbrains.com/help/idea/http-client-in-product-code-editor.html) 請求，這些資料在伺服器端被轉換為 `Customer` 物件：

<Tabs>
<TabItem title="JSON">

```HTTP
POST http://0.0.0.0:8080/customer
Content-Type: application/json

{
  "id": 3,
  "firstName": "Jet",
  "lastName": "Brains"
}

```

</TabItem>
<TabItem title="XML">

```HTTP
POST http://0.0.0.0:8080/customer
Content-Type: application/xml

<Customer id="3" firstName="Jet" lastName="Brains"/>
```

</TabItem>
</Tabs>

您可以在這裡找到完整範例：[json-kotlinx](https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/json-kotlinx)。

### 發送資料 {id="send_data"}
要在回應中傳遞資料物件，您可以使用 `respond` 方法：
```kotlin
routing {
    get("/customer/{id}") {
        val id: Int by call.parameters
        val customer: Customer = customerStorage.find { it.id == id }!!
        call.respond(customer)
```

在這種情況下，Ktor 會使用 `Accept` 標頭來選擇所需的 [序列化程式](#configure_serializer)。您可以在這裡找到完整範例：[json-kotlinx](https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/json-kotlinx)。

## 實作自訂序列化程式 {id="implement_custom_serializer"}

在 Ktor 中，您可以編寫自己的 [序列化程式](#configure_serializer) 來序列化/反序列化資料。為此，您需要實作 [ContentConverter](https://api.ktor.io/ktor-serialization/io.ktor.serialization/-content-converter/index.html) 介面：
```kotlin
interface ContentConverter {
    suspend fun serialize(contentType: ContentType, charset: Charset, typeInfo: TypeInfo, value: Any): OutgoingContent?
    suspend fun deserialize(charset: Charset, typeInfo: TypeInfo, content: ByteReadChannel): Any?
}
```
可以參考 [GsonConverter](https://github.com/ktorio/ktor/blob/main/ktor-shared/ktor-serialization/ktor-serialization-gson/jvm/src/GsonConverter.kt) 類別作為實作範例。