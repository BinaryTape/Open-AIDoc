[//]: # (title: 条件付きヘッダー)

<primary-label ref="server-plugin"/>

<var name="artifact_name" value="ktor-server-conditional-headers"/>
<var name="package_name" value="io.ktor.server.plugins.conditionalheaders"/>
<var name="plugin_name" value="ConditionalHeaders"/>

<tldr>
<p>
<b>必須の依存関係</b>: <code>io.ktor:%artifact_name%</code>
</p>
<var name="example_name" value="conditional-headers"/>
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

[ConditionalHeaders](https://api.ktor.io/ktor-server-conditional-headers/io.ktor.server.plugins.conditionalheaders/-conditional-headers.html)プラグインは、前回のリクエストからコンテンツが変更されていない場合に、コンテンツのボディの送信を回避します。これは、以下のヘッダーを使用することで実現されます：
* `Last-Modified`レスポンスヘッダーには、リソースの更新日時が含まれます。例えば、クライアントのリクエストに`If-Modified-Since`値が含まれている場合、Ktorは指定された日付以降にリソースが変更された場合にのみ、完全なレスポンスを送信します。なお、[静的ファイル](server-static-content.md)の場合、ConditionalHeadersを[インストール](#install_plugin)すると、Ktorは自動的に`Last-Modified`ヘッダーを追加します。
* `Etag`レスポンスヘッダーは、特定のリソースバージョンの識別子です。例えば、クライアントのリクエストに`If-None-Match`値が含まれている場合、この値が`Etag`と一致すれば、Ktorは完全なレスポンスを送信しません。`Etag`値は、ConditionalHeadersを[設定](#configure)する際に指定できます。

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
    <code>%plugin_name%</code>プラグインをアプリケーションに<a href="#install">インストール</a>するには、指定された<Links href="/ktor/server-modules" summary="モジュールを使用すると、ルートをグループ化してアプリケーションを構造化できます。">モジュール</Links>内の<code>install</code>関数に渡します。
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
    これは、アプリケーションのリソースごとに異なる<code>%plugin_name%</code>設定が必要な場合に役立ちます。
</p>

## ヘッダーの設定 {id="configure"}

`%plugin_name%`を設定するには、`install`ブロック内で[version](https://api.ktor.io/ktor-server-conditional-headers/io.ktor.server.plugins.conditionalheaders/-conditional-headers-config/version.html)関数を呼び出す必要があります。この関数は、指定された`ApplicationCall`および`OutgoingContent`に対するリソースバージョンのリストへのアクセスを提供します。[EntityTagVersion](https://api.ktor.io/ktor-http/io.ktor.http.content/-entity-tag-version/index.html)および[LastModifiedVersion](https://api.ktor.io/ktor-http/io.ktor.http.content/-last-modified-version/index.html)クラスのオブジェクトを使用して、必要なバージョンを指定できます。

以下のコードスニペットは、CSSに対して`Etag`および`Last-Modified`ヘッダーを追加する方法を示しています：
```kotlin
install(ConditionalHeaders) {
    val file = File("src/main/kotlin/com/example/Application.kt")
    version { call, outgoingContent ->
        when (outgoingContent.contentType?.withoutParameters()) {
            ContentType.Text.CSS -> listOf(
                EntityTagVersion(file.lastModified().hashCode().toString()),
                LastModifiedVersion(Date(file.lastModified()))
            )
            else -> emptyList()
        }
    }
}
```

完全な例はこちらにあります：[conditional-headers](https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/conditional-headers)。