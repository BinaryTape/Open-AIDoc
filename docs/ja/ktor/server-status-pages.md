[//]: # (title: ステータスページ)

<show-structure for="chapter" depth="2"/>
<primary-label ref="server-plugin"/>

<var name="plugin_name" value="StatusPages"/>
<var name="package_name" value="io.ktor.server.plugins.statuspages"/>
<var name="artifact_name" value="ktor-server-status-pages"/>

<tldr>
<p>
<b>必須の依存関係</b>: <code>io.ktor:%artifact_name%</code>
</p>
<var name="example_name" value="status-pages"/>
<p>
    <b>コード例</b>:
    <a href="https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/%example_name%">
        %example_name%
    </a>
</p>
<p>
    <b><Links href="/ktor/server-native" summary="Ktor は Kotlin/Native をサポートしており、追加のランタイムや仮想マシンなしでサーバーを実行できます。">Native サーバー</Links>のサポート</b>: ✅
</p>
</tldr>

<link-summary>
%plugin_name% は、スローされた例外やステータスコードに基づいて、Ktor アプリケーションがあらゆる失敗状態に対して適切に応答できるようにします。
</link-summary>

[%plugin_name%](https://api.ktor.io/ktor-server-status-pages/io.ktor.server.plugins.statuspages/-status-pages.html) プラグインを使用すると、Ktor アプリケーションはスローされた例外やステータスコードに基づいて、あらゆる失敗状態に対して適切に[応答](server-responses.md)できるようになります。

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

## %plugin_name% の設定 {id="configure"}

`%plugin_name%` プラグインには、主に 3 つの設定オプションがあります。

- [exceptions](#exceptions): マッピングされた例外クラスに基づいてレスポンスを設定します
- [status](#status): ステータスコードの値に対するレスポンスを設定します
- [statusFile](#status-file): クラスパスからのファイルレスポンスを設定します

### 例外 (Exceptions) {id="exceptions"}

`exception` ハンドラーを使用すると、`Throwable` 例外が発生したコールを処理できます。最も基本的なケースでは、任意の例外に対して `500` HTTP ステータスコードを設定できます。

```kotlin
install(StatusPages) {
    exception<Throwable> { call, cause ->
        call.respondText(text = "500: $cause" , status = HttpStatusCode.InternalServerError)
    }
}
```

特定の例外をチェックし、必要なコンテンツで応答することもできます。

```kotlin
install(StatusPages) {
    exception<Throwable> { call, cause ->
        if(cause is AuthorizationException) {
            call.respondText(text = "403: $cause" , status = HttpStatusCode.Forbidden)
        } else {
            call.respondText(text = "500: $cause" , status = HttpStatusCode.InternalServerError)
        }
    }
}
```

### ステータス (Status) {id="status"}

`status` ハンドラーは、ステータスコードに基づいて特定のコンテンツで応答する機能を提供します。以下の例は、サーバー上にリソースが見つからない場合（`404` ステータスコード）のリクエストに応答する方法を示しています。

```kotlin
install(StatusPages) {
    status(HttpStatusCode.NotFound) { call, status ->
        call.respondText(text = "404: Page Not Found", status = status)
    }
}
```

### ステータスファイル (Status file) {id="status-file"}

`statusFile` ハンドラーを使用すると、ステータスコードに基づいて HTML ページを返すことができます。プロジェクトの `resources` フォルダに `error401.html` と `error402.html` という HTML ページが含まれているとします。この場合、以下のように `statusFile` を使用して `401` および `402` ステータスコードを処理できます。
```kotlin
install(StatusPages) {
    statusFile(HttpStatusCode.Unauthorized, HttpStatusCode.PaymentRequired, filePattern = "error#.html")
}
```

`statusFile` ハンドラーは、設定されたステータスのリスト内で `#` 文字をステータスコードの値に置き換えます。

> 完全な例はこちらで確認できます: [status-pages](https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/status-pages)。