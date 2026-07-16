[//]: # (title: Ktor Client의 WebSockets 직렬화)

<show-structure for="chapter" depth="2"/>

<tldr>
<var name="example_name" value="client-websockets-serialization"/>
<p>
    <b>코드 예제</b>:
    <a href="https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/%example_name%">
        %example_name%
    </a>
</p>
</tldr>

[ContentNegotiation](client-serialization.md) 플러그인과 마찬가지로, WebSockets를 사용하면 특정 형식으로 텍스트 프레임을 직렬화/역직렬화할 수 있습니다. Ktor 클라이언트는 JSON, XML, CBOR, ProtoBuf 형식을 기본적으로 지원합니다.

## 의존성 추가 {id="add_dependencies"}

kotlinx.serialization 컨버터를 사용하기 전에, [설정(Setup)](https://github.com/Kotlin/kotlinx.serialization#setup) 섹션에 설명된 대로 Kotlin 직렬화 플러그인을 추가해야 합니다.

#### JSON {id="add_json_dependency"}

JSON 데이터를 직렬화/역직렬화하기 위해 kotlinx.serialization, Gson, Jackson 중 하나의 라이브러리를 선택할 수 있습니다. 

<Tabs group="json-libraries">
<TabItem title="kotlinx.serialization" group-key="kotlinx">

빌드 스크립트에 `ktor-serialization-kotlinx-json` 아티팩트를 추가합니다:

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

빌드 스크립트에 `ktor-serialization-gson` 아티팩트를 추가합니다:

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

빌드 스크립트에 `ktor-serialization-jackson` 아티팩트를 추가합니다:

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

XML을 직렬화/역직렬화하려면 빌드 스크립트에 `ktor-serialization-kotlinx-xml`을 추가합니다:

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

> XML 직렬화는 [`jsNode` 타겟에서 지원되지 않음](https://github.com/pdvrieze/xmlutil/issues/83)에 유의하세요.
{style="note"}

#### CBOR {id="add_cbor_dependency"}

CBOR을 직렬화/역직렬화하려면 빌드 스크립트에 `ktor-serialization-kotlinx-cbor`을 추가합니다:

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

ProtoBuf를 직렬화/역직렬화하려면 빌드 스크립트에 `ktor-serialization-kotlinx-protobuf`를 추가합니다:

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

## 직렬화 도구 구성 {id="configure_serializer"}

### JSON 직렬화 도구 {id="register_json"}

<Tabs group="json-libraries">
<TabItem title="kotlinx.serialization" group-key="kotlinx">

WebSockets [구성](client-websockets.topic#install_plugin)에서 JSON 직렬화 도구를 등록하려면, `Json` 매개변수를 사용하여 `KotlinxWebsocketSerializationConverter` 인스턴스를 생성하고 이 인스턴스를 `contentConverter` 속성에 할당하세요:

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

Gson 직렬화 도구를 등록하려면, `GsonWebsocketContentConverter`를 `contentConverter` 속성에 할당하세요:

```kotlin
import io.ktor.serialization.gson.*

install(WebSockets) {
    contentConverter = GsonWebsocketContentConverter()
}
```

</TabItem>
<TabItem title="Jackson" group-key="jackson">

Jackson 직렬화 도구를 등록하려면, `JacksonWebsocketContentConverter`를 `contentConverter` 속성에 할당하세요:

```kotlin
import io.ktor.serialization.jackson.*

install(WebSockets) {
    contentConverter = JacksonWebsocketContentConverter()
}
```

</TabItem>
</Tabs>

### XML 직렬화 도구 {id="register_xml"}

WebSockets [구성](client-websockets.topic#install_plugin)에서 XML 직렬화 도구를 등록하려면, `XML` 매개변수를 사용하여 `KotlinxWebsocketSerializationConverter` 인스턴스를 생성하고 이 인스턴스를 `contentConverter` 속성에 할당하세요:

```kotlin
import nl.adaptivity.xmlutil.serialization.*

install(WebSockets) {
    contentConverter = KotlinxWebsocketSerializationConverter(XML)
}
```

### CBOR 직렬화 도구 {id="register_cbor"}
WebSockets [구성](client-websockets.topic#install_plugin)에서 CBOR 직렬화 도구를 등록하려면, `Cbor` 매개변수를 사용하여 `KotlinxWebsocketSerializationConverter` 인스턴스를 생성하고 이 인스턴스를 `contentConverter` 속성에 할당하세요:

```kotlin
import io.ktor.serialization.kotlinx.cbor.*

install(WebSockets) {
    contentConverter = KotlinxWebsocketSerializationConverter(Cbor)
}
```

### ProtoBuf 직렬화 도구 {id="register_protobuf"}
WebSockets [구성](client-websockets.topic#install_plugin)에서 ProtoBuf 직렬화 도구를 등록하려면, `ProtoBuf` 매개변수를 사용하여 `KotlinxWebsocketSerializationConverter` 인스턴스를 생성하고 이 인스턴스를 `contentConverter` 속성에 할당하세요:

```kotlin
import io.ktor.serialization.kotlinx.protobuf.*

install(WebSockets) {
    contentConverter = KotlinxWebsocketSerializationConverter(ProtoBuf)
}
```

## 데이터 수신 및 전송 {id="receive_send_data"}
### 데이터 클래스 생성 {id="create_data_class"}

텍스트 프레임을 객체로 직렬화/역직렬화하려면, 예를 들어 다음과 같은 데이터 클래스를 생성해야 합니다:

```kotlin
data class Customer(val id: Int, val firstName: String, val lastName: String)
```

kotlinx.serialization을 사용하는 경우, 해당 클래스에 `@Serializable` 어노테이션이 있는지 확인하세요:

```kotlin
@Serializable
data class Customer(val id: Int, val firstName: String, val lastName: String)
```

`kotlinx.serialization`에 대해 더 자세히 알아보려면 [Kotlin Serialization 가이드](https://github.com/Kotlin/kotlinx.serialization/blob/master/docs/serialization-guide.md)를 참조하세요.

### 데이터 전송 {id="send_data"}

[지정된 형식](#configure_serializer)의 텍스트 프레임 내에서 [클래스 인스턴스](#create_data_class)를 전송하려면, `sendSerialized` 함수를 사용하세요:

```kotlin
client.webSocket(method = HttpMethod.Get, host = "127.0.0.1", port = 8080, path = "/customer") {
    sendSerialized(Customer(1, "Jane", "Smith"))
}
```

### 데이터 수신 {id="receive_data"}

텍스트 프레임의 콘텐츠를 수신하고 변환하려면, 데이터 클래스를 매개변수로 받는 `receiveDeserialized` 함수를 호출하세요:

```kotlin
client.webSocket(method = HttpMethod.Get, host = "127.0.0.1", port = 8080, path = "/customer/1") {
    val customer = receiveDeserialized<Customer>()
    println("A customer with id ${customer.id} is received by the client.")
}
```

[incoming](client-websockets.topic#incoming) 채널에서 역직렬화된 프레임을 수신하려면, [WebsocketContentConverter.deserialize](https://api.ktor.io/ktor-serialization/io.ktor.serialization/-websocket-content-converter/deserialize.html) 함수를 사용하세요. `WebsocketContentConverter`는 `DefaultClientWebSocketSession.converter` 속성을 통해 사용할 수 있습니다.

> 전체 예제는 여기에서 확인할 수 있습니다: [client-websockets-serialization](https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/client-websockets-serialization).