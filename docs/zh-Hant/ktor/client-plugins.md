[//]: # (title: 用戶端外掛程式)

<link-summary>
了解如何使用用戶端外掛程式來新增通用功能，例如記錄、序列化和授權。
</link-summary>

許多應用程式都需要不屬於核心應用程式邏輯的常見功能，例如
[記錄](client-logging.md)、[序列化](client-serialization.md)或 [授權](client-auth.md)。在 Ktor 中，
這些功能是由用戶端 _外掛程式_ 提供的。

## 新增外掛程式相依性 {id="plugin-dependency"}

某些外掛程式需要額外的[相依性](client-dependencies.md)。例如，若要使用 [Logging](client-logging.md) 外掛程式，您需要在組建指令碼中新增
`ktor-client-logging` 構件：

<var name="artifact_name" value="ktor-client-logging"/>
<var name="ktor_version_catalog_name" value="ktorLibs.client.logging"/>
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

各外掛程式的文件均會註記所需的任何相依性。

## 安裝外掛程式 {id="install"}

若要安裝外掛程式，請將其傳遞給[用戶端配置區塊](client-create-and-configure.md#configure-client)內的 `install()` 函式。

例如，安裝 `Logging` 外掛程式如下所示：

```kotlin
import io.ktor.client.*
import io.ktor.client.engine.cio.*
import io.ktor.client.plugins.logging.*

val client = HttpClient(CIO) {
    install(Logging)
}
```

### 安裝或取代外掛程式 {id="install_or_replace"}

在某些情況下，外掛程式可能已安裝 — 例如透過共用的用戶端配置程式碼。在此類情況下，您可以使用 `installOrReplace()` 函式來取代其配置：

```kotlin
import io.ktor.client.*
import io.ktor.client.engine.cio.*

val client = HttpClient(CIO) {
    installOrReplace(ContentNegotiation) {
        // ...
    }
}
```

此函式會在外掛程式不存在時進行安裝，或在其已安裝時取代其現有配置。

## 配置外掛程式 {id="configure_plugin"}

大多數外掛程式都會公開可在 `install` 區塊內設定的配置選項。

例如，[`Logging`](client-logging.md) 外掛程式可讓您指定記錄器、記錄層級以及篩選記錄訊息的條件：

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

如果現有的外掛程式無法滿足您的需求，您可以建立自己的自訂用戶端外掛程式。自訂外掛程式可讓您攔截請求與回應，並實作可重複使用的行為。

若要了解更多，請參閱 [自訂用戶端外掛程式](client-custom-plugins.md)。