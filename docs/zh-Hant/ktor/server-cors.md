[//]: # (title: CORS)

<show-structure for="chapter" depth="2"/>
<primary-label ref="server-plugin"/>

<var name="artifact_name" value="ktor-server-cors"/>
<var name="ktor_version_catalog_name" value="ktorLibs.server.cors"/>
<var name="package_name" value="io.ktor.server.plugins.cors"/>
<var name="plugin_name" value="CORS"/>

<tldr>
<p>
<b>必要相依性</b>：<code>io.ktor:%artifact_name%</code>
</p>
<var name="example_name" value="cors"/>
<p>
    <b>程式碼範例</b>：
    <a href="https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/%example_name%">
        %example_name%
    </a>
</p>
<p>
    <b><Links href="server-native.md" summary="Ktor 支援 Kotlin/Native，並允許你在沒有額外執行階段或虛擬機的情況下執行伺服器。">原生伺服器</Links> 支援</b>：✅
</p>
</tldr>

如果你的伺服器需要處理[跨來源請求 (cross-origin requests)](https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS)，
則需要安裝並設定
[CORS](https://api.ktor.io/ktor-server-cors/io.ktor.server.plugins.cors.routing/-c-o-r-s.html)
Ktor 外掛程式。此外掛程式允許你設定允許的主機、HTTP 方法、用戶端設定的標頭等。

## 新增相依性 {id="add_dependencies"}

<p>
    若要使用 <code>%plugin_name%</code>，請將 <code>%artifact_name%</code> 構件新增至你的建置指令碼：
</p>
<Tabs group="languages">
    <TabItem title="Gradle (Kotlin)" group-key="kotlin">
        <code-block lang="Kotlin" code="            implementation(%ktor_version_catalog_name%)"/>
        <note>
            上述程式碼片段使用 <a href="server-dependencies.topic#using-version-catalog">
            Ktor 版本目錄 (version catalog)</a> 來指定 Ktor 相依性。
        </note>
    </TabItem>
    <TabItem title="Gradle (Groovy)" group-key="groovy">
        <code-block lang="Groovy" code="            implementation %ktor_version_catalog_name%"/>
        <note>
            上述程式碼片段使用 <a href="server-dependencies.topic#using-version-catalog">
            Ktor 版本目錄 (version catalog)</a> 來指定 Ktor 相依性。
        </note>
    </TabItem>
    <TabItem title="Maven" group-key="maven">
        <code-block lang="XML" code="            &lt;dependency&gt;&#10;                &lt;groupId&gt;io.ktor&lt;/groupId&gt;&#10;                &lt;artifactId&gt;%artifact_name%-jvm&lt;/artifactId&gt;&#10;                &lt;version&gt;${ktor_version}&lt;/version&gt;&#10;            &lt;/dependency&gt;"/>
    </TabItem>
</Tabs>

## 安裝 %plugin_name% {id="install_plugin"}

<p>
    若要將 <code>%plugin_name%</code> 外掛程式<a href="server-plugins.md#install">安裝</a>至你的應用程式中，
    請在指定的 <Links href="server-modules.md" summary="模組允許你透過分組路由來建構應用程式。">模組</Links> 中將其傳遞給 <code>install</code> 函式。
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
<p>
    <code>%plugin_name%</code> 外掛程式也可以<a href="server-plugins.md#install-route">安裝至特定路由</a>。
    如果你需要針對不同的應用程式資源使用不同的 <code>%plugin_name%</code> 設定，這會很有用。
</p>

> 如果你將 `CORS` 外掛程式安裝至特定路由，則需要為該路由新增
`options` [處理常式](server-routing.md#define_route)。這能讓 Ktor 正確回應 CORS
預檢請求 (preflight request)。

## 設定 CORS {id="configure"}

CORS 特定的設定選項由
[CORSConfig](https://api.ktor.io/ktor-server-cors/io.ktor.server.plugins.cors/-c-o-r-s-config/index.html)
類別公開。讓我們來看看如何進行這些設定。

### 概觀 {id="overview"}

假設你有一個在 `8080` 連接埠監聽的伺服器，其 `/customer` [路由](server-routing.md)會回應
[JSON](server-serialization.md#send_data) 資料。以下程式碼片段展示了從另一個連接埠上運作的用戶端使用 Fetch API 發出的範例請求，以使該請求成為跨來源請求：

```javascript
function saveCustomer() {
    fetch('http://0.0.0.0:8080/customer',
        {
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            method: "POST",
            body: JSON.stringify({id: 3, firstName: "Jet", lastName: "Brains"})
        })
        .then(response => response.text())
        .then(data => {
            console.log('Success:', data);
            alert(data);
        })
        .catch((error) => {
            console.error('Error:', error);
        });
}

```
{initial-collapse-state="collapsed" collapsed-title="
fetch('http://0.0.0.0:8080/customer')"}

若要在後端允許此類請求，你需要依下列方式設定 `CORS` 外掛程式：

```kotlin
install(CORS) {
    allowHost("0.0.0.0:8081")
    allowHeader(HttpHeaders.ContentType)
}
```

你可以在此處找到完整的範例：[cors](https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/cors)。

### 主機 {id="hosts"}

若要指定可以發起跨來源請求的允許主機，請使用 `allowHost` 函式。除了主機名稱之外，
你還可以指定連接埠號、子網域清單或支援的 HTTP scheme。

```kotlin
install(CORS) {
    allowHost("client-host")
    allowHost("client-host:8081")
    allowHost("client-host", subDomains = listOf("en", "de", "es"))
    allowHost("client-host", schemes = listOf("http", "https"))
}
```

若要允許來自任何主機的跨來源請求，請使用 `anyHost` 函式。

```kotlin
install(CORS) {
    anyHost()
}
```

### HTTP 方法 {id="methods"}

預設情況下，`%plugin_name%` 外掛程式允許 `GET`、`POST` 和 `HEAD` HTTP 方法。若要新增其他方法，請使用
`allowMethod` 函式。

```kotlin
install(CORS) {
    allowMethod(HttpMethod.Options)
    allowMethod(HttpMethod.Put)
    allowMethod(HttpMethod.Patch)
    allowMethod(HttpMethod.Delete)
}
```

### 允許標頭 {id="headers"}

預設情況下，`%plugin_name%` 外掛程式允許由 `Access-Control-Allow-Headers` 管理的下列用戶端標頭：

* `Accept`
* `Accept-Language`
* `Content-Language`

若要允許其他標頭，請使用 `allowHeader` 函式。

```kotlin
install(CORS) {
    allowHeader(HttpHeaders.ContentType)
    allowHeader(HttpHeaders.Authorization)
}
```

若要允許自訂標頭，請使用 `allowHeaders` 或 `allowHeadersPrefixed` 函式。例如，以下程式碼片段
展示了如何允許以 `custom-` 為前綴的標頭。

```kotlin
install(CORS) {
    allowHeadersPrefixed("custom-")
}
```

> 請注意，對於非簡單內容類型 (non-simple content types)，`allowHeaders` 或 `allowHeadersPrefixed` 需要將
[allowNonSimpleContentTypes](https://api.ktor.io/ktor-server-cors/io.ktor.server.plugins.cors/-c-o-r-s-config/allow-non-simple-content-types.html)
屬性設定為 `true`。

### 公開標頭 {id="expose-headers"}

`Access-Control-Expose-Headers` 標頭會將指定的標頭新增至瀏覽器中 JavaScript 可以存取的允許清單中。
若要設定此類標頭，請使用 `exposeHeader` 函式。

```kotlin
install(CORS) {
    // ...
    exposeHeader("X-My-Custom-Header")
    exposeHeader("X-Another-Custom-Header")
}
```

### 憑據 {id="credentials"}

預設情況下，瀏覽器不會在跨來源請求中發送憑據資訊（例如 Cookie 或身份驗證資訊）。若要允許傳遞此資訊，請使用
`allowCredentials` 屬性將 `Access-Control-Allow-Credentials` 回應標頭設定為 `true`。

```kotlin
install(CORS) {
    allowCredentials = true
}
```

### 其他設定 {id="misc"}

`%plugin_name%` 外掛程式還允許你指定其他與 CORS 相關的設定。例如，你可以
使用 `maxAgeInSeconds` 來指定預檢請求的回應可以快取多久，而無需再次發送
預檢請求。

```kotlin
install(CORS) {
    maxAgeInSeconds = 3600
}
```

你可以從 [CORSConfig](https://api.ktor.io/ktor-server-cors/io.ktor.server.plugins.cors/-c-o-r-s-config/index.html) 進一步了解其他設定選項。