[//]: # (title: 轉發標頭)

<show-structure for="chapter" depth="2"/>
<primary-label ref="server-plugin"/>

<var name="artifact_name" value="ktor-server-forwarded-header"/>
<var name="ktor_version_catalog_name" value="ktorLibs.server.forwardedHeader"/>
<var name="package_name" value="io.ktor.server.plugins.forwardedheaders"/>

<tldr>
<p>
<b>必要相依性</b>：<code>io.ktor:%artifact_name%</code>
</p>
<var name="example_name" value="forwarded-header"/>
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

當 Ktor 伺服器部署在反向代理之後時，[ForwardedHeaders](https://api.ktor.io/ktor-server-forwarded-header/io.ktor.server.plugins.forwardedheaders/-forwarded-headers.html) 與 [XForwardedHeaders](https://api.ktor.io/ktor-server-forwarded-header/io.ktor.server.plugins.forwardedheaders/-x-forwarded-headers.html) 外掛程式可讓您處理反向代理標頭，以取得原始 [request](server-requests.md) 的資訊。這對於[記錄](server-logging.md)目的非常有用。

* `ForwardedHeaders` 處理 `Forwarded` 標頭（[RFC 7239](https://tools.ietf.org/html/rfc7239)）
* `XForwardedHeaders` 處理以下 `X-Forwarded-` 標頭：
   - `X-Forwarded-Host`/`X-Forwarded-Server` 
   - `X-Forwarded-For` 
   - `X-Forwarded-By`
   - `X-Forwarded-Proto`/`X-Forwarded-Protocol`
   - `X-Forwarded-SSL`/`Front-End-Https`

> 為防止 `Forwarded` 標頭遭到竄改，請僅在您的應用程式只接受反向代理連線時才安裝這些外掛程式。
> 
{type="note"}

## 新增相依性 {id="add_dependencies"}
若要使用 `ForwardedHeaders`/`XForwardedHeaders` 外掛程式，您需要在建置指令碼中包含 `%artifact_name%` 構件：

<Tabs group="languages">
    <TabItem title="Gradle (Kotlin)" group-key="kotlin">
        <code-block lang="Kotlin" code="            implementation(%ktor_version_catalog_name%)"/>
        <note>
            上述程式碼片段使用 <a href="server-dependencies.topic#using-version-catalog">
            Ktor 版本目錄 (Version Catalog)</a> 來指定 Ktor 相依性。
        </note>
    </TabItem>
    <TabItem title="Gradle (Groovy)" group-key="groovy">
        <code-block lang="Groovy" code="            implementation %ktor_version_catalog_name%"/>
        <note>
            上述程式碼片段使用 <a href="server-dependencies.topic#using-version-catalog">
            Ktor 版本目錄 (Version Catalog)</a> 來指定 Ktor 相依性。
        </note>
    </TabItem>
    <TabItem title="Maven" group-key="maven">
        <code-block lang="XML" code="            &lt;dependency&gt;&#10;                &lt;groupId&gt;io.ktor&lt;/groupId&gt;&#10;                &lt;artifactId&gt;%artifact_name%-jvm&lt;/artifactId&gt;&#10;                &lt;version&gt;${ktor_version}&lt;/version&gt;&#10;            &lt;/dependency&gt;"/>
    </TabItem>
</Tabs>

## 安裝外掛程式 {id="install_plugin"}

<Tabs>
<TabItem title="ForwardedHeader">

<var name="plugin_name" value="ForwardedHeaders"/>
<p>
    若要將 <code>%plugin_name%</code> 外掛程式<a href="server-plugins.md#install">安裝</a>到您的應用程式中，請將其傳遞給指定 <Links href="server-modules.md" summary="模組允許您透過將路由分組來組織應用程式架構。">模組</Links> 中的 <code>install</code> 函式。
    以下範例展示如何安裝 <code>%plugin_name%</code>：
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

</TabItem>

<TabItem title="XForwardedHeader">

<var name="plugin_name" value="XForwardedHeaders"/>
<p>
    若要將 <code>%plugin_name%</code> 外掛程式<a href="server-plugins.md#install">安裝</a>到您的應用程式中，請將其傳遞給指定 <Links href="server-modules.md" summary="模組允許您透過將路由分組來組織應用程式架構。">模組</Links> 中的 <code>install</code> 函式。
    以下範例展示如何安裝 <code>%plugin_name%</code>：
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

</TabItem>
</Tabs>

安裝 `ForwardedHeaders`/`XForwardedHeaders` 之後，您可以使用 [call.request.origin](#request_info) 屬性來取得有關原始請求的資訊。

## 取得請求資訊 {id="request_info"}

### 代理請求資訊 {id="proxy_request_info"}

若要取得有關代理請求的資訊，請在[路由處理常式](server-routing.md#define_route)中使用 [call.request.local](https://api.ktor.io/ktor-server-core/io.ktor.server.request/-application-request/local.html) 屬性。
以下程式碼片段展示如何取得代理位址以及發起請求之主機的資訊：

```kotlin
get("/hello") {
    val remoteHost = call.request.local.remoteHost
    val serverHost = call.request.local.serverHost
}
```

### 原始請求資訊 {id="original-request-information"}

若要讀取有關原始請求的資訊，請使用 [call.request.origin](https://api.ktor.io/ktor-server-core/io.ktor.server.plugins/origin.html) 屬性：

```kotlin
get("/hello") {
    val originRemoteHost = call.request.origin.remoteHost
    val originServerHost = call.request.origin.serverHost
}
```

下表展示了依據是否安裝 `ForwardedHeaders`/`XForwardedHeaders`，`call.request.origin` 所公開之不同屬性的值。

![請求圖表](forwarded-headers.png){width="706"}

| 屬性                   | 未安裝 ForwardedHeaders | 已安裝 ForwarderHeaders |
|------------------------|--------------------------|-----------------------|
| `origin.localHost`     | _web-server_             | _web-server_          |
| `origin.localPort`     | _8080_                   | _8080_                |
| `origin.serverHost`    | _web-server_             | _proxy_               |
| `origin.serverPort`    | _8080_                   | _80_                  |
| `origin.remoteHost`    | _proxy_                  | _client_              |
| `origin.remotePort`    | _32864_                  | _32864_               |

> 您可以在此處找到完整範例：[forwarded-header](https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/forwarded-header)。

## 設定 ForwardedHeaders {id="configure"}

如果請求經過多個代理，您可能需要設定 `ForwardedHeaders`/`XForwardedHeaders`。
在這種情況下，`X-Forwarded-For` 會包含每個後續代理的所有 IP 位址，例如：

```HTTP
X-Forwarded-For: <client>, <proxy1>, <proxy2>
```

預設情況下，`XForwardedHeader` 會將 `X-Forwarded-For` 中的第一個項目指派給 `call.request.origin.remoteHost` 屬性。
您也可以提供自訂邏輯來[選取 IP 位址](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/X-Forwarded-For#selecting_an_ip_address)。 
[XForwardedHeadersConfig](https://api.ktor.io/ktor-server-forwarded-header/io.ktor.server.plugins.forwardedheaders/-x-forwarded-headers-config/index.html) 為此提供了以下 API：

- `useFirstProxy` 與 `useLastProxy` 分別允許您從 IP 位址清單中取得第一個或最後一個值。
- `skipLastProxies` 會跳過從右側開始指定數量的項目，並取得下一個項目。
   例如，如果 `proxiesCount` 參數等於 `3`，對於以下標頭，`origin.remoteHost` 將傳回 `10.0.0.123`：
   ```HTTP
   X-Forwarded-For: 10.0.0.123, proxy-1, proxy-2, proxy-3
   ```
- `skipKnownProxies` 會從清單中移除指定項目，並取得最後一個項目。
   例如，如果您傳遞 `listOf("proxy-1", "proxy-3")` 給此函式，對於以下標頭，`origin.remoteHost` 將傳回 `proxy-2`：
   ```HTTP
   X-Forwarded-For: 10.0.0.123, proxy-1, proxy-2, proxy-3
   ```
- `extractEdgeProxy` 允許您提供自訂邏輯，以從 `X-Forward-*` 標頭中擷取值。