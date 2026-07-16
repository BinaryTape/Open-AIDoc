[//]: # (title: コンテンツエンコーディング)

<primary-label ref="client-plugin"/>

<var name="artifact_name" value="ktor-client-encoding"/>

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
ContentEncodingプラグインを使用すると、指定した圧縮アルゴリズム（'gzip'や'deflate'など）を有効にし、その設定を構成できます。
</link-summary>

Ktorクライアントは、指定した圧縮アルゴリズム（`gzip`や`deflate`など）を有効にし、その設定を構成できるようにする[`ContentEncoding`](https://api.ktor.io/ktor-client-encoding/io.ktor.client.plugins.compression/-content-encoding)プラグインを提供します。

このプラグインは以下の機能を提供します：
* 指定された品質値（quality value）を使用して`Accept-Encoding`ヘッダーを設定します。
* 必要に応じてリクエストボディをエンコードします。
* [サーバーから受信したコンテンツ](client-responses.md#body)をデコードして、オリジナルのペイロードを取得します。

## 依存関係の追加 {id="add_dependencies"}

`ContentEncoding`を使用するには、ビルドスクリプトに`%artifact_name%`アーティファクトを含める必要があります：

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
    Ktorクライアントに必要なアーティファクトの詳細については、<Links href="/ktor/client-dependencies" summary="既存のプロジェクトにクライアントの依存関係を追加する方法を学びます。">クライアントの依存関係の追加</Links>を参照してください。
</tip>

## ContentEncodingのインストール {id="install_plugin"}

`ContentEncoding`をインストールするには、[クライアント構成ブロック](client-create-and-configure.md#configure-client)内で`install`関数に渡します：

```kotlin
import io.ktor.client.*
import io.ktor.client.engine.cio.*
import io.ktor.client.plugins.compression.*
//...
val client = HttpClient(CIO) {
    install(ContentEncoding)
}
```

## ContentEncodingの構成 {id="configure_plugin"}

### エンコーダーの有効化

どのエンコーダーをサポートするかを構成し、それらの品質値（`Accept-Encoding`ヘッダーで使用）を指定できます。

以下の[例](https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/client-content-encoding)は、カスタム品質値を使用して`deflate`および`gzip`エンコーダーを有効にする方法を示しています：

```kotlin
val client = HttpClient(CIO) {
    install(ContentEncoding) {
        deflate(1.0F)
        gzip(0.9F)
    }
}
```

必要に応じて、[`ContentEncoder`](https://api.ktor.io/ktor-utils/io.ktor.util/-content-encoder/index.html)インターフェースを実装してカスタムエンコーダーを作成し、それを`customEncoder()`関数を使用して登録できます。

### modeプロパティの設定

デフォルトでは、`ContentEncoding`はレスポンスのデコード（解凍）のみを処理します。`mode`プロパティを使用して、プラグインの動作を定義できます。

利用可能な値は以下の通りです：
<deflist>
<def>
<title><code>ContentEncodingConfig.Mode.DecompressResponse</code></title>
レスポンスのデコードのみを行います。これがデフォルトのモードです。
</def>
<def>
<title><code>ContentEncodingConfig.Mode.CompressRequest</code></title>
リクエストボディの圧縮のみを有効にします。
</def>
<def>
<title><code>ContentEncodingConfig.Mode.All</code></title>
レスポンスのデコードとリクエストの圧縮の両方を有効にします。
</def>
</deflist>

## リクエストボディのエンコード {id="encode_request_body"}

リクエストの圧縮を有効にするには、`mode`プロパティを設定し、[`HttpRequestBuilder`](https://api.ktor.io/ktor-client-core/io.ktor.client.request/-http-request-builder/index.html)ブロック内で`compress()`関数を使用します。

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

この例では：

* `mode = ContentEncodingConfig.Mode.CompressRequest` はリクエストの圧縮を有効にします。
* `gzip()` はgzipエンコーダーを登録します。
* `compress("gzip")` は、この特定のリクエストにgzip圧縮を適用します。
* `Content-Encoding`ヘッダーは自動的に追加されます。

> レスポンスの処理に関する詳細は、[レスポンスの受信](client-responses.md)を参照してください。
>
{style="tip"}