[//]: # (title: Ktor 클라이언트의 콘텐츠 협상 및 직렬화)

<show-structure for="chapter" depth="2"/>
<primary-label ref="client-plugin"/>

<var name="plugin_name" value="ContentNegotiation"/>
<var name="artifact_name" value="ktor-client-content-negotiation"/>

<tldr>
<p>
<b>필수 의존성</b>: <code>io.ktor:%artifact_name%</code>
</p>
<var name="example_name" value="client-json-kotlinx"/>
<p>
    <b>코드 예제</b>:
    <a href="https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/%example_name%">
        %example_name%
    </a>
</p>
</tldr>

<link-summary>
ContentNegotiation 플러그인은 클라이언트와 서버 간의 미디어 타입을 협상하고, 요청을 보내거나 응답을 받을 때 특정 형식으로 콘텐츠를 직렬화/역직렬화하는 두 가지 주요 목적을 수행합니다.
</link-summary>

[ContentNegotiation](https://api.ktor.io/ktor-client-content-negotiation/io.ktor.client.plugins.contentnegotiation/-content-negotiation)
플러그인은 두 가지 주요 목적을 수행합니다:
* 클라이언트와 서버 간의 미디어 타입(Media types)을 협상합니다. 이를 위해 `Accept` 및 `Content-Type` 헤더를 사용합니다.
* [요청(Requests)](client-requests.md)을 보내고 [응답(Responses)](client-responses.md)을 받을 때 콘텐츠를 특정 형식으로 직렬화(Serializing)/역직렬화(Deserializing)합니다. Ktor는 JSON, XML, CBOR, ProtoBuf 형식을 기본적으로 지원합니다.

> 서버 측에서 Ktor는 콘텐츠 직렬화/역직렬화를 위한 [ContentNegotiation](server-serialization.md) 플러그인을 제공합니다.

## 의존성 추가 {id="add_dependencies"}
### ContentNegotiation {id="add_content_negotiation_dependency"}

<p>
    <code>%plugin_name%</code>을 사용하려면 빌드 스크립트에 <code>%artifact_name%</code> 아티팩트를 포함해야 합니다:
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
    Ktor 클라이언트에 필요한 아티팩트에 대한 자세한 내용은 <Links href="/ktor/client-dependencies" summary="기존 프로젝트에 클라이언트 의존성을 추가하는 방법을 알아봅니다.">클라이언트 의존성 추가</Links>에서 확인할 수 있습니다.
</tip>

특정 형식에 대한 직렬화기(Serializer)에는 추가 아티팩트가 필요합니다. 예를 들어, JSON을 위한 kotlinx.serialization은 `ktor-serialization-kotlinx-json` 의존성이 필요합니다. 포함된 아티팩트에 따라 Ktor는 자동으로 기본 직렬화기를 선택합니다. 필요한 경우 직렬화기를 명시적으로 [지정하고 구성](#configure_serializer)할 수 있습니다.

### 직렬화 (Serialization) {id="serialization_dependency"}

kotlinx.serialization 컨버터를 사용하기 전에 [설정(Setup)](https://github.com/Kotlin/kotlinx.serialization#setup) 섹션에 설명된 대로 Kotlin 직렬화 플러그인을 추가해야 합니다.

#### JSON {id="add_json_dependency"}

JSON 데이터를 직렬화/역직렬화하기 위해 kotlinx.serialization, Gson, Jackson 라이브러리 중 하나를 선택할 수 있습니다.

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

> XML 직렬화는 [`jsNode` 타겟에서 지원되지 않습니다](https://github.com/pdvrieze/xmlutil/issues/83).
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

## ContentNegotiation 설치 {id="install_plugin"}

`ContentNegotiation`을 설치하려면 [클라이언트 구성 블록](client-create-and-configure.md#configure-client) 내부의 `install` 함수에 전달합니다:

```kotlin
val client = HttpClient(CIO) {
    install(ContentNegotiation)
}
```
이제 필요한 JSON 직렬화기를 [구성](#configure_serializer)할 수 있습니다.

## 직렬화기 구성 {id="configure_serializer"}

### JSON 직렬화기 {id="register_json"}

<Tabs group="json-libraries">
<TabItem title="kotlinx.serialization" group-key="kotlinx">

애플리케이션에 JSON 직렬화기를 등록하려면 `json` 메서드를 호출합니다:
```kotlin
import io.ktor.client.plugins.contentnegotiation.*
import io.ktor.serialization.kotlinx.json.*

val client = HttpClient(CIO) {
    install(ContentNegotiation) {
        json()
    }
}
```

`json` 생성자에서 [JsonBuilder](https://kotlinlang.org/api/kotlinx.serialization/kotlinx-serialization-json/kotlinx.serialization.json/-json-builder/) API에 접근할 수 있습니다. 예:
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

전체 예제는 여기에서 확인할 수 있습니다: [client-json-kotlinx](https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/client-json-kotlinx).

</TabItem>
<TabItem title="Gson" group-key="gson">

애플리케이션에 Gson 직렬화기를 등록하려면 [gson](https://api.ktor.io/ktor-serialization-gson/io.ktor.serialization.gson/gson.html) 메서드를 호출합니다:
```kotlin
import io.ktor.client.plugins.contentnegotiation.*
import io.ktor.serialization.gson.*

val client = HttpClient(CIO) {
    install(ContentNegotiation) {
        gson()
    }
}
```

`gson` 메서드를 사용하면 [GsonBuilder](https://www.javadoc.io/doc/com.google.code.gson/gson/latest/com.google.gson/com/google/gson/GsonBuilder.html)에서 제공하는 직렬화 설정을 조정할 수도 있습니다.

</TabItem>
<TabItem title="Jackson" group-key="jackson">

애플리케이션에 Jackson 직렬화기를 등록하려면 [jackson](https://api.ktor.io/ktor-serialization-jackson/io.ktor.serialization.jackson/jackson.html) 메서드를 호출합니다:

```kotlin
import io.ktor.client.plugins.contentnegotiation.*
import io.ktor.serialization.jackson.*

val client = HttpClient(CIO) {
    install(ContentNegotiation) {
        jackson()
    }
}
```

`jackson` 메서드를 사용하면 [ObjectMapper](https://fasterxml.github.io/jackson-databind/javadoc/2.17.2/com/fasterxml/jackson/databind/ObjectMapper.html)에서 제공하는 직렬화 설정을 조정할 수도 있습니다. 예:

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

### XML 직렬화기 {id="register_xml"}

애플리케이션에 XML 직렬화기를 등록하려면 `xml` 메서드를 호출합니다:
```kotlin
import io.ktor.client.plugins.contentnegotiation.*
import io.ktor.serialization.kotlinx.xml.*

val client = HttpClient(CIO) {
    install(ContentNegotiation) {
        xml()
    }
}
```

`xml` 메서드를 사용하면 XML 직렬화 설정에 접근할 수도 있습니다. 예:

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

### CBOR 직렬화기 {id="register_cbor"}
애플리케이션에 CBOR 직렬화기를 등록하려면 `cbor` 메서드를 호출합니다:
```kotlin
import io.ktor.client.plugins.contentnegotiation.*
import io.ktor.serialization.kotlinx.cbor.*

val client = HttpClient(CIO) {
    install(ContentNegotiation) {
        cbor()
    }
}
```

`cbor` 메서드를 사용하면 [CborBuilder](https://kotlinlang.org/api/kotlinx.serialization/kotlinx-serialization-cbor/kotlinx.serialization.cbor/-cbor-builder/)에서 제공하는 CBOR 직렬화 설정에 접근할 수도 있습니다. 예:

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

### ProtoBuf 직렬화기 {id="register_protobuf"}
애플리케이션에 ProtoBuf 직렬화기를 등록하려면 `protobuf` 메서드를 호출합니다:
```kotlin
import io.ktor.client.plugins.contentnegotiation.*
import io.ktor.serialization.kotlinx.protobuf.*

val client = HttpClient(CIO) {
    install(ContentNegotiation) {
        protobuf()
    }
}
```

`protobuf` 메서드를 사용하면 [ProtoBufBuilder](https://kotlinlang.org/api/kotlinx.serialization/kotlinx-serialization-protobuf/kotlinx.serialization.protobuf/-proto-buf-builder/)에서 제공하는 ProtoBuf 직렬화 설정에 접근할 수도 있습니다. 예:

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

## 데이터 받기 및 보내기 {id="receive_send_data"}
### 데이터 클래스 생성 {id="create_data_class"}

데이터를 주고받으려면 데이터 클래스가 필요합니다. 예:
```kotlin
data class Customer(val id: Int, val firstName: String, val lastName: String)
```

kotlinx.serialization을 사용하는 경우, 해당 클래스에 `@Serializable` 어노테이션이 있는지 확인하세요:
```kotlin
@Serializable
data class Customer(val id: Int, val firstName: String, val lastName: String)
```

다음 타입의 직렬화/역직렬화는 kotlinx.serialization 라이브러리에 의해 지원됩니다:

- [내장 클래스 (Builtin classes)](https://github.com/Kotlin/kotlinx.serialization/blob/master/docs/builtin-classes.md)
- [시퀀스 (Sequences)](https://kotlinlang.org/docs/sequences.html) 역직렬화
- [플로우 (Flows)](https://kotlinlang.org/docs/flow.html) 직렬화

### 데이터 보내기 {id="send_data"}

[요청(Request)](client-requests.md) 바디에 [클래스 인스턴스](#create_data_class)를 JSON으로 보내려면, `setBody` 함수를 사용하여 이 인스턴스를 할당하고 `contentType`을 호출하여 콘텐츠 타입을 `application/json`으로 설정합니다:

```kotlin
val response: HttpResponse = client.post("http://localhost:8080/customer") {
    contentType(ContentType.Application.Json)
    setBody(Customer(3, "Jet", "Brains"))
}
```

데이터를 XML 또는 CBOR로 보내려면 `contentType`을 각각 `ContentType.Application.Xml` 또는 `ContentType.Application.Cbor`로 설정합니다.

### 데이터 받기 {id="receive_data"}

서버가 `application/json`, `application/xml` 또는 `application/cbor` 콘텐츠를 포함한 [응답(Response)](client-responses.md)을 보낼 때, 응답 페이로드를 받는 데 사용되는 함수(아래 예제의 `body`)의 파라미터로 [데이터 클래스](#create_data_class)를 지정하여 역직렬화할 수 있습니다:
```kotlin
val customer: Customer = client.get("http://localhost:8080/customer/3").body()
```

전체 예제는 여기에서 확인할 수 있습니다: [client-json-kotlinx](https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/client-json-kotlinx).