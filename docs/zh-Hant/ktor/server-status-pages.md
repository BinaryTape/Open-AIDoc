[//]: # (title: 狀態頁面)

<show-structure for="chapter" depth="2"/>
<primary-label ref="server-plugin"/>

<var name="plugin_name" value="StatusPages"/>
<var name="package_name" value="io.ktor.server.plugins.statuspages"/>
<var name="artifact_name" value="ktor-server-status-pages"/>

<tldr>
<p>
<b>必要相依性</b>：<code>io.ktor:%artifact_name%</code>
</p>
<var name="example_name" value="status-pages"/>
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
%plugin_name% 允許 Ktor 應用程式根據拋出的例外或狀態碼，對任何失敗狀態做出適當的回應。
</link-summary>

[%plugin_name%](https://api.ktor.io/ktor-server-status-pages/io.ktor.server.plugins.statuspages/-status-pages.html) 外掛程式允許 Ktor 應用程式根據拋出的例外或狀態碼，對任何失敗狀態做出適當的[回應](server-responses.md)。

## 新增相依性 {id="add_dependencies"}

<p>
    若要使用 <code>%plugin_name%</code>，您需要在組建指令碼中包含 <code>%artifact_name%</code> 構件：
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
    若要將 <code>%plugin_name%</code> 外掛程式<a href="#install">安裝</a>到應用程式，請將其傳遞給指定<Links href="/ktor/server-modules" summary="模組允許您透過分組路由來組織您的應用程式。">模組</Links>中的 <code>install</code> 函式。
    以下程式碼片段顯示如何安裝 <code>%plugin_name%</code> ...
</p>
<list>
    <li>
        ... 在 <code>embeddedServer</code> 函式呼叫內。
    </li>
    <li>
        ... 在明確定義的 <code>module</code> 內，該模組是 <code>Application</code> 類別的擴充函式。
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

`%plugin_name%` 外掛程式提供了三個主要的配置選項：

- [exceptions](#exceptions)：根據對應的例外類別配置回應
- [status](#status)：針對狀態碼值配置回應
- [statusFile](#status-file)：從類別路徑配置檔案回應

### 例外 {id="exceptions"}

`exception` 處理常式允許您處理導致 `Throwable` 例外的呼叫。在最基本的情況下，可以為任何例外配置 `500` HTTP 狀態碼：

```kotlin
install(StatusPages) {
    exception<Throwable> { call, cause ->
        call.respondText(text = "500: $cause" , status = HttpStatusCode.InternalServerError)
    }
}
```

您還可以檢查特定例外並回應所需的內容：

```kotlin
install(StatusPages) {
    exception<Throwable> { call, cause ->
        if(cause is AuthorizationException) {
            call.respondText(text = "403: $cause" , status = HttpStatusCode.Forbidden)
        } else {
            call.respondText(text = "500: $cause" , status = HttpStatusCode.InternalServerError)
        }
    }
}
```

### 狀態 {id="status"}

`status` 處理常式提供根據狀態碼回應特定內容的功能。以下範例顯示當伺服器上缺少資源（`404` 狀態碼）時，如何對請求做出回應：

```kotlin
install(StatusPages) {
    status(HttpStatusCode.NotFound) { call, status ->
        call.respondText(text = "404: Page Not Found", status = status)
    }
}
```

### 狀態檔案 {id="status-file"}

`statusFile` 處理常式允許您根據狀態碼提供 HTML 頁面。假設您的專案在 `resources` 資料夾中包含 `error401.html` 和 `error402.html` HTML 頁面。在這種情況下，您可以按如下方式使用 `statusFile` 處理 `401` 和 `402` 狀態碼：
```kotlin
install(StatusPages) {
    statusFile(HttpStatusCode.Unauthorized, HttpStatusCode.PaymentRequired, filePattern = "error#.html")
}
```

`statusFile` 處理常式會將已配置狀態清單中的任何 `#` 字元替換為狀態碼的值。

> 您可以在此處找到完整的範例：[status-pages](https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/status-pages)。