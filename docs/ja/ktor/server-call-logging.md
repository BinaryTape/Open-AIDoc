[//]: # (title: コールロギング)

<show-structure for="chapter" depth="2"/>
<primary-label ref="server-plugin"/>

<var name="plugin_name" value="CallLogging"/>
<var name="package_name" value="io.ktor.server.plugins.calllogging"/>
<var name="artifact_name" value="ktor-server-call-logging"/>

<tldr>
<p>
<b>必須の依存関係</b>: <code>io.ktor:%artifact_name%</code>
</p>
<var name="example_name" value="logging"/>
<p>
    <b>コード例</b>:
    <a href="https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/%example_name%">
        %example_name%
    </a>
</p>
<p>
    <b><Links href="/ktor/server-native" summary="Ktor supports Kotlin/Native and allows you to run a server without an additional runtime or virtual machine.">Nativeサーバー</Links>のサポート</b>: ✖️
</p>
</tldr>

Ktorは、[SLF4J](http://www.slf4j.org/)ライブラリを使用してアプリケーションイベントをログに記録する機能を提供します。
一般的なロギング設定については、[Ktorサーバーでのロギング](server-logging.md)のトピックで詳しく学ぶことができます。

`%plugin_name%`プラグインを使用すると、クライアントからのリクエストをログに記録できます。

## 依存関係の追加 {id="add_dependencies"}

<p>
    <code>%plugin_name%</code>を使用するには、ビルドスクリプトに<code>%artifact_name%</code>アーティファクトを含める必要があります。
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

## ロギング設定の構成 {id="configure"}

`%plugin_name%`は、ログレベルの指定、特定条件に基づくリクエストのフィルタリング、ログメッセージのカスタマイズなど、さまざまな方法で構成できます。利用可能な設定項目は、[CallLoggingConfig](https://api.ktor.io/ktor-server-call-logging/io.ktor.server.plugins.calllogging/-call-logging-config/index.html)で確認できます。

### ログレベルの設定 {id="logging_level"}

デフォルトでは、Ktorは`Level.INFO`ログレベルを使用します。これを変更するには、`level`プロパティを使用します。

```kotlin
install(CallLogging) {
    level = Level.INFO
}
```

### リクエストのフィルタリング {id="filter"}

`filter`プロパティを使用すると、リクエストをフィルタリングするための条件を追加できます。以下の例では、`/api/v1`へのリクエストのみがログに記録されます。

```kotlin
install(CallLogging) {
    filter { call ->
        call.request.path().startsWith("/api/v1")
    }
}
```

### ログメッセージのフォーマットをカスタマイズする {id="format"}

`format`関数を使用すると、リクエストやレスポンスに関連する任意のデータをログに含めることができます。以下の例では、各リクエストに対してレスポンスステータス、HTTPメソッド、および`User-Agent`ヘッダーの値をログに記録する方法を示しています。

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

完全な例はこちらで確認できます: [logging](https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/logging)

### MDCにコールパラメータを設定する {id="mdc"}

`%plugin_name%`プラグインはMDC（Mapped Diagnostic Context）をサポートしています。`mdc`関数を使用して、指定した名前で任意のコンテキスト値をMDCに設定できます。例えば、以下のコードスニペットでは、`name`クエリパラメータをMDCに追加しています。

```kotlin
install(CallLogging) {
    mdc("name-parameter") { call ->
        call.request.queryParameters["name"]
    }
}
```

追加された値には、`ApplicationCall`の生存期間（ライフタイム）中にアクセスできます。

```kotlin
import org.slf4j.MDC
// ...
MDC.get("name-parameter")