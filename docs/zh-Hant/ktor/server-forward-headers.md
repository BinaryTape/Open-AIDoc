[//]: # (title: 轉發標頭 (Forwarded headers))

<show-structure for="chapter" depth="2"/>
<primary-label ref="server-plugin"/>

<var name="artifact_name" value="ktor-server-forwarded-header"/>
<var name="package_name" value="io.ktor.server.plugins.forwardedheaders"/>

<tldr>
<p>
<b>必要的相依性</b>：<code>io.ktor:%artifact_name%</code>
</p>
<var name="example_name" value="forwarded-header"/>
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

[ForwardedHeaders](https://api.ktor.io/ktor-server-forwarded-header/io.ktor.server.plugins.forwardedheaders/-forwarded-headers.html) 與 [XForwardedHeaders](https://api.ktor.io/ktor-server-forwarded-header/io.ktor.server.plugins.forwardedheaders/-x-forwarded-headers.html) 外掛程式可讓您處理反向代理標頭，以取得 Ktor 伺服器位於反向代理之後時原始[請求](server-requests.md) (request) 的相關資訊。這對於[記錄](server-logging.md)目的可能非常有用。

* `ForwardedHeaders` 處理 `Forwarded` 標頭 ([RFC 7239](https://tools.ietf.org/html/rfc7239))
* `XForwardedHeaders` 處理以下 `X-Forwarded-` 標頭：
   - `X-Forwarded-Host`/`X-Forwarded-Server` 
   - `X-Forwarded-For` 
   - `X-Forwarded-By`
   - `X-Forwarded-Proto`/`X-Forwarded-Protocol`
   - `X-Forwarded-SSL`/`Front-End-Https`

> 為了防止 `Forwarded` 標頭遭到操作，請僅在您的應用程式僅接受反向代理連線時安裝這些外掛程式。
> 
{type="note"}

## 新增相依性 {id="add_dependencies"}
若要使用 `ForwardedHeaders`/`XForwardedHeaders` 外掛程式，您需要在建置指令碼中包含 `%artifact_name%` 構件 (artifact)：

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

## 安裝外掛程式 {id="install_plugin"}

<Tabs>
<TabItem title="ForwardedHeader">

<var name="plugin_name" value="ForwardedHeaders"/>
<p>
    若要將 <code>%plugin_name%</code> 外掛程式<a href="#install">安裝</a>到應用程式，請將其傳遞給指定<Links href="/ktor/server-modules" summary="模組允許您透過分組路由來建構應用程式。">模組</Links>中的 <code>install</code> 函式。
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

</TabItem>

<TabItem title="XForwardedHeader">

<var name="plugin_name" value="XForwardedHeaders"/>
<p>
    若要將 <code>%plugin_name%</code> 外掛程式<a href="#install">安裝</a>到應用程式，請將其傳遞給指定<Links href="/ktor/server-modules" summary="模組允許您透過分組路由來建構應用程式。">模組</Links>中的 <code>install</code> 函式。
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

</TabItem>
</Tabs>

安裝 `ForwardedHeaders`/`XForwardedHeaders` 之後，您可以使用 [call.request.origin](#request_info) 屬性取得原始請求的資訊。

## 取得請求資訊 {id="request_info"}

### 代理請求資訊 {id="proxy_request_info"}

若要取得代理請求的相關資訊，請在[路由處理常式](server-routing.md#define_route)中使用 [call.request.local](https://api.ktor.io/ktor-server-core/io.ktor.server.request/-application-request/local.html) 屬性。
以下程式碼片段顯示如何取得代理地址以及發出請求的主機資訊：

```kotlin
get("/hello") {
    val remoteHost = call.request.local.remoteHost
    val serverHost = call.request.local.serverHost
}
```

### 原始請求資訊 {id="original-request-information"}

若要讀取原始請求的資訊，請使用 [call.request.origin](https://api.ktor.io/ktor-server-core/io.ktor.server.plugins/origin.html) 屬性：

```kotlin
get("/hello") {
    val originRemoteHost = call.request.origin.remoteHost
    val originServerHost = call.request.origin.serverHost
}
```

下表顯示了根據是否安裝了 `ForwardedHeaders`/`XForwardedHeaders`，由 `call.request.origin` 公開的不同屬性值。

![請求圖表](forwarded-headers.png){width="706"}

| 屬性 | 不含 ForwardedHeaders | 包含 ForwardedHeaders |
|------------------------|--------------------------|-----------------------|
| `origin.localHost`     | _web-server_             | _web-server_          |
| `origin.localPort`     | _8080_                   | _8080_                |
| `origin.serverHost`    | _web-server_             | _proxy_               |
| `origin.serverPort`    | _8080_                   | _80_                  |
| `origin.remoteHost`    | _proxy_                  | _client_              |
| `origin.remotePort`    | _32864_                  | _32864_               |

> 您可以在此處找到完整的範例：[forwarded-header](https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/forwarded-header)。

## 設定 ForwardedHeaders {id="configure"}

如果請求經過多個代理，您可能需要設定 `ForwardedHeaders`/`XForwardedHeaders`。
在這種情況下，`X-Forwarded-For` 會包含每個後續代理的所有 IP 地址，例如：

```HTTP
X-Forwarded-For: <client>, <proxy1>, <proxy2>
```

預設情況下，`XForwardedHeader` 會將 `X-Forwarded-For` 中的第一個項目指派給 `call.request.origin.remoteHost` 屬性。
您也可以提供[選取 IP 地址](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/X-Forward-For#selecting_an_ip_address)的自訂邏輯。
[XForwardedHeadersConfig](https://api.ktor.io/ktor-server-forwarded-header/io.ktor.server.plugins.forwardedheaders/-x-forwarded-headers-config/index.html) 為此公開了以下 API：

- `useFirstProxy` 與 `useLastProxy` 分別允許您從 IP 地址清單中取得第一個或最後一個值。
- `skipLastProxies` 從右側開始跳過指定數量的項目，並取得下一個項目。
   例如，如果 `proxiesCount` 參數等於 `3`，對於下方的標頭，`origin.remoteHost` 將回傳 `10.0.0.123`：
   ```HTTP
   X-Forward-For: 10.0.0.123, proxy-1, proxy-2, proxy-3
   ```
- `skipKnownProxies` 從清單中移除指定的項目並取得最後一個項目。
   例如，如果您將 `listOf("proxy-1", "proxy-3")` 傳遞給此函式，對於下方的標頭，`origin.remoteHost` 將回傳 `proxy-2`：
   ```HTTP
   X-Forward-For: 10.0.0.123, proxy-1, proxy-2, proxy-3
   ```
- `extractEdgeProxy` 允許您提供從 `X-Forward-*` 標頭中擷取值的自訂邏輯。