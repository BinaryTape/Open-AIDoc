[//]: # (title: コンテンツエンコーディング)

<primary-label ref="client-plugin"/>

<var name="artifact_name" value="ktor-client-encoding"/>
<var name="ktor_version_catalog_name" value="ktorLibs.client.encoding"/>

<tldr>
<p>
<b>必要な依存関係</b>: <code>io.ktor:%artifact_name%</code>
</p>
<var name="example_name" value="client-content-encoding"/>
<p>
    <b>コード例</b>:
    <a href="https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/%example_name%">
        %example_name%
    </a>
</p>
</tldr>

<link-summary>
ContentEncoding プラグインを使用すると、指定した圧縮アルゴリズム（'gzip' や 'deflate' など）を有効にし、その設定を行うことができます。
</link-summary>

Ktor クライアントは、指定した圧縮アルゴリズム（`gzip` や `deflate` など）を有効にしてそれらの設定を行える [`ContentEncoding`](https://api.ktor.io/ktor-client-encoding/io.ktor.client.plugins.compression/-content-encoding) プラグインを提供しています。 

このプラグインは以下の機能を提供します:
* 指定された品質値を持つ `Accept-Encoding` ヘッダーを設定します。
* オプションでリクエストボディをエンコードします。
* [サーバーから受信したコンテンツ](client-responses.md#body)をデコードして、元のペイロードを取得します。

## 依存関係の追加 {id="add_dependencies"}

`ContentEncoding` を使用するには、ビルドスクリプトに `%artifact_name%` アーティファクトを追加します:

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
<tip>
    Ktor クライアントに必要なアーティファクトの詳細については、<Links href="client-dependencies.md" summary="Learn how to add client dependencies to an existing project.">クライアントの依存関係の追加</Links> を参照してください。
</tip>

## `ContentEncoding` のインストール {id="install_plugin"}

`ContentEncoding` をインストールするには、[クライアント設定ブロック](client-create-and-configure.md#configure-client)内で `install` 関数に渡します:

```kotlin
import io.ktor.client.*
import io.ktor.client.engine.cio.*
import io.ktor.client.plugins.compression.*
//...
val client = HttpClient(CIO) {
    install(ContentEncoding)
}
```

## `ContentEncoding` の設定 {id="configure_plugin"}

### エンコーダーの有効化 {id="enable-encoders"}

サポートするエンコーダーを設定し、それらの品質値（`Accept-Encoding` ヘッダーで使用されます）を指定できます。

以下の[例](https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/client-content-encoding)では、カスタムの品質値で `deflate` および `gzip` エンコーダーを有効にしています:

```kotlin
val client = HttpClient(CIO) {
    install(ContentEncoding) {
        deflate(1.0F)
        gzip(0.9F)
    }
}
```

必要に応じて、[`ContentEncoder`](https://api.ktor.io/ktor-utils/io.ktor.util/-content-encoder/index.html) インターフェースを実装してカスタムエンコーダーを作成し、`customEncoder()` 関数を使用して登録することもできます。

### `mode` プロパティの設定 {id="set-the-mode-property"}

デフォルトでは、`ContentEncoding` はレスポンスの解凍（decompression）のみを処理します。プラグインの動作方法を定義するには、`mode` プロパティを使用します。

利用可能な値は以下のとおりです:
<deflist>
<def>
<title><code>ContentEncodingConfig.Mode.DecompressResponse</code></title>
レスポンスの解凍のみを行います。これがデフォルトのモードです。
</def>
<def>
<title><code>ContentEncodingConfig.Mode.CompressRequest</code></title>
リクエストボディの圧縮のみを有効にします。
</def>
<def>
<title><code>ContentEncodingConfig.Mode.All</code></title>
レスポンスの解凍とリクエストの圧縮の両方を有効にします。
</def>
</deflist>

## リクエストボディのエンコード {id="encode_request_body"}

リクエスト圧縮を有効にするには、`mode` プロパティを設定し、[`HttpRequestBuilder`](https://api.ktor.io/ktor-client-core/io.ktor.client.request/-http-request-builder/index.html) ブロック内で `compress()` 関数を使用します:

```kotlin
import io.ktor.client.*
import io.ktor.client.engine.cio.*
import io.ktor.client.plugins.compression.*
//...
val client = HttpClient(CIO) {
    install(ContentEncoding) {
        mode = ContentEncodingConfig.Mode.CompressRequest
        gzip()
    }
}
client.post("/upload") {
    compress("gzip")
    setBody(someLongBody)
}
```

この例では:

* `mode = ContentEncodingConfig.Mode.CompressRequest` はリクエスト圧縮を有効にします。
* `gzip()` は gzip エンコーダーを登録します。
* `compress("gzip")` はこの特定のリクエストに gzip 圧縮を適用します。
* `Content-Encoding` ヘッダーは自動的に追加されます。

> レスポンスの処理に関する詳細については、[レスポンスの受信](client-responses.md)を参照してください。
>
{style="tip"}