[//]: # (title: コールロギング)

<show-structure for="chapter" depth="2"/>
<primary-label ref="server-plugin"/>

<var name="plugin_name" value="CallLogging"/>
<var name="package_name" value="io.ktor.server.plugins.calllogging"/>
<var name="artifact_name" value="ktor-server-call-logging"/>
<var name="ktor_version_catalog_name" value="ktorLibs.server.callLogging"/>

<tldr>
<p>
<b>必要な依存関係</b>: <code>io.ktor:%artifact_name%</code>
</p>
<var name="example_name" value="logging"/>
<p>
    <b>コード例</b>:
    <a href="https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/%example_name%">
        %example_name%
    </a>
</p>
<p>
    <b><Links href="server-native.md" summary="Ktor は Kotlin/Native をサポートしており、追加のランタイムや仮想マシンなしでサーバーを実行できます。">Native サーバー</Links>のサポート</b>: ✖️
</p>
</tldr>

Ktor は [SLF4J](http://www.slf4j.org/) ライブラリを使用してアプリケーションイベントをログに記録する機能を提供します。一般的なロギング構成については、[Ktor Server でのロギング](server-logging.md)のトピックを参照してください。

`%plugin_name%` プラグインを使用すると、受信したクライアントリクエストをログに記録できます。

## 依存関係の追加 {id="add_dependencies"}

<p>
    <code>%plugin_name%</code> を使用するには、ビルドスクリプトに <code>%artifact_name%</code> アーティファクトを追加します。
</p>
<Tabs group="languages">
    <TabItem title="Gradle (Kotlin)" group-key="kotlin">
        <code-block lang="Kotlin" code="            implementation(%ktor_version_catalog_name%)"/>
        <note>
            上記のコードスニペットでは、Ktor の依存関係を指定するために <a href="server-dependencies.topic#using-version-catalog">Ktor バージョンカタログ</a>を使用しています。
        </note>
    </TabItem>
    <TabItem title="Gradle (Groovy)" group-key="groovy">
        <code-block lang="Groovy" code="            implementation %ktor_version_catalog_name%"/>
        <note>
            上記のコードスニペットでは、Ktor の依存関係を指定するために <a href="server-dependencies.topic#using-version-catalog">Ktor バージョンカタログ</a>を使用しています。
        </note>
    </TabItem>
    <TabItem title="Maven" group-key="maven">
        <code-block lang="XML" code="            &lt;dependency&gt;&#10;                &lt;groupId&gt;io.ktor&lt;/groupId&gt;&#10;                &lt;artifactId&gt;%artifact_name%-jvm&lt;/artifactId&gt;&#10;                &lt;version&gt;${ktor_version}&lt;/version&gt;&#10;            &lt;/dependency&gt;"/>
    </TabItem>
</Tabs>

## %plugin_name% のインストール {id="install_plugin"}

<p>
    アプリケーションに <code>%plugin_name%</code> プラグインを<a href="server-plugins.md#install">インストール</a>するには、指定した<Links href="server-modules.md" summary="モジュールを使用すると、ルートをグループ化してアプリケーションを構造化できます。">モジュール</Links>内の <code>install</code> 関数に渡します。
    以下の例は、<code>%plugin_name%</code> をインストールする方法を示しています。
</p>
<list>
    <li>
        <code>embeddedServer()</code> 関数の呼び出し内。
    </li>
    <li>
        <code>Application</code> クラスに明示的に定義された <code>module()</code> 拡張関数内。
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

## ロギング設定の構成 {id="configure"}

`%plugin_name%` はさまざまな方法で構成できます。ログレベルの指定、指定した条件に基づくリクエストのフィルタリング、ログメッセージのカスタマイズなどがあります。利用可能な構成設定は [CallLoggingConfig](https://api.ktor.io/ktor-server-call-logging/io.ktor.server.plugins.calllogging/-call-logging-config/index.html) で確認できます。

### ログレベルの設定 {id="logging_level"}

デフォルトでは、Ktor は `Level.INFO` ログレベルを使用します。これを変更するには、`level` プロパティを使用します。

```kotlin
install(CallLogging) {
    level = Level.INFO
}
```

### ログリクエストのフィルタリング {id="filter"}

`filter` プロパティを使用すると、リクエストをフィルタリングするための条件を追加できます。以下の例では、`/api/v1` に対して行われたリクエストのみがログに記録されます。

```kotlin
install(CallLogging) {
    filter { call ->
        call.request.path().startsWith("/api/v1")
    }
}
```

### ログメッセージ形式のカスタマイズ {id="format"}

`format` 関数を使用すると、リクエスト/レスポンスに関連する任意のデータをログに含めることができます。以下の例では、各リクエストのレスポンスステータス、リクエストの HTTP メソッド、および `User-Agent` ヘッダー値をログに記録する方法を示しています。

```kotlin
install(CallLogging) {
    format { call ->
        val status = call.response.status()
        val httpMethod = call.request.httpMethod.value
        val userAgent = call.request.headers["User-Agent"]
        "Status: $status, HTTP method: $httpMethod, User agent: $userAgent"
    }
}
```

完全な例はここで確認できます: [logging](https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/logging)

### コールパラメータを MDC に配置する {id="mdc"}

`%plugin_name%` プラグインは MDC (Mapped Diagnostic Context) をサポートしています。`mdc` 関数を使用することで、指定した名前で任意のコンテキスト値を MDC に配置できます。たとえば、以下のコードスニペットでは、`name` クエリパラメータが MDC に追加されます。

```kotlin
install(CallLogging) {
    mdc("name-parameter") { call ->
        call.request.queryParameters["name"]
    }
}
```

追加された値には、`ApplicationCall` のライフタイム中にアクセスできます。

```kotlin
import org.slf4j.MDC
// ...
MDC.get("name-parameter")
```