[//]: # (title: 伺服器外掛程式)

<show-structure for="chapter" depth="2"/>

<link-summary>
外掛程式提供了常用的功能，例如序列化、內容編碼、壓縮等。
</link-summary>

Ktor 中典型的請求/回應管線如下所示：

![Request Response Pipeline](request-response-pipeline.png){width="600"}

它從一個請求開始，該請求被路由到特定的處理常式，由我們的應用程式邏輯處理，最後得到回應。 

## 使用外掛程式增加功能 {id="add_functionality"}

許多應用程式需要不屬於應用程式邏輯範圍內的通用功能。這可能包括序列化和內容編碼、壓縮、標頭、Cookie 支援等。所有這些在 Ktor 中都是透過我們所謂的 **外掛程式** 來提供的。 

如果我們查看之前的管線圖，外掛程式位於請求/回應與應用程式邏輯之間：

![Plugin pipeline](plugin-pipeline.png){width="600"}

當請求進來時：

* 它透過路由機制被路由到正確的處理常式
* 在移交給處理常式之前，它會經過一個或多個外掛程式
* 處理常式（應用程式邏輯）處理請求
* 在回應發送給用戶端之前，它會經過一個或多個外掛程式

## 路由也是一個外掛程式 {id="routing"}

外掛程式的設計方式旨在提供最大的靈活性，並允許它們存在於請求/回應管線的任何區段中。
事實上，我們到目前為止所稱的 `routing`，也不過是一個外掛程式。 

![Routing as a Plugin](plugin-pipeline-routing.png){width="600"}

## 新增外掛程式相依性 {id="dependency"}
大多數外掛程式需要特定的相依性。例如，`CORS` 外掛程式需要在建置指令碼中加入 `ktor-server-cors` 構件：

<var name="artifact_name" value="ktor-server-cors"/>
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

## 安裝外掛程式 {id="install"}

外掛程式通常在伺服器初始化階段使用 `install` 函式進行配置，該函式接受一個外掛程式作為參數。根據您[建立伺服器](server-create-and-configure.topic)的方式，您可以在 `embeddedServer` 呼叫中安裝外掛程式...

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

... 或在指定的[模組](server-modules.md)中安裝：

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

除了攔截請求和回應外，外掛程式還可以有一個選用的配置區段，在此步驟中進行配置。

例如，在安裝 [Cookies](server-sessions.md#cookie) 時，我們可以設定某些參數，例如我們希望 Cookie 儲存的位置或其名稱：

```kotlin
install(Sessions) {
    cookie<MyCookie>("MY_COOKIE")
} 
```

### 將外掛程式安裝到特定路由 {id="install-route"}

在 Ktor 中，您不僅可以全域安裝外掛程式，還可以將其安裝到特定的[路由](server-routing.md)。如果您需要為不同的應用程式資源提供不同的外掛程式配置，這會非常有用。例如，下方的[範例](https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/caching-headers-routes)顯示了如何為 `/index` 路由加入指定的[快取標頭](server-caching-headers.md)：

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

請注意，以下規則適用於同一外掛程式的多個安裝：
* 安裝到特定路由的外掛程式配置會覆寫其[全域配置](#install)。
* 路由會合併同一路由的安裝，並以最後一次安裝為準。例如，對於這樣的應用程式... 
   
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
   
   ... 對 `/index/a` 和 `/index/b` 的呼叫都僅由外掛程式的第二次安裝處理。

## 預設、可用及自訂外掛程式 {id="default_available_custom"}

預設情況下，Ktor 不會啟用任何外掛程式，因此需要由您根據應用程式的功能需求來安裝外掛程式。

然而，Ktor 確實提供了各種開箱即用的外掛程式。您可以在 [Ktor 外掛程式儲存庫](https://github.com/ktorio/ktor-plugin-registry/tree/main/plugins/server)中查看這些外掛程式的完整清單。

此外，您還可以建立自己的[自訂外掛程式](server-custom-plugins.md)。