[//]: # (title: Forwarded ヘッダー)

<show-structure for="chapter" depth="2"/>
<primary-label ref="server-plugin"/>

<var name="artifact_name" value="ktor-server-forwarded-header"/>
<var name="ktor_version_catalog_name" value="ktorLibs.server.forwardedHeader"/>
<var name="package_name" value="io.ktor.server.plugins.forwardedheaders"/>

<tldr>
<p>
<b>必要な依存関係</b>: <code>io.ktor:%artifact_name%</code>
</p>
<var name="example_name" value="forwarded-header"/>
<p>
    <b>コード例</b>:
    <a href="https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/%example_name%">
        %example_name%
    </a>
</p>
<p>
    <b><Links href="server-native.md" summary="Ktor は Kotlin/Native をサポートしており、追加のランタイムや仮想マシンなしでサーバーを実行できます。">ネイティブサーバー</Links>のサポート</b>: ✅
</p>
</tldr>

[ForwardedHeaders](https://api.ktor.io/ktor-server-forwarded-header/io.ktor.server.plugins.forwardedheaders/-forwarded-headers.html) および [XForwardedHeaders](https://api.ktor.io/ktor-server-forwarded-header/io.ktor.server.plugins.forwardedheaders/-x-forwarded-headers.html) プラグインを使用すると、Ktor サーバーがリバースプロキシの背後に配置されている場合に、リバースプロキシのヘッダーを処理して元の[リクエスト](server-requests.md)に関する情報を取得できます。これは[ロギング](server-logging.md)の目的に役立ちます。

* `ForwardedHeaders` は `Forwarded` ヘッダー（[RFC 7239](https://tools.ietf.org/html/rfc7239)）を処理します
* `XForwardedHeaders` は以下の `X-Forwarded-` ヘッダーを処理します:
   - `X-Forwarded-Host`/`X-Forwarded-Server` 
   - `X-Forwarded-For` 
   - `X-Forwarded-By`
   - `X-Forwarded-Proto`/`X-Forwarded-Protocol`
   - `X-Forwarded-SSL`/`Front-End-Https`

> `Forwarded` ヘッダーの改ざんを防ぐため、アプリケーションがリバースプロキシからの接続のみを受け入れる場合にのみ、これらのプラグインをインストールしてください。
> 
{type="note"}

## 依存関係の追加 {id="add_dependencies"}
`ForwardedHeaders`/`XForwardedHeaders` プラグインを使用するには、ビルドスクリプトに `%artifact_name%` アーティファクトを含める必要があります。

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

## プラグインのインストール {id="install_plugin"}

<Tabs>
<TabItem title="ForwardedHeader">

<var name="plugin_name" value="ForwardedHeaders"/>
<p>
    アプリケーションに <code>%plugin_name%</code> プラグインを<a href="server-plugins.md#install">インストール</a>するには、指定された<Links href="server-modules.md" summary="モジュールを使用すると、ルートをグループ化してアプリケーションを構造化できます。">モジュール</Links>内の <code>install</code> 関数に渡します。
    以下の例は、<code>%plugin_name%</code> をインストールする方法を示しています:
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

</TabItem>

<TabItem title="XForwardedHeader">

<var name="plugin_name" value="XForwardedHeaders"/>
<p>
    アプリケーションに <code>%plugin_name%</code> プラグインを<a href="server-plugins.md#install">インストール</a>するには、指定された<Links href="server-modules.md" summary="モジュールを使用すると、ルートをグループ化してアプリケーションを構造化できます。">モジュール</Links>内の <code>install</code> 関数に渡します。
    以下の例は、<code>%plugin_name%</code> をインストールする方法を示しています:
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

</TabItem>
</Tabs>

`ForwardedHeaders`/`XForwardedHeaders` をインストールすると、[call.request.origin](#request_info) プロパティを使用して元のリクエストに関する情報を取得できるようになります。

## リクエスト情報の取得 {id="request_info"}

### プロキシリクエスト情報 {id="proxy_request_info"}

プロキシリクエストに関する情報を取得するには、[ルートハンドラー](server-routing.md#define_route)内で [call.request.local](https://api.ktor.io/ktor-server-core/io.ktor.server.request/-application-request/local.html) プロパティを使用します。
以下のコードスニペットは、プロキシアドレスおよびリクエスト先のホストに関する情報を取得する方法を示しています:

```kotlin
get("/hello") {
    val remoteHost = call.request.local.remoteHost
    val serverHost = call.request.local.serverHost
}
```

### 元のリクエスト情報 {id="original-request-information"}

元のリクエストに関する情報を読み取るには、[call.request.origin](https://api.ktor.io/ktor-server-core/io.ktor.server.plugins/origin.html) プロパティを使用します:

```kotlin
get("/hello") {
    val originRemoteHost = call.request.origin.remoteHost
    val originServerHost = call.request.origin.serverHost
}
```

以下の表は、`ForwardedHeaders`/`XForwardedHeaders` がインストールされているかどうかに応じた、`call.request.origin` によって公開されるさまざまなプロパティの値を示しています。

![Request diagram](forwarded-headers.png){width="706"}

| プロパティ               | ForwardedHeaders なし | ForwardedHeaders あり |
|------------------------|--------------------------|-----------------------|
| `origin.localHost`     | _web-server_             | _web-server_          |
| `origin.localPort`     | _8080_                   | _8080_                |
| `origin.serverHost`    | _web-server_             | _proxy_               |
| `origin.serverPort`    | _8080_                   | _80_                  |
| `origin.remoteHost`    | _proxy_                  | _client_              |
| `origin.remotePort`    | _32864_                  | _32864_               |

> 完全な例はこちらで確認できます: [forwarded-header](https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/forwarded-header)。

## ForwardedHeaders の設定 {id="configure"}

リクエストが複数のプロキシを経由する場合、`ForwardedHeaders`/`XForwardedHeaders` の設定が必要になることがあります。
この場合、`X-Forwarded-For` には後続の各プロキシのすべての IP アドレスが含まれます。例えば:

```HTTP
X-Forwarded-For: <client>, <proxy1>, <proxy2>
```

デフォルトでは、`XForwardedHeader` は `X-Forwarded-For` の最初のエントリを `call.request.origin.remoteHost` プロパティに割り当てます。
また、[IP アドレスの選択](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/X-Forwarded-For#selecting_an_ip_address)に関してカスタムロジックを提供することもできます。
[XForwardedHeadersConfig](https://api.ktor.io/ktor-server-forwarded-header/io.ktor.server.plugins.forwardedheaders/-x-forwarded-headers-config/index.html) は、このための以下の API を公開しています:

- `useFirstProxy` および `useLastProxy` は、IP アドレスのリストからそれぞれ最初または最後の値を取得できます。
- `skipLastProxies` は、右端から指定された数のエントリをスキップし、その次のエントリを取得します。
   例えば、`proxiesCount` パラメーターが `3` の場合、以下のヘッダーに対して `origin.remoteHost` は `10.0.0.123` を返します:
   ```HTTP
   X-Forwarded-For: 10.0.0.123, proxy-1, proxy-2, proxy-3
   ```
- `skipKnownProxies` は、リストから指定されたエントリを削除し、最後のエントリを取得します。
   例えば、この関数に `listOf("proxy-1", "proxy-3")` を渡した場合、以下のヘッダーに対して `origin.remoteHost` は `proxy-2` を返します:
   ```HTTP
   X-Forwarded-For: 10.0.0.123, proxy-1, proxy-2, proxy-3
   ```
- `extractEdgeProxy` を使用すると、`X-Forward-*` ヘッダーから値を抽出するためのカスタムロジックを提供できます。