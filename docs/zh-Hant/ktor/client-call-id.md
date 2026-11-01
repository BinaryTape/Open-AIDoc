[//]: # (title: 在 Ktor Client 中追蹤請求)

<show-structure for="chapter" depth="2"/>
<primary-label ref="client-plugin"/>

<var name="artifact_name" value="ktor-client-call-id"/>
<var name="ktor_version_catalog_name" value="ktorLibs.client.callId"/>
<var name="package_name" value="io.ktor.client.plugins.callid"/>
<var name="plugin_name" value="CallId"/>

<tldr>
<p>
<b>必要相依性</b>：<code>io.ktor:%artifact_name%</code>
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
%plugin_name% 用戶端外掛程式允許你使用唯一的呼叫 ID 來追蹤用戶端請求。
</link-summary>

%plugin_name% 外掛程式允許你使用唯一的呼叫 ID 端到端追蹤用戶端請求。這在微服務架構中特別有用，無論請求經過多少個服務，都能持續追蹤呼叫。

呼叫作用域的協同程式上下文（coroutine context）中可能已存在呼叫 ID。預設情況下，該外掛程式會使用目前的上下文來擷取呼叫 ID，並使用 `HttpHeaders.XRequestId` 標頭將其新增至特定呼叫的上下文中。

此外，若作用域沒有呼叫 ID，你可以[設定外掛程式](#configure)以產生並套用新的呼叫 ID。

> 在伺服器端，Ktor 提供了 [CallId](server-call-id.md) 外掛程式來追蹤用戶端請求。

## 新增相依性 {id="add_dependencies"}

<p>
    若要使用 <code>%plugin_name%</code>，請將 <code>%artifact_name%</code> 構件新增至你的組建指令碼：
</p>
<Tabs group="languages">
    <TabItem title="Gradle (Kotlin)" group-key="kotlin">
        <code-block lang="Kotlin" code="            implementation(%ktor_version_catalog_name%)"/>
        <note>
            上述程式碼片段使用 <a href="server-dependencies.topic#using-version-catalog">
            Ktor version catalog</a> 來指定 Ktor 相依性。
        </note>
    </TabItem>
    <TabItem title="Gradle (Groovy)" group-key="groovy">
        <code-block lang="Groovy" code="            implementation %ktor_version_catalog_name%"/>
        <note>
            上述程式碼片段使用 <a href="server-dependencies.topic#using-version-catalog">
            Ktor version catalog</a> 來指定 Ktor 相依性。
        </note>
    </TabItem>
    <TabItem title="Maven" group-key="maven">
        <code-block lang="XML" code="            &lt;dependency&gt;&#10;                &lt;groupId&gt;io.ktor&lt;/groupId&gt;&#10;                &lt;artifactId&gt;%artifact_name%-jvm&lt;/artifactId&gt;&#10;                &lt;version&gt;${ktor_version}&lt;/version&gt;&#10;            &lt;/dependency&gt;"/>
    </TabItem>
</Tabs>

## 安裝 %plugin_name% {id="install_plugin"}

<p>
    若要將 <code>%plugin_name%</code> 外掛程式<a href="server-plugins.md#install">安裝</a>至你的應用程式，請將其傳遞給指定<Links href="server-modules.md" summary="Modules allow you to structure your application by grouping routes.">模組</Links>中的 <code>install</code> 函式。
    以下範例示範如何安裝 <code>%plugin_name%</code>：
</p>
<list>
    <li>
        在 <code>embeddedServer()</code> 函式呼叫中。
    </li>
    <li>
        在 <code>Application</code> 類別上明確定義的 <code>module()</code> 擴充函式中。
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

## 設定 %plugin_name% {id="configure"}

由 [CallIdConfig](https://api.ktor.io/ktor-client-call-id/io.ktor.client.plugins.callid/-call-id-config/index.html) 類別提供的 %plugin_name% 外掛程式配置，允許你產生呼叫 ID 並將其新增至呼叫上下文。

### 產生呼叫 ID {id="generate-a-call-id"}

可以透過以下方式之一為特定請求產生呼叫 ID：

* 預設啟用的 `useCoroutineContext` 屬性會新增一個產生器，該產生器使用目前的 `CoroutineContext` 來擷取呼叫 ID。若要停用此功能，請將 `useCoroutineContext` 設為 `false`：

 ```kotlin
 install(CallId) {
     useCoroutineContext = false
 }
 ```

> 在 Ktor 伺服器中，使用 [CallId 外掛程式](server-call-id.md)將呼叫 ID 新增至 `CoroutineContext`。

* `generate()` 函式允許你為傳出請求產生呼叫 ID。如果產生呼叫 ID 失敗，它將傳回 `null`。

 ```kotlin
 install(CallId) {
     generate { "call-id-client-2" }
 }
 ```

你可以使用多種方法來產生呼叫 ID。在這種情況下，將會套用第一個非 null 的值。

### 新增呼叫 ID {id="add-a-call-id"}

擷取到呼叫 ID 後，可以使用以下選項將其新增至請求中：

* `intercept()` 函式允許你使用 `CallIdInterceptor` 將呼叫 ID 新增至請求。

 ```kotlin
 install(ClientCallId) {
     intercept { request, callId ->
         request.header(HttpHeaders.XRequestId, callId)
     }
 }
 ```

* `addToHeader()` 函式將呼叫 ID 新增至指定的標頭。它接受標頭作為參數，預設為 `HttpHeaders.XRequestId`。

 ```kotlin
 install(CallId) {
     addToHeader(HttpHeaders.XRequestId)
 }
 ```

## 範例 {id="example"}

在以下範例中，Ktor 用戶端的 `%plugin_name%` 外掛程式被設定為產生新的呼叫 ID 並將其新增至標頭：

 ```kotlin
 val client = HttpClient(CIO) {
     install(CallId) {
         generate { "call-id-client" }
         addToHeader(HttpHeaders.XRequestId)
     }
 }
 ```

該外掛程式使用協同程式上下文取得呼叫 ID，並利用 `generate()` 函式產生新的呼叫 ID。接著使用 `addToHeader()` 函式將第一個非 null 的呼叫 ID 套用至請求標頭。

在 Ktor 伺服器中，隨後可以使用[伺服器專用的 CallId 外掛程式](server-call-id.md)中的 [retrieve](server-call-id.md#retrieve) 函式從標頭擷取呼叫 ID。

 ```kotlin
 install(CallId) {
     retrieveFromHeader(HttpHeaders.XRequestId)
 }
 ```

透過這種方式，Ktor 伺服器會擷取請求中指定標頭的 ID，並將其套用至該呼叫的 `callId` 屬性。

如需完整範例，請參閱 [client-call-id](https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/client-call-id)