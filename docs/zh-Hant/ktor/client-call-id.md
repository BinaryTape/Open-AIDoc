[//]: # (title: 在 Ktor 用戶端中追蹤請求)

<show-structure for="chapter" depth="2"/>
<primary-label ref="client-plugin"/>

<var name="artifact_name" value="ktor-client-call-id"/>
<var name="package_name" value="io.ktor.client.plugins.callid"/>
<var name="plugin_name" value="CallId"/>

<tldr>
<p>
<b>必要的相依性</b>：<code>io.ktor:%artifact_name%</code>
</p>
<var name="example_name" value="client-call-id"/>
<p>
    <b>程式碼範例</b>：
    <a href="https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/%example_name%">
        %example_name%
    </a>
</p>
</tldr>

<link-summary>
%plugin_name% 用戶端外掛程式允許您透過使用唯一的呼叫 ID 來追蹤用戶端請求。
</link-summary>

%plugin_name% 外掛程式允許您透過使用唯一的呼叫 ID 來端對端追蹤用戶端請求。這在微服務架構中特別有用，無論請求經過多少個服務，都能追蹤呼叫。

呼叫範圍可能已經在其協程上下文中包含呼叫 ID。預設情況下，該外掛程式會使用當前上下文來檢索呼叫 ID，並使用 `HttpHeaders.XRequestId` 標頭將其新增至特定呼叫的上下文中。

此外，如果範圍沒有呼叫 ID，您可以[配置外掛程式](#configure)來產生並套用新的呼叫 ID。

> 在伺服器端，Ktor 提供了 [CallId](server-call-id.md) 外掛程式來追蹤用戶端請求。

## 新增相依性 {id="add_dependencies"}

<p>
    要使用 <code>%plugin_name%</code>，您需要在建置指令碼中包含 <code>%artifact_name%</code> 構件：
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

## 安裝 %plugin_name% {id="install_plugin"}

<p>
    要將 <code>%plugin_name%</code> 外掛程式<a href="#install">安裝</a>到應用程式，請將其傳遞給指定<Links href="/ktor/server-modules" summary="模組允許您透過將路由分組來建構應用程式。">模組</Links>中的 <code>install</code> 函式。
    下方的程式碼片段展示了如何安裝 <code>%plugin_name%</code> ...
</p>
<list>
    <li>
        ... 在 <code>embeddedServer</code> 函式呼叫內部。
    </li>
    <li>
        ... 在明確定義的 <code>module</code> 內部，它是 <code>Application</code> 類別的擴充函式。
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

## 配置 %plugin_name% {id="configure"}

由 [CallIdConfig](https://api.ktor.io/ktor-client-call-id/io.ktor.client.plugins.callid/-call-id-config/index.html) 類別提供的 %plugin_name% 外掛程式配置，允許您產生呼叫 ID 並將其新增至呼叫上下文中。

### 產生呼叫 ID

透過以下任一方式為特定請求產生呼叫 ID：

* `useCoroutineContext` 屬性預設為啟用，它會新增一個使用當前 `CoroutineContext` 來檢索呼叫 ID 的產生器。要停用此功能，請將 `useCoroutineContext` 設定為 `false`：

 ```kotlin
 install(CallId) {
     useCoroutineContext = false
 }
 ```

> 在 Ktor 伺服器中，使用 [CallId 外掛程式](server-call-id.md) 將呼叫 ID 新增至 `CoroutineContext`。

* `generate()` 函式允許您為外發請求產生呼叫 ID。如果無法產生呼叫 ID，它將傳回 `null`。

 ```kotlin
 install(CallId) {
     generate { "call-id-client-2" }
 }
 ```

您可以使用多種方法來產生呼叫 ID。在這種情況下，將套用第一個非 null 的值。

### 新增呼叫 ID

檢索到呼叫 ID 後，您可以使用以下選項將其新增至請求中：

* `intercept()` 函式允許您透過使用 `CallIdInterceptor` 將呼叫 ID 新增至請求中。

 ```kotlin
 install(ClientCallId) {
     intercept { request, callId ->
         request.header(HttpHeaders.XRequestId, callId)
     }
 }
 ```

* `addToHeader()` 函式將呼叫 ID 新增至指定的標頭。它接受一個標頭作為參數，預設為 `HttpHeaders.XRequestId`。

 ```kotlin
 install(CallId) {
     addToHeader(HttpHeaders.XRequestId)
 }
 ```

## 範例

在以下範例中，Ktor 用戶端的 `%plugin_name%` 外掛程式被配置為產生新的呼叫 ID 並將其新增至標頭：

 ```kotlin
 val client = HttpClient(CIO) {
     install(CallId) {
         generate { "call-id-client" }
         addToHeader(HttpHeaders.XRequestId)
     }
 }
 ```

該外掛程式使用協程上下文來取得呼叫 ID，並利用 `generate()` 函式產生一個新的 ID。接著透過 `addToHeader()` 函式將第一個非 null 的呼叫 ID 套用到請求標頭中。

在 Ktor 伺服器中，接著可以使用[伺服器端 CallId 外掛程式](server-call-id.md)的 [retrieve](server-call-id.md#retrieve) 函式從標頭中檢索呼叫 ID。

 ```kotlin
 install(CallId) {
     retrieveFromHeader(HttpHeaders.XRequestId)
 }
 ```

透過這種方式，Ktor 伺服器會檢索請求中指定標頭的 ID，並將其套用到呼叫的 `callId` 屬性。

有關完整範例，請參閱 [client-call-id](https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/client-call-id)