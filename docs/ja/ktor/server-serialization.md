[//]: # (title: Ktor Server におけるコンテンツ・ネゴシエーションとシリアライズ)

<show-structure for="chapter" depth="2"/>
<primary-label ref="server-plugin"/>

<var name="plugin_name" value="ContentNegotiation"/>
<var name="package_name" value="io.ktor.server.plugins.contentnegotiation"/>
<var name="artifact_name" value="ktor-server-content-negotiation"/>

<tldr>
<p>
<b>必要な依存関係</b>: <code>io.ktor:%artifact_name%</code>
</p>
<var name="example_name" value="json-kotlinx"/>
<p>
    <b>コード例</b>:
    <a href="https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/%example_name%">
        %example_name%
    </a>
</p>
<p>
    <b><Links href="/ktor/server-native" summary="Ktor は Kotlin/Native をサポートしており、追加のランタイムや仮想マシンなしでサーバーを実行できます。">Native サーバー</Links> のサポート</b>: ✅
</p>
</tldr>

<link-summary>
ContentNegotiation プラグインは、主に2つの目的を果たします。クライアントとサーバー間でのメディアタイプのネゴシエーションと、特定のフォーマットでのコンテンツのシリアライズ/デシリアライズです。
</link-summary>

[ContentNegotiation](https://api.ktor.io/ktor-server-content-negotiation/io.ktor.server.plugins.contentnegotiation/-content-negotiation.html) プラグインは、主に2つの目的を果たします。
* クライアントとサーバー間でのメディアタイプのネゴシエーション。これには `Accept` および `Content-Type` ヘッダーを使用します。
* 特定のフォーマットでのコンテンツのシリアライズ/デシリアライズ。Ktor は、JSON、XML、CBOR、ProtoBuf の各フォーマットを標準でサポートしています。

> クライアント側では、Ktor はコンテンツのシリアライズ/デシリアライズのために [ContentNegotiation](client-serialization.md) プラグインを提供しています。

## 依存関係の追加 {id="add_dependencies"}

### ContentNegotiation {id="add_content_negotiation_dependency"}

<p>
    <code>%plugin_name%</code> を使用するには、ビルドスクリプトに <code>%artifact_name%</code> アーティファクトを含める必要があります。
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

特定のフォーマットのシリアライザーには追加のアーティファクトが必要であることに注意してください。たとえば、kotlinx.serialization で JSON を使用するには `ktor-serialization-kotlinx-json` 依存関係が必要です。

### シリアライズ {id="serialization_dependency"}

<snippet id="add_serialization_dependency">

kotlinx.serialization コンバーターを使用する前に、[Setup](https://github.com/Kotlin/kotlinx.serialization#setup) セクションの説明に従って Kotlin serialization プラグインを追加する必要があります。

#### JSON {id="add_json_dependency"}

JSON データをシリアライズ/デシリアライズするには、kotlinx.serialization、Gson、Jackson のいずれかのライブラリを選択できます。 

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

> XML シリアライズは [`jsNode` ターゲットではサポートされていない](https://github.com/pdvrieze/xmlutil/issues/83) ことに注意してください。
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

</snippet>

## ContentNegotiation のインストール {id="install_plugin"}

<p>
    <code>%plugin_name%</code> プラグインをアプリケーションに <a href="#install">インストール</a> するには、
    指定された <Links href="/ktor/server-modules" summary="モジュールを使用すると、ルートをグループ化してアプリケーションを構造化できます。">モジュール</Links> 内で <code>install</code> 関数に渡します。
    以下のコードスニペットは、<code>%plugin_name%</code> のインストール方法を示しています ...
</p>
<list>
    <li>
        ... <code>embeddedServer</code> 関数の呼び出し内。
    </li>
    <li>
        ... <code>Application</code> クラスの拡張関数である明示的に定義された <code>module</code> 内。
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

## シリアライザーの設定 {id="configure_serializer"}

Ktor は、[JSON](#register_json)、[XML](#register_xml)、[CBOR](#register_cbor) の各フォーマットを標準でサポートしています。また、独自のカスタムシリアライザーを実装することもできます。

### JSON シリアライザー {id="register_json"}

<Tabs group="json-libraries">
<TabItem title="kotlinx.serialization" group-key="kotlinx">

アプリケーションに JSON シリアライザーを登録するには、`json` メソッドを呼び出します。
```kotlin
import io.ktor.server.plugins.contentnegotiation.*
import io.ktor.serialization.kotlinx.json.*

install(ContentNegotiation) {
    json()
}
```

`json` メソッドでは、[JsonBuilder](https://kotlinlang.org/api/kotlinx.serialization/kotlinx-serialization-json/kotlinx.serialization.json/-json-builder/) によって提供されるシリアライズ設定を調整することもできます。例：

```kotlin

    install(ContentNegotiation) {
        json(Json {
            prettyPrint = true
            isLenient = true
        })
```

</TabItem>
<TabItem title="Gson" group-key="gson">

アプリケーションに Gson シリアライザーを登録するには、`gson` メソッドを呼び出します。
```kotlin
import io.ktor.server.plugins.contentnegotiation.*
import io.ktor.serialization.gson.*

install(ContentNegotiation) {
    gson()
}
```

`gson` メソッドでは、[GsonBuilder](https://www.javadoc.io/doc/com.google.code.gson/gson/latest/com.google.gson/com/google/gson/GsonBuilder.html) によって提供されるシリアライズ設定を調整することもできます。例：

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

アプリケーションに Jackson シリアライザーを登録するには、`jackson` メソッドを呼び出します。

```kotlin
import io.ktor.server.plugins.contentnegotiation.*
import io.ktor.serialization.jackson.*

install(ContentNegotiation) {
    jackson()
}
```

`jackson` メソッドでは、[ObjectMapper](https://fasterxml.github.io/jackson-databind/javadoc/2.9/com/fasterxml/jackson/databind/ObjectMapper.html) によって提供されるシリアライズ設定を調整することもできます。例：

```kotlin
install(ContentNegotiation) {
    jackson {
        configure(SerializationFeature.INDENT_OUTPUT, true)
        setDefaultPrettyPrinter(DefaultPrettyPrinter().apply {
            indentArraysWith(DefaultPrettyPrinter.FixedSpaceIndenter.instance)
            indentObjectsWith(DefaultIndenter("  ", "
"))
        })
        registerModule(JavaTimeModule())  // java.time.* 型をサポート
    }
}
```

</TabItem>
</Tabs>

### XML シリアライザー {id="register_xml"}

アプリケーションに XML シリアライザーを登録するには、`xml` メソッドを呼び出します。
```kotlin
import io.ktor.server.plugins.contentnegotiation.*
import io.ktor.serialization.kotlinx.xml.*

install(ContentNegotiation) {
    xml()
}
```

`xml` メソッドでは、XML シリアライズ設定にアクセスすることもできます。例：

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

### CBOR シリアライザー {id="register_cbor"}
アプリケーションに CBOR シリアライザーを登録するには、`cbor` メソッドを呼び出します。
```kotlin
import io.ktor.server.plugins.contentnegotiation.*
import io.ktor.serialization.kotlinx.cbor.*

install(ContentNegotiation) {
    cbor()
}
```

`cbor` メソッドでは、[CborBuilder](https://kotlinlang.org/api/kotlinx.serialization/kotlinx-serialization-cbor/kotlinx.serialization.cbor/-cbor-builder/) によって提供される CBOR シリアライズ設定にアクセスすることもできます。例：

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

### ProtoBuf シリアライザー {id="register_protobuf"}
アプリケーションに ProtoBuf シリアライザーを登録するには、`protobuf` メソッドを呼び出します。
```kotlin
import io.ktor.server.plugins.contentnegotiation.*
import io.ktor.serialization.kotlinx.protobuf.*

install(ContentNegotiation) {
    protobuf()
}
```

`protobuf` メソッドでは、[ProtoBufBuilder](https://kotlinlang.org/api/kotlinx.serialization/kotlinx-serialization-protobuf/kotlinx.serialization.protobuf/-proto-buf-builder/) によって提供される ProtoBuf シリアライズ設定にアクセスすることもできます。例：

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

### カスタムシリアライザー {id="register_custom"}

指定した `Content-Type` に対してカスタムシリアライザーを登録するには、`register` メソッドを呼び出す必要があります。以下の例では、`application/json` および `application/xml` データをデシリアライズするために 2 つの [カスタムシリアライザー](#implement_custom_serializer) が登録されています。

```kotlin
install(ContentNegotiation) {
    register(ContentType.Application.Json, CustomJsonConverter())
    register(ContentType.Application.Xml, CustomXmlConverter())
}
```

## データの受信と送信 {id="receive_send_data"}

### データクラスの作成 {id="create_data_class"}
受信したデータをオブジェクトにデシリアライズするには、データクラスを作成する必要があります。例：
```kotlin
data class Customer(val id: Int, val firstName: String, val lastName: String)
```

kotlinx.serialization を使用する場合は、このクラスに `@Serializable` アノテーションが付いていることを確認してください。
```kotlin
import kotlinx.serialization.*
@Serializable
data class Customer(val id: Int, val firstName: String, val lastName: String)
```

<snippet id="serialization_types">

以下の型のシリアライズ/デシリアライズは、kotlinx.serialization ライブラリによってサポートされています。

- [組み込みクラス](https://github.com/Kotlin/kotlinx.serialization/blob/master/docs/builtin-classes.md)
- [Sequences](https://kotlinlang.org/docs/sequences.html) のデシリアライズ
- [Flows](https://kotlinlang.org/docs/flow.html) のシリアライズ

</snippet>

### データの受信 {id="receive_data"}
リクエストのコンテンツを受信して変換するには、パラメータとしてデータクラスを受け取る `receive` メソッドを呼び出します。
```kotlin

        post("/customer") {
            val customer = call.receive<Customer>()
            customerStorage.add(customer)
            call.respondText("Customer stored correctly", status = HttpStatusCode.Created)
```

リクエストの `Content-Type` は、リクエストを処理するための [シリアライザー](#configure_serializer) を選択するために使用されます。以下の例は、サーバー側で `Customer` オブジェクトに変換される JSON または XML データを含むサンプル [HTTP クライアント](https://www.jetbrains.com/help/idea/http-client-in-product-code-editor.html) リクエストを示しています。

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

完全な例はこちらにあります：[json-kotlinx](https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/json-kotlinx)。

### データの送信 {id="send_data"}
レスポンスでデータオブジェクトを渡すには、`respond` メソッドを使用できます。
```kotlin
routing {
    get("/customer/{id}") {
        val id: Int by call.parameters
        val customer: Customer = customerStorage.find { it.id == id }!!
        call.respond(customer)
```

この場合、Ktor は `Accept` ヘッダーを使用して必要な [シリアライザー](#configure_serializer) を選択します。完全な例はこちらにあります：[json-kotlinx](https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/json-kotlinx)。

## カスタムシリアライザーの実装 {id="implement_custom_serializer"}

Ktor では、データのシリアライズ/デシリアライズのために独自の [シリアライザー](#configure_serializer) を作成できます。これを行うには、[ContentConverter](https://api.ktor.io/ktor-serialization/io.ktor.serialization/-content-converter/index.html) インターフェースを実装する必要があります。
```kotlin
interface ContentConverter {
    suspend fun serialize(contentType: ContentType, charset: Charset, typeInfo: TypeInfo, value: Any): OutgoingContent?
    suspend fun deserialize(charset: Charset, typeInfo: TypeInfo, content: ByteReadChannel): Any?
}
```
実装例として [GsonConverter](https://github.com/ktorio/ktor/blob/main/ktor-shared/ktor-serialization/ktor-serialization-gson/jvm/src/GsonConverter.kt) クラスを参考にしてください。