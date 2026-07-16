[//]: # (title: Ktor Client 中的 WebSockets 序列化)

<show-structure for="chapter" depth="2"/>

<tldr>
<var name="example_name" value="client-websockets-serialization"/>
<p>
    <b>代码示例</b>：
    <a href="https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/%example_name%">
        %example_name%
    </a>
</p>
</tldr>

类似于 [ContentNegotiation](client-serialization.md) 插件，WebSockets 允许您以特定格式序列化/反序列化文本帧。Ktor 客户端开箱即用支持以下格式：JSON、XML、CBOR 和 ProtoBuf。

## 添加依赖项 {id="add_dependencies"}

在开始使用 kotlinx.serialization 转换器之前，您需要按照 [设置](https://github.com/Kotlin/kotlinx.serialization#setup) 部分所述添加 Kotlin 序列化插件。

#### JSON {id="add_json_dependency"}

要序列化/反序列化 JSON 数据，您可以从以下库中任选其一：kotlinx.serialization、Gson 或 Jackson。 

<Tabs group="json-libraries">
<TabItem title="kotlinx.serialization" group-key="kotlinx">

在构建脚本中添加 `ktor-serialization-kotlinx-json` 工件：

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

在构建脚本中添加 `ktor-serialization-gson` 工件：

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

在构建脚本中添加 `ktor-serialization-jackson` 工件：

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

要序列化/反序列化 XML，请在构建脚本中添加 `ktor-serialization-kotlinx-xml`：

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

> 请注意，XML 序列化 [在 `jsNode` 目标平台上不受支持](https://github.com/pdvrieze/xmlutil/issues/83)。
{style="note"}

#### CBOR {id="add_cbor_dependency"}

要序列化/反序列化 CBOR，请在构建脚本中添加 `ktor-serialization-kotlinx-cbor`：

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

要序列化/反序列化 ProtoBuf，请在构建脚本中添加 `ktor-serialization-kotlinx-protobuf`：

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

## 配置序列化器 {id="configure_serializer"}

### JSON 序列化器 {id="register_json"}

<Tabs group="json-libraries">
<TabItem title="kotlinx.serialization" group-key="kotlinx">

要在 WebSockets [配置](client-websockets.topic#install_plugin) 中注册 JSON 序列化器，请创建一个带有 `Json` 参数的 `KotlinxWebsocketSerializationConverter` 实例，并将该实例分配给 `contentConverter` 属性：

```kotlin
import io.ktor.serialization.kotlinx.*
import kotlinx.serialization.json.*

val client = HttpClient(CIO) {
    install(WebSockets) {
        contentConverter = KotlinxWebsocketSerializationConverter(Json)
    }
}
```

</TabItem>
<TabItem title="Gson" group-key="gson">

要注册 Gson 序列化器，请将 `GsonWebsocketContentConverter` 分配给 `contentConverter` 属性：

```kotlin
import io.ktor.serialization.gson.*

install(WebSockets) {
    contentConverter = GsonWebsocketContentConverter()
}
```

</TabItem>
<TabItem title="Jackson" group-key="jackson">

要注册 Jackson 序列化器，请将 `JacksonWebsocketContentConverter` 分配给 `contentConverter` 属性：

```kotlin
import io.ktor.serialization.jackson.*

install(WebSockets) {
    contentConverter = JacksonWebsocketContentConverter()
}
```

</TabItem>
</Tabs>

### XML 序列化器 {id="register_xml"}

要在 WebSockets [配置](client-websockets.topic#install_plugin) 中注册 XML 序列化器，请创建一个带有 `XML` 参数的 `KotlinxWebsocketSerializationConverter` 实例，并将该实例分配给 `contentConverter` 属性：

```kotlin
import nl.adaptivity.xmlutil.serialization.*

install(WebSockets) {
    contentConverter = KotlinxWebsocketSerializationConverter(XML)
}
```

### CBOR 序列化器 {id="register_cbor"}
要在 WebSockets [配置](client-websockets.topic#install_plugin) 中注册 CBOR 序列化器，请创建一个带有 `Cbor` 参数的 `KotlinxWebsocketSerializationConverter` 实例，并将该实例分配给 `contentConverter` 属性：

```kotlin
import io.ktor.serialization.kotlinx.cbor.*

install(WebSockets) {
    contentConverter = KotlinxWebsocketSerializationConverter(Cbor)
}
```

### ProtoBuf 序列化器 {id="register_protobuf"}
要在 WebSockets [配置](client-websockets.topic#install_plugin) 中注册 ProtoBuf 序列化器，请创建一个带有 `ProtoBuf` 参数的 `KotlinxWebsocketSerializationConverter` 实例，并将该实例分配给 `contentConverter` 属性：

```kotlin
import io.ktor.serialization.kotlinx.protobuf.*

install(WebSockets) {
    contentConverter = KotlinxWebsocketSerializationConverter(ProtoBuf)
}
```

## 接收和发送数据 {id="receive_send_data"}
### 创建数据类 {id="create_data_class"}

要将文本帧序列化/反序列化为对象或从对象转换，您需要创建一个数据类，例如：

```kotlin
data class Customer(val id: Int, val firstName: String, val lastName: String)
```

如果您使用 kotlinx.serialization，请确保该类带有 `@Serializable` 注解：

```kotlin
@Serializable
data class Customer(val id: Int, val firstName: String, val lastName: String)
```

要了解有关 `kotlinx.serialization` 的更多信息，请参阅 [Kotlin 序列化指南](https://github.com/Kotlin/kotlinx.serialization/blob/master/docs/serialization-guide.md)。

### 发送数据 {id="send_data"}

要在指定的 [格式](#configure_serializer) 下通过文本帧发送 [类实例](#create_data_class)，请使用 `sendSerialized` 函数：

```kotlin
client.webSocket(method = HttpMethod.Get, host = "127.0.0.1", port = 8080, path = "/customer") {
    sendSerialized(Customer(1, "Jane", "Smith"))
}
```

### 接收数据 {id="receive_data"}

要接收并转换文本帧的内容，请调用 `receiveDeserialized` 函数，该函数接受一个数据类作为参数：

```kotlin
client.webSocket(method = HttpMethod.Get, host = "127.0.0.1", port = 8080, path = "/customer/1") {
    val customer = receiveDeserialized<Customer>()
    println("A customer with id ${customer.id} is received by the client.")
}
```

要从 [incoming](client-websockets.topic#incoming) 通道接收反序列化帧，请使用 [WebsocketContentConverter.deserialize](https://api.ktor.io/ktor-serialization/io.ktor.serialization/-websocket-content-converter/deserialize.html) 函数。`WebsocketContentConverter` 可通过 `DefaultClientWebSocketSession.converter` 属性获取。

> 您可以在此处找到完整示例：[client-websockets-serialization](https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/client-websockets-serialization)。