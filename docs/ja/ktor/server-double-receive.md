[//]: # (title: DoubleReceive)

<primary-label ref="server-plugin"/>

<var name="plugin_name" value="DoubleReceive"/>
<var name="package_name" value="io.ktor.server.plugins.doublereceive"/>
<var name="artifact_name" value="ktor-server-double-receive"/>
<var name="ktor_version_catalog_name" value="ktorLibs.server.doubleReceive"/>

<tldr>
<p>
<b>必要な依存関係</b>: <code>io.ktor:%artifact_name%</code>
</p>
<var name="example_name" value="double-receive"/>
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

[%plugin_name%](https://api.ktor.io/ktor-server-double-receive/io.ktor.server.plugins.doublereceive/-double-receive.html) プラグインは、`RequestAlreadyConsumedException` 例外を発生させることなく、[リクエスト本文を複数回受信する](server-requests.md#body_contents) 機能を提供します。
これは、[プラグイン](server-plugins.md) がすでにリクエスト本文を消費してしまったために、ルートハンドラー内でリクエスト本文を受信できなくなった場合に便利です。
例えば、`%plugin_name%` を使用すると、[CallLogging](server-call-logging.md) プラグインを使用してリクエスト本文をログに記録し、その後 `post` [ルートハンドラー](server-routing.md#define_route) 内でもう一度本文を受信することができます。

## 依存関係の追加 {id="add_dependencies"}

<p>
    <code>%plugin_name%</code> を使用するには、ビルドスクリプトに <code>%artifact_name%</code> アーティファクトを追加します。
</p>
<Tabs group="languages">
    <TabItem title="Gradle (Kotlin)" group-key="kotlin">
        <code-block lang="Kotlin" code="            implementation(%ktor_version_catalog_name%)"/>
        <note>
            上記のコードスニペットでは、Ktor の依存関係を指定するために <a href="server-dependencies.topic#using-version-catalog">Ktor バージョンカタログ</a> を使用しています。
        </note>
    </TabItem>
    <TabItem title="Gradle (Groovy)" group-key="groovy">
        <code-block lang="Groovy" code="            implementation %ktor_version_catalog_name%"/>
        <note>
            上記のコードスニペットでは、Ktor の依存関係を指定するために <a href="server-dependencies.topic#using-version-catalog">Ktor バージョンカタログ</a> を使用しています。
        </note>
    </TabItem>
    <TabItem title="Maven" group-key="maven">
        <code-block lang="XML" code="            &lt;dependency&gt;&#10;                &lt;groupId&gt;io.ktor&lt;/groupId&gt;&#10;                &lt;artifactId&gt;%artifact_name%-jvm&lt;/artifactId&gt;&#10;                &lt;version&gt;${ktor_version}&lt;/version&gt;&#10;            &lt;/dependency&gt;"/>
    </TabItem>
</Tabs>

## %plugin_name% のインストール {id="install_plugin"}

<p>
    <code>%plugin_name%</code> プラグインをアプリケーションに<a href="server-plugins.md#install">インストール</a>するには、
    指定した<Links href="server-modules.md" summary="Modules allow you to structure your application by grouping routes.">モジュール</Links>内の <code>install</code> 関数に渡します。
    以下の例は、<code>%plugin_name%</code> をインストールする方法を示しています。
</p>
<list>
    <li>
        <code>embeddedServer()</code> 関数の呼び出し内。
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
    これは、アプリケーションのリソースごとに異なる <code>%plugin_name%</code> 設定が必要な場合に便利です。
</p>

`%plugin_name%` をインストールした後は、[リクエスト本文を複数回受信](server-requests.md#body_contents) することができ、呼び出しごとに同じインスタンスが返されます。
例えば、[CallLogging](server-call-logging.md) プラグインを使用してリクエスト本文のロギングを有効にし...

```kotlin
install(CallLogging) {
    level = Level.TRACE
    format { call ->
        runBlocking {
            "Body: ${call.receiveText()}"
        }
    }
}
```

...その後、ルートハンドラー内でもう一度リクエスト本文を取得することができます。

```kotlin
post("/") {
    val receivedText = call.receiveText()
    call.respondText("Text '$receivedText' is received")
}
```

完全なコード例はこちらで確認できます: [double-receive](https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/double-receive)

## %plugin_name% の設定 {id="configure"}
デフォルト設定では、`%plugin_name%` は以下の型として[リクエスト本文を受信する](server-requests.md#body_contents) 機能を提供します。

- `ByteArray` 
- `String`
- `Parameters` 
- `ContentNegotiation` プラグインで使用される[データクラス](server-serialization.md#create_data_class)

デフォルトでは、`%plugin_name%` は以下をサポートしていません:

- 同じリクエストから異なる型を受信すること
- [ストリームまたはチャネル](server-requests.md#raw) を受信すること

同じリクエストから異なる型を受信したり、ストリームやチャネルを受信したりする必要がない場合は、`cacheRawRequest` プロパティを `false` に設定します:

```kotlin
install(DoubleReceive) {
    cacheRawRequest = false
}
```