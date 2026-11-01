[//]: # (title: 圧縮 (Compression))

<show-structure for="chapter" depth="2"/>
<primary-label ref="server-plugin"/>

<var name="artifact_name" value="ktor-server-compression"/>
<var name="ktor_version_catalog_name" value="ktorLibs.server.compression"/>
<var name="package_name" value="io.ktor.server.plugins.compression"/>
<var name="plugin_name" value="Compression"/>

<tldr>
<p>
<b>必要な依存関係</b>: <code>io.ktor:%artifact_name%</code>
</p>
<var name="example_name" value="compression"/>
<p>
    <b>コード例</b>:
    <a href="https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/%example_name%">
        %example_name%
    </a>
</p>
<p>
    <b><Links href="server-native.md" summary="Ktor は Kotlin/Native をサポートしており、追加のランタイムや仮想マシンなしでサーバーを実行できます。">Native サーバー</Links>のサポート</b>: ✖️
</p>
</tldr>

Ktor は、[`Compression`](https://api.ktor.io/ktor-server-compression/io.ktor.server.plugins.compression/-compression.html) プラグインを使用して、レスポンスボディの圧縮およびリクエストボディの解凍を行う機能を提供します。

`Compression` プラグインを使用すると、以下のことが可能です。
- `gzip`、`zstd`、`deflate` などのさまざまな圧縮アルゴリズムの使用。
- コンテンツタイプやレスポンスサイズなど、データを圧縮するために必要な条件の指定。
- 特定のリクエストパラメータに基づいたデータの圧縮。

> `%plugin_name%` プラグインは現在、`SSE` レスポンスをサポートしていないことに注意してください。
>
{style="warning"}

> Ktor で事前圧縮された静的ファイルを提供する方法については、[事前圧縮ファイル](server-static-content.md#precompressed)を参照してください。

## 依存関係の追加 {id="add_dependencies"}

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

Zstandard 圧縮を含めるには、`ktor-server-compression-zstd` 依存関係を追加します。

   <var name="artifact_name" value="ktor-server-compression-zstd"/>
   <var name="ktor_version_catalog_name" value="ktorLibs.server.compression.zstd"/>
   <Tabs group="languages">
       <TabItem title="Gradle (Kotlin)" group-key="kotlin">
           <code-block lang="Kotlin" code="               implementation(%ktor_version_catalog_name%)"/>
           <note>
               上記のコードスニペットでは、Ktor の依存関係を指定するために <a href="server-dependencies.topic#using-version-catalog">
               Ktor バージョンカタログ</a> を使用しています。
           </note>
       </TabItem>
       <TabItem title="Gradle (Groovy)" group-key="groovy">
           <code-block lang="Groovy" code="               implementation %ktor_version_catalog_name%"/>
           <note>
               上記のコードスニペットでは、Ktor の依存関係を指定するために <a href="server-dependencies.topic#using-version-catalog">
               Ktor バージョンカタログ</a> を使用しています。
           </note>
       </TabItem>
       <TabItem title="Maven" group-key="maven">
           <code-block lang="XML" code="               &lt;dependency&gt;&#10;                   &lt;groupId&gt;io.ktor&lt;/groupId&gt;&#10;                   &lt;artifactId&gt;%artifact_name%-jvm&lt;/artifactId&gt;&#10;                   &lt;version&gt;${ktor_version}&lt;/version&gt;&#10;               &lt;/dependency&gt;"/>
       </TabItem>
   </Tabs>

## %plugin_name% のインストール {id="install_plugin"}

<p>
    アプリケーションに <code>%plugin_name%</code> プラグインを<a href="server-plugins.md#install">インストール</a>するには、指定された<Links href="server-modules.md" summary="モジュールを使用すると、ルートをグループ化してアプリケーションを構造化できます。">モジュール</Links>内の <code>install</code> 関数に渡します。
    以下の例は、<code>%plugin_name%</code> をインストールする方法を示しています。
</p>
<list>
    <li>
        <code>embeddedServer()</code> 関数の呼び出し内。
    </li>
    <li>
        <code>Application</code> クラスに明示的に定義された <code>module()</code> 拡張関数内。
    </li>
</list>
<Tabs>
    <TabItem title="embeddedServer">
        <code-block lang="kotlin" code="            import io.ktor.server.engine.*&#10;            import io.ktor.server.netty.*&#10;            import io.ktor.server.application.*&#10;            import %package_name%.*&#10;&#10;            fun main() {&#10;                embeddedServer(Netty, port = 8080) {&#10;                    install(%plugin_name%)&#10;                    // ...&#10;                }.start(wait = true)&#10;            }"/>
    </TabItem>
    <TabItem title="module">
        <code-block lang="kotlin" code="            import io.ktor.server.application.*&#10;            import %package_name%.*&#10;            // ...&#10;            fun Application.module() {&#10;                install(%plugin_name%)&#10;                // ...&#10;            }"/>
    </TabItem>
</Tabs>

これにより、サーバー上で `gzip`、`deflate`、`identity` エンコーダーが有効になります。

## 圧縮設定の構成 {id="configure"}

特定のエンコーダーのみを有効にする、優先順位を指定する、特定のコンテンツタイプのみを圧縮するなど、さまざまな方法で圧縮を設定できます。

### 特定のエンコーダーの追加 {id="add_specific_encoders"}

特定のエンコーダーのみを有効にするには、対応する拡張関数を呼び出します（例：）:

```kotlin
install(Compression) {
    gzip()
    deflate()
    zstd()
}
```

`priority` プロパティを設定することで、各圧縮アルゴリズムの優先順位を指定できます。

```kotlin
install(Compression) {
    gzip {
        priority = 0.9
    }
    deflate {
        priority = 1.0
    }
    zstd {
        priority = 0.8
    }
}
```

上記の例では、`deflate` の優先度の値が高いため、`gzip` や `zstd` よりも優先されます。なお、サーバーはまず [Accept-Encoding](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Accept-Encoding) ヘッダー内の [quality](https://developer.mozilla.org/en-US/docs/Glossary/Quality_Values)（品質）値を確認し、その後に指定された優先順位を考慮することに注意してください。

### コンテンツタイプの構成 {id="configure_content_type"}

デフォルトでは、Ktor は `audio`、`video`、`image`、`text/event-stream` などの特定のコンテンツタイプを圧縮しません。`matchContentType` を呼び出して圧縮対象のコンテンツタイプを選択するか、`excludeContentType` を使用して目的のメディアタイプを圧縮から除外することができます。以下のコードスニペットは、`gzip` を使用して JavaScript コードを圧縮し、`deflate` を使用してすべてのテキストサブタイプを圧縮する方法を示しています。

```kotlin
install(Compression) {
    gzip {
        matchContentType(
            ContentType.Application.JavaScript
        )
    }
    deflate {
        matchContentType(
            ContentType.Text.Any
        )
    }
}
```

完全なコード例はこちらで確認できます: [compression](https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/compression)

### レスポンスサイズの構成 {id="configure_response_size"}

`%plugin_name%` プラグインを使用すると、指定されたサイズを超えないレスポンスの圧縮を無効にすることができます。これを行うには、`minimumSize` 関数に必要な値（バイト単位）を渡します。

```kotlin
    install(Compression) {
    deflate {
        minimumSize(1024)
    }
}

```

### カスタム条件の指定 {id="specify_custom_conditions"}

必要に応じて、`condition` 関数を使用してカスタム条件を指定し、特定のリクエストパラメータに応じてデータを圧縮できます。以下のコードスニペットは、指定された URI に対するリクエストでデータを圧縮する方法を示しています。

```kotlin
install(Compression) {
    gzip {
        condition {
            request.uri == "/orders"
        }
    }
}
```

## HTTPS のセキュリティ {id="security"}

圧縮が有効になっている HTTPS は、[BREACH](https://en.wikipedia.org/wiki/BREACH) 攻撃に対して脆弱です。この攻撃を緩和するには、さまざまなアプローチを使用できます。たとえば、Referer ヘッダーがクロスサイトリクエストを示している場合に圧縮を無効化できます。Ktor では、Referer ヘッダーの値をチェックすることでこれを実現できます。

```kotlin
install(Compression) {
    gzip {
        condition {
            request.headers[HttpHeaders.Referrer]?.startsWith("https://my.domain/") == true
        }
    }
}
```

## Zstandard の圧縮レベル {id="compression_level"}

`level` パラメータを使用して、`zstd` の圧縮レベルを設定できます。デフォルトの圧縮レベルは `3` ですが、必要に応じて調整できます。

```kotlin
install(Compression) {
    // デフォルトは level = 3
    zstd(level = 20)
}
```

## リクエストの解凍 {id="decompression"}

デフォルトでは、`Compression` プラグインはサーバーレスポンスを圧縮します。リクエストの解凍を有効にするには、`mode` プロパティを `CompressionConfig.Mode.DecompressRequest` に設定します。

```kotlin
install(Compression) { 
    mode = CompressionConfig.Mode.DecompressRequest
    gzip()
}
```

リクエストの解凍が有効になっている場合、プラグインは設定されたデコーダーを使用して、デシリアライゼーションやマルチパート処理などの他の受信変換によって処理される前に、リクエストボディを解凍します。

## カスタムエンコーダーの実装 {id="custom_encoder"}

必要に応じて、[ContentEncoder](https://api.ktor.io/ktor-utils/io.ktor.util/-content-encoder/index.html) インターフェースを実装することで、独自のエンコーダーを提供できます。
実装例については、[GzipEncoder](https://github.com/ktorio/ktor/blob/b5b59ca3ae61601e6175f334e6a1252609638e61/ktor-server/ktor-server-plugins/ktor-server-compression/jvm/src/io/ktor/server/plugins/compression/Encoders.kt#L41) を参照してください。