[//]: # (title: Ktor Server의 WebSockets 직렬화)

<show-structure for="chapter" depth="2"/>

<tldr>
<var name="example_name" value="server-websockets-serialization"/>
<p>
    <b>코드 예제</b>:
    <a href="https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/%example_name%">
        %example_name%
    </a>
</p>
</tldr>

[ContentNegotiation](server-serialization.md) 플러그인과 유사하게, WebSockets을 사용하면 텍스트 프레임을 특정 형식으로 직렬화/역직렬화(serialize/deserialize)할 수 있습니다. Ktor는 기본적으로 JSON, XML, CBOR, ProtoBuf 형식을 지원합니다.

## 의존성 추가 {id="add_dependencies"}

kotlinx.serialization 변환기(converter)를 사용하기 전에, [Setup](https://github.com/Kotlin/kotlinx.serialization#setup) 섹션의 설명에 따라 Kotlin 직렬화 플러그인을 추가해야 합니다.

#### JSON {id="add_json_dependency"}

JSON 데이터를 직렬화/역직렬화하려면 kotlinx.serialization, Gson, Jackson 라이브러리 중 하나를 선택할 수 있습니다. 

<Tabs group="json-libraries">
<TabItem title="kotlinx.serialization" group-key="kotlinx">

빌드 스크립트에 `ktor-serialization-kotlinx-json` 아티팩트를 추가합니다:

<var name="artifact_name" value="ktor-serialization-kotlinx-json"/>
<var name="ktor_version_catalog_name" value="ktorLibs.serialization.kotlinx.json"/>
<Tabs group="languages">
    <TabItem title="Gradle (Kotlin)" group-key="kotlin">
        <code-block lang="Kotlin" code="            implementation(%ktor_version_catalog_name%)"/>
        <note>
            위 코드 스니펫은 <a href="server-dependencies.topic#using-version-catalog">Ktor 버전 카탈로그</a>를 사용하여 Ktor 의존성을 지정합니다.
        </note>
    </TabItem>
    <TabItem title="Gradle (Groovy)" group-key="groovy">
        <code-block lang="Groovy" code="            implementation %ktor_version_catalog_name%"/>
        <note>
            위 코드 스니펫은 <a href="server-dependencies.topic#using-version-catalog">Ktor 버전 카탈로그</a>를 사용하여 Ktor 의존성을 지정합니다.
        </note>
    </TabItem>
    <TabItem title="Maven" group-key="maven">
        <code-block lang="XML" code="            &lt;dependency&gt;&#10;                &lt;groupId&gt;io.ktor&lt;/groupId&gt;&#10;                &lt;artifactId&gt;%artifact_name%-jvm&lt;/artifactId&gt;&#10;                &lt;version&gt;${ktor_version}&lt;/version&gt;&#10;            &lt;/dependency&gt;"/>
    </TabItem>
</Tabs>

</TabItem>
<TabItem title="Gson" group-key="gson">

빌드 스크립트에 `ktor-serialization-gson` 아티팩트를 추가합니다:

<var name="artifact_name" value="ktor-serialization-gson"/>
<var name="ktor_version_catalog_name" value="ktorLibs.serialization.gson"/>
<Tabs group="languages">
    <TabItem title="Gradle (Kotlin)" group-key="kotlin">
        <code-block lang="Kotlin" code="            implementation(%ktor_version_catalog_name%)"/>
        <note>
            위 코드 스니펫은 <a href="server-dependencies.topic#using-version-catalog">Ktor 버전 카탈로그</a>를 사용하여 Ktor 의존성을 지정합니다.
        </note>
    </TabItem>
    <TabItem title="Gradle (Groovy)" group-key="groovy">
        <code-block lang="Groovy" code="            implementation %ktor_version_catalog_name%"/>
        <note>
            위 코드 스니펫은 <a href="server-dependencies.topic#using-version-catalog">Ktor 버전 카탈로그</a>를 사용하여 Ktor 의존성을 지정합니다.
        </note>
    </TabItem>
    <TabItem title="Maven" group-key="maven">
        <code-block lang="XML" code="            &lt;dependency&gt;&#10;                &lt;groupId&gt;io.ktor&lt;/groupId&gt;&#10;                &lt;artifactId&gt;%artifact_name%-jvm&lt;/artifactId&gt;&#10;                &lt;version&gt;${ktor_version}&lt;/version&gt;&#10;            &lt;/dependency&gt;"/>
    </TabItem>
</Tabs>

</TabItem>
<TabItem title="Jackson" group-key="jackson">

빌드 스크립트에 `ktor-serialization-jackson` 아티팩트를 추가합니다:

<var name="artifact_name" value="ktor-serialization-jackson"/>
<var name="ktor_version_catalog_name" value="ktorLibs.serialization.jackson"/>
<Tabs group="languages">
    <TabItem title="Gradle (Kotlin)" group-key="kotlin">
        <code-block lang="Kotlin" code="            implementation(%ktor_version_catalog_name%)"/>
        <note>
            위 코드 스니펫은 <a href="server-dependencies.topic#using-version-catalog">Ktor 버전 카탈로그</a>를 사용하여 Ktor 의존성을 지정합니다.
        </note>
    </TabItem>
    <TabItem title="Gradle (Groovy)" group-key="groovy">
        <code-block lang="Groovy" code="            implementation %ktor_version_catalog_name%"/>
        <note>
            위 코드 스니펫은 <a href="server-dependencies.topic#using-version-catalog">Ktor 버전 카탈로그</a>를 사용하여 Ktor 의존성을 지정합니다.
        </note>
    </TabItem>
    <TabItem title="Maven" group-key="maven">
        <code-block lang="XML" code="            &lt;dependency&gt;&#10;                &lt;groupId&gt;io.ktor&lt;/groupId&gt;&#10;                &lt;artifactId&gt;%artifact_name%-jvm&lt;/artifactId&gt;&#10;                &lt;version&gt;${ktor_version}&lt;/version&gt;&#10;            &lt;/dependency&gt;"/>
    </TabItem>
</Tabs>

</TabItem>
</Tabs>

#### XML {id="add_xml_dependency"}

XML을 직렬화/역직렬화하려면 빌드 스크립트에 `ktor-serialization-kotlinx-xml`을 추가합니다:

<var name="artifact_name" value="ktor-serialization-kotlinx-xml"/>
<var name="ktor_version_catalog_name" value="ktorLibs.serialization.kotlinx.xml"/>
<Tabs group="languages">
    <TabItem title="Gradle (Kotlin)" group-key="kotlin">
        <code-block lang="Kotlin" code="            implementation(%ktor_version_catalog_name%)"/>
        <note>
            위 코드 스니펫은 <a href="server-dependencies.topic#using-version-catalog">Ktor 버전 카탈로그</a>를 사용하여 Ktor 의존성을 지정합니다.
        </note>
    </TabItem>
    <TabItem title="Gradle (Groovy)" group-key="groovy">
        <code-block lang="Groovy" code="            implementation %ktor_version_catalog_name%"/>
        <note>
            위 코드 스니펫은 <a href="server-dependencies.topic#using-version-catalog">Ktor 버전 카탈로그</a>를 사용하여 Ktor 의존성을 지정합니다.
        </note>
    </TabItem>
    <TabItem title="Maven" group-key="maven">
        <code-block lang="XML" code="            &lt;dependency&gt;&#10;                &lt;groupId&gt;io.ktor&lt;/groupId&gt;&#10;                &lt;artifactId&gt;%artifact_name%-jvm&lt;/artifactId&gt;&#10;                &lt;version&gt;${ktor_version}&lt;/version&gt;&#10;            &lt;/dependency&gt;"/>
    </TabItem>
</Tabs>

#### CBOR {id="add_cbor_dependency"}

CBOR을 직렬화/역직렬화하려면 빌드 스크립트에 `ktor-serialization-kotlinx-cbor`를 추가합니다:

<var name="artifact_name" value="ktor-serialization-kotlinx-cbor"/>
<var name="ktor_version_catalog_name" value="ktorLibs.serialization.kotlinx.cbor"/>
<Tabs group="languages">
    <TabItem title="Gradle (Kotlin)" group-key="kotlin">
        <code-block lang="Kotlin" code="            implementation(%ktor_version_catalog_name%)"/>
        <note>
            위 코드 스니펫은 <a href="server-dependencies.topic#using-version-catalog">Ktor 버전 카탈로그</a>를 사용하여 Ktor 의존성을 지정합니다.
        </note>
    </TabItem>
    <TabItem title="Gradle (Groovy)" group-key="groovy">
        <code-block lang="Groovy" code="            implementation %ktor_version_catalog_name%"/>
        <note>
            위 코드 스니펫은 <a href="server-dependencies.topic#using-version-catalog">Ktor 버전 카탈로그</a>를 사용하여 Ktor 의존성을 지정합니다.
        </note>
    </TabItem>
    <TabItem title="Maven" group-key="maven">
        <code-block lang="XML" code="            &lt;dependency&gt;&#10;                &lt;groupId&gt;io.ktor&lt;/groupId&gt;&#10;                &lt;artifactId&gt;%artifact_name%-jvm&lt;/artifactId&gt;&#10;                &lt;version&gt;${ktor_version}&lt;/version&gt;&#10;            &lt;/dependency&gt;"/>
    </TabItem>
</Tabs>

#### ProtoBuf {id="add_protobuf_dependency"}

ProtoBuf를 직렬화/역직렬화하려면 빌드 스크립트에 `ktor-serialization-kotlinx-protobuf`를 추가합니다:

<var name="artifact_name" value="ktor-serialization-kotlinx-protobuf"/>
<var name="ktor_version_catalog_name" value="ktorLibs.serialization.kotlinx.protobuf"/>
<Tabs group="languages">
    <TabItem title="Gradle (Kotlin)" group-key="kotlin">
        <code-block lang="Kotlin" code="            implementation(%ktor_version_catalog_name%)"/>
        <note>
            위 코드 스니펫은 <a href="server-dependencies.topic#using-version-catalog">Ktor 버전 카탈로그</a>를 사용하여 Ktor 의존성을 지정합니다.
        </note>
    </TabItem>
    <TabItem title="Gradle (Groovy)" group-key="groovy">
        <code-block lang="Groovy" code="            implementation %ktor_version_catalog_name%"/>
        <note>
            위 코드 스니펫은 <a href="server-dependencies.topic#using-version-catalog">Ktor 버전 카탈로그</a>를 사용하여 Ktor 의존성을 지정합니다.
        </note>
    </TabItem>
    <TabItem title="Maven" group-key="maven">
        <code-block lang="XML" code="            &lt;dependency&gt;&#10;                &lt;groupId&gt;io.ktor&lt;/groupId&gt;&#10;                &lt;artifactId&gt;%artifact_name%-jvm&lt;/artifactId&gt;&#10;                &lt;version&gt;${ktor_version}&lt;/version&gt;&#10;            &lt;/dependency&gt;"/>
    </TabItem>
</Tabs>

## 직렬화기(Serializer) 구성 {id="configure_serializer"}

### JSON 직렬화기 {id="register_json"}

<Tabs group="json-libraries">
<TabItem title="kotlinx.serialization" group-key="kotlinx">

WebSockets [구성](server-websockets.md#configure)에 JSON 직렬화기를 등록하려면, `Json` 파라미터를 사용하여 `KotlinxWebsocketSerializationConverter` 인스턴스를 생성하고 이 인스턴스를 `contentConverter` 프로퍼티에 할당합니다:

```kotlin
import io.ktor.serialization.kotlinx.*
import kotlinx.serialization.json.*

install(WebSockets) {
    contentConverter = KotlinxWebsocketSerializationConverter(Json)
}
```

</TabItem>
<TabItem title="Gson" group-key="gson">

Gson 직렬화기를 등록하려면 `contentConverter` 프로퍼티에 `GsonWebsocketContentConverter`를 할당합니다:
```kotlin
import io.ktor.serialization.gson.*

install(WebSockets) {
    contentConverter = GsonWebsocketContentConverter()
}
```

</TabItem>
<TabItem title="Jackson" group-key="jackson">

Jackson 직렬화기를 등록하려면 `contentConverter` 프로퍼티에 `JacksonWebsocketContentConverter`를 할당합니다:

```kotlin
import io.ktor.serialization.jackson.*

install(WebSockets) {
    contentConverter = JacksonWebsocketContentConverter()
}
```

</TabItem>
</Tabs>

### XML 직렬화기 {id="register_xml"}

WebSockets [구성](server-websockets.md#configure)에 XML 직렬화기를 등록하려면, `XML` 파라미터를 사용하여 `KotlinxWebsocketSerializationConverter` 인스턴스를 생성하고 이 인스턴스를 `contentConverter` 프로퍼티에 할당합니다:
```kotlin
import nl.adaptivity.xmlutil.serialization.*

install(WebSockets) {
    contentConverter = KotlinxWebsocketSerializationConverter(XML)
}
```

### CBOR 직렬화기 {id="register_cbor"}
WebSockets [구성](server-websockets.md#configure)에 CBOR 직렬화기를 등록하려면, `Cbor` 파라미터를 사용하여 `KotlinxWebsocketSerializationConverter` 인스턴스를 생성하고 이 인스턴스를 `contentConverter` 프로퍼티에 할당합니다:

```kotlin
import io.ktor.serialization.kotlinx.cbor.*

install(WebSockets) {
    contentConverter = KotlinxWebsocketSerializationConverter(Cbor)
}
```

### ProtoBuf 직렬화기 {id="register_protobuf"}
WebSockets [구성](server-websockets.md#configure)에 ProtoBuf 직렬화기를 등록하려면, `ProtoBuf` 파라미터를 사용하여 `KotlinxWebsocketSerializationConverter` 인스턴스를 생성하고 이 인스턴스를 `contentConverter` 프로퍼티에 할당합니다:

```kotlin
import kotlinx.serialization.protobuf.*

install(WebSockets) {
    contentConverter = KotlinxWebsocketSerializationConverter(ProtoBuf)
}
```

## 데이터 송수신 {id="receive_send_data"}

### 데이터 클래스 생성 {id="create_data_class"}
프레임을 객체로 역직렬화하거나 객체에서 프레임으로 직렬화하려면 다음과 같이 데이터 클래스를 생성해야 합니다:
```kotlin
data class Customer(val id: Int, val firstName: String, val lastName: String)
```

kotlinx.serialization을 사용하는 경우, 해당 클래스에 `@Serializable` 어노테이션이 추가되어 있는지 확인하세요:
```kotlin
@Serializable
data class Customer(val id: Int, val firstName: String, val lastName: String)
```

### 데이터 수신 {id="receive_data"}
텍스트 프레임의 내용을 수신하고 변환하려면 데이터 클래스를 파라미터로 받는 `receiveDeserialized` 함수를 호출합니다:
```kotlin
webSocket("/customer") {
    val customer = receiveDeserialized<Customer>()
    println("A customer with id ${customer.id} is received by the server.")
}
```

[incoming](server-websockets.md#api-overview) 채널에서 역직렬화된 프레임을 수신하려면 [WebsocketContentConverter.deserialize](https://api.ktor.io/ktor-serialization/io.ktor.serialization/-websocket-content-converter/deserialize.html) 함수를 사용하세요. `WebsocketContentConverter`는 `WebSocketServerSession.converter` 프로퍼티를 통해 접근할 수 있습니다.

### 데이터 전송 {id="send_data"}
[지정된 형식](#configure_serializer)을 사용하여 텍스트 프레임으로 데이터 객체를 전송하려면 `sendSerialized` 함수를 사용할 수 있습니다:

```kotlin
webSocket("/customer/1") {
    sendSerialized(Customer(1, "Jane", "Smith"))
}
```

> 전체 예제는 [server-websockets-serialization](https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/server-websockets-serialization)에서 확인할 수 있습니다.