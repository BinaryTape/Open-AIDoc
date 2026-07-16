[//]: # (title: 用戶端外掛程式)

<link-summary>
了解如何使用用戶端外掛程式來新增通用功能，例如記錄、序列化和授權。
</link-summary>

許多應用程式需要核心應用程式邏輯之外的通用功能，例如 [記錄](client-logging.md)、[序列化](client-serialization.md) 或 [授權](client-auth.md)。在 Ktor 中，這些功能由用戶端外掛程式提供。

## 新增外掛程式相依性 {id="plugin-dependency"}

某些外掛程式需要額外的[相依性](client-dependencies.md)。例如，要使用 [Logging](client-logging.md) 外掛程式，您需要在建置指令碼中新增 `ktor-client-logging` 成品：

<var name="artifact_name" value="ktor-client-logging"/>
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

每個外掛程式的文件都會註明任何必要的相依性。

## 安裝外掛程式 {id="install"}

要安裝外掛程式，請將其傳遞給 [用戶端配置區塊](client-create-and-configure.md#configure-client) 內的 `install()` 函式。

例如，安裝 `Logging` 外掛程式如下所示：

```kotlin
import io.ktor.client.*
import io.ktor.client.engine.cio.*
import io.ktor.client.plugins.logging.*

val client = HttpClient(CIO) {
    install(Logging)
}
```

### 安裝或替換外掛程式 {id="install_or_replace"}

在某些情況下，外掛程式可能已經安裝過 —— 例如透過共享的用戶端配置程式碼。在這種情況下，您可以使用 `installOrReplace()` 函式來替換其配置：

```kotlin
import io.ktor.client.*
import io.ktor.client.engine.cio.*

val client = HttpClient(CIO) {
    installOrReplace(ContentNegotiation) {
        // ...
    }
}
```

如果該外掛程式不存在，此函式會安裝它；如果已經安裝過，則會替換其現有的配置。

## 配置外掛程式 {id="configure_plugin"}

大多數外掛程式都公開了可以在 `install` 區塊內設定的配置選項。

例如，[`Logging`](client-logging.md) 外掛程式允許您指定記錄器、記錄層級以及過濾記錄訊息的條件：

```kotlin
package com.example

import io.ktor.client.*
import io.ktor.client.engine.cio.*
import io.ktor.client.plugins.logging.*
import io.ktor.client.request.*
import io.ktor.client.statement.*
import io.ktor.http.*
import kotlinx.coroutines.runBlocking

fun main() {
    runBlocking {
        val client = HttpClient(CIO) {
            install(Logging) {
                logger = Logger.DEFAULT
                level = LogLevel.HEADERS
                filter { request ->
                    request.url.host.contains("ktor.io")
                }
                sanitizeHeader { header -> header == HttpHeaders.Authorization }
            }
        }

        val response1: HttpResponse = client.get("https://ktor.io/")
        val response2: HttpResponse = client.get("https://jetbrains.com/")
    }
}
```

## 建立自訂外掛程式 {id="custom"}

如果現有的外掛程式無法滿足您的需求，您可以建立自己的自訂用戶端外掛程式。自訂外掛程式允許您攔截請求和回應，並實作可重用的行為。

若要了解更多，請參閱 [自訂用戶端外掛程式](client-custom-plugins.md)。