[//]: # (title: 在 Ktor Server 中追蹤請求)

<show-structure for="chapter" depth="2"/>
<primary-label ref="server-plugin"/>

<var name="artifact_name" value="ktor-server-call-id"/>
<var name="ktor_version_catalog_name" value="ktorLibs.server.callId"/>
<var name="package_name" value="io.ktor.server.plugins.callid"/>
<var name="plugin_name" value="CallId"/>

<tldr>
<p>
<b>必要相依性</b>：<code>io.ktor:%artifact_name%</code>
</p>
<var name="example_name" value="call-id"/>
<p>
    <b>程式碼範例</b>：
    <a href="https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/%example_name%">
        %example_name%
    </a>
</p>
<p>
    <b><Links href="server-native.md" summary="Ktor 支援 Kotlin/Native，可讓您在無需額外執行階段或虛擬機的情況下執行伺服器。">原生伺服器</Links> 支援</b>：✅
</p>
</tldr>

<link-summary>
%plugin_name% 伺服器外掛程式允許您使用唯一的呼叫 ID 來追蹤用戶端請求。
</link-summary>

[%plugin_name%](https://api.ktor.io/ktor-server-call-id/io.ktor.server.plugins.callid/-call-id.html) 外掛程式允許您使用唯一的請求 ID 或呼叫 ID 來端到端追蹤用戶端請求。通常，在 Ktor 中處理呼叫 ID 的流程如下：
1. 首先，您需要透過以下其中一種方式取得特定請求的呼叫 ID：
   * 反向代理（例如 Nginx）或雲端提供商（例如 [Heroku](heroku.md)）可能會在特定標頭（例如 `X-Request-Id`）中新增呼叫 ID。在這種情況下，Ktor 允許您[擷取](#retrieve)呼叫 ID。
   * 否則，如果傳入的請求沒有呼叫 ID，您可以在 Ktor 伺服器端[產生](#generate)它。
2. 接下來，Ktor 會使用預先定義的字典[驗證](#verify)擷取或產生的呼叫 ID。您也可以提供自訂條件來驗證呼叫 ID。
3. 最後，您可以在特定標頭（例如 `X-Request-Id`）中將呼叫 ID [傳送](#send)至用戶端。

將 `%plugin_name%` 與 [CallLogging](server-call-logging.md) 搭配使用，可透過[將呼叫 ID 置於](#put-call-id-mdc) MDC 上下文中，並設定記錄器以顯示每個請求的呼叫 ID，進而協助您進行呼叫的疑難排解。

> 在用戶端，Ktor 提供了用於追蹤用戶端請求的 [CallId](client-call-id.md) 外掛程式。

## 新增相依性 {id="add_dependencies"}

<p>
    若要使用 <code>%plugin_name%</code>，請將 <code>%artifact_name%</code> 構件新增至您的建置指令碼中：
</p>
<Tabs group="languages">
    <TabItem title="Gradle (Kotlin)" group-key="kotlin">
        <code-block lang="Kotlin" code="            implementation(%ktor_version_catalog_name%)"/>
        <note>
            上述程式碼片段使用 <a href="server-dependencies.topic#using-version-catalog">
            Ktor 版本目錄</a> 來指定 Ktor 相依性。
        </note>
    </TabItem>
    <TabItem title="Gradle (Groovy)" group-key="groovy">
        <code-block lang="Groovy" code="            implementation %ktor_version_catalog_name%"/>
        <note>
            上述程式碼片段使用 <a href="server-dependencies.topic#using-version-catalog">
            Ktor 版本目錄</a> 來指定 Ktor 相依性。
        </note>
    </TabItem>
    <TabItem title="Maven" group-key="maven">
        <code-block lang="XML" code="            &lt;dependency&gt;&#10;                &lt;groupId&gt;io.ktor&lt;/groupId&gt;&#10;                &lt;artifactId&gt;%artifact_name%-jvm&lt;/artifactId&gt;&#10;                &lt;version&gt;${ktor_version}&lt;/version&gt;&#10;            &lt;/dependency&gt;"/>
    </TabItem>
</Tabs>

## 安裝 %plugin_name% {id="install_plugin"}

<p>
    若要將 <code>%plugin_name%</code> 外掛程式<a href="server-plugins.md#install">安裝</a>至您的應用程式中，
    請將其傳遞給指定 <Links href="server-modules.md" summary="模組允許您透過將路由分組來組織應用程式結構。">模組</Links> 中的 <code>install</code> 函式。
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

### 擷取呼叫 ID {id="retrieve"}

`%plugin_name%` 提供數種擷取呼叫 ID 的方式：

* 若要從指定標頭中擷取呼叫 ID，請使用 `retrieveFromHeader` 函式，例如：
   ```kotlin
   install(CallId) {
       retrieveFromHeader(HttpHeaders.XRequestId)
   }
   ```
   您也可以使用 `header` 函式在同一個標頭中[擷取並傳送呼叫 ID](#send)。

* 如有需要，您可以從 `ApplicationCall` 中擷取呼叫 ID：
   ```kotlin
   install(CallId) {
       retrieve { call ->
           call.request.header(HttpHeaders.XRequestId)
       }
   }
   ```
請注意，所有擷取的呼叫 ID 都會使用預設字典進行[驗證](#verify)。

### 產生呼叫 ID {id="generate"}

如果傳入的請求未包含呼叫 ID，您可以使用 `generate` 函式來產生：
* 以下範例示範如何從預先定義的字典中產生指定長度的呼叫 ID：
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

所有[擷取的](#retrieve)或[產生的](#generate)呼叫 ID 都會使用預設字典進行驗證，該字典如下所示：

```kotlin
CALL_ID_DEFAULT_DICTIONARY: String = "abcdefghijklmnopqrstuvwxyz0123456789+/=-"
```
這代表包含大寫字母的呼叫 ID 將無法通過驗證。如有需要，您可以使用 `verify` 函式套用較寬鬆的規則：

```kotlin
install(CallId) {
    verify { callId: String ->
        callId.isNotEmpty()
    }
}
```

您可以在此處找到完整的範例：[call-id](https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/call-id)。

### 傳送呼叫 ID 至用戶端 {id="send"}

在[擷取](#retrieve)或[產生](#generate)呼叫 ID 之後，您可以將其傳送給用戶端：

* `header` 函式可用於[擷取呼叫 ID](#retrieve)並在同一個標頭中傳送：

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

* 如有需要，您可以使用 `ApplicationCall` 在[回應](server-responses.md)中傳送呼叫 ID：
   ```kotlin
   reply { call, callId ->
       call.response.header(HttpHeaders.XRequestId, callId)
   }
   ```

## 將呼叫 ID 放入 MDC {id="put-call-id-mdc"}

將 `%plugin_name%` 與 [CallLogging](server-call-logging.md) 搭配使用，可藉由將呼叫 ID 放入 MDC 上下文中，並設定記錄器以顯示每個請求的呼叫 ID，協助您對呼叫進行疑難排解。為此，請在 `CallLogging` 設定區塊內呼叫 `callIdMdc` 函式，並指定要放入 MDC 上下文中的所需鍵名：

```kotlin
install(CallLogging) {
    callIdMdc("call-id")
}
```

此鍵可以傳遞給[記錄器設定](server-logging.md#configure-logger)以在記錄中顯示呼叫 ID。例如，`logback.xml` 檔案可能如下所示：
```
<appender name="STDOUT" class="ch.qos.logback.core.ConsoleAppender">
    <encoder>
        <pattern>%d{YYYY-MM-dd HH:mm:ss.SSS} [%thread] %X{call-id} %-5level %logger{36} - %msg%n</pattern>
    </encoder>
</appender>
```

您可以在此處找到完整的範例：[call-id](https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/call-id)。