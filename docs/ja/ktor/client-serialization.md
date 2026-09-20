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

[`ContentNegotiation`](https://api.ktor.io/ktor-client-content-negotiation/io.ktor.client.plugins.contentnegotiation/-content-negotiation) プラグインは、主に 2 つの目的を果たします。
* クライアントとサーバー間でのメディアタイプのネゴシエーション。これには、`Accept` および `Content-Type` ヘッダーを使用します。
* サポートされているフォーマットでの[リクエスト](client-requests.md)ボディのシリアライズと[レスポンス](client-responses.md)ボディのデシリアライズ。Ktor は、JSON、XML、CBOR、ProtoBuf を標準でサポートしています。

> サーバー側では、Ktor はコンテンツをシリアライズ/デシリアライズするために [`ContentNegotiation`](server-serialization.md) プラグインを提供しています。
>
{style="tip"}

## 依存関係の追加 {id="add_dependencies"}

### ContentNegotiation {id="add_content_negotiation_dependency"}

<p>
    <code>%plugin_name%</code> を使用するには、ビルドスクリプトに <code>%artifact_name%</code> アーティファクトを追加します。
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

> 特定のフォーマットのシリアライザーには追加のアーティファクトが必要です。
> 
> 例えば、`kotlinx.serialization` の JSON には `ktor-serialization-kotlinx-json` 依存関係が必要です。含まれているアーティファクトに応じて、Ktor は自動的にデフォルトのシリアライザーを選択します。必要に応じて、シリアライザーを明示的に[指定](#configure_serializer)して設定することもできます。
> 
{style="note"}

<tip>
    Ktor クライアントに必要なアーティファクトの詳細については、<Links href="/ktor/client-dependencies" summary="既存のプロジェクトにクライアントの依存関係を追加する方法を学びます。">クライアントの依存関係の追加</Links>を参照してください。
</tip>

### シリアライズ {id="serialization_dependency"}

`kotlinx.serialization` コンバーターを使用する前に、[Setup](https://github.com/Kotlin/kotlinx.serialization#setup) セクションの説明に従って Kotlin serialization プラグインを追加してください。

#### JSON {id="add_json_dependency"}

JSON データをシリアライズおよびデシリアライズするには、プロジェクトにシリアライズライブラリを追加します。Ktor は `kotlinx.serialization`、Gson、または Jackson をサポートしています。

<Tabs group="json-libraries">
<TabItem title="kotlinx.serialization" group-key="kotlinx">

ビルドスクリプトに `ktor-serialization-kotlinx-json` アーティファクトを追加します。

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

ビルドスクリプトに `ktor-serialization-gson` アーティファクトを追加します。

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

ビルドスクリプトに `ktor-serialization-jackson` アーティファクトを追加します。

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

XML をシリアライズおよびデシリアライズするには、ビルドスクリプトに `ktor-serialization-kotlinx-xml` アーティファクトを追加します。

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

CBOR をシリアライズおよびデシリアライズするには、ビルドスクリプトに `ktor-serialization-kotlinx-cbor` アーティファクトを追加します。

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

ProtoBuf をシリアライズおよびデシリアライズするには、ビルドスクリプトに `ktor-serialization-kotlinx-protobuf` アーティファクトを追加します。

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

## `ContentNegotiation` のインストール {id="install_plugin"}

`ContentNegotiation` プラグインをインストールするには、[クライアント設定ブロック](client-create-and-configure.md#configure-client)内で `install` 関数に渡します。

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

アプリケーションに JSON シリアライザーを登録するには、`json()` 関数を呼び出します。

```kotlin
import io.ktor.client.plugins.contentnegotiation.*
import io.ktor.serialization.kotlinx.json.*

val client = HttpClient(CIO) {
    install(ContentNegotiation) {
        json()
    }
}
```

JSON シリアライズをカスタマイズするには、`json()` コンストラクタで `Json` 設定を渡します。

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

利用可能な設定オプションについては、[`JsonBuilder`](https://kotlinlang.org/api/kotlinx.serialization/kotlinx-serialization-json/kotlinx.serialization.json/-json-builder/) を参照してください。

> 完全な例については、[client-json-kotlinx](https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/client-json-kotlinx) を参照してください。
>
{style="tip"}

</TabItem>
<TabItem title="Gson" group-key="gson">

アプリケーションに Gson シリアライザーを登録するには、[`gson()`](https://api.ktor.io/ktor-serialization-gson/io.ktor.serialization.gson/gson.html) 関数を呼び出します。

```kotlin
import io.ktor.client.plugins.contentnegotiation.*
import io.ktor.serialization.gson.*

val client = HttpClient(CIO) {
    install(ContentNegotiation) {
        gson()
    }
}
```

Gson シリアライズをカスタマイズするには、`gson()` 関数に設定ブロックを渡します。利用可能な設定オプションについては、[`GsonBuilder`](https://www.javadoc.io/doc/com.google.code.gson/gson/latest/com.google.gson/com/google/gson/GsonBuilder.html) を参照してください。

</TabItem>
<TabItem title="Jackson" group-key="jackson">

アプリケーションに Jackson シリアライザーを登録するには、[`jackson()`](https://api.ktor.io/ktor-serialization-jackson/io.ktor.serialization.jackson/jackson.html) 関数を呼び出します。

```kotlin
import io.ktor.client.plugins.contentnegotiation.*
import io.ktor.serialization.jackson.*

val client = HttpClient(CIO) {
    install(ContentNegotiation) {
        jackson()
    }
}
```

Jackson シリアライズをカスタマイズするには、[`ObjectMapper`](https://fasterxml.github.io/jackson-databind/javadoc/2.17.2/com/fasterxml/jackson/databind/ObjectMapper.html) によって提供される設定を使用します。

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

アプリケーションに XML シリアライザーを登録するには、`xml()` 関数を呼び出します。

```kotlin
import io.ktor.client.plugins.contentnegotiation.*
import io.ktor.serialization.kotlinx.xml.*

val client = HttpClient(CIO) {
    install(ContentNegotiation) {
        xml()
    }
}
```

XML シリアライズをカスタマイズするには、`xml()` 関数に必要なオプションを渡します。

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

アプリケーションに CBOR シリアライザーを登録するには、`cbor()` 関数を呼び出します。

```kotlin
import io.ktor.client.plugins.contentnegotiation.*
import io.ktor.serialization.kotlinx.cbor.*

val client = HttpClient(CIO) {
    install(ContentNegotiation) {
        cbor()
    }
}
```

CBOR シリアライズをカスタマイズするには、`cbor()` コンストラクタで `Cbor` 設定を渡します。

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

利用可能な設定オプションについては、[`CborBuilder`](https://kotlinlang.org/api/kotlinx.serialization/kotlinx-serialization-cbor/kotlinx.serialization.cbor/-cbor-builder/) を参照してください。

### ProtoBuf シリアライザー {id="register_protobuf"}

アプリケーションに ProtoBuf シリアライザーを登録するには、`protobuf()` 関数を呼び出します。

```kotlin
import io.ktor.client.plugins.contentnegotiation.*
import io.ktor.serialization.kotlinx.protobuf.*

val client = HttpClient(CIO) {
    install(ContentNegotiation) {
        protobuf()
    }
}
```

ProtoBuf シリアライズをカスタマイズするには、`protobuf()` 関数に `ProtoBuf` 設定を渡します。

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

利用可能なオプションについては、[`ProtoBufBuilder`](https://kotlinlang.org/api/kotlinx.serialization/kotlinx-serialization-protobuf/kotlinx.serialization.protobuf/-proto-buf-builder/) を参照してください。

## `Accept` ヘッダーの設定 {id="configure_accept_header"}

デフォルトでは、`ContentNegotiation` プラグインは登録されたコンテンツタイプを送信リクエストの `Accept` ヘッダーに追加します。

`Accept` ヘッダーを明示的に設定しており、プラグインが登録されたコンテンツタイプを追加しないようにしたい場合は、`acceptHeaderMergeStrategy` プロパティを `ContentTypeMergeStrategy.SkipIfPresent` に設定します。

```kotlin
val client = HttpClient(CIO) {
    install(ContentNegotiation) {
        register(ContentType.Application.Json, noOpJsonConverter)
        acceptHeaderMergeStrategy = ContentTypeMergeStrategy.SkipIfPresent
    }
}
```

`SkipIfPresent` を指定すると、プラグインは既存の `Accept` ヘッダーを保持します。リクエストに `Accept` ヘッダーが含まれていない場合、プラグインは通常どおり登録されたコンテンツタイプを追加します。

## データの送受信 {id="receive_send_data"}

### データクラスの作成 {id="create_data_class"}

以下の例では、クライアントが送受信するデータを表すために `Customer` データクラスを使用します。

```kotlin
data class Customer(val id: Int, val firstName: String, val lastName: String)
```

`kotlinx.serialization` を使用する場合は、このクラスに `@Serializable` アノテーションを付加してください。

```kotlin
@Serializable
data class Customer(val id: Int, val firstName: String, val lastName: String)
```

以下の型のシリアライズ/デシリアライズは、kotlinx.serialization ライブラリによってサポートされています。

- [組み込みクラス (Builtin classes)](https://github.com/Kotlin/kotlinx.serialization/blob/master/docs/builtin-classes.md)
- [Sequence](https://kotlinlang.org/docs/sequences.html) のデシリアライズ
- [Flow](https://kotlinlang.org/docs/flow.html) のシリアライズ

### データの送信 {id="send_data"}

[リクエスト](client-requests.md)ボディ内で[クラスインスタンス](#create_data_class)を送信するには、`setBody()` 関数を使用してこのインスタンスを割り当て、`contentType()` 関数を使用してコンテンツタイプを設定します。

以下の例では、`Customer` オブジェクトを JSON として送信します。

```kotlin
val response: HttpResponse = client.post("http://localhost:8080/customer") {
    contentType(ContentType.Application.Json)
    setBody(Customer(3, "Jet", "Brains"))
}
```

`ContentNegotiation` プラグインは、設定されたシリアライザーを使用してリクエストボディを指定されたフォーマットに変換します。

他の登録されたフォーマットでデータを送信するには、`ContentType.Application.Xml` や `ContentType.Application.Cbor` など、対応するコンテンツタイプを指定します。

### データの受信 {id="receive_data"}

サーバーがサポートされているコンテンツタイプを含む[レスポンス](client-responses.md)を返した場合、`ContentNegotiation` プラグインはレスポンスボディを期待される型へとデシリアライズできます。

例えば、JSON レスポンスを `Customer` オブジェクトにデシリアライズするには、`body()` 関数を呼び出します。

```kotlin
val customer: Customer = client.get("http://localhost:8080/customer/3").body()
```

> 完全な例については、[client-json-kotlinx](https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/client-json-kotlinx) を参照してください。
>
{style="tip"}