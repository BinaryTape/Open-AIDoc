[//]: # (title: 部分コンテンツ)

<primary-label ref="server-plugin"/>

<var name="artifact_name" value="ktor-server-partial-content"/>
<var name="package_name" value="io.ktor.server.plugins.partialcontent"/>
<var name="plugin_name" value="PartialContent"/>

<tldr>
<p>
<b>必要な依存関係</b>: <code>io.ktor:%artifact_name%</code>
</p>
<p>
<b>サーバーの例</b>:
<a href="https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/download-file">download-file</a>,
<b>クライアントの例</b>:
<a href="https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/client-download-file-range">client-download-file-range</a>
</p>
<p>
    <b><Links href="/ktor/server-native" summary="Ktor supports Kotlin/Native and allows you to run a server without an additional runtime or virtual machine.">ネイティブサーバー</Links>のサポート</b>: ✅
</p>
</tldr>

[%plugin_name%](https://api.ktor.io/ktor-server-partial-content/io.ktor.server.plugins.partialcontent/-partial-content.html)プラグインは、HTTPメッセージの一部のみをクライアントに返送するために使用される[HTTPレンジリクエスト](https://developer.mozilla.org/en-US/docs/Web/HTTP/Range_requests)の処理のサポートを追加します。このプラグインは、コンテンツのストリーミングや、中断されたダウンロードの再開に役立ちます。

`%plugin_name%`には以下の制限事項があります：
- `HEAD`および`GET`リクエストに対してのみ動作し、クライアントが他のメソッドで`Range`ヘッダーを使用しようとすると`405 Method Not Allowed`を返します。
- `Content-Length`ヘッダーが定義されているレスポンスに対してのみ動作します。
- レンジを配信する際、[圧縮（Compression）](server-compression.md)を無効にします。

## 依存関係の追加 {id="add_dependencies"}

<p>
    <code>%plugin_name%</code>を使用するには、ビルドスクリプトに<code>%artifact_name%</code>アーティファクトを含める必要があります：
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

## %plugin_name%のインストール {id="install_plugin"}

<p>
    <code>%plugin_name%</code>プラグインをアプリケーションに<a href="#install">インストール</a>するには、指定された<Links href="/ktor/server-modules" summary="Modules allow you to structure your application by grouping routes.">モジュール</Links>内の<code>install</code>関数に渡します。
    以下のコードスニペットは、<code>%plugin_name%</code>をインストールする方法を示しています...
</p>
<list>
    <li>
        ... <code>embeddedServer</code>関数の呼び出し内。
    </li>
    <li>
        ... 明示的に定義された<code>module</code>（<code>Application</code>クラスの拡張関数）内。
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
    <code>%plugin_name%</code>プラグインは、<a href="#install-route">特定のルートにインストール</a>することもできます。
    これは、アプリケーションのリソースごとに異なる<code>%plugin_name%</code>構成が必要な場合に役立ちます。
</p>

HTTPレンジリクエストを使用してファイルを配信するために`%plugin_name%`を使用する方法については、[File](server-responses.md#file)セクションを参照してください。