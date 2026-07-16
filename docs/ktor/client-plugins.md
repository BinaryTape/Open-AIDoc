[//]: # (title: 客户端插件)

<link-summary>
了解如何使用客户端插件添加常见功能，例如日志、序列化和授权。
</link-summary>

许多应用程序需要不属于核心应用逻辑的常见功能，例如 [日志](client-logging.md)、[序列化](client-serialization.md) 或 [授权](client-auth.md)。在 Ktor 中，这些功能由客户端插件（_plugins_）提供。

## 添加插件依赖项 {id="plugin-dependency"}

某些插件需要额外的[依赖项](client-dependencies.md)。例如，要使用 [Logging](client-logging.md) 插件，您需要在构建脚本中添加 `ktor-client-logging` 构件：

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

每个插件的文档都会说明其所需的任何依赖项。

## 安装插件 {id="install"}

要安装插件，请将其传递给[客户端配置块](client-create-and-configure.md#configure-client)中的 `install()` 函数。

例如，安装 `Logging` 插件如下所示：

```kotlin
import io.ktor.client.*
import io.ktor.client.engine.cio.*
import io.ktor.client.plugins.logging.*

val client = HttpClient(CIO) {
    install(Logging)
}
```

### 安装或替换插件 {id="install_or_replace"}

在某些情况下，插件可能已经安装 —— 例如，通过共享的客户端配置代码安装。在这种情况下，您可以使用 `installOrReplace()` 函数替换其配置：

```kotlin
import io.ktor.client.*
import io.ktor.client.engine.cio.*

val client = HttpClient(CIO) {
    installOrReplace(ContentNegotiation) {
        // ...
    }
}
```

此函数会在插件不存在时进行安装，或者在插件已经安装时替换其现有配置。

## 配置插件 {id="configure_plugin"}

大多数插件都会公开可在 `install` 块内设置的配置选项。

例如，[`Logging`](client-logging.md) 插件允许您指定记录器、日志级别以及用于过滤日志消息的条件：

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

## 创建自定义插件 {id="custom"}

如果现有插件无法满足您的需求，您可以创建自己的自定义客户端插件。自定义插件允许您拦截请求和响应，并实现可重用的行为。

要了解更多信息，请参阅[自定义客户端插件](client-custom-plugins.md)。