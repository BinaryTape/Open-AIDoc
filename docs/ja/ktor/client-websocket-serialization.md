[//]: # (title: Ktor Client における WebSockets のシリアライズ)

<show-structure for="chapter" depth="2"/>

<tldr>
<var name="example_name" value="client-websockets-serialization"/>
<p>
    <b>コード例</b>:
    <a href="https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/%example_name%">
        %example_name%
    </a>
</p>
</tldr>

[ContentNegotiation](client-serialization.md) プラグインと同様に、WebSockets ではテキストフレームを特定の形式でシリアライズ/デシリアライズできます。Ktor クライアントは、標準で JSON、XML、CBOR、ProtoBuf の各形式をサポートしています。

## 依存関係の追加 {id="add_dependencies"}

`kotlinx.serialization` コンバーターを使用する前に、[Setup](https://github.com/Kotlin/kotlinx.serialization#setup) セクションの説明に従って Kotlin serialization プラグインを追加する必要があります。

#### JSON {id="add_json_dependency"}

JSON データをシリアライズ/デシリアライズするには、`kotlinx.serialization`、`Gson`、`Jackson` のいずれかのライブラリを選択できます。

<Tabs group="json-libraries">
<TabItem title="kotlinx.serialization" group-key="kotlinx">

ビルドスクリプトに `ktor-serialization-kotlinx-json` アーティファクトを追加します。

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

ビルドスクリプトに `ktor-serialization-gson` アーティファクトを追加します。

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

ビルドスクリプトに `ktor-serialization-jackson` アーティファクトを追加します。

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

XML をシリアライズ/デシリアライズするには、ビルドスクリプトに `ktor-serialization-kotlinx-xml` を追加します。

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

> XML シリアライズは [`jsNode` ターゲットではサポートされていない](https://github.com/pdvrieze/xmlutil/issues/83)ことに注意してください。
{style="note"}

#### CBOR {id="add_cbor_dependency"}

CBOR をシリアライズ/デシリアライズするには、ビルドスクリプトに `ktor-serialization-kotlinx-cbor` を追加します。

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

ProtoBuf をシリアライズ/デシリアライズするには、ビルドスクリプトに `ktor-serialization-kotlinx-protobuf` を追加します。

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

## シリアライザーの設定 {id="configure_serializer"}

### JSON シリアライザー {id="register_json"}

<Tabs group="json-libraries">
<TabItem title="kotlinx.serialization" group-key="kotlinx">

WebSockets の[設定](client-websockets.topic#install_plugin)で JSON シリアライザーを登録するには、`Json` パラメーターを使用して `KotlinxWebsocketSerializationConverter` インスタンスを作成し、このインスタンスを `contentConverter` プロパティに割り当てます。

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

Gson シリアライザーを登録するには、`GsonWebsocketContentConverter` を `contentConverter` プロパティに割り当てます。

```kotlin
import io.ktor.serialization.gson.*

install(WebSockets) {
    contentConverter = GsonWebsocketContentConverter()
}
```

</TabItem>
<TabItem title="Jackson" group-key="jackson">

Jackson シリアライザーを登録するには、`JacksonWebsocketContentConverter` を `contentConverter` プロパティに割り当てます。

```kotlin
import io.ktor.serialization.jackson.*

install(WebSockets) {
    contentConverter = JacksonWebsocketContentConverter()
}
```

</TabItem>
</Tabs>

### XML シリアライザー {id="register_xml"}

WebSockets の[設定](client-websockets.topic#install_plugin)で XML シリアライザーを登録するには、`XML` パラメーターを使用して `KotlinxWebsocketSerializationConverter` インスタンスを作成し、このインスタンスを `contentConverter` プロパティに割り当てます。

```kotlin
import nl.adaptivity.xmlutil.serialization.*

install(WebSockets) {
    contentConverter = KotlinxWebsocketSerializationConverter(XML)
}
```

### CBOR シリアライザー {id="register_cbor"}
WebSockets の[設定](client-websockets.topic#install_plugin)で CBOR シリアライザーを登録するには、`Cbor` パラメーターを使用して `KotlinxWebsocketSerializationConverter` インスタンスを作成し、このインスタンスを `contentConverter` プロパティに割り当てます。

```kotlin
import io.ktor.serialization.kotlinx.cbor.*

install(WebSockets) {
    contentConverter = KotlinxWebsocketSerializationConverter(Cbor)
}
```

### ProtoBuf シリアライザー {id="register_protobuf"}
WebSockets の[設定](client-websockets.topic#install_plugin)で ProtoBuf シリアライザーを登録するには、`ProtoBuf` パラメーターを使用して `KotlinxWebsocketSerializationConverter` インスタンスを作成し、このインスタンスを `contentConverter` プロパティに割り当てます。

```kotlin
import io.ktor.serialization.kotlinx.protobuf.*

install(WebSockets) {
    contentConverter = KotlinxWebsocketSerializationConverter(ProtoBuf)
}
```

## データの送受信 {id="receive_send_data"}
### データクラスの作成 {id="create_data_class"}

テキストフレームをオブジェクトにシリアライズ/デシリアライズするには、次のようなデータクラスを作成する必要があります。

```kotlin
data class Customer(val id: Int, val firstName: String, val lastName: String)
```

`kotlinx.serialization` を使用する場合は、このクラスに `@Serializable` アノテーションが付いていることを確認してください。

```kotlin
@Serializable
data class Customer(val id: Int, val firstName: String, val lastName: String)
```

`kotlinx.serialization` の詳細については、[Kotlin Serialization Guide](https://github.com/Kotlin/kotlinx.serialization/blob/master/docs/serialization-guide.md) を参照してください。

### データの送信 {id="send_data"}

[指定した形式](#configure_serializer)のテキストフレーム内で[クラスインスタンス](#create_data_class)を送信するには、`sendSerialized` 関数を使用します。

```kotlin
client.webSocket(method = HttpMethod.Get, host = "127.0.0.1", port = 8080, path = "/customer") {
    sendSerialized(Customer(1, "Jane", "Smith"))
}
```

### データの受信 {id="receive_data"}

テキストフレームの内容を受信して変換するには、データクラスをパラメーターとして受け取る `receiveDeserialized` 関数を呼び出します。

```kotlin
client.webSocket(method = HttpMethod.Get, host = "127.0.0.1", port = 8080, path = "/customer/1") {
    val customer = receiveDeserialized<Customer>()
    println("A customer with id ${customer.id} is received by the client.")
}
```

[incoming](client-websockets.topic#incoming) チャネルからデシリアライズされたフレームを受信するには、[WebsocketContentConverter.deserialize](https://api.ktor.io/ktor-serialization/io.ktor.serialization/-websocket-content-converter/deserialize.html) 関数を使用します。`WebsocketContentConverter` は `DefaultClientWebSocketSession.converter` プロパティ経由で利用可能です。

> 完全な例はこちらで確認できます: [client-websockets-serialization](https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/client-websockets-serialization)。