[//]: # (title: Ktor Client におけるリクエストのトレース)

<show-structure for="chapter" depth="2"/>
<primary-label ref="client-plugin"/>

<var name="artifact_name" value="ktor-client-call-id"/>
<var name="package_name" value="io.ktor.client.plugins.callid"/>
<var name="plugin_name" value="CallId"/>

<tldr>
<p>
<b>必要な依存関係</b>: <code>io.ktor:%artifact_name%</code>
</p>
<var name="example_name" value="client-call-id"/>
<p>
    <b>コード例</b>:
    <a href="https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/%example_name%">
        %example_name%
    </a>
</p>
</tldr>

<link-summary>
%plugin_name% クライアントプラグインを使用すると、ユニークなコール ID を使用してクライアントリクエストをトレースできます。
</link-summary>

%plugin_name% プラグインを使用すると、ユニークなコール ID を使用して、クライアントリクエストをエンドツーエンドでトレースできます。これは、リクエストがいくつのサービスを通過するかに関係なくコールを追跡し続ける必要があるマイクロサービスアーキテクチャにおいて特に有用です。

呼び出しスコープのコルーチンコンテキストに、すでにコール ID が含まれている場合があります。デフォルトでは、プラグインは現在のコンテキストを使用してコール ID を取得し、`HttpHeaders.XRequestId` ヘッダーを使用して特定のコールのコンテキストにそれを追加します。

さらに、スコープにコール ID が含まれていない場合、新しいコール ID を生成して適用するようにプラグインを[設定](#configure)することもできます。

> サーバー側では、Ktor はクライアントリクエストをトレースするための [CallId](server-call-id.md) プラグインを提供しています。

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

[CallIdConfig](https://api.ktor.io/ktor-client-call-id/io.ktor.client.plugins.callid/-call-id-config/index.html) クラスによって提供される %plugin_name% プラグインの設定では、コール ID を生成してコールコンテキストに追加することができます。

### コール ID の生成

以下のいずれかの方法で、特定のリクエストに対してコール ID を生成します。

* デフォルトで有効になっている `useCoroutineContext` プロパティは、現在の `CoroutineContext` を使用してコール ID を取得するジェネレーターを追加します。この機能を無効にするには、`useCoroutineContext` を `false` に設定します。

 ```kotlin
 install(CallId) {
     useCoroutineContext = false
 }
 ```

> Ktor サーバーでは、[CallId プラグイン](server-call-id.md)を使用して `CoroutineContext` にコール ID を追加します。

* `generate()` 関数を使用すると、送信リクエストのコール ID を生成できます。コール ID の生成に失敗した場合は `null` を返します。

 ```kotlin
 install(CallId) {
     generate { "call-id-client-2" }
 }
 ```

複数の方法を使用してコール ID を生成できます。その場合、最初の非 null 値が適用されます。

### コール ID の追加

コール ID を取得した後、それをリクエストに追加するために以下のオプションを利用できます。

* `intercept()` 関数を使用すると、`CallIdInterceptor` を使用してリクエストにコール ID を追加できます。

 ```kotlin
 install(ClientCallId) {
     intercept { request, callId ->
         request.header(HttpHeaders.XRequestId, callId)
     }
 }
 ```

* `addToHeader()` 関数は、指定されたヘッダーにコール ID を追加します。パラメータとしてヘッダーを受け取り、デフォルトは `HttpHeaders.XRequestId` です。

 ```kotlin
 install(CallId) {
     addToHeader(HttpHeaders.XRequestId)
 }
 ```

## 例

以下の例では、Ktor クライアント用の `%plugin_name%` プラグインが、新しいコール ID を生成してヘッダーに追加するように設定されています。

 ```kotlin
 val client = HttpClient(CIO) {
     install(CallId) {
         generate { "call-id-client" }
         addToHeader(HttpHeaders.XRequestId)
     }
 }
 ```

プラグインはコルーチンコンテキストを使用してコール ID を取得しようとし、`generate()` 関数を利用して新しい ID を生成します。その後、最初の非 null のコール ID が `addToHeader()` 関数を使用してリクエストヘッダーに適用されます。

Ktor サーバーでは、[サーバー用の CallId プラグイン](server-call-id.md)の [retrieve](server-call-id.md#retrieve) 関数を使用して、ヘッダーからコール ID を取得できます。

 ```kotlin
 install(CallId) {
     retrieveFromHeader(HttpHeaders.XRequestId)
 }
 ```

このようにして、Ktor サーバーはリクエストの指定されたヘッダーから ID を取得し、コールの `callId` プロパティに適用します。

完全な例については、[client-call-id](https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/client-call-id) を参照してください。