[//]: # (title: Ktor Client におけるコンテントネゴシエーションとシリアライズ)

<show-structure for="chapter" depth="2"/>
<primary-label ref="client-plugin"/>

<var name="plugin_name" value="ContentNegotiation"/>
<var name="artifact_name" value="ktor-client-content-negotiation"/>

<tldr>
<p>
<b>必要な依存関係</b>: <code>io.ktor:%artifact_name%</code>
</p>
<var name="example_name" value="client-json-kotlinx"/>
<p>
    <b>コード例</b>:
    <a href="https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/%example_name%">
        %example_name%
    </a>
</p>
</tldr>

<link-summary>
ContentNegotiation プラグインは、主に 2 つの目的を果たします。クライアントとサーバー間でのメディアタイプのネゴシエーションと、リクエストの送信時やレスポンスの受信時に特定のフォーマットでコンテンツをシリアライズ/デシリアライズすることです。
</link-summary>

[ContentNegotiation](https://api.ktor.io/ktor-client-content-negotiation/io.ktor.client.plugins.contentnegotiation/-content-negotiation) プラグインは、主に 2 つの目的を果たします。
* クライアントとサーバー間でのメディアタイプのネゴシエーション。これには、`Accept` および `Content-Type` ヘッダーを使用します。
* [リクエスト](client-requests.md)の送信時や[レスポンス](client-responses.md)の受信時に、特定のフォーマットでコンテンツをシリアライズ/デシリアライズすること。Ktor は、JSON、XML、CBOR、ProtoBuf のフォーマットを標準でサポートしています。

> サーバー側では、Ktor はコンテンツをシリアライズ/デシリアライズするために [ContentNegotiation](server-serialization.md) プラグインを提供しています。

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
<tip>
    Ktor クライアントに必要なアーティファクトの詳細については、<Links href="/ktor/client-dependencies" summary="既存のプロジェクトにクライアントの依存関係を追加する方法を学びます。">クライアントの依存関係の追加</Links>を参照してください。
</tip>

特定のフォーマットのシリアライザーには追加のアーティファクトが必要であることに注意してください。例えば、kotlinx.serialization の JSON には `ktor-serialization-kotlinx-json` 依存関係が必要です。含まれているアーティファクトに応じて、Ktor は自動的にデフォルトのシリアライザーを選択します。必要に応じて、シリアライザーを明示的に[指定](#configure_serializer)して設定することもできます。

### Serialization {id="serialization_dependency"}

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

## ContentNegotiation のインストール {id="install_plugin"}

`ContentNegotiation` をインストールするには、[クライアント設定ブロック](client-create-and-configure.md#configure-client)内で `install` 関数に渡します。

```kotlin
val client = HttpClient(CIO) {
    install(ContentNegotiation)
}
```
これで、必要な JSON シリアライザーを[設定](#configure_serializer)できるようになります。

## シリアライザーの設定 {id="configure_serializer"}

### JSON シリアライザー {id="register_json"}

<Tabs group="json-libraries">
<TabItem title="kotlinx.serialization" group-key="kotlinx">

アプリケーションに JSON シリアライザーを登録するには、`json` メソッドを呼び出します。
```kotlin
import io.ktor.client.plugins.contentnegotiation.*
import io.ktor.serialization.kotlinx.json.*

val client = HttpClient(CIO) {
    install(ContentNegotiation) {
        json()
    }
}
```

`json` コンストラクタ内では、[JsonBuilder](https://kotlinlang.org/api/kotlinx.serialization/kotlinx-serialization-json/kotlinx.serialization.json/-json-builder/) API にアクセスできます。例：
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

完全な例はこちらにあります: [client-json-kotlinx](https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/client-json-kotlinx)。

</TabItem>
<TabItem title="Gson" group-key="gson">

アプリケーションに Gson シリアライザーを登録するには、[gson](https://api.ktor.io/ktor-serialization-gson/io.ktor.serialization.gson/gson.html) メソッドを呼び出します。
```kotlin
import io.ktor.client.plugins.contentnegotiation.*
import io.ktor.serialization.gson.*

val client = HttpClient(CIO) {
    install(ContentNegotiation) {
        gson()
    }
}
```

`gson` メソッドでは、[GsonBuilder](https://www.javadoc.io/doc/com.google.code.gson/gson/latest/com.google.gson/com/google/gson/GsonBuilder.html) によって提供されるシリアライズ設定を調整することもできます。

</TabItem>
<TabItem title="Jackson" group-key="jackson">

アプリケーションに Jackson シリアライザーを登録するには、[jackson](https://api.ktor.io/ktor-serialization-jackson/io.ktor.serialization.jackson/jackson.html) メソッドを呼び出します。

```kotlin
import io.ktor.client.plugins.contentnegotiation.*
import io.ktor.serialization.jackson.*

val client = HttpClient(CIO) {
    install(ContentNegotiation) {
        jackson()
    }
}
```

`jackson` メソッドでは、[ObjectMapper](https://fasterxml.github.io/jackson-databind/javadoc/2.17.2/com/fasterxml/jackson/databind/ObjectMapper.html) によって提供されるシリアライズ設定を調整することもできます。例：

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

### XML シリアライザー {id="register_xml"}

アプリケーションに XML シリアライザーを登録するには、`xml` メソッドを呼び出します。
```kotlin
import io.ktor.client.plugins.contentnegotiation.*
import io.ktor.serialization.kotlinx.xml.*

val client = HttpClient(CIO) {
    install(ContentNegotiation) {
        xml()
    }
}
```

`xml` メソッドでは、XML シリアライズ設定にアクセスすることもできます。例：

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

### CBOR シリアライザー {id="register_cbor"}
アプリケーションに CBOR シリアライザーを登録するには、`cbor` メソッドを呼び出します。
```kotlin
import io.ktor.client.plugins.contentnegotiation.*
import io.ktor.serialization.kotlinx.cbor.*

val client = HttpClient(CIO) {
    install(ContentNegotiation) {
        cbor()
    }
}
```

`cbor` メソッドでは、[CborBuilder](https://kotlinlang.org/api/kotlinx.serialization/kotlinx-serialization-cbor/kotlinx.serialization.cbor/-cbor-builder/) によって提供される CBOR シリアライズ設定にアクセスすることもできます。例：

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

### ProtoBuf シリアライザー {id="register_protobuf"}
アプリケーションに ProtoBuf シリアライザーを登録するには、`protobuf` メソッドを呼び出します。
```kotlin
import io.ktor.client.plugins.contentnegotiation.*
import io.ktor.serialization.kotlinx.protobuf.*

val client = HttpClient(CIO) {
    install(ContentNegotiation) {
        protobuf()
    }
}
```

`protobuf` メソッドでは、[ProtoBufBuilder](https://kotlinlang.org/api/kotlinx.serialization/kotlinx-serialization-protobuf/kotlinx.serialization.protobuf/-proto-buf-builder/) によって提供される ProtoBuf シリアライズ設定にアクセスすることもできます。例：

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

## データの受信と送信 {id="receive_send_data"}
### データクラスの作成 {id="create_data_class"}

データを送受信するには、データクラスが必要です。例：
```kotlin
data class Customer(val id: Int, val firstName: String, val lastName: String)
```

kotlinx.serialization を使用する場合は、このクラスに `@Serializable` アノテーションが付いていることを確認してください。
```kotlin
@Serializable
data class Customer(val id: Int, val firstName: String, val lastName: String)
```

以下の型のシリアライズ/デシリアライズは、kotlinx.serialization ライブラリによってサポートされています。

- [組み込みクラス (Builtin classes)](https://github.com/Kotlin/kotlinx.serialization/blob/master/docs/builtin-classes.md)
- [Sequence](https://kotlinlang.org/docs/sequences.html) のデシリアライズ
- [Flow](https://kotlinlang.org/docs/flow.html) のシリアライズ

### データの送信 {id="send_data"}

[リクエスト](client-requests.md)ボディ内で[クラスインスタンス](#create_data_class)を JSON として送信するには、`setBody` 関数を使用してこのインスタンスを割り当て、`contentType` を呼び出してコンテンツタイプを `application/json` に設定します。

```kotlin
val response: HttpResponse = client.post("http://localhost:8080/customer") {
    contentType(ContentType.Application.Json)
    setBody(Customer(3, "Jet", "Brains"))
}
```

データを XML または CBOR として送信するには、`contentType` をそれぞれ `ContentType.Application.Xml` または `ContentType.Application.Cbor` に設定します。

### データの受信 {id="receive_data"}

サーバーが `application/json`、`application/xml`、または `application/cbor` コンテンツを含む[レスポンス](client-responses.md)を送信した場合、レスポンスペイロードを受信するために使用する関数のパラメータとして[データクラス](#create_data_class)を指定することで、それをデシリアライズできます（以下の例では `body`）。
```kotlin
val customer: Customer = client.get("http://localhost:8080/customer/3").body()
```

完全な例はこちらにあります: [client-json-kotlinx](https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/client-json-kotlinx)。