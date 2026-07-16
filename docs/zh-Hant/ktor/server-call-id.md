[//]: # (title: 在 Ktor 伺服器中追蹤請求)

<show-structure for="chapter" depth="2"/>
<primary-label ref="server-plugin"/>

<var name="artifact_name" value="ktor-server-call-id"/>
<var name="package_name" value="io.ktor.server.plugins.callid"/>
<var name="plugin_name" value="CallId"/>

<tldr>
<p>
<b>必要的相依性</b>：<code>io.ktor:%artifact_name%</code>
</p>
<var name="example_name" value="call-id"/>
<p>
    <b>程式碼範例</b>：
    <a href="https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/%example_name%">
        %example_name%
    </a>
</p>
<p>
    <b><Links href="/ktor/server-native" summary="Ktor 支援 Kotlin/Native，並允許您在沒有額外執行階段或虛擬機的情況下執行伺服器。">原生伺服器</Links> 支援</b>：✅
</p>
</tldr>

<link-summary>
%plugin_name% 伺服器外掛程式允許您透過使用唯一的呼叫 ID 來追蹤用戶端請求。
</link-summary>

[%plugin_name%](https://api.ktor.io/ktor-server-call-id/io.ktor.server.plugins.callid/-call-id.html) 外掛程式允許您透過使用唯一的請求 ID 或呼叫 ID 來端到端地追蹤用戶端請求。通常，在 Ktor 中處理呼叫 ID 的方式如下：
1. 首先，您需要透過以下方式之一獲取特定請求的呼叫 ID：
   * 反向代理（例如 Nginx）或雲端供應商（例如 [Heroku](heroku.md)）可能會在特定標頭（例如 `X-Request-Id`）中新增呼叫 ID。在這種情況下，Ktor 允許您[擷取](#retrieve)呼叫 ID。
   * 否則，如果請求中沒有包含呼叫 ID，您可以在 Ktor 伺服器上[產生](#generate)它。
2. 接下來，Ktor 會使用預定義字典[驗證](#verify)擷取/產生的呼叫 ID。您也可以提供自己的條件來驗證呼叫 ID。
3. 最後，您可以在特定標頭（例如 `X-Request-Id`）中將呼叫 ID [傳送](#send)至用戶端。

將 `%plugin_name%` 與 [CallLogging](server-call-logging.md) 配合使用，可將[呼叫 ID 放入 MDC 上下文中](#put-call-id-mdc)並配置記錄器以顯示每個請求的呼叫 ID，從而協助您對呼叫進行疑難排解。

> 在用戶端，Ktor 提供了 [CallId](client-call-id.md) 外掛程式來追蹤用戶端請求。

## 新增相依性 {id="add_dependencies"}

<p>
    若要使用 <code>%plugin_name%</code>，您需要在建置指令碼中包含 <code>%artifact_name%</code> 構件：
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
    若要將 <code>%plugin_name%</code> 外掛程式<a href="#install">安裝</a>到應用程式中，請將其傳遞給指定的 <Links href="/ktor/server-modules" summary="模組允許您透過分組路由來建構您的應用程式。">模組</Links> 中的 <code>install</code> 函式。
    以下程式碼片段顯示如何安裝 <code>%plugin_name%</code> ...
</p>
<list>
    <li>
        ... 在 <code>embeddedServer</code> 函式呼叫內。
    </li>
    <li>
        ... 在明確定義的 <code>module</code> 內，它是 <code>Application</code> 類別的擴充函式。
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

### 擷取呼叫 ID {id="retrieve"}

`%plugin_name%` 提供了多種擷取呼叫 ID 的方式：

* 若要從指定的標頭擷取呼叫 ID，請使用 `retrieveFromHeader` 函式，例如：
   ```kotlin
   install(CallId) {
       retrieveFromHeader(HttpHeaders.XRequestId)
   }
   ```
   您也可以使用 `header` 函式在同一個標頭中[擷取並傳送呼叫 ID](#send)。

* 如果需要，您可以從 `ApplicationCall` 擷取呼叫 ID：
   ```kotlin
   install(CallId) {
       retrieve { call ->
           call.request.header(HttpHeaders.XRequestId)
       }
   }
   ```
請注意，所有擷取的呼叫 ID 都會使用預設字典進行[驗證](#verify)。

### 產生呼叫 ID {id="generate"}

如果傳入的請求不包含呼叫 ID，您可以使用 `generate` 函式來產生它：
* 以下範例顯示如何從預定義字典中產生具有特定長度的呼叫 ID：
   ```kotlin
   install(CallId) {
       generate(10, "abcde12345")
   }
   ```
* 在以下範例中，`generate` 函式接受一個用於產生呼叫 ID 的區塊：
   ```kotlin
   install(CallId) {
       val counter = atomic(0)
       generate {
           "generated-call-id-${counter.getAndIncrement()}"
       }
   }
   ```

### 驗證呼叫 ID {id="verify"}

所有[擷取](#retrieve)/[產生](#generate)的呼叫 ID 都會使用預設字典進行驗證，其內容如下：

```kotlin
CALL_ID_DEFAULT_DICTIONARY: String = "abcdefghijklmnopqrstuvwxyz0123456789+/=-"
```
這意味著包含大寫字母的呼叫 ID 將無法通過驗證。如果需要，您可以使用 `verify` 函式套用較不嚴格的規則：

```kotlin
install(CallId) {
    verify { callId: String ->
        callId.isNotEmpty()
    }
}
```

您可以在此處找到完整的範例：[call-id](https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/call-id)。

### 將呼叫 ID 傳送至用戶端 {id="send"}

在[擷取](#retrieve)/[產生](#generate)呼叫 ID 後，您可以將其傳送至用戶端：

* `header` 函式可用於[擷取呼叫 ID](#retrieve) 並在同一個標頭中傳送它：

   ```kotlin
   install(CallId) {
       header(HttpHeaders.XRequestId)
   }
   ```

  您可以在此處找到完整的範例：[call-id](https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/call-id)。

* `replyToHeader` 函式會在指定的標頭中傳送呼叫 ID：
   ```kotlin
   install(CallId) {
       replyToHeader(HttpHeaders.XRequestId)
   }
   ```

* 如果需要，您可以使用 `ApplicationCall` 在[回應](server-responses.md)中傳送呼叫 ID：
   ```kotlin
   reply { call, callId ->
       call.response.header(HttpHeaders.XRequestId, callId)
   }
   ```

## 將呼叫 ID 放入 MDC {id="put-call-id-mdc"}

將 `%plugin_name%` 與 [CallLogging](server-call-logging.md) 配合使用，可以將呼叫 ID 放入 MDC 上下文中，並配置記錄器以顯示每個請求的呼叫 ID，從而協助您對呼叫進行疑難排解。若要執行此操作，請在 `CallLogging` 配置區塊內呼叫 `callIdMdc` 函式，並指定要放入 MDC 上下文中的所需鍵 (key)：

```kotlin
install(CallLogging) {
    callIdMdc("call-id")
}
```

此鍵可以傳遞給[記錄器配置](server-logging.md#configure-logger)以在記錄中顯示呼叫 ID。例如，`logback.xml` 檔案內容可能如下：
```
<appender name="STDOUT" class="ch.qos.logback.core.ConsoleAppender">
    <encoder>
        <pattern>%d{YYYY-MM-dd HH:mm:ss.SSS} [%thread] %X{call-id} %-5level %logger{36} - %msg%n</pattern>
    </encoder>
</appender>
```

您可以在此處找到完整的範例：[call-id](https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/call-id)。