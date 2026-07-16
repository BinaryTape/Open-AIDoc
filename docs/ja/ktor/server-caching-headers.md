[//]: # (title: キャッシングヘッダー)

<show-structure for="chapter" depth="2"/>
<primary-label ref="server-plugin"/>

<var name="plugin_name" value="CachingHeaders"/>
<var name="package_name" value="io.ktor.server.plugins.cachingheaders"/>
<var name="artifact_name" value="ktor-server-caching-headers"/>

<tldr>
<p>
<b>必須の依存関係</b>: <code>io.ktor:%artifact_name%</code>
</p>
<var name="example_name" value="caching-headers"/>
<p>
    <b>コード例</b>:
    <a href="https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/%example_name%">
        %example_name%
    </a>
</p>
<p>
    <b><Links href="/ktor/server-native" summary="KtorはKotlin/Nativeをサポートしており、追加のランタイムや仮想マシンなしでサーバーを実行できます。">ネイティブサーバー</Links>のサポート</b>: ✅
</p>
</tldr>

[CachingHeaders](https://api.ktor.io/ktor-server-caching-headers/io.ktor.server.plugins.cachingheaders/-caching-headers.html) プラグインは、HTTP キャッシングに使用される `Cache-Control` および `Expires` ヘッダーを設定する機能を追加します。キャッシングは以下の方法で[設定](#configure)できます：
- 画像、CSS、JavaScript ファイルなどの特定のコンテンツタイプに対して、異なるキャッシュ戦略を設定する。
- アプリケーションレベルでのグローバル、ルートレベル、または特定のコールといった、さまざまなレベルでキャッシングオプションを指定する。

## 依存関係の追加 {id="add_dependencies"}

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

## %plugin_name% のインストール {id="install_plugin"}

<p>
    <code>%plugin_name%</code> プラグインをアプリケーションに<a href="#install">インストール</a>するには、指定された<Links href="/ktor/server-modules" summary="モジュールを使用すると、ルートをグループ化してアプリケーションを構造化できます。">モジュール</Links>内の <code>install</code> 関数に渡します。
    以下のコードスニペットは、<code>%plugin_name%</code> をインストールする方法を示しています...
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
<p>
    <code>%plugin_name%</code> プラグインは、<a href="#install-route">特定のルートにインストール</a>することもできます。
    これは、アプリケーションのリソースごとに異なる <code>%plugin_name%</code> 設定が必要な場合に便利です。
</p>

`%plugin_name%` をインストールした後、さまざまなコンテンツタイプに対してキャッシング設定を[構成](#configure)できます。

## キャッシングの設定 {id="configure"}
`%plugin_name%` プラグインを設定するには、特定の `ApplicationCall` とコンテンツタイプに対して指定されたキャッシングオプションを提供するために、[options](https://api.ktor.io/ktor-server-caching-headers/io.ktor.server.plugins.cachingheaders/-caching-headers-config/options.html) 関数を定義する必要があります。[caching-headers](https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/caching-headers) の例のコードスニペットは、プレーンテキストと HTML に対して `max-age` オプションを含む `Cache-Control` ヘッダーを追加する方法を示しています：

```kotlin
fun Application.module() {
    routing {
        install(CachingHeaders) {
            options { call, content ->
                when (content.contentType?.withoutParameters()) {
                    ContentType.Text.Plain -> CachingOptions(CacheControl.MaxAge(maxAgeSeconds = 3600))
                    ContentType.Text.Html -> CachingOptions(CacheControl.MaxAge(maxAgeSeconds = 60))
                    else -> null
                }
            }
        }
    }
}
```

[CachingOptions](https://api.ktor.io/ktor-http/io.ktor.http.content/-caching-options/index.html) オブジェクトは、パラメータとして `Cache-Control` および `Expires` ヘッダーの値を受け入れます：

* `cacheControl` パラメータは [CacheControl](https://api.ktor.io/ktor-http/io.ktor.http/-cache-control/index.html) 値を受け入れます。`CacheControl.MaxAge` を使用して `max-age` パラメータと、可視性、再検証オプションなどの関連設定を指定できます。`CacheControl.NoCache`/`CacheControl.NoStore` を使用してキャッシングを無効にすることもできます。
* `expires` パラメータを使用すると、`Expires` ヘッダーを `GMTDate` または `ZonedDateTime` 値として指定できます。

### ルートレベル {id="configure-route"}

プラグインはグローバルだけでなく、[特定のルート](server-plugins.md#install-route)にもインストールできます。例えば、以下の例は `/index` ルートに対して指定されたキャッシングヘッダーを追加する方法を示しています：

```kotlin
route("/index") {
    install(CachingHeaders) {
        options { call, content -> CachingOptions(CacheControl.MaxAge(maxAgeSeconds = 1800)) }
    }
    get {
        call.respondText("Index page")
    }
}
```

### コールレベル {id="configure-call"}

より詳細なキャッシング設定が必要な場合は、`ApplicationCall.caching` プロパティを使用してコールレベルでキャッシングオプションを設定できます。以下の例は、ユーザーがログインしているかどうかに応じてキャッシングオプションを設定する方法を示しています：

```kotlin
route("/profile") {
    get {
        val userLoggedIn = true
        if(userLoggedIn) {
            call.caching = CachingOptions(CacheControl.NoStore(CacheControl.Visibility.Private))
            call.respondText("Profile page")
        } else {
            call.caching = CachingOptions(CacheControl.MaxAge(maxAgeSeconds = 900))
            call.respondText("Login page")
        }
    }
}
```

> ユーザーのログインには、[Authentication](server-auth.md) および [Sessions](server-sessions.md) プラグインを使用できます。