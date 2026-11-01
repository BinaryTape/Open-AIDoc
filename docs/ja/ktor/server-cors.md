[//]: # (title: CORS)

<show-structure for="chapter" depth="2"/>
<primary-label ref="server-plugin"/>

<var name="artifact_name" value="ktor-server-cors"/>
<var name="ktor_version_catalog_name" value="ktorLibs.server.cors"/>
<var name="package_name" value="io.ktor.server.plugins.cors"/>
<var name="plugin_name" value="CORS"/>

<tldr>
<p>
<b>必要な依存関係</b>: <code>io.ktor:%artifact_name%</code>
</p>
<var name="example_name" value="cors"/>
<p>
    <b>コード例</b>:
    <a href="https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/%example_name%">
        %example_name%
    </a>
</p>
<p>
    <b><Links href="server-native.md" summary="Ktor supports Kotlin/Native and allows you to run a server without an additional runtime or virtual machine.">Native サーバー</Links>のサポート</b>: ✅
</p>
</tldr>

サーバーで[クロスオリジンリクエスト（cross-origin requests）](https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS)を処理する必要がある場合は、Ktor の [CORS](https://api.ktor.io/ktor-server-cors/io.ktor.server.plugins.cors.routing/-c-o-r-s.html) プラグインをインストールして設定する必要があります。このプラグインを使用すると、許可されたホスト、HTTP メソッド、クライアントによって設定されるヘッダーなどを設定できます。

## 依存関係の追加 {id="add_dependencies"}

<p>
    <code>%plugin_name%</code> を使用するには、ビルドスクリプトに <code>%artifact_name%</code> アーティファクトを追加します:
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

## %plugin_name% のインストール {id="install_plugin"}

<p>
    アプリケーションに <code>%plugin_name%</code> プラグインを<a href="server-plugins.md#install">インストール</a>するには、指定された<Links href="server-modules.md" summary="Modules allow you to structure your application by grouping routes.">モジュール</Links>内の <code>install</code> 関数に渡します。
    以下の例は、<code>%plugin_name%</code> をインストールする方法を示しています:
</p>
<list>
    <li>
        <code>embeddedServer()</code> 関数呼び出し内。
    </li>
    <li>
        <code>Application</code> クラスで明示的に定義された <code>module()</code> 拡張関数内。
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
<p>
    <code>%plugin_name%</code> プラグインは、<a href="server-plugins.md#install-route">特定のルートにインストール</a>することもできます。
    これは、アプリケーションの異なるリソースに対して異なる <code>%plugin_name%</code> 設定が必要な場合に役立ちます。
</p>

> 特定のルートに `CORS` プラグインをインストールする場合は、そのルートに `options` [ハンドラー](server-routing.md#define_route)を追加する必要があります。これにより、Ktor は CORS プリフライトリクエストに正しく応答できるようになります。

## CORS の設定 {id="configure"}

CORS 固有の設定は、[CORSConfig](https://api.ktor.io/ktor-server-cors/io.ktor.server.plugins.cors/-c-o-r-s-config/index.html) クラスによって提供されます。これらの設定を行う方法を見てみましょう。

### 概要 {id="overview"}

ポート `8080` でリッスンし、`/customer` [ルート](server-routing.md) が [JSON](server-serialization.md#send_data) データで応答するサーバーがあると仮定します。以下のコードスニペットは、このリクエストをクロスオリジンにするために、別のポートで動作しているクライアントから Fetch API を使用して行われるサンプルのリクエストを示しています:

```javascript
function saveCustomer() {
    fetch('http://0.0.0.0:8080/customer',
        {
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            method: "POST",
            body: JSON.stringify({id: 3, firstName: "Jet", lastName: "Brains"})
        })
        .then(response => response.text())
        .then(data => {
            console.log('Success:', data);
            alert(data);
        })
        .catch((error) => {
            console.error('Error:', error);
        });
}

```
{initial-collapse-state="collapsed" collapsed-title="
fetch('http://0.0.0.0:8080/customer')"}

バックエンド側でこのようなリクエストを許可するには、`CORS` プラグインを次のように設定する必要があります:

```kotlin
install(CORS) {
    allowHost("0.0.0.0:8081")
    allowHeader(HttpHeaders.ContentType)
}
```

完全な例は [cors](https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/cors) で確認できます。

### ホスト {id="hosts"}

クロスオリジンリクエストを許可するホストを指定するには、`allowHost` 関数を使用します。ホスト名に加えて、ポート番号、サブドメインのリスト、またはサポートされる HTTP スキームを指定できます。

```kotlin
install(CORS) {
    allowHost("client-host")
    allowHost("client-host:8081")
    allowHost("client-host", subDomains = listOf("en", "de", "es"))
    allowHost("client-host", schemes = listOf("http", "https"))
}
```

任意のホストからのクロスオリジンリクエストを許可するには、`anyHost` 関数を使用します。

```kotlin
install(CORS) {
    anyHost()
}
```

### HTTP メソッド {id="methods"}

デフォルトでは、`%plugin_name%` プラグインは `GET`、`POST`、`HEAD` の HTTP メソッドを許可します。メソッドを追加するには、`allowMethod` 関数を使用します。

```kotlin
install(CORS) {
    allowMethod(HttpMethod.Options)
    allowMethod(HttpMethod.Put)
    allowMethod(HttpMethod.Patch)
    allowMethod(HttpMethod.Delete)
}
```

### ヘッダーの許可 {id="headers"}

デフォルトでは、`%plugin_name%` プラグインは `Access-Control-Allow-Headers` によって管理される以下のクライアントヘッダーを許可します:

* `Accept`
* `Accept-Language`
* `Content-Language`

追加のヘッダーを許可するには、`allowHeader` 関数を使用します。

```kotlin
install(CORS) {
    allowHeader(HttpHeaders.ContentType)
    allowHeader(HttpHeaders.Authorization)
}
```

カスタムヘッダーを許可するには、`allowHeaders` または `allowHeadersPrefixed` 関数を使用します。たとえば、以下のコードスニペットはプレフィックスが `custom-` のヘッダーを許可する方法を示しています。

```kotlin
install(CORS) {
    allowHeadersPrefixed("custom-")
}
```

> 単純でないコンテンツタイプ（non-simple content types）の場合、`allowHeaders` または `allowHeadersPrefixed` では [allowNonSimpleContentTypes](https://api.ktor.io/ktor-server-cors/io.ktor.server.plugins.cors/-c-o-r-s-config/allow-non-simple-content-types.html) プロパティを `true` に設定する必要があることに注意してください。

### ヘッダーの公開 {id="expose-headers"}

`Access-Control-Expose-Headers` ヘッダーは、ブラウザー内の JavaScript がアクセスできる許可リストに指定したヘッダーを追加します。
このようなヘッダーを設定するには、`exposeHeader` 関数を使用します。

```kotlin
install(CORS) {
    // ...
    exposeHeader("X-My-Custom-Header")
    exposeHeader("X-Another-Custom-Header")
}
```

### クレデンシャル {id="credentials"}

デフォルトでは、ブラウザーはクロスオリジンリクエストでクレデンシャル情報（Cookie や認証情報など）を送信しません。この情報の受け渡しを許可するには、`allowCredentials` プロパティを使用して `Access-Control-Allow-Credentials` レスポンスヘッダーを `true` に設定します。

```kotlin
install(CORS) {
    allowCredentials = true
}
```

### その他 {id="misc"}

`%plugin_name%` プラグインでは、その他の CORS 関連の設定を指定することもできます。たとえば、`maxAgeInSeconds` を使用して、別のプリフライトリクエストを送信することなくプリフライトリクエストへのレスポンスをキャッシュできる期間を指定できます。

```kotlin
install(CORS) {
    maxAgeInSeconds = 3600
}
```

その他の設定オプションについては、[CORSConfig](https://api.ktor.io/ktor-server-cors/io.ktor.server.plugins.cors/-c-o-r-s-config/index.html) を参照してください。