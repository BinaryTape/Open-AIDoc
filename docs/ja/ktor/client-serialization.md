[//]: # (title: Ktor Client におけるコンテンツネゴシエーションとシリアライゼーション)

<show-structure for="chapter" depth="2"/>
<primary-label ref="client-plugin"/>

<var name="plugin_name" value="ContentNegotiation"/>
<var name="artifact_name" value="ktor-client-content-negotiation"/>
<var name="ktor_version_catalog_name" value="ktorLibs.client.contentNegotiation"/>

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
ContentNegotiation プラグインには、クライアントとサーバー間のメディアタイプのネゴシエーション、およびリクエストの送信時やレスポンスの受信時に特定の形式でコンテンツをシリアライズ/デシリアライズするという2つの主な目的があります。
</link-summary>

[`ContentNegotiation`](https://api.ktor.io/ktor-client-content-negotiation/io.ktor.client.plugins.contentnegotiation/-content-negotiation)
プラグインには、主に2つの目的があります。
* `Accept` および `Content-Type` ヘッダーを使用した、クライアントとサーバー間のメディアタイプのネゴシエーション。
* サポートされている形式での[リクエスト](client-requests.md)ボディのシリアライズおよび[レスポンス](client-responses.md)ボディのデシリアライズ。Ktor は JSON、XML、CBOR、および ProtoBuf の組み込みサポートを提供しています。

> サーバー側では、Ktor はコンテンツのシリアライズとデシリアライズのために [`ContentNegotiation`](server-serialization.md) プラグインを提供しています。
>
{style="tip"}

## 依存関係の追加 {id="add_dependencies"}

### コンテンツネゴシエーション {id="add_content_negotiation_dependency"}

<p>
    <code>%plugin_name%</code> を使用するには、ビルドスクリプトに <code>%artifact_name%</code> アーティファクトを追加します。
</p>
<Tabs group="languages">
    <TabItem title="Gradle (Kotlin)" group-key="kotlin">
        <code-block lang="Kotlin" code="            implementation(%ktor_version_catalog_name%)"/>
        <note>
            上記のコードスニペットでは、Ktor の依存関係を指定するために <a href="server-dependencies.topic#using-version-catalog">
            Ktor バージョンカタログ</a> を使用しています。
        </note>
    </TabItem>
    <TabItem title="Gradle (Groovy)" group-key="groovy">
        <code-block lang="Groovy" code="            implementation %ktor_version_catalog_name%"/>
        <note>
            上記のコードスニペットでは、Ktor の依存関係を指定するために <a href="server-dependencies.topic#using-version-catalog">
            Ktor バージョンカタログ</a> を使用しています。
        </note>
    </TabItem>
    <TabItem title="Maven" group-key="maven">
        <code-block lang="XML" code="            &lt;dependency&gt;&#10;                &lt;groupId&gt;io.ktor&lt;/groupId&gt;&#10;                &lt;artifactId&gt;%artifact_name%-jvm&lt;/artifactId&gt;&#10;                &lt;version&gt;${ktor_version}&lt;/version&gt;&#10;            &lt;/dependency&gt;"/>
    </TabItem>
</Tabs>

> 特定の形式のシリアライザーには追加のアーティファクトが必要です。
> 
> 例えば、`kotlinx.serialization` で JSON を扱うには `ktor-serialization-kotlinx-json` 依存関係が必要です。含まれているアーティファクトに応じて、Ktor はデフォルトのシリアライザーを自動的に選択します。必要に応じて、シリアライザーを明示的に[指定](#configure_serializer)して設定することもできます。
> 
{style="note"}

<tip>
    Ktor クライアントで必要なアーティファクトの詳細については、<Links href="client-dependencies.md" summary="既存のプロジェクトにクライアントの依存関係を追加する方法を学びます。">クライアントの依存関係の追加</Links> を参照してください。
</tip>

### シリアライゼーション {id="serialization_dependency"}

`kotlinx.serialization` コンバーターを使用する前に、[セットアップ (Setup)](https://github.com/Kotlin/kotlinx.serialization#setup) セクションの説明に従って Kotlin serialization プラグインを追加してください。

#### JSON {id="add_json_dependency"}

JSON データのシリアライズとデシリアライズを行うには、プロジェクトにシリアライゼーションライブラリを追加します。Ktor は `kotlinx.serialization`、Gson、または Jackson をサポートしています。

<Tabs group="json-libraries">
<TabItem title="kotlinx.serialization" group-key="kotlinx">

ビルドスクリプトに `ktor-serialization-kotlinx-json` アーティファクトを追加します。

<var name="artifact_name" value="ktor-serialization-kotlinx-json"/>
<var name="ktor_version_catalog_name" value="ktorLibs.serialization.kotlinx.json"/>
<Tabs group="languages">
    <TabItem title="Gradle (Kotlin)" group-key="kotlin">
        <code-block lang="Kotlin" code="            implementation(%ktor_version_catalog_name%)"/>
        <note>
            上記のコードスニペットでは、Ktor の依存関係を指定するために <a href="server-dependencies.topic#using-version-catalog">
            Ktor バージョンカタログ</a> を使用しています。
        </note>
    </TabItem>
    <TabItem title="Gradle (Groovy)" group-key="groovy">
        <code-block lang="Groovy" code="            implementation %ktor_version_catalog_name%"/>
        <note>
            上記のコードスニペットでは、Ktor の依存関係を指定するために <a href="server-dependencies.topic#using-version-catalog">
            Ktor バージョンカタログ</a> を使用しています。
        </note>
    </TabItem>
    <TabItem title="Maven" group-key="maven">
        <code-block lang="XML" code="            &lt;dependency&gt;&#10;                &lt;groupId&gt;io.ktor&lt;/groupId&gt;&#10;                &lt;artifactId&gt;%artifact_name%-jvm&lt;/artifactId&gt;&#10;                &lt;version&gt;${ktor_version}&lt;/version&gt;&#10;            &lt;/dependency&gt;"/>
    </TabItem>
</Tabs>

</TabItem>
<TabItem title="Gson" group-key="gson">

ビルドスクリプトに `ktor-serialization-gson` アーティファクトを追加します。

<var name="artifact_name" value="ktor-serialization-gson"/>
<var name="ktor_version_catalog_name" value="ktorLibs.serialization.gson"/>
<Tabs group="languages">
    <TabItem title="Gradle (Kotlin)" group-key="kotlin">
        <code-block lang="Kotlin" code="            implementation(%ktor_version_catalog_name%)"/>
        <note>
            上記のコードスニペットでは、Ktor の依存関係を指定するために <a href="server-dependencies.topic#using-version-catalog">
            Ktor バージョンカタログ</a> を使用しています。
        </note>
    </TabItem>
    <TabItem title="Gradle (Groovy)" group-key="groovy">
        <code-block lang="Groovy" code="            implementation %ktor_version_catalog_name%"/>
        <note>
            上記のコードスニペットでは、Ktor の依存関係を指定するために <a href="server-dependencies.topic#using-version-catalog">
            Ktor バージョンカタログ</a> を使用しています。
        </note>
    </TabItem>
    <TabItem title="Maven" group-key="maven">
        <code-block lang="XML" code="            &lt;dependency&gt;&#10;                &lt;groupId&gt;io.ktor&lt;/groupId&gt;&#10;                &lt;artifactId&gt;%artifact_name%-jvm&lt;/artifactId&gt;&#10;                &lt;version&gt;${ktor_version}&lt;/version&gt;&#10;            &lt;/dependency&gt;"/>
    </TabItem>
</Tabs>

</TabItem>
<TabItem title="Jackson" group-key="jackson">

ビルドスクリプトに `ktor-serialization-jackson` アーティファクトを追加します。

<var name="artifact_name" value="ktor-serialization-jackson"/>
<var name="ktor_version_catalog_name" value="ktorLibs.serialization.jackson"/>
<Tabs group="languages">
    <TabItem title="Gradle (Kotlin)" group-key="kotlin">
        <code-block lang="Kotlin" code="            implementation(%ktor_version_catalog_name%)"/>
        <note>
            上記のコードスニペットでは、Ktor の依存関係を指定するために <a href="server-dependencies.topic#using-version-catalog">
            Ktor バージョンカタログ</a> を使用しています。
        </note>
    </TabItem>
    <TabItem title="Gradle (Groovy)" group-key="groovy">
        <code-block lang="Groovy" code="            implementation %ktor_version_catalog_name%"/>
        <note>
            上記のコードスニペットでは、Ktor の依存関係を指定するために <a href="server-dependencies.topic#using-version-catalog">
            Ktor バージョンカタログ</a> を使用しています。
        </note>
    </TabItem>
    <TabItem title="Maven" group-key="maven">
        <code-block lang="XML" code="            &lt;dependency&gt;&#10;                &lt;groupId&gt;io.ktor&lt;/groupId&gt;&#10;                &lt;artifactId&gt;%artifact_name%-jvm&lt;/artifactId&gt;&#10;                &lt;version&gt;${ktor_version}&lt;/version&gt;&#10;            &lt;/dependency&gt;"/>
    </TabItem>
</Tabs>

</TabItem>
</Tabs>

#### XML {id="add_xml_dependency"}

XML のシリアライズとデシリアライズを行うには、ビルドスクリプトに `ktor-serialization-kotlinx-xml` アーティファクトを追加します。

<var name="artifact_name" value="ktor-serialization-kotlinx-xml"/>
<var name="ktor_version_catalog_name" value="ktorLibs.serialization.kotlinx.xml"/>
<Tabs group="languages">
    <TabItem title="Gradle (Kotlin)" group-key="kotlin">
        <code-block lang="Kotlin" code="            implementation(%ktor_version_catalog_name%)"/>
        <note>
            上記のコードスニペットでは、Ktor の依存関係を指定するために <a href="server-dependencies.topic#using-version-catalog">
            Ktor バージョンカタログ</a> を使用しています。
        </note>
    </TabItem>
    <TabItem title="Gradle (Groovy)" group-key="groovy">
        <code-block lang="Groovy" code="            implementation %ktor_version_catalog_name%"/>
        <note>
            上記のコードスニペットでは、Ktor の依存関係を指定するために <a href="server-dependencies.topic#using-version-catalog">
            Ktor バージョンカタログ</a> を使用しています。
        </note>
    </TabItem>
    <TabItem title="Maven" group-key="maven">
        <code-block lang="XML" code="            &lt;dependency&gt;&#10;                &lt;groupId&gt;io.ktor&lt;/groupId&gt;&#10;                &lt;artifactId&gt;%artifact_name%-jvm&lt;/artifactId&gt;&#10;                &lt;version&gt;${ktor_version}&lt;/version&gt;&#10;            &lt;/dependency&gt;"/>
    </TabItem>
</Tabs>

#### CBOR {id="add_cbor_dependency"}

CBOR のシリアライズとデシリアライズを行うには、ビルドスクリプトに `ktor-serialization-kotlinx-cbor` アーティファクトを追加します。

<var name="artifact_name" value="ktor-serialization-kotlinx-cbor"/>
<var name="ktor_version_catalog_name" value="ktorLibs.serialization.kotlinx.cbor"/>
<Tabs group="languages">
    <TabItem title="Gradle (Kotlin)" group-key="kotlin">
        <code-block lang="Kotlin" code="            implementation(%ktor_version_catalog_name%)"/>
        <note>
            上記のコードスニペットでは、Ktor の依存関係を指定するために <a href="server-dependencies.topic#using-version-catalog">
            Ktor バージョンカタログ</a> を使用しています。
        </note>
    </TabItem>
    <TabItem title="Gradle (Groovy)" group-key="groovy">
        <code-block lang="Groovy" code="            implementation %ktor_version_catalog_name%"/>
        <note>
            上記のコードスニペットでは、Ktor の依存関係を指定するために <a href="server-dependencies.topic#using-version-catalog">
            Ktor バージョンカタログ</a> を使用しています。
        </note>
    </TabItem>
    <TabItem title="Maven" group-key="maven">
        <code-block lang="XML" code="            &lt;dependency&gt;&#10;                &lt;groupId&gt;io.ktor&lt;/groupId&gt;&#10;                &lt;artifactId&gt;%artifact_name%-jvm&lt;/artifactId&gt;&#10;                &lt;version&gt;${ktor_version}&lt;/version&gt;&#10;            &lt;/dependency&gt;"/>
    </TabItem>
</Tabs>

#### ProtoBuf {id="add_protobuf_dependency"}

ProtoBuf のシリアライズとデシリアライズを行うには、ビルドスクリプトに `ktor-serialization-kotlinx-protobuf` アーティファクトを追加します。

<var name="artifact_name" value="ktor-serialization-kotlinx-protobuf"/>
<var name="ktor_version_catalog_name" value="ktorLibs.serialization.kotlinx.protobuf"/>
<Tabs group="languages">
    <TabItem title="Gradle (Kotlin)" group-key="kotlin">
        <code-block lang="Kotlin" code="            implementation(%ktor_version_catalog_name%)"/>
        <note>
            上記のコードスニペットでは、Ktor の依存関係を指定するために <a href="server-dependencies.topic#using-version-catalog">
            Ktor バージョンカタログ</a> を使用しています。
        </note>
    </TabItem>
    <TabItem title="Gradle (Groovy)" group-key="groovy">
        <code-block lang="Groovy" code="            implementation %ktor_version_catalog_name%"/>
        <note>
            上記のコードスニペットでは、Ktor の依存関係を指定するために <a href="server-dependencies.topic#using-version-catalog">
            Ktor バージョンカタログ</a> を使用しています。
        </note>
    </TabItem>
    <TabItem title="Maven" group-key="maven">
        <code-block lang="XML" code="            &lt;dependency&gt;&#10;                &lt;groupId&gt;io.ktor&lt;/groupId&gt;&#10;                &lt;artifactId&gt;%artifact_name%-jvm&lt;/artifactId&gt;&#10;                &lt;version&gt;${ktor_version}&lt;/version&gt;&#10;            &lt;/dependency&gt;"/>
    </TabItem>
</Tabs>

## `ContentNegotiation` のインストール {id="install_plugin"}

`ContentNegotiation` プラグインをインストールするには、[クライアント設定ブロック](client-create-and-configure.md#configure-client) で `install` 関数に渡します。

```kotlin
val client = HttpClient(CIO) {
    install(ContentNegotiation)
}
```

その後、必要な JSON シリアライザーを[設定](#configure_serializer)できます。

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

JSON シリアライゼーションをカスタマイズするには、`json()` コンストラクターに `Json` 設定を渡します。

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

Gson シリアライゼーションをカスタマイズするには、`gson()` 関数に設定ブロックを渡します。利用可能な設定オプションについては、[`GsonBuilder`](https://www.javadoc.io/doc/com.google.code.gson/gson/latest/com.google.gson/com/google/gson/GsonBuilder.html) を参照してください。

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

Jackson シリアライゼーションをカスタマイズするには、[`ObjectMapper`](https://fasterxml.github.io/jackson-databind/javadoc/2.17.2/com/fasterxml/jackson/databind/ObjectMapper.html) が提供する設定を使用します。

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

XML シリアライゼーションをカスタマイズするには、必要なオプションを `xml()` 関数に渡します。

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

CBOR シリアライゼーションをカスタマイズするには、`cbor()` コンストラクターに `Cbor` 設定を渡します。

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

ProtoBuf シリアライゼーションをカスタマイズするには、`protobuf()` 関数に `ProtoBuf` 設定を渡します。

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

`Accept` ヘッダーを明示的に設定しており、プラグインによって登録済みコンテンツタイプを追加したくない場合は、`acceptHeaderMergeStrategy` プロパティを `ContentTypeMergeStrategy.SkipIfPresent` に設定します。

```kotlin
val client = HttpClient(CIO) {
    install(ContentNegotiation) {
        register(ContentType.Application.Json, noOpJsonConverter)
        acceptHeaderMergeStrategy = ContentTypeMergeStrategy.SkipIfPresent
    }
}
```

`SkipIfPresent` を使用すると、プラグインは既存の `Accept` ヘッダーを保持します。リクエストに `Accept` ヘッダーが含まれていない場合、プラグインは通常どおり登録されたコンテンツタイプを追加します。

## データの送受信 {id="receive_send_data"}

### データクラスの作成 {id="create_data_class"}

以下の例では、クライアントが送受信するデータを表すために `Customer` データクラスを使用しています。

```kotlin
data class Customer(val id: Int, val firstName: String, val lastName: String)
```

`kotlinx.serialization` を使用する場合は、クラスに `@Serializable` アノテーションを付加します。

```kotlin
@Serializable
data class Customer(val id: Int, val firstName: String, val lastName: String)
```

kotlinx.serialization ライブラリでは、以下の型のシリアライズ/デシリアライズがサポートされています。

- [組み込みクラス (Builtin classes)](https://github.com/Kotlin/kotlinx.serialization/blob/master/docs/builtin-classes.md)
- [Sequence](https://kotlinlang.org/docs/sequences.html) のデシリアライズ
- [Flow](https://kotlinlang.org/docs/flow.html) のシリアライズ

### データの送信 {id="send_data"}

[リクエスト](client-requests.md)ボディで[クラスのインスタンス](#create_data_class)を送信するには、`setBody()` 関数を使用してこのインスタンスを割り当て、`contentType()` 関数を使用してコンテンツタイプを設定します。

以下の例は、`Customer` オブジェクトを JSON として送信します。

```kotlin
val response: HttpResponse = client.post("http://localhost:8080/customer") {
    contentType(ContentType.Application.Json)
    setBody(Customer(3, "Jet", "Brains"))
}
```

`ContentNegotiation` プラグインは、設定されたシリアライザーを使用してリクエストボディを指定された形式に変換します。

他の登録済み形式でデータを送信するには、`ContentType.Application.Xml` や `ContentType.Application.Cbor` などの対応するコンテンツタイプを指定します。

### データの受信 {id="receive_data"}

サーバーがサポートされているコンテンツタイプを含む[レスポンス](client-responses.md)を返すと、`ContentNegotiation` プラグインはレスポンスボディを期待される型にデシリアライズできます。

例えば、JSON レスポンスを `Customer` オブジェクトにデシリアライズするには、`body()` 関数を呼び出します。

```kotlin
val customer: Customer = client.get("http://localhost:8080/customer/3").body()
```

> 完全な例については、[client-json-kotlinx](https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/client-json-kotlinx) を参照してください。
>
{style="tip"}