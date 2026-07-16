[//]: # (title: Ktor Server でのリクエストのトレース)

<show-structure for="chapter" depth="2"/>
<primary-label ref="server-plugin"/>

<var name="artifact_name" value="ktor-server-call-id"/>
<var name="package_name" value="io.ktor.server.plugins.callid"/>
<var name="plugin_name" value="CallId"/>

<tldr>
<p>
<b>必須の依存関係</b>: <code>io.ktor:%artifact_name%</code>
</p>
<var name="example_name" value="call-id"/>
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

<link-summary>
%plugin_name% サーバープラグインを使用すると、一意のコール ID を使用してクライアントリクエストをトレースできます。
</link-summary>

[%plugin_name%](https://api.ktor.io/ktor-server-call-id/io.ktor.server.plugins.callid/-call-id.html) プラグインを使用すると、一意のリクエスト ID またはコール ID を使用して、クライアントリクエストをエンドツーエンド (end-to-end) でトレースできます。通常、Ktor でコール ID を操作する流れは次のようになります。
1. まず、以下のいずれかの方法で特定のリクエストのコール ID を取得する必要があります。
   * Nginx などのリバースプロキシ (reverse proxy) や [Heroku](heroku.md) などのクラウドプロバイダー (cloud provider) が、`X-Request-Id` などの特定のヘッダーにコール ID を追加している場合があります。この場合、Ktor でその ID を[取得](#retrieve)できます。
   * リクエストにコール ID が含まれていない場合は、Ktor サーバー側で[生成](#generate)できます。
2. 次に、Ktor は定義済みの辞書 (dictionary) を使用して、取得または生成されたコール ID を[検証](#verify)します。独自の検証条件を指定することも可能です。
3. 最後に、`X-Request-Id` などの特定のヘッダーを使用して、クライアントにコール ID を[送信](#send)できます。

`%plugin_name%` を [CallLogging](server-call-logging.md) と併用すると、コール ID を MDC コンテキスト (MDC context) に[配置](#put-call-id-mdc)し、各リクエストに対してコール ID を表示するようにロガーを設定することで、トラブルシューティングに役立てることができます。

> クライアント側では、Ktor はクライアントリクエストをトレースするための [CallId](client-call-id.md) プラグインを提供しています。

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
    <code>%plugin_name%</code> プラグインをアプリケーションに<a href="#install">インストール</a>するには、指定された <Links href="/ktor/server-modules" summary="Modules allow you to structure your application by grouping routes.">モジュール</Links> 内で <code>install</code> 関数に渡します。
    以下のコードスニペットは、<code>%plugin_name%</code> をインストールする方法を示しています。
</p>
<list>
    <li>
        ... <code>embeddedServer</code> 関数の呼び出し内。
    </li>
    <li>
        ... <code>Application</code> クラスの拡張関数である明示的に定義された <code>module</code> 内。
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

### コール ID の取得 {id="retrieve"}

`%plugin_name%` は、コール ID を取得するためのいくつかの方法を提供します。

* 指定されたヘッダーからコール ID を取得するには、`retrieveFromHeader` 関数を使用します。例：
   ```kotlin
   install(CallId) {
       retrieveFromHeader(HttpHeaders.XRequestId)
   }
   ```
   また、`header` 関数を使用して、同じヘッダーで[コール ID の取得と送信](#send)を同時に行うこともできます。

* 必要に応じて、`ApplicationCall` からコール ID を取得することもできます。
   ```kotlin
   install(CallId) {
       retrieve { call ->
           call.request.header(HttpHeaders.XRequestId)
       }
   }
   ```
取得されたすべてのコール ID は、デフォルトの辞書を使用して[検証](#verify)されることに注意してください。

### コール ID の生成 {id="generate"}

リクエストにコール ID が含まれていない場合は、`generate` 関数を使用して生成できます。
* 以下の例は、定義済みの辞書から指定された長さのコール ID を生成する方法を示しています。
   ```kotlin
   install(CallId) {
       generate(10, "abcde12345")
   }
   ```
* 以下の例では、`generate` 関数にコール ID 生成用のブロックを渡しています。
   ```kotlin
   install(CallId) {
       val counter = atomic(0)
       generate {
           "generated-call-id-${counter.getAndIncrement()}"
       }
   }
   ```

### コール ID の検証 {id="verify"}

[取得](#retrieve)または[生成](#generate)されたすべてのコール ID は、デフォルトの辞書を使用して検証されます。デフォルトの辞書は以下の通りです。

```kotlin
CALL_ID_DEFAULT_DICTIONARY: String = "abcdefghijklmnopqrstuvwxyz0123456789+/=-"
```
これは、大文字を含むコール ID は検証を通過しないことを意味します。必要に応じて、`verify` 関数を使用してより緩いルールを適用できます。

```kotlin
install(CallId) {
    verify { callId: String ->
        callId.isNotEmpty()
    }
}
```

完全な例はこちらで確認できます: [call-id](https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/call-id)

### クライアントへのコール ID の送信 {id="send"}

コール ID を[取得](#retrieve)または[生成](#generate)した後、それをクライアントに送信できます。

* `header` 関数を使用すると、[コール ID の取得](#retrieve)と、同じヘッダーでの送信を同時に行うことができます。

   ```kotlin
   install(CallId) {
       header(HttpHeaders.XRequestId)
   }
   ```

  完全な例はこちらで確認できます: [call-id](https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/call-id)

* `replyToHeader` 関数は、指定されたヘッダーでコール ID を送信します。
   ```kotlin
   install(CallId) {
       replyToHeader(HttpHeaders.XRequestId)
   }
   ```

* 必要に応じて、`ApplicationCall` を使用して [レスポンス](server-responses.md) 内でコール ID を送信できます。
   ```kotlin
   reply { call, callId ->
       call.response.header(HttpHeaders.XRequestId, callId)
   }
   ```

## MDC へのコール ID の設定 {id="put-call-id-mdc"}

`%plugin_name%` を [CallLogging](server-call-logging.md) と併用すると、コール ID を MDC コンテキストに配置し、各リクエストに対してコール ID を表示するようにロガーを設定することで、トラブルシューティングに役立ちます。これを行うには、`CallLogging` 設定ブロック内で `callIdMdc` 関数を呼び出し、MDC コンテキストに設定するキーを指定します。

```kotlin
install(CallLogging) {
    callIdMdc("call-id")
}
```

このキーを [ロガー設定](server-logging.md#configure-logger) に渡すことで、ログにコール ID を表示できます。例えば、`logback.xml` ファイルは次のようになります。
```
<appender name="STDOUT" class="ch.qos.logback.core.ConsoleAppender">
    <encoder>
        <pattern>%d{YYYY-MM-dd HH:mm:ss.SSS} [%thread] %X{call-id} %-5level %logger{36} - %msg%n</pattern>
    </encoder>
</appender>
```

完全な例はこちらで確認できます: [call-id](https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/call-id)