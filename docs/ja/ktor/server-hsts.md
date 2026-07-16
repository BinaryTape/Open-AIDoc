[//]: # (title: HSTS)

<primary-label ref="server-plugin"/>

<var name="plugin_name" value="HSTS"/>
<var name="package_name" value="io.ktor.server.plugins.hsts"/>
<var name="artifact_name" value="ktor-server-hsts"/>

<tldr>
<p>
<b>必須の依存関係</b>: <code>io.ktor:%artifact_name%</code>
</p>
<var name="example_name" value="ssl-engine-main-hsts"/>
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

[%plugin_name%](https://api.ktor.io/ktor-server-hsts/io.ktor.server.plugins.hsts/-h-s-t-s.html) プラグインは、[RFC 6797](https://tools.ietf.org/html/rfc6797) に従って、必要な _HTTP Strict Transport Security_ ヘッダーをリクエストに追加します。ブラウザがHSTSポリシーヘッダーを受信すると、一定期間、安全でない接続を使用してサーバーに接続しようとしなくなります。

> HSTSポリシーヘッダーは、安全でないHTTP接続経由では無視されることに注意してください。HSTSを有効にするには、[セキュア](server-ssl.md)な接続経由で提供される必要があります。

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
    <code>%plugin_name%</code> プラグインをアプリケーションに<a href="#install">インストール</a>するには、指定された<Links href="/ktor/server-modules" summary="モジュールを使用すると、ルートをグループ化することでアプリケーションを構造化できます。">モジュール</Links>内の <code>install</code> 関数に渡します。
    以下のコードスニペットは、<code>%plugin_name%</code> をインストールする方法を示しています...
</p>
<list>
    <li>
        ... <code>embeddedServer</code> 関数の呼び出し内。
    </li>
    <li>
        ... 明示的に定義された <code>module</code>（<code>Application</code> クラスの拡張関数）内。
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

## %plugin_name% の設定 {id="configure"}

`%plugin_name%` は [HSTSConfig](https://api.ktor.io/ktor-server-hsts/io.ktor.server.plugins.hsts/-h-s-t-s-config/index.html) を通じて設定を公開します。以下の例では、`maxAgeInSeconds` プロパティを使用して、クライアントが既知のHSTSホストのリストにホストを保持する期間を指定する方法を示しています。

```kotlin
install(HSTS) {
    maxAgeInSeconds = 10
}
```

また、`withHost` を使用して、ホストごとに異なるHSTS設定を提供することもできます。

```kotlin
install(HSTS) {
    maxAgeInSeconds = 10
    withHost("sample-host") {
        maxAgeInSeconds = 60
        includeSubDomains = false
    }
}
```

完全な例はこちらにあります: [ssl-engine-main-hsts](https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/ssl-engine-main-hsts)