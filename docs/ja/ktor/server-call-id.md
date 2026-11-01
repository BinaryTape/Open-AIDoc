[//]: # (title: Ktor Serverでのリクエストの追跡)

<show-structure for="chapter" depth="2"/>
<primary-label ref="server-plugin"/>

<var name="artifact_name" value="ktor-server-call-id"/>
<var name="ktor_version_catalog_name" value="ktorLibs.server.callId"/>
<var name="package_name" value="io.ktor.server.plugins.callid"/>
<var name="plugin_name" value="CallId"/>

<tldr>
<p>
<b>必要な依存関係</b>: <code>io.ktor:%artifact_name%</code>
</p>
<var name="example_name" value="call-id"/>
<p>
    <b>コード例</b>:
    <a href="https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/%example_name%">
        %example_name%
    </a>
</p>
<p>
    <b><Links href="server-native.md" summary="KtorはKotlin/Nativeをサポートしており、追加のランタイムや仮想マシンなしでサーバーを実行できます。">ネイティブサーバー</Links>のサポート</b>: ✅
</p>
</tldr>

<link-summary>
%plugin_name% サーバープラグインを使用すると、一意のコールIDを使用してクライアントリクエストを追跡できます。
</link-summary>

[%plugin_name%](https://api.ktor.io/ktor-server-call-id/io.ktor.server.plugins.callid/-call-id.html) プラグインを使用すると、一意のリクエストIDまたはコールIDを使用して、クライアントリクエストをエンドツーエンドで追跡できます。通常、KtorでコールIDを扱う手順は次のようになります。
1. まず、次のいずれかの方法で特定のリクエストに対するコールIDを取得する必要があります。
   * リバースプロキシ（Nginxなど）やクラウドプロバイダー（[Heroku](heroku.md)など）が、`X-Request-Id` などの特定のヘッダーにコールIDを追加している場合があります。この場合、KtorでコールIDを[取得](#retrieve)できます。
   * コールIDのないリクエストが届いた場合は、Ktorサーバー上でコールIDを[生成](#generate)できます。
2. 次に、Ktorは事前定義された辞書を使用して、取得または生成されたコールIDを[検証](#verify)します。独自の検証条件を指定することも可能です。
3. 最後に、`X-Request-Id` などの特定のヘッダーを使用して、コールIDをクライアントに[送信](#send)できます。

`%plugin_name%` を [CallLogging](server-call-logging.md) と併用すると、コールIDをMDCコンテキストに[配置](#put-call-id-mdc)し、各リクエストのコールIDを表示するようにロガーを設定できるため、呼び出しのトラブルシューティングに役立ちます。

> クライアント側では、Ktorはクライアントリクエストを追跡するための [CallId](client-call-id.md) プラグインを提供しています。

## 依存関係の追加 {id="add_dependencies"}

<p>
    <code>%plugin_name%</code> を使用するには、ビルドスクリプトに <code>%artifact_name%</code> アーティファクトを追加します。
</p>
<Tabs group="languages">
    <TabItem title="Gradle (Kotlin)" group-key="kotlin">
        <code-block lang="Kotlin" code="            implementation(%ktor_version_catalog_name%)"/>
        <note>
            上記のコードスニペットでは、<a href="server-dependencies.topic#using-version-catalog">Ktorバージョンカタログ</a>を使用してKtorの依存関係を指定しています。
        </note>
    </TabItem>
    <TabItem title="Gradle (Groovy)" group-key="groovy">
        <code-block lang="Groovy" code="            implementation %ktor_version_catalog_name%"/>
        <note>
            上記のコードスニペットでは、<a href="server-dependencies.topic#using-version-catalog">Ktorバージョンカタログ</a>を使用してKtorの依存関係を指定しています。
        </note>
    </TabItem>
    <TabItem title="Maven" group-key="maven">
        <code-block lang="XML" code="            &lt;dependency&gt;&#10;                &lt;groupId&gt;io.ktor&lt;/groupId&gt;&#10;                &lt;artifactId&gt;%artifact_name%-jvm&lt;/artifactId&gt;&#10;                &lt;version&gt;${ktor_version}&lt;/version&gt;&#10;            &lt;/dependency&gt;"/>
    </TabItem>
</Tabs>

## %plugin_name% のインストール {id="install_plugin"}

<p>
    アプリケーションに <code>%plugin_name%</code> プラグインを<a href="server-plugins.md#install">インストール</a>するには、指定した<Links href="server-modules.md" summary="モジュールを使用すると、ルートをグループ化してアプリケーションを構造化できます。">モジュール</Links>内の <code>install</code> 関数にプラグインを渡します。
    以下の例は、<code>%plugin_name%</code> をインストールする方法を示しています。
</p>
<list>
    <li>
        <code>embeddedServer()</code> 関数の呼び出し内。
    </li>
    <li>
        <code>Application</code> クラスの明示的に定義された <code>module()</code> 拡張関数内。
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

## %plugin_name% の設定 {id="configure"}

### コールIDの取得 {id="retrieve"}

`%plugin_name%` は、コールIDを取得するためのいくつかの方法を提供しています。

* 指定したヘッダーからコールIDを取得するには、`retrieveFromHeader` 関数を使用します。例:
   ```kotlin
   install(CallId) {
       retrieveFromHeader(HttpHeaders.XRequestId)
   }
   ```
   また、`header` 関数を使用して、同じヘッダーで[コールIDを取得および送信](#send)することもできます。

* 必要に応じて、`ApplicationCall` からコールIDを取得できます。
   ```kotlin
   install(CallId) {
       retrieve { call ->
           call.request.header(HttpHeaders.XRequestId)
       }
   }
   ```
取得されたすべてのコールIDは、デフォルトの辞書を使用して[検証](#verify)される点に注意してください。

### コールIDの生成 {id="generate"}

受信リクエストにコールIDが含まれていない場合は、`generate` 関数を使用して生成できます。
* 以下の例は、事前定義された辞書から指定された長さのコールIDを生成する方法を示しています。
   ```kotlin
   install(CallId) {
       generate(10, "abcde12345")
   }
   ```
* 以下の例では、`generate` 関数がコールIDを生成するためのブロックを受け取ります。
   ```kotlin
   install(CallId) {
       val counter = atomic(0)
       generate {
           "generated-call-id-${counter.getAndIncrement()}"
       }
   }
   ```

### コールIDの検証 {id="verify"}

[取得](#retrieve)または[生成](#generate)されたすべてのコールIDは、以下のようなデフォルトの辞書を使用して検証されます。

```kotlin
CALL_ID_DEFAULT_DICTIONARY: String = "abcdefghijklmnopqrstuvwxyz0123456789+/=-"
```
これは、大文字を含むコールIDは検証に失敗することを意味します。必要に応じて、`verify` 関数を使用してより柔軟なルールを適用できます。

```kotlin
install(CallId) {
    verify { callId: String ->
        callId.isNotEmpty()
    }
}
```

完全な例はこちらで確認できます: [call-id](https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/call-id)

### クライアントへのコールIDの送信 {id="send"}

コールIDを[取得](#retrieve)または[生成](#generate)した後、クライアントに送信できます。

* `header` 関数を使用すると、[コールIDを取得](#retrieve)し、同じヘッダーで送信できます。

   ```kotlin
   install(CallId) {
       header(HttpHeaders.XRequestId)
   }
   ```

  完全な例はこちらで確認できます: [call-id](https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/call-id)

* `replyToHeader` 関数は、指定したヘッダーでコールIDを送信します。
   ```kotlin
   install(CallId) {
       replyToHeader(HttpHeaders.XRequestId)
   }
   ```

* 必要に応じて、`ApplicationCall` を使用して[レスポンス](server-responses.md)内でコールIDを送信できます。
   ```kotlin
   reply { call, callId ->
       call.response.header(HttpHeaders.XRequestId, callId)
   }
   ```

## コールIDをMDCに設定する {id="put-call-id-mdc"}

`%plugin_name%` を [CallLogging](server-call-logging.md) と併用すると、コールIDをMDCコンテキストに設定し、各リクエストのコールIDを表示するようにロガーを設定できるため、呼び出しのトラブルシューティングに役立ちます。これを行うには、`CallLogging` 設定ブロック内で `callIdMdc` 関数を呼び出し、MDCコンテキストに設定するキー名を指定します。

```kotlin
install(CallLogging) {
    callIdMdc("call-id")
}
```

このキーを[ロガー設定](server-logging.md#configure-logger)に渡すことで、ログにコールIDを表示できます。例えば、`logback.xml` ファイルは次のようになります。
```
<appender name="STDOUT" class="ch.qos.logback.core.ConsoleAppender">
    <encoder>
        <pattern>%d{YYYY-MM-dd HH:mm:ss.SSS} [%thread] %X{call-id} %-5level %logger{36} - %msg%n</pattern>
    </encoder>
</appender>
```

完全な例はこちらで確認できます: [call-id](https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/call-id)