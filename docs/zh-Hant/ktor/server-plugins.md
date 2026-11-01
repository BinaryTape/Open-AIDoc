[//]: # (title: 伺服器外掛程式)

<show-structure for="chapter" depth="2"/>

<link-summary>
外掛程式提供常見的功能性，例如序列化、內容編碼、壓縮等。
</link-summary>

Ktor 中典型的請求／回應管線如下所示：

![Request Response Pipeline](request-response-pipeline.png){width="600"}

伺服器接收到請求後，會透過請求管線對其進行處理。Ktor 會將該請求路由至適當的處理常式，由您的應用程式邏輯進行處理。接著，回應會在傳送至用戶端之前通過回應管線。

## 使用外掛程式新增功能 {id="add_functionality"}

許多應用程式都需要與應用程式邏輯分開的功能性。這包括身分驗證、序列化和內容編碼、壓縮、標頭、Cookie 等等。在 Ktor 中，這些功能性是由 _外掛程式_ 提供。

外掛程式可以攔截請求與回應處理的不同階段。因此，它們可以套用在請求／回應管線中的不同位置：

![Plugin pipeline](plugin-pipeline.png){width="600"}

外掛程式執行的確切階段取決於外掛程式本身及其所使用的掛鉤或管線階段（pipeline phases）。一般而言，請求的處理流程如下：

* 路由機制決定應由哪個處理常式來處理該請求。
* 在移交給處理常式之前，請求會先由一個或多個外掛程式進行處理。
* 處理常式使用應用程式邏輯產生回應。
* 在回應傳送給用戶端之前，回應會由一個或多個外掛程式進行處理。

## 路由本身就是外掛程式 {id="routing"}

外掛程式的設計旨在提供最大的彈性，並能存在於請求／回應管線的任何區段中。在 Ktor 中，`routing` 本身就是作為外掛程式實作的：

![Routing as a Plugin](plugin-pipeline-routing.png){width="600"}

## 新增外掛程式相依性 {id="dependency"}

大多數外掛程式都需要額外的相依性。例如，[`CORS`](server-cors.md) 外掛程式需要在建置指令碼中引入 `ktor-server-cors` 構件：

<var name="artifact_name" value="ktor-server-cors"/>
<var name="ktor_version_catalog_name" value="ktorLibs.server.cors"/>
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

> 如需可用外掛程式的完整清單，請參閱 [Ktor 專案產生器](https://start.ktor.io/settings)。如需特定外掛程式所需的相依性，請參閱相應的外掛程式文件。
> 
{style="tip"}

## 安裝外掛程式 {id="install"}

外掛程式通常在伺服器的初始化階段使用 `install()` 函式進行配置。依據您[建立伺服器](server-create-and-configure.topic)的方式，您可以在 `embeddedServer()` 函式內部或在[應用程式模組](server-modules.md)中安裝外掛程式：

<Tabs>
<TabItem title="embeddedServer()">

```kotlin
import io.ktor.server.application.*
import io.ktor.server.plugins.cors.*
import io.ktor.server.plugins.compression.*
// ...
fun main() {
    embeddedServer(Netty, port = 8080) {
        install(CORS)
        install(Compression)
        // ...
    }.start(wait = true)
}
```

</TabItem>
<TabItem title="Application.module()">

```kotlin
import io.ktor.server.application.*
import io.ktor.server.plugins.cors.*
import io.ktor.server.plugins.compression.*
// ...
fun Application.module() {
    install(CORS)
    install(Compression)
    // ...
}
```

</TabItem>
</Tabs>

您可以在安裝外掛程式時，透過傳遞配置區塊給 `install()` 函式來進行配置。

例如，在安裝 [`Sessions` 外掛程式](server-sessions.md)時，您可以透過指定工作階段型別與 Cookie 名稱來配置基於 Cookie 的工作階段：

```kotlin
install(Sessions) {
    cookie<MyCookie>("MY_COOKIE")
} 
```

### 安裝外掛程式至特定路由 {id="install-route"}

在 Ktor 中，您不僅可以全域安裝外掛程式，還可以將其安裝在特定的[路由](server-routing.md)上。當不同的資源需要不同的外掛程式配置時，這非常有用。

例如，以下程式碼示範在 `/index` 路由上安裝 [`CachingHeader` 外掛程式](server-caching-headers.md)，並將其配置為新增快取標頭：

```kotlin
route("/index") {
    install(CachingHeaders) {
        options { call, content -> CachingOptions(CacheControl.MaxAge(maxAgeSeconds = 1800)) }
    }
    get {
        call.respondText("Index page")
    }
}
```

當同一個外掛程式被安裝在多個層級時，Ktor 會套用以下規則：

* 安裝至特定路由的外掛程式配置會覆寫相對應的[全域外掛程式配置](#install)。
* 如果同一個路由被多次定義，且包含同一個外掛程式的多次安裝，則路由會合併該路由的安裝設定。以最後一次安裝為優先。

在以下範例中，對 `/index/a` 和 `/index/b` 的呼叫都僅由第二次的 `CachingHeaders` 安裝來處理：
   
 ```kotlin
 routing {
     route("index") {
         install(CachingHeaders) { /* 第一個配置 */ }
         get("a") {
             // ...
         }
     }
     route("index") {
         install(CachingHeaders) { /* 第二個配置 */ }
         get("b") {
             // ...
         }
     }
 }
 ```
 {initial-collapse-state="collapsed" collapsed-title="install(CachingHeaders) { // 第一個配置 }"}

## 預設、可用與自訂外掛程式 {id="default_available_custom"}

Ktor 預設不會安裝任何應用程式外掛程式。請安裝能提供應用程式所需功能性的外掛程式。

Ktor 提供了豐富多樣的外掛程式。您可以在 [Ktor 專案產生器](https://start.ktor.io/settings)中找到所有可用外掛程式的完整清單。

您也可以建立自己的[自訂外掛程式](server-custom-plugins.md)，以封裝可在整個應用程式中重複使用或與其他應用程式共享的功能性。