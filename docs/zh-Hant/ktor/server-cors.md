[//]: # (title: CORS)

<show-structure for="chapter" depth="2"/>
<primary-label ref="server-plugin"/>

<var name="artifact_name" value="ktor-server-cors"/>
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
    <b><Links href="/ktor/server-native" summary="Ktor supports Kotlin/Native and allows you to run a server without an additional runtime or virtual machine.">Native 伺服器</Links> 支援</b>：✅
</p>
</tldr>

如果您的伺服器需要處理[跨來源請求](https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS)，
您需要安裝並設定
[CORS](https://api.ktor.io/ktor-server-cors/io.ktor.server.plugins.cors.routing/-c-o-r-s.html)
Ktor 外掛程式。此外掛程式可讓您設定允許的主機、HTTP 方法、用戶端設定的標頭等。

## 新增相依性 {id="add_dependencies"}

<p>
    要使用 <code>%plugin_name%</code>，您需要在組建指令碼中包含 <code>%artifact_name%</code> 構件：
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
    要在應用程式中<a href="#install">安裝</a> <code>%plugin_name%</code> 外掛程式，
    請將其傳遞給指定<Links href="/ktor/server-modules" summary="Modules allow you to structure your application by grouping routes.">模組</Links>中的 <code>install</code> 函式。
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
<p>
    <code>%plugin_name%</code> 外掛程式也可以<a href="#install-route">安裝到特定路由</a>。
    如果您需要為不同的應用程式資源使用不同的 <code>%plugin_name%</code> 配置，這會很有用。
</p>

> 如果您將 `CORS` 外掛程式安裝到特定路由，則需要為該路由新增
`options` [處理常式](server-routing.md#define_route)。這可讓 Ktor 正確回應 CORS
預檢請求。

## 設定 CORS {id="configure"}

CORS 特定的設定是由
[CORSConfig](https://api.ktor.io/ktor-server-cors/io.ktor.server.plugins.cors/-c-o-r-s-config/index.html)
類別公開的。讓我們看看如何進行這些設定。

### 概覽 {id="overview"}

假設您有一個監聽 `8080` 埠號的伺服器，其 `/customer` [路由](server-routing.md)會以
[JSON](server-serialization.md#send_data) 資料進行回應。以下程式碼片段顯示了使用 Fetch API 從在另一個埠號上運作的用戶端發出的範例請求，這使該請求成為跨來源請求：

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

為了在後端允許此類請求，您需要按照以下方式設定 `CORS` 外掛程式：

```kotlin
install(CORS) {
    allowHost("0.0.0.0:8081")
    allowHeader(HttpHeaders.ContentType)
}
```

您可以在此處找到完整的範例：[cors](https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/cors)。

### 主機 {id="hosts"}

要指定可以發出跨來源請求的允許主機，請使用 `allowHost` 函式。除了主機名稱外，
您還可以指定埠號、子網域列表或支援的 HTTP 協定 (schemes)。

```kotlin
install(CORS) {
    allowHost("client-host")
    allowHost("client-host:8081")
    allowHost("client-host", subDomains = listOf("en", "de", "es"))
    allowHost("client-host", schemes = listOf("http", "https"))
}
```

要允許來自任何主機的跨來源請求，請使用 `anyHost` 函式。

```kotlin
install(CORS) {
    anyHost()
}
```

### HTTP 方法 {id="methods"}

預設情況下，`%plugin_name%` 外掛程式允許 `GET`、`POST` 和 `HEAD` HTTP 方法。要新增其他方法，請使用
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

預設情況下，`%plugin_name%` 外掛程式允許以下由 `Access-Control-Allow-Headers` 管理的用戶端標頭：

* `Accept`
* `Accept-Language`
* `Content-Language`

要允許額外的標頭，請使用 `allowHeader` 函式。

```kotlin
install(CORS) {
    allowHeader(HttpHeaders.ContentType)
    allowHeader(HttpHeaders.Authorization)
}
```

要允許自訂標頭，請使用 `allowHeaders` 或 `allowHeadersPrefixed` 函式。例如，以下程式碼片段
顯示如何允許以 `custom-` 為前綴的標頭。

```kotlin
install(CORS) {
    allowHeadersPrefixed("custom-")
}
```

> 請注意，對於非簡單內容類型，`allowHeaders` 或 `allowHeadersPrefixed` 需要將
[allowNonSimpleContentTypes](https://api.ktor.io/ktor-server-cors/io.ktor.server.plugins.cors/-c-o-r-s-config/allow-non-simple-content-types.html)
屬性設定為 `true`。

### 公開標頭 {id="expose-headers"}

`Access-Control-Expose-Headers` 標頭會將指定的標頭新增至瀏覽器中 JavaScript 可以存取的允許清單中。
要設定此類標頭，請使用 `exposeHeader` 函式。

```kotlin
install(CORS) {
    // ...
    exposeHeader("X-My-Custom-Header")
    exposeHeader("X-Another-Custom-Header")
}
```

### 憑據 {id="credentials"}

預設情況下，瀏覽器不會隨跨來源請求發送憑據資訊（例如 Cookie 或驗證資訊）。要允許傳遞此資訊，請使用
`allowCredentials` 屬性將 `Access-Control-Allow-Credentials` 回應標頭設定為 `true`。

```kotlin
install(CORS) {
    allowCredentials = true
}
```

### 其他 {id="misc"}

`%plugin_name%` 外掛程式還允許您指定其他 CORS 相關設定。例如，您可以
使用 `maxAgeInSeconds` 來指定預檢請求的回應可以快取多長時間，而無需發送另一個預檢請求。

```kotlin
install(CORS) {
    maxAgeInSeconds = 3600
}
```

您可以從 [CORSConfig](https://api.ktor.io/ktor-server-cors/io.ktor.server.plugins.cors/-c-o-r-s-config/index.html) 了解其他配置選項。