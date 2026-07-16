[//]: # (title: Forwardedヘッダー)

<show-structure for="chapter" depth="2"/>
<primary-label ref="server-plugin"/>

<var name="artifact_name" value="ktor-server-forwarded-header"/>
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
    <b><Links href="/ktor/server-native" summary="KtorはKotlin/Nativeをサポートしており、追加のランタイムや仮想マシンなしでサーバーを実行できます。">Nativeサーバー</Links>のサポート</b>: ✅
</p>
</tldr>

[ForwardedHeaders](https://api.ktor.io/ktor-server-forwarded-header/io.ktor.server.plugins.forwardedheaders/-forwarded-headers.html) および [XForwardedHeaders](https://api.ktor.io/ktor-server-forwarded-header/io.ktor.server.plugins.forwardedheaders/-x-forwarded-headers.html) プラグインを使用すると、Ktorサーバーがリバースプロキシの背後に配置されている場合に、リバースプロキシヘッダーを処理して元の[リクエスト](server-requests.md)に関する情報を取得できます。これは[ロギング](server-logging.md)の目的などに役立ちます。

* `ForwardedHeaders` は `Forwarded` ヘッダー ([RFC 7239](https://tools.ietf.org/html/rfc7239)) を処理します。
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
        <code-block lang="Kotlin" code="            implementation(&quot;io.ktor:%artifact_name%:$ktor_version&quot;)"></code-block>
    </TabItem>
    <TabItem title="Gradle (Groovy)" group-key="groovy">
        <code-block lang="Groovy" code="            implementation &quot;io.ktor:%artifact_name%:$ktor_version&quot;"></code-block>
    </TabItem>
    <TabItem title="Maven" group-key="maven">
        <code-block lang="XML" code="            &lt;dependency&gt;&#10;                &lt;groupId&gt;io.ktor&lt;/groupId&gt;&#10;                &lt;artifactId&gt;%artifact_name%-jvm&lt;/artifactId&gt;&#10;                &lt;version&gt;${ktor_version}&lt;/version&gt;&#10;            &lt;/dependency&gt;"></code-block>
    </TabItem>
</Tabs>

## プラグインのインストール {id="install_plugin"}

<Tabs>
<TabItem title="ForwardedHeader">

<var name="plugin_name" value="ForwardedHeaders"/>
<p>
    <code>%plugin_name%</code> プラグインをアプリケーションに<a href="#install">インストール</a>するには、指定された <Links href="/ktor/server-modules" summary="モジュールを使用すると、ルートをグループ化してアプリケーションを構造化できます。">モジュール</Links>内の <code>install</code> 関数に渡します。
    以下のコードスニペットは、<code>%plugin_name%</code> をインストールする方法を示しています。
</p>
<list>
    <li>
        ... <code>embeddedServer</code> 関数の呼び出し内。
    </li>
    <li>
        ... <code>Application</code> クラスの拡張関数である、明示的に定義された <code>module</code> 内。
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

</TabItem>

<TabItem title="XForwardedHeader">

<var name="plugin_name" value="XForwardedHeaders"/>
<p>
    <code>%plugin_name%</code> プラグインをアプリケーションに<a href="#install">インストール</a>するには、指定された <Links href="/ktor/server-modules" summary="モジュールを使用すると、ルートをグループ化してアプリケーションを構造化できます。">モジュール</Links>内の <code>install</code> 関数に渡します。
    以下のコードスニペットは、<code>%plugin_name%</code> をインストールする方法を示しています。
</p>
<list>
    <li>
        ... <code>embeddedServer</code> 関数の呼び出し内。
    </li>
    <li>
        ... <code>Application</code> クラスの拡張関数である、明示的に定義された <code>module</code> 内。
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

</TabItem>
</Tabs>

`ForwardedHeaders`/`XForwardedHeaders` をインストールした後、[call.request.origin](#request_info) プロパティを使用して元のリクエストに関する情報を取得できます。

## リクエスト情報の取得 {id="request_info"}

### プロキシリクエスト情報 {id="proxy_request_info"}

プロキシリクエストに関する情報を取得するには、[ルートハンドラー](server-routing.md#define_route)内で [call.request.local](https://api.ktor.io/ktor-server-core/io.ktor.server.request/-application-request/local.html) プロパティを使用します。
以下のコードスニペットは、プロキシアドレスとリクエストが行われたホストに関する情報を取得する方法を示しています。

```kotlin
get("/hello") {
    val remoteHost = call.request.local.remoteHost
    val serverHost = call.request.local.serverHost
}
```

### 元のリクエスト情報 {id="original-request-information"}

元のリクエストに関する情報を読み取るには、[call.request.origin](https://api.ktor.io/ktor-server-core/io.ktor.server.plugins/origin.html) プロパティを使用します。

```kotlin
get("/hello") {
    val originRemoteHost = call.request.origin.remoteHost
    val originServerHost = call.request.origin.serverHost
}
```

以下の表は、`ForwardedHeaders`/`XForwardedHeaders` がインストールされているかどうかに応じて、`call.request.origin` によって公開されるさまざまなプロパティの値を示しています。

![リクエスト図](forwarded-headers.png){width="706"}

| プロパティ               | ForwardedHeadersなし | ForwardedHeadersあり |
|------------------------|--------------------------|-----------------------|
| `origin.localHost`     | _web-server_             | _web-server_          |
| `origin.localPort`     | _8080_                   | _8080_                |
| `origin.serverHost`    | _web-server_             | _proxy_               |
| `origin.serverPort`    | _8080_                   | _80_                  |
| `origin.remoteHost`    | _proxy_                  | _client_              |
| `origin.remotePort`    | _32864_                  | _32864_               |

> 完全な例はこちらで見つけることができます: [forwarded-header](https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/forwarded-header)。

## ForwardedHeadersの構成 {id="configure"}

リクエストが複数のプロキシを経由する場合、`ForwardedHeaders`/`XForwardedHeaders` を構成する必要があるかもしれません。
この場合、`X-Forwarded-For` には、次のような各プロキシのすべてのIPアドレスが含まれます。

```HTTP
X-Forwarded-For: <client>, <proxy1>, <proxy2>
```

デフォルトでは、`XForwardedHeader` は `X-Forwarded-For` の最初のエントリを `call.request.origin.remoteHost` プロパティに割り当てます。
また、[IPアドレスを選択する](https://developer.mozilla.org/ja/docs/Web/HTTP/Headers/X-Forwarded-For#selecting_an_ip_address)ためのカスタムロジックを提供することもできます。
[XForwardedHeadersConfig](https://api.ktor.io/ktor-server-forwarded-header/io.ktor.server.plugins.forwardedheaders/-x-forwarded-headers-config/index.html) は、このために以下のAPIを公開しています。

- `useFirstProxy` および `useLastProxy` を使用すると、それぞれIPアドレスのリストから最初または最後の値を取得できます。
- `skipLastProxies` は、右側から指定された数のエントリをスキップし、次のエントリを取得します。
   たとえば、`proxiesCount` パラメータが `3` の場合、以下のヘッダーに対して `origin.remoteHost` は `10.0.0.123` を返します。
   ```HTTP
   X-Forwarded-For: 10.0.0.123, proxy-1, proxy-2, proxy-3
   ```
- `skipKnownProxies` は、リストから指定されたエントリを削除し、最後のエントリを取得します。
   たとえば、この関数に `listOf("proxy-1", "proxy-3")` を渡すと、以下のヘッダーに対して `origin.remoteHost` は `proxy-2` を返します。
   ```HTTP
   X-Forwarded-For: 10.0.0.123, proxy-1, proxy-2, proxy-3
   ```
- `extractEdgeProxy` を使用すると、`X-Forward-*` ヘッダーから値を抽出するためのカスタムロジックを提供できます。