[//]: # (title: 呼叫記錄)

<show-structure for="chapter" depth="2"/>
<primary-label ref="server-plugin"/>

<var name="plugin_name" value="CallLogging"/>
<var name="package_name" value="io.ktor.server.plugins.calllogging"/>
<var name="artifact_name" value="ktor-server-call-logging"/>

<tldr>
<p>
<b>必要的相依性</b>：<code>io.ktor:%artifact_name%</code>
</p>
<var name="example_name" value="logging"/>
<p>
    <b>程式碼範例</b>：
    <a href="https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/%example_name%">
        %example_name%
    </a>
</p>
<p>
    <b><Links href="/ktor/server-native" summary="Ktor 支援 Kotlin/Native，並允許您在沒有額外執行階段或虛擬機的情況下執行伺服器。">原生伺服器</Links> 支援</b>：✖️
</p>
</tldr>

Ktor 提供了使用 [SLF4J](http://www.slf4j.org/) 程式庫記錄應用程式事件的功能。您可以從 [Logging in Ktor Server](server-logging.md) 主題中瞭解一般的記錄配置。

`%plugin_name%` 外掛程式允許您記錄傳入的用戶端請求。

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
    若要將 <code>%plugin_name%</code> 外掛程式<a href="#install">安裝</a>到應用程式，請將其傳遞給指定<Links href="/ktor/server-modules" summary="模組允許您透過分組路由來建構您的應用程式。">模組</Links>中的 <code>install</code> 函式。
    以下程式碼片段展示了如何安裝 <code>%plugin_name%</code> ...
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

## 設定記錄配置 {id="configure"}

您可以透過多種方式配置 `%plugin_name%`：指定記錄等級、根據指定條件篩選請求、自訂記錄訊息等等。您可以在 [CallLoggingConfig](https://api.ktor.io/ktor-server-call-logging/io.ktor.server.plugins.calllogging/-call-logging-config/index.html) 查看可用的配置設定。

### 設定記錄等級 {id="logging_level"}

預設情況下，Ktor 使用 `Level.INFO` 記錄等級。若要更改，請使用 `level` 屬性：

```kotlin
install(CallLogging) {
    level = Level.INFO
}
```

### 篩選記錄請求 {id="filter"}

`filter` 屬性允許您增加篩選請求的條件。在下面的範例中，只有發送到 `/api/v1` 的請求會進入記錄：

```kotlin
install(CallLogging) {
    filter { call ->
        call.request.path().startsWith("/api/v1")
    }
}
```

### 自訂記錄訊息格式 {id="format"}

透過使用 `format` 函式，您可以將與請求/回應相關的任何資料放入記錄中。以下範例展示了如何為每個請求記錄回應狀態、請求 HTTP 方法以及 `User-Agent` 標頭值。

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

您可以在此處找到完整的範例：[logging](https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/logging)。

### 將呼叫參數放入 MDC {id="mdc"}

`%plugin_name%` 外掛程式支援 MDC (Mapped Diagnostic Context)。您可以使用 `mdc` 函式將具有指定名稱的所需內容值放入 MDC。例如，在下面的程式碼片段中，一個 `name` 查詢參數被加入到 MDC：

```kotlin
install(CallLogging) {
    mdc("name-parameter") { call ->
        call.request.queryParameters["name"]
    }
}
```

您可以在 `ApplicationCall` 的生命週期內存取加入的值：

```kotlin
import org.slf4j.MDC
// ...
MDC.get("name-parameter")