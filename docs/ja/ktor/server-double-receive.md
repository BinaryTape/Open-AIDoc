[//]: # (title: DoubleReceive)

<primary-label ref="server-plugin"/>

<var name="plugin_name" value="DoubleReceive"/>
<var name="package_name" value="io.ktor.server.plugins.doublereceive"/>
<var name="artifact_name" value="ktor-server-double-receive"/>

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
    <b><Links href="/ktor/server-native" summary="KtorはKotlin/Nativeをサポートしており、追加のランタイムや仮想マシンなしでサーバーを実行できます。">Native サーバー</Links>のサポート</b>: ✅
</p>
</tldr>

[%plugin_name%](https://api.ktor.io/ktor-server-double-receive/io.ktor.server.plugins.doublereceive/-double-receive.html) プラグインは、`RequestAlreadyConsumedException` 例外を発生させずに[リクエストボディを複数回受信する](server-requests.md#body_contents)機能を提供します。
これは、[プラグイン](server-plugins.md)がすでにリクエストボディを消費しているために、ルートハンドラー内でそれを受信できない場合に役立ちます。
例えば、`%plugin_name%` を使用して [CallLogging](server-call-logging.md) プラグインでリクエストボディをログに記録し、その後 `post` [ルートハンドラー](server-routing.md#define_route)内でもう一度ボディを受信することができます。

> `%plugin_name%` プラグインは、今後のアップデートで破壊的変更が加えられる可能性がある、進化中の実験的な API を使用しています。
>
{type="note"}

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
    <code>%plugin_name%</code> プラグインをアプリケーションに<a href="#install">インストール</a>するには、指定された <Links href="/ktor/server-modules" summary="モジュールを使用すると、ルートをグループ化してアプリケーションを構造化できます。">モジュール</Links> 内の <code>install</code> 関数に渡します。
    以下のコードスニペットは、<code>%plugin_name%</code> のインストール方法を示しています...
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

`%plugin_name%` をインストールすると、[リクエストボディを複数回受信](server-requests.md#body_contents)できるようになり、呼び出すたびに同じインスタンスが返されます。
例えば、CallLogging プラグインを使用してリクエストボディのログ出力を有効にし...

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

... その後、ルートハンドラー内でもう一度リクエストボディを取得できます。

```kotlin
post("/") {
    val receivedText = call.receiveText()
    call.respondText("Text '$receivedText' is received")
}
```

完全な例はこちらにあります: [double-receive](https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/double-receive)。

## %plugin_name% の設定 {id="configure"}
デフォルトの設定では、`%plugin_name%` はリクエストボディを以下の型として[受信する機能](server-requests.md#body_contents)を提供します：

- `ByteArray` 
- `String`
- `Parameters` 
- `ContentNegotiation` プラグインで使用される [データクラス](server-serialization.md#create_data_class)

デフォルトでは、`%plugin_name%` は以下をサポートしていません：

- 同じリクエストから異なる型を受信する
- [ストリームまたはチャネル](server-requests.md#raw)を受信する

同じリクエストから異なる型を受信したり、ストリームやチャネルを受信したりする必要がない場合は、`cacheRawRequest` プロパティを `false` に設定してください：

```kotlin
install(DoubleReceive) {
    cacheRawRequest = false
}