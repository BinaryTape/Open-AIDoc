[//]: # (title: Ktor Client 中的内容协商与序列化)

<show-structure for="chapter" depth="2"/>
<primary-label ref="client-plugin"/>

<var name="plugin_name" value="ContentNegotiation"/>
<var name="artifact_name" value="ktor-client-content-negotiation"/>

<tldr>
<p>
<b>所需依赖项</b>：<code>io.ktor:%artifact_name%</code>
</p>
<var name="example_name" value="client-json-kotlinx"/>
<p>
    <b>代码示例</b>：
    <a href="https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/%example_name%">
        %example_name%
    </a>
</p>
</tldr>

<link-summary>
ContentNegotiation 插件有两个主要用途：在客户端与服务器之间协商媒体类型，以及在发送请求和接收响应时以特定格式序列化/反序列化内容。
</link-summary>

[`ContentNegotiation`](https://api.ktor.io/ktor-client-content-negotiation/io.ktor.client.plugins.contentnegotiation/-content-negotiation) 插件有两个主要用途：
* 在客户端与服务器之间协商媒体类型，使用 `Accept` 和 `Content-Type` 标头。
* 以支持的格式序列化 [请求](client-requests.md) 体以及反序列化 [响应](client-responses.md) 体。Ktor 开箱即用支持 JSON、XML、CBOR 和 ProtoBuf。

> 在服务器端，Ktor 提供了 [`ContentNegotiation`](server-serialization.md) 插件用于序列化和反序列化内容。
>
{style="tip"}

## 添加依赖项 {id="add_dependencies"}

### 内容协商 {id="add_content_negotiation_dependency"}

<p>
    要使用 <code>%plugin_name%</code>，请在构建脚本中添加 <code>%artifact_name%</code> 构件：
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

> 特定格式的序列化器需要额外的构件。
> 
> 例如，`kotlinx.serialization` 需要 `ktor-serialization-kotlinx-json` 依赖项来支持 JSON。根据包含的构件，Ktor 会自动选择默认序列化器。如有需要，您可以显式 [指定序列化器](#configure_serializer) 并对其进行配置。
> 
{style="note"}

<tip>
    要详细了解 Ktor 客户端所需的构件，请参阅 <Links href="/ktor/client-dependencies" summary="了解如何向现有项目添加客户端依赖项。">添加客户端依赖项</Links>。
</tip>

### 序列化 {id="serialization_dependency"}

在开始使用 `kotlinx.serialization` 转换器之前，请按照 [Setup](https://github.com/Kotlin/kotlinx.serialization#setup) 章节所述添加 Kotlin 序列化插件。

#### JSON {id="add_json_dependency"}

要序列化和反序列化 JSON 数据，请向项目中添加序列化库。Ktor 支持 `kotlinx.serialization`、Gson 或 Jackson。

<Tabs group="json-libraries">
<TabItem title="kotlinx.serialization" group-key="kotlinx">

在构建脚本中添加 `ktor-serialization-kotlinx-json` 构件：

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

在构建脚本中添加 `ktor-serialization-gson` 构件：

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

在构建脚本中添加 `ktor-serialization-jackson` 构件：

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

要序列化和反序列化 XML，请在构建脚本中添加 `ktor-serialization-kotlinx-xml` 构件：

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

要序列化和反序列化 CBOR，请在构建脚本中添加 `ktor-serialization-kotlinx-cbor` 构件：

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

要序列化和反序列化 ProtoBuf，请在构建脚本中添加 `ktor-serialization-kotlinx-protobuf` 构件：

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

## 安装 `ContentNegotiation` {id="install_plugin"}

要安装 `ContentNegotiation` 插件，请在 [客户端配置块](client-create-and-configure.md#configure-client) 内部将其传递给 `install` 函数：

```kotlin
val client = HttpClient(CIO) {
    install(ContentNegotiation)
}
```

随后您可以 [配置](#configure_serializer) 所需的 JSON 序列化器。

## 配置序列化器 {id="configure_serializer"}

### JSON 序列化器 {id="register_json"}

<Tabs group="json-libraries">
<TabItem title="kotlinx.serialization" group-key="kotlinx">

要在您的应用程序中注册 JSON 序列化器，请调用 `json()` 函数：

```kotlin
import io.ktor.client.plugins.contentnegotiation.*
import io.ktor.serialization.kotlinx.json.*

val client = HttpClient(CIO) {
    install(ContentNegotiation) {
        json()
    }
}
```

要自定义 JSON 序列化，请在 `json()` 构造函数中传入 `Json` 配置：

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

有关可用的配置选项，请参阅 [`JsonBuilder`](https://kotlinlang.org/api/kotlinx.serialization/kotlinx-serialization-json/kotlinx.serialization.json/-json-builder/)。

> 完整示例请参阅 [client-json-kotlinx](https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/client-json-kotlinx)。
>
{style="tip"}

</TabItem>
<TabItem title="Gson" group-key="gson">

要在您的应用程序中注册 Gson 序列化器，请调用 [`gson()`](https://api.ktor.io/ktor-serialization-gson/io.ktor.serialization.gson/gson.html) 函数：

```kotlin
import io.ktor.client.plugins.contentnegotiation.*
import io.ktor.serialization.gson.*

val client = HttpClient(CIO) {
    install(ContentNegotiation) {
        gson()
    }
}
```

要自定义 Gson 序列化，请向 `gson()` 函数传递一个配置块。有关可用的配置选项，请参阅 [`GsonBuilder`](https://www.javadoc.io/doc/com.google.code.gson/gson/latest/com.google.gson/com/google/gson/GsonBuilder.html)。

</TabItem>
<TabItem title="Jackson" group-key="jackson">

要在您的应用程序中注册 Jackson 序列化器，请调用 [`jackson()`](https://api.ktor.io/ktor-serialization-jackson/io.ktor.serialization.jackson/jackson.html) 函数：

```kotlin
import io.ktor.client.plugins.contentnegotiation.*
import io.ktor.serialization.jackson.*

val client = HttpClient(CIO) {
    install(ContentNegotiation) {
        jackson()
    }
}
```

要自定义 Jackson 序列化，请使用 [`ObjectMapper`](https://fasterxml.github.io/jackson-databind/javadoc/2.17.2/com/fasterxml/jackson/databind/ObjectMapper.html) 提供的设置：

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

### XML 序列化器 {id="register_xml"}

要在您的应用程序中注册 XML 序列化器，请调用 `xml()` 函数：

```kotlin
import io.ktor.client.plugins.contentnegotiation.*
import io.ktor.serialization.kotlinx.xml.*

val client = HttpClient(CIO) {
    install(ContentNegotiation) {
        xml()
    }
}
```

要自定义 XML 序列化，请向 `xml()` 函数传递所需选项：

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

### CBOR 序列化器 {id="register_cbor"}

要在您的应用程序中注册 CBOR 序列化器，请调用 `cbor()` 函数：

```kotlin
import io.ktor.client.plugins.contentnegotiation.*
import io.ktor.serialization.kotlinx.cbor.*

val client = HttpClient(CIO) {
    install(ContentNegotiation) {
        cbor()
    }
}
```

要自定义 CBOR 序列化，请在 `cbor()` 构造函数中传入 `Cbor` 配置：

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

有关可用的配置选项，请参阅 [`CborBuilder`](https://kotlinlang.org/api/kotlinx.serialization/kotlinx-serialization-cbor/kotlinx.serialization.cbor/-cbor-builder/)。

### ProtoBuf 序列化器 {id="register_protobuf"}

要在您的应用程序中注册 ProtoBuf 序列化器，请调用 `protobuf()` 函数：

```kotlin
import io.ktor.client.plugins.contentnegotiation.*
import io.ktor.serialization.kotlinx.protobuf.*

val client = HttpClient(CIO) {
    install(ContentNegotiation) {
        protobuf()
    }
}
```

要自定义 ProtoBuf 序列化，请向 `protobuf()` 函数传入 `ProtoBuf` 配置：

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

有关可用的选项，请参阅 [`ProtoBufBuilder`](https://kotlinlang.org/api/kotlinx.serialization/kotlinx-serialization-protobuf/kotlinx.serialization.protobuf/-proto-buf-builder/)。

## 配置 `Accept` 标头 {id="configure_accept_header"}

默认情况下，`ContentNegotiation` 插件会将已注册的内容类型添加到传出请求的 `Accept` 标头中。

如果您显式设置了 `Accept` 标头，并且不希望插件添加已注册的内容类型，请将 `acceptHeaderMergeStrategy` 属性设置为 `ContentTypeMergeStrategy.SkipIfPresent`：

```kotlin
val client = HttpClient(CIO) {
    install(ContentNegotiation) {
        register(ContentType.Application.Json, noOpJsonConverter)
        acceptHeaderMergeStrategy = ContentTypeMergeStrategy.SkipIfPresent
    }
}
```

使用 `SkipIfPresent` 时，插件会保留现有的 `Accept` 标头。如果请求不包含 `Accept` 标头，插件将照常添加已注册的内容类型。

## 接收和发送数据 {id="receive_send_data"}

### 创建数据类 {id="create_data_class"}

以下示例使用 `Customer` 数据类来表示客户端发送和接收的数据：

```kotlin
data class Customer(val id: Int, val firstName: String, val lastName: String)
```

如果您使用 `kotlinx.serialization`，请为该类添加 `@Serializable` 注解：

```kotlin
@Serializable
data class Customer(val id: Int, val firstName: String, val lastName: String)
```

kotlinx.serialization 库支持以下类型的序列化/反序列化：

- [内置类](https://github.com/Kotlin/kotlinx.serialization/blob/master/docs/builtin-classes.md)
- [Sequences](https://kotlinlang.org/docs/sequences.html) 的反序列化
- [Flows](https://kotlinlang.org/docs/flow.html) 的序列化

### 发送数据 {id="send_data"}

要将 [类实例](#create_data_class) 在 [请求](client-requests.md) 体中发送，请使用 `setBody()` 函数分配此实例，并通过调用 `contentType()` 函数设置内容类型。

以下示例将 `Customer` 对象作为 JSON 发送：

```kotlin
val response: HttpResponse = client.post("http://localhost:8080/customer") {
    contentType(ContentType.Application.Json)
    setBody(Customer(3, "Jet", "Brains"))
}
```

`ContentNegotiation` 插件会使用配置的序列化器将请求体转换为指定格式。

要以其他已注册的格式发送数据，请指定相应的内容类型，例如 `ContentType.Application.Xml` 或 `ContentType.Application.Cbor`。

### 接收数据 {id="receive_data"}

当服务器返回带有受支持内容类型的 [响应](client-responses.md) 时，`ContentNegotiation` 插件可以将响应体反序列化为所需类型。

例如，要将 JSON 响应反序列化为 `Customer` 对象，请调用 `body()` 函数：

```kotlin
val customer: Customer = client.get("http://localhost:8080/customer/3").body()
```

> 完整示例请参阅 [client-json-kotlinx](https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/client-json-kotlinx)。
>
{style="tip"}