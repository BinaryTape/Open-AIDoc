[//]: # (title: HttpsRedirect)

<primary-label ref="server-plugin"/>

<var name="plugin_name" value="HttpsRedirect"/>
<var name="package_name" value="io.ktor.server.plugins.httpsredirect"/>
<var name="artifact_name" value="ktor-server-http-redirect"/>

<tldr>
<p>
<b>必須依存関係</b>: <code>io.ktor:%artifact_name%</code>
</p>
<var name="example_name" value="ssl-engine-main-redirect"/>
<p>
    <b>コード例</b>:
    <a href="https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/%example_name%">
        %example_name%
    </a>
</p>
<p>
    <b><Links href="/ktor/server-native" summary="Ktor supports Kotlin/Native and allows you to run a server without an additional runtime or virtual machine.">Native サーバー</Links>のサポート</b>: ✅
</p>
</tldr>

[%plugin_name%](https://api.ktor.io/ktor-server-http-redirect/io.ktor.server.plugins.httpsredirect/-https-redirect.html) プラグインは、呼び出しを処理する前に、すべての HTTP リクエストを [HTTPS の対応するリクエスト](server-ssl.md)にリダイレクトします。デフォルトでは、リソースは `301 Moved Permanently` を返しますが、`302 Found` を返すように構成することも可能です。

## 依存関係の追加 {id="add_dependencies"}

<p>
    <code>%plugin_name%</code> を使用するには、ビルドスクリプトに <code>%artifact_name%</code> アーティファクトを含める必要があります：
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
    <code>%plugin_name%</code> プラグインをアプリケーションに<a href="#install">インストール</a>するには、指定された <Links href="/ktor/server-modules" summary="Modules allow you to structure your application by grouping routes.">モジュール</Links> 内で <code>install</code> 関数に渡します。
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

上記のコードは、デフォルトの構成で `%plugin_name%` プラグインをインストールします。

>リバースプロキシの背後にある場合、HTTPS リクエストを正しく検出するには `ForwardedHeader` または `XForwardedHeader` プラグインをインストールする必要があります。これらのプラグインのいずれかをインストールした後に無限リダイレクトが発生する場合は、詳細について[この FAQ エントリ](FAQ.topic#infinite-redirect)を確認してください。
>
{type="note"}

## %plugin_name% の構成 {id="configure"}

以下のコードスニペットは、目的の HTTPS ポートを構成し、リクエストされたリソースに対して `301 Moved Permanently` を返す方法を示しています：

```kotlin
install(HttpsRedirect) {
    sslPort = 8443
    permanentRedirect = true
}
```

完全な例はこちらにあります：[ssl-engine-main-redirect](https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/ssl-engine-main-redirect)